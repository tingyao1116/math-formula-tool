(() => {
  const store = window.formulaDataStore || null;
  const toolkit = window.formulaToolkit || null;
  const practiceStore = window.formulaPracticeStore || null;
  const practiceLibrary = window.practiceLibraryStore || null;
  const generatorLoader = window.practiceGeneratorLoader || null;
  const playlistStore = window.practicePlaylistStore || null;

  if (!store || !toolkit || !practiceStore || !practiceLibrary || !playlistStore) {
    console.warn("playlist builder dependencies not loaded");
    return;
  }

  const elements = {
    playlistTitleInput: document.getElementById("playlistTitleInput"),
    playlistDescriptionInput: document.getElementById("playlistDescriptionInput"),
    playlistQuestionCountInput: document.getElementById("playlistQuestionCountInput"),
    playlistShuffleInput: document.getElementById("playlistShuffleInput"),
    savePlaylistButton: document.getElementById("savePlaylistButton"),
    newPlaylistButton: document.getElementById("newPlaylistButton"),
    exportPlaylistButton: document.getElementById("exportPlaylistButton"),
    importPlaylistInput: document.getElementById("importPlaylistInput"),
    playlistBuilderStatus: document.getElementById("playlistBuilderStatus"),
    storedPlaylistCount: document.getElementById("storedPlaylistCount"),
    storedPlaylistList: document.getElementById("storedPlaylistList"),
    selectedPracticeCount: document.getElementById("selectedPracticeCount"),
    selectedPracticeList: document.getElementById("selectedPracticeList"),
    playlistSelectionSummary: document.getElementById("playlistSelectionSummary"),
    playlistKeywordInput: document.getElementById("playlistKeywordInput"),
    playlistChapterFilter: document.getElementById("playlistChapterFilter"),
    playlistDifficultyFilter: document.getElementById("playlistDifficultyFilter"),
    playlistSelectVisibleButton: document.getElementById("playlistSelectVisibleButton"),
    playlistClearVisibleButton: document.getElementById("playlistClearVisibleButton"),
    playlistPracticeTableBody: document.getElementById("playlistPracticeTableBody"),
  };

  const chapterOptionByCode = new Map(
    (store.getChapterOptions?.() || []).map((entry) => [String(entry?.code || "").trim(), entry]),
  );

  const practices = Object.values(practiceLibrary.byId || {})
    .filter((record) => record && record.enabled !== false)
    .map((record) => {
      const chapterCode = String(record.chapterCode || "").trim();
      const chapterMeta = chapterOptionByCode.get(chapterCode) || null;
      return {
        id: String(record.id || "").trim(),
        title: String(record.title || record.id || "").trim(),
        chapterCode,
        chapterLabel: String(chapterMeta?.label || record.chapter || chapterCode).trim(),
        difficulty: String(record.difficulty || "").trim() || "未標記",
        record,
      };
    })
    .sort((a, b) => a.chapterCode.localeCompare(b.chapterCode) || a.title.localeCompare(b.title, "zh-Hant"));

  const state = {
    activePlaylistId: "",
    selectedPracticeIds: [],
    sampleByPracticeId: {},
    autoGeneratingSamples: false,
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderMathText(value) {
    return toolkit.renderRichTextLine(String(value ?? ""));
  }

  function getSelectedPracticeIds() {
    return Array.isArray(state.selectedPracticeIds) ? state.selectedPracticeIds : [];
  }

  function isSelected(practiceId) {
    return getSelectedPracticeIds().includes(practiceId);
  }

  function addSelectedPractice(practiceId) {
    if (!practiceId || isSelected(practiceId)) return;
    state.selectedPracticeIds = getSelectedPracticeIds().concat(practiceId);
  }

  function removeSelectedPractice(practiceId) {
    state.selectedPracticeIds = getSelectedPracticeIds().filter((id) => id !== practiceId);
  }

  function moveSelectedPractice(practiceId, direction) {
    const list = getSelectedPracticeIds().slice();
    const index = list.indexOf(practiceId);
    if (index < 0) return;
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= list.length) return;
    [list[index], list[nextIndex]] = [list[nextIndex], list[index]];
    state.selectedPracticeIds = list;
  }

  function currentFilter() {
    return {
      keyword: String(elements.playlistKeywordInput.value || "").trim().toLowerCase(),
      chapter: String(elements.playlistChapterFilter.value || "").trim(),
      difficulty: String(elements.playlistDifficultyFilter.value || "").trim(),
    };
  }

  function getVisiblePractices() {
    const { keyword, chapter, difficulty } = currentFilter();
    return practices.filter((practice) => {
      if (chapter && chapter !== "全部" && practice.chapterCode !== chapter) return false;
      if (difficulty && difficulty !== "全部" && practice.difficulty !== difficulty) return false;
      if (!keyword) return true;
      const blob = [practice.id, practice.title, practice.chapterCode, practice.chapterLabel, practice.difficulty]
        .join(" ")
        .toLowerCase();
      return blob.includes(keyword);
    });
  }

  function readFormPlaylist() {
    return playlistStore.normalizePlaylist({
      id: state.activePlaylistId || "",
      title: elements.playlistTitleInput.value,
      description: elements.playlistDescriptionInput.value,
      practiceIds: getSelectedPracticeIds(),
      questionCount: Number(elements.playlistQuestionCountInput.value) || 5,
      shufflePractices: Boolean(elements.playlistShuffleInput.checked),
      enabled: true,
    });
  }

  function fillForm(playlist) {
    elements.playlistTitleInput.value = playlist?.title || "";
    elements.playlistDescriptionInput.value = playlist?.description || "";
    elements.playlistQuestionCountInput.value = String(playlist?.questionCount || 5);
    elements.playlistShuffleInput.checked = Boolean(playlist?.shufflePractices);
    state.activePlaylistId = String(playlist?.id || "").trim();
    state.selectedPracticeIds = Array.isArray(playlist?.practiceIds) ? playlist.practiceIds.slice() : [];
    render();
  }

  function renderStoredPlaylists() {
    const playlists = playlistStore.loadAll();
    elements.storedPlaylistCount.textContent = `${playlists.length} 份`;
    elements.storedPlaylistList.innerHTML = playlists.length
      ? playlists
          .map(
            (playlist) => `
              <div class="playlist-saved-card${playlist.id === state.activePlaylistId ? " is-active" : ""}">
                <button type="button" class="ghost-button" data-load-playlist="${escapeHtml(playlist.id)}">
                  載入
                </button>
                <div class="playlist-saved-card__body">
                  <strong>${escapeHtml(playlist.title)}</strong>
                  <p>${escapeHtml(playlist.description || "沒有補充說明")}</p>
                  <div class="playlist-saved-card__meta">
                    <span>${playlist.practiceIds.length} 題型</span>
                    <span>${escapeHtml(playlist.updatedAt.slice(0, 16).replace("T", " "))}</span>
                  </div>
                </div>
                <button type="button" class="ghost-button" data-delete-playlist="${escapeHtml(playlist.id)}">
                  刪除
                </button>
              </div>
            `,
          )
          .join("")
      : `<p class="detail-note">目前還沒有儲存的 playlist。</p>`;

    elements.storedPlaylistList.querySelectorAll("[data-load-playlist]").forEach((button) => {
      button.addEventListener("click", () => {
        const playlist = playlistStore.getById(button.getAttribute("data-load-playlist"));
        if (playlist) fillForm(playlist);
      });
    });

    elements.storedPlaylistList.querySelectorAll("[data-delete-playlist]").forEach((button) => {
      button.addEventListener("click", () => {
        playlistStore.remove(button.getAttribute("data-delete-playlist"));
        if (state.activePlaylistId === button.getAttribute("data-delete-playlist")) {
          fillForm(null);
        } else {
          renderStoredPlaylists();
        }
      });
    });
  }

  function renderFilters() {
    const chapterValues = ["全部"].concat(
      Array.from(new Set(practices.map((practice) => practice.chapterCode))).filter(Boolean),
    );
    const difficultyValues = ["全部"].concat(
      Array.from(new Set(practices.map((practice) => practice.difficulty))).filter(Boolean),
    );

    if (!elements.playlistChapterFilter.options.length) {
      elements.playlistChapterFilter.innerHTML = chapterValues
        .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
        .join("");
    }
    if (!elements.playlistDifficultyFilter.options.length) {
      elements.playlistDifficultyFilter.innerHTML = difficultyValues
        .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
        .join("");
    }
  }

  function renderTable() {
    const visiblePractices = getVisiblePractices();
    elements.playlistSelectionSummary.textContent = `已選 ${getSelectedPracticeIds().length} 題型 / 目前顯示 ${visiblePractices.length} 題型`;
    elements.playlistPracticeTableBody.innerHTML = visiblePractices.length
      ? visiblePractices
          .map((practice) => {
            const sample = state.sampleByPracticeId[practice.id] || "尚未生成範例";
            return `
              <tr>
                <td>
                  <input type="checkbox" data-practice-id="${escapeHtml(practice.id)}" ${
                    isSelected(practice.id) ? "checked" : ""
                  } />
                </td>
                <td class="playlist-title-cell">
                  <strong>${escapeHtml(practice.title)}</strong>
                  <div class="detail-note">${escapeHtml(practice.id)}</div>
                </td>
                <td>${escapeHtml(practice.chapterCode || "未分類")}</td>
                <td>${escapeHtml(practice.difficulty)}</td>
                <td>
                  <div class="playlist-sample-cell">
                    <div class="playlist-sample-cell__text">${renderMathText(sample)}</div>
                  </div>
                </td>
                <td>
                  <button
                    class="ghost-button playlist-refresh-button"
                    type="button"
                    data-sample-practice="${escapeHtml(practice.id)}"
                    aria-label="更新範例"
                    title="更新範例"
                  >⟳</button>
                </td>
              </tr>
            `;
          })
          .join("")
      : `<tr><td colspan="6">目前沒有符合條件的題型。</td></tr>`;

    elements.playlistPracticeTableBody.querySelectorAll("[data-practice-id]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const practiceId = String(checkbox.getAttribute("data-practice-id") || "").trim();
        if (!practiceId) return;
        if (checkbox.checked) {
          addSelectedPractice(practiceId);
        } else {
          removeSelectedPractice(practiceId);
        }
        render();
      });
    });

    elements.playlistPracticeTableBody.querySelectorAll("[data-sample-practice]").forEach((button) => {
      button.addEventListener("click", async () => {
        await generateSample(String(button.getAttribute("data-sample-practice") || "").trim());
      });
    });
  }

  async function generateSample(practiceId) {
    const practice = practices.find((item) => item.id === practiceId);
    if (!practice) return;
    state.sampleByPracticeId[practiceId] = "生成中...";
    renderTable();

    try {
      const config = practiceStore.getConfig?.(practice.id);
      if (!config && generatorLoader?.ensureForPractice) {
        await generatorLoader.ensureForPractice(practice.record);
      }
      const nextConfig = practiceStore.getConfig?.(practice.id);
      if (!nextConfig || typeof nextConfig.generate !== "function") {
        state.sampleByPracticeId[practiceId] = "目前無法生成範例";
        renderTable();
        return;
      }
      const result = nextConfig.generate(practice.record) || {};
      const question = Array.isArray(result.questions) ? String(result.questions[0] || "").trim() : "";
      state.sampleByPracticeId[practiceId] = question || "此題型目前沒有可顯示的第一題";
    } catch (_error) {
      state.sampleByPracticeId[practiceId] = "生成失敗";
    }
    renderTable();
  }

  function renderSelectedPractices() {
    const selectedIds = getSelectedPracticeIds();
    elements.selectedPracticeCount.textContent = `${selectedIds.length} 題型`;
    if (!selectedIds.length) {
      elements.selectedPracticeList.innerHTML = `<p class="detail-note">目前還沒有選取任何題型。</p>`;
      return;
    }

    elements.selectedPracticeList.innerHTML = selectedIds
      .map((practiceId, index) => {
        const practice = practices.find((item) => item.id === practiceId);
        const title = practice?.title || practiceId;
        const chapterCode = practice?.chapterCode || "";
        return `
          <div class="playlist-selected-card">
            <div class="playlist-selected-card__body">
              <div class="playlist-selected-card__title-row">
                <span class="meta-chip">#${index + 1}</span>
                <strong>${escapeHtml(title)}</strong>
                <button
                  type="button"
                  class="ghost-button playlist-mini-button"
                  data-move-up="${escapeHtml(practiceId)}"
                  aria-label="上移"
                  title="上移"
                >↑</button>
                <button
                  type="button"
                  class="ghost-button playlist-mini-button"
                  data-move-down="${escapeHtml(practiceId)}"
                  aria-label="下移"
                  title="下移"
                >↓</button>
              </div>
              <div class="detail-note">${escapeHtml(chapterCode)} · ${escapeHtml(practiceId)}</div>
            </div>
          </div>
        `;
      })
      .join("");

    elements.selectedPracticeList.querySelectorAll("[data-move-up]").forEach((button) => {
      button.addEventListener("click", () => {
        moveSelectedPractice(String(button.getAttribute("data-move-up") || "").trim(), "up");
        render();
      });
    });
    elements.selectedPracticeList.querySelectorAll("[data-move-down]").forEach((button) => {
      button.addEventListener("click", () => {
        moveSelectedPractice(String(button.getAttribute("data-move-down") || "").trim(), "down");
        render();
      });
    });
  }

  async function generateVisibleSamples({ forceRefresh = false, limit = Infinity } = {}) {
    if (state.autoGeneratingSamples) return;
    const targets = getVisiblePractices()
      .filter((practice) => forceRefresh || !state.sampleByPracticeId[practice.id])
      .slice(0, Number.isFinite(limit) ? Math.max(1, limit) : undefined);
    if (!targets.length) return;

    state.autoGeneratingSamples = true;
    elements.playlistBuilderStatus.textContent = `正在生成目前列表的範例（${targets.length} 題型）...`;
    for (const practice of targets) {
      // Sequential generation keeps the page responsive and avoids hammering lazy loaders.
      await generateSample(practice.id);
    }
    state.autoGeneratingSamples = false;
    elements.playlistBuilderStatus.textContent = `已更新目前列表的範例（${targets.length} 題型）。`;
  }

  function render() {
    renderFilters();
    renderStoredPlaylists();
    renderTable();
    renderSelectedPractices();
  }

  function downloadJson(filename, text) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  elements.savePlaylistButton?.addEventListener("click", () => {
    const playlist = readFormPlaylist();
    const saved = playlistStore.upsert(playlist);
    state.activePlaylistId = saved.id;
    elements.playlistBuilderStatus.textContent = `已儲存：${saved.title}`;
    renderStoredPlaylists();
  });

  elements.newPlaylistButton?.addEventListener("click", () => {
    state.activePlaylistId = "";
    state.selectedPracticeIds = [];
    elements.playlistTitleInput.value = "";
    elements.playlistDescriptionInput.value = "";
    elements.playlistQuestionCountInput.value = "5";
    elements.playlistShuffleInput.checked = false;
    elements.playlistBuilderStatus.textContent = "已建立新的空白清單。";
    render();
  });

  elements.exportPlaylistButton?.addEventListener("click", () => {
    const playlist = readFormPlaylist();
    downloadJson(`${playlist.id || "practice-playlist"}.json`, playlistStore.exportJson(playlist));
  });

  elements.importPlaylistInput?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const playlist = playlistStore.importJson(text);
    fillForm(playlist);
    elements.playlistBuilderStatus.textContent = `已載入匯入清單：${playlist.title}`;
    event.target.value = "";
  });

  elements.playlistKeywordInput?.addEventListener("input", renderTable);
  elements.playlistChapterFilter?.addEventListener("change", async () => {
    renderTable();
    await generateVisibleSamples({ forceRefresh: true, limit: Infinity });
  });
  elements.playlistDifficultyFilter?.addEventListener("change", renderTable);

  elements.playlistSelectVisibleButton?.addEventListener("click", () => {
    getVisiblePractices().forEach((practice) => addSelectedPractice(practice.id));
    render();
  });

  elements.playlistClearVisibleButton?.addEventListener("click", () => {
    getVisiblePractices().forEach((practice) => removeSelectedPractice(practice.id));
    render();
  });

  render();
  void generateVisibleSamples({ forceRefresh: false, limit: 8 });
})();
