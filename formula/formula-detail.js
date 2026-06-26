const store = window.formulaDataStore;
const toolkit = window.formulaToolkit || {};
const mainTopicOverviewStore = window.mainTopicOverviewStore || {};
const mainTopicOverviewById = mainTopicOverviewStore.byId || {};
const params = new URLSearchParams(window.location.search);
const formulaId = params.get("id");

const elements = {
  detailTitle: document.getElementById("detailTitle"),
  detailLead: document.getElementById("detailLead"),
  detailStats: document.getElementById("detailStats"),
  detailContainer: document.getElementById("detailContainer"),
  detailBranches: document.getElementById("detailBranches"),
  copyLinkButton: document.getElementById("copyLinkButton"),
};

const formulas = store?.getCurrentFormulas?.() || [];
const DETAIL_BRANCH_LAYOUT_STORAGE_KEY = "math-branch-layout-detail-v1";
const state = {
  mainTopicVariantId: "",
};

function normalizeMainThemeTitle(title) {
  return String(title || "").replace(/^(?:主要主題|主題)\s*\d+\s*[：:]\s*/u, "").trim();
}

function getMainThemeCoreTitle(title) {
  return normalizeMainThemeTitle(title);
}

function isMainThemeItem(item) {
  return Boolean(item?.id && mainTopicOverviewById[item.id]);
}

