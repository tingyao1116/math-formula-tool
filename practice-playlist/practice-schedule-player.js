(() => {
  const toolkit = window.formulaToolkit || null;
  const practiceStore = window.formulaPracticeStore || null;
  const practiceLibrary = window.practiceLibraryStore || null;
  const generatorLoader = window.practiceGeneratorLoader || null;
  const scheduleData = window.practiceScheduleData || null;
  const progressStore = window.practiceProgressStore || null;

  if (!toolkit || !practiceStore || !practiceLibrary || !scheduleData) {
    console.warn("schedule player dependencies not loaded");
    return;
  }

  const elements = {
    gradeSelect: document.getElementById("playerGradeSelect"),
    scheduleList: document.getElementById("schedulePlaylistList"),
    calendarSection: document.getElementById("scheduleCalendarSection"),
    calPrevMonth: document.getElementById("calPrevMonth"),
    calNextMonth: document.getElementById("calNextMonth"),
    calMonthLabel: document.getElementById("calMonthLabel"),
    calGrid: document.getElementById("calGrid"),
    calDayLabel: document.getElementById("calDayLabel"),
    title: document.getElementById("playlistPlayerTitle"),
    meta: document.getElementById("playlistPlayerMeta"),
    description: document.getElementById("playlistPlayerDescription"),
    status: document.getElementById("playlistPlayerStatus"),
    practiceCount: document.getElementById("playlistPlayerPracticeCount"),
    practiceList: document.getElementById("playlistPlayerPracticeList"),
    hint: document.getElementById("playlistPlayerHint"),
    card: document.getElementById("playlistPlayerCard"),
    answerPanel: document.getElementById("playlistPlayerAnswerPanel"),
    prevPractice: document.getElementById("playlistPrevPracticeButton"),
    nextPractice: document.getElementById("playlistNextPracticeButton"),
    generate: document.getElementById("playlistGenerateButton"),
  };

  const state = {
    scheduleId: "",
    selectedDate: "",
    practiceId: "",
    generated: null,
    questionIndex: 0,
    answerVisible: false,
    detailVisible: false,
    calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth(),
    loading: false,
  };

  const WEEK_HEADERS = ["日", "一", "二", "三", "四", "五", "六"];
  const MONTH_NAMES = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseDate(value) {
    return new Date(`${value}T12:00:00`);
  }

  function toDateStr(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  function dayDiff(startDate, endDate) {
    return Math.max(0, Math.round((parseDate(endDate) - parseDate(startDate)) / 86400000));
  }

  function eachDate(startDate, endDate, callback) {
    let cursor = parseDate(startDate);
    const end = parseDate(endDate);
    while (cursor <= end) {
      callback(toDateStr(cursor));
      cursor = addDays(cursor, 1);
    }
  }

  function getPeriod(periodId) {
    return (scheduleData.periods || []).find((period) => period.id === periodId) || null;
  }

  function splitPeriod(period) {
    const total = dayDiff(period.startDate, period.endDate);
    const firstEnd = addDays(parseDate(period.startDate), Math.floor(total / 2));
    const secondStart = addDays(firstEnd, 1);
    return {
      firstHalf: { startDate: period.startDate, endDate: toDateStr(firstEnd) },
      secondHalf: { startDate: toDateStr(secondStart), endDate: period.endDate },
    };
  }

  function getBlocks(schedule) {
    if (!schedule) return [];
    if (Array.isArray(schedule.weeks)) {
      return schedule.weeks
        .map((week) => ({
          id: `${schedule.id}:week-${week.week}`,
          label: `第 ${week.week} 週`,
          title: week.title || `第 ${week.week} 週`,
          mode: week.mode || "infinite-practice",
          startDate: week.dateRange?.startDate || "",
          endDate: week.dateRange?.endDate || week.dateRange?.startDate || "",
          chapterCodes: week.chapterCodes || [],
          practiceIds: week.practiceIds || [],
          teachingFocus: week.teachingFocus || [],
        }))
        .filter((block) => block.startDate && block.endDate);
    }

    if (Array.isArray(schedule.periodPlans)) {
      const blocks = [];
      for (const plan of schedule.periodPlans) {
        const period = getPeriod(plan.periodId);
        if (!period) continue;
        const ranges = splitPeriod(period);
        for (const key of ["firstHalf", "secondHalf"]) {
          const half = plan[key];
          if (!half) continue;
          const range = ranges[key];
          blocks.push({
            id: `${schedule.id}:${plan.periodId}:${key}`,
            label: `${period.title} ${key === "firstHalf" ? "前半段" : "後半段"}`,
            title: half.title || plan.scopeTitle || period.title,
            mode: half.mode || (key === "firstHalf" ? "infinite-practice" : "question-bank"),
            startDate: range.startDate,
            endDate: range.endDate,
            chapterCodes: half.chapterCodes || [],
            practiceIds: half.practiceIds || [],
          });
        }
      }
      return blocks;
    }

    return [];
  }

  function getSchedules() {
    return (scheduleData.schedules || []).map((schedule) => ({
      ...schedule,
      blocks: getBlocks(schedule),
    }));
  }

  function syncGradeOptions() {
    if (!elements.gradeSelect) return;
    const grades = Array.from(new Set(getSchedules().map((schedule) => schedule.grade || "未分級"))).filter(Boolean);
    const currentValue = grades.includes(elements.gradeSelect.value) ? elements.gradeSelect.value : grades[0] || "";
    elements.gradeSelect.innerHTML = grades
      .map((grade) => `<option value="${escapeHtml(grade)}">${escapeHtml(grade)}</option>`)
      .join("");
    elements.gradeSelect.value = currentValue;
  }

  function getActiveSchedule() {
    return getSchedules().find((schedule) => schedule.id === state.scheduleId) || null;
  }

  function buildDateMap(schedule) {
    const map = {};
    for (const block of schedule?.blocks || []) {
      eachDate(block.startDate, block.endDate, (date) => {
        map[date] = block;
      });
    }
    return map;
  }

  function getActiveBlock() {
    const schedule = getActiveSchedule();
    if (!schedule) return null;
    return buildDateMap(schedule)[state.selectedDate] || schedule.blocks[0] || null;
  }

  function getActivePracticeIds() {
    return getActiveBlock()?.practiceIds || [];
  }

  function getPracticeRecord(practiceId) {
    return practiceLibrary.byId?.[practiceId] || null;
  }

  function resetGenerated() {
    state.generated = null;
    state.questionIndex = 0;
    state.answerVisible = false;
    state.detailVisible = false;
  }

  function normalizeGenerated(result) {
    const normalized = toolkit.normalizeGeneratedPracticeResult?.(result) || result || {};
    return {
      intro: String(normalized.intro || "").trim(),
      questions: Array.isArray(normalized.questions) ? normalized.questions : [],
      summaryAnswers: Array.isArray(normalized.summaryAnswers) ? normalized.summaryAnswers : [],
      answers: Array.isArray(normalized.answers) ? normalized.answers : [],
    };
  }

  async function ensureConfig(record) {
    let config = practiceStore.getConfig?.(record.id);
    if (config?.generate) return config;
    if (generatorLoader?.ensureForPractice) await generatorLoader.ensureForPractice(record);
    return practiceStore.getConfig?.(record.id) || null;
  }

  function selectDate(schedule, date) {
    const map = buildDateMap(schedule);
    const nextDate = map[date] ? date : schedule.blocks[0]?.startDate || "";
    const block = map[nextDate] || schedule.blocks[0] || null;
    state.selectedDate = nextDate;
    state.practiceId = block?.practiceIds?.[0] || "";
    resetGenerated();
    if (nextDate) {
      const parsed = parseDate(nextDate);
      state.calYear = parsed.getFullYear();
      state.calMonth = parsed.getMonth();
    }
  }

  async function generateCurrentPractice() {
    const schedule = getActiveSchedule();
    const record = getPracticeRecord(state.practiceId);
    if (!schedule || !record) return;

    state.loading = true;
    if (elements.generate) elements.generate.disabled = true;
    if (elements.hint) elements.hint.textContent = "正在出題...";

    try {
      const config = await ensureConfig(record);
      if (!config || typeof config.generate !== "function") {
        state.generated = null;
        if (elements.hint) elements.hint.textContent = "這個題型目前找不到可用的出題函數。";
        renderCard();
        return;
      }
      const runtimeConfig = { ...config, questionCount: Math.max(1, Number(schedule.defaultQuestionCount) || 5) };
      state.generated = normalizeGenerated(runtimeConfig.generate.call(runtimeConfig, record) || {});
      state.questionIndex = 0;
      state.answerVisible = false;
      state.detailVisible = false;
      if (elements.hint) elements.hint.textContent = "已出題，可以開始練習。";
    } catch (error) {
      state.generated = null;
      if (elements.hint) elements.hint.textContent = `出題失敗：${error.message || error}`;
    } finally {
      state.loading = false;
      if (elements.generate) elements.generate.disabled = !state.practiceId;
      renderCard();
    }
  }

  function renderScheduleList() {
    if (!elements.scheduleList) return;
    syncGradeOptions();

    const selectedGrade = elements.gradeSelect?.value || "";
    const schedules = getSchedules().filter((schedule) => schedule.grade === selectedGrade);

    if (!schedules.length) {
      elements.scheduleList.innerHTML = `<p class="detail-note">目前沒有日程型安排。</p>`;
      return;
    }

    elements.scheduleList.innerHTML = schedules.map((schedule) => `
      <button type="button"
        class="playlist-player-card${schedule.id === state.scheduleId ? " is-active" : ""}"
        data-schedule-v2-id="${escapeHtml(schedule.id)}">
        <strong>${escapeHtml(schedule.title)}</strong>
        <p class="detail-note">${escapeHtml(schedule.grade || "未分級")}｜${schedule.blocks.length} 個區段</p>
        ${schedule.purpose ? `<p>${escapeHtml(schedule.purpose)}</p>` : ""}
      </button>
    `).join("");

    elements.scheduleList.querySelectorAll("[data-schedule-v2-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        state.scheduleId = button.getAttribute("data-schedule-v2-id");
        const schedule = getActiveSchedule();
        selectDate(schedule, schedule?.blocks?.[0]?.startDate || "");
        render();
        if (state.practiceId) await generateCurrentPractice();
      });
    });
  }

  function renderCalendar() {
    const schedule = getActiveSchedule();
    if (!elements.calendarSection) return;
    if (!schedule) {
      elements.calendarSection.hidden = true;
      return;
    }

    elements.calendarSection.hidden = false;
    const map = buildDateMap(schedule);
    if (elements.calMonthLabel) elements.calMonthLabel.textContent = `${state.calYear} 年 ${MONTH_NAMES[state.calMonth]}`;

    const firstDay = new Date(state.calYear, state.calMonth, 1);
    const lastDay = new Date(state.calYear, state.calMonth + 1, 0);
    let html = WEEK_HEADERS.map((label) => `<div class="cal-header">${label}</div>`).join("");
    for (let index = 0; index < firstDay.getDay(); index += 1) html += `<div class="cal-day other-month"></div>`;

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      const currentDate = `${state.calYear}-${String(state.calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const block = map[currentDate];
      const classes = ["cal-day"];
      if (block) classes.push("has-task");
      if (currentDate === state.selectedDate) classes.push("is-selected");
      if (block && progressStore) {
        const progress = progressStore.getDayProgress(schedule.id, currentDate, block.practiceIds || []);
        if (progress.total > 0 && progress.done === progress.total) classes.push("day-done");
        else if (progress.done > 0) classes.push("day-partial");
      }
      const attr = block ? ` data-schedule-date="${escapeHtml(currentDate)}"` : "";
      html += `<div class="${classes.join(" ")}"${attr}>${day}</div>`;
    }

    if (elements.calGrid) {
      elements.calGrid.innerHTML = html;
      elements.calGrid.querySelectorAll("[data-schedule-date]").forEach((button) => {
        button.addEventListener("click", async () => {
          selectDate(schedule, button.getAttribute("data-schedule-date"));
          render();
          if (state.practiceId) await generateCurrentPractice();
        });
      });
    }

    const block = map[state.selectedDate];
    if (elements.calDayLabel) {
      elements.calDayLabel.textContent = block
        ? `${state.selectedDate}：${block.label}｜${block.title}`
        : "點選有任務的日期開始練習";
    }
  }

  function renderHeader() {
    const schedule = getActiveSchedule();
    if (!schedule) return;
    const block = getActiveBlock();
    if (elements.title) elements.title.textContent = schedule.title;
    if (elements.meta) elements.meta.textContent = `${schedule.grade || "未分級"}｜日程型｜${schedule.blocks.length} 個區段`;
    if (elements.description) elements.description.textContent = schedule.purpose || "";
    if (elements.status) {
      elements.status.textContent = block
        ? `${block.label}：${block.title}（${block.mode === "question-bank" ? "題庫練習" : "無限練習"}）`
        : "這份日程目前沒有可用區段。";
    }
  }

  function renderPracticeList() {
    const schedule = getActiveSchedule();
    if (!schedule) return;
    const ids = getActivePracticeIds();
    if (elements.practiceCount) elements.practiceCount.textContent = `${ids.length} 題型`;
    if (!elements.practiceList) return;

    if (!ids.length) {
      elements.practiceList.innerHTML = `<p class="detail-note">這個日程區段目前沒有題型。</p>`;
      return;
    }

    elements.practiceList.innerHTML = ids.map((id, index) => {
      const record = getPracticeRecord(id);
      const done = progressStore?.isCompleted(schedule.id, state.selectedDate, id);
      return `
        <button type="button"
          class="playlist-player-card${id === state.practiceId ? " is-active" : ""}"
          data-schedule-v2-practice-id="${escapeHtml(id)}">
          <strong>#${index + 1} ${escapeHtml(record?.title || id)}${done ? " ✓" : ""}</strong>
          <p>${escapeHtml(record?.chapterCode || "未分章")}｜${escapeHtml(record?.difficulty || "未分難度")}</p>
          <div class="detail-note">${escapeHtml(id)}</div>
        </button>`;
    }).join("");

    elements.practiceList.querySelectorAll("[data-schedule-v2-practice-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        state.practiceId = button.getAttribute("data-schedule-v2-practice-id");
        resetGenerated();
        renderPracticeList();
        renderCard();
        await generateCurrentPractice();
      });
    });
  }

  function renderCard() {
    const schedule = getActiveSchedule();
    const record = getPracticeRecord(state.practiceId);

    if (!schedule || !record) {
      if (elements.card) {
        elements.card.className = "ability-session-card is-empty";
        elements.card.innerHTML = `<p>請先選擇一份日程。</p>`;
      }
      if (elements.answerPanel) elements.answerPanel.hidden = true;
      return;
    }

    if (!state.generated || !state.generated.questions.length) {
      if (elements.card) {
        elements.card.className = "ability-session-card is-empty";
        elements.card.innerHTML = `
          <p><strong>${escapeHtml(record.title || record.id)}</strong></p>
          <p>按「重新出題」或重新選一次題型即可產生題目。</p>`;
      }
      if (elements.answerPanel) elements.answerPanel.hidden = true;
      return;
    }

    const index = Math.max(0, Math.min(state.questionIndex, state.generated.questions.length - 1));
    const question = state.generated.questions[index] || "";
    const summaryAnswer = state.generated.summaryAnswers[index] || "";
    const detailAnswer = state.generated.answers[index] || summaryAnswer;

    if (elements.card) {
      elements.card.className = "ability-session-card";
      elements.card.innerHTML = `
        <div class="ability-session-card__meta">
          <span class="meta-chip">${escapeHtml(record.chapterCode || "未分章")}</span>
          <span class="meta-chip">${escapeHtml(record.difficulty || "未分難度")}</span>
          <span class="meta-chip">第 ${index + 1} / ${state.generated.questions.length} 題</span>
          <span class="meta-chip">${escapeHtml(state.selectedDate)}</span>
        </div>
        ${state.generated.intro ? `<p class="practice-intro">${toolkit.renderRichTextLine(state.generated.intro)}</p>` : ""}
        <div class="interactive-output">${toolkit.renderRichTextLine(question)}</div>
        <div class="ability-session-card__actions">
          <button id="scheduleV2PrevQuestionButton" class="ghost-button" type="button">上一題</button>
          <button id="scheduleV2NextQuestionButton" class="ghost-button" type="button">下一題</button>
          <button id="scheduleV2ToggleAnswerButton" class="ghost-button" type="button">${state.answerVisible ? "隱藏答案" : "看答案"}</button>
          <button id="scheduleV2ToggleDetailButton" class="ghost-button" type="button">${state.detailVisible ? "隱藏詳解" : "看詳解"}</button>
          <button id="scheduleV2MarkDoneButton" class="ghost-button" type="button">標記完成</button>
        </div>`;
    }

    if (elements.answerPanel) {
      elements.answerPanel.hidden = !state.answerVisible && !state.detailVisible;
      elements.answerPanel.innerHTML = `
        <div class="ability-feedback-panel__body">
          ${state.answerVisible ? `<p><strong>答案：</strong>${toolkit.renderRichTextLine(summaryAnswer || "尚無答案")}</p>` : ""}
          ${state.detailVisible ? `<p><strong>詳解：</strong>${toolkit.renderRichTextLine(detailAnswer || "尚無詳解")}</p>` : ""}
        </div>`;
    }

    document.getElementById("scheduleV2PrevQuestionButton")?.addEventListener("click", () => {
      state.questionIndex = Math.max(0, index - 1);
      renderCard();
    });
    document.getElementById("scheduleV2NextQuestionButton")?.addEventListener("click", () => {
      state.questionIndex = Math.min(state.generated.questions.length - 1, index + 1);
      renderCard();
    });
    document.getElementById("scheduleV2ToggleAnswerButton")?.addEventListener("click", () => {
      state.answerVisible = !state.answerVisible;
      renderCard();
    });
    document.getElementById("scheduleV2ToggleDetailButton")?.addEventListener("click", () => {
      state.detailVisible = !state.detailVisible;
      renderCard();
    });
    document.getElementById("scheduleV2MarkDoneButton")?.addEventListener("click", () => {
      progressStore?.mark(schedule.id, state.selectedDate, state.practiceId);
      render();
    });
  }

  async function movePractice(step) {
    if (!state.scheduleId) return;
    const ids = getActivePracticeIds();
    const index = ids.indexOf(state.practiceId);
    const nextIndex = index + step;
    if (nextIndex < 0 || nextIndex >= ids.length) return;
    state.practiceId = ids[nextIndex];
    resetGenerated();
    renderPracticeList();
    renderCard();
    await generateCurrentPractice();
  }

  function render() {
    renderScheduleList();
    renderHeader();
    renderCalendar();
    renderPracticeList();
    renderCard();
    const hasPractice = Boolean(state.scheduleId && state.practiceId);
    if (elements.prevPractice) elements.prevPractice.disabled = !hasPractice;
    if (elements.nextPractice) elements.nextPractice.disabled = !hasPractice;
    if (elements.generate) elements.generate.disabled = !hasPractice || state.loading;
  }

  elements.gradeSelect?.addEventListener("change", renderScheduleList);
  elements.calPrevMonth?.addEventListener("click", () => {
    if (!state.scheduleId) return;
    if (state.calMonth === 0) {
      state.calYear -= 1;
      state.calMonth = 11;
    } else {
      state.calMonth -= 1;
    }
    renderCalendar();
  });
  elements.calNextMonth?.addEventListener("click", () => {
    if (!state.scheduleId) return;
    if (state.calMonth === 11) {
      state.calYear += 1;
      state.calMonth = 0;
    } else {
      state.calMonth += 1;
    }
    renderCalendar();
  });
  elements.prevPractice?.addEventListener("click", () => movePractice(-1));
  elements.nextPractice?.addEventListener("click", () => movePractice(1));
  elements.generate?.addEventListener("click", () => {
    if (state.scheduleId) generateCurrentPractice();
  });

  syncGradeOptions();
  renderScheduleList();
})();
