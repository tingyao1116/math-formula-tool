(() => {
  const store = window.formulaDataStore || null;
  const toolkit = window.formulaToolkit || null;
  const practiceStore = window.formulaPracticeStore || null;
  const practiceLibrary = window.practiceLibraryStore || null;

  const elements = {
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

  if (!store || !toolkit || !practiceStore) {
    console.warn("practice bank dependencies not loaded");
    return;
  }

  const allItems = store.getCurrentFormulas ? store.getCurrentFormulas() : [];
  const topicIdSet = new Set(
    allItems
      .map((item) => String(item?.id || "").trim())
      .filter(Boolean)
  );
  const chapterOptions = (store.getChapterOptions?.() || []).slice().sort(compareChapterCodes);
  const chapterLabelLookup = Object.fromEntries(
    chapterOptions.map((entry) => [String(entry.code || ""), String(entry.label || entry.code || "")])
  );
  const urlParams = new URLSearchParams(window.location.search);
  const initialChapterCode = urlParams.get("chapter") || "all";
  const initialPracticeId = String(urlParams.get("practice") || "").trim();

  const state = {
    chapterCode: chapterLabelLookup[initialChapterCode] ? initialChapterCode : "all",
    keyword: "",
    practiceId: initialPracticeId,
    catalogMode: "binding",
  };

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

  function buildIndependentPracticeItems() {
    const chapterMap = buildPracticeChapterMap();
    const records = Object.values(practiceLibrary?.byId || {}).filter((row) => row && row.enabled !== false);
    return records.map((record) => {
      const recordId = String(record.id || "").trim();
      const chapterMeta = chapterMap[recordId]?.length
        ? chapterMap[recordId]
        : normalizeTextList([record.chapterCode]).map((value) => String(value));
      const chapterCodes = chapterMeta.map((entry) => typeof entry === "string" ? entry : entry.code);
      const chapterOrderLookup = Object.fromEntries(
        chapterMeta
          .filter((entry) => entry && typeof entry === "object")
          .map((entry) => [String(entry.code || ""), Number(entry.order || 0)])
      );
      const chapterCode = chapterCodes[0] || "";
      const chapterLabel = chapterLabelLookup[chapterCode] || chapterCode;
      return {
        id: recordId,
        title: String(record.title || "").trim() || "無限練習",
        stage: String(record.stage || "").trim(),
        grade: String(record.grade || "").trim(),
        term: String(record.term || "").trim(),
        chapter: String(record.chapter || "").trim() || chapterLabel,
        chapterCode,
        chapterCodes,
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
      };
    });
  }

  const independentItems = buildIndependentPracticeItems();
  const independentIds = new Set(independentItems.map((item) => item.id));
  const practiceSourceTopicIds = buildPracticeSourceTopicIdSet();
  const legacyItems = allItems.filter((item) => {
    const topicId = String(item?.id || "").trim();
    return hasInfinitePractice(item) && !independentIds.has(topicId) && !practiceSourceTopicIds.has(topicId);
  });
  const practiceItems = independentItems.concat(legacyItems);

  function buildChapterPracticeCatalogItems() {
    const counts = new Map();
    for (const item of practiceItems) {
      const chapterCodes = Array.isArray(item?.chapterCodes) && item.chapterCodes.length
        ? item.chapterCodes
        : [getItemChapterCode(item)].filter(Boolean);
      const seen = new Set();
      for (const rawCode of chapterCodes) {
        const chapterCode = String(rawCode || "").trim();
        if (!chapterCode || seen.has(chapterCode)) continue;
        seen.add(chapterCode);
        counts.set(chapterCode, (counts.get(chapterCode) || 0) + 1);
      }
    }

    const chapterRows = chapterOptions
      .map((entry) => {
        const code = String(entry?.code || "").trim();
        return {
          code,
          label: String(entry?.label || code).trim() || code,
          count: counts.get(code) || 0,
        };
      })
      .filter((row) => row.count > 0);

    return [
      { code: "all", label: "全部章節", count: practiceItems.length },
      ...chapterRows,
    ];
  }

  function buildChapterPracticeRecordCatalogItems() {
    const counts = new Map();
    const records = Object.values(practiceLibrary?.byId || {}).filter((row) => row && row.enabled !== false);
    const chapterMap = buildPracticeChapterMap();
    for (const record of records) {
      const recordId = String(record?.id || "").trim();
      const fallbackChapterCode = String(record?.chapterCode || "").trim();
      const mappedChapterCode = chapterMap[recordId]?.[0] || "";
      const chapterCode = fallbackChapterCode || mappedChapterCode;
      if (!chapterCode) continue;
      counts.set(chapterCode, (counts.get(chapterCode) || 0) + 1);
    }

    const chapterRows = chapterOptions
      .map((entry) => {
        const code = String(entry?.code || "").trim();
        return {
          code,
          label: String(entry?.label || code).trim() || code,
          count: counts.get(code) || 0,
        };
      })
      .filter((row) => row.count > 0);

    return [
      { code: "all", label: "全部章節", count: records.length },
      ...chapterRows,
    ];
  }

  const chapterPracticeCatalogItems = buildChapterPracticeCatalogItems();
  const chapterPracticeRecordCatalogItems = buildChapterPracticeRecordCatalogItems();

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
          <span class="chapter-practice-catalog__count">${escapeHtml(String(row.count))} 項</span>
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
    const keyword = state.keyword.trim().toLowerCase();
    return practiceItems.filter((item) => {
      const chapterOk = matchesChapterFilter(item);
      const keywordOk = !keyword || getPracticeKeywordText(item).includes(keyword);
      const practiceOk = !state.practiceId || String(item?.id || "").trim() === state.practiceId;
      return chapterOk && keywordOk && practiceOk;
    }).slice().sort((a, b) => {
      if (state.chapterCode !== "all") {
        const leftOrder = Number(a?.chapterOrderLookup?.[state.chapterCode]);
        const rightOrder = Number(b?.chapterOrderLookup?.[state.chapterCode]);
        const leftHas = Number.isFinite(leftOrder);
        const rightHas = Number.isFinite(rightOrder);
        if (leftHas && rightHas && leftOrder !== rightOrder) return leftOrder - rightOrder;
        if (leftHas !== rightHas) return leftHas ? -1 : 1;
      }
      return String(a?.title || "").localeCompare(String(b?.title || ""), "zh-Hant");
    });
  }

  function getCompositeChapterItems() {
    if (state.chapterCode === "all" || state.practiceId) return [];
    return getFilteredItems();
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
        <div class="interactive-actions">
          <button type="button" class="ghost-button" data-chapter-composite-generate="${escapeHtml(state.chapterCode)}">出題</button>
          <button type="button" class="ghost-button" data-chapter-composite-reveal="${escapeHtml(state.chapterCode)}">顯示答案</button>
        </div>
        <div class="interactive-output" data-chapter-composite-output>請先按一次出題。</div>
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

  populateChapterFilter();
  bindEvents();
  render();
})();
