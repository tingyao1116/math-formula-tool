(() => {
  const STORAGE_KEY = "math-formula-tool-practice-playlists-v1";

  function nowIso() {
    return new Date().toISOString();
  }

  function slugify(text) {
    return String(text || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);
  }

  function normalizePlaylist(raw = {}) {
    const practiceIds = Array.isArray(raw.practiceIds)
      ? raw.practiceIds.map((value) => String(value || "").trim()).filter(Boolean)
      : [];
    const title = String(raw.title || "").trim() || "未命名清單";
    const id = String(raw.id || "").trim() || `playlist-${slugify(title) || Date.now()}`;
    return {
      id,
      title,
      description: String(raw.description || "").trim(),
      practiceIds: Array.from(new Set(practiceIds)),
      questionCount: Math.max(1, Number(raw.questionCount) || 5),
      shufflePractices: Boolean(raw.shufflePractices),
      enabled: raw.enabled !== false,
      updatedAt: String(raw.updatedAt || nowIso()),
    };
  }

  function loadAll() {
    try {
      const raw = window.localStorage?.getItem(STORAGE_KEY) || "[]";
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizePlaylist);
    } catch (_error) {
      return [];
    }
  }

  function saveAll(playlists) {
    const normalized = Array.isArray(playlists) ? playlists.map(normalizePlaylist) : [];
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function upsert(playlist) {
    const normalized = normalizePlaylist({ ...playlist, updatedAt: nowIso() });
    const current = loadAll();
    const next = current.filter((item) => item.id !== normalized.id);
    next.unshift(normalized);
    saveAll(next);
    return normalized;
  }

  function remove(id) {
    const targetId = String(id || "").trim();
    const next = loadAll().filter((item) => item.id !== targetId);
    saveAll(next);
    return next;
  }

  function getById(id) {
    const targetId = String(id || "").trim();
    return loadAll().find((item) => item.id === targetId) || null;
  }

  function exportJson(playlist) {
    return JSON.stringify(normalizePlaylist(playlist), null, 2);
  }

  function importJson(text) {
    const parsed = JSON.parse(String(text || ""));
    return normalizePlaylist(parsed);
  }

  window.practicePlaylistStore = {
    STORAGE_KEY,
    normalizePlaylist,
    loadAll,
    saveAll,
    upsert,
    remove,
    getById,
    exportJson,
    importJson,
  };
})();
