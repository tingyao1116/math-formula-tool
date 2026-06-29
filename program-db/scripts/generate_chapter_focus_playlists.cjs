const fs = require("fs");
const vm = require("vm");

const assignmentPath = "data/formula-practice-assignments.js";
const outputPath = "data/practice-chapter-playlists.js";

const ctx = { window: {} };
ctx.window.window = ctx.window;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(assignmentPath, "utf8"), ctx, { filename: assignmentPath });

const records = Object.values(ctx.window.practiceLibraryStore?.byId || {})
  .filter((record) => record && record.enabled !== false)
  .filter((record) => /^(j|s)\d+-\d+-\d+/.test(String(record.chapterCode || "")));

const chapterNames = {
  "j1-1": "國一上：整數、數線、指數與科學記號",
  "j1-2": "國一上：因數倍數與分數運算",
  "j1-3": "國一上：一元一次式與方程式應用",
  "j2-1": "國一下：二元一次聯立方程式",
  "j2-2": "國一下：直角坐標與一次函數圖形",
  "j2-3": "國一下：比與比例式",
  "j2-4": "國一下：一元一次不等式",
  "j2-5": "國一下：統計整理與分析",
  "j3-1": "國二上：乘法公式與多項式",
  "j3-2": "國二上：平方根、根式與畢氏定理",
  "j3-3": "國二上：因式分解",
  "j3-4": "國二上：一元二次方程式",
  "j4-1": "國二下：數列與級數",
  "j4-2": "國二下：函數與一次函數",
  "j4-3": "國二下：三角形與尺規作圖",
  "j4-4": "國二下：平行與四邊形",
  "j5-1": "國三上：比例線段、相似與三角比",
  "j5-2": "國三上：圓的性質與冪定理",
  "j5-3": "國三上：幾何推理與三心",
  "j6-1": "國三下：二次函數",
  "j6-2": "國三下：立體圖形",
  "j6-3": "國三下：統計與機率",
  "s1-1": "高中第一冊：實數、絕對值、乘法公式、指對數",
  "s1-2": "高中第一冊：直線與圓",
  "s1-3": "高中第一冊：多項式、二次函數與不等式",
  "s2-1": "高中第二冊：數列與級數",
  "s2-2": "高中第二冊：排列組合與機率",
  "s2-3": "高中第二冊：統計與迴歸",
  "s2-4": "高中第二冊：三角比與正餘弦定理",
  "s3-1": "高中第三冊：三角函數",
  "s3-2": "高中第三冊：指數與對數函數",
  "s3-3": "高中第三冊：平面向量與行列式",
  "s4-1": "高中第四冊：空間概念與空間向量",
  "s4-2": "高中第四冊：空間中的平面與直線",
  "s4-3": "高中第四冊：條件機率與獨立事件",
  "s4-4": "高中第四冊：線性方程組與矩陣",
};

const byGroup = new Map();
for (const record of records) {
  const match = String(record.chapterCode || "").match(/^((?:j|s)\d+-\d+)-/);
  if (!match) continue;
  const key = match[1];
  if (!chapterNames[key]) continue;
  if (!byGroup.has(key)) byGroup.set(key, []);
  byGroup.get(key).push(record);
}

const weights = [
  [/five-subtypes|six-subtypes|seven-subtypes|ten-subtypes/, 26],
  [/mixed|core/, 24],
  [/application|applications|word|model|modeling|context/, 22],
  [/advanced|parameter|reverse|relation|constraint|range|extrema/, 18],
  [/formula|factor|equation|inequality|proportion|ratio|function|quadratic|linear|circle|triangle|vector|probability|statistics|series|sequence|permutation|combination|log|exponent|radical|pythagorean|coordinate|geometry/, 14],
  [/basic|concept|identify|definition|true-false/, -8],
];

function score(record) {
  const blob = `${record.id || ""} ${record.title || ""} ${record.generatorKey || ""}`.toLowerCase();
  let total = 0;
  for (const [pattern, value] of weights) {
    if (pattern.test(blob)) total += value;
  }
  total += Math.min(Number(record.questionCount) || 5, 8);
  if (blob.includes("one-subtype")) total -= 10;
  if (blob.includes("drill")) total += 2;
  return total;
}

function compareGroupKey(a, b) {
  const stage = a[0].localeCompare(b[0]);
  if (stage) return stage;
  const an = a.match(/\d+/g).map(Number);
  const bn = b.match(/\d+/g).map(Number);
  return (an[0] - bn[0]) || (an[1] - bn[1]);
}

const chapterPlaylists = Array.from(byGroup.keys()).sort(compareGroupKey).map((key) => {
  const items = byGroup.get(key).slice().sort((a, b) => {
    return score(b) - score(a)
      || String(a.chapterCode || "").localeCompare(String(b.chapterCode || ""))
      || String(a.id || "").localeCompare(String(b.id || ""));
  });
  const targetCount = Math.min(Math.max(10, Math.ceil(items.length * 0.22)), 14);
  const stage = key.startsWith("j") ? "國中章節重點" : "高中章節重點";
  return {
    id: `chapter-focus-${key}`,
    title: `章節重點：${chapterNames[key]}`,
    description: "依現有無限練習題型整理的章節重點清單，優先放入段考、會考或銜接後續課程最值得反覆練的題型。",
    grade: stage,
    playlistType: "任務型",
    playlistCategory: "章節重點",
    chapterGroup: key,
    practiceIds: items.slice(0, targetCount).map((record) => record.id),
    questionCount: 5,
    shufflePractices: false,
    enabled: true,
    updatedAt: "2026-06-29T00:00:00.000Z",
    scheduleConfig: null,
  };
});

const content = `// Chapter-focused important practice playlists layered on top of existing infinite practice data.
// Generated from ${assignmentPath}; do not edit original generators for these lists.
(() => {
  const chapterPlaylists = ${JSON.stringify(chapterPlaylists, null, 2)};

  const replaceIds = new Set(chapterPlaylists.map((playlist) => playlist.id));
  const existing = Array.isArray(window.practicePlaylistData) ? window.practicePlaylistData : [];
  window.practicePlaylistData = [
    ...existing.filter((playlist) => !replaceIds.has(String(playlist?.id || ""))),
    ...chapterPlaylists
  ];
})();
`;

fs.writeFileSync(outputPath, content, "utf8");
console.log(JSON.stringify({
  outputPath,
  playlistCount: chapterPlaylists.length,
  totalPracticeRefs: chapterPlaylists.reduce((sum, playlist) => sum + playlist.practiceIds.length, 0),
  counts: chapterPlaylists.map((playlist) => ({ id: playlist.id, count: playlist.practiceIds.length })),
}, null, 2));
