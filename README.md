<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/63f1ca8a-b1f0-4d87-baff-c5e307c1a816

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 背诵本

首页支持生词、成语、古诗和小古文。每条记录可包含多行正文及选填提示，整条记录独立计算复习进度。古诗可以从现有诗库填入；原古诗学习与每周计划保留在首页折叠区。

四档练习：完整阅读、遮住一半、只留首字、全部遮挡。点击单行临时揭示。尝试回忆并查看答案后，选择记忆反馈：记住了按 1、2、4、7、15、30、60 天递进；需要提示退一阶段且次日复习；还不会重置并在 10 分钟后复习。到期复习和未学记录显示在今日任务。

数据使用现有 Cloudflare D1 的独立 `memory_items` 表，不修改原诗库。首次部署先执行 `npx wrangler d1 execute gushi-tutor-db --remote --file memory-schema.sql`，再部署 Worker 与 Pages。

验证：`npm test`、`npm run lint`、`npm run build`。本地接口测试先执行 `npx wrangler d1 execute gushi-tutor-db --local --file memory-schema.sql`，再启动 `npx wrangler dev --port 8787`；前端可用 `VITE_API_BASE=http://localhost:8787 npx vite` 连接本地 Worker。小古文目前支持手动录入，尚未预置文章库。

## SchoolChinese 古诗文库

来源：https://github.com/lanhin/SchoolChinese ，固定版本 a04ff03403e963bb84e07bc3eb04b9faf26d6d7c，MIT 许可（Copyright 2018 lanhin，见 public/licenses/SchoolChinese-MIT.txt）。数据保留上游原文、作者、教材版本、册次及具体篇目链接。合集按二级标题拆篇；按标题、作者和正文生成稳定 ID，重复运行导入不会覆盖现有记录。保留上游文字，不自动纠正异体字或版本差异；类型基于段落长度初分，可在加入背诵本前修改。

从上游本地 checkout 重建：`python3 scripts/import-schoolchinese.py /path/to/SchoolChinese`。导入：`npx wrangler d1 execute gushi-tutor-db --remote --file data/schoolchinese.sql`。古诗文库与个人背诵记录独立，不向今日任务批量加入内容，也不修改原诗库及复习记录。
