import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = process.cwd();

function loadScriptIntoContext(context, relPath) {
  const absPath = path.join(ROOT, relPath);
  const code = fs.readFileSync(absPath, "utf8");
  vm.runInContext(code, context, { filename: relPath });
}

function buildStore() {
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
  loadScriptIntoContext(context, "data/formula-content.js");
  loadScriptIntoContext(context, "formula-data.js");

  const store = context.window.formulaDataStore;
  if (!store || typeof store.getCurrentFormulas !== "function") {
    throw new Error("formulaDataStore 載入失敗");
  }
  return store;
}

function analyze(items) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const topics = items.filter((item) => !item.parentId);
  const branches = items.filter((item) => Boolean(item.parentId));
  const emptyTitle = items.filter((item) => !String(item.title || "").trim()).map((item) => item.id);
  const badParent = items.filter((item) => item.parentId && !byId.has(item.parentId)).map((item) => ({
    id: item.id,
    parentId: item.parentId
  }));

  const visiting = new Set();
  const depthMemo = new Map();
  const cycleIds = new Set();

  function depthOf(id) {
    if (depthMemo.has(id)) return depthMemo.get(id);
    const item = byId.get(id);
    if (!item || !item.parentId) {
      depthMemo.set(id, 0);
      return 0;
    }
    if (visiting.has(id)) {
      cycleIds.add(id);
      return Number.POSITIVE_INFINITY;
    }
    visiting.add(id);
    const parentDepth = depthOf(item.parentId);
    visiting.delete(id);
    if (!Number.isFinite(parentDepth)) {
      depthMemo.set(id, Number.POSITIVE_INFINITY);
      return Number.POSITIVE_INFINITY;
    }
    const d = parentDepth + 1;
    depthMemo.set(id, d);
    return d;
  }

  let maxDepth = 0;
  const maxDepthIds = [];
  for (const item of items) {
    const d = depthOf(item.id);
    if (!Number.isFinite(d)) continue;
    if (d > maxDepth) {
      maxDepth = d;
      maxDepthIds.length = 0;
      maxDepthIds.push(item.id);
    } else if (d === maxDepth) {
      maxDepthIds.push(item.id);
    }
  }

  return {
    total: items.length,
    topics: topics.length,
    branches: branches.length,
    maxDepth,
    maxDepthIds,
    emptyTitle,
    badParent,
    cycleIds: Array.from(cycleIds)
  };
}

function buildPath(items, id) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const node = byId.get(id);
  if (!node) return null;
  const chain = [];
  let cursor = node;
  const guard = new Set();
  while (cursor && !guard.has(cursor.id)) {
    chain.push(cursor);
    guard.add(cursor.id);
    cursor = cursor.parentId ? byId.get(cursor.parentId) : null;
  }
  chain.reverse();
  return chain.map((item) => ({
    id: item.id,
    title: item.title,
    chapter: item.chapter,
    gradeLabel: item.gradeLabel || item.grade,
    parentId: item.parentId || ""
  }));
}

function main() {
  const store = buildStore();
  const items = store.getCurrentFormulas();
  const report = analyze(items);

  const focusIds = process.argv
    .slice(2)
    .flatMap((arg) => arg.split(","))
    .map((id) => id.trim())
    .filter(Boolean);

  const focusedPaths = {};
  for (const id of focusIds) {
    focusedPaths[id] = buildPath(items, id);
  }

  const output = {
    summary: {
      total: report.total,
      topics: report.topics,
      branches: report.branches,
      maxDepth: report.maxDepth
    },
    integrity: {
      emptyTitleCount: report.emptyTitle.length,
      badParentCount: report.badParent.length,
      cycleCount: report.cycleIds.length
    },
    details: {
      maxDepthExampleIds: report.maxDepthIds.slice(0, 20),
      emptyTitleIds: report.emptyTitle.slice(0, 20),
      badParents: report.badParent.slice(0, 20),
      cycleIds: report.cycleIds.slice(0, 20)
    },
    focusedPaths
  };

  console.log(JSON.stringify(output, null, 2));
}

main();