function toDisplayItem(item) {
  if (!isMainThemeItem(item)) return item;
  return {
    ...item,
    title: normalizeMainThemeTitle(item.title),
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderRichText(text) {
  const source = String(text ?? "").trim();
  if (!source) return "";
  const renderLine = typeof toolkit.renderRichTextLine === "function"
    ? toolkit.renderRichTextLine
    : (line) => escapeHtml(line);
  return source
    .split(/\n{2,}/)
    .map((block) => `<p>${block.split("\n").map((line) => renderLine(line)).join("<br>")}</p>`)
    .join("");
}

function loadDetailBranchLayoutByTopic() {
  try {
    const raw = window.localStorage?.getItem(DETAIL_BRANCH_LAYOUT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch (_) {
    return {};
  }
}

function saveDetailBranchLayoutByTopic(map) {
  try {
    window.localStorage?.setItem(DETAIL_BRANCH_LAYOUT_STORAGE_KEY, JSON.stringify(map || {}));
  } catch (_) {}
}

const detailBranchLayoutByTopic = loadDetailBranchLayoutByTopic();

function getDetailLayout(topicId) {
  const mode = detailBranchLayoutByTopic?.[topicId];
  if (mode === "one" || mode === "list") return "one";
  if (mode === "two") return "two";
  if (mode === "four" || mode === "grid") return "four";
  return "four";
}

function renderNotFound() {
  document.title = "找不到公式";
  elements.detailTitle.textContent = "找不到公式";
  elements.detailLead.textContent = "這個分享頁沒有找到對應的公式 id。";
  elements.detailStats.innerHTML = '<div class="stat-chip">無法顯示</div>';
  elements.detailContainer.innerHTML = '<div class="empty-state">這個公式可能不存在，或是資料尚未建立。</div>';
  if (elements.detailBranches) elements.detailBranches.innerHTML = "";
}

function renderStats(item, branches, relatedEntries) {
  const chips = [
    item.stage,
    item.gradeLabel || store?.buildGradeLabel?.(item.grade, item.term) || item.grade,
    item.chapter,
    item.domain,
    item.difficulty ? `難度：${item.difficulty}` : "",
    item.chapterRole ? `角色：${item.chapterRole}` : "",
    item.conceptRole ? `層級：${item.conceptRole}` : "",
  ].filter(Boolean);

  if (item.extendsFrom?.length) chips.push(`延伸自 ${item.extendsFrom.length} 項`);
  if (item.reappearsIn?.length) chips.push(`再次出現 ${item.reappearsIn.length} 項`);
  if (relatedEntries.length) chips.push(`相關主題 ${relatedEntries.length} 項`);
  if (branches.length) chips.push(`分支 ${branches.length} 筆`);

  elements.detailStats.innerHTML = chips.map((value) => `<div class="stat-chip">${escapeHtml(value)}</div>`).join("");
}

function collectAllDescendants(parentId) {
  const directChildren = formulas.filter((entry) => entry.parentId === parentId);
  const collected = [];
  directChildren.forEach((child) => {
    collected.push(child);
    collected.push(...collectAllDescendants(child.id));
  });
  return collected;
}

function buildMainThemeFlatBranches(item) {
  const directChildren = formulas.filter((entry) => entry.parentId === item.id);
  const result = [];
  const seen = new Set();
  const mainCoreTitle = getMainThemeCoreTitle(item.title);

  function pushUnique(entry) {
    if (!entry?.id || seen.has(entry.id)) return;
    seen.add(entry.id);
    result.push(entry);
  }

  directChildren.forEach((child) => {
    const childCoreTitle = getMainThemeCoreTitle(child.title);
    const descendants = collectAllDescendants(child.id);
    if (childCoreTitle && childCoreTitle === mainCoreTitle) {
      descendants.forEach(pushUnique);
      return;
    }
    pushUnique(child);
    descendants.forEach(pushUnique);
  });

  return result;
}

function renderOverviewSection(section) {
  if (!section) return "";
  if (section.type === "paragraph") {
    return `<div class="chapter-overview__paragraph">${renderRichText(section.text)}</div>`;
  }
  if (section.type === "table") {
    const headers = Array.isArray(section.headers) ? section.headers : [];
    const rows = Array.isArray(section.rows) ? section.rows : [];
    return `
      <div class="chapter-overview__table-wrap">
        <table class="chapter-overview__table">
          <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
          <tbody>
            ${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderRichText(cell)}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  }
  if (section.type === "pdf-page") {
    const pdfSrc = String(section.src || "").trim();
    if (!pdfSrc) return "";
    return `
      <div class="chapter-overview__pdf-wrap">
        <iframe loading="lazy" class="chapter-overview__pdf" title="${escapeHtml(section.note || "主題原稿")}" src="${encodeURI(pdfSrc)}"></iframe>
        <div class="chapter-overview__pdf-actions">
          <a class="ghost-link" href="${encodeURI(pdfSrc)}" target="_blank" rel="noopener noreferrer">另開 PDF</a>
        </div>
      </div>`;
  }
  return "";
}

function renderMainTopicOverview(entry) {
  const variants = Array.isArray(entry?.variants) ? entry.variants : [];
  const activeVariant = variants.find((variant) => variant.id === state.mainTopicVariantId) || variants[0] || null;
  const sections = Array.isArray(activeVariant?.sections) && activeVariant.sections.length
    ? activeVariant.sections
    : (variants.find((variant) => Array.isArray(variant?.sections) && variant.sections.length)?.sections || []);

  return `
    <section class="panel chapter-overview-panel">
      <div class="chapter-overview__header">
        <div>
          <p class="summary-label">主題整理</p>
          <h2>${escapeHtml(entry.title || "主要主題")}</h2>
        </div>
        ${variants.length
          ? `<div class="chapter-overview__variant-tabs">
              ${variants.map((variant) => `<button type="button" class="ghost-button ${variant.id === activeVariant?.id ? "is-active" : ""}" data-main-topic-variant="${escapeHtml(variant.id)}">${escapeHtml(variant.label)}</button>`).join("")}
            </div>`
          : ""}
      </div>
      <div class="chapter-overview__body">
        ${sections.length
          ? sections.map(renderOverviewSection).join("")
          : '<p class="empty-state chapter-overview__empty">這個主要主題還沒有整理內容。</p>'}
      </div>
    </section>`;
}

function renderFlatDetailBranches(topicId, items) {
  if (!items.length || typeof toolkit.renderCard !== "function") return "";
  const layout = getDetailLayout(topicId);
  const layoutClass = layout === "one" ? "branch-grid--one" : layout === "two" ? "branch-grid--two" : "branch-grid--four";
  return `
    <div class="branch-grid ${layoutClass}">
      ${items.map((entry) => `
        <div class="branch-node branch-node--depth-1">
          ${toolkit.renderCard(toDisplayItem(entry), { showShareLink: false })}
        </div>`).join("")}
    </div>`;
}

function renderNestedDetailBranches(topicId, items, depth = 1) {
  if (!items.length || typeof toolkit.renderCard !== "function") return "";
  const layout = depth <= 1 ? getDetailLayout(topicId) : "two";
  const layoutClass = layout === "one" ? "branch-grid--one" : layout === "two" ? "branch-grid--two" : "branch-grid--four";
  return `
    <div class="branch-grid ${layoutClass} ${depth > 1 ? "branch-grid--nested" : ""}">
      ${items.map((entry) => {
        const children = formulas.filter((item) => item.parentId === entry.id);
        return `
          <div class="branch-node branch-node--depth-${Math.min(depth, 3)}">
            ${toolkit.renderCard(entry, { showShareLink: false })}
            ${children.length ? renderNestedDetailBranches(topicId, children, depth + 1) : ""}
          </div>`;
      }).join("")}
    </div>`;
}

function renderFormula(item) {
  const displayItem = toDisplayItem(item);
  const branches = formulas.filter((entry) => entry.parentId === item.id);
  const relatedEntries = formulas.filter(
    (entry) => entry.id !== item.id && Array.isArray(entry.relatedTopicIds) && entry.relatedTopicIds.includes(item.id)
  );
  const mainTopicOverviewEntry = mainTopicOverviewById[item.id] || null;
  const flatMainThemeBranches = mainTopicOverviewEntry ? buildMainThemeFlatBranches(item) : [];

  document.title = `${displayItem.title}｜數學公式工具`;
  elements.detailTitle.textContent = displayItem.title;
  elements.detailLead.textContent = mainTopicOverviewEntry
    ? `${item.chapter} 的主要主題頁，先看整理，再往下展開原本的主題與分支。`
    : `${item.chapter} 的單一主題頁，可直接分享這一筆內容。`;
  renderStats(displayItem, mainTopicOverviewEntry ? flatMainThemeBranches : branches, relatedEntries);

  const reappears = item.reappearsIn?.length
    ? `
      <section class="panel detail-branches-panel">
        <div class="topic-cluster__header">
          <div>
            <p class="summary-label">再次出現</p>
            <h2>這個概念也會在後續章節再次出現</h2>
          </div>
        </div>
        <div class="meta-row">${item.reappearsIn.map((label) => `<span class="meta-chip">${escapeHtml(label)}</span>`).join("")}</div>
      </section>`
    : "";

  const extendsFrom = item.extendsFrom?.length
    ? `
      <section class="panel detail-branches-panel">
        <div class="topic-cluster__header">
          <div>
            <p class="summary-label">概念脈絡</p>
            <h2>這個主題延伸自哪些基礎概念</h2>
          </div>
        </div>
        <div class="meta-row">${item.extendsFrom.map((label) => `<span class="meta-chip">${escapeHtml(label)}</span>`).join("")}</div>
      </section>`
    : "";

  const related = item.relatedChapters?.length || relatedEntries.length
    ? `
      <section class="panel detail-branches-panel">
        <div class="topic-cluster__header">
          <div>
            <p class="summary-label">相關入口</p>
            <h2>這個主題也可以從其他章節或主題找到</h2>
          </div>
        </div>
        <div class="meta-row">
          ${(item.relatedChapters || []).map((chapter) => `<span class="meta-chip">${escapeHtml(chapter)}</span>`).join("")}
          ${relatedEntries.map((entry) => `<a class="ghost-link topic-branch-link" href="formula.html?id=${entry.id}">${escapeHtml(entry.title)}</a>`).join("")}
        </div>
      </section>`
    : "";

  elements.detailContainer.innerHTML = `
    ${mainTopicOverviewEntry ? renderMainTopicOverview(mainTopicOverviewEntry) : ""}
    ${mainTopicOverviewEntry ? "" : (typeof toolkit.renderCard === "function" ? toolkit.renderCard(displayItem, { showShareLink: false }) : "")}
    ${reappears}
    ${extendsFrom}
    ${related}
  `;

  if (elements.detailBranches) {
    const layout = getDetailLayout(item.id);
    const visibleBranches = mainTopicOverviewEntry ? flatMainThemeBranches : branches;
    const branchSummaryLabel = "分支";
    const branchHeading = mainTopicOverviewEntry ? "這個主題底下的分支整理" : "從這個主題繼續往下看分支內容";
    elements.detailBranches.innerHTML = visibleBranches.length
      ? `
        <section class="panel detail-branches-panel">
          <div class="topic-cluster__header">
            <div>
              <p class="summary-label">${branchSummaryLabel}</p>
              <h2>${branchHeading}</h2>
            </div>
            <p>${visibleBranches.length} 筆</p>
          </div>
          <div class="topic-branch-group__header topic-cluster__header">
            <div>
              <h4>分支檢視</h4>
              <p>可切換四欄、二欄、單欄</p>
            </div>
            <div class="branch-layout-toggle" role="group" aria-label="分支排列方式">
              <button type="button" class="ghost-button ${layout === "four" ? "is-active" : ""}" data-detail-branch-layout-topic="${escapeHtml(item.id)}" data-detail-branch-layout="four">四欄</button>
              <button type="button" class="ghost-button ${layout === "two" ? "is-active" : ""}" data-detail-branch-layout-topic="${escapeHtml(item.id)}" data-detail-branch-layout="two">二欄</button>
              <button type="button" class="ghost-button ${layout === "one" ? "is-active" : ""}" data-detail-branch-layout-topic="${escapeHtml(item.id)}" data-detail-branch-layout="one">單欄</button>
            </div>
          </div>
          ${mainTopicOverviewEntry ? renderFlatDetailBranches(item.id, visibleBranches) : renderNestedDetailBranches(item.id, visibleBranches)}
        </section>`
      : "";
  }

  if (typeof toolkit.bindInteractiveEvents === "function") {
    toolkit.bindInteractiveEvents(elements.detailContainer);
    if (elements.detailBranches) toolkit.bindInteractiveEvents(elements.detailBranches);
  }
  if (window.annotationBlocks?.init) {
    window.annotationBlocks.init(elements.detailContainer);
    if (elements.detailBranches) window.annotationBlocks.init(elements.detailBranches);
  }
}

function bindCopyLink() {
  elements.copyLinkButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      elements.copyLinkButton.textContent = "已複製連結";
      setTimeout(() => {
        elements.copyLinkButton.textContent = "複製分享連結";
      }, 1800);
    } catch (_) {
      elements.copyLinkButton.textContent = "複製失敗";
    }
  });
}

function bindMainTopicVariantTabs() {
  elements.detailContainer?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-main-topic-variant]");
    if (!button) return;
    const variantId = String(button.dataset.mainTopicVariant || "").trim();
    if (!variantId || variantId === state.mainTopicVariantId) return;
    state.mainTopicVariantId = variantId;
    const formula = formulas.find((item) => item.id === formulaId);
    if (formula) renderFormula(formula);
  });
}

function init() {
  bindCopyLink();
  bindMainTopicVariantTabs();
  const formula = formulas.find((item) => item.id === formulaId);
  if (!formula) {
    renderNotFound();
    return;
  }
  renderFormula(formula);
}

elements.detailBranches?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-detail-branch-layout-topic][data-detail-branch-layout]");
  if (!button) return;
  const topicId = button.dataset.detailBranchLayoutTopic;
  const layout = button.dataset.detailBranchLayout;
  if (!topicId || !["four", "two", "one"].includes(layout)) return;
  detailBranchLayoutByTopic[topicId] = layout;
  saveDetailBranchLayoutByTopic(detailBranchLayoutByTopic);
  const formula = formulas.find((item) => item.id === formulaId);
  if (formula) renderFormula(formula);
});

init();
window.addEventListener("load", () => {
  if (window.katex) {
    const formula = formulas.find((item) => item.id === formulaId);
    if (formula) renderFormula(formula);
  }
});
