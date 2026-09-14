const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

const ALLOWED_VIDEO_HOSTS = [
  'player.bilibili.com',
  'www.bilibili.com',
  'bilibili.com',
  'search.bilibili.com',
  'www.youtube.com',
  'youtube.com',
  'youtu.be'
];
// Free Model Studio quotas, ordered by the expiry dates shown in the console.
// Expired models are skipped automatically on every request.
const AI_FREE_MODELS = [
  { id: 'glm-5.2', expiresAt: '2026-09-15T23:59:59+08:00' },
  { id: 'qwen3.7-flash-2026-07-15', expiresAt: '2026-10-23T23:59:59+08:00' },
  { id: 'qwen3.7-flash', expiresAt: '2026-10-23T23:59:59+08:00' },
  { id: 'deepseek-v4-flash-0731', expiresAt: '2026-10-31T23:59:59+08:00' },
  { id: 'qwen3.8-max', expiresAt: '2026-11-01T23:59:59+08:00' },
  { id: 'qwen3.8-2.4t-a95b', expiresAt: '2026-11-12T23:59:59+08:00' },
  { id: 'deepseek-v4-pro-0813', expiresAt: '2026-11-13T23:59:59+08:00' },
  { id: 'qwen3.8-27b', expiresAt: '2026-11-18T23:59:59+08:00' },
  { id: 'kimi-k3', expiresAt: '2026-11-18T23:59:59+08:00', temperature: 1 },
  { id: 'qwen3.8-flash', expiresAt: '2026-11-25T23:59:59+08:00' },
  { id: 'qwen3.8-max-0902', expiresAt: '2026-12-01T23:59:59+08:00' },
];
const DASHSCOPE_CHAT_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

function getAiErrorMessage(data) {
  return data?.error?.message || data?.message || '未知错误';
}

