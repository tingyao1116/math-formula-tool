(() => {
  const STORAGE_KEY = "math-formula-tool-practice-playlists-v2";

  // 年級選項（供 builder / player 共用）
  const GRADE_OPTIONS = [
    "全部年級",
    "國中複習",
    "高中複習",
    "國中章節重點",
    "高中章節重點",
    "小五",
    "小六",
    "國一",
    "國二",
    "國三",
    "高一",
    "高二",
    "高三",
    "其他"
  ];
  // 清單類型
  const PLAYLIST_TYPES = ["任務型", "日程型"];

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
      grade: String(raw.grade || "全部年級").trim(),
      playlistType: PLAYLIST_TYPES.includes(String(raw.playlistType || "").trim())
        ? String(raw.playlistType).trim()
        : "任務型",
      playlistCategory: String(raw.playlistCategory || "").trim(),
      chapterGroup: String(raw.chapterGroup || "").trim(),
      practiceIds: Array.from(new Set(practiceIds)),
      questionCount: Math.max(1, Number(raw.questionCount) || 5),
      shufflePractices: Boolean(raw.shufflePractices),
      enabled: raw.enabled !== false,
      updatedAt: String(raw.updatedAt || nowIso()),
      // 日程型專用：週計畫設定（任務型忽略此欄）
      scheduleConfig: raw.scheduleConfig || null,
    };
  }

  // 各章「主題串排序 + 練習本體即時資料」合併後的題型順序
  // （主題串只存排序，新題型自動附加在該章最後）
  function buildMergedChapterOrderMap() {
    const byId = window.practiceLibraryStore?.byId || {};
    const liveMap = new Map();
    Object.values(byId).forEach((record) => {
      if (!record || record.enabled === false) return;
      const code = String(record.chapterCode || "").trim();
      const id = String(record.id || "").trim();
      if (!code || !id) return;
      if (!liveMap.has(code)) liveMap.set(code, []);
      liveMap.get(code).push(id);
    });
    const chains = Array.isArray(window.practiceThemeChainData) ? window.practiceThemeChainData : [];
    chains.forEach((chain) => {
      const code = String(chain?.chapterCode || "").trim();
      if (!code || !liveMap.has(code)) return;
      const live = liveMap.get(code);
      const liveSet = new Set(live);
      const stored = (Array.isArray(chain.practiceIds) ? chain.practiceIds : [])
        .map((pid) => String(pid || "").trim())
        .filter((pid) => liveSet.has(pid));
      const storedSet = new Set(stored);
      liveMap.set(code, stored.concat(live.filter((pid) => !storedSet.has(pid))));
    });
    return liveMap;
  }

  // 自訂主題串的 items（小類/大類）即時展開成題型清單
  function expandCustomChainItems(chain, mergedChapterMap) {
    const items = Array.isArray(chain?.items) ? chain.items : [];
    if (!items.length) {
      return Array.isArray(chain?.practiceIds) ? chain.practiceIds : [];
    }
    const expanded = [];
    const seen = new Set();
    items.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const kind = String(item.type || "practice");
      const itemId = String(item.id || "").trim();
      if (!itemId) return;
      const ids = kind === "chapter" ? (mergedChapterMap.get(itemId) || []) : [itemId];
      ids.forEach((pid) => {
        if (!seen.has(pid)) {
          seen.add(pid);
          expanded.push(pid);
        }
      });
    });
    return expanded;
  }

  // GUI 自訂主題串（data/practice-custom-theme-chains.js，單向同步、網頁只讀取播放）
  function loadCustomThemePlaylists() {
    const chains = Array.isArray(window.practiceCustomThemeChainData)
      ? window.practiceCustomThemeChainData
      : [];
    const mergedChapterMap = buildMergedChapterOrderMap();
    return chains
      .filter((chain) => chain && chain.enabled !== false && String(chain.id || "").trim())
      .map((chain) => {
        const category = String(chain.category || "自訂").trim() || "自訂";
        const title = String(chain.title || chain.id || "").trim();
        return normalizePlaylist({
          id: String(chain.id || "").trim(),
          // 複習必做／章節重點的標題本身已含分類字樣，只有自訂串加前綴
          title: category === "自訂" ? `【自訂】${title}` : title,
          description: String(chain.description || "").trim() || "來自 GUI 主題串資料庫（請在 GUI 修改）",
          grade: String(chain.grade || "全部年級").trim() || "全部年級",
          playlistType: "任務型",
          playlistCategory: category === "自訂" ? "其他" : category,
          practiceIds: expandCustomChainItems(chain, mergedChapterMap),
          questionCount: Number(chain.questionCount) || 5,
          enabled: chain.enabled !== false,
          updatedAt: chain.updatedAt,
        });
      });
  }

  function customThemePlaylistIds() {
    return new Set(loadCustomThemePlaylists().map((playlist) => playlist.id));
  }

  // ── 讀取：bundled 資料檔優先，localStorage 補充（使用者自行新增）──────────
  function loadAll() {
    const customThemePlaylists = loadCustomThemePlaylists();
    const customThemeIds = new Set(customThemePlaylists.map((playlist) => playlist.id));
    const bundled = (Array.isArray(window.practicePlaylistData)
      ? window.practicePlaylistData.map(normalizePlaylist)
      : []
    )
      .filter((playlist) => !customThemeIds.has(playlist.id))
      .concat(customThemePlaylists);
    const bundledIds = new Set(bundled.map((p) => p.id));

    try {
      const raw = window.localStorage?.getItem(STORAGE_KEY) || "[]";
      const parsed = JSON.parse(raw);
      const local = Array.isArray(parsed) ? parsed.map(normalizePlaylist) : [];
      // localStorage 同 id 視為覆蓋 bundled；刪除 local 版本後會回到 bundled 預設。
      const localById = new Map(local.map((playlist) => [playlist.id, playlist]));
      const mergedBundled = bundled.map((playlist) => localById.get(playlist.id) || playlist);
      const extra = local.filter((p) => !bundledIds.has(p.id));
      return [...mergedBundled, ...extra];
    } catch (_error) {
      return bundled;
    }
  }

  // 取得純 localStorage 清單（不包含 bundled）
  function loadLocal() {
    try {
      const raw = window.localStorage?.getItem(STORAGE_KEY) || "[]";
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizePlaylist) : [];
    } catch (_error) {
      return [];
    }
  }

  // 寫入 localStorage
  function saveToLocal(playlists) {
    const normalized = Array.isArray(playlists) ? playlists.map(normalizePlaylist) : [];
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function upsert(playlist) {
    const normalized = normalizePlaylist({ ...playlist, updatedAt: nowIso() });
    const current = loadLocal();
    const next = current.filter((item) => item.id !== normalized.id);
    next.unshift(normalized);
    saveToLocal(next);
    return normalized;
  }

  function remove(id) {
    const targetId = String(id || "").trim();
    // 只能刪除 localStorage 中的清單（bundled 清單由老師從資料檔移除）
    const next = loadLocal().filter((item) => item.id !== targetId);
    saveToLocal(next);
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

  // 產生資料檔內容，老師下載後手動替換 data/practice-playlists.js
  // 注意：GUI 自訂主題串（practice-custom-theme-chains.js）是唯讀來源，不落地到這個檔。
  function generateDataFileContent() {
    const customIds = customThemePlaylistIds();
    const all = loadAll().filter((playlist) => !customIds.has(playlist.id));
    const json = JSON.stringify(all, null, 2);
    return `// 無限練習清單靜態資料檔（由編輯器產生）\n// 最後更新：${nowIso()}\nwindow.practicePlaylistData = ${json};\n`;
  }

  window.practicePlaylistStore = {
    STORAGE_KEY,
    GRADE_OPTIONS,
    PLAYLIST_TYPES,
    normalizePlaylist,
    loadAll,
    loadLocal,
    saveToLocal,
    upsert,
    remove,
    getById,
    exportJson,
    importJson,
    generateDataFileContent,
  };
})();
