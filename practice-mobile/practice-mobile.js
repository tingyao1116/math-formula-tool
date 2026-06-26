(() => {
  const store = window.formulaDataStore || null;
  const toolkit = window.formulaToolkit || null;
  const practiceStore = window.formulaPracticeStore || null;
  const practiceLibrary = window.practiceLibraryStore || null;
  const generatorLoader = window.practiceGeneratorLoader || null;

  if (!store || !toolkit || !practiceStore || !practiceLibrary) {
    console.warn("practice mobile dependencies not loaded");
    return;
  }

  const TEXT = {
    all: "\u5168\u90e8",
    elementary4: "\u570b\u5c0f\u56db\u5e74\u7d1a",
    elementary5: "\u570b\u5c0f\u4e94\u5e74\u7d1a",
    elementary6: "\u570b\u5c0f\u516d\u5e74\u7d1a",
    j1Up: "\u570b\u4e00\u4e0a",
    j1Down: "\u570b\u4e00\u4e0b",
    j2Up: "\u570b\u4e8c\u4e0a",
    j2Down: "\u570b\u4e8c\u4e0b",
    j3Up: "\u570b\u4e09\u4e0a",
    j3Down: "\u570b\u4e09\u4e0b",
    s1Up: "\u9ad8\u4e00\u4e0a",
    s1Down: "\u9ad8\u4e00\u4e0b",
    s2Up: "\u9ad8\u4e8c\u4e0a",
    s2Down: "\u9ad8\u4e8c\u4e0b",
    s3: "\u9ad8\u4e09",
    other: "\u5176\u4ed6",
    difficultyPrefix: "\u96e3\u5ea6\uff1a",
    chapterUnit: "\u7ae0",
    practiceUnit: "\u984c\u578b",
    noMatchingChapter: "\u76ee\u524d\u6c92\u6709\u7b26\u5408\u689d\u4ef6\u7684\u7ae0\u7bc0\u3002",
    noPracticeInChapter: "\u9019\u500b\u7ae0\u7bc0\u76ee\u524d\u6c92\u6709\u53ef\u7df4\u7fd2\u7684\u984c\u578b\u3002",
    notGenerated: "\u5c1a\u672a\u51fa\u984c",
    noRecord: "\u5c1a\u672a\u8a18\u9304",
    lastGenerated: "\u4e0a\u6b21\u51fa\u984c\uff1a",
    solvedProgressPrefix: "\u505a\u5230\u7b2c ",
    currentQuestionPrefix: "\u7b2c ",
    currentQuestionSuffix: " \u984c",
    generatedRecordHint:
      "\u76ee\u524d\u986f\u793a ",
    generatedRecordHintSuffix:
      " \u7684\u51fa\u984c\u7d00\u9304\uff1b\u6309\u91cd\u65b0\u51fa\u984c\u624d\u6703\u63db\u6210\u65b0\u984c\u76ee\u3002",
    storedRecordHint:
      "\u76ee\u524d\u986f\u793a\u5df2\u4fdd\u5b58\u7684\u51fa\u984c\u7d00\u9304\u3002",
    clickGenerateHint:
      "\u8acb\u5148\u6309\u51fa\u984c\uff0c\u6703\u512a\u5148\u8b80\u53d6\u4e0a\u6b21\u7684\u984c\u76ee\u7d00\u9304\u3002",
    clickGenerate: "\u8acb\u5148\u6309\u4e00\u6b21\u51fa\u984c\u3002",
    noSummary: "\u76ee\u524d\u6c92\u6709\u7c21\u7b54\u3002",
    noDetail: "\u76ee\u524d\u6c92\u6709\u8a73\u89e3\u3002",
    noPractice: "\u76ee\u524d\u6c92\u6709\u53ef\u7df4\u7fd2\u7684\u984c\u578b",
    switchChapterHint: "\u8acb\u5148\u56de\u4e0a\u4e00\u9801\u6539\u9078\u5176\u4ed6\u7ae0\u7bc0\u3002",
    noQuestionToShow: "\u76ee\u524d\u6c92\u6709\u984c\u76ee\u53ef\u986f\u793a\u3002",
    chapterFallback: "\u7ae0\u7bc0",
    chapterCountPrefix: "\u5171 ",
    topicIndexPrefix: "\u984c\u578b ",
    loadingPractice: "\u6b63\u5728\u8f09\u5165\u984c\u76ee\u2026",
    loadingPracticeHint: "\u6b63\u5728\u6e96\u5099\u984c\u76ee\uff0c\u7a0d\u7b49\u4e00\u4e0b\u5c31\u6703\u81ea\u52d5\u986f\u793a\u3002",
  };

  const elements = {
    chapterSelectView: document.getElementById("mobileChapterSelectView"),
    practiceView: document.getElementById("mobilePracticeView"),
    player: document.getElementById("mobilePracticePlayer"),
    practiceListPanel: document.getElementById("mobilePracticeListPanel"),
    layoutModeSelect: document.getElementById("mobileLayoutModeSelect"),
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
    defaultTopActions: document.getElementById("mobileDefaultTopActions"),
    defaultBottomActions: document.getElementById("mobileDefaultBottomActions"),
    focusBottomActions: document.getElementById("mobileFocusBottomActions"),
    compactActions: document.getElementById("mobileCompactActions"),
    mode2PrevChapterButton: document.getElementById("mobileMode2PrevChapterButton"),
    mode2NextChapterButton: document.getElementById("mobileMode2NextChapterButton"),
    mode2PrevPracticeButton: document.getElementById("mobileMode2PrevPracticeButton"),
    mode2NextPracticeButton: document.getElementById("mobileMode2NextPracticeButton"),
    mode2PrevQuestionButton: document.getElementById("mobileMode2PrevQuestionButton"),
    mode2NextQuestionButton: document.getElementById("mobileMode2NextQuestionButton"),
    mode2SummaryButton: document.getElementById("mobileMode2SummaryButton"),
    mode2DetailButton: document.getElementById("mobileMode2DetailButton"),
    mode2RegenerateButton: document.getElementById("mobileMode2RegenerateButton"),
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
    "elementary-4",
    "elementary-5",
    "elementary-6",
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
    all: TEXT.all,
    "elementary-4": TEXT.elementary4,
    "elementary-5": TEXT.elementary5,
    "elementary-6": TEXT.elementary6,
    "j1-up": TEXT.j1Up,
    "j1-down": TEXT.j1Down,
    "j2-up": TEXT.j2Up,
    "j2-down": TEXT.j2Down,
    "j3-up": TEXT.j3Up,
    "j3-down": TEXT.j3Down,
    "s1-up": TEXT.s1Up,
    "s1-down": TEXT.s1Down,
    "s2-up": TEXT.s2Up,
    "s2-down": TEXT.s2Down,
    s3: TEXT.s3,
    other: TEXT.other,
  };

  const state = {
    view: "chapter-select",
    gradeKey: "all",
    keyword: "",
    chapterCode: String(urlParams.get("chapter") || "").trim(),
    selectedPracticeId: String(urlParams.get("practice") || "").trim(),
    layoutMode: "focus",
    loadingPracticeId: "",
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeStage(value) {
    return String(value || "").trim();
  }

  function normalizeGrade(value) {
    return String(value || "").trim();
  }

  function getNormalizedTermLabel(term) {
    const text = String(term || "").trim();
    if (!text) return "";
    if (text.includes("\u4e0a")) return "\u4e0a";
    if (text.includes("\u4e0b")) return "\u4e0b";
    return "";
  }

  function getGradeKey(stage, grade, term) {
    const stageText = normalizeStage(stage);
    const gradeText = normalizeGrade(grade);
    const termText = getNormalizedTermLabel(term);

    if (stageText === "\u570b\u5c0f" && gradeText === "\u5c0f\u56db") return "elementary-4";
    if (stageText === "\u570b\u5c0f" && gradeText === "\u5c0f\u4e94") return "elementary-5";
    if (stageText === "\u570b\u5c0f" && gradeText === "\u5c0f\u516d") return "elementary-6";
    if (stageText === "\u570b\u4e2d" && gradeText === "\u570b\u4e00" && termText === "\u4e0a") return "j1-up";
    if (stageText === "\u570b\u4e2d" && gradeText === "\u570b\u4e00" && termText === "\u4e0b") return "j1-down";
    if (stageText === "\u570b\u4e2d" && gradeText === "\u570b\u4e8c" && termText === "\u4e0a") return "j2-up";
    if (stageText === "\u570b\u4e2d" && gradeText === "\u570b\u4e8c" && termText === "\u4e0b") return "j2-down";
    if (stageText === "\u570b\u4e2d" && gradeText === "\u570b\u4e09" && termText === "\u4e0a") return "j3-up";
    if (stageText === "\u570b\u4e2d" && gradeText === "\u570b\u4e09" && termText === "\u4e0b") return "j3-down";
    if (stageText === "\u9ad8\u4e2d" && gradeText === "\u9ad8\u4e00" && termText === "\u4e0a") return "s1-up";
    if (stageText === "\u9ad8\u4e2d" && gradeText === "\u9ad8\u4e00" && termText === "\u4e0b") return "s1-down";
    if (stageText === "\u9ad8\u4e2d" && gradeText === "\u9ad8\u4e8c" && termText === "\u4e0a") return "s2-up";
    if (stageText === "\u9ad8\u4e2d" && gradeText === "\u9ad8\u4e8c" && termText === "\u4e0b") return "s2-down";
    if (stageText === "\u9ad8\u4e2d" && gradeText === "\u9ad8\u4e09") return "s3";
    return "other";
  }

  function getGradeLabel(stage, grade, term) {
    return gradeLabelMap[getGradeKey(stage, grade, term)] || TEXT.other;
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
    return `${TEXT.difficultyPrefix}${text}`;
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

  function inferPracticeBundleKey(record, chapterCode = "") {
    const explicit = String(record?.generatorBundle || record?.bundleKey || "").trim();
    if (explicit) return explicit;

    const code = String(chapterCode || record?.chapterCode || "").trim();
    if (!code) return "";

    const bundles = window.practiceGeneratorBundles || {};
    return Object.entries(bundles).find(([, bundle]) => {
      const prefixes = Array.isArray(bundle?.chapterPrefixes) ? bundle.chapterPrefixes : [];
      return prefixes.some((prefix) => code.startsWith(String(prefix || "")));
    })?.[0] || "";
  }

  function buildPracticeItems() {
    const records = Object.values(practiceLibrary?.byId || {}).filter((record) => {
      const id = String(record?.id || "").trim();
      if (!id || record?.enabled === false) return false;
      return Boolean(practiceStore.getConfig?.(id) || inferPracticeBundleKey(record));
    });

    return records
      .map((record) => {
        const id = String(record?.id || "").trim();
        const topic = topicById.get(id) || null;
        const chapterCode = String(record?.chapterCode || topic?.chapterCode || "").trim();
        const generatorBundle = inferPracticeBundleKey(record, chapterCode);
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
          generatorBundle,
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
      rows.push({ key, label: getGradeLabel(item.stage, item.grade, item.term) });
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
    if (item.generatorBundle && !window.practiceGeneratorLoader?.isBundleLoaded?.(item.generatorBundle)) {
      return toolkit.readStoredPracticeSession?.(item.id) || null;
    }
    toolkit.ensureStoredPracticeSession?.(item);
    return toolkit.readStoredPracticeSession?.(item.id) || null;
  }

  async function ensurePracticeGenerator(item) {
    if (!item) return false;
    if (!item.generatorBundle && practiceStore.getConfig?.(item.id)) return true;
    if (!generatorLoader?.ensureForPractice) return false;
    try {
      return await generatorLoader.ensureForPractice(item);
    } catch (error) {
      console.warn("Unable to load practice generator", error);
      return false;
    }
  }

  function getIsFocusMode() {
    return state.layoutMode === "focus";
  }

  function applyLayoutMode() {
    const focus = getIsFocusMode();
    elements.layoutModeSelect.value = focus ? "focus" : "default";
    elements.player?.classList.toggle("practice-mobile-player--focus", focus);
    elements.practiceListPanel?.classList.toggle("practice-mobile-list-panel--focus", focus);
    document.querySelectorAll(".practice-mobile-mode-default-only").forEach((node) => {
      node.classList.toggle("is-hidden", focus);
    });
    document.querySelectorAll(".practice-mobile-mode-focus-only").forEach((node) => {
      node.classList.toggle("is-hidden", !focus);
    });
    elements.defaultTopActions?.classList.add("is-hidden");
    elements.defaultBottomActions?.classList.toggle("is-hidden", focus);
    elements.focusBottomActions?.classList.toggle("is-hidden", !focus);
    elements.compactActions?.classList.add("is-hidden");
  }

  function buildHtmlList(items, emptyText) {
    const rows = Array.isArray(items) ? items.filter((item) => String(item || "").trim()) : [];
    if (!rows.length) return `<div class="practice-mobile-answer-block">${escapeHtml(emptyText)}</div>`;
    return `<div class="practice-mobile-answer-block"><ol>${rows.map((item) => `<li>${toolkit.renderRichTextLine(item)}</li>`).join("")}</ol></div>`;
  }

  function renderQuestionSession(session) {
    const questions = Array.isArray(session?.questions) ? session.questions : [];
    const summaries = Array.isArray(session?.summaryAnswers) ? session.summaryAnswers : [];
    const details = Array.isArray(session?.answers) ? session.answers : [];
    const total = questions.length;
    const index = Math.min(Math.max(Number(session?.currentIndex) || 0, 0), Math.max(total - 1, 0));

    if (!total) {
      renderQuestionOutputs(TEXT.noQuestionToShow, "", "");
      return { total: 0, index: 0 };
    }

    const progressText = `${TEXT.currentQuestionPrefix}${index + 1} / ${total} ${TEXT.currentQuestionSuffix}`;
    const summaryAnswer = summaries[index] || "";
    const detailAnswer = details[index] || "";
    const questionClass = getIsFocusMode()
      ? "practice-mobile-question practice-mobile-question--focus"
      : "practice-mobile-question";

    renderQuestionOutputs(
      `<div class="${questionClass}"><div class="practice-mobile-question__index">${escapeHtml(progressText)}</div>${session.intro ? `<p class="practice-intro">${toolkit.renderRichTextLine(session.intro)}</p>` : ""}<div>${toolkit.renderRichTextLine(questions[index] || "")}</div></div>`,
      toolkit.renderRichTextLine(summaryAnswer || TEXT.noSummary),
      toolkit.renderRichTextLine(detailAnswer || TEXT.noDetail),
    );

    return { total, index };
  }

  async function prepareSelectedPracticeSession() {
    const item = getSelectedPractice();
    if (!item) return null;
    const existing = toolkit.readStoredPracticeSession?.(item.id);
    if (existing?.questions?.length) {
      return existing;
    }
    if (state.loadingPracticeId === item.id) {
      return null;
    }
    state.loadingPracticeId = item.id;
    renderPlayer();
    await ensurePracticeGenerator(item);
    const session = toolkit.ensureStoredPracticeSession?.(item) || toolkit.readStoredPracticeSession?.(item.id) || null;
    if (state.loadingPracticeId === item.id) {
      state.loadingPracticeId = "";
    }
    renderAll();
    return session;
  }

  function populateGradeFilter() {
    const rows = buildGradeOptions();
    const options = [{ key: "all", label: TEXT.all }].concat(rows);
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
    elements.chapterCount.textContent = "";

    if (!chapters.length) {
      elements.chapterList.innerHTML = `<p class="empty-state">${TEXT.noMatchingChapter}</p>`;
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
          <span class="practice-mobile-list__chapter-count"></span>
        </div>
      </button>
    `,
      )
      .join("");
  }

  function renderPracticeList() {
    const chapterItems = getChapterItems();
    const chapterLabel = chapterOptionByCode.get(state.chapterCode)?.label || state.chapterCode || TEXT.chapterFallback;
    elements.listTitle.textContent = chapterLabel;
    elements.listCount.textContent = "";

    if (!chapterItems.length) {
      elements.practiceList.innerHTML = `<p class="empty-state">${TEXT.noPracticeInChapter}</p>`;
      return;
    }

    elements.practiceList.innerHTML = chapterItems
      .map((item, index) => {
        const session = toolkit.readStoredPracticeSession?.(item.id);
        const total = Array.isArray(session?.questions) ? session.questions.length : 0;
        const progressText = total
          ? `${TEXT.solvedProgressPrefix}${Number(session.currentIndex || 0) + 1} / ${total} ${TEXT.currentQuestionSuffix}`
          : "";
        return `
        <button
          type="button"
          class="practice-mobile-list__item ${item.id === state.selectedPracticeId ? "is-active" : ""}"
          data-mobile-practice-id="${escapeHtml(item.id)}"
        >
          <div class="practice-mobile-list__main">
            <strong>${index + 1}. ${escapeHtml(item.title)}</strong>
            ${progressText ? `<span>${escapeHtml(progressText)}</span>` : ""}
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
      elements.mode2PrevPracticeButton.disabled = true;
      elements.mode2NextPracticeButton.disabled = true;
      return;
    }
    const index = chapterItems.findIndex((item) => item.id === selected.id);
    elements.prevPracticeButton.disabled = index <= 0;
    elements.nextPracticeButton.disabled = index < 0 || index >= chapterItems.length - 1;
    elements.mode2PrevPracticeButton.disabled = elements.prevPracticeButton.disabled;
    elements.mode2NextPracticeButton.disabled = elements.nextPracticeButton.disabled;
  }

  function renderChapterNavigator() {
    const visibleCodes = getVisibleChapterCodes();
    const index = visibleCodes.indexOf(state.chapterCode);
    elements.prevChapterButton.disabled = index <= 0;
    elements.nextChapterButton.disabled = index < 0 || index >= visibleCodes.length - 1;
    elements.mode2PrevChapterButton.disabled = elements.prevChapterButton.disabled;
    elements.mode2NextChapterButton.disabled = elements.nextChapterButton.disabled;
  }

  function renderPlayer() {
    const selected = ensureSelectedPractice();
    const chapterLabel = chapterOptionByCode.get(state.chapterCode)?.label || state.chapterCode || TEXT.chapterFallback;
    elements.chapterTitle.textContent = chapterLabel;
    applyLayoutMode();
    renderChapterNavigator();
    renderPracticeNavigator();

    if (!selected) {
      elements.practiceTitle.textContent = TEXT.noPractice;
      elements.practiceProgress.textContent = "";
      elements.practiceMeta.innerHTML = "";
      elements.practiceHint.textContent = "";
      renderQuestionOutputs(TEXT.noQuestionToShow, "", "");
      [
        elements.regenerateButton,
        elements.prevQuestionButton,
        elements.nextQuestionButton,
        elements.mode2PrevQuestionButton,
        elements.mode2NextQuestionButton,
        elements.summaryButton,
        elements.detailButton,
        elements.mode2RegenerateButton,
        elements.mode2SummaryButton,
        elements.mode2DetailButton,
      ].forEach((button) => {
        button.disabled = true;
      });
      return;
    }

    const chapterItems = getChapterItems();
    const practiceIndex = chapterItems.findIndex((item) => item.id === selected.id);
    const session = ensureSelectedPracticeSession();

    elements.practiceTitle.textContent = selected.title;
    elements.practiceProgress.textContent = `${TEXT.topicIndexPrefix}${practiceIndex + 1} / ${chapterItems.length}`;
    elements.practiceMeta.innerHTML = "";
    elements.regenerateButton.disabled = false;
    elements.mode2RegenerateButton.disabled = false;

    if (!session || state.loadingPracticeId === selected.id) {
      elements.practiceHint.textContent = TEXT.loadingPracticeHint;
      renderQuestionOutputs(TEXT.loadingPractice, "", "");
      [
        elements.prevQuestionButton,
        elements.nextQuestionButton,
        elements.mode2PrevQuestionButton,
        elements.mode2NextQuestionButton,
        elements.summaryButton,
        elements.detailButton,
        elements.mode2SummaryButton,
        elements.mode2DetailButton,
      ].forEach((button) => {
        button.disabled = true;
      });
      return;
    }

    elements.practiceHint.textContent = "";

    const { total, index } = renderQuestionSession(session);

    elements.prevQuestionButton.disabled = getIsFocusMode() || index <= 0;
    elements.nextQuestionButton.disabled = getIsFocusMode() || index >= total - 1;
    elements.mode2PrevQuestionButton.disabled = index <= 0;
    elements.mode2NextQuestionButton.disabled = index >= total - 1;
    elements.summaryButton.disabled = false;
    elements.detailButton.disabled = false;
    elements.mode2SummaryButton.disabled = false;
    elements.mode2DetailButton.disabled = false;
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (state.chapterCode) params.set("chapter", state.chapterCode);
    if (state.selectedPracticeId) params.set("practice", state.selectedPracticeId);
    if (getIsFocusMode()) params.set("mode", "focus");
    const url = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", url);
  }

  function renderSelectView() {
    populateGradeFilter();
    elements.layoutModeSelect.value = state.layoutMode;
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
    setView("chapter-practice");
    renderAll();
    void prepareSelectedPracticeSession();
  }

  function moveChapter(step) {
    const codes = getVisibleChapterCodes();
    const index = codes.indexOf(state.chapterCode);
    const nextIndex = index + step;
    if (index < 0 || nextIndex < 0 || nextIndex >= codes.length) return;
    state.chapterCode = codes[nextIndex];
    state.selectedPracticeId = "";
    ensureSelectedPractice();
    renderAll();
    void prepareSelectedPracticeSession();
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
    void prepareSelectedPracticeSession();
  }

  function bindEvents() {
    elements.layoutModeSelect.addEventListener("change", () => {
      state.layoutMode = "focus";
      renderAll();
    });

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
    elements.mode2PrevChapterButton.addEventListener("click", () => moveChapter(-1));
    elements.mode2NextChapterButton.addEventListener("click", () => moveChapter(1));
    elements.mode2PrevPracticeButton.addEventListener("click", () => movePractice(-1));
    elements.mode2NextPracticeButton.addEventListener("click", () => movePractice(1));

    elements.practiceList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-mobile-practice-id]");
      if (!button) return;
      state.selectedPracticeId = String(button.getAttribute("data-mobile-practice-id") || "").trim();
      renderAll();
      void prepareSelectedPracticeSession();
    });

    elements.regenerateButton.addEventListener("click", async () => {
      const item = getSelectedPractice();
      if (!item) return;
      await ensurePracticeGenerator(item);
      toolkit.regenerateStoredPracticeSession?.(item);
      renderAll();
    });
    elements.mode2RegenerateButton.addEventListener("click", async () => {
      const item = getSelectedPractice();
      if (!item) return;
      await ensurePracticeGenerator(item);
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

    elements.mode2PrevQuestionButton.addEventListener("click", () => {
      const item = getSelectedPractice();
      const session = item ? toolkit.readStoredPracticeSession?.(item.id) : null;
      if (!item || !session) return;
      toolkit.updateStoredPracticeSessionIndex?.(
        item.id,
        Math.max((Number(session.currentIndex) || 0) - 1, 0),
      );
      renderAll();
    });

    elements.mode2NextQuestionButton.addEventListener("click", () => {
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

    function toggleSummary() {
      if (elements.summaryButton.disabled && elements.mode2SummaryButton.disabled) return;
      elements.summaryOutput.classList.toggle("is-hidden");
    }

    function toggleDetail() {
      if (elements.detailButton.disabled && elements.mode2DetailButton.disabled) return;
      elements.detailOutput.classList.toggle("is-hidden");
    }

    elements.summaryButton.addEventListener("click", toggleSummary);
    elements.mode2SummaryButton.addEventListener("click", toggleSummary);
    elements.detailButton.addEventListener("click", toggleDetail);
    elements.mode2DetailButton.addEventListener("click", toggleDetail);
  }

  bindEvents();
  renderAll();

  if (state.chapterCode && getVisibleChapterCodes().includes(state.chapterCode)) {
    setView("chapter-practice");
    renderAll();
    void prepareSelectedPracticeSession();
  } else {
    setView("chapter-select");
  }
})();
