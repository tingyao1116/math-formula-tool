(() => {
  const store = window.formulaDataStore || null;
  const toolkit = window.formulaToolkit || null;
  const practiceStore = window.formulaPracticeStore || null;
  const practiceLibrary = window.practiceLibraryStore || null;

  if (!store || !toolkit || !practiceStore || !practiceLibrary) {
    console.warn("practice mobile dependencies not loaded");
    return;
  }

  const elements = {
    gradeFilter: document.getElementById("mobileGradeFilter"),
    chapterFilter: document.getElementById("mobileChapterFilter"),
    keywordInput: document.getElementById("mobileKeywordInput"),
    resetButton: document.getElementById("mobileResetButton"),
    practiceTitle: document.getElementById("mobilePracticeTitle"),
    practiceProgress: document.getElementById("mobilePracticeProgress"),
    practiceMeta: document.getElementById("mobilePracticeMeta"),
    practiceHint: document.getElementById("mobilePracticeHint"),
    generateButton: document.getElementById("mobileGenerateButton"),
    regenerateButton: document.getElementById("mobileRegenerateButton"),
    prevButton: document.getElementById("mobilePrevButton"),
    nextButton: document.getElementById("mobileNextButton"),
    summaryButton: document.getElementById("mobileSummaryButton"),
    detailButton: document.getElementById("mobileDetailButton"),
    questionOutput: document.getElementById("mobileQuestionOutput"),
    summaryOutput: document.getElementById("mobileSummaryOutput"),
    detailOutput: document.getElementById("mobileDetailOutput"),
    listTitle: document.getElementById("mobileListTitle"),
    listCount: document.getElementById("mobileListCount"),
    practiceList: document.getElementById("mobilePracticeList"),
  };

  const chapterOptions = (store.getChapterOptions?.() || []).slice();
  const chapterOptionByCode = new Map(chapterOptions.map((entry) => [String(entry?.code || "").trim(), entry]));
  const topicById = new Map(
    (store.getCurrentFormulas?.() || []).map((item) => [String(item?.id || "").trim(), item])
  );
  const urlParams = new URLSearchParams(window.location.search);
  const initialChapterCode = String(urlParams.get("chapter") || "all").trim();
  const initialPracticeId = String(urlParams.get("practice") || "").trim();

  const state = {
    gradeKey: "all",
    chapterCode: initialChapterCode || "all",
    keyword: "",
    selectedPracticeId: initialPracticeId,
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getGradeKey(stage, grade) {
    const stageText = String(stage || "").trim();
    const gradeText = String(grade || "").trim();
    return stageText && gradeText ? `${stageText}::${gradeText}` : "";
  }

  function getGradeLabel(stage, grade) {
    return [String(stage || "").trim(), String(grade || "").trim()].filter(Boolean).join("");
  }

  function formatTimeText(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "";
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function renderMetaChips(item) {
    const values = [
      item.stage,
      item.grade,
      item.chapterLabel,
      item.difficulty ? `難度：${item.difficulty}` : "",
    ].filter(Boolean);
    return values.map((value) => `<span class="meta-chip">${escapeHtml(value)}</span>`).join("");
  }

  function buildPracticeItems() {
    const records = Object.values(practiceLibrary?.byId || {}).filter((record) => {
      const id = String(record?.id || "").trim();
      if (!id || record?.enabled === false) return false;
      return Boolean(practiceStore.getConfig?.(id));
    });

    const chapterOrder = new Map(chapterOptions.map((entry, index) => [String(entry?.code || "").trim(), index]));
    return records
      .map((record) => {
        const id = String(record?.id || "").trim();
        const topic = topicById.get(id) || null;
        const chapterCode = String(record?.chapterCode || topic?.chapterCode || "").trim();
        const chapterMeta = chapterOptionByCode.get(chapterCode) || null;
        return {
          id,
          title: String(record?.title || topic?.title || id).trim(),
          chapterCode,
          chapterLabel: String(chapterMeta?.label || record?.chapter || topic?.chapter || chapterCode).trim(),
          stage: String(record?.stage || topic?.stage || chapterMeta?.stage || "").trim(),
          grade: String(record?.grade || topic?.grade || chapterMeta?.grade || "").trim(),
          difficulty: String(record?.difficulty || practiceStore.getConfig?.(id)?.difficulty || "").trim(),
          tags: Array.isArray(record?.tags) ? record.tags.map((value) => String(value || "").trim()).filter(Boolean) : [],
          order: chapterOrder.get(chapterCode) ?? 999,
        };
      })
      .sort((a, b) => (a.order - b.order) || a.title.localeCompare(b.title, "zh-Hant"));
  }

  const practiceItems = buildPracticeItems();

  function buildGradeOptions() {
    const rows = [];
    const seen = new Set();
    practiceItems.forEach((item) => {
      const key = getGradeKey(item.stage, item.grade);
      if (!key || seen.has(key)) return;
      seen.add(key);
      rows.push({ key, label: getGradeLabel(item.stage, item.grade) });
    });
    return rows;
  }

  function getVisibleItems() {
    const keyword = state.keyword.trim().toLowerCase();
    return practiceItems.filter((item) => {
      const gradeOk = state.gradeKey === "all" || getGradeKey(item.stage, item.grade) === state.gradeKey;
      const chapterOk = state.chapterCode === "all" || item.chapterCode === state.chapterCode;
      const keywordOk = !keyword || [item.title, item.chapterLabel, item.stage, item.grade, ...item.tags]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
      return gradeOk && chapterOk && keywordOk;
    });
  }

  function ensureSelectedPractice() {
    const visibleItems = getVisibleItems();
    if (!visibleItems.length) {
      state.selectedPracticeId = "";
      return null;
    }
    const selected = visibleItems.find((item) => item.id === state.selectedPracticeId);
    if (selected) return selected;
    state.selectedPracticeId = visibleItems[0].id;
    return visibleItems[0];
  }

  function getSelectedPractice() {
    return practiceItems.find((item) => item.id === state.selectedPracticeId) || null;
  }

  function populateGradeFilter() {
    const rows = buildGradeOptions();
    const options = ['<option value="all">全部年級</option>']
      .concat(rows.map((row) => `<option value="${escapeHtml(row.key)}">${escapeHtml(row.label)}</option>`));
    elements.gradeFilter.innerHTML = options.join("");
    elements.gradeFilter.value = rows.some((row) => row.key === state.gradeKey) ? state.gradeKey : "all";
    if (elements.gradeFilter.value !== state.gradeKey) state.gradeKey = elements.gradeFilter.value;
  }

  function populateChapterFilter() {
    const visibleByGrade = practiceItems.filter((item) => state.gradeKey === "all" || getGradeKey(item.stage, item.grade) === state.gradeKey);
    const codes = new Set(visibleByGrade.map((item) => item.chapterCode).filter(Boolean));
    const options = ['<option value="all">全部章節</option>']
      .concat(chapterOptions
        .filter((entry) => codes.has(String(entry?.code || "").trim()))
        .map((entry) => `<option value="${escapeHtml(String(entry.code || "").trim())}">${escapeHtml(String(entry.label || entry.code || "").trim())}</option>`));
    elements.chapterFilter.innerHTML = options.join("");
    if (![...elements.chapterFilter.options].some((option) => option.value === state.chapterCode)) {
      state.chapterCode = "all";
    }
    elements.chapterFilter.value = state.chapterCode;
  }

  function renderList() {
    const visibleItems = getVisibleItems();
    elements.listTitle.textContent = state.chapterCode === "all"
      ? "全部可做練習"
      : (chapterOptionByCode.get(state.chapterCode)?.label || state.chapterCode);
    elements.listCount.textContent = `共 ${visibleItems.length} 組`;
    if (!visibleItems.length) {
      elements.practiceList.innerHTML = '<p class="empty-state">目前沒有符合條件的練習。</p>';
      return;
    }
    elements.practiceList.innerHTML = visibleItems.map((item) => {
      const session = toolkit.readStoredPracticeSession?.(item.id);
      const total = Array.isArray(session?.questions) ? session.questions.length : 0;
      const progressText = total
        ? `第 ${Number(session.currentIndex || 0) + 1} / ${total} 題`
        : "尚未出題";
      const timeText = session?.generatedAt ? `上次：${formatTimeText(session.generatedAt)}` : "未開始";
      return `
        <button type="button" class="practice-mobile-list__item ${item.id === state.selectedPracticeId ? "is-active" : ""}" data-mobile-practice-id="${escapeHtml(item.id)}">
          <div class="practice-mobile-list__main">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.chapterLabel)}</span>
          </div>
          <div class="practice-mobile-list__meta">
            <span>${escapeHtml(progressText)}</span>
            <span>${escapeHtml(timeText)}</span>
          </div>
        </button>
      `;
    }).join("");
  }

  function setQuestionOutputs(questionHtml, summaryHtml, detailHtml) {
    elements.questionOutput.innerHTML = questionHtml;
    elements.summaryOutput.innerHTML = summaryHtml;
    elements.detailOutput.innerHTML = detailHtml;
    elements.summaryOutput.classList.add("is-hidden");
    elements.detailOutput.classList.add("is-hidden");
  }

  function renderPlayer() {
    const selected = ensureSelectedPractice();
    if (!selected) {
      elements.practiceTitle.textContent = "目前沒有可做的練習";
      elements.practiceProgress.textContent = "";
      elements.practiceMeta.innerHTML = "";
      elements.practiceHint.textContent = "請先調整篩選條件。";
      setQuestionOutputs("目前沒有可做的練習。", "", "");
      [elements.generateButton, elements.regenerateButton, elements.prevButton, elements.nextButton, elements.summaryButton, elements.detailButton]
        .forEach((button) => { button.disabled = true; });
      return;
    }

    const session = toolkit.readStoredPracticeSession?.(selected.id) || null;
    elements.practiceTitle.textContent = selected.title;
    elements.practiceMeta.innerHTML = renderMetaChips(selected);
    elements.generateButton.disabled = false;
    elements.regenerateButton.disabled = false;

    if (!session) {
      elements.practiceProgress.textContent = "尚未出題";
      elements.practiceHint.textContent = "按「出題」會建立這一輪題目；下次再回來時，會接著同一輪。";
      setQuestionOutputs("尚未出題。按「出題」開始，之後再回來會接著這一輪。", "", "");
      [elements.prevButton, elements.nextButton, elements.summaryButton, elements.detailButton]
        .forEach((button) => { button.disabled = true; });
      return;
    }

    const total = session.questions.length;
    const index = Math.min(Math.max(Number(session.currentIndex) || 0, 0), Math.max(total - 1, 0));
    const progressText = `第 ${index + 1} / ${total} 題`;
    elements.practiceProgress.textContent = progressText;
    elements.practiceHint.textContent = session.generatedAt
      ? `這一輪建立於 ${formatTimeText(session.generatedAt)}。按「出題」會接續這一輪，按「重新出題」才會換新題。`
      : "按「出題」會接續這一輪，按「重新出題」才會換新題。";

    const question = session.questions[index] || "";
    const summary = session.summaryAnswers[index] || "目前沒有簡答。";
    const detail = session.answers[index] || "目前沒有詳解。";
    setQuestionOutputs(
      `<div class="practice-mobile-question"><div class="practice-mobile-question__index">${escapeHtml(progressText)}</div><div>${toolkit.renderRichTextLine(question)}</div></div>`,
      toolkit.renderRichTextLine(summary),
      toolkit.renderRichTextLine(detail)
    );

    elements.prevButton.disabled = index <= 0;
    elements.nextButton.disabled = index >= total - 1;
    elements.summaryButton.disabled = false;
    elements.detailButton.disabled = false;
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (state.chapterCode && state.chapterCode !== "all") params.set("chapter", state.chapterCode);
    if (state.selectedPracticeId) params.set("practice", state.selectedPracticeId);
    const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", next);
  }

  function renderAll() {
    populateGradeFilter();
    populateChapterFilter();
    ensureSelectedPractice();
    renderList();
    renderPlayer();
    syncUrl();
  }

  function bindEvents() {
    elements.gradeFilter.addEventListener("change", (event) => {
      state.gradeKey = event.target.value || "all";
      state.chapterCode = "all";
      renderAll();
    });

    elements.chapterFilter.addEventListener("change", (event) => {
      state.chapterCode = event.target.value || "all";
      renderAll();
    });

    elements.keywordInput.addEventListener("input", (event) => {
      state.keyword = event.target.value || "";
      renderAll();
    });

    elements.resetButton.addEventListener("click", () => {
      state.gradeKey = "all";
      state.chapterCode = "all";
      state.keyword = "";
      renderAll();
    });

    elements.practiceList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-mobile-practice-id]");
      if (!button) return;
      state.selectedPracticeId = String(button.getAttribute("data-mobile-practice-id") || "").trim();
      renderAll();
    });

    elements.generateButton.addEventListener("click", () => {
      const item = getSelectedPractice();
      if (!item) return;
      toolkit.ensureStoredPracticeSession?.(item);
      renderAll();
    });

    elements.regenerateButton.addEventListener("click", () => {
      const item = getSelectedPractice();
      if (!item) return;
      toolkit.regenerateStoredPracticeSession?.(item);
      renderAll();
    });

    elements.prevButton.addEventListener("click", () => {
      const item = getSelectedPractice();
      const session = item ? toolkit.readStoredPracticeSession?.(item.id) : null;
      if (!item || !session) return;
      toolkit.updateStoredPracticeSessionIndex?.(item.id, Math.max((Number(session.currentIndex) || 0) - 1, 0));
      renderAll();
    });

    elements.nextButton.addEventListener("click", () => {
      const item = getSelectedPractice();
      const session = item ? toolkit.readStoredPracticeSession?.(item.id) : null;
      if (!item || !session) return;
      const maxIndex = Math.max((session.questions?.length || 1) - 1, 0);
      toolkit.updateStoredPracticeSessionIndex?.(item.id, Math.min((Number(session.currentIndex) || 0) + 1, maxIndex));
      renderAll();
    });

    elements.summaryButton.addEventListener("click", () => {
      if (elements.summaryButton.disabled) return;
      elements.summaryOutput.classList.toggle("is-hidden");
    });

    elements.detailButton.addEventListener("click", () => {
      if (elements.detailButton.disabled) return;
      elements.detailOutput.classList.toggle("is-hidden");
    });
  }

  bindEvents();
  renderAll();
})();
