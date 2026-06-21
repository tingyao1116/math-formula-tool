(() => {
  const toolkit = window.formulaToolkit || null;
  const store = window.formulaDataStore || null;
  const practiceStore = window.formulaPracticeStore || null;
  const practiceLibrary = window.practiceLibraryStore || null;
  const generatorLoader = window.practiceGeneratorLoader || null;
  const abilityStore = window.practiceAbilityMapStore || null;

  if (!toolkit || !store || !practiceStore || !practiceLibrary || !abilityStore) {
    console.warn("ability practice dependencies not loaded");
    return;
  }

  const PROGRESS_STORAGE_KEY = "math-formula-tool-ability-progress-v1";
  const ACTIVE_BRANCH_STORAGE_KEY = "math-formula-tool-ability-active-branch-v1";

  const elements = {
    abilityAuditList: document.getElementById("abilityAuditList"),
    abilityMap: document.getElementById("abilityMap"),
    masteryLegend: document.getElementById("masteryLegend"),
    branchTitle: document.getElementById("branchTitle"),
    branchStatus: document.getElementById("branchStatus"),
    branchMainLine: document.getElementById("branchMainLine"),
    branchSummary: document.getElementById("branchSummary"),
    branchMasteryLabel: document.getElementById("branchMasteryLabel"),
    branchMasteryBar: document.getElementById("branchMasteryBar"),
    branchPracticeTags: document.getElementById("branchPracticeTags"),
    branchPrerequisites: document.getElementById("branchPrerequisites"),
    branchNextSteps: document.getElementById("branchNextSteps"),
    branchAnswerMode: document.getElementById("branchAnswerMode"),
    startPracticeButton: document.getElementById("startPracticeButton"),
    newQuestionButton: document.getElementById("newQuestionButton"),
    sessionHint: document.getElementById("sessionHint"),
    sessionCard: document.getElementById("sessionCard"),
    feedbackPanel: document.getElementById("feedbackPanel"),
    mistakeTagPanel: document.getElementById("mistakeTagPanel"),
    recommendationPanel: document.getElementById("recommendationPanel"),
  };

  const chapterOptionByCode = new Map(
    (store.getChapterOptions?.() || []).map((entry) => [String(entry?.code || "").trim(), entry]),
  );
  const masteryStages = abilityStore.getMasteryStages?.() || [];
  const mistakeTags = abilityStore.getMistakeTags?.() || [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function loadProgress() {
    try {
      const raw = window.localStorage?.getItem(PROGRESS_STORAGE_KEY) || "";
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  function saveProgress(progress) {
    try {
      window.localStorage?.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress || {}));
    } catch (_error) {
      // ignore storage errors
    }
  }

  function inferBundleKey(record) {
    const explicit = String(record?.generatorBundle || record?.bundleKey || "").trim();
    if (explicit) return explicit;
    const chapterCode = String(record?.chapterCode || "").trim();
    if (!chapterCode) return "";
    const bundles = window.practiceGeneratorBundles || {};
    return Object.entries(bundles).find(([, bundle]) => {
      const prefixes = Array.isArray(bundle?.chapterPrefixes) ? bundle.chapterPrefixes : [];
      return prefixes.some((prefix) => chapterCode.startsWith(String(prefix || "")));
    })?.[0] || "";
  }

  function buildPracticeRef(practiceId) {
    const record = practiceLibrary?.byId?.[practiceId] || null;
    if (!record || record.enabled === false) return null;
    const chapterCode = String(record.chapterCode || "").trim();
    const chapterMeta = chapterOptionByCode.get(chapterCode) || null;
    return {
      id: String(record.id || "").trim(),
      title: String(record.title || record.id || "").trim(),
      chapterCode,
      chapterLabel: String(chapterMeta?.label || record.chapter || chapterCode).trim(),
      difficulty: String(record.difficulty || "").trim(),
      bundleKey: inferBundleKey(record),
      record,
    };
  }

  const branchById = new Map();
  const mainById = new Map();

  const branchAbilities = (abilityStore.getBranchAbilities?.() || [])
    .map((branch) => {
      const practiceRefs = (Array.isArray(branch.practiceIds) ? branch.practiceIds : [])
        .map(buildPracticeRef)
        .filter((entry) => entry && (practiceStore.getConfig?.(entry.id) || entry.bundleKey));
      return {
        ...branch,
        practiceRefs,
      };
    })
    .filter((branch) => branch.practiceRefs.length > 0);

  branchAbilities.forEach((branch) => {
    branchById.set(branch.id, branch);
  });

  const mainAbilities = (abilityStore.getMainAbilities?.() || [])
    .map((main) => ({
      ...main,
      branches: (Array.isArray(main.branchIds) ? main.branchIds : [])
        .map((branchId) => branchById.get(branchId))
        .filter(Boolean),
    }))
    .filter((main) => main.branches.length > 0);

  mainAbilities.forEach((main) => {
    mainById.set(main.id, main);
  });

  const state = {
    progress: loadProgress(),
    selectedBranchId: String(window.localStorage?.getItem(ACTIVE_BRANCH_STORAGE_KEY) || "").trim(),
    session: null,
    submitting: false,
  };

  if (!branchById.has(state.selectedBranchId)) {
    state.selectedBranchId = branchAbilities[0]?.id || "";
  }

  function getBranchProgress(branchId) {
    const current = state.progress[branchId];
    if (current && typeof current === "object") return current;
    return {
      attempts: 0,
      correct: 0,
      wrong: 0,
      score: 0,
      mistakeCounts: {},
      lastResult: "",
      updatedAt: "",
    };
  }

  function saveSelectedBranch(branchId) {
    try {
      window.localStorage?.setItem(ACTIVE_BRANCH_STORAGE_KEY, branchId);
    } catch (_error) {
      // ignore storage errors
    }
  }

  function getMasteryStage(progress) {
    const score = Math.max(0, Number(progress?.score) || 0);
    let current = masteryStages[0] || { id: "not-started", label: "未開始", minScore: 0 };
    masteryStages.forEach((stage) => {
      if (score >= Number(stage.minScore || 0)) current = stage;
    });
    return current;
  }

  function getMasteryPercent(progress) {
    const score = Math.max(0, Number(progress?.score) || 0);
    return Math.max(0, Math.min(100, Math.round((score / 10) * 100)));
  }

  function getStatusText(branch) {
    const progress = getBranchProgress(branch.id);
    const stage = getMasteryStage(progress);
    if (!progress.attempts) return `${stage.label}．尚未作答`;
    return `${stage.label}．${progress.correct}/${progress.attempts} 題答對`;
  }

  function renderAudit() {
    const meta = abilityStore.meta || {};
    const lines = [
      `已驗證可生成：${meta.enabledVerifiedPracticeCount || 0} 題型`,
      `題型總來源：${meta.libraryPracticeCount || 0} 筆 practice 紀錄`,
      `第一版能力節點：${branchAbilities.length} 個分支能力`,
      `資料鏈：${Array.isArray(meta.sourceLayers) ? meta.sourceLayers.length : 0} 層`,
    ];
    elements.abilityAuditList.innerHTML = lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  }

  function renderMasteryLegend() {
    elements.masteryLegend.innerHTML = masteryStages
      .map((stage) => `<span class="meta-chip">${escapeHtml(stage.label)}</span>`)
      .join("");
  }

  function renderAbilityMap() {
    elements.abilityMap.innerHTML = mainAbilities
      .map((main) => {
        const branchesHtml = main.branches
          .map((branch) => {
            const progress = getBranchProgress(branch.id);
            const stage = getMasteryStage(progress);
            const isActive = branch.id === state.selectedBranchId;
            return `
              <button
                type="button"
                class="ability-branch-card${isActive ? " is-active" : ""}"
                data-branch-id="${escapeHtml(branch.id)}"
              >
                <div class="ability-branch-card__top">
                  <strong>${escapeHtml(branch.title)}</strong>
                  <span class="meta-chip">${escapeHtml(stage.label)}</span>
                </div>
                <p>${escapeHtml(branch.summary)}</p>
                <div class="ability-branch-card__meta">
                  <span>${escapeHtml(branch.practiceRefs.length)} 個題型</span>
                  <span>${escapeHtml(getStatusText(branch))}</span>
                </div>
              </button>
            `;
          })
          .join("");
        return `
          <section class="ability-main-group">
            <div class="ability-main-group__header">
              <h3>${escapeHtml(main.title)}</h3>
              <p>${escapeHtml(main.summary)}</p>
            </div>
            <div class="ability-main-group__branches">${branchesHtml}</div>
          </section>
        `;
      })
      .join("");

    elements.abilityMap.querySelectorAll("[data-branch-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const branchId = String(button.getAttribute("data-branch-id") || "").trim();
        if (!branchById.has(branchId)) return;
        state.selectedBranchId = branchId;
        state.session = null;
        saveSelectedBranch(branchId);
        render();
      });
    });
  }

  function renderTagList(target, labels, emptyText) {
    const values = (Array.isArray(labels) ? labels : []).filter(Boolean);
    target.innerHTML = values.length
      ? values.map((value) => `<span class="tag">${escapeHtml(value)}</span>`).join("")
      : `<span class="ability-empty-text">${escapeHtml(emptyText)}</span>`;
  }

  function renderBranchDetail() {
    const branch = branchById.get(state.selectedBranchId) || null;
    if (!branch) return;
    const main = mainById.get(branch.mainAbilityId) || null;
    const progress = getBranchProgress(branch.id);
    const stage = getMasteryStage(progress);

    elements.branchTitle.textContent = branch.title;
    elements.branchStatus.textContent = getStatusText(branch);
    elements.branchMainLine.textContent = main ? `主線能力：${main.title}` : "";
    elements.branchSummary.textContent = branch.summary;
    elements.branchMasteryLabel.textContent = stage.label;
    elements.branchMasteryBar.style.width = `${getMasteryPercent(progress)}%`;

    renderTagList(
      elements.branchPracticeTags,
      branch.practiceRefs.map((practice) => `${practice.title}（${practice.chapterLabel}）`),
      "這個能力尚未掛入題型。",
    );
    renderTagList(
      elements.branchPrerequisites,
      branch.prerequisiteBranchIds.map((branchId) => branchById.get(branchId)?.title).filter(Boolean),
      "這個能力可直接開始。",
    );
    renderTagList(
      elements.branchNextSteps,
      branch.recommendedNextAbilityIds.map((branchId) => branchById.get(branchId)?.title).filter(Boolean),
      "先把這個能力練穩，再擴充下一批。",
    );
    elements.branchAnswerMode.textContent = branch.fillBlankSuitable
      ? `以填充題為主。${branch.familiarityRule}`
      : "這個能力暫時不建議只用單一文字輸入。";
  }

  async function ensurePracticeConfig(practiceRef) {
    const existing = practiceStore.getConfig?.(practiceRef.id);
    if (existing?.generate) return existing;
    if (generatorLoader?.ensureForPractice) {
      await generatorLoader.ensureForPractice(practiceRef.record);
    }
    return practiceStore.getConfig?.(practiceRef.id) || null;
  }

  function normalizeGeneratedRows(result) {
    const normalized = toolkit.normalizeGeneratedPracticeResult?.(result) || result || {};
    const questions = Array.isArray(normalized.questions) ? normalized.questions : [];
    const summaryAnswers = Array.isArray(normalized.summaryAnswers) ? normalized.summaryAnswers : [];
    const answers = Array.isArray(normalized.answers) ? normalized.answers : [];
    const length = Math.max(questions.length, summaryAnswers.length, answers.length);
    const rows = [];
    for (let index = 0; index < length; index += 1) {
      const question = String(questions[index] || "").trim();
      const summaryAnswer = String(summaryAnswers[index] || answers[index] || "").trim();
      const answer = String(answers[index] || "").trim();
      if (!question || !summaryAnswer) continue;
      rows.push({ question, summaryAnswer, answer });
    }
    return rows;
  }

  function shuffle(list) {
    const rows = Array.isArray(list) ? list.slice() : [];
    for (let index = rows.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [rows[index], rows[swapIndex]] = [rows[swapIndex], rows[index]];
    }
    return rows;
  }

  async function buildSessionForBranch(branch) {
    const practicePool = shuffle(branch.practiceRefs);
    for (const practiceRef of practicePool) {
      try {
        const config = await ensurePracticeConfig(practiceRef);
        if (!config || typeof config.generate !== "function") continue;
        const result = config.generate(practiceRef.record) || {};
        const rows = normalizeGeneratedRows(result);
        if (!rows.length) continue;
        const picked = rows[Math.floor(Math.random() * rows.length)];
        return {
          branchId: branch.id,
          practiceId: practiceRef.id,
          practiceTitle: practiceRef.title,
          chapterLabel: practiceRef.chapterLabel,
          intro: typeof result.intro === "string" ? result.intro : "",
          question: picked.question,
          summaryAnswer: picked.summaryAnswer,
          answer: picked.answer || picked.summaryAnswer,
          checked: false,
          isCorrect: false,
          recommendedBranchId: "",
          mistakeTagId: "",
          mistakeTagged: false,
        };
      } catch (error) {
        console.warn("Unable to generate ability-practice item", practiceRef.id, error);
      }
    }
    return null;
  }

  function stripHtml(text) {
    return String(text || "").replace(/<[^>]+>/g, "");
  }

  function normalizeFractionLatex(text) {
    let current = String(text || "");
    let previous = "";
    while (current !== previous) {
      previous = current;
      current = current.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, "$1/$2");
    }
    return current;
  }

  function normalizeAnswerText(text) {
    let value = stripHtml(text)
      .replace(/^簡答[:：]\s*/u, "")
      .replace(/\\\(|\\\)|\\\[|\\\]/g, "")
      .replace(/\$/g, "")
      .replace(/\\times/g, "*")
      .replace(/×/g, "*")
      .replace(/\\div/g, "/")
      .replace(/÷/g, "/")
      .replace(/\\ge/g, ">=")
      .replace(/\\le/g, "<=")
      .replace(/≥/g, ">=")
      .replace(/≤/g, "<=")
      .replace(/＝/g, "=")
      .replace(/[﹣－−]/g, "-")
      .replace(/[（]/g, "(")
      .replace(/[）]/g, ")")
      .replace(/：/g, ":");
    value = normalizeFractionLatex(value);
    value = value.replace(/\(([-\d]+)\)\/\(([-\d]+)\)/g, "$1/$2");
    value = value.replace(/[。．]/g, "");
    value = value.replace(/\s+/g, "");
    return value.trim();
  }

  function buildAnswerVariants(answerText) {
    const normalized = normalizeAnswerText(answerText);
    if (!normalized) return [];
    const variants = new Set([normalized]);

    if (normalized.includes("=")) {
      const tail = normalized.split("=").pop();
      if (tail) variants.add(String(tail).trim());
    }

    const equationMatch = normalized.match(/^([a-zA-Z]+)([=<>]+)(.+)$/);
    if (equationMatch) {
      variants.add(equationMatch[3]);
    }

    if (normalized.includes("或")) {
      const sorted = normalized
        .split("或")
        .map((piece) => piece.trim())
        .filter(Boolean)
        .sort()
        .join("|");
      if (sorted) variants.add(sorted);
    }

    return Array.from(variants);
  }

  function canonicalizeUserAnswer(answerText) {
    const normalized = normalizeAnswerText(answerText).replace(/,/g, "或").replace(/，/g, "或");
    if (normalized.includes("或")) {
      return normalized
        .split("或")
        .map((piece) => piece.trim())
        .filter(Boolean)
        .sort()
        .join("|");
    }
    return normalized;
  }

  function isAnswerCorrect(expectedText, userText) {
    const user = canonicalizeUserAnswer(userText);
    if (!user) return false;
    return buildAnswerVariants(expectedText).some((expected) => expected === user);
  }

  function updateProgressAfterResult(branchId, isCorrect) {
    const current = getBranchProgress(branchId);
    const next = {
      ...current,
      attempts: Number(current.attempts || 0) + 1,
      correct: Number(current.correct || 0) + (isCorrect ? 1 : 0),
      wrong: Number(current.wrong || 0) + (isCorrect ? 0 : 1),
      score: Math.max(0, Number(current.score || 0) + (isCorrect ? 2 : -1)),
      lastResult: isCorrect ? "correct" : "wrong",
      updatedAt: new Date().toISOString(),
      mistakeCounts: { ...(current.mistakeCounts || {}) },
    };
    state.progress[branchId] = next;
    saveProgress(state.progress);
    return next;
  }

  function recordMistakeTag(branchId, tagId) {
    if (!branchId || !tagId) return;
    const current = getBranchProgress(branchId);
    const counts = { ...(current.mistakeCounts || {}) };
    counts[tagId] = Number(counts[tagId] || 0) + 1;
    state.progress[branchId] = {
      ...current,
      mistakeCounts: counts,
      updatedAt: new Date().toISOString(),
    };
    saveProgress(state.progress);
  }

  function recommendNextBranch(branch, isCorrect, mistakeTagId = "") {
    if (!branch) return branch;
    if (isCorrect) {
      const progress = getBranchProgress(branch.id);
      const stage = getMasteryStage(progress);
      if (stage.id === "advance-ready" || stage.id === "mastered") {
        const nextBranch = branch.recommendedNextAbilityIds
          .map((branchId) => branchById.get(branchId))
          .find(Boolean);
        if (nextBranch) return nextBranch;
      }
      return branch;
    }

    if (mistakeTagId === "concept" || mistakeTagId === "misread") {
      return branch.prerequisiteBranchIds
        .map((branchId) => branchById.get(branchId))
        .find(Boolean) || branch;
    }

    return branch;
  }

  function renderSessionCard() {
    const branch = branchById.get(state.selectedBranchId) || null;
    const session = state.session;

    if (!branch) return;

    if (!session) {
      elements.sessionCard.className = "ability-session-card is-empty";
      elements.sessionCard.innerHTML = `
        <p>這個能力目前對應 ${branch.practiceRefs.length} 個已驗證題型。</p>
        <p>建議先按「開始練習」，系統會從這個能力的題型中隨機抽一題填充題。</p>
      `;
      elements.feedbackPanel.hidden = true;
      elements.mistakeTagPanel.hidden = true;
      elements.recommendationPanel.hidden = true;
      elements.newQuestionButton.disabled = true;
      elements.sessionHint.textContent = "先出一題，再填答案。";
      return;
    }

    elements.sessionCard.className = "ability-session-card";
    elements.sessionCard.innerHTML = `
      <div class="ability-session-card__meta">
        <span class="meta-chip">${escapeHtml(session.chapterLabel)}</span>
        <span class="meta-chip">${escapeHtml(session.practiceTitle)}</span>
      </div>
      ${session.intro ? `<p class="practice-intro">${toolkit.renderRichTextLine(session.intro)}</p>` : ""}
      <div class="interactive-output">${toolkit.renderRichTextLine(session.question)}</div>
      <label class="field ability-answer-field">
        <span>請輸入答案</span>
        <input
          id="abilityAnswerInput"
          type="text"
          class="ability-answer-input"
          placeholder="例如：-3/5、x>=2、3:4、-7 或 17"
          ${session.checked ? "disabled" : ""}
        />
      </label>
      <div class="ability-session-card__actions">
        <button id="checkAnswerButton" class="ghost-button" type="button" ${session.checked ? "disabled" : ""}>檢查答案</button>
      </div>
    `;
    elements.newQuestionButton.disabled = false;
    elements.sessionHint.textContent = session.checked
      ? "這題已記錄，可以看回饋與下一步建議。"
      : "先自己輸入答案，再按檢查答案。";

    const answerInput = document.getElementById("abilityAnswerInput");
    const checkButton = document.getElementById("checkAnswerButton");
    if (answerInput) {
      answerInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !state.session?.checked) {
          event.preventDefault();
          checkButton?.click();
        }
      });
      window.setTimeout(() => answerInput.focus(), 0);
    }
    if (checkButton) {
      checkButton.addEventListener("click", async () => {
        await handleCheckAnswer();
      });
    }
  }

  function renderFeedback() {
    const session = state.session;
    if (!session || !session.checked) {
      elements.feedbackPanel.hidden = true;
      return;
    }

    elements.feedbackPanel.hidden = false;
    elements.feedbackPanel.innerHTML = `
      <div class="ability-feedback-panel__badge ${session.isCorrect ? "is-correct" : "is-wrong"}">
        ${session.isCorrect ? "答對了" : "這題先修正一下"}
      </div>
      <div class="ability-feedback-panel__body">
        <p><strong>你的作答方向：</strong>${session.isCorrect ? "可以往下一步了。" : "先看簡答與詳解，再決定是留在本能力還是退回前置能力。"}</p>
        <p><strong>建議簡答：</strong>${toolkit.renderRichTextLine(session.summaryAnswer)}</p>
        <p><strong>詳解提示：</strong>${toolkit.renderRichTextLine(session.answer)}</p>
      </div>
    `;
  }

  function renderMistakePanel() {
    const session = state.session;
    if (!session || !session.checked || session.isCorrect) {
      elements.mistakeTagPanel.hidden = true;
      return;
    }

    elements.mistakeTagPanel.hidden = false;
    elements.mistakeTagPanel.innerHTML = `
      <h3>如果你知道這題卡在哪裡，可以順手標一下</h3>
      <div class="ability-mistake-panel__tags">
        ${mistakeTags
          .map((tag) => `
            <button
              type="button"
              class="ghost-button ability-mistake-tag${session.mistakeTagId === tag.id ? " is-active" : ""}"
              data-mistake-tag="${escapeHtml(tag.id)}"
              ${session.mistakeTagged && session.mistakeTagId !== tag.id ? "disabled" : ""}
            >
              ${escapeHtml(tag.label)}
            </button>
          `)
          .join("")}
      </div>
    `;

    elements.mistakeTagPanel.querySelectorAll("[data-mistake-tag]").forEach((button) => {
      button.addEventListener("click", () => {
        const tagId = String(button.getAttribute("data-mistake-tag") || "").trim();
        if (!tagId || state.session?.mistakeTagged) return;
        state.session.mistakeTagId = tagId;
        state.session.mistakeTagged = true;
        recordMistakeTag(state.session.branchId, tagId);
        const branch = branchById.get(state.session.branchId);
        const recommended = recommendNextBranch(branch, false, tagId);
        state.session.recommendedBranchId = recommended?.id || state.session.branchId;
        render();
      });
    });
  }

  function renderRecommendation() {
    const session = state.session;
    const currentBranch = branchById.get(state.selectedBranchId) || null;
    if (!session || !session.checked || !currentBranch) {
      elements.recommendationPanel.hidden = true;
      return;
    }

    const recommendedBranch = branchById.get(session.recommendedBranchId || currentBranch.id) || currentBranch;
    let text = "建議同能力再做一題，先把手感做穩。";

    if (session.isCorrect && recommendedBranch.id !== currentBranch.id) {
      text = `這個能力已經有進步，可以試著往「${recommendedBranch.title}」前進。`;
    } else if (!session.isCorrect && recommendedBranch.id !== currentBranch.id) {
      text = `這題比較像前置觀念還沒穩，建議先回到「${recommendedBranch.title}」。`;
    } else if (!session.isCorrect) {
      text = "先留在同能力再做一題，修正剛剛的錯點。";
    }

    elements.recommendationPanel.hidden = false;
    elements.recommendationPanel.innerHTML = `
      <h3>下一步建議</h3>
      <p>${escapeHtml(text)}</p>
      <div class="ability-recommendation-panel__actions">
        <button id="repeatCurrentBranchButton" class="ghost-button" type="button">同能力再來一題</button>
        <button
          id="goRecommendedBranchButton"
          class="ghost-button"
          type="button"
          ${recommendedBranch.id === currentBranch.id ? "disabled" : ""}
        >
          前往推薦能力
        </button>
      </div>
    `;

    document.getElementById("repeatCurrentBranchButton")?.addEventListener("click", async () => {
      await startPractice();
    });
    document.getElementById("goRecommendedBranchButton")?.addEventListener("click", async () => {
      if (recommendedBranch.id === currentBranch.id) return;
      state.selectedBranchId = recommendedBranch.id;
      saveSelectedBranch(recommendedBranch.id);
      state.session = null;
      render();
      await startPractice();
    });
  }

  function render() {
    renderAbilityMap();
    renderBranchDetail();
    renderSessionCard();
    renderFeedback();
    renderMistakePanel();
    renderRecommendation();
  }

  async function startPractice() {
    const branch = branchById.get(state.selectedBranchId) || null;
    if (!branch) return;
    elements.startPracticeButton.disabled = true;
    elements.newQuestionButton.disabled = true;
    elements.sessionHint.textContent = "正在載入這個能力的題目…";
    const session = await buildSessionForBranch(branch);
    state.session = session;
    if (!session) {
      elements.sessionHint.textContent = "這個能力目前沒有成功產出題目，請先改選其他能力。";
    }
    elements.startPracticeButton.disabled = false;
    render();
  }

  async function handleCheckAnswer() {
    if (state.submitting || !state.session || state.session.checked) return;
    const input = document.getElementById("abilityAnswerInput");
    const userAnswer = String(input?.value || "").trim();
    if (!userAnswer) {
      elements.sessionHint.textContent = "先輸入答案，再按檢查答案。";
      input?.focus();
      return;
    }

    state.submitting = true;
    const currentBranch = branchById.get(state.session.branchId) || null;
    const isCorrect = isAnswerCorrect(state.session.summaryAnswer, userAnswer);
    updateProgressAfterResult(state.session.branchId, isCorrect);
    const recommended = recommendNextBranch(currentBranch, isCorrect, "");
    state.session = {
      ...state.session,
      checked: true,
      isCorrect,
      recommendedBranchId: recommended?.id || state.session.branchId,
    };
    state.submitting = false;
    render();
  }

  function applyManualCorrectToProgress(branchId) {
    const current = getBranchProgress(branchId);
    const next = {
      ...current,
      correct: Math.max(0, Number(current.correct || 0) + 1),
      wrong: Math.max(0, Number(current.wrong || 0) - 1),
      score: Math.max(0, Number(current.score || 0) + 3),
      lastResult: "manual-correct",
      updatedAt: new Date().toISOString(),
    };
    state.progress[branchId] = next;
    saveProgress(state.progress);
    return next;
  }

  function renderFeedback() {
    const session = state.session;
    if (!session || !session.checked) {
      elements.feedbackPanel.hidden = true;
      return;
    }

    elements.feedbackPanel.hidden = false;
    elements.feedbackPanel.innerHTML = `
      <div class="ability-feedback-panel__badge ${session.isCorrect ? "is-correct" : "is-wrong"}">
        ${session.isCorrect ? "答對了" : "這題先修正一下"}
      </div>
      <div class="ability-feedback-panel__body">
        <p><strong>系統判定：</strong>${session.isCorrect ? "目前會記成答對。" : "目前先記成答錯；如果你的寫法合理，可以手動改判。"}</p>
        ${session.userAnswer ? `<p><strong>你的答案：</strong>${escapeHtml(session.userAnswer)}</p>` : ""}
        <p><strong>建議簡答：</strong>${toolkit.renderRichTextLine(session.summaryAnswer)}</p>
        <p><strong>詳解提示：</strong>${toolkit.renderRichTextLine(session.answer)}</p>
        ${!session.isCorrect ? `
          <div class="ability-feedback-panel__actions">
            <button id="manualCorrectButton" class="ghost-button" type="button">這題其實答對，手動改判正確</button>
          </div>
        ` : session.manuallyCorrected ? `
          <div class="ability-feedback-panel__actions">
            <span class="meta-chip">已手動改判為正確</span>
          </div>
        ` : ""}
      </div>
    `;

    if (!session.isCorrect) {
      document.getElementById("manualCorrectButton")?.addEventListener("click", () => {
        handleManualCorrect();
      });
    }
  }

  async function handleCheckAnswer() {
    if (state.submitting || !state.session || state.session.checked) return;
    const input = document.getElementById("abilityAnswerInput");
    const userAnswer = String(input?.value || "").trim();
    if (!userAnswer) {
      elements.sessionHint.textContent = "先輸入答案，再按檢查答案。";
      input?.focus();
      return;
    }

    state.submitting = true;
    const currentBranch = branchById.get(state.session.branchId) || null;
    const isCorrect = isAnswerCorrect(state.session.summaryAnswer, userAnswer);
    updateProgressAfterResult(state.session.branchId, isCorrect);
    const recommended = recommendNextBranch(currentBranch, isCorrect, "");
    state.session = {
      ...state.session,
      checked: true,
      isCorrect,
      userAnswer,
      manuallyCorrected: false,
      recommendedBranchId: recommended?.id || state.session.branchId,
    };
    state.submitting = false;
    if (isCorrect) {
      elements.sessionHint.textContent = "答對了，正在前往下一題…";
      state.session = null;
      render();
      await startPractice();
      return;
    }
    render();
  }

  function handleManualCorrect() {
    if (!state.session || !state.session.checked || state.session.isCorrect) return;
    const currentBranch = branchById.get(state.session.branchId) || null;
    applyManualCorrectToProgress(state.session.branchId);
    const recommended = recommendNextBranch(currentBranch, true, "");
    state.session = {
      ...state.session,
      isCorrect: true,
      manuallyCorrected: true,
      recommendedBranchId: recommended?.id || state.session.branchId,
    };
    render();
  }

  elements.startPracticeButton?.addEventListener("click", async () => {
    await startPractice();
  });

  elements.newQuestionButton?.addEventListener("click", async () => {
    await startPractice();
  });

  renderAudit();
  renderMasteryLegend();
  render();
})();
