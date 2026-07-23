const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

const ALLOWED_VIDEO_HOSTS = ['player.bilibili.com', 'www.youtube.com'];

// Only accept https embed URLs from an allowlisted host; otherwise drop the value
function sanitizeVideoUrl(videoUrl) {
  if (!videoUrl) return '';
  try {
    const parsed = new URL(videoUrl);
    if (parsed.protocol === 'https:' && ALLOWED_VIDEO_HOSTS.includes(parsed.hostname)) {
      return videoUrl;
    }
  } catch (e) {
    // fall through to reject
  }
  return '';
}

function rowToPoem(row) {
  return {
    ...row,
    sentences_json: row.sentences_json ? JSON.parse(row.sentences_json) : [],
    words_json: row.words_json ? JSON.parse(row.words_json) : [],
    mastered: !!row.mastered,
  };
}

// Ebbinghaus review due-check, same intervals as original server_db.ts
function isPoemDueForReview(poem) {
  if (!poem.mastered) return false;
  if (poem.last_review === null) return true;

  const elapsedMs = Date.now() - poem.last_review;
  const elapsedDays = elapsedMs / (3600000 * 24);

  if (poem.review_stage === 1) return elapsedDays >= 1;
  if (poem.review_stage === 2) return elapsedDays >= 3;
  if (poem.review_stage === 3) return elapsedDays >= 3;

  return false;
}

