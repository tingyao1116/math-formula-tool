// 主題串資料庫存取層
// bundled 來源：data/practice-theme-chains.js（window.practiceThemeChainData，靜態資料檔）
// 覆蓋層：localStorage（老師在 GUI 調整後，可再「寫入主題串資料檔」讓全部落地）
(() => {
  const STORAGE_KEY = "math-formula-tool-practice-theme-chains-v1";

  const DIFFICULTY_ORDER = ["easy", "medium", "hard"];

  function nowIso() {
    return new Date().toISOString();
  }

  function slugify(text) {
    return String(text || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9一-鿿]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);
  }

  function normalizeChain(raw = {}) {
    const practiceIds = Array.isArray(raw.practiceIds)
      ? raw.practiceIds.map((value) => String(value || "").trim()).filter(Boolean)
      : [];
    const title = String(raw.title || "").trim() || "未命名主題串";
    const id = String(raw.id || "").trim() || `theme-${slugify(title) || Date.now()}`;
    return {
      id,
      title,
      chapterCode: String(raw.chapterCode || "").trim(),
      description: String(raw.description || "").trim(),
      practiceIds: Array.from(new Set(practiceIds)),
      questionCount: Math.max(1, Number(raw.questionCount) || 5),
      enabled: raw.enabled !== false,
      updatedAt: String(raw.updatedAt || nowIso()),
    };
  }

  function loadBundled() {
    return Array.isArray(window.practiceThemeChainData)
      ? window.practiceThemeChainData.map(normalizeChain)
      : [];
  }

  function loadLocal() {
    try {
      const raw = window.localStorage?.getItem(STORAGE_KEY) || "[]";
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeChain) : [];
    } catch (_error) {
      return [];
    }
  }

  // bundled 為基底，localStorage 同 id 覆蓋；localStorage 新 id 附加在後
  function loadAll() {
    const bundled = loadBundled();
    const bundledIds = new Set(bundled.map((chain) => chain.id));
    const local = loadLocal();
    const localById = new Map(local.map((chain) => [chain.id, chain]));
    const merged = bundled.map((chain) => localById.get(chain.id) || chain);
    const extra = local.filter((chain) => !bundledIds.has(chain.id));
    return [...merged, ...extra];
  }

  function saveToLocal(chains) {
    const normalized = Array.isArray(chains) ? chains.map(normalizeChain) : [];
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function upsert(chain) {
    const normalized = normalizeChain({ ...chain, updatedAt: nowIso() });
    const next = loadLocal().filter((item) => item.id !== normalized.id);
    next.unshift(normalized);
    saveToLocal(next);
    return normalized;
  }

  // 移除 localStorage 覆蓋版；bundled 主題串會回到資料檔預設
  function removeLocal(id) {
    const targetId = String(id || "").trim();
    const next = loadLocal().filter((item) => item.id !== targetId);
    saveToLocal(next);
    return next;
  }

  function getById(id) {
    const targetId = String(id || "").trim();
    return loadAll().find((item) => item.id === targetId) || null;
  }

  // 易→難排序：easy → medium → hard → 其他；同難度維持原相對順序（穩定排序）
  function sortIdsByDifficulty(practiceIds, getDifficulty) {
    const list = Array.isArray(practiceIds) ? practiceIds.slice() : [];
    const rank = (practiceId) => {
      const difficulty = String(
        typeof getDifficulty === "function" ? getDifficulty(practiceId) : "",
      ).trim().toLowerCase();
      const index = DIFFICULTY_ORDER.indexOf(difficulty);
      return index === -1 ? DIFFICULTY_ORDER.length : index;
    };
    return list
      .map((practiceId, index) => ({ practiceId, index, rank: rank(practiceId) }))
      .sort((a, b) => a.rank - b.rank || a.index - b.index)
      .map((entry) => entry.practiceId);
  }

  // 產生完整靜態資料檔內容（bundled + localStorage 合併後全部落地）
  function generateDataFileContent() {
    const all = loadAll();
    const total = all.reduce((sum, chain) => sum + chain.practiceIds.length, 0);
    const json = JSON.stringify(all, null, 2);
    return (
      `// 無限練習主題串靜態資料檔（由主題串編輯器寫入）\n` +
      `// 主題串數：${all.length}、題型總數：${total}\n` +
      `// 最後更新：${nowIso()}\n` +
      `window.practiceThemeChainData = ${json};\n`
    );
  }

  window.practiceThemeStore = {
    STORAGE_KEY,
    DIFFICULTY_ORDER,
    normalizeChain,
    loadBundled,
    loadLocal,
    loadAll,
    saveToLocal,
    upsert,
    removeLocal,
    getById,
    sortIdsByDifficulty,
    generateDataFileContent,
  };
})();
