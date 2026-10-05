import React, { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, BookOpen } from "lucide-react";
import { Poem } from "../types";
import { API_BASE } from "../apiConfig";
import { currentWeek, shiftWeek } from "../week";

interface Props { poems: Poem[]; onLearn: (id: number) => void; onAdd: () => void; }
export default function WeeklyPlan({ poems, onLearn, onAdd }: Props) {
  const [week, setWeek] = useState(currentWeek);
  const [ids, setIds] = useState<number[]>([]);
  const [draft, setDraft] = useState<number[]>([]);
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setEditing(false); setQuery("");
    (async () => {
      try {
        const response = await fetch(`${API_BASE}/api/weekly-plan?week=${week}`, { signal: controller.signal });
        if (!response.ok) throw new Error("读取每周计划失败，请重试");
        const plan = await response.json();
        if (!controller.signal.aborted) setIds(plan.poem_ids);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "读取失败");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [week, reload]);
  const selected = ids.map(id => poems.find(p => p.id === id)).filter((p): p is Poem => !!p);
  const completed = selected.filter(p => p.mastered).length;
  const choices = poems.filter(p => `${p.title} ${p.author}`.includes(query.trim()));
  const navigate = (next: string) => {
    if (editing && !confirm("切换周次会放弃未保存的调整，继续吗？")) return;
    setWeek(next);
  };
  const save = async () => {
    setSaving(true); setError("");
    const nextIds = draft.filter(id => poems.some(p => p.id === id));
    try {
      const response = await fetch(`${API_BASE}/api/weekly-plan?week=${week}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ poem_ids: nextIds })
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "保存失败，请重试");
      }
      setIds(nextIds); setEditing(false);
    } catch (err) { setError(err instanceof Error ? err.message : "保存失败，请重试"); }
    finally { setSaving(false); }
  };
  const button = "rounded-lg border border-[#E5E5DF] px-3 py-2 text-sm font-semibold hover:bg-stone-100 disabled:opacity-50";
  return <section aria-labelledby="weekly-heading" className="bg-[#FDFBF7] border-2 border-[#E5E5DF] rounded-2xl p-5 md:p-6 mb-6">
    <div className="flex flex-wrap justify-between gap-4 items-start">
      <div>
        <h2 id="weekly-heading" className="flex items-center gap-2 text-xl font-bold font-serif text-[#5A5A40]"><Calendar size={22}/>{week === currentWeek() ? "本周背诗" : "每周背诗计划"}</h2>
        <p className="text-sm text-stone-600 mt-2">{week} 至 {shiftWeek(week, 6)} · 周一至周日</p>
        <p className="text-sm text-stone-600 mt-1">跟着老师的计划，一首一首背会。</p>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <button className={button} aria-label="上一周" disabled={saving} onClick={() => navigate(shiftWeek(week, -7))}><ChevronLeft size={18}/></button>
        <button className={button} disabled={saving || week === currentWeek()} onClick={() => navigate(currentWeek())}>本周</button>
        <button className={button} aria-label="下一周" disabled={saving} onClick={() => navigate(shiftWeek(week, 7))}><ChevronRight size={18}/></button>
        {!editing && <button className="rounded-lg bg-[#5A5A40] text-white px-4 py-2 text-sm font-bold disabled:opacity-50" disabled={loading || !!error} onClick={() => { setDraft(selected.map(p => p.id!)); setEditing(true); }}>{selected.length ? "调整计划" : "设置计划"}</button>}
      </div>
    </div>
    {error && <div role="alert" className="mt-4 text-sm text-rose-700">{error} {!editing && <button className="underline ml-2" onClick={() => setReload(n => n + 1)}>重新加载</button>}</div>}
    {loading ? <p role="status" className="mt-5 text-stone-500">正在读取计划…</p> : editing ? <div className="mt-5 space-y-4">
      <p className="text-sm text-stone-600">勾选老师布置的古诗。诗库里还没有的诗，可以先添加，再回来选择。</p>
      <label className="block text-sm font-semibold">搜索诗库<input className="block mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2" value={query} onChange={e => setQuery(e.target.value)} placeholder="输入诗名或作者" disabled={saving}/></label>
      <div className="max-h-80 overflow-auto space-y-1">
        {choices.map(poem => <label key={poem.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-100 cursor-pointer">
          <input type="checkbox" className="w-5 h-5 accent-[#5A5A40]" disabled={saving} checked={draft.includes(poem.id!)} onChange={e => setDraft(current => e.target.checked ? [...current, poem.id!] : current.filter(id => id !== poem.id))}/>
          <span className="font-serif font-semibold">{poem.title}<span className="ml-3 text-sm text-stone-500 font-normal">{poem.author}</span></span>
        </label>)}
        {!choices.length && <p className="py-4 text-sm text-stone-500">没有找到古诗，请先添加到诗库。</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-stone-600">已选 {draft.length} 首</span>
        <button disabled={saving} className="rounded-lg bg-[#5A5A40] text-white px-4 py-2 font-bold disabled:opacity-50" onClick={save}>{saving ? "正在保存…" : "保存计划"}</button>
        <button disabled={saving} className={button} onClick={() => { setEditing(false); setError(""); }}>取消</button>
        <button disabled={saving} className={button} onClick={() => { if (confirm("先去添加古诗？未保存的计划调整将被放弃。")) onAdd(); }}>添加新诗</button>
      </div>
    </div> : !error && <div className="mt-5">
      {selected.length ? <>
        <p className="text-sm font-semibold text-[#5A5A40] mb-3" role="status">已背会 {completed} / {selected.length} 首{completed === selected.length && " · 本周计划已完成！"}</p>
        <div className="space-y-2">{selected.map(poem => <div key={poem.id} className="flex items-center justify-between gap-3 bg-white rounded-xl border border-[#E5E5DF] p-4">
          <div className="min-w-0"><h3 className="font-serif font-bold text-lg break-words">{poem.title}</h3><p className="text-sm text-stone-500 mt-1">{poem.author} · {poem.mastered ? "已背会" : "待背诵"}</p></div>
          <button className={`${button} shrink-0 text-[#5A5A40] flex items-center gap-2`} onClick={() => onLearn(poem.id!)}>{poem.mastered ? <CheckCircle size={17}/> : <BookOpen size={17}/>} {poem.mastered ? "再巩固" : "去背诗"}</button>
        </div>)}</div>
      </> : <p className="text-sm text-stone-500 py-3">这一周还没有安排古诗。点击“设置计划”，选入老师布置的诗吧。</p>}
    </div>}
  </section>;
}
