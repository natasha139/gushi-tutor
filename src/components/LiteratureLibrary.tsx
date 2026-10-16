import React, { useEffect, useState } from "react";
import { API_BASE } from "../apiConfig";
export type LibraryEntry = {
  id: string;
  title: string;
  author: string;
  body: string;
  kind: string;
  edition: string;
  grade: string;
  source_url: string;
};
export default function LiteratureLibrary({
  onChoose,
  onClose,
}: {
  onChoose: (entry: LibraryEntry) => void;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [query, setQuery] = useState(""),
    [grade, setGrade] = useState("all"),
    [selected, setSelected] = useState<string | null>(null);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/literature-library`);
      if (!res.ok) throw new Error("古诗文库暂时无法加载，请重试。");
      setEntries(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  const visible = entries.filter(
    (e) =>
      (grade === "all" || e.grade === grade) &&
      `${e.title}${e.author}${e.body}`.includes(query.trim()),
  );
  return (
    <section className="literature-library" aria-label="古诗文库">
      <button onClick={onClose}>← 返回背诵本</button>
      <h3>古诗文库</h3>
      <p className="memory-help">
        按教材册次选篇，再加入自己的背诵本。保留来源教材分类，篇目可能与现行教材不同。
      </p>
      <div className="memory-toolbar">
        <select
          aria-label="教材册次"
          value={grade}
          onChange={(e) => {
            setGrade(e.target.value);
            setSelected(null);
          }}
        >
          <option value="all">全部册次</option>
          {Array.from(new Set(entries.map((e) => e.grade))).map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <input
          aria-label="搜索古诗文库"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索篇名、作者或原文"
        />
      </div>
      {error && (
        <p role="alert" className="memory-error">
          {error}
          <button onClick={load}>重试</button>
        </p>
      )}
      {loading ? (
        <p role="status">正在加载古诗文库…</p>
      ) : (
        <>
          <p className="memory-help">
            共 {visible.length} 篇 · 来源{" "}
            <a
              href="https://github.com/lanhin/SchoolChinese"
              target="_blank"
              rel="noopener noreferrer"
            >
              lanhin / SchoolChinese
            </a>{" "}
            ·{" "}
            <a
              href="/licenses/SchoolChinese-MIT.txt"
              target="_blank"
              rel="noopener noreferrer"
            >
              MIT 许可证
            </a>
          </p>
          {!visible.length && !error && (
            <p className="memory-empty">
              没有找到符合条件的篇目，试试其他关键词或册次。
            </p>
          )}
          <div className="memory-list">
            {visible.map((e) => (
              <article key={e.id}>
                <div>
                  <span className="memory-eyebrow">
                    {e.edition} · {e.grade}
                  </span>
                  <h4>{e.title}</h4>
                  <p>{e.author || "作者未标注"}</p>
                  {selected === e.id ? (
                    <div className="library-preview">
                      <p>{e.body}</p>
                      <a
                        href={e.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        查看原始篇目 ↗
                      </a>
                    </div>
                  ) : (
                    <p>
                      {e.body.slice(0, 60)}
                      {e.body.length > 60 ? "…" : ""}
                    </p>
                  )}
                </div>
                <div className="memory-actions">
                  <button
                    aria-expanded={selected === e.id}
                    onClick={() => setSelected(selected === e.id ? null : e.id)}
                  >
                    {selected === e.id ? "收起" : "预览"}
                  </button>
                  <button
                    className="memory-primary"
                    onClick={() => onChoose(e)}
                  >
                    加入背诵本
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
