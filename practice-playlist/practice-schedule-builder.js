(() => {
  const scheduleData = window.practiceScheduleData || null;
  if (!scheduleData) {
    console.warn("schedule data not loaded for builder");
    return;
  }

  const layout = document.querySelector(".playlist-layout");
  const sidebar = document.querySelector(".playlist-layout .sidebar");
  const content = document.querySelector(".playlist-layout .content");
  const mountTarget = content || sidebar;
  if (!mountTarget || document.getElementById("practiceScheduleBuilderPanel")) return;

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

  const schedules = (scheduleData.schedules || []).map((schedule) => ({
    ...schedule,
    blocks: getBlocks(schedule),
  }));

  let activeScheduleId = schedules[0]?.id || "";

  const panel = document.createElement("section");
  panel.id = "practiceScheduleBuilderPanel";
  panel.className = "panel";
  panel.innerHTML = `
    <div class="skill-tree-toolbar">
      <h2>日程型安排</h2>
      <span class="meta-chip">${escapeHtml(scheduleData.meta?.schoolYearId || "")}</span>
    </div>
    <p class="detail-note">這裡只顯示日程型資料，不會改動目前任務型清單。前半段是無限練習，後半段可接題庫練習。</p>
    <div id="scheduleBuilderTabs" class="playlist-player-list"></div>
    <div id="scheduleBuilderPeriods"></div>
    <div id="scheduleBuilderBlocks"></div>
  `;

  panel.setAttribute("data-practice-mode-section", "schedule");

  const firstPanel = mountTarget.querySelector(".panel");
  if (firstPanel) mountTarget.insertBefore(panel, firstPanel);
  else mountTarget.appendChild(panel);

  if (layout) layout.setAttribute("data-practice-mode-ready", "true");

  const tabsEl = panel.querySelector("#scheduleBuilderTabs");
  const periodsEl = panel.querySelector("#scheduleBuilderPeriods");
  const blocksEl = panel.querySelector("#scheduleBuilderBlocks");

  function modeLabel(mode) {
    return mode === "question-bank" ? "題庫練習" : "無限練習";
  }

  function renderTabs() {
    tabsEl.innerHTML = schedules.length
      ? schedules.map((schedule) => `
          <button type="button"
            class="playlist-player-card${schedule.id === activeScheduleId ? " is-active" : ""}"
            data-builder-schedule="${escapeHtml(schedule.id)}">
            <strong>${escapeHtml(schedule.title)}</strong>
            <p class="detail-note">${escapeHtml(schedule.grade || "未分級")}｜${schedule.blocks.length} 個日期區段</p>
          </button>
        `).join("")
      : `<p class="detail-note">目前沒有日程型資料。</p>`;

    tabsEl.querySelectorAll("[data-builder-schedule]").forEach((button) => {
      button.addEventListener("click", () => {
        activeScheduleId = button.getAttribute("data-builder-schedule");
        render();
      });
    });
  }

  function renderPeriods() {
    periodsEl.innerHTML = `
      <details class="playlist-schedule-details">
        <summary>查看學年度時段</summary>
        <div class="playlist-selected-list">
          ${(scheduleData.periods || []).map((period) => `
            <div class="playlist-selected-card">
              <div class="playlist-selected-card__body">
                <div class="playlist-selected-card__title-row">
                  <strong>${escapeHtml(period.title)}</strong>
                  <span class="meta-chip">${escapeHtml(period.kind || "")}</span>
                </div>
                <div class="detail-note">${escapeHtml(period.startDate)} 到 ${escapeHtml(period.endDate)}</div>
                ${period.note ? `<p>${escapeHtml(period.note)}</p>` : ""}
              </div>
            </div>
          `).join("")}
        </div>
      </details>
    `;
  }

  function renderBlocks() {
    const schedule = schedules.find((item) => item.id === activeScheduleId) || schedules[0] || null;
    if (!schedule) {
      blocksEl.innerHTML = "";
      return;
    }

    blocksEl.innerHTML = `
      <div class="skill-tree-toolbar">
        <h3>${escapeHtml(schedule.title)}</h3>
        <span class="meta-chip">${escapeHtml(schedule.grade || "未分級")}</span>
      </div>
      ${schedule.purpose ? `<p class="detail-note">${escapeHtml(schedule.purpose)}</p>` : ""}
      <div class="playlist-selected-list">
        ${schedule.blocks.map((block) => `
          <div class="playlist-selected-card">
            <div class="playlist-selected-card__body">
              <div class="playlist-selected-card__title-row">
                <strong>${escapeHtml(block.label)}｜${escapeHtml(block.title)}</strong>
                <span class="meta-chip">${modeLabel(block.mode)}</span>
              </div>
              <div class="detail-note">${escapeHtml(block.startDate)} 到 ${escapeHtml(block.endDate)}</div>
              <div class="detail-note">章節：${escapeHtml((block.chapterCodes || []).join("、") || "未設定")}</div>
              <div class="detail-note">題型：${(block.practiceIds || []).length} 個</div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function render() {
    renderTabs();
    renderPeriods();
    renderBlocks();
  }

  render();
})();
