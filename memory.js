export const MEMORY_SCHEMA = `CREATE TABLE IF NOT EXISTS memory_items (
 id TEXT PRIMARY KEY, kind TEXT NOT NULL, title TEXT NOT NULL, answer TEXT NOT NULL,
 hint TEXT NOT NULL DEFAULT '', stage INTEGER NOT NULL DEFAULT 0,
 due_at INTEGER NOT NULL, last_review INTEGER, created_at INTEGER NOT NULL)`;
export const INTERVALS = [1, 2, 4, 7, 15, 30, 60];
export function schedule(stage, rating, now = Date.now()) {
  if (!["again", "hard", "good"].includes(rating))
    throw new Error("无效的记忆反馈");
  const next =
    rating === "again"
      ? 0
      : rating === "hard"
        ? Math.max(0, stage - 1)
        : Math.min(stage + 1, INTERVALS.length);
  const delay =
    rating === "again"
      ? 10 * 60 * 1000
      : rating === "hard"
        ? 86400000
        : INTERVALS[Math.min(stage, INTERVALS.length - 1)] * 86400000;
  return { stage: next, due_at: now + delay, last_review: now };
}
export function validItem(body) {
  return (
    body &&
    ["word", "idiom", "poem", "prose"].includes(body.kind) &&
    typeof body.title === "string" &&
    body.title.trim().length > 0 &&
    body.title.length <= 100 &&
    typeof body.answer === "string" &&
    body.answer.trim().length > 0 &&
    body.answer.length <= 10000 &&
    typeof body.hint === "string" &&
    body.hint.length <= 3000
  );
}
export async function memoryApi(request, db, path) {
  const reply = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  if (path === "/api/memory-items" && request.method === "GET") {
    return reply(
      (
        await db
          .prepare("SELECT * FROM memory_items ORDER BY created_at DESC")
          .all()
      ).results,
    );
  }
  if (path === "/api/memory-items" && request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return reply({ error: "内容格式无效" }, 400);
    }
    if (!validItem(body))
      return reply({ error: "请填写类型、标题和正文，并检查长度" }, 400);
    const now = Date.now();
    const id = crypto.randomUUID();
    await db
      .prepare(
        "INSERT INTO memory_items (id, kind, title, answer, hint, due_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        id,
        body.kind,
        body.title.trim(),
        body.answer.trim(),
        body.hint.trim(),
        now,
        now,
      )
      .run();
    return reply({ id }, 201);
  }
  const match = path.match(/^\/api\/memory-items\/([\w-]+)(\/review)?$/);
  if (match) {
    const item = await db
      .prepare("SELECT * FROM memory_items WHERE id = ?")
      .bind(match[1])
      .first();
    if (!item) return reply({ error: "这条内容已不存在，请刷新" }, 404);
    if (!match[2] && request.method === "PUT") {
      let body;
      try {
        body = await request.json();
      } catch {
        return reply({ error: "内容格式无效" }, 400);
      }
      if (!validItem(body))
        return reply({ error: "请填写类型、标题和正文，并检查长度" }, 400);
      await db
        .prepare(
          "UPDATE memory_items SET kind = ?, title = ?, answer = ?, hint = ? WHERE id = ?",
        )
        .bind(
          body.kind,
          body.title.trim(),
          body.answer.trim(),
          body.hint.trim(),
          item.id,
        )
        .run();
      return reply({ ok: true });
    }
    if (match[2] && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return reply({ error: "反馈格式无效" }, 400);
      }
      if (!["again", "hard", "good"].includes(body.rating))
        return reply({ error: "无效的记忆反馈" }, 400);
      const next = schedule(item.stage, body.rating);
      await db
        .prepare(
          "UPDATE memory_items SET stage = ?, due_at = ?, last_review = ? WHERE id = ?",
        )
        .bind(next.stage, next.due_at, next.last_review, item.id)
        .run();
      return reply(next);
    }
    if (!match[2] && request.method === "DELETE") {
      await db
        .prepare("DELETE FROM memory_items WHERE id = ?")
        .bind(item.id)
        .run();
      return reply({ ok: true });
    }
  }
  return reply({ error: "不支持此操作" }, 405);
}
