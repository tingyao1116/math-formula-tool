(() => {
  const toolkit         = window.formulaToolkit || null;
  const practiceStore   = window.formulaPracticeStore || null;
  const practiceLibrary = window.practiceLibraryStore || null;
  const generatorLoader = window.practiceGeneratorLoader || null;
  const playlistStore   = window.practicePlaylistStore || null;
  const progressStore   = window.practiceProgressStore || null;

  if (!toolkit || !practiceStore || !practiceLibrary || !playlistStore) {
    console.warn("playlist player dependencies not loaded");
    return;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  const elements = {
    playerGradeSelect:             document.getElementById("playerGradeSelect"),
    playerCategorySelect:          document.getElementById("playerCategorySelect"),
    taskPlaylistList:              document.getElementById("taskPlaylistList"),
    schedulePlaylistList:          document.getElementById("schedulePlaylistList"),
    scheduleCalendarSection:       document.getElementById("scheduleCalendarSection"),
    calPrevMonth:                  document.getElementById("calPrevMonth"),
    calNextMonth:                  document.getElementById("calNextMonth"),
    calMonthLabel:                 document.getElementById("calMonthLabel"),
    calGrid:                       document.getElementById("calGrid"),
    calDayLabel:                   document.getElementById("calDayLabel"),
    playerImportInput:             document.getElementById("playerImportInput"),
    playerImportStatus:            document.getElementById("playerImportStatus"),
    playlistPlayerStatus:          document.getElementById("playlistPlayerStatus"),
    playlistPlayerTitle:           document.getElementById("playlistPlayerTitle"),
    playlistPlayerMeta:            document.getElementById("playlistPlayerMeta"),
    playlistPlayerDescription:     document.getElementById("playlistPlayerDescription"),
    playlistPlayerPracticeCount:   document.getElementById("playlistPlayerPracticeCount"),
    playlistPlayerPracticeList:    document.getElementById("playlistPlayerPracticeList"),
    playlistPlayerHint:            document.getElementById("playlistPlayerHint"),
    playlistPlayerCard:            document.getElementById("playlistPlayerCard"),
    playlistPlayerAnswerPanel:     document.getElementById("playlistPlayerAnswerPanel"),
    playlistPrevPracticeButton:    document.getElementById("playlistPrevPracticeButton"),
    playlistNextPracticeButton:    document.getElementById("playlistNextPracticeButton"),
    playlistGenerateButton:        document.getElementById("playlistGenerateButton"),
  };

  if (elements.playerGradeSelect) {
    elements.playerGradeSelect.innerHTML = (playlistStore.GRADE_OPTIONS || ["全部年級"]).map(
      (g) => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`
    ).join("");
  }

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  const TODAY = todayStr();

  const state = {
    gradeFilter:    "全部年級",
    categoryFilter: "全部",
    playlistId:     "",
    practiceId:     "",
    generated:      null,
    questionIndex:  0,
    answerVisible:  false,
    detailVisible:  false,
    loading:        false,
    selectedDate:   "",
    calYear:        new Date().getFullYear(),
    calMonth:       new Date().getMonth(),
  };

  // ── 進度讀取（唯讀，只有測驗頁才能寫入）──────────────────────────────────
  function progressDateKey() {
    const pl = getActivePlaylist();
    return pl?.playlistType === "日程型" ? state.selectedDate : "";
  }

  // 進度狀態：null | "done" | "partial"
  function getPracticeStatus(practiceId) {
    if (!progressStore) return null;
    const pid = state.playlistId;
    const dk  = progressDateKey();
    const data = progressStore.loadAll?.() ?? null;
    if (!data) return null;
    const bucket = data[pid]?.[dk] || {};
    if (!bucket[practiceId]) return null;
    return bucket[practiceId] === "partial" ? "partial" : "done";
  }

  // ── 日期計算 ────────────────────────────────────────────────────────────────
  function toDateStr(dateObj) {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,"0")}-${String(dateObj.getDate()).padStart(2,"0")}`;
  }

  function buildScheduleDateMap(scheduleConfig) {
    const map = {};
    if (!scheduleConfig?.startDate || !Array.isArray(scheduleConfig.weeks)) return map;
    const start = new Date(scheduleConfig.startDate + "T12:00:00");
    for (const week of scheduleConfig.weeks) {
      for (const day of (week.days || [])) {
        const d = new Date(start);
        d.setDate(d.getDate() + (week.weekNum - 1) * 7 + (day.dow || 0));
        map[toDateStr(d)] = { ...day, weekNum: week.weekNum, weekLabel: week.label };
      }
    }
    return map;
  }

  // ── 月曆 ───────────────────────────────────────────────────────────────────
  const WEEK_HEADERS = ["日","一","二","三","四","五","六"];
  const MONTH_NAMES  = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

  function renderCalendar(playlist) {
    const calSection = elements.scheduleCalendarSection;
    if (!calSection) return;
    if (!playlist || playlist.playlistType !== "日程型" || !playlist.scheduleConfig) {
      calSection.hidden = true;
      return;
    }
    calSection.hidden = false;

    const dateMap = buildScheduleDateMap(playlist.scheduleConfig);
    if (elements.calMonthLabel) {
      elements.calMonthLabel.textContent = `${state.calYear}年${MONTH_NAMES[state.calMonth]}`;
    }

    const firstDay  = new Date(state.calYear, state.calMonth, 1);
    const lastDay   = new Date(state.calYear, state.calMonth + 1, 0);
    const startDow  = firstDay.getDay();
    const totalDays = lastDay.getDate();

    let html = WEEK_HEADERS.map((l) => `<div class="cal-header">${l}</div>`).join("");
    for (let i = 0; i < startDow; i++) html += `<div class="cal-day other-month"></div>`;

    for (let d = 1; d <= totalDays; d++) {
      const ds      = `${state.calYear}-${String(state.calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const dayConf = dateMap[ds];
      const hasTask = !!dayConf;
      const isSel   = ds === state.selectedDate;
      const isToday = ds === TODAY;

      let progressCls = "";
      if (hasTask && progressStore) {
        const { done, total } = progressStore.getDayProgress(state.playlistId, ds, dayConf.practiceIds || []);
        if (total > 0 && done === total) progressCls = " day-done";
        else if (done > 0)               progressCls = " day-partial";
      }

      let cls = "cal-day";
      if (hasTask)  cls += " has-task" + progressCls;
      if (isSel)    cls += " is-selected";
      if (isToday)  cls += " is-today";
      const attr = hasTask ? ` data-cal-date="${escapeHtml(ds)}"` : "";
      html += `<div class="${cls}"${attr}>${d}</div>`;
    }

    if (elements.calGrid) {
      elements.calGrid.innerHTML = html;
      elements.calGrid.querySelectorAll("[data-cal-date]").forEach((cell) => {
        cell.addEventListener("click", () => {
          const ds = cell.getAttribute("data-cal-date");
          if (!dateMap[ds]) return;
          state.selectedDate  = ds;
          state.practiceId    = dateMap[ds].practiceIds?.[0] || "";
          state.generated     = null;
          state.answerVisible = false;
          state.detailVisible = false;
          renderCalendar(playlist);
          updateDayLabel(dateMap);
          renderPracticeList();
          renderPlayerCard();
          updateToolbarButtons();
          // 選日期後自動出題
          if (state.practiceId) generateCurrentPractice();
        });
      });
    }
    updateDayLabel(dateMap);
  }

  function updateDayLabel(dateMap) {
    if (!elements.calDayLabel) return;
    if (!state.selectedDate) {
      elements.calDayLabel.textContent = "點選有任務的日期開始練習";
      return;
    }
    const dc = dateMap?.[state.selectedDate];
    if (dc) elements.calDayLabel.textContent = `第 ${dc.weekNum} 週 · ${dc.label || ""}`;
  }

  // ── 清單資料 ───────────────────────────────────────────────────────────────
  function getFilteredPlaylists() {
    const all = playlistStore.loadAll().filter((p) => p.enabled !== false);
    return all.filter((p) => {
      const gradeOk = !state.gradeFilter
        || state.gradeFilter === "全部年級"
        || p.grade === state.gradeFilter
        || p.grade === "全部年級";
      if (!gradeOk) return false;
      if (!state.categoryFilter || state.categoryFilter === "全部") return true;
      return inferPlaylistCategory(p) === state.categoryFilter;
    });
  }

  function inferPlaylistCategory(playlist) {
    const explicit = String(playlist?.playlistCategory || "").trim();
    if (explicit) return explicit;
    const id = String(playlist?.id || "");
    const title = String(playlist?.title || "");
    if (id.startsWith("chapter-focus-") || title.startsWith("章節重點")) return "章節重點";
    if (id.startsWith("review-") || title.includes("複習必做")) return "複習必做";
    return "其他";
  }

  function getActivePlaylist() {
    return playlistStore.getById(state.playlistId) || null;
  }

  function getActivePracticeIds() {
    const playlist = getActivePlaylist();
    if (!playlist) return [];
    if (playlist.playlistType === "日程型" && playlist.scheduleConfig) {
      if (!state.selectedDate) return [];
      return buildScheduleDateMap(playlist.scheduleConfig)[state.selectedDate]?.practiceIds || [];
    }
    return Array.isArray(playlist.practiceIds) ? playlist.practiceIds : [];
  }

  function getPracticeRecord(practiceId) {
    return practiceLibrary.byId?.[practiceId] || null;
  }

  function normalizeGeneratedSet(result) {
    const n = toolkit.normalizeGeneratedPracticeResult?.(result) || result || {};
    return {
      intro:          String(n.intro || "").trim(),
      questions:      Array.isArray(n.questions)      ? n.questions      : [],
      summaryAnswers: Array.isArray(n.summaryAnswers) ? n.summaryAnswers : [],
      answers:        Array.isArray(n.answers)        ? n.answers        : [],
    };
  }

  async function ensurePracticeConfig(practiceRecord) {
    let config = practiceStore.getConfig?.(practiceRecord.id);
    if (config?.generate) return config;
    if (generatorLoader?.ensureForPractice) await generatorLoader.ensureForPractice(practiceRecord);
    return practiceStore.getConfig?.(practiceRecord.id) || null;
  }

  async function generateCurrentPractice() {
    const playlist       = getActivePlaylist();
    const practiceRecord = getPracticeRecord(state.practiceId);
    if (!playlist || !practiceRecord) return;

    state.loading = true;
    if (elements.playlistPlayerHint)     elements.playlistPlayerHint.textContent = "正在生成題目...";
    if (elements.playlistGenerateButton) elements.playlistGenerateButton.disabled = true;

    try {
      const config = await ensurePracticeConfig(practiceRecord);
      if (!config || typeof config.generate !== "function") {
        state.generated = null;
        if (elements.playlistPlayerHint) {
          elements.playlistPlayerHint.innerHTML =
            '<span style="color:red;font-weight:bold">這個題型目前無法生成題目。</span>';
        }
        renderPlayerCard();
        return;
      }
      const runtimeConfig = { ...config, questionCount: Math.max(1, Number(playlist.questionCount) || 5) };
      const result        = runtimeConfig.generate.call(runtimeConfig, practiceRecord) || {};
      state.generated     = normalizeGeneratedSet(result);
      state.questionIndex = 0;
      state.answerVisible = false;
      state.detailVisible = false;
      if (elements.playlistPlayerHint)
        elements.playlistPlayerHint.textContent = "題目已生成，可以看題、看答案、再換題。";
    } catch (_err) {
      state.generated = null;
      if (elements.playlistPlayerHint)
        elements.playlistPlayerHint.textContent = "生成失敗，請改選別的題型或再試一次。";
    } finally {
      state.loading = false;
      if (elements.playlistGenerateButton) elements.playlistGenerateButton.disabled = false;
      renderPlayerCard();
    }
  }

  // ── 清單卡片 ───────────────────────────────────────────────────────────────
  function getScheduleTotalDays(playlist) {
    if (!playlist.scheduleConfig?.weeks) return 0;
    return playlist.scheduleConfig.weeks.reduce((s, w) => s + (w.days?.length || 0), 0);
  }

  function selectPlaylist(pid) {
    const changed = pid !== state.playlistId;
    if (changed) {
      state.playlistId    = pid;
      state.practiceId    = "";
      state.generated     = null;
      state.answerVisible = false;
      state.detailVisible = false;
      state.selectedDate  = "";
      const pl = playlistStore.getById(pid);
      if (pl?.playlistType === "日程型" && pl.scheduleConfig?.startDate) {
        const s = new Date(pl.scheduleConfig.startDate + "T12:00:00");
        state.calYear  = s.getFullYear();
        state.calMonth = s.getMonth();
      } else {
        state.calYear  = new Date().getFullYear();
        state.calMonth = new Date().getMonth();
      }
    }
    render();
    // 任務型：選完清單後自動出題（第一題）
    const pl = playlistStore.getById(state.playlistId);
    if (pl?.playlistType !== "日程型" && state.practiceId) {
      generateCurrentPractice();
    }
  }

  function buildPlaylistCards(list, container, isSchedule) {
    if (!container) return;
    if (!list.length) {
      container.innerHTML = `<p class="detail-note">目前沒有此類清單。</p>`;
      return;
    }
    container.innerHTML = list.map((p) => {
      const count = isSchedule ? `${getScheduleTotalDays(p)} 天課程` : `${p.practiceIds.length} 題型`;
      return `
        <button type="button"
          class="playlist-player-card${p.id === state.playlistId ? " is-active" : ""}"
          data-select-playlist="${escapeHtml(p.id)}">
          <strong>${escapeHtml(p.title)}</strong>
          <p class="detail-note">${escapeHtml(p.grade || "全部年級")} · ${count}</p>
          ${p.description ? `<p>${escapeHtml(p.description)}</p>` : ""}
        </button>`;
    }).join("");

    container.querySelectorAll("[data-select-playlist]").forEach((btn) => {
      btn.addEventListener("click", () => selectPlaylist(btn.getAttribute("data-select-playlist")));
    });
  }

  // 任務型清單改用下拉式選單，避免側欄過長
  function buildTaskPlaylistSelect(list, container) {
    if (!container) return;
    if (!list.length) {
      container.innerHTML = `<p class="detail-note">目前沒有此類清單。</p>`;
      return;
    }
    const hasActive = list.some((p) => p.id === state.playlistId);
    const placeholder = hasActive ? "" : `<option value="" selected disabled>請選擇清單</option>`;
    container.innerHTML = `
      <label class="field">
        <span>選擇清單（${list.length} 份）</span>
        <select id="taskPlaylistSelect">
          ${placeholder}
          ${list.map((p) => `
            <option value="${escapeHtml(p.id)}"${p.id === state.playlistId ? " selected" : ""}>
              ${escapeHtml(p.title)}（${escapeHtml(p.grade || "全部年級")} · ${p.practiceIds.length} 題型）
            </option>`).join("")}
        </select>
      </label>
      <p id="taskPlaylistInfo" class="detail-note"></p>`;

    const select = container.querySelector("#taskPlaylistSelect");
    const info = container.querySelector("#taskPlaylistInfo");
    const updateInfo = () => {
      const playlist = list.find((p) => p.id === select.value) || null;
      if (info) info.textContent = playlist ? (playlist.description || "") : "選擇後自動載入第一題。";
    };
    updateInfo();
    select?.addEventListener("change", () => {
      if (select.value) selectPlaylist(select.value);
    });
  }

  function renderPlaylistGroups() {
    const all = getFilteredPlaylists();
    buildTaskPlaylistSelect(all.filter((p) => p.playlistType === "任務型"), elements.taskPlaylistList);
    buildPlaylistCards(all.filter((p) => p.playlistType === "日程型"), elements.schedulePlaylistList, true);
  }

  // ── 主內容 ─────────────────────────────────────────────────────────────────
  function renderSelectedPlaylist() {
    const playlist = getActivePlaylist();

    if (!playlist) {
      if (elements.playlistPlayerTitle)       elements.playlistPlayerTitle.textContent = "尚未選擇";
      if (elements.playlistPlayerMeta)        elements.playlistPlayerMeta.textContent = "";
      if (elements.playlistPlayerDescription) elements.playlistPlayerDescription.textContent = "請先從左側選擇一份清單。";
      if (elements.playlistPlayerStatus)      elements.playlistPlayerStatus.textContent = "目前沒有選取清單。";
      if (elements.playlistPlayerPracticeCount) elements.playlistPlayerPracticeCount.textContent = "";
      if (elements.playlistPlayerPracticeList)  elements.playlistPlayerPracticeList.innerHTML = "";
      if (elements.scheduleCalendarSection)     elements.scheduleCalendarSection.hidden = true;
      renderPlayerCard();
      return;
    }

    if (elements.playlistPlayerTitle)       elements.playlistPlayerTitle.textContent     = playlist.title;
    if (elements.playlistPlayerDescription) elements.playlistPlayerDescription.textContent = playlist.description || "";

    const isSchedule = playlist.playlistType === "日程型" && !!playlist.scheduleConfig;
    if (isSchedule) {
      const totalDays = getScheduleTotalDays(playlist);
      if (elements.playlistPlayerMeta) {
        elements.playlistPlayerMeta.textContent =
          `${playlist.grade || "全部年級"} · 日程型 · ${totalDays} 天課程 · 起始 ${playlist.scheduleConfig.startDate || ""}`;
      }
      if (elements.playlistPlayerStatus) {
        elements.playlistPlayerStatus.textContent = state.selectedDate
          ? `已選取 ${state.selectedDate}`
          : "請從月曆點選任務日期，再從題型列表選題練習。";
      }
      renderCalendar(playlist);
    } else {
      if (elements.playlistPlayerMeta) {
        elements.playlistPlayerMeta.textContent =
          `${playlist.grade || "全部年級"} · ${playlist.playlistType || "任務型"} · ${playlist.practiceIds.length} 題型 · 每題型 ${playlist.questionCount} 題`;
      }
      if (elements.playlistPlayerStatus) elements.playlistPlayerStatus.textContent = "左側選題型，按出題開始練習。";
      if (elements.scheduleCalendarSection) elements.scheduleCalendarSection.hidden = true;

      if (!playlist.practiceIds.includes(state.practiceId)) {
        state.practiceId    = playlist.practiceIds[0] || "";
        state.generated     = null;
        state.answerVisible = false;
        state.detailVisible = false;
      }
    }

    renderPracticeList();
    renderPlayerCard();
  }

  function renderPracticeList() {
    const practiceIds = getActivePracticeIds();
    const playlist    = getActivePlaylist();
    const isSchedule  = playlist?.playlistType === "日程型";
    const dateKey     = progressDateKey();

    if (elements.playlistPlayerPracticeCount)
      elements.playlistPlayerPracticeCount.textContent = `${practiceIds.length} 題型`;
    if (!elements.playlistPlayerPracticeList) return;

    if (isSchedule && !state.selectedDate) {
      elements.playlistPlayerPracticeList.innerHTML =
        `<p class="detail-note">請先點選月曆中的任務日期。</p>`;
      return;
    }
    if (!practiceIds.length) {
      elements.playlistPlayerPracticeList.innerHTML =
        `<p class="detail-note">這份清單目前沒有選到任何題型。</p>`;
      return;
    }

    elements.playlistPlayerPracticeList.innerHTML = practiceIds.map((pid, idx) => {
      const record   = getPracticeRecord(pid);
      const isActive = pid === state.practiceId;
      // 進度標記（唯讀，只有測驗頁才能更改）
      const status   = progressStore?.isCompleted(state.playlistId, dateKey, pid);
      const data     = progressStore?.loadAll?.() || {};
      const raw      = data[state.playlistId]?.[dateKey]?.[pid];
      const badge    = raw === true
        ? `<span class="practice-done-badge">✓ 已完成</span>`
        : raw === "partial"
          ? `<span class="practice-done-badge" style="background:#e65100">△ 部分</span>`
          : "";
      return `
        <button type="button"
          class="playlist-player-card${isActive ? " is-active" : ""}"
          data-playlist-practice="${escapeHtml(pid)}">
          <strong>#${idx+1} ${escapeHtml(record?.title || pid)}${badge}</strong>
          <p>${escapeHtml(record?.chapterCode || "未標記章節")} · ${escapeHtml(record?.difficulty || "未標記難度")}</p>
          <div class="detail-note">${escapeHtml(pid)}</div>
        </button>`;
    }).join("");

    elements.playlistPlayerPracticeList.querySelectorAll("[data-playlist-practice]").forEach((button) => {
      button.addEventListener("click", async () => {
        const nextId = String(button.getAttribute("data-playlist-practice") || "").trim();
        if (!nextId) return;
        state.practiceId    = nextId;
        state.generated     = null;
        state.answerVisible = false;
        state.detailVisible = false;
        renderPracticeList();
        renderPlayerCard();
        updateToolbarButtons();
        await generateCurrentPractice();
      });
    });
  }

  function renderPlayerCard() {
    const practiceRecord = getPracticeRecord(state.practiceId);
    const dateKey        = progressDateKey();

    if (!practiceRecord) {
      if (elements.playlistPlayerCard) {
        elements.playlistPlayerCard.className = "ability-session-card is-empty";
        elements.playlistPlayerCard.innerHTML = `<p>請先選一個題型。</p>`;
      }
      if (elements.playlistPlayerAnswerPanel) elements.playlistPlayerAnswerPanel.hidden = true;
      return;
    }

    // 讀取進度狀態（for 顯示用）
    const raw = progressStore?.loadAll?.()[state.playlistId]?.[dateKey]?.[state.practiceId];
    const statusChip = raw === true
      ? `<span class="meta-chip" style="background:#e8f5e9;color:#2e7d32">✓ 已完成</span>`
      : raw === "partial"
        ? `<span class="meta-chip" style="background:#fff3e0;color:#e65100">△ 部分完成</span>`
        : "";

    if (!state.generated || !state.generated.questions.length) {
      if (elements.playlistPlayerCard) {
        elements.playlistPlayerCard.className = "ability-session-card is-empty";
        elements.playlistPlayerCard.innerHTML = `
          <p><strong>${escapeHtml(practiceRecord.title || state.practiceId)}</strong>${statusChip ? " " + statusChip : ""}</p>
          <p>正在準備題目…</p>`;
      }
      if (elements.playlistPlayerAnswerPanel) elements.playlistPlayerAnswerPanel.hidden = true;
      return;
    }

    const index         = Math.max(0, Math.min(state.questionIndex, state.generated.questions.length - 1));
    const question      = state.generated.questions[index] || "";
    const summaryAnswer = state.generated.summaryAnswers[index] || "";
    const detailAnswer  = state.generated.answers[index] || summaryAnswer;

    if (elements.playlistPlayerCard) {
      elements.playlistPlayerCard.className = "ability-session-card";
      elements.playlistPlayerCard.innerHTML = `
        <div class="ability-session-card__meta">
          <span class="meta-chip">${escapeHtml(practiceRecord.chapterCode || "未標記章節")}</span>
          <span class="meta-chip">${escapeHtml(practiceRecord.difficulty || "未標記難度")}</span>
          <span class="meta-chip">第 ${index+1} / ${state.generated.questions.length} 題</span>
          ${statusChip}
        </div>
        ${state.generated.intro ? `<p class="practice-intro">${toolkit.renderRichTextLine(state.generated.intro)}</p>` : ""}
        <div class="interactive-output">${toolkit.renderRichTextLine(question)}</div>
        <div class="ability-session-card__actions">
          <button id="playlistPrevQuestionButton" class="ghost-button" type="button">上一題</button>
          <button id="playlistNextQuestionButton" class="ghost-button" type="button">下一題</button>
          <button id="playlistToggleAnswerButton" class="ghost-button" type="button">${state.answerVisible ? "隱藏答案" : "看答案"}</button>
          <button id="playlistToggleDetailButton" class="ghost-button" type="button">${state.detailVisible ? "隱藏詳解" : "看詳解"}</button>
        </div>`;
    }

    if (elements.playlistPlayerAnswerPanel) {
      elements.playlistPlayerAnswerPanel.hidden = !state.answerVisible && !state.detailVisible;
      elements.playlistPlayerAnswerPanel.innerHTML = `
        <div class="ability-feedback-panel__body">
          ${state.answerVisible ? `<p><strong>簡答：</strong>${toolkit.renderRichTextLine(summaryAnswer || "目前沒有簡答")}</p>` : ""}
          ${state.detailVisible ? `<p><strong>詳解：</strong>${toolkit.renderRichTextLine(detailAnswer || "目前沒有詳解")}</p>` : ""}
        </div>`;
    }

    document.getElementById("playlistPrevQuestionButton")?.addEventListener("click", () => {
      state.questionIndex = Math.max(0, index - 1);
      renderPlayerCard();
    });
    document.getElementById("playlistNextQuestionButton")?.addEventListener("click", () => {
      state.questionIndex = Math.min(state.generated.questions.length - 1, index + 1);
      renderPlayerCard();
    });
    document.getElementById("playlistToggleAnswerButton")?.addEventListener("click", () => {
      state.answerVisible = !state.answerVisible;
      renderPlayerCard();
    });
    document.getElementById("playlistToggleDetailButton")?.addEventListener("click", () => {
      state.detailVisible = !state.detailVisible;
      renderPlayerCard();
    });
  }

  async function movePractice(step) {
    const practiceIds  = getActivePracticeIds();
    const currentIndex = practiceIds.indexOf(state.practiceId);
    if (currentIndex < 0) return;
    const nextIndex = currentIndex + step;
    if (nextIndex < 0 || nextIndex >= practiceIds.length) return;
    state.practiceId    = practiceIds[nextIndex];
    state.generated     = null;
    state.answerVisible = false;
    state.detailVisible = false;
    renderPracticeList();
    renderPlayerCard();
    updateToolbarButtons();
    await generateCurrentPractice();
  }

  function updateToolbarButtons() {
    const has = !!state.practiceId;
    if (elements.playlistPrevPracticeButton) elements.playlistPrevPracticeButton.disabled = !has;
    if (elements.playlistNextPracticeButton) elements.playlistNextPracticeButton.disabled = !has;
    if (elements.playlistGenerateButton)     elements.playlistGenerateButton.disabled     = !has || state.loading;
  }

  function render() {
    renderPlaylistGroups();
    renderSelectedPlaylist();
    updateToolbarButtons();
  }

  // ── 事件綁定 ───────────────────────────────────────────────────────────────
  elements.playerGradeSelect?.addEventListener("change", () => {
    state.gradeFilter  = String(elements.playerGradeSelect.value || "全部年級").trim();
    state.playlistId   = "";
    state.practiceId   = "";
    state.generated    = null;
    state.selectedDate = "";
    render();
  });

  elements.playerCategorySelect?.addEventListener("change", () => {
    state.categoryFilter = String(elements.playerCategorySelect.value || "全部").trim();
    state.playlistId     = "";
    state.practiceId     = "";
    state.generated      = null;
    state.selectedDate   = "";
    render();
  });

  elements.playlistPrevPracticeButton?.addEventListener("click", async () => { await movePractice(-1); });
  elements.playlistNextPracticeButton?.addEventListener("click", async () => { await movePractice(1); });
  elements.playlistGenerateButton?.addEventListener("click", async () => { await generateCurrentPractice(); });

  elements.calPrevMonth?.addEventListener("click", () => {
    if (state.calMonth === 0) { state.calYear -= 1; state.calMonth = 11; }
    else state.calMonth -= 1;
    renderCalendar(getActivePlaylist());
  });
  elements.calNextMonth?.addEventListener("click", () => {
    if (state.calMonth === 11) { state.calYear += 1; state.calMonth = 0; }
    else state.calMonth += 1;
    renderCalendar(getActivePlaylist());
  });

  elements.playerImportInput?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text     = await file.text();
      const playlist = playlistStore.importJson(text);
      const saved    = playlistStore.upsert(playlist);
      if (elements.playerImportStatus) elements.playerImportStatus.textContent = `已匯入並儲存：${saved.title}`;
      state.playlistId   = saved.id;
      state.practiceId   = "";
      state.generated    = null;
      state.selectedDate = "";
      render();
    } catch (err) {
      if (elements.playerImportStatus) elements.playerImportStatus.textContent = `匯入失敗：${err.message}`;
    }
    event.target.value = "";
  });

  render();
})();
