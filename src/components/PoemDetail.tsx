import React, { useState, useRef } from "react";
import { Poem } from "../types";
import { ArrowLeft, BookOpen, Brain, Play, Sparkles, MessageCircle, Volume2, Type, HelpCircle, CheckCircle, Info } from "lucide-react";

interface PoemDetailProps {
  poem: Poem;
  onBack: () => void;
  onMarkMastered: (id: number) => void;
  fontSize: "normal" | "large" | "huge";
  setFontSize: (size: "normal" | "large" | "huge") => void;
}

export default function PoemDetail({
  poem,
  onBack,
  onMarkMastered,
  fontSize,
  setFontSize
}: PoemDetailProps) {
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2" | "tab3" | "tab4">("tab1");
  const [challengeStage, setChallengeStage] = useState<number>(0); // 0=正常, 1=遮前2字, 2=遮后半句, 3=仅首字, 4=全遮
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Determine font size CSS class
  const getFontSizeClass = (element: "title" | "body" | "poem") => {
    if (fontSize === "huge") {
      if (element === "title") return "text-3xl md:text-4xl";
      if (element === "poem") return "text-2xl md:text-3xl leading-loose tracking-widest";
      return "text-xl md:text-2xl leading-relaxed";
    }
    if (fontSize === "large") {
      if (element === "title") return "text-2xl md:text-3xl";
      if (element === "poem") return "text-xl md:text-2xl leading-relaxed tracking-wider";
      return "text-lg md:text-xl leading-relaxed";
    }
    // Normal / default
    if (element === "title") return "text-xl md:text-2xl";
    if (element === "poem") return "text-lg md:text-xl leading-relaxed tracking-normal";
    return "text-base md:text-lg leading-relaxed";
  };

  // Trigger audio playback for recitation/hinting
  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
        setAudioPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setAudioPlaying(true);
        }).catch(err => {
          console.warn("Audio autoplay blocked or failed:", err);
          // Standard audio controls allow manual triggers
        });
      }
    }
  };

  // Helper to highlight words inside the poem's raw text
  const renderHighlightedPoemText = () => {
    if (!poem.raw_text) return null;
    let text = poem.raw_text;

    // Sort vocabulary words by length descending so that multi-character words don't get partially split by single characters
    const sortedWords = [...(poem.words_json || [])].sort((a, b) => b.word.length - a.word.length);

    if (sortedWords.length === 0) {
      return <div className="whitespace-pre-line font-serif text-center font-semibold text-stone-800">{text}</div>;
    }

    // Build a regex pattern from sorted words
    const escapedWords = sortedWords.map(w => w.word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const pattern = new RegExp(`(${escapedWords.join('|')})`, 'g');

    const parts = text.split(pattern);

    return (
      <div className="whitespace-pre-line font-serif text-center font-bold tracking-widest text-[#2C2C2C] leading-loose">
        {parts.map((part, index) => {
          const vocab = sortedWords.find(w => w.word === part);
          if (vocab) {
            return (
              <span
                key={index}
                className="bg-[#5A5A40]/15 hover:bg-[#5A5A40]/25 border-b-2 border-[#5A5A40] text-[#5A5A40] px-1 py-0.5 rounded cursor-pointer transition-colors relative group"
                title={`${vocab.pinyin}: ${vocab.meaning}`}
              >
                {part}
                {/* Micro tooltip */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#5A5A40] text-white text-xs font-sans font-normal px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap z-30">
                  <span className="font-bold text-amber-200">[{vocab.pinyin}]</span> {vocab.meaning}
                </span>
              </span>
            );
          }
          return <React.Fragment key={index}>{part}</React.Fragment>;
        })}
      </div>
    );
  };

  // Apply Ebbinghaus progressive blocking/occlusion on the sentence text
  const renderOccludedSentence = (sentenceText: string) => {
    if (challengeStage === 0) return sentenceText;

    // Remove punctuation at the end for blocking calculations if needed, but keeping it is nice.
    // Let's break the sentence into characters
    const chars = Array.from(sentenceText);
    const hasPunctuation = /[，。？！；、]/.test(chars[chars.length - 1]);
    const cleanChars = hasPunctuation ? chars.slice(0, -1) : chars;
    const punct = hasPunctuation ? chars[chars.length - 1] : "";

    if (challengeStage === 1) {
      // Cover first 2 characters
      const covered = cleanChars.map((c, i) => (i < 2 ? "🙈" : c)).join("");
      return covered + punct;
    }

    if (challengeStage === 2) {
      // Cover second half
      const mid = Math.ceil(cleanChars.length / 2);
      const covered = cleanChars.map((c, i) => (i >= mid ? "🙈" : c)).join("");
      return covered + punct;
    }

    if (challengeStage === 3) {
      // Keep only first character
      const covered = cleanChars.map((c, i) => (i === 0 ? c : "🙈")).join("");
      return covered + punct;
    }

    if (challengeStage === 4) {
      // Fully covered
      const covered = cleanChars.map(() => "🙈").join("");
      return covered + punct;
    }

    return sentenceText;
  };

  return (
    <div className="bg-white border border-[#E5E5DF] rounded-2xl overflow-hidden shadow-sm max-w-4xl mx-auto flex flex-col">
      {/* Top Header Controls */}
      <div className="bg-[#FDFBF7] border-b border-[#E5E5DF] p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            id="btn-detail-back"
            className="p-2 hover:bg-stone-200 text-stone-700 rounded-xl transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-[#5A5A40] font-serif flex items-center gap-1.5">
              《{poem.title}》
              <span className="text-sm font-normal text-stone-500 font-sans">[{poem.author}]</span>
            </h2>
          </div>
        </div>

        {/* Global accessible sizing controls */}
        <div className="flex items-center gap-2 bg-stone-200/60 p-1 rounded-xl self-start sm:self-auto">
          <Type size={14} className="text-stone-600 ml-2" />
          <button
            onClick={() => setFontSize("normal")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              fontSize === "normal" ? "bg-white text-stone-950 shadow-sm" : "text-stone-600 hover:text-stone-950"
            }`}
          >
            中
          </button>
          <button
            onClick={() => setFontSize("large")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              fontSize === "large" ? "bg-white text-stone-950 shadow-sm" : "text-stone-600 hover:text-stone-950"
            }`}
          >
            大
          </button>
          <button
            onClick={() => setFontSize("huge")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              fontSize === "huge" ? "bg-white text-stone-950 shadow-sm" : "text-stone-600 hover:text-stone-950"
            }`}
          >
            特大
          </button>
        </div>
      </div>

      {/* 4 Tabs Selector */}
      <div className="grid grid-cols-4 border-b border-[#E5E5DF] bg-[#FDFBF7]">
        <button
          onClick={() => setActiveTab("tab1")}
          id="btn-tab-1"
          className={`py-3.5 text-center text-xs md:text-sm font-bold border-b-2 transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 ${
            activeTab === "tab1"
              ? "border-[#5A5A40] text-[#5A5A40] bg-white"
              : "border-transparent text-stone-500 hover:text-stone-850"
          }`}
        >
          <BookOpen size={16} />
          背景与共情
        </button>
        <button
          onClick={() => setActiveTab("tab2")}
          id="btn-tab-2"
          className={`py-3.5 text-center text-xs md:text-sm font-bold border-b-2 transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 ${
            activeTab === "tab2"
              ? "border-[#5A5A40] text-[#5A5A40] bg-white"
              : "border-transparent text-stone-500 hover:text-stone-850"
          }`}
        >
          <Sparkles size={16} />
          生字词释义
        </button>
        <button
          onClick={() => setActiveTab("tab3")}
          id="btn-tab-3"
          className={`py-3.5 text-center text-xs md:text-sm font-bold border-b-2 transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 ${
            activeTab === "tab3"
              ? "border-[#5A5A40] text-[#5A5A40] bg-white"
              : "border-transparent text-stone-500 hover:text-stone-850"
          }`}
        >
          <MessageCircle size={16} />
          逐句读懂
        </button>
        <button
          onClick={() => setActiveTab("tab4")}
          id="btn-tab-4"
          className={`py-3.5 text-center text-xs md:text-sm font-bold border-b-2 transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 ${
            activeTab === "tab4"
              ? "border-[#5A5A40] text-[#5A5A40] bg-white"
              : "border-transparent text-stone-500 hover:text-stone-850"
          }`}
        >
          <Brain size={16} />
          背诵闯关
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6 md:p-8 flex-grow space-y-6">
        {/* TAB 1: Background & Empathy */}
        {activeTab === "tab1" && (
          <div className="space-y-6">
            {/* Audio Recitation Block */}
            {poem.audio_url && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#5A5A40]/5 border border-[#E5E5DF] rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#5A5A40] flex items-center justify-center text-white">
                    <Volume2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#5A5A40] font-serif">诗词全文朗读</h4>
                    <p className="text-stone-600 text-xs mt-0.5">听听大声朗读，学习古诗的优美旋律与语调</p>
                  </div>
                </div>
                {/* HTML Audio engine */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <audio
                    ref={audioRef}
                    src={poem.audio_url}
                    onPlay={() => setAudioPlaying(true)}
                    onPause={() => setAudioPlaying(false)}
                    onEnded={() => setAudioPlaying(false)}
                    controls
                    className="w-full sm:w-60 h-10"
                  />
                </div>
              </div>
            )}

            {/* Background Narrative */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#E5E5DF] space-y-2">
                  <h4 className="font-serif font-bold text-[#5A5A40] flex items-center gap-1.5">
                    <span className="w-1.5 h-4 bg-[#5A5A40] rounded"></span>
                    背景故事
                  </h4>
                  <p className={`text-stone-700 leading-relaxed font-sans ${getFontSizeClass("body")}`}>
                    {poem.background || "还没有为这首诗添加背景故事，试着去‘添加/编辑古诗’中补全它吧！"}
                  </p>
                </div>

                <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#E5E5DF] space-y-2">
                  <h4 className="font-serif font-bold text-[#5A5A40] flex items-center gap-1.5">
                    <span className="w-1.5 h-4 bg-[#5A5A40] rounded"></span>
                    生活共情
                  </h4>
                  <p className={`text-stone-700 leading-relaxed font-sans ${getFontSizeClass("body")}`}>
                    {poem.empathy || "还没有为这首诗添加共情类比。共情可以帮助小朋友深入体会诗人的感情。"}
                  </p>
                </div>
              </div>

              {/* Video Embedding (16:9 ratio responsive scaling) */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-[#5A5A40] flex items-center gap-1.5">
                  <span className="w-1.5 h-4 bg-[#5A5A40] rounded"></span>
                  诗词动画视频讲解
                </h4>
                {poem.video_url ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#E5E5DF] bg-stone-950 shadow-sm">
                    <iframe
                      src={poem.video_url}
                      scrolling="no"
                      border="0"
                      frameborder="no"
                      framespacing="0"
                      allowfullscreen="true"
                      referrerpolicy="no-referrer"
                      loading="lazy"
                      sandbox="allow-scripts allow-presentation"
                      className="absolute top-0 left-0 w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-stone-50 rounded-xl border border-dashed border-[#E5E5DF] flex flex-col items-center justify-center text-center p-6 text-stone-400">
                    <Info size={32} className="text-stone-300 mb-2" />
                    <p className="text-xs">暂无讲解视频。你可以点击编辑，添加B站/YouTube的 iframe 嵌入地址。</p>
                  </div>
                )}
                <span className="text-xs text-stone-500 block text-right">支持 Bilibili / YouTube 动画直链</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Vocabulary Highlights */}
        {activeTab === "tab2" && (
          <div className="space-y-8">
            {/* Visual Poetry highlights */}
            <div className="bg-[#FDFBF7] border border-[#E5E5DF] rounded-3xl p-8 max-w-lg mx-auto shadow-inner relative">
              <div className="absolute top-3 right-3 text-[10px] bg-[#5A5A40]/10 text-[#5A5A40] font-semibold px-2 py-0.5 rounded-full">
                鼠标悬浮或点击高亮字词有释义哦
              </div>
              <div className={`${getFontSizeClass("poem")} text-center`}>
                {renderHighlightedPoemText()}
              </div>
            </div>

            {/* Glossary Table */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-[#5A5A40] flex items-center gap-1.5">
                <span className="w-1.5 h-4 bg-[#5A5A40] rounded"></span>
                小学生生字词释义卡片
              </h4>

              {poem.words_json && poem.words_json.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {poem.words_json.map((vocab, index) => (
                    <div
                      key={index}
                      className="bg-[#5A5A40]/5 border border-[#E5E5DF] hover:border-[#5A5A40]/30 rounded-xl p-4 flex gap-3.5 transition-all duration-200"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#5A5A40]/10 border border-[#E5E5DF] flex flex-col items-center justify-center flex-shrink-0 text-[#5A5A40]">
                        <span className="text-lg font-bold font-serif">{vocab.word}</span>
                        <span className="text-[10px] font-sans -mt-1">{vocab.pinyin}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-[#5A5A40] font-sans">
                          [{vocab.pinyin}]
                        </div>
                        <p className={`text-stone-700 ${getFontSizeClass("body")}`}>
                          {vocab.meaning}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-stone-50 rounded-xl border border-[#E5E5DF] text-stone-400 text-sm">
                  没有为这首诗登记生字词。可以点击“编辑”把生字词放进释义库哦！
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Sentence-by-Sentence Breakdown */}
        {activeTab === "tab3" && (
          <div className="space-y-6">
            <h4 className="font-serif font-bold text-[#5A5A40] flex items-center gap-1.5">
              <span className="w-1.5 h-4 bg-[#5A5A40] rounded"></span>
              逐句精读剖析
            </h4>

            {poem.sentences_json && poem.sentences_json.length > 0 ? (
              <div className="space-y-5">
                {poem.sentences_json.map((sent, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-[#E5E5DF] rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row gap-4 md:items-start"
                  >
                    {/* Index block */}
                    <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                      {idx + 1}
                    </div>

                    {/* Sentence body */}
                    <div className="flex-1 space-y-4">
                      {/* Main original text */}
                      <div>
                        <span className="text-xs font-bold text-[#5A5A40] block font-sans tracking-wide">
                          [{sent.pinyin || "未配音标"}]
                        </span>
                        <h5 className="text-xl font-bold font-serif text-stone-950 mt-0.5">
                          {sent.text}
                        </h5>
                      </div>

                      {/* Details row layout */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#E5E5DF] pt-3.5 text-sm">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-stone-500 block">白话白话：</span>
                          <p className={`text-stone-800 ${getFontSizeClass("body")}`}>
                            {sent.translation || "暂无翻译"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-stone-500 block">脑海画面：</span>
                          <p className={`text-stone-800 ${getFontSizeClass("body")}`}>
                            {sent.scene || "暂无画面"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-stone-500 block">诗人心境：</span>
                          <p className={`text-stone-800 ${getFontSizeClass("body")}`}>
                            {sent.mood || "暂无心境"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-stone-50 rounded-xl border border-[#E5E5DF] text-stone-400 text-sm">
                尚未登记逐句讲解。点击“编辑”并使用“自动拆句”，即可添加精读内容。
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Recitation Challenge */}
        {activeTab === "tab4" && (
          <div className="space-y-8 max-w-xl mx-auto">
            {/* Header / Instructions */}
            <div className="text-center space-y-2">
              <h4 className="text-lg font-bold font-serif text-[#5A5A40]">
                ⭐ 艾宾浩斯渐进式背诵挑战 ⭐
              </h4>
              <p className="text-stone-500 text-xs">
                通过科学的逐级遮挡遮蔽，一步步在脑海里背诵，记得更牢固哦！
              </p>
            </div>

            {/* Stages Grid selectors */}
            <div className="grid grid-cols-5 gap-1.5 bg-stone-100/80 border border-[#E5E5DF] p-1 rounded-xl">
              <button
                onClick={() => setChallengeStage(0)}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  challengeStage === 0 ? "bg-[#5A5A40] text-white shadow" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                0. 全文
              </button>
              <button
                onClick={() => setChallengeStage(1)}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  challengeStage === 1 ? "bg-[#5A5A40] text-white shadow" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                1. 遮前字
              </button>
              <button
                onClick={() => setChallengeStage(2)}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  challengeStage === 2 ? "bg-[#5A5A40] text-white shadow" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                2. 遮后半
              </button>
              <button
                onClick={() => setChallengeStage(3)}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  challengeStage === 3 ? "bg-[#5A5A40] text-white shadow" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                3. 首字提示
              </button>
              <button
                onClick={() => setChallengeStage(4)}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  challengeStage === 4 ? "bg-[#5A5A40] text-white shadow" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                4. 默写模式
              </button>
            </div>

            {/* Occluded Poem Body */}
            <div className="bg-[#FDFBF7] border border-[#E5E5DF] rounded-3xl p-8 shadow-inner relative flex flex-col items-center justify-center space-y-6">
              <div className="absolute top-3 left-3 text-[10px] text-[#5A5A40] bg-[#5A5A40]/10 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>🙈 表示遮住的字</span>
              </div>

              {/* Show Poem */}
              <div className="space-y-4 text-center font-serif font-bold tracking-widest text-[#2C2C2C] leading-loose">
                {poem.sentences_json && poem.sentences_json.length > 0 ? (
                  poem.sentences_json.map((sent, index) => (
                    <div key={index} className={getFontSizeClass("poem")}>
                      {renderOccludedSentence(sent.text)}
                    </div>
                  ))
                ) : (
                  <div className={getFontSizeClass("poem")}>
                    {poem.raw_text}
                  </div>
                )}
              </div>

              {/* Hint button playing audio_url */}
              {poem.audio_url && (
                <button
                  onClick={toggleAudio}
                  id="btn-play-hint"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5A5A40]/10 border border-[#5A5A40]/25 text-[#5A5A40] hover:bg-[#5A5A40]/20 rounded-xl text-xs font-semibold transition-all mt-4"
                >
                  <Volume2 size={14} className={audioPlaying ? "animate-bounce" : ""} />
                  {audioPlaying ? "暂停朗读提示" : "播放语音朗读提示"}
                </button>
              )}
            </div>

            {/* Completion / Ebbinghaus Marker */}
            <div className="bg-[#4A6B53]/5 border border-[#4A6B53]/20 rounded-2xl p-5 text-center space-y-4">
              <div className="space-y-1">
                <h5 className="font-bold text-[#4A6B53] font-serif flex items-center justify-center gap-1.5 text-base">
                  <CheckCircle className="text-[#4A6B53] fill-[#4A6B53]/10" size={20} />
                  我已经能够流利背诵啦！
                </h5>
                <p className="text-[#4A6B53]/80 text-xs">
                  标记已背会后，系统将开启「艾宾浩斯复习计划」，分别于第 2 天、第 4 天、第 7 天自动把这首古诗置顶提醒你复习哦！
                </p>
              </div>

              <button
                onClick={() => poem.id && onMarkMastered(poem.id)}
                id="btn-mark-mastered"
                className="w-full py-3 bg-[#4A6B53] hover:bg-[#3D5944] active:bg-[#314736] text-white font-bold rounded-xl shadow-sm transition-all text-sm tracking-wide"
              >
                标记已背会 (自动启动复习提醒)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
