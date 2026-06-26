(() => {
  const toolkit = window.formulaToolkit || null;
  const store = window.formulaDataStore || null;
  const practiceStore = window.formulaPracticeStore || null;
  const practiceLibrary = window.practiceLibraryStore || null;
  const generatorLoader = window.practiceGeneratorLoader || null;
  const abilityStore = window.practiceAbilityMapStore || null;
  const questStore = window.practiceQuestCampaignStore || null;

  if (!toolkit || !store || !practiceStore || !practiceLibrary || !abilityStore || !questStore) {
    console.warn("quest practice dependencies not loaded");
    return;
  }

  const PROGRESS_STORAGE_KEY = "math-formula-tool-ability-stage-progress-v2";
  const ACTIVE_MISSION_STORAGE_KEY = "math-formula-tool-quest-active-mission-v1";

  const elements = {
    mainQuestList: document.getElementById("mainQuestList"),
    sideQuestList: document.getElementById("sideQuestList"),
    mainQuestProgress: document.getElementById("mainQuestProgress"),
    sideQuestProgress: document.getElementById("sideQuestProgress"),
    questTitle: document.getElementById("questTitle"),
    questStatus: document.getElementById("questStatus"),
    questMapLabel: document.getElementById("questMapLabel"),
    questStoryHook: document.getElementById("questStoryHook"),
    questSummary: document.getElementById("questSummary"),
    questMasteryLabel: document.getElementById("questMasteryLabel"),
    questMasteryBar: document.getElementById("questMasteryBar"),
    questSkillTags: document.getElementById("questSkillTags"),
    questPrerequisites: document.getElementById("questPrerequisites"),
    questRewardText: document.getElementById("questRewardText"),
    questSessionHint: document.getElementById("questSessionHint"),
    questSessionCard: document.getElementById("questSessionCard"),
    questFeedbackPanel: document.getElementById("questFeedbackPanel"),
    questMistakePanel: document.getElementById("questMistakePanel"),
    questRecommendationPanel: document.getElementById("questRecommendationPanel"),
    questStartButton: document.getElementById("questStartButton"),
    questNextPuzzleButton: document.getElementById("questNextPuzzleButton"),
  };

  const masteryStages = abilityStore.getMasteryStages?.() || [];
  const mistakeTags = abilityStore.getMistakeTags?.() || [];
  const chapterOptionByCode = new Map(
    (store.getChapterOptions?.() || []).map((entry) => [String(entry?.code || "").trim(), entry]),
  );

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
      // ignore
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
      // ignore
    }
  }

  function inferBundleKey(record) {
    const explicit = String(record?.generatorBundle || record?.bundleKey || "").trim();
    if (explicit) return explicit;
    const chapterCode = String(record?.chapterCode || "").trim();
    if (!chapterCode) return "";
    const bundles = window.practiceGeneratorBundles || {};
    return (
      Object.entries(bundles).find(([, bundle]) => {
        const prefixes = Array.isArray(bundle?.chapterPrefixes) ? bundle.chapterPrefixes : [];
        return prefixes.some((prefix) => chapterCode.startsWith(String(prefix || "")));
      })?.[0] || ""
    );
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
      bundleKey: inferBundleKey(record),
      record,
    };
  }

  const skillList = abilityStore.getSkills?.() || [];
  const stageList = abilityStore.getAbilityStages?.() || [];

  const decoratedSkillById = new Map(
    skillList
      .map((skill) => ({
        ...skill,
        practiceRefs: (Array.isArray(skill.practiceIds) ? skill.practiceIds : [])
          .map(buildPracticeRef)
          .filter((entry) => entry && (practiceStore.getConfig?.(entry.id) || entry.bundleKey)),
      }))
      .filter((skill) => skill.practiceRefs.length > 0)
      .map((skill) => [skill.id, skill]),
  );

  const decoratedStages = stageList
    .map((stage) => {
      const skills = (Array.isArray(stage.skillIds) ? stage.skillIds : [])
        .map((skillId) => decoratedSkillById.get(skillId))
        .filter(Boolean);
      return {
        ...stage,
        skills,
        entrySkill: decoratedSkillById.get(stage.entrySkillId) || skills[0] || null,
      };
    })
    .filter((stage) => stage.skills.length > 0);

  const stageById = new Map(decoratedStages.map((stage) => [stage.id, stage]));
  const missions = (questStore.getMissions?.() || [])
    .map((mission) => {
      const stage = stageById.get(mission.stageId);
      if (!stage) return null;
      return { ...mission, stage };
    })
    .filter(Boolean);
  const missionById = new Map(missions.map((mission) => [mission.id, mission]));
  const defaultMissionId =
    questStore.meta?.recommendedMissionId || missions.find((mission) => mission.recommended)?.id || missions[0]?.id || "";

  const state = {
    progress: loadJsonStorage(PROGRESS_STORAGE_KEY, {}),
    selectedMissionId: loadTextStorage(ACTIVE_MISSION_STORAGE_KEY, defaultMissionId),
    session: null,
    submitting: false,
  };

  if (!missionById.has(state.selectedMissionId)) {
    state.selectedMissionId = defaultMissionId;
  }

  function getStageProgress(stageId) {
    const current = state.progress[stageId];
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

  function isMissionCleared(mission) {
    const mastery = getMasteryStage(getStageProgress(mission.stageId));
    return ["stable", "advance-ready", "mastered"].includes(mastery.id);
  }

  function isMissionUnlocked(mission) {
    return (mission.prerequisiteMissionIds || []).every((missionId) => {
      const requiredMission = missionById.get(missionId);
      return requiredMission ? isMissionCleared(requiredMission) : true;
    });
  }

  function getMissionStatusLabel(mission) {
    if (!isMissionUnlocked(mission)) return "尚未解鎖";
    if (isMissionCleared(mission)) return "任務通關";
    return getMasteryStage(getStageProgress(mission.stageId)).label;
  }

  function getRecommendedMission() {
    return (
      missions.find((mission) => mission.type === "main" && isMissionUnlocked(mission) && !isMissionCleared(mission)) ||
      missions.find((mission) => isMissionUnlocked(mission)) ||
      missions[0] ||
      null
    );
  }

  function shuffle(list) {
    const rows = Array.isArray(list) ? list.slice() : [];
    for (let index = rows.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [rows[index], rows[swapIndex]] = [rows[swapIndex], rows[index]];
    }
    return rows;
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
      const answer = String(answers[index] || summaryAnswer).trim();
      if (!question || !summaryAnswer) continue;
      rows.push({ question, summaryAnswer, answer });
    }
    return rows;
  }

  async function buildSessionForMission(mission) {
    const stage = mission?.stage;
    if (!stage) return null;

    for (const skill of shuffle(stage.skills)) {
      for (const practiceRef of shuffle(skill.practiceRefs)) {
        try {
          const config = await ensurePracticeConfig(practiceRef);
          if (!config || typeof config.generate !== "function") continue;
          const result = config.generate(practiceRef.record) || {};
          const rows = normalizeGeneratedRows(result);
          if (!rows.length) continue;
          const picked = rows[Math.floor(Math.random() * rows.length)];
          return {
            missionId: mission.id,
            stageId: mission.stageId,
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
            userAnswer: "",
            manuallyCorrected: false,
            mistakeTagId: "",
            mistakeTagged: false,
            recommendedMissionId: "",
          };
        } catch (error) {
          console.warn("Unable to generate quest practice item", practiceRef.id, error);
        }
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
      .replace(/^答案[:：\s]*/u, "")
      .replace(/\\\(|\\\)|\\\[|\\\]/g, "")
      .replace(/\$/g, "")
      .replace(/\\times/g, "*")
      .replace(/[×xX]/g, "*")
      .replace(/\\div/g, "/")
      .replace(/[÷／]/g, "/")
      .replace(/\\ge/g, ">=")
      .replace(/\\le/g, "<=")
      .replace(/[≥]/g, ">=")
      .replace(/[≤]/g, "<=")
      .replace(/[＝]/g, "=")
      .replace(/[－﹣−]/g, "-")
      .replace(/[（]/g, "(")
      .replace(/[）]/g, ")")
      .replace(/[，、；;]/g, ",");
    value = normalizeFractionLatex(value);
    value = value.replace(/\(([-\d]+)\)\/\(([-\d]+)\)/g, "$1/$2");
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
    if (normalized.includes(",")) {
      const sorted = normalized
        .split(",")
        .map((piece) => piece.trim())
        .filter(Boolean)
        .sort()
        .join("|");
      if (sorted) variants.add(sorted);
    }
    return Array.from(variants);
  }

  function canonicalizeUserAnswer(answerText) {
    const normalized = normalizeAnswerText(answerText);
    if (!normalized) return "";
    if (normalized.includes(",")) {
      return normalized
        .split(",")
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

  function updateProgressAfterResult(stageId, isCorrect) {
    const current = getStageProgress(stageId);
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
    state.progress[stageId] = next;
    saveJsonStorage(PROGRESS_STORAGE_KEY, state.progress);
    return next;
  }

  function applyManualCorrectToProgress(stageId) {
    const current = getStageProgress(stageId);
    const next = {
      ...current,
      correct: Math.max(0, Number(current.correct || 0) + 1),
      wrong: Math.max(0, Number(current.wrong || 0) - 1),
      score: Math.max(0, Number(current.score || 0) + 3),
      lastResult: "manual-correct",
      updatedAt: new Date().toISOString(),
    };
    state.progress[stageId] = next;
    saveJsonStorage(PROGRESS_STORAGE_KEY, state.progress);
    return next;
  }

  function recordMistakeTag(stageId, tagId) {
    if (!stageId || !tagId) return;
    const current = getStageProgress(stageId);
    const counts = { ...(current.mistakeCounts || {}) };
    counts[tagId] = Number(counts[tagId] || 0) + 1;
    state.progress[stageId] = {
      ...current,
      mistakeCounts: counts,
      updatedAt: new Date().toISOString(),
    };
    saveJsonStorage(PROGRESS_STORAGE_KEY, state.progress);
  }

  function recommendNextMission(mission, isCorrect, mistakeTagId = "") {
    if (!mission) return null;
    if (isCorrect) {
      const mastery = getMasteryStage(getStageProgress(mission.stageId));
      if (["advance-ready", "mastered"].includes(mastery.id)) {
        return (mission.nextMissionIds || []).map((missionId) => missionById.get(missionId)).find(Boolean) || mission;
      }
      return mission;
    }
    if (mistakeTagId === "concept" || mistakeTagId === "misread") {
      return (
        (mission.prerequisiteMissionIds || []).map((missionId) => missionById.get(missionId)).find(Boolean) || mission
      );
    }
    return mission;
  }

  function renderTagList(target, labels, emptyText) {
    const values = (Array.isArray(labels) ? labels : []).filter(Boolean);
    target.innerHTML = values.length
      ? values.map((value) => `<span class="tag">${escapeHtml(value)}</span>`).join("")
      : `<span class="ability-empty-text">${escapeHtml(emptyText)}</span>`;
  }

  function renderMissionList(type) {
    const target = type === "main" ? elements.mainQuestList : elements.sideQuestList;
    const targetMeta = type === "main" ? elements.mainQuestProgress : elements.sideQuestProgress;
    const list = missions.filter((mission) => mission.type === type);
    const clearedCount = list.filter(isMissionCleared).length;
    targetMeta.textContent = `${clearedCount}/${list.length} 已通關`;
    target.innerHTML = list
      .map((mission) => {
        const isActive = mission.id === state.selectedMissionId;
        const unlocked = isMissionUnlocked(mission);
        const recommended = getRecommendedMission()?.id === mission.id;
        return `
          <button
            type="button"
            class="ability-branch-card quest-card${isActive ? " is-active" : ""}"
            data-mission-id="${escapeHtml(mission.id)}"
            ${unlocked ? "" : "disabled"}
          >
            <div class="ability-branch-card__top quest-card__top">
              <strong>${escapeHtml(mission.title)}</strong>
              <span class="meta-chip">${escapeHtml(getMissionStatusLabel(mission))}</span>
            </div>
            <p>${escapeHtml(mission.summary)}</p>
            <div class="ability-branch-card__meta quest-card__meta">
              <span>${escapeHtml(mission.mapLabel)}</span>
              <span>${recommended ? "建議先走" : unlocked ? "可挑戰" : "尚未解鎖"}</span>
            </div>
          </button>
        `;
      })
      .join("");
  }

  function renderMissionDetail() {
    const mission = missionById.get(state.selectedMissionId) || getRecommendedMission();
    if (!mission) return;
    const progress = getStageProgress(mission.stageId);
    const mastery = getMasteryStage(progress);
    elements.questTitle.textContent = mission.title;
    elements.questStatus.textContent = `${getMissionStatusLabel(mission)} · ${progress.correct}/${progress.attempts || 0}`;
    elements.questMapLabel.textContent = mission.mapLabel;
    elements.questStoryHook.textContent = mission.storyHook;
    elements.questSummary.textContent = mission.summary;
    elements.questMasteryLabel.textContent = mastery.label;
    elements.questMasteryBar.style.width = `${getMasteryPercent(progress)}%`;
    elements.questRewardText.textContent = mission.rewardText;
    renderTagList(
      elements.questSkillTags,
      mission.stage.skills.map((skill) => skill.shortLabel || skill.title),
      "目前沒有可顯示的技能焦點。",
    );
    renderTagList(
      elements.questPrerequisites,
      mission.prerequisiteMissionIds.map((missionId) => missionById.get(missionId)?.title).filter(Boolean),
      "這是起始任務，可直接進入。",
    );
  }

  function renderSessionCard() {
    const mission = missionById.get(state.selectedMissionId) || null;
    const session = state.session;
    if (!mission) return;

    if (!session) {
      elements.questSessionCard.className = "ability-session-card is-empty";
      elements.questSessionCard.innerHTML = `
        <p>這個任務會從 ${escapeHtml(String(mission.stage.skills.length || 0))} 組技能節點中抽題，維持同能力連續練習。</p>
        <p>如果學生正在先修，可以直接走主線；如果卡在配方法或圖形判讀，再回去補支線。</p>
      `;
      elements.questFeedbackPanel.hidden = true;
      elements.questMistakePanel.hidden = true;
      elements.questRecommendationPanel.hidden = true;
      elements.questNextPuzzleButton.disabled = true;
      return;
    }

    elements.questSessionCard.className = "ability-session-card";
    elements.questSessionCard.innerHTML = `
      <div class="ability-session-card__meta">
        <span class="meta-chip">${escapeHtml(session.chapterLabel)}</span>
        <span class="meta-chip">${escapeHtml(session.practiceTitle)}</span>
      </div>
      ${session.intro ? `<p class="practice-intro">${toolkit.renderRichTextLine(session.intro)}</p>` : ""}
      <div class="interactive-output">${toolkit.renderRichTextLine(session.question)}</div>
      <label class="field ability-answer-field">
        <span>輸入你的答案</span>
        <input
          id="questAnswerInput"
          type="text"
          class="ability-answer-input"
          placeholder="例如 3/5、x=2、-4,7"
          ${session.checked ? "disabled" : ""}
        />
      </label>
      <div class="ability-session-card__actions">
        <button id="questCheckButton" class="ghost-button" type="button" ${session.checked ? "disabled" : ""}>提交答案</button>
      </div>
    `;
    elements.questNextPuzzleButton.disabled = false;

    const answerInput = document.getElementById("questAnswerInput");
    const checkButton = document.getElementById("questCheckButton");
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
    if (!session || !session.checked || session.isCorrect) {
      elements.questFeedbackPanel.hidden = true;
      return;
    }

    elements.questFeedbackPanel.hidden = false;
    elements.questFeedbackPanel.innerHTML = `
      <div class="ability-feedback-panel__badge is-wrong">先停一下</div>
      <div class="ability-feedback-panel__body">
        ${session.userAnswer ? `<p><strong>你輸入的是：</strong>${escapeHtml(session.userAnswer)}</p>` : ""}
        <p><strong>參考答案：</strong>${toolkit.renderRichTextLine(session.summaryAnswer)}</p>
        <p><strong>完整答案：</strong>${toolkit.renderRichTextLine(session.answer)}</p>
        <div class="ability-feedback-panel__actions">
          <button id="questManualCorrectButton" class="ghost-button" type="button">這題其實答對，手動改判</button>
        </div>
      </div>
    `;

    document.getElementById("questManualCorrectButton")?.addEventListener("click", async () => {
      await handleManualCorrect();
    });
  }

  function renderMistakePanel() {
    const session = state.session;
    if (!session || !session.checked || session.isCorrect) {
      elements.questMistakePanel.hidden = true;
      return;
    }

    elements.questMistakePanel.hidden = false;
    elements.questMistakePanel.innerHTML = `
      <h3>這題比較像哪一種錯誤？</h3>
      <div class="ability-mistake-panel__tags">
        ${mistakeTags
          .map(
            (tag) => `
              <button
                type="button"
                class="ghost-button ability-mistake-tag${session.mistakeTagId === tag.id ? " is-active" : ""}"
                data-mistake-tag="${escapeHtml(tag.id)}"
                ${session.mistakeTagged && session.mistakeTagId !== tag.id ? "disabled" : ""}
              >
                ${escapeHtml(tag.label)}
              </button>
            `,
          )
          .join("")}
      </div>
    `;

    elements.questMistakePanel.querySelectorAll("[data-mistake-tag]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!state.session || state.session.mistakeTagged) return;
        const tagId = String(button.getAttribute("data-mistake-tag") || "").trim();
        if (!tagId) return;
        const mission = missionById.get(state.session.missionId) || null;
        state.session.mistakeTagId = tagId;
        state.session.mistakeTagged = true;
        recordMistakeTag(state.session.stageId, tagId);
        state.session.recommendedMissionId = recommendNextMission(mission, false, tagId)?.id || state.session.missionId;
        renderMistakePanel();
        renderRecommendation();
      });
    });
  }

  function renderRecommendation() {
    const session = state.session;
    if (!session || !session.checked || session.isCorrect) {
      elements.questRecommendationPanel.hidden = true;
      return;
    }

    const currentMission = missionById.get(session.missionId) || null;
    const recommendedMission = missionById.get(session.recommendedMissionId || session.missionId) || currentMission;
    if (!currentMission || !recommendedMission) {
      elements.questRecommendationPanel.hidden = true;
      return;
    }

    let recommendationText = "先留在目前任務，把同能力再練幾題，節奏會最穩。";
    if (recommendedMission.id !== currentMission.id) {
      recommendationText = `建議先轉去「${recommendedMission.title}」補一下，再回來會更順。`;
    }

    elements.questRecommendationPanel.hidden = false;
    elements.questRecommendationPanel.innerHTML = `
      <h3>下一步建議</h3>
      <p>${escapeHtml(recommendationText)}</p>
      <div class="ability-feedback-panel__actions">
        <button id="questRepeatButton" class="ghost-button" type="button">同任務再練一題</button>
        <button
          id="questGoMissionButton"
          class="ghost-button"
          type="button"
          ${recommendedMission.id === currentMission.id ? "disabled" : ""}
        >
          前往建議任務
        </button>
      </div>
    `;

    document.getElementById("questRepeatButton")?.addEventListener("click", async () => {
      await startMission();
    });
    document.getElementById("questGoMissionButton")?.addEventListener("click", async () => {
      if (recommendedMission.id === currentMission.id) return;
      selectMission(recommendedMission.id);
      await startMission();
    });
  }

  function render() {
    renderMissionList("main");
    renderMissionList("side");
    renderMissionDetail();
    renderSessionCard();
    renderFeedback();
    renderMistakePanel();
    renderRecommendation();

    document.querySelectorAll("[data-mission-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const missionId = String(button.getAttribute("data-mission-id") || "").trim();
        selectMission(missionId);
      });
    });
  }

  function selectMission(missionId) {
    const mission = missionById.get(missionId);
    if (!mission || !isMissionUnlocked(mission)) return;
    state.selectedMissionId = missionId;
    state.session = null;
    saveTextStorage(ACTIVE_MISSION_STORAGE_KEY, missionId);
    render();
  }

  async function startMission() {
    const mission = missionById.get(state.selectedMissionId) || null;
    if (!mission) return;
    elements.questStartButton.disabled = true;
    elements.questNextPuzzleButton.disabled = true;
    elements.questSessionHint.textContent = "題目生成中，正在打開下一個機關……";
    const session = await buildSessionForMission(mission);
    state.session = session;
    if (!session) {
      elements.questSessionHint.textContent = "這個任務目前沒有成功抽出題目，請先換任務或回到能力入口檢查。";
    } else {
      elements.questSessionHint.textContent = "請直接輸入答案；答對後會自動切到下一題。";
    }
    elements.questStartButton.disabled = false;
    render();
  }

  async function handleCheckAnswer() {
    if (state.submitting || !state.session || state.session.checked) return;
    const input = document.getElementById("questAnswerInput");
    const userAnswer = String(input?.value || "").trim();
    if (!userAnswer) {
      elements.questSessionHint.textContent = "請先輸入答案。";
      input?.focus();
      return;
    }

    state.submitting = true;
    const session = state.session;
    const mission = missionById.get(session.missionId) || null;
    const isCorrect = isAnswerCorrect(session.summaryAnswer, userAnswer);
    updateProgressAfterResult(session.stageId, isCorrect);

    if (isCorrect) {
      state.submitting = false;
      state.session = null;
      elements.questSessionHint.textContent = "答對了，下一題已開啟。";
      render();
      await startMission();
      return;
    }

    state.session = {
      ...session,
      checked: true,
      isCorrect: false,
      userAnswer,
      manuallyCorrected: false,
      recommendedMissionId: recommendNextMission(mission, false, "")?.id || session.missionId,
    };
    state.submitting = false;
    render();
  }

  async function handleManualCorrect() {
    if (!state.session || !state.session.checked || state.session.isCorrect) return;
    applyManualCorrectToProgress(state.session.stageId);
    state.session = null;
    elements.questSessionHint.textContent = "已手動改判為正確，直接進下一題。";
    render();
    await startMission();
  }

  elements.questStartButton?.addEventListener("click", async () => {
    await startMission();
  });

  elements.questNextPuzzleButton?.addEventListener("click", async () => {
    await startMission();
  });

  render();
})();
