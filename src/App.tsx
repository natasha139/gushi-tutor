import React, { useState, useEffect } from "react";
import { Poem } from "./types";
import PoemList from "./components/PoemList";
import PoemForm from "./components/PoemForm";
import PoemDetail from "./components/PoemDetail";
import { BookOpen, Award, Search, HelpCircle, FileText, Sparkles } from "lucide-react";
import { API_BASE } from "./apiConfig";

export default function App() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Router view state: "list" | "add" | { name: "edit", id: number } | { name: "learn", id: number }
  const [view, setView] = useState<{ name: "list" | "add" | "edit" | "learn"; id?: number }>({ name: "list" });
  
  // Search query filter
  const [searchQuery, setSearchQuery] = useState("");

  // Font size state
  const [fontSize, setFontSize] = useState<"normal" | "large" | "huge">("normal");

  // Fetch all poems from Express API
  const fetchPoems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/poems`);
      if (!response.ok) {
        throw new Error("获取古诗列表失败");
      }
      const data = await response.json();
      setPoems(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "无法连接到服务器，请检查网络连接。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoems();
  }, []);

  // Handle addition or modification submission
  const handleSavePoem = async (poemData: any) => {
    try {
      let response;
      if (view.name === "edit" && view.id) {
        response = await fetch(`${API_BASE}/api/poems/${view.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(poemData)
        });
      } else {
        response = await fetch(`${API_BASE}/api/poems`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(poemData)
        });
      }

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "保存古诗失败");
      }

      // Success, go back to list and fetch
      setView({ name: "list" });
      fetchPoems();
    } catch (err: any) {
      alert(err.message || "保存古诗出错，请重试");
    }
  };

  // Handle marking mastered / reviewing completion
  const handleMarkMastered = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/poems/${id}/review`, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("更新复习状态失败");
      }

      // Success
      alert("🎉 恭喜你，小书童！你已经背会了这首诗！系统已自动制定艾宾浩斯复习曲线，记得在提示时间回来打卡哦！");
      setView({ name: "list" });
      fetchPoems();
    } catch (err: any) {
      alert(err.message || "标记失败，请重试");
    }
  };

  // Handle deletions
  const handleDeletePoem = async (id: number) => {
    const p = poems.find((poem) => poem.id === id);
    if (!p) return;

    const confirmDel = confirm(`确定要从诗歌库中永久删除《${p.title}》吗？此操作无法恢复。`);
    if (!confirmDel) return;

    try {
      const response = await fetch(`${API_BASE}/api/poems/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      fetchPoems();
    } catch (err: any) {
      alert(err.message || "删除古诗出错，请重试");
    }
  };

  // Get active editing poem
  const getEditingPoem = () => {
    if (view.name === "edit" && view.id) {
      return poems.find((p) => p.id === view.id);
    }
    return undefined;
  };

  // Get active studying poem
  const getStudyingPoem = () => {
    if (view.name === "learn" && view.id) {
      return poems.find((p) => p.id === view.id);
    }
    return undefined;
  };

  // Filtered poems based on search bar query
  const filteredPoems = poems.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.raw_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#2C2C2C] pb-12 flex flex-col font-sans">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E5DF] py-4 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Logo & Slogan */}
          <div
            onClick={() => setView({ name: "list" })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#5A5A40] flex items-center justify-center text-white font-serif italic text-xl shadow-sm group-hover:scale-105 transition-transform">
              诗
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-serif text-[#5A5A40] tracking-wide">
                古诗伴读 · 乐学版
              </h1>
              <p className="text-[10px] md:text-xs text-[#5A5A40]/85 font-medium font-serif">
                书山有路勤为径 · 艾宾浩斯智能记忆
              </p>
            </div>
          </div>

          {/* Quick Search & Actions only on list view */}
          {view.name === "list" && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="搜索题目、作者、诗歌原文..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-[#E5E5DF] rounded-xl text-xs focus:bg-white focus:border-[#5A5A40] outline-none transition-all"
                />
              </div>

              {/* Add button */}
              <button
                onClick={() => setView({ name: "add" })}
                id="btn-nav-add-poem"
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] active:bg-[#3a3a2a] text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                添加古诗
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main body content wrapper */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 mt-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-center text-xs font-medium max-w-md mx-auto my-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-10 h-10 border-4 border-[#5A5A40] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-stone-500 text-sm">正在为小书童准备诗集，请稍等...</p>
          </div>
        ) : (
          <div>
            {view.name === "list" && (
              <PoemList
                poems={filteredPoems}
                onSelectPoem={(id) => setView({ name: "learn", id })}
                onAddPoem={() => setView({ name: "add" })}
                onEditPoem={(id) => setView({ name: "edit", id })}
                onDeletePoem={handleDeletePoem}
                fontSizeClass={fontSize === "normal" ? "text-base" : fontSize === "large" ? "text-lg" : "text-xl"}
              />
            )}

            {view.name === "add" && (
              <PoemForm
                onSave={handleSavePoem}
                onCancel={() => setView({ name: "list" })}
              />
            )}

            {view.name === "edit" && (
              <PoemForm
                poemId={view.id}
                existingPoem={getEditingPoem()}
                onSave={handleSavePoem}
                onCancel={() => setView({ name: "list" })}
              />
            )}

            {view.name === "learn" && getStudyingPoem() && (
              <PoemDetail
                poem={getStudyingPoem()!}
                onBack={() => setView({ name: "list" })}
                onMarkMastered={handleMarkMastered}
                fontSize={fontSize}
                setFontSize={setFontSize}
              />
            )}
          </div>
        )}
      </main>

      {/* Aesthetic Footer */}
      <footer className="border-t border-[#E5E5DF] mt-12 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <div>
            © 2026 小学古诗词学习助手. 专为小学生量身定制的诗歌背诵工具.
          </div>
          <div className="flex gap-4">
            <span className="text-[#5A5A40] font-semibold">🌱 艾宾浩斯复习：科学背诵，永不遗忘</span>
            <span className="text-stone-400">|</span>
            <span className="text-[#5A5A40] font-semibold">📖 无广告 · 纯净阅读</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
