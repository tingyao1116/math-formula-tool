const store = window.formulaDataStore;
const chapterOverviews = window.chapterOverviewStore?.groups || {};
const gradeOptions = store.getGradeOptions?.() || ["國小", "國一上", "國一下", "國二上", "國二下", "國三上", "國三下", "高一上", "高一下", "高二上", "高二下", "高三", "其他"];
const difficultyOptions = ["全部", "基礎", "進階", "課外"];
const formatChapterLabel = store.formatChapterLabel;
const chapterOptions = store.getChapterOptions?.() || [];
const chapterOptionMap = new Map(chapterOptions.map((entry) => [entry.code, entry]));

const state = {
  items: store.getCurrentFormulas(),
  selectedId: null,
  gradeFilter: "全部",
  chapterFilter: "全部",
  difficultyFilter: "全部",
  sortMode: "curriculum",
  sortDirection: "asc",
  draggingId: null,
  loadedDbUpdatedAt: String(store.getFormulaDbMeta?.().updatedAt || "")
};

const bridgeState = {
  enabled: false,
  url: "http://127.0.0.1:4310"
};

const elements = {
  manageStats: document.getElementById("manageStats"),
  manageNotice: document.getElementById("manageNotice"),
  addNewButton: document.getElementById("addNewButton"),
  saveAllButton: document.getElementById("saveAllButton"),
  saveDbButton: document.getElementById("saveDbButton"),
  bridgeToggleButton: document.getElementById("bridgeToggleButton"),
  resetManagedButton: document.getElementById("resetManagedButton"),
  exportButton: document.getElementById("exportButton"),
  exportStructureButton: document.getElementById("exportStructureButton"),
  importInput: document.getElementById("importInput"),
  importStructureInput: document.getElementById("importStructureInput"),
  manageCount: document.getElementById("manageCount"),
  manageGradeFilter: document.getElementById("manageGradeFilter"),
  manageChapterFilter: document.getElementById("manageChapterFilter"),
  manageDifficultyFilter: document.getElementById("manageDifficultyFilter"),
  manageSortFilter: document.getElementById("manageSortFilter"),
  manageSortDirectionToggle: document.getElementById("manageSortDirectionToggle"),
  manageList: document.getElementById("manageList"),
  manageOverviewList: document.getElementById("manageOverviewList"),
  manageStructureBoard: document.getElementById("manageStructureBoard"),
  editorTitle: document.getElementById("editorTitle"),
  editorForm: document.getElementById("editorForm"),
  deleteCurrentButton: document.getElementById("deleteCurrentButton"),
  levelKey: document.getElementById("levelKey"),
  chapterCode: document.getElementById("chapterCode")
};

const fieldNames = ["id", "title", "formula", "levelKey", "chapterCode", "domain", "chapterRole", "relatedChapters", "relatedTopicIds", "difficulty", "tags", "usage", "examples", "tips", "notes", "mistakes"];
const levelOptions = gradeOptions.filter(Boolean);

function getGradeLabel(item) {
  return item.gradeLabel || store.buildGradeLabel(item.grade, item.term) || item.grade;
}

function getItemChapterCode(item) {
  return item.chapterCode || store.getChapterCode(item.stage, item.grade, item.term, item.chapter) || "";
}

function getModifiedTimestamp(item) {
  return item?.modifiedAt ? Date.parse(item.modifiedAt) || 0 : 0;
}

function compareManagedItems(a, b) {
  if (state.sortMode === "modified") {
    const modifiedDiff = (getModifiedTimestamp(a) - getModifiedTimestamp(b)) * (state.sortDirection === "asc" ? 1 : -1);
    if (modifiedDiff) return modifiedDiff;
    return state.items.findIndex((item) => item.id === a.id) - state.items.findIndex((item) => item.id === b.id);
  }

  if (state.sortMode === "title") {
    const titleDiff = String(a.title).localeCompare(String(b.title), "zh-Hant") * (state.sortDirection === "asc" ? 1 : -1);
    if (titleDiff) return titleDiff;
    return state.items.findIndex((item) => item.id === a.id) - state.items.findIndex((item) => item.id === b.id);
  }

  if (typeof store.compareCurriculumItems === "function") {
    return store.compareCurriculumItems(a, b) * (state.sortDirection === "asc" ? 1 : -1);
  }

  return state.items.findIndex((item) => item.id === a.id) - state.items.findIndex((item) => item.id === b.id);
}

function splitLines(value) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildLevelKey(item) {
  return getGradeLabel(item);
}

function parseLevelKey(levelKey) {
  const value = String(levelKey || "").trim();
  if (!value || value === "其他") return { stage: "其他", grade: "其他", term: "" };
  if (value === "國小") return { stage: "國小", grade: "國小", term: "" };
  if (value === "高三") return { stage: "高中", grade: "高三", term: "" };

  const term = value.endsWith("上") ? "上學期" : value.endsWith("下") ? "下學期" : "";
  const grade = term ? value.slice(0, -1) : value;
  const stage = /^國[一二三]$/.test(grade) ? "國中" : /^高[一二三]$/.test(grade) ? "高中" : "其他";
  return { stage, grade, term };
}

function getActiveContentTypes() {
  return Array.from(elements.editorForm.querySelectorAll('input[name="contentTypes"]:checked'))
    .map((input) => input.value)
    .filter(Boolean);
}

