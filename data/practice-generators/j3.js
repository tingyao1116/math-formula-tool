(() => {
  const store = window.formulaPracticeStore;
  if (!store || typeof store.registerConfigs !== "function") return;

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

  function buildCubicDivideLinearSet(count) {
    const questions = [];
    const answers = [];

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
    const answers = [];

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildRadicalMulDivSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildRadicalAddLikeTermsSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const k = pickNonSquare(2, 20);
      const c1 = pickNonZero(-8, 8);
      const c2 = pickNonZero(-8, 8);
      questions.push(`化簡：\\(${c1}\\sqrt{${k}} ${c2 >= 0 ? '+' : '-'} ${Math.abs(c2)}\\sqrt{${k}}\\)。`);
      answers.push(
        `\\(${c1}\\sqrt{${k}} ${c2 >= 0 ? '+' : '-'} ${Math.abs(c2)}\\sqrt{${k}}=(${c1 + c2})\\sqrt{${k}}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildSimplestRadicalSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const out = randInt(2, 9);
      const inside = randInt(2, 12);
      const n = out * out * inside;
      questions.push(`化為最簡根式：\\(\\sqrt{${n}}\\)。`);
      answers.push(`\\(\\sqrt{${n}}=${out}\\sqrt{${inside}}\\)。`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildRationalizeMonomialSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildRationalizeBinomialSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 9);
      let b = pickNonSquare(2, 30);
      while (b === a * a) b = pickNonSquare(2, 30);
      questions.push(`有理化分母：\\(\\frac{1}{${a}+\\sqrt{${b}}}\\)。`);
      answers.push(
        `\\(\\frac{1}{${a}+\\sqrt{${b}}}=\\frac{${a}-\\sqrt{${b}}}{(${a}+\\sqrt{${b}})(${a}-\\sqrt{${b}})}=\\frac{${a}-\\sqrt{${b}}}{${a * a - b}}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
      const c = Math.sqrt(a * a + b * b);
      const wording =
        randInt(0, 1) === 0
          ? `兩邊長為 \\(${a}\\)、\\(${b}\\)。若 \\(${b}\\) 是斜邊，求另一邊。`
          : `兩邊長為 \\(${a}\\)、\\(${b}\\)。若 \\(${b}\\) 不是斜邊，求斜邊。`;
      questions.push(wording);
      answers.push(
        randInt(0, 1) === 0 ? `\\(${formatRadical(b * b - a * a)}\\)` : `\\(${formatRadical(a * a + b * b)}\\)`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ323HypotenuseAltitudeSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const type = i % 2;
      if (type === 0) {
        const a = randInt(3, 15);
        const b = randInt(4, 16);
        const c = `\\sqrt{${a * a + b * b}}`;
        questions.push(`直角三角形兩股為 \\(${a},${b}\\)。求斜邊上的高 \\(h\\)。`);
        answers.push(`\\(h=\\frac{${a * b}}{${c}}\\)`);
        continue;
      }
      const area = randInt(12, 80);
      const c = randInt(5, 20);
      questions.push(`已知直角三角形面積為 \\(${area}\\)，斜邊長 \\(${c}\\)，求斜邊上的高。`);
      answers.push(`\\(h=\\frac{2\\times${area}}{${c}}=\\frac{${2 * area}}{${c}}\\)`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ323CoordinateDistanceSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const type = i % 3;
      if (type === 0) {
        const x1 = randInt(-8, 8),
          y1 = randInt(-8, 8);
        const x2 = randInt(-8, 8),
          y2 = randInt(-8, 8);
        questions.push(`平面上兩點 \\(A(${x1},${y1}),B(${x2},${y2})\\) 的距離為何？`);
        answers.push(`\\(\\sqrt{(${x1}-${x2})^2+(${y1}-${y2})^2}\\)`);
        continue;
      }
      if (type === 1) {
        const x = randInt(-15, 15),
          y = randInt(-15, 15);
        questions.push(`點 \\(P(${x},${y})\\) 到原點距離為何？`);
        answers.push(`\\(\\sqrt{${x * x + y * y}}\\)`);
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
      answers.push(`\\(k=\\pm\\sqrt{${xAbs2}}\\)`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ323SpatialDiagonalSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const type = i % 3;
      if (type === 0) {
        const a = randInt(2, 12),
          b = randInt(2, 12),
          c = randInt(2, 12);
        questions.push(`長方體長寬高為 \\(${a},${b},${c}\\)，求體對角線。`);
        answers.push(`\\(\\sqrt{${a * a + b * b + c * c}}\\)`);
        continue;
      }
      if (type === 1) {
        const a = randInt(2, 20);
        questions.push(`正方體邊長為 \\(${a}\\)，求體對角線。`);
        answers.push(`\\(${a}\\sqrt{3}\\)`);
        continue;
      }
      const h = randInt(4, 18),
        c = randInt(6, 20);
      questions.push(`圓柱高為 \\(${h}\\)，底面周長為 \\(${c}\\)。側面展開成長方形後，最短路徑長為何？`);
      answers.push(`\\(\\sqrt{${h * h}+\\left(\\frac{${c}}{2}\\right)^2}\\)`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ331CommonFactorBasicSet(count) {
    function formatMonomial(coeff, power) {
      if (power === 0) return `${coeff}`;
      if (power === 1) return formatCoeffTerm(coeff, 'x', 1);
      return formatCoeffTerm(coeff, 'x', power);
    }
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const xPow = randInt(1, 4);
      const common = pickNonZero(2, 6);
      const a = pickNonZero(1, 9);
      const b = pickNonZero(1, 9);
      const extraPow = randInt(1, 3);
      const leftCoef = common * a;
      const rightCoef = common * b;
      const termA = formatMonomial(leftCoef, xPow + extraPow);
      const termB = formatMonomial(rightCoef, xPow);
      questions.push(`提取公因式：\\(${termA}${b > 0 ? '+' : ''}${termB}\\)`);
      const innerA = formatMonomial(a, extraPow);
      const innerB = `${b}`;
      const outer = xPow === 1 ? `${common}x` : `${common}x^${xPow}`;
      answers.push(`\\(${termA}${b > 0 ? '+' : ''}${termB}= ${outer}(${innerA}${b > 0 ? '+' : ''}${innerB})\\)`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ331PolynomialFactorSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const p = randInt(2, 7);
        questions.push(`提取公因式：\\((x+${p})(x-${p})-(x-${p})\\)`);
        answers.push(`\\((x+${p})(x-${p})-(x-${p})=(x-${p})(x+${p}-1)\\)`);
        continue;
      }
      if (mode === 1) {
        const a = randInt(2, 5);
        const b = randInt(1, 5);
        questions.push(`提取公因式：\\(x(${a}x+${b})-x(x+${b})\\)`);
        answers.push(`\\(x(${a}x+${b})-x(x+${b})=x\\big[(${a}x+${b})-(x+${b})\\big]=x(${a - 1}x)\\)`);
        continue;
      }
      if (mode === 2) {
        const p = randInt(2, 6);
        questions.push(`提取公因式：\\(2(${p}x-1)^2+(${p}x-1)\\)`);
        answers.push(`\\(2(${p}x-1)^2+(${p}x-1)=(${p}x-1)\\big(2(${p}x-1)+1\\big)=(${p}x-1)(${2 * p}x-1)\\)`);
        continue;
      }
      if (mode === 3) {
        const p = randInt(2, 6);
        questions.push(`提取公因式：\\((3x-${p})^2-(3x-${p})\\)`);
        answers.push(`\\((3x-${p})^2-(3x-${p})=(3x-${p})(3x-${p}-1)\\)`);
        continue;
      }
      questions.push(`提取公因式：\\(5(2x-1)^2-3(2x-1)\\)`);
      answers.push(`\\(5(2x-1)^2-3(2x-1)=(2x-1)(10x-8)\\)`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ331SignTransformSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const a = randInt(2, 6);
        const b = randInt(2, 6);
        const c = randInt(2, 7);
        questions.push(`因式分解：\\(${a}(x-${b}y)-${c}(${b}y-x)\\)`);
        answers.push(`\\(${a}(x-${b}y)-${c}(${b}y-x)=(${a}+${c})(x-${b}y)\\)`);
        continue;
      }
      if (mode === 1) {
        const p = randInt(2, 6);
        const q = randInt(2, 6);
        const r = randInt(2, 6);
        questions.push(`因式分解：\\((x+${p})(x-${q})-(x-${r})(${q}-x)\\)`);
        answers.push(`\\((x+${p})(x-${q})-(x-${r})(${q}-x)=(x+${p})(x-${q})+(x-${r})(x-${q})=(x-${q})(2x+${p - r})\\)`);
        continue;
      }
      const A = randInt(3, 7);
      const B = randInt(2, 6);
      const C = randInt(2, 6);
      questions.push(`因式分解：\\(${A}b(a-b)-(${B}-a)^2+${C}(a-b)\\)`);
      answers.push(`\\(${A}b(a-b)-(${B}-a)^2+${C}(a-b)=(${A}b+${C})(a-b)-(a-${B})^2=(a-${B})(${A}b+${C}-a+${B})\\)`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ331GroupingFactorSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const k = randInt(2, 8);
        const t = randInt(2, 9);
        questions.push(`分組分解：\\(x^2-${k}x+${t}x-${t * k}\\)`);
        answers.push(`\\(x^2-${k}x+${t}x-${t * k}=(x-${k})(x+${t})\\)`);
        continue;
      }
      if (mode === 1) {
        const p = randInt(2, 6);
        const q = randInt(2, 6);
        questions.push(`分組分解：\\(${p}x^3+${p}x^2+${q}x+${q}\\)`);
        answers.push(`\\(${p}x^3+${p}x^2+${q}x+${q}=(x+1)(${p}x^2+${q})\\)`);
        continue;
      }
      if (mode === 2) {
        const p = randInt(2, 8);
        const q = [2, 4, 6, 8][randInt(0, 3)];
        const qHalf = q / 2;
        questions.push(`分組分解：\\(2xy+${p}x+${q}y+${p * qHalf}\\)`);
        answers.push(`\\(2xy+${p}x+${q}y+${p * qHalf}=(x+${qHalf})(2y+${p})\\)`);
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
        questions.push(`分組分解：\\(${ax}+${bx}+${cx}+${ay}+${by}+${cy}\\)`);
        answers.push(`\\(${ax}+${bx}+${cx}+${ay}+${by}+${cy}=${a + b + c}(x+y)\\)`);
        continue;
      }
      const k = randInt(2, 5);
      questions.push(`分組分解：\\(${k}ax+by+${k}cx-ay-${k}bx-cy\\)`);
      answers.push(`\\(${k}ax+by+${k}cx-ay-${k}bx-cy=(${k}x-y)(a-b+c)\\)`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ331ExpandThenGroupSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const p = randInt(2, 5);
        const r = randInt(2, 6);
        questions.push(`先去括號再分組：\\(${p}(ab-${r})-(${p * r}a-b)\\)`);
        answers.push(`\\(${p}(ab-${r})-(${p * r}a-b)=(${p}a+1)(b-${r})\\)`);
        continue;
      }
      if (mode === 1) {
        const s = randInt(2, 6);
        questions.push(`先去括號再分組：\\((a-${s})x-(x^2-${s}a)\\)`);
        answers.push(`\\((a-${s})x-(x^2-${s}a)=(x+${s})(a-x)\\)`);
        continue;
      }
      if (mode === 2) {
        const t = randInt(2, 6);
        questions.push(`先去括號再分組：\\((x-${t})a-(a^2-${t}x)\\)`);
        answers.push(`\\((x-${t})a-(a^2-${t}x)=(x-a)(a+${t})\\)`);
        continue;
      }
      if (mode === 3) {
        const t = randInt(2, 6);
        questions.push(`先去括號再分組：\\(x^2-( ${t}-a )x-${t}a\\)`);
        answers.push(`\\(x^2-( ${t}-a )x-${t}a=(x-${t})(x+a)\\)`);
        continue;
      }
      const z = randInt(2, 4);
      questions.push(`先去括號再分組：\\(xy(1+${z}^2)+${z}(x^2+y^2)\\)`);
      answers.push(`\\(xy(1+${z}^2)+${z}(x^2+y^2)=(y+${z}x)(x+${z}y)\\)`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ331CoreFactoringMixedSet(count) {
    const banks = [buildJ331CommonFactorBasicSet, buildJ331PolynomialFactorSet, buildJ331SignTransformSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const fn = banks[i % banks.length];
      const one = fn(1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ331GroupingAdvancedMixedSet(count) {
    const banks = [buildJ331GroupingFactorSet, buildJ331ExpandThenGroupSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const fn = banks[i % banks.length];
      const one = fn(1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ332DiffSquaresSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 10);
      const b = randInt(1, 10);
      const useVar = randInt(0, 1) === 1;
      const ax = formatCoeffTerm(a, 'x', 1);
      const by = formatCoeffTerm(b, 'y', 1);
      if (useVar) {
        const lead = a * a === 1 ? 'x^2' : `${a * a}x^2`;
        questions.push(`因式分解：\\(${lead}-${b * b}\\)`);
        answers.push(`\\(${lead}-${b * b}=(${ax}+${b})(${ax}-${b})\\)`);
      } else {
        questions.push(`因式分解：\\(${a * a}-${b * b}y^2\\)`);
        answers.push(`\\(${a * a}-${b * b}y^2=(${a}+${by})(${a}-${by})\\)`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ332PerfectSquareSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 6);
      const b = randInt(1, 9);
      const sign = randInt(0, 1) === 0 ? '+' : '-';
      const mid = sign === '+' ? 2 * a * b : -2 * a * b;
      const ax = formatCoeffTerm(a, 'x', 1);
      questions.push(`因式分解：\\(${a * a}x^2${mid >= 0 ? '+' : ''}${mid}x+${b * b}\\)`);
      answers.push(`\\(${a * a}x^2${mid >= 0 ? '+' : ''}${mid}x+${b * b}=(${ax}${sign}${b})^2\\)`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ332CompositeSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const k = pickNonZero(2, 8);
      const a = randInt(1, 6);
      const b = randInt(1, 8);
      const mode = i % 2;
      const ax = formatCoeffTerm(a, 'x', 1);
      const by = formatCoeffTerm(b, 'y', 1);
      if (mode === 0) {
        questions.push(`因式分解：\\(${k * a * a}x^2-${k * b * b}y^2\\)`);
        answers.push(`\\(${k * a * a}x^2-${k * b * b}y^2=${k}(${ax}+${by})(${ax}-${by})\\)`);
      } else {
        const mid = -2 * a * b * k;
        questions.push(`因式分解：\\(${k * a * a}x^2${mid >= 0 ? '+' : ''}${mid}x+${k * b * b}\\)`);
        answers.push(`\\(${k * a * a}x^2${mid >= 0 ? '+' : ''}${mid}x+${k * b * b}=${k}(${ax}-${b})^2\\)`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ332SubstitutionSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const p = randInt(1, 5);
      const q = randInt(1, 7);
      const mode = i % 2;
      if (mode === 0) {
        questions.push(`因式分解：\\((2x+${p})^2-${q * q}\\)`);
        answers.push(`\\((2x+${p})^2-${q * q}=(2x+${p}+${q})(2x+${p}-${q})\\)`);
      } else {
        questions.push(`因式分解：\\((x-${p})^2-2${q}(x-${p})+${q * q}\\)`);
        answers.push(`\\((x-${p})^2-2${q}(x-${p})+${q * q}=(x-${p}-${q})^2\\)`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ332FormulaMixedSet(count) {
    const banks = [buildJ332DiffSquaresSet, buildJ332PerfectSquareSet, buildJ332CompositeSet, buildJ332SubstitutionSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ333CrossCoeffOneSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const p = pickNonZero(1, 12);
      const q = pickNonZero(1, 12);
      const s1 = randInt(0, 1) === 0 ? 1 : -1;
      const s2 = randInt(0, 1) === 0 ? 1 : -1;
      const b = s1 * p + s2 * q;
      const c = s1 * p * (s2 * q);
      questions.push(`十字交乘因式分解：\\(x^2${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}\\)`);
      answers.push(
        `\\(x^2${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=(x${s1 > 0 ? '+' : '-'}${p})(x${s2 > 0 ? '+' : '-'}${q})\\)`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ333CrossCoeffNonOneSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a1 = randInt(2, 6);
      const a2 = randInt(2, 6);
      const p = randInt(1, 8);
      const q = randInt(1, 8);
      const s1 = randInt(0, 1) === 0 ? 1 : -1;
      const s2 = randInt(0, 1) === 0 ? 1 : -1;
      const A = a1 * a2;
      const B = a1 * (s2 * q) + a2 * (s1 * p);
      const C = s1 * p * (s2 * q);
      questions.push(`十字交乘因式分解：\\(${A}x^2${B >= 0 ? '+' : ''}${B}x${C >= 0 ? '+' : ''}${C}\\)`);
      answers.push(
        `\\(${A}x^2${B >= 0 ? '+' : ''}${B}x${C >= 0 ? '+' : ''}${C}=(${a1}x${s1 > 0 ? '+' : '-'}${p})(${a2}x${s2 > 0 ? '+' : '-'}${q})\\)`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ333CrossPreprocessSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const g = randInt(2, 6);
      const a1 = randInt(1, 4);
      const a2 = randInt(1, 4);
      const p = randInt(1, 7);
      const q = randInt(1, 7);
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
      questions.push(`\\(${A}x^2${B >= 0 ? '+' : ''}${B}x${C >= 0 ? '+' : ''}${C}\\)`);
      answers.push(
        `\\(${A}x^2${B >= 0 ? '+' : ''}${B}x${C >= 0 ? '+' : ''}${C}=${outer}(${a1}x${s1 > 0 ? '+' : '-'}${p})(${a2}x${s2 > 0 ? '+' : '-'}${q})\\)`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ333CrossSubstitutionSet(count) {
    function formatLinearFactor(u, constant) {
      if (constant === 0) return u === 1 ? 'x' : `${u}x`;
      return u === 1 ? `x${constant >= 0 ? '+' : ''}${constant}` : `${u}x${constant >= 0 ? '+' : ''}${constant}`;
    }
    const questions = [];
    const answers = [];
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
      answers.push(
        `令 \\(t=${tExpr}\\)，原式可視為 \\(t^2${B >= 0 ? '+' : ''}${B}t${C >= 0 ? '+' : ''}${C}\\)。` +
          `十字交乘得 \\((t${s1 > 0 ? '+' : '-'}${p})(t${s2 > 0 ? '+' : '-'}${q})\\)，` +
          `代回為 \\((${formatLinearFactor(u, c1)})(${formatLinearFactor(u, c2)})\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ333CrossStructuredSet(count) {
    const questions = [];
    const answers = [];
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
      answers.push(
        `令 \\(t=x+${m}\\)，原式可視為 \\(t^2${B >= 0 ? '+' : ''}${B}t${C >= 0 ? '+' : ''}${C}\\)。` +
          `分解為 \\((t${s1 > 0 ? '+' : '-'}${p})(t${s2 > 0 ? '+' : '-'}${q})\\)，` +
          `代回為 \\((x${c1 === 0 ? '' : `${c1 >= 0 ? '+' : ''}${c1}`})(x${c2 === 0 ? '' : `${c2 >= 0 ? '+' : ''}${c2}`})\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ333CrossCoreMixedSet(count) {
    const banks = [buildJ333CrossCoeffOneSet, buildJ333CrossCoeffNonOneSet, buildJ333CrossPreprocessSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ333CrossSubMixedSet(count) {
    const banks = [buildJ333CrossSubstitutionSet, buildJ333CrossStructuredSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ341FactorFormulaSolveSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const a = randInt(1, 6),
          b = pickNonZero(-10, 10);
        const lead = a === 1 ? 'x^2' : `${a}x^2`;
        questions.push(`解方程：\\(${lead}${b >= 0 ? '+' : ''}${b}x=0\\)`);
        answers.push(`\\(x=0\\) 或 \\(x=${formatFraction(-b, a)}\\)`);
      } else if (mode === 1) {
        const a = randInt(1, 6),
          b = randInt(1, 9);
        const coeff = a * a;
        const lead = coeff === 1 ? 'x^2' : `${coeff}x^2`;
        questions.push(`解方程：\\(${lead}-${b * b}=0\\)`);
        answers.push(`\\(x=\\pm${formatFraction(b, a)}\\)`);
      } else {
        const a = randInt(1, 5),
          b = randInt(1, 9),
          sign = randInt(0, 1) === 0 ? '+' : '-';
        const mid = sign === '+' ? 2 * a * b : -2 * a * b;
        const coeff = a * a;
        const lead = coeff === 1 ? 'x^2' : `${coeff}x^2`;
        questions.push(`解方程：\\(${lead}${mid >= 0 ? '+' : ''}${mid}x+${b * b}=0\\)`);
        answers.push(`\\(x=${sign === '+' ? `-\\frac{${b}}{${a}}` : `\\frac{${b}}{${a}}`}\\)（重根）`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ341CrossSolveSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const r1n = pickNonZero(-8, 8);
      const r2n = pickNonZero(-8, 8);
      const a = randInt(1, 5);
      const b = -a * (r1n + r2n);
      const c = a * r1n * r2n;
      const lead = a === 1 ? 'x^2' : `${a}x^2`;
      questions.push(`解方程：\\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\)`);
      answers.push(`\\(x=${r1n},${r2n}\\)`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ341StandardTransformSet(count) {
    const questions = [];
    const answers = [];
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
        answers.push(
          `移項得 \\((x-${p})\\big[(${leftFactor})-(${rightFactor})\\big]=0\\)。` +
            `所以 \\(x-${p}=0\\) 或 \\(${r - 1}x${q - t >= 0 ? '+' : ''}${q - t}=0\\)。` +
            `解得 \\(x=${p}\\) 或 \\(x=${x2}\\)。`
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
        const lead = stdA === 1 ? 'x^2' : `${stdA}x^2`;
        const root1 = formatFraction(u, 1);
        const root2 = formatFraction(v, 1);
        const moveText = formatSubtraction(`(x-${p})(${factorText})`, k);
        questions.push(`解方程：\\((x-${p})(${factorText})=${k}\\)`);
        answers.push(
          `先移項：\\(${moveText}=0\\)。` +
            `展開得 \\(${lead}${stdB >= 0 ? '+' : ''}${stdB}x${stdC >= 0 ? '+' : ''}${stdC}=0\\)。` +
            `因式分解可寫成 \\((x-${u})(x${v >= 0 ? '-' : '+'}${Math.abs(v)})=0\\)，` +
            `所以 \\(x=${root1}\\) 或 \\(x=${root2}\\)。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ341RootPropertyReverseSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const r1 = pickNonZero(-8, 8),
          r2 = pickNonZero(-8, 8);
        const sum = r1 + r2,
          prod = r1 * r2;
        questions.push(`已知二次方程兩根為 \\(${r1},${r2}\\)，還原其方程。`);
        answers.push(`\\(x^2${sum >= 0 ? '-' : '+'}${Math.abs(sum)}x${prod >= 0 ? '+' : ''}${prod}=0\\)`);
      } else if (mode === 1) {
        const r1 = pickNonZero(-8, 8);
        let r2 = pickNonZero(-8, 8);
        while (r2 === r1) r2 = pickNonZero(-8, 8);
        const n = r1 * r2;
        questions.push(`若 \\(x^2+kx${n >= 0 ? '+' : ''}${n}=0\\) 的一根為 \\(${r1}\\)，求另一根。`);
        answers.push(
          `由兩根積為 \\(${n}\\)，得另一根 \\(=\\frac{${n}}{${wrapIfNegative(r1)}}=${formatFraction(n, r1)}\\)。`
        );
      } else {
        const r1 = pickNonZero(-8, 8);
        let r2 = pickNonZero(-8, 8);
        while (r2 === r1 || r2 === -r1) r2 = pickNonZero(-8, 8);
        const sum = r1 + r2;
        const linearTerm = sum === 0 ? '' : sum > 0 ? `-${sum}x` : `+${Math.abs(sum)}x`;
        questions.push(`若 \\(x^2${linearTerm}+k=0\\) 的一根為 \\(${r1}\\)，求另一根。`);
        answers.push(`由兩根和為 \\(${sum}\\)，得另一根 \\(=${sum}-${wrapIfNegative(r1)}=${r2}\\)。`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ342SquareRootSolveSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const k = randInt(2, 15);
        questions.push(`解方程：\\(x^2=${k * k}\\)`);
        answers.push(`\\(x=\\pm${k}\\)`);
      } else if (mode === 1) {
        const h = pickNonZero(-8, 8),
          k = randInt(2, 12);
        questions.push(`解方程：\\((x${h >= 0 ? '+' : ''}${h})^2=${k * k}\\)`);
        answers.push(`\\(x=${-h + k}\\) 或 \\(x=${-h - k}\\)`);
      } else {
        const a = randInt(1, 5),
          h = pickNonZero(-6, 6),
          m = randInt(2, 15),
          b = randInt(-10, 10);
        const lead = a === 1 ? '' : `${a}`;
        questions.push(`解方程：\\(${lead}(x${h >= 0 ? '+' : ''}${h})^2${b >= 0 ? '+' : ''}${b}=${m * m}\\)`);
        const numerator = m * m - b;
        if (numerator > 0 && numerator % a === 0) {
          const rootText = formatRadical(numerator / a);
          answers.push(`\\(x=${-h}+${rootText}\\) 或 \\(x=${-h}-${rootText}\\)`);
        } else {
          answers.push(
            `\\(x=${-h}+\\sqrt{\\frac{${numerator}}{${a}}}\\) 或 \\(x=${-h}-\\sqrt{\\frac{${numerator}}{${a}}}\\)`
          );
        }
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ342CompleteSquareTermSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 6);
      const b = pickNonZero(-14, 14);
      const fillNumerator = b * b;
      const fillDenominator = 4 * a;
      const deltaNumerator = b;
      const deltaDenominator = 2 * a;
      const fillText = formatFraction(fillNumerator, fillDenominator);
      const deltaText = formatFraction(deltaNumerator, deltaDenominator);
      const lead = a === 1 ? 'x^2' : `${a}x^2`;
      const rhsLead = a === 1 ? '' : `${a}`;
      questions.push(
        `填空使其成完全平方：\\(${lead}${b >= 0 ? '+' : ''}${b}x+\\square=${rhsLead}\\left(x+\\Delta\\right)^2\\)`
      );
      answers.push(`\\(\\square=${fillText}\\)，\\(\\Delta=${deltaText}\\)`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ342CompletingSquareSolveSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const p = pickNonZero(-8, 8);
      const q = randInt(2, 12);
      const mode = i % 2;
      const b = -2 * p;
      const c = mode === 0 ? p * p - q : p * p + q;
      const rhs = p * p - c; // = q or -q
      questions.push(`用配方法解：\\(x^2${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\)`);
      if (rhs > 0) {
        const root = formatRadical(rhs);
        answers.push(
          `先配方：\\((x${p >= 0 ? '-' : '+'}${Math.abs(p)})^2=${rhs}\\)。再開根號：\\(x=${p}\\pm${root}\\)。`
        );
      } else if (rhs === 0) {
        answers.push(`先配方：\\((x${p >= 0 ? '-' : '+'}${Math.abs(p)})^2=0\\)。所以 \\(x=${p}\\)（重根）。`);
      } else {
        answers.push(`先配方：\\((x${p >= 0 ? '-' : '+'}${Math.abs(p)})^2=${rhs}\\)。右邊為負，無實數解。`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ342DiscriminantSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode < 2) {
        const a = pickNonZero(1, 5),
          b = pickNonZero(-12, 12),
          c = pickNonZero(-12, 12);
        const D = b * b - 4 * a * c;
        const lead = a === 1 ? 'x^2' : `${a}x^2`;
        questions.push(`判別 \\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\) 的根性質。`);
        answers.push(
          D > 0 ? `兩相異實根（\\(D=${D}>0\\)）` : D === 0 ? `重根（\\(D=0\\)）` : `無實根（\\(D=${D}<0\\)）`
        );
      } else {
        const a = randInt(1, 5),
          c = randInt(1, 20),
          k = randInt(1, 9);
        const lead = a === 1 ? 'x^2' : `${a}x^2`;
        questions.push(`若 \\(${lead}-kx+${c}=0\\) 有重根，求 \\(k\\) 的值。`);
        answers.push(`\\(k=\\pm${formatRadical(4 * a * c)}\\)`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ342FormulaSolveSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(1, 6),
        b = pickNonZero(-12, 12),
        c = pickNonZero(-12, 12);
      const D = b * b - 4 * a * c;
      const lead = a === 1 ? 'x^2' : `${a}x^2`;
      questions.push(`用公式解：\\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\)`);
      if (D >= 0) {
        const sqrtD = Math.sqrt(D);
        if (Number.isInteger(sqrtD)) {
          const x1 = formatFraction(-b + sqrtD, 2 * a);
          const x2 = formatFraction(-b - sqrtD, 2 * a);
          answers.push(x1 === x2 ? `\\(x=${x1}\\)（重根）` : `\\(x=${x1}\\) 或 \\(x=${x2}\\)`);
          continue;
        }
      }
      answers.push(`\\(x=\\frac{${-b}\\pm${D >= 0 ? formatRadical(D) : `\\sqrt{${D}}`}}{${2 * a}}\\)`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ342ReverseFromSquareSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const p = pickNonZero(-8, 8),
          q = randInt(1, 20);
        questions.push(
          `若 \\(x^2${2 * p >= 0 ? '+' : ''}${2 * p}x+a=0\\) 可配方成 \\((x${p >= 0 ? '+' : ''}${p})^2=${q}\\)，求 \\(a\\)。`
        );
        answers.push(`\\(a=${p * p - q}\\)`);
      } else if (mode === 1) {
        const r1 = pickNonZero(-8, 8),
          r2 = pickNonZero(-8, 8);
        questions.push(`已知一元二次方程兩根為 \\(${r1},${r2}\\)，求原方程。`);
        answers.push(`\\(x^2${-(r1 + r2) >= 0 ? '+' : ''}${-(r1 + r2)}x${r1 * r2 >= 0 ? '+' : ''}${r1 * r2}=0\\)`);
      } else {
        const a = pickNonZero(1, 5),
          b = pickNonZero(-12, 12),
          c = pickNonZero(-12, 12);
        const lead = a === 1 ? 'x^2' : `${a}x^2`;
        questions.push(
          `將 \\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}\\) 寫成 \\(A(x-h)^2+k\\) 形式，求 \\(A+h+k\\)。`
        );
        answers.push(`先提出 \\(A=${a}\\) 再配方。`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ342RootsSumProductDirectSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(1, 6),
        b = pickNonZero(-12, 12),
        c = pickNonZero(-12, 12);
      const sumText = formatFraction(-b, a);
      const prodText = formatFraction(c, a);
      const lead = a === 1 ? 'x^2' : `${a}x^2`;
      questions.push(
        `已知 \\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\)，求兩根和 \\(\\alpha+\\beta\\) 與兩根積 \\(\\alpha\\beta\\)。`
      );
      answers.push(`\\(\\alpha+\\beta=${sumText}\\)，\\(\\alpha\\beta=${prodText}\\)。`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ342ReverseEquationFromRootsSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 2;
      if (mode === 0) {
        const s = pickNonZero(-10, 10),
          p = pickNonZero(-20, 20);
        questions.push(`若兩根和為 \\(${s}\\)、兩根積為 \\(${p}\\)，求二次方程。`);
        answers.push(`\\(x^2${-s >= 0 ? '+' : ''}${-s}x${p >= 0 ? '+' : ''}${p}=0\\)。`);
      } else {
        const r1 = pickNonZero(-8, 8),
          r2 = pickNonZero(-8, 8);
        questions.push(`若兩根分別為 \\(${r1}\\)、\\(${r2}\\)，還原其二次方程。`);
        const s = r1 + r2;
        const p = r1 * r2;
        answers.push(`\\(x^2${-s >= 0 ? '+' : ''}${-s}x${p >= 0 ? '+' : ''}${p}=0\\)。`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ342ExpressionBySumProductSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(1, 5),
        b = pickNonZero(-10, 10),
        c = pickNonZero(-10, 10);
      const lead = a === 1 ? 'x^2' : `${a}x^2`;
      const S = formatFraction(-b, a);
      const P = formatFraction(c, a);
      const mode = i % 3;
      if (mode === 0) {
        questions.push(
          `若 \\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\) 兩根為 \\(\\alpha,\\beta\\)，求 \\(\\alpha^2+\\beta^2\\)。`
        );
        answers.push(`\\((\\alpha+\\beta)^2-2\\alpha\\beta=${S}^2-2\\cdot${P}\\)。`);
      } else if (mode === 1) {
        questions.push(
          `若 \\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\) 兩根為 \\(\\alpha,\\beta\\)，求 \\((\\alpha-1)(\\beta-1)\\)。`
        );
        answers.push(`\\(\\alpha\\beta-(\\alpha+\\beta)+1=${P}-(${S})+1\\)。`);
      } else {
        questions.push(
          `若 \\(${lead}${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}=0\\) 兩根為 \\(\\alpha,\\beta\\)，求 \\((\\alpha-\\beta)^2\\)。`
        );
        answers.push(`\\((\\alpha+\\beta)^2-4\\alpha\\beta=${S}^2-4\\cdot${P}\\)。`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ342CoefficientMistakeSet(count) {
    const questions = [];
    const answers = [];
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
        answers.push(
          `錯一次項只會改變「根和」符號，故正確根和為 \\(${wrongSum}\\)、根積不變為 \\(${prod}\\)，方程為 \\(x^2${-wrongSum >= 0 ? '+' : ''}${-wrongSum}x${prod >= 0 ? '+' : ''}${prod}=0\\)。`
        );
      } else {
        questions.push(`某生把常數項符號看錯，誤得兩根為 \\(${r1},${r2}\\)。求正確方程。`);
        answers.push(
          `錯常數項只會改變「根積」符號，故正確根和為 \\(${sum}\\)、根積為 \\(${wrongProd}\\)，方程為 \\(x^2${-sum >= 0 ? '+' : ''}${-sum}x${wrongProd >= 0 ? '+' : ''}${wrongProd}=0\\)。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ342SpecialRootRelationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const k = pickNonZero(-8, 8);
        questions.push(`若方程 \\(x^2+(k+2)x+(k+5)=0\\) 兩根互為相反數，求 \\(k\\)。`);
        answers.push(`兩根和為 0，故 \\(k+2=0\\Rightarrow k=-2\\)。`);
      } else if (mode === 1) {
        const k = pickNonZero(-9, 9);
        questions.push(`若方程 \\(x^2+(k+1)x+(k-3)=0\\) 有一根為 0，求 \\(k\\)。`);
        answers.push(`有一根為 0 \\(\\Rightarrow\\) 根積為 0，故 \\(k-3=0\\Rightarrow k=3\\)。`);
      } else {
        const m = pickNonZero(1, 6);
        questions.push(`若方程 \\(x^2+mx+9=0\\) 有相等兩根，求 \\(m\\)。`);
        answers.push(`相等兩根 \\(\\Rightarrow D=0\\)：\\(m^2-36=0\\Rightarrow m=\\pm6\\)。`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ342RootsCoreMixedSet(count) {
    const banks = [
      buildJ342RootsSumProductDirectSet,
      buildJ342ReverseEquationFromRootsSet,
      buildJ342ExpressionBySumProductSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ342RootsAppliedMixedSet(count) {
    const banks = [buildJ342CoefficientMistakeSet, buildJ342SpecialRootRelationSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ343NumberPropertyWordSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const x = randInt(4, 12);
        const y = randInt(3, 10);
        const sum = x + y;
        const prod = x * y;
        questions.push(`已知兩數的和為 ${sum}，積為 ${prod}，求這兩數。`);
        answers.push(`簡答：${x} 與 ${y}。`);
        continue;
      }
      if (mode === 1) {
        const n = randInt(6, 20);
        const a = 2 * n - 1;
        const b = 2 * n + 1;
        questions.push(`已知兩個連續奇數的乘積為 ${a * b}，求這兩數。`);
        answers.push(`簡答：${a} 與 ${b}。`);
        continue;
      }
      if (mode === 2) {
        const n = randInt(4, 10);
        const a = 2 * n - 2;
        const b = 2 * n;
        const c = 2 * n + 2;
        questions.push(`三個連續偶數的平方和為 ${a * a + b * b + c * c}，求此三數。`);
        answers.push(`簡答：${a}、${b}、${c}。`);
        continue;
      }
      if (mode === 3) {
        const x = pickNonZero(-6, 8);
        const rhs = x * x - 3 * x;
        questions.push(`某數的平方減去該數的 3 倍，結果為 ${rhs}，求此數。`);
        answers.push(`簡答：${x}。`);
        continue;
      }
      const x = randInt(2, 6);
      const s = addFraction(makeFraction(x, 1), makeFraction(1, x));
      questions.push(`已知一正數與其倒數的和為 $${fractionToLatex(s)}$，求此數。`);
      answers.push(`簡答：${x} 或 $${formatFraction(1, x)}$。`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ343GeometryAreaWordSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const w = randInt(2, 10);
        const d = randInt(2, 6);
        const l = w + d;
        questions.push(`有一長方形，長比寬多 ${d} 公分，面積為 ${l * w} 平方公分，求長與寬。`);
        answers.push(`簡答：長 ${l} 公分，寬 ${w} 公分。`);
        continue;
      }
      if (mode === 1) {
        const s = randInt(2, 8);
        const d = randInt(2, 5);
        const big = s + d;
        questions.push(`大小兩個正方形邊長相差 ${d} 公分，面積和為 ${big * big + s * s} 平方公分，求兩邊長。`);
        answers.push(`簡答：${big} 公分與 ${s} 公分。`);
        continue;
      }
      if (mode === 2) {
        const k = randInt(2, 5);
        const a = 3 * k,
          b = 4 * k,
          c = 5 * k;
        questions.push(`一直角三角形三邊長比為 3:4:5，且周長為 ${a + b + c}，求三邊長。`);
        answers.push(`簡答：${a}、${b}、${c}。`);
        continue;
      }
      if (mode === 3) {
        const x = randInt(7, 20);
        const remain = x * x - 12;
        questions.push(
          `從邊長為 x 的正方形紙片中剪去一個長 4、寬 3 的小長方形後，剩餘面積為 ${remain} 平方公分，求 x。`
        );
        answers.push(`簡答：x=${x}。`);
        continue;
      }
      const h = randInt(4, 12);
      const d = randInt(2, 6);
      const b = h - d;
      const area = (b * h) / 2;
      questions.push(`某三角形底邊比高短 ${d} 公分，面積為 ${area} 平方公分，求底與高。`);
      answers.push(`簡答：底 ${b} 公分，高 ${h} 公分。`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ343BusinessWordSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const baseN = 30,
          baseP = 5000,
          dec = 100;
        const t = randInt(8, 20);
        const n = baseN + t;
        const rev = n * (baseP - dec * t);
        questions.push(
          `預定人數 ${baseN} 人、每人收費 ${baseP} 元；每增加 1 人，每人可減收 ${dec} 元。若總收入為 ${rev} 元，求參加人數。`
        );
        answers.push(`簡答：${n} 人。`);
        continue;
      }
      if (mode === 1) {
        const cost = 800;
        const spoil = randInt(3, 6);
        const x = randInt(28, 60);
        const sellable = x - spoil;
        const profitPerKg = [4, 5, 8, 10][randInt(0, 3)];
        const totalProfit = sellable * profitPerKg - cost;
        questions.push(
          `以 ${cost} 元買進一批水果，其中 ${spoil} 公斤損壞，剩下每公斤比成本多賣 ${profitPerKg} 元，最後賺 ${totalProfit} 元，求買進多少公斤。`
        );
        answers.push(`簡答：${x} 公斤。`);
        continue;
      }
      if (mode === 2) {
        const unit = 280,
          gate = 15,
          dec = 5;
        const q = randInt(18, 40);
        const total = q * (unit - (q - gate) * dec);
        questions.push(
          `班服每件 ${unit} 元；若超過 ${gate} 件，超過的每多 1 件每件再便宜 ${dec} 元。總金額為 ${total} 元，求購買數量。`
        );
        answers.push(`簡答：${q} 件。`);
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
        questions.push(`票價 ${p0} 元可賣 ${n0} 張；每降價 1 元可多賣 ${up} 張。若收入為 ${revenue} 元，求票價。`);
        answers.push(`簡答：${price} 元。`);
        continue;
      }
      const p0 = 80,
        n0 = 100,
        addBuy = 25;
      const t = randInt(1, 4);
      const price = p0 - 10 * t;
      const qty = n0 + addBuy * t;
      const rev = price * qty;
      questions.push(
        `原本每件 ${p0} 元時有 ${n0} 人購買；若每降價 10 元，購買者增加 ${addBuy} 人。若收入要達 ${rev} 元，應訂價多少？`
      );
      answers.push(`簡答：${price} 元。`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
    return { questions, answers };
  }

  function buildJ113BinaryQuadraticCrossFactoringSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, answers };
  }

  function buildJ313PolynomialDivisionRegularSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(`簡答：商 $${quotient}$，餘 $${remainder}$。`);
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
      answers.push(`簡答：商 $${quotient}$，餘 $${remainder}$。`);
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
        answers.push(`簡答：$${formatPolynomialFromCoeffs(dividend)}$。`);
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
        answers.push(`簡答：$${formatPolynomialFromCoeffs(poly)}$。`);
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
      answers.push(`簡答：$A=${formatPolynomialFromCoeffs(dividend)}$。`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ313CoeffSumSet(count) {
    const questions = [];
    const answers = [];
    while (questions.length < count) {
      const variant = questions.length % 3;

      if (variant === 0) {
        const a = pickNonZero(-4, 4);
        const b = pickNonZero(-7, 7);
        const c = pickNonZero(-9, 9);
        const d = randInt(-10, 10);
        const poly = [a, b, c, d];
        questions.push(`求多項式 $f(x)=${formatPolynomialFromCoeffs(poly)}$ 的常數項與各項係數總和。`);
        answers.push(`簡答：常數項為 ${d}，係數總和為 $f(1)=${evalPoly(poly, 1)}$。`);
        continue;
      }

      if (variant === 1) {
        const p = pickNonZero(-4, 4);
        const n = [4, 5, 6, 8][randInt(0, 3)];
        questions.push(`若 $A=(x-1)^${n}+(${formatSingleVarExpr(p, 1)})$，求 $A$ 展開後的各項係數總和。`);
        answers.push(`簡答：係數總和為 $A(1)=0+(${p}+1)=${p + 1}$。`);
        continue;
      }

      const a = pickNonZero(-4, 4);
      const b = pickNonZero(-6, 6);
      const c = pickNonZero(-8, 8);
      questions.push(`已知多項式 $A=( ${a}x${b >= 0 ? '+' : ''}${b} )^2+(${c}-x)(x+1)$，求 $A$ 的各項係數總和。`);
      const value = (a + b) ** 2 + (c - 1) * 2;
      answers.push(`簡答：係數總和為 $A(1)=(${a + b})^2+(${c - 1})\\cdot 2=${value}$。`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ313RemainderTheoremSet(count) {
    const questions = [];
    const answers = [];
    while (questions.length < count) {
      const variant = questions.length % 3;

      if (variant === 0) {
        const a = pickNonZero(-4, 4);
        const poly = [pickNonZero(-3, 3), randInt(-6, 6), randInt(-7, 7), randInt(-9, 9)];
        questions.push(
          `不經除法，求 $${formatPolynomialFromCoeffs(poly)}$ 除以 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 的餘數。`
        );
        answers.push(`簡答：餘數為 $f(${a})=${evalPoly(poly, a)}$。`);
        continue;
      }

      if (variant === 1) {
        const a = pickNonZero(-5, 5);
        const r = pickNonZero(-9, 9);
        const m = pickNonZero(-4, 4);
        const n = pickNonZero(-8, 8);
        questions.push(
          `已知多項式 $A$ 除以 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 的餘式為 ${r}，求 $( ${m}A${n >= 0 ? '+' : ''}${n} )$ 除以同一除式的餘式。`
        );
        answers.push(`簡答：餘數為 ${m * r + n}。`);
        continue;
      }

      const a = pickNonZero(-4, 4);
      const p = pickNonZero(-5, 5);
      const q = pickNonZero(-7, 7);
      const c = randInt(-9, 9);
      questions.push(`若多項式 $(${p})x^2+(${q})x+k$ 能被 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 整除，求 $k$。`);
      const k = -(p * a * a + q * a);
      answers.push(`簡答：$k=${k}$。`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ313FactorTheoremSet(count) {
    const questions = [];
    const answers = [];
    while (questions.length < count) {
      const variant = questions.length % 3;

      if (variant === 0) {
        const a = pickNonZero(-4, 4);
        const poly = [pickNonZero(-3, 3), randInt(-6, 6), randInt(-8, 8), randInt(-10, 10)];
        const value = evalPoly(poly, a);
        questions.push(
          `判斷 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 是否為 $${formatPolynomialFromCoeffs(poly)}$ 的因式。`
        );
        answers.push(`簡答：代入 $x=${a}$ 得 $f(${a})=${value}$，${value === 0 ? '是因式' : '不是因式'}。`);
        continue;
      }

      if (variant === 1) {
        const a = pickNonZero(-4, 4);
        const p = pickNonZero(-4, 4);
        const q = pickNonZero(-7, 7);
        const m = -(p * a * a + q) / a;
        if (!Number.isInteger(m)) continue;
        const lead = p === 1 ? 'x^2' : p === -1 ? '-x^2' : `${p}x^2`;
        questions.push(`已知 $(x${a >= 0 ? '-' : '+'}${Math.abs(a)})$ 為 $${lead}+mx+${q}$ 的因式，求 $m$。`);
        answers.push(`簡答：$m=${m}$。`);
        continue;
      }

      const u = pickNonZero(-3, 3);
      const v = pickNonZero(-4, 4);
      const p = pickNonZero(-3, 3);
      const tail = randInt(-8, 8);
      const fx = multiplyPolyCoeffs([1, -u], [1, -v]);
      const cubic = multiplyPolyCoeffs([p, tail], fx);
      const m = cubic[1];
      const n = cubic[2];
      questions.push(
        `若 $(x${u >= 0 ? '-' : '+'}${Math.abs(u)})$ 與 $(x${v >= 0 ? '-' : '+'}${Math.abs(v)})$ 皆為 $x^3+mx^2+nx+${cubic[3]}$ 的因式，求 $m,n$。`
      );
      answers.push(`簡答：$m=${m},\\ n=${n}$。`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ312PolynomialAddSubSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(`簡答：$${ans}$。`);
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
        answers.push(`簡答：$${ans}$。`);
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
      answers.push(`簡答：$${ans}$。`);
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ312DegreeConstraintSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const p = pickNonZero(-6, 6);
        const q = pickNonZero(-8, 8);
        const r = randInt(-9, 9);
        const qTerm = formatCoeffTerm(q, 'x', 1);
        questions.push(
          `若多項式 $(a${p >= 0 ? '+' : ''}${p})x^2${qTerm.startsWith('-') ? '' : '+'}${qTerm}${r >= 0 ? '+' : ''}${r}$ 是一次多項式，求 $a$。`
        );
        answers.push(`簡答：$a=${-p}$。`);
        continue;
      }

      if (variant === 1) {
        const m = pickNonZero(-5, 5);
        const n = pickNonZero(-8, 8);
        const c = randInt(-9, 9);
        questions.push(
          `若多項式 $(a${m >= 0 ? '+' : ''}${m})x^3${n >= 0 ? '+' : ''}${n}x^2+x${c >= 0 ? '+' : ''}${c}$ 是一次多項式，求 $a$。`
        );
        answers.push(`簡答：$a=${-m}$。`);
        continue;
      }

      const aValue = pickNonZero(-4, 4);
      const u = -aValue;
      const v = -2 * aValue;
      const w = -3 * aValue;
      questions.push(
        `若多項式 $(a${u >= 0 ? '+' : ''}${u})x^2+(2a${v >= 0 ? '+' : ''}${v})x+(3a${w >= 0 ? '+' : ''}${w})$ 是零多項式，求 $a$。`
      );
      answers.push(`簡答：$a=${aValue}$。`);
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ312PolynomialReverseSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(`簡答：$A=${A}$。`);
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
        answers.push(`簡答：$A=${A}$。`);
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
      answers.push(`簡答：$${result}$。`);
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
      answer: `簡答：$${simpleAns}$。`,
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
      answer: `簡答：$${result}$。`,
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
    return { question: q, answer: `簡答：$${a}$。` };
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
        answer: `簡答：$${ans}$。`,
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
        answer: `簡答：$${quotient}$。`,
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
      answer: `簡答：商 $${quotient}$，餘 $${remainder}$。`,
    };
  }

  function buildJ312MulEasyMonoMonoSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildMonomialTimesMonomialQA();
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ312MulEasyMonoLinearSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildMonomialTimesPolyQA(1);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ312MulEasyMonoQuadraticSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildMonomialTimesPolyQA(2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ312MulEasyMixedSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ312MulAdvLinearLinearSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyTimesPolyQA(1, 1);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ312MulAdvLinearQuadraticSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyTimesPolyQA(1, 2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ312MulAdvQuadraticQuadraticSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyTimesPolyQA(2, 2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ312MulAdvMixedSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ312DivMonomialByMonomialSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyDivideMonomialQA(0);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ312DivBinomialByMonomialSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyDivideMonomialQA(1);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ312DivTrinomialByMonomialSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyDivideMonomialQA(2);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ312DivMonomialMixedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const qa = buildPolyDivideMonomialQA(i % 3);
      questions.push(qa.question);
      answers.push(qa.answer);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildBinomialQuestions(count, mode, kind) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      if (kind === 'variable') {
        const a = randInt(1, 6);
        const b = randInt(1, 9);
        const middle = 2 * a * b * (mode === 'sum' ? 1 : -1);
        questions.push(`展開：$(${a === 1 ? 'x' : `${a}x`}${mode === 'sum' ? '+' : '-'}${b})^2$。`);
        answers.push(
          `利用乘法公式：$(${a === 1 ? 'x' : `${a}x`}${mode === 'sum' ? '+' : '-'}${b})^2=${a * a}x^2${middle >= 0 ? '+' : ''}${middle}x+${b * b}$。`
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

    return { questions, answers };
  }

  function buildDifferenceOfSquaresQuestions(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 6);
      const b = randInt(1, 9);
      const ax = a === 1 ? 'x' : `${a}x`;
      const lead = a * a === 1 ? 'x^2' : `${a * a}x^2`;
      questions.push(`展開：$(${ax}+${b})(${ax}-${b})$。`);
      answers.push(`利用平方差公式：$(A+B)(A-B)=A^2-B^2$，其中 $A=${ax},\\ B=${b}$，所以結果是 $${lead}-${b * b}$。`);
    }

    return { questions, answers };
  }

  function buildFactorizationQuestions(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 6);
      const b = randInt(1, 9);
      const ax = a === 1 ? 'x' : `${a}x`;
      const lead = a * a === 1 ? 'x^2' : `${a * a}x^2`;
      questions.push(`分解因式：$${lead}-${b * b}$。`);
      answers.push(`這是平方差：$${lead}-${b * b}=(${ax}+${b})(${ax}-${b})$。`);
    }

    return { questions, answers };
  }

  function buildJ311FormulaMixedSet(count, kind) {
    const questions = [];
    const answers = [];
    const center = 100;

    function buildNumberLikePair(currentKind) {
      if (currentKind === 'fraction') {
        const deltaOptions = [
          makeFraction(1, 2),
          makeFraction(2, 3),
          makeFraction(3, 5),
          makeFraction(3, 4),
          makeFraction(5, 6),
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
        const delta = [0.2, 0.3, 0.4, 0.5, 0.6, 0.8][randInt(0, 5)];
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

      const delta = randInt(1, 9);
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
          `把它看成和平方：$(${pair.centerText}+${pair.deltaText})^2=${pair.centerText}^2+2\\cdot ${pair.centerText}\\cdot ${pair.deltaText}+(${pair.deltaText})^2=${pair.formatResult(pair.leftSquare)}$。`
        );
      } else if (variant === 1) {
        questions.push(`計算：$(${pair.rightText})^2$。`);
        answers.push(
          `把它看成差平方：$(${pair.centerText}-${pair.deltaText})^2=${pair.centerText}^2-2\\cdot ${pair.centerText}\\cdot ${pair.deltaText}+(${pair.deltaText})^2=${pair.formatResult(pair.rightSquare)}$。`
        );
      } else if (variant === 2) {
        questions.push(`計算：$(${pair.leftText})\\times(${pair.rightText})$。`);
        answers.push(
          `這是平方差展開：$(${pair.centerText}+${pair.deltaText})\\times(${pair.centerText}-${pair.deltaText})=${pair.centerText}^2-(${pair.deltaText})^2=${pair.formatResult(pair.conjugate)}$。`
        );
      } else {
        questions.push(`計算：$(${pair.leftText})^2-(${pair.rightText})^2$。`);
        answers.push(
          `這是平方差分解：$A^2-B^2=(A+B)(A-B)$。所以原式 $=(${pair.leftText}+${pair.rightText})(${pair.leftText}-${pair.rightText})=${pair.formatResult(pair.squareDifference)}$。`
        );
      }
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ311VariableFormulaMixedSet(count) {
    const questions = [];
    const answers = [];

    const builders = [
      () => buildBinomialQuestions(1, 'sum', 'variable'),
      () => buildBinomialQuestions(1, 'diff', 'variable'),
      () => buildDifferenceOfSquaresQuestions(1, 'variable'),
      () => buildFactorizationQuestions(1),
    ];

    for (let i = 0; i < count; i += 1) {
      const result = builders[i % builders.length]();
      questions.push(result.questions[0]);
      answers.push(result.answers[0]);
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildIdentityIntegerBasicSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, answers };
  }

  function buildSumSqsumToProductSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-8, 8);
      const b = randInt(-8, 8);
      const sum = a + b;
      const sqsum = a * a + b * b;
      const prod = a * b;
      questions.push(`已知 \\(a+b=${sum}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\)。`);
      answers.push(`\\(ab=\\frac{(a+b)^2-(a^2+b^2)}{2}=\\frac{${sum * sum}-${sqsum}}{2}=${prod}\\)。`);
    }
    return { questions, answers };
  }

  function buildDiffSqsumToProductSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-8, 8);
      const b = randInt(-8, 8);
      const diff = a - b;
      const sqsum = a * a + b * b;
      const prod = a * b;
      questions.push(`已知 \\(a-b=${diff}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\)。`);
      answers.push(`\\((a-b)^2=a^2-2ab+b^2\\Rightarrow ab=\\frac{${sqsum}-${diff * diff}}{2}=${prod}\\)。`);
    }
    return { questions, answers };
  }

  function buildIdentitySumProductSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, answers };
  }

  function buildProductSqsumSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, answers };
  }

  function buildSquarePairSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, answers };
  }

  function buildIdentityPairMixedSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, answers };
  }

  function buildIdentityPairAdvancedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const sum = randInt(-10, 10);
      const diff = randInt(-10, 10);
      const prodFromSum = randInt(-12, 12);
      const prodFromDiff = randInt(-12, 12);
      const sqsumFromSum = sum * sum - 2 * prodFromSum;
      const diffSquareFromSum = sum * sum - 4 * prodFromSum;
      const sqsumFromDiff = diff * diff + 2 * prodFromDiff;
      const sumSquareFromDiff = diff * diff + 4 * prodFromDiff;
      const prodFromSqsum = randInt(-12, 12);
      const sqsum = randInt(5, 60);
      const sumSquareFromSqsum = sqsum + 2 * prodFromSqsum;
      const diffSquareFromSqsum = sqsum - 2 * prodFromSqsum;
      const variant = i % 5;
      if (variant === 0) {
        questions.push(`已知 \\(a+b=${sum}\\)、\\(a^2+b^2=${sqsumFromSum}\\)，求 \\(ab\\) 與 \\((a-b)^2\\)。`);
        answers.push(
          `由 \\(a^2+b^2=(a+b)^2-2ab\\)，得 \\(ab=\\frac{${sum * sum}-${sqsumFromSum}}{2}=${prodFromSum}\\)。再由 \\((a-b)^2=(a+b)^2-4ab=${sum * sum}-4(${prodFromSum})=${diffSquareFromSum}\\)。`
        );
      } else if (variant === 1) {
        questions.push(`已知 \\(a-b=${diff}\\)、\\(a^2+b^2=${sqsumFromDiff}\\)，求 \\(ab\\) 與 \\((a+b)^2\\)。`);
        answers.push(
          `由 \\(a^2+b^2=(a-b)^2+2ab\\)，得 \\(ab=\\frac{${sqsumFromDiff}-${diff * diff}}{2}=${prodFromDiff}\\)。再由 \\((a+b)^2=(a-b)^2+4ab=${diff * diff}+4(${prodFromDiff})=${sumSquareFromDiff}\\)。`
        );
      } else if (variant === 2) {
        questions.push(`已知 \\(a+b=${sum}\\)、\\(ab=${prodFromSum}\\)，求 \\(a^2+b^2\\) 與 \\((a-b)^2\\)。`);
        answers.push(
          `由 \\(a^2+b^2=(a+b)^2-2ab=${sum * sum}-2(${prodFromSum})=${sqsumFromSum}\\)。再由 \\((a-b)^2=(a+b)^2-4ab=${sum * sum}-4(${prodFromSum})=${diffSquareFromSum}\\)。`
        );
      } else if (variant === 3) {
        questions.push(`已知 \\(a-b=${diff}\\)、\\(ab=${prodFromDiff}\\)，求 \\(a^2+b^2\\) 與 \\((a+b)^2\\)。`);
        answers.push(
          `由 \\(a^2+b^2=(a-b)^2+2ab=${diff * diff}+2(${prodFromDiff})=${sqsumFromDiff}\\)。再由 \\((a+b)^2=(a-b)^2+4ab=${diff * diff}+4(${prodFromDiff})=${sumSquareFromDiff}\\)。`
        );
      } else {
        questions.push(`已知 \\(a^2+b^2=${sqsum}\\)、\\(ab=${prodFromSqsum}\\)，求 \\((a+b)^2\\) 與 \\((a-b)^2\\)。`);
        answers.push(
          `由 \\((a+b)^2=a^2+b^2+2ab=${sqsum}+2(${prodFromSqsum})=${sumSquareFromSqsum}\\)。再由 \\((a-b)^2=a^2+b^2-2ab=${sqsum}-2(${prodFromSqsum})=${diffSquareFromSqsum}\\)。`
        );
      }
    }
    return { questions, answers };
  }

  function buildLinearCombinationSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, answers };
  }

  function buildReciprocalSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const val = randInt(3, 8);
      questions.push(`已知 \\(x+\\frac{1}{x}=${val}\\)，求 \\(x^2+\\frac{1}{x^2}\\)。`);
      answers.push(`\\(x^2+\\frac{1}{x^2}=\\left(x+\\frac{1}{x}\\right)^2-2=${val}^2-2=${val * val - 2}\\)。`);
    }
    return { questions, answers };
  }

  function buildReciprocalReverseSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = randInt(3, 10);
      questions.push(`已知 \\(x^2+\\frac{1}{x^2}=${base}\\)，求 \\(x+\\frac{1}{x}\\)、\\(x-\\frac{1}{x}\\)。`);
      const plus2 = base + 2;
      const minus2 = base - 2;
      answers.push(
        `\\(\\left(x+\\frac{1}{x}\\right)^2=${plus2}\\Rightarrow x+\\frac{1}{x}=\\pm\\sqrt{${plus2}}\\)，\\(\\left(x-\\frac{1}{x}\\right)^2=${minus2}\\Rightarrow x-\\frac{1}{x}=\\pm\\sqrt{${minus2}}\\)。`
      );
    }
    return { questions, answers };
  }

  function buildReciprocalMixedFractionSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, answers };
  }

  function buildMixedAdvancedIdentitySet(count) {
    const banks = [
      () => buildIdentityIntegerBasicSet(1),
      () => buildIdentitySumProductSet(1),
      () => buildReciprocalSet(1),
      () => buildReciprocalReverseSet(1),
    ];

    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const pick = banks[randInt(0, banks.length - 1)]();
      questions.push(...pick.questions);
      answers.push(...pick.answers);
    }
    return { questions, answers };
  }

  function formatSingleVarExpr(coef, constant) {
    if (coef === 0) return `${constant}`;
    const term = formatTerm(coef, 'x');
    if (constant === 0) return term;
    return `${term}${constant > 0 ? '+' : ''}${constant}`;
  }

  function deriveSummaryAnswerFromDetail(detail) {
    const text = String(detail || '')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) return '';

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
      if (candidate) return candidate;
    }

    const mathMatches = [...text.matchAll(/\$([^$]+)\$/g)];
    if (mathMatches.length) {
      const candidate = mathMatches[mathMatches.length - 1][1].trim();
      if (candidate) return `$${candidate}$`;
    }

    const sentence = text.split(/[。．]/)[0].trim();
    return sentence || text;
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
        generate() {
          return buildJ311FormulaMixedSet(4, 'integer');
        },
      },
      'j3-1-1-formula-mixed-decimal-drill': {
        type: 'drill',
        title: '乘法公式綜合（小數版）',
        difficulty: 'easy',
        questionCount: 4,
        generate() {
          return buildJ311FormulaMixedSet(4, 'decimal');
        },
      },
      'j3-1-1-formula-mixed-fraction-drill': {
        type: 'drill',
        title: '乘法公式綜合（分數版）',
        difficulty: 'medium',
        questionCount: 4,
        generate() {
          return buildJ311FormulaMixedSet(4, 'fraction');
        },
      },
      'j3-1-1-formula-mixed-variable-drill': {
        type: 'drill',
        title: '乘法公式綜合版（未知數）',
        difficulty: 'medium',
        questionCount: 4,
        generate() {
          return buildJ311VariableFormulaMixedSet(4);
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
        generate() {
          return buildJ313PolynomialDivisionRegularSet(5);
        },
      },
      'j3-1-3-reverse-division-drill': {
        type: 'drill',
        title: '反面出題（已知商、餘）',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ313ReverseDivisionSet(5);
        },
      },
      'j3-1-3-coeff-sum-drill': {
        type: 'drill',
        title: '係數和與常數項題型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ313CoeffSumSet(5);
        },
      },
      'j3-1-3-remainder-theorem-drill': {
        type: 'drill',
        title: '餘式定理應用題型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ313RemainderTheoremSet(5);
        },
      },
      'j3-1-3-factor-theorem-drill': {
        type: 'drill',
        title: '因式定理與未知係數判定',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ313FactorTheoremSet(5);
        },
      },
      'j3-1-2-polynomial-add-subtract-drill': {
        type: 'drill',
        title: '多項式加減運算（樣式與直式）',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ312PolynomialAddSubSet(5);
        },
      },
      'j3-1-2-degree-constraint-drill': {
        type: 'drill',
        title: '根據次數性質反求參數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ312DegreeConstraintSet(5);
        },
      },
      'j3-1-2-polynomial-reverse-application-drill': {
        type: 'drill',
        title: '多項式逆推應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ312PolynomialReverseSet(5);
        },
      },
      'j3-1-2-mul-easy-mixed-drill': {
        type: 'drill',
        title: '多項式乘法（簡易版）',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ312MulEasyMixedSet(6);
        },
      },
      'j3-1-2-mul-mono-mono-drill': {
        type: 'drill',
        title: '單項式 × 單項式',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ312MulEasyMonoMonoSet(6);
        },
      },
      'j3-1-2-mul-mono-linear-drill': {
        type: 'drill',
        title: '單項式 × 一次多項式',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ312MulEasyMonoLinearSet(6);
        },
      },
      'j3-1-2-mul-mono-quadratic-drill': {
        type: 'drill',
        title: '單項式 × 二次多項式',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ312MulEasyMonoQuadraticSet(6);
        },
      },
      'j3-1-2-mul-advanced-mixed-drill': {
        type: 'drill',
        title: '進階多項式乘法',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ312MulAdvMixedSet(6);
        },
      },
      'j3-1-2-mul-linear-linear-drill': {
        type: 'drill',
        title: '一次式 × 一次式',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ312MulAdvLinearLinearSet(6);
        },
      },
      'j3-1-2-mul-linear-quadratic-drill': {
        type: 'drill',
        title: '一次式 × 二次式',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ312MulAdvLinearQuadraticSet(6);
        },
      },
      'j3-1-2-mul-quadratic-quadratic-drill': {
        type: 'drill',
        title: '二次式 × 二次式',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ312MulAdvQuadraticQuadraticSet(6);
        },
      },
      'j3-1-2-div-monomial-mixed-drill': {
        type: 'drill',
        title: '多項式除以單項式',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ312DivMonomialMixedSet(6);
        },
      },
      'j3-1-2-div-mono-by-mono-drill': {
        type: 'drill',
        title: '單項式 ÷ 單項式',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ312DivMonomialByMonomialSet(6);
        },
      },
      'j3-1-2-div-binomial-by-mono-drill': {
        type: 'drill',
        title: '二項式 ÷ 單項式',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ312DivBinomialByMonomialSet(6);
        },
      },
      'j3-1-2-div-trinomial-by-mono-drill': {
        type: 'drill',
        title: '三項式 ÷ 單項式（含餘數）',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ312DivTrinomialByMonomialSet(6);
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
      'j3-2-3-triple-expand-drill': {
        type: 'drill',
        title: '畢氏數擴展與倍數',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ323TripleExpandSet(6);
        },
      },
      'j3-2-3-hypotenuse-altitude-drill': {
        type: 'drill',
        title: '斜邊高與面積性質',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ323HypotenuseAltitudeSet(6);
        },
      },
      'j3-2-3-coordinate-distance-drill': {
        type: 'drill',
        title: '座標平面兩點距離',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ323CoordinateDistanceSet(6);
        },
      },
      'j3-2-3-spatial-diagonal-drill': {
        type: 'drill',
        title: '立體圖形空間對角線',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ323SpatialDiagonalSet(6);
        },
      },
      'j3-3-1-core-factoring-mixed': {
        type: 'drill',
        title: '因式分解核心綜合（公因式）',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ331CoreFactoringMixedSet(6);
        },
      },
      'j3-3-1-common-factor-basic': {
        type: 'drill',
        title: '基礎單項提取',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ331CommonFactorBasicSet(6);
        },
      },
      'j3-3-1-common-factor-polynomial': {
        type: 'drill',
        title: '多項式式子提取',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ331PolynomialFactorSet(6);
        },
      },
      'j3-3-1-sign-transform-factoring': {
        type: 'drill',
        title: '變號法則應用',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ331SignTransformSet(6);
        },
      },
      'j3-3-1-grouping-advanced-mixed': {
        type: 'drill',
        title: '分組分解進階綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ331GroupingAdvancedMixedSet(6);
        },
      },
      'j3-3-1-grouping-factor': {
        type: 'drill',
        title: '分組分解',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ331GroupingFactorSet(6);
        },
      },
      'j3-3-1-expand-then-group': {
        type: 'drill',
        title: '先去括號再分組',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ331ExpandThenGroupSet(6);
        },
      },
      'j3-3-2-formula-mixed': {
        type: 'drill',
        title: '公式辨識與應用綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ332FormulaMixedSet(6);
        },
      },
      'j3-3-2-diff-squares': {
        type: 'drill',
        title: '平方差公式基礎',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ332DiffSquaresSet(6);
        },
      },
      'j3-3-2-perfect-square': {
        type: 'drill',
        title: '完全平方公式基礎',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ332PerfectSquareSet(6);
        },
      },
      'j3-3-2-composite-formula': {
        type: 'drill',
        title: '複合運算（先提公因式）',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ332CompositeSet(6);
        },
      },
      'j3-3-2-substitution-formula': {
        type: 'drill',
        title: '多項式換項（括號型）',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ332SubstitutionSet(6);
        },
      },
      'j3-3-3-cross-core-mixed': {
        type: 'drill',
        title: '十字交乘核心綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ333CrossCoreMixedSet(6);
        },
      },
      'j3-3-3-cross-coeff-one': {
        type: 'drill',
        title: '係數為 1 基礎類',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ333CrossCoeffOneSet(6);
        },
      },
      'j3-3-3-cross-coeff-nonone': {
        type: 'drill',
        title: '係數不為 1 進階類',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ333CrossCoeffNonOneSet(6);
        },
      },
      'j3-3-3-cross-preprocess': {
        type: 'drill',
        title: '負號與公因數預處理',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ333CrossPreprocessSet(6);
        },
      },
      'j3-3-3-cross-sub-mixed': {
        type: 'drill',
        title: '十字交乘換元綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ333CrossSubMixedSet(6);
        },
      },
      'j3-3-3-cross-substitution': {
        type: 'drill',
        title: '代換換元十字交乘',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ333CrossSubstitutionSet(6);
        },
      },
      'j3-3-3-cross-structured': {
        type: 'drill',
        title: '括號型結構十字交乘',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ333CrossStructuredSet(6);
        },
      },
      'j3-4-1-factor-formula-solve': {
        type: 'drill',
        title: '提公因式與平方公式求解',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ341FactorFormulaSolveSet(6);
        },
      },
      'j3-4-1-cross-solve': {
        type: 'drill',
        title: '十字交乘專項練習',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ341CrossSolveSet(6);
        },
      },
      'j3-4-1-standard-transform-solve': {
        type: 'drill',
        title: '標準式轉化與消因式',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ341StandardTransformSet(6);
        },
      },
      'j3-4-1-root-property-reverse': {
        type: 'drill',
        title: '根的性質與方程還原',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ341RootPropertyReverseSet(6);
        },
      },
      'j3-4-2-square-root-solve': {
        type: 'drill',
        title: '平方根觀念求解類',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ342SquareRootSolveSet(6);
        },
      },
      'j3-4-2-complete-square-term': {
        type: 'drill',
        title: '完全平方補項類',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ342CompleteSquareTermSet(6);
        },
      },
      'j3-4-2-completing-square-solve': {
        type: 'drill',
        title: '配方法完整求解類',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342CompletingSquareSolveSet(6);
        },
      },
      'j3-4-2-discriminant-judge': {
        type: 'drill',
        title: '判別式與根性質判定類',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342DiscriminantSet(6);
        },
      },
      'j3-4-2-formula-direct-solve': {
        type: 'drill',
        title: '公式解直接套用類',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342FormulaSolveSet(6);
        },
      },
      'j3-4-2-reverse-from-square': {
        type: 'drill',
        title: '配方後形式與參數還原類',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342ReverseFromSquareSet(6);
        },
      },
      'j3-4-2-roots-core-mixed': {
        type: 'drill',
        title: '兩根和積核心綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342RootsCoreMixedSet(6);
        },
      },
      'j3-4-2-roots-direct': {
        type: 'drill',
        title: '由方程式求兩根和與積',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ342RootsSumProductDirectSet(6);
        },
      },
      'j3-4-2-roots-reverse': {
        type: 'drill',
        title: '由和積（或兩根）還原方程',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342ReverseEquationFromRootsSet(6);
        },
      },
      'j3-4-2-roots-expression': {
        type: 'drill',
        title: '代數式變形（和積）',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342ExpressionBySumProductSet(6);
        },
      },
      'j3-4-2-roots-applied-mixed': {
        type: 'drill',
        title: '兩根和積應用綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342RootsAppliedMixedSet(6);
        },
      },
      'j3-4-2-roots-coefficient-mistake': {
        type: 'drill',
        title: '係數看錯題（和積修正）',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342CoefficientMistakeSet(6);
        },
      },
      'j3-4-2-roots-special-relation': {
        type: 'drill',
        title: '特殊根關係（相反數/倒數）',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ342SpecialRootRelationSet(6);
        },
      },
      'j3-4-3-number-property-word': {
        type: 'drill',
        title: '數字性質與運算問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ343NumberPropertyWordSet(5);
        },
      },
      'j3-4-3-geometry-area-word': {
        type: 'drill',
        title: '幾何圖形面積問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ343GeometryAreaWordSet(5);
        },
      },
      'j3-4-3-business-sales-word': {
        type: 'drill',
        title: '商業銷售與分攤問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ343BusinessWordSet(5);
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

  const bundleFingerprint = "j3-bundle-v20260619-v2";
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== "object") return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
