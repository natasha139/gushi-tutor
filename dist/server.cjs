var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_vite = require("vite");

// server_db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var DB_PATH = import_path.default.join(process.cwd(), "poems.json");
var SEED_POEMS = [
  {
    id: 1,
    title: "\u9759\u591C\u601D",
    author: "\u674E\u767D",
    raw_text: "\u5E8A\u524D\u660E\u6708\u5149\uFF0C\u7591\u662F\u5730\u4E0A\u971C\u3002\n\u62AC\u5934\u671B\u660E\u6708\uFF0C\u4F4E\u5934\u601D\u6545\u4E61\u3002",
    sentences_json: [
      {
        text: "\u5E8A\u524D\u660E\u6708\u5149",
        pinyin: "chu\xE1ng qi\xE1n m\xEDng yu\xE8 gu\u0101ng",
        translation: "\u660E\u4EAE\u7684\u6708\u5149\u6D12\u5728\u5E8A\u524D\u3002",
        scene: "\u8BD7\u4EBA\u7684\u5E8A\u524D\u94FA\u6EE1\u4E86\u94F6\u767D\u8272\u7684\u6708\u5149\uFF0C\u4EAE\u6643\u6643\u7684\u3002",
        mood: "\u5B89\u9759\u3001\u7965\u548C"
      },
      {
        text: "\u7591\u662F\u5730\u4E0A\u971C",
        pinyin: "y\xED sh\xEC d\xEC sh\xE0ng shu\u0101ng",
        translation: "\u597D\u50CF\u662F\u5730\u4E0A\u94FA\u4E86\u4E00\u5C42\u6D01\u767D\u7684\u79CB\u971C\u3002",
        scene: "\u5730\u677F\u767D\u832B\u832B\u4E00\u7247\uFF0C\u51B7\u51B0\u51B0\u7684\uFF0C\u50CF\u51AC\u5929\u7ED3\u7684\u971C\u4E00\u6837\u3002",
        mood: "\u5B64\u5355\u3001\u6E05\u51B7"
      },
      {
        text: "\u62AC\u5934\u671B\u660E\u6708",
        pinyin: "t\xE1i t\xF3u w\xE0ng m\xEDng yu\xE8",
        translation: "\u6211\u62AC\u8D77\u5934\u6765\uFF0C\u770B\u7740\u591C\u7A7A\u4E2D\u90A3\u8F6E\u53C8\u5706\u53C8\u4EAE\u7684\u660E\u6708\u3002",
        scene: "\u8BD7\u4EBA\u63A8\u5F00\u7A97\u6237\uFF0C\u62AC\u8D77\u5934\uFF0C\u51DD\u89C6\u7740\u591C\u7A7A\u4E2D\u5706\u5706\u7684\u6708\u4EAE\u3002",
        mood: "\u5411\u5F80\u3001\u671F\u76FC"
      },
      {
        text: "\u4F4E\u5934\u601D\u6545\u4E61",
        pinyin: "d\u012B t\xF3u s\u012B g\xF9 xi\u0101ng",
        translation: "\u4F4E\u4E0B\u5934\u6765\uFF0C\u5FC3\u91CC\u6DF1\u6DF1\u5730\u60F3\u5FF5\u8D77\u9065\u8FDC\u7684\u5BB6\u4E61\u548C\u4EB2\u4EBA\u3002",
        scene: "\u8BD7\u4EBA\u6162\u6162\u4F4E\u4E0B\u5934\uFF0C\u95ED\u4E0A\u773C\u775B\uFF0C\u8111\u6D77\u91CC\u5168\u662F\u7238\u7238\u5988\u5988\u548C\u7AE5\u5E74\u7684\u73A9\u4F34\u3002",
        mood: "\u96BE\u8FC7\u3001\u601D\u5FF5"
      }
    ],
    background: "\u8FD9\u9996\u8BD7\u662F\u674E\u767D\u5728\u79CB\u5929\u7684\u591C\u665A\uFF0C\u4F4F\u5728\u5BA2\u6808\u91CC\u65F6\u5199\u7684\u3002\u5F53\u65F6\u4ED6\u79BB\u5F00\u5BB6\u4E61\u5F88\u4E45\u4E86\uFF0C\u4E00\u4E2A\u4EBA\u5728\u5916\u9762\u65C5\u884C\u3002\u665A\u4E0A\u7761\u4E0D\u7740\uFF0C\u770B\u5230\u7A97\u5916\u7F8E\u4E3D\u7684\u6708\u5149\uFF0C\u5C31\u60F3\u8D77\u4E86\u81EA\u5DF1\u7684\u5BB6\u4E61\u548C\u4EB2\u4EBA\u3002",
    empathy: "\u5C31\u50CF\u6211\u4EEC\u7B2C\u4E00\u6B21\u53BB\u5916\u5730\u590F\u4EE4\u8425\uFF0C\u6216\u8005\u5728\u5BC4\u5BBF\u5B66\u6821\uFF0C\u665A\u4E0A\u7761\u89C9\u524D\u770B\u89C1\u6708\u4EAE\uFF0C\u7A81\u7136\u597D\u60F3\u5BB6\u3001\u597D\u60F3\u7238\u7238\u5988\u5988\u4E00\u6837\u3002\u674E\u767D\u5F53\u65F6\u4E5F\u662F\u8FD9\u6837\u60F3\u5BB6\u7684\u54E6\uFF01",
    words_json: [
      { word: "\u7591", pinyin: "y\xED", meaning: "\u597D\u50CF\uFF0C\u4EE5\u4E3A\u3002\u8FD9\u91CC\u662F\u8BF4\u628A\u6708\u5149\u5F53\u6210\u4E86\u5730\u4E0A\u7684\u971C\u3002" },
      { word: "\u601D", pinyin: "s\u012B", meaning: "\u601D\u5FF5\uFF0C\u60F3\u5FF5\u3002" },
      { word: "\u971C", pinyin: "shu\u0101ng", meaning: "\u79CB\u5929\u6216\u51AC\u5929\u8D34\u5728\u5730\u9762\u3001\u8349\u53F6\u4E0A\u7684\u767D\u8272\u51B0\u6676\uFF0C\u4EAE\u6676\u6676\u7684\u3001\u51B7\u51B7\u7684\u3002" }
    ],
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    video_url: "https://player.bilibili.com/player.html?bvid=BV19y4y1t7uC",
    mastered: false,
    review_stage: 0,
    last_review: null,
    created_at: Date.now() - 36e5 * 24 * 3
    // Created 3 days ago to simulate review trigger
  },
  {
    id: 2,
    title: "\u548F\u9E45",
    author: "\u9A86\u5BBE\u738B",
    raw_text: "\u9E45\uFF0C\u9E45\uFF0C\u9E45\uFF0C\u66F2\u9879\u5411\u5929\u6B4C\u3002\n\u767D\u6BDB\u6D6E\u7EFF\u6C34\uFF0C\u7EA2\u638C\u62E8\u6E05\u6CE2\u3002",
    sentences_json: [
      {
        text: "\u9E45\uFF0C\u9E45\uFF0C\u9E45",
        pinyin: "\xE9, \xE9, \xE9",
        translation: "\u5927\u9E45\uFF0C\u5927\u9E45\uFF0C\u5927\u9E45\uFF01",
        scene: "\u6C60\u5858\u8FB9\u6709\u4E00\u7FA4\u53EF\u7231\u7684\u5927\u767D\u9E45\u5728\u6B22\u5FEB\u5730\u53EB\u7740\uFF0C\u5438\u5F15\u4E86\u5C0F\u670B\u53CB\u7684\u6CE8\u610F\u3002",
        mood: "\u6B22\u5FEB\u3001\u60CA\u559C"
      },
      {
        text: "\u66F2\u9879\u5411\u5929\u6B4C",
        pinyin: "q\u016B xi\xE0ng xi\xE0ng ti\u0101n g\u0113",
        translation: "\u5F2F\u66F2\u7740\u8116\u5B50\uFF0C\u671D\u7740\u5929\u7A7A\u6B22\u5FEB\u5730\u5531\u6B4C\u3002",
        scene: "\u5927\u767D\u9E45\u4F38\u957F\u4E86\u5F2F\u5F2F\u7684\u8116\u5B50\uFF0C\u633A\u8D77\u80F8\u812F\uFF0C\u4EF0\u7740\u5934\u5411\u5929\u53D1\u51FA\u2018\u560E\u560E\u2019\u7684\u53EB\u58F0\uFF0C\u597D\u50CF\u5728\u5531\u6B4C\u3002",
        mood: "\u795E\u6C14\u3001\u5F97\u610F"
      },
      {
        text: "\u767D\u6BDB\u6D6E\u7EFF\u6C34",
        pinyin: "b\xE1i m\xE1o f\xFA l\u01DC shu\u01D0",
        translation: "\u6D01\u767D\u7684\u7FBD\u6BDB\u6F02\u6D6E\u5728\u78A7\u7EFF\u7684\u6C60\u6C34\u4E0A\u3002",
        scene: "\u5927\u767D\u9E45\u8EAB\u4E0A\u96EA\u767D\u7684\u7FBD\u6BDB\u5728\u7EFF\u83B9\u83B9\u7684\u6E05\u6F88\u6C34\u9762\u4E0A\u6F02\u7740\uFF0C\u9ED1\u767D\u5206\u660E\uFF0C\u7279\u522B\u597D\u770B\u3002",
        mood: "\u4F18\u7F8E\u3001\u5E73\u9759"
      },
      {
        text: "\u7EA2\u638C\u62E8\u6E05\u6CE2",
        pinyin: "h\xF3ng zh\u01CEng b\u014D q\u012Bng b\u014D",
        translation: "\u7EA2\u7EA2\u7684\u811A\u638C\u5728\u6E05\u6F88\u7684\u6C34\u6CE2\u91CC\u5212\u52A8\u3002",
        scene: "\u5728\u7EFF\u6C34\u4E0B\u65B9\uFF0C\u7EA2\u7EA2\u7684\u53CC\u811A\u50CF\u5C0F\u6868\u4E00\u6837\uFF0C\u4E00\u4E0B\u4E00\u4E0B\u62E8\u52A8\u7740\u6E05\u6E05\u7684\u6C34\u6CE2\uFF0C\u6F3E\u8D77\u4E00\u5708\u5708\u6D9F\u6F2A\u3002",
        mood: "\u6D3B\u6CFC\u3001\u6709\u8DA3"
      }
    ],
    background: "\u76F8\u4F20\u8FD9\u9996\u8BD7\u662F\u5510\u4EE3\u8BD7\u4EBA\u9A86\u5BBE\u738B\u5728\u53EA\u6709\u4E03\u5C81\u7684\u65F6\u5019\u5199\u7684\u3002\u5F53\u65F6\u4ED6\u5BB6\u95E8\u53E3\u6709\u4E00\u4E2A\u6C60\u5858\uFF0C\u6C60\u5858\u91CC\u517B\u4E86\u8BB8\u591A\u5927\u767D\u9E45\u3002\u6709\u4E00\u5929\u6765\u4E86\u4E00\u4F4D\u5BA2\u4EBA\uFF0C\u60F3\u8003\u8003\u4ED6\uFF0C\u4ED6\u5C31\u7ACB\u523B\u5199\u4E0B\u4E86\u8FD9\u9996\u5145\u6EE1\u7AE5\u8DA3\u7684\u8BD7\u3002",
    empathy: "\u4E03\u5C81\u7684\u5C0F\u670B\u53CB\u5C31\u80FD\u5199\u51FA\u8FD9\u4E48\u68D2\u7684\u8BD7\uFF0C\u56E0\u4E3A\u4ED6\u975E\u5E38\u4ED4\u7EC6\u5730\u89C2\u5BDF\u4E86\u8EAB\u8FB9\u7684\u52A8\u7269\uFF01\u6211\u4EEC\u5728\u5199\u5C0F\u4F5C\u6587\u7684\u65F6\u5019\uFF0C\u4E5F\u53EF\u4EE5\u5B66\u5B66\u5C0F\u9A86\u5BBE\u738B\uFF0C\u628A\u5C0F\u72D7\u5C0F\u732B\u7684\u989C\u8272\u3001\u58F0\u97F3\u3001\u52A8\u4F5C\u90FD\u5199\u4E0B\u6765\uFF0C\u4F60\u4E5F\u80FD\u6210\u4E3A\u5C0F\u8BD7\u4EBA\uFF01",
    words_json: [
      { word: "\u66F2\u9879", pinyin: "q\u016B xi\xE0ng", meaning: "\u5F2F\u66F2\u7684\u8116\u5B50\u3002\u9879\u6307\u7684\u662F\u8116\u5B50\u540E\u9762\u3002" },
      { word: "\u6B4C", pinyin: "g\u0113", meaning: "\u8FD9\u91CC\u6307\u5927\u767D\u9E45\u2018\u560E\u560E\u2019\u7684\u53EB\u58F0\uFF0C\u542C\u8D77\u6765\u5C31\u50CF\u5531\u6B4C\u4E00\u6837\u3002" },
      { word: "\u62E8", pinyin: "b\u014D", meaning: "\u5212\u52A8\uFF0C\u62E8\u5F00\u3002" }
    ],
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    video_url: "https://player.bilibili.com/player.html?bvid=BV1vY411G7W5",
    mastered: false,
    review_stage: 0,
    last_review: null,
    created_at: Date.now() - 36e5 * 24 * 5
  },
  {
    id: 3,
    title: "\u767B\u9E73\u96C0\u697C",
    author: "\u738B\u4E4B\u6DA3",
    raw_text: "\u767D\u65E5\u4F9D\u5C71\u5C3D\uFF0C\u9EC4\u6CB3\u5165\u6D77\u6D41\u3002\n\u6B32\u7A77\u5343\u91CC\u76EE\uFF0C\u66F4\u4E0A\u4E00\u5C42\u697C\u3002",
    sentences_json: [
      {
        text: "\u767D\u65E5\u4F9D\u5C71\u5C3D",
        pinyin: "b\xE1i r\xEC y\u012B sh\u0101n j\xECn",
        translation: "\u592A\u9633\u4F9D\u508D\u7740\u5C71\u5CE6\u6162\u6162\u843D\u4E0B\u53BB\u4E86\u3002",
        scene: "\u7AD9\u5728\u9AD8\u697C\u4E0A\u5F80\u8FDC\u5904\u770B\uFF0C\u4E00\u8F6E\u91D1\u9EC4\u8272\u7684\u843D\u65E5\u6B63\u8D34\u7740\u8FDC\u5904\u7684\u8FDE\u7EF5\u7FA4\u5C71\uFF0C\u4E00\u70B9\u4E00\u70B9\u843D\u4E0B\u53BB\uFF0C\u76F4\u5230\u770B\u4E0D\u89C1\u3002",
        mood: "\u58EE\u9614\u3001\u4E0D\u820D"
      },
      {
        text: "\u9EC4\u6CB3\u5165\u6D77\u6D41",
        pinyin: "hu\xE1ng h\xE9 r\xF9 h\u01CEi li\xFA",
        translation: "\u9EC4\u6CB3\u4E4B\u6C34\u6EDA\u6EDA\u6D41\u5411\u6D69\u701A\u7684\u5927\u6D77\u3002",
        scene: "\u4F4E\u5934\u770B\u811A\u4E0B\uFF0C\u9EC4\u6F84\u6F84\u7684\u9EC4\u6CB3\u6C34\u6CE2\u6D9B\u6C79\u6D8C\uFF0C\u50CF\u4E00\u6761\u5DE8\u9F99\u4E00\u6837\u5954\u817E\u547C\u5578\u7740\uFF0C\u5411\u7740\u4E1C\u65B9\u7684\u5927\u6D77\u6D41\u53BB\u3002",
        mood: "\u96C4\u6D51\u3001\u5954\u653E"
      },
      {
        text: "\u6B32\u7A77\u5343\u91CC\u76EE",
        pinyin: "y\xF9 qi\xF3ng qi\u0101n l\u01D0 m\xF9",
        translation: "\u5982\u679C\u60F3\u8981\u770B\u5230\u6700\u8FDC\u6700\u5BBD\u5E7F\u7684\u98CE\u666F\u3002",
        scene: "\u8BD7\u4EBA\u5FC3\u91CC\u60F3\uFF0C\u6211\u60F3\u770B\u5F97\u66F4\u8FDC\uFF0C\u60F3\u628A\u5343\u91CC\u4E4B\u5916\u3001\u5929\u8FB9\u6700\u7F8E\u4E3D\u7684\u666F\u8272\u90FD\u770B\u4E2A\u591F\u3002",
        mood: "\u671F\u5F85\u3001\u5411\u5F80"
      },
      {
        text: "\u66F4\u4E0A\u4E00\u5C42\u697C",
        pinyin: "g\xE8ng sh\xE0ng y\u012B c\xE9ng l\xF3u",
        translation: "\u90A3\u5C31\u8981\u518D\u5F80\u4E0A\u767B\u4E0A\u4E00\u5C42\u9AD8\u697C\u3002",
        scene: "\u8BD7\u4EBA\u8FC8\u5F00\u575A\u5B9A\u7684\u811A\u6B65\uFF0C\u8F6C\u8FC7\u8EAB\uFF0C\u7EE7\u7EED\u5411\u7740\u66F4\u9AD8\u7684\u4E00\u5C42\u697C\u68AF\u767B\u4E0A\u53BB\u3002",
        mood: "\u79EF\u6781\u3001\u4E0A\u8FDB"
      }
    ],
    background: "\u9E73\u96C0\u697C\u662F\u4E00\u5EA7\u975E\u5E38\u51FA\u540D\u7684\u9AD8\u697C\u3002\u738B\u4E4B\u6DA3\u767B\u4E0A\u8FD9\u5EA7\u9AD8\u697C\uFF0C\u770B\u5230\u843D\u65E5\u548C\u9EC4\u6CB3\u7684\u58EE\u4E3D\u666F\u8272\uFF0C\u5FC3\u60C5\u975E\u5E38\u6F8E\u6E43\u3002\u4ED6\u610F\u8BC6\u5230\uFF0C\u53EA\u6709\u7AD9\u5F97\u9AD8\uFF0C\u624D\u80FD\u770B\u5F97\u8FDC\uFF0C\u4E8E\u662F\u5199\u4E0B\u4E86\u8FD9\u9996\u5343\u53E4\u540D\u8BD7\uFF0C\u9F13\u52B1\u5927\u5BB6\u4E0D\u65AD\u52AA\u529B\u3002",
    empathy: "\u8FD9\u9996\u8BD7\u544A\u8BC9\u6211\u4EEC\u4E00\u4E2A\u975E\u5E38\u68D2\u7684\u5B66\u4E60\u79D8\u8BC0\uFF1A\u2018\u66F4\u4E0A\u4E00\u5C42\u697C\u2019\u3002\u5C31\u50CF\u6211\u4EEC\u5B66\u6570\u5B66\u3001\u7EC3\u94A2\u7434\uFF0C\u867D\u7136\u73B0\u5728\u5DF2\u7ECF\u5F88\u4E0D\u9519\u4E86\uFF0C\u4F46\u5982\u679C\u80FD\u591A\u575A\u6301\u4E00\u4E0B\u3001\u591A\u514B\u670D\u4E00\u4E2A\u56F0\u96BE\uFF0C\u5C31\u80FD\u770B\u5230\u66F4\u795E\u5947\u3001\u66F4\u7F8E\u4E3D\u7684\u4E16\u754C\uFF01",
    words_json: [
      { word: "\u767D\u65E5", pinyin: "b\xE1i r\xEC", meaning: "\u6307\u843D\u65E5\u3002\u56E0\u4E3A\u508D\u665A\u7684\u592A\u9633\u5149\u8292\u6536\u655B\uFF0C\u770B\u8D77\u6765\u5448\u767D\u8272\u6216\u6DE1\u9EC4\u8272\u3002" },
      { word: "\u4F9D", pinyin: "y\u012B", meaning: "\u4F9D\u508D\uFF0C\u9760\u7740\u3002" },
      { word: "\u5C3D", pinyin: "j\xECn", meaning: "\u6D88\u5931\uFF0C\u843D\u4E0B\u53BB\u3002" },
      { word: "\u6B32", pinyin: "y\xF9", meaning: "\u60F3\u8981\u3002" },
      { word: "\u7A77", pinyin: "qi\xF3ng", meaning: "\u5C3D\uFF0C\u8FBE\u5230\u6781\u9650\u3002\u8FD9\u91CC\u662F\u770B\u5C3D\u3001\u770B\u900F\u7684\u610F\u601D\u3002" }
    ],
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    video_url: "https://player.bilibili.com/player.html?bvid=BV16b4y1R7g2",
    mastered: false,
    review_stage: 0,
    last_review: null,
    created_at: Date.now() - 36e5 * 2
  }
];
function getDbPoems() {
  try {
    if (!import_fs.default.existsSync(DB_PATH)) {
      import_fs.default.writeFileSync(DB_PATH, JSON.stringify(SEED_POEMS, null, 2), "utf-8");
      return SEED_POEMS;
    }
    const data = import_fs.default.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read database, returning seeds", error);
    return SEED_POEMS;
  }
}
function saveDbPoems(poems) {
  try {
    import_fs.default.writeFileSync(DB_PATH, JSON.stringify(poems, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save database", error);
  }
}
function getPoemById(id) {
  const poems = getDbPoems();
  return poems.find((p) => p.id === id);
}
function addPoem(poemData) {
  const poems = getDbPoems();
  const nextId = poems.length > 0 ? Math.max(...poems.map((p) => p.id || 0)) + 1 : 1;
  const newPoem = {
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
function updatePoem(id, updatedFields) {
  const poems = getDbPoems();
  const idx = poems.findIndex((p) => p.id === id);
  if (idx === -1) return void 0;
  poems[idx] = { ...poems[idx], ...updatedFields };
  saveDbPoems(poems);
  return poems[idx];
}
function deletePoem(id) {
  const poems = getDbPoems();
  const initialLength = poems.length;
  const filtered = poems.filter((p) => p.id !== id);
  if (filtered.length === initialLength) return false;
  saveDbPoems(filtered);
  return true;
}
function isPoemDueForReview(poem) {
  if (!poem.mastered) {
    return false;
  }
  if (poem.last_review === null) {
    return true;
  }
  const elapsedMs = Date.now() - poem.last_review;
  const elapsedDays = elapsedMs / (36e5 * 24);
  if (poem.review_stage === 1) {
    return elapsedDays >= 1;
  } else if (poem.review_stage === 2) {
    return elapsedDays >= 3;
  } else if (poem.review_stage === 3) {
    return elapsedDays >= 3;
  }
  return false;
}

// server.ts
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
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
        video_url
      } = req.body;
      if (!title || !author || !raw_text) {
        return res.status(400).json({ error: "\u8BD7\u540D\u3001\u4F5C\u8005\u3001\u539F\u6587\u4E3A\u5FC5\u586B\u9879" });
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
        video_url: video_url || ""
      });
      res.status(210).json(newPoem);
    } catch (error) {
      res.status(500).json({ error: "Failed to create poem" });
    }
  });
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
        isMastered = true;
        nextStage = 1;
      } else {
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
  app.get("/api/d1-schema.sql", (req, res) => {
    const d1Sql = `
CREATE TABLE poems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  sentences_json TEXT NOT NULL,    -- \u6570\u7EC4\uFF0C\u6BCF\u53E5\u542B text / pinyin / translation / scene / mood
  background TEXT,
  empathy TEXT,
  words_json TEXT,                 -- \u751F\u5B57\u8BCD\u6570\u7EC4\uFF1Aword / pinyin / meaning
  audio_url TEXT NOT NULL,         -- \u6574\u9996\u6717\u8BFB MP3 \u516C\u7F51\u76F4\u94FE
  video_url TEXT NOT NULL,         -- \u89C6\u9891 iframe embed \u94FE\u63A5\uFF08B\u7AD9 / YouTube\uFF09
  mastered BOOLEAN DEFAULT FALSE,
  review_stage INTEGER DEFAULT 0,  -- 0=\u672A\u80CC,1=\u7B2C2\u5929,2=\u7B2C4\u5929,3=\u7B2C7\u5929
  last_review INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);
    `.trim();
    res.setHeader("Content-Type", "text/plain");
    res.send(d1Sql);
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
