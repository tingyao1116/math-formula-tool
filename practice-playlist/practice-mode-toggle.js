(() => {
  const layout = document.querySelector(".playlist-layout");
  const sidebar = document.querySelector(".playlist-layout .sidebar");
  if (!layout || !sidebar || document.getElementById("practiceModeTogglePanel")) return;

  const isBuilder = Boolean(document.getElementById("playlistPracticeTableBody"));
  const isPlayer = Boolean(document.getElementById("taskPlaylistList") || document.getElementById("schedulePlaylistList"));
  if (!isBuilder && !isPlayer) return;

  const state = { mode: "task" };

  function makePanel() {
    const panel = document.createElement("section");
    panel.id = "practiceModeTogglePanel";
    panel.className = "panel practice-mode-toggle-panel";
    panel.innerHTML = `
      <h2>練習類型</h2>
      <div class="interactive-actions practice-mode-toggle">
        <button class="ghost-button is-active" type="button" data-practice-mode-button="task">任務型</button>
        <button class="ghost-button" type="button" data-practice-mode-button="schedule">日程型</button>
      </div>
      <p class="detail-note" id="practiceModeToggleHint">任務型：勾選題型，做成一份清單。</p>
    `;
    sidebar.insertBefore(panel, sidebar.firstElementChild);
    panel.querySelectorAll("[data-practice-mode-button]").forEach((button) => {
      button.addEventListener("click", () => setMode(button.getAttribute("data-practice-mode-button") || "task"));
    });
  }

  function closestPanel(id) {
    return document.getElementById(id)?.closest(".panel") || null;
  }

  function setHidden(node, hidden) {
    if (node) node.hidden = hidden;
  }

  function setMode(mode) {
    state.mode = mode === "schedule" ? "schedule" : "task";
    const isSchedule = state.mode === "schedule";

    document.querySelectorAll("[data-practice-mode-button]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-practice-mode-button") === state.mode);
    });

    const hint = document.getElementById("practiceModeToggleHint");
    if (hint) {
      hint.textContent = isSchedule
        ? "日程型：依日期與段考時段安排練習。"
        : "任務型：勾選題型，做成一份清單。";
    }

    if (isBuilder) {
      [
        "playlistTitleInput",
        "savePlaylistButton",
        "storedPlaylistList",
        "selectedPracticeList",
      ].forEach((id) => setHidden(closestPanel(id), isSchedule));
      document.querySelectorAll(".playlist-layout .content > .panel").forEach((panel) => {
        const isSchedulePanel = panel.id === "practiceScheduleBuilderPanel";
        panel.hidden = isSchedule ? !isSchedulePanel : isSchedulePanel;
      });
    }

    if (isPlayer) {
      setHidden(closestPanel("taskPlaylistList"), isSchedule);
      setHidden(closestPanel("schedulePlaylistList"), !isSchedule);
      setHidden(closestPanel("scheduleCalendarSection"), !isSchedule);
      setHidden(closestPanel("playerImportInput"), isSchedule);
      if (!isSchedule) {
        const calendar = document.getElementById("scheduleCalendarSection");
        if (calendar) calendar.hidden = true;
      }
    }
  }

  makePanel();
  setMode("task");
})();
