(() => {
  const toolkit = window.formulaToolkit || null;
  const store = window.formulaDataStore || null;
  const practiceStore = window.formulaPracticeStore || null;
  const practiceLibrary = window.practiceLibraryStore || null;
  const generatorLoader = window.practiceGeneratorLoader || null;
  const skillTreeStore = window.practiceSkillTreeStore || null;

  if (!toolkit || !store || !practiceStore || !practiceLibrary || !skillTreeStore) {
    console.warn("skill tree practice dependencies not loaded");
    return;
  }

  const PROGRESS_STORAGE_KEY = "math-formula-tool-skill-tree-progress-v1";
  const ACTIVE_SKILL_STORAGE_KEY = "math-formula-tool-skill-tree-active-v1";
  const TREE_VISIBLE_STORAGE_KEY = "math-formula-tool-skill-tree-visible-v1";
  const TREE_OPEN_STORAGE_KEY = "math-formula-tool-skill-tree-open-v1";

  const elements = {
    skillTreeAuditList: document.getElementById("skillTreeAuditList"),
    masteryLegend: document.getElementById("masteryLegend"),
    treeToggleButton: document.getElementById("treeToggleButton"),
    skillTreeMap: document.getElementById("skillTreeMap"),
    skillTitle: document.getElementById("skillTitle"),
    skillStatus: document.getElementById("skillStatus"),
    skillChapter: document.getElementById("skillChapter"),
    skillSummary: document.getElementById("skillSummary"),
    skillMasteryLabel: document.getElementById("skillMasteryLabel"),
    skillMasteryBar: document.getElementById("skillMasteryBar"),
    skillPracticeTags: document.getElementById("skillPracticeTags"),
    skillPrerequisites: document.getElementById("skillPrerequisites"),
    skillNextSteps: document.getElementById("skillNextSteps"),
    startPracticeButton: document.getElementById("startPracticeButton"),
    newQuestionButton: document.getElementById("newQuestionButton"),
    sessionHint: document.getElementById("sessionHint"),
    sessionCard: document.getElementById("sessionCard"),
    feedbackPanel: document.getElementById("feedbackPanel"),
    mistakeTagPanel: document.getElementById("mistakeTagPanel"),
    recommendationPanel: document.getElementById("recommendationPanel"),
  };

  const masteryStages = skillTreeStore.getMasteryStages?.() || [];
  const mistakeTags = skillTreeStore.getMistakeTags?.() || [];
  const chapterTree = skillTreeStore.getChapterTree?.() || [];
  const chapterOptionByCode = new Map(
    (store.getChapterOptions?.() || []).map((entry) => [String(entry?.code || "").trim(), entry]),
  );

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function loadJsonStorage(key, fallback) {
    try {
      const raw = window.localStorage?.getItem(key) || "";
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function saveJsonStorage(key, value) {
    try {
      window.localStorage?.setItem(key, JSON.stringify(value));
    } catch (_error) {
      // ignore storage errors
    }
  }

  function loadTextStorage(key, fallback) {
    try {
      return String(window.localStorage?.getItem(key) || fallback || "").trim();
    } catch (_error) {
      return String(fallback || "").trim();
    }
  }

  function saveTextStorage(key, value) {
    try {
      window.localStorage?.setItem(key, value);
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
      record: clone(record),
    };
  }

  const skillNodes = (skillTreeStore.getSkillNodes?.() || [])
    .map((skill) => ({
      ...skill,
      practiceRefs: (Array.isArray(skill.practiceIds) ? skill.practiceIds : [])
        .map(buildPracticeRef)
        .filter((entry) => entry && (practiceStore.getConfig?.(entry.id) || entry.bundleKey)),
    }))
    .filter((skill) => skill.practiceRefs.length > 0);

  const skillById = new Map(skillNodes.map((skill) => [skill.id, skill]));

  const resolvedTree = chapterTree
    .map((chapter) => ({
      ...chapter,
      chapterLabel: String(chapterOptionByCode.get(chapter.chapterCode)?.label || chapter.title || chapter.chapterCode).trim(),
      skills: (Array.isArray(chapter.skillIds) ? chapter.skillIds : [])
        .map((skillId) => skillById.get(skillId))
        .filter(Boolean),
    }))
    .filter((chapter) => chapter.skills.length > 0);

  const defaultOpenMap = Object.fromEntries(resolvedTree.map((chapter) => [chapter.id, true]));

  const state = {
    progress: loadJsonStorage(PROGRESS_STORAGE_KEY, {}),
    selectedSkillId: loadTextStorage(ACTIVE_SKILL_STORAGE_KEY, skillNodes[0]?.id || ""),
    treeVisible: loadTextStorage(TREE_VISIBLE_STORAGE_KEY, "true") !== "false",
    treeOpenMap: { ...defaultOpenMap, ...loadJsonStorage(TREE_OPEN_STORAGE_KEY, {}) },
    session: null,
    submitting: false,
  };

  if (!skillById.has(state.selectedSkillId)) {
    state.selectedSkillId = skillNodes[0]?.id || "";
  }

  function getSkillProgress(skillId) {
    const current = state.progress[skillId];
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

  function saveProgress() {
    saveJsonStorage(PROGRESS_STORAGE_KEY, state.progress);
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

  function getStatusText(skill) {
    const progress = getSkillProgress(skill.id);
    const stage = getMasteryStage(progress);
    if (!progress.attempts) return `${stage.label}．尚未作答`;
    return `${stage.label}．${progress.correct}/${progress.attempts} 題答對`;
  }

  function renderAudit() {
    const meta = skillTreeStore.meta || {};
    const lines = [
      `技能節點：${skillNodes.length} 個`,
      `章節樹層級：${resolvedTree.length} 章`,
      `已驗證可生成：${meta.enabledVerifiedPracticeCount || 0} 題型`,
      `目前先放：國一到國二重點技能`,
    ];
    elements.skillTreeAuditList.innerHTML = lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  }

  function renderLegend() {
    elements.masteryLegend.innerHTML = masteryStages
      .map((stage) => `<span class="meta-chip">${escapeHtml(stage.label)}</span>`)
      .join("");
  }

  function renderTagList(target, labels, emptyText) {
    const values = (Array.isArray(labels) ? labels : []).filter(Boolean);
    target.innerHTML = values.length
      ? values.map((value) => `<span class="tag">${escapeHtml(value)}</span>`).join("")
      : `<span class="ability-empty-text">${escapeHtml(emptyText)}</span>`;
  }

  function renderSkillTree() {
    elements.treeToggleButton.textContent = state.treeVisible ? "隱藏技能樹" : "顯示技能樹";
    if (!state.treeVisible) {
      elements.skillTreeMap.hidden = true;
      elements.skillTreeMap.innerHTML = "";
      return;
    }

    elements.skillTreeMap.hidden = false;
    elements.skillTreeMap.innerHTML = resolvedTree
      .map((chapter) => {
        const isOpen = state.treeOpenMap[chapter.id] !== false;
        const skillsHtml = isOpen
          ? chapter.skills
              .map((skill) => {
                const progress = getSkillProgress(skill.id);
                const stage = getMasteryStage(progress);
                const isActive = skill.id === state.selectedSkillId;
                return `
                  <div class="skill-tree-node${isActive ? " is-active" : ""}">
                    <button type="button" class="skill-tree-node__main" data-skill-select="${escapeHtml(skill.id)}">
                      <span class="skill-tree-node__title">${escapeHtml(skill.title)}</span>
                      <span class="meta-chip">${escapeHtml(stage.label)}</span>
                    </button>
                    <div class="skill-tree-node__actions">
                      <span class="skill-tree-node__count">${escapeHtml(skill.practiceRefs.length)} 題型</span>
                      <button type="button" class="ghost-button skill-tree-node__practice" data-skill-practice="${escapeHtml(skill.id)}">練習</button>
                    </div>
                  </div>
                `;
              })
              .join("")
          : "";

        return `
          <section class="skill-tree-chapter">
            <button type="button" class="skill-tree-chapter__header" data-chapter-toggle="${escapeHtml(chapter.id)}">
              <span>${escapeHtml(chapter.chapterLabel)}</span>
              <span>${isOpen ? "收合" : "展開"}</span>
            </button>
            ${isOpen ? `<div class="skill-tree-chapter__body">${skillsHtml}</div>` : ""}
          </section>
        `;
      })
      .join("");

    elements.skillTreeMap.querySelectorAll("[data-chapter-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const chapterId = String(button.getAttribute("data-chapter-toggle") || "").trim();
        state.treeOpenMap[chapterId] = !(state.treeOpenMap[chapterId] !== false);
        saveJsonStorage(TREE_OPEN_STORAGE_KEY, state.treeOpenMap);
        renderSkillTree();
      });
    });

    elements.skillTreeMap.querySelectorAll("[data-skill-select]").forEach((button) => {
      button.addEventListener("click", () => {
        const skillId = String(button.getAttribute("data-skill-select") || "").trim();
        if (!skillById.has(skillId)) return;
        state.selectedSkillId = skillId;
        state.session = null;
        saveTextStorage(ACTIVE_SKILL_STORAGE_KEY, skillId);
        render();
      });
    });

    elements.skillTreeMap.querySelectorAll("[data-skill-practice]").forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.stopPropagation();
        const skillId = String(button.getAttribute("data-skill-practice") || "").trim();
        if (!skillById.has(skillId)) return;
        state.selectedSkillId = skillId;
        saveTextStorage(ACTIVE_SKILL_STORAGE_KEY, skillId);
        render();
        await startPractice();
      });
    });
  }

  function renderSkillDetail() {
    const skill = skillById.get(state.selectedSkillId) || null;
    if (!skill) return;
    const progress = getSkillProgress(skill.id);
    const stage = getMasteryStage(progress);
    const chapterLabel = String(chapterOptionByCode.get(skill.chapterCode)?.label || skill.chapterCode).trim();

    elements.skillTitle.textContent = skill.title;
    elements.skillStatus.textContent = getStatusText(skill);
    elements.skillChapter.textContent = chapterLabel;
    elements.skillSummary.textContent = `技能重點：${skill.shortLabel}`;
    elements.skillMasteryLabel.textContent = stage.label;
    elements.skillMasteryBar.style.width = `${getMasteryPercent(progress)}%`;

    renderTagList(
      elements.skillPracticeTags,
      skill.practiceRefs.map((practice) => practice.title),
      "目前沒有對應題型。",
    );
    renderTagList(
      elements.skillPrerequisites,
      skill.prerequisiteSkillIds.map((skillId) => skillById.get(skillId)?.shortLabel || skillById.get(skillId)?.title).filter(Boolean),
      "可直接開始",
    );
    renderTagList(
      elements.skillNextSteps,
      skill.nextSkillIds.map((skillId) => skillById.get(skillId)?.shortLabel || skillById.get(skillId)?.title).filter(Boolean),
      "先把這個技能練穩",
    );
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

  async function buildSessionForSkill(skill) {
    const practicePool = shuffle(skill.practiceRefs);
    for (const practiceRef of practicePool) {
      try {
        const config = await ensurePracticeConfig(practiceRef);
        if (!config || typeof config.generate !== "function") continue;
        const result = config.generate(practiceRef.record) || {};
        const rows = normalizeGeneratedRows(result);
        if (!rows.length) continue;
        const picked = rows[Math.floor(Math.random() * rows.length)];
        return {
          skillId: skill.id,
          practiceId: practiceRef.id,
          practiceTitle: practiceRef.title,
          chapterLabel: practiceRef.chapterLabel,
          intro: typeof result.intro === "string" ? result.intro : "",
          question: picked.question,
          summaryAnswer: picked.summaryAnswer,
          answer: picked.answer || picked.summaryAnswer,
          checked: false,
          isCorrect: false,
          recommendedSkillId: "",
          mistakeTagId: "",
          mistakeTagged: false,
          userAnswer: "",
          manuallyCorrected: false,
        };
      } catch (error) {
        console.warn("Unable to generate skill tree item", practiceRef.id, error);
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
    if (equationMatch) variants.add(equationMatch[3]);

    if (normalized.includes("或")) {
      variants.add(
        normalized
          .split("或")
          .map((piece) => piece.trim())
          .filter(Boolean)
          .sort()
          .join("|"),
      );
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

  function updateProgressAfterResult(skillId, isCorrect) {
    const current = getSkillProgress(skillId);
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
    state.progress[skillId] = next;
    saveProgress();
    return next;
  }

  function applyManualCorrectToProgress(skillId) {
    const current = getSkillProgress(skillId);
    const next = {
      ...current,
      correct: Math.max(0, Number(current.correct || 0) + 1),
      wrong: Math.max(0, Number(current.wrong || 0) - 1),
      score: Math.max(0, Number(current.score || 0) + 3),
      lastResult: "manual-correct",
      updatedAt: new Date().toISOString(),
    };
    state.progress[skillId] = next;
    saveProgress();
    return next;
  }

  function recordMistakeTag(skillId, tagId) {
    if (!skillId || !tagId) return;
    const current = getSkillProgress(skillId);
    const counts = { ...(current.mistakeCounts || {}) };
    counts[tagId] = Number(counts[tagId] || 0) + 1;
    state.progress[skillId] = {
      ...current,
      mistakeCounts: counts,
      updatedAt: new Date().toISOString(),
    };
    saveProgress();
  }

  function recommendNextSkill(skill, isCorrect, mistakeTagId = "") {
    if (!skill) return skill;
    if (isCorrect) {
      const progress = getSkillProgress(skill.id);
      const stage = getMasteryStage(progress);
      if (stage.id === "advance-ready" || stage.id === "mastered") {
        const nextSkill = skill.nextSkillIds.map((skillId) => skillById.get(skillId)).find(Boolean);
        if (nextSkill) return nextSkill;
      }
      return skill;
    }

    if (mistakeTagId === "concept" || mistakeTagId === "misread") {
      return skill.prerequisiteSkillIds.map((skillId) => skillById.get(skillId)).find(Boolean) || skill;
    }

    return skill;
  }

  function renderSessionCard() {
    const skill = skillById.get(state.selectedSkillId) || null;
    const session = state.session;

    if (!skill) return;

    if (!session) {
      elements.sessionCard.className = "ability-session-card is-empty";
      elements.sessionCard.innerHTML = `
        <p>這個技能目前對應 ${skill.practiceRefs.length} 個題型。</p>
        <p>可以按上方「開始練習」，或直接按技能樹節點旁邊的「練習」。</p>
      `;
      elements.feedbackPanel.hidden = true;
      elements.mistakeTagPanel.hidden = true;
      elements.recommendationPanel.hidden = true;
      elements.newQuestionButton.disabled = true;
      elements.sessionHint.textContent = "選技能後就可以開始。";
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
          id="skillAnswerInput"
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
    elements.sessionHint.textContent = session.checked ? "錯題可看回饋；答對會直接前往下一題。" : "先輸入答案，再按檢查答案。";

    const answerInput = document.getElementById("skillAnswerInput");
    const checkButton = document.getElementById("checkAnswerButton");
    if (answerInput) {
      answerInput.addEventListener("keydown", async (event) => {
        if (event.key === "Enter" && !state.session?.checked) {
          event.preventDefault();
          await handleCheckAnswer();
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
        ${session.isCorrect ? "答對了" : "這題先修正"}
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
      document.getElementById("manualCorrectButton")?.addEventListener("click", async () => {
        await handleManualCorrect();
      });
    }
  }

  function renderMistakePanel() {
    const session = state.session;
    if (!session || !session.checked || session.isCorrect) {
      elements.mistakeTagPanel.hidden = true;
      return;
    }

    elements.mistakeTagPanel.hidden = false;
    elements.mistakeTagPanel.innerHTML = `
      <h3>可標記錯因</h3>
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
        recordMistakeTag(state.session.skillId, tagId);
        const skill = skillById.get(state.session.skillId);
        const recommended = recommendNextSkill(skill, false, tagId);
        state.session.recommendedSkillId = recommended?.id || state.session.skillId;
        render();
      });
    });
  }

  function renderRecommendation() {
    const session = state.session;
    const currentSkill = skillById.get(state.selectedSkillId) || null;
    if (!session || !session.checked || !currentSkill) {
      elements.recommendationPanel.hidden = true;
      return;
    }

    const recommendedSkill = skillById.get(session.recommendedSkillId || currentSkill.id) || currentSkill;
    let text = "建議同技能再做一題。";
    if (!session.isCorrect && recommendedSkill.id !== currentSkill.id) {
      text = `建議先回「${recommendedSkill.title}」。`;
    } else if (!session.isCorrect) {
      text = "建議先留在本技能修正。";
    } else if (session.manuallyCorrected) {
      text = "已改判正確，可以繼續往下刷題。";
    }

    elements.recommendationPanel.hidden = false;
    elements.recommendationPanel.innerHTML = `
      <h3>下一步</h3>
      <p>${escapeHtml(text)}</p>
      <div class="ability-recommendation-panel__actions">
        <button id="repeatCurrentSkillButton" class="ghost-button" type="button">同技能再來一題</button>
        <button
          id="goRecommendedSkillButton"
          class="ghost-button"
          type="button"
          ${recommendedSkill.id === currentSkill.id ? "disabled" : ""}
        >
          前往推薦技能
        </button>
      </div>
    `;

    document.getElementById("repeatCurrentSkillButton")?.addEventListener("click", async () => {
      await startPractice();
    });
    document.getElementById("goRecommendedSkillButton")?.addEventListener("click", async () => {
      if (recommendedSkill.id === currentSkill.id) return;
      state.selectedSkillId = recommendedSkill.id;
      saveTextStorage(ACTIVE_SKILL_STORAGE_KEY, recommendedSkill.id);
      state.session = null;
      render();
      await startPractice();
    });
  }

  function render() {
    renderSkillTree();
    renderSkillDetail();
    renderSessionCard();
    renderFeedback();
    renderMistakePanel();
    renderRecommendation();
  }

  async function startPractice() {
    const skill = skillById.get(state.selectedSkillId) || null;
    if (!skill) return;
    elements.startPracticeButton.disabled = true;
    elements.newQuestionButton.disabled = true;
    elements.sessionHint.textContent = "正在載入題目…";
    const session = await buildSessionForSkill(skill);
    state.session = session;
    if (!session) {
      elements.sessionHint.textContent = "這個技能目前沒有成功產出題目。";
    }
    elements.startPracticeButton.disabled = false;
    render();
  }

  async function handleCheckAnswer() {
    if (state.submitting || !state.session || state.session.checked) return;
    const input = document.getElementById("skillAnswerInput");
    const userAnswer = String(input?.value || "").trim();
    if (!userAnswer) {
      elements.sessionHint.textContent = "先輸入答案，再按檢查答案。";
      input?.focus();
      return;
    }

    state.submitting = true;
    const currentSkill = skillById.get(state.session.skillId) || null;
    const isCorrect = isAnswerCorrect(state.session.summaryAnswer, userAnswer);
    updateProgressAfterResult(state.session.skillId, isCorrect);
    const recommended = recommendNextSkill(currentSkill, isCorrect, "");
    state.session = {
      ...state.session,
      checked: true,
      isCorrect,
      userAnswer,
      manuallyCorrected: false,
      recommendedSkillId: recommended?.id || state.session.skillId,
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

  async function handleManualCorrect() {
    if (!state.session || !state.session.checked || state.session.isCorrect) return;
    const currentSkill = skillById.get(state.session.skillId) || null;
    applyManualCorrectToProgress(state.session.skillId);
    const recommended = recommendNextSkill(currentSkill, true, "");
    state.session = {
      ...state.session,
      isCorrect: true,
      manuallyCorrected: true,
      recommendedSkillId: recommended?.id || state.session.skillId,
    };
    elements.sessionHint.textContent = "已手動改判正確，正在前往下一題…";
    state.session = null;
    render();
    await startPractice();
  }

  elements.treeToggleButton?.addEventListener("click", () => {
    state.treeVisible = !state.treeVisible;
    saveTextStorage(TREE_VISIBLE_STORAGE_KEY, state.treeVisible ? "true" : "false");
    renderSkillTree();
  });

  elements.startPracticeButton?.addEventListener("click", async () => {
    await startPractice();
  });

  elements.newQuestionButton?.addEventListener("click", async () => {
    await startPractice();
  });

  renderAudit();
  renderLegend();
  render();
})();
