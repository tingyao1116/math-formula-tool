(() => {
  const store = window.formulaDataStore || null;
  if (!store) {
    console.warn("formulaDataStore not loaded");
  }

  const elements = {
    chapterFilter: document.getElementById("chapterFilter"),
    topicFilter: document.getElementById("topicFilter"),
    categoryFilter: document.getElementById("categoryFilter"),
    keywordInput: document.getElementById("keywordInput"),
    showAllAnswersButton: document.getElementById("showAllAnswersButton"),
    hideAllAnswersButton: document.getElementById("hideAllAnswersButton"),
    toggleAnswerButtonsButton: document.getElementById("toggleAnswerButtonsButton"),
    toggleDetailsButton: document.getElementById("toggleDetailsButton"),
    printButton: document.getElementById("printButton"),
    resultTitle: document.getElementById("resultTitle"),
    resultCount: document.getElementById("resultCount"),
    questionList: document.getElementById("questionList"),
    dataNotice: document.getElementById("dataNotice"),
  };

  const i18n = {
    ui: {
      eyebrow: "Question Bank",
      title: "\u7ae0\u7bc0\u984c\u5eab\u7df4\u7fd2",
      lead: "\u53ef\u4f9d\u7ae0\u7bc0\u8207\u4e3b\u984c\u7be9\u9078\u984c\u76ee\uff0c\u4e26\u5c07\u76ee\u524d\u7d50\u679c\u5217\u5370\u6210 PDF\u3002",
      backHome: "\u56de\u4e3b\u9801",
      backManage: "\u56de\u7ba1\u7406\u9801",
      howTitle: "\u4f7f\u7528\u65b9\u5f0f",
      how1: "\u5148\u9078\u7ae0\u7bc0\uff0c\u518d\u9078\u4e3b\u984c\u3002",
      how2: "\u53ef\u7528\u95dc\u9375\u5b57\u7e2e\u5c0f\u7d50\u679c\u7bc4\u570d\u3002",
      how3: "\u6309\u5217\u5370\u53ef\u532f\u51fa\u76ee\u524d\u6e05\u55ae\u70ba PDF\u3002",
      filterTitle: "\u7be9\u9078\u689d\u4ef6",
      chapter: "\u7ae0\u7bc0",
      topic: "\u4e3b\u984c",
      category: "\u985e\u5225",
      keyword: "\u95dc\u9375\u5b57",
      keywordPlaceholder: "\u641c\u5c0b\u6a19\u984c\u3001\u984c\u76ee\u3001\u7b54\u6848\u3001\u6a19\u7c64",
      actions: "\u64cd\u4f5c",
      showAll: "\u986f\u793a\u5168\u90e8\u7b54\u6848",
      hideAll: "\u96b1\u85cf\u5168\u90e8\u7b54\u6848",
      showAnswerButtons: "\u986f\u793a\u7b54\u6848\u6309\u9215",
      hideAnswerButtons: "\u96b1\u85cf\u7b54\u6848\u6309\u9215",
      showDetails: "\u986f\u793a\u7d30\u7bc0",
      hideDetails: "\u96b1\u85cf\u7d30\u7bc0",
      print: "\u5217\u5370\u76ee\u524d\u7d50\u679c",
      resultLabel: "\u76ee\u524d\u7d50\u679c",
      questionList: "\u984c\u76ee\u6e05\u55ae",
      allTopics: "\u5168\u90e8\u4e3b\u984c",
      allCategories: "\u5168\u90e8\u985e\u5225",
      noMatch: "\u76ee\u524d\u6c92\u6709\u7b26\u5408\u689d\u4ef6\u7684\u984c\u76ee\u3002",
      totalPrefix: "\u5171 ",
      totalSuffix: " \u984c",
      qLabel: "\u984c\u76ee\uff1a",
      aLabel: "\u7b54\u6848\uff1a",
      eLabel: "\u8a73\u89e3\uff1a",
      notProvided: "\uff08\u5c1a\u672a\u63d0\u4f9b\uff09",
      difficulty: "\u96e3\u5ea6\uff1a",
      source: "\u4f86\u6e90\uff1a",
      toggleAnswer: "\u986f\u793a/\u96b1\u85cf\u7b54\u6848",
      toggleExplanation: "\u986f\u793a/\u96b1\u85cf\u8a73\u89e3",
      dataMissingFile: "\u76ee\u524d\u672a\u8f09\u5165\u984c\u5eab\u8cc7\u6599\u3002\u8acb\u6539\u7528\u672c\u6a5f\u4f3a\u670d\u5668\u958b\u555f\uff08\u4f8b\u5982 http://localhost:5500/question-bank.html\uff09\u3002",
      dataMissingHttp: "\u76ee\u524d\u672a\u8f09\u5165\u984c\u5eab\u8cc7\u6599\uff0c\u8acb\u78ba\u8a8d program-db/database/question-db.json \u53ef\u88ab\u5b58\u53d6\u3002",
    },
  };

  const allTopics = store?.getCurrentFormulas ? store.getCurrentFormulas() : [];
  const chapterOptions = (store?.getChapterOptions?.() || []).slice().sort(compareChapterCodes);

  const state = {
    chapterCode: chapterOptions[0]?.code || "",
    topicId: "all",
    questionCategory: "all",
    keyword: "",
    showAllAnswers: false,
    showAnswerButtons: false,
    showDetails: true,
  };

  function localizeStaticUi() {
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText("qbEyebrow", i18n.ui.eyebrow);
    setText("qbTitle", i18n.ui.title);
    setText("qbLead", i18n.ui.lead);
    setText("qbBackHome", i18n.ui.backHome);
    setText("qbBackManage", i18n.ui.backManage);
    setText("qbHowTitle", i18n.ui.howTitle);
    setText("qbHow1", i18n.ui.how1);
    setText("qbHow2", i18n.ui.how2);
    setText("qbHow3", i18n.ui.how3);
    setText("qbFilterTitle", i18n.ui.filterTitle);
    setText("qbLabelChapter", i18n.ui.chapter);
    setText("qbLabelTopic", i18n.ui.topic);
    setText("qbLabelCategory", i18n.ui.category);
    setText("qbLabelKeyword", i18n.ui.keyword);
    setText("qbLabelActions", i18n.ui.actions);
    setText("qbResultLabel", i18n.ui.resultLabel);

    if (elements.keywordInput) elements.keywordInput.placeholder = i18n.ui.keywordPlaceholder;
    if (elements.showAllAnswersButton) elements.showAllAnswersButton.textContent = i18n.ui.showAll;
    if (elements.hideAllAnswersButton) elements.hideAllAnswersButton.textContent = i18n.ui.hideAll;
    if (elements.printButton) elements.printButton.textContent = i18n.ui.print;
    updateControlLabels();
  }

  function updateControlLabels() {
    if (elements.toggleAnswerButtonsButton) {
      elements.toggleAnswerButtonsButton.textContent = state.showAnswerButtons
        ? i18n.ui.hideAnswerButtons
        : i18n.ui.showAnswerButtons;
    }
    if (elements.toggleDetailsButton) {
      elements.toggleDetailsButton.textContent = state.showDetails
        ? i18n.ui.hideDetails
        : i18n.ui.showDetails;
    }
  }

  function setNotice(message) {
    if (!elements.dataNotice) return;
    if (!message) {
      elements.dataNotice.hidden = true;
      elements.dataNotice.textContent = "";
      return;
    }
    elements.dataNotice.hidden = false;
    elements.dataNotice.textContent = message;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderMath(latex, displayMode) {
    const source = normalizeMathTextForKatex(latex).trim();
    if (!source) return "";
    if (window.katex) {
      try {
        return window.katex.renderToString(source, {
          throwOnError: false,
          displayMode: Boolean(displayMode),
          output: "html",
        });
      } catch (_) {
        return escapeHtml(source);
      }
    }
    return escapeHtml(source);
  }

  function normalizeMathTextForKatex(text) {
    let normalized = String(text || "")
      .replace(/＋/g, "+")
      .replace(/−/g, "-")
      .replace(/－/g, "-")
      .replace(/＝/g, "=")
      .replace(/（/g, "(")
      .replace(/）/g, ")")
      .replace(/［/g, "[")
      .replace(/］/g, "]")
      .replace(/｛/g, "{")
      .replace(/｝/g, "}")
      .replace(/≤/g, "\\le ")
      .replace(/≥/g, "\\ge ")
      .replace(/≠/g, "\\ne ")
      .replace(/×/g, "\\times ")
      .replace(/÷/g, "\\div ");

    let previous = "";
    while (normalized !== previous) {
      previous = normalized;
      normalized = normalized.replace(/\^\(([^()]+)\)/g, "^{$1}");
    }

    normalized = normalized
      .replace(/\bpi\b/gi, "\\pi")
      .replace(/\btheta\b/gi, "\\theta");

    normalized = normalized
      .replace(/\b(sin|cos|tan|cot|sec|csc)\s*\\theta\b/gi, "\\$1 \\theta")
      .replace(/\b(sin|cos|tan|cot|sec|csc)\s*theta\b/gi, "\\$1 \\theta")
      .replace(/\b(sin|cos|tan|cot|sec|csc)theta\b/gi, "\\$1 \\theta");

    normalized = normalized
      .replace(/\blog\s*([0-9]+)\s*(\()/gi, "\\log_{$1}$2")
      .replace(/\blog\s*([0-9]+)\s+([A-Za-z\\(])/gi, "\\log_{$1} $2");

    return normalized;
  }

  function renderQuestionBlankMarker(token) {
    const underscoreCount = String(token || "").replace(/\\/g, "").length;
    const length = Math.max(4, Math.min(24, underscoreCount || 8));
    return `<span class="question-blank" aria-label="填空欄位">${"＿".repeat(length)}</span>`;
  }

  function renderBlankAwareText(text) {
    const source = String(text || "");
    const pattern = /(\\_){3,}|_{3,}/g;
    let lastIndex = 0;
    let html = "";
    let matched = false;
    let match;

    while ((match = pattern.exec(source)) !== null) {
      matched = true;
      const plainText = source.slice(lastIndex, match.index);
      if (plainText) html += renderPlainMathAwareTextCore(plainText);
      html += renderQuestionBlankMarker(match[0]);
      lastIndex = pattern.lastIndex;
    }

    if (!matched) return null;
    const tail = source.slice(lastIndex);
    if (tail) html += renderPlainMathAwareTextCore(tail);
    return html;
  }

  function renderPlainMathAwareTextCore(text) {
    return escapeHtml(String(text || ""));
  }

  function renderPlainMathAwareText(text) {
    const source = String(text || "");
    const blankAware = renderBlankAwareText(source);
    if (blankAware !== null) return blankAware;
    return renderPlainMathAwareTextCore(source);
  }

  function renderTextFragment(text) {
    const source = String(text || "").trim();
    if (!source) return "";
    const mixed = renderInlineMixedContent(source);
    if (mixed !== null) return mixed;
    const dollarMath = renderInlineDollarMath(source);
    if (dollarMath !== null) return dollarMath;
    return renderPlainMathAwareText(source);
  }

  function normalizeImagePath(path) {
    const raw = String(path || "").trim();
    if (!raw) return "";
    let normalized = raw
      .replace(/\u2212/g, "-")
      .replace(/\\/g, "/");
    const exportsIndex = normalized.lastIndexOf("/exports/");
    if (exportsIndex >= 0) {
      normalized = normalized.slice(exportsIndex + 1);
    }
    if (/\.(wmf|emf)$/i.test(normalized)) {
      normalized = `${normalized}.png`;
    }
    return normalized;
  }

  function cleanQuestionTitleText(value) {
    const source = String(value || "").trim();
    if (!source) return "";
    const cleaned = source.replace(
      /^\s*(?:【(?:主題|分支)範例】\s*|(?:範例|隨堂練習)\s*[0-9０-９]+(?:\s*[-－–—]\s*[0-9０-９]+)?\s*[：:、.．]?\s*)+/u,
      ""
    ).trim();
    return cleaned || source;
  }

  function stripKnownSourceBlocks(value) {
    return String(value || "").replace(/【([^】]+)】/gu, (full, inner) => {
      return /出處|學測|會考|基測|統測|指考|模擬|北北基|教育會考/u.test(inner) ? "" : full;
    });
  }

  function cleanQuestionBodyText(value) {
    let source = String(value || "").replace(/\r\n?/g, "\n");
    source = stripKnownSourceBlocks(source);
    source = source.replace(/(^|\n)\s*[（(]\s*(?:\n\s*)*[）)]\s*/gu, (full, prefix) => (prefix === "\n" ? "\n" : ""));
    source = source.replace(/\n[ \t]+/g, "\n");
    source = source.replace(/\n{3,}/g, "\n\n");
    return source.trim();
  }

  function renderImageMarker(path) {
    const src = normalizeImagePath(path);
    if (!src) return "";
    const filename = src.split("/").pop() || "題目圖片";
    return `<img class="inline-question-image" src="${escapeHtml(encodeURI(src))}" alt="${escapeHtml(filename)}" loading="lazy">`;
  }

  function renderInlineMixedContent(text) {
    const source = String(text || "");
    const pattern = /\[圖\s*[：:]\s*([^\]]+)\]|\\\(([^]+?)\\\)|\\\[([^]+?)\\\]/g;
    let last = 0;
    let matched = false;
    let html = "";
    let m;

    function renderInlineTextSegment(segment) {
      const dollarMath = renderInlineDollarMath(segment);
      if (dollarMath !== null) return dollarMath;
      return renderPlainMathAwareText(segment);
    }

    while ((m = pattern.exec(source)) !== null) {
      matched = true;
      const plain = source.slice(last, m.index);
      if (plain) html += renderInlineTextSegment(plain);
      if (m[1] !== undefined) {
        html += renderImageMarker(m[1]);
      } else {
        const latex = m[2] ?? m[3] ?? "";
        const display = m[3] !== undefined;
        html += renderMath(latex, display);
      }
      last = pattern.lastIndex;
    }

    if (!matched) return null;

    const tail = source.slice(last);
    if (tail) html += renderInlineTextSegment(tail);
    return html;
  }

  function renderInlineDollarMath(text) {
    const source = String(text || "");
    let i = 0;
    let last = 0;
    let html = "";
    let matched = false;

    function isEscaped(pos) {
      let backslashes = 0;
      let p = pos - 1;
      while (p >= 0 && source[p] === "\\") {
        backslashes += 1;
        p -= 1;
      }
      return backslashes % 2 === 1;
    }

    while (i < source.length) {
      if (source[i] !== "$" || isEscaped(i)) {
        i += 1;
        continue;
      }

      const isDouble = source[i + 1] === "$" && !isEscaped(i + 1);
      const openLen = isDouble ? 2 : 1;
      let j = i + openLen;
      let closeAt = -1;

      while (j < source.length) {
        if (isDouble) {
          if (source[j] === "$" && source[j + 1] === "$" && !isEscaped(j)) {
            closeAt = j;
            break;
          }
          j += 1;
        } else {
          if (source[j] === "$" && !isEscaped(j)) {
            closeAt = j;
            break;
          }
          j += 1;
        }
      }

      if (closeAt < 0) {
        i += openLen;
        continue;
      }

      matched = true;
      const plainText = source.slice(last, i);
      if (plainText) html += renderPlainMathAwareText(plainText);

      const latex = source.slice(i + openLen, closeAt).trim();
      html += renderMath(latex, isDouble);

      last = closeAt + openLen;
      i = last;
    }

    if (!matched) return null;
    const tail = source.slice(last);
    if (tail) html += renderPlainMathAwareText(tail);
    return html;
  }

  function renderText(value) {
    const source = cleanQuestionBodyText(value);
    const lines = source.split(/\r?\n/);
    return lines
      .map((line) => {
        const trimmed = String(line || "").trim();
        if (!trimmed) return "";
        if (/^\[圖\s*[：:]/.test(trimmed)) {
          return renderTextFragment(trimmed);
        }
        function isChineseLabelPrefix(label) {
          const body = String(label || "").replace(/[：:]$/, "").trim();
          return /[\u4e00-\u9fff]/u.test(body)
            && !/[A-Za-z0-9$\\^_{}()[\]|=<>+\-*/]/.test(body);
        }
        const labelMatch = trimmed.match(/^([^：:\n]{2,30}[：:])\s*(.+)$/);
        if (labelMatch && isChineseLabelPrefix(labelMatch[1])) {
          const [, label, rest] = labelMatch;
          return `<strong>${renderPlainMathAwareText(label)}</strong>${rest ? ` ${renderTextFragment(rest)}` : ""}`;
        }
        return renderTextFragment(trimmed);
      })
      .join("<br>");
  }

  function populateChapters() {
    if (!elements.chapterFilter) return;
    elements.chapterFilter.innerHTML = chapterOptions
      .map((entry) => `<option value="${escapeHtml(entry.code)}">${escapeHtml(entry.label || entry.code)}</option>`)
      .join("");

    if (chapterOptions.some((entry) => entry.code === state.chapterCode)) {
      elements.chapterFilter.value = state.chapterCode;
    } else if (chapterOptions[0]) {
      state.chapterCode = chapterOptions[0].code;
      elements.chapterFilter.value = state.chapterCode;
    }
  }

  function chapterCodeSortKey(code) {
    const raw = String(code || "").trim();
    const lower = raw.toLowerCase();
    const match = lower.match(/^([js])(\d+)(?:-(\d+|x))?(?:-(\d+|x))?(?:-(\d+|x))?$/);
    if (match) {
      const seriesOrder = match[1] === "j" ? 0 : 1;
      const parts = match.slice(2).map((part) => {
        if (part === undefined) return -1;
        if (part === "x") return 999;
        return Number(part);
      });
      return [seriesOrder, ...parts, raw];
    }
    const bMatch = lower.match(/^b-(\d+)$/);
    if (bMatch) return [2, Number(bMatch[1]), -1, -1, -1, raw];
    return [9, 999, 999, 999, 999, raw];
  }

  function compareChapterCodes(a, b) {
    const left = chapterCodeSortKey(a?.code);
    const right = chapterCodeSortKey(b?.code);
    const length = Math.max(left.length, right.length);
    for (let i = 0; i < length; i += 1) {
      if (left[i] < right[i]) return -1;
      if (left[i] > right[i]) return 1;
    }
    return 0;
  }

  function isFormalQuestionBankTopic(item) {
    const id = String(item?.id || "").trim();
    const title = String(item?.title || "").trim();
    const chapterRole = String(item?.chapterRole || "").trim();
    if (!id) return false;
    if (item?.isBranch === true) return false;
    if (/(^|-)drill($|-)/i.test(id)) return false;
    if (title.includes("分支") || title.includes("練習")) return false;
    if (chapterRole.includes("分支") || chapterRole.includes("練習")) return false;
    return true;
  }

  function isFormalQuestionRecord(record) {
    const id = String(record?.id || "").trim();
    const title = String(record?.title || "").trim();
    const body = String(record?.question_text || "").trim();
    const sourceType = String(record?.source_type || "").trim();
    if (!id) return false;
    if (sourceType === "word_structured_generated") return false;
    if (title.startsWith("分支 [") || body.startsWith("分支 [")) return false;
    return true;
  }

  function getTopicsByChapter(chapterCode) {
    const selectedCode = String(chapterCode || "").trim();
    return allTopics
      .filter((item) => {
        const itemCode = String(item.chapterCode || "").trim();
        return chapterCodeMatchesSelection(itemCode, selectedCode) && isFormalQuestionBankTopic(item);
      })
      .sort(compareStructureOrder);
  }

  function compareStructureOrder(a, b) {
    const aIndex = Number.isFinite(Number(a?.originalIndex)) ? Number(a.originalIndex) : Number.MAX_SAFE_INTEGER;
    const bIndex = Number.isFinite(Number(b?.originalIndex)) ? Number(b.originalIndex) : Number.MAX_SAFE_INTEGER;
    return (
      (aIndex - bIndex) ||
      String(a?.id || "").localeCompare(String(b?.id || ""), "zh-Hant") ||
      String(a?.title || "").localeCompare(String(b?.title || ""), "zh-Hant")
    );
  }

  function getCodeFamily(code) {
    const raw = String(code || "").trim();
    if (!raw) return "";
    const lower = raw.toLowerCase();
    if (/^b-\d+$/i.test(raw)) return lower;
    const parts = lower.split("-");
    if (parts.length < 2) return lower;
    return `${parts[0]}-${parts[1]}`;
  }

  function isParentChapterCode(code) {
    const lower = String(code || "").trim().toLowerCase();
    if (!lower || /^b-\d+$/.test(lower)) return false;
    const parts = lower.split("-");
    return /^[js]\d$/.test(parts[0] || "") && parts.length <= 2;
  }

  function chapterCodeMatchesSelection(code, selectedCode) {
    const itemCode = String(code || "").trim();
    const targetCode = String(selectedCode || "").trim();
    if (!itemCode || !targetCode) return false;
    if (itemCode === targetCode) return true;
    return isParentChapterCode(targetCode) && getCodeFamily(itemCode) === getCodeFamily(targetCode);
  }

  function populateTopics() {
    if (!elements.topicFilter) return;
    const topics = getTopicsByChapter(state.chapterCode);
    const options = [`<option value="all">${i18n.ui.allTopics}</option>`].concat(
      topics.map((topic) => `<option value="${escapeHtml(topic.id)}">${escapeHtml(topic.title)}</option>`)
    );
    elements.topicFilter.innerHTML = options.join("");
    const validTopic = state.topicId === "all" || topics.some((topic) => topic.id === state.topicId);
    elements.topicFilter.value = validTopic ? state.topicId : "all";
    if (!validTopic) state.topicId = "all";
  }

  const QUESTION_CATEGORY_ORDER = ["基本", "重要", "綜合", "段考", "歷屆", "模考", "備用"];

  function compareQuestionCategories(a, b) {
    const left = QUESTION_CATEGORY_ORDER.indexOf(String(a || "").trim());
    const right = QUESTION_CATEGORY_ORDER.indexOf(String(b || "").trim());
    const leftRank = left >= 0 ? left : QUESTION_CATEGORY_ORDER.length;
    const rightRank = right >= 0 ? right : QUESTION_CATEGORY_ORDER.length;
    return leftRank - rightRank || String(a || "").localeCompare(String(b || ""), "zh-Hant");
  }

  function getQuestionCategoryPool() {
    if (state.topicId && state.topicId !== "all") {
      const linked = store.getLinkedQuestionsForTopic(state.topicId, state.chapterCode, {
        limit: 5000,
        includeDescendants: true,
        includeBackup: true,
      });
      return (linked.questions || []).filter((row) => isFormalQuestionRecord(row));
    }

    const selectedCode = String(state.chapterCode || "").trim();
    return store
      .getQuestionRecords()
      .filter((row) => {
        const rowCode = String(row.chapter_code || "").trim();
        return chapterCodeMatchesSelection(rowCode, selectedCode);
      })
      .filter((row) => isFormalQuestionRecord(row));
  }

  function populateCategories() {
    if (!elements.categoryFilter) return;
    const categories = [...new Set(
      getQuestionCategoryPool()
        .map((row) => String(row.question_category || "").trim())
        .filter(Boolean)
    )].sort(compareQuestionCategories);

    const options = [`<option value="all">${i18n.ui.allCategories}</option>`].concat(
      categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    );
    elements.categoryFilter.innerHTML = options.join("");
    const validCategory =
      state.questionCategory === "all" || categories.includes(state.questionCategory);
    elements.categoryFilter.value = validCategory ? state.questionCategory : "all";
    if (!validCategory) state.questionCategory = "all";
  }

  function includesKeyword(record, keyword) {
    if (!keyword) return true;
    const fields = [
      record.id,
      record.title,
      record.question_text,
      record.answer_text,
      record.explanation_text,
      record.chapter,
      record.chapter_code,
      ...(Array.isArray(record.tags) ? record.tags : []),
    ];
    const blob = fields.map((item) => String(item || "")).join("\n").toLowerCase();
    return blob.includes(keyword);
  }

  function getFilteredQuestions() {
    const keyword = state.keyword.trim().toLowerCase();
    const selectedCategory = String(state.questionCategory || "").trim();
    if (state.topicId && state.topicId !== "all") {
      const linked = store.getLinkedQuestionsForTopic(state.topicId, state.chapterCode, {
        limit: 5000,
        includeDescendants: true,
        includeBackup: true,
        ...(selectedCategory !== "all" ? { questionCategory: selectedCategory } : {}),
      });
      return (linked.questions || [])
        .filter((row) => isFormalQuestionRecord(row))
        .filter((row) => includesKeyword(row, keyword));
    }

    const selectedCode = String(state.chapterCode || "").trim();

    return store
      .getQuestionRecords()
      .filter((row) => {
        const rowCode = String(row.chapter_code || "").trim();
        return chapterCodeMatchesSelection(rowCode, selectedCode);
      })
      .filter((row) => isFormalQuestionRecord(row))
      .filter((row) => selectedCategory === "all" || String(row.question_category || "").trim() === selectedCategory)
      .filter((row) => includesKeyword(row, keyword))
      .sort((a, b) => String(a.id || "").localeCompare(String(b.id || ""), "zh-Hant"));
  }

  function getChapterWithQuestions(defaultCode) {
    const questions = store.getQuestionRecords();
    if (!questions.length) return defaultCode;
    const chapterSet = new Set(questions.map((row) => String(row.chapter_code || "")).filter(Boolean));
    if (chapterSet.has(defaultCode)) return defaultCode;
    for (const option of chapterOptions) {
      if (chapterSet.has(option.code)) return option.code;
    }
    return defaultCode;
  }

  function buildQuestionCardHtml(question, index = 0, options = {}) {
    const settings = {
      showAllAnswers: true,
      showAnswerButtons: false,
      showDetails: true,
      showIndex: true,
      ...options,
    };
    const answerHidden = settings.showAllAnswers ? "" : "is-hidden";
    const explanationHidden = settings.showAllAnswers ? "" : "is-hidden";
    const tags = Array.isArray(question.tags) ? question.tags : [];
    const displayNumber = settings.showIndex ? `${index + 1}、` : "";
    const cleanTitle = cleanQuestionTitleText(question.title || "");
    const cardTitleHtml = settings.showDetails && cleanTitle
      ? `${escapeHtml(displayNumber)}${renderTextFragment(cleanTitle)}`
      : escapeHtml(displayNumber);
    const detailsHtml = `
            <span class="meta-chip">${escapeHtml(question.id)}</span>
            <span class="meta-chip">${i18n.ui.difficulty}${escapeHtml(question.difficulty || "\u57fa\u790e")}</span>
            ${question.question_category ? `<span class="meta-chip">類別：${escapeHtml(question.question_category)}</span>` : ""}
            <span class="meta-chip">${i18n.ui.source}${escapeHtml(question.source_type || "manual")}</span>
    `;
    const metaRowHtml = settings.showDetails ? `
          <div class="meta-row">
            ${detailsHtml}
          </div>
    ` : "";
    const actionButtonsHtml = settings.showDetails && settings.showAnswerButtons ? `
          <div class="question-card__actions no-print">
            <button type="button" class="ghost-button" data-action="toggle-answer" data-id="${escapeHtml(question.id)}">${i18n.ui.toggleAnswer}</button>
            <button type="button" class="ghost-button" data-action="toggle-explanation" data-id="${escapeHtml(question.id)}">${i18n.ui.toggleExplanation}</button>
          </div>
    ` : "";
    const answerDetailsHtml = settings.showDetails ? `
          ${actionButtonsHtml}
          <div class="question-answer ${answerHidden}" data-answer-id="${escapeHtml(question.id)}">
            <p><strong>${i18n.ui.aLabel}</strong><br>${renderText(question.answer_text || i18n.ui.notProvided)}</p>
          </div>
          <div class="question-explanation ${explanationHidden}" data-explanation-id="${escapeHtml(question.id)}">
            <p><strong>${i18n.ui.eLabel}</strong><br>${renderText(question.explanation_text || i18n.ui.notProvided)}</p>
          </div>
          <div class="question-tags">
            ${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
    ` : "";
    return `
      <article class="panel question-card" data-question-id="${escapeHtml(question.id)}">
        <div class="question-card__header">
          <h3>${cardTitleHtml}</h3>
          ${metaRowHtml}
        </div>
        <div class="question-card__body">
          <p>${renderText(question.question_text || "")}</p>
          ${answerDetailsHtml}
        </div>
      </article>
    `;
  }

  function renderQuestions() {
    const questions = getFilteredQuestions();
    const chapterMeta = chapterOptions.find((entry) => entry.code === state.chapterCode);
    const topicLabel = state.topicId === "all"
      ? i18n.ui.allTopics
      : (allTopics.find((item) => item.id === state.topicId)?.title || state.topicId);

    elements.resultTitle.textContent = `${chapterMeta?.label || state.chapterCode} | ${topicLabel}`;
    elements.resultCount.textContent = `${i18n.ui.totalPrefix}${questions.length}${i18n.ui.totalSuffix}`;

    if (!questions.length) {
      elements.questionList.innerHTML = `<section class="panel"><p>${i18n.ui.noMatch}</p></section>`;
      return;
    }

    elements.questionList.innerHTML = questions.map((question, index) =>
      buildQuestionCardHtml(question, index, {
        showAllAnswers: state.showAllAnswers,
        showAnswerButtons: state.showAnswerButtons,
        showDetails: state.showDetails,
        showIndex: true,
      })
    ).join("");
  }

  function setAllAnswers(visible) {
    state.showAllAnswers = Boolean(visible);
    elements.questionList
      .querySelectorAll(".question-answer, .question-explanation")
      .forEach((element) => element.classList.toggle("is-hidden", !state.showAllAnswers));
  }

  function bindEvents() {
    elements.chapterFilter?.addEventListener("change", (event) => {
      state.chapterCode = event.target.value;
      state.topicId = "all";
      state.questionCategory = "all";
      state.keyword = "";
      if (elements.keywordInput) elements.keywordInput.value = "";
      populateTopics();
      populateCategories();
      renderQuestions();
    });

    elements.topicFilter?.addEventListener("change", (event) => {
      state.topicId = event.target.value;
      state.questionCategory = "all";
      populateCategories();
      renderQuestions();
    });

    elements.categoryFilter?.addEventListener("change", (event) => {
      state.questionCategory = event.target.value;
      renderQuestions();
    });

    elements.keywordInput?.addEventListener("input", (event) => {
      state.keyword = event.target.value || "";
      renderQuestions();
    });

    elements.showAllAnswersButton?.addEventListener("click", () => setAllAnswers(true));
    elements.hideAllAnswersButton?.addEventListener("click", () => setAllAnswers(false));
    elements.toggleAnswerButtonsButton?.addEventListener("click", () => {
      state.showAnswerButtons = !state.showAnswerButtons;
      updateControlLabels();
      renderQuestions();
    });
    elements.toggleDetailsButton?.addEventListener("click", () => {
      state.showDetails = !state.showDetails;
      updateControlLabels();
      renderQuestions();
    });
    elements.printButton?.addEventListener("click", () => window.print());

    elements.questionList?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action][data-id]");
      if (!button) return;
      const id = button.dataset.id;
      const action = button.dataset.action;
      if (action === "toggle-answer") {
        elements.questionList.querySelector(`[data-answer-id="${id}"]`)?.classList.toggle("is-hidden");
      }
      if (action === "toggle-explanation") {
        elements.questionList.querySelector(`[data-explanation-id="${id}"]`)?.classList.toggle("is-hidden");
      }
    });
  }

  window.questionBankPreview = {
    renderQuestionCardHtml(question, options = {}) {
      return buildQuestionCardHtml(question || {}, 0, {
        showAllAnswers: true,
        showAnswerButtons: false,
        showDetails: true,
        showIndex: false,
        ...options,
      });
    },
    renderText,
    cleanQuestionTitleText,
    cleanQuestionBodyText,
  };

  function hasQuestionBankUi() {
    return Boolean(
      elements.chapterFilter &&
      elements.topicFilter &&
      elements.categoryFilter &&
      elements.keywordInput &&
      elements.showAllAnswersButton &&
      elements.hideAllAnswersButton &&
      elements.toggleAnswerButtonsButton &&
      elements.toggleDetailsButton &&
      elements.printButton &&
      elements.resultTitle &&
      elements.resultCount &&
      elements.questionList
    );
  }

  function init() {
    localizeStaticUi();
    state.chapterCode = getChapterWithQuestions(state.chapterCode);
    populateChapters();
    populateTopics();
    populateCategories();
    bindEvents();

    const questionCount = store.getQuestionRecords().length;
    const isFileProtocol = window.location.protocol === "file:";
    if (!questionCount) {
      setNotice(isFileProtocol ? i18n.ui.dataMissingFile : i18n.ui.dataMissingHttp);
    } else {
      setNotice("");
    }

    renderQuestions();
  }

  if (!store || !hasQuestionBankUi()) {
    return;
  }

  init();
})();
