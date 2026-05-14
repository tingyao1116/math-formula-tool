import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = process.cwd();
const EXPORT_DIR = path.join(ROOT, "exports");
const REPORT_JSON = path.join(EXPORT_DIR, "data-health-check.json");
const REPORT_HTML = path.join(EXPORT_DIR, "data-health-check.html");

function loadScriptIntoContext(context, relPath) {
  const absPath = path.join(ROOT, relPath);
  const code = fs.readFileSync(absPath, "utf8");
  vm.runInContext(code, context, { filename: relPath });
}

function createContext() {
  const sandbox = {
    window: {},
    console,
    Date,
    JSON,
    Math,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Map,
    Set
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
  return vm.createContext(sandbox);
}

function buildData() {
  const context = createContext();
  loadScriptIntoContext(context, "formulas.js");
  loadScriptIntoContext(context, "data/chapter-code-config.js");
  loadScriptIntoContext(context, "data/formula-content.js");
  loadScriptIntoContext(context, "formula-data.js");

  const store = context.window.formulaDataStore;
  if (!store || typeof store.getCurrentFormulas !== "function") {
    throw new Error("formulaDataStore not available.");
  }
  return store.getCurrentFormulas();
}

function analyze(items) {
  const byId = new Map(items.map((item) => [String(item.id || ""), item]));
  const duplicateIds = [];
  const seen = new Set();
  for (const item of items) {
    const id = String(item.id || "");
    if (seen.has(id)) duplicateIds.push(id);
    seen.add(id);
  }

  const badParent = [];
  const crossFamilyParent = [];
  const missingChapterCode = [];
  const missingTitle = [];
  const orphans = [];
  let topicCount = 0;
  let branchCount = 0;

  for (const item of items) {
    const id = String(item.id || "");
    const title = String(item.title || "").trim();
    const parentId = String(item.parentId || "").trim();
    const chapterCode = String(item.chapterCode || "").trim();

    if (!title) missingTitle.push(id);
    if (!chapterCode) missingChapterCode.push(id);

    if (!parentId) {
      topicCount += 1;
    } else {
      branchCount += 1;
      if (!byId.has(parentId)) {
        badParent.push({ id, parentId });
      } else {
        const parent = byId.get(parentId);
        const f1 = codeFamily(item.chapterCode);
        const f2 = codeFamily(parent.chapterCode);
        if (f1 && f2 && f1 !== f2) {
          crossFamilyParent.push({
            id,
            chapterCode: item.chapterCode || "",
            parentId,
            parentChapterCode: parent.chapterCode || ""
          });
        }
      }
    }

    if (!String(item.stage || "").trim() || !String(item.chapter || "").trim()) {
      orphans.push(id);
    }
  }

  const depthCache = new Map();
  const depthStack = new Set();
  const cycleIds = new Set();
  function depthOf(id) {
    if (depthCache.has(id)) return depthCache.get(id);
    const node = byId.get(id);
    if (!node) return 0;
    const parentId = String(node.parentId || "").trim();
    if (!parentId) {
      depthCache.set(id, 0);
      return 0;
    }
    if (depthStack.has(id)) {
      cycleIds.add(id);
      return Number.POSITIVE_INFINITY;
    }
    depthStack.add(id);
    const depth = depthOf(parentId) + 1;
    depthStack.delete(id);
    depthCache.set(id, depth);
    return depth;
  }

  let maxDepth = 0;
  const overDepth = [];
  for (const item of items) {
    const id = String(item.id || "");
    const d = depthOf(id);
    if (!Number.isFinite(d)) continue;
    if (d > maxDepth) maxDepth = d;
    if (d > 2) overDepth.push({ id, depth: d });
  }

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      all: items.length,
      topics: topicCount,
      branches: branchCount
    },
    integrity: {
      duplicateIds,
      missingTitle,
      missingChapterCode,
      badParent,
      crossFamilyParent,
      orphans,
      cycleIds: Array.from(cycleIds),
      maxDepth,
      overDepth
    }
  };
}

function renderHtml(report) {
  const esc = (text) =>
    String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const ok = (count) =>
    count === 0 ? '<span class="ok">OK</span>' : `<span class="bad">${count}</span>`;

  const rows = [
    ["總筆數", report.totals.all],
    ["主題數", report.totals.topics],
    ["分支數", report.totals.branches],
    ["重複 ID", ok(report.integrity.duplicateIds.length)],
    ["缺標題", ok(report.integrity.missingTitle.length)],
    ["缺章節代號", ok(report.integrity.missingChapterCode.length)],
    ["無效 parentId", ok(report.integrity.badParent.length)],
    ["跨章節家族 parent", ok(report.integrity.crossFamilyParent.length)],
    ["缺學層/章節資訊", ok(report.integrity.orphans.length)],
    ["循環引用", ok(report.integrity.cycleIds.length)],
    ["最大深度", report.integrity.maxDepth],
    ["超過 3 層", ok(report.integrity.overDepth.length)]
  ];

  function listSection(title, items) {
    const content = items.length
      ? `<pre>${esc(JSON.stringify(items, null, 2))}</pre>`
      : '<div class="ok">OK</div>';
    return `<section><h3>${esc(title)}</h3>${content}</section>`;
  }

  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <title>Data Health Check</title>
  <style>
    body { font-family: "Microsoft JhengHei", sans-serif; margin: 20px; background: #f7f7f5; color: #1f2937; }
    h1 { margin-bottom: 8px; }
    .meta { color: #6b7280; margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; background: white; border-radius: 8px; overflow: hidden; }
    td { border: 1px solid #e5e7eb; padding: 8px 10px; }
    td:first-child { width: 220px; font-weight: 600; background: #fafafa; }
    .ok { color: #0f766e; font-weight: 700; }
    .bad { color: #b91c1c; font-weight: 700; }
    section { background: white; margin-top: 14px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
    pre { margin: 0; white-space: pre-wrap; word-break: break-word; font-size: 12px; }
  </style>
</head>
<body>
  <h1>資料健康檢查</h1>
  <div class="meta">產生時間：${esc(report.generatedAt)}</div>
  <table>
    ${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${v}</td></tr>`).join("\n")}
  </table>
  ${listSection("重複 ID", report.integrity.duplicateIds)}
  ${listSection("缺標題", report.integrity.missingTitle)}
  ${listSection("缺章節代號", report.integrity.missingChapterCode)}
  ${listSection("無效 parentId", report.integrity.badParent)}
  ${listSection("跨章節家族 parent", report.integrity.crossFamilyParent)}
  ${listSection("缺學層/章節資訊", report.integrity.orphans)}
  ${listSection("循環引用", report.integrity.cycleIds)}
  ${listSection("超過 3 層", report.integrity.overDepth)}
</body>
</html>`;
}

function main() {
  const items = buildData();
  const report = analyze(items);
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(REPORT_HTML, renderHtml(report), "utf8");
  console.log(`Generated: ${REPORT_JSON}`);
  console.log(`Generated: ${REPORT_HTML}`);
  console.log(`Total items: ${report.totals.all}`);
}

main();
  function codeFamily(code) {
    const raw = String(code || "").trim().toLowerCase();
    if (!raw) return "";
    const parts = raw.split("-");
    if (parts.length === 1) return parts[0];
    return `${parts[0]}-${parts[1] || ""}`;
  }
