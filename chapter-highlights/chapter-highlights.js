(() => {
  const store = window.formulaDataStore;
  const toolkit = window.formulaToolkit || {};
  const overviewStore = window.chapterOverviewStore || {};
  const overviewByCode = overviewStore.byCode || buildOverviewByCode(overviewStore.groups || {});
  const chapterOptions = store?.getChapterOptions?.() || [];
  const chapterOptionByCode = new Map(chapterOptions.map((entry) => [entry.code, entry]));

  const stageOrderMap = { 國小: 0, 國中: 1, 高中: 2, 其他: 9 };
  const gradeOrderMap = { 國小: 0, 國一: 1, 國二: 2, 國三: 3, 高一: 4, 高二: 5, 高三: 6, 其他: 9 };
  const termOrderMap = { 上學期: 0, 下學期: 1, 其他: 9 };

  const elements = {
    stats: document.getElementById('highlightsStats'),
    searchInput: document.getElementById('highlightsSearchInput'),
    bookFilter: document.getElementById('bookFilter'),
    resetButton: document.getElementById('highlightsResetButton'),
    title: document.getElementById('highlightsTitle'),
    count: document.getElementById('highlightsCount'),
    board: document.getElementById('highlightsBoard')
  };

  const state = {
    book: '全部',
    search: ''
  };

  if (!store || !elements.board) {
    console.error('chapter highlights dependencies missing');
    return;
  }

  function buildOverviewByCode(groups) {
    const map = {};
    Object.values(groups || {}).forEach((entry) => {
      if (!entry?.code) return;
      map[String(entry.code).trim()] = entry;
    });
    return map;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderLine(line) {
    const source = String(line ?? '');
    if (typeof toolkit.renderRichTextLine === 'function') {
      return toolkit.renderRichTextLine(source);
    }
    return escapeHtml(source);
  }

  function getParagraphText(entry) {
    const variants = Array.isArray(entry?.variants) ? entry.variants : [];
    const sections = Array.isArray(variants[0]?.sections) ? variants[0].sections : [];
    const paragraph = sections.find((section) => section?.type === 'paragraph');
    return String(paragraph?.text || '').trim();
  }

  function splitParagraphBlocks(text) {
    return String(text || '')
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean);
  }

  function stripPointPrefix(block) {
    return String(block || '').replace(/^\d+\.\s*/, '').trim();
  }

  function getChapterLabel(code, entry) {
    const option = chapterOptionByCode.get(code) || null;
    if (option?.section) return option.section;
    const groupName = String(entry?.groupName || '').trim();
    const parts = groupName.split('・').filter(Boolean);
    return parts[parts.length - 1] || code;
  }

  function getGradeLabel(option) {
    if (!option) return '';
    return store?.buildGradeLabel?.(option.grade, option.term) || option.grade || '';
  }

  function getBookLabel(option) {
    if (!option) return '其他';
    const gradeLabel = getGradeLabel(option);
    return gradeLabel || option.stage || '其他';
  }

  function parseCode(code) {
    const text = String(code || '').trim();
    const [prefix, ...rest] = text.split('-');
    const parts = rest.map((part) => {
      if (/^\d+$/.test(part)) return { type: 'num', value: Number(part) };
      if (/^[a-z]+$/i.test(part)) return { type: 'text', value: part.toLowerCase() };
      return { type: 'raw', value: part };
    });
    return { prefix: prefix.toLowerCase(), parts };
  }

  function compareChapterCodes(aCode, bCode) {
    const aText = String(aCode || '').trim();
    const bText = String(bCode || '').trim();
    const a = parseCode(aCode);
    const b = parseCode(bCode);
    const prefixOrder = { b: 0, j: 1, s: 2 };
    const prefixDelta = (prefixOrder[a.prefix] ?? 9) - (prefixOrder[b.prefix] ?? 9);
    if (prefixDelta) return prefixDelta;

    const length = Math.max(a.parts.length, b.parts.length);
    for (let index = 0; index < length; index += 1) {
      const aPart = a.parts[index];
      const bPart = b.parts[index];
      if (!aPart && !bPart) break;
      if (!aPart) return -1;
      if (!bPart) return 1;
      if (aPart.type === 'num' && bPart.type === 'num' && aPart.value !== bPart.value) {
        return aPart.value - bPart.value;
      }
      if (aPart.type !== bPart.type) {
        const typeOrder = { num: 0, text: 1, raw: 2 };
        return (typeOrder[aPart.type] ?? 9) - (typeOrder[bPart.type] ?? 9);
      }
      if (String(aPart.value) !== String(bPart.value)) {
        return String(aPart.value).localeCompare(String(bPart.value), 'en');
      }
    }
    return aText.localeCompare(bText, 'en');
  }

  function getEntries() {
    return Object.entries(overviewByCode)
      .map(([code, entry]) => {
        const option = chapterOptionByCode.get(code) || null;
        const text = getParagraphText(entry);
        return {
          code,
          entry,
          option,
          chapterLabel: getChapterLabel(code, entry),
          stage: option?.stage || '',
          gradeLabel: getGradeLabel(option),
          bookLabel: getBookLabel(option),
          chapter: option?.chapter || '',
          section: option?.section || '',
          text,
          blocks: splitParagraphBlocks(text)
        };
      })
      .filter((item) => item.text)
      .sort((a, b) =>
        (stageOrderMap[a.option?.stage] ?? 99) - (stageOrderMap[b.option?.stage] ?? 99) ||
        (gradeOrderMap[a.option?.grade] ?? 99) - (gradeOrderMap[b.option?.grade] ?? 99) ||
        (termOrderMap[a.option?.term] ?? 99) - (termOrderMap[b.option?.term] ?? 99) ||
        compareChapterCodes(a.code, b.code) ||
        String(a.chapterLabel).localeCompare(String(b.chapterLabel), 'zh-Hant')
      );
  }

  function getFilteredEntries() {
    const keyword = String(state.search || '').trim().toLowerCase();
    return getEntries().filter((item) => {
      if (state.book !== '全部' && item.bookLabel !== state.book) return false;
      if (!keyword) return true;
      const haystack = [
        item.chapterLabel,
        item.chapter,
        item.section,
        item.gradeLabel,
        item.bookLabel,
        item.text
      ]
        .join('\n')
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }

  function renderStats(entries) {
    const total = entries.length;
    const junior = entries.filter((item) => item.stage === '國中').length;
    const senior = entries.filter((item) => item.stage === '高中').length;
    elements.stats.innerHTML = [
      `全部 ${total} 章`,
      `國中 ${junior} 章`,
      `高中 ${senior} 章`
    ].map((label) => `<div class="stat-chip">${escapeHtml(label)}</div>`).join('');
  }

  function renderBookFilter(entries) {
    const options = ['全部', ...new Set(entries.map((item) => item.bookLabel).filter(Boolean))];
    elements.bookFilter.innerHTML = options
      .map((option) => `<option value="${escapeHtml(option)}" ${state.book === option ? 'selected' : ''}>${escapeHtml(option)}</option>`)
      .join('');
  }

  function renderCards(entries) {
    if (!entries.length) {
      elements.board.innerHTML = '<section class="panel empty-state">目前沒有符合條件的章節重點。</section>';
      return;
    }

    let currentBook = '';
    const chunks = [];

    entries.forEach((item) => {
      if (item.bookLabel !== currentBook) {
        currentBook = item.bookLabel;
        chunks.push(`
          <section class="chapter-highlights-stage">
            <div class="topic-cluster__header chapter-highlights-stage__header">
              <div>
                <p class="summary-label">冊別</p>
                <h2>${escapeHtml(currentBook || '其他')}</h2>
              </div>
            </div>
          </section>
        `);
      }

      chunks.push(`
        <article class="panel chapter-highlight-card">
          <div class="chapter-highlight-card__header">
            <div>
              <p class="summary-label">${escapeHtml(item.stage)}・${escapeHtml(item.gradeLabel)}</p>
              <h3>${escapeHtml(item.chapterLabel)}</h3>
            </div>
            <a class="ghost-link" href="chapter.html?code=${encodeURIComponent(item.code)}">開啟章節頁</a>
          </div>
          <div class="meta-row chapter-highlight-card__meta">
            ${item.chapter && item.chapter !== item.chapterLabel ? `<span class="meta-chip">${escapeHtml(item.chapter)}</span>` : ''}
            ${item.section && item.section !== item.chapterLabel ? `<span class="meta-chip">${escapeHtml(item.section)}</span>` : ''}
          </div>
          <div class="chapter-highlight-card__body">
            <ol class="chapter-highlight-points">
              ${item.blocks.map((block) => `<li>${stripPointPrefix(block).split('\n').map((line) => renderLine(line)).join('<br>')}</li>`).join('')}
            </ol>
          </div>
        </article>
      `);
    });

    elements.board.innerHTML = chunks.join('');
  }

  function render() {
    const allEntries = getEntries();
    const entries = getFilteredEntries();
    renderStats(allEntries);
    renderBookFilter(allEntries);
    elements.title.textContent = state.book === '全部' ? '全部章節' : `${state.book}章節`;
    elements.count.textContent = `目前顯示 ${entries.length} 章`;
    renderCards(entries);
  }

  function bindEvents() {
    elements.searchInput?.addEventListener('input', (event) => {
      state.search = event.target.value || '';
      render();
    });

    elements.bookFilter?.addEventListener('change', (event) => {
      state.book = String(event.target.value || '全部');
      render();
    });

    elements.resetButton?.addEventListener('click', () => {
      state.book = '全部';
      state.search = '';
      if (elements.searchInput) elements.searchInput.value = '';
      render();
    });
  }

  bindEvents();
  render();
})();
