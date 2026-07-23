import React, { useState, useEffect } from "react";
import { Poem, Sentence, Word } from "../types";
import { ArrowLeft, Plus, Trash2, Split, Check, Sparkles, Upload, Camera } from "lucide-react";
import { API_BASE } from "../apiConfig";

declare global {
  interface Window {
    Tesseract?: any;
  }
}

// Lazily load Tesseract.js from CDN (same pattern as Writing Archive project)
function loadTesseract(): Promise<void> {
  return window.Tesseract
    ? Promise.resolve()
    : new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Tesseract.js 加载失败"));
        document.head.appendChild(script);
      });
}

interface PoemFormProps {
  poemId?: number;
  onSave: (poemData: any) => void;
  onCancel: () => void;
  existingPoem?: Poem;
}

export default function PoemForm({ poemId, onSave, onCancel, existingPoem }: PoemFormProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [rawText, setRawText] = useState("");
  const [background, setBackground] = useState("");
  const [empathy, setEmpathy] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // OCR state
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);

  // AI context generation state
  const [storyGenerating, setStoryGenerating] = useState(false);
  const [empathyGenerating, setEmpathyGenerating] = useState(false);

  // Dynamic state for sentences and words
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [words, setWords] = useState<Word[]>([]);

  // Initialize form if editing
  useEffect(() => {
    if (existingPoem) {
      setTitle(existingPoem.title);
      setAuthor(existingPoem.author);
      setRawText(existingPoem.raw_text);
      setBackground(existingPoem.background || "");
      setEmpathy(existingPoem.empathy || "");
      setAudioUrl(existingPoem.audio_url || "");
      setVideoUrl(existingPoem.video_url || "");
      setSentences(existingPoem.sentences_json || []);
      setWords(existingPoem.words_json || []);
    }
  }, [existingPoem]);

  // Handle auto-splitting by punctuation
  const handleAutoSplit = () => {
    if (!rawText.trim()) {
      alert("请先输入全诗原文！");
      return;
    }

    // Split by common Chinese/English punctuation and newlines
    const parts = rawText
      .split(/[，。？！；\n\r,?!;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Merge or preserve existing annotated sentences if the text matches
    const newSentences = parts.map((part) => {
      const existing = sentences.find((s) => s.text === part);
      if (existing) {
        return existing;
      }
      return {
        text: part,
        pinyin: "",
        translation: "",
        scene: "",
        mood: ""
      };
    });

    setSentences(newSentences);
  };

  // Handle OCR image upload with Tesseract.js (browser-based, no API needed)
  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("请上传图片文件（JPG、PNG 等）");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("图片文件不能超过 5MB，请压缩后重试");
      return;
    }

    setOcrProcessing(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setOcrPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Load Tesseract.js library
      await loadTesseract();

      // Run OCR with Chinese simplified + English support
      const result = await window.Tesseract.recognize(file, 'chi_sim+eng', {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR 进度: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      const fullText = (result.data.text || '').trim();

      if (!fullText) {
        alert("没有识别到文字，请确保图片清晰或手动输入");
        return;
      }

      // Parse poem structure: first line = title, second = author, rest = body
      const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      if (lines.length >= 3) {
        setTitle(lines[0]);
        setAuthor(lines[1]);
        setRawText(lines.slice(2).join('\n'));
      } else if (lines.length === 2) {
        setTitle(lines[0]);
        setRawText(lines[1]);
      } else if (lines.length === 1) {
        setRawText(lines[0]);
      }

      alert("✅ OCR 识别完成！已自动填充内容，请检查并修改（中文识别可能有误差）。");
    } catch (err: any) {
      alert(err.message || "OCR 识别出错，请手动输入或重试");
      console.error("OCR error:", err);
    } finally {
      setOcrProcessing(false);
    }
  };

  // Call backend AI proxy to generate 背景故事 / 共情类比
  const handleGenerateContext = async (type: "story" | "empathy") => {
    if (!title.trim() || !rawText.trim()) {
      alert("请先填写诗名和原文，再使用 AI 生成");
      return;
    }

    const setLoading = type === "story" ? setStoryGenerating : setEmpathyGenerating;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/generate-context`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, rawText, type })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AI 生成失败");
      }
      if (type === "story") {
        setBackground(data.content);
      } else {
        setEmpathy(data.content);
      }
    } catch (err: any) {
      alert(err.message || "AI 生成出错，请稍后重试");
      console.error("AI generate-context error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sentences mutation helper
  const updateSentenceField = (index: number, field: keyof Sentence, value: string) => {
    const updated = [...sentences];
    updated[index] = { ...updated[index], [field]: value };
    setSentences(updated);
  };

  // Words mutation helpers
  const handleAddWord = () => {
    setWords([...words, { word: "", pinyin: "", meaning: "" }]);
  };

  const handleRemoveWord = (index: number) => {
    setWords(words.filter((_, idx) => idx !== index));
  };

  const updateWordField = (index: number, field: keyof Word, value: string) => {
    const updated = [...words];
    updated[index] = { ...updated[index], [field]: value };
    setWords(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !author.trim() || !rawText.trim()) {
      alert("请填写诗名、作者和原文！");
      return;
    }

    if (sentences.length === 0) {
      // Prompt user if they forgot to split
      const autoConfirm = confirm("您还没有进行【逐句讲解拆分】，是否自动根据标点拆句后再保存？");
      if (autoConfirm) {
        const parts = rawText
          .split(/[，。？！；\n\r,?!;]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        const autoSents = parts.map((p) => ({
          text: p,
          pinyin: "",
          translation: "",
          scene: "",
          mood: ""
        }));
        onSave({
          title,
          author,
          raw_text: rawText,
          sentences_json: autoSents,
          background,
          empathy,
          words_json: words,
          audio_url: audioUrl,
          video_url: videoUrl
        });
        return;
      }
    }

    onSave({
      title,
      author,
      raw_text: rawText,
      sentences_json: sentences,
      background,
      empathy,
      words_json: words,
      audio_url: audioUrl,
      video_url: videoUrl
    });
  };

  return (
    <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 md:p-8 space-y-8 max-w-4xl mx-auto shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            id="btn-form-back"
            className="p-2 hover:bg-stone-100 text-stone-600 rounded-xl transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl md:text-2xl font-bold font-serif text-[#5A5A40]">
            {poemId ? "编辑古诗词" : "添加新古诗词"}
          </h2>
        </div>
        <div className="text-xs text-stone-500 font-medium">无文件上传 · 全网直链驱动</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-800">
              古诗题目 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例如：静夜思"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5DF] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-800">
              诗人 / 作者 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例如：李白"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5DF] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none transition-all"
            />
          </div>
        </div>

        {/* OCR image upload */}
        <div className="space-y-3 bg-gradient-to-br from-amber-50 to-[#5A5A40]/5 p-5 rounded-3xl border-2 border-dashed border-[#5A5A40]/30">
          <div className="flex items-center justify-between gap-3">
            <div>
              <label className="block text-sm font-bold text-[#5A5A40] flex items-center gap-1.5">
                <Camera size={16} />
                拍照 / 上传图片自动识别
              </label>
              <p className="text-stone-500 text-xs mt-0.5 font-semibold">
                拍下课本或练习册上的古诗，自动识别诗名、作者和原文
              </p>
            </div>
            <label
              htmlFor="ocr-upload-input"
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-black shadow-md transition-all cursor-pointer active:scale-95 shrink-0 ${
                ocrProcessing
                  ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                  : "bg-[#5A5A40] text-white hover:bg-[#484833]"
              }`}
            >
              <Upload size={18} />
              {ocrProcessing ? "识别中..." : "上传图片"}
            </label>
            <input
              id="ocr-upload-input"
              type="file"
              accept="image/*"
              onChange={handleOcrUpload}
              disabled={ocrProcessing}
              className="hidden"
            />
          </div>

          {ocrPreview && (
            <div className="flex items-center gap-3">
              <img
                src={ocrPreview}
                alt="上传预览"
                className="h-24 rounded-xl border-2 border-[#E5E5DF] object-cover"
              />
              {ocrProcessing && (
                <span className="text-sm text-[#5A5A40] font-bold animate-pulse">
                  正在识别文字，请稍候...
                </span>
              )}
            </div>
          )}
        </div>

        {/* Raw text */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-stone-800">
              全诗原文 <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-stone-500">（标点符号会自动作为拆句依据）</span>
          </div>
          <textarea
            required
            rows={4}
            placeholder="请输入全诗。例如：&#13;床前明月光，疑是地上霜。&#13;抬头望明月，低头思故乡。"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#E5E5DF] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none transition-all font-serif text-lg leading-relaxed bg-[#FDFBF7]"
          />
        </div>

        {/* Ebbinghaus Empathy & Background */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#5A5A40]/5 p-5 rounded-2xl border border-[#E5E5DF]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-[#5A5A40]">背景故事</label>
              <button
                type="button"
                onClick={() => handleGenerateContext("story")}
                disabled={storyGenerating || !title.trim() || !rawText.trim()}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full transition-all shadow-sm ${
                  storyGenerating || !title.trim() || !rawText.trim()
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:from-amber-500 hover:to-amber-600 active:scale-95"
                }`}
              >
                <Sparkles size={12} />
                {storyGenerating ? "生成中..." : "AI生成"}
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="给小学生讲这首诗是在什么背景下写的（用讲故事的口吻，更易懂哦）..."
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5DF] focus:border-[#5A5A40] outline-none transition-all text-sm bg-white"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-[#5A5A40]">共情类比</label>
              <button
                type="button"
                onClick={() => handleGenerateContext("empathy")}
                disabled={empathyGenerating || !title.trim() || !rawText.trim()}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full transition-all shadow-sm ${
                  empathyGenerating || !title.trim() || !rawText.trim()
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-400 to-purple-500 text-purple-950 hover:from-purple-500 hover:to-purple-600 active:scale-95"
                }`}
              >
                <Sparkles size={12} />
                {empathyGenerating ? "生成中..." : "AI生成"}
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="关联小朋友的日常生活。例如：’像你去外地夏令营晚上想爸爸妈妈一样’..."
              value={empathy}
              onChange={(e) => setEmpathy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5DF] focus:border-[#5A5A40] outline-none transition-all text-sm bg-white"
            />
          </div>
        </div>

        {/* Audio / Video Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#5A5A40]/5 p-5 rounded-2xl border border-[#E5E5DF]">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="block text-sm font-semibold text-[#5A5A40]">音频直链 (MP3 MP4 etc)</label>
              <span className="text-xs text-stone-500">公网可访问的音频URL</span>
            </div>
            <input
              type="url"
              placeholder="https://cdn.jsdelivr.net/gh/user/repo/audio/xxx.mp3"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5DF] focus:border-[#5A5A40] outline-none bg-white transition-all text-xs"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="block text-sm font-semibold text-[#5A5A40]">视频 iframe 嵌入链接</label>
              <span className="text-xs text-stone-500">B站/YouTube embed 链接</span>
            </div>
            <input
              type="url"
              placeholder="https://player.bilibili.com/player.html?bvid=xxx"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5DF] focus:border-[#5A5A40] outline-none bg-white transition-all text-xs"
            />
          </div>
        </div>

        {/* Auto Split sentences section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-stone-100 pt-6">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#5A5A40] flex items-center gap-2">
                逐句详细讲解（小学生专属）
              </h3>
              <p className="text-stone-500 text-xs mt-0.5">
                先点击右侧“自动拆句”，即可在下方快速编辑每一句的拼音、翻译和画面。
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoSplit}
              id="btn-auto-split"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20 font-semibold rounded-lg text-xs hover:bg-[#5A5A40]/25 transition-all self-start"
            >
              <Split size={14} />
              自动分析并拆分句子
            </button>
          </div>

          {sentences.length === 0 ? (
            <div className="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-[#E5E5DF] text-stone-400 text-sm">
              尚未进行句子拆分。请输入全诗并点击上方的“自动分析并拆分句子”按钮。
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 border border-[#E5E5DF] p-3 rounded-xl bg-stone-50/50">
              {sentences.map((sent, index) => (
                <div key={index} className="bg-white border border-[#E5E5DF] rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-[#5A5A40] text-white font-bold rounded-full text-xs font-serif">
                      {index + 1}
                    </span>
                    <span className="font-serif font-semibold text-[#2C2C2C] text-base bg-[#5A5A40]/5 px-2 py-0.5 rounded border border-[#5A5A40]/15">
                      {sent.text}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-600">汉语拼音</label>
                      <input
                        type="text"
                        placeholder="例如：chuáng qián míng yuè guāng"
                        value={sent.pinyin}
                        onChange={(e) => updateSentenceField(index, "pinyin", e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E5E5DF] text-xs focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-600">白话翻译</label>
                      <input
                        type="text"
                        placeholder="例如：明亮的月光洒在床前。"
                        value={sent.translation}
                        onChange={(e) => updateSentenceField(index, "translation", e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E5E5DF] text-xs focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-600">画面描述（让诗词变成故事）</label>
                      <input
                        type="text"
                        placeholder="例如：床前洒满了亮亮的月光，像亮晃晃的银白丝绸..."
                        value={sent.scene}
                        onChange={(e) => updateSentenceField(index, "scene", e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E5E5DF] text-xs focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-600">心情解读（感知古人情绪）</label>
                      <input
                        type="text"
                        placeholder="例如：宁静、略带孤独"
                        value={sent.mood}
                        onChange={(e) => updateSentenceField(index, "mood", e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E5E5DF] text-xs focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vocabulary words list */}
        <div className="space-y-4 border-t border-stone-100 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#5A5A40] flex items-center gap-2">
                生字词释义卡片
              </h3>
              <p className="text-stone-500 text-xs mt-0.5">
                添加古诗中的难字、生字，帮助小学生夯实语文基础。
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddWord}
              id="btn-add-word"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-800 border border-[#E5E5DF] font-semibold rounded-lg text-xs hover:bg-stone-200 transition-all"
            >
              <Plus size={14} />
              添加生词行
            </button>
          </div>

          {words.length === 0 ? (
            <div className="text-center py-6 bg-stone-50 rounded-xl border border-dashed border-[#E5E5DF] text-stone-400 text-xs">
              无生字词。点击上方“添加生词行”可以高亮和讲解。
            </div>
          ) : (
            <div className="space-y-3">
              {words.map((word, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 bg-[#FDFBF7] p-3 rounded-xl border border-[#E5E5DF] items-end sm:items-center">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                    <input
                      type="text"
                      placeholder="生字（如：疑）"
                      value={word.word}
                      onChange={(e) => updateWordField(index, "word", e.target.value)}
                      className="px-3 py-1.5 bg-white border border-[#E5E5DF] rounded-lg text-xs outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40]"
                    />
                    <input
                      type="text"
                      placeholder="拼音（如：yí）"
                      value={word.pinyin}
                      onChange={(e) => updateWordField(index, "pinyin", e.target.value)}
                      className="px-3 py-1.5 bg-white border border-[#E5E5DF] rounded-lg text-xs outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40]"
                    />
                    <input
                      type="text"
                      placeholder="释义（如：好像，以为）"
                      value={word.meaning}
                      onChange={(e) => updateWordField(index, "meaning", e.target.value)}
                      className="px-3 py-1.5 bg-white border border-[#E5E5DF] rounded-lg text-xs outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveWord(index)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg self-end sm:self-auto transition-colors"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action controls */}
        <div className="flex justify-end gap-3 border-t border-stone-100 pt-6">
          <button
            type="button"
            onClick={onCancel}
            id="btn-form-cancel"
            className="px-5 py-2.5 border border-[#E5E5DF] text-stone-700 font-semibold rounded-lg hover:bg-stone-50 transition-all text-xs"
          >
            取消
          </button>
          <button
            type="submit"
            id="btn-form-save"
            className="flex items-center gap-1.5 px-6 py-2.5 bg-[#5A5A40] hover:bg-[#484833] active:bg-[#3a3a2a] text-white font-semibold rounded-lg shadow-sm transition-all text-xs"
          >
            <Check size={18} />
            保存诗歌
          </button>
        </div>
      </form>
    </div>
  );
}