const D1_SCHEMA_SQL = `
CREATE TABLE poems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  sentences_json TEXT NOT NULL,
  background TEXT,
  empathy TEXT,
  words_json TEXT,
  audio_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  mastered BOOLEAN DEFAULT FALSE,
  review_stage INTEGER DEFAULT 0,
  last_review INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);
`.trim();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      // GET /api/d1-schema.sql
      if (path === '/api/d1-schema.sql' && method === 'GET') {
        return new Response(D1_SCHEMA_SQL, {
          headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' },
        });
      }

      // GET /api/poems
      if (path === '/api/poems' && method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM poems ORDER BY id ASC').all();
        const poems = results.map(rowToPoem).map((p) => ({ ...p, isDue: isPoemDueForReview(p) }));
        return json(poems);
      }

      // POST /api/poems
      if (path === '/api/poems' && method === 'POST') {
        const body = await request.json();
        const { title, author, raw_text, sentences_json, background, empathy, words_json, audio_url, video_url } = body;

        if (!title || !author || !raw_text) {
          return json({ error: '诗名、作者、原文为必填项' }, 400);
        }

        const now = Date.now();
        const result = await env.DB.prepare(
          `INSERT INTO poems (title, author, raw_text, sentences_json, background, empathy, words_json, audio_url, video_url, mastered, review_stage, last_review, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NULL, ?)`
        )
          .bind(
            title,
            author,
            raw_text,
            JSON.stringify(sentences_json || []),
            background || '',
            empathy || '',
            JSON.stringify(words_json || []),
            audio_url || '',
            sanitizeVideoUrl(video_url),
            now
          )
          .run();

        const newId = result.meta.last_row_id;
        const row = await env.DB.prepare('SELECT * FROM poems WHERE id = ?').bind(newId).first();
        return json(rowToPoem(row), 201);
      }

      // /api/poems/:id and /api/poems/:id/review
      const poemIdMatch = path.match(/^\/api\/poems\/(\d+)(\/review)?$/);
      if (poemIdMatch) {
        const id = parseInt(poemIdMatch[1], 10);
        const isReviewRoute = !!poemIdMatch[2];

        // GET /api/poems/:id
        if (!isReviewRoute && method === 'GET') {
          const row = await env.DB.prepare('SELECT * FROM poems WHERE id = ?').bind(id).first();
          if (!row) return json({ error: 'Poem not found' }, 404);
          const poem = rowToPoem(row);
          return json({ ...poem, isDue: isPoemDueForReview(poem) });
        }

        // PUT /api/poems/:id
        if (!isReviewRoute && method === 'PUT') {
          const existing = await env.DB.prepare('SELECT * FROM poems WHERE id = ?').bind(id).first();
          if (!existing) return json({ error: 'Poem not found' }, 404);

          const body = await request.json();
          // Only content fields are client-editable; progression state stays server-owned (via /review)
          const { title, author, raw_text, sentences_json, background, empathy, words_json, audio_url, video_url } = body;
          const current = rowToPoem(existing);
          const merged = {
            title: title !== undefined ? title : current.title,
            author: author !== undefined ? author : current.author,
            raw_text: raw_text !== undefined ? raw_text : current.raw_text,
            sentences_json: sentences_json !== undefined ? sentences_json : current.sentences_json,
            background: background !== undefined ? background : current.background,
            empathy: empathy !== undefined ? empathy : current.empathy,
            words_json: words_json !== undefined ? words_json : current.words_json,
            audio_url: audio_url !== undefined ? audio_url : current.audio_url,
            video_url: video_url !== undefined ? video_url : current.video_url,
          };

          await env.DB.prepare(
            `UPDATE poems SET title = ?, author = ?, raw_text = ?, sentences_json = ?, background = ?, empathy = ?, words_json = ?, audio_url = ?, video_url = ? WHERE id = ?`
          )
            .bind(
              merged.title,
              merged.author,
              merged.raw_text,
              JSON.stringify(merged.sentences_json || []),
              merged.background || '',
              merged.empathy || '',
              JSON.stringify(merged.words_json || []),
              merged.audio_url || '',
              sanitizeVideoUrl(merged.video_url),
              id
            )
            .run();

          const row = await env.DB.prepare('SELECT * FROM poems WHERE id = ?').bind(id).first();
          return json(rowToPoem(row));
        }

        // DELETE /api/poems/:id
        if (!isReviewRoute && method === 'DELETE') {
          const existing = await env.DB.prepare('SELECT * FROM poems WHERE id = ?').bind(id).first();
          if (!existing) return json({ error: 'Poem not found' }, 404);
          await env.DB.prepare('DELETE FROM poems WHERE id = ?').bind(id).run();
          return json({ success: true });
        }

        // POST /api/poems/:id/review
        if (isReviewRoute && method === 'POST') {
          const existing = await env.DB.prepare('SELECT * FROM poems WHERE id = ?').bind(id).first();
          if (!existing) return json({ error: 'Poem not found' }, 404);

          const poem = rowToPoem(existing);
          let nextStage = poem.review_stage;
          let isMastered = poem.mastered;

          if (!isMastered || nextStage === 0) {
            isMastered = true;
            nextStage = 1;
          } else {
            nextStage = nextStage + 1;
          }

          const lastReview = Date.now();
          await env.DB.prepare('UPDATE poems SET mastered = ?, review_stage = ?, last_review = ? WHERE id = ?')
            .bind(isMastered ? 1 : 0, nextStage, lastReview, id)
            .run();

          const row = await env.DB.prepare('SELECT * FROM poems WHERE id = ?').bind(id).first();
          return json(rowToPoem(row));
        }
      }

      // POST /api/ocr - OCR image recognition for poem input
      if (path === '/api/ocr' && method === 'POST') {
        try {
          // Parse multipart form data
          const formData = await request.formData();
          const imageFile = formData.get('image');

          if (!imageFile) {
            return json({ error: '请上传图片文件' }, 400);
          }

          // Convert to base64
          const arrayBuffer = await imageFile.arrayBuffer();
          const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

          // Call Aliyun Dashscope multimodal vision API (qwen-vl or qwen-turbo-vision)
          const ocrResponse = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.QWEN_API_KEY || ''}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'qwen-vl-max',
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'image_url',
                      image_url: {
                        url: `data:image/jpeg;base64,${base64Image}`
                      }
                    },
                    {
                      type: 'text',
                      text: '请识别图片中的古诗内容，按以下格式输出：\n第1行：诗名\n第2行：作者\n第3行及以后：全诗原文（保留换行和标点）\n\n如果图片中没有明确的诗名或作者，可以留空。请只输出古诗内容，不要输出其他解释。'
                    }
                  ]
                }
              ],
              temperature: 0.1
            })
          });

          if (!ocrResponse.ok) {
            const errorText = await ocrResponse.text();
            console.error('OCR API error:', errorText);
            return json({ error: 'OCR 识别失败，请重试' }, 500);
          }

          const ocrResult = await ocrResponse.json();
          const fullText = ocrResult.choices?.[0]?.message?.content || '';

          // Parse poem structure (title, author, body)
          const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

          let title = '';
          let author = '';
          let text = '';

          if (lines.length >= 3) {
            title = lines[0];
            author = lines[1];
            text = lines.slice(2).join('\n');
          } else if (lines.length === 2) {
            title = lines[0];
            text = lines[1];
          } else if (lines.length === 1) {
            text = lines[0];
          }

          return json({
            title,
            author,
            text,
            raw_ocr: fullText
          });

        } catch (error) {
          console.error('OCR processing error:', error);
          return json({ error: 'OCR 处理出错：' + error.message }, 500);
        }
      }

      return json({ error: 'Not found' }, 404);
    } catch (error) {
      return json({ error: error.message || 'Internal Server Error' }, 500);
    }
  },
};
