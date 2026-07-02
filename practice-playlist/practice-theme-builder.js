// 主題串編輯器（builder 第一模式的延伸）
// 職責：
// 1. 列出主題串資料庫（data/practice-theme-chains.js + localStorage 覆蓋）
// 2. 把主題串載入既有的「已選題型順序」編輯區，重排後存回
// 3. 易→難排序
// 4. 匯出整個主題串成 PDF（題目在前、答案附後，走列印）
// 5. 寫入主題串資料檔（File System Access API）
(() => {
  const toolkit = window.formulaToolkit || null;
  const practiceStore = window.formulaPracticeStore || null;
  const practiceLibrary = window.practiceLibraryStore || null;
  const generatorLoader = window.practiceGeneratorLoader || null;
  const themeStore = window.practiceThemeStore || null;
  const builderApi = window.practicePlaylistBuilderApi || null;

  if (!toolkit || !practiceStore || !practiceLibrary || !themeStore) {
    console.warn("theme builder dependencies not loaded");
    return;
  }

  const elements = {
    keywordInput: document.getElementById("themeKeywordInput"),
    chainCount: document.getElementById("themeChainCount"),
    chainSelect: document.getElementById("themeChainSelect"),
    loadButton: document.getElementById("themeLoadButton"),
    exportPdfButton: document.getElementById("themeExportPdfButton"),
    resetButton: document.getElementById("themeResetButton"),
    activeLabel: document.getElementById("themeActiveLabel"),
    sortDifficultyButton: document.getElementById("themeSortDifficultyButton"),
    saveBackButton: document.getElementById("themeSaveBackButton"),
    writeDataFileButton: document.getElementById("themeWriteDataFileButton"),
    status: document.getElementById("themeBuilderStatus"),
    printRoot: document.getElementById("themePrintRoot"),
  };

  if (!elements.chainSelect) return;

  const state = {
    activeThemeId: "",
    exporting: false,
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function setStatus(message) {
    if (elements.status) elements.status.textContent = message;
  }

  function getDifficulty(practiceId) {
    return practiceLibrary.byId?.[practiceId]?.difficulty || "";
  }

  function getPracticeRecord(practiceId) {
    return practiceLibrary.byId?.[practiceId] || null;
  }

  function renderActiveLabel() {
    if (!elements.activeLabel) return;
    if (!state.activeThemeId) {
      elements.activeLabel.textContent = "尚未載入主題串。";
      return;
    }
    const chain = themeStore.getById(state.activeThemeId);
    elements.activeLabel.textContent = chain
      ? `編輯中：${chain.title}`
      : "尚未載入主題串。";
  }

  function selectedChainId() {
    return String(elements.chainSelect?.value || "").trim();
  }

  function updateResetButton() {
    if (!elements.resetButton) return;
    const localIds = new Set(themeStore.loadLocal().map((chain) => chain.id));
    elements.resetButton.disabled = !localIds.has(selectedChainId());
  }

  function renderChainList() {
    const keyword = String(elements.keywordInput?.value || "").trim().toLowerCase();
    const localIds = new Set(themeStore.loadLocal().map((chain) => chain.id));
    const chains = themeStore.loadAll().filter((chain) => {
      if (!keyword) return true;
      return [chain.id, chain.title, chain.chapterCode].join(" ").toLowerCase().includes(keyword);
    });

    if (elements.chainCount) elements.chainCount.textContent = `${chains.length} 串`;

    const previous = selectedChainId() || state.activeThemeId;
    elements.chainSelect.innerHTML = chains
      .map((chain) => {
        const marker = localIds.has(chain.id) ? "＊" : "";
        const selected = chain.id === previous ? " selected" : "";
        return `<option value="${escapeHtml(chain.id)}"${selected}>${marker}${escapeHtml(chain.title)}（${chain.practiceIds.length} 題型）</option>`;
      })
      .join("");
    updateResetButton();
  }

  function loadTheme(themeId) {
    const chain = themeStore.getById(themeId);
    if (!chain) return;
    state.activeThemeId = chain.id;
    if (builderApi?.setSelectedPracticeIds) {
      builderApi.setSelectedPracticeIds(chain.practiceIds);
    }
    setStatus(`已載入「${chain.title}」到已選題型順序，可用 ↑↓ 調整後存回。`);
    renderActiveLabel();
    renderChainList();
  }

  function saveBack() {
    if (!state.activeThemeId) {
      setStatus("請先從主題串資料庫載入一個主題串。");
      return;
    }
    const chain = themeStore.getById(state.activeThemeId);
    if (!chain) {
      setStatus("找不到編輯中的主題串。");
      return;
    }
    const selectedIds = builderApi?.getSelectedPracticeIds?.() || [];
    if (!selectedIds.length) {
      setStatus("已選題型順序是空的，未存回。");
      return;
    }
    const saved = themeStore.upsert({ ...chain, practiceIds: selectedIds });
    setStatus(`已存回「${saved.title}」（${saved.practiceIds.length} 題型）。要全部落地請按「寫入主題串資料檔」。`);
    renderChainList();
  }

  function sortActiveByDifficulty() {
    const selectedIds = builderApi?.getSelectedPracticeIds?.() || [];
    if (!selectedIds.length) {
      setStatus("已選題型順序是空的，無法排序。");
      return;
    }
    const sorted = themeStore.sortIdsByDifficulty(selectedIds, getDifficulty);
    builderApi?.setSelectedPracticeIds?.(sorted);
    setStatus("已依難度（易→難）重新排序，確認後可存回主題串。");
  }

  // ── 寫入主題串資料檔（File System Access API，與 playlist 用同一個 IndexedDB）──
  const FS_DB_NAME = "playlist-fs-handles";
  const FS_DB_VER = 1;
  const FS_STORE = "handles";
  const FS_KEY = "practice-theme-chains-js";

  function openFsDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(FS_DB_NAME, FS_DB_VER);
      req.onupgradeneeded = (e) => e.target.result.createObjectStore(FS_STORE);
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function getStoredHandle() {
    try {
      const db = await openFsDb();
      return await new Promise((resolve) => {
        const tx = db.transaction(FS_STORE, "readonly");
        const req = tx.objectStore(FS_STORE).get(FS_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
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
        tx.onerror = resolve;
      });
    } catch (_) {}
  }

  function downloadBlob(filename, content, mimeType = "text/javascript") {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function writeDataFile() {
    const content = themeStore.generateDataFileContent();
    if (!("showSaveFilePicker" in window)) {
      downloadBlob("practice-theme-chains.js", content);
      setStatus("已下載 practice-theme-chains.js（此瀏覽器不支援直接儲存，請手動替換 data/ 下的檔案）。");
      return;
    }
    try {
      let handle = await getStoredHandle();
      let needPick = !handle;
      if (handle) {
        const perm = await handle.queryPermission({ mode: "readwrite" });
        if (perm !== "granted") {
          const req = await handle.requestPermission({ mode: "readwrite" });
          if (req !== "granted") needPick = true;
        }
      }
      if (needPick) {
        handle = await window.showSaveFilePicker({
          suggestedName: "practice-theme-chains.js",
          types: [{ description: "JavaScript", accept: { "text/javascript": [".js"] } }],
        });
        await storeHandle(handle);
      }
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      setStatus(`已直接寫入 ${handle.name}，重新整理頁面後生效。`);
    } catch (err) {
      if (err.name !== "AbortError") setStatus(`儲存失敗：${err.message}`);
    }
  }

  // ── PDF 匯出（題目在前、答案附後）────────────────────────────────────────
  async function generateForPractice(practiceId, questionCount) {
    const record = getPracticeRecord(practiceId);
    if (!record) return { title: practiceId, error: "找不到題型資料" };
    const title = String(record.title || practiceId).trim();
    try {
      if (!practiceStore.getConfig?.(practiceId) && generatorLoader?.ensureForPractice) {
        await generatorLoader.ensureForPractice(record);
      }
      const config = practiceStore.getConfig?.(practiceId);
      if (!config || typeof config.generate !== "function") {
        return { title, error: "目前無法生成題目" };
      }
      if (Number(questionCount) > 0) config.questionCount = Number(questionCount);
      const result = config.generate(record) || {};
      const questions = Array.isArray(result.questions) ? result.questions.map((q) => String(q ?? "").trim()) : [];
      const summaryAnswers = Array.isArray(result.summaryAnswers) ? result.summaryAnswers.map((a) => String(a ?? "").trim()) : [];
      const answers = Array.isArray(result.answers) ? result.answers.map((a) => String(a ?? "").trim()) : [];
      if (!questions.length) return { title, error: "此題型沒有生成任何題目" };
      return { title, questions, summaryAnswers, answers };
    } catch (_error) {
      return { title, error: "生成失敗" };
    }
  }

  function renderMath(value) {
    try {
      return toolkit.renderRichTextLine(String(value ?? ""));
    } catch (_error) {
      return escapeHtml(String(value ?? ""));
    }
  }

  // 讓瀏覽器有機會重繪（更新狀態文字），避免長迴圈看起來像當掉
  function yieldToBrowser() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  async function exportThemePdf(themeId) {
    if (state.exporting) {
      setStatus("正在匯出中，請稍候...");
      return;
    }
    const chain = themeStore.getById(themeId);
    if (!chain || !elements.printRoot) {
      setStatus("找不到主題串或列印容器。");
      return;
    }
    state.exporting = true;

    try {
      await runExportThemePdf(chain);
    } catch (error) {
      state.exporting = false;
      document.body.classList.remove("theme-print-mode");
      setStatus(`匯出失敗：${error?.message || error}`);
    }
  }

  async function runExportThemePdf(chain) {
    const sections = [];
    for (let index = 0; index < chain.practiceIds.length; index += 1) {
      setStatus(`正在生成「${chain.title}」題目（${index + 1}/${chain.practiceIds.length}）...`);
      // eslint-disable-next-line no-await-in-loop
      await yieldToBrowser();
      // eslint-disable-next-line no-await-in-loop
      sections.push(await generateForPractice(chain.practiceIds[index], chain.questionCount));
    }

    let questionNo = 0;
    const questionBlocks = [];
    const answerBlocks = [];

    sections.forEach((section) => {
      if (section.error) {
        questionBlocks.push(`
          <section class="theme-print-section">
            <h3>${escapeHtml(section.title)}</h3>
            <p class="theme-print-error">（${escapeHtml(section.error)}）</p>
          </section>`);
        return;
      }
      const startNo = questionNo + 1;
      const items = section.questions.map((question) => {
        questionNo += 1;
        return `<li class="theme-print-question"><span class="theme-print-qno">${questionNo}.</span> ${renderMath(question)}</li>`;
      }).join("");
      questionBlocks.push(`
        <section class="theme-print-section">
          <h3>${escapeHtml(section.title)}</h3>
          <ol class="theme-print-question-list">${items}</ol>
        </section>`);

      const answerItems = section.questions.map((_, qIndex) => {
        const summary = section.summaryAnswers[qIndex] || "";
        const detail = section.answers[qIndex] || "";
        const shown = summary || detail || "（無答案）";
        return `<li><span class="theme-print-qno">${startNo + qIndex}.</span> ${renderMath(shown)}</li>`;
      }).join("");
      answerBlocks.push(`
        <section class="theme-print-section">
          <h4>${escapeHtml(section.title)}</h4>
          <ol class="theme-print-answer-list">${answerItems}</ol>
        </section>`);
    });

    const today = new Date();
    const dateText = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    elements.printRoot.innerHTML = `
      <header class="theme-print-header">
        <h1>${escapeHtml(chain.title)}</h1>
        <p class="theme-print-meta">
          <span>班級：＿＿＿＿</span>
          <span>姓名：＿＿＿＿＿＿</span>
          <span>日期：${dateText}</span>
          <span>共 ${questionNo} 題</span>
        </p>
        ${chain.description ? `<p class="theme-print-description">${escapeHtml(chain.description)}</p>` : ""}
      </header>
      <main class="theme-print-body">
        ${questionBlocks.join("")}
        <section class="theme-print-answers">
          <h2>解答</h2>
          ${answerBlocks.join("")}
        </section>
      </main>`;

    setStatus(`「${chain.title}」共 ${questionNo} 題，開啟列印視窗（目的地選「另存為 PDF」）。`);

    document.body.classList.add("theme-print-mode");
    const cleanup = () => {
      document.body.classList.remove("theme-print-mode");
      window.removeEventListener("afterprint", cleanup);
      state.exporting = false;
    };
    window.addEventListener("afterprint", cleanup);
    // 給瀏覽器一點時間排版 KaTeX 再列印；保險：就算 afterprint 沒觸發也要解鎖
    setTimeout(() => {
      window.print();
      setTimeout(cleanup, 2000);
    }, 300);
  }

  // ── 事件 ───────────────────────────────────────────────────────────────────
  elements.keywordInput?.addEventListener("input", renderChainList);
  elements.chainSelect?.addEventListener("change", updateResetButton);
  elements.loadButton?.addEventListener("click", () => loadTheme(selectedChainId()));
  elements.exportPdfButton?.addEventListener("click", () => exportThemePdf(selectedChainId()));
  elements.resetButton?.addEventListener("click", () => {
    const targetId = selectedChainId();
    if (!targetId) return;
    themeStore.removeLocal(targetId);
    setStatus("已還原成資料檔內建版本。");
    renderChainList();
  });
  elements.sortDifficultyButton?.addEventListener("click", sortActiveByDifficulty);
  elements.saveBackButton?.addEventListener("click", saveBack);
  elements.writeDataFileButton?.addEventListener("click", () => { writeDataFile(); });

  renderChainList();
  renderActiveLabel();
})();
