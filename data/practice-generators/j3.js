(() => {
  const store = window.formulaPracticeStore;
  if (!store || typeof store.registerConfigs !== 'function') return;

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickNonZero(min, max) {
    let value = 0;
    while (value === 0) value = randInt(min, max);
    return value;
  }

  function wrapIfNegative(value) {
    return value < 0 ? `(${value})` : `${value}`;
  }

  // Shared math display formatter helpers

  function gcdInt(a, b) {
    let x = Math.abs(Math.trunc(a || 0));
    let y = Math.abs(Math.trunc(b || 0));
    while (y !== 0) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x || 1;
  }

  function reduceFraction(numerator, denominator) {
    if (denominator === 0) return { numerator, denominator: 0 };
    if (numerator === 0) return { numerator: 0, denominator: 1 };
    const sign = numerator * denominator < 0 ? -1 : 1;
    const n = Math.abs(numerator);
    const d = Math.abs(denominator);
    const g = gcdInt(n, d);
    return { numerator: sign * (n / g), denominator: d / g };
  }

  function formatFraction(numerator, denominator) {
    const reduced = reduceFraction(numerator, denominator);
    if (reduced.denominator === 0) return '\\text{undefined}';
    if (reduced.denominator === 1) return `${reduced.numerator}`;
    const sign = reduced.numerator < 0 ? '-' : '';
    return `${sign}\\frac{${Math.abs(reduced.numerator)}}{${reduced.denominator}}`;
  }

  function simplifyRadical(n) {
    if (n <= 0) return { outside: 0, inside: n };
    let outside = 1;
    let inside = n;
    for (let k = 2; k * k <= inside; k += 1) {
      while (inside % (k * k) === 0) {
        outside *= k;
        inside /= k * k;
      }
    }
    return { outside, inside };
  }

  function formatRadical(n) {
    const r = simplifyRadical(n);
    if (r.inside === 1) return `${r.outside}`;
    if (r.outside === 1) return `\\sqrt{${r.inside}}`;
    return `${r.outside}\\sqrt{${r.inside}}`;
  }

  function formatScaledRadical(coef, n) {
    if (coef === 0) return '0';
    const r = simplifyRadical(n);
    const scale = coef * r.outside;
    if (r.inside === 1) return `${scale}`;
    if (scale === 1) return `\\sqrt{${r.inside}}`;
    if (scale === -1) return `-\\sqrt{${r.inside}}`;
    return `${scale}\\sqrt{${r.inside}}`;
  }

 function formatHalfScaledRadical(coef, n) {
   const r = simplifyRadical(n);
   const scale = coef * r.outside;
   if (r.inside === 1) return formatFraction(scale, 2);
   if (scale % 2 === 0) return formatScaledRadical(scale / 2, r.inside);
   const radical = r.inside === 1 ? '' : `\\sqrt{${r.inside}}`;
   return `\\frac{${scale}${radical}}{2}`;
 }

  function formatRationalizedRadicalFraction(numerator, radicand) {
    const simplified = simplifyRadical(radicand);
    if (simplified.inside === 1) return formatFraction(numerator, simplified.outside);
    const reduced = reduceFraction(numerator, simplified.outside * simplified.inside);
    const absNumerator = Math.abs(reduced.numerator);
    const radicalNumerator =
      absNumerator === 1
        ? `\\sqrt{${simplified.inside}}`
        : `${absNumerator}\\sqrt{${simplified.inside}}`;
    const sign = reduced.numerator < 0 ? '-' : '';
    return reduced.denominator === 1
      ? `${sign}${radicalNumerator}`
      : `${sign}\\frac{${radicalNumerator}}{${reduced.denominator}}`;
  }

  function formatCoeffTerm(coeff, variable = 'x', power = 1) {
    if (!Number.isFinite(coeff) || coeff === 0) return '0';
    const sign = coeff < 0 ? '-' : '';
    const abs = Math.abs(coeff);
    const coeffText = abs === 1 ? '' : `${abs}`;
    const powerText = power === 1 ? variable : `${variable}^${power}`;
    return `${sign}${coeffText}${powerText}`;
  }

  function formatSubtraction(left, right) {
    return right < 0 ? `${left}-(${right})` : `${left}-${right}`;
  }

  function formatSignedNumber(value) {
    if (value === 0) return '';
    return value > 0 ? `+${value}` : `${value}`;
  }

  function formatArithmeticSum(a, b) {
    if (b === 0) return `${a}`;
    return `${a}${b >= 0 ? `+${b}` : `-${Math.abs(b)}`}`;
  }

  function formatXMinusFraction(frac) {
    const value = makeFraction(frac.num, frac.den);
    if (value.num === 0) return 'x';
    if (value.num < 0) return `x+${fractionToLatex({ num: -value.num, den: value.den })}`;
    return `x-${fractionToLatex(value)}`;
  }

  function isPerfectSquare(n) {
    if (n < 0) return false;
    const r = Math.floor(Math.sqrt(n));
    return r * r === n;
  }

  function pickNonSquare(min, max) {
    let v = randInt(min, max);
    while (isPerfectSquare(v)) v = randInt(min, max);
    return v;
  }

  function formatDecimalValue(value) {
    if (Number.isInteger(value)) return `${value}`;
    return `${Number(value.toFixed(6))}`;
  }

  function formatTerm(coef, variable = 'x') {
    if (coef === 1) return variable;
    if (coef === -1) return `-${variable}`;
    return `${coef}${variable}`;
  }

  function formatPolynomialFromCoeffs(coeffs, variable = 'x') {
    const degree = coeffs.length - 1;
    const parts = [];
    coeffs.forEach((coef, index) => {
      if (coef === 0) return;
      const power = degree - index;
      const absCoef = Math.abs(coef);
      let term = '';
      if (power === 0) {
        term = `${absCoef}`;
      } else if (power === 1) {
        term = absCoef === 1 ? variable : `${absCoef}${variable}`;
      } else {
        term = absCoef === 1 ? `${variable}^${power}` : `${absCoef}${variable}^${power}`;
      }

      if (!parts.length) {
        parts.push(coef < 0 ? `-${term}` : term);
      } else {
        parts.push(coef < 0 ? `- ${term}` : `+ ${term}`);
      }
    });
    return parts.join(' ') || '0';
  }

  function formatEvaluationExpression(coeffs, value) {
    const degree = coeffs.length - 1;
    const parts = [];
    coeffs.forEach((coef, index) => {
      if (coef === 0) return;
      const power = degree - index;
      const absCoef = Math.abs(coef);
      let core = '';
      if (power === 0) {
        core = `${absCoef}`;
      } else {
        const valueText = power === 1 ? `(${value})` : `(${value})^${power}`;
        core = absCoef === 1 ? valueText : `${absCoef}\\cdot${valueText}`;
      }
      if (!parts.length) {
        parts.push(coef < 0 ? `-${core}` : core);
      } else {
        parts.push(`${coef < 0 ? '-' : '+'}${core}`);
      }
    });
    return parts.join('') || '0';
  }

  function formatQuadraticEquation(a, b, c) {
    return `${formatPolynomialFromCoeffs([a, b, c])}=0`;
  }

  function formatFactorFromRoot(root) {
    if (root === 0) return '(x)';
    return root >= 0 ? `(x-${root})` : `(x+${Math.abs(root)})`;
  }

  function formatQuadraticFactorizationFromRoots(rootA, rootB) {
    return `${formatFactorFromRoot(rootA)}${formatFactorFromRoot(rootB)}`;
  }

  function formatQuadraticEquationFromRoots(rootA, rootB) {
    return formatQuadraticEquation(1, -(rootA + rootB), rootA * rootB);
  }

  function formatMonicQuadraticWithSymbolicConstant(linearCoeff, constantSymbol = 'k') {
    const linearText =
      linearCoeff === 0 ? '' : linearCoeff > 0 ? `+${formatTerm(linearCoeff, 'x')}` : formatTerm(linearCoeff, 'x');
    return `x^2${linearText}+${constantSymbol}=0`;
  }

  function createAnswerList(summaryAnswers) {
    const answers = [];
    const nativePush = Array.prototype.push;
    answers.push = function pushAnswerWithSummary(...items) {
      const cleanedItems = items.map((item) => {
        summaryAnswers.push(deriveSummaryAnswerFromDetail(item));
        return stripDetailSummaryLabel(item);
      });
      return nativePush.apply(this, cleanedItems);
    };
    return answers;
  }

  function pushAnswerWithManualSummary(answers, summaryAnswers, summary, detail) {
    summaryAnswers.push(summary);
    return Array.prototype.push.call(answers, stripDetailSummaryLabel(detail));
  }

  function resolvePracticeCount(count, fallback) {
    const parsed = Number(count);
    if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
    return fallback;
  }

  function stripDetailSummaryLabel(detail) {
    const text = String(detail || '');
    const withoutLabeledSummary = text.replace(
      /^\s*(?:簡答|答案)[:：]\s*[\s\S]*?\s*(?:過程|解析|詳解|說明)[:：]\s*/,
      ''
    );
    if (withoutLabeledSummary !== text) return withoutLabeledSummary.trim();
    return text.replace(/^\s*(?:簡答|答案)[:：]\s*/, '').trim();
  }

  function buildUniquePracticeSet(generator, count) {
    const target = resolvePracticeCount(count, 1);
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const seen = new Set();
    const fallback = [];

    for (let attempt = 0; questions.length < target && attempt < 40; attempt += 1) {
      const batch = generator(Math.max(target, target - questions.length));
      const batchQuestions = Array.isArray(batch.questions) ? batch.questions : [];
      const batchSummaries = Array.isArray(batch.summaryAnswers) ? batch.summaryAnswers : [];
      const batchAnswers = Array.isArray(batch.answers) ? batch.answers : [];

      for (let i = 0; i < batchQuestions.length; i += 1) {
        const question = batchQuestions[i];
        const summary = batchSummaries[i];
        const answer = batchAnswers[i];
        const key = String(question).replace(/\s+/g, ' ').trim();
        if (!question || summary === undefined || answer === undefined) continue;
        fallback.push({ question, summary, answer });
        if (seen.has(key)) continue;
        seen.add(key);
        questions.push(question);
        summaryAnswers.push(summary);
        answers.push(stripDetailSummaryLabel(answer));
        if (questions.length >= target) break;
      }
    }

    for (let i = 0; questions.length < target && i < fallback.length; i += 1) {
      questions.push(fallback[i].question);
      summaryAnswers.push(fallback[i].summary);
      answers.push(stripDetailSummaryLabel(fallback[i].answer));
    }

    return { questions, summaryAnswers, answers };
  }

  function pushGeneratedItem(targetQuestions, targetAnswers, targetSummaryAnswers, generated) {
    targetQuestions.push(generated.questions[0]);
    targetSummaryAnswers.push(generated.summaryAnswers[0]);
    return Array.prototype.push.call(targetAnswers, generated.answers[0]);
  }

  function buildCubicDivideLinearSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const a = pickNonZero(-3, 3);
      const b = pickNonZero(-6, 6);
      const q2 = pickNonZero(-4, 4);
      const q1 = pickNonZero(-6, 6);
      const q0 = pickNonZero(-8, 8);

      const c3 = a * q2;
      const c2 = a * q1 + b * q2;
      const c1 = a * q0 + b * q1;
      const c0 = b * q0;
      if ([c3, c2, c1, c0].some((v) => v === 0)) continue;

      const dividend = formatPolynomialFromCoeffs([c3, c2, c1, c0]);
      const divisor = formatPolynomialFromCoeffs([a, b]);
      const quotient = formatPolynomialFromCoeffs([q2, q1, q0]);

      questions.push(`計算：\\((${dividend})\\div(${divisor})\\)`);
      answers.push(`\\((${dividend})\\div(${divisor})=${quotient}\\)`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildCubicDivideQuadraticSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const a = pickNonZero(-3, 3);
      const b = pickNonZero(-6, 6);
      const c = pickNonZero(-8, 8);
      const p = pickNonZero(-4, 4);
      const q = pickNonZero(-6, 6);

      const c3 = a * p;
      const c2 = a * q + b * p;
      const c1 = b * q + c * p;
      const c0 = c * q;
      if ([c3, c2, c1, c0].some((v) => v === 0)) continue;

      const dividend = formatPolynomialFromCoeffs([c3, c2, c1, c0]);
      const divisor = formatPolynomialFromCoeffs([a, b, c]);
      const quotient = formatPolynomialFromCoeffs([p, q]);

      questions.push(`計算：\\((${dividend})\\div(${divisor})\\)`);
      answers.push(`\\((${dividend})\\div(${divisor})=${quotient}\\)`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ321SqrtEstimateMixedSet(count) {
    function pickFrom(list) {
      return list[randInt(0, list.length - 1)];
    }
    function simplifySquareRoot(value) {
      let outside = 1;
      let inside = value;
      for (let k = 2; k * k <= inside; k += 1) {
        while (inside % (k * k) === 0) {
          outside *= k;
          inside /= k * k;
        }
      }
      return { outside, inside };
    }
    function buildEquivalentSqrtExprFromValue(value) {
      const simple = simplifySquareRoot(value);
      if (simple.outside === 1) return `\\sqrt{${value}}`;
      const useSimplified = randInt(0, 1) === 1;
      if (useSimplified) return `${simple.outside}\\sqrt{${simple.inside}}`;
      return `\\sqrt{${value}}`;
    }
    function buildIntervalTargetExpr(minRoot, maxRoot) {
      const n = randInt(minRoot, maxRoot);
      const delta = randInt(1, 2 * n);
      const value = n * n + delta;
      return {
        n,
        value,
        expr: buildEquivalentSqrtExprFromValue(value),
      };
    }

    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const templates = [
      'nearest-integer',
      'between-two-integers',
      'integer-part',
      'count-n-in-interval',
      'find-a-from-interval',
      'two-radicals-integer-part',
    ];

    for (let i = 0; i < count; i += 1) {
      const type = templates[i % templates.length];

      if (type === 'nearest-integer') {
        const { n, value, expr } = buildIntervalTargetExpr(8, 35);
        const x = value;
        const delta = x - n * n;
        const nearest = delta <= n ? n : n + 1;
        const wording = pickFrom([
          `哪一個整數最接近 \\(${expr}\\)？`,
          `在整數中，與 \\(${expr}\\) 距離最近的是哪一個？`,
          `估計 \\(${expr}\\) 最接近的整數。`,
        ]);
        questions.push(wording);
        answers.push(`\\(${nearest}\\)`);
        continue;
      }

      if (type === 'between-two-integers') {
        const { n, value, expr } = buildIntervalTargetExpr(8, 26);
        const wording = pickFrom([
          `\\(${expr}\\) 介於哪兩個連續整數之間？`,
          `判斷：\\(${expr}\\) 落在哪一段 \\(k<${expr}<k+1\\)（寫出兩個整數）。`,
          `請寫出滿足 \\(a<${expr}<b\\) 的連續整數 \\(a,b\\)。`,
        ]);
        questions.push(wording);
        answers.push(`\\(${n}\\) 和 \\(${n + 1}\\)`);
        continue;
      }

      if (type === 'integer-part') {
        const { n, value, expr } = buildIntervalTargetExpr(10, 30);
        const useVarStyle = randInt(0, 1) === 1;
        if (useVarStyle) {
          const varName = pickFrom(['a', 'b', 'k']);
          const wordingVar = pickFrom([
            `設 \\(${varName}\\) 為 \\(${expr}\\) 的整數部分，求 \\(${varName}\\)。`,
            `令 \\(${varName}=\\lfloor ${expr} \\rfloor\\)，求 \\(${varName}\\)。`,
          ]);
          questions.push(wordingVar);
          answers.push(`\\(${n}\\)`);
          continue;
        }
        const wording = pickFrom([
          `求 \\(${expr}\\) 的整數部分。`,
          `\\(${expr}\\) 的整數部分是多少？`,
          `若 \\(a<${expr}<a+1\\)，求 \\(a\\)。`,
        ]);
        questions.push(wording);
        answers.push(`\\(${n}\\)`);
        continue;
      }

      if (type === 'count-n-in-interval') {
        const a = randInt(6, 20);
        const b = randInt(a + 2, a + 7);
        const countN = b * b - a * a - 1;
        questions.push(`若 \\(${a}<\\sqrt{n}<${b}\\)，且 \\(n\\) 為正整數，符合條件的 \\(n\\) 有幾個？`);
        answers.push(`\\(${countN}\\)`);
        continue;
      }

      if (type === 'find-a-from-interval') {
        const { n, value, expr } = buildIntervalTargetExpr(7, 28);
        const a = n;
        const useVarStyle = randInt(0, 1) === 1;
        if (useVarStyle) {
          const varName = pickFrom(['a', 'm', 't']);
          const wordingVar = pickFrom([
            `設 \\(${varName}\\) 為 \\(${expr}\\) 的整數部分，求 \\(${varName}\\)。`,
            `若 \\(${varName}<${expr}<${varName}+1\\)，且 \\(${varName}\\) 為整數，求 \\(${varName}\\)。`,
          ]);
          questions.push(wordingVar);
          answers.push(`\\(${a}\\)`);
          continue;
        }
        const wording = pickFrom([
          `若 \\(a<${expr}<a+1\\)，且 \\(a\\) 為正整數，求 \\(a\\)。`,
          `已知 \\(${expr}\\) 介於兩個連續整數之間，寫出較小的那個整數 \\(a\\)。`,
        ]);
        questions.push(wording);
        answers.push(`\\(${a}\\)`);
        continue;
      }

      if (type === 'two-radicals-integer-part') {
        const left = buildIntervalTargetExpr(6, 16);
        const right = buildIntervalTargetExpr(7, 18);
        const leftVar = pickFrom(['a', 'm']);
        const rightVar = leftVar === 'a' ? 'b' : 'n';
        const rootValue = left.n + right.n + 1;
        const question = pickFrom([
          `設 \\(${leftVar}\\) 為 \\(${left.expr}\\) 的整數部分，\\(${rightVar}\\) 為 \\(${right.expr}\\) 的整數部分，求 \\(\\sqrt{${leftVar}+${rightVar}+1}\\)。`,
          `若 \\(${leftVar}=\\lfloor ${left.expr} \\rfloor\\)、\\(${rightVar}=\\lfloor ${right.expr} \\rfloor\\)，求 \\(\\sqrt{${leftVar}+${rightVar}+1}\\)。`,
        ]);
        questions.push(question);
        answers.push(`\\(${formatRadical(rootValue)}\\)`);
        continue;
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildRadicalMulDivSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const a = pickNonSquare(2, 18);
        const b = pickNonSquare(2, 18);
        questions.push(`計算：\\(\\sqrt{${a}}\\cdot\\sqrt{${b}}\\)。`);
        answers.push(`\\(\\sqrt{${a}}\\cdot\\sqrt{${b}}=${formatRadical(a * b)}\\)。`);
      } else {
        let m = pickNonSquare(2, 18);
        let n = pickNonSquare(2, 18);
        while (isPerfectSquare(m * n)) {
          m = pickNonSquare(2, 18);
          n = pickNonSquare(2, 18);
        }
        questions.push(`計算：\\(\\frac{\\sqrt{${m * n}}}{\\sqrt{${n}}}\\)。`);
        answers.push(`\\(\\frac{\\sqrt{${m * n}}}{\\sqrt{${n}}}=${formatRadical(m)}\\)。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildRadicalAddLikeTermsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const k = pickNonSquare(2, 20);
      const c1 = pickNonZero(-8, 8);
      const c2 = pickNonZero(-8, 8);
      const leftTerm = formatScaledRadical(c1, k);
      const rightTerm = formatScaledRadical(Math.abs(c2), k);
      questions.push(`化簡：\\(${leftTerm} ${c2 >= 0 ? '+' : '-'} ${rightTerm}\\)。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${formatScaledRadical(c1 + c2, k)}\\)`,
        `\\(${leftTerm} ${c2 >= 0 ? '+' : '-'} ${rightTerm}=${formatScaledRadical(c1 + c2, k)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildSimplestRadicalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const out = randInt(2, 9);
      const inside = randInt(2, 12);
      const n = out * out * inside;
      questions.push(`化為最簡根式：\\(\\sqrt{${n}}\\)。`);
      answers.push(`\\(\\sqrt{${n}}=${out}\\sqrt{${inside}}\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildRationalizeMonomialSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = pickNonSquare(2, 30);
      questions.push(`有理化分母：\\(\\frac{1}{\\sqrt{${a}}}\\)。`);
      const simp = simplifyRadical(a);
      if (simp.outside === 1) {
        answers.push(`\\(\\frac{1}{\\sqrt{${a}}}=\\frac{\\sqrt{${a}}}{${a}}\\)。`);
      } else {
        // 1/(k√n) = √n/(kn), ensure denominator rationalized and radical simplified.
        const den = simp.outside * simp.inside;
        answers.push(
          `\\(\\frac{1}{\\sqrt{${a}}}=\\frac{1}{${simp.outside}\\sqrt{${simp.inside}}}=\\frac{\\sqrt{${simp.inside}}}{${den}}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildRationalizeBinomialSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 9);
      let b = pickNonSquare(2, 30);
      while (b === a * a) b = pickNonSquare(2, 30);
      questions.push(`有理化分母：\\(\\frac{1}{${a}+\\sqrt{${b}}}\\)。`);
      answers.push(
        `\\(\\frac{1}{${a}+\\sqrt{${b}}}=\\frac{${a}-\\sqrt{${b}}}{(${a}+\\sqrt{${b}})(${a}-\\sqrt{${b}})}=\\frac{${a}-\\sqrt{${b}}}{${a * a - b}}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x || 1;
  }

  function simplifyFraction(num, den) {
    if (den < 0) return simplifyFraction(-num, -den);
    const g = gcd(num, den);
    return { num: num / g, den: den / g };
  }

  function makeFraction(num, den = 1) {
    const simplified = simplifyFraction(num, den);
    return { num: simplified.num, den: simplified.den };
  }

  function addFraction(a, b) {
    return makeFraction(a.num * b.den + b.num * a.den, a.den * b.den);
  }

  function subFraction(a, b) {
    return makeFraction(a.num * b.den - b.num * a.den, a.den * b.den);
  }

  function mulFraction(a, b) {
    return makeFraction(a.num * b.num, a.den * b.den);
  }

  function fractionToLatex(frac, mixed = false) {
    const value = makeFraction(frac.num, frac.den);
    if (value.den === 1) return `${value.num}`;
    if (!mixed) return `\\frac{${value.num}}{${value.den}}`;
    const negative = value.num < 0;
    const absNum = Math.abs(value.num);
    const whole = Math.floor(absNum / value.den);
    const rem = absNum % value.den;
    if (rem === 0) return `${value.num / value.den}`;
    if (whole === 0) return `${negative ? '-' : ''}\\frac{${rem}}{${value.den}}`;
    return `${negative ? '-' : ''}${whole}\\frac{${rem}}{${value.den}}`;
  }

  function buildJ323TripleExpandSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [7, 24, 25],
      [8, 15, 17],
    ];
    for (let i = 0; i < count; i += 1) {
      const type = i % 3;
      if (type === 0) {
        const base = triples[randInt(0, triples.length - 1)];
        const factors = [2, 3, 4, 5, 10];
        const k = factors[randInt(0, factors.length - 1)];
        const a = base[0] * k;
        const b = base[1] * k;
        const c = base[2] * k;
        questions.push(`已知一直角三角形兩股為 \\(${a},${b}\\)，求斜邊長。`);
        answers.push(`\\(${c}\\)`);
        continue;
      }
      if (type === 1) {
        const insides = [2, 3, 5, 6, 7, 10];
        const others = [1, 2, 3];
        const inside = insides[randInt(0, insides.length - 1)];
        const other = others[randInt(0, others.length - 1)];
        const mode = randInt(0, 1);
        if (mode === 0) {
          questions.push(`直角三角形兩股為 \\(${other}\\) 與 \\(\\sqrt{${inside}}\\)，求斜邊。`);
          answers.push(`\\(${formatRadical(other * other + inside)}\\)`);
        } else {
          const c = randInt(4, 10);
          questions.push(`直角三角形一股為 \\(${other}\\)、斜邊為 \\(${c}\\)，求另一股。`);
          answers.push(`\\(${formatRadical(c * c - other * other)}\\)`);
        }
        continue;
      }
      const a = randInt(3, 16);
      const b = randInt(a + 1, a + 10);
      const bIsHypotenuse = randInt(0, 1) === 0;
      const wording = bIsHypotenuse
        ? `兩邊長為 \\(${a}\\)、\\(${b}\\)。若 \\(${b}\\) 是斜邊，求另一邊。`
        : `兩邊長為 \\(${a}\\)、\\(${b}\\)。若 \\(${b}\\) 不是斜邊，求斜邊。`;
      questions.push(wording);
      answers.push(bIsHypotenuse ? `\\(${formatRadical(b * b - a * a)}\\)` : `\\(${formatRadical(a * a + b * b)}\\)`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ323HypotenuseAltitudeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const type = i % 2;
      if (type === 0) {
        const a = randInt(3, 15);
       const b = randInt(4, 16);
       const c2 = a * a + b * b;
       const c = `\\sqrt{${c2}}`;
        const h = formatRationalizedRadicalFraction(a * b, c2);
       questions.push(`直角三角形兩股為 \\(${a},${b}\\)。求斜邊上的高 \\(h\\)。`);
       pushAnswerWithManualSummary(
         answers,
         summaryAnswers,
         `\\(h=${h}\\)`,
          `斜邊 \\(c=${c}\\)，由面積相等 \\(\\dfrac{1}{2}ab=\\dfrac{1}{2}ch\\)，可得 \\(h=\\dfrac{${a * b}}{${formatRadical(c2)}}\\)，再將分母有理化。`
       );
       continue;
     }
      const triples = [
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17],
        [7, 24, 25],
      ];
      const [legA, legB, baseHypotenuse] = triples[randInt(0, triples.length - 1)];
      const scale = randInt(1, 4);
      const area = (legA * legB * scale * scale) / 2;
      const c = baseHypotenuse * scale;
     const h = formatFraction(2 * area, c);
      questions.push(`已知直角三角形面積為 \\(${area}\\)，斜邊長 \\(${c}\\)，求斜邊上的高。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(h=${h}\\)`,
        `由 \\(\\dfrac{1}{2}ch=${area}\\)，得 \\(h=\\dfrac{2\\times${area}}{${c}}=${h}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ323CoordinateDistanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const type = i % 3;
      if (type === 0) {
        const x1 = randInt(-8, 8),
          y1 = randInt(-8, 8);
       const x2 = randInt(-8, 8),
         y2 = randInt(-8, 8);
        if (x1 === x2 && y1 === y2) {
          i -= 1;
          continue;
        }
       const distSq = (x1 - x2) ** 2 + (y1 - y2) ** 2;
        questions.push(`平面上兩點 \\(A(${x1},${y1}),B(${x2},${y2})\\) 的距離為何？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${formatRadical(distSq)}\\)`,
          `兩點距離為 \\(\\sqrt{(${x1 - x2})^2+(${y1 - y2})^2}=\\sqrt{${distSq}}=${formatRadical(distSq)}\\)。`
        );
        continue;
      }
      if (type === 1) {
        const x = randInt(-15, 15),
          y = randInt(-15, 15);
        const distSq = x * x + y * y;
        questions.push(`點 \\(P(${x},${y})\\) 到原點距離為何？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${formatRadical(distSq)}\\)`,
          `到原點距離為 \\(\\sqrt{(${x})^2+(${y})^2}=\\sqrt{${distSq}}=${formatRadical(distSq)}\\)。`
        );
        continue;
      }
      const y = randInt(-8, 8);
      const d = randInt(5, 20);
      const xAbs2 = d * d - y * y;
      if (xAbs2 <= 0) {
        i -= 1;
        continue;
      }
      questions.push(`點 \\(A(k,${y})\\) 到原點距離為 \\(${d}\\)，求 \\(k\\) 的可能值。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(k=\\pm${formatRadical(xAbs2)}\\)`,
        `由 \\(k^2+(${y})^2=${d}^2\\)，得 \\(k^2=${xAbs2}\\)，所以 \\(k=\\pm${formatRadical(xAbs2)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ323SpatialDiagonalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const type = i % 3;
      if (type === 0) {
       const a = randInt(2, 12),
         b = randInt(2, 12),
         c = randInt(2, 12);
       questions.push(`長方體長寬高為 \\(${a},${b},${c}\\)，求體對角線。`);
        const diagonal = formatRadical(a * a + b * b + c * c);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${diagonal}\\)`,
          `體對角線平方為 \\(${a}^2+${b}^2+${c}^2=${a * a + b * b + c * c}\\)。`
        );
       continue;
      }
      if (type === 1) {
       const a = randInt(2, 20);
       questions.push(`正方體邊長為 \\(${a}\\)，求體對角線。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${a}\\sqrt{3}\\)`,
          `體對角線平方為三條互相垂直的邊長平方和，即 \\(3\\times${a}^2\\)。`
        );
       continue;
     }
     const h = randInt(4, 18),
       c = randInt(6, 20);
      const path = formatHalfScaledRadical(1, 4 * h * h + c * c);
      questions.push(`圓柱高為 \\(${h}\\)，底面周長為 \\(${c}\\)。側面展開成長方形後，從上底圓周上一點到下底圓周正對點的最短路徑長為何？`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${path}\\)`,
        `展開圖中兩點的水平距離為半個周長 \\(\\dfrac{${c}}{2}\\)，垂直距離為高 \\(${h}\\)，以畢氏定理求對角線。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ321ExactSquareRootSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const type = i % 4;
      if (type === 0) {
        const n = randInt(2, 25);
        questions.push(`求 $\\sqrt{${n * n}}$ 的值。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${n}$`,
          `因為 $${n * n}=${n}^2$，所以 $\\sqrt{${n * n}}=${n}$。`
        );
        continue;
      }
      if (type === 1) {
        const n = randInt(1, 9);
        const value = (n / 10) * (n / 10);
        const root = formatDecimalValue(n / 10);
        questions.push(`求 $\\sqrt{${formatDecimalValue(value)}}$ 的值。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${root}$`,
          `因為 $${formatDecimalValue(value)}=(${root})^2$，所以 $\\sqrt{${formatDecimalValue(value)}}=${root}$。`
        );
        continue;
      }
      if (type === 2) {
        const num = randInt(1, 9);
        const den = randInt(2, 9);
        const root = formatFraction(num, den);
        questions.push(`求 $\\sqrt{\\frac{${num * num}}{${den * den}}}$ 的值。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${root}$`,
          `$\\sqrt{\\frac{${num * num}}{${den * den}}}=${root}$。`
        );
        continue;
      }
      const n = randInt(2, 12);
      questions.push(`求 $\\sqrt{(${-n})^2}$ 的值。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${n}$`,
        `因為算術平方根表示非負值，所以 $\\sqrt{(${-n})^2}=|${-n}|=${n}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ321SquareRootCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const type = i % 4;
      if (type === 0) {
        const m = randInt(3, 12);
        const n = randInt(m * m - (m - 1), m * m + (m - 1));
        if (n === m * m) {
          i -= 1;
          continue;
        }
        const sign = n > m * m ? '>' : '<';
        questions.push(`比較 $\\sqrt{${n}}$ 和 ${m} 的大小。`);
        answers.push(`因為 ${m}^2=${m * m}，且 ${n}${sign}${m * m}，所以 $\\sqrt{${n}}${sign}${m}$。`);
        continue;
      }
      if (type === 1) {
        const d = randInt(15, 90) / 10;
        const d2 = Number((d * d).toFixed(2));
        const n = randInt(Math.max(2, Math.floor(d2) - 3), Math.floor(d2) + 3);
        if (n === d2) {
          i -= 1;
          continue;
        }
        const sign = n > d2 ? '>' : '<';
        questions.push(`比較 $\\sqrt{${n}}$ 和 ${formatDecimalValue(d)} 的大小。`);
        answers.push(
          `因為 ${formatDecimalValue(d)}^2=${formatDecimalValue(d2)}，且 ${n}${sign}${formatDecimalValue(d2)}，所以 $\\sqrt{${n}}${sign}${formatDecimalValue(d)}$。`
        );
        continue;
      }
      if (type === 2) {
        const a = pickNonSquare(2, 60);
        let b = pickNonSquare(2, 60);
        while (a === b) b = pickNonSquare(2, 60);
        const sign = a > b ? '>' : '<';
        questions.push(`比較 $\\sqrt{${a}}$ 和 $\\sqrt{${b}}$ 的大小。`);
        answers.push(`因為被開方數 ${a}${sign}${b}，所以 $\\sqrt{${a}}${sign}\\sqrt{${b}}$。`);
        continue;
      }
      const k = randInt(2, 5);
      const a = pickNonSquare(2, 20);
      const b = pickNonSquare(2, 20);
      const left = a;
      const right = k * k * b;
      const sign = left > right ? '>' : '<';
      questions.push(`比較 $\\sqrt{${a}}$ 和 $${k}\\sqrt{${b}}$ 的大小。`);
      answers.push(`因為兩邊都大於 0，可比較平方：${a} ${sign} ${right}，所以 $\\sqrt{${a}}${sign}${k}\\sqrt{${b}}$。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ322RadicalFormulaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const type = i % 4;
      if (type === 0) {
        const a = pickNonSquare(5, 30);
        let b = pickNonSquare(2, a - 1);
        while (a === b) b = pickNonSquare(2, a - 1);
        questions.push(`計算 $(\\sqrt{${a}}+\\sqrt{${b}})(\\sqrt{${a}}-\\sqrt{${b}})$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${a - b}$`,
          `利用平方差公式，得 $(\\sqrt{${a}}+\\sqrt{${b}})(\\sqrt{${a}}-\\sqrt{${b}})=${a}-${b}=${a - b}$。`
        );
        continue;
      }
      if (type === 1) {
        const a = pickNonSquare(2, 20);
        let b = pickNonSquare(2, 20);
        while (a === b) b = pickNonSquare(2, 20);
        questions.push(`計算 $(\\sqrt{${a}}+\\sqrt{${b}})^2$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${a + b}+${formatScaledRadical(2, a * b)}$`,
          `$(\\sqrt{${a}}+\\sqrt{${b}})^2=${a}+2\\sqrt{${a * b}}+${b}=${a + b}+${formatScaledRadical(2, a * b)}$。`
        );
        continue;
      }
      if (type === 2) {
        const a = pickNonSquare(3, 18);
        let b = pickNonSquare(2, 18);
        while (a === b) b = pickNonSquare(2, 18);
        questions.push(`計算 $(\\sqrt{${a}}-\\sqrt{${b}})^2$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${a + b}-${formatScaledRadical(2, a * b)}$`,
          `$(\\sqrt{${a}}-\\sqrt{${b}})^2=${a}-2\\sqrt{${a * b}}+${b}=${a + b}-${formatScaledRadical(2, a * b)}$。`
        );
        continue;
      }
      const p = randInt(2, 5);
      const q = randInt(2, 5);
      const a = pickNonSquare(2, 12);
      let b = pickNonSquare(2, 12);
      while (a === b) b = pickNonSquare(2, 12);
      questions.push(`計算 $(${p}\\sqrt{${a}}+${q}\\sqrt{${b}})(${p}\\sqrt{${a}}-${q}\\sqrt{${b}})$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${p * p * a - q * q * b}$`,
        `利用平方差公式，得 $(${p}\\sqrt{${a}})^2-(${q}\\sqrt{${b}})^2=${p * p * a}-${q * q * b}=${p * p * a - q * q * b}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ322RadicalMixedSimplifySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const type = i % 4;
      if (type === 0) {
        const k = pickNonSquare(2, 12);
        const a = randInt(2, 5);
        const b = randInt(2, 5);
        const c = randInt(1, 4);
        const left = a * a * k;
        const right = b * b * k;
        questions.push(`化簡 $\\sqrt{${left}}+\\sqrt{${right}}-${formatScaledRadical(c, k)}$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${formatScaledRadical(a + b - c, k)}$`,
          `$\\sqrt{${left}}+\\sqrt{${right}}-${formatScaledRadical(c, k)}=${formatScaledRadical(a, k)}+${formatScaledRadical(b, k)}-${formatScaledRadical(c, k)}=${formatScaledRadical(a + b - c, k)}$。`
        );
        continue;
      }
      if (type === 1) {
        const a = pickNonSquare(2, 12);
        const b = pickNonSquare(2, 12);
        const c = randInt(2, 5);
        questions.push(`化簡 $\\sqrt{${a}}\\times\\sqrt{${b * c * c}}+\\sqrt{${a * b}}$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${formatScaledRadical(c + 1, a * b)}$`,
          `$\\sqrt{${a}}\\times\\sqrt{${b * c * c}}=\\sqrt{${a * b * c * c}}=${formatScaledRadical(c, a * b)}$，所以原式$=${formatScaledRadical(c + 1, a * b)}$。`
        );
        continue;
      }
      if (type === 2) {
        const a = pickNonSquare(2, 12);
        const b = randInt(2, 6);
        const c = randInt(2, 5);
        questions.push(`化簡 $\\frac{\\sqrt{${a * b}}}{\\sqrt{${b}}}+${c}\\sqrt{${a}}$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${formatScaledRadical(c + 1, a)}$`,
          `$\\frac{\\sqrt{${a * b}}}{\\sqrt{${b}}}=\\sqrt{${a}}$，所以原式$=(1+${c})\\sqrt{${a}}=${formatScaledRadical(c + 1, a)}$。`
        );
        continue;
      }
      const a = pickNonSquare(2, 10);
      let b = pickNonSquare(2, 10);
      while (a === b) b = pickNonSquare(2, 10);
      questions.push(`化簡 $(\\sqrt{${a}}+\\sqrt{${b}})(\\sqrt{${a}}-\\sqrt{${b}})+\\sqrt{${4 * b}}$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${a - b}+${formatScaledRadical(2, b)}$`,
        `前半部為 $${a - b}$，且 $\\sqrt{${4 * b}}=${formatScaledRadical(2, b)}$，所以原式$=${a - b}+${formatScaledRadical(2, b)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ323PythagoreanContextSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const type = i % 4;
      if (type === 0) {
        const a = randInt(3, 12);
        const b = randInt(4, 15);
        const diagonal = formatRadical(a * a + b * b);
        questions.push(`一個長方形的長為 $${a}$，寬為 $${b}$，求對角線長。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${diagonal}$`,
          `由畢氏定理，對角線長為 $\\sqrt{${a * a}+${b * b}}=${diagonal}$。`
        );
        continue;
      }
      if (type === 1) {
        const h = randInt(6, 15);
        const base = randInt(3, 10);
        const ladder = formatRadical(h * h + base * base);
        questions.push(`一把梯子靠在牆上，梯腳離牆 $${base}$ 公尺，梯頂離地 $${h}$ 公尺，求梯長。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${ladder}$ 公尺`,
          `梯子、牆與地面形成直角三角形，所以梯長為 $\\sqrt{${base * base}+${h * h}}=${ladder}$。`
        );
        continue;
      }
      if (type === 2) {
        const side = randInt(3, 12);
        const diagonal = `${side}\\sqrt{2}`;
        questions.push(`一個正方形的邊長為 $${side}$，求對角線長。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${diagonal}$`,
          `正方形對角線是直角三角形斜邊，所以長為 $\\sqrt{${side * side}+${side * side}}=${diagonal}$。`
        );
        continue;
      }
      const side = randInt(4, 12);
      const halfSide = side % 2 === 0 ? `${side / 2}` : `\\frac{${side}}{2}`;
      const height = side % 2 === 0 ? `${side / 2}\\sqrt{3}` : `\\frac{${side}\\sqrt{3}}{2}`;
      questions.push(`一個正三角形的邊長為 $${side}$，求高。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${height}$`,
        `高會把底邊平分成 $${halfSide}$ 和 $${halfSide}$，所以高為 $\\sqrt{${side * side}-\\left(\\frac{${side}}{2}\\right)^2}=${height}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ323RightTriangleJudgementSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [8, 15, 17],
      [7, 24, 25],
    ];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const base = triples[randInt(0, triples.length - 1)];
        const k = [1, 2, 3, 4][randInt(0, 3)];
        const [a, b, c] = base.map((v) => v * k);
        questions.push(`判斷邊長為 ${a}、${b}、${c} 的三角形是否為直角三角形。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          '是直角三角形',
          `因為 ${a}^2+${b}^2=${a * a + b * b}，且 ${c}^2=${c * c}，兩者相等，所以是直角三角形。`
        );
        continue;
      }
      const a = randInt(3, 12);
      const b = randInt(4, 12);
      let c = randInt(Math.max(a, b) + 1, Math.max(a, b) + 8);
      while (a * a + b * b === c * c) c = randInt(Math.max(a, b) + 1, Math.max(a, b) + 8);
      questions.push(`判斷邊長為 ${a}、${b}、${c} 的三角形是否為直角三角形。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        '不是直角三角形',
        `因為 ${a}^2+${b}^2=${a * a + b * b}，但 ${c}^2=${c * c}，兩者不相等，所以不是直角三角形。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ331CommonFactorBasicSet(count) {
    function formatMonomial(coeff, power) {
      if (power === 0) return `${coeff}`;
      if (power === 1) return formatCoeffTerm(coeff, 'x', 1);
      return formatCoeffTerm(coeff, 'x', power);
    }
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const xPow = randInt(1, 4);
      const common = pickNonZero(2, 6);
      const a = pickNonZero(1, 9);
      const b = pickNonZero(1, 9);
      const extraPow = randInt(1, 3);
      const leftCoef = common * a;
      const rightCoef = common * b;
      const factorCoeff = gcdInt(leftCoef, rightCoef);
      const termA = formatMonomial(leftCoef, xPow + extraPow);
      const termB = formatMonomial(rightCoef, xPow);
      questions.push(`提取公因式：\\(${termA}${b > 0 ? '+' : ''}${termB}\\)`);
      const innerA = formatMonomial(leftCoef / factorCoeff, extraPow);
      const innerB = `${rightCoef / factorCoeff}`;
      const outer = xPow === 1 ? `${factorCoeff}x` : `${factorCoeff}x^${xPow}`;
      const result = `${outer}(${innerA}${b > 0 ? '+' : ''}${innerB})`;
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${result}\\)`,
        `\\(${termA}${b > 0 ? '+' : ''}${termB}= ${result}\\)`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ331PolynomialFactorSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const p = randInt(2, 12);
        const result = `(x-${p})(x+${p - 1})`;
        questions.push(`提取公因式：\\((x+${p})(x-${p})-(x-${p})\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\((x+${p})(x-${p})-(x-${p})=${result}\\)`
        );
        continue;
      }
      if (mode === 1) {
        const a = randInt(2, 8);
        const b = randInt(1, 8);
        const inner = formatCoeffTerm(a - 1, 'x');
        const result = formatCoeffTerm(a - 1, 'x', 2);
        questions.push(`提取公因式：\\(x(${a}x+${b})-x(x+${b})\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\(x(${a}x+${b})-x(x+${b})=x\\big[(${a}x+${b})-(x+${b})\\big]=x(${inner})=${result}\\)`
        );
        continue;
      }
      if (mode === 2) {
        const p = randInt(2, 12);
        const result = `(${p}x-1)(${2 * p}x-1)`;
        questions.push(`提取公因式：\\(2(${p}x-1)^2+(${p}x-1)\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\(2(${p}x-1)^2+(${p}x-1)=(${p}x-1)\\big(2(${p}x-1)+1\\big)=${result}\\)`
        );
        continue;
      }
      if (mode === 3) {
        const p = randInt(2, 12);
        const result = `(3x-${p})(3x-${p + 1})`;
        questions.push(`提取公因式：\\((3x-${p})^2-(3x-${p})\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\((3x-${p})^2-(3x-${p})=${result}\\)`
        );
        continue;
      }
      const result = '2(2x-1)(5x-4)';
      questions.push(`提取公因式：\\(5(2x-1)^2-3(2x-1)\\)`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${result}\\)`,
        `\\(5(2x-1)^2-3(2x-1)=(2x-1)(10x-8)=${result}\\)`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ331SignTransformSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const a = randInt(2, 6);
        const b = randInt(2, 6);
        const c = randInt(2, 7);
        const result = `${a + c}(x-${b}y)`;
        questions.push(`因式分解：\\(${a}(x-${b}y)-${c}(${b}y-x)\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\(${a}(x-${b}y)-${c}(${b}y-x)=${result}\\)`
        );
        continue;
      }
      if (mode === 1) {
        const p = randInt(2, 6);
        const q = randInt(2, 6);
        const r = randInt(2, 6);
        const result = `(x-${q})(${formatPolynomialFromCoeffs([2, p - r])})`;
        questions.push(`因式分解：\\((x+${p})(x-${q})-(x-${r})(${q}-x)\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\((x+${p})(x-${q})-(x-${r})(${q}-x)=(x+${p})(x-${q})+(x-${r})(x-${q})=${result}\\)`
        );
        continue;
      }
      const A = randInt(3, 7);
      const C = randInt(2, 6);
      const result = `(a-b)(${A + 1}b-a+${C})`;
      questions.push(`因式分解：\\(${A}b(a-b)-(b-a)^2+${C}(a-b)\\)`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${result}\\)`,
        `因為 \\((b-a)^2=(a-b)^2\\)，所以可提出 \\(a-b\\)，得 \\(${result}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ331GroupingFactorSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const k = randInt(2, 8);
        const t = randInt(2, 9);
        const result = `(x-${k})(x+${t})`;
        questions.push(`分組分解：\\(x^2-${k}x+${t}x-${t * k}\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\(x^2-${k}x+${t}x-${t * k}=${result}\\)`
        );
        continue;
      }
      if (mode === 1) {
        const p = randInt(2, 6);
        const q = randInt(2, 6);
        const result = `(x+1)(${p}x^2+${q})`;
        questions.push(`分組分解：\\(${p}x^3+${p}x^2+${q}x+${q}\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\(${p}x^3+${p}x^2+${q}x+${q}=${result}\\)`
        );
        continue;
      }
      if (mode === 2) {
        const p = randInt(2, 8);
        const q = [2, 4, 6, 8][randInt(0, 3)];
        const qHalf = q / 2;
        const result = `(x+${qHalf})(2y+${p})`;
        questions.push(`分組分解：\\(2xy+${p}x+${q}y+${p * qHalf}\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\(2xy+${p}x+${q}y+${p * qHalf}=${result}\\)`
        );
        continue;
      }
      if (mode === 3) {
        const a = randInt(1, 5),
          b = randInt(1, 5),
          c = randInt(1, 5);
        const ax = formatCoeffTerm(a, 'x', 1);
        const bx = formatCoeffTerm(b, 'x', 1);
        const cx = formatCoeffTerm(c, 'x', 1);
        const ay = formatCoeffTerm(a, 'y', 1);
        const by = formatCoeffTerm(b, 'y', 1);
        const cy = formatCoeffTerm(c, 'y', 1);
        const result = `${a + b + c}(x+y)`;
        questions.push(`分組分解：\\(${ax}+${bx}+${cx}+${ay}+${by}+${cy}\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\(${ax}+${bx}+${cx}+${ay}+${by}+${cy}=${result}\\)`
        );
        continue;
      }
      const k = randInt(2, 5);
      const result = `(${k}x-y)(a-b+c)`;
      questions.push(`分組分解：\\(${k}ax+by+${k}cx-ay-${k}bx-cy\\)`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${result}\\)`,
        `\\(${k}ax+by+${k}cx-ay-${k}bx-cy=${result}\\)`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ331ExpandThenGroupSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const p = randInt(2, 8);
        const r = randInt(2, 9);
        const result = `(${p}a+1)(b-${r})`;
        questions.push(`先去括號再分組：\\(${p}(ab-${r}a)-(${r}-b)\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\(${p}(ab-${r}a)-(${r}-b)=${result}\\)`
        );
        continue;
      }
      if (mode === 1) {
        const s = randInt(2, 12);
        const result = `(x+${s})(a-x)`;
        questions.push(`先去括號再分組：\\((a-${s})x-(x^2-${s}a)\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\((a-${s})x-(x^2-${s}a)=${result}\\)`
        );
        continue;
      }
      if (mode === 2) {
        const t = randInt(2, 12);
        const result = `(x-a)(a+${t})`;
        questions.push(`先去括號再分組：\\((x-${t})a-(a^2-${t}x)\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\((x-${t})a-(a^2-${t}x)=${result}\\)`
        );
        continue;
      }
      if (mode === 3) {
        const t = randInt(2, 12);
        const result = `(x-${t})(x+a)`;
        questions.push(`先去括號再分組：\\(x^2-(${t}-a)x-${t}a\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\(x^2-(${t}-a)x-${t}a=${result}\\)`
        );
        continue;
      }
      const z = randInt(2, 10);
      const result = `(y+${z}x)(x+${z}y)`;
      questions.push(`先去括號再分組：\\(xy(1+${z}^2)+${z}(x^2+y^2)\\)`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${result}\\)`,
        `\\(xy(1+${z}^2)+${z}(x^2+y^2)=${result}\\)`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ331CoreFactoringMixedSet(count) {
    const banks = [buildJ331CommonFactorBasicSet, buildJ331PolynomialFactorSet, buildJ331SignTransformSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const fn = banks[i % banks.length];
      const one = fn(1);
      questions.push(one.questions[0]);
      pushAnswerWithManualSummary(answers, summaryAnswers, one.summaryAnswers[0], one.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ331GroupingAdvancedMixedSet(count) {
    const banks = [buildJ331GroupingFactorSet, buildJ331ExpandThenGroupSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const fn = banks[i % banks.length];
      const one = fn(1);
      questions.push(one.questions[0]);
      pushAnswerWithManualSummary(answers, summaryAnswers, one.summaryAnswers[0], one.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ331BinomialCommonFactorSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const p = randInt(2, 6);
        const q = randInt(2, 9);
        const result = `(x-${p})(x^2-${q})`;
        questions.push(`因式分解 \\(x^2(x-${p})-${q}(x-${p})\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `先提公因式 \\((x-${p})\\)，得 \\(${result}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const a = randInt(2, 6);
        const b = randInt(2, 6);
        const c = randInt(2, 6);
        const result = `(x+${b})(${a}x+${c})`;
        questions.push(`因式分解 \\(${a}x(x+${b})+${c}(x+${b})\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `先提公因式 \\((x+${b})\\)，得 \\(${result}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const a = randInt(2, 7);
        const b = randInt(1, a - 1);
        const result = `(x-y)(a+${b})(a-${b})`;
        questions.push(`因式分解 \\(a^2(x-y)-${b * b}(x-y)\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `先提公因式 \\((x-y)\\)，得 \\((x-y)(a^2-${b * b})=${result}\\)。`
        );
        continue;
      }
      const p = randInt(1, 6);
      const result = `(x+${p}-2)^2`;
      questions.push(`因式分解 \\((x+${p})^2-4(x+${p})+4\\)。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${result}\\)`,
        `視 \\((x+${p})\\) 為同一整體，得 \\((x+${p})^2-4(x+${p})+4=${result}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ332DiffSquaresSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 10);
      const b = randInt(1, 10);
      const useVar = randInt(0, 1) === 1;
      const ax = formatCoeffTerm(a, 'x', 1);
      const by = formatCoeffTerm(b, 'y', 1);
      if (useVar) {
        const lead = a * a === 1 ? 'x^2' : `${a * a}x^2`;
        const result = `(${ax}+${b})(${ax}-${b})`;
        questions.push(`因式分解：\\(${lead}-${b * b}\\)`);
        pushAnswerWithManualSummary(answers, summaryAnswers, `\\(${result}\\)`, `\\(${lead}-${b * b}=${result}\\)`);
      } else {
        const result = `(${a}+${by})(${a}-${by})`;
        questions.push(`因式分解：\\(${a * a}-${b * b}y^2\\)`);
        pushAnswerWithManualSummary(answers, summaryAnswers, `\\(${result}\\)`, `\\(${a * a}-${b * b}y^2=${result}\\)`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ332CubeFormulaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const a = randInt(2, 8);
        const result = `(x-${a})(x^2+${a}x+${a ** 2})`;
        questions.push(`因式分解 \\(x^3-${a ** 3}\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `利用立方差公式，得 \\(x^3-${a ** 3}=${result}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const a = randInt(2, 8);
        const result = `(x+${a})(x^2-${a}x+${a ** 2})`;
        questions.push(`因式分解 \\(x^3+${a ** 3}\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `利用立方和公式，得 \\(x^3+${a ** 3}=${result}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const a = randInt(2, 4);
        const b = randInt(2, 5);
        const sign = randInt(0, 1) === 0 ? '-' : '+';
        questions.push(`因式分解 \\(${a ** 3}x^3${sign}${b ** 3}y^3\\)。`);
        if (sign === '-') {
          const result = `(${a}x-${b}y)(${a ** 2}x^2+${a * b}xy+${b ** 2}y^2)`;
          pushAnswerWithManualSummary(
            answers,
            summaryAnswers,
            `\\(${result}\\)`,
            `\\(${a ** 3}x^3-${b ** 3}y^3=${result}\\)。`
          );
        } else {
          const result = `(${a}x+${b}y)(${a ** 2}x^2-${a * b}xy+${b ** 2}y^2)`;
          pushAnswerWithManualSummary(
            answers,
            summaryAnswers,
            `\\(${result}\\)`,
            `\\(${a ** 3}x^3+${b ** 3}y^3=${result}\\)。`
          );
        }
        continue;
      }
      const p = randInt(2, 6);
      const sign = randInt(0, 1) === 0 ? '+' : '-';
      const mid = sign === '+' ? 3 * p : -3 * p;
      const lastMid = sign === '+' ? 3 * p * p : 3 * p * p;
      const last = sign === '+' ? p ** 3 : -(p ** 3);
      const result = `(x${sign}${p})^3`;
      questions.push(`因式分解 \\(x^3${mid >= 0 ? '+' : ''}${mid}x^2+${lastMid}x${last >= 0 ? '+' : ''}${last}\\)。`);
      pushAnswerWithManualSummary(answers, summaryAnswers, `\\(${result}\\)`, `這是完全立方公式，得 \\(${result}\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ332HigherPowerDiffSquaresSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const a = randInt(2, 12);
        const result = `(x-${a})(x+${a})(x^2+${a ** 2})`;
        questions.push(`因式分解 \\(x^4-${a ** 4}\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `先用平方差，得 \\(x^4-${a ** 4}=(x^2-${a ** 2})(x^2+${a ** 2})=${result}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const a = randInt(2, 8);
        const result = `(x-${a})(x^2+${a}x+${a ** 2})(x+${a})(x^2-${a}x+${a ** 2})`;
        questions.push(`因式分解 \\(x^6-${a ** 6}\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `先視為平方差，得 \\((x^3-${a ** 3})(x^3+${a ** 3})=${result}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const a = pickNonSquare(2, 14);
        const result = `(x^2-${a}y^2)(x^2+${a}y^2)`;
        questions.push(`因式分解 \\(x^4-${a ** 2}y^4\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `先用平方差，得 \\(x^4-${a ** 2}y^4=${result}\\)。`
        );
        continue;
      }
      const a = randInt(2, 13);
      const result = `(${a}x^2-1)(${a}x^2+1)`;
      questions.push(`因式分解 \\(${a ** 2}x^4-1\\)。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${result}\\)`,
        `先用平方差，得 \\(${a ** 2}x^4-1=${result}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ332PerfectSquareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 6);
      const b = randInt(1, 9);
      const sign = randInt(0, 1) === 0 ? '+' : '-';
      const mid = sign === '+' ? 2 * a * b : -2 * a * b;
      const ax = formatCoeffTerm(a, 'x', 1);
      const result = `(${ax}${sign}${b})^2`;
      const polynomial = formatPolynomialFromCoeffs([a * a, mid, b * b]);
      questions.push(`因式分解：\\(${polynomial}\\)`);
      pushAnswerWithManualSummary(answers, summaryAnswers, `\\(${result}\\)`, `\\(${polynomial}=${result}\\)`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ332CompositeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const k = pickNonZero(2, 8);
      const a = randInt(1, 6);
      const b = randInt(1, 8);
      const mode = i % 2;
      const ax = formatCoeffTerm(a, 'x', 1);
      const by = formatCoeffTerm(b, 'y', 1);
      if (mode === 0) {
        const result = `${k}(${ax}+${by})(${ax}-${by})`;
        questions.push(`因式分解：\\(${k * a * a}x^2-${k * b * b}y^2\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\(${k * a * a}x^2-${k * b * b}y^2=${result}\\)`
        );
      } else {
        const mid = -2 * a * b * k;
        const result = `${k}(${ax}-${b})^2`;
        questions.push(`因式分解：\\(${k * a * a}x^2${mid >= 0 ? '+' : ''}${mid}x+${k * b * b}\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `\\(${k * a * a}x^2${mid >= 0 ? '+' : ''}${mid}x+${k * b * b}=${result}\\)`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ332SubstitutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const p = randInt(1, 5);
      const q = randInt(1, 7);
      const mode = i % 2;
      if (mode === 0) {
        const result = `(2x+${p}+${q})(2x+${p}-${q})`;
        questions.push(`因式分解：\\((2x+${p})^2-${q * q}\\)`);
        pushAnswerWithManualSummary(answers, summaryAnswers, `\\(${result}\\)`, `\\((2x+${p})^2-${q * q}=${result}\\)`);
      } else {
        const result = `(x-${p}-${q})^2`;
        questions.push(`因式分解：\\((x-${p})^2-2\\cdot${q}(x-${p})+${q * q}\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${result}\\)`,
          `令 \\(u=x-${p}\\)，原式為 \\(u^2-2\\cdot${q}u+${q * q}=(u-${q})^2=${result}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ332FormulaMixedSet(count) {
    const banks = [buildJ332DiffSquaresSet, buildJ332PerfectSquareSet, buildJ332CompositeSet, buildJ332SubstitutionSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      pushAnswerWithManualSummary(answers, summaryAnswers, one.summaryAnswers[0], one.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ333CrossCoeffOneSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const p = pickNonZero(1, 12);
      const q = pickNonZero(1, 12);
      const s1 = randInt(0, 1) === 0 ? 1 : -1;
      const s2 = randInt(0, 1) === 0 ? 1 : -1;
      const b = s1 * p + s2 * q;
      const c = s1 * p * (s2 * q);
      const result = `(x${s1 > 0 ? '+' : '-'}${p})(x${s2 > 0 ? '+' : '-'}${q})`;
      const polynomial = formatPolynomialFromCoeffs([1, b, c]);
      questions.push(`十字交乘因式分解：\\(${polynomial}\\)`);
      pushAnswerWithManualSummary(answers, summaryAnswers, `\\(${result}\\)`, `\\(${polynomial}=${result}\\)`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ333CrossCoeffNonOneSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a1 = randInt(2, 6);
      const a2 = randInt(2, 6);
      let p = randInt(1, 8);
      let q = randInt(1, 8);
      while (gcdInt(a1, p) !== 1) p = randInt(1, 8);
      while (gcdInt(a2, q) !== 1) q = randInt(1, 8);
      const s1 = randInt(0, 1) === 0 ? 1 : -1;
      const s2 = randInt(0, 1) === 0 ? 1 : -1;
      const A = a1 * a2;
      const B = a1 * (s2 * q) + a2 * (s1 * p);
      const C = s1 * p * (s2 * q);
      const result = `(${formatCoeffTerm(a1, 'x')}${s1 > 0 ? '+' : '-'}${p})(${formatCoeffTerm(a2, 'x')}${s2 > 0 ? '+' : '-'}${q})`;
      const polynomial = formatPolynomialFromCoeffs([A, B, C]);
      questions.push(`十字交乘因式分解：\\(${polynomial}\\)`);
      pushAnswerWithManualSummary(answers, summaryAnswers, `\\(${result}\\)`, `\\(${polynomial}=${result}\\)`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ333CrossPreprocessSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const g = randInt(2, 6);
      const a1 = randInt(1, 4);
      const a2 = randInt(1, 4);
      let p = randInt(1, 7);
      let q = randInt(1, 7);
      while (gcdInt(a1, p) !== 1) p = randInt(1, 7);
      while (gcdInt(a2, q) !== 1) q = randInt(1, 7);
      const s1 = randInt(0, 1) === 0 ? 1 : -1;
      const s2 = randInt(0, 1) === 0 ? 1 : -1;
      const A0 = a1 * a2;
      const B0 = a1 * (s2 * q) + a2 * (s1 * p);
      const C0 = s1 * p * (s2 * q);
      const signAll = randInt(0, 1) === 0 ? 1 : -1;
      const A = signAll * g * A0;
      const B = signAll * g * B0;
      const C = signAll * g * C0;
      const outer = signAll * g;
      const result = `${outer}(${formatCoeffTerm(a1, 'x')}${s1 > 0 ? '+' : '-'}${p})(${formatCoeffTerm(a2, 'x')}${s2 > 0 ? '+' : '-'}${q})`;
      const polynomial = formatPolynomialFromCoeffs([A, B, C]);
      questions.push(`十字交乘因式分解：\\(${polynomial}\\)`);
      pushAnswerWithManualSummary(answers, summaryAnswers, `\\(${result}\\)`, `\\(${polynomial}=${result}\\)`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ333CrossSubstitutionSet(count) {
    function formatLinearFactor(u, constant) {
      if (constant === 0) return u === 1 ? 'x' : `${u}x`;
      return u === 1 ? `x${constant >= 0 ? '+' : ''}${constant}` : `${u}x${constant >= 0 ? '+' : ''}${constant}`;
    }
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const u = pickNonZero(1, 5);
      const v = pickNonZero(1, 6);
      let p = randInt(2, 8);
      let q = randInt(2, 8);
      let s1 = randInt(0, 1) === 0 ? 1 : -1;
      let s2 = randInt(0, 1) === 0 ? 1 : -1;
      let B = s1 * p + s2 * q;
      let C = s1 * p * (s2 * q);
      while (Math.abs(B) <= 1 || Math.abs(C) <= 1) {
        p = randInt(2, 8);
        q = randInt(2, 8);
        s1 = randInt(0, 1) === 0 ? 1 : -1;
        s2 = randInt(0, 1) === 0 ? 1 : -1;
        B = s1 * p + s2 * q;
        C = s1 * p * (s2 * q);
      }
      const A2 = u * u;
      const A1 = 2 * u * v + B * u;
      const A0 = v * v + B * v + C;
      const baseExpr = formatLinearFactor(u, v);
      questions.push(`分解：\\((${baseExpr})^2${B >= 0 ? '+' : ''}${B}(${baseExpr})${C >= 0 ? '+' : ''}${C}\\)。`);
      const c1 = v + (s1 > 0 ? p : -p);
      const c2 = v + (s2 > 0 ? q : -q);
      const tExpr = u === 1 ? `x+${v}` : `${u}x+${v}`;
      const result = `(${formatLinearFactor(u, c1)})(${formatLinearFactor(u, c2)})`;
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${result}\\)`,
        `令 \\(t=${tExpr}\\)，原式可視為 \\(t^2${B >= 0 ? '+' : ''}${B}t${C >= 0 ? '+' : ''}${C}\\)。` +
          `十字交乘得 \\((t${s1 > 0 ? '+' : '-'}${p})(t${s2 > 0 ? '+' : '-'}${q})\\)，` +
          `代回為 \\(${result}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ333CrossStructuredSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const m = randInt(1, 6);
      let p = randInt(2, 8);
      let q = randInt(2, 8);
      let s1 = randInt(0, 1) === 0 ? 1 : -1;
      let s2 = randInt(0, 1) === 0 ? 1 : -1;
      let B = s1 * p + s2 * q;
      let C = s1 * p * (s2 * q);
      while (Math.abs(B) <= 1 || Math.abs(C) <= 1) {
        p = randInt(2, 8);
        q = randInt(2, 8);
        s1 = randInt(0, 1) === 0 ? 1 : -1;
        s2 = randInt(0, 1) === 0 ? 1 : -1;
        B = s1 * p + s2 * q;
        C = s1 * p * (s2 * q);
      }
      const A2 = 1;
      const A1 = 2 * m + B;
      const A0 = m * m + B * m + C;
      questions.push(`分解：\\((x+${m})^2${B >= 0 ? '+' : ''}${B}(x+${m})${C >= 0 ? '+' : ''}${C}\\)。`);
      const c1 = m + (s1 > 0 ? p : -p);
      const c2 = m + (s2 > 0 ? q : -q);
      const result = `(x${c1 === 0 ? '' : `${c1 >= 0 ? '+' : ''}${c1}`})(x${c2 === 0 ? '' : `${c2 >= 0 ? '+' : ''}${c2}`})`;
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${result}\\)`,
        `令 \\(t=x+${m}\\)，原式可視為 \\(t^2${B >= 0 ? '+' : ''}${B}t${C >= 0 ? '+' : ''}${C}\\)。` +
          `分解為 \\((t${s1 > 0 ? '+' : '-'}${p})(t${s2 > 0 ? '+' : '-'}${q})\\)，` +
          `代回為 \\(${result}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ333CrossCoreMixedSet(count) {
    const banks = [buildJ333CrossCoeffOneSet, buildJ333CrossCoeffNonOneSet, buildJ333CrossPreprocessSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      pushAnswerWithManualSummary(answers, summaryAnswers, one.summaryAnswers[0], one.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ333CrossSubMixedSet(count) {
    const banks = [buildJ333CrossSubstitutionSet, buildJ333CrossStructuredSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      pushAnswerWithManualSummary(answers, summaryAnswers, one.summaryAnswers[0], one.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ333FactorParameterReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const p = randInt(1, 6);
        const q = randInt(1, 6);
        const summary = `\\(a=${p + q},\\ b=${p * q}\\)`;
        questions.push(`已知 \\(x^2+ax+b=(x+${p})(x+${q})\\)，求 \\(a,b\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          summary,
          `展開右式得 \\((x+${p})(x+${q})=${formatPolynomialFromCoeffs([1, p + q, p * q])}\\)，所以 ${summary}。`
        );
        continue;
      }
      if (mode === 1) {
        const p = randInt(1, 4);
        const q = randInt(1, 5);
        const r = randInt(1, 4);
        const s = randInt(1, 5);
        const factorA = `(${formatCoeffTerm(p, 'x')}+${q})`;
        const factorB = `(${formatCoeffTerm(r, 'x')}+${s})`;
        const summary = `\\(m=${p * s + q * r},\\ n=${q * s}\\)`;
        questions.push(`已知 \\(${p * r === 1 ? 'x^2' : `${p * r}x^2`}+mx+n=${factorA}${factorB}\\)，求 \\(m,n\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          summary,
          `展開右式得 \\(${formatPolynomialFromCoeffs([p * r, p * s + q * r, q * s])}\\)，所以 ${summary}。`
        );
        continue;
      }
      if (mode === 2) {
        const p = randInt(1, 5);
        const q = randInt(1, 5);
        const summary = `\\(k=${p + q},\\ m=${q}\\)`;
        questions.push(`已知 \\(x^2+kx+${p * q}\\) 可分解為 \\((x+${p})(x+m)\\)，求 \\(k,m\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          summary,
          `比較常數項可得 \\(m=${q}\\)，再比較一次項係數得 \\(k=${p + q}\\)。`
        );
        continue;
      }
      const a1 = randInt(2, 4);
      const p = randInt(1, 4);
      const q = randInt(1, 4);
      const summary = `\\(a=${p - a1 * q}\\)`;
      questions.push(`已知 \\(${a1}x^2+ax-${p * q}=(${a1}x+${p})(x-${q})\\)，求 \\(a\\)。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        summary,
        `展開右式得 \\(${formatPolynomialFromCoeffs([a1, p - a1 * q, -p * q])}\\)，所以 ${summary}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ331MultiTermGroupingAdvancedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const a = randInt(1, 6);
        const summary = `\\((x+${a}-y)(x+${a}+y)\\)`;
        questions.push(`因式分解：$x^2-y^2+${2 * a}x+${a * a}$。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `先整理成 \\((x+${a})^2-y^2\\)，再用平方差公式分解。`);
        continue;
      }

      if (mode === 1) {
        const a = randInt(1, 5);
        const b = randInt(1, 5);
        const c = randInt(1, 5);
        const inner = joinJ113PolyTerms([
          formatJ113PolyTerm(a, 'a'),
          formatJ113PolyTerm(-b, 'b'),
          formatJ113PolyTerm(c, 'c'),
        ]);
        const summary = `\\((x+y)(${inner})\\)`;
        questions.push(`因式分解：$${a}ax+${a}ay-${b}bx-${b}by+${c}cx+${c}cy$。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `三組都含有 \\(x+y\\)，提出後得 \\(${summary.replace(/^\\\(|\\\)$/g, '')}\\)。`);
        continue;
      }

      if (mode === 2) {
        const m = randInt(2, 5);
        const summary = `\\((x-y+${m}z)(x+y-${m}z)\\)`;
        questions.push(`因式分解：$x^2-y^2-${m * m}z^2+${2 * m}yz$。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `後三項為 \\(-(y-${m}z)^2\\)，原式為 \\(x^2-(y-${m}z)^2\\)。`);
        continue;
      }

      if (mode === 3) {
        const k = randInt(2, 8);
        const summary = `\\((x-${k})(x-1)(x+1)\\)`;
        questions.push(`因式分解：$x^3-${k}x^2-x+${k}$。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `分組成 \\(x^2(x-${k})-1(x-${k})\\)，再提出 \\(x-${k}\\)。`);
        continue;
      }

      const p = randInt(2, 5);
      const summary = `\\(${p}(a-b)(x-y)(x+y)\\)`;
      questions.push(`因式分解：$${p}x^2(a-b)+${p}y^2(b-a)$。`);
      pushAnswerWithManualSummary(answers, summaryAnswers, summary, `因為 \\(b-a=-(a-b)\\)，先提出 \\(${p}(a-b)\\)，再用平方差分解。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ332FractionHighPowerMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const m = randInt(2, 5);
        const n = randInt(2, 6);
        const summary = `\\(\\left(\\frac{x}{${m}}-\\frac{y}{${n}}\\right)^2\\)`;
        questions.push(`因式分解：$\\frac{1}{${m * m}}x^2-\\frac{2}{${m * n}}xy+\\frac{1}{${n * n}}y^2$。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `這是完全平方式 \\((A-B)^2\\)，其中 \\(A=\\frac{x}{${m}}\\)、\\(B=\\frac{y}{${n}}\\)。`);
        continue;
      }

      if (mode === 1) {
        const n = randInt(2, 4);
        const a = pickNonSquare(2, 5);
        const summary = `\\((x^{${n}}-${a})(x^{${n}}+${a})\\)`;
        questions.push(`因式分解：$x^{${2 * n}}-${a ** 2}$。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `把 \\(x^{${2 * n}}\\) 視為 \\((x^{${n}})^2\\)，再用平方差公式。`);
        continue;
      }

      if (mode === 2) {
        const a = randInt(2, 4);
        const b = randInt(2, 4);
        const sign = randInt(0, 1) === 0 ? '+' : '-';
        questions.push(`因式分解：$${a ** 3}x^3${sign}${b ** 3}y^3$。`);
        if (sign === '+') {
          const summary = `\\((${a}x+${b}y)(${a * a}x^2-${a * b}xy+${b * b}y^2)\\)`;
          pushAnswerWithManualSummary(answers, summaryAnswers, summary, `利用立方和公式 \\(A^3+B^3=(A+B)(A^2-AB+B^2)\\)。`);
        } else {
          const summary = `\\((${a}x-${b}y)(${a * a}x^2+${a * b}xy+${b * b}y^2)\\)`;
          pushAnswerWithManualSummary(answers, summaryAnswers, summary, `利用立方差公式 \\(A^3-B^3=(A-B)(A^2+AB+B^2)\\)。`);
        }
        continue;
      }

      if (mode === 3) {
        const n = randInt(1, 3);
        const xn = n === 1 ? 'x' : `x^{${n}}`;
        const yn = n === 1 ? 'y' : `y^{${n}}`;
        const x2n = `x^{${2 * n}}`;
        const y2n = `y^{${2 * n}}`;
        const summary = `\\((${xn}-${yn})(${xn}+${yn})(${x2n}+${xn}${yn}+${y2n})(${x2n}-${xn}${yn}+${y2n})\\)`;
        questions.push(`因式分解：$x^{${6 * n}}-y^{${6 * n}}$。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `先看成 \\((${xn})^6-(${yn})^6\\)，再連續使用平方差與立方和、立方差公式。`);
        continue;
      }

      const d = randInt(2, 8);
      const middleCoeff = formatFraction(2, d);
      const middleTerm = middleCoeff === '1' ? 'x' : `${middleCoeff}x`;
      const summary = `\\(\\left(x+\\frac{1}{${d}}\\right)^2\\)`;
      questions.push(`因式分解：$x^2+${middleTerm}+${formatFraction(1, d * d)}$。`);
      pushAnswerWithManualSummary(answers, summaryAnswers, summary, `這是完全平方式，因為中項為 \\(2\\cdot x\\cdot \\frac{1}{${d}}\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ333SubstitutionHiddenStructureSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const r = randInt(1, 5);
        const s = randInt(r + 1, r + 6);
        const summary = `\\((x+y-${r})(x+y-${s})\\)`;
        questions.push(`因式分解：$(x+y)^2-${r + s}(x+y)+${r * s}$。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `令 \\(u=x+y\\)，原式為 \\(u^2-${r + s}u+${r * s}\\)。`);
        continue;
      }

      if (mode === 1) {
        const a = randInt(2, 6);
        const r = randInt(1, 4);
        const s = randInt(r + 1, r + 6);
        const base = `x^2-${a}x`;
        const summary = `\\((${base}-${r})(${base}-${s})\\)`;
        questions.push(`因式分解：$(${base})^2-${r + s}(${base})+${r * s}$。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `令 \\(u=${base}\\)，原式為 \\(u^2-${r + s}u+${r * s}\\)。`);
        continue;
      }

      if (mode === 2) {
        const k = randInt(2, 9);
        const summary = `\\((x-y-${k})(x-y+${k})\\)`;
        questions.push(`因式分解：$x^2-2xy+y^2-${k * k}$。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `前面三項是 \\((x-y)^2\\)，再用平方差公式。`);
        continue;
      }

      if (mode === 3) {
        const a = randInt(2, 5);
        const r = randInt(1, 4);
        const s = randInt(r + 1, r + 6);
        const bCoef = a * s - r;
        const c = -r * s;
        const summary = `\\((${a}(p-q)+${r})((p-q)-${s})\\)`;
        questions.push(`因式分解：$${a}(p-q)^2${bCoef >= 0 ? '+' : ''}${bCoef}(q-p)${c >= 0 ? '+' : ''}${c}$。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `令 \\(u=p-q\\)，且 \\(q-p=-u\\)，原式化為 \\(${a}u^2-${bCoef}u${c >= 0 ? '+' : ''}${c}\\)。`);
        continue;
      }

      const a = randInt(2, 13);
      let b = randInt(-6, 6);
      let c = randInt(2, 6);
      let d = pickNonZero(-6, 6);
      while (b === 0 || a === c || (a + c === 0 && b + d === 0) || (a - c === 0 && b - d === 0)) {
        b = randInt(-6, 6);
        c = randInt(2, 6);
        d = pickNonZero(-6, 6);
      }
      const first = joinJ113PolyTerms([formatJ113PolyTerm(a - c, 'x'), formatJ113PolyTerm(b - d, '')]);
      const second = joinJ113PolyTerms([formatJ113PolyTerm(a + c, 'x'), formatJ113PolyTerm(b + d, '')]);
      const summary = `\\((${first})(${second})\\)`;
      questions.push(`因式分解：$(${a}x${b >= 0 ? '+' : ''}${b})^2-(${c}x${d >= 0 ? '+' : ''}${d})^2$。`);
      pushAnswerWithManualSummary(answers, summaryAnswers, summary, `利用 \\(A^2-B^2=(A-B)(A+B)\\)，分別計算兩個括號的差與和。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ332SpecialApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const p = randInt(1, 8);
        const a = randInt(2, 6);
        const b = randInt(1, 9);
        const area = multiplyPolyCoeffs([1, p], [a, b]);
        const width = formatPolynomialFromCoeffs([a, b]);
        questions.push(`已知矩形面積為 $${formatPolynomialFromCoeffs(area)}$，且長為 $x+${p}$，求寬的代數式。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, `\\(${width}\\)`, `將面積因式分解為 \\((x+${p})(${width})\\)，所以寬為 \\(${width}\\)。`);
        continue;
      }

      if (mode === 1) {
        const a = randInt(2, 6);
        const b = randInt(1, 9);
        const area = formatPolynomialFromCoeffs([a * a, 2 * a * b, b * b]);
        const summary = `\\(${4 * a}x+${4 * b}\\)`;
        questions.push(`一正方形面積為 $${area}$，求其周長。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `面積為 \\((${a}x+${b})^2\\)，邊長為 \\(${a}x+${b}\\)，周長為 \\(${summary.replace(/^\\\(|\\\)$/g, '')}\\)。`);
        continue;
      }

      if (mode === 2) {
        const c = randInt(2, 12);
        const summary = `\\(k=\\pm${2 * c}\\)`;
        questions.push(`若 $x^2+kx+${c * c}$ 為完全平方式，求 $k$ 的所有可能值。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `因為 \\((x\\pm${c})^2=x^2\\pm${2 * c}x+${c * c}\\)，所以 \\(k\\) 有正負兩種可能。`);
        continue;
      }

      if (mode === 3) {
        const sum = randInt(3, 15);
        const diff = randInt(1, sum - 1);
        const productDiff = sum * diff;
        const summary = `\\(x=${formatFraction(sum + diff, 2)},\\ y=${formatFraction(sum - diff, 2)}\\)`;
        questions.push(`已知 $x^2-y^2=${productDiff}$ 且 $x+y=${sum}$，求 $x,y$ 的值。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `由平方差得 \\((x-y)(x+y)=${productDiff}\\)，所以 \\(x-y=\\frac{${productDiff}}{${sum}}=${diff}\\)，再聯立求出 \\(x,y\\)。`);
        continue;
      }

      const a = randInt(20, 80);
      const b = randInt(2, 15);
      const summary = `${a ** 3 - b ** 3}`;
      questions.push(`利用因式分解計算 $${a}^3-${b}^3$ 的快速結果。`);
      pushAnswerWithManualSummary(answers, summaryAnswers, summary, `利用 \\(a^3-b^3=(a-b)(a^2+ab+b^2)\\) 計算。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ333CoefficientReverseJudgementSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const r = randInt(1, 8);
        const c = -r * randInt(1, 9);
        const a = -(c / r + r);
        const ra = r === 1 ? 'a' : `${r}a`;
        const summary = `\\(a=${a}\\)`;
        questions.push(`若 $(x-${r})$ 是 $x^2+ax${c >= 0 ? '+' : ''}${c}$ 的因式，求 $a$。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `代入 \\(x=${r}\\)，得 \\(${r * r}+${ra}${c >= 0 ? '+' : ''}${c}=0\\)，解得 \\(a=${a}\\)。`);
        continue;
      }

      if (mode === 1) {
        const m = randInt(1, 8);
        const k = m;
        const mid = 2 * m + 1;
        const summary = `\\(k=${k},\\ m=${m}\\)`;
        questions.push(`已知 $2x^2+${mid}x+k=(2x+1)(x+m)$，求 $k,m$。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `展開右式為 \\(2x^2+${2 * m + 1}x+${m}\\)，比較係數可得。`);
        continue;
      }

      if (mode === 2) {
        const a = randInt(2, 9);
        questions.push(`判斷 $x+${a}$ 是否為 $x^3+${a ** 3}$ 的因式。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, '是', `因為 \\(x^3+${a ** 3}=(x+${a})(x^2-${a}x+${a * a})\\)，所以 \\(x+${a}\\) 是因式。`);
        continue;
      }

      if (mode === 3) {
        const p = randInt(2, 8);
        const q = randInt(1, 10);
        const constant = -p * q;
        const summary = `${-q}`;
        questions.push(`若多項式展開後常數項為 ${constant}，且其中一個因式為 $x+${p}$，求另一個一次因式的常數項。`);
        pushAnswerWithManualSummary(answers, summaryAnswers, summary, `常數項為 \\(${p}\\) 乘以另一因式常數項，所以另一個常數項為 \\(${summary}\\)。`);
        continue;
      }

      const r = randInt(1, 9);
      const s = randInt(1, 9);
      const sum = r + s;
      const possible = [];
      for (let c = 1; c <= sum * sum; c += 1) {
        for (let d = 1; d <= c; d += 1) {
          if (d * (c / d) === c && Number.isInteger(c / d) && d + c / d === sum) {
            possible.push(c);
            break;
          }
        }
      }
      questions.push(`找出所有正整數 $c$，使 $x^2+${sum}x+c$ 可分解為兩個整係數一次式。`);
      const summary = `\\(c=${[...new Set(possible)].join(', ')}\\)`;
      pushAnswerWithManualSummary(answers, summaryAnswers, summary, `找正因數對和為 ${sum} 的乘積，這些乘積就是可行的 \\(c\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ341FactorFormulaSolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const a = randInt(1, 6),
          b = pickNonZero(-10, 10);
        const equation = formatQuadraticEquation(a, b, 0);
        const summary = `\\(x=0\\) 或 \\(x=${formatFraction(-b, a)}\\)`;
        questions.push(`解方程：\\(${equation}\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          summary,
          `提出公因式得 \\(x(${formatSingleVarExpr(a, b)})=0\\)，所以 ${summary}。`
        );
      } else if (mode === 1) {
        const a = randInt(1, 6),
          b = randInt(1, 9);
        const coeff = a * a;
        const lead = coeff === 1 ? 'x^2' : `${coeff}x^2`;
        const summary = `\\(x=\\pm${formatFraction(b, a)}\\)`;
        questions.push(`解方程：\\(${lead}-${b * b}=0\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          summary,
          `移項後得 \\(${lead}=${b * b}\\)，兩邊開平方即可得到 ${summary}。`
        );
      } else {
        const a = randInt(1, 5),
          b = randInt(1, 9),
          sign = randInt(0, 1) === 0 ? '+' : '-';
        const mid = sign === '+' ? 2 * a * b : -2 * a * b;
        const coeff = a * a;
        const root = formatFraction(sign === '+' ? -b : b, a);
        const summary = `\\(x=${root}\\)（重根）`;
        questions.push(`解方程：\\(${formatQuadraticEquation(coeff, mid, b * b)}\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          summary,
          `原式為完全平方 \\(${a === 1 ? '' : a}x${sign}${b}\\)^2=0，因此 ${summary}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ341CrossSolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const r1n = pickNonZero(-8, 8);
      const r2n = pickNonZero(-8, 8);
      const a = randInt(1, 5);
      const b = -a * (r1n + r2n);
      const c = a * r1n * r2n;
      const equation = formatQuadraticEquation(a, b, c);
      const summary = r1n === r2n ? `\\(x=${r1n}\\)（重根）` : `\\(x=${r1n}\\) 或 \\(x=${r2n}\\)`;
      questions.push(`解方程：\\(${equation}\\)`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        summary,
        `可因式分解為 \\(${a}(x-${wrapIfNegative(r1n)})(x-${wrapIfNegative(r2n)})=0\\)，所以 ${summary}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ341StandardTransformSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 2;
      if (mode === 0) {
        const p = pickNonZero(1, 6);
        const r = randInt(2, 6);
        const q = pickNonZero(-8, 8);
        const t = pickNonZero(-8, 8);
        const leftFactor = formatSingleVarExpr(r, q);
        const rightFactor = formatSingleVarExpr(1, t);
        const x2 = formatFraction(t - q, r - 1);
        questions.push(`解方程：\\((x-${p})(${leftFactor})=(x-${p})(${rightFactor})\\)`);
        const summary = x2 === p ? `\\(x=${p}\\)（重根）` : `\\(x=${p}\\) 或 \\(x=${x2}\\)`;
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          summary,
          `移項得 \\((x-${p})\\big[(${leftFactor})-(${rightFactor})\\big]=0\\)。` +
            `所以 \\(x-${p}=0\\) 或 \\(${formatSingleVarExpr(r - 1, q - t)}=0\\)，得到 ${summary}。`
        );
      } else {
        let p = 2;
        let r = 2;
        let u = 1;
        let v = -3;
        let q = 1;
        let k = 0;
        for (let t = 0; t < 80; t += 1) {
          p = pickNonZero(1, 6);
          r = randInt(1, 5);
          u = pickNonZero(-8, 8);
          v = pickNonZero(-8, 8);
          q = r * (p - (u + v));
          if (q === 0 || Math.abs(q) > 12) continue;
          k = -r * u * v - p * q;
          if (k === 0 || Math.abs(k) > 80) continue;
          break;
        }
        const factorText = formatSingleVarExpr(r, q);
        const stdA = r;
        const stdB = q - r * p;
        const stdC = -p * q - k;
        const root1 = formatFraction(u, 1);
        const root2 = formatFraction(v, 1);
        const moveText = formatSubtraction(`(x-${p})(${factorText})`, k);
        questions.push(`解方程：\\((x-${p})(${factorText})=${k}\\)`);
        const summary = u === v ? `\\(x=${root1}\\)（重根）` : `\\(x=${root1}\\) 或 \\(x=${root2}\\)`;
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          summary,
          `先移項：\\(${moveText}=0\\)，展開得 \\(${formatQuadraticEquation(stdA, stdB, stdC)}\\)。` +
            `因式分解可寫成 \\((x-${wrapIfNegative(u)})(x${v >= 0 ? '-' : '+'}${Math.abs(v)})=0\\)，得到 ${summary}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ341RootPropertyReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const r1 = pickNonZero(-8, 8),
          r2 = pickNonZero(-8, 8);
        const sum = r1 + r2,
          prod = r1 * r2;
        questions.push(`已知二次方程兩根為 \\(${r1},${r2}\\)，還原其方程。`);
        const equation = formatQuadraticEquationFromRoots(r1, r2);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${equation}\\)`,
          `兩根和為 \\(${sum}\\)、兩根積為 \\(${prod}\\)，故方程式為 \\(${equation}\\)。`
        );
      } else if (mode === 1) {
        const r1 = pickNonZero(-8, 8);
        let r2 = pickNonZero(-8, 8);
        while (r2 === r1) r2 = pickNonZero(-8, 8);
        const n = r1 * r2;
        questions.push(`若 \\(x^2+kx${n >= 0 ? '+' : ''}${n}=0\\) 的一根為 \\(${r1}\\)，求另一根。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `另一根為 \\(${formatFraction(n, r1)}\\)`,
          `由兩根積為 \\(${n}\\)，得另一根 \\(=\\frac{${n}}{${wrapIfNegative(r1)}}=${formatFraction(n, r1)}\\)。`
        );
      } else {
        const r1 = pickNonZero(-8, 8);
        let r2 = pickNonZero(-8, 8);
        while (r2 === r1 || r2 === -r1) r2 = pickNonZero(-8, 8);
        const sum = r1 + r2;
        questions.push(
          `若 \\(${formatMonicQuadraticWithSymbolicConstant(-sum, 'k')}\\) 的一根為 \\(${r1}\\)，求另一根。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `另一根為 \\(${r2}\\)`,
          `由兩根和為 \\(${sum}\\)，得另一根 \\(=${sum}-${wrapIfNegative(r1)}=${r2}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ342SquareRootSolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const k = randInt(2, 15);
        questions.push(`解方程：\\(x^2=${k * k}\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(x=\\pm${k}\\)`,
          `由 \\(x^2=${k * k}\\)，兩邊開平方得 \\(x=\\pm${k}\\)。`
        );
      } else if (mode === 1) {
        const h = pickNonZero(-8, 8),
          k = randInt(2, 12);
        const summary = `\\(x=${-h + k}\\) 或 \\(x=${-h - k}\\)`;
        questions.push(`解方程：\\((x${h >= 0 ? '+' : ''}${h})^2=${k * k}\\)`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          summary,
          `先得 \\(x${h >= 0 ? '+' : ''}${h}=\\pm${k}\\)，再解出 ${summary}。`
        );
      } else {
        const a = randInt(1, 5),
          h = pickNonZero(-6, 6),
          m = randInt(2, 15),
          b = randInt(-10, 10);
        const lead = a === 1 ? '' : `${a}`;
        const constantTerm = b === 0 ? '' : formatSignedNumber(b);
        questions.push(`解方程：\\(${lead}(x${h >= 0 ? '+' : ''}${h})^2${constantTerm}=${m * m}\\)`);
        const numerator = m * m - b;
        if (numerator < 0) {
          pushAnswerWithManualSummary(
            answers,
            summaryAnswers,
            '無實數解',
            `移項得 \\(${lead}(x${h >= 0 ? '+' : ''}${h})^2=${numerator}\\)，左邊不小於 0，故無實數解。`
          );
        } else if (numerator === 0) {
          pushAnswerWithManualSummary(
            answers,
            summaryAnswers,
            `\\(x=${-h}\\)`,
            `移項得 \\(${lead}(x${h >= 0 ? '+' : ''}${h})^2=0\\)，所以 \\(x=${-h}\\)。`
          );
        } else if (numerator % a === 0) {
          const rootText = formatRadical(numerator / a);
          const summary = `\\(x=${-h}+${rootText}\\) 或 \\(x=${-h}-${rootText}\\)`;
          pushAnswerWithManualSummary(
            answers,
            summaryAnswers,
            summary,
            `移項並除以 ${a}，得 \\((x${h >= 0 ? '+' : ''}${h})^2=${numerator / a}\\)，所以 ${summary}。`
          );
        } else {
          const summary = `\\(x=${-h}+\\sqrt{\\frac{${numerator}}{${a}}}\\) 或 \\(x=${-h}-\\sqrt{\\frac{${numerator}}{${a}}}\\)`;
          pushAnswerWithManualSummary(
            answers,
            summaryAnswers,
            summary,
            `移項並除以 ${a}，得 \\((x${h >= 0 ? '+' : ''}${h})^2=\\frac{${numerator}}{${a}}\\)，所以 ${summary}。`
          );
        }
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ342CompleteSquareTermSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 6);
      const b = pickNonZero(-14, 14);
      const fillNumerator = b * b;
      const fillDenominator = 4 * a;
      const deltaNumerator = b;
      const deltaDenominator = 2 * a;
      const fillText = formatFraction(fillNumerator, fillDenominator);
      const deltaText = formatFraction(deltaNumerator, deltaDenominator);
      const rhsLead = a === 1 ? '' : `${a}`;
      const middleTerm = b === 1 ? '+x' : b === -1 ? '-x' : formatSignedNumber(b) + 'x';
      questions.push(
        `填空使其成完全平方：\\(${a === 1 ? 'x^2' : `${a}x^2`}${middleTerm}+\\square=${rhsLead}\\left(x+\\Delta\\right)^2\\)`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(\\square=${fillText}\\)，\\(\\Delta=${deltaText}\\)`,
        `比較 \\(${a === 1 ? 'x^2' : `${a}x^2`}${middleTerm}+${fillText}=${rhsLead}\\left(x+${deltaText}\\right)^2\\)，可得所填兩值。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ342CompletingSquareSolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const p = pickNonZero(-8, 8);
      const q = randInt(2, 12);
      const mode = i % 2;
      const b = -2 * p;
      const c = mode === 0 ? p * p - q : p * p + q;
      const rhs = p * p - c; // = q or -q
      const constantTerm = c === 0 ? '' : formatSignedNumber(c);
      questions.push(`用配方法解：\\(x^2${b >= 0 ? '+' : ''}${b}x${constantTerm}=0\\)`);
      if (rhs > 0) {
        const root = formatRadical(rhs);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(x=${p}\\pm${root}\\)`,
          `先配方：\\((x${p >= 0 ? '-' : '+'}${Math.abs(p)})^2=${rhs}\\)。再開根號：\\(x=${p}\\pm${root}\\)。`
        );
      } else if (rhs === 0) {
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(x=${p}\\)（重根）`,
          `先配方：\\((x${p >= 0 ? '-' : '+'}${Math.abs(p)})^2=0\\)。所以 \\(x=${p}\\)（重根）。`
        );
      } else {
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `無實數解`,
          `先配方：\\((x${p >= 0 ? '-' : '+'}${Math.abs(p)})^2=${rhs}\\)。右邊為負，無實數解。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ342DiscriminantSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode < 2) {
        const a = pickNonZero(1, 5),
          b = pickNonZero(-12, 12),
          c = pickNonZero(-12, 12);
        const D = b * b - 4 * a * c;
        questions.push(`判別 \\(${formatQuadraticEquation(a, b, c)}\\) 的根性質。`);
        const summary = D > 0 ? '兩相異實根' : D === 0 ? '重根' : '無實數根';
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          summary,
          `判別式 \\(D=${D}\\)，因此 ${D > 0 ? '\\(D>0\\)' : D === 0 ? '\\(D=0\\)' : '\\(D<0\\)'}，故為${summary}。`
        );
      } else {
        const a = randInt(1, 5),
          c = randInt(1, 20);
        const lead = a === 1 ? 'x^2' : `${a}x^2`;
        questions.push(`若 \\(${lead}-kx+${c}=0\\) 有重根，求 \\(k\\) 的值。`);
        const summary = `\\(k=\\pm${formatRadical(4 * a * c)}\\)`;
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          summary,
          `有重根表示 \\(D=k^2-4\\cdot${a}\\cdot${c}=0\\)，解得 ${summary}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ342FormulaSolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(1, 6),
        b = pickNonZero(-12, 12),
        c = pickNonZero(-12, 12);
      const D = b * b - 4 * a * c;
      questions.push(`用公式解：\\(${formatQuadraticEquation(a, b, c)}\\)`);
      if (D >= 0) {
        const sqrtD = Math.sqrt(D);
        if (Number.isInteger(sqrtD)) {
          const x1 = formatFraction(-b + sqrtD, 2 * a);
          const x2 = formatFraction(-b - sqrtD, 2 * a);
          const summary = x1 === x2 ? `\\(x=${x1}\\)（重根）` : `\\(x=${x1}\\) 或 \\(x=${x2}\\)`;
          pushAnswerWithManualSummary(
            answers,
            summaryAnswers,
            summary,
            `代入公式，判別式為完全平方數 \\(D=${D}\\)，可得 ${summary}。`
          );
          continue;
        }
      }
      if (D < 0) {
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          '無實數解',
          `判別式 \\(D=${D}<0\\)，所以無實數解。`
        );
      } else {
        const summary = `\\(x=\\frac{${-b}\\pm${formatRadical(D)}}{${2 * a}}\\)`;
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          summary,
          `代入公式 \\(x=\\dfrac{-b\\pm\\sqrt{D}}{2a}\\)，其中 \\(D=${D}\\)，得到 ${summary}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ342ReverseFromSquareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const p = pickNonZero(-8, 8),
          q = randInt(1, 20);
        questions.push(
          `若 \\(x^2${2 * p >= 0 ? '+' : ''}${2 * p}x+a=0\\) 可配方成 \\((x${p >= 0 ? '+' : ''}${p})^2=${q}\\)，求 \\(a\\)。`
        );
        const summary = `\\(a=${p * p - q}\\)`;
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          summary,
          `比較 \\((x${p >= 0 ? '+' : ''}${p})^2=x^2${2 * p >= 0 ? '+' : ''}${2 * p}x+${p * p}\\)，可得 ${summary}。`
        );
      } else if (mode === 1) {
        const r1 = pickNonZero(-8, 8),
          r2 = pickNonZero(-8, 8);
        questions.push(`已知一元二次方程兩根為 \\(${r1},${r2}\\)，求原方程。`);
        const equation = formatQuadraticEquationFromRoots(r1, r2);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${equation}\\)`,
          `由兩根和與兩根積，方程式為 \\(${equation}\\)。`
        );
      } else {
        const a = pickNonZero(1, 5),
          b = pickNonZero(-12, 12),
          c = pickNonZero(-12, 12);
        questions.push(
          `將 \\(${formatPolynomialFromCoeffs([a, b, c])}\\) 寫成 \\(A(x-h)^2+k\\) 形式，求 \\(A+h+k\\)。`
        );
        const h = makeFraction(-b, 2 * a);
        const k = makeFraction(4 * a * c - b * b, 4 * a);
        const total = addFraction(addFraction(makeFraction(a, 1), h), k);
        const kTerm = k.num === 0 ? '' : k.num > 0 ? `+${fractionToLatex(k)}` : fractionToLatex(k);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(A+h+k=${fractionToLatex(total)}\\)`,
          `先提出 \\(A=${a}\\) 再配方。可寫成 \\(${a}\\left(${formatXMinusFraction(
            h
          )}\\right)^2${kTerm}\\)，所以 \\(A+h+k=${fractionToLatex(total)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ342RootsSumProductDirectSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(1, 6),
        b = pickNonZero(-12, 12),
        c = pickNonZero(-12, 12);
      const sumText = formatFraction(-b, a);
      const prodText = formatFraction(c, a);
      questions.push(
        `已知 \\(${formatQuadraticEquation(a, b, c)}\\)，求兩根和 \\(\\alpha+\\beta\\) 與兩根積 \\(\\alpha\\beta\\)。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(\\alpha+\\beta=${sumText}\\)，\\(\\alpha\\beta=${prodText}\\)`,
        `由韋達定理，\\(\\alpha+\\beta=-\\dfrac{b}{a}=${sumText}\\)，\\(\\alpha\\beta=\\dfrac{c}{a}=${prodText}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ342ReverseEquationFromRootsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 2;
      if (mode === 0) {
        const s = pickNonZero(-10, 10),
          p = pickNonZero(-20, 20);
        questions.push(`若兩根和為 \\(${s}\\)、兩根積為 \\(${p}\\)，求二次方程。`);
        const equation = formatQuadraticEquation(1, -s, p);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${equation}\\)`,
          `以兩根和、積還原：\\(x^2-(\\text{兩根和})x+\\text{兩根積}=0\\)，得到 \\(${equation}\\)。`
        );
      } else {
        const r1 = pickNonZero(-8, 8),
          r2 = pickNonZero(-8, 8);
        questions.push(`若兩根分別為 \\(${r1}\\)、\\(${r2}\\)，還原其二次方程。`);
        const s = r1 + r2;
        const p = r1 * r2;
        const equation = formatQuadraticEquation(1, -s, p);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${equation}\\)`,
          `兩根和為 \\(${s}\\)、兩根積為 \\(${p}\\)，故方程式為 \\(${equation}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ342ExpressionBySumProductSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(1, 5),
        b = pickNonZero(-10, 10),
        c = pickNonZero(-10, 10);
      const S = formatFraction(-b, a);
      const P = formatFraction(c, a);
      const mode = i % 3;
      if (mode === 0) {
        const value = subFraction(
          mulFraction(makeFraction(-b, a), makeFraction(-b, a)),
          mulFraction(makeFraction(2, 1), makeFraction(c, a))
        );
        questions.push(
          `若 \\(${formatQuadraticEquation(a, b, c)}\\) 兩根為 \\(\\alpha,\\beta\\)，求 \\(\\alpha^2+\\beta^2\\)。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(\\alpha^2+\\beta^2=${fractionToLatex(value)}\\)`,
          `\\((\\alpha+\\beta)^2-2\\alpha\\beta=${S}^2-2\\cdot${P}=${fractionToLatex(value)}\\)。`
        );
      } else if (mode === 1) {
        const value = addFraction(subFraction(makeFraction(c, a), makeFraction(-b, a)), makeFraction(1, 1));
        questions.push(
          `若 \\(${formatQuadraticEquation(a, b, c)}\\) 兩根為 \\(\\alpha,\\beta\\)，求 \\((\\alpha-1)(\\beta-1)\\)。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\((\\alpha-1)(\\beta-1)=${fractionToLatex(value)}\\)`,
          `\\(\\alpha\\beta-(\\alpha+\\beta)+1=${P}-(${S})+1=${fractionToLatex(value)}\\)。`
        );
      } else {
        const value = subFraction(
          mulFraction(makeFraction(-b, a), makeFraction(-b, a)),
          mulFraction(makeFraction(4, 1), makeFraction(c, a))
        );
        questions.push(
          `若 \\(${formatQuadraticEquation(a, b, c)}\\) 兩根為 \\(\\alpha,\\beta\\)，求 \\((\\alpha-\\beta)^2\\)。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\((\\alpha-\\beta)^2=${fractionToLatex(value)}\\)`,
          `\\((\\alpha+\\beta)^2-4\\alpha\\beta=${S}^2-4\\cdot${P}=${fractionToLatex(value)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ342CoefficientMistakeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const r1 = pickNonZero(-8, 8),
        r2 = pickNonZero(-8, 8);
      const sum = r1 + r2;
      const prod = r1 * r2;
      const wrongSum = -sum;
      const wrongProd = -prod;
      const mode = i % 2;
      if (mode === 0) {
        questions.push(`某生把一次項符號看錯，誤得兩根為 \\(${r1},${r2}\\)。求正確方程。`);
        const equation = formatQuadraticEquation(1, -wrongSum, prod);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${equation}\\)`,
          `錯一次項只會改變「根和」符號，故正確根和為 \\(${wrongSum}\\)、根積不變為 \\(${prod}\\)，方程為 \\(${equation}\\)。`
        );
      } else {
        questions.push(`某生把常數項符號看錯，誤得兩根為 \\(${r1},${r2}\\)。求正確方程。`);
        const equation = formatQuadraticEquation(1, -sum, wrongProd);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${equation}\\)`,
          `錯常數項只會改變「根積」符號，故正確根和為 \\(${sum}\\)、根積為 \\(${wrongProd}\\)，方程為 \\(${equation}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ342SpecialRootRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const a = randInt(2, 9);
        const b = randInt(1, a - 1);
        questions.push(`若方程 \\(x^2+(k+${a})x+(k+${b})=0\\) 兩根互為相反數，求 \\(k\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(k=-${a}\\)`,
          `兩根互為相反數，兩根和為 0，故 \\(k+${a}=0\\Rightarrow k=-${a}\\)。`
        );
      } else if (mode === 1) {
        const a = randInt(1, 6);
        const b = randInt(1, 9);
        questions.push(`若方程 \\(x^2+(k+${a})x+(k-${b})=0\\) 有一根為 0，求 \\(k\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(k=${b}\\)`,
          `有一根為 0 \\(\\Rightarrow\\) 根積為 0，故常數項 \\(k-${b}=0\\Rightarrow k=${b}\\)。`
        );
      } else if (mode === 2) {
        const r = randInt(2, 9);
        questions.push(`若方程 \\(x^2+mx+${r * r}=0\\) 有相等兩根，求 \\(m\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(m=\\pm${2 * r}\\)`,
          `相等兩根 \\(\\Rightarrow D=0\\)：\\(m^2-${4 * r * r}=0\\Rightarrow m=\\pm${2 * r}\\)。`
        );
      } else {
        const a = randInt(2, 6);
        const mAbs = randInt(2 * a, 12);
        const m = randInt(0, 1) === 0 ? mAbs : -mAbs;
        const middle = m === 1 ? '+x' : m === -1 ? '-x' : m > 0 ? `+${m}x` : `${m}x`;
        questions.push(`若方程 \\(${a}x^2${middle}+k=0\\) 的兩根互為倒數，求 \\(k\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(k=${a}\\)`,
          `兩根互為倒數，表示兩根積為 1。由韋達定理，兩根積為 \\(\\frac{k}{${a}}\\)，所以 \\(\\frac{k}{${a}}=1\\Rightarrow k=${a}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ342KnownRootParameterSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const r = pickNonZero(-6, 6);
        const other = pickNonZero(-8, 8);
        const c = r * other;
        const k = -(r + other);
        questions.push(`若 \\(x=${r}\\) 是方程式 \\(x^2+kx${c >= 0 ? '+' : ''}${c}=0\\) 的一根，求 \\(k\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(k=${k}\\)`,
          `將 \\(x=${r}\\) 代入得 \\(${r * r}${r >= 0 ? '+' : ''}${r}k${c >= 0 ? '+' : ''}${c}=0\\)，整理可得 \\(k=${k}\\)。`
        );
      } else if (mode === 1) {
        const r = pickNonZero(-6, 6);
        let other = pickNonZero(-8, 8);
        while (other === r) other = pickNonZero(-8, 8);
        const c = r * other;
        const k = -(r + other);
        questions.push(`若 \\(x=${r}\\) 是方程式 \\(x^2+kx${c >= 0 ? '+' : ''}${c}=0\\) 的一根，求 \\(k\\) 及另一根。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(k=${k}\\)，另一根為 \\(x=${other}\\)`,
          `由韋達定理可得兩根和為 \\(${-k}\\)，所以 \\(k=${k}\\)，另一根為 \\(x=${other}\\)。`
        );
      } else {
        const a = randInt(2, 5);
        const r = pickNonZero(-5, 5);
        const other = pickNonZero(-6, 6);
        const c = a * r * other;
        const k = -a * (r + other);
        questions.push(
          `若 \\(x=${r}\\) 是方程式 \\(${a}x^2+kx${c >= 0 ? '+' : ''}${c}=0\\) 的一根，求 \\(k\\) 及另一根。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(k=${k}\\)，另一根為 \\(x=${other}\\)`,
          `代入 \\(x=${r}\\) 或用韋達定理，可得 \\(k=${k}\\)，另一根為 \\(x=${other}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ342DiscriminantRangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const bAbs = randInt(2, 10) * 2;
        const b = randInt(0, 1) === 0 ? bAbs : -bAbs;
        const bound = Math.trunc((b * b) / 4);
        questions.push(`若方程式 \\(x^2${b >= 0 ? '+' : ''}${b}x+k=0\\) 有兩相異實根，求 \\(k\\) 的範圍。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(k<${bound}\\)`,
          `判別式需滿足 \\(D=${b * b}-4k>0\\)，整理得 \\(k<${bound}\\)。`
        );
      } else if (mode === 1) {
        const bAbs = randInt(2, 10) * 2;
        const b = randInt(0, 1) === 0 ? bAbs : -bAbs;
        const bound = Math.trunc((b * b) / 4);
        questions.push(`若方程式 \\(x^2${b >= 0 ? '+' : ''}${b}x+k=0\\) 有實根，求 \\(k\\) 的範圍。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(k\\le ${bound}\\)`,
          `判別式需滿足 \\(D=${b * b}-4k\\ge 0\\)，整理得 \\(k\\le ${bound}\\)。`
        );
      } else {
        const b = randInt(3, 10);
        const bound = formatFraction(b * b, 4);
        questions.push(`若方程式 \\(x^2-${b}x+k=0\\) 沒有實根，求 \\(k\\) 的範圍。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(k>${bound}\\)`,
          `判別式需滿足 \\(D=${b * b}-4k<0\\)，整理得 \\(k>${bound}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ342RootsCoreMixedSet(count) {
    const banks = [
      buildJ342RootsSumProductDirectSet,
      buildJ342ReverseEquationFromRootsSet,
      buildJ342ExpressionBySumProductSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      pushGeneratedItem(questions, answers, summaryAnswers, one);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ342RootsAppliedMixedSet(count) {
    const banks = [buildJ342CoefficientMistakeSet, buildJ342SpecialRootRelationSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      pushGeneratedItem(questions, answers, summaryAnswers, one);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ343NumberPropertyWordSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const x = randInt(4, 12);
        const y = randInt(3, 10);
        const sum = x + y;
        const prod = x * y;
        questions.push(`已知兩數的和為 ${sum}，積為 ${prod}，求這兩數。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${x} 與 ${y}`,
          `設兩數為 \\(t\\) 與 \\(${sum}-t\\)，由乘積可列出 \\(t(${sum}-t)=${prod}\\)，解得兩數為 ${x} 與 ${y}。`
        );
        continue;
      }
      if (mode === 1) {
        const n = randInt(6, 20);
        const a = 2 * n - 1;
        const b = 2 * n + 1;
        questions.push(`已知兩個連續奇數的乘積為 ${a * b}，求這兩數。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${a} 與 ${b}`,
          `設兩連續奇數為 \\(x\\) 與 \\(x+2\\)，由 \\(x(x+2)=${a * b}\\) 解得正數解，因此兩數為 ${a} 與 ${b}。`
        );
        continue;
      }
      if (mode === 2) {
        const n = randInt(4, 10);
        const a = 2 * n - 2;
        const b = 2 * n;
        const c = 2 * n + 2;
        questions.push(`三個連續偶數的平方和為 ${a * a + b * b + c * c}，求此三數。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${a}、${b}、${c}`,
          `設三個連續偶數為 \\(x-2,x,x+2\\)，平方和為 ${a * a + b * b + c * c}，解得 \\(x=${b}\\)，所以三數為 ${a}、${b}、${c}。`
        );
        continue;
      }
      if (mode === 3) {
        const x = randInt(4, 12);
        const rhs = x * x - 3 * x;
        questions.push(`某正數的平方減去該數的 3 倍，結果為 ${rhs}，求此數。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${x}`,
          `設此數為 \\(x\\)，依題意列式並解二次方程，可得符合題目設定的數為 ${x}。`
        );
        continue;
      }
      const x = randInt(2, 6);
      const s = addFraction(makeFraction(x, 1), makeFraction(1, x));
      questions.push(`已知一正數與其倒數的和為 $${fractionToLatex(s)}$，求此數。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${x}\\) 或 \\(${formatFraction(1, x)}\\)`,
        `設此正數為 \\(t\\)，則 \\(t+\\frac{1}{t}=${fractionToLatex(s)}\\)。同乘 \\(t\\) 後解二次方程，得 \\(t=${x}\\) 或 \\(t=${formatFraction(1, x)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ343GeometryAreaWordSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const w = randInt(2, 10);
        const d = randInt(2, 6);
        const l = w + d;
        questions.push(`有一長方形，長比寬多 ${d} 公分，面積為 ${l * w} 平方公分，求長與寬。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `長 ${l} 公分，寬 ${w} 公分`,
          `設寬為 \\(x\\) 公分，長為 \\(x+${d}\\) 公分，列式 \\(x(x+${d})=${l * w}\\)，取正值可得寬 ${w} 公分、長 ${l} 公分。`
        );
        continue;
      }
      if (mode === 1) {
        const s = randInt(2, 8);
        const d = randInt(2, 5);
        const big = s + d;
        questions.push(`大小兩個正方形邊長相差 ${d} 公分，面積和為 ${big * big + s * s} 平方公分，求兩邊長。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${big} 公分與 ${s} 公分`,
          `設小正方形邊長為 \\(x\\)，大正方形邊長為 \\(x+${d}\\)，由 \\(x^2+(x+${d})^2=${big * big + s * s}\\) 解得正值。`
        );
        continue;
      }
      if (mode === 2) {
        const k = randInt(2, 5);
        const a = 3 * k,
          b = 4 * k,
          c = 5 * k;
        questions.push(`一直角三角形三邊長比為 3:4:5，且周長為 ${a + b + c}，求三邊長。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${a}、${b}、${c}`,
          `設三邊長為 \\(3t,4t,5t\\)，由周長 \\(12t=${a + b + c}\\) 得 \\(t=${k}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const x = randInt(7, 20);
        const remain = x * x - 12;
        questions.push(
          `從邊長為 x 的正方形紙片中剪去一個長 4、寬 3 的小長方形後，剩餘面積為 ${remain} 平方公分，求 x。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(x=${x}\\)`,
          `由剩餘面積得 \\(x^2-12=${remain}\\)，所以 \\(x^2=${x * x}\\)，取正長度 \\(x=${x}\\)。`
        );
        continue;
      }
      const h = randInt(4, 12);
      const d = randInt(2, 6);
      const b = h - d;
      const area = (b * h) / 2;
      questions.push(`某三角形底邊比高短 ${d} 公分，面積為 ${area} 平方公分，求底與高。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `底 ${b} 公分，高 ${h} 公分`,
        `設高為 \\(x\\) 公分，底為 \\(x-${d}\\) 公分，由 \\(\\frac{x(x-${d})}{2}=${formatDecimalValue(area)}\\) 解得正值。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ343BusinessWordSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const baseN = 30,
          baseP = 5000,
          dec = 100;
        const t = randInt(10, 20);
        const n = baseN + t;
        const rev = n * (baseP - dec * t);
        questions.push(
          `預定人數 ${baseN} 人、每人收費 ${baseP} 元；每增加 1 人，每人可減收 ${dec} 元。已知實際參加人數至少 40 人，若總收入為 ${rev} 元，求參加人數。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${n} 人`,
          `設增加 \\(t\\) 人，收入為 \\((30+t)(5000-100t)=${rev}\\)，解得符合題意的 \\(t=${t}\\)，所以共有 ${n} 人。`
        );
        continue;
      }
      if (mode === 1) {
        const cost = 160;
        const spoil = randInt(3, 6);
        const profitPerKg = [4, 5, 8, 10][randInt(0, 3)];
        const minKg = Math.ceil(cost / profitPerKg) + spoil + 2;
        const x = randInt(minKg, minKg + 35);
        const sellable = x - spoil;
        const totalProfit = sellable * profitPerKg - cost;
        questions.push(
          `某攤販處理一批水果，其中 ${spoil} 公斤損壞不能賣，另有固定成本 ${cost} 元；可售出的水果每公斤淨賺 ${profitPerKg} 元，最後淨利 ${totalProfit} 元，求原本有多少公斤水果。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${x} 公斤`,
          `設原本有 \\(x\\) 公斤，可售出 \\(x-${spoil}\\) 公斤。依淨利列式：\\(${profitPerKg}(x-${spoil})-${cost}=${totalProfit}\\)，解得 \\(x=${x}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const unit = 280,
          gate = 15,
          dec = 5;
        const q = randInt(18, 30);
        const total = q * (unit - (q - gate) * dec);
        questions.push(
          `班服每件 ${unit} 元；若超過 ${gate} 件，超過的每多 1 件每件再便宜 ${dec} 元。已知購買數量不超過 40 件，總金額為 ${total} 元，求購買數量。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${q} 件`,
          `設購買 \\(q\\) 件，總金額為 \\(q[${unit}-${dec}(q-${gate})]=${total}\\)，解得符合超過 ${gate} 件條件的 \\(q=${q}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const p0 = 220,
          n0 = 1800,
          up = 10;
        const t = randInt(20, 50);
        const price = p0 - t;
        const qty = n0 + up * t;
        const revenue = price * qty;
        questions.push(`票價 ${p0} 元可賣 ${n0} 張；每降價 1 元可多賣 ${up} 張。已知票價至少降 20 元，若收入為 ${revenue} 元，求票價。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${price} 元`,
          `設降價 \\(t\\) 元，收入為 \\((${p0}-t)(${n0}+${up}t)=${revenue}\\)，解得符合設定的 \\(t=${t}\\)，所以票價為 ${price} 元。`
        );
        continue;
      }
      const p0 = 80,
        n0 = 100,
        addBuy = 25;
      const t = randInt(1, 2);
      const price = p0 - 10 * t;
      const qty = n0 + addBuy * t;
      const rev = price * qty;
      questions.push(
        `原本每件 ${p0} 元時有 ${n0} 人購買；若每降價 10 元，購買者增加 ${addBuy} 人。已知購買者增加不超過 50 人，若收入要達 ${rev} 元，應訂價多少？`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${price} 元`,
        `設降價 \\(10t\\) 元，收入為 \\((${p0}-10t)(${n0}+${addBuy}t)=${rev}\\)，解得 \\(t=${t}\\)，所以訂價為 ${price} 元。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function formatJ113PolyTerm(coeff, text) {
    if (coeff === 0) return null;
    const abs = Math.abs(coeff);
    const body = text ? `${abs === 1 ? '' : abs}${text}` : `${abs}`;
    return coeff < 0 ? `-${body}` : body;
  }

  function joinJ113PolyTerms(terms) {
    const filtered = terms.filter(Boolean);
    if (!filtered.length) return '0';
    return filtered
      .map((term, index) => {
        if (index === 0) return term;
        return term.startsWith('-') ? `- ${term.slice(1)}` : `+ ${term}`;
      })
      .join(' ');
  }

  function formatJ113LinearFactor(xCoeff, yCoeff, constant) {
    return joinJ113PolyTerms([
      formatJ113PolyTerm(xCoeff, 'x'),
      formatJ113PolyTerm(yCoeff, 'y'),
      formatJ113PolyTerm(constant, ''),
    ]);
  }

  function buildJ113BiquadraticSplitSquareFactoringSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 4) {
        const n = randInt(2, 4);
        const high = `x^${4 * n}`;
        const mid = `x^${2 * n}`;
        const low = `x^${n}`;
        const f1 = joinJ113PolyTerms([
          formatJ113PolyTerm(1, mid),
          formatJ113PolyTerm(1, low),
          formatJ113PolyTerm(1, ''),
        ]);
        const f2 = joinJ113PolyTerms([
          formatJ113PolyTerm(1, mid),
          formatJ113PolyTerm(-1, low),
          formatJ113PolyTerm(1, ''),
        ]);
        questions.push(`因式分解 \\(${high} + ${mid} + 1\\)。`);
        answers.push(
          `簡答：\\((${f1})(${f2})\\)。過程：令 \\(y=${low}\\)，則原式為 \\(y^4+y^2+1\\)。補上並扣除 \\(y^2\\)，得 \\((y^2+1)^2-y^2\\)，再用平方差分解並代回。`
        );
        continue;
      }
      if (mode === 2) {
        const r = randInt(2, 5);
        const p = 2 * r * r;
        const poly = joinJ113PolyTerms([formatJ113PolyTerm(1, 'x^4'), formatJ113PolyTerm(p * p, '')]);
        const f1 = joinJ113PolyTerms([
          formatJ113PolyTerm(1, 'x^2'),
          formatJ113PolyTerm(2 * r, 'x'),
          formatJ113PolyTerm(p, ''),
        ]);
        const f2 = joinJ113PolyTerms([
          formatJ113PolyTerm(1, 'x^2'),
          formatJ113PolyTerm(-2 * r, 'x'),
          formatJ113PolyTerm(p, ''),
        ]);
        questions.push(`因式分解 \\(${poly}\\)。（提示：補上 \\(${2 * p}x^2\\) 並扣除）`);
        answers.push(
          `簡答：\\((${f1})(${f2})\\)。過程：\\(${poly}=(x^2+${p})^2-${2 * p}x^2=(x^2+${p})^2-(${2 * r}x)^2\\)，所以分解為 \\((${f1})(${f2})\\)。`
        );
        continue;
      }
      const variable = mode === 1 ? 'a' : 'x';
      const leadCoeff = mode === 3 ? randInt(2, 5) : 1;
      let p = randInt(1, 6);
      let q = randInt(1, 5);
      let discriminant = q * q - 4 * leadCoeff * p;
      while (discriminant >= 0 && isPerfectSquare(discriminant)) {
        p = randInt(1, 6);
        q = randInt(1, 5);
        discriminant = q * q - 4 * leadCoeff * p;
      }
      const middle = 2 * leadCoeff * p - q * q;
      const poly = joinJ113PolyTerms([
        formatJ113PolyTerm(leadCoeff * leadCoeff, `${variable}^4`),
        formatJ113PolyTerm(middle, `${variable}^2`),
        formatJ113PolyTerm(p * p, ''),
      ]);
      const f1 = joinJ113PolyTerms([
        formatJ113PolyTerm(leadCoeff, `${variable}^2`),
        formatJ113PolyTerm(q, variable),
        formatJ113PolyTerm(p, ''),
      ]);
      const f2 = joinJ113PolyTerms([
        formatJ113PolyTerm(leadCoeff, `${variable}^2`),
        formatJ113PolyTerm(-q, variable),
        formatJ113PolyTerm(p, ''),
      ]);
      const qVarText = q === 1 ? variable : `${q}${variable}`;
      questions.push(`因式分解 \\(${poly}\\)。`);
      answers.push(
        `簡答：\\((${f1})(${f2})\\)。過程：補成 \\((${leadCoeff === 1 ? '' : leadCoeff}${variable}^2+${p})^2-(${qVarText})^2\\)，再用平方差公式分解，得 \\((${f1})(${f2})\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ113BinaryQuadraticCrossFactoringSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      let a = pickNonZero(-4, 4);
      let b = pickNonZero(-5, 5);
      let c = pickNonZero(-6, 6);
      let d = pickNonZero(-4, 4);
      let e = pickNonZero(-5, 5);
      let f = pickNonZero(-6, 6);
      while (a * e === b * d) {
        a = pickNonZero(-4, 4);
        b = pickNonZero(-5, 5);
        d = pickNonZero(-4, 4);
        e = pickNonZero(-5, 5);
      }
      const poly = joinJ113PolyTerms([
        formatJ113PolyTerm(a * d, 'x^2'),
        formatJ113PolyTerm(a * e + b * d, 'xy'),
        formatJ113PolyTerm(b * e, 'y^2'),
        formatJ113PolyTerm(a * f + c * d, 'x'),
        formatJ113PolyTerm(b * f + c * e, 'y'),
        formatJ113PolyTerm(c * f, ''),
      ]);
      const f1 = formatJ113LinearFactor(a, b, c);
      const f2 = formatJ113LinearFactor(d, e, f);
      questions.push(`因式分解 \\(${poly}\\)。`);
      answers.push(
        `簡答：\\((${f1})(${f2})\\)。過程：把二元二次式看成兩個一次式相乘，用雙十字交乘配 \\(x^2,xy,y^2\\) 與 \\(x,y,常數\\) 項，可得 \\((${f1})(${f2})\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ313PolynomialDivisionRegularSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    const toFrac = (num, den = 1) => makeFraction(num, den);
    const pickSimpleFrac = () => {
      const den = [2, 3, 4][randInt(0, 2)];
      const num = pickNonZero(-8, 8);
      return makeFraction(num, den);
    };
    const fracIsZero = (f) => !f || Number(f.num || 0) === 0;
    const fracTerm = (f, power) => {
      if (fracIsZero(f)) return null;
      const sign = Number(f.num) < 0 ? -1 : 1;
      const abs = makeFraction(Math.abs(Number(f.num)), Number(f.den));
      const coefText = fractionToLatex(abs);
      if (power === 0) {
        return sign < 0 ? `-${coefText}` : coefText;
      }
      const xPart = power === 1 ? 'x' : `x^${power}`;
      const coefPart = coefText === '1' ? '' : coefText;
      const body = `${coefPart}${xPart}`;
      return sign < 0 ? `-${body}` : body;
    };
    const joinFracPoly = (terms) => {
      const filtered = terms.filter(Boolean);
      if (!filtered.length) return '0';
      return filtered
        .map((term, index) => {
          if (index === 0) return term;
          return term.startsWith('-') ? `- ${term.slice(1)}` : `+ ${term}`;
        })
        .join(' ');
    };

    while (questions.length < count) {
      const variant = questions.length % 2;

      if (variant === 0) {
        const a = pickNonZero(-4, 4);
        const b = pickNonZero(-6, 6);
        const q2 = toFrac(pickNonZero(-5, 5), 1);
        const q1 = pickSimpleFrac();
        const q0 = pickSimpleFrac();
        const r = pickSimpleFrac();

        const c3 = mulFraction(toFrac(a), q2);
        const c2 = addFraction(mulFraction(toFrac(a), q1), mulFraction(toFrac(b), q2));
        const c1 = addFraction(mulFraction(toFrac(a), q0), mulFraction(toFrac(b), q1));
        const c0 = addFraction(mulFraction(toFrac(b), q0), r);

        const dividend = joinFracPoly([fracTerm(c3, 3), fracTerm(c2, 2), fracTerm(c1, 1), fracTerm(c0, 0)]);
        const divisor = joinFracPoly([fracTerm(toFrac(a), 1), fracTerm(toFrac(b), 0)]);
        const quotient = joinFracPoly([fracTerm(q2, 2), fracTerm(q1, 1), fracTerm(q0, 0)]);
        const remainder = fractionToLatex(r);

       questions.push(`計算：$(${dividend})\\div(${divisor})$。`);
        answers.push(`簡答：商 $${quotient}$，餘 $${remainder}$。過程：依帶餘除法驗算「被除式＝除式×商式＋餘式」。`);
        continue;
      }

      const a = pickNonZero(-3, 3);
      const b = pickNonZero(-5, 5);
      const c = pickNonZero(-6, 6);
      const p = pickSimpleFrac();
      const q = pickSimpleFrac();
      const r1 = pickSimpleFrac();
      const r0 = pickSimpleFrac();

      const c3 = mulFraction(toFrac(a), p);
      const c2 = addFraction(mulFraction(toFrac(a), q), mulFraction(toFrac(b), p));
      const c1 = addFraction(addFraction(mulFraction(toFrac(b), q), mulFraction(toFrac(c), p)), r1);
      const c0 = addFraction(mulFraction(toFrac(c), q), r0);

      const dividend = joinFracPoly([fracTerm(c3, 3), fracTerm(c2, 2), fracTerm(c1, 1), fracTerm(c0, 0)]);
      const divisor = joinFracPoly([fracTerm(toFrac(a), 2), fracTerm(toFrac(b), 1), fracTerm(toFrac(c), 0)]);
      const quotient = joinFracPoly([fracTerm(p, 1), fracTerm(q, 0)]);
      const remainder = joinFracPoly([fracTerm(r1, 1), fracTerm(r0, 0)]);

     questions.push(`計算：$(${dividend})\\div(${divisor})$。`);
      answers.push(`簡答：商 $${quotient}$，餘 $${remainder}$。過程：依帶餘除法驗算「被除式＝除式×商式＋餘式」。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function addPolyCoeffs(a, b) {
    const maxLen = Math.max(a.length, b.length);
    const left = Array(maxLen - a.length)
      .fill(0)
      .concat(a);
    const right = Array(maxLen - b.length)
      .fill(0)
      .concat(b);
    return left.map((value, index) => value + right[index]);
  }

  function evalPoly(coeffs, x) {
    let result = 0;
    const degree = coeffs.length - 1;
    for (let i = 0; i < coeffs.length; i += 1) {
      result += coeffs[i] * x ** (degree - i);
    }
    return result;
  }

  function buildJ313ReverseDivisionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    while (questions.length < count) {
      const variant = questions.length % 3;

      if (variant === 0) {
        const b = pickNonZero(-6, 6);
        const q2 = pickNonZero(-4, 4);
        const q1 = pickNonZero(-7, 7);
        const q0 = pickNonZero(-8, 8);
        const r = pickNonZero(-12, 12);
        const divisor = [1, b];
        const quotient = [q2, q1, q0];
        const dividend = addPolyCoeffs(multiplyPolyCoeffs(divisor, quotient), [r]);
        questions.push(
          `一多項式除以 $(x${b >= 0 ? '+' : ''}${b})$，商式為 $${formatPolynomialFromCoeffs(quotient)}$，餘式為 ${r}，求此多項式。`
        );
        answers.push(`簡答：$${formatPolynomialFromCoeffs(dividend)}$。過程：利用被除式＝除式×商式＋餘式反推。`);
        continue;
      }

      if (variant === 1) {
        const d = pickNonZero(-5, 5);
        const p2 = pickNonZero(-4, 4);
        const p1 = pickNonZero(-7, 7);
        const p0 = pickNonZero(-9, 9);
        const poly = [p2, p1, p0];
        const product = multiplyPolyCoeffs(poly, [2, d]);
        questions.push(
          `一多項式與 $(2x${d >= 0 ? '+' : ''}${d})$ 的乘積為 $${formatPolynomialFromCoeffs(product)}$，求此多項式。`
        );
        answers.push(`簡答：$${formatPolynomialFromCoeffs(poly)}$。過程：將已知乘積依多項式乘法反推。`);
        continue;
      }

      const p2 = pickNonZero(-4, 4);
      const p1 = pickNonZero(-7, 7);
      const p0 = pickNonZero(-9, 9);
      const q1 = pickNonZero(-4, 4);
      const q0 = pickNonZero(-7, 7);
      const r = pickNonZero(-9, 9);
      const divisor = [q1, q0];
      const quotient = [p2, p1, p0];
      const dividend = addPolyCoeffs(multiplyPolyCoeffs(divisor, quotient), [r]);
      questions.push(
        `已知多項式 $A$ 除以 $${formatPolynomialFromCoeffs(divisor)}$ 的商式為 $${formatPolynomialFromCoeffs(quotient)}$，餘式為 ${r}，求多項式 $A$。`
      );
      answers.push(`簡答：$A=${formatPolynomialFromCoeffs(dividend)}$。過程：利用 $A=除式×商式＋餘式$ 反推。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ313CoeffSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    while (questions.length < count) {
      const variant = questions.length % 3;

      if (variant === 0) {
        const a = pickNonZero(-4, 4);
        const b = pickNonZero(-7, 7);
        const c = pickNonZero(-9, 9);
        const d = randInt(-10, 10);
        const poly = [a, b, c, d];
        questions.push(`求多項式 $f(x)=${formatPolynomialFromCoeffs(poly)}$ 的常數項與各項係數總和。`);
        answers.push(`簡答：常數項為 ${d}，係數總和為 ${evalPoly(poly, 1)}。過程：常數項直接看不含 $x$ 的項；係數總和令 $x=1$。`);
        continue;
      }

      if (variant === 1) {
        const p = pickNonZero(-4, 4);
        const n = [4, 5, 6, 8][randInt(0, 3)];
        questions.push(`若 $A=(x-1)^${n}+(${formatSingleVarExpr(p, 1)})$，求 $A$ 展開後的各項係數總和。`);
        answers.push(`簡答：係數總和為 ${p + 1}。過程：令 $x=1$，則 $(x-1)^${n}=0$。`);
        continue;
      }

      const a = pickNonZero(-4, 4);
      const b = pickNonZero(-6, 6);
      const c = pickNonZero(-8, 8);
      const linear = formatPolynomialFromCoeffs([a, b]);
      questions.push(`已知多項式 $A=(${linear})^2+(${c}-x)(x+1)$，求 $A$ 的各項係數總和。`);
      const value = (a + b) ** 2 + (c - 1) * 2;
      answers.push(`簡答：係數總和為 ${value}。過程：各項係數總和可令 $x=1$，再代入原式計算。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ313RemainderTheoremSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    while (questions.length < count) {
      const variant = questions.length % 3;

      if (variant === 0) {
        const a = pickNonZero(-4, 4);
        const poly = [pickNonZero(-3, 3), randInt(-6, 6), randInt(-7, 7), randInt(-9, 9)];
        questions.push(
          `不經除法，求 $${formatPolynomialFromCoeffs(poly)}$ 除以 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 的餘數。`
        );
        answers.push(`簡答：餘數為 ${evalPoly(poly, a)}。過程：由餘式定理，除以 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 的餘數為 $f(${a})$。`);
        continue;
      }

      if (variant === 1) {
        const a = pickNonZero(-5, 5);
        const r = pickNonZero(-9, 9);
        const m = pickNonZero(-4, 4);
        const n = pickNonZero(-8, 8);
        const shiftText = n === 0 ? '' : `${n >= 0 ? '+' : ''}${n}`;
        const scaleText = m === 1 ? 'A' : m === -1 ? '-A' : `${m}A`;
        questions.push(
          `已知多項式 $A$ 除以 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 的餘式為 ${r}，求 $( ${scaleText}${shiftText} )$ 除以同一除式的餘式。`
        );
        answers.push(`簡答：餘數為 ${m * r + n}。過程：線性組合的餘數等於原餘數作相同的線性組合。`);
        continue;
      }

      const a = pickNonZero(-4, 4);
      const p = pickNonZero(-5, 5);
      const q = pickNonZero(-7, 7);
      const c = randInt(-9, 9);
      const quadratic = formatCoeffTerm(p, 'x', 2);
      const linear = formatCoeffTerm(q, 'x', 1);
      questions.push(`若多項式 $${quadratic}${linear.startsWith('-') ? '' : '+'}${linear}+k$ 能被 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 整除，求 $k$。`);
      const k = -(p * a * a + q * a);
      answers.push(`簡答：$k=${k}$。過程：可整除表示代入因式的零點後，多項式值為 0。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ313FactorTheoremSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    while (questions.length < count) {
      const variant = questions.length % 3;

      if (variant === 0) {
        const a = pickNonZero(-4, 4);
        const poly = [pickNonZero(-3, 3), randInt(-6, 6), randInt(-8, 8), randInt(-10, 10)];
        const value = evalPoly(poly, a);
        questions.push(
          `判斷 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 是否為 $${formatPolynomialFromCoeffs(poly)}$ 的因式。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          value === 0 ? '是因式' : '不是因式',
          `簡答：${value === 0 ? '是因式' : '不是因式'}。過程：代入 $x=${a}$ 得 $f(${a})=${value}$。`
        );
        continue;
      }

      if (variant === 1) {
        const a = pickNonZero(-4, 4);
        const p = pickNonZero(-4, 4);
        const q = pickNonZero(-7, 7);
        const m = -(p * a * a + q) / a;
        if (!Number.isInteger(m)) continue;
        const lead = p === 1 ? 'x^2' : p === -1 ? '-x^2' : `${p}x^2`;
        questions.push(
          `已知 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 為 $${lead}+mx${q >= 0 ? '+' : ''}${q}$ 的因式，求 $m$。`
        );
        answers.push(`簡答：$m=${m}$。過程：因式的零點代入多項式後，函數值必須為 0。`);
        continue;
      }

      const u = pickNonZero(-3, 3);
      const v = pickNonZero(-4, 4);
      const p = 1;
      const tail = randInt(-8, 8);
      const fx = multiplyPolyCoeffs([1, -u], [1, -v]);
      const cubic = multiplyPolyCoeffs([p, tail], fx);
      const m = cubic[1];
      const n = cubic[2];
      const constantText = cubic[3] === 0 ? '' : `${cubic[3] >= 0 ? '+' : ''}${cubic[3]}`;
      questions.push(
        `若 $(x${u >= 0 ? '-' : '+'}${Math.abs(u)})$ 與 $(x${v >= 0 ? '-' : '+'}${Math.abs(v)})$ 皆為 $x^3+mx^2+nx${constantText}$ 的因式，求 $m,n$。`
      );
      answers.push(`簡答：$m=${m},\\ n=${n}$。過程：將兩個已知零點代入，聯立兩式求係數。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ312PolynomialAddSubSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const a1 = pickNonZero(-6, 6);
        const b1 = pickNonZero(-8, 8);
        const c1 = randInt(-9, 9);
        const a2 = pickNonZero(-6, 6);
        const b2 = pickNonZero(-8, 8);
        const c2 = randInt(-9, 9);
        const p1 = formatPolynomialFromCoeffs([a1, b1, c1]);
        const p2 = formatPolynomialFromCoeffs([a2, b2, c2]);
        const ans = formatPolynomialFromCoeffs([a1 + a2, b1 + b2, c1 + c2]);
        questions.push(`計算：$(${p1})+(${p2})$。`);
        answers.push(`簡答：$${ans}$。過程：把同類項的係數相加，再依次寫成標準式。`);
        continue;
      }

      if (variant === 1) {
        const a1 = pickNonZero(-6, 6);
        const b1 = pickNonZero(-8, 8);
        const c1 = randInt(-9, 9);
        const a2 = pickNonZero(-6, 6);
        const b2 = pickNonZero(-8, 8);
        const c2 = randInt(-9, 9);
        const p1 = formatPolynomialFromCoeffs([a1, b1, c1]);
        const p2 = formatPolynomialFromCoeffs([a2, b2, c2]);
        const ans = formatPolynomialFromCoeffs([a1 - a2, b1 - b2, c1 - c2]);
        questions.push(`計算：$(${p1})-(${p2})$。`);
        answers.push(`簡答：$${ans}$。過程：先將減號分配到第二個括號內，再合併同類項。`);
        continue;
      }

      const k1 = pickNonZero(2, 4);
      const k2 = pickNonZero(2, 4);
      const a1 = pickNonZero(-4, 4);
      const b1 = pickNonZero(-6, 6);
      const c1 = randInt(-8, 8);
      const a2 = pickNonZero(-4, 4);
      const b2 = pickNonZero(-6, 6);
      const c2 = randInt(-8, 8);
      const p1 = formatPolynomialFromCoeffs([a1, b1, c1]);
      const p2 = formatPolynomialFromCoeffs([a2, b2, c2]);
      const ans = formatPolynomialFromCoeffs([k1 * a1 - k2 * a2, k1 * b1 - k2 * b2, k1 * c1 - k2 * c2]);
      questions.push(`化簡：$${k1}(${p1})-${k2}(${p2})$。`);
      answers.push(`簡答：$${ans}$。過程：先分配括號外的係數並處理減號，再合併同類項。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ312DegreeConstraintSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const p = pickNonZero(-6, 6);
        const q = pickNonZero(-8, 8);
        const r = randInt(-9, 9);
        const qTerm = formatCoeffTerm(q, 'x', 1);
        const constantTerm = r === 0 ? '' : `${r >= 0 ? '+' : ''}${r}`;
        questions.push(
          `若多項式 $(a${p >= 0 ? '+' : ''}${p})x^2${qTerm.startsWith('-') ? '' : '+'}${qTerm}${constantTerm}$ 是一次多項式，求 $a$。`
        );
        answers.push(`簡答：$a=${-p}$。過程：一次多項式的二次項係數必須為 0。`);
        continue;
      }

      if (variant === 1) {
        const m = pickNonZero(-5, 5);
        const c = randInt(-9, 9);
        const constantTerm = c === 0 ? '' : `${c >= 0 ? '+' : ''}${c}`;
        const polynomial = `(${formatPolynomialFromCoeffs([1, m], 'a')})x^3+x${constantTerm}`;
        questions.push(
          `若多項式 $${polynomial}$ 是一次多項式，求 $a$。`
        );
        answers.push(`簡答：$a=${-m}$。過程：一次多項式的三次項係數必須為 0。`);
        continue;
      }

      const aValue = pickNonZero(-4, 4);
      const u = -aValue;
      const v = -2 * aValue;
      const w = -3 * aValue;
      const zeroPolynomial = `(${formatPolynomialFromCoeffs([1, u], 'a')})x^2+(${formatPolynomialFromCoeffs([2, v], 'a')})x+(${formatPolynomialFromCoeffs([3, w], 'a')})`;
      questions.push(
        `若多項式 $${zeroPolynomial}$ 是零多項式，求 $a$。`
      );
      answers.push(`簡答：$a=${aValue}$。過程：零多項式的每一項係數都必須為 0。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ312PolynomialReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const a = pickNonZero(-4, 4);
        const b = randInt(-8, 8);
        const c = randInt(-9, 9);
        const u = pickNonZero(-4, 4);
        const v = randInt(-8, 8);
        const w = randInt(-9, 9);
        const A = formatPolynomialFromCoeffs([a, b, c]);
        const B = formatPolynomialFromCoeffs([u, v, w]);
        const sum = formatPolynomialFromCoeffs([a + u, b + v, c + w]);
        questions.push(`已知多項式 $A$ 與 $${B}$ 的和為 $${sum}$，求多項式 $A$。`);
        answers.push(`簡答：$A=${A}$。過程：由「$A$ 加上已知多項式等於和」移項反推。`);
        continue;
      }

      if (variant === 1) {
        const b2 = pickNonZero(-4, 4);
        const b1 = randInt(-8, 8);
        const b0 = randInt(-9, 9);
        const c2 = pickNonZero(-4, 4);
        const c1 = randInt(-8, 8);
        const c0 = randInt(-9, 9);
        const B = formatPolynomialFromCoeffs([b2, b1, b0]);
        const C = formatPolynomialFromCoeffs([c2, c1, c0]);
        const A = formatPolynomialFromCoeffs([b2 + c2, b1 + c1, b0 + c0]);
        questions.push(`若 $(A)-(${B})=${C}$，求多項式 $A$。`);
        answers.push(`簡答：$A=${A}$。過程：等式兩邊同時加上括號中的多項式。`);
        continue;
      }

      const a2 = pickNonZero(-4, 4);
      const a1 = randInt(-8, 8);
      const a0 = randInt(-9, 9);
      const b2 = pickNonZero(-4, 4);
      const b1 = randInt(-8, 8);
      const b0 = randInt(-9, 9);
      const A = formatPolynomialFromCoeffs([a2, a1, a0]);
      const B = formatPolynomialFromCoeffs([b2, b1, b0]);
      const result = formatPolynomialFromCoeffs([2 * a2 - 3 * b2, 2 * a1 - 3 * b1, 2 * a0 - 3 * b0]);
      questions.push(`設 $A=${A}$、$B=${B}$，求 $2A-3B$。`);
      answers.push(`簡答：$${result}$。過程：先分別計算 $2A$、$3B$，再逐項相減。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildMonomialTimesMonomialQA() {
    const c1 = pickNonZero(-6, 6);
    const c2 = pickNonZero(-6, 6);
    const p1 = randInt(0, 4);
    const p2 = randInt(0, 4);
    const monomialText = (coef, power) => {
      if (power === 0) return `${coef}`;
      const c = coef === 1 ? '' : coef === -1 ? '-' : `${coef}`;
      return `${c}x${power === 1 ? '' : `^${power}`}`;
    };
    const left = monomialText(c1, p1);
    const right = monomialText(c2, p2);
    const simpleAns =
      p1 + p2 === 0
        ? `${c1 * c2}`
        : `${c1 * c2 === 1 ? '' : c1 * c2 === -1 ? '-' : c1 * c2}x${p1 + p2 === 1 ? '' : `^${p1 + p2}`}`;
   return {
     question: `計算：$(${left})\\times(${right})$。`,
      answer: `簡答：$${simpleAns}$。過程：單項式相乘時，係數相乘，同底數的指數相加。`,
   };
  }

  function buildMonomialTimesPolyQA(polyDegree = 1) {
    const k = pickNonZero(-5, 5);
    const kp = randInt(0, 2);
    const lead = pickNonZero(-4, 4);
    const mid = pickNonZero(-6, 6);
    const tail = randInt(-8, 8);
    let coeffs;
    if (polyDegree === 1) coeffs = [lead, mid];
    else coeffs = [lead, mid, tail];
    const mStr =
      kp === 0
        ? k === 1
          ? ''
          : k === -1
            ? '-'
            : `${k}`
        : `${k === 1 ? '' : k === -1 ? '-' : k}x${kp === 1 ? '' : `^${kp}`}`;
    const pStr = formatPolynomialFromCoeffs(coeffs);
    const resultCoeffs = coeffs.map((value) => value * k);
    const resultDegree = polyDegree + kp;
    const full = Array(resultDegree + 1).fill(0);
    for (let i = 0; i < resultCoeffs.length; i += 1) {
      full[i] = resultCoeffs[i];
    }
    const result = formatPolynomialFromCoeffs(full);
   return {
     question: `化簡：$${mStr}(${pStr})$。`,
      answer: `簡答：$${result}$。過程：將單項式分配到括號中的每一項，再合併同類項。`,
   };
  }

  function multiplyPolyCoeffs(a, b) {
    const out = Array(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i += 1) {
      for (let j = 0; j < b.length; j += 1) {
        out[i + j] += a[i] * b[j];
      }
    }
    return out;
  }

  function buildPolyTimesPolyQA(leftDegree, rightDegree) {
    const mkCoeffs = (deg) => {
      if (deg === 1) return [pickNonZero(-4, 4), randInt(-6, 6)];
      return [pickNonZero(-3, 3), randInt(-5, 5), randInt(-6, 6)];
    };
    const left = mkCoeffs(leftDegree);
    const right = mkCoeffs(rightDegree);
    const q = `計算：$(${formatPolynomialFromCoeffs(left)})(${formatPolynomialFromCoeffs(right)})$。`;
   const a = formatPolynomialFromCoeffs(multiplyPolyCoeffs(left, right));
    return { question: q, answer: `簡答：$${a}$。過程：以分配律讓第一個多項式的每一項乘上第二個多項式，再合併同類項。` };
  }

  function dividePolyByMonomialWithRemainder(coeffs, divisorCoef, divisorPower) {
    const degree = coeffs.length - 1;
    const quotient = [];
    const remainderTerms = [];
    for (let i = 0; i < coeffs.length; i += 1) {
      const power = degree - i;
      const coef = coeffs[i];
      if (power >= divisorPower && coef % divisorCoef === 0) {
        quotient.push({
          coef: coef / divisorCoef,
          power: power - divisorPower,
        });
      } else if (coef !== 0) {
        remainderTerms.push({
          coef,
          power,
        });
      }
    }
    const termToText = ({ coef, power }) => {
      if (power === 0) return `${coef}`;
      const c = coef === 1 ? '' : coef === -1 ? '-' : `${coef}`;
      return `${c}x${power === 1 ? '' : `^${power}`}`;
    };
    const joinTerms = (terms) => {
      if (!terms.length) return '0';
      return terms
        .map((term, idx) => {
          const t = termToText(term);
          if (idx === 0) return t;
          return t.startsWith('-') ? `- ${t.slice(1)}` : `+ ${t}`;
        })
        .join(' ');
    };
    return {
      quotient: joinTerms(quotient),
      remainder: joinTerms(remainderTerms),
    };
  }

  function buildPolyDivideMonomialQA(kind = 0) {
    if (kind === 0) {
      const c2 = pickNonZero(1, 6);
      const c1 = c2 * pickNonZero(-8, 8);
      const p1 = randInt(2, 6);
      const p2 = randInt(1, p1);
      const left = `${c1 === 1 ? '' : c1 === -1 ? '-' : c1}x^${p1}`;
      const right = `${c2 === 1 ? '' : c2 === -1 ? '-' : c2}x${p2 === 1 ? '' : `^${p2}`}`;
      const qCoef = c1 / c2;
      const qPow = p1 - p2;
      const ans =
        qPow === 0 ? `${qCoef}` : `${qCoef === 1 ? '' : qCoef === -1 ? '-' : qCoef}x${qPow === 1 ? '' : `^${qPow}`}`;
     return {
       question: `計算：$(${left})\\div(${right})$。`,
        answer: `簡答：$${ans}$。過程：單項式相除時，係數相除，同底數的指數相減。`,
     };
    }

    if (kind === 1) {
      const divisorCoef = [2, 3, 4, 5][randInt(0, 3)];
      const coeffA = divisorCoef * pickNonZero(-6, 6);
      const coeffB = divisorCoef * pickNonZero(-6, 6);
      const divisor = `${divisorCoef}x`;
      const left = formatPolynomialFromCoeffs([coeffA, coeffB, 0]);
      const { quotient } = dividePolyByMonomialWithRemainder([coeffA, coeffB, 0], divisorCoef, 1);
     return {
       question: `計算：$(${left})\\div(${divisor})$。`,
        answer: `簡答：$${quotient}$。過程：將多項式的每一項分別除以單項式。`,
     };
    }

    const divisorCoef = [2, 3, 4, 5][randInt(0, 3)];
    const c2 = divisorCoef * pickNonZero(-5, 5);
    const c1 = divisorCoef * pickNonZero(-5, 5);
    const c0 = pickNonZero(-9, 9);
    const left = formatPolynomialFromCoeffs([c2, c1, c0]);
    const divisor = `${divisorCoef}x`;
    const { quotient, remainder } = dividePolyByMonomialWithRemainder([c2, c1, c0], divisorCoef, 1);
   return {
     question: `計算：$(${left})\\div(${divisor})$。`,
      answer: `簡答：商 $${quotient}$，餘 $${remainder}$。過程：可整除的各項分別相除；次數不足的項保留為餘式。`,
   };
  }

  function buildJ312MulEasyMonoMonoSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const qa = buildMonomialTimesMonomialQA();
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ312MulEasyMonoLinearSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const qa = buildMonomialTimesPolyQA(1);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ312MulEasyMonoQuadraticSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const qa = buildMonomialTimesPolyQA(2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ312MulEasyMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const qa =
        i % 3 === 0
          ? buildMonomialTimesMonomialQA()
          : i % 3 === 1
            ? buildMonomialTimesPolyQA(1)
            : buildMonomialTimesPolyQA(2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ312MulAdvLinearLinearSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyTimesPolyQA(1, 1);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ312MulAdvLinearQuadraticSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyTimesPolyQA(1, 2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ312MulAdvQuadraticQuadraticSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyTimesPolyQA(2, 2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ312MulAdvMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const qa =
        i % 3 === 0
          ? buildPolyTimesPolyQA(1, 1)
          : i % 3 === 1
            ? buildPolyTimesPolyQA(1, 2)
            : buildPolyTimesPolyQA(2, 2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ312DivMonomialByMonomialSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyDivideMonomialQA(0);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ312DivBinomialByMonomialSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyDivideMonomialQA(1);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ312DivTrinomialByMonomialSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyDivideMonomialQA(2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ312DivMonomialMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyDivideMonomialQA(i % 3);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildBinomialQuestions(count, mode, kind) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      if (kind === 'variable') {
        const a = randInt(1, 6);
        const b = randInt(1, 9);
        const middle = 2 * a * b * (mode === 'sum' ? 1 : -1);
        const expanded = formatPolynomialFromCoeffs([a * a, middle, b * b]);
        questions.push(`展開：$(${a === 1 ? 'x' : `${a}x`}${mode === 'sum' ? '+' : '-'}${b})^2$。`);
        answers.push(
          `利用乘法公式：$(${a === 1 ? 'x' : `${a}x`}${mode === 'sum' ? '+' : '-'}${b})^2=${expanded}$。`
        );
        continue;
      }

      if (kind === 'fraction') {
        const a = makeFraction(randInt(3, 9), randInt(2, 6));
        const b = makeFraction(randInt(1, 5), randInt(2, 6));
        const sum = mode === 'sum' ? addFraction(a, b) : subFraction(a, b);
        const result = mulFraction(sum, sum);
        const aText = fractionToLatex(a);
        const bText = fractionToLatex(b);
        questions.push(`展開：$\\left(${aText}${mode === 'sum' ? '+' : '-'}${bText}\\right)^2$。`);
        answers.push(
          `先用公式：$\\left(${aText}${mode === 'sum' ? '+' : '-'}${bText}\\right)^2=${aText}^2${mode === 'sum' ? '+' : '-'}2\\cdot${aText}\\cdot${bText}+${bText}^2=${fractionToLatex(result)}$。`
        );
        continue;
      }

      const isDecimal = kind === 'decimal';
      const a = isDecimal ? randInt(10, 80) / 10 : randInt(2, 15);
      const b = isDecimal ? randInt(1, 30) / 10 : randInt(1, 12);
      const aText = formatDecimalValue(a);
      const bText = formatDecimalValue(b);
      const result = Math.pow(mode === 'sum' ? a + b : a - b, 2);
      questions.push(`展開：$(${aText}${mode === 'sum' ? '+' : '-'}${bText})^2$。`);
      answers.push(
        `利用乘法公式：$(${aText}${mode === 'sum' ? '+' : '-'}${bText})^2=${aText}^2${mode === 'sum' ? '+' : '-'}2\\cdot${aText}\\cdot${bText}+${bText}^2=${formatDecimalValue(result)}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildDifferenceOfSquaresQuestions(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 6);
      const b = randInt(1, 9);
      const ax = a === 1 ? 'x' : `${a}x`;
      const lead = a * a === 1 ? 'x^2' : `${a * a}x^2`;
      questions.push(`展開：$(${ax}+${b})(${ax}-${b})$。`);
      answers.push(`利用平方差公式：$(A+B)(A-B)=A^2-B^2$，其中 $A=${ax},\\ B=${b}$，所以結果是 $${lead}-${b * b}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildFactorizationQuestions(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 6);
      const b = randInt(1, 9);
      const ax = a === 1 ? 'x' : `${a}x`;
      const lead = a * a === 1 ? 'x^2' : `${a * a}x^2`;
      questions.push(`分解因式：$${lead}-${b * b}$。`);
      answers.push(`這是平方差：$${lead}-${b * b}=(${ax}+${b})(${ax}-${b})$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ311FormulaMixedSet(count, kind) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const center = 100;

    function buildNumberLikePair(currentKind) {
      if (currentKind === 'fraction') {
        const deltaOptions = [
          makeFraction(1, 2),
          makeFraction(2, 3),
          makeFraction(3, 5),
          makeFraction(3, 4),
          makeFraction(5, 6),
          makeFraction(1, 3),
          makeFraction(1, 4),
          makeFraction(1, 5),
          makeFraction(2, 5),
          makeFraction(4, 5),
        ];
        const delta = deltaOptions[randInt(0, deltaOptions.length - 1)];
        const left = addFraction(makeFraction(center, 1), delta);
        const right = subFraction(makeFraction(center, 1), delta);
        return {
          centerText: '100',
          deltaText: fractionToLatex(delta),
          leftText: fractionToLatex(left, true),
          rightText: fractionToLatex(right, true),
          leftSquare: mulFraction(left, left),
          rightSquare: mulFraction(right, right),
          conjugate: subFraction(
            mulFraction(makeFraction(center, 1), makeFraction(center, 1)),
            mulFraction(delta, delta)
          ),
          squareDifference: mulFraction(makeFraction(400, 1), delta),
          formatResult(value) {
            return fractionToLatex(value, true);
          },
        };
      }

      if (currentKind === 'decimal') {
        const delta = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1][randInt(0, 9)];
        const left = center + delta;
        const right = center - delta;
        return {
          centerText: '100',
          deltaText: formatDecimalValue(delta),
          leftText: formatDecimalValue(left),
          rightText: formatDecimalValue(right),
          leftSquare: left * left,
          rightSquare: right * right,
          conjugate: center * center - delta * delta,
          squareDifference: 400 * delta,
          formatResult(value) {
            return formatDecimalValue(value);
          },
        };
      }

      const delta = randInt(1, 10);
      const left = center + delta;
      const right = center - delta;
      return {
        centerText: '100',
        deltaText: `${delta}`,
        leftText: `${left}`,
        rightText: `${right}`,
        leftSquare: left * left,
        rightSquare: right * right,
        conjugate: center * center - delta * delta,
        squareDifference: 400 * delta,
        formatResult(value) {
          return `${value}`;
        },
      };
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;
      const currentKind = kind === 'mixed' ? ['integer', 'decimal', 'fraction'][Math.floor((i % 12) / 4)] : kind;
      const pair = buildNumberLikePair(currentKind);

      if (variant === 0) {
        questions.push(`計算：$(${pair.leftText})^2$。`);
        answers.push(
          `簡答：\\(${pair.formatResult(pair.leftSquare)}\\)。過程：把它看成和平方，\\[(${pair.centerText}+${pair.deltaText})^2=${pair.centerText}^2+2\\cdot ${pair.centerText}\\cdot ${pair.deltaText}+(${pair.deltaText})^2=${pair.formatResult(pair.leftSquare)}\\]`
        );
      } else if (variant === 1) {
        questions.push(`計算：$(${pair.rightText})^2$。`);
        answers.push(
          `簡答：\\(${pair.formatResult(pair.rightSquare)}\\)。過程：把它看成差平方，\\[(${pair.centerText}-${pair.deltaText})^2=${pair.centerText}^2-2\\cdot ${pair.centerText}\\cdot ${pair.deltaText}+(${pair.deltaText})^2=${pair.formatResult(pair.rightSquare)}\\]`
        );
      } else if (variant === 2) {
        questions.push(`計算：$(${pair.leftText})\\times(${pair.rightText})$。`);
        answers.push(
          `簡答：\\(${pair.formatResult(pair.conjugate)}\\)。過程：這是平方差，\\[(${pair.centerText}+${pair.deltaText})\\times(${pair.centerText}-${pair.deltaText})=${pair.centerText}^2-(${pair.deltaText})^2=${pair.formatResult(pair.conjugate)}\\]`
        );
      } else {
        questions.push(`計算：$(${pair.leftText})^2-(${pair.rightText})^2$。`);
        answers.push(
          `簡答：\\(${pair.formatResult(pair.squareDifference)}\\)。過程：以平方差分解，\\[(${pair.leftText})^2-(${pair.rightText})^2=(${pair.leftText}+${pair.rightText})(${pair.leftText}-${pair.rightText})=${pair.formatResult(pair.squareDifference)}\\]`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ311VariableFormulaMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    const builders = [
      () => buildBinomialQuestions(1, 'sum', 'variable'),
      () => buildBinomialQuestions(1, 'diff', 'variable'),
      () => buildDifferenceOfSquaresQuestions(1, 'variable'),
      () => buildFactorizationQuestions(1),
    ];

    for (let i = 0; i < count; i += 1) {
      const result = builders[i % builders.length]();
      questions.push(result.questions[0]);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        result.summaryAnswers[0],
        result.answers[0]
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildIdentityIntegerBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-8, 8);
      const b = randInt(-8, 8);
      const sum = a + b;
      const prod = a * b;
      const sqsum = a * a + b * b;
      const diff = a - b;
      if (i % 2 === 0) {
        questions.push(`已知 \\(a+b=${sum}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\)、\\(a-b\\)。`);
        answers.push(
          `\\(ab=\\frac{(a+b)^2-(a^2+b^2)}{2}=\\frac{${sum * sum}-${sqsum}}{2}=${prod}\\)，\\(a-b=${diff}\\) 或 \\(${-diff}\\)。`
        );
      } else {
        questions.push(`已知 \\(ab=${prod}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(a+b\\)、\\(a-b\\)。`);
        answers.push(
          `\\((a+b)^2=${sqsum}+2(${prod})=${sqsum + 2 * prod}\\)，所以 \\(a+b=${sum}\\) 或 \\(${-sum}\\)；\\(a-b=${diff}\\) 或 \\(${-diff}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildSumSqsumToProductSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-8, 8);
      const b = randInt(-8, 8);
      const sum = a + b;
      const sqsum = a * a + b * b;
      const prod = a * b;
      questions.push(`已知 \\(a+b=${sum}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\)。`);
      answers.push(`\\(ab=\\frac{(a+b)^2-(a^2+b^2)}{2}=\\frac{${sum * sum}-${sqsum}}{2}=${prod}\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildDiffSqsumToProductSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-8, 8);
      const b = randInt(-8, 8);
      const diff = a - b;
      const sqsum = a * a + b * b;
      const prod = a * b;
      questions.push(`已知 \\(a-b=${diff}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\)。`);
      answers.push(`\\((a-b)^2=a^2-2ab+b^2\\Rightarrow ab=\\frac{${sqsum}-${diff * diff}}{2}=${prod}\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildIdentitySumProductSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-7, 7);
      const b = randInt(-7, 7);
      const sum = a + b;
      const prod = a * b;
      const sqsum = a * a + b * b;
      const diff2 = (a - b) * (a - b);
      questions.push(`已知 \\(a+b=${sum}\\)、\\(ab=${prod}\\)，求 \\(a^2+b^2\\)、\\((a-b)^2\\)。`);
      answers.push(
        `\\(a^2+b^2=(a+b)^2-2ab=${sum * sum}-2(${prod})=${sqsum}\\)，\\((a-b)^2=(a+b)^2-4ab=${sum * sum}-4(${prod})=${diff2}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildProductSqsumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-7, 7);
      const b = randInt(-7, 7);
      const prod = a * b;
      const sqsum = a * a + b * b;
      const sum = a + b;
      const diff = a - b;
      questions.push(`已知 \\(ab=${prod}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(a+b\\)、\\(a-b\\)。`);
      answers.push(
        `\\((a+b)^2=${sqsum}+2(${prod})=${sqsum + 2 * prod}\\Rightarrow a+b=${sum}\\) 或 \\(${-sum}\\)；\\((a-b)^2=${sqsum}-2(${prod})=${sqsum - 2 * prod}\\Rightarrow a-b=${diff}\\) 或 \\(${-diff}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildSquarePairSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-6, 6);
      const b = randInt(-6, 6);
      const sp = (a + b) * (a + b);
      const sm = (a - b) * (a - b);
      const sqsum = a * a + b * b;
      const prod = a * b;
      questions.push(`已知 \\((a+b)^2=${sp}\\)、\\((a-b)^2=${sm}\\)，求 \\(a^2+b^2\\)、\\(ab\\)。`);
      answers.push(`\\(a^2+b^2=\\frac{${sp}+${sm}}{2}=${sqsum}\\)，\\(ab=\\frac{${sp}-${sm}}{4}=${prod}\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildIdentityPairMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-7, 7);
      const b = randInt(-7, 7);
      const sum = a + b;
      const diff = a - b;
      const sqsum = a * a + b * b;
      const prod = a * b;
      const sumSquare = sum * sum;
      const diffSquare = diff * diff;
      const variant = i % 5;
      if (variant === 0) {
        questions.push(`已知 \\(a+b=${sum}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\) 與 \\(a-b\\)。`);
        answers.push(
          `先由 \\(ab=\\frac{(a+b)^2-(a^2+b^2)}{2}=\\frac{${sumSquare}-${sqsum}}{2}=${prod}\\)。再算 \\((a-b)^2=${sqsum}-2(${prod})=${diffSquare}\\)，所以 \\(a-b=${diff}\\) 或 \\(${-diff}\\)。`
        );
      } else if (variant === 1) {
        questions.push(`已知 \\(a-b=${diff}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\) 與 \\(a+b\\)。`);
        answers.push(
          `先由 \\(ab=\\frac{(a^2+b^2)-(a-b)^2}{2}=\\frac{${sqsum}-${diffSquare}}{2}=${prod}\\)。再算 \\((a+b)^2=${sqsum}+2(${prod})=${sumSquare}\\)，所以 \\(a+b=${sum}\\) 或 \\(${-sum}\\)。`
        );
      } else if (variant === 2) {
        questions.push(`已知 \\(a+b=${sum}\\)、\\(ab=${prod}\\)，求 \\(a^2+b^2\\) 與 \\(a-b\\)。`);
        answers.push(
          `先由 \\(a^2+b^2=(a+b)^2-2ab=${sumSquare}-2(${prod})=${sqsum}\\)。再算 \\((a-b)^2=(a+b)^2-4ab=${sumSquare}-4(${prod})=${diffSquare}\\)，所以 \\(a-b=${diff}\\) 或 \\(${-diff}\\)。`
        );
      } else if (variant === 3) {
        questions.push(`已知 \\(a-b=${diff}\\)、\\(ab=${prod}\\)，求 \\(a^2+b^2\\) 與 \\(a+b\\)。`);
        answers.push(
          `先由 \\(a^2+b^2=(a-b)^2+2ab=${diffSquare}+2(${prod})=${sqsum}\\)。再算 \\((a+b)^2=(a-b)^2+4ab=${diffSquare}+4(${prod})=${sumSquare}\\)，所以 \\(a+b=${sum}\\) 或 \\(${-sum}\\)。`
        );
      } else {
        questions.push(`已知 \\(a^2+b^2=${sqsum}\\)、\\(ab=${prod}\\)，求 \\(a+b\\) 與 \\(a-b\\)。`);
        answers.push(
          `由 \\((a+b)^2=${sqsum}+2(${prod})=${sumSquare}\\)，得 \\(a+b=${sum}\\) 或 \\(${-sum}\\)；由 \\((a-b)^2=${sqsum}-2(${prod})=${diffSquare}\\)，得 \\(a-b=${diff}\\) 或 \\(${-diff}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildIdentityPairAdvancedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-8, 8);
      let b = pickNonZero(-8, 8);
      while (b === a) b = pickNonZero(-8, 8);
      const sum = a + b;
      const diff = a - b;
      const prod = a * b;
      const sqsum = a * a + b * b;
      const sumSquare = sum * sum;
      const diffSquare = diff * diff;
      const variant = i % 5;
      if (variant === 0) {
        questions.push(`已知 \\(a+b=${sum}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\) 與 \\((a-b)^2\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(ab=${prod}\\)，\\((a-b)^2=${diffSquare}\\)`,
          `由 \\(a^2+b^2=(a+b)^2-2ab\\)，得 \\(ab=\\frac{${sumSquare}-${sqsum}}{2}=${prod}\\)。再由 \\((a-b)^2=(a+b)^2-4ab=${sumSquare}-4(${prod})=${diffSquare}\\)。`
        );
      } else if (variant === 1) {
        questions.push(`已知 \\(a-b=${diff}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\) 與 \\((a+b)^2\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(ab=${prod}\\)，\\((a+b)^2=${sumSquare}\\)`,
          `由 \\(a^2+b^2=(a-b)^2+2ab\\)，得 \\(ab=\\frac{${sqsum}-${diffSquare}}{2}=${prod}\\)。再由 \\((a+b)^2=(a-b)^2+4ab=${diffSquare}+4(${prod})=${sumSquare}\\)。`
        );
      } else if (variant === 2) {
        questions.push(`已知 \\(a+b=${sum}\\)、\\(ab=${prod}\\)，求 \\(a^2+b^2\\) 與 \\((a-b)^2\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(a^2+b^2=${sqsum}\\)，\\((a-b)^2=${diffSquare}\\)`,
          `由 \\(a^2+b^2=(a+b)^2-2ab=${sumSquare}-2(${prod})=${sqsum}\\)。再由 \\((a-b)^2=(a+b)^2-4ab=${sumSquare}-4(${prod})=${diffSquare}\\)。`
        );
      } else if (variant === 3) {
        questions.push(`已知 \\(a-b=${diff}\\)、\\(ab=${prod}\\)，求 \\(a^2+b^2\\) 與 \\((a+b)^2\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(a^2+b^2=${sqsum}\\)，\\((a+b)^2=${sumSquare}\\)`,
          `由 \\(a^2+b^2=(a-b)^2+2ab=${diffSquare}+2(${prod})=${sqsum}\\)。再由 \\((a+b)^2=(a-b)^2+4ab=${diffSquare}+4(${prod})=${sumSquare}\\)。`
        );
      } else {
        questions.push(`已知 \\(a^2+b^2=${sqsum}\\)、\\(ab=${prod}\\)，求 \\((a+b)^2\\) 與 \\((a-b)^2\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\((a+b)^2=${sumSquare}\\)，\\((a-b)^2=${diffSquare}\\)`,
          `由 \\((a+b)^2=a^2+b^2+2ab=${sqsum}+2(${prod})=${sumSquare}\\)。再由 \\((a-b)^2=a^2+b^2-2ab=${sqsum}-2(${prod})=${diffSquare}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildLinearCombinationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-6, 6);
      const b = randInt(-6, 6);
      const diff = a - b;
      const prod = a * b;
      const sqsum = a * a + b * b;
      const value = 3 * a * a + 4 * a * b + 3 * b * b;
      questions.push(`已知 \\(a-b=${diff}\\)、\\(ab=${prod}\\)，求 \\(3a^2+4ab+3b^2\\)。`);
      answers.push(
        `\\(a^2+b^2=(a-b)^2+2ab=${diff * diff}+2(${prod})=${sqsum}\\)，所以 \\(3a^2+4ab+3b^2=3(${sqsum})+4(${prod})=${value}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildReciprocalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const val = randInt(3, 8);
      questions.push(`已知 \\(x+\\frac{1}{x}=${val}\\)，求 \\(x^2+\\frac{1}{x^2}\\)。`);
      answers.push(`\\(x^2+\\frac{1}{x^2}=\\left(x+\\frac{1}{x}\\right)^2-2=${val}^2-2=${val * val - 2}\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildReciprocalReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const base = randInt(3, 10);
      questions.push(`已知 \\(x^2+\\frac{1}{x^2}=${base}\\)，求 \\(x+\\frac{1}{x}\\)、\\(x-\\frac{1}{x}\\)。`);
      const plus2 = base + 2;
      const minus2 = base - 2;
      answers.push(
        `\\(\\left(x+\\frac{1}{x}\\right)^2=${plus2}\\Rightarrow x+\\frac{1}{x}=\\pm\\sqrt{${plus2}}\\)，\\(\\left(x-\\frac{1}{x}\\right)^2=${minus2}\\Rightarrow x-\\frac{1}{x}=\\pm\\sqrt{${minus2}}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildReciprocalMixedFractionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 8);
      const b = randInt(1, 8);
      const sum = a + b;
      const prod = a * b;
      const sqsum = a * a + b * b;
      questions.push(
        `已知 \\(a+b=${sum}\\)、\\(ab=${prod}\\)，求 \\(\\frac{1}{a}+\\frac{1}{b}\\)、\\(\\frac{a}{b}+\\frac{b}{a}\\)。`
      );
      answers.push(
        `\\(\\frac1a+\\frac1b=\\frac{a+b}{ab}=\\frac{${sum}}{${prod}}\\)，\\(\\frac ab+\\frac ba=\\frac{a^2+b^2}{ab}=\\frac{${sqsum}}{${prod}}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildMixedAdvancedIdentitySet(count) {
    const banks = [
      () => buildIdentityIntegerBasicSet(1),
      () => buildIdentitySumProductSet(1),
      () => buildReciprocalSet(1),
      () => buildReciprocalReverseSet(1),
    ];

    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const pick = banks[randInt(0, banks.length - 1)]();
      questions.push(...pick.questions);
      answers.push(...pick.answers);
    }
    return { questions, summaryAnswers, answers };
  }

  function formatSingleVarExpr(coef, constant) {
    if (coef === 0) return `${constant}`;
    const term = formatTerm(coef, 'x');
    if (constant === 0) return term;
    return `${term}${constant > 0 ? '+' : ''}${constant}`;
  }

  function normalizeMathSummaryExpression(expression) {
    const text = String(expression || '').trim();
    if (!text) return '';
    const equalCount = (text.match(/=/g) || []).length;
    if (!equalCount) return text;
    const equalIndex = text.lastIndexOf('=');
    const result = text.slice(equalIndex + 1).trim();
    const lhs = text.slice(0, text.indexOf('=')).trim();
    if (!result) return text;
    if (/[,，]|\\/.test(text) && /[a-zA-Z]\s*=/.test(text)) return text;
    if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(lhs)) return text;
    if (/[a-zA-Z]/.test(lhs) && !/^[a-zA-Z][a-zA-Z0-9]*\([^)]*\)$/.test(lhs)) return text;
    if (equalCount > 1 || text.startsWith('=') || /原式/.test(text)) return result;
    return result;
  }

  function normalizeDerivedSummaryFragment(fragment) {
    const text = String(fragment || '').trim().replace(/[。．]+$/, '');
    if (!text) return '';
    const inlineNormalized = text.replace(/\$([^$]+)\$/g, (_, expression) => {
      const normalized = normalizeMathSummaryExpression(expression);
      return `$${normalized || expression}$`;
    });
    const constantAndSumMatch = inlineNormalized.match(/^常數項為\s*([^，,]+)[，,]\s*係數總和為\s*\$([^$]+)\$/);
    if (constantAndSumMatch) {
      return `常數項為 ${constantAndSumMatch[1].trim()}，係數總和為 ${constantAndSumMatch[2].trim()}`;
    }
    const coefficientSumMatch = inlineNormalized.match(/^係數總和為\s*\$([^$]+)\$/);
    if (coefficientSumMatch) return `係數總和為 ${coefficientSumMatch[1].trim()}`;
    const remainderMatch = inlineNormalized.match(/^餘數為\s*\$([^$]+)\$/);
    if (remainderMatch) return `餘數為 ${remainderMatch[1].trim()}`;
    const mathMatches = [...text.matchAll(/\$([^$]+)\$/g)];
    if (/(或|與)/.test(inlineNormalized) && mathMatches.length > 1) return inlineNormalized;
    if (/為/.test(inlineNormalized) && mathMatches.length > 1) return inlineNormalized;
    if (/^(常數項|係數總和|餘數|商|面積|周長|體積|表面積)/.test(inlineNormalized)) {
      return inlineNormalized;
    }
    if (mathMatches.length) {
      const candidate = mathMatches[mathMatches.length - 1][1].trim();
      const normalized = normalizeMathSummaryExpression(candidate);
      if (normalized) return `$${normalized}$`;
    }
    return text;
  }

  function deriveSummaryAnswerFromDetail(detail) {
    const text = String(detail || '')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) return '';

    // Prefer an explicit "簡答：X" / "答案：X" label when present (the vast
    // majority of practice-generator answers are written this way): extract
    // everything up to the next "過程/解析/詳解/說明" label. This must run
    // before the looser heuristics below, which otherwise can grab an
    // unrelated trailing fragment of the *explanation* text (e.g. a sentence
    // ending in "...可得範圍。" gets misread as the answer "範圍").
    const labelMatch = text.match(/(?:簡答|答案)[:：]\s*([\s\S]*?)(?=(?:。|；|\n)?\s*(?:過程|解析|詳解|說明)[:：]|$)/);
    if (labelMatch && labelMatch[1] && labelMatch[1].trim()) {
      return normalizeDerivedSummaryFragment(labelMatch[1]);
    }

    const directKeywords = ['所以', '解得', '結果是', '因此', '答案是', '可得'];
    let lastKeywordIndex = -1;
    let lastKeyword = '';
    for (const keyword of directKeywords) {
      const idx = text.lastIndexOf(keyword);
      if (idx > lastKeywordIndex) {
        lastKeywordIndex = idx;
        lastKeyword = keyword;
      }
    }
    if (lastKeywordIndex >= 0) {
      const candidate = text
        .slice(lastKeywordIndex + lastKeyword.length)
        .trim()
        .replace(/^[：:，, ]+/, '')
        .replace(/[。．]+$/, '');
      if (candidate) return normalizeDerivedSummaryFragment(candidate);
    }

    const mathMatches = [...text.matchAll(/\$([^$]+)\$/g)];
    if (mathMatches.length) {
      const candidate = mathMatches[mathMatches.length - 1][1].trim();
      if (candidate) {
        const normalized = normalizeMathSummaryExpression(candidate);
        if (normalized) return `$${normalized}$`;
      }
    }

    const sentence = text.split(/[。．]/)[0].trim();
    return sentence || text;
  }

  function buildJ311PerfectSquareParameterSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const variant = questions.length % 3;

      if (variant === 0) {
        const n = randInt(2, 9);
        const constant = n * n;
        questions.push(`設多項式 $x^2+ax+${constant}$ 為完全平方式，求 $a$ 的值。`);
        answers.push(
          `因為 $x^2+ax+${constant}=(x\\pm ${n})^2=x^2\\pm ${2 * n}x+${constant}$，所以 $a=${2 * n}$ 或 $a=-${2 * n}$。`
        );
        continue;
      }

      if (variant === 1) {
        const p = randInt(2, 6);
        const q = randInt(2, 7);
        const sign = randInt(0, 1) === 0 ? 1 : -1;
        const linear = 2 * p * q * sign;
        const square = sign > 0 ? `(${p}x+${q})^2` : `(${p}x-${q})^2`;
        questions.push(`已知 $${p * p}x^2+bx+${q * q}=${square}$，求 $b$。`);
        answers.push(`展開 $${square}=${p * p}x^2${linear >= 0 ? '+' : ''}${linear}x+${q * q}$，所以 $b=${linear}$。`);
        continue;
      }

      const p = randInt(2, 5);
      const q = randInt(1, 6);
      const sign = randInt(0, 1) === 0 ? 1 : -1;
      const linear = 2 * p * q * sign;
      const constant = q * q;
      const square = sign > 0 ? `(${p}x+${q})^2` : `(${p}x-${q})^2`;
      questions.push(`若 $${p * p}x^2${linear >= 0 ? '+' : ''}${linear}x+k$ 可寫成 $${square}$，求 $k$。`);
      answers.push(
        `因為 $${square}=${p * p}x^2${linear >= 0 ? '+' : ''}${linear}x+${constant}$，所以 $k=${constant}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ312PolynomialSubstitutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const variant = questions.length % 3;

      if (variant === 0) {
        const a = pickNonZero(-4, 4);
        const b = randInt(-6, 6);
        const c = randInt(-8, 8);
        const x = randInt(-3, 3);
        const poly = formatPolynomialFromCoeffs([a, b, c]);
        const value = evalPoly([a, b, c], x);
        const evaluation = formatEvaluationExpression([a, b, c], x);
        questions.push(`已知 $f(x)=${poly}$，求 $f(${x})$。`);
        answers.push(
          `把 $x=${x}$ 代入，得 $f(${x})=${evaluation}=${value}$。`
        );
        continue;
      }

      if (variant === 1) {
        const a = pickNonZero(-3, 3);
        const b = randInt(-5, 5);
        const c = randInt(-7, 7);
        const d = randInt(-8, 8);
        const x = randInt(-2, 2);
        const poly = formatPolynomialFromCoeffs([a, b, c, d]);
        const value = evalPoly([a, b, c, d], x);
        const evaluation = formatEvaluationExpression([a, b, c, d], x);
        questions.push(`已知 $g(x)=${poly}$，求 $g(${x})$。`);
        answers.push(
          `把 $x=${x}$ 代入，得 $g(${x})=${evaluation}=${value}$。`
        );
        continue;
      }

      const a = pickNonZero(-3, 3);
      const b = randInt(-6, 6);
      const c = randInt(-8, 8);
      const poly = formatPolynomialFromCoeffs([a, b, c]);
      const left = evalPoly([a, b, c], 1);
      const right = evalPoly([a, b, c], -1);
      questions.push(`已知 $h(x)=${poly}$，求 $h(1)+h(-1)$。`);
      answers.push(`先代入得 $h(1)=${left}$，$h(-1)=${right}$，所以 $h(1)+h(-1)=${left + right}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

 function buildJ313SpecialProductStructureSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const variant = questions.length % 4;

     if (variant === 0) {
        const a = randInt(2, 12);
        questions.push(`化簡 $\\left(x+${a}\\right)\\left(x^2-${a}x+${a * a}\\right)$。`);
        answers.push(`簡答：$x^3+${a ** 3}$。過程：利用立方和公式 $(u+v)(u^2-uv+v^2)=u^3+v^3$，取 $u=x,\\ v=${a}$。`);
        continue;
      }

     if (variant === 1) {
        const a = randInt(2, 12);
        questions.push(`化簡 $\\left(x-${a}\\right)\\left(x^2+${a}x+${a * a}\\right)$。`);
        answers.push(`簡答：$x^3-${a ** 3}$。過程：利用立方差公式 $(u-v)(u^2+uv+v^2)=u^3-v^3$，取 $u=x,\\ v=${a}$。`);
        continue;
      }

     if (variant === 2) {
        const a = randInt(1, 12);
        questions.push(`化簡 $\\left(x+${a}\\right)^2-\\left(x-${a}\\right)^2$。`);
        answers.push(`簡答：$${4 * a}x$。過程：設 $A=x+${a},\\ B=x-${a}$，則 $A^2-B^2=(A+B)(A-B)=(2x)\\cdot(${2 * a})$。`);
        continue;
      }

      const a = randInt(2, 12);
      questions.push(`化簡 $\\left(${a}x+y\\right)^2-\\left(${a}x-y\\right)^2$。`);
      answers.push(`簡答：$${4 * a}xy$。過程：設 $A=${a}x+y,\\ B=${a}x-y$，則 $A^2-B^2=(A+B)(A-B)=(${2 * a}x)(2y)$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-3 新增：瓷磚鋪地板 ─────────────────────────────────────────────
  function buildJ343TileFloorSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const a = randInt(2, 12); // 甲邊長
      const d = randInt(1, 3); // 甲比乙少d
      const b = a + d; // 乙邊長
      const k = randInt(1, 5); // 比例因子
      const n1 = k * b * b; // 甲品牌塊數
      const n2 = k * a * a; // 乙品牌塊數
      if (n1 > 9999 || n2 < 2 || n1 === n2) continue;

      questions.push(
        `小蘋家的客廳地板最近要重新翻修。在不考慮間隙的情況下，如果鋪上甲品牌的正方形瓷磚，剛好需要 ${n1} 塊；如果鋪上乙品牌的正方形瓷磚，剛好需要 ${n2} 塊。已知甲品牌的瓷磚邊長比乙品牌少 ${d} 公寸，則每塊甲品牌瓷磚的面積為多少平方公寸？`
      );
      // Key: n1/n2 = b²/a², so n1x² = n2(x+d)² simplifies to b²x² = a²(x+d)²
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${a * a} 平方公寸`,
        `設甲品牌瓷磚邊長為 $x$ 公寸，乙品牌邊長為 $(x+${d})$ 公寸。因地板面積相同，列得 $${n1}x^2=${n2}(x+${d})^2$。注意到 $\\dfrac{${n1}}{${n2}}=\\dfrac{${b}^2}{${a}^2}$，方程式可化為 $${b}^2x^2=${a}^2(x+${d})^2$，兩邊取正平方根得 $${b}x=${a}(x+${d})$，整理得 $(${b}-${a})x=${a}\\times${d}$，解得 $x=${a}$，所以甲品牌瓷磚的面積為 $${a}^2=${a * a}$ 平方公寸。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-3 新增：兩正方形周長和+面積和 ──────────────────────────────────
  function buildJ343TwoSquarePerimAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const a = randInt(2, 14);
      const b = randInt(a + 2, a + 16);
      const P = 4 * (a + b);
      const S = a * a + b * b;
      const sumSides = a + b;
      const ab = (sumSides * sumSides - S) / 2;

      questions.push(
        `已知兩個正方形的周長和為 ${P} 公分，且面積和為 ${S} 平方公分，則這兩個正方形的邊長各是多少公分？`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${a} 公分與 ${b} 公分`,
        `設兩正方形邊長為 $x$、$y$。由周長和 $4(x+y)=${P}$ 得 $x+y=${sumSides}$；由面積和 $x^2+y^2=${S}$。利用 $(x+y)^2=x^2+2xy+y^2$ 得 $${sumSides * sumSides}=${S}+2xy$，所以 $xy=${ab}$。$x$ 與 $y$ 是方程式 $t^2-${sumSides}t+${ab}=0$ 的根，分解得 $(t-${a})(t-${b})=0$，所以兩邊長分別為 ${a} 公分與 ${b} 公分。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-3 新增：三個連續正奇數（或正偶數）平方和 ───────────────────────
  function buildJ343ConsecOddSquareSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      // Alternate odd and even
      const isOdd = questions.length % 3 !== 2;
      let n;
      if (isOdd) {
        // middle odd number: 7,9,...,71
        n = 2 * randInt(3, 35) + 1;
      } else {
        // middle even number: 6,8,...,70
        n = 2 * randInt(3, 35);
      }
      if (n < 5) continue;

      const a = n - 2,
        b = n,
        c = n + 2;
      const S = a * a + b * b + c * c;
      const nSq = (S - 8) / 3;
      if (!Number.isInteger(nSq) || nSq !== n * n) continue;
      const typeStr = isOdd ? '正奇數' : '正偶數';

      questions.push(`已知三個連續${typeStr}的平方和為 ${S}，則此三數為何？`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${a}、${n}、${c}`,
        `設中間的${typeStr}為 $n$，另外兩數為 $n-2$ 與 $n+2$。依題意 $(n-2)^2+n^2+(n+2)^2=${S}$，展開整理得 $3n^2+8=${S}$，即 $n^2=${nSq}$，解得 $n=${n}$（取正值），所以此三數為 ${a}、${n}、${c}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-3 新增：負數與倒數關係 + 西元年份平方題 ────────────────────────
  function buildJ343NegReciprocalWordSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const typeIdx = questions.length % 2;

      if (typeIdx === 0) {
        // 負數比倒數的k倍多c → x=k/x+c → x²-cx-k=0
        const r = -randInt(1, 7); // 負答案
        const c = randInt(1, 6); // 多 c
        const k = r * r - c * r; // k = r²-cr > 0
        if (k <= 0 || k > 300) continue;
        const posRoot = c - r; // 另一根 (sum of roots = c)

        questions.push(`已知一負數比其倒數的 ${k} 倍多 ${c}，則此負數為何？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${r}`,
          `設此負數為 $x$，依題意 $x=\\dfrac{${k}}{x}+${c}$，兩邊乘以 $x$ 整理得 $${formatQuadraticEquation(
            1,
            -c,
            -k
          )}$，分解得 $(x-${posRoot})(x+${-r})=0$，解得 $x=${posRoot}$ 或 $x=${r}$。因為此數為負數，所以此負數為 ${r}。`
        );
      } else {
        // 西元年份：出生於Y年，經過x年後恰好是西元x²年 → x²-x-Y=0
        const x = randInt(4, 80);
        const Y = x * x - x;
        if (Y < 10 || Y > 9999) continue;
        const disc = 1 + 4 * Y;
        const sqrtDisc = Math.round(Math.sqrt(disc));
        if (sqrtDisc * sqrtDisc !== disc) continue;
        const posRoot = (1 + sqrtDisc) / 2;
        if (posRoot !== x) continue;

        questions.push(`小香出生於西元 ${Y} 年，經過 $x$ 年後，正好是西元 $x^2$ 年，則 $x$ 為何？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(x=${x}\\)`,
          `依題意出生年 ${Y} 加上 $x$ 年後的年份為 $x^2$，即 $${Y}+x=x^2$，整理得 $x^2-x-${Y}=0$，使用公式解得 $x=\\dfrac{1+\\sqrt{${disc}}}{2}=\\dfrac{1+${sqrtDisc}}{2}=${x}$（取正整數），所以 $x=${x}$。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-3 新增：買筆折扣問題 ────────────────────────────────────────────
  function buildJ343PenPricingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const names = ['小聰', '小明', '小安', '小翔', '美琪'];

    while (questions.length < count) {
      const p = randInt(8, 50); // 原價
      const k = randInt(2, 9); // 再多買幾枝
      const cnt = randInt(5, 30); // 原本數量
      const total1 = p * cnt;
      const total2 = (p - 1) * (cnt + k);
      if (total1 > 5000 || total2 > 5000) continue;

      // 方程式: kx²+(total1-k-total2)x-total1=0
      const B = total1 - k - total2;
      const disc = B * B + 4 * k * total1;
      const sqrtDisc = Math.round(Math.sqrt(disc));
      if (sqrtDisc * sqrtDisc !== disc) continue;
      if ((-B + sqrtDisc) % (2 * k) !== 0) continue;
      const posRoot = (-B + sqrtDisc) / (2 * k);
      if (posRoot !== p) continue;

      const nm = names[questions.length % names.length];
      const Bstr = B >= 0 ? `+${B}` : `${B}`;

      questions.push(
        `${nm} 挑了一些同款的原子筆，共需 ${total1} 元。結帳時，老闆說：「再買 ${k} 枝，算你 ${total2} 元就好。」${nm} 算了算，發現這樣每枝筆就便宜了 1 元，於是又多買了 ${k} 枝。試問每枝筆的原價是多少元？`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${p} 元`,
        `設每枝筆原價 $x$ 元，原本可買 $\\dfrac{${total1}}{x}$ 枝。再買 ${k} 枝後共 $\\dfrac{${total1}}{x}+${k}$ 枝，每枝 $(x-1)$ 元，費用為 $(x-1)\\!\\left(\\dfrac{${total1}}{x}+${k}\\right)=${total2}$。整理得 $${formatQuadraticEquation(
          k,
          B,
          -total1
        )}$，解得 $x=\\dfrac{${-B}+\\sqrt{${disc}}}{${2 * k}}=\\dfrac{${-B}+${sqrtDisc}}{${2 * k}}=${p}$（取正值），所以每枝筆的原價為 ${p} 元。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-3 新增：玩具攤販問題 ────────────────────────────────────────────
  function buildJ343ToyVendorSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const n = randInt(10, 70); // 件數
      const M = randInt(5, 50); // 每件加價
      const c = randInt(30, 250); // 每件成本
      const T = n * c;
      const P = M * (n - 1) - c; // 利潤 = (n-1)(c+M) - nc = Mn-M-c
      if (P <= 0 || T > 99999) continue;

      // 方程式: M*n²-(M+P)*n-T=0
      const coefA = M;
      const coefB = -(M + P);
      const coefC = -T;
      const disc = coefB * coefB - 4 * coefA * coefC;
      const sqrtDisc = Math.round(Math.sqrt(disc));
      if (sqrtDisc * sqrtDisc !== disc) continue;
      if ((-coefB + sqrtDisc) % (2 * coefA) !== 0) continue;
      const posRoot = (-coefB + sqrtDisc) / (2 * coefA);
      if (posRoot !== n) continue;

      const MplusP = M + P;
      questions.push(
        `某玩具攤販用 ${T} 元買進一批相同的玩具，他留下一件給自己的小孩玩，其餘的每件加 ${M} 元販售，已知全數賣完後，比 ${T} 元多賺了 ${P} 元，試問玩具攤販共買了幾件玩具？`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${n} 件`,
        `設共買了 $n$ 件，每件成本 $\\dfrac{${T}}{n}$ 元，賣出 $(n-1)$ 件，每件售 $\\left(\\dfrac{${T}}{n}+${M}\\right)$ 元。依題意 $(n-1)\\!\\left(\\dfrac{${T}}{n}+${M}\\right)=${T}+${P}$，整理得 $${M}n^2-${MplusP}n-${T}=0$，解得 $n=\\dfrac{${MplusP}+\\sqrt{${disc}}}{${2 * M}}=\\dfrac{${MplusP}+${sqrtDisc}}{${2 * M}}=${n}$（取正整數），所以玩具攤販共買了 ${n} 件玩具。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-3 新增：吸管測長方形桌 ─────────────────────────────────────────
  function buildJ343StrawTableSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const names = ['小珍', '小安', '明軒', '美琪', '小翔'];

    while (questions.length < count) {
      const s = randInt(8, 28); // 吸管長度
      const L = randInt(2, 9);
      const A = randInt(1, L * s - 5);
      const W = randInt(1, 7);
      const B = randInt(1, 8);
      const len = L * s - A;
      const wid = W * s + B;
      if (len <= 0 || wid <= 0) continue;
      const S = len * wid;
      if (S > 999999) continue;

      // 展開: (Ls-A)(Ws+B) = LW·s²+(LB-AW)s-AB = S
      const qa = L * W;
      const qb = L * B - A * W;
      const qc = -(A * B + S);
      const disc = qb * qb - 4 * qa * qc;
      const sqrtDisc = Math.round(Math.sqrt(disc));
      if (sqrtDisc * sqrtDisc !== disc) continue;
      if ((-qb + sqrtDisc) % (2 * qa) !== 0) continue;
      const posRoot = (-qb + sqrtDisc) / (2 * qa);
      if (posRoot !== s) continue;

      const nm = names[questions.length % names.length];
      const qbStr = qb === 0 ? '' : qb > 0 ? `+${qb}s` : `${qb}s`;
      const rhs2 = -qc; // qc is negative, so rhs2 = -qc = AB+S > 0

      questions.push(
        `${nm} 用吸管測量一張長方形桌子的邊長，發現桌子的長比吸管長度的 ${L} 倍少 ${A} 公分，寬比吸管長度的 ${W} 倍多 ${B} 公分，已知桌子的面積為 ${S} 平方公分，則吸管的長度為多少公分？`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${s} 公分`,
        `設吸管長度為 $s$ 公分，桌長 $=${L}s-${A}$，桌寬 $=${W}s+${B}$。依題意 $(${L}s-${A})(${W}s+${B})=${S}$，展開整理得 $${qa}s^2${qbStr}-${A * B + S}=0$。取正根得 $s=\\dfrac{${-qb}+${sqrtDisc}}{${2 * qa}}=${s}$，所以吸管長度為 ${s} 公分。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-3 新增：阿福小明捐款平方關係 ───────────────────────────────────
  function buildJ343DonationSquareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const pairs = [
      ['阿福', '小明'],
      ['大雄', '小夫'],
      ['阿明', '阿強'],
      ['小哲', '小偉'],
      ['志明', '春嬌'],
    ];

    while (questions.length < count) {
      const x = randInt(12, 55); // 乙的捐款
      const A = randInt(3, 9); // 甲是乙的A倍
      const B = randInt(5, 40); // 甲多B元
      const M = x * x - A * x - B; // 甲再多捐M元
      if (M <= 0 || M > 99999) continue;

      const fuFu = A * x + B;
      const total = fuFu + x;
      const BplusM = B + M; // = x²-Ax

      // 方程式: x²-Ax-(B+M)=0 = x²-Ax-(x²-Ax)... wait
      // x²-Ax-BplusM=0 where BplusM=x²-Ax means always 0? No:
      // BplusM = B + M = B + (x²-Ax-B) = x²-Ax. So x²-Ax-(x²-Ax)=0 trivially.
      // Wait: BplusM = x²-Ax, so x²-Ax-BplusM = x²-Ax-(x²-Ax)=0. This is always satisfied.
      // That's correct - x IS a root by construction. The other root is negative: product of roots = -BplusM, so other root = -BplusM/x.
      const otherRoot = -BplusM / x;
      if (!Number.isInteger(otherRoot)) continue;

      const [nameA, nameB] = pairs[questions.length % pairs.length];
      const disc = A * A + 4 * BplusM;
      const sqrtDisc = Math.round(Math.sqrt(disc));
      if (sqrtDisc * sqrtDisc !== disc) continue;

      questions.push(
        `${nameA} 與 ${nameB} 兩人響應「飢餓三十」的愛心捐款活動，已知 ${nameA} 捐的錢是 ${nameB} 的 ${A} 倍多 ${B} 元，如果 ${nameA} 再多捐 ${M} 元，則所捐的錢剛好是 ${nameB} 捐的錢的平方，試問 ${nameA} 與 ${nameB} 共捐了多少元？`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${total} 元`,
        `設 ${nameB} 捐款 $x$ 元，${nameA} 捐款 $(${A}x+${B})$ 元。依題意 $${A}x+${B}+${M}=x^2$，整理得 $x^2-${A}x-${BplusM}=0$。取正根得 $x=${x}$，所以 ${nameB} 捐款 ${x} 元、${nameA} 捐款 ${fuFu} 元，合計 ${total} 元。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-1 新增：差平方型 (ax+b)²-(cx+d)²=0 ─────────────────────────────
  function buildJ341DiffSquareSolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 4);
      const b = randInt(1, 12);
      const c = randInt(1, 4);
      const d = randInt(1, 12);
      // (ax+b)²-(cx+d)²=0 → (ax+b+cx+d)(ax+b-cx-d)=0
      // → ((a+c)x+(b+d))((a-c)x+(b-d))=0
      const s1 = a + c,
        t1 = b + d;
      const s2 = a - c,
        t2 = b - d;
      // roots: x = -t1/s1 and x = -t2/s2 (if s2≠0)
      let summary;
      if (s2 === 0) {
        if (t2 === 0) {
          i -= 1;
          continue;
        } // 0=0 always true, skip
        // second factor is constant ≠ 0, so only one root
        summary = `\\(x=${formatFraction(-t1, s1)}\\)`;
      } else {
        const roots = [...new Set([formatFraction(-t1, s1), formatFraction(-t2, s2)])];
        summary = `\\(x=${roots.join('\\) 或 \\(x=')}\\)`;
      }
      const aStr = a === 1 ? '' : `${a}`;
      const cStr = c === 1 ? '' : `${c}`;
      const fac1 = `(${formatSingleVarExpr(s1, t1)})`;
      const fac2 = s2 === 0 ? `${t2}` : `(${formatSingleVarExpr(s2, t2)})`;
      const factorProduct = s2 === 0 ? `${fac1}\\cdot(${fac2})` : `${fac1}${fac2}`;
      questions.push(`解方程式：\\((${aStr}x${b >= 0 ? '+' : ''}${b})^2-(${cStr}x${d >= 0 ? '+' : ''}${d})^2=0\\)`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        summary,
        `利用差平方分解：\\([(${aStr}x+${b})+(${cStr}x+${d})][(${aStr}x+${b})-(${cStr}x+${d})]=0\\)，即 \\(${factorProduct}=0\\)。由兩個因式分別為 0 求解。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-1 新增：換元法 (x+a)²+b(x+a)+c=0 ──────────────────────────────
  function buildJ341SubstituteVarSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-8, 8);
      // 設 y=x+a，則 y²+By+C=0，需可因式分解
      const r1 = pickNonZero(-8, 8);
      const r2 = pickNonZero(-8, 8);
      const B = -(r1 + r2);
      const C = r1 * r2;
      // y²+By+C = (y-r1)(y-r2)
      const xSign = a >= 0 ? `+${a}` : `${a}`;
      const BSign = B === 0 ? '' : B > 0 ? `+${B}` : `${B}`;
      const CSign = C >= 0 ? `+${C}` : `${C}`;
      const x1 = r1 - a,
        x2 = r2 - a;
      const x1Str = `${x1}`,
        x2Str = `${x2}`;
      const factor1 = `(y${r1 >= 0 ? '-' : '+'}${Math.abs(r1)})`;
      const factor2 = `(y${r2 >= 0 ? '-' : '+'}${Math.abs(r2)})`;
      questions.push(`解方程式：\\((x${xSign})^2${BSign}(x${xSign})${CSign}=0\\)`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(x=${x1Str}\\) 或 \\(x=${x2Str}\\)`,
        `設 \\(y=x${xSign}\\)，方程式化為 \\(y^2${BSign}y${CSign}=0\\)，因式分解得 \\(${factor1}${factor2}=0\\)，所以 \\(y=${r1}\\) 或 \\(y=${r2}\\)。` +
          `代回 \\(y=x${xSign}\\)：\\(x=${x1Str}\\) 或 \\(x=${x2Str}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-1 新增：共同解（兩方程式有一公共根求係數）─────────────────────
  function buildJ341SharedRootSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const commonRoot = pickNonZero(-7, 7);
        let otherRoot1 = pickNonZero(-7, 7);
        let otherRoot2 = pickNonZero(-7, 7);
        if (otherRoot1 === commonRoot || otherRoot2 === commonRoot || otherRoot1 === otherRoot2) {
          i -= 1;
          continue;
        }
        const eq1 = formatQuadraticEquationFromRoots(commonRoot, otherRoot1);
        const eq2 = formatQuadraticEquationFromRoots(commonRoot, otherRoot2);
        const fac1 = formatQuadraticFactorizationFromRoots(commonRoot, otherRoot1);
        const fac2 = formatQuadraticFactorizationFromRoots(commonRoot, otherRoot2);
        const roots1 = [commonRoot, otherRoot1].sort((a, b) => a - b);
        const roots2 = [commonRoot, otherRoot2].sort((a, b) => a - b);
        questions.push(`若 \\(${eq1}\\) 與 \\(${eq2}\\) 有一個公共解，試求此公共解。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `公共解為 \\(x=${commonRoot}\\)`,
          `第一方程式因式分解：\\(${fac1}=0\\)，解為 \\(x=${roots1[0]}\\) 或 \\(x=${roots1[1]}\\)。` +
            `第二方程式因式分解：\\(${fac2}=0\\)，解為 \\(x=${roots2[0]}\\) 或 \\(x=${roots2[1]}\\)。` +
            `兩組解中共同出現的是 \\(x=${commonRoot}\\)，所以公共解為 \\(x=${commonRoot}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        // x²-2x=0 與 x²+kx-k²=0 有公共解，求k
        // x²-2x=0 → x(x-2)=0 → x=0 or x=2
        // 代入 x²+kx-k²=0
        // x=0: -k²=0 → k=0（無效）
        // x=2: 4+2k-k²=0 → k²-2k-4=0 → k=1±√5
        // Use different factorable versions
        const r = pickNonZero(1, 6);
        // eq1: x²-rx=0 → x=0 or x=r
        // eq2: x²+kx-C=0, C=randInt
        // if x=r is shared: r²+kr-C=0 → k=(C-r²)/r
        const C = r * randInt(1, 6); // ensure C/r is integer possible
        const k = (C - r * r) / r;
        if (!Number.isInteger(k)) {
          i -= 1;
          continue;
        }
        questions.push(
          `若 \\(${formatQuadraticEquation(1, -r, 0)}\\) 與 \\(x^2+kx${-C >= 0 ? '+' : ''}${-C}=0\\) 有一個公共解，求 \\(k\\) 的可能值。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(k=${k}\\)`,
          `\\(${formatQuadraticEquation(1, -r, 0)}\\)，可因式分解為 \\(x(x-${r})=0\\)，解為 \\(x=0\\) 或 \\(x=${r}\\)。` +
            `若公共解為 \\(x=0\\)：代入第二式得 \\(-${C}=0\\)，矛盾，故排除。` +
            `若公共解為 \\(x=${r}\\)：代入第二式得 \\(${r * r}+${r}k-${C}=0\\)，解得 \\(k=${k}\\)。`
        );
        continue;
      }
      // mode 2: 已知a,b為整數，x²+ax+b=0的解也為整數，求a的不同值個數
      const C2 = randInt(6, 30);
      // find all factor pairs of C2
      const factors = [];
      for (let f = 1; f <= C2; f += 1) {
        if (C2 % f === 0) {
          const g = C2 / f;
          // (x-f)(x-g)=0: a=-(f+g), b=f*g=C2
          // (x+f)(x+g)=0: a=f+g, b=fg=C2
          // (x-f)(x+g)=0: a=g-f, b=-fg=-C2 → diff case
          factors.push(f, -f);
        }
      }
      const aVals = new Set();
      for (const f of factors) {
        for (const g of factors) {
          if (f * g === C2) aVals.add(-(f + g));
        }
      }
      aVals.delete(0); // avoid trivial
      questions.push(`若 \\(a\\) 為整數且 \\(x^2+ax+${C2}=0\\) 的解均為整數，則 \\(a\\) 共有幾種值？`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${aVals.size} 種`,
        `方程式兩根之積為 $${C2}$。枚舉兩整數乘積為 $${C2}$ 的所有組合（包含負整數），得 \\(a=-(\\alpha+\\beta)\\) 的所有可能值共 $${aVals.size}$ 種。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-2 新增：甲乙各看錯不同係數（兩人求正確方程）──────────────────
  function buildJ342TwoPersonMistakeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      // 正確方程: x²+Bx+C=0，根 r1, r2
      const r1 = pickNonZero(-8, 8);
      const r2 = pickNonZero(-8, 8);
      if (r1 === r2) {
        i -= 1;
        continue;
      }
      const B = -(r1 + r2); // correct b coeff
      const C = r1 * r2; // correct constant
      // 甲看錯一次項(B)→ 根積不變為C, 但根和改變
      // 甲的兩根 p1, p2: p1*p2=C
      const p1 = pickNonZero(-8, 8);
      if (p1 === 0 || C % p1 !== 0) {
        i -= 1;
        continue;
      }
      const p2 = C / p1;
      if (p1 === p2) {
        i -= 1;
        continue;
      }
      // 乙看錯常數項(C)→ 根和不變為B，但根積改變
      // 乙的兩根 q1, q2: q1+q2=B(=-(r1+r2)) ← 乙的根和等同正確
      // Wait: 乙看錯常數項，根和=-(一次項/首項)=-B/1=-B unchanged from WRONG equation
      // Actually if 乙 looks at WRONG constant but correct linear, then sum=-B is correct
      // but 乙's roots q1,q2 have q1+q2 = -B (same as correct, because only constant changed)
      const q1 = pickNonZero(-8, 8);
      const q2 = -B - q1; // q1+q2 = -B (same sum as correct roots r1+r2)
      if (q2 === 0 || q1 === q2 || q1 * q2 === C) {
        i -= 1;
        continue;
      }
      // 正確根: sum = r1+r2 = -B, product = r1*r2 = C
      // 從甲得product=C，從乙得sum=q1+q2=-B (same as correct)
      // 正確方程: x²+Bx+C=0
      const equation = formatQuadraticEquation(1, B, C);
      questions.push(
        `甲、乙兩人同解一個 \\(x^2\\) 係數為 1 的一元二次方程式：甲將一次項係數看錯，解得兩根為 \\(${p1},${p2}\\)；乙將常數項看錯，解得兩根為 \\(${q1},${q2}\\)。求正確的方程式。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${equation}\\)`,
        `甲看錯一次項，根積正確：\\(\\alpha\\beta=${p1}\\times${p2}=${C}\\)。` +
          `乙看錯常數項，根和正確：\\(\\alpha+\\beta=${formatArithmeticSum(q1, q2)}=${-B}\\)。` +
          `故正確方程式為 \\(${equation}\\)（兩根為 \\(${r1},${r2}\\)）。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-2 新增：配成完全平方式求首項係數 p ──────────────────────────────
  function buildJ342CompleteSquareLeadCoeffSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        // px²-ax+q 為完全平方式 → (√p·x - √q)² = px²-2√(pq)·x+q
        // 所以 a = 2√(pq) → p = a²/(4q)
        const sqrtP = randInt(2, 6);
        const sqrtQ = randInt(1, 6);
        const p = sqrtP * sqrtP;
        const q = sqrtQ * sqrtQ;
        const a = 2 * sqrtP * sqrtQ;
        questions.push(
          `若 \\(${p}x^2-${a}x+${q}\\) 為完全平方式，此式已滿足，求 \\(\\sqrt{${p}}\\) 和 \\(\\sqrt{${q}}\\) 的值。（驗算）`
        );
        // Better question: find p given a and q
        const p2 = randInt(1, 6) * randInt(1, 6);
        const sqrtQ2 = randInt(1, 5);
        const q2 = sqrtQ2 * sqrtQ2;
        const sqrtP2 = randInt(2, 7);
        const p2val = sqrtP2 * sqrtP2;
        const a2 = 2 * sqrtP2 * sqrtQ2;
        questions[questions.length - 1] = `若 \\(px^2-${a2}x+${q2}\\) 為完全平方式，求 \\(p\\) 的值。`;
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(p=${p2val}\\)`,
          `完全平方式形如 \\((\\sqrt{p}\\cdot x-\\sqrt{${q2}})^2=px^2-2\\sqrt{${q2}p}\\cdot x+${q2}\\)。比較一次項：\\(2\\sqrt{${q2}p}=${a2}\\)，即 \\(\\sqrt{${q2}p}=${a2 / 2}\\)，故 \\(${q2}p=${(a2 * a2) / 4}\\)，\\(p=${p2val}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        // x²+bx+m 為完全平方式 → m=(b/2)²
        const b = randInt(2, 16) * (randInt(0, 1) === 0 ? 1 : -1);
        const m = (b * b) / 4;
        if (!Number.isInteger(m)) {
          i -= 1;
          continue;
        }
        const bSign = b >= 0 ? `+${b}` : `${b}`;
        questions.push(`若 \\(x^2${bSign}x+m\\) 為完全平方式，求 \\(m\\) 的值。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(m=${m}\\)`,
          `完全平方式需 \\(m=\\left(\\dfrac{${b}}{2}\\right)^2=${m}\\)。`
        );
        continue;
      }
      // mode 2: ax²+bx+c 為完全平方式，求a（c已知，b已知）
      const sqrtC = randInt(1, 6);
      const c = sqrtC * sqrtC;
      const sqrtA = randInt(2, 6);
      const a2 = sqrtA * sqrtA;
      const b2 = 2 * sqrtA * sqrtC * (randInt(0, 1) === 0 ? 1 : -1);
      const bSign2 = b2 >= 0 ? `+${b2}` : `${b2}`;
      questions.push(`若 \\(ax^2${bSign2}x+${c}\\) 為完全平方式，求 \\(a\\) 的值。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(a=${a2}\\)`,
        `完全平方式形如 \\((\\sqrt{a}\\cdot x${b2 >= 0 ? '+' : '-'}\\sqrt{${c}})^2\\)，比較一次項得 \\(2\\sqrt{${c}a}=${Math.abs(b2)}\\)，解得 \\(a=${a2}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-3 新增：循環賽場次求人數 n(n-1)/2=場次 ─────────────────────────
  function buildJ343RoundRobinSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = [
      { event: '象棋比賽', unit: '人', per: '每名參賽者必須與其他每人各比一場' },
      { event: '班際籃球賽', unit: '班', per: '每班必須與其他每班各比一場' },
      { event: '羽球循環賽', unit: '位選手', per: '每位選手與其他每位各比一場' },
      { event: '畢業旅行聯誼', unit: '班', per: '每班必須和其餘每班各聯誼一次' },
      { event: '棋藝錦標賽', unit: '人', per: '參賽者兩兩各對弈一局' },
    ];
    while (questions.length < count) {
      const n = randInt(6, 40);
      const total = (n * (n - 1)) / 2;
      if (total > 2000) continue;
      const ctx = contexts[questions.length % contexts.length];
      questions.push(
        `某學校舉行${ctx.event}，規定${ctx.per}，經統計共進行了 ${total} 場比賽，則共有幾${ctx.unit}參賽？`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${n} ${ctx.unit}`,
        `設共有 $n$ ${ctx.unit}，則總場數為 $\\dfrac{n(n-1)}{2}=${total}$，整理得 $n^2-n-${2 * total}=0$，因式分解得 $(n-${n})(n+${n - 1})=0$，解得 $n=${n}$（取正整數），所以共有 ${n} ${ctx.unit}參賽。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-3 新增：長方形土地內開等寬道路求路寬 ──────────────────────────
  function buildJ343GardenPathSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    while (questions.length < count) {
      const mode = questions.length % 3;
      if (mode === 0) {
        // 長L寬W的長方形，橫縱各一條等寬x道路，花圃面積=S
        const L = randInt(8, 25);
        const W = randInt(5, 15);
        const x = randInt(1, Math.min(L, W) / 3);
        const S = (L - x) * (W - x);
        if (S <= 0 || S >= L * W) continue;
        // (L-x)(W-x)=S → x²-(L+W)x+LW-S=0
        const sum = L + W;
        const prodC = L * W - S;
        const disc = sum * sum - 4 * prodC;
        if (disc < 0) continue;
        const sqrtDisc = Math.round(Math.sqrt(disc));
        if (sqrtDisc * sqrtDisc !== disc) continue;
        const x1 = (sum - sqrtDisc) / 2,
          x2 = (sum + sqrtDisc) / 2;
        const validX = [x1, x2].find((v) => v > 0 && v < Math.min(L, W) && Number.isInteger(v));
        if (validX === undefined || validX !== x) continue;
        questions.push(
          `在長 ${L} 公尺、寬 ${W} 公尺的長方形土地上，開闢一橫一縱等寬的道路，其中花圃面積為 ${S} 平方公尺，求道路寬度為多少公尺？`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${validX} 公尺`,
          `設道路寬 $x$ 公尺，花圃區域為 $(${L}-x)(${W}-x)=${S}$。展開整理得 $x^2-${sum}x+${prodC}=0$，解得 $x=\\dfrac{${sum}\\pm${sqrtDisc}}{2}$，即 $x=${x1}$ 或 $x=${x2}$。因須小於 ${Math.min(L, W)}，故道路寬為 ${validX} 公尺。`
        );
        continue;
      }
      if (mode === 1) {
        // 四周外圍等寬馬路，馬路面積=k%×公園面積
        const PW = randInt(10, 30); // park width
        const PL = PW + randInt(5, 20); // park length
        const x = randInt(1, 5); // road width
        const parkArea = PL * PW;
        const totalArea = (PL + 2 * x) * (PW + 2 * x);
        const roadArea = totalArea - parkArea;
        if (roadArea <= 0) continue;
        // roadArea = 4x² + 2(PL+PW)x
        // 4x²+2(PL+PW)x-roadArea=0
        const sumLW = PL + PW;
        const disc = 4 * sumLW * sumLW + 16 * roadArea;
        const sqrtDisc = Math.round(Math.sqrt(disc));
        if (sqrtDisc * sqrtDisc !== disc) continue;
        if ((sqrtDisc - 2 * sumLW) % 8 !== 0) continue;
        const xCalc = (sqrtDisc - 2 * sumLW) / 8;
        if (xCalc !== x) continue;
        questions.push(
          `一長方形公園，長 ${PL} 公尺，寬 ${PW} 公尺。在其四周外圍鋪設一條等寬的馬路，馬路面積為 ${roadArea} 平方公尺，求此馬路的寬度。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${x} 公尺`,
          `設馬路寬 $x$ 公尺，總面積為 $(${PL}+2x)(${PW}+2x)$，馬路面積 $=(${PL}+2x)(${PW}+2x)-${parkArea}=${roadArea}$。整理得 $4x^2+${2 * sumLW}x-${roadArea}=0$，化簡得 $x^2+${sumLW / 2}x-${roadArea / 4}=0$，解得 $x=${x}$（取正值），故馬路寬 ${x} 公尺。`
        );
        continue;
      }
      // mode 2: 長方形花圃，四個面積相等的子花圃 + 等寬道路
      const L2 = randInt(8, 20);
      const W2 = randInt(5, 12);
      const x2 = randInt(1, Math.min(L2, W2) / 3);
      // 分成 2×2 區塊，道路各 x，花圃 = 2 條橫路 + 2 條縱路
      // 每個花圃: ((L2-3x)/2) × ((W2-3x)/2)
      const gardenL = (L2 - 3 * x2) / 2;
      const gardenW = (W2 - 3 * x2) / 2;
      if (gardenL <= 0 || gardenW <= 0 || !Number.isInteger(gardenL) || !Number.isInteger(gardenW)) continue;
      const totalGarden = 4 * gardenL * gardenW;
      if (totalGarden <= 0) continue;
      questions.push(
        `在長 ${L2} 公尺、寬 ${W2} 公尺的長方形土地上，四周與中央各開闢一條等寬道路，分成四個面積相等的花圃；若花圃總面積為 ${totalGarden} 平方公尺，求道路寬度。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${x2} 公尺`,
        `設道路寬 $x$ 公尺，每個花圃尺寸為 $\\dfrac{${L2}-3x}{2}\\times\\dfrac{${W2}-3x}{2}$，四個花圃總面積為 $(${L2}-3x)(${W2}-3x)=${totalGarden}$。展開整理得 $${formatQuadraticEquation(
          9,
          -3 * (L2 + W2),
          L2 * W2 - totalGarden
        )}$，解得 $x=${x2}$ 公尺（取合理正值）。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-3 新增：正方形薄片四角剪去折成開口盒 ──────────────────────────
  function buildJ343OpenBoxSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    while (questions.length < count) {
      const h = randInt(1, 6); // 盒高 = 剪去小正方形邊長
      const side = randInt(h * 2 + 4, h * 2 + 20); // 薄片邊長
      const boxSide = side - 2 * h; // 盒底邊長
      const vol = h * boxSide * boxSide;
      if (boxSide <= 0 || vol > 99999) continue;
      // 方程: h*(side - 2h)² = vol → (side - 2h)² = vol/h
      // 逆推: 設薄片邊長 s，s² = ?
      // 設剪去邊長 x，盒底邊長 = s-2x，高 = x
      // vol = x(s-2x)² — parametrize by s (unknown)
      // Better: set h fixed, ask for s given vol
      const sheetArea = side * side;
      questions.push(
        `有一塊邊長為 $x$ 公寸的正方形金屬薄片，在其四個角各截去邊長為 ${h} 公寸的小正方形後，折成高 ${h} 公寸、無蓋的開口方盒（不計薄片厚度），若此盒的容積為 ${vol} 立方公寸，求此正方形薄片的面積。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${sheetArea} 平方公寸`,
        `設正方形薄片邊長為 $x$ 公寸，則盒底邊長為 $(x-${2 * h})$ 公寸，高為 ${h} 公寸。容積為 $${h}(x-${2 * h})^2=${vol}$，整理得 $(x-${2 * h})^2=${vol / h}$，開方得 $x-${2 * h}=${boxSide}$，所以 $x=${side}$。薄片面積為 $${side}^2=${sheetArea}$ 平方公寸。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-3 新增：正方形邊長變化問題 ─────────────────────────────────────
  function buildJ343SquareSideChangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    while (questions.length < count) {
      const mode = questions.length % 3;
      if (mode === 0) {
        // 正方形一邊增加 a，另一邊縮短為 1/k 倍，新面積比原面積少 d
        const s = randInt(8, 20);
        const a = randInt(3, 10);
        const k = 2; // shrink to 1/2
        const origArea = s * s;
        const newArea = (s + a) * (s / k);
        const diff = origArea - newArea; // should be positive
        if (diff <= 0) continue;
        // (s+a)(s/2) = s²-d → s²/2 + as/2 = s²-d → s²(1-1/2) - as/2 = d
        // s²/2 - as/2 = d → s²-as-2d=0
        const disc = a * a + 8 * diff;
        const sqrtDisc = Math.round(Math.sqrt(disc));
        if (sqrtDisc * sqrtDisc !== disc) continue;
        const sCalc = (a + sqrtDisc) / 2;
        if (!Number.isInteger(sCalc) || sCalc !== s) continue;
        questions.push(
          `有一正方形，將其一邊增加 ${a} 公分，另一邊縮短為原來的 $\\dfrac{1}{2}$，所得新長方形的面積比原正方形少 ${diff} 平方公分，則原正方形的邊長為多少公分？`
        );
        pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${s} 公分`,
        `設原正方形邊長為 $s$ 公分，新長方形長為 $(s+${a})$，寬為 $\\dfrac{s}{2}$。面積關係：$\\dfrac{s(s+${a})}{2}=s^2-${diff}$，整理得 $s^2-${a}s-${2 * diff}=0$，因式分解得 $(s-${s})(s+${s - a})=0$，取正值可得原正方形邊長為 ${s} 公分。`
        );
        continue;
      }
      if (mode === 1) {
        // 正方形一邊增加 a，另一邊減少 b，新面積比原面積多 d（或少）
        const s = randInt(6, 20);
        const a = randInt(2, 8);
        const b = randInt(1, 5);
        if (a <= b) continue;
        const origArea = s * s;
        const newArea = (s + a) * (s - b);
        const diff = newArea - origArea; // = as - bs + ab - 0 = (a-b)s + ab
        if (diff === 0) continue;
        // might be positive or negative
        const absDiff = Math.abs(diff);
        const diffSign = diff > 0 ? '多' : '少';
        questions.push(
          `有一正方形，將其一邊增加 ${a} 公分，另一邊減少 ${b} 公分，所得新長方形的面積比原正方形${diffSign} ${absDiff} 平方公分，則原正方形的邊長為多少公分？`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${s} 公分`,
          `設原正方形邊長為 $s$ 公分，$(s+${a})(s-${b})=s^2${diff >= 0 ? '+' : ''}${diff}$。展開左式得 $s^2+${a - b}s-${a * b}$，所以 $${a - b}s-${a * b}=${diff}$，即 $${a - b}s=${diff + a * b}$，解得 $s=${s}$ 公分。`
        );
        continue;
      }
      // mode 2: 兩條等長鐵絲，一折正方形一折長方形（長比寬多d），正方形面積比長方形2倍少k
      const sq = randInt(8, 20); // square side
      const totalWire = 4 * sq;
      const halfPerim = totalWire / 2; // half perimeter of rectangle
      const d = randInt(2, 6);
      // rect: l + w = halfPerim, l - w = d → l=(halfPerim+d)/2, w=(halfPerim-d)/2
      if ((halfPerim + d) % 2 !== 0) continue;
      const l = (halfPerim + d) / 2;
      const w = (halfPerim - d) / 2;
      if (w <= 0) continue;
      const sqArea = sq * sq;
      const rectArea = l * w;
      const diff2 = 2 * rectArea - sqArea;
      if (diff2 <= 0) continue;
      questions.push(
        `拿兩條等長的鐵絲，一條折成正方形，另一條折成長比寬多 ${d} 公分的長方形。若長方形面積的 2 倍比正方形面積多 ${diff2} 平方公分，則正方形的邊長為多少公分？`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${sq} 公分`,
        `設正方形邊長為 $s$，每條鐵絲長 $4s$。長方形周長也為 $4s$，故長與寬的和為 $2s$；又長比寬多 ${d}，所以長為 $s+${d / 2}$、寬為 $s-${d / 2}$。依題意 $2(s+${d / 2})(s-${d / 2})=s^2+${diff2}$，整理解得 $s=${sq}$ 公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── j3-4-2 新增：絕對值方程式 |f(x)|+|g(x)|=0 共同根 ──────────────────
  function buildJ342AbsDoubleZeroSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    let attempts = 0;
    while (questions.length < count && attempts < count * 20) {
      attempts += 1;
      const r1 = randInt(-8, 8);
      const r2 = randInt(-8, 8);
      const r3 = randInt(-8, 8);
      if (r2 === r1 || r3 === r1 || r2 === r3) continue;
      // f(x) = (x-r1)(x-r2) = x² - (r1+r2)x + r1*r2
      const a = -(r1 + r2),
        b = r1 * r2;
      // g(x) = (x-r1)(x-r3) = x² - (r1+r3)x + r1*r3
      const c = -(r1 + r3),
        d = r1 * r3;
      const fStr = formatPolynomialFromCoeffs([1, a, b]);
      const gStr = formatPolynomialFromCoeffs([1, c, d]);
      // Roots of f: r1, r2; roots of g: r1, r3
      questions.push(`解方程式：\\(|${fStr}|+|${gStr}|=0\\)`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(x=${r1}\\)`,
        `因兩絕對值均非負，其和為 0 表示兩者必須同時等於 0。` +
          `\\(${fStr}=0\\) 的解為 \\(x=${r1}\\) 或 \\(x=${r2}\\)；` +
          `\\(${gStr}=0\\) 的解為 \\(x=${r1}\\) 或 \\(x=${r3}\\)。` +
          `公共解為 \\(x=${r1}\\)，故答案為 \\(x=${r1}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── j3-4 延伸：判別式逆推與參數範圍 ─────────────────────────────────────
  function buildJ342DiscriminantParameterAdvancedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(detail);
    };
    const strictFloor = (numerator, denominator) => {
      const q = Math.floor(numerator / denominator);
      return numerator % denominator === 0 ? q - 1 : q;
    };

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const b = 2 * randInt(4, 9);
        const a = randInt(1, 4);
        const c = randInt(-6, 8);
        const maxK = strictFloor(b * b - 4 * c, 4 * a);
        const kTerm = a === 1 ? 'k' : `${a}k`;
        const parameterPart = `${kTerm} ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`;
        const equation = `x^2 - ${b}x + (${parameterPart}) = 0`;
        add(
          `若方程式 \\(${equation}\\) 有兩相異實根，求 \\(k\\) 的最大整數值。`,
          `\\(k\\) 的最大整數值為 \\(${maxK}\\)`,
          `有兩相異實根需判別式 \\(D>0\\)。\\(${b}^2-4(${parameterPart})>0\\)，所以 \\(k<${formatFraction(
            b * b - 4 * c,
            4 * a
          )}\\)。因此 \\(k\\) 的最大整數值為 \\(${maxK}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        const b = 2 * randInt(2, 6);
        const c = randInt(1, 5);
        const bound = formatFraction(b * b, 4 * c);
        add(
          `已知關於 \\(x\\) 的方程式 \\(mx^2+${b}x+${c}=0\\) 沒有實根，求 \\(m\\) 的範圍。`,
          `\\(m>${bound}\\)`,
          `因為是二次方程式，先保留 \\(m\\ne 0\\)。沒有實根需 \\(D<0\\)，所以 \\(${b}^2-4\\cdot m\\cdot ${c}<0\\)，得到 \\(m>${bound}\\)。這個範圍已自動排除 \\(m=0\\)。`
        );
        continue;
      }

      if (mode === 2) {
        const r = randInt(4, 11);
        add(
          `若方程式 \\(x^2+ax+${r * r}=0\\) 有重根，求 \\(a\\) 的所有可能值。`,
          `\\(a=${2 * r}\\) 或 \\(a=-${2 * r}\\)`,
          `有重根需 \\(D=0\\)。\\(a^2-4\\cdot ${r * r}=0\\)，所以 \\(a^2=${4 * r * r}\\)，得到 \\(a=\\pm ${2 * r}\\)。`
        );
        continue;
      }

      if (mode === 3) {
        const p = randInt(2, 6);
        const q = randInt(p, 9);
        const n = p * q;
        const possible = [];
        for (let d = 1; d * d <= n; d += 1) {
          if (n % d === 0) possible.push(d + n / d);
        }
        const list = [...new Set(possible)].sort((x, y) => x - y);
        add(
          `已知方程式 \\(x^2+kx+${n}=0\\) 的解均為整數，且 \\(k\\) 為正整數，求 \\(k\\) 可能的值。`,
          `\\(k=${list.join(', ')}\\)`,
          `常數項為正且 \\(k>0\\)，兩根應同為負數。設兩根為 \\(-p,-q\\)，則 \\(pq=${n}\\)，且 \\(k=p+q\\)。列出 ${n} 的正因數配對，可得 \\(k\\) 可能為 \\(${list.join(', ')}\\)。`
        );
        continue;
      }

      const t = randInt(1, 5);
      const quadraticK = t * t + 1;
      add(
        `若方程式 \\((k-1)x^2+${2 * t}x+1=0\\) 只有一個實根，求 \\(k\\) 的值。`,
        `\\(k=1\\) 或 \\(k=${quadraticK}\\)`,
        `這題要分兩種情況。若 \\(k-1=0\\)，方程式變成一次方程式 \\(${2 * t}x+1=0\\)，只有一個實根，所以 \\(k=1\\)。若 \\(k-1\\ne0\\)，需判別式為 0：\\(${2 * t}^2-4(k-1)=0\\)，得 \\(k=${quadraticK}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j3-4 延伸：根與係數關係的進階變形 ─────────────────────────────────
  function buildJ342VietaAdvancedRelationsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(detail);
    };

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const s = randInt(4, 10);
        const p = randInt(1, Math.floor((s * s - 1) / 4));
        const value = s * s - 2 * p;
        add(
          `已知 \\(\\alpha,\\beta\\) 為 \\(x^2-${s}x+${p}=0\\) 的兩根，求 \\(\\alpha^2+\\beta^2\\) 的值。`,
          `\\(\\alpha^2+\\beta^2=${value}\\)`,
          `由韋達定理，\\(\\alpha+\\beta=${s}\\)，\\(\\alpha\\beta=${p}\\)。所以 \\(\\alpha^2+\\beta^2=(\\alpha+\\beta)^2-2\\alpha\\beta=${s}^2-2\\cdot${p}=${value}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        const s = randInt(4, 10);
        const p = randInt(1, Math.floor((s * s - 1) / 4));
        const r = randInt(1, 4);
        const value = p - r * s + r * r;
        add(
          `已知 \\(\\alpha,\\beta\\) 為 \\(x^2-${s}x+${p}=0\\) 的兩根，求 \\((\\alpha-${r})(\\beta-${r})\\) 的值。`,
          `\\((\\alpha-${r})(\\beta-${r})=${value}\\)`,
          `展開成 \\(\\alpha\\beta-${r}(\\alpha+\\beta)+${r * r}\\)。代入 \\(\\alpha+\\beta=${s}\\)、\\(\\alpha\\beta=${p}\\)，得到 \\(${p}-${r}\\cdot${s}+${r * r}=${value}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        const denominator = randInt(2, 6);
        const integerRoot = randInt(2, 6);
        const b = denominator * integerRoot - 1;
        add(
          `已知一元二次方程式的兩根為 \\(\\dfrac{1}{${denominator}}\\) 與 \\(-${integerRoot}\\)，求此方程式，並化為整數係數。`,
          `\\(${denominator}x^2+${b}x-${integerRoot}=0\\)`,
          `兩根和為 \\(\\dfrac{1}{${denominator}}-${integerRoot}\\)，積為 \\(-\\dfrac{${integerRoot}}{${denominator}}\\)。由 \\(x^2-(\\text{和})x+\\text{積}=0\\)，再同乘 ${denominator}，得 \\(${denominator}x^2+${b}x-${integerRoot}=0\\)。`
        );
        continue;
      }

      if (mode === 3) {
        const c = randInt(3, 12);
        add(
          `若方程式 \\(x^2+kx-${c}=0\\) 的兩根互為相反數，求 \\(k\\) 的值。`,
          `\\(k=0\\)`,
          `兩根互為相反數，代表兩根和為 0。對 \\(x^2+kx-${c}=0\\)，兩根和為 \\(-k\\)，所以 \\(-k=0\\)，得 \\(k=0\\)。`
        );
        continue;
      }

      const r = randInt(2, 7);
      const sum = 3 * r;
      const product = 2 * r * r;
      add(
        `若方程式 \\(x^2-${sum}x+m=0\\) 的一根是另一根的 2 倍，求 \\(m\\) 的值。`,
        `\\(m=${product}\\)`,
        `設兩根為 \\(t\\) 與 \\(2t\\)。由兩根和 \\(3t=${sum}\\)，得 \\(t=${r}\\)。所以兩根積 \\(m=t\\cdot2t=2t^2=${product}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j3-4 延伸：複合幾何動態建模 ────────────────────────────────────────
  function buildJ343DynamicGeometryModelSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(detail);
    };

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const length = randInt(22, 42);
        const width = randInt(12, 25);
        const path = randInt(2, 6);
        const total = (length + 2 * path) * (width + 2 * path);
        const road = total - length * width;
        const ratio = reduceFraction(road, total);
        add(
          `一個長方形花圃長 ${length} 公尺、寬 ${width} 公尺，四周開等寬小路。若路面積占整個外框面積的 \\(${formatFraction(
            ratio.numerator,
            ratio.denominator
          )}\\)，求路寬。`,
          `路寬為 ${path} 公尺`,
          `設路寬為 \\(x\\) 公尺，外框長、寬分別為 \\(${length}+2x\\)、\\(${width}+2x\\)。由「路面積 = 外框面積 - 花圃面積」列式：\\(( ${length}+2x )(${width}+2x)-${length * width}=${formatFraction(
            ratio.numerator,
            ratio.denominator
          )}(${length}+2x)(${width}+2x)\\)。解得正值 \\(x=${path}\\)，故路寬為 ${path} 公尺。`
        );
        continue;
      }

      if (mode === 1) {
        const side = randInt(5, 14);
        const addSide = randInt(2, 7);
        const subtractSide = randInt(1, Math.min(5, side - 1));
        const area = (side + addSide) * (side - subtractSide);
        add(
          `正方形邊長為 \\(x\\)。若一邊增加 ${addSide}，另一邊減少 ${subtractSide}，新長方形面積為 ${area}，求原正方形面積。`,
          `${side * side}`,
          `依題意 \\((x+${addSide})(x-${subtractSide})=${area}\\)。解得正的邊長 \\(x=${side}\\)，所以原正方形面積為 \\(${side}^2=${side * side}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        const cut = randInt(2, 5);
        const inner = 2 * randInt(5, 10);
        const side = inner + 2 * cut;
        const volume = cut * inner * inner;
        add(
          `正方形薄片四角各剪去邊長 ${cut} 公分的小正方形後，摺成無蓋盒，體積為 ${volume} 立方公分，求原薄片邊長。`,
          `原薄片邊長為 ${side} 公分`,
          `設原薄片邊長為 \\(x\\) 公分，盒子的高為 ${cut}，底面邊長為 \\(x-${2 * cut}\\)。所以 \\(${cut}(x-${2 * cut})^2=${volume}\\)，取符合長度的正值，得 \\(x=${side}\\) 公分。`
        );
        continue;
      }

      if (mode === 3) {
        const d = 2 * randInt(1, 4);
        const a = 3 * d;
        const b = 4 * d;
        const c = 5 * d;
        add(
          `直角三角形三邊長依序相差 ${d} 公分，求其周長。`,
          `${a + b + c} 公分`,
          `設三邊為 \\(x,x+${d},x+${2 * d}\\)，最大邊為斜邊。由勾股定理 \\(x^2+(x+${d})^2=(x+${2 * d})^2\\)，解得 \\(x=${a}\\)。三邊為 ${a}、${b}、${c}，周長為 ${a + b + c} 公分。`
        );
        continue;
      }

      const height = randInt(3, 10);
      const extra = randInt(1, 6);
      const base = 2 * height + extra;
      const area = (base * height) / 2;
      add(
        `一個三角形的底比高的 2 倍多 ${extra} 公分，面積為 ${formatDecimalValue(area)} 平方公分，求底與高。`,
        `高 ${height} 公分，底 ${base} 公分`,
        `設高為 \\(x\\) 公分，底為 \\(2x+${extra}\\)。由面積公式 \\(\\dfrac{x(2x+${extra})}{2}=${formatDecimalValue(
          area
        )}\\)，解得正值 \\(x=${height}\\)。所以高為 ${height} 公分，底為 ${base} 公分。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j3-4 延伸：隱藏二次結構 ────────────────────────────────────────────
  function buildJ341HiddenQuadraticStructureAdvancedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(detail);
    };
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const a = randInt(2, 4);
        const b = pickNonZero(-5, 5);
        const u1 = randInt(-4, 1);
        const u2 = randInt(2, 8);
        const sum = u1 + u2;
        const product = u1 * u2;
        const roots = [u1, u2].map((u) => formatFraction(u - b, a));
        const linear = `${a}x${b >= 0 ? '+' : '-'}${Math.abs(b)}`;
        const middleCoeff = -sum;
        const middleText =
          middleCoeff === 0
            ? ''
            : middleCoeff === 1
              ? `+(${linear})`
              : middleCoeff === -1
                ? `-(${linear})`
                : middleCoeff > 0
                  ? `+${middleCoeff}(${linear})`
                  : `-${Math.abs(middleCoeff)}(${linear})`;
        const constantText = product === 0 ? '' : product > 0 ? `+${product}` : `${product}`;
        const uEquation = formatPolynomialFromCoeffs([1, -sum, product], 'u');
        add(
          `解方程式：\\((${linear})^2${middleText}${constantText}=0\\)。`,
          `\\(x=${roots.join(', ')}\\)`,
          `令 \\(u=${linear}\\)，原式成為 \\(${uEquation}=0\\)，解得 \\(u=${u1}\\) 或 \\(u=${u2}\\)。再代回 \\(${linear}=u\\)，可得 \\(x=${roots.join(', ')}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        const p = randInt(1, 5);
        const q = randInt(p + 1, 7);
        const sum = p * p + q * q;
        const product = p * p * q * q;
        add(
          `解方程式：\\(x^4-${sum}x^2+${product}=0\\)。`,
          `\\(x=\\pm${p},\\ \\pm${q}\\)`,
          `令 \\(u=x^2\\)，得到 \\(u^2-${sum}u+${product}=0\\)，解得 \\(u=${p * p}\\) 或 \\(u=${q * q}\\)。所以 \\(x=\\pm${p}\\) 或 \\(x=\\pm${q}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        const s = randInt(3, 12);
        add(
          `已知 \\(x^2-${s}x+1=0\\)，求 \\(x+\\dfrac{1}{x}\\) 的值。`,
          `\\(x+\\dfrac{1}{x}=${s}\\)`,
          `因常數項為 1，\\(x\\ne0\\)。將 \\(x^2-${s}x+1=0\\) 兩邊同除以 \\(x\\)，得 \\(x-${s}+\\dfrac{1}{x}=0\\)，所以 \\(x+\\dfrac{1}{x}=${s}\\)。`
        );
        continue;
      }

      if (mode === 3) {
        const a = randInt(2, 8);
        add(
          `解方程式：\\(\\sqrt{(x^2-${a * a})^2}+|x-${a}|=0\\)。`,
          `\\(x=${a}\\)`,
          `平方根與絕對值都不小於 0，兩項相加為 0 時，兩項都必須是 0。因此 \\(x^2-${a * a}=0\\) 且 \\(x-${a}=0\\)，共同符合的是 \\(x=${a}\\)。`
        );
        continue;
      }

      const shift = randInt(1, 4);
      const xValue = randInt(1, 5);
      const t = xValue + shift;
      const product = t * (t + 1) * (t + 2) * (t + 3);
      add(
        `求正整數解：\\((x+${shift})(x+${shift + 1})(x+${shift + 2})(x+${shift + 3})=${product}\\)。`,
        `\\(x=${xValue}\\)`,
        `把首尾與中間兩項配對：令 \\(u=(x+${shift})(x+${shift + 3})\\)，則 \\((x+${shift + 1})(x+${
          shift + 2
        })=u+2\\)。原式變成 \\(u(u+2)=${product}\\)。取正整數解，可得 \\(x=${xValue}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j3-4 延伸：邏輯排錯與公共根討論 ────────────────────────────────────
  function buildJ342LogicPublicRootDiscussionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(detail);
    };

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const r1 = randInt(-6, -1);
        const r2 = randInt(2, 7);
        const b = -(r1 + r2);
        const c = r1 * r2;
        let wrongA = 1;
        let wrongB = c;
        for (let d = -12; d <= 12; d += 1) {
          if (d !== 0 && c % d === 0 && d !== r1 && d !== r2) {
            wrongA = d;
            wrongB = c / d;
            break;
          }
        }
        const wrongSumA = randInt(-7, -2);
        const wrongSumB = -b - wrongSumA;
        const wrongSumText = formatArithmeticSum(wrongSumA, wrongSumB);
        add(
          `某一元二次方程式首項係數為 1。甲看錯一次項係數，得到兩根 \\(${wrongA},${wrongB}\\)；乙看錯常數項，得到兩根 \\(${wrongSumA},${wrongSumB}\\)。求原方程式的兩根。`,
          `兩根為 \\(${r1}\\) 與 \\(${r2}\\)`,
          `甲看錯一次項，所以常數項仍正確，\\(c=${wrongA}\\cdot${wrongB}=${c}\\)。乙看錯常數項，所以一次項係數仍正確，兩根和為 \\(${wrongSumText}=${-b}\\)，因此一次項係數為 \\(${b}\\)。原式為 \\(${formatQuadraticEquation(
            1,
            b,
            c
          )}\\)，解得兩根 \\(${r1}\\) 與 \\(${r2}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        const r = randInt(2, 8);
        const c = r * randInt(1, 5);
        const k = (c - r * r) / r;
        add(
          `若 \\(x^2-${r}x=0\\) 與 \\(x^2+kx-${c}=0\\) 有一個公共根，求 \\(k\\) 的值。`,
          `\\(k=${formatDecimalValue(k)}\\)`,
          `第一個方程式的根為 \\(0\\) 與 \\(${r}\\)。第二個方程式常數項為 \\(-${c}\\)，所以 \\(x=0\\) 不可能是它的根，只能代入 \\(x=${r}\\)。得到 \\(${r * r}+${r}k-${c}=0\\)，故 \\(k=${formatDecimalValue(k)}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        const r = randInt(2, 9);
        add(
          `已知 \\(x=${r}\\) 是 \\(ax^2+bx+c=0\\) 的一根，且 \\(a+b+c=0\\)，求該方程式的兩根。`,
          `兩根為 \\(1\\) 與 \\(${r}\\)`,
          `由 \\(a+b+c=0\\) 可知把 \\(x=1\\) 代入會成立，所以 \\(x=1\\) 是一根。題目又給 \\(x=${r}\\) 是一根，因此兩根為 \\(1\\) 與 \\(${r}\\)。`
        );
        continue;
      }

      if (mode === 3) {
        const a = randInt(2, 8);
        const limit = randInt(16, 50);
        const values = [];
        for (let n = 1; n * n <= limit; n += 1) values.push(n * n);
        add(
          `若 \\((x-${a})^2=k\\) 有整數解，且 \\(0<k\\le ${limit}\\)，求 \\(k\\) 可能的值。`,
          `\\(k=${values.join(', ')}\\)`,
          `因 \\(x\\) 為整數，\\(x-${a}\\) 也是整數，所以 \\(k\\) 必須是正完全平方數。在 \\(0<k\\le ${limit}\\) 中，可能為 \\(${values.join(', ')}\\)。`
        );
        continue;
      }

      const b = 2 * randInt(2, 8);
      const c = randInt(-10, 10);
      const correct = (b / 2) * (b / 2);
      const wrong = correct + randInt(1, 5);
      const constantTerm = c === 0 ? '' : c > 0 ? `+${c}` : `-${Math.abs(c)}`;
      add(
        `某同學解 \\(x^2+${b}x${constantTerm}=0\\) 時，配方寫成「兩邊同加 ${wrong}」。請判斷這一步是否正確；若不正確，應改成同加多少？`,
        `不正確，應同加 ${correct}`,
        `配方法要加的是一次項係數一半的平方。此題一次項係數為 ${b}，所以應加 \\((\\dfrac{${b}}{2})^2=${correct}\\)，不是 ${wrong}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j3-2-1 新增：平方根定義關係推導 ──────────────────────────────────────
  // 「若 a 是 Nb 的平方根」→ a²=Nb，求關係或求值
  function buildJ321SqrtDefinitionRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;

      if (mode === 0) {
        // 若 a 是 Nb 的平方根，則 a、b 的關係
        const N = randInt(2, 8);
        questions.push(`若 \\(a\\) 是 \\(${N}b\\) 的平方根，則 \\(a\\) 和 \\(b\\) 的關係為何？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(a^2=${N}b\\)，或 \\(b=\\dfrac{a^2}{${N}}\\)`,
          `由定義，\\(a^2=${N}b\\)，即 \\(b=\\dfrac{a^2}{${N}}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        // 若 p 是 q 的一個平方根（且 q 可推算），求 q 的平方根
        const r = randInt(2, 12); // root
        const offset = randInt(1, 8);
        const q = r * r + offset; // 5 + x = q → x = q - 5
        const base = randInt(2, 15);
        const target = base + offset; // base + x = target
        // 若 r 是 (base + x) 的一個平方根 → base + x = r² → x = r² - base
        const x = r * r - base;
        if (x <= 0) {
          i -= 1;
          continue;
        }
        const sqrtTarget = Math.sqrt(r * r);
        // 求 x 的平方根
        const sqrtX = Math.sqrt(x);
        const sqrtXStr = isPerfectSquare(x) ? `\\pm${Math.sqrt(x)}` : `\\pm\\sqrt{${x}}`;
        questions.push(`若 \\(${r}\\) 是 \\(${base}+x\\) 的一個平方根，求 \\(x\\) 的平方根。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${sqrtXStr}\\)`,
          `由定義，\\(${r}^2=${base}+x\\)，得 \\(x=${r * r}-${base}=${x}\\)。` +
            `故 \\(x\\) 的平方根為 \\(${sqrtXStr}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        // 若(a+b)是x的一個平方根，則另一個平方根是?
        const p = randInt(1, 6),
          q = randInt(1, 6);
        questions.push(`若 \\((${p}a+${q}b)\\) 是 \\(x\\) 的一個平方根，則 \\(x\\) 的另一個平方根是什麼？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(-${p}a-${q}b\\)`,
          `兩個平方根互為相反數，所以另一個平方根為 \\(-(${p}a+${q}b)=-${p}a-${q}b\\)。`
        );
        continue;
      }

      // mode 3: 若 a、b 都是 x 的平方根，則 a+b=?
      const v = randInt(4, 100);
      const sq = isPerfectSquare(v) ? v : v + (Math.floor(Math.sqrt(v)) * Math.floor(Math.sqrt(v)) - v + 1);
      if (!isPerfectSquare(sq)) {
        i -= 1;
        continue;
      }
      const sqrtV = Math.sqrt(sq);
      questions.push(`若 \\(a\\)、\\(b\\) 都是 \\(${sq}\\) 的平方根（\\(a\\neq b\\)），求 \\(a+b\\) 的值。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `0`,
        `\\(${sq}\\) 的兩個平方根互為相反數：\\(+${sqrtV}\\) 和 \\(-${sqrtV}\\)，所以 \\(a+b=0\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── j3-2-1 新增：由平方根反推未知數 (ax+b)² 的平方根是 ±c ──────────────
  function buildJ321SqrtReverseSquareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;

      if (mode === 0) {
        // (ax+b)² 的平方根是 ±c，求 x
        const a = randInt(1, 4);
        const b = randInt(1, 10) * (randInt(0, 1) ? 1 : -1);
        const c = randInt(3, 15);
        // ax+b=c → x=(c-b)/a; ax+b=-c → x=(-c-b)/a
        const x1num = c - b,
          x2num = -c - b;
        const fmtFrac = (n, d) => (d === 1 ? `${n}` : `\\dfrac{${n}}{${d}}`);
        const gcd1 = (function g(x, y) {
          return y ? g(y, x % y) : x;
        })(Math.abs(x1num), a);
        const gcd2 = (function g(x, y) {
          return y ? g(y, x % y) : x;
        })(Math.abs(x2num), a);
        const x1 = fmtFrac(x1num / gcd1, a / gcd1);
        const x2 = fmtFrac(x2num / gcd2, a / gcd2);
        const aStr = a === 1 ? '' : `${a}`;
        const bStr = b >= 0 ? `+${b}` : `${b}`;
        questions.push(`若 \\((${aStr}x${bStr})^2\\) 的平方根為 \\(\\pm${c}\\)，求 \\(x\\)。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(x=${x1}\\) 或 \\(x=${x2}\\)`,
          `\\((${aStr}x${bStr})^2=${c}^2=${c * c}\\)，所以 \\(${aStr}x${bStr}=\\pm${c}\\)。` +
            `解得 \\(x=${x1}\\) 或 \\(x=${x2}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        // 若 -k 是 (ax+b) 的平方根，求 ax+b 和 x
        const k = randInt(2, 10); // k is the positive root, -k is "one" root
        const a = randInt(1, 4);
        const b = randInt(0, 10);
        // -k is a square root of (ax+b) → ax+b = k²
        const target = k * k;
        const xNum = target - b;
        if (a === 0 || xNum < 0 || xNum % a !== 0) {
          i -= 1;
          continue;
        }
        const x = xNum / a;
        const aStr = a === 1 ? '' : `${a}`;
        const bStr = b > 0 ? `+${b}` : b === 0 ? '' : `${b}`;
        questions.push(
          `若 \\(-${k}\\) 是 \\(${aStr}x${bStr}\\) 的一個平方根，求 \\(${aStr}x${bStr}\\) 的值及 \\(x\\) 的值。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${aStr}x${bStr}=${target}\\)，\\(x=${x}\\)`,
          `由定義，\\((-${k})^2=${aStr}x${bStr}\\)，即 \\(${target}=${aStr}x${bStr}\\)。` +
            `所以 \\(${aStr}x${bStr}=${target}\\)，解得 \\(x=${x}\\)。`
        );
        continue;
      }

      // mode 2: (3x+2)²的平方根是±c，求x（有分數解）
      const a2 = randInt(2, 5);
      const b2 = randInt(-8, 8);
      if (b2 === 0) {
        i -= 1;
        continue;
      }
      const c2 = randInt(3, 15);
      const x1n = c2 - b2,
        x2n = -c2 - b2;
      const fmtFrac = (n, d) => {
        const g = (function gg(x, y) {
          return y ? gg(y, x % y) : x;
        })(Math.abs(n), d);
        return d / g === 1 ? `${n / g}` : `\\dfrac{${n / g}}{${d / g}}`;
      };
      const aStr2 = a2 === 1 ? '' : `${a2}`;
      const bStr2 = b2 > 0 ? `+${b2}` : `${b2}`;
      questions.push(`若 \\((${aStr2}x${bStr2})^2\\) 的平方根是 \\(\\pm${c2}\\)，求 \\(x\\)。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(x=${fmtFrac(x1n, a2)}\\) 或 \\(x=${fmtFrac(x2n, a2)}\\)`,
        `\\(${aStr2}x${bStr2}=\\pm${c2}\\)，` + `解得 \\(x=${fmtFrac(x1n, a2)}\\) 或 \\(x=${fmtFrac(x2n, a2)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── j3-2-1 新增：兩個平方根聯立求解 ──────────────────────────────────────
  // Ax+By 是 P² 的正/負平方根，Cx+Dy 是 Q² 的正/負平方根，求 x, y 或 x+y
  function buildJ321SqrtLinearSystemSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const seen = new Set();

    function coefficientText(value, variable) {
      const abs = Math.abs(value);
      return `${abs === 1 ? '' : abs}${variable}`;
    }

    function formatLinear(a, b) {
      const first = `${a < 0 ? '-' : ''}${coefficientText(a, 'x')}`;
      const second = `${b < 0 ? '-' : '+'}${coefficientText(b, 'y')}`;
      return `${first}${second}`;
    }

    function rootSignText(value) {
      return value >= 0 ? '正' : '負';
    }

    function squareRootsText(value) {
      if (value === 0) return '0';
      return `\\pm${formatRadical(value)}`;
    }

    function makeSystemResult(x0, y0, a, b, c, d) {
      if (a * d - b * c === 0) return null;
      const firstValue = a * x0 + b * y0;
      const secondValue = c * x0 + d * y0;
      if (firstValue === 0 || secondValue === 0) return null;
      return {
        firstExpr: formatLinear(a, b),
        secondExpr: formatLinear(c, d),
        firstValue,
        secondValue,
      };
    }

    function buildOne(mode) {
      if (mode === 0) {
        const x0 = randInt(1, 9);
        const y0 = randInt(1, 9);
        const data = makeSystemResult(x0, y0, randInt(1, 4), randInt(1, 4), randInt(1, 4), -randInt(1, 4));
        if (!data) return null;
        return {
         question:
           `若 \\(${data.firstExpr}\\) 是 \\(${data.firstValue * data.firstValue}\\) 的${rootSignText(data.firstValue)}平方根，` +
           `\\(${data.secondExpr}\\) 是 \\(${data.secondValue * data.secondValue}\\) 的${rootSignText(data.secondValue)}平方根，求 \\(x+y\\)。`,
          summary: `\\(x+y=${x0 + y0}\\)`,
         answer:
            `由平方根的正負可列 \\(${data.firstExpr}=${data.firstValue}\\)、\\(${data.secondExpr}=${data.secondValue}\\)。` +
            `解此聯立方程組得 \\(x=${x0},\\ y=${y0}\\)，所以 \\(x+y=${x0 + y0}\\)。`,
        };
      }

      if (mode === 1) {
        const y0 = randInt(1, 7);
        const diff = randInt(1, 9);
        const x0 = y0 + diff;
        const data = makeSystemResult(x0, y0, 2, 3, 1, -2);
        if (!data) return null;
        return {
         question:
           `若 \\(2x+3y\\) 是 \\(${data.firstValue * data.firstValue}\\) 的${rootSignText(data.firstValue)}平方根，` +
           `\\(x-2y\\) 是 \\(${data.secondValue * data.secondValue}\\) 的${rootSignText(data.secondValue)}平方根，求 \\(x-y\\) 的平方根。`,
          summary: `\\(${squareRootsText(diff)}\\)`,
         answer:
            `由題意得 \\(2x+3y=${data.firstValue}\\)、\\(x-2y=${data.secondValue}\\)，聯立解得 \\(x=${x0},\\ y=${y0}\\)。` +
            `所以 \\(x-y=${diff}\\)，其平方根為 \\(${squareRootsText(diff)}\\)。`,
        };
      }

      if (mode === 2) {
        const x0 = randInt(2, 16);
        const y0 = randInt(2, 16);
        const data = makeSystemResult(x0, y0, randInt(1, 4), randInt(1, 4), randInt(1, 4), randInt(1, 4));
        if (!data) return null;
        return {
         question:
           `若 \\(${data.firstExpr}\\) 是 \\(${data.firstValue * data.firstValue}\\) 的正平方根，` +
           `\\(${data.secondExpr}\\) 是 \\(${data.secondValue * data.secondValue}\\) 的正平方根，求 \\(x\\)、\\(y\\) 的平方根。`,
          summary: `x 的平方根為 \\(${squareRootsText(x0)}\\)，y 的平方根為 \\(${squareRootsText(y0)}\\)`,
         answer:
            `由題意得 \\(${data.firstExpr}=${data.firstValue}\\)、\\(${data.secondExpr}=${data.secondValue}\\)，聯立解得 \\(x=${x0},\\ y=${y0}\\)。` +
            `\\(x\\) 的平方根為 \\(${squareRootsText(x0)}\\)，\\(y\\) 的平方根為 \\(${squareRootsText(y0)}\\)。`,
        };
      }

      if (mode === 3) {
        const x0 = randInt(1, 8);
        const y0 = randInt(1, 8);
        const target = x0 + 2 * y0;
        const data = makeSystemResult(x0, y0, 3, 1, 2, -1);
        if (!data) return null;
        return {
         question:
           `若 \\(3x+y\\) 是 \\(${data.firstValue * data.firstValue}\\) 的${rootSignText(data.firstValue)}平方根，` +
           `\\(2x-y\\) 是 \\(${data.secondValue * data.secondValue}\\) 的${rootSignText(data.secondValue)}平方根，求 \\(x+2y\\) 的平方根。`,
          summary: `\\(${squareRootsText(target)}\\)`,
         answer:
            `由題意得 \\(3x+y=${data.firstValue}\\)、\\(2x-y=${data.secondValue}\\)，聯立解得 \\(x=${x0},\\ y=${y0}\\)。` +
            `所以 \\(x+2y=${target}\\)，其平方根為 \\(${squareRootsText(target)}\\)。`,
        };
      }

      const x0 = randInt(2, 10);
      const y0 = randInt(1, x0 - 1);
      const a = randInt(2, 5);
      const data = makeSystemResult(x0, y0, 1, a, a, -1);
      if (!data) return null;
      const diff = x0 - y0;
     return {
       question:
         `若 \\(x+${a}y\\) 是 \\(${data.firstValue * data.firstValue}\\) 的${rootSignText(data.firstValue)}平方根，` +
         `\\(${a}x-y\\) 是 \\(${data.secondValue * data.secondValue}\\) 的${rootSignText(data.secondValue)}平方根，求 \\(x-y\\) 的平方根。`,
        summary: `\\(${squareRootsText(diff)}\\)`,
       answer:
          `由題意得 \\(x+${a}y=${data.firstValue}\\)、\\(${a}x-y=${data.secondValue}\\)，聯立解得 \\(x=${x0},\\ y=${y0}\\)。` +
          `所以 \\(x-y=${diff}\\)，其平方根為 \\(${squareRootsText(diff)}\\)。`,
      };
    }

    let attempts = 0;
    while (questions.length < count && attempts < count * 80) {
      attempts += 1;
      const item = buildOne(randInt(0, 4));
      if (!item || seen.has(item.question)) continue;
     seen.add(item.question);
     questions.push(item.question);
      pushAnswerWithManualSummary(answers, summaryAnswers, item.summary, item.answer);
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j3-2-2 新增：根式表達式大小比較 ──────────────────────────────────────
  function buildJ322RadicalCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;

      if (mode === 0) {
        // 比較 a√b 和 c√d（整數係數×根號）
        const a = randInt(2, 8),
          b = pickNonSquare(2, 15);
        const c = randInt(2, 8),
          d = pickNonSquare(2, 15);
        const left = a * a * b,
          right = c * c * d;
        const sign = left > right ? '>' : left < right ? '<' : '=';
        questions.push(
          `比較大小：\\(${a}\\sqrt{${b}}\\) ○ \\(${c}\\sqrt{${d}}\\)（填入 \\(>\\)、\\(<\\) 或 \\(=\\)）。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${a}\\sqrt{${b}}${sign}${c}\\sqrt{${d}}\\)`,
          `因為都是正數，可比較平方：\\((${a}\\sqrt{${b}})^2=${a * a * b}\\)，\\((${c}\\sqrt{${d}})^2=${c * c * d}\\)。` +
            `由於 \\(${left}${sign}${right}\\)，所以 \\(${a}\\sqrt{${b}}${sign}${c}\\sqrt{${d}}\\)。`
        );
        continue;
      }

     if (mode === 1) {
        // 比較整數加根式與整數，移項後以平方比較。
       const n = randInt(3, 10);
        const radicand = pickNonSquare(2, 80);
        const integerPart = Math.floor(Math.sqrt(radicand));
        const comparisonInteger = n + integerPart + randInt(0, 1);
        const threshold = comparisonInteger - n;
        const sign3 = radicand > threshold * threshold ? '>' : '<';
       questions.push(
          `比較大小：\\(${n}+\\sqrt{${radicand}}\\) ○ \\(${comparisonInteger}\\)（填入 \\(>\\)、\\(<\\) 或 \\(=\\)）。`
       );
       pushAnswerWithManualSummary(
         answers,
         summaryAnswers,
          `\\(${n}+\\sqrt{${radicand}}${sign3}${comparisonInteger}\\)`,
          `移項後比較 \\(\\sqrt{${radicand}}\\) 與 \\(${threshold}\\)；兩者皆非負，比較平方得 \\(${radicand}${sign3}${threshold * threshold}\\)。`
       );
       continue;
     }

      if (mode === 2) {
       // 比較三個根式表達式的大小，取整數比較
       const base = randInt(10, 30);
       const vals = [base - randInt(1, 3), base, base + randInt(1, 3)].map((v) => pickNonSquare(v, v + 2));
        if (new Set(vals).size < 3) {
          i -= 1;
          continue;
        }
       const [va, vb, vc] = vals;
        const labels = ['a', 'b', 'c'];
        const sorted = [va, vb, vc].map((v, idx) => ({ v, label: labels[idx] })).sort((x, y) => x.v - y.v);
        const orderStr = sorted.map((s) => `\\(\\sqrt{${s.v}}\\)`).join(' < ');
        questions.push(
          `比較 \\(a=\\sqrt{${va}}\\)、\\(b=\\sqrt{${vb}}\\)、\\(c=\\sqrt{${vc}}\\) 的大小，由小到大排列。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          orderStr,
          `因為 \\(${sorted[0].v}<${sorted[1].v}<${sorted[2].v}\\)（被開方數越大，方根越大），所以 ${orderStr}。`
        );
        continue;
      }

      // mode 3: 比較 √a-√b 和 √c-√d（差型比較）
      const a3 = randInt(15, 50),
        b3 = randInt(2, 10);
      const c3 = randInt(15, 50),
        d3 = randInt(2, 10);
      if (a3 === c3 || b3 === d3) {
        i -= 1;
        continue;
      }
      const left3 = Math.sqrt(a3) - Math.sqrt(b3);
      const right3 = Math.sqrt(c3) - Math.sqrt(d3);
      if (left3 <= 0 || right3 <= 0) {
        i -= 1;
        continue;
      }
      const sign4 = left3 > right3 ? '>' : left3 < right3 ? '<' : '=';
      questions.push(
        `比較大小：\\(\\sqrt{${a3}}-\\sqrt{${b3}}\\) ○ \\(\\sqrt{${c3}}-\\sqrt{${d3}}\\)（填入 \\(>\\)、\\(<\\) 或 \\(=\\)）。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(\\sqrt{${a3}}-\\sqrt{${b3}}${sign4}\\sqrt{${c3}}-\\sqrt{${d3}}\\)`,
        `利用有理化：\\(\\sqrt{${a3}}-\\sqrt{${b3}}=\\dfrac{${a3 - b3}}{\\sqrt{${a3}}+\\sqrt{${b3}}}\\)，` +
          `\\(\\sqrt{${c3}}-\\sqrt{${d3}}=\\dfrac{${c3 - d3}}{\\sqrt{${c3}}+\\sqrt{${d3}}}\\)。比較後得 \\(${sign4}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── j3-2-3 新增：等腰三角形面積（畢氏定理求高）────────────────────────
  function buildJ323IsoscelesTriangleAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    while (questions.length < count) {
      const mode = questions.length % 3;

      if (mode === 0) {
        // 等腰三角形：腰 l，底邊 2d，高 h=√(l²-d²)，面積=d·h
        const d = randInt(3, 12);
        const h = randInt(4, 20);
        const l2 = d * d + h * h;
        const l = Math.sqrt(l2);
        if (!Number.isInteger(l)) {
          continue;
        }
        const base = 2 * d;
        const area = d * h;
        questions.push(`一等腰三角形，兩腰長均為 \\(${l}\\) 公分，底邊長 \\(${base}\\) 公分，求面積。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${area}\\) 平方公分`,
          `高 \\(h=\\sqrt{${l}^2-${d}^2}=\\sqrt{${l2 - d * d}}=${h}\\)，面積 \\(=\\dfrac{1}{2}\\times${base}\\times${h}=${area}\\) 平方公分。`
        );
        continue;
      }

      if (mode === 1) {
        // 等腰直角三角形：面積 S 已知，求斜邊
        const leg = randInt(3, 15);
        const area = (leg * leg) / 2;
        if (!Number.isInteger(area)) continue;
        const hyp = formatRadical(2 * leg * leg);
        questions.push(`一等腰直角三角形的面積為 \\(${area}\\) 平方公分，求斜邊長。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${hyp}\\) 公分`,
          `設兩股均為 \\(a\\)，則面積 \\(=\\frac{1}{2}a^2=${area}\\)，解得 \\(a=${leg}\\)。斜邊 \\(=${hyp}\\) 公分。`
        );
        continue;
      }

      // mode 2: 等腰三角形三邊已知（整數腰，底整數），求面積
      const leg2 = randInt(5, 20);
      const halfBase = randInt(3, leg2 - 1);
      const h2sq = leg2 * leg2 - halfBase * halfBase;
      if (h2sq <= 0) continue;
      const h2 = Math.sqrt(h2sq);
      const base2 = 2 * halfBase;
      const areaVal = formatScaledRadical(halfBase, h2sq);
      const hStr = formatRadical(h2sq);
      questions.push(`一等腰三角形，腰長 \\(${leg2}\\)，底邊長 \\(${base2}\\)，求面積。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${areaVal}\\)`,
        `高 \\(h=\\sqrt{${leg2}^2-${halfBase}^2}=\\sqrt{${h2sq}}=${hStr}\\)，面積 \\(=\\dfrac{1}{2}\\times${base2}\\times${hStr}=${areaVal}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── j3-2-3 新增：直角三角形三邊比 + 周長/面積互求 ──────────────────────
  function buildJ323RatioPerimAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const tripleRatios = [
      { ratio: [3, 4, 5], label: '3：4：5', sum: 12 },
      { ratio: [5, 12, 13], label: '5：12：13', sum: 30 },
      { ratio: [8, 15, 17], label: '8：15：17', sum: 40 },
      { ratio: [7, 24, 25], label: '7：24：25', sum: 56 },
    ];
    while (questions.length < count) {
      const mode = questions.length % 4;
      const triIdx = Math.floor(questions.length / 4) % tripleRatios.length;
      const tri = tripleRatios[triIdx % tripleRatios.length];
      const [a, b, c] = tri.ratio;
      const k = randInt(2, 10);

      if (mode === 0) {
        // 已知周長，求面積
        const perim = tri.sum * k;
        const area = ((a * b) / 2) * k * k;
        questions.push(`一直角三角形三邊之比為 \\(${tri.label}\\)，周長為 \\(${perim}\\) 公分，求面積。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${area}\\) 平方公分`,
          `設三邊為 \\(${a}k,${b}k,${c}k\\)，周長 \\(${tri.sum}k=${perim}\\)，得 \\(k=${k}\\)。` +
            `面積 \\(=\\frac{1}{2}\\times${a * k}\\times${b * k}=${area}\\) 平方公分。`
        );
        continue;
      }

      if (mode === 1) {
        // 已知面積，求周長
        const area2 = ((a * b) / 2) * k * k;
        const perim2 = tri.sum * k;
        if (!Number.isInteger(area2)) continue;
        questions.push(`一直角三角形三邊之比為 \\(${tri.label}\\)，面積為 \\(${area2}\\) 平方公分，求周長。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${perim2}\\) 公分`,
          `設三邊為 \\(${a}k,${b}k,${c}k\\)，面積 \\(\\frac{${a * b}}{2}k^2=${area2}\\)，得 \\(k=${k}\\)。` +
            `周長 \\(=${tri.sum}\\times${k}=${perim2}\\) 公分。`
        );
        continue;
      }

      if (mode === 2) {
        // 已知最長邊（斜邊），求面積
        const hyp = c * k;
        const area3 = ((a * b) / 2) * k * k;
        if (!Number.isInteger(area3)) continue;
        questions.push(`一直角三角形三邊之比為 \\(${tri.label}\\)，斜邊長為 \\(${hyp}\\) 公分，求面積。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${area3}\\) 平方公分`,
          `斜邊為 \\(${c}k=${hyp}\\)，得 \\(k=${k}\\)。兩股分別為 \\(${a * k}\\) 和 \\(${b * k}\\)。` +
            `面積 \\(=\\frac{1}{2}\\times${a * k}\\times${b * k}=${area3}\\) 平方公分。`
        );
        continue;
      }

      // mode 3: 已知較小股，求斜邊
      const shortLeg = a * k;
      const hyp3 = c * k;
      questions.push(`一直角三角形三邊之比為 \\(${tri.label}\\)，最短股長 \\(${shortLeg}\\) 公分，求斜邊長。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${hyp3}\\) 公分`,
        `最短股為 \\(${a}k=${shortLeg}\\)，得 \\(k=${k}\\)。斜邊 \\(=${c}k=${hyp3}\\) 公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── j3-2-3 新增：梯形中用畢氏定理求斜腰/高後算面積 ──────────────────────
  function buildJ323TrapezoidPythagSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    while (questions.length < count) {
      const mode = questions.length % 3;

      if (mode === 0) {
        // 直角梯形：下底 a，上底 b，高 h，求斜腰和面積
        const a = randInt(8, 20);
        const b = randInt(3, a - 2);
        const h = randInt(4, 15);
        const diff = a - b;
        const leg2 = diff * diff + h * h;
        const legStr = formatRadical(leg2);
        const area = formatFraction((a + b) * h, 2);
        questions.push(`一直角梯形，上底 \\(${b}\\)、下底 \\(${a}\\)、高 \\(${h}\\)，求斜腰長和面積。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `斜腰 \\(${legStr}\\)，面積 \\(${area}\\) 平方單位`,
          `斜腰 \\(=\\sqrt{${diff}^2+${h}^2}=\\sqrt{${leg2}}=${legStr}\\)。` +
            `面積 \\(=\\dfrac{(${b}+${a})\\times${h}}{2}=${area}\\) 平方單位。`
        );
        continue;
      }

      if (mode === 1) {
        // 等腰梯形：上底 b，下底 a，腰 l（整數），求高和面積
        const a2 = randInt(10, 24);
        const b2 = randInt(2, a2 - 4);
        const diff2 = (a2 - b2) / 2;
        if (!Number.isInteger(diff2)) continue;
        const h2 = randInt(4, 15);
        const l2 = diff2 * diff2 + h2 * h2;
        const l = Math.sqrt(l2);
        if (!Number.isInteger(l)) continue;
        const area2 = formatFraction((a2 + b2) * h2, 2);
        questions.push(`一等腰梯形，上底 \\(${b2}\\)、下底 \\(${a2}\\)、腰長 \\(${l}\\)，求高和面積。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `高 \\(${h2}\\)，面積 \\(${area2}\\) 平方單位`,
          `作高後，底邊超出部分為 \\(\\dfrac{${a2}-${b2}}{2}=${diff2}\\)。` +
            `高 \\(h=\\sqrt{${l}^2-${diff2}^2}=\\sqrt{${l2 - diff2 * diff2}}=${h2}\\)。` +
            `面積 \\(=\\dfrac{(${b2}+${a2})\\times${h2}}{2}=${area2}\\) 平方單位。`
        );
        continue;
      }

      // mode 2: 梯形已知兩底和兩腰，求面積（等腰梯形）
      const a3 = randInt(12, 28);
      const b3 = randInt(4, a3 - 4);
      if ((a3 - b3) % 2 !== 0) continue;
      const half = (a3 - b3) / 2;
      const l3 = randInt(half + 3, half + 12);
      const h3sq = l3 * l3 - half * half;
      if (h3sq <= 0) continue;
      const h3Str = formatRadical(h3sq);
      const areaStr = formatHalfScaledRadical(a3 + b3, h3sq);
      questions.push(`一等腰梯形，上底 \\(${b3}\\)、下底 \\(${a3}\\)、腰長 \\(${l3}\\)，求面積。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `\\(${areaStr}\\) 平方單位`,
        `作高後，兩底超出的一半為 \\(${half}\\)，高 \\(=\\sqrt{${l3}^2-${half}^2}=${h3Str}\\)。` +
          `面積 \\(=\\dfrac{(${b3}+${a3})\\times${h3Str}}{2}=${areaStr}\\) 平方單位。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ321RadicandVariableRangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const mode = questions.length % 5;

      if (mode === 0) {
        const a = randInt(2, 7);
        const b = randInt(2, 15);
        const minX = Math.ceil(b / a);
        questions.push(`若 $\\sqrt{${a}x-${b}}$ 為實數，求 $x$ 的最小整數值。`);
        answers.push(`簡答：${minX}。過程：根號內需 $${a}x-${b}\\ge0$，所以 $x\\ge\\frac{${b}}{${a}}$。`);
        continue;
      }

      if (mode === 1) {
        const m = randInt(18, 80);
        const a = randInt(1, 5);
        const values = [];
        for (let x = 1; x <= Math.floor((m - 1) / a); x += 1) {
          const inside = m - a * x;
          if (inside > 0 && isPerfectSquare(inside)) values.push(x);
        }
        if (!values.length) continue;
        const axText = a === 1 ? 'x' : `${a}x`;
        questions.push(`已知 $\\sqrt{${m}-${axText}}$ 為正整數，求所有可能的正整數 $x$。`);
        answers.push(`簡答：$x=${values.join(', ')}$。過程：令根號內為正完全平方數。`);
        continue;
      }

      if (mode === 2) {
        const a = randInt(2, 9);
        const b = randInt(2, 9);
        const n = a * a + randInt(1, 2 * a);
        const m = b * b + randInt(1, 2 * b);
        questions.push(`若 $a<\\sqrt{${n}}<a+1$，且 $b<\\sqrt{${m}}<b+1$，求 $a+b$。`);
        answers.push(
          `簡答：${a + b}。過程：因為 $${a * a}<${n}<${(a + 1) ** 2}$，所以左式的 $a=${a}$；同理 $b=${b}$。`
        );
        continue;
      }

      if (mode === 3) {
        const c = randInt(2, 12);
        const rightIsNegativeSide = randInt(0, 1) === 0;
        const rhs = rightIsNegativeSide ? `${c}-x` : `x-${c}`;
        const range = rightIsNegativeSide ? `x\\le ${c}` : `x\\ge ${c}`;
        questions.push(`已知 $\\sqrt{(x-${c})^2}=${rhs}$，求 $x$ 的範圍。`);
        answers.push(`簡答：$${range}$。過程：$\\sqrt{(x-${c})^2}=|x-${c}|$，再依絕對值定義判斷。`);
        continue;
      }

      const items = [
        { text: `3\\sqrt{${randInt(2, 6)}}`, value: 0 },
        { text: `2\\sqrt{${randInt(3, 10)}}`, value: 0 },
        { text: `\\sqrt{${randInt(12, 35)}}`, value: 0 },
      ];
      items[0].value = 9 * Number(items[0].text.match(/\{(\d+)\}/)[1]);
      items[1].value = 4 * Number(items[1].text.match(/\{(\d+)\}/)[1]);
      items[2].value = Number(items[2].text.match(/\{(\d+)\}/)[1]);
      if (new Set(items.map((item) => item.value)).size < 3) continue;
      const sorted = [...items].sort((left, right) => left.value - right.value);
      questions.push(`比較 $${items.map((item) => item.text).join('$、$')}$ 的大小，並由小到大排列。`);
      answers.push(`簡答：$${sorted.map((item) => item.text).join('<')}$。過程：三者皆非負，可平方後比較。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ321IntegerFractionalEstimateSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const mode = questions.length % 5;

      if (mode === 0) {
        const a = randInt(2, 9);
        const n = a * a + randInt(1, 2 * a);
        questions.push(`設 $\\sqrt{${n}}$ 的整數部分為 $p$、小數部分為 $q$，求 $pq+q^2$。`);
        answers.push(
          `簡答：$${n}-${a}\\sqrt{${n}}$。過程：$p=${a}$，$q=\\sqrt{${n}}-${a}$，所以 $pq+q^2=q(p+q)=q\\sqrt{${n}}$。`
        );
        continue;
      }

      if (mode === 1) {
        const root = randInt(4, 15);
        const n = root * root + randInt(1, root - 1);
       const nearest = Math.round(Math.sqrt(n));
       const diff = nearest * nearest > n ? `${nearest}-\\sqrt{${n}}` : `\\sqrt{${n}}-${nearest}`;
       questions.push(`已知 $x=\\sqrt{${n}}$，求最接近 $x$ 的整數，並寫出 $x$ 與該整數的差。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `最接近的整數為 ${nearest}，差為 $${diff}$`,
          `先由 \\(${root}^2<${n}<${root + 1}^2\\) 確定 \\(\\sqrt{${n}}\\) 介於相鄰整數間，再比較與兩端整數的距離。`
        );
       continue;
      }

      if (mode === 2) {
        const low = randInt(3, 12);
        const high = low + randInt(2, 8);
        const total = high * high - low * low - 1;
        questions.push(`求 $\\sqrt{n}$ 介於 ${low} 與 ${high} 之間的所有正整數 $n$ 共有幾個？`);
        answers.push(`簡答：${total} 個。過程：$${low}<\\sqrt n<${high}$ 等價於 $${low * low}<n<${high * high}$。`);
        continue;
      }

      if (mode === 3) {
        const base = [4, 9, 16, 25, 36][randInt(0, 4)];
        const smallZeros = randInt(1, 2);
        const largeZeros = randInt(2, 5);
        const small = base / 10 ** (2 * smallZeros);
        const large = base * 10 ** (2 * largeZeros);
        const smallRoot = Math.sqrt(small);
        const largeRoot = Math.sqrt(large);
        questions.push(`分別求 $\\sqrt{${formatDecimalValue(small)}}$ 與 $\\sqrt{${large}}$ 的值，並比較兩者的小數點位置。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(\\sqrt{${formatDecimalValue(small)}}=${formatDecimalValue(smallRoot)}\\)，\\(\\sqrt{${large}}=${largeRoot}\\)`,
          `將被開方數拆成完全平方數與 \\(10\\) 的偶數次方；開平方後，\\(10\\) 的指數減半。`
       );
       continue;
      }

      const whole = randInt(1, 12);
      const digit = randInt(1, 8);
      const n = whole * whole + Math.ceil((2 * whole * digit + 1) / 10 + randInt(0, 1));
      if (Math.floor(Math.sqrt(n) * 10) % 10 !== digit) continue;
      questions.push(`利用十分逼近法，求 $\\sqrt{${n}}$ 小數點後第一位數字。`);
      answers.push(`簡答：${digit}。過程：比較 $( ${whole}.${digit} )^2$ 與相鄰十分位的平方即可判斷。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ322SqrtAlgebraIdentitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const sum = randInt(6, 18);
        const product = randInt(1, Math.floor((sum * sum - 1) / 4));
        const value = sum * sum - 2 * product;
        questions.push(`已知 $x+y=${sum}$、$xy=${product}$，求 $\\sqrt{x^2+y^2}$。`);
        answers.push(`簡答：$${formatRadical(value)}$。過程：$x^2+y^2=(x+y)^2-2xy=${value}$。`);
        continue;
      }

      if (mode === 1) {
        const power = [6, 10, 20, 100, 2026][randInt(0, 4)];
        questions.push(`若 $\\sqrt{x}+\\sqrt{y}=0$，求 $x^{${power}}+y^{${power}}$。`);
        answers.push(`簡答：0。過程：$\\sqrt{x}$、$\\sqrt{y}$ 都是非負數，和為 0 只能 $x=0,y=0$。`);
        continue;
      }

      if (mode === 2) {
        const a = randInt(1, 5);
        const b = randInt(-8, 8);
        const c = randInt(2, 14);
        const x1 = formatFraction(c - b, a);
        const x2 = formatFraction(-c - b, a);
        const linear = formatPolynomialFromCoeffs([a, b]);
        questions.push(`解方程式 $\\sqrt{(${linear})^2}=${c}$。`);
        answers.push(`簡答：$x=${x1}$ 或 $x=${x2}$。過程：$|${linear}|=${c}$。`);
        continue;
      }

      if (mode === 3) {
        const u = [3, 5, 7, 9][randInt(0, 3)];
        const v = [5, 7, 9, 11][randInt(0, 3)];
        const diff = u * u;
        const sum = v * v;
        const x = (sum + diff) / 2;
        const y = (sum - diff) / 2;
        questions.push(`若 $x-y$ 的平方根是 $\\pm${u}$，且 $x+y$ 的算術平方根是 ${v}，求 $x,y$。`);
        answers.push(`簡答：$x=${x},\\ y=${y}$。過程：$x-y=${diff}$，$x+y=${sum}$，聯立解得。`);
        continue;
      }

      const m = randInt(2, 20);
      const n = randInt(2, 20);
      questions.push(`一直角三角形兩股長分別為 $\\sqrt{${m}}$、$\\sqrt{${n}}$，求斜邊長。`);
      answers.push(`簡答：$${formatRadical(m + n)}$。過程：斜邊平方為 $${m}+${n}=${m + n}$。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ322RadicalChainOperationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const mode = questions.length % 5;

      if (mode === 0) {
        const p = randInt(2, 5);
        const q = randInt(p + 1, p + 5);
        const r = randInt(q + 1, q + 5);
        const inner = p * p;
        const middleAdd = q * q - p;
        const outerAdd = r * r - q;
        questions.push(`求 $\\sqrt{${outerAdd}+\\sqrt{${middleAdd}+\\sqrt{${inner}}}}$ 的值。`);
        answers.push(`簡答：${r}。過程：由內往外算，$\\sqrt{${inner}}=${p}$，再依序得到 ${q}、${r}。`);
        continue;
      }

      if (mode === 1) {
        const m = randInt(1, 9);
        const n = randInt(1, 9);
        const a = 2 * m * n;
        const b = m * m + n * n - 1;
        questions.push(`已知 $a=${a}$、$b=${b}$，求 $\\sqrt{a+b+1}$。`);
        answers.push(`簡答：${m + n}。過程：$a+b+1=${a + b + 1}=(${m + n})^2$。`);
        continue;
      }

      if (mode === 2) {
        const a = pickNonSquare(2, 18);
        const b = pickNonSquare(2, 18);
        questions.push(`計算 $(\\sqrt{${a}}+\\sqrt{${b}})(\\sqrt{${a}}-\\sqrt{${b}})$。`);
        answers.push(`簡答：${a - b}。過程：利用平方差，原式 $=${a}-${b}$。`);
        continue;
      }

      if (mode === 3) {
        const totalRoot = randInt(3, 12);
        const left = randInt(1, totalRoot - 1);
        const right = totalRoot - left;
        const k = left * left + right * right + 2 * left * right;
        questions.push(`若 $k=\\sqrt{${left * left}}+\\sqrt{${right * right}}$，求 $k$ 的算術平方根。`);
        answers.push(
          `簡答：$\\sqrt{${totalRoot}}$。過程：$k=${left}+${right}=${totalRoot}$，所以算術平方根為 $\\sqrt{${totalRoot}}$。`
        );
        continue;
      }

      const exps = [randInt(1, 6), randInt(1, 6), randInt(1, 6)];
      const isSquare = exps.every((value) => value % 2 === 0);
      const need = [2, 3, 5].filter((_, index) => exps[index] % 2 === 1);
      const multiplier = need.length ? need.join('\\times') : '1';
      questions.push(
        `判斷 $2^{${exps[0]}}\\times3^{${exps[1]}}\\times5^{${exps[2]}}$ 是否為完全平方數；若不是，最少需再乘多少才會成為完全平方數？`
      );
      answers.push(
        `簡答：${isSquare ? '是完全平方數' : `不是，最少再乘 $${multiplier}$`}。過程：質因數分解中每個指數都要是偶數。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ323GeometrySqrtApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const sideFloor = randInt(5, 20);
        const area = sideFloor * sideFloor + randInt(1, 2 * sideFloor);
        questions.push(`一正方形面積為 ${area} 平方公分，求其邊長介在哪兩個連續整數之間。`);
        answers.push(
          `簡答：介於 ${sideFloor} 與 ${sideFloor + 1} 之間。過程：$${sideFloor ** 2}<${area}<${(sideFloor + 1) ** 2}$。`
        );
        continue;
      }

      if (mode === 1) {
        const a = randInt(3, 12);
        const b = randInt(4, 15);
        const hyp2 = a * a + b * b;
        const estimate = Math.round(Math.sqrt(hyp2));
        questions.push(`已知直角三角形兩股為 ${a}, ${b}，求斜邊長的估計整數值。`);
        answers.push(`簡答：約 ${estimate}。過程：斜邊為 $\\sqrt{${hyp2}}$，再比較鄰近平方數。`);
        continue;
      }

      if (mode === 2) {
        const rFloor = randInt(3, 15);
        const areaCoeff = rFloor * rFloor + randInt(1, 2 * rFloor);
        questions.push(`一個圓的面積為 $${areaCoeff}\\pi$，求其半徑的整數部分。`);
        answers.push(
          `簡答：${rFloor}。過程：$r=\\sqrt{${areaCoeff}}$，且 $${rFloor ** 2}<${areaCoeff}<${(rFloor + 1) ** 2}$。`
        );
        continue;
      }

      if (mode === 3) {
        const n = pickNonSquare(2, 20);
        questions.push(`將三個邊長為 $\\sqrt{${n}}$ 的正方形排成一直列，求排成後長方形的總周長。`);
        answers.push(
          `簡答：$${formatRadical(64 * n)}$。過程：排成長 $3\\sqrt{${n}}$、寬 $\\sqrt{${n}}$ 的長方形，周長為 $2(3\\sqrt{${n}}+\\sqrt{${n}})=8\\sqrt{${n}}$。`
        );
        continue;
      }

      const side = randInt(2, 8);
      const volume = side ** 3;
      questions.push(`若一立方體體積為 ${volume}，求其表面積與體對角線長。`);
      answers.push(
        `簡答：表面積 ${6 * side * side}，體對角線 $${side}\\sqrt{3}$。過程：邊長為 $\\sqrt[3]{${volume}}=${side}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ311FormulaChainEvaluationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const s = randInt(3, 8);
        const x2 = s * s - 2;
        const x4 = x2 * x2 - 2;
        questions.push(`已知 $x+\\frac{1}{x}=${s}$，求 $x^4+\\frac{1}{x^4}$ 的值。`);
        answers.push(`簡答：${x4}。過程：先平方得 $x^2+\\frac{1}{x^2}=${s}^2-2=${x2}$，再平方得 $${x2}^2-2=${x4}$。`);
        continue;
      }

      if (mode === 1) {
        const s = randInt(3, 9);
        const value = s * s - 2;
        questions.push(`已知 $x^2-${s}x+1=0$，求 $x^2+\\frac{1}{x^2}$ 的值。`);
        answers.push(
          `簡答：${value}。過程：兩邊同除以 $x$，得 $x+\\frac{1}{x}=${s}$，所以 $x^2+\\frac{1}{x^2}=${s}^2-2=${value}$。`
        );
        continue;
      }

      if (mode === 2) {
        const product = randInt(1, 6);
        const sqsum = randInt(2 * product, 2 * product + 12);
        const squareSum = sqsum + 2 * product;
        const value = squareSum * squareSum;
        questions.push(`若 $a^2+b^2=${sqsum}$，且 $ab=${product}$，求 $(a+b)^4$ 的值。`);
        answers.push(
          `簡答：${value}。過程：$(a+b)^2=a^2+b^2+2ab=${sqsum}+${2 * product}=${squareSum}$，所以 $(a+b)^4=${squareSum}^2=${value}$。`
        );
        continue;
      }

      if (mode === 3) {
        const half = randInt(1, 8);
        const sqsum = 2 * half;
        questions.push(`已知 $a+b+c=0$，且 $a^2+b^2+c^2=${sqsum}$，求 $ab+bc+ca$。`);
        answers.push(`簡答：${-half}。過程：$(a+b+c)^2=a^2+b^2+c^2+2(ab+bc+ca)$，所以 $0=${sqsum}+2(ab+bc+ca)$。`);
        continue;
      }

      const m = randInt(1, 4);
      const m2 = m * m;
      const m4 = m2 * m2;
      questions.push(`利用平方差公式化簡：$(x-${m})(x+${m})(x^2+${m2})(x^4-${m4})$。`);
      answers.push(`簡答：$(x^4-${m4})^2$。過程：$(x-${m})(x+${m})=x^2-${m2}$，再乘 $(x^2+${m2})$ 得 $x^4-${m4}$。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ313FactorRemainderReverseChainSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const r1 = pickNonZero(-4, 4);
        let r2 = pickNonZero(-4, 4);
        while (r2 === r1) r2 = pickNonZero(-4, 4);
        const s = pickNonZero(-5, 5);
        const coeffA = -(r1 + r2 + s);
        const coeffB = r1 * r2 + s * (r1 + r2);
        const constant = -r1 * r2 * s;
        questions.push(
          `若 $(x${r1 >= 0 ? '-' : '+'}${Math.abs(r1)})$ 與 $(x${r2 >= 0 ? '-' : '+'}${Math.abs(r2)})$ 皆為 $x^3+ax^2+bx${constant >= 0 ? '+' : ''}${constant}$ 的因式，求 $a,b$。`
        );
        answers.push(
          `簡答：$a=${coeffA},\\ b=${coeffB}$。過程：第三個根為 $${s}$，所以多項式為 $${formatFactorFromRoot(r1)}${formatFactorFromRoot(r2)}${formatFactorFromRoot(s)}$。`
        );
        continue;
      }

      if (mode === 1) {
        const p = randInt(1, 5);
        const r = randInt(-2, 4);
        const n = randInt(4, 7);
        const value = (r + p) ** n;
        questions.push(`不展開，求 $(x+${p})^{${n}}$ 除以 ${formatFactorFromRoot(r)} 的餘式。`);
        answers.push(`簡答：$${value}$。過程：餘式為 $f(${r})=(${r}+${p})^{${n}}=${value}$。`);
        continue;
      }

      if (mode === 2) {
        const r = pickNonZero(-4, 4);
        const lead = pickNonZero(-3, 3);
        const quad = randInt(-6, 6);
        const constant = pickNonZero(-8, 8);
        const k = pickNonZero(-8, 8);
        const remainder = lead * r ** 3 + quad * r ** 2 + k * r + constant;
        const symbolicPoly = joinJ113PolyTerms([
          formatJ113PolyTerm(lead, 'x^3'),
          formatJ113PolyTerm(quad, 'x^2'),
          'kx',
          formatJ113PolyTerm(constant, ''),
        ]);
        questions.push(
          `若 $${symbolicPoly}$ 除以 $(x${r >= 0 ? '-' : '+'}${Math.abs(r)})$ 的餘式為 ${remainder}，求 $k$。`
        );
        answers.push(`簡答：$k=${k}$。過程：代入 $x=${r}$，令 $f(${r})=${remainder}$。`);
        continue;
      }

      if (mode === 3) {
        const r = randInt(-4, 4);
        const rem = pickNonZero(-9, 9);
        const scale = pickNonZero(-5, 5);
        const shift = randInt(-8, 8);
        const result = scale * rem + shift;
        const scaleText = scale === 1 ? 'A' : scale === -1 ? '-A' : `${scale}A`;
        const shiftText = shift === 0 ? '' : `${shift >= 0 ? '+' : ''}${shift}`;
        questions.push(
          `已知多項式 $A$ 除以 ${formatFactorFromRoot(r)} 的餘式為 ${rem}，求 $${scaleText}${shiftText}$ 除以同一除式的餘式。`
        );
        answers.push(
          `簡答：$${result}$。過程：新餘式為 $${scale}\\cdot(${rem})${shiftText}=${result}$。`
        );
        continue;
      }

      const p = pickNonZero(-5, 5);
      let q = pickNonZero(-5, 5);
      while (q === p) q = pickNonZero(-5, 5);
      const lead = randInt(1, 4);
      const constant = lead * p * q;
      const poly = formatPolynomialFromCoeffs([lead, -lead * (p + q), constant]);
      questions.push(`已知 $f(x)$ 為二次多項式，且 $f(${p})=0$、$f(${q})=0$、$f(0)=${constant}$，求 $f(x)$。`);
      answers.push(
        `簡答：$f(x)=${poly}$。過程：$f(x)=${lead === 1 ? '' : lead}${formatFactorFromRoot(p)}${formatFactorFromRoot(q)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ311GeometricFormulaModelSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const a = randInt(2, 5);
        const b = randInt(2, 8);
        const c = randInt(1, b - 1);
        const area = addPolyCoeffs(multiplyPolyCoeffs([a, b], [a, b]), multiplyPolyCoeffs([-4], [1, -2 * c, c * c]));
        const side = formatPolynomialFromCoeffs([a, b]);
        questions.push(`設 $x>${c}$。一正方形邊長為 $${side}$，四個角各剪去邊長 $x-${c}$ 的小正方形，求剩餘面積。`);
        answers.push(`簡答：$${formatPolynomialFromCoeffs(area)}$。過程：剩餘面積 $=(${side})^2-4(x-${c})^2$。`);
        continue;
      }

      if (mode === 1) {
        const m = randInt(2, 6);
        const n = randInt(1, 5);
        const area = formatPolynomialFromCoeffs([m * m, 2 * m * n, n * n]);
        questions.push(`設 $x>0$。一圓的直徑為 $${2 * m}x+${2 * n}$，求其面積的多項式表示（以 $\\pi$ 表示）。`);
        answers.push(`簡答：$(${area})\\pi$。過程：半徑為 $${m}x+${n}$，面積為 $\\pi(${m}x+${n})^2$。`);
        continue;
      }

      if (mode === 2) {
        const p = randInt(1, 5);
        const q = randInt(p + 1, p + 6);
        const volume = multiplyPolyCoeffs([1, 0], multiplyPolyCoeffs([1, p], [1, q]));
        questions.push(`設 $x>0$。一長方體的長、寬、高分別為 $x$、$x+${p}$、$x+${q}$，求體積的展開式。`);
        answers.push(`簡答：$${formatPolynomialFromCoeffs(volume)}$。過程：體積為長、寬、高相乘，展開後再合併同類項。`);
        continue;
      }

      if (mode === 3) {
        const p = randInt(1, 6);
        const a = randInt(2, 5);
        const b = randInt(1, 8);
        const area = multiplyPolyCoeffs([1, p], [a, b]);
        questions.push(`設 $x>0$。一個長方形面積為 $${formatPolynomialFromCoeffs(area)}$，其中一邊長為 $x+${p}$，求另一邊長。`);
        answers.push(`簡答：$${formatPolynomialFromCoeffs([a, b])}$。過程：長方形面積等於兩邊長相乘，將已知面積因式分解即可反推。`);
        continue;
      }

      const outer = randInt(3, 7);
      const inner = randInt(1, outer - 1);
      const diff = outer - inner;
      const sum = outer + inner;
      const outerSide = formatPolynomialFromCoeffs([outer, 0]);
      const innerSide = formatPolynomialFromCoeffs([inner, 0]);
      const firstFactor = formatPolynomialFromCoeffs([diff, 0]);
      const secondFactor = formatPolynomialFromCoeffs([sum, 0]);
      questions.push(`設 $x>0$。邊長 $${outerSide}$ 的正方形內部挖去邊長 $${innerSide}$ 的小正方形，求剩餘 L 型區域面積並因式分解。`);
      answers.push(
        `簡答：$${outer * outer - inner * inner}x^2=(${firstFactor})(${secondFactor})$。過程：用平方差 $A^2-B^2=(A-B)(A+B)$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ312DegreeCoefficientDeepSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const m = randInt(2, 5);
        const n = pickNonZero(-5, 5);
        const c = randInt(1, 7);
        const relation = joinJ113PolyTerms([formatJ113PolyTerm(n, 'a'), formatJ113PolyTerm(m, 'b')]);
        questions.push(`若 $(ax^2+bx+${c})(${m}x${n >= 0 ? '+' : ''}${n})$ 展開後不含 $x^2$ 項，求 $a,b$ 的關係。`);
        answers.push(`簡答：$${relation}=0$。過程：$x^2$ 項來自 $ax^2\\cdot ${n}$ 與 $bx\\cdot ${m}x$。`);
        continue;
      }

      if (mode === 1) {
        const p = randInt(2, 5);
        const q = randInt(-4, 5);
        const n = randInt(4, 6);
        const value = (p + q) ** n;
        const base = formatPolynomialFromCoeffs([p, q]);
        questions.push(`求 $(${base})^{${n}}$ 展開式中所有係數的總和。`);
        answers.push(`簡答：${value}。過程：係數總和令 $x=1$，得 $(${p + q})^{${n}}=${value}$。`);
        continue;
      }

      if (mode === 2) {
        const a = pickNonZero(-4, 4);
        const b = randInt(-6, 6);
        const c = randInt(-8, 8);
        const d = pickNonZero(-4, 4);
        const e = randInt(-6, 6);
        const A = formatPolynomialFromCoeffs([a, b, c, randInt(-5, 5)]);
        const B = formatPolynomialFromCoeffs([d, e, randInt(-7, 7)]);
        questions.push(`已知 $A=${A}$、$B=${B}$，判斷 $A\\times B$ 與 $A+B$ 的次數。`);
        answers.push(`簡答：$A\\times B$ 為五次，$A+B$ 為三次。過程：最高次項係數皆不為 0；相乘時次數相加，相加時比較最高次項。`);
        continue;
      }

      if (mode === 3) {
        const kValue = randInt(-4, 5);
        const mValue = randInt(-4, 5);
        const p = -kValue;
        const q = -mValue;
        const cubicCoeff = formatPolynomialFromCoeffs([1, p], 'k');
        const quadraticCoeff = formatPolynomialFromCoeffs([1, q], 'm');
        const cubicFactor = cubicCoeff === 'k' ? 'k' : `(${cubicCoeff})`;
        const quadraticFactor = quadraticCoeff === 'm' ? 'm' : `(${quadraticCoeff})`;
        questions.push(
          `若 $${cubicFactor}x^3+${quadraticFactor}x^2+5x+1$ 為一次多項式，求 $k,m$。`
        );
        answers.push(`簡答：$k=${kValue},\\ m=${mValue}$。過程：三次項與二次項係數都要為 0。`);
        continue;
      }

      const a = randInt(1, 6);
      const b = randInt(a + 1, a + 6);
      const c = randInt(b + 1, b + 6);
      questions.push(`找出多項式 $(x+${a})(x+${b})(x+${c})$ 的常數項與次數。`);
      answers.push(`簡答：常數項 ${a * b * c}，次數 3。過程：常數項由三個常數相乘得到；三個一次式相乘的次數為 3。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ311FastNumberFormulaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const n = randInt(100, 9999);
        questions.push(`利用公式速算：$${n}^2-${n - 1}\\times${n + 1}$。`);
        answers.push(`簡答：1。過程：${n}^2-(${n}-1)(${n}+1)=${n}^2-(${n}^2-1)=1。`);
        continue;
      }

      if (mode === 1) {
        const center = randInt(20, 90);
        const step = randInt(1, 9) / 10;
        const left = formatDecimalValue(center - step);
        const right = formatDecimalValue(center + step);
        const value = formatDecimalValue(center * center - step * step);
        questions.push(`利用平方差公式速算：$${left}\\times${right}$。`);
        answers.push(`簡答：${value}。過程：$(${center}-${step})(${center}+${step})=${center}^2-${step}^2$。`);
        continue;
      }

      if (mode === 2) {
        const base = randInt(20, 300);
        questions.push(`已知 $${base + 1}^2=${base}^2+${2 * base}+k$，求 $k$。`);
        answers.push(`簡答：$k=1$。過程：$(n+1)^2=n^2+2n+1$。`);
        continue;
      }

      if (mode === 3) {
        const a = randInt(100, 3000);
        const b = a - randInt(1, 20);
        questions.push(`計算：$\\frac{${a}^2-${b}^2}{${a}+${b}}$。`);
        answers.push(`簡答：${a - b}。過程：$\\frac{a^2-b^2}{a+b}=a-b$。`);
        continue;
      }

      const next = randInt(100, 1000);
      const a = next - 1;
      questions.push(`若 $a=${a}$，求 $a^2+2a+1$ 的值。`);
      answers.push(`簡答：${next * next}。過程：$a^2+2a+1=(a+1)^2=${next}^2$。`);
    }
    return { questions, summaryAnswers, answers };
  }

  const nextConfigs = {
    'j1-1-3-biquadratic-split-square-factoring': {
      type: 'drill',
      title: '二次三項式的拆項配方因式分解',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113BiquadraticSplitSquareFactoringSet(5);
      },
    },
    'j1-1-3-binary-quadratic-cross-factoring': {
      type: 'drill',
      title: '二元二次式的雙十字交乘法因式分解',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113BinaryQuadraticCrossFactoringSet(5);
      },
    },
    'j3-1-1-formula-mixed-integer-drill': {
      type: 'drill',
      title: '乘法公式綜合（整數版）',
      difficulty: 'easy',
      questionCount: 4,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ311FormulaMixedSet(practiceCount, 'integer'), resolvePracticeCount(count, 4));
      },
    },
    'j3-1-1-formula-mixed-decimal-drill': {
      type: 'drill',
      title: '乘法公式綜合（小數版）',
      difficulty: 'easy',
      questionCount: 4,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ311FormulaMixedSet(practiceCount, 'decimal'), resolvePracticeCount(count, 4));
      },
    },
    'j3-1-1-formula-mixed-fraction-drill': {
      type: 'drill',
      title: '乘法公式綜合（分數版）',
      difficulty: 'medium',
      questionCount: 4,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ311FormulaMixedSet(practiceCount, 'fraction'), resolvePracticeCount(count, 4));
      },
    },
    'j3-1-1-formula-mixed-variable-drill': {
      type: 'drill',
      title: '乘法公式綜合版（未知數）',
      difficulty: 'medium',
      questionCount: 4,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ311VariableFormulaMixedSet(practiceCount), resolvePracticeCount(count, 4));
      },
    },
    'j3-1-1-perfect-square-parameter-drill': {
      type: 'drill',
      title: '完全平方公式係數判定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ311PerfectSquareParameterSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-1-1-formula-chain-evaluation-drill': {
      type: 'drill',
      title: '求值公式的連鎖反應',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ311FormulaChainEvaluationSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-1-1-geometric-formula-model-drill': {
      type: 'drill',
      title: '乘法公式的幾何模型',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ311GeometricFormulaModelSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-1-1-fast-number-formula-drill': {
      type: 'drill',
      title: '複雜數值的公式速算',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ311FastNumberFormulaSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'sum-square-variable-drill': {
      type: 'drill',
      title: '和平方未知數版',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildBinomialQuestions(5, 'sum', 'variable');
      },
    },
    'difference-square-variable-drill': {
      type: 'drill',
      title: '差平方未知數版',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildBinomialQuestions(5, 'diff', 'variable');
      },
    },
    'square-difference-variable-drill': {
      type: 'drill',
      title: '平方差未知數展開',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildDifferenceOfSquaresQuestions(5, 'variable');
      },
    },
    'square-difference-factorization-variable-drill': {
      type: 'drill',
      title: '平方差未知數分解',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildFactorizationQuestions(5);
      },
    },
    'identity-value-integer-basic-drill': {
      type: 'drill',
      title: '求值整數版',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildIdentityIntegerBasicSet(5);
      },
    },
    'identity-value-pair-mixed-drill': {
      type: 'drill',
      title: '求值公式綜合版（三選二）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildIdentityPairMixedSet(5);
      },
    },
    'identity-value-pair-advanced-drill': {
      type: 'drill',
      title: '求值公式進階版（三選二）',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildIdentityPairAdvancedSet(5);
      },
    },
    'identity-value-sum-sqsum-to-product-drill': {
      type: 'drill',
      title: '由 a+b、a^2+b^2 求 ab',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildSumSqsumToProductSet(5);
      },
    },
    'identity-value-diff-sqsum-to-product-drill': {
      type: 'drill',
      title: '由 a-b、a^2+b^2 求 ab',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildDiffSqsumToProductSet(5);
      },
    },
    'identity-value-sum-product-drill': {
      type: 'drill',
      title: '由 a+b、ab 開始求值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildIdentitySumProductSet(5);
      },
    },
    'identity-value-product-sqsum-drill': {
      type: 'drill',
      title: '由 ab、a^2+b^2 求 a+b、a-b',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildProductSqsumSet(5);
      },
    },
    'identity-value-square-pair-drill': {
      type: 'drill',
      title: '由 (a+b)^2、(a-b)^2 求值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildSquarePairSet(5);
      },
    },
    'identity-value-linear-combination-drill': {
      type: 'drill',
      title: '組合式求值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildLinearCombinationSet(5);
      },
    },
    'identity-value-reciprocal-drill': {
      type: 'drill',
      title: '倒數型求值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildReciprocalSet(5);
      },
    },
    'identity-value-reciprocal-reverse-drill': {
      type: 'drill',
      title: '倒數反推型',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildReciprocalReverseSet(5);
      },
    },
    'identity-value-reciprocal-mixed-fraction-drill': {
      type: 'drill',
      title: '倒數混合分式型',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildReciprocalMixedFractionSet(5);
      },
    },
    'identity-value-mixed-advanced-drill': {
      type: 'drill',
      title: '求值進階混合版',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildMixedAdvancedIdentitySet(5);
      },
    },
    'cubic-divide-linear': {
      type: 'drill',
      title: '三次多項式（四項）÷ 一次多項式',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildCubicDivideLinearSet(3);
      },
    },
    'cubic-divide-quadratic': {
      type: 'drill',
      title: '三次多項式（四項）÷ 二次多項式',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildCubicDivideQuadraticSet(3);
      },
    },
    'j3-1-3-polynomial-division-regular-drill': {
      type: 'drill',
      title: '多項式除法正常版（含分數與餘數）',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ313PolynomialDivisionRegularSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-1-3-reverse-division-drill': {
      type: 'drill',
      title: '反面出題（已知商、餘）',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ313ReverseDivisionSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-1-3-coeff-sum-drill': {
      type: 'drill',
      title: '係數和與常數項題型',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ313CoeffSumSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-1-3-remainder-theorem-drill': {
      type: 'drill',
      title: '餘式定理應用題型',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ313RemainderTheoremSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-1-3-factor-theorem-drill': {
      type: 'drill',
      title: '因式定理與未知係數判定',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ313FactorTheoremSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-1-3-special-product-structure-drill': {
      type: 'drill',
      title: '特殊乘積結構化簡',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ313SpecialProductStructureSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-1-3-factor-remainder-reverse-chain-drill': {
      type: 'drill',
      title: '多項式除法與因式定理逆推',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ313FactorRemainderReverseChainSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-1-2-polynomial-add-subtract-drill': {
      type: 'drill',
      title: '多項式加減運算（樣式與直式）',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312PolynomialAddSubSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-1-2-degree-constraint-drill': {
      type: 'drill',
      title: '根據次數性質反求參數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312DegreeConstraintSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-1-2-degree-coefficient-deep-judgement-drill': {
      type: 'drill',
      title: '次數與係數的深度判定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312DegreeCoefficientDeepSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-1-2-polynomial-reverse-application-drill': {
      type: 'drill',
      title: '多項式逆推應用',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312PolynomialReverseSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-1-2-polynomial-substitution-drill': {
      type: 'drill',
      title: '多項式代值計算',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312PolynomialSubstitutionSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-1-2-mul-easy-mixed-drill': {
      type: 'drill',
      title: '多項式乘法（簡易版）',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312MulEasyMixedSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-1-2-mul-mono-mono-drill': {
      type: 'drill',
      title: '單項式 × 單項式',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312MulEasyMonoMonoSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-1-2-mul-mono-linear-drill': {
      type: 'drill',
      title: '單項式 × 一次多項式',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312MulEasyMonoLinearSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-1-2-mul-mono-quadratic-drill': {
      type: 'drill',
      title: '單項式 × 二次多項式',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312MulEasyMonoQuadraticSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-1-2-mul-advanced-mixed-drill': {
      type: 'drill',
      title: '進階多項式乘法',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312MulAdvMixedSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-1-2-mul-linear-linear-drill': {
      type: 'drill',
      title: '一次式 × 一次式',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312MulAdvLinearLinearSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-1-2-mul-linear-quadratic-drill': {
      type: 'drill',
      title: '一次式 × 二次式',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312MulAdvLinearQuadraticSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-1-2-mul-quadratic-quadratic-drill': {
      type: 'drill',
      title: '二次式 × 二次式',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312MulAdvQuadraticQuadraticSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-1-2-div-monomial-mixed-drill': {
      type: 'drill',
      title: '多項式除以單項式',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312DivMonomialMixedSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-1-2-div-mono-by-mono-drill': {
      type: 'drill',
      title: '單項式 ÷ 單項式',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312DivMonomialByMonomialSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-1-2-div-binomial-by-mono-drill': {
      type: 'drill',
      title: '二項式 ÷ 單項式',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312DivBinomialByMonomialSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-1-2-div-trinomial-by-mono-drill': {
      type: 'drill',
      title: '三項式 ÷ 單項式（含餘數）',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ312DivTrinomialByMonomialSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'square-root-basic-junior': {
      type: 'drill',
      title: '平方根估算與近似（綜合）',
      difficulty: 'easy',
      questionCount: 8,
      generate() {
        return buildJ321SqrtEstimateMixedSet(8);
      },
    },
    'j3-2-1-exact-square-root-drill': {
      type: 'drill',
      title: '算術平方根直接求值',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ321ExactSquareRootSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-2-1-sqrt-definition-relation': {
      type: 'drill',
      title: '平方根定義關係推導',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ321SqrtDefinitionRelationSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-2-1-sqrt-reverse-square': {
      type: 'drill',
      title: '平方根反推未知數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ321SqrtReverseSquareSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-2-1-sqrt-linear-system': {
      type: 'drill',
      title: '兩平方根聯立求解',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ321SqrtLinearSystemSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-2-1-square-root-compare-drill': {
      type: 'drill',
      title: '平方根大小比較',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ321SquareRootCompareSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-2-1-radicand-variable-range-drill': {
      type: 'drill',
      title: '根號內含變數的範圍判定',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ321RadicandVariableRangeSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-2-1-integer-fractional-estimate-drill': {
      type: 'drill',
      title: '分數部分與進階估計',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ321IntegerFractionalEstimateSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-2-2-radical-formula-drill': {
      type: 'drill',
      title: '根式公式運算',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ322RadicalFormulaSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-2-2-radical-mixed-simplify-drill': {
      type: 'drill',
      title: '根式混合化簡',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ322RadicalMixedSimplifySet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-2-2-radical-compare': {
      type: 'drill',
      title: '根式表達式大小比較',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ322RadicalCompareSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-2-2-sqrt-algebra-identity-drill': {
      type: 'drill',
      title: '平方根與代數恆等式',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ322SqrtAlgebraIdentitySet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-2-2-radical-chain-operation-drill': {
      type: 'drill',
      title: '複合根號與連鎖運算',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ322RadicalChainOperationSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-2-3-triple-expand-drill': {
      type: 'drill',
      title: '畢氏數擴展與倍數',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ323TripleExpandSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-2-3-hypotenuse-altitude-drill': {
      type: 'drill',
      title: '斜邊高與面積性質',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ323HypotenuseAltitudeSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-2-3-coordinate-distance-drill': {
      type: 'drill',
      title: '座標平面兩點距離',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ323CoordinateDistanceSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-2-3-spatial-diagonal-drill': {
      type: 'drill',
      title: '立體圖形空間對角線',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ323SpatialDiagonalSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-2-3-pythagorean-context-drill': {
      type: 'drill',
      title: '畢氏定理生活情境',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ323PythagoreanContextSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-2-3-right-triangle-judgement-drill': {
      type: 'drill',
      title: '畢氏定理直角判定',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ323RightTriangleJudgementSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-2-3-isosceles-triangle-area': {
      type: 'drill',
      title: '等腰三角形面積（畢氏求高）',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ323IsoscelesTriangleAreaSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-2-3-ratio-perim-area': {
      type: 'drill',
      title: '直角三角形三邊比與周長面積',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ323RatioPerimAreaSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-2-3-trapezoid-pythag': {
      type: 'drill',
      title: '梯形畢氏定理求高與面積',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ323TrapezoidPythagSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-2-3-geometry-sqrt-application-drill': {
      type: 'drill',
      title: '幾何圖形中的平方根應用',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ323GeometrySqrtApplicationSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-3-1-core-factoring-mixed': {
      type: 'drill',
      title: '因式分解核心綜合（公因式）',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ331CoreFactoringMixedSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-1-common-factor-basic': {
      type: 'drill',
      title: '基礎單項提取',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ331CommonFactorBasicSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-1-common-factor-polynomial': {
      type: 'drill',
      title: '多項式式子提取',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ331PolynomialFactorSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-1-sign-transform-factoring': {
      type: 'drill',
      title: '變號法則應用',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ331SignTransformSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-1-grouping-advanced-mixed': {
      type: 'drill',
      title: '分組分解進階綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ331GroupingAdvancedMixedSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-1-grouping-factor': {
      type: 'drill',
      title: '分組分解',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ331GroupingFactorSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-1-expand-then-group': {
      type: 'drill',
      title: '先去括號再分組',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ331ExpandThenGroupSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-1-binomial-common-factor': {
      type: 'drill',
      title: '同式公因式提取',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ331BinomialCommonFactorSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-1-multiterm-grouping-advanced-drill': {
      type: 'drill',
      title: '多項式分組分解進階',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ331MultiTermGroupingAdvancedSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-3-2-formula-mixed': {
      type: 'drill',
      title: '公式辨識與應用綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ332FormulaMixedSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-2-diff-squares': {
      type: 'drill',
      title: '平方差公式基礎',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ332DiffSquaresSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-2-perfect-square': {
      type: 'drill',
      title: '完全平方公式基礎',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ332PerfectSquareSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-2-composite-formula': {
      type: 'drill',
      title: '複合運算（先提公因式）',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ332CompositeSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-2-substitution-formula': {
      type: 'drill',
      title: '多項式換項（括號型）',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ332SubstitutionSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-2-cube-formula': {
      type: 'drill',
      title: '立方公式因式分解',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ332CubeFormulaSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-2-higher-power-diff-squares': {
      type: 'drill',
      title: '高次平方差連續分解',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ332HigherPowerDiffSquaresSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-2-fraction-high-power-mixed-drill': {
      type: 'drill',
      title: '分數係數與高次項混合',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ332FractionHighPowerMixedSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-3-2-special-application-drill': {
      type: 'drill',
      title: '特殊常數與幾何應用',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ332SpecialApplicationSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-3-3-cross-core-mixed': {
      type: 'drill',
      title: '十字交乘核心綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ333CrossCoreMixedSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-3-cross-coeff-one': {
      type: 'drill',
      title: '係數為 1 基礎類',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ333CrossCoeffOneSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-3-cross-coeff-nonone': {
      type: 'drill',
      title: '係數不為 1 進階類',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ333CrossCoeffNonOneSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-3-cross-preprocess': {
      type: 'drill',
      title: '負號與公因數預處理',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ333CrossPreprocessSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-3-cross-sub-mixed': {
      type: 'drill',
      title: '十字交乘換元綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ333CrossSubMixedSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-3-cross-substitution': {
      type: 'drill',
      title: '代換換元十字交乘',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ333CrossSubstitutionSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-3-cross-structured': {
      type: 'drill',
      title: '括號型結構十字交乘',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ333CrossStructuredSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-3-factor-parameter-reverse': {
      type: 'drill',
      title: '十字交乘反推係數',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ333FactorParameterReverseSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-3-3-substitution-hidden-structure-drill': {
      type: 'drill',
      title: '變量代換法隱藏結構',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ333SubstitutionHiddenStructureSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-3-3-coefficient-reverse-judgement-drill': {
      type: 'drill',
      title: '係數逆推與因式判定',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ333CoefficientReverseJudgementSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-1-factor-formula-solve': {
      type: 'drill',
      title: '提公因式與平方公式求解',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ341FactorFormulaSolveSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-1-cross-solve': {
      type: 'drill',
      title: '十字交乘專項練習',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ341CrossSolveSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-1-standard-transform-solve': {
      type: 'drill',
      title: '標準式轉化與消因式',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ341StandardTransformSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-1-root-property-reverse': {
      type: 'drill',
      title: '根的性質與方程還原',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ341RootPropertyReverseSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-1-diff-square-solve': {
      type: 'drill',
      title: '差平方型方程式',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ341DiffSquareSolveSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-1-substitute-var-solve': {
      type: 'drill',
      title: '換元法解方程式',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ341SubstituteVarSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-1-hidden-quadratic-structure-advanced': {
      type: 'drill',
      title: '隱藏二次結構與代換',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ341HiddenQuadraticStructureAdvancedSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-1-shared-root': {
      type: 'drill',
      title: '兩方程式共同解',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ341SharedRootSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-2-square-root-solve': {
      type: 'drill',
      title: '平方根觀念求解類',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342SquareRootSolveSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-2-complete-square-term': {
      type: 'drill',
      title: '完全平方補項類',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342CompleteSquareTermSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-2-completing-square-solve': {
      type: 'drill',
      title: '配方法完整求解類',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342CompletingSquareSolveSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-2-discriminant-judge': {
      type: 'drill',
      title: '判別式與根性質判定類',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342DiscriminantSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-2-formula-direct-solve': {
      type: 'drill',
      title: '公式解直接套用類',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342FormulaSolveSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-2-reverse-from-square': {
      type: 'drill',
      title: '配方後形式與參數還原類',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342ReverseFromSquareSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-2-roots-core-mixed': {
      type: 'drill',
      title: '兩根和積核心綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342RootsCoreMixedSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-2-roots-direct': {
      type: 'drill',
      title: '由方程式求兩根和與積',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342RootsSumProductDirectSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-2-roots-reverse': {
      type: 'drill',
      title: '由和積（或兩根）還原方程',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342ReverseEquationFromRootsSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-2-roots-expression': {
      type: 'drill',
      title: '代數式變形（和積）',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342ExpressionBySumProductSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-2-roots-applied-mixed': {
      type: 'drill',
      title: '兩根和積應用綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342RootsAppliedMixedSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-2-two-person-mistake': {
      type: 'drill',
      title: '甲乙各看錯不同係數',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342TwoPersonMistakeSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-2-complete-square-lead-coeff': {
      type: 'drill',
      title: '配方法求首項係數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342CompleteSquareLeadCoeffSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-2-abs-double-zero': {
      type: 'drill',
      title: '絕對值方程式 |f(x)|+|g(x)|=0',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342AbsDoubleZeroSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-2-roots-coefficient-mistake': {
      type: 'drill',
      title: '係數看錯題（和積修正）',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342CoefficientMistakeSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-2-roots-special-relation': {
      type: 'drill',
      title: '特殊根關係（相反數/倒數）',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342SpecialRootRelationSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-2-known-root-parameter': {
      type: 'drill',
      title: '已知一根求參數與另一根',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342KnownRootParameterSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-2-discriminant-range': {
      type: 'drill',
      title: '判別式求參數範圍',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342DiscriminantRangeSet(practiceCount), resolvePracticeCount(count, 6));
      },
    },
    'j3-4-2-discriminant-parameter-advanced': {
      type: 'drill',
      title: '判別式逆推與參數範圍',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342DiscriminantParameterAdvancedSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-2-vieta-advanced-relations': {
      type: 'drill',
      title: '根與係數關係進階變形',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342VietaAdvancedRelationsSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-2-logic-public-root-discussion': {
      type: 'drill',
      title: '公共根與解題排錯',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ342LogicPublicRootDiscussionSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-tile-floor-drill': {
      type: 'drill',
      title: '瓷磚鋪地板問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343TileFloorSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-two-square-perim-area-drill': {
      type: 'drill',
      title: '兩正方形周長與面積問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343TwoSquarePerimAreaSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-consec-odd-square-sum-drill': {
      type: 'drill',
      title: '連續奇（偶）數平方和問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343ConsecOddSquareSumSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-neg-reciprocal-word-drill': {
      type: 'drill',
      title: '負數倒數關係與年份問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343NegReciprocalWordSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-pen-pricing-drill': {
      type: 'drill',
      title: '買筆折扣應用問題',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343PenPricingSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-toy-vendor-drill': {
      type: 'drill',
      title: '玩具攤販利潤問題',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343ToyVendorSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-straw-table-drill': {
      type: 'drill',
      title: '吸管測量桌面問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343StrawTableSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-donation-square-drill': {
      type: 'drill',
      title: '捐款平方關係問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343DonationSquareSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-number-property-word': {
      type: 'drill',
      title: '數字性質與運算問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343NumberPropertyWordSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-geometry-area-word': {
      type: 'drill',
      title: '幾何圖形面積問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343GeometryAreaWordSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-business-sales-word': {
      type: 'drill',
      title: '商業銷售與分攤問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343BusinessWordSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-round-robin': {
      type: 'drill',
      title: '循環賽場次求人數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343RoundRobinSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-garden-path': {
      type: 'drill',
      title: '長方形土地開路問題',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343GardenPathSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-open-box': {
      type: 'drill',
      title: '正方形薄片折成開口盒',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343OpenBoxSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-square-side-change': {
      type: 'drill',
      title: '正方形邊長變化問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343SquareSideChangeSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'j3-4-3-dynamic-geometry-model': {
      type: 'drill',
      title: '複合幾何動態建模',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet((practiceCount) => buildJ343DynamicGeometryModelSet(practiceCount), resolvePracticeCount(count, 5));
      },
    },
    'radical-mul-div-split-rule': {
      type: 'drill',
      title: '根式乘除可拆',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildRadicalMulDivSet(5);
      },
    },
    'radical-add-subtract-like-terms': {
      type: 'drill',
      title: '根式加減同類項',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildRadicalAddLikeTermsSet(5);
      },
    },
    'simplest-radical-form-junior': {
      type: 'drill',
      title: '最簡根式',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildSimplestRadicalSet(5);
      },
    },
    'rationalize-denominator-monomial-junior': {
      type: 'drill',
      title: '單項有理化分母',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildRationalizeMonomialSet(3);
      },
    },
    'rationalize-denominator-binomial-junior': {
      type: 'drill',
      title: '多項有理化分母（平方差）',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildRationalizeBinomialSet(3);
      },
    },
  };

  const bundleFingerprint = 'j3-bundle-v20260715-j33-summary-review-v1';
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== 'object') return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
