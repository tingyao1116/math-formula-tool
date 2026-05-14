const store = window.formulaDataStore;
const toolkit = window.formulaToolkit || {};
const params = new URLSearchParams(window.location.search);
const chapterCode = String(params.get("code") || "").trim();

const elements = {
  title: document.getElementById("chapterTitle"),
  lead: document.getElementById("chapterLead"),
  stats: document.getElementById("chapterStats"),
  container: document.getElementById("chapterContainer"),
  copyLinkButton: document.getElementById("copyChapterLinkButton"),
};

const formulas = store?.getCurrentFormulas?.() || [];
const overviewStore = window.chapterOverviewStore || {};
const overviewByCode = overviewStore.byCode || buildOverviewByCode(overviewStore.groups || {});
const closingStore = window.chapterClosingStore || {};
const closingByCode = closingStore.byCode || buildOverviewByCode(closingStore.groups || {});
const state = {
  overviewVariantId: "",
};

function buildOverviewByCode(groups) {
  const map = {};
  Object.values(groups || {}).forEach((entry) => {
    if (!entry?.code) return;
    map[String(entry.code).trim()] = entry;
  });
  return map;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripKnownSourceBlocks(value) {
  return String(value ?? "").replace(/【([^】]+)】/gu, (full, inner) => {
    return /出處|學測|會考|基測|統測|指考|模擬|北北基|教育會考/u.test(inner) ? "" : full;
  });
}

function cleanQuestionBodyText(value) {
  let source = String(value ?? "").replace(/\r\n?/g, "\n");
  source = stripKnownSourceBlocks(source);
  source = source.replace(/(^|\n)\s*[（(]\s*(?:\n\s*)*[）)]\s*/gu, (full, prefix) => (prefix === "\n" ? "\n" : ""));
  source = source.replace(/\n[ \t]+/g, "\n");
  source = source.replace(/\n{3,}/g, "\n\n");
  return source.trim();
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

function normalizeChapterItems(code) {
  return formulas.filter((item) => String(item?.chapterCode || "").trim() === code);
}

function buildChildrenByParent(items) {
  const map = new Map();
  items.forEach((item) => {
    const parentId = String(item?.parentId || "").trim();
    if (!parentId) return;
    if (!map.has(parentId)) map.set(parentId, []);
    map.get(parentId).push(item);
  });
  return map;
}

function pickTopLevelTopics(items) {
  const idSet = new Set(items.map((item) => String(item.id || "").trim()).filter(Boolean));
  return items.filter((item) => {
    const parentId = String(item?.parentId || "").trim();
    if (!parentId) return true;
    return !idSet.has(parentId);
  });
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
        <iframe loading="lazy" class="chapter-overview__pdf" title="${escapeHtml(section.note || "章節原稿")}" src="${encodeURI(pdfSrc)}"></iframe>
        <div class="chapter-overview__pdf-actions">
          <a class="ghost-link" href="${encodeURI(pdfSrc)}" target="_blank" rel="noopener noreferrer">另開原稿</a>
        </div>
      </div>`;
  }
  return "";
}

function renderOverviewSegment(label, sections, emptyText) {
  return `
    <section class="chapter-overview__segment">
      <div class="chapter-overview__segment-header">
        <div><p class="summary-label">${escapeHtml(label)}</p></div>
      </div>
      <div class="chapter-overview__segment-body">
        ${sections.length
          ? sections.map(renderOverviewSection).join("")
          : `<p class="empty-state chapter-overview__empty">${escapeHtml(emptyText)}</p>`}
      </div>
    </section>`;
}

function pickOverviewSections(variants, activeVariant, predicate) {
  const activeSections = Array.isArray(activeVariant?.sections) ? activeVariant.sections.filter(predicate) : [];
  if (activeSections.length) return activeSections;
  for (const variant of Array.isArray(variants) ? variants : []) {
    const sections = Array.isArray(variant?.sections) ? variant.sections.filter(predicate) : [];
    if (sections.length) return sections;
  }
  return [];
}

function renderOverviewBlock(entry, fallbackText) {
  const variants = Array.isArray(entry?.variants) ? entry.variants : [];
  const chosenVariantId = state.overviewVariantId || variants[0]?.id || "";
  const activeVariant = variants.find((variant) => variant.id === chosenVariantId) || variants[0] || { sections: [] };
  const keySections = pickOverviewSections(variants, activeVariant, (section) => section?.type === "paragraph");
  const outlineSections = pickOverviewSections(variants, activeVariant, (section) => section?.type && section.type !== "paragraph");
  const safeKeySections = keySections.length
    ? keySections
    : [{ type: "paragraph", text: fallbackText }];

  return `
    <section class="panel chapter-overview-panel">
      <div class="chapter-overview__header">
        <div>
          <p class="summary-label">章節前言</p>
          <h3>章節大綱與最重要的幾句話</h3>
        </div>
        ${variants.length
          ? `<div class="chapter-overview__variant-tabs">
              ${variants.map((variant) => `<button type="button" class="ghost-button ${variant.id === activeVariant.id ? "is-active" : ""}" data-overview-variant="${escapeHtml(variant.id)}">${escapeHtml(variant.label)}</button>`).join("")}
            </div>`
          : ""}
      </div>
      <div class="chapter-overview__body">
        ${renderOverviewSegment("最重要的幾句話", safeKeySections, "這個章節的前言還沒整理。")}
        ${renderOverviewSegment("章節大綱", outlineSections, "這個章節的大綱還沒整理。")}
      </div>
    </section>`;
}

function renderClosingKeySentencePanel(sections, fallbackText) {
  const safeSections = sections.length
    ? sections
    : [{ type: "paragraph", text: fallbackText }];
  return `
    <section class="panel chapter-overview-panel chapter-overview-panel--closing">
      <div class="chapter-overview__body">
        ${renderOverviewSegment("最重要的幾句話", safeSections, "這個章節的前言還沒整理。")}
      </div>
    </section>`;
}

function renderQuestionSectionList(code, category, title) {
  if (typeof store?.getLinkedQuestionsForTopic !== "function") return "";
  const result = store.getLinkedQuestionsForTopic("", code, {
    limit: 5000,
    offset: 0,
    questionCategory: category,
  });
  if (!result?.total) return "";

  const items = Array.isArray(result.questions) ? result.questions : [];
  return `
    <section class="panel chapter-question-panel">
      <div class="chapter-question-panel__header">
        <div><h3>${title}，共 ${result.total} 題</h3></div>
      </div>
      <div class="chapter-question-panel__body">
        <section class="content-section linked-questions-section">
          <ol class="linked-question-list">
            ${items.map((q) => `
              <li class="linked-question-item">
                <div class="linked-question-text">${renderRichText(cleanQuestionBodyText(q.question_text || ""))}</div>
                ${q.answer_text || q.explanation_text ? `
                  <details class="linked-question-detail">
                    <summary>看答案與解析</summary>
                    ${q.answer_text ? `<div><strong>答案：</strong>${renderRichText(cleanQuestionBodyText(q.answer_text))}</div>` : ""}
                    ${q.explanation_text ? `<div><strong>解析：</strong>${renderRichText(cleanQuestionBodyText(q.explanation_text))}</div>` : ""}
                  </details>
                ` : ""}
              </li>
            `).join("")}
          </ol>
        </section>
      </div>
    </section>`;
}

function renderQuestionList(code) {
  return [
    renderQuestionSectionList(code, "綜合", "綜合"),
    renderQuestionSectionList(code, "段考", "段考"),
    renderQuestionSectionList(code, "歷屆", "歷屆"),
    renderQuestionSectionList(code, "模考", "模考"),
  ].filter(Boolean).join("");
}

function renderNestedBranchTree(items, childrenByParent, depth = 1) {
  if (!items.length || typeof toolkit.renderCard !== "function") return "";
  const layoutClass = depth <= 1 ? "branch-grid" : "branch-grid branch-grid--nested";
  return `
    <div class="${layoutClass}">
      ${items.map((item) => {
        const children = childrenByParent.get(item.id) || [];
        return `
          <div class="branch-node branch-node--depth-${Math.min(depth, 3)}">
            ${toolkit.renderCard(item, { showShareLink: true })}
            ${children.length ? renderNestedBranchTree(children, childrenByParent, depth + 1) : ""}
          </div>`;
      }).join("")}
    </div>`;
}

function renderTopicTree(topics, childrenByParent) {
  return topics.map((item) => {
    const children = childrenByParent.get(item.id) || [];
    return `
      <section class="topic-cluster">
        ${typeof toolkit.renderCard === "function" ? toolkit.renderCard(item, { showShareLink: true }) : ""}
        ${children.length ? renderNestedBranchTree(children, childrenByParent) : ""}
      </section>`;
  }).join("");
}

function renderNotFound() {
  document.title = "找不到章節";
  elements.title.textContent = "找不到章節";
  elements.lead.textContent = "目前沒有對應的章節資料，請回上一頁重新選擇。";
  elements.stats.innerHTML = '<div class="stat-chip">無章節資料</div>';
  elements.container.innerHTML = '<div class="empty-state">目前沒有這個章節的內容，請確認章節代碼是否正確。</div>';
}

function renderStats(meta) {
  const chips = [
    meta.stage,
    meta.gradeLabel,
    meta.chapter,
    `主題 ${meta.topLevelCount} 個`,
    meta.branchCount ? `分支 ${meta.branchCount} 個` : "",
    meta.questionCount ? `章節題目 ${meta.questionCount} 題` : "",
  ].filter(Boolean);
  elements.stats.innerHTML = chips.map((value) => `<div class="stat-chip">${escapeHtml(value)}</div>`).join("");
}

function bindCopyLink() {
  elements.copyLinkButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      elements.copyLinkButton.textContent = "已複製章節連結";
      setTimeout(() => {
        elements.copyLinkButton.textContent = "複製章節連結";
      }, 1800);
    } catch (_) {
      elements.copyLinkButton.textContent = "複製失敗";
    }
  });
}

function bindOverviewTabs() {
  elements.container?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-overview-variant]");
    if (!button) return;
    const variantId = String(button.dataset.overviewVariant || "").trim();
    if (!variantId || variantId === state.overviewVariantId) return;
    state.overviewVariantId = variantId;
    init();
  });
}

function init() {
  if (!init._bound) {
    bindCopyLink();
    bindOverviewTabs();
    init._bound = true;
  }
  if (!chapterCode) {
    renderNotFound();
    return;
  }

  const items = normalizeChapterItems(chapterCode);
  const overviewEntry = overviewByCode[chapterCode] || null;
  if (!items.length && !overviewEntry) {
    renderNotFound();
    return;
  }

  const ref = items[0] || {};
  const childrenByParent = buildChildrenByParent(items);
  const topLevelTopics = pickTopLevelTopics(items);
  const questionData = typeof store?.getLinkedQuestionsForTopic === "function"
    ? store.getLinkedQuestionsForTopic("", chapterCode, { limit: 1, offset: 0 })
    : { total: 0 };
  const chapterLabel = store?.formatChapterLabel?.(ref.stage, ref.grade, ref.term, ref.chapter) || ref.chapter || chapterCode;
  const fallbackText = `${ref.chapter || chapterCode}的章節前言還沒完整整理，先從主題與分支開始。`;
  const closingEntry = closingByCode[chapterCode] || null;
  const closingKeySections = Array.isArray(closingEntry?.variants?.[0]?.sections)
    ? closingEntry.variants[0].sections.filter((section) => section?.type === "paragraph")
    : [];

  document.title = `${chapterLabel}｜個別章節頁`;
  elements.title.textContent = chapterLabel;
  elements.lead.textContent = `${ref.chapter || chapterCode}的章節整理、題目與主題分支都放在這裡。`;

  renderStats({
    stage: ref.stage || "",
    gradeLabel: ref.gradeLabel || store?.buildGradeLabel?.(ref.grade, ref.term) || "",
    chapter: ref.chapter || chapterCode,
    topLevelCount: topLevelTopics.length,
    branchCount: Math.max(items.length - topLevelTopics.length, 0),
    questionCount: questionData?.total || 0,
  });

  elements.container.innerHTML = `
    ${renderOverviewBlock(overviewEntry, fallbackText)}
    <section class="panel detail-branches-panel">
      <div class="topic-cluster__header">
        <div>
          <p class="summary-label">章節主題</p>
          <h2>這一章的主題與分支</h2>
        </div>
      </div>
      ${topLevelTopics.length
        ? renderTopicTree(topLevelTopics, childrenByParent)
        : '<div class="empty-state">目前這個章節還沒有整理出主題。</div>'}
    </section>
    ${renderClosingKeySentencePanel(closingKeySections, `${ref.chapter || chapterCode}的章節後話還沒整理。`)}
    ${renderQuestionList(chapterCode)}
  `;

  if (typeof toolkit.bindInteractiveEvents === "function") {
    toolkit.bindInteractiveEvents(elements.container);
  }
  if (window.annotationBlocks?.init) {
    window.annotationBlocks.init(elements.container);
  }
}

init();
