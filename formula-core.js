(() => {
  const store = window.formulaDataStore;
  const formulas = store?.getCurrentFormulas ? store.getCurrentFormulas() : (window.formulas || []);
  const LINKED_QUESTION_SECTION_LIMIT = 5000;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeImagePath(path) {
    const raw = String(path ?? "").trim();
    if (!raw) return "";
    let normalized = raw
      .replace(/\u2212/g, "-")
      .replace(/\\/g, "/");
    const exportsIndex = normalized.lastIndexOf("/exports/");
    if (exportsIndex >= 0) {
      normalized = normalized.slice(exportsIndex + 1);
    }
    if (/\.(wmf|emf)$/i.test(normalized)) {
      normalized = `${normalized}.png`;
    }
    return normalized;
  }

  function cleanQuestionTitleText(value) {
    const source = String(value ?? "").trim();
    if (!source) return "";
    const cleaned = source.replace(
      /^\s*(?:【(?:主題|分支)範例】\s*|(?:範例|隨堂練習)\s*[0-9０-９]+(?:\s*[-－–—]\s*[0-9０-９]+)?\s*[：:、.．]?\s*)+/u,
      ""
    ).trim();
    return cleaned || source;
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

  function renderImageMarker(path) {
    const src = normalizeImagePath(path);
    if (!src) return "";
    const filename = src.split("/").pop() || "題目圖片";
    return `<img class="inline-question-image" src="${escapeHtml(encodeURI(src))}" alt="${escapeHtml(filename)}" loading="lazy">`;
  }

  function renderInlineMixedContent(text) {
    const source = String(text ?? "");
    const pattern = /\[圖\s*[：:]\s*([^\]]+)\]|\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g;
    let lastIndex = 0;
    let matched = false;
    let html = "";
    let match;

    function renderInlineTextSegment(segment) {
      const dollarMath = renderInlineDollarMath(segment);
      if (dollarMath !== null) return dollarMath;
      return renderPlainMathAwareText(segment);
    }

    while ((match = pattern.exec(source)) !== null) {
      matched = true;
      const plainText = source.slice(lastIndex, match.index);
      if (plainText) {
        html += renderInlineTextSegment(plainText);
      }

      if (match[1] !== undefined) {
        html += renderImageMarker(match[1]);
      } else {
        const latex = match[2] ?? match[3] ?? "";
        const displayMode = match[3] !== undefined;
        html += renderMath(latex, displayMode);
      }
      lastIndex = pattern.lastIndex;
    }

    if (!matched) {
      return null;
    }

    const tail = source.slice(lastIndex);
    if (tail) {
      html += renderInlineTextSegment(tail);
    }
    return html;
  }

  function renderInlineDollarMath(text) {
    const source = String(text ?? "");
    let i = 0;
    let last = 0;
    let html = "";
    let matched = false;

    function isEscaped(pos) {
      let backslashes = 0;
      let p = pos - 1;
      while (p >= 0 && source[p] === "\\") {
        backslashes += 1;
        p -= 1;
      }
      return backslashes % 2 === 1;
    }

    while (i < source.length) {
      if (source[i] !== "$" || isEscaped(i)) {
        i += 1;
        continue;
      }

      const isDouble = source[i + 1] === "$" && !isEscaped(i + 1);
      const openLen = isDouble ? 2 : 1;
      const closeToken = isDouble ? "$$" : "$";
      let j = i + openLen;
      let closeAt = -1;

      while (j < source.length) {
        if (isDouble) {
          if (source[j] === "$" && source[j + 1] === "$" && !isEscaped(j)) {
            closeAt = j;
            break;
          }
          j += 1;
        } else {
          if (source[j] === "$" && !isEscaped(j)) {
            closeAt = j;
            break;
          }
          j += 1;
        }
      }

      if (closeAt < 0) {
        i += openLen;
        continue;
      }

      matched = true;
      const plainText = source.slice(last, i);
      if (plainText) html += renderPlainMathAwareText(plainText);

      const latex = source.slice(i + openLen, closeAt).trim();
      html += renderMath(latex, isDouble);

      last = closeAt + openLen;
      i = last;
    }

    if (!matched) return null;
    const tail = source.slice(last);
    if (tail) html += renderPlainMathAwareText(tail);
    return html;
  }

  function mapLatexOutsideTextBlocks(text, transform) {
    const source = String(text ?? "");
    const applyTransform = typeof transform === "function" ? transform : (segment) => segment;
    let result = "";
    let cursor = 0;
    let i = 0;

    while (i < source.length) {
      if (!source.startsWith("\\text{", i)) {
        i += 1;
        continue;
      }

      result += applyTransform(source.slice(cursor, i));

      let depth = 0;
      let end = i + 5;
      while (end < source.length) {
        const char = source[end];
        if (char === "{") {
          depth += 1;
        } else if (char === "}") {
          depth -= 1;
          if (depth === 0) {
            end += 1;
            break;
          }
        }
        end += 1;
      }

      result += source.slice(i, end);
      cursor = end;
      i = end;
    }

    result += applyTransform(source.slice(cursor));
    return result;
  }

  function normalizeMathTextForKatex(text) {
    function normalizeMathSegment(segment) {
      return String(segment ?? "")
      .replace(/＋/g, "+")
      .replace(/−/g, "-")
      .replace(/－/g, "-")
      .replace(/＝/g, "=")
      .replace(/（/g, "(")
      .replace(/）/g, ")")
      .replace(/［/g, "[")
      .replace(/］/g, "]")
      .replace(/｛/g, "{")
      .replace(/｝/g, "}")
      .replace(/≤/g, "\\le ")
      .replace(/≥/g, "\\ge ")
      .replace(/≠/g, "\\ne ")
      .replace(/×/g, "\\times ")
      .replace(/÷/g, "\\div ");
    }

    let normalized = mapLatexOutsideTextBlocks(text, normalizeMathSegment);

    let previous = "";
    while (normalized !== previous) {
      previous = normalized;
      normalized = mapLatexOutsideTextBlocks(normalized, (segment) => segment.replace(/\^\(([^()]+)\)/g, "^{$1}"));
    }

    normalized = mapLatexOutsideTextBlocks(
      normalized,
      (segment) => segment
        .replace(/(?<!\\)\bpi\b/gi, "\\pi")
        .replace(/(?<!\\)\btheta\b/gi, "\\theta")
    );

    normalized = mapLatexOutsideTextBlocks(
      normalized,
      (segment) => segment
        .replace(/(?<!\\)\b(sin|cos|tan|cot|sec|csc)\s*\\theta\b/gi, "\\$1 \\theta")
        .replace(/(?<!\\)\b(sin|cos|tan|cot|sec|csc)\s*theta\b/gi, "\\$1 \\theta")
    );

    // e.g. log2(x) -> \log_{2}(x), log10 x -> \log_{10} x
    normalized = mapLatexOutsideTextBlocks(
      normalized,
      (segment) => segment
        .replace(/\blog\s*([0-9]+)\s*(\()/gi, "\\log_{$1}$2")
        .replace(/\blog\s*([0-9]+)\s+([A-Za-z\\(])/gi, "\\log_{$1} $2")
    );

    return normalized;
  }

  function renderQuestionBlankMarker(token) {
    const underscoreCount = String(token ?? "").replace(/\\/g, "").length;
    const length = Math.max(4, Math.min(24, underscoreCount || 8));
    return `<span class="question-blank" aria-label="填空欄位">${"＿".repeat(length)}</span>`;
  }

  function renderBlankAwareText(text) {
    const source = String(text ?? "");
    const pattern = /(\\_){3,}|_{3,}/g;
    let lastIndex = 0;
    let html = "";
    let matched = false;
    let match;

    while ((match = pattern.exec(source)) !== null) {
      matched = true;
      const plainText = source.slice(lastIndex, match.index);
      if (plainText) {
        html += renderPlainMathAwareTextCore(plainText);
      }
      html += renderQuestionBlankMarker(match[0]);
      lastIndex = pattern.lastIndex;
    }

    if (!matched) return null;
    const tail = source.slice(lastIndex);
    if (tail) {
      html += renderPlainMathAwareTextCore(tail);
    }
    return html;
  }

  function renderPlainMathAwareTextCore(text) {
    return escapeHtml(String(text ?? ""));
  }

  function renderPlainMathAwareText(text) {
    const source = String(text ?? "");
    const blankAware = renderBlankAwareText(source);
    if (blankAware !== null) return blankAware;
    return renderPlainMathAwareTextCore(source);
  }

  function renderRichTextFragment(text) {
    const source = String(text ?? "").trim();
    if (!source) return "";
    const mixedContent = renderInlineMixedContent(source);
    if (mixedContent !== null) return mixedContent;
    const dollarMath = renderInlineDollarMath(source);
    if (dollarMath !== null) return dollarMath;
    return renderPlainMathAwareText(source);
  }

  function renderMath(latex, displayMode = false) {
    const source = normalizeMathTextForKatex(latex).trim();
    if (!source) return "";

    if (window.katex) {
      try {
        return window.katex.renderToString(source, {
          throwOnError: false,
          displayMode,
          output: "html"
        });
      } catch (error) {
      }
    }

    return escapeHtml(source);
  }

  function renderRichTextLine(text) {
    const source = String(text ?? "");
    const lines = source.split(/<br\s*\/?>|\r?\n/gi);
    return lines
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "";
        if (/^\[圖\s*[：:]/.test(trimmed)) {
          return renderRichTextFragment(trimmed);
        }
        function isChineseLabelPrefix(label) {
          const body = String(label || "").replace(/[：:]$/, "").trim();
          return /[\u4e00-\u9fff]/u.test(body)
            && !/[A-Za-z0-9$\\^_{}()[\]|=<>+\-*/]/.test(body);
        }
        const labelMatch = trimmed.match(/^([^：:\n]{2,30}[：:])\s*(.+)$/);
        if (labelMatch && isChineseLabelPrefix(labelMatch[1])) {
          const [, label, rest] = labelMatch;
          return `<strong>${renderPlainMathAwareText(label)}</strong>${rest ? ` ${renderRichTextFragment(rest)}` : ""}`;
        }
        return renderRichTextFragment(trimmed);
      })
      .filter(Boolean)
      .join("<br>");
  }

  function renderStructuredFormulaBlock(config) {
    const lines = Array.isArray(config?.lines) ? config.lines : [];
    if (!lines.length) return "";

    const rows = lines.map((line) => {
      const label = line?.label ? `<div class="formula-structured__label">${escapeHtml(line.label)}</div>` : "";
      const values = Array.isArray(line?.values)
        ? line.values
        : [line?.value || line?.latex || line?.text || ""];

      const body = values
        .filter((value) => value !== undefined && value !== null && String(value).trim())
        .map((value) => {
          const text = String(value ?? "").trim();
          const pureDoubleMath = text.match(/^\$\$([\s\S]+)\$\$$/);
          if (pureDoubleMath) {
            return `<div class="formula-structured__entry"><div class="formula-line formula-line--display formula-line--aligned">${renderMath(pureDoubleMath[1], true)}</div></div>`;
          }
          const pureSingleMath = text.match(/^\$([^$]+)\$$/);
          if (pureSingleMath) {
            return `<div class="formula-structured__entry"><div class="formula-line formula-line--display formula-line--aligned">${renderMath(pureSingleMath[1], true)}</div></div>`;
          }
          const mixedInline = renderInlineMixedContent(text);
          if (mixedInline !== null) {
            return `<div class="formula-structured__entry"><div class="formula-line">${mixedInline}</div></div>`;
          }
          const dollarInline = renderInlineDollarMath(text);
          if (dollarInline !== null) {
            return `<div class="formula-structured__entry"><div class="formula-line">${dollarInline}</div></div>`;
          }
          return `<div class="formula-structured__entry"><div class="formula-line formula-line--display formula-line--aligned">${renderMath(text, true)}</div></div>`;
        })
        .join("");

      return `<div class="formula-structured__row">${label}<div class="formula-structured__body">${body}</div></div>`;
    }).join("");

    return `<div class="formula-structured">${rows}</div>`;
  }

  function renderFormulaBlock(formula) {
    if (formula && typeof formula === "object") {
      if (formula.type === "labeled-lines") {
        return renderStructuredFormulaBlock(formula);
      }
      return escapeHtml(JSON.stringify(formula));
    }

    const text = String(formula ?? "").trim();
    if (!text) return "";

    const lines = text.split(/<br\s*\/?>|\r?\n/gi).map((line) => line.trim()).filter(Boolean);
    return lines
      .map((line) => {
        return `<div class="formula-line">${renderRichTextLine(line)}</div>`;
      })
      .join("");
  }

  function renderSection(title, items) {
    const list = Array.isArray(items) ? items.filter((item) => String(item ?? "").trim()) : [];
    if (!list.length) return "";
    return `
      <section class="content-section">
        <h4>${escapeHtml(title)}</h4>
        <ul>${list.map((item) => `<li>${renderRichTextLine(item)}</li>`).join("")}</ul>
      </section>
    `;
  }

  function hasContentType(contentTypes, expectedType) {
    const list = Array.isArray(contentTypes) ? contentTypes.map((item) => String(item || "").trim()) : [];
    if (!list.length) return true;
    const aliases = {
      "公式": ["公式", "重點式", "重點公式"],
      "定義": ["定義", "核心概念", "何時使用"],
      "題型": ["題型", "使用範例", "例題"],
      "使用技巧": ["使用技巧", "學習提醒", "技巧"],
      "注意事項": ["注意事項", "補充說明", "補充"],
      "常見錯誤": ["常見錯誤", "易錯陷阱", "錯誤觀念"],
      "無限練習": ["無限練習", "練習", "題庫"]
    };
    const targets = aliases[expectedType] || [expectedType];
    return list.some((item) => targets.includes(item));
  }

  function renderLinkedQuestionSection(item) {
    if (!store || typeof store.getLinkedQuestionsForTopic !== "function") return "";
    const result = store.getLinkedQuestionsForTopic(item?.id, item?.chapterCode, {
      limit: LINKED_QUESTION_SECTION_LIMIT,
    });
    const questions = Array.isArray(result?.questions) ? result.questions : [];
    if (!questions.length) return "";

    const modeLabel = result?.mode === "chapter" ? "章節代號掛載" : "主題掛載";
    const total = Number(result?.total) || questions.length;

    return `
      <section class="content-section linked-questions-section">
        <details class="linked-questions-panel">
          <summary class="linked-questions-panel__summary">
            <span>對應題目</span>
            <span class="linked-questions-panel__meta">來源：${escapeHtml(modeLabel)}，共 ${total} 題。</span>
          </summary>
          <div class="linked-questions-panel__body">
            <ol class="linked-question-list">
              ${questions
                .map((q) => `
                  <li class="linked-question-item">
                    <div class="linked-question-text">${renderRichTextLine(cleanQuestionBodyText(q.question_text || ""))}</div>
                    ${q.answer_text || q.explanation_text ? `
                      <details class="linked-question-detail">
                        <summary>看答案與解析</summary>
                        ${q.answer_text ? `<div><strong>答案：</strong>${renderRichTextLine(cleanQuestionBodyText(q.answer_text))}</div>` : ""}
                        ${q.explanation_text ? `<div><strong>解析：</strong>${renderRichTextLine(cleanQuestionBodyText(q.explanation_text))}</div>` : ""}
                      </details>
                    ` : ""}
                  </li>
                `)
                .join("")}
            </ol>
          </div>
        </details>
      </section>
    `;
  }

  function getCalculatorConfig(item) {
    return window.formulaCalculatorStore?.getConfig?.(item?.id) || null;
  }

  function getPracticeConfig(item) {
    return window.formulaPracticeStore?.getConfig?.(item?.id) || null;
  }

  function renderCalculator(item) {
    const config = getCalculatorConfig(item);
    if (!config) return "";

    const fields = Array.isArray(config.fields) ? config.fields : [];
    const title = config.title || "公式計算";

    return `
      <section class="content-section calculator-section" data-calculator-id="${escapeHtml(item.id)}">
        <h4>${escapeHtml(title)}</h4>
        <div class="calculator-fields">
          ${fields.map((field) => `
            <label class="calculator-field">
              <span>${renderPlainMathAwareText(field.label || field.key)}</span>
              <input
                type="${escapeHtml(field.type || "number")}"
                data-calc-key="${escapeHtml(field.key)}"
                placeholder="${escapeHtml(field.placeholder || "")}"
              />
            </label>
          `).join("")}
        </div>
        <div class="interactive-actions">
          <button type="button" class="ghost-button" data-calc-run="${escapeHtml(item.id)}">計算</button>
          <button type="button" class="ghost-button" data-calc-clear="${escapeHtml(item.id)}">清除</button>
        </div>
        <div class="interactive-output" data-calc-output="${escapeHtml(item.id)}">請輸入數值後再按計算。</div>
      </section>
    `;
  }

  function renderPractice(item) {
    const config = getPracticeConfig(item);
    if (!config) return "";

    const mode = config.type || "drill";
    const title = config.title || (mode === "fixed-example" ? "舉例說明" : "無限練習");

    if (mode === "fixed-example") {
      return `
        <section class="content-section practice-section" data-practice-id="${escapeHtml(item.id)}">
          <h4>${escapeHtml(title)}</h4>
          <div class="interactive-output">${renderRichTextLine(config.prompt || "尚未設定題目")}</div>
          <div class="interactive-actions">
            <button type="button" class="ghost-button" data-practice-answer="${escapeHtml(item.id)}">顯示答案</button>
          </div>
          <div class="interactive-output is-hidden" data-practice-answer-box="${escapeHtml(item.id)}">${renderRichTextLine(config.answer || "尚未設定答案")}</div>
        </section>
      `;
    }

    return `
      <section class="content-section practice-section" data-practice-id="${escapeHtml(item.id)}">
        <h4>${escapeHtml(title)}</h4>
        <div class="interactive-actions">
          <button type="button" class="ghost-button" data-practice-generate="${escapeHtml(item.id)}">出題</button>
          <button type="button" class="ghost-button" data-practice-reveal="${escapeHtml(item.id)}">顯示答案</button>
        </div>
        <div class="interactive-output" data-practice-output="${escapeHtml(item.id)}">請先按一次出題。</div>
        <div class="interactive-output is-hidden" data-practice-answer-box="${escapeHtml(item.id)}"></div>
      </section>
    `;
  }

  function renderDiagram(item) {
    if (!item?.diagram) return "";
    return `<div class="diagram-block">${item.diagram}</div>`;
  }

  function renderCard(item, options = {}) {
    const settings = { showShareLink: true, ...options };
    const contentTypes = Array.isArray(item.contentTypes) ? item.contentTypes : [];
    const hasType = (name) => hasContentType(contentTypes, name);
    const gradeLabel = item.gradeLabel || store?.buildGradeLabel?.(item.grade, item.term) || item.grade || "";
    const meta = [item.stage, gradeLabel, item.chapter, item.domain, item.difficulty ? `難度：${item.difficulty}` : ""]
      .filter(Boolean)
      .map((value) => `<span class="meta-chip">${escapeHtml(value)}</span>`)
      .join("");
    const tags = (Array.isArray(item.tags) ? item.tags : []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
    const shareLink = settings.showShareLink ? `<div class="card-actions"><a class="ghost-link" href="formula.html?id=${item.id}">開啟個別公式頁</a></div>` : "";

    return `
      <article class="formula-card" data-annotatable="true" data-annotation-key="topic-${escapeHtml(item.id)}">
        <div class="card-top">
          <div><h3 class="card-title">${escapeHtml(item.title)}</h3></div>
          <div>${tags}</div>
        </div>
        <div class="meta-row">${meta}</div>
        ${renderDiagram(item)}
        ${(hasType("公式") || hasType("定義")) ? `<div class="formula-text formula-katex">${renderFormulaBlock(item.formula)}</div>` : ""}
        ${hasType("定義") ? renderSection("何時使用", item.usage) : ""}
        ${hasType("題型") ? renderSection("使用範例", item.examples) : ""}
        ${hasType("使用技巧") ? renderSection("使用技巧", item.tips) : ""}
        ${hasType("注意事項") ? renderSection("注意事項", item.notes) : ""}
        ${hasType("常見錯誤") ? renderSection("常見錯誤", item.mistakes) : ""}
        ${renderLinkedQuestionSection(item)}
        ${hasType("公式") ? renderCalculator(item) : ""}
        ${hasType("無限練習") ? renderPractice(item) : ""}
        ${shareLink}
      </article>
    `;
  }

  function renderBranchGroups(items) {
    const branches = Array.isArray(items) ? items : [];
    if (!branches.length) return "";
    return `<div class="branch-grid">${branches.map((item) => renderCard(item)).join("")}</div>`;
  }

  function bindInteractiveEvents(container = document) {
    container.querySelectorAll("[data-practice-answer]").forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", () => {
        const id = button.dataset.practiceAnswer;
        const box = container.querySelector(`[data-practice-answer-box="${id}"]`);
        if (box) box.classList.toggle("is-hidden");
      });
    });

    container.querySelectorAll("[data-practice-generate]").forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", () => {
        const id = button.dataset.practiceGenerate;
        const config = getPracticeConfig({ id });
        const output = container.querySelector(`[data-practice-output="${id}"]`);
        const answerBox = container.querySelector(`[data-practice-answer-box="${id}"]`);
        if (!config || typeof config.generate !== "function") {
          if (output) output.textContent = "這一題尚未設定練習內容。";
          if (answerBox) {
            answerBox.textContent = "";
            answerBox.classList.add("is-hidden");
          }
          return;
        }

        const item = formulas.find((entry) => entry.id === id) || { id };
        const result = config.generate(item) || {};
        const intro = typeof result.intro === "string" ? result.intro : "";
        const questions = Array.isArray(result.questions) ? result.questions : [];
        const answers = Array.isArray(result.answers) ? result.answers : [];

        if (output) {
          output.innerHTML = questions.length
            ? `${intro ? `<p class="practice-intro">${renderRichTextLine(intro)}</p>` : ""}<ol>${questions.map((question) => `<li>${renderRichTextLine(question)}</li>`).join("")}</ol>`
            : "目前沒有產生題目。";
        }
        if (answerBox) {
          answerBox.innerHTML = answers.length
            ? `<ol>${answers.map((answer) => `<li>${renderRichTextLine(answer)}</li>`).join("")}</ol>`
            : "目前沒有答案。";
          answerBox.classList.add("is-hidden");
        }
      });
    });

    container.querySelectorAll("[data-practice-reveal]").forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", () => {
        const id = button.dataset.practiceReveal;
        const box = container.querySelector(`[data-practice-answer-box="${id}"]`);
        if (box) box.classList.toggle("is-hidden");
      });
    });

    container.querySelectorAll("[data-calc-run]").forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", () => {
        const id = button.dataset.calcRun;
        const config = getCalculatorConfig({ id });
        const section = button.closest(`[data-calculator-id="${id}"]`);
        const output = section?.querySelector(`[data-calc-output="${id}"]`);
        if (!config || typeof config.evaluate !== "function" || !section || !output) {
          if (output) output.textContent = "這個主題尚未設定計算器。";
          return;
        }

        const values = {};
        section.querySelectorAll("[data-calc-key]").forEach((input) => {
          values[input.dataset.calcKey] = input.value;
        });

        try {
          const result = config.evaluate(values);
          if (result?.latex) {
            output.innerHTML = renderMath(result.latex, true);
          } else if (result?.text) {
            output.innerHTML = renderRichTextLine(result.text);
          } else {
            output.textContent = "目前沒有輸出結果。";
          }
        } catch (error) {
          output.textContent = error?.message || "計算失敗，請檢查輸入值。";
        }
      });
    });

    container.querySelectorAll("[data-calc-clear]").forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", () => {
        const id = button.dataset.calcClear;
        const section = button.closest(`[data-calculator-id="${id}"]`);
        const output = section?.querySelector(`[data-calc-output="${id}"]`);
        section?.querySelectorAll("[data-calc-key]").forEach((input) => {
          input.value = "";
        });
        if (output) output.textContent = "請輸入數值後再按計算。";
      });
    });
  }

  window.formulaToolkit = {
    formulas,
    renderCard,
    renderBranchGroups,
    bindInteractiveEvents,
    renderSection,
    formatMathText: renderRichTextLine,
    renderFormulaBlock,
    renderRichTextLine,
    calculatorStore: window.formulaCalculatorStore || null,
    practiceStore: window.formulaPracticeStore || null
  };
})();
