import React from "react";
import { Poem } from "../types";
import { BookOpen, Star, Calendar, Plus, ChevronRight, GraduationCap, RefreshCw, Trash2, Edit2, Award, Lock, ShieldCheck } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface PoemListProps {
  poems: Poem[];
  onSelectPoem: (id: number) => void;
  onAddPoem: () => void;
  onEditPoem: (id: number) => void;
  onDeletePoem: (id: number) => void;
  fontSizeClass: string;
}

export default function PoemList({
  poems,
  onSelectPoem,
  onAddPoem,
  onEditPoem,
  onDeletePoem,
  fontSizeClass
}: PoemListProps) {
  // Separate into due for review and others
  const duePoems = poems.filter((p) => p.isDue && p.mastered && p.review_stage < 4);
  const masteredPoems = poems.filter((p) => p.mastered && !p.isDue);
  const unmasteredPoems = poems.filter((p) => !p.mastered);

  const totalPoems = poems.length;
  const masteredCount = poems.filter((p) => p.mastered).length;
  const fullyMasteredCount = poems.filter((p) => p.mastered && p.review_stage >= 4).length;
  const reviewingCount = poems.filter((p) => p.mastered && p.review_stage < 4).length;
  const unmasteredCount = poems.filter((p) => !p.mastered).length;

  const masteredPercent = totalPoems > 0 ? Math.round((masteredCount / totalPoems) * 100) : 0;
  const fullyMasteredPercent = totalPoems > 0 ? Math.round((fullyMasteredCount / totalPoems) * 100) : 0;

  // Medals/Badges state & database
  const [selectedMedal, setSelectedMedal] = React.useState<any | null>(null);

  const medals = [
    {
      id: "first_poem",
      name: "小试锋芒",
      description: "背会 1 首古诗",
      icon: "🎒",
      unlocked: masteredCount >= 1,
      currentValue: masteredCount,
      targetValue: 1,
      unit: "首",
      tier: "bronze" as const,
      origin: "“千里之行，始于足下。” ——《老子》",
      story: "走一千里的路，也是从脚下的第一步开始的。做学问、背古诗也是如此，今天你完成了第一首古诗的背诵，开启了你的智慧旅程！",
      encouragement: "小书童为你鼓掌！继续坚持，你就是最棒的小学者！"
    },
    {
      id: "review_today",
      name: "温故知新",
      description: "完成今日全部艾宾浩斯温习",
      icon: "✨",
      unlocked: masteredCount > 0 && duePoems.length === 0,
      currentValue: (masteredCount > 0 && duePoems.length === 0) ? 1 : 0,
      targetValue: 1,
      unit: "次",
      tier: "special" as const,
      origin: "“温故而知新，可以为师矣。” ——《论语·为政》",
      story: "经常温习已经学过的知识，从中获得新的体会和理解，这样的人就可以做老师了。古诗背过容易忘，但你今天完成了所有规划的艾宾浩斯复习，做得太棒了！",
      encouragement: "温故如春雨润物，坚持复习是成为记忆大师的绝招哦！"
    },
    {
      id: "tree_growing",
      name: "茁壮成长",
      description: "拥有 1 首进入巩固期的诗歌",
      icon: "🌱",
      unlocked: poems.some((p) => p.mastered && p.review_stage >= 3),
      currentValue: poems.some((p) => p.mastered && p.review_stage >= 3) ? 1 : 0,
      targetValue: 1,
      unit: "棵",
      tier: "silver" as const,
      origin: "“十年树木，百年树人。” ——《管子·权修》",
      story: "培育一棵树需要十年的时间，而培养一个人才需要百年的努力。你的古诗词记忆像一棵茁壮成长的幼苗，经过多次复习的辛勤浇灌，终于生根发芽长成了挺拔的小树！",
      encouragement: "看着脑海里的记忆小树慢慢长大，是不是成就感满满呢？"
    },
    {
      id: "persistent_review",
      name: "持之以恒",
      description: "至少有2首诗同时在温习中",
      icon: "🛡️",
      unlocked: reviewingCount >= 2,
      currentValue: reviewingCount,
      targetValue: 2,
      unit: "首",
      tier: "silver" as const,
      origin: "“锲而不舍，金石可镂。” ——《荀子·劝学》",
      story: "如果雕刻一件物品能一直坚持不停手，即使是坚硬的金石也能雕刻出美丽的图案。背诵多首古诗时，会有不同的复习提醒。你能耐心应对温习，就是这种金石精神！",
      encouragement: "坚持就是胜利，小书童会一直陪伴你打卡复习！"
    },
    {
      id: "master_five",
      name: "学富五车",
      description: "累计背会 5 首古诗",
      icon: "📜",
      unlocked: masteredCount >= 5,
      currentValue: masteredCount,
      targetValue: 5,
      unit: "首",
      tier: "silver" as const,
      origin: "“惠施多方，其书五车。” ——《庄子·天下》",
      story: "古时候的书是写在厚重的竹简上的，“学富五车”形容读书极多、学问极深。你已经背会了5首古诗，脑海里的知识已经能装满小车子啦！",
      encouragement: "哇！5首古诗已熟记于心，小学者已经初露锋芒了！"
    },
    {
      id: "forest_completed",
      name: "独木成林",
      description: "拥有2首彻底掌握的大树诗歌",
      icon: "🌳",
      unlocked: fullyMasteredCount >= 2,
      currentValue: fullyMasteredCount,
      targetValue: 2,
      unit: "棵",
      tier: "gold" as const,
      origin: "“独木不成林，单弦不成音。” —— 俗语",
      story: "一棵树不能叫作森林。当你有好几首古诗都经历了完整的艾宾浩斯复习、长成了彻底掌握的“参天大树”时，它们就在你的脑海中连成了一片充满智慧的翠绿森林！",
      encouragement: "大树已扎根脑海！快来灌溉更多树木，造就属于你的诗词森林吧！"
    },
    {
      id: "broad_library",
      name: "博古通今",
      description: "诗歌库收录总数达到6首",
      icon: "🏮",
      unlocked: totalPoems >= 6,
      currentValue: totalPoems,
      targetValue: 6,
      unit: "首",
      tier: "special" as const,
      origin: "“博观而约取，厚积而薄发。” —— 苏轼",
      story: "苏轼说，只有广泛地阅读、积累丰厚的知识，在表达或应用时才能得心应手。诗集库越丰富，能领略的诗意就越广阔。收录超过6首古诗，说明你有一颗热爱探索的心！",
      encouragement: "诗库越满，才思越涌！继续添加喜欢的诗歌吧！"
    },
    {
      id: "poet_immortal",
      name: "诗仙下凡",
      description: "累计背会 10 首古诗",
      icon: "🍶",
      unlocked: masteredCount >= 10,
      currentValue: masteredCount,
      targetValue: 10,
      unit: "首",
      tier: "gold" as const,
      origin: "“笔落惊风雨，诗成泣鬼神。” —— 杜甫赞李白",
      story: "大家都叫李白“诗仙”，夸他写起诗来才华横溢、超凡脱俗。你竟然背会了10首古诗，出口成章、才情如泉，简直就像小诗仙降临！",
      encouragement: "天哪！10首古诗！小书童对你的敬佩之情犹如滔滔江水，你就是我们的小诗仙！"
    }
  ];

  const unlockedCount = medals.filter((m) => m.unlocked).length;

  // Calculate cumulative study days dynamically
  const studyDaysCount = React.useMemo(() => {
    const dates = new Set<string>();
    
    // 1. Recover from localStorage tracking if available
    try {
      const stored = localStorage.getItem("study_dates");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((d) => dates.add(d));
        }
      }
    } catch (e) {
      console.error(e);
    }
    
    // Always include today
    const todayStr = new Date().toLocaleDateString();
    dates.add(todayStr);
    
    // Sync back to localStorage
    try {
      localStorage.setItem("study_dates", JSON.stringify(Array.from(dates)));
    } catch (e) {
      console.error(e);
    }

    // 2. Scan all poems' created_at and last_review timestamps
    poems.forEach((p) => {
      if (p.created_at) {
        dates.add(new Date(p.created_at).toLocaleDateString());
      }
      if (p.last_review) {
        dates.add(new Date(p.last_review).toLocaleDateString());
      }
    });

    return dates.size;
  }, [poems]);

  const hasData = totalPoems > 0;
  const chartData = hasData
    ? [
        { name: "已掌握 (已背会)", value: masteredCount, color: "#4A6B53" },
        { name: "未掌握 (未背诵)", value: unmasteredCount, color: "#E5E5DF" }
      ]
    : [{ name: "暂无诗歌", value: 1, color: "#F0F0EE" }];

  const getStageLabel = (stage: number) => {
    switch (stage) {
      case 0: return "未开始背诵";
      case 1: return "第 2 天复习 (艾宾浩斯)";
      case 2: return "第 4 天复习 (艾宾浩斯)";
      case 3: return "第 7 天复习 (艾宾浩斯)";
      case 4: return "已彻底掌握 ✨";
      default: return `复习中 (阶段 ${stage})`;
    }
  };

  const getNextReviewTime = (p: Poem) => {
    if (!p.mastered || !p.last_review) return "无";
    const elapsedMs = Date.now() - p.last_review;
    const elapsedDays = elapsedMs / (3600000 * 24);

    let targetDays = 0;
    if (p.review_stage === 1) targetDays = 1;
    else if (p.review_stage === 2) targetDays = 3;
    else if (p.review_stage === 3) targetDays = 3;

    if (p.review_stage >= 4) return "已掌握";

    const remainingDays = targetDays - elapsedDays;
    if (remainingDays <= 0) {
      return "现在就需要复习哦！";
    }
    return `约 ${Math.ceil(remainingDays)} 天后`;
  };

  const getGrowthState = (p: Poem) => {
    if (!p.mastered) {
      return {
        emoji: "🫘",
        label: "记忆之种",
        desc: "尚未开始背诵，期待您的播种与萌发",
        color: "bg-stone-50 text-stone-500 border-stone-200",
        stage: 0
      };
    }
    switch (p.review_stage) {
      case 1:
        return {
          emoji: "🌱",
          label: "破土萌芽",
          desc: "萌芽阶段：已完成背诵并通过首次记忆验证",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          stage: 1
        };
      case 2:
        return {
          emoji: "🌿",
          label: "茁壮幼苗",
          desc: "幼苗阶段：已顺利完成第 2 天温习巩固",
          color: "bg-teal-50 text-teal-700 border-teal-200",
          stage: 2
        };
      case 3:
        return {
          emoji: "🌳",
          label: "亭亭小树",
          desc: "成长阶段：已顺利完成第 4 天温习巩固",
          color: "bg-green-50 text-green-700 border-green-200",
          stage: 3
        };
      case 4:
      default:
        return {
          emoji: "🌲",
          label: "参天大树",
          desc: "成熟阶段：已顺利完成第 7 天复习，彻底掌握",
          color: "bg-[#4A6B53]/10 text-[#4A6B53] border-[#4A6B53]/20",
          stage: 4
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative bg-[#5A5A40]/5 border-2 border-[#5A5A40]/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
          <GraduationCap size={240} className="text-[#5A5A40]" />
        </div>
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#5A5A40]/10 border border-[#5A5A40]/20 rounded-full text-[#5A5A40] text-xs font-semibold">
            <Star size={12} className="fill-[#5A5A40] text-[#5A5A40]" />
            快乐学古诗
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#5A5A40] font-serif">
            小书童，今天想学哪首古诗呀？
          </h2>
          <p className="text-stone-600 text-sm md:text-base max-w-xl font-serif">
            跟着艾宾浩斯记忆法，每天坚持复习，你也可以成为记忆力超群的“诗仙”！
          </p>
        </div>
        <button
          onClick={onAddPoem}
          id="btn-add-poem-top"
          className="relative z-10 self-start md:self-center flex items-center gap-2 px-5 py-3 bg-[#5A5A40] hover:bg-[#484833] active:bg-[#3a3a2a] text-white font-semibold rounded-lg shadow-sm transition-all duration-200"
        >
          <Plus size={20} />
          增加新古诗
        </button>
      </div>

      {/* 每日待复习与背诵统计网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: 每日待复习 (2/3) */}
        <div className="lg:col-span-2 bg-white border-2 border-[#5A5A40]/20 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5DF] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
                  <RefreshCw size={22} className={duePoems.length > 0 ? "animate-spin-slow" : ""} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold font-serif text-[#5A5A40] flex items-center gap-2">
                    每日待复习
                    {duePoems.length > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#5A5A40] text-white">
                        {duePoems.length}首待温习
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#4A6B53]/10 text-[#4A6B53] border border-[#4A6B53]/25">
                        今日已完成
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 font-serif">
                    基于德国艾宾浩斯遗忘曲线，每天智能规划黄金记忆点，帮您牢固掌握诗词！
                  </p>
                </div>
              </div>
              {duePoems.length > 0 && (
                <div className="text-xs text-[#5A5A40] bg-[#5A5A40]/5 px-3 py-1.5 rounded-lg border border-[#5A5A40]/15 font-serif font-semibold self-start sm:self-auto">
                  今日复习达成率：{Math.round(((poems.filter(p => p.mastered && p.review_stage >= 4).length) / Math.max(1, poems.filter(p => p.mastered).length)) * 100)}% 彻底掌握
                </div>
              )}
            </div>

            <div className="mt-6">
              {duePoems.length > 0 ? (
                <div className="divide-y divide-[#E5E5DF]">
                  {duePoems.map((poem, index) => (
                    <div
                      key={poem.id}
                      className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        index === 0 ? "pt-0" : ""
                      } ${index === duePoems.length - 1 ? "pb-0" : ""}`}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-bold text-stone-900 font-serif">
                            《{poem.title}》
                          </h4>
                          <span className="text-xs text-stone-500 font-serif italic">[{poem.author}]</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded">
                            艾氏复习阶段 {poem.review_stage}
                          </span>
                        </div>
                        
                        <p className="text-stone-600 text-xs line-clamp-1 italic font-serif pl-3 border-l-2 border-[#5A5A40]/30">
                          {poem.raw_text.replace(/\n/g, " ")}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-stone-400 font-serif hidden md:inline">
                          上次复习：{poem.last_review ? new Date(poem.last_review).toLocaleDateString() : "从未"}
                        </span>
                        <button
                          onClick={() => poem.id && onSelectPoem(poem.id)}
                          id={`btn-review-${poem.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] active:bg-[#3a3a2a] text-white font-medium rounded-lg text-xs shadow-sm transition-all self-end sm:self-auto"
                        >
                          开始复习
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4 text-stone-600 py-4">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-[#4A6B53] flex items-center justify-center flex-shrink-0 border border-green-100">
                    <Star size={24} className="fill-green-100" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold font-serif text-stone-900 text-sm">今日温故已功德圆满！</h4>
                    <p className="text-xs text-stone-500 leading-relaxed font-serif">
                      太棒了！今天小书童没有待复习的诗歌。系统会全天候自动监控您的背诵情况。
                      <br />
                      您可以去下方的“我的诗歌库”挑选一首新古诗开始学习，或温习已经背会的诗词来保持好状态。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 统计摘要 (1/3) */}
        <div className="bg-white border-2 border-[#5A5A40]/20 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden space-y-6">
          <div className="border-b border-[#E5E5DF] pb-4">
            <h3 className="text-lg md:text-xl font-bold font-serif text-[#5A5A40] flex items-center gap-2">
              <GraduationCap size={22} />
              背诵学习统计
            </h3>
            <p className="text-xs text-stone-500 mt-1 font-serif">
              实时追踪您的古诗词掌握进度，每一次努力都清晰可见！
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-4 font-serif">
            <div className="bg-[#5A5A40]/5 border border-[#5A5A40]/10 rounded-xl p-3 flex flex-col justify-between space-y-1">
              <div className="flex items-center justify-between text-stone-500 text-xs">
                <span>累计学习</span>
                <Calendar size={14} className="text-amber-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#5A5A40]">{studyDaysCount}</span>
                <span className="text-xs text-stone-500">天</span>
              </div>
              <div className="text-[9px] text-stone-400 leading-none">坚持就是胜利 🌱</div>
            </div>
            
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex flex-col justify-between space-y-1">
              <div className="flex items-center justify-between text-stone-500 text-xs">
                <span>已掌握诗歌</span>
                <BookOpen size={14} className="text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-emerald-700">{masteredCount}</span>
                <span className="text-xs text-emerald-600/80">首</span>
              </div>
              <div className="text-[9px] text-stone-400 leading-none">学富五车 📜</div>
            </div>
          </div>

          {/* Recharts Circular Ring - 已掌握 vs 未掌握 */}
          <div className="relative flex flex-col items-center justify-center py-2 bg-stone-50/50 rounded-xl border border-stone-100 p-4">
            <div className="text-xs font-serif font-bold text-[#5A5A40] mb-2">已掌握 vs 未掌握 比例</div>
            <div className="w-36 h-36 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={62}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any) => [`${value} 首`, name]}
                    contentStyle={{ borderRadius: "8px", borderColor: "#E5E5DF", fontFamily: "serif", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Centered text inside the ring */}
            <div className="absolute top-[80px] text-center flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-serif text-[#4A6B53] leading-none">
                {masteredPercent}%
              </span>
              <span className="text-[10px] text-stone-500 font-serif mt-1">已掌握比例</span>
            </div>
          </div>

          {/* Indicators list */}
          <div className="space-y-3 font-serif">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4A6B53]"></span>
                <span className="text-stone-700 font-semibold">已掌握 (已背会)</span>
              </div>
              <span className="font-bold text-[#4A6B53]">{masteredCount}首 ({masteredPercent}%)</span>
            </div>
            
            {/* Mastered subsets details to keep user experience high-quality */}
            {masteredCount > 0 && (
              <div className="pl-4 border-l-2 border-stone-100 space-y-1.5 py-0.5">
                <div className="flex justify-between items-center text-[10px] text-stone-500">
                  <span>↳ 彻底掌握 (第4阶段)</span>
                  <span>{fullyMasteredCount}首</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-stone-500">
                  <span>↳ 温习巩固中 (第1-3阶段)</span>
                  <span>{reviewingCount}首</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5DF]"></span>
                <span className="text-stone-700 font-semibold">未掌握 (尚未开始)</span>
              </div>
              <span className="font-bold text-stone-500">{unmasteredCount}首 ({100 - masteredPercent}%)</span>
            </div>
          </div>

          <div className="bg-[#5A5A40]/5 border border-[#5A5A40]/15 rounded-xl p-3 text-center">
            <p className="text-[11px] text-[#5A5A40] font-serif leading-relaxed">
              共录入 <span className="font-bold">{totalPoems}</span> 首古诗 • 累计已背会 <span className="font-bold text-[#4A6B53]">{masteredCount}</span> 首
            </p>
          </div>
        </div>
      </div>

      {/* 勋章荣誉墙 · 快乐成长记录 */}
      <div className="bg-white border-2 border-[#5A5A40]/20 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5DF] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Award size={24} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold font-serif text-[#5A5A40] flex items-center gap-2">
                我的古诗成就勋章墙
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white">
                  已解锁 {unlockedCount}/8
                </span>
              </h3>
              <p className="text-xs text-stone-500 mt-1 font-serif">
                背诵古诗词、坚持每日温习，解锁具有浓厚国学底蕴的专属勋章，点击可查看国学典故故事哦！
              </p>
            </div>
          </div>
          <div className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 font-serif font-semibold self-start sm:self-auto">
            小学者成长等级：{
              unlockedCount === 0 ? "初入师门 🌱" :
              unlockedCount <= 2 ? "勤学书童 📖" :
              unlockedCount <= 4 ? "资深学究 🎓" :
              unlockedCount <= 6 ? "诗书才子 🌟" :
              "一代诗仙 👑"
            }
          </div>
        </div>

        {/* Medals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {medals.map((medal) => {
            const isGold = medal.tier === "gold";
            const isSilver = medal.tier === "silver";
            const isSpecial = medal.tier === "special";

            return (
              <div
                key={medal.id}
                onClick={() => setSelectedMedal(medal)}
                className={`group relative p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-300 cursor-pointer select-none ${
                  medal.unlocked
                    ? isGold
                      ? "bg-amber-50/30 border-amber-300 hover:border-amber-400 hover:shadow-md hover:shadow-amber-100/40"
                      : isSilver
                      ? "bg-slate-50/40 border-slate-300 hover:border-slate-400 hover:shadow-md hover:shadow-slate-100/40"
                      : isSpecial
                      ? "bg-rose-50/20 border-rose-200 hover:border-rose-300 hover:shadow-md hover:shadow-rose-100/30"
                      : "bg-emerald-50/20 border-emerald-200 hover:border-emerald-300 hover:shadow-md"
                    : "bg-stone-50/30 border-stone-200/80 opacity-60 hover:opacity-90 hover:border-stone-300"
                }`}
              >
                {/* Unlock status badge / lock icon */}
                <div className="absolute top-2 right-2">
                  {medal.unlocked ? (
                    <span className="text-amber-500" title="已解锁">
                      <ShieldCheck size={16} className="fill-amber-500/10" />
                    </span>
                  ) : (
                    <span className="text-stone-400" title="未解锁">
                      <Lock size={12} />
                    </span>
                  )}
                </div>

                {/* Big Medal Icon */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner transition-transform duration-300 group-hover:scale-110 ${
                  medal.unlocked
                    ? isGold
                      ? "bg-amber-100 border border-amber-200 animate-pulse-slow"
                      : isSilver
                      ? "bg-slate-100 border border-slate-200"
                      : isSpecial
                      ? "bg-rose-100 border border-rose-200"
                      : "bg-emerald-100 border border-emerald-200"
                    : "bg-stone-100 border border-stone-200 filter grayscale"
                }`}>
                  {medal.icon}
                </div>

                {/* Medal Name */}
                <h4 className={`text-xs md:text-sm font-bold font-serif ${
                  medal.unlocked ? "text-stone-800" : "text-stone-400"
                }`}>
                  {medal.name}
                </h4>

                {/* Progress bar and small label */}
                <div className="w-full mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] text-stone-500 font-serif px-1">
                    <span>进度</span>
                    <span>
                      {Math.min(medal.currentValue, medal.targetValue)}/{medal.targetValue} {medal.unit}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        medal.unlocked
                          ? isGold
                            ? "bg-amber-400"
                            : isSilver
                            ? "bg-slate-400"
                            : "bg-rose-400"
                          : "bg-stone-300"
                      }`}
                      style={{ width: `${Math.min(100, (medal.currentValue / medal.targetValue) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Unlock Help Text */}
                <p className="text-[10px] text-stone-400 font-serif mt-2 line-clamp-1">
                  {medal.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Poems Tabs / Grid */}
      <div className="space-y-6">
        <div className="border-b border-[#E5E5DF] pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold font-serif text-[#5A5A40] flex items-center gap-2">
            <BookOpen size={22} className="text-[#5A5A40]" />
            我的诗歌库（{poems.length}首）
          </h3>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-[#E5E5DF]/50 text-stone-600 border border-[#E5E5DF]">未背会: {unmasteredPoems.length}</span>
            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">复习中: {poems.filter(p => p.mastered && p.review_stage < 4).length}</span>
            <span className="px-2 py-1 rounded bg-green-50 text-green-700 border border-green-100">彻底掌握: {poems.filter(p => p.review_stage >= 4).length}</span>
          </div>
        </div>

        {poems.length === 0 ? (
          <div className="text-center py-12 bg-white/60 border border-dashed border-[#E5E5DF] rounded-2xl">
            <p className="text-stone-500 mb-4 font-serif">你的诗歌库现在空空如也，快来添加第一首古诗吧！</p>
            <button
              onClick={onAddPoem}
              id="btn-add-poem-empty"
              className="px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-lg inline-flex items-center gap-2"
            >
              <Plus size={18} />
              添加新古诗
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {poems.map((poem) => {
              const isDue = poem.isDue && poem.mastered && poem.review_stage < 4;
              return (
                <div
                  key={poem.id}
                  className={`bg-white border rounded-2xl flex flex-col justify-between overflow-hidden transition-all duration-200 group hover:-translate-y-1 hover:shadow-md ${
                    isDue
                      ? "border-rose-300 ring-4 ring-rose-50"
                      : poem.review_stage >= 4
                      ? "border-green-200"
                      : "border-[#E5E5DF]"
                  }`}
                >
                  {/* Card Header Banner */}
                  <div
                    className={`px-4 py-2.5 text-xs font-semibold flex justify-between items-center ${
                      isDue
                        ? "bg-rose-100 text-rose-800"
                        : poem.review_stage >= 4
                        ? "bg-green-100/80 text-green-800"
                        : poem.mastered
                        ? "bg-[#5A5A40]/10 text-[#5A5A40]"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    <span className="flex items-center gap-1.5" title={getGrowthState(poem).desc}>
                      <span className="text-base leading-none">{getGrowthState(poem).emoji}</span>
                      <span className="font-serif">成长树：{getGrowthState(poem).label}</span>
                    </span>
                    {poem.mastered && poem.review_stage < 4 && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        下轮复习: {getNextReviewTime(poem)}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-grow space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-xl font-bold text-stone-950 font-serif group-hover:text-[#5A5A40] transition-colors flex items-center gap-1.5">
                            《{poem.title}》
                          </h4>
                          <p className="text-stone-500 text-sm mt-0.5 font-serif italic">[{poem.author}]</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (poem.id) onEditPoem(poem.id);
                            }}
                            title="修改诗歌"
                            className="p-1.5 hover:bg-stone-100 text-stone-600 hover:text-stone-950 rounded-lg transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (poem.id) onDeletePoem(poem.id);
                            }}
                            title="删除诗歌"
                            className="p-1.5 hover:bg-rose-50 text-stone-600 hover:text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <p className="text-stone-600 text-sm line-clamp-2 leading-relaxed bg-[#FDFBF7] p-2.5 rounded-lg border border-[#E5E5DF] whitespace-pre-line font-serif">
                        {poem.raw_text}
                      </p>
                    </div>

                    {/* Growth Progress Line */}
                    <div className="pt-3 border-t border-[#E5E5DF]/60 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-stone-500 font-serif">
                        <span className="font-semibold text-stone-600 flex items-center gap-1">
                          <span>记忆成长树：</span>
                          <span className="text-[#5A5A40] inline-flex items-center gap-1 font-bold">
                            <span className="text-xs">{getGrowthState(poem).emoji}</span>
                            {getGrowthState(poem).label}
                          </span>
                        </span>
                        <span className="text-[10px] text-[#5A5A40] font-bold bg-[#5A5A40]/10 px-1.5 py-0.5 rounded">
                          {poem.review_stage}/4 阶段
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-stone-50/60 px-2 py-1.5 rounded-lg border border-stone-100/80">
                        {[0, 1, 2, 3, 4].map((s) => {
                          const currentStage = getGrowthState(poem).stage;
                          const isCurrent = currentStage === s;
                          const isPassed = currentStage >= s;
                          let emoji = "🫘";
                          if (s === 1) emoji = "🌱";
                          if (s === 2) emoji = "🌿";
                          if (s === 3) emoji = "🌳";
                          if (s === 4) emoji = "🌲";

                          return (
                            <div
                              key={s}
                              className="flex-1 flex flex-col items-center relative"
                              title={s === 0 ? "未背会" : `复习阶段 ${s}`}
                            >
                              <span className={`text-sm transition-transform duration-200 ${isCurrent ? "scale-125 z-10 font-normal" : isPassed ? "opacity-100" : "opacity-30 filter grayscale"}`}>
                                {emoji}
                              </span>
                              <div
                                className={`w-full h-1 mt-1 rounded-full ${
                                  isCurrent
                                    ? "bg-[#5A5A40]"
                                    : isPassed
                                    ? "bg-[#5A5A40]/50"
                                    : "bg-stone-200"
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="p-4 bg-stone-50/50 border-t border-[#E5E5DF] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {poem.mastered ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full">
                          已会背诵
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-stone-100 text-stone-600 border border-stone-200 rounded-full">
                          未会背诵
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => poem.id && onSelectPoem(poem.id)}
                      id={`btn-learn-main-${poem.id}`}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        isDue
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-[#5A5A40] hover:bg-[#484833] text-white shadow-sm"
                      }`}
                    >
                      {isDue ? "开始复习" : poem.mastered ? "继续巩固" : "开始学习"}
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Database Schema & Download helper */}
      <div className="bg-[#5A5A40]/5 border border-[#E5E5DF] rounded-xl p-5 space-y-2">
        <h4 className="font-semibold text-[#5A5A40] text-sm">💡 Cloudflare D1 数据库提示</h4>
        <p className="text-stone-600 text-xs leading-relaxed font-sans">
          本平台全面兼容 Cloudflare D1 / SQL 数据接口。您可以在本地进行新增、删除、背诵并触发自动的艾宾浩斯记忆追踪。我们为您准备好了 Cloudflare 创表 D1 SQL 文件：
        </p>
        <div className="flex justify-start">
          <a
            href="https://gushi-tutor-api.100170403natasha.workers.dev/api/d1-schema.sql"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5A5A40] hover:text-[#484833] text-xs font-semibold underline flex items-center gap-1"
          >
            查看 & 下载 D1 初始化 Schema.sql 文件
          </a>
        </div>
      </div>

      {/* Achievement Detail Modal */}
      {selectedMedal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-[#FDFBF7] border-4 border-[#5A5A40]/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative font-serif">
            {/* Top decorative classic border */}
            <div className="h-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-[#5A5A40]" />
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedMedal(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors text-lg"
              title="关闭"
            >
              ✕
            </button>

            <div className="p-6 md:p-8 space-y-6">
              {/* Medal Header */}
              <div className="text-center space-y-3">
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-5xl shadow-md ${
                  selectedMedal.unlocked
                    ? selectedMedal.tier === "gold"
                      ? "bg-amber-100 border-2 border-amber-300"
                      : selectedMedal.tier === "silver"
                      ? "bg-slate-100 border-2 border-slate-300"
                      : "bg-rose-100 border-2 border-rose-200"
                    : "bg-stone-100 border-2 border-stone-200 filter grayscale"
                }`}>
                  {selectedMedal.icon}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-[#5A5A40]">
                    {selectedMedal.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 mt-1">
                    {selectedMedal.unlocked ? (
                      <span className="text-amber-600 flex items-center gap-1 font-bold">
                        ★ 勋章已获得
                      </span>
                    ) : (
                      <span className="text-stone-400">🔒 达成进度: {Math.min(selectedMedal.currentValue, selectedMedal.targetValue)}/{selectedMedal.targetValue} {selectedMedal.unit}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Classical Origin Block */}
              <div className="bg-[#5A5A40]/5 border-l-4 border-[#5A5A40] p-4 rounded-r-xl space-y-1">
                <p className="text-[11px] text-stone-400 tracking-wider uppercase font-sans font-bold">国学典故出处</p>
                <blockquote className="text-sm text-stone-800 font-bold leading-relaxed italic">
                  {selectedMedal.origin}
                </blockquote>
              </div>

              {/* Story Description */}
              <div className="space-y-2">
                <h4 className="text-xs text-stone-400 font-sans font-bold tracking-wider uppercase">典故小知识</h4>
                <p className="text-xs md:text-sm text-stone-600 leading-relaxed text-justify">
                  {selectedMedal.story}
                </p>
              </div>

              {/* Encouragement Section */}
              <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl flex items-start gap-3">
                <span className="text-2xl">👦</span>
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-stone-800 font-sans">小书童寄语：</h5>
                  <p className="text-xs text-stone-500 leading-relaxed italic">
                    “{selectedMedal.encouragement}”
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedMedal(null)}
                  className="px-6 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
