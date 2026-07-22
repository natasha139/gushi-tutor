export interface Sentence {
  text: string;
  pinyin: string;
  translation: string;
  scene: string;
  mood: string;
}

export interface Word {
  word: string;
  pinyin: string;
  meaning: string;
}

export interface Poem {
  id?: number;
  title: string;
  author: string;
  raw_text: string;
  sentences_json: Sentence[]; // We will parse/stringify this in the API Layer
  background: string;
  empathy: string;
  words_json: Word[]; // We will parse/stringify this in the API Layer
  audio_url: string;
  video_url: string;
  mastered: boolean;
  review_stage: number; // 0=未背, 1=第2天, 2=第4天, 3=第7天
  last_review: number | null; // Timestamp
  created_at: number; // Timestamp
  isDue?: boolean;
}
