// 主題串資料流：
//   主資料庫：program-db/database/practice-theme-db.json（GUI 讀寫）
//   網頁 bridge：data/practice-theme-chains.js（由主資料庫同步產生）
//
// 用法：
//   node scripts/build-practice-theme-chains.mjs          → 從 theme-db 同步網頁資料檔
//   node scripts/build-practice-theme-chains.mjs --seed   → 從 practice-db.json 重建 theme-db（每個小章節一串，
//                                                           順序照母資料；會覆蓋手動調整過的順序！）再同步網頁資料檔
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// 依慣例從專案根目錄執行；若 cwd 就是專案根目錄則優先使用
const root = existsSync(path.join(process.cwd(), "program-db", "database", "practice-db.json"))
  ? process.cwd()
  : scriptRoot;
const practiceDbPath = path.join(root, "program-db", "database", "practice-db.json");
const themeDbPath = path.join(root, "program-db", "database", "practice-theme-db.json");
const chapterConfigPath = path.join(root, "data", "chapter-code-config.js");
const bridgePath = path.join(root, "data", "practice-theme-chains.js");

const shouldSeed = process.argv.includes("--seed");

function nowIso() {
  return new Date().toISOString();
}

function loadChapterCatalog() {
  try {
    const raw = readFileSync(chapterConfigPath, "utf8");
    const jsonText = raw
      .replace(/^\s*window\.chapterCodeCatalog\s*=\s*/, "")
      .replace(/;\s*$/, "");
    return JSON.parse(jsonText);
  } catch (error) {
    console.warn("無法解析 chapter-code-config.js，主題串標題將只用 chapterCode：", error.message);
    return {};
  }
}

function chapterSortKey(code) {
  const match = /^([a-z]+)(\d+)-(\d+)-(\d+)$/.exec(code);
  if (!match) return [code, 0, 0, 0];
  return [match[1], Number(match[2]), Number(match[3]), Number(match[4])];
}

function seedThemeDb() {
  const db = JSON.parse(readFileSync(practiceDbPath, "utf8"));
  const practices = Array.isArray(db.practices) ? db.practices : [];
  const chapterCatalog = loadChapterCatalog();

  const chainsByCode = new Map();
  for (const practice of practices) {
    if (!practice || practice.enabled === false) continue;
    const chapterCode = String(practice.chapterCode || "").trim();
    const id = String(practice.id || "").trim();
    if (!chapterCode || !id) continue;
    if (!chainsByCode.has(chapterCode)) chainsByCode.set(chapterCode, []);
    chainsByCode.get(chapterCode).push(id);
  }

  const sortedCodes = Array.from(chainsByCode.keys()).sort((a, b) => {
    const ka = chapterSortKey(a);
    const kb = chapterSortKey(b);
    for (let i = 0; i < 4; i += 1) {
      if (ka[i] < kb[i]) return -1;
      if (ka[i] > kb[i]) return 1;
    }
    return 0;
  });

  const stamp = nowIso();
  const themeChains = sortedCodes.map((chapterCode) => {
    const meta = chapterCatalog[chapterCode] || {};
    const sectionName = String(meta.section || meta.chapter || "").trim();
    return {
      id: `theme-${chapterCode}`,
      title: sectionName ? `${chapterCode} ${sectionName}` : chapterCode,
      chapterCode,
      description: "由小章節自動建立的主題串，順序照母資料。",
      practiceIds: chainsByCode.get(chapterCode),
      questionCount: 5,
      enabled: true,
      updatedAt: stamp,
    };
  });

  const payload = {
    meta: {
      schema: "practice-theme-db-v1",
      source: "program-db/database/practice-db.json",
      chainCount: themeChains.length,
      practiceIdCount: themeChains.reduce((sum, chain) => sum + chain.practiceIds.length, 0),
      updatedAt: stamp,
    },
    themeChains,
  };
  writeFileSync(themeDbPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Seeded: ${themeDbPath}（${themeChains.length} 串）`);
  return payload;
}

function loadThemeDb() {
  return JSON.parse(readFileSync(themeDbPath, "utf8"));
}

function syncBridge(payload) {
  const themeChains = Array.isArray(payload.themeChains) ? payload.themeChains : [];
  const total = themeChains.reduce(
    (sum, chain) => sum + (Array.isArray(chain.practiceIds) ? chain.practiceIds.length : 0),
    0,
  );
  const banner =
    `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n` +
    `// Source: program-db/database/practice-theme-db.json\n` +
    `// 主題串數：${themeChains.length}、題型總數：${total}\n` +
    `// 最後更新：${nowIso()}\n`;
  writeFileSync(bridgePath, `${banner}window.practiceThemeChainData = ${JSON.stringify(themeChains, null, 2)};\n`, "utf8");
  console.log(`Generated: ${bridgePath}`);
  console.log(`chains=${themeChains.length} practiceIds=${total}`);
}

let payload;
if (shouldSeed || !existsSync(themeDbPath)) {
  payload = seedThemeDb();
} else {
  payload = loadThemeDb();
}
syncBridge(payload);