function updateContentTypeEditing() {
  const active = new Set(getActiveContentTypes());
  const groupedFields = elements.editorForm.querySelectorAll("[data-edit-group]");
  groupedFields.forEach((element) => {
    const groups = (element.dataset.editGroup || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const visible = groups.some((group) => active.has(group));
    element.hidden = !visible;
  });
}

function serializeItem(formData) {
  const fallbackLevel = parseLevelKey(formData.get("levelKey"));
  const selectedChapterCode = String(formData.get("chapterCode") || "").trim();
  const chapterMeta = chapterOptionMap.get(selectedChapterCode) || null;
  const stage = chapterMeta?.stage || fallbackLevel.stage;
  const grade = chapterMeta?.grade || fallbackLevel.grade;
  const term = chapterMeta?.term || fallbackLevel.term;
  const chapter = chapterMeta?.chapter || "未分類章節";
  return {
    id: formData.get("id").trim(),
    title: formData.get("title").trim(),
    formula: formData.get("formula").trim(),
    stage,
    grade,
    term,
    chapter,
    chapterCode: selectedChapterCode || store.getChapterCode(stage, grade, term, chapter) || "",
    domain: chapterMeta?.domainMain || formData.get("domain").trim() || "未分類領域",
    domainSub: chapterMeta?.domainSub || "",
    chapterRole: String(formData.get("chapterRole") || "").trim(),
    parentId: String(formData.get("parentId") || "").trim(),
    relatedChapters: [],
    relatedTopicIds: [],
    modifiedAt: new Date().toISOString(),
    difficulty: formData.get("difficulty").trim() || "基礎",
    contentTypes: formData.getAll("contentTypes").map((item) => item.trim()).filter(Boolean),
    contentTypesLocked: true,
    tags: formData.get("tags").split(",").map((item) => item.trim()).filter(Boolean),
    usage: splitLines(formData.get("usage")),
    examples: splitLines(formData.get("examples")),
    tips: splitLines(formData.get("tips")),
    notes: splitLines(formData.get("notes")),
    mistakes: splitLines(formData.get("mistakes"))
  };
}

function getSelectedItem() {
  return state.items.find((item) => item.id === state.selectedId) || null;
}

function setNotice(text) {
  elements.manageNotice.textContent = text;
}

function renderBridgeStatus() {
  if (!elements.bridgeToggleButton) return;
  elements.bridgeToggleButton.textContent = `本機存檔：${bridgeState.enabled ? "已連線" : "未連線"}`;
  elements.bridgeToggleButton.classList.toggle("is-active", bridgeState.enabled);
}

async function pingBridge() {
  try {
    const response = await fetch(`${bridgeState.url}/health`);
    if (!response.ok) return false;
    const body = await response.json();
    return Boolean(body?.ok);
  } catch (_) {
    return false;
  }
}

async function fetchFormulaDbUpdatedAt() {
  try {
    const response = await fetch(`program-db/database/formula-db.json?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return "";
    const payload = await response.json();
    return String(payload?.meta?.updatedAt || "");
  } catch (_) {
    return "";
  }
}

function isNewerTimestamp(candidate, baseline) {
  const candidateTime = Date.parse(candidate || "");
  const baselineTime = Date.parse(baseline || "");
  return Number.isFinite(candidateTime) && Number.isFinite(baselineTime) && candidateTime > baselineTime;
}

async function saveToDatabase() {
  sanitizeSingleAssignment();
  const currentDbUpdatedAt = await fetchFormulaDbUpdatedAt();
  if (isNewerTimestamp(currentDbUpdatedAt, state.loadedDbUpdatedAt)) {
    throw new Error("資料庫比目前 DB 管理頁更新，請先重載頁面後再寫回，避免覆蓋結構頁剛儲存的排序。");
  }
  const response = await fetch(`${bridgeState.url}/save-db`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "manage",
      items: state.items
    })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body?.ok) {
    throw new Error(body?.error || "save-db-failed");
  }
  if (window.caches) {
    const cacheKeys = await window.caches.keys();
    await Promise.all(
      cacheKeys
        .filter((key) => key.startsWith("math-formula-tool-"))
        .map((key) => window.caches.delete(key))
    );
  }
  state.items = store.saveManagedItems(state.items);
  state.loadedDbUpdatedAt = String(body?.savedAt || currentDbUpdatedAt || state.loadedDbUpdatedAt || "");
  renderAll();
  setNotice(`已寫回資料庫並同步前端資料：${body.count || state.items.length} 筆。`);
}

function buildParentOptions(selectedId) {
  const options = [{ value: "", label: "主題層（不放進分支）" }];
  const selectedItem = state.items.find((item) => item.id === selectedId) || null;
  const selectedCode = selectedItem ? getItemChapterCode(selectedItem) : "";
  const descendants = selectedId ? getDescendantIds(selectedId, getChildrenMap()) : new Set();
  const { kindMap } = buildSemanticStructureMap();
  state.items
    .filter((item) => {
      if (item.id === selectedId) return false;
      if (descendants.has(item.id)) return false;
      if (selectedCode && getItemChapterCode(item) !== selectedCode) return false;
      const kind = kindMap.get(item.id) || "theme";
      return kind !== "chapter-root" && getSemanticDepthForKind(kind) < 2;
    })
    .forEach((item) => {
      options.push({
        value: item.id,
        label: `${item.title}｜${getGradeLabel(item)}｜${getItemChapterCode(item)} ${item.chapter}`
      });
    });
  return options;
}

function populateParentSelect(selectedId, selectedParentId) {
  const options = buildParentOptions(selectedId);
  const parentSelect = elements.editorForm.elements.parentId;
  parentSelect.innerHTML = options
    .map((option) => `<option value="${option.value}">${option.label}</option>`)
    .join("");
  parentSelect.value = options.some((option) => option.value === selectedParentId) ? selectedParentId : "";
}

function getManageChapterOptionLabel(chapter) {
  if (chapter === "全部") return chapter;
  return chapterOptionMap.get(chapter)?.label || chapter;
}

function populateSelect(select, values, selectedValue, getLabel = (value) => value) {
  select.innerHTML = values.map((value) => `<option value="${value}">${getLabel(value)}</option>`).join("");
  select.value = values.includes(selectedValue) ? selectedValue : values[0];
}

function getCurriculumSortedItems() {
  if (typeof store.compareCurriculumItems !== "function") return state.items.slice();
  return state.items.slice().sort((a, b) => store.compareCurriculumItems(a, b));
}

function getPureCurriculumSortedItems() {
  return state.items.slice().sort((a, b) => {
    return (
      (a.stageOrder - b.stageOrder) ||
      (a.gradeOrder - b.gradeOrder) ||
      (a.termOrder - b.termOrder) ||
      (a.chapterOrder - b.chapterOrder) ||
      (a.originalIndex - b.originalIndex) ||
      String(a.title).localeCompare(String(b.title), "zh-Hant")
    );
  });
}

function getFilterValues(key) {
  if (key === "grade") {
    return ["全部", ...gradeOptions];
  }

  if (key === "difficulty") {
    return difficultyOptions;
  }

  const source =
    key === "chapter"
      ? chapterOptions
          .filter((entry) => state.gradeFilter === "全部" || formatChapterLabel(entry.stage, entry.grade, entry.term, entry.chapter) === state.gradeFilter)
          .map((entry) => ({ chapter: entry.code }))
      : getPureCurriculumSortedItems();

  const values = source.map((item) => item[key]).filter(Boolean);
  return ["全部", ...new Set(values)];
}

function getVisibleItems() {
  return state.items
    .filter((item) => {
      const matchesGrade = state.gradeFilter === "全部" || getGradeLabel(item) === state.gradeFilter;
      const matchesChapter = state.chapterFilter === "全部" || getItemChapterCode(item) === state.chapterFilter;
      const matchesDifficulty = state.difficultyFilter === "全部" || item.difficulty === state.difficultyFilter;
      return matchesGrade && matchesChapter && matchesDifficulty;
    })
    .sort(compareManagedItems);
}

function getParentTitle(item) {
  if (!item?.parentId) return "";
  return state.items.find((entry) => entry.id === item.parentId)?.title || item.parentId;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getChildrenMap() {
  const map = new Map();
  state.items.forEach((item) => {
    const key = item.parentId || "";
    const group = map.get(key) || [];
    group.push(item);
    map.set(key, group);
  });
  return map;
}

function isChapterRootLike(item, childrenMap) {
  if (!item) return false;
  const role = String(item.chapterRole || "").trim();
  if (!item.parentId && ["主角", "章節", "章節根"].includes(role)) return true;
  if (item.parentId) return false;
  const children = childrenMap.get(item.id) || [];
  return children.some((child) => String(child.chapterRole || "").trim() === "主題");
}

function buildSemanticStructureMap(items = state.items) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const childrenMap = new Map();
  items.forEach((item) => {
    const key = item.parentId || "";
    const group = childrenMap.get(key) || [];
    group.push(item);
    childrenMap.set(key, group);
  });
  const kindMap = new Map();

  const classify = (item) => {
    if (!item) return "theme";
    if (kindMap.has(item.id)) return kindMap.get(item.id);

    const parent = item.parentId ? byId.get(item.parentId) : null;
    let kind = "theme";
    if (!parent) {
      kind = isChapterRootLike(item, childrenMap) ? "chapter-root" : "theme";
    } else {
      const parentKind = classify(parent);
      kind = parentKind === "chapter-root"
        ? "theme"
        : parentKind === "theme"
          ? "branch"
          : "subbranch";
    }

    kindMap.set(item.id, kind);
    return kind;
  };

  items.forEach((item) => classify(item));
  return { byId, childrenMap, kindMap };
}

function getStructureKindLabel(kind) {
  if (kind === "chapter-root") return "章節";
  if (kind === "theme") return "主題";
  if (kind === "branch") return "分支";
  return "次分支";
}

function getSemanticDepthForKind(kind) {
  if (kind === "chapter-root") return -1;
  if (kind === "theme") return 0;
  if (kind === "branch") return 1;
  return 2;
}

function getDepthById(childrenMap) {
  const depthMap = new Map();
  const visit = (item, depth) => {
    depthMap.set(item.id, depth);
    (childrenMap.get(item.id) || []).forEach((child) => visit(child, depth + 1));
  };
  (childrenMap.get("") || []).forEach((root) => visit(root, 0));
  return depthMap;
}

function buildStructureRows() {
  const { byId, childrenMap, kindMap } = buildSemanticStructureMap();
  const visited = new Set();
  const rows = [];

  const visit = (item, depth) => {
    if (visited.has(item.id)) return;
    visited.add(item.id);
    rows.push({ item, depth });
    (childrenMap.get(item.id) || []).forEach((child) => visit(child, depth + 1));
  };

  (childrenMap.get("") || []).forEach((root) => {
    const kind = kindMap.get(root.id) || "theme";
    if (kind === "chapter-root") {
      (childrenMap.get(root.id) || []).forEach((child) => visit(child, 0));
      return;
    }
    visit(root, 0);
  });
  state.items.forEach((item) => {
    if (visited.has(item.id)) return;
    const kind = kindMap.get(item.id) || "theme";
    if (kind === "chapter-root") {
      (childrenMap.get(item.id) || []).forEach((child) => {
        if (!visited.has(child.id)) visit(child, 0);
      });
      return;
    }
    visit(item, 0);
  });

  return { rows, byId, childrenMap, kindMap };
}

function getDescendantIds(targetId, childrenMap) {
  const result = new Set();
  const stack = [targetId];
  while (stack.length) {
    const currentId = stack.pop();
    const children = childrenMap.get(currentId) || [];
    children.forEach((child) => {
      if (!result.has(child.id)) {
        result.add(child.id);
        stack.push(child.id);
      }
    });
  }
  return result;
}

function getSubtreeIds(rootId, childrenMap) {
  return new Set([rootId, ...getDescendantIds(rootId, childrenMap)]);
}

function moveSubtreeBlock(rootId, targetIndex) {
  const subtreeIds = getSubtreeIds(rootId, getChildrenMap());
  const block = state.items.filter((item) => subtreeIds.has(item.id));
  const rest = state.items.filter((item) => !subtreeIds.has(item.id));
  const clamped = Math.max(0, Math.min(targetIndex, rest.length));
  state.items = rest.slice(0, clamped).concat(block, rest.slice(clamped));
}

function syncItemToChapter(item, chapterCode) {
  const code = String(chapterCode || "").trim();
  const chapterMeta = chapterOptionMap.get(code);
  if (!item || !chapterMeta) return;
  item.stage = chapterMeta.stage || item.stage;
  item.grade = chapterMeta.grade || item.grade;
  item.term = chapterMeta.term || "";
  item.chapter = chapterMeta.chapter || item.chapter;
  item.chapterCode = code;
  item.chapter_code = code;
  item.domain = chapterMeta.domainMain || item.domain || "未分類領域";
  item.domainSub = chapterMeta.domainSub || item.domainSub || "";
  item.gradeLabel = store.buildGradeLabel?.(item.grade, item.term) || item.gradeLabel || item.grade;
}

function syncSubtreeToChapter(rootId, chapterCode) {
  const subtreeIds = getSubtreeIds(rootId, getChildrenMap());
  state.items.forEach((item) => {
    if (!subtreeIds.has(item.id)) return;
    syncItemToChapter(item, chapterCode);
    item.relatedChapters = [];
    item.relatedTopicIds = [];
    item.modifiedAt = new Date().toISOString();
  });
}

function getItemDepth(itemId) {
  const byId = new Map(state.items.map((item) => [item.id, item]));
  let depth = 0;
  let cursor = byId.get(itemId);
  const seen = new Set();
  while (cursor?.parentId && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    depth += 1;
    cursor = byId.get(cursor.parentId);
  }
  return depth;
}

function moveStructureItem(dragId, targetId, mode) {
  if (!dragId || !targetId || dragId === targetId) return false;
  const sourceIndex = state.items.findIndex((item) => item.id === dragId);
  const targetIndex = state.items.findIndex((item) => item.id === targetId);
  if (sourceIndex === -1 || targetIndex === -1) return false;

  const sourceItem = state.items[sourceIndex];
  const targetItem = state.items[targetIndex];
  const { childrenMap, kindMap } = buildStructureRows();
  const descendants = getDescendantIds(dragId, childrenMap);
  if (descendants.has(targetId)) {
    setNotice("無法拖到自己的子節點底下。");
    return false;
  }

  if (mode === "inside") {
    const targetKind = kindMap.get(targetId) || "theme";
    if (getSemanticDepthForKind(targetKind) >= 2) {
      setNotice("最多只允許：主題 → 分支 → 次分支。");
      return false;
    }
    sourceItem.parentId = targetId;
    syncSubtreeToChapter(dragId, getItemChapterCode(targetItem));
    const refreshed = buildStructureRows();
    const targetRowIndex = refreshed.rows.findIndex((entry) => entry.item.id === targetId);
    let insertIndex = targetRowIndex + 1;
    while (insertIndex < refreshed.rows.length && refreshed.rows[insertIndex].depth > refreshed.rows[targetRowIndex].depth) {
      insertIndex += 1;
    }
    const finalTargetId = refreshed.rows[Math.max(0, insertIndex - 1)]?.item?.id || targetId;
    const finalTargetIndex = state.items.findIndex((item) => item.id === finalTargetId);
    moveSubtreeBlock(dragId, finalTargetIndex + 1);
    return true;
  }

  sourceItem.parentId = targetItem.parentId || "";
  syncSubtreeToChapter(dragId, getItemChapterCode(targetItem));
  const targetCurrentIndex = state.items.findIndex((item) => item.id === targetId);
  const targetSubtree = getSubtreeIds(targetId, getChildrenMap());
  let insertIndex = targetCurrentIndex;
  if (mode === "after") {
    let last = targetCurrentIndex;
    for (let i = targetCurrentIndex + 1; i < state.items.length; i += 1) {
      if (!targetSubtree.has(state.items[i].id)) break;
      last = i;
    }
    insertIndex = last + 1;
  }
  moveSubtreeBlock(dragId, insertIndex);
  return true;
}

function exportStructurePayload() {
  const items = state.items.map((item, index) => ({
    id: item.id,
    title: item.title,
    parentId: item.parentId || "",
    order: index + 1,
    stage: item.stage,
    grade: item.grade,
    term: item.term,
    chapter: item.chapter,
    domain: item.domain,
    chapterRole: item.chapterRole || "",
    difficulty: item.difficulty || "基礎",
    relatedChapters: Array.isArray(item.relatedChapters) ? item.relatedChapters : [],
    relatedTopicIds: Array.isArray(item.relatedTopicIds) ? item.relatedTopicIds : [],
    contentTypes: Array.isArray(item.contentTypes) ? item.contentTypes : [],
    tags: Array.isArray(item.tags) ? item.tags : []
  }));
  return {
    schema: "math-formula-structure-v1",
    savedAt: new Date().toISOString(),
    itemCount: items.length,
    note: "此檔案可由管理頁直接匯入，也可給 AI 讀取後協助你規劃架構調整。",
    items
  };
}

function applyStructurePayload(payload) {
  const records = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : null;
  if (!records || !records.length) {
    throw new Error("invalid-structure");
  }

  const byId = new Map(state.items.map((item) => [item.id, item]));
  const touchedIds = new Set();

  records.forEach((record, index) => {
    const id = String(record?.id || "").trim();
    if (!id || !byId.has(id)) return;
    const target = byId.get(id);
    target.parentId = String(record.parentId || "").trim();
    if (typeof record.chapterRole === "string") target.chapterRole = record.chapterRole.trim();
    if (typeof record.difficulty === "string") target.difficulty = record.difficulty.trim() || target.difficulty;
    if (typeof record.chapter === "string") target.chapter = record.chapter.trim() || target.chapter;
    if (typeof record.domain === "string") target.domain = record.domain.trim() || target.domain;
    if (Array.isArray(record.relatedChapters)) target.relatedChapters = record.relatedChapters.map((item) => String(item).trim()).filter(Boolean);
    if (Array.isArray(record.relatedTopicIds)) target.relatedTopicIds = record.relatedTopicIds.map((item) => String(item).trim()).filter(Boolean);
    if (Array.isArray(record.contentTypes)) target.contentTypes = record.contentTypes.map((item) => String(item).trim()).filter(Boolean);
    if (Array.isArray(record.tags)) target.tags = record.tags.map((item) => String(item).trim()).filter(Boolean);
    target.modifiedAt = new Date().toISOString();
    touchedIds.add(id);
    record.__resolvedOrder = Number(record.order) > 0 ? Number(record.order) : index + 1;
  });

  const orderedTouched = records
    .filter((record) => touchedIds.has(String(record.id || "").trim()))
    .sort((a, b) => (a.__resolvedOrder - b.__resolvedOrder));
  const untouched = state.items.filter((item) => !touchedIds.has(item.id));
  const reordered = orderedTouched.map((record) => byId.get(String(record.id).trim())).filter(Boolean);
  state.items = reordered.concat(untouched);
  state.items = store.normalizeItems(state.items);
}

function renderStats() {
  const customized = Boolean(store.getManagedFormulas());
  const visibleCount = getVisibleItems().length;
  const sourceInfo = store.getDataSourceInfo?.() || { label: "Unknown", path: "" };
  const sourceLabel = `資料來源 ${escapeHtml(sourceInfo.label)}${sourceInfo.path ? `：${escapeHtml(sourceInfo.path)}` : ""}`;
  elements.manageStats.innerHTML = `
    <div class="stat-chip">總筆數 ${state.items.length}</div>
    <div class="stat-chip">篩選後 ${visibleCount} 筆</div>
    <div class="stat-chip">已修正 ${state.items.filter((item) => getModifiedTimestamp(item) > 0).length} 筆</div>
    <div class="stat-chip">排序 ${state.sortMode === "modified" ? "修改時間" : state.sortMode === "title" ? "標題" : "課綱順序"}・${state.sortMode === "curriculum" ? (state.sortDirection === "asc" ? "前到後" : "後到前") : (state.sortDirection === "asc" ? "舊到新" : "新到舊")}</div>
    <div class="stat-chip">目前來源 ${customized ? "自訂版本" : "內建版本"}</div>
    <div class="stat-chip">${sourceLabel}</div>
  `;
  elements.manageCount.textContent = `顯示 ${visibleCount} / ${state.items.length} 筆`;
}

function renderOverviewList() {
  if (!elements.manageOverviewList) return;
  const entries = Object.entries(chapterOverviews);
  if (!entries.length) {
    elements.manageOverviewList.innerHTML = '<div class="empty-state">目前沒有章節重點大綱。</div>';
    return;
  }

  elements.manageOverviewList.innerHTML = entries
    .map(([groupName, overview]) => `
      <details class="manage-overview-card">
        <div class="manage-overview-card__top">
          <div>
            <h3>${groupName}</h3>
            <div class="meta-row">
              <span class="meta-chip">${overview.title || "章節重點大綱"}${overview.code ? `・${overview.code}` : ""}</span>
              ${(overview.variants || []).map((entry) => `<span class="meta-chip">${entry.label}</span>`).join("")}
            </div>
          </div>
          <summary class="ghost-link manage-overview-toggle">展開檢視</summary>
        </div>
        <div class="manage-overview-preview">
          ${(overview.variants || []).map((entry) => `
            <section class="manage-overview-preview__section">
              <h4>${entry.label}</h4>
              <div class="chapter-overview__content">
                ${entry.sections.map((section) => renderManageOverviewSection(section)).join("")}
              </div>
            </section>
          `).join("")}
        </div>
        <div class="manage-overview-card__actions">
          <a class="ghost-link" href="index.html">到首頁檢視</a>
        </div>
      </details>
    `)
    .join("");
}


function renderManageOverviewText(text) {
  const source = String(text || "");
  const withBreaks = source.replace(/\n/g, "<br>");
  const segments = withBreaks.split(/(\\\([\s\S]*?\\\))/g).filter(Boolean);

  return segments
    .map((segment) => {
      if (/^\\\([\s\S]*\\\)$/.test(segment)) {
        const latex = segment.slice(2, -2);
        if (window.katex) {
          try {
            return window.katex.renderToString(latex, {
              throwOnError: false,
              displayMode: false,
              output: "html"
            });
          } catch (error) {
            return window.formulaToolkit?.renderRichTextLine?.(latex) || latex;
          }
        }
        return window.formulaToolkit?.renderRichTextLine?.(latex) || latex;
      }

      return window.formulaToolkit?.renderRichTextLine?.(segment) || segment;
    })
    .join("");
}

function renderManageOverviewSection(section) {
  if (section.type === "paragraph") {
    return `<p class="chapter-overview__paragraph">${renderManageOverviewText(section.text)}</p>`;
  }

  if (section.type === "pdf-page") {
    const pdfSrc = section.src || "";
    if (!pdfSrc) return "";
    const fitSrc = pdfSrc.includes("#")
      ? `${pdfSrc}&view=FitH&zoom=page-width`
      : `${pdfSrc}#view=FitH&zoom=page-width`;
    return `
      <div class="chapter-overview__pdf-wrap">
        <iframe class="chapter-overview__pdf manage-overview__pdf" src="${encodeURI(fitSrc)}" title="章節原稿預覽"></iframe>
        <div class="chapter-overview__pdf-actions">
          ${section.note ? `<p class="detail-note">${section.note}</p>` : ""}
          <a class="ghost-link" href="${encodeURI(fitSrc)}" target="_blank" rel="noopener noreferrer">在 Edge 另開（可手寫）</a>
        </div>
      </div>
    `;
  }

  if (section.type === "table") {
    return `
      <div class="chapter-overview__table-wrap">
        <table class="chapter-overview__table">
          <thead>
            <tr>
              ${section.headers.map((header) => `<th>${header}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${section.rows.map((row) => `
              <tr>
                ${row.map((cell) => `<td>${renderManageOverviewText(cell)}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  return "";
}

function renderList() {
  const visibleItems = getVisibleItems();
  const { kindMap } = buildSemanticStructureMap();

  elements.manageList.innerHTML = visibleItems
    .map(
      (item) => {
        const kind = kindMap.get(item.id) || "theme";
        const kindLabel = getStructureKindLabel(kind);
        const relationLabel =
          kind === "branch" || kind === "subbranch"
            ? `${kindLabel}：${getParentTitle(item)}`
            : kindLabel;
        return `
        <article class="manage-item ${item.id === state.selectedId ? "active" : ""}" data-id="${item.id}">
          <div class="manage-item__main">
            <h3>${item.title}</h3>
            <p>${item.stage}・${getGradeLabel(item)}・${item.chapter}</p>
            <div class="meta-row">
              <span class="meta-chip">${relationLabel}</span>
              ${item.chapterRole ? `<span class="meta-chip">章節角色：${item.chapterRole}</span>` : ""}
              ${(item.relatedChapters || []).map((chapter) => `<span class="meta-chip">關聯章節：${chapter}</span>`).join("")}
              <span class="meta-chip">${item.domain}</span>
              <span class="meta-chip">難度：${item.difficulty}</span>
              ${(item.contentTypes || []).map((type) => `<span class="meta-chip">${type}</span>`).join("")}
            </div>
          </div>
          <div class="manage-item__actions">
            <button type="button" class="ghost-link manage-mini-button" data-action="select" data-id="${item.id}">編輯</button>
            <button type="button" class="ghost-link manage-mini-button" data-action="up" data-id="${item.id}" ${state.items.findIndex((entry) => entry.id === item.id) === 0 ? "disabled" : ""}>上移</button>
            <button type="button" class="ghost-link manage-mini-button" data-action="down" data-id="${item.id}" ${state.items.findIndex((entry) => entry.id === item.id) === state.items.length - 1 ? "disabled" : ""}>下移</button>
          </div>
        </article>
      `;
      }
    )
    .join("");

  if (!visibleItems.length) {
    elements.manageList.innerHTML = '<div class="empty-state">目前沒有符合篩選條件的重點。</div>';
  }
}

function renderStructureBoard() {
  if (!elements.manageStructureBoard) return;
  const { rows } = buildStructureRows();
  const { kindMap } = buildSemanticStructureMap();
  if (!rows.length) {
    elements.manageStructureBoard.innerHTML = '<div class="empty-state">目前沒有可編排的節點。</div>';
    return;
  }

  elements.manageStructureBoard.innerHTML = rows
    .map(({ item, depth }) => {
      const marginLeft = Math.min(depth, 2) * 24;
      const branchTag = getStructureKindLabel(kindMap.get(item.id) || "theme");
      return `
        <article class="structure-node ${state.selectedId === item.id ? "active" : ""}" data-id="${item.id}" draggable="true" style="margin-left:${marginLeft}px">
          <div class="structure-node__head">
            <button type="button" class="ghost-link manage-mini-button structure-select-button" data-action="select" data-id="${item.id}">編輯</button>
            <h3>${escapeHtml(item.title)}</h3>
            <div class="meta-row">
              <span class="meta-chip">${branchTag}</span>
              <span class="meta-chip">${escapeHtml(getGradeLabel(item))}</span>
              <span class="meta-chip">${escapeHtml(item.chapter || "未分類章節")}</span>
            </div>
          </div>
          <div class="structure-drop-zone-group">
            <button type="button" class="structure-drop-zone" data-drop-mode="before" data-drop-id="${item.id}">放到上方</button>
            <button type="button" class="structure-drop-zone structure-drop-zone--inside" data-drop-mode="inside" data-drop-id="${item.id}">成為子節點</button>
            <button type="button" class="structure-drop-zone" data-drop-mode="after" data-drop-id="${item.id}">放到下方</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderFilters() {
  populateSelect(elements.manageGradeFilter, getFilterValues("grade"), state.gradeFilter);
  populateSelect(elements.manageChapterFilter, getFilterValues("chapter"), state.chapterFilter, getManageChapterOptionLabel);
  populateSelect(elements.manageDifficultyFilter, getFilterValues("difficulty"), state.difficultyFilter);
  populateSelect(elements.levelKey, levelOptions, elements.levelKey.value || levelOptions[0]);
  if (elements.chapterCode) {
    const stageOrder = { 國小: 0, 國中: 1, 高中: 2, 其他: 9 };
    const gradeOrder = { 國小: 0, 國一: 1, 國二: 2, 國三: 3, 高一: 4, 高二: 5, 高三: 6, 其他: 9 };
    const termOrder = { 上學期: 0, 下學期: 1, "": 9, 其他: 9 };
    const values = chapterOptions
      .slice()
      .sort((a, b) => {
        return (
          (stageOrder[a.stage] ?? 99) - (stageOrder[b.stage] ?? 99) ||
          (gradeOrder[a.grade] ?? 99) - (gradeOrder[b.grade] ?? 99) ||
          (termOrder[a.term] ?? 99) - (termOrder[b.term] ?? 99) ||
          String(a.label || a.code).localeCompare(String(b.label || b.code), "zh-Hant")
        );
      })
      .map((entry) => entry.code);
    const selectedCode = elements.chapterCode.value || values[0];
    populateSelect(elements.chapterCode, values, selectedCode, (value) => chapterOptionMap.get(value)?.label || value);
  }
  elements.manageSortFilter.value = state.sortMode;
  elements.manageSortDirectionToggle.textContent =
    state.sortMode === "curriculum"
      ? (state.sortDirection === "asc" ? "目前：前到後" : "目前：後到前")
      : (state.sortDirection === "asc" ? "目前：舊到新" : "目前：新到舊");
  elements.manageSortDirectionToggle.classList.toggle("is-active", state.sortDirection === "desc");
}

function fillForm(item) {
  if (!item) {
    elements.editorTitle.textContent = "請先選一筆重點";
    fieldNames.forEach((name) => {
      elements.editorForm.elements[name].value = "";
    });
    populateParentSelect("", "");
    return;
  }

  elements.editorTitle.textContent = `編輯：${item.title}`;
  elements.editorForm.elements.id.value = item.id || "";
  elements.editorForm.elements.title.value = item.title || "";
  elements.editorForm.elements.levelKey.value = buildLevelKey(item);
  const currentChapterCode = item.chapterCode || store.getChapterCode(item.stage, item.grade, item.term, item.chapter) || "";
  if (elements.editorForm.elements.chapterCode) {
    elements.editorForm.elements.chapterCode.value = currentChapterCode;
  }
  elements.editorForm.elements.domain.value = item.domain || "";
  elements.editorForm.elements.chapterRole.value = item.chapterRole || "";
  populateParentSelect(item.id, item.parentId || "");
  elements.editorForm.elements.relatedChapters.value = (item.relatedChapters || []).join(", ");
  elements.editorForm.elements.relatedTopicIds.value = (item.relatedTopicIds || []).join(", ");
  elements.editorForm.elements.difficulty.value = item.difficulty || "基礎";
  elements.editorForm.elements.formula.value = item.formula || "";
  Array.from(elements.editorForm.querySelectorAll('input[name="contentTypes"]')).forEach((input) => {
    input.checked = (item.contentTypes || []).includes(input.value);
  });
  elements.editorForm.elements.tags.value = (item.tags || []).join(", ");
  elements.editorForm.elements.usage.value = (item.usage || []).join("\n");
  elements.editorForm.elements.examples.value = (item.examples || []).join("\n");
  elements.editorForm.elements.tips.value = (item.tips || []).join("\n");
  elements.editorForm.elements.notes.value = (item.notes || []).join("\n");
  elements.editorForm.elements.mistakes.value = (item.mistakes || []).join("\n");
  updateContentTypeEditing();
}

function renderAll() {
  renderStats();
  renderFilters();
  renderList();
  renderStructureBoard();
  renderBridgeStatus();
  fillForm(getSelectedItem());
}

function moveItem(id, direction) {
  const index = state.items.findIndex((item) => item.id === id);
  if (index === -1) return;
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= state.items.length) return;
  const temp = state.items[index];
  state.items[index] = state.items[targetIndex];
  state.items[targetIndex] = temp;
  renderAll();
  setNotice("已調整順序；要永久保存請按『寫回資料庫』。");
}

function createBlankItem() {
  const nextIndex = state.items.length + 1;
  const defaultChapterCode = chapterOptions[0]?.code || "";
  const defaultChapterMeta = chapterOptionMap.get(defaultChapterCode) || null;
  return {
    id: `custom-topic-${nextIndex}`,
    title: `新重點 ${nextIndex}`,
    formula: "請輸入公式或概念",
    stage: defaultChapterMeta?.stage || "國中",
    grade: defaultChapterMeta?.grade || "國一",
    term: defaultChapterMeta?.term || "上學期",
    chapter: defaultChapterMeta?.chapter || "國一補充",
    chapterCode: defaultChapterCode,
    domain: "自訂領域",
    chapterRole: "",
    parentId: "",
    relatedChapters: [],
    relatedTopicIds: [],
    mathNotationLocked: false,
    modifiedAt: new Date().toISOString(),
    difficulty: "基礎",
    contentTypes: ["定義", "公式", "無限練習"],
    contentTypesLocked: true,
    tags: [],
    usage: [],
    examples: [],
    tips: [],
    notes: [],
    mistakes: []
  };
}

function sanitizeSingleAssignment() {
  const byId = new Map(state.items.map((item) => [item.id, item]));
  state.items.forEach((item) => {
    const code = getItemChapterCode(item);
    item.chapterCode = code;
    item.chapter_code = code;
    item.relatedChapters = [];
    item.relatedTopicIds = [];
  });

  state.items.forEach((item) => {
    const parent = item.parentId ? byId.get(item.parentId) : null;
    if (!parent || getItemChapterCode(parent) !== getItemChapterCode(item)) {
      item.parentId = "";
      item.isBranch = false;
      return;
    }
    item.isBranch = true;
  });

  state.items = store.normalizeItems(state.items).map((item) => ({
    ...item,
    relatedChapters: [],
    relatedTopicIds: [],
    chapter_code: item.chapterCode || item.chapter_code || ""
  }));
}

function saveCurrentSet(message) {
  sanitizeSingleAssignment();
  state.items = store.saveManagedItems(state.items);
  renderAll();
  setNotice(message || "已暫存到瀏覽器，但還沒寫回資料庫。");
}

function bindEvents() {
  elements.manageList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === "select") {
      state.selectedId = id;
      renderAll();
      setNotice("已切換到這一筆。修改後按『套用到這一筆』即可。");
      return;
    }
    if (action === "up" || action === "down") {
      moveItem(id, action);
    }
  });

  elements.manageStructureBoard?.addEventListener("click", (event) => {
    const selectButton = event.target.closest('[data-action="select"]');
    if (selectButton) {
      state.selectedId = selectButton.dataset.id;
      renderAll();
      setNotice("已切到此節點，可在右側編輯詳細內容。");
      return;
    }

    const dropButton = event.target.closest("[data-drop-mode][data-drop-id]");
    if (!dropButton || !state.draggingId) return;
    const moved = moveStructureItem(state.draggingId, dropButton.dataset.dropId, dropButton.dataset.dropMode);
    state.draggingId = null;
    if (moved) {
      state.items = store.normalizeItems(state.items);
      renderAll();
      setNotice("已完成拖拉調整；要永久保存請按『寫回資料庫』。");
    }
  });

  elements.manageStructureBoard?.addEventListener("dragstart", (event) => {
    const card = event.target.closest(".structure-node[data-id]");
    if (!card) return;
    state.draggingId = card.dataset.id;
    card.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", state.draggingId);
  });

  elements.manageStructureBoard?.addEventListener("dragend", (event) => {
    const card = event.target.closest(".structure-node[data-id]");
    if (card) card.classList.remove("is-dragging");
  });

  elements.manageStructureBoard?.addEventListener("dragover", (event) => {
    if (!state.draggingId) return;
    if (event.target.closest("[data-drop-mode][data-drop-id]")) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    }
  });

  elements.manageStructureBoard?.addEventListener("drop", (event) => {
    const zone = event.target.closest("[data-drop-mode][data-drop-id]");
    if (!zone || !state.draggingId) return;
    event.preventDefault();
    const moved = moveStructureItem(state.draggingId, zone.dataset.dropId, zone.dataset.dropMode);
    state.draggingId = null;
    if (moved) {
      state.items = store.normalizeItems(state.items);
      renderAll();
      setNotice("已完成拖拉調整；要永久保存請按『寫回資料庫』。");
    }
  });

  elements.addNewButton.addEventListener("click", () => {
    const newItem = createBlankItem();
    state.items.unshift(newItem);
    state.selectedId = newItem.id;
    renderAll();
    setNotice("已新增一筆空白重點，請在右側填寫後按『套用到這一筆』。");
  });

  elements.editorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(elements.editorForm);
    const existingItem = getSelectedItem();
    const previousId = existingItem?.id || "";
    const updatedItem = {
      ...(existingItem || {}),
      ...serializeItem(formData)
    };
    if (!updatedItem.title) {
      setNotice("標題不可空白。");
      return;
    }

    updatedItem.id = updatedItem.id || existingItem?.id || `custom-topic-${Date.now()}`;

    const selectedId = existingItem ? existingItem.id : updatedItem.id;
    const duplicate = state.items.find((item) => item.id === updatedItem.id && item.id !== selectedId);
    if (duplicate) {
      setNotice("id 不可重複，請換一個新的 id。");
      return;
    }

    const childrenMap = getChildrenMap();
    const descendants = previousId ? getDescendantIds(previousId, childrenMap) : new Set();
    const selectedParent = updatedItem.parentId ? state.items.find((item) => item.id === updatedItem.parentId) : null;
    if (
      !selectedParent ||
      descendants.has(updatedItem.parentId) ||
      getItemChapterCode(selectedParent) !== updatedItem.chapterCode ||
      getItemDepth(selectedParent.id) >= 2
    ) {
      updatedItem.parentId = "";
      updatedItem.isBranch = false;
    } else {
      updatedItem.isBranch = true;
    }

    const index = state.items.findIndex((item) => item.id === selectedId);
    if (index === -1) {
      state.items.unshift(updatedItem);
    } else {
      state.items[index] = updatedItem;
    }
    if (previousId && previousId !== updatedItem.id) {
      state.items.forEach((item) => {
        if (item.parentId === previousId) item.parentId = updatedItem.id;
      });
    }
    syncSubtreeToChapter(updatedItem.id, updatedItem.chapterCode);
    sanitizeSingleAssignment();
    state.selectedId = updatedItem.id;
    renderAll();
    setNotice("已套用到這一筆；要永久保存請按『寫回資料庫』。");
  });

  elements.deleteCurrentButton.addEventListener("click", () => {
    const selected = getSelectedItem();
    if (!selected) {
      setNotice("請先選一筆要刪除的重點。");
      return;
    }
    state.items = state.items.filter((item) => item.id !== selected.id);
    state.selectedId = state.items[0]?.id || null;
    renderAll();
    setNotice("已刪除這一筆；要永久保存請按『寫回資料庫』。");
  });

  elements.saveAllButton.addEventListener("click", () => {
    saveCurrentSet("已暫存到瀏覽器；清除瀏覽資料後會消失，永久保存請按『寫回資料庫』。");
  });

  elements.bridgeToggleButton?.addEventListener("click", async () => {
    bridgeState.enabled = await pingBridge();
    renderBridgeStatus();
    setNotice(
      bridgeState.enabled
        ? "本機橋接服務已連線，可以寫回資料庫。"
        : "尚未連線。請先執行：node scripts/local-structure-bridge.js"
    );
  });

  elements.saveDbButton?.addEventListener("click", async () => {
    try {
      if (!bridgeState.enabled) {
        bridgeState.enabled = await pingBridge();
        renderBridgeStatus();
      }
      if (!bridgeState.enabled) {
        setNotice("尚未連線。請先執行：node scripts/local-structure-bridge.js");
        return;
      }
      await saveToDatabase();
    } catch (error) {
      setNotice(`寫回資料庫失敗：${error?.message || error}`);
    }
  });

  elements.resetManagedButton.addEventListener("click", () => {
    state.items = store.clearManagedItems();
    state.selectedId = state.items[0]?.id || null;
    renderAll();
    setNotice("已還原成內建版本。");
  });

  elements.exportButton.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(store.exportManagedItems(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "managed-formulas-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("已匯出 JSON 備份。");
  });

  elements.exportStructureButton?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(exportStructurePayload(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "managed-structure-readable.json";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("已匯出架構檔，可直接交給我讀取後協助調整。");
  });

  elements.importInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const items = store.normalizeItems(Array.isArray(parsed.items) ? parsed.items : parsed);
      state.items = items;
      state.selectedId = state.items[0]?.id || null;
      renderAll();
      setNotice("已匯入到目前頁面；要永久保存請按『寫回資料庫』。");
    } catch (error) {
      setNotice("匯入失敗，請確認是正確的 JSON 備份檔。");
    } finally {
      event.target.value = "";
    }
  });

  elements.importStructureInput?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      applyStructurePayload(parsed);
      state.selectedId = state.items[0]?.id || null;
      renderAll();
      setNotice("已匯入架構檔到目前頁面；要永久保存請按『寫回資料庫』。");
    } catch (error) {
      setNotice("匯入架構檔失敗，請確認檔案格式正確。");
    } finally {
      event.target.value = "";
    }
  });

  elements.manageGradeFilter.addEventListener("change", (event) => {
    state.gradeFilter = event.target.value;
    renderAll();
  });

  elements.manageChapterFilter.addEventListener("change", (event) => {
    state.chapterFilter = event.target.value;
    renderAll();
  });

  elements.manageDifficultyFilter.addEventListener("change", (event) => {
    state.difficultyFilter = event.target.value;
    renderAll();
  });

  elements.manageSortFilter.addEventListener("change", (event) => {
    state.sortMode = event.target.value;
    renderAll();
  });

  elements.manageSortDirectionToggle.addEventListener("click", () => {
    state.sortDirection = state.sortDirection === "desc" ? "asc" : "desc";
    renderAll();
  });

  elements.chapterCode?.addEventListener("change", () => {
    const currentParent = elements.editorForm.elements.parentId?.value || "";
    populateParentSelect(state.selectedId || "", currentParent);
  });

  elements.editorForm.querySelectorAll('input[name="contentTypes"]').forEach((checkbox) => checkbox.addEventListener("change", () => {
    updateContentTypeEditing();
  }));
}

function init() {
  state.selectedId = state.items[0]?.id || null;
  renderAll();
  bindEvents();
  pingBridge().then((ok) => {
    bridgeState.enabled = ok;
    renderBridgeStatus();
  });
  window.addEventListener("storage", (event) => {
    if (event.key && event.key !== store.STORAGE_KEY) return;
    window.location.reload();
  });
  setNotice("管理頁已就緒。暫存只會存瀏覽器；要永久保存請按『寫回資料庫』。");
}

init();






