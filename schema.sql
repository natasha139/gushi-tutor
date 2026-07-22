CREATE TABLE poems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  sentences_json TEXT NOT NULL,
  background TEXT,
  empathy TEXT,
  words_json TEXT,
  audio_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  mastered BOOLEAN DEFAULT FALSE,
  review_stage INTEGER DEFAULT 0,
  last_review INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);
