(() => {
  const store = window.formulaDataStore || null;
  const toolkit = window.formulaToolkit || null;
  const practiceStore = window.formulaPracticeStore || null;

  const elements = {
    chapterFilter: document.getElementById("chapterFilter"),
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
  const chapterOptions = (store.getChapterOptions?.() || []).slice().sort(compareChapterCodes);

  const state = {
    chapterCode: "all",
    keyword: "",
  };

  function hasInfinitePractice(item) {
    const contentTypes = Array.isArray(item?.contentTypes) ? item.contentTypes.map((value) => String(value || "").trim()) : [];
    if (!contentTypes.includes("無限練習")) return false;
    return Boolean(practiceStore.getConfig?.(item?.id));
  }

  const practiceItems = allItems.filter((item) => hasInfinitePractice(item));

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

  function getItemChapterCode(item) {
    return item?.chapterCode || store.getChapterCode?.(item?.stage, item?.grade, item?.term, item?.chapter) || "";
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
    ];
    return parts.filter(Boolean).join(" ").toLowerCase();
  }

  function getFilteredItems() {
    const keyword = state.keyword.trim().toLowerCase();
    return practiceItems.filter((item) => {
      const chapterOk = state.chapterCode === "all" || getItemChapterCode(item) === state.chapterCode;
      const keywordOk = !keyword || getPracticeKeywordText(item).includes(keyword);
      return chapterOk && keywordOk;
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
      elements.resultCount.textContent = `共 ${items.length} 個可練習主題`;
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
      renderEmptyState("目前沒有符合條件的無限練習主題。");
      return;
    }

    if (elements.emptyState) {
      elements.emptyState.hidden = true;
      elements.emptyState.innerHTML = "";
    }

    if (elements.practiceBoard) {
      elements.practiceBoard.innerHTML = items
        .map((item) => toolkit.renderCard(item, { showShareLink: true }))
        .join("");
      toolkit.bindInteractiveEvents?.(elements.practiceBoard);
    }
  }

  function syncControls() {
    if (elements.chapterFilter) elements.chapterFilter.value = state.chapterCode;
    if (elements.keywordInput) elements.keywordInput.value = state.keyword;
  }

  function render() {
    syncControls();
    renderBoard(getFilteredItems());
  }

  function resetFilters() {
    state.chapterCode = "all";
    state.keyword = "";
    render();
  }

  function bindEvents() {
    elements.chapterFilter?.addEventListener("change", (event) => {
      state.chapterCode = event.target.value;
      render();
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
