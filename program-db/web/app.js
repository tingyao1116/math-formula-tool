(() => {
  const TOPICS_URL = "../database/formula-db.json";
  const QUESTIONS_URL = "../database/question-db.json";
  const ALL = "全部";

  const el = {
    stats: document.getElementById("stats"),
    q: document.getElementById("q"),
    stage: document.getElementById("stage"),
    grade: document.getElementById("grade"),
    chapter: document.getElementById("chapter"),
    difficulty: document.getElementById("difficulty"),
    reset: document.getElementById("reset"),
    tabTopics: document.getElementById("tabTopics"),
    tabQuestions: document.getElementById("tabQuestions"),
    resultTitle: document.getElementById("resultTitle"),
    resultCount: document.getElementById("resultCount"),
    list: document.getElementById("list"),
    detailTitle: document.getElementById("detailTitle"),
    detailMeta: document.getElementById("detailMeta"),
    detailMain: document.getElementById("detailMain"),
    detailUsage: document.getElementById("detailUsage"),
    detailExamples: document.getElementById("detailExamples"),
    detailTips: document.getElementById("detailTips"),
    detailNotes: document.getElementById("detailNotes"),
    detailMistakes: document.getElementById("detailMistakes"),
  };

  const state = {
    tab: "topics",
    topics: [],
    questions: [],
    rows: [],
    selectedId: "",
    filters: { q: "", stage: ALL, grade: ALL, chapter: ALL, difficulty: ALL },
  };

  const escapeHtml = (v) => String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  const uniqSorted = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "zh-Hant"));
  const renderMathOnly = (input, displayMode = false) => {
    const text = String(input || "").trim();
    if (!text) return "";
    if (!window.katex) return escapeHtml(text);
    try {
      return window.katex.renderToString(text, { throwOnError: false, displayMode });
    } catch (_) {
      return escapeHtml(text);
    }
  };

  const renderInlineDelimitedMath = (input) => {
    const source = String(input || "");
    const pattern = /\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]|\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
    let html = "";
    let last = 0;
    let matched = false;
    let m;
    while ((m = pattern.exec(source)) !== null) {
      matched = true;
      if (m.index > last) html += escapeHtml(source.slice(last, m.index));
      if (m[1] !== undefined) html += renderMathOnly(m[1], false);
      else if (m[2] !== undefined) html += renderMathOnly(m[2], true);
      else if (m[3] !== undefined) html += renderMathOnly(m[3], true);
      else html += renderMathOnly(m[4], false);
      last = pattern.lastIndex;
    }
    if (!matched) return null;
    if (last < source.length) html += escapeHtml(source.slice(last));
    return html;
  };

  const renderTex = (input, displayMode = false) => {
    const text = String(input || "").trim();
    if (!text) return "";

    if (displayMode) {
      return `<div class="katex-inline">${renderMathOnly(text, true)}</div>`;
    }

    const mixed = renderInlineDelimitedMath(text);
    if (mixed !== null) return `<div class="katex-inline">${mixed}</div>`;

    if (/\\[A-Za-z]+|\^|_/.test(text)) {
      return `<div class="katex-inline">${renderMathOnly(text, false)}</div>`;
    }
    return `<div class="katex-inline">${escapeHtml(text)}</div>`;
  };

  function currentData() { return state.tab === "topics" ? state.topics : state.questions; }

  function optionize(select, values, current = ALL) {
    const list = [ALL, ...values];
    select.innerHTML = list.map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");
    select.value = list.includes(current) ? current : ALL;
  }

  function buildFilters() {
    const base = currentData();
    const stage = state.filters.stage === ALL ? "" : state.filters.stage;
    const grade = state.filters.grade === ALL ? "" : state.filters.grade;
    optionize(el.stage, uniqSorted(base.map((x) => x.stage)), state.filters.stage);
    optionize(el.grade, uniqSorted(base.filter((x) => !stage || x.stage === stage).map((x) => x.grade)), state.filters.grade);
    optionize(
      el.chapter,
      uniqSorted(base.filter((x) => (!stage || x.stage === stage) && (!grade || x.grade === grade)).map((x) => x.chapter)),
      state.filters.chapter
    );
    optionize(el.difficulty, uniqSorted(base.map((x) => x.difficulty)), state.filters.difficulty);
  }

  function matchKeyword(item, q) {
    if (!q) return true;
    const blob = [
      item.id, item.title, item.chapter, item.domain, item.question_text, item.answer_text, item.explanation_text,
      ...(item.tags || []), ...(item.usage || []), ...(item.examples || []), ...(item.tips || []), ...(item.notes || []), ...(item.mistakes || [])
    ].join(" ").toLowerCase();
    return blob.includes(q.toLowerCase());
  }

  function applyFilters() {
    const f = state.filters;
    state.rows = currentData()
      .filter((x) => (f.stage === ALL ? true : x.stage === f.stage))
      .filter((x) => (f.grade === ALL ? true : x.grade === f.grade))
      .filter((x) => (f.chapter === ALL ? true : x.chapter === f.chapter))
      .filter((x) => (f.difficulty === ALL ? true : x.difficulty === f.difficulty))
      .filter((x) => matchKeyword(x, f.q))
      .sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "zh-Hant"));
  }

  function renderStats() {
    el.stats.innerHTML = [
      `<span class="chip">主題 ${state.topics.length} 筆</span>`,
      `<span class="chip">題庫 ${state.questions.length} 題</span>`
    ].join("");
  }

  function previewText(x) {
    if (state.tab === "topics") {
      const formula = (((x.formula || {}).lines || [])[0] || {}).values || [];
      const usage = (x.usage || [])[0] || "";
      return [formula[0] || "", usage].filter(Boolean).join(" | ");
    }
    return [x.question_text || "", x.answer_text ? `答案：${x.answer_text}` : ""].filter(Boolean).join(" | ");
  }

  function renderList() {
    el.resultTitle.textContent = state.tab === "topics" ? "主題清單" : "題庫清單";
    el.resultCount.textContent = `共 ${state.rows.length} 筆`;
    if (!state.rows.length) {
      el.list.innerHTML = "<li class='item'>查無資料</li>";
      clearDetail();
      return;
    }
    el.list.innerHTML = state.rows.map((x) => {
      const active = x.id === state.selectedId ? "active" : "";
      return `<li class="item ${active}" data-id="${escapeHtml(x.id)}">
        <h4>${escapeHtml(x.title || x.id || "")}</h4>
        <div class="mini">
          <span class="tag">${escapeHtml(x.stage || "")}</span>
          <span class="tag">${escapeHtml(x.grade || "")}</span>
          <span class="tag">${escapeHtml(x.chapter || "")}</span>
          <span class="tag">${escapeHtml(x.difficulty || "")}</span>
        </div>
        <div class="preview">${renderTex(previewText(x) || "")}</div>
      </li>`;
    }).join("");

    el.list.querySelectorAll(".item[data-id]").forEach((node) => {
      node.addEventListener("click", () => {
        state.selectedId = node.getAttribute("data-id") || "";
        renderList();
        renderDetail();
      });
    });

    if (!state.selectedId || !state.rows.some((x) => x.id === state.selectedId)) {
      state.selectedId = state.rows[0].id;
      renderList();
      renderDetail();
    }
  }

  function clearDetail() {
    el.detailTitle.textContent = "請先選一筆資料";
    el.detailMeta.innerHTML = "";
    [el.detailMain, el.detailUsage, el.detailExamples, el.detailTips, el.detailNotes, el.detailMistakes].forEach((s) => s.innerHTML = "");
  }

  function renderListSection(container, title, list) {
    if (!list || !list.length) { container.innerHTML = ""; return; }
    container.innerHTML = `<h4>${escapeHtml(title)}</h4><ul>${list.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
  }

  function renderTopicDetail(row) {
    const lines = Array.isArray((row.formula || {}).lines) ? row.formula.lines : [];
    el.detailMain.innerHTML = lines.length
      ? `<h4>公式</h4><div class="formula-lines">${lines
          .map(
            (line) =>
              `<div class="formula-row"><div class="formula-label">${escapeHtml(line.label || "")}</div>${(line.values || [])
                .map((v) => renderTex(v))
                .join("")}</div>`
          )
          .join("")}</div>`
      : "";
    renderListSection(el.detailUsage, "何時使用", row.usage || []);
    renderListSection(el.detailExamples, "例子", row.examples || []);
    renderListSection(el.detailTips, "技巧", row.tips || []);
    renderListSection(el.detailNotes, "注意事項", row.notes || []);
    renderListSection(el.detailMistakes, "常見錯誤", row.mistakes || []);
  }

  function renderQuestionDetail(row) {
    el.detailMain.innerHTML = `<h4>題目</h4>${renderTex(row.question_text || "")}${
      row.answer_text ? `<h4 style="margin-top:8px">答案</h4>${renderTex(row.answer_text || "")}` : ""
    }${row.explanation_text ? `<h4 style="margin-top:8px">解析</h4>${renderTex(row.explanation_text || "")}` : ""}`;
    renderListSection(el.detailUsage, "標籤", row.tags || []);
    renderListSection(el.detailExamples, "來源", [row.source_type || "", row.source_ref || ""].filter(Boolean));
    el.detailTips.innerHTML = "";
    el.detailNotes.innerHTML = "";
    el.detailMistakes.innerHTML = "";
  }

  function renderDetail() {
    const row = state.rows.find((x) => x.id === state.selectedId);
    if (!row) return clearDetail();
    el.detailTitle.textContent = row.title || row.id || "";
    el.detailMeta.innerHTML = [row.id, row.stage, row.grade, row.term, row.chapter, row.domain, row.difficulty].filter(Boolean).map((x) => `<span class="tag">${escapeHtml(x)}</span>`).join("");
    if (state.tab === "topics") renderTopicDetail(row);
    else renderQuestionDetail(row);
  }

  function activateTab(tab) {
    state.tab = tab;
    state.selectedId = "";
    el.tabTopics.classList.toggle("is-active", tab === "topics");
    el.tabQuestions.classList.toggle("is-active", tab === "questions");
    buildFilters();
    applyFilters();
    renderList();
  }

  function bindEvents() {
    el.q.addEventListener("input", () => { state.filters.q = el.q.value.trim(); applyFilters(); renderList(); });
    el.stage.addEventListener("change", () => { state.filters.stage = el.stage.value || ALL; state.filters.grade = ALL; state.filters.chapter = ALL; buildFilters(); applyFilters(); renderList(); });
    el.grade.addEventListener("change", () => { state.filters.grade = el.grade.value || ALL; state.filters.chapter = ALL; buildFilters(); applyFilters(); renderList(); });
    el.chapter.addEventListener("change", () => { state.filters.chapter = el.chapter.value || ALL; applyFilters(); renderList(); });
    el.difficulty.addEventListener("change", () => { state.filters.difficulty = el.difficulty.value || ALL; applyFilters(); renderList(); });
    el.reset.addEventListener("click", () => { state.filters = { q: "", stage: ALL, grade: ALL, chapter: ALL, difficulty: ALL }; el.q.value = ""; buildFilters(); applyFilters(); renderList(); });
    el.tabTopics.addEventListener("click", () => activateTab("topics"));
    el.tabQuestions.addEventListener("click", () => activateTab("questions"));
  }

  async function loadJson(url, fallback) {
    try {
      const res = await fetch(url);
      if (!res.ok) return fallback;
      return await res.json();
    } catch (_) {
      return fallback;
    }
  }

  async function bootstrap() {
    const topicsData = await loadJson(TOPICS_URL, { topics: [] });
    const questionData = await loadJson(QUESTIONS_URL, { questions: [] });
    state.topics = Array.isArray(topicsData.topics) ? topicsData.topics : [];
    state.questions = Array.isArray(questionData.questions) ? questionData.questions : [];
    renderStats();
    bindEvents();
    activateTab("topics");
  }

  bootstrap();
})();
