// 無限練習測驗頁邏輯
// 流程：設定 → 逐題自評（看答案後按答對/答錯）→ 顯示成績
(() => {
  const toolkit         = window.formulaToolkit || null;
  const practiceStore   = window.formulaPracticeStore || null;
  const practiceLibrary = window.practiceLibraryStore || null;
  const generatorLoader = window.practiceGeneratorLoader || null;
  const playlistStore   = window.practicePlaylistStore || null;
  const progressStore   = window.practiceProgressStore || null;

  if (!toolkit || !practiceStore || !practiceLibrary || !playlistStore) {
    console.warn("practice-quiz: dependencies not loaded");
    return;
  }

  function escapeHtml(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  const el = {
    quizGradeSelect:         document.getElementById("quizGradeSelect"),
    quizTaskPlaylistList:    document.getElementById("quizTaskPlaylistList"),
    quizSchedulePlaylistList:document.getElementById("quizSchedulePlaylistList"),
    quizCalendarSection:     document.getElementById("quizCalendarSection"),
    quizCalPrev:             document.getElementById("quizCalPrev"),
    quizCalNext:             document.getElementById("quizCalNext"),
    quizCalLabel:            document.getElementById("quizCalLabel"),
    quizCalGrid:             document.getElementById("quizCalGrid"),
    quizCalDayLabel:         document.getElementById("quizCalDayLabel"),
    quizSideProgress:        document.getElementById("quizSideProgress"),
    quizSideProgressText:    document.getElementById("quizSideProgressText"),
    quizSideProgressFill:    document.getElementById("quizSideProgressFill"),
    quizSidePracticeList:    document.getElementById("quizSidePracticeList"),
    quizSetupPanel:          document.getElementById("quizSetupPanel"),
    quizSetupTitle:          document.getElementById("quizSetupTitle"),
    quizSetupMeta:           document.getElementById("quizSetupMeta"),
    quizSetupDesc:           document.getElementById("quizSetupDesc"),
    quizStartButton:         document.getElementById("quizStartButton"),
    quizRunningPanel:        document.getElementById("quizRunningPanel"),
    quizRunningTitle:        document.getElementById("quizRunningTitle"),
    quizRunningMeta:         document.getElementById("quizRunningMeta"),
    quizRunningCard:         document.getElementById("quizRunningCard"),
    quizAnswerReveal:        document.getElementById("quizAnswerReveal"),
    quizDonePanel:           document.getElementById("quizDonePanel"),
    quizDoneTitle:           document.getElementById("quizDoneTitle"),
    quizDoneScore:           document.getElementById("quizDoneScore"),
    quizScoreTableBody:      document.getElementById("quizScoreTableBody"),
    quizRetryButton:         document.getElementById("quizRetryButton"),
    quizRetryWrongButton:    document.getElementById("quizRetryWrongButton"),
  };

  // 填年級選單
  if (el.quizGradeSelect) {
    el.quizGradeSelect.innerHTML = (playlistStore.GRADE_OPTIONS || ["全部年級"]).map(
      (g) => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`
    ).join("");
  }

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  const TODAY = todayStr();

  // ── 狀態 ──────────────────────────────────────────────────────────────────
  const state = {
    phase:        "setup",   // "setup" | "running" | "done"
    gradeFilter:  "全部年級",
    playlistId:   "",
    selectedDate: "",        // 日程型用
    calYear:      new Date().getFullYear(),
    calMonth:     new Date().getMonth(),
    // 測驗中
    practiceIds:        [],  // 本次測驗的題型清單（可被 retryWrong 縮短）
    allPracticeIds:     [],  // 完整原始清單（for 重做錯題用）
    currentPracticeIdx: 0,
    generated:          null,
    currentQuestionIdx: 0,
    questionPhase:      "question", // "question" | "revealed"
    scores:             {},  // { [practiceId]: { correct: 0, wrong: 0 } }
  };

  // ── 日期計算工具 ────────────────────────────────────────────────────────────
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
        const ds = toDateStr(d);
        map[ds] = { ...day, weekNum: week.weekNum, weekLabel: week.label };
      }
    }
    return map;
  }

  // ── 月曆 ───────────────────────────────────────────────────────────────────
  const WEEK_HEADERS = ["日","一","二","三","四","五","六"];
  const MONTH_NAMES  = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

  function renderCalendar() {
    const playlist = playlistStore.getById(state.playlistId);
    const calSec   = el.quizCalendarSection;
    if (!calSec) return;
    if (!playlist || playlist.playlistType !== "日程型" || !playlist.scheduleConfig) {
      calSec.hidden = true;
      return;
    }
    calSec.hidden = false;
    const dateMap = buildScheduleDateMap(playlist.scheduleConfig);

    if (el.quizCalLabel) el.quizCalLabel.textContent = `${state.calYear}年${MONTH_NAMES[state.calMonth]}`;

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
      const attr = hasTask ? ` data-quiz-date="${escapeHtml(ds)}"` : "";
      html += `<div class="${cls}"${attr}>${d}</div>`;
    }

    if (el.quizCalGrid) {
      el.quizCalGrid.innerHTML = html;
      el.quizCalGrid.querySelectorAll("[data-quiz-date]").forEach((cell) => {
        cell.addEventListener("click", () => {
          const ds      = cell.getAttribute("data-quiz-date");
          const dayConf = dateMap[ds];
          if (!dayConf) return;
          state.selectedDate = ds;
          if (el.quizCalDayLabel) {
            el.quizCalDayLabel.textContent = `第 ${dayConf.weekNum} 週 · ${dayConf.label || ""}`;
          }
          renderCalendar();
          updateSetupPanel();
        });
      });
    }
    if (!state.selectedDate && el.quizCalDayLabel) {
      el.quizCalDayLabel.textContent = "點選日期開始測驗";
    }
  }

  // ── 清單選取 ───────────────────────────────────────────────────────────────
  function getFilteredPlaylists() {
    const all = playlistStore.loadAll().filter((p) => p.enabled !== false);
    if (!state.gradeFilter || state.gradeFilter === "全部年級") return all;
    return all.filter((p) => p.grade === state.gradeFilter || p.grade === "全部年級");
  }

  function buildPlaylistCards(list, container, isSchedule) {
    if (!container) return;
    if (!list.length) {
      container.innerHTML = `<p class="detail-note">目前沒有此類清單。</p>`;
      return;
    }
    container.innerHTML = list.map((p) => {
      const count = isSchedule
        ? `${p.scheduleConfig?.weeks?.reduce((s,w)=>s+(w.days?.length||0),0)||0} 天課程`
        : `${p.practiceIds.length} 題型`;
      return `
        <button type="button"
          class="playlist-player-card${p.id === state.playlistId ? " is-active" : ""}"
          data-quiz-playlist="${escapeHtml(p.id)}">
          <strong>${escapeHtml(p.title)}</strong>
          <p class="detail-note">${escapeHtml(p.grade||"全部年級")} · ${count}</p>
        </button>`;
    }).join("");
    container.querySelectorAll("[data-quiz-playlist]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pid = btn.getAttribute("data-quiz-playlist");
        if (pid !== state.playlistId) {
          state.playlistId   = pid;
          state.selectedDate = "";
          const pl = playlistStore.getById(pid);
          if (pl?.playlistType === "日程型" && pl.scheduleConfig?.startDate) {
            const s = new Date(pl.scheduleConfig.startDate + "T12:00:00");
            state.calYear  = s.getFullYear();
            state.calMonth = s.getMonth();
          } else {
            state.calYear  = new Date().getFullYear();
            state.calMonth = new Date().getMonth();
          }
          renderCalendar();
          updateSetupPanel();
          renderPlaylistCards();
        }
      });
    });
  }

  function renderPlaylistCards() {
    const all = getFilteredPlaylists();
    buildPlaylistCards(all.filter((p) => p.playlistType === "任務型"),  el.quizTaskPlaylistList, false);
    buildPlaylistCards(all.filter((p) => p.playlistType === "日程型"), el.quizSchedulePlaylistList, true);
  }

  // ── 設定面板 ───────────────────────────────────────────────────────────────
  function getQuizPracticeIds() {
    if (!state.playlistId) return [];
    const pl = playlistStore.getById(state.playlistId);
    if (!pl) return [];
    if (pl.playlistType === "日程型" && pl.scheduleConfig) {
      if (!state.selectedDate) return [];
      const dateMap = buildScheduleDateMap(pl.scheduleConfig);
      return dateMap[state.selectedDate]?.practiceIds || [];
    }
    return Array.isArray(pl.practiceIds) ? pl.practiceIds : [];
  }

  function updateSetupPanel() {
    const pl  = playlistStore.getById(state.playlistId);
    const ids = getQuizPracticeIds();
    const ready = ids.length > 0;

    if (el.quizSetupTitle) el.quizSetupTitle.textContent = pl?.title || "尚未選擇清單";
    if (el.quizSetupMeta) {
      el.quizSetupMeta.textContent = pl
        ? (pl.playlistType === "日程型"
            ? (state.selectedDate ? `${state.selectedDate} · ${ids.length} 題型` : "請選日期")
            : `${ids.length} 題型`)
        : "";
    }
    if (el.quizSetupDesc) {
      el.quizSetupDesc.textContent = ready
        ? `共 ${ids.length} 個題型，每題型出 ${pl?.questionCount || 5} 題。`
        : "從左側選清單，日程型請再選日期。";
    }
    if (el.quizStartButton) el.quizStartButton.disabled = !ready;
  }

  // ── 測驗核心 ───────────────────────────────────────────────────────────────
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

  async function startQuiz(practiceIdsOverride) {
    const ids = practiceIdsOverride || getQuizPracticeIds();
    if (!ids.length) return;
    state.phase             = "running";
    state.practiceIds       = [...ids];
    state.allPracticeIds    = [...ids];
    state.currentPracticeIdx = 0;
    state.scores            = {};
    ids.forEach((id) => { state.scores[id] = { correct: 0, wrong: 0 }; });
    showPhase("running");
    updateSideProgress();
    await loadCurrentPractice();
  }

  async function loadCurrentPractice() {
    const practiceId     = state.practiceIds[state.currentPracticeIdx];
    const practiceRecord = getPracticeRecord(practiceId);
    if (!practiceRecord) {
      advancePractice();
      return;
    }
    if (el.quizRunningTitle) el.quizRunningTitle.textContent = practiceRecord.title || practiceId;
    if (el.quizRunningCard) {
      el.quizRunningCard.className = "ability-session-card is-empty";
      el.quizRunningCard.innerHTML = `<p>正在生成題目…</p>`;
    }
    if (el.quizAnswerReveal) el.quizAnswerReveal.hidden = true;

    try {
      const pl     = playlistStore.getById(state.playlistId);
      const config = await ensurePracticeConfig(practiceRecord);
      if (!config || typeof config.generate !== "function") {
        state.generated = null;
        if (el.quizRunningCard) {
          el.quizRunningCard.className = "ability-session-card is-empty";
          el.quizRunningCard.innerHTML = `<p style="color:red">這個題型目前無法生成題目，自動跳過。</p>`;
        }
        setTimeout(() => advancePractice(), 1200);
        return;
      }
      const runtimeConfig  = { ...config, questionCount: Math.max(1, Number(pl?.questionCount) || 5) };
      const result         = runtimeConfig.generate.call(runtimeConfig, practiceRecord) || {};
      state.generated      = normalizeGeneratedSet(result);
      state.currentQuestionIdx = 0;
      state.questionPhase  = "question";
      renderQuizQuestion();
    } catch (_err) {
      if (el.quizRunningCard) {
        el.quizRunningCard.className = "ability-session-card is-empty";
        el.quizRunningCard.innerHTML = `<p style="color:red">生成失敗，自動跳過。</p>`;
      }
      setTimeout(() => advancePractice(), 1200);
    }
  }

  function renderQuizQuestion() {
    const gen = state.generated;
    if (!gen || !gen.questions.length) {
      advancePractice();
      return;
    }
    const idx           = state.currentQuestionIdx;
    const practiceId    = state.practiceIds[state.currentPracticeIdx];
    const practiceRecord = getPracticeRecord(practiceId);
    const total         = state.practiceIds.length;
    const pIdx          = state.currentPracticeIdx;
    const qTotal        = gen.questions.length;

    if (el.quizRunningMeta) {
      el.quizRunningMeta.textContent =
        `題型 ${pIdx+1}/${total} · 第 ${idx+1}/${qTotal} 題`;
    }
    updateSideProgress();

    const question = gen.questions[idx] || "";
    const isRevealed = state.questionPhase === "revealed";
    const summaryAns = gen.summaryAnswers[idx] || "";
    const detailAns  = gen.answers[idx] || summaryAns;

    if (el.quizRunningCard) {
      el.quizRunningCard.className = "ability-session-card";
      el.quizRunningCard.innerHTML = `
        <div class="ability-session-card__meta">
          <span class="meta-chip">${escapeHtml(practiceRecord?.chapterCode || "")}</span>
          <span class="meta-chip">${escapeHtml(practiceRecord?.difficulty || "")}</span>
        </div>
        ${gen.intro ? `<p class="practice-intro">${toolkit.renderRichTextLine(gen.intro)}</p>` : ""}
        <div class="interactive-output">${toolkit.renderRichTextLine(question)}</div>
        <div class="ability-session-card__actions" style="margin-top:1rem">
          ${!isRevealed
            ? `<button id="quizRevealButton" class="ghost-button" type="button">看答案</button>`
            : `<div class="quiz-rating-row">
                <button id="quizCorrectButton" class="btn-correct" type="button">答對 ✓</button>
                <button id="quizWrongButton"   class="btn-wrong"   type="button">答錯 ✗</button>
               </div>`
          }
        </div>`;
    }

    if (el.quizAnswerReveal) {
      if (isRevealed) {
        el.quizAnswerReveal.hidden = false;
        el.quizAnswerReveal.innerHTML = `
          <div class="ability-feedback-panel__body">
            ${summaryAns ? `<p><strong>簡答：</strong>${toolkit.renderRichTextLine(summaryAns)}</p>` : ""}
            ${detailAns && detailAns !== summaryAns ? `<p><strong>詳解：</strong>${toolkit.renderRichTextLine(detailAns)}</p>` : ""}
          </div>`;
      } else {
        el.quizAnswerReveal.hidden = true;
      }
    }

    document.getElementById("quizRevealButton")?.addEventListener("click", () => {
      state.questionPhase = "revealed";
      renderQuizQuestion();
    });
    document.getElementById("quizCorrectButton")?.addEventListener("click", () => {
      state.scores[practiceId].correct++;
      nextQuestion();
    });
    document.getElementById("quizWrongButton")?.addEventListener("click", () => {
      state.scores[practiceId].wrong++;
      nextQuestion();
    });
  }

  function nextQuestion() {
    state.questionPhase = "question";
    const gen   = state.generated;
    const total = gen?.questions.length || 0;
    if (state.currentQuestionIdx + 1 < total) {
      state.currentQuestionIdx++;
      renderQuizQuestion();
    } else {
      advancePractice();
    }
  }

  function advancePractice() {
    state.currentPracticeIdx++;
    if (state.currentPracticeIdx >= state.practiceIds.length) {
      finishQuiz();
    } else {
      loadCurrentPractice();
    }
  }

  function updateSideProgress() {
    const total = state.practiceIds.length;
    const done  = state.currentPracticeIdx;
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
    if (el.quizSideProgressText) {
      el.quizSideProgressText.textContent = `題型 ${done}/${total} 完成`;
    }
    if (el.quizSideProgressFill) {
      el.quizSideProgressFill.style.width = `${pct}%`;
    }
    if (el.quizSidePracticeList) {
      el.quizSidePracticeList.innerHTML = state.practiceIds.map((pid, idx) => {
        const rec    = getPracticeRecord(pid);
        const sc     = state.scores[pid] || { correct: 0, wrong: 0 };
        const status = idx < done
          ? `<span class="score-correct">✓${sc.correct}</span> <span class="score-wrong">✗${sc.wrong}</span>`
          : (idx === done ? "▶ 進行中" : "");
        return `
          <div class="playlist-player-card" style="pointer-events:none;opacity:${idx<=done?1:.5}">
            <strong>${escapeHtml(rec?.title || pid)}</strong>
            <p class="detail-note">${status}</p>
          </div>`;
      }).join("");
    }
  }

  function finishQuiz() {
    state.phase = "done";
    updateSideProgress();

    // 統計
    let totalCorrect = 0, totalWrong = 0;
    const wrongIds = [];
    state.allPracticeIds.forEach((pid) => {
      const sc = state.scores[pid] || { correct: 0, wrong: 0 };
      totalCorrect += sc.correct;
      totalWrong   += sc.wrong;
      if (sc.wrong > 0) wrongIds.push(pid);
    });
    const totalQ = totalCorrect + totalWrong;
    const pct    = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

    if (el.quizDoneTitle) el.quizDoneTitle.textContent = `${pct}% 正確率`;
    if (el.quizDoneScore) {
      el.quizDoneScore.textContent = `答對 ${totalCorrect} / ${totalQ} 題`;
    }
    if (el.quizScoreTableBody) {
      el.quizScoreTableBody.innerHTML = state.allPracticeIds.map((pid) => {
        const rec = getPracticeRecord(pid);
        const sc  = state.scores[pid] || { correct: 0, wrong: 0 };
        const q   = sc.correct + sc.wrong;
        const p   = q > 0 ? Math.round((sc.correct / q) * 100) : "-";
        return `<tr>
          <td>${escapeHtml(rec?.title || pid)}</td>
          <td class="score-correct">${sc.correct}</td>
          <td class="score-wrong">${sc.wrong}</td>
          <td>${p}${typeof p === "number" ? "%" : ""}</td>
        </tr>`;
      }).join("");
    }

    // 存回進度：全對 → 已完成；有錯 → 部分完成
    if (progressStore && state.playlistId) {
      const dateKey = playlistStore.getById(state.playlistId)?.playlistType === "日程型"
        ? state.selectedDate : "";
      state.allPracticeIds.forEach((pid) => {
        const sc = state.scores[pid] || { correct: 0, wrong: 0 };
        const attempted = sc.correct + sc.wrong;
        if (attempted === 0) return; // 未答不更新
        if (sc.wrong === 0) {
          progressStore.mark(state.playlistId, dateKey, pid);        // 全對 → ✓ 已完成
        } else {
          progressStore.markPartial(state.playlistId, dateKey, pid); // 有錯 → △ 部分完成
        }
      });
    }

    if (el.quizRetryWrongButton) {
      el.quizRetryWrongButton.hidden = wrongIds.length === 0;
      el.quizRetryWrongButton.onclick = async () => {
        if (wrongIds.length) await startQuiz(wrongIds);
      };
    }

    showPhase("done");
  }

  // ── 畫面切換 ───────────────────────────────────────────────────────────────
  function showPhase(phase) {
    if (el.quizSetupPanel)   el.quizSetupPanel.hidden   = phase !== "setup";
    if (el.quizRunningPanel) el.quizRunningPanel.hidden  = phase !== "running";
    if (el.quizDonePanel)    el.quizDonePanel.hidden     = phase !== "done";
    if (el.quizSideProgress) el.quizSideProgress.hidden  = phase === "setup";
    // 設定面板的月曆依 phase 而定
    if (el.quizCalendarSection) {
      const pl = playlistStore.getById(state.playlistId);
      el.quizCalendarSection.hidden = phase !== "setup" || pl?.playlistType !== "日程型";
    }
  }

  function resetToSetup() {
    state.phase        = "setup";
    state.practiceIds  = [];
    state.scores       = {};
    state.generated    = null;
    state.currentPracticeIdx  = 0;
    state.currentQuestionIdx  = 0;
    state.questionPhase = "question";
    showPhase("setup");
    renderPlaylistCards();
    renderCalendar();
    updateSetupPanel();
  }

  // ── 事件綁定 ───────────────────────────────────────────────────────────────
  el.quizGradeSelect?.addEventListener("change", () => {
    state.gradeFilter  = String(el.quizGradeSelect.value || "全部年級").trim();
    state.playlistId   = "";
    state.selectedDate = "";
    renderPlaylistCards();
    renderCalendar();
    updateSetupPanel();
  });

  el.quizCalPrev?.addEventListener("click", () => {
    if (state.calMonth === 0) { state.calYear -= 1; state.calMonth = 11; }
    else state.calMonth -= 1;
    renderCalendar();
  });
  el.quizCalNext?.addEventListener("click", () => {
    if (state.calMonth === 11) { state.calYear += 1; state.calMonth = 0; }
    else state.calMonth += 1;
    renderCalendar();
  });

  el.quizStartButton?.addEventListener("click", async () => {
    await startQuiz();
  });

  el.quizRetryButton?.addEventListener("click", () => {
    resetToSetup();
  });

  // 初始化
  resetToSetup();
})();
