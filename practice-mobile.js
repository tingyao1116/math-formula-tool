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
    chapterTitle: document.getElementById("mobileChapterTitle"),
    chapterProgress: document.getElementById("mobileChapterProgress"),
    prevChapterButton: document.getElementById("mobilePrevChapterButton"),
    nextChapterButton: document.getElementById("mobileNextChapterButton"),
    prevPracticeButton: document.getElementById("mobilePrevPracticeButton"),
    nextPracticeButton: document.getElementById("mobileNextPracticeButton"),
    practiceTitle: document.getElementById("mobilePracticeTitle"),
    practiceProgress: document.getElementById("mobilePracticeProgress"),
    practiceMeta: document.getElementById("mobilePracticeMeta"),
    practiceHint: document.getElementById("mobilePracticeHint"),
    generateButton: document.getElementById("mobileGenerateButton"),
    regenerateButton: document.getElementById("mobileRegenerateButton"),
    prevQuestionButton: document.getElementById("mobilePrevQuestionButton"),
    nextQuestionButton: document.getElementById("mobileNextQuestionButton"),
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
  const topicById = new Map((store.getCurrentFormulas?.() || []).map((item) => [String(item?.id || "").trim(), item]));
  const urlParams = new URLSearchParams(window.location.search);

  const state = {
    gradeKey: "all",
    chapterCode: String(urlParams.get("chapter") || "all").trim() || "all",
    keyword: "",
    selectedPracticeId: String(urlParams.get("practice") || "").trim(),
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
          chapterOrder: chapterOrder.get(chapterCode) ?? 999,
        };
      })
      .sort((a, b) =>
        (a.chapterOrder - b.chapterOrder) ||
        a.title.localeCompare(b.title, "zh-Hant")
      );
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

  function getGradeFilteredItems() {
    const keyword = state.keyword.trim().toLowerCase();
    return practiceItems.filter((item) => {
      const gradeOk = state.gradeKey === "all" || getGradeKey(item.stage, item.grade) === state.gradeKey;
      const keywordOk = !keyword || [item.title, item.chapterLabel, item.stage, item.grade, ...item.tags]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
      return gradeOk && keywordOk;
    });
  }

  function getVisibleChapterCodes() {
    const seen = new Set();
    const codes = [];
    getGradeFilteredItems().forEach((item) => {
      if (!item.chapterCode || seen.has(item.chapterCode)) return;
      seen.add(item.chapterCode);
      codes.push(item.chapterCode);
    });
    return codes.sort((a, b) => {
      const orderA = chapterOptions.findIndex((entry) => String(entry?.code || "").trim() === a);
      const orderB = chapterOptions.findIndex((entry) => String(entry?.code || "").trim() === b);
      return orderA - orderB;
    });
  }

  function getChapterItems() {
    if (state.chapterCode === "all") return [];
    return getGradeFilteredItems().filter((item) => item.chapterCode === state.chapterCode);
  }

  function ensureSelectedPractice() {
    const chapterItems = getChapterItems();
    if (!chapterItems.length) {
      state.selectedPracticeId = "";
      return null;
    }
    const selected = chapterItems.find((item) => item.id === state.selectedPracticeId);
    if (selected) return selected;
    state.selectedPracticeId = chapterItems[0].id;
    return chapterItems[0];
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
    const visibleCodes = new Set(getVisibleChapterCodes());
    const options = ['<option value="all">請先選章節</option>']
      .concat(chapterOptions
        .filter((entry) => visibleCodes.has(String(entry?.code || "").trim()))
        .map((entry) => `<option value="${escapeHtml(String(entry.code || "").trim())}">${escapeHtml(String(entry.label || entry.code || "").trim())}</option>`));
    elements.chapterFilter.innerHTML = options.join("");
    if (![...elements.chapterFilter.options].some((option) => option.value === state.chapterCode)) {
      state.chapterCode = "all";
    }
    elements.chapterFilter.value = state.chapterCode;
  }

  function renderQuestionOutputs(questionHtml, summaryHtml, detailHtml) {
    elements.questionOutput.innerHTML = questionHtml;
    elements.summaryOutput.innerHTML = summaryHtml;
    elements.detailOutput.innerHTML = detailHtml;
    elements.summaryOutput.classList.add("is-hidden");
    elements.detailOutput.classList.add("is-hidden");
  }

  function renderChapterNavigator() {
    const visibleChapterCodes = getVisibleChapterCodes();
    if (!visibleChapterCodes.length || state.chapterCode === "all") {
      elements.chapterTitle.textContent = "請先選一個章節";
      elements.chapterProgress.textContent = "";
      elements.prevChapterButton.disabled = true;
      elements.nextChapterButton.disabled = true;
      return;
    }

    const index = visibleChapterCodes.indexOf(state.chapterCode);
    const label = chapterOptionByCode.get(state.chapterCode)?.label || state.chapterCode;
    elements.chapterTitle.textContent = label;
    elements.chapterProgress.textContent = `第 ${index + 1} / ${visibleChapterCodes.length} 章`;
    elements.prevChapterButton.disabled = index <= 0;
    elements.nextChapterButton.disabled = index < 0 || index >= visibleChapterCodes.length - 1;
  }

  function renderPracticeList() {
    const chapterItems = getChapterItems();
    if (state.chapterCode === "all") {
      elements.listTitle.textContent = "請先選一個章節";
      elements.listCount.textContent = "";
      elements.practiceList.innerHTML = '<p class="empty-state">先從上方章節下拉選單選一章，再進入章節頁面做題。</p>';
      return;
    }

    const chapterLabel = chapterOptionByCode.get(state.chapterCode)?.label || state.chapterCode;
    elements.listTitle.textContent = `${chapterLabel} 題型清單`;
    elements.listCount.textContent = `共 ${chapterItems.length} 組`;

    if (!chapterItems.length) {
      elements.practiceList.innerHTML = '<p class="empty-state">這個章節目前沒有符合條件的題型。</p>';
      return;
    }

    elements.practiceList.innerHTML = chapterItems.map((item, index) => {
      const session = toolkit.readStoredPracticeSession?.(item.id);
      const total = Array.isArray(session?.questions) ? session.questions.length : 0;
      const progressText = total
        ? `第 ${Number(session.currentIndex || 0) + 1} / ${total} 題`
        : "尚未出題";
      const timeText = session?.generatedAt ? `上次：${formatTimeText(session.generatedAt)}` : "未開始";
      return `
        <button
          type="button"
          class="practice-mobile-list__item ${item.id === state.selectedPracticeId ? "is-active" : ""}"
          data-mobile-practice-id="${escapeHtml(item.id)}"
        >
          <div class="practice-mobile-list__main">
            <strong>${index + 1}. ${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(progressText)}</span>
          </div>
          <div class="practice-mobile-list__meta">
            <span>${escapeHtml(item.chapterLabel)}</span>
            <span>${escapeHtml(timeText)}</span>
          </div>
        </button>
      `;
    }).join("");
  }

  function renderPracticeNavigator() {
    const chapterItems = getChapterItems();
    const selected = ensureSelectedPractice();
    if (!selected || !chapterItems.length) {
      elements.prevPracticeButton.disabled = true;
      elements.nextPracticeButton.disabled = true;
      return;
    }
    const index = chapterItems.findIndex((item) => item.id === selected.id);
    elements.prevPracticeButton.disabled = index <= 0;
    elements.nextPracticeButton.disabled = index < 0 || index >= chapterItems.length - 1;
  }

  function renderPlayer() {
    const selected = ensureSelectedPractice();
    renderPracticeNavigator();

    if (state.chapterCode === "all") {
      elements.practiceTitle.textContent = "請先選一個題型";
      elements.practiceProgress.textContent = "";
      elements.practiceMeta.innerHTML = "";
      elements.practiceHint.textContent = "先選章節，再在章節裡選題型。";
      renderQuestionOutputs("尚未出題。先選章節與題型。", "", "");
      [elements.generateButton, elements.regenerateButton, elements.prevQuestionButton, elements.nextQuestionButton, elements.summaryButton, elements.detailButton]
        .forEach((button) => { button.disabled = true; });
      return;
    }

    if (!selected) {
      elements.practiceTitle.textContent = "這個章節目前沒有題型";
      elements.practiceProgress.textContent = "";
      elements.practiceMeta.innerHTML = "";
      elements.practiceHint.textContent = "這個章節目前沒有符合條件的練習。";
      renderQuestionOutputs("這個章節目前沒有符合條件的練習。", "", "");
      [elements.generateButton, elements.regenerateButton, elements.prevQuestionButton, elements.nextQuestionButton, elements.summaryButton, elements.detailButton]
        .forEach((button) => { button.disabled = true; });
      return;
    }

    const chapterItems = getChapterItems();
    const practiceIndex = chapterItems.findIndex((item) => item.id === selected.id);
    const session = toolkit.readStoredPracticeSession?.(selected.id) || null;

    elements.practiceTitle.textContent = selected.title;
    elements.practiceProgress.textContent = `題型 ${practiceIndex + 1} / ${chapterItems.length}`;
    elements.practiceMeta.innerHTML = renderMetaChips(selected);
    elements.generateButton.disabled = false;
    elements.regenerateButton.disabled = false;

    if (!session) {
      elements.practiceHint.textContent = "按「出題」會建立這一輪題目；下次回來會接著同一輪。";
      renderQuestionOutputs("尚未出題。按「出題」開始，之後回來會接著同一輪。", "", "");
      [elements.prevQuestionButton, elements.nextQuestionButton, elements.summaryButton, elements.detailButton]
        .forEach((button) => { button.disabled = true; });
      return;
    }

    const total = session.questions.length;
    const index = Math.min(Math.max(Number(session.currentIndex) || 0, 0), Math.max(total - 1, 0));
    const progressText = `第 ${index + 1} / ${total} 題`;
    elements.practiceHint.textContent = session.generatedAt
      ? `這一輪建立於 ${formatTimeText(session.generatedAt)}。按「出題」會回到這一輪，按「重新出題」才會換新題。`
      : "按「出題」會回到這一輪，按「重新出題」才會換新題。";

    renderQuestionOutputs(
      `<div class="practice-mobile-question"><div class="practice-mobile-question__index">${escapeHtml(progressText)}</div><div>${toolkit.renderRichTextLine(session.questions[index] || "")}</div></div>`,
      toolkit.renderRichTextLine(session.summaryAnswers[index] || "目前沒有簡答。"),
      toolkit.renderRichTextLine(session.answers[index] || "目前沒有詳解。")
    );

    elements.prevQuestionButton.disabled = index <= 0;
    elements.nextQuestionButton.disabled = index >= total - 1;
    elements.summaryButton.disabled = false;
    elements.detailButton.disabled = false;
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (state.chapterCode !== "all") params.set("chapter", state.chapterCode);
    if (state.selectedPracticeId) params.set("practice", state.selectedPracticeId);
    const url = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", url);
  }

  function renderAll() {
    populateGradeFilter();
    populateChapterFilter();
    ensureSelectedPractice();
    renderChapterNavigator();
    renderPracticeList();
    renderPlayer();
    syncUrl();
  }

  function moveChapter(step) {
    const codes = getVisibleChapterCodes();
    if (!codes.length || state.chapterCode === "all") return;
    const index = codes.indexOf(state.chapterCode);
    const nextIndex = index + step;
    if (nextIndex < 0 || nextIndex >= codes.length) return;
    state.chapterCode = codes[nextIndex];
    state.selectedPracticeId = "";
    renderAll();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  function movePractice(step) {
    const chapterItems = getChapterItems();
    const selected = ensureSelectedPractice();
    if (!selected || !chapterItems.length) return;
    const index = chapterItems.findIndex((item) => item.id === selected.id);
    const nextIndex = index + step;
    if (nextIndex < 0 || nextIndex >= chapterItems.length) return;
    state.selectedPracticeId = chapterItems[nextIndex].id;
    renderAll();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  function bindEvents() {
    elements.gradeFilter.addEventListener("change", (event) => {
      state.gradeKey = event.target.value || "all";
      state.chapterCode = "all";
      state.selectedPracticeId = "";
      renderAll();
    });

    elements.chapterFilter.addEventListener("change", (event) => {
      state.chapterCode = event.target.value || "all";
      state.selectedPracticeId = "";
      renderAll();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    elements.keywordInput.addEventListener("input", (event) => {
      state.keyword = event.target.value || "";
      renderAll();
    });

    elements.resetButton.addEventListener("click", () => {
      state.gradeKey = "all";
      state.chapterCode = "all";
      state.keyword = "";
      state.selectedPracticeId = "";
      renderAll();
    });

    elements.prevChapterButton.addEventListener("click", () => moveChapter(-1));
    elements.nextChapterButton.addEventListener("click", () => moveChapter(1));
    elements.prevPracticeButton.addEventListener("click", () => movePractice(-1));
    elements.nextPracticeButton.addEventListener("click", () => movePractice(1));

    elements.practiceList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-mobile-practice-id]");
      if (!button) return;
      state.selectedPracticeId = String(button.getAttribute("data-mobile-practice-id") || "").trim();
      renderAll();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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

    elements.prevQuestionButton.addEventListener("click", () => {
      const item = getSelectedPractice();
      const session = item ? toolkit.readStoredPracticeSession?.(item.id) : null;
      if (!item || !session) return;
      toolkit.updateStoredPracticeSessionIndex?.(item.id, Math.max((Number(session.currentIndex) || 0) - 1, 0));
      renderAll();
    });

    elements.nextQuestionButton.addEventListener("click", () => {
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
