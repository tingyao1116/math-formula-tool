(() => {
  const store = window.formulaDataStore;
  const chapterOverviews = window.chapterOverviewStore?.groups || {};
  const chapterOverviewsByCode = window.chapterOverviewStore?.byCode || {};
  const chapterOverviewBodiesByCode = window.chapterOverviewBodyStore?.byCode || {};
  const chapterClosings = window.chapterClosingStore?.groups || {};
  const chapterClosingsByCode = window.chapterClosingStore?.byCode || {};
  const mainTopicOverviewsById = window.mainTopicOverviewStore?.byId || {};
  const practiceLibraryStore = window.practiceLibraryStore || {};
  const BRANCH_LAYOUT_STORAGE_KEY = 'math-branch-layout-by-topic-v1';
  const CHAPTER_QUESTION_PAGE_SIZE = 10;

  if (!store) {
    console.error('formulaDataStore 未載入');
    return;
  }

  const allItems = store.getCurrentFormulas();
  const chapterOptions = store.getChapterOptions?.() || [];
  const chapterOptionByCode = new Map(chapterOptions.map((entry) => [entry.code, entry]));
  const DEFAULT_HOME_CHAPTER_CODE = 'j1-1-1';
  const DEFAULT_HOME_CHAPTER = chapterOptionByCode.has(DEFAULT_HOME_CHAPTER_CODE)
    ? DEFAULT_HOME_CHAPTER_CODE
    : '全部';
  const compareCurriculumItems =
    typeof store.compareCurriculumItems === 'function'
      ? store.compareCurriculumItems
      : (a, b) => String(a.title).localeCompare(String(b.title), 'zh-Hant');
  const topicIdSet = new Set(
    allItems
      .map((item) => String(item?.id || '').trim())
      .filter(Boolean)
  );
  const practiceTopicSourceIds = new Set(
    Object.values(practiceLibraryStore?.byId || {})
      .map((row) => String(row?.generatorKey || row?.practiceKey || '').trim())
      .filter((id) => id && topicIdSet.has(id))
  );

  function getToolkit() {
    return window.formulaToolkit || {};
  }

  function isHiddenPracticeBranch(item) {
    const itemId = String(item?.id || '').trim();
    return Boolean(itemId && practiceTopicSourceIds.has(itemId));
  }

  const childCountByParent = allItems.reduce((map, item) => {
    if (!item.parentId || isHiddenPracticeBranch(item)) return map;
    map.set(item.parentId, (map.get(item.parentId) || 0) + 1);
    return map;
  }, new Map());

  const childTitlesByParent = allItems.reduce((map, item) => {
    if (!item.parentId || isHiddenPracticeBranch(item)) return map;
    const list = map.get(item.parentId) || [];
    list.push(String(item.title || '').trim());
    map.set(item.parentId, list);
    return map;
  }, new Map());

  function normalizeMainThemeTitle(title) {
    return String(title || '').replace(/^(?:主要主題|主題)\s*\d+\s*[：:]\s*/u, '').trim();
  }

  function getMainThemeCoreTitle(title) {
    return normalizeMainThemeTitle(title);
  }

  function isMainThemeItem(item) {
    return Boolean(item?.id && mainTopicOverviewsById[item.id]);
  }

  function toDisplayItem(item) {
    if (!isMainThemeItem(item)) return item;
    return {
      ...item,
      title: normalizeMainThemeTitle(item.title),
    };
  }

  function renderFallbackInlineMath(text) {
    const content = String(text || '');
    const toolkit = getToolkit();
    if (typeof toolkit.renderRichTextLine === 'function') {
      return toolkit.renderRichTextLine(content);
    }
    if (window.katex && /\\|\^|_/.test(content)) {
      try {
        return window.katex.renderToString(content, { throwOnError: false, displayMode: false });
      } catch (_) {
        return escapeHtml(content);
      }
    }
    return escapeHtml(content);
  }

  function renderFallbackFormula(formula) {
    const toolkit = getToolkit();
    if (typeof toolkit.renderFormulaBlock === 'function') {
      return toolkit.renderFormulaBlock(formula);
    }

    if (formula && typeof formula === 'object' && formula.type === 'labeled-lines') {
      const lines = Array.isArray(formula.lines) ? formula.lines : [];
      return `
        <div class="labeled-lines">
          ${lines
            .map((line) => {
              const values = Array.isArray(line.values) ? line.values : [];
              const renderedValues = values
                .map((value) => `<div class="labeled-lines__value">${renderFallbackInlineMath(value)}</div>`)
                .join('');
              return `
              <div class="labeled-lines__row">
                <div class="labeled-lines__label">${escapeHtml(line.label || '')}</div>
                <div class="labeled-lines__values">${renderedValues}</div>
              </div>`;
            })
            .join('')}
        </div>`;
    }

    return escapeHtml(String(formula || '尚未整理')).replace(/\n/g, '<br>');
  }

  function fallbackRenderCard(item) {
    return `
      <article class="formula-card">
        <div class="card-top"><h3 class="card-title">${escapeHtml(item.title)}</h3></div>
        <div class="meta-row">
          <span class="meta-chip">${escapeHtml(item.stage || '')}</span>
          <span class="meta-chip">${escapeHtml(item.gradeLabel || item.grade || '')}</span>
          <span class="meta-chip">${escapeHtml(item.chapter || '')}</span>
          <span class="meta-chip">${escapeHtml(item.domain || '')}</span>
        </div>
        <div class="formula-text formula-katex">${renderFallbackFormula(item.formula)}</div>
      </article>`;
  }

  function renderCard(item, options = {}) {
    const toolkit = getToolkit();
    const displayItem = toDisplayItem(item);
    if (typeof toolkit.renderCard === 'function') {
      return toolkit.renderCard(displayItem, options);
    }
    return fallbackRenderCard(displayItem);
  }

  function loadBranchLayoutByTopic() {
    try {
      const raw = window.localStorage?.getItem(BRANCH_LAYOUT_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};
      return parsed;
    } catch (_) {
      return {};
    }
  }

  function saveBranchLayoutByTopic() {
    try {
      window.localStorage?.setItem(BRANCH_LAYOUT_STORAGE_KEY, JSON.stringify(state.branchLayoutByTopic || {}));
    } catch (_) {}
  }

  function getBranchLayout(topicId) {
    const mode = state.branchLayoutByTopic?.[topicId];
    if (mode === 'list' || mode === 'one') return 'one';
    if (mode === 'two') return 'two';
    if (mode === 'grid' || mode === 'four') return 'four';
    return 'four';
  }

  function renderNestedBranchNodes(branches, allItems, depth = 1, rootTopicId = '') {
    if (!Array.isArray(branches) || !branches.length) return '';
    const layout = depth === 1 ? getBranchLayout(rootTopicId) : 'two';
    const layoutClass = layout === 'one' ? 'branch-grid--one' : layout === 'four' ? 'branch-grid--four' : 'branch-grid--two';
    return `
      <div class="branch-grid ${layoutClass} ${depth > 1 ? 'branch-grid--nested' : ''}">
        ${branches.map((branch) => {
          const nested = allItems.filter((entry) => entry.parentId === branch.id);
          return `
            <div class="branch-node branch-node--depth-${Math.min(depth, 3)}">
              ${renderCard(branch, { showShareLink: false })}
              ${nested.length ? renderNestedBranchNodes(nested, allItems, depth + 1, rootTopicId) : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderBranchGroups(branches, topicId, allItems = []) {
    const layout = getBranchLayout(topicId);
    return `
      <section class="topic-branch-group">
        <div class="topic-branch-group__header topic-cluster__header">
          <div>
            <h4>分支檢視</h4>
            <p>每個主題可獨立切換排列方式</p>
          </div>
          <div class="branch-layout-toggle" role="group" aria-label="分支排列方式">
            <button type="button" class="ghost-button ${layout === 'four' ? 'is-active' : ''}" data-branch-layout-topic="${escapeHtml(topicId)}" data-branch-layout="four">四欄</button>
            <button type="button" class="ghost-button ${layout === 'two' ? 'is-active' : ''}" data-branch-layout-topic="${escapeHtml(topicId)}" data-branch-layout="two">二欄</button>
            <button type="button" class="ghost-button ${layout === 'one' ? 'is-active' : ''}" data-branch-layout-topic="${escapeHtml(topicId)}" data-branch-layout="one">單欄</button>
          </div>
        </div>
        ${renderNestedBranchNodes(branches, allItems, 1, topicId)}
      </section>`;
  }
  const elements = {
    heroStats: document.getElementById('heroStats'),
    searchInput: document.getElementById('searchInput'),
    viewMode: document.getElementById('viewMode'),
    gradeFilter: document.getElementById('gradeFilter'),
    domainFilter: document.getElementById('domainFilter'),
    chapterFilter: document.getElementById('chapterFilter'),
    difficultyFilter: document.getElementById('difficultyFilter'),
    contentTypeFilter: document.getElementById('contentTypeFilter'),
    sortModeFilter: document.getElementById('sortModeFilter'),
    sortDirectionToggle: document.getElementById('sortDirectionToggle'),
    branchSearchToggle: document.getElementById('branchSearchToggle'),
    resetButton: document.getElementById('resetButton'),
    resultTitle: document.getElementById('resultTitle'),
    resultCount: document.getElementById('resultCount'),
    categoryBoard: document.getElementById('categoryBoard'),
  };

  const gradeOptions = store.getGradeOptions?.() || [
    '國小',
    '國一上',
    '國一下',
    '國二上',
    '國二下',
    '國三上',
    '國三下',
    '高一上',
    '高一下',
    '高二上',
    '高二下',
    '高三',
    '其他',
  ];
  const stageOrderMap = { 國小: 0, 國中: 1, 高中: 2, 其他: 9 };
  const gradeOrderMap = {
    國小: 0,
    國一: 1,
    國二: 2,
    國三: 3,
    高一: 4,
    高二: 5,
    高三: 6,
    其他: 9,
  };
  const termOrderMap = { 上學期: 0, 下學期: 1, 其他: 9 };
  const sortModeOptions = {
    modified: '修改時間',
    curriculum: '課綱順序',
    title: '標題',
  };
  const GROUP_EXPAND_STORAGE_KEY = 'math-group-expand-state-v1';

  const state = {
    viewMode: 'chapter',
    search: '',
    grade: '全部',
    domain: '全部',
    chapter: DEFAULT_HOME_CHAPTER,
    difficulty: '全部',
    contentType: '全部',
    includeBranches: false,
    sortMode: 'curriculum',
    sortDirection: 'asc',
    overviewVariants: {},
    mainTopicVariants: {},
    branchLayoutByTopic: loadBranchLayoutByTopic(),
    expandedGroups: loadExpandedGroups(),
    chapterQuestionPanels: {},
    chapterQuestionPages: {},
    searchTimer: null,
  };

  const viewModes = [
    { id: 'chapter', label: '年級章節' },
    { id: 'domain', label: '領域分類' },
  ];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function loadExpandedGroups() {
    try {
      const raw = window.localStorage?.getItem(GROUP_EXPAND_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};
      const entries = Object.entries(parsed).filter(([, value]) => Boolean(value));
      if (entries.length > 3) return {};
      return Object.fromEntries(entries);
    } catch (_) {
      return {};
    }
  }

  function saveExpandedGroups() {
    try {
      window.localStorage?.setItem(GROUP_EXPAND_STORAGE_KEY, JSON.stringify(state.expandedGroups || {}));
    } catch (_) {}
  }

  function withPdfFitWidth(src) {
    const raw = String(src || '').trim();
    if (!raw) return '';
    if (raw.includes('#')) return `${raw}&view=FitH&zoom=page-width`;
    return `${raw}#view=FitH&zoom=page-width`;
  }

  function getGradeLabel(item) {
    return item.gradeLabel || store.buildGradeLabel?.(item.grade, item.term) || item.grade || '未分類';
  }

  function groupKeyFor(item) {
    return state.viewMode === 'domain'
      ? `${item.stage}・${getGradeLabel(item)}・${item.domain}`
      : `${item.stage}・${getGradeLabel(item)}・${item.chapter}`;
  }

  function curriculumSort(list) {
    return list.slice().sort((a, b) => compareCurriculumItems(a, b));
  }

  function pureCurriculumSort(list) {
    return list.slice().sort((a, b) => {
      return (
        ((a.stageOrder ?? 99) - (b.stageOrder ?? 99)) ||
        ((a.gradeOrder ?? 99) - (b.gradeOrder ?? 99)) ||
        ((a.termOrder ?? 99) - (b.termOrder ?? 99)) ||
        ((a.chapterOrder ?? 999) - (b.chapterOrder ?? 999)) ||
        String(a.chapter || '').localeCompare(String(b.chapter || ''), 'zh-Hant') ||
        String(a.title || '').localeCompare(String(b.title || ''), 'zh-Hant')
      );
    });
  }

  function sortItems(list) {
    return list.slice().sort((a, b) => {
      if (state.sortMode === 'title') {
        const diff = String(a.title).localeCompare(String(b.title), 'zh-Hant');
        return state.sortDirection === 'asc' ? diff : -diff;
      }
      if (state.sortMode === 'modified') {
        const aTime = a.modifiedAt ? Date.parse(a.modifiedAt) || 0 : 0;
        const bTime = b.modifiedAt ? Date.parse(b.modifiedAt) || 0 : 0;
        const diff = bTime - aTime;
        if (diff) return state.sortDirection === 'asc' ? -diff : diff;
        return compareCurriculumItems(a, b);
      }
      const diff = compareCurriculumItems(a, b);
      return state.sortDirection === 'asc' ? diff : -diff;
    });
  }

  function getUniqueValues(key, source) {
    return [...new Set(source.map((item) => item[key]).filter(Boolean))];
  }

  function populateSelect(select, values, selectedValue, labelFn = (value) => value) {
    if (!select) return;
    select.innerHTML = values
      .map((value) => `<option value="${escapeHtml(value)}">${labelFn(value)}</option>`)
      .join('');
    select.value = values.includes(selectedValue) ? selectedValue : values[0];
  }

  function renderViewModeButtons() {
    if (!elements.viewMode) return;
    elements.viewMode.innerHTML = viewModes
      .map(
        (mode) =>
          `<button type="button" class="${mode.id === state.viewMode ? 'active' : ''}" data-mode="${mode.id}">${mode.label}</button>`
      )
      .join('');
  }

  function renderHeroStats() {
    if (!elements.heroStats) return;
    const mainTopics = allItems.filter((item) => !item.parentId).length;
    const branches = allItems.filter((item) => item.parentId).length;
    const chapters = new Set(allItems.map((item) => `${item.stage}-${item.grade}-${item.term}-${item.chapter}`)).size;
    const domains = new Set(allItems.map((item) => item.domain)).size;
    const sourceInfo = store.getDataSourceInfo?.() || { label: 'Unknown', path: '' };
    elements.heroStats.innerHTML = `
      <div class="stat-chip">主題 ${mainTopics} 筆</div>
      <div class="stat-chip">分支 ${branches} 筆</div>
      <div class="stat-chip">章節 ${chapters} 個</div>
      <div class="stat-chip">領域 ${domains} 個</div>
      <div class="stat-chip">資料來源 ${escapeHtml(sourceInfo.label)}${sourceInfo.path ? `：${escapeHtml(sourceInfo.path)}` : ''}</div>
    `;
  }

  function getFilterScopedItems() {
    return pureCurriculumSort(allItems).filter((item) => {
      const gradeOk = state.grade === '全部' || getGradeLabel(item) === state.grade;
      const domainOk = state.domain === '全部' || item.domain === state.domain;
      return gradeOk && domainOk;
    });
  }

  function refreshFilters() {
    populateSelect(elements.gradeFilter, ['全部', ...gradeOptions], state.grade);

    const domainSource = pureCurriculumSort(allItems).filter(
      (item) => state.grade === '全部' || getGradeLabel(item) === state.grade
    );
    populateSelect(elements.domainFilter, ['全部', ...getUniqueValues('domain', domainSource)], state.domain);

    const chapterValues = chapterOptions
      .filter((entry) => {
        const gradeLabel = store.buildGradeLabel?.(entry.grade, entry.term) || entry.grade || '';
        const gradeOk = state.grade === '全部' || gradeLabel === state.grade;
        const domainOk = state.domain === '全部' || !entry.domainMain || entry.domainMain === state.domain;
        return gradeOk && domainOk;
      })
      .sort((a, b) => {
        return (
          (stageOrderMap[a.stage] ?? 99) - (stageOrderMap[b.stage] ?? 99) ||
          (gradeOrderMap[a.grade] ?? 99) - (gradeOrderMap[b.grade] ?? 99) ||
          (termOrderMap[a.term] ?? 99) - (termOrderMap[b.term] ?? 99) ||
          String(a.label || a.code).localeCompare(String(b.label || b.code), 'zh-Hant')
        );
      })
      .map((entry) => entry.code);
    populateSelect(
      elements.chapterFilter,
      ['全部', ...chapterValues],
      state.chapter,
      (chapterCode) => {
        if (chapterCode === '全部') return chapterCode;
        const ref = chapterOptionByCode.get(chapterCode);
        return ref?.label || chapterCode;
      }
    );

    populateSelect(elements.difficultyFilter, ['全部', '基礎', '進階', '課外'], state.difficulty);

    const contentSource = pureCurriculumSort(allItems)
      .flatMap((item) => (Array.isArray(item.contentTypes) ? item.contentTypes : []))
      .filter(Boolean);
    populateSelect(elements.contentTypeFilter, ['全部', ...new Set(contentSource)], state.contentType);

    if (elements.sortModeFilter) elements.sortModeFilter.value = state.sortMode;
  }

  function getFilteredItems() {
    const keyword = state.search.trim().toLowerCase();
    const selectedChapterMeta = chapterOptionByCode.get(state.chapter) || null;
    const selectedChapterCode = selectedChapterMeta?.code || state.chapter;
    const getItemCode = (item) =>
      item.chapterCode || store.getChapterCode?.(item.stage, item.grade, item.term, item.chapter) || '';
    const topLevel = allItems.filter((item) => !item.parentId);

    const searchable = state.includeBranches || state.chapter !== '全部' ? allItems : topLevel;
    const matchedIds = new Set(
      searchable
        .filter((item) => {
          const practiceConfig = window.formulaPracticeStore?.getConfig?.(item.id) || null;
          const calculatorConfig = window.formulaCalculatorStore?.getConfig?.(item.id) || null;
          const featureTerms = [];
          if (practiceConfig) {
            featureTerms.push('無限練習', '練習');
            if (practiceConfig.type === 'fixed-example') {
              featureTerms.push('舉例說明', '例題', '答案');
            }
          }
          if (calculatorConfig) {
            featureTerms.push('計算器', '公式計算', '計算');
          }
          const gradeOk = state.grade === '全部' || getGradeLabel(item) === state.grade;
          const domainOk = state.domain === '全部' || item.domain === state.domain;
          const chapterOk =
            state.chapter === '全部' ||
            getItemCode(item) === selectedChapterCode;
          const difficultyOk = state.difficulty === '全部' || item.difficulty === state.difficulty;
          const contentOk =
            state.contentType === '全部' ||
            (Array.isArray(item.contentTypes) && item.contentTypes.includes(state.contentType));
          const haystack = [
            item.title,
            typeof item.formula === 'string' ? item.formula : '',
            item.chapter,
            item.domain,
            ...(Array.isArray(item.tags) ? item.tags : []),
            ...(Array.isArray(item.usage) ? item.usage : []),
            ...(Array.isArray(item.examples) ? item.examples : []),
            ...(Array.isArray(item.tips) ? item.tips : []),
            ...(Array.isArray(item.notes) ? item.notes : []),
            ...(Array.isArray(item.mistakes) ? item.mistakes : []),
            ...(Array.isArray(item.contentTypes) ? item.contentTypes : []),
            ...featureTerms,
          ]
            .join(' ')
            .toLowerCase();
          const searchOk = !keyword || haystack.includes(keyword);
          return gradeOk && domainOk && chapterOk && difficultyOk && contentOk && searchOk;
        })
        .map((item) => item.id)
    );

    const childrenByParent = allItems.reduce((map, entry) => {
      if (!entry.parentId) return map;
      const arr = map.get(entry.parentId) || [];
      arr.push(entry);
      map.set(entry.parentId, arr);
      return map;
    }, new Map());

    function hasMatchedDescendant(topicId) {
      const children = childrenByParent.get(topicId) || [];
      for (const child of children) {
        if (state.chapter !== '全部' && getItemCode(child) !== selectedChapterCode) continue;
        if (matchedIds.has(child.id)) return true;
        if (hasMatchedDescendant(child.id)) return true;
      }
      return false;
    }

    const chapterScopedRoots =
      state.chapter === '全部'
        ? topLevel
        : allItems.filter((item) => {
            if (getItemCode(item) !== selectedChapterCode) return false;
            if (!item.parentId) return true;
            const parent = allItems.find((p) => p.id === item.parentId);
            if (!parent) return true;
            return getItemCode(parent) !== selectedChapterCode;
          });

    const visibleTopLevel = chapterScopedRoots.filter((item) => {
      if (matchedIds.has(item.id)) return true;
      if (state.chapter !== '全部' && hasMatchedDescendant(item.id)) return true;
      if (!state.includeBranches) return false;
      return hasMatchedDescendant(item.id);
    });

    return sortItems(visibleTopLevel).map((item) => ({
      item,
      branches: sortItems(
        allItems.filter(
          (branch) =>
            branch.parentId === item.id &&
            (state.chapter === '全部' || getItemCode(branch) === selectedChapterCode)
        )
      ).filter((branch) => !state.includeBranches || matchedIds.has(branch.id) || matchedIds.has(item.id)),
    }));
  }

  function renderRichText(text) {
    const content = String(text || '');
    const toolkit = getToolkit();
    if (typeof toolkit.renderRichTextLine === 'function') {
      return content
        .split(/\r?\n/)
        .map((line) => toolkit.renderRichTextLine(line))
        .filter(Boolean)
        .join('<br>');
    }
    return escapeHtml(content).replace(/\n/g, '<br>');
  }

  function renderInlineRichText(text) {
    const content = String(text || '').trim();
    if (!content) return '';
    const toolkit = getToolkit();
    if (typeof toolkit.renderRichTextLine === 'function') {
      return toolkit.renderRichTextLine(content);
    }
    return escapeHtml(content);
  }

  function stripKnownSourceBlocks(value) {
    return String(value ?? '').replace(/【([^】]+)】/gu, (full, inner) => {
      return /出處|學測|會考|基測|統測|指考|模擬|北北基|教育會考/u.test(inner) ? '' : full;
    });
  }

  function cleanQuestionBodyText(value) {
    let source = String(value ?? '').replace(/\r\n?/g, '\n');
    source = stripKnownSourceBlocks(source);
    source = source.replace(/(^|\n)\s*[（(]\s*(?:\n\s*)*[）)]\s*/gu, (full, prefix) => (prefix === '\n' ? '\n' : ''));
    source = source.replace(/\n[ \t]+/g, '\n');
    source = source.replace(/\n{3,}/g, '\n\n');
    return source.trim();
  }

  function isChapterQuestionPanelExpanded(chapterCode) {
    return state.chapterQuestionPanels?.[chapterCode] === true;
  }

  function getChapterQuestionPageData(chapterCode) {
    if (!chapterCode || typeof store.getLinkedQuestionsForTopic !== 'function') return null;
    const rawPage = Number(state.chapterQuestionPages?.[chapterCode] || 1);
    const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    let result = store.getLinkedQuestionsForTopic('', chapterCode, {
      limit: CHAPTER_QUESTION_PAGE_SIZE,
      offset: (requestedPage - 1) * CHAPTER_QUESTION_PAGE_SIZE,
    });
    const total = Number(result?.total) || 0;
    if (!total) return { result, total: 0, totalPages: 0, page: 1 };
    const totalPages = Math.max(1, Math.ceil(total / CHAPTER_QUESTION_PAGE_SIZE));
    const page = Math.min(requestedPage, totalPages);
    if (page !== requestedPage) {
      result = store.getLinkedQuestionsForTopic('', chapterCode, {
        limit: CHAPTER_QUESTION_PAGE_SIZE,
        offset: (page - 1) * CHAPTER_QUESTION_PAGE_SIZE,
      });
    }
    return { result, total, totalPages, page };
  }

  function renderChapterLinkedQuestionsSection(chapterCode, pageData = null) {
    const data = pageData || getChapterQuestionPageData(chapterCode);
    if (!data || !data.total) return '';
    const { result, total, totalPages, page } = data;
    const questions = Array.isArray(result?.questions) ? result.questions : [];
    if (!questions.length) return '';

    const start = (page - 1) * CHAPTER_QUESTION_PAGE_SIZE + 1;
    const end = start + questions.length - 1;
    const countLabel =
      totalPages > 1
        ? `第 ${page} / ${totalPages} 頁，顯示第 ${start}-${end} 題，共 ${total} 題`
        : `共 ${total} 題`;

    return `
      <section class="content-section linked-questions-section">
        <h4>章節題目</h4>
        <p class="linked-questions-meta">${countLabel}</p>
        <ol class="linked-question-list">
          ${questions
            .map((q) => `
              <li class="linked-question-item">
                <div class="linked-question-text">${renderRichText(cleanQuestionBodyText(q.question_text || ''))}</div>
                ${q.answer_text || q.explanation_text ? `
                  <details class="linked-question-detail">
                    <summary>看答案與解析</summary>
                    ${q.answer_text ? `<div><strong>答案：</strong>${renderRichText(cleanQuestionBodyText(q.answer_text))}</div>` : ''}
                    ${q.explanation_text ? `<div><strong>解析：</strong>${renderRichText(cleanQuestionBodyText(q.explanation_text))}</div>` : ''}
                  </details>
                ` : ''}
              </li>
            `)
            .join('')}
        </ol>
        ${totalPages > 1 ? `
          <div class="chapter-question-pagination">
            <button
              type="button"
              class="ghost-button"
              data-chapter-question-page-action="prev"
              data-chapter-question-code="${escapeHtml(chapterCode)}"
              ${page <= 1 ? 'disabled aria-disabled="true"' : ''}
            >上一頁</button>
            <span class="chapter-question-pagination__status">第 ${page} / ${totalPages} 頁</span>
            <button
              type="button"
              class="ghost-button"
              data-chapter-question-page-action="next"
              data-chapter-question-code="${escapeHtml(chapterCode)}"
              ${page >= totalPages ? 'disabled aria-disabled="true"' : ''}
            >下一頁</button>
          </div>
        ` : ''}
      </section>`;
  }

  function renderChapterQuestionPanel(chapterCode) {
    const data = getChapterQuestionPageData(chapterCode);
    if (!data || !data.total) return '';
    const expanded = isChapterQuestionPanelExpanded(chapterCode);
    return `
      <section class="panel chapter-question-panel">
        <div class="chapter-question-panel__header">
          <div>
            <h3>章節題目：共 ${data.total} 題</h3>
          </div>
          <button
            type="button"
            class="ghost-button"
            data-toggle-chapter-questions="${escapeHtml(chapterCode)}"
          >${expanded ? '收合章節題目' : '展開章節題目'}</button>
        </div>
        <div class="chapter-question-panel__body ${expanded ? '' : 'is-collapsed'}">
          ${expanded ? renderChapterLinkedQuestionsSection(chapterCode, data) : ''}
        </div>
      </section>`;
  }

  function getChapterPracticeCount(chapterCode) {
    if (!chapterCode) return 0;
    const rows = practiceLibraryStore?.byChapter?.[chapterCode];
    return Array.isArray(rows) ? rows.length : 0;
  }

  function renderOverviewSection(section) {
    if (!section) return '';
    if (section.type === 'paragraph') {
      return `<div class="chapter-overview__paragraph">${renderRichText(section.text)}</div>`;
    }
    if (section.type === 'bullet-list') {
      const title = String(section.title || '').trim();
      const items = Array.isArray(section.items) ? section.items : [];
      return `
        <section class="chapter-overview__bullet-list">
          ${title ? `<h4 class="chapter-overview__bullet-title">${escapeHtml(title)}</h4>` : ''}
          <ul class="chapter-overview__bullet-items">
            ${items.map((item) => {
              if (typeof item === 'string') {
                return `<li class="chapter-overview__bullet-item">${renderRichText(item)}</li>`;
              }
              const label = String(item?.label || '').trim();
              const text = String(item?.text || '').trim();
              return `
                <li class="chapter-overview__bullet-item">
                  ${label ? `<p class="chapter-overview__bullet-label">${renderInlineRichText(label)}</p>` : ''}
                  ${text ? `<div class="chapter-overview__bullet-text">${renderRichText(text)}</div>` : ''}
                </li>`;
            }).join('')}
          </ul>
        </section>`;
    }
    if (section.type === 'table') {
      const headers = Array.isArray(section.headers) ? section.headers : [];
      const rows = Array.isArray(section.rows) ? section.rows : [];
      return `
        <div class="chapter-overview__table-wrap">
          <table class="chapter-overview__table">
            <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
            <tbody>
              ${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderRichText(cell)}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }
    if (section.type === 'pdf-page') {
      const pdfSrc = section.src || '';
      if (!pdfSrc) return '';
      const fitSrc = withPdfFitWidth(pdfSrc);
      return `
        <div class="chapter-overview__pdf-wrap">
          <iframe loading="lazy" class="chapter-overview__pdf" title="${escapeHtml(section.note || '章節原稿')}" src="${encodeURI(fitSrc)}"></iframe>
          <div class="chapter-overview__pdf-actions">
            ${section.note ? `<p class="detail-note">${escapeHtml(section.note)}</p>` : ''}
            <a class="ghost-link" href="${encodeURI(fitSrc)}" target="_blank" rel="noopener noreferrer">在 Edge 另開（可手寫）</a>
          </div>
        </div>`;
    }
    if (section.type === 'image') {
      const imageSrc = String(section.src || '').trim();
      if (!imageSrc) return '';
      const caption = String(section.caption || '').trim();
      return `
        <figure class="chapter-overview__image-wrap">
          <img class="chapter-overview__image" src="${encodeURI(imageSrc)}" alt="${escapeHtml(caption || '章節原稿截圖')}" />
        </figure>`;
    }
    return '';
  }

  function pickOverviewSections(variants, activeVariant, predicate) {
    const activeSections = (Array.isArray(activeVariant?.sections) ? activeVariant.sections : []).filter(predicate);
    if (activeSections.length) return activeSections;
    for (const variant of Array.isArray(variants) ? variants : []) {
      const sections = (Array.isArray(variant?.sections) ? variant.sections : []).filter(predicate);
      if (sections.length) return sections;
    }
    return [];
  }

  function resolveVariantEntry(storeByCode, storeGroups, code, groupName, chosenVariantId) {
    const entry = storeByCode[code] || storeGroups[groupName] || null;
    const variants = Array.isArray(entry?.variants) ? entry.variants : [];
    const activeVariant = variants.find((variant) => variant.id === chosenVariantId) || variants[0] || { sections: [] };
    return { entry, variants, activeVariant };
  }

  function buildFallbackKeySentenceSections(ref, topicEntries) {
    const topics = Array.isArray(topicEntries) ? topicEntries.map((entry) => entry?.item).filter(Boolean) : [];
    const chapterCode = String(ref?.chapterCode || '').trim();
    const chapterOption = chapterOptionByCode.get(chapterCode) || null;
    const chapterLabel = chapterOption?.section || ref?.chapter || chapterOption?.chapter || '這個章節';
    const topicTitles = topics
      .map((item) => String(item?.title || '').trim())
      .filter(Boolean)
      .slice(0, 4);
    const branchCount = topics.reduce((sum, item) => sum + (childCountByParent.get(item.id) || 0), 0);

    let text = `${chapterLabel}先抓主線，再往下看各主題與分支。`;
    if (topicTitles.length === 1) {
      text = `${chapterLabel}目前先以「${topicTitles[0]}」為主線，先把這個主題看穩，再往下接分支。`;
    } else if (topicTitles.length > 1) {
      const head = topicTitles.slice(0, 3).join('、');
      const suffix = topicTitles.length > 3 ? `，再接 ${topicTitles[3]}` : '';
      text = `${chapterLabel}先抓 ${head}${suffix} 這幾條主線，先分清每個主題在處理什麼，再往下看題型。`;
    }
    if (branchCount > 0) {
      text += ` 這章目前還有 ${branchCount} 個下層分支，可以在主題看懂後再往下展開。`;
    }
    return [{ type: 'paragraph', text }];
  }

  function buildFallbackOutlineSections(topicEntries) {
    const topics = Array.isArray(topicEntries) ? topicEntries.map((entry) => entry?.item).filter(Boolean) : [];
    if (!topics.length) {
      return [
        {
          type: 'paragraph',
          text: '目前這個章節還沒有整理出主題，先保留這個位置，之後補上章節地圖。'
        }
      ];
    }

    return [
      {
        type: 'table',
        headers: ['主題', '角色', '下一層 / 提醒'],
        rows: topics.map((item) => {
          const childTitles = (childTitlesByParent.get(item.id) || []).filter(Boolean);
          return [
            String(item.title || '未命名主題'),
            String(item.chapterRole || (childTitles.length ? '主題' : '主題入口')),
            childTitles.length ? childTitles.join('、') : '先從這個主題開始'
          ];
        })
      }
    ];
  }

  function buildGeneratedOutlineTopicEntries(chapterCode, fallbackEntries = []) {
    const chapterItemById = new Map(
      allItems
        .filter((item) => String(item?.chapterCode || '') === String(chapterCode || ''))
        .map((item) => [String(item?.id || ''), item])
    );
    const mainThemeEntries = Object.keys(mainTopicOverviewsById)
      .filter((id) => chapterItemById.has(id))
      .map((id) => ({ item: chapterItemById.get(id) }));
    return mainThemeEntries.length ? mainThemeEntries : fallbackEntries;
  }

  function renderOverviewSegment(options) {
    const {
      label,
      title,
      hint = '',
      sections = [],
      emptyText = '尚未整理'
    } = options || {};

    return `
      <section class="chapter-overview__segment">
        <div class="chapter-overview__segment-header">
          <div>
            <p class="summary-label">${escapeHtml(label || '')}</p>
          </div>
          ${hint ? `<p class="chapter-overview__segment-hint">${escapeHtml(hint)}</p>` : ''}
        </div>
        <div class="chapter-overview__segment-body">
          ${sections.length
            ? sections.map(renderOverviewSection).join('')
            : `<p class="empty-state chapter-overview__empty">${escapeHtml(emptyText)}</p>`}
        </div>
      </section>`;
  }

  function renderClosingKeySentencePanel(sections, emptyText) {
    return `
      <section class="panel chapter-overview-panel chapter-overview-panel--closing">
        <div class="chapter-overview__body">
          ${renderOverviewSegment({
            label: '最重要的幾句話',
            title: '',
            hint: '',
            sections,
            emptyText
          })}
        </div>
      </section>`;
  }

  function renderOverview(groupName, groupItems, topicEntries = []) {
    const ref = groupItems?.[0]?.item;
    const chapterCode =
      ref?.chapterCode || store.getChapterCode?.(ref?.stage, ref?.grade, ref?.term, ref?.chapter) || '';
    const overview = chapterOverviewsByCode[chapterCode] || chapterOverviews[groupName];
    const panelCode = overview?.code || chapterCode || groupName;
    const bodyEntry = chapterOverviewBodiesByCode[chapterCode] || null;

    if (bodyEntry) {
      const generatedTopicEntries = buildGeneratedOutlineTopicEntries(chapterCode, topicEntries);
      const keyVariants = Array.isArray(overview?.variants) ? overview.variants : [];
      const keySectionsFromDb = pickOverviewSections(keyVariants, keyVariants[0] || { sections: [] }, (section) => section?.type === 'paragraph');
      const variants = Array.isArray(bodyEntry?.variants) ? bodyEntry.variants : [];
      const chosenVariantId = state.overviewVariants[groupName] || variants[0]?.id;
      const activeVariant = variants.find((variant) => variant.id === chosenVariantId) || variants[0] || { sections: [] };
      const bodySections = pickOverviewSections(variants, activeVariant, (section) => section?.type);
      const generatedOutlineSections = buildFallbackOutlineSections(generatedTopicEntries);
      const keySentenceSections = keySectionsFromDb.length
        ? keySectionsFromDb
        : buildFallbackKeySentenceSections(ref, topicEntries);
      return `
        <section class="panel chapter-overview-panel">
          <div class="chapter-overview__header">
            <div>
              <p class="summary-label">章節前言</p>
              <h3>章節大綱與教學整理</h3>
            </div>
          </div>
          ${variants.length
            ? `<div class="chapter-overview__variant-tabs">
            ${variants.map((variant) => `<button type="button" class="ghost-button ${variant.id === activeVariant.id ? 'is-active' : ''}" data-overview-group="${escapeHtml(groupName)}" data-overview-variant="${variant.id}">${variant.label}</button>`).join('')}
          </div>`
            : ''}
          <div class="chapter-overview__body" data-annotatable="true" data-annotation-key="overview-${escapeHtml(panelCode)}">
            ${renderOverviewSegment({
              label: '最重要的幾句話',
              title: '',
              hint: '',
              sections: keySentenceSections,
              emptyText: '這個章節的前言還沒整理。'
            })}
            ${renderOverviewSegment({
              label: activeVariant?.label || '章節正文',
              title: '',
              hint: '',
              sections: bodySections,
              emptyText: '這個章節的正文還沒整理。'
            })}
            ${bodyEntry.appendGeneratedOutline
              ? renderOverviewSegment({
                  label: '自動生成章節大綱',
                  title: '',
                  hint: '',
                  sections: generatedOutlineSections,
                  emptyText: '這個章節目前還沒有可生成的大綱。'
                })
              : ''}
          </div>
        </section>`;
    }

    const variants = Array.isArray(overview?.variants) ? overview.variants : [];
    const chosenVariantId = state.overviewVariants[groupName] || variants[0]?.id;
    const activeVariant = variants.find((variant) => variant.id === chosenVariantId) || variants[0] || { sections: [] };
    const manualKeySentenceSections = pickOverviewSections(variants, activeVariant, (section) => section?.type === 'paragraph');
    const manualOutlineSections = pickOverviewSections(variants, activeVariant, (section) => section?.type && section.type !== 'paragraph');
    const legacyKeySentenceSections = manualKeySentenceSections.length
      ? manualKeySentenceSections
      : buildFallbackKeySentenceSections(ref, topicEntries);
    const outlineSections = manualOutlineSections.length
      ? manualOutlineSections
      : buildFallbackOutlineSections(topicEntries);
    return `
      <section class="panel chapter-overview-panel">
        <div class="chapter-overview__header">
          <div>
            <p class="summary-label">章節前言</p>
            <h3>章節大綱與最重要幾句話</h3>
          </div>
        </div>
        ${variants.length
          ? `<div class="chapter-overview__variant-tabs">
          ${variants.map((variant) => `<button type="button" class="ghost-button ${variant.id === activeVariant.id ? 'is-active' : ''}" data-overview-group="${escapeHtml(groupName)}" data-overview-variant="${variant.id}">${variant.label}</button>`).join('')}
        </div>`
          : ''}
        <div class="chapter-overview__body" data-annotatable="true" data-annotation-key="overview-${escapeHtml(panelCode)}">
          ${renderOverviewSegment({
            label: '最重要的幾句話',
            title: '',
            hint: '',
            sections: legacyKeySentenceSections,
            emptyText: '這個章節的前言還沒整理。'
          })}
          ${renderOverviewSegment({
            label: '章節大綱',
            title: '',
            hint: '',
            sections: outlineSections,
            emptyText: '這個章節的大綱還沒整理。'
          })}
        </div>
      </section>`;
  }

  function renderMainTopicOverview(topicId, options = {}) {
    const entry = mainTopicOverviewsById[topicId] || null;
    if (!entry) return '';
    const showDetailLink = options.showDetailLink !== false;

    const variants = Array.isArray(entry.variants) ? entry.variants : [];
    const chosenVariantId = state.mainTopicVariants[topicId] || variants[0]?.id || '';
    const activeVariant = variants.find((variant) => variant.id === chosenVariantId) || variants[0] || { sections: [] };
    const sections = Array.isArray(activeVariant?.sections) && activeVariant.sections.length
      ? activeVariant.sections
      : (variants.find((variant) => Array.isArray(variant?.sections) && variant.sections.length)?.sections || []);

    return `
      <section class="panel chapter-overview-panel">
        <div class="chapter-overview__header">
          <div>
            <p class="summary-label">主題整理</p>
            <h3>${escapeHtml(entry.title || '主要主題')}</h3>
          </div>
          ${showDetailLink
            ? `<a class="ghost-link" href="formula.html?id=${encodeURIComponent(topicId)}">開啟個別公式頁</a>`
            : ''}
        </div>
        ${variants.length
          ? `<div class="chapter-overview__variant-tabs">
              ${variants.map((variant) => `<button type="button" class="ghost-button ${variant.id === activeVariant.id ? 'is-active' : ''}" data-main-topic-id="${escapeHtml(topicId)}" data-main-topic-variant="${escapeHtml(variant.id)}">${escapeHtml(variant.label)}</button>`).join('')}
            </div>`
          : ''}
        <div class="chapter-overview__body">
          ${sections.length
            ? sections.map(renderOverviewSection).join('')
            : '<p class="empty-state chapter-overview__empty">這個主要主題還沒有整理內容。</p>'}
        </div>
      </section>`;
  }

  function collectAllDescendants(itemsByParent, parentId) {
    const directChildren = itemsByParent.get(parentId) || [];
    const collected = [];
    directChildren.forEach((child) => {
      collected.push(child);
      collected.push(...collectAllDescendants(itemsByParent, child.id));
    });
    return collected;
  }

  function buildDisplayTopicEntries(topicEntries, items) {
    const sourceItems = Array.isArray(items)
      ? items.filter((item) => item && !isHiddenPracticeBranch(item))
      : [];
    const childrenByParent = sourceItems.reduce((map, item) => {
      if (!item?.parentId) return map;
      const list = map.get(item.parentId) || [];
      list.push(item);
      map.set(item.parentId, list);
      return map;
    }, new Map());

    const result = [];
    const seenBranchIds = new Set();
    (topicEntries || []).forEach((entry) => {
      const baseItem = entry?.item;
      if (!baseItem) return;
      const childTopics = (childrenByParent.get(baseItem.id) || [])
        .filter((item) => mainTopicOverviewsById[item.id])
        .sort(compareCurriculumItems);

      if (childTopics.length) {
        childTopics.forEach((child) => {
          result.push({
            item: child,
            branches: sortItems(sourceItems.filter((row) => row.parentId === child.id)),
            sourceParent: baseItem,
          });
        });
        return;
      }

      const baseBranches = isMainThemeItem(baseItem)
        ? (() => {
            const directChildren = childrenByParent.get(baseItem.id) || [];
            const mainCoreTitle = getMainThemeCoreTitle(baseItem.title);
            const flat = [];
            directChildren.forEach((child) => {
              const childCoreTitle = getMainThemeCoreTitle(child.title);
              const descendants = collectAllDescendants(childrenByParent, child.id);
              if (childCoreTitle && childCoreTitle === mainCoreTitle) {
                descendants.forEach((descendant) => {
                  if (!seenBranchIds.has(descendant.id)) {
                    seenBranchIds.add(descendant.id);
                    flat.push(descendant);
                  }
                });
                return;
              }
              if (!seenBranchIds.has(child.id)) {
                seenBranchIds.add(child.id);
                flat.push(child);
              }
              descendants.forEach((descendant) => {
                if (!seenBranchIds.has(descendant.id)) {
                  seenBranchIds.add(descendant.id);
                  flat.push(descendant);
                }
              });
            });
            return sortItems(flat);
          })()
        : Array.isArray(entry?.branches) ? entry.branches : [];

      result.push({
        item: baseItem,
        branches: baseBranches,
        sourceParent: null,
      });
    });
    return result;
  }

  function buildGroupOrderKey(groupName, items) {
    const ref = items[0]?.item;
    const groupId =
      (ref?.chapterCode && `${state.viewMode}:${ref.chapterCode}`) ||
      `${state.viewMode}:${String(groupName || '').trim()}`;
    return {
      groupId,
      name: groupName,
      items,
      chapterCode: ref?.chapterCode || '',
      stageOrder: ref?.stageOrder ?? 99,
      gradeOrder: ref?.gradeOrder ?? 99,
      termOrder: ref?.termOrder ?? 99,
      chapterOrder: ref?.chapterOrder ?? 999,
      title: ref?.chapter || ref?.domain || groupName,
    };
  }

  function renderGroups() {
    const filtered = getFilteredItems();
    const grouped = new Map();

    filtered.forEach((entry) => {
      const key = groupKeyFor(entry.item);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(entry);
    });

    if (state.viewMode === 'chapter') {
      Object.entries(chapterOverviewsByCode).forEach(([code, overview]) => {
        const option = chapterOptionByCode.get(code);
        if (!option) return;
        if (state.grade !== '全部' && getGradeLabel(option) !== state.grade) return;
        if (state.chapter !== '全部' && code !== state.chapter) return;
        const hasRealGroupForCode = [...grouped.values()].some((entries) =>
          (entries || []).some((entry) => {
            const item = entry?.item || {};
            return (
              String(item.chapterCode || '') === code &&
              !String(item.id || '').startsWith('__overview__')
            );
          })
        );
        if (hasRealGroupForCode) return;

        const chapterLabel = option.section || option.chapter;
        const key = `${option.stage}・${getGradeLabel(option)}・${chapterLabel}`;
        if (grouped.has(key)) return;
        grouped.set(key, [
          {
            item: {
              id: `__overview__${code}`,
              title: chapterLabel,
              stage: option.stage,
              grade: option.grade,
              term: option.term,
              chapter: chapterLabel,
              domain: option.domainMain || '',
              chapterCode: code,
              stageOrder: stageOrderMap[option.stage] ?? 99,
              gradeOrder: gradeOrderMap[option.grade] ?? 99,
              termOrder: termOrderMap[option.term] ?? 99,
              chapterOrder: 999,
            },
            branches: [],
          },
        ]);
      });
    }

    const groups = [...grouped.entries()]
      .map(([name, items]) => buildGroupOrderKey(name, items))
      .sort(
        (a, b) =>
          a.stageOrder - b.stageOrder ||
          a.gradeOrder - b.gradeOrder ||
          a.termOrder - b.termOrder ||
          a.chapterOrder - b.chapterOrder ||
          a.title.localeCompare(b.title, 'zh-Hant')
      );

    if (!groups.length) {
      elements.categoryBoard.innerHTML = '<section class="panel empty-state">目前沒有符合條件的內容。</section>';
      elements.resultTitle.textContent = '查無結果';
      elements.resultCount.textContent = '0 筆';
      return;
    }

    const focusedSearch = String(state.search || '').trim();
    const hasFocusedFilter =
      Boolean(focusedSearch) ||
      state.viewMode === 'domain' ||
      state.grade !== '全部' ||
      state.domain !== '全部' ||
      state.chapter !== '全部' ||
      state.difficulty !== '全部' ||
      state.contentType !== '全部';

    const renderedTopicCount = groups.reduce((sum, group) => {
      const groupItems = group.items;
      const ref = groupItems[0]?.item;
      const validTopicEntries = groupItems.filter((entry) => !String(entry.item.id || '').startsWith('__overview__'));
      const groupChapterCode =
        group.chapterCode || ref?.chapterCode || store.getChapterCode?.(ref?.stage, ref?.grade, ref?.term, ref?.chapter) || '';
      const fullChapterItems = groupChapterCode
        ? allItems.filter((item) => String(item.chapterCode || '') === String(groupChapterCode))
        : groupItems.map((row) => row.item);
      return sum + buildDisplayTopicEntries(validTopicEntries, fullChapterItems).length;
    }, 0);
    const totalCards = filtered.length + filtered.reduce((sum, entry) => sum + entry.branches.length, 0);
    elements.resultTitle.textContent = state.viewMode === 'chapter' ? '依年級章節整理' : '依領域分類整理';
    elements.resultCount.textContent = `主題 ${renderedTopicCount} 筆・顯示內容 ${totalCards} 筆`;

    elements.categoryBoard.innerHTML = groups
      .map((group) => {
        const groupItems = group.items;
        const ref = groupItems[0]?.item;
        const isExpanded = true;
        const validTopicEntries = groupItems.filter((entry) => !String(entry.item.id || '').startsWith('__overview__'));
        const groupChapterCode =
          group.chapterCode || ref?.chapterCode || store.getChapterCode?.(ref?.stage, ref?.grade, ref?.term, ref?.chapter) || '';
        const fullChapterItems = groupChapterCode
          ? allItems.filter((item) => String(item.chapterCode || '') === String(groupChapterCode) && !isHiddenPracticeBranch(item))
          : groupItems.map((row) => row.item);
        const displayTopicEntries = buildDisplayTopicEntries(validTopicEntries, fullChapterItems);
        const mainOutline = displayTopicEntries
          .map((entry) => {
            const childCount = childCountByParent.get(entry.item.id) || 0;
            const childTitles = (childTitlesByParent.get(entry.item.id) || []).filter(Boolean);
            const childHint = childTitles.length ? `下一層：${childTitles.join('、')}` : '';
            const displayItem = toDisplayItem(entry.item);
            return `
          <a
            class="topic-outline__link"
            href="formula.html?id=${entry.item.id}"
            ${childHint ? `title="${escapeHtml(childHint)}"` : ''}
          >
            <span>${escapeHtml(displayItem.title)}</span>
            ${childCount ? `<span class="topic-outline__count">↳${childCount}</span>` : ''}
          </a>
        `;
          })
          .join('');
        return `
        <section class="category-cluster panel">
          <div class="category-header">
            <div>
              <h2>${escapeHtml(group.name)}</h2>
            </div>
            <div class="card-actions">
              ${groupChapterCode && getChapterPracticeCount(groupChapterCode)
                ? `<a class="ghost-link" href="practice-bank.html?chapter=${encodeURIComponent(groupChapterCode)}">本章無限練習（${getChapterPracticeCount(groupChapterCode)}）</a>`
                : ''}
              ${groupChapterCode ? `<a class="ghost-link" href="chapter.html?code=${encodeURIComponent(groupChapterCode)}">開啟個別章節頁</a>` : ''}
            </div>
          </div>
          <div class="topic-cluster__header">
            <div>
              <h3>章節內容</h3>
            </div>
          </div>
          ${renderChapterQuestionPanel(groupChapterCode)}
          ${isExpanded ? renderOverview(group.name, groupItems, validTopicEntries) : ''}
          <section class="topic-outline panel topic-outline-panel">
            <div class="topic-cluster__header">
              <div>
                <h3>主題大綱</h3>
              </div>
            </div>
            <div class="topic-outline__links">${mainOutline || '<span class="empty-state">目前此章節尚無主題，先顯示章節大綱。</span>'}</div>
          </section>
          ${isExpanded
            ? displayTopicEntries
                .map(
                  (entry) => `
              <section class="topic-cluster">
                ${renderMainTopicOverview(entry.item.id, { showDetailLink: true })}
                ${entry.branches.length ? renderBranchGroups(entry.branches, entry.item.id, fullChapterItems) : ''}
              </section>
            `
                )
                .join('')
            : ''}
          ${isExpanded
            ? (() => {
                const chosenVariantId = state.overviewVariants[group.name];
                const closingEntry = resolveVariantEntry(
                  chapterClosingsByCode,
                  chapterClosings,
                  groupChapterCode,
                  group.name,
                  chosenVariantId
                );
                const closingSections = pickOverviewSections(
                  closingEntry.variants,
                  closingEntry.activeVariant,
                  (section) => section?.type === 'paragraph'
                );
                return renderClosingKeySentencePanel(
                  closingSections.length ? closingSections : buildFallbackKeySentenceSections(ref, validTopicEntries),
                  '這個章節的後話還沒整理。'
                );
              })()
            : ''}
        </section>`;
      })
      .join('');
  }

  function syncControlsFromState() {
    if (elements.searchInput) elements.searchInput.value = state.search;
    renderViewModeButtons();
    renderHeroStats();
    refreshFilters();
    if (elements.sortDirectionToggle) {
      elements.sortDirectionToggle.textContent =
        state.sortMode === 'curriculum'
          ? `目前：${state.sortDirection === 'asc' ? '前到後' : '後到前'}`
          : `目前：${state.sortDirection === 'asc' ? '新到舊' : '舊到新'}`;
    }
    if (elements.branchSearchToggle) {
      elements.branchSearchToggle.textContent = state.includeBranches ? '目前：連分支一起搜尋' : '目前：只搜尋主主題';
    }
  }

  function renderAll() {
    syncControlsFromState();
    renderGroups();
    const toolkit = getToolkit();
    if (typeof toolkit.bindInteractiveEvents === 'function') {
      toolkit.bindInteractiveEvents(elements.categoryBoard || document);
    }
    if (window.annotationBlocks?.init) {
      window.annotationBlocks.init(elements.categoryBoard || document);
    }
  }

  function resetFilters() {
    state.search = '';
    state.viewMode = 'chapter';
    state.grade = '全部';
    state.domain = '全部';
    state.chapter = DEFAULT_HOME_CHAPTER;
    state.difficulty = '全部';
    state.contentType = '全部';
    state.includeBranches = false;
    state.sortMode = 'curriculum';
    state.sortDirection = 'asc';
    renderAll();
  }

  elements.searchInput?.addEventListener('input', (event) => {
    const nextValue = event.target.value;
    window.clearTimeout(state.searchTimer);
    state.searchTimer = window.setTimeout(() => {
      state.search = nextValue;
      renderAll();
    }, 180);
  });
  elements.viewMode?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-mode]');
    if (!button) return;
    state.viewMode = button.dataset.mode;
    renderAll();
  });
  elements.gradeFilter?.addEventListener('change', (event) => {
    state.grade = event.target.value;
    state.domain = '全部';
    state.chapter = '全部';
    renderAll();
  });
  elements.domainFilter?.addEventListener('change', (event) => {
    state.domain = event.target.value;
    state.chapter = '全部';
    renderAll();
  });
  elements.chapterFilter?.addEventListener('change', (event) => {
    state.chapter = event.target.value;
    renderAll();
  });
  elements.difficultyFilter?.addEventListener('change', (event) => {
    state.difficulty = event.target.value;
    renderAll();
  });
  elements.contentTypeFilter?.addEventListener('change', (event) => {
    state.contentType = event.target.value;
    renderAll();
  });
  elements.sortModeFilter?.addEventListener('change', (event) => {
    state.sortMode = event.target.value;
    state.sortDirection = state.sortMode === 'curriculum' ? 'asc' : 'asc';
    renderAll();
  });
  elements.sortDirectionToggle?.addEventListener('click', () => {
    state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    renderAll();
  });
  elements.branchSearchToggle?.addEventListener('click', () => {
    state.includeBranches = !state.includeBranches;
    renderAll();
  });
  elements.resetButton?.addEventListener('click', () => resetFilters());
  elements.categoryBoard?.addEventListener('click', (event) => {
    const groupToggle = event.target.closest('[data-toggle-group]');
    if (groupToggle) {
      if (groupToggle.hasAttribute('disabled')) return;
      const groupId = String(groupToggle.dataset.toggleGroup || '').trim();
      if (groupId) {
        state.expandedGroups[groupId] = !state.expandedGroups[groupId];
        if (!state.expandedGroups[groupId]) delete state.expandedGroups[groupId];
        saveExpandedGroups();
        renderAll();
      }
      return;
    }
    const chapterQuestionToggle = event.target.closest('[data-toggle-chapter-questions]');
    if (chapterQuestionToggle) {
      const chapterCode = String(chapterQuestionToggle.dataset.toggleChapterQuestions || '').trim();
      if (!chapterCode) return;
      state.chapterQuestionPanels[chapterCode] = !isChapterQuestionPanelExpanded(chapterCode);
      renderAll();
      return;
    }
    const chapterQuestionPageButton = event.target.closest('[data-chapter-question-page-action][data-chapter-question-code]');
    if (chapterQuestionPageButton) {
      if (chapterQuestionPageButton.hasAttribute('disabled')) return;
      const chapterCode = String(chapterQuestionPageButton.dataset.chapterQuestionCode || '').trim();
      const action = String(chapterQuestionPageButton.dataset.chapterQuestionPageAction || '').trim();
      const current = Number(state.chapterQuestionPages?.[chapterCode] || 1);
      const nextPage = action === 'prev' ? current - 1 : current + 1;
      state.chapterQuestionPages[chapterCode] = Math.max(1, nextPage);
      renderAll();
      return;
    }
    const overviewButton = event.target.closest('[data-overview-group][data-overview-variant]');
    if (overviewButton) {
      state.overviewVariants[overviewButton.dataset.overviewGroup] = overviewButton.dataset.overviewVariant;
      renderAll();
      return;
    }
    const mainTopicButton = event.target.closest('[data-main-topic-id][data-main-topic-variant]');
    if (mainTopicButton) {
      const topicId = String(mainTopicButton.dataset.mainTopicId || '').trim();
      const variantId = String(mainTopicButton.dataset.mainTopicVariant || '').trim();
      if (!topicId || !variantId) return;
      state.mainTopicVariants[topicId] = variantId;
      renderAll();
      return;
    }
    const layoutButton = event.target.closest('[data-branch-layout-topic][data-branch-layout]');
    if (!layoutButton) return;
    const topicId = layoutButton.dataset.branchLayoutTopic;
    const layout = layoutButton.dataset.branchLayout;
    if (!topicId || !['four', 'two', 'one'].includes(layout)) return;
    state.branchLayoutByTopic[topicId] = layout;
    saveBranchLayoutByTopic();
    renderAll();
  });

  window.addEventListener('storage', (event) => {
    if (event.key && event.key !== store.STORAGE_KEY) return;
    window.location.reload();
  });

  renderAll();
})();
