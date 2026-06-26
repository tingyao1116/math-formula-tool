(() => {
  const toolkit = window.formulaToolkit || null;
  const practiceStore = window.formulaPracticeStore || null;
  const practiceLibrary = window.practiceLibraryStore || null;
  const generatorLoader = window.practiceGeneratorLoader || null;
  const playlistStore = window.practicePlaylistStore || null;

  if (!toolkit || !practiceStore || !practiceLibrary || !playlistStore) {
    console.warn("playlist player dependencies not loaded");
    return;
  }

  const elements = {
    playlistPlayerSelect: document.getElementById("playlistPlayerSelect"),
    playlistPlayerStatus: document.getElementById("playlistPlayerStatus"),
    playlistPlayerTitle: document.getElementById("playlistPlayerTitle"),
    playlistPlayerMeta: document.getElementById("playlistPlayerMeta"),
    playlistPlayerDescription: document.getElementById("playlistPlayerDescription"),
    playlistPlayerPracticeCount: document.getElementById("playlistPlayerPracticeCount"),
    playlistPlayerPracticeList: document.getElementById("playlistPlayerPracticeList"),
    playlistPlayerHint: document.getElementById("playlistPlayerHint"),
    playlistPlayerCard: document.getElementById("playlistPlayerCard"),
    playlistPlayerAnswerPanel: document.getElementById("playlistPlayerAnswerPanel"),
    playlistPrevPracticeButton: document.getElementById("playlistPrevPracticeButton"),
    playlistNextPracticeButton: document.getElementById("playlistNextPracticeButton"),
    playlistGenerateButton: document.getElementById("playlistGenerateButton"),
  };

  const state = {
    playlistId: "",
    practiceId: "",
    generated: null,
    questionIndex: 0,
    answerVisible: false,
    detailVisible: false,
    loading: false,
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getPlaylists() {
    return playlistStore.loadAll();
  }

  function getActivePlaylist() {
    return playlistStore.getById(state.playlistId || elements.playlistPlayerSelect.value);
  }

  function getActivePracticeIds() {
    return Array.isArray(getActivePlaylist()?.practiceIds) ? getActivePlaylist().practiceIds : [];
  }

  function getPracticeRecord(practiceId) {
    return practiceLibrary.byId?.[practiceId] || null;
  }

  function normalizeGeneratedSet(result) {
    const normalized = toolkit.normalizeGeneratedPracticeResult?.(result) || result || {};
    return {
      intro: String(normalized.intro || "").trim(),
      questions: Array.isArray(normalized.questions) ? normalized.questions : [],
      summaryAnswers: Array.isArray(normalized.summaryAnswers) ? normalized.summaryAnswers : [],
      answers: Array.isArray(normalized.answers) ? normalized.answers : [],
    };
  }

  async function ensurePracticeConfig(practiceRecord) {
    let config = practiceStore.getConfig?.(practiceRecord.id);
    if (config?.generate) return config;
    if (generatorLoader?.ensureForPractice) {
      await generatorLoader.ensureForPractice(practiceRecord);
    }
    config = practiceStore.getConfig?.(practiceRecord.id);
    return config || null;
  }

  async function generateCurrentPractice() {
    const playlist = getActivePlaylist();
    const practiceRecord = getPracticeRecord(state.practiceId);
    if (!playlist || !practiceRecord) return;

    state.loading = true;
    elements.playlistPlayerHint.textContent = "正在生成題目...";
    elements.playlistGenerateButton.disabled = true;

    try {
      const config = await ensurePracticeConfig(practiceRecord);
      if (!config || typeof config.generate !== "function") {
        state.generated = null;
        elements.playlistPlayerHint.textContent = "這個題型目前無法生成題目。";
        renderPlayerCard();
        return;
      }

      const runtimeConfig = {
        ...config,
        questionCount: Math.max(1, Number(playlist.questionCount) || 5),
      };
      const result = runtimeConfig.generate.call(runtimeConfig, practiceRecord) || {};
      state.generated = normalizeGeneratedSet(result);
      state.questionIndex = 0;
      state.answerVisible = false;
      state.detailVisible = false;
      elements.playlistPlayerHint.textContent = "題目已生成，可以看題、看答案、再換題。";
    } catch (_error) {
      state.generated = null;
      elements.playlistPlayerHint.textContent = "生成失敗，請改選別的題型或再試一次。";
    } finally {
      state.loading = false;
      elements.playlistGenerateButton.disabled = false;
      renderPlayerCard();
    }
  }

  function renderPlaylistOptions() {
    const playlists = getPlaylists();
    elements.playlistPlayerSelect.innerHTML = playlists.length
      ? playlists
          .map((playlist) => `<option value="${escapeHtml(playlist.id)}">${escapeHtml(playlist.title)}</option>`)
          .join("")
      : `<option value="">目前沒有已儲存的 playlist</option>`;
    if (!state.playlistId && playlists[0]) {
      state.playlistId = playlists[0].id;
      elements.playlistPlayerSelect.value = playlists[0].id;
    }
  }

  function renderPracticeList() {
    const playlist = getActivePlaylist();
    const practiceIds = Array.isArray(playlist?.practiceIds) ? playlist.practiceIds : [];
    elements.playlistPlayerPracticeCount.textContent = `${practiceIds.length} 題型`;
    elements.playlistPlayerPracticeList.innerHTML = practiceIds.length
      ? practiceIds
          .map((practiceId, index) => {
            const record = getPracticeRecord(practiceId);
            const isActive = practiceId === state.practiceId;
            return `
              <button type="button" class="playlist-player-card${isActive ? " is-active" : ""}" data-playlist-practice="${escapeHtml(practiceId)}">
                <strong>#${index + 1} ${escapeHtml(record?.title || practiceId)}</strong>
                <p>${escapeHtml(record?.chapterCode || "未標記章節")} · ${escapeHtml(record?.difficulty || "未標記難度")}</p>
                <div class="detail-note">${escapeHtml(practiceId)}</div>
              </button>
            `;
          })
          .join("")
      : `<p class="detail-note">這份 playlist 目前沒有選到任何題型。</p>`;

    elements.playlistPlayerPracticeList.querySelectorAll("[data-playlist-practice]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextPracticeId = String(button.getAttribute("data-playlist-practice") || "").trim();
        if (!nextPracticeId) return;
        state.practiceId = nextPracticeId;
        state.generated = null;
        state.answerVisible = false;
        state.detailVisible = false;
        elements.playlistPlayerHint.textContent = "已切換題型，按出題即可開始。";
        render();
      });
    });
  }

  function renderPlayerCard() {
    const practiceRecord = getPracticeRecord(state.practiceId);
    if (!practiceRecord) {
      elements.playlistPlayerCard.className = "ability-session-card is-empty";
      elements.playlistPlayerCard.innerHTML = `<p>請先選一個題型。</p>`;
      elements.playlistPlayerAnswerPanel.hidden = true;
      return;
    }

    if (!state.generated || !state.generated.questions.length) {
      elements.playlistPlayerCard.className = "ability-session-card is-empty";
      elements.playlistPlayerCard.innerHTML = `
        <p><strong>${escapeHtml(practiceRecord.title || state.practiceId)}</strong></p>
        <p>按「出題」後會從這個題型抽出目前 playlist 設定題數的題目。</p>
      `;
      elements.playlistPlayerAnswerPanel.hidden = true;
      return;
    }

    const index = Math.max(0, Math.min(state.questionIndex, state.generated.questions.length - 1));
    const question = state.generated.questions[index] || "";
    const summaryAnswer = state.generated.summaryAnswers[index] || "";
    const detailAnswer = state.generated.answers[index] || summaryAnswer;

    elements.playlistPlayerCard.className = "ability-session-card";
    elements.playlistPlayerCard.innerHTML = `
      <div class="ability-session-card__meta">
        <span class="meta-chip">${escapeHtml(practiceRecord.chapterCode || "未標記章節")}</span>
        <span class="meta-chip">${escapeHtml(practiceRecord.difficulty || "未標記難度")}</span>
        <span class="meta-chip">第 ${index + 1} / ${state.generated.questions.length} 題</span>
      </div>
      ${state.generated.intro ? `<p class="practice-intro">${toolkit.renderRichTextLine(state.generated.intro)}</p>` : ""}
      <div class="interactive-output">${toolkit.renderRichTextLine(question)}</div>
      <div class="ability-session-card__actions">
        <button id="playlistPrevQuestionButton" class="ghost-button" type="button">上一題</button>
        <button id="playlistNextQuestionButton" class="ghost-button" type="button">下一題</button>
        <button id="playlistToggleAnswerButton" class="ghost-button" type="button">${state.answerVisible ? "隱藏答案" : "看答案"}</button>
        <button id="playlistToggleDetailButton" class="ghost-button" type="button">${state.detailVisible ? "隱藏詳解" : "看詳解"}</button>
      </div>
    `;

    elements.playlistPlayerAnswerPanel.hidden = !state.answerVisible && !state.detailVisible;
    elements.playlistPlayerAnswerPanel.innerHTML = `
      <div class="ability-feedback-panel__body">
        ${state.answerVisible ? `<p><strong>簡答：</strong>${toolkit.renderRichTextLine(summaryAnswer || "目前沒有簡答")}</p>` : ""}
        ${state.detailVisible ? `<p><strong>詳解：</strong>${toolkit.renderRichTextLine(detailAnswer || "目前沒有詳解")}</p>` : ""}
      </div>
    `;

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

  function renderSelectedPlaylist() {
    const playlist = getActivePlaylist();
    if (!playlist) {
      elements.playlistPlayerTitle.textContent = "尚未選擇";
      elements.playlistPlayerMeta.textContent = "";
      elements.playlistPlayerDescription.textContent = "請先回編輯頁建立一份 playlist。";
      elements.playlistPlayerStatus.textContent = "目前沒有可讀取的清單。";
      state.practiceId = "";
      state.generated = null;
      renderPracticeList();
      renderPlayerCard();
      return;
    }

    state.playlistId = playlist.id;
    elements.playlistPlayerTitle.textContent = playlist.title;
    elements.playlistPlayerMeta.textContent = `${playlist.practiceIds.length} 題型 · 每題型 ${playlist.questionCount} 題`;
    elements.playlistPlayerDescription.textContent = playlist.description || "這份清單沒有補充說明。";
    elements.playlistPlayerStatus.textContent = "左側選題型，右側出題。";

    if (!playlist.practiceIds.includes(state.practiceId)) {
      state.practiceId = playlist.practiceIds[0] || "";
      state.generated = null;
      state.answerVisible = false;
      state.detailVisible = false;
    }

    renderPracticeList();
    renderPlayerCard();
  }

  function movePractice(step) {
    const practiceIds = getActivePracticeIds();
    const currentIndex = practiceIds.indexOf(state.practiceId);
    if (currentIndex < 0) return;
    const nextIndex = currentIndex + step;
    if (nextIndex < 0 || nextIndex >= practiceIds.length) return;
    state.practiceId = practiceIds[nextIndex];
    state.generated = null;
    state.answerVisible = false;
    state.detailVisible = false;
    elements.playlistPlayerHint.textContent = "已切換題型，按出題即可開始。";
    render();
  }

  function render() {
    renderSelectedPlaylist();
    elements.playlistPrevPracticeButton.disabled = !state.practiceId;
    elements.playlistNextPracticeButton.disabled = !state.practiceId;
    elements.playlistGenerateButton.disabled = !state.practiceId || state.loading;
  }

  elements.playlistPlayerSelect?.addEventListener("change", () => {
    state.playlistId = String(elements.playlistPlayerSelect.value || "").trim();
    state.practiceId = "";
    state.generated = null;
    state.answerVisible = false;
    state.detailVisible = false;
    render();
  });

  elements.playlistPrevPracticeButton?.addEventListener("click", () => {
    movePractice(-1);
  });

  elements.playlistNextPracticeButton?.addEventListener("click", () => {
    movePractice(1);
  });

  elements.playlistGenerateButton?.addEventListener("click", async () => {
    await generateCurrentPractice();
  });

  renderPlaylistOptions();
  render();
})();
