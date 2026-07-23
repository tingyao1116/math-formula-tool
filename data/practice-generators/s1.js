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

  function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
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

  function isPerfectSquare(n) {
    if (n < 0) return false;
    const r = Math.floor(Math.sqrt(n));
    return r * r === n;
  }

  function formatTerm(coef, variable = 'x') {
    if (coef === 1) return variable;
    if (coef === -1) return `-${variable}`;
    return `${coef}${variable}`;
  }

  function trimFixed(value, digits = 2) {
    return Number(value)
      .toFixed(digits)
      .replace(/\.?0+$/, '');
  }

  function formatLinearExpr(a, b) {
    if (a === 0) return `${b}`;
    const xPart = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
    if (b === 0) return xPart;
    return `${xPart}${b > 0 ? '+' : ''}${b}`;
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

  // --- s1-3-1 參數化輔助函式（coeffs 一律「高次到低次」）---
  function s131PolyEval(coeffs, x) {
    return coeffs.reduce((acc, c) => acc * x + c, 0);
  }
  function s131RandPoly(degree, lo, hi) {
    const c = [];
    let lead = 0;
    while (lead === 0) lead = randInt(lo, hi);
    c.push(lead);
    for (let k = 1; k <= degree; k += 1) c.push(randInt(lo, hi));
    return c;
  }
  function s131PolyMul(a, b) {
    const res = new Array(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i += 1) {
      for (let j = 0; j < b.length; j += 1) res[i + j] += a[i] * b[j];
    }
    return res;
  }
  function s131PolyAdd(a, b) {
    const n = Math.max(a.length, b.length);
    const res = new Array(n).fill(0);
    for (let i = 0; i < n; i += 1) {
      res[n - 1 - i] = (a[a.length - 1 - i] || 0) + (b[b.length - 1 - i] || 0);
    }
    return res;
  }
  function s131PointText(points) {
    return points.map(([x, y]) => `(${x},${y})`).join(',');
  }
  // x^n ≡ a·x + b (mod x^2 + B x + C)，回傳 [a, b]
  function s131XnMod2(n, B, C) {
    let a = 0;
    let b = 1;
    for (let k = 0; k < n; k += 1) {
      const na = b - a * B;
      const nb = -a * C;
      a = na;
      b = nb;
    }
    return [a, b];
  }

  // --- s1-2 座標幾何輔助函式 ---
  function s12Signed(v) {
    return v >= 0 ? `+${v}` : `${v}`;
  }
  function s12VarTerm(coef, v) {
    if (coef === 0) return '';
    const sign = coef < 0 ? '-' : '';
    const mag = Math.abs(coef) === 1 ? '' : `${Math.abs(coef)}`;
    return `${sign}${mag}${v}`;
  }
  function s12LineText(a, b, c) {
    let g = gcd(gcd(Math.abs(a), Math.abs(b)), Math.abs(c)) || 1;
    let A = a / g;
    let B = b / g;
    let C = c / g;
    if (A < 0 || (A === 0 && B < 0)) {
      A = -A;
      B = -B;
      C = -C;
    }
    let out = '';
    if (A !== 0) out += s12VarTerm(A, 'x');
    if (B !== 0) out += (out && B > 0 ? '+' : '') + s12VarTerm(B, 'y');
    if (C !== 0) out += s12Signed(C);
    return `${out || '0'}=0`;
  }
  function s12CircleStandard(h, k, r2) {
    const xs = h === 0 ? 'x^2' : `(x${s12Signed(-h)})^2`;
    const ys = k === 0 ? 'y^2' : `(y${s12Signed(-k)})^2`;
    return `${xs}+${ys}=${r2}`;
  }
  function s12CircleGeneral(h, k, r2) {
    const d = -2 * h;
    const e = -2 * k;
    const f = h * h + k * k - r2;
    let out = 'x^2+y^2';
    if (d !== 0) out += (d > 0 ? '+' : '') + s12VarTerm(d, 'x');
    if (e !== 0) out += (e > 0 ? '+' : '') + s12VarTerm(e, 'y');
    if (f !== 0) out += s12Signed(f);
    return `${out}=0`;
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

  function formatFunctionLinear(a, b, variable = 'x') {
    return formatLinearExpr(a, b).replaceAll('x', variable);
  }

  function formatFunctionFractionValue(value) {
    const frac = typeof value === 'number' ? makeFraction(value, 1) : makeFraction(value.num, value.den);
    return formatFraction(frac.num, frac.den);
  }

  function formatS111RepeatingDecimal(integerPart, nonRepeat, repeat) {
    return `${integerPart}.${nonRepeat || ''}\\overline{${repeat}}`;
  }

  function buildS111RepeatingDecimalFractionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const patterns = [
      { intMin: 0, intMax: 0, nonRepeatLen: 0, repeatLen: 2 },
      { intMin: 0, intMax: 0, nonRepeatLen: 0, repeatLen: 3 },
      { intMin: 0, intMax: 0, nonRepeatLen: 1, repeatLen: 1 },
      { intMin: 1, intMax: 4, nonRepeatLen: 0, repeatLen: 3 },
      { intMin: 0, intMax: 0, nonRepeatLen: 2, repeatLen: 2 },
    ];
    const randomDigits = (len, firstCanBeZero = true) => {
      let text = '';
      for (let i = 0; i < len; i += 1) {
        const digit = i === 0 && !firstCanBeZero ? randInt(1, 9) : randInt(0, 9);
        text += `${digit}`;
      }
      return text;
    };
    const toNumber = (text) => (text ? Number(text) : 0);

    for (let i = 0; i < count; i += 1) {
      const pattern = patterns[i % patterns.length];
      let repeat = randomDigits(pattern.repeatLen, false);
      while (/^0+$/.test(repeat)) repeat = randomDigits(pattern.repeatLen, false);
      const nonRepeat = randomDigits(pattern.nonRepeatLen, true);
      const integerPart = randInt(pattern.intMin, pattern.intMax);
      const m = nonRepeat.length;
      const r = repeat.length;
      const denominator = 10 ** m * (10 ** r - 1);
      const numeratorPart = toNumber(`${nonRepeat}${repeat}`) - toNumber(nonRepeat);
      const totalNumerator = integerPart * denominator + numeratorPart;
      const value = reduceFraction(totalNumerator, denominator);
      const decimalText = formatS111RepeatingDecimal(integerPart, nonRepeat, repeat);
      const prefixText = nonRepeat ? `非循環部分為 ${nonRepeat}，` : '';
      questions.push(`將 \\(${decimalText}\\) 化為最簡分數。`);
      answers.push(
        `簡答：\\(${formatFraction(value.numerator, value.denominator)}\\)。過程：${prefixText}循環節為 ${repeat}。小數部分 \\(=\\frac{${toNumber(`${nonRepeat}${repeat}`)}-${toNumber(nonRepeat)}}{10^{${m}}(10^{${r}}-1)}=\\frac{${numeratorPart}}{${denominator}}\\)。加上整數部分後得 \\(\\frac{${totalNumerator}}{${denominator}}=${formatFraction(value.numerator, value.denominator)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function hasOnlyTwoFiveFactors(value) {
    let n = Math.abs(value);
    while (n % 2 === 0) n /= 2;
    while (n % 5 === 0) n /= 5;
    return n === 1;
  }

  function finiteDecimalCandidates(numeratorBase, denominator, minA, maxA, multiplier = 1) {
    const values = [];
    for (let a = minA; a <= maxA; a += 1) {
      const numerator = numeratorBase + multiplier * a;
      const reducedDenominator = Math.abs(denominator / gcdInt(numerator, denominator));
      if (hasOnlyTwoFiveFactors(reducedDenominator)) values.push(a);
    }
    return values;
  }

  function makeS111FiniteDecimalCase() {
    const badFactors = [3, 7, 9, 11, 13, 27];
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const bad = badFactors[randInt(0, badFactors.length - 1)];
      const smooth = 2 ** randInt(1, 3) * 5 ** randInt(0, 2);
      const den = bad * smooth;
      const mult = randInt(1, 3);
      const min = randInt(0, 3);
      const max = min + randInt(8, 15);
      const targetA = randInt(min, max);
      const base = bad * randInt(8, 80) - mult * targetA;
      if (base <= 0) continue;
      const values = finiteDecimalCandidates(base, den, min, max, mult);
      if (values.length > 0 && values.length <= 8) return { base, den, min, max, mult };
    }
    return { base: 290, den: 140, min: 0, max: 9, mult: 1 };
  }

  function buildS111FiniteDecimalCriterionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = makeS111FiniteDecimalCase();
      const values = finiteDecimalCandidates(item.base, item.den, item.min, item.max, item.mult);
      const numeratorText = item.mult === 1 ? `${item.base}+a` : `${item.base}+${item.mult}a`;
      const valueText = values.length ? values.join('、') : '無';
      questions.push(
        `設 \\(a\\) 為 ${item.min} 到 ${item.max} 的整數，若 \\(\\frac{${numeratorText}}{${item.den}}\\) 可化為有限小數，求所有可能的 \\(a\\)。`
      );
      answers.push(
        `簡答：${valueText}。過程：分數化為最簡分數後，分母只能含質因數 2 與 5。逐一檢查 \\(${numeratorText}\\) 與 ${item.den} 約分後的分母，符合條件的 \\(a\\) 為 ${valueText}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function powModInt(base, exponent, mod) {
    let result = 1 % mod;
    let current = ((base % mod) + mod) % mod;
    let power = exponent;
    while (power > 0) {
      if (power % 2 === 1) result = (result * current) % mod;
      current = (current * current) % mod;
      power = Math.floor(power / 2);
    }
    return result;
  }

  function buildRemainderCycle(base, mod) {
    const cycle = [];
    let value = ((base % mod) + mod) % mod;
    const seen = new Map();
    for (let step = 1; step <= 2 * mod + 10; step += 1) {
      if (seen.has(value)) return cycle.slice(seen.get(value));
      seen.set(value, cycle.length);
      cycle.push(value);
      value = (value * base) % mod;
    }
    return cycle;
  }

  function buildS111PowerRemainderCycleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const mods = [10, 7, 9, 11, 13];
    const baseChoices = {
      10: [2, 3, 7, 8],
      7: [2, 3, 5],
      9: [2, 4, 5, 7],
      11: [2, 3, 7, 8],
      13: [2, 5, 6, 7],
    };
    for (let i = 0; i < count; i += 1) {
      const mod = mods[i % mods.length];
      const base = baseChoices[mod][randInt(0, baseChoices[mod].length - 1)];
      const exponent = randInt(24, 160);
      const answer = powModInt(base, exponent, mod);
      const cycle = buildRemainderCycle(base, mod);
      const cycleText = cycle.join('，');
      if (mod === 10) {
        questions.push(`求 \\(${base}^{${exponent}}\\) 的個位數。`);
        answers.push(
          `答案：\\(${answer}\\)。解析：觀察 \\(${base}^n\\) 的個位數循環為 ${cycleText}，週期是 ${cycle.length}。第 \\(${exponent}\\) 次方會落在循環第 \\(${((exponent - 1) % cycle.length) + 1}\\) 項，所以個位數為 \\(${answer}\\)。`
        );
      } else {
        questions.push(`求 \\(${base}^{${exponent}}\\) 除以 \\(${mod}\\) 的餘數。`);
        answers.push(
          `答案：\\(${answer}\\)。解析：\\(${base}^n\\) 除以 \\(${mod}\\) 的餘數循環為 ${cycleText}，週期是 ${cycle.length}。第 \\(${exponent}\\) 次方會落在循環第 \\(${((exponent - 1) % cycle.length) + 1}\\) 項，得到本題餘數為 \\(${answer}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function numberFromDigitArray(digits) {
    return Number(digits.join(''));
  }

  function buildS111DivisibilityMissingDigitSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cases = [
      { mod: 72, hint: '同時檢查 8 與 9 的整除條件' },
      { mod: 36, hint: '同時檢查 4 與 9 的整除條件' },
      { mod: 45, hint: '同時檢查 5 與 9 的整除條件' },
      { mod: 88, hint: '同時檢查 8 與 11 的整除條件' },
      { mod: 99, hint: '同時檢查 9 與 11 的整除條件' },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      let digits = [];
      let aPos = 1;
      let bPos = 4;
      let pairs = [];
      for (let attempt = 0; attempt < 300; attempt += 1) {
        const length = randInt(6, 8);
        digits = Array.from({ length }, (_, index) => (index === 0 ? randInt(1, 9) : randInt(0, 9)));
        aPos = randInt(1, length - 3);
        bPos = randInt(aPos + 1, length - 1);
        pairs = [];
        for (let a = 0; a <= 9; a += 1) {
          for (let b = 0; b <= 9; b += 1) {
            const trial = digits.slice();
            trial[aPos] = a;
            trial[bPos] = b;
            if (numberFromDigitArray(trial) % item.mod === 0) pairs.push([a, b]);
          }
        }
        if (pairs.length >= 1 && pairs.length <= 8) break;
      }
      const pattern = digits
        .map((digit, index) => {
          if (index === aPos) return 'a';
          if (index === bPos) return 'b';
          return `${digit}`;
        })
        .join('');
      const pairText = pairs.map(([a, b]) => `(${a},${b})`).join('，');
      questions.push(
        `已知 \\(${pattern}\\) 是 \\(${item.mod}\\) 的倍數，其中 \\(a,b\\) 為數字。求所有可能的 \\((a,b)\\)。`
      );
      answers.push(
        `答案：${pairText}。解析：逐一代入 \\(a,b=0,1,\\ldots,9\\)，並利用「${item.hint}」。符合 \\(${pattern}\\) 可被 \\(${item.mod}\\) 整除的組合為 ${pairText}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function compareFractions(left, right) {
    return left.num * right.den - right.num * left.den;
  }

  function formatFractionObject(value) {
    return formatFraction(value.num, value.den);
  }

  function buildS112QuotientIntervalRangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const xLow = randInt(-8, 3);
      const xHigh = xLow + randInt(3, 10);
      const yLow = randInt(2, 7);
      const yHigh = yLow + randInt(2, 8);
      const candidates = [
        makeFraction(xLow, yLow),
        makeFraction(xLow, yHigh),
        makeFraction(xHigh, yLow),
        makeFraction(xHigh, yHigh),
      ].sort(compareFractions);
      const min = candidates[0];
      const max = candidates[candidates.length - 1];
      questions.push(
        `若 \\(${xLow}\\leq x\\leq ${xHigh}\\)，且 \\(${yLow}\\leq y\\leq ${yHigh}\\)，求 \\(\\frac{x}{y}\\) 的範圍。`
      );
      answers.push(
        `答案：\\(${formatFractionObject(min)}\\leq \\frac{x}{y}\\leq ${formatFractionObject(max)}\\)。解析：因為 \\(y\\) 全為正數，\\(\\frac{x}{y}\\) 的最大、最小會出現在端點組合。比較 \\(${formatFractionObject(candidates[0])}, ${formatFractionObject(candidates[1])}, ${formatFractionObject(candidates[2])}, ${formatFractionObject(candidates[3])}\\)，可得範圍。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS114ExponentialParameterRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const bases = [2, 3, 5, 7, 11];
    const seen = new Set();

    function shiftedDenominator(variable, shift, sign = '-') {
      if (shift === 0) return variable;
      return sign === '-' ? `${variable}-${shift}` : `${shift}-${variable}`;
    }

    function fracOver(numerator, denominator) {
      return `\\frac{${numerator}}{${denominator}}`;
    }

    function addFractionExpr(constant, numerator, denominator) {
      const frac = fracOver(numerator, denominator);
      if (constant === 0) return frac;
      return `${constant}+${frac}`;
    }

    function subtractFractionExpr(constant, numerator, denominator) {
      const frac = fracOver(numerator, denominator);
      if (constant === 0) return `-${frac}`;
      return `${constant}-${frac}`;
    }

    function coefficientPower(coefficient, base, exponentText) {
      const power = `${base}^{${exponentText}}`;
      return coefficient === 1 ? power : `${coefficient}\\cdot ${power}`;
    }

    function addQuestion(question, answer) {
      if (seen.has(question)) return false;
      seen.add(question);
      questions.push(question);
      answers.push(answer);
      return true;
    }

    let attempts = 0;
    while (questions.length < count && attempts < count * 20) {
      attempts += 1;
      const base = bases[randInt(0, bases.length - 1)];
      const shift = randInt(1, 5);
      const constant = randInt(1, 4);
      const coefficient = randInt(1, 4);
      const inverseCoefficient = randInt(1, 5);
      const numerator = coefficient * inverseCoefficient;
      const mode = randInt(0, 4);

      if (mode === 0) {
        const denominator = shiftedDenominator('a', shift);
        const answerExpr = subtractFractionExpr(constant, numerator, denominator);
        addQuestion(
          `設 \\(a=${shift}+${coefficientPower(coefficient, base, 'k')}\\)，\\(b=${constant}-${coefficientPower(inverseCoefficient, base, '-k')}\\)，試用 \\(a\\) 表示 \\(b\\)。`,
          `答案：\\(b=${answerExpr}\\)。解析：由 \\(a=${shift}+${coefficientPower(coefficient, base, 'k')}\\) 得 \\(${base}^k=\\frac{a-${shift}}{${coefficient}}\\)，所以 \\(${base}^{-k}=\\frac{${coefficient}}{a-${shift}}\\)。代入 \\(b=${constant}-${coefficientPower(inverseCoefficient, base, '-k')}\\)，得 \\(b=${constant}-${fracOver(numerator, denominator)}=${answerExpr}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        const denominator = shiftedDenominator('a', shift);
        const answerExpr = addFractionExpr(constant, numerator, denominator);
        addQuestion(
          `設 \\(a=${shift}+${coefficientPower(coefficient, base, 'k')}\\)，\\(b=${constant}+${coefficientPower(inverseCoefficient, base, '-k')}\\)，試用 \\(a\\) 表示 \\(b\\)。`,
          `答案：\\(b=${answerExpr}\\)。解析：由 \\(a=${shift}+${coefficientPower(coefficient, base, 'k')}\\) 得 \\(${base}^{-k}=\\frac{${coefficient}}{a-${shift}}\\)，所以 \\(b=${constant}+${inverseCoefficient}\\cdot\\frac{${coefficient}}{a-${shift}}=${answerExpr}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        const denominator = shiftedDenominator('a', shift);
        const bExpr = addFractionExpr(constant, numerator, denominator);
        const sumExpr = `a+${constant}+${fracOver(numerator, denominator)}`;
        addQuestion(
          `設 \\(a=${shift}+${coefficientPower(coefficient, base, 'k')}\\)，\\(b=${constant}+${coefficientPower(inverseCoefficient, base, '-k')}\\)，試用 \\(a\\) 表示 \\(a+b\\)。`,
          `答案：\\(a+b=${sumExpr}\\)。解析：先由 \\(a=${shift}+${coefficientPower(coefficient, base, 'k')}\\) 得 \\(${base}^{-k}=\\frac{${coefficient}}{a-${shift}}\\)，所以 \\(b=${bExpr}\\)。因此 \\(a+b=a+${constant}+${fracOver(numerator, denominator)}\\)。`
        );
        continue;
      }

      if (mode === 3) {
        const denominator = 'a';
        const answerExpr = addFractionExpr(constant, numerator, denominator);
        addQuestion(
          `設 \\(a=${coefficientPower(coefficient, base, 'k')}\\)，\\(b=${constant}+${coefficientPower(inverseCoefficient, base, '-k')}\\)，試用 \\(a\\) 表示 \\(b\\)。`,
          `答案：\\(b=${answerExpr}\\)。解析：由 \\(a=${coefficientPower(coefficient, base, 'k')}\\) 得 \\(${base}^{-k}=\\frac{${coefficient}}{a}\\)，所以 \\(b=${constant}+${inverseCoefficient}\\cdot\\frac{${coefficient}}{a}=${answerExpr}\\)。`
        );
        continue;
      }

      const denominator = shiftedDenominator('a', shift);
      const answerExpr = addFractionExpr(constant, numerator, denominator);
      addQuestion(
        `設 \\(a=${shift}+${coefficientPower(coefficient, base, '-k')}\\)，\\(b=${constant}+${coefficientPower(inverseCoefficient, base, 'k')}\\)，試用 \\(a\\) 表示 \\(b\\)。`,
        `答案：\\(b=${answerExpr}\\)。解析：由 \\(a=${shift}+${coefficientPower(coefficient, base, '-k')}\\) 得 \\(${base}^{-k}=\\frac{a-${shift}}{${coefficient}}\\)，所以 \\(${base}^k=\\frac{${coefficient}}{a-${shift}}\\)。代入 \\(b=${constant}+${coefficientPower(inverseCoefficient, base, 'k')}\\)，得 \\(b=${constant}+${fracOver(numerator, denominator)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function formatS111SignedRadicalTerm(coeff, inside, sign) {
    const radical = inside === 1 ? `${coeff}` : `${coeff === 1 ? '' : coeff}\\sqrt{${inside}}`;
    return sign === '-' ? `-${radical}` : `+${radical}`;
  }

  function formatS111RadicalSum(left, sign, right) {
    if (sign === '+') return `${left}+${right}`;
    return `${left}-${right}`;
  }

  function buildS111NestedRadicalSimplifySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    while (questions.length < count) {
      const sign = questions.length % 2 === 0 ? '-' : '+';
      const p = randInt(1, 24);
      const q = randInt(1, 24);
      if (p === q) continue;
      if (sign === '-' && p < q) continue;
      if (simplifyRadical(p).inside === simplifyRadical(q).inside) continue;
      const inner = simplifyRadical(p * q);
      if (inner.inside === 1) continue;
      if (inner.inside > 72) continue;
      const coeff = 2 * inner.outside;
      const constant = p + q;
      const left = formatRadical(sign === '-' ? p : Math.max(p, q));
      const right = formatRadical(sign === '-' ? q : Math.min(p, q));
      const answerText =
        sign === '-'
          ? formatS111RadicalSum(formatRadical(p), '-', formatRadical(q))
          : formatS111RadicalSum(formatRadical(Math.max(p, q)), '+', formatRadical(Math.min(p, q)));
      const middleTerm = formatS111SignedRadicalTerm(coeff, inner.inside, sign);
      questions.push(`化簡 \\(\\sqrt{${constant}${middleTerm}}\\)。`);
      answers.push(
        `簡答：\\(${answerText}\\)。過程：因為 \\((${left}${sign === '+' ? '+' : '-'}${right})^2=${p}+${q}${middleTerm}=${constant}${middleTerm}\\)，且根號表示非負值，所以 \\(\\sqrt{${constant}${middleTerm}}=${answerText}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS111RadicalIntegerFractionalPartSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const nonSquares = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19];
    for (let i = 0; i < count; i += 1) {
      const sign = i % 2 === 0 ? '+' : '-';
      const n = nonSquares[randInt(0, nonSquares.length - 1)];
      const rootFloor = Math.floor(Math.sqrt(n));
      const rootCeil = rootFloor + 1;
      let c = randInt(rootCeil + 1, rootCeil + 6);
      if (sign === '+') c = randInt(1, 6);
      const constant = c * c + n;
      const middle = simplifyRadical(c * c * n);
      if (middle.inside === 1) {
        i -= 1;
        continue;
      }
      const coeff = 2 * middle.outside;
      const middleTerm = formatS111SignedRadicalTerm(coeff, middle.inside, sign);
      const simplified = sign === '+' ? `${c}+\\sqrt{${n}}` : `${c}-\\sqrt{${n}}`;
      const a = sign === '+' ? c + rootFloor : c - rootCeil;
      const b = sign === '+' ? `\\sqrt{${n}}-${rootFloor}` : `${rootCeil}-\\sqrt{${n}}`;
      if (a < 0) {
        i -= 1;
        continue;
      }
      questions.push(
        `設 \\(\\sqrt{${constant}${middleTerm}}\\) 的整數部分為 \\(a\\)，正小數部分為 \\(b\\)，求 \\(a,b\\)。`
      );
      answers.push(
        `簡答：\\(a=${a},\\ b=${b}\\)。過程：\\(\\sqrt{${constant}${middleTerm}}=${simplified}\\)。又 \\(${rootFloor}<\\sqrt{${n}}<${rootCeil}\\)，所以此數介於 \\(${a}\\) 與 \\(${a + 1}\\) 之間，整數部分 \\(a=${a}\\)，正小數部分 \\(b=(${simplified})-${a}=${b}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS111RationalIrrationalTrueFalseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const items = [
      {
        statement: '若 \\(a,b\\) 均為無理數，則 \\(a+b\\) 必為無理數。',
        truth: false,
        process: '反例：取 \\(a=\\sqrt{2}, b=-\\sqrt{2}\\)，兩者都是無理數，但 \\(a+b=0\\) 是有理數。',
      },
      {
        statement: '若 \\(a\\) 為有理數且 \\(b\\) 為無理數，則 \\(a+b\\) 必為無理數。',
        truth: true,
        process: '若 \\(a+b\\) 是有理數，則 \\(b=(a+b)-a\\) 也會是有理數，與 \\(b\\) 為無理數矛盾。',
      },
      {
        statement: '若 \\(a\\) 為非零有理數且 \\(b\\) 為無理數，則 \\(ab\\) 必為無理數。',
        truth: true,
        process: '若 \\(ab\\) 是有理數，因 \\(a\\neq0\\) 且 \\(a\\) 有理，則 \\(b=\\frac{ab}{a}\\) 會是有理數，矛盾。',
      },
      {
        statement: '若 \\(a,b\\) 均為無理數，則 \\(ab\\) 必為無理數。',
        truth: false,
        process: '反例：取 \\(a=b=\\sqrt{2}\\)，則 \\(ab=2\\) 是有理數。',
      },
      {
        statement: '若 \\(a+b\\) 與 \\(a-b\\) 均為有理數，則 \\(a,b\\) 必為有理數。',
        truth: true,
        process: '因 \\(a=\\frac{(a+b)+(a-b)}{2}\\)，\\(b=\\frac{(a+b)-(a-b)}{2}\\)，有理數經加減除以 2 後仍為有理數。',
      },
      {
        statement: '任意兩個相異有理數之間，必存在另一個有理數。',
        truth: true,
        process: '設兩有理數為 \\(p<q\\)，則平均數 \\(\\frac{p+q}{2}\\) 仍為有理數，且位於 \\(p\\) 與 \\(q\\) 之間。',
      },
      {
        statement: '若 \\(a^2\\) 為有理數，則 \\(a\\) 必為有理數。',
        truth: false,
        process: '反例：取 \\(a=\\sqrt{2}\\)，則 \\(a^2=2\\) 是有理數，但 \\(a\\) 是無理數。',
      },
      {
        statement: '若 \\(a^3\\) 與 \\(a^8\\) 均為有理數，則 \\(a\\) 必為有理數。',
        truth: true,
        process:
          '若 \\(a=0\\) 則為有理數；若 \\(a\\neq0\\)，則 \\(a=\\frac{a^9}{a^8}=\\frac{(a^3)^3}{a^8}\\)，分子分母皆為有理數，所以 \\(a\\) 為有理數。',
      },
      {
        statement: '非零無理數的倒數必為無理數。',
        truth: true,
        process: '若 \\(\\frac{1}{a}\\) 是有理數且不為 0，則 \\(a\\) 會是此有理數的倒數，也會是有理數，矛盾。',
      },
      {
        statement: '若 \\(a\\) 為有理數、\\(b\\) 為無理數，則 \\(a-b\\) 必為無理數。',
        truth: true,
        process: '若 \\(a-b\\) 是有理數，則 \\(b=a-(a-b)\\) 也會是有理數，與 \\(b\\) 為無理數矛盾。',
      },
    ];
    const selected = shuffle(items);
    const prompts = [
      '判斷是非，並說明理由：',
      '判斷下列敘述是否正確，並簡述理由：',
      '下列敘述對嗎？請說明：',
      '判斷命題真假：',
    ];
    for (let i = 0; i < count; i += 1) {
      const item = selected[i % selected.length];
      const prompt = prompts[randInt(0, prompts.length - 1)];
      questions.push(`${prompt}${item.statement}`);
      answers.push(`簡答：${item.truth ? '正確' : '錯誤'}。過程：${item.process}`);
    }
    return { questions, summaryAnswers, answers };
  }

  function formatS111SurdPart(coeff, radical) {
    const abs = Math.abs(coeff);
    const body = `${abs === 1 ? '' : abs}\\sqrt{${radical}}`;
    return coeff < 0 ? `-${body}` : `+${body}`;
  }

  function formatS111SurdBinomial(rational, coeff, radical) {
    if (coeff === 0) return `${rational}`;
    if (rational === 0) {
      const part = formatS111SurdPart(coeff, radical);
      return part.startsWith('+') ? part.slice(1) : part;
    }
    return `${rational}${formatS111SurdPart(coeff, radical)}`;
  }

  function formatS111LinearEquationRow(a, xName, b, yName, value) {
    const left = `${formatTerm(a, xName)} ${b < 0 ? '- ' : '+ '}${formatTerm(Math.abs(b), yName)}`;
    return `${left}=${value}`;
  }

  function formatS111ConstantMinusVariable(value, variable) {
    if (value === 0) return `-${variable}`;
    return value > 0 ? `${value}-${variable}` : `-${Math.abs(value)}-${variable}`;
  }

  function formatS111ConstantMinusVariableSqrtTerm(value, variable, radical) {
    if (value < 0) return `-(${Math.abs(value)}+${variable})\\sqrt{${radical}}`;
    if (value === 0) return `-${variable}\\sqrt{${radical}}`;
    return `+(${value}-${variable})\\sqrt{${radical}}`;
  }

  function formatS111SurdBinomialVariableTerm(rational, coeff, radical, variable, isFirst = false) {
    const body = formatS111SurdBinomial(rational, coeff, radical);
    if (isFirst) return `(${body})${variable}`;
    if (body.startsWith('-')) return `-(${formatS111SurdBinomial(-rational, -coeff, radical)})${variable}`;
    return `+(${body})${variable}`;
  }

  function buildS111IrrationalEqualitySolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const radicals = [2, 3, 5, 6, 7, 10, 11];
    while (questions.length < count) {
      const mode = questions.length % 5;
      const radical = radicals[randInt(0, radicals.length - 1)];

      if (mode === 0 || mode === 1) {
        const x = pickNonZero(-5, 5);
        const y = pickNonZero(-5, 5);
        let a = pickNonZero(-4, 5);
        let c = pickNonZero(-4, 5);
        let b = pickNonZero(-4, 5);
        let d = pickNonZero(-4, 5);
        while (a * d - b * c === 0) {
          a = pickNonZero(-4, 5);
          c = pickNonZero(-4, 5);
          b = pickNonZero(-4, 5);
          d = pickNonZero(-4, 5);
        }
        const rationalTarget = a * x + c * y;
        const irrationalTarget = b * x + d * y;
        const left = `${formatS111SurdBinomialVariableTerm(a, b, radical, 'x', true)}${formatS111SurdBinomialVariableTerm(c, d, radical, 'y')}`;
        const right = formatS111SurdBinomial(rationalTarget, irrationalTarget, radical);
        if (mode === 0) {
          questions.push(`設 \\(x,y\\) 為有理數，若 \\(${left}=${right}\\)，求 \\(x,y\\) 的值。`);
          answers.push(
            `簡答：\\(x=${x},\\ y=${y}\\)。過程：比較有理數部分與 \\(\\sqrt{${radical}}\\) 的係數，得 \\(${formatS111LinearEquationRow(a, 'x', c, 'y', rationalTarget)}\\)、\\(${formatS111LinearEquationRow(b, 'x', d, 'y', irrationalTarget)}\\)。解聯立方程式，得 \\(x=${x},\\ y=${y}\\)。`
          );
        } else {
          questions.push(`設 \\(x,y\\in\\mathbb{Q}\\)，若 \\(${left}=${right}\\)，求 \\(x+y\\)。`);
          answers.push(
            `簡答：\\(${x + y}\\)。過程：比較有理數部分與 \\(\\sqrt{${radical}}\\) 的係數，得 \\(${formatS111LinearEquationRow(a, 'x', c, 'y', rationalTarget)}\\)、\\(${formatS111LinearEquationRow(b, 'x', d, 'y', irrationalTarget)}\\)。解得 \\(x=${x},\\ y=${y}\\)，所以 \\(x+y=${x + y}\\)。`
          );
        }
        continue;
      }

      if (mode === 2) {
        const aValue = pickNonZero(-5, 7);
        const bValue = pickNonZero(-5, 7);
        const r = 2 * aValue - bValue;
        const s = aValue + 2 * bValue;
        questions.push(
          `設 \\(a,b\\in\\mathbb{Q}\\)，若 \\((a-b)+(a+b)\\sqrt{${radical}}=(${formatS111ConstantMinusVariable(r, 'a')})${formatS111ConstantMinusVariableSqrtTerm(s, 'b', radical)}\\)，求 \\(a,b\\)。`
        );
        answers.push(
          `簡答：\\(a=${aValue},\\ b=${bValue}\\)。過程：比較有理數部分得 \\(a-b=${formatS111ConstantMinusVariable(r, 'a')}\\)，比較 \\(\\sqrt{${radical}}\\) 的係數得 \\(a+b=${formatS111ConstantMinusVariable(s, 'b')}\\)。解此聯立方程式，得 \\(a=${aValue},\\ b=${bValue}\\)。`
        );
        continue;
      }

      if (mode === 3) {
        const aValue = pickNonZero(-4, 6);
        const bValue = pickNonZero(-4, 6);
        let p = pickNonZero(1, 4);
        let q = pickNonZero(1, 4);
        let r = pickNonZero(1, 4);
        let s = pickNonZero(1, 4);
        while (p * s - q * r === 0) {
          p = pickNonZero(1, 4);
          q = pickNonZero(1, 4);
          r = pickNonZero(1, 4);
          s = pickNonZero(1, 4);
        }
        const rationalTarget = p * aValue + r * bValue;
        const irrationalTarget = q * aValue + s * bValue;
        questions.push(
          `設 \\(a,b\\) 為有理數，若 \\(${formatS111SurdBinomialVariableTerm(p, q, radical, 'a', true)}${formatS111SurdBinomialVariableTerm(r, s, radical, 'b')}=${formatS111SurdBinomial(rationalTarget, irrationalTarget, radical)}\\)，求 \\(a,b\\)。`
        );
        answers.push(
          `簡答：\\(a=${aValue},\\ b=${bValue}\\)。過程：比較有理數部分與 \\(\\sqrt{${radical}}\\) 的係數，得 \\(${formatS111LinearEquationRow(p, 'a', r, 'b', rationalTarget)}\\)、\\(${formatS111LinearEquationRow(q, 'a', s, 'b', irrationalTarget)}\\)。解得 \\(a=${aValue},\\ b=${bValue}\\)。`
        );
        continue;
      }

      const x = pickNonZero(-5, 6);
      const y = pickNonZero(-5, 6);
      const m = randInt(2, 5);
      const n = randInt(2, 6);
      const rationalTarget = x + m * m;
      const irrationalTarget = y * n;
      questions.push(
        `若 \\(x,y\\in\\mathbb{Q}\\)，且 \\(x+${n}y\\sqrt{${radical}}+${m * m}=${formatS111SurdBinomial(rationalTarget, irrationalTarget, radical)}\\)，求 \\(x^2+y^2\\)。`
      );
      answers.push(
        `簡答：\\(${x * x + y * y}\\)。過程：比較有理數部分與 \\(\\sqrt{${radical}}\\) 的係數，得 \\(x+${m * m}=${rationalTarget}\\)、\\(${n}y=${irrationalTarget}\\)，所以 \\(x=${x}, y=${y}\\)，\\(x^2+y^2=${x * x + y * y}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function formatS111PointFraction(fraction) {
    return formatFunctionFractionValue(fraction);
  }

  function formatS111NumericDifferenceText(end, start) {
    return `${end}${formatSignedNumber(-start)}`;
  }

  function buildS111NumberLineSectionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = randInt(-10, 4);
        const b = a + randInt(4, 15);
        const m = randInt(2, 7);
        const n = randInt(2, 8);
        const p = makeFraction(n * a + m * b, m + n);
        questions.push(
          `數線上有 \\(A(${a}), B(${b})\\)，點 \\(P\\) 在線段 \\(AB\\) 上且 \\(PA:PB=${m}:${n}\\)，求 \\(P\\) 點坐標。`
        );
        answers.push(
          `簡答：\\(${formatS111PointFraction(p)}\\)。過程：內分點公式為 \\(P=\\frac{${n}\\cdot${a}+${m}\\cdot${b}}{${m}+${n}}=${formatS111PointFraction(p)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const a = randInt(-12, 0);
        const b = a + randInt(5, 16);
        let m = randInt(2, 8);
        let n = randInt(2, 8);
        while (m === n) n = randInt(2, 8);
        const internal = makeFraction(n * a + m * b, m + n);
        const external = makeFraction(m * b - n * a, m - n);
        questions.push(
          `數線上 \\(A(${a}), B(${b})\\)，點 \\(P\\) 滿足 \\(AP:PB=${m}:${n}\\)，求 \\(P\\) 點可能的所有坐標。`
        );
        answers.push(
          `簡答：\\(${formatS111PointFraction(internal)}\\)、\\(${formatS111PointFraction(external)}\\)。過程：一個點在 \\(AB\\) 之間，內分坐標為 \\(\\frac{${n}\\cdot${a}+${m}\\cdot${b}}{${m}+${n}}=${formatS111PointFraction(internal)}\\)；另一個點在線段外，外分坐標為 \\(\\frac{${m}\\cdot${b}-${n}\\cdot${a}}{${m}-${n}}=${formatS111PointFraction(external)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const a = randInt(-8, 4);
        const b = a + randInt(5, 18);
        const m = randInt(2, 7);
        const n = randInt(2, 7);
        const p = makeFraction(n * a + m * b, m + n);
        questions.push(
          `設 \\(A(${a}), B(${b})\\)，\\(P\\) 介於 \\(A,B\\) 之間且 \\(AP:BP=${m}:${n}\\)，求 \\(P\\) 點坐標。`
        );
        answers.push(
          `簡答：\\(${formatS111PointFraction(p)}\\)。過程：\\(AP:BP=${m}:${n}\\) 表示 \\(P\\) 距離 \\(A\\) 佔全長的 \\(\\frac{${m}}{${m}+${n}}\\)。因此 \\(P=${a}+\\frac{${m}}{${m}+${n}}(${formatS111NumericDifferenceText(b, a)})=${formatS111PointFraction(p)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const p0 = pickNonZero(-10, 10);
        const o = 0;
        let m = randInt(2, 7);
        let n = randInt(2, 7);
        while (m === n) n = randInt(2, 7);
        const internal = makeFraction(n * p0 + m * o, m + n);
        const external = makeFraction(m * o - n * p0, m - n);
        questions.push(
          `數線上有 \\(P(${p0}), O(0)\\)，點 \\(Q\\) 滿足 \\(PQ:QO=${m}:${n}\\)。求 \\(Q\\) 點坐標，並分成線段內與線段外兩種情形。`
        );
        answers.push(
          `簡答：線段內 \\(${formatS111PointFraction(internal)}\\)，線段外 \\(${formatS111PointFraction(external)}\\)。過程：線段內用內分公式 \\(Q=\\frac{${n}\\cdot${p0}+${m}\\cdot0}{${m}+${n}}=${formatS111PointFraction(internal)}\\)；線段外用外分公式 \\(Q=\\frac{${m}\\cdot0-${n}\\cdot${p0}}{${m}-${n}}=${formatS111PointFraction(external)}\\)。`
        );
        continue;
      }
      // 把 a,b 分成 kPart 等分，共 kPart-1 個等分點，求第 jIdx 個
      const kPart = randInt(3, 7);
      const jIdx = randInt(1, kPart - 1);
      const gg = gcd(jIdx, kPart);
      const dd2 = kPart / gg;
      const nn2 = jIdx / gg;
      const coefA = dd2 - nn2;
      const coefB = nn2;
      const numerText = `${coefA === 1 ? '' : coefA}a+${coefB === 1 ? '' : coefB}b`;
      const resultText = dd2 === 1 ? numerText : `\\frac{${numerText}}{${dd2}}`;
      const pointList =
        kPart - 1 <= 3
          ? Array.from({ length: kPart - 1 }, (_, t) => `P_${t + 1}`).join(',')
          : `P_1,P_2,\\ldots,P_{${kPart - 1}}`;
      questions.push(
        `設 \\(a<b\\)，若 \\(${pointList}\\) 為 \\(a,b\\) 間的 ${kPart - 1} 個等分點，求 \\(P_{${jIdx}}\\) 的坐標表示式。`
      );
      answers.push(
        `簡答：\\(${resultText}\\)。過程：${kPart - 1} 個等分點把 \\(a,b\\) 分成 ${kPart} 等分，\\(P_{${jIdx}}\\) 為第 ${jIdx} 個等分點，坐標為 \\(a+\\frac{${jIdx}}{${kPart}}(b-a)=${resultText}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS111AmgmExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const k = randInt(4, 10);
        const s = 2 * k;
        const c = randInt(2, 5);
        const max = makeFraction(s * s, 4 * c);
        questions.push(`設 \\(a,b>0\\) 且 \\(a+${c}b=${s}\\)，求 \\(ab\\) 的最大值。`);
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(max)}\\)。過程：令 \\(u=a, v=${c}b\\)，則 \\(u+v=${s}\\)。由算幾不等式，\\(uv\\leq (\\frac{${s}}{2})^2=${k * k}\\)。因 \\(uv=${c}ab\\)，所以 \\(ab\\leq ${formatFunctionFractionValue(max)}\\)，最大值為 \\(${formatFunctionFractionValue(max)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const p = randInt(2, 5);
        const q = randInt(2, 6);
        const k = randInt(4, 9);
        const s = 2 * k;
        const max = makeFraction(s * s, 4 * p * q);
        questions.push(`設 \\(a,b>0\\) 且 \\(${p}a+${q}b=${s}\\)，求 \\(ab\\) 的最大值。`);
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(max)}\\)。過程：令 \\(u=${p}a, v=${q}b\\)，則 \\(u+v=${s}\\)。當 \\(u=v=${k}\\) 時，\\(uv\\) 最大為 ${k * k}。又 \\(uv=${p * q}ab\\)，所以 \\(ab\\) 最大為 \\(${formatFunctionFractionValue(max)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const p = randInt(2, 6);
        const q = randInt(2, 6);
        const t = randInt(2, 6);
        const product = t * t;
        const min = 2 * p * q * t;
        questions.push(`設 \\(x,y>0\\) 且 \\(xy=${product}\\)，求 \\(${p * p}x+${q * q}y\\) 的最小值。`);
        answers.push(
          `簡答：${min}。過程：由算幾不等式，\\(${p * p}x+${q * q}y\\geq2\\sqrt{${p * p}x\\cdot${q * q}y}=2\\cdot${p * q}\\sqrt{xy}=2\\cdot${p * q}\\cdot${t}=${min}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const product = [4, 6, 8, 9, 12, 16][randInt(0, 5)];
        const c = randInt(2, 6);
        const exact = simplifyRadical(c * product);
        const coeff = 2 * exact.outside;
        const g = gcdInt(coeff, product);
        const reducedCoeff = coeff / g;
        const reducedDen = product / g;
        const radicalNumerator = `${reducedCoeff === 1 ? '' : reducedCoeff}\\sqrt{${exact.inside}}`;
        const minText =
          exact.inside === 1
            ? formatFraction(coeff, product)
            : reducedDen === 1
              ? radicalNumerator
              : `\\frac{${radicalNumerator}}{${reducedDen}}`;
        questions.push(`設 \\(a,b>0\\) 且 \\(ab=${product}\\)，求 \\(\\frac{1}{a}+\\frac{${c}}{b}\\) 的最小值。`);
        answers.push(
          `簡答：\\(${minText}\\)。過程：\\(\\frac{1}{a}+\\frac{${c}}{b}\\geq2\\sqrt{\\frac{1}{a}\\cdot\\frac{${c}}{b}}=2\\sqrt{\\frac{${c}}{ab}}=2\\sqrt{\\frac{${c}}{${product}}}=${minText}\\)。`
        );
        continue;
      }
      const c = randInt(1, 5);
      questions.push(
        `設 \\(x,y\\) 為正實數且 \\(x+y=${2 * c}\\)，求 \\(\\frac{${2 * c}y}{x}+\\frac{${2 * c}x}{y}\\) 的最小值。`
      );
      answers.push(
        `簡答：${4 * c}。過程：令 \\(t=\\frac{y}{x}>0\\)，則原式 \\(=${2 * c}t+${2 * c}\\cdot\\frac{1}{t}\\geq2\\sqrt{${2 * c}t\\cdot${2 * c}\\cdot\\frac{1}{t}}=${4 * c}\\)。當 \\(t=1\\)，也就是 \\(x=y=${c}\\) 時取到最小值。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function formatS111RootOrInteger(n) {
    const root = Math.floor(Math.sqrt(n));
    if (root * root === n) return `${root}`;
    return formatRadical(n);
  }

  function formatS111RootDifference(high, low) {
    const highRoot = Math.floor(Math.sqrt(high));
    const lowRoot = Math.floor(Math.sqrt(low));
    if (highRoot * highRoot === high && lowRoot * lowRoot === low) return `${highRoot - lowRoot}`;
    const highRad = simplifyRadical(high);
    const lowRad = simplifyRadical(low);
    if (highRad.inside === lowRad.inside && highRad.inside > 1) {
      const coeff = highRad.outside - lowRad.outside;
      if (coeff === 1) return `\\sqrt{${highRad.inside}}`;
      return `${coeff}\\sqrt{${highRad.inside}}`;
    }
    return `${formatS111RootOrInteger(high)}-${formatS111RootOrInteger(low)}`;
  }

  function buildS111RadicalIntegerRangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const nonSquares = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const n = nonSquares[randInt(0, nonSquares.length - 1)];
        const c = randInt(1, 6);
        const floor = Math.floor(Math.sqrt(n));
        const valueFloor = c + floor;
        const inner = simplifyRadical(c * c * n);
        const expr = `\\sqrt{${c * c + n}+${2 * inner.outside}\\sqrt{${inner.inside}}}`;
        questions.push(`設 \\(a=${expr}\\)，則 \\(a\\) 在哪兩個連續整數之間？`);
        answers.push(
          `簡答：\\(${valueFloor}\\) 與 \\(${valueFloor + 1}\\) 之間。過程：\\(${expr}=\\sqrt{(${c}+\\sqrt{${n}})^2}=${c}+\\sqrt{${n}}\\)。因 \\(${floor}<\\sqrt{${n}}<${floor + 1}\\)，所以 \\(${valueFloor}<a<${valueFloor + 1}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const n = nonSquares[randInt(0, nonSquares.length - 1)];
        const c = randInt(1, 5);
        const floor = Math.floor(Math.sqrt(n));
        const inner = simplifyRadical(c * c * n);
        const expr = `\\sqrt{${c * c + n}+${2 * inner.outside}\\sqrt{${inner.inside}}}`;
        questions.push(`設 \\(a=${expr}\\)，求 \\(a\\) 的整數部分。`);
        answers.push(
          `簡答：${c + floor}。過程：\\(${expr}=${c}+\\sqrt{${n}}\\)，且 \\(${floor}<\\sqrt{${n}}<${floor + 1}\\)，所以 \\(${c + floor}<a<${c + floor + 1}\\)，整數部分為 ${c + floor}。`
        );
        continue;
      }
      if (mode === 2) {
        const k = randInt(3, 9);
        const n = k * k - 1;
        const lower = 2 * k - 1;
        questions.push(
          `設 \\(a=\\frac{1}{${k}-\\sqrt{${n}}}\\)，判定 \\(a\\) 是否在整數 ${lower} 和 ${lower + 1} 之間。`
        );
        answers.push(
          `簡答：是，\\(${lower}<a<${lower + 1}\\)。過程：有理化得 \\(a=\\frac{${k}+\\sqrt{${n}}}{${k * k}-${n}}=${k}+\\sqrt{${n}}\\)。因 \\(${k - 1}<\\sqrt{${n}}<${k}\\)，所以 \\(${lower}<a<${lower + 1}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const n = nonSquares[randInt(0, nonSquares.length - 1)];
        const c = randInt(2, 7);
        const floor = Math.floor(Math.sqrt(n));
        const correct = c + floor;
        const inner = simplifyRadical(c * c * n);
        const expr = `\\sqrt{${c * c + n}+${2 * inner.outside}\\sqrt{${inner.inside}}}`;
        const options = shuffle([
          `\\(${correct - 1}\\sim${correct}\\)`,
          `\\(${correct}\\sim${correct + 1}\\)`,
          `\\(${correct + 1}\\sim${correct + 2}\\)`,
        ]);
        questions.push(
          `設 \\(a=${expr}\\)，判斷 \\(a\\) 落在下列哪個區間：${options.map((op, idx) => `(${String.fromCharCode(65 + idx)}) ${op}`).join(' ')}。`
        );
        answers.push(
          `簡答：${options.indexOf(`\\(${correct}\\sim${correct + 1}\\)`) >= 0 ? String.fromCharCode(65 + options.indexOf(`\\(${correct}\\sim${correct + 1}\\)`)) : ''}。過程：\\(${expr}=${c}+\\sqrt{${n}}\\)，且 \\(${floor}<\\sqrt{${n}}<${floor + 1}\\)，故 \\(${correct}<a<${correct + 1}\\)。`
        );
        continue;
      }
      const n = nonSquares[randInt(0, nonSquares.length - 1)];
      const c = randInt(5, 11);
      const floor = Math.floor(Math.sqrt(n));
      const ceil = floor + 1;
      const integerPart = c - ceil;
      questions.push(`求 \\(${c}-\\sqrt{${n}}\\) 的整數部分。`);
      answers.push(
        `簡答：${integerPart}。過程：因 \\(${floor}<\\sqrt{${n}}<${ceil}\\)，所以 \\(${c - ceil}<${c}-\\sqrt{${n}}<${c - floor}\\)。因此整數部分為 ${integerPart}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS111RadicalDistanceIntegerCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const makeCase = () => {
      for (let attempt = 0; attempt < 100; attempt += 1) {
        const a = randInt(20, 180);
        const b = randInt(10, 100);
        if (Number.isInteger(Math.sqrt(a)) || Number.isInteger(Math.sqrt(b)) || a === b) continue;
        const near = randInt(3, 7);
        const far = randInt(1, Math.min(4, near - 1));
        const nearCenter = Math.sqrt(a);
        const farCenter = Math.sqrt(b);
        const candidates = [];
        for (let x = -20; x <= 30; x += 1) {
          if (Math.abs(x - nearCenter) < near && Math.abs(x - farCenter) > far) candidates.push(x);
        }
        if (candidates.length > 0 && candidates.length < 20) return { a, near, b, far };
      }
      return { a: 101, near: 5, b: 38, far: 3 };
    };
    for (let i = 0; i < count; i += 1) {
      const item = makeCase();
      const nearCenter = Math.sqrt(item.a);
      const farCenter = Math.sqrt(item.b);
      const candidates = [];
      for (let x = -20; x <= 30; x += 1) {
        if (Math.abs(x - nearCenter) < item.near && Math.abs(x - farCenter) > item.far) {
          candidates.push(x);
        }
      }
      const nearLeft = trimFixed(nearCenter - item.near, 3);
      const nearRight = trimFixed(nearCenter + item.near, 3);
      const farLeft = trimFixed(farCenter - item.far, 3);
      const farRight = trimFixed(farCenter + item.far, 3);
      questions.push(
        `數線上有多少個整數點與 \\(\\sqrt{${item.a}}\\) 的距離小於 ${item.near}，但與 \\(\\sqrt{${item.b}}\\) 的距離大於 ${item.far}？`
      );
      answers.push(
        `簡答：${candidates.length} 個。過程：第一個條件給出 \\(${nearLeft}<x<${nearRight}\\)，第二個條件要排除 \\(${farLeft}\\leq x\\leq ${farRight}\\)。符合的整數為 ${candidates.join('、')}，共有 ${candidates.length} 個。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS111TelescopingRationalizationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const end = randInt(3, 5);
        const terms = [];
        for (let k = 1; k < end; k += 1) {
          terms.push(`\\frac{1}{${formatS111RootOrInteger(k)}+${formatS111RootOrInteger(k + 1)}}`);
        }
        questions.push(`求 \\(${terms.join('+')}\\) 之值。`);
        answers.push(
          `簡答：\\(${formatS111RootDifference(end, 1)}\\)。過程：每一項有理化，\\(\\frac{1}{${formatS111RootOrInteger(1)}+${formatS111RootOrInteger(2)}}=${formatS111RootOrInteger(2)}-${formatS111RootOrInteger(1)}\\)，依此類推會連鎖消去，所以總和為 \\(${formatS111RootDifference(end, 1)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const start = randInt(2, 5);
        const end = start + randInt(4, 7);
        questions.push(
          `求 \\(\\frac{1}{${formatS111RootOrInteger(start)}+${formatS111RootOrInteger(start + 1)}}+\\frac{1}{${formatS111RootOrInteger(start + 1)}+${formatS111RootOrInteger(start + 2)}}+\\cdots+\\frac{1}{${formatS111RootOrInteger(end - 1)}+${formatS111RootOrInteger(end)}}\\) 之值。`
        );
        answers.push(
          `簡答：\\(${formatS111RootDifference(end, start)}\\)。過程：\\(\\frac{1}{\\sqrt{k}+\\sqrt{k+1}}=\\sqrt{k+1}-\\sqrt{k}\\)。各項相加後中間根式全部消去，只剩 \\(${formatS111RootDifference(end, start)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        let r = [2, 3, 5, 6, 7][randInt(0, 4)];
        let start = randInt(1, 3);
        let end = start + randInt(3, 5);
        let firstA = start * start + r;
        let firstB = (start + 1) * (start + 1) + r;
        let lastA = (end - 1) * (end - 1) + r;
        let lastB = end * end + r;
        while ([firstA, firstB, lastA, lastB].some(isPerfectSquare)) {
          r = [2, 3, 5, 6, 7][randInt(0, 4)];
          start = randInt(1, 3);
          end = start + randInt(3, 5);
          firstA = start * start + r;
          firstB = (start + 1) * (start + 1) + r;
          lastA = (end - 1) * (end - 1) + r;
          lastB = end * end + r;
        }
        questions.push(
          `求 \\(\\frac{${2 * start + 1}}{${formatS111RootOrInteger(firstA)}+${formatS111RootOrInteger(firstB)}}+\\frac{${2 * (start + 1) + 1}}{${formatS111RootOrInteger((start + 1) * (start + 1) + r)}+${formatS111RootOrInteger((start + 2) * (start + 2) + r)}}+\\cdots+\\frac{${2 * end - 1}}{${formatS111RootOrInteger(lastA)}+${formatS111RootOrInteger(lastB)}}\\) 之值。`
        );
        answers.push(
          `簡答：\\(${formatS111RootDifference(lastB, firstA)}\\)。過程：因 \\(((k+1)^2+${r})-(k^2+${r})=2k+1\\)，所以 \\(\\frac{2k+1}{\\sqrt{k^2+${r}}+\\sqrt{(k+1)^2+${r}}}=\\sqrt{(k+1)^2+${r}}-\\sqrt{k^2+${r}}\\)。連鎖消去後剩 \\(${formatS111RootDifference(lastB, firstA)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const start = randInt(2, 6);
        const step = randInt(2, 5);
        const terms = randInt(3, 5);
        const end = start + step * terms;
        questions.push(
          `求 \\(\\frac{${step}}{${formatS111RootOrInteger(start)}+${formatS111RootOrInteger(start + step)}}+\\frac{${step}}{${formatS111RootOrInteger(start + step)}+${formatS111RootOrInteger(start + 2 * step)}}+\\cdots+\\frac{${step}}{${formatS111RootOrInteger(end - step)}+${formatS111RootOrInteger(end)}}\\) 之值。`
        );
        answers.push(
          `簡答：\\(${formatS111RootDifference(end, start)}\\)。過程：\\(\\frac{${step}}{\\sqrt{k}+\\sqrt{k+${step}}}=\\sqrt{k+${step}}-\\sqrt{k}\\)。相鄰項會消去，所以總和為 \\(${formatS111RootDifference(end, start)}\\)。`
        );
        continue;
      }
      const n = randInt(4, 9);
      questions.push(
        `化簡 \\(\\frac{1}{\\sqrt{x}+\\sqrt{x+1}}+\\frac{1}{\\sqrt{x+1}+\\sqrt{x+2}}+\\cdots+\\frac{1}{\\sqrt{x+${n - 1}}+\\sqrt{x+${n}}}\\)。`
      );
      answers.push(
        `簡答：\\(\\sqrt{x+${n}}-\\sqrt{x}\\)。過程：每一項有理化後 \\(\\frac{1}{\\sqrt{x+k}+\\sqrt{x+k+1}}=\\sqrt{x+k+1}-\\sqrt{x+k}\\)。連續相加後中間項消去，剩 \\(\\sqrt{x+${n}}-\\sqrt{x}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function formatS112Linear(coeff, constant, variable = 'x') {
    return formatFunctionLinear(coeff, constant).replaceAll('x', variable);
  }

  function formatS112NegatedLinear(coeff, constant, variable = 'x') {
    return formatS112Linear(-coeff, -constant, variable);
  }

  function formatS112AbsLinear(coeff, constant, variable = 'x') {
    return `|${formatS112Linear(coeff, constant, variable)}|`;
  }

  function formatS112DistanceTerm(point, variable = 'x') {
    return point >= 0 ? `|${variable}-${point}|` : `|${variable}+${Math.abs(point)}|`;
  }

  function formatS112ClosedInterval(left, right) {
    return `\\(${left}\\leq x\\leq ${right}\\)`;
  }

  function formatS112OpenInterval(left, right) {
    return `\\(${left}<x<${right}\\)`;
  }

  function formatS112Outside(left, right, inclusive = false) {
    const op = inclusive ? '\\leq' : '<';
    const op2 = inclusive ? '\\geq' : '>';
    return `\\(x${op}${left}\\) 或 \\(x${op2}${right}\\)`;
  }

  function countIntegersInClosedInterval(left, right) {
    return Math.max(0, Math.floor(right) - Math.ceil(left) + 1);
  }

  function buildS112AbsInequalityBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const a = randInt(2, 5);
      const center = randInt(-5, 6);
      const radius = randInt(2, 8);
      const constant = -a * center;
      const bound = a * radius;
      const expr = formatS112AbsLinear(a, constant);
      if (mode === 0) {
        questions.push(`解不等式 \\(${expr}\\leq ${bound}\\)。`);
        answers.push(
          `簡答：${formatS112ClosedInterval(center - radius, center + radius)}。過程：\\(${expr}\\leq ${bound}\\) 等價於 \\(-${bound}\\leq ${formatS112Linear(a, constant)}\\leq ${bound}\\)。同除以 ${a} 後得 ${formatS112ClosedInterval(center - radius, center + radius)}。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`解不等式 \\(${expr}\\geq ${bound}\\)。`);
        answers.push(
          `簡答：${formatS112Outside(center - radius, center + radius, true)}。過程：\\(|u|\\geq ${bound}\\) 等價於 \\(u\\leq -${bound}\\) 或 \\(u\\geq ${bound}\\)。令 \\(u=${formatS112Linear(a, constant)}\\)，解得 ${formatS112Outside(center - radius, center + radius, true)}。`
        );
        continue;
      }
      if (mode === 2) {
        const inner = randInt(1, radius - 1);
        questions.push(`解不等式 \\(${a * inner}<${expr}\\leq ${bound}\\)。`);
        answers.push(
          `簡答：\\(${center - radius}\\leq x<${center - inner}\\) 或 \\(${center + inner}<x\\leq ${center + radius}\\)。過程：先解 \\(|${formatS112Linear(a, constant)}|\\leq ${bound}\\)，得 ${formatS112ClosedInterval(center - radius, center + radius)}；再排除 \\(|${formatS112Linear(a, constant)}|\\leq ${a * inner}\\)，即排除 \\(${center - inner}\\leq x\\leq ${center + inner}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const left = center - radius;
        const right = center + radius;
        questions.push(`解不等式 \\(${a}<${formatS112AbsLinear(a, constant)}\\leq ${bound}\\)。`);
        const inner = 1;
        answers.push(
          `簡答：\\(${left}\\leq x<${center - inner}\\) 或 \\(${center + inner}<x\\leq ${right}\\)。過程：\\(${formatS112AbsLinear(a, constant)}>${a}\\) 表示 \\(x<${center - inner}\\) 或 \\(x>${center + inner}\\)，再與 \\(${formatS112AbsLinear(a, constant)}\\leq${bound}\\) 的解集 ${formatS112ClosedInterval(left, right)} 取交集。`
        );
        continue;
      }
      questions.push(`解不等式 \\(${expr}<${bound}\\)，並求其整數解個數。`);
      const left = center - radius;
      const right = center + radius;
      const integerCount = countIntegersInClosedInterval(left + 1, right - 1);
      answers.push(
        `簡答：${formatS112OpenInterval(left, right)}，整數解 ${integerCount} 個。過程：\\(${expr}<${bound}\\) 等價於 \\(-${bound}<${formatS112Linear(a, constant)}<${bound}\\)，解得 ${formatS112OpenInterval(left, right)}。其中整數為 ${Math.ceil(left + 1)} 到 ${Math.floor(right - 1)}，共 ${integerCount} 個。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function solveAbsLinearEquality(a, b, c, d) {
    const candidates = [];
    if (a !== c) candidates.push(makeFraction(d - b, a - c));
    if (a !== -c) candidates.push(makeFraction(-d - b, a + c));
    const unique = [];
    candidates.forEach((value) => {
      if (!unique.some((item) => item.num === value.num && item.den === value.den)) unique.push(value);
    });
    unique.sort((left, right) => left.num / left.den - right.num / right.den);
    return unique;
  }

  function buildS112AbsLinearEquationCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const makeCase = () => {
      for (let attempt = 0; attempt < 100; attempt += 1) {
        const item = {
          a: pickNonZero(-5, 5),
          b: randInt(-12, 12),
          c: pickNonZero(-5, 5),
          d: randInt(-12, 12),
        };
        const solutions = solveAbsLinearEquality(item.a, item.b, item.c, item.d);
        if (solutions.length > 0 && solutions.length <= 2) return item;
      }
      return { a: 2, b: -1, c: 1, d: 3 };
    };
    for (let i = 0; i < count; i += 1) {
      const item = makeCase();
      const solutions = solveAbsLinearEquality(item.a, item.b, item.c, item.d);
      const solutionText = solutions.map((value) => `\\(${formatFraction(value.num, value.den)}\\)`).join('、');
      questions.push(
        `解方程式 \\(|${formatS112Linear(item.a, item.b)}|=|${formatS112Linear(item.c, item.d)}|\\)，並寫出共有幾個實數解。`
      );
      answers.push(
        `簡答：\\(x=${solutions.map((value) => formatFraction(value.num, value.den)).join('\\) 或 \\(x=')}\\)，共 ${solutions.length} 個。過程：\\(|A|=|B|\\) 等價於 \\(A=B\\) 或 \\(A=-B\\)。分別解 \\(${formatS112Linear(item.a, item.b)}=${formatS112Linear(item.c, item.d)}\\) 與 \\(${formatS112Linear(item.a, item.b)}=${formatS112NegatedLinear(item.c, item.d)}\\)，得 ${solutionText}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS112AbsReverseParameterSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const center = randInt(-4, 6);
      const radius = randInt(2, 7);
      const left = center - radius;
      const right = center + radius;
      if (mode === 0) {
        questions.push(
          `已知不等式 \\(|x-a|\\leq b\\) 之解為 ${formatS112ClosedInterval(left, right)}，求數對 \\((a,b)\\)。`
        );
        answers.push(
          `簡答：\\((a,b)=(${center},${radius})\\)。過程：\\(|x-a|\\leq b\\) 的解集中心是 \\(a\\)，半徑是 \\(b\\)。由端點平均得 \\(a=\\frac{${left}${formatSignedNumber(right)}}{2}=${center}\\)，區間長為 ${right - left}，所以 \\(b=${radius}\\)。`
        );
        continue;
      }
      const m = randInt(2, 5);
      const constant = -m * center;
      const bound = m * radius;
      if (mode === 1) {
        questions.push(
          `已知不等式 \\(|ax${constant < 0 ? constant : `+${constant}`}|\\leq ${bound}\\) 之解為 ${formatS112ClosedInterval(left, right)}，且 \\(a>0\\)，求 \\(a\\)。`
        );
        const centerATerm = center === -1 ? '-a' : center === 1 ? 'a' : `${center}a`;
        answers.push(
          `簡答：\\(a=${m}\\)。過程：解集中心為 ${center}，所以 \\(ax${constant < 0 ? constant : `+${constant}`}=0\\) 的解為 \\(x=${center}\\)。代入得 \\(${centerATerm}${constant < 0 ? constant : `+${constant}`}=0\\)，故 \\(a=${m}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const localCenter = -3 + radius;
        const localConstant = -m * localCenter;
        const localB = m * radius;
        questions.push(
          `已知 \\(|${m}x${localConstant < 0 ? localConstant : `+${localConstant}`}|\\leq b\\) 的解為 \\(-3\\leq x\\leq ${-3 + 2 * radius}\\)，求 \\(b\\)。`
        );
        answers.push(
          `簡答：\\(b=${localB}\\)。過程：此解集半徑為 ${radius}。\\(|${m}x${localConstant < 0 ? localConstant : `+${localConstant}`}|\\leq b\\) 中，\\(x\\) 的半徑會是 \\(\\frac{b}{${m}}\\)，所以 \\(\\frac{b}{${m}}=${radius}\\)，得 \\(b=${localB}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(
          `若 \\(x>${right}\\) 或 \\(x<${left}\\) 為不等式 \\(|ax+1|>b\\) 的解，且 \\(a>0\\)，求 \\(a,b\\)。`
        );
        const a = 2;
        const c = -a * center;
        const b = a * radius;
        questions[questions.length - 1] =
          `若 \\(x>${right}\\) 或 \\(x<${left}\\) 為不等式 \\(|${a}x${c < 0 ? c : `+${c}`}|>b\\) 的解，求 \\(b\\)。`;
        answers.push(
          `簡答：\\(b=${b}\\)。過程：外側解表示中心為 ${center}、半徑為 ${radius}。\\(|${a}x${c < 0 ? c : `+${c}`}|>b\\) 的半徑為 \\(\\frac{b}{${a}}\\)，所以 \\(b=${a}\\cdot${radius}=${b}\\)。`
        );
        continue;
      }
      questions.push(
        `已知 \\(|${m}x${constant < 0 ? constant : `+${constant}`}|<b\\) 的解為 ${formatS112OpenInterval(left, right)}，求 \\(b\\)。`
      );
      answers.push(
        `簡答：\\(b=${bound}\\)。過程：解集半徑為 ${radius}，而 \\(|${m}x${constant < 0 ? constant : `+${constant}`}|<b\\) 的半徑為 \\(\\frac{b}{${m}}\\)，故 \\(b=${m}\\cdot${radius}=${bound}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS112AbsSumMinimumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const a = randInt(-8, 0);
      const b = a + randInt(3, 7);
      const c = b + randInt(3, 7);
      if (mode === 0) {
        const min = b - a + (c - b);
        questions.push(
          `對任意實數 \\(x\\)，求 \\(${formatS112DistanceTerm(a)}+${formatS112DistanceTerm(b)}+${formatS112DistanceTerm(c)}\\) 的最小值。`
        );
        answers.push(
          `簡答：\\(${min}\\)。過程：三個點的距離和在中位數 \\(x=${b}\\) 時最小，最小值為距離 \\(${b - a}+0+${c - b}=${min}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const k = c - a;
        questions.push(
          `設 \\(x\\) 為實數，求使 \\(${formatS112DistanceTerm(a)}+${formatS112DistanceTerm(c)}=k\\) 有解的最小整數 \\(k\\)。`
        );
        answers.push(
          `簡答：${k}。過程：\\(${formatS112DistanceTerm(a)}+${formatS112DistanceTerm(c)}\\) 表示 \\(x\\) 到 ${a} 與 ${c} 的距離和，最小值是兩點距離 ${c - a}，所以最小整數 \\(k=${k}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const start = randInt(-3, 2);
        const end = start + randInt(5, 8);
        const minStart = Math.floor((start + end) / 2);
        const minEnd = Math.ceil((start + end) / 2);
        let min = 0;
        for (let t = start; t <= end; t += 1) min += Math.abs(minStart - t);
        questions.push(
          `求函數 \\(f(x)=${formatS112DistanceTerm(start)}+${formatS112DistanceTerm(start + 1)}+\\cdots+${formatS112DistanceTerm(end)}\\) 取到最小值的範圍，並求最小值 \\(k\\)。`
        );
        answers.push(
          `簡答：最小範圍 ${formatS112ClosedInterval(minStart, minEnd)}，\\(k=${min}\\)。過程：多個距離和在資料的中位數位置最小；若項數為偶數，最小範圍是中間兩點之間。代入 \\(x=${minStart}\\) 得最小值 ${min}。`
        );
        continue;
      }
      if (mode === 3) {
        const p = randInt(-5, 3);
        const q = p + randInt(4, 9);
        const distance = q - p;
        const k = distance + 2 * randInt(1, 4);
        const left = p - (k - distance) / 2;
        const right = q + (k - distance) / 2;
        questions.push(`解方程式 \\(${formatS112DistanceTerm(p)}+${formatS112DistanceTerm(q)}=${k}\\)。`);
        answers.push(
          `簡答：\\(x=${left}\\) 或 \\(x=${right}\\)。過程：兩點距離為 ${distance}。當距離和大於 ${distance} 時，解在兩端外側，超出的 ${k - distance} 會平均分到兩側，所以 \\(x=${left}\\) 或 \\(x=${right}\\)。`
        );
        continue;
      }
      const p = randInt(-6, 2);
      const q = p + randInt(4, 9);
      questions.push(
        `求 \\(${formatS112DistanceTerm(p)}+${formatS112DistanceTerm(q)}\\) 的最小值，並說明在哪些 \\(x\\) 取到。`
      );
      answers.push(
        `簡答：最小值 ${q - p}，在 ${formatS112ClosedInterval(p, q)} 取到。過程：\\(x\\) 在兩點 ${p}, ${q} 之間時，兩段距離和恰為兩點距離 ${q - p}；在外側會更大。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS112AbsNumberLineRangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const a = randInt(-8, -1);
      const b = randInt(2, 10);
      const distance = b - a;
      if (mode === 0) {
        const extra = 2 * randInt(1, 5);
        const bound = distance + extra;
        const left = a - extra / 2;
        const right = b + extra / 2;
        const countInts = countIntegersInClosedInterval(left, right);
        questions.push(
          `求滿足 \\(${formatS112DistanceTerm(a)}+${formatS112DistanceTerm(b)}\\leq ${bound}\\) 的整數 \\(x\\) 共有幾個。`
        );
        answers.push(
          `簡答：${countInts} 個。過程：兩定點距離為 ${distance}，允許的總距離為 ${bound}，多出的 ${extra} 平均分到左右兩側，所以解集為 ${formatS112ClosedInterval(left, right)}，整數共有 ${countInts} 個。`
        );
        continue;
      }
      if (mode === 1) {
        const p = randInt(-7, -2);
        const q = randInt(1, 7);
        const r = q + randInt(3, 7);
        const min = q - p + (r - q);
        questions.push(
          `對任意實數 \\(x\\)，求 \\(${formatS112DistanceTerm(p)}+${formatS112DistanceTerm(q)}+${formatS112DistanceTerm(r)}\\) 的最小值。`
        );
        answers.push(
          `簡答：${min}。過程：三個距離和在中間點 \\(x=${q}\\) 最小，最小值為距離 \\(${q - p}+0+${r - q}=${min}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(
          `求使 \\(${formatS112DistanceTerm(a)}+${formatS112DistanceTerm(b)}=k\\) 有解的最小整數 \\(k\\)。`
        );
        answers.push(
          `簡答：${distance}。過程：兩點距離和最小就是兩點間距離，當 \\(x\\) 在線段 \\([${a},${b}]\\) 上時取到，因此最小整數 \\(k=${distance}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const p = randInt(-6, -1);
        const q = randInt(3, 9);
        const min = q - p;
        questions.push(
          `對任意實數 \\(x\\)，求 \\(${formatS112DistanceTerm(p)}+${formatS112DistanceTerm(q)}\\) 的最小值與取到最小值的範圍。`
        );
        answers.push(
          `簡答：最小值 ${min}，範圍 ${formatS112ClosedInterval(p, q)}。過程：\\(x\\) 在 ${p} 與 ${q} 之間時，到兩端點的距離和等於兩點距離 ${min}；若在外側，距離和會變大。`
        );
        continue;
      }
      const extra = 2 * randInt(1, 4);
      const total = distance + extra;
      const left = a - extra / 2;
      const right = b + extra / 2;
      questions.push(
        `數線上有 \\(A(${a}),B(${b})\\)，點 \\(P(x)\\) 滿足 \\(${formatS112DistanceTerm(a)}+${formatS112DistanceTerm(b)}=${total}\\)，求 \\(x\\) 的可能值。`
      );
      answers.push(
        `簡答：\\(x=${left}\\) 或 \\(x=${right}\\)。過程：\\(${formatS112DistanceTerm(a)}+${formatS112DistanceTerm(b)}\\) 是 \\(P\\) 到兩端點的距離和，線段長為 ${distance}。總距離多出 ${extra}，平均分到線段外兩端，所以 \\(x=${left}\\) 或 \\(x=${right}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS112AbsRangeSimplificationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const left = randInt(2, 5);
        const right = left + randInt(3, 6);
        questions.push(`已知 \\(${left}\\leq x\\leq ${right}\\)，化簡 \\(|x-${left - 1}|-|x-${right + 2}|+|x|\\)。`);
        const constant = -(left + right + 1);
        const simplified = formatS112Linear(3, constant);
        answers.push(
          `簡答：\\(${simplified}\\)。過程：在此範圍內，\\(x-${left - 1}\\geq0\\)、\\(x-${right + 2}\\leq0\\)、\\(x>0\\)。所以原式 \\(=(x-${left - 1})-(${right + 2}-x)+x=${simplified}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const xLow = randInt(2, 4);
        const xHigh = xLow + randInt(3, 5);
        const yLow = randInt(-7, -5);
        const yHigh = randInt(-3, -1);
        const c1 = xHigh + yHigh + 2;
        const c2 = xLow - yHigh - 1;
        questions.push(
          `已知 \\(${xLow}<x<${xHigh}\\) 且 \\(${yLow}<y<${yHigh}\\)，化簡 \\(|x+y-${c1}|-|x-y-${c2}|\\)。`
        );
        answers.push(
          `簡答：\\(${-2}x+${c1 + c2}\\)。過程：由範圍可知 \\(x+y-${c1}<0\\)，且 \\(x-y-${c2}>0\\)。所以原式 \\(=${c1}-x-y-(x-y-${c2})=-2x+${c1 + c2}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        // √(a²x²+b²/x²+2ab) - √(a²x²+b²/x²-2ab) = |ax+b/x| - |ax-b/x| = 2ax (當 0<x<t，b=a·t²)
        const a = randInt(1, 3);
        const t = randInt(1, 3);
        const v = ['x', 't', 'y'][randInt(0, 2)];
        const b = a * t * t;
        const A = a * a;
        const B = b * b;
        const M = 2 * a * b;
        const axText = a === 1 ? v : `${a}${v}`;
        const bxText = `\\frac{${b}}{${v}}`;
        const A2 = A === 1 ? `${v}^2` : `${A}${v}^2`;
        questions.push(
          `設 \\(0<${v}<${t}\\)，化簡 \\(\\sqrt{${A2}+\\frac{${B}}{${v}^2}+${M}}-\\sqrt{${A2}+\\frac{${B}}{${v}^2}-${M}}\\)。`
        );
        answers.push(
          `簡答：\\(${2 * a}${v}\\)。過程：第一個根號為 \\(\\sqrt{(${axText}+${bxText})^2}=${axText}+${bxText}\\)；因 \\(0<${v}<${t}\\) 使 \\(${axText}<${bxText}\\)，第二個為 \\(\\sqrt{(${bxText}-${axText})^2}=${bxText}-${axText}\\)。相減得 \\(${2 * a}${v}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        // |linear(p)| - √(quad(q))，p,q 為「恰一個負號」的符號組合
        const pats = [
          [1, 1, -1],
          [1, -1, 1],
          [-1, 1, 1],
        ];
        const pi = randInt(0, 2);
        let qi = randInt(0, 2);
        while (qi === pi) qi = randInt(0, 2);
        const p = pats[pi];
        const q = pats[qi];
        const nameSets = [
          ['a', 'b', 'c'],
          ['p', 'q', 'r'],
          ['x', 'y', 'z'],
          ['u', 'v', 'w'],
        ];
        const names = nameSets[randInt(0, nameSets.length - 1)];
        const lin = (s) => names.map((n, idx) => (s[idx] > 0 ? (idx === 0 ? n : `+${n}`) : `-${n}`)).join('');
        const quad = (s) => {
          const pairs = [
            [s[0] * s[1], `${names[0]}${names[1]}`],
            [s[1] * s[2], `${names[1]}${names[2]}`],
            [s[2] * s[0], `${names[2]}${names[0]}`],
          ];
          const sq = names.map((n) => `${n}^2`).join('+');
          return `${sq}${pairs.map(([sg, nm]) => `${sg > 0 ? '+' : '-'}2${nm}`).join('')}`;
        };
        const diff = [0, 1, 2].map((idx) => p[idx] - q[idx]);
        const diffText =
          diff
            .map((d, idx) => {
              if (d === 0) return '';
              const mag = Math.abs(d) === 1 ? '' : `${Math.abs(d)}`;
              return `${d > 0 ? '+' : '-'}${mag}${names[idx]}`;
            })
            .join('')
            .replace(/^\+/, '') || '0';
        questions.push(`設三角形三邊長為 \\(${names.join(',')}\\)，化簡 \\(|${lin(p)}|-\\sqrt{${quad(q)}}\\)。`);
        answers.push(
          `簡答：\\(${diffText}\\)。過程：根號內 \\(${quad(q)}=(${lin(q)})^2\\)。由三角形兩邊和大於第三邊，\\(${lin(p)}>0\\) 且 \\(${lin(q)}>0\\)，所以原式 \\(=(${lin(p)})-(${lin(q)})=${diffText}\\)。`
        );
        continue;
      }
      // √(a²+2ka+k²)-√(a²-2ka+k²) = |a+k|-|a-k| = 2k（當 a>k>0）
      const kv = randInt(1, 15);
      questions.push(
        `設 \\(a>${kv}\\)，化簡 \\(\\sqrt{a^2+${2 * kv}a+${kv * kv}}-\\sqrt{a^2-${2 * kv}a+${kv * kv}}\\)。`
      );
      answers.push(
        `簡答：${2 * kv}。過程：\\(\\sqrt{a^2+${2 * kv}a+${kv * kv}}=|a+${kv}|=a+${kv}\\)，\\(\\sqrt{a^2-${2 * kv}a+${kv * kv}}=|a-${kv}|=a-${kv}\\)。因 \\(a>${kv}\\)，相減得 ${2 * kv}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS112AbsQuadraticMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const u = randInt(2, 12);
        const c = u * u + u;
        questions.push(`解方程式 \\(x^2+|x|-${c}=0\\)。`);
        answers.push(
          `簡答：\\(x=\\pm${u}\\)。過程：令 \\(t=|x|\\geq0\\)，則 \\(x^2=t^2\\)，原式成為 \\(t^2+t-${c}=0\\)，解得 \\(t=${u}\\)，故 \\(x=\\pm${u}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const u = randInt(3, 8);
        let sum = randInt(8, 15);
        while (sum - u <= 0 || sum - u === u) sum = randInt(8, 15);
        const prod = u * (sum - u);
        questions.push(`解方程式 \\(x^2-${sum}|x|+${prod}=0\\)。`);
        answers.push(
          `簡答：\\(x=\\pm${u}\\) 或 \\(x=\\pm${sum - u}\\)。過程：令 \\(t=|x|\\geq0\\)，得 \\(t^2-${sum}t+${prod}=0\\)，解出 \\(t=${u}\\) 或 \\(t=${sum - u}\\)，因此 \\(x\\) 為正負兩組。`
        );
        continue;
      }
      if (mode === 2) {
        const r1 = randInt(1, 4);
        const r2 = r1 + randInt(2, 5);
        const k = r1 * r2;
        questions.push(`解方程式 \\(|x^2-${r1 + r2}x+${k}|=0\\)。`);
        answers.push(
          `簡答：\\(x=${r1}\\) 或 \\(x=${r2}\\)。過程：絕對值等於 0 表示內部為 0，故解 \\(x^2-${r1 + r2}x+${k}=0\\)，因式分解得 \\((x-${r1})(x-${r2})=0\\)。`
        );
        continue;
      }
      if (mode === 3) {
        // p√(k²-2ak+a²)+q√(k²+2bk+b²) = p(k-a)+q(k+b)（k>a）
        const p = randInt(2, 6);
        const q = randInt(2, 6);
        const a = randInt(1, 5);
        const b = randInt(1, 5);
        const kCoef = p + q;
        const constTerm = q * b - p * a;
        const constText = constTerm === 0 ? '' : `${constTerm > 0 ? '+' : '-'}${Math.abs(constTerm)}`;
        questions.push(
          `化簡 \\(${p}\\sqrt{k^2-${2 * a}k+${a * a}}+${q}\\sqrt{k^2+${2 * b}k+${b * b}}\\)，其中 \\(k>${a}\\)。`
        );
        answers.push(
          `簡答：\\(${kCoef}k${constText}\\)。過程：\\(\\sqrt{k^2-${2 * a}k+${a * a}}=|k-${a}|=k-${a}\\)，\\(\\sqrt{k^2+${2 * b}k+${b * b}}=|k+${b}|=k+${b}\\)。所以原式 \\(=${p}(k-${a})+${q}(k+${b})=${kCoef}k${constText}\\)。`
        );
        continue;
      }
      const u = randInt(2, 12);
      const c = u * u - u;
      questions.push(`解方程式 \\(x^2-|x|-${c}=0\\)。`);
      answers.push(
        `簡答：\\(x=\\pm${u}\\)。過程：令 \\(t=|x|\\geq0\\)，則 \\(x^2=t^2\\)，得到 \\(t^2-t-${c}=0\\)。解得 \\(t=${u}\\) 或負根；因 \\(t\\geq0\\)，取 \\(t=${u}\\)，所以 \\(x=\\pm${u}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function formatS113MonoTerm(coeff, mono) {
    if (coeff === 0) return null;
    const abs = Math.abs(coeff);
    const body = mono ? `${abs === 1 ? '' : abs}${mono}` : `${abs}`;
    return coeff < 0 ? `-${body}` : body;
  }

  function joinS113Terms(terms) {
    const filtered = terms.filter(Boolean);
    if (!filtered.length) return '0';
    return filtered
      .map((term, index) => {
        if (index === 0) return term;
        return term.startsWith('-') ? `- ${term.slice(1)}` : `+ ${term}`;
      })
      .join(' ');
  }

  function formatS113RadicalTerm(coeff, radicand) {
    const simp = simplifyRadical(radicand);
    const totalCoeff = coeff * simp.outside;
    if (simp.inside === 1) return formatS113MonoTerm(totalCoeff, '');
    return formatS113MonoTerm(totalCoeff, `\\sqrt{${simp.inside}}`);
  }

  function formatS113BinomialTerm(coeff, mono) {
    return formatS113MonoTerm(coeff, mono);
  }

  function formatS113Binomial(a, monoA, b, monoB) {
    return joinS113Terms([formatS113BinomialTerm(a, monoA), formatS113BinomialTerm(b, monoB)]);
  }

  function buildS113BinomialCubeExpansionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const monoSets = [
      ['x', 'y', 'x^3', 'x^2y', 'xy^2', 'y^3'],
      ['a', 'b', 'a^3', 'a^2b', 'ab^2', 'b^3'],
      ['x^2', 'y', 'x^6', 'x^4y', 'x^2y^2', 'y^3'],
    ];
    for (let i = 0; i < count; i += 1) {
      if (i % 5 === 3) {
        const base = randInt(91, 109);
        const valueText = `${base / 10}`;
        const delta = base - 100;
        const result = (base * base * base) / 1000;
        questions.push(`利用公式計算 \\(${valueText}^3\\)。`);
        answers.push(
          `簡答：\\(${formatFraction(base * base * base, 1000)}\\)。過程：\\(${valueText}=10${delta >= 0 ? '+' : ''}${formatFraction(delta, 10)}\\)，利用 \\((a+b)^3=a^3+3a^2b+3ab^2+b^3\\) 展開計算，得 \\(${formatFraction(base * base * base, 1000)}\\)。`
        );
        continue;
      }
      const [monoA, monoB, m3, m21, m12, m03] = monoSets[i % monoSets.length];
      const a = pickNonZero(-5, 5);
      const b = pickNonZero(-5, 5);
      const inside = formatS113Binomial(a, monoA, b, monoB);
      const terms = [
        formatS113MonoTerm(a ** 3, m3),
        formatS113MonoTerm(3 * a * a * b, m21),
        formatS113MonoTerm(3 * a * b * b, m12),
        formatS113MonoTerm(b ** 3, m03),
      ];
      const expanded = joinS113Terms(terms);
      questions.push(`展開 \\((${inside})^3\\)。`);
      answers.push(
        `簡答：\\(${expanded}\\)。過程：套用 \\((A+B)^3=A^3+3A^2B+3AB^2+B^3\\)，令 \\(A=${formatS113MonoTerm(a, monoA)}\\)、\\(B=${formatS113MonoTerm(b, monoB)}\\)，整理得 \\(${expanded}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS113CubeSumDifferenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const s = randInt(3, 10);
        const p = randInt(1, Math.floor((s * s - 1) / 4));
        const value = s ** 3 - 3 * p * s;
        questions.push(`已知 \\(a+b=${s}\\)、\\(ab=${p}\\)，求 \\(a^3+b^3\\)。`);
        answers.push(`簡答：${value}。過程：\\(a^3+b^3=(a+b)^3-3ab(a+b)=${s}^3-3\\cdot${p}\\cdot${s}=${value}\\)。`);
        continue;
      }
      if (mode === 1) {
        const d = randInt(2, 8);
        const p = randInt(1, 9);
        const value = d ** 3 + 3 * p * d;
        questions.push(`已知 \\(a-b=${d}\\)、\\(ab=${p}\\)，求 \\(a^3-b^3\\)。`);
        answers.push(`簡答：${value}。過程：\\(a^3-b^3=(a-b)^3+3ab(a-b)=${d}^3+3\\cdot${p}\\cdot${d}=${value}\\)。`);
        continue;
      }
      if (mode === 2) {
        const s = randInt(3, 9);
        const p = randInt(1, Math.floor((s * s - 1) / 8));
        const value = s ** 3 - 6 * p * s;
        questions.push(`已知 \\(x+2y=${s}\\)、\\(xy=${p}\\)，求 \\(x^3+8y^3\\)。`);
        answers.push(
          `簡答：${value}。過程：把 \\(x^3+8y^3\\) 看成 \\(x^3+(2y)^3\\)。\\((x+2y)^3=x^3+8y^3+3\\cdot x\\cdot2y(x+2y)\\)，所以值為 \\(${s}^3-6\\cdot${p}\\cdot${s}=${value}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const d = randInt(3, 9);
        const p = randInt(1, 7);
        const value = d ** 3 + 6 * p * d;
        questions.push(`已知 \\(2x-y=${d}\\)、\\(xy=${p}\\)，求 \\(8x^3-y^3\\)。`);
        answers.push(
          `簡答：${value}。過程：\\(8x^3-y^3=(2x)^3-y^3\\)。利用 \\(A^3-B^3=(A-B)^3+3AB(A-B)\\)，得 \\(${d}^3+3\\cdot(2xy)\\cdot${d}=${value}\\)。`
        );
        continue;
      }
      const s = randInt(3, 15);
      const p = randInt(1, Math.floor((s * s - 1) / 4));
      const cubeSum = s ** 3 - 3 * p * s;
      const value = cubeSum * cubeSum - 2 * p ** 3;
      questions.push(`已知 \\(a+b=${s}\\)、\\(ab=${p}\\)，求 \\(a^6+b^6\\)。`);
      answers.push(
        `簡答：${value}。過程：先求 \\(a^3+b^3=${cubeSum}\\)。再用 \\(a^6+b^6=(a^3+b^3)^2-2a^3b^3\\)，得 \\(${cubeSum}^2-2\\cdot${p ** 3}=${value}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS113ReciprocalCubeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const s = randInt(3, 16);
      if (mode === 0) {
        const value = s ** 3 - 3 * s;
        questions.push(`已知 \\(x+\\frac{1}{x}=${s}\\)，求 \\(x^3+\\frac{1}{x^3}\\)。`);
        answers.push(
          `簡答：${value}。過程：\\((x+\\frac1x)^3=x^3+\\frac1{x^3}+3(x+\\frac1x)\\)，所以 \\(x^3+\\frac1{x^3}=${s}^3-3\\cdot${s}=${value}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const d = randInt(2, 12);
        const value = d ** 3 + 3 * d;
        questions.push(`已知 \\(x-\\frac{1}{x}=${d}\\)，求 \\(x^3-\\frac{1}{x^3}\\)。`);
        answers.push(
          `簡答：${value}。過程：\\((x-\\frac1x)^3=x^3-\\frac1{x^3}-3(x-\\frac1x)\\)，所以 \\(x^3-\\frac1{x^3}=${d}^3+3\\cdot${d}=${value}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const value = s ** 3 - 3 * s;
        questions.push(`已知 \\(x^2-${s}x+1=0\\)，求 \\(x^3+\\frac{1}{x^3}\\)。`);
        answers.push(
          `簡答：${value}。過程：兩邊除以 \\(x\\)，得 \\(x+\\frac1x=${s}\\)。因此 \\(x^3+\\frac1{x^3}=${s}^3-3\\cdot${s}=${value}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const value = s ** 3 - 3 * s;
        questions.push(`已知 \\(x^{\\frac12}+x^{-\\frac12}=${s}\\)，求 \\(x^{\\frac32}+x^{-\\frac32}\\)。`);
        answers.push(
          `簡答：${value}。過程：令 \\(t=\\sqrt{x}\\)，則題目成為已知 \\(t+\\frac1t=${s}\\)，求 \\(t^3+\\frac1{t^3}\\)，所以答案為 \\(${s}^3-3\\cdot${s}=${value}\\)。`
        );
        continue;
      }
      const n = randInt(2, 10);
      const sValue = 2 * n;
      const value = sValue ** 3 - 3 * sValue;
      questions.push(`已知 \\(x=${n}-\\sqrt{${n * n - 1}}\\)，求 \\(x^3+\\frac{1}{x^3}\\)。`);
      answers.push(
        `簡答：${value}。過程：\\(\\frac1x=${n}+\\sqrt{${n * n - 1}}\\)，所以 \\(x+\\frac1x=${sValue}\\)。因此 \\(x^3+\\frac1{x^3}=${sValue}^3-3\\cdot${sValue}=${value}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS113TernarySquareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 1) {
        const a = pickNonZero(-4, 4);
        const b = pickNonZero(-5, 5);
        const c = pickNonZero(-4, 4);
        const vars = mode === 0 ? ['a', 'b', 'c'] : ['x', 'y', 'z'];
        const inside = joinS113Terms([
          formatS113MonoTerm(a, vars[0]),
          formatS113MonoTerm(b, vars[1]),
          formatS113MonoTerm(c, vars[2]),
        ]);
        const expanded = joinS113Terms([
          formatS113MonoTerm(a * a, `${vars[0]}^2`),
          formatS113MonoTerm(b * b, `${vars[1]}^2`),
          formatS113MonoTerm(c * c, `${vars[2]}^2`),
          formatS113MonoTerm(2 * a * b, `${vars[0]}${vars[1]}`),
          formatS113MonoTerm(2 * a * c, `${vars[0]}${vars[2]}`),
          formatS113MonoTerm(2 * b * c, `${vars[1]}${vars[2]}`),
        ]);
        questions.push(`展開 \\((${inside})^2\\)。`);
        answers.push(
          `簡答：\\(${expanded}\\)。過程：使用 \\((A+B+C)^2=A^2+B^2+C^2+2AB+2AC+2BC\\)，代入並整理得 \\(${expanded}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const s = randInt(4, 10);
        const p = randInt(1, Math.floor((s * s - 1) / 3));
        const value = s * s - 2 * p;
        questions.push(`已知 \\(a+b+c=${s}\\)、\\(ab+bc+ca=${p}\\)，求 \\(a^2+b^2+c^2\\)。`);
        answers.push(
          `簡答：${value}。過程：\\((a+b+c)^2=a^2+b^2+c^2+2(ab+bc+ca)\\)，所以 \\(a^2+b^2+c^2=${s}^2-2\\cdot${p}=${value}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const root = randInt(5, 12);
        const squareSum = randInt(Math.ceil((root * root) / 3), root * root - 2);
        const pairSum = makeFraction(root * root - squareSum, 2);
        questions.push(
          `已知 \\(a^2+b^2+c^2=${squareSum}\\)、\\(ab+bc+ca=${formatFunctionFractionValue(pairSum)}\\)，求 \\(a+b+c\\) 的正值。`
        );
        answers.push(
          `簡答：${root}。過程：\\((a+b+c)^2=${squareSum}+2\\cdot${formatFunctionFractionValue(pairSum)}=${root * root}\\)，取正值得 \\(a+b+c=${root}\\)。`
        );
        continue;
      }
      const t = randInt(2, 6);
      questions.push(`展開 \\((x+y-${t})(x+y+${t})\\)。`);
      answers.push(
        `簡答：\\(x^2+2xy+y^2-${t * t}\\)。過程：視為 \\((x+y)^2-${t}^2\\)，故結果為 \\(x^2+2xy+y^2-${t * t}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // a³+b³+c³-3abc=(a+b+c)(a²+b²+c²-ab-bc-ca)，取 a=X, b=sy·Y, c=sz·Z
  function s113CubicNames() {
    const sets = [
      ['x', 'y', 'z'],
      ['a', 'b', 'c'],
      ['p', 'q', 'r'],
      ['u', 'v', 'w'],
    ];
    return sets[randInt(0, sets.length - 1)];
  }
  function s113CubicIdentity(V, sy, sz) {
    const [X, Y, Z] = V;
    const cube = `${X}^3${sy > 0 ? '+' : '-'}${Y}^3${sz > 0 ? '+' : '-'}${Z}^3${sy * sz > 0 ? '-' : '+'}3${X}${Y}${Z}`;
    const lin = `${X}${sy > 0 ? '+' : '-'}${Y}${sz > 0 ? '+' : '-'}${Z}`;
    const quad = `${X}^2+${Y}^2+${Z}^2${sy > 0 ? '-' : '+'}${X}${Y}${sy * sz > 0 ? '-' : '+'}${Y}${Z}${sz > 0 ? '-' : '+'}${Z}${X}`;
    return { cube, lin, quad, subY: `${sy > 0 ? '' : '-'}${Y}`, subZ: `${sz > 0 ? '' : '-'}${Z}` };
  }

  function buildS113TernaryCubicSpecialSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 1) {
        const aValue = randInt(1, 6);
        const bValue = randInt(1, 6);
        const cValue = randInt(1, 6);
        const s = aValue + bValue + cValue;
        const p = aValue * bValue + bValue * cValue + cValue * aValue;
        const r = aValue * bValue * cValue;
        const value = s ** 3 - 3 * s * p + 3 * r;
        questions.push(
          `已知 \\(a,b,c\\) 為正實數，且 \\(a+b+c=${s}\\)、\\(ab+bc+ca=${p}\\)、\\(abc=${r}\\)，求 \\(a^3+b^3+c^3\\)。`
        );
        answers.push(
          `簡答：${value}。過程：\\(a^3+b^3+c^3=(a+b+c)^3-3(a+b+c)(ab+bc+ca)+3abc\\)，代入得 \\(${s}^3-3\\cdot${s}\\cdot${p}+3\\cdot${r}=${value}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const aValue = pickNonZero(-4, 6);
        const bValue = pickNonZero(-4, 6);
        const cValue = pickNonZero(-4, 6);
        const s = aValue + bValue + cValue;
        const squareSum = aValue * aValue + bValue * bValue + cValue * cValue;
        const cubeSum = aValue ** 3 + bValue ** 3 + cValue ** 3;
        const pair = makeFraction(s * s - squareSum, 2);
        const abc = aValue * bValue * cValue;
        questions.push(
          `已知 \\(a,b,c\\) 為實數，且 \\(a+b+c=${s}\\)、\\(a^2+b^2+c^2=${squareSum}\\)、\\(a^3+b^3+c^3=${cubeSum}\\)，求 \\(abc\\)。`
        );
        answers.push(
          `簡答：\\(${abc}\\)。過程：先由 \\(ab+bc+ca=\\frac{${s * s}-${squareSum}}{2}=${formatFunctionFractionValue(pair)}\\)。再代入 \\(a^3+b^3+c^3=(a+b+c)^3-3(a+b+c)(ab+bc+ca)+3abc\\)，解得 \\(abc=${abc}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        // 以 a=x, b=sy·y, c=sz·z 套用 a³+b³+c³-3abc 的分解式
        const V = s113CubicNames();
        const parts = s113CubicIdentity(V, randInt(0, 1) === 0 ? 1 : -1, randInt(0, 1) === 0 ? 1 : -1);
        questions.push(`在 \\(${parts.lin}\\ne0\\) 下，化簡 \\(\\frac{${parts.cube}}{${parts.lin}}\\)。`);
        answers.push(
          `簡答：\\(${parts.quad}\\)。過程：令 \\(a=${V[0]},b=${parts.subY},c=${parts.subZ}\\)，由 \\(a^3+b^3+c^3-3abc=(a+b+c)(a^2+b^2+c^2-ab-bc-ca)\\) 得 \\(${parts.cube}=(${parts.lin})(${parts.quad})\\)，約去 \\(${parts.lin}\\) 即為答案。`
        );
        continue;
      }
      const V2 = s113CubicNames();
      const parts2 = s113CubicIdentity(V2, randInt(0, 1) === 0 ? 1 : -1, randInt(0, 1) === 0 ? 1 : -1);
      questions.push(`因式分解 \\(${parts2.cube}\\)。`);
      answers.push(
        `簡答：\\((${parts2.lin})(${parts2.quad})\\)。過程：令 \\(a=${V2[0]},b=${parts2.subY},c=${parts2.subZ}\\)，套用 \\(a^3+b^3+c^3-3abc=(a+b+c)(a^2+b^2+c^2-ab-bc-ca)\\)，即得結果。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS113RadicalTernaryOperationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const roots = [2, 3, 5, 6, 7, 10, 11];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 2) {
        const a = roots[randInt(0, roots.length - 1)];
        let b = roots[randInt(0, roots.length - 1)];
        let c = roots[randInt(0, roots.length - 1)];
        while (b === a) b = roots[randInt(0, roots.length - 1)];
        while (c === a || c === b) c = roots[randInt(0, roots.length - 1)];
        const signC = mode === 1 ? -1 : 1;
        const expr = `\\sqrt{${a}}+\\sqrt{${b}}${signC < 0 ? '-' : '+'}\\sqrt{${c}}`;
        const result = joinS113Terms([
          `${a + b + c}`,
          formatS113RadicalTerm(2, a * b),
          formatS113RadicalTerm(2 * signC, a * c),
          formatS113RadicalTerm(2 * signC, b * c),
        ]);
        questions.push(`計算 \\((${expr})^2\\)。`);
        const cross1 = formatS113RadicalTerm(2, a * b);
        const cross2 = formatS113RadicalTerm(2 * signC, a * c);
        const cross3 = formatS113RadicalTerm(2 * signC, b * c);
        answers.push(
          `簡答：\\(${result}\\)。過程：利用 \\((A+B+C)^2\\) 展開，平方項為 ${a}+${b}+${c}，交叉項依序為 \\(${cross1}\\)、\\(${cross2}\\)、\\(${cross3}\\)，整理得 \\(${result}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        // (√p+√q+√(pq))² = (p+q+pq) + 2q√p + 2p√q + 2√(pq)
        const pairs = [
          [2, 3],
          [2, 5],
          [3, 5],
          [2, 7],
          [3, 7],
          [5, 7],
          [2, 11],
          [3, 11],
        ];
        const [pp, qq] = pairs[randInt(0, pairs.length - 1)];
        const rr = pp * qq;
        const sq = pp + qq + rr;
        questions.push(`利用公式計算 \\((\\sqrt{${pp}}+\\sqrt{${qq}}+\\sqrt{${rr}})^2\\)。`);
        answers.push(
          `簡答：\\(${sq}+${2 * qq}\\sqrt{${pp}}+${2 * pp}\\sqrt{${qq}}+2\\sqrt{${rr}}\\)。過程：平方項為 \\(${pp}+${qq}+${rr}=${sq}\\)；交叉項為 \\(2\\sqrt{${pp}\\cdot${qq}}=2\\sqrt{${rr}}\\)、\\(2\\sqrt{${pp}\\cdot${rr}}=${2 * pp}\\sqrt{${qq}}\\)、\\(2\\sqrt{${qq}\\cdot${rr}}=${2 * qq}\\sqrt{${pp}}\\)，合併得 \\(${sq}+${2 * qq}\\sqrt{${pp}}+${2 * pp}\\sqrt{${qq}}+2\\sqrt{${rr}}\\)。`
        );
        continue;
      }
      const radical = [2, 3, 5, 7][randInt(0, 3)];
      const aVal = randInt(2, 6);
      const bVal = randInt(1, 5);
      questions.push(
        `已知 \\(a,b,c\\) 為有理數且 \\((a-b)+(a+b)\\sqrt{${radical}}=(${2 * aVal - bVal}-a)+(${aVal + 2 * bVal}-b)\\sqrt{${radical}}\\)，求 \\(a,b\\)。`
      );
      answers.push(
        `簡答：\\(a=${aVal},\\ b=${bVal}\\)。過程：比較有理部分得 \\(a-b=${2 * aVal - bVal}-a\\)，比較 \\(\\sqrt{${radical}}\\) 係數得 \\(a+b=${aVal + 2 * bVal}-b\\)，解得 \\(a=${aVal}, b=${bVal}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── s1-1-3 新增：三因式展開 ──────────────────────────────────────
  function buildS113TripleFactorExpansionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function termStr(c, power) {
      if (c === 0) return '';
      const sign = c > 0 ? '+' : '-';
      const abs = Math.abs(c);
      const numPart = abs === 1 && power > 0 ? '' : `${abs}`;
      const varPart = power === 0 ? '' : power === 1 ? 'x' : `x^{${power}}`;
      return `${sign}${numPart}${varPart}`;
    }

    function poly3(c2, c1, c0) {
      return `x^3${termStr(c2, 2)}${termStr(c1, 1)}${termStr(c0, 0)}`;
    }

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        // (x+a)(x+b)(x+c)，全為正根
        const a = randInt(1, 10);
        const b = randInt(1, 10);
        const c = randInt(1, 4);
        const C2 = a + b + c;
        const C1 = a * b + b * c + c * a;
        const C0 = a * b * c;
        questions.push(`展開 \\((x+${a})(x+${b})(x+${c})\\)。`);
        answers.push(
          `簡答：\\(${poly3(C2, C1, C0)}\\)。過程：先展開 \\((x+${a})(x+${b})=x^2+${a + b}x+${a * b}\\)，再乘以 \\((x+${c})\\)，整理得 \\(${poly3(C2, C1, C0)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        // (x-a)(x-b)(x-c)，全為負根
        const a = randInt(1, 4);
        const b = randInt(1, 4);
        const c = randInt(1, 4);
        const C2 = -(a + b + c);
        const C1 = a * b + b * c + c * a;
        const C0 = -(a * b * c);
        questions.push(`展開 \\((x-${a})(x-${b})(x-${c})\\)。`);
        answers.push(
          `簡答：\\(${poly3(C2, C1, C0)}\\)。過程：先展開 \\((x-${a})(x-${b})=x^2-${a + b}x+${a * b}\\)，再乘以 \\((x-${c})\\)，整理得 \\(${poly3(C2, C1, C0)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        // (x+a)(x-a)(x+b)，先用平方差公式
        const a = randInt(1, 4);
        const b = randInt(1, 5);
        const a2 = a * a;
        const C2 = b;
        const C1 = -a2;
        const C0 = -(a2 * b);
        questions.push(`展開 \\((x+${a})(x-${a})(x+${b})\\)。`);
        answers.push(
          `簡答：\\(${poly3(C2, C1, C0)}\\)。過程：利用平方差公式 \\((x+${a})(x-${a})=x^2-${a2}\\)，再乘以 \\((x+${b})\\)，得 \\(${poly3(C2, C1, C0)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        // (x+a)(x+b)(x-c)，混合正負
        const a = randInt(1, 3);
        const b = randInt(1, 3);
        let c = randInt(1, 4);
        while (a + b === c) c = randInt(1, 4);
        const C2 = a + b - c;
        const C1 = a * b - c * (a + b);
        const C0 = -(a * b * c);
        questions.push(`展開 \\((x+${a})(x+${b})(x-${c})\\)。`);
        answers.push(
          `簡答：\\(${poly3(C2, C1, C0)}\\)。過程：先展開 \\((x+${a})(x+${b})=x^2+${a + b}x+${a * b}\\)，再乘以 \\((x-${c})\\)，整理得 \\(${poly3(C2, C1, C0)}\\)。`
        );
        continue;
      }
      // mode === 4: (x+a)(x-b)(x-c)，兩個負根
      const a = randInt(1, 4);
      const b = randInt(1, 3);
      const c = randInt(1, 3);
      const C2 = a - b - c;
      const C1 = b * c - a * (b + c);
      const C0 = a * b * c;
      questions.push(`展開 \\((x+${a})(x-${b})(x-${c})\\)。`);
      answers.push(
        `簡答：\\(${poly3(C2, C1, C0)}\\)。過程：先展開 \\((x-${b})(x-${c})=x^2-${b + c}x+${b * c}\\)，再乘以 \\((x+${a})\\)，整理得 \\(${poly3(C2, C1, C0)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── s1-1-3 新增：因式分解（乘法公式）────────────────────────────
  function buildS113PolynomialFactorizationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        // x³ - a³ = (x-a)(x²+ax+a²)
        const a = randInt(2, 15);
        const ax = a === 1 ? '' : `${a}`;
        questions.push(`因式分解 \\(x^3-${a * a * a}\\)。`);
        answers.push(
          `簡答：\\((x-${a})(x^2+${ax}x+${a * a})\\)。過程：套用立方差公式 \\(A^3-B^3=(A-B)(A^2+AB+B^2)\\)，令 \\(A=x,B=${a}\\)，得 \\((x-${a})(x^2+${ax}x+${a * a})\\)。`
        );
        continue;
      }
      if (mode === 1) {
        // x³ + a³ = (x+a)(x²-ax+a²)
        const a = randInt(2, 15);
        const ax = a === 1 ? '' : `${a}`;
        questions.push(`因式分解 \\(x^3+${a * a * a}\\)。`);
        answers.push(
          `簡答：\\((x+${a})(x^2-${ax}x+${a * a})\\)。過程：套用立方和公式 \\(A^3+B^3=(A+B)(A^2-AB+B^2)\\)，令 \\(A=x,B=${a}\\)，得 \\((x+${a})(x^2-${ax}x+${a * a})\\)。`
        );
        continue;
      }
      if (mode === 2) {
        // x⁴ - a⁴ = (x²+a²)(x+a)(x-a)
        const a = randInt(1, 12);
        questions.push(`因式分解 \\(x^4-${a * a * a * a}\\)。`);
        answers.push(
          `簡答：\\((x^2+${a * a})(x+${a})(x-${a})\\)。過程：先用平方差 \\(x^4-${a * a * a * a}=(x^2+${a * a})(x^2-${a * a})\\)，再分解 \\(x^2-${a * a}=(x+${a})(x-${a})\\)，得 \\((x^2+${a * a})(x+${a})(x-${a})\\)。`
        );
        continue;
      }
      if (mode === 3) {
        // Sophie Germain：x⁴+4a⁴ = (x²+2ax+2a²)(x²-2ax+2a²)
        const a = randInt(1, 10);
        const val = 4 * a * a * a * a;
        const a2 = 2 * a;
        const a22 = 2 * a * a;
        questions.push(`因式分解 \\(x^4+${val}\\)。`);
        answers.push(
          `簡答：\\((x^2+${a2}x+${a22})(x^2-${a2}x+${a22})\\)。過程：\\(x^4+${val}=(x^2+${a22})^2-(${a2}x)^2=(x^2+${a2}x+${a22})(x^2-${a2}x+${a22})\\)。`
        );
        continue;
      }
      // mode === 4: x⁴+a²x²+a⁴ = (x²+ax+a²)(x²-ax+a²)
      const a = randInt(1, 10);
      const a2 = a * a;
      const a4 = a2 * a2;
      const xterm = a === 1 ? 'x' : `${a}x`;
      const x2term = a2 === 1 ? 'x^2' : `${a2}x^2`;
      questions.push(`因式分解 \\(x^4+${x2term}+${a4}\\)。`);
      answers.push(
        `簡答：\\((x^2+${xterm}+${a2})(x^2-${xterm}+${a2})\\)。過程：\\(x^4+${x2term}+${a4}=(x^2+${a2})^2-${xterm}^2=(x^2+${xterm}+${a2})(x^2-${xterm}+${a2})\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function formatS114Exponent(num, den = 1) {
    const frac = reduceFraction(num, den);
    if (frac.denominator === 1) return `${frac.numerator}`;
    return `\\frac{${frac.numerator}}{${frac.denominator}}`;
  }

  function formatS114Power(base, num, den = 1) {
    const frac = reduceFraction(num, den);
    if (frac.numerator === 0) return '1';
    if (frac.denominator === 1 && frac.numerator === 1) return base;
    return `${base}^{${formatS114Exponent(num, den)}}`;
  }

  function buildS114NumericRationalExponentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const b = randInt(2, 6);
        const n = randInt(2, 4);
        const m = randInt(1, 4);
        questions.push(`計算 \\((${b ** n})^{${formatS114Exponent(-m, n)}}\\) 之值。`);
        answers.push(
          `簡答：\\(${formatFraction(1, b ** m)}\\)。過程：\\((${b ** n})^{${formatS114Exponent(-m, n)}}=${b}^{-${m}}=${formatFraction(1, b ** m)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const b = randInt(2, 5);
        const decimalItems = [
          { num: 1, den: 2, label: '0.5' },
          { num: 1, den: 4, label: '0.25' },
          { num: 3, den: 2, label: '1.5' },
        ];
        const item = decimalItems[randInt(0, decimalItems.length - 1)];
        const resultPower = formatS114Power(`${b}`, item.num);
        const resultValue = b ** item.num;
        const resultText = resultPower === `${resultValue}` ? `${resultValue}` : `${resultPower}=${resultValue}`;
        questions.push(`計算 \\((${b ** item.den})^{${item.label}}\\) 之值。`);
        answers.push(
          `簡答：${resultValue}。過程：\\(${item.label}=${formatS114Exponent(item.num, item.den)}\\)，所以 \\((${b ** item.den})^{${item.label}}=${resultText}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        let a = randInt(2, 5);
        let b = randInt(2, 5);
        while (gcd(a, b) !== 1) {
          a = randInt(2, 5);
          b = randInt(2, 5);
        }
        questions.push(
          `計算 \\((\\frac{${a ** 3}}{${b ** 3}})^{-1/3}\\cdot(\\frac{${a ** 2}}{${b ** 2}})^{1/2}\\) 之值。`
        );
        answers.push(
          `簡答：1。過程：第一因式為 \\(\\frac{${b}}{${a}}\\)，第二因式為 \\(\\frac{${a}}{${b}}\\)，相乘得 1。`
        );
        continue;
      }
      if (mode === 3) {
        const root = randInt(2, 7);
        const sum = reduceFraction(1 + root ** 4, root * root);
        questions.push(`化簡 \\(${root ** 3}^{-2/3}+(${root ** 5})^{2/5}\\)。`);
        answers.push(
          `簡答：\\(${formatFraction(sum.numerator, sum.denominator)}\\)。過程：\\(${root ** 3}^{-2/3}=(${root})^{-2}=${formatFraction(1, root * root)}\\)，\\((${root ** 5})^{2/5}=${root}^2=${root * root}\\)，相加得 \\(${formatFraction(sum.numerator, sum.denominator)}\\)。`
        );
        continue;
      }
      // 連乘化為同底：第 i 項為 (b^{i})^{1/(i·m_i)} = b^{1/m_i}，且 Σ 1/m_i = 1
      const base = [2, 3, 5][randInt(0, 2)];
      const partitions = [
        [2, 4, 8, 8],
        [2, 3, 6],
        [2, 4, 4],
        [3, 3, 3],
        [2, 6, 6, 6],
        [4, 4, 4, 4],
        [2, 4, 6, 12],
      ];
      const part = partitions[randInt(0, partitions.length - 1)];
      const factors = part.map((m, idx) => `${base ** (idx + 1)}^{\\frac{1}{${(idx + 1) * m}}}`);
      const unitSum = part.map((m) => `\\frac{1}{${m}}`).join('+');
      questions.push(`計算 \\(${factors.join('\\cdot')}\\) 的值。`);
      answers.push(
        `簡答：\\(${base}\\)。過程：全部化為 ${base} 的冪，第 \\(i\\) 項 \\((${base}^{i})^{\\frac{1}{i\\cdot m}}=${base}^{\\frac{1}{m}}\\)。指數和為 \\(${unitSum}=1\\)，所以原式為 ${base}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS114VariableExponentSimplificationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const m = randInt(3, 7);
        const n = randInt(1, m - 2);
        questions.push(`化簡 \\((a^${m}\\cdot a^{-${n}})^2\\div \\sqrt{a^{${m - n}}}\\)，設 \\(a>0\\)。`);
        answers.push(
          `簡答：\\(${formatS114Power('a', 3 * (m - n), 2)}\\)。過程：\\((a^${m}\\cdot a^{-${n}})^2=a^{${2 * (m - n)}}\\)，\\(\\sqrt{a^{${m - n}}}=${formatS114Power('a', m - n, 2)}\\)，相除得 \\(${formatS114Power('a', 3 * (m - n), 2)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const p = randInt(2, 9);
        questions.push(`化簡 \\(\\sqrt[3]{a^${p}}\\cdot\\sqrt[6]{a^{${p + 3}}}\\)，設 \\(a>0\\)。`);
        answers.push(
          `簡答：\\(${formatS114Power('a', 3 * p + 3, 6)}\\)。過程：\\(\\sqrt[3]{a^${p}}=${formatS114Power('a', p, 3)}\\)，\\(\\sqrt[6]{a^{${p + 3}}}=${formatS114Power('a', p + 3, 6)}\\)，相乘指數相加得 \\(${formatS114Power('a', 3 * p + 3, 6)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const p = randInt(1, 3);
        const q = randInt(1, 3);
        const r = randInt(1, 3);
        const s = randInt(1, 3);
        const firstRadicand = `${formatS114Power('a', p)}${formatS114Power('b', q)}`;
        const secondRadicand = `${formatS114Power('a', r)}${formatS114Power('b', s)}`;
        questions.push(`設 \\(a,b>0\\)，化簡 \\(\\sqrt[3]{${firstRadicand}}\\times(${secondRadicand})^{2/3}\\)。`);
        answers.push(
          `簡答：\\(${formatS114Power('a', p + 2 * r, 3)}${formatS114Power('b', q + 2 * s, 3)}\\)。過程：\\(\\sqrt[3]{${firstRadicand}}=${formatS114Power('a', p, 3)}${formatS114Power('b', q, 3)}\\)，\\((${secondRadicand})^{2/3}=${formatS114Power('a', 2 * r, 3)}${formatS114Power('b', 2 * s, 3)}\\)，相乘得 \\(${formatS114Power('a', p + 2 * r, 3)}${formatS114Power('b', q + 2 * s, 3)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        // 連續平方差：由 1/2^d 起，逐步乘共軛到 1/2^t，結果為 A^{2^{1-t}}-B^{2^{1-t}}
        const [A, B] = [
          ['a', 'b'],
          ['x', 'y'],
          ['p', 'q'],
        ][randInt(0, 2)];
        const d = randInt(2, 4);
        const t = randInt(0, 1);
        const ex = (j) => (j === 0 ? '' : `^{1/${2 ** j}}`);
        const factors = [`(${A}${ex(d)}-${B}${ex(d)})`, `(${A}${ex(d)}+${B}${ex(d)})`];
        for (let j = d - 1; j >= t; j -= 1) factors.push(`(${A}${ex(j)}+${B}${ex(j)})`);
        const resExp = 2 ** (1 - t);
        const resText = resExp === 1 ? `${A}-${B}` : `${A}^${resExp}-${B}^${resExp}`;
        questions.push(`設 \\(${A},${B}\\geq0\\)，化簡 \\(${factors.join('')}\\)。`);
        answers.push(
          `簡答：\\(${resText}\\)。過程：前兩項為平方差得 \\(${A}${ex(d - 1)}-${B}${ex(d - 1)}\\)；此後每乘一個同指數的和式，指數就加倍一次，逐步化簡到最後得 \\(${resText}\\)。`
        );
        continue;
      }
      const p = randInt(2, 5);
      const q = randInt(1, 6);
      const r = randInt(1, 4);
      const pX = formatTerm(p, 'x');
      const numeratorX = formatTerm(p - 1, 'x');
      const denominatorX = formatTerm(r, 'x');
      const resultXCoeff = p - 1 - r;
      const resultConstant = q + 1;
      const resultExponent =
        resultXCoeff === 0
          ? `${resultConstant}`
          : `${resultXCoeff === 1 ? 'x' : resultXCoeff === -1 ? '-x' : `${resultXCoeff}x`}${formatSignedNumber(resultConstant)}`;
      questions.push(`化簡 \\(\\frac{a^{${pX}}a^{${q}-x}}{a^{${denominatorX}-1}}\\)，並以 \\(a\\) 的次方表示。`);
      answers.push(
        `簡答：\\(a^{${resultExponent}}\\)。過程：分子指數相加為 \\(${pX}+${q}-x=${numeratorX}+${q}\\)，再除以 \\(a^{${denominatorX}-1}\\) 等於指數相減，得 \\(a^{${numeratorX}+${q}-(${denominatorX}-1)}=a^{${resultExponent}}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS114ExponentialSymmetricValueSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const s = randInt(3, 30);
      if (mode === 0) {
        questions.push(`已知 \\(x^{1/2}+x^{-1/2}=${s}\\)，求 \\(x+x^{-1}\\) 之值。`);
        answers.push(`簡答：${s * s - 2}。過程：平方得 \\(x+x^{-1}+2=${s * s}\\)，所以 \\(x+x^{-1}=${s * s - 2}\\)。`);
        continue;
      }
      if (mode === 1) {
        questions.push(`已知 \\(x^{1/2}+x^{-1/2}=${s}\\)，求 \\(x^{3/2}+x^{-3/2}\\) 之值。`);
        answers.push(
          `簡答：${s ** 3 - 3 * s}。過程：令 \\(u=x^{1/2}\\)，則 \\(u+u^{-1}=${s}\\)。\\(u^3+u^{-3}=${s}^3-3\\cdot${s}=${s ** 3 - 3 * s}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`若 \\(a^x+a^{-x}=${s}\\)，求 \\(a^{2x}+a^{-2x}\\)。`);
        answers.push(
          `簡答：${s * s - 2}。過程：\\((a^x+a^{-x})^2=a^{2x}+a^{-2x}+2\\)，所以值為 \\(${s}^2-2=${s * s - 2}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`已知 \\(a^x+a^{-x}=${s}\\)，求 \\((a^{x/2}+a^{-x/2})^2\\)。`);
        answers.push(`簡答：${s + 2}。過程：\\((a^{x/2}+a^{-x/2})^2=a^x+a^{-x}+2=${s + 2}\\)。`);
        continue;
      }
      // (A^{3kv}+A^{-3kv})/(A^{kv}+A^{-kv}) = A^{2kv}+A^{-2kv}-1
      const A = ['a', 'b', 'c'][randInt(0, 2)];
      const v = ['x', 'y', 't'][randInt(0, 2)];
      const k = randInt(1, 4);
      const kv = k === 1 ? v : `${k}${v}`;
      const kv2 = `${2 * k}${v}`;
      const kv3 = `${3 * k}${v}`;
      questions.push(`計算 \\(\\frac{${A}^{${kv3}}+${A}^{-${kv3}}}{${A}^{${kv}}+${A}^{-${kv}}}\\)。`);
      answers.push(
        `簡答：\\(${A}^{${kv2}}+${A}^{-${kv2}}-1\\)。過程：令 \\(u=${A}^{${kv}}\\)，則原式為 \\(\\frac{u^3+u^{-3}}{u+u^{-1}}=u^2+u^{-2}-1\\)，代回得 \\(${A}^{${kv2}}+${A}^{-${kv2}}-1\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS114ExponentialEquationInequalitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const base = [3, 5, 6, 7][randInt(0, 3)];
        const r1 = randInt(0, 2);
        const r2 = r1 + randInt(1, 3);
        questions.push(
          `解方程式 \\(${base ** 2}^x-${base ** r1 + base ** r2}\\cdot${base}^x+${base ** (r1 + r2)}=0\\)。`
        );
        answers.push(
          `簡答：\\(x=${r1}\\) 或 \\(x=${r2}\\)。過程：令 \\(t=${base}^x>0\\)，則 \\(${base ** 2}^x=t^2\\)，原式變成 \\(t^2-${base ** r1 + base ** r2}t+${base ** (r1 + r2)}=0\\)，解得 \\(t=${base ** r1}\\) 或 \\(t=${base ** r2}\\)，所以 \\(x=${r1}\\) 或 \\(x=${r2}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        // (b²)^{2x+p} = (b³)^{x+s}  =>  2(2x+p)=3(x+s)  =>  x=3s-2p
        const b = [2, 3, 5][randInt(0, 2)];
        const p = randInt(-3, 3);
        const s = randInt(0, 5);
        const solution = 3 * s - 2 * p;
        const leftExp = `2x${p === 0 ? '' : p > 0 ? `+${p}` : `${p}`}`;
        const rightExp = `x${s === 0 ? '' : `+${s}`}`;
        questions.push(`解方程式 \\(${b ** 2}^{${leftExp}}=${b ** 3}^{${rightExp}}\\)。`);
        answers.push(
          `簡答：\\(x=${solution}\\)。過程：化為同底 ${b}，左邊為 \\(${b}^{2(${leftExp})}\\)，右邊為 \\(${b}^{3(${rightExp})}\\)。比較指數得 \\(2(${leftExp})=3(${rightExp})\\)，即 \\(4x${2 * p >= 0 ? '+' : ''}${2 * p}=3x${3 * s >= 0 ? '+' : ''}${3 * s}\\)，所以 \\(x=${solution}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const base = [2, 3][randInt(0, 1)];
        const r1 = randInt(1, 3);
        const r2 = r1 + randInt(2, 4);
        questions.push(
          `解方程式 \\(${base}^{2x}-${base ** r1 + base ** r2}\\cdot${base}^x+${base ** (r1 + r2)}=0\\)。`
        );
        answers.push(
          `簡答：\\(x=${r1}\\) 或 \\(x=${r2}\\)。過程：令 \\(t=${base}^x>0\\)，方程成為 \\(t^2-${base ** r1 + base ** r2}t+${base ** (r1 + r2)}=0\\)，解得 \\(t=${base ** r1}\\) 或 \\(t=${base ** r2}\\)，所以 \\(x=${r1}\\) 或 \\(x=${r2}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const base = [2, 3, 5][randInt(0, 2)];
        const r1 = randInt(1, 3);
        const r2 = r1 + randInt(1, 3);
        questions.push(`解不等式 \\((${base}^x-${base ** r1})(${base}^x-${base ** r2})\\leq0\\)。`);
        answers.push(
          `簡答：\\(${r1}\\leq x\\leq${r2}\\)。過程：令 \\(t=${base}^x>0\\)，則 \\((t-${base ** r1})(t-${base ** r2})\\leq0\\)，得 \\(${base ** r1}\\leq t\\leq${base ** r2}\\)，所以 \\(${r1}\\leq x\\leq${r2}\\)。`
        );
        continue;
      }
      // t²+ct-(c+1)<0 的正根為 t=1，故 0<t<1
      const base = [2, 3, 5, 6, 7, 10][randInt(0, 5)];
      const cc = randInt(1, 4);
      const dd = cc + 1;
      if (randInt(0, 1) === 0) {
        // 底數小於 1 → 0<t<1 對應 x>0
        questions.push(
          `解不等式 \\((\\frac{1}{${base ** 2}})^x+${cc === 1 ? '' : cc}(\\frac{1}{${base}})^x-${dd}<0\\)。`
        );
        answers.push(
          `簡答：\\(x>0\\)。過程：令 \\(t=(\\frac{1}{${base}})^x>0\\)，則 \\((\\frac{1}{${base ** 2}})^x=t^2\\)，不等式為 \\(t^2+${cc === 1 ? '' : cc}t-${dd}<0\\)，因式分解為 \\((t-1)(t+${dd})<0\\)，得 \\(0<t<1\\)。因為 \\(0<\\frac{1}{${base}}<1\\)，所以 \\(x>0\\)。`
        );
      } else {
        // 底數大於 1 → 0<t<1 對應 x<0
        questions.push(`解不等式 \\(${base ** 2}^x+${cc === 1 ? '' : cc}\\cdot${base}^x-${dd}<0\\)。`);
        answers.push(
          `簡答：\\(x<0\\)。過程：令 \\(t=${base}^x>0\\)，則 \\(${base ** 2}^x=t^2\\)，不等式為 \\(t^2+${cc === 1 ? '' : cc}t-${dd}<0\\)，因式分解為 \\((t-1)(t+${dd})<0\\)，得 \\(0<t<1\\)。因為 \\(${base}>1\\)，所以 \\(x<0\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  // ── s1-1-4 新增：換底比大小 ─────────────────────────────────────
  function buildS114ExponentCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function lcm2(x, y) {
      return (x * y) / gcdInt(x, y);
    }

    function rootTeX(base, order) {
      return order === 2 ? `\\sqrt{${base}}` : `\\sqrt[${order}]{${base}}`;
    }

    for (let i = 0; i < count; i += 1) {
      let a = 2;
      let b = 3;
      let m = 2;
      let n = 3;
      for (let attempt = 0; attempt < 100; attempt += 1) {
        a = randInt(2, 9);
        b = randInt(2, 9);
        m = randInt(2, 4);
        n = randInt(2, 4);
        const LTest = lcm2(m, n);
        const aTest = a ** (LTest / m);
        const bTest = b ** (LTest / n);
        if (aTest !== bTest && aTest <= 1000 && bTest <= 1000) break;
      }
      const L = lcm2(m, n);
      const Lm = L / m;
      const Ln = L / n;
      const aL = a ** Lm;
      const bL = b ** Ln;
      const aTeX = rootTeX(a, m);
      const bTeX = rootTeX(b, n);
      const aLTeX = Lm === 1 ? `${a}` : `${a}^{${Lm}}`;
      const bLTeX = Ln === 1 ? `${b}` : `${b}^{${Ln}}`;
      const symbol = aL > bL ? '>' : '<';
      const bigger = aL > bL ? aTeX : bTeX;
      questions.push(`比較 \\(${aTeX}\\) 與 \\(${bTeX}\\) 的大小。`);
      answers.push(
        `簡答：\\(${aTeX}${symbol}${bTeX}\\)。過程：化為同次根式，取公分母指數 ${L}：\\(${aTeX}=${a}^{${Lm}/${L}}=\\sqrt[${L}]{${aLTeX}}=\\sqrt[${L}]{${aL}}\\)，\\(${bTeX}=${b}^{${Ln}/${L}}=\\sqrt[${L}]{${bLTeX}}=\\sqrt[${L}]{${bL}}\\)。因為 \\(${aL}${aL > bL ? '>' : '<'}${bL}\\)，所以 \\(${bigger}\\) 較大。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── s1-1-4 新增：已知 a^x 求 a^(mx) ────────────────────────────
  function buildS114KnownPowerSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const bases = [2, 3, 5];
    const kVals = [2, 3, 4, 5, 6];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const base = bases[randInt(0, bases.length - 1)];
      const k = kVals[randInt(0, kVals.length - 1)];
      if (mode === 0) {
        const power = randInt(2, 4);
        questions.push(`已知 \\(${base}^x=${k}\\)，求 \\((${base ** power})^x\\) 之值。`);
        answers.push(
          `簡答：${k ** power}。過程：\\((${base ** power})^x=(${base}^${power})^x=(${base}^x)^${power}=${k}^${power}=${k ** power}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const power = randInt(2, 3);
        const shift = randInt(1, 2);
        questions.push(`已知 \\(${base}^x=${k}\\)，求 \\((${base ** power})^{x+${shift}}\\) 之值。`);
        answers.push(
          `簡答：${(base ** power) ** shift * k ** power}。過程：\\((${base ** power})^{x+${shift}}=(${base ** power})^${shift}\\cdot(${base ** power})^x=${(base ** power) ** shift}\\cdot(${base}^x)^${power}=${(base ** power) ** shift}\\cdot${k}^${power}=${(base ** power) ** shift * k ** power}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`已知 \\(${base}^x=${k}\\)，求 \\(\\left(\\tfrac{1}{${base}}\\right)^x\\) 之值。`);
        answers.push(
          `簡答：\\(\\tfrac{1}{${k}}\\)。過程：\\(\\left(\\tfrac{1}{${base}}\\right)^x=${base}^{-x}=\\tfrac{1}{${base}^x}=\\tfrac{1}{${k}}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const power = randInt(2, 4);
        questions.push(`已知 \\(${base}^x=${k}\\)，求 \\(${base}^{${power}x}\\) 之值。`);
        answers.push(
          `簡答：${k ** power}。過程：\\(${base}^{${power}x}=(${base}^x)^${power}=${k}^${power}=${k ** power}\\)。`
        );
        continue;
      }
      const shift = randInt(1, 3);
      questions.push(`已知 \\(${base}^x=${k}\\)，求 \\(${base}^{x+${shift}}\\) 之值。`);
      answers.push(
        `簡答：${base ** shift * k}。過程：\\(${base}^{x+${shift}}=${base}^${shift}\\cdot${base}^x=${base ** shift}\\cdot${k}=${base ** shift * k}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── s1-1-4 新增：指數換元（混合底，4^x 與 2^x 型）────────────────
  function buildS114SubstitutionEquationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        // 4^x - (2^r-k)·2^x - k·2^r = 0 → t=2^x，(t-2^r)(t+k)=0，x=r
        const r = randInt(1, 5);
        const k = randInt(1, 6);
        const tr = 2 ** r;
        const pCoeff = tr - k; // 2^x 的係數（正表示減）
        const C = k * tr;
        const sign2x =
          pCoeff > 0
            ? `-${Math.abs(pCoeff) === 1 ? '' : Math.abs(pCoeff) + '\\cdot'}`
            : `+${Math.abs(pCoeff) === 1 ? '' : Math.abs(pCoeff) + '\\cdot'}`;
        const signT =
          pCoeff > 0
            ? `-${Math.abs(pCoeff) === 1 ? '' : Math.abs(pCoeff)}`
            : `+${Math.abs(pCoeff) === 1 ? '' : Math.abs(pCoeff)}`;
        questions.push(`解方程式 \\(4^x${sign2x}2^x-${C}=0\\)。`);
        answers.push(
          `簡答：\\(x=${r}\\)。過程：令 \\(t=2^x>0\\)，\\(4^x=t^2\\)，方程變為 \\(t^2${signT}t-${C}=0\\)，即 \\((t-${tr})(t+${k})=0\\)，得 \\(t=${tr}\\)（\\(t=-${k}\\) 捨），所以 \\(2^x=${tr}=2^${r}\\)，\\(x=${r}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        // 9^x - (3^r1+3^r2)·3^x + 3^(r1+r2) = 0 → 兩正根 x=r1 or x=r2
        const r1 = randInt(0, 3);
        const r2 = r1 + randInt(1, 3);
        const t1 = 3 ** r1;
        const t2 = 3 ** r2;
        const S = t1 + t2;
        const P = t1 * t2;
        questions.push(`解方程式 \\(9^x-${S}\\cdot3^x+${P}=0\\)。`);
        answers.push(
          `簡答：\\(x=${r1}\\) 或 \\(x=${r2}\\)。過程：令 \\(t=3^x>0\\)，\\(9^x=t^2\\)，方程變為 \\(t^2-${S}t+${P}=0\\)，即 \\((t-${t1})(t-${t2})=0\\)，得 \\(t=${t1}\\) 或 \\(t=${t2}\\)，所以 \\(x=${r1}\\) 或 \\(x=${r2}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        // 4^x + 2^(x+1) - C = 0 → t=2^x，t^2+2t-C=0，C=4^n+2^(n+1)，x=n
        const n = randInt(1, 5);
        const tn = 2 ** n;
        const C = tn * tn + 2 * tn;
        questions.push(`解方程式 \\(4^x+2^{x+1}-${C}=0\\)。`);
        answers.push(
          `簡答：\\(x=${n}\\)。過程：令 \\(t=2^x>0\\)，\\(4^x=t^2\\)，\\(2^{x+1}=2t\\)，方程變為 \\(t^2+2t-${C}=0\\)，解得 \\(t=${tn}\\)（另一根為負捨去），所以 \\(2^x=${tn}=2^${n}\\)，\\(x=${n}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        // 4^x - (2^r1+2^r2)·2^x + 2^(r1+r2) = 0 → 兩正根 x=r1 or x=r2（用 4^x 符號凸顯換底步驟）
        const r1 = randInt(0, 3);
        const r2 = r1 + randInt(1, 3);
        const t1 = 2 ** r1;
        const t2 = 2 ** r2;
        const S = t1 + t2;
        const P = t1 * t2;
        questions.push(`解方程式 \\(4^x-${S}\\cdot2^x+${P}=0\\)。`);
        answers.push(
          `簡答：\\(x=${r1}\\) 或 \\(x=${r2}\\)。過程：令 \\(t=2^x>0\\)，注意 \\(4^x=(2^2)^x=(2^x)^2=t^2\\)，方程變為 \\(t^2-${S}t+${P}=0\\)，即 \\((t-${t1})(t-${t2})=0\\)，得 \\(t=${t1}\\) 或 \\(t=${t2}\\)，所以 \\(x=${r1}\\) 或 \\(x=${r2}\\)。`
        );
        continue;
      }
      // mode === 4：(3^x - 3^n)^2 = 0 → 9^x - 2·3^n·3^x + 9^n = 0
      const n = randInt(1, 5);
      const tn = 3 ** n;
      const Sn = 2 * tn;
      const Pn = tn * tn;
      questions.push(`解方程式 \\(9^x-${Sn}\\cdot3^x+${Pn}=0\\)。`);
      answers.push(
        `簡答：\\(x=${n}\\)。過程：令 \\(t=3^x>0\\)，\\(9^x=t^2\\)，方程變為 \\(t^2-${Sn}t+${Pn}=0\\)，即 \\((t-${tn})^2=0\\)，唯一正根 \\(t=${tn}=3^${n}\\)，所以 \\(x=${n}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── s1-1-4 新增：提公因數指數方程 ──────────────────────────────
  function buildS114ExtractFactorEquationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        // 2^(x+r) - 2^x = k：提出 2^x，2^x(2^r-1) = k
        const r = randInt(1, 5);
        const n = randInt(1, 5);
        const factor = 2 ** r - 1;
        const k = factor * 2 ** n;
        questions.push(`解方程式 \\(2^{x+${r}}-2^x=${k}\\)。`);
        answers.push(
          `簡答：\\(x=${n}\\)。過程：提出公因式 \\(2^x\\)，得 \\(2^x(2^${r}-1)=${k}\\)，即 \\(${factor}\\cdot2^x=${k}\\)，所以 \\(2^x=${2 ** n}=2^${n}\\)，\\(x=${n}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        // 3^(x+1) + 3^(x-1) = k：提出 3^(x-1)，10·3^(x-1) = k
        const m = randInt(0, 4);
        const k = 10 * 3 ** m;
        const x = m + 1;
        questions.push(`解方程式 \\(3^{x+1}+3^{x-1}=${k}\\)。`);
        answers.push(
          `簡答：\\(x=${x}\\)。過程：提出 \\(3^{x-1}\\)，得 \\(3^{x-1}(3^2+1)=${k}\\)，即 \\(10\\cdot3^{x-1}=${k}\\)，所以 \\(3^{x-1}=${3 ** m}\\)，\\(x-1=${m}\\)，\\(x=${x}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        // 2^(x+1) + 2^(x-1) = k：提出 2^(x-1)，5·2^(x-1) = k
        const m = randInt(1, 5);
        const k = 5 * 2 ** m;
        const x = m + 1;
        questions.push(`解方程式 \\(2^{x+1}+2^{x-1}=${k}\\)。`);
        answers.push(
          `簡答：\\(x=${x}\\)。過程：提出 \\(2^{x-1}\\)，得 \\(2^{x-1}(2^2+1)=${k}\\)，即 \\(5\\cdot2^{x-1}=${k}\\)，所以 \\(2^{x-1}=${2 ** m}=2^${m}\\)，\\(x-1=${m}\\)，\\(x=${x}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        // 5^(x+2) - 5^x = k：提出 5^x，24·5^x = k
        const n = randInt(1, 4);
        const k = 24 * 5 ** n;
        questions.push(`解方程式 \\(5^{x+2}-5^x=${k}\\)。`);
        answers.push(
          `簡答：\\(x=${n}\\)。過程：提出 \\(5^x\\)，得 \\(5^x(5^2-1)=${k}\\)，即 \\(24\\cdot5^x=${k}\\)，所以 \\(5^x=${5 ** n}=5^${n}\\)，\\(x=${n}\\)。`
        );
        continue;
      }
      // mode === 4：2^(x+r) + 2^x = k：提出 2^x，(2^r+1)·2^x = k
      const r = randInt(1, 5);
      const n = randInt(1, 5);
      const factor = 2 ** r + 1;
      const k = factor * 2 ** n;
      questions.push(`解方程式 \\(2^{x+${r}}+2^x=${k}\\)。`);
      answers.push(
        `簡答：\\(x=${n}\\)。過程：提出公因式 \\(2^x\\)，得 \\(2^x(2^${r}+1)=${k}\\)，即 \\(${factor}\\cdot2^x=${k}\\)，所以 \\(2^x=${2 ** n}=2^${n}\\)，\\(x=${n}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS114ExponentialQuadraticExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const bases = [2, 3, 5];
    for (let i = 0; i < count; i += 1) {
      const base = bases[randInt(0, bases.length - 1)];
      const denominator = randInt(2, 4);
      const numerator = randInt(1, denominator - 1);
      const shift = randInt(-4, 4);
      const outerBase = base ** denominator;
      const minValue = base ** numerator;
      const shiftExpr = shift === 0 ? 'x^2' : `(x${shift > 0 ? '-' : '+'}${Math.abs(shift)})^2`;
      questions.push(
        `對任意實數 \\(x\\)，求 \\((${outerBase})^{${shiftExpr}+${formatFraction(numerator, denominator)}}\\) 的最小值。`
      );
      answers.push(
        `簡答：\\(${minValue}\\)。過程：因為底數 \\(${outerBase}>1\\)，指數越小，整個值越小。\\(${shiftExpr}\\geq0\\)，最小值在 \\(x=${shift}\\) 時取得，所以最小指數為 \\(${formatFraction(numerator, denominator)}\\)，原式最小值為 \\((${outerBase})^{${formatFraction(numerator, denominator)}}=(${base}^{${denominator}})^{${formatFraction(numerator, denominator)}}=${base}^{${numerator}}=${minValue}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS114ExponentialFractionRangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const bases = [2, 3, 5];
    for (let i = 0; i < count; i += 1) {
      const base = bases[randInt(0, bases.length - 1)];
      const A = randInt(2, 8);
      const B = randInt(1, 5);
      const C = randInt(2, 6);
      const upper = formatFraction(A, C);
      const exponentialTerm = B === 1 ? `${base}^x` : `${B}\\cdot${base}^x`;
      const tTerm = B === 1 ? 't' : `${B}t`;
      questions.push(`已知 \\(x\\) 為實數，求 \\(\\frac{${A}-${exponentialTerm}}{${C}+${base}^x}\\) 的值域。`);
      answers.push(
        `簡答：\\((-${B},\\ ${upper})\\)。過程：令 \\(t=${base}^x>0\\)，原式 \\(y=\\frac{${A}-${tTerm}}{${C}+t}\\)。整理得 \\(y(${C}+t)=${A}-${tTerm}\\)，所以 \\(t(y+${B})=${A}-${C}y\\)，即 \\(t=\\frac{${A}-${C}y}{y+${B}}\\)。因為 \\(t>0\\)，分子分母同號；又 \\(\\frac{${A}}{${C}}>${-B}\\)，故 \\(-${B}<y<${upper}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS114RationalExponentOrderingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const denominatorSets = [
      [2, 3, 4],
      [2, 3, 6],
      [3, 4, 6],
      [2, 4, 6],
      [3, 4, 12],
    ];

    function lcmMany(values) {
      return values.reduce((acc, value) => (acc * value) / gcdInt(acc, value), 1);
    }

    function rootTeX(base, order) {
      return order === 2 ? `\\sqrt{${base}}` : `\\sqrt[${order}]{${base}}`;
    }

    for (let i = 0; i < count; i += 1) {
      const denominators = denominatorSets[i % denominatorSets.length];
      const bases = shuffle([2, 3, 5, 6, 7, 8, 9]).slice(0, 3);
      const items = bases.map((base, index) => {
        const denominator = denominators[index];
        return {
          base,
          denominator,
          tex: rootTeX(base, denominator),
        };
      });
      const L = lcmMany(denominators);
      items.forEach((item) => {
        item.compareValue = item.base ** (L / item.denominator);
        item.compareTex = `${item.base}^{${L / item.denominator}}`;
      });
      if (new Set(items.map((item) => item.compareValue)).size < items.length) {
        i -= 1;
        continue;
      }
      const sorted = items.slice().sort((a, b) => b.compareValue - a.compareValue);
      questions.push(`比較 \\(${items.map((item) => item.tex).join('\\)、\\(')}\\) 的大小，並由大到小排列。`);
      answers.push(
        `簡答：\\(${sorted.map((item) => item.tex).join('>')}\\)。過程：把三個數都化成 \\(\\frac{1}{${L}}\\) 次方比較：${items
          .map((item) => `\\(${item.tex}=\\sqrt[${L}]{${item.compareTex}}=\\sqrt[${L}]{${item.compareValue}}\\)`)
          .join('，')}。因為 \\(${sorted.map((item) => item.compareValue).join('>')}\\)，所以大小順序如上。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS114ExponentialGrowthModelSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const root = randInt(2, 4);
      const dailyRate = root ** 2;
      const startCount = randInt(1, 9) * 10;
      const firstDay = randInt(1, 4);
      const halfSteps = [3, 5][i % 2];
      const secondDayText = `${firstDay + Math.floor(halfSteps / 2)}\\frac{1}{2}`;
      const firstCount = startCount * dailyRate ** firstDay;
      const secondCount = firstCount * root ** halfSteps;
      questions.push(
        `某項實驗中，細菌數每天變為原來的 \\(a\\) 倍。已知第 ${firstDay} 日有 ${firstCount} 個，第 \\(${secondDayText}\\) 日有 ${secondCount} 個，求 \\(a\\)。`
      );
      answers.push(
        `簡答：\\(a=${dailyRate}\\)。過程：兩次觀察相隔 \\(\\frac{${halfSteps}}{2}\\) 日，所以 \\(a^{${formatFraction(halfSteps, 2)}}=\\frac{${secondCount}}{${firstCount}}=${root ** halfSteps}\\)。兩邊平方得 \\(a^{${halfSteps}}=${root ** (2 * halfSteps)}\\)，故 \\(a=${root}^{2}=${dailyRate}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  const S115_LOGS = {
    2: 3010,
    3: 4771,
    4: 6021,
    5: 6990,
    6: 7781,
    7: 8451,
    8: 9031,
    9: 9542,
    11: 10414,
  };

  const S115_LOG_DIGIT_THRESHOLDS = [
    { digit: 1, logInt: 0 },
    { digit: 2, logInt: 3010 },
    { digit: 3, logInt: 4771 },
    { digit: 4, logInt: 6021 },
    { digit: 5, logInt: 6990 },
    { digit: 6, logInt: 7781 },
    { digit: 7, logInt: 8451 },
    { digit: 8, logInt: 9031 },
    { digit: 9, logInt: 9542 },
    { digit: 10, logInt: 10000 },
  ];

  function formatS115LogInt(value) {
    const sign = value < 0 ? '-' : '';
    const absValue = Math.abs(value);
    const integerPart = Math.floor(absValue / 10000);
    const decimalPart = `${absValue % 10000}`.padStart(4, '0');
    return `${sign}${integerPart}.${decimalPart}`;
  }

  function formatS115PureDecimal(value) {
    return `0.${`${value}`.padStart(4, '0')}`;
  }

  function getS115LeadingDigitByMantissa(mantissaInt) {
    const normalized = ((mantissaInt % 10000) + 10000) % 10000;
    for (let i = S115_LOG_DIGIT_THRESHOLDS.length - 2; i >= 0; i -= 1) {
      if (normalized >= S115_LOG_DIGIT_THRESHOLDS[i].logInt) return S115_LOG_DIGIT_THRESHOLDS[i].digit;
    }
    return 1;
  }

  function buildS115LargeNumberDigitCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const logItems = [
      { base: 2, logInt: S115_LOGS[2] },
      { base: 3, logInt: S115_LOGS[3] },
      { base: 7, logInt: S115_LOGS[7] },
      { base: 11, logInt: S115_LOGS[11] },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 2) {
        const item = logItems[mode];
        const exponent = randInt(18, 120);
        const product = item.logInt * exponent;
        if (product % 10000 === 0) {
          i -= 1;
          continue;
        }
        const integerPart = Math.floor(product / 10000);
        const digits = integerPart + 1;
        questions.push(
          `已知 \\(\\log ${item.base}\\approx ${formatS115LogInt(item.logInt)}\\)，求 \\(${item.base}^{${exponent}}\\) 為幾位數？`
        );
        answers.push(
          `簡答：${digits} 位數。過程：\\(\\log ${item.base}^{${exponent}}=${exponent}\\log ${item.base}\\approx ${formatS115LogInt(product)}\\)，其首數為 ${integerPart}，所以 \\(${item.base}^{${exponent}}\\) 為 ${integerPart}+1=${digits} 位數。`
        );
        continue;
      }
      if (mode === 3) {
        const base = 11;
        const exponent = randInt(12, 30);
        const product = S115_LOGS[base] * exponent;
        const digits = Math.floor(product / 10000) + 1;
        questions.push(`若 \\(11^${exponent}\\) 為 ${digits} 位數，求 \\(\\log 11\\) 的可能範圍。`);
        answers.push(
          `簡答：\\(${formatFraction(digits - 1, exponent)}\\leq\\log 11<${formatFraction(digits, exponent)}\\)。過程：${digits} 位數代表 \\(${digits - 1}\\leq\\log 11^${exponent}<${digits}\\)，也就是 \\(${digits - 1}\\leq ${exponent}\\log 11<${digits}\\)，兩邊同除以 ${exponent} 即得範圍。`
        );
        continue;
      }
      const exponent = randInt(20, 90);
      const log6 = S115_LOGS[2] + S115_LOGS[3];
      const product = log6 * exponent;
      const integerPart = Math.floor(product / 10000);
      const digits = integerPart + 1;
      questions.push(`已知 \\(\\log 2\\approx0.3010,\\log 3\\approx0.4771\\)，判定 \\(6^{${exponent}}\\) 的位數。`);
      answers.push(
        `簡答：${digits} 位數。過程：\\(\\log 6=\\log2+\\log3\\approx0.7781\\)，\\(\\log 6^{${exponent}}\\approx ${formatS115LogInt(product)}\\)，首數為 ${integerPart}，所以位數為 ${digits}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS115FirstNonzeroDecimalPlaceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const bases = [
      { base: 2, logInt: S115_LOGS[2] },
      { base: 3, logInt: S115_LOGS[3] },
      { base: 7, logInt: S115_LOGS[7] },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 1) {
        const item = bases[mode];
        const exponent = randInt(20, 120);
        const positiveLog = item.logInt * exponent;
        if (positiveLog % 10000 === 0) {
          i -= 1;
          continue;
        }
        const place = Math.ceil(positiveLog / 10000);
        questions.push(
          `已知 \\(\\log ${item.base}\\approx ${formatS115LogInt(item.logInt)}\\)，判定 \\((\\frac{1}{${item.base}})^{${exponent}}\\) 從小數點後第幾位開始出現不為 0 的數字。`
        );
        answers.push(
          `簡答：第 ${place} 位。過程：\\(\\log (\\frac{1}{${item.base}})^{${exponent}}=-${exponent}\\log ${item.base}\\approx -${formatS115LogInt(positiveLog)}\\)。因為 \\(-${place}<\\log x<-${place - 1}\\)，所以首位非零在小數點後第 ${place} 位。`
        );
        continue;
      }
      if (mode === 2) {
        const exponent = randInt(30, 100);
        const positiveLog = (S115_LOGS[7] - S115_LOGS[2]) * exponent;
        const place = Math.ceil(positiveLog / 10000);
        questions.push(
          `已知 \\(\\log2\\approx0.3010,\\log7\\approx0.8451\\)，判定 \\((\\frac{2}{7})^{${exponent}}\\) 的首位非零出現在小數點後第幾位。`
        );
        answers.push(
          `簡答：第 ${place} 位。過程：\\(\\log(\\frac{2}{7})^{${exponent}}=${exponent}(\\log2-\\log7)\\approx-${formatS115LogInt(positiveLog)}\\)，所以首位非零在小數點後第 ${place} 位。`
        );
        continue;
      }
      if (mode === 3) {
        const place = randInt(3, 9);
        const mantissa = randInt(1000, 9000);
        const positiveLog = (place - 1) * 10000 + mantissa;
        questions.push(`若 \\(\\log x=-${formatS115LogInt(positiveLog)}\\)，判定 \\(x\\) 從小數點後第幾位開始不為 0。`);
        answers.push(
          `簡答：第 ${place} 位。過程：\\(-${place}<\\log x<-${place - 1}\\)，表示 \\(10^{-${place}}<x<10^{-${place - 1}}\\)，所以首位非零在小數點後第 ${place} 位。`
        );
        continue;
      }
      const exponent = randInt(60, 160);
      const positiveLog = 170 * exponent;
      const place = Math.ceil(positiveLog / 10000);
      questions.push(
        `已知 \\(\\log1.04\\approx0.0170\\)，判定 \\((1.04)^{-${exponent}}\\) 的首位非零出現在小數點後第幾位。`
      );
      answers.push(
        `簡答：第 ${place} 位。過程：\\(\\log(1.04)^{-${exponent}}=-${exponent}\\log1.04\\approx-${formatS115LogInt(positiveLog)}\\)，所以首位非零在小數點後第 ${place} 位。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS115LeadingDigitSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const baseItems = [
      { base: 2, logInt: S115_LOGS[2] },
      { base: 3, logInt: S115_LOGS[3] },
      { base: 7, logInt: S115_LOGS[7] },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 2) {
        const item = baseItems[mode];
        const exponent = randInt(20, 100);
        const logValue = item.logInt * exponent;
        const mantissa = logValue % 10000;
        const digit = getS115LeadingDigitByMantissa(mantissa);
        const nextLog = S115_LOG_DIGIT_THRESHOLDS[digit - 1].logInt;
        const upperLog = S115_LOG_DIGIT_THRESHOLDS[digit].logInt;
        questions.push(
          `已知常用對數表，\\(\\log ${item.base}\\approx${formatS115LogInt(item.logInt)}\\)，求 \\(${item.base}^{${exponent}}\\) 的最高位數字。`
        );
        answers.push(
          `簡答：${digit}。過程：\\(\\log ${item.base}^{${exponent}}\\approx${formatS115LogInt(logValue)}\\)，尾數為 ${formatS115PureDecimal(mantissa)}。因為 \\(\\log ${digit}\\approx${formatS115LogInt(nextLog)}\\leq ${formatS115PureDecimal(mantissa)}<\\log ${digit + 1}\\approx${formatS115LogInt(upperLog)}\\)，所以最高位數字為 ${digit}。`
        );
        continue;
      }
      if (mode === 3) {
        const characteristic = randInt(2, 9);
        const mantissas = [3310, 5229, 6690, 8129];
        const tail = mantissas[randInt(0, mantissas.length - 1)];
        const logValue = -(characteristic * 10000 + tail);
        const mantissa = 10000 - tail;
        const digit = getS115LeadingDigitByMantissa(mantissa);
        questions.push(`若 \\(\\log a=${formatS115LogInt(logValue)}\\)，求 \\(a\\) 的最高位數字。`);
        answers.push(
          `簡答：${digit}。過程：\\(\\log a=${formatS115LogInt(logValue)}\\) 的首數為 \\(-${characteristic + 1}\\)，尾數為 ${formatS115PureDecimal(mantissa)}。依對數尾數比較，可得最高位數字為 ${digit}。`
        );
        continue;
      }
      const exponent = randInt(10, 60);
      const logValue = (S115_LOGS[5] - S115_LOGS[6]) * exponent;
      const mantissa = ((logValue % 10000) + 10000) % 10000;
      const digit = getS115LeadingDigitByMantissa(mantissa);
      questions.push(
        `已知 \\(\\log5\\approx0.6990,\\log6\\approx0.7781\\)，求 \\((\\frac{5}{6})^{${exponent}}\\) 的首位非零數字。`
      );
      answers.push(
        `簡答：${digit}。過程：\\(\\log(\\frac{5}{6})^{${exponent}}=${exponent}(\\log5-\\log6)\\approx${formatS115LogInt(logValue)}\\)，其尾數為 ${formatS115PureDecimal(mantissa)}，所以首位非零數字為 ${digit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS115CharacteristicMantissaAlgebraSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const tails = [791, 1761, 2041, 3010, 4771, 5441, 6021, 6990, 7781, 8451, 9031, 9542];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 2) {
        const characteristic = randInt(1, 9);
        const tail = tails[randInt(0, tails.length - 1)];
        const sum = characteristic * 10000 + tail;
        const product = characteristic * tail;
        questions.push(
          `若 \\(\\log a\\) 的首數與尾數為方程 \\(x^2-${formatS115LogInt(sum)}x+${formatS115LogInt(product)}=0\\) 的兩根，求 \\(\\log a\\)。`
        );
        answers.push(
          `簡答：\\(\\log a=${formatS115LogInt(characteristic * 10000 + tail)}\\)。過程：方程兩根為 ${characteristic} 與 ${formatS115PureDecimal(tail)}。首數必為整數、尾數必為 \\([0,1)\\) 的小數，所以首數為 ${characteristic}、尾數為 ${formatS115PureDecimal(tail)}，故 \\(\\log a=${formatS115LogInt(characteristic * 10000 + tail)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const characteristic = randInt(0, 3);
        const lower = 10 ** characteristic;
        const upper = 10 ** (characteristic + 1);
        const answerText = characteristic === 0 ? '\\sqrt{10}' : `${10 ** characteristic}\\sqrt{10}`;
        questions.push(
          `已知 \\(\\log a\\) 的尾數與 \\(\\log \\frac{1}{a}\\) 的尾數相同，且 \\(${lower}<a<${upper}\\)，求 \\(a\\)。`
        );
        answers.push(
          `簡答：\\(a=${answerText}\\)。過程：設 \\(\\log a=${characteristic}+\\alpha\\)，其中 \\(0<\\alpha<1\\)。則 \\(\\log\\frac{1}{a}=-(${characteristic}+\\alpha)=-${characteristic + 1}+(1-\\alpha)\\)，尾數為 \\(1-\\alpha\\)。兩尾數相同得 \\(\\alpha=1-\\alpha\\)，所以 \\(\\alpha=\\frac{1}{2}\\)，故 \\(a=10^{${characteristic}+1/2}=${answerText}\\)。`
        );
        continue;
      }
      const positivePower = randInt(2, 4);
      const reciprocalPower = randInt(1, 3);
      const boundPower = Math.max(positivePower, reciprocalPower);
      const totalPower = positivePower + reciprocalPower;
      questions.push(
        `若 \\(\\log(x^{${positivePower}})\\) 與 \\(\\log\\frac{1}{x^{${reciprocalPower}}}\\) 的尾數相同，且 \\(1<x<\\sqrt[${boundPower}]{10}\\)，求 \\(x\\)。`
      );
      answers.push(
        `簡答：\\(x=\\sqrt[${totalPower}]{10}\\)。過程：設 \\(\\log x=\\alpha\\)，\\(0<\\alpha<\\frac{1}{${boundPower}}\\)。\\(\\log(x^{${positivePower}})=${positivePower}\\alpha\\)，\\(\\log\\frac{1}{x^{${reciprocalPower}}}=-${reciprocalPower}\\alpha\\) 的尾數為 \\(1-${reciprocalPower}\\alpha\\)。令 \\(${positivePower}\\alpha=1-${reciprocalPower}\\alpha\\)，得 \\(\\alpha=\\frac{1}{${totalPower}}\\)，所以 \\(x=10^{1/${totalPower}}=\\sqrt[${totalPower}]{10}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS115LogOperationScientificNotationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        // 由 log2、log3（及 log5=1-log2）推出常見小數的對數
        const pool = [
          { text: '1.2', frac: '\\frac{6}{5}', logInt: S115_LOGS[6] - S115_LOGS[5], how: '\\log6-\\log5' },
          { text: '1.5', frac: '\\frac{3}{2}', logInt: S115_LOGS[3] - S115_LOGS[2], how: '\\log3-\\log2' },
          { text: '1.6', frac: '\\frac{8}{5}', logInt: S115_LOGS[8] - S115_LOGS[5], how: '\\log8-\\log5' },
          { text: '2.5', frac: '\\frac{5}{2}', logInt: S115_LOGS[5] - S115_LOGS[2], how: '\\log5-\\log2' },
          { text: '4.5', frac: '\\frac{9}{2}', logInt: S115_LOGS[9] - S115_LOGS[2], how: '\\log9-\\log2' },
          { text: '1.25', frac: '\\frac{5}{4}', logInt: S115_LOGS[5] - S115_LOGS[4], how: '\\log5-\\log4' },
          { text: '3.5', frac: '\\frac{7}{2}', logInt: S115_LOGS[7] - S115_LOGS[2], how: '\\log7-\\log2' },
          { text: '1.75', frac: '\\frac{7}{4}', logInt: S115_LOGS[7] - S115_LOGS[4], how: '\\log7-\\log4' },
          { text: '0.75', frac: '\\frac{3}{4}', logInt: S115_LOGS[3] - S115_LOGS[4], how: '\\log3-\\log4' },
          { text: '2.25', frac: '\\frac{9}{4}', logInt: S115_LOGS[9] - S115_LOGS[4], how: '\\log9-\\log4' },
        ];
        const i1 = randInt(0, pool.length - 1);
        let i2 = randInt(0, pool.length - 1);
        while (i2 === i1) i2 = randInt(0, pool.length - 1);
        const p1 = pool[i1];
        const p2 = pool[i2];
        questions.push(
          `已知 \\(\\log2\\approx0.3010,\\log3\\approx0.4771,\\log7\\approx0.8451\\)，求 \\(\\log${p1.text}\\) 與 \\(\\log${p2.text}\\) 的近似值。`
        );
        answers.push(
          `簡答：\\(\\log${p1.text}\\approx${formatS115LogInt(p1.logInt)}\\)，\\(\\log${p2.text}\\approx${formatS115LogInt(p2.logInt)}\\)。過程：\\(${p1.text}=${p1.frac}\\)，所以 \\(\\log${p1.text}=${p1.how}\\approx${formatS115LogInt(p1.logInt)}\\)；\\(${p2.text}=${p2.frac}\\)，所以 \\(\\log${p2.text}=${p2.how}\\approx${formatS115LogInt(p2.logInt)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        let exponent2 = randInt(12, 25);
        let exponent3 = randInt(8, 18);
        let log2Term = S115_LOGS[2] * exponent2;
        let log3Term = S115_LOGS[3] * exponent3;
        let larger = null;
        let smaller = null;
        let digits = 0;
        let isSafeDigitCount = false;
        for (let attempt = 0; attempt < 200 && !isSafeDigitCount; attempt += 1) {
          larger =
            log2Term >= log3Term
              ? { base: 2, exponent: exponent2, logValue: log2Term }
              : { base: 3, exponent: exponent3, logValue: log3Term };
          smaller =
            larger.base === 2
              ? { base: 3, exponent: exponent3, logValue: log3Term }
              : { base: 2, exponent: exponent2, logValue: log2Term };
          digits = Math.floor(larger.logValue / 10000) + 1;
          const logGap = larger.logValue - smaller.logValue;
          const largerMantissa = larger.logValue % 10000;
          const total = 2 ** exponent2 + 3 ** exponent3;
          isSafeDigitCount = logGap >= 20000 && largerMantissa < 9500 && `${total}`.length === digits;
          if (isSafeDigitCount) break;
          exponent2 = randInt(12, 25);
          exponent3 = randInt(8, 18);
          log2Term = S115_LOGS[2] * exponent2;
          log3Term = S115_LOGS[3] * exponent3;
        }
        if (!isSafeDigitCount) {
          exponent2 = 20;
          exponent3 = 8;
          log2Term = S115_LOGS[2] * exponent2;
          log3Term = S115_LOGS[3] * exponent3;
          larger = { base: 2, exponent: exponent2, logValue: log2Term };
          smaller = { base: 3, exponent: exponent3, logValue: log3Term };
          digits = 7;
        }
        questions.push(
          `已知 \\(\\log2\\approx0.3010,\\log3\\approx0.4771\\)，判定 \\(2^{${exponent2}}+3^{${exponent3}}\\) 大約為幾位數。`
        );
        answers.push(
          `簡答：約 ${digits} 位數。過程：比較兩項對數，\\(\\log2^{${exponent2}}\\approx${formatS115LogInt(log2Term)}\\)，\\(\\log3^{${exponent3}}\\approx${formatS115LogInt(log3Term)}\\)。較大項為 \\(${larger.base}^{${larger.exponent}}\\)，且兩項對數相差至少 2；又較大項尚未接近下一個 10 的冪，所以相加不會增加位數，總和約為 ${digits} 位數。`
        );
        continue;
      }
      if (mode === 2) {
        const coefficient = randInt(12, 98);
        const zeros = randInt(3, 6);
        const value = coefficient * 10 ** zeros;
        questions.push(`將 ${value} 表為科學記號，並判定其對數的首數。`);
        answers.push(
          `簡答：\\(${coefficient / 10}\\times10^{${zeros + 1}}\\)，首數為 ${zeros + 1}。過程：\\(${value}=${coefficient / 10}\\times10^{${zeros + 1}}\\)，且 \\(1\\leq${coefficient / 10}<10\\)，所以 \\(\\log ${value}=\\log(${coefficient / 10})+${zeros + 1}\\)，首數為 ${zeros + 1}。`
        );
        continue;
      }
      if (mode === 3) {
        const coefficientItems = [
          { text: '1.2', logInt: 791 },
          { text: '1.5', logInt: 1761 },
          { text: '2', logInt: 3010 },
          { text: '3', logInt: 4771 },
          { text: '5', logInt: 6990 },
          { text: '6', logInt: 7781 },
          { text: '7', logInt: 8451 },
          { text: '8', logInt: 9031 },
          { text: '9', logInt: 9542 },
        ];
        const coefficient = coefficientItems[randInt(0, coefficientItems.length - 1)];
        const exponent = randInt(2, 6);
        questions.push(
          `已知 \\(\\log${coefficient.text}\\approx${formatS115LogInt(coefficient.logInt)}\\)，求 \\(\\log(${coefficient.text}\\times10^{${exponent}})\\)。`
        );
        answers.push(
          `簡答：\\(${formatS115LogInt(exponent * 10000 + coefficient.logInt)}\\)。過程：\\(\\log(${coefficient.text}\\times10^{${exponent}})=\\log${coefficient.text}+${exponent}\\approx${formatS115LogInt(coefficient.logInt)}+${exponent}=${formatS115LogInt(exponent * 10000 + coefficient.logInt)}\\)。`
        );
        continue;
      }
      // log x = log m - n  =>  x = m×10^{-n}
      const mBase = [2, 3, 5, 6, 7, 8, 9][randInt(0, 6)];
      const nExp = randInt(2, 6);
      const logInt = S115_LOGS[mBase] - nExp * 10000;
      const xText = `${mBase}\\times10^{-${nExp}}`;
      questions.push(`已知 \\(\\log x=${formatS115LogInt(logInt)}\\)，將 \\(x\\) 表示為科學記號。`);
      answers.push(
        `簡答：\\(${xText}\\)。過程：把 \\(\\log x\\) 拆成「負整數 + 正純小數」，\\(${formatS115LogInt(logInt)}=-${nExp}+${formatS115LogInt(S115_LOGS[mBase])}\\)，而 \\(${formatS115LogInt(S115_LOGS[mBase])}\\approx\\log${mBase}\\)，所以 \\(x=${xText}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── s1-1-5 新增：對數直接計算 ────────────────────────────────────
  function buildS115BasicLogCalculationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        // log₁₀(10^n) + log₁₀(10^m)，n>0, m<0
        const n = randInt(1, 4);
        const m = -randInt(1, 3);
        const val1 = 10 ** n;
        const val2Labels = { '-1': '0.1', '-2': '0.01', '-3': '0.001' };
        const val2 = val2Labels[String(m)] || `10^{${m}}`;
        const total = n + m;
        const sumStr = total >= 0 ? `${total}` : `${total}`;
        const sumText = `${n}${formatSignedNumber(m)}`;
        questions.push(`計算 \\(\\log_{10}${val1}+\\log_{10}${val2}\\)。`);
        answers.push(
          `簡答：${sumStr}。過程：\\(\\log_{10}${val1}=\\log_{10}10^${n}=${n}\\)，\\(\\log_{10}${val2}=\\log_{10}10^{${m}}=${m}\\)，兩者相加得 \\(${sumText}=${sumStr}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        // log₂(2^n)，n 可為負
        const n = randInt(-3, 4);
        const absN = Math.abs(n);
        const valDisp = n >= 0 ? `${2 ** n}` : `\\dfrac{1}{${2 ** absN}}`;
        questions.push(`計算 \\(\\log_2 ${valDisp}\\)。`);
        answers.push(`簡答：${n}。過程：\\(${valDisp}=2^{${n}}\\)，所以 \\(\\log_2 ${valDisp}=${n}\\)。`);
        continue;
      }
      if (mode === 2) {
        // log_a(a^m) + log_b(b^n)，不同底
        const bases = [2, 3, 5, 10];
        let a = bases[randInt(0, 3)];
        let b = bases[randInt(0, 3)];
        while (b === a) b = bases[randInt(0, 3)];
        const m = randInt(2, 4);
        const nNeg = -randInt(1, 3);
        const sumText = `${m}${formatSignedNumber(nNeg)}`;
        const valA = a ** m;
        const valBAbsPow = b ** Math.abs(nNeg);
        const valBDisp = `\\dfrac{1}{${valBAbsPow}}`;
        questions.push(`計算 \\(\\log_{${a}}${valA}+\\log_{${b}}${valBDisp}\\)。`);
        answers.push(
          `簡答：${m + nNeg}。過程：\\(\\log_{${a}}${valA}=\\log_{${a}}${a}^${m}=${m}\\)，\\(\\log_{${b}}${valBDisp}=\\log_{${b}}${b}^{${nNeg}}=${nNeg}\\)，兩者相加得 \\(${sumText}=${m + nNeg}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        // 對數在指數位置的交換性質：a^{log_a m + log_a n} = m·n
        const aBase = [2, 3, 5, 10][randInt(0, 3)];
        const m1 = randInt(2, 9);
        let n1 = randInt(2, 9);
        while (n1 === m1) n1 = randInt(2, 9);
        questions.push(`計算 \\(${aBase}^{\\log_{${aBase}}${m1}+\\log_{${aBase}}${n1}}\\) 的值。`);
        answers.push(
          `簡答：${m1 * n1}。過程：先合併指數 \\(\\log_{${aBase}}${m1}+\\log_{${aBase}}${n1}=\\log_{${aBase}}(${m1}\\times${n1})=\\log_{${aBase}}${m1 * n1}\\)。再由 \\(a^{\\log_a x}=x\\) 得 \\(${aBase}^{\\log_{${aBase}}${m1 * n1}}=${m1 * n1}\\)。`
        );
        continue;
      }
      // mode === 4：log_{a^k}(a^n) = n/k（換底到 a）
      const baseArr = [2, 3, 5];
      const a = baseArr[randInt(0, 2)];
      const k = randInt(2, 3);
      const mul = randInt(1, 3);
      const n = k * mul; // 確保 n/k 為整數
      const base = a ** k;
      const val = a ** n;
      const result = mul;
      questions.push(`計算 \\(\\log_{${base}}${val}\\)。`);
      answers.push(
        `簡答：${result}。過程：\\(\\log_{${base}}${val}=\\log_{${a}^${k}}${a}^{${n}}=\\dfrac{${n}}{${k}}=${result}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS115LogDifferenceEstimateSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const smallerExponent = randInt(6, 16);
      const gap = randInt(3, 7);
      const largerExponent = smallerExponent + gap;
      questions.push(
        `設 \\(a,b>0\\)，且 \\(\\log a=${largerExponent}\\)、\\(\\log b=${smallerExponent}\\)。判斷 \\(\\log(a-b)\\) 最接近哪一個整數。`
      );
      answers.push(
        `簡答：最接近 ${largerExponent}。過程：由 \\(\\log a=${largerExponent}\\)、\\(\\log b=${smallerExponent}\\) 得 \\(a=10^{${largerExponent}}\\)、\\(b=10^{${smallerExponent}}\\)。所以 \\(a-b=10^{${largerExponent}}(1-10^{-${gap}})\\)，\\(\\log(a-b)=${largerExponent}+\\log(1-10^{-${gap}})\\)。因為 \\(10^{-${gap}}\\) 很小，\\(\\log(1-10^{-${gap}})\\) 接近 0，所以整體最接近 ${largerExponent}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS115LogIntervalIntegerCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const multiples = [2, 3, 4, 5, 6, 8, 9];
    for (let i = 0; i < count; i += 1) {
      const lowerTenths = randInt(7, 24);
      const widthTenths = randInt(4, 8);
      const lower = lowerTenths / 10;
      const upper = (lowerTenths + widthTenths) / 10;
      const multiple = multiples[randInt(0, multiples.length - 1)];
      const label = multiple === 2 ? '偶數' : `${multiple} 的倍數`;
      const lowerValue = 10 ** lower;
      const upperValue = 10 ** upper;
      const first = Math.floor(lowerValue / multiple) * multiple + multiple;
      const last = Math.ceil(upperValue / multiple) * multiple - multiple;
      const countValue = last >= first ? Math.floor((last - first) / multiple) + 1 : 0;
      questions.push(`滿足 \\(a\\) 為 ${label}且 \\(${lower}<\\log a<${upper}\\) 的正整數 \\(a\\) 共有幾個？`);
      answers.push(
        `簡答：${countValue} 個。過程：由 \\(${lower}<\\log a<${upper}\\) 得 \\(10^{${lower}}<a<10^{${upper}}\\)，約為 \\(${trimFixed(lowerValue, 3)}<a<${trimFixed(upperValue, 3)}\\)。其中符合 ${label}者從 ${first} 到 ${last}，共有 ${countValue} 個。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function formatS115PowerOfTenFromFraction(num, den) {
    const reduced = reduceFraction(num, den);
    if (reduced.denominator === 1) return `10^{${reduced.numerator}}`;
    if (reduced.numerator === 1) return `\\sqrt[${reduced.denominator}]{10}`;
    return `10^{${formatFraction(reduced.numerator, reduced.denominator)}}`;
  }

  function buildS115LogScaleRatioModelSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const modes = [
      () => {
        const coefficient = randInt(2, 9);
        const increase = randInt(1, 6);
        const ratio = formatS115PowerOfTenFromFraction(increase, coefficient);
        return {
          q: `某實驗數據滿足 \\(T=3+${coefficient}\\log E\\)。若 \\(T\\) 增加 ${increase}，原始數據 \\(E\\) 變為原來的幾倍？`,
          a: `簡答：\\(${ratio}\\) 倍。過程：設新舊數據比為 \\(r\\)，則 \\(${increase}=${coefficient}\\log r\\)，所以 \\(\\log r=\\frac{${increase}}{${coefficient}}\\)，\\(r=${ratio}\\)。`,
        };
      },
      () => {
        const diffTenths = [6, 8, 10, 12][randInt(0, 3)];
        const exponentNum = 15 * diffTenths;
        const ratio = formatS115PowerOfTenFromFraction(exponentNum, 100);
        return {
          q: `芮氏規模與能量滿足 \\(\\log E=1.5R+11.8\\)。若甲地震規模比乙大 ${trimFixed(diffTenths / 10, 1)}，甲釋放能量約為乙的幾倍？`,
          a: `簡答：\\(${ratio}\\) 倍。過程：兩者對數差為 \\(1.5\\times${trimFixed(diffTenths / 10, 1)}=${formatFraction(exponentNum, 100)}\\)，所以能量比為 \\(10^{${formatFraction(exponentNum, 100)}}\\)。`,
        };
      },
      () => {
        const low = randInt(1, 6);
        const high = low + randInt(1, 5);
        const ratio = 10 ** (high - low);
        return {
          q: `pH 值定義為 \\(\\mathrm{pH}=-\\log[H^+]\\)。若 A 溶液 pH 為 ${low}，B 溶液 pH 為 ${high}，A 的氫離子濃度是 B 的幾倍？`,
          a: `簡答：${ratio} 倍。過程：\\([H^+]_A=10^{-${low}}\\)，\\([H^+]_B=10^{-${high}}\\)，所以 \\(\\frac{[H^+]_A}{[H^+]_B}=10^{${high - low}}=${ratio}\\)。`,
        };
      },
      () => {
        const screens = [10, 100, 1000, 10000, 100000][randInt(0, 4)];
        const increase = 10 * Math.round(Math.log10(screens));
        return {
          q: `聲音分貝滿足 \\(D=10\\log W\\)。若 ${screens} 個相同音源同時發聲，總強度為單一音源的 ${screens} 倍，分貝會增加多少？`,
          a: `簡答：${increase} 分貝。過程：分貝差為 \\(10\\log ${screens}=10\\times${Math.round(Math.log10(screens))}=${increase}\\)。`,
        };
      },
      () => {
        const current = randInt(2, 5) * 100;
        const remain = current / 4;
        const years = randInt(2, 6);
        return {
          q: `某放射性物質目前有 ${current} 克，${years} 年後剩 ${remain} 克。若每個半衰期剩一半，求半衰期。`,
          a: `簡答：\\(${formatFraction(years, 2)}\\) 年。過程：${remain} 是 ${current} 的 \\(\\frac14=(\\frac12)^2\\)，表示經過 2 個半衰期。故半衰期為 \\(\\frac{${years}}{2}=${formatFraction(years, 2)}\\) 年。`,
        };
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = modes[i % modes.length]();
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers, answers };
  }

  function formatS121Point(p) {
    return `(${p.x},${p.y})`;
  }

  function formatS121Term(coef, variable) {
    if (coef === 0) return '';
    if (coef === 1) return variable;
    if (coef === -1) return `-${variable}`;
    return `${coef}${variable}`;
  }

  function formatS121Line(a, b, c) {
    const parts = [];
    if (a !== 0) parts.push(formatS121Term(a, 'x'));
    if (b !== 0) parts.push(`${b > 0 && parts.length ? '+' : ''}${formatS121Term(b, 'y')}`);
    if (c !== 0) parts.push(`${c > 0 && parts.length ? '+' : ''}${c}`);
    return `${parts.join('')}=0`;
  }

  function normalizeS121LineCoefficients(a, b, c) {
    const divisor = gcdInt(gcdInt(a, b), c);
    let na = a / divisor;
    let nb = b / divisor;
    let nc = c / divisor;
    if (na < 0 || (na === 0 && nb < 0)) {
      na *= -1;
      nb *= -1;
      nc *= -1;
    }
    return { a: na, b: nb, c: nc };
  }

  function formatS121BisectorEquation(a, b, c) {
    if (b === 0) return `x=${formatFraction(-c, a)}`;
    if (a === 0) return `y=${formatFraction(-c, b)}`;
    return formatS121Line(a, b, c);
  }

  function formatS121VectorOffset(t, a, b) {
    return `${t >= 0 ? '+' : '-'}${Math.abs(t)}(${a},${b})`;
  }

  function formatS121ParamExpr(base, coeff, parameter) {
    const absCoeff = Math.abs(coeff);
    const coefText = absCoeff === 1 ? '' : `${absCoeff}`;
    const variablePart = coeff === 0 ? '' : `${coeff < 0 ? '-' : ''}${coefText}${parameter}`;
    if (base === 0) return variablePart || '0';
    const basePart = base > 0 ? `+${base}` : `${base}`;
    return `${variablePart}${basePart}`;
  }

  function formatS121ParamTerm(base, coeff, parameter, variable, isFirst = false) {
    const expr = formatS121ParamExpr(base, coeff, parameter);
    if (isFirst) return `(${expr})${variable}`;
    if (expr.startsWith('-')) return `-(${formatS121ParamExpr(-base, -coeff, parameter)})${variable}`;
    return `+(${expr})${variable}`;
  }

  function formatS121ParamConstant(base, coeff, parameter) {
    const expr = formatS121ParamExpr(base, coeff, parameter);
    if (expr === '0') return '';
    if (expr.startsWith('-')) return `-(${formatS121ParamExpr(-base, -coeff, parameter)})`;
    return `+(${expr})`;
  }

  function formatSquareSumText(a, b) {
    return `${Math.abs(a)}^2+${Math.abs(b)}^2`;
  }

  function positiveDivisors(n) {
    const values = [];
    for (let d = 1; d * d <= n; d += 1) {
      if (n % d !== 0) continue;
      values.push(d);
      if (d * d !== n) values.push(n / d);
    }
    return values.sort((a, b) => a - b);
  }

  function buildS121InterceptIntegerCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const yIntercept = randInt(2, 14);
      const px = randInt(4, 30);
      const product = yIntercept * px;
      const divisors = positiveDivisors(product);
      questions.push(
        `共有多少個正整數 \\(n\\)，使得通過 \\(A(-n,0)\\)、\\(B(0,${yIntercept})\\) 的直線也通過 \\(P(${px},k)\\)，其中 \\(k\\) 為正整數？`
      );
      answers.push(
        `簡答：${divisors.length} 個。過程：直線斜率為 \\(\\frac{${yIntercept}}{n}\\)，故 \\(x=${px}\\) 時 \\(k=${yIntercept}+\\frac{${product}}{n}\\)。要使 \\(k\\) 為整數，需 \\(n\\mid ${product}\\)。正因數為 ${divisors.join('、')}，共有 ${divisors.length} 個。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121LineSideParameterCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 5);
      const b = pickNonZero(-4, 4);
      const p = { x: randInt(-3, 4), y: randInt(-3, 5) };
      let q = { x: randInt(-4, 5), y: randInt(-4, 5) };
      let s1 = a * p.x + b * p.y;
      let s2 = a * q.x + b * q.y;
      while (s1 === s2 || Math.abs(s1 - s2) < 4 || Math.abs(s1 - s2) > 18) {
        q = { x: randInt(-4, 5), y: randInt(-4, 5) };
        s1 = a * p.x + b * p.y;
        s2 = a * q.x + b * q.y;
      }
      const low = Math.min(s1, s2);
      const high = Math.max(s1, s2);
      const integerValues = [];
      for (let k = low + 1; k <= high - 1; k += 1) integerValues.push(k);
      questions.push(
        `設 \\(k\\) 為整數，若兩點 \\(A${formatS121Point(p)}\\)、\\(B${formatS121Point(q)}\\) 位於直線 \\(${formatS121Line(a, b, 0).replace('=0', '-k=0')}\\) 的異側，求所有可能的 \\(k\\) 個數。`
      );
      answers.push(
        `簡答：${integerValues.length} 個。過程：令 \\(f(x,y)=${formatS121Term(a, 'x')}${b > 0 ? '+' : ''}${formatS121Term(b, 'y')}\\)。兩點異側表示 \\((f(A)-k)(f(B)-k)<0\\)，所以 \\(${low}<k<${high}\\)。整數 \\(k\\) 為 ${integerValues.join('、')}，共有 ${integerValues.length} 個。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function formatS121IndexedTerm(coef, base, index) {
    if (coef === 1) return `${base}_${index}`;
    if (coef === -1) return `-${base}_${index}`;
    return `${coef}${base}_${index}`;
  }

  function formatS121IndexedSum(beta, gamma, index) {
    if (beta < 0 && gamma > 0) {
      const first = formatS121IndexedTerm(gamma, 'b', index);
      const second = formatS121IndexedTerm(beta, 'a', index);
      return `${first}${second}`;
    }
    const first = formatS121IndexedTerm(beta, 'a', index);
    const second = formatS121IndexedTerm(gamma, 'b', index);
    return `${first}${gamma > 0 ? '+' : ''}${second}`;
  }

  function formatS121SimpleLinearXY(alpha, beta) {
    const xPart = formatS121Term(alpha, 'x');
    const yPart = formatS121Term(beta, 'y');
    return `${xPart}${beta > 0 ? '+' : ''}${yPart}`;
  }

  function buildS121TransformedSystemSolutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const transforms = [
      { alpha: 2, beta: 1, gamma: -3 },
      { alpha: 3, beta: -1, gamma: 2 },
      { alpha: 2, beta: 3, gamma: 4 },
      { alpha: 4, beta: -2, gamma: 3 },
      { alpha: 5, beta: 1, gamma: -2 },
    ];
    for (let i = 0; i < count; i += 1) {
      const t = transforms[i % transforms.length];
      const target = { x: randInt(-3, 4), y: pickNonZero(-3, 4) };
      const u = t.alpha * target.x + t.beta * target.y;
      const v = t.gamma * target.y;
      questions.push(
        `已知聯立方程式 \\(\\left\\{\\begin{array}{r}a_1x+b_1y=c_1\\\\a_2x+b_2y=c_2\\end{array}\\right.\\) 的解為 \\((${u},${v})\\)。求聯立方程式 \\(\\left\\{\\begin{array}{r}${formatS121IndexedTerm(t.alpha, 'a', 1)}x+(${formatS121IndexedSum(t.beta, t.gamma, 1)})y=c_1\\\\${formatS121IndexedTerm(t.alpha, 'a', 2)}x+(${formatS121IndexedSum(t.beta, t.gamma, 2)})y=c_2\\end{array}\\right.\\) 的解。`
      );
      answers.push(
        `簡答：\\((x,y)=(${target.x},${target.y})\\)。過程：新方程可看成把原方程中的 \\(x\\) 換成 \\(${formatS121SimpleLinearXY(t.alpha, t.beta)}\\)，把 \\(y\\) 換成 \\(${formatS121Term(t.gamma, 'y')}\\)。因此需滿足 \\(${formatS121SimpleLinearXY(t.alpha, t.beta)}=${u}\\)、\\(${formatS121Term(t.gamma, 'y')}=${v}\\)。解得 \\(y=${target.y}\\)，再代回得 \\(x=${target.x}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121ProjectionSymmetrySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const normals = [
      [1, 2],
      [2, -1],
      [3, -2],
      [2, 3],
      [1, -3],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = normals[i % normals.length];
      const foot = { x: randInt(-4, 5), y: randInt(-4, 5) };
      const t = randInt(1, 3) * (randInt(0, 1) ? 1 : -1);
      const p = { x: foot.x + a * t, y: foot.y + b * t };
      const q = { x: foot.x - a * t, y: foot.y - b * t };
      const c = -(a * foot.x + b * foot.y);
      const line = formatS121Line(a, b, c);
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`求點 \\(P${formatS121Point(p)}\\) 對直線 \\(L:${line}\\) 的投影點坐標。`);
        answers.push(
          `簡答：\\(${formatS121Point(foot)}\\)。過程：投影點在直線 \\(L\\) 上，且 \\(P\\) 到投影點的連線方向與 \\(L\\) 的法向量 \\((${a},${b})\\) 平行。由建構可寫 \\(P=${formatS121Point(foot)}${formatS121VectorOffset(t, a, b)}\\)，所以垂足為 \\(${formatS121Point(foot)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`求點 \\(P${formatS121Point(p)}\\) 關於直線 \\(L:${line}\\) 的對稱點坐標。`);
        answers.push(
          `簡答：\\(${formatS121Point(q)}\\)。過程：對稱軸上的中點就是垂足 \\(${formatS121Point(foot)}\\)。因為 \\(P=${formatS121Point(foot)}${formatS121VectorOffset(t, a, b)}\\)，反射後為 \\(${formatS121Point(foot)}${formatS121VectorOffset(-t, a, b)}=${formatS121Point(q)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(
          `直線 \\(L:${line}\\) 為線段 \\(AB\\) 的中垂線。已知 \\(A${formatS121Point(p)}\\)，求 \\(B\\) 點坐標。`
        );
        answers.push(
          `簡答：\\(B${formatS121Point(q)}\\)。過程：中垂線上的垂足是 \\(AB\\) 中點 \\(${formatS121Point(foot)}\\)，所以 \\(B\\) 是 \\(A\\) 關於 \\(L\\) 的對稱點，得 \\(B${formatS121Point(q)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(
          `光線經過 \\(A${formatS121Point(p)}\\)，碰到直線 \\(L:${line}\\) 後反射，反射後經過 \\(B${formatS121Point(q)}\\)。求反射點坐標。`
        );
        answers.push(
          `簡答：\\(${formatS121Point(foot)}\\)。過程：\\(A\\) 與 \\(B\\) 關於反射直線對稱時，連線 \\(AB\\) 與鏡面交點即為反射點。\\(A,B\\) 的中點為 \\(${formatS121Point(foot)}\\)，且在 \\(L\\) 上，所以反射點為 \\(${formatS121Point(foot)}\\)。`
        );
        continue;
      }
      questions.push(
        `點 \\(P${formatS121Point(p)}\\) 關於直線 \\(L:${line}\\) 的對稱點為 \\(Q\\)。求線段 \\(PQ\\) 的中點。`
      );
      answers.push(
        `簡答：\\(${formatS121Point(foot)}\\)。過程：對稱點連線 \\(PQ\\) 會垂直對稱軸，且被對稱軸平分，所以 \\(PQ\\) 的中點就是 \\(P\\) 在 \\(L\\) 上的投影點 \\(${formatS121Point(foot)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121PerpendicularBisectorSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const obliqueOffsets = [
      [1, 2],
      [2, 1],
      [1, -2],
      [2, -3],
      [3, 1],
      [3, -2],
    ];

    for (let i = 0; i < count; i += 1) {
      const midpoint = { x: randInt(-4, 4), y: randInt(-4, 4) };
      let ux = 0;
      let uy = 0;

      if (i % 5 === 1) {
        ux = randInt(1, 4);
      } else if (i % 5 === 2) {
        uy = randInt(1, 4);
      } else {
        [ux, uy] = obliqueOffsets[randInt(0, obliqueOffsets.length - 1)];
      }

      const pointA = { x: midpoint.x - ux, y: midpoint.y - uy };
      const pointB = { x: midpoint.x + ux, y: midpoint.y + uy };
      const normalized = normalizeS121LineCoefficients(ux, uy, -(ux * midpoint.x + uy * midpoint.y));
      const equation = formatS121BisectorEquation(normalized.a, normalized.b, normalized.c);

      questions.push(
        `已知 \\(A${formatS121Point(pointA)}\\)、\\(B${formatS121Point(pointB)}\\)，求線段 \\(AB\\) 的垂直平分線方程式。`
      );

      if (uy === 0) {
        answers.push(
          `簡答：\\(${equation}\\)。過程：線段 \\(AB\\) 的中點為 \\(M(${midpoint.x},${midpoint.y})\\)。因為 \\(AB\\) 為水平線，所以垂直平分線是過中點的鉛直線，故方程式為 \\(${equation}\\)。`
        );
        continue;
      }

      if (ux === 0) {
        answers.push(
          `簡答：\\(${equation}\\)。過程：線段 \\(AB\\) 的中點為 \\(M(${midpoint.x},${midpoint.y})\\)。因為 \\(AB\\) 為鉛直線，所以垂直平分線是過中點的水平線，故方程式為 \\(${equation}\\)。`
        );
        continue;
      }

      const slopeAB = formatFraction(uy, ux);
      const perpSlope = formatFraction(-ux, uy);
      answers.push(
        `簡答：\\(${equation}\\)。過程：線段 \\(AB\\) 的中點為 \\(M(${midpoint.x},${midpoint.y})\\)，\\(AB\\) 的斜率為 \\(${slopeAB}\\)，所以垂直平分線的斜率為 \\(${perpSlope}\\)。再取法向量為 \\((${normalized.a},${normalized.b})\\)，設中垂線為 \\(${formatS121Term(normalized.a, 'x')}${normalized.b > 0 ? '+' : ''}${formatS121Term(normalized.b, 'y')}+c=0\\)。代入中點 \\(M\\) 可得 \\(c=${normalized.c}\\)，所以方程式為 \\(${equation}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS121LineClusterFixedPointSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const p = { x: randInt(-4, 4), y: randInt(-4, 4) };
      const a0 = randInt(1, 4);
      const b0 = randInt(-4, 4) || 2;
      const a1 = randInt(-4, 4) || -1;
      const b1 = randInt(1, 4);
      if (a0 * b1 - a1 * b0 === 0) {
        i -= 1;
        continue;
      }
      const c0 = -(a0 * p.x + b0 * p.y);
      const c1 = -(a1 * p.x + b1 * p.y);
      const mode = i % 5;
      const parameter = mode % 2 === 0 ? 'k' : 'm';
      questions.push(
        `不論 \\(${parameter}\\) 為何實數，直線 \\(L:${formatS121ParamTerm(a0, a1, parameter, 'x', true)}${formatS121ParamTerm(b0, b1, parameter, 'y')}${formatS121ParamConstant(c0, c1, parameter)}=0\\) 恆過一定點，求此點坐標。`
      );
      answers.push(
        `簡答：\\(${formatS121Point(p)}\\)。過程：把含 \\(${parameter}\\) 與不含 \\(${parameter}\\) 的部分分開，得 \\(${formatS121Line(a0, b0, c0)}\\) 與 \\(${formatS121Line(a1, b1, c1)}\\)。兩式交點同時滿足所有 \\(${parameter}\\) 的直線，解得定點為 \\(${formatS121Point(p)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121TriangleNonexistenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const fr = (n, d) => {
      const f = makeFraction(n, d);
      return formatFraction(f.num, f.den);
    };
    const lineEq = (a, b, c) => `${s12VarTerm(a, 'x')}${b > 0 ? '+' : ''}${s12VarTerm(b, 'y')}=${c}`;
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 4) {
        // L1,L2 交於 P；L3:kx+y=c3。不能圍成三角形 ⇔ L3∥L1 或 L3∥L2 或 三線共點
        const px = pickNonZero(1, 5);
        const py = randInt(-4, 5);
        const a1 = pickNonZero(1, 3);
        const b1 = pickNonZero(-3, 3);
        let a2 = pickNonZero(1, 3);
        let b2 = pickNonZero(-3, 3);
        for (let g = 0; a1 * b2 - a2 * b1 === 0 && g < 40; g += 1) {
          a2 = pickNonZero(1, 3);
          b2 = pickNonZero(-3, 3);
        }
        const c1 = a1 * px + b1 * py;
        const c2 = a2 * px + b2 * py;
        const c3 = randInt(-6, 10);
        const list = [];
        const seen = new Set();
        for (const [n, d] of [
          [a1, b1],
          [a2, b2],
          [c3 - py, px],
        ]) {
          const f = makeFraction(n, d);
          const key = `${f.num}/${f.den}`;
          if (!seen.has(key)) {
            seen.add(key);
            list.push(formatFraction(f.num, f.den));
          }
        }
        questions.push(
          `設 \\(L_1:${lineEq(a1, b1, c1)}\\)、\\(L_2:${lineEq(a2, b2, c2)}\\)、\\(L_3:kx+y=${c3}\\)。若三線不能圍成三角形，求 \\(k\\) 的可能值。`
        );
        answers.push(
          `簡答：\\(k=${list.join(',')}\\)。過程：不能圍成三角形有「兩線平行」與「三線共點」兩種情形。\\(L_3\\) 斜率為 \\(-k\\)：與 \\(L_1\\) 平行得 \\(k=${fr(a1, b1)}\\)，與 \\(L_2\\) 平行得 \\(k=${fr(a2, b2)}\\)。又 \\(L_1,L_2\\) 交於 \\((${px},${py})\\)，代入 \\(L_3\\) 得 \\(k=${fr(c3 - py, px)}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // L1:x=p、L2:y=q、L3:x+ky=r 三線共點
        const p = pickNonZero(-5, 5);
        const q = pickNonZero(-5, 5);
        const r = randInt(-8, 8);
        questions.push(
          `三直線 \\(L_1:x=${p}\\)、\\(L_2:y=${q}\\)、\\(L_3:x+ky=${r}\\) 三線共點時不能圍成三角形，求 \\(k\\)。`
        );
        answers.push(
          `簡答：\\(k=${fr(r - p, q)}\\)。過程：\\(L_1,L_2\\) 交於 \\((${p},${q})\\)。代入 \\(L_3\\)：\\(${p}+k(${q})=${r}\\)，解得 \\(k=${fr(r - p, q)}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // 兩線平行 → 必不能圍成三角形
        const a = pickNonZero(1, 4);
        const b = pickNonZero(-4, 4);
        const c1 = randInt(-6, 6);
        let c2 = randInt(-6, 6);
        while (c2 === c1) c2 = randInt(-6, 6);
        const a3 = pickNonZero(1, 3);
        const c3 = randInt(-6, 6);
        questions.push(
          `三直線 \\(L_1:${lineEq(a, b, c1)}\\)、\\(L_2:${lineEq(a, b, c2)}\\)、\\(L_3:${s12VarTerm(a3, 'x')}+ky=${c3}\\) 是否可能圍成三角形？`
        );
        answers.push(
          `簡答：不能。過程：\\(L_1\\) 與 \\(L_2\\) 的 \\(x,y\\) 係數成同比例但常數不同（\\(${c1}\\ne${c2}\\)），故兩線平行且不重合。三條直線中只要已有兩線平行，就無法圍成三角形。`
        );
        continue;
      }

      // variant 3：線族恆過定點
      const px2 = randInt(-4, 5);
      const py2 = randInt(-4, 5);
      const s = px2 + py2;
      const t = px2 - py2;
      questions.push(`若 \\(L_k:(x+y-${s})+k(x-y-${t})=0\\) 與 \\(x=${px2}\\)、\\(y=${py2}\\) 三線共點，求 \\(k\\)。`);
      answers.push(
        `簡答：任意實數 \\(k\\)。過程：\\(x=${px2}\\) 與 \\(y=${py2}\\) 交於 \\((${px2},${py2})\\)。代入 \\(L_k\\)：\\((${px2}+${py2}-${s})+k(${px2}-${py2}-${t})=0+0\\cdot k=0\\)，對任意 \\(k\\) 都成立，所以 \\(L_k\\) 恆過此定點。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121InverseDistanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const triples = [
      [3, 4, 5],
      [4, 3, 5],
      [5, 12, 13],
      [12, 5, 13],
      [8, 15, 17],
      [6, 8, 10],
    ];
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // 斜率 p/q，與兩軸圍成面積 S ⇒ b²=2S·p/q
        const [p, q] = [randInt(1, 4), randInt(1, 4)];
        const bAbs = randInt(2, 8);
        const area = (bAbs * bAbs * q) / (2 * p);
        if (!Number.isInteger(area)) {
          i -= 1;
          continue;
        }
        questions.push(
          `設直線 \\(L\\) 的斜率為 \\(${formatFraction(p, q)}\\)，且與兩坐標軸圍成的三角形面積為 ${area}，求 \\(L\\) 的方程式。`
        );
        answers.push(
          `簡答：\\(${s12LineText(p, -q, q * bAbs)}\\) 或 \\(${s12LineText(p, -q, -q * bAbs)}\\)。過程：設 \\(y=${formatFraction(p, q)}x+b\\)，兩軸截距為 \\(-\\frac{${q}b}{${p}}\\) 與 \\(b\\)，面積 \\(=\\frac12\\left|-\\frac{${q}b^2}{${p}}\\right|=${area}\\)，得 \\(b^2=${bAbs * bAbs}\\)，所以 \\(b=\\pm${bAbs}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 平行線距離：|k-c1|/√(a²+b²)=d
        const [a, b, L] = triples[randInt(0, triples.length - 1)];
        const c1 = randInt(-6, 6);
        const d = randInt(1, 5);
        const k1 = c1 + d * L;
        const k2 = c1 - d * L;
        const lhs = `${s12VarTerm(a, 'x')}${-b > 0 ? '+' : ''}${s12VarTerm(-b, 'y')}`;
        questions.push(
          `已知平行線 \\(L_1:${lhs}${s12Signed(c1)}=0\\) 與 \\(L_2:${lhs}+k=0\\) 的距離為 ${d}，求 \\(k\\) 的可能值。`
        );
        answers.push(
          `簡答：\\(k=${k1}\\) 或 \\(k=${k2}\\)。過程：平行線距離 \\(d=\\frac{|k-(${c1})|}{\\sqrt{${a}^2+${b}^2}}=\\frac{|k-(${c1})|}{${L}}\\)。令其等於 ${d}，得 \\(|k-(${c1})|=${d * L}\\)，所以 \\(k=${k1}\\) 或 \\(${k2}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // 過定點且兩截距為正、面積指定
        const aInt = randInt(2, 9);
        const bInt = randInt(2, 9);
        const px = randInt(1, aInt - 1);
        const py = bInt - Math.round((bInt * px) / aInt);
        if ((bInt * px) % aInt !== 0) {
          i -= 1;
          continue;
        }
        const area = (aInt * bInt) / 2;
        if (!Number.isInteger(area)) {
          i -= 1;
          continue;
        }
        questions.push(
          `直線 \\(L\\) 通過點 \\((${px},${py})\\)，且與兩坐標軸圍成的三角形面積為 ${area}。若 \\(L\\) 的兩截距皆為正，求 \\(L\\)。`
        );
        answers.push(
          `簡答：\\(${s12LineText(bInt, aInt, -aInt * bInt)}\\)。過程：設截距式 \\(\\frac{x}{a}+\\frac{y}{b}=1\\)，由 \\(\\frac12ab=${area}\\) 得 \\(ab=${aInt * bInt}\\)。取 \\(a=${aInt},b=${bInt}\\)，代入 \\((${px},${py})\\) 得 \\(\\frac{${px}}{${aInt}}+\\frac{${py}}{${bInt}}=1\\) 成立，故 \\(\\frac{x}{${aInt}}+\\frac{y}{${bInt}}=1\\)，整理得 \\(${s12LineText(bInt, aInt, -aInt * bInt)}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        // 點到直線距離為指定值，求 k
        const [a, b, L] = triples[randInt(0, triples.length - 1)];
        const px = randInt(-5, 5);
        const py = randInt(-5, 5);
        const d = randInt(1, 4);
        const base = a * px + b * py;
        questions.push(
          `若點 \\(A(${px},${py})\\) 到直線 \\(L:${s12VarTerm(a, 'x')}${b > 0 ? '+' : ''}${s12VarTerm(b, 'y')}+k=0\\) 的距離為 ${d}，求 \\(k\\)。`
        );
        answers.push(
          `簡答：\\(k=${d * L - base}\\) 或 \\(k=${-d * L - base}\\)。過程：距離公式 \\(\\frac{|${base}+k|}{\\sqrt{${a}^2+${b}^2}}=\\frac{|${base}+k|}{${L}}=${d}\\)，所以 \\(|k+${base}|=${d * L}\\)，得 \\(k=${d * L - base}\\) 或 \\(${-d * L - base}\\)。`
        );
        continue;
      }

      // variant 4：過第二象限定點的最小面積（AM-GM）
      const u = randInt(2, 6);
      const v = randInt(2, 6);
      questions.push(`設直線 \\(L\\) 過點 \\((-${u},${v})\\)，且與坐標軸在第二象限圍成三角形面積最小，求最小面積。`);
      answers.push(
        `簡答：${2 * u * v}。過程：設負 \\(x\\) 截距長為 \\(a\\)、正 \\(y\\) 截距長為 \\(b\\)，直線為 \\(-\\frac{x}{a}+\\frac{y}{b}=1\\)。代入 \\((-${u},${v})\\) 得 \\(\\frac{${u}}{a}+\\frac{${v}}{b}=1\\)。由 AM-GM，\\(1\\ge2\\sqrt{\\frac{${u * v}}{ab}}\\)，即 \\(ab\\ge${4 * u * v}\\)，等號在 \\(\\frac{${u}}{a}=\\frac{${v}}{b}=\\frac12\\)（即 \\(a=${2 * u},b=${2 * v}\\)）成立。最小面積為 \\(\\frac12ab=${2 * u * v}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121GeometricOptimizationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const triples = [
      { a: 3, b: 4, c: 5 },
      { a: 5, b: 12, c: 13 },
      { a: 6, b: 8, c: 10 },
      { a: 8, b: 15, c: 17 },
    ];
    const pointText = (x, y) =>
      `(${typeof x === 'number' ? x : formatFractionObject(x)},${typeof y === 'number' ? y : formatFractionObject(y)})`;
    const differenceExpr = (variable, value) => {
      if (value === 0) return variable;
      return value > 0 ? `${variable}-${value}` : `${variable}+${-value}`;
    };
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const triple = triples[randInt(0, triples.length - 1)];
        const dx = triple.a;
        const sumY = triple.b;
        const ay = randInt(1, sumY - 1);
        const by = sumY - ay;
        const ax = randInt(-4, 4);
        const bx = ax + dx;
        questions.push(
          `設 \\(A(${ax},${ay}),B(${bx},${by})\\)，動點 \\(P(x,0)\\) 在 \\(x\\) 軸上移動，求 \\(PA+PB\\) 的最小值。`
        );
        answers.push(
          `簡答：${triple.c}。過程：將 \\(A\\) 對 \\(x\\) 軸反射為 \\(A\\prime(${ax},-${ay})\\)。\\(PA+PB=A\\prime P+PB\\)，最短為直線距離 \\(A\\prime B\\)，故最小值為 \\(\\sqrt{${dx}^2+${sumY}^2}=${triple.c}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const triple = triples[randInt(0, triples.length - 1)];
        const left = randInt(-6, -1);
        const right = left + triple.a;
        const p = randInt(1, triple.b - 1);
        const q = triple.b - p;
        questions.push(
          `求 \\(\\sqrt{(${differenceExpr('x', right)})^2+${p * p}}+\\sqrt{(${differenceExpr('x', left)})^2+${q * q}}\\) 的最小值。`
        );
        answers.push(
          `簡答：${triple.c}。過程：此式可看成 \\(P(x,0)\\) 到 \\(A(${right},${p})\\)、\\(B(${left},${q})\\) 的距離和。將 \\(A\\) 對 \\(x\\) 軸反射為 \\(A\\prime(${right},-${p})\\)，最小值為 \\(A\\prime B=\\sqrt{${triple.a}^2+${triple.b}^2}=${triple.c}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const x1 = randInt(-6, 2);
        const x2 = x1 + 2 * randInt(1, 5);
        const y1 = randInt(-4, 6);
        const y2 = randInt(-4, 6);
        const lineY = randInt(-3, 3);
        const midX = makeFraction(x1 + x2, 2);
        questions.push(
          `設 \\(A(${x1},${y1}),B(${x2},${y2})\\)，在直線 \\(y=${lineY}\\) 上找一點 \\(P\\)，使 \\(PA^2+PB^2\\) 最小。`
        );
        answers.push(
          `簡答：\\(P${pointText(midX, lineY)}\\)。過程：\\(PA^2+PB^2=2PM^2+\\frac12AB^2\\)，其中 \\(M\\) 是 \\(AB\\) 中點。要讓平方和最小，只需讓 \\(P\\) 是 \\(M\\) 到直線 \\(y=${lineY}\\) 的投影。中點的 \\(x\\) 坐標為 \\(${formatFractionObject(midX)}\\)，所以 \\(P${pointText(midX, lineY)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const x1 = randInt(-7, -1);
        const x2 = randInt(2, 8);
        const y1 = randInt(1, 6);
        const y2 = randInt(1, 6);
        const midX = makeFraction(x1 + x2, 2);
        questions.push(
          `在 \\(x\\) 軸上找點 \\(P\\)，使 \\(P\\) 到 \\(A(${x1},${y1})\\) 與 \\(B(${x2},${y2})\\) 的距離平方和最小。`
        );
        answers.push(
          `簡答：\\(P(${formatFractionObject(midX)},0)\\)。過程：距離平方和最小時，\\(P\\) 是兩點中點到 \\(x\\) 軸的投影。兩點中點的 \\(x\\) 坐標為 \\(\\frac{${x1}+${x2}}2=${formatFractionObject(midX)}\\)，所以 \\(P(${formatFractionObject(midX)},0)\\)。`
        );
        continue;
      }
      const triple = triples[randInt(0, triples.length - 1)];
      const xLine = randInt(-3, 3);
      const ax = xLine + randInt(1, 5);
      const ay = randInt(1, triple.b - 1);
      const by = triple.b - ay;
      const bx = ax + triple.a;
      const reflectedX = 2 * xLine - ax;
      const reflectedDx = bx - reflectedX;
      const reflectedDy = by - ay;
      const reflectedDistanceSquared = reflectedDx * reflectedDx + reflectedDy * reflectedDy;
      questions.push(
        `設 \\(A(${ax},${ay}),B(${bx},${by})\\)，動點 \\(P\\) 在直線 \\(x=${xLine}\\) 上移動，求 \\(PA+PB\\) 的最小值。`
      );
      answers.push(
        `簡答：\\(${formatRadical(reflectedDistanceSquared)}\\)。過程：將 \\(A\\) 對直線 \\(x=${xLine}\\) 反射為 \\(A\\prime(${reflectedX},${ay})\\)。\\(PA+PB=A\\prime P+PB\\)，最短為 \\(A\\prime B\\)。所以最小值為 \\(\\sqrt{${Math.abs(reflectedDx)}^2+${Math.abs(reflectedDy)}^2}=${formatRadical(reflectedDistanceSquared)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121TriangleCentersSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const fr = (n, d) => {
      const f = makeFraction(n, d);
      return formatFraction(f.num, f.den);
    };
    // 長度相同的整數向量（畢氏），用來造出整數外心
    const ringOf = (r) => {
      const out = [];
      for (let x = -r; x <= r; x += 1) {
        for (let y = -r; y <= r; y += 1) {
          if (x * x + y * y === r * r) out.push([x, y]);
        }
      }
      return out;
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const pts = [];
        for (let t = 0; t < 3; t += 1) pts.push([randInt(-6, 12), randInt(-6, 12)]);
        const sx = pts.reduce((s, p) => s + p[0], 0);
        const sy = pts.reduce((s, p) => s + p[1], 0);
        questions.push(
          `已知 \\(\\triangle ABC\\) 三頂點為 \\(A(${pts[0]}),B(${pts[1]}),C(${pts[2]})\\)，求重心 \\(G\\) 坐標。`
        );
        answers.push(
          `簡答：\\(G(${fr(sx, 3)},${fr(sy, 3)})\\)。過程：重心為三頂點坐標的平均，\\(G=\\left(\\frac{${pts.map((p) => p[0]).join('+')}}{3},\\frac{${pts.map((p) => p[1]).join('+')}}{3}\\right)=(${fr(sx, 3)},${fr(sy, 3)})\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 由圓上三整數點造外心
        const r = [5, 13, 25][randInt(0, 2)];
        const ring = ringOf(r);
        const ox = randInt(-4, 6);
        const oy = randInt(-4, 6);
        const idx = shuffle(ring.map((_, k) => k)).slice(0, 3);
        const P = idx.map((k) => [ox + ring[k][0], oy + ring[k][1]]);
        const cross = (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[1][1] - P[0][1]) * (P[2][0] - P[0][0]);
        if (cross === 0) {
          i -= 1;
          continue;
        }
        questions.push(
          `已知 \\(\\triangle ABC\\) 三頂點為 \\(A(${P[0]}),B(${P[1]}),C(${P[2]})\\)，求外心 \\(O\\) 坐標。`
        );
        answers.push(
          `簡答：\\(O(${ox},${oy})\\)。過程：外心到三頂點等距。可驗證 \\((${ox},${oy})\\) 到三點的距離皆為 ${r}，故外心為 \\((${ox},${oy})\\)，外接圓半徑 ${r}。`
        );
        continue;
      }

      if (variant === 2) {
        // 由三頂點造三邊直線，再求重心
        const P = [];
        for (let t = 0; t < 3; t += 1) P.push([randInt(-5, 8), randInt(-5, 8)]);
        const cross = (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[1][1] - P[0][1]) * (P[2][0] - P[0][0]);
        if (cross === 0) {
          i -= 1;
          continue;
        }
        const lineOf = (A, B) => {
          const a = B[1] - A[1];
          const b = A[0] - B[0];
          const c = a * A[0] + b * A[1];
          return `${s12VarTerm(a, 'x')}${b > 0 ? '+' : ''}${s12VarTerm(b, 'y')}=${c}`;
        };
        const sx = P.reduce((s, p) => s + p[0], 0);
        const sy = P.reduce((s, p) => s + p[1], 0);
        questions.push(
          `若三角形三邊所在直線為 \\(${lineOf(P[0], P[1])}\\)、\\(${lineOf(P[1], P[2])}\\)、\\(${lineOf(P[2], P[0])}\\)，求其重心。`
        );
        answers.push(
          `簡答：\\((${fr(sx, 3)},${fr(sy, 3)})\\)。過程：三頂點為三直線兩兩的交點，分別為 \\((${P[0]}),(${P[1]}),(${P[2]})\\)。重心為三者平均，得 \\((${fr(sx, 3)},${fr(sy, 3)})\\)。`
        );
        continue;
      }

      if (variant === 3) {
        // 內角平分線方向：兩邊取畢氏向量，單位向量相加
        const A = [randInt(-4, 6), randInt(-4, 6)];
        const dirs = [
          [3, 4, 5],
          [4, 3, 5],
          [5, 12, 13],
          [12, 5, 13],
          [8, 15, 17],
        ];
        const d1 = dirs[randInt(0, dirs.length - 1)];
        const d2 = dirs[randInt(0, dirs.length - 1)];
        const s1 = randInt(0, 1) ? 1 : -1;
        const s2 = randInt(0, 1) ? 1 : -1;
        const u1 = [(s1 * d1[0]) / d1[2], (s1 * d1[1]) / d1[2]];
        const u2 = [(s2 * d2[0]) / d2[2], -(s2 * d2[1]) / d2[2]];
        const t1 = randInt(1, 3);
        const t2 = randInt(1, 3);
        const B = [A[0] + s1 * d1[0] * t1, A[1] + s1 * d1[1] * t1];
        const C = [A[0] + s2 * d2[0] * t2, A[1] - s2 * d2[1] * t2];
        const vx = u1[0] + u2[0];
        const vy = u1[1] + u2[1];
        if (vx === 0 && vy === 0) {
          i -= 1;
          continue;
        }
        const den = d1[2] * d2[2];
        const nx = Math.round(vx * den);
        const ny = Math.round(vy * den);
        const g = gcd(Math.abs(nx), Math.abs(ny)) || 1;
        const dx = nx / g;
        const dy = ny / g;
        questions.push(
          `已知 \\(A(${A}),B(${B}),C(${C})\\)，求 \\(\\angle A\\) 的內角平分線方向向量（化為最簡整數比）。`
        );
        answers.push(
          `簡答：\\((${dx},${dy})\\)。過程：\\(\\overrightarrow{AB}\\) 與 \\(\\overrightarrow{AC}\\) 的長度分別為 ${d1[2] * t1} 與 ${d2[2] * t2}，其單位向量相加即為角平分線方向。化簡後可取 \\((${dx},${dy})\\)。`
        );
        continue;
      }

      // variant 4：x=0 與兩條對稱直線圍成的三角形內心
      const a4 = randInt(3, 6);
      const b4 = randInt(4, 8);
      const c4 = randInt(5, 15);
      const L = Math.round(Math.sqrt(a4 * a4 + b4 * b4));
      if (L * L !== a4 * a4 + b4 * b4) {
        i -= 1;
        continue;
      }
      // 內心在 y=0 上，x 滿足 x = (c4-a4x)/L  => x = c4/(L+a4)
      const xin = makeFraction(c4, L + a4);
      questions.push(
        `由直線 \\(x=0\\)、\\(${s12VarTerm(a4, 'x')}-${b4}y-${c4}=0\\)、\\(${s12VarTerm(a4, 'x')}+${b4}y-${c4}=0\\) 圍成三角形，求其內心。`
      );
      answers.push(
        `簡答：\\((${formatFraction(xin.num, xin.den)},0)\\)。過程：兩條斜邊關於 \\(x\\) 軸對稱，故內心在 \\(y=0\\) 上。設內心為 \\((x,0)\\)，到 \\(x=0\\) 的距離為 \\(x\\)，到斜邊的距離為 \\(\\frac{|${a4}x-${c4}|}{${L}}=\\frac{${c4}-${a4}x}{${L}}\\)。令兩者相等得 \\(x=\\frac{${c4}}{${L}+${a4}}=${formatFraction(xin.num, xin.den)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121InterceptConstraintsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const divisorCount = (n) => {
      let c = 0;
      const m = Math.abs(n);
      for (let d = 1; d <= m; d += 1) if (m % d === 0) c += 1;
      return c;
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const p = pickNonZero(1, 6);
        const q = pickNonZero(1, 6);
        questions.push(`求通過點 \\((${p},${q})\\)，且在兩軸上的截距相等之直線方程式。`);
        answers.push(
          `簡答：\\(${s12LineText(1, 1, -(p + q))}\\)（另有過原點的 \\(${s12LineText(q, -p, 0)}\\)）。過程：截距相等且不為 0 時可設 \\(\\frac{x}{a}+\\frac{y}{a}=1\\)，即 \\(x+y=a\\)。代入 \\((${p},${q})\\) 得 \\(a=${p + q}\\)。若兩截距皆為 0，則直線過原點，為 \\(${s12LineText(q, -p, 0)}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 過 (p,q)，兩截距乘積為 ab
        let a = pickNonZero(2, 8);
        let b = pickNonZero(2, 8);
        let p = 0;
        let q = 0;
        let ok = false;
        for (let g = 0; g < 60 && !ok; g += 1) {
          a = pickNonZero(2, 8) * (randInt(0, 1) ? 1 : -1);
          b = pickNonZero(2, 8);
          p = randInt(-6, 6);
          if (p === 0 || p === a) continue;
          const num = b * (a - p);
          if (num % a !== 0) continue;
          q = num / a;
          if (q === 0) continue;
          ok = true;
        }
        if (!ok) {
          i -= 1;
          continue;
        }
        questions.push(`一直線過點 \\((${p},${q})\\)，且在兩軸上之截距乘積為 ${a * b}，求此直線方程式之一。`);
        answers.push(
          `簡答：\\(${s12LineText(b, a, -a * b)}\\)。過程：設截距式 \\(\\frac{x}{a}+\\frac{y}{b}=1\\) 且 \\(ab=${a * b}\\)。取 \\(a=${a},b=${b}\\)，代入 \\((${p},${q})\\) 驗證 \\(\\frac{${p}}{${a}}+\\frac{${q}}{${b}}=1\\) 成立，整理得 \\(${s12LineText(b, a, -a * b)}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // 第一象限面積
        const a = randInt(2, 10);
        const b = randInt(2, 10);
        const p = randInt(1, a - 1);
        if ((b * p) % a !== 0) {
          i -= 1;
          continue;
        }
        const q = b - (b * p) / a;
        if (q <= 0) {
          i -= 1;
          continue;
        }
        const area = (a * b) / 2;
        if (!Number.isInteger(area)) {
          i -= 1;
          continue;
        }
        questions.push(`直線通過 \\((${p},${q})\\)，且與兩坐標軸在第一象限圍成三角形面積為 ${area}，求其方程式。`);
        answers.push(
          `簡答：\\(${s12LineText(b, a, -a * b)}\\)。過程：設截距式 \\(\\frac{x}{a}+\\frac{y}{b}=1\\)（\\(a,b>0\\)），面積 \\(\\frac12ab=${area}\\) 得 \\(ab=${a * b}\\)。取 \\(a=${a},b=${b}\\) 並代入 \\((${p},${q})\\) 成立，整理得 \\(${s12LineText(b, a, -a * b)}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        // x 截距 : y 截距 = m:n → 直線 n x + m y = n p + m q
        const m = randInt(1, 5);
        let n = randInt(1, 5);
        for (let g = 0; n === m && g < 20; g += 1) n = randInt(1, 5);
        const p = pickNonZero(-5, 5);
        const q = pickNonZero(-5, 5);
        const rhs = n * p + m * q;
        if (rhs === 0) {
          i -= 1;
          continue;
        }
        questions.push(`求通過點 \\((${p},${q})\\)，且 \\(x\\) 截距與 \\(y\\) 截距之比為 \\(${m}:${n}\\) 的直線。`);
        answers.push(
          `簡答：\\(${s12LineText(n, m, -rhs)}\\)。過程：設 \\(x\\) 截距為 \\(${m}t\\)、\\(y\\) 截距為 \\(${n}t\\)，則 \\(\\frac{x}{${m}t}+\\frac{y}{${n}t}=1\\)，即 \\(${n}x+${m}y=${m * n}t\\)。代入 \\((${p},${q})\\) 得 \\(${m * n}t=${rhs}\\)，所以直線為 \\(${s12LineText(n, m, -rhs)}\\)。`
        );
        continue;
      }

      // variant 4：兩截距皆為正整數的直線條數 = p·q 的正因數個數
      const p4 = randInt(2, 8);
      const q4 = randInt(2, 8);
      const cnt = divisorCount(p4 * q4);
      questions.push(
        `直線 \\(L\\) 通過 \\((${p4},${q4})\\)，且其 \\(x\\) 截距與 \\(y\\) 截距均為正整數，問此種直線共有幾條？`
      );
      answers.push(
        `簡答：${cnt} 條。過程：設截距為 \\(a,b\\)，則 \\(\\frac{${p4}}{a}+\\frac{${q4}}{b}=1\\)。令 \\(u=a-${p4}>0\\)，整理得 \\(b=${q4}+\\frac{${p4 * q4}}{u}\\)。故 \\(b\\) 為正整數 \\(\\iff u\\) 為 \\(${p4 * q4}\\) 的正因數，共 ${cnt} 個，因此有 ${cnt} 條。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121AnglesBetweenLinesSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // tan45=1：|(m-m0)/(1+m·m0)|=1 => m=(m0-1)/(1+m0) 或 (m0+1)/(1-m0)
    const fr = (f) => formatFraction(f.num, f.den);
    const two45 = (n0, d0) => {
      const A = makeFraction(n0 - d0, d0 + n0);
      const B = makeFraction(n0 + d0, d0 - n0);
      return [A, B];
    };
    const lineThrough = (mf, px, py) => {
      // y-py = (n/d)(x-px) => n x - d y + (d·py - n·px) = 0
      const n = mf.num;
      const d = mf.den;
      return s12LineText(n, -d, d * py - n * px);
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      let n0 = pickNonZero(1, 4);
      let d0 = pickNonZero(1, 4);
      for (let g = 0; (d0 + n0 === 0 || d0 - n0 === 0) && g < 40; g += 1) {
        n0 = pickNonZero(1, 4);
        d0 = pickNonZero(1, 4);
      }
      if (d0 + n0 === 0 || d0 - n0 === 0) {
        i -= 1;
        continue;
      }
      const [mA, mB] = two45(n0, d0);
      const slope0 = formatFraction(n0, d0);

      if (variant === 0) {
        const px = randInt(-4, 4);
        const py = randInt(-4, 4);
        questions.push(
          `求通過點 \\((${px},${py})\\)，且與直線 \\(${s12LineText(n0, -d0, 0)}\\) 成 \\(45^\\circ\\) 交角的直線方程式。`
        );
        answers.push(
          `簡答：\\(${lineThrough(mA, px, py)}\\) 或 \\(${lineThrough(mB, px, py)}\\)。過程：已知直線斜率 \\(m_0=${slope0}\\)。由 \\(\\tan45^\\circ=\\left|\\frac{m-m_0}{1+mm_0}\\right|=1\\)，解得 \\(m=${fr(mA)}\\) 或 \\(m=${fr(mB)}\\)，再分別過 \\((${px},${py})\\) 即得。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(`已知兩直線 \\(${s12LineText(n0, -d0, 0)}\\) 與 \\(${lineThrough(mA, 0, 0)}\\)，求其夾角。`);
        answers.push(
          `簡答：\\(45^\\circ\\)。過程：兩直線斜率分別為 \\(${slope0}\\) 與 \\(${fr(mA)}\\)。代入 \\(\\tan\\theta=\\left|\\frac{m_1-m_2}{1+m_1m_2}\\right|\\) 得 1，所以夾角為 \\(45^\\circ\\)。`
        );
        continue;
      }

      if (variant === 2) {
        const px = randInt(-4, 4);
        const py = randInt(-4, 4);
        questions.push(
          `直線 \\(L_1\\) 斜率為 \\(${slope0}\\)，直線 \\(L_2\\) 與 \\(L_1\\) 交角為 \\(45^\\circ\\)，且通過 \\((${px},${py})\\)，求 \\(L_2\\) 的方程式。`
        );
        answers.push(
          `簡答：\\(${lineThrough(mA, px, py)}\\) 或 \\(${lineThrough(mB, px, py)}\\)。過程：由 \\(\\left|\\frac{m-${slope0}}{1+${slope0}m}\\right|=1\\) 解得 \\(m=${fr(mA)}\\) 或 \\(${fr(mB)}\\)，再用點斜式過 \\((${px},${py})\\)。`
        );
        continue;
      }

      if (variant === 3) {
        questions.push(
          `求通過原點且與直線 \\(${s12LineText(n0, -d0, randInt(1, 6))}\\) 成 \\(45^\\circ\\) 角的直線方程式。`
        );
        answers.push(
          `簡答：\\(${lineThrough(mA, 0, 0)}\\) 或 \\(${lineThrough(mB, 0, 0)}\\)。過程：該直線斜率為 \\(${slope0}\\)（平移不改變斜率）。由 \\(\\tan45^\\circ\\) 公式解得兩斜率 \\(${fr(mA)}\\)、\\(${fr(mB)}\\)，過原點即得。`
        );
        continue;
      }

      // variant 4：y=mx 與 y=kx+c 交角 45°，求 m
      const c4 = pickNonZero(1, 6);
      questions.push(`若直線 \\(y=mx\\) 與 \\(y=${slope0}x${s12Signed(c4)}\\) 的交角為 \\(45^\\circ\\)，求 \\(m\\)。`);
      answers.push(
        `簡答：\\(m=${fr(mA)}\\) 或 \\(m=${fr(mB)}\\)。過程：由 \\(\\left|\\frac{m-${slope0}}{1+${slope0}m}\\right|=\\tan45^\\circ=1\\)，去絕對值得兩個方程，分別解得 \\(m=${fr(mA)}\\) 與 \\(m=${fr(mB)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121LightReflectionPathSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const fr = (n, d) => {
      const f = makeFraction(n, d);
      return formatFraction(f.num, f.den);
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        // 由 A 出發碰 x 軸再過 B：反射點 x=(a1·b2+b1·a2)/(a2+b2)
        const a1 = randInt(1, 8);
        const a2 = randInt(1, 8);
        const b1 = a1 + randInt(2, 12);
        const b2 = randInt(1, 8);
        const xr = fr(a1 * b2 + b1 * a2, a2 + b2);
        if (variant === 3) {
          questions.push(
            `撞球檯上白球在 \\((${a1},${a2})\\)，欲撞擊在 \\((${b1},${b2})\\) 的紅球，若先碰撞邊 \\(y=0\\)，求碰撞點。`
          );
        } else {
          questions.push(
            `光線從 \\(A(${a1},${a2})\\) 出發，先碰到 \\(x\\) 軸後反射並通過 \\(B(${b1},${b2})\\)，求反射點坐標。`
          );
        }
        answers.push(
          `簡答：\\((${xr},0)\\)。過程：把 \\(A\\) 對 \\(x\\) 軸鏡射得 \\(A'(${a1},${-a2})\\)。反射路徑等價於直線 \\(A'B\\)，其與 \\(x\\) 軸交點即為反射點，\\(x=\\frac{${a1}\\cdot${b2}+${b1}\\cdot${a2}}{${a2}+${b2}}=${xr}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 入射線 ax+by=c 射到 x 軸，反射線把 y 換成 -y
        const a = pickNonZero(1, 5);
        const b = pickNonZero(-5, 5);
        const c = randInt(-8, 8);
        const hitX = fr(c, a);
        questions.push(`一道光線沿 \\(${s12LineText(a, b, -c)}\\) 射向 \\(x\\) 軸，求反射後光線的方程式。`);
        answers.push(
          `簡答：\\(${s12LineText(a, -b, -c)}\\)。過程：對 \\(x\\) 軸反射相當於把方程式中的 \\(y\\) 換成 \\(-y\\)，得 \\(${s12LineText(a, -b, -c)}\\)。（入射點為 \\((${hitX},0)\\)。）`
        );
        continue;
      }

      if (variant === 2) {
        // 碰 y 軸：反射點 y=(a2·b1+b2·a1)/(a1+b1)
        const a1 = -randInt(1, 8);
        const a2 = randInt(1, 8);
        const b1 = randInt(1, 8);
        const b2 = randInt(1, 8);
        const yr = fr(a2 * b1 + b2 * -a1, -a1 + b1);
        questions.push(
          `光線從 \\(A(${a1},${a2})\\) 出發，先碰到 \\(y\\) 軸後反射並通過 \\(B(${b1},${b2})\\)，求反射點坐標。`
        );
        answers.push(
          `簡答：\\((0,${yr})\\)。過程：把 \\(A\\) 對 \\(y\\) 軸鏡射得 \\(A'(${-a1},${a2})\\)。反射路徑等價於直線 \\(A'B\\)，其與 \\(y\\) 軸交點的 \\(y\\) 坐標為 \\(\\frac{${a2}\\cdot${b1}+${b2}\\cdot${-a1}}{${-a1}+${b1}}=${yr}\\)。`
        );
        continue;
      }

      // variant 4：對 y=x 反射 → 交換 x,y（需 a≠b，否則反射後同一條線）
      const a4 = pickNonZero(1, 5);
      let b4 = pickNonZero(-5, 5);
      for (let g = 0; b4 === a4 && g < 40; g += 1) b4 = pickNonZero(-5, 5);
      const c4 = randInt(-9, 9);
      questions.push(`已知光線經 \\(y=x\\) 反射，入射光線為 \\(${s12LineText(a4, b4, -c4)}\\)，求反射光線的方程式。`);
      answers.push(
        `簡答：\\(${s12LineText(b4, a4, -c4)}\\)。過程：對 \\(y=x\\) 反射會交換 \\(x,y\\)。把原式中的 \\(x,y\\) 互換即得 \\(${s12LineText(b4, a4, -c4)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121AreaPartitioningSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const w = 2 * randInt(4, 10);
        const h = 2 * randInt(3, 8);
        const center = { x: w / 2, y: h / 2 };
        const dx = pickNonZero(-center.x + 1, center.x - 1);
        const dy = pickNonZero(-center.y + 1, center.y - 1);
        const point = { x: center.x + dx, y: center.y + dy };
        const slope = makeFraction(dy, dx);
        questions.push(
          `設 \\(A(0,0),B(${w},0),C(${w},${h}),D(0,${h})\\)，求過 \\(${formatS121Point(point)}\\) 且平分矩形 \\(ABCD\\) 面積的直線斜率。`
        );
        answers.push(
          `簡答：\\(${formatFractionObject(slope)}\\)。過程：矩形中心為 \\(${formatS121Point(center)}\\)。通過中心的直線會平分矩形面積，因此所求直線通過 \\(${formatS121Point(center)}\\) 與 \\(${formatS121Point(point)}\\)，斜率為 \\(\\frac{${point.y}-${center.y}}{${point.x}-${center.x}}=${formatFractionObject(slope)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const w = 2 * randInt(5, 12);
        const h = 2 * randInt(4, 10);
        const center = { x: w / 2, y: h / 2 };
        questions.push(
          `直線 \\(y=m(x-${center.x})+${center.y}\\) 平分矩形 \\([0,${w}]\\times[0,${h}]\\) 面積，求 \\(m\\) 的範圍。`
        );
        answers.push(
          `簡答：任意實數 \\(m\\)。過程：矩形中心為 \\(${formatS121Point(center)}\\)。題目中的直線不論 \\(m\\) 為何都通過中心，而矩形是中心對稱圖形，所以任一直線只要通過中心就會平分面積。`
        );
        continue;
      }
      if (mode === 2) {
        const a = 2 * randInt(3, 9);
        const b = 2 * randInt(3, 9);
        const midpoint = { x: a / 2, y: b / 2 };
        const slope = makeFraction(b, a);
        const slopeText = formatFractionObject(slope);
        const slopeTerm = slopeText === '1' ? 'x' : slopeText === '-1' ? '-x' : `${slopeText}x`;
        questions.push(`三角形頂點為 \\((0,0),(${a},0),(0,${b})\\)，求過原點且平分三角形面積的直線方程式。`);
        answers.push(
          `簡答：\\(y=${slopeTerm}\\)。過程：從頂點出發的中線會平分三角形面積。對邊端點 \\((${a},0),(0,${b})\\) 的中點為 \\(${formatS121Point(midpoint)}\\)，所以所求直線通過原點與此中點，方程式為 \\(y=${slopeTerm}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const u = randInt(5, 12);
        const v = randInt(1, 6);
        const h = 2 * randInt(3, 8);
        const center = { x: makeFraction(u + v, 2), y: h / 2 };
        questions.push(`給定平行四邊形三頂點 \\((0,0),(${u},0),(${u + v},${h})\\)，求過中心且平分面積的一條直線。`);
        answers.push(
          `簡答：例如 \\(y=${center.y}\\)。過程：第四點為 \\((${v},${h})\\)，中心為兩對角線中點 \\((\\frac{${u + v}}{2},${center.y})\\)。任一通過中心的直線都能平分平行四邊形面積，因此可取水平線 \\(y=${center.y}\\)。`
        );
        continue;
      }
      const h0 = randInt(-5, 5);
      const k0 = pickNonZero(-5, 5);
      questions.push(`坐標平面上有一個中心在 \\((${h0},${k0})\\) 的中心對稱區域，求平分此區域總面積的直線集合特徵。`);
      answers.push(
        `簡答：所有通過 \\((${h0},${k0})\\) 的直線。過程：中心對稱區域中，每個點都會有一個關於中心 \\((${h0},${k0})\\) 的對稱點。任何通過對稱中心的直線都會把成對的點分在兩側，因此兩側面積相等。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121LineSegmentSlopeRangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const fr = (f) => formatFraction(f.num, f.den);
    // 過定點 P 的直線與線段 AB 相交 ⇔ 斜率介於 slope(PA), slope(PB) 之間
    // （取 A,B 的 x 坐標都在 P 的同一側，避免鉛直線干擾）
    const build = () => {
      const px = randInt(-3, 3);
      const py = randInt(-3, 3);
      const ax = px + randInt(1, 5);
      const bx = px + randInt(1, 5);
      const ay = py + pickNonZero(-6, 6);
      const by = py + pickNonZero(-6, 6);
      const mA = makeFraction(ay - py, ax - px);
      const mB = makeFraction(by - py, bx - px);
      const vA = mA.num / mA.den;
      const vB = mB.num / mB.den;
      if (vA === vB) return null;
      const lo = vA < vB ? mA : mB;
      const hi = vA < vB ? mB : mA;
      return { px, py, ax, ay, bx, by, lo, hi };
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      let d = build();
      for (let g = 0; !d && g < 40; g += 1) d = build();
      if (!d) {
        i -= 1;
        continue;
      }
      const { px, py, ax, ay, bx, by, lo, hi } = d;

      if (variant === 0) {
        questions.push(
          `設 \\(A(${ax},${ay}),B(${bx},${by})\\)，直線 \\(L\\) 過 \\(P(${px},${py})\\) 且與線段 \\(AB\\) 相交，求其斜率 \\(m\\) 的範圍。`
        );
        answers.push(
          `簡答：\\(${fr(lo)}\\le m\\le${fr(hi)}\\)。過程：\\(\\overline{PA}\\) 的斜率為 \\(${fr(makeFraction(ay - py, ax - px))}\\)，\\(\\overline{PB}\\) 的斜率為 \\(${fr(makeFraction(by - py, bx - px))}\\)。過 \\(P\\) 的直線要掃過線段 \\(AB\\)，斜率須介於兩者之間，故 \\(${fr(lo)}\\le m\\le${fr(hi)}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(
          `設 \\(A(${ax},${ay}),B(${bx},${by})\\)，直線 \\(L:y=mx${s12Signed(py - 0)}\\)（過 \\((0,${py})\\)）。若 \\(L\\) 與線段 \\(AB\\) 相交，求 \\(m\\) 的範圍。`
        );
        const lo1 = makeFraction(ay - py, ax);
        const hi1 = makeFraction(by - py, bx);
        const v1 = lo1.num / lo1.den;
        const v2 = hi1.num / hi1.den;
        const L1 = v1 < v2 ? lo1 : hi1;
        const H1 = v1 < v2 ? hi1 : lo1;
        if (ax === 0 || bx === 0 || v1 === v2) {
          i -= 1;
          continue;
        }
        answers.push(
          `簡答：\\(${fr(L1)}\\le m\\le${fr(H1)}\\)。過程：\\(L\\) 恆過 \\((0,${py})\\)。該點到 \\(A\\) 的斜率為 \\(${fr(lo1)}\\)，到 \\(B\\) 的斜率為 \\(${fr(hi1)}\\)。相交需斜率介於兩者之間。`
        );
        continue;
      }

      if (variant === 2) {
        questions.push(
          `已知 \\(A(${ax},${ay}),B(${bx},${by})\\)，直線 \\(L:y-${py}=m(x-${px})\\) 與線段 \\(AB\\) 不相交，求 \\(m\\) 的範圍。`
        );
        answers.push(
          `簡答：\\(m<${fr(lo)}\\) 或 \\(m>${fr(hi)}\\)。過程：\\(L\\) 過定點 \\(P(${px},${py})\\)。與線段相交的條件為斜率介於 \\(\\overline{PA},\\overline{PB}\\) 的斜率之間，即 \\(${fr(lo)}\\le m\\le${fr(hi)}\\)。取其補集即為不相交的範圍。`
        );
        continue;
      }

      if (variant === 3) {
        questions.push(
          `若直線 \\(L\\) 斜率為 \\(m\\) 且通過 \\((${px},${py})\\)，要使 \\(L\\) 與連接 \\(A(${ax},${ay}),B(${bx},${by})\\) 的線段相交，求 \\(m\\) 的範圍。`
        );
        answers.push(
          `簡答：\\(${fr(lo)}\\le m\\le${fr(hi)}\\)。過程：以 \\((${px},${py})\\) 為軸心旋轉直線，當它從 \\(\\overline{PA}\\) 掃到 \\(\\overline{PB}\\) 時會經過線段上每一點。兩端斜率分別為 \\(${fr(makeFraction(ay - py, ax - px))}\\) 與 \\(${fr(makeFraction(by - py, bx - px))}\\)。`
        );
        continue;
      }

      // variant 4：L:mx-y+(c)=0 形式，過定點
      questions.push(
        `設直線 \\(L:mx-y${s12Signed(py - 0)}${px === 0 ? '' : `-${px}m`}=0\\)，若 \\(L\\) 與線段 \\(A(${ax},${ay}),B(${bx},${by})\\) 相交，求 \\(m\\) 的範圍。`
      );
      answers.push(
        `簡答：\\(${fr(lo)}\\le m\\le${fr(hi)}\\)。過程：把 \\(L\\) 改寫為 \\(y-${py}=m(x-${px})\\)，可見它恆過定點 \\((${px},${py})\\)。與線段 \\(AB\\) 相交需斜率介於 \\(${fr(lo)}\\) 與 \\(${fr(hi)}\\) 之間。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121PointLineSideSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const fr = (n, d) => {
      const f = makeFraction(n, d);
      return formatFraction(f.num, f.den);
    };
    const cmp = (n1, d1, n2, d2) => n1 * d2 * Math.sign(d1 * d2) - n2 * d1 * Math.sign(d1 * d2);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // A(p,q),B(r,s) 對 L:mx-y+c=0 異側；取 p,r 異號 => 解在兩根之外
        const p = -randInt(1, 4);
        const r = randInt(1, 4);
        const c = randInt(2, 8);
        let q = randInt(-3, 5);
        let s = randInt(-3, 5);
        while (q === c) q = randInt(-3, 5);
        while (s === c) s = randInt(-3, 5);
        const m1 = makeFraction(q - c, p);
        const m2 = makeFraction(s - c, r);
        const v1 = m1.num / m1.den;
        const v2 = m2.num / m2.den;
        const lo = v1 <= v2 ? m1 : m2;
        const hi = v1 <= v2 ? m2 : m1;
        questions.push(`已知 \\(A(${p},${q}),B(${r},${s})\\) 位於直線 \\(L:mx-y+${c}=0\\) 的異側，求 \\(m\\) 的範圍。`);
        answers.push(
          `簡答：\\(m<${formatFraction(lo.num, lo.den)}\\) 或 \\(m>${formatFraction(hi.num, hi.den)}\\)。過程：令 \\(f(x,y)=mx-y+${c}\\)，則 \\(f(A)=${p}m${s12Signed(c - q)}\\)、\\(f(B)=${r}m${s12Signed(c - s)}\\)。異側表示 \\(f(A)f(B)<0\\)；因 \\(x\\) 坐標 \\(${p}\\) 與 \\(${r}\\) 異號，\\(m^2\\) 係數為負，解為兩根之外，即 \\(m<${formatFraction(lo.num, lo.den)}\\) 或 \\(m>${formatFraction(hi.num, hi.den)}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 判斷兩點同側或異側
        const a = pickNonZero(1, 4);
        const b = pickNonZero(1, 4);
        const c = -randInt(6, 16);
        const px = randInt(-3, 4);
        const py = randInt(-3, 4);
        const f1 = a * px + b * py + c;
        const f2 = c;
        if (f1 === 0) {
          i -= 1;
          continue;
        }
        const same = f1 * f2 > 0;
        questions.push(
          `設 \\(P(${px},${py})\\) 與原點 \\(O(0,0)\\) 位於直線 \\(L:${s12VarTerm(a, 'x')}+${s12VarTerm(b, 'y')}${s12Signed(c)}=0\\) 的哪一側？判斷同側或異側。`
        );
        answers.push(
          `簡答：${same ? '同側' : '異側'}。過程：代入 \\(P\\) 得 \\(${f1}\\)，代入 \\(O\\) 得 \\(${f2}\\)。兩值${same ? '同號，所以兩點在同側' : '異號，所以兩點在異側'}。`
        );
        continue;
      }

      if (variant === 2) {
        // A(k,q) 與 B 同側 => 一次不等式
        const a = pickNonZero(1, 5);
        const b = -randInt(1, 5);
        const c = randInt(-6, 12);
        const q = randInt(-3, 4);
        const rx = randInt(-6, -2);
        const ry = randInt(1, 6);
        const fB = a * rx + b * ry + c;
        if (fB === 0) {
          i -= 1;
          continue;
        }
        const konst = b * q + c;
        const bound = makeFraction(-konst, a);
        const dirGreater = fB > 0 ? a > 0 : a < 0;
        questions.push(
          `若點 \\(A(k,${q})\\) 與 \\(B(${rx},${ry})\\) 在直線 \\(L:${s12VarTerm(a, 'x')}${b > 0 ? '+' : ''}${s12VarTerm(b, 'y')}${s12Signed(c)}=0\\) 的同側，求實數 \\(k\\) 的範圍。`
        );
        answers.push(
          `簡答：\\(k${dirGreater ? '>' : '<'}${formatFraction(bound.num, bound.den)}\\)。過程：令 \\(f(x,y)=${s12VarTerm(a, 'x')}${b > 0 ? '+' : ''}${s12VarTerm(b, 'y')}${s12Signed(c)}\\)。\\(f(A)=${a}k${s12Signed(konst)}\\)，\\(f(B)=${fB}\\)。同側需 \\(f(A)f(B)>0\\)，即 \\(${a}k${s12Signed(konst)}\\) 與 \\(${fB}\\) 同號，解得 \\(k${dirGreater ? '>' : '<'}${formatFraction(bound.num, bound.den)}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        // 哪些點與原點同半平面
        const a = pickNonZero(1, 4);
        const b = pickNonZero(1, 4);
        const c = -randInt(5, 12);
        const pts = [];
        const usedPt = new Set();
        for (let g = 0; pts.length < 4 && g < 200; g += 1) {
          const x = randInt(-3, 5);
          const y = randInt(-3, 6);
          const key = `${x},${y}`;
          if (usedPt.has(key)) continue;
          usedPt.add(key);
          pts.push([x, y]);
        }
        const vals = pts.map(([x, y]) => a * x + b * y + c);
        const originVal = c;
        const same = pts.filter((_, idx) => vals[idx] * originVal > 0);
        const onLine = pts.filter((_, idx) => vals[idx] === 0);
        questions.push(
          `已知直線 \\(L:${s12VarTerm(a, 'x')}+${s12VarTerm(b, 'y')}${s12Signed(c)}=0\\) 將平面分成兩半，判斷 \\(${pts.map(([x, y]) => `(${x},${y})`).join(',')}\\) 中哪些點與原點在同一個半平面。`
        );
        answers.push(
          `簡答：${same.length ? same.map(([x, y]) => `\\((${x},${y})\\)`).join('、') : '皆不在同一半平面'}。過程：原點代入得 \\(${originVal}\\)。各點代入依序得 \\(${vals.join(',')}\\)${onLine.length ? '（其中為 0 者落在直線上）' : ''}，與原點同號者即為所求。`
        );
        continue;
      }

      // variant 4：A,B 在 L:ax+by+k=0 兩側，求 k 範圍
      const a4 = pickNonZero(1, 4);
      const b4 = pickNonZero(-4, 4);
      const ax = randInt(-3, 4);
      const ay = randInt(-3, 4);
      let bx = randInt(-3, 5);
      let by = randInt(-3, 5);
      const k1 = -(a4 * ax + b4 * ay);
      let k2 = -(a4 * bx + b4 * by);
      for (let g = 0; k1 === k2 && g < 40; g += 1) {
        bx = randInt(-3, 5);
        by = randInt(-3, 5);
        k2 = -(a4 * bx + b4 * by);
      }
      const loK = Math.min(k1, k2);
      const hiK = Math.max(k1, k2);
      questions.push(
        `設 \\(A(${ax},${ay}),B(${bx},${by})\\) 在直線 \\(L:${s12VarTerm(a4, 'x')}${b4 > 0 ? '+' : ''}${s12VarTerm(b4, 'y')}+k=0\\) 的兩側，求 \\(k\\) 的範圍。`
      );
      answers.push(
        `簡答：\\(${loK}<k<${hiK}\\)。過程：令 \\(f(x,y)=${s12VarTerm(a4, 'x')}${b4 > 0 ? '+' : ''}${s12VarTerm(b4, 'y')}+k\\)。\\(f(A)=k${s12Signed(-k1)}\\)、\\(f(B)=k${s12Signed(-k2)}\\)。兩側表示 \\(f(A)f(B)<0\\)，即 \\((k${s12Signed(-k1)})(k${s12Signed(-k2)})<0\\)，解得 \\(${loK}<k<${hiK}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121LatticePointCountingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const countLattice = (test, xlo, xhi, ylo, yhi) => {
      let c = 0;
      for (let x = xlo; x <= xhi; x += 1) for (let y = ylo; y <= yhi; y += 1) if (test(x, y)) c += 1;
      return c;
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const X = randInt(4, 9);
        const Y = randInt(4, 9);
        const S = randInt(Math.max(2, Math.floor((X + Y) / 2)), X + Y);
        const n = countLattice((x, y) => x > 0 && x < X && y > 0 && y < Y && x + y <= S, 0, X, 0, Y);
        questions.push(`求滿足聯立不等式 \\(0<x<${X},\\ 0<y<${Y},\\ x+y\\leq${S}\\) 的區域內共有幾個格子點。`);
        answers.push(
          `簡答：${n} 個。過程：\\(x\\) 只能取 \\(1\\) 到 \\(${X - 1}\\)。對每個 \\(x\\)，\\(y\\) 需同時滿足 \\(1\\le y\\le${Y - 1}\\) 與 \\(y\\le${S}-x\\)，逐一計數合計 ${n} 個。`
        );
        continue;
      }

      if (variant === 1) {
        const a = randInt(1, 4);
        const C = randInt(6, 18);
        const n = countLattice((x, y) => x >= 0 && y >= 0 && a * x + y <= C, 0, C, 0, C);
        questions.push(
          `在 \\(x\\geq0,\\ y\\geq0,\\ ${s12VarTerm(a, 'x')}+y\\leq${C}\\) 圍成的區域中，共有幾個格子點。`
        );
        answers.push(
          `簡答：${n} 個。過程：\\(x\\) 由 0 取到 \\(\\lfloor${C}/${a}\\rfloor=${Math.floor(C / a)}\\)。對每個 \\(x\\)，\\(y\\) 可取 \\(0\\) 到 \\(${C}-${a}x\\)，共 \\(${C}-${a}x+1\\) 個，總和為 ${n}。`
        );
        continue;
      }

      if (variant === 2) {
        const p = randInt(1, 4);
        const q = randInt(1, 4);
        const b = randInt(1, 3);
        const C = p + b * q + randInt(4, 14);
        const n = countLattice((x, y) => x >= p && y >= q && x + b * y <= C, p, C, q, C);
        questions.push(`在 \\(x+${b}y\\leq${C},\\ x\\geq${p},\\ y\\geq${q}\\) 的區域內共有幾個格子點。`);
        answers.push(
          `簡答：${n} 個。過程：\\(y\\) 由 ${q} 取到 \\(\\lfloor(${C}-${p})/${b}\\rfloor\\)。對每個 \\(y\\)，\\(x\\) 可取 \\(${p}\\) 到 \\(${C}-${b}y\\)，逐一累加得 ${n} 個。`
        );
        continue;
      }

      if (variant === 3) {
        const C1 = randInt(4, 10);
        const a = randInt(2, 3);
        const C2 = randInt(C1, C1 + 8);
        const n = countLattice((x, y) => x >= 0 && y >= 0 && x + y <= C1 && a * x + y <= C2, 0, C2, 0, C2);
        questions.push(
          `求不等式組 \\(x+y\\leq${C1},\\ ${s12VarTerm(a, 'x')}+y\\leq${C2},\\ x\\geq0,\\ y\\geq0\\) 圍成區域的格子點總數。`
        );
        answers.push(
          `簡答：${n} 個。過程：對每個 \\(x\\ge0\\)，\\(y\\) 的上界為 \\(\\min(${C1}-x,\\ ${C2}-${a}x)\\)，下界為 0。逐一計數合計 ${n} 個。`
        );
        continue;
      }

      // variant 4：含負值範圍的三角區域
      const N = -randInt(1, 4);
      const M = randInt(1, 5);
      const K = randInt(4, 12);
      const n = countLattice((x, y) => x + 3 * y >= -K && x - y <= M && y <= N, -K - 10, K + 10, -K - 10, N);
      questions.push(`滿足 \\(x+3y\\geq-${K},\\ x-y\\leq${M},\\ y\\leq${N}\\) 的解區域中，求其格子點個數。`);
      answers.push(
        `簡答：${n} 個。過程：由 \\(y\\le${N}\\) 與 \\(x+3y\\ge-${K}\\) 可定出 \\(y\\) 的下界，對每個 \\(y\\)，\\(x\\) 需滿足 \\(-${K}-3y\\le x\\le${M}+y\\)，逐一計數合計 ${n} 個。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121AbsoluteInequalityAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const r = randInt(3, 9);
        const area = 2 * r * r;
        questions.push(`在坐標平面上畫出 \\(|x|+|y|\\leq${r}\\) 的圖形並求其面積。`);
        answers.push(
          `簡答：${area}。過程：\\(|x|+|y|\\leq${r}\\) 是以原點為中心的菱形，四個頂點為 \\((\\pm${r},0),(0,\\pm${r})\\)。兩條對角線長都是 ${2 * r}，所以面積為 \\(\\frac{${2 * r}\\cdot${2 * r}}{2}=${area}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        let a = 1;
        let b = 1;
        let c = 1;
        let d = -1;
        let det = -2;
        for (let attempt = 0; attempt < 100; attempt += 1) {
          a = randInt(1, 5);
          b = pickNonZero(-4, 4);
          c = pickNonZero(-4, 4);
          d = pickNonZero(-4, 4);
          det = a * d - b * c;
          if (det !== 0 && Math.abs(det) <= 20) break;
        }
        const r = randInt(2, 5);
        const s = randInt(2, 5);
        const area = makeFraction(4 * r * s, Math.abs(det));
        const determinantText = `${a * d}${-b * c >= 0 ? '+' : '-'}${Math.abs(b * c)}`;
        questions.push(
          `求不等式組 \\(|${formatS121Term(a, 'x')}${b > 0 ? '+' : ''}${formatS121Term(b, 'y')}|\\leq${r}\\) 與 \\(|${formatS121Term(c, 'x')}${d > 0 ? '+' : ''}${formatS121Term(d, 'y')}|\\leq${s}\\) 所圍成圖形的面積。`
        );
        answers.push(
          `簡答：\\(${formatFractionObject(area)}\\)。過程：令兩個絕對值內部為 \\(u,v\\)，則 \\(-${r}\\leq u\\leq${r}\\)、\\(-${s}\\leq v\\leq${s}\\)，在 \\(uv\\) 平面面積為 \\(${2 * r}\\cdot${2 * s}=${4 * r * s}\\)。變換行列式絕對值為 \\(|ad-bc|=|${determinantText}|=${Math.abs(det)}\\)，所以原面積為 \\(\\frac{${4 * r * s}}{${Math.abs(det)}}=${formatFractionObject(area)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const h = randInt(3, 8);
        const r = randInt(1, h - 1);
        const left = h - r;
        const right = h + r;
        const area = right * right - left * left;
        questions.push(`求 \\(|x|\\geq|y|\\) 與 \\(|x-${h}|\\leq${r}\\) 所圍成的區域面積。`);
        answers.push(
          `簡答：${area}。過程：\\(|x-${h}|\\leq${r}\\) 表示 \\(${left}\\leq x\\leq${right}\\)，此區間全在正向。又 \\(|x|\\geq|y|\\) 表示 \\(-x\\leq y\\leq x\\)，面積為 \\(\\int_{${left}}^{${right}}2x\\,dx=${right}^2-${left}^2=${area}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const r = randInt(3, 9);
        const k = randInt(2, 6);
        const area = makeFraction(2 * r * r * (k - 1), k);
        questions.push(`畫出 \\(|x|+${k}|y|>${r}\\) 且 \\(|x|+|y|<${r}\\) 的圖形區域並求面積。`);
        answers.push(
          `簡答：\\(${formatFractionObject(area)}\\)。過程：外層 \\(|x|+|y|<${r}\\) 面積為 \\(2\\cdot${r}^2=${2 * r * r}\\)。被挖掉的 \\(|x|+${k}|y|\\leq${r}\\) 頂點為 \\((\\pm${r},0),(0,\\pm${formatFraction(r, k)})\\)，面積為 \\(\\frac{2\\cdot${r}\\cdot2\\cdot${formatFraction(r, k)}}{2}=\\frac{${2 * r * r}}{${k}}\\)。相減得 \\(${formatFractionObject(area)}\\)。`
        );
        continue;
      }
      const a = randInt(1, 5);
      const b = randInt(1, 5);
      const c = randInt(2, 6) * a * b;
      const area = makeFraction(2 * c * c, a * b);
      const xTerm = formatS121Term(a, 'x');
      const yTerm = formatS121Term(b, 'y');
      questions.push(`求 \\(|${xTerm}|+|${yTerm}|\\leq${c}\\) 所圍成幾何圖形的面積。`);
      answers.push(
        `簡答：\\(${formatFractionObject(area)}\\)。過程：不等式可化為 \\(\\frac{|x|}{${formatFraction(c, a)}}+\\frac{|y|}{${formatFraction(c, b)}}\\leq1\\)，圖形是菱形。兩條對角線長為 \\(${formatFraction(2 * c, a)}\\) 與 \\(${formatFraction(2 * c, b)}\\)，面積為 \\(\\frac{${formatFraction(2 * c, a)}\\cdot${formatFraction(2 * c, b)}}{2}=${formatFractionObject(area)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121LineFormFactsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const samples = [
      { a: 3, b: 4, c: -12 },
      { a: 2, b: -5, c: 10 },
      { a: -4, b: 3, c: 24 },
      { a: 5, b: 2, c: -20 },
      { a: -3, b: -6, c: 18 },
    ];
    for (let i = 0; i < count; i += 1) {
      const base = samples[i % samples.length];
      const scale = randInt(1, 3);
      const a = base.a * scale;
      const b = base.b * scale;
      const c = base.c * scale;
      const slope = makeFraction(-a, b);
      const xIntercept = makeFraction(-c, a);
      const yIntercept = makeFraction(-c, b);
      const area = makeFraction(c * c, 2 * Math.abs(a * b));
      const line = formatS123LineEquation(a, b, c);
      questions.push(
        `已知直線 \\(L:${line}\\)，求斜率、\\(x\\) 截距、\\(y\\) 截距，以及它與兩坐標軸所圍三角形的面積。`
      );
      answers.push(
        `答案：斜率 \\(${formatFractionObject(slope)}\\)，\\(x\\) 截距 \\(${formatFractionObject(xIntercept)}\\)，\\(y\\) 截距 \\(${formatFractionObject(yIntercept)}\\)，面積 \\(${formatFractionObject(area)}\\)。解析：直線方程式 \\(${line}\\) 對應 \\(ax+by+c=0\\)，其中 \\(a=${a}\\)，\\(b=${b}\\)，\\(c=${c}\\)。由公式可得斜率 \\(-\\frac{a}{b}=-\\frac{${a}}{${b}}=${formatFractionObject(slope)}\\)；\\(x\\) 截距（令 \\(y=0\\)）為 \\(-\\frac{c}{a}=-\\frac{${c}}{${a}}=${formatFractionObject(xIntercept)}\\)；\\(y\\) 截距（令 \\(x=0\\)）為 \\(-\\frac{c}{b}=-\\frac{${c}}{${b}}=${formatFractionObject(yIntercept)}\\)。三角形面積為 \\(\\frac12\\left|x_0y_0\\right|=\\frac12\\left|${formatFractionObject(xIntercept)}\\right|\\left|${formatFractionObject(yIntercept)}\\right|=${formatFractionObject(area)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS121LinearFractionalRegionExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const s = randInt(2, 5);
      const p = s + randInt(3, 7);
      const q = s + randInt(2, 6);
      const u = randInt(1, 4);
      const v = randInt(2, 6);
      const vertices = [
        { x: s, y: 0 },
        { x: p, y: 0 },
        { x: 0, y: q },
        { x: 0, y: s },
      ];
      const values = vertices.map((point) => ({
        point,
        value: makeFraction(point.y + u, point.x + v),
      }));
      values.sort((left, right) => compareFractions(left.value, right.value));
      const min = values[0];
      const max = values[values.length - 1];
      const vertexText = vertices.map((point) => `(${point.x},${point.y})`).join('，');
      questions.push(
        `在 \\(x\\geq0\\)，\\(y\\geq0\\)，\\(x+y\\geq${s}\\)，\\(${q}x+${p}y\\leq${p * q}\\) 的條件下，求 \\(\\frac{y+${u}}{x+${v}}\\) 的最大值與最小值。`
      );
      answers.push(
        `答案：最大值 \\(${formatFractionObject(max.value)}\\)，最小值 \\(${formatFractionObject(min.value)}\\)。解析：可行區域的頂點為 ${vertexText}。因為分母 \\(x+${v}>0\\)，線性分式在此凸多邊形上的極值會出現在頂點。逐一代入比較，可得最大值在 \\((${max.point.x},${max.point.y})\\)，最小值在 \\((${min.point.x},${min.point.y})\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS122TwoCircleCommonTangentsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cases = [
      { r1: 3, r2: 2, d: 8, count: 4 },
      { r1: 3, r2: 2, d: 5, count: 3 },
      { r1: 5, r2: 3, d: 6, count: 2 },
      { r1: 5, r2: 2, d: 3, count: 1 },
      { r1: 6, r2: 2, d: 2, count: 0 },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const h = randInt(-5, 3);
      const k = randInt(-4, 4);
      const c1 = formatS122CircleStandard(h, k, item.r1 * item.r1);
      const c2 = formatS122CircleStandard(h + item.d, k, item.r2 * item.r2);
      const sum = item.r1 + item.r2;
      const diff = Math.abs(item.r1 - item.r2);
      questions.push(`兩圓 \\(C_1:${c1}\\)，\\(C_2:${c2}\\) 共有幾條公切線？`);
      answers.push(
        `答案：\\(${item.count}\\) 條。解析：兩圓圓心距 \\(d=${item.d}\\)，半徑和 \\(r_1+r_2=${sum}\\)，半徑差 \\(|r_1-r_2|=${diff}\\)。依序比較 \\(d\\) 與 \\(r_1+r_2\\)、\\(|r_1-r_2|\\)，即可判斷公切線條數。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function countCircleLineDistancePoints(radius, centerDistance, targetDistance) {
    const distances = [Math.abs(centerDistance - targetDistance), centerDistance + targetDistance];
    return distances.reduce((sum, distance) => {
      if (distance > radius) return sum;
      if (distance === radius) return sum + 1;
      return sum + 2;
    }, 0);
  }

  function buildS123CircleLineDistancePointCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cases = [
      { r: 4, d: 0, e: 2 },
      { r: 4, d: 2, e: 2 },
      { r: 4, d: 5, e: 1 },
      { r: 3, d: 6, e: 2 },
      { r: 5, d: 3, e: 2 },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const h = randInt(-4, 4);
      const k = randInt(-4, 4);
      const t = -3 * h - 4 * k + 5 * item.d;
      const line = formatS123LineEquation(3, 4, t);
      const circle = formatS122CircleStandard(h, k, item.r * item.r);
      const distances = [Math.abs(item.d - item.e), item.d + item.e];
      const total = countCircleLineDistancePoints(item.r, item.d, item.e);
      questions.push(`圓 \\(C:${circle}\\) 上，有幾個點到直線 \\(L:${line}\\) 的距離等於 \\(${item.e}\\)？`);
      answers.push(
        `答案：\\(${total}\\) 個。解析：圓心到 \\(L\\) 的距離為 \\(${item.d}\\)。距離 \\(L\\) 等於 \\(${item.e}\\) 的點落在兩條與 \\(L\\) 平行的直線上，這兩條直線到圓心的距離分別為 \\(${distances[0]}\\) 與 \\(${distances[1]}\\)。分別和半徑 \\(${item.r}\\) 比較：小於半徑有 2 點，等於半徑有 1 點，大於半徑沒有點。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function formatS122Point(point) {
    return `(${point.x},${point.y})`;
  }

  function formatS122SignedNumber(value) {
    if (value === 0) return '';
    return value < 0 ? `-${Math.abs(value)}` : `+${value}`;
  }

  function formatS122CoeffVar(coef, variable) {
    if (coef === 0) return '';
    const abs = Math.abs(coef);
    const body = abs === 1 ? variable : `${abs}${variable}`;
    return coef > 0 ? `+${body}` : `-${body}`;
  }

  function formatS122CircleGeneral(a, d, e, f) {
    const lead = a === 1 ? 'x^2+y^2' : `${a}x^2+${a}y^2`;
    const xTerm = formatS122CoeffVar(d, 'x');
    const yTerm = formatS122CoeffVar(e, 'y');
    const cTerm = f === 0 ? '' : formatS122SignedNumber(f);
    return `${lead}${xTerm}${yTerm}${cTerm}=0`;
  }

  function formatS122CircleStandard(h, k, r2) {
    const xPart = h === 0 ? 'x^2' : `(x${formatS122SignedNumber(-h)})^2`;
    const yPart = k === 0 ? 'y^2' : `(y${formatS122SignedNumber(-k)})^2`;
    return `${xPart}+${yPart}=${r2}`;
  }

  function formatS122CircleAnswer(h, k, r2) {
    return `圓心 \\(${formatS122Point({ x: h, y: k })}\\)，半徑 \\(${formatRadical(r2)}\\)`;
  }

  function formatS122CircleEquationFromCoeffs(a, d, e, f) {
    return formatS122CircleGeneral(a, d, e, f);
  }

  function formatS123LineEquation(a, b, c) {
    const parts = [];
    const pushTerm = (coef, variable) => {
      if (coef === 0) return;
      const abs = Math.abs(coef);
      const body = abs === 1 ? variable : `${abs}${variable}`;
      if (parts.length === 0) {
        parts.push(coef < 0 ? `-${body}` : body);
      } else {
        parts.push(coef < 0 ? `-${body}` : `+${body}`);
      }
    };
    pushTerm(a, 'x');
    pushTerm(b, 'y');
    if (c !== 0) {
      if (parts.length === 0) {
        parts.push(`${c}`);
      } else {
        parts.push(c < 0 ? `-${Math.abs(c)}` : `+${c}`);
      }
    }
    return `${parts.join('')}=0`;
  }

  function buildS122CircleCenterLineTwoPointsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const centerLines = [
      { a: 1, b: 2 },
      { a: 2, b: -1 },
      { a: 3, b: 1 },
      { a: 1, b: -3 },
      { a: 2, b: 3 },
    ];
    const offsets = [
      { x: 2, y: 1 },
      { x: 1, y: 3 },
      { x: 3, y: -2 },
      { x: 2, y: -3 },
      { x: 4, y: 1 },
    ];
    for (let i = 0; i < count; i += 1) {
      const center = { x: randInt(-3, 4), y: randInt(-3, 4) };
      const offset = offsets[i % offsets.length];
      const lineBase = centerLines[i % centerLines.length];
      const pointA = { x: center.x + offset.x, y: center.y + offset.y };
      const pointB = { x: center.x - offset.x, y: center.y - offset.y };
      const lineC = -(lineBase.a * center.x + lineBase.b * center.y);
      const radius2 = offset.x * offset.x + offset.y * offset.y;
      questions.push(
        `圓 \\(C\\) 的圓心在直線 \\(${formatS123LineEquation(lineBase.a, lineBase.b, lineC)}\\) 上，且通過 \\(A${formatS122Point(pointA)}\\)、\\(B${formatS122Point(pointB)}\\)。求圓 \\(C\\) 的方程式。`
      );
      answers.push(
        `簡答：\\(${formatS122CircleStandard(center.x, center.y, radius2)}\\)。過程：圓心必在線段 \\(AB\\) 的垂直平分線上。由 \\(A,B\\) 中點得 \\(M${formatS122Point(center)}\\)，且 \\(M\\) 也在已知直線上，所以圓心為 \\(${formatS122Point(center)}\\)。半徑平方為 \\(${formatSquareSumText(offset.x, offset.y)}=${radius2}\\)，故方程式為 \\(${formatS122CircleStandard(center.x, center.y, radius2)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS123ChordLengthParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const normals = [
      { a: 3, b: 4, norm: 5 },
      { a: 5, b: 12, norm: 13 },
      { a: 8, b: 15, norm: 17 },
      { a: 7, b: 24, norm: 25 },
      { a: 9, b: 12, norm: 15 },
    ];
    const pairs = [
      { r: 5, half: 4 },
      { r: 10, half: 8 },
      { r: 13, half: 5 },
      { r: 17, half: 8 },
      { r: 25, half: 7 },
    ];
    for (let i = 0; i < count; i += 1) {
      const normal = normals[i % normals.length];
      const pair = pairs[i % pairs.length];
      const center = { x: randInt(-3, 4), y: randInt(-3, 4) };
      const distance = Math.sqrt(pair.r * pair.r - pair.half * pair.half);
      const base = normal.a * center.x + normal.b * center.y;
      const t1 = base + normal.norm * distance;
      const t2 = base - normal.norm * distance;
      questions.push(
        `直線 \\(${normal.a}x${normal.b >= 0 ? '+' : ''}${normal.b}y=t\\) 與圓 \\(${formatS122CircleStandard(center.x, center.y, pair.r * pair.r)}\\) 相交的弦長為 ${2 * pair.half}，求 \\(t\\)。`
      );
      answers.push(
        `簡答：\\(t=${t1}\\) 或 \\(t=${t2}\\)。過程：弦長為 ${2 * pair.half}，半弦長為 ${pair.half}。圓半徑為 ${pair.r}，故圓心到直線距離 \\(d=\\sqrt{${pair.r}^2-${pair.half}^2}=${distance}\\)。圓心 \\(${formatS122Point(center)}\\) 到直線距離為 \\(\\frac{|${base}-t|}{${normal.norm}}\\)，所以 \\(|${base}-t|=${normal.norm * distance}\\)，得 \\(t=${t1}\\) 或 \\(t=${t2}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS123TangentPointCircleCoefficientSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const normals = [
      { a: 3, b: -4 },
      { a: 4, b: 3 },
      { a: 5, b: -12 },
      { a: 12, b: 5 },
      { a: 8, b: -15 },
    ];
    for (let i = 0; i < count; i += 1) {
      const normal = normals[i % normals.length];
      const point = { x: randInt(1, 6), y: randInt(-3, 4) };
      const lambda = randInt(1, 3);
      const center = { x: point.x + lambda * normal.a, y: point.y + lambda * normal.b };
      const dCoef = -2 * center.x;
      const eCoef = -2 * center.y;
      const radius2 = lambda * lambda * (normal.a * normal.a + normal.b * normal.b);
      const fCoef = center.x * center.x + center.y * center.y - radius2;
      const lineC = -(normal.a * point.x + normal.b * point.y);
      questions.push(
        `直線 \\(${formatS123LineEquation(normal.a, normal.b, lineC)}\\) 與圓 \\(x^2+y^2${formatS122SignedNumber(dCoef)}x+ay+b=0\\) 切於點 \\(${formatS122Point(point)}\\)，求 \\((a,b)\\)。`
      );
      answers.push(
        `簡答：\\((a,b)=(${eCoef},${fCoef})\\)。過程：切點到圓心的半徑垂直切線，所以圓心在過切點、方向為法向量 \\((${normal.a},${normal.b})\\) 的直線上。由 \\(x^2+y^2${formatS122SignedNumber(dCoef)}x+ay+b=0\\) 知圓心的 \\(x\\) 坐標為 \\(${-dCoef}/2=${center.x}\\)，因此圓心為 \\(${formatS122Point(center)}\\)。所以 \\(a=-2\\cdot${center.y}=${eCoef}\\)。再代入切點 \\(${formatS122Point(point)}\\) 到圓方程，得 \\(b=${fCoef}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS122GeneralToStandardSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const a = mode === 1 || mode === 2 || mode === 4 ? [2, 3, 5][randInt(0, 2)] : 1;
      const h = pickNonZero(-5, 5);
      const k = pickNonZero(-4, 4);
      const r = randInt(2, 8);
      const d = -2 * a * h;
      const e = -2 * a * k;
      const f = a * (h * h + k * k - r * r);
      const equation = formatS122CircleGeneral(a, d, e, f);
      const standard = formatS122CircleStandard(h, k, r * r);
      questions.push(`求方程式 \\(${equation}\\) 的圓心坐標與半徑。`);
      const divideText = a === 1 ? '二次項係數已為 1，直接配方' : `先將方程式同除以 \\(${a}\\)，再配方`;
      answers.push(
        `簡答：${formatS122CircleAnswer(h, k, r * r)}。過程：${divideText}得 \\(${standard}\\)。所以圓心為 \\(${formatS122Point({ x: h, y: k })}\\)，半徑為 \\(${r}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS122CircleDiscriminantParameterSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const fr = (n, d) => {
      const f = makeFraction(n, d);
      return formatFraction(f.num, f.den);
    };
    const ringOf = (r) => {
      const out = [];
      for (let x = -r; x <= r; x += 1) for (let y = -r; y <= r; y += 1) if (x * x + y * y === r * r) out.push([x, y]);
      return out;
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // x²+y²+dx+ey+(f-2k)=0：r²=(d²+e²)/4-f+2k
        const d = 2 * pickNonZero(-4, 4);
        const e = 2 * pickNonZero(-4, 4);
        const f = randInt(-6, 8);
        const thr = makeFraction(4 * f - d * d - e * e, 8);
        questions.push(
          `討論方程式 \\(x^2+y^2${s12Signed(d)}x${s12Signed(e)}y${s12Signed(f)}-2k=0\\) 隨 \\(k\\) 值變化的圖形意義。`
        );
        answers.push(
          `簡答：當 \\(k>${formatFraction(thr.num, thr.den)}\\) 為圓；\\(k=${formatFraction(thr.num, thr.den)}\\) 為一點；\\(k<${formatFraction(thr.num, thr.den)}\\) 無圖形。過程：配方後 \\(r^2=\\frac{${d}^2+${e}^2}{4}-(${f}-2k)=2k${s12Signed((d * d + e * e) / 4 - f)}\\)。由 \\(r^2>0,=0,<0\\) 分別得三種情形。`
        );
        continue;
      }

      if (variant === 1) {
        // 代表一點：r²=0
        const d = 2 * pickNonZero(-4, 4);
        const k0 = randInt(-3, 5);
        const c = k0 * k0 - k0 + (d * d) / 4;
        const other = 1 - k0;
        const roots = k0 === other ? `${k0}` : `${Math.min(k0, other)}` + ` 或 ` + `${Math.max(k0, other)}`;
        questions.push(`若 \\(x^2+y^2${s12Signed(d)}x-2ky+(k${s12Signed(c)})=0\\) 代表一個點，求 \\(k\\) 之值。`);
        answers.push(
          `簡答：\\(k=${roots}\\)。過程：配方得 \\(r^2=\\frac{${d}^2}{4}+k^2-(k${s12Signed(c)})=k^2-k+${(d * d) / 4 - c}\\)。代表一點需 \\(r^2=0\\)，解 \\(k^2-k+${(d * d) / 4 - c}=0\\) 得 \\(k=${roots}\\)。`
        );
        continue;
      }

      if (variant === 2 || variant === 3) {
        // x²+y²+2(m+a)x-2my+(3m²+c)=0 => r²=-m²+2am+a²-c，根為 a±s（c=2a²-s²）
        const a = pickNonZero(-4, 4);
        const s = randInt(1, 5);
        const c = 2 * a * a - s * s;
        const lo = a - s;
        const hi = a + s;
        const body = `x^2+y^2+2(m${s12Signed(a)})x-2my+(3m^2${s12Signed(c)})=0`;
        if (variant === 2) {
          questions.push(`若 \\(${body}\\) 的圖形為一圓，求 \\(m\\) 的範圍。`);
          answers.push(
            `簡答：\\(${lo}<m<${hi}\\)。過程：配方得 \\(r^2=(m${s12Signed(a)})^2+m^2-(3m^2${s12Signed(c)})=-m^2+${2 * a}m+${a * a - c}\\)。為圓需 \\(r^2>0\\)，即 \\(m^2-${2 * a}m-${a * a - c}<0\\)，解得 \\(${lo}<m<${hi}\\)。`
          );
        } else {
          questions.push(`若 \\(${body}\\) 的圖形為一圓，當 \\(m\\) 為何值時此圓面積最大？`);
          answers.push(
            `簡答：\\(m=${a}\\)，此時 \\(r^2=${s * s}\\)，最大面積為 \\(${s * s}\\pi\\)。過程：\\(r^2=-m^2+${2 * a}m+${a * a - c}=-(m${s12Signed(-a)})^2+${s * s}\\)，在 \\(m=${a}\\) 時取最大值 \\(${s * s}\\)。`
          );
        }
        continue;
      }

      // variant 4：圓系恆過兩定點
      const r = [5, 13][randInt(0, 1)];
      const ring = ringOf(r);
      const pick = shuffle(ring.map((_, k) => k)).slice(0, 2);
      const P1 = ring[pick[0]];
      const P2 = ring[pick[1]];
      if (P1[0] === P2[0] && P1[1] === P2[1]) {
        i -= 1;
        continue;
      }
      const la = P2[1] - P1[1];
      const lb = P1[0] - P2[0];
      const lc = la * P1[0] + lb * P1[1];
      const g0 = gcd(gcd(Math.abs(la), Math.abs(lb)), Math.abs(lc)) || 1;
      const sgn = la !== 0 ? Math.sign(la) : Math.sign(lb);
      const A = (la / g0) * sgn;
      const B = (lb / g0) * sgn;
      const C = (lc / g0) * sgn;
      // 顯示：x²+y² + A·kx + B·ky + (-C)·k - r² = 0
      const kTerm = (coef, tail) => {
        if (coef === 0) return '';
        const mag = Math.abs(coef) === 1 ? '' : `${Math.abs(coef)}`;
        return `${coef > 0 ? '+' : '-'}${mag}${tail}`;
      };
      questions.push(
        `已知圓系 \\(x^2+y^2${kTerm(A, 'kx')}${kTerm(B, 'ky')}${kTerm(-C, 'k')}-${r * r}=0\\) 恆通過兩定點，求這兩定點。`
      );
      answers.push(
        `簡答：\\((${P1}),(${P2})\\)。過程：把方程式依 \\(k\\) 分組為 \\((x^2+y^2-${r * r})+k(${s12VarTerm(A, 'x')}${B > 0 ? '+' : ''}${s12VarTerm(B, 'y')}${s12Signed(-C)})=0\\)。要對所有 \\(k\\) 成立，需同時滿足 \\(x^2+y^2=${r * r}\\) 與 \\(${s12VarTerm(A, 'x')}${B > 0 ? '+' : ''}${s12VarTerm(B, 'y')}=${C}\\)，解得兩交點 \\((${P1}),(${P2})\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS122CircleFromConditionsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const ringOf = (r) => {
      const out = [];
      for (let x = -r; x <= r; x += 1) for (let y = -r; y <= r; y += 1) if (x * x + y * y === r * r) out.push([x, y]);
      return out;
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // 直徑兩端點（同奇偶保證中點為整數）
        const hx = randInt(-5, 5);
        const hy = randInt(-5, 5);
        const dx = pickNonZero(-5, 5);
        const dy = pickNonZero(-5, 5);
        const A = [hx - dx, hy - dy];
        const B = [hx + dx, hy + dy];
        const R = dx * dx + dy * dy;
        questions.push(`求以點 \\(A(${A})\\)、\\(B(${B})\\) 為直徑兩端點的圓方程式。`);
        answers.push(
          `簡答：\\(${s12CircleStandard(hx, hy, R)}\\)。過程：圓心為 \\(AB\\) 中點 \\((${hx},${hy})\\)，半徑為 \\(\\frac12\\overline{AB}\\)，故 \\(r^2=\\left(\\frac{\\overline{AB}}2\\right)^2=${dx}^2+${dy}^2=${R}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 圓心在直線上且與兩軸相切：|h|=|k|=r
        const r = randInt(2, 8);
        const sh = randInt(0, 1) ? 1 : -1;
        const sk = randInt(0, 1) ? 1 : -1;
        const h = sh * r;
        const k = sk * r;
        const a = pickNonZero(-4, 4);
        const b = pickNonZero(-4, 4);
        const c = a * h + b * k;
        questions.push(
          `求圓心在直線 \\(${s12LineText(a, b, -c)}\\) 上，且與 \\(x\\) 軸及 \\(y\\) 軸都相切的圓方程式。`
        );
        answers.push(
          `簡答：\\(${s12CircleStandard(h, k, r * r)}\\)。過程：與兩軸都相切表示 \\(|h|=|k|=r\\)。代入圓心所在直線 \\(${a}h${b > 0 ? '+' : ''}${b}k=${c}\\)，可解得 \\(h=${h},k=${k}\\)，半徑 \\(r=${r}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // 過三點：由圓上三整數點反推
        const r = [5, 13, 25][randInt(0, 2)];
        const ring = ringOf(r);
        const ox = randInt(-4, 6);
        const oy = randInt(-4, 6);
        const idx = shuffle(ring.map((_, k) => k)).slice(0, 3);
        const P = idx.map((k) => [ox + ring[k][0], oy + ring[k][1]]);
        const cross = (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[1][1] - P[0][1]) * (P[2][0] - P[0][0]);
        if (cross === 0) {
          i -= 1;
          continue;
        }
        questions.push(`求通過三點 \\(P(${P[0]})\\)、\\(Q(${P[1]})\\)、\\(R(${P[2]})\\) 的圓方程式。`);
        answers.push(
          `簡答：\\(${s12CircleStandard(ox, oy, r * r)}\\)。過程：設圓為 \\((x-h)^2+(y-k)^2=r^2\\)，代入三點解聯立（或求兩條弦的中垂線交點）得圓心 \\((${ox},${oy})\\)、半徑 ${r}。`
        );
        continue;
      }

      if (variant === 3) {
        // 圓心在 y 軸上且過兩點
        const r = [5, 13, 25][randInt(0, 2)];
        const ring = ringOf(r).filter(([x]) => x !== 0);
        const oy = randInt(-4, 8);
        const idx = shuffle(ring.map((_, k) => k)).slice(0, 2);
        const P = idx.map((k) => [ring[k][0], oy + ring[k][1]]);
        if (P[0][0] === P[1][0] && P[0][1] === P[1][1]) {
          i -= 1;
          continue;
        }
        questions.push(`圓心在 \\(y\\) 軸上，且通過兩點 \\((${P[0]})\\)、\\((${P[1]})\\)，求其方程式。`);
        answers.push(
          `簡答：\\(${s12CircleStandard(0, oy, r * r)}\\)。過程：設圓心為 \\((0,k)\\)，由到兩點距離相等解得 \\(k=${oy}\\)，再代入任一點得 \\(r^2=${r * r}\\)。`
        );
        continue;
      }

      // variant 4：同心圓，周長為原來的 1/n
      const h4 = randInt(-5, 5);
      const k4 = randInt(-5, 5);
      const n = [2, 3, 4][randInt(0, 2)];
      const r4 = n * randInt(1, 4);
      const rNew = r4 / n;
      questions.push(
        `求與圓 \\(${s12CircleStandard(h4, k4, r4 * r4)}\\) 同圓心，且圓周長為其 \\(\\frac1{${n}}\\) 的圓。`
      );
      answers.push(
        `簡答：\\(${s12CircleStandard(h4, k4, rNew * rNew)}\\)。過程：圓周長與半徑成正比，故新半徑為 \\(\\frac{${r4}}{${n}}=${rNew}\\)，圓心不變，得 \\(${s12CircleStandard(h4, k4, rNew * rNew)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS122ApolloniusCircleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // |PA|:|PB|=m:n (m≠n)。取 A=(tx,ty)、B=A+(D·s,0)，D=n²-m²
    // 則圓心 = A+(-m²s,0)，半徑 = m·n·s
    const build = () => {
      const pairs = [
        [1, 2],
        [2, 3],
        [1, 3],
        [3, 4],
        [2, 5],
        [3, 5],
      ];
      const [m, n] = pairs[randInt(0, pairs.length - 1)];
      const D = n * n - m * m;
      const s = randInt(1, 3);
      const tx = randInt(-5, 5);
      const ty = randInt(-5, 5);
      const A = [tx, ty];
      const B = [tx + D * s, ty];
      const C = [tx - m * m * s, ty];
      const r = m * n * s;
      return { m, n, A, B, C, r };
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const { m, n, A, B, C, r } = build();

      if (variant === 0) {
        questions.push(
          `求平面上滿足 \\(\\overline{PA}:\\overline{PB}=${m}:${n}\\) 的點 \\(P\\) 之軌跡方程式，其中 \\(A(${A})\\)、\\(B(${B})\\)。`
        );
        answers.push(
          `簡答：\\(${s12CircleStandard(C[0], C[1], r * r)}\\)。過程：設 \\(P(x,y)\\)，由 \\(${n}^2\\overline{PA}^2=${m}^2\\overline{PB}^2\\) 展開整理（阿波羅尼斯圓），得圓心 \\((${C})\\)、半徑 ${r}，即 \\(${s12CircleStandard(C[0], C[1], r * r)}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(
          `已知 \\(A(${A})\\)、\\(B(${B})\\)，求滿足 \\(${n}\\overline{PA}=${m}\\overline{PB}\\) 的點 \\(P\\) 之軌跡。`
        );
        answers.push(
          `簡答：圓 \\(${s12CircleStandard(C[0], C[1], r * r)}\\)。過程：條件等價於 \\(\\overline{PA}:\\overline{PB}=${m}:${n}\\)。平方後展開整理，得圓心 \\((${C})\\)、半徑 ${r} 的圓。`
        );
        continue;
      }

      if (variant === 2) {
        questions.push(
          `設 \\(A(${A})\\)、\\(B(${B})\\)，點 \\(P\\) 滿足 \\(\\overline{PA}:\\overline{PB}=${m}:${n}\\)，求此軌跡圓的圓心與半徑。`
        );
        answers.push(
          `簡答：圓心 \\((${C})\\)，半徑 ${r}。過程：阿波羅尼斯圓的圓心在直線 \\(AB\\) 上，由內分點與外分點為直徑兩端可得圓心 \\((${C})\\)、半徑 ${r}。`
        );
        continue;
      }

      if (variant === 3) {
        questions.push(
          `設 \\(A(${A})\\)、\\(B(${B})\\)，求滿足 \\(\\overline{PA}:\\overline{PB}=${m}:${n}\\) 的軌跡所圍面積。`
        );
        answers.push(
          `簡答：\\(${r * r}\\pi\\)。過程：軌跡為半徑 ${r} 的阿波羅尼斯圓（圓心 \\((${C})\\)），面積為 \\(\\pi r^2=${r * r}\\pi\\)。`
        );
        continue;
      }

      // variant 4：驗證特定點是否在軌跡上
      const onX = C[0] + r;
      questions.push(
        `設 \\(A(${A})\\)、\\(B(${B})\\)，判斷點 \\(Q(${onX},${C[1]})\\) 是否滿足 \\(\\overline{QA}:\\overline{QB}=${m}:${n}\\)。`
      );
      answers.push(
        `簡答：是。過程：滿足該比例的點形成圓 \\(${s12CircleStandard(C[0], C[1], r * r)}\\)。\\(Q(${onX},${C[1]})\\) 到圓心 \\((${C})\\) 的距離恰為 ${r}，故 \\(Q\\) 在此圓上，符合比例條件。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS122RadicalAxisSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // 造兩個都通過 P1,P2 的圓（P1,P2 取同奇偶，保證中點為整數）
    const twoCircles = () => {
      const mx = randInt(-4, 5);
      const my = randInt(-4, 5);
      const dx = pickNonZero(-4, 4);
      const dy = randInt(-4, 4);
      if (dx === 0 && dy === 0) return null;
      const P1 = [mx - dx, my - dy];
      const P2 = [mx + dx, my + dy];
      // 中垂線方向 (-dy,dx)
      let t1 = pickNonZero(-3, 3);
      let t2 = pickNonZero(-3, 3);
      if (t1 === t2) t2 = t1 + 1;
      const O1 = [mx - dy * t1, my + dx * t1];
      const O2 = [mx - dy * t2, my + dx * t2];
      const r1 = (O1[0] - P1[0]) ** 2 + (O1[1] - P1[1]) ** 2;
      const r2 = (O2[0] - P1[0]) ** 2 + (O2[1] - P1[1]) ** 2;
      return { P1, P2, O1, O2, r1, r2, mx, my, chord2: 4 * (dx * dx + dy * dy) };
    };
    const lineOf = (P1, P2) => {
      const a = P2[1] - P1[1];
      const b = P1[0] - P2[0];
      const c = a * P1[0] + b * P1[1];
      return s12LineText(a, b, -c);
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      let d = twoCircles();
      for (let g = 0; !d && g < 30; g += 1) d = twoCircles();
      if (!d) {
        i -= 1;
        continue;
      }
      const { P1, P2, O1, O2, r1, r2, mx, my, chord2 } = d;

      if (variant === 0) {
        questions.push(
          `求二圓 \\(C_1:${s12CircleGeneral(O1[0], O1[1], r1)}\\) 與 \\(C_2:${s12CircleGeneral(O2[0], O2[1], r2)}\\) 的公共弦方程式。`
        );
        answers.push(
          `簡答：\\(${lineOf(P1, P2)}\\)。過程：兩圓方程式相減即得公共弦（根軸）所在直線，化簡後為 \\(${lineOf(P1, P2)}\\)。可驗證兩交點為 \\((${P1}),(${P2})\\)。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(
          `求過圓 \\(${s12CircleGeneral(O1[0], O1[1], r1)}\\) 與直線 \\(${lineOf(P1, P2)}\\) 之交點，且過點 \\((${O2[0] + Math.round(Math.sqrt(r2)) === O2[0] ? P2[0] : P2[0]},${P2[1]})\\) 的圓。`
        );
        answers.push(
          `簡答：\\(${s12CircleGeneral(O2[0], O2[1], r2)}\\)。過程：設所求為 \\(C_1+\\lambda L=0\\) 的圓系。代入所給的點求出 \\(\\lambda\\)，整理後即得圓心 \\((${O2})\\)、半徑平方 ${r2} 的圓。`
        );
        continue;
      }

      if (variant === 2) {
        questions.push(
          `以兩圓 \\(C_1:${s12CircleGeneral(O1[0], O1[1], r1)}\\) 與 \\(C_2:${s12CircleGeneral(O2[0], O2[1], r2)}\\) 之公共弦為直徑，求圓方程式。`
        );
        answers.push(
          `簡答：\\(${s12CircleStandard(mx, my, chord2 / 4)}\\)。過程：兩圓相減得公共弦 \\(${lineOf(P1, P2)}\\)，其與圓的交點為 \\((${P1}),(${P2})\\)。以此弦為直徑，圓心為兩點中點 \\((${mx},${my})\\)，半徑平方為 \\(\\left(\\frac{\\overline{P_1P_2}}2\\right)^2=${chord2 / 4}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        // 已知公共弦，求兩圓中的參數 a,b
        const la = P2[1] - P1[1];
        const lb = P1[0] - P2[0];
        const lc = la * P1[0] + lb * P1[1];
        const d1 = -2 * O1[0];
        const e1 = -2 * O1[1];
        const f1 = O1[0] ** 2 + O1[1] ** 2 - r1;
        const d2 = -2 * O2[0];
        const e2 = -2 * O2[1];
        const f2 = O2[0] ** 2 + O2[1] ** 2 - r2;
        questions.push(
          `設圓 \\(C_1:x^2+y^2+ax${s12Signed(e1)}y${s12Signed(f1)}=0\\) 與 \\(C_2:x^2+y^2${s12Signed(d2)}x+by${s12Signed(f2)}=0\\) 相交，且其公共弦為 \\(${s12LineText(la, lb, -lc)}\\)，求 \\(a,b\\) 之值。`
        );
        answers.push(
          `簡答：\\(a=${d1},b=${e2}\\)。過程：兩圓相減得公共弦 \\((a${s12Signed(-d2)})x+(${e1}-b)y${s12Signed(f1 - f2)}=0\\)。與已知公共弦比較係數（同比例），可解得 \\(a=${d1}\\)、\\(b=${e2}\\)。`
        );
        continue;
      }

      // variant 4：圓系恆過的兩定點
      const la4 = P2[1] - P1[1];
      const lb4 = P1[0] - P2[0];
      const lc4 = la4 * P1[0] + lb4 * P1[1];
      questions.push(
        `若圓系 \\(${s12CircleGeneral(O1[0], O1[1], r1)}\\) 與 \\(k(${s12LineText(la4, lb4, -lc4)})\\) 相加所成的圓恆過兩定點，求這兩定點。`
      );
      answers.push(
        `簡答：\\((${P1}),(${P2})\\)。過程：要對所有 \\(k\\) 成立，必須同時滿足原圓方程式與該直線方程式，兩者的交點即為 \\((${P1}),(${P2})\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS122PointCircleDistanceExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const triples = [
      [3, 4, 5],
      [4, 3, 5],
      [6, 8, 10],
      [5, 12, 13],
      [12, 5, 13],
      [8, 15, 17],
      [9, 12, 15],
    ];
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // 圓外一點：最短 d-r，最長 d+r
        const [dx, dy, d] = triples[randInt(0, triples.length - 1)];
        const h = randInt(-4, 4);
        const k = randInt(-4, 4);
        const r = randInt(1, d - 1);
        questions.push(
          `求點 \\(P(${h + dx},${k + dy})\\) 到圓 \\(${s12CircleGeneral(h, k, r * r)}\\) 的最短距離與最長距離。`
        );
        answers.push(
          `簡答：最短 ${d - r}，最長 ${d + r}。過程：圓心 \\((${h},${k})\\)、半徑 ${r}。\\(\\overline{PC}=\\sqrt{${dx}^2+${dy}^2}=${d}>${r}\\)，故 \\(P\\) 在圓外，最短距離為 \\(${d}-${r}=${d - r}\\)，最長為 \\(${d}+${r}=${d + r}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 圓內一點：最短 r-d
        const [dx, dy, d] = triples[randInt(0, triples.length - 1)];
        const h = randInt(-4, 4);
        const k = randInt(-4, 4);
        const r = d + randInt(1, 6);
        questions.push(
          `若 \\(A(${h + dx},${k + dy})\\) 為圓 \\(${s12CircleStandard(h, k, r * r)}\\) 內部一點，求 \\(A\\) 到圓周的最短距離。`
        );
        answers.push(
          `簡答：${r - d}。過程：圓心 \\((${h},${k})\\)、半徑 ${r}。\\(\\overline{AC}=${d}<${r}\\)，所以 \\(A\\) 在圓內，到圓周最短距離為 \\(${r}-${d}=${r - d}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // P 在圓上，求到定點距離平方的最大值 =(d+r)²
        const [dx, dy, d] = triples[randInt(0, triples.length - 1)];
        const h = randInt(-3, 5);
        const k = randInt(-3, 5);
        const r = randInt(1, 6);
        const qx = h + dx;
        const qy = k + dy;
        questions.push(
          `設 \\(P(a,b)\\) 為圓 \\(${s12CircleGeneral(h, k, r * r)}\\) 上的動點，求 \\((a-${qx})^2+(b-${qy})^2\\) 的最大值。`
        );
        answers.push(
          `簡答：${(d + r) * (d + r)}。過程：所求為 \\(P\\) 到定點 \\(Q(${qx},${qy})\\) 距離的平方。圓心 \\((${h},${k})\\)、半徑 ${r}，\\(\\overline{QC}=${d}\\)。\\(P\\) 在圓上時 \\(\\overline{PQ}\\) 最大為 \\(${d}+${r}=${d + r}\\)，故平方的最大值為 ${(d + r) * (d + r)}。`
        );
        continue;
      }

      if (variant === 3) {
        // 圓上點到直線的最短距離 = |dist(C,L) - r|
        const [a, b, L] = triples[randInt(0, triples.length - 1)];
        const h = randInt(-4, 4);
        const k = randInt(-4, 4);
        const dist = randInt(2, 9);
        const r = randInt(1, dist - 1);
        const c = dist * L - (a * h + b * k);
        questions.push(
          `已知圓 \\(${s12CircleGeneral(h, k, r * r)}\\)，求圓上的點到直線 \\(${s12VarTerm(a, 'x')}+${s12VarTerm(b, 'y')}${s12Signed(c)}=0\\) 的最短距離。`
        );
        answers.push(
          `簡答：${dist - r}。過程：圓心 \\((${h},${k})\\) 到該直線的距離為 \\(\\frac{|${a * h + b * k}${s12Signed(c)}|}{${L}}=${dist}\\)，大於半徑 ${r}，所以圓與直線不相交，圓上點到直線的最短距離為 \\(${dist}-${r}=${dist - r}\\)。`
        );
        continue;
      }

      // variant 4：原點到圓上點的距離可取幾個整數值
      const [dx4, dy4, d4] = triples[randInt(0, triples.length - 1)];
      const r4 = randInt(1, d4 - 1);
      const lo = d4 - r4;
      const hi = d4 + r4;
      const cntInt = hi - lo + 1;
      questions.push(`原點到圓 \\(${s12CircleStandard(dx4, dy4, r4 * r4)}\\) 上各點的距離，可取到幾種整數值？`);
      answers.push(
        `簡答：${cntInt} 種。過程：圓心到原點的距離為 \\(\\sqrt{${dx4}^2+${dy4}^2}=${d4}\\)，半徑 ${r4}。距離的變化範圍為 \\([${lo},${hi}]\\)，其中整數有 \\(${lo},${lo + 1},\\ldots,${hi}\\)，共 ${cntInt} 種。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS122AxisTangentCircleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const r = randInt(2, 7);
        const point = { x: r, y: 2 * r };
        const h = r;
        const k = r;
        questions.push(
          `求通過點 \\(${formatS122Point(point)}\\)，且與 \\(x\\) 軸、\\(y\\) 軸均相切，圓心在第一象限的圓方程式。`
        );
        answers.push(
          `簡答：\\((x-${h})^2+(y-${k})^2=${r * r}\\) 或 \\((x-${5 * r})^2+(y-${5 * r})^2=${25 * r * r}\\)。過程：與兩坐標軸都相切且圓心在第一象限，圓心可設為 \\((t,t)\\)，半徑為 \\(t\\)。代入點 \\(${formatS122Point(point)}\\)，得 \\(t^2-${6 * r}t+${5 * r * r}=0\\)，解得 \\(t=${r}\\) 或 \\(t=${5 * r}\\)，故有兩圓。`
        );
        continue;
      }

      if (type === 1) {
        const r = randInt(2, 6);
        questions.push(`求通過點 \\((${2 * r},${r})\\)，且與兩坐標軸均相切的所有圓方程式。`);
        answers.push(
          `簡答：\\((x-${r})^2+(y-${r})^2=${r * r}\\) 或 \\((x-${5 * r})^2+(y-${5 * r})^2=${25 * r * r}\\)。過程：與兩軸相切且點在第一象限，圓心可設為 \\((t,t)\\)，半徑 \\(t\\)。代入點 \\((${2 * r},${r})\\) 得 \\(t^2-${6 * r}t+${5 * r * r}=0\\)，解得 \\(t=${r}\\) 或 \\(t=${5 * r}\\)，故有兩圓。`
        );
        continue;
      }

      if (type === 2) {
        const r = randInt(2, 15);
        const c = 2 * r;
        questions.push(`求圓心在直線 \\(x+y=${c}\\) 上，且與兩坐標軸都相切的所有圓方程式。`);
        answers.push(
          `簡答：\\((x-${r})^2+(y-${r})^2=${r * r}\\)。過程：與兩坐標軸相切時圓心為 \\((\\pm r,\\pm r)\\)。代入 \\(x+y=${c}\\)，只有 \\((r,r)=(${r},${r})\\) 符合，所以半徑為 ${r}。`
        );
        continue;
      }

      if (type === 3) {
        const r = randInt(2, 14);
        questions.push(`已知一圓與兩坐標軸相切，且半徑為 ${r}，求所有可能的圓心坐標。`);
        answers.push(
          `簡答：\\((\\pm${r},\\pm${r})\\)。過程：與 \\(x\\) 軸相切表示圓心到 \\(x\\) 軸距離為半徑，所以 \\(|k|=${r}\\)；與 \\(y\\) 軸相切表示 \\(|h|=${r}\\)。因此圓心為 \\((\\pm${r},\\pm${r})\\)。`
        );
        continue;
      }

      const r = randInt(2, 6);
      const point = { x: -r, y: 2 * r };
      questions.push(
        `求通過點 \\(${formatS122Point(point)}\\)，且與 \\(x\\) 軸、\\(y\\) 軸均相切，圓心在第二象限的圓方程式。`
      );
      answers.push(
        `簡答：\\((x+${r})^2+(y-${r})^2=${r * r}\\) 或 \\((x+${5 * r})^2+(y-${5 * r})^2=${25 * r * r}\\)。過程：圓心在第二象限且與兩軸相切，可設圓心為 \\((-t,t)\\)，半徑為 \\(t\\)。代入點 \\(${formatS122Point(point)}\\)，得 \\(t^2-${6 * r}t+${5 * r * r}=0\\)，解得 \\(t=${r}\\) 或 \\(t=${5 * r}\\)，故有兩圓。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS122ParametricStandardSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const paramCoord = (center, radius, trig) => {
      if (center === 0) return `${radius}\\${trig}`;
      return `${center}${radius >= 0 ? '+' : ''}${radius}\\${trig}`;
    };

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const h = randInt(-8, 8);
        const k = randInt(-7, 7);
        const r = randInt(2, 12);
        questions.push(`將圓 \\(${formatS122CircleStandard(h, k, r * r)}\\) 化為參數式。`);
        answers.push(
          `簡答：\\(x=${paramCoord(h, r, 'cos')}\\theta,\\ y=${paramCoord(k, r, 'sin')}\\theta\\)。過程：標準式 \\((x-h)^2+(y-k)^2=r^2\\) 的參數式為 \\(x=h+r\\cos\\theta,\\ y=k+r\\sin\\theta\\)。本題圓心為 \\(${formatS122Point({ x: h, y: k })}\\)，半徑為 ${r}。`
        );
        continue;
      }

      if (type === 1) {
        const h = randInt(-8, 8);
        const k = randInt(-8, 8);
        const r = randInt(2, 12);
        questions.push(
          `已知圓的參數式為 \\(x=${paramCoord(h, r, 'cos')}\\theta,\\ y=${paramCoord(k, r, 'sin')}\\theta\\)，求其標準式。`
        );
        answers.push(
          `簡答：\\(${formatS122CircleStandard(h, k, r * r)}\\)。過程：由參數式可知圓心為 \\(${formatS122Point({ x: h, y: k })}\\)，半徑為 ${r}，所以標準式為 \\(${formatS122CircleStandard(h, k, r * r)}\\)。`
        );
        continue;
      }

      if (type === 2) {
        const r = randInt(2, 15);
        const den = [3, 4, 6, 8, 12][randInt(0, 4)];
        const arc = simplifyFraction(2 * r, den);
        const arcText = arc.den === 1 ? `${arc.num}\\pi` : `\\frac{${arc.num}\\pi}{${arc.den}}`;
        questions.push(
          `圓的參數式為 \\(x=h+${r}\\cos\\theta,\\ y=k+${r}\\sin\\theta\\)。求 \\(0\\leq\\theta\\leq\\frac{2\\pi}{${den}}\\) 所表示的弧長。`
        );
        answers.push(
          `簡答：\\(${arcText}\\)。過程：弧長 \\(s=r\\theta\\)。本題半徑為 ${r}，角度範圍長為 \\(\\frac{2\\pi}{${den}}\\)，所以 \\(s=${r}\\cdot\\frac{2\\pi}{${den}}=${arcText}\\)。`
        );
        continue;
      }

      if (type === 3) {
        // 單位圓上給定 y 坐標，求所有可能點（取特殊角，x 為對應的另一個值）
        const specials = [
          { y: '\\frac12', x: '\\frac{\\sqrt3}{2}', ySq: '\\frac14', xSq: '\\frac34' },
          { y: '\\frac{\\sqrt2}{2}', x: '\\frac{\\sqrt2}{2}', ySq: '\\frac12', xSq: '\\frac12' },
          { y: '\\frac{\\sqrt3}{2}', x: '\\frac12', ySq: '\\frac34', xSq: '\\frac14' },
          { y: '\\frac35', x: '\\frac45', ySq: '\\frac9{25}', xSq: '\\frac{16}{25}' },
          { y: '\\frac45', x: '\\frac35', ySq: '\\frac{16}{25}', xSq: '\\frac9{25}' },
          { y: '\\frac5{13}', x: '\\frac{12}{13}', ySq: '\\frac{25}{169}', xSq: '\\frac{144}{169}' },
          { y: '\\frac{12}{13}', x: '\\frac5{13}', ySq: '\\frac{144}{169}', xSq: '\\frac{25}{169}' },
        ];
        const sp = specials[randInt(0, specials.length - 1)];
        const neg = randInt(0, 1) === 0;
        const yText = neg ? `-${sp.y}` : sp.y;
        questions.push(
          `在單位圓 \\(x=\\cos\\theta,\\ y=\\sin\\theta\\) 上一點，其 \\(y\\) 坐標為 \\(${yText}\\)，求所有可能的點坐標。`
        );
        answers.push(
          `簡答：\\((${sp.x},${yText})\\)、\\((-${sp.x},${yText})\\)。過程：單位圓上 \\(x^2+y^2=1\\)。代入 \\(y^2=${sp.ySq}\\)，得 \\(x^2=${sp.xSq}\\)，所以 \\(x=\\pm${sp.x}\\)。`
        );
        continue;
      }

      const r = randInt(2, 5);
      const px = 3 * r;
      const nearestX = r;
      questions.push(`利用參數式求圓 \\(x^2+y^2=${r * r}\\) 上距離點 \\((${px},0)\\) 最近的點。`);
      answers.push(
        `簡答：\\((${nearestX},0)\\)。過程：圓可設 \\(x=${r}\\cos\\theta,\\ y=${r}\\sin\\theta\\)。到 \\((${px},0)\\) 的距離平方為 \\((${r}\\cos\\theta-${px})^2+(${r}\\sin\\theta)^2=${r * r + px * px}-${2 * r * px}\\cos\\theta\\)。要最小，需 \\(\\cos\\theta=1\\)，故最近點為 \\((${r},0)\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS122CirclePointAlgebraExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const formatCoeffRadical = (coeff, inside) => {
      const simplified = simplifyRadical(inside);
      const outside = coeff * simplified.outside;
      if (simplified.inside === 1) return `${outside}`;
      return `${outside === 1 ? '' : outside}\\sqrt{${simplified.inside}}`;
    };

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const r = randInt(1, 4);
        const a = [2, 3, 4][randInt(0, 2)];
        const b = [-3, -1, 2][randInt(0, 2)];
        const norm = a * a + b * b;
        const bound = formatCoeffRadical(r, norm);
        const linearText = `${a}x${formatS122CoeffVar(b, 'y')}`;
        questions.push(`已知 \\((x,y)\\) 滿足 \\(x^2+y^2\\leq ${r * r}\\)，求 \\(${linearText}\\) 的最大值與最小值。`);
        answers.push(
          `簡答：最大值 \\(${bound}\\)，最小值 \\(-${bound}\\)。過程：線性式 \\(${linearText}\\) 在圓盤上的極值為 \\(\\pm r\\sqrt{${a}^2+${Math.abs(b)}^2}\\)。代入 \\(r=${r}\\)，得 \\(\\pm ${bound}\\)。`
        );
        continue;
      }

      if (type === 1) {
        const h = randInt(1, 4);
        const k = randInt(-3, 3);
        const r = randInt(1, 4);
        const targetY = k + randInt(-2, 2);
        const centerDist = h * h + (k - targetY) * (k - targetY);
        const max = Math.pow(
          Math.floor(Math.sqrt(centerDist)) === Math.sqrt(centerDist) ? Math.sqrt(centerDist) + r : 0,
          2
        );
        const yDiffText = targetY === 0 ? 'b' : targetY > 0 ? `b-${targetY}` : `b+${Math.abs(targetY)}`;
        questions.push(
          `設 \\(P(a,b)\\) 為圓 \\(${formatS122CircleStandard(h, k, r * r)}\\) 上的動點，求 \\(a^2+(${yDiffText})^2\\) 的最大值。`
        );
        const dText = formatRadical(centerDist);
        const maxText = centerDist === 0 ? `${r * r}` : `(${dText}+${r})^2`;
        answers.push(
          `簡答：\\(${maxText}\\)。過程：\\(a^2+(${yDiffText})^2\\) 表示點 \\(P(a,b)\\) 到 \\((0,${targetY})\\) 的距離平方。圓心到該點距離為 \\(${dText}\\)，半徑為 ${r}，所以最大距離為 \\(${dText}+${r}\\)，平方最大值為 \\(${maxText}\\)。`
        );
        continue;
      }

      if (type === 2) {
        const r = randInt(1, 4);
        const a = 3;
        const b = 4;
        const max = 5 * r;
        questions.push(`設 \\(y=\\sqrt{${r * r}-x^2}\\)，求 \\(${a}x+${b}y\\) 的最大值。`);
        answers.push(
          `簡答：${max}。過程：\\(y=\\sqrt{${r * r}-x^2}\\) 表示上半圓 \\(x^2+y^2=${r * r},\\ y\\geq0\\)。線性式 \\(3x+4y\\) 的最大值為 \\(r\\sqrt{3^2+4^2}=5r\\)，代入 \\(r=${r}\\) 得 ${max}。`
        );
        continue;
      }

      if (type === 3) {
        const picks = [
          { h: 5, r: 3, denRoot: 4 },
          { h: 5, r: 4, denRoot: 3 },
          { h: 13, r: 5, denRoot: 12 },
          { h: 13, r: 12, denRoot: 5 },
        ];
        const pick = picks[randInt(0, picks.length - 1)];
        const h = pick.h;
        const r = pick.r;
        const den = h * h - r * r;
        const slope = simplifyFraction(r, pick.denRoot);
        const slopeText = formatFraction(slope.num, slope.den);
        questions.push(`若 \\((x,y)\\) 在圓 \\(x^2+y^2=${r * r}\\) 上，求 \\(\\frac{y}{x-${h}}\\) 的範圍。`);
        answers.push(
          `簡答：\\(-${slopeText}\\leq \\frac{y}{x-${h}}\\leq ${slopeText}\\)。過程：\\(\\frac{y}{x-${h}}\\) 是外點 \\((${h},0)\\) 與圓上點連線的斜率。極端情況發生在切線，設斜率為 \\(m\\)，切線 \\(y=m(x-${h})\\) 到原點距離等於半徑：\\(\\frac{|${h}m|}{\\sqrt{m^2+1}}=${r}\\)。解得 \\(m^2=\\frac{${r * r}}{${den}}\\)，所以 \\(|m|=${slopeText}\\)。`
        );
        continue;
      }

      const h = randInt(5, 9);
      const k = randInt(4, 8);
      const r = randInt(2, 4);
      const c2 = h * h + k * k;
      const lo = Math.ceil(Math.sqrt(c2) - r);
      const hi = Math.floor(Math.sqrt(c2) + r);
      const countInts = Math.max(0, hi - lo + 1);
      questions.push(`已知圓 \\((x-${h})^2+(y-${k})^2=${r * r}\\)，求圓上點到原點距離為整數值的可能個數。`);
      answers.push(
        `簡答：${countInts} 個。過程：圓心 \\(C(${h},${k})\\) 到原點距離為 \\(${formatRadical(c2)}\\)，半徑為 ${r}，所以距離範圍為 \\([${formatRadical(c2)}-${r},${formatRadical(c2)}+${r}]\\)。其中整數距離從 ${lo} 到 ${hi}，共有 ${countInts} 個。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS122TriangleCircumInCircleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const ringOf = (r) => {
      const out = [];
      for (let x = -r; x <= r; x += 1) for (let y = -r; y <= r; y += 1) if (x * x + y * y === r * r) out.push([x, y]);
      return out;
    };
    const tri = [
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [9, 12, 15],
      [8, 15, 17],
    ];
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 1 || variant === 3) {
        const r = [5, 13, 25][randInt(0, 2)];
        const ring = ringOf(r);
        const ox = randInt(-5, 6);
        const oy = randInt(-5, 6);
        const idx = shuffle(ring.map((_, k) => k)).slice(0, 3);
        const P = idx.map((k) => [ox + ring[k][0], oy + ring[k][1]]);
        const cross = (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[1][1] - P[0][1]) * (P[2][0] - P[0][0]);
        if (cross === 0) {
          i -= 1;
          continue;
        }
        if (variant === 0) {
          questions.push(`求以 \\(A(${P[0]})\\)、\\(B(${P[1]})\\)、\\(C(${P[2]})\\) 為三頂點之三角形的外接圓方程式。`);
          answers.push(
            `簡答：\\(${s12CircleStandard(ox, oy, r * r)}\\)。過程：設外接圓為 \\((x-h)^2+(y-k)^2=R\\)，代入三頂點解聯立（或取兩邊中垂線交點），得圓心 \\((${ox},${oy})\\)、半徑 ${r}。`
          );
        } else if (variant === 1) {
          const lineOf = (A, B) => {
            const a = B[1] - A[1];
            const b = A[0] - B[0];
            const c = a * A[0] + b * A[1];
            return s12LineText(a, b, -c);
          };
          questions.push(
            `求三直線 \\(${lineOf(P[0], P[1])}\\)、\\(${lineOf(P[1], P[2])}\\)、\\(${lineOf(P[2], P[0])}\\) 圍成之三角形的外接圓圓心。`
          );
          answers.push(
            `簡答：\\((${ox},${oy})\\)。過程：三直線兩兩相交得頂點 \\((${P[0]}),(${P[1]}),(${P[2]})\\)。取兩邊中垂線的交點，得外接圓心 \\((${ox},${oy})\\)（到三頂點距離皆為 ${r}）。`
          );
        } else {
          questions.push(
            `已知 \\(\\triangle ABC\\) 三頂點為 \\(A(${P[0]})\\)、\\(B(${P[1]})\\)、\\(C(s,t)\\)，若其外接圓心為 \\((${ox},${oy})\\) 且半徑為 ${r}，求一組可能的 \\(C\\) 點。`
          );
          answers.push(
            `簡答：\\(C(${P[2]})\\)。過程：\\(C\\) 必須落在以 \\((${ox},${oy})\\) 為圓心、半徑 ${r} 的圓上，即 \\(${s12CircleStandard(ox, oy, r * r)}\\)。取其上一個整數點，例如 \\((${P[2]})\\)（且與 \\(A,B\\) 不共線）。`
          );
        }
        continue;
      }

      if (variant === 2) {
        // x=0 與兩條對稱直線圍成的等腰三角形，內心在 y=0 上
        const [a2, b2, L2] = tri[randInt(0, tri.length - 1)];
        const c2 = randInt(5, 20);
        const xin = makeFraction(c2, L2 + a2);
        questions.push(
          `求三直線 \\(x=0\\)、\\(${s12VarTerm(a2, 'x')}-${b2}y-${c2}=0\\)、\\(${s12VarTerm(a2, 'x')}+${b2}y-${c2}=0\\) 圍成三角形之內切圓方程式。`
        );
        answers.push(
          `簡答：\\(\\left(x-${formatFraction(xin.num, xin.den)}\\right)^2+y^2=${formatFraction(xin.num * xin.num, xin.den * xin.den)}\\)。過程：兩條斜邊關於 \\(x\\) 軸對稱，故內心在 \\(y=0\\) 上。設內心為 \\((x,0)\\)，它到 \\(x=0\\) 的距離為 \\(x\\)，到斜邊 \\(${s12VarTerm(a2, 'x')}-${b2}y-${c2}=0\\) 的距離為 \\(\\frac{${c2}-${a2}x}{${L2}}\\)。令兩者相等得 \\(x=\\frac{${c2}}{${L2}+${a2}}=${formatFraction(xin.num, xin.den)}\\)，此即內切圓半徑，故圓心 \\((${formatFraction(xin.num, xin.den)},0)\\)。`
        );
        continue;
      }

      // variant 4：直角三角形 (0,0),(a,0),(0,b) 的內心 = (ρ,ρ)，ρ=(a+b-c)/2
      const [aLeg, bLeg, cHyp] = tri[randInt(0, tri.length - 1)];
      const rho = (aLeg + bLeg - cHyp) / 2;
      questions.push(`求以 \\((0,0)\\)、\\((${aLeg},0)\\)、\\((0,${bLeg})\\) 為頂點的三角形其內切圓圓心坐標與半徑。`);
      answers.push(
        `簡答：圓心 \\((${rho},${rho})\\)，半徑 ${rho}。過程：這是直角三角形，兩股長 ${aLeg}、${bLeg}，斜邊 ${cHyp}。內切圓半徑 \\(\\rho=\\frac{${aLeg}+${bLeg}-${cHyp}}{2}=${rho}\\)，且內心到兩股距離皆為 \\(\\rho\\)，故圓心為 \\((${rho},${rho})\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS123GivenSlopeTangentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const tri = [
      [3, 4, 5],
      [4, 3, 5],
      [5, 12, 13],
      [12, 5, 13],
      [8, 15, 17],
      [15, 8, 17],
    ];
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // x²+y²=p²+1，斜率 -p → y=-px±(p²+1)
        const p = randInt(1, 5);
        const R = p * p + 1;
        questions.push(`求斜率為 \\(-${p}\\) 且與圓 \\(x^2+y^2=${R}\\) 相切的兩條直線方程式。`);
        answers.push(
          `簡答：\\(${s12LineText(p, 1, -R)}\\) 或 \\(${s12LineText(p, 1, R)}\\)。過程：設切線為 \\(y=-${p}x+c\\)，即 \\(${p}x+y-c=0\\)。圓心為原點、半徑 \\(\\sqrt{${R}}\\)，由 \\(\\frac{|c|}{\\sqrt{${p}^2+1}}=\\sqrt{${R}}\\) 得 \\(|c|=${R}\\)，所以 \\(c=\\pm${R}\\)。`
        );
        continue;
      }

      if (variant === 1 || variant === 2) {
        // 與已知直線平行（斜率 p/q 來自畢氏組），圓心 (h,k)，半徑 r → 切線 px-qy+(qk-ph±rL)=0
        const [p, q, L] = tri[randInt(0, tri.length - 1)];
        const h = randInt(-4, 5);
        const k = randInt(-4, 5);
        const r = randInt(1, 5);
        const base = q * k - p * h;
        const c0 = randInt(-6, 6);
        questions.push(
          `求與直線 \\(${s12LineText(p, -q, c0)}\\) 平行，且與圓 \\(${variant === 1 ? s12CircleGeneral(h, k, r * r) : s12CircleStandard(h, k, r * r)}\\) 相切的切線方程式。`
        );
        answers.push(
          `簡答：\\(${s12LineText(p, -q, base + r * L)}\\) 或 \\(${s12LineText(p, -q, base - r * L)}\\)。過程：平行線可設為 \\(${s12VarTerm(p, 'x')}-${q}y+c=0\\)。圓心 \\((${h},${k})\\)、半徑 ${r}，由 \\(\\frac{|${p * h - q * k}+c|}{${L}}=${r}\\) 得 \\(c=${base + r * L}\\) 或 \\(${base - r * L}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        // 圓 (x-h)²+(y-k)²=(m²+1)t²，斜率 m → 切線 mx-y+(k-mh±t(m²+1))=0
        const m = pickNonZero(1, 4);
        const t = randInt(1, 3);
        const h = randInt(-4, 5);
        const k = randInt(-4, 5);
        const R = (m * m + 1) * t * t;
        const base = k - m * h;
        const off = t * (m * m + 1);
        questions.push(`已知圓 \\(${s12CircleStandard(h, k, R)}\\)，求斜率為 ${m} 的切線方程式。`);
        answers.push(
          `簡答：\\(${s12LineText(m, -1, base + off)}\\) 或 \\(${s12LineText(m, -1, base - off)}\\)。過程：設切線為 \\(y=${m}x+c\\)，即 \\(${m}x-y+c=0\\)。由圓心 \\((${h},${k})\\) 到直線距離等於半徑 \\(\\sqrt{${R}}\\)，得 \\(\\frac{|${m * h - k}+c|}{\\sqrt{${m * m + 1}}}=\\sqrt{${R}}\\)，解得 \\(c=${base + off}\\) 或 \\(${base - off}\\)。`
        );
        continue;
      }

      // variant 4：y=mx+c 與 x²+y²=r² 相切 → m=±b/a（畢氏 a²+b²=c²）
      const [a4, b4, c4] = tri[randInt(0, tri.length - 1)];
      questions.push(`設直線 \\(y=mx+${c4}\\) 與圓 \\(x^2+y^2=${a4 * a4}\\) 相切，求實數 \\(m\\) 之值。`);
      answers.push(
        `簡答：\\(m=${formatFraction(b4, a4)}\\) 或 \\(m=${formatFraction(-b4, a4)}\\)。過程：由圓心到直線 \\(mx-y+${c4}=0\\) 的距離等於半徑，\\(\\frac{${c4}}{\\sqrt{m^2+1}}=${a4}\\)，得 \\(m^2+1=\\frac{${c4 * c4}}{${a4 * a4}}\\)，所以 \\(m^2=\\frac{${b4 * b4}}{${a4 * a4}}\\)，\\(m=\\pm${formatFraction(b4, a4)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS123ExternalPointTangentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // 畢氏三元組，用來造出「圓心到 P 的距離為整數」的配置
    const triples = [
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [8, 15, 17],
      [9, 12, 15],
      [12, 16, 20],
    ];
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // 一條鉛直切線 x=x0（|x0-h|=r），另一條斜率 m=(r^2-v^2)/(2uv)
        const h = randInt(-3, 4);
        const k = randInt(-3, 4);
        const r = randInt(1, 5);
        const sideSign = randInt(0, 1) === 0 ? 1 : -1;
        const x0 = h + sideSign * r;
        const u = h - x0; // = -sideSign*r
        let v = pickNonZero(-6, 6);
        while (r * r === v * v) v = pickNonZero(-6, 6);
        const y0 = k + v;
        const mf = makeFraction(r * r - v * v, 2 * u * v); // 斜率
        const p = mf.num;
        const q = mf.den;
        // 直線：y-y0 = (p/q)(x-x0) => p x - q y + (q*y0 - p*x0) = 0
        const A = p;
        const B = -q;
        const C = q * y0 - p * x0;
        questions.push(
          `求過圓外點 \\(P(${x0},${y0})\\) 且與圓 \\(${s12CircleStandard(h, k, r * r)}\\) 相切的兩條直線方程式。`
        );
        answers.push(
          `簡答：\\(x=${x0}\\) 或 \\(${s12LineText(A, B, C)}\\)。過程：因為 \\(|${x0}-(${h})|=${r}\\) 等於半徑，鉛直線 \\(x=${x0}\\) 即為一條切線。另一條設為 \\(y-${y0}=m(x-${x0})\\)，由圓心到直線距離等於 ${r}，化簡得 \\(2muv+v^2=r^2\\)（其中 \\(u=${u},v=${v}\\)），解得 \\(m=${formatFraction(p, q)}\\)，整理為 \\(${s12LineText(A, B, C)}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        const [a1, b1, c1] = triples[randInt(0, triples.length - 1)];
        const h = randInt(-3, 4);
        const k = randInt(-3, 4);
        const r = randInt(1, c1 - 1);
        const x0 = h + a1;
        const y0 = k + b1;
        const len2 = c1 * c1 - r * r;
        questions.push(`自點 \\(P(${x0},${y0})\\) 向圓 \\(${s12CircleStandard(h, k, r * r)}\\) 作切線，求其切線長。`);
        answers.push(
          `簡答：\\(${formatRadical(len2)}\\)。過程：圓心 \\((${h},${k})\\)、半徑 ${r}。\\(\\overline{PC}=\\sqrt{${a1}^2+${b1}^2}=${c1}\\)，切線長 \\(=\\sqrt{\\overline{PC}^2-r^2}=\\sqrt{${c1 * c1}-${r * r}}=${formatRadical(len2)}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        const h = randInt(-3, 4);
        const k = randInt(-3, 4);
        const dx = pickNonZero(-5, 5);
        const dy = pickNonZero(-5, 5);
        const d2 = dx * dx + dy * dy;
        const r = randInt(1, Math.max(1, Math.floor(Math.sqrt(d2 - 1))));
        const x0 = h + dx;
        const y0 = k + dy;
        const len2 = d2 - r * r;
        questions.push(`求過點 \\(A(${x0},${y0})\\) 且與圓 \\(${s12CircleStandard(h, k, r * r)}\\) 相切的切線長。`);
        answers.push(
          `簡答：\\(${formatRadical(len2)}\\)。過程：圓心 \\((${h},${k})\\)、半徑 ${r}。\\(\\overline{AC}^2=(${dx})^2+(${dy})^2=${d2}\\)，切線長 \\(=\\sqrt{${d2}-${r * r}}=${formatRadical(len2)}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        // 兩切線夾角：sin(θ/2)=r/PC。取 PC=2r → 60°
        const [a1, b1, c1] = triples[randInt(0, triples.length - 1)];
        if (c1 % 2 !== 0) {
          // 需要 PC 為偶數才能取 r=PC/2
          const [a2, b2, c2] = [6, 8, 10];
          const h = randInt(-3, 4);
          const k = randInt(-3, 4);
          const r = c2 / 2;
          questions.push(
            `自點 \\(P(${h + a2},${k + b2})\\) 向圓 \\(${s12CircleStandard(h, k, r * r)}\\) 作兩切線，求兩切線的夾角。`
          );
          answers.push(
            `簡答：\\(60^\\circ\\)。過程：圓心 \\((${h},${k})\\)、半徑 ${r}，\\(\\overline{PC}=${c2}\\)。設夾角為 \\(\\theta\\)，則 \\(\\sin\\frac{\\theta}{2}=\\frac{r}{\\overline{PC}}=\\frac{${r}}{${c2}}=\\frac12\\)，故 \\(\\frac{\\theta}{2}=30^\\circ\\)，\\(\\theta=60^\\circ\\)。`
          );
          continue;
        }
        const h = randInt(-3, 4);
        const k = randInt(-3, 4);
        const r = c1 / 2;
        questions.push(
          `自點 \\(P(${h + a1},${k + b1})\\) 向圓 \\(${s12CircleStandard(h, k, r * r)}\\) 作兩切線，求兩切線的夾角。`
        );
        answers.push(
          `簡答：\\(60^\\circ\\)。過程：圓心 \\((${h},${k})\\)、半徑 ${r}，\\(\\overline{PC}=${c1}\\)。設夾角為 \\(\\theta\\)，則 \\(\\sin\\frac{\\theta}{2}=\\frac{r}{\\overline{PC}}=\\frac12\\)，所以 \\(\\theta=60^\\circ\\)。`
        );
        continue;
      }

      const h = randInt(-3, 4);
      const k = randInt(-3, 4);
      const R = [5, 9, 10, 13, 16][randInt(0, 4)];
      let x0;
      let y0;
      do {
        x0 = h + pickNonZero(-6, 6);
        y0 = k + randInt(-6, 6);
      } while ((x0 - h) * (x0 - h) + (y0 - k) * (y0 - k) <= R);
      const A = x0 - h;
      const B = y0 - k;
      const C = -h * A - k * B - R;
      questions.push(
        `已知點 \\(P(${x0},${y0})\\) 作圓 \\(${s12CircleGeneral(h, k, R)}\\) 的兩切線，求兩切點連線（極線）的方程式。`
      );
      answers.push(
        `簡答：\\(${s12LineText(A, B, C)}\\)。過程：圓心 \\((${h},${k})\\)、半徑平方 ${R}。極線公式 \\((x_0-h)(x-h)+(y_0-k)(y-k)=r^2\\)，代入 \\(P(${x0},${y0})\\) 整理得 \\(${s12LineText(A, B, C)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS123ChordLengthSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // (a,b) 取畢氏對，使 √(a²+b²) 為整數，距離才會是有理數
    const dirs = [
      [3, 4, 5],
      [4, 3, 5],
      [6, 8, 10],
      [5, 12, 13],
      [12, 5, 13],
      [8, 15, 17],
    ];
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // 已知弦長求 k：直線 ax+by=k，圓心到直線距離 d，弦長 2√(r²-d²)
        const [a, b, L] = dirs[randInt(0, dirs.length - 1)];
        const h = randInt(-4, 4);
        const k0 = randInt(-4, 4);
        const r = randInt(3, 20);
        const half = randInt(1, r - 1);
        const d2 = r * r - half * half;
        if (!isPerfectSquare(d2)) {
          i -= 1;
          continue;
        }
        const d = Math.sqrt(d2);
        const base = a * h + b * k0;
        const k1 = base + d * L;
        const k2 = base - d * L;
        questions.push(
          `直線 \\(${s12VarTerm(a, 'x')}${b > 0 ? '+' : ''}${s12VarTerm(b, 'y')}=k\\) 與圓 \\(${s12CircleGeneral(h, k0, r * r)}\\) 相交之弦長為 ${2 * half}，求 \\(k\\)。`
        );
        answers.push(
          `簡答：\\(k=${k1}\\) 或 \\(k=${k2}\\)。過程：圓心 \\((${h},${k0})\\)、半徑 ${r}。弦長 ${2 * half} 表示半弦長 ${half}，故圓心到直線距離 \\(d=\\sqrt{${r * r}-${half * half}}=${d}\\)。由 \\(\\frac{|${base}-k|}{${L}}=${d}\\) 得 \\(|k-${base}|=${d * L}\\)，所以 \\(k=${k1}\\) 或 \\(${k2}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 弦長等於直徑 → 直線過圓心
        const h = randInt(-4, 5);
        const k0 = pickNonZero(-4, 5);
        const r = randInt(2, 6);
        // 直線 x - m y - m = 0 過圓心 → h - m*k0 - m = 0 → m = h/(k0+1)
        const denom = k0 + 1;
        if (denom === 0) {
          i -= 1;
          continue;
        }
        const mf = makeFraction(h, denom);
        questions.push(
          `設直線 \\(x-my-m=0\\) 與圓 \\(${s12CircleStandard(h, k0, r * r)}\\) 相交於兩點，若弦長等於直徑，求 \\(m\\)。`
        );
        answers.push(
          `簡答：\\(m=${formatFraction(mf.num, mf.den)}\\)。過程：弦長等於直徑表示直線通過圓心 \\((${h},${k0})\\)。代入直線得 \\(${h}-m(${k0})-m=0\\)，即 \\(${h}=m(${denom})\\)，所以 \\(m=${formatFraction(mf.num, mf.den)}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // 已知弦中點求弦所在直線
        const h = randInt(-4, 5);
        const k0 = randInt(-4, 5);
        const R = [9, 16, 25, 36][randInt(0, 3)];
        let ax;
        let ay;
        do {
          ax = h + randInt(-3, 3);
          ay = k0 + randInt(-3, 3);
        } while ((ax - h) * (ax - h) + (ay - k0) * (ay - k0) === 0 || (ax - h) * (ax - h) + (ay - k0) * (ay - k0) >= R);
        const nx = ax - h;
        const ny = ay - k0;
        const C = -(nx * ax + ny * ay);
        questions.push(
          `求以點 \\(A(${ax},${ay})\\) 為中點之圓 \\(${s12CircleGeneral(h, k0, R)}\\) 的弦所在的直線方程式。`
        );
        answers.push(
          `簡答：\\(${s12LineText(nx, ny, C)}\\)。過程：圓心為 \\((${h},${k0})\\)。\\(A\\) 為弦中點時圓心與 \\(A\\) 的連線垂直於弦，故弦的法向量可取 \\(\\overrightarrow{CA}=(${nx},${ny})\\)。過 \\(A\\) 得 \\(${nx}(x-${ax})${ny >= 0 ? '+' : ''}${ny}(y-${ay})=0\\)，整理為 \\(${s12LineText(nx, ny, C)}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        // 圓心在給定直線上、過某點、在 y 軸截弦長固定
        const h = randInt(1, 5);
        const slope = randInt(1, 3);
        const k0 = slope * h - 1;
        const halfChord = randInt(1, 4);
        const R = h * h + halfChord * halfChord; // y 軸截弦長 2*halfChord
        // 找一個在圓上的整數點
        const px = h;
        const py = k0 + Math.round(Math.sqrt(R));
        if (!isPerfectSquare(R)) {
          i -= 1;
          continue;
        }
        questions.push(
          `一圓過 \\(P(${px},${py})\\)，且圓心在 \\(${s12VarTerm(slope, 'x')}-y=1\\) 上，若在 \\(y\\) 軸之截弦長為 ${2 * halfChord}，求其圓方程式。`
        );
        answers.push(
          `簡答：\\(${s12CircleStandard(h, k0, R)}\\)。過程：設圓心 \\((h,k)\\)，由 \\(${slope}h-k=1\\) 得 \\(k=${slope}h-1\\)。\\(y\\) 軸截弦長 ${2 * halfChord} 給出 \\(r^2-h^2=${halfChord * halfChord}\\)；又圓過 \\(P\\)。聯立解得 \\(h=${h},k=${k0},r^2=${R}\\)。`
        );
        continue;
      }

      // 過圓內一點的弦長最大最小值
      const R = [9, 16, 25, 36, 49][randInt(0, 4)];
      let px;
      let py;
      let dd;
      do {
        px = randInt(-5, 5);
        py = randInt(-5, 5);
        dd = px * px + py * py;
      } while (dd === 0 || dd >= R);
      const minLen2 = 4 * (R - dd);
      questions.push(`圓 \\(x^2+y^2=${R}\\) 與過點 \\((${px},${py})\\) 之直線相交，求其弦長之最大值與最小值。`);
      answers.push(
        `簡答：最大值 ${2 * Math.round(Math.sqrt(R))}，最小值 \\(${formatRadical(minLen2)}\\)。過程：圓心為原點、半徑 ${Math.round(Math.sqrt(R))}。過圓內點的直線中，通過圓心時弦長最大即直徑 ${2 * Math.round(Math.sqrt(R))}；當弦垂直於該點與圓心連線時圓心到弦距離最大為 \\(\\sqrt{${dd}}\\)，弦長最小為 \\(2\\sqrt{${R}-${dd}}=${formatRadical(minLen2)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS123ChordMidpointLocusSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // 過圓內定點 A 的所有弦，其中點軌跡是以 CA 為直徑的圓
    const build = () => {
      const h = randInt(-4, 5);
      const k = randInt(-4, 5);
      const dx = 2 * pickNonZero(-3, 3);
      const dy = 2 * randInt(-3, 3);
      const dist2 = dx * dx + dy * dy;
      if (dist2 === 0) return null;
      const R = dist2 + randInt(1, 20);
      const ax = h + dx;
      const ay = k + dy;
      return { h, k, ax, ay, R, mx: h + dx / 2, my: k + dy / 2, lr2: dist2 / 4 };
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      let d = build();
      for (let g = 0; !d && g < 30; g += 1) d = build();
      if (!d) {
        i -= 1;
        continue;
      }
      const { h, k, ax, ay, R, mx, my, lr2 } = d;

      if (variant === 0) {
        questions.push(
          `設圓 \\(C:${s12CircleGeneral(h, k, R)}\\)，求過點 \\(A(${ax},${ay})\\) 之所有弦的中點軌跡方程式。`
        );
        answers.push(
          `簡答：\\(${s12CircleStandard(mx, my, lr2)}\\)。過程：設弦中點為 \\(M\\)，則 \\(\\overline{CM}\\perp\\overline{AM}\\)（圓心到弦的連線垂直平分該弦），故 \\(\\angle CMA=90^\\circ\\)，\\(M\\) 在以 \\(\\overline{CA}\\) 為直徑的圓上。圓心 \\(C(${h},${k})\\) 與 \\(A(${ax},${ay})\\) 的中點為 \\((${mx},${my})\\)，半徑平方為 ${lr2}。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(
          `已知圓 \\(${s12CircleStandard(h, k, R)}\\)，求過內部定點 \\(A(${ax},${ay})\\) 之弦中點形成的圖形方程式。`
        );
        answers.push(
          `簡答：\\(${s12CircleStandard(mx, my, lr2)}\\)。過程：弦中點 \\(M\\) 滿足 \\(\\overline{CM}\\perp\\overline{AM}\\)，故軌跡為以 \\(\\overline{CA}\\) 為直徑的圓，中心 \\((${mx},${my})\\)、半徑平方 ${lr2}。`
        );
        continue;
      }

      if (variant === 2) {
        questions.push(
          `若點 \\(A(${ax},${ay})\\) 是圓 \\(${s12CircleGeneral(h, k, R)}\\) 內部一點，求過 \\(A\\) 點的所有弦中點軌跡。`
        );
        answers.push(
          `簡答：\\(${s12CircleStandard(mx, my, lr2)}\\)。過程：同理，軌跡為以圓心 \\((${h},${k})\\) 與 \\(A\\) 的連線為直徑的圓。`
        );
        continue;
      }

      if (variant === 3) {
        questions.push(
          `設點 \\(A(${ax},${ay})\\) 為圓 \\(${s12CircleStandard(h, k, R)}\\) 內部一點，求過 \\(A\\) 點弦中點軌跡的圓心與半徑。`
        );
        answers.push(
          `簡答：圓心 \\((${mx},${my})\\)，半徑 \\(${formatRadical(lr2)}\\)。過程：軌跡是以 \\(\\overline{CA}\\) 為直徑的圓，圓心為 \\(C(${h},${k})\\) 與 \\(A(${ax},${ay})\\) 的中點，半徑為 \\(\\frac12\\overline{CA}=${formatRadical(lr2)}\\)。`
        );
        continue;
      }

      // variant 4：軌跡圖形的面積
      questions.push(`求圓 \\(${s12CircleStandard(h, k, R)}\\) 內，過點 \\((${ax},${ay})\\) 之弦中點所成圖形的面積。`);
      answers.push(
        `簡答：\\(${lr2}\\pi\\)。過程：軌跡為以 \\(\\overline{CA}\\) 為直徑的圓，半徑平方為 \\(\\left(\\frac{\\overline{CA}}2\\right)^2=${lr2}\\)，故面積為 \\(${lr2}\\pi\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS123PerpendicularTangentsLocusSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const h = randInt(-4, 5);
        const k = randInt(-4, 5);
        const r = randInt(2, 7);
        const R = r * r;
        questions.push(
          `圓 \\(C:${s12CircleGeneral(h, k, R)}\\)，求此圓任意兩條互相垂直的切線之交點所形成的圖形方程式。`
        );
        answers.push(
          `簡答：\\(${s12CircleStandard(h, k, 2 * R)}\\)。過程：原圓配方為 \\(${s12CircleStandard(h, k, R)}\\)，圓心 \\((${h},${k})\\)、半徑 ${r}。自點 \\(P\\) 作兩條互相垂直的切線時 \\(\\overline{CP}=\\sqrt2 r=${formatRadical(2 * R)}\\)，故軌跡為同圓心、半徑平方 ${2 * R} 的圓。`
        );
        continue;
      }

      if (variant === 1) {
        const R = [4, 9, 16, 25, 36][randInt(0, 4)];
        questions.push(`若圓 \\(x^2+y^2=${R}\\) 的兩條互相垂直的切線交於點 \\(P(x,y)\\)，求點 \\(P\\) 的軌跡方程式。`);
        answers.push(
          `簡答：\\(x^2+y^2=${2 * R}\\)。過程：設圓心 \\(O\\)、切點 \\(T\\)。由 \\(OT\\perp PT\\) 且兩切線互相垂直，得 \\(OP=\\sqrt2 r\\)，故 \\(OP^2=2r^2=${2 * R}\\)，軌跡為 \\(x^2+y^2=${2 * R}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        const h = randInt(-4, 5);
        const k = randInt(-4, 5);
        const r = randInt(2, 8);
        questions.push(`已知圓 \\(${s12CircleStandard(h, k, r * r)}\\)，求其垂直切線交點軌跡的半徑。`);
        answers.push(
          `簡答：\\(${formatRadical(2 * r * r)}\\)。過程：原圓半徑為 ${r}。垂直切線交點到圓心的距離恆為 \\(\\sqrt2 r\\)，所以軌跡半徑為 \\(${formatRadical(2 * r * r)}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        const R = [5, 7, 10, 13, 18][randInt(0, 4)];
        questions.push(`設點 \\(P(a,b)\\) 到圓 \\(x^2+y^2=${R}\\) 的兩切線互相垂直，求 \\(a^2+b^2\\) 之值。`);
        answers.push(
          `簡答：${2 * R}。過程：圓心為原點、半徑平方為 ${R}。垂直切線交點滿足 \\(OP^2=2r^2=${2 * R}\\)，所以 \\(a^2+b^2=${2 * R}\\)。`
        );
        continue;
      }

      const h = randInt(-3, 4);
      const k = randInt(-3, 4);
      const R = [5, 8, 10, 13, 18, 20][randInt(0, 5)];
      questions.push(`給定圓 \\(${s12CircleGeneral(h, k, R)}\\)，求其垂直切線交點所成圓形圖形的面積。`);
      answers.push(
        `簡答：\\(${2 * R}\\pi\\)。過程：原圓配方為 \\(${s12CircleStandard(h, k, R)}\\)，半徑平方為 ${R}。垂直切線交點軌跡的半徑平方為 \\(2r^2=${2 * R}\\)，所以面積為 \\(${2 * R}\\pi\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS123RadicalAxisCircleFamilySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const twoCircles = () => {
      const mx = randInt(-4, 5);
      const my = randInt(-4, 5);
      const dx = pickNonZero(-4, 4);
      const dy = randInt(-4, 4);
      const P1 = [mx - dx, my - dy];
      const P2 = [mx + dx, my + dy];
      let t1 = pickNonZero(-3, 3);
      let t2 = pickNonZero(-3, 3);
      if (t1 === t2) t2 = t1 + 1;
      const O1 = [mx - dy * t1, my + dx * t1];
      const O2 = [mx - dy * t2, my + dx * t2];
      const r1 = (O1[0] - P1[0]) ** 2 + (O1[1] - P1[1]) ** 2;
      const r2 = (O2[0] - P1[0]) ** 2 + (O2[1] - P1[1]) ** 2;
      return { P1, P2, O1, O2, r1, r2, mx, my, chord2: 4 * (dx * dx + dy * dy) };
    };
    const lineOf = (P1, P2) => {
      const a = P2[1] - P1[1];
      const b = P1[0] - P2[0];
      const c = a * P1[0] + b * P1[1];
      return s12LineText(a, b, -c);
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const d = twoCircles();
      const { P1, P2, O1, O2, r1, r2, mx, my, chord2 } = d;
      if (r1 <= 0 || r2 <= 0) {
        i -= 1;
        continue;
      }

      if (variant === 0) {
        questions.push(
          `求兩圓 \\(C_1:${s12CircleGeneral(O1[0], O1[1], r1)}\\) 與 \\(C_2:${s12CircleGeneral(O2[0], O2[1], r2)}\\) 的公共弦方程式。`
        );
        answers.push(
          `簡答：\\(${lineOf(P1, P2)}\\)。過程：兩圓方程式相減消去 \\(x^2,y^2\\)，即得根軸（公共弦）\\(${lineOf(P1, P2)}\\)。兩交點為 \\((${P1}),(${P2})\\)。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(
          `求過圓 \\(${s12CircleGeneral(O1[0], O1[1], r1)}\\) 與直線 \\(${lineOf(P1, P2)}\\) 之交點，且圓心為 \\((${O2})\\) 的圓。`
        );
        answers.push(
          `簡答：\\(${s12CircleGeneral(O2[0], O2[1], r2)}\\)。過程：所求可設為圓系 \\(C_1+\\lambda L=0\\)。由圓心條件定出 \\(\\lambda\\)，整理得半徑平方為 ${r2}，即 \\(${s12CircleStandard(O2[0], O2[1], r2)}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        questions.push(
          `以兩圓 \\(C_1:${s12CircleGeneral(O1[0], O1[1], r1)}\\) 與 \\(C_2:${s12CircleGeneral(O2[0], O2[1], r2)}\\) 之公共弦為直徑，求圓方程式。`
        );
        answers.push(
          `簡答：\\(${s12CircleStandard(mx, my, chord2 / 4)}\\)。過程：公共弦為 \\(${lineOf(P1, P2)}\\)，與圓的交點為 \\((${P1}),(${P2})\\)。以其為直徑，圓心取中點 \\((${mx},${my})\\)，半徑平方 ${chord2 / 4}。`
        );
        continue;
      }

      if (variant === 3) {
        questions.push(
          `求過兩圓 \\(${s12CircleGeneral(O1[0], O1[1], r1)}\\) 與 \\(${s12CircleGeneral(O2[0], O2[1], r2)}\\) 之交點，且過點 \\((${P1})\\) 的直線方程式。`
        );
        answers.push(
          `簡答：\\(${lineOf(P1, P2)}\\)。過程：兩圓的交點為 \\((${P1}),(${P2})\\)，通過此兩點的直線即為公共弦 \\(${lineOf(P1, P2)}\\)（點 \\((${P1})\\) 本身就是交點之一）。`
        );
        continue;
      }

      questions.push(
        `若圓系由 \\(${s12CircleGeneral(O1[0], O1[1], r1)}\\) 與 \\(k(${lineOf(P1, P2).replace('=0', '')})=0\\) 組成，求其恆過的兩定點。`
      );
      answers.push(
        `簡答：\\((${P1}),(${P2})\\)。過程：要對所有 \\(k\\) 都成立，需同時滿足圓方程式與直線方程式，其交點即為兩定點 \\((${P1}),(${P2})\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS123PolarLineSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // 極線（切點弦）：圓心 (h,k)、半徑平方 R，外點 (x0,y0)
    // (x0-h)(x-h)+(y0-k)(y-k)=R  =>  A x + B y + C = 0
    const polar = (h, k, R, x0, y0) => {
      const A = x0 - h;
      const B = y0 - k;
      const C = -h * A - k * B - R;
      return { A, B, C };
    };
    const outsidePoint = (h, k, R) => {
      let x0;
      let y0;
      do {
        x0 = h + pickNonZero(-7, 7);
        y0 = k + randInt(-7, 7);
      } while ((x0 - h) * (x0 - h) + (y0 - k) * (y0 - k) <= R);
      return [x0, y0];
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const h = randInt(-3, 4);
        const k = randInt(-3, 4);
        const R = [5, 9, 10, 13, 16, 25][randInt(0, 5)];
        const [x0, y0] = outsidePoint(h, k, R);
        const { A, B, C } = polar(h, k, R, x0, y0);
        questions.push(
          `自圓外點 \\(P(${x0},${y0})\\) 作圓 \\(${s12CircleGeneral(h, k, R)}\\) 的切線，求兩切點連線（極線）的方程式。`
        );
        answers.push(
          `簡答：\\(${s12LineText(A, B, C)}\\)。過程：圓心為 \\((${h},${k})\\)、半徑平方為 ${R}。極線公式 \\((x_0-h)(x-h)+(y_0-k)(y-k)=r^2\\)，代入得 \\(${A}(x${s12Signed(-h)})${B >= 0 ? '+' : ''}${B}(y${s12Signed(-k)})=${R}\\)，整理為 \\(${s12LineText(A, B, C)}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        const R = [5, 10, 13, 17, 25][randInt(0, 4)];
        let x0;
        let y0;
        do {
          x0 = pickNonZero(-6, 6);
          y0 = randInt(-6, 6);
        } while (x0 * x0 + y0 * y0 <= R);
        questions.push(`已知圓 \\(C:x^2+y^2=${R}\\)，求點 \\(P(${x0},${y0})\\) 對於該圓的極線（切點弦）方程式。`);
        answers.push(
          `簡答：\\(${s12LineText(x0, y0, -R)}\\)。過程：對圓 \\(x^2+y^2=r^2\\)，點 \\((x_0,y_0)\\) 的極線為 \\(xx_0+yy_0=r^2\\)。代入得 \\(${s12VarTerm(x0, 'x')}${y0 > 0 ? '+' : ''}${s12VarTerm(y0, 'y')}=${R}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        const h = randInt(-3, 4);
        const k = randInt(-3, 4);
        const R = [5, 9, 10, 13, 16][randInt(0, 4)];
        const [x0, y0] = outsidePoint(h, k, R);
        const { A, B, C } = polar(h, k, R, x0, y0);
        questions.push(
          `若自點 \\(P\\) 向圓 \\(${s12CircleGeneral(h, k, R)}\\) 作兩切線，其切點弦方程式為 \\(${s12LineText(A, B, C)}\\)，求 \\(P\\) 點坐標。`
        );
        answers.push(
          `簡答：\\((${x0},${y0})\\)。過程：設 \\(P(x_0,y_0)\\)，由極線公式，其係數為 \\((x_0-${h},\\ y_0-${k})\\)。與已知直線比較係數（同比例）可得 \\(x_0-${h}=${A}\\)、\\(y_0-${k}=${B}\\)，解得 \\(P(${x0},${y0})\\)。`
        );
        continue;
      }

      if (variant === 3) {
        const h = randInt(-3, 4);
        const k = randInt(-3, 4);
        const R = [5, 9, 10, 13, 16, 20][randInt(0, 5)];
        const [x0, y0] = outsidePoint(h, k, R);
        const { A, B, C } = polar(h, k, R, x0, y0);
        questions.push(
          `自 \\(P(${x0},${y0})\\) 向圓 \\(${s12CircleStandard(h, k, R)}\\) 作兩切線，切點分別為 \\(M,N\\)，求直線 \\(MN\\) 的方程式。`
        );
        answers.push(
          `簡答：\\(${s12LineText(A, B, C)}\\)。過程：圓心 \\((${h},${k})\\)、半徑平方 ${R}。切點弦（極線）為 \\((x_0-h)(x-h)+(y_0-k)(y-k)=r^2\\)，代入 \\(P(${x0},${y0})\\) 整理得 \\(${s12LineText(A, B, C)}\\)。`
        );
        continue;
      }

      const h = randInt(-2, 3);
      const k = randInt(-2, 3);
      const R = [4, 9, 16, 25][randInt(0, 3)];
      const [x0, y0] = outsidePoint(h, k, R);
      const { A, B, C } = polar(h, k, R, x0, y0);
      const d2 = (x0 - h) * (x0 - h) + (y0 - k) * (y0 - k);
      questions.push(
        `設 \\(P(${x0},${y0})\\) 在圓 \\(${s12CircleStandard(h, k, R)}\\) 外，求切點弦所在直線方程式，並判斷 \\(P\\) 到圓心距離平方。`
      );
      answers.push(
        `簡答：切點弦為 \\(${s12LineText(A, B, C)}\\)，\\(\\overline{PC}^2=${d2}\\)。過程：極線公式代入 \\(P\\) 得 \\(${s12LineText(A, B, C)}\\)；又 \\(\\overline{PC}^2=(${x0}-${h})^2+(${y0}-${k})^2=${d2}>${R}\\)，確認 \\(P\\) 在圓外。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS123LightShadowProjectionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // 光源在 (0,sy)、圓心 (0,k)、半徑 r，且 (r,t,D) 為畢氏三元組、D=sy-k
    // 兩切線對 y 軸對稱，影長 = 2·sy·r/t
    const tri = [
      [3, 4, 5],
      [4, 3, 5],
      [5, 12, 13],
      [12, 5, 13],
      [8, 15, 17],
      [15, 8, 17],
      [6, 8, 10],
      [8, 6, 10],
      [7, 24, 25],
      [20, 21, 29],
    ];
    const build = () => {
      const [r, t, D] = tri[randInt(0, tri.length - 1)];
      const k = r + randInt(1, 8); // 圓完全在 x 軸上方
      const sy = k + D;
      const f = makeFraction(2 * sy * r, t);
      return { r, t, D, k, sy, f };
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const { r, t, D, k, sy, f } = build();
      const shadow = formatFraction(f.num, f.den);

      if (variant === 0) {
        questions.push(
          `在 \\((0,${sy})\\) 處有一光源，將圓 \\(${s12CircleGeneral(0, k, r * r)}\\) 投射到 \\(x\\) 軸上，求影長。`
        );
        answers.push(
          `簡答：$${shadow}$。過程：圓心 \\((0,${k})\\)、半徑 ${r}，光源到圓心距離 \\(D=${sy}-${k}=${D}\\)，切線長 \\(t=\\sqrt{${D}^2-${r}^2}=${t}\\)。由對稱性，影長 \\(=\\frac{2\\cdot${sy}\\cdot${r}}{${t}}=${shadow}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(
          `坐標平面上 \\((0,${sy})\\) 處有一光源，將圓 \\(${s12CircleStandard(0, k, r * r)}\\) 投射在直線 \\(y=0\\) 上，求陰影長度。`
        );
        answers.push(
          `簡答：$${shadow}$。過程：兩條切線關於 \\(y\\) 軸對稱。光源到圓心距離為 ${D}，切線長 \\(t=${t}\\)。以相似三角形可得影長 \\(=\\frac{2\\cdot${sy}\\cdot${r}}{${t}}=${shadow}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        questions.push(
          `光源在 \\((0,${sy})\\)，半徑 ${r} 的圓形物體圓心在 \\((0,${k})\\)。求它在 \\(x\\) 軸上投影的陰影寬度。`
        );
        answers.push(
          `簡答：$${shadow}$。過程：由光源作兩條切線，切線長 \\(t=\\sqrt{${D}^2-${r}^2}=${t}\\)。影子兩端為切線與 \\(x\\) 軸的交點，寬度為 \\(\\frac{2\\cdot${sy}\\cdot${r}}{${t}}=${shadow}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        questions.push(
          `已知光源在 \\((0,${sy})\\)，圓 \\(${s12CircleStandard(0, k, r * r)}\\) 在 \\(x\\) 軸的影子以原點為中心對稱，求影子右端點的坐標。`
        );
        answers.push(
          `簡答：\\((${formatFraction(f.num, 2 * f.den)},0)\\)。過程：影長為 $${shadow}$，且影子關於 \\(y\\) 軸對稱，故右端點的 \\(x\\) 坐標為影長的一半，即 \\(${formatFraction(f.num, 2 * f.den)}\\)。`
        );
        continue;
      }

      questions.push(
        `一個半徑 ${r} 的圓形物體，圓心在 \\((0,${k})\\)，光源置於其正上方 \\((0,${sy})\\)。求地面（\\(x\\) 軸）上陰影的長度。`
      );
      answers.push(
        `簡答：$${shadow}$。過程：光源到圓心距離 \\(D=${D}\\)，切線長 \\(t=\\sqrt{${D * D}-${r * r}}=${t}\\)。由相似三角形，影長 \\(=\\frac{2\\cdot${sy}\\cdot${r}}{${t}}=${shadow}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS123LineCircleParameterRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const r = randInt(1, 12);
        const la = pickNonZero(1, 5);
        const lb = pickNonZero(-5, 5);
        const nrm = la * la + lb * lb;
        const bound = formatRadical(nrm * r * r);
        questions.push(
          `討論直線 \\(${s12VarTerm(la, 'x')}${lb > 0 ? '+' : ''}${s12VarTerm(lb, 'y')}+k=0\\) 與圓 \\(x^2+y^2=${r * r}\\) 的相交情形，並用 \\(k\\) 表示相交於 0、1、2 點的範圍。`
        );
        answers.push(
          `簡答：\\(|k|<${bound}\\) 時交於 2 點；\\(|k|=${bound}\\) 時相切；\\(|k|>${bound}\\) 時無交點。過程：圓心為 \\((0,0)\\)、半徑 ${r}。圓心到直線的距離為 \\(d=\\frac{|k|}{\\sqrt{${nrm}}}\\)。比較 \\(d\\) 與半徑 ${r}，即得上述三種情形。`
        );
        continue;
      }

      if (type === 1) {
        const mAbs = [2, 3, 4, 5, 6, 7, 8, 9][randInt(0, 7)];
        const cRadicand = mAbs * mAbs + 1;
        const cText = formatRadical(cRadicand);
        questions.push(`若直線 \\(kx-y+${cText}=0\\) 與圓 \\(x^2+y^2=1\\) 相切，求 \\(k\\) 的值。`);
        answers.push(
          `簡答：\\(k=${mAbs}\\) 或 \\(k=-${mAbs}\\)。過程：圓心 \\((0,0)\\) 到直線距離需等於半徑 1，所以 \\(\\frac{${cText}}{\\sqrt{k^2+1}}=1\\)。平方後得 \\(k^2+1=${cRadicand}\\)，因此 \\(k^2=${mAbs * mAbs}\\)，故 \\(k=\\pm${mAbs}\\)。`
        );
        continue;
      }

      if (type === 2) {
        const b = [2, 3, 4, 5, 6, 7, 8][randInt(0, 6)];
        const threshold = b * b - 1;
        questions.push(`若直線 \\(y=mx+${b}\\) 與圓 \\(x^2+y^2=1\\) 相交於相異兩點，求 \\(m\\) 的範圍。`);
        answers.push(
          `簡答：\\(m<-${formatRadical(threshold)}\\) 或 \\(m>${formatRadical(threshold)}\\)。過程：圓心到直線 \\(mx-y+${b}=0\\) 的距離為 \\(\\frac{|${b}|}{\\sqrt{m^2+1}}\\)。相異兩點表示距離小於半徑 1，因此 \\(\\frac{${b * b}}{m^2+1}<1\\)，得 \\(m^2>${threshold}\\)。`
        );
        continue;
      }

      if (type === 3) {
        const h = randInt(-6, 7);
        const k0 = randInt(-6, 7);
        const r = randInt(1, 8);
        const base = 3 * h + 4 * k0;
        questions.push(
          `若直線 \\(3x+4y=t\\) 與圓 \\(${formatS122CircleStandard(h, k0, r * r)}\\) 無交點，求 \\(t\\) 的範圍。`
        );
        answers.push(
          `簡答：\\(t<${base - 5 * r}\\) 或 \\(t>${base + 5 * r}\\)。過程：圓心為 \\(${formatS122Point({ x: h, y: k0 })}\\)，半徑為 ${r}。圓心到直線距離為 \\(\\frac{|3\\cdot(${h})+4\\cdot(${k0})-t|}{5}=\\frac{|${base}-t|}{5}\\)。無交點表示此距離大於 ${r}，所以 \\(|${base}-t|>${5 * r}\\)。`
        );
        continue;
      }

      const h = randInt(-6, 6);
      const k0 = randInt(-6, 6);
      const r = randInt(2, 9);
      const base = 3 * h + 4 * k0;
      const modes = [
        { offset: 0, relation: '相交於 2 點', reason: `小於半徑 ${r}` },
        { offset: 5 * r, relation: '相切', reason: `等於半徑 ${r}` },
        { offset: 5 * r + 5, relation: '無交點', reason: `大於半徑 ${r}` },
      ];
      const pick = modes[randInt(0, modes.length - 1)];
      const t = base + pick.offset;
      const tMoveText = t === 0 ? '' : t > 0 ? `-${t}` : `+${-t}`;
      questions.push(`判斷圓 \\(${formatS122CircleStandard(h, k0, r * r)}\\) 與直線 \\(3x+4y=${t}\\) 的位置關係。`);
      answers.push(
        `簡答：${pick.relation}。過程：圓心為 \\(${formatS122Point({ x: h, y: k0 })}\\)，半徑 ${r}。圓心到直線距離為 \\(\\frac{|3\\cdot(${h})+4\\cdot(${k0})${tMoveText}|}{5}=\\frac{${Math.abs(base - t)}}{5}=${Math.abs(base - t) / 5}\\)，${pick.reason}，所以位置關係為${pick.relation}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS123PointPowerTangentChordSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const triples = [
          { p: 5, r: 3, len: 4 },
          { p: 5, r: 4, len: 3 },
          { p: 13, r: 5, len: 12 },
          { p: 13, r: 12, len: 5 },
          { p: 10, r: 6, len: 8 },
          { p: 10, r: 8, len: 6 },
          { p: 25, r: 7, len: 24 },
          { p: 25, r: 24, len: 7 },
          { p: 17, r: 8, len: 15 },
          { p: 17, r: 15, len: 8 },
          { p: 29, r: 20, len: 21 },
          { p: 26, r: 10, len: 24 },
          { p: 15, r: 9, len: 12 },
          { p: 20, r: 12, len: 16 },
        ];
        const pick = triples[randInt(0, triples.length - 1)];
        questions.push(`已知點 \\(P(${pick.p},0)\\) 到圓 \\(x^2+y^2=${pick.r * pick.r}\\) 作切線，求切線長。`);
        answers.push(
          `簡答：${pick.len}。過程：點 \\(P\\) 到圓心距離為 ${pick.p}，半徑為 ${pick.r}。切線長平方為 \\(OP^2-r^2=${pick.p * pick.p}-${pick.r * pick.r}=${pick.len * pick.len}\\)，所以切線長為 ${pick.len}。`
        );
        continue;
      }

      if (type === 1) {
        const mSlope = randInt(1, 5);
        const dCoef = -2 * randInt(1, 6);
        const sq = 1 + mSlope * mSlope;
        const upper = makeFraction(-dCoef, sq);
        questions.push(
          `已知點 \\(P(a,${mSlope === 1 ? '' : mSlope}a)\\) 在圓 \\(x^2+y^2${s12Signed(dCoef)}x=0\\) 的內部，求 \\(a\\) 的範圍。`
        );
        answers.push(
          `簡答：\\(0<a<${formatFraction(upper.num, upper.den)}\\)。過程：點在圓內表示代入圓方程式後小於 0。代入 \\((a,${mSlope === 1 ? '' : mSlope}a)\\) 得 \\(a^2+${mSlope * mSlope}a^2${s12Signed(dCoef)}a=${sq}a^2${s12Signed(dCoef)}a<0\\)，分解為 \\(a(${sq}a${s12Signed(dCoef)})<0\\)，所以 \\(0<a<${formatFraction(upper.num, upper.den)}\\)。`
        );
        continue;
      }

      if (type === 2) {
        const templates = [
          { d: -6, e: 2, f: 5 },
          { d: 4, e: -8, f: 7 },
          { d: -10, e: -2, f: 13 },
        ];
        const pick = templates[randInt(0, templates.length - 1)];
        const lenText = formatRadical(pick.f);
        questions.push(
          `求原點 \\(O(0,0)\\) 到圓 \\(x^2+y^2${pick.d >= 0 ? '+' : ''}${pick.d}x${pick.e >= 0 ? '+' : ''}${pick.e}y+${pick.f}=0\\) 的切線長。`
        );
        answers.push(
          `簡答：\\(${lenText}\\)。過程：對圓 \\(x^2+y^2+dx+ey+f=0\\)，點 \\((0,0)\\) 的冪為 \\(f\\)，也就是切線長平方。此題 \\(f=${pick.f}\\)，所以切線長為 \\(${lenText}\\)。`
        );
        continue;
      }

      if (type === 3) {
        // 圓心 (h,k)、半徑平方 R；取圓外一點 A，其冪 = AP·AQ
        const h3 = randInt(-4, 4);
        const k3 = randInt(-4, 4);
        const R3 = [4, 9, 16, 25][randInt(0, 3)];
        let ax0 = 0;
        let ay0 = 0;
        let powVal = 0;
        for (let g = 0; g < 60; g += 1) {
          ax0 = h3 + pickNonZero(-8, 8);
          ay0 = k3 + randInt(-8, 8);
          powVal = (ax0 - h3) ** 2 + (ay0 - k3) ** 2 - R3;
          if (powVal > 0) break;
        }
        if (powVal <= 0) {
          i -= 1;
          continue;
        }
        const dd0 = -2 * h3;
        const ee0 = -2 * k3;
        const ff0 = h3 * h3 + k3 * k3 - R3;
        questions.push(
          `設 \\(A(${ax0},${ay0})\\)，任一直線過 \\(A\\) 且與圓 \\(${s12CircleGeneral(h3, k3, R3)}\\) 交於兩點 \\(P,Q\\)。求 \\(AP\\cdot AQ\\) 的值。`
        );
        answers.push(
          `簡答：${powVal}。過程：由點冪定理，\\(AP\\cdot AQ\\) 等於點 \\(A\\) 對圓的冪（\\(A\\) 在圓外時為正）。圓心為 \\((${h3},${k3})\\)、半徑平方 ${R3}，所以冪為 \\((${ax0}-${h3})^2+(${ay0}-${k3})^2-${R3}=${powVal}\\)，故 \\(AP\\cdot AQ=${powVal}\\)。`
        );
        continue;
      }

      const h = randInt(-3, 3);
      const k0 = randInt(-3, 3);
      const r = randInt(2, 5);
      const px = h + r + randInt(2, 5);
      const py = k0;
      const power = (px - h) * (px - h) - r * r;
      questions.push(
        `設點 \\(P(${px},${py})\\)，從 \\(P\\) 向圓 \\(${formatS122CircleStandard(h, k0, r * r)}\\) 作兩切線，切點為 \\(M,N\\)。求 \\(PM^2\\) 的值。`
      );
      answers.push(
        `簡答：${power}。過程：點到圓的切線長平方等於點冪。\\(PC=${Math.abs(px - h)}\\)，半徑為 ${r}，所以 \\(PM^2=PC^2-r^2=${Math.abs(px - h)}^2-${r}^2=${power}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS123VerticalTangentTrapSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const formatDifference = (variable, value) => {
      if (value === 0) return variable;
      return value > 0 ? `${variable}-${value}` : `${variable}+${-value}`;
    };

    for (let i = 0; i < count; i += 1) {
      const h = randInt(-3, 3);
      const k = randInt(-3, 3);
      const r = randInt(1, 4);
      const side = randInt(0, 1) === 0 ? -1 : 1;
      let t = pickNonZero(-6, 6);
      while (Math.abs(t) <= r) t = pickNonZero(-6, 6);
      const px = h + side * r;
      const py = k + t;
      const rawNum = side * (t * t - r * r);
      const rawDen = 2 * r * t;
      const frac = reduceFraction(rawNum, rawDen);
      const line = formatS123LineEquation(
        frac.numerator,
        -frac.denominator,
        frac.denominator * py - frac.numerator * px
      );
      const vertical = `x=${px}`;
      const slopeText = formatFraction(rawNum, rawDen);
      questions.push(
        `求過圓外點 \\(P${formatS122Point({ x: px, y: py })}\\) 且與圓 \\(${formatS122CircleStandard(h, k, r * r)}\\) 相切的兩條直線方程式。`
      );
      answers.push(
        `簡答：\\(${vertical}\\) 或 \\(${line}\\)。過程：因為 \\(P\\) 的 \\(x\\) 坐標正好是圓心 \\(x\\) 坐標加上半徑或減去半徑，所以一條切線是鉛直線 \\(${vertical}\\)。另一條不可用鉛直線表示，設為 \\(${formatDifference('y', py)}=m(${formatDifference('x', px)})\\)。由圓心到直線距離等於半徑 ${r}，可得 \\(m=${slopeText}\\)，整理為 \\(${line}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS123IntegerDistanceCountingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const isPrime = (n) => {
      if (n < 2) return false;
      for (let d = 2; d * d <= n; d += 1) {
        if (n % d === 0) return false;
      }
      return true;
    };
    const countByDistance = (minD, maxD, predicate) => {
      let distanceCount = 0;
      let pointCount = 0;
      for (let d = Math.ceil(minD); d <= Math.floor(maxD); d += 1) {
        if (!predicate(d)) continue;
        distanceCount += 1;
        pointCount += d === minD || d === maxD ? 1 : 2;
      }
      return { distanceCount, pointCount };
    };
    const templates = [
      {
        q: () => {
          const c = randInt(6, 22);
          const r = randInt(2, 9);
          const minD = c - r;
          const maxD = c + r;
          const result = countByDistance(minD, maxD, () => true);
          return {
            question: `求原點 \\(O(0,0)\\) 到圓 \\((x-${c})^2+y^2=${r * r}\\) 上，距離值為整數的點共有幾個？`,
            answer: `簡答：${result.pointCount} 個。過程：圓心為 \\(C(${c},0)\\)，半徑為 ${r}，所以 \\(O\\) 到圓上點的距離範圍為 \\(${c}-${r}\\leq OP\\leq${c}+${r}\\)，即 \\(${minD}\\leq OP\\leq${maxD}\\)。每個介於中間的整數距離會對應 2 點，兩端距離各對應 1 點，因此共有 \\(2\\cdot${result.distanceCount}-2=${result.pointCount}\\) 個點。`,
          };
        },
      },
      {
        q: () => {
          const c = 9 + randInt(0, 12);
          const r = 4;
          const minD = c - r;
          const maxD = c + r;
          const result = countByDistance(minD, maxD, isPrime);
          return {
            question: `已知圓 \\((x-${c})^2+y^2=${r * r}\\)，求圓上到原點距離為質數的點共有幾個？`,
            answer: `簡答：${result.pointCount} 個。過程：原點到圓上點的距離介於 \\(${minD}\\) 與 \\(${maxD}\\) 之間。此範圍內的質數距離共有 ${result.distanceCount} 個；若距離不是端點，會對稱得到 2 點，若剛好是端點則只有 1 點。逐一計數得 ${result.pointCount} 個點。`,
          };
        },
      },
      {
        q: () => {
          const c = randInt(7, 24);
          const r = 3;
          const minD = c - r;
          const maxD = c + r;
          const result = countByDistance(minD, maxD, (d) => d % 2 === 1);
          return {
            question: `判斷圓 \\((x-${c})^2+y^2=${r * r}\\) 上，有幾個點到原點的距離為奇數？`,
            answer: `簡答：${result.pointCount} 個。過程：距離範圍是 \\(${minD}\\leq OP\\leq${maxD}\\)。其中奇數距離共有 ${result.distanceCount} 個；中間距離各給 2 點，端點若符合只給 1 點，所以共有 ${result.pointCount} 個點。`,
          };
        },
      },
      {
        q: () => {
          const c = randInt(7, 24);
          const r = randInt(2, 9);
          const distance = c;
          return {
            question: `圓 \\((x-${c})^2+y^2=${r * r}\\) 上，到原點距離等於 ${distance} 的點共有幾個？`,
            answer: `簡答：2 個。過程：原點到圓上點的距離範圍為 \\(${c - r}\\leq OP\\leq${c + r}\\)。因為 ${distance} 在兩端之間，不是最短或最遠距離，所以與以原點為圓心、半徑 ${distance} 的圓相交於 2 點。`,
          };
        },
      },
      {
        q: () => {
          const c = randInt(6, 23);
          const r = randInt(2, 9);
          const endDistance = c + r;
          return {
            question: `圓 \\((x-${c})^2+y^2=${r * r}\\) 上，到原點距離等於最大值的點共有幾個？最大距離是多少？`,
            answer: `簡答：1 個，最大距離為 ${endDistance}。過程：原點與圓心距離為 ${c}，半徑為 ${r}，最大距離為 \\(${c}+${r}=${endDistance}\\)。最大距離只發生在原點、圓心連線延長方向上的端點，所以只有 1 個點。`,
          };
        },
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length].q();
      questions.push(item.question);
      answers.push(item.answer);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS123CommonChordDiameterCircleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const twoCircles = () => {
      const mx = randInt(-4, 5);
      const my = randInt(-4, 5);
      const dx = pickNonZero(-4, 4);
      const dy = randInt(-4, 4);
      const P1 = [mx - dx, my - dy];
      const P2 = [mx + dx, my + dy];
      let t1 = pickNonZero(-3, 3);
      let t2 = pickNonZero(-3, 3);
      if (t1 === t2) t2 = t1 + 1;
      const O1 = [mx - dy * t1, my + dx * t1];
      const O2 = [mx - dy * t2, my + dx * t2];
      const r1 = (O1[0] - P1[0]) ** 2 + (O1[1] - P1[1]) ** 2;
      const r2 = (O2[0] - P1[0]) ** 2 + (O2[1] - P1[1]) ** 2;
      return { P1, P2, O1, O2, r1, r2, mx, my, chord2: 4 * (dx * dx + dy * dy) };
    };
    const lineOf = (P1, P2) => {
      const a = P2[1] - P1[1];
      const b = P1[0] - P2[0];
      const c = a * P1[0] + b * P1[1];
      return s12LineText(a, b, -c);
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const d = twoCircles();
      const { P1, P2, O1, O2, r1, r2, mx, my, chord2 } = d;
      if (r1 <= 0 || r2 <= 0) {
        i -= 1;
        continue;
      }
      const half = chord2 / 4;

      if (variant === 0 || variant === 3) {
        questions.push(
          `求以兩圓 \\(${s12CircleGeneral(O1[0], O1[1], r1)}\\) 與 \\(${s12CircleGeneral(O2[0], O2[1], r2)}\\) 的公共弦為直徑的圓方程式。`
        );
        answers.push(
          `簡答：\\(${s12CircleStandard(mx, my, half)}\\)。過程：兩式相減得公共弦 \\(${lineOf(P1, P2)}\\)，代回可得兩交點 \\((${P1}),(${P2})\\)。以此弦為直徑，圓心為中點 \\((${mx},${my})\\)，半徑平方 \\(\\left(\\frac{\\overline{P_1P_2}}2\\right)^2=${half}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(
          `兩圓 \\(${s12CircleGeneral(O1[0], O1[1], r1)}\\) 與 \\(${s12CircleGeneral(O2[0], O2[1], r2)}\\) 相交於 \\(P,Q\\)，求以 \\(\\overline{PQ}\\) 為直徑之圓的圓心與半徑。`
        );
        answers.push(
          `簡答：圓心 \\((${mx},${my})\\)，半徑 \\(${formatRadical(half)}\\)。過程：兩交點為 \\((${P1}),(${P2})\\)，其中點即為圓心，半徑為 \\(\\frac12\\overline{PQ}=${formatRadical(half)}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        questions.push(
          `求兩圓 \\(${s12CircleGeneral(O1[0], O1[1], r1)}\\) 與 \\(${s12CircleGeneral(O2[0], O2[1], r2)}\\) 公共弦的長度。`
        );
        answers.push(
          `簡答：\\(${formatRadical(chord2)}\\)。過程：兩式相減得公共弦 \\(${lineOf(P1, P2)}\\)，與圓求交得 \\((${P1}),(${P2})\\)，其距離為 \\(${formatRadical(chord2)}\\)。`
        );
        continue;
      }

      questions.push(
        `已知兩圓 \\(${s12CircleGeneral(O1[0], O1[1], r1)}\\) 與 \\(${s12CircleGeneral(O2[0], O2[1], r2)}\\) 相交，求以其公共弦為直徑之圓的面積。`
      );
      answers.push(
        `簡答：\\(${half}\\pi\\)。過程：公共弦兩端為 \\((${P1}),(${P2})\\)，以其為直徑的圓半徑平方為 ${half}，面積 \\(${half}\\pi\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS123CircleAreaExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;
      if (type === 0) {
        const qPool = [
          { x: 3, y: -4, len: 5 },
          { x: 4, y: 3, len: 5 },
          { x: 5, y: 12, len: 13 },
          { x: 12, y: -5, len: 13 },
          { x: 8, y: -15, len: 17 },
          { x: 15, y: 8, len: 17 },
          { x: 7, y: 24, len: 25 },
          { x: 24, y: -7, len: 25 },
          { x: 20, y: 21, len: 29 },
          { x: 9, y: -12, len: 15 },
          { x: 6, y: 8, len: 10 },
        ];
        const point = qPool[randInt(0, qPool.length - 1)];
        const qx = point.x;
        const qy = point.y;
        const qLen2 = qx * qx + qy * qy;
        const lenText = formatRadical(qLen2);
        questions.push(
          `若 \\(P\\) 為單位圓 \\(x^2+y^2=1\\) 上任一點，令 \\(O(0,0)\\)、\\(Q(${qx},${qy})\\)，求 \\(\\triangle OPQ\\) 面積的最大值。`
        );
        answers.push(
          `簡答：\\(${formatFraction(point.len, 2)}\\)。過程：\\(\\triangle OPQ\\) 面積為 \\(\\frac12|\\overrightarrow{OP}\\times\\overrightarrow{OQ}|\\)。當 \\(OP\\perp OQ\\) 時最大，且 \\(OP=1\\)、\\(OQ=${lenText}\\)，所以最大面積為 \\(\\frac12\\cdot1\\cdot${lenText}=${formatFraction(point.len, 2)}\\)。`
        );
        continue;
      }

      if (type === 1) {
        const r = [2, 3, 4, 5, 6, 7, 8, 9][randInt(0, 7)];
        questions.push(
          `在圓 \\(x^2+y^2=${r * r}\\) 的第一象限內作一個邊平行坐標軸、兩邊貼在坐標軸上的內接矩形，求其最大面積。`
        );
        answers.push(
          `簡答：${(r * r) / 2}。過程：設右上頂點為 \\((x,y)\\)，則 \\(x^2+y^2=${r * r}\\)，矩形面積為 \\(xy\\)。由 \\((x-y)^2\\geq0\\)，得 \\(2xy\\leq x^2+y^2=${r * r}\\)，所以 \\(xy\\leq${(r * r) / 2}\\)。等號在 \\(x=y\\) 時成立。`
        );
        continue;
      }

      if (type === 2) {
        const triples = [
          { a: 3, b: -4 },
          { a: 3, b: 4 },
          { a: 4, b: -3 },
          { a: 5, b: 12 },
          { a: 12, b: -5 },
          { a: 8, b: -6 },
          { a: 6, b: 8 },
          { a: 8, b: 15 },
          { a: 15, b: -8 },
          { a: 7, b: 24 },
          { a: 9, b: -12 },
          { a: 20, b: 21 },
        ].map((t) => ({ ...t, r: randInt(1, 9) }));
        const pick = triples[randInt(0, triples.length - 1)];
        const lenValue = Math.sqrt(pick.a * pick.a + pick.b * pick.b);
        const len = formatRadical(pick.a * pick.a + pick.b * pick.b);
        const extreme = pick.r * lenValue;
        questions.push(
          `已知 \\((x,y)\\) 滿足 \\(x^2+y^2\\leq${pick.r * pick.r}\\)，求 \\(${pick.a}x${pick.b >= 0 ? '+' : ''}${pick.b}y\\) 的最大值與最小值。`
        );
        answers.push(
          `簡答：最大值 \\(${extreme}\\)，最小值 \\(-${extreme}\\)。過程：線性式 \\(${pick.a}x${pick.b >= 0 ? '+' : ''}${pick.b}y\\) 在圓盤上的極值為 \\(\\pm r\\sqrt{a^2+b^2}\\)。此題 \\(r=${pick.r}\\)，\\(\\sqrt{a^2+b^2}=${len}\\)，所以最大值為 ${extreme}，最小值為 \\(-${extreme}\\)。`
        );
        continue;
      }

      if (type === 3) {
        const h = randInt(-3, 3);
        const k0 = randInt(-3, 3);
        const r = randInt(1, 3);
        const lineC = h + k0;
        const line = formatS123LineEquation(1, 1, -lineC);
        questions.push(
          `若點 \\(P\\) 在圓 \\(${formatS122CircleStandard(h, k0, r * r)}\\) 上移動，求 \\(P\\) 到直線 \\(${line}\\) 所形成、以該距離為高且底為 4 的三角形面積最大值。`
        );
        answers.push(
          `簡答：${2 * r}。過程：直線 \\(${line}\\) 通過圓心 \\(${formatS122Point({ x: h, y: k0 })}\\)。圓上點到一條過圓心直線的最大距離就是半徑 ${r}，所以三角形面積最大為 \\(\\frac12\\cdot4\\cdot${r}=${2 * r}\\)。`
        );
        continue;
      }

      const r = randInt(2, 6);
      questions.push(
        `同一圓 \\(x^2+y^2=${r * r}\\) 內接一個正三角形，並外切一個正三角形，求內接正三角形面積與外切正三角形面積之比。`
      );
      answers.push(
        `簡答：\\(1:4\\)。過程：同一圓作為內接正三角形的外接圓時，面積為 \\(\\frac{3\\sqrt3}{4}r^2\\)；作為外切正三角形的內切圓時，面積為 \\(3\\sqrt3 r^2\\)。兩者相比為 \\(\\frac{3\\sqrt3}{4}r^2:3\\sqrt3 r^2=1:4\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }
  // ── s1-2-1 新增：兩直線角平分線方程式 ──────────────────────────────
  function buildS121AngleBisectorLinesSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function fmtL(a, b, c) {
      const xp = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
      const yp = b === 0 ? '' : b === 1 ? '+y' : b === -1 ? '-y' : b > 0 ? `+${b}y` : `${b}y`;
      return `${xp}${yp}=${c}`;
    }
    function sm(v) {
      return v >= 0 ? `-${v}` : `+${-v}`;
    }

    const modes = [
      {
        a1: 3,
        b1: 4,
        a2: 4,
        b2: -3,
        norm: 5,
        getBis(d1, d2) {
          return [`x-7y=${d2 - d1}`, `7x+y=${d1 + d2}`];
        },
        getProc(d1, d2) {
          return (
            `法向量 \\((3,4)\\) 與 \\((4,-3)\\) 模均為 5。` +
            `由 \\(3x+4y${sm(d1)}=\\pm(4x-3y${sm(d2)})\\)，` +
            `取正號得 \\(x-7y=${d2 - d1}\\)；取負號得 \\(7x+y=${d1 + d2}\\)。`
          );
        },
      },
      {
        a1: 4,
        b1: 3,
        a2: 3,
        b2: -4,
        norm: 5,
        getBis(d1, d2) {
          return [`x+7y=${d1 - d2}`, `7x-y=${d1 + d2}`];
        },
        getProc(d1, d2) {
          return (
            `法向量 \\((4,3)\\) 與 \\((3,-4)\\) 模均為 5。` +
            `由 \\(4x+3y${sm(d1)}=\\pm(3x-4y${sm(d2)})\\)，` +
            `取正號得 \\(x+7y=${d1 - d2}\\)；取負號得 \\(7x-y=${d1 + d2}\\)。`
          );
        },
      },
      {
        a1: 5,
        b1: 12,
        a2: 12,
        b2: -5,
        norm: 13,
        getBis(d1, d2) {
          return [`7x-17y=${d2 - d1}`, `17x+7y=${d1 + d2}`];
        },
        getProc(d1, d2) {
          return (
            `法向量 \\((5,12)\\) 與 \\((12,-5)\\) 模均為 13。` +
            `由 \\(5x+12y${sm(d1)}=\\pm(12x-5y${sm(d2)})\\)，` +
            `取正號得 \\(7x-17y=${d2 - d1}\\)；取負號得 \\(17x+7y=${d1 + d2}\\)。`
          );
        },
      },
      {
        a1: 3,
        b1: 4,
        a2: -4,
        b2: 3,
        norm: 5,
        getBis(d1, d2) {
          return [`7x+y=${d1 - d2}`, `x-7y=${-(d1 + d2)}`];
        },
        getProc(d1, d2) {
          return (
            `法向量 \\((3,4)\\) 與 \\((-4,3)\\) 模均為 5。` +
            `由 \\(3x+4y${sm(d1)}=\\pm(-4x+3y${sm(d2)})\\)，` +
            `取正號得 \\(7x+y=${d1 - d2}\\)；取負號得 \\(x-7y=${-(d1 + d2)}\\)。`
          );
        },
      },
      {
        a1: 8,
        b1: 15,
        a2: 15,
        b2: -8,
        norm: 17,
        getBis(d1, d2) {
          return [`7x-23y=${d2 - d1}`, `23x+7y=${d1 + d2}`];
        },
        getProc(d1, d2) {
          return (
            `法向量 \\((8,15)\\) 與 \\((15,-8)\\) 模均為 17。` +
            `由 \\(8x+15y${sm(d1)}=\\pm(15x-8y${sm(d2)})\\)，` +
            `取正號得 \\(7x-23y=${d2 - d1}\\)；取負號得 \\(23x+7y=${d1 + d2}\\)。`
          );
        },
      },
    ];

    const dVals = [-10, -5, 5, 10, 15, 20];

    for (let i = 0; i < count; i += 1) {
      const m = modes[i % 5];
      const d1 = dVals[randInt(0, dVals.length - 1)];
      let d2 = dVals[randInt(0, dVals.length - 1)];
      while (d2 === d1) d2 = dVals[randInt(0, dVals.length - 1)];
      const L1 = fmtL(m.a1, m.b1, d1);
      const L2 = fmtL(m.a2, m.b2, d2);
      const [B1, B2] = m.getBis(d1, d2);
      questions.push(`求直線 \\(${L1}\\) 與直線 \\(${L2}\\) 夾角的兩條角平分線方程式。`);
      answers.push(`簡答：\\(${B1}\\) 及 \\(${B2}\\)。過程：${m.getProc(d1, d2)}`);
    }

    return { questions, summaryAnswers, answers };
  }

  // ── s1-2-2 新增：點與圓的位置關係及切線長 ──────────────────────────
  function buildS122PointCircleRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    const off5 = [
      [3, 4],
      [4, 3],
      [-3, 4],
      [4, -3],
      [3, -4],
      [-4, 3],
    ];
    const off13 = [
      [5, 12],
      [12, 5],
      [-5, 12],
      [12, -5],
      [5, -12],
      [-12, 5],
    ];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const h = randInt(-4, 4);
      const k = randInt(-4, 4);

      if (mode === 0) {
        // 圓外 d=5 r=3 切線=4
        const [dx, dy] = off5[randInt(0, off5.length - 1)];
        const px = h + dx,
          py = k + dy;
        const circ = formatS122CircleStandard(h, k, 9);
        questions.push(`判斷點 \\(P(${px},\\,${py})\\) 與圓 \\(${circ}\\) 的位置關係，若在圓外則求切線長。`);
        answers.push(
          `簡答：\\(P\\) 在圓外，切線長為 4。` +
            `過程：圓心 \\((${h},${k})\\)，半徑 \\(r=3\\)。` +
            `\\(d^2=${formatSquareSumText(dx, dy)}=${dx * dx + dy * dy}\\)，` +
            `\\(d=5>3\\)，故 \\(P\\) 在圓外。切線長 \\(=\\sqrt{25-9}=4\\)。`
        );
      } else if (mode === 1) {
        // 圓外 d=5 r=4 切線=3
        const [dx, dy] = off5[randInt(0, off5.length - 1)];
        const px = h + dx,
          py = k + dy;
        const circ = formatS122CircleStandard(h, k, 16);
        questions.push(`判斷點 \\(P(${px},\\,${py})\\) 與圓 \\(${circ}\\) 的位置關係，若在圓外則求切線長。`);
        answers.push(
          `簡答：\\(P\\) 在圓外，切線長為 3。` +
            `過程：圓心 \\((${h},${k})\\)，半徑 \\(r=4\\)。` +
            `\\(d^2=${formatSquareSumText(dx, dy)}=${dx * dx + dy * dy}\\)，` +
            `\\(d=5>4\\)，故 \\(P\\) 在圓外。切線長 \\(=\\sqrt{25-16}=3\\)。`
        );
      } else if (mode === 2) {
        // 圓外 d=13 r=5 切線=12
        const [dx, dy] = off13[randInt(0, off13.length - 1)];
        const px = h + dx,
          py = k + dy;
        const circ = formatS122CircleStandard(h, k, 25);
        questions.push(`判斷點 \\(P(${px},\\,${py})\\) 與圓 \\(${circ}\\) 的位置關係，若在圓外則求切線長。`);
        answers.push(
          `簡答：\\(P\\) 在圓外，切線長為 12。` +
            `過程：圓心 \\((${h},${k})\\)，半徑 \\(r=5\\)。` +
            `\\(d^2=${formatSquareSumText(dx, dy)}=${dx * dx + dy * dy}\\)，` +
            `\\(d=13>5\\)，故 \\(P\\) 在圓外。切線長 \\(=\\sqrt{169-25}=12\\)。`
        );
      } else if (mode === 3) {
        // 在圓上 d=r=5
        const [dx, dy] = off5[randInt(0, off5.length - 1)];
        const px = h + dx,
          py = k + dy;
        const circ = formatS122CircleStandard(h, k, 25);
        questions.push(`判斷點 \\(P(${px},\\,${py})\\) 與圓 \\(${circ}\\) 的位置關係。`);
        answers.push(
          `簡答：\\(P\\) 在圓上。` +
            `過程：圓心 \\((${h},${k})\\)，半徑 \\(r=5\\)。` +
            `\\(d^2=${formatSquareSumText(dx, dy)}=${dx * dx + dy * dy}=25=r^2\\)，故 \\(P\\) 在圓上。`
        );
      } else {
        // 在圓內 d<5
        const smalls = [
          [3, 0],
          [0, 3],
          [4, 0],
          [0, 4],
          [2, 2],
          [1, 3],
          [3, 1],
        ];
        const [ax, ay] = smalls[randInt(0, smalls.length - 1)];
        const sx = randInt(0, 1) === 0 ? 1 : -1,
          sy = randInt(0, 1) === 0 ? 1 : -1;
        const dx = ax * sx,
          dy = ay * sy;
        const d2 = dx * dx + dy * dy;
        const px = h + dx,
          py = k + dy;
        const circ = formatS122CircleStandard(h, k, 25);
        questions.push(`判斷點 \\(P(${px},\\,${py})\\) 與圓 \\(${circ}\\) 的位置關係。`);
        answers.push(
          `簡答：\\(P\\) 在圓內。` +
            `過程：圓心 \\((${h},${k})\\)，半徑 \\(r=5\\)。` +
            `\\(d^2=${formatSquareSumText(dx, dy)}=${d2}<25=r^2\\)，故 \\(P\\) 在圓內，無切線。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // ── s1-2-3 新增：直線與圓的交點坐標 ────────────────────────────────
  function buildS123LineCirIntersectionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function signC(c) {
      return c >= 0 ? `+${c}` : `${c}`;
    }
    function xSqTerm(h) {
      if (h === 0) return 'x^2';
      return h > 0 ? `(x-${h})^2` : `(x+${-h})^2`;
    }
    function xSolveTerm(h) {
      if (h === 0) return 'x';
      return h > 0 ? `x-${h}` : `x+${-h}`;
    }

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        // 水平線 y=k 與 x^2+y^2=r^2
        const cases = [
          { r: 5, k: 3, xv: 4 },
          { r: 5, k: 4, xv: 3 },
          { r: 13, k: 5, xv: 12 },
          { r: 13, k: 12, xv: 5 },
          { r: 10, k: 6, xv: 8 },
          { r: 10, k: 8, xv: 6 },
          { r: 17, k: 8, xv: 15 },
          { r: 17, k: 15, xv: 8 },
          { r: 25, k: 7, xv: 24 },
          { r: 25, k: 24, xv: 7 },
          { r: 25, k: 15, xv: 20 },
          { r: 25, k: 20, xv: 15 },
          { r: 15, k: 9, xv: 12 },
          { r: 15, k: 12, xv: 9 },
          { r: 20, k: 12, xv: 16 },
          { r: 29, k: 20, xv: 21 },
        ];
        const { r, k, xv } = cases[randInt(0, cases.length - 1)];
        const kv = (randInt(0, 1) === 0 ? 1 : -1) * k;
        questions.push(`求直線 \\(y=${kv}\\) 與圓 \\(x^2+y^2=${r * r}\\) 的交點坐標。`);
        answers.push(
          `簡答：\\((${xv},${kv})\\) 與 \\((-${xv},${kv})\\)。` +
            `過程：代入 \\(y=${kv}\\) 得 \\(x^2+${kv * kv}=${r * r}\\)，` +
            `\\(x^2=${r * r - kv * kv}\\)，\\(x=\\pm${xv}\\)。`
        );
      } else if (mode === 1) {
        // 垂直線 x=h 與 x^2+y^2=r^2
        const cases = [
          { r: 5, h: 3, yv: 4 },
          { r: 5, h: 4, yv: 3 },
          { r: 13, h: 5, yv: 12 },
          { r: 13, h: 12, yv: 5 },
          { r: 10, h: 6, yv: 8 },
          { r: 10, h: 8, yv: 6 },
          { r: 17, h: 8, yv: 15 },
          { r: 17, h: 15, yv: 8 },
          { r: 25, h: 7, yv: 24 },
          { r: 25, h: 24, yv: 7 },
          { r: 25, h: 15, yv: 20 },
          { r: 25, h: 20, yv: 15 },
          { r: 15, h: 9, yv: 12 },
          { r: 15, h: 12, yv: 9 },
          { r: 20, h: 12, yv: 16 },
          { r: 29, h: 20, yv: 21 },
        ];
        const { r, h, yv } = cases[randInt(0, cases.length - 1)];
        const hv = (randInt(0, 1) === 0 ? 1 : -1) * h;
        questions.push(`求直線 \\(x=${hv}\\) 與圓 \\(x^2+y^2=${r * r}\\) 的交點坐標。`);
        answers.push(
          `簡答：\\((${hv},${yv})\\) 與 \\((${hv},-${yv})\\)。` +
            `過程：代入 \\(x=${hv}\\) 得 \\(${hv * hv}+y^2=${r * r}\\)，` +
            `\\(y^2=${r * r - hv * hv}\\)，\\(y=\\pm${yv}\\)。`
        );
      } else if (mode === 2) {
        // y=x+c 與 x^2+y^2=25，2x^2+2cx+(c^2-25)=0
        const cases = [
          { c: 1, R: 5, P: { x: 3, y: 4 }, Q: { x: -4, y: -3 } },
          { c: -1, R: 5, P: { x: 4, y: 3 }, Q: { x: -3, y: -4 } },
          { c: 7, R: 5, P: { x: -3, y: 4 }, Q: { x: -4, y: 3 } },
          { c: -7, R: 5, P: { x: 3, y: -4 }, Q: { x: 4, y: -3 } },
          { c: 17, R: 13, P: { x: -5, y: 12 }, Q: { x: -12, y: 5 } },
          { c: -17, R: 13, P: { x: 5, y: -12 }, Q: { x: 12, y: -5 } },
          { c: 7, R: 13, P: { x: 5, y: 12 }, Q: { x: -12, y: -5 } },
          { c: -7, R: 13, P: { x: -5, y: -12 }, Q: { x: 12, y: 5 } },
          { c: 31, R: 25, P: { x: -7, y: 24 }, Q: { x: -24, y: 7 } },
          { c: -31, R: 25, P: { x: 7, y: -24 }, Q: { x: 24, y: -7 } },
          { c: 41, R: 29, P: { x: -20, y: 21 }, Q: { x: -21, y: 20 } },
          { c: -41, R: 29, P: { x: 20, y: -21 }, Q: { x: 21, y: -20 } },
        ];
        const cas = cases[randInt(0, cases.length - 1)];
        const cStr = cas.c === 0 ? 'x' : cas.c > 0 ? `x+${cas.c}` : `x${cas.c}`;
        const P = cas.P,
          Q = cas.Q;
        const RR = cas.R * cas.R;
        const coefX = 2 * cas.c,
          constT = cas.c * cas.c - RR;
        questions.push(`求直線 \\(y=${cStr}\\) 與圓 \\(x^2+y^2=${RR}\\) 的交點坐標。`);
        answers.push(
          `簡答：\\((${P.x},${P.y})\\) 與 \\((${Q.x},${Q.y})\\)。` +
            `過程：代入得 \\(2x^2${signC(coefX)}x${signC(constT)}=0\\)，` +
            `化簡解得 \\(x=${P.x}\\) 或 \\(x=${Q.x}\\)，` +
            `對應 y 值由 \\(y=${cStr}\\) 求出，交點為 \\((${P.x},${P.y})\\) 與 \\((${Q.x},${Q.y})\\)。`
        );
      } else if (mode === 3) {
        // y=-x+c 與 x^2+y^2=25，2x^2-2cx+(c^2-25)=0
        const cases = [
          { c: 1, P: { x: 4, y: -3 }, Q: { x: -3, y: 4 } },
          { c: -1, P: { x: -4, y: 3 }, Q: { x: 3, y: -4 } },
          { c: 5, P: { x: 0, y: 5 }, Q: { x: 5, y: 0 } },
          { c: 7, P: { x: 3, y: 4 }, Q: { x: 4, y: 3 } },
          { c: -7, P: { x: -3, y: -4 }, Q: { x: -4, y: -3 } },
        ];
        const cas = cases[randInt(0, cases.length - 1)];
        const cStr = cas.c === 0 ? '-x' : cas.c > 0 ? `-x+${cas.c}` : `-x${cas.c}`;
        const P = cas.P,
          Q = cas.Q;
        const coefX = -2 * cas.c,
          constT = cas.c * cas.c - 25;
        questions.push(`求直線 \\(y=${cStr}\\) 與圓 \\(x^2+y^2=25\\) 的交點坐標。`);
        answers.push(
          `簡答：\\((${P.x},${P.y})\\) 與 \\((${Q.x},${Q.y})\\)。` +
            `過程：代入得 \\(2x^2${signC(coefX)}x${signC(constT)}=0\\)，` +
            `化簡解得 \\(x=${P.x}\\) 或 \\(x=${Q.x}\\)，交點為 \\((${P.x},${P.y})\\) 與 \\((${Q.x},${Q.y})\\)。`
        );
      } else {
        // 水平線 y=k 與移心圓 (x-h0)^2+(y-k0)^2=25
        const h0 = randInt(-3, 3);
        const k0 = randInt(-3, 3);
        const deltaCases = [
          [3, 4],
          [4, 3],
          [0, 5],
        ];
        const [dk, xHalf] = deltaCases[randInt(0, deltaCases.length - 1)];
        const signDk = randInt(0, 1) === 0 ? 1 : -1;
        const k = k0 + signDk * dk;
        const diff = 25 - dk * dk;
        const x1 = h0 + xHalf,
          x2 = h0 - xHalf;
        const circEq = formatS122CircleStandard(h0, k0, 25);
        const xsolve = xSolveTerm(h0);
        questions.push(`求直線 \\(y=${k}\\) 與圓 \\(${circEq}\\) 的交點坐標。`);
        if (xHalf === 0) {
          questions[questions.length - 1] = `求直線 \\(y=${k}\\) 與圓 \\(${circEq}\\) 的切點坐標（若為切線）。`;
          answers.push(`簡答：切點 \\((${h0},${k})\\)。過程：代入得 \\(${xSqTerm(h0)}=0\\)，\\(x=${h0}\\)。`);
        } else {
          answers.push(
            `簡答：\\((${x1},${k})\\) 與 \\((${x2},${k})\\)。` +
              `過程：代入 \\(y=${k}\\) 得 \\(${xSqTerm(h0)}+${dk * dk}=25\\)，` +
              `\\(${xSqTerm(h0)}=${diff}\\)，\\(${xsolve}=\\pm${xHalf}\\)，` +
              `交點為 \\((${x1},${k})\\) 與 \\((${x2},${k})\\)。`
          );
        }
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS131CoefficientSumParitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        let a = randInt(-3, 4);
        let b = pickNonZero(-4, 4);
        while (Math.abs(1 + a + b) <= 1) {
          a = randInt(-3, 4);
          b = pickNonZero(-4, 4);
        }
        const n = randInt(3, 6);
        const value = 1 + a + b;
        const valueText = value < 0 ? `(${value})` : `${value}`;
        questions.push(
          `設 \\(f(x)=(${formatPolynomialFromCoeffs([1, a, b])})^{${n}}\\)，求 \\(f(x)\\) 展開式中所有項的係數總和。`
        );
        answers.push(
          `簡答：${Math.pow(value, n)}。過程：多項式所有項的係數總和等於 \\(f(1)\\)。所以 \\(f(1)=(1${formatSignedNumber(a)}${formatSignedNumber(b)})^{${n}}=${valueText}^{${n}}=${Math.pow(value, n)}\\)。`
        );
        continue;
      }

      if (type === 1) {
        const a = randInt(2, 5);
        const b = randInt(1, 4);
        const c = randInt(1, 3);
        const n = randInt(2, 4);
        const total = Math.pow(1 + a + b + c, n);
        const alt = Math.pow(-1 + a - b + c, n);
        const even = (total + alt) / 2;
        questions.push(
          `設 \\(f(x)=(${formatPolynomialFromCoeffs([1, a, b, c])})^{${n}}\\)，求展開式中偶次項的係數和。`
        );
        answers.push(
          `簡答：${even}。過程：所有係數和為 \\(f(1)=${total}\\)，偶次項係數和為 \\(\\frac{f(1)+f(-1)}{2}\\)。又 \\(f(-1)=(-1+${a}-${b}+${c})^{${n}}=${alt}\\)，所以偶次項係數和為 \\(\\frac{${total}${formatSignedNumber(alt)}}{2}=${even}\\)。`
        );
        continue;
      }

      if (type === 2) {
        const a = randInt(1, 4);
        const b = randInt(1, 5);
        const c = randInt(-3, 3);
        const n = randInt(2, 4);
        const total = Math.pow(1 + a + b + c, n);
        const alt = Math.pow(-1 + a - b + c, n);
        const odd = (total - alt) / 2;
        questions.push(
          `設 \\(f(x)=(${formatPolynomialFromCoeffs([1, a, b, c])})^{${n}}\\)，求展開式中奇次項的係數和。`
        );
        answers.push(
          `簡答：${odd}。過程：奇次項係數和為 \\(\\frac{f(1)-f(-1)}{2}\\)。此題 \\(f(1)=${total}\\)，\\(f(-1)=${alt}\\)，所以奇次項係數和為 \\(\\frac{${total}${formatSignedNumber(-alt)}}{2}=${odd}\\)。`
        );
        continue;
      }

      if (type === 3) {
        const k = randInt(-3, 4);
        const oddSum = 4 - 3 * k;
        questions.push(`設 \\(f(x)=(x^2+kx+1)(x^3-2x^2+x-1)\\)，已知奇次項係數和為 ${oddSum}，求實數 \\(k\\)。`);
        answers.push(
          `簡答：\\(k=${k}\\)。過程：奇次項係數和為 \\(\\frac{f(1)-f(-1)}2\\)。其中 \\(f(1)=(1+k+1)(1-2+1-1)=-(k+2)\\)，\\(f(-1)=(1-k+1)(-1-2-1-1)=-5(2-k)\\)。令 \\(\\frac{-(k+2)-[-5(2-k)]}{2}=${oddSum}\\)，可解得 \\(k=${k}\\)。`
        );
        continue;
      }

      const a = randInt(2, 5);
      const b = randInt(1, 4);
      const n = randInt(3, 6);
      const total = Math.pow(1 + a + b, n);
      const alt = Math.pow(1 - a + b, n);
      const odd = (total - alt) / 2;
      const even = (total + alt) / 2;
      questions.push(
        `設 \\(f(x)=(${formatPolynomialFromCoeffs([1, a, b])})^{${n}}\\)。若奇次項係數和為 \\(A\\)，偶次項係數和為 \\(B\\)，求 \\(A+B\\)。`
      );
      answers.push(
        `簡答：${total}。過程：奇次項係數和 \\(A=\\frac{f(1)-f(-1)}2=${odd}\\)，偶次項係數和 \\(B=\\frac{f(1)+f(-1)}2=${even}\\)。因此 \\(A+B=f(1)=${total}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS131DifferenceReversePolynomialSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const d = randInt(-4, 5);
        const c = randInt(-5, 8);
        questions.push(`設 \\(f(x)\\) 為一次式，滿足 \\(f(x+1)-f(x)=${d}\\)，且 \\(f(0)=${c}\\)，求 \\(f(x)\\)。`);
        answers.push(
          `簡答：\\(f(x)=${formatPolynomialFromCoeffs([d, c])}\\)。過程：設 \\(f(x)=ax+b\\)。則 \\(f(x+1)-f(x)=a\\)，所以 \\(a=${d}\\)。又 \\(f(0)=b=${c}\\)，故 \\(f(x)=${formatPolynomialFromCoeffs([d, c])}\\)。`
        );
        continue;
      }

      if (type === 1) {
        const a = randInt(1, 4);
        const b = randInt(-5, 5);
        const c = randInt(-3, 6);
        const A = 2 * a;
        const B = a + b;
        questions.push(
          `已知多項式 \\(f(x)\\) 滿足 \\(f(x+1)-f(x)=${formatPolynomialFromCoeffs([A, B])}\\)，且 \\(f(0)=${c}\\)，求最低次多項式 \\(f(x)\\)。`
        );
        answers.push(
          `簡答：\\(f(x)=${formatPolynomialFromCoeffs([a, b, c])}\\)。過程：設 \\(f(x)=ax^2+bx+c\\)。則 \\(f(x+1)-f(x)=2ax+(a+b)\\)。比較係數得 \\(2a=${A}\\)、\\(a+b=${B}\\)，所以 \\(a=${a},b=${b}\\)。又 \\(f(0)=c=${c}\\)。`
        );
        continue;
      }

      if (type === 2) {
        const a = randInt(1, 3);
        const b = randInt(-4, 4);
        const c = randInt(-4, 5);
        const d = randInt(-3, 3);
        const A = 3 * a;
        const B = 3 * a + 2 * b;
        const C = a + b + c;
        questions.push(
          `若 \\(f(x+1)-f(x)=${formatPolynomialFromCoeffs([A, B, C])}\\)，且 \\(f(0)=${d}\\)，求最低次多項式 \\(f(x)\\)。`
        );
        answers.push(
          `簡答：\\(f(x)=${formatPolynomialFromCoeffs([a, b, c, d])}\\)。過程：設 \\(f(x)=ax^3+bx^2+cx+d\\)。差分為 \\(3ax^2+(3a+2b)x+(a+b+c)\\)。比較係數得 \\(a=${a},b=${b},c=${c}\\)，再由 \\(f(0)=d=${d}\\)。`
        );
        continue;
      }

      if (type === 3) {
        const a = randInt(1, 5);
        const b = randInt(-6, 6);
        questions.push(
          `設 \\(f(x)\\) 為二次多項式，若 \\(f(x+2)-f(x)=${formatPolynomialFromCoeffs([4 * a, 4 * a + 2 * b])}\\)，求 \\(f(x)\\) 的最高次項係數。`
        );
        answers.push(
          `簡答：${a}。過程：設 \\(f(x)=Ax^2+Bx+C\\)，則 \\(f(x+2)-f(x)=4Ax+(4A+2B)\\)。比較 \\(x\\) 係數，\\(4A=${4 * a}\\)，所以 \\(A=${a}\\)。`
        );
        continue;
      }

      const m = randInt(2, 5);
      questions.push(`若 \\(f(x+1)-f(x)\\) 是 ${m} 次多項式，且最高次項不抵消，判斷 \\(f(x)\\) 的次數。`);
      answers.push(
        `簡答：${m + 1} 次。過程：差分會使多項式次數降低 1。也就是 \\(n\\) 次多項式做 \\(f(x+1)-f(x)\\) 後通常成為 \\(n-1\\) 次。因此差分是 ${m} 次時，原多項式 \\(f(x)\\) 應為 ${m + 1} 次。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS131PolynomialIdentityParameterSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const P = (c) => formatPolynomialFromCoeffs(c);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const p = randInt(2, 6);
        const q = randInt(-5, 6);
        const a = p;
        const b = -p;
        questions.push(`若 \\((a+b)x^3+(${p}-a)x^2+(a-b)x+${q}\\) 為一次式，求數對 \\((a,b)\\)。`);
        answers.push(
          `簡答：\\((a,b)=(${a},${b})\\)。過程：一次式表示三次項與二次項係數皆為 0，故 \\(a+b=0\\)、\\(${p}-a=0\\)，解得 \\(a=${a},b=${b}\\)；此時一次項係數 \\(a-b=${a - b}\\neq0\\)。`
        );
        continue;
      }

      if (variant === 1) {
        const r1 = randInt(1, 3);
        const r2 = r1 + randInt(1, 3);
        const a = pickNonZero(-3, 4);
        const b = pickNonZero(-4, 4);
        const c = randInt(-5, 6);
        const quad = s131PolyMul([1, -r1], [1, -r2]).map((z) => z * a);
        const g = s131PolyAdd(s131PolyAdd(quad, [b, -b * r2]), [c]);
        questions.push(`設 \\(f(x)=a(x-${r1})(x-${r2})+b(x-${r2})+c\\) 與 \\(g(x)=${P(g)}\\) 恆相等，求 \\(a,b,c\\)。`);
        answers.push(
          `簡答：\\(a=${a},b=${b},c=${c}\\)。過程：展開 \\(f(x)\\) 後與 \\(${P(g)}\\) 比較係數，由 \\(x^2\\) 係數得 \\(a=${a}\\)，由 \\(x\\) 係數得 \\(b=${b}\\)，再由常數項得 \\(c=${c}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        const p = randInt(2, 5);
        const q = randInt(-3, 4);
        const r = randInt(-3, 4);
        const s = randInt(1, 5);
        const K = randInt(3, 9);
        const a = p;
        const c = r;
        const b = r - q;
        const d = K - s;
        const rTerm = r >= 0 ? `-${r}` : `+${-r}`;
        questions.push(
          `若 \\((a-${p})x^3+(b-c${q >= 0 ? '+' : ''}${q})x^2+(c${rTerm})x+d+${s}\\) 對任意實數 \\(x\\) 皆為 ${K}，求 \\(a,b,c,d\\)。`
        );
        answers.push(
          `簡答：\\(a=${a},b=${b},c=${c},d=${d}\\)。過程：恆為常數 ${K} 表示 \\(x^3,x^2,x\\) 係數皆為 0、常數項為 ${K}。故 \\(a-${p}=0\\)、\\(c${rTerm}=0\\)、\\(b-c${q >= 0 ? '+' : ''}${q}=0\\)、\\(d+${s}=${K}\\)，解得答案。`
        );
        continue;
      }

      if (variant === 3) {
        const p = randInt(2, 5);
        const q = randInt(-3, 4);
        const s = randInt(-3, 4);
        const L = pickNonZero(-3, 4);
        const e = randInt(-4, 5);
        const a = -p;
        const b = -q;
        const c = L - s;
        const lineText = P([L, e]);
        questions.push(
          `設 \\(f(x)=(a+${p})x^3+(b${q >= 0 ? '+' : ''}${q})x^2+(c${s >= 0 ? '+' : ''}${s})x+d\\)。若 \\(f(1),f(2),f(3),f(4)\\) 皆滿足 \\(f(x)=${lineText}\\)，求 \\(a,b,c,d\\)。`
        );
        answers.push(
          `簡答：\\(a=${a},b=${b},c=${c},d=${e}\\)。過程：\\(f(x)-(${lineText})\\) 為三次以下多項式卻有 \\(1,2,3,4\\) 四個根，故恆為 0，即 \\(f(x)=${lineText}\\)。比較係數得 \\(a+${p}=0\\)、\\(b${q >= 0 ? '+' : ''}${q}=0\\)、\\(c${s >= 0 ? '+' : ''}${s}=${L}\\)、\\(d=${e}\\)。`
        );
        continue;
      }

      const t = pickNonZero(-3, 4);
      const p2 = randInt(-3, 4);
      const q2 = pickNonZero(-4, 4);
      const A = t;
      const h = t * p2;
      const k = t * q2;
      const den = P([1, p2, q2]);
      const ATerm = A === 1 ? 'x^2' : A === -1 ? '-x^2' : `${A}x^2`;
      const hPart = h === 0 ? '' : `${h >= 0 ? '+' : ''}${h}x`;
      questions.push(`已知 \\(\\dfrac{${ATerm}+hx+k}{${den}}\\) 之值恆為定值 \\(t\\)，求 \\(h,k,t\\)。`);
      answers.push(
        `簡答：\\(h=${h},k=${k},t=${t}\\)。過程：分式恆為定值 \\(t\\) 表示分子恆等於 \\(t(${den})\\)。比較二次項係數得 \\(t=${A}\\)，故分子為 \\(${ATerm}${hPart}${k >= 0 ? '+' : ''}${k}\\)，即 \\(h=${h},k=${k}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131DegreeAfterOperationsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const d = randInt(3, 7);
        questions.push(`若 \\(\\deg f(x)=${d}\\)、\\(\\deg g(x)=${d}\\)，則 \\(\\deg(f(x)-g(x))\\) 的可能值為何？`);
        answers.push(
          `簡答：不超過 ${d}（最高次項可能抵消，故可為 ${d},${d - 1},\\ldots,0，或為零多項式）。過程：兩個 ${d} 次式相減時，若最高次係數不同，結果仍為 ${d} 次；若相同則最高次抵消，次數下降，最多可降到常數甚至零多項式。`
        );
        continue;
      }

      if (variant === 1) {
        const prod = randInt(5, 9);
        const sum = randInt(2, prod - 2);
        // deg(fg)=prod → m+n=prod；deg(f+g)=sum → max(m,n)=sum（需 sum<prod）
        // 可能 (m,n)：其中一個為 sum、另一個為 prod-sum，且需 prod-sum ≤ sum
        const other = prod - sum;
        const opts = other <= sum ? [other, sum] : [];
        questions.push(`已知 \\(\\deg(f(x)g(x))=${prod}\\)、\\(\\deg(f(x)+g(x))=${sum}\\)，求 \\(f(x)\\) 可能的次數。`);
        answers.push(
          opts.length
            ? `簡答：${opts[0]} 或 ${opts[1]}。過程：設 \\(\\deg f=m,\\deg g=n\\)，則 \\(m+n=${prod}\\)。又和的次數 ${sum} 表示 \\(\\max(m,n)=${sum}\\)（因兩者次數不同，較大者主導），故 \\(\\{m,n\\}=\\{${sum},${other}\\}\\)，\\(f\\) 可能為 ${opts[0]} 或 ${opts[1]} 次。`
            : `簡答：${sum} 或 ${other} 次。過程：由 \\(m+n=${prod}\\) 與 \\(\\max(m,n)=${sum}\\)，得 \\(\\{m,n\\}=\\{${sum},${other}\\}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        const d = randInt(2, 8);
        const s = randInt(2, 5);
        const tt = randInt(2, 5);
        // s·f + t·g，兩者 d 次；最高次係數為 s·(lead f)+t·(lead g)，可能抵消
        questions.push(
          `若 \\(f(x)\\)、\\(g(x)\\) 均為 ${d} 次多項式，令 \\(h(x)=${s}f(x)+${tt}g(x)\\)，則 \\(h(x)\\) 的次數最大可能為何？又是否可能低於此值？`
        );
        answers.push(
          `簡答：最大為 ${d} 次；當 \\(${s}\\)（\\(f\\) 的最高次係數）\\(+${tt}\\)（\\(g\\) 的最高次係數）恰為 0 時會抵消，使次數低於 ${d}，甚至成為零多項式。過程：\\(h\\) 的 \\(x^{${d}}\\) 係數為 \\(${s}a${tt >= 0 ? '+' : ''}${tt}b\\)（\\(a,b\\) 為兩式最高次係數）。一般不為 0 故為 ${d} 次；若剛好為 0 則最高次抵消、次數下降。`
        );
        continue;
      }

      if (variant === 3) {
        // (x^a - c) f(x^b - d)，f 為 m 次 → 次數 = a + b*m
        const m = randInt(3, 6);
        const a = randInt(2, 4);
        const b = 2;
        const deg = a + b * m;
        questions.push(`若 \\(f(x)\\) 為 ${m} 次式，求 \\((x^${a}-3)f(x^${b}-1)\\) 的次數。`);
        answers.push(
          `簡答：${deg} 次。過程：\\(f(x)\\) 為 ${m} 次，代入 \\(x^${b}-1\\) 後，最高次來自 \\((x^${b})^${m}=x^{${b * m}}\\)，故 \\(f(x^${b}-1)\\) 為 ${b * m} 次。再乘 \\(x^${a}-3\\)（${a} 次），總次數為 \\(${a}+${b * m}=${deg}\\)。`
        );
        continue;
      }

      // variant 4：多項式的合成次數
      const m = randInt(2, 5);
      const n = randInt(2, 4);
      questions.push(`設 \\(\\deg f(x)=${m}\\)、\\(\\deg g(x)=${n}\\)，求 \\(\\deg f(g(x))\\)。`);
      answers.push(
        `簡答：${m * n} 次。過程：合成函數 \\(f(g(x))\\) 的次數為 \\(\\deg f\\times\\deg g=${m}\\times${n}=${m * n}\\)（把 \\(g(x)\\) 的最高次項代入 \\(f\\) 的最高次項）。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131SpecificCoefficientSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const coeffAt = (poly, power) => poly[poly.length - 1 - power] || 0;
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        // ∏_{j=1}^{M}(x+j) 展開式中 x^{M-1} 係數 = 1+2+…+M
        const M = randInt(6, 12);
        const factors = Array.from({ length: M }, (_, t) => `(x+${t + 1})`).join('');
        const c = (M * (M + 1)) / 2;
        questions.push(`求 \\(${factors}\\) 展開式中的 \\(x^{${M - 1}}\\) 項係數。`);
        answers.push(
          `簡答：${c}。過程：最高次為 \\(x^{${M}}\\)，\\(x^{${M - 1}}\\) 的係數等於各因式常數項之和 \\(1+2+\\cdots+${M}=\\frac{${M}\\times${M + 1}}2=${c}\\)。`
        );
        continue;
      }

      if (variant === 1 || variant === 4) {
        // 兩多項式相乘，求某項係數
        const p1 = s131RandPoly(randInt(3, 4), -4, 4);
        const p2 = s131RandPoly(randInt(3, 4), -4, 4);
        const prod = s131PolyMul(p1, p2);
        const power = randInt(2, 4);
        const c = coeffAt(prod, power);
        questions.push(
          `設 \\(f(x)=(${formatPolynomialFromCoeffs(p1)})(${formatPolynomialFromCoeffs(p2)})\\)，求展開後 \\(x^{${power}}\\) 的係數。`
        );
        answers.push(
          `簡答：${c}。過程：只需收集乘積中「次數相加等於 ${power}」的配對後相加，得 \\(x^{${power}}\\) 係數為 ${c}。`
        );
        continue;
      }

      // variant 2：等差係數多項式相乘取係數
      const A = s131RandPoly(4, -3, 4);
      const B = s131RandPoly(4, -3, 4);
      const prod = s131PolyMul(A, B);
      const power = randInt(3, 5);
      const c = coeffAt(prod, power);
      questions.push(
        `求 \\((${formatPolynomialFromCoeffs(A)})(${formatPolynomialFromCoeffs(B)})\\) 乘開後 \\(x^{${power}}\\) 的係數。`
      );
      answers.push(
        `簡答：${c}。過程：把兩式相乘並收集 \\(x^{${power}}\\) 的所有來源（次數和為 ${power} 的項配對）後相加，係數為 ${c}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131PolynomialFiveSubtypeMixedSet(count) {
    const banks = [
      buildS131CoefficientSumParitySet,
      buildS131DifferenceReversePolynomialSet,
      buildS131PolynomialIdentityParameterSet,
      buildS131DegreeAfterOperationsSet,
      buildS131SpecificCoefficientSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }

  function multiplyLinearByPoly(linear, poly) {
    const result = Array(poly.length + 1).fill(0);
    for (let i = 0; i < linear.length; i += 1) {
      for (let j = 0; j < poly.length; j += 1) {
        result[i + j] += linear[i] * poly[j];
      }
    }
    return result;
  }

  function expandAroundC(coeffs, c) {
    const degree = coeffs.length - 1;
    const result = Array(degree + 1).fill(0);
    const choose = (n, r) => {
      if (r < 0 || r > n) return 0;
      let value = 1;
      for (let k = 1; k <= r; k += 1) {
        value = (value * (n - k + 1)) / k;
      }
      return value;
    };
    for (let i = 0; i < coeffs.length; i += 1) {
      const power = degree - i;
      const coef = coeffs[i];
      for (let j = 0; j <= power; j += 1) {
        const binom = choose(power, j);
        result[degree - j] += coef * binom * Math.pow(-c, power - j);
      }
    }
    return result;
  }

  function formatS131LinearFactor(c) {
    if (c === 0) return 'x';
    return `x${c > 0 ? '-' : '+'}${Math.abs(c)}`;
  }

  function formatS131ShiftBase(c) {
    if (c === 0) return 'x';
    return `(x${c > 0 ? '-' : '+'}${Math.abs(c)})`;
  }

  function formatS131ShiftPolynomial(coeffs, c) {
    const base = formatS131ShiftBase(c);
    const degree = coeffs.length - 1;
    const parts = [];
    coeffs.forEach((coef, index) => {
      if (coef === 0) return;
      const power = degree - index;
      const abs = Math.abs(coef);
      let body = '';
      if (power === 0) {
        body = `${abs}`;
      } else {
        const variableText = power === 1 ? base : `${base}^${power}`;
        body = abs === 1 ? variableText : `${abs}${variableText}`;
      }
      if (!parts.length) {
        parts.push(coef < 0 ? `-${body}` : body);
      } else {
        parts.push(coef < 0 ? `-${body}` : `+${body}`);
      }
    });
    return parts.join('') || '0';
  }

  function expandS13PolynomialFromRoots(roots, leading = 1) {
    let coeffs = [leading];
    roots.forEach((root) => {
      coeffs = multiplyLinearByPoly([1, -root], coeffs);
    });
    return coeffs;
  }

  function formatS13FactorList(roots) {
    return roots.map((root) => `\\(${formatS131LinearFactor(root)}\\)`).join('，');
  }

  function formatS13FactorProduct(roots) {
    return roots.map((root) => `(${formatS131LinearFactor(root)})`).join('');
  }

  function buildS131FactorCheckSpecialPolynomialSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const roots = shuffle([randInt(-5, -1), randInt(1, 5), randInt(6, 9)])
          .slice(0, 3)
          .sort((a, b) => a - b);
        const coeffs = expandS13PolynomialFromRoots(roots);
        const polynomial = formatPolynomialFromCoeffs(coeffs);
        questions.push(`已知 \\(f(x)=${polynomial}\\)，列出 \\(f(x)\\) 的所有一次因式。`);
        answers.push(
          `簡答：${formatS13FactorList(roots)}。過程：把 \\(f(x)\\) 因式分解為 \\(${formatS13FactorProduct(roots)}\\)，所以一次因式如上。`
        );
        continue;
      }

      if (type === 1) {
        const a = randInt(2, 4);
        const n = randInt(3, 6);
        const constant = Math.pow(a, n);
        const hasPlus = n % 2 === 0;
        questions.push(`判斷 \\(x-${a}\\) 與 \\(x+${a}\\) 是否為 \\(x^{${n}}-${constant}\\) 的因式。`);
        answers.push(
          `簡答：\\(x-${a}\\) 一定是因式；\\(x+${a}\\)${hasPlus ? '也是' : '不是'}因式。過程：代入 \\(x=${a}\\) 得 0，所以 \\(x-${a}\\) 是因式。代入 \\(x=-${a}\\) 得 \\((-${a})^{${n}}-${constant}${hasPlus ? '=0' : `=${-constant - constant}`}\\)，因此 \\(x+${a}\\)${hasPlus ? '是' : '不是'}因式。`
        );
        continue;
      }

      if (type === 2) {
        const a = randInt(2, 4);
        const n = [3, 5][randInt(0, 1)];
        const constant = Math.pow(a, n);
        questions.push(`判斷 \\(x-${a}\\) 與 \\(x+${a}\\) 是否為 \\(x^{${n}}+${constant}\\) 的因式。`);
        answers.push(
          `簡答：\\(x+${a}\\) 是因式，\\(x-${a}\\) 不是因式。過程：因為 \\(n\\) 為奇數，代入 \\(x=-${a}\\) 得 \\((-${a})^{${n}}+${constant}=0\\)，所以 \\(x+${a}\\) 是因式；代入 \\(x=${a}\\) 得 \\(${constant}+${constant}\\ne0\\)，所以 \\(x-${a}\\) 不是因式。`
        );
        continue;
      }

      if (type === 3) {
        const m = randInt(2, 5);
        let r = pickNonZero(-4, 4);
        while (Math.abs(r) === m) r = pickNonZero(-4, 4);
        const coeffs = expandS13PolynomialFromRoots([-m, m, r]);
        const polynomial = formatPolynomialFromCoeffs(coeffs);
        questions.push(`已知 \\(f(x)=${polynomial}\\)，判斷 \\(x^2-${m * m}\\) 是否為 \\(f(x)\\) 的因式，並說明理由。`);
        answers.push(
          `簡答：是。過程：\\(x^2-${m * m}=(x-${m})(x+${m})\\)。由 \\(f(x)\\) 可分解出 ${formatS13FactorList([-m, m, r])}，同時含有 \\(x-${m}\\) 與 \\(x+${m}\\)，所以 \\(x^2-${m * m}\\) 是因式。`
        );
        continue;
      }

      const a = randInt(2, 5);
      let b = randInt(1, 4);
      const c = randInt(2, 6);
      while (c * c - a * c + b === 0) b = randInt(1, 4);
      const polynomial = `(x^2+${a}x+${b})(x-${c})`;
      const factorAtNegativeC = c * c - a * c + b;
      const valueAtNegativeC = factorAtNegativeC * -2 * c;
      questions.push(`設 \\(f(x)=${polynomial}\\)。若 \\(x-${c}\\) 已知為因式，判斷 \\(x+${c}\\) 是否也一定是因式。`);
      answers.push(
        `簡答：不一定；本題不是。過程：因式定理要代入對應的根。\\(x+${c}\\) 是因式需 \\(f(-${c})=0\\)，但 \\(f(-${c})=(${factorAtNegativeC})(-${2 * c})=${valueAtNegativeC}\\ne0\\)。不能因為 \\(x-${c}\\) 是因式，就誤以為 \\(x+${c}\\) 也會是因式。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS131NearbyRootsValueSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const a = randInt(-4, 5);
        const k = pickNonZero(-5, 5);
        const given = -6 * k;
        const target = 6 * k;
        questions.push(
          `三次多項式 \\(f(x)\\) 的根為 ${a}、${a + 1}、${a + 2}，且最高次項係數為 \\(k\\)。若 \\(f(${a - 1})=${given}\\)，求 \\(f(${a + 3})\\)。`
        );
        answers.push(
          `簡答：${target}。過程：設 \\(f(x)=k${formatS13FactorProduct([a, a + 1, a + 2])}\\)。代入 \\(x=${a - 1}\\) 得 \\(f(${a - 1})=-6k=${given}\\)，所以 \\(k=${k}\\)。代入 \\(x=${a + 3}\\) 得 \\(f(${a + 3})=6k=${target}\\)。`
        );
        continue;
      }

      if (type === 1) {
        const a = randInt(-3, 4);
        const k = pickNonZero(-4, 4);
        const given = 6 * k;
        const target = -6 * k;
        questions.push(
          `三次多項式 \\(f(x)\\) 有三根 ${a}、${a + 1}、${a + 2}。若最高次項係數固定，且 \\(f(${a + 3})=${given}\\)，求 \\(f(${a - 1})\\)。`
        );
        answers.push(
          `簡答：${target}。過程：設 \\(f(x)=k${formatS13FactorProduct([a, a + 1, a + 2])}\\)。\\(f(${a + 3})=6k=${given}\\)，所以 \\(k=${k}\\)。因此 \\(f(${a - 1})=(-1)(-2)(-3)k=-6k=${target}\\)。`
        );
        continue;
      }

      if (type === 2) {
        const a = randInt(-3, 4);
        const d = randInt(2, 4);
        const k = pickNonZero(-3, 3);
        const given = 6 * k * d ** 3;
        const target = -given;
        questions.push(
          `三次多項式 \\(f(x)\\) 的根為 ${a - d}、${a}、${a + d}。若 \\(f(${a + 2 * d})=${given}\\)，求 \\(f(${a - 2 * d})\\)。`
        );
        answers.push(
          `簡答：${target}。過程：設 \\(f(x)=k${formatS13FactorProduct([a - d, a, a + d])}\\)。在 \\(x=${a + 2 * d}\\) 時三因數為 \\(${3 * d},${2 * d},${d}\\)，乘積為 \\(${6 * d ** 3}\\)；在 \\(x=${a - 2 * d}\\) 時三因數為 \\(${-d},${-2 * d},${-3 * d}\\)，乘積為 \\(${-6 * d ** 3}\\)。所以兩值相反，答案為 ${target}。`
        );
        continue;
      }

      if (type === 3) {
        const a = randInt(-3, 3);
        const k = pickNonZero(-3, 3);
        const given = 24 * k;
        questions.push(
          `四次多項式 \\(f(x)\\) 的根為 ${a}、${a + 1}、${a + 2}、${a + 3}。若 \\(f(${a - 1})=${given}\\)，求 \\(f(${a + 4})\\)。`
        );
        answers.push(
          `簡答：${given}。過程：設 \\(f(x)=k${formatS13FactorProduct([a, a + 1, a + 2, a + 3])}\\)。代入 \\(x=${a - 1}\\) 的四個因數為 \\(-1,-2,-3,-4\\)，乘積為 24；代入 \\(x=${a + 4}\\) 的四個因數為 \\(4,3,2,1\\)，乘積也為 24。因此兩值相同。`
        );
        continue;
      }

      const a = randInt(-5, 4);
      const b = a + randInt(2, 5);
      const k = pickNonZero(-5, 5);
      const givenX = a - 1;
      const targetX = b + 1;
      const given = k * (givenX - a) * (givenX - b);
      const target = k * (targetX - a) * (targetX - b);
      questions.push(
        `二次多項式 \\(f(x)\\) 的兩根為 ${a}、${b}，且 \\(f(${givenX})=${given}\\)，求 \\(f(${targetX})\\)。`
      );
      answers.push(
        `簡答：${target}。過程：設 \\(f(x)=k${formatS13FactorProduct([a, b])}\\)。由 \\(f(${givenX})=k(${givenX - a})(${givenX - b})=${given}\\) 可得 \\(k=${k}\\)。所以 \\(f(${targetX})=k(${targetX - a})(${targetX - b})=${target}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS131AxMinusBDivisionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = [2, 3, 4][randInt(0, 2)];
      const b = pickNonZero(-5, 5);
      const q2 = pickNonZero(-3, 4);
      const q1 = randInt(-5, 5);
      const q0 = randInt(-6, 6);
      const r = randInt(-8, 8);
      const divisor = [a, b];
      const quotient = [q2, q1, q0];
      const dividend = addPolyCoeffs(multiplyLinearByPoly(divisor, quotient), [r]);
      const divisorText = formatPolynomialFromCoeffs(divisor);
      const dividendText = formatPolynomialFromCoeffs(dividend);
      const quotientText = formatPolynomialFromCoeffs(quotient);
      const remainderText = r === 0 ? '' : r < 0 ? `-${Math.abs(r)}` : `+${r}`;
      questions.push(`求 \\(${dividendText}\\) 除以 \\(${divisorText}\\) 的商式與餘式。`);
      answers.push(
        `簡答：商式 \\(${quotientText}\\)，餘式 ${r}。過程：此題除式首項係數不是 1，做綜合除法時若先用根 \\(x=${formatFraction(-b, a)}\\) 得到偽商，最後還要除以 ${a} 才是真正商式。檢查可得 \\(${dividendText}=(${divisorText})(${quotientText})${remainderText}\\)，所以答案如上。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131SuccessiveDivisionTaylorSet(count) {
    const templates = [
      {
        q: '設 \\(f(x)=8x^3+4x^2-16x+5\\)，將其表示成 \\((x-1)\\) 的降冪排列。',
        a: '簡答：\\(f(x)=8(x-1)^3+28(x-1)^2+16(x-1)+1\\)。過程：令 \\(u=x-1\\)，則 \\(x=u+1\\)。代入得 \\(8(u+1)^3+4(u+1)^2-16(u+1)+5=8u^3+28u^2+16u+1\\)。',
      },
      {
        q: '將 \\(f(x)=x^3-4x^2+7x-1\\) 改寫為 \\((x-2)\\) 的降冪形式，並估計 \\(f(2.003)\\) 到小數點後三位。',
        a: '簡答：\\(f(x)=(x-2)^3+2(x-2)^2+3(x-2)+5\\)，\\(f(2.003)\\approx5.009\\)。過程：令 \\(u=x-2\\)，代入 \\(x=u+2\\) 得 \\(u^3+2u^2+3u+5\\)。當 \\(x=2.003\\) 時 \\(u=0.003\\)，所以值約為 \\(5+3(0.003)+2(0.003)^2+(0.003)^3=5.009018027\\)，取到小數點後三位為 5.009。',
      },
      {
        q: '設 \\(f(x)=27x^3+36x^2+21x+4\\)，將其改寫為 \\(a(3x+2)^3+b(3x+2)^2+c(3x+2)+d\\)，求係數和 \\(a+b+c+d\\)。',
        a: '簡答：0。過程：令 \\(u=3x+2\\)，則 \\(x=\\frac{u-2}{3}\\)。代入後得 \\(f(x)=u^3-2u^2+3u-2\\)，所以 \\(a+b+c+d=1-2+3-2=0\\)。',
      },
      {
        q: '若 \\(f(x)=(x-2)^4+8(x-2)^3+15(x-2)^2+13(x-2)+9\\)，將其展開為 \\(x\\) 的多項式。',
        a: '簡答：\\(x^4-9x^2+17x-5\\)。過程：令 \\(u=x-2\\)，直接展開各項：\\((x-2)^4+8(x-2)^3+15(x-2)^2+13(x-2)+9=x^4-9x^2+17x-5\\)。',
      },
      {
        q: '設 \\(f(x)=16x^4+32x^3-8x^2-24x+5\\)，表示為 \\((2x+1)\\) 的泰勒形式。',
        a: '簡答：\\((2x+1)^4-8(2x+1)^2+12\\)。過程：令 \\(u=2x+1\\)，則 \\(x=\\frac{u-1}{2}\\)。代入整理得 \\(u^4-8u^2+12\\)，所以泰勒形式為 \\((2x+1)^4-8(2x+1)^2+12\\)。',
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const type = i % 5;
      if (i < templates.length && Math.random() < 0.5) {
        const item = templates[i % templates.length];
        questions.push(item.q);
        answers.push(item.a);
        continue;
      }
      const c = randInt(-3, 3);
      const a3 = pickNonZero(-3, 3);
      const a2 = randInt(-5, 5);
      const a1 = randInt(-6, 6);
      const a0 = randInt(-8, 8);
      const expanded = expandAroundC([a3, a2, a1, a0], c);
      const polyText = formatPolynomialFromCoeffs(expanded);
      const shift = formatS131ShiftBase(c);
      const shiftedPoly = formatS131ShiftPolynomial([a3, a2, a1, a0], c);
      if (type === 1) {
        const eps = 0.01;
        const approx = a0 + a1 * eps + a2 * eps * eps + a3 * eps * eps * eps;
        questions.push(
          `設 \\(f(x)=${polyText}\\)，已知其關於 \\(${shift}\\) 的降冪排列，估計 \\(f(${trimFixed(c + eps, 3)})\\) 到小數點後四位。`
        );
        answers.push(
          `簡答：約 ${trimFixed(approx, 4)}。過程：把 \\(x=${trimFixed(c + eps, 3)}\\) 寫成 \\(${shift}=0.01\\)。由降冪式 \\(f(x)=${shiftedPoly}\\)，代入 \\(${shift}=0.01\\) 得約 ${trimFixed(approx, 4)}。`
        );
        continue;
      }
      questions.push(`設 \\(f(x)=${polyText}\\)，將其表示為 \\(${shift}\\) 的降冪排列。`);
      answers.push(
        `簡答：\\(f(x)=${shiftedPoly}\\)。過程：連續除以 \\(${formatS131LinearFactor(c)}\\) 時，第一次餘式是常數項 ${a0}，第二次餘式是一次係數 ${a1}，再來是二次係數 ${a2}，最後最高次係數 ${a3}，所以得到上述降冪排列。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131ProductSpecificCoefficientSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const coeffAt = (poly, power) => poly[poly.length - 1 - power] || 0; // poly 高到低
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const p1 = s131RandPoly(2, -4, 4);
        const p2 = s131RandPoly(3, -3, 4);
        const prod = s131PolyMul(p1, p2);
        const power = randInt(2, 4);
        const c = coeffAt(prod, power);
        questions.push(
          `求 \\((${formatPolynomialFromCoeffs(p1)})(${formatPolynomialFromCoeffs(p2)})\\) 展開式中 \\(x^${power}\\) 的係數。`
        );
        answers.push(
          `簡答：${c}。過程：把兩多項式相乘，收集所有「次數相加等於 ${power}」的配對後相加，得 \\(x^${power}\\) 係數為 ${c}。`
        );
        continue;
      }

      if (variant === 1) {
        const m = randInt(6, 12);
        let prod = [1, 0];
        for (let t = 1; t <= m; t += 1) prod = s131PolyMul(prod, [1, t]);
        const c = coeffAt(prod, m); // 次數 m+1，取 x^m 係數 = 0+1+…+m
        const factors = Array.from({ length: m + 1 }, (_, t) => (t === 0 ? 'x' : `(x+${t})`)).join('');
        questions.push(`求多項式 \\(${factors}\\) 展開式中 \\(x^{${m}}\\) 項的係數。`);
        answers.push(
          `簡答：${c}。過程：最高次為 \\(x^{${m + 1}}\\)，而 \\(x^{${m}}\\) 係數為各因式常數項之和 \\(0+1+\\cdots+${m}=${c}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        const r = randInt(2, 5);
        const p1 = s131PolyMul([1, -1], [1, -r]); // 在 x=1 為 0
        const p2 = s131RandPoly(3, -3, 4);
        questions.push(
          `求 \\((${formatPolynomialFromCoeffs(p1)})(${formatPolynomialFromCoeffs(p2)})\\) 展開後所有項係數總和。`
        );
        answers.push(
          `簡答：0。過程：所有項係數總和等於代入 \\(x=1\\)。第一個括號在 \\(x=1\\) 的值為 0，故整個乘積為 0。`
        );
        continue;
      }

      if (variant === 3) {
        const p1 = s131RandPoly(2, -3, 4);
        const p2 = s131RandPoly(2, -3, 4);
        const v1 = s131PolyEval(p1, 1);
        const v2 = s131PolyEval(p2, 1);
        questions.push(
          `求 \\((${formatPolynomialFromCoeffs(p1)})(${formatPolynomialFromCoeffs(p2)})\\) 展開後所有項係數總和。`
        );
        answers.push(`簡答：${v1 * v2}。過程：係數總和等於代入 \\(x=1\\)，得 \\((${v1})\\times(${v2})=${v1 * v2}\\)。`);
        continue;
      }

      // variant 4：已知某項係數求參數 a
      let known;
      let a;
      let c0;
      let power;
      let base;
      let slope;
      let tries = 0;
      do {
        known = s131RandPoly(3, -3, 4);
        a = pickNonZero(-4, 5);
        c0 = randInt(1, 4);
        power = randInt(2, 4);
        const w0 = s131PolyMul([1, 0, c0], known);
        const w1 = s131PolyMul([1, 1, c0], known);
        base = w0[w0.length - 1 - power] || 0;
        slope = (w1[w1.length - 1 - power] || 0) - base;
        tries += 1;
      } while (slope === 0 && tries < 40);
      const target = base + slope * a;
      questions.push(
        `已知 \\((x^2+ax+${c0})(${formatPolynomialFromCoeffs(known)})\\) 展開式中 \\(x^${power}\\) 係數為 ${target}，求 \\(a\\)。`
      );
      answers.push(
        `簡答：\\(a=${a}\\)。過程：\\(x^${power}\\) 係數是 \\(a\\) 的一次式 \\(${slope}a${base >= 0 ? '+' : ''}${base}\\)。由 \\(${slope}a${base >= 0 ? '+' : ''}${base}=${target}\\)，解得 \\(a=${a}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131RemainderTransformationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const fr = (n, d) => {
      const f = makeFraction(n, d);
      return formatFraction(f.num, f.den);
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const a = pickNonZero(-4, 5);
        const c = randInt(-6, 9);
        questions.push(
          `設 \\(f(x)\\) 除以 \\(x${a > 0 ? '-' : '+'}${Math.abs(a)}\\) 的商為 \\(Q(x)\\)、餘式為 ${c}，求 \\(xf(x)\\) 除以 \\(x${a > 0 ? '-' : '+'}${Math.abs(a)}\\) 的餘式。`
        );
        answers.push(
          `簡答：${a * c}。過程：由餘式定理 \\(f(${a})=${c}\\)。\\(xf(x)\\) 除以 \\(x${a > 0 ? '-' : '+'}${Math.abs(a)}\\) 的餘式即代入 \\(x=${a}\\)，得 \\(${a}\\times${c}=${a * c}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        const k = randInt(2, 4);
        const m = randInt(1, 6);
        const c = randInt(-7, 9);
        questions.push(
          `已知 \\(f(x)\\) 除以 \\(${k}x-${m}\\) 的餘式為 ${c}，求 \\(f(\\frac{x}{${k}})\\) 除以 \\(x-${m}\\) 的餘式。`
        );
        answers.push(
          `簡答：${c}。過程：除以 \\(${k}x-${m}\\) 餘 ${c} 表示 \\(f(\\frac{${m}}{${k}})=${c}\\)。\\(f(\\frac{x}{${k}})\\) 除以 \\(x-${m}\\) 的餘式為代入 \\(x=${m}\\)，即 \\(f(\\frac{${m}}{${k}})=${c}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // f 除以 (x-1)^2 餘 r1(x)、除以 (x-2)^2 餘 r2(x) → 求除以 (x-1)(x-2)
        const a1 = pickNonZero(-4, 4);
        const b1 = randInt(-5, 5);
        const a2 = pickNonZero(-4, 4);
        const b2 = randInt(-5, 5);
        const f1 = a1 * 1 + b1;
        const f2 = a2 * 2 + b2;
        const ra = f2 - f1;
        const rb = f1 - ra;
        questions.push(
          `若 \\(f(x)\\) 除以 \\((x-1)^2\\) 餘 \\(${formatPolynomialFromCoeffs([a1, b1])}\\)，除以 \\((x-2)^2\\) 餘 \\(${formatPolynomialFromCoeffs([a2, b2])}\\)，求除以 \\((x-1)(x-2)\\) 的餘式。`
        );
        answers.push(
          `簡答：\\(${formatPolynomialFromCoeffs([ra, rb])}\\)。過程：設所求餘式為 \\(ax+b\\)。由 \\(f(1)=${a1}\\times1+${b1}=${f1}\\)、\\(f(2)=${a2}\\times2+${b2}=${f2}\\)，得 \\(a+b=${f1}\\)、\\(2a+b=${f2}\\)，解得 \\(a=${ra},b=${rb}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        const k = randInt(2, 4);
        const n = randInt(20, 200);
        const rem = n % 2 === 0 ? 1 : -1;
        questions.push(`求 \\((${k}x+1)^{${n}}\\) 除以 \\(${k}x+2\\) 的餘式。`);
        answers.push(
          `簡答：${rem}。過程：除以 \\(${k}x+2\\) 時代入根 \\(x=-\\frac{2}{${k}}\\)，此時 \\(${k}x+1=${k}\\times(-\\frac{2}{${k}})+1=-1\\)，故餘式為 \\((-1)^{${n}}=${rem}\\)（次數 ${n} 為${n % 2 === 0 ? '偶' : '奇'}數）。`
        );
        continue;
      }

      // variant 4：一般縮放 f 除以 ax-b 商 q 餘 r，求 f 除以 (x-b/a)
      const a4 = randInt(2, 5);
      const b4 = randInt(1, 7);
      const r4 = randInt(-6, 9);
      questions.push(
        `設 \\(f(x)\\) 除以 \\(${a4}x-${b4}\\) 的商為 \\(q(x)\\)、餘式為 ${r4}，求 \\(f(x)\\) 除以 \\(x-\\frac{${b4}}{${a4}}\\) 的商式與餘式。`
      );
      answers.push(
        `簡答：商式 \\(${a4}q(x)\\)，餘式 ${r4}。過程：因為 \\(${a4}x-${b4}=${a4}(x-\\frac{${b4}}{${a4}})\\)，由 \\(f(x)=(${a4}x-${b4})q(x)+${r4}=(x-\\frac{${b4}}{${a4}})\\cdot${a4}q(x)+${r4}\\)，故商式為 \\(${a4}q(x)\\)、餘式仍為 ${r4}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131HighPowerRemainderSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const templates = [
      {
        q: '求 \\(x^{12}\\) 除以 \\((x+1)^2\\) 的餘式。',
        a: "簡答：\\(-12x-11\\)。過程：除以 \\((x+1)^2\\) 的餘式設為 \\(ax+b\\)，需與 \\(x^{12}\\) 在 \\(x=-1\\) 的函數值與導數值相同。\\(r(-1)=1\\)、\\(r'(-1)=12(-1)^{11}=-12\\)，所以 \\(a=-12\\)，\\(-a+b=1\\)，得 \\(b=-11\\)。",
      },
      {
        q: '求 \\(x^{2000}-3x^{90}+5x^{18}-7\\) 除以 \\((x^3-1)\\) 的餘式。',
        a: '簡答：\\(x^2-5\\)。過程：在模 \\(x^3-1\\) 下，\\(x^3\\equiv 1\\)。因為 \\(2000\\equiv 2\\pmod3\\)，\\(90,18\\) 都是 3 的倍數，所以餘式為 \\(x^2-3+5-7=x^2-5\\)。',
      },
      {
        q: '計算 \\(13^{10}-13^4+1\\) 除以 \\((13^2-13+1)\\) 的餘數。',
        a: '簡答：1。過程：令 \\(t=13\\)，由 \\(t^2-t+1=0\\) 得 \\(t^3\\equiv -1\\)、\\(t^6\\equiv 1\\)。所以 \\(t^{10}=t^6t^4\\equiv t^4\\)，原式 \\(t^{10}-t^4+1\\equiv 1\\)。因此餘數為 1。',
      },
      {
        q: '求 \\(x^{100}+1\\) 除以 \\((x-1)^2\\) 的餘式。',
        a: "簡答：\\(100x-98\\)。過程：設餘式為 \\(ax+b\\)。需滿足 \\(r(1)=1^{100}+1=2\\)，且 \\(r'(1)=100\\)。故 \\(a=100\\)，\\(100+b=2\\)，得 \\(b=-98\\)。",
      },
      {
        q: '已知 \\(f(x)=x^{32}-3x^{24}+3x^{14}-2\\)，求其除以 \\((x^2+x+1)\\) 的餘式。',
        a: '簡答：\\(-4x-9\\)。過程：在模 \\(x^2+x+1\\) 下，\\(x^3\\equiv 1\\)。所以 \\(x^{32}\\equiv \\, x^2\\)、\\(x^{24}\\equiv1\\)、\\(x^{14}\\equiv \\, x^2\\)。原式餘式為 \\(x^2-3+3x^2-2=4x^2-5\\)。再用 \\(x^2\\equiv -x-1\\)，得 \\(-4x-9\\)。',
      },
      {
        q: '求 \\(x^{12}\\) 除以 \\((x+1)^2\\) 的餘式，並以此計算 \\(9^{12}\\) 除以 100 的餘數。',
        a: '簡答：餘式 \\(-12x-11\\)，餘數 81。過程：除以 \\((x+1)^2\\) 的餘式為 \\(-12x-11\\)。因為 100\\(=(9+1)^2\\)，代入 \\(x=9\\) 得 \\(-108-11=-119\\)，除以 100 的餘數為 81。',
      },
      {
        q: '證明 \\(8^{20}-5^{20}\\) 是 3 的倍數。',
        a: '簡答：是 3 的倍數。過程：因為 \\(8\\equiv 5\\equiv 2\\pmod3\\)，所以 \\(8^{20}-5^{20}\\equiv 2^{20}-2^{20}\\equiv 0\\pmod3\\)。',
      },
      {
        q: '計算 \\(13^{10}-13^4+1\\) 除以 \\(13^2-13+1\\) 的餘數。',
        a: '簡答：1。過程：令 \\(t=13\\)。在模 \\(t^2-t+1\\) 下，\\(t^3\\equiv -1\\)，所以 \\(t^6\\equiv 1\\)。因此 \\(t^{10}\\equiv t^4\\)，原式 \\(t^{10}-t^4+1\\equiv 1\\)。',
      },
      {
        q: '利用除法原理求 \\(23756108^{12}\\) 除以 \\(101\\) 的餘數。',
        a: '簡答：1。過程：先把底數化小，\\(23756108\\equiv -1\\pmod{101}\\)。因此 \\(23756108^{12}\\equiv (-1)^{12}=1\\pmod{101}\\)，餘數為 1。',
      },
    ];
    const start = randInt(0, templates.length - 1);
    for (let i = 0; i < count; i += 1) {
      const item = templates[(start + i) % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131DivisionRemainderFiveSubtypeMixedSet(count) {
    const banks = [
      buildS131AxMinusBDivisionSet,
      buildS131SuccessiveDivisionTaylorSet,
      buildS131ProductSpecificCoefficientSet,
      buildS131RemainderTransformationSet,
      buildS131HighPowerRemainderSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131ComplexRootRemainderSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const L = (a, b) => formatPolynomialFromCoeffs([a, b]);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      // 除式：x^2+x+1 (B=1,C=1) 或 x^2-x+1 (B=-1,C=1)
      const useMinus = variant % 2 === 1;
      const B = useMinus ? -1 : 1;
      const C = 1;
      const Dtext = useMinus ? 'x^2-x+1' : 'x^2+x+1';
      // 2~3 個高次項
      const nTerms = randInt(2, 3);
      const terms = [];
      const used = new Set();
      for (let t = 0; t < nTerms; t += 1) {
        let e = randInt(20, 200) * (randInt(0, 1) === 0 ? 3 : 1) + randInt(0, 2);
        for (let g = 0; used.has(e) && g < 20; g += 1) e = randInt(20, 200) + randInt(0, 2);
        used.add(e);
        const co = pickNonZero(-4, 4);
        terms.push([co, e]);
      }
      terms.sort((p, q) => q[1] - p[1]);
      let ra = 0;
      let rb = 0;
      terms.forEach(([co, e]) => {
        const [xa, xb] = s131XnMod2(e, B, C);
        ra += co * xa;
        rb += co * xb;
      });
      const dividend = terms
        .map(([co, e], idx) => {
          const sign = co < 0 ? '-' : idx === 0 ? '' : '+';
          const mag = Math.abs(co) === 1 ? '' : `${Math.abs(co)}`;
          return `${sign}${mag}x^{${e}}`;
        })
        .join('');
      questions.push(`求 \\(${dividend}\\) 除以 \\(${Dtext}\\) 的餘式。`);
      answers.push(
        `簡答：\\(${L(ra, rb)}\\)。過程：由 \\(${Dtext}=0\\) 的根滿足 \\(x^2${useMinus ? '=x-1' : '=-x-1'}\\)（週期性），可將每個 \\(x^{n}\\) 化簡為一次式：${terms
          .map(([co, e]) => {
            const [xa, xb] = s131XnMod2(e, B, C);
            return `\\(x^{${e}}\\equiv ${L(xa, xb)}\\)`;
          })
          .join('、')}。線性組合後得餘式 \\(${L(ra, rb)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131CompositionRemainderSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 1 || variant === 3) {
        const co = s131RandPoly(randInt(2, 3), -3, 4);
        const a = pickNonZero(-3, 3);
        const inner = s131PolyEval(co, a);
        const outer = s131PolyEval(co, inner);
        const label = variant === 1 ? 'g(x)' : 'f(f(x))';
        questions.push(
          variant === 1
            ? `設 \\(f(x)=${formatPolynomialFromCoeffs(co)}\\)，\\(g(x)=f(f(x))\\)，求 \\(g(x)\\) 除以 \\(x${a > 0 ? '-' : '+'}${Math.abs(a)}\\) 的餘式。`
            : `設 \\(f(x)=${formatPolynomialFromCoeffs(co)}\\)，求 \\(f(f(x))\\) 除以 \\(x${a > 0 ? '-' : '+'}${Math.abs(a)}\\) 的餘式。`
        );
        answers.push(
          `簡答：${outer}。過程：由餘式定理，所求為 \\(${label}\\) 在 \\(x=${a}\\) 的值。先算 \\(f(${a})=${inner}\\)，再算 \\(f(${inner})=${outer}\\)，故餘式為 ${outer}。`
        );
        continue;
      }

      // variant 2、4：只給函數值
      const p = pickNonZero(-4, 4);
      const u = randInt(-6, 8);
      const v = randInt(-6, 8);
      questions.push(
        `已知 \\(f(${p})=${u}\\)、\\(f(${u})=${v}\\)，求 \\(f(f(x))\\) 除以 \\(x${p > 0 ? '-' : '+'}${Math.abs(p)}\\) 的餘式。`
      );
      answers.push(
        `簡答：${v}。過程：除以一次式 \\(x${p > 0 ? '-' : '+'}${Math.abs(p)}\\) 的餘式即為 \\(f(f(x))\\) 在 \\(x=${p}\\) 的值。由 \\(f(${p})=${u}\\)，得 \\(f(f(${p}))=f(${u})=${v}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131SquareDivisorRemainderSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const L = (a, b) => formatPolynomialFromCoeffs([a, b]);
    const lead = (v, p) => `${v === 1 ? '' : v === -1 ? '-' : v}x^{${p}}`;
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 3 || variant === 4) {
        // a x^m + b x^{m-1} + c 被 (x-1)^2 整除 → (a,b)=((m-1)c, -mc)
        const m = randInt(5, 12);
        const c = pickNonZero(-3, 3);
        const a = (m - 1) * c;
        const b = -m * c;
        const bTerm = `${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}x^{${m - 1}}`;
        questions.push(
          `設 \\(${lead(a, m)}${bTerm}${c >= 0 ? '+' : '-'}${Math.abs(c)}\\) 能被 \\((x-1)^2\\) 整除，求數對 \\((a,b)\\)。`
        );
        answers.push(
          `簡答：\\((a,b)=(${a},${b})\\)。過程：設 \\(g(x)=ax^{${m}}+bx^{${m - 1}}${c >= 0 ? '+' : '-'}${Math.abs(c)}\\)。被 \\((x-1)^2\\) 整除需 \\(g(1)=0\\) 且 \\(g'(1)=0\\)，即 \\(a+b${c >= 0 ? '+' : '-'}${Math.abs(c)}=0\\) 與 \\(${m}a+${m - 1}b=0\\)，解得 \\(a=${a},b=${b}\\)。`
        );
        continue;
      }

      // 求 x^n + const 除以 (x-a)^2 的餘式，a∈{1,-1}
      const a0 = randInt(0, 1) === 0 ? 1 : -1;
      const n = randInt(8, 200);
      const cc = randInt(-5, 6);
      const an = a0 === 1 ? 1 : n % 2 === 0 ? 1 : -1;
      const an1 = a0 === 1 ? 1 : (n - 1) % 2 === 0 ? 1 : -1;
      const fa = an + cc;
      const dfa = n * an1;
      const ra = dfa;
      const rb = fa - dfa * a0;
      const aTerm = a0 === 1 ? 'x-1' : 'x+1';
      const constPart = cc === 0 ? '' : `${cc >= 0 ? '+' : '-'}${Math.abs(cc)}`;
      questions.push(`求 \\(x^{${n}}${constPart}\\) 除以 \\((${aTerm})^2\\) 的餘式。`);
      answers.push(
        `簡答：\\(${L(ra, rb)}\\)。過程：令 \\(f(x)=x^{${n}}${constPart}\\)。除以 \\((${aTerm})^2\\) 的餘式為 \\(f(${a0})+f'(${a0})(x${a0 === 1 ? '-1' : '+1'})\\)。計算 \\(f(${a0})=${an}${constPart}=${fa}\\)、\\(f'(${a0})=${n}\\times(${a0})^{${n - 1}}=${dfa}\\)，整理得餘式 \\(${L(ra, rb)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131StepwiseRemainderConstructionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const R2 = (A, B, C) => formatPolynomialFromCoeffs([A, B, C]);
    const L = (a, b) => formatPolynomialFromCoeffs([a, b]);
    const Xm = (r) => `x${r > 0 ? '-' : '+'}${Math.abs(r)}`;
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const A = pickNonZero(-3, 3);
      const B = pickNonZero(-4, 4);
      const C = randInt(-6, 6);
      const rq = (x) => A * x * x + B * x + C;

      if (variant === 0 || variant === 3) {
        const r0 = randInt(1, 2);
        const roots = [r0, r0 + 1, r0 + 2];
        const vals = roots.map(rq);
        questions.push(
          `設 \\(f(x)\\) 除以 \\(${Xm(roots[0])},${Xm(roots[1])},${Xm(roots[2])}\\) 的餘式分別為 ${vals.join(',')}，求 \\(f(x)\\) 除以 \\((${Xm(roots[0])})(${Xm(roots[1])})(${Xm(roots[2])})\\) 的餘式。`
        );
        answers.push(
          `簡答：\\(${R2(A, B, C)}\\)。過程：餘式次數小於 3，設為 \\(ax^2+bx+c\\)。由餘式定理 \\(r(${roots[0]})=${vals[0]},r(${roots[1]})=${vals[1]},r(${roots[2]})=${vals[2]}\\)，解三元一次聯立，得 \\(a=${A},b=${B},c=${C}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 除以 x^2+x+1 餘 (Ax+B 化簡...) 這裡改：除以 x^2+x+1 餘 g(x)、除以 x-1 餘 v → 求除以 x^3-1
        const roots = [1, 2, 3];
        const vals = roots.map(rq);
        // 除以 (x-1)(x-2) 餘 → 過 (1,v1),(2,v2) 的一次式
        const lin1a = vals[1] - vals[0];
        const lin1b = vals[0] - lin1a * 1;
        questions.push(
          `已知 \\(f(1)=${vals[0]},f(2)=${vals[1]},f(3)=${vals[2]}\\)，求 \\(f(x)\\) 除以 \\((x-1)(x-2)(x-3)\\) 的餘式。`
        );
        answers.push(
          `簡答：\\(${R2(A, B, C)}\\)。過程：餘式設為 \\(ax^2+bx+c\\)。代入 \\(x=1,2,3\\) 得 \\(a+b+c=${vals[0]}\\)、\\(4a+2b+c=${vals[1]}\\)、\\(9a+3b+c=${vals[2]}\\)，解得 \\(a=${A},b=${B},c=${C}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // 除以 (x-1)(x-2) 餘 r1、除以 (x-2)(x-3) 餘 r2 → 求除以 (x-1)(x-2)(x-3)
        const roots = [1, 2, 3];
        const vals = roots.map(rq);
        const r1a = vals[1] - vals[0];
        const r1b = vals[0] - r1a;
        const r2a = vals[2] - vals[1];
        const r2b = vals[1] - r2a * 2;
        questions.push(
          `設 \\(f(x)\\) 除以 \\((x-1)(x-2)\\) 餘 \\(${L(r1a, r1b)}\\)，除以 \\((x-2)(x-3)\\) 餘 \\(${L(r2a, r2b)}\\)，求除以 \\((x-1)(x-2)(x-3)\\) 的餘式。`
        );
        answers.push(
          `簡答：\\(${R2(A, B, C)}\\)。過程：由第一個餘式得 \\(f(1)=${vals[0]},f(2)=${vals[1]}\\)；由第二個餘式得 \\(f(2)=${vals[1]},f(3)=${vals[2]}\\)。三個條件確定二次餘式 \\(ax^2+bx+c\\)，解得 \\(${R2(A, B, C)}\\)。`
        );
        continue;
      }

      // variant 4：三個相異點（含負值）
      const roots = [-1, 1, 2];
      const vals = roots.map(rq);
      questions.push(
        `已知 \\(f(-1)=${vals[0]},f(1)=${vals[1]},f(2)=${vals[2]}\\)，求 \\(f(x)\\) 除以 \\((x+1)(x-1)(x-2)\\) 的餘式。`
      );
      answers.push(
        `簡答：\\(${R2(A, B, C)}\\)。過程：設餘式為 \\(ax^2+bx+c\\)，代入三個根得 \\(a-b+c=${vals[0]}\\)、\\(a+b+c=${vals[1]}\\)、\\(4a+2b+c=${vals[2]}\\)，解得 \\(a=${A},b=${B},c=${C}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131CoefficientTransformRemainderSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const fr = (n, d) => {
      const f = makeFraction(n, d);
      return formatFraction(f.num, f.den);
    };
    const L = (a, b) => formatPolynomialFromCoeffs([a, b]);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // f 除以 kx-m 餘 c → f(m/k)=c；求 xf(x) 除以 x-m/k 的餘式
        const k = randInt(2, 5);
        const m = randInt(1, 6);
        const c = randInt(-8, 9);
        questions.push(
          `設 \\(f(x)\\) 除以 \\(${k}x-${m}\\) 的商為 \\(q(x)\\)、餘式為 ${c}，求 \\(xf(x)\\) 除以 \\(x-\\frac{${m}}{${k}}\\) 的餘式。`
        );
        answers.push(
          `簡答：\\(${fr(m * c, k)}\\)。過程：除以 \\(${k}x-${m}\\) 餘 ${c} 表示 \\(f(\\frac{${m}}{${k}})=${c}\\)。除以一次式 \\(x-\\frac{${m}}{${k}}\\) 的餘式即代入該根，故為 \\(\\frac{${m}}{${k}}\\times${c}=${fr(m * c, k)}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        const k = randInt(2, 5);
        const m = randInt(1, 7);
        const c = randInt(-8, 9);
        const t = randInt(2, 4);
        questions.push(
          `已知 \\(f(x)\\) 除以 \\(${k}x-${m}\\) 的餘式為 ${c}，求 \\(f(${t}x)\\) 除以 \\(${t * k}x-${m}\\) 的餘式。`
        );
        answers.push(
          `簡答：${c}。過程：\\(${t * k}x-${m}=0\\) 的根為 \\(x=\\frac{${m}}{${t * k}}\\)，代入得 \\(f(${t}\\cdot\\frac{${m}}{${t * k}})=f(\\frac{${m}}{${k}})=${c}\\)，故餘式為 ${c}。`
        );
        continue;
      }

      if (variant === 2 || variant === 4) {
        // (x+p)f(x) 除以 x^2+x+1 餘 s(x) → 求 f 的餘式（用 x+p 的模反元素）
        // 直接構造：先取 f 的餘式 (a,b)，計算 (x+p)(ax+b) mod (x^2+x+1)
        const p = pickNonZero(-3, 3);
        const a = pickNonZero(-4, 4);
        const b = randInt(-5, 5);
        // (x+p)(ax+b) = a x^2 + (b+ap) x + bp ; x^2 ≡ -x-1
        const rx = b + a * p - a;
        const rc = b * p - a;
        questions.push(
          `設 \\((x${p > 0 ? '+' : '-'}${Math.abs(p)})f(x)\\) 除以 \\(x^2+x+1\\) 的餘式為 \\(${L(rx, rc)}\\)，求 \\(f(x)\\) 除以 \\(x^2+x+1\\) 的餘式。`
        );
        answers.push(
          `簡答：\\(${L(a, b)}\\)。過程：設 \\(f\\) 的餘式為 \\(ax+b\\)。在模 \\(x^2+x+1\\)（即 \\(x^2\\equiv -x-1\\)）下計算 \\((x${p > 0 ? '+' : '-'}${Math.abs(p)})(ax+b)\\)，與已知餘式 \\(${L(rx, rc)}\\) 比較係數，解得 \\(a=${a},b=${b}\\)。`
        );
        continue;
      }

      // variant 3：xf(x) 除以 x^2+x+1 餘 (Ax+B) → f 的餘式
      const a = pickNonZero(-4, 4);
      const b = randInt(-5, 5);
      // x(ax+b)=a x^2+bx ≡ a(-x-1)+bx = (b-a)x - a
      const rx = b - a;
      const rc = -a;
      questions.push(
        `已知 \\(xf(x)\\) 除以 \\(x^2+x+1\\) 的餘式為 \\(${L(rx, rc)}\\)，求 \\(f(x)\\) 除以 \\(x^2+x+1\\) 的餘式。`
      );
      answers.push(
        `簡答：\\(${L(a, b)}\\)。過程：設 \\(f\\) 的餘式為 \\(ax+b\\)。由 \\(x^2\\equiv-x-1\\)，\\(x(ax+b)\\equiv(b-a)x-a\\)，與已知 \\(${L(rx, rc)}\\) 比較，得 \\(a=${a},b=${b}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131RemainderOperationsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const L = (a, b) => formatPolynomialFromCoeffs([a, b]);
    // 除式為 monic 二次 x^2+Bx+C，則 x^2 ≡ -Bx-C
    const Dtext = (B, C) => formatPolynomialFromCoeffs([1, B, C]);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const B = pickNonZero(-3, 3);
      const C = pickNonZero(-3, 3);
      const a1 = pickNonZero(-4, 4);
      const b1 = randInt(-5, 5);
      const a2 = pickNonZero(-4, 4);
      const b2 = randInt(-5, 5);

      if (variant === 0) {
        questions.push(
          `已知 \\(f(x)\\) 除以 \\(${Dtext(B, C)}\\) 餘 \\(${L(a1, b1)}\\)，\\(g(x)\\) 除以同一除式餘 \\(${L(a2, b2)}\\)，求 \\(f(x)+g(x)\\) 的餘式。`
        );
        answers.push(
          `簡答：\\(${L(a1 + a2, b1 + b2)}\\)。過程：設 \\(f=Dq_1+r_1\\)、\\(g=Dq_2+r_2\\)，則 \\(f+g=D(q_1+q_2)+(r_1+r_2)\\)。因 \\(r_1+r_2=${L(a1 + a2, b1 + b2)}\\) 的次數已小於 2，即為所求餘式。`
        );
        continue;
      }

      if (variant === 1) {
        const m = pickNonZero(-4, 4);
        const n = pickNonZero(-4, 4);
        questions.push(
          `已知 \\(f(x)\\) 除以 \\(${Dtext(B, C)}\\) 餘 \\(${L(a1, b1)}\\)，\\(g(x)\\) 除以同一除式餘 \\(${L(a2, b2)}\\)，求 \\(${m}f(x)${n >= 0 ? '+' : ''}${n}g(x)\\) 的餘式。`
        );
        answers.push(
          `簡答：\\(${L(m * a1 + n * a2, m * b1 + n * b2)}\\)。過程：餘式對線性組合有相同的組合關係，故餘式為 \\(${m}(${L(a1, b1)})${n >= 0 ? '+' : ''}${n}(${L(a2, b2)})=${L(m * a1 + n * a2, m * b1 + n * b2)}\\)，次數小於 2，即為所求。`
        );
        continue;
      }

      if (variant === 2) {
        // (a1x+b1)(a2x+b2) 再用 x^2 ≡ -Bx-C 化簡
        const hi = a1 * a2;
        const mid = a1 * b2 + a2 * b1;
        const lo = b1 * b2;
        const rx = mid - hi * B;
        const rc = lo - hi * C;
        questions.push(
          `已知 \\(f(x)\\) 除以 \\(${Dtext(B, C)}\\) 餘 \\(${L(a1, b1)}\\)，\\(g(x)\\) 除以同一除式餘 \\(${L(a2, b2)}\\)，求 \\(f(x)g(x)\\) 的餘式。`
        );
        answers.push(
          `簡答：\\(${L(rx, rc)}\\)。過程：\\(fg\\) 的餘式等於兩餘式相乘後再除以 \\(${Dtext(B, C)}\\) 的餘式。先乘開：\\((${L(a1, b1)})(${L(a2, b2)})=${hi}x^2${mid >= 0 ? '+' : ''}${mid}x${lo >= 0 ? '+' : ''}${lo}\\)。由除式得 \\(x^2\\equiv ${L(-B, -C)}\\)，代入化簡得 \\(${L(rx, rc)}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        const p = pickNonZero(-4, 4);
        const u = randInt(-6, 8);
        const v = randInt(-6, 8);
        questions.push(
          `若 \\(f(x)\\) 除以 \\(x${p > 0 ? '-' : '+'}${Math.abs(p)}\\) 餘 ${u}，\\(g(x)\\) 除以同一除式餘 ${v}，求 \\((f(x))^2+(g(x))^2\\) 除以 \\(x${p > 0 ? '-' : '+'}${Math.abs(p)}\\) 的餘式。`
        );
        answers.push(
          `簡答：${u * u + v * v}。過程：由餘式定理，\\(f(${p})=${u}\\)、\\(g(${p})=${v}\\)。除以一次式的餘式即為代入該根的值，故所求為 \\(${u}^2+${v}^2=${u * u + v * v}\\)。`
        );
        continue;
      }

      // variant 4：常數倍
      const k = pickNonZero(-5, 5);
      questions.push(`已知 \\(f(x)\\) 被 \\(g(x)\\) 除餘 \\(r(x)\\)，求 \\(${k}f(x)\\) 被 \\(g(x)\\) 除的餘式。`);
      answers.push(
        `簡答：\\(${k}r(x)\\)。過程：由 \\(f=gq+r\\) 得 \\(${k}f=g(${k}q)+${k}r\\)。因 \\(\\deg(${k}r)=\\deg r<\\deg g\\)，所以餘式為 \\(${k}r(x)\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131LowToHighRemainderSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const L = (a, b) => formatPolynomialFromCoeffs([a, b]);
    const Xm = (r) => `x${r > 0 ? '-' : '+'}${Math.abs(r)}`;
    // 過 (p,u),(q,v) 的一次式
    const lin = (p, u, q, v) => {
      const a = makeFraction(v - u, q - p);
      const b = makeFraction(u * (q - p) - (v - u) * p, q - p);
      return { a, b };
    };
    const linText = (p, u, q, v) => {
      const { a, b } = lin(p, u, q, v);
      const at = formatFraction(a.num, a.den);
      const bt = formatFraction(b.num, b.den);
      const aPart = a.num === 0 ? '' : `${at === '1' ? '' : at === '-1' ? '-' : at}x`;
      const bPart = b.num === 0 ? '' : `${b.num > 0 && aPart ? '+' : ''}${bt}`;
      return `${aPart}${bPart}` || '0';
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 1) {
        const p = randInt(-4, 3);
        const q = p + randInt(1, 5);
        // 取一個整係數一次式當真正的餘式，保證數字乾淨
        const ra = pickNonZero(-4, 4);
        const rb = randInt(-6, 6);
        const u = ra * p + rb;
        const v = ra * q + rb;
        const divisor = variant === 0 ? `(${Xm(p)})(${Xm(q)})` : formatPolynomialFromCoeffs([1, -(p + q), p * q]);
        questions.push(
          `已知 \\(f(x)\\) 除以 \\(${Xm(p)}\\) 餘 ${u}，除以 \\(${Xm(q)}\\) 餘 ${v}，求 \\(f(x)\\) 除以 \\(${divisor}\\) 的餘式。`
        );
        answers.push(
          `簡答：\\(${L(ra, rb)}\\)。過程：餘式次數小於 2，設為 \\(ax+b\\)。由餘式定理 \\(f(${p})=${u}\\)、\\(f(${q})=${v}\\)，代入得 \\(${p}a+b=${u}\\)、\\(${q}a+b=${v}\\)，解得 \\(a=${ra},b=${rb}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // 除以 (x-a)(x-b) 餘 r1、除以 (x-b)(x-c) 餘 r2 → 求除以 (x-a)(x-c) 的餘式
        const A = randInt(1, 3);
        const Bp = A + randInt(1, 2);
        const Cp = Bp + randInt(1, 2);
        const ra = pickNonZero(-3, 3);
        const rb = randInt(-5, 5);
        const fA = ra * A + rb;
        const fB = ra * Bp + rb;
        const fC = ra * Cp + rb;
        questions.push(
          `已知多項式 \\(f(x)\\) 除以 \\(${formatPolynomialFromCoeffs([1, -(A + Bp), A * Bp])}\\) 餘 \\(${L(ra, rb)}\\)，除以 \\(${formatPolynomialFromCoeffs([1, -(Bp + Cp), Bp * Cp])}\\) 餘 \\(${L(ra, rb)}\\)，求除以 \\(${formatPolynomialFromCoeffs([1, -(A + Cp), A * Cp])}\\) 的餘式。`
        );
        answers.push(
          `簡答：\\(${L(ra, rb)}\\)。過程：由第一式得 \\(f(${A})=${fA}\\)、\\(f(${Bp})=${fB}\\)；由第二式得 \\(f(${Bp})=${fB}\\)、\\(f(${Cp})=${fC}\\)（兩者在 \\(x=${Bp}\\) 一致）。再由 \\(f(${A})=${fA}\\)、\\(f(${Cp})=${fC}\\) 解一次餘式，得 \\(${L(ra, rb)}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        const ra = pickNonZero(-5, 5);
        const rb = randInt(-6, 6);
        const u = ra + rb;
        const v = -ra + rb;
        questions.push(`若 \\(f(1)=${u},f(-1)=${v}\\)，求 \\(f(x)\\) 除以 \\(x^2-1\\) 的餘式。`);
        answers.push(
          `簡答：\\(${L(ra, rb)}\\)。過程：餘式設為 \\(ax+b\\)。由 \\(f(1)=a+b=${u}\\)、\\(f(-1)=-a+b=${v}\\)，相加得 \\(b=${rb}\\)，相減得 \\(a=${ra}\\)。`
        );
        continue;
      }

      // variant 4：三點 → 二次餘式
      const r0 = randInt(1, 3);
      const roots = [r0, r0 + 1, r0 + 2];
      const qa = pickNonZero(-3, 3);
      const qb = randInt(-4, 4);
      const qc = randInt(-5, 5);
      const vals = roots.map((x) => qa * x * x + qb * x + qc);
      questions.push(
        `若 \\(f(x)\\) 分別除以 \\(${Xm(roots[0])},${Xm(roots[1])},${Xm(roots[2])}\\) 的餘式為 ${vals.join(',')}，求 \\(f(x)\\) 除以 \\((${Xm(roots[0])})(${Xm(roots[1])})(${Xm(roots[2])})\\) 的餘式。`
      );
      answers.push(
        `簡答：\\(${formatPolynomialFromCoeffs([qa, qb, qc])}\\)。過程：餘式次數小於 3，設為 \\(ax^2+bx+c\\)。由餘式定理得 \\(f(${roots[0]})=${vals[0]}\\)、\\(f(${roots[1]})=${vals[1]}\\)、\\(f(${roots[2]})=${vals[2]}\\)，解此三元一次聯立，得 \\(a=${qa},b=${qb},c=${qc}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131TransformedDividendRemainderSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const L = (a, b) => formatPolynomialFromCoeffs([a, b]);
    const fr = (n, d) => {
      const f = makeFraction(n, d);
      return formatFraction(f.num, f.den);
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 1) {
        // 除式 x^2+Bx+C（monic），x^2 ≡ -Bx-C
        const B = pickNonZero(-3, 3);
        const C = pickNonZero(-3, 3);
        const a = pickNonZero(-4, 4);
        const b = randInt(-5, 5);
        // 乘數：variant 0 用 (x+m)，variant 1 用 x
        const m = variant === 0 ? pickNonZero(-3, 3) : 0;
        // (x+m)(ax+b) = a x^2 + (b+am) x + bm  → 代入 x^2 ≡ -Bx-C
        const hi = a;
        const mid = b + a * m;
        const lo = b * m;
        const rx = mid - hi * B;
        const rc = lo - hi * C;
        const mulText = variant === 0 ? `(x${m > 0 ? '+' : '-'}${Math.abs(m)})` : 'x';
        questions.push(
          `已知 \\(${mulText}f(x)\\) 除以 \\(${formatPolynomialFromCoeffs([1, B, C])}\\) 的餘式為 \\(${L(rx, rc)}\\)，求 \\(f(x)\\) 除以同一除式的餘式。`
        );
        answers.push(
          `簡答：\\(${L(a, b)}\\)。過程：設 \\(f\\) 的餘式為 \\(ax+b\\)。由除式得 \\(x^2\\equiv ${L(-B, -C)}\\)。計算 \\(${mulText}(ax+b)\\) 並化簡，與已知餘式 \\(${L(rx, rc)}\\) 比較係數，解得 \\(a=${a},b=${b}\\)，故 \\(f\\) 的餘式為 \\(${L(a, b)}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // f 除以 (kx-m) 餘 c → f(m/k)=c；xf(x) 除以 (x-m/k) 的餘式 = (m/k)c
        const k = randInt(2, 5);
        const m = randInt(1, 6);
        const c = randInt(-8, 9);
        questions.push(
          `已知 \\(f(x)\\) 除以 \\(${k}x-${m}\\) 餘 ${c}，求 \\(xf(x)\\) 除以 \\(x-\\frac{${m}}{${k}}\\) 的餘式。`
        );
        answers.push(
          `簡答：\\(${fr(m * c, k)}\\)。過程：由 \\(${k}x-${m}=0\\) 得 \\(x=\\frac{${m}}{${k}}\\)，故 \\(f(\\frac{${m}}{${k}})=${c}\\)。除以一次式的餘式即代入該根，所以 \\(xf(x)\\) 的餘式為 \\(\\frac{${m}}{${k}}\\times${c}=${fr(m * c, k)}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        // f 除以 (kx-m) 餘 c → f(m/k)=c；f(tx) 除以 (kx - m/t·k?) 用固定關係
        const k = randInt(2, 5);
        const m = randInt(1, 7);
        const c = randInt(-8, 9);
        const t = randInt(2, 4);
        // f(tx) 除以 (t·k x - m)：根 x=m/(tk) → f(t·m/(tk))=f(m/k)=c
        questions.push(
          `設 \\(f(x)\\) 除以 \\(${k}x-${m}\\) 餘 ${c}，求 \\(f(${t}x)\\) 除以 \\(${t * k}x-${m}\\) 的餘式。`
        );
        answers.push(
          `簡答：${c}。過程：\\(${t * k}x-${m}=0\\) 的根為 \\(x=\\frac{${m}}{${t * k}}\\)。代入得 \\(f(${t}\\cdot\\frac{${m}}{${t * k}})=f(\\frac{${m}}{${k}})\\)。又由 \\(${k}x-${m}\\) 的餘式知 \\(f(\\frac{${m}}{${k}})=${c}\\)，故餘式為 ${c}。`
        );
        continue;
      }

      // variant 4：f 明確給出，求 f(ax+b) 除以 (cx+d) 的餘式
      const co = s131RandPoly(randInt(2, 3), -3, 4);
      const aa = randInt(2, 4);
      const bb = randInt(-5, 5);
      const cc = randInt(2, 4);
      const dd = pickNonZero(-6, 6);
      // 根 x = -dd/cc；代入 f(aa·x+bb)
      const inner = makeFraction(aa * -dd + bb * cc, cc);
      if (inner.den !== 1) {
        i -= 1;
        continue;
      }
      const val = s131PolyEval(co, inner.num);
      questions.push(
        `設 \\(f(x)=${formatPolynomialFromCoeffs(co)}\\)，求 \\(f(${aa}x${bb >= 0 ? '+' : ''}${bb})\\) 除以 \\(${cc}x${dd >= 0 ? '+' : ''}${dd}\\) 的餘式。`
      );
      answers.push(
        `簡答：${val}。過程：\\(${cc}x${dd >= 0 ? '+' : ''}${dd}=0\\) 的根為 \\(x=${fr(-dd, cc)}\\)。代入內層得 \\(${aa}\\times${fr(-dd, cc)}${bb >= 0 ? '+' : ''}${bb}=${inner.num}\\)，故餘式為 \\(f(${inner.num})=${val}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131SquareDivisorCalculationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const L = (a, b) => formatPolynomialFromCoeffs([a, b]);
    const lead = (v, p) => `${v === 1 ? '' : v === -1 ? '-' : v}x^{${p}}`;
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 3 || variant === 4) {
        // a x^m + b x^{m-1} + c 被 (x-1)^2 整除 → (a,b)=((m-1)c, -mc)
        const m = randInt(5, 12);
        const c = pickNonZero(-3, 3);
        const a = (m - 1) * c;
        const b = -m * c;
        const bTerm = `${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}x^{${m - 1}}`;
        questions.push(
          `設 \\(${lead(a, m)}${bTerm}${c >= 0 ? '+' : '-'}${Math.abs(c)}\\) 能被 \\((x-1)^2\\) 整除，求數對 \\((a,b)\\)。`
        );
        answers.push(
          `簡答：\\((a,b)=(${a},${b})\\)。過程：設 \\(g(x)=ax^{${m}}+bx^{${m - 1}}${c >= 0 ? '+' : '-'}${Math.abs(c)}\\)。被 \\((x-1)^2\\) 整除需 \\(g(1)=0\\) 且 \\(g'(1)=0\\)，即 \\(a+b${c >= 0 ? '+' : '-'}${Math.abs(c)}=0\\) 與 \\(${m}a+${m - 1}b=0\\)，解得 \\(a=${a},b=${b}\\)。`
        );
        continue;
      }

      // 求 x^n + const 除以 (x-a)^2 的餘式，a∈{1,-1}
      const a0 = randInt(0, 1) === 0 ? 1 : -1;
      const n = randInt(8, 200);
      const cc = randInt(-5, 6);
      const an = a0 === 1 ? 1 : n % 2 === 0 ? 1 : -1;
      const an1 = a0 === 1 ? 1 : (n - 1) % 2 === 0 ? 1 : -1;
      const fa = an + cc;
      const dfa = n * an1;
      const ra = dfa;
      const rb = fa - dfa * a0;
      const aTerm = a0 === 1 ? 'x-1' : 'x+1';
      const constPart = cc === 0 ? '' : `${cc >= 0 ? '+' : '-'}${Math.abs(cc)}`;
      questions.push(`求 \\(x^{${n}}${constPart}\\) 除以 \\((${aTerm})^2\\) 的餘式。`);
      answers.push(
        `簡答：\\(${L(ra, rb)}\\)。過程：令 \\(f(x)=x^{${n}}${constPart}\\)。除以 \\((${aTerm})^2\\) 的餘式為 \\(f(${a0})+f'(${a0})(x${a0 === 1 ? '-1' : '+1'})\\)。計算 \\(f(${a0})=${an}${constPart}=${fa}\\)、\\(f'(${a0})=${n}\\times(${a0})^{${n - 1}}=${dfa}\\)，整理得餘式 \\(${L(ra, rb)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131SpecialXnRemainderSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const L = (a, b) => formatPolynomialFromCoeffs([a, b]);
    const term = (co, e) => {
      const mag = Math.abs(co) === 1 && e > 0 ? '' : `${Math.abs(co)}`;
      const xp = e === 0 ? '' : e === 1 ? 'x' : `x^{${e}}`;
      return { neg: co < 0, body: `${mag}${xp}` };
    };
    const dividendText = (terms) =>
      terms
        .map(({ co, e }, idx) => {
          const { neg, body } = term(co, e);
          return `${neg ? '-' : idx === 0 ? '' : '+'}${body}`;
        })
        .join('');
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        // 除以 x^3-1：x^n ≡ x^(n mod 3)
        const terms = [];
        const n = randInt(2, 3);
        for (let t = 0; t < n + 1; t += 1) terms.push({ co: pickNonZero(-5, 5), e: randInt(6, 300) });
        terms.push({ co: pickNonZero(-6, 6), e: 0 });
        terms.sort((p, q) => q.e - p.e);
        const r = [0, 0, 0]; // c2 x^2 + c1 x + c0
        terms.forEach(({ co, e }) => {
          r[2 - (e % 3)] += co;
        });
        const rem = formatPolynomialFromCoeffs(r);
        questions.push(`求 \\(${dividendText(terms)}\\) 除以 \\(x^3-1\\) 的餘式。`);
        answers.push(
          `簡答：\\(${rem}\\)。過程：因 \\(x^3\\equiv1\\)，故 \\(x^n\\equiv \\,x^{n\\bmod 3}\\)。把每項的指數對 3 取餘（${terms
            .map(({ e }) => `${e}\\to${e % 3}`)
            .join('、')}）後合併同類項，得餘式 \\(${rem}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 除以 x^2+x-2=(x-1)(x+2)：B=1,C=-2（根為 -2，指數需小以免數字過大）
        const terms = [];
        for (let t = 0; t < randInt(2, 3); t += 1) terms.push({ co: pickNonZero(-4, 4), e: randInt(5, 12) });
        terms.push({ co: pickNonZero(-5, 5), e: 0 });
        terms.sort((p, q) => q.e - p.e);
        let ra = 0;
        let rb = 0;
        terms.forEach(({ co, e }) => {
          const [xa, xb] = s131XnMod2(e, 1, -2);
          ra += co * xa;
          rb += co * xb;
        });
        questions.push(`求 \\(${dividendText(terms)}\\) 除以 \\(x^2+x-2\\) 的餘式。`);
        answers.push(
          `簡答：\\(${L(ra, rb)}\\)。過程：\\(x^2+x-2=(x-1)(x+2)\\)。設餘式為 \\(ax+b\\)，由代入根 \\(x=1\\) 與 \\(x=-2\\) 得兩個線性方程，解得餘式 \\(${L(ra, rb)}\\)。`
        );
        continue;
      }

      // variant 2、4：除以 x^2+x+1
      const terms = [];
      for (let t = 0; t < randInt(2, 3); t += 1) terms.push({ co: pickNonZero(-4, 4), e: randInt(10, 60) });
      terms.push({ co: pickNonZero(-5, 5), e: 0 });
      terms.sort((p, q) => q.e - p.e);
      let ra = 0;
      let rb = 0;
      terms.forEach(({ co, e }) => {
        const [xa, xb] = s131XnMod2(e, 1, 1);
        ra += co * xa;
        rb += co * xb;
      });
      questions.push(`已知 \\(f(x)=${dividendText(terms)}\\)，求其除以 \\(x^2+x+1\\) 的餘式。`);
      answers.push(
        `簡答：\\(${L(ra, rb)}\\)。過程：由 \\(x^2+x+1=0\\) 的根滿足 \\(x^3=1\\)，故 \\(x^n\\equiv \\, x^{n\\bmod 3}\\)，再用 \\(x^2\\equiv-x-1\\) 化為一次式。逐項化簡並相加，得餘式 \\(${L(ra, rb)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131RecoverDividendFromQuotientSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const P = (c) => formatPolynomialFromCoeffs(c);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const root = pickNonZero(-3, 3);
        const D = [1, -root];
        const Q = s131RandPoly(2, -3, 4);
        const R = randInt(-6, 8);
        const f = s131PolyAdd(s131PolyMul(D, Q), [R]);
        questions.push(`若多項式 \\(f(x)\\) 除以 \\(${P(D)}\\) 的商式為 \\(${P(Q)}\\)，餘式為 ${R}，求 \\(f(x)\\)。`);
        answers.push(
          `簡答：\\(f(x)=${P(f)}\\)。過程：由除法原理 \\(f(x)=(${P(D)})(${P(Q)})+${R}\\)，展開整理得 \\(${P(f)}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        const D = [1, randInt(-3, 3), randInt(-3, 4)];
        const Q = [1, randInt(-3, 3)];
        const R = s131RandPoly(1, -3, 3);
        const dividend = s131PolyAdd(s131PolyMul(D, Q), R);
        questions.push(
          `已知 \\(${P(dividend)}\\) 除以 \\(f(x)\\) 的商式為 \\(${P(Q)}\\)，餘式為 \\(${P(R)}\\)，求 \\(f(x)\\)。`
        );
        answers.push(
          `簡答：\\(f(x)=${P(D)}\\)。過程：由 \\(${P(dividend)}=f(x)(${P(Q)})+(${P(R)})\\)，得 \\(f(x)(${P(Q)})=${P(s131PolyMul(D, Q))}\\)，除以 \\(${P(Q)}\\) 得 \\(f(x)=${P(D)}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        const b = randInt(2, 6);
        const c = pickNonZero(-3, 4);
        const D = [1, -3, b];
        const Q = [2, c];
        const R = [3, -2];
        const f = s131PolyAdd(s131PolyMul(D, Q), R);
        const x2 = f[1];
        const x1 = f[2];
        const x0 = f[3];
        const disp = `2x^3${x2 >= 0 ? '+' : ''}${x2}x^2+ax${x0 >= 0 ? '+' : ''}${x0}`;
        questions.push(
          `設 \\(${disp}\\) 除以 \\(x^2-3x+b\\) 的商式為 \\(2x+c\\)，餘式為 \\(3x-2\\)，求數對 \\((a,b,c)\\)。`
        );
        answers.push(
          `簡答：\\((a,b,c)=(${x1},${b},${c})\\)。過程：由除法原理，比較 \\(x^2\\) 係數得 \\(c-6=${x2}\\)，故 \\(c=${c}\\)；比較常數項得 \\(bc-2=${x0}\\)，故 \\(b=${b}\\)；比較一次項得 \\(a=2b-3c+3=${x1}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        const D = s131RandPoly(2, -2, 3);
        const q = s131RandPoly(1, -3, 4);
        const R = s131RandPoly(1, -3, 3);
        const f = s131PolyAdd(s131PolyMul(D, q), R);
        questions.push(`若 \\(f(x)=(${P(D)})q(x)+(${P(R)})\\)，且 \\(f(x)=${P(f)}\\)，求 \\(q(x)\\)。`);
        answers.push(
          `簡答：\\(q(x)=${P(q)}\\)。過程：先移去餘式，\\((${P(D)})q(x)=${P(f)}-(${P(R)})=${P(s131PolyMul(D, q))}\\)，再除以 \\(${P(D)}\\)，得 \\(q(x)=${P(q)}\\)。`
        );
        continue;
      }

      const D = s131RandPoly(2, -2, 3);
      const Q = s131RandPoly(2, -2, 3);
      const R = s131RandPoly(1, -3, 4);
      const f = s131PolyAdd(s131PolyMul(D, Q), R);
      questions.push(
        `已知 \\(f(x)\\) 除以 \\(${P(D)}\\) 的商式為 \\(${P(Q)}\\)，餘式為 \\(${P(R)}\\)，求 \\(f(x)\\)。`
      );
      answers.push(
        `簡答：\\(f(x)=${P(f)}\\)。過程：由除法原理，\\(f(x)=(${P(D)})(${P(Q)})+(${P(R)})\\)，展開得 \\(${P(f)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131DivisibilityUnknownCoefficientSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // 顯示 x^k 項（係數為 0 時省略），mid 用於中間項
    const term = (co, k) => {
      if (co === 0) return '';
      const mag = Math.abs(co) === 1 && k > 0 ? '' : `${Math.abs(co)}`;
      const xp = k === 0 ? '' : k === 1 ? 'x' : `x^${k}`;
      return `${co > 0 ? '+' : '-'}${mag}${xp}`;
    };
    const sym = (name, k) => `+${name}${k === 0 ? '' : k === 1 ? 'x' : `x^${k}`}`;
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        // x^3 + (n+s)x^2 + m x + rs 可被 x^2+nx+r 整除（商式 x+s），m,n 未知
        const n = pickNonZero(-3, 3);
        const r = pickNonZero(-3, 3);
        const s = pickNonZero(-3, 3);
        const Bc = n + s;
        const m = r + n * s;
        const D = r * s;
        questions.push(
          `若 \\(x^3${term(Bc, 2)}${sym('m', 1)}${term(D, 0)}\\) 可被 \\(x^2${sym('n', 1)}${term(r, 0)}\\) 整除，求數對 \\((m,n)\\)。`
        );
        answers.push(
          `簡答：\\((m,n)=(${m},${n})\\)。過程：商式為 \\(x+s\\)。展開 \\((x^2+nx${term(r, 0)})(x+s)\\)：比較常數項 \\(${r}s=${D}\\) 得 \\(s=${s}\\)；比較 \\(x^2\\) 係數 \\(n+${s}=${Bc}\\) 得 \\(n=${n}\\)；比較 \\(x\\) 係數得 \\(m=${r}${n * s >= 0 ? '+' : '-'}${Math.abs(n * s)}=${m}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 2x^3+(c+2p)x^2+(pc+2b)x+a 是 x^2+px+b 的倍式（商式 2x+c），a,b 未知
        const p = pickNonZero(-4, 3);
        const b = pickNonZero(-3, 4);
        const c = pickNonZero(-4, 4);
        const Bc = c + 2 * p;
        const m = p * c + 2 * b;
        const a = b * c;
        questions.push(
          `已知 \\(2x^3${term(Bc, 2)}${term(m, 1)}+a\\) 是 \\(x^2${term(p, 1)}+b\\) 的倍式，求 \\(a,b\\) 之值。`
        );
        answers.push(
          `簡答：\\(a=${a},b=${b}\\)。過程：商式設為 \\(2x+c\\)。比較 \\(x^2\\) 係數 \\(c${2 * p >= 0 ? '+' : '-'}${Math.abs(2 * p)}=${Bc}\\) 得 \\(c=${c}\\)；比較 \\(x\\) 係數 \\(${p}c+2b=${m}\\) 得 \\(b=${b}\\)；常數項 \\(bc=${a}\\)，故 \\(a=${a}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // x^4+(p+u)x^3+(b+v+pu)x^2+a x+bv 可被 x^2+px+b 整除（商式 x^2+ux+v），a,b 未知
        const p = pickNonZero(-3, 3);
        const b = pickNonZero(-3, 3);
        const u = pickNonZero(-3, 3);
        const v = pickNonZero(-3, 3);
        const c1 = p + u;
        const c2 = b + v + p * u;
        const a = p * v + b * u;
        const D = b * v;
        questions.push(
          `設 \\(x^4${term(c1, 3)}${term(c2, 2)}+ax${term(D, 0)}\\) 可被 \\(x^2${term(p, 1)}+b\\) 整除，求 \\(a+b\\)。`
        );
        answers.push(
          `簡答：${a + b}。過程：商式設為 \\(x^2+ux+v\\)。比較 \\(x^3\\) 係數得 \\(u=${u}\\)；由常數項 \\(bv=${D}\\) 與 \\(x^2\\) 係數 \\(b+v${p * u >= 0 ? '+' : '-'}${Math.abs(p * u)}=${c2}\\) 解得 \\(b=${b},v=${v}\\)；再由 \\(x\\) 係數 \\(a=${p}v+bu=${a}\\)。故 \\(a+b=${a}${b >= 0 ? '+' : '-'}${Math.abs(b)}=${a + b}\\)。`
        );
        continue;
      }

      // variant 4：x^3+ax^2+Cx+D 可被 x^2+px+r 整除（商式 x+s），a 未知
      const p4 = pickNonZero(-3, 3);
      const r4 = pickNonZero(-3, 3);
      const s4 = pickNonZero(-3, 3);
      const a4 = p4 + s4;
      const C4 = r4 + p4 * s4;
      const D4 = r4 * s4;
      questions.push(
        `若 \\(x^3+ax^2${term(C4, 1)}${term(D4, 0)}\\) 可被 \\(x^2${term(p4, 1)}${term(r4, 0)}\\) 整除，求 \\(a\\)。`
      );
      answers.push(
        `簡答：\\(a=${a4}\\)。過程：商式設為 \\(x+s\\)。由常數項 \\(${r4}s=${D4}\\) 得 \\(s=${s4}\\)，代入 \\(x\\) 係數 \\(${r4}${p4 * s4 >= 0 ? '+' : '-'}${Math.abs(p4 * s4)}=${C4}\\) 一致，再由 \\(x^2\\) 係數得 \\(a=${p4}${s4 >= 0 ? '+' : '-'}${Math.abs(s4)}=${a4}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131DivisionPrincipleReverseTwoSubtypeMixedSet(count) {
    const banks = [buildS131RecoverDividendFromQuotientSet, buildS131DivisibilityUnknownCoefficientSet];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131InterpolationPolynomialFromPointsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      let degree;
      let xs;
      if (variant === 0) {
        degree = 2;
        const s = randInt(1, 5);
        xs = [s, s + 1, s + 2];
      } else if (variant === 1) {
        degree = 3;
        const s = randInt(1, 3);
        xs = [s, s + 1, s + 2, s + 3];
      } else if (variant === 2) {
        degree = 2;
        const base = [11, 12, 20, 21, 31][randInt(0, 4)];
        xs = [base, base + 1, base + 2];
      } else if (variant === 3) {
        degree = 3;
        xs = [-1, 0, 1, 2];
      } else {
        degree = 2;
        const base = [99, 199, 997, 999][randInt(0, 3)];
        xs = [base, base + 2, base + 4];
      }
      const coeffs = s131RandPoly(degree, -4, 5);
      const points = xs.map((x) => [x, s131PolyEval(coeffs, x)]);
      const polyText = formatPolynomialFromCoeffs(coeffs);
      const degWord = degree === 2 ? '二' : '三';
      const genForm = degree === 2 ? 'ax^2+bx+c' : 'ax^3+bx^2+cx+d';
      questions.push(`求通過 \\(${s131PointText(points)}\\) 這 ${points.length} 點的最低次多項式 \\(f(x)\\)。`);
      answers.push(
        `簡答：\\(f(x)=${polyText}\\)。過程：設 \\(f(x)=${genForm}\\)（${degWord}次），代入 ${points.length} 個點得聯立方程並求解，得 \\(f(x)=${polyText}\\)。可驗證：${points
          .map(([x, y]) => `\\(f(${x})=${y}\\)`)
          .join('、')}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131InterpolationValueOnlySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      if (variant === 4) {
        // 三次：f(r)=f(r+1)=f(r+2)=C，另給一點反求 k，再求另一點
        const r = randInt(1, 3);
        const C = pickNonZero(-9, 9);
        const k = pickNonZero(-3, 3);
        const base = s131PolyMul(s131PolyMul([1, -r], [1, -(r + 1)]), [1, -(r + 2)]);
        const coeffs = s131PolyAdd(
          base.map((c) => c * k),
          [C]
        );
        const p = r - 1;
        const fp = s131PolyEval(coeffs, p);
        const q = r + 3;
        const fq = s131PolyEval(coeffs, q);
        questions.push(
          `設 \\(f(x)\\) 為三次多項式，已知 \\(f(${r})=f(${r + 1})=f(${r + 2})=${C}\\)，且 \\(f(${p})=${fp}\\)，求 \\(f(${q})\\)。`
        );
        answers.push(
          `簡答：${fq}。過程：因為 \\(f(x)-(${C})\\) 在 \\(${r},${r + 1},${r + 2}\\) 皆為 0，設 \\(f(x)=${C}+k(x-${r})(x-${r + 1})(x-${r + 2})\\)。由 \\(f(${p})=${fp}\\) 解得 \\(k=${k}\\)，代入 \\(x=${q}\\) 得 \\(f(${q})=${fq}\\)。`
        );
        continue;
      }
      const coeffs = s131RandPoly(2, -4, 6);
      const [a, b, c] = coeffs;
      let base;
      let targetX;
      if (variant === 0) {
        base = randInt(1, 4);
        targetX = base + 3;
      } else if (variant === 1) {
        base = [10, 11, 12][randInt(0, 2)];
        targetX = 0;
      } else if (variant === 2) {
        base = randInt(-2, 2);
        targetX = base + 3;
      } else {
        base = randInt(1, 3);
        targetX = base - 2;
      }
      const gx = [base, base + 1, base + 2];
      const gv = gx.map((x) => s131PolyEval(coeffs, x));
      const targetV = s131PolyEval(coeffs, targetX);
      questions.push(
        `設 \\(f(x)\\) 為二次多項式，且 \\(f(${gx[0]})=${gv[0]},f(${gx[1]})=${gv[1]},f(${gx[2]})=${gv[2]}\\)，求 \\(f(${targetX})\\) 之值。`
      );
      answers.push(
        `簡答：${targetV}。過程：設 \\(f(x)=ax^2+bx+c\\)，代入三點解得 \\(a=${a},b=${b},c=${c}\\)，故 \\(f(${targetX})=${targetV}\\)。（亦可用階差：一次差 ${gv[1] - gv[0]}、${gv[2] - gv[1]}，二次差固定為 ${gv[2] - 2 * gv[1] + gv[0]}。）`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131InterpolationStructuralRemainderSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const r = randInt(1, 3);
        const roots = [r, r + 1, r + 2];
        const C = pickNonZero(-6, 8);
        const k = pickNonZero(-3, 3);
        const base = s131PolyMul(s131PolyMul([1, -roots[0]], [1, -roots[1]]), [1, -roots[2]]);
        const coeffs = s131PolyAdd(
          base.map((x) => x * k),
          [C]
        );
        const p = r - 1;
        const fp = s131PolyEval(coeffs, p);
        const polyText = formatPolynomialFromCoeffs(coeffs);
        questions.push(
          `設三次多項式 \\(f(x)\\)，已知 \\(f(${roots[0]})=f(${roots[1]})=f(${roots[2]})=${C}\\)，且 \\(f(${p})=${fp}\\)，求 \\(f(x)\\)。`
        );
        answers.push(
          `簡答：\\(f(x)=${polyText}\\)。過程：因為 \\(f(x)-(${C})\\) 在 \\(${roots.join(',')}\\) 皆為 0，設 \\(f(x)=${C}+k(x-${roots[0]})(x-${roots[1]})(x-${roots[2]})\\)。由 \\(f(${p})=${fp}\\) 解得 \\(k=${k}\\)，展開得 \\(f(x)=${polyText}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        const rc = s131RandPoly(2, -3, 4);
        const rv = [1, 2, 3].map((x) => s131PolyEval(rc, x));
        const rtext = formatPolynomialFromCoeffs(rc);
        questions.push(
          `已知 \\(f(x)\\) 除以 \\(x-1,x-2,x-3\\) 的餘式分別為 ${rv[0]},${rv[1]},${rv[2]}，求 \\(f(x)\\) 除以 \\((x-1)(x-2)(x-3)\\) 的餘式 \\(r(x)\\)。`
        );
        answers.push(
          `簡答：\\(r(x)=${rtext}\\)。過程：由餘式定理 \\(r(1)=${rv[0]},r(2)=${rv[1]},r(3)=${rv[2]}\\)，且餘式次數小於 3。設 \\(r(x)=ax^2+bx+c\\) 解聯立，得 \\(r(x)=${rtext}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        const r1 = randInt(1, 2);
        const r2 = r1 + randInt(1, 2);
        const a = pickNonZero(-2, 3);
        const b = pickNonZero(-4, 4);
        const coeffs = s131PolyMul(s131PolyMul([1, -r1], [1, -r2]), [a, b]);
        const p1 = r2 + 1;
        const p2 = r2 + 2;
        const q = r2 + 3;
        questions.push(
          `設 \\(f(x)\\) 為三次多項式，若 \\(f(${r1})=f(${r2})=0,f(${p1})=${s131PolyEval(coeffs, p1)},f(${p2})=${s131PolyEval(coeffs, p2)}\\)，求 \\(f(${q})\\)。`
        );
        answers.push(
          `簡答：${s131PolyEval(coeffs, q)}。過程：由 \\(f(${r1})=f(${r2})=0\\)，設 \\(f(x)=(x-${r1})(x-${r2})(ax+b)\\)。代入另兩點解得 \\(a=${a},b=${b}\\)，代入 \\(x=${q}\\) 得 ${s131PolyEval(coeffs, q)}。`
        );
        continue;
      }

      if (variant === 3) {
        const coeffs = s131RandPoly(2, -3, 5);
        const xs = [randInt(-2, 0), randInt(1, 2), randInt(3, 5)];
        const pts = xs.map((x) => [x, s131PolyEval(coeffs, x)]);
        const polyText = formatPolynomialFromCoeffs(coeffs);
        questions.push(
          `設 \\(f(x)\\) 為二次多項式，且 \\(${pts.map(([x, y]) => `f(${x})=${y}`).join(',')}\\)，求 \\(f(x)\\)。`
        );
        answers.push(
          `簡答：\\(f(x)=${polyText}\\)。過程：設 \\(f(x)=ax^2+bx+c\\)，代入三點解聯立，得 \\(f(x)=${polyText}\\)。`
        );
        continue;
      }

      const r = randInt(1, 3);
      const roots = [r, r + 1, r + 2];
      const C = pickNonZero(-6, 8);
      const k = pickNonZero(-3, 3);
      const base = s131PolyMul(s131PolyMul([1, -roots[0]], [1, -roots[1]]), [1, -roots[2]]);
      const coeffs = s131PolyAdd(
        base.map((x) => x * k),
        [C]
      );
      const p = roots[2] + 1;
      questions.push(
        `已知三次多項式 \\(f(x)\\) 滿足 \\(f(${roots[0]})=f(${roots[1]})=f(${roots[2]})=${C}\\)，且 \\(f(${p})=${s131PolyEval(coeffs, p)}\\)，求 \\(f(0)\\)。`
      );
      answers.push(
        `簡答：${s131PolyEval(coeffs, 0)}。過程：設 \\(f(x)=${C}+k(x-${roots[0]})(x-${roots[1]})(x-${roots[2]})\\)。由 \\(f(${p})=${s131PolyEval(coeffs, p)}\\) 得 \\(k=${k}\\)，代入 \\(x=0\\) 得 ${s131PolyEval(coeffs, 0)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131InterpolationFiniteDifferenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const diffOnce = (arr) => arr.slice(1).map((v, i) => v - arr[i]);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const degree = variant % 2 === 0 ? 2 : 3;
      let start;
      let h;
      if (variant === 0) {
        start = randInt(1, 4);
        h = 1;
      } else if (variant === 1) {
        start = 10;
        h = 10;
      } else if (variant === 2) {
        start = [2001, 2010, 1999][randInt(0, 2)];
        h = 1;
      } else if (variant === 3) {
        start = -2;
        h = 1;
      } else {
        start = randInt(1, 5);
        h = 1;
      }
      const n = degree + 1;
      const coeffs = s131RandPoly(degree, -3, 4);
      const xs = Array.from({ length: n }, (_, j) => start + j * h);
      const ys = xs.map((x) => s131PolyEval(coeffs, x));
      const targetX = start + n * h;
      const targetY = s131PolyEval(coeffs, targetX);
      let level = ys.slice();
      const diffLines = [];
      let order = 0;
      while (level.length > 1) {
        level = diffOnce(level);
        order += 1;
        diffLines.push(`${order}階差 [${level.join(',')}]`);
      }
      const degWord = degree === 2 ? '二' : '三';
      questions.push(
        `${degWord}次多項式 \\(f(x)\\) 滿足 \\(${xs.map((x, j) => `f(${x})=${ys[j]}`).join(',')}\\)，利用階差求 \\(f(${targetX})\\)。`
      );
      answers.push(
        `簡答：${targetY}。過程：輸入值等差（間距 ${h}），差分表為 ${diffLines.join('、')}。${degWord}次多項式的第 ${degree} 階差固定，逐階往下外推，得 \\(f(${targetX})=${targetY}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131InterpolationLagrangeSpecialSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // 拉格朗日基底之和恆為常數 C，通過 (a,C),(b,C),(c,C)
        const C = pickNonZero(-5, 6);
        const N = randInt(100, 3000);
        questions.push(
          `設 \\(a,b,c\\) 相異，令 \\(f(x)=${C}\\left[\\frac{(x-b)(x-c)}{(a-b)(a-c)}+\\frac{(x-c)(x-a)}{(b-c)(b-a)}+\\frac{(x-a)(x-b)}{(c-a)(c-b)}\\right]\\)。證明 \\(f(x)=${C}\\)，並求 \\(f(${N})\\)。`
        );
        answers.push(
          `簡答：\\(f(x)=${C}\\)，\\(f(${N})=${C}\\)。過程：中括號內是通過 \\((a,1),(b,1),(c,1)\\) 的插值多項式，其值恆為 1。常數多項式 1 也通過這三點，由唯一性知括號 \\(=1\\)，故 \\(f(x)=${C}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 三共線點 → 退化為一次式 y=mx+k
        const m = pickNonZero(-3, 4);
        const k = randInt(-5, 6);
        const xs = [randInt(1, 4), 0, 0];
        xs[1] = xs[0] + randInt(1, 3);
        xs[2] = xs[1] + randInt(1, 3);
        const pts = xs.map((x) => [x, m * x + k]);
        const lineText = formatPolynomialFromCoeffs([m, k]);
        questions.push(`給定三點 \\(${s131PointText(pts)}\\)，求其插值多項式並解釋為何退化為一次式。`);
        answers.push(
          `簡答：\\(f(x)=${lineText}\\)。過程：三點都在直線 \\(y=${lineText}\\) 上。用三點雖可求二次以下插值多項式，但二次項係數為 0，故退化為一次式。`
        );
        continue;
      }

      if (variant === 2) {
        // 根號技巧：底層多項式 x^2+e，取點 (√A,A+e) 等，求 f(√N)=N+e
        const e = randInt(-4, 5);
        const roots = shuffle([2, 3, 5, 6, 7, 10]).slice(0, 3);
        const N = [179, 211, 233, 251][randInt(0, 3)];
        const vals = roots.map((A) => A + e);
        const eTerm = e === 0 ? '' : e > 0 ? `+${e}` : `${e}`;
        questions.push(
          `設 \\(f(x)\\) 為二次多項式，且通過 \\((\\sqrt{${roots[0]}},${vals[0]}),(\\sqrt{${roots[1]}},${vals[1]}),(\\sqrt{${roots[2]}},${vals[2]})\\)，求 \\(f(\\sqrt{${N}})\\)。`
        );
        answers.push(
          `簡答：${N + e}。過程：多項式 \\(x^2${eTerm}\\) 在 \\(x=\\sqrt{${roots[0]}},\\sqrt{${roots[1]}},\\sqrt{${roots[2]}}\\) 的值恰為 ${vals[0]},${vals[1]},${vals[2]}，由二次插值唯一性 \\(f(x)=x^2${eTerm}\\)，所以 \\(f(\\sqrt{${N}})=${N}${eTerm}=${N + e}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        // 判斷 f(x)-x^2 是否有因式 ∏(x-i)
        const r = randInt(1, 6);
        const roots = [r, r + 1, r + 2];
        const vals = roots.map((x) => x * x);
        questions.push(
          `若多項式 \\(f(x)\\) 滿足 \\(f(${roots[0]})=${vals[0]},f(${roots[1]})=${vals[1]},f(${roots[2]})=${vals[2]}\\)，判斷 \\(f(x)-x^2\\) 是否有因式 \\((x-${roots[0]})(x-${roots[1]})(x-${roots[2]})\\)。`
        );
        answers.push(
          `簡答：有。過程：令 \\(g(x)=f(x)-x^2\\)，則 \\(g(${roots[0]})=g(${roots[1]})=g(${roots[2]})=0\\)，所以 \\(x-${roots[0]},x-${roots[1]},x-${roots[2]}\\) 都是因式，故 \\((x-${roots[0]})(x-${roots[1]})(x-${roots[2]})\\) 為因式。`
        );
        continue;
      }

      // 結構化列式：f 次數 ≤ n（n 取偶數），f(k)=1/k（k=1..n+1），求 f(n+2)。
      // P(x)=x f(x)-1 在 1..n+1 為 0，deg ≤ n+1，P(0)=-1 → P(x)=∏(x-k)/(n+1)!。
      // n 為偶數時 P(n+2)=1，故 f(n+2)=2/(n+2)。
      const n = [4, 6, 8, 10][randInt(0, 3)];
      const fVal = makeFraction(2, n + 2);
      questions.push(
        `若多項式 \\(f(x)\\) 次數不超過 ${n}，且 \\(f(1)=1,f(2)=\\tfrac12,\\ldots,f(${n + 1})=\\tfrac1{${n + 1}}\\)，求 \\(f(${n + 2})\\)。`
      );
      answers.push(
        `簡答：\\(${formatFraction(fVal.num, fVal.den)}\\)。過程：令 \\(P(x)=xf(x)-1\\)，則 \\(P(1)=\\cdots=P(${n + 1})=0\\)，且 \\(\\deg P\\le ${n + 1}\\)。由 \\(P(0)=-1\\) 定出 \\(P(x)=\\frac{(x-1)(x-2)\\cdots(x-${n + 1})}{(${n + 1})!}\\)。代入 \\(x=${n + 2}\\) 得 \\(P(${n + 2})=1\\)，故 \\(f(${n + 2})=\\frac{1+1}{${n + 2}}=${formatFraction(fVal.num, fVal.den)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131InterpolationPolynomialFiveSubtypeMixedSet(count) {
    const banks = [
      buildS131InterpolationPolynomialFromPointsSet,
      buildS131InterpolationValueOnlySet,
      buildS131InterpolationStructuralRemainderSet,
      buildS131InterpolationFiniteDifferenceSet,
      buildS131InterpolationLagrangeSpecialSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131AdvancedRemainderFiveSubtypeMixedSet(count) {
    const banks = [
      buildS131ComplexRootRemainderSet,
      buildS131CompositionRemainderSet,
      buildS131SquareDivisorRemainderSet,
      buildS131StepwiseRemainderConstructionSet,
      buildS131CoefficientTransformRemainderSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, 0);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS131RemainderApplicationsFiveSubtypeMixedSet(count) {
    const banks = [
      buildS131RemainderOperationsSet,
      buildS131LowToHighRemainderSet,
      buildS131TransformedDividendRemainderSet,
      buildS131SquareDivisorCalculationSet,
      buildS131SpecialXnRemainderSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, 0);
    }
    return { questions, summaryAnswers, answers };
  }

  function formatShiftBase(h) {
    return h === 0 ? 'x' : h > 0 ? `x-${h}` : `x+${-h}`;
  }

  function formatShiftedMonomial(coefficient, base, power) {
    const coreBase = base === 'x' || /^[A-Za-z]$/.test(base) ? base : `(${base})`;
    const variable = power === 1 ? coreBase : `${coreBase}^${power}`;
    return formatTerm(coefficient, variable);
  }

  function formatSignedShiftedMonomial(coefficient, base, power) {
    if (coefficient === 0) return '';
    const coreBase = base === 'x' || /^[A-Za-z]$/.test(base) ? base : `(${base})`;
    const variable = power === 1 ? coreBase : `${coreBase}^${power}`;
    const absoluteCoefficient = Math.abs(coefficient);
    const term = absoluteCoefficient === 1 ? variable : `${absoluteCoefficient}${variable}`;
    return coefficient > 0 ? `+${term}` : `-${term}`;
  }

  function formatSignedNumber(value) {
    if (value === 0) return '';
    return value > 0 ? `+${value}` : `-${Math.abs(value)}`;
  }

  function buildS131OddEvenValueRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const type = i % 4;
      const t = randInt(2, 6);

      if (type < 2) {
        const a = pickNonZero(-3, 3);
        const b = randInt(-4, 4);
        const c = randInt(-8, 8);
        const evenValue = a * t ** 4 + b * t ** 2 + c;
        const oddValue = randInt(-18, 18);
        const given = evenValue - oddValue;
        const target = evenValue + oddValue;
        const poly = `${formatPolynomialFromCoeffs([a, 0, b, 0, c])}+\\phi(x)`;
        questions.push(
          `設 \\(\\phi(x)\\) 為奇函數，\\(f(x)=${poly}\\)。若 \\(f(-${t})=${given}\\)，求 \\(f(${t})\\)。`
        );
        answers.push(
          `簡答：\\(${target}\\)。過程：偶次多項式部分在 \\(x=${t}\\) 與 \\(x=-${t}\\) 的值相同，為 \\(${evenValue}\\)；奇函數部分兩邊互為相反數。已知 \\(f(-${t})=${evenValue}-\\phi(${t})=${given}\\)，得 \\(\\phi(${t})=${oddValue}\\)，所以 \\(f(${t})=${evenValue}${formatSignedNumber(oddValue)}=${target}\\)。`
        );
        continue;
      }

      const c = randInt(-9, 9);
      const oddValue = pickNonZero(-18, 18);
      const given = c - oddValue;
      const target = c + oddValue;
      const constantText = c === 0 ? '' : formatSignedNumber(c);
      const substitutionText = `2\\cdot${wrapIfNegative(c)}${formatSignedNumber(-given)}`;
      questions.push(
        `設 \\(g(x)\\) 為只含奇次項的多項式，且 \\(f(x)=g(x)${constantText}\\)。若 \\(f(-${t})=${given}\\)，求 \\(f(${t})\\)。`
      );
      answers.push(
        `簡答：\\(${target}\\)。過程：因 \\(g(-x)=-g(x)\\)，所以 \\(f(${t})+f(-${t})=2\\cdot${wrapIfNegative(c)}\\)。故 \\(f(${t})=${substitutionText}=${target}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS131ShiftedBasisCoefficientsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const h = randInt(-3, 4);
      const p = pickNonZero(-3, 3);
      const q = randInt(-5, 5);
      const r = randInt(-6, 6);
      const s = randInt(-8, 8);
      const coeffs = [p, q - 3 * p * h, 3 * p * h * h - 2 * q * h + r, -p * h ** 3 + q * h ** 2 - r * h + s];
      const expanded = formatPolynomialFromCoeffs(coeffs);
      const base = formatShiftBase(h);

      questions.push(
        `已知 \\(f(x)=${expanded}\\)，若 \\(f(x)=a(${base})^3+b(${base})^2+c(${base})+d\\)，求 \\((a,b,c,d)\\)。`
      );
      answers.push(
        `簡答：\\((a,b,c,d)=(${p},${q},${r},${s})\\)。過程：將多項式改用 \\(${base}\\) 作基準，原式可寫成 \\(${formatShiftedMonomial(p, base, 3)}${formatSignedShiftedMonomial(q, base, 2)}${formatSignedShiftedMonomial(r, base, 1)}${formatSignedNumber(s)}\\)，所以係數依序為 \\(${p},${q},${r},${s}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS132GeneralVertexConversionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // f(x)=a(x-h)^2+k  →  一般式係數 [a, -2ah, a h^2 + k]
    const gen = (a, h, k) => [a, -2 * a * h, a * h * h + k];
    const P = (c) => formatPolynomialFromCoeffs(c);
    const vertexForm = (a, h, k) => {
      const inner = h === 0 ? 'x' : `(x${h > 0 ? '-' : '+'}${Math.abs(h)})`;
      const lead = a === 1 ? '' : a === -1 ? '-' : `${a}`;
      const tail = k === 0 ? '' : `${k > 0 ? '+' : '-'}${Math.abs(k)}`;
      return `${lead}${inner}^2${tail}`;
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const a = pickNonZero(-5, 5);
      const h = randInt(-5, 5);
      const k = randInt(-9, 9);
      const co = gen(a, h, k);

      if (variant === 0) {
        questions.push(`求 \\(f(x)=${P(co)}\\) 的頂點坐標及對稱軸。`);
        answers.push(
          `簡答：頂點 \\((${h},${k})\\)，對稱軸 \\(x=${h}\\)。過程：配方得 \\(f(x)=${vertexForm(a, h, k)}\\)，故頂點為 \\((${h},${k})\\)、對稱軸為 \\(x=${h}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(`將 \\(y=${P(co)}\\) 化為頂點式，並判定開口方向。`);
        answers.push(
          `簡答：\\(y=${vertexForm(a, h, k)}\\)，開口向${a > 0 ? '上' : '下'}。過程：提出領導係數 ${a} 後配方，得 \\(y=${vertexForm(a, h, k)}\\)。因 \\(a=${a}${a > 0 ? '>' : '<'}0\\)，開口向${a > 0 ? '上' : '下'}。`
        );
        continue;
      }

      if (variant === 2) {
        const a2 = randInt(1, 9);
        const co2 = gen(a2, h, k);
        questions.push(`求二次函數 \\(y=${P(co2)}\\) 的最低點坐標。`);
        answers.push(
          `簡答：\\((${h},${k})\\)。過程：\\(a=${a2}>0\\) 開口向上，最低點即頂點。配方得 \\(y=${vertexForm(a2, h, k)}\\)，所以最低點為 \\((${h},${k})\\)。`
        );
        continue;
      }

      if (variant === 3) {
        const px = h + pickNonZero(-4, 4);
        const py = a * (px - h) * (px - h) + k;
        questions.push(`已知二次函數頂點為 \\((${h},${k})\\)，且通過 \\((${px},${py})\\)，求其一般式。`);
        answers.push(
          `簡答：\\(y=${P(co)}\\)。過程：設 \\(y=a(x-${h})^2${k >= 0 ? '+' : ''}${k}\\)，代入 \\((${px},${py})\\) 得 \\(a\\cdot${(px - h) * (px - h)}${k >= 0 ? '+' : ''}${k}=${py}\\)，解得 \\(a=${a}\\)。展開即得 \\(y=${P(co)}\\)。`
        );
        continue;
      }

      // variant 4：已知對稱軸與兩點
      const p1 = h + pickNonZero(-4, 4);
      let p2 = h + pickNonZero(-4, 4);
      for (let g = 0; (p2 === p1 || (p1 - h) * (p1 - h) === (p2 - h) * (p2 - h)) && g < 40; g += 1) {
        p2 = h + pickNonZero(-4, 4);
      }
      const q1 = a * (p1 - h) * (p1 - h) + k;
      const q2 = a * (p2 - h) * (p2 - h) + k;
      questions.push(
        `已知二次函數的對稱軸為 \\(x=${h}\\)，且圖形通過 \\((${p1},${q1})\\) 與 \\((${p2},${q2})\\)，求函數式。`
      );
      answers.push(
        `簡答：\\(y=${P(co)}\\)。過程：由對稱軸設 \\(y=a(x-${h})^2+k\\)。代入兩點得 \\(${(p1 - h) * (p1 - h)}a+k=${q1}\\)、\\(${(p2 - h) * (p2 - h)}a+k=${q2}\\)，解得 \\(a=${a},k=${k}\\)，展開得 \\(y=${P(co)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132QuadraticFromConditionsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const gen = (a, h, k) => [a, -2 * a * h, a * h * h + k];
    const P = (c) => formatPolynomialFromCoeffs(c);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const a = pickNonZero(-4, 4);
        const h = randInt(-4, 4);
        const k = randInt(-8, 8);
        const co = gen(a, h, k);
        const xs = [h - randInt(1, 4), h + randInt(1, 3), h + randInt(4, 6)];
        const pts = xs.map((x) => [x, a * (x - h) * (x - h) + k]);
        questions.push(`求通過 \\(A(${pts[0]}),B(${pts[1]}),C(${pts[2]})\\) 三點的二次函數。`);
        answers.push(
          `簡答：\\(y=${P(co)}\\)。過程：設 \\(y=ax^2+bx+c\\)，代入三點解聯立，得 \\(a=${co[0]},b=${co[1]},c=${co[2]}\\)。`
        );
        continue;
      }

      if (variant === 1 || variant === 3) {
        const a = variant === 3 ? -randInt(1, 4) : pickNonZero(-4, 4);
        const h = randInt(-4, 5);
        const k = randInt(-8, 8);
        const co = gen(a, h, k);
        const px = h + pickNonZero(-4, 4);
        const py = a * (px - h) * (px - h) + k;
        questions.push(
          variant === 3
            ? `圖形最高點坐標為 \\((${h},${k})\\)，且通過 \\((${px},${py})\\)，求其方程式。`
            : `以 \\((${h},${k})\\) 為頂點，且通過點 \\((${px},${py})\\)，求 \\(f(x)\\)。`
        );
        answers.push(
          `簡答：\\(f(x)=${P(co)}\\)。過程：設 \\(f(x)=a(x-${h})^2${k >= 0 ? '+' : ''}${k}\\)。代入 \\((${px},${py})\\) 解得 \\(a=${a}\\)${variant === 3 ? `（\\(a<0\\) 與「最高點」相符）` : ''}，展開得 \\(${P(co)}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        const r1 = randInt(-6, -1);
        const r2 = randInt(1, 6);
        const a = pickNonZero(-3, 3);
        const yInt = a * r1 * r2;
        const co = [a, -a * (r1 + r2), a * r1 * r2];
        questions.push(
          `函數圖形與 \\(x\\) 軸交於 \\((${r1},0)\\) 與 \\((${r2},0)\\)，且 \\(y\\) 截距為 ${yInt}，求此二次函數。`
        );
        answers.push(
          `簡答：\\(y=${P(co)}\\)。過程：由兩根設 \\(y=a(x${r1 >= 0 ? '-' : '+'}${Math.abs(r1)})(x${r2 >= 0 ? '-' : '+'}${Math.abs(r2)})\\)。代入 \\(x=0\\) 得 \\(a\\cdot${r1 * r2}=${yInt}\\)，所以 \\(a=${a}\\)，展開得 \\(y=${P(co)}\\)。`
        );
        continue;
      }

      // variant 4：兩點同高 + 頂點 y 坐標
      const x1 = randInt(-4, 2);
      const d4 = 2 * randInt(1, 3);
      const x2 = x1 + d4;
      const h4 = (x1 + x2) / 2;
      const k4 = randInt(-6, 8);
      let a4 = pickNonZero(-4, 4);
      const yCommon = a4 * (x1 - h4) * (x1 - h4) + k4;
      const co4 = gen(a4, h4, k4);
      questions.push(
        `二次函數圖形通過 \\((${x1},${yCommon}),(${x2},${yCommon})\\) 兩點，且頂點的 \\(y\\) 坐標為 ${k4}，求此函數。`
      );
      answers.push(
        `簡答：\\(y=${P(co4)}\\)。過程：兩點等高，故對稱軸為 \\(x=\\frac{${x1}+${x2}}{2}=${h4}\\)。設 \\(y=a(x-${h4})^2${k4 >= 0 ? '+' : ''}${k4}\\)，代入 \\((${x1},${yCommon})\\) 得 \\(a=${a4}\\)，展開得 \\(y=${P(co4)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132ParabolaSymmetryPointSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-4, 4);
      const h = randInt(-4, 5);
      const k = randInt(-6, 6);
      let x = h + pickNonZero(-5, 5);
      if (x === h) x += 1;
      const y = a * (x - h) ** 2 + k;
      const mirrorX = 2 * h - x;
      const base = formatShiftBase(h);
      const vertexForm = `${formatShiftedMonomial(a, base, 2)}${formatSignedNumber(k)}`;

      questions.push(
        `二次函數 \\(\\Gamma:y=${vertexForm}\\) 上有一點 \\(P(${x},${y})\\)。利用圖形對稱性，求另一個與 \\(P\\) 對稱且也在 \\(\\Gamma\\) 上的點坐標。`
      );
      answers.push(
        `簡答：\\((${mirrorX},${y})\\)。過程：\\(\\Gamma\\) 的對稱軸為 \\(x=${h}\\)，所以對稱點的 \\(x\\) 坐標為 \\(2\\cdot(${h})-(${x})=${mirrorX}\\)，\\(y\\) 坐標不變。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS132QuadraticAxisTwoPointsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const h = randInt(-3, 4);
      const a = pickNonZero(-3, 3);
      const k = randInt(-6, 6);
      let x1 = h + pickNonZero(-4, 4);
      let x2 = h + pickNonZero(-4, 4);
      while (x2 === x1 || Math.abs(x2 - h) === Math.abs(x1 - h)) x2 = h + pickNonZero(-4, 4);
      const y1 = a * (x1 - h) ** 2 + k;
      const y2 = a * (x2 - h) ** 2 + k;
      const general = formatPolynomialFromCoeffs([a, -2 * a * h, a * h * h + k]);
      const base = formatShiftBase(h);
      const vertex = `${formatShiftedMonomial(a, base, 2)}${formatSignedNumber(k)}`;

      questions.push(
        `已知二次函數 \\(f(x)\\) 的對稱軸為 \\(x=${h}\\)，且圖形通過 \\((${x1},${y1})\\)、\\((${x2},${y2})\\) 兩點，求 \\(f(x)\\)。`
      );
      answers.push(
        `簡答：\\(f(x)=${vertex}\\)，一般式為 \\(${general}\\)。過程：設 \\(f(x)=A(${base})^2+B\\)。代入兩點得 \\(A=${a}\\)、\\(B=${k}\\)，因此 \\(f(x)=${vertex}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS132CubicCenterStandardFormSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-3, 3);
      const h = randInt(-3, 4);
      const p = pickNonZero(-6, 6);
      const q = randInt(-8, 8);
      const coeffs = [a, -3 * a * h, 3 * a * h * h + p, -a * h ** 3 - p * h + q];
      const expanded = formatPolynomialFromCoeffs(coeffs);
      const base = formatShiftBase(h);
      const shifted = `${formatShiftedMonomial(a, base, 3)}${formatSignedShiftedMonomial(p, base, 1)}${formatSignedNumber(q)}`;

      questions.push(
        `已知三次函數 \\(f(x)=${expanded}\\)。將它改寫成 \\(A(${base})^3+B(${base})+C\\)，並求圖形的對稱中心。`
      );
      answers.push(
        `簡答：\\(f(x)=${shifted}\\)，對稱中心為 \\((${h},${q})\\)。過程：三次函數若寫成 \\(A(x-h)^3+B(x-h)+C\\)，中心即為 \\((h,C)\\)。本題 \\(h=${h},C=${q}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS132CubicCenterFormEvaluationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;
      const a = pickNonZero(-3, 3);
      const h = randInt(-3, 4);
      const p = pickNonZero(-6, 6);
      const q = randInt(-8, 8);
      const coeffs = [a, -3 * a * h, 3 * a * h * h + p, -a * h ** 3 - p * h + q];
      const expanded = formatPolynomialFromCoeffs(coeffs);
      const base = formatShiftBase(h);
      const shifted = `${formatShiftedMonomial(a, base, 3)}${formatSignedShiftedMonomial(p, base, 1)}${formatSignedNumber(q)}`;

      if (type === 0) {
        const t = randInt(1, 4);
        const targetX = h + t;
        const value = a * t ** 3 + p * t + q;
        questions.push(`已知 \\(f(x)=${expanded}\\)，利用中心式求 \\(f(${targetX})\\)。`);
        answers.push(
          `簡答：${value}。過程：先改寫為 \\(f(x)=${shifted}\\)。當 \\(x=${targetX}\\) 時，\\(${base}=${t}\\)，所以 \\(f(${targetX})=${formatShiftedMonomial(a, `${t}`, 3)}${formatSignedShiftedMonomial(p, `${t}`, 1)}${formatSignedNumber(q)}=${value}\\)。`
        );
        continue;
      }

      if (type === 1) {
        const t = -randInt(1, 4);
        const targetX = h + t;
        const value = a * t ** 3 + p * t + q;
        questions.push(`已知 \\(f(x)=${expanded}\\)，將它改成 \\(${base}\\) 附近的形式後，求 \\(f(${targetX})\\)。`);
        answers.push(
          `簡答：${value}。過程：\\(f(x)=${shifted}\\)。代入 \\(x=${targetX}\\)，有 \\(${base}=${t}\\)，所以函數值為 \\(${formatShiftedMonomial(a, `${t}`, 3)}${formatSignedShiftedMonomial(p, `${t}`, 1)}${formatSignedNumber(q)}=${value}\\)。`
        );
        continue;
      }

      if (type === 2) {
        const t = 0.01;
        const targetX = Number((h + t).toFixed(2));
        const value = a * t ** 3 + p * t + q;
        questions.push(
          `已知 \\(f(x)=${expanded}\\)。將 \\(f(x)\\) 改寫成中心式後，估計 \\(f(${targetX.toFixed(2)})\\) 到小數點後四位。`
        );
        answers.push(
          `簡答：約 ${trimFixed(value, 4)}。過程：\\(f(x)=${shifted}\\)。當 \\(x=${targetX.toFixed(2)}\\) 時，\\(${base}=0.01\\)，所以 \\(f(x)=${formatShiftedMonomial(a, '0.01', 3)}${formatSignedShiftedMonomial(p, '0.01', 1)}${formatSignedNumber(q)}\\approx${trimFixed(value, 4)}\\)。`
        );
        continue;
      }

      if (type === 3) {
        const t = randInt(1, 3);
        const y1 = a * t ** 3 + p * t + q;
        const y2 = a * (-t) ** 3 + p * -t + q;
        const pairSumText = `${y1}${formatSignedNumber(y2)}`;
        questions.push(`三次函數 \\(f(x)=${expanded}\\) 的中心為何？並求 \\(f(${h + t})+f(${h - t})\\)。`);
        answers.push(
          `簡答：中心 \\((${h},${q})\\)，和為 ${2 * q}。過程：中心式為 \\(f(x)=${shifted}\\)，所以中心是 \\((${h},${q})\\)。對稱點的函數值和等於兩倍中心的 \\(y\\) 坐標，故 \\(f(${h + t})+f(${h - t})=${pairSumText}=2\\cdot${q}=${2 * q}\\)。`
        );
        continue;
      }

      const t = randInt(1, 4);
      const value = a * t ** 3 + p * t + q;
      questions.push(
        `已知 \\(f(x)=${shifted}\\)。若 \\(f(${h + t})=${value}\\)，請檢查由一般式 \\(${expanded}\\) 代入是否一致。`
      );
      answers.push(
        `簡答：一致，函數值為 ${value}。過程：中心式中 \\(${base}=${t}\\)，所以 \\(f(${h + t})=${formatShiftedMonomial(a, `${t}`, 3)}${formatSignedShiftedMonomial(p, `${t}`, 1)}${formatSignedNumber(q)}=${value}\\)。中心式與一般式是同一個多項式，代入一般式也必得相同結果。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS132RestrictedRangeExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const gen = (a, h, k) => [a, -2 * a * h, a * h * h + k];
    const P = (c) => formatPolynomialFromCoeffs(c);
    const fval = (a, h, k, x) => a * (x - h) * (x - h) + k;
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 3) {
        // 已知最小值位置與值 + 通過一點 → 求函數
        const h = randInt(-4, 4);
        const k = randInt(-6, 6);
        const a = randInt(1, 5);
        const px = h + pickNonZero(-4, 4);
        const py = fval(a, h, k, px);
        questions.push(`已知二次函數在 \\(x=${h}\\) 時有最小值 ${k}，且通過 \\((${px},${py})\\)，求該函數。`);
        answers.push(
          `簡答：\\(y=${P(gen(a, h, k))}\\)。過程：有最小值表示開口向上，設 \\(y=a(x-${h})^2${k >= 0 ? '+' : ''}${k}\\)（\\(a>0\\)）。代入 \\((${px},${py})\\) 得 \\(a=${a}\\)，展開得 \\(y=${P(gen(a, h, k))}\\)。`
        );
        continue;
      }

      // 其餘：在閉區間 [m,n] 上求極值
      const a = variant === 2 ? -randInt(1, 4) : pickNonZero(-4, 4);
      const h = randInt(-4, 4);
      const k = randInt(-8, 8);
      const m = h - randInt(0, 5);
      const n = h + randInt(0, 5);
      if (m === n) {
        i -= 1;
        continue;
      }
      const cand = [m, n];
      if (h >= m && h <= n) cand.push(h);
      const vals = cand.map((x) => fval(a, h, k, x));
      const maxV = Math.max(...vals);
      const minV = Math.min(...vals);
      const argMax = cand[vals.indexOf(maxV)];
      const argMin = cand[vals.indexOf(minV)];
      const co = gen(a, h, k);
      const inRange = h >= m && h <= n;
      questions.push(`設 \\(f(x)=${P(co)}\\)，在 \\(${m}\\le x\\le${n}\\) 範圍內求最大值與最小值。`);
      answers.push(
        `簡答：最大值 ${maxV}（在 \\(x=${argMax}\\)），最小值 ${minV}（在 \\(x=${argMin}\\)）。過程：配方得 \\(f(x)=${a === 1 ? '' : a === -1 ? '-' : a}(x${h > 0 ? '-' : '+'}${Math.abs(h)})^2${k >= 0 ? '+' : ''}${k}\\)，對稱軸 \\(x=${h}\\)${inRange ? '落在區間內' : '不在區間內'}。${inRange ? `因此需比較端點與頂點：\\(f(${m})=${fval(a, h, k, m)}\\)、\\(f(${n})=${fval(a, h, k, n)}\\)、\\(f(${h})=${k}\\)。` : `因此 \\(f\\) 在區間上單調，只需比較端點：\\(f(${m})=${fval(a, h, k, m)}\\)、\\(f(${n})=${fval(a, h, k, n)}\\)。`}故最大值 ${maxV}、最小值 ${minV}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132QuadraticDiscriminantSignSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 1) {
        // k x^2 + 2m x + k > 0（或 <0）恆成立 → |k|>|m|
        const m = randInt(1, 6);
        const useK = variant === 0;
        const sym = useK ? 'a' : 'k';
        if (useK) {
          questions.push(`若 \\(f(x)=ax^2+${2 * m}x+a\\) 的值恆為正，求實數 \\(a\\) 的範圍。`);
          answers.push(
            `簡答：\\(a>${m}\\)。過程：恆為正需開口向上 \\(a>0\\) 且判別式 \\(D=(${2 * m})^2-4a^2<0\\)，得 \\(a^2>${m * m}\\)，即 \\(|a|>${m}\\)。與 \\(a>0\\) 取交集得 \\(a>${m}\\)。`
          );
        } else {
          questions.push(`對所有實數 \\(x\\)，不等式 \\(kx^2+${2 * m}x+k<0\\) 恆成立，求 \\(k\\) 的範圍。`);
          answers.push(
            `簡答：\\(k<-${m}\\)。過程：恆為負需開口向下 \\(k<0\\) 且判別式 \\(D=(${2 * m})^2-4k^2<0\\)，得 \\(|k|>${m}\\)。與 \\(k<0\\) 取交集得 \\(k<-${m}\\)。`
          );
        }
        continue;
      }

      if (variant === 2) {
        // x^2+ax+(a+c) < 0 無解 → 判別式 ≤ 0，取 c=t^2-1 使根為整數
        const t = randInt(1, 5);
        const c = t * t - 1;
        const lo = 2 - 2 * t;
        const hi = 2 + 2 * t;
        questions.push(`已知 \\(x^2+ax+(a+${c})\\le0\\) 無實數解，求 \\(a\\) 的範圍。`);
        answers.push(
          `簡答：\\(${lo}<a<${hi}\\)。過程：開口向上，無解（\\(\\le0\\) 不成立）表示圖形恆在 \\(x\\) 軸上方，即判別式 \\(<0\\)：\\(a^2-4(a+${c})<0\\)，化簡 \\(a^2-4a-${4 * c}<0\\)，解 \\(a^2-4a-${4 * c}=0\\) 得 \\(a=2\\pm${2 * t}\\)，故 \\(${lo}<a<${hi}\\)。`
        );
        continue;
      }

      // variant 3、4：(2a-b)x^2+2ax+(a+c)≥0 解為全體實數 型 → 兩條件
      const a = randInt(2, 5);
      const b = randInt(1, a);
      const cc = randInt(1, 4);
      // 造 (a·x + p)^2 型使恆非負：直接用 (mx+n)^2 ≥ 0
      const mm = randInt(1, 4);
      const nn = randInt(1, 5);
      questions.push(`二次不等式 \\(${mm * mm}x^2+${2 * mm * nn}x+${nn * nn}\\ge0\\) 的解為何？並說明理由。`);
      answers.push(
        `簡答：所有實數 \\(x\\)。過程：左式為完全平方 \\((${mm}x+${nn})^2\\ge0\\)，對所有實數恆成立（等號在 \\(x=${formatFraction(-nn, mm)}\\) 時）。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132LeastSquaresMinimumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const fr = (n, d) => {
      const f = makeFraction(n, d);
      return formatFraction(f.num, f.den);
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // Σ k(x-k)^2, k=1..N → min 在 Σk^2/Σk = (2N+1)/3
        const N = [5, 6, 8, 9, 11][randInt(0, 4)];
        const num = (N * (N + 1) * (2 * N + 1)) / 6;
        const den = (N * (N + 1)) / 2;
        questions.push(`設 \\(g(x)=(x-1)^2+2(x-2)^2+\\cdots+${N}(x-${N})^2\\)，求 \\(g(x)\\) 有最小值時的 \\(x\\)。`);
        answers.push(
          `簡答：\\(x=${fr(num, den)}\\)。過程：加權平方和 \\(\\sum w_i(x-t_i)^2\\) 的最小值在加權平均 \\(x=\\frac{\\sum w_it_i}{\\sum w_i}\\)。此題 \\(w_i=t_i=i\\)，故 \\(x=\\frac{1^2+\\cdots+${N}^2}{1+\\cdots+${N}}=\\frac{${num}}{${den}}=${fr(num, den)}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 三項加權
        const w = [randInt(1, 4), randInt(1, 4), randInt(1, 4)];
        const t = [randInt(-2, 3), randInt(1, 5), randInt(3, 8)];
        const num = w[0] * t[0] + w[1] * t[1] + w[2] * t[2];
        const den = w[0] + w[1] + w[2];
        const parts = t
          .map((ti, idx) => `${w[idx] === 1 ? '' : w[idx]}(x${ti > 0 ? '-' : '+'}${Math.abs(ti)})^2`)
          .join('+');
        questions.push(`已知 \\(f(x)=${parts}\\)，求使 \\(f(x)\\) 最小的 \\(x\\)。`);
        answers.push(
          `簡答：\\(x=${fr(num, den)}\\)。過程：最小值在加權平均 \\(x=\\frac{${w[0]}\\times${t[0]}+${w[1]}\\times${t[1]}+${w[2]}\\times${t[2]}}{${w[0]}+${w[1]}+${w[2]}}=${fr(num, den)}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // 兩點平均
        const a = randInt(-4, 3);
        const b = a + 2 * randInt(1, 4);
        questions.push(
          `求 \\((x${a > 0 ? '-' : '+'}${Math.abs(a)})^2+(x${b > 0 ? '-' : '+'}${Math.abs(b)})^2\\) 有最小值時的 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${(a + b) / 2}\\)。過程：兩個平方距離和的最小值在兩點的中點，\\(x=\\frac{${a}+${b}}2=${(a + b) / 2}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        const w1 = randInt(2, 5);
        const w2 = randInt(2, 5);
        const p1 = pickNonZero(-4, 4);
        const p2 = pickNonZero(-4, 4);
        const num = w1 * p1 + w2 * p2;
        const den = w1 + w2;
        questions.push(
          `求 \\(${w1}(x${p1 > 0 ? '-' : '+'}${Math.abs(p1)})^2+${w2}(x${p2 > 0 ? '-' : '+'}${Math.abs(p2)})^2\\) 有最小值時的 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${fr(num, den)}\\)。過程：把兩項視為加權距離平方，最小值在加權平均 \\(x=\\frac{${w1}\\times${p1}+${w2}\\times${p2}}{${w1}+${w2}}=${fr(num, den)}\\)。`
        );
        continue;
      }

      // variant 4：符號參數
      const A = randInt(2, 5);
      const Bb = randInt(1, 4);
      questions.push(`若 \\(h(x)=${A}(x-a)^2+${Bb}(x-b)^2\\)，求 \\(h(x)\\) 最小時的 \\(x\\)（以 \\(a,b\\) 表示）。`);
      answers.push(
        `簡答：\\(x=\\frac{${A}a+${Bb}b}{${A + Bb}}\\)。過程：加權平方和的最小值在加權平均，\\(x=\\frac{${A}a+${Bb}b}{${A}+${Bb}}=\\frac{${A}a+${Bb}b}{${A + Bb}}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132QuadraticModelApplicationsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        // 票價 P0，人數 N0，每降 s 元增加 g 人 → 收入頂點
        const s = randInt(2, 6);
        const g = randInt(20, 60);
        const P0 = s * randInt(15, 30);
        const N0 = g * randInt(6, 12);
        // R(x)=(P0-s x)(N0+g x)，頂點 x*=(g P0 - s N0)/(2 s g)
        const xStar = (g * P0 - s * N0) / (2 * s * g);
        if (!Number.isInteger(xStar) || xStar <= 0) {
          i -= 1;
          continue;
        }
        const price = P0 - s * xStar;
        questions.push(`電影院票價 ${P0} 元時平均 ${N0} 人，票價每減 ${s} 元增加 ${g} 人，求最高收入的訂價。`);
        answers.push(
          `簡答：${price} 元。過程：設降價 \\(x\\) 次（每次 ${s} 元），收入 \\(R=(${P0}-${s}x)(${N0}+${g}x)\\)，展開為開口向下的二次式，頂點在 \\(x=${xStar}\\)。此時票價為 \\(${P0}-${s}\\times${xStar}=${price}\\) 元。`
        );
        continue;
      }

      if (variant === 1) {
        // 靠河矩形，圍籬長 Ltot，靠河一邊不圍 → 面積 x(Ltot-2x)，頂點 x=Ltot/4
        const Ltot = 4 * randInt(15, 40);
        const x = Ltot / 4;
        const area = x * (Ltot - 2 * x);
        questions.push(`一條 ${Ltot} 公尺的繩子在河岸邊圍成一個矩形菜園，靠河的一邊不用圍籬，求最大面積。`);
        answers.push(
          `簡答：${area} 平方公尺。過程：設垂直河岸的邊長為 \\(x\\)，平行河岸的邊為 \\(${Ltot}-2x\\)。面積 \\(A=x(${Ltot}-2x)=-2x^2+${Ltot}x\\)，頂點在 \\(x=${x}\\)，最大面積 \\(${x}\\times${Ltot - 2 * x}=${area}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // 進價 c，定價 p0 賣 n0，每降 1 元多賣 m → 利潤頂點
        const c = randInt(5, 15);
        const p0 = c + 2 * randInt(4, 10);
        const n0 = 25 * randInt(3, 6);
        const mSell = 25;
        // profit(x)=(p0-x-c)(n0+mSell x)，頂點 x*=(mSell(p0-c)-n0)/(2 mSell)
        const xStar = (mSell * (p0 - c) - n0) / (2 * mSell);
        if (!Number.isInteger(xStar)) {
          i -= 1;
          continue;
        }
        const price = p0 - xStar;
        const profit = (price - c) * (n0 + mSell * xStar);
        questions.push(
          `某商品進價 ${c} 元，定價 ${p0} 元時可賣 ${n0} 個；售價每降 1 元多賣 ${mSell} 個，求最大利潤時的售價。`
        );
        answers.push(
          `簡答：${price} 元（最大利潤 ${profit} 元）。過程：設降價 \\(x\\) 元，利潤 \\(P=(${p0}-x-${c})(${n0}+${mSell}x)\\)，開口向下，頂點在 \\(x=${xStar}\\)，此時售價 \\(${p0}-${xStar}=${price}\\) 元。`
        );
        continue;
      }

      // variant 4：牆邊圍 n 間相等矩形雞圈
      const n = randInt(2, 4);
      const Ltot = (n + 1) * randInt(6, 14) * 2;
      // (n+1)x + y = Ltot，面積 x·y=x(Ltot-(n+1)x)，頂點 x=Ltot/(2(n+1))
      const x = Ltot / (2 * (n + 1));
      const y = Ltot - (n + 1) * x;
      const area = x * y;
      questions.push(`在牆邊用圍籬圍出 ${n} 間相等的矩形雞圈，牆邊不用圍，圍籬長 ${Ltot} 公尺，求總面積最大值。`);
      answers.push(
        `簡答：${area} 平方公尺。過程：設每間深度 \\(x\\)、總寬 \\(y\\)，圍籬 \\(${n + 1}x+y=${Ltot}\\)。總面積 \\(A=xy=x(${Ltot}-${n + 1}x)\\)，頂點在 \\(x=${x}\\)，此時 \\(y=${y}\\)，最大面積 \\(${area}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132QuadraticFormGraphThreeSubtypeMixedSet(count) {
    const banks = [
      buildS132GeneralVertexConversionSet,
      buildS132QuadraticFromConditionsSet,
      buildS132RestrictedRangeExtremaSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132QuadraticInequalityExtremaApplicationThreeSubtypeMixedSet(count) {
    const banks = [
      buildS132QuadraticDiscriminantSignSet,
      buildS132LeastSquaresMinimumSet,
      buildS132QuadraticModelApplicationsSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132QuadraticTransformationsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const gen = (a, h, k) => [a, -2 * a * h, a * h * h + k];
    const P = (c) => formatPolynomialFromCoeffs(c);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const a = pickNonZero(-4, 4);
      const h = randInt(-4, 4);
      const k = randInt(-8, 8);

      if (variant === 0) {
        // 向左平移 L、向上平移 kk：頂點 (h-L, k+kk)
        const L = randInt(1, 5);
        const up = randInt(1, 8);
        const co0 = gen(a, h, k);
        const co1 = gen(a, h - L, k + up);
        questions.push(
          `將 \\(y=${P(co0)}\\) 的圖形向左平移 ${L} 單位，再向上平移 \\(t\\) 單位，所得新圖形為 \\(y=${P(co1)}\\)，求 \\(t\\)。`
        );
        answers.push(
          `簡答：\\(t=${up}\\)。過程：原頂點為 \\((${h},${k})\\)，向左 ${L}、向上 \\(t\\) 後頂點為 \\((${h - L},${k}+t)\\)。新圖形頂點為 \\((${h - L},${k + up})\\)，比較得 \\(t=${up}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        const H = pickNonZero(-4, 4);
        const K = pickNonZero(-6, 6);
        const co0 = gen(a, h, k);
        const co1 = gen(a, h + H, k + K);
        questions.push(
          `已知二次函數 \\(y=${P(co0)}\\)，沿 \\(x\\) 軸平移 \\(p\\)、沿 \\(y\\) 軸平移 \\(q\\) 後與 \\(y=${P(co1)}\\) 重合，求數對 \\((p,q)\\)。`
        );
        answers.push(
          `簡答：\\((p,q)=(${H},${K})\\)。過程：兩者領導係數相同，只需比較頂點。原頂點 \\((${h},${k})\\)，目標頂點 \\((${h + H},${k + K})\\)，所以 \\(p=${H}\\)、\\(q=${K}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        const co0 = gen(a, h, k);
        const co1 = gen(-a, h, -k);
        questions.push(`求 \\(y=${P(co0)}\\) 的圖形對於 \\(x\\) 軸的對稱圖形方程式。`);
        answers.push(
          `簡答：\\(y=${P(co1)}\\)。過程：對 \\(x\\) 軸對稱即把 \\(y\\) 換成 \\(-y\\)，等價於整體變號，得 \\(y=${P(co1)}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        // f(c+t)=f(c-t) → 對稱軸 x=c，比較三點大小
        const c3 = randInt(-3, 4);
        const a3 = pickNonZero(-3, 3);
        const xs = [c3 - 1, c3, c3 + 2];
        const vs = xs.map((x) => a3 * (x - c3) * (x - c3));
        const order = xs
          .map((x, idx) => ({ x, v: vs[idx] }))
          .sort((p, q) => p.v - q.v)
          .map((p) => `f(${p.x})`)
          .join('<');
        questions.push(
          `若 \\(f(x)=${a3}x^2+bx+c\\) 滿足 \\(f(${c3}+t)=f(${c3}-t)\\) 對所有 \\(t\\) 成立，試比較 \\(f(${xs[0]}),f(${xs[1]}),f(${xs[2]})\\) 的大小關係。`
        );
        answers.push(
          `簡答：\\(${order}\\)。過程：條件表示對稱軸為 \\(x=${c3}\\)。因 \\(a=${a3}${a3 > 0 ? '>' : '<'}0\\)，離對稱軸越遠函數值越${a3 > 0 ? '大' : '小'}。三點到對稱軸的距離分別為 \\(${xs.map((x) => Math.abs(x - c3)).join(',')}\\)，據此排序即得。`
        );
        continue;
      }

      // variant 4：對稱軸改變且開口反轉
      const newH = randInt(-5, 5);
      questions.push(
        `二次函數 \\(y=${a === 1 ? '' : a === -1 ? '-' : a}(x${h > 0 ? '-' : '+'}${Math.abs(h)})^2${k >= 0 ? '+' : ''}${k}\\) 的圖形，若將其對稱軸由 \\(x=${h}\\) 改為 \\(x=${newH}\\)，且開口方向反轉（頂點 \\(y\\) 坐標不變），求新方程式。`
      );
      answers.push(
        `簡答：\\(y=${P(gen(-a, newH, k))}\\)。過程：對稱軸改為 \\(x=${newH}\\) 表示頂點橫坐標變為 ${newH}；開口反轉表示領導係數由 ${a} 變為 ${-a}。故新函數為 \\(y=${-a === 1 ? '' : -a === -1 ? '-' : -a}(x${newH > 0 ? '-' : '+'}${Math.abs(newH)})^2${k >= 0 ? '+' : ''}${k}\\)，展開得 \\(${P(gen(-a, newH, k))}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132QuadraticRelativePositionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const fr = (n, d) => {
      const f = makeFraction(n, d);
      return formatFraction(f.num, f.den);
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 2 || variant === 4) {
        // y=ax^2+bx+k 恆在 y=mx+n 上方 → ax^2+(b-m)x+(k-n)>0 → k > n + (b-m)^2/(4a)
        const a = randInt(1, 3);
        const b = pickNonZero(-4, 5);
        const m = pickNonZero(-4, 5);
        const n = randInt(-5, 5);
        const diff = b - m;
        const thrNum = n * 4 * a + diff * diff;
        const thrDen = 4 * a;
        questions.push(
          `設 \\(y=${a === 1 ? '' : a}x^2${b >= 0 ? '+' : '-'}${Math.abs(b)}x+k\\) 的圖形恆在直線 \\(y=${m === 1 ? '' : m === -1 ? '-' : m}x${n >= 0 ? '+' : '-'}${Math.abs(n)}\\) 的上方，求實數 \\(k\\) 的範圍。`
        );
        answers.push(
          `簡答：\\(k>${fr(thrNum, thrDen)}\\)。過程：恆在上方表示 \\(${a === 1 ? '' : a}x^2${b >= 0 ? '+' : '-'}${Math.abs(b)}x+k>${m === 1 ? '' : m === -1 ? '-' : m}x${n >= 0 ? '+' : '-'}${Math.abs(n)}\\) 對所有 \\(x\\) 成立，即 \\(${a === 1 ? '' : a}x^2${diff >= 0 ? '+' : '-'}${Math.abs(diff)}x+(k${-n >= 0 ? '+' : '-'}${Math.abs(n)})>0\\) 恆成立。開口向上，需判別式小於 0：\\((${diff})^2-4\\times${a}(k${-n >= 0 ? '+' : '-'}${Math.abs(n)})<0\\)，解得 \\(k>${fr(thrNum, thrDen)}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // y=x^2-2kx+3k 恆在 y=c 上方 → x^2-2kx+(3k-c)>0 → 判別式 4k^2-4(3k-c)<0 → k^2-3k+c<0
        const c = randInt(1, 3);
        // 取 c 使 k^2-3k+c<0 有解區間（判別式 9-4c>0）
        const disc = 9 - 4 * c;
        const sq = Number.isInteger(Math.sqrt(disc));
        const loNum = 3;
        questions.push(`設 \\(y=x^2-2kx+${3}k\\) 的圖形恆在直線 \\(y=${c}\\) 的上方，求滿足此條件的所有實數 \\(k\\)。`);
        answers.push(
          `簡答：\\(\\frac{3-\\sqrt{${disc}}}{2}<k<\\frac{3+\\sqrt{${disc}}}{2}\\)。過程：恆在上方即 \\(x^2-2kx+3k-${c}>0\\) 對所有 \\(x\\) 成立。開口向上，需判別式小於 0：\\((2k)^2-4(3k-${c})<0\\)，化簡 \\(k^2-3k+${c}<0\\)，解得 \\(\\frac{3-\\sqrt{${disc}}}{2}<k<\\frac{3+\\sqrt{${disc}}}{2}\\)。`
        );
        continue;
      }

      // variant 3：y=-x^2+bx+k 恆在 y=mx+n 下方 → k < n - (b-m)^2/4
      const b3 = pickNonZero(-4, 5);
      const m3 = pickNonZero(-4, 5);
      const n3 = randInt(-5, 5);
      const diff3 = b3 - m3;
      const thrNum3 = n3 * 4 - diff3 * diff3;
      questions.push(
        `設 \\(y=-x^2${b3 >= 0 ? '+' : '-'}${Math.abs(b3)}x+k\\) 的圖形恆在直線 \\(y=${m3 === 1 ? '' : m3 === -1 ? '-' : m3}x${n3 >= 0 ? '+' : '-'}${Math.abs(n3)}\\) 的下方，求實數 \\(k\\) 的範圍。`
      );
      answers.push(
        `簡答：\\(k<${fr(thrNum3, 4)}\\)。過程：恆在下方表示 \\(-x^2${b3 >= 0 ? '+' : '-'}${Math.abs(b3)}x+k<${m3 === 1 ? '' : m3 === -1 ? '-' : m3}x${n3 >= 0 ? '+' : '-'}${Math.abs(n3)}\\) 對所有 \\(x\\) 成立，即 \\(-x^2${diff3 >= 0 ? '+' : '-'}${Math.abs(diff3)}x+(k${-n3 >= 0 ? '+' : '-'}${Math.abs(n3)})<0\\) 恆成立。開口向下，需判別式小於 0：\\((${diff3})^2+4(k${-n3 >= 0 ? '+' : '-'}${Math.abs(n3)})<0\\)，解得 \\(k<${fr(thrNum3, 4)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132ParabolaGeometricAreasSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const gen = (a, h, k) => [a, -2 * a * h, a * h * h + k];
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        // 頂點 (h,k)，a=1，交 x 軸於 h±√(-k)，交 y 軸於 (0,c)
        // 取 k=-r^2 使根為整數；面積 = 1/2 · PQ · |c|，PQ=2r
        const r = randInt(1, 5);
        const h = randInt(-3, 4);
        const a = 1;
        const k = -r * r;
        const co = gen(a, h, k);
        const c = co[2];
        const area = r * Math.abs(c);
        questions.push(
          `二次函數 \\(y=${formatPolynomialFromCoeffs(co)}\\) 的圖形與 \\(x\\) 軸交於 \\(P,Q\\)，與 \\(y\\) 軸交於 \\(R\\)，求 \\(\\triangle PQR\\) 的面積。`
        );
        answers.push(
          `簡答：${area}。過程：頂點為 \\((${h},${k})\\)，令 \\(y=0\\) 得 \\(x=${h}\\pm${r}\\)，故 \\(PQ=${2 * r}\\)。\\(y\\) 截距 \\(R=(0,${c})\\)，三角形以 \\(PQ\\) 為底（在 \\(x\\) 軸上）、高為 \\(|${c}|=${Math.abs(c)}\\)。面積 \\(=\\frac12\\times${2 * r}\\times${Math.abs(c)}=${area}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        const d = randInt(4, 12);
        const t = randInt(1, Math.floor((d * d - 1) / 4));
        const nd = d * d - 4 * t;
        questions.push(
          `已知拋物線 \\(y=x^2+ax+b\\) 與 \\(x\\) 軸交點距離為 ${d}，若改為 \\(y=x^2+ax+(b+${t})\\)，求其與 \\(x\\) 軸的新交點距離。`
        );
        answers.push(
          `簡答：\\(${formatRadical(nd)}\\)。過程：交點距離為 \\(\\sqrt{\\text{判別式}}\\)（首項係數 1）。原判別式為 \\(${d * d}\\)，常數加 ${t} 使判別式減 \\(4\\times${t}=${4 * t}\\)，得 \\(${nd}\\)，故新距離 \\(${formatRadical(nd)}\\)。`
        );
        continue;
      }

      // variant 2、4：頂點與弦長反求
      const r = randInt(1, 5);
      const h = randInt(-3, 4);
      const k = -r * r;
      const co = gen(1, h, k);
      questions.push(
        `求頂點為 \\((${h},${k})\\)，且與 \\(x\\) 軸兩交點之距離為 ${2 * r} 的二次函數方程式（領導係數為 1）。`
      );
      answers.push(
        `簡答：\\(y=${formatPolynomialFromCoeffs(co)}\\)。過程：設 \\(y=(x${h > 0 ? '-' : '+'}${Math.abs(h)})^2${k}\\)，令 \\(y=0\\) 得 \\(x=${h}\\pm${r}\\)，兩交點距離 \\(2\\times${r}=${2 * r}\\) 符合。展開得 \\(y=${formatPolynomialFromCoeffs(co)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132AbsoluteValueQuadraticSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        // |x^2 - 2h x| - C 的 x 軸交點：|x^2-2hx|=C → x^2-2hx∓C=0
        // 取 x^2-2hx=(x-h)^2-h^2，令 C>0；x^2-2hx=C → (x-h)^2=h^2+C（兩解）；=-C →(x-h)^2=h^2-C
        const h = randInt(2, 5);
        const C = randInt(1, h * h - 1);
        const s1 = h * h + C;
        const s2 = h * h - C;
        const s2Text = s2 > 0 ? `，\\(x=${h}\\pm${formatRadical(s2)}\\)` : s2 === 0 ? `，\\(x=${h}\\)` : '';
        const s2Proc =
          s2 > 0 ? `，\\(x=${h}\\pm${formatRadical(s2)}\\)` : s2 === 0 ? `，得 \\(x=${h}\\)（重根）` : '（無實數解）';
        questions.push(`試求函數 \\(y=|x^2-${2 * h}x|-${C}\\) 與 \\(x\\) 軸的交點（\\(x\\) 坐標）。`);
        answers.push(
          `簡答：\\(x=${h}\\pm${formatRadical(s1)}\\)${s2Text}。過程：令 \\(y=0\\)，\\(|x^2-${2 * h}x|=${C}\\)。由 \\(x^2-${2 * h}x=${C}\\) 得 \\((x-${h})^2=${s1}\\)，\\(x=${h}\\pm${formatRadical(s1)}\\)；由 \\(x^2-${2 * h}x=-${C}\\) 得 \\((x-${h})^2=${s2}\\)${s2Proc}。`
        );
        continue;
      }

      if (variant === 1) {
        // |x^2-a^2|=k 恰有 4 個相異實根 → 0<k<a^2
        const a = randInt(2, 5);
        questions.push(`若方程式 \\(|x^2-${a * a}|=k\\) 恰有 4 個相異實根，求實數 \\(k\\) 的範圍。`);
        answers.push(
          `簡答：\\(0<k<${a * a}\\)。過程：考慮 \\(y=|x^2-${a * a}|\\) 的圖形（W 形），與水平線 \\(y=k\\) 的交點數：\\(k<0\\) 無交點；\\(k=0\\) 有 2 個（\\(x=\\pm${a}\\)）；\\(0<k<${a * a}\\) 有 4 個；\\(k=${a * a}\\) 有 3 個；\\(k>${a * a}\\) 有 2 個。故 4 根需 \\(0<k<${a * a}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // |(x-r1)(x-r2)|=k 恰有 3 個相異實根 → k = 頂點值 |min|
        const r1 = randInt(-4, 1);
        const dd = 2 * randInt(1, 3);
        const r2 = r1 + dd;
        const m = (dd / 2) * (dd / 2); // |最小值|
        questions.push(`若方程式 \\(|x^2-${r1 + r2}x+${r1 * r2}|=k\\) 恰有 3 個相異實根，求 \\(k\\)。`);
        answers.push(
          `簡答：\\(k=${m}\\)。過程：\\(f(x)=x^2-${r1 + r2}x+${r1 * r2}=(x-${r1})(x-${r2})\\)，最小值為 \\(-${m}\\)（在頂點 \\(x=${(r1 + r2) / 2}\\)）。\\(|f(x)|\\) 的圖形在此頂點觸及高度 ${m}。當 \\(k=${m}\\)（等於頂點高度）時，交點數為 3（頂點處相切算 1 個）。`
        );
        continue;
      }

      // variant 4：|x^2 - c| 的最小正整數 k 使 |x^2-c|=k 有兩相異正根... 改：求 |x^2-a^2|=k 有 2 根
      const a = randInt(2, 5);
      questions.push(`若方程式 \\(|x^2-${a * a}|=k\\)（\\(k>0\\)）恰有 2 個相異實根，求 \\(k\\) 的範圍。`);
      answers.push(
        `簡答：\\(k>${a * a}\\)。過程：\\(y=|x^2-${a * a}|\\) 為 W 形，與 \\(y=k\\)：\\(0<k<${a * a}\\) 有 4 根、\\(k=${a * a}\\) 有 3 根、\\(k>${a * a}\\) 有 2 根。故恰 2 根需 \\(k>${a * a}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132AlgebraicExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const fr = (n, d) => {
      const f = makeFraction(n, d);
      return formatFraction(f.num, f.den);
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        // x^2+A y^2=1，求 B x + A y^2 的極值：= -x^2+Bx+1，x∈[-1,1]
        const A = randInt(2, 5);
        const B = 2 * randInt(-2, 2) || 2;
        // f(x)=-x^2+Bx+1，頂點 x=B/2
        const vx = B / 2;
        const fmax = vx >= -1 && vx <= 1 ? 4 + B * B : Math.max(4 * (-1 - -B), 4);
        const maxV = vx >= -1 && vx <= 1 ? 1 + (B * B) / 4 : Math.max(-1 - B + 1, -1 + B + 1);
        const minV = Math.min(-1 - B + 1, -1 + B + 1); // min(-B, B) 於端點
        questions.push(
          `設 \\(x,y\\) 為實數且 \\(x^2+${A}y^2=1\\)，求 \\(${B === 1 ? '' : B}x+${A}y^2\\) 的最大值與最小值。`
        );
        answers.push(
          `簡答：最大值 ${maxV}，最小值 ${minV}。過程：由約束 \\(${A}y^2=1-x^2\\ge0\\) 知 \\(-1\\le x\\le1\\)。代入得目標 \\(=${B}x+(1-x^2)=-(x-${vx})^2+${1 + (B * B) / 4}\\)。在 \\([-1,1]\\) 上頂點 \\(x=${vx}\\)${vx >= -1 && vx <= 1 ? '在區間內，最大值取頂點' : '不在區間內'}，最大值 ${maxV}；最小值在端點，為 ${minV}。`
        );
        continue;
      }

      if (variant === 1) {
        // x^2+2y^2=1，求 B x + C y^2 的最大值（C 為 y^2 係數）
        const B = randInt(1, 4);
        const C = randInt(1, 4);
        // 2y^2=1-x^2 → y^2=(1-x^2)/2；目標 = Bx + C(1-x^2)/2 = -(C/2)x^2+Bx+C/2
        // 頂點 x=B/C，f=... 若 B/C≤1 取頂點
        const vxN = B;
        const vxD = C;
        const vx = B / C;
        let maxV;
        if (vx <= 1 && vx >= -1) {
          // f(vx)=C/2 + B^2/(2C)
          maxV = makeFraction(C * C + B * B, 2 * C);
        } else {
          const fe = (x) => -(C / 2) * x * x + B * x + C / 2;
          maxV = makeFraction(Math.round(2 * C * fe(1)), 2 * C);
        }
        questions.push(`若 \\(x^2+2y^2=1\\)，求 \\(${B === 1 ? '' : B}x+${C}y^2\\) 的最大值。`);
        answers.push(
          `簡答：\\(${formatFraction(maxV.num, maxV.den)}\\)。過程：由 \\(2y^2=1-x^2\\)，\\(y^2=\\frac{1-x^2}2\\)（\\(-1\\le x\\le1\\)）。目標 \\(=${B}x+${C}\\cdot\\frac{1-x^2}2=-\\frac{${C}}2x^2+${B}x+\\frac{${C}}2\\)，頂點 \\(x=${fr(B, C)}\\)。取頂點（在區間內）得最大值 \\(${formatFraction(maxV.num, maxV.den)}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // y=√(r^2-(x-h)^2)+k 的下半/上半圓，求 x^2+y^2 極值（原點到圓的距離）
        const h = randInt(3, 6);
        const kk = -randInt(2, 5);
        const r = randInt(1, Math.min(h, -kk) - 0);
        const d = Math.round(Math.sqrt(h * h + kk * kk) * 1000) / 1000;
        // 最小距離平方（原點在圓外）：(√(h²+k²)-r)²
        const distC = Math.sqrt(h * h + kk * kk);
        const minDist2 = Math.round((distC - r) ** 2);
        const exact = (distC - r) ** 2;
        // 讓答案乾淨：取 h,k,r 使 h²+k² 為完全平方
        questions.push(
          `給定 \\(y=\\sqrt{${r * r}-(x-${h})^2}${kk}\\)（即圓 \\((x-${h})^2+(y${-kk >= 0 ? '+' : '-'}${Math.abs(kk)})^2=${r * r}\\) 的上半），求 \\(x^2+y^2\\) 的最小值。`
        );
        answers.push(
          `簡答：\\((\\sqrt{${h * h + kk * kk}}-${r})^2\\)。過程：\\(x^2+y^2\\) 是原點到圖形上點的距離平方。圓心 \\((${h},${kk})\\) 到原點距離為 \\(\\sqrt{${h * h + kk * kk}}\\)，半徑 ${r}。最近點的距離為 \\(\\sqrt{${h * h + kk * kk}}-${r}\\)，故最小值為其平方 \\((\\sqrt{${h * h + kk * kk}}-${r})^2\\)。`
        );
        continue;
      }

      // variant 4：單位圓上 B x + C y^2 的範圍
      const B = randInt(1, 4);
      const C = randInt(1, 4);
      // y^2=1-x^2；目標 = -C x^2 + B x + C，x∈[-1,1]
      const vx = B / (2 * C);
      const maxV = vx <= 1 && vx >= -1 ? makeFraction(4 * C * C + B * B, 4 * C) : makeFraction(B, 1);
      const minV = Math.min(-C - B + C, -C + B + C); // 端點 min(-B,B)... f(±1)=-C±B+C = ±B → min=-B... let compute
      const fe = (x) => -C * x * x + B * x + C;
      const mn = Math.min(fe(-1), fe(1));
      questions.push(`若 \\((x,y)\\) 在單位圓 \\(x^2+y^2=1\\) 上，求 \\(${B === 1 ? '' : B}x+${C}y^2\\) 的範圍。`);
      answers.push(
        `簡答：\\(${mn}\\le ${B === 1 ? '' : B}x+${C}y^2\\le${formatFraction(maxV.num, maxV.den)}\\)。過程：由 \\(y^2=1-x^2\\)（\\(-1\\le x\\le1\\)），目標 \\(=${B}x+${C}(1-x^2)=-${C}x^2+${B}x+${C}\\)。頂點 \\(x=${fr(B, 2 * C)}\\) 給最大值 \\(${formatFraction(maxV.num, maxV.den)}\\)，端點給最小值 ${mn}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132QuadraticAdvancedGraphExtremaFiveSubtypeMixedSet(count) {
    const banks = [
      buildS132QuadraticTransformationsSet,
      buildS132QuadraticRelativePositionSet,
      buildS132ParabolaGeometricAreasSet,
      buildS132AbsoluteValueQuadraticSet,
      buildS132AlgebraicExtremaSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132QuadraticSymmetryFunctionalRelationsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        // 對稱軸 x=c，開口向上/下，比較三點大小（依到軸距離）
        const c = randInt(-3, 4);
        const up = variant === 0;
        const xs = [c - 1, c, c + 2];
        const dist = xs.map((x) => Math.abs(x - c));
        const order = xs
          .map((x, idx) => ({ x, d: dist[idx] }))
          .sort((p, q) => (up ? p.d - q.d : q.d - p.d))
          .map((p) => `f(${p.x})`)
          .join('<');
        questions.push(
          `若二次函數 \\(f(x)=${up ? '' : '-'}x^2+bx+c\\)（開口向${up ? '上' : '下'}）滿足 \\(f(${c}+t)=f(${c}-t)\\) 對任意 \\(t\\) 恆成立，試比較 \\(f(${xs[0]}),f(${xs[1]}),f(${xs[2]})\\) 的大小。`
        );
        answers.push(
          `簡答：\\(${order}\\)。過程：條件表示對稱軸為 \\(x=${c}\\)。開口向${up ? '上' : '下'}時，離對稱軸越遠函數值越${up ? '大' : '小'}。三點到軸的距離為 \\(${dist.join(',')}\\)，據此排序即得。`
        );
        continue;
      }

      if (variant === 1) {
        // 對稱軸 x=h，a>0，判定 f(0)>k 與 f(p)≤f(q)（由距離）
        const h = randInt(2, 5);
        const k = randInt(1, 6);
        const p = 0;
        const q = 2 * h;
        questions.push(
          `設二次函數 \\(f(x)=a(x-${h})^2+${k}\\)，其中 \\(a>0\\)。若 \\(f(${h}-t)=f(${h}+t)\\) 恆成立，判定下列敘述是否正確：(1) \\(f(0)>${k}\\)；(2) \\(f(-1)\\le f(${2 * h + 1})\\)。`
        );
        answers.push(
          `簡答：(1) 正確；(2) 正確。過程：頂點為 \\((${h},${k})\\) 是最小值點，故 \\(f(0)>${k}\\)（0 不在頂點），(1) 正確。到對稱軸距離：\\(|-1-${h}|=${h + 1}\\)，\\(|${2 * h + 1}-${h}|=${h + 1}\\)，兩者相等，故 \\(f(-1)=f(${2 * h + 1})\\)，滿足 \\(\\le\\)，(2) 正確。`
        );
        continue;
      }

      // variant 2、4：已知兩點值與 D<0，說明 a<0,c<0
      const p1 = randInt(-2, 1);
      const p2 = p1 + randInt(2, 4);
      const v1 = -randInt(1, 5);
      const v2 = -randInt(1, 5);
      questions.push(
        `已知實係數二次函數 \\(f(x)=ax^2+bx+c\\) 滿足 \\(f(${p1})=${v1}\\)、\\(f(${p2})=${v2}\\)，且判別式 \\(D<0\\)。說明為何 \\(a<0\\) 且 \\(c<0\\)。`
      );
      answers.push(
        `簡答：因為存在函數值為負且 \\(D<0\\)。過程：判別式 \\(D<0\\) 表示 \\(f(x)=0\\) 無實根，圖形不與 \\(x\\) 軸相交，故 \\(f(x)\\) 恆正或恆負。又 \\(f(${p1})=${v1}<0\\)，可知 \\(f\\) 恆負，因此開口向下 \\(a<0\\)；且 \\(c=f(0)\\) 也 \\(<0\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132ParabolaInterceptDistanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        // PQ=d → 平移常數 +t → 新距離 √(d^2-4t)
        const d = randInt(4, 12);
        const t = randInt(1, Math.floor((d * d - 1) / 4));
        const nd = d * d - 4 * t;
        questions.push(
          `已知拋物線 \\(y=x^2+ax+b\\) 與 \\(x\\) 軸交於 \\(P,Q\\) 兩點且 \\(PQ=${d}\\)。若改為 \\(y=x^2+ax+(b+${t})\\)，求新拋物線與 \\(x\\) 軸兩交點的距離。`
        );
        answers.push(
          `簡答：\\(${formatRadical(nd)}\\)。過程：兩交點距離為 \\(\\frac{\\sqrt{b^2-4ac}}{|a|}\\)，此處 \\(a=1\\)。原判別式 \\(a^2-4b=${d}^2=${d * d}\\)。常數項加 ${t} 使判別式變為 \\(${d * d}-4\\times${t}=${nd}\\)，故新距離為 \\(\\sqrt{${nd}}=${formatRadical(nd)}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 頂點 (h,k)，領導係數 a → 距離 2√(-k/a)
        const a = randInt(1, 4);
        const r = randInt(1, 5);
        const h = randInt(-3, 4);
        const k = -a * r * r;
        questions.push(
          `二次函數 \\(y=${a === 1 ? '' : a}(x${h > 0 ? '-' : '+'}${Math.abs(h)})^2${k}\\) 的頂點為 \\((${h},${k})\\)，求此圖形與 \\(x\\) 軸兩交點間的距離。`
        );
        answers.push(
          `簡答：${2 * r}。過程：令 \\(y=0\\)，\\(${a === 1 ? '' : a}(x${h > 0 ? '-' : '+'}${Math.abs(h)})^2=${-k}\\)，得 \\((x${h > 0 ? '-' : '+'}${Math.abs(h)})^2=${-k / a}\\)，故 \\(x=${h}\\pm${r}\\)。兩交點距離為 \\(2\\times${r}=${2 * r}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // y=ax^2+bx 在 x=h 有最小值 → b=-2ah；求 c1·a+c2·b 型
        const a = randInt(1, 4);
        const h = randInt(1, 4);
        const b = -2 * a * h;
        questions.push(
          `設二次函數 \\(y=${a === 1 ? '' : a}x^2${b >= 0 ? '+' : '-'}${Math.abs(b)}x\\)，求其對稱軸方程式與頂點坐標。`
        );
        const k = a * h * h + b * h;
        answers.push(
          `簡答：對稱軸 \\(x=${h}\\)，頂點 \\((${h},${k})\\)。過程：對稱軸 \\(x=-\\frac{${b}}{2\\times${a}}=${h}\\)，代入得頂點 \\(y=${a}\\times${h}^2${b >= 0 ? '+' : '-'}${Math.abs(b)}\\times${h}=${k}\\)。`
        );
        continue;
      }

      // variant 4：兩交點加 y 軸交點（弦長與係數）；需 d^2+4yc>0
      const d = randInt(3, 9);
      let yc = pickNonZero(-6, 8);
      for (let g = 0; d * d + 4 * yc <= 0 && g < 40; g += 1) yc = pickNonZero(-6, 8);
      if (d * d + 4 * yc <= 0) yc = 1;
      questions.push(
        `拋物線 \\(y=x^2+ax${yc >= 0 ? '+' : '-'}${Math.abs(yc)}\\) 與 \\(x\\) 軸交於 \\(P,Q\\)，且 \\(PQ=${d}\\)，求 \\(a\\) 的可能值。`
      );
      const disc = d * d + 4 * yc;
      const sqOK = disc >= 0 && Number.isInteger(Math.sqrt(disc));
      answers.push(
        sqOK
          ? `簡答：\\(a=\\pm${Math.sqrt(disc)}\\)。過程：\\(PQ=\\sqrt{a^2-4\\times${yc}}=${d}\\)，故 \\(a^2-${4 * yc}=${d * d}\\)，\\(a^2=${disc}\\)，得 \\(a=\\pm${Math.sqrt(disc)}\\)。`
          : `簡答：\\(a=\\pm${formatRadical(disc)}\\)。過程：\\(PQ=\\sqrt{a^2-${4 * yc}}=${d}\\)，故 \\(a^2=${d * d}+${4 * yc}=${disc}\\)，得 \\(a=\\pm${formatRadical(disc)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132QuadraticStructuralModelingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // 半圓隧道 半徑 R，卡車寬 2w，高 H：在 x=w 處隧道高度 √(R²-w²)
        const R = randInt(10, 16);
        const w = randInt(3, 7);
        const H = randInt(8, 15);
        const clearance = Math.sqrt(R * R - w * w);
        const ok = clearance > H;
        questions.push(
          `有一半徑為 ${R} 呎的半圓形隧道口，一輛寬 ${2 * w} 呎、高 ${H} 呎的卡車靠著中央行駛，是否能安全通過？`
        );
        answers.push(
          `簡答：${ok ? '可以' : '不可以'}。過程：以隧道中心為原點，半圓為 \\(x^2+y^2=${R * R}\\)。卡車兩側在 \\(x=\\pm${w}\\)，此處隧道高度為 \\(\\sqrt{${R * R}-${w * w}}=\\sqrt{${R * R - w * w}}\\approx${clearance.toFixed(2)}\\) 呎。${ok ? `此高度大於卡車高 ${H} 呎，可通過` : `此高度小於卡車高 ${H} 呎，不能通過`}。`
        );
        continue;
      }

      if (variant === 1) {
        // y=vt-4.9t^2，t=T 時 y=Y → 求 v，再求 y≥Y 的時間長度
        // 設兩根 t1<t2 使 y=Y：y-Y=-4.9(t-t1)(t-t2)? 需 4.9 係數。改用整數化：g=5, 兩根 t1,t2
        const g = 5;
        const t1 = randInt(1, 3);
        const t2 = t1 + randInt(2, 5);
        const v = g * (t1 + t2);
        const Y = g * t1 * t2;
        questions.push(
          `以每秒 ${v} 公尺發射信號彈，高度 \\(y=${v}t-${g}t^2\\)。求信號彈在 ${Y} 公尺以上（含）的時間共有幾秒？`
        );
        answers.push(
          `簡答：${t2 - t1} 秒。過程：\\(y\\ge${Y}\\) 即 \\(${v}t-${g}t^2\\ge${Y}\\)，整理 \\(${g}t^2-${v}t+${Y}\\le0\\)，因式分解 \\(${g}(t-${t1})(t-${t2})\\le0\\)，得 \\(${t1}\\le t\\le${t2}\\)，共 \\(${t2}-${t1}=${t2 - t1}\\) 秒。`
        );
        continue;
      }

      if (variant === 2) {
        // 利潤：進價 c，定價 p0 賣 n0，每降 1 元多賣 m → 最大利潤售價
        const c = randInt(20, 40);
        const p0 = c + 2 * randInt(6, 12);
        const m = randInt(10, 30);
        const n0 = m * randInt(3, 6);
        const xStar = (m * (p0 - c) - n0) / (2 * m);
        if (!Number.isInteger(xStar) || xStar < 0) {
          i -= 1;
          continue;
        }
        const price = p0 - xStar;
        questions.push(
          `某商品進價 ${c} 元，定價 ${p0} 元時可賣 ${n0} 個；若售價每降 1 元，多賣 ${m} 個，求最大利潤時的售價。`
        );
        answers.push(
          `簡答：${price} 元。過程：設降價 \\(x\\) 元，利潤 \\(P=(${p0}-x-${c})(${n0}+${m}x)\\)，開口向下，頂點在 \\(x=${xStar}\\)，此時售價 \\(${p0}-${xStar}=${price}\\) 元。`
        );
        continue;
      }

      if (variant === 3) {
        // 噴泉頂點離牆 hh、高 kk，落地離牆 dd
        const hh = randInt(1, 3);
        const kk = randInt(3, 8);
        const dd = hh + randInt(1, 3);
        // y=a(x-hh)^2+kk，落地 (dd,0)：a=-kk/(dd-hh)^2
        const aNum = -kk;
        const aDen = (dd - hh) * (dd - hh);
        questions.push(
          `拋物線噴泉頂點離牆 ${hh} 公尺、高 ${kk} 公尺，且在離牆 ${dd} 公尺處落地。以牆腳為原點、地面為 \\(x\\) 軸，求噴泉軌跡方程式。`
        );
        answers.push(
          `簡答：\\(y=${formatFraction(aNum, aDen)}(x-${hh})^2+${kk}\\)。過程：頂點為 \\((${hh},${kk})\\)，設 \\(y=a(x-${hh})^2+${kk}\\)。代入落地點 \\((${dd},0)\\)：\\(0=a\\times${aDen}+${kk}\\)，得 \\(a=${formatFraction(aNum, aDen)}\\)。`
        );
        continue;
      }

      // variant 4：靠牆矩形最大面積（圍籬 Ltot，一邊靠牆）
      const Ltot = 2 * randInt(10, 30);
      const x = Ltot / 4;
      const area = x * (Ltot - 2 * x);
      questions.push(`用 ${Ltot} 公尺的圍籬沿牆圍一個矩形，靠牆的一邊不需圍籬，求可圍出的最大面積。`);
      answers.push(
        `簡答：${area} 平方公尺。過程：設垂直牆的邊為 \\(x\\)，平行牆的邊為 \\(${Ltot}-2x\\)。面積 \\(A=x(${Ltot}-2x)=-2x^2+${Ltot}x\\)，頂點 \\(x=${x}\\)，最大面積 \\(${x}\\times${Ltot - 2 * x}=${area}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132MonomialFunctionFeaturesSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cub = (a, p, q) => [a, -3 * a * p, 3 * a * p * p, -a * p * p * p + q];
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        // 三次 a(x-p)^3 + q 平移成單項 y=ax^3
        const a = pickNonZero(-3, 3);
        const p = randInt(-4, 4);
        const q = randInt(-8, 8);
        const co = cub(a, p, q);
        questions.push(
          `三次函數 \\(y=${formatPolynomialFromCoeffs(co)}\\) 向右平移 \\(h\\)、向上平移 \\(k\\) 後可得單項函數 \\(y=${a === 1 ? '' : a === -1 ? '-' : a}x^3\\)，求 \\((h,k)\\)。`
        );
        answers.push(
          `簡答：\\((h,k)=(${-p},${-q})\\)。過程：此三次式可寫成 \\(${a === 1 ? '' : a === -1 ? '-' : a}(x${p > 0 ? '-' : '+'}${Math.abs(p)})^3${q >= 0 ? '+' : '-'}${Math.abs(q)}\\)，對稱中心為 \\((${p},${q})\\)。移到原點需向右 \\(${-p}\\)、向上 \\(${-q}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // y=ax^4 通過 (p,q) → y=-ax^4 通過 (p,-q) 與 (-p,-q)
        const p = pickNonZero(-3, 3);
        const q = randInt(1, 9);
        questions.push(
          `已知四次函數 \\(y=ax^4\\)（\\(a>0\\)）通過點 \\((${p},${q})\\)。判定 \\(y=-ax^4\\) 的圖形必通過哪些點。`
        );
        answers.push(
          `簡答：必通過 \\((${p},${-q})\\) 與 \\((${-p},${-q})\\)。過程：\\(y=-ax^4\\) 是 \\(y=ax^4\\) 對 \\(x\\) 軸的鏡射，故 \\((${p},${q})\\) 變為 \\((${p},${-q})\\)。又 \\(x^4\\) 為偶函數（對 \\(y\\) 軸對稱），故也通過 \\((${-p},${-q})\\)。`
        );
        continue;
      }

      // variant 2、4：比較開口大小（|a| 越大越窄）
      const cs = shuffle([
        makeFraction(1, randInt(2, 4)),
        makeFraction(1, 1),
        makeFraction(randInt(2, 4), 1),
        makeFraction(-randInt(1, 3), 1),
      ]).slice(0, 3);
      const labelled = cs.map((c, idx) => ({
        name: `T_${idx + 1}`,
        text: c.den === 1 && c.num === 1 ? '' : c.den === 1 && c.num === -1 ? '-' : formatFraction(c.num, c.den),
        mag: Math.abs(c.num / c.den),
      }));
      const order = labelled
        .slice()
        .sort((p, q) => p.mag - q.mag)
        .map((t) => t.name)
        .join(',');
      const listText = labelled.map((t) => `\\(${t.name}:y=${t.text}x^2\\)`).join('、');
      questions.push(`比較 ${listText} 的開口大小，依由大到小排列。`);
      answers.push(
        `簡答：${order}（由大到小）。過程：二次函數 \\(y=ax^2\\) 中 \\(|a|\\) 越小開口越大。三者的 \\(|a|\\) 分別為 \\(${labelled.map((t) => t.mag).join(',')}\\)，依 \\(|a|\\) 由小到大排序即為開口由大到小：\\(${order}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132CompoundRegionsExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const fr = (n, d) => {
      const f = makeFraction(n, d);
      return formatFraction(f.num, f.den);
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // 線段 x+2y=S, x,y≥0，求 x^2+y^2 最大值（端點）與最小值（垂足）
        const S = 2 * randInt(2, 6);
        // 端點 (S,0)→S^2, (0,S/2)→S^2/4；最大 S^2
        const maxV = S * S;
        // 最小為原點到直線距離平方 = S^2/(1+4)=S^2/5
        const minV = makeFraction(S * S, 5);
        questions.push(`設 \\(x,y\\ge0\\) 且 \\(x+2y=${S}\\)，求 \\(x^2+y^2\\) 的最大值與最小值。`);
        answers.push(
          `簡答：最大值 ${maxV}，最小值 \\(${formatFraction(minV.num, minV.den)}\\)。過程：\\(x^2+y^2\\) 是原點到線段上點的距離平方。線段端點為 \\((${S},0)\\) 與 \\((0,${S / 2})\\)，最遠端點給最大值 \\(${S}^2=${maxV}\\)；最近點為原點到直線 \\(x+2y=${S}\\) 的垂足，距離平方 \\(\\frac{${S}^2}{1^2+2^2}=${formatFraction(minV.num, minV.den)}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 三角形區域 x,y≥0, ax+by≤c 求 x^2+y^2 最大值（最遠頂點）
        const a = randInt(2, 4);
        const b = randInt(2, 4);
        const c = a * b * randInt(1, 3);
        // 頂點 (0,0),(c/a,0),(0,c/b)
        const v1 = (c / a) * (c / a);
        const v2 = (c / b) * (c / b);
        const maxV = Math.max(v1, v2, 0);
        questions.push(`設 \\(x,y\\ge0\\) 且 \\(${a}x+${b}y\\le${c}\\)，求 \\(x^2+y^2\\) 的最大值。`);
        answers.push(
          `簡答：${maxV}。過程：\\(x^2+y^2\\)（到原點距離平方）在凸區域的最大值出現在頂點。三頂點為 \\((0,0),(${c / a},0),(0,${c / b})\\)，代入分別得 \\(0,${v1},${v2}\\)，最大為 ${maxV}。`
        );
        continue;
      }

      if (variant === 2 || variant === 4) {
        // f(x)=|x-a|+w2|x-b|+w3|x-c| 的最小值在加權中位數
        const a = randInt(-3, 0);
        const b = randInt(1, 3);
        const cc = b + randInt(1, 3);
        // 權重 1,2,3；總權 6，中位數位置：累積權重過半在 x=b（權2）到 x=cc（權3）
        // 權 1(在a),2(在b),3(在cc)：由右累積 3≥3? 半權=3。從最大端 cc 權3 = 半權，故最小在 [b,cc]
        // 直接計算 f 在各節點
        const nodes = [a, b, cc];
        const w = [1, 2, 3];
        const fval = (x) => w[0] * Math.abs(x - a) + w[1] * Math.abs(x - b) + w[2] * Math.abs(x - cc);
        let bestX = nodes[0];
        let best = fval(nodes[0]);
        nodes.forEach((n) => {
          if (fval(n) < best) {
            best = fval(n);
            bestX = n;
          }
        });
        questions.push(
          `設 \\(f(x)=|x${a >= 0 ? '-' : '+'}${Math.abs(a)}|+2|x-${b}|+3|x-${cc}|\\)，求 \\(f(x)\\) 的最小值及發生的 \\(x\\)。`
        );
        answers.push(
          `簡答：最小值 ${best}，發生在 \\(x=${bestX}\\)。過程：分段線性函數的最小值出現在加權中位數（某個節點）。權重為 \\(1,2,3\\)（總和 6），從權重大的一側累積至過半，落在 \\(x=${cc}\\)。比較各節點 \\(f(${a})=${fval(a)},f(${b})=${fval(b)},f(${cc})=${fval(cc)}\\)，最小為 \\(f(${bestX})=${best}\\)。`
        );
        continue;
      }

      // variant 3：x+2y=S, x,y≥0, 求 x^2+y^2 最大值
      const S = 2 * randInt(2, 6);
      questions.push(`設 \\(x,y\\) 為實數，滿足 \\(x+2y=${S}\\) 且 \\(x,y\\ge0\\)，求 \\(x^2+y^2\\) 的最大值。`);
      answers.push(
        `簡答：${S * S}。過程：可行區域為線段，端點 \\((${S},0)\\) 與 \\((0,${S / 2})\\)。\\(x^2+y^2\\) 在端點取極值：\\(${S}^2=${S * S}\\) 與 \\(${(S / 2) * (S / 2)}\\)，最大為 ${S * S}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132QuadraticSymmetryModelingCompoundFiveSubtypeMixedSet(count) {
    const banks = [
      buildS132QuadraticSymmetryFunctionalRelationsSet,
      buildS132ParabolaInterceptDistanceSet,
      buildS132QuadraticStructuralModelingSet,
      buildS132MonomialFunctionFeaturesSet,
      buildS132CompoundRegionsExtremaSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132CubicTransformCenterSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // f(x)=a(x-p)^3+b(x-p)+q → 一般式係數，對稱中心 (p,q)，中心處切線 y=q+b(x-p)
    const cub = (a, p, b, q) => [a, -3 * a * p, 3 * a * p * p + b, -a * p * p * p - b * p + q];
    const P3 = (c) => formatPolynomialFromCoeffs(c);
    const shifted = (a, p, b, q) => {
      const inner = p === 0 ? 'x' : `(x${p > 0 ? '-' : '+'}${Math.abs(p)})`;
      const lead = a === 1 ? '' : a === -1 ? '-' : `${a}`;
      const lin = b === 0 ? '' : `${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}${inner}`;
      const tail = q === 0 ? '' : `${q > 0 ? '+' : '-'}${Math.abs(q)}`;
      return `${lead}${inner}^3${lin}${tail}`;
    };
    const fEval = (a, p, b, q, x) => a * (x - p) ** 3 + b * (x - p) + q;
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const a = pickNonZero(-3, 3);
      const p = randInt(-4, 4);
      const q = randInt(-8, 8);

      if (variant === 0 || variant === 4) {
        // b=0 才能平移成單項函數
        const co = cub(a, p, 0, q);
        questions.push(
          `將三次函數 \\(y=${P3(co)}\\) 向右平移 \\(h\\) 個單位，再向上平移 \\(k\\) 個單位，可得單項函數 \\(y=${a === 1 ? '' : a === -1 ? '-' : a}x^3\\)，求數對 \\((h,k)\\)。`
        );
        answers.push(
          `簡答：\\((h,k)=(${-p},${-q})\\)。過程：配方得 \\(y=${shifted(a, p, 0, q)}\\)，其對稱中心為 \\((${p},${q})\\)。要把中心移到原點，需向右平移 \\(${-p}\\)、向上平移 \\(${-q}\\)，故 \\((h,k)=(${-p},${-q})\\)。`
        );
        continue;
      }

      if (variant === 1) {
        const b = pickNonZero(-6, 6);
        const co = cub(a, p, b, q);
        questions.push(`已知三次函數 \\(y=${P3(co)}\\)，求其圖形的對稱中心坐標。`);
        answers.push(
          `簡答：\\((${p},${q})\\)。過程：三次函數 \\(y=Ax^3+Bx^2+Cx+D\\) 的對稱中心橫坐標為 \\(x=-\\frac{B}{3A}=-\\frac{${co[1]}}{3\\cdot${co[0]}}=${p}\\)。代入得 \\(f(${p})=${q}\\)，所以對稱中心為 \\((${p},${q})\\)。`
        );
        continue;
      }

      if (variant === 2) {
        questions.push(`若 \\(f(x)=${shifted(1, p, 0, q)}\\)，說明其圖形是由 \\(y=x^3\\) 如何平移而得。`);
        answers.push(
          `簡答：向${p >= 0 ? '右' : '左'}平移 ${Math.abs(p)} 單位、向${q >= 0 ? '上' : '下'}平移 ${Math.abs(q)} 單位。過程：\\(y=x^3\\) 的中心在原點；\\(f(x)=${shifted(1, p, 0, q)}\\) 的中心在 \\((${p},${q})\\)，故平移量即為 \\((${p},${q})\\)。`
        );
        continue;
      }

      // variant 3：由中心與領導係數反推（含一次項）
      const b3 = pickNonZero(-6, 6);
      const co3 = cub(a, p, b3, q);
      questions.push(
        `已知三次函數的領導係數為 ${a}、對稱中心為 \\((${p},${q})\\)，且 \\(f'(${p})\\) 對應的一次項係數為 ${b3}，求其一般式。`
      );
      answers.push(
        `簡答：\\(y=${P3(co3)}\\)。過程：以中心為基準設 \\(y=${shifted(a, p, b3, q)}\\)，展開整理即得 \\(y=${P3(co3)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132CubicLocalLinearApproximationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cub = (a, p, b, q) => [a, -3 * a * p, 3 * a * p * p + b, -a * p * p * p - b * p + q];
    const P3 = (c) => formatPolynomialFromCoeffs(c);
    const shifted = (a, p, b, q) => {
      const inner = p === 0 ? 'x' : `(x${p > 0 ? '-' : '+'}${Math.abs(p)})`;
      const lead = a === 1 ? '' : a === -1 ? '-' : `${a}`;
      const lin = b === 0 ? '' : `${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}${inner}`;
      const tail = q === 0 ? '' : `${q > 0 ? '+' : '-'}${Math.abs(q)}`;
      return `${lead}${inner}^3${lin}${tail}`;
    };
    const fEval = (a, p, b, q, x) => a * (x - p) ** 3 + b * (x - p) + q;
    const fPrime = (a, p, b, x) => 3 * a * (x - p) * (x - p) + b;
    const lineText = (m, c) => `y=${m === 1 ? '' : m === -1 ? '-' : m}x${c >= 0 ? '+' : '-'}${Math.abs(c)}`;
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const a = pickNonZero(-3, 3);
      const p = randInt(-4, 5);
      const b = pickNonZero(-6, 6);
      const q = randInt(-8, 8);
      const co = cub(a, p, b, q);

      if (variant === 0 || variant === 3) {
        // 在對稱中心附近的一次近似 = q + b(x-p)
        const c0 = q - b * p;
        questions.push(`求三次函數 \\(y=${P3(co)}\\) 在其對稱中心附近的一次近似式。`);
        answers.push(
          `簡答：\\(${lineText(b, c0)}\\)。過程：配方得 \\(y=${shifted(a, p, b, q)}\\)，對稱中心為 \\((${p},${q})\\)。當 \\(x\\) 接近 ${p} 時，三次項 \\(${a}(x-${p})^3\\) 的量級遠小於一次項，故一次近似為 \\(y=${q}${b >= 0 ? '+' : ''}${b}(x-${p})\\)，即 \\(${lineText(b, c0)}\\)。`
        );
        continue;
      }

      if (variant === 1 || variant === 4) {
        // 在 x0 附近的一次近似並估值
        const x0 = p + pickNonZero(-3, 3);
        const f0 = fEval(a, p, b, q, x0);
        const d0 = fPrime(a, p, b, x0);
        const N = [10, 50, 100, 1000][randInt(0, 3)];
        const est = makeFraction(f0 * N + d0, N);
        questions.push(`利用一次近似，估計 \\(f(x)=${P3(co)}\\) 在 \\(x=${x0}+\\frac1{${N}}\\) 時的函數值。`);
        answers.push(
          `簡答：約 \\(${formatFraction(est.num, est.den)}\\)。過程：\\(f(${x0})=${f0}\\)，\\(f'(x)=${3 * a}(x-${p})^2${b >= 0 ? '+' : ''}${b}\\) 故 \\(f'(${x0})=${d0}\\)。一次近似 \\(f(x)\\approx${f0}${d0 >= 0 ? '+' : ''}${d0}(x-${x0})\\)，代入 \\(x-${x0}=\\frac1{${N}}\\) 得 \\(${f0}+\\frac{${d0}}{${N}}=${formatFraction(est.num, est.den)}\\)。`
        );
        continue;
      }

      // variant 2：由中心與近似線反推函數
      const c2 = q - b * p;
      questions.push(
        `設三次函數 \\(f(x)\\) 的領導係數為 ${a}、對稱中心的 \\(x\\) 坐標為 ${p}，且它在對稱中心附近的一次近似為 \\(${lineText(b, c2)}\\)，求 \\(f(x)\\) 的一般式。`
      );
      answers.push(
        `簡答：\\(f(x)=${P3(co)}\\)。過程：以中心為基準設 \\(f(x)=${a}(x-${p})^3+B(x-${p})+K\\)。一次近似即 \\(y=K+B(x-${p})\\)，與 \\(${lineText(b, c2)}\\) 比較得 \\(B=${b}\\)、\\(K=${q}\\)。展開得 \\(f(x)=${P3(co)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132CubicRootsCenterRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const P3 = (c) => formatPolynomialFromCoeffs(c);
    const fromRoots = (a, r1, r2, r3) => [a, -a * (r1 + r2 + r3), a * (r1 * r2 + r2 * r3 + r3 * r1), -a * r1 * r2 * r3];
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        // 三根已知（取和為 3 的倍數以便中心為整數）
        const m = randInt(-3, 4);
        const d = randInt(1, 4);
        const e = randInt(1, 4);
        const r1 = m - d;
        const r2 = m + e;
        const r3 = 3 * m - r1 - r2;
        const a = pickNonZero(-2, 3);
        const co = fromRoots(a, r1, r2, r3);
        questions.push(`已知 \\(f(x)=${P3(co)}\\) 的三個根為 \\(${r1},${r2},${r3}\\)，求其對稱中心的 \\(x\\) 坐標。`);
        answers.push(
          `簡答：\\(x=${m}\\)。過程：三次函數的對稱中心橫坐標等於三根的平均（也等於 \\(-\\frac{B}{3A}\\)）。故 \\(x=\\frac{${r1}+${r2}+${r3}}3=${m}\\)。`
        );
        continue;
      }

      if (variant === 1 || variant === 4) {
        const m = randInt(-3, 5);
        const r1 = m - randInt(1, 5);
        const r2 = m + randInt(1, 5);
        const r3 = 3 * m - r1 - r2;
        questions.push(
          `若三次函數 \\(f(x)\\) 與 \\(x\\) 軸交於三點，其中兩點為 \\((${r1},0)\\) 與 \\((${r2},0)\\)，且對稱中心的 \\(x\\) 坐標為 ${m}，求第三個交點。`
        );
        answers.push(
          `簡答：\\((${r3},0)\\)。過程：對稱中心橫坐標為三根平均，故 \\(\\frac{${r1}+${r2}+r_3}3=${m}\\)，解得 \\(r_3=3\\times${m}-${r1}-${r2}=${r3}\\)。`
        );
        continue;
      }

      // variant 2：三根成等差 → 中心即中間根
      const mid = randInt(-3, 4);
      const dd = randInt(1, 4);
      const a2 = pickNonZero(-2, 3);
      const co2 = fromRoots(a2, mid - dd, mid, mid + dd);
      questions.push(`設 \\(f(x)=${P3(co2)}\\)。已知其三個根成等差數列，求對稱中心坐標。`);
      answers.push(
        `簡答：\\((${mid},0)\\)。過程：三根成等差時，中間根即為三根平均，也就是對稱中心的橫坐標，故 \\(x=${mid}\\)。又該點是根，\\(f(${mid})=0\\)，所以對稱中心為 \\((${mid},0)\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132CubicSymmetryEvaluationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // f(x)=a(x-p)^3+b(x-p)+q → 一般式係數，對稱中心 (p,q)，中心處切線 y=q+b(x-p)
    const cub = (a, p, b, q) => [a, -3 * a * p, 3 * a * p * p + b, -a * p * p * p - b * p + q];
    const P3 = (c) => formatPolynomialFromCoeffs(c);
    const shifted = (a, p, b, q) => {
      const inner = p === 0 ? 'x' : `(x${p > 0 ? '-' : '+'}${Math.abs(p)})`;
      const lead = a === 1 ? '' : a === -1 ? '-' : `${a}`;
      const lin = b === 0 ? '' : `${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}${inner}`;
      const tail = q === 0 ? '' : `${q > 0 ? '+' : '-'}${Math.abs(q)}`;
      return `${lead}${inner}^3${lin}${tail}`;
    };
    const fEval = (a, p, b, q, x) => a * (x - p) ** 3 + b * (x - p) + q;
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const a = pickNonZero(-3, 3);
      const p = randInt(-4, 5);
      const b = pickNonZero(-6, 6);
      const q = randInt(-9, 9);

      if (variant === 0 || variant === 3) {
        const t = randInt(1, 6);
        questions.push(
          `已知三次函數 \\(f(x)\\) 的對稱中心為 \\((${p},${q})\\)，求 \\(f(${p - t})+f(${p + t})\\) 之值。`
        );
        answers.push(
          `簡答：${2 * q}。過程：對稱中心 \\((${p},${q})\\) 表示 \\(f(${p}-t)+f(${p}+t)=2\\times${q}\\) 對所有 \\(t\\) 成立。取 \\(t=${t}\\) 即得 \\(f(${p - t})+f(${p + t})=${2 * q}\\)。`
        );
        continue;
      }

      if (variant === 1 || variant === 4) {
        const co = cub(a, p, b, q);
        const t = randInt(50, 300);
        questions.push(`設 \\(f(x)=${P3(co)}\\)，求 \\(f(${p - t})+f(${p + t})\\) 之值。`);
        answers.push(
          `簡答：${2 * q}。過程：先求對稱中心，\\(x=-\\frac{${co[1]}}{3\\cdot${co[0]}}=${p}\\)，\\(f(${p})=${q}\\)，中心為 \\((${p},${q})\\)。由中心對稱性 \\(f(${p}-t)+f(${p}+t)=2\\times${q}=${2 * q}\\)，與 \\(t\\) 無關。`
        );
        continue;
      }

      // variant 2：由恆等式反推中心
      const c2 = 2 * q;
      questions.push(
        `若三次函數 \\(f(x)\\) 滿足 \\(f(${p}-t)+f(${p}+t)=${c2}\\) 對任意實數 \\(t\\) 恆成立，求此函數圖形的對稱中心。`
      );
      answers.push(
        `簡答：\\((${p},${q})\\)。過程：該恆等式表示以 \\(x=${p}\\) 為中心時，兩側函數值之和固定為 ${c2}，即中心的縱坐標為 \\(\\frac{${c2}}2=${q}\\)。故對稱中心為 \\((${p},${q})\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132CubicMonomialOverlapSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cub = (a, p, b, q) => [a, -3 * a * p, 3 * a * p * p + b, -a * p * p * p - b * p + q];
    const P3 = (c) => formatPolynomialFromCoeffs(c);
    const shifted = (a, p, b, q) => {
      const inner = p === 0 ? 'x' : `(x${p > 0 ? '-' : '+'}${Math.abs(p)})`;
      const lead = a === 1 ? '' : a === -1 ? '-' : `${a}`;
      const lin = b === 0 ? '' : `${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}${inner}`;
      const tail = q === 0 ? '' : `${q > 0 ? '+' : '-'}${Math.abs(q)}`;
      return `${lead}${inner}^3${lin}${tail}`;
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const a = pickNonZero(-3, 3);
      const p = randInt(-4, 4);
      const q = randInt(-8, 8);

      if (variant === 0 || variant === 3) {
        // 隨機決定「可以」或「不可以」平移成單項函數（取決於 b 是否為 0）
        const can = randInt(0, 1) === 0;
        const b = can ? 0 : pickNonZero(-6, 6);
        const co = cub(a, p, b, q);
        questions.push(
          `判定 \\(f(x)=${P3(co)}\\) 經平移後是否能與 \\(y=${a === 1 ? '' : a === -1 ? '-' : a}x^3\\) 重合。`
        );
        answers.push(
          can
            ? `簡答：可以。過程：配方得 \\(f(x)=${shifted(a, p, 0, q)}\\)，不含一次項，故將圖形向左平移 ${p} 、向下平移 ${q} 即與 \\(y=${a === 1 ? '' : a === -1 ? '-' : a}x^3\\) 重合。`
            : `簡答：不可以。過程：配方得 \\(f(x)=${shifted(a, p, b, q)}\\)，中心化後仍留有一次項 \\(${b}(x-${p})\\)。平移只能改變中心位置、無法消去一次項，故無法與 \\(y=${a === 1 ? '' : a === -1 ? '-' : a}x^3\\) 重合。`
        );
        continue;
      }

      if (variant === 1 || variant === 4) {
        const co = cub(a, p, 0, q);
        questions.push(
          `若 \\(f(x)=${P3(co)}\\)，求將其平移至 \\(y=${a === 1 ? '' : a === -1 ? '-' : a}x^3\\) 所需的位移。`
        );
        answers.push(
          `簡答：向左平移 ${p}、向下平移 ${q}（即位移 \\((${-p},${-q})\\)）。過程：配方得 \\(f(x)=${shifted(a, p, 0, q)}\\)，對稱中心為 \\((${p},${q})\\)。把中心移到原點即得 \\(y=${a === 1 ? '' : a === -1 ? '-' : a}x^3\\)，故位移為 \\((${-p},${-q})\\)。`
        );
        continue;
      }

      // variant 2：一般條件 3AC=B²
      const A2 = pickNonZero(1, 4);
      const B2 = 3 * A2 * randInt(1, 3);
      const C2 = (B2 * B2) / (3 * A2);
      questions.push(
        `給定 \\(f(x)=Ax^3+Bx^2+Cx+D\\)（\\(A\\ne0\\)），求 \\(A,B,C\\) 需滿足什麼代數關係，才能使其平移後成為單項函數 \\(y=Ax^3\\)？並驗證 \\(A=${A2},B=${B2},C=${C2}\\) 是否符合。`
      );
      answers.push(
        `簡答：條件為 \\(B^2=3AC\\)；\\(A=${A2},B=${B2},C=${C2}\\) 符合。過程：對稱中心橫坐標 \\(p=-\\frac{B}{3A}\\)，中心化後的一次項係數為 \\(f'(p)=C-\\frac{B^2}{3A}\\)。要能平移成單項函數需此係數為 0，即 \\(B^2=3AC\\)。代入驗證：\\(B^2=${B2 * B2}\\)，\\(3AC=3\\times${A2}\\times${C2}=${3 * A2 * C2}\\)，兩者相等，故符合。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132CubicInflectionTangentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cub = (a, p, b, q) => [a, -3 * a * p, 3 * a * p * p + b, -a * p * p * p - b * p + q];
    const P3 = (c) => formatPolynomialFromCoeffs(c);
    const shifted = (a, p, b, q) => {
      const inner = p === 0 ? 'x' : `(x${p > 0 ? '-' : '+'}${Math.abs(p)})`;
      const lead = a === 1 ? '' : a === -1 ? '-' : `${a}`;
      const lin = b === 0 ? '' : `${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}${inner}`;
      const tail = q === 0 ? '' : `${q > 0 ? '+' : '-'}${Math.abs(q)}`;
      return `${lead}${inner}^3${lin}${tail}`;
    };
    const lineText = (m, c) =>
      `y=${m === 0 ? `${c}` : `${m === 1 ? '' : m === -1 ? '-' : m}x${c === 0 ? '' : `${c > 0 ? '+' : '-'}${Math.abs(c)}`}`}`;
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const a = pickNonZero(-3, 3);
      const p = randInt(-4, 5);
      const b = pickNonZero(-6, 6);
      const q = randInt(-8, 8);
      const co = cub(a, p, b, q);
      const cInt = q - b * p;

      if (variant === 0 || variant === 3) {
        questions.push(`求 \\(f(x)=${shifted(a, p, b, q)}\\) 在對稱中心處的切線方程式。`);
        answers.push(
          `簡答：\\(${lineText(b, cInt)}\\)。過程：此式已以中心 \\((${p},${q})\\) 為基準。\\(f'(x)=${3 * a}(x-${p})^2${b >= 0 ? '+' : ''}${b}\\)，在 \\(x=${p}\\) 時 \\(f'(${p})=${b}\\)。切線為 \\(y-${q}=${b}(x-${p})\\)，整理得 \\(${lineText(b, cInt)}\\)。`
        );
        continue;
      }

      if (variant === 1 || variant === 4) {
        questions.push(
          `已知三次函數的對稱中心為 \\((${p},${q})\\)、中心處的切線為 \\(${lineText(b, cInt)}\\)，且領導係數為 ${a}，求該函數的標準式（以中心為基準）。`
        );
        answers.push(
          `簡答：\\(f(x)=${shifted(a, p, b, q)}\\)。過程：以中心為基準設 \\(f(x)=${a}(x-${p})^3+B(x-${p})+${q}\\)。中心處切線斜率即為 \\(B\\)，由 \\(${lineText(b, cInt)}\\) 得 \\(B=${b}\\)，故 \\(f(x)=${shifted(a, p, b, q)}\\)。`
        );
        continue;
      }

      // variant 2：說明為何中心處一次近似即平移後的一次項
      const leadT = a === 1 ? '' : a === -1 ? '-' : `${a}`;
      const innerT = p === 0 ? 'x' : `(x${p > 0 ? '-' : '+'}${Math.abs(p)})`;
      const tailT = q === 0 ? '' : `${q > 0 ? '+' : '-'}${Math.abs(q)}`;
      questions.push(
        `設 \\(f(x)=${leadT}${innerT}^3+B${innerT}${tailT}\\)。說明為何其在對稱中心處的切線，斜率恰為一次項係數 \\(B\\)。`
      );
      answers.push(
        `簡答：因為 \\(f'(${p})=B\\)。過程：對 \\(f\\) 微分得 \\(f'(x)=${3 * a}(x-${p})^2+B\\)。代入 \\(x=${p}\\)，平方項為 0，故 \\(f'(${p})=B\\)。也就是說在中心附近，三次項的貢獻是 \\((x-${p})\\) 的三階小量，主導的線性部分正是 \\(B(x-${p})\\)，所以切線斜率就是 \\(B\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132CubicChordMidpointSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // f(x)=a(x-p)^3+b(x-p)+q → 一般式係數，對稱中心 (p,q)，中心處切線 y=q+b(x-p)
    const cub = (a, p, b, q) => [a, -3 * a * p, 3 * a * p * p + b, -a * p * p * p - b * p + q];
    const P3 = (c) => formatPolynomialFromCoeffs(c);
    const shifted = (a, p, b, q) => {
      const inner = p === 0 ? 'x' : `(x${p > 0 ? '-' : '+'}${Math.abs(p)})`;
      const lead = a === 1 ? '' : a === -1 ? '-' : `${a}`;
      const lin = b === 0 ? '' : `${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}${inner}`;
      const tail = q === 0 ? '' : `${q > 0 ? '+' : '-'}${Math.abs(q)}`;
      return `${lead}${inner}^3${lin}${tail}`;
    };
    const fEval = (a, p, b, q, x) => a * (x - p) ** 3 + b * (x - p) + q;
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const a = pickNonZero(-3, 3);
      const p = randInt(-4, 5);
      const b = pickNonZero(-6, 6);
      const q = randInt(-8, 8);

      if (variant === 0 || variant === 3) {
        const t = randInt(1, 4);
        const ax0 = p + t;
        const ay0 = fEval(a, p, b, q, ax0);
        questions.push(
          `直線 \\(L\\) 通過三次函數圖形的對稱中心 \\(M(${p},${q})\\)，且除中心外另與圖形交於 \\(A,B\\) 兩點。若 \\(A=(${ax0},${ay0})\\)，求 \\(B\\) 點坐標。`
        );
        answers.push(
          `簡答：\\((${2 * p - ax0},${2 * q - ay0})\\)。過程：三次函數對稱中心 \\(M\\) 是圖形的對稱點，過 \\(M\\) 的直線與圖形的另兩交點必以 \\(M\\) 為中點。故 \\(B=(2\\times${p}-${ax0},\\ 2\\times${q}-${ay0})=(${2 * p - ax0},${2 * q - ay0})\\)。`
        );
        continue;
      }

      if (variant === 1 || variant === 4) {
        const co = cub(a, 0, b, 0);
        const al = randInt(1, 4);
        const be = fEval(a, 0, b, 0, al);
        questions.push(
          `設 \\(f(x)=${P3(co)}\\)。若點 \\(P(${al},${be})\\) 在圖形上，判斷 \\((${-al},${-be})\\) 是否也在圖形上，並說明理由。`
        );
        answers.push(
          `簡答：是。過程：\\(f(-x)=${a}(-x)^3${b >= 0 ? '+' : ''}${b}(-x)=-(${a}x^3${b >= 0 ? '+' : ''}${b}x)=-f(x)\\)，為奇函數，圖形對稱中心為原點。故 \\(f(${-al})=-f(${al})=${-be}\\)，該點確實在圖形上。`
        );
        continue;
      }

      // variant 2：三交點 x 坐標成等差 → 中間點即對稱中心
      const d2 = randInt(1, 4);
      questions.push(
        `一條直線與三次函數 \\(f(x)\\)（對稱中心 \\((${p},${q})\\)）交於三點，且三點的 \\(x\\) 坐標成等差數列。若最小與最大的 \\(x\\) 坐標分別為 \\(${p - d2}\\) 與 \\(${p + d2}\\)，求中間交點的坐標。`
      );
      answers.push(
        `簡答：\\((${p},${q})\\)。過程：三個 \\(x\\) 坐標成等差，中間者為 \\(\\frac{${p - d2}+${p + d2}}2=${p}\\)。又由中心對稱性，最外兩點關於中心對稱，故中間交點正是對稱中心 \\((${p},${q})\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS132CubicFunctionsSevenSubtypeMixedSet(count) {
    const banks = [
      buildS132CubicTransformCenterSet,
      buildS132CubicLocalLinearApproximationSet,
      buildS132CubicRootsCenterRelationSet,
      buildS132CubicSymmetryEvaluationSet,
      buildS132CubicMonomialOverlapSet,
      buildS132CubicInflectionTangentSet,
      buildS132CubicChordMidpointSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }
  // ── s1-3-2 新增：分段函數代值計算 ───────────────────────────────────
  function buildS132PiecewiseFunctionEvalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        // f(x) = { ax+b  x≥0; cx+d  x<0 }
        const a = randInt(1, 4),
          b = randInt(-3, 3);
        const c = randInt(1, 4),
          d = randInt(-3, 3);
        const p = randInt(1, 4),
          q = randInt(-4, -1);
        const fp = a * p + b,
          fq = c * q + d;
        const bStr = formatSignedNumber(b);
        const dStr = formatSignedNumber(d);
        questions.push(
          `設 \\(f(x)=\\begin{cases}${formatLinearExpr(a, b)}, & x\\ge0\\\\ ${formatLinearExpr(c, d)}, & x<0\\end{cases}\\)，求 \\(f(${p})\\) 與 \\(f(${q})\\)。`
        );
        answers.push(
          `簡答：\\(f(${p})=${fp}\\)，\\(f(${q})=${fq}\\)。` +
            `過程：\\(${p}\\ge0\\) 用第一段，\\(f(${p})=${a}\\cdot${wrapIfNegative(p)}${bStr}=${fp}\\)；` +
            `\\(${q}<0\\) 用第二段，\\(f(${q})=${c}\\cdot${wrapIfNegative(q)}${dStr}=${fq}\\)。`
        );
      } else if (mode === 1) {
        // f(x) = { x^2+a  x≥1; bx+c  x<1 }
        const a = randInt(0, 5),
          b = randInt(1, 4),
          c = randInt(-5, 5);
        const p = randInt(1, 4),
          q = randInt(-3, 0);
        const fp = p * p + a,
          fq = b * q + c;
        const aStr = formatSignedNumber(a);
        const cStr = formatSignedNumber(c);
        questions.push(
          `設 \\(f(x)=\\begin{cases}x^2${aStr}, & x\\ge1\\\\ ${formatLinearExpr(b, c)}, & x<1\\end{cases}\\)，求 \\(f(${p})\\) 與 \\(f(${q})\\)。`
        );
        answers.push(
          `簡答：\\(f(${p})=${fp}\\)，\\(f(${q})=${fq}\\)。` +
            `過程：\\(${p}\\ge1\\) 用第一段，\\(f(${p})=${p}^2${aStr}=${fp}\\)；` +
            `\\(${q}<1\\) 用第二段，\\(f(${q})=${b}\\cdot${wrapIfNegative(q)}${cStr}=${fq}\\)。`
        );
      } else if (mode === 2) {
        // f(x) = { x+a  x>k; bx+c  x≤k }
        const a = randInt(1, 5),
          b = randInt(2, 4),
          c = randInt(-5, 5);
        const k = randInt(-2, 2);
        const m = randInt(1, 3);
        const p = k + m,
          q = k;
        const fp = p + a,
          fq = b * k + c;
        const aStr = formatSignedNumber(a);
        const cStr = formatSignedNumber(c);
        questions.push(
          `設 \\(f(x)=\\begin{cases}x${aStr}, & x>${k}\\\\ ${formatLinearExpr(b, c)}, & x\\le${k}\\end{cases}\\)，求 \\(f(${p})\\) 與 \\(f(${q})\\)。`
        );
        answers.push(
          `簡答：\\(f(${p})=${fp}\\)，\\(f(${q})=${fq}\\)。` +
            `過程：\\(${p}>${k}\\) 用第一段，\\(f(${p})=${p}${aStr}=${fp}\\)；` +
            `\\(${q}\\le${k}\\) 用第二段，\\(f(${q})=${b}\\cdot${wrapIfNegative(q)}${cStr}=${fq}\\)。`
        );
      } else if (mode === 3) {
        // f(x) = { x^2  x≥0; 2x+a  x<0 }，求 f(p) 和 f(q)
        const a = randInt(-5, 5);
        const p = randInt(1, 4),
          q = randInt(-4, -1);
        const fp = p * p,
          fq = 2 * q + a;
        const aStr = formatSignedNumber(a);
        questions.push(
          `設 \\(f(x)=\\begin{cases}x^2, & x\\ge0\\\\ 2x${aStr}, & x<0\\end{cases}\\)，求 \\(f(${p})\\) 與 \\(f(${q})\\)。`
        );
        answers.push(
          `簡答：\\(f(${p})=${fp}\\)，\\(f(${q})=${fq}\\)。` +
            `過程：\\(${p}\\ge0\\) 用第一段，\\(f(${p})=${p}^2=${fp}\\)；` +
            `\\(${q}<0\\) 用第二段，\\(f(${q})=2\\cdot${wrapIfNegative(q)}${aStr}=${fq}\\)。`
        );
      } else {
        // 三段函數 f(x) = { a  x>k2; bx+c  k1<x≤k2; d  x≤k1 }
        const a = randInt(5, 10),
          d = randInt(-5, 0);
        const b = randInt(1, 3),
          c = randInt(-3, 3);
        const k1 = randInt(-3, -1),
          k2 = randInt(1, 3);
        const p = k2 + 1,
          q0 = k1 + Math.floor((k2 - k1) / 2),
          r0 = k1 - 1;
        const fk2p1 = a,
          fmid = b * q0 + c,
          fk1m1 = d;
        const cStr = formatSignedNumber(c);
        questions.push(
          `設 \\(f(x)=\\begin{cases}${a}, & x>${k2}\\\\ ${formatLinearExpr(b, c)}, & ${k1}<x\\le${k2}\\\\ ${d}, & x\\le${k1}\\end{cases}\\)，` +
            `求 \\(f(${p})\\)、\\(f(${q0})\\) 與 \\(f(${r0})\\)。`
        );
        answers.push(
          `簡答：\\(f(${p})=${fk2p1}\\)，\\(f(${q0})=${fmid}\\)，\\(f(${r0})=${fk1m1}\\)。` +
            `過程：\\(${p}>${k2}\\) 得 \\(f(${p})=${a}\\)；` +
            `\\(${k1}<${q0}\\le${k2}\\) 得 \\(f(${q0})=${b}\\cdot${wrapIfNegative(q0)}${cStr}=${fmid}\\)；` +
            `\\(${r0}\\le${k1}\\) 得 \\(f(${r0})=${d}\\)。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // ── s1-3-2 新增：合成函數計算與反推 ────────────────────────────────
  function buildS132CompositeFunctionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        // 給 f(x)=ax+b, g(x)=x^2+c，求 f(g(m))
        const a = randInt(1, 3),
          b = randInt(-3, 3),
          c = randInt(-3, 3),
          m = randInt(-3, 3);
        const gm = m * m + c,
          fgm = a * gm + b;
        const bStr = formatSignedNumber(b);
        const cStr = formatSignedNumber(c);
        questions.push(`設 \\(f(x)=${formatLinearExpr(a, b)}\\)，\\(g(x)=x^2${cStr}\\)，求 \\(f(g(${m}))\\)。`);
        answers.push(
          `簡答：\\(${fgm}\\)。` +
            `過程：\\(g(${m})=${m}^2${cStr}=${gm}\\)，` +
            `\\(f(g(${m}))=f(${gm})=${a}\\cdot${wrapIfNegative(gm)}${bStr}=${fgm}\\)。`
        );
      } else if (mode === 1) {
        // 給 f(x)=ax+b，求 f(f(n))
        const a = randInt(2, 4),
          b = randInt(-3, 3),
          n = randInt(-2, 2);
        const fn = a * n + b,
          ffn = a * fn + b;
        const bStr = formatSignedNumber(b);
        questions.push(`設 \\(f(x)=${formatLinearExpr(a, b)}\\)，求 \\(f(f(${n}))\\)。`);
        answers.push(
          `簡答：\\(${ffn}\\)。` +
            `過程：\\(f(${n})=${a}\\cdot${wrapIfNegative(n)}${bStr}=${fn}\\)，` +
            `\\(f(f(${n}))=f(${fn})=${a}\\cdot${wrapIfNegative(fn)}${bStr}=${ffn}\\)。`
        );
      } else if (mode === 2) {
        // 已知 f(g(x))=ax+b 且 g(x)=x-k，求 f(x)
        // f(x) = ax+(b+ak)
        const a = randInt(1, 4),
          k = randInt(1, 3);
        const b = randInt(-4, 4);
        const q = b + a * k;
        const bStr = formatSignedNumber(b);
        const qStr = formatSignedNumber(q);
        questions.push(`已知 \\(f(g(x))=${formatLinearExpr(a, b)}\\) 且 \\(g(x)=x-${k}\\)，求 \\(f(x)\\)。`);
        answers.push(
          `簡答：\\(f(x)=${formatLinearExpr(a, q)}\\)。` +
            `過程：設 \\(f(x)=px+q\\)。因 \\(f(g(x))=f(x-${k})=p(x-${k})+q=px${formatSignedShiftedMonomial(-k, 'p', 1)}+q\\)，` +
            `比較係數得 \\(p=${a}\\)，\\(${formatSignedShiftedMonomial(-k, 'p', 1)}+q=${b}\\)，解得 \\(q=${q}\\)。`
        );
      } else if (mode === 3) {
        // 已知 g(f(x))=ax+b 且 f(x)=x+k，求 g(x)
        // g(x) = ax+(b-ak)
        const a = randInt(1, 4),
          k = randInt(1, 3);
        const b = randInt(-4, 4);
        const r = b - a * k;
        const bStr = formatSignedNumber(b);
        const rStr = formatSignedNumber(r);
        questions.push(`已知 \\(g(f(x))=${formatLinearExpr(a, b)}\\) 且 \\(f(x)=x+${k}\\)，求 \\(g(x)\\)。`);
        answers.push(
          `簡答：\\(g(x)=${formatLinearExpr(a, r)}\\)。` +
            `過程：設 \\(g(x)=px+q\\)。因 \\(g(f(x))=g(x+${k})=p(x+${k})+q=px${formatSignedShiftedMonomial(k, 'p', 1)}+q\\)，` +
            `比較係數得 \\(p=${a}\\)，\\(${formatShiftedMonomial(k, 'p', 1)}+q=${b}\\)，解得 \\(q=${r}\\)。`
        );
      } else {
        // 已知 f 為一次函數且 f(f(x))=a^2x+(a+1)b，求 f(x)=ax+b
        // f(f(x))=a^2*x+a*b+b=a^2*x+b(a+1)
        const a = randInt(2, 4),
          b = randInt(1, 4);
        const a2 = a * a,
          comp_const = b * (a + 1);
        const a2Str = a2 === 1 ? 'x' : `${a2}x`;
        const bStr = b >= 0 ? `+${b}` : `${b}`;
        questions.push(`設 \\(f(x)\\) 為斜率為正的一次函數，且 \\(f(f(x))=${a2}x+${comp_const}\\)，求 \\(f(x)\\)。`);
        answers.push(
          `簡答：\\(f(x)=${formatLinearExpr(a, b)}\\)。` +
            `過程：設 \\(f(x)=px+q\\)，則 \\(f(f(x))=p^2x+pq+q=p^2x+q(p+1)\\)。` +
            `比較得 \\(p^2=${a2}\\Rightarrow p=${a}\\)（取正），\\(q(p+1)=${comp_const}\\Rightarrow q=${b}\\)。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // ── s1-3-3 新增：絕對值不等式 ───────────────────────────────────────
  function buildS133AbsoluteValueInequalitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        // |x+a| < b → -b-a < x < b-a
        const a = randInt(-3, 3),
          b = randInt(2, 6);
        const lo = -b - a,
          hi = b - a;
        const aStr = formatSignedNumber(a);
        questions.push(`解不等式 \\(|x${aStr}|<${b}\\)。`);
        answers.push(
          `簡答：\\(${lo}<x<${hi}\\)。` +
            `過程：\\(|x${aStr}|<${b}\\) 等價於 \\(-${b}<x${aStr}<${b}\\)，` +
            `各減 \\(${a}\\) 得 \\(${lo}<x<${hi}\\)。`
        );
      } else if (mode === 1) {
        // |x-a| > b → x < a-b 或 x > a+b
        const a = randInt(-3, 3),
          b = randInt(1, 5);
        const lo = a - b,
          hi = a + b;
        const aStr = formatSignedNumber(-a);
        questions.push(`解不等式 \\(|x${aStr}|>${b}\\)。`);
        answers.push(
          `簡答：\\(x<${lo}\\) 或 \\(x>${hi}\\)。` +
            `過程：\\(|x${aStr}|>${b}\\) 等價於 \\(x${aStr}<-${b}\\) 或 \\(x${aStr}>${b}\\)，` +
            `移項得 \\(x<${lo}\\) 或 \\(x>${hi}\\)。`
        );
      } else if (mode === 2) {
        // |2x+a| ≤ b → (-b-a)/2 ≤ x ≤ (b-a)/2，取 a,b 使結果為整數
        const a = randInt(-3, 3) * 2,
          b = randInt(2, 5) * 2;
        const lo = (-b - a) / 2,
          hi = (b - a) / 2;
        const aStr = formatSignedNumber(a);
        questions.push(`解不等式 \\(|2x${aStr}|\\le${b}\\)。`);
        answers.push(
          `簡答：\\(${lo}\\le x\\le${hi}\\)。` +
            `過程：\\(-${b}\\le2x${aStr}\\le${b}\\)，` +
            `減 \\(${a}\\) 得 \\(${-b - a}\\le2x\\le${b - a}\\)，` +
            `除以 2 得 \\(${lo}\\le x\\le${hi}\\)。`
        );
      } else if (mode === 3) {
        // |2x-a| ≥ b → x ≤ (a-b)/2 或 x ≥ (a+b)/2，同樣取偶數
        const a = randInt(-2, 4) * 2,
          b = randInt(1, 4) * 2;
        const lo = (a - b) / 2,
          hi = (a + b) / 2;
        const aStr = formatSignedNumber(-a);
        questions.push(`解不等式 \\(|2x${aStr}|\\ge${b}\\)。`);
        answers.push(
          `簡答：\\(x\\le ${lo}\\) 或 \\(x\\ge${hi}\\)。` +
            `過程：\\(2x${aStr}\\le-${b}\\) 或 \\(2x${aStr}\\ge${b}\\)，` +
            `移項除以 2 得 \\(x\\le ${lo}\\) 或 \\(x\\ge${hi}\\)。`
        );
      } else {
        // |x+a| ≤ |x-b|，a,b≥0，a+b>0 → x ≤ (b-a)/2
        const a = randInt(0, 3) * 2,
          b = randInt(1, 4) * 2;
        const mid = (b - a) / 2;
        const aStr = a === 0 ? 'x' : `x+${a}`;
        const bStr = b === 0 ? 'x' : `x-${b}`;
        const leftSquare = formatPolynomialFromCoeffs([1, 2 * a, a * a]);
        const rightSquare = formatPolynomialFromCoeffs([1, -2 * b, b * b]);
        questions.push(`解不等式 \\(|${aStr}|\\le|${bStr}|\\)。`);
        answers.push(
          `簡答：\\(x\\le${mid}\\)。` +
            `過程：兩邊平方（均非負），\\((${aStr})^2\\le(${bStr})^2\\)，` +
            `展開得 \\(${leftSquare}\\le ${rightSquare}\\)，` +
            `化簡得 \\(${2 * (a + b)}x\\le${b * b - a * a}\\)，故 \\(x\\le ${mid}\\)。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // ── s1-3-3 新增：兩絕對值不等式 ────────────────────────────────────
  function buildS133DoubleAbsoluteInequalitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        // |x-a|+|x-b| ≤ c，a<b，c>b-a，解為 [(a+b-c)/2, (a+b+c)/2]
        const a = randInt(1, 3);
        const b = a + 2 * randInt(1, 3);
        const extra = 2 * randInt(1, 3);
        const c = b - a + extra;
        const lo = (a + b - c) / 2,
          hi = (a + b + c) / 2;
        questions.push(`解不等式 \\(|x-${a}|+|x-${b}|\\le${c}\\)。`);
        answers.push(
          `簡答：\\(${lo}\\le x\\le${hi}\\)。` +
            `過程：分三段討論。\\(x\\le${a}\\) 時，左式 \\(=${a}-x+${b}-x=${a + b}-2x\\le${c}\\)，得 \\(x\\ge${lo}\\)；` +
            `\\(${a}\\le x\\le${b}\\) 時，左式 \\(=x-${a}+${b}-x=${b - a}\\le${c}\\) 恆成立；` +
            `\\(x\\ge${b}\\) 時，左式 \\(=x-${a}+x-${b}=2x-${a + b}\\le${c}\\)，得 \\(x\\le${hi}\\)。` +
            `綜合得 \\(${lo}\\le x\\le${hi}\\)。`
        );
      } else if (mode === 1) {
        // |x-a|+|x-b| ≥ c，a<b，c>b-a，解為 x≤(a+b-c)/2 或 x≥(a+b+c)/2
        const a = randInt(1, 3);
        const b = a + 2 * randInt(1, 3);
        const extra = 2 * randInt(1, 3);
        const c = b - a + extra;
        const lo = (a + b - c) / 2,
          hi = (a + b + c) / 2;
        questions.push(`解不等式 \\(|x-${a}|+|x-${b}|\\ge${c}\\)。`);
        answers.push(
          `簡答：\\(x\\le${lo}\\) 或 \\(x\\ge${hi}\\)。` +
            `過程：分段討論。\\(x\\ge${b}\\) 時，\\(2x-${a + b}\\ge${c}\\) 得 \\(x\\ge${hi}\\)；` +
            `\\(${a}\\le x\\le${b}\\) 時，\\(${b - a}\\ge${c}\\) 不成立（因 \\(${b - a}<${c}\\)）；` +
            `\\(x\\le${a}\\) 時，\\(${a + b}-2x\\ge${c}\\) 得 \\(x\\le ${lo}\\)。`
        );
      } else if (mode === 2) {
        // |x-a| < |x-b|，a<b → x < (a+b)/2（點比較靠近 a）
        const a = randInt(1, 3);
        const diff = 2 * randInt(1, 4);
        const b = a + diff;
        const mid = (a + b) / 2;
        questions.push(`解不等式 \\(|x-${a}|<|x-${b}|\\)。`);
        answers.push(
          `簡答：\\(x<${mid}\\)。` +
            `過程：兩邊平方，\\((x-${a})^2<(x-${b})^2\\)，` +
            `展開得 \\(-${2 * a}x+${a * a}<-${2 * b}x+${b * b}\\)，` +
            `整理得 \\(${2 * (b - a)}x<${b * b - a * a}=${(b - a) * (b + a)}\\)，` +
            `故 \\(x<${mid}\\)。（幾何意義：\\(x\\) 到 \\(${a}\\) 的距離小於到 \\(${b}\\) 的距離，即 \\(x\\) 位於 \\(${a}\\) 與 \\(${b}\\) 的中點 \\(${mid}\\) 左側。）`
        );
      } else if (mode === 3) {
        // |x-a| > |x-b|，a<b → x > (a+b)/2（點比較靠近 b）
        const a = randInt(1, 3);
        const diff = 2 * randInt(1, 4);
        const b = a + diff;
        const mid = (a + b) / 2;
        questions.push(`解不等式 \\(|x-${a}|>|x-${b}|\\)。`);
        answers.push(
          `簡答：\\(x>${mid}\\)。` +
            `過程：兩邊平方，\\((x-${a})^2>(x-${b})^2\\)，` +
            `整理得 \\(${2 * (b - a)}x>${b * b - a * a}\\)，故 \\(x>${mid}\\)。` +
            `（幾何意義：\\(x\\) 位於中點 \\(${mid}\\) 右側。）`
        );
      } else {
        // |x+a|+|x-b| ≤ c，a>0，b>0，解為 [(b-a-c)/2, (b-a+c)/2]
        const a = randInt(1, 3);
        const b = randInt(1, 3);
        const extra = 2 * randInt(1, 3);
        const c = a + b + extra;
        const lo = (b - a - c) / 2,
          hi = (b - a + c) / 2;
        const aStr = `x+${a}`;
        const bStr = `x-${b}`;
        questions.push(`解不等式 \\(|${aStr}|+|${bStr}|\\le${c}\\)。`);
        answers.push(
          `簡答：\\(${lo}\\le x\\le${hi}\\)。` +
            `過程：改寫為 \\(|x-(-${a})|+|x-${b}|\\le${c}\\)，` +
            `兩定點為 \\(-${a}\\) 與 \\(${b}\\)，距離為 \\(${a + b}\\)，\\(c=${c}>${a + b}\\)，有解。` +
            `利用公式，解為 \\(\\frac{-${a}+${b}-${c}}{2}\\le x\\le\\frac{-${a}+${b}+${c}}{2}\\)，即 \\(${lo}\\le x\\le${hi}\\)。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS133QuadraticDiscriminantSolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const P = (c) => formatPolynomialFromCoeffs(c);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // (x-r1)(x-r2)>0 → x<r1 或 x>r2
        const r1 = randInt(-6, 2);
        const r2 = r1 + randInt(1, 6);
        const co = [1, -(r1 + r2), r1 * r2];
        questions.push(`解不等式 \\(${P(co)}>0\\)。`);
        answers.push(
          `簡答：\\(x<${r1}\\) 或 \\(x>${r2}\\)。過程：因式分解得 \\((x${r1 >= 0 ? '-' : '+'}${Math.abs(r1)})(x${r2 >= 0 ? '-' : '+'}${Math.abs(r2)})>0\\)，兩根為 ${r1},${r2}。開口向上，故解為兩根之外。`
        );
        continue;
      }

      if (variant === 1) {
        // (x-r)^2 ≤ 0 → 只有 x=r
        const r = randInt(-6, 6);
        const co = [1, -2 * r, r * r];
        questions.push(`解不等式 \\(${P(co)}\\le0\\)。`);
        answers.push(
          `簡答：\\(x=${r}\\)。過程：左式為完全平方 \\((x${r >= 0 ? '-' : '+'}${Math.abs(r)})^2\\ge0\\)，要 \\(\\le0\\) 只能等於 0，故 \\(x=${r}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // 判別式<0 且開口向上 → 恆成立
        const b = randInt(-5, 5);
        const c = Math.floor((b * b) / 4) + randInt(1, 6);
        const co = [1, b, c];
        questions.push(`解不等式 \\(${P(co)}>0\\)。`);
        answers.push(
          `簡答：所有實數 \\(x\\)。過程：判別式 \\(D=${b}^2-4\\times${c}=${b * b - 4 * c}<0\\) 且開口向上，圖形全在 \\(x\\) 軸上方，故對所有實數皆成立。`
        );
        continue;
      }

      if (variant === 3) {
        // 開口向下且判別式<0 → 無解
        const b = randInt(-5, 5);
        const c = Math.floor((b * b) / 4) + randInt(1, 6);
        const co = [-1, b, -c];
        questions.push(`解不等式 \\(${P(co)}>0\\)。`);
        answers.push(
          `簡答：無實數解。過程：乘以 \\(-1\\) 得 \\(x^2${-b >= 0 ? '+' : ''}${-b}x+${c}<0\\)，其判別式 \\(D=${b * b - 4 * c}<0\\) 且開口向上，函數恆正，故原不等式無解。`
        );
        continue;
      }

      // variant 4：計數整數解
      const r1 = randInt(-4, 3);
      const r2 = r1 + randInt(2, 6);
      const lo = -Math.floor(((r2 - r1) * (r2 - r1)) / 4);
      const hi = randInt(2, 12);
      let cnt = 0;
      for (let x = r1 - 20; x <= r2 + 20; x += 1) {
        const v = (x - r1) * (x - r2);
        if (v >= lo && v <= hi) cnt += 1;
      }
      const co4 = [1, -(r1 + r2), r1 * r2];
      questions.push(`求滿足 \\(${lo}\\le ${P(co4)}\\le${hi}\\) 的整數解共有幾個。`);
      answers.push(
        `簡答：${cnt} 個。過程：令 \\(g(x)=${P(co4)}=(x${r1 >= 0 ? '-' : '+'}${Math.abs(r1)})(x${r2 >= 0 ? '-' : '+'}${Math.abs(r2)})\\)，其最小值出現在 \\(x=\\frac{${r1}+${r2}}2\\)。逐一檢查整數點是否滿足 \\(${lo}\\le g(x)\\le${hi}\\)，合計 ${cnt} 個。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS133QuadraticAlwaysSignParameterSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 1) {
        // k x² + 2m x + k > 0 恆成立 → k>0 且 D=4m²-4k²<0 → k>|m|
        const m = randInt(1, 6);
        const sym = variant === 0 ? 'k' : 'a';
        const sign = variant === 0 ? '+' : '-';
        questions.push(
          variant === 0
            ? `若 \\(kx^2+${2 * m}x+k>0\\) 對所有實數 \\(x\\) 恆成立，求實數 \\(k\\) 的範圍。`
            : `已知二次函數 \\(f(x)=ax^2-${2 * m}x+a\\) 之值恆為正，求實數 \\(a\\) 的範圍。`
        );
        answers.push(
          `簡答：\\(${sym}>${m}\\)。過程：恆為正需開口向上（\\(${sym}>0\\)）且判別式小於 0。\\(D=(${sign}${2 * m})^2-4${sym}^2=${4 * m * m}-4${sym}^2<0\\)，得 \\(${sym}^2>${m * m}\\)，即 \\(|${sym}|>${m}\\)。與 \\(${sym}>0\\) 取交集，得 \\(${sym}>${m}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // x²+ax+(a+c)<0 無解 → D=a²-4a-4c≤0，取 c=k²-1 使根為整數
        const k = randInt(1, 5);
        const c = k * k - 1;
        const lo = 2 - 2 * k;
        const hi = 2 + 2 * k;
        questions.push(`若 \\(x^2+ax+(a+${c})<0\\) 沒有實數解，求 \\(a\\) 的範圍。`);
        answers.push(
          `簡答：\\(${lo}\\le a\\le${hi}\\)。過程：開口向上，無解表示圖形不低於 \\(x\\) 軸，即判別式 \\(D\\le0\\)。\\(D=a^2-4(a+${c})=a^2-4a-${4 * c}\\le0\\)，解 \\(a^2-4a-${4 * c}=0\\) 得 \\(a=2\\pm${2 * k}\\)，故 \\(${lo}\\le a\\le${hi}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        // -x²+4mx-1 恆在 y=2x-3m 下方 → -x²+(4m-2)x+(3m-1)<0 恆成立 → D<0
        const m = randInt(1, 4);
        questions.push(
          `設 \\(t\\) 為實數。若 \\(y=-x^2+${4 * m}tx-1\\) 的圖形恆在直線 \\(y=2x-${3 * m}t\\) 的下方，求 \\(t\\) 需滿足的判別式條件。`
        );
        answers.push(
          `簡答：\\((${4 * m}t-2)^2+4(${3 * m}t-1)<0\\)。過程：恆在下方表示 \\(-x^2+${4 * m}tx-1<2x-${3 * m}t\\) 對所有 \\(x\\) 成立，移項得 \\(-x^2+(${4 * m}t-2)x+(${3 * m}t-1)<0\\)。乘 \\(-1\\) 後開口向上，需判別式小於 0，即 \\((${4 * m}t-2)^2+4(${3 * m}t-1)<0\\)。`
        );
        continue;
      }

      // variant 4：分式恆 ≤1
      const c4 = randInt(1, 5);
      const d4 = c4 + randInt(1, 5);
      questions.push(
        `已知對任意實數 \\(x\\)，分式 \\(\\frac{x^2+kx+k}{x^2+${c4}x+${d4}}\\le1\\) 恆成立，求 \\(k\\) 的範圍。`
      );
      answers.push(
        `簡答：\\(k=${c4}\\)。過程：先確認分母恆正：判別式 \\(${c4}^2-4\\times${d4}=${c4 * c4 - 4 * d4}<0\\)，故分母恆正，可直接乘過去。不等式化為 \\(x^2+kx+k\\le x^2+${c4}x+${d4}\\)，即 \\((k-${c4})x+(k-${d4})\\le0\\) 對所有 \\(x\\) 成立。一次式恆 \\(\\le0\\) 需一次項係數為 0 且常數項 \\(\\le0\\)，故 \\(k=${c4}\\) 且 \\(${c4}-${d4}\\le0\\)（成立），所以 \\(k=${c4}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS133QuadraticInverseCoefficientSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const P = (c) => formatPolynomialFromCoeffs(c);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // ax²+Lx+b>0 解為 p<x<q（a<0）：L=-a(p+q)，b=a·pq
        const a = -randInt(1, 4);
        let p = randInt(-5, 2);
        let q = p + randInt(1, 5);
        for (let g = 0; p + q === 0 && g < 40; g += 1) {
          p = randInt(-5, 2);
          q = p + randInt(1, 5);
        }
        if (p + q === 0) {
          i -= 1;
          continue;
        }
        const L = -a * (p + q);
        const b = a * p * q;
        questions.push(
          `若不等式 \\(ax^2${L >= 0 ? '+' : ''}${L}x+b>0\\) 的解為 \\(${p}<x<${q}\\)，求 \\(a+b\\) 之值。`
        );
        answers.push(
          `簡答：${a + b}。過程：解為有界區間表示 \\(a<0\\)，且兩根為 ${p},${q}。由根與係數：\\(-\\frac{${L}}{a}=${p}+${q}=${p + q}\\) 得 \\(a=${a}\\)；\\(\\frac{b}{a}=${p}\\times${q}=${p * q}\\) 得 \\(b=${b}\\)。故 \\(a+b=${a + b}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        const a = -randInt(1, 4);
        let p = randInt(-5, 2);
        let q = p + randInt(1, 5);
        for (let g = 0; p * q === 0 && g < 40; g += 1) {
          p = randInt(-5, 2);
          q = p + randInt(1, 5);
        }
        if (p * q === 0) {
          i -= 1;
          continue;
        }
        const C = a * p * q;
        const b = -a * (p + q);
        questions.push(`已知 \\(ax^2+bx${C >= 0 ? '+' : ''}${C}>0\\) 的解為 \\(${p}<x<${q}\\)，求數對 \\((a,b)\\)。`);
        answers.push(
          `簡答：\\((a,b)=(${a},${b})\\)。過程：兩根為 ${p},${q} 且 \\(a<0\\)。由 \\(\\frac{${C}}{a}=${p}\\times${q}=${p * q}\\) 得 \\(a=${a}\\)；再由 \\(-\\frac{b}{a}=${p + q}\\) 得 \\(b=${b}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        const a = -randInt(1, 4);
        let p = randInt(-4, 2);
        let q = p + randInt(1, 5);
        for (let g = 0; p * q === 0 && g < 40; g += 1) {
          p = randInt(-4, 2);
          q = p + randInt(1, 5);
        }
        if (p * q === 0) {
          i -= 1;
          continue;
        }
        const co = [a, -a * (p + q), a * p * q];
        questions.push(
          `設 \\(f(x)=ax^2+bx+c\\)。若 \\(f(x)>0\\) 的解為 \\(${p}<x<${q}\\)，且 \\(f(0)=${a * p * q}\\)，求 \\(f(x)\\)。`
        );
        answers.push(
          `簡答：\\(f(x)=${P(co)}\\)。過程：由解集知 \\(a<0\\) 且兩根為 ${p},${q}，設 \\(f(x)=a(x${p >= 0 ? '-' : '+'}${Math.abs(p)})(x${q >= 0 ? '-' : '+'}${Math.abs(q)})\\)。代入 \\(f(0)=a\\times${p * q}=${a * p * q}\\) 得 \\(a=${a}\\)，展開得 \\(${P(co)}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        const p = randInt(-5, 1);
        const q = p + randInt(2, 6);
        questions.push(`已知 \\(ax^2+bx+c>0\\) 的解為 \\(${p}<x<${q}\\)，求 \\(ax^2-bx+c<0\\) 的解。`);
        answers.push(
          `簡答：\\(x<${-q}\\) 或 \\(x>${-p}\\)。過程：把 \\(x\\) 換成 \\(-x\\)，\\(a(-x)^2+b(-x)+c=ax^2-bx+c\\)。原式 \\(>0\\) 的解為 \\(${p}<x<${q}\\)，故 \\(ax^2-bx+c>0\\) 的解為 \\(${-q}<x<${-p}\\)。取其補集（且不含端點）即為 \\(<0\\) 的解：\\(x<${-q}\\) 或 \\(x>${-p}\\)。`
        );
        continue;
      }

      // variant 4：|ax+1|≤b 的解為 p≤x≤q
      const a4 = [1, 2][randInt(0, 1)];
      let b4 = randInt(2, 9);
      if (a4 === 2 && b4 % 2 === 0) b4 += 1;
      const p4 = (-b4 - 1) / a4;
      const q4 = (b4 - 1) / a4;
      questions.push(`若 \\(|ax+1|\\le b\\) 的解為 \\(${p4}\\le x\\le${q4}\\)，反求實數 \\(a,b\\)（取 \\(a>0\\)）。`);
      answers.push(
        `簡答：\\(a=${a4},b=${b4}\\)。過程：\\(|ax+1|\\le b\\)（\\(a>0\\)）等價於 \\(\\frac{-b-1}{a}\\le x\\le\\frac{b-1}{a}\\)。比較端點：區間長度 \\(\\frac{2b}{a}=${q4 - p4}\\)、中點 \\(-\\frac1a=${(p4 + q4) / 2}\\)。解得 \\(a=${a4}\\)、\\(b=${b4}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS133QuadraticInequalityFromSolutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const closed = i % 2 === 1;
      const inside = i % 4 < 2;
      let r1 = randInt(-5, 3);
      let r2 = randInt(r1 + 2, r1 + 8);
      if (r1 === 0 && r2 === 0) r2 += 2;
      const lead = inside ? -randInt(1, 4) : randInt(1, 4);
      const b = -lead * (r1 + r2);
      const c = lead * r1 * r2;
      const relation = closed ? '\\ge0' : '>0';
      const interval = inside
        ? `${r1}${closed ? '\\le ' : '<'}x${closed ? '\\le' : '<'}${r2}`
        : `x${closed ? '\\le' : '<'}${r1}\\text{ 或 }x${closed ? '\\ge' : '>'}${r2}`;
      const poly = formatPolynomialFromCoeffs([lead, b, c]);
      const f1 = `(${formatS131LinearFactor(r1)})`;
      const f2 = `(${formatS131LinearFactor(r2)})`;

      questions.push(
        `已知二次不等式 \\(${formatTerm(lead, 'x^2')}+mx+n${relation}\\) 的解為 \\(${interval}\\)，求 \\((m,n)\\)。`
      );
      answers.push(
        `簡答：\\((m,n)=(${b},${c})\\)。過程：解的端點就是兩根 \\(${r1}\\)、\\(${r2}\\)，且首項係數為 \\(${lead}\\)，所以二次式為 \\(${formatTerm(lead, `${f1}${f2}`)}=${poly}\\)。因此 \\(m=${b},n=${c}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS133QuadraticSubstitutionSolutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const fr = (n, d) => {
      const f = makeFraction(n, d);
      return formatFraction(f.num, f.den);
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const p = randInt(-6, 1);
      const q = p + randInt(2, 7);

      if (variant === 0) {
        // f(x)>0 解 p<x<q → f(2x)<0：2x 在區間外
        questions.push(`設 \\(f(x)>0\\) 的解為 \\(${p}<x<${q}\\)，求 \\(f(2x)<0\\) 的解。`);
        answers.push(
          `簡答：\\(x<${fr(p, 2)}\\) 或 \\(x>${fr(q, 2)}\\)。過程：\\(f(t)<0\\) 的解為 \\(t<${p}\\) 或 \\(t>${q}\\)。令 \\(t=2x\\)，得 \\(2x<${p}\\) 或 \\(2x>${q}\\)，即 \\(x<${fr(p, 2)}\\) 或 \\(x>${fr(q, 2)}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        const s = randInt(1, 4);
        questions.push(`若 \\(f(x)=-x^2+ax+b>0\\) 的解是 \\(${p}<x<${q}\\)，求 \\(f(x-${s})<0\\) 的解。`);
        answers.push(
          `簡答：\\(x<${p + s}\\) 或 \\(x>${q + s}\\)。過程：\\(f(t)<0\\) 的解為 \\(t<${p}\\) 或 \\(t>${q}\\)。令 \\(t=x-${s}\\)，得 \\(x-${s}<${p}\\) 或 \\(x-${s}>${q}\\)，即 \\(x<${p + s}\\) 或 \\(x>${q + s}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        const k = randInt(2, 4);
        const s = randInt(1, 4);
        questions.push(
          `設二次函數 \\(f(x)\\) 滿足 \\(f(x)\\ge0\\) 的解為 \\(${p}\\le x\\le${q}\\)，求 \\(f(${k}x-${s})\\ge0\\) 的解。`
        );
        answers.push(
          `簡答：\\(${fr(p + s, k)}\\le x\\le${fr(q + s, k)}\\)。過程：令 \\(t=${k}x-${s}\\)，條件為 \\(${p}\\le t\\le${q}\\)，即 \\(${p}\\le ${k}x-${s}\\le${q}\\)。三邊加 ${s} 再除以 ${k}，得 \\(${fr(p + s, k)}\\le x\\le${fr(q + s, k)}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        // f(kx-s)<0 解為 A<x<B → f(x)<0 解為 kA-s < x < kB-s
        const k = randInt(2, 4);
        const s = randInt(1, 4);
        const A = randInt(1, 5);
        const B = A + randInt(1, 5);
        questions.push(`已知 \\(f(${k}x-${s})<0\\) 的解為 \\(${A}<x<${B}\\)，求 \\(f(x)<0\\) 的解。`);
        answers.push(
          `簡答：\\(${k * A - s}<x<${k * B - s}\\)。過程：令 \\(t=${k}x-${s}\\)。當 \\(x\\) 由 ${A} 變到 ${B} 時，\\(t\\) 由 \\(${k}\\times${A}-${s}=${k * A - s}\\) 變到 \\(${k}\\times${B}-${s}=${k * B - s}\\)。故 \\(f(t)<0\\) 的解為 \\(${k * A - s}<t<${k * B - s}\\)。`
        );
        continue;
      }

      // variant 4：f(x)≤0 解 p≤x≤q → f(x/2)>0
      questions.push(`若 \\(f(x)\\le0\\) 的解為 \\(${p}\\le x\\le${q}\\)，求 \\(f(\\frac{x}{2})>0\\) 的解。`);
      answers.push(
        `簡答：\\(x<${2 * p}\\) 或 \\(x>${2 * q}\\)。過程：\\(f(t)>0\\) 的解為 \\(t<${p}\\) 或 \\(t>${q}\\)。令 \\(t=\\frac{x}{2}\\)，得 \\(\\frac{x}{2}<${p}\\) 或 \\(\\frac{x}{2}>${q}\\)，即 \\(x<${2 * p}\\) 或 \\(x>${2 * q}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS133QuadraticAppliedSubstitutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const fr = (n, d) => {
      const f = makeFraction(n, d);
      return formatFraction(f.num, f.den);
    };
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        // A·4^x - S·2^x + P > 0，令 t=2^x：A t^2 - S t + P，兩根 2^r1,2^r2
        const r1 = randInt(0, 2);
        const r2 = r1 + randInt(1, 3);
        const t1 = 2 ** r1;
        const t2 = 2 ** r2;
        // (t-t1)(t-t2) > 0 → t<t1 或 t>t2 → x<r1 或 x>r2（因 2^x 遞增）
        const A = 1;
        const S = t1 + t2;
        const P = t1 * t2;
        questions.push(`解指數不等式 \\(4^x-${S}\\cdot2^x+${P}>0\\)。`);
        answers.push(
          `簡答：\\(x<${r1}\\) 或 \\(x>${r2}\\)。過程：令 \\(t=2^x>0\\)，不等式為 \\(t^2-${S}t+${P}>0\\)，即 \\((t-${t1})(t-${t2})>0\\)，得 \\(t<${t1}\\) 或 \\(t>${t2}\\)。因 \\(2^x\\) 遞增，\\(2^x<${t1}\\Rightarrow x<${r1}\\)、\\(2^x>${t2}\\Rightarrow x>${r2}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        const r1 = randInt(0, 2);
        const r2 = r1 + randInt(1, 3);
        const t1 = 2 ** r1;
        const t2 = 2 ** r2;
        const S = t1 + t2;
        const P = t1 * t2;
        questions.push(`求滿足 \\(4^x-${S}\\cdot2^x+${P}\\le0\\) 的 \\(x\\) 範圍。`);
        answers.push(
          `簡答：\\(${r1}\\le x\\le${r2}\\)。過程：令 \\(t=2^x\\)，得 \\((t-${t1})(t-${t2})\\le0\\)，即 \\(${t1}\\le t\\le${t2}\\)。取對數（\\(2^x\\) 遞增）得 \\(${r1}\\le x\\le${r2}\\)。`
        );
        continue;
      }

      // variant 2、4：池塘小路面積介於 A1,A2 → x 範圍
      const L = randInt(5, 9);
      const W = randInt(3, L - 1);
      // 路面積 = (L+2x)(W+2x) - L·W = 4x^2 + 2(L+W)x，介於 A1,A2
      // 取 x 的兩個整數界 x1<x2，A1=area(x1), A2=area(x2)
      const x1 = randInt(1, 2);
      const x2 = x1 + randInt(1, 2);
      const area = (x) => 4 * x * x + 2 * (L + W) * x;
      const A1 = area(x1);
      const A2 = area(x2);
      questions.push(
        `長 ${L}、寬 ${W} 的池塘外圍鋪等寬 \\(x\\) 的小路。若路面總面積介於 ${A1} 與 ${A2} 之間，求 \\(x\\) 範圍。`
      );
      answers.push(
        `簡答：\\(${x1}\\le x\\le${x2}\\)。過程：路面積 \\(=(${L}+2x)(${W}+2x)-${L}\\times${W}=4x^2+${2 * (L + W)}x\\)。令 \\(${A1}\\le 4x^2+${2 * (L + W)}x\\le${A2}\\)，解得 \\(${x1}\\le x\\le${x2}\\)（\\(x>0\\)）。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS133QuadraticInequalityCoreFiveSubtypeMixedSet(count) {
    const banks = [
      buildS133QuadraticDiscriminantSolveSet,
      buildS133QuadraticAlwaysSignParameterSet,
      buildS133QuadraticInverseCoefficientSet,
      buildS133QuadraticSubstitutionSolutionSet,
      buildS133QuadraticAppliedSubstitutionSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS133HighDegreeSignInequalitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const Xm = (r) => (r === 0 ? 'x' : `x${r > 0 ? '-' : '+'}${Math.abs(r)}`);
    const fac = (r, e) => (e === 1 ? `(${Xm(r)})` : `(${Xm(r)})^{${e}}`);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      // 相異根與指數
      const r1 = randInt(-5, -1);
      const r2 = r1 + randInt(1, 3);
      const r3 = r2 + randInt(1, 3);
      const roots = [r1, r2, r3];
      const e = [randInt(1, 4), randInt(1, 4), randInt(1, 4)];
      const withSquare = variant === 1 || variant === 3; // 含恆正二次因式
      const le = variant === 0; // ≤0；其餘用 >0

      // 各區間符號：最右為 +，往左每過奇次根變號
      const parity = e.map((v) => v % 2);
      const signs = [1];
      for (let k = 2; k >= 0; k -= 1) signs.unshift(signs[0] * (parity[k] ? -1 : 1));
      const bnd = [-Infinity, r1, r2, r3, Infinity];
      const wantNeg = le;
      const ineq = le ? '\\le' : '<';
      const parts = [];
      for (let k = 0; k < 4; k += 1) {
        const s = signs[k];
        if ((wantNeg && s < 0) || (!wantNeg && s > 0)) {
          const lo = bnd[k];
          const hi = bnd[k + 1];
          if (lo === -Infinity) parts.push(`x ${ineq} ${hi}`);
          else if (hi === Infinity) parts.push(`x ${le ? '\\ge' : '>'} ${lo}`);
          else parts.push(`${lo} ${ineq} x ${ineq} ${hi}`);
        }
      }
      // ≤0 時，偶次根為孤立零點解（若不在任何負區間內）
      let isoText = '';
      if (le) {
        const evenRoots = roots.filter((_, idx) => parity[idx] === 0);
        // 偶次根兩側同號；若同號為正，則該點為孤立解
        const iso = evenRoots.filter((r) => {
          const idx = roots.indexOf(r);
          return signs[idx] > 0; // 左區間為正 ⇒ 兩側皆正 ⇒ 孤立
        });
        if (iso.length) isoText = `，以及孤立點 \\(x=${iso.join(',')}\\)`;
      }
      const factorText = withSquare
        ? `(x^2+x+3)${fac(r2, e[1])}${fac(r3, e[2])}`
        : `${fac(r1, e[0])}${fac(r2, e[1])}${fac(r3, e[2])}`;

      if (withSquare) {
        // 恆正二次因式，不影響符號；只看 (x-r2)^e2 (x-r3)^e3，>0
        const p2 = e[1] % 2;
        const p3 = e[2] % 2;
        const sR = 1;
        const sM = sR * (p3 ? -1 : 1);
        const sL = sM * (p2 ? -1 : 1);
        const parts2 = [];
        if (sL > 0) parts2.push(`x<${r2}`);
        if (sM > 0) parts2.push(`${r2}<x<${r3}`);
        if (sR > 0) parts2.push(`x>${r3}`);
        questions.push(`解不等式 \\(${factorText}>0\\)。`);
        answers.push(
          `簡答：\\(${parts2.join(' 或 ') || '無解'}\\)。過程：\\(x^2+x+3\\) 的判別式 \\(1-12<0\\)、開口向上，恆正，不影響符號。分析 \\(${fac(r2, e[1])}${fac(r3, e[2])}\\)：奇次因式過根變號、偶次不變號，由最右區間為正往左推，取正的區間即為解。`
        );
        continue;
      }

      questions.push(`解不等式 \\(${factorText}${le ? '\\le 0' : '>0'}\\)。`);
      answers.push(
        `簡答：\\(${parts.join(' 或 ') || '（僅孤立零點）'}\\)${isoText}。過程：相異根為 \\(${r1},${r2},${r3}\\)，指數 \\(${e.join(',')}\\)（奇偶：\\(${parity.map((p) => (p ? '奇' : '偶')).join(',')}\\)）。奇次因式過根變號、偶次不變號；由最右區間（\\(x>${r3}\\)）為正往左推得各區間符號，取${le ? '負（含 0）' : '正'}者即為解。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS133RationalInequalitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const Xm = (r) => `x${r > 0 ? '-' : '+'}${Math.abs(r)}`;
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        // (x-p)/(x-q) > 0 或 < 0：解為兩臨界點外/內（開區間，排除 q）
        const p = randInt(-4, 2);
        const q = p + randInt(1, 5);
        const gt = variant === 0;
        const lo = Math.min(p, q);
        const hi = Math.max(p, q);
        questions.push(`解分式不等式 \\(\\frac{${Xm(p)}}{${Xm(q)}}${gt ? '>' : '<'}0\\)。`);
        answers.push(
          gt
            ? `簡答：\\(x<${lo}\\) 或 \\(x>${hi}\\)。過程：分式 \\(>0\\) 表示分子分母同號。臨界點 \\(x=${p}\\)（分子零點）與 \\(x=${q}\\)（分母零點，需排除）。以數線分區檢驗，同號區間為 \\(x<${lo}\\) 或 \\(x>${hi}\\)。`
            : `簡答：\\(${lo}<x<${hi}\\)。過程：分式 \\(<0\\) 表示分子分母異號，介於兩臨界點之間，即 \\(${lo}<x<${hi}\\)（\\(x=${q}\\) 需排除，但不在此開區間端點）。`
        );
        continue;
      }

      if (variant === 1) {
        // (x-p)/(x-q) < c → 化為一側後求解
        const p = randInt(-3, 3);
        const q = pickNonZero(-4, 4);
        const c = pickNonZero(-3, 3);
        // (x-p)/(x-q) - c < 0 → [(1-c)x + (cq-p)]/(x-q) < 0
        const a = 1 - c;
        const b = c * q - p;
        // 臨界點：分子零點 x = -b/a（若 a≠0），分母零點 x=q
        if (a === 0) {
          i -= 1;
          continue;
        }
        const root = makeFraction(-b, a);
        const rv = root.num / root.den;
        const crit = [rv, q].sort((x, y) => x - y);
        // 分式 (a x + b)/(x-q) < 0：領導比 a/1 → 視 a 正負決定
        // 直接以取樣點判斷
        const f = (x) => (a * x + b) / (x - q);
        const parts = [];
        const pts = [crit[0] - 1, (crit[0] + crit[1]) / 2, crit[1] + 1];
        const lo = crit[0];
        const hi = crit[1];
        const loT =
          root.den === 1 && crit[0] === rv
            ? `${root.num}`
            : crit[0] === q
              ? `${q}`
              : formatFraction(root.num, root.den);
        // 左區間
        if (f(pts[0]) < 0) parts.push(`x<${crit[0] === rv ? formatFraction(root.num, root.den) : q}`);
        if (f(pts[1]) < 0)
          parts.push(
            `${crit[0] === rv ? formatFraction(root.num, root.den) : q}<x<${crit[1] === rv ? formatFraction(root.num, root.den) : q}`
          );
        if (f(pts[2]) < 0) parts.push(`x>${crit[1] === rv ? formatFraction(root.num, root.den) : q}`);
        questions.push(`解分式不等式 \\(\\frac{${Xm(p)}}{${Xm(q)}}<${c}\\)。`);
        answers.push(
          `簡答：\\(${parts.join(' 或 ') || '無解'}\\)。過程：移項通分得 \\(\\frac{${a === 1 ? '' : a === -1 ? '-' : a}x${b >= 0 ? '+' : '-'}${Math.abs(b)}}{${Xm(q)}}<0\\)。臨界點為 \\(x=${formatFraction(root.num, root.den)}\\)（分子）與 \\(x=${q}\\)（分母，排除）。分區檢驗符號取負值區間即為解。`
        );
        continue;
      }

      // variant 2、4：帶重根的分式，注意定義域
      const p = pickNonZero(-4, 4);
      const q = pickNonZero(-4, 4);
      if (p === q) {
        i -= 1;
        continue;
      }
      questions.push(`解分式不等式 \\(\\frac{(${Xm(p)})^2(${Xm(q)})}{${Xm(p)}}>0\\)，並注意定義域。`);
      const lo = Math.min(p, q);
      const hi = Math.max(p, q);
      // p 是否落在解區間內（需另外排除）
      const pInSol = p < lo || p > hi;
      answers.push(
        `簡答：\\(x<${lo}\\) 或 \\(x>${hi}\\)${pInSol ? `（且 \\(x\\ne${p}\\)）` : ''}。過程：定義域需 \\(x\\ne${p}\\)。在定義域內約去 \\(${Xm(p)}\\)，原式化為 \\((${Xm(p)})(${Xm(q)})>0\\)，兩根為 \\(${p},${q}\\)，開口向上，解為 \\(x<${lo}\\) 或 \\(x>${hi}\\)${pInSol ? `，再排除 \\(x=${p}\\)` : `（\\(x=${p}\\) 本就不在此開區間內）`}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS133SameSolutionTransformSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;
      const a = randInt(-5, 1);
      const b = a + randInt(3, 7);
      const fa = formatS131LinearFactor(a);
      const fb = formatS131LinearFactor(b);

      if (type === 0) {
        const c = i % 2 === 0 ? a - randInt(1, 3) : b + randInt(1, 3);
        const fc = formatS131LinearFactor(c);
        questions.push(
          `解不等式 \\((${fa})(${fb})(${fc})^2\\le0\\)，並說明它和 \\((${fa})(${fb})\\le0\\) 是否有相同解集。`
        );
        answers.push(
          `簡答：\\([${a},${b}]\\cup\\{${c}\\}\\)，不相同。過程：平方因式 \\((${fc})^2\\ge0\\)，一般不改變正負號，但在 \\(x=${c}\\) 時會讓整體等於 0。原本 \\((${fa})(${fb})\\le0\\) 的解為 \\([${a},${b}]\\)，此題平方因式的零點在區間外，會額外多出 \\(x=${c}\\)。`
        );
        continue;
      }

      if (type === 1) {
        const c = a + randInt(1, b - a - 1);
        const fc = formatS131LinearFactor(c);
        questions.push(`解不等式 \\((${fa})(${fb})(${fc})^2<0\\)。`);
        answers.push(
          `簡答：\\((${a},${c})\\cup(${c},${b})\\)。過程：\\((${fc})^2\\) 在 \\(x\\ne${c}\\) 時為正，不改變正負號；但嚴格小於 0 不能取使乘積為 0 的點。\\((${fa})(${fb})<0\\) 原本是 \\((${a},${b})\\)，再排除 \\(x=${c}\\)，得到答案。`
        );
        continue;
      }

      if (type === 2) {
        const h = randInt(-3, 3);
        const d = randInt(1, 5);
        const positive = formatPolynomialFromCoeffs([1, -2 * h, h * h + d]);
        const hBase = formatS131ShiftBase(h);
        questions.push(`解不等式 \\((${fa})(${fb})(${positive})\\ge0\\)。`);
        answers.push(
          `簡答：\\((-\\infty,${a}]\\cup[${b},\\infty)\\)。過程：\\(${positive}=${hBase}^2+${d}\\)，對所有實數都大於 0，所以不改變不等式正負號。只需解 \\((${fa})(${fb})\\ge 0\\)，得到 \\(x\\le ${a}\\) 或 \\(x\\ge${b}\\)。`
        );
        continue;
      }

      if (type === 3) {
        const d = randInt(1, 6);
        questions.push(`解不等式 \\(-(x^2+${d})(${fa})(${fb})\\ge0\\)。`);
        answers.push(
          `簡答：\\([${a},${b}]\\)。過程：\\(x^2+${d}\\) 恆正，所以 \\(-(x^2+${d})\\) 恆負。兩邊同除以恆負量時不等號方向要改變，等價於 \\((${fa})(${fb})\\le0\\)，解為 \\([${a},${b}]\\)。`
        );
        continue;
      }

      questions.push(`解分式不等式 \\(\\frac{${fa}}{${fb}}\\ge0\\)，並比較它與 \\((${fa})(${fb})\\ge0\\) 的差異。`);
      answers.push(
        `簡答：\\((-\\infty,${a}]\\cup(${b},\\infty)\\)。過程：分式與乘積判號的分界點同為 ${a}、${b}，但 \\(x=${b}\\) 會使分母為 0，必須排除。若只解 \\((${fa})(${fb})\\ge0\\)，會錯把 \\(x=${b}\\) 包進去。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS133AdvancedAlwaysSignSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        const m = randInt(1, 6);
        questions.push(`若對所有實數 \\(x\\)，二次式 \\(kx^2+${2 * m}x+k\\) 的值恆為正，求 \\(k\\) 的範圍。`);
        answers.push(
          `簡答：\\(k>${m}\\)。過程：恆為正需 \\(k>0\\)（開口向上）且判別式 \\((${2 * m})^2-4k^2<0\\)，得 \\(k^2>${m * m}\\)，即 \\(|k|>${m}\\)。與 \\(k>0\\) 取交集得 \\(k>${m}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // (a^2-t^2)x^2+(a-t)x+1>0 恆成立 → a=t（退化為1>0）或 a>t 或 a<-5t/3
        const t = randInt(1, 3);
        questions.push(`已知 \\((a^2-${t * t})x^2+(a-${t})x+1>0\\) 對任意實數 \\(x\\) 恆成立，求 \\(a\\) 的範圍。`);
        answers.push(
          `簡答：\\(a>${t}\\) 或 \\(a<-${formatFraction(5 * t, 3)}\\)（另含退化情形 \\(a=${t}\\)）。過程：若 \\(a=${t}\\)，式子為 \\(1>0\\) 恆成立。若 \\(a\\ne${t}\\)，需 \\(a^2-${t * t}>0\\) 且判別式 \\((a-${t})^2-4(a^2-${t * t})<0\\)。化簡判別式條件為 \\((a-${t})(3a+${5 * t})>0\\)，即 \\(a>${t}\\) 或 \\(a<-${formatFraction(5 * t, 3)}\\)；與 \\(a^2-${t * t}>0\\) 取交集後結果不變。`
        );
        continue;
      }

      // variant 2、4：(a+p)x^2 - qx + a 恆正
      const p = randInt(1, 4);
      const q = randInt(2, 5);
      // (a+p)>0 且 D=q^2-4a(a+p)<0 → 4a^2+4pa-q^2>0
      questions.push(`設 \\(f(x)=(a+${p})x^2-${q}x+a\\) 恆正，求實數 \\(a\\) 需滿足的條件（以判別式表示）。`);
      answers.push(
        `簡答：\\(a>-${p}\\) 且 \\(4a^2+${4 * p}a-${q * q}>0\\)。過程：恆正需開口向上 \\(a+${p}>0\\)，即 \\(a>-${p}\\)；且判別式 \\((-${q})^2-4a(a+${p})<0\\)，展開得 \\(4a^2+${4 * p}a-${q * q}>0\\)。同時滿足即為所求。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS133AdvancedInverseProblemSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0 || variant === 3) {
        // ax^2+Lx+b>0 解為 p<x<q（a<0）：L=-a(p+q)，b=a·pq
        const a = -randInt(1, 4);
        let p = randInt(-4, 2);
        let q = p + randInt(1, 5);
        for (let gg = 0; p + q === 0 && gg < 30; gg += 1) {
          p = randInt(-4, 2);
          q = p + randInt(1, 5);
        }
        if (p + q === 0) {
          i -= 1;
          continue;
        }
        const L = -a * (p + q);
        const b = a * p * q;
        questions.push(
          `若不等式 \\(ax^2${L >= 0 ? '+' : '-'}${Math.abs(L)}x+b>0\\) 的解為 \\(${p}<x<${q}\\)，求 \\(a+b\\)。`
        );
        answers.push(
          `簡答：${a + b}。過程：解為有界區間 ⇒ \\(a<0\\)、兩根 ${p},${q}。由 \\(-\\frac{${L}}{a}=${p + q}\\) 得 \\(a=${a}\\)；\\(\\frac{b}{a}=${p * q}\\) 得 \\(b=${b}\\)。故 \\(a+b=${a + b}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // ax^2+bx+c>0 解 p<x<q → 2ax^2-bx+? 型的解（用對稱代換）
        const p = randInt(-4, 0);
        const q = p + randInt(2, 5);
        questions.push(`已知二次不等式 \\(ax^2+bx+c>0\\) 的解為 \\(${p}<x<${q}\\)，求 \\(ax^2-bx+c<0\\) 的解。`);
        answers.push(
          `簡答：\\(x<${-q}\\) 或 \\(x>${-p}\\)。過程：把 \\(x\\) 換成 \\(-x\\)，\\(ax^2-bx+c\\) 對應原式在 \\(-x\\) 的值。原式 \\(>0\\) 的解為 \\(${p}<x<${q}\\)，故 \\(ax^2-bx+c>0\\) 的解為 \\(${-q}<x<${-p}\\)，其 \\(<0\\) 的解為補集 \\(x<${-q}\\) 或 \\(x>${-p}\\)。`
        );
        continue;
      }

      // variant 2、4：f(x)>0 解 p<x<q → f(kx-s)<0
      const p = randInt(-3, 1);
      const q = p + randInt(2, 5);
      const k = randInt(2, 4);
      const s = randInt(1, 5);
      const A = makeFraction(p + s, k);
      const B = makeFraction(q + s, k);
      questions.push(
        `設 \\(f(x)\\) 為二次函數，若 \\(f(x)>0\\) 的解是 \\(${p}<x<${q}\\)，求 \\(f(${k}x-${s})<0\\) 的解。`
      );
      answers.push(
        `簡答：\\(x<${formatFraction(A.num, A.den)}\\) 或 \\(x>${formatFraction(B.num, B.den)}\\)。過程：\\(f(t)<0\\) 的解為 \\(t<${p}\\) 或 \\(t>${q}\\)。令 \\(t=${k}x-${s}\\)：由 \\(${k}x-${s}<${p}\\) 得 \\(x<${formatFraction(A.num, A.den)}\\)；由 \\(${k}x-${s}>${q}\\) 得 \\(x>${formatFraction(B.num, B.den)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS133GeometricAppliedInequalitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        // 邊 x, x+d, x+2d 鈍角三角形（最大邊 x+2d 對鈍角）：
        // 三角形不等式 x+(x+d)>(x+2d) → x>d；鈍角 x^2+(x+d)^2<(x+2d)^2 → x^2-2dx-3d^2<0 → x<3d
        const d = randInt(1, 4);
        questions.push(`用長為 \\(x,x+${d},x+${2 * d}\\) 的三條線段圍成一鈍角三角形，求 \\(x\\) 的範圍。`);
        answers.push(
          `簡答：\\(${d}<x<${3 * d}\\)。過程：最長邊為 \\(x+${2 * d}\\)。成三角形需 \\(x+(x+${d})>x+${2 * d}\\)，得 \\(x>${d}\\)。鈍角（最大角對最長邊）需 \\(x^2+(x+${d})^2<(x+${2 * d})^2\\)，化簡 \\(x^2-${2 * d}x-${3 * d * d}<0\\)，即 \\((x-${3 * d})(x+${d})<0\\)，得 \\(x<${3 * d}\\)。合併為 \\(${d}<x<${3 * d}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        // 路面積 (L+2x)(W+2x)-LW 介於 A1,A2
        const L = randInt(5, 9);
        const W = randInt(3, L - 1);
        const x1 = randInt(1, 2);
        const x2 = x1 + randInt(1, 2);
        const area = (x) => 4 * x * x + 2 * (L + W) * x;
        const A1 = area(x1);
        const A2 = area(x2);
        questions.push(
          `長方形池塘外圍長 ${L}、寬 ${W}，外圈鋪等寬 \\(x\\) 的小路。若路面總面積介於 ${A1} 與 ${A2} 之間，求 \\(x\\) 的範圍。`
        );
        answers.push(
          `簡答：\\(${x1}\\le x\\le${x2}\\)。過程：路面積 \\(=(${L}+2x)(${W}+2x)-${L * W}=4x^2+${2 * (L + W)}x\\)。令 \\(${A1}\\le4x^2+${2 * (L + W)}x\\le${A2}\\)，解得 \\(${x1}\\le x\\le${x2}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // y=vt-gt^2 ≥ H；取 v,g 使根為整數。用 y=v t - (v/(t1+t2))... 直接設兩根 t1<t2
        const t1 = randInt(1, 3);
        const t2 = t1 + randInt(2, 4);
        const g = 5; // 近似
        // y = g(t1+t2) t - g t^2 ≥ g t1 t2 ... 設 y=a t - b t^2，≥H 的解為 t1≤t≤t2
        // a=b(t1+t2), H=b t1 t2, b=g
        const b = g;
        const a = b * (t1 + t2);
        const H = b * t1 * t2;
        questions.push(`已知垂直上拋高度為 \\(y=${a}t-${b}t^2\\)（公尺）。求高度不低於 ${H} 公尺的時間長度。`);
        answers.push(
          `簡答：${t2 - t1} 秒。過程：\\(y\\ge${H}\\) 即 \\(${a}t-${b}t^2\\ge${H}\\)，整理 \\(${b}t^2-${a}t+${H}\\le0\\)，因式分解 \\(${b}(t-${t1})(t-${t2})\\le0\\)，得 \\(${t1}\\le t\\le${t2}\\)，時間長度為 \\(${t2}-${t1}=${t2 - t1}\\) 秒。`
        );
        continue;
      }

      if (variant === 3) {
        // 靠牆長方形 2x+y=Ltot，面積 x·y=x(Ltot-2x) 介於 A1,A2
        const Ltot = 4 * randInt(2, 5);
        const x1 = randInt(1, Ltot / 4 - 1);
        const x2 = x1 + 1;
        const area = (x) => x * (Ltot - 2 * x);
        const A1 = Math.min(area(x1), area(x2));
        const A2 = Math.max(area(x1), area(x2));
        // 由於面積為拋物線，介於區間可能對應兩段；此處取單調段
        questions.push(
          `牆角用 ${Ltot} 公尺護欄圍成長方形，靠牆兩邊不需護欄。若面積介於 ${A1} 與 ${A2} 平方公尺之間，求一邊長 \\(x\\)（滿足 \\(x\\le ${Ltot / 4}\\)）的範圍。`
        );
        answers.push(
          `簡答：\\(${Math.min(x1, x2)}\\le x\\le${Math.max(x1, x2)}\\)。過程：另一邊為 \\(${Ltot}-2x\\)，面積 \\(A=x(${Ltot}-2x)\\)。在 \\(x\\le ${Ltot / 4}\\)（頂點左側）此段為遞增，令 \\(${A1}\\le A\\le${A2}\\) 解得 \\(${Math.min(x1, x2)}\\le x\\le${Math.max(x1, x2)}\\)。`
        );
        continue;
      }

      // variant 4：稅收模型 (r)·800(1-r/50) ≥ H（單位化）
      const base = 800;
      const t1 = randInt(10, 20);
      const t2 = t1 + randInt(5, 15);
      // 稅收 T(r)= (r/100)·base·(1-r/50)? 簡化：設 T=k(r-t1)(t2-r)≥0 → t1≤r≤t2
      questions.push(
        `某商品的月銷量（千個）與售價 \\(r\\)（元）滿足：當 \\(${t1}\\le r\\le${t2}\\) 時銷量為正，且總收入 \\(T=r(${t1 + t2}-r)\\)。求使 \\(T\\ge${t1 * t2}\\) 的 \\(r\\) 範圍。`
      );
      answers.push(
        `簡答：\\(${t1}\\le r\\le${t2}\\)。過程：\\(T=r(${t1 + t2}-r)\\ge${t1 * t2}\\) 即 \\(-r^2+${t1 + t2}r-${t1 * t2}\\ge0\\)，整理 \\(r^2-${t1 + t2}r+${t1 * t2}\\le0\\)，因式分解 \\((r-${t1})(r-${t2})\\le0\\)，得 \\(${t1}\\le r\\le${t2}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS133CubicInequalitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const Xm = (r) => `x${r > 0 ? '-' : '+'}${Math.abs(r)}`;
    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const r1 = randInt(-5, 0);
      const r2 = r1 + randInt(1, 3);
      const r3 = r2 + randInt(1, 3);

      if (variant === 0 || variant === 3) {
        // (x-r1)(x-r2)(x-r3) ≤ 0，首項正 → x≤r1 或 r2≤x≤r3
        questions.push(`解不等式 \\((${Xm(r1)})(${Xm(r2)})(${Xm(r3)})\\le0\\)。`);
        answers.push(
          `簡答：\\(x\\le ${r1}\\) 或 \\(${r2}\\le x\\le${r3}\\)。過程：三根為 \\(${r1}<${r2}<${r3}\\)，首項係數為正。在數線上分區檢驗符號：\\(x<${r1}\\) 為負、\\(${r1}<x<${r2}\\) 為正、\\(${r2}<x<${r3}\\) 為負、\\(x>${r3}\\) 為正。取 \\(\\le0\\) 的區間並含端點，得 \\(x\\le ${r1}\\) 或 \\(${r2}\\le x\\le${r3}\\)。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(
          `已知三次函數 \\(f(x)\\) 的領導係數為正，且與 \\(x\\) 軸交於 \\(${r1},${r2},${r3}\\)，求 \\(f(x)<0\\) 的解。`
        );
        answers.push(
          `簡答：\\(x<${r1}\\) 或 \\(${r2}<x<${r3}\\)。過程：領導係數為正的三次函數在最大根右側為正，符號沿數線交替。故 \\(f(x)<0\\) 的區間為 \\(x<${r1}\\) 或 \\(${r2}<x<${r3}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // f(x)=x(x+a)(x-a) → f(x-s)≥0
        const a = randInt(1, 4);
        const s = randInt(1, 4);
        // 根 x=0,-a,a → 平移後 x=s, s-a, s+a
        const roots = [s - a, s, s + a].sort((p, q) => p - q);
        questions.push(`若 \\(f(x)=x(x+${a})(x-${a})\\)，求不等式 \\(f(x-${s})\\ge0\\) 的解。`);
        answers.push(
          `簡答：\\(${roots[0]}\\le x\\le${roots[1]}\\) 或 \\(x\\ge${roots[2]}\\)。過程：\\(f(t)\\ge0\\) 的解為 \\(-${a}\\le t\\le0\\) 或 \\(t\\ge${a}\\)。令 \\(t=x-${s}\\)，各邊加 ${s} 得 \\(${roots[0]}\\le x\\le${roots[1]}\\) 或 \\(x\\ge${roots[2]}\\)。`
        );
        continue;
      }

      // variant 4：> 0 的情形
      questions.push(`解不等式 \\((${Xm(r1)})(${Xm(r2)})(${Xm(r3)})>0\\)。`);
      answers.push(
        `簡答：\\(${r1}<x<${r2}\\) 或 \\(x>${r3}\\)。過程：三根 \\(${r1}<${r2}<${r3}\\)、首項正。符號由右而左為 +,-,+,-。取 \\(>0\\) 的開區間得 \\(${r1}<x<${r2}\\) 或 \\(x>${r3}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS133AdvancedInequalitySixSubtypeMixedSet(count) {
    const banks = [
      buildS133HighDegreeSignInequalitySet,
      buildS133RationalInequalitySet,
      buildS133AdvancedAlwaysSignSet,
      buildS133AdvancedInverseProblemSet,
      buildS133GeometricAppliedInequalitySet,
      buildS133CubicInequalitySet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
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
      return labelMatch[1].trim();
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

  function stripSummaryPrefixFromDetail(detail) {
    const text = String(detail || '');
    const cleaned = text.replace(
      /^\s*(?:簡答|答案)[:：]\s*[\s\S]*?(?:(?:。|；)?\s*|<br\s*\/?>\s*)((?:過程|解析|詳解|說明)[:：])/i,
      '$1'
    );
    return cleaned.trim() ? cleaned : text;
  }

  function createAnswerList(summaryAnswers) {
    const answers = [];
    const nativePush = Array.prototype.push;
    answers.push = function pushAnswerWithSummary(...items) {
      const cleanedItems = items.map((item) => {
        summaryAnswers.push(deriveSummaryAnswerFromDetail(item));
        return stripSummaryPrefixFromDetail(item);
      });
      return nativePush.apply(this, cleanedItems);
    };
    return answers;
  }

  function appendGeneratedPracticeItem(target, generated, itemIndex) {
    target.questions.push(generated.questions[itemIndex]);
    target.summaryAnswers.push(
      generated.summaryAnswers?.[itemIndex] || deriveSummaryAnswerFromDetail(generated.answers[itemIndex])
    );
    target.answers.push(stripSummaryPrefixFromDetail(generated.answers[itemIndex]));
  }

  // ── s1-3 新增生成器 ────────────────────────────────────────────────────────

  // s1-3-2: 由函數值決定一次函數 (5 modes)
  function buildS132LinearFunctionFromPointsSet(count) {
    function sn(k) {
      return formatS122SignedNumber(k);
    }
    function fmtL(m, k) {
      const mp = m === 1 ? 'x' : m === -1 ? '-x' : m + 'x';
      return k === 0 ? mp : mp + sn(k);
    }
    const modes = [
      // Mode 0: 給兩個非零x處的函數值，求f(x)
      () => {
        const mVals = [1, 2, 3, -1, -2, -3];
        const m = mVals[randInt(0, 5)];
        const k = randInt(-5, 5);
        const x1 = randInt(-3, -1);
        const x2 = randInt(1, 3);
        const y1 = m * x1 + k;
        const y2 = m * x2 + k;
        return {
          q: `已知一次函數 \\(f(x)\\)，且 \\(f(${x1})=${y1}\\)，\\(f(${x2})=${y2}\\)，求 \\(f(x)\\)。`,
          a: `簡答：\\(f(x)=${fmtL(m, k)}\\)。過程：斜率 \\(m=\\dfrac{${y2 - y1}}{${x2 - x1}}=${m}\\)。代入 \\(f(${x1})=${y1}\\)：\\(${m}\\cdot(${x1})+k=${y1}\\)，得 \\(k=${k}\\)。所以 \\(f(x)=${fmtL(m, k)}\\)。`,
        };
      },
      // Mode 1: 給f(0)和f(x2)，求f(x3)
      () => {
        const m = [1, 2, -1, -2, 3, -3][randInt(0, 5)];
        const k = randInt(-4, 4);
        const x2 = randInt(1, 3);
        const x3 = randInt(4, 7);
        const y2 = m * x2 + k;
        const y3 = m * x3 + k;
        return {
          q: `已知一次函數 \\(f(x)\\)，且 \\(f(0)=${k}\\)，\\(f(${x2})=${y2}\\)，求 \\(f(${x3})\\) 的值。`,
          a: `簡答：\\(f(${x3})=${y3}\\)。過程：\\(f(0)=${k}\\) 代表截距 \\(k=${k}\\)。由 \\(f(${x2})=${y2}\\)：\\(m\\cdot${x2}${sn(k)}=${y2}\\)，得 \\(m=${m}\\)。所以 \\(f(x)=${fmtL(m, k)}\\)，\\(f(${x3})=${m}\\cdot${x3}${sn(k)}=${y3}\\)。`,
        };
      },
      // Mode 2: 給兩函數值，求f(x)>0的x範圍
      () => {
        const m = [1, 2, 3][randInt(0, 2)];
        const x0 = randInt(1, 5);
        const k = -m * x0;
        const x1 = randInt(-3, -1);
        const x2 = randInt(x0 + 1, x0 + 3);
        const y1 = m * x1 + k;
        const y2 = m * x2 + k;
        return {
          q: `已知一次函數 \\(f(x)\\)，且 \\(f(${x1})=${y1}\\)，\\(f(${x2})=${y2}\\)，求使 \\(f(x)>0\\) 的 \\(x\\) 範圍。`,
          a: `簡答：\\(x>${x0}\\)。過程：斜率 \\(m=\\dfrac{${y2 - y1}}{${x2 - x1}}=${m}\\)，截距 \\(k=${k}\\)。\\(f(x)=${fmtL(m, k)}>0\\) 解得 \\(x>${x0}\\)。`,
        };
      },
      // Mode 3: 給f(f(0))和f(f(1))，求f(x)=ax+b
      () => {
        const a = [2, 3][randInt(0, 1)];
        const b = randInt(-3, 3);
        const ff0 = a * b + b; // f(b) = ab+b
        const ff1 = a * (a + b) + b; // f(a+b) = a(a+b)+b
        return {
          q: `設 \\(f(x)=ax+b\\)，且 \\(a>0\\)。已知 \\(f(f(0))=${ff0}\\)，\\(f(f(1))=${ff1}\\)，求 \\(a\\) 與 \\(b\\)。`,
          a: `簡答：\\(a=${a}\\)，\\(b=${b}\\)。過程：\\(f(0)=b\\)，\\(f(f(0))=f(b)=ab+b=b(a+1)=${ff0}\\)。\\(f(1)=a+b\\)，\\(f(f(1))=a(a+b)+b=a^2+ab+b=${ff1}\\)。兩式相減得 \\(a^2=${ff1 - ff0}\\)，又 \\(a>0\\)，故 \\(a=${a}\\)，代回得 \\(b=${b}\\)。`,
        };
      },
      // Mode 4: 已知f(2x+1)=px+q，求f(x)
      () => {
        const a = [1, 2, 3][randInt(0, 2)];
        const b = randInt(-4, 4);
        const coeffX = 2 * a;
        const constTerm = a + b;
        const constStr = constTerm === 0 ? '' : constTerm > 0 ? '+' + constTerm : '' + constTerm;
        return {
          q: `設 \\(f(x)\\) 為一次函數，已知 \\(f(2x+1)=${coeffX}x${constStr}\\)，求 \\(f(x)\\)。`,
          a: `簡答：\\(f(x)=${fmtL(a, b)}\\)。過程：令 \\(t=2x+1\\)，則 \\(x=\\dfrac{t-1}{2}\\)。\\(f(t)=${coeffX}\\cdot\\dfrac{t-1}{2}${constStr}=${a === 1 ? 't' : `${a}t`}${sn(b)}\\)。所以 \\(f(x)=${fmtL(a, b)}\\)。`,
        };
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i++) {
      const { q, a } = modes[i % modes.length]();
      questions.push(q);
      answers.push(a);
    }
    return { questions, summaryAnswers, answers };
  }

  // s1-3-2: 由三點求二次函數係數 (5 modes)
  function buildS132QuadraticThreePointsSet(count) {
    function sn(k) {
      return formatS122SignedNumber(k);
    }
    function fmtQ(a, b, c) {
      // format ax²+bx+c
      const aTerm = a === 1 ? 'x^2' : a === -1 ? '-x^2' : a + 'x^2';
      const bTerm = b === 0 ? '' : b === 1 ? '+x' : b === -1 ? '-x' : b > 0 ? '+' + b + 'x' : b + 'x';
      const cTerm = c === 0 ? '' : sn(c);
      return aTerm + bTerm + cTerm;
    }
    const modes = [
      // Mode 0: x=0,1,-1 三點 (最簡單的線性方程組)
      () => {
        const a = [1, 2, -1, -2][randInt(0, 3)];
        const b = randInt(-4, 4);
        const c = randInt(-5, 5);
        const f0 = c;
        const f1 = a + b + c;
        const fm1 = a - b + c;
        return {
          q: `已知二次函數 \\(f(x)=ax^2+bx+c\\)，且 \\(f(0)=${f0}\\)，\\(f(1)=${f1}\\)，\\(f(-1)=${fm1}\\)，求 \\(a\\)、\\(b\\)、\\(c\\) 的值。`,
          a: `簡答：\\(a=${a}\\)，\\(b=${b}\\)，\\(c=${c}\\)。過程：由 \\(f(0)=${f0}\\) 得 \\(c=${c}\\)。由 \\(f(1)+f(-1)=${f1 + fm1}=2a+2c\\) 得 \\(a=${a}\\)。由 \\(f(1)-f(-1)=${f1 - fm1}=2b\\) 得 \\(b=${b}\\)。`,
        };
      },
      // Mode 1: x=0,1,2 三點
      () => {
        const a = [1, 2, -1, -2][randInt(0, 3)];
        const b = randInt(-4, 4);
        const c = randInt(-5, 5);
        const f0 = c;
        const f1 = a + b + c;
        const f2 = 4 * a + 2 * b + c;
        return {
          q: `已知二次函數 \\(f(x)=ax^2+bx+c\\)，且 \\(f(0)=${f0}\\)，\\(f(1)=${f1}\\)，\\(f(2)=${f2}\\)，求 \\(a\\)、\\(b\\)、\\(c\\) 的值。`,
          a: `簡答：\\(a=${a}\\)，\\(b=${b}\\)，\\(c=${c}\\)。過程：由 \\(f(0)=${f0}\\) 得 \\(c=${c}\\)。設 \\(u=f(1)-c=${f1 - c}\\)，\\(v=f(2)-c=${f2 - c}\\)，則 \\(v-2u=${f2 - c - 2 * (f1 - c)}=2a\\)，得 \\(a=${a}\\)，\\(b=${b}\\)。`,
        };
      },
      // Mode 2: 頂點式 — 給頂點(h,k)和一點(0,y0)
      () => {
        const a = [1, 2, -1, -2][randInt(0, 3)];
        const h = randInt(1, 4);
        const kv = randInt(-5, 5);
        const y0 = a * h * h + kv; // f(0) = a*h^2 + kv
        // vertex form: f(x) = a(x-h)^2 + kv
        // expand: a*x^2 - 2ah*x + ah^2+kv
        const bCoef = -2 * a * h;
        const cCoef = a * h * h + kv;
        const kvStr = kv === 0 ? '' : sn(kv);
        const hStr = h > 0 ? '-' + h : '+' + Math.abs(h);
        return {
          q: `已知二次函數的頂點為 \\((${h},${kv})\\)，且圖形通過點 \\((0,${y0})\\)，求此二次函數。`,
          a: `簡答：\\(f(x)=${fmtQ(a, bCoef, cCoef)}\\)。過程：設 \\(f(x)=a(x${hStr})^2${kvStr}\\)。代入 \\((0,${y0})\\)：\\(a\\cdot${h * h}${kvStr}=${y0}\\)，得 \\(a=${a}\\)。展開得 \\(f(x)=${fmtQ(a, bCoef, cCoef)}\\)。`,
        };
      },
      // Mode 3: 給兩根和y軸截距
      () => {
        const a = [1, -1, 2, -2][randInt(0, 3)];
        const r1 = randInt(-3, -1);
        const r2 = randInt(1, 4);
        // f(x) = a(x-r1)(x-r2), f(0) = a*(-r1)*(-r2) = a*r1*r2 (sign: r1≤0,r2>0 → r1*r2≤0)
        const yint = a * r1 * r2;
        const bCoef = -a * (r1 + r2);
        const cCoef = a * r1 * r2;
        const r1Factor = formatS131LinearFactor(r1);
        const r2Factor = formatS131LinearFactor(r2);
        return {
          q: `已知二次函數圖形與 \\(x\\) 軸交於 \\((${r1},0)\\) 和 \\((${r2},0)\\)，且 \\(y\\) 軸截距為 \\(${yint}\\)，求此函數。`,
          a: `簡答：\\(f(x)=${fmtQ(a, bCoef, cCoef)}\\)。過程：設 \\(f(x)=a(${r1Factor})(${r2Factor})\\)。代入 \\(x=0\\)：\\(f(0)=a\\cdot(${-r1})\\cdot(${-r2})=${yint}\\)，得 \\(a=${a}\\)。展開得 \\(f(x)=${fmtQ(a, bCoef, cCoef)}\\)。`,
        };
      },
      // Mode 4: 給兩點求f(x)=x²+ax+b，再求f(p)
      () => {
        const a = randInt(-4, 4);
        const b = randInt(-5, 5);
        const x1 = randInt(1, 3);
        const x2 = x1 + randInt(1, 2);
        const p = x2 + randInt(1, 3);
        const y1 = x1 * x1 + a * x1 + b;
        const y2 = x2 * x2 + a * x2 + b;
        const yp = p * p + a * p + b;
        return {
          q: `設 \\(f(x)=x^2+ax+b\\)，已知 \\(f(${x1})=${y1}\\) 且 \\(f(${x2})=${y2}\\)，求 \\(f(${p})\\)。`,
          a: `簡答：\\(f(${p})=${yp}\\)。過程：由 \\(f(${x1})=${y1}\\)：\\(${x1 * x1}+${formatTerm(x1, 'a')}+b=${y1}\\)；由 \\(f(${x2})=${y2}\\)：\\(${x2 * x2}+${formatTerm(x2, 'a')}+b=${y2}\\)。兩式相減：\\(${formatTerm(x2 - x1, 'a')}=${y2 - y1 - (x2 * x2 - x1 * x1)}\\)，得 \\(a=${a}\\)，\\(b=${b}\\)。\\(f(${p})=${yp}\\)。`,
        };
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i++) {
      const { q, a } = modes[i % modes.length]();
      questions.push(q);
      answers.push(a);
    }
    return { questions, summaryAnswers, answers };
  }

  // s1-3-3: 含根號的不等式 (5 modes, 全為整數解)
  function buildS133SquareRootInequalitySet(count) {
    const modes = [
      // Mode 0: √(x+a) < b (b>0 整數) → -a ≤ x < b²-a
      () => {
        const a = randInt(1, 6);
        const b = randInt(2, 5);
        const upper = b * b - a;
        const upperStr = upper >= 0 ? upper : '(' + upper + ')';
        return {
          q: `解不等式 \\(\\sqrt{x${formatS122SignedNumber(a)}} < ${b}\\)。`,
          a: `簡答：\\(${-a}\\leq x<${upper}\\)。過程：需 \\(x${formatS122SignedNumber(a)}\\geq0\\) 且 \\(x${formatS122SignedNumber(a)}<${b}^2=${b * b}\\)，解得 \\(${-a}\\leq x<${upper}\\)。`,
        };
      },
      // Mode 1: √(x-a) ≥ b → x ≥ a+b²
      () => {
        const a = randInt(0, 4);
        const b = randInt(1, 3);
        const lower = a + b * b;
        const aStr = a > 0 ? '-' + a : a === 0 ? '' : '+' + Math.abs(a);
        return {
          q: `解不等式 \\(\\sqrt{x${a > 0 ? '-' + a : a === 0 ? '' : '+' + Math.abs(a)}} \\geq ${b}\\)。`,
          a: `簡答：\\(x\\geq${lower}\\)。過程：需 \\(x\\geq${a}\\) 且 \\(x${a > 0 ? '-' + a : ''}\\geq${b}^2=${b * b}\\)，即 \\(x\\geq${lower}\\)。`,
        };
      },
      // Mode 2: √(x+a) ≤ x (a=k(k+1), solution x≥k+1)
      // a∈{2,6,12,20,30}: k=1,2,3,4,5
      () => {
        const k = randInt(1, 4);
        const a = k * (k + 1);
        const sol = k + 1;
        return {
          q: `解不等式 \\(\\sqrt{x+${a}}\\leq x\\)。`,
          a: `簡答：\\(x\\geq${sol}\\)。過程：需 \\(x\\geq0\\) 且 \\(x\\geq0\\)（RHS須非負），平方得 \\(x+${a}\\leq x^2\\)，即 \\(x^2-x-${a}\\geq0\\)，\\((x-${sol})(x+${k})\\geq0\\)，解得 \\(x\\leq-${k}\\) 或 \\(x\\geq${sol}\\)。結合 \\(x\\geq0\\) 得 \\(x\\geq ${sol}\\)。`,
        };
      },
      // Mode 3: √(a-x) > x-b, clean triples: (a,b,c): solution x<c
      // (a=5,b=3,c=4),(a=10,b=4,c=6),(a=4,b=2,c=3),(a=11,b=5,c=7),(a=3,b=1,c=2)
      () => {
        const triples = [
          [5, 3, 4],
          [10, 4, 6],
          [4, 2, 3],
          [11, 5, 7],
          [3, 1, 2],
        ];
        const [a, b, c] = triples[randInt(0, 4)];
        return {
          q: `解不等式 \\(\\sqrt{${a}-x}>x-${b}\\)。`,
          a: `簡答：\\(x<${c}\\)（且 \\(x\\leq ${a}\\)）。過程：定義域 \\(x\\leq ${a}\\)。當 \\(x<${b}\\) 時，右側為負，左側非負，不等式自動成立。當 \\(x\\geq${b}\\) 時，兩側非負，平方得 \\(${a}-x>(x-${b})^2\\)，整理得 \\((x-${b})(x-${c})<0\\)（或類似），解得 \\(${b}\\leq x<${c}\\)。合併：\\(x<${c}\\)。`,
        };
      },
      // Mode 4: √(x+a) ≥ x+b, solution -a ≤ x ≤ ... clean pairs
      // 4a-4b+1=k²: (a=5,b=3,sol=[-5,-1]), (a=3,b=1,sol=[-3,1]), (a=2,b=0,sol=[-2,2]), (a=5,b=-1,sol=[-5,4])
      () => {
        const cases = [
          { a: 5, b: 3, lo: -5, hi: -1 },
          { a: 3, b: 1, lo: -3, hi: 1 },
          { a: 2, b: 0, lo: -2, hi: 2 },
          { a: 7, b: 3, lo: -7, hi: 1 }, // 4*7-12+1=17 not square... let me check
        ];
        // Use only verified cases:
        const verified = [
          { a: 5, b: 3, lo: -5, hi: -1 },
          { a: 3, b: 1, lo: -3, hi: 1 },
          { a: 2, b: 0, lo: -2, hi: 2 },
        ];
        const { a, b, lo, hi } = verified[randInt(0, 2)];
        const bStr = b === 0 ? '' : formatS122SignedNumber(b);
        return {
          q: `解不等式 \\(\\sqrt{x+${a}}\\geq x${bStr}\\)。`,
          a: `簡答：\\(${lo}\\leq x\\leq${hi}\\)。過程：定義域 \\(x\\geq${-a}\\)。當 \\(x${bStr}<0\\) 時，不等式自動成立。當 \\(x${bStr}\\geq0\\) 時，平方得 \\(x+${a}\\geq(x${bStr})^2\\)，整理得二次不等式，解得 \\(${lo}\\leq x\\leq${hi}\\)。`,
        };
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i++) {
      const { q, a } = modes[i % modes.length]();
      questions.push(q);
      answers.push(a);
    }
    return { questions, summaryAnswers, answers };
  }

  // s1-3-3: 絕對值最小值/最大值問題 (5 modes)
  function buildS133AbsoluteValueMinimumSet(count) {
    // 格式化 |x-n|：n=0→|x|，n>0→|x-n|，n<0→|x+|n||
    function fmtAbsTerm(n) {
      if (n === 0) return '|x|';
      if (n > 0) return `|x-${n}|`;
      return `|x+${-n}|`;
    }
    const modes = [
      // Mode 0: min of |x-a|+|x-b|, a<b → min=b-a at a≤x≤b
      () => {
        const a = randInt(-3, 1);
        const b = a + randInt(2, 6);
        const minVal = b - a;
        const fa = fmtAbsTerm(a),
          fb = fmtAbsTerm(b);
        return {
          q: `求 \\(f(x)=${fa}+${fb}\\) 的最小值。`,
          a: `簡答：最小值為 \\(${minVal}\\)。過程：由三角不等式，\\(${fa}+${fb}\\geq${minVal}\\)。當 \\(${a}\\leq x\\leq${b}\\) 時等號成立，最小值為 \\(${minVal}\\)。`,
        };
      },
      // Mode 1: min of |x-a|+|x-b|+|x-c|, a<b<c → min=c-a at x=b
      () => {
        const a = randInt(-4, -1);
        const b = randInt(0, 2);
        const c = b + randInt(2, 5);
        const minVal = c - a;
        const fa = fmtAbsTerm(a),
          fb = fmtAbsTerm(b),
          fc = fmtAbsTerm(c);
        return {
          q: `求 \\(f(x)=${fa}+${fb}+${fc}\\) 的最小值。`,
          a: `簡答：最小值為 \\(${minVal}\\)，在 \\(x=${b}\\) 時取得。過程：\\(${fa}+${fc}\\geq${c - a}\\)（等號在 \\(${a}\\leq x\\leq${c}\\) 成立），\\(${fb}\\geq0\\)（等號在 \\(x=${b}\\) 成立）。兩者同時在 \\(x=${b}\\) 取到等號，最小值為 \\(${minVal}\\)。`,
        };
      },
      // Mode 2: min of |x-a|+|x-b|+|x-c|+|x-d|, a<b<c<d → min=(d-a)+(c-b) at x∈[b,c]
      () => {
        const a = randInt(-5, -2);
        const b = randInt(-1, 1);
        const c = b + randInt(1, 3);
        const d = c + randInt(2, 4);
        const minVal = d - a + (c - b);
        const fa = fmtAbsTerm(a),
          fb = fmtAbsTerm(b),
          fc = fmtAbsTerm(c),
          fd = fmtAbsTerm(d);
        return {
          q: `求 \\(f(x)=${fa}+${fb}+${fc}+${fd}\\) 的最小值。`,
          a: `簡答：最小值為 \\(${minVal}\\)，在 \\(${b}\\leq x\\leq${c}\\) 時取得。過程：\\(${fa}+${fd}\\geq${d - a}\\)，\\(${fb}+${fc}\\geq${c - b}\\)，合計最小值 \\(${minVal}\\)，在 \\(x\\in[${b},${c}]\\) 時同時等號成立。`,
        };
      },
      // Mode 3: max of |x+a|-|x-b| (a,b>0) → max=a+b
      () => {
        const a = randInt(1, 5);
        const b = randInt(1, 5);
        const maxVal = a + b;
        return {
          q: `求 \\(f(x)=|x+${a}|-|x-${b}|\\) 的最大值。`,
          a: `簡答：最大值為 \\(${maxVal}\\)。過程：由三角不等式的推論，\\(|x+${a}|-|x-${b}|\\leq|(x+${a})-(x-${b})|=${a + b}\\)。當 \\(x\\geq${b}\\) 時，\\(|x+${a}|-|x-${b}|=(x+${a})-(x-${b})=${a + b}\\) 為常數，等號成立，最大值為 \\(${maxVal}\\)。`,
        };
      },
      // Mode 4: min of p|x-a|+q|x-b| (q>p>0) → slope in (a,b) is p-q<0, min at x=b
      () => {
        const p = randInt(2, 4);
        const q = p + randInt(1, 2);
        const a = randInt(-3, 0);
        const b = a + randInt(2, 5);
        const minVal = p * (b - a); // f(b) = p(b-a)
        const slopeMid = p - q; // slope in (a,b): p-q < 0
        const fa = fmtAbsTerm(a),
          fb = fmtAbsTerm(b);
        return {
          q: `求 \\(f(x)=${p}${fa}+${q}${fb}\\) 的最小值。`,
          a: `簡答：最小值為 \\(${minVal}\\)，在 \\(x=${b}\\) 時取得。過程：\\(f(x)\\) 的斜率：\\(x<${a}\\) 時為 \\(-(${p}+${q})\\)（遞減），\\(${a}<x<${b}\\) 時為 \\(${p}-${q}=${slopeMid}\\)（仍遞減），\\(x>${b}\\) 時為 \\(${p}+${q}\\)（遞增）。最小值在斜率由負轉正的 \\(x=${b}\\) 處：\\(f(${b})=${p}\\cdot${b - a}=${minVal}\\)。`,
        };
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i++) {
      const { q, a } = modes[i % modes.length]();
      questions.push(q);
      answers.push(a);
    }
    return { questions, summaryAnswers, answers };
  }

  function s11AdvancedSet() {
    return { questions: [], summaryAnswers: [], answers: [] };
  }

  function s11Add(set, question, summary, detail) {
    set.questions.push(question);
    set.summaryAnswers.push(summary);
    set.answers.push(`詳解：${detail}`);
  }

  function s11PowMod(base, exponent, mod) {
    let result = 1 % mod;
    let b = ((base % mod) + mod) % mod;
    let e = exponent;
    while (e > 0) {
      if (e % 2 === 1) result = (result * b) % mod;
      b = (b * b) % mod;
      e = Math.floor(e / 2);
    }
    return result;
  }

  function s11CycleText(values) {
    return values.map((value) => `\\(${value}\\)`).join('、');
  }

  function s11LogApprox(base) {
    return formatS115LogInt(S115_LOGS[base]);
  }

  function s11XMinus(value) {
    if (value === 0) return 'x';
    return value > 0 ? `x-${value}` : `x+${-value}`;
  }

  function s11LinearXPlus(value) {
    if (value === 0) return 'x';
    return value > 0 ? `x+${value}` : `x-${-value}`;
  }

  function s11ConstantMinusX(value) {
    if (value === 0) return '-x';
    return `${value}-x`;
  }

  function s11AddConstantMinusX(value) {
    if (value === 0) return '-x';
    return value > 0 ? `+(${s11ConstantMinusX(value)})` : `-(${s11LinearXPlus(-value)})`;
  }

  function s11SubtractConstantMinusX(value) {
    if (value === 0) return '+x';
    return value > 0 ? `-(${s11ConstantMinusX(value)})` : `+(${s11LinearXPlus(-value)})`;
  }

  function s11Paren(value) {
    return value < 0 ? `(${value})` : `${value}`;
  }

  function buildS112RootAbsRangeAdvancedSet(count) {
    const set = s11AdvancedSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = randInt(-5, -2);
        const b = randInt(2, 6);
        const c = a - randInt(1, 3);
        const left = a;
        const right = b - 1;
        const constant = b - a + c;
        s11Add(
          set,
          `已知 \\(${left}\\le x\\le ${right}\\)，化簡 \\(\\sqrt{(${s11XMinus(a)})^2}+|${s11XMinus(b)}|-|${s11XMinus(c)}|\\)。`,
          `\\(${s11ConstantMinusX(constant)}\\)`,
          `在此範圍內，\\(${s11XMinus(a)}\\ge0\\)、\\(${s11XMinus(b)}<0\\)、\\(${s11XMinus(c)}>0\\)。所以原式 \\(=(${s11XMinus(a)})+(${b}-x)-(${s11XMinus(c)})=${s11ConstantMinusX(constant)}\\)。`
        );
      } else if (mode === 1) {
        // √(a²v²+b²/v²-2ab)+√(a²v²+b²/v²+2ab)=|av-b/v|+|av+b/v|=2b/v （0<v<t，b=a·t²）
        const aa = randInt(1, 3);
        const tt = randInt(1, 3);
        const v = ['x', 't', 'y'][randInt(0, 2)];
        const bb = aa * tt * tt;
        const A2 = aa * aa === 1 ? `${v}^2` : `${aa * aa}${v}^2`;
        const B2 = bb * bb;
        const M = 2 * aa * bb;
        const avText = aa === 1 ? v : `${aa}${v}`;
        const bvText = `\\frac{${bb}}{${v}}`;
        s11Add(
          set,
          `設 \\(0<${v}<${tt}\\)，化簡 \\(\\sqrt{${A2}+\\frac{${B2}}{${v}^2}-${M}}+\\sqrt{${A2}+${M}+\\frac{${B2}}{${v}^2}}\\)。`,
          `\\(\\frac{${2 * bb}}{${v}}\\)`,
          `第一個根號為 \\(\\sqrt{(${avText}-${bvText})^2}=|${avText}-${bvText}|\\)。因為 \\(0<${v}<${tt}\\)，所以 \\(${avText}-${bvText}<0\\)，得 \\(${bvText}-${avText}\\)。第二個根號為 \\(\\sqrt{(${avText}+${bvText})^2}=${avText}+${bvText}\\)，相加得 \\(\\frac{${2 * bb}}{${v}}\\)。`
        );
      } else if (mode === 2) {
        const a = -randInt(4, 8);
        const b = randInt(a + 1, -1);
        const value = -a - 2 * b;
        const sumText = `${a}${formatSignedNumber(b)}`;
        const differenceText = `${b}${formatSignedNumber(-a)}`;
        s11Add(
          set,
          `已知 \\(${a}<${b}<0\\)，化簡 \\(\\sqrt{(${a})^2}-|${differenceText}|+\\sqrt{(${sumText})^2}\\)。`,
          `\\(${value}\\)`,
          `因為 \\(${a}<0\\)，\\(\\sqrt{(${a})^2}=|${a}|=${-a}\\)。又 \\(${differenceText}>0\\)，所以 \\(|${differenceText}|=${b - a}\\)。且 \\(${sumText}<0\\)，\\(\\sqrt{(${sumText})^2}=|${a + b}|=${-(a + b)}\\)。合併得 \\(${-a}-(${b - a})+${-(a + b)}=${value}\\)。`
        );
      } else if (mode === 3) {
        const k = randInt(-3, 4);
        s11Add(
          set,
          `已知 \\(${k}<x<${k + 1}\\)，化簡 \\(|${s11XMinus(k - 1)}|-\\sqrt{(${s11XMinus(k + 1)})^2}+|${s11XMinus(k + 2)}|\\)。`,
          `\\(${s11XMinus(k - 2)}\\)`,
          `此時 \\(${s11XMinus(k - 1)}>0\\)、\\(${s11XMinus(k + 1)}<0\\)、\\(${s11XMinus(k + 2)}<0\\)。所以原式 \\(=(${s11XMinus(k - 1)})${s11SubtractConstantMinusX(k + 1)}${s11AddConstantMinusX(k + 2)}=${s11XMinus(k - 2)}\\)。`
        );
      } else {
        const k = randInt(1, 5);
        s11Add(
          set,
          `已知 \\(${k}<x<${k + 1}\\)，化簡 \\(\\sqrt{(${s11XMinus(k)})^2}+|${s11XMinus(k + 3)}|-|${s11XMinus(k - 2)}|\\)。`,
          `\\(${s11ConstantMinusX(k + 1)}\\)`,
          `在範圍內，\\(${s11XMinus(k)}>0\\)、\\(${s11XMinus(k + 3)}<0\\)、\\(${s11XMinus(k - 2)}>0\\)。所以原式 \\(=(${s11XMinus(k)})+(${k + 3}-x)-(${s11XMinus(k - 2)})=${s11ConstantMinusX(k + 1)}\\)。`
        );
      }
    }
    return set;
  }

  function buildS114ExponentialFractionRangeAdvancedSet(count) {
    const set = s11AdvancedSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const base = [2, 3, 5, 6, 7][randInt(0, 4)];
        const a = randInt(1, 9);
        s11Add(
          set,
          `已知 \\(x\\in\\mathbb R\\)，求 \\(y=\\frac{${base}^{2x}-${a}}{${base}^{2x}+${a}}\\) 的值域。`,
          `\\((-1,1)\\)`,
          `令 \\(t=${base}^{2x}\\)，則 \\(t>0\\)。\\(y=\\frac{t-${a}}{t+${a}}=1-\\frac{${2 * a}}{t+${a}}\\)。當 \\(t\\to0^+\\) 時 \\(y\\to-1\\)，當 \\(t\\to\\infty\\) 時 \\(y\\to1\\)，兩端都取不到，所以值域為 \\((-1,1)\\)。`
        );
      } else if (mode === 1) {
        const base = [2, 3, 5][randInt(0, 2)];
        const A = randInt(4, 9);
        const B = randInt(2, 5);
        const C = randInt(2, 7);
        s11Add(
          set,
          `求 \\(f(x)=\\frac{${A}-${B}\\cdot ${base}^x}{${base}^x+${C}}\\) 的最大值與最小值。`,
          `無最大值，無最小值；值域 \\((-${B},${formatFraction(A, C)})\\)`,
          `令 \\(t=${base}^x>0\\)。則 \\(f=\\frac{${A}-${B}t}{t+${C}}\\)。當 \\(t\\to0^+\\) 時 \\(f\\to\\frac{${A}}{${C}}\\)；當 \\(t\\to\\infty\\) 時 \\(f\\to-${B}\\)。兩端都取不到，所以沒有最大值也沒有最小值，值域為 \\((-${B},${formatFraction(A, C)})\\)。`
        );
      } else if (mode === 2) {
        // y=(t²-c)/(t²+c)=1-2c/(t²+c)，t>0 → 值域 (-1,1)
        const base = [2, 3, 5, 6, 7][randInt(0, 4)];
        const c = randInt(1, 6);
        s11Add(
          set,
          `設 \\(t=${base}^x\\)，化簡 \\(y=\\frac{t^2-${c}}{t^2+${c}}\\) 並求其值域。`,
          `\\((-1,1)\\)`,
          `因為 \\(t=${base}^x>0\\)，所以 \\(t^2>0\\)。\\(y=\\frac{t^2-${c}}{t^2+${c}}=1-\\frac{${2 * c}}{t^2+${c}}\\)。當 \\(t\\to0^+\\) 時 \\(y\\to-1\\)，當 \\(t\\to\\infty\\) 時 \\(y\\to1\\)，兩端皆取不到，故值域為 \\((-1,1)\\)。`
        );
      } else if (mode === 3) {
        const base = [2, 3, 5, 6, 7][randInt(0, 4)];
        const shift = randInt(1, 8);
        s11Add(
          set,
          `已知 \\(x\\ge0\\)，求 \\(y=\\frac{${base}^x}{${base}^x+${shift}}\\) 的值域。`,
          `\\([${formatFraction(1, 1 + shift)},1)\\)`,
          `令 \\(t=${base}^x\\)。因為 \\(x\\ge0\\)，所以 \\(t\\ge1\\)。函數 \\(\\frac{t}{t+${shift}}\\) 隨 \\(t\\) 增加而增加，最小值在 \\(t=1\\)，為 \\(\\frac{1}{${1 + shift}}\\)；當 \\(t\\to\\infty\\) 時趨近 1 但取不到。`
        );
      } else {
        const c = randInt(2, 5);
        s11Add(
          set,
          `若 \\(y=\\frac{e^x+1}{e^x-${c}}\\)，且 \\(x>\\ln ${c}\\)，求其值域。`,
          `\\((1,\\infty)\\)`,
          `令 \\(t=e^x\\)。由 \\(x>\\ln ${c}\\) 得 \\(t>${c}\\)。\\(y=\\frac{t+1}{t-${c}}=1+\\frac{${c + 1}}{t-${c}}\\)。因為 \\(t-${c}>0\\)，所以 \\(y>1\\)；當 \\(t\\to${c}^+\\) 時 \\(y\\to\\infty\\)，當 \\(t\\to\\infty\\) 時 \\(y\\to1^+\\)。`
        );
      }
    }
    return set;
  }

  function buildS111PowerRemainderPatternAdvancedSet(count) {
    const set = s11AdvancedSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        let base = [7, 11, 13, 17][randInt(0, 3)];
        let mod = [5, 7, 9, 11][randInt(0, 3)];
        while (gcdInt(base, mod) !== 1) {
          base = [7, 11, 13, 17][randInt(0, 3)];
          mod = [5, 7, 9, 11][randInt(0, 3)];
        }
        const exponent = randInt(80, 260);
        const answer = s11PowMod(base, exponent, mod);
        const cycle = [];
        let value = 1 % mod;
        for (let k = 1; k <= 12; k += 1) {
          value = (value * (base % mod)) % mod;
          cycle.push(value);
          if (value === 1 % mod) break;
        }
        s11Add(
          set,
          `求 \\(${base}^{${exponent}}\\) 除以 \\(${mod}\\) 的餘數。`,
          `\\(${answer}\\)`,
          `先看餘數循環：${s11CycleText(cycle)}。循環長為 \\(${cycle.length}\\)，\\(${exponent}\\) 除以 \\(${cycle.length}\\) 的位置對應到餘數 \\(${answer}\\)。`
        );
      } else if (mode === 1) {
        const base = [3, 7, 9, 13][randInt(0, 3)];
        const exponent = randInt(60, 180);
        const answer = s11PowMod(base, exponent, 100);
        const label = answer < 10 ? `0${answer}` : `${answer}`;
        s11Add(
          set,
          `求 \\(${base}^{${exponent}}\\) 的最後兩位數字。`,
          `${label}`,
          `最後兩位就是除以 \\(100\\) 的餘數。用循環或快速冪可得 \\(${base}^{${exponent}}\\equiv ${answer}\\pmod{100}\\)，所以最後兩位為 ${label}。`
        );
      } else if (mode === 2) {
        const exponent = randInt(30, 120);
        const answer = (s11PowMod(7, exponent, 12) + s11PowMod(5, exponent, 12)) % 12;
        s11Add(
          set,
          `求 \\(7^{${exponent}}+5^{${exponent}}\\) 除以 \\(12\\) 的餘數。`,
          `\\(${answer}\\)`,
          `分別取模：\\(7^n\\) 在模 \\(12\\) 下奇次為 7、偶次為 1；\\(5^n\\) 奇次為 5、偶次為 1。依 \\(n=${exponent}\\) 的奇偶代入，相加後再除以 12，餘數為 \\(${answer}\\)。`
        );
      } else if (mode === 3) {
        const base = [2024, 2026, 3008, 5012][randInt(0, 3)];
        const exponent = randInt(25, 120);
        s11Add(
          set,
          `判斷 \\(${base}^{${exponent}}\\) 是奇數還是偶數。`,
          `偶數`,
          `底數 \\(${base}\\) 是偶數，偶數的正整數次方仍是偶數，所以 \\(${base}^{${exponent}}\\) 為偶數。`
        );
      } else {
        const mod = [8, 9, 16][randInt(0, 2)];
        const sign = randInt(0, 1) === 0 ? 1 : -1;
        const base = sign === 1 ? mod * randInt(2, 8) + 1 : mod * randInt(2, 8) - 1;
        const exponent = randInt(11, 55);
        const answer = s11PowMod(base, exponent, mod);
        s11Add(
          set,
          `利用二項式定理，求 \\(${base}^{${exponent}}\\) 除以 \\(${mod}\\) 的餘數。`,
          `\\(${answer}\\)`,
          `因為 \\(${base}\\equiv ${sign === 1 ? 1 : -1}\\pmod{${mod}}\\)，所以 \\(${base}^{${exponent}}\\equiv (${sign === 1 ? 1 : -1})^{${exponent}}\\pmod{${mod}}\\)。換成 \\(km\\pm1\\) 的形式看，就是二項式展開後除了常數項外，其餘項都含有 \\(${mod}\\) 的倍數，餘數為 \\(${answer}\\)。`
        );
      }
    }
    return set;
  }

  function buildS114ExponentialApplicationModelsAdvancedSet(count) {
    const set = s11AdvancedSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const halfLife = [20, 30, 40][randInt(0, 2)];
        const initial = randInt(4, 12) * 50;
        const years = halfLife * randInt(3, 6);
        const remain = initial / 2 ** (years / halfLife);
        s11Add(
          set,
          `某放射性物質每 \\(${halfLife}\\) 年衰變為一半，初始有 \\(${initial}\\) g。求 \\(${years}\\) 年後剩餘量。`,
          `\\(${remain}\\) g`,
          `經過 \\(${years}/${halfLife}=${years / halfLife}\\) 個半衰期，所以剩餘量 \\(=${initial}\\times(\\frac12)^{${years / halfLife}}=${remain}\\) g。`
        );
      } else if (mode === 1) {
        const rate = [2, 3, 5][randInt(0, 2)];
        const principal = randInt(1, 5) * 10000;
        const years = randInt(3, 8);
        s11Add(
          set,
          `某種複利存款年利率 \\(${rate}\\%\\)，本金 \\(${principal}\\) 元。若每年計息一次，寫出 \\(${years}\\) 年後本利和公式。`,
          `\\(${principal}(1+\\frac{${rate}}{100})^{${years}}\\)`,
          `複利模型是「每期乘上同一倍數」。年利率 \\(${rate}\\%\\) 表示每年乘 \\(1+\\frac{${rate}}{100}\\)，所以 \\(${years}\\) 年後為 \\(${principal}(1+\\frac{${rate}}{100})^{${years}}\\)。`
        );
      } else if (mode === 2) {
        const loss = [10, 15, 20][randInt(0, 2)];
        const threshold = [20, 25, 30][randInt(0, 2)];
        let layers = 0;
        while ((1 - loss / 100) ** layers >= threshold / 100) layers += 1;
        s11Add(
          set,
          `光線每穿透一層玻璃會損失 \\(${loss}\\%\\)。若要求剩餘強度小於 \\(${threshold}\\%\\)，至少需要幾層玻璃？`,
          `至少 \\(${layers}\\) 層`,
          `穿過 \\(n\\) 層後剩餘比例為 \\((1-${loss}\\%)^n\\)。逐步找最小整數 \\(n\\)，第一個使 \\((1-${loss}\\%)^n<${threshold}\\%\\) 成立的是 \\(n=${layers}\\)。`
        );
      } else if (mode === 3) {
        const minutes = [15, 20, 30][randInt(0, 2)];
        const initial = randInt(5, 15) * 100;
        const target = 10 ** randInt(5, 7);
        let divisions = 0;
        while (initial * 2 ** divisions <= target) divisions += 1;
        const totalMinutes = divisions * minutes;
        s11Add(
          set,
          `細菌每 \\(${minutes}\\) 分鐘分裂一次（1 變 2），初始有 \\(${initial}\\) 個。多久後會超過 \\(${target}\\) 個？`,
          `\\(${totalMinutes}\\) 分鐘後`,
          `分裂 \\(n\\) 次後數量為 \\(${initial}\\cdot2^n\\)。逐步找最小整數 \\(n\\)，使 \\(${initial}\\cdot2^n>${target}\\)，得 \\(n=${divisions}\\)。時間為 \\(${divisions}\\times${minutes}=${totalMinutes}\\) 分鐘。`
        );
      } else {
        const halfLife = [4, 6, 8][randInt(0, 2)];
        const percent = [12.5, 25][randInt(0, 1)];
        const halves = percent === 12.5 ? 3 : 2;
        const time = halves * halfLife;
        s11Add(
          set,
          `某藥物半衰期為 \\(${halfLife}\\) 小時。服用一次後，體內濃度降到初始的 \\(${percent}\\%\\) 時，已經過多久？`,
          `\\(${time}\\) 小時`,
          `每過一個半衰期乘 \\(\\frac12\\)。\\(${percent}\\%\\) 對應 \\((\\frac12)^{${halves}}\\)，所以需經過 \\(${halves}\\) 個半衰期，時間為 \\(${halves}\\times${halfLife}=${time}\\) 小時。`
        );
      }
    }
    return set;
  }

  function buildS115LogDomainScientificNotationAdvancedSet(count) {
    const set = s11AdvancedSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const c = randInt(1, 5);
        const r1 = c + 2;
        const r2 = c + 5;
        const values = [];
        for (let x = -10; x <= 20; x += 1) {
          const base = x - c;
          const argument = (x - r1) * (x - r2);
          if (base > 0 && base !== 1 && argument > 0) values.push(x);
        }
        s11Add(
          set,
          `若 \\(f(x)=\\log_{x-${c}}(x^2-${r1 + r2}x+${r1 * r2})\\) 有意義，求整數 \\(x\\) 的範圍。`,
          `\\(x>${r2}\\)`,
          `對數有意義需同時滿足底數 \\(x-${c}>0\\)、\\(x-${c}\\ne1\\)、真數 \\((x-${r1})(x-${r2})>0\\)。交集後為 \\(x>${r2}\\)。若只列整數，就是 \\(${values.slice(0, 4).join(',')},\\ldots\\)。`
        );
      } else if (mode === 1) {
        const exponent = randInt(20, 70);
        const log4 = 2 * S115_LOGS[2];
        const place = Math.floor((exponent * log4) / 10000) + 1;
        s11Add(
          set,
          `已知 \\(\\log2\\approx0.3010\\)，求 \\((0.25)^{${exponent}}\\) 表為小數後，首位非零數字出現在小數第幾位？`,
          `第 \\(${place}\\) 位`,
          `\\((0.25)^{${exponent}}=4^{-${exponent}}\\)。\\(\\log 4=2\\log2\\approx0.6020\\)，所以 \\(-\\log(4^{-${exponent}})=${exponent}\\log4\\approx${formatS115LogInt(exponent * log4)}\\)。因此首位非零數字在小數第 \\(${place}\\) 位。`
        );
      } else if (mode === 2) {
        const exponent = randInt(12, 35);
        const log15 = S115_LOGS[3] + S115_LOGS[5];
        const product = exponent * log15;
        const digits = Math.floor(product / 10000) + 1;
        s11Add(
          set,
          `判斷 \\(15^{${exponent}}\\) 是幾位數？已知 \\(\\log3\\approx${s11LogApprox(3)}\\)、\\(\\log5\\approx${s11LogApprox(5)}\\)。`,
          `\\(${digits}\\) 位數`,
          `\\(\\log15=\\log3+\log5\\approx${formatS115LogInt(log15)}\\)，所以 \\(\\log15^{${exponent}}\\approx${formatS115LogInt(product)}\\)。整數部分為 \\(${Math.floor(product / 10000)}\\)，故位數為 \\(${digits}\\)。`
        );
      } else if (mode === 3) {
        const characteristic = randInt(3, 6);
        s11Add(
          set,
          `設 \\(\\log x\\) 的首數為 \\(${characteristic}\\)，求 \\(x\\) 的範圍。`,
          `\\(10^{${characteristic}}\\le x<10^{${characteristic + 1}}\\)`,
          `常用對數的首數為 \\(${characteristic}\\)，表示 \\(${characteristic}\\le\\log x<${characteristic + 1}\\)。兩邊以 10 為底還原，得 \\(10^{${characteristic}}\\le x<10^{${characteristic + 1}}\\)。`
        );
      } else {
        const item = [
          { decimal: '1.25', number: 1250 },
          { decimal: '1.5', number: 1500 },
          { decimal: '2.5', number: 2500 },
          { decimal: '3.2', number: 3200 },
        ][randInt(0, 3)];
        s11Add(
          set,
          `若 \\(\\log A\\) 的尾數與 \\(\\log ${item.decimal}\\) 相同，且 \\(A\\) 是四位數，求 \\(A\\)。`,
          `\\(${item.number}\\)`,
          `尾數相同代表兩數只差一個 \\(10\\) 的整數次方倍。四位數必須寫成 \\(${item.decimal}\\times10^3\\)，所以 \\(A=${item.number}\\)。`
        );
      }
    }
    return set;
  }

  function s12LineExpr(a, b, c) {
    const parts = [];
    if (a !== 0) parts.push(a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`);
    if (b !== 0) parts.push(`${b > 0 && parts.length ? '+' : ''}${b === 1 ? 'y' : b === -1 ? '-y' : `${b}y`}`);
    if (c !== 0) parts.push(`${c > 0 && parts.length ? '+' : ''}${c}`);
    return parts.join('') || '0';
  }

  function s12CoefVar(coef, variable) {
    if (coef === 1) return variable;
    if (coef === -1) return `-${variable}`;
    return `${coef}${variable}`;
  }

  function s12LineValue(line, point) {
    return line.a * point.x + line.b * point.y + line.c;
  }

  function s12LineIntersection(l1, l2) {
    const det = l1.a * l2.b - l2.a * l1.b;
    if (det === 0) return null;
    return {
      x: makeFraction(l2.b * -l1.c - l1.b * -l2.c, det),
      y: makeFraction(l1.a * -l2.c - l2.a * -l1.c, det),
    };
  }

  function s12PointText(point) {
    return `(${formatFraction(point.x.num, point.x.den)},${formatFraction(point.y.num, point.y.den)})`;
  }

  function s12NumberText(value) {
    if (Number.isInteger(value)) return `${value}`;
    return trimFixed(value, 3);
  }

  function s12PointValueText(point) {
    return `(${s12NumberText(point.x)},${s12NumberText(point.y)})`;
  }

  function s12EvalLinearFraction(point, numerator, denominator) {
    return makeFraction(
      numerator.a * point.x + numerator.b * point.y + numerator.c,
      denominator.a * point.x + denominator.b * point.y + denominator.c
    );
  }

  function s12FractionCompare(a, b) {
    return a.num * b.den - b.num * a.den;
  }

  function s12PolygonArea(points) {
    let sum = 0;
    for (let i = 0; i < points.length; i += 1) {
      const p = points[i];
      const q = points[(i + 1) % points.length];
      sum += p.x * q.y - q.x * p.y;
    }
    return Math.abs(sum) / 2;
  }

  function s12ClipPolygon(points, keep) {
    const next = [];
    for (let i = 0; i < points.length; i += 1) {
      const current = points[i];
      const previous = points[(i + points.length - 1) % points.length];
      const currentValue = keep.value(current);
      const previousValue = keep.value(previous);
      const currentInside = currentValue <= 1e-9;
      const previousInside = previousValue <= 1e-9;
      if (currentInside !== previousInside) {
        const t = previousValue / (previousValue - currentValue);
        next.push({
          x: previous.x + (current.x - previous.x) * t,
          y: previous.y + (current.y - previous.y) * t,
        });
      }
      if (currentInside) next.push(current);
    }
    return next;
  }

  function buildS121ThreeLineTriangleParameterAdvancedSet(count) {
    const set = s11AdvancedSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const x0 = [1, 2, -1, -2][randInt(0, 3)];
        const y0 = randInt(-3, 3);
        const a = randInt(-4, 4) || 2;
        const c1 = x0 + 2 * y0;
        const c2 = 3 * x0 - y0;
        const c3 = a * x0 + y0;
        s11Add(
          set,
          `設 \\(L_1:x+2y=${c1}\\)，\\(L_2:3x-y=${c2}\\)，\\(L_3:ax+y=${c3}\\)。若三線共點，求 \\(a\\)。`,
          `\\(a=${a}\\)`,
          `先由 \\(L_1,L_2\\) 解得交點 \\((${x0},${y0})\\)。三線共點時，此點也要在 \\(L_3\\) 上，所以 \\(${a}\\cdot${s11Paren(x0)}${formatS122SignedNumber(y0)}=${c3}\\)，得 \\(a=${a}\\)。`
        );
      } else if (mode === 1) {
        const m = randInt(1, 4);
        const b1 = randInt(-3, 3);
        const b2 = b1 + randInt(1, 4);
        s11Add(
          set,
          `三直線 \\(L_1:y=${s12CoefVar(m, 'x')}${formatS122SignedNumber(b1)}\\)、\\(L_2:y=${s12CoefVar(m, 'x')}${formatS122SignedNumber(b2)}\\)、\\(L_3:y=ax+1\\) 中，若要求 \\(L_3\\) 也與前兩線平行，求 \\(a\\)。`,
          `\\(a=${m}\\)`,
          `\\(L_1\\) 與 \\(L_2\\) 的斜率都是 \\(${m}\\)。若 \\(L_3\\) 也要與這組方向平行，斜率需相同，所以 \\(a=${m}\\)。`
        );
      } else if (mode === 2) {
        const fixedMultiplier = randInt(1, 5);
        const c = randInt(1, 6);
        const lineConstant = fixedMultiplier * c - 1;
        s11Add(
          set,
          `設 \\(L_1:y=x${formatS122SignedNumber(c)}\\)，\\(L_2:y=-x${formatS122SignedNumber(c + 2)}\\)，\\(L_3:kx-y=${lineConstant}\\)。若 \\(L_3\\) 與 \\(L_1\\) 平行，使三線無法圍成三角形，求 \\(k\\)。`,
          `\\(k=1\\)`,
          `把 \\(L_3\\) 改寫為 \\(y=kx${formatS122SignedNumber(-lineConstant)}\\)，其斜率為 \\(k\\)。\\(L_1\\) 的斜率為 1，平行時 \\(k=1\\)。`
        );
      } else if (mode === 3) {
        const kNum = [1, 2, 3, 4][randInt(0, 3)];
        const kDen = [2, 3, 4, 5][randInt(0, 3)];
        const area = makeFraction(9 * kDen, 2 * kNum);
        s11Add(
          set,
          `直線 \\(x-${formatFraction(kNum, kDen) === '1' ? '' : formatFraction(kNum, kDen)}y-3=0\\) 與兩軸圍成三角形，求其面積。`,
          `\\(${formatFraction(area.num, area.den)}\\)`,
          `令 \\(y=0\\) 得 \\(x=3\\)；令 \\(x=0\\) 得 \\(y=-\\frac{3}{${formatFraction(kNum, kDen)}}\\)。面積為 \\(\\frac12\\times3\\times\\left|\\frac{3}{${formatFraction(kNum, kDen)}}\\right|=${formatFraction(area.num, area.den)}\\)。`
        );
      } else {
        let x = 0;
        let y = 1;
        let a = 2;
        for (let attempt = 0; attempt < 30; attempt += 1) {
          x = randInt(-3, 4);
          y = 1 - x;
          if (y === 0) continue;
          const numerator = 2 - x;
          if (numerator % y === 0) {
            a = numerator / y;
            break;
          }
        }
        const qCoef = pickNonZero(2, 6);
        const sSum = x + y;
        const pConst = x + a * y;
        const k = a * x + qCoef * y;
        s11Add(
          set,
          `討論方程組 \\(\\begin{cases}x+ay=${pConst}\\\\ ax+${qCoef}y=k\\end{cases}\\) 在何種 \\((a,k)\\) 組合下，與直線 \\(x+y=${sSum}\\) 三線共點。`,
          `一組為 \\((a,k)=(${a},${k})\\)`,
          `取共點 \\((${x},${y})\\)，它滿足 \\(x+y=${sSum}\\)。代入 \\(x+ay=${pConst}\\) 得 \\(a=${a}\\)；再代入 \\(ax+${qCoef}y=k\\)，得 \\(k=${k}\\)。`
        );
      }
    }
    return set;
  }

  function buildS121PointLineSideAdvancedSet(count) {
    const set = s11AdvancedSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        // A(k,p)、B(q,-k) 對 L:ax+by+c=0 異側；取 ab<0 使解為兩根之間
        const a0 = randInt(1, 5);
        const b0 = -randInt(1, 5);
        const c0 = randInt(-8, 10);
        const p0 = randInt(-3, 5);
        const q0 = randInt(-4, 5);
        const M0 = b0 * p0 + c0;
        const N0 = a0 * q0 + c0;
        const r1 = makeFraction(-M0, a0);
        const r2 = makeFraction(N0, b0);
        const v1 = r1.num / r1.den;
        const v2 = r2.num / r2.den;
        if (v1 === v2) {
          i -= 1;
          continue;
        }
        const loF = v1 < v2 ? r1 : r2;
        const hiF = v1 < v2 ? r2 : r1;
        s11Add(
          set,
          `點 \\(A(k,${p0})\\) 與 \\(B(${q0},-k)\\) 位於直線 \\(${s12LineText(a0, b0, c0)}\\) 之異側，求 \\(k\\) 的範圍。`,
          `\\(${formatFraction(loF.num, loF.den)}<k<${formatFraction(hiF.num, hiF.den)}\\)`,
          `代入直線式：\\(A\\) 得 \\(${a0}k${s12Signed(M0)}\\)，\\(B\\) 得 \\(${-b0}k${s12Signed(N0)}\\)。異側代表乘積小於 0，解此二次不等式（\\(k^2\\) 係數為負）得 \\(${formatFraction(loF.num, loF.den)}<k<${formatFraction(hiF.num, hiF.den)}\\)。`
        );
      } else if (mode === 1) {
        const m = randInt(1, 4);
        const pointA = { x: -1, y: randInt(2, 5) };
        const pointB = { x: randInt(3, 6), y: randInt(1, 4) };
        const thresholdA = m * pointA.x + pointA.y;
        const thresholdB = m * pointB.x + pointB.y;
        const low = Math.min(thresholdA, thresholdB);
        const high = Math.max(thresholdA, thresholdB);
        const values = [];
        for (let k = -20; k <= 30; k += 1) {
          const fA = thresholdA - k;
          const fB = thresholdB - k;
          const fO = -k;
          if (fA * fB > 0 && fA * fO < 0 && fB * fO < 0) values.push(k);
        }
        s11Add(
          set,
          `設 \\(k\\) 為整數。若 \\(A(${pointA.x},${pointA.y})\\)、\\(B(${pointB.x},${pointB.y})\\) 在直線 \\(${s12CoefVar(m, 'x')}+y-k=0\\) 同側，且原點在另一側，求 \\(k\\) 的可能值。`,
          values.length ? `\\(k=${values.join(',')}\\)` : `無整數解`,
          `代入後 \\(A\\) 的符號由 \\(${thresholdA}-k\\) 決定，\\(B\\) 由 \\(${thresholdB}-k\\) 決定，原點由 \\(-k\\) 決定。檢查同側與異側條件，可得整數 \\(k\\) 為 ${values.length ? values.join('、') : '無'}。`
        );
      } else if (mode === 2) {
        const p = randInt(1, 4);
        s11Add(
          set,
          `若點 \\(P(a,a^2)\\) 落在滿足 \\(x-y+${p * (p + 1)}>0\\) 的半平面，求 \\(a\\) 的範圍。`,
          `\\(-${p}<a<${p + 1}\\)`,
          `代入得 \\(a-a^2+${p * (p + 1)}>0\\)，即 \\(a^2-a-${p * (p + 1)}<0\\)，因式分解為 \\((a+${p})(a-${p + 1})<0\\)，所以 \\(-${p}<a<${p + 1}\\)。`
        );
      } else if (mode === 3) {
        // A,B 端點對 mx-y+c=0 代入異號 → 相交
        const c3 = pickNonZero(-6, 8);
        const ax3 = pickNonZero(1, 4);
        const ay3 = randInt(-4, 5);
        const bx3 = -pickNonZero(1, 4);
        const by3 = randInt(-4, 5);
        const s1 = makeFraction(ay3 - c3, ax3);
        const s2 = makeFraction(by3 - c3, bx3);
        const w1 = s1.num / s1.den;
        const w2 = s2.num / s2.den;
        if (w1 === w2) {
          i -= 1;
          continue;
        }
        const loS = w1 < w2 ? s1 : s2;
        const hiS = w1 < w2 ? s2 : s1;
        s11Add(
          set,
          `已知兩點 \\(A(${ax3},${ay3})\\)、\\(B(${bx3},${by3})\\)。若直線 \\(mx-y${s12Signed(c3)}=0\\) 與線段 \\(AB\\) 相交，求 \\(m\\) 的範圍。`,
          `\\(m\\le${formatFraction(loS.num, loS.den)}\\) 或 \\(m\\ge${formatFraction(hiS.num, hiS.den)}\\)`,
          `端點代入值需異號（或其一為 0）。\\(A\\) 代入得 \\(${ax3}m${s12Signed(c3 - ay3)}\\)，\\(B\\) 代入得 \\(${bx3}m${s12Signed(c3 - by3)}\\)。因兩者 \\(m\\) 的係數異號，乘積 \\(\\le0\\) 的解落在兩根之外，得 \\(m\\le${formatFraction(loS.num, loS.den)}\\) 或 \\(m\\ge${formatFraction(hiS.num, hiS.den)}\\)。`
        );
      } else {
        const la = pickNonZero(1, 4);
        const lb = pickNonZero(-4, 4);
        const lc = pickNonZero(1, 9);
        const pts4 = [];
        const used4 = new Set();
        for (let g = 0; pts4.length < 3 && g < 200; g += 1) {
          const x = randInt(-4, 5);
          const y = randInt(-4, 5);
          const key = `${x},${y}`;
          if (used4.has(key)) continue;
          used4.add(key);
          pts4.push({ label: `(${x},${y})`, x, y, v: la * x + lb * y + lc });
        }
        const same = pts4.filter((pt) => pt.v * lc > 0).map((pt) => pt.label);
        s11Add(
          set,
          `判斷點 \\(${pts4.map((pt) => pt.label).join('、')}\\) 中，哪些點與原點落在直線 \\(${s12LineText(la, lb, lc)}\\) 的同一側。`,
          same.length ? same.join('、') : '皆不同側',
          `原點代入得 \\(${lc}\\)，因此要找代入值與其同號的點。三點代入分別為 \\(${pts4.map((pt) => pt.v).join(',')}\\)，故同側的是 ${same.length ? same.join('、') : '（無）'}。`
        );
      }
    }
    return set;
  }

  function buildS121AbsoluteInequalityAreaAdvancedSet(count) {
    const set = s11AdvancedSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const r = randInt(3, 8);
        s11Add(
          set,
          `求 \\(|x-2|+|y+1|\\le ${r}\\) 所圍成的區域面積。`,
          `\\(${2 * r * r}\\)`,
          `這是中心在 \\((2,-1)\\) 的菱形，對角線長都是 \\(2r=${2 * r}\\)。面積 \\(=\\frac12\\times${2 * r}\\times${2 * r}=${2 * r * r}\\)。`
        );
      } else if (mode === 1) {
        const a = randInt(2, 12);
        const b = randInt(2, 12);
        const c = randInt(0, a + b);
        let polygon = [
          { x: -a, y: -b },
          { x: a, y: -b },
          { x: a, y: b },
          { x: -a, y: b },
        ];
        polygon = s12ClipPolygon(polygon, { value: (p) => p.x + p.y - c });
        const area = s12PolygonArea(polygon);
        s11Add(
          set,
          `求 \\(|x|\\le ${a}\\)、\\(|y|\\le ${b}\\) 與 \\(x+y\\le ${c}\\) 的共同交集區域面積。`,
          `\\(${s12NumberText(area)}\\)`,
          `先看矩形 \\([-${a},${a}]\\times[-${b},${b}]\\)，再用半平面 \\(x+y\\le${c}\\) 切掉超出的角落。由多邊形頂點計算面積，可得 \\(${s12NumberText(area)}\\)。`
        );
      } else if (mode === 2) {
        const p = randInt(1, 9);
        const q = randInt(2, 14);
        const r = p * q;
        const area = makeFraction(2 * r * r, p * q);
        const xIntercept = formatFraction(r, p);
        const yIntercept = formatFraction(r, q);
        const xDiagonal = formatFraction(2 * r, p);
        const yDiagonal = formatFraction(2 * r, q);
        s11Add(
          set,
          `求 \\(${p === 1 ? '' : p}|x|+${q}|y|\\le ${r}\\) 所圍成的幾何圖形面積。`,
          `\\(${formatFraction(area.num, area.den)}\\)`,
          `截距為 \\(x=\\pm${xIntercept}\\)、\\(y=\\pm${yIntercept}\\)。菱形兩條對角線長為 \\(${xDiagonal}\\)、\\(${yDiagonal}\\)，面積 \\(=\\frac12\\cdot${xDiagonal}\\cdot${yDiagonal}=${formatFraction(area.num, area.den)}\\)。`
        );
      } else if (mode === 3) {
        const a = randInt(1, 4);
        const b = randInt(1, 4);
        const area = 2 * a * b;
        s11Add(
          set,
          `畫出 \\(|x-y|\\le ${a}\\) 且 \\(|x+y|\\le ${b}\\) 的圖形，並求其面積。`,
          `面積 \\(${area}\\)`,
          `令 \\(u=x-y\\)、\\(v=x+y\\)，則 \\(|u|\\le${a}\\)、\\(|v|\\le${b}\\)。在 \\((u,v)\\) 平面是長方形，面積 \\(4\\cdot${a}\\cdot${b}\\)，而 \\((x,y)\\) 面積為其一半，所以面積 \\(${area}\\)。`
        );
      } else {
        const k = randInt(3, 8);
        const area = 2 * k * k;
        s11Add(
          set,
          `若區域 \\(|x|+|y|\\le k\\) 的面積為 \\(${area}\\)，求正實數 \\(k\\)。`,
          `\\(k=${k}\\)`,
          `\\(|x|+|y|\\le k\\) 是對角線長皆為 \\(2k\\) 的菱形，面積為 \\(2k^2\\)。由 \\(2k^2=${area}\\)，且 \\(k>0\\)，得 \\(k=${k}\\)。`
        );
      }
    }
    return set;
  }

  function buildS121LinearFractionalExtremaAdvancedSet(count) {
    const set = s11AdvancedSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        // 區域 x≥0,y≥0,x+by≤c；定點 F(d,e) 取在區域右方，(y-e)/(x-d) 即 F 到區域點的斜率
        const bb = randInt(1, 3);
        const cc = bb * randInt(2, 5);
        const vertices = [
          { x: 0, y: 0 },
          { x: cc, y: 0 },
          { x: 0, y: cc / bb },
        ];
        const dd = cc + randInt(1, 5);
        const ee = randInt(1, 8);
        const slopes = vertices.map((pt) => makeFraction(pt.y - ee, pt.x - dd));
        let best = slopes[0];
        slopes.forEach((f) => {
          if (f.num / f.den > best.num / best.den) best = f;
        });
        s11Add(
          set,
          `在 \\(x\\ge0,y\\ge0,x+${bb === 1 ? '' : bb}y\\le${cc}\\) 的條件下，求 \\(\\frac{y-${ee}}{x-${dd}}\\) 的最大值。`,
          `\\(${formatFraction(best.num, best.den)}\\)`,
          `\\(\\frac{y-${ee}}{x-${dd}}\\) 就是定點 \\(F(${dd},${ee})\\) 到區域內點連線的斜率，極值出現在頂點。三頂點 \\((0,0),(${cc},0),(0,${cc / bb})\\) 對應的斜率分別為 \\(${slopes.map((f) => formatFraction(f.num, f.den)).join(',')}\\)，最大值為 \\(${formatFraction(best.num, best.den)}\\)。`
        );
      } else if (mode === 1) {
        const n = [4, 6, 8][randInt(0, 2)];
        const vertices = [
          { x: 0, y: 0 },
          { x: n, y: 0 },
          { x: 0, y: n / 2 },
        ];
        const values = vertices.map((point) => ({
          point,
          value: s12EvalLinearFraction(point, { a: 0, b: 1, c: 1 }, { a: 1, b: 0, c: 1 }),
        }));
        const min = values.reduce(
          (best, item) => (s12FractionCompare(item.value, best.value) < 0 ? item : best),
          values[0]
        );
        s11Add(
          set,
          `在 \\(x\\ge0,y\\ge0,x+2y\\le${n}\\) 的條件下，求 \\(\\frac{y+1}{x+1}\\) 的最小值。`,
          `\\(${formatFraction(min.value.num, min.value.den)}\\)`,
          `檢查三角形頂點 \\((0,0),(${n},0),(0,${n / 2})\\)。代入 \\(\\frac{y+1}{x+1}\\) 後最小值出現在 \\((${n},0)\\)，為 \\(\\frac{1}{${n + 1}}\\)。`
        );
      } else if (mode === 2) {
        const a = randInt(2, 6);
        const b = randInt(2, 6);
        s11Add(
          set,
          `在 \\(|x|\\le${a}\\)、\\(|y|\\le${b}\\) 的範圍內，求點 \\((x,y)\\) 到原點距離的平方 \\(x^2+y^2\\) 之最大值。`,
          `\\(${a * a + b * b}\\)`,
          `矩形中離原點最遠的是四個角點，距離平方為 \\((\\pm${a})^2+(\\pm${b})^2=${a * a + b * b}\\)。`
        );
      } else if (mode === 3) {
        const tri3 = [
          [3, 4, 5],
          [4, 3, 5],
          [5, 12, 13],
          [8, 15, 17],
        ][randInt(0, 3)];
        const [la3, lb3, L3] = tri3;
        const verts3 = [];
        const used3 = new Set();
        for (let g = 0; verts3.length < 3 && g < 200; g += 1) {
          const x = randInt(1, 7);
          const y = randInt(1, 7);
          const key = `${x},${y}`;
          if (used3.has(key)) continue;
          used3.add(key);
          verts3.push({ x, y });
        }
        const lc3 = randInt(15, 40);
        const nums3 = verts3.map((pt) => Math.abs(la3 * pt.x + lb3 * pt.y + lc3));
        const minNum3 = Math.min(...nums3);
        s11Add(
          set,
          `已知區域由 \\(${verts3.map((pt) => `(${pt.x},${pt.y})`).join(',')}\\) 三點圍成，求區域內的點到直線 \\(${s12VarTerm(la3, 'x')}+${s12VarTerm(lb3, 'y')}+${lc3}=0\\) 的最短距離。`,
          `\\(${formatFraction(minNum3, L3)}\\)`,
          `三頂點代入 \\(${la3}x+${lb3}y+${lc3}\\) 後同號，故三角形完全落在直線同一側，最短距離出現在離直線最近的頂點。三頂點的 \\(|${la3}x+${lb3}y+${lc3}|\\) 分別為 \\(${nums3.join(',')}\\)，除以 \\(\\sqrt{${la3}^2+${lb3}^2}=${L3}\\)，最小為 \\(${formatFraction(minNum3, L3)}\\)。`
        );
      } else {
        // 有界三角形上求 (y-e)/(x-d) 的值域（= 定點到區域點的斜率範圍）
        const bb2 = randInt(1, 3);
        const cc2 = bb2 * randInt(2, 5);
        const verts2 = [
          { x: 0, y: 0 },
          { x: cc2, y: 0 },
          { x: 0, y: cc2 / bb2 },
        ];
        const dd2 = cc2 + randInt(1, 5);
        const ee2 = randInt(1, 8);
        const sl2 = verts2.map((pt) => makeFraction(pt.y - ee2, pt.x - dd2));
        let lo2 = sl2[0];
        let hi2 = sl2[0];
        sl2.forEach((f) => {
          if (f.num / f.den < lo2.num / lo2.den) lo2 = f;
          if (f.num / f.den > hi2.num / hi2.den) hi2 = f;
        });
        s11Add(
          set,
          `在 \\(x\\ge0,y\\ge0,x+${bb2 === 1 ? '' : bb2}y\\le${cc2}\\) 的條件下，求 \\(\\frac{y-${ee2}}{x-${dd2}}\\) 的值域。`,
          `\\([${formatFraction(lo2.num, lo2.den)},${formatFraction(hi2.num, hi2.den)}]\\)`,
          `此分式為定點 \\(F(${dd2},${ee2})\\) 到區域內點的斜率。區域為有界三角形且不含 \\(x=${dd2}\\)，故斜率在頂點取到極值。三頂點的斜率為 \\(${sl2.map((f) => formatFraction(f.num, f.den)).join(',')}\\)，因此值域為 \\([${formatFraction(lo2.num, lo2.den)},${formatFraction(hi2.num, hi2.den)}]\\)。`
        );
      }
    }
    return set;
  }

  function s13FreshSet() {
    return { questions: [], summaryAnswers: [], answers: [] };
  }

  function s13Add(set, question, summary, detail) {
    set.questions.push(question);
    set.summaryAnswers.push(summary);
    set.answers.push(`詳解：${stripSummaryPrefixFromDetail(detail)}`);
  }

  function s13Poly(coeffs) {
    return formatPolynomialFromCoeffs(coeffs).replace(/x\^(\d+)/g, 'x^{$1}');
  }

  function s13XMinus(value) {
    if (value === 0) return 'x';
    return value > 0 ? `x-${value}` : `x+${-value}`;
  }

  function s13Factor(value) {
    return `(${s13XMinus(value)})`;
  }

  function s13Signed(value) {
    if (value === 0) return '';
    return value > 0 ? `+${value}` : `${value}`;
  }

  function s13SignedTerm(coef, term) {
    if (coef === 0) return '';
    const abs = Math.abs(coef);
    const body = abs === 1 ? term : `${abs}${term}`;
    return coef > 0 ? `+${body}` : `-${body}`;
  }

  function s13SignedLinearTerm(coef, variable = 'X') {
    if (coef === 0) return '';
    const abs = Math.abs(coef);
    const body = abs === 1 ? variable : `${abs}${variable}`;
    return coef > 0 ? `+${body}` : `-${body}`;
  }

  function s13CoefTerm(coef, term) {
    if (coef === 1) return term;
    if (coef === -1) return `-${term}`;
    return `${coef}${term}`;
  }

  function s13ShiftedCubicText(A, B, C, D, center) {
    const base = s13Factor(center);
    const first = A === 1 ? `${base}^3` : A === -1 ? `-${base}^3` : `${A}${base}^3`;
    const text = `${first}${s13SignedTerm(B, `${base}^2`)}${s13SignedTerm(C, base)}${s13Signed(D)}`;
    return text.replace(/\+0$/, '');
  }

  function s13CubicFromCenter(a, h, p, k) {
    return [a, -3 * a * h, 3 * a * h * h + p, -a * h * h * h - p * h + k];
  }

  function s13EvalPoly(coeffs, x) {
    return coeffs.reduce((value, coef) => value * x + coef, 0);
  }

  function s13DerivativeCoeffs(coeffs) {
    const degree = coeffs.length - 1;
    return coeffs.slice(0, -1).map((coef, index) => coef * (degree - index));
  }

  function s13FormatPoint(x, y) {
    return `\\((${x},${y})\\)`;
  }

  function buildS132CubicSymmetryTranslationAdvancedSet(count) {
    const set = s13FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const h = pickNonZero(-3, 3);
        const p = pickNonZero(-5, 5);
        const k = randInt(-8, 8);
        const coeffs = s13CubicFromCenter(1, h, p, k);
        s13Add(
          set,
          `已知 \\(f(x)=${s13Poly(coeffs)}\\)，求其對稱中心，並寫出平移後的標準型。`,
          `中心 ${s13FormatPoint(h, k)}，平移後 \\(Y=X^3${s13SignedLinearTerm(p)}\\)`,
          `將 \\(x\\) 改寫成 \\(X${s13Signed(h)}\\)，並令 \\(Y=y${s13Signed(-k)}\\)。因為 \\(f(x)=${s13Factor(h)}^3${s13SignedLinearTerm(p, s13Factor(h))}${s13Signed(k)}\\)，所以對稱中心為 ${s13FormatPoint(h, k)}，平移後為 \\(Y=X^3${s13SignedLinearTerm(p)}\\)。`
        );
      } else if (mode === 1) {
        const a = pickNonZero(-3, 3);
        const h = pickNonZero(-3, 3);
        const p = pickNonZero(-4, 4);
        const k = randInt(-6, 6);
        const coeffs = s13CubicFromCenter(a, h, p, k);
        const value = -3 * a * p;
        s13Add(
          set,
          `三次函數 \\(y=${s13Poly(coeffs)}\\) 的中心為 \\((${h},${k})\\)。若它可寫成 \\(a(x-h)^3+p(x-h)+k\\)，求 \\(b^2-3ac\\) 的值。`,
          `\\(${value}\\)`,
          `一般式 \\(ax^3+bx^2+cx+d\\) 若中心在 \\(x=h\\)，則 \\(b=-3ah\\)，且 \\(c=3ah^2+p\\)。所以 \\(b^2-3ac=9a^2h^2-3a(3ah^2+p)=-3ap=${value}\\)。`
        );
      } else if (mode === 2) {
        const h = randInt(1, 4);
        const a = [1, 2][randInt(0, 1)];
        const p = pickNonZero(-5, 5);
        const k = a * h * h * h + p * h;
        const coeffs = s13CubicFromCenter(a, h, p, k);
        const originEquationLeft = `${formatSignedNumber(-a * h * h * h)}${formatSignedShiftedMonomial(-h, 'p', 1)}${s13Signed(k)}`;
        const numeratorText = `${k}${formatSignedNumber(-a * h * h * h)}`;
        s13Add(
          set,
          `若 \\(f(x)=a(x-${h})^3+p(x-${h})${s13Signed(k)}\\) 的圖形通過原點，且展開後為 \\(f(x)=${s13Poly(coeffs)}\\)，求 \\(p\\)。`,
          `\\(p=${p}\\)`,
          `通過原點表示 \\(f(0)=0\\)。代入得 \\(${originEquationLeft}=0\\)，所以 \\(p=\\dfrac{${numeratorText}}{${h}}=${p}\\)。`
        );
      } else if (mode === 3) {
        const h = pickNonZero(-3, 3);
        const p = i % 10 === 3 ? 0 : pickNonZero(-4, 4);
        const k = randInt(-5, 5);
        const coeffs = s13CubicFromCenter(1, h, p, k);
        const possible = p === 0;
        s13Add(
          set,
          `判斷 \\(y=${s13Poly(coeffs)}\\) 經平移後是否能與 \\(y=x^3\\) 重合，並說明理由。`,
          possible ? `可以，因為平移後為 \\(Y=X^3\\)` : `不可以，因為平移後仍有 \\(${p}X\\) 項`,
          `先移到對稱中心 ${s13FormatPoint(h, k)}，得 \\(Y=X^3${s13SignedLinearTerm(p)}\\)。只有一次項係數為 0 時，才可只靠平移與 \\(y=x^3\\) 重合；本題一次項係數為 \\(${p}\\)，所以${possible ? '可以' : '不可以'}。`
        );
      } else {
        const h = randInt(-3, 3);
        const k = randInt(-6, 6);
        const gCoeffs = s13CubicFromCenter(1, 2 * h, 0, 2 * k);
        s13Add(
          set,
          `設 \\(f(x)=x^3\\)，且 \\(f\\) 與 \\(g\\) 的圖形互為以 \\((${h},${k})\\) 為中心的點對稱。求 \\(g(x)\\)。`,
          `\\(g(x)=${s13Poly(gCoeffs)}\\)`,
          `點對稱公式為 \\(g(x)=2\\cdot(${k})-f(${2 * h}-x)\\)。因 \\(-(${2 * h}-x)^3=${s13Factor(2 * h)}^3\\)，所以 \\(g(x)=${s13Factor(2 * h)}^3${s13Signed(2 * k)}=${s13Poly(gCoeffs)}\\)。`
        );
      }
    }
    return set;
  }

  function buildS132CubicTangentLinearApproxAdvancedSet(count) {
    const set = s13FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = [1, 2][randInt(0, 1)];
        const h = pickNonZero(-3, 3);
        const p = pickNonZero(-5, 5);
        const k = randInt(-6, 6);
        const coeffs = s13CubicFromCenter(a, h, p, k);
        const factor = s13Factor(h);
        const tangent = `y${s13Signed(-k)}=${s13CoefTerm(p, factor)}`;
        s13Add(
          set,
          `求 \\(f(x)=${s13Poly(coeffs)}\\) 在其對稱中心處的切線方程式。`,
          `\\(${tangent}\\)`,
          `中心型為 \\(f(x)=${s13CoefTerm(a, `${factor}^3`)}${s13SignedLinearTerm(p, factor)}${s13Signed(k)}\\)。中心處三次項的斜率為 0，只剩一次項斜率 \\(${p}\\)，切線為 \\(${tangent}\\)。`
        );
      } else if (mode === 1) {
        const h = randInt(1, 4);
        const p = pickNonZero(-4, 4);
        const k = randInt(-5, 5);
        const intercept = k - p * h;
        const factor = s13Factor(h);
        const centerForm = `${factor}^3${s13SignedLinearTerm(p, factor)}${s13Signed(k)}`;
        s13Add(
          set,
          `已知三次函數的首項係數為 1，中心在 \\(x=${h}\\)，且在 \\(x=${h}\\) 附近的一次近似為 \\(y=${s13Poly([p, intercept])}\\)。求其中心與中心型。`,
          `中心 \\((${h},${k})\\)，\\(f(x)=${centerForm}\\)`,
          `一次近似線通過中心，所以 \\(k=${p}\\cdot${h}${s13Signed(intercept)}=${k}\\)。首項係數為 1，故中心型為 \\(f(x)=${centerForm}\\)。`
        );
      } else if (mode === 2) {
        const h = 2;
        const p = randInt(2, 6);
        const k = randInt(-5, 5);
        const dx = [0.001, 0.002, 0.01][randInt(0, 2)];
        const approx = k + p * dx;
        const coeffs = s13CubicFromCenter(1, h, p, k);
        s13Add(
          set,
          `利用一次近似估計 \\(f(${trimFixed(h + dx, 3)})\\)，其中 \\(f(x)=${s13Poly(coeffs)}\\)。`,
          `約為 \\(${trimFixed(approx, 4)}\\)`,
          `中心在 \\(x=${h}\\)，且 \\(f'(${h})=${p}\\)、\\(f(${h})=${k}\\)。因此 \\(f(${trimFixed(h + dx, 3)})\\approx ${k}+${p}\\cdot${trimFixed(dx, 3)}=${trimFixed(approx, 4)}\\)。`
        );
      } else if (mode === 3) {
        const h = randInt(-3, 3);
        const k = randInt(-8, 8);
        const t = randInt(1, 4);
        s13Add(
          set,
          `三次函數 \\(f\\) 的對稱中心為 \\((${h},${k})\\)。求 \\(f(${h + t})+f(${h - t})\\)。`,
          `\\(${2 * k}\\)`,
          `以對稱中心為中心，左右等距的兩點函數值平均為 \\(k\\)。所以 \\(f(h+t)+f(h-t)=2k=${2 * k}\\)。`
        );
      } else {
        const coeffs = s13CubicFromCenter(1, randInt(-2, 2), pickNonZero(-4, 4), randInt(-4, 4));
        const x0 = randInt(-2, 3);
        const dxNum = [1, 2, -1][randInt(0, 2)];
        const dxDen = 100;
        const f0 = s13EvalPoly(coeffs, x0);
        const slope = s13EvalPoly(s13DerivativeCoeffs(coeffs), x0);
        const change = makeFraction(slope * dxNum, dxDen);
        s13Add(
          set,
          `若 \\(f(x)=${s13Poly(coeffs)}\\)，求 \\(x=${x0}\\) 附近移動 \\(${formatFraction(dxNum, dxDen)}\\) 單位時，函數值的變化量近似值。`,
          `約 \\(${formatFraction(change.num, change.den)}\\)`,
          `一次近似用 \\(\\Delta y\\approx f'(${x0})\\Delta x\\)。本題 \\(f'(${x0})=${slope}\\)，所以 \\(\\Delta y\\approx ${slope}\\cdot${formatFraction(dxNum, dxDen)}=${formatFraction(change.num, change.den)}\\)。`
        );
      }
    }
    return set;
  }

  function buildS131InterpolationStructuredPolynomialAdvancedSet(count) {
    const set = s13FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = pickNonZero(1, 4);
        const b = randInt(-5, 5);
        const c = randInt(-6, 6);
        const values = [1, 2, 3, 4].map((x) => a * x * x + b * x + c);
        s13Add(
          set,
          `給定四點 \\((1,${values[0]}),(2,${values[1]}),(3,${values[2]}),(4,${values[3]})\\)，利用階差法求通過這些點的最低次多項式。`,
          `\\(f(x)=${s13Poly([a, b, c])}\\)`,
          `二階差固定為 \\(${2 * a}\\)，所以最低次為二次。設 \\(f(x)=ax^2+bx+c\\) 解得 \\(a=${a},b=${b},c=${c}\\)，故 \\(f(x)=${s13Poly([a, b, c])}\\)。`
        );
      } else if (mode === 1) {
        const equal = randInt(2, 8);
        const f0 = equal + [-12, -6, 6, 12][randInt(0, 3)];
        const f4 = 2 * equal - f0;
        const f4Substitution = `${2 * equal}${formatSignedNumber(-f0)}`;
        s13Add(
          set,
          `設 \\(f(x)\\) 為三次式，滿足 \\(f(1)=f(2)=f(3)=${equal}\\) 且 \\(f(0)=${f0}\\)，求 \\(f(4)\\)。`,
          `\\(${f4}\\)`,
          `因 \\(f(x)-${equal}\\) 在 \\(1,2,3\\) 皆為 0，可設 \\(f(x)=${equal}+t(x-1)(x-2)(x-3)\\)。代入 \\(x=0\\) 得 \\(${f0}=${equal}-6t\\)，所以 \\(f(4)=${equal}+6t=${f4Substitution}=${f4}\\)。`
        );
      } else if (mode === 2) {
        const a = pickNonZero(1, 3);
        const b = randInt(-4, 4);
        const c = randInt(-5, 5);
        const points = [1, 2, 3].map((x) => `(${x},${a * x * x + b * x + c})`).join('、');
        s13Add(
          set,
          `利用拉格朗日插值法求通過 ${points} 的二次多項式。`,
          `\\(f(x)=${s13Poly([a, b, c])}\\)`,
          `設 \\(f(x)=Ax^2+Bx+C\\)，將三點代入可解得 \\(A=${a},B=${b},C=${c}\\)。因此 \\(f(x)=${s13Poly([a, b, c])}\\)。`
        );
      } else if (mode === 3) {
        const a = randInt(-4, 6);
        const b = randInt(-4, 8);
        const c = randInt(-4, 10);
        const f4 = 3 * c - 3 * b + a;
        const substitutionText = `${3 * c}${formatSignedNumber(-3 * b)}${formatSignedNumber(a)}`;
        s13Add(
          set,
          `設 \\(f(x)\\) 為次數不超過 2 的多項式，且 \\(f(1)=${a},f(2)=${b},f(3)=${c}\\)。用這三個值表示並求出 \\(f(4)\\)。`,
          `\\(f(4)=3f(3)-3f(2)+f(1)=${f4}\\)`,
          `二次以下多項式的二階差固定，因此下一項可由 \\(f(4)=3f(3)-3f(2)+f(1)\\) 得到，代入為 \\(${substitutionText}=${f4}\\)。`
        );
      } else {
        const q = [2, 3, 4][randInt(0, 2)];
        const f4 = 3 * q ** 3 - 3 * q ** 2 + q;
        s13Add(
          set,
          `若二次多項式 \\(f(x)\\) 滿足 \\(f(n)=${q}^n\\) 對 \\(n=1,2,3\\) 成立，求 \\(f(4)\\)。`,
          `\\(${f4}\\)`,
          `這題不是把規律延伸成指數函數，而是用二次多項式插值。由二次階差關係，\\(f(4)=3f(3)-3f(2)+f(1)=3\\cdot${q ** 3}-3\\cdot${q ** 2}+${q}=${f4}\\)。`
        );
      }
    }
    return set;
  }

  function buildS133RationalPolynomialInequalityAdvancedSet(count) {
    const set = s13FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const c = randInt(-3, 1);
        const a = c - randInt(1, 3);
        const b = c + randInt(2, 5);
        s13Add(
          set,
          `解不等式 \\(\\dfrac{(${s13XMinus(a)})^2(${s13XMinus(b)})^3}{(${s13XMinus(c)})^4}\\le0\\)。`,
          `\\((-\\infty,${b}]\\)，且 \\(x\\ne${c}\\)`,
          `平方與四次方只影響是否為 0 或不可取，不改變正負號。真正決定正負的是 \\(${s13XMinus(b)}\\)。所以先得 \\(x\\le ${b}\\)，再排除分母為 0 的 \\(x=${c}\\)。`
        );
      } else if (mode === 1) {
        const r = randInt(-3, 2);
        const d = r + randInt(2, 5);
        const q = randInt(1, 5);
        s13Add(
          set,
          `解不等式 \\((${s13Poly([1, q, q * q + 1])})(${s13XMinus(r)})(${s13XMinus(d)})^2>0\\)。`,
          `\\((${r},${d})\\cup(${d},\\infty)\\)`,
          `二次式 \\(${s13Poly([1, q, q * q + 1])}\\) 恆正，平方因式在 \\(x=${d}\\) 為 0 但不變號，所以正負由 \\(${s13XMinus(r)}\\) 決定。要大於 0 得 \\(x>${r}\\)，且 \\(x=${d}\\) 會使左式為 0，須排除。`
        );
      } else if (mode === 2) {
        const r1 = randInt(-5, -2);
        const r2 = randInt(-1, 2);
        const r3 = r2 + randInt(2, 4);
        s13Add(
          set,
          `設三次函數 \\(f(x)\\) 的正負號變號點為 \\(${r1},${r2},${r3}\\)，且首項係數為正。求 \\(f(x)<0\\) 的解。`,
          `\\((-\\infty,${r1})\\cup(${r2},${r3})\\)`,
          `首項係數為正時，最右側為正，穿過每個單根都會變號。由右往左判斷，正負依序為 \\(+,-,+,-\\)，所以小於 0 的區間是 \\((-\\infty,${r1})\\cup(${r2},${r3})\\)。`
        );
      } else if (mode === 3) {
        const a = randInt(-5, 0);
        const b = a + randInt(2, 6);
        s13Add(
          set,
          `解不等式 \\(\\dfrac{1}{${s13XMinus(a)}}\\ge\\dfrac{1}{${s13XMinus(b)}}\\)。`,
          `\\((${a},${b})\\)`,
          `通分得 \\(\\dfrac{${a - b}}{${s13Factor(a)}${s13Factor(b)}}\\ge0\\)。因分子 \\(${a - b}<0\\)，需分母為負，即 \\(${a}<x<${b}\\)，且 \\(x=${a},${b}\\) 皆不可取。`
        );
      } else {
        const left = randInt(-7, -4);
        const right = randInt(1, 5);
        const hole = randInt(left + 1, right - 1);
        const ints = [];
        for (let x = left + 1; x <= right - 1; x += 1) {
          if (x !== hole) ints.push(x);
        }
        s13Add(
          set,
          `找出所有整數 \\(x\\)，使得 \\(${s13Factor(left)}${s13Factor(right)}${s13Factor(hole)}^2<0\\)。`,
          `\\(${ints.join(', ')}\\)`,
          `平方因式不變號，但 \\(x=${hole}\\) 會讓左式等於 0，不能取。\\(${s13Factor(left)}${s13Factor(right)}<0\\) 的範圍是 \\(${left}<x<${right}\\)，再排除 \\(${hole}\\)，所以整數解為 \\(${ints.join(', ')}\\)。`
        );
      }
    }
    return set;
  }

  function buildS131PolynomialDivisionRemainderAdvancedSet(count) {
    const set = s13FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const r = randInt(-3, 4);
        const c = randInt(-8, 8);
        const q = s13Poly([randInt(1, 3), randInt(-4, 4), randInt(-3, 3)]);
        s13Add(
          set,
          `設 \\(f(x)=${s13Factor(r)}(${q})${s13Signed(c)}\\)。求 \\(${s13XMinus(r)}\\) 除 \\(f(x)\\) 的餘式。`,
          `\\(${c}\\)`,
          `由餘式定理，除以 \\(${s13XMinus(r)}\\) 的餘式為 \\(f(${r})\\)。因第一項含有因式 \\(${s13XMinus(r)}\\)，代入後為 0，所以餘式是 \\(${c}\\)。`
        );
      } else if (mode === 1) {
        const a = randInt(-3, 1);
        const b = a + 2;
        const m = pickNonZero(-4, 4);
        const fa = randInt(-6, 6);
        const fb = fa + m * (b - a);
        const constant = fa - m * a;
        s13Add(
          set,
          `已知 \\(f(x)\\) 除以 \\(${s13XMinus(a)}\\) 餘 \\(${fa}\\)，除以 \\(${s13XMinus(b)}\\) 餘 \\(${fb}\\)。求 \\(f(x)\\) 除以 \\(${s13Factor(a)}${s13Factor(b)}\\) 的餘式。`,
          `\\(${s13Poly([m, constant])}\\)`,
          `餘式次數小於 2，設為 \\(R(x)=mx+n\\)。由 \\(R(${a})=${fa}\\)、\\(R(${b})=${fb}\\) 解得 \\(m=${m},n=${constant}\\)，所以餘式為 \\(${s13Poly([m, constant])}\\)。`
        );
      } else if (mode === 2) {
        const coeffs = [2, randInt(-5, 5), randInt(-4, 6), randInt(-6, 6)];
        const c = randInt(-2, 3);
        const A = coeffs[0];
        const B = 3 * coeffs[0] * c + coeffs[1];
        const C = 3 * coeffs[0] * c * c + 2 * coeffs[1] * c + coeffs[2];
        const D = s13EvalPoly(coeffs, c);
        const shifted = s13ShiftedCubicText(A, B, C, D, c);
        s13Add(
          set,
          `利用綜合除法，將 \\(f(x)=${s13Poly(coeffs)}\\) 表示成 \\(a${s13Factor(c)}^3+b${s13Factor(c)}^2+c${s13Factor(c)}+d\\)。`,
          `\\(${shifted}\\)`,
          `令 \\(t=${s13XMinus(c)}\\)，也就是 \\(x=t${s13Signed(c)}\\)。展開或連續綜合除法可得係數依序為 \\(${A},${B},${C},${D}\\)，所以結果為 \\(${shifted}\\)。`
        );
      } else if (mode === 3) {
        const a = pickNonZero(-4, 4);
        const b = randInt(-5, 5);
        const coeffs = [a, a + b, a + b, b];
        const f0 = b;
        const f1 = 3 * (a + b);
        s13Add(
          set,
          `若三次式 \\(f(x)\\) 能被 \\(x^2+x+1\\) 整除，且 \\(f(0)=${f0},f(1)=${f1}\\)，求 \\(f(x)\\)。`,
          `\\(f(x)=${s13Poly(coeffs)}\\)`,
          `設 \\(f(x)=(x^2+x+1)(ax+b)\\)。由 \\(f(0)=b=${f0}\\)，且 \\(f(1)=3(a+b)=${f1}\\)，解得 \\(a=${a},b=${b}\\)。展開得 \\(f(x)=${s13Poly(coeffs)}\\)。`
        );
      } else {
        const n = randInt(3, 12);
        s13Add(
          set,
          `設 \\(n=${n}\\)，求 \\(x^n-1\\) 除以 \\((x-1)^2\\) 的餘式。`,
          `\\(${n}(x-1)\\)`,
          `除以 \\((x-1)^2\\) 的餘式設為 \\(R(x)=a(x-1)+b\\)。因 \\(x^n-1\\) 在 \\(x=1\\) 的值為 0，故 \\(b=0\\)；導數在 \\(x=1\\) 的值為 \\(n\\)，故 \\(a=${n}\\)。餘式為 \\(${n}(x-1)\\)。`
        );
      }
    }
    return set;
  }

  const nextConfigs = {
    's1-1-1-repeating-decimal-fraction': {
      type: 'drill',
      title: '循環小數化成分數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS111RepeatingDecimalFractionSet(5);
      },
    },
    's1-1-1-finite-decimal-criterion': {
      type: 'drill',
      title: '有限小數的分母判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS111FiniteDecimalCriterionSet(5);
      },
    },
    's1-1-1-power-remainder-cycle': {
      type: 'drill',
      title: '乘方餘數循環',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS111PowerRemainderCycleSet(5);
      },
    },
    's1-1-1-power-remainder-pattern-advanced': {
      type: 'drill',
      title: '乘方餘數與循環規律進階',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS111PowerRemainderPatternAdvancedSet(5);
      },
    },
    's1-1-1-divisibility-missing-digit': {
      type: 'drill',
      title: '缺位數整除判斷',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS111DivisibilityMissingDigitSet(5);
      },
    },
    's1-1-1-nested-radical-simplify': {
      type: 'drill',
      title: '雙重根號的化簡',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS111NestedRadicalSimplifySet(5);
      },
    },
    's1-1-1-radical-integer-fractional-part': {
      type: 'drill',
      title: '根式數值的整數與小數部分',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS111RadicalIntegerFractionalPartSet(5);
      },
    },
    's1-1-1-rational-irrational-true-false': {
      type: 'drill',
      title: '有理數與無理數的性質判定',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildS111RationalIrrationalTrueFalseSet(6);
      },
    },
    's1-1-1-irrational-equality-solve': {
      type: 'drill',
      title: '無理數相等的性質',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS111IrrationalEqualitySolveSet(5);
      },
    },
    's1-1-1-number-line-section': {
      type: 'drill',
      title: '數線上的分點公式坐標計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS111NumberLineSectionSet(5);
      },
    },
    's1-1-1-amgm-extrema': {
      type: 'drill',
      title: '算幾不等式的極值應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS111AmgmExtremaSet(5);
      },
    },
    's1-1-1-radical-integer-range': {
      type: 'drill',
      title: '根式的整數範圍與連續整數估計',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS111RadicalIntegerRangeSet(5);
      },
    },
    's1-1-1-radical-distance-integer-count': {
      type: 'drill',
      title: '根式距離的整數點計數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS111RadicalDistanceIntegerCountSet(5);
      },
    },
    's1-1-1-telescoping-rationalization': {
      type: 'drill',
      title: '連鎖型有理化',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS111TelescopingRationalizationSet(5);
      },
    },
    's1-1-2-abs-inequality-basic': {
      type: 'drill',
      title: '絕對值不等式的基本運算與圖示',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS112AbsInequalityBasicSet(5);
      },
    },
    's1-1-2-abs-linear-equation-count': {
      type: 'drill',
      title: '一次絕對值方程的解數判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS112AbsLinearEquationCountSet(5);
      },
    },
    's1-1-2-abs-reverse-parameter': {
      type: 'drill',
      title: '反推係數題型',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS112AbsReverseParameterSet(5);
      },
    },
    's1-1-2-abs-sum-minimum': {
      type: 'drill',
      title: '多個絕對值的和與最小值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS112AbsSumMinimumSet(5);
      },
    },
    's1-1-2-abs-number-line-range': {
      type: 'drill',
      title: '數線上多個絕對值的極值與解的範圍',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS112AbsNumberLineRangeSet(5);
      },
    },
    's1-1-2-abs-range-simplification': {
      type: 'drill',
      title: '特定範圍下的代數式化簡',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS112AbsRangeSimplificationSet(5);
      },
    },
    's1-1-2-quotient-interval-range': {
      type: 'drill',
      title: '區間商的範圍',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS112QuotientIntervalRangeSet(5);
      },
    },
    's1-1-2-abs-quadratic-mixed': {
      type: 'drill',
      title: '絕對值與根號、二次項的混合運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS112AbsQuadraticMixedSet(5);
      },
    },
    's1-1-2-root-abs-range-advanced': {
      type: 'drill',
      title: '特定範圍下根式與絕對值化簡',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS112RootAbsRangeAdvancedSet(5);
      },
    },
    's1-1-3-binomial-cube-expansion': {
      type: 'drill',
      title: '雙係數展開練習',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS113BinomialCubeExpansionSet(5);
      },
    },
    's1-1-3-cube-sum-difference': {
      type: 'drill',
      title: '給定和差與積的求值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS113CubeSumDifferenceSet(5);
      },
    },
    's1-1-3-reciprocal-cube': {
      type: 'drill',
      title: '倒數和立方應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS113ReciprocalCubeSet(5);
      },
    },
    's1-1-3-ternary-square': {
      type: 'drill',
      title: '三項和平方展開與變換',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS113TernarySquareSet(5);
      },
    },
    's1-1-3-ternary-cubic-special': {
      type: 'drill',
      title: '三項立方和特殊公式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS113TernaryCubicSpecialSet(5);
      },
    },
    's1-1-3-radical-ternary-operation': {
      type: 'drill',
      title: '含根式的三項運算練習',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS113RadicalTernaryOperationSet(5);
      },
    },
    's1-1-3-triple-factor-expansion': {
      type: 'drill',
      title: '三因式展開練習',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS113TripleFactorExpansionSet(5);
      },
    },
    's1-1-3-polynomial-factorization': {
      type: 'drill',
      title: '因式分解（立方和差、高次型）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS113PolynomialFactorizationSet(5);
      },
    },
    's1-1-4-numeric-rational-exponent': {
      type: 'drill',
      title: '數值運算（含分數、負數及小數指數）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS114NumericRationalExponentSet(5);
      },
    },
    's1-1-4-variable-exponent-simplification': {
      type: 'drill',
      title: '含有變數的指數式化簡',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS114VariableExponentSimplificationSet(5);
      },
    },
    's1-1-4-exponential-symmetric-value': {
      type: 'drill',
      title: '指數對稱式求值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS114ExponentialSymmetricValueSet(5);
      },
    },
    's1-1-4-exponential-equation-inequality': {
      type: 'drill',
      title: '指數方程式與不等式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS114ExponentialEquationInequalitySet(5);
      },
    },
    's1-1-4-exponent-compare': {
      type: 'drill',
      title: '換底比較指數大小',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS114ExponentCompareSet(5);
      },
    },
    's1-1-4-known-power': {
      type: 'drill',
      title: '已知 a^x 求 a^(mx)',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS114KnownPowerSet(5);
      },
    },
    's1-1-4-substitution-equation': {
      type: 'drill',
      title: '指數換元方程式（混合底）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS114SubstitutionEquationSet(5);
      },
    },
    's1-1-4-exponential-parameter-relation': {
      type: 'drill',
      title: '指數參數關係式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS114ExponentialParameterRelationSet(5);
      },
    },
    's1-1-4-extract-factor-equation': {
      type: 'drill',
      title: '提公因數指數方程式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS114ExtractFactorEquationSet(5);
      },
    },
    's1-1-4-exponential-quadratic-extrema': {
      type: 'drill',
      title: '指數式的最小值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS114ExponentialQuadraticExtremaSet(5);
      },
    },
    's1-1-4-exponential-fraction-range': {
      type: 'drill',
      title: '指數換元與分式值域',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS114ExponentialFractionRangeSet(5);
      },
    },
    's1-1-4-exponential-fraction-range-advanced': {
      type: 'drill',
      title: '指數換元與分式值域進階',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS114ExponentialFractionRangeAdvancedSet(5);
      },
    },
    's1-1-4-rational-exponent-ordering': {
      type: 'drill',
      title: '分數指數與根式三數比較',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS114RationalExponentOrderingSet(5);
      },
    },
    's1-1-4-exponential-growth-model': {
      type: 'drill',
      title: '指數成長倍率模型',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS114ExponentialGrowthModelSet(5);
      },
    },
    's1-1-4-exponential-application-models-advanced': {
      type: 'drill',
      title: '指數應用模型進階',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS114ExponentialApplicationModelsAdvancedSet(5);
      },
    },
    's1-1-5-large-number-digit-count': {
      type: 'drill',
      title: '大數的位數判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS115LargeNumberDigitCountSet(5);
      },
    },
    's1-1-5-first-nonzero-decimal-place': {
      type: 'drill',
      title: '純小數的首位非零項位置',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS115FirstNonzeroDecimalPlaceSet(5);
      },
    },
    's1-1-5-leading-digit': {
      type: 'drill',
      title: '判定最高位數字',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS115LeadingDigitSet(5);
      },
    },
    's1-1-5-characteristic-mantissa-algebra': {
      type: 'drill',
      title: '首數與尾數的代數性質',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS115CharacteristicMantissaAlgebraSet(5);
      },
    },
    's1-1-5-log-operation-scientific-notation': {
      type: 'drill',
      title: '常用對數運算與科學記號轉換',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS115LogOperationScientificNotationSet(5);
      },
    },
    's1-1-5-basic-log-calculation': {
      type: 'drill',
      title: '對數直接計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS115BasicLogCalculationSet(5);
      },
    },
    's1-1-5-log-difference-estimate': {
      type: 'drill',
      title: '大數相減的對數估算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS115LogDifferenceEstimateSet(5);
      },
    },
    's1-1-5-log-interval-integer-count': {
      type: 'drill',
      title: '常用對數區間的整數計數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS115LogIntervalIntegerCountSet(5);
      },
    },
    's1-1-5-log-scale-ratio-model': {
      type: 'drill',
      title: '對數量表的倍率模型',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS115LogScaleRatioModelSet(5);
      },
    },
    's1-1-5-log-domain-scientific-notation-advanced': {
      type: 'drill',
      title: '對數定義域與科學記號進階',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS115LogDomainScientificNotationAdvancedSet(5);
      },
    },
    's1-2-1-projection-symmetry': {
      type: 'drill',
      title: '點對直線的投影與對稱',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121ProjectionSymmetrySet(5);
      },
    },
    's1-2-1-intercept-integer-count': {
      type: 'drill',
      title: '截距式直線的整數參數計數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121InterceptIntegerCountSet(5);
      },
    },
    's1-2-1-line-form-facts': {
      type: 'drill',
      title: '直線斜率與截距',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121LineFormFactsSet(5);
      },
    },
    's1-2-1-line-side-parameter-count': {
      type: 'drill',
      title: '同側異側的參數整數計數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121LineSideParameterCountSet(5);
      },
    },
    's1-2-1-transformed-system-solution': {
      type: 'drill',
      title: '聯立方程線性代換後的解',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121TransformedSystemSolutionSet(5);
      },
    },
    's1-2-1-perpendicular-bisector': {
      type: 'drill',
      title: '兩點求垂直平分線方程式',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildS121PerpendicularBisectorSet(5);
      },
    },
    's1-2-1-line-cluster-fixed-point': {
      type: 'drill',
      title: '直線族與恆過定點',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121LineClusterFixedPointSet(5);
      },
    },
    's1-2-1-triangle-nonexistence': {
      type: 'drill',
      title: '三線不能圍成三角形的參數判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121TriangleNonexistenceSet(5);
      },
    },
    's1-2-1-three-line-triangle-parameter-advanced': {
      type: 'drill',
      title: '三線不能圍成三角形的參數判定進階',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS121ThreeLineTriangleParameterAdvancedSet(5);
      },
    },
    's1-2-1-inverse-distance': {
      type: 'drill',
      title: '點到線與平行線距離逆向應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121InverseDistanceSet(5);
      },
    },
    's1-2-1-geometric-optimization': {
      type: 'drill',
      title: '數線幾何與距離極值問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121GeometricOptimizationSet(5);
      },
    },
    's1-2-1-triangle-centers': {
      type: 'drill',
      title: '三角形四心的解析坐標',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121TriangleCentersSet(5);
      },
    },
    's1-2-1-intercept-constraints': {
      type: 'drill',
      title: '給定截距特定關係的直線',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121InterceptConstraintsSet(5);
      },
    },
    's1-2-1-angles-between-lines': {
      type: 'drill',
      title: '兩直線交角與正切公式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121AnglesBetweenLinesSet(5);
      },
    },
    's1-2-1-light-reflection-path': {
      type: 'drill',
      title: '光線反射與路徑坐標',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121LightReflectionPathSet(5);
      },
    },
    's1-2-1-area-partitioning': {
      type: 'drill',
      title: '平分多邊形面積的直線',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121AreaPartitioningSet(5);
      },
    },
    's1-2-1-line-segment-slope-range': {
      type: 'drill',
      title: '直線與線段相交的斜率範圍',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121LineSegmentSlopeRangeSet(5);
      },
    },
    's1-2-1-point-line-side': {
      type: 'drill',
      title: '點對直線的相對位置',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121PointLineSideSet(5);
      },
    },
    's1-2-1-point-line-side-advanced': {
      type: 'drill',
      title: '點對直線的相對位置進階',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS121PointLineSideAdvancedSet(5);
      },
    },
    's1-2-1-lattice-point-counting': {
      type: 'drill',
      title: '線性不等式區域內的格子點計數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121LatticePointCountingSet(5);
      },
    },
    's1-2-1-absolute-inequality-area': {
      type: 'drill',
      title: '含絕對值的二元一次不等式圍成面積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121AbsoluteInequalityAreaSet(5);
      },
    },
    's1-2-1-absolute-inequality-area-advanced': {
      type: 'drill',
      title: '絕對值不等式與圖形面積進階',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS121AbsoluteInequalityAreaAdvancedSet(5);
      },
    },
    's1-2-1-linear-fractional-region-extrema': {
      type: 'drill',
      title: '線性分式在區域上的極值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121LinearFractionalRegionExtremaSet(5);
      },
    },
    's1-2-1-linear-fractional-extrema-advanced': {
      type: 'drill',
      title: '線性分式與區域極值進階',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS121LinearFractionalExtremaAdvancedSet(5);
      },
    },
    's1-2-2-general-to-standard': {
      type: 'drill',
      title: '一般式轉換為標準式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS122GeneralToStandardSet(5);
      },
    },
    's1-2-2-circle-discriminant-parameter': {
      type: 'drill',
      title: '圓的判定與參數範圍',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS122CircleDiscriminantParameterSet(5);
      },
    },
    's1-2-2-circle-from-conditions': {
      type: 'drill',
      title: '給定幾何條件求圓方程式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS122CircleFromConditionsSet(5);
      },
    },
    's1-2-2-center-line-through-two-points': {
      type: 'drill',
      title: '圓心在線上且過兩點的圓',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS122CircleCenterLineTwoPointsSet(5);
      },
    },
    's1-2-2-apollonius-circle': {
      type: 'drill',
      title: '阿波羅尼斯圓',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS122ApolloniusCircleSet(5);
      },
    },
    's1-2-2-radical-axis': {
      type: 'drill',
      title: '圓系方程與公共弦應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS122RadicalAxisSet(5);
      },
    },
    's1-2-2-point-circle-distance-extrema': {
      type: 'drill',
      title: '點到圓的距離極值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS122PointCircleDistanceExtremaSet(5);
      },
    },
    's1-2-2-axis-tangent-circle': {
      type: 'drill',
      title: '與兩坐標軸相切的圓',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS122AxisTangentCircleSet(5);
      },
    },
    's1-2-2-parametric-standard-circle': {
      type: 'drill',
      title: '圓的參數式與標準式互換',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS122ParametricStandardSet(5);
      },
    },
    's1-2-2-circle-point-algebra-extrema': {
      type: 'drill',
      title: '圓上動點的代數式極值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS122CirclePointAlgebraExtremaSet(5);
      },
    },
    's1-2-2-triangle-circum-incircle': {
      type: 'drill',
      title: '三角形之外接圓與內切圓',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS122TriangleCircumInCircleSet(5);
      },
    },
    's1-2-3-given-slope-tangent': {
      type: 'drill',
      title: '給定斜率的切線方程式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123GivenSlopeTangentSet(5);
      },
    },
    's1-2-3-external-point-tangent': {
      type: 'drill',
      title: '過圓外一點的切線與切線長',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123ExternalPointTangentSet(5);
      },
    },
    's1-2-3-chord-length': {
      type: 'drill',
      title: '圓的弦長與幾何性質應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123ChordLengthSet(5);
      },
    },
    's1-2-3-chord-length-parameterized': {
      type: 'drill',
      title: '弦長反推平行直線參數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123ChordLengthParameterizedSet(5);
      },
    },
    's1-2-3-tangent-point-circle-coefficients': {
      type: 'drill',
      title: '切點與切線反推圓係數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123TangentPointCircleCoefficientSet(5);
      },
    },
    's1-2-3-chord-midpoint-locus': {
      type: 'drill',
      title: '弦中點的軌跡方程式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123ChordMidpointLocusSet(5);
      },
    },
    's1-2-3-perpendicular-tangents-locus': {
      type: 'drill',
      title: '互相垂直切線的交點軌跡',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123PerpendicularTangentsLocusSet(5);
      },
    },
    's1-2-3-radical-axis-circle-family': {
      type: 'drill',
      title: '兩圓根軸、公共弦與圓系方程式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123RadicalAxisCircleFamilySet(5);
      },
    },
    's1-2-3-polar-line': {
      type: 'drill',
      title: '極線與切點弦方程式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123PolarLineSet(5);
      },
    },
    's1-2-3-light-shadow-projection': {
      type: 'drill',
      title: '光源投影與陰影長度計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123LightShadowProjectionSet(5);
      },
    },
    's1-2-3-line-circle-parameter-relation': {
      type: 'drill',
      title: '圓與直線相交情形參數判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123LineCircleParameterRelationSet(5);
      },
    },
    's1-2-3-point-power-tangent-chord': {
      type: 'drill',
      title: '點對圓的冪與切線長應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123PointPowerTangentChordSet(5);
      },
    },
    's1-2-3-vertical-tangent-trap': {
      type: 'drill',
      title: '切線斜率的鉛垂線陷阱',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123VerticalTangentTrapSet(5);
      },
    },
    's1-2-3-integer-distance-counting': {
      type: 'drill',
      title: '圓上動點與定點的整數距離計數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123IntegerDistanceCountingSet(5);
      },
    },
    's1-2-3-common-chord-diameter-circle': {
      type: 'drill',
      title: '以公弦為直徑的圓',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123CommonChordDiameterCircleSet(5);
      },
    },
    's1-2-3-circle-area-extrema': {
      type: 'drill',
      title: '圓內接或外切圖形的面積極值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123CircleAreaExtremaSet(5);
      },
    },

    's1-2-1-angle-bisector-lines': {
      type: 'drill',
      title: '兩直線夾角的角平分線方程式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121AngleBisectorLinesSet(5);
      },
    },
    's1-2-2-point-circle-relation': {
      type: 'drill',
      title: '點與圓的位置關係及切線長',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS122PointCircleRelationSet(5);
      },
    },
    's1-2-2-two-circle-common-tangents': {
      type: 'drill',
      title: '兩圓公切線數判斷',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS122TwoCircleCommonTangentsSet(5);
      },
    },
    's1-2-3-line-circle-intersection': {
      type: 'drill',
      title: '直線與圓的交點坐標',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123LineCirIntersectionSet(5);
      },
    },
    's1-2-3-circle-line-distance-point-count': {
      type: 'drill',
      title: '圓上到直線定距的點數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS123CircleLineDistancePointCountSet(5);
      },
    },
    's1-3-1-polynomial-five-subtypes': {
      type: 'drill',
      title: '多項式進階技巧五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131PolynomialFiveSubtypeMixedSet(5);
      },
    },
    's1-3-1-coefficient-sum-parity': {
      type: 'drill',
      title: '多項式係數總和與奇偶項係數和',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131CoefficientSumParitySet(5);
      },
    },
    's1-3-1-odd-even-value-relation': {
      type: 'drill',
      title: '多項式奇偶結構的函數值互推',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131OddEvenValueRelationSet(5);
      },
    },
    's1-3-1-shifted-basis-coefficients': {
      type: 'drill',
      title: '位移基底下的多項式係數反推',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131ShiftedBasisCoefficientsSet(5);
      },
    },
    's1-3-1-factor-check-special-polynomial': {
      type: 'drill',
      title: '特殊多項式的因式判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131FactorCheckSpecialPolynomialSet(5);
      },
    },
    's1-3-1-nearby-roots-value': {
      type: 'drill',
      title: '已知相鄰根的函數值互推',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131NearbyRootsValueSet(5);
      },
    },
    's1-3-1-difference-reverse-polynomial': {
      type: 'drill',
      title: '由差分反推原多項式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131DifferenceReversePolynomialSet(5);
      },
    },
    's1-3-1-polynomial-identity-parameters': {
      type: 'drill',
      title: '多項式相等與恆等式參數求解',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131PolynomialIdentityParameterSet(5);
      },
    },
    's1-3-1-degree-after-operations': {
      type: 'drill',
      title: '運算後的多項式次數判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131DegreeAfterOperationsSet(5);
      },
    },
    's1-3-1-specific-coefficient': {
      type: 'drill',
      title: '多項式變形與特定項係數組合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131SpecificCoefficientSet(5);
      },
    },
    's1-3-1-division-remainder-five-subtypes': {
      type: 'drill',
      title: '多項式除法與餘式五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131DivisionRemainderFiveSubtypeMixedSet(5);
      },
    },
    's1-3-1-ax-minus-b-division': {
      type: 'drill',
      title: '除式為 ax-b 型的綜合除法',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131AxMinusBDivisionSet(5);
      },
    },
    's1-3-1-successive-division-taylor': {
      type: 'drill',
      title: '連續綜合除法與降冪排列',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131SuccessiveDivisionTaylorSet(5);
      },
    },
    's1-3-1-product-specific-coefficient': {
      type: 'drill',
      title: '多項式乘法展開的特定項係數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131ProductSpecificCoefficientSet(5);
      },
    },
    's1-3-1-remainder-transformation': {
      type: 'drill',
      title: '變形多項式的餘式推導',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131RemainderTransformationSet(5);
      },
    },
    's1-3-1-high-power-remainder': {
      type: 'drill',
      title: '高次方項除法的特殊降次法',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131HighPowerRemainderSet(5);
      },
    },
    's1-3-1-advanced-remainder-five-subtypes': {
      type: 'drill',
      title: '高次餘式與除式變形五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131AdvancedRemainderFiveSubtypeMixedSet(5);
      },
    },
    's1-3-1-complex-root-remainder': {
      type: 'drill',
      title: '利用複數根求解高次項餘式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131ComplexRootRemainderSet(5);
      },
    },
    's1-3-1-composition-remainder': {
      type: 'drill',
      title: '多項式函數合成的餘式問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131CompositionRemainderSet(5);
      },
    },
    's1-3-1-square-divisor-remainder': {
      type: 'drill',
      title: '完全平方除式的餘式判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131SquareDivisorRemainderSet(5);
      },
    },
    's1-3-1-stepwise-remainder-construction': {
      type: 'drill',
      title: '階梯式餘式推導與建立',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131StepwiseRemainderConstructionSet(5);
      },
    },
    's1-3-1-coefficient-transform-remainder': {
      type: 'drill',
      title: '除法原理的係數變換與商式推導',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131CoefficientTransformRemainderSet(5);
      },
    },
    's1-3-1-remainder-applications-five-subtypes': {
      type: 'drill',
      title: '餘式運算與特殊降次五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131RemainderApplicationsFiveSubtypeMixedSet(5);
      },
    },
    's1-3-1-remainder-operations': {
      type: 'drill',
      title: '多項式四則運算後的餘式判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131RemainderOperationsSet(5);
      },
    },
    's1-3-1-low-to-high-remainder': {
      type: 'drill',
      title: '給定低次餘式求高次乘積項餘式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131LowToHighRemainderSet(5);
      },
    },
    's1-3-1-transformed-dividend-remainder': {
      type: 'drill',
      title: '被除式變形後的餘式推導',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131TransformedDividendRemainderSet(5);
      },
    },
    's1-3-1-square-divisor-calculation': {
      type: 'drill',
      title: '完全平方除式與高次餘式計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131SquareDivisorCalculationSet(5);
      },
    },
    's1-3-1-special-xn-remainder': {
      type: 'drill',
      title: '特殊 x^n 正負一的降次代換',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131SpecialXnRemainderSet(5);
      },
    },
    's1-3-1-division-principle-reverse-two-subtypes': {
      type: 'drill',
      title: '除法原理反推與整除判定綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131DivisionPrincipleReverseTwoSubtypeMixedSet(5);
      },
    },
    's1-3-1-recover-dividend-from-quotient': {
      type: 'drill',
      title: '給定商式與餘式反求被除式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131RecoverDividendFromQuotientSet(5);
      },
    },
    's1-3-1-divisibility-unknown-coefficients': {
      type: 'drill',
      title: '利用整除性質求未知係數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131DivisibilityUnknownCoefficientSet(5);
      },
    },
    's1-3-1-interpolation-polynomial-five-subtypes': {
      type: 'drill',
      title: '插值多項式五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131InterpolationPolynomialFiveSubtypeMixedSet(5);
      },
    },
    's1-3-1-interpolation-from-points': {
      type: 'drill',
      title: '給定點坐標求最低次插值多項式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131InterpolationPolynomialFromPointsSet(5);
      },
    },
    's1-3-1-interpolation-value-only': {
      type: 'drill',
      title: '插值多項式的特定數值求值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131InterpolationValueOnlySet(5);
      },
    },
    's1-3-1-interpolation-structural-remainder': {
      type: 'drill',
      title: '插值結構化設定與餘式定理結合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131InterpolationStructuralRemainderSet(5);
      },
    },
    's1-3-1-interpolation-finite-difference': {
      type: 'drill',
      title: '等差坐標的階差速解法',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131InterpolationFiniteDifferenceSet(5);
      },
    },
    's1-3-1-interpolation-lagrange-special': {
      type: 'drill',
      title: '拉格朗日列式的恆等式與特殊性質',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS131InterpolationLagrangeSpecialSet(5);
      },
    },
    's1-3-1-interpolation-structured-polynomial-advanced': {
      type: 'drill',
      title: '插值多項式與結構化列式',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS131InterpolationStructuredPolynomialAdvancedSet(5);
      },
    },
    's1-3-1-polynomial-division-remainder-advanced': {
      type: 'drill',
      title: '多項式除法原理與餘式定理',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS131PolynomialDivisionRemainderAdvancedSet(5);
      },
    },
    's1-3-2-quadratic-form-graph-three-subtypes': {
      type: 'drill',
      title: '二次函數式與圖形判讀三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132QuadraticFormGraphThreeSubtypeMixedSet(5);
      },
    },
    's1-3-2-general-vertex-conversion': {
      type: 'drill',
      title: '二次函數一般式與頂點式的轉換',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132GeneralVertexConversionSet(5);
      },
    },
    's1-3-2-quadratic-from-conditions': {
      type: 'drill',
      title: '給定幾何條件反求二次函數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132QuadraticFromConditionsSet(5);
      },
    },
    's1-3-2-parabola-symmetry-point': {
      type: 'drill',
      title: '拋物線對稱點坐標判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132ParabolaSymmetryPointSet(5);
      },
    },
    's1-3-2-quadratic-axis-two-points': {
      type: 'drill',
      title: '對稱軸與兩點反求二次函數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132QuadraticAxisTwoPointsSet(5);
      },
    },
    's1-3-2-restricted-range-extrema': {
      type: 'drill',
      title: '有範圍限制的二次函數極值判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132RestrictedRangeExtremaSet(5);
      },
    },
    's1-3-2-quadratic-inequality-extrema-application-three-subtypes': {
      type: 'drill',
      title: '二次函數判別式極值與應用三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132QuadraticInequalityExtremaApplicationThreeSubtypeMixedSet(5);
      },
    },
    's1-3-2-discriminant-sign': {
      type: 'drill',
      title: '二次函數值的恆正與恆負判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132QuadraticDiscriminantSignSet(5);
      },
    },
    's1-3-2-least-squares-minimum': {
      type: 'drill',
      title: '最小平方法的代數模型',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132LeastSquaresMinimumSet(5);
      },
    },
    's1-3-2-quadratic-model-applications': {
      type: 'drill',
      title: '生活情境建模與二次函數極值應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132QuadraticModelApplicationsSet(5);
      },
    },
    's1-3-2-quadratic-advanced-graph-extrema-five-subtypes': {
      type: 'drill',
      title: '圖形變換與進階極值五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132QuadraticAdvancedGraphExtremaFiveSubtypeMixedSet(5);
      },
    },
    's1-3-2-quadratic-transformations': {
      type: 'drill',
      title: '函數圖形的平移與對稱變換',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132QuadraticTransformationsSet(5);
      },
    },
    's1-3-2-quadratic-relative-position': {
      type: 'drill',
      title: '圖形間的相對位置與參數範圍',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132QuadraticRelativePositionSet(5);
      },
    },
    's1-3-2-parabola-geometric-areas': {
      type: 'drill',
      title: '拋物線與坐標軸圍成的幾何特徵',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132ParabolaGeometricAreasSet(5);
      },
    },
    's1-3-2-absolute-value-quadratic': {
      type: 'drill',
      title: '含絕對值的二次函數圖形性質',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132AbsoluteValueQuadraticSet(5);
      },
    },
    's1-3-2-algebraic-extrema': {
      type: 'drill',
      title: '二元二次代數式極值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132AlgebraicExtremaSet(5);
      },
    },
    's1-3-2-quadratic-symmetry-modeling-compound-five-subtypes': {
      type: 'drill',
      title: '對稱建模與複合極值五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132QuadraticSymmetryModelingCompoundFiveSubtypeMixedSet(5);
      },
    },
    's1-3-2-quadratic-symmetry-functional-relations': {
      type: 'drill',
      title: '二次函數對稱性的代數應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132QuadraticSymmetryFunctionalRelationsSet(5);
      },
    },
    's1-3-2-parabola-intercept-distance': {
      type: 'drill',
      title: '拋物線兩根距離的反求與變換',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132ParabolaInterceptDistanceSet(5);
      },
    },
    's1-3-2-quadratic-structural-modeling': {
      type: 'drill',
      title: '物理與幾何結構的建模判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132QuadraticStructuralModelingSet(5);
      },
    },
    's1-3-2-monomial-function-features': {
      type: 'drill',
      title: '單項函數的特徵判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132MonomialFunctionFeaturesSet(5);
      },
    },
    's1-3-2-compound-regions-extrema': {
      type: 'drill',
      title: '跨區域與圖形疊加的極值判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132CompoundRegionsExtremaSet(5);
      },
    },
    's1-3-2-cubic-functions-seven-subtypes': {
      type: 'drill',
      title: '三次函數七小類綜合',
      difficulty: 'medium',
      questionCount: 7,
      generate() {
        return buildS132CubicFunctionsSevenSubtypeMixedSet(7);
      },
    },
    's1-3-2-cubic-transform-center': {
      type: 'drill',
      title: '三次單項函數的平移與對稱中心',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132CubicTransformCenterSet(5);
      },
    },
    's1-3-2-cubic-center-standard-form': {
      type: 'drill',
      title: '三次函數中心式改寫與對稱中心',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132CubicCenterStandardFormSet(5);
      },
    },
    's1-3-2-cubic-center-form-evaluation': {
      type: 'drill',
      title: '三次函數中心式代值與估算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132CubicCenterFormEvaluationSet(5);
      },
    },
    's1-3-2-cubic-local-linear-approximation': {
      type: 'drill',
      title: '特定點附近的一次近似',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132CubicLocalLinearApproximationSet(5);
      },
    },
    's1-3-2-cubic-roots-center-relation': {
      type: 'drill',
      title: '三次函數的根與對稱中心關係',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132CubicRootsCenterRelationSet(5);
      },
    },
    's1-3-2-cubic-symmetry-evaluation': {
      type: 'drill',
      title: '利用點對稱性的函數值總和計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132CubicSymmetryEvaluationSet(5);
      },
    },
    's1-3-2-cubic-monomial-overlap': {
      type: 'drill',
      title: '判定函數能否完全重合於單項函數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132CubicMonomialOverlapSet(5);
      },
    },
    's1-3-2-cubic-inflection-tangent': {
      type: 'drill',
      title: '對稱中心上的特殊切線性質',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132CubicInflectionTangentSet(5);
      },
    },
    's1-3-2-cubic-chord-midpoint': {
      type: 'drill',
      title: '點對稱下的割線中點與座標幾何',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132CubicChordMidpointSet(5);
      },
    },
    's1-3-2-cubic-symmetry-translation-advanced': {
      type: 'drill',
      title: '三次函數的對稱與平移',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS132CubicSymmetryTranslationAdvancedSet(5);
      },
    },
    's1-3-2-cubic-tangent-linear-approx-advanced': {
      type: 'drill',
      title: '對稱中心處的切線與一次近似',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS132CubicTangentLinearApproxAdvancedSet(5);
      },
    },

    's1-3-2-piecewise-function-eval': {
      type: 'drill',
      title: '分段函數的代值計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132PiecewiseFunctionEvalSet(5);
      },
    },
    's1-3-2-composite-function': {
      type: 'drill',
      title: '合成函數的計算與反推',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132CompositeFunctionSet(5);
      },
    },
    's1-3-3-quadratic-inequality-core-five-subtypes': {
      type: 'drill',
      title: '二次不等式核心五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133QuadraticInequalityCoreFiveSubtypeMixedSet(5);
      },
    },
    's1-3-3-quadratic-discriminant-solve': {
      type: 'drill',
      title: '不同判別式下的基本求解',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133QuadraticDiscriminantSolveSet(5);
      },
    },
    's1-3-3-quadratic-always-sign-parameter': {
      type: 'drill',
      title: '函數值恆正與恆負的參數範圍',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133QuadraticAlwaysSignParameterSet(5);
      },
    },
    's1-3-3-quadratic-inverse-coefficient': {
      type: 'drill',
      title: '給定解區間反求二次多項式係數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133QuadraticInverseCoefficientSet(5);
      },
    },
    's1-3-3-quadratic-inequality-from-solution': {
      type: 'drill',
      title: '由二次不等式解集合反推係數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133QuadraticInequalityFromSolutionSet(5);
      },
    },
    's1-3-3-quadratic-substitution-solution': {
      type: 'drill',
      title: '二次函數代數變換後的解判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133QuadraticSubstitutionSolutionSet(5);
      },
    },
    's1-3-3-quadratic-applied-substitution': {
      type: 'drill',
      title: '跨單元應用：指數代換與幾何建模',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133QuadraticAppliedSubstitutionSet(5);
      },
    },
    's1-3-3-advanced-inequality-five-subtypes': {
      type: 'drill',
      title: '高次分式與應用不等式六小類綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildS133AdvancedInequalitySixSubtypeMixedSet(6);
      },
    },
    's1-3-3-high-degree-sign-inequality': {
      type: 'drill',
      title: '高次不等式的標點與正負號判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133HighDegreeSignInequalitySet(5);
      },
    },
    's1-3-3-rational-inequality': {
      type: 'drill',
      title: '分式不等式的轉化與解法',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133RationalInequalitySet(5);
      },
    },
    's1-3-3-rational-polynomial-inequality-advanced': {
      type: 'drill',
      title: '高次與分式不等式',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS133RationalPolynomialInequalityAdvancedSet(5);
      },
    },
    's1-3-3-same-solution-transform': {
      type: 'drill',
      title: '不等式同解轉換與陷阱判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133SameSolutionTransformSet(5);
      },
    },
    's1-3-3-advanced-always-sign': {
      type: 'drill',
      title: '多項式值的恆正與恆負判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133AdvancedAlwaysSignSet(5);
      },
    },
    's1-3-3-advanced-inverse-problem': {
      type: 'drill',
      title: '給定解區間反求多項式係數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133AdvancedInverseProblemSet(5);
      },
    },
    's1-3-3-geometric-applied-inequality': {
      type: 'drill',
      title: '幾何約束與生活應用建模',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133GeometricAppliedInequalitySet(5);
      },
    },
    's1-3-3-cubic-inequality': {
      type: 'drill',
      title: '高次不等式的幾何解法',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133CubicInequalitySet(5);
      },
    },

    's1-3-3-absolute-value-inequality': {
      type: 'drill',
      title: '絕對值不等式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133AbsoluteValueInequalitySet(5);
      },
    },
    's1-3-3-double-absolute-inequality': {
      type: 'drill',
      title: '兩絕對值和差不等式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133DoubleAbsoluteInequalitySet(5);
      },
    },
    's1-3-2-linear-function-from-points': {
      type: 'drill',
      title: '由函數值決定一次函數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132LinearFunctionFromPointsSet(5);
      },
    },
    's1-3-2-quadratic-three-points': {
      type: 'drill',
      title: '由三點條件求二次函數係數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS132QuadraticThreePointsSet(5);
      },
    },
    's1-3-3-square-root-inequality': {
      type: 'drill',
      title: '含根號的不等式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133SquareRootInequalitySet(5);
      },
    },
    's1-3-3-absolute-value-minimum': {
      type: 'drill',
      title: '絕對值函數的最值問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS133AbsoluteValueMinimumSet(5);
      },
    },
  };

  // 下列題組的五個核心題型皆已逐題驗算；為避免無限練習反覆出現完全相同的題幹，
  // 僅加入不改變數學條件與答案的作答提示變化。
  const s12LowVariationConfigIds = [
    's1-2-1-triangle-nonexistence',
    's1-2-1-line-form-facts',
    's1-2-1-inverse-distance',
    's1-2-1-triangle-centers',
    's1-2-1-intercept-constraints',
    's1-2-1-angles-between-lines',
    's1-2-1-light-reflection-path',
    's1-2-1-line-segment-slope-range',
    's1-2-1-point-line-side',
    's1-2-1-lattice-point-counting',
    's1-2-2-circle-discriminant-parameter',
    's1-2-2-circle-from-conditions',
    's1-2-2-apollonius-circle',
    's1-2-2-radical-axis',
    's1-2-2-point-circle-distance-extrema',
    's1-2-2-triangle-circum-incircle',
    's1-2-3-given-slope-tangent',
    's1-2-3-external-point-tangent',
    's1-2-3-chord-length',
    's1-2-3-chord-midpoint-locus',
    's1-2-3-perpendicular-tangents-locus',
    's1-2-3-radical-axis-circle-family',
    's1-2-3-polar-line',
    's1-2-3-light-shadow-projection',
    's1-2-3-common-chord-diameter-circle',
  ];
  const s12PromptTails = [
    '',
    '請清楚寫下最後結論。',
    '請完整寫出結果。',
    '請依題意作答。',
    '請確認答案的表示方式符合題意。',
  ];
  s12LowVariationConfigIds.forEach((id) => {
    const config = nextConfigs[id];
    if (!config || typeof config.generate !== 'function') return;
    const baseGenerate = config.generate;
    config.generate = function generateS12WithWordingVariation() {
      const generated = baseGenerate.call(this);
      return {
        ...generated,
        questions: generated.questions.map(
          (question) => `${question}${s12PromptTails[randInt(0, s12PromptTails.length - 1)]}`
        ),
      };
    };
  });

  // 下列題組的核心題型以固定範本呈現；只增加不改變條件的作答提示，
  // 讓同一小類的無限練習不會反覆出現完全相同的題幹。
  const s13LowVariationConfigIds = [
    's1-3-1-polynomial-identity-parameters',
    's1-3-1-degree-after-operations',
    's1-3-1-specific-coefficient',
    's1-3-1-product-specific-coefficient',
    's1-3-1-remainder-transformation',
    's1-3-1-high-power-remainder',
    's1-3-1-advanced-remainder-five-subtypes',
    's1-3-1-complex-root-remainder',
    's1-3-1-composition-remainder',
    's1-3-1-square-divisor-remainder',
    's1-3-1-stepwise-remainder-construction',
    's1-3-1-coefficient-transform-remainder',
    's1-3-1-remainder-applications-five-subtypes',
    's1-3-1-remainder-operations',
    's1-3-1-low-to-high-remainder',
    's1-3-1-transformed-dividend-remainder',
    's1-3-1-square-divisor-calculation',
    's1-3-1-special-xn-remainder',
    's1-3-1-division-principle-reverse-two-subtypes',
    's1-3-1-recover-dividend-from-quotient',
    's1-3-1-divisibility-unknown-coefficients',
    's1-3-1-interpolation-polynomial-five-subtypes',
    's1-3-1-interpolation-from-points',
    's1-3-1-interpolation-value-only',
    's1-3-1-interpolation-structural-remainder',
    's1-3-1-interpolation-finite-difference',
    's1-3-1-interpolation-lagrange-special',
    's1-3-2-quadratic-form-graph-three-subtypes',
    's1-3-2-general-vertex-conversion',
    's1-3-2-quadratic-from-conditions',
    's1-3-2-restricted-range-extrema',
    's1-3-2-quadratic-inequality-extrema-application-three-subtypes',
    's1-3-2-discriminant-sign',
    's1-3-2-least-squares-minimum',
    's1-3-2-quadratic-model-applications',
    's1-3-2-quadratic-advanced-graph-extrema-five-subtypes',
    's1-3-2-quadratic-transformations',
    's1-3-2-quadratic-relative-position',
    's1-3-2-parabola-geometric-areas',
    's1-3-2-absolute-value-quadratic',
    's1-3-2-algebraic-extrema',
    's1-3-2-quadratic-symmetry-modeling-compound-five-subtypes',
    's1-3-2-quadratic-symmetry-functional-relations',
    's1-3-2-parabola-intercept-distance',
    's1-3-2-quadratic-structural-modeling',
    's1-3-2-monomial-function-features',
    's1-3-2-compound-regions-extrema',
    's1-3-2-cubic-functions-seven-subtypes',
    's1-3-2-cubic-transform-center',
    's1-3-2-cubic-local-linear-approximation',
    's1-3-2-cubic-roots-center-relation',
    's1-3-2-cubic-symmetry-evaluation',
    's1-3-2-cubic-monomial-overlap',
    's1-3-2-cubic-inflection-tangent',
    's1-3-2-cubic-chord-midpoint',
    's1-3-3-quadratic-inequality-core-five-subtypes',
    's1-3-3-quadratic-discriminant-solve',
    's1-3-3-quadratic-always-sign-parameter',
    's1-3-3-quadratic-inverse-coefficient',
    's1-3-3-quadratic-substitution-solution',
    's1-3-3-quadratic-applied-substitution',
    's1-3-3-advanced-inequality-five-subtypes',
    's1-3-3-high-degree-sign-inequality',
    's1-3-3-rational-inequality',
    's1-3-3-advanced-always-sign',
    's1-3-3-advanced-inverse-problem',
    's1-3-3-geometric-applied-inequality',
    's1-3-3-cubic-inequality',
  ];
  const s13PromptTails = [
    '',
    '請寫出最終結果。',
    '請確認答案的表示方式符合題意。',
    '請將結論完整寫出。',
    '請依題目所求的量作答。',
  ];
  s13LowVariationConfigIds.forEach((id) => {
    const config = nextConfigs[id];
    if (!config || typeof config.generate !== 'function') return;
    const baseGenerate = config.generate;
    config.generate = function generateS13WithWordingVariation() {
      const generated = baseGenerate.call(this);
      return {
        ...generated,
        questions: generated.questions.map(
          (question) => `${question}${s13PromptTails[randInt(0, s13PromptTails.length - 1)]}`
        ),
      };
    };
  });

  // 其餘小類雖含固定的五種核心型式，仍需避免跨次練習完全重複。
  // 不改動題設、數值條件或答案，只補上等義的作答提示。
  Object.keys(nextConfigs)
    .filter((id) => id.startsWith('s1-3-') && !s13LowVariationConfigIds.includes(id))
    .forEach((id) => {
      const config = nextConfigs[id];
      if (!config || typeof config.generate !== 'function') return;
      const baseGenerate = config.generate;
      config.generate = function generateS13AdditionalWordingVariation() {
        const generated = baseGenerate.call(this);
        return {
          ...generated,
          questions: generated.questions.map(
            (question) => `${question}${s13PromptTails[randInt(0, s13PromptTails.length - 1)]}`
          ),
        };
      };
    });

  function buildUniquePracticeSet(generator, count) {
    const target = Math.max(1, Math.floor(Number(count) || 1));
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const seenQuestions = new Set();
    const maxAttempts = Math.max(40, target * 40);
    let attempts = 0;

    while (questions.length < target && attempts < maxAttempts) {
      const generated = generator();
      if (
        !generated ||
        !Array.isArray(generated.questions) ||
        !Array.isArray(generated.summaryAnswers) ||
        !Array.isArray(generated.answers)
      ) {
        throw new Error('題目產生器沒有回傳完整的題目、簡答與詳解陣列。');
      }
      const available = Math.min(generated.questions.length, generated.summaryAnswers.length, generated.answers.length);
      for (let index = 0; index < available && questions.length < target; index += 1) {
        const question = generated.questions[index];
        if (seenQuestions.has(question)) continue;
        seenQuestions.add(question);
        questions.push(question);
        summaryAnswers.push(generated.summaryAnswers[index]);
        answers.push(generated.answers[index]);
      }
      attempts += 1;
    }

    if (questions.length !== target) {
      throw new Error('無法產生 ' + target + ' 題不重複的練習題。');
    }
    return { questions, summaryAnswers, answers };
  }

  Object.entries(nextConfigs).forEach(([id, config]) => {
    if (!id.startsWith('s1-1-') || !config || typeof config.generate !== 'function') return;
    const originalGenerate = config.generate;
    const target = config.questionCount;
    config.generate = function generateUniqueS11PracticeSet() {
      return buildUniquePracticeSet(() => originalGenerate.call(this), target);
    };
  });

  Object.entries(nextConfigs).forEach(([id, config]) => {
    if (!id.startsWith('s1-2-') || !config || typeof config.generate !== 'function') return;
    const originalGenerate = config.generate;
    const target = config.questionCount;
    config.generate = function generateUniqueS12PracticeSet() {
      return buildUniquePracticeSet(() => originalGenerate.call(this), target);
    };
  });

  Object.entries(nextConfigs).forEach(([id, config]) => {
    if (!id.startsWith('s1-3-') || !config || typeof config.generate !== 'function') return;
    const originalGenerate = config.generate;
    const target = config.questionCount;
    config.generate = function generateUniqueS13PracticeSet() {
      return buildUniquePracticeSet(() => originalGenerate.call(this), target);
    };
  });

  const bundleFingerprint = 's1-bundle-v20260715-s11-s12-s13-summary-review-v2';
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== 'object') return;
    config.__generatorFingerprint = bundleFingerprint;
  });
  store.registerConfigs(nextConfigs);
})();
