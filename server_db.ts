import fs from "fs";
import path from "path";
import { Poem, Sentence, Word } from "./src/types";

const DB_PATH = path.join(process.cwd(), "poems.json");

// High-quality seed data with complete fields for children
const SEED_POEMS: Poem[] = [
  {
    id: 1,
    title: "静夜思",
    author: "李白",
    raw_text: "床前明月光，疑是地上霜。\n抬头望明月，低头思故乡。",
    sentences_json: [
      {
        text: "床前明月光",
        pinyin: "chuáng qián míng yuè guāng",
        translation: "明亮的月光洒在床前。",
        scene: "诗人的床前铺满了银白色的月光，亮晃晃的。",
        mood: "安静、祥和"
      },
      {
        text: "疑是地上霜",
        pinyin: "yí shì dì shàng shuāng",
        translation: "好像是地上铺了一层洁白的秋霜。",
        scene: "地板白茫茫一片，冷冰冰的，像冬天结的霜一样。",
        mood: "孤单、清冷"
      },
      {
        text: "抬头望明月",
        pinyin: "tái tóu wàng míng yuè",
        translation: "我抬起头来，看着夜空中那轮又圆又亮的明月。",
        scene: "诗人推开窗户，抬起头，凝视着夜空中圆圆的月亮。",
        mood: "向往、期盼"
      },
      {
        text: "低头思故乡",
        pinyin: "dī tóu sī gù xiāng",
        translation: "低下头来，心里深深地想念起遥远的家乡和亲人。",
        scene: "诗人慢慢低下头，闭上眼睛，脑海里全是爸爸妈妈和童年的玩伴。",
        mood: "难过、思念"
      }
    ],
    background: "这首诗是李白在秋天的夜晚，住在客栈里时写的。当时他离开家乡很久了，一个人在外面旅行。晚上睡不着，看到窗外美丽的月光，就想起了自己的家乡和亲人。",
    empathy: "就像我们第一次去外地夏令营，或者在寄宿学校，晚上睡觉前看见月亮，突然好想家、好想爸爸妈妈一样。李白当时也是这样想家的哦！",
    words_json: [
      { word: "疑", pinyin: "yí", meaning: "好像，以为。这里是说把月光当成了地上的霜。" },
      { word: "思", pinyin: "sī", meaning: "思念，想念。" },
      { word: "霜", pinyin: "shuāng", meaning: "秋天或冬天贴在地面、草叶上的白色冰晶，亮晶晶的、冷冷的。" }
    ],
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    video_url: "https://player.bilibili.com/player.html?bvid=BV19y4y1t7uC",
    mastered: false,
    review_stage: 0,
    last_review: null,
    created_at: Date.now() - 3600000 * 24 * 3 // Created 3 days ago to simulate review trigger
  },
  {
    id: 2,
    title: "咏鹅",
    author: "骆宾王",
    raw_text: "鹅，鹅，鹅，曲项向天歌。\n白毛浮绿水，红掌拨清波。",
    sentences_json: [
      {
        text: "鹅，鹅，鹅",
        pinyin: "é, é, é",
        translation: "大鹅，大鹅，大鹅！",
        scene: "池塘边有一群可爱的大白鹅在欢快地叫着，吸引了小朋友的注意。",
        mood: "欢快、惊喜"
      },
      {
        text: "曲项向天歌",
        pinyin: "qū xiàng xiàng tiān gē",
        translation: "弯曲着脖子，朝着天空欢快地唱歌。",
        scene: "大白鹅伸长了弯弯的脖子，挺起胸脯，仰着头向天发出‘嘎嘎’的叫声，好像在唱歌。",
        mood: "神气、得意"
      },
      {
        text: "白毛浮绿水",
        pinyin: "bái máo fú lǜ shuǐ",
        translation: "洁白的羽毛漂浮在碧绿的池水上。",
        scene: "大白鹅身上雪白的羽毛在绿莹莹的清澈水面上漂着，黑白分明，特别好看。",
        mood: "优美、平静"
      },
      {
        text: "红掌拨清波",
        pinyin: "hóng zhǎng bō qīng bō",
        translation: "红红的脚掌在清澈的水波里划动。",
        scene: "在绿水下方，红红的双脚像小桨一样，一下一下拨动着清清的水波，漾起一圈圈涟漪。",
        mood: "活泼、有趣"
      }
    ],
    background: "相传这首诗是唐代诗人骆宾王在只有七岁的时候写的。当时他家门口有一个池塘，池塘里养了许多大白鹅。有一天来了一位客人，想考考他，他就立刻写下了这首充满童趣的诗。",
    empathy: "七岁的小朋友就能写出这么棒的诗，因为他非常仔细地观察了身边的动物！我们在写小作文的时候，也可以学学小骆宾王，把小狗小猫的颜色、声音、动作都写下来，你也能成为小诗人！",
    words_json: [
      { word: "曲项", pinyin: "qū xiàng", meaning: "弯曲的脖子。项指的是脖子后面。" },
      { word: "歌", pinyin: "gē", meaning: "这里指大白鹅‘嘎嘎’的叫声，听起来就像唱歌一样。" },
      { word: "拨", pinyin: "bō", meaning: "划动，拨开。" }
    ],
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    video_url: "https://player.bilibili.com/player.html?bvid=BV1vY411G7W5",
    mastered: false,
    review_stage: 0,
    last_review: null,
    created_at: Date.now() - 3600000 * 24 * 5
  },
  {
    id: 3,
    title: "登鹳雀楼",
    author: "王之涣",
    raw_text: "白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。",
    sentences_json: [
      {
        text: "白日依山尽",
        pinyin: "bái rì yī shān jìn",
        translation: "太阳依傍着山峦慢慢落下去了。",
        scene: "站在高楼上往远处看，一轮金黄色的落日正贴着远处的连绵群山，一点一点落下去，直到看不见。",
        mood: "壮阔、不舍"
      },
      {
        text: "黄河入海流",
        pinyin: "huáng hé rù hǎi liú",
        translation: "黄河之水滚滚流向浩瀚的大海。",
        scene: "低头看脚下，黄澄澄的黄河水波涛汹涌，像一条巨龙一样奔腾呼啸着，向着东方的大海流去。",
        mood: "雄浑、奔放"
      },
      {
        text: "欲穷千里目",
        pinyin: "yù qióng qiān lǐ mù",
        translation: "如果想要看到最远最宽广的风景。",
        scene: "诗人心里想，我想看得更远，想把千里之外、天边最美丽的景色都看个够。",
        mood: "期待、向往"
      },
      {
        text: "更上一层楼",
        pinyin: "gèng shàng yī céng lóu",
        translation: "那就要再往上登上一层高楼。",
        scene: "诗人迈开坚定的脚步，转过身，继续向着更高的一层楼梯登上去。",
        mood: "积极、上进"
      }
    ],
    background: "鹳雀楼是一座非常出名的高楼。王之涣登上这座高楼，看到落日和黄河的壮丽景色，心情非常澎湃。他意识到，只有站得高，才能看得远，于是写下了这首千古名诗，鼓励大家不断努力。",
    empathy: "这首诗告诉我们一个非常棒的学习秘诀：‘更上一层楼’。就像我们学数学、练钢琴，虽然现在已经很不错了，但如果能多坚持一下、多克服一个困难，就能看到更神奇、更美丽的世界！",
    words_json: [
      { word: "白日", pinyin: "bái rì", meaning: "指落日。因为傍晚的太阳光芒收敛，看起来呈白色或淡黄色。" },
      { word: "依", pinyin: "yī", meaning: "依傍，靠着。" },
      { word: "尽", pinyin: "jìn", meaning: "消失，落下去。" },
      { word: "欲", pinyin: "yù", meaning: "想要。" },
      { word: "穷", pinyin: "qióng", meaning: "尽，达到极限。这里是看尽、看透的意思。" }
    ],
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    video_url: "https://player.bilibili.com/player.html?bvid=BV16b4y1R7g2",
    mastered: false,
    review_stage: 0,
    last_review: null,
    created_at: Date.now() - 3600000 * 2
  }
];

