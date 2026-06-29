// 題型練習進度記錄 store
// 值的狀態：true = 已完成（全對）；"partial" = 部分完成（有錯）；undefined/false = 未做
// 鍵值結構：{ [playlistId]: { [dateStr]: { [practiceId]: true | "partial" } } }
// 日程型：dateStr = "YYYY-MM-DD"；任務型：dateStr = ""
(() => {
  const STORAGE_KEY = "math-formula-tool-practice-progress-v1";

  function loadAll() {
    try {
      return JSON.parse(window.localStorage?.getItem(STORAGE_KEY) || "{}") || {};
    } catch (_e) {
      return {};
    }
  }

  function saveAll(data) {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // 標記已完成（全對）
  function mark(playlistId, dateStr, practiceId) {
    const data = loadAll();
    const pkey = String(playlistId || "");
    const dkey = String(dateStr || "");
    if (!data[pkey])       data[pkey]       = {};
    if (!data[pkey][dkey]) data[pkey][dkey] = {};
    data[pkey][dkey][practiceId] = true;
    saveAll(data);
  }

  // 標記部分完成（有錯）
  function markPartial(playlistId, dateStr, practiceId) {
    const data = loadAll();
    const pkey = String(playlistId || "");
    const dkey = String(dateStr || "");
    if (!data[pkey])       data[pkey]       = {};
    if (!data[pkey][dkey]) data[pkey][dkey] = {};
    // 若已全對，不降級為部分
    if (data[pkey][dkey][practiceId] !== true) {
      data[pkey][dkey][practiceId] = "partial";
    }
    saveAll(data);
  }

  // 取消標記
  function unmark(playlistId, dateStr, practiceId) {
    const data = loadAll();
    const pkey = String(playlistId || "");
    const dkey = String(dateStr || "");
    if (data[pkey]?.[dkey]) {
      delete data[pkey][dkey][practiceId];
      saveAll(data);
    }
  }

  // 查詢是否「已完成（全對）」
  function isCompleted(playlistId, dateStr, practiceId) {
    const data = loadAll();
    return data[String(playlistId || "")]?.[String(dateStr || "")]?.[practiceId] === true;
  }

  // 取得某日所有「已完成（全對）」的 Set
  function getCompleted(playlistId, dateStr) {
    const data   = loadAll();
    const bucket = data[String(playlistId || "")]?.[String(dateStr || "")] || {};
    return new Set(Object.keys(bucket).filter((k) => bucket[k] === true));
  }

  // 取得某日進度（僅計算全對）：{ done, total }
  function getDayProgress(playlistId, dateStr, allPracticeIds) {
    const completed = getCompleted(playlistId, dateStr);
    const total     = allPracticeIds.length;
    const done      = allPracticeIds.filter((id) => completed.has(id)).length;
    return { done, total };
  }

  // 清除某日進度
  function clearDate(playlistId, dateStr) {
    const data = loadAll();
    const pkey = String(playlistId || "");
    const dkey = String(dateStr || "");
    if (data[pkey]) {
      delete data[pkey][dkey];
      saveAll(data);
    }
  }

  // 取得某清單所有有進度的日期
  function getTrackedDates(playlistId) {
    const data = loadAll();
    return Object.keys(data[String(playlistId || "")] || {}).filter((d) => d !== "");
  }

  window.practiceProgressStore = {
    loadAll,
    mark,
    markPartial,
    unmark,
    isCompleted,
    getCompleted,
    getDayProgress,
    clearDate,
    getTrackedDates,
  };
})();