function parseAiJson(content) {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

async function generateWithDashScope(apiKey, messages) {
  const failures = [];
  const activeModels = AI_FREE_MODELS.filter(
    (candidate) => Date.parse(candidate.expiresAt) >= Date.now()
  );

  if (!activeModels.length) {
    return {
      failures: [{
        model: 'free-model-pool',
        status: 503,
        message: '免费模型池已全部到期，请更新模型配置',
      }],
    };
  }

  for (const candidate of activeModels) {
    const response = await fetch(DASHSCOPE_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: candidate.id,
        messages,
        temperature: candidate.temperature ?? 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (response.ok && content) {
      return { content, model: data.model || candidate.id };
    }

    failures.push({
      model: candidate.id,
      status: response.status,
      message: response.ok ? '模型未返回内容' : getAiErrorMessage(data),
    });

    if (response.status === 401) break;
  }

  return { failures };
}

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

function sanitizeVideoUrls(videoUrls) {
  if (!Array.isArray(videoUrls)) return [];
  return videoUrls.map(sanitizeVideoUrl).filter(Boolean);
}

function rowToPoem(row) {
  return {
    ...row,
    sentences_json: row.sentences_json ? JSON.parse(row.sentences_json) : [],
    words_json: row.words_json ? JSON.parse(row.words_json) : [],
    video_urls: row.video_urls ? JSON.parse(row.video_urls) : [],
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
  video_urls TEXT NOT NULL,
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
        const { title, author, raw_text, sentences_json, background, empathy, words_json, audio_url, video_urls } = body;

        if (!title || !author || !raw_text) {
          return json({ error: '诗名、作者、原文为必填项' }, 400);
        }

        const now = Date.now();
        const result = await env.DB.prepare(
          `INSERT INTO poems (title, author, raw_text, sentences_json, background, empathy, words_json, audio_url, video_urls, mastered, review_stage, last_review, created_at)
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
            JSON.stringify(sanitizeVideoUrls(video_urls || [])),
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
          const { title, author, raw_text, sentences_json, background, empathy, words_json, audio_url, video_urls } = body;
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
            video_urls: video_urls !== undefined ? video_urls : current.video_urls,
          };

          await env.DB.prepare(
            `UPDATE poems SET title = ?, author = ?, raw_text = ?, sentences_json = ?, background = ?, empathy = ?, words_json = ?, audio_url = ?, video_urls = ? WHERE id = ?`
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
              JSON.stringify(sanitizeVideoUrls(merged.video_urls || [])),
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

      // POST /api/generate-context — AI 生成背景故事 / 共情类比
      if (path === '/api/generate-context' && method === 'POST') {
        const body = await request.json();
        const { title, author, rawText, type } = body;

        if (!title || !rawText) {
          return json({ error: '诗名和原文为必填项' }, 400);
        }
        if (type !== 'story' && type !== 'empathy') {
          return json({ error: 'type 必须是 story 或 empathy' }, 400);
        }

        const apiKey = env.QWEN_API_KEY;
        if (!apiKey) return json({ error: 'QWEN_API_KEY not configured' }, 500);

        const systemPrompt = type === 'story'
          ? '你是一位给小学生讲古诗的老师。请用讲故事的口吻，严格按照事情发生的时间先后讲述这首诗的创作背景：先交代诗人当时在哪里和前因，再讲发生了什么，最后讲诗人的心情以及如何写下这首诗。语言简单易懂，控制在80-120字；史实不确定时不要编造具体日期或事件；直接输出正文，不要加任何前缀说明。'
          : '你是一位给小学生讲古诗的老师。请把这首诗的情感关联到小朋友熟悉的日常生活场景（比如夏令营、住校、想爸爸妈妈等），帮助他们体会诗人的心情，语言亲切自然，控制在60-100字，直接输出正文，不要加任何前缀说明。';

        const aiResult = await generateWithDashScope(apiKey, [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `诗名：《${title}》\n作者：${author || '未知'}\n原文：\n${rawText}` },
        ]);

        if (!aiResult.content) {
          const details = aiResult.failures
            .map(({ model, status, message }) => `${model} (${status}): ${message}`)
            .join('；');
          return json({ error: `百炼模型调用失败：${details}` }, 502);
        }

        return json({ content: aiResult.content, model: aiResult.model });
      }

      // POST /api/generate-sentence — AI 生成逐句讲解（拼音、译文、画面、心境）
      if (path === '/api/generate-sentence' && method === 'POST') {
        const body = await request.json();
        const { poemTitle, poemAuthor, sentenceText, poemRawText } = body;

        if (!poemTitle || !sentenceText) {
          return json({ error: '诗名和句子文本为必填项' }, 400);
        }

        const apiKey = env.QWEN_API_KEY;
        if (!apiKey) return json({ error: 'QWEN_API_KEY not configured' }, 500);

        const systemPrompt = `你是一位给小学生讲古诗的老师。对于给定的诗句，请生成以下内容：
1. 拼音（完整带声调的汉语拼音）
2. 译文（白话文翻译，简单易懂，30-50字）
3. 画面（描述诗句呈现的具体场景画面，让孩子脑海中能想象出来，40-60字）
4. 心境（诗人/主人公此时的情感状态，用小学生能理解的词汇，15-30字）

请严格按照以下JSON格式输出，不要添加任何其他文字：
{"pinyin":"完整拼音","translation":"白话翻译","scene":"画面描述","mood":"心境描述"}`;

        const userPrompt = `诗名：《${poemTitle}》
作者：${poemAuthor || '未知'}
全诗原文：
${poemRawText}

当前句子：${sentenceText}`;

        const aiResult = await generateWithDashScope(apiKey, [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ]);

        if (!aiResult.content) {
          const details = aiResult.failures
            .map(({ model, status, message }) => `${model} (${status}): ${message}`)
            .join('；');
          return json({ error: `百炼模型调用失败：${details}` }, 502);
        }

        // Parse JSON response
        try {
          const parsed = parseAiJson(aiResult.content);
          return json({
            pinyin: parsed.pinyin || '',
            translation: parsed.translation || '',
            scene: parsed.scene || '',
            mood: parsed.mood || '',
            model: aiResult.model
          });
        } catch (parseErr) {
          return json({ error: 'AI 返回格式错误，请重试', raw: aiResult.content }, 500);
        }
      }

      // POST /api/generate-words — AI 按原文顺序提取生字词
      if (path === '/api/generate-words' && method === 'POST') {
        const body = await request.json();
        const { title, author, rawText } = body;

        if (!title || !rawText) {
          return json({ error: '诗名和原文为必填项' }, 400);
        }

        const apiKey = env.QWEN_API_KEY;
        if (!apiKey) return json({ error: 'QWEN_API_KEY not configured' }, 500);

        const systemPrompt = `你是一位熟悉小学语文的古诗老师。请从原文中挑选3-8个小学生需要学习的生字、难字或古今义不同的词语，并给出带声调的拼音和在本诗语境中的简明释义。

要求：
1. 只能选择原文中实际出现的字或词；
2. 严格按照它们在原文中第一次出现的先后顺序排列；
3. 不要重复；释义要适合小学生，避免循环解释；
4. 如果确实没有合适的生字词，可以返回空数组；
5. 严格输出JSON，不要添加任何其他文字。

输出格式：
{"words":[{"word":"疑","pinyin":"yí","meaning":"好像，以为"}]}`;

        const aiResult = await generateWithDashScope(apiKey, [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `诗名：《${title}》\n作者：${author || '未知'}\n原文：\n${rawText}` },
        ]);

        if (!aiResult.content) {
          const details = aiResult.failures
            .map(({ model, status, message }) => `${model} (${status}): ${message}`)
            .join('；');
          return json({ error: `百炼模型调用失败：${details}` }, 502);
        }

        try {
          const parsed = parseAiJson(aiResult.content);
          const sourceWords = Array.isArray(parsed.words) ? parsed.words : [];
          const seen = new Set();
          const words = sourceWords
            .filter((item) => item && typeof item.word === 'string' && rawText.includes(item.word))
            .map((item) => ({
              word: item.word.trim(),
              pinyin: typeof item.pinyin === 'string' ? item.pinyin.trim() : '',
              meaning: typeof item.meaning === 'string' ? item.meaning.trim() : '',
            }))
            .filter((item) => item.word && !seen.has(item.word) && seen.add(item.word))
            .sort((a, b) => rawText.indexOf(a.word) - rawText.indexOf(b.word))
            .slice(0, 8);

          return json({ words, model: aiResult.model });
        } catch (parseErr) {
          return json({ error: 'AI 返回格式错误，请重试', raw: aiResult.content }, 500);
        }
      }

      return json({ error: 'Not found' }, 404);
    } catch (error) {
      return json({ error: error.message || 'Internal Server Error' }, 500);
    }
  },
};