export function getDbPoems(): Poem[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(SEED_POEMS, null, 2), "utf-8");
      return SEED_POEMS;
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read database, returning seeds", error);
    return SEED_POEMS;
  }
}

export function saveDbPoems(poems: Poem[]) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(poems, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save database", error);
  }
}

export function getPoemById(id: number): Poem | undefined {
  const poems = getDbPoems();
  return poems.find((p) => p.id === id);
}

export function addPoem(poemData: Omit<Poem, "id" | "mastered" | "review_stage" | "last_review" | "created_at">): Poem {
  const poems = getDbPoems();
  const nextId = poems.length > 0 ? Math.max(...poems.map((p) => p.id || 0)) + 1 : 1;
  const newPoem: Poem = {
    ...poemData,
    id: nextId,
    mastered: false,
    review_stage: 0,
    last_review: null,
    created_at: Date.now()
  };
  poems.push(newPoem);
  saveDbPoems(poems);
  return newPoem;
}

export function updatePoem(id: number, updatedFields: Partial<Poem>): Poem | undefined {
  const poems = getDbPoems();
  const idx = poems.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;

  poems[idx] = { ...poems[idx], ...updatedFields };
  saveDbPoems(poems);
  return poems[idx];
}

export function deletePoem(id: number): boolean {
  const poems = getDbPoems();
  const initialLength = poems.length;
  const filtered = poems.filter((p) => p.id !== id);
  if (filtered.length === initialLength) return false;
  saveDbPoems(filtered);
  return true;
}

// Check Ebbinghaus review requirements based on intervals
// review_stage intervals:
// 1 = Review on Day 2 (approx 1 day / 24 hours later)
// 2 = Review on Day 4 (approx 3 days / 72 hours later)
// 3 = Review on Day 7 (approx 6 days / 144 hours later)
// Returns true if review is due based on last_review and review_stage
export function isPoemDueForReview(poem: Poem): boolean {
  if (!poem.mastered) {
    // If not mastered yet, it's not on the Ebbinghaus curve, but if it has never been reviewed/mastered
    // we can keep its stage as 0. Once mastered is set to true, review_stage becomes 1, last_review is recorded.
    return false;
  }

  if (poem.last_review === null) {
    return true; // Should review immediately if mastered but never reviewed
  }

  const elapsedMs = Date.now() - poem.last_review;
  const elapsedDays = elapsedMs / (3600000 * 24);

  // Ebbinghaus intervals based on user specs (0=un-mastered/initial, 1=Day 2, 2=Day 4, 3=Day 7)
  // Stage 1 -> Stage 2: Requires 1 day elapsed
  // Stage 2 -> Stage 3: Requires 2 additional days (total 3 days from previous or 4 days elapsed)
  // Stage 3 -> Finished/No longer due: Requires 3 additional days (total 7 days elapsed)
  if (poem.review_stage === 1) {
    return elapsedDays >= 1; // Due on 2nd day
  } else if (poem.review_stage === 2) {
    return elapsedDays >= 3; // Due on 4th day (3 days after last review)
  } else if (poem.review_stage === 3) {
    return elapsedDays >= 3; // Due on 7th day (3 days after last review)
  }

  return false; // Stage 4+ or 0 (if stage is somehow not 1,2,3 or already mastered fully)
}
