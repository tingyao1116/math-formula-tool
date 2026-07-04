(() => {
  const store = window.formulaDataStore || null;
  const toolkit = window.formulaToolkit || null;
  const practiceStore = window.formulaPracticeStore || null;
  const practiceLibrary = window.practiceLibraryStore || null;
  const generatorLoader = window.practiceGeneratorLoader || null;

  const elements = {
    gradeFilter: document.getElementById("gradeFilter"),
    chapterFilter: document.getElementById("chapterFilter"),
    chapterPracticeCatalog: document.getElementById("chapterPracticeCatalog"),
    catalogBindingModeButton: document.getElementById("catalogBindingModeButton"),
    catalogRecordModeButton: document.getElementById("catalogRecordModeButton"),
    keywordInput: document.getElementById("keywordInput"),
    resetButton: document.getElementById("resetButton"),
    resultTitle: document.getElementById("resultTitle"),
    resultCount: document.getElementById("resultCount"),
    practiceBoard: document.getElementById("practiceBoard"),
    emptyState: document.getElementById("emptyState"),
  };

  if (!store || !toolkit) {
    console.warn("practice bank dependencies not loaded");
    return;
  }

  if (!practiceStore) {
    console.warn("practice bank loaded without formulaPracticeStore; filters will render but practice configs may be incomplete");
  }

  // 主題串順序（data/practice-theme-chains.js）：題型排序跟著主題串的練習順序走。
  // 每個題型 id 只屬於一個小章節主題串，所以全域一張 id → 順序索引表即可。
  const themeOrderLookup = (() => {
    const lookup = new Map();
    const chains = Array.isArray(window.practiceThemeChainData) ? window.practiceThemeChainData : [];
    chains.forEach((chain) => {
      (Array.isArray(chain?.practiceIds) ? chain.practiceIds : []).forEach((pid, index) => {
        const key = String(pid || "").trim();
        if (key && !lookup.has(key)) lookup.set(key, index);
      });
    });
    return lookup;
  })();

  function themeOrderOf(id) {
    const value = themeOrderLookup.get(String(id || "").trim());
    return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
  }

  // 小類 → 所屬大類（僅計啟用中的大類；資料夾檢視用）
  const practiceParentsByChild = (() => {
    const map = new Map();
    Object.values(practiceLibrary?.byId || {}).forEach((record) => {
      if (!record || record.enabled === false) return;
      const pid = String(record.id || "").trim();
      const kids = Array.isArray(record.relatedPracticeIds) ? record.relatedPracticeIds : [];
      if (!pid || !kids.length) return;
      kids.forEach((kidRaw) => {
        const kid = String(kidRaw || "").trim();
        if (!kid) return;
        if (!map.has(kid)) map.set(kid, []);
        map.get(kid).push(pid);
      });
    });
    return map;
  })();

  const allItems = store.getCurrentFormulas ? store.getCurrentFormulas() : [];
  const topicIdSet = new Set(
    allItems
      .map((item) => String(item?.id || "").trim())
      .filter(Boolean)
  );
  const chapterOptions = (store.getChapterOptions?.() || []).slice().sort(compareChapterCodes);
  const chapterOptionByCode = new Map(
    chapterOptions.map((entry) => [String(entry?.code || "").trim(), entry])
  );
  const chapterLabelLookup = Object.fromEntries(
    chapterOptions.map((entry) => [String(entry.code || ""), String(entry.label || entry.code || "")])
  );
  const urlParams = new URLSearchParams(window.location.search);
  const initialChapterCode = urlParams.get("chapter") || "j1-1-1";
  const initialPracticeId = String(urlParams.get("practice") || "").trim();
  const gradeOrder = [
    "\u570b\u5c0f\u56db\u5e74\u7d1a",
    "\u570b\u5c0f\u4e94\u5e74\u7d1a",
    "\u570b\u5c0f\u516d\u5e74\u7d1a",
    "\u570b\u4e00\u4e0a",
    "\u570b\u4e00\u4e0b",
    "\u570b\u4e8c\u4e0a",
    "\u570b\u4e8c\u4e0b",
    "\u570b\u4e09\u4e0a",
    "\u570b\u4e09\u4e0b",
    "\u9ad8\u4e00\u4e0a",
    "\u9ad8\u4e00\u4e0b",
    "\u9ad8\u4e8c\u4e0a",
    "\u9ad8\u4e8c\u4e0b",
    "\u9ad8\u4e09",
    "\u5176\u4ed6",
  ];
  const initialChapterMeta = chapterOptionByCode.get(String(initialChapterCode || "").trim()) || null;
  const gradeOptions = buildGradeOptions();

  const state = {
    gradeKey: initialChapterMeta ? getGradeKey(initialChapterMeta.stage, initialChapterMeta.grade, initialChapterMeta.term) : "all",
    chapterCode: chapterLabelLookup[initialChapterCode] ? initialChapterCode : "all",
    keyword: "",
    practiceId: initialPracticeId,
    catalogMode: "record",
  };
  const COMPOSITE_SESSION_STORAGE_KEY = "math-formula-tool-composite-sessions-v3";

  function getNormalizedTermLabel(term) {
    const text = String(term || "").trim();
    if (!text) return "";
    if (text.includes("\u4e0a")) return "\u4e0a";
    if (text.includes("\u4e0b")) return "\u4e0b";
    return "";
  }

  function getGradeKey(stage, grade, term) {
    const stageText = String(stage || "").trim();
    const gradeText = String(grade || "").trim();
    const termText = getNormalizedTermLabel(term);
    if (stageText === "\u570b\u5c0f" && gradeText === "\u5c0f\u56db") return "\u570b\u5c0f\u56db\u5e74\u7d1a";
    if (stageText === "\u570b\u5c0f" && gradeText === "\u5c0f\u4e94") return "\u570b\u5c0f\u4e94\u5e74\u7d1a";
    if (stageText === "\u570b\u5c0f" && gradeText === "\u5c0f\u516d") return "\u570b\u5c0f\u516d\u5e74\u7d1a";
    if (stageText === "\u570b\u4e2d" && gradeText === "\u570b\u4e00" && termText === "\u4e0a") return "\u570b\u4e00\u4e0a";
    if (stageText === "\u570b\u4e2d" && gradeText === "\u570b\u4e00" && termText === "\u4e0b") return "\u570b\u4e00\u4e0b";
    if (stageText === "\u570b\u4e2d" && gradeText === "\u570b\u4e8c" && termText === "\u4e0a") return "\u570b\u4e8c\u4e0a";
    if (stageText === "\u570b\u4e2d" && gradeText === "\u570b\u4e8c" && termText === "\u4e0b") return "\u570b\u4e8c\u4e0b";
    if (stageText === "\u570b\u4e2d" && gradeText === "\u570b\u4e09" && termText === "\u4e0a") return "\u570b\u4e09\u4e0a";
    if (stageText === "\u570b\u4e2d" && gradeText === "\u570b\u4e09" && termText === "\u4e0b") return "\u570b\u4e09\u4e0b";
    if (stageText === "\u9ad8\u4e2d" && gradeText === "\u9ad8\u4e00" && termText === "\u4e0a") return "\u9ad8\u4e00\u4e0a";
    if (stageText === "\u9ad8\u4e2d" && gradeText === "\u9ad8\u4e00" && termText === "\u4e0b") return "\u9ad8\u4e00\u4e0b";
    if (stageText === "\u9ad8\u4e2d" && gradeText === "\u9ad8\u4e8c" && termText === "\u4e0a") return "\u9ad8\u4e8c\u4e0a";
    if (stageText === "\u9ad8\u4e2d" && gradeText === "\u9ad8\u4e8c" && termText === "\u4e0b") return "\u9ad8\u4e8c\u4e0b";
    if (stageText === "\u9ad8\u4e2d" && gradeText === "\u9ad8\u4e09") return "\u9ad8\u4e09";
    return "\u5176\u4ed6";
  }

  function getGradeLabel(stage, grade, term) {
    return getGradeKey(stage, grade, term) || "\u5176\u4ed6";
  }

  function buildGradeOptions() {
    const rows = [];
    const seen = new Set();
    chapterOptions.forEach((entry) => {
      const key = getGradeKey(entry?.stage, entry?.grade, entry?.term);
      if (!key || seen.has(key)) return;
      seen.add(key);
      rows.push({
        key,
        label: getGradeLabel(entry?.stage, entry?.grade, entry?.term),
      });
    });
    return rows.sort((a, b) => gradeOrder.indexOf(a.key) - gradeOrder.indexOf(b.key));
  }

  function hasInfinitePractice(item) {
    const contentTypes = Array.isArray(item?.contentTypes) ? item.contentTypes.map((value) => String(value || "").trim()) : [];
    if (!contentTypes.includes("無限練習")) return false;
    return Boolean(practiceStore.getConfig?.(item?.id));
  }

  function normalizeTextList(values) {
    return Array.isArray(values) ? values.filter((value) => String(value || "").trim()) : [];
  }

  function buildPracticeChapterMap() {
    const mapping = {};
    const byChapter = practiceLibrary?.byChapter || {};
    for (const [chapterCode, practiceIds] of Object.entries(byChapter)) {
      for (const [index, practiceId] of (Array.isArray(practiceIds) ? practiceIds : []).entries()) {
        const normalizedId = String(practiceId || "").trim();
        if (!normalizedId) continue;
        const bucket = mapping[normalizedId] || [];
        if (!bucket.some((entry) => entry.code === chapterCode)) {
          bucket.push({ code: chapterCode, order: index });
        }
        mapping[normalizedId] = bucket;
      }
    }
    return mapping;
  }

  function buildPracticeSourceTopicIdSet() {
    const ids = new Set();
    for (const record of Object.values(practiceLibrary?.byId || {})) {
      const normalizedId = String(record?.generatorKey || record?.practiceKey || "").trim();
      if (!normalizedId || !topicIdSet.has(normalizedId)) continue;
      ids.add(normalizedId);
    }
    return ids;
  }

  function buildIndependentPracticeItems(options = {}) {
    const includeUnboundByChapterCode = Boolean(options.includeUnboundByChapterCode);
    const chapterMap = buildPracticeChapterMap();
    const records = Object.values(practiceLibrary?.byId || {}).filter((row) => {
      if (!row || row.enabled === false) return false;
      const recordId = String(row.id || "").trim();
      const mapped = Array.isArray(chapterMap[recordId]) ? chapterMap[recordId] : [];
      if (mapped.length > 0) return true;
      if (!includeUnboundByChapterCode) return false;
      return Boolean(String(row?.chapterCode || "").trim());
    });
    return records.map((record) => {
      const recordId = String(record.id || "").trim();
      const chapterMeta = chapterMap[recordId] || [];
      const chapterCodes = chapterMeta.map((entry) => typeof entry === "string" ? entry : entry.code);
      const chapterOrderLookup = Object.fromEntries(
        chapterMeta
          .filter((entry) => entry && typeof entry === "object")
          .map((entry) => [String(entry.code || ""), Number(entry.order || 0)])
      );
      const recordChapterCode = String(record?.chapterCode || "").trim();
      const effectiveChapterCodes = chapterCodes.length
        ? chapterCodes
        : (recordChapterCode ? [recordChapterCode] : []);
      const chapterCode = effectiveChapterCodes[0] || "";
      const chapterLabel = chapterLabelLookup[chapterCode] || chapterCode;
      return {
        id: recordId,
        title: String(record.title || "").trim() || "無限練習",
        stage: String(record.stage || "").trim(),
        grade: String(record.grade || "").trim(),
        term: String(record.term || "").trim(),
        chapter: String(record.chapter || "").trim() || chapterLabel,
        chapterCode,
        chapterCodes: effectiveChapterCodes,
        domain: String(record.domain || "").trim() || "無限練習",
        difficulty: String(record.difficulty || "").trim(),
        contentTypes: ["無限練習"],
        tags: normalizeTextList(record.tags),
        usage: normalizeTextList(record.usage),
        examples: normalizeTextList(record.examples),
        tips: normalizeTextList(record.tips),
        notes: normalizeTextList(record.notes),
        mistakes: normalizeTextList(record.mistakes),
        practiceSource: "library",
        chapterOrderLookup,
        subtypeCount: Number(record.subtypeCount || 0) || undefined,
        generatorBundle: String(record.generatorBundle || "").trim(),
        relatedPracticeIds: normalizeTextList(record.relatedPracticeIds),
      };
    });
  }

  const independentItems = buildIndependentPracticeItems();
  const recordAssignedItems = buildIndependentPracticeItems({ includeUnboundByChapterCode: true });
  const relatedChildPracticeIds = new Set(
    Object.values(practiceLibrary?.byId || {})
      .flatMap((record) => Array.isArray(record?.relatedPracticeIds) ? record.relatedPracticeIds : [])
      .map((value) => String(value || "").trim())
      .filter(Boolean)
  );
  const practiceItems = independentItems;

  function getSourcePracticeItemsByMode() {
    return state.catalogMode === "record" ? recordAssignedItems : practiceItems;
  }

  function buildChapterPracticeCatalogItems() {
    const counts = new Map();
    const leafCounts = new Map();
    for (const item of practiceItems) {
      const practiceId = String(item?.id || "").trim();
      // 小類＝真正的生成函數（沒有 relatedPracticeIds 的題型）；大類＝小類合併的資料夾
      const isLeaf = !(Array.isArray(item?.relatedPracticeIds) && item.relatedPracticeIds.length);
      const chapterCodes = Array.isArray(item?.chapterCodes) && item.chapterCodes.length
        ? item.chapterCodes
        : [getItemChapterCode(item)].filter(Boolean);
      const seen = new Set();
      for (const rawCode of chapterCodes) {
        const chapterCode = String(rawCode || "").trim();
        if (!chapterCode || seen.has(chapterCode)) continue;
        seen.add(chapterCode);
        counts.set(chapterCode, (counts.get(chapterCode) || 0) + 1);
        if (isLeaf) leafCounts.set(chapterCode, (leafCounts.get(chapterCode) || 0) + 1);
      }
    }

    const chapterRows = chapterOptions
      .map((entry) => {
        const code = String(entry?.code || "").trim();
        return {
          code,
          label: String(entry?.label || code).trim() || code,
          count: counts.get(code) || 0,
          leafCount: leafCounts.get(code) || 0,
        };
      })
      .filter((row) => row.count > 0);

    const totalLeaf = practiceItems.filter(
      (item) => !(Array.isArray(item?.relatedPracticeIds) && item.relatedPracticeIds.length),
    ).length;
    return [
      { code: "all", label: "全部章節", count: practiceItems.length, leafCount: totalLeaf },
      ...chapterRows,
    ];
  }

  function buildChapterPracticeRecordCatalogItems() {
    const counts = new Map();
    const leafCounts = new Map();
    const records = Object.values(practiceLibrary?.byId || {}).filter((row) => row && row.enabled !== false);
    for (const record of records) {
      const chapterCode = String(record?.chapterCode || "").trim();
      if (!chapterCode) continue;
      counts.set(chapterCode, (counts.get(chapterCode) || 0) + 1);
      // 小類＝真正的生成函數（沒有 relatedPracticeIds）；大類＝小類合併的資料夾
      if (!(Array.isArray(record?.relatedPracticeIds) && record.relatedPracticeIds.length)) {
        leafCounts.set(chapterCode, (leafCounts.get(chapterCode) || 0) + 1);
      }
    }

    const chapterRows = chapterOptions
      .map((entry) => {
        const code = String(entry?.code || "").trim();
        return {
          code,
          label: String(entry?.label || code).trim() || code,
          count: counts.get(code) || 0,
          leafCount: leafCounts.get(code) || 0,
        };
      })
      .filter((row) => row.count > 0);

    const withChapter = records.filter((record) => Boolean(String(record?.chapterCode || "").trim()));
    return [
      {
        code: "all",
        label: "全部章節",
        count: withChapter.length,
        leafCount: withChapter.filter(
          (record) => !(Array.isArray(record?.relatedPracticeIds) && record.relatedPracticeIds.length),
        ).length,
      },
      ...chapterRows,
    ];
  }

  const chapterPracticeCatalogItems = buildChapterPracticeCatalogItems();
  const chapterPracticeRecordCatalogItems = buildChapterPracticeRecordCatalogItems();

  function matchesGradeFilterByChapterCode(code) {
    if (state.gradeKey === "all") return true;
    const meta = chapterOptionByCode.get(String(code || "").trim()) || null;
    if (!meta) return false;
    return getGradeKey(meta.stage, meta.grade, meta.term) === state.gradeKey;
  }

  function getVisibleChapterOptions() {
    return chapterOptions.filter((entry) => matchesGradeFilterByChapterCode(entry.code));
  }

  function matchesGradeFilter(item) {
    if (state.gradeKey === "all") return true;
    const chapterCodes = Array.isArray(item?.chapterCodes) && item.chapterCodes.length
      ? item.chapterCodes
      : [getItemChapterCode(item)].filter(Boolean);
    if (chapterCodes.length) {
      return chapterCodes.some((code) => matchesGradeFilterByChapterCode(code));
    }
    return getGradeKey(item?.stage, item?.grade, item?.term) === state.gradeKey;
  }

  function getVisibleCatalogRows(sourceRows) {
    const chapterRows = sourceRows.filter((row) => row.code !== "all" && matchesGradeFilterByChapterCode(row.code));
    const activeGrade = gradeOptions.find((entry) => entry.key === state.gradeKey) || null;
    const allCount = state.catalogMode === "record"
      ? Object.values(practiceLibrary?.byId || {}).filter((record) => {
          if (!record || record.enabled === false) return false;
          const chapterCode = String(record?.chapterCode || "").trim();
          if (!chapterCode) return false;
          return matchesGradeFilterByChapterCode(chapterCode);
        }).length
      : practiceItems.filter((item) => matchesGradeFilter(item)).length;
    return [
      {
        code: "all",
        label: activeGrade ? `${activeGrade.label}・全部章節` : "全部章節",
        count: allCount,
      },
      ...chapterRows,
    ];
  }

  function compareChapterCodes(a, b) {
    const left = String(a?.code || "");
    const right = String(b?.code || "");
    return left.localeCompare(right, "zh-Hant", { numeric: true });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function populateChapterFilter() {
    if (!elements.chapterFilter) return;
    const options = ['<option value="all">全部章節</option>'];
    for (const entry of chapterOptions) {
      options.push(`<option value="${escapeHtml(entry.code)}">${escapeHtml(entry.label || entry.code)}</option>`);
    }
    elements.chapterFilter.innerHTML = options.join("");
    elements.chapterFilter.value = state.chapterCode;
  }

  function renderChapterPracticeCatalog() {
    if (!elements.chapterPracticeCatalog) return;
    const sourceRows = state.catalogMode === "record"
      ? chapterPracticeRecordCatalogItems
      : chapterPracticeCatalogItems;
    if (elements.catalogBindingModeButton) {
      elements.catalogBindingModeButton.classList.toggle("is-active", state.catalogMode === "binding");
    }
    if (elements.catalogRecordModeButton) {
      elements.catalogRecordModeButton.classList.toggle("is-active", state.catalogMode === "record");
    }
    elements.chapterPracticeCatalog.innerHTML = sourceRows
      .map((row) => `
        <button
          type="button"
          class="chapter-practice-catalog__item ${state.chapterCode === row.code ? "is-active" : ""}"
          data-chapter-catalog-code="${escapeHtml(row.code)}"
        >
          <span class="chapter-practice-catalog__label">${escapeHtml(row.label)}</span>
          <span class="chapter-practice-catalog__count">${escapeHtml(String(row.leafCount ?? row.count))} 小類 / ${escapeHtml(String(row.count))} 題型</span>
        </button>
      `)
      .join("");
  }

  function getItemChapterCode(item) {
    return item?.chapterCode || store.getChapterCode?.(item?.stage, item?.grade, item?.term, item?.chapter) || "";
  }

  function matchesChapterFilter(item) {
    if (state.chapterCode === "all") return true;
    const chapterCodes = Array.isArray(item?.chapterCodes) ? item.chapterCodes : [];
    if (chapterCodes.includes(state.chapterCode)) return true;
    return getItemChapterCode(item) === state.chapterCode;
  }

  function getPracticeKeywordText(item) {
    const config = practiceStore.getConfig?.(item?.id) || {};
    const parts = [
      item?.title,
      item?.chapter,
      item?.domain,
      getItemChapterCode(item),
      ...(Array.isArray(item?.tags) ? item.tags : []),
      config?.title,
      config?.difficulty,
      item?.practiceSource,
    ];
    return parts.filter(Boolean).join(" ").toLowerCase();
  }

  function getFilteredItems() {
    const sourceItems = getSourcePracticeItemsByMode();
    const keyword = state.keyword.trim().toLowerCase();
    return sourceItems.filter((item) => {
      const itemId = String(item?.id || "").trim();
      const chapterOk = matchesChapterFilter(item);
      const keywordOk = !keyword || getPracticeKeywordText(item).includes(keyword);
      const practiceOk = !state.practiceId || itemId === state.practiceId;
      return chapterOk && keywordOk && practiceOk;
    }).slice().sort((a, b) => {
      // 全部章節時先依章節分組，再依主題串順序，最後才比標題
      if (state.chapterCode === "all") {
        const chapterDiff = String(a?.chapterCode || "").localeCompare(String(b?.chapterCode || ""), "zh-Hant", { numeric: true });
        if (chapterDiff !== 0) return chapterDiff;
      }
      const themeDiff = themeOrderOf(a?.id) - themeOrderOf(b?.id);
      if (themeDiff !== 0) return themeDiff;
      return String(a?.title || "").localeCompare(String(b?.title || ""), "zh-Hant");
    });
  }

  function getCompositeChapterItems() {
    if (state.chapterCode === "all" || state.practiceId) return [];
    const items = getFilteredItems();
    // 資料夾檢視：已歸檔的小類只透過其大類的展開出現，不再單獨重複一次
    const presentFolderIds = new Set(
      items
        .filter((item) => Array.isArray(item?.relatedPracticeIds) && item.relatedPracticeIds.length)
        .map((item) => String(item?.id || "").trim()),
    );
    return items.filter((item) => {
      const itemId = String(item?.id || "").trim();
      const owners = practiceParentsByChild.get(itemId) || [];
      return !owners.some((owner) => presentFolderIds.has(owner));
    });
  }

  function renderCompositePracticeSection(position = "bottom") {
    const items = getCompositeChapterItems();
    if (!items.length) return "";
    const chapterLabel =
      chapterOptions.find((entry) => entry.code === state.chapterCode)?.label || state.chapterCode;
    return `
      <section class="panel chapter-composite-practice" data-chapter-composite="${escapeHtml(state.chapterCode)}" data-chapter-composite-position="${escapeHtml(position)}">
        <div class="topic-cluster__header">
          <div>
            <p class="summary-label">本章綜合練習</p>
            <h3>${escapeHtml(chapterLabel)} 綜合練習</h3>
            <p class="detail-note">這一區會從本章每個無限練習各出 1 題，適合做章節總複習。</p>
          </div>
        </div>
        <div class="interactive-actions interactive-actions--stacked">
          <div class="interactive-actions__row interactive-actions__row--split">
            <button type="button" class="ghost-button" data-chapter-composite-generate="${escapeHtml(state.chapterCode)}">出題</button>
            <button type="button" class="ghost-button" data-chapter-composite-regenerate="${escapeHtml(state.chapterCode)}">重新出題</button>
          </div>
          <div class="interactive-actions__row interactive-actions__row--split">
            <button type="button" class="ghost-button" data-chapter-composite-summary-reveal="${escapeHtml(state.chapterCode)}">簡答</button>
            <button type="button" class="ghost-button" data-chapter-composite-detail-reveal="${escapeHtml(state.chapterCode)}">詳解</button>
          </div>
        </div>
        <div class="interactive-output" data-chapter-composite-output>請先按出題；若想換新的一輪，再按重新出題。</div>
        <div class="interactive-output is-hidden" data-chapter-composite-answer></div>
      </section>
    `;
  }

  function buildCompositePracticeResult(items) {
    const questions = [];
    const answers = [];

    items.forEach((item) => {
      const config = practiceStore.getConfig?.(item?.id) || null;
      if (!config) return;
      const title = String(item?.title || config?.title || item?.id || "未命名練習").trim();

      if (config.type === "fixed-example") {
        const prompt = String(config.prompt || "").trim();
        const answer = String(config.answer || "").trim();
        if (prompt) questions.push(`<strong>${escapeHtml(title)}</strong>：${toolkit.renderRichTextLine(prompt)}`);
        if (answer) answers.push(`<strong>${escapeHtml(title)}</strong>：${toolkit.renderRichTextLine(answer)}`);
        return;
      }

      if (typeof config.generate !== "function") return;
      const result = config.generate(item) || {};
      const question = Array.isArray(result.questions) ? String(result.questions[0] || "").trim() : "";
      const answer = Array.isArray(result.answers) ? String(result.answers[0] || "").trim() : "";
      if (question) questions.push(`<strong>${escapeHtml(title)}</strong>：${toolkit.renderRichTextLine(question)}`);
      if (answer) answers.push(`<strong>${escapeHtml(title)}</strong>：${toolkit.renderRichTextLine(answer)}`);
    });

    return { questions, answers };
  }

  function bindCompositePracticeEvents() {
    elements.practiceBoard?.querySelectorAll("[data-chapter-composite-generate]").forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", () => {
        const chapterCode = button.getAttribute("data-chapter-composite-generate") || "";
        const section = button.closest("[data-chapter-composite]");
        const output = section?.querySelector("[data-chapter-composite-output]");
        const answerBox = section?.querySelector("[data-chapter-composite-answer]");
        const result = buildCompositePracticeResult(getCompositeChapterItems());

        if (output) {
          output.innerHTML = result.questions.length
            ? `<ol>${result.questions.map((question) => `<li>${question}</li>`).join("")}</ol>`
            : "目前沒有可組合的題目。";
        }
        if (answerBox) {
          answerBox.innerHTML = result.answers.length
            ? `<ol>${result.answers.map((answer) => `<li>${answer}</li>`).join("")}</ol>`
            : "目前沒有答案。";
          answerBox.classList.add("is-hidden");
        }
      });
    });

    elements.practiceBoard?.querySelectorAll("[data-chapter-composite-reveal]").forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", () => {
        const section = button.closest("[data-chapter-composite]");
        const answerBox = section?.querySelector("[data-chapter-composite-answer]");
        if (answerBox) answerBox.classList.toggle("is-hidden");
      });
    });
  }

  function updateSummary(items) {
    const chapterLabel =
      state.chapterCode === "all"
        ? "全部章節"
        : chapterOptions.find((entry) => entry.code === state.chapterCode)?.label || state.chapterCode;
    if (elements.resultTitle) {
      elements.resultTitle.textContent = state.chapterCode === "all" ? "全部無限練習" : `${chapterLabel} 的無限練習`;
    }
    if (elements.resultCount) {
      elements.resultCount.textContent = `共 ${items.length} 個可練習項目`;
    }
  }

  function renderEmptyState(message) {
    if (elements.emptyState) {
      elements.emptyState.hidden = false;
      elements.emptyState.innerHTML = `<p>${escapeHtml(message)}</p>`;
    }
    if (elements.practiceBoard) {
      elements.practiceBoard.innerHTML = "";
    }
  }

  function renderBoard(items) {
    updateSummary(items);
    if (!items.length) {
      renderEmptyState("目前沒有符合條件的無限練習項目。");
      return;
    }

    if (elements.emptyState) {
      elements.emptyState.hidden = true;
      elements.emptyState.innerHTML = "";
    }

    if (elements.practiceBoard) {
      elements.practiceBoard.innerHTML = [
        renderCompositePracticeSection("top"),
        items.map((item) => toolkit.renderCard(item, { showShareLink: item.practiceSource !== "library" })).join(""),
        renderCompositePracticeSection("bottom"),
      ].filter(Boolean).join("");
      bindCompositePracticeEvents();
      toolkit.bindInteractiveEvents?.(elements.practiceBoard);
    }
  }

  function syncControls() {
    if (elements.chapterFilter) elements.chapterFilter.value = state.chapterCode;
    if (elements.keywordInput) elements.keywordInput.value = state.keyword;
  }

  function render() {
    syncControls();
    renderChapterPracticeCatalog();
    renderBoard(getFilteredItems());
  }

  function resetFilters() {
    state.chapterCode = "all";
    state.keyword = "";
    state.practiceId = "";
    render();
  }

  function bindEvents() {
    elements.chapterFilter?.addEventListener("change", (event) => {
      state.chapterCode = event.target.value;
      state.practiceId = "";
      render();
    });

    elements.chapterPracticeCatalog?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-chapter-catalog-code]");
      if (!button) return;
      state.chapterCode = button.getAttribute("data-chapter-catalog-code") || "all";
      state.practiceId = "";
      render();
    });

    elements.catalogBindingModeButton?.addEventListener("click", () => {
      state.catalogMode = "binding";
      renderChapterPracticeCatalog();
    });

    elements.catalogRecordModeButton?.addEventListener("click", () => {
      state.catalogMode = "record";
      renderChapterPracticeCatalog();
    });

    elements.keywordInput?.addEventListener("input", (event) => {
      state.keyword = event.target.value || "";
      render();
    });

    elements.resetButton?.addEventListener("click", () => {
      resetFilters();
    });
  }

  function populateGradeFilter() {
    if (!elements.gradeFilter) return;
    const options = ['<option value="all">全部年級</option>'];
    gradeOptions.forEach((entry) => {
      options.push(`<option value="${escapeHtml(entry.key)}">${escapeHtml(entry.label)}</option>`);
    });
    elements.gradeFilter.innerHTML = options.join("");
    elements.gradeFilter.value = gradeOptions.some((entry) => entry.key === state.gradeKey) ? state.gradeKey : "all";
  }

  function populateChapterFilter() {
    if (!elements.chapterFilter) return;
    const options = ['<option value="all">全部章節</option>'];
    const visibleChapterOptions = getVisibleChapterOptions();
    if (state.chapterCode !== "all" && !visibleChapterOptions.some((entry) => entry.code === state.chapterCode)) {
      state.chapterCode = "all";
    }
    visibleChapterOptions.forEach((entry) => {
      options.push(`<option value="${escapeHtml(entry.code)}">${escapeHtml(entry.label || entry.code)}</option>`);
    });
    elements.chapterFilter.innerHTML = options.join("");
    elements.chapterFilter.value = state.chapterCode;
  }

  function renderChapterPracticeCatalog() {
    if (!elements.chapterPracticeCatalog) return;
    const sourceRows = state.catalogMode === "record"
      ? chapterPracticeRecordCatalogItems
      : chapterPracticeCatalogItems;
    const visibleRows = getVisibleCatalogRows(sourceRows);
    if (elements.catalogBindingModeButton) {
      elements.catalogBindingModeButton.classList.toggle("is-active", state.catalogMode === "binding");
    }
    if (elements.catalogRecordModeButton) {
      elements.catalogRecordModeButton.classList.toggle("is-active", state.catalogMode === "record");
    }
    elements.chapterPracticeCatalog.innerHTML = visibleRows
      .map((row) => `
        <button
          type="button"
          class="chapter-practice-catalog__item ${state.chapterCode === row.code ? "is-active" : ""}"
          data-chapter-catalog-code="${escapeHtml(row.code)}"
        >
          <span class="chapter-practice-catalog__label">${escapeHtml(row.label)}</span>
          <span class="chapter-practice-catalog__count">${escapeHtml(String(row.leafCount ?? row.count))} 小類 / ${escapeHtml(String(row.count))} 題型</span>
        </button>
      `)
      .join("");
  }

  function matchesChapterFilter(item) {
    if (state.chapterCode === "all") return true;
    const chapterCodes = Array.isArray(item?.chapterCodes) ? item.chapterCodes : [];
    if (chapterCodes.includes(state.chapterCode)) return true;
    return getItemChapterCode(item) === state.chapterCode;
  }

  function getFilteredItems() {
    const sourceItems = getSourcePracticeItemsByMode();
    const keyword = state.keyword.trim().toLowerCase();
    return sourceItems.filter((item) => {
      const itemId = String(item?.id || "").trim();
      const gradeOk = matchesGradeFilter(item);
      const chapterOk = matchesChapterFilter(item);
      const keywordOk = !keyword || getPracticeKeywordText(item).includes(keyword);
      const practiceOk = !state.practiceId || itemId === state.practiceId;
      return gradeOk && chapterOk && keywordOk && practiceOk;
    }).slice().sort((a, b) => {
      // 全部章節時先依章節分組，再依主題串順序，最後才比標題
      if (state.chapterCode === "all") {
        const chapterDiff = String(a?.chapterCode || "").localeCompare(String(b?.chapterCode || ""), "zh-Hant", { numeric: true });
        if (chapterDiff !== 0) return chapterDiff;
      }
      const themeDiff = themeOrderOf(a?.id) - themeOrderOf(b?.id);
      if (themeDiff !== 0) return themeDiff;
      return String(a?.title || "").localeCompare(String(b?.title || ""), "zh-Hant");
    });
  }

  function getCompositeChapterItems() {
    if (state.chapterCode === "all" || state.practiceId) return [];
    const items = getFilteredItems();
    // 資料夾檢視：已歸檔的小類只透過其大類的展開出現，不再單獨重複一次
    const presentFolderIds = new Set(
      items
        .filter((item) => Array.isArray(item?.relatedPracticeIds) && item.relatedPracticeIds.length)
        .map((item) => String(item?.id || "").trim()),
    );
    return items.filter((item) => {
      const itemId = String(item?.id || "").trim();
      const owners = practiceParentsByChild.get(itemId) || [];
      return !owners.some((owner) => presentFolderIds.has(owner));
    });
  }

  function renderCompositePracticeSection(position = "bottom") {
    const items = getCompositeChapterItems();
    if (!items.length) return "";
    const chapterLabel =
      chapterOptions.find((entry) => entry.code === state.chapterCode)?.label || state.chapterCode;
    const isTop = position === "top";
    const heading = isTop ? `${chapterLabel} 綜合練習（展開版）` : `${chapterLabel} 綜合練習（抽題版）`;
    const note = isTop
      ? "上方版本會把本章每個題型各展開一整組題目，方便老師一次檢查整章題型。"
      : "下方版本維持原本的簡化模式，每個題型抽 1 題。";
    return `
      <section class="panel chapter-composite-practice" data-chapter-composite="${escapeHtml(state.chapterCode)}" data-chapter-composite-position="${escapeHtml(position)}">
        <div class="topic-cluster__header">
          <div>
            <p class="summary-label">本章綜合練習</p>
            <h3>${escapeHtml(heading)}</h3>
            <p class="detail-note">${escapeHtml(note)}</p>
          </div>
        </div>
        <div class="interactive-actions">
          <button type="button" class="ghost-button" data-chapter-composite-generate="${escapeHtml(state.chapterCode)}">出題</button>
          <button type="button" class="ghost-button" data-chapter-composite-reveal="${escapeHtml(state.chapterCode)}">顯示答案</button>
        </div>
        <div class="interactive-output" data-chapter-composite-output>請先按出題；若想換新的一輪，再按重新出題。</div>
        <div class="interactive-output is-hidden" data-chapter-composite-answer></div>
      </section>
    `;
  }

  function buildCompactCompositePracticeResult(items) {
    const questions = [];
    const answers = [];

    items.forEach((item) => {
      const config = practiceStore.getConfig?.(item?.id) || null;
      if (!config) return;
      const title = String(item?.title || config?.title || item?.id || "未命名題型").trim();

      if (config.type === "fixed-example") {
        const prompt = String(config.prompt || "").trim();
        const answer = String(config.answer || "").trim();
        if (prompt) questions.push(`<strong>${escapeHtml(title)}</strong>：${toolkit.renderRichTextLine(prompt)}`);
        if (answer) answers.push(`<strong>${escapeHtml(title)}</strong>：${toolkit.renderRichTextLine(answer)}`);
        return;
      }

      if (typeof config.generate !== "function") return;
      const result = config.generate(item) || {};
      const question = Array.isArray(result.questions) ? String(result.questions[0] || "").trim() : "";
      const answer = Array.isArray(result.answers) ? String(result.answers[0] || "").trim() : "";
      if (question) questions.push(`<strong>${escapeHtml(title)}</strong>：${toolkit.renderRichTextLine(question)}`);
      if (answer) answers.push(`<strong>${escapeHtml(title)}</strong>：${toolkit.renderRichTextLine(answer)}`);
    });

    return { questions, answers };
  }

  function buildExpandedCompositePracticeResult(items) {
    return items.map((item) => {
      const config = practiceStore.getConfig?.(item?.id) || null;
      if (!config) return null;
      const title = String(item?.title || config?.title || item?.id || "未命名題型").trim();

      if (config.type === "fixed-example") {
        const prompt = String(config.prompt || "").trim();
        const answer = String(config.answer || "").trim();
        return {
          title,
          questions: prompt ? [prompt] : [],
          answers: answer ? [answer] : [],
        };
      }

      if (typeof config.generate !== "function") return null;
      const result = config.generate(item) || {};
      const questions = Array.isArray(result.questions)
        ? result.questions.map((entry) => String(entry || "").trim()).filter(Boolean)
        : [];
      const answers = Array.isArray(result.answers)
        ? result.answers.map((entry) => String(entry || "").trim()).filter(Boolean)
        : [];
      if (!questions.length && !answers.length) return null;
      return { title, questions, answers };
    }).filter(Boolean);
  }

  function renderExpandedCompositeGroups(sections, key) {
    return sections.map((section, index) => `
      <section class="topic-cluster">
        <div class="topic-cluster__header">
          <div>
            <p class="summary-label">第 ${index + 1} 大題</p>
            <h3>${escapeHtml(section.title)}</h3>
          </div>
        </div>
        ${section[key]?.length
          ? `<ol>${section[key].map((entry) => `<li>${toolkit.renderRichTextLine(entry)}</li>`).join("")}</ol>`
          : '<p class="detail-note">這個題型目前沒有可顯示的內容。</p>'}
      </section>
    `).join("");
  }

  function bindCompositePracticeEvents() {
    elements.practiceBoard?.querySelectorAll("[data-chapter-composite-generate]").forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", () => {
        const section = button.closest("[data-chapter-composite]");
        const output = section?.querySelector("[data-chapter-composite-output]");
        const answerBox = section?.querySelector("[data-chapter-composite-answer]");
        const position = section?.getAttribute("data-chapter-composite-position") || "bottom";
        const items = getCompositeChapterItems();

        if (position === "top") {
          const sections = buildExpandedCompositePracticeResult(items);
          if (output) {
            output.innerHTML = sections.length
              ? renderExpandedCompositeGroups(sections, "questions")
              : "目前沒有可生成的本章綜合練習。";
          }
          if (answerBox) {
            answerBox.innerHTML = sections.length
              ? renderExpandedCompositeGroups(sections, "answers")
              : "目前沒有可顯示的答案。";
            answerBox.classList.add("is-hidden");
          }
          return;
        }

        const result = buildCompactCompositePracticeResult(items);
        if (output) {
          output.innerHTML = result.questions.length
            ? `<ol>${result.questions.map((question) => `<li>${question}</li>`).join("")}</ol>`
            : "目前沒有可生成的本章綜合練習。";
        }
        if (answerBox) {
          answerBox.innerHTML = result.answers.length
            ? `<ol>${result.answers.map((answer) => `<li>${answer}</li>`).join("")}</ol>`
            : "目前沒有可顯示的答案。";
          answerBox.classList.add("is-hidden");
        }
      });
    });

    elements.practiceBoard?.querySelectorAll("[data-chapter-composite-reveal]").forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", () => {
        const section = button.closest("[data-chapter-composite]");
        const answerBox = section?.querySelector("[data-chapter-composite-answer]");
        if (answerBox) answerBox.classList.toggle("is-hidden");
      });
    });
  }

  function renderBoard(items) {
    updateSummary(items);
    if (!items.length) {
      renderEmptyState("?桀?瘝?蝚血?璇辣??毀蝧??柴?");
      return;
    }

    if (elements.emptyState) {
      elements.emptyState.hidden = true;
      elements.emptyState.innerHTML = "";
    }

    if (elements.practiceBoard) {
      elements.practiceBoard.innerHTML = [
        renderCompositePracticeSection("top"),
        items.map((item) => toolkit.renderCard(item, { showShareLink: item.practiceSource !== "library" })).join(""),
        renderCompositePracticeSection("bottom"),
      ].filter(Boolean).join("");
      bindCompositePracticeEvents();
      toolkit.bindInteractiveEvents?.(elements.practiceBoard);
    }
  }

  function syncControls() {
    if (elements.gradeFilter) elements.gradeFilter.value = state.gradeKey;
    if (elements.chapterFilter) elements.chapterFilter.value = state.chapterCode;
    if (elements.keywordInput) elements.keywordInput.value = state.keyword;
  }

  function render() {
    populateGradeFilter();
    populateChapterFilter();
    syncControls();
    renderChapterPracticeCatalog();
    renderBoard(getFilteredItems());
  }

  function resetFilters() {
    state.gradeKey = "all";
    state.chapterCode = "all";
    state.keyword = "";
    state.practiceId = "";
    render();
  }

  function bindEvents() {
    elements.gradeFilter?.addEventListener("change", (event) => {
      state.gradeKey = event.target.value || "all";
      state.chapterCode = "all";
      state.practiceId = "";
      render();
    });

    elements.chapterFilter?.addEventListener("change", (event) => {
      state.chapterCode = event.target.value;
      state.practiceId = "";
      render();
    });

    elements.chapterPracticeCatalog?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-chapter-catalog-code]");
      if (!button) return;
      state.chapterCode = button.getAttribute("data-chapter-catalog-code") || "all";
      state.practiceId = "";
      render();
    });

    elements.catalogBindingModeButton?.addEventListener("click", () => {
      state.catalogMode = "binding";
      renderChapterPracticeCatalog();
    });

    elements.catalogRecordModeButton?.addEventListener("click", () => {
      state.catalogMode = "record";
      renderChapterPracticeCatalog();
    });

    elements.keywordInput?.addEventListener("input", (event) => {
      state.keyword = event.target.value || "";
      render();
    });

    elements.resetButton?.addEventListener("click", () => {
      resetFilters();
    });
  }

  function normalizeControlLabelsV2() {
    document.title = "無限練習題庫";

    const heroTitle = document.querySelector(".hero__content h1");
    if (heroTitle) heroTitle.textContent = "無限練習題庫";

    const heroLead = document.querySelector(".hero__lead");
    if (heroLead) {
      heroLead.textContent = "把各章可互動的練習集中整理，方便老師備課時快速挑題，也方便學生依章節自學與反覆練習。";
    }

    const quickLinks = document.querySelectorAll(".hero__quicklinks a");
    if (quickLinks[0]) quickLinks[0].textContent = "回首頁";
    if (quickLinks[1]) quickLinks[1].textContent = "前往管理頁";
    if (quickLinks[2]) quickLinks[2].textContent = "前往題庫";

    const heroPanelTitle = document.querySelector(".hero__panel h2");
    if (heroPanelTitle) heroPanelTitle.textContent = "使用重點";
    const heroPanelItems = document.querySelectorAll(".hero__panel li");
    if (heroPanelItems[0]) heroPanelItems[0].textContent = "先選年級，再選章節，左側清單會更短、更好找。";
    if (heroPanelItems[1]) heroPanelItems[1].textContent = "上方綜合練習主打題型變化展示，幫你快速看出這一章會怎麼出題。";
    if (heroPanelItems[2]) heroPanelItems[2].textContent = "下方綜合練習保留原本模式，適合課堂暖身或學生做快速自我檢查。";

    const controlsTitle = document.querySelector(".controls h2");
    if (controlsTitle) controlsTitle.textContent = "查詢條件";
    const controlLabels = document.querySelectorAll(".controls .field > span");
    if (controlLabels[0]) controlLabels[0].textContent = "年級";
    if (controlLabels[1]) controlLabels[1].textContent = "章節";
    if (controlLabels[2]) controlLabels[2].textContent = "關鍵字搜尋";
    if (elements.keywordInput) {
      elements.keywordInput.placeholder = "輸入主題、章節、練習標題、標籤";
    }
    if (elements.resetButton) {
      elements.resetButton.textContent = "清除篩選";
    }

    const guidePanels = document.querySelectorAll(".sidebar .guide");
    if (guidePanels[0]) {
      const heading = guidePanels[0].querySelector("h2");
      if (heading) heading.textContent = "章節題型總覽";
    }
    if (guidePanels[1]) {
      const heading = guidePanels[1].querySelector("h2");
      if (heading) heading.textContent = "使用說明";
      const items = guidePanels[1].querySelectorAll("li");
      if (items[0]) items[0].textContent = "先用年級與章節縮小範圍，再查看該章有哪些可互動的練習。";
      if (items[1]) items[1].textContent = "點左側章節清單後，頁面會直接切到該章的所有無限練習。";
      if (items[2]) items[2].textContent = "最上方綜合練習會優先展示不同出題變化，方便老師快速掌握題型。";
      if (items[3]) items[3].textContent = "若只想快速抽題，直接使用下方保留的原版綜合練習即可。";
    }

    if (elements.catalogBindingModeButton) elements.catalogBindingModeButton.textContent = "依章節綁定";
    if (elements.catalogRecordModeButton) elements.catalogRecordModeButton.textContent = "依章節分配";

    const summaryLabel = document.querySelector(".summary-panel .summary-label");
    if (summaryLabel) summaryLabel.textContent = "目前結果";
  }

  function getGradeLabelTextV2(stage, grade, term) {
    return getGradeLabel(stage, grade, term);
  }

  function buildGradeOptionsV2() {
    return gradeOptions.slice();
  }

  function getActiveGradeLabelV2() {
    return buildGradeOptionsV2().find((entry) => entry.key === state.gradeKey)?.label || "";
  }

  function populateGradeFilterV2() {
    if (!elements.gradeFilter) return;
    const gradeRows = buildGradeOptionsV2();
    const options = ['<option value="all">\u5168\u90e8\u5e74\u7d1a</option>'];
    gradeRows.forEach((entry) => {
      options.push(`<option value="${escapeHtml(entry.key)}">${escapeHtml(entry.label)}</option>`);
    });
    elements.gradeFilter.innerHTML = options.join("");
    elements.gradeFilter.value = gradeRows.some((entry) => entry.key === state.gradeKey) ? state.gradeKey : "all";
  }

  function populateChapterFilterV2() {
    if (!elements.chapterFilter) return;
    const options = ['<option value="all">\u5168\u90e8\u7ae0\u7bc0</option>'];
    const visibleChapterOptions = getVisibleChapterOptions();
    if (state.chapterCode !== "all" && !visibleChapterOptions.some((entry) => entry.code === state.chapterCode)) {
      state.chapterCode = "all";
    }
    visibleChapterOptions.forEach((entry) => {
      options.push(`<option value="${escapeHtml(entry.code)}">${escapeHtml(entry.label || entry.code)}</option>`);
    });
    elements.chapterFilter.innerHTML = options.join("");
    elements.chapterFilter.value = state.chapterCode;
  }

  function renderChapterPracticeCatalogV2() {
    if (!elements.chapterPracticeCatalog) return;
    const sourceRows = state.catalogMode === "record"
      ? chapterPracticeRecordCatalogItems
      : chapterPracticeCatalogItems;
    const chapterRows = sourceRows.filter((row) => row.code !== "all" && matchesGradeFilterByChapterCode(row.code));
    const activeGradeLabel = getActiveGradeLabelV2();
    const isLeafRecord = (record) =>
      !(Array.isArray(record?.relatedPracticeIds) && record.relatedPracticeIds.length);
    const allRecords = state.catalogMode === "record"
      ? Object.values(practiceLibrary?.byId || {}).filter((record) => {
          if (!record || record.enabled === false) return false;
          const chapterCode = String(record?.chapterCode || "").trim();
          if (!chapterCode) return false;
          return matchesGradeFilterByChapterCode(chapterCode);
        })
      : practiceItems.filter((item) => matchesGradeFilter(item));
    const visibleRows = [
      {
        code: "all",
        label: activeGradeLabel ? `${activeGradeLabel}\u5168\u90e8\u7ae0\u7bc0` : "\u5168\u90e8\u7ae0\u7bc0",
        count: allRecords.length,
        leafCount: allRecords.filter(isLeafRecord).length,
      },
      ...chapterRows,
    ];
    if (elements.catalogBindingModeButton) {
      elements.catalogBindingModeButton.classList.toggle("is-active", state.catalogMode === "binding");
    }
    if (elements.catalogRecordModeButton) {
      elements.catalogRecordModeButton.classList.toggle("is-active", state.catalogMode === "record");
    }
    elements.chapterPracticeCatalog.innerHTML = visibleRows
      .map((row) => `
        <button
          type="button"
          class="chapter-practice-catalog__item ${state.chapterCode === row.code ? "is-active" : ""}"
          data-chapter-catalog-code="${escapeHtml(row.code)}"
        >
          <span class="chapter-practice-catalog__label">${escapeHtml(row.label)}</span>
          <span class="chapter-practice-catalog__count">${escapeHtml(String(row.leafCount ?? row.count))} \u5c0f\u985e / ${escapeHtml(String(row.count))} \u984c\u578b</span>
        </button>
      `)
      .join("");
  }

  function normalizeQuestionShapeV2(text) {
    return String(text || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\\(?:d?frac)\s*\{[^{}]*\}\s*\{[^{}]*\}/g, " FRAC ")
      .replace(/\\sqrt\s*\{[^{}]*\}/g, " ROOT ")
      .replace(/[+\-]?\d+(?:\.\d+)?/g, "#")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function normalizeGeneratedPracticeResultV2(result) {
    const source = result && typeof result === "object" ? result : {};
    const questions = Array.isArray(source.questions) ? source.questions : [];
    const answers = Array.isArray(source.answers) ? source.answers : [];
    let summaryAnswers = Array.isArray(source.summaryAnswers) ? source.summaryAnswers : [];
    if (!summaryAnswers.length && answers.length) {
      summaryAnswers = answers.map((answer) => {
        const text = String(answer || "").trim();
        const match = text.match(/^簡答：([\s\S]*?。)(?:\s|$)/);
        if (match) return `簡答：${match[1]}`;
        const firstSentence = text.match(/^[\s\S]*?。/);
        return firstSentence ? firstSentence[0].trim() : text;
      });
    }
    return {
      ...source,
      questions,
      summaryAnswers,
      answers,
    };
  }

  async function ensurePracticeGeneratorsForItemsV2(items) {
    if (!generatorLoader?.ensureForPractices) return true;
    try {
      await generatorLoader.ensureForPractices(items);
      return true;
    } catch (error) {
      console.warn("Unable to load practice generator bundle", error);
      return false;
    }
  }

  function collectPracticeVariationsV2(config, item, maxVariants = 6) {
    if (!config) return [];
    if (config.type === "fixed-example") {
      const prompt = String(config.prompt || "").trim();
      const answer = String(config.answer || "").trim();
      return prompt ? [{ question: prompt, summaryAnswer: answer, answer }] : [];
    }
    if (typeof config.generate !== "function") return [];
    const desiredCount = Math.max(1, Number(maxVariants || 1) || 1);
    const variants = [];
    const seen = new Set();
    // 單次 generate() 只會回傳 config.questionCount 題（通常是 5），
    // 這裡改成重複呼叫並去重，收滿使用者要的題數為止（拿不到那麼多題就有多少給多少）。
    const attemptLimit = Math.max(6, desiredCount * 6);

    for (let attempt = 0; attempt < attemptLimit && variants.length < desiredCount; attempt += 1) {
      const result = normalizeGeneratedPracticeResultV2(config.generate(item) || {});
      const questions = Array.isArray(result.questions) ? result.questions : [];
      const summaryAnswers = Array.isArray(result.summaryAnswers) ? result.summaryAnswers : [];
      const answers = Array.isArray(result.answers) ? result.answers : [];

      for (let index = 0; index < questions.length && variants.length < desiredCount; index += 1) {
        const question = String(questions[index] || "").trim();
        if (!question || seen.has(question)) continue;
        seen.add(question);
        const summaryAnswer = String(summaryAnswers[index] || answers[index] || "").trim();
        const answer = String(answers[index] || "").trim();
        variants.push({ question, summaryAnswer, answer });
      }
    }

    return variants;
  }

  // 綜合（題型變化總覽）每一種題型要出幾題：可由前端輸入框調整，並記憶在 localStorage。
  // 預設 10 題，範圍 1–50，方便逐一校對題目正確性與重複性。
  const COMPOSITE_PER_SUBTYPE_STORAGE_KEY = "math-formula-tool-composite-per-subtype-v1";
  const COMPOSITE_PER_SUBTYPE_DEFAULT = 10;
  const COMPOSITE_PER_SUBTYPE_MIN = 1;
  const COMPOSITE_PER_SUBTYPE_MAX = 50;

  function clampCompositePerSubtype(value) {
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n)) return COMPOSITE_PER_SUBTYPE_DEFAULT;
    return Math.max(COMPOSITE_PER_SUBTYPE_MIN, Math.min(COMPOSITE_PER_SUBTYPE_MAX, n));
  }

  function loadCompositePerSubtype() {
    try {
      const raw = window.localStorage.getItem(COMPOSITE_PER_SUBTYPE_STORAGE_KEY);
      if (raw === null || raw === "") return COMPOSITE_PER_SUBTYPE_DEFAULT;
      return clampCompositePerSubtype(raw);
    } catch (_) {
      return COMPOSITE_PER_SUBTYPE_DEFAULT;
    }
  }

  let compositeQuestionsPerSubtype = loadCompositePerSubtype();

  function setCompositeQuestionsPerSubtype(value) {
    compositeQuestionsPerSubtype = clampCompositePerSubtype(value);
    try {
      window.localStorage.setItem(COMPOSITE_PER_SUBTYPE_STORAGE_KEY, String(compositeQuestionsPerSubtype));
    } catch (_) {
      // ignore storage errors
    }
    return compositeQuestionsPerSubtype;
  }

  function buildCompositeChildItemV2(record, fallbackChapterCode = "") {
    if (!record || typeof record !== "object") return null;
    return {
      ...record,
      id: String(record.id || "").trim(),
      title: String(record.title || record.id || "").trim(),
      chapterCode: String(record.chapterCode || fallbackChapterCode || "").trim(),
      chapterCodes: Array.isArray(record.chapterCodes) ? record.chapterCodes : undefined,
      subtypeCount: Number(record.subtypeCount || 0) || undefined,
      practiceSource: record.practiceSource || "library",
      relatedPracticeIds: normalizeTextList(record.relatedPracticeIds),
    };
  }

  function resolveCompositeChildItemsV2(item) {
    const relatedIds = Array.isArray(item?.relatedPracticeIds)
      ? item.relatedPracticeIds.map((value) => String(value || "").trim()).filter(Boolean)
      : [];
    if (!relatedIds.length) return [];
    return relatedIds
      .map((practiceId) => {
        const record = practiceLibrary?.byId?.[practiceId] || null;
        if (!record) return null;
        return buildCompositeChildItemV2(record, item?.chapterCode || state.chapterCode || "");
      })
      .filter(Boolean);
  }

  function collectQuestionsForSubtypeV2(config, item, subtypeIndex, desiredCount) {
    const safeDesiredCount = Math.max(1, Number(desiredCount || 0) || 1);
    const variants = [];
    const seen = new Set();
    const attemptLimit = Math.max(8, safeDesiredCount * 8);

    for (let attempt = 0; attempt < attemptLimit && variants.length < safeDesiredCount; attempt += 1) {
      const result = normalizeGeneratedPracticeResultV2(config.generate(item) || {});
      const questions = Array.isArray(result.questions) ? result.questions : [];
      const summaryAnswers = Array.isArray(result.summaryAnswers) ? result.summaryAnswers : [];
      const answers = Array.isArray(result.answers) ? result.answers : [];
      const question = String(questions[subtypeIndex] || "").trim();
      if (!question) continue;
      const signature = `${subtypeIndex}::${question}`;
      if (seen.has(signature)) continue;
      seen.add(signature);
      variants.push({
        question,
        summaryAnswer: String(summaryAnswers[subtypeIndex] || answers[subtypeIndex] || "").trim(),
        answer: String(answers[subtypeIndex] || "").trim(),
      });
    }

    if (!variants.length) {
      const fallback = collectPracticeVariationsV2(config, item, subtypeIndex + 1);
      const chosen = fallback[subtypeIndex] || null;
      if (chosen) variants.push(chosen);
    }

    return variants;
  }

  function buildExpandedCompositeSectionsForItemV2(item, titlePrefix = "") {
    const config = practiceStore.getConfig?.(item?.id) || null;
    if (!config) return [];

    const itemTitle = String(item?.title || config?.title || item?.id || "未命名題型").trim();
    const fullTitle = titlePrefix ? `${titlePrefix}｜${itemTitle}` : itemTitle;

    if (config.type === "fixed-example") {
      const prompt = String(config.prompt || "").trim();
      const answer = String(config.answer || "").trim();
      if (!prompt && !answer) return [];
      return [{
        title: fullTitle,
        variants: [{ question: prompt, summaryAnswer: answer, answer }],
      }];
    }

    if (typeof config.generate !== "function") return [];

    const perSubtype = compositeQuestionsPerSubtype;
    const variants = collectPracticeVariationsV2(config, item, perSubtype)
      .slice(0, perSubtype);
    return variants.length ? [{ title: fullTitle, variants }] : [];
  }

  function buildCompactCompositePracticeResultV2(items) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    items.forEach((item) => {
      const config = practiceStore.getConfig?.(item?.id) || null;
      if (!config) return;
      const title = String(item?.title || config?.title || item?.id || "未命名題型").trim();

      if (config.type === "fixed-example") {
        const prompt = String(config.prompt || "").trim();
        const answer = String(config.answer || "").trim();
        if (prompt) questions.push(`<strong>${escapeHtml(title)}</strong>：${toolkit.renderRichTextLine(prompt)}`);
        if (answer) summaryAnswers.push(`<strong>${escapeHtml(title)}</strong>：${toolkit.renderRichTextLine(answer)}`);
        if (answer) answers.push(`<strong>${escapeHtml(title)}</strong>：${toolkit.renderRichTextLine(answer)}`);
        return;
      }

      if (typeof config.generate !== "function") return;
      const result = normalizeGeneratedPracticeResultV2(config.generate(item) || {});
      const question = Array.isArray(result.questions) ? String(result.questions[0] || "").trim() : "";
      const summaryAnswer = Array.isArray(result.summaryAnswers) ? String(result.summaryAnswers[0] || result.answers?.[0] || "").trim() : "";
      const answer = Array.isArray(result.answers) ? String(result.answers[0] || "").trim() : "";
      if (question) questions.push(`<strong>${escapeHtml(title)}</strong>：${toolkit.renderRichTextLine(question)}`);
      if (summaryAnswer) summaryAnswers.push(`<strong>${escapeHtml(title)}</strong>：${toolkit.renderRichTextLine(summaryAnswer)}`);
      if (answer) answers.push(`<strong>${escapeHtml(title)}</strong>：${toolkit.renderRichTextLine(answer)}`);
    });

    return { questions, summaryAnswers, answers };
  }

  function buildExpandedCompositePracticeResultV2(items) {
    return items.flatMap((item) => {
      const childItems = resolveCompositeChildItemsV2(item);
      if (childItems.length) {
        const parentTitle = String(item?.title || "").trim();
        return childItems.flatMap((childItem) =>
          buildExpandedCompositeSectionsForItemV2(childItem, parentTitle)
        );
      }
      return buildExpandedCompositeSectionsForItemV2(item);
    }).filter(Boolean);
  }

  function buildCompositeSessionKeyV2(position) {
    return `${String(state.chapterCode || "all").trim()}::${String(position || "bottom").trim()}`;
  }

  function loadCompositeSessionMapV2() {
    try {
      const raw = window.localStorage.getItem(COMPOSITE_SESSION_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveCompositeSessionMapV2(sessionMap) {
    try {
      window.localStorage.setItem(COMPOSITE_SESSION_STORAGE_KEY, JSON.stringify(sessionMap || {}));
    } catch (_) {
      // ignore storage errors
    }
  }

  function readCompositeSessionV2(position) {
    const key = buildCompositeSessionKeyV2(position);
    return loadCompositeSessionMapV2()[key] || null;
  }

  function writeCompositeSessionV2(position, payload) {
    const key = buildCompositeSessionKeyV2(position);
    const sessionMap = loadCompositeSessionMapV2();
    sessionMap[key] = {
      ...payload,
      chapterCode: String(state.chapterCode || "all").trim(),
      position: String(position || "bottom").trim(),
      generatedAt: new Date().toISOString(),
    };
    saveCompositeSessionMapV2(sessionMap);
    return sessionMap[key];
  }

  function ensureCompositeSessionV2(position, items) {
    const existing = readCompositeSessionV2(position);
    if (existing) return existing;
    return regenerateCompositeSessionV2(position, items);
  }

  function regenerateCompositeSessionV2(position, items) {
    if (position === "top") {
      return writeCompositeSessionV2(position, {
        kind: "expanded",
        sections: buildExpandedCompositePracticeResultV2(items),
      });
    }
    return writeCompositeSessionV2(position, {
      kind: "compact",
      result: buildCompactCompositePracticeResultV2(items),
    });
  }

  function renderCompositeSessionV2(section, session) {
    const output = section?.querySelector("[data-chapter-composite-output]");
    const summaryBox = section?.querySelector("[data-chapter-composite-summary]");
    const answerBox = section?.querySelector("[data-chapter-composite-answer]");
    if (!section || !output || !summaryBox || !answerBox) return;

    if (session?.kind === "expanded") {
      const sections = Array.isArray(session.sections) ? session.sections : [];
      output.innerHTML = sections.length
        ? renderExpandedCompositeGroupsV2(sections, "question")
        : "目前沒有可顯示的出題內容。";
      summaryBox.innerHTML = sections.length
        ? renderExpandedCompositeGroupsV2(sections, "summaryAnswer")
        : "目前沒有簡答。";
      answerBox.innerHTML = sections.length
        ? renderExpandedCompositeGroupsV2(sections, "answer")
        : "目前沒有詳解。";
    } else {
      const result = session?.result && typeof session.result === "object" ? session.result : { questions: [], summaryAnswers: [], answers: [] };
      const questions = Array.isArray(result.questions) ? result.questions : [];
      const summaryAnswers = Array.isArray(result.summaryAnswers) ? result.summaryAnswers : [];
      const answers = Array.isArray(result.answers) ? result.answers : [];
      output.innerHTML = questions.length
        ? `<ol>${questions.map((question) => `<li>${question}</li>`).join("")}</ol>`
        : "目前沒有可顯示的出題內容。";
      summaryBox.innerHTML = summaryAnswers.length
        ? `<ol>${summaryAnswers.map((answer) => `<li>${answer}</li>`).join("")}</ol>`
        : "目前沒有簡答。";
      answerBox.innerHTML = answers.length
        ? `<ol>${answers.map((answer) => `<li>${answer}</li>`).join("")}</ol>`
        : "目前沒有詳解。";
    }

    summaryBox.classList.add("is-hidden");
    answerBox.classList.add("is-hidden");
  }

  function renderExpandedCompositeGroupsV2(sections, key) {
    return sections.map((section, index) => `
      <section class="topic-cluster">
        <div class="topic-cluster__header">
          <div>
            <p class="summary-label">題型 ${index + 1}</p>
            <h3>${escapeHtml(section.title)}</h3>
          </div>
        </div>
        ${
          section.variants?.length
            ? `<ol>${section.variants.map((entry) => `<li>${toolkit.renderRichTextLine(entry[key] || "未提供")}</li>`).join("")}</ol>`
            : '<p class="detail-note">目前沒有可顯示的內容。</p>'
        }
      </section>
    `).join("");
  }

  function buildPracticePageUrlV2(chapterCode, practiceId) {
    const params = new URLSearchParams();
    if (chapterCode) params.set("chapter", chapterCode);
    if (practiceId) params.set("practice", practiceId);
    return `practice-bank.html?${params.toString()}`;
  }

  function renderRelatedPracticeSectionV2(item) {
    const relatedIds = Array.isArray(item?.relatedPracticeIds) ? item.relatedPracticeIds.map((value) => String(value || "").trim()).filter(Boolean) : [];
    if (!relatedIds.length) return "";
    const childCards = relatedIds
      .map((practiceId) => practiceLibrary?.byId?.[practiceId] || null)
      .filter(Boolean)
      .map((record) => {
        const childItem = practiceItems.find((entry) => String(entry?.id || "").trim() === String(record.id || "").trim()) || {
          ...record,
          id: String(record.id || "").trim(),
          title: String(record.title || record.id || "").trim(),
          chapterCode: String(record.chapterCode || item?.chapterCode || state.chapterCode || "").trim(),
        };
        return toolkit.renderCard(childItem, { showShareLink: childItem.practiceSource !== "library" });
      });
    if (!childCards.length) return "";
    return `
      <section class="panel">
        <div class="topic-cluster__header">
          <div>
            <p class="summary-label">延伸練習</p>
            <h3>分項練習入口</h3>
            <p class="detail-note">先做上方綜合版，再往下切到各個細項練習，頁面會比較乾淨，也比較符合備課順序。</p>
          </div>
        </div>
        <div class="branch-grid branch-grid--one">
          ${childCards.join("")}
        </div>
      </section>
    `;
  }

  function renderPracticeCardWithRelatedSectionV2(item) {
    const relatedIds = Array.isArray(item?.relatedPracticeIds) ? item.relatedPracticeIds.map((value) => String(value || "").trim()).filter(Boolean) : [];
    const chapterCode = String(item?.chapterCode || state.chapterCode || "").trim();
    const practiceId = String(item?.id || "").trim();
    const detailHref = relatedIds.length ? buildPracticePageUrlV2(chapterCode, practiceId) : "";
    const topRightHtml = detailHref && !state.practiceId
      ? `<a class="ghost-link" href="${escapeHtml(detailHref)}">開啟新頁面</a>`
      : "";
    return toolkit.renderCard(item, {
      showShareLink: item.practiceSource !== "library",
      topRightHtml,
    });
  }

  function renderCompositePracticeSectionV2(position = "bottom") {
    const items = getCompositeChapterItems();
    if (!items.length) return "";
    const chapterLabel = chapterOptions.find((entry) => entry.code === state.chapterCode)?.label || state.chapterCode;
    const isTop = position === "top";
    const heading = isTop ? `${chapterLabel} 題型變化總覽` : `${chapterLabel} 綜合練習`;
    const note = isTop
      ? "每一種題型會連續嘗試生成多次，方便先看這一章常見的出題變化。"
      : "這裡會把各題型各抽 1 題，適合快速暖身、課堂巡查或課末檢查。";
    return `
      <section class="panel chapter-composite-practice" data-chapter-composite="${escapeHtml(state.chapterCode)}" data-chapter-composite-position="${escapeHtml(position)}">
        <div class="topic-cluster__header">
          <div>
            <p class="summary-label">${isTop ? "章節總覽練習" : "章節快速練習"}</p>
            <h3>${escapeHtml(heading)}</h3>
            <p class="detail-note">${escapeHtml(note)}</p>
          </div>
        </div>
        <div class="interactive-actions interactive-actions--stacked">
          <div class="interactive-actions__row interactive-actions__row--split">
            <button type="button" class="ghost-button" data-chapter-composite-generate="${escapeHtml(state.chapterCode)}">出題</button>
            <button type="button" class="ghost-button" data-chapter-composite-regenerate="${escapeHtml(state.chapterCode)}">重新出題</button>
          </div>
          <div class="interactive-actions__row interactive-actions__row--split">
            <button type="button" class="ghost-button" data-chapter-composite-summary-reveal="${escapeHtml(state.chapterCode)}">簡答</button>
            <button type="button" class="ghost-button" data-chapter-composite-detail-reveal="${escapeHtml(state.chapterCode)}">詳解</button>
          </div>
          ${
            isTop
              ? `<div class="interactive-actions__row">
            <label class="detail-note chapter-composite-per-subtype">每種題型出題數
              <input type="number" min="${COMPOSITE_PER_SUBTYPE_MIN}" max="${COMPOSITE_PER_SUBTYPE_MAX}" step="1" value="${compositeQuestionsPerSubtype}" data-chapter-composite-per-subtype="${escapeHtml(state.chapterCode)}" />
            </label>
          </div>`
              : ""
          }
        </div>
        <div class="interactive-output" data-chapter-composite-output>請先按出題；若想換新的一輪，再按重新出題。</div>
        <div class="interactive-answer-panels">
          <div class="interactive-output is-hidden" data-chapter-composite-summary></div>
          <div class="interactive-output is-hidden" data-chapter-composite-answer></div>
        </div>
      </section>
    `;
  }

  function bindCompositePracticeEventsV2() {
    elements.practiceBoard?.querySelectorAll("[data-chapter-composite-generate]").forEach((button) => {
      if (button.dataset.boundV2 === "true") return;
      button.dataset.boundV2 = "true";
      button.addEventListener("click", async () => {
        const section = button.closest("[data-chapter-composite]");
        const position = section?.getAttribute("data-chapter-composite-position") || "bottom";
        const items = getCompositeChapterItems();
        await ensurePracticeGeneratorsForItemsV2(items);
        const session = ensureCompositeSessionV2(position, items);
        renderCompositeSessionV2(section, session);
      });
    });

    elements.practiceBoard?.querySelectorAll("[data-chapter-composite-regenerate]").forEach((button) => {
      if (button.dataset.boundV2 === "true") return;
      button.dataset.boundV2 = "true";
      button.addEventListener("click", async () => {
        const section = button.closest("[data-chapter-composite]");
        const position = section?.getAttribute("data-chapter-composite-position") || "bottom";
        const items = getCompositeChapterItems();
        await ensurePracticeGeneratorsForItemsV2(items);
        const session = regenerateCompositeSessionV2(position, items);
        renderCompositeSessionV2(section, session);
      });
    });

    elements.practiceBoard?.querySelectorAll("[data-chapter-composite-summary-reveal]").forEach((button) => {
      if (button.dataset.boundV2 === "true") return;
      button.dataset.boundV2 = "true";
      button.addEventListener("click", () => {
        const section = button.closest("[data-chapter-composite]");
        const summaryBox = section?.querySelector("[data-chapter-composite-summary]");
        if (summaryBox) summaryBox.classList.toggle("is-hidden");
      });
    });

    elements.practiceBoard?.querySelectorAll("[data-chapter-composite-detail-reveal]").forEach((button) => {
      if (button.dataset.boundV2 === "true") return;
      button.dataset.boundV2 = "true";
      button.addEventListener("click", () => {
        const section = button.closest("[data-chapter-composite]");
        const answerBox = section?.querySelector("[data-chapter-composite-answer]");
        if (answerBox) answerBox.classList.toggle("is-hidden");
      });
    });

    elements.practiceBoard?.querySelectorAll("[data-chapter-composite-per-subtype]").forEach((input) => {
      if (input.dataset.boundV2 === "true") return;
      input.dataset.boundV2 = "true";
      input.addEventListener("change", async () => {
        setCompositeQuestionsPerSubtype(input.value);
        input.value = String(compositeQuestionsPerSubtype);
        const section = input.closest("[data-chapter-composite]");
        const position = section?.getAttribute("data-chapter-composite-position") || "bottom";
        // 已經出過題才立即用新題數重出；還沒出題就只記住設定，等使用者按出題。
        if (readCompositeSessionV2(position)) {
          const items = getCompositeChapterItems();
          await ensurePracticeGeneratorsForItemsV2(items);
          const session = regenerateCompositeSessionV2(position, items);
          renderCompositeSessionV2(section, session);
        }
      });
    });
  }

  function updateSummaryV2(items) {
    const activeGradeLabel = getActiveGradeLabelV2();
    const chapterLabel = state.chapterCode === "all"
      ? (activeGradeLabel || "全部章節")
      : chapterOptions.find((entry) => entry.code === state.chapterCode)?.label || state.chapterCode;

    if (elements.resultTitle) {
      elements.resultTitle.textContent = state.chapterCode === "all"
        ? `${chapterLabel} 無限練習`
        : `${chapterLabel} 題型總覽`;
    }
    if (elements.resultCount) {
      elements.resultCount.textContent = `共找到 ${items.length} 筆可用練習`;
    }
  }

  function renderEmptyStateV2(message) {
    if (elements.emptyState) {
      elements.emptyState.hidden = false;
      elements.emptyState.innerHTML = `<p>${escapeHtml(message)}</p>`;
    }
    if (elements.practiceBoard) {
      elements.practiceBoard.innerHTML = "";
    }
  }

  function renderBoardV2(items) {
    updateSummaryV2(items);
    if (!items.length) {
      renderEmptyStateV2("目前條件下沒有找到可用的無限練習，請改用別的年級、章節或關鍵字。");
      return;
    }

    if (elements.emptyState) {
      elements.emptyState.hidden = true;
      elements.emptyState.innerHTML = "";
    }

    if (elements.practiceBoard) {
      const relatedSection = state.practiceId && items.length === 1
        ? renderRelatedPracticeSectionV2(items[0])
        : "";
      elements.practiceBoard.innerHTML = [
        renderCompositePracticeSectionV2("top"),
        items.map((item) => renderPracticeCardWithRelatedSectionV2(item)).join(""),
        relatedSection,
        renderCompositePracticeSectionV2("bottom"),
      ].filter(Boolean).join("");
      bindCompositePracticeEventsV2();
      toolkit.bindInteractiveEvents?.(elements.practiceBoard);
    }
  }

  function syncControlsV2() {
    if (elements.gradeFilter) elements.gradeFilter.value = state.gradeKey;
    if (elements.chapterFilter) elements.chapterFilter.value = state.chapterCode;
    if (elements.keywordInput) elements.keywordInput.value = state.keyword;
  }

  function scrollPageToTopV2() {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  function renderV2() {
    normalizeControlLabelsV2();
    populateGradeFilterV2();
    populateChapterFilterV2();
    syncControlsV2();
    renderChapterPracticeCatalogV2();
    renderBoardV2(getFilteredItems());
  }

  function resetFiltersV2() {
    state.gradeKey = "all";
    state.chapterCode = "all";
    state.keyword = "";
    state.practiceId = "";
    renderV2();
  }

  function bindEventsV2() {
    elements.gradeFilter?.addEventListener("change", (event) => {
      state.gradeKey = event.target.value || "all";
      state.chapterCode = "all";
      state.practiceId = "";
      renderV2();
      scrollPageToTopV2();
    });

    elements.chapterFilter?.addEventListener("change", (event) => {
      state.chapterCode = event.target.value || "all";
      state.practiceId = "";
      renderV2();
      scrollPageToTopV2();
    });

    elements.chapterPracticeCatalog?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-chapter-catalog-code]");
      if (!button) return;
      state.chapterCode = button.getAttribute("data-chapter-catalog-code") || "all";
      state.practiceId = "";
      renderV2();
      scrollPageToTopV2();
    });

    elements.catalogBindingModeButton?.addEventListener("click", () => {
      state.catalogMode = "binding";
      state.practiceId = "";
      renderV2();
    });

    elements.catalogRecordModeButton?.addEventListener("click", () => {
      state.catalogMode = "record";
      state.practiceId = "";
      renderV2();
    });

    elements.keywordInput?.addEventListener("input", (event) => {
      state.keyword = event.target.value || "";
      renderV2();
    });

    elements.resetButton?.addEventListener("click", () => {
      resetFiltersV2();
    });
  }

  bindEventsV2();
  renderV2();
})();
