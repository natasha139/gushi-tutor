import React, { useEffect, useState } from "react";
import { API_BASE } from "../apiConfig";
import { Poem } from "../types";
type Item = {
  id: string;
  kind: string;
  title: string;
  answer: string;
  hint: string;
  stage: number;
  due_at: number;
  last_review: number | null;
};
const kinds = { word: "生词", idiom: "成语", poem: "古诗", prose: "小古文" };
const date = (n: number) =>
  new Date(n).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
export default function MemoryBook({ poems }: { poems: Poem[] }) {
  const [items, setItems] = useState<Item[]>([]),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [tab, setTab] = useState("today");
  const [form, setForm] = useState(false),
    [kind, setKind] = useState("word"),
    [title, setTitle] = useState(""),
    [answer, setAnswer] = useState(""),
    [hint, setHint] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [active, setActive] = useState<Item | null>(null),
    [mask, setMask] = useState(0),
    [revealed, setRevealed] = useState<number[]>([]),
    [checked, setChecked] = useState(false);
  const [filter, setFilter] = useState("all"),
    [query, setQuery] = useState(""),
    [now, setNow] = useState(Date.now());
  async function api(path = "", options?: RequestInit) {
    const res = await fetch(`${API_BASE}/api/memory-items${path}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "操作失败，请重试");
    return data;
  }
  async function load() {
    const data = await api();
    setItems(data);
  }
  useEffect(() => {
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  async function perform(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }
  function openEditor(item?: Item) {
    setEditingId(item?.id ?? null);
    setKind(item?.kind ?? "word");
    setTitle(item?.title ?? "");
    setAnswer(item?.answer ?? "");
    setHint(item?.hint ?? "");
    setActive(null);
    setNotice("");
    setError("");
    setForm(true);
  }
  function start(item: Item) {
    setActive(item);
    setMask(0);
    setRevealed([]);
    setChecked(false);
    setNotice("");
  }
  const due = items.filter((i) => i.last_review && i.due_at <= now),
    fresh = items.filter((i) => !i.last_review);
  const visible = items.filter(
    (i) =>
      (tab !== "today" || !i.last_review || i.due_at <= now) &&
      (filter === "all" || i.kind === filter) &&
      `${i.title}${i.answer}${i.hint}`.includes(query),
  );
  return (
    <section className={`memory-book${form || active ? " memory-focused" : ""}`} aria-label="背诵本">
      <div className="memory-heading">
        <div>
          <span className="memory-eyebrow">每天一点，慢慢记牢</span>
          <h2>今天，背一点。</h2>
          <p>从几个生词开始，把学过的内容留在记忆里。</p>
        </div>
        <button
          className="memory-primary"
          disabled={busy}
          onClick={() => openEditor()}
        >
          ＋ 添加背诵内容
        </button>
      </div>
      <aside className="memory-resource" aria-label="学习资源">
        <div><strong>学古诗 K12</strong><p>按年级查找古诗词和文言文，拓展阅读与学习。</p></div>
        <a href="https://k12.xuegushi.com" target="_blank" rel="noopener noreferrer">打开学习网站 ↗<span className="sr-only">（在新标签页打开）</span></a>
      </aside>
      <div className="memory-summary">
        <div>
          <strong>{fresh.length}</strong>
          <span>待学内容</span>
        </div>
        <div>
          <strong>{due.length}</strong>
          <span>到期复习</span>
        </div>
        <p>
          复习节奏：1、2、4、7、15、30、60 天<br />
          根据每次回忆的情况调整；每条记录单独安排，还不会的 10 分钟后再练。
        </p>
      </div>
      {error && (
        <div role="alert" className="memory-error">
          {error} <button onClick={() => perform(load)}>重试加载</button>
        </div>
      )}
      {notice && (
        <p role="status" className="memory-notice">
          {notice}
        </p>
      )}
      {form ? (
        <form
          className="memory-editor"
          onSubmit={(e) => {
            e.preventDefault();
            perform(async () => {
              await api(editingId ? `/${editingId}` : "", {
                method: editingId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kind, title, answer, hint }),
              });
              await load();
              setForm(false);
              setTitle("");
              setAnswer("");
              setHint("");
              setNotice(
                editingId
                  ? "修改已保存，复习进度保持不变。"
                  : "已加入背诵本，可以开始练习了。",
              );
              setEditingId(null);
            });
          }}
        >
          <h3>{editingId ? "修改背诵内容" : "把今天要背的内容放进来"}</h3>
          {editingId && (
            <p className="memory-help">
              修改后保留当前复习进度和下次复习时间。
            </p>
          )}
          <label>
            内容类型
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              {Object.entries(kinds).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          {kind === "poem" && poems.length > 0 && (
            <label>
              从现有诗库填入
              <select
                defaultValue=""
                onChange={(e) => {
                  const p = poems.find((p) => String(p.id) === e.target.value);
                  if (p) {
                    setTitle(p.title);
                    setAnswer(p.raw_text);
                    setHint(p.author);
                  }
                }}
              >
                <option value="">选择一首古诗</option>
                {poems.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} · {p.author}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            标题
            <input
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：周五语文生词 / 守株待兔"
            />
          </label>
          <label>
            {kind === "word" || kind === "idiom"
              ? "要背的词语（每行一个）"
              : "正文（可以按句换行）"}
            <textarea
              required
              maxLength={10000}
              rows={5}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={"例如：\n灿烂\n蜿蜒\n恍然大悟"}
            />
          </label>
          <label>
            提示（选填：拼音、释义或译文）
            <textarea
              maxLength={3000}
              rows={2}
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="按正文顺序填写，练习时可以查看"
            />
          </label>
          <div className="memory-actions">
            <button
              type="button"
              disabled={busy}
              onClick={() => setForm(false)}
            >
              取消
            </button>
            <button className="memory-primary" disabled={busy}>
              {busy ? "保存中…" : editingId ? "保存修改" : "保存到背诵本"}
            </button>
          </div>
        </form>
      ) : active ? (
        <article className="memory-practice">
          <button onClick={() => setActive(null)}>← 返回背诵本</button>
          <span className="memory-eyebrow">
            {kinds[active.kind as keyof typeof kinds]} ·
            先读，再遮，最后独立回忆
          </span>
          <h3>{active.title}</h3>
          <div className="memory-modes">
            {["完整阅读", "遮住一半", "只留首字", "全部遮挡"].map((m, i) => (
              <button
                key={m}
                aria-pressed={mask === i}
                onClick={() => {
                  setMask(i);
                  setRevealed([]);
                  setChecked(false);
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="memory-lines">
            {active.answer
              .split(/\n|(?<=[。！？；])/u)
              .filter((s) => s.trim())
              .map((line: string, i: number) => (
                <button
                  className="memory-line"
                  key={i}
                  aria-label={
                    mask > 0 && !revealed.includes(i)
                      ? `第${i + 1}行，点击查看提示`
                      : `第${i + 1}行：${line}`
                  }
                  onClick={() => {
                    setRevealed((r) =>
                      r.includes(i) ? r.filter((n) => n !== i) : [...r, i],
                    );
                    setChecked(false);
                  }}
                >
                  {Array.from(line).map((ch, j) => {
                    const hide =
                      !revealed.includes(i) &&
                      /[\p{L}\p{N}]/u.test(ch) &&
                      (mask === 3 ||
                        (mask === 2 && j > 0) ||
                        (mask === 1 && j % 2 === 1));
                    return (
                      <span key={j} className={hide ? "memory-hidden" : ""}>
                        {hide ? "＿" : ch}
                      </span>
                    );
                  })}
                </button>
              ))}
          </div>
          <p className="memory-help">点击某一行可暂时查看；再次点击收起。</p>
          {active.hint && (
            <details>
              <summary>查看拼音 / 释义提示</summary>
              <p className="whitespace-pre-wrap">{active.hint}</p>
            </details>
          )}
          <button
            className="memory-check"
            onClick={() => {
              setMask(0);
              setRevealed([]);
              setChecked(true);
            }}
          >
            我已尝试回忆，查看答案并评价
          </button>
          {checked && (
            <div className="memory-feedback">
              <p>刚才回忆得怎么样？</p>
              {[
                ["again", "还不会 · 10 分钟后"],
                ["hard", "需要提示 · 明天"],
                ["good", "记住了 · 按计划复习"],
              ].map(([r, label]) => (
                <button
                  key={r}
                  disabled={busy}
                  onClick={() =>
                    perform(async () => {
                      const next = await api(`/${active.id}/review`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ rating: r }),
                      });
                      await load();
                      setActive(null);
                      setNow(Date.now());
                      setNotice(
                        `已记录「${active.title}」，下次复习：${date(next.due_at)}`,
                      );
                    })
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </article>
      ) : (
        <>
          <div className="memory-toolbar">
            <nav aria-label="背诵列表">
              <button
                aria-pressed={tab === "today"}
                onClick={() => setTab("today")}
              >
                今日任务 {fresh.length + due.length}
              </button>
              <button
                aria-pressed={tab === "all"}
                onClick={() => setTab("all")}
              >
                全部内容 {items.length}
              </button>
            </nav>
            <div>
              <select
                aria-label="筛选内容类型"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">所有类型</option>
                {Object.entries(kinds).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <input
                aria-label="搜索背诵内容"
                placeholder="搜索背诵内容"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          {loading ? (
            <p className="memory-empty">正在加载背诵本…</p>
          ) : !visible.length ? (
            <div className="memory-empty">
              <h3>
                {query || filter !== "all"
                  ? "没有找到符合条件的内容"
                  : tab === "today" && items.length
                    ? "今天的任务完成了"
                    : "从今天的几个词开始"}
              </h3>
              <p>
                {tab === "today" && items.length
                  ? "到期内容会出现在这里，也可以去全部内容提前练习。"
                  : "添加生词、成语、古诗或小古文，保存后就能遮挡练习。"}
              </p>
              <button onClick={() => openEditor()}>＋ 添加内容</button>
            </div>
          ) : (
            <div className="memory-list">
              {visible.map((item) => (
                <article key={item.id}>
                  <div>
                    <span className="memory-eyebrow">
                      {kinds[item.kind as keyof typeof kinds]} ·{" "}
                      {!item.last_review
                        ? "还没开始"
                        : item.due_at <= now
                          ? "该复习了"
                          : `下次 ${date(item.due_at)}`}
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.answer.slice(0, 80)}</p>
                  </div>
                  <div className="memory-actions">
                    <button
                      disabled={busy}
                      aria-label={`修改${item.title}`}
                      onClick={() => openEditor(item)}
                    >
                      修改
                    </button>
                    <button
                      className="memory-primary"
                      onClick={() => start(item)}
                    >
                      {item.last_review ? "复习" : "开始背诵"}
                    </button>
                    <button
                      disabled={busy}
                      aria-label={`删除${item.title}`}
                      onClick={() => {
                        if (confirm(`删除「${item.title}」及其复习记录？`))
                          perform(async () => {
                            await api(`/${item.id}`, { method: "DELETE" });
                            await load();
                          });
                      }}
                    >
                      删除
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
