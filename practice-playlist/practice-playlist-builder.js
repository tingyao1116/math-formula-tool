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

  const ALL_FILTER_VALUE = "\u5168\u90e8";
  const DEFAULT_CHAPTER_FILTER = "j1-1-1";

  const elements = {
    playlistTitleInput: document.getElementById("playlistTitleInput"),
    playlistGradeSelect: document.getElementById("playlistGradeSelect"),
    playlistTypeSelect: document.getElementById("playlistTypeSelect"),
    playlistDescriptionInput: document.getElementById("playlistDescriptionInput"),
    playlistQuestionCountInput: document.getElementById("playlistQuestionCountInput"),
    playlistShuffleInput: document.getElementById("playlistShuffleInput"),
    savePlaylistButton: document.getElementById("savePlaylistButton"),
    newPlaylistButton: document.getElementById("newPlaylistButton"),
    exportPlaylistButton: document.getElementById("exportPlaylistButton"),
    saveDataFileButton: document.getElementById("saveDataFileButton"),
    importPlaylistInput: document.getElementById("importPlaylistInput"),
    playlistBuilderStatus: document.getElementById("playlistBuilderStatus"),
    storedPlaylistCount: document.getElementById("storedPlaylistCount"),
    storedPlaylistSelect: document.getElementById("storedPlaylistSelect"),
    storedPlaylistLoadButton: document.getElementById("storedPlaylistLoadButton"),
    storedPlaylistDeleteButton: document.getElementById("storedPlaylistDeleteButton"),
    storedPlaylistInfo: document.getElementById("storedPlaylistInfo"),
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

  // 填入年級 / 類型選項
  if (elements.playlistGradeSelect) {
    elements.playlistGradeSelect.innerHTML = playlistStore.GRADE_OPTIONS.map(
      (g) => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`
    ).join("");
  }
  if (elements.playlistTypeSelect) {
    elements.playlistTypeSelect.innerHTML = playlistStore.PLAYLIST_TYPES.map(
      (t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`
    ).join("");
  }

  // ── File System Access API（IndexedDB 快取 handle）─────────────────────────
  const FS_DB_NAME  = "playlist-fs-handles";
  const FS_DB_VER   = 1;
  const FS_STORE    = "handles";
  const FS_KEY      = "practice-playlists-js";

  function openFsDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(FS_DB_NAME, FS_DB_VER);
      req.onupgradeneeded = (e) => e.target.result.createObjectStore(FS_STORE);
      req.onsuccess  = (e) => resolve(e.target.result);
      req.onerror    = () => reject(req.error);
    });
  }

  async function getStoredHandle() {
    try {
      const db  = await openFsDb();
      return await new Promise((resolve) => {
        const tx  = db.transaction(FS_STORE, "readonly");
        const req = tx.objectStore(FS_STORE).get(FS_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror   = () => resolve(null);
      });
    } catch (_) { return null; }
  }

  async function storeHandle(handle) {
    try {
      const db = await openFsDb();
      await new Promise((resolve) => {
        const tx = db.transaction(FS_STORE, "readwrite");
        tx.objectStore(FS_STORE).put(handle, FS_KEY);
        tx.oncomplete = resolve;
        tx.onerror    = resolve;
      });
    } catch (_) {}
  }

  // 直接寫入 practice-playlists.js（第一次選檔，之後直接覆寫）
  async function saveDataFileDirect() {
    if (!("showSaveFilePicker" in window)) {
      // 瀏覽器不支援 File System Access API → fallback 下載
      downloadBlob("practice-playlists.js", playlistStore.generateDataFileContent(), "text/javascript");
      setStatus("已下載 practice-playlists.js（此瀏覽器不支援直接儲存，請手動替換檔案）。");
      return;
    }

    try {
      let handle = await getStoredHandle();
      let needPick = !handle;

      // 若有快取 handle，先確認寫入權限
      if (handle) {
        const perm = await handle.queryPermission({ mode: "readwrite" });
        if (perm !== "granted") {
          const req = await handle.requestPermission({ mode: "readwrite" });
          if (req !== "granted") needPick = true;
        }
      }

      if (needPick) {
        handle = await window.showSaveFilePicker({
          suggestedName: "practice-playlists.js",
          types: [{ description: "JavaScript", accept: { "text/javascript": [".js"] } }],
        });
        await storeHandle(handle);
      }

      const writable = await handle.createWritable();
      await writable.write(playlistStore.generateDataFileContent());
      await writable.close();
      setStatus(`已直接寫入 ${handle.name}，重新整理頁面後生效。`);
    } catch (err) {
      if (err.name !== "AbortError") {
        setStatus(`儲存失敗：${err.message}`);
      }
    }
  }

  function setStatus(msg) {
    if (elements.playlistBuilderStatus) elements.playlistBuilderStatus.textContent = msg;
  }

  // ── 題庫清單資料 ──────────────────────────────────────────────────────────
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
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
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
    const selectedOrder = new Map(getSelectedPracticeIds().map((id, index) => [id, index]));
    return practices.filter((practice) => {
      if (chapter && chapter !== "全部" && practice.chapterCode !== chapter) return false;
      if (difficulty && difficulty !== "全部" && practice.difficulty !== difficulty) return false;
      if (!keyword) return true;
      const blob = [practice.id, practice.title, practice.chapterCode, practice.chapterLabel, practice.difficulty]
        .join(" ").toLowerCase();
      return blob.includes(keyword);
    }).sort((a, b) => {
      const aSelected = selectedOrder.has(a.id);
      const bSelected = selectedOrder.has(b.id);
      if (aSelected && bSelected) return selectedOrder.get(a.id) - selectedOrder.get(b.id);
      if (aSelected) return -1;
      if (bSelected) return 1;
      return a.chapterCode.localeCompare(b.chapterCode) || a.title.localeCompare(b.title, "zh-Hant");
    });
  }

  function readFormPlaylist() {
    return playlistStore.normalizePlaylist({
      id: state.activePlaylistId || "",
      title: elements.playlistTitleInput.value,
      grade: elements.playlistGradeSelect?.value || "全部年級",
      playlistType: elements.playlistTypeSelect?.value || "任務型",
      description: elements.playlistDescriptionInput.value,
      practiceIds: getSelectedPracticeIds(),
      questionCount: Number(elements.playlistQuestionCountInput.value) || 5,
      shufflePractices: Boolean(elements.playlistShuffleInput.checked),
      enabled: true,
    });
  }

  function fillForm(playlist) {
    elements.playlistTitleInput.value = playlist?.title || "";
    if (elements.playlistGradeSelect) elements.playlistGradeSelect.value = playlist?.grade || "全部年級";
    if (elements.playlistTypeSelect) elements.playlistTypeSelect.value = playlist?.playlistType || "任務型";
    elements.playlistDescriptionInput.value = playlist?.description || "";
    elements.playlistQuestionCountInput.value = String(playlist?.questionCount || 5);
    elements.playlistShuffleInput.checked = Boolean(playlist?.shufflePractices);
    state.activePlaylistId = String(playlist?.id || "").trim();
    state.selectedPracticeIds = Array.isArray(playlist?.practiceIds) ? playlist.practiceIds.slice() : [];
    if (elements.playlistKeywordInput) elements.playlistKeywordInput.value = "";
    if (elements.playlistDifficultyFilter) elements.playlistDifficultyFilter.value = ALL_FILTER_VALUE;
    if (elements.playlistChapterFilter) {
      elements.playlistChapterFilter.value = playlist ? ALL_FILTER_VALUE : DEFAULT_CHAPTER_FILTER;
    }
    render();
  }

  function getStoredPlaylistFlags(playlistId) {
    const localIds = new Set(playlistStore.loadLocal().map((playlist) => playlist.id));
    const bundledIds = new Set(
      (Array.isArray(window.practicePlaylistData) ? window.practicePlaylistData : [])
        .map((playlist) => String(playlist?.id || "").trim())
        .filter(Boolean),
    );
    return { isLocal: localIds.has(playlistId), isBundled: bundledIds.has(playlistId) };
  }

  function updateStoredPlaylistInfo() {
    if (!elements.storedPlaylistSelect || !elements.storedPlaylistInfo) return;
    const selectedId = String(elements.storedPlaylistSelect.value || "").trim();
    const playlist = selectedId ? playlistStore.getById(selectedId) : null;
    if (!playlist) {
      elements.storedPlaylistInfo.textContent = "目前還沒有儲存的 playlist。";
      if (elements.storedPlaylistDeleteButton) elements.storedPlaylistDeleteButton.disabled = true;
      return;
    }
    const { isLocal, isBundled } = getStoredPlaylistFlags(playlist.id);
    const sourceLabel = isLocal ? (isBundled ? "已調整（可還原內建）" : "自訂") : "內建";
    elements.storedPlaylistInfo.textContent =
      `${playlist.grade || "全部年級"} · ${playlist.playlistType || "任務型"} · ${playlist.practiceIds.length} 題型 · ${sourceLabel}` +
      `${playlist.description ? ` · ${playlist.description}` : ""}` +
      ` · ${playlist.updatedAt.slice(0, 16).replace("T", " ")}`;
    if (elements.storedPlaylistDeleteButton) {
      elements.storedPlaylistDeleteButton.disabled = !isLocal;
      elements.storedPlaylistDeleteButton.textContent = isLocal && isBundled ? "還原內建" : "刪除";
    }
  }

  function renderStoredPlaylists() {
    const playlists = playlistStore.loadAll();
    elements.storedPlaylistCount.textContent = `${playlists.length} 份`;
    if (!elements.storedPlaylistSelect) return;
    const previous = String(elements.storedPlaylistSelect.value || "").trim();
    const selectedId = state.activePlaylistId || previous;
    elements.storedPlaylistSelect.innerHTML = playlists
      .map((playlist) => {
        const selected = playlist.id === selectedId ? " selected" : "";
        return `<option value="${escapeHtml(playlist.id)}"${selected}>${escapeHtml(playlist.title)}（${escapeHtml(playlist.grade || "全部年級")} · ${playlist.practiceIds.length} 題型）</option>`;
      })
      .join("");
    updateStoredPlaylistInfo();
  }

  function renderFilters() {
    const chapterValues = ["全部"].concat(
      Array.from(new Set(practices.map((p) => p.chapterCode))).filter(Boolean),
    );
    const difficultyValues = ["全部"].concat(
      Array.from(new Set(practices.map((p) => p.difficulty))).filter(Boolean),
    );
    if (!elements.playlistChapterFilter.options.length) {
      elements.playlistChapterFilter.innerHTML = chapterValues
        .map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");
      if (chapterValues.includes(DEFAULT_CHAPTER_FILTER)) {
        elements.playlistChapterFilter.value = DEFAULT_CHAPTER_FILTER;
      }
    }
    if (!elements.playlistDifficultyFilter.options.length) {
      elements.playlistDifficultyFilter.innerHTML = difficultyValues
        .map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");
    }
  }

  function renderTable() {
    const visiblePractices = getVisiblePractices();
    elements.playlistSelectionSummary.textContent =
      `已選 ${getSelectedPracticeIds().length} 題型 / 目前顯示 ${visiblePractices.length} 題型`;
    elements.playlistPracticeTableBody.innerHTML = visiblePractices.length
      ? visiblePractices.map((practice) => {
          const sample = state.sampleByPracticeId[practice.id] || "尚未生成範例";
          const sampleIsError = ["目前無法生成範例", "生成失敗"].includes(sample);
          const sampleHtml = sampleIsError
            ? `<span style="color:red;font-weight:bold">${escapeHtml(sample)}</span>`
            : renderMathText(sample);
          return `
            <tr>
              <td><input type="checkbox" data-practice-id="${escapeHtml(practice.id)}" ${isSelected(practice.id) ? "checked" : ""} /></td>
              <td class="playlist-title-cell">
                <strong>${escapeHtml(practice.title)}</strong>
                <div class="detail-note">${escapeHtml(practice.id)}</div>
              </td>
              <td>${escapeHtml(practice.chapterCode || "未分類")}</td>
              <td>${escapeHtml(practice.difficulty)}</td>
              <td><div class="playlist-sample-cell"><div class="playlist-sample-cell__text">${sampleHtml}</div></div></td>
              <td>
                <button class="ghost-button playlist-refresh-button" type="button"
                  data-sample-practice="${escapeHtml(practice.id)}" aria-label="更新範例" title="更新範例">⟳</button>
              </td>
            </tr>`;
        }).join("")
      : `<tr><td colspan="6">目前沒有符合條件的題型。</td></tr>`;

    elements.playlistPracticeTableBody.querySelectorAll("[data-practice-id]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const practiceId = String(checkbox.getAttribute("data-practice-id") || "").trim();
        if (!practiceId) return;
        if (checkbox.checked) addSelectedPractice(practiceId);
        else removeSelectedPractice(practiceId);
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
    elements.selectedPracticeList.innerHTML = selectedIds.map((practiceId, index) => {
      const practice = practices.find((item) => item.id === practiceId);
      const title = practice?.title || practiceId;
      const chapterCode = practice?.chapterCode || "";
      return `
        <div class="playlist-selected-card">
          <div class="playlist-selected-card__body">
            <div class="playlist-selected-card__title-row">
              <span class="meta-chip">#${index + 1}</span>
              <strong>${escapeHtml(title)}</strong>
              <button type="button" class="ghost-button playlist-mini-button" data-move-up="${escapeHtml(practiceId)}" title="上移">↑</button>
              <button type="button" class="ghost-button playlist-mini-button" data-move-down="${escapeHtml(practiceId)}" title="下移">↓</button>
            </div>
            <div class="detail-note">${escapeHtml(chapterCode)} · ${escapeHtml(practiceId)}</div>
          </div>
        </div>`;
    }).join("");

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
    setStatus(`正在生成目前列表的範例（${targets.length} 題型）...`);
    for (const practice of targets) {
      await generateSample(practice.id);
    }
    state.autoGeneratingSamples = false;
    setStatus(`已更新目前列表的範例（${targets.length} 題型）。`);
  }

  function render() {
    renderFilters();
    renderStoredPlaylists();
    renderTable();
    renderSelectedPractices();
  }

  function downloadBlob(filename, content, mimeType = "application/json") {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  // ── 事件綁定 ───────────────────────────────────────────────────────────────

  elements.savePlaylistButton?.addEventListener("click", () => {
    const playlist = readFormPlaylist();
    const saved = playlistStore.upsert(playlist);
    state.activePlaylistId = saved.id;
    setStatus(`已儲存：${saved.title}（${saved.grade} · ${saved.playlistType}）`);
    renderStoredPlaylists();
  });

  elements.newPlaylistButton?.addEventListener("click", () => {
    state.activePlaylistId = "";
    state.selectedPracticeIds = [];
    elements.playlistTitleInput.value = "";
    if (elements.playlistGradeSelect) elements.playlistGradeSelect.value = "全部年級";
    if (elements.playlistTypeSelect) elements.playlistTypeSelect.value = "任務型";
    elements.playlistDescriptionInput.value = "";
    elements.playlistQuestionCountInput.value = "5";
    elements.playlistShuffleInput.checked = false;
    setStatus("已建立新的空白清單。");
    render();
  });

  elements.exportPlaylistButton?.addEventListener("click", () => {
    const playlist = readFormPlaylist();
    downloadBlob(`${playlist.id || "practice-playlist"}.json`, playlistStore.exportJson(playlist));
  });

  // 直接寫入 practice-playlists.js（File System Access API）
  elements.saveDataFileButton?.addEventListener("click", async () => {
    await saveDataFileDirect();
  });

  // 匯入 JSON → 直接儲存到 store
  elements.importPlaylistInput?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const playlist = playlistStore.importJson(text);
      const saved = playlistStore.upsert(playlist);
      fillForm(saved);
      setStatus(`已匯入並儲存：${saved.title}`);
    } catch (err) {
      setStatus(`匯入失敗：${err.message}`);
    }
    event.target.value = "";
  });

  elements.storedPlaylistSelect?.addEventListener("change", updateStoredPlaylistInfo);

  elements.storedPlaylistLoadButton?.addEventListener("click", () => {
    const playlist = playlistStore.getById(elements.storedPlaylistSelect?.value);
    if (playlist) {
      fillForm(playlist);
      setStatus(`已載入清單：${playlist.title}`);
    }
  });

  elements.storedPlaylistDeleteButton?.addEventListener("click", () => {
    const targetId = String(elements.storedPlaylistSelect?.value || "").trim();
    if (!targetId) return;
    const { isLocal } = getStoredPlaylistFlags(targetId);
    if (!isLocal) return;
    playlistStore.remove(targetId);
    if (state.activePlaylistId === targetId) {
      fillForm(null);
    } else {
      renderStoredPlaylists();
    }
    setStatus("已刪除/還原選取的清單。");
  });

  elements.playlistKeywordInput?.addEventListener("input", renderTable);
  elements.playlistChapterFilter?.addEventListener("change", async () => {
    renderTable();
    const selectedChapter = String(elements.playlistChapterFilter.value || "").trim();
    if (selectedChapter && selectedChapter !== "全部") {
      await generateVisibleSamples({ forceRefresh: true, limit: Infinity });
    }
  });
  elements.playlistDifficultyFilter?.addEventListener("change", renderTable);

  elements.playlistSelectVisibleButton?.addEventListener("click", () => {
    getVisiblePractices().forEach((practice) => addSelectedPractice(practice.id));
    render();
  });

  elements.playlistClearVisibleButton?.addEventListener("click", () => {
    const visibleIds = new Set(getVisiblePractices().map((p) => p.id));
    state.selectedPracticeIds = getSelectedPracticeIds().filter((id) => !visibleIds.has(id));
    render();
  });

  render();

  // 提供給主題串編輯器（practice-theme-builder.js）的最小介面：
  // 讀取 / 覆蓋「已選題型順序」，讓主題串可以借用同一個編輯區重排。
  window.practicePlaylistBuilderApi = {
    getSelectedPracticeIds: () => getSelectedPracticeIds().slice(),
    setSelectedPracticeIds: (ids) => {
      state.selectedPracticeIds = Array.isArray(ids)
        ? ids.map((id) => String(id || "").trim()).filter(Boolean)
        : [];
      render();
    },
  };
})();
