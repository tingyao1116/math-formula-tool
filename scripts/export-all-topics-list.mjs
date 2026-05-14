import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = process.cwd();
const OUT_JSON = path.join(ROOT, "exports", "all-topics-branches-670.json");
const OUT_HTML = path.join(ROOT, "exports", "all-topics-branches-670.html");

function loadScriptIntoContext(context, relPath) {
  const abs = path.join(ROOT, relPath);
  const code = fs.readFileSync(abs, "utf8");
  vm.runInContext(code, context, { filename: relPath });
}

function buildItems() {
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
  const context = vm.createContext(sandbox);

  loadScriptIntoContext(context, "formulas.js");
  loadScriptIntoContext(context, "data/chapter-code-config.js");
  loadScriptIntoContext(context, "data/formula-content.js");
  loadScriptIntoContext(context, "formula-data.js");

  const store = context.window.formulaDataStore;
  if (!store || typeof store.getCurrentFormulas !== "function") {
    throw new Error("formulaDataStore not available");
  }
  return store.getCurrentFormulas();
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function parseCodePart(part) {
  const text = String(part || "").trim().toLowerCase();
  if (!text) return { n: Number.POSITIVE_INFINITY, t: "" };
  if (text === "x") return { n: 999, t: "x" };
  const n = Number(text);
  if (Number.isFinite(n)) return { n, t: text };
  const m = text.match(/^([a-z]+)(\d+)$/);
  if (m) return { n: Number(m[2]), t: m[1] };
  return { n: Number.POSITIVE_INFINITY, t: text };
}

function chapterCodeSortKey(code) {
  const raw = String(code || "").trim();
  if (!raw) {
    return { bucket: 9, headNum: 999, parts: [{ n: 999, t: "" }], raw };
  }
  const lower = raw.toLowerCase();
  const m = lower.match(/^([a-z]+)(\d*)(?:-(.*))?$/);
  if (!m) {
    return { bucket: 8, headNum: 999, parts: [{ n: 999, t: lower }], raw: lower };
  }
  const head = m[1];
  const headNum = m[2] ? Number(m[2]) : 0;
  const rest = String(m[3] || "");
  const parts = rest ? rest.split("-").map(parseCodePart) : [];

  let bucket = 8;
  if (head === "j") bucket = 0;
  else if (head === "s" && headNum >= 1 && headNum <= 4) bucket = 1;
  else if (head === "s" && headNum >= 5) bucket = 2;
  else if (head === "b") bucket = 3;
  else if (head === "s") bucket = 4;
  else bucket = 5;

  return { bucket, headNum, parts, raw: lower };
}

function compareCode(a, b) {
  const ka = chapterCodeSortKey(a);
  const kb = chapterCodeSortKey(b);
  if (ka.bucket !== kb.bucket) return ka.bucket - kb.bucket;
  if (ka.headNum !== kb.headNum) return ka.headNum - kb.headNum;
  const len = Math.max(ka.parts.length, kb.parts.length);
  for (let i = 0; i < len; i += 1) {
    const pa = ka.parts[i] || { n: Number.POSITIVE_INFINITY, t: "" };
    const pb = kb.parts[i] || { n: Number.POSITIVE_INFINITY, t: "" };
    if (pa.n !== pb.n) return pa.n - pb.n;
    if (pa.t !== pb.t) return pa.t.localeCompare(pb.t, "zh-Hant");
  }
  return ka.raw.localeCompare(kb.raw, "zh-Hant");
}

function main() {
  const items = buildItems();
  const byId = new Map(items.map((x) => [String(x.id || ""), x]));

  const rows = items.map((item, idx) => {
    const parentId = String(item.parentId || "").trim();
    const parent = parentId ? byId.get(parentId) : null;
    return {
      index: idx + 1,
      id: String(item.id || ""),
      title: String(item.title || ""),
      chapterCode: String(item.chapterCode || ""),
      isBranch: Boolean(item.isBranch),
      parentId,
      parentTitle: parent ? String(parent.title || "") : "",
      chapter: String(item.chapter || "")
    };
  })
  .sort((a, b) => {
    const codeCmp = compareCode(a.chapterCode, b.chapterCode);
    if (codeCmp !== 0) return codeCmp;
    const branchCmp = Number(a.isBranch) - Number(b.isBranch);
    if (branchCmp !== 0) return branchCmp;
    return a.id.localeCompare(b.id, "zh-Hant");
  })
  .map((row, i) => ({ ...row, index: i + 1 }));

  fs.mkdirSync(path.join(ROOT, "exports"), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify({ total: rows.length, rows }, null, 2), "utf8");

  const html = `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <title>all-topics-branches</title>
  <style>
    body { font-family: "Microsoft JhengHei", sans-serif; padding: 16px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 13px; }
    th { background: #f5f5f5; position: sticky; top: 0; }
    tr:nth-child(even) { background: #fafafa; }
  </style>
</head>
<body>
  <h2>全部主題/分支清單（共 ${rows.length} 筆）</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>id</th>
        <th>標題</th>
        <th>章節代碼</th>
        <th>是否分支</th>
        <th>上一層 id</th>
        <th>上一層標題</th>
        <th>章節名稱</th>
      </tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (r) => `<tr>
        <td>${r.index}</td>
        <td>${escapeHtml(r.id)}</td>
        <td>${escapeHtml(r.title)}</td>
        <td>${escapeHtml(r.chapterCode)}</td>
        <td>${r.isBranch ? "Y" : "N"}</td>
        <td>${escapeHtml(r.parentId)}</td>
        <td>${escapeHtml(r.parentTitle)}</td>
        <td>${escapeHtml(r.chapter)}</td>
      </tr>`
        )
        .join("\n")}
    </tbody>
  </table>
</body>
</html>`;

  fs.writeFileSync(OUT_HTML, html, "utf8");
  console.log(`Generated: ${OUT_JSON}`);
  console.log(`Generated: ${OUT_HTML}`);
  console.log(`Total: ${rows.length}`);
}

main();
