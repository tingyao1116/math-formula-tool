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
    chapterSelectView: document.getElementById("mobileChapterSelectView"),
    practiceView: document.getElementById("mobilePracticeView"),
    gradeFilter: document.getElementById("mobileGradeFilter"),
    keywordInput: document.getElementById("mobileKeywordInput"),
    resetButton: document.getElementById("mobileResetButton"),
    chapterCount: document.getElementById("mobileChapterCount"),
    chapterList: document.getElementById("mobileChapterList"),
    backButton: document.getElementById("mobileBackButton"),
    chapterTitle: document.getElementById("mobileChapterTitle"),
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
  const chapterOptionByCode = new Map(
    chapterOptions.map((entry) => [String(entry?.code || "").trim(), entry]),
  );
  const topicById = new Map(
    (store.getCurrentFormulas?.() || []).map((item) => [String(item?.id || "").trim(), item]),
  );
  const urlParams = new URLSearchParams(window.location.search);
  const chapterCodeCollator = new Intl.Collator("zh-Hant", {
    numeric: true,
    sensitivity: "base",
  });

  const gradeOrder = [
    "all",
    "elementary",
    "j1-up",
    "j1-down",
    "j2-up",
    "j2-down",
    "j3-up",
    "j3-down",
    "s1-up",
    "s1-down",
    "s2-up",
    "s2-down",
    "s3",
    "other",
  ];

  const gradeLabelMap = {
    all: "全部",
    elementary: "國小",
    "j1-up": "國一上",
    "j1-down": "國一下",
    "j2-up": "國二上",
    "j2-down": "國二下",
    "j3-up": "國三上",
    "j3-down": "國三下",
    "s1-up": "高一上",
    "s1-down": "高一下",
    "s2-up": "高二上",
    "s2-down": "高二下",
    s3: "高三",
    other: "其他",
  };

  const state = {
    view: "chapter-select",
    gradeKey: "all",
    keyword: "",
    chapterCode: String(urlParams.get("chapter") || "").trim(),
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

  function getNormalizedTermLabel(term) {
    const text = String(term || "").trim();
    if (!text) return "";
    if (text.includes("上")) return "上";
    if (text.includes("下")) return "下";
    return "";
  }

  function getGradeKey(stage, grade, term) {
    const stageText = String(stage || "").trim();
    const gradeText = String(grade || "").trim();
    const termText = getNormalizedTermLabel(term);

    if (stageText === "國小") return "elementary";
    if (stageText === "國中" && gradeText === "國一" && termText === "上") return "j1-up";
    if (stageText === "國中" && gradeText === "國一" && termText === "下") return "j1-down";
    if (stageText === "國中" && gradeText === "國二" && termText === "上") return "j2-up";
    if (stageText === "國中" && gradeText === "國二" && termText === "下") return "j2-down";
    if (stageText === "國中" && gradeText === "國三" && termText === "上") return "j3-up";
    if (stageText === "國中" && gradeText === "國三" && termText === "下") return "j3-down";
    if (stageText === "高中" && gradeText === "高一" && termText === "上") return "s1-up";
    if (stageText === "高中" && gradeText === "高一" && termText === "下") return "s1-down";
    if (stageText === "高中" && gradeText === "高二" && termText === "上") return "s2-up";
    if (stageText === "高中" && gradeText === "高二" && termText === "下") return "s2-down";
    if (stageText === "高中" && gradeText === "高三") return "s3";
    return "other";
  }

  function getGradeLabel(stage, grade, term) {
    return gradeLabelMap[getGradeKey(stage, grade, term)] || "其他";
  }

  function compareChapterCodes(left, right) {
    return chapterCodeCollator.compare(String(left || "").trim(), String(right || "").trim());
  }

  function formatTimeText(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "";
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function getDifficultyLabel(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    return `難度：${text}`;
  }

  function renderMetaChips(item) {
    const values = [
      item.stage,
      getGradeLabel(item.stage, item.grade, item.term),
      item.chapterLabel,
      getDifficultyLabel(item.difficulty),
    ].filter(Boolean);
    return values.map((value) => `<span class="meta-chip">${escapeHtml(value)}</span>`).join("");
  }

  function buildPracticeItems() {
    const records = Object.values(practiceLibrary?.byId || {}).filter((record) => {
      const id = String(record?.id || "").trim();
      if (!id || record?.enabled === false) return false;
      return Boolean(practiceStore.getConfig?.(id));
    });

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
          term: String(record?.term || topic?.term || chapterMeta?.term || "").trim(),
          difficulty: String(record?.difficulty || practiceStore.getConfig?.(id)?.difficulty || "").trim(),
          tags: Array.isArray(record?.tags)
            ? record.tags.map((value) => String(value || "").trim()).filter(Boolean)
            : [],
        };
      })
      .sort(
        (a, b) =>
          compareChapterCodes(a.chapterCode, b.chapterCode) ||
          a.title.localeCompare(b.title, "zh-Hant"),
      );
  }

  const practiceItems = buildPracticeItems();

  function buildGradeOptions() {
    const seen = new Set();
    const rows = [];

    practiceItems.forEach((item) => {
      const key = getGradeKey(item.stage, item.grade, item.term);
      if (!key || seen.has(key)) return;
      seen.add(key);
      rows.push({
        key,
        label: getGradeLabel(item.stage, item.grade, item.term),
      });
    });

    return rows.sort((a, b) => gradeOrder.indexOf(a.key) - gradeOrder.indexOf(b.key));
  }

  function getGradeAndKeywordFilteredItems() {
    const keyword = state.keyword.trim().toLowerCase();
    return practiceItems.filter((item) => {
      const gradeOk =
        state.gradeKey === "all" ||
        getGradeKey(item.stage, item.grade, item.term) === state.gradeKey;
      const keywordOk =
        !keyword ||
        [
          item.id,
          item.title,
          item.chapterCode,
          item.chapterLabel,
          item.stage,
          item.grade,
          item.term,
          ...item.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      return gradeOk && keywordOk;
    });
  }

  function getFilteredItems() {
    return getGradeAndKeywordFilteredItems();
  }

  function getVisibleChapterCodes() {
    const seen = new Set();
    const codes = [];

    getFilteredItems().forEach((item) => {
      if (!item.chapterCode || seen.has(item.chapterCode)) return;
      seen.add(item.chapterCode);
      codes.push(item.chapterCode);
    });

    return codes.sort(compareChapterCodes);
  }

  function getVisibleChapters() {
    return getVisibleChapterCodes().map((code) => {
      const items = getFilteredItems().filter((item) => item.chapterCode === code);
      return {
        code,
        label: String(chapterOptionByCode.get(code)?.label || code).trim(),
        count: items.length,
      };
    });
  }

  function getChapterItems() {
    if (!state.chapterCode) return [];
    return getFilteredItems().filter((item) => item.chapterCode === state.chapterCode);
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

  function ensureSelectedPracticeSession() {
    const item = getSelectedPractice();
    if (!item) return null;
    toolkit.ensureStoredPracticeSession?.(item);
    return toolkit.readStoredPracticeSession?.(item.id) || null;
  }

  function populateGradeFilter() {
    const rows = buildGradeOptions();
    const options = [{ key: "all", label: gradeLabelMap.all }].concat(rows);
    elements.gradeFilter.innerHTML = options
      .map((row) => `<option value="${escapeHtml(row.key)}">${escapeHtml(row.label)}</option>`)
      .join("");

    if (!options.some((row) => row.key === state.gradeKey)) {
      state.gradeKey = "all";
    }
    elements.gradeFilter.value = state.gradeKey;
  }

  function renderQuestionOutputs(questionHtml, summaryHtml, detailHtml) {
    elements.questionOutput.innerHTML = questionHtml;
    elements.summaryOutput.innerHTML = summaryHtml;
    elements.detailOutput.innerHTML = detailHtml;
    elements.summaryOutput.classList.add("is-hidden");
    elements.detailOutput.classList.add("is-hidden");
  }

  function setView(view) {
    state.view = view;
    elements.chapterSelectView.classList.toggle("is-hidden", view !== "chapter-select");
    elements.practiceView.classList.toggle("is-hidden", view !== "chapter-practice");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  function renderChapterList() {
    const chapters = getVisibleChapters();
    elements.chapterCount.textContent = `共 ${chapters.length} 章`;

    if (!chapters.length) {
      elements.chapterList.innerHTML = '<p class="empty-state">目前沒有符合條件的章節。</p>';
      return;
    }

    elements.chapterList.innerHTML = chapters
      .map(
        (chapter, index) => `
      <button
        type="button"
        class="practice-mobile-list__item"
        data-mobile-chapter-code="${escapeHtml(chapter.code)}"
      >
        <div class="practice-mobile-list__row">
          <strong class="practice-mobile-list__chapter-title">${index + 1}. ${escapeHtml(chapter.label)}</strong>
          <span class="practice-mobile-list__chapter-count">${escapeHtml(`共 ${chapter.count} 題型`)}</span>
        </div>
      </button>
    `,
      )
      .join("");
  }

  function renderPracticeList() {
    const chapterItems = getChapterItems();
    const chapterLabel = chapterOptionByCode.get(state.chapterCode)?.label || state.chapterCode || "章節";
    elements.listTitle.textContent = chapterLabel;
    elements.listCount.textContent = `共 ${chapterItems.length} 題型`;

    if (!chapterItems.length) {
      elements.practiceList.innerHTML = '<p class="empty-state">這個章節目前沒有可練習的題型。</p>';
      return;
    }

    elements.practiceList.innerHTML = chapterItems
      .map((item, index) => {
        const session = toolkit.readStoredPracticeSession?.(item.id);
        const total = Array.isArray(session?.questions) ? session.questions.length : 0;
        const progressText = total
          ? `做到第 ${Number(session.currentIndex || 0) + 1} / ${total} 題`
          : "尚未出題";
        const timeText = session?.generatedAt
          ? `上次出題：${formatTimeText(session.generatedAt)}`
          : "尚未記錄";
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
      })
      .join("");
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

  function renderChapterNavigator() {
    const visibleCodes = getVisibleChapterCodes();
    const index = visibleCodes.indexOf(state.chapterCode);
    elements.prevChapterButton.disabled = index <= 0;
    elements.nextChapterButton.disabled = index < 0 || index >= visibleCodes.length - 1;
  }

  function renderPlayer() {
    const selected = ensureSelectedPractice();
    const chapterLabel = chapterOptionByCode.get(state.chapterCode)?.label || state.chapterCode || "章節";
    elements.chapterTitle.textContent = chapterLabel;
    renderChapterNavigator();
    renderPracticeNavigator();

    if (!selected) {
      elements.practiceTitle.textContent = "目前沒有可練習的題型";
      elements.practiceProgress.textContent = "";
      elements.practiceMeta.innerHTML = "";
      elements.practiceHint.textContent = "請先回上一頁改選其他章節。";
      renderQuestionOutputs("目前沒有題目可顯示。", "", "");
      [
        elements.generateButton,
        elements.regenerateButton,
        elements.prevQuestionButton,
        elements.nextQuestionButton,
        elements.summaryButton,
        elements.detailButton,
      ].forEach((button) => {
        button.disabled = true;
      });
      return;
    }

    const chapterItems = getChapterItems();
    const practiceIndex = chapterItems.findIndex((item) => item.id === selected.id);
    const session = ensureSelectedPracticeSession();

    elements.practiceTitle.textContent = selected.title;
    elements.practiceProgress.textContent = `題型 ${practiceIndex + 1} / ${chapterItems.length}`;
    elements.practiceMeta.innerHTML = renderMetaChips(selected);
    elements.generateButton.disabled = false;
    elements.regenerateButton.disabled = false;

    if (!session) {
      elements.practiceHint.textContent = "請先按出題，會優先讀取上次的題目紀錄。";
      renderQuestionOutputs("請先按一次出題。", "", "");
      [
        elements.prevQuestionButton,
        elements.nextQuestionButton,
        elements.summaryButton,
        elements.detailButton,
      ].forEach((button) => {
        button.disabled = true;
      });
      return;
    }

    const total = Array.isArray(session.questions) ? session.questions.length : 0;
    const index = Math.min(Math.max(Number(session.currentIndex) || 0, 0), Math.max(total - 1, 0));
    const progressText = `第 ${index + 1} / ${total} 題`;
    elements.practiceHint.textContent = session.generatedAt
      ? `目前顯示 ${formatTimeText(session.generatedAt)} 的出題紀錄；按重新出題才會換成新題目。`
      : "目前顯示已保存的出題紀錄。";

    const summaryAnswer = Array.isArray(session.summaryAnswers)
      ? session.summaryAnswers[index] || ""
      : "";
    const detailAnswer = Array.isArray(session.answers) ? session.answers[index] || "" : "";

    renderQuestionOutputs(
      `<div class="practice-mobile-question"><div class="practice-mobile-question__index">${escapeHtml(progressText)}</div><div>${toolkit.renderRichTextLine(session.questions[index] || "")}</div></div>`,
      toolkit.renderRichTextLine(summaryAnswer || "目前沒有簡答。"),
      toolkit.renderRichTextLine(detailAnswer || "目前沒有詳解。"),
    );

    elements.prevQuestionButton.disabled = index <= 0;
    elements.nextQuestionButton.disabled = index >= total - 1;
    elements.summaryButton.disabled = false;
    elements.detailButton.disabled = false;
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (state.chapterCode) params.set("chapter", state.chapterCode);
    if (state.selectedPracticeId) params.set("practice", state.selectedPracticeId);
    const url = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", url);
  }

  function renderSelectView() {
    populateGradeFilter();
    elements.keywordInput.value = state.keyword;
    renderChapterList();
  }

  function renderPracticeView() {
    ensureSelectedPractice();
    renderPracticeList();
    renderPlayer();
  }

  function renderAll() {
    renderSelectView();
    renderPracticeView();
    syncUrl();
  }

  function openChapter(chapterCode) {
    state.chapterCode = chapterCode;
    state.selectedPracticeId = "";
    ensureSelectedPractice();
    ensureSelectedPracticeSession();
    setView("chapter-practice");
    renderAll();
  }

  function moveChapter(step) {
    const codes = getVisibleChapterCodes();
    const index = codes.indexOf(state.chapterCode);
    const nextIndex = index + step;
    if (index < 0 || nextIndex < 0 || nextIndex >= codes.length) return;
    state.chapterCode = codes[nextIndex];
    state.selectedPracticeId = "";
    ensureSelectedPractice();
    ensureSelectedPracticeSession();
    renderAll();
  }

  function movePractice(step) {
    const chapterItems = getChapterItems();
    const selected = ensureSelectedPractice();
    if (!selected || !chapterItems.length) return;
    const index = chapterItems.findIndex((item) => item.id === selected.id);
    const nextIndex = index + step;
    if (nextIndex < 0 || nextIndex >= chapterItems.length) return;
    state.selectedPracticeId = chapterItems[nextIndex].id;
    ensureSelectedPracticeSession();
    renderAll();
  }

  function bindEvents() {
    elements.gradeFilter.addEventListener("change", (event) => {
      state.gradeKey = event.target.value || "all";
      state.chapterCode = "";
      state.selectedPracticeId = "";
      renderAll();
    });

    elements.keywordInput.addEventListener("input", (event) => {
      state.keyword = event.target.value || "";
      state.chapterCode = "";
      state.selectedPracticeId = "";
      renderAll();
    });

    elements.resetButton.addEventListener("click", () => {
      state.gradeKey = "all";
      state.keyword = "";
      state.chapterCode = "";
      state.selectedPracticeId = "";
      renderAll();
    });

    elements.chapterList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-mobile-chapter-code]");
      if (!button) return;
      openChapter(String(button.getAttribute("data-mobile-chapter-code") || "").trim());
    });

    elements.backButton.addEventListener("click", () => {
      setView("chapter-select");
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
      ensureSelectedPracticeSession();
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

    elements.prevQuestionButton.addEventListener("click", () => {
      const item = getSelectedPractice();
      const session = item ? toolkit.readStoredPracticeSession?.(item.id) : null;
      if (!item || !session) return;
      toolkit.updateStoredPracticeSessionIndex?.(
        item.id,
        Math.max((Number(session.currentIndex) || 0) - 1, 0),
      );
      renderAll();
    });

    elements.nextQuestionButton.addEventListener("click", () => {
      const item = getSelectedPractice();
      const session = item ? toolkit.readStoredPracticeSession?.(item.id) : null;
      if (!item || !session) return;
      const maxIndex = Math.max((session.questions?.length || 1) - 1, 0);
      toolkit.updateStoredPracticeSessionIndex?.(
        item.id,
        Math.min((Number(session.currentIndex) || 0) + 1, maxIndex),
      );
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

  if (state.chapterCode && getVisibleChapterCodes().includes(state.chapterCode)) {
    setView("chapter-practice");
    renderAll();
  } else {
    setView("chapter-select");
  }
})();
