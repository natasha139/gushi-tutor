import fs from "node:fs";
import { validWeek, validPoemIds } from "./weekly-plan.js";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  getDbPoems,
  getPoemById,
  addPoem,
  updatePoem,
  deletePoem,
  isPoemDueForReview,
  saveDbPoems
} from "./server_db";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const planPath = path.join(process.cwd(), "weekly-plans.json");
  app.all("/api/weekly-plan", (req, res) => {
    const week = req.query.week;
    if (!validWeek(week)) return res.status(400).json({ error: "请选择有效的周一日期" });
    if (req.method !== "GET" && req.method !== "PUT") return res.sendStatus(405);
    try {
      const plans = fs.existsSync(planPath) ? JSON.parse(fs.readFileSync(planPath, "utf8")) : {};
      if (req.method === "PUT") {
        const ids = req.body?.poem_ids;
        if (!validPoemIds(ids)) return res.status(400).json({ error: "诗歌列表无效，最多选择200首" });
        const existing = new Set(getDbPoems().map(p => p.id));
        if (ids.some((id: number) => !existing.has(id))) return res.status(400).json({ error: "部分古诗已删除，请刷新后重试" });
        plans[week as string] = ids;
        fs.writeFileSync(planPath + ".tmp", JSON.stringify(plans, null, 2));
        fs.renameSync(planPath + ".tmp", planPath);
      }
      return res.json({ week_start: week, poem_ids: plans[week as string] || [] });
    } catch {
      return res.status(500).json({ error: "读写每周计划失败，请重试" });
    }
  });

  // API Route: Get all poems
  app.get("/api/poems", (req, res) => {
    try {
      const poems = getDbPoems();
      const poemsWithDue = poems.map((p) => ({
        ...p,
        isDue: isPoemDueForReview(p)
      }));
      res.json(poemsWithDue);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve poems" });
    }
  });

  // API Route: Get specific poem
  app.get("/api/poems/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const poem = getPoemById(id);
      if (!poem) {
        return res.status(404).json({ error: "Poem not found" });
      }
      res.json({
        ...poem,
        isDue: isPoemDueForReview(poem)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve poem" });
    }
  });

  // API Route: Add a poem
  app.post("/api/poems", (req, res) => {
    try {
      const {
        title,
        author,
        raw_text,
        sentences_json,
        background,
        empathy,
        words_json,
        audio_url,
        video_url,
        video_urls
      } = req.body;

      if (!title || !author || !raw_text) {
        return res.status(400).json({ error: "诗名、作者、原文为必填项" });
      }

      const newPoem = addPoem({
        title,
        author,
        raw_text,
        sentences_json: sentences_json || [],
        background: background || "",
        empathy: empathy || "",
        words_json: words_json || [],
        audio_url: audio_url || "",
        video_urls: video_urls || (video_url ? [video_url] : [])
      });

      res.status(210).json(newPoem);
    } catch (error) {
      res.status(500).json({ error: "Failed to create poem" });
    }
  });

  // API Route: Update a poem
  app.put("/api/poems/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = updatePoem(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Poem not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update poem" });
    }
  });

  // API Route: Delete a poem
  app.delete("/api/poems/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = deletePoem(id);
      if (!success) {
        return res.status(404).json({ error: "Poem not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete poem" });
    }
  });

  // API Route: Review / Mark Mastered
  app.post("/api/poems/:id/review", (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const poem = getPoemById(id);
      if (!poem) {
        return res.status(404).json({ error: "Poem not found" });
      }

      let nextStage = poem.review_stage;
      let isMastered = poem.mastered;

      if (!isMastered || nextStage === 0) {
        // First-time mastering
        isMastered = true;
        nextStage = 1; // 1 = Review tomorrow (Day 2)
      } else {
        // Next review stage (1 -> 2, 2 -> 3, 3 -> 4)
        nextStage = nextStage + 1;
      }

      const updated = updatePoem(id, {
        mastered: isMastered,
        review_stage: nextStage,
        last_review: Date.now()
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to record review" });
    }
  });

  // Serve D1 init SQL directly in case users want to download it
  app.get("/api/d1-schema.sql", (req, res) => {
    const d1Sql = `
CREATE TABLE poems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  sentences_json TEXT NOT NULL,    -- 数组，每句含 text / pinyin / translation / scene / mood
  background TEXT,
  empathy TEXT,
  words_json TEXT,                 -- 生字词数组：word / pinyin / meaning
  audio_url TEXT NOT NULL,         -- 整首朗读 MP3 公网直链
  video_url TEXT NOT NULL,         -- 视频 iframe embed 链接（B站 / YouTube）
  mastered BOOLEAN DEFAULT FALSE,
  review_stage INTEGER DEFAULT 0,  -- 0=未背,1=第2天,2=第4天,3=第7天
  last_review INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);
    `.trim();
    res.setHeader("Content-Type", "text/plain");
    res.send(d1Sql);
  });

  // Vite middleware setup for asset serving & SPA routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
