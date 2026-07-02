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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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

  function buildS111FiniteDecimalCriterionSet(count) {
    const questions = [];
    const answers = [];
    const cases = [
      { base: 290, den: 140, min: 0, max: 9, mult: 1 },
      { base: 1360, den: 70, min: 0, max: 9, mult: 1 },
      { base: 520, den: 84, min: 1, max: 12, mult: 2 },
      { base: 135, den: 90, min: 0, max: 9, mult: 1 },
      { base: 840, den: 168, min: 0, max: 15, mult: 3 },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const values = finiteDecimalCandidates(item.base, item.den, item.min, item.max, item.mult);
      const numeratorText =
        item.mult === 1 ? `${item.base}+a` : `${item.base}+${item.mult}a`;
      const valueText = values.length ? values.join('、') : '無';
      questions.push(
        `設 \\(a\\) 為 ${item.min} 到 ${item.max} 的整數，若 \\(\\frac{${numeratorText}}{${item.den}}\\) 可化為有限小數，求所有可能的 \\(a\\)。`
      );
      answers.push(
        `簡答：${valueText}。過程：分數化為最簡分數後，分母只能含質因數 2 與 5。逐一檢查 \\(${numeratorText}\\) 與 ${item.den} 約分後的分母，符合條件的 \\(a\\) 為 ${valueText}。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function numberFromDigitArray(digits) {
    return Number(digits.join(''));
  }

  function buildS111DivisibilityMissingDigitSet(count) {
    const questions = [];
    const answers = [];
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
      const pattern = digits.map((digit, index) => {
        if (index === aPos) return 'a';
        if (index === bPos) return 'b';
        return `${digit}`;
      }).join('');
      const pairText = pairs.map(([a, b]) => `(${a},${b})`).join('，');
      questions.push(`已知 \\(${pattern}\\) 是 \\(${item.mod}\\) 的倍數，其中 \\(a,b\\) 為數字。求所有可能的 \\((a,b)\\)。`);
      answers.push(
        `答案：${pairText}。解析：逐一代入 \\(a,b=0,1,\\ldots,9\\)，並利用「${item.hint}」。符合 \\(${pattern}\\) 可被 \\(${item.mod}\\) 整除的組合為 ${pairText}。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function compareFractions(left, right) {
    return left.num * right.den - right.num * left.den;
  }

  function formatFractionObject(value) {
    return formatFraction(value.num, value.den);
  }

  function buildS112QuotientIntervalRangeSet(count) {
    const questions = [];
    const answers = [];
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
      questions.push(`若 \\(${xLow}\\leq x\\leq ${xHigh}\\)，且 \\(${yLow}\\leq y\\leq ${yHigh}\\)，求 \\(\\frac{x}{y}\\) 的範圍。`);
      answers.push(
        `答案：\\(${formatFractionObject(min)}\\leq \\frac{x}{y}\\leq ${formatFractionObject(max)}\\)。解析：因為 \\(y\\) 全為正數，\\(\\frac{x}{y}\\) 的最大、最小會出現在端點組合。比較 \\(${formatFractionObject(candidates[0])}, ${formatFractionObject(candidates[1])}, ${formatFractionObject(candidates[2])}, ${formatFractionObject(candidates[3])}\\)，可得範圍。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS114ExponentialParameterRelationSet(count) {
    const questions = [];
    const answers = [];
    const bases = [2, 3, 5, 7];
    for (let i = 0; i < count; i += 1) {
      const base = bases[i % bases.length];
      const mode = i % 4;
      if (mode === 0) {
        questions.push(`設 \\(a=1+${base}^k\\)，\\(b=1-${base}^{-k}\\)，試用 \\(a\\) 表示 \\(b\\)。`);
        answers.push(
          `答案：\\(b=\\frac{a-2}{a-1}\\)。解析：由 \\(a=1+${base}^k\\) 得 \\(${base}^k=a-1\\)，所以 \\(${base}^{-k}=\\frac{1}{a-1}\\)，因此 \\(b=1-\\frac{1}{a-1}=\\frac{a-2}{a-1}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`設 \\(a=1+${base}^k\\)，\\(b=1+${base}^{-k}\\)，試用 \\(a\\) 表示 \\(b\\)。`);
        answers.push(
          `答案：\\(b=\\frac{a}{a-1}\\)。解析：\\(${base}^k=a-1\\)，所以 \\(${base}^{-k}=\\frac{1}{a-1}\\)，故 \\(b=1+\\frac{1}{a-1}=\\frac{a}{a-1}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`設 \\(a=1+${base}^k\\)，\\(b=1+${base}^{-k}\\)，試用 \\(a\\) 表示 \\(a+b\\)。`);
        answers.push(
          `答案：\\(a+b=\\frac{a^2}{a-1}\\)。解析：先由 \\(${base}^k=a-1\\) 得 \\(b=1+\\frac{1}{a-1}=\\frac{a}{a-1}\\)，所以 \\(a+b=a+\\frac{a}{a-1}=\\frac{a^2}{a-1}\\)。`
        );
        continue;
      }
      questions.push(`設 \\(a=${base}^k\\)，\\(b=1+${base}^{-k}\\)，試用 \\(a\\) 表示 \\(b\\)。`);
      answers.push(
        `答案：\\(b=\\frac{a+1}{a}\\)。解析：由 \\(a=${base}^k\\) 可知 \\(${base}^{-k}=\\frac1a\\)，因此 \\(b=1+\\frac1a=\\frac{a+1}{a}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS111RadicalIntegerFractionalPartSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS111RationalIrrationalTrueFalseSet(count) {
    const questions = [];
    const answers = [];
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
    for (let i = 0; i < count; i += 1) {
      const item = selected[i % selected.length];
      questions.push(`判斷是非，並說明理由：${item.statement}`);
      answers.push(`簡答：${item.truth ? '正確' : '錯誤'}。過程：${item.process}`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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

  function buildS111IrrationalEqualitySolveSet(count) {
    const questions = [];
    const answers = [];
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
        const left = `(${formatS111SurdBinomial(a, b, radical)})x+(${formatS111SurdBinomial(c, d, radical)})y`;
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
          `設 \\(a,b\\in\\mathbb{Q}\\)，若 \\((a-b)+(a+b)\\sqrt{${radical}}=(${r}-a)+(${s}-b)\\sqrt{${radical}}\\)，求 \\(a,b\\)。`
        );
        answers.push(
          `簡答：\\(a=${aValue},\\ b=${bValue}\\)。過程：比較有理數部分得 \\(a-b=${r}-a\\)，比較 \\(\\sqrt{${radical}}\\) 的係數得 \\(a+b=${s}-b\\)。解此聯立方程式，得 \\(a=${aValue},\\ b=${bValue}\\)。`
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
          `設 \\(a,b\\) 為有理數，若 \\((${formatS111SurdBinomial(p, q, radical)})a+(${formatS111SurdBinomial(r, s, radical)})b=${formatS111SurdBinomial(rationalTarget, irrationalTarget, radical)}\\)，求 \\(a,b\\)。`
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function formatS111PointFraction(fraction) {
    return formatFunctionFractionValue(fraction);
  }

  function buildS111NumberLineSectionSet(count) {
    const questions = [];
    const answers = [];
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
          `簡答：\\(${formatS111PointFraction(p)}\\)。過程：\\(AP:BP=${m}:${n}\\) 表示 \\(P\\) 距離 \\(A\\) 佔全長的 \\(\\frac{${m}}{${m}+${n}}\\)。因此 \\(P=${a}+\\frac{${m}}{${m}+${n}}(${b}-${wrapIfNegative(a)})=${formatS111PointFraction(p)}\\)。`
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
      const aText = 'a';
      const bText = 'b';
      questions.push(`設 \\(a<b\\)，若 \\(P_1,P_2,P_3\\) 為 \\(a,b\\) 間的三個等分點，求 \\(P_2\\) 的坐標表示式。`);
      answers.push(
        `簡答：\\(\\frac{a+b}{2}\\)。過程：三個等分點會把 \\(a,b\\) 分成 4 等分，\\(P_2\\) 是第 2 個等分點，坐標為 \\(${aText}+\\frac{2}{4}(${bText}-${aText})=\\frac{a+b}{2}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS111AmgmExtremaSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS111RadicalDistanceIntegerCountSet(count) {
    const questions = [];
    const answers = [];
    const cases = [
      { a: 101, near: 5, b: 38, far: 3 },
      { a: 73, near: 4, b: 20, far: 2 },
      { a: 146, near: 6, b: 52, far: 3 },
      { a: 58, near: 4, b: 18, far: 2 },
      { a: 122, near: 5, b: 47, far: 3 },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS111TelescopingRationalizationSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function formatS112Linear(coeff, constant, variable = 'x') {
    return formatFunctionLinear(coeff, constant).replaceAll('x', variable);
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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    const cases = [
      { a: 2, b: -1, c: 1, d: 3 },
      { a: 3, b: 2, c: 2, d: -5 },
      { a: 4, b: -12, c: 2, d: 0 },
      { a: 5, b: 5, c: 2, d: -7 },
      { a: 2, b: -8, c: -3, d: 1 },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const solutions = solveAbsLinearEquality(item.a, item.b, item.c, item.d);
      const solutionText = solutions.map((value) => `\\(${formatFraction(value.num, value.den)}\\)`).join('、');
      questions.push(
        `解方程式 \\(|${formatS112Linear(item.a, item.b)}|=|${formatS112Linear(item.c, item.d)}|\\)，並寫出共有幾個實數解。`
      );
      answers.push(
        `簡答：\\(x=${solutions.map((value) => formatFraction(value.num, value.den)).join('\\) 或 \\(x=')}\\)，共 ${solutions.length} 個。過程：\\(|A|=|B|\\) 等價於 \\(A=B\\) 或 \\(A=-B\\)。分別解 \\(${formatS112Linear(item.a, item.b)}=${formatS112Linear(item.c, item.d)}\\) 與 \\(${formatS112Linear(item.a, item.b)}=-(${formatS112Linear(item.c, item.d)})\\)，得 ${solutionText}。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS112AbsReverseParameterSet(count) {
    const questions = [];
    const answers = [];
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
          `簡答：\\((a,b)=(${center},${radius})\\)。過程：\\(|x-a|\\leq b\\) 的解集中心是 \\(a\\)，半徑是 \\(b\\)。由端點平均得 \\(a=\\frac{${left}+${wrapIfNegative(right)}}{2}=${center}\\)，區間長為 ${right - left}，所以 \\(b=${radius}\\)。`
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS112AbsSumMinimumSet(count) {
    const questions = [];
    const answers = [];
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
          `簡答：${min}。過程：三個點的距離和在中位數 \\(x=${b}\\) 時最小，最小值為距離 ${b - a}+0+${c - b}=${min}\\)。`
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS112AbsNumberLineRangeSet(count) {
    const questions = [];
    const answers = [];
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
          `簡答：${min}。過程：三個距離和在中間點 \\(x=${q}\\) 最小，最小值為距離 ${q - p}+0+${r - q}=${min}\\)。`
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS112AbsRangeSimplificationSet(count) {
    const questions = [];
    const answers = [];
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
        questions.push(`設 \\(0<x<1\\)，化簡 \\(\\sqrt{x^2+\\frac{1}{x^2}+2}-\\sqrt{x^2+\\frac{1}{x^2}-2}\\)。`);
        answers.push(
          `簡答：\\(2x\\)。過程：第一個根號為 \\(\\sqrt{(x+\\frac1x)^2}=|x+\\frac1x|=x+\\frac1x\\)；第二個為 \\(\\sqrt{(\\frac1x-x)^2}=|\\frac1x-x|=\\frac1x-x\\)。相減得 \\(2x\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`設三角形三邊長為 \\(a,b,c\\)，化簡 \\(|a+b-c|-\\sqrt{a^2+b^2+c^2-2ab-2bc+2ca}\\)。`);
        answers.push(
          `簡答：0。過程：三角形中 \\(a+b-c>0\\)，所以 \\(|a+b-c|=a+b-c\\)。根號內為 \\((a+b-c)^2\\)，故根號為 \\(|a+b-c|=a+b-c\\)，相減為 0。`
        );
        continue;
      }
      questions.push(`設 \\(a>1\\)，化簡 \\(\\sqrt{a^2+2a+1}-\\sqrt{a^2-2a+1}\\)。`);
      answers.push(
        `簡答：2。過程：\\(\\sqrt{a^2+2a+1}=|a+1|=a+1\\)，\\(\\sqrt{a^2-2a+1}=|a-1|=a-1\\)。因 \\(a>1\\)，相減得 2。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS112AbsQuadraticMixedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const u = randInt(2, 6);
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
        const k = randInt(2, 7);
        questions.push(`化簡 \\(3\\sqrt{k^2-2k+1}+4\\sqrt{k^2+4k+4}\\)，其中 \\(k>1\\)。`);
        answers.push(
          `簡答：\\(7k+5\\)。過程：\\(\\sqrt{k^2-2k+1}=|k-1|=k-1\\)，\\(\\sqrt{k^2+4k+4}=|k+2|=k+2\\)。所以原式 \\(=3(k-1)+4(k+2)=7k+5\\)。`
        );
        continue;
      }
      const u = randInt(2, 6);
      const c = u * u - u;
      questions.push(`解方程式 \\(x^2-|x|-${c}=0\\)。`);
      answers.push(
        `簡答：\\(x=\\pm${u}\\)。過程：令 \\(t=|x|\\geq0\\)，則 \\(x^2=t^2\\)，得到 \\(t^2-t-${c}=0\\)。解得 \\(t=${u}\\) 或負根；因 \\(t\\geq0\\)，取 \\(t=${u}\\)，所以 \\(x=\\pm${u}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS113CubeSumDifferenceSet(count) {
    const questions = [];
    const answers = [];
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
        const p = randInt(1, 8);
        const value = s ** 3 - 3 * p * s;
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
      const s = randInt(3, 8);
      const p = randInt(1, 6);
      const cubeSum = s ** 3 - 3 * p * s;
      const value = cubeSum * cubeSum - 2 * p ** 3;
      questions.push(`已知 \\(a+b=${s}\\)、\\(ab=${p}\\)，求 \\(a^6+b^6\\)。`);
      answers.push(
        `簡答：${value}。過程：先求 \\(a^3+b^3=${cubeSum}\\)。再用 \\(a^6+b^6=(a^3+b^3)^2-2a^3b^3\\)，得 \\(${cubeSum}^2-2\\cdot${p ** 3}=${value}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS113ReciprocalCubeSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const s = randInt(3, 8);
      if (mode === 0) {
        const value = s ** 3 - 3 * s;
        questions.push(`已知 \\(x+\\frac{1}{x}=${s}\\)，求 \\(x^3+\\frac{1}{x^3}\\)。`);
        answers.push(
          `簡答：${value}。過程：\\((x+\\frac1x)^3=x^3+\\frac1{x^3}+3(x+\\frac1x)\\)，所以 \\(x^3+\\frac1{x^3}=${s}^3-3\\cdot${s}=${value}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const d = randInt(2, 7);
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
      const n = randInt(2, 5);
      const value = n ** 3 + (2 - 3 * n * n) * n;
      questions.push(`已知 \\(x=2-\\sqrt{3}\\)，求 \\(x^3+\\frac{1}{x^3}\\)。`);
      answers.push(
        `簡答：52。過程：\\(\\frac1x=2+\\sqrt3\\)，所以 \\(x+\\frac1x=4\\)。因此 \\(x^3+\\frac1{x^3}=4^3-3\\cdot4=52\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS113TernarySquareSet(count) {
    const questions = [];
    const answers = [];
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
        const p = randInt(1, 12);
        const value = s * s - 2 * p;
        questions.push(`已知 \\(a+b+c=${s}\\)、\\(ab+bc+ca=${p}\\)，求 \\(a^2+b^2+c^2\\)。`);
        answers.push(
          `簡答：${value}。過程：\\((a+b+c)^2=a^2+b^2+c^2+2(ab+bc+ca)\\)，所以 \\(a^2+b^2+c^2=${s}^2-2\\cdot${p}=${value}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const root = randInt(5, 12);
        const squareSum = randInt(10, root * root - 2);
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS113TernaryCubicSpecialSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 1) {
        const s = randInt(4, 9);
        const p = randInt(1, 10);
        const r = randInt(1, 8);
        const value = s ** 3 - 3 * s * p + 3 * r;
        questions.push(`已知 \\(a+b+c=${s}\\)、\\(ab+bc+ca=${p}\\)、\\(abc=${r}\\)，求 \\(a^3+b^3+c^3\\)。`);
        answers.push(
          `簡答：${value}。過程：\\(a^3+b^3+c^3=(a+b+c)^3-3(a+b+c)(ab+bc+ca)+3abc\\)，代入得 \\(${s}^3-3\\cdot${s}\\cdot${p}+3\\cdot${r}=${value}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const s = randInt(6, 14);
        const squareSum = randInt(20, 80);
        const cubeSum = randInt(80, 260);
        const pair = makeFraction(s * s - squareSum, 2);
        const abc = makeFraction((cubeSum - s ** 3) * pair.den + 3 * s * pair.num, 3 * pair.den);
        questions.push(
          `已知 \\(a+b+c=${s}\\)、\\(a^2+b^2+c^2=${squareSum}\\)、\\(a^3+b^3+c^3=${cubeSum}\\)，求 \\(abc\\)。`
        );
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(abc)}\\)。過程：先由 \\(ab+bc+ca=\\frac{${s * s}-${squareSum}}{2}=${formatFunctionFractionValue(pair)}\\)。再代入三項立方公式，解得 \\(abc=${formatFunctionFractionValue(abc)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`化簡 \\(\\frac{x^3+y^3+z^3-3xyz}{x+y+z}\\)。`);
        answers.push(
          `簡答：\\(x^2+y^2+z^2-xy-yz-zx\\)。過程：\\(x^3+y^3+z^3-3xyz=(x+y+z)(x^2+y^2+z^2-xy-yz-zx)\\)，約去 \\(x+y+z\\) 後得到答案。`
        );
        continue;
      }
      questions.push(`因式分解 \\(x^3+y^3-z^3+3xyz\\)。`);
      answers.push(
        `簡答：\\((x+y-z)(x^2+y^2+z^2-xy+yz+zx)\\)。過程：令 \\(a=x,b=y,c=-z\\)，套用 \\(a^3+b^3+c^3-3abc\\) 公式，即得結果。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS113RadicalTernaryOperationSet(count) {
    const questions = [];
    const answers = [];
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
        questions.push(`利用公式計算 \\((\\sqrt{2}+\\sqrt{3}+\\sqrt{6})^2\\)。`);
        answers.push(
          `簡答：\\(11+6\\sqrt{2}+4\\sqrt{3}+2\\sqrt{6}\\)。過程：平方項為 \\(2+3+6=11\\)，交叉項為 \\(2\\sqrt{6}+4\\sqrt{3}+6\\sqrt{2}\\)，合併後得 \\(11+6\\sqrt{2}+4\\sqrt{3}+2\\sqrt{6}\\)。`
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  // ── s1-1-3 新增：三因式展開 ──────────────────────────────────────
  function buildS113TripleFactorExpansionSet(count) {
    const questions = [];
    const answers = [];

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
        const a = randInt(1, 4);
        const b = randInt(1, 4);
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  // ── s1-1-3 新增：因式分解（乘法公式）────────────────────────────
  function buildS113PolynomialFactorizationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        // x³ - a³ = (x-a)(x²+ax+a²)
        const a = randInt(2, 5);
        const ax = a === 1 ? '' : `${a}`;
        questions.push(`因式分解 \\(x^3-${a * a * a}\\)。`);
        answers.push(
          `簡答：\\((x-${a})(x^2+${ax}x+${a * a})\\)。過程：套用立方差公式 \\(A^3-B^3=(A-B)(A^2+AB+B^2)\\)，令 \\(A=x,B=${a}\\)，得 \\((x-${a})(x^2+${ax}x+${a * a})\\)。`
        );
        continue;
      }
      if (mode === 1) {
        // x³ + a³ = (x+a)(x²-ax+a²)
        const a = randInt(2, 5);
        const ax = a === 1 ? '' : `${a}`;
        questions.push(`因式分解 \\(x^3+${a * a * a}\\)。`);
        answers.push(
          `簡答：\\((x+${a})(x^2-${ax}x+${a * a})\\)。過程：套用立方和公式 \\(A^3+B^3=(A+B)(A^2-AB+B^2)\\)，令 \\(A=x,B=${a}\\)，得 \\((x+${a})(x^2-${ax}x+${a * a})\\)。`
        );
        continue;
      }
      if (mode === 2) {
        // x⁴ - a⁴ = (x²+a²)(x+a)(x-a)
        const a = randInt(1, 4);
        questions.push(`因式分解 \\(x^4-${a * a * a * a}\\)。`);
        answers.push(
          `簡答：\\((x^2+${a * a})(x+${a})(x-${a})\\)。過程：先用平方差 \\(x^4-${a * a * a * a}=(x^2+${a * a})(x^2-${a * a})\\)，再分解 \\(x^2-${a * a}=(x+${a})(x-${a})\\)，得 \\((x^2+${a * a})(x+${a})(x-${a})\\)。`
        );
        continue;
      }
      if (mode === 3) {
        // Sophie Germain：x⁴+4a⁴ = (x²+2ax+2a²)(x²-2ax+2a²)
        const a = randInt(1, 3);
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
      const a = randInt(1, 3);
      const a2 = a * a;
      const a4 = a2 * a2;
      const xterm = a === 1 ? 'x' : `${a}x`;
      const x2term = a2 === 1 ? 'x^2' : `${a2}x^2`;
      questions.push(`因式分解 \\(x^4+${x2term}+${a4}\\)。`);
      answers.push(
        `簡答：\\((x^2+${xterm}+${a2})(x^2-${xterm}+${a2})\\)。過程：\\(x^4+${x2term}+${a4}=(x^2+${a2})^2-${xterm}^2=(x^2+${xterm}+${a2})(x^2-${xterm}+${a2})\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
        const root = randInt(2, 5);
        const sum = reduceFraction(1 + root ** 4, root * root);
        questions.push(`化簡 \\(${root ** 3}^{-2/3}+(${root ** 5})^{2/5}\\)。`);
        answers.push(
          `簡答：\\(${formatFraction(sum.numerator, sum.denominator)}\\)。過程：\\(${root ** 3}^{-2/3}=(${root})^{-2}=${formatFraction(1, root * root)}\\)，\\((${root ** 5})^{2/5}=${root}^2=${root * root}\\)，相加得 \\(${formatFraction(sum.numerator, sum.denominator)}\\)。`
        );
        continue;
      }
      questions.push(`計算 \\(2^{1/2}\\cdot4^{1/8}\\cdot8^{1/24}\\cdot16^{1/32}\\) 的值。`);
      answers.push(
        `簡答：\\(2\\)。過程：全部化為 2 的冪，指數和為 \\(\\frac12+\\frac14+\\frac18+\\frac18=1\\)，所以原式為 2。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS114VariableExponentSimplificationSet(count) {
    const questions = [];
    const answers = [];
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
        const p = randInt(2, 5);
        questions.push(`化簡 \\(\\sqrt[3]{a^${p}}\\cdot\\sqrt[6]{a^{${p + 3}}}\\)，設 \\(a>0\\)。`);
        answers.push(
          `簡答：\\(${formatS114Power('a', 3 * p + 3, 6)}\\)。過程：\\(\\sqrt[3]{a^${p}}=${formatS114Power('a', p, 3)}\\)，\\(\\sqrt[6]{a^{${p + 3}}}=${formatS114Power('a', p + 3, 6)}\\)，相乘指數相加得 \\(${formatS114Power('a', 3 * p + 3, 6)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`設 \\(a,b>0\\)，化簡 \\(\\sqrt[3]{ab^2}\\times(a^2b)^{2/3}\\)。`);
        answers.push(
          `簡答：\\(${formatS114Power('a', 5, 3)}${formatS114Power('b', 4, 3)}\\)。過程：\\(\\sqrt[3]{ab^2}=${formatS114Power('a', 1, 3)}${formatS114Power('b', 2, 3)}\\)，\\((a^2b)^{2/3}=${formatS114Power('a', 4, 3)}${formatS114Power('b', 2, 3)}\\)，相乘得 \\(${formatS114Power('a', 5, 3)}${formatS114Power('b', 4, 3)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`化簡 \\((a^{1/4}-b^{1/4})(a^{1/4}+b^{1/4})(a^{1/2}+b^{1/2})(a+b)\\)。`);
        answers.push(
          `簡答：\\(a^2-b^2\\)。過程：前兩項先成平方差 \\(a^{1/2}-b^{1/2}\\)，再乘 \\(a^{1/2}+b^{1/2}\\) 得 \\(a-b\\)，最後乘 \\(a+b\\) 得 \\(a^2-b^2\\)。`
        );
        continue;
      }
      questions.push(`化簡 \\(\\frac{a^{2x}a^{3-x}}{a^{x-1}}\\)，並以 \\(a\\) 的次方表示。`);
      answers.push(
        `簡答：\\(a^4\\)。過程：分子指數相加為 \\(2x+3-x=x+3\\)，再除以 \\(a^{x-1}\\) 等於指數相減，得 \\(a^{x+3-(x-1)}=a^4\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS114ExponentialSymmetricValueSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const s = randInt(3, 8);
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
      questions.push(`計算 \\(\\frac{a^{3x}+a^{-3x}}{a^x+a^{-x}}\\)。`);
      answers.push(
        `簡答：\\(a^{2x}+a^{-2x}-1\\)。過程：令 \\(u=a^x\\)，則 \\(\\frac{u^3+u^{-3}}{u+u^{-1}}=u^2+u^{-2}-1\\)，代回即可。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS114ExponentialEquationInequalitySet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const r1 = randInt(0, 2);
        const r2 = r1 + randInt(1, 2);
        questions.push(`解方程式 \\(25^x-${5 ** r1 + 5 ** r2}\\cdot5^x+${5 ** (r1 + r2)}=0\\)。`);
        answers.push(
          `簡答：\\(x=${r1}\\) 或 \\(x=${r2}\\)。過程：令 \\(t=5^x>0\\)，則 \\(25^x=t^2\\)，原式變成 \\(t^2-${5 ** r1 + 5 ** r2}t+${5 ** (r1 + r2)}=0\\)，解得 \\(t=${5 ** r1}\\) 或 \\(t=${5 ** r2}\\)，所以 \\(x=${r1}\\) 或 \\(x=${r2}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const sol = randInt(2, 6);
        questions.push(`解方程式 \\(4^{2x-1}=8^{x+${sol - 2}}\\)。`);
        answers.push(
          `簡答：\\(x=${sol}\\)。過程：化為同底 2，左邊為 \\(2^{4x-2}\\)，右邊為 \\(2^{3x+${3 * (sol - 2)}}\\)。比較指數得 \\(x=${sol}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const r1 = randInt(1, 3);
        const r2 = r1 + randInt(2, 4);
        questions.push(`解方程式 \\(2^{2x}-${2 ** r1 + 2 ** r2}\\cdot2^x+${2 ** (r1 + r2)}=0\\)。`);
        answers.push(
          `簡答：\\(x=${r1}\\) 或 \\(x=${r2}\\)。過程：令 \\(t=2^x>0\\)，方程成為 \\(t^2-${2 ** r1 + 2 ** r2}t+${2 ** (r1 + r2)}=0\\)，解得 \\(t=${2 ** r1}\\) 或 \\(t=${2 ** r2}\\)，所以 \\(x=${r1}\\) 或 \\(x=${r2}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`解不等式 \\((3^x-9)(3^x-27)\\leq0\\)。`);
        answers.push(
          `簡答：\\(2\\leq x\\leq3\\)。過程：令 \\(t=3^x>0\\)，則 \\((t-9)(t-27)\\leq0\\)，得 \\(9\\leq t\\leq27\\)，所以 \\(2\\leq x\\leq3\\)。`
        );
        continue;
      }
      questions.push(`解不等式 \\((\\frac14)^x+(\\frac12)^x-2<0\\)。`);
      answers.push(
        `簡答：\\(x>0\\)。過程：令 \\(t=(\\frac12)^x>0\\)，則 \\((\\frac14)^x=t^2\\)，不等式為 \\(t^2+t-2<0\\)，得 \\(0<t<1\\)，所以 \\(x>0\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  // ── s1-1-4 新增：換底比大小 ─────────────────────────────────────
  function buildS114ExponentCompareSet(count) {
    const questions = [];
    const answers = [];

    function lcm2(x, y) {
      return (x * y) / gcdInt(x, y);
    }

    function rootTeX(base, order) {
      return order === 2 ? `\\sqrt{${base}}` : `\\sqrt[${order}]{${base}}`;
    }

    // 每組 [a, m, b, n]：比較 a^(1/m) vs b^(1/n)
    const pairs = [
      [2, 2, 3, 3], // √2 vs ∛3 → 8 vs 9 → ∛3 較大
      [2, 3, 3, 4], // ∛2 vs ⁴√3 → 16 vs 27 → ⁴√3 較大
      [3, 2, 7, 4], // √3 vs ⁴√7 → 9 vs 7 → √3 較大
      [5, 3, 3, 2], // ∛5 vs √3 → 25 vs 27 → √3 較大
      [2, 2, 5, 4], // √2 vs ⁴√5 → 4 vs 5 → ⁴√5 較大
    ];

    for (let i = 0; i < count; i += 1) {
      const [a, m, b, n] = pairs[i % pairs.length];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  // ── s1-1-4 新增：已知 a^x 求 a^(mx) ────────────────────────────
  function buildS114KnownPowerSet(count) {
    const questions = [];
    const answers = [];
    const kVals = [2, 3, 4, 5, 6];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const k = kVals[randInt(0, kVals.length - 1)];
      if (mode === 0) {
        // 已知 2^x = k，求 4^x = (2^x)^2 = k^2
        questions.push(`已知 \\(2^x=${k}\\)，求 \\(4^x\\) 之值。`);
        answers.push(`簡答：${k * k}。過程：\\(4^x=(2^2)^x=(2^x)^2=${k}^2=${k * k}\\)。`);
        continue;
      }
      if (mode === 1) {
        // 已知 2^x = k，求 8^x = (2^x)^3 = k^3
        questions.push(`已知 \\(2^x=${k}\\)，求 \\(8^x\\) 之值。`);
        answers.push(`簡答：${k * k * k}。過程：\\(8^x=(2^3)^x=(2^x)^3=${k}^3=${k * k * k}\\)。`);
        continue;
      }
      if (mode === 2) {
        // 已知 2^x = k，求 (1/2)^x = 1/k
        questions.push(`已知 \\(2^x=${k}\\)，求 \\(\\left(\\tfrac{1}{2}\\right)^x\\) 之值。`);
        answers.push(
          `簡答：\\(\\tfrac{1}{${k}}\\)。過程：\\(\\left(\\tfrac{1}{2}\\right)^x=2^{-x}=\\tfrac{1}{2^x}=\\tfrac{1}{${k}}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        // 已知 3^x = k，求 9^x = (3^x)^2 = k^2
        questions.push(`已知 \\(3^x=${k}\\)，求 \\(9^x\\) 之值。`);
        answers.push(`簡答：${k * k}。過程：\\(9^x=(3^2)^x=(3^x)^2=${k}^2=${k * k}\\)。`);
        continue;
      }
      // mode === 4：已知 2^x = k，求 4^(x+1) = 4·(2^x)^2 = 4k^2
      questions.push(`已知 \\(2^x=${k}\\)，求 \\(4^{x+1}\\) 之值。`);
      answers.push(`簡答：${4 * k * k}。過程：\\(4^{x+1}=4\\cdot4^x=4\\cdot(2^x)^2=4\\cdot${k}^2=${4 * k * k}\\)。`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  // ── s1-1-4 新增：指數換元（混合底，4^x 與 2^x 型）────────────────
  function buildS114SubstitutionEquationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        // 4^x - (2^r-k)·2^x - k·2^r = 0 → t=2^x，(t-2^r)(t+k)=0，x=r
        const r = randInt(1, 3);
        const k = randInt(1, 4);
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
        const r1 = randInt(0, 1);
        const r2 = r1 + randInt(1, 2);
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
        const n = randInt(1, 3);
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
        const r1 = randInt(0, 1);
        const r2 = r1 + randInt(1, 2);
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
      const n = randInt(1, 3);
      const tn = 3 ** n;
      const Sn = 2 * tn;
      const Pn = tn * tn;
      questions.push(`解方程式 \\(9^x-${Sn}\\cdot3^x+${Pn}=0\\)。`);
      answers.push(
        `簡答：\\(x=${n}\\)。過程：令 \\(t=3^x>0\\)，\\(9^x=t^2\\)，方程變為 \\(t^2-${Sn}t+${Pn}=0\\)，即 \\((t-${tn})^2=0\\)，唯一正根 \\(t=${tn}=3^${n}\\)，所以 \\(x=${n}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  // ── s1-1-4 新增：提公因數指數方程 ──────────────────────────────
  function buildS114ExtractFactorEquationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        // 2^(x+r) - 2^x = k：提出 2^x，2^x(2^r-1) = k
        const r = randInt(1, 3);
        const n = randInt(1, 3);
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
        const m = randInt(0, 2);
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
        const m = randInt(1, 3);
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
        const n = randInt(1, 2);
        const k = 24 * 5 ** n;
        questions.push(`解方程式 \\(5^{x+2}-5^x=${k}\\)。`);
        answers.push(
          `簡答：\\(x=${n}\\)。過程：提出 \\(5^x\\)，得 \\(5^x(5^2-1)=${k}\\)，即 \\(24\\cdot5^x=${k}\\)，所以 \\(5^x=${5 ** n}=5^${n}\\)，\\(x=${n}\\)。`
        );
        continue;
      }
      // mode === 4：2^(x+r) + 2^x = k：提出 2^x，(2^r+1)·2^x = k
      const r = randInt(1, 3);
      const n = randInt(1, 3);
      const factor = 2 ** r + 1;
      const k = factor * 2 ** n;
      questions.push(`解方程式 \\(2^{x+${r}}+2^x=${k}\\)。`);
      answers.push(
        `簡答：\\(x=${n}\\)。過程：提出公因式 \\(2^x\\)，得 \\(2^x(2^${r}+1)=${k}\\)，即 \\(${factor}\\cdot2^x=${k}\\)，所以 \\(2^x=${2 ** n}=2^${n}\\)，\\(x=${n}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS114ExponentialQuadraticExtremaSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS114ExponentialFractionRangeSet(count) {
    const questions = [];
    const answers = [];
    const bases = [2, 3, 5];
    for (let i = 0; i < count; i += 1) {
      const base = bases[randInt(0, bases.length - 1)];
      const A = randInt(2, 8);
      const B = randInt(1, 5);
      const C = randInt(2, 6);
      const upper = formatFraction(A, C);
      questions.push(`已知 \\(x\\) 為實數，求 \\(\\frac{${A}-${B}\\cdot${base}^x}{${C}+${base}^x}\\) 的值域。`);
      answers.push(
        `簡答：\\((-${B},\\ ${upper})\\)。過程：令 \\(t=${base}^x>0\\)，原式 \\(y=\\frac{${A}-${B}t}{${C}+t}\\)。整理得 \\(y(${C}+t)=${A}-${B}t\\)，所以 \\(t(y+${B})=${A}-${C}y\\)，即 \\(t=\\frac{${A}-${C}y}{y+${B}}\\)。因為 \\(t>0\\)，分子分母同號；又 \\(\\frac{${A}}{${C}}>${-B}\\)，故 \\(-${B}<y<${upper}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS114RationalExponentOrderingSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS114ExponentialGrowthModelSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const root = randInt(2, 3);
      const dailyRate = root ** 2;
      const startCount = randInt(1, 9) * 100;
      const firstDay = randInt(2, 5);
      const halfSteps = [3, 5, 7][i % 3];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS115FirstNonzeroDecimalPlaceSet(count) {
    const questions = [];
    const answers = [];
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
          `簡答：第 ${place} 位。過程：\\(-${place}<\\log x<-${place - 1}\\)，表示 \\(10^{-${place}}<x<10^{-${place + -1}}\\)，所以首位非零在小數點後第 ${place} 位。`
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS115LeadingDigitSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS115CharacteristicMantissaAlgebraSet(count) {
    const questions = [];
    const answers = [];
    const tails = [3010, 4771, 6021, 6990, 8451];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode <= 2) {
        const characteristic = randInt(1, 4);
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
        questions.push(
          `已知 \\(\\log a\\) 的尾數與 \\(\\log \\frac{1}{a}\\) 的尾數相同，且 \\(1<a<10\\)，求 \\(a\\)。`
        );
        answers.push(
          `簡答：\\(a=\\sqrt{10}\\)。過程：設 \\(\\log a=\\alpha\\)，其中 \\(0<\\alpha<1\\)。則 \\(\\log\\frac{1}{a}=-\\alpha=-1+(1-\\alpha)\\)，尾數為 \\(1-\\alpha\\)。兩尾數相同得 \\(\\alpha=1-\\alpha\\)，所以 \\(\\alpha=\\frac{1}{2}\\)，故 \\(a=10^{1/2}=\\sqrt{10}\\)。`
        );
        continue;
      }
      questions.push(`若 \\(\\log x^2\\) 與 \\(\\log\\frac{1}{x}\\) 的尾數相同，且 \\(1<x<\\sqrt{10}\\)，求 \\(x\\)。`);
      answers.push(
        `簡答：\\(x=\\sqrt[3]{10}\\)。過程：設 \\(\\log x=\\alpha\\)，\\(0<\\alpha<\\frac{1}{2}\\)。\\(\\log x^2=2\\alpha\\)，\\(\\log\\frac{1}{x}=-\\alpha\\) 的尾數為 \\(1-\\alpha\\)。令 \\(2\\alpha=1-\\alpha\\)，得 \\(\\alpha=\\frac{1}{3}\\)，所以 \\(x=10^{1/3}=\\sqrt[3]{10}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS115LogOperationScientificNotationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        questions.push(
          `已知 \\(\\log2\\approx0.3010,\\log3\\approx0.4771\\)，求 \\(\\log1.2\\) 與 \\(\\log1.5\\) 的近似值。`
        );
        answers.push(
          `簡答：\\(\\log1.2\\approx0.0791\\)，\\(\\log1.5\\approx0.1761\\)。過程：\\(1.2=\\frac{6}{5}\\)，所以 \\(\\log1.2=\\log6-\\log5=(\\log2+\\log3)-(1-\\log2)=2\\log2+\\log3-1\\approx0.0791\\)。\\(1.5=\\frac{3}{2}\\)，所以 \\(\\log1.5=\\log3-\\log2\\approx0.1761\\)。`
        );
        continue;
      }
      if (mode === 1) {
        let exponent2 = randInt(12, 25);
        let exponent3 = randInt(8, 18);
        let log2Term = S115_LOGS[2] * exponent2;
        let log3Term = S115_LOGS[3] * exponent3;
        while (Math.abs(Math.floor(log2Term / 10000) - Math.floor(log3Term / 10000)) < 2) {
          exponent2 = randInt(12, 25);
          exponent3 = randInt(8, 18);
          log2Term = S115_LOGS[2] * exponent2;
          log3Term = S115_LOGS[3] * exponent3;
        }
        const larger =
          log2Term >= log3Term
            ? { base: 2, exponent: exponent2, logValue: log2Term }
            : { base: 3, exponent: exponent3, logValue: log3Term };
        const digits = Math.floor(larger.logValue / 10000) + 1;
        questions.push(
          `已知 \\(\\log2\\approx0.3010,\\log3\\approx0.4771\\)，判定 \\(2^{${exponent2}}+3^{${exponent3}}\\) 大約為幾位數。`
        );
        answers.push(
          `簡答：約 ${digits} 位數。過程：比較兩項對數，\\(\\log2^{${exponent2}}\\approx${formatS115LogInt(log2Term)}\\)，\\(\\log3^{${exponent3}}\\approx${formatS115LogInt(log3Term)}\\)。兩項位數至少差 2 位，較小項不會改變總和位數；較大項為 \\(${larger.base}^{${larger.exponent}}\\)，所以總和約為 ${digits} 位數。`
        );
        continue;
      }
      if (mode === 2) {
        const coefficient = randInt(12, 98);
        const zeros = randInt(3, 6);
        const value = coefficient * 10 ** zeros;
        questions.push(`將 ${value} 表為科學記號，並判定其對數的首數。`);
        answers.push(
          `簡答：\\(${coefficient / 10}\\times10^{${zeros + 1}}\\)，首數為 ${zeros + 1}。過程：${value}=${coefficient / 10}\\times10^{${zeros + 1}}\\)，且 \\(1\\leq${coefficient / 10}<10\\)，所以 \\(\\log ${value}=\\log(${coefficient / 10})+${zeros + 1}\\)，首數為 ${zeros + 1}。`
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
      const choices = [
        { logInt: -26990, text: '2\\times10^{-3}', process: '-3+\\log2=-3+0.3010=-2.6990' },
        { logInt: -25229, text: '3\\times10^{-3}', process: '-3+\\log3=-3+0.4771=-2.5229' },
        { logInt: -13010, text: '5\\times10^{-2}', process: '-2+\\log5=-2+0.6990=-1.3010' },
      ];
      const item = choices[randInt(0, choices.length - 1)];
      questions.push(`已知 \\(\\log x=${formatS115LogInt(item.logInt)}\\)，將 \\(x\\) 表示為科學記號。`);
      answers.push(`簡答：\\(${item.text}\\)。過程：因為 \\(${item.process}\\)，所以 \\(x=${item.text}\\)。`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  // ── s1-1-5 新增：對數直接計算 ────────────────────────────────────
  function buildS115BasicLogCalculationSet(count) {
    const questions = [];
    const answers = [];
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
        questions.push(`計算 \\(\\log_{10}${val1}+\\log_{10}${val2}\\)。`);
        answers.push(
          `簡答：${sumStr}。過程：\\(\\log_{10}${val1}=\\log_{10}10^${n}=${n}\\)，\\(\\log_{10}${val2}=\\log_{10}10^{${m}}=${m}\\)，兩者相加得 \\(${n}+(${m})=${sumStr}\\)。`
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
        const valA = a ** m;
        const valBAbsPow = b ** Math.abs(nNeg);
        const valBDisp = `\\dfrac{1}{${valBAbsPow}}`;
        questions.push(`計算 \\(\\log_{${a}}${valA}+\\log_{${b}}${valBDisp}\\)。`);
        answers.push(
          `簡答：${m + nNeg}。過程：\\(\\log_{${a}}${valA}=\\log_{${a}}${a}^${m}=${m}\\)，\\(\\log_{${b}}${valBDisp}=\\log_{${b}}${b}^{${nNeg}}=${nNeg}\\)，兩者相加得 \\(${m}+(${nNeg})=${m + nNeg}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        // 固定題組：具體數值加減
        const combos = [
          {
            q: '\\log_{10}100+\\log_2\\dfrac{1}{8}',
            ans: -1,
            proc: '\\(\\log_{10}100=2\\)，\\(\\log_2\\dfrac{1}{8}=-3\\)，合計 \\(2+(-3)=-1\\)',
          },
          {
            q: '\\log_{10}1000+\\log_3\\dfrac{1}{9}',
            ans: 1,
            proc: '\\(\\log_{10}1000=3\\)，\\(\\log_3\\dfrac{1}{9}=-2\\)，合計 \\(3+(-2)=1\\)',
          },
          {
            q: '\\log_2 32+\\log_{10}0.01',
            ans: 3,
            proc: '\\(\\log_2 32=5\\)，\\(\\log_{10}0.01=-2\\)，合計 \\(5+(-2)=3\\)',
          },
          {
            q: '\\log_3 27+\\log_2\\dfrac{1}{4}',
            ans: 1,
            proc: '\\(\\log_3 27=3\\)，\\(\\log_2\\dfrac{1}{4}=-2\\)，合計 \\(3+(-2)=1\\)',
          },
          {
            q: '\\log_5 125+\\log_{10}0.001',
            ans: 0,
            proc: '\\(\\log_5 125=3\\)，\\(\\log_{10}0.001=-3\\)，合計 \\(3+(-3)=0\\)',
          },
        ];
        const c = combos[randInt(0, combos.length - 1)];
        questions.push(`計算 \\(${c.q}\\)。`);
        answers.push(`簡答：${c.ans}。過程：${c.proc}。`);
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS115LogDifferenceEstimateSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS115LogIntervalIntegerCountSet(count) {
    const questions = [];
    const answers = [];
    const cases = [
      { lower: 1.5, upper: 2, multiple: 3, label: '3 的倍數' },
      { lower: 1.5, upper: 2, multiple: 2, label: '偶數' },
      { lower: 2.2, upper: 2.7, multiple: 5, label: '5 的倍數' },
      { lower: 0.8, upper: 1.6, multiple: 4, label: '4 的倍數' },
      { lower: 2, upper: 2.5, multiple: 9, label: '9 的倍數' },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const lowerValue = 10 ** item.lower;
      const upperValue = 10 ** item.upper;
      const first = Math.floor(lowerValue / item.multiple) * item.multiple + item.multiple;
      const last = Math.ceil(upperValue / item.multiple) * item.multiple - item.multiple;
      const countValue = last >= first ? Math.floor((last - first) / item.multiple) + 1 : 0;
      questions.push(
        `滿足 \\(a\\) 為 ${item.label}且 \\(${item.lower}<\\log a<${item.upper}\\) 的正整數 \\(a\\) 共有幾個？`
      );
      answers.push(
        `簡答：${countValue} 個。過程：由 \\(${item.lower}<\\log a<${item.upper}\\) 得 \\(10^{${item.lower}}<a<10^{${item.upper}}\\)，約為 \\(${trimFixed(lowerValue, 3)}<a<${trimFixed(upperValue, 3)}\\)。其中符合 ${item.label}者從 ${first} 到 ${last}，共有 ${countValue} 個。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function formatS115PowerOfTenFromFraction(num, den) {
    const reduced = reduceFraction(num, den);
    if (reduced.denominator === 1) return `10^{${reduced.numerator}}`;
    if (reduced.numerator === 1) return `\\sqrt[${reduced.denominator}]{10}`;
    return `10^{${formatFraction(reduced.numerator, reduced.denominator)}}`;
  }

  function buildS115LogScaleRatioModelSet(count) {
    const questions = [];
    const answers = [];
    const modes = [
      () => {
        const coefficient = randInt(2, 5);
        const increase = randInt(1, 3);
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
        const low = randInt(2, 4);
        const high = low + randInt(2, 4);
        const ratio = 10 ** (high - low);
        return {
          q: `pH 值定義為 \\(\\mathrm{pH}=-\\log[H^+]\\)。若 A 溶液 pH 為 ${low}，B 溶液 pH 為 ${high}，A 的氫離子濃度是 B 的幾倍？`,
          a: `簡答：${ratio} 倍。過程：\\([H^+]_A=10^{-${low}}\\)，\\([H^+]_B=10^{-${high}}\\)，所以 \\(\\frac{[H^+]_A}{[H^+]_B}=10^{${high - low}}=${ratio}\\)。`,
        };
      },
      () => {
        const screens = [10, 100, 1000][randInt(0, 2)];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    if (coeff === 0) return `${base}`;
    const sign = coeff > 0 ? '+' : '-';
    const absCoeff = Math.abs(coeff);
    const coefText = absCoeff === 1 ? '' : `${absCoeff}`;
    return `${base}${sign}${coefText}${parameter}`;
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const yIntercept = randInt(2, 6);
      const px = randInt(4, 12);
      const product = yIntercept * px;
      const divisors = positiveDivisors(product);
      questions.push(
        `共有多少個正整數 \\(n\\)，使得通過 \\(A(-n,0)\\)、\\(B(0,${yIntercept})\\) 的直線也通過 \\(P(${px},k)\\)，其中 \\(k\\) 為正整數？`
      );
      answers.push(
        `簡答：${divisors.length} 個。過程：直線斜率為 \\(\\frac{${yIntercept}}{n}\\)，故 \\(x=${px}\\) 時 \\(k=${yIntercept}+\\frac{${product}}{n}\\)。要使 \\(k\\) 為整數，需 \\(n\\mid ${product}\\)。正因數為 ${divisors.join('、')}，共有 ${divisors.length} 個。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121LineSideParameterCountSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function formatS121IndexedTerm(coef, base, index) {
    if (coef === 1) return `${base}_${index}`;
    if (coef === -1) return `-${base}_${index}`;
    return `${coef}${base}_${index}`;
  }

  function formatS121IndexedSum(beta, gamma, index) {
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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121ProjectionSymmetrySet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121PerpendicularBisectorSet(count) {
    const questions = [];
    const answers = [];
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121LineClusterFixedPointSet(count) {
    const questions = [];
    const answers = [];
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
        `不論 \\(${parameter}\\) 為何實數，直線 \\(L:(${formatS121ParamExpr(a0, a1, parameter)})x+(${formatS121ParamExpr(b0, b1, parameter)})y+(${formatS121ParamExpr(c0, c1, parameter)})=0\\) 恆過一定點，求此點坐標。`
      );
      answers.push(
        `簡答：\\(${formatS121Point(p)}\\)。過程：把含 \\(${parameter}\\) 與不含 \\(${parameter}\\) 的部分分開，得 \\(${formatS121Line(a0, b0, c0)}\\) 與 \\(${formatS121Line(a1, b1, c1)}\\)。兩式交點同時滿足所有 \\(${parameter}\\) 的直線，解得定點為 \\(${formatS121Point(p)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121TriangleNonexistenceSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '三直線 \\(L_1:x=0\\)、\\(L_2:y=0\\)、\\(L_3:kx+y-1=0\\) 不能圍成三角形，求 \\(k\\)。',
        a: '簡答：\\(k=0\\)。過程：若三線不能圍成三角形，可能是兩線平行或三線共點。此題 \\(L_3\\) 與 \\(L_2:y=0\\) 平行時需 \\(k=0\\)，此時 \\(L_3:y=1\\)，與 \\(L_2\\) 平行，所以不能圍成三角形。',
      },
      {
        q: '三直線 \\(L_1:x=2\\)、\\(L_2:y=-1\\)、\\(L_3:x+ky-3=0\\) 三線共點時不能圍成三角形，求 \\(k\\)。',
        a: '簡答：\\(k=-1\\)。過程：\\(L_1,L_2\\) 交於 \\((2,-1)\\)。代入 \\(L_3\\)：\\(2+k(-1)-3=0\\)，得 \\(k=-1\\)。',
      },
      {
        q: '三直線 \\(L_1:2x-y=1\\)、\\(L_2:2x-y=5\\)、\\(L_3:x+ky=3\\) 是否可能圍成三角形？',
        a: '簡答：不能。過程：\\(L_1\\) 與 \\(L_2\\) 斜率相同且截距不同，兩線平行。三條直線只要已有兩線平行，就無法圍成三角形。',
      },
      {
        q: '若 \\(L_k:x+y-4+k(x-y+2)=0\\) 與 \\(x=1\\)、\\(y=3\\) 三線共點，求 \\(k\\)。',
        a: '簡答：任意實數 \\(k\\)。過程：\\(x=1\\)、\\(y=3\\) 交於 \\((1,3)\\)。代入 \\(L_k\\)：\\(1+3-4+k(1-3+2)=0\\)，即 \\(0+0k=0\\)，所以任何 \\(k\\) 都通過此點。',
      },
      {
        q: '設 \\(L_1:x+y=4\\)、\\(L_2:x-y=2\\)、\\(L_3:kx+y=6\\)。若三線不能圍成三角形，求 \\(k\\) 的可能值。',
        a: '簡答：\\(k=-1,1,\\frac{5}{3}\\)。過程：三線不能圍成三角形有兩線平行或三線共點兩種情形。\\(L_1\\) 斜率為 \\(-1\\)，\\(L_2\\) 斜率為 \\(1\\)，\\(L_3:kx+y=6\\) 斜率為 \\(-k\\)。因此 \\(L_3\\parallel L_1\\) 時 \\(-k=-1\\)，得 \\(k=1\\)；\\(L_3\\parallel L_2\\) 時 \\(-k=1\\)，得 \\(k=-1\\)。又 \\(L_1,L_2\\) 交於 \\((3,1)\\)，若三線共點，代入 \\(L_3\\) 得 \\(3k+1=6\\)，所以 \\(k=\\frac{5}{3}\\)。因此可能值為 \\(-1,1,\\frac{5}{3}\\)。',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121InverseDistanceSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '設直線 \\(L\\) 的斜率為 \\(\\frac{3}{4}\\)，且與兩坐標軸圍成的三角形面積為 24，求 \\(L\\) 的方程式。',
        a: '簡答：\\(3x-4y+24=0\\) 或 \\(3x-4y-24=0\\)。過程：斜率為 \\(\\frac{3}{4}\\)，設 \\(y=\\frac{3}{4}x+b\\)。兩軸截距為 \\(-\\frac{4b}{3}\\)、\\(b\\)，面積 \\(=\\frac{1}{2}|-\\frac{4b}{3}\\cdot b|=24\\)，得 \\(b^2=36\\)，所以 \\(b=\\pm6\\)，整理得兩式。',
      },
      {
        q: '已知平行線 \\(L_1:3x-4y+2=0\\) 與 \\(L_2:3x-4y+k=0\\) 的距離為 2，求 \\(k\\) 的可能值。',
        a: '簡答：\\(k=12\\) 或 \\(k=-8\\)。過程：平行線距離 \\(d=\\frac{|k-2|}{\\sqrt{3^2+(-4)^2}}=\\frac{|k-2|}{5}\\)。令距離為 2，得 \\(|k-2|=10\\)，所以 \\(k=12\\) 或 \\(-8\\)。',
      },
      {
        q: '直線 \\(L\\) 通過點 \\((4,2)\\)，且與兩坐標軸圍成的三角形面積為 16。若 \\(L\\) 的兩截距皆為正，求 \\(L\\)。',
        a: '簡答：\\(x+2y-8=0\\)。過程：設截距式為 \\(\\frac{x}{a}+\\frac{y}{b}=1\\)，且 \\(\\frac{1}{2}ab=16\\)，所以 \\(ab=32\\)。取 \\(a=8,b=4\\)，代入 \\((4,2)\\) 得 \\(\\frac{4}{8}+\\frac{2}{4}=1\\)，故 \\(\\frac{x}{8}+\\frac{y}{4}=1\\)，整理得 \\(x+2y-8=0\\)。',
      },
      {
        q: '若點 \\(A(1,2)\\) 到直線 \\(L:2x+y+k=0\\) 的距離為 \\(\\sqrt5\\)，求 \\(k\\)。',
        a: '簡答：\\(k=1\\) 或 \\(k=-9\\)。過程：距離公式得 \\(\\frac{|2\\cdot1+2+k|}{\\sqrt{2^2+1^2}}=\\sqrt5\\)，所以 \\(|k+4|=5\\)，得 \\(k=1\\) 或 \\(k=-9\\)。',
      },
      {
        q: '設直線 \\(L\\) 過點 \\((-3,4)\\)，且與坐標軸在第二象限圍成三角形面積最小，求最小面積。',
        a: '簡答：24。過程：設負 \\(x\\) 截距長為 \\(a\\)、正 \\(y\\) 截距長為 \\(b\\)，直線為 \\(-\\frac{x}{a}+\\frac{y}{b}=1\\)。代入 \\((-3,4)\\) 得 \\(\\frac{3}{a}+\\frac{4}{b}=1\\)。由 AM-GM 可得面積 \\(\\frac{1}{2}ab\\) 最小在 \\(\\frac{3}{a}=\\frac{4}{b}=\\frac{1}{2}\\)，得 \\(a=6,b=8\\)，最小面積為 24。',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121GeometricOptimizationSet(count) {
    const templates = [
      {
        q: '設 \\(A(1,5),B(6,7)\\)，動點 \\(P(x,0)\\) 在 \\(x\\) 軸上移動，求 \\(PA+PB\\) 的最小值。',
        a: '簡答：13。過程：將 \\(A\\) 對 \\(x\\) 軸反射為 \\(A\\prime(1,-5)\\)。\\(PA+PB=A\\prime P+PB\\)，最短為直線距離 \\(A\\prime B\\)，故最小值 \\(=\\sqrt{(6-1)^2+(7+5)^2}=13\\)。',
      },
      {
        q: '求 \\(\\sqrt{(x-4)^2+25}+\\sqrt{(x+4)^2+1}\\) 的最小值。',
        a: '簡答：10。過程：此式可看成 \\(P(x,0)\\) 到 \\(A(4,5)\\)、\\(B(-4,1)\\) 的距離和。將 \\(A\\) 對 \\(x\\) 軸反射為 \\(A\\prime(4,-5)\\)，最小值為 \\(A\\prime B=\\sqrt{8^2+6^2}=10\\)。',
      },
      {
        q: '設 \\(A(1,-1),B(3,2)\\)，在直線 \\(L:2x+y+1=0\\) 上找一點 \\(P\\)，使 \\(PA^2+PB^2\\) 最小。',
        a: '簡答：\\(P(-\\frac{1}{5},-\\frac{3}{5})\\)。過程：\\(PA^2+PB^2=2PM^2+\\frac{1}{2}AB^2\\)，其中 \\(M\\) 是 \\(AB\\) 中點 \\((2,\\frac{1}{2})\\)。因此只需取 \\(M\\) 到 \\(L\\) 的投影點。對直線 \\(2x+y+1=0\\)，\\(d=\\frac{2\\cdot2+\\frac{1}{2}+1}{2^2+1^2}=\\frac{11}{10}\\)，投影點為 \\((2,\\frac{1}{2})-\\frac{11}{10}(2,1)=(-\\frac{1}{5},-\\frac{3}{5})\\)。',
      },
      {
        q: '兩點 \\(A(2,1),B(9,4)\\) 在直線 \\(L:3x-y=15\\) 的異側，\\(P\\) 在 \\(L\\) 上移動，求 \\(|PA-PB|\\) 的最大值。',
        a: '簡答：\\(\\sqrt{26}\\)。過程：設 \\(P=(t,3t-15)\\)。則 \\(PA^2=(t-2)^2+(3t-16)^2\\)，\\(PB^2=(t-9)^2+(3t-19)^2\\)。在 \\(P\\) 位於交點同側且 \\(PA>PB\\) 時，令 \\(D=PA-PB\\)，則 \\(D\\prime=\\frac{10t-50}{PA}-\\frac{10t-66}{PB}\\)。由 \\(D\\prime=0\\) 可得 \\(t=13\\)。此時 \\(P=(13,24)\\)，\\(PA=\\sqrt{650}=5\\sqrt{26}\\)，\\(PB=\\sqrt{416}=4\\sqrt{26}\\)，所以 \\(D=\\sqrt{26}\\)。而交點處 \\(D=0\\)，當 \\(|t|\\) 越來越大時 \\(|PA-PB|\\) 趨近 \\(\\frac{8\\sqrt{10}}{5}<\\sqrt{26}\\)，因此最大值為 \\(\\sqrt{26}\\)。',
      },
      {
        q: '在 \\(x\\) 軸上找點 \\(P\\)，使 \\(P\\) 到 \\((2,3)\\) 與 \\((-4,1)\\) 的距離平方和最小。',
        a: '簡答：\\(P(-1,0)\\)。過程：距離平方和最小時，\\(P\\) 是兩點中點 \\((-1,2)\\) 到 \\(x\\) 軸的投影，因此 \\(P=(-1,0)\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121TriangleCentersSet(count) {
    const templates = [
      {
        q: '已知 \\(\\triangle ABC\\) 三頂點為 \\(A(1,8),B(3,5),C(12,11)\\)，求重心 \\(G\\) 坐標。',
        a: '簡答：\\(G(\\frac{16}{3},8)\\)。過程：重心為三頂點坐標平均，\\(G=(\\frac{1+3+12}{3},\\frac{8+5+11}{3})=(\\frac{16}{3},8)\\)。',
      },
      {
        q: '已知 \\(\\triangle ABC\\) 三頂點為 \\(A(2,1),B(7,4),C(4,9)\\)，求外心 \\(O\\) 坐標。',
        a: '簡答：\\(O(3,5)\\)。過程：外心在兩邊中垂線交點。\\(AB\\) 中點 \\((\\frac{9}{2},\\frac{5}{2})\\)，斜率 \\(\\frac{3}{5}\\)，中垂線斜率 \\(-\\frac{5}{3}\\)。\\(AC\\) 中點 \\((3,5)\\)，斜率 4，中垂線斜率 \\(-\\frac{1}{4}\\)。解兩中垂線得 \\(O(3,5)\\)，且到三頂點距離皆為 \\(\\sqrt{17}\\)。',
      },
      {
        q: '若三邊所在直線為 \\(x+2y=9\\)、\\(x-y=9\\)、\\(3x-y=13\\)，求三角形重心。',
        a: '簡答：\\((\\frac{16}{3},-\\frac{5}{3})\\)。過程：三頂點為三條邊兩兩交點。\\(x+2y=9\\) 與 \\(x-y=9\\) 交於 \\((9,0)\\)；\\(x+2y=9\\) 與 \\(3x-y=13\\) 交於 \\((5,2)\\)；\\(x-y=9\\) 與 \\(3x-y=13\\) 交於 \\((2,-7)\\)。重心為 \\((\\frac{9+5+2}{3},\\frac{0+2-7}{3})=(\\frac{16}{3},-\\frac{5}{3})\\)。',
      },
      {
        q: '已知 \\(A(3,5),B(-1,2),C(9,-3)\\)，求 \\(A\\) 角內角平分線方向可經過的一點。',
        a: '簡答：可取 \\((2,-2)\\)。過程：角平分線方向可由兩邊的單位向量和取得。\\(\\overrightarrow{AB}=(-4,-3)\\)，單位向量為 \\((-\\frac{4}{5},-\\frac{3}{5})\\)；\\(\\overrightarrow{AC}=(6,-8)\\)，單位向量為 \\((\\frac{3}{5},-\\frac{4}{5})\\)。相加得 \\((-\\frac{1}{5},-\\frac{7}{5})\\)，所以可取方向 \\((-1,-7)\\)，從 \\(A\\) 出發得到點 \\((2,-2)\\)。',
      },
      {
        q: '由直線 \\(x=0\\)、\\(3x-4y-5=0\\)、\\(3x+4y-5=0\\) 圍成三角形，求其內心。',
        a: '簡答：\\((\\frac{5}{8},0)\\)。過程：兩斜邊關於 \\(x\\) 軸對稱，內心在 \\(y=0\\)。到直線 \\(x=0\\) 的距離為 \\(x\\)，到 \\(3x-4y-5=0\\) 的距離為 \\(\\frac{|3x-5|}{5}\\)。內心在三角形內，令 \\(x=\\frac{5-3x}{5}\\)，得 \\(x=\\frac{5}{8}\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121InterceptConstraintsSet(count) {
    const templates = [
      {
        q: '求通過點 \\((2,3)\\)，且在兩軸上的截距相等之直線方程式。',
        a: '簡答：\\(x+y=5\\)。過程：截距相等設為 \\(a\\)，截距式 \\(\\frac{x}{a}+\\frac{y}{a}=1\\)，即 \\(x+y=a\\)。代入 \\((2,3)\\) 得 \\(a=5\\)。',
      },
      {
        q: '一直線過點 \\((-1,9)\\)，且在兩軸上之截距乘積為 12，求此直線方程式之一。',
        a: '簡答：\\(3x+y=6\\)。過程：設截距為 \\(a,b\\)，則截距式為 \\(\\frac{x}{a}+\\frac{y}{b}=1\\)，且 \\(ab=12\\)。取 \\(a=2,b=6\\)，可得 \\(\\frac{x}{2}+\\frac{y}{6}=1\\)，整理為 \\(3x+y=6\\)。代入 \\((-1,9)\\) 得 \\(3(-1)+9=6\\)，且兩截距乘積為 \\(2\\cdot6=12\\)，符合題意。',
      },
      {
        q: '直線通過 \\((4,1)\\)，且與兩坐標軸在第一象限圍成三角形面積為 8，求其方程式。',
        a: '簡答：\\(x+4y=8\\)。過程：設截距式 \\(\\frac{x}{a}+\\frac{y}{b}=1\\)，且 \\(ab=16\\)。代入 \\((4,1)\\)，取 \\(a=8,b=2\\)，得 \\(\\frac{x}{8}+\\frac{y}{2}=1\\)，整理為 \\(x+4y=8\\)。',
      },
      {
        q: '求通過點 \\((3,-2)\\)，且 \\(x\\) 截距與 \\(y\\) 截距之比為 \\(2:3\\) 的直線。',
        a: '簡答：\\(3x+2y=5\\)。過程：設截距為 \\(2t,3t\\)，截距式 \\(\\frac{x}{2t}+\\frac{y}{3t}=1\\)。代入 \\((3,-2)\\) 得 \\(\\frac{3}{2t}-\\frac{2}{3t}=1\\)，解得 \\(t=\\frac{5}{6}\\)，整理得 \\(3x+2y=5\\)。',
      },
      {
        q: '直線 \\(L\\) 通過 \\((4,3)\\)，且其 \\(x\\) 截距與 \\(y\\) 截距均為正整數，問此種直線共有幾條？',
        a: '簡答：6 條。過程：設截距為正整數 \\(a,b\\)，\\(\\frac{4}{a}+\\frac{3}{b}=1\\)。整理得 \\((a-4)(b-3)=12\\)。12 的正因數配對共有 6 組，所以共有 6 條。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121AnglesBetweenLinesSet(count) {
    const templates = [
      {
        q: '求通過點 \\((1,-2)\\)，且與直線 \\(2x-y+3=0\\) 成 \\(45^\\circ\\) 交角的直線方程式。',
        a: '簡答：\\(y+2=3(x-1)\\) 或 \\(y+2=-\\frac{1}{3}(x-1)\\)。過程：原直線斜率為 2。設所求斜率為 \\(m\\)，\\(|\\frac{m-2}{1+2m}|=1\\)，得 \\(m=3\\) 或 \\(-\\frac{1}{3}\\)，再代入點斜式。',
      },
      {
        q: '已知兩直線 \\(x+y=7\\) 與 \\((1-\\sqrt3)x-(1+\\sqrt3)y-1=0\\)，求其夾角。',
        a: '簡答：\\(60^\\circ\\)。過程：第一條斜率 \\(-1\\)，第二條斜率 \\(\\frac{1-\\sqrt3}{1+\\sqrt3}\\)。代入 \\(\\tan\\theta=|\\frac{m_1-m_2}{1+m_1m_2}|\\)，可得 \\(\\tan\\theta=\\sqrt3\\)，所以銳角為 \\(60^\\circ\\)。',
      },
      {
        q: '直線 \\(L_1\\) 斜率為 1，直線 \\(L_2\\) 與 \\(L_1\\) 交角為 \\(45^\\circ\\)，且通過 \\((1,2)\\)，求 \\(L_2\\) 方程式。',
        a: '簡答：\\(x=1\\) 或 \\(y=2\\)。過程：設 \\(L_2\\) 斜率為 \\(m\\)，\\(|\\frac{m-1}{1+m}|=1\\)，得 \\(m=0\\) 或垂直線。通過 \\((1,2)\\)，故為 \\(y=2\\) 或 \\(x=1\\)。',
      },
      {
        q: '求通過原點且與直線 \\(-\\sqrt3x+y-2=0\\) 成 \\(60^\\circ\\) 角的直線方程式。',
        a: '簡答：\\(y=0\\) 或 \\(y=-\\sqrt3x\\)。過程：原直線斜率 \\(\\sqrt3\\)。與其成 \\(60^\\circ\\) 的方向角可為 \\(0^\\circ\\) 或 \\(120^\\circ\\)，所以通過原點的直線為 \\(y=0\\) 或 \\(y=-\\sqrt3x\\)。',
      },
      {
        q: '若直線 \\(y=mx\\) 與 \\(y=2x+1\\) 的交角為 \\(45^\\circ\\)，求 \\(m\\)。',
        a: '簡答：\\(m=3\\) 或 \\(m=-\\frac{1}{3}\\)。過程：\\(|\\frac{m-2}{1+2m}|=1\\)，解得 \\(m=3\\) 或 \\(m=-\\frac{1}{3}\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121LightReflectionPathSet(count) {
    const templates = [
      {
        q: '光線從 \\(A(2,3)\\) 出發，先碰到 \\(x\\) 軸後反射並通過 \\(B(8,5)\\)，求反射點坐標。',
        a: '簡答：\\((\\frac{17}{4},0)\\)。過程：將 \\(B\\) 對 \\(x\\) 軸反射為 \\(B\\prime(8,-5)\\)。連接 \\(A(2,3)\\) 與 \\(B\\prime\\)，其與 \\(x\\) 軸交點即反射點。用參數式解 \\(y=0\\)，得 \\((\\frac{17}{4},0)\\)。',
      },
      {
        q: '一道光線沿 \\(3x-4y=1\\) 射向 \\(x\\) 軸上的點 \\((3,0)\\)，求反射後光線方程式。',
        a: '簡答：\\(3x+4y-9=0\\)。過程：對 \\(x\\) 軸反射時斜率變號。入射線斜率為 \\(\\frac{3}{4}\\)，反射線斜率為 \\(-\\frac{3}{4}\\)，過 \\((3,0)\\)，得 \\(y=-\\frac{3}{4}(x-3)\\)，整理為 \\(3x+4y-9=0\\)。',
      },
      {
        q: '光線從 \\(A(-4,1)\\) 出發，先碰到 \\(y\\) 軸後反射並通過 \\(B(6,5)\\)，求反射點坐標。',
        a: '簡答：\\((0,-7)\\)。過程：將 \\(A\\) 對 \\(y\\) 軸反射為 \\(A\\prime(4,1)\\)。連接 \\(A\\prime\\) 與 \\(B(6,5)\\)，其與 \\(y\\) 軸交點即反射點。直線斜率為 2，方程為 \\(y-1=2(x-4)\\)，令 \\(x=0\\) 得 \\(y=-7\\)。',
      },
      {
        q: '撞球檯上白球在 \\((5,15)\\)，欲撞擊在 \\((80,30)\\) 的紅球，若先碰撞邊 \\(y=0\\)，求碰撞點。',
        a: '簡答：\\((55,0)\\)。過程：將紅球對 \\(y=0\\) 反射為 \\((80,-30)\\)。連白球 \\((5,15)\\) 與 \\((80,-30)\\)，與 \\(y=0\\) 的交點即碰撞點。直線參數解得 \\((55,0)\\)。',
      },
      {
        q: '已知光線經 \\(y=x\\) 反射，入射光線為 \\(x+2y=5\\)，求反射光線方程式。',
        a: '簡答：\\(2x+y=5\\)。過程：關於 \\(y=x\\) 反射會交換 \\(x,y\\)。將入射線方程 \\(x+2y=5\\) 中的 \\(x,y\\) 互換，得反射線 \\(2x+y=5\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121AreaPartitioningSet(count) {
    const templates = [
      {
        q: '設 \\(A(0,0),B(10,0),C(10,6),D(0,6)\\)，求過 \\((7,4)\\) 且平分四邊形 \\(ABCD\\) 面積的直線斜率。',
        a: '簡答：\\(\\frac{1}{2}\\)。過程：矩形的面積平分線若通過中心 \\((5,3)\\)，則必平分面積。直線又過 \\((7,4)\\)，斜率為 \\(\\frac{4-3}{7-5}=\\frac{1}{2}\\)。',
      },
      {
        q: '直線 \\(y=m(x-7)+4\\) 平分矩形 \\([0,14]\\times[0,8]\\) 面積，求 \\(m\\)。',
        a: '簡答：任意實數 \\(m\\)。過程：矩形中心為 \\((7,4)\\)。任一通過中心的直線都把中心對稱圖形面積平分，而題目直線皆通過 \\((7,4)\\)，所以任意 \\(m\\) 皆可。',
      },
      {
        q: '三角形頂點為 \\((0,0),(6,0),(0,8)\\)，求過原點且平分三角形面積的直線。',
        a: '簡答：\\(y=\\frac{4}{3}x\\)。過程：從頂點出發的中線平分三角形面積。對邊端點 \\((6,0),(0,8)\\) 的中點為 \\((3,4)\\)，故直線通過原點與 \\((3,4)\\)，方程為 \\(y=\\frac{4}{3}x\\)。',
      },
      {
        q: '給定平行四邊形三頂點 \\((0,0),(8,0),(10,6)\\)，求過中心且平分面積的一條直線。',
        a: '簡答：例如 \\(y=3\\)。過程：第四點為 \\((2,6)\\)，中心為兩對角線中點 \\((5,3)\\)。任一過中心的直線平分平行四邊形面積，因此可取 \\(y=3\\)。',
      },
      {
        q: '坐標平面上有一個中心在 \\((2,-1)\\) 的中心對稱區域，求平分此區域總面積的直線集合特徵。',
        a: '簡答：所有通過 \\((2,-1)\\) 的直線。過程：中心對稱區域中，通過對稱中心的任一直線會把每一點與其對稱點分到兩側，因此兩側面積相等。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121LineSegmentSlopeRangeSet(count) {
    const templates = [
      {
        q: '設 \\(A(-2,1),B(1,2)\\)，直線 \\(L:y=mx\\) 與線段 \\(AB\\) 相交，求 \\(m\\) 的範圍。',
        a: '簡答：\\(m\\leq -\\frac{1}{2}\\) 或 \\(m\\geq 2\\)。過程：若 \\(L:y=mx\\) 與線段 \\(AB\\) 相交，則線段上某點 \\((x,y)\\) 滿足 \\(m=\\frac{y}{x}\\)。端點斜率為 \\(\\frac{1}{-2}=-\\frac{1}{2}\\)、\\(\\frac{2}{1}=2\\)。線段 \\(AB\\) 會跨過 \\(x=0\\)，且跨越處不是原點，所以斜率在左側趨向 \\(-\\infty\\)，在右側由 \\(+\\infty\\) 降到 2。因此範圍為 \\((-\\infty,-\\frac{1}{2}]\\cup[2,\\infty)\\)。',
      },
      {
        q: '設 \\(A(-2,1),B(3,2)\\)，直線 \\(L:y=mx+2\\)。若 \\(L\\) 與線段 \\(AB\\) 相交，求 \\(m\\) 的範圍。',
        a: '簡答：\\(m\\leq 0\\) 或 \\(m\\geq \\frac{1}{2}\\)。過程：線段上點若在 \\(L:y=mx+2\\) 上，則 \\(m=\\frac{y-2}{x}\\)。端點給出 \\(m_A=\\frac{1-2}{-2}=\\frac{1}{2}\\)、\\(m_B=\\frac{2-2}{3}=0\\)。線段跨過 \\(x=0\\)，此時 \\(y-2\\neq0\\)，斜率會分成兩段，得到 \\((-\\infty,0]\\cup[\\frac{1}{2},\\infty)\\)。',
      },
      {
        q: '已知 \\(A(3,4),B(-1,2)\\)，直線 \\(L:y-1=m(x-2)\\) 與線段 \\(AB\\) 不相交，求 \\(m\\) 的範圍。',
        a: '簡答：\\(-\\frac{1}{3}<m<3\\)。過程：若相交，線段上某點需滿足 \\(m=\\frac{y-1}{x-2}\\)。端點給出 \\(m_A=\\frac{4-1}{3-2}=3\\)、\\(m_B=\\frac{2-1}{-1-2}=-\\frac{1}{3}\\)。線段跨過 \\(x=2\\)，相交斜率範圍為 \\((-\\infty,-\\frac{1}{3}]\\cup[3,\\infty)\\)，所以不相交時為補集 \\((-\\frac{1}{3},3)\\)。',
      },
      {
        q: '若直線 \\(L\\) 斜率為 \\(m\\) 且通過 \\((0,3)\\)，要使 \\(L\\) 與連接 \\(A(-2,1),B(1,2)\\) 的線段相交，求 \\(m\\)。',
        a: '簡答：\\(m\\leq -1\\) 或 \\(m\\geq 1\\)。過程：直線過 \\((0,3)\\)，所以線段上點 \\((x,y)\\) 對應斜率 \\(m=\\frac{y-3}{x}\\)。端點斜率為 \\(\\frac{1-3}{-2}=1\\)、\\(\\frac{2-3}{1}=-1\\)。線段跨過 \\(x=0\\)，且該點不在 \\((0,3)\\)，所以可取斜率為 \\((-\\infty,-1]\\cup[1,\\infty)\\)。',
      },
      {
        q: '設直線 \\(L:mx-y+(2m+3)=0\\)，若 \\(L\\) 與線段 \\(A(1,2),B(4,5)\\) 相交，求 \\(m\\)。',
        a: '簡答：\\(-\\frac{1}{3}\\leq m\\leq \\frac{1}{3}\\)。過程：方程可寫成 \\(y=m(x+2)+3\\)，表示直線族都通過 \\((-2,3)\\)。線段上點若在直線上，則 \\(m=\\frac{y-3}{x+2}\\)。端點斜率為 \\(\\frac{2-3}{1+2}=-\\frac{1}{3}\\)、\\(\\frac{5-3}{4+2}=\\frac{1}{3}\\)。因為線段上 \\(x+2>0\\)，斜率連續變化，所以 \\(-\\frac{1}{3}\\leq m\\leq\\frac{1}{3}\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121PointLineSideSet(count) {
    const templates = [
      {
        q: '已知 \\(A(-2,1),B(1,2)\\) 位於直線 \\(L:mx-y+3=0\\) 的異側，求 \\(m\\) 的範圍。',
        a: '簡答：\\(m<-1\\) 或 \\(m>1\\)。過程：令 \\(f(x,y)=mx-y+3\\)。則 \\(f(A)=-2m-1+3=2-2m\\)，\\(f(B)=m-2+3=m+1\\)。異側表示 \\(f(A)f(B)<0\\)，所以 \\((2-2m)(m+1)<0\\)，化簡得 \\((1-m)(m+1)<0\\)，故 \\(m<-1\\) 或 \\(m>1\\)。',
      },
      {
        q: '設 \\(P(0,3)\\) 與原點 \\(O(0,0)\\) 位於直線 \\(L:2x+3y-12=0\\) 的哪一側？判斷同側或異側。',
        a: '簡答：同側，且都在 \\(2x+3y-12<0\\) 的一側。過程：代入 \\(P(0,3)\\) 得 \\(2\\cdot0+3\\cdot3-12=-3<0\\)；代入 \\(O(0,0)\\) 得 \\(-12<0\\)。兩個值同號，所以兩點在同側。',
      },
      {
        q: '若點 \\(A(k,2)\\) 與 \\(B(-4,4)\\) 在直線 \\(L:4x-3y+12=0\\) 的同側，求實數 \\(k\\) 的範圍。',
        a: '簡答：\\(k<-\\frac{3}{2}\\)。過程：令 \\(f(x,y)=4x-3y+12\\)。\\(f(A)=4k-6+12=4k+6\\)，\\(f(B)=-16-12+12=-16\\)。同側表示 \\(f(A)f(B)>0\\)，即 \\((4k+6)(-16)>0\\)，所以 \\(4k+6<0\\)，得 \\(k<-\\frac{3}{2}\\)。',
      },
      {
        q: '已知直線 \\(L:3x+y-7=0\\) 將平面分成兩半，判斷 \\((1,1),(2,1),(3,0),(-1,9)\\) 中哪些點與原點在同一個半平面。',
        a: '簡答：\\((1,1)\\)、\\((-1,9)\\)。過程：原點代入得 \\(-7<0\\)。各點代入 \\(3x+y-7\\)：\\((1,1)\\) 得 \\(-3<0\\)，\\((2,1)\\) 得 0，在直線上，\\((3,0)\\) 得 \\(2>0\\)，\\((-1,9)\\) 得 \\(-1<0\\)。所以與原點同半平面的是 \\((1,1)\\)、\\((-1,9)\\)。',
      },
      {
        q: '設 \\(A(2,1),B(3,5)\\) 在直線 \\(L:x-2y+k=0\\) 的兩側，求 \\(k\\) 的範圍。',
        a: '簡答：\\(0<k<7\\)。過程：令 \\(f(x,y)=x-2y+k\\)。\\(f(A)=2-2+k=k\\)，\\(f(B)=3-10+k=k-7\\)。兩側表示 \\(f(A)f(B)<0\\)，所以 \\(k(k-7)<0\\)，解得 \\(0<k<7\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121LatticePointCountingSet(count) {
    const templates = [
      {
        q: '求滿足聯立不等式 \\(0<x<5,\\ 0<y<6,\\ x+y\\leq7\\) 的區域內共有幾個格子點。',
        a: '簡答：17 個。過程：因為 \\(x,y\\) 都是整數，\\(x=1,2,3,4\\)，且 \\(y=1,2,3,4,5\\)。逐一看 \\(x+y\\leq7\\)：\\(x=1\\) 時有 5 個，\\(x=2\\) 時有 5 個，\\(x=3\\) 時有 4 個，\\(x=4\\) 時有 3 個，共 \\(5+5+4+3=17\\) 個。',
      },
      {
        q: '在 \\(x\\geq0,\\ y\\geq0,\\ 2x+y\\leq6\\) 圍成的區域中，共有幾個格子點。',
        a: '簡答：16 個。過程：\\(x\\) 可為 0,1,2,3。當 \\(x=0\\)，\\(y=0\\sim6\\) 有 7 個；\\(x=1\\)，\\(y=0\\sim4\\) 有 5 個；\\(x=2\\)，\\(y=0\\sim2\\) 有 3 個；\\(x=3\\)，\\(y=0\\) 有 1 個。合計 \\(7+5+3+1=16\\) 個。',
      },
      {
        q: '滿足 \\(x+3y\\geq-6,\\ x-y\\leq1,\\ y\\leq-1\\) 的解區域中，求其格子點個數。',
        a: '簡答：4 個。過程：由 \\(x+3y\\geq-6\\) 得 \\(x\\geq-6-3y\\)，由 \\(x-y\\leq1\\) 得 \\(x\\leq y+1\\)。要有整數 \\(x\\)，需 \\(-6-3y\\leq y+1\\)，即 \\(y\\geq-\\frac{7}{4}\\)。又 \\(y\\leq-1\\)，所以整數 \\(y\\) 只能是 \\(-1\\)。此時 \\(-3\\leq x\\leq0\\)，共有 4 個格子點。',
      },
      {
        q: '求不等式組 \\(x+y\\leq4,\\ 2x+y\\leq6,\\ x\\geq0,\\ y\\geq0\\) 圍成區域的格子點總數。',
        a: '簡答：13 個。過程：枚舉非負整數 \\(x\\)。\\(x=0\\) 時 \\(y=0\\sim4\\) 有 5 個；\\(x=1\\) 時 \\(y=0\\sim3\\) 有 4 個；\\(x=2\\) 時 \\(y=0\\sim2\\) 有 3 個；\\(x=3\\) 時 \\(y=0\\) 有 1 個。合計 \\(5+4+3+1=13\\) 個。',
      },
      {
        q: '在 \\(x+2y\\leq8,\\ x\\geq2,\\ y\\geq1\\) 的區域內共有幾個格子點。',
        a: '簡答：9 個。過程：由 \\(x+2y\\leq8\\) 且 \\(x\\geq2\\)，可知 \\(y\\leq3\\)，所以 \\(y=1,2,3\\)。當 \\(y=1\\)，\\(2\\leq x\\leq6\\) 有 5 個；\\(y=2\\)，\\(2\\leq x\\leq4\\) 有 3 個；\\(y=3\\)，\\(x=2\\) 有 1 個。合計 9 個。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121AbsoluteInequalityAreaSet(count) {
    const templates = [
      {
        q: '在坐標平面上畫出 \\(|x|+|y|\\leq4\\) 的圖形並求其面積。',
        a: '簡答：32。過程：\\(|x|+|y|\\leq4\\) 是以原點為中心的菱形，四個頂點為 \\((4,0),(0,4),(-4,0),(0,-4)\\)。兩條對角線長都是 8，所以面積為 \\(\\frac{8\\cdot8}{2}=32\\)。',
      },
      {
        q: '求不等式組 \\(|4x+y|\\leq2\\) 與 \\(|x-y|\\leq2\\) 所圍成圖形的面積。',
        a: '簡答：\\(\\frac{16}{5}\\)。過程：令 \\(u=4x+y\\)、\\(v=x-y\\)，則區域變成 \\(-2\\leq u\\leq2,\\ -2\\leq v\\leq2\\)，在 \\(uv\\) 平面面積為 16。變換的行列式絕對值為 \\(|4(-1)-1\\cdot1|=5\\)，所以原 \\(xy\\) 平面面積為 \\(\\frac{16}{5}\\)。',
      },
      {
        q: '求 \\(|x|\\geq|y|\\) 與 \\(|x-1|\\leq2\\) 所圍成的區域面積。',
        a: '簡答：10。過程：\\(|x-1|\\leq2\\) 表示 \\(-1\\leq x\\leq3\\)，而 \\(|x|\\geq|y|\\) 表示 \\(-|x|\\leq y\\leq |x|\\)。面積為 \\(\\int_{-1}^{3}2|x|\\,dx=\\int_{-1}^{0}(-2x)\\,dx+\\int_{0}^{3}2x\\,dx=1+9=10\\)。',
      },
      {
        q: '畫出 \\(|x|+4|y|>4\\) 且 \\(|x|+|y|<4\\) 的圖形區域並求面積。',
        a: '簡答：24。過程：外層 \\(|x|+|y|<4\\) 是對角線長皆為 8 的菱形，面積 32。被挖掉的 \\(|x|+4|y|\\leq4\\) 是頂點 \\((\\pm4,0),(0,\\pm1)\\) 的菱形，面積 \\(\\frac{8\\cdot2}{2}=8\\)。嚴格不等號不影響面積，所以所求面積為 \\(32-8=24\\)。',
      },
      {
        q: '求 \\(|2x|+|3y|\\leq6\\) 所圍成幾何圖形的面積。',
        a: '簡答：12。過程：不等式可化為 \\(\\frac{|x|}{3}+\\frac{|y|}{2}\\leq1\\)，圖形是頂點 \\((\\pm3,0),(0,\\pm2)\\) 的菱形。兩條對角線長為 6 與 4，面積為 \\(\\frac{6\\cdot4}{2}=12\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121LineFormFactsSet(count) {
    const questions = [];
    const answers = [];
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
      questions.push(`已知直線 \\(L:${line}\\)，求斜率、\\(x\\) 截距、\\(y\\) 截距，以及它與兩坐標軸所圍三角形的面積。`);
      answers.push(
        `答案：斜率 \\(${formatFractionObject(slope)}\\)，\\(x\\) 截距 \\(${formatFractionObject(xIntercept)}\\)，\\(y\\) 截距 \\(${formatFractionObject(yIntercept)}\\)，面積 \\(${formatFractionObject(area)}\\)。解析：直線方程式 \\(${line}=0\\) 對應 \\(ax+by+c=0\\)，其中 \\(a=${a}\\)，\\(b=${b}\\)，\\(c=${c}\\)。由公式可得斜率 \\(-\\frac{a}{b}=-\\frac{${a}}{${b}}=${formatFractionObject(slope)}\\)；\\(x\\) 截距（令 \\(y=0\\)）為 \\(-\\frac{c}{a}=-\\frac{${c}}{${a}}=${formatFractionObject(xIntercept)}\\)；\\(y\\) 截距（令 \\(x=0\\)）為 \\(-\\frac{c}{b}=-\\frac{${c}}{${b}}=${formatFractionObject(yIntercept)}\\)。三角形面積為 \\(\\frac12\\left|x_0y_0\\right|=\\frac12\\left|${formatFractionObject(xIntercept)}\\right|\\left|${formatFractionObject(yIntercept)}\\right|=${formatFractionObject(area)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS121LinearFractionalRegionExtremaSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS122TwoCircleCommonTangentsSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function formatS122Point(point) {
    return `(${point.x},${point.y})`;
  }

  function formatS122SignedNumber(value) {
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
    const answers = [];
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
        `簡答：\\(${formatS122CircleStandard(center.x, center.y, radius2)}\\)。過程：圓心必在線段 \\(AB\\) 的垂直平分線上。由 \\(A,B\\) 中點得 \\(M${formatS122Point(center)}\\)，且 \\(M\\) 也在已知直線上，所以圓心為 \\(${formatS122Point(center)}\\)。半徑平方為 \\(${offset.x}^2+${offset.y}^2=${radius2}\\)，故方程式為 \\(${formatS122CircleStandard(center.x, center.y, radius2)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123ChordLengthParameterizedSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123TangentPointCircleCoefficientSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS122GeneralToStandardSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS122CircleDiscriminantParameterSet(count) {
    const templates = [
      {
        q: '討論方程式 \\(x^2+y^2+2x+4y+3-2k=0\\) 隨 \\(k\\) 值變化的圖形意義。',
        a: '簡答：\\(k>-1\\) 為圓，\\(k=-1\\) 為一點，\\(k<-1\\) 不存在實圖形。過程：判別量 \\(\\Delta=d^2+e^2-4f=2^2+4^2-4(3-2k)=8k+8\\)。\\(\\Delta>0\\) 為圓，\\(\\Delta=0\\) 為點，\\(\\Delta<0\\) 不存在，所以得到上述範圍。',
      },
      {
        q: '若 \\(x^2+y^2+4x-2ky+(k+6)=0\\) 代表一個點，求 \\(k\\) 之值。',
        a: '簡答：\\(k=-1\\) 或 \\(k=2\\)。過程：代表一點表示 \\(\\Delta=0\\)。此處 \\(d=4,e=-2k,f=k+6\\)，所以 \\(\\Delta=4^2+(-2k)^2-4(k+6)=4k^2-4k-8=4(k-2)(k+1)\\)。令其為 0，得 \\(k=-1\\) 或 \\(k=2\\)。',
      },
      {
        q: '若 \\(x^2+y^2+2(m+1)x-2my+3m^2-2=0\\) 的圖形為一圓，求 \\(m\\) 的範圍。',
        a: '簡答：\\(-1<m<3\\)。過程：要成為一圓需 \\(r^2>0\\)，等價於 \\(\\Delta>0\\)。\\(\\Delta=[2(m+1)]^2+(-2m)^2-4(3m^2-2)=-4(m-3)(m+1)\\)。令 \\(-4(m-3)(m+1)>0\\)，得 \\(-1<m<3\\)。',
      },
      {
        q: '若 \\(x^2+y^2+2(m+1)x-2my+3m^2-2=0\\) 的圖形為一圓，當 \\(m\\) 為何值時，此圓有最大面積？',
        a: '簡答：\\(m=1\\)，最大面積為 \\(4\\pi\\)。過程：此圓的半徑平方為 \\(r^2=\\frac{[2(m+1)]^2+(-2m)^2-4(3m^2-2)}{4}=-m^2+2m+3=4-(m-1)^2\\)。面積 \\(\\pi r^2\\) 最大時，\\((m-1)^2\\) 最小，所以 \\(m=1\\)，此時 \\(r^2=4\\)，最大面積為 \\(4\\pi\\)。',
      },
      {
        q: '已知 \\(x^2+y^2+kx+2ky-5k-25=0\\) 恆通過兩定點，求這兩定點。',
        a: '簡答：\\((5,0)\\)、\\((-3,4)\\)。過程：將方程式整理為 \\(x^2+y^2-25+k(x+2y-5)=0\\)。若一點對所有 \\(k\\) 都成立，需同時滿足 \\(x^2+y^2-25=0\\) 與 \\(x+2y-5=0\\)。代入 \\(x=5-2y\\)，得 \\(y=0\\) 或 \\(y=4\\)，所以兩定點為 \\((5,0)\\)、\\((-3,4)\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS122CircleFromConditionsSet(count) {
    const templates = [
      {
        q: '求以點 \\(A(-1,3)\\)、\\(B(-5,1)\\) 為直徑兩端點的圓方程式。',
        a: '簡答：\\((x+3)^2+(y-2)^2=5\\)。過程：直徑端點中點為圓心，\\(C=(-3,2)\\)。半徑平方為 \\(CA^2=(2)^2+(1)^2=5\\)，所以圓方程式為 \\((x+3)^2+(y-2)^2=5\\)。',
      },
      {
        q: '求圓心在直線 \\(x+3y-4=0\\) 上，且與 \\(x\\) 軸及 \\(y\\) 軸都相切的圓方程式。',
        a: '簡答：\\((x-1)^2+(y-1)^2=1\\) 或 \\((x+2)^2+(y-2)^2=4\\)。過程：同時與兩坐標軸相切，圓心 \\((h,k)\\) 需滿足 \\(|h|=|k|=r\\)。若 \\(k=h\\)，代入直線得 \\(4h=4\\)，所以 \\((h,k)=(1,1)\\)；若 \\(k=-h\\)，得 \\(-2h=4\\)，所以 \\((h,k)=(-2,2)\\)。半徑分別為 1、2。',
      },
      {
        q: '求通過三點 \\(P(5,2)\\)、\\(Q(3,-2)\\)、\\(R(-1,2)\\) 的圓方程式。',
        a: '簡答：\\((x-2)^2+(y-1)^2=10\\)。過程：觀察三點到 \\((2,1)\\) 的距離平方皆為 10：\\((5-2)^2+(2-1)^2=10\\)、\\((3-2)^2+(-2-1)^2=10\\)、\\((-1-2)^2+(2-1)^2=10\\)。所以圓心為 \\((2,1)\\)，半徑平方為 10。',
      },
      {
        q: '圓心在 \\(y\\) 軸上，且通過兩點 \\((2,10)\\)、\\((6,2)\\)，求其方程式。',
        a: '簡答：\\(x^2+(y-3)^2=53\\)。過程：設圓心為 \\((0,c)\\)。兩點到圓心距離相等，所以 \\(2^2+(10-c)^2=6^2+(2-c)^2\\)。解得 \\(c=3\\)，半徑平方為 \\(2^2+(10-3)^2=53\\)。',
      },
      {
        q: '求與圓 \\((x-3)^2+y^2=16\\) 同圓心，且圓周長為其一半的圓。',
        a: '簡答：\\((x-3)^2+y^2=4\\)。過程：原圓圓心為 \\((3,0)\\)，半徑為 4。圓周長和半徑成正比，周長變成一半表示半徑變成 2，所以新圓方程式為 \\((x-3)^2+y^2=2^2\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS122ApolloniusCircleSet(count) {
    function equationForRatio(a, b, m, n) {
      let aa = n * n - m * m;
      let d = -2 * n * n * a.x + 2 * m * m * b.x;
      let e = -2 * n * n * a.y + 2 * m * m * b.y;
      let f = n * n * (a.x * a.x + a.y * a.y) - m * m * (b.x * b.x + b.y * b.y);
      if (aa < 0) {
        aa *= -1;
        d *= -1;
        e *= -1;
        f *= -1;
      }
      const g = gcdInt(gcdInt(aa, d), gcdInt(e, f));
      return { a: aa / g, d: d / g, e: e / g, f: f / g };
    }
    const templates = [
      {
        a: { x: 0, y: 0 },
        b: { x: 3, y: 0 },
        m: 2,
        n: 1,
        wording: '已知 \\(A(0,0)\\)、\\(B(3,0)\\)，若點 \\(P\\) 滿足 \\(PA=2PB\\)，求 \\(P\\) 的軌跡方程式。',
      },
      {
        a: { x: 2, y: 1 },
        b: { x: 8, y: 4 },
        m: 2,
        n: 1,
        wording: '已知 \\(A(2,1)\\)、\\(B(8,4)\\)，若點 \\(P\\) 滿足 \\(PA:PB=2:1\\)，求 \\(P\\) 的軌跡方程式。',
      },
      {
        a: { x: 0, y: 0 },
        b: { x: 30, y: 0 },
        m: 2,
        n: 1,
        wording:
          '獵狗問題：設大獵犬在 \\(A(0,0)\\)、小獵犬在 \\(B(30,0)\\)，且大獵犬速度為小獵犬 2 倍，求兩犬同時抵達獵物的區域圖形。',
      },
      {
        a: { x: 3, y: 5 },
        b: { x: -10, y: 4 },
        m: 2,
        n: 3,
        wording: '設 \\(A(3,5)\\)、\\(B(-10,4)\\)，滿足 \\(PA:PB=2:3\\)，求軌跡方程式。',
      },
      {
        a: { x: 1, y: 5 },
        b: { x: 9, y: 0 },
        m: 2,
        n: 1,
        wording: '已知 \\(A(1,5)\\)、\\(B(9,0)\\)，求滿足 \\(PA=2PB\\) 的圖形面積。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      const eq = equationForRatio(item.a, item.b, item.m, item.n);
      const centerX = formatFraction(-eq.d, 2 * eq.a);
      const centerY = formatFraction(-eq.e, 2 * eq.a);
      const delta = eq.d * eq.d + eq.e * eq.e - 4 * eq.a * eq.f;
      const r2 = formatFraction(delta, 4 * eq.a * eq.a);
      questions.push(item.wording);
      if (i % 5 === 4) {
        answers.push(
          `簡答：面積 \\(\\frac{356\\pi}{9}\\)。過程：由 \\(PA=2PB\\)，得 \\((x-1)^2+(y-5)^2=4[(x-9)^2+y^2]\\)，整理為 \\(${formatS122CircleEquationFromCoeffs(eq.a, eq.d, eq.e, eq.f)}\\)。配方後半徑平方為 \\(${r2}\\)，所以面積為 \\(\\pi\\cdot\\frac{356}{9}=\\frac{356\\pi}{9}\\)。`
        );
      } else {
        answers.push(
          `簡答：\\(${formatS122CircleEquationFromCoeffs(eq.a, eq.d, eq.e, eq.f)}\\)。過程：由 \\(PA:PB=${item.m}:${item.n}\\)，可列 \\(${item.n}^2PA^2=${item.m}^2PB^2\\)。代入 \\(A${formatS122Point(item.a)}\\)、\\(B${formatS122Point(item.b)}\\) 後整理，即得 \\(${formatS122CircleEquationFromCoeffs(eq.a, eq.d, eq.e, eq.f)}\\)。其圓心為 \\((${centerX},${centerY})\\)，半徑平方為 \\(${r2}\\)。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS122RadicalAxisSet(count) {
    const templates = [
      {
        q: '求二圓 \\(C_1:x^2+y^2+3x+4y+1=0\\) 與 \\(C_2:x^2+y^2+x-3y=0\\) 的公共弦方程式。',
        a: '簡答：\\(2x+7y+1=0\\)。過程：兩圓交點同時滿足兩方程，將 \\(C_1-C_2\\)，二次項消去，得 \\((3x-x)+(4y+3y)+1=0\\)，所以公共弦方程式為 \\(2x+7y+1=0\\)。',
      },
      {
        q: '求過圓 \\(x^2+y^2-2x+4y+1=0\\) 與直線 \\(x+2y+2=0\\) 之交點，且過點 \\((2,3)\\) 的圓。',
        a: '簡答：\\(5x^2+5y^2-21x-2y-17=0\\)。過程：設所求圓為 \\(x^2+y^2-2x+4y+1+\\lambda(x+2y+2)=0\\)。代入 \\((2,3)\\) 得 \\(22+10\\lambda=0\\)，所以 \\(\\lambda=-\\frac{11}{5}\\)。同乘以 5 整理得 \\(5x^2+5y^2-21x-2y-17=0\\)。',
      },
      {
        q: '以兩圓 \\(C_1:x^2+y^2-25=0\\) 與 \\(C_2:x^2+y^2-6x-7=0\\) 之公共弦為直徑，求圓方程式。',
        a: '簡答：\\((x-3)^2+y^2=16\\)。過程：兩圓相減得公共弦 \\(x=3\\)。代入 \\(x^2+y^2=25\\)，得 \\(y=\\pm4\\)，所以公共弦端點為 \\((3,4),(3,-4)\\)。以此為直徑的圓心為 \\((3,0)\\)，半徑為 4，故方程式為 \\((x-3)^2+y^2=16\\)。',
      },
      {
        q: '求過圓 \\(x^2+y^2-2x-4y+1=0\\) 與直線 \\(2x-y+4=0\\) 之交點，且切於 \\(y\\) 軸的圓。',
        a: '簡答：\\(x^2+y^2+2x-6y+9=0\\) 或 \\(x^2+y^2+10x-10y+25=0\\)。過程：設圓族為 \\(x^2+y^2-2x-4y+1+\\lambda(2x-y+4)=0\\)。其 \\(x\\) 係數為 \\(-2+2\\lambda\\)，\\(y\\) 係數為 \\(-4-\\lambda\\)，常數為 \\(1+4\\lambda\\)。切於 \\(y\\) 軸表示圓心到 \\(y\\) 軸距離等於半徑，化成 \\((-4-\\lambda)^2=4(1+4\\lambda)\\)，得 \\(\\lambda=2\\) 或 6，代回即得兩圓。',
      },
      {
        q: '若圓系 \\(x^2+y^2+kx+2ky-5k-25=0\\) 恆過哪兩定點？',
        a: '簡答：\\((5,0)\\)、\\((-3,4)\\)。過程：整理為 \\(x^2+y^2-25+k(x+2y-5)=0\\)。恆過定點需同時滿足 \\(x^2+y^2-25=0\\) 與 \\(x+2y-5=0\\)。解得 \\((5,0)\\)、\\((-3,4)\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS122PointCircleDistanceExtremaSet(count) {
    const templates = [
      {
        q: '求點 \\(P(6,3)\\) 到圓 \\(x^2+y^2-4x+2y+3=0\\) 的最短距離與最長距離。',
        a: '簡答：最短距離 \\(3\\sqrt2\\)，最長距離 \\(5\\sqrt2\\)。過程：圓配方為 \\((x-2)^2+(y+1)^2=2\\)，圓心 \\(C(2,-1)\\)，半徑 \\(r=\\sqrt2\\)。\\(PC=\\sqrt{(6-2)^2+(3+1)^2}=4\\sqrt2\\)。因為點在圓外，最短距離為 \\(PC-r=3\\sqrt2\\)，最長距離為 \\(PC+r=5\\sqrt2\\)。',
      },
      {
        q: '若 \\(A(1,5)\\) 為圓 \\((x+3)^2+(y-2)^2=36\\) 內部一點，求 \\(A\\) 到圓周的最短距離。',
        a: '簡答：1。過程：圓心為 \\((-3,2)\\)，半徑為 6。\\(A\\) 到圓心距離為 \\(\\sqrt{(1+3)^2+(5-2)^2}=5\\)。點在圓內時，到圓周的最短距離為 \\(r-AC=6-5=1\\)。',
      },
      {
        q: '設 \\(P(a,b)\\) 為圓 \\(x^2+y^2-4x-2y+4=0\\) 上的動點，求 \\(a^2+(b-1)^2\\) 的最大值。',
        a: '簡答：9。過程：\\(a^2+(b-1)^2\\) 表示點 \\(P(a,b)\\) 到 \\((0,1)\\) 的距離平方。圓配方為 \\((x-2)^2+(y-1)^2=1\\)，圓心 \\((2,1)\\)，半徑 1。\\((0,1)\\) 到圓心距離為 2，所以到圓上點的最大距離為 \\(2+1=3\\)，平方最大值為 9。',
      },
      {
        q: '已知圓 \\(C:x^2+y^2-10x+9=0\\)，求圓上點到直線 \\(3x+4y-15=0\\) 的最短距離。',
        a: '簡答：0。過程：圓配方為 \\((x-5)^2+y^2=16\\)，圓心 \\((5,0)\\)，半徑 4。圓心到直線的距離為 \\(\\frac{|3\\cdot5+4\\cdot0-15|}{5}=0\\)，表示直線通過圓心，因此直線與圓相交，圓上有點在此直線上，最短距離為 0。',
      },
      {
        q: '求原點到圓 \\((x-7)^2+(y-8)^2=9\\) 的整數距離共有幾個。',
        a: '簡答：6 個。過程：圓心 \\((7,8)\\) 到原點距離為 \\(\\sqrt{113}\\)，半徑為 3。因此原點到圓上點的距離範圍是 \\([\\sqrt{113}-3,\\sqrt{113}+3]\\)。因為 \\(10<\\sqrt{113}<11\\)，此範圍約為 7 到 14 之間，實際整數距離為 8、9、10、11、12、13，共 6 個。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS122AxisTangentCircleSet(count) {
    const questions = [];
    const answers = [];

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
          `簡答：\\((x-${h})^2+(y-${k})^2=${r * r}\\)。過程：與兩坐標軸都相切且圓心在第一象限，圓心可設為 \\((r,r)\\)，半徑為 \\(r\\)。代入點 \\(${formatS122Point(point)}\\)，得 \\((${point.x}-r)^2+(${point.y}-r)^2=r^2\\)，解得 \\(r=${r}\\)。`
        );
        continue;
      }

      if (type === 1) {
        const r = randInt(2, 6);
        questions.push(`求通過點 \\((${2 * r},${r})\\)，且與兩坐標軸均相切的所有圓方程式。`);
        answers.push(
          `簡答：\\((x-${r})^2+(y-${r})^2=${r * r}\\)。過程：若圓心為 \\((h,k)\\)，與兩軸相切表示 \\(|h|=|k|=r\\)。檢查四種符號組合，只有 \\((h,k)=(${r},${r})\\) 會使點 \\((${2 * r},${r})\\) 到圓心距離為 ${r}，故圓方程式如上。`
        );
        continue;
      }

      if (type === 2) {
        const r = randInt(2, 6);
        const c = 2 * r;
        questions.push(`求圓心在直線 \\(x+y=${c}\\) 上，且與兩坐標軸都相切的所有圓方程式。`);
        answers.push(
          `簡答：\\((x-${r})^2+(y-${r})^2=${r * r}\\)。過程：與兩坐標軸相切時圓心為 \\((\\pm r,\\pm r)\\)。代入 \\(x+y=${c}\\)，只有 \\((r,r)=(${r},${r})\\) 符合，所以半徑為 ${r}。`
        );
        continue;
      }

      if (type === 3) {
        const r = randInt(2, 5);
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
        `簡答：\\((x+${r})^2+(y-${r})^2=${r * r}\\)。過程：圓心在第二象限且與兩軸相切，可設圓心為 \\((-r,r)\\)，半徑為 \\(r\\)。代入點 \\(${formatS122Point(point)}\\)，得 \\((-${r}+r)^2+(${2 * r}-r)^2=r^2\\)，所以半徑為 ${r}。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS122ParametricStandardSet(count) {
    const questions = [];
    const answers = [];
    const paramCoord = (center, radius, trig) => {
      if (center === 0) return `${radius}\\${trig}`;
      return `${center}${radius >= 0 ? '+' : ''}${radius}\\${trig}`;
    };

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const h = randInt(-4, 4);
        const k = randInt(-3, 3);
        const r = randInt(2, 6);
        questions.push(`將圓 \\(${formatS122CircleStandard(h, k, r * r)}\\) 化為參數式。`);
        answers.push(
          `簡答：\\(x=${paramCoord(h, r, 'cos')}\\theta,\\ y=${paramCoord(k, r, 'sin')}\\theta\\)。過程：標準式 \\((x-h)^2+(y-k)^2=r^2\\) 的參數式為 \\(x=h+r\\cos\\theta,\\ y=k+r\\sin\\theta\\)。本題圓心為 \\(${formatS122Point({ x: h, y: k })}\\)，半徑為 ${r}。`
        );
        continue;
      }

      if (type === 1) {
        const h = randInt(-4, 4);
        const k = randInt(-4, 4);
        const r = randInt(2, 6);
        questions.push(
          `已知圓的參數式為 \\(x=${paramCoord(h, r, 'cos')}\\theta,\\ y=${paramCoord(k, r, 'sin')}\\theta\\)，求其標準式。`
        );
        answers.push(
          `簡答：\\(${formatS122CircleStandard(h, k, r * r)}\\)。過程：由參數式可知圓心為 \\(${formatS122Point({ x: h, y: k })}\\)，半徑為 ${r}，所以標準式為 \\(${formatS122CircleStandard(h, k, r * r)}\\)。`
        );
        continue;
      }

      if (type === 2) {
        const r = randInt(2, 8);
        const den = [3, 4, 6][randInt(0, 2)];
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
        const yText = randInt(0, 1) === 0 ? '\\frac{\\sqrt3}{2}' : '-\\frac{\\sqrt3}{2}';
        questions.push(
          `在單位圓 \\(x=\\cos\\theta,\\ y=\\sin\\theta\\) 上一點，其 \\(y\\) 坐標為 \\(${yText}\\)，求所有可能的點坐標。`
        );
        answers.push(
          `簡答：\\((\\frac12,${yText})\\)、\\((-\\frac12,${yText})\\)。過程：單位圓上有 \\(x^2+y^2=1\\)。代入 \\(y^2=\\frac34\\)，得 \\(x^2=\\frac14\\)，所以 \\(x=\\pm\\frac12\\)。`
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS122CirclePointAlgebraExtremaSet(count) {
    const questions = [];
    const answers = [];
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
        questions.push(
          `已知 \\((x,y)\\) 滿足 \\(x^2+y^2\\leq ${r * r}\\)，求 \\(${a}x${b >= 0 ? '+' : ''}${b}y\\) 的最大值與最小值。`
        );
        answers.push(
          `簡答：最大值 \\(${bound}\\)，最小值 \\(-${bound}\\)。過程：線性式 \\(${a}x${b >= 0 ? '+' : ''}${b}y\\) 在圓盤上的極值為 \\(\\pm r\\sqrt{${a}^2+(${b})^2}\\)。代入 \\(r=${r}\\)，得 \\(\\pm ${bound}\\)。`
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
        const yDiffText = targetY >= 0 ? `b-${targetY}` : `b+${Math.abs(targetY)}`;
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS122TriangleCircumInCircleSet(count) {
    const templates = [
      {
        q: '求以 \\(A(5,2)\\)、\\(B(4,3)\\)、\\(C(-2,-5)\\) 為三頂點之三角形的外接圓方程式。',
        a: '簡答：\\((x-1)^2+(y+1)^2=25\\)。過程：設外接圓為 \\(x^2+y^2+Dx+Ey+F=0\\)。代入三點可解得 \\(D=-2,E=2,F=-23\\)，所以圓方程式為 \\(x^2+y^2-2x+2y-23=0\\)，配方得 \\((x-1)^2+(y+1)^2=25\\)。',
      },
      {
        q: '求三直線 \\(x-y-9=0\\)、\\(x+2y=0\\)、\\(3x-y-7=0\\) 圍成之三角形的外接圓圓心。',
        a: '簡答：\\((2,-6)\\)。過程：三條直線兩兩相交得頂點 \\((6,-3)\\)、\\((-1,-10)\\)、\\((2,-1)\\)。設外心為 \\((h,k)\\)，由到三頂點距離相等，解兩條中垂線可得 \\((h,k)=(2,-6)\\)。',
      },
      {
        q: '求三直線 \\(x=0\\)、\\(3x-4y-5=0\\)、\\(3x+4y+10=0\\) 圍成三角形之內切圓方程式。',
        a: '簡答：\\((x+\\frac{5}{16})^2+(y+\\frac{15}{8})^2=\\frac{25}{256}\\)。過程：三角形三頂點為 \\((0,-\\frac54)\\)、\\((0,-\\frac52)\\)、\\((-\\frac56,-\\frac{15}{8})\\)。由對稱邊長可得內心在 \\(y=-\\frac{15}{8}\\)，再令到直線 \\(x=0\\) 與到斜邊的距離相等，可得內心 \\((-\\frac{5}{16},-\\frac{15}{8})\\)，半徑為 \\(\\frac{5}{16}\\)。',
      },
      {
        q: '已知 \\(\\triangle ABC\\) 三頂點為 \\(A(1,1)\\)、\\(B(3,1)\\)、\\(C(s,t)\\)，若其外接圓心為 \\((2,-1)\\) 且半徑為 5，求一組可能的 \\(C\\) 點。',
        a: '簡答：例如 \\(C(-2,2)\\)。過程：外接圓心 \\((2,-1)\\)、半徑 5，故 \\(C\\) 必須在 \\((x-2)^2+(y+1)^2=25\\) 上，且不可與 \\(A,B\\) 共線。取 \\((-2,2)\\)，有 \\((-2-2)^2+(2+1)^2=16+9=25\\)，且不在直線 \\(y=1\\) 上，所以可作為 \\(C\\) 點。',
      },
      {
        q: '求以 \\((0,0)\\)、\\((3,0)\\)、\\((0,4)\\) 為頂點的三角形其內切圓圓心坐標。',
        a: '簡答：\\((1,1)\\)。過程：這是直角三角形，兩股長為 3、4，斜邊長為 5。直角三角形內切圓半徑 \\(r=\\frac{3+4-5}{2}=1\\)。內心距兩坐標軸皆為 1，且在第一象限，所以內心為 \\((1,1)\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123GivenSlopeTangentSet(count) {
    const templates = [
      {
        q: '求斜率為 \\(-2\\) 且與圓 \\(x^2+y^2=5\\) 相切的兩條直線方程式。',
        a: '簡答：\\(y=-2x+5\\) 或 \\(y=-2x-5\\)。過程：設切線為 \\(y=-2x+b\\)，即 \\(2x+y-b=0\\)。圓心 \\((0,0)\\) 到切線距離需等於半徑 \\(\\sqrt5\\)，所以 \\(\\frac{|b|}{\\sqrt5}=\\sqrt5\\)，得 \\(|b|=5\\)。',
      },
      {
        q: '求與直線 \\(x+2y=3\\) 平行且與圓 \\(x^2+y^2-6x+2y+5=0\\) 相切的切線。',
        a: '簡答：\\(x+2y+4=0\\) 或 \\(x+2y-6=0\\)。過程：圓配方為 \\((x-3)^2+(y+1)^2=5\\)，圓心 \\((3,-1)\\)，半徑 \\(\\sqrt5\\)。設平行切線為 \\(x+2y+c=0\\)，距離條件 \\(\\frac{|3+2(-1)+c|}{\\sqrt5}=\\sqrt5\\)，得 \\(|1+c|=5\\)，所以 \\(c=4\\) 或 \\(-6\\)。',
      },
      {
        q: '求與直線 \\(x-3y-4=0\\) 平行且與圓 \\(x^2+y^2+4x+6y+4=0\\) 相切的切線。',
        a: '簡答：\\(x-3y+4+\\sqrt{140}=0\\) 或 \\(x-3y+4-\\sqrt{140}=0\\)。過程：圓配方為 \\((x+2)^2+(y+3)^2=9\\)，圓心 \\((-2,-3)\\)，半徑 3。設切線為 \\(x-3y+c=0\\)，距離條件 \\(\\frac{|-2-3(-3)+c|}{\\sqrt{10}}=3\\)，即 \\(|7+c|=3\\sqrt{10}=\\sqrt{90}\\)。等價寫成 \\(c=-7\\pm3\\sqrt{10}\\)，也可整理為上式。',
      },
      {
        q: '已知圓 \\((x-4)^2+(y-1)^2=10\\)，求斜率為 3 的切線方程式。',
        a: '簡答：\\(y-1=3(x-4)\\pm\\sqrt{100}\\)，即 \\(y=3x-1\\) 或 \\(y=3x-21\\)。過程：斜率為 3 的直線可設 \\(y-1=3(x-4)+b\\)。圓心到此直線的距離為 \\(\\frac{|b|}{\\sqrt{1+3^2}}\\)，需等於半徑 \\(\\sqrt{10}\\)，所以 \\(|b|=10\\)。',
      },
      {
        q: '設直線 \\(y=mx+2\\) 與圓 \\(x^2+y^2=1\\) 相切，求實數 \\(m\\) 之值。',
        a: '簡答：\\(m=\\pm\\sqrt3\\)。過程：直線寫成 \\(mx-y+2=0\\)。圓心 \\((0,0)\\) 到直線距離等於半徑 1，故 \\(\\frac{|2|}{\\sqrt{m^2+1}}=1\\)。解得 \\(m^2=3\\)，所以 \\(m=\\pm\\sqrt3\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123ExternalPointTangentSet(count) {
    const templates = [
      {
        q: '求過圓外點 \\(P(1,1)\\) 且與圓 \\(x^2+(y-3)^2=1\\) 相切的兩條直線方程式。',
        a: '簡答：\\(x=1\\) 或 \\(3x+4y-7=0\\)。過程：一條切線為鉛直線 \\(x=1\\)，它到圓心 \\((0,3)\\) 的距離為 1。另一條設為 \\(y-1=m(x-1)\\)，即 \\(mx-y+1-m=0\\)。距離條件 \\(\\frac{|m\\cdot0-3+1-m|}{\\sqrt{m^2+1}}=1\\)，解得 \\(m=-\\frac34\\)，所以 \\(3x+4y-7=0\\)。',
      },
      {
        q: '自點 \\(P(6,3)\\) 向圓 \\((x-2)^2+(y-3)^2=9\\) 作切線，求其切線長。',
        a: '簡答：\\(\\sqrt7\\)。過程：圓心 \\((2,3)\\)，半徑 3。\\(PC=4\\)，切線長 \\(PT=\\sqrt{PC^2-r^2}=\\sqrt{16-9}=\\sqrt7\\)。',
      },
      {
        q: '求過點 \\(A(4,5)\\) 且與圓 \\((x-3)^2+(y-2)^2=1\\) 相切的切線長。',
        a: '簡答：3。過程：圓心 \\((3,2)\\)，半徑 1。\\(AC=\\sqrt{(4-3)^2+(5-2)^2}=\\sqrt{10}\\)。切線長為 \\(\\sqrt{AC^2-r^2}=\\sqrt{10-1}=3\\)。',
      },
      {
        q: '自點 \\(P(12,3)\\) 向圓 \\(x^2+y^2-4x-6y-12=0\\) 作兩切線，求兩切線的夾角。',
        a: '簡答：\\(60^\\circ\\)。過程：圓配方為 \\((x-2)^2+(y-3)^2=25\\)，圓心 \\((2,3)\\)，半徑 5。\\(PC=10\\)。若兩切線夾角為 \\(\\theta\\)，則 \\(\\sin\\frac{\\theta}{2}=\\frac{r}{PC}=\\frac12\\)，所以 \\(\\frac{\\theta}{2}=30^\\circ\\)，\\(\\theta=60^\\circ\\)。',
      },
      {
        q: '已知點 \\(P(8,1)\\) 作圓 \\(x^2+y^2-2x+4y-7=0\\) 的兩切線，求兩切點連線（極線）的方程式。',
        a: '簡答：\\(7x+3y-13=0\\)。過程：圓為 \\(x^2+y^2+dx+ey+f=0\\)，其中 \\(d=-2,e=4,f=-7\\)。外點 \\((x_0,y_0)=(8,1)\\) 的極線公式為 \\(xx_0+yy_0+\\frac{d(x+x_0)}{2}+\\frac{e(y+y_0)}{2}+f=0\\)。代入得 \\(8x+y-(x+8)+2(y+1)-7=0\\)，整理為 \\(7x+3y-13=0\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123ChordLengthSet(count) {
    const templates = [
      {
        q: '直線 \\(3x-4y=k\\) 與圓 \\(x^2+y^2+4x-6y-12=0\\) 相交之弦長為 6，求 \\(k\\)。',
        a: '簡答：\\(k=2\\) 或 \\(k=-38\\)。過程：圓配方為 \\((x+2)^2+(y-3)^2=25\\)，圓心 \\((-2,3)\\)，半徑 5。弦長 6 表示半弦長為 3，所以圓心到直線距離 \\(d=\\sqrt{5^2-3^2}=4\\)。直線為 \\(3x-4y-k=0\\)，距離 \\(\\frac{|-6-12-k|}{5}=4\\)，得 \\(|k+18|=20\\)，所以 \\(k=2\\) 或 \\(-38\\)。',
      },
      {
        q: '設直線 \\(x-my-m=0\\) 與圓 \\(x^2+y^2-x=0\\) 相交於兩點，若弦長等於直徑，求 \\(m\\)。',
        a: '簡答：\\(m=\\frac12\\)。過程：弦長等於直徑表示直線通過圓心。圓配方為 \\((x-\\frac12)^2+y^2=\\frac14\\)，圓心 \\((\\frac12,0)\\)。代入直線得 \\(\\frac12-m=0\\)，所以 \\(m=\\frac12\\)。',
      },
      {
        q: '求點 \\(A(1,-1)\\) 為中點之圓 \\(x^2+y^2-6x+4y+4=0\\) 的弦所在的直線方程式。',
        a: '簡答：\\(-2x+y+3=0\\)。過程：圓心為 \\((3,-2)\\)。若 \\(A\\) 是弦中點，則圓心到弦的連線垂直於弦，所以弦的法向量可取 \\(\\overrightarrow{CA}=(-2,1)\\)。過 \\(A(1,-1)\\) 得 \\(-2(x-1)+(y+1)=0\\)，整理為 \\(-2x+y+3=0\\)。',
      },
      {
        q: '一圓過 \\(P(4,1)\\)，且圓心在 \\(2x-y=1\\) 上，若在 \\(y\\) 軸之截弦長為 4，求其圓方程式。',
        a: '簡答：\\((x-2)^2+(y-3)^2=8\\)。過程：設圓心為 \\((h,k)\\)，由 \\(2h-k=1\\) 得 \\(k=2h-1\\)。\\(y\\) 軸截弦長為 4，故 \\(r^2-h^2=2^2=4\\)。又圓過 \\((4,1)\\)，所以 \\(r^2=(h-4)^2+(k-1)^2\\)。聯立得 \\(h=2,k=3,r^2=8\\)。',
      },
      {
        q: '圓 \\(x^2+y^2=9\\) 與過點 \\((1,2)\\) 之直線相交，求其弦長之最大值與最小值。',
        a: '簡答：最大值 6，最小值 4。過程：圓心為原點，半徑為 3。過圓內點 \\((1,2)\\) 的所有直線中，通過圓心時弦長最大，為直徑 6；當直線垂直於 \\((1,2)\\) 與圓心連線時，圓心到弦距離最大為 \\(\\sqrt5\\)，弦長最小為 \\(2\\sqrt{9-5}=4\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123ChordMidpointLocusSet(count) {
    const templates = [
      {
        q: '設圓 \\(C:x^2+y^2-6x+4y+4=0\\)，求過點 \\(A(1,-1)\\) 之所有弦的中點軌跡方程式。',
        a: '簡答：\\((x-2)^2+(y+\\frac32)^2=\\frac54\\)。過程：圓心 \\(C(3,-2)\\)。若 \\(M\\) 是過定點 \\(A\\) 的弦中點，則 \\(CM\\perp AM\\)，所以 \\(M\\) 的軌跡是以 \\(CA\\) 為直徑的圓。\\(CA\\) 中點為 \\((2,-\\frac32)\\)，半徑平方為 \\(\\frac{CA^2}{4}=\\frac54\\)。',
      },
      {
        q: '已知圓 \\((x+1)^2+(y-2)^2=16\\)，求過內部定點 \\(A(-2,-1)\\) 之弦中點形成的圖形方程式。',
        a: '簡答：\\((x+\\frac32)^2+(y-\\frac12)^2=\\frac52\\)。過程：圓心為 \\((-1,2)\\)。弦中點 \\(M\\) 滿足 \\(CM\\perp AM\\)，故軌跡為以 \\(CA\\) 為直徑的圓。直徑端點 \\((-1,2),(-2,-1)\\)，得圓心 \\((-\\frac32,\\frac12)\\)，半徑平方 \\(\\frac{10}{4}=\\frac52\\)。',
      },
      {
        q: '若點 \\(A(2,2)\\) 是圓 \\(x^2+y^2-10x-8y-5=0\\) 內部一點，求過 \\(A\\) 點的所有弦中點軌跡。',
        a: '簡答：\\((x-\\frac72)^2+(y-3)^2=\\frac{13}{4}\\)。過程：圓心為 \\((5,4)\\)。弦中點軌跡是以圓心與定點 \\(A\\) 為直徑的圓。其圓心為 \\((\\frac72,3)\\)，半徑平方為 \\(\\frac{(5-2)^2+(4-2)^2}{4}=\\frac{13}{4}\\)。',
      },
      {
        q: '設點 \\(A(3,4)\\) 為圓 \\((x+2)^2+(y-5)^2=49\\) 內部一點，求過 \\(A\\) 點弦中點的圓心與半徑。',
        a: '簡答：圓心 \\((\\frac12,\\frac92)\\)，半徑 \\(\\sqrt{\\frac{13}{2}}\\)。過程：原圓圓心 \\((-2,5)\\)。弦中點軌跡是以 \\((-2,5)\\) 與 \\((3,4)\\) 為直徑的圓，所以圓心為兩點中點 \\((\\frac12,\\frac92)\\)，半徑平方為 \\(\\frac{(5)^2+(-1)^2}{4}=\\frac{13}{2}\\)。',
      },
      {
        q: '求圓 \\(x^2+y^2=9\\) 內，過點 \\((1,2)\\) 之弦中點所成圖形的面積。',
        a: '簡答：\\(\\frac{5\\pi}{4}\\)。過程：原圓圓心為 \\((0,0)\\)。弦中點軌跡是以 \\((0,0)\\) 與 \\((1,2)\\) 為直徑的圓，其半徑平方為 \\(\\frac{1^2+2^2}{4}=\\frac54\\)，所以面積為 \\(\\pi\\cdot\\frac54=\\frac{5\\pi}{4}\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123PerpendicularTangentsLocusSet(count) {
    const templates = [
      {
        q: '圓 \\(C:x^2+y^2-8x+4y-5=0\\)，考慮此圓任意兩條互相垂直的切線之交點形成的圖形方程式。',
        a: '簡答：\\((x-4)^2+(y+2)^2=50\\)。過程：原圓配方為 \\((x-4)^2+(y+2)^2=25\\)，圓心 \\((4,-2)\\)，半徑 5。若從點 \\(P\\) 作兩切線且互相垂直，則 \\(CP=\\sqrt2r=5\\sqrt2\\)。所以交點軌跡為同圓心、半徑 \\(5\\sqrt2\\) 的圓。',
      },
      {
        q: '若圓 \\(x^2+y^2=r^2\\) 的兩條互相垂直的切線交於點 \\(P(x,y)\\)，證明點 \\(P\\) 的軌跡也是一個圓。',
        a: '簡答：\\(x^2+y^2=2r^2\\)。過程：設圓心為 \\(O\\)，切點為 \\(T\\)。由切線性質 \\(OT\\perp PT\\)，且兩切線互相垂直，可得 \\(OP=\\sqrt2r\\)。因此 \\(P\\) 到原點距離固定為 \\(\\sqrt2r\\)，軌跡為 \\(x^2+y^2=2r^2\\)。',
      },
      {
        q: '已知圓 \\((x-1)^2+(y+2)^2=9\\)，求其垂直切線交點軌跡的半徑。',
        a: '簡答：\\(3\\sqrt2\\)。過程：原圓半徑為 3。垂直切線交點到圓心的距離恆為 \\(\\sqrt2r\\)，所以軌跡半徑為 \\(3\\sqrt2\\)。',
      },
      {
        q: '設點 \\(P(a,b)\\) 到圓 \\(x^2+y^2=5\\) 的兩切線互相垂直，求 \\(a^2+b^2\\) 之值。',
        a: '簡答：10。過程：圓心為原點，半徑 \\(\\sqrt5\\)。垂直切線交點到圓心距離為 \\(\\sqrt2r=\\sqrt{10}\\)，所以 \\(a^2+b^2=10\\)。',
      },
      {
        q: '給定圓 \\(x^2+y^2+2x-4y=0\\)，求其垂直切線交點所成圓形圖形的面積。',
        a: '簡答：\\(10\\pi\\)。過程：原圓配方為 \\((x+1)^2+(y-2)^2=5\\)，半徑平方為 5。垂直切線交點軌跡的半徑平方為 \\(2r^2=10\\)，所以面積為 \\(10\\pi\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123RadicalAxisCircleFamilySet(count) {
    const templates = [
      {
        q: '求兩圓 \\(C_1:x^2+y^2+3x+4y+1=0\\) 與 \\(C_2:x^2+y^2+x-3y=0\\) 的公共弦方程式。',
        a: '簡答：\\(2x+7y+1=0\\)。過程：公共弦所在直線即兩圓的根軸。將 \\(C_1-C_2\\)，二次項消去，得 \\((3x-x)+(4y+3y)+1=0\\)，所以公共弦方程式為 \\(2x+7y+1=0\\)。',
      },
      {
        q: '求過圓 \\(x^2+y^2-2x+4y+1=0\\) 與直線 \\(x+2y+2=0\\) 之交點，且過點 \\((2,3)\\) 的圓。',
        a: '簡答：\\(5x^2+5y^2-21x-2y-17=0\\)。過程：設圓系為 \\(x^2+y^2-2x+4y+1+\\lambda(x+2y+2)=0\\)。代入 \\((2,3)\\) 得 \\(22+10\\lambda=0\\)，所以 \\(\\lambda=-\\frac{11}{5}\\)。同乘 5 整理得 \\(5x^2+5y^2-21x-2y-17=0\\)。',
      },
      {
        q: '以兩圓 \\(C_1:x^2+y^2-25=0\\) 與 \\(C_2:x^2+y^2-6x-7=0\\) 之公共弦為直徑，求圓方程式。',
        a: '簡答：\\((x-3)^2+y^2=16\\)。過程：兩圓相減得公共弦 \\(x=3\\)。代入 \\(x^2+y^2=25\\)，得交點 \\((3,4),(3,-4)\\)。以公共弦為直徑，圓心為 \\((3,0)\\)，半徑 4，所以方程式為 \\((x-3)^2+y^2=16\\)。',
      },
      {
        q: '設圓 \\(C_1:x^2+y^2+ax+7y-1=0\\) 與 \\(C_2:x^2+y^2+2x+by-5=0\\) 相交於兩點，且其公共弦為 \\(x-2y=2\\)，求 \\(a,b\\) 之值。',
        a: '簡答：\\(a=0,\\ b=3\\)。過程：兩圓相減得根軸 \\((a-2)x+(7-b)y+4=0\\)。它要與 \\(x-2y-2=0\\) 同一直線，故存在比例常數 \\(\\lambda\\)，使 \\(a-2=\\lambda\\)、\\(7-b=-2\\lambda\\)、\\(4=-2\\lambda\\)。得 \\(\\lambda=-2\\)，所以 \\(a=0,b=3\\)。',
      },
      {
        q: '求過圓 \\(x^2+y^2+2x-4y+1=0\\) 與直線 \\(2x-y+4=0\\) 之交點，且過點 \\((1,2)\\) 的圓。',
        a: '簡答：\\(3x^2+3y^2+10x-14y+11=0\\)。過程：設圓系為 \\(x^2+y^2+2x-4y+1+\\lambda(2x-y+4)=0\\)。代入 \\((1,2)\\) 得 \\(-2+3\\lambda=0\\)，所以 \\(\\lambda=\\frac23\\)。代回並同乘 3，整理得 \\(3x^2+3y^2+10x-14y+11=0\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123PolarLineSet(count) {
    const templates = [
      {
        q: '自圓外點 \\(P(8,1)\\) 作圓 \\(x^2+y^2-2x+4y-7=0\\) 的切線，求兩切點連線（極線）的方程式。',
        a: '簡答：\\(7x+3y-13=0\\)。過程：對圓 \\(x^2+y^2+dx+ey+f=0\\)，外點 \\((x_0,y_0)\\) 的極線為 \\(xx_0+yy_0+\\frac{d(x+x_0)}2+\\frac{e(y+y_0)}2+f=0\\)。代入 \\(d=-2,e=4,f=-7,(x_0,y_0)=(8,1)\\)，得 \\(8x+y-(x+8)+2(y+1)-7=0\\)，整理為 \\(7x+3y-13=0\\)。',
      },
      {
        q: '已知圓 \\(C:x^2+y^2=5\\)，求點 \\(P(3,-1)\\) 對於該圓的極線（切點弦）方程式。',
        a: '簡答：\\(3x-y=5\\)。過程：對圓 \\(x^2+y^2=r^2\\)，點 \\((x_0,y_0)\\) 的極線為 \\(xx_0+yy_0=r^2\\)。代入 \\((3,-1)\\) 與 \\(r^2=5\\)，得 \\(3x-y=5\\)。',
      },
      {
        q: '若自點 \\(P\\) 向圓 \\(x^2+y^2+4x-6y+1=0\\) 作兩切線，其切點弦方程式為 \\(3x-5y+9=0\\)，求 \\(P\\) 點坐標。',
        a: '簡答：\\((1,-2)\\)。過程：設 \\(P(x_0,y_0)\\)。極線公式給出 \\((x_0+2)x+(y_0-3)y+(2x_0-3y_0+1)=0\\)。與 \\(3x-5y+9=0\\) 比較係數，可得比例為 1，所以 \\(x_0+2=3\\)、\\(y_0-3=-5\\)，解得 \\(P(1,-2)\\)。',
      },
      {
        q: '自 \\(P(5,3)\\) 向圓 \\((x-1)^2+(y-2)^2=5\\) 作兩切線，切點分別為 \\(M,N\\)，求直線 \\(MN\\) 的方程式。',
        a: '簡答：\\(4x+y-11=0\\)。過程：圓心為 \\((1,2)\\)，半徑平方為 5。切點弦極線公式為 \\((x_0-h)(x-h)+(y_0-k)(y-k)=r^2\\)。代入 \\(P(5,3)\\)，得 \\(4(x-1)+1(y-2)=5\\)，整理為 \\(4x+y-11=0\\)。',
      },
      {
        q: '若點 \\(P(x_0,y_0)\\) 在圓外，求其對應圓 \\(x^2+y^2+dx+ey+f=0\\) 的極線公式。',
        a: '簡答：\\(xx_0+yy_0+\\frac{d(x+x_0)}2+\\frac{e(y+y_0)}2+f=0\\)。過程：把圓的一般式視為兩切點共同滿足的方程，利用切點弦的對稱替換規則 \\(x^2\\to xx_0\\)、\\(y^2\\to yy_0\\)、\\(x\\to\\frac{x+x_0}{2}\\)、\\(y\\to\\frac{y+y_0}{2}\\)，即可得到極線公式。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123LightShadowProjectionSet(count) {
    const templates = [
      {
        q: '在 \\((7,8)\\) 處有一光源，將圓 \\(C:x^2+y^2-4x-6y+12=0\\) 投射到 \\(x\\) 軸上的影長為何？',
        a: '簡答：\\(\\frac{14}{3}\\)。過程：圓配方為 \\((x-2)^2+(y-3)^2=1\\)。設過光源 \\((7,8)\\) 的切線斜率為 \\(m\\)，距離條件得 \\(m=\\frac43\\) 或 \\(\\frac34\\)。兩切線與 \\(x\\) 軸交點的 \\(x\\) 坐標分別為 1 與 \\(-\\frac{11}{3}\\)，所以影長為 \\(1-(-\\frac{11}{3})=\\frac{14}{3}\\)。',
      },
      {
        q: '坐標平面上 \\((7,5)\\) 處有一光源，將圓 \\(x^2+(y-1)^2=1\\) 投射在 \\(y=0\\) 上，求陰影長度。',
        a: '簡答：\\(\\frac{16}{3}\\)。過程：圓心 \\((0,1)\\)，半徑 1。過 \\((7,5)\\) 的兩切線斜率由距離條件可得 \\(m=\\frac34\\) 或 \\(\\frac{5}{12}\\)。與 \\(y=0\\) 交於 \\((\\frac13,0)\\)、\\((-5,0)\\)，所以影長為 \\(\\frac13-(-5)=\\frac{16}{3}\\)。',
      },
      {
        q: '點 \\(P(-2,h)\\) 處有一光源，圓 \\(x^2+y^2=1\\)（\\(y\\geq0\\)）為障礙物，若影長需覆蓋到 \\(Q(2,0)\\)，求 \\(h\\) 最小值。',
        a: '簡答：\\(\\frac{4\\sqrt3}{3}\\)。過程：要剛好覆蓋到 \\(Q(2,0)\\)，直線 \\(PQ\\) 必為半圓的切線。其方程可寫成 \\(hx+4y-2h=0\\)。圓心到此線距離需為 1，故 \\(\\frac{2h}{\\sqrt{h^2+16}}=1\\)，解得 \\(h=\\frac{4\\sqrt3}{3}\\)。',
      },
      {
        q: '設光源在 \\((7,5)\\)，將圓 \\(x^2+(y-1)^2=1\\) 投射到 \\(x\\) 軸的影長。',
        a: '簡答：\\(\\frac{16}{3}\\)。過程：此題與投射到 \\(y=0\\) 相同。圓心 \\((0,1)\\)，半徑 1。兩條切線與 \\(x\\) 軸交於 \\((\\frac13,0)\\) 與 \\((-5,0)\\)，所以影長為 \\(\\frac{16}{3}\\)。',
      },
      {
        q: '已知一半徑為 60 的圓形城堡，光源在正北方 100 單位處，求在 \\(x\\) 軸上產生的陰影寬度。',
        a: '簡答：150。過程：設城堡為 \\(x^2+y^2=60^2\\)，光源在 \\((0,100)\\)。兩切線對稱，設右側切線與 \\(x\\) 軸交於 \\((a,0)\\)。直線過 \\((0,100),(a,0)\\)，到原點距離為半徑 60，可得 \\(\\frac{100a}{\\sqrt{a^2+10000}}=60\\)，解得 \\(a=75\\)。左右對稱，所以陰影寬度為 \\(2a=150\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      questions.push(templates[i % templates.length].q);
      answers.push(templates[i % templates.length].a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123LineCircleParameterRelationSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const r = randInt(1, 4);
        const bound = formatRadical(2 * r * r);
        questions.push(
          `討論直線 \\(x-y+k=0\\) 與圓 \\(x^2+y^2=${r * r}\\) 的相交情形，並用 \\(k\\) 表示相交於 0、1、2 點的範圍。`
        );
        answers.push(
          `簡答：\\(|k|<${bound}\\) 時交於 2 點；\\(|k|=${bound}\\) 時相切；\\(|k|>${bound}\\) 時無交點。過程：圓心為 \\((0,0)\\)，半徑為 ${r}。圓心到直線距離 \\(d=\\frac{|k|}{\\sqrt{2}}\\)。比較 \\(d\\) 與半徑 ${r}，即得上述三種情形。`
        );
        continue;
      }

      if (type === 1) {
        const mAbs = [3, 4, 5][randInt(0, 2)];
        const cRadicand = mAbs * mAbs + 1;
        const cText = formatRadical(cRadicand);
        questions.push(`若直線 \\(kx-y+${cText}=0\\) 與圓 \\(x^2+y^2=1\\) 相切，求 \\(k\\) 的值。`);
        answers.push(
          `簡答：\\(k=${mAbs}\\) 或 \\(k=-${mAbs}\\)。過程：圓心 \\((0,0)\\) 到直線距離需等於半徑 1，所以 \\(\\frac{${cText}}{\\sqrt{k^2+1}}=1\\)。平方後得 \\(k^2+1=${cRadicand}\\)，因此 \\(k^2=${mAbs * mAbs}\\)，故 \\(k=\\pm${mAbs}\\)。`
        );
        continue;
      }

      if (type === 2) {
        const b = [2, 3, 4][randInt(0, 2)];
        const threshold = b * b - 1;
        questions.push(`若直線 \\(y=mx+${b}\\) 與圓 \\(x^2+y^2=1\\) 相交於相異兩點，求 \\(m\\) 的範圍。`);
        answers.push(
          `簡答：\\(m<-${formatRadical(threshold)}\\) 或 \\(m>${formatRadical(threshold)}\\)。過程：圓心到直線 \\(mx-y+${b}=0\\) 的距離為 \\(\\frac{|${b}|}{\\sqrt{m^2+1}}\\)。相異兩點表示距離小於半徑 1，因此 \\(\\frac{${b * b}}{m^2+1}<1\\)，得 \\(m^2>${threshold}\\)。`
        );
        continue;
      }

      if (type === 3) {
        const h = randInt(-3, 4);
        const k0 = randInt(-3, 4);
        const r = randInt(1, 4);
        const base = 3 * h + 4 * k0;
        questions.push(
          `若直線 \\(3x+4y=t\\) 與圓 \\(${formatS122CircleStandard(h, k0, r * r)}\\) 無交點，求 \\(t\\) 的範圍。`
        );
        answers.push(
          `簡答：\\(t<${base - 5 * r}\\) 或 \\(t>${base + 5 * r}\\)。過程：圓心為 \\(${formatS122Point({ x: h, y: k0 })}\\)，半徑為 ${r}。圓心到直線距離為 \\(\\frac{|3\\cdot(${h})+4\\cdot(${k0})-t|}{5}=\\frac{|${base}-t|}{5}\\)。無交點表示此距離大於 ${r}，所以 \\(|${base}-t|>${5 * r}\\)。`
        );
        continue;
      }

      const h = randInt(-3, 3);
      const k0 = randInt(-3, 3);
      const r = randInt(2, 5);
      const base = 3 * h + 4 * k0;
      const modes = [
        { offset: 0, relation: '相交於 2 點', reason: `小於半徑 ${r}` },
        { offset: 5 * r, relation: '相切', reason: `等於半徑 ${r}` },
        { offset: 5 * r + 5, relation: '無交點', reason: `大於半徑 ${r}` },
      ];
      const pick = modes[randInt(0, modes.length - 1)];
      const t = base + pick.offset;
      const tMoveText = t >= 0 ? `-${t}` : `+${-t}`;
      questions.push(`判斷圓 \\(${formatS122CircleStandard(h, k0, r * r)}\\) 與直線 \\(3x+4y=${t}\\) 的位置關係。`);
      answers.push(
        `簡答：${pick.relation}。過程：圓心為 \\(${formatS122Point({ x: h, y: k0 })}\\)，半徑 ${r}。圓心到直線距離為 \\(\\frac{|3\\cdot(${h})+4\\cdot(${k0})${tMoveText}|}{5}=\\frac{${Math.abs(base - t)}}{5}=${Math.abs(base - t) / 5}\\)，${pick.reason}，所以位置關係為${pick.relation}。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123PointPowerTangentChordSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const triples = [
          { p: 13, r: 5, len: 12 },
          { p: 10, r: 6, len: 8 },
          { p: 25, r: 7, len: 24 },
        ];
        const pick = triples[randInt(0, triples.length - 1)];
        questions.push(`已知點 \\(P(${pick.p},0)\\) 到圓 \\(x^2+y^2=${pick.r * pick.r}\\) 作切線，求切線長。`);
        answers.push(
          `簡答：${pick.len}。過程：點 \\(P\\) 到圓心距離為 ${pick.p}，半徑為 ${pick.r}。切線長平方為 \\(OP^2-r^2=${pick.p * pick.p}-${pick.r * pick.r}=${pick.len * pick.len}\\)，所以切線長為 ${pick.len}。`
        );
        continue;
      }

      if (type === 1) {
        questions.push(`已知點 \\(P(a,2a)\\) 在圓 \\(x^2+y^2-2x=0\\) 的內部，求 \\(a\\) 的範圍。`);
        answers.push(
          `簡答：\\(0<a<\\frac25\\)。過程：點在圓內表示代入圓方程式後小於 0。代入 \\((a,2a)\\)，得 \\(a^2+(2a)^2-2a=5a^2-2a<0\\)。分解為 \\(a(5a-2)<0\\)，所以 \\(0<a<\\frac25\\)。`
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
        questions.push(
          `設 \\(A(1,1)\\)，任一直線過 \\(A\\) 且與圓 \\(x^2+y^2-2x+6y+1=0\\) 交於兩點 \\(P,Q\\)。求 \\(AP\\cdot AQ\\) 的值。`
        );
        answers.push(
          `簡答：7。過程：由點冪定理，\\(AP\\cdot AQ\\) 等於點 \\(A\\) 對圓的冪。代入 \\((1,1)\\) 得 \\(1^2+1^2-2\\cdot1+6\\cdot1+1=7\\)，所以 \\(AP\\cdot AQ=7\\)。`
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123VerticalTangentTrapSet(count) {
    const questions = [];
    const answers = [];
    const cases = [
      { h: 0, k: 3, r: 1, t: -2, side: 1 },
      { h: -1, k: 0, r: 2, t: 4, side: -1 },
      { h: 3, k: -2, r: 2, t: 6, side: 1 },
      { h: -2, k: 1, r: 3, t: 6, side: -1 },
      { h: 2, k: 4, r: 1, t: -3, side: 1 },
    ];

    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const px = item.h + item.side * item.r;
      const py = item.k + item.t;
      const rawNum = item.side * (item.t * item.t - item.r * item.r);
      const rawDen = 2 * item.r * item.t;
      const frac = reduceFraction(rawNum, rawDen);
      const line = formatS123LineEquation(
        frac.numerator,
        -frac.denominator,
        frac.denominator * py - frac.numerator * px
      );
      const vertical = `x=${px}`;
      const slopeText = formatFraction(rawNum, rawDen);
      questions.push(
        `求過圓外點 \\(P${formatS122Point({ x: px, y: py })}\\) 且與圓 \\(${formatS122CircleStandard(item.h, item.k, item.r * item.r)}\\) 相切的兩條直線方程式。`
      );
      answers.push(
        `簡答：\\(${vertical}\\) 或 \\(${line}\\)。過程：因為 \\(P\\) 的 \\(x\\) 坐標正好是圓心 \\(x\\) 坐標加上半徑或減去半徑，所以一條切線是鉛直線 \\(${vertical}\\)。另一條不可用鉛直線表示，設為 \\(y-${wrapIfNegative(py)}=m(x-${wrapIfNegative(px)})\\)。由圓心到直線距離等於半徑 ${item.r}，可得 \\(m=${slopeText}\\)，整理為 \\(${line}\\)。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123IntegerDistanceCountingSet(count) {
    const questions = [];
    const answers = [];
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
          const c = randInt(6, 10);
          const r = randInt(2, 4);
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
          const c = 9 + randInt(0, 2);
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
          const c = randInt(7, 10);
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
          const c = randInt(7, 11);
          const r = randInt(2, 4);
          const distance = c;
          return {
            question: `圓 \\((x-${c})^2+y^2=${r * r}\\) 上，到原點距離等於 ${distance} 的點共有幾個？`,
            answer: `簡答：2 個。過程：原點到圓上點的距離範圍為 \\(${c - r}\\leq OP\\leq${c + r}\\)。因為 ${distance} 在兩端之間，不是最短或最遠距離，所以與以原點為圓心、半徑 ${distance} 的圓相交於 2 點。`,
          };
        },
      },
      {
        q: () => {
          const c = randInt(6, 9);
          const r = randInt(2, 4);
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123CommonChordDiameterCircleSet(count) {
    const questions = [];
    const answers = [];
    const cases = [
      { r: 5, a: 3, d: -10 },
      { r: 10, a: 6, d: -8 },
      { r: 13, a: 5, d: -12 },
      { r: 8, a: -4, d: 6 },
      { r: 15, a: -9, d: 10 },
    ];

    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const r2 = item.r * item.r;
      const newR2 = r2 - item.a * item.a;
      const f = -item.d * item.a - r2;
      const c2 = formatS122CircleGeneral(1, item.d, 0, f);
      questions.push(`以兩圓 \\(C_1:x^2+y^2=${r2}\\) 與 \\(C_2:${c2}\\) 的公共弦為直徑，求此新圓的方程式。`);
      answers.push(
        `簡答：\\(${formatS122CircleStandard(item.a, 0, newR2)}\\)。過程：將 \\(C_2-C_1\\) 消去二次項，得 \\(${item.d}x${f + r2 >= 0 ? '+' : ''}${f + r2}=0\\)，所以公共弦為 \\(x=${item.a}\\)。代回 \\(x^2+y^2=${r2}\\)，得交點的 \\(y^2=${newR2}\\)。以此公共弦為直徑時，圓心為 \\((${item.a},0)\\)，半徑平方為 ${newR2}，故方程式為 \\(${formatS122CircleStandard(item.a, 0, newR2)}\\)。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS123CircleAreaExtremaSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;
      if (type === 0) {
        const point = [
          { x: 3, y: -4, len: 5 },
          { x: 5, y: 12, len: 13 },
          { x: 8, y: -15, len: 17 },
        ][randInt(0, 2)];
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
        const r = [2, 4, 6][randInt(0, 2)];
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
          { a: 3, b: -4, r: 2 },
          { a: 5, b: 12, r: 1 },
          { a: 8, b: -6, r: 3 },
        ];
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }
  // ── s1-2-1 新增：兩直線角平分線方程式 ──────────────────────────────
  function buildS121AngleBisectorLinesSet(count) {
    const questions = [];
    const answers = [];

    function fmtL(a, b, c) {
      const xp = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
      const yp = b === 0 ? '' : b === 1 ? '+y' : b === -1 ? '-y' : b > 0 ? `+${b}y` : `${b}y`;
      return `${xp}${yp}=${c}`;
    }
    function sm(v) { return v >= 0 ? `-${v}` : `+${-v}`; }

    const modes = [
      {
        a1:3,b1:4,a2:4,b2:-3,norm:5,
        getBis(d1,d2){ return [`x-7y=${d2-d1}`, `7x+y=${d1+d2}`]; },
        getProc(d1,d2){
          return `法向量 \\((3,4)\\) 與 \\((4,-3)\\) 模均為 5。`+
            `由 \\(3x+4y${sm(d1)}=\\pm(4x-3y${sm(d2)})\\)，`+
            `取正號得 \\(x-7y=${d2-d1}\\)；取負號得 \\(7x+y=${d1+d2}\\)。`;
        }
      },
      {
        a1:4,b1:3,a2:3,b2:-4,norm:5,
        getBis(d1,d2){ return [`x+7y=${d1-d2}`, `7x-y=${d1+d2}`]; },
        getProc(d1,d2){
          return `法向量 \\((4,3)\\) 與 \\((3,-4)\\) 模均為 5。`+
            `由 \\(4x+3y${sm(d1)}=\\pm(3x-4y${sm(d2)})\\)，`+
            `取正號得 \\(x+7y=${d1-d2}\\)；取負號得 \\(7x-y=${d1+d2}\\)。`;
        }
      },
      {
        a1:5,b1:12,a2:12,b2:-5,norm:13,
        getBis(d1,d2){ return [`7x-17y=${d2-d1}`, `17x+7y=${d1+d2}`]; },
        getProc(d1,d2){
          return `法向量 \\((5,12)\\) 與 \\((12,-5)\\) 模均為 13。`+
            `由 \\(5x+12y${sm(d1)}=\\pm(12x-5y${sm(d2)})\\)，`+
            `取正號得 \\(7x-17y=${d2-d1}\\)；取負號得 \\(17x+7y=${d1+d2}\\)。`;
        }
      },
      {
        a1:3,b1:4,a2:-4,b2:3,norm:5,
        getBis(d1,d2){ return [`7x+y=${d1-d2}`, `x-7y=${-(d1+d2)}`]; },
        getProc(d1,d2){
          return `法向量 \\((3,4)\\) 與 \\((-4,3)\\) 模均為 5。`+
            `由 \\(3x+4y${sm(d1)}=\\pm(-4x+3y${sm(d2)})\\)，`+
            `取正號得 \\(7x+y=${d1-d2}\\)；取負號得 \\(x-7y=${-(d1+d2)}\\)。`;
        }
      },
      {
        a1:8,b1:15,a2:15,b2:-8,norm:17,
        getBis(d1,d2){ return [`7x-23y=${d2-d1}`, `23x+7y=${d1+d2}`]; },
        getProc(d1,d2){
          return `法向量 \\((8,15)\\) 與 \\((15,-8)\\) 模均為 17。`+
            `由 \\(8x+15y${sm(d1)}=\\pm(15x-8y${sm(d2)})\\)，`+
            `取正號得 \\(7x-23y=${d2-d1}\\)；取負號得 \\(23x+7y=${d1+d2}\\)。`;
        }
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  // ── s1-2-2 新增：點與圓的位置關係及切線長 ──────────────────────────
  function buildS122PointCircleRelationSet(count) {
    const questions = [];
    const answers = [];

    const off5  = [[3,4],[4,3],[-3,4],[4,-3],[3,-4],[-4,3]];
    const off13 = [[5,12],[12,5],[-5,12],[12,-5],[5,-12],[-12,5]];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const h = randInt(-4, 4);
      const k = randInt(-4, 4);

      if (mode === 0) {
        // 圓外 d=5 r=3 切線=4
        const [dx, dy] = off5[randInt(0, off5.length - 1)];
        const px = h + dx, py = k + dy;
        const circ = formatS122CircleStandard(h, k, 9);
        questions.push(`判斷點 \\(P(${px},\\,${py})\\) 與圓 \\(${circ}\\) 的位置關係，若在圓外則求切線長。`);
        answers.push(
          `簡答：\\(P\\) 在圓外，切線長為 4。` +
          `過程：圓心 \\((${h},${k})\\)，半徑 \\(r=3\\)。` +
          `\\(d^2=${wrapIfNegative(dx)}^2+${wrapIfNegative(dy)}^2=${dx*dx+dy*dy}\\)，` +
          `\\(d=5>3\\)，故 \\(P\\) 在圓外。切線長 \\(=\\sqrt{25-9}=4\\)。`
        );
      } else if (mode === 1) {
        // 圓外 d=5 r=4 切線=3
        const [dx, dy] = off5[randInt(0, off5.length - 1)];
        const px = h + dx, py = k + dy;
        const circ = formatS122CircleStandard(h, k, 16);
        questions.push(`判斷點 \\(P(${px},\\,${py})\\) 與圓 \\(${circ}\\) 的位置關係，若在圓外則求切線長。`);
        answers.push(
          `簡答：\\(P\\) 在圓外，切線長為 3。` +
          `過程：圓心 \\((${h},${k})\\)，半徑 \\(r=4\\)。` +
          `\\(d^2=${wrapIfNegative(dx)}^2+${wrapIfNegative(dy)}^2=${dx*dx+dy*dy}\\)，` +
          `\\(d=5>4\\)，故 \\(P\\) 在圓外。切線長 \\(=\\sqrt{25-16}=3\\)。`
        );
      } else if (mode === 2) {
        // 圓外 d=13 r=5 切線=12
        const [dx, dy] = off13[randInt(0, off13.length - 1)];
        const px = h + dx, py = k + dy;
        const circ = formatS122CircleStandard(h, k, 25);
        questions.push(`判斷點 \\(P(${px},\\,${py})\\) 與圓 \\(${circ}\\) 的位置關係，若在圓外則求切線長。`);
        answers.push(
          `簡答：\\(P\\) 在圓外，切線長為 12。` +
          `過程：圓心 \\((${h},${k})\\)，半徑 \\(r=5\\)。` +
          `\\(d^2=${wrapIfNegative(dx)}^2+${wrapIfNegative(dy)}^2=${dx*dx+dy*dy}\\)，` +
          `\\(d=13>5\\)，故 \\(P\\) 在圓外。切線長 \\(=\\sqrt{169-25}=12\\)。`
        );
      } else if (mode === 3) {
        // 在圓上 d=r=5
        const [dx, dy] = off5[randInt(0, off5.length - 1)];
        const px = h + dx, py = k + dy;
        const circ = formatS122CircleStandard(h, k, 25);
        questions.push(`判斷點 \\(P(${px},\\,${py})\\) 與圓 \\(${circ}\\) 的位置關係。`);
        answers.push(
          `簡答：\\(P\\) 在圓上。` +
          `過程：圓心 \\((${h},${k})\\)，半徑 \\(r=5\\)。` +
          `\\(d^2=${wrapIfNegative(dx)}^2+${wrapIfNegative(dy)}^2=${dx*dx+dy*dy}=25=r^2\\)，故 \\(P\\) 在圓上。`
        );
      } else {
        // 在圓內 d<5
        const smalls = [[3,0],[0,3],[4,0],[0,4],[2,2],[1,3],[3,1]];
        const [ax, ay] = smalls[randInt(0, smalls.length - 1)];
        const sx = randInt(0,1)===0?1:-1, sy = randInt(0,1)===0?1:-1;
        const dx = ax*sx, dy = ay*sy;
        const d2 = dx*dx+dy*dy;
        const px = h + dx, py = k + dy;
        const circ = formatS122CircleStandard(h, k, 25);
        questions.push(`判斷點 \\(P(${px},\\,${py})\\) 與圓 \\(${circ}\\) 的位置關係。`);
        answers.push(
          `簡答：\\(P\\) 在圓內。` +
          `過程：圓心 \\((${h},${k})\\)，半徑 \\(r=5\\)。` +
          `\\(d^2=${wrapIfNegative(dx)}^2+${wrapIfNegative(dy)}^2=${d2}<25=r^2\\)，故 \\(P\\) 在圓內，無切線。`
        );
      }
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  // ── s1-2-3 新增：直線與圓的交點坐標 ────────────────────────────────
  function buildS123LineCirIntersectionSet(count) {
    const questions = [];
    const answers = [];

    function signC(c) { return c >= 0 ? `+${c}` : `${c}`; }
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
        const cases = [{r:5,k:3,xv:4},{r:5,k:4,xv:3},{r:13,k:5,xv:12},{r:13,k:12,xv:5},{r:10,k:6,xv:8}];
        const {r,k,xv} = cases[randInt(0,cases.length-1)];
        const kv = (randInt(0,1)===0?1:-1)*k;
        questions.push(`求直線 \\(y=${kv}\\) 與圓 \\(x^2+y^2=${r*r}\\) 的交點坐標。`);
        answers.push(
          `簡答：\\((${xv},${kv})\\) 與 \\((-${xv},${kv})\\)。` +
          `過程：代入 \\(y=${kv}\\) 得 \\(x^2+${kv*kv}=${r*r}\\)，` +
          `\\(x^2=${r*r-kv*kv}\\)，\\(x=\\pm${xv}\\)。`
        );
      } else if (mode === 1) {
        // 垂直線 x=h 與 x^2+y^2=r^2
        const cases = [{r:5,h:3,yv:4},{r:5,h:4,yv:3},{r:13,h:5,yv:12},{r:13,h:12,yv:5}];
        const {r,h,yv} = cases[randInt(0,cases.length-1)];
        const hv = (randInt(0,1)===0?1:-1)*h;
        questions.push(`求直線 \\(x=${hv}\\) 與圓 \\(x^2+y^2=${r*r}\\) 的交點坐標。`);
        answers.push(
          `簡答：\\((${hv},${yv})\\) 與 \\((${hv},-${yv})\\)。` +
          `過程：代入 \\(x=${hv}\\) 得 \\(${hv*hv}+y^2=${r*r}\\)，` +
          `\\(y^2=${r*r-hv*hv}\\)，\\(y=\\pm${yv}\\)。`
        );
      } else if (mode === 2) {
        // y=x+c 與 x^2+y^2=25，2x^2+2cx+(c^2-25)=0
        const cases = [
          {c:1,  P:{x:3,y:4},  Q:{x:-4,y:-3}},
          {c:-1, P:{x:4,y:3},  Q:{x:-3,y:-4}},
          {c:7,  P:{x:-3,y:4}, Q:{x:-4,y:3}},
          {c:-7, P:{x:3,y:-4}, Q:{x:4,y:-3}},
        ];
        const cas = cases[randInt(0,cases.length-1)];
        const cStr = cas.c === 0 ? 'x' : cas.c > 0 ? `x+${cas.c}` : `x${cas.c}`;
        const P = cas.P, Q = cas.Q;
        const coefX = 2*cas.c, constT = cas.c*cas.c - 25;
        questions.push(`求直線 \\(y=${cStr}\\) 與圓 \\(x^2+y^2=25\\) 的交點坐標。`);
        answers.push(
          `簡答：\\((${P.x},${P.y})\\) 與 \\((${Q.x},${Q.y})\\)。` +
          `過程：代入得 \\(2x^2${signC(coefX)}x${signC(constT)}=0\\)，` +
          `化簡解得 \\(x=${P.x}\\) 或 \\(x=${Q.x}\\)，` +
          `對應 y 值由 \\(y=x+${cas.c}\\) 求出，交點為 \\((${P.x},${P.y})\\) 與 \\((${Q.x},${Q.y})\\)。`
        );
      } else if (mode === 3) {
        // y=-x+c 與 x^2+y^2=25，2x^2-2cx+(c^2-25)=0
        const cases = [
          {c:1,  P:{x:4,y:-3}, Q:{x:-3,y:4}},
          {c:-1, P:{x:-4,y:3}, Q:{x:3,y:-4}},
          {c:5,  P:{x:0,y:5},  Q:{x:5,y:0}},
          {c:7,  P:{x:3,y:4},  Q:{x:4,y:3}},
          {c:-7, P:{x:-3,y:-4},Q:{x:-4,y:-3}},
        ];
        const cas = cases[randInt(0,cases.length-1)];
        const cStr = cas.c === 0 ? '-x' : cas.c > 0 ? `-x+${cas.c}` : `-x${cas.c}`;
        const P = cas.P, Q = cas.Q;
        const coefX = -2*cas.c, constT = cas.c*cas.c - 25;
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
        const deltaCases = [[3,4],[4,3],[0,5]];
        const [dk, xHalf] = deltaCases[randInt(0, deltaCases.length - 1)];
        const signDk = randInt(0,1)===0?1:-1;
        const k = k0 + signDk * dk;
        const diff = 25 - dk*dk;
        const x1 = h0 + xHalf, x2 = h0 - xHalf;
        const circEq = formatS122CircleStandard(h0, k0, 25);
        const xsolve = xSolveTerm(h0);
        questions.push(`求直線 \\(y=${k}\\) 與圓 \\(${circEq}\\) 的交點坐標。`);
        if (xHalf === 0) {
          questions[questions.length-1] = `求直線 \\(y=${k}\\) 與圓 \\(${circEq}\\) 的切點坐標（若為切線）。`;
          answers.push(`簡答：切點 \\((${h0},${k})\\)。過程：代入得 \\(${xSqTerm(h0)}=0\\)，\\(x=${h0}\\)。`);
        } else {
          answers.push(
            `簡答：\\((${x1},${k})\\) 與 \\((${x2},${k})\\)。` +
            `過程：代入 \\(y=${k}\\) 得 \\(${xSqTerm(h0)}+${dk*dk}=25\\)，` +
            `\\(${xSqTerm(h0)}=${diff}\\)，\\(${xsolve}=\\pm${xHalf}\\)，` +
            `交點為 \\((${x1},${k})\\) 與 \\((${x2},${k})\\)。`
          );
        }
      }
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }


  function buildS131CoefficientSumParitySet(count) {
    const questions = [];
    const answers = [];

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
        questions.push(
          `設 \\(f(x)=(${formatPolynomialFromCoeffs([1, a, b])})^{${n}}\\)，求 \\(f(x)\\) 展開式中所有項的係數總和。`
        );
        answers.push(
          `簡答：${Math.pow(value, n)}。過程：多項式所有項的係數總和等於 \\(f(1)\\)。所以 \\(f(1)=(1${a >= 0 ? '+' : ''}${a}${b >= 0 ? '+' : ''}${b})^{${n}}=${value}^{${n}}=${Math.pow(value, n)}\\)。`
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
          `簡答：${even}。過程：所有係數和為 \\(f(1)=${total}\\)，偶次項係數和為 \\(\\frac{f(1)+f(-1)}{2}\\)。又 \\(f(-1)=(-1+${a}-${b}+${c})^{${n}}=${alt}\\)，所以偶次項係數和為 \\(\\frac{${total}+${alt}}{2}=${even}\\)。`
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
          `簡答：${odd}。過程：奇次項係數和為 \\(\\frac{f(1)-f(-1)}{2}\\)。此題 \\(f(1)=${total}\\)，\\(f(-1)=${alt}\\)，所以奇次項係數和為 \\(\\frac{${total}-(${alt})}{2}=${odd}\\)。`
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131DifferenceReversePolynomialSet(count) {
    const questions = [];
    const answers = [];

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131PolynomialIdentityParameterSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '若 \\((a+b)x^3+(1-a)x^2+(a-b)x+2b+3\\) 為一次式，求數對 \\((a,b)\\)。',
        a: '簡答：\\((a,b)=(1,-1)\\)。過程：一次式表示三次項與二次項係數皆為 0，所以 \\(a+b=0\\)、\\(1-a=0\\)。解得 \\(a=1,b=-1\\)。此時一次項係數 \\(a-b=2\\)，確實不是 0。',
      },
      {
        q: '設 \\(f(x)=a(x-1)(x-2)+b(x-2)+c\\) 與 \\(g(x)=2x^2-3x+5\\) 恆相等，求 \\(a,b,c\\)。',
        a: '簡答：\\(a=2,b=3,c=7\\)。過程：展開得 \\(f(x)=ax^2+(-3a+b)x+(2a-2b+c)\\)。與 \\(2x^2-3x+5\\) 比較係數，得 \\(a=2\\)、\\(-3a+b=-3\\)，所以 \\(b=3\\)；再由 \\(2a-2b+c=5\\)，得 \\(c=7\\)。',
      },
      {
        q: '若 \\((a-2)x^3+(b-c+1)x^2+(2c-1)x+d+2\\) 對任意實數 \\(x\\) 代入後皆為 6，求 \\(a,b,c,d\\)。',
        a: '簡答：\\(a=2,b=-\\frac{1}{2},c=\\frac{1}{2},d=4\\)。過程：恆為常數 6，表示 \\(x^3,x^2,x\\) 係數都為 0，常數項為 6。故 \\(a-2=0\\)、\\(2c-1=0\\)、\\(b-c+1=0\\)、\\(d+2=6\\)，解得答案。',
      },
      {
        q: '設 \\(f(x)=(a+3)x^3+(b-2)x^2+(3c+4)x+d\\)。若 \\(f(1)=1,f(2)=2,f(3)=3,f(4)=4\\)，求 \\(a,b,c,d\\)。',
        a: '簡答：\\(a=-3,b=2,c=-1,d=0\\)。過程：條件表示 \\(f(x)-x\\) 這個三次以下多項式有 \\(1,2,3,4\\) 四個根，所以 \\(f(x)-x\\equiv0\\)，即 \\(f(x)=x\\)。比較係數得 \\(a+3=0,b-2=0,3c+4=1,d=0\\)。',
      },
      {
        q: '已知 \\(\\frac{2x^2+hx+k}{x^2+x-2}\\) 之值恆為定值 \\(t\\)，求 \\(h,k,t\\)。',
        a: '簡答：\\(h=2,k=-4,t=2\\)。過程：分式值恆為定值表示分子恆等於 \\(t(x^2+x-2)\\)。比較二次項得 \\(t=2\\)，所以分子應為 \\(2x^2+2x-4\\)，故 \\(h=2,k=-4\\)。',
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131DegreeAfterOperationsSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '若 \\(\\deg f(x)=4\\)、\\(\\deg g(x)=4\\)，則 \\(\\deg(f(x)-g(x))\\) 的可能值為何？',
        a: '簡答：可能小於或等於 4；若最高次項沒有抵消則為 4，若抵消則可能為 3、2、1、0，甚至零多項式的次數不定義。過程：同次多項式相減時，最高次項係數可能相消，所以只能說結果次數不超過 4。',
      },
      {
        q: '已知 \\(\\deg(f(x)g(x))=6\\)、\\(\\deg(f(x)+g(x))=4\\)，求 \\(f(x)\\) 可能的次數。',
        a: '簡答：2 或 4。過程：設 \\(\\deg f=m,\\deg g=n\\)，則 \\(m+n=6\\)。又和的次數為 4，表示兩者較大的次數必須是 4，或最高次抵消後降到 4。可行的配對為 \\((m,n)=(2,4),(4,2)\\) 或同為 3 不可能使和為 4，所以 \\(f\\) 可能為 2 或 4 次。',
      },
      {
        q: '若 \\(f(x)\\)、\\(g(x)\\) 均為 \\(n\\) 次多項式，令 \\(h(x)=f(x)-g(x)\\)，則 \\(h(x)\\) 的次數可能如何？',
        a: '簡答：可能小於或等於 \\(n\\)，也可能成為零多項式。過程：兩個 \\(n\\) 次多項式相減時，最高次項係數若不同，結果仍為 \\(n\\) 次；若相同，最高次項抵消，次數會降低；若所有係數都相同，則為零多項式。',
      },
      {
        q: '若 \\(f(x)\\) 為四次式，求 \\((x^3-3)f(x^2-1)\\) 的次數。',
        a: '簡答：11 次。過程：\\(f(x)\\) 為四次式，所以 \\(f(x^2-1)\\) 的最高次來自 \\((x^2)^4=x^8\\)，是 8 次。再乘上 \\((x^3-3)\\)，最高次為 \\(8+3=11\\)。',
      },
      {
        q: '判斷 \\((x^2+1)^3-(x^3+1)^2\\) 的次數。',
        a: '簡答：4 次。過程：兩部分最高次都是 \\(x^6\\)，相減後 \\(x^6\\) 抵消。展開看下一層：\\((x^2+1)^3=x^6+3x^4+3x^2+1\\)，\\((x^3+1)^2=x^6+2x^3+1\\)，差為 \\(3x^4-2x^3+3x^2\\)，所以次數為 4。',
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131SpecificCoefficientSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '求 \\((x+1)(x+2)\\cdots(x+10)\\) 展開式中的 \\(x^9\\) 項係數。',
        a: '簡答：55。過程：十個一次因式相乘時，\\(x^9\\) 項係數等於所有常數項的總和，故為 \\(1+2+\\cdots+10=55\\)。',
      },
      {
        q: '設 \\(f(x)=(x^5-2x^4+3x^3-4x^2+5x+2)(3x^6+2x^3+x^2+1)\\)，求展開後 \\(x^2\\) 的係數。',
        a: '簡答：-2。過程：要湊 \\(x^2\\)，只有兩種來源：第一個多項式的 \\(-4x^2\\) 乘第二個的常數 1，以及第一個多項式的常數 2 乘第二個的 \\(x^2\\)。因此係數為 \\(-4\\cdot1+2\\cdot1=-2\\)。',
      },
      {
        q: '求 \\((1-2x+3x^2-\\cdots+11x^{10})(1+3x^2+5x^4+\\cdots+11x^{10})\\) 乘開後 \\(x^9\\) 的係數。',
        a: '簡答：-110。過程：第二個多項式只含偶次項。要湊 \\(x^9\\)，第一個多項式需取奇次項：\\((-2x)(9x^8)+(-4x^3)(7x^6)+(-6x^5)(5x^4)+(-8x^7)(3x^2)+(-10x^9)(1)\\)。係數和為 \\(-18-28-30-24-10=-110\\)。',
      },
      {
        q: '求 \\((1+x+x^2+\\cdots+x^8)(1+x+x^2+\\cdots+x^6)\\) 展開式中 \\(x^5\\) 的係數。',
        a: '簡答：6。過程：要湊 \\(x^5\\)，可取 \\((x^0,x^5),(x^1,x^4),\\ldots,(x^5,x^0)\\)，共有 6 種搭配，所以係數為 6。',
      },
      {
        q: '求 \\((1+x)^8\\) 展開式中 \\(x^3\\) 與 \\(x^5\\) 項係數之和。',
        a: '簡答：112。過程：\\((1+x)^8\\) 中 \\(x^3\\) 係數為 \\(\\binom83=56\\)，\\(x^5\\) 係數為 \\(\\binom85=56\\)，係數和為 112。',
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const roots = shuffle([randInt(-5, -1), randInt(1, 5), randInt(6, 9)]).slice(0, 3).sort((a, b) => a - b);
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
      const b = randInt(1, 4);
      const c = randInt(2, 6);
      const polynomial = `(x^2+${a}x+${b})(x-${c})`;
      const value = c * c + a * c + b;
      questions.push(`設 \\(f(x)=${polynomial}\\)。若 \\(x-${c}\\) 已知為因式，判斷 \\(x+${c}\\) 是否也一定是因式。`);
      answers.push(
        `簡答：不一定；本題不是。過程：因式定理要代入對應的根。\\(x+${c}\\) 是因式需 \\(f(-${c})=0\\)，但 \\(f(-${c})=((-${c})^2-${a * c}+${b})(-${2 * c})\\)，通常不為 0。不能因為 \\(x-${c}\\) 是因式，就誤以為 \\(x+${c}\\) 也會是因式。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131NearbyRootsValueSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const a = randInt(-4, 5);
        const k = pickNonZero(-5, 5);
        const given = -6 * k;
        const target = 6 * k;
        questions.push(`三次多項式 \\(f(x)\\) 的根為 ${a}、${a + 1}、${a + 2}，且最高次項係數為 \\(k\\)。若 \\(f(${a - 1})=${given}\\)，求 \\(f(${a + 3})\\)。`);
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
        questions.push(`三次多項式 \\(f(x)\\) 有三根 ${a}、${a + 1}、${a + 2}。若最高次項係數固定，且 \\(f(${a + 3})=${given}\\)，求 \\(f(${a - 1})\\)。`);
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
        questions.push(`三次多項式 \\(f(x)\\) 的根為 ${a - d}、${a}、${a + d}。若 \\(f(${a + 2 * d})=${given}\\)，求 \\(f(${a - 2 * d})\\)。`);
        answers.push(
          `簡答：${target}。過程：設 \\(f(x)=k${formatS13FactorProduct([a - d, a, a + d])}\\)。在 \\(x=${a + 2 * d}\\) 時三因數為 \\(${3 * d},${2 * d},${d}\\)，乘積為 \\(${6 * d ** 3}\\)；在 \\(x=${a - 2 * d}\\) 時三因數為 \\(${-d},${-2 * d},${-3 * d}\\)，乘積為 \\(${-6 * d ** 3}\\)。所以兩值相反，答案為 ${target}。`
        );
        continue;
      }

      if (type === 3) {
        const a = randInt(-3, 3);
        const k = pickNonZero(-3, 3);
        const given = 24 * k;
        questions.push(`四次多項式 \\(f(x)\\) 的根為 ${a}、${a + 1}、${a + 2}、${a + 3}。若 \\(f(${a - 1})=${given}\\)，求 \\(f(${a + 4})\\)。`);
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
      questions.push(`二次多項式 \\(f(x)\\) 的兩根為 ${a}、${b}，且 \\(f(${givenX})=${given}\\)，求 \\(f(${targetX})\\)。`);
      answers.push(
        `簡答：${target}。過程：設 \\(f(x)=k${formatS13FactorProduct([a, b])}\\)。由 \\(f(${givenX})=k(${givenX - a})(${givenX - b})=${given}\\) 可得 \\(k=${k}\\)。所以 \\(f(${targetX})=k(${targetX - a})(${targetX - b})=${target}\\)。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131AxMinusBDivisionSet(count) {
    const questions = [];
    const answers = [];
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
      const remainderText = r < 0 ? `-${Math.abs(r)}` : `+${r}`;
      questions.push(`求 \\(${dividendText}\\) 除以 \\(${divisorText}\\) 的商式與餘式。`);
      answers.push(
        `簡答：商式 \\(${quotientText}\\)，餘式 ${r}。過程：此題除式首項係數不是 1，做綜合除法時若先用根 \\(x=${formatFraction(-b, a)}\\) 得到偽商，最後還要除以 ${a} 才是真正商式。檢查可得 \\(${dividendText}=(${divisorText})(${quotientText})${remainderText}\\)，所以答案如上。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131ProductSpecificCoefficientSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '求 \\((x^2-x+3)(5x^6+2x^5-3x^4+5x^2-1)\\) 展開式中 \\(x^3\\) 的係數。',
        a: '簡答：-5。過程：要得到 \\(x^3\\)，可檢查項次配對：\\(x^2\\) 需配一次項，但第二個多項式沒有一次項；\\(-x\\) 配 \\(5x^2\\) 得係數 \\(-5\\)；常數 3 需配三次項，但第二個多項式沒有三次項。所以 \\(x^3\\) 係數為 -5。',
      },
      {
        q: '求多項式 \\(x(x+1)(x+2)\\cdots(x+10)\\) 展開式中 \\(x^9\\) 項的係數。',
        a: '簡答：1320。過程：整體共有 11 個一次因式，其中一個常數為 0。\\(x^9\\) 項表示要從 11 個因式中選出 2 個常數項相乘，但含 0 的常數項不能選，所以係數為 \\(\\sum_{1\\leq i<j\\leq10}ij\\)。由 \\(\\frac{(1+\\cdots+10)^2-(1^2+\\cdots+10^2)}2=\\frac{55^2-385}{2}=1320\\)。',
      },
      {
        q: '求 \\((x^2-4x+3)(x^3+2x^2-4x+3)\\) 展開後所有項係數總和。',
        a: '簡答：0。過程：所有項係數總和等於把 \\(x=1\\) 代入。第一個括號 \\(1-4+3=0\\)，所以整個乘積在 \\(x=1\\) 的值為 0。',
      },
      {
        q: '設 \\(f(x)=(x^2+1)^3-(x^3+1)^2\\)，判斷其最高次項係數。',
        a: '簡答：3。過程：兩者的 \\(x^6\\) 項係數同為 1，會互相抵消。下一個最高次來自 \\((x^2+1)^3\\) 的 \\(3x^4\\)，而 \\((x^3+1)^2\\) 沒有 \\(x^4\\) 項，所以最高次項為 \\(3x^4\\)，係數為 3。',
      },
      {
        q: '已知 \\((x^2+ax+2)(x^3+2x^2-3x+1)\\) 展開式中 \\(x^3\\) 係數為 7，求 \\(a\\)。',
        a: '簡答：\\(a=4\\)。過程：\\(x^3\\) 項來自 \\(x^2\\cdot(-3x)\\)、\\(ax\\cdot2x^2\\)、\\(2\\cdot x^3\\)。係數為 \\(-3+2a+2=2a-1\\)。由 \\(2a-1=7\\)，得 \\(a=4\\)。',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131RemainderTransformationSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '設 \\(f(x)\\) 除以 \\((x-2)\\) 的商為 \\(Q(x)\\)、餘式為 5，求 \\(xf(x)\\) 除以 \\((x-2)\\) 的餘式。',
        a: '簡答：10。過程：由餘式定理，\\(f(2)=5\\)。要求 \\(xf(x)\\) 除以 \\(x-2\\) 的餘式，只要代入 \\(x=2\\)，得 \\(2f(2)=10\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\((3x-2)\\) 的餘式為 6，求 \\(f(\\frac{x}{3})\\) 除以 \\((x-2)\\) 的餘式。',
        a: '簡答：6。過程：除以 \\(3x-2\\) 的餘式為 6，表示 \\(f(\\frac23)=6\\)。而 \\(f(\\frac{x}{3})\\) 除以 \\(x-2\\) 的餘式為代入 \\(x=2\\)，即 \\(f(\\frac23)=6\\)。',
      },
      {
        q: '設 \\((x+1)f(x)\\) 除以 \\(x^2+x+1\\) 的餘式為 \\(5x+3\\)，求 \\(f(x)\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(2x+5\\)。過程：在模 \\(x^2+x+1\\) 下，\\((x+1)(-x)=1\\)，所以 \\(x+1\\) 的反元素是 \\(-x\\)。因此 \\(f(x)\\) 的餘式為 \\((-x)(5x+3)=-5x^2-3x\\)。又 \\(x^2\\equiv-x-1\\)，得 \\(-5x^2-3x\\equiv5x+5-3x=2x+5\\)。',
      },
      {
        q: '若 \\(f(x)\\) 除以 \\((x-1)^2\\) 餘式為 \\(3x+2\\)，除以 \\((x-2)^2\\) 餘式為 \\(5x-3\\)，求除以 \\((x-1)(x-2)\\) 的餘式。',
        a: '簡答：\\(2x+3\\)。過程：設所求餘式為 \\(ax+b\\)。由第一個條件得 \\(f(1)=3(1)+2=5\\)，所以 \\(a+b=5\\)。由第二個條件得 \\(f(2)=5(2)-3=7\\)，所以 \\(2a+b=7\\)。解得 \\(a=2,b=3\\)，餘式為 \\(2x+3\\)。',
      },
      {
        q: '求 \\((3x+1)^{100}\\) 除以 \\((3x+2)\\) 的餘式。',
        a: '簡答：1。過程：除以 \\(3x+2\\) 時代入根 \\(x=-\\frac23\\)。此時 \\(3x+1=-1\\)，所以餘式為 \\((-1)^{100}=1\\)。',
      },
      {
        q: '設 \\(f(x)\\) 除以 \\(2x-3\\) 的商為 \\(Q(x)\\)、餘式為 \\(r\\)，求 \\(f(x)\\) 除以 \\(x-\\frac32\\) 的商式與餘式。',
        a: '簡答：商式 \\(2Q(x)\\)，餘式 \\(r\\)。過程：因為 \\(2x-3=2(x-\\frac32)\\)，若 \\(f(x)=(2x-3)Q(x)+r\\)，則 \\(f(x)=(x-\\frac32)[2Q(x)]+r\\)。',
      },
      {
        q: '設 \\(f(x)\\) 除以 \\(ax-b\\) 的商為 \\(q(x)\\)、餘式為 \\(r\\)，求 \\(xf(x)\\) 除以 \\(x-\\frac{b}{a}\\) 的餘式。',
        a: '簡答：\\(\\frac{br}{a}\\)。過程：由 \\(ax-b=0\\) 得 \\(x=\\frac ba\\)，且 \\(f(\\frac ba)=r\\)。所以 \\(xf(x)\\) 除以 \\(x-\\frac ba\\) 的餘式為 \\(\\frac ba\\cdot r=\\frac{br}{a}\\)。',
      },
      {
        q: '若 \\(f(x)\\) 除以 \\(ax+b\\) 的商為 \\(Q(x)\\)、餘式為 \\(r\\)，求 \\(f(\\frac{x}{a})\\) 除以 \\(x+b\\) 的餘式。',
        a: '簡答：\\(r\\)。過程：除以 \\(x+b\\) 代入 \\(x=-b\\)，得到 \\(f(-\\frac ba)\\)。而 \\(ax+b=0\\) 的根也是 \\(-\\frac ba\\)，所以餘式仍為 \\(r\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(g(x)\\) 的商為 \\(q(x)\\)、餘式為 \\(r(x)\\)，求 \\(3f(x)\\) 除以 \\(4g(x)\\) 的商式與餘式。',
        a: '簡答：商式 \\(\\frac34q(x)\\)，餘式 \\(3r(x)\\)。過程：由 \\(f(x)=g(x)q(x)+r(x)\\)，得 \\(3f(x)=4g(x)\\cdot\\frac34q(x)+3r(x)\\)。若 \\(3r(x)\\) 次數小於 \\(g(x)\\)，也小於 \\(4g(x)\\)，因此餘式為 \\(3r(x)\\)。',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131HighPowerRemainderSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      {
        q: '求 \\(x^{12}\\) 除以 \\((x+1)^2\\) 的餘式。',
        a: "簡答：\\(-12x-11\\)。過程：除以 \\((x+1)^2\\) 的餘式設為 \\(ax+b\\)，需與 \\(x^{12}\\) 在 \\(x=-1\\) 的函數值與導數值相同。\\(r(-1)=1\\)、\\(r'(-1)=12(-1)^{11}=-12\\)，所以 \\(a=-12\\)，\\(-a+b=1\\)，得 \\(b=-11\\)。",
      },
      {
        q: '求 \\(x^{2000}-3x^{90}+5x^{18}-7\\) 除以 \\((x^3-1)\\) 的餘式。',
        a: '簡答：\\(x^2-5\\)。過程：在模 \\(x^3-1\\) 下，\\(x^3\\equiv1\\)。因為 \\(2000\\equiv2\\pmod3\\)，\\(90,18\\) 都是 3 的倍數，所以餘式為 \\(x^2-3+5-7=x^2-5\\)。',
      },
      {
        q: '計算 \\(13^{10}-13^4+1\\) 除以 \\((13^2-13+1)\\) 的餘數。',
        a: '簡答：1。過程：令 \\(t=13\\)，由 \\(t^2-t+1=0\\) 得 \\(t^3\\equiv-1\\)、\\(t^6\\equiv1\\)。所以 \\(t^{10}=t^6t^4\\equiv t^4\\)，原式 \\(t^{10}-t^4+1\\equiv1\\)。因此餘數為 1。',
      },
      {
        q: '求 \\(x^{100}+1\\) 除以 \\((x-1)^2\\) 的餘式。',
        a: "簡答：\\(100x-98\\)。過程：設餘式為 \\(ax+b\\)。需滿足 \\(r(1)=1^{100}+1=2\\)，且 \\(r'(1)=100\\)。故 \\(a=100\\)，\\(100+b=2\\)，得 \\(b=-98\\)。",
      },
      {
        q: '已知 \\(f(x)=x^{32}-3x^{24}+3x^{14}-2\\)，求其除以 \\((x^2+x+1)\\) 的餘式。',
        a: '簡答：\\(-4x-9\\)。過程：在模 \\(x^2+x+1\\) 下，\\(x^3\\equiv1\\)。所以 \\(x^{32}\\equiv x^2\\)、\\(x^{24}\\equiv1\\)、\\(x^{14}\\equiv x^2\\)。原式餘式為 \\(x^2-3+3x^2-2=4x^2-5\\)。再用 \\(x^2\\equiv-x-1\\)，得 \\(-4x-9\\)。',
      },
      {
        q: '求 \\(x^{12}\\) 除以 \\((x+1)^2\\) 的餘式，並以此計算 \\(9^{12}\\) 除以 100 的餘數。',
        a: '簡答：餘式 \\(-12x-11\\)，餘數 81。過程：除以 \\((x+1)^2\\) 的餘式為 \\(-12x-11\\)。因為 100\\(=(9+1)^2\\)，代入 \\(x=9\\) 得 \\(-108-11=-119\\)，除以 100 的餘數為 81。',
      },
      {
        q: '證明 \\(8^{20}-5^{20}\\) 是 3 的倍數。',
        a: '簡答：是 3 的倍數。過程：因為 \\(8\\equiv5\\equiv2\\pmod3\\)，所以 \\(8^{20}-5^{20}\\equiv2^{20}-2^{20}\\equiv0\\pmod3\\)。',
      },
      {
        q: '計算 \\(13^{10}-13^4+1\\) 除以 \\(13^2-13+1\\) 的餘數。',
        a: '簡答：1。過程：令 \\(t=13\\)。在模 \\(t^2-t+1\\) 下，\\(t^3\\equiv-1\\)，所以 \\(t^6\\equiv1\\)。因此 \\(t^{10}\\equiv t^4\\)，原式 \\(t^{10}-t^4+1\\equiv1\\)。',
      },
      {
        q: '利用除法原理求 \\(23756108^{12}\\) 除以 \\(101\\) 的餘數。',
        a: '簡答：56。過程：先把底數化小，\\(23756108\\equiv35\\pmod{101}\\)。依序平方得 \\(35^2\\equiv13\\)，\\(35^4\\equiv68\\)，\\(35^8\\equiv79\\)。所以 \\(35^{12}=35^8\\cdot35^4\\equiv79\\cdot68=5372\\equiv56\\pmod{101}\\)。',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131ComplexRootRemainderSet(count) {
    const templates = [
      {
        q: '求 \\(x^{100}+x^{50}+1\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：0。過程：由 \\(x^2+x+1=0\\) 得 \\(x^3\\equiv1\\)。因為 \\(100\\equiv1\\pmod3\\)，\\(50\\equiv2\\pmod3\\)，所以 \\(x^{100}+x^{50}+1\\equiv x+x^2+1=0\\)。',
      },
      {
        q: '求 \\(x^{81}+x^{49}+x^9\\) 除以 \\(x^2-x+1\\) 的餘式。',
        a: '簡答：\\(x-2\\)。過程：由 \\(x^2-x+1=0\\) 得 \\(x^3\\equiv-1\\)，所以週期為 6。\\(81\\equiv3\\)、\\(49\\equiv1\\)、\\(9\\equiv3\\pmod6\\)，故 \\(x^{81}+x^{49}+x^9\\equiv x^3+x+x^3\\equiv -1+x-1=x-2\\)。',
      },
      {
        q: '求 \\(x^{2006}-1\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(-x-2\\)。過程：由 \\(x^2+x+1=0\\) 得 \\(x^3\\equiv1\\)。因為 \\(2006\\equiv2\\pmod3\\)，所以 \\(x^{2006}-1\\equiv x^2-1\\)。再用 \\(x^2\\equiv-x-1\\)，得餘式 \\(-x-2\\)。',
      },
      {
        q: '求 \\(x^{12}\\) 除以 \\(x^2+1\\) 的餘式。',
        a: '簡答：1。過程：由 \\(x^2+1=0\\) 得 \\(x^2\\equiv-1\\)，所以 \\(x^{12}=(x^2)^6\\equiv(-1)^6=1\\)。',
      },
      {
        q: '已知 \\(f(x)=x^{32}-3x^{24}+3x^{14}-2\\)，求其除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(-4x-9\\)。過程：由 \\(x^2+x+1=0\\) 得 \\(x^3\\equiv1\\)。所以 \\(x^{32}\\equiv x^2\\)、\\(x^{24}\\equiv1\\)、\\(x^{14}\\equiv x^2\\)。原式餘式為 \\(4x^2-5\\)，再用 \\(x^2\\equiv-x-1\\)，得 \\(-4x-9\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131CompositionRemainderSet(count) {
    const templates = [
      {
        q: '設 \\(f(x)=x^3-2x^2-x+5\\)，求 \\(f(f(x))\\) 除以 \\(x-2\\) 的餘式。',
        a: '簡答：11。過程：除以 \\(x-2\\) 的餘式等於代入 \\(x=2\\)。先算 \\(f(2)=8-8-2+5=3\\)，所以 \\(f(f(2))=f(3)=27-18-3+5=11\\)。',
      },
      {
        q: '設 \\(f(x)=x^2-x+2\\)，\\(g(x)=f(f(x))\\)，求 \\(g(x)\\) 除以 \\(x-2\\) 的餘式。',
        a: '簡答：14。過程：餘式為 \\(g(2)=f(f(2))\\)。\\(f(2)=4-2+2=4\\)，\\(f(4)=16-4+2=14\\)。',
      },
      {
        q: '已知 \\(f(1)=2\\)、\\(f(2)=7\\)，求 \\(f(f(x))\\) 除以 \\(x-1\\) 的餘式。',
        a: '簡答：7。過程：除以 \\(x-1\\) 的餘式為代入 \\(x=1\\)。因此 \\(f(f(1))=f(2)=7\\)。',
      },
      {
        q: '設 \\(f(x)=x^3-2x^2+x+2\\)，求 \\(f(f(x))\\) 除以 \\(x-2\\) 的餘式。',
        a: '簡答：38。過程：餘式為 \\(f(f(2))\\)。先算 \\(f(2)=8-8+2+2=4\\)，再算 \\(f(4)=64-32+4+2=38\\)。',
      },
      {
        q: '若 \\(f(1)=3\\)、\\(f(3)=5\\)，求 \\(f(f(x))\\) 除以 \\(x-1\\) 的餘式。',
        a: '簡答：5。過程：除以 \\(x-1\\) 的餘式為 \\(f(f(1))\\)。由 \\(f(1)=3\\)，再用 \\(f(3)=5\\)，所以餘式為 5。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131SquareDivisorRemainderSet(count) {
    const templates = [
      {
        q: '求 \\(x^{20}+2\\) 除以 \\((x-1)^2\\) 的餘式。',
        a: "簡答：\\(20x-17\\)。過程：設餘式為 \\(ax+b\\)。除以 \\((x-1)^2\\) 時，要同時符合函數值與導數值：\\(r(1)=1^{20}+2=3\\)，\\(r'(1)=20\\)。故 \\(a=20\\)，\\(20+b=3\\)，得 \\(b=-17\\)。",
      },
      {
        q: '設 \\(ax^8+bx^7+1\\) 能被 \\((x-1)^2\\) 整除，求數對 \\((a,b)\\)。',
        a: "簡答：\\((a,b)=(7,-8)\\)。過程：能被 \\((x-1)^2\\) 整除，表示 \\(P(1)=0\\) 且 \\(P'(1)=0\\)。所以 \\(a+b+1=0\\)，\\(8a+7b=0\\)。解得 \\(a=7,b=-8\\)。",
      },
      {
        q: '求 \\(x^{100}+1\\) 除以 \\((x-1)^2\\) 的餘式。',
        a: "簡答：\\(100x-98\\)。過程：設餘式為 \\(ax+b\\)。\\(r(1)=2\\)，且 \\(r'(1)=100\\)，所以 \\(a=100\\)、\\(100+b=2\\)，得 \\(b=-98\\)。",
      },
      {
        q: '設 \\((x+1)^n(x^2+ax+b)\\) 除以 \\((x-1)^2\\) 的餘式為 \\(2^n(x-1)\\)，求 \\(a,b\\)。',
        a: "簡答：\\(a=-1,b=0\\)。過程：令 \\(P(x)=(x+1)^n(x^2+ax+b)\\)。餘式 \\(2^n(x-1)\\) 在 \\(x=1\\) 的值為 0，導數值為 \\(2^n\\)。由 \\(P(1)=2^n(1+a+b)=0\\)，得 \\(1+a+b=0\\)。又 \\(P'(1)=2^n(2+a)=2^n\\)，得 \\(a=-1\\)，所以 \\(b=0\\)。",
      },
      {
        q: '若 \\(f(x)\\) 除以 \\((x-1)^2\\) 餘式為 \\(3x+2\\)，求 \\(f(x)\\) 在 \\(x=1\\) 的值與導數值。',
        a: "簡答：\\(f(1)=5,\\ f'(1)=3\\)。過程：除以 \\((x-1)^2\\) 的餘式保留在 \\(x=1\\) 的函數值與導數值。餘式 \\(r(x)=3x+2\\)，所以 \\(f(1)=r(1)=5\\)，\\(f'(1)=r'(1)=3\\)。",
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131StepwiseRemainderConstructionSet(count) {
    const templates = [
      {
        q: '設 \\(f(x)\\) 除以 \\(x-1,x-2,x-3\\) 的餘式分別為 3,7,13，求 \\(f(x)\\) 除以 \\((x-1)(x-2)(x-3)\\) 的餘式。',
        a: '簡答：\\(x^2+x+1\\)。過程：設餘式為 \\(ax^2+bx+c\\)。由 \\(r(1)=3,r(2)=7,r(3)=13\\)，解得 \\(a=1,b=1,c=1\\)，故餘式為 \\(x^2+x+1\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(x^2+x+1\\) 餘 \\(7x+16\\)，且除以 \\(x-1\\) 餘 8，求 \\(f(x)\\) 除以 \\(x^3-1\\) 的餘式。',
        a: '簡答：\\(-5x^2+2x+11\\)。過程：因為 \\(x^3-1=(x-1)(x^2+x+1)\\)，設餘式為 \\(7x+16+k(x^2+x+1)\\)。代入 \\(x=1\\) 得 \\(23+3k=8\\)，所以 \\(k=-5\\)，餘式為 \\(-5x^2+2x+11\\)。',
      },
      {
        q: '設 \\(f(x)\\) 除以 \\((x-1)(x-2)\\) 餘 \\(2x+5\\)，除以 \\((x-2)(x-3)\\) 餘 \\(4x+1\\)，求除以 \\((x-1)(x-2)(x-3)\\) 的餘式。',
        a: '簡答：\\(x^2-x+7\\)。過程：由第一個餘式得 \\(f(1)=7,f(2)=9\\)；由第二個餘式得 \\(f(2)=9,f(3)=13\\)。設 \\(r(x)=ax^2+bx+c\\)，使 \\(r(1)=7,r(2)=9,r(3)=13\\)，解得 \\(r(x)=x^2-x+7\\)。',
      },
      {
        q: '已知 \\(f(1)=3,f(-1)=1,f(2)=7\\)，求 \\(f(x)\\) 除以 \\((x-1)(x+1)(x-2)\\) 的餘式。',
        a: '簡答：\\(x^2+x+1\\)。過程：設餘式為 \\(ax^2+bx+c\\)。代入三個根得 \\(a+b+c=3\\)、\\(a-b+c=1\\)、\\(4a+2b+c=7\\)。解得 \\(a=1,b=1,c=1\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(x^2-1\\) 餘 \\(-x+4\\)，求 \\(f(1)\\) 與 \\(f(-1)\\)。',
        a: '簡答：\\(f(1)=3,\\ f(-1)=5\\)。過程：\\(x^2-1=(x-1)(x+1)\\)。餘式 \\(-x+4\\) 在根上的值就是原多項式在根上的值，所以 \\(f(1)=3\\)，\\(f(-1)=5\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131CoefficientTransformRemainderSet(count) {
    const templates = [
      {
        q: '設 \\(f(x)\\) 除以 \\(3x-2\\) 的商為 \\(q(x)\\)、餘式為 5，求 \\(xf(x)\\) 除以 \\(x-\\frac23\\) 的餘式。',
        a: '簡答：\\(\\frac{10}{3}\\)。過程：除以 \\(3x-2\\) 餘 5 表示 \\(f(\\frac23)=5\\)。所以 \\(xf(x)\\) 除以 \\(x-\\frac23\\) 的餘式為 \\(\\frac23\\cdot5=\\frac{10}{3}\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(2x-3\\) 的餘式為 7，求 \\(f(3x)\\) 除以 \\(2x-1\\) 的餘式。',
        a: '簡答：7。過程：\\(2x-3=0\\) 的根為 \\(\\frac32\\)，所以 \\(f(\\frac32)=7\\)。要求 \\(f(3x)\\) 除以 \\(2x-1\\) 的餘式，代入 \\(x=\\frac12\\)，得 \\(f(\\frac32)=7\\)。',
      },
      {
        q: '設 \\((x+1)f(x)\\) 除以 \\(x^2+x+1\\) 的餘式為 \\(5x+3\\)，求 \\(f(x)\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(2x+5\\)。過程：在模 \\(x^2+x+1\\) 下，\\((x+1)(-x)=1\\)。因此 \\(f(x)\\equiv -x(5x+3)=-5x^2-3x\\)。又 \\(x^2\\equiv-x-1\\)，得餘式 \\(2x+5\\)。',
      },
      {
        q: '已知 \\(xf(x)\\) 除以 \\(x^2+x+1\\) 的餘式為 \\(3x+2\\)，求 \\(f(x)\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(-2x+1\\)。過程：在模 \\(x^2+x+1\\) 下，\\(x^{-1}\\equiv x^2\\equiv-x-1\\)。所以 \\(f(x)\\equiv(3x+2)(-x-1)=-3x^2-5x-2\\equiv-2x+1\\)。',
      },
      {
        q: '設 \\(f(x)=x^4+3x^2-2x-1\\)，求 \\(g(x)=f(2x-3)\\) 除以 \\(2x-1\\) 的餘式。',
        a: '簡答：31。過程：除以 \\(2x-1\\) 時代入 \\(x=\\frac12\\)。此時 \\(2x-3=-2\\)，所以餘式為 \\(f(-2)=16+12+4-1=31\\)。',
      },
      {
        q: '設 \\(f(x)\\) 除以 \\(2x-3\\) 的商為 \\(Q(x)\\)、餘式為 \\(r\\)，求 \\(3f(x)\\) 除以 \\(4(2x-3)\\) 的商式與餘式。',
        a: '簡答：商式 \\(\\frac34Q(x)\\)，餘式 \\(3r\\)。過程：由 \\(f(x)=(2x-3)Q(x)+r\\)，得 \\(3f(x)=4(2x-3)\\cdot\\frac34Q(x)+3r\\)。所以商式為 \\(\\frac34Q(x)\\)，餘式為 \\(3r\\)。',
      },
      {
        q: '設 \\(f(x)\\) 除以 \\(ax-b\\) 的商為 \\(q(x)\\)、餘式為 \\(r\\)，求 \\(xf(x)\\) 除以 \\(x-\\frac ba\\) 的餘式。',
        a: '簡答：\\(\\frac{br}{a}\\)。過程：由 \\(ax-b=0\\) 得 \\(x=\\frac ba\\)，且 \\(f(\\frac ba)=r\\)。所以 \\(xf(x)\\) 的餘式為 \\(\\frac ba\\cdot r=\\frac{br}{a}\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131RemainderOperationsSet(count) {
    const templates = [
      {
        q: '已知 \\(f(x)\\) 除以 \\(x^2-x-1\\) 餘 \\(2x+1\\)，\\(g(x)\\) 除以同一除式餘 \\(x-3\\)，求 \\(f(x)+g(x)\\) 的餘式。',
        a: '簡答：\\(3x-2\\)。過程：同一除式下，加法的餘式可直接相加：\\((2x+1)+(x-3)=3x-2\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(x^2-x-1\\) 餘 \\(2x+1\\)，\\(g(x)\\) 除以同一除式餘 \\(x-3\\)，求 \\(2f(x)-3g(x)\\) 的餘式。',
        a: '簡答：\\(x+11\\)。過程：餘式可做同樣線性組合，\\(2(2x+1)-3(x-3)=4x+2-3x+9=x+11\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(x^2-x-1\\) 餘 \\(2x+1\\)，\\(g(x)\\) 除以同一除式餘 \\(x-3\\)，求 \\(f(x)g(x)\\) 的餘式。',
        a: '簡答：\\(-3x-1\\)。過程：先乘餘式：\\((2x+1)(x-3)=2x^2-5x-3\\)。由 \\(x^2\\equiv x+1\\)，得 \\(2x^2-5x-3\\equiv2(x+1)-5x-3=-3x-1\\)。',
      },
      {
        q: '若 \\(f(x)\\) 除以 \\(x-2\\) 餘 5，\\(g(x)\\) 除以 \\(x-2\\) 餘 3，求 \\((f(x))^2+(g(x))^2\\) 除以 \\(x-2\\) 的餘式。',
        a: '簡答：34。過程：代入 \\(x=2\\)，得 \\(f(2)=5,g(2)=3\\)，所以餘式為 \\(5^2+3^2=34\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 被 \\(g(x)\\) 除餘 \\(r(x)\\)，求 \\(3f(x)\\) 被 \\(g(x)\\) 除的餘式。',
        a: '簡答：\\(3r(x)\\)。過程：若 \\(f(x)=g(x)Q(x)+r(x)\\)，則 \\(3f(x)=g(x)[3Q(x)]+3r(x)\\)。只要 \\(3r(x)\\) 的次數仍小於 \\(g(x)\\) 的次數，它就是餘式。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131LowToHighRemainderSet(count) {
    const templates = [
      {
        q: '已知 \\(f(x)\\) 除以 \\(x-1\\) 餘 9，除以 \\(x-2\\) 餘 16，求 \\(f(x)\\) 除以 \\((x-1)(x-2)\\) 的餘式。',
        a: '簡答：\\(7x+2\\)。過程：設餘式為 \\(ax+b\\)。由 \\(r(1)=9,r(2)=16\\)，得 \\(a+b=9\\)、\\(2a+b=16\\)，解得 \\(a=7,b=2\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(x-1\\) 餘 2，除以 \\(x+2\\) 餘 -4，求 \\(f(x)\\) 除以 \\(x^2+x-2\\) 的餘式。',
        a: '簡答：\\(2x\\)。過程：\\(x^2+x-2=(x-1)(x+2)\\)。設餘式 \\(ax+b\\)，由 \\(r(1)=2,r(-2)=-4\\)，解得 \\(a=2,b=0\\)。',
      },
      {
        q: '已知多項式除以 \\(x^2-5x+4\\) 餘 \\(x+2\\)，除以 \\(x^2-5x+6\\) 餘 \\(3x+4\\)，求除以 \\(x^2-4x+3\\) 的餘式。',
        a: '簡答：\\(5x-2\\)。過程：三個二次式的根分別給出 \\(f(1)=3,f(4)=6\\) 與 \\(f(2)=10,f(3)=13\\)。要求除以 \\(x^2-4x+3=(x-1)(x-3)\\)，設餘式 \\(ax+b\\)，由 \\(r(1)=3,r(3)=13\\)，得 \\(r(x)=5x-2\\)。',
      },
      {
        q: '若 \\(f(1)=3,f(-1)=5\\)，求 \\(f(x)\\) 除以 \\(x^2-1\\) 的餘式。',
        a: '簡答：\\(-x+4\\)。過程：設餘式為 \\(ax+b\\)。由 \\(a+b=3\\)、\\(-a+b=5\\)，解得 \\(a=-1,b=4\\)。',
      },
      {
        q: '若 \\(f(x)\\) 分別除以 \\(x-1,x-2,x-3\\) 的餘式為 5,10,17，求除以 \\((x-1)(x-2)(x-3)\\) 的餘式。',
        a: '簡答：\\(x^2+2x+2\\)。過程：設餘式為 \\(ax^2+bx+c\\)。代入 \\(x=1,2,3\\)，得 \\(a+b+c=5\\)、\\(4a+2b+c=10\\)、\\(9a+3b+c=17\\)。解得 \\(a=1,b=2,c=2\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131TransformedDividendRemainderSet(count) {
    const templates = [
      {
        q: '已知 \\((x+1)f(x)\\) 除以 \\(x^2+x+1\\) 餘 \\(5x+3\\)，求 \\(f(x)\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(2x+5\\)。過程：在模 \\(x^2+x+1\\) 下，\\((x+1)(-x)=1\\)，所以 \\(f(x)\\equiv -x(5x+3)=-5x^2-3x\\equiv2x+5\\)。',
      },
      {
        q: '已知 \\(xf(x)\\) 除以 \\(x^2+x+1\\) 的餘式為 \\(3x+2\\)，求 \\(f(x)\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(-2x+1\\)。過程：在模 \\(x^2+x+1\\) 下，\\(x^{-1}\\equiv x^2\\equiv-x-1\\)。因此 \\(f(x)\\equiv(3x+2)(-x-1)\\equiv-2x+1\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(3x-2\\) 餘 4，求 \\(xf(x)\\) 除以 \\(x-\\frac23\\) 的餘式。',
        a: '簡答：\\(\\frac{8}{3}\\)。過程：由題意 \\(f(\\frac23)=4\\)。所以 \\(xf(x)\\) 除以 \\(x-\\frac23\\) 的餘式為 \\(\\frac23\\cdot4=\\frac83\\)。',
      },
      {
        q: '設 \\(f(x)\\) 除以 \\(2x-3\\) 餘 5，求 \\(f(3x)\\) 除以 \\(2x-1\\) 的餘式。',
        a: '簡答：5。過程：除以 \\(2x-1\\) 代入 \\(x=\\frac12\\)，得 \\(f(3x)=f(\\frac32)\\)。而 \\(2x-3=0\\) 的根正是 \\(\\frac32\\)，所以餘式為 5。',
      },
      {
        q: '設 \\(f(x)=x^4+3x^2-2x-1\\)，求 \\(f(2x-3)\\) 除以 \\(2x-1\\) 的餘式。',
        a: '簡答：31。過程：代入 \\(x=\\frac12\\)，此時 \\(2x-3=-2\\)。所以餘式為 \\(f(-2)=16+12+4-1=31\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131SquareDivisorCalculationSet(count) {
    const templates = [
      {
        q: '求 \\(x^{12}\\) 除以 \\((x+1)^2\\) 的餘式。',
        a: '簡答：\\(-12x-11\\)。過程：設餘式 \\(ax+b\\)。在 \\(x=-1\\) 處函數值為 1，導數值為 \\(-12\\)，所以 \\(a=-12\\)，\\(-a+b=1\\)，得 \\(b=-11\\)。',
      },
      {
        q: '以 \\((x-1)^2\\) 除 \\(x^{100}+1\\) 的餘式為何？',
        a: "簡答：\\(100x-98\\)。過程：設餘式為 \\(ax+b\\)。由 \\(r(1)=2\\)、\\(r'(1)=100\\)，得 \\(a=100,b=-98\\)。",
      },
      {
        q: '設 \\(ax^8+bx^7+1\\) 能被 \\((x-1)^2\\) 整除，求 \\((a,b)\\)。',
        a: "簡答：\\((7,-8)\\)。過程：令 \\(P(x)=ax^8+bx^7+1\\)。整除表示 \\(P(1)=0\\)、\\(P'(1)=0\\)。因此 \\(a+b+1=0\\)、\\(8a+7b=0\\)，解得 \\((a,b)=(7,-8)\\)。",
      },
      {
        q: '設 \\((x+1)^n(x^2+ax+b)\\) 除以 \\((x-1)^2\\) 的餘式為 \\(2^n(x-1)\\)，求 \\(a,b\\)。',
        a: "簡答：\\(a=-1,b=0\\)。過程：在 \\(x=1\\) 比較函數值與導數值。\\(P(1)=0\\) 得 \\(1+a+b=0\\)；\\(P'(1)=2^n\\) 得 \\(2+a=1\\)。所以 \\(a=-1,b=0\\)。",
      },
      {
        q: '若 \\(f(x)\\) 除以 \\((x-1)^2\\) 餘 \\(3x+2\\)，除以 \\((x-2)^2\\) 餘 \\(5x-3\\)，求 \\(f(x)\\) 除以 \\((x-1)(x-2)\\) 的餘式。',
        a: '簡答：\\(2x+3\\)。過程：只需保留 \\(x=1,2\\) 的值。由第一個餘式得 \\(f(1)=5\\)，由第二個餘式得 \\(f(2)=7\\)。設餘式 \\(ax+b\\)，解 \\(a+b=5,2a+b=7\\)，得 \\(2x+3\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131SpecialXnRemainderSet(count) {
    const templates = [
      {
        q: '求 \\(x^{2000}-3x^{90}+5x^{18}-7\\) 除以 \\(x^3-1\\) 的餘式。',
        a: '簡答：\\(x^2-5\\)。過程：由 \\(x^3\\equiv1\\)，得 \\(x^{2000}\\equiv x^2\\)，\\(x^{90}\\equiv1\\)，\\(x^{18}\\equiv1\\)。所以餘式為 \\(x^2-3+5-7=x^2-5\\)。',
      },
      {
        q: '求 \\(x^{10}+2x^9+1\\) 除以 \\(x^2+x-2\\) 的餘式。',
        a: '簡答：\\(x+3\\)。過程：\\(x^2+x-2=(x-1)(x+2)\\)。設餘式 \\(ax+b\\)。代入 \\(x=1\\) 得值 4，代入 \\(x=-2\\) 得值 1，所以 \\(a+b=4\\)、\\(-2a+b=1\\)，解得 \\(a=1,b=3\\)。',
      },
      {
        q: '已知 \\(f(x)=x^{32}-3x^{24}+3x^{14}-2\\)，求其除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(-4x-9\\)。過程：由 \\(x^3\\equiv1\\)，得 \\(x^{32}\\equiv x^2\\)，\\(x^{24}\\equiv1\\)，\\(x^{14}\\equiv x^2\\)。所以餘式為 \\(4x^2-5\\equiv-4x-9\\)。',
      },
      {
        q: '求 \\(x^{2006}-1\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：\\(-x-2\\)。過程：由 \\(x^3\\equiv1\\)，且 \\(2006\\equiv2\\pmod3\\)，得 \\(x^{2006}-1\\equiv x^2-1\\equiv-x-2\\)。',
      },
      {
        q: '求 \\(x^8+x^4+1\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：0。過程：由 \\(x^3\\equiv1\\)，得 \\(x^8\\equiv x^2\\)、\\(x^4\\equiv x\\)。所以 \\(x^8+x^4+1\\equiv x^2+x+1=0\\)。',
      },
      {
        q: '求 \\(x^{100}+x^{50}+1\\) 除以 \\(x^2+x+1\\) 的餘式。',
        a: '簡答：0。過程：由 \\(x^3\\equiv1\\)，且 \\(100\\equiv1\\)、\\(50\\equiv2\\pmod3\\)，所以原式餘式為 \\(x+x^2+1=0\\)。',
      },
      {
        q: '求 \\(x^{81}+x^{49}+x^9\\) 除以 \\(x^2-x+1\\) 的餘式。',
        a: '簡答：\\(x-2\\)。過程：由 \\(x^2-x+1=0\\) 得 \\(x^3\\equiv-1\\)、\\(x^6\\equiv1\\)。因此 \\(x^{81}\\equiv x^3\\equiv-1\\)，\\(x^{49}\\equiv x\\)，\\(x^9\\equiv x^3\\equiv-1\\)，餘式為 \\(x-2\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131RecoverDividendFromQuotientSet(count) {
    const templates = [
      {
        q: '若多項式 \\(f(x)\\) 除以 \\(x-2\\) 的商式為 \\(x^2+2x-1\\)，餘式為 5，求 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=x^3-5x+7\\)。過程：由除法原理，\\(f(x)=(x-2)(x^2+2x-1)+5\\)。展開得 \\(x^3-5x+2+5=x^3-5x+7\\)。',
      },
      {
        q: '已知 \\(x^3+4x^2+7x+3\\) 除以 \\(f(x)\\) 的商式為 \\(x+2\\)，餘式為 \\(2x+1\\)，求 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=x^2+2x+1\\)。過程：由 \\(x^3+4x^2+7x+3=f(x)(x+2)+(2x+1)\\)，得 \\(f(x)(x+2)=x^3+4x^2+5x+2\\)。除以 \\(x+2\\) 得 \\(f(x)=x^2+2x+1\\)。',
      },
      {
        q: '設 \\(2x^3-3x^2+ax+10\\) 除以 \\(x^2-3x+b\\) 的商式為 \\(2x+c\\)，餘式為 \\(3x-2\\)，求數對 \\((a,b,c)\\)。',
        a: '簡答：\\((a,b,c)=(2,4,3)\\)。過程：由除法原理，\\(2x^3-3x^2+ax+10=(x^2-3x+b)(2x+c)+(3x-2)\\)。比較係數得 \\(c-6=-3\\)，所以 \\(c=3\\)；\\(bc-2=10\\)，所以 \\(b=4\\)；\\(a=2b-3c+3=2\\)。',
      },
      {
        q: '若 \\(f(x)=(2x^2+x-2)q(x)+(2x+3)\\)，且 \\(f(x)=4x^3-3x+5\\)，求 \\(q(x)\\)。',
        a: '簡答：\\(q(x)=2x-1\\)。過程：先移去餘式，\\((2x^2+x-2)q(x)=4x^3-3x+5-(2x+3)=4x^3-5x+2\\)。再除以 \\(2x^2+x-2\\)，得 \\(q(x)=2x-1\\)。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(x^2-x+1\\) 的商式為 \\(x^2+x+1\\)，餘式為 \\(x-1\\)，求 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=x^4+x^2+x\\)。過程：由除法原理，\\(f(x)=(x^2-x+1)(x^2+x+1)+(x-1)\\)。前一乘積為 \\(x^4+x^2+1\\)，再加上 \\(x-1\\)，得 \\(x^4+x^2+x\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131DivisibilityUnknownCoefficientSet(count) {
    const templates = [
      {
        q: '若 \\(x^3-3x^2+mx+2\\) 可被 \\(x^2+nx+1\\) 整除，求數對 \\((m,n)\\)。',
        a: '簡答：\\((m,n)=(-9,-5)\\)。過程：因為三次式除以二次式整除，商式可設為 \\(x+a\\)。比較常數項得 \\(a=2\\)。展開 \\((x^2+nx+1)(x+2)\\)，由 \\(x^2\\) 係數得 \\(n+2=-3\\)，所以 \\(n=-5\\)；一次項係數為 \\(2n+1=-9\\)，故 \\(m=-9\\)。',
      },
      {
        q: '已知 \\(2x^3-5x^2+8x+a\\) 是 \\(x^2-4x+b\\) 的倍式，求 \\(a,b\\) 之值。',
        a: '簡答：\\(a=30,b=10\\)。過程：商式設為 \\(2x+c\\)。展開 \\((x^2-4x+b)(2x+c)\\)，由 \\(x^2\\) 係數得 \\(c-8=-5\\)，所以 \\(c=3\\)。一次項係數 \\(2b-4c=8\\)，得 \\(b=10\\)。常數項 \\(bc=30\\)，所以 \\(a=30\\)。',
      },
      {
        q: '設 \\(x^4-2x^3+7x^2+ax+10\\) 可被 \\(x^2-2x+b\\) 整除，求 \\(a+b\\)。',
        a: '簡答：1。過程：商式設為 \\(x^2+px+q\\)。比較 \\(x^3\\) 係數得 \\(p=0\\)。再由 \\(x^2\\) 與常數項得 \\(q+b=7\\)、\\(bq=10\\)。取整數解 \\((b,q)=(5,2)\\)，一次項係數 \\(a=-2q+bp=-4\\)。所以 \\(a+b=1\\)。',
      },
      {
        q: '若 \\(x^3+ax^2+3x-2\\) 可被 \\(x^2-x+2\\) 整除，求 \\(a\\)。',
        a: '簡答：\\(a=-2\\)。過程：商式設為 \\(x+q\\)。展開 \\((x^2-x+2)(x+q)=x^3+(q-1)x^2+(2-q)x+2q\\)。由一次項 \\(2-q=3\\) 得 \\(q=-1\\)，所以 \\(a=q-1=-2\\)，常數項也為 \\(-2\\)，相符。',
      },
      {
        q: '判斷 \\(x^3+6x^2-x-30\\) 是否能被 \\(x+3\\) 整除，並求其商式。',
        a: '簡答：能，商式為 \\(x^2+3x-10\\)。過程：代入 \\(x=-3\\)，得 \\(-27+54+3-30=0\\)，所以可被 \\(x+3\\) 整除。綜合除法係數 \\(1,6,-1,-30\\) 除以 \\(-3\\)，得商式 \\(x^2+3x-10\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131DivisionPrincipleReverseTwoSubtypeMixedSet(count) {
    const banks = [buildS131RecoverDividendFromQuotientSet, buildS131DivisibilityUnknownCoefficientSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131InterpolationPolynomialFromPointsSet(count) {
    const templates = [
      {
        q: '求通過 \\((1,5),(2,6),(3,25)\\) 三點的最低次多項式 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=9x^2-26x+22\\)。過程：設 \\(f(x)=ax^2+bx+c\\)。代入三點得 \\(a+b+c=5\\)、\\(4a+2b+c=6\\)、\\(9a+3b+c=25\\)。相減得 \\(3a+b=1\\)、\\(5a+b=19\\)，所以 \\(a=9,b=-26,c=22\\)。',
      },
      {
        q: '已知三次多項式 \\(f(x)\\) 滿足 \\(f(1)=7,f(2)=6,f(3)=11,f(4)=28\\)，求 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=x^3-3x^2+x+8\\)。過程：設 \\(f(x)=ax^3+bx^2+cx+d\\)。代入四個條件並相減，可得三階差為 6，所以 \\(a=1\\)。再解得 \\(b=-3,c=1,d=8\\)。',
      },
      {
        q: '求通過 \\((11,3),(12,5),(13,8)\\) 三點的最低次多項式。',
        a: '簡答：\\(f(x)=\\frac12(x-11)^2+\\frac32(x-11)+3\\)。過程：令 \\(t=x-11\\)，三點變成 \\((0,3),(1,5),(2,8)\\)。設 \\(f=at^2+bt+c\\)，得 \\(c=3\\)、\\(a+b=2\\)、\\(4a+2b=5\\)，所以 \\(a=\\frac12,b=\\frac32\\)。',
      },
      {
        q: '已知三次多項式圖形經過 \\((-1,1),(0,5),(1,3),(2,1)\\)，求此多項式。',
        a: '簡答：\\(f(x)=\\frac23x^3-3x^2-\\frac83x+5\\)。過程：設 \\(f(x)=ax^3+bx^2+cx+d\\)。由 \\(f(0)=5\\) 得 \\(d=5\\)。代入其餘三點解聯立，可得 \\(a=\\frac23,b=-3,c=-\\frac83\\)。',
      },
      {
        q: '求通過 \\((997,3),(999,-2),(1001,1)\\) 三點的二次多項式。',
        a: '簡答：\\(f(x)=(x-999)^2-\\frac12(x-999)-2\\)。過程：令 \\(t=\\frac{x-999}{2}\\)，三點變成 \\((-1,3),(0,-2),(1,1)\\)。設 \\(f=at^2+bt+c\\)，得 \\(c=-2\\)、\\(a-b=5\\)、\\(a+b=3\\)，所以 \\(a=4,b=-1\\)。換回 \\(x\\) 得答案。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131InterpolationValueOnlySet(count) {
    const templates = [
      {
        q: '設 \\(f(x)\\) 為二次多項式，且 \\(f(11)=6,f(12)=11,f(13)=10\\)，求 \\(f(14)\\) 之值。',
        a: '簡答：3。過程：相鄰一次差為 5、-1，所以二次差為 -6。下一個一次差為 \\(-1-6=-7\\)，因此 \\(f(14)=10-7=3\\)。',
      },
      {
        q: '設 \\(f(x)\\) 為二次多項式，且 \\(f(11)=6,f(12)=11,f(13)=10\\)，求 \\(f(0)\\) 之值。',
        a: '簡答：-445。過程：令 \\(t=x-11\\)，則 \\(f=-3t^2+8t+6\\)。當 \\(x=0\\) 時 \\(t=-11\\)，所以 \\(f(0)=-3(121)+8(-11)+6=-445\\)。',
      },
      {
        q: '設 \\(f(x)\\) 為二次多項式，滿足 \\(f(-1)=3,f(1)=1,f(2)=3\\)，求 \\(f(3)\\)。',
        a: '簡答：7。過程：設 \\(f(x)=ax^2+bx+c\\)。由三個條件解得 \\(a=1,b=-1,c=1\\)，所以 \\(f(3)=9-3+1=7\\)。',
      },
      {
        q: '已知二次多項式滿足 \\(f(1)=1,f(2)=4,f(3)=9\\)，求 \\(f(4)\\)。',
        a: '簡答：16。過程：這三點符合 \\(f(x)=x^2\\)。也可看一次差為 3、5，二次差為 2，所以下一個一次差為 7，\\(f(4)=9+7=16\\)。',
      },
      {
        q: '設 \\(f(x)\\) 為三次多項式，已知 \\(f(1)=f(2)=f(3)=2\\)，且 \\(f(0)=-16\\)，求 \\(f(5)\\)。',
        a: '簡答：74。過程：因為 \\(f(x)-2\\) 在 \\(1,2,3\\) 都為 0，故 \\(f(x)=2+k(x-1)(x-2)(x-3)\\)。代入 \\(x=0\\) 得 \\(2-6k=-16\\)，所以 \\(k=3\\)。因此 \\(f(5)=2+3\\cdot4\\cdot3\\cdot2=74\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131InterpolationStructuralRemainderSet(count) {
    const templates = [
      {
        q: '設三次多項式 \\(f(x)\\)，已知 \\(f(1)=f(2)=f(3)=4\\)，且 \\(f(-1)=-44\\)，求 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=2x^3-12x^2+22x-8\\)。過程：因為 \\(f(x)-4\\) 在 \\(1,2,3\\) 都為 0，設 \\(f(x)=4+k(x-1)(x-2)(x-3)\\)。代入 \\(x=-1\\)，得 \\(4-24k=-44\\)，所以 \\(k=2\\)，展開即得答案。',
      },
      {
        q: '已知 \\(f(x)\\) 除以 \\(x-1,x-2,x-3\\) 的餘式分別為 5,10,17，求除以 \\((x-1)(x-2)(x-3)\\) 的餘式 \\(r(x)\\)。',
        a: '簡答：\\(r(x)=x^2+2x+2\\)。過程：餘式 \\(r(x)\\) 的次數小於 3，且 \\(r(1)=5,r(2)=10,r(3)=17\\)。設 \\(r=ax^2+bx+c\\)，解得 \\(a=1,b=2,c=2\\)。',
      },
      {
        q: '設 \\(f(x)\\) 為三次多項式，若 \\(f(1)=f(2)=0,f(3)=-4,f(4)=-6\\)，求 \\(f(5)\\)。',
        a: '簡答：0。過程：由 \\(f(1)=f(2)=0\\)，設 \\(f(x)=(x-1)(x-2)(ax+b)\\)。代入 \\(x=3,4\\)，得 \\(3a+b=-2\\)、\\(4a+b=-1\\)，所以 \\(a=1,b=-5\\)。代入 \\(x=5\\) 得 0。',
      },
      {
        q: '設 \\(f(x)\\) 為二次多項式，且 \\(f(2)=9,f(-1)=0,f(4)=5\\)，求 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=-\\frac43x^2+5x+\\frac{19}{3}\\)。過程：設 \\(f(x)=ax^2+bx+c\\)。代入三點得 \\(4a+2b+c=9\\)、\\(a-b+c=0\\)、\\(16a+4b+c=5\\)，解得 \\(a=-\\frac43,b=5,c=\\frac{19}{3}\\)。',
      },
      {
        q: '已知三次多項式 \\(f(x)\\) 滿足 \\(f(1)=f(2)=f(3)=5\\)，且 \\(f(4)=44\\)，求 \\(f(0)\\)。',
        a: '簡答：-34。過程：設 \\(f(x)=5+k(x-1)(x-2)(x-3)\\)。代入 \\(x=4\\) 得 \\(5+6k=44\\)，所以 \\(k=\\frac{13}{2}\\)。代入 \\(x=0\\)，得 \\(5-6\\cdot\\frac{13}{2}=-34\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131InterpolationFiniteDifferenceSet(count) {
    const templates = [
      {
        q: '二次函數 \\(f(x)\\) 滿足 \\(f(1)=3,f(2)=2,f(3)=7\\)，利用階差求 \\(f(4)\\)。',
        a: '簡答：18。過程：一次差為 \\(-1,5\\)，二次差為 6。下一個一次差為 \\(5+6=11\\)，所以 \\(f(4)=7+11=18\\)。',
      },
      {
        q: '三次函數 \\(f(x)\\) 滿足 \\(f(10)=3,f(20)=2,f(30)=7,f(40)=5\\)，求 \\(f(50)\\)。',
        a: '簡答：-17。過程：因為輸入值等差，可用階差。一次差為 \\(-1,5,-2\\)，二次差為 \\(6,-7\\)，三次差為 -13。下一個二次差為 \\(-20\\)，下一個一次差為 \\(-22\\)，所以 \\(f(50)=5-22=-17\\)。',
      },
      {
        q: '三次多項式 \\(f(2001)=7,f(2002)=9,f(2003)=13,f(2004)=31\\)，求 \\(f(2005)\\)。',
        a: '簡答：75。過程：一次差為 2,4,18，二次差為 2,14，三次差為 12。下一個二次差為 26，下一個一次差為 44，所以 \\(f(2005)=31+44=75\\)。',
      },
      {
        q: '已知 \\(f(-2)=13,f(-1)=9,f(0)=5,f(1)=7\\)，利用等差插值求 \\(f(2)\\)。',
        a: '簡答：21。過程：一次差為 -4,-4,2，二次差為 0,6，三次差為 6。下一個二次差為 12，下一個一次差為 14，所以 \\(f(2)=7+14=21\\)。',
      },
      {
        q: '若二次多項式 \\(f(x)\\) 滿足 \\(f(1)=2,f(2)=5,f(3)=10\\)，利用階差預測 \\(f(4)\\)。',
        a: '簡答：17。過程：一次差為 3,5，二次差為 2。下一個一次差為 \\(5+2=7\\)，所以 \\(f(4)=10+7=17\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131InterpolationLagrangeSpecialSet(count) {
    const templates = [
      {
        q: '設 \\(a,b,c\\) 相異，令 \\(f(x)=\\frac{(x-a)(x-b)}{(c-a)(c-b)}+\\frac{(x-b)(x-c)}{(a-b)(a-c)}+\\frac{(x-c)(x-a)}{(b-c)(b-a)}\\)。證明 \\(f(x)=1\\)，並求 \\(f(2000)\\)。',
        a: '簡答：\\(f(x)=1\\)，\\(f(2000)=1\\)。過程：此式是通過 \\((a,1),(b,1),(c,1)\\) 的二次以下插值多項式。常數多項式 1 也通過這三點，由唯一性可知 \\(f(x)=1\\)。',
      },
      {
        q: '給定三點 \\((4,5),(6,7),(8,9)\\)，求其插值多項式並解釋為何退化為一次式。',
        a: '簡答：\\(f(x)=x+1\\)。過程：三點都在直線 \\(y=x+1\\) 上。雖然用三點可求二次以下插值多項式，但二次項係數為 0，因此退化為一次式。',
      },
      {
        q: '設 \\(f(x)=2\\cdot\\frac{(x-\\sqrt3)(x-\\sqrt5)}{(\\sqrt2-\\sqrt3)(\\sqrt2-\\sqrt5)}+3\\cdot\\frac{(x-\\sqrt2)(x-\\sqrt5)}{(\\sqrt3-\\sqrt2)(\\sqrt3-\\sqrt5)}+5\\cdot\\frac{(x-\\sqrt2)(x-\\sqrt3)}{(\\sqrt5-\\sqrt2)(\\sqrt5-\\sqrt3)}\\)，求 \\(f(\\sqrt{179})\\)。',
        a: '簡答：179。過程：此拉格朗日式通過 \\((\\sqrt2,2),(\\sqrt3,3),(\\sqrt5,5)\\)。二次多項式 \\(x^2\\) 也通過這三點，因此由唯一性 \\(f(x)=x^2\\)，所以 \\(f(\\sqrt{179})=179\\)。',
      },
      {
        q: '若多項式 \\(f(x)\\) 次數不超過 100，且 \\(f(1)=1,f(2)=\\frac12,\\ldots,f(101)=\\frac1{101}\\)，利用結構化列式求 \\(f(102)\\)。',
        a: '簡答：\\(\\frac1{51}\\)。過程：令 \\(P(x)=xf(x)-1\\)，則 \\(P(1),P(2),\\ldots,P(101)\\) 都為 0，且 \\(P(x)\\) 次數不超過 101。又 \\(P(0)=-1\\)，可得 \\(P(x)=\\frac{(x-1)(x-2)\\cdots(x-101)}{101!}\\)。因此 \\(102f(102)-1=P(102)=1\\)，所以 \\(f(102)=\\frac2{102}=\\frac1{51}\\)。',
      },
      {
        q: '若多項式 \\(f(x)\\) 滿足 \\(f(1)=1,f(2)=4,f(3)=9\\)，判斷 \\(f(x)-x^2\\) 是否有因式 \\((x-1)(x-2)(x-3)\\)。',
        a: '簡答：有。過程：令 \\(g(x)=f(x)-x^2\\)。由題意得 \\(g(1)=0,g(2)=0,g(3)=0\\)，所以 \\(x-1,x-2,x-3\\) 都是因式，因此 \\((x-1)(x-2)(x-3)\\) 為因式。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function formatShiftBase(h) {
    return h === 0 ? 'x' : h > 0 ? `x-${h}` : `x+${-h}`;
  }

  function formatSignedNumber(value) {
    return value >= 0 ? `+${value}` : `-${Math.abs(value)}`;
  }

  function buildS131OddEvenValueRelationSet(count) {
    const questions = [];
    const answers = [];

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
      questions.push(
        `設 \\(g(x)\\) 為只含奇次項的多項式，且 \\(f(x)=g(x)${c >= 0 ? '+' : ''}${c}\\)。若 \\(f(-${t})=${given}\\)，求 \\(f(${t})\\)。`
      );
      answers.push(
        `簡答：\\(${target}\\)。過程：因 \\(g(-x)=-g(x)\\)，所以 \\(f(${t})+f(-${t})=2\\cdot${c}\\)。故 \\(f(${t})=2\\cdot${c}-(${given})=${target}\\)。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS131ShiftedBasisCoefficientsSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const h = randInt(-3, 4);
      const p = pickNonZero(-3, 3);
      const q = randInt(-5, 5);
      const r = randInt(-6, 6);
      const s = randInt(-8, 8);
      const coeffs = [
        p,
        q - 3 * p * h,
        3 * p * h * h - 2 * q * h + r,
        -p * h ** 3 + q * h ** 2 - r * h + s,
      ];
      const expanded = formatPolynomialFromCoeffs(coeffs);
      const base = formatShiftBase(h);

      questions.push(
        `已知 \\(f(x)=${expanded}\\)，若 \\(f(x)=a(${base})^3+b(${base})^2+c(${base})+d\\)，求 \\((a,b,c,d)\\)。`
      );
      answers.push(
        `簡答：\\((a,b,c,d)=(${p},${q},${r},${s})\\)。過程：將多項式改用 \\(${base}\\) 作基準，原式可寫成 \\(${p}(${base})^3${q >= 0 ? '+' : ''}${q}(${base})^2${r >= 0 ? '+' : ''}${r}(${base})${s >= 0 ? '+' : ''}${s}\\)，所以係數依序為 \\(${p},${q},${r},${s}\\)。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132GeneralVertexConversionSet(count) {
    const templates = [
      {
        q: '求 \\(f(x)=2x^2-4x+5\\) 的頂點坐標及對稱軸。',
        a: '簡答：頂點 \\((1,3)\\)，對稱軸 \\(x=1\\)。過程：配方得 \\(2x^2-4x+5=2(x-1)^2+3\\)。所以頂點為 \\((1,3)\\)，對稱軸為 \\(x=1\\)。',
      },
      {
        q: '將 \\(y=-2x^2+12x-17\\) 化為頂點式，並判定開口方向。',
        a: '簡答：\\(y=-2(x-3)^2+1\\)，開口向下。過程：\\(-2x^2+12x-17=-2(x^2-6x)-17=-2[(x-3)^2-9]-17=-2(x-3)^2+1\\)。因為二次項係數為負，所以開口向下。',
      },
      {
        q: '求二次函數 \\(y=9x^2-36x+6\\) 的最低點坐標。',
        a: '簡答：\\((2,-30)\\)。過程：配方得 \\(9x^2-36x+6=9(x-2)^2-30\\)。因為 \\(9>0\\)，圖形開口向上，最低點為頂點 \\((2,-30)\\)。',
      },
      {
        q: '已知二次函數頂點為 \\((1,-7)\\)，且通過 \\((-1,1)\\)，求其一般式。',
        a: '簡答：\\(y=2x^2-4x-5\\)。過程：設 \\(y=a(x-1)^2-7\\)。代入 \\((-1,1)\\)，得 \\(1=4a-7\\)，所以 \\(a=2\\)。展開得 \\(y=2x^2-4x-5\\)。',
      },
      {
        q: '已知二次函數的對稱軸為 \\(x=1\\)，且圖形通過 \\((2,6)\\) 與 \\((-1,12)\\)，求函數式。',
        a: '簡答：\\(y=2x^2-4x+6\\)。過程：設 \\(y=a(x-1)^2+k\\)。代入 \\((2,6)\\) 得 \\(a+k=6\\)，代入 \\((-1,12)\\) 得 \\(4a+k=12\\)。相減得 \\(3a=6\\)，所以 \\(a=2,k=4\\)，展開為 \\(2x^2-4x+6\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132QuadraticFromConditionsSet(count) {
    const templates = [
      {
        q: '求通過 \\(A(-2,11),B(-1,1),C(2,-5)\\) 三點的二次函數。',
        a: '簡答：\\(y=2x^2-4x-5\\)。過程：設 \\(y=ax^2+bx+c\\)。代入三點得 \\(4a-2b+c=11\\)、\\(a-b+c=1\\)、\\(4a+2b+c=-5\\)。解得 \\(a=2,b=-4,c=-5\\)。',
      },
      {
        q: '以 \\((2,3)\\) 為頂點，且通過點 \\((3,1)\\)，求 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=-2(x-2)^2+3\\)。過程：設頂點式 \\(f(x)=a(x-2)^2+3\\)。代入 \\((3,1)\\)，得 \\(1=a+3\\)，所以 \\(a=-2\\)。',
      },
      {
        q: '函數圖形與 \\(x\\) 軸交於 \\((-4,0)\\) 與 \\((1,0)\\)，且 \\(y\\) 截距為 2，求此二次函數。',
        a: '簡答：\\(y=-\\frac12(x+4)(x-1)\\)。過程：由兩個 \\(x\\) 截距可設 \\(y=a(x+4)(x-1)\\)。代入 \\(x=0,y=2\\)，得 \\(-4a=2\\)，所以 \\(a=-\\frac12\\)。',
      },
      {
        q: '圖形最高點坐標為 \\((2,3)\\)，且通過 \\((0,-1)\\)，求其方程式。',
        a: '簡答：\\(y=-(x-2)^2+3\\)。過程：設 \\(y=a(x-2)^2+3\\)。代入 \\((0,-1)\\)，得 \\(-1=4a+3\\)，所以 \\(a=-1\\)。',
      },
      {
        q: '二次函數圖形通過 \\((1,1),(3,1)\\) 兩點，且頂點的 \\(y\\) 坐標為 5，求此函數。',
        a: '簡答：\\(y=-4(x-2)^2+5\\)。過程：兩點 \\((1,1),(3,1)\\) 關於對稱軸對稱，所以對稱軸為 \\(x=2\\)。頂點為 \\((2,5)\\)，設 \\(y=a(x-2)^2+5\\)。代入 \\((1,1)\\)，得 \\(1=a+5\\)，所以 \\(a=-4\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132ParabolaSymmetryPointSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-4, 4);
      const h = randInt(-4, 5);
      const k = randInt(-6, 6);
      let x = h + pickNonZero(-5, 5);
      if (x === h) x += 1;
      const y = a * (x - h) ** 2 + k;
      const mirrorX = 2 * h - x;
      const base = formatShiftBase(h);
      const vertexForm = `${a}(${base})^2${k >= 0 ? '+' : ''}${k}`;

      questions.push(
        `二次函數 \\(\\Gamma:y=${vertexForm}\\) 上有一點 \\(P(${x},${y})\\)。利用圖形對稱性，求另一個與 \\(P\\) 對稱且也在 \\(\\Gamma\\) 上的點坐標。`
      );
      answers.push(
        `簡答：\\((${mirrorX},${y})\\)。過程：\\(\\Gamma\\) 的對稱軸為 \\(x=${h}\\)，所以對稱點的 \\(x\\) 坐標為 \\(2\\cdot(${h})-(${x})=${mirrorX}\\)，\\(y\\) 坐標不變。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132QuadraticAxisTwoPointsSet(count) {
    const questions = [];
    const answers = [];

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
      const vertex = `${a}(${base})^2${k >= 0 ? '+' : ''}${k}`;

      questions.push(
        `已知二次函數 \\(f(x)\\) 的對稱軸為 \\(x=${h}\\)，且圖形通過 \\((${x1},${y1})\\)、\\((${x2},${y2})\\) 兩點，求 \\(f(x)\\)。`
      );
      answers.push(
        `簡答：\\(f(x)=${vertex}\\)，一般式為 \\(${general}\\)。過程：設 \\(f(x)=A(${base})^2+B\\)。代入兩點得 \\(A=${a}\\)、\\(B=${k}\\)，因此 \\(f(x)=${vertex}\\)。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132CubicCenterStandardFormSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-3, 3);
      const h = randInt(-3, 4);
      const p = pickNonZero(-6, 6);
      const q = randInt(-8, 8);
      const coeffs = [
        a,
        -3 * a * h,
        3 * a * h * h + p,
        -a * h ** 3 - p * h + q,
      ];
      const expanded = formatPolynomialFromCoeffs(coeffs);
      const base = formatShiftBase(h);
      const shifted = `${a}(${base})^3${p >= 0 ? '+' : ''}${p}(${base})${q >= 0 ? '+' : ''}${q}`;

      questions.push(
        `已知三次函數 \\(f(x)=${expanded}\\)。將它改寫成 \\(A(${base})^3+B(${base})+C\\)，並求圖形的對稱中心。`
      );
      answers.push(
        `簡答：\\(f(x)=${shifted}\\)，對稱中心為 \\((${h},${q})\\)。過程：三次函數若寫成 \\(A(x-h)^3+B(x-h)+C\\)，中心即為 \\((h,C)\\)。本題 \\(h=${h},C=${q}\\)。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132CubicCenterFormEvaluationSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;
      const a = pickNonZero(-3, 3);
      const h = randInt(-3, 4);
      const p = pickNonZero(-6, 6);
      const q = randInt(-8, 8);
      const coeffs = [
        a,
        -3 * a * h,
        3 * a * h * h + p,
        -a * h ** 3 - p * h + q,
      ];
      const expanded = formatPolynomialFromCoeffs(coeffs);
      const base = formatShiftBase(h);
      const shifted = `${a}(${base})^3${p >= 0 ? '+' : ''}${p}(${base})${q >= 0 ? '+' : ''}${q}`;

      if (type === 0) {
        const t = randInt(1, 4);
        const targetX = h + t;
        const value = a * t ** 3 + p * t + q;
        questions.push(`已知 \\(f(x)=${expanded}\\)，利用中心式求 \\(f(${targetX})\\)。`);
        answers.push(
          `簡答：${value}。過程：先改寫為 \\(f(x)=${shifted}\\)。當 \\(x=${targetX}\\) 時，\\(${base}=${t}\\)，所以 \\(f(${targetX})=${a}\\cdot${t}^3${formatSignedNumber(p)}\\cdot${t}${formatSignedNumber(q)}=${value}\\)。`
        );
        continue;
      }

      if (type === 1) {
        const t = -randInt(1, 4);
        const targetX = h + t;
        const value = a * t ** 3 + p * t + q;
        questions.push(`已知 \\(f(x)=${expanded}\\)，將它改成 \\(${base}\\) 附近的形式後，求 \\(f(${targetX})\\)。`);
        answers.push(
          `簡答：${value}。過程：\\(f(x)=${shifted}\\)。代入 \\(x=${targetX}\\)，有 \\(${base}=${t}\\)，所以函數值為 \\(${a}(${t})^3${formatSignedNumber(p)}(${t})${formatSignedNumber(q)}=${value}\\)。`
        );
        continue;
      }

      if (type === 2) {
        const t = 0.01;
        const targetX = Number((h + t).toFixed(2));
        const value = a * t ** 3 + p * t + q;
        questions.push(`已知 \\(f(x)=${expanded}\\)。將 \\(f(x)\\) 改寫成中心式後，估計 \\(f(${targetX.toFixed(2)})\\) 到小數點後四位。`);
        answers.push(
          `簡答：約 ${trimFixed(value, 4)}。過程：\\(f(x)=${shifted}\\)。當 \\(x=${targetX.toFixed(2)}\\) 時，\\(${base}=0.01\\)，所以 \\(f(x)=${q}${formatSignedNumber(p)}(0.01)${formatSignedNumber(a)}(0.01)^3\\approx${trimFixed(value, 4)}\\)。`
        );
        continue;
      }

      if (type === 3) {
        const t = randInt(1, 3);
        const y1 = a * t ** 3 + p * t + q;
        const y2 = a * (-t) ** 3 + p * (-t) + q;
        questions.push(`三次函數 \\(f(x)=${expanded}\\) 的中心為何？並求 \\(f(${h + t})+f(${h - t})\\)。`);
        answers.push(
          `簡答：中心 \\((${h},${q})\\)，和為 ${2 * q}。過程：中心式為 \\(f(x)=${shifted}\\)，所以中心是 \\((${h},${q})\\)。對稱點的函數值和等於兩倍中心的 \\(y\\) 坐標，故 \\(f(${h + t})+f(${h - t})=${y1}+${y2}=2\\cdot${q}=${2 * q}\\)。`
        );
        continue;
      }

      const t = randInt(1, 4);
      const value = a * t ** 3 + p * t + q;
      questions.push(`已知 \\(f(x)=${shifted}\\)。若 \\(f(${h + t})=${value}\\)，請檢查由一般式 \\(${expanded}\\) 代入是否一致。`);
      answers.push(
        `簡答：一致，函數值為 ${value}。過程：中心式中 \\(${base}=${t}\\)，所以 \\(f(${h + t})=${a}\\cdot${t}^3+${p}\\cdot${t}+${q}=${value}\\)。中心式與一般式是同一個多項式，代入一般式也必得相同結果。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132RestrictedRangeExtremaSet(count) {
    const templates = [
      {
        q: '設 \\(f(x)=x^2-2x-4\\)，在 \\(-3\\le x\\le3\\) 範圍內求最大值與最小值。',
        a: '簡答：最大值 11，最小值 -5。過程：配方得 \\(f(x)=(x-1)^2-5\\)，頂點 \\((1,-5)\\) 在區間內，所以最小值為 -5。端點值 \\(f(-3)=11,f(3)=-1\\)，所以最大值為 11。',
      },
      {
        q: '當 \\(0\\le x\\le3\\) 時，求 \\(f(x)=x^2-4x+2\\) 的最大值與最小值。',
        a: '簡答：最大值 2，最小值 -2。過程：\\(f(x)=(x-2)^2-2\\)，頂點在區間內，最小值為 -2。端點值 \\(f(0)=2,f(3)=-1\\)，所以最大值為 2。',
      },
      {
        q: '若 \\(f(x)=-2x^2+4x+3\\)，在 \\(2\\le x\\le4\\) 範圍內的最大值為何？最小值為何？',
        a: '簡答：最大值 3，最小值 -13。過程：\\(f(x)=-2(x-1)^2+5\\)。區間 \\([2,4]\\) 在頂點右側，函數遞減，所以最大值在 \\(x=2\\)，為 3；最小值在 \\(x=4\\)，為 -13。',
      },
      {
        q: '已知二次函數在 \\(x=-1\\) 時有最小值 \\(\\frac34\\)，且通過 \\((0,1)\\)，求該函數。',
        a: '簡答：\\(y=\\frac14(x+1)^2+\\frac34\\)。過程：設 \\(y=a(x+1)^2+\\frac34\\)。代入 \\((0,1)\\)，得 \\(1=a+\\frac34\\)，所以 \\(a=\\frac14\\)。',
      },
      {
        q: '討論 \\(y=a(x-1)^2+b\\) 在滿足 \\(f(4)>4\\) 且 \\(f(5)<0\\) 時，\\(a,b\\) 的可能範圍。',
        a: '簡答：\\(a<-\\frac47\\)，且 \\(4-9a<b<-16a\\)。過程：\\(f(4)=9a+b>4\\)，得 \\(b>4-9a\\)；\\(f(5)=16a+b<0\\)，得 \\(b<-16a\\)。要同時成立，需 \\(4-9a<-16a\\)，所以 \\(a<-\\frac47\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132QuadraticDiscriminantSignSet(count) {
    const templates = [
      {
        q: '若 \\(f(x)=ax^2+2x+a\\) 的值恆為正，求實數 \\(a\\) 的範圍。',
        a: '簡答：\\(a>1\\)。過程：二次式恆為正需開口向上且無實根，所以 \\(a>0\\) 且判別式 \\(D=2^2-4a^2<0\\)。得 \\(|a|>1\\)，合併 \\(a>0\\)，所以 \\(a>1\\)。',
      },
      {
        q: '對所有實數 \\(x\\)，不等式 \\(kx^2+2x+k<0\\) 恆成立，求 \\(k\\) 的範圍。',
        a: '簡答：\\(k<-1\\)。過程：二次式恆小於 0 需開口向下且無實根，所以 \\(k<0\\) 且 \\(D=4-4k^2<0\\)。得 \\(|k|>1\\)，合併 \\(k<0\\)，所以 \\(k<-1\\)。',
      },
      {
        q: '已知 \\(x^2+ax+(a+1)<0\\) 無實數解，求 \\(a\\) 的範圍。',
        a: '簡答：\\(2-2\\sqrt2\\le a\\le2+2\\sqrt2\\)。過程：開口向上，若小於 0 無解，表示整個圖形不低於 \\(x\\) 軸，所以判別式 \\(D\\le0\\)。\\(a^2-4(a+1)\\le0\\)，即 \\(a^2-4a-4\\le0\\)，解得範圍。',
      },
      {
        q: '若二次函數 \\(y=ax^2+2x+a\\) 的圖形恆在直線 \\(y=x-3\\) 下方，求 \\(a\\) 的範圍。',
        a: '簡答：\\(a<\\frac{-3-\\sqrt{10}}{2}\\)。過程：恆在下方表示 \\(ax^2+2x+a<x-3\\)，即 \\(ax^2+x+a+3<0\\) 對所有實數成立。需 \\(a<0\\) 且 \\(D=1-4a(a+3)<0\\)。解得 \\(a<\\frac{-3-\\sqrt{10}}{2}\\)。',
      },
      {
        q: '二次不等式 \\((2a-3)x^2+2ax+(a+2)\\ge0\\) 的解為全體實數，求 \\(a\\) 的範圍。',
        a: '簡答：\\(a\\ge2\\)。過程：要對所有實數皆非負，需二次項係數為正且判別式不大於 0。\\(2a-3>0\\)，且 \\((2a)^2-4(2a-3)(a+2)\\le0\\)。化簡得 \\(a^2+a-6\\ge0\\)，合併可得 \\(a\\ge2\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132LeastSquaresMinimumSet(count) {
    const templates = [
      {
        q: '設 \\(g(x)=(x-1)^2+2(x-2)^2+\\cdots+10(x-10)^2\\)，求 \\(g(x)\\) 有最小值時的 \\(x\\)。',
        a: '簡答：\\(x=7\\)。過程：平方和 \\(\\sum w_i(x-t_i)^2\\) 的最小值出現在加權平均 \\(x=\\frac{\\sum w_it_i}{\\sum w_i}\\)。本題為 \\(\\frac{1^2+2^2+\\cdots+10^2}{1+2+\\cdots+10}=\\frac{385}{55}=7\\)。',
      },
      {
        q: '已知 \\(f(x)=(x-1)^2+3(x-2)^2+(x-3)^2\\)，求使 \\(f(x)\\) 最小的 \\(x\\)。',
        a: '簡答：\\(x=2\\)。過程：最小值出現在加權平均 \\(x=\\frac{1\\cdot1+3\\cdot2+1\\cdot3}{1+3+1}=\\frac{10}{5}=2\\)。',
      },
      {
        q: '求 \\((x-2)^2+(x-6)^2\\) 有最小值時的 \\(x\\)。',
        a: '簡答：\\(x=4\\)。過程：兩個平方距離和的最小值出現在兩點的平均，\\(x=\\frac{2+6}{2}=4\\)。',
      },
      {
        q: '求 \\(2(x+1)^2+3(x-4)^2\\) 有最小值時的 \\(x\\)。',
        a: '簡答：\\(x=2\\)。過程：把 \\((x+1)^2\\) 視為距離 \\(-1\\) 的平方，最小值出現在加權平均 \\(x=\\frac{2(-1)+3(4)}{2+3}=2\\)。',
      },
      {
        q: '若 \\(h(x)=3(x-a)^2+(x-b)^2\\)，求 \\(h(x)\\) 最小時的 \\(x\\)。',
        a: '簡答：\\(x=\\frac{3a+b}{4}\\)。過程：平方和最小值出現在加權平均，\\(x=\\frac{3a+1b}{3+1}=\\frac{3a+b}{4}\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132QuadraticModelApplicationsSet(count) {
    const templates = [
      {
        q: '電影院票價 120 元時平均 500 人，票價每減 5 元增加 50 人，求最高收入的訂價。',
        a: '簡答：85 元。過程：設降價 \\(x\\) 次，每次 5 元，收入 \\(R=(120-5x)(500+50x)=-250x^2+3500x+60000\\)。頂點在 \\(x=\\frac{-3500}{2(-250)}=7\\)，所以票價為 \\(120-5\\cdot7=85\\) 元。',
      },
      {
        q: '一條 100 公尺的繩子在河岸邊圍成一個矩形菜園，若靠河的一邊不用圍籬，最大面積為何？',
        a: '簡答：1250 平方公尺。過程：設垂直河岸的邊長為 \\(x\\)，則平行河岸的邊長為 \\(100-2x\\)。面積 \\(A=x(100-2x)=-2x^2+100x\\)，頂點在 \\(x=25\\)，最大面積為 \\(25\\cdot50=1250\\)。',
      },
      {
        q: '在牆邊用圍籬圍出 3 間相等的矩形雞圈，牆邊不用圍，圍籬長 48 公尺，求總面積最大值。',
        a: '簡答：144 平方公尺。過程：設每間雞圈的深度為 \\(x\\)，總寬為 \\(y\\)。需要的圍籬為 \\(4x+y=48\\)，總面積 \\(A=xy=x(48-4x)=-4x^2+48x\\)。頂點在 \\(x=6\\)，此時 \\(y=24\\)，最大面積為 144。',
      },
      {
        q: '拋物線噴泉的水柱以地面為 \\(x\\) 軸，最高點離牆 1 公尺，且在離牆 3 公尺處落地；若水柱在牆邊高度為 2 公尺，求最高點高度。',
        a: '簡答：\\(\\frac83\\) 公尺。過程：設 \\(y=a(x-1)^2+k\\)。落地點 \\((3,0)\\) 給 \\(0=4a+k\\)，牆邊點 \\((0,2)\\) 給 \\(2=a+k\\)。相減得 \\(a=-\\frac23\\)，所以 \\(k=\\frac83\\)。最高點高度為 \\(\\frac83\\) 公尺。',
      },
      {
        q: '某商品進價 8 元，定價 20 元時賣 100 個；售價每降 1 元多賣 25 個，求最大利潤。',
        a: '簡答：1600 元。過程：設降價 \\(x\\) 元，利潤 \\(P=(20-x-8)(100+25x)=(12-x)(100+25x)=-25x^2+200x+1200\\)。頂點在 \\(x=4\\)，最大利潤為 \\((8)(200)=1600\\) 元。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132QuadraticFormGraphThreeSubtypeMixedSet(count) {
    const banks = [
      buildS132GeneralVertexConversionSet,
      buildS132QuadraticFromConditionsSet,
      buildS132RestrictedRangeExtremaSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132QuadraticInequalityExtremaApplicationThreeSubtypeMixedSet(count) {
    const banks = [
      buildS132QuadraticDiscriminantSignSet,
      buildS132LeastSquaresMinimumSet,
      buildS132QuadraticModelApplicationsSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132QuadraticTransformationsSet(count) {
    const templates = [
      {
        q: '將 \\(y=2x^2-4x+5\\) 的圖形向左平移 3 單位，再向上平移 \\(k\\) 單位，所得新圖形為 \\(y=2x^2+8x+17\\)，求 \\(k\\)。',
        a: '簡答：\\(k=6\\)。過程：向左平移 3 單位是把 \\(x\\) 換成 \\(x+3\\)，得 \\(2(x+3)^2-4(x+3)+5=2x^2+8x+11\\)。再向上平移 \\(k\\) 單位為 \\(2x^2+8x+11+k\\)，與 \\(2x^2+8x+17\\) 比較得 \\(k=6\\)。',
      },
      {
        q: '已知二次函數 \\(y=x^2-2x\\)，沿 \\(x\\) 軸平移 \\(h\\)，沿 \\(y\\) 軸平移 \\(k\\) 後，與 \\(y=x^2+3x+2\\) 重合，求數對 \\((h,k)\\)。',
        a: '簡答：\\((h,k)=(-\\frac52,\\frac34)\\)。過程：原函數為 \\((x-1)^2-1\\)，目標函數為 \\((x+\\frac32)^2-\\frac14\\)。頂點由 \\((1,-1)\\) 移到 \\((-\\frac32,-\\frac14)\\)，所以 \\(h=-\\frac52,k=\\frac34\\)。',
      },
      {
        q: '求 \\(y=5x^2\\) 的圖形對於 \\(x\\) 軸的對稱圖形方程式。',
        a: '簡答：\\(y=-5x^2\\)。過程：對 \\(x\\) 軸對稱時，每一點 \\((x,y)\\) 變為 \\((x,-y)\\)，所以原式 \\(y=5x^2\\) 變成 \\(y=-5x^2\\)。',
      },
      {
        q: '若 \\(f(x)=x^2+bx+c\\) 滿足 \\(f(2+t)=f(2-t)\\)，判定 \\(f(1),f(2),f(3)\\) 的大小關係。',
        a: '簡答：\\(f(2)<f(1)=f(3)\\)。過程：條件表示圖形以 \\(x=2\\) 為對稱軸。因為二次項係數為正，頂點在 \\(x=2\\) 且為最小點；\\(1\\) 與 \\(3\\) 到對稱軸距離相同，所以 \\(f(1)=f(3)>f(2)\\)。',
      },
      {
        q: '二次函數 \\(y=a(x-h)^2+k\\) 的圖形，若將其對稱軸由 \\(x=1\\) 變更為 \\(x=-2\\)，且開口方向反轉，求新方程式。',
        a: '簡答：\\(y=-a(x+2)^2+k\\)。過程：對稱軸由 \\(x=1\\) 變為 \\(x=-2\\)，表示頂點的 \\(x\\) 坐標改為 -2；開口方向反轉表示二次項係數由 \\(a\\) 變為 \\(-a\\)，頂點高度仍為 \\(k\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132QuadraticRelativePositionSet(count) {
    const templates = [
      {
        q: '設 \\(y=2x^2+3x+k\\) 的圖形恆在直線 \\(y=5x-1\\) 的上方，求實數 \\(k\\) 的範圍。',
        a: '簡答：\\(k>-\\frac12\\)。過程：恆在上方表示 \\(2x^2+3x+k-(5x-1)>0\\)，即 \\(2x^2-2x+k+1>0\\) 對所有實數成立。需判別式小於 0：\\((-2)^2-4\\cdot2(k+1)<0\\)，得 \\(k>-\\frac12\\)。',
      },
      {
        q: '若二次函數 \\(y=ax^2+5x+a\\) 的圖形恆在直線 \\(y=x-3\\) 的下方，求 \\(a\\) 的範圍。',
        a: '簡答：\\(a<-4\\)。過程：恆在下方表示 \\(ax^2+5x+a-(x-3)<0\\)，即 \\(ax^2+4x+a+3<0\\) 對所有實數成立。需 \\(a<0\\) 且 \\(D=16-4a(a+3)<0\\)，解得 \\(a<-4\\)。',
      },
      {
        q: '設 \\(y=x^2-2kx+3k\\) 的圖形恆在直線 \\(y=4\\) 的上方，求滿足此條件的所有實數 \\(k\\)。',
        a: '簡答：無實數 \\(k\\)。過程：需 \\(x^2-2kx+3k-4>0\\) 對所有實數成立。判別式需小於 0：\\((-2k)^2-4(3k-4)<0\\)，即 \\(k^2-3k+4<0\\)。但此二次式判別式 \\(9-16<0\\)，且開口向上，永遠為正，所以無解。',
      },
      {
        q: '判定二次函數 \\(y=ax^2+bx+c\\) 通過 \\((0,-1)\\) 且與 \\(x\\) 軸相切時，\\(a+b+c\\) 的正負號。',
        a: '簡答：\\(a+b+c\\le0\\)。過程：由通過 \\((0,-1)\\) 得 \\(c=-1\\)。與 \\(x\\) 軸相切表示 \\(b^2-4ac=0\\)，即 \\(b^2+4a=0\\)，所以 \\(a=-\\frac{b^2}{4}\\)。因此 \\(a+b+c=-\\frac{b^2}{4}+b-1=-\\frac{(b-2)^2}{4}\\le0\\)。',
      },
      {
        q: '若 \\(y=2x^2-2ax+(5-2a)\\) 的圖形恆在 \\(y=ax^2\\) 的上方，求 \\(a\\) 的範圍。',
        a: '簡答：\\(a<\\frac{9-\\sqrt{41}}{2}\\)。過程：兩圖相減得 \\((2-a)x^2-2ax+5-2a>0\\) 對所有實數成立。需 \\(2-a>0\\) 且判別式小於 0。化簡得 \\(a^2-9a+10>0\\)，再與 \\(a<2\\) 取交集，得 \\(a<\\frac{9-\\sqrt{41}}2\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132ParabolaGeometricAreasSet(count) {
    const templates = [
      {
        q: '二次函數 \\(y=ax^2+bx+6\\) 在 \\(x=2\\) 時有最小值 -2，且圖形與 \\(x\\) 軸交於 \\(P,Q\\) 兩點，與 \\(y\\) 軸交於 \\(R\\) 點，求 \\(\\triangle PQR\\) 的面積。',
        a: '簡答：6。過程：設 \\(y=a(x-2)^2-2\\)。代入 \\(x=0,y=6\\)，得 \\(4a-2=6\\)，所以 \\(a=2\\)。方程式為 \\(y=2(x-2)^2-2\\)，與 \\(x\\) 軸交於 \\((1,0),(3,0)\\)，與 \\(y\\) 軸交於 \\((0,6)\\)。底長 2，高 6，面積為 6。',
      },
      {
        q: '已知拋物線 \\(y=x^2+ax+b\\) 與 \\(x\\) 軸交點距離為 7，若改為 \\(y=x^2+ax+(b+2)\\)，求其與 \\(x\\) 軸的新交點距離。',
        a: '簡答：\\(\\sqrt{41}\\)。過程：二次函數 \\(x^2+ax+b\\) 兩根距離為 \\(\\sqrt{D}\\)，因首項係數為 1。原距離 7 表示 \\(a^2-4b=49\\)。新式判別式為 \\(a^2-4(b+2)=41\\)，所以新交點距離為 \\(\\sqrt{41}\\)。',
      },
      {
        q: '求頂點為 \\((1,-7)\\)，且與 \\(x\\) 軸交於兩點之長度為 4 的二次函數方程式。',
        a: '簡答：\\(y=\\frac74(x-1)^2-7\\)。過程：設 \\(y=a(x-1)^2-7\\)。與 \\(x\\) 軸交點滿足 \\((x-1)^2=\\frac7a\\)，兩根距離為 \\(2\\sqrt{\\frac7a}=4\\)。解得 \\(a=\\frac74\\)。',
      },
      {
        q: '一拋物線入口寬 12 公尺，高度為 \\(h\\) 公尺。以入口中心為原點、地面為 \\(x\\) 軸，建立此拋物線的函數式。',
        a: '簡答：\\(y=-\\frac{h}{36}x^2+h\\)。過程：頂點在 \\((0,h)\\)，且落地點為 \\((-6,0),(6,0)\\)。設 \\(y=ax^2+h\\)，代入 \\((6,0)\\) 得 \\(36a+h=0\\)，所以 \\(a=-\\frac h{36}\\)。',
      },
      {
        q: '設二次函數圖形通過 \\((-1,0),(3,0)\\) 及 \\((0,9)\\)，求其頂點坐標。',
        a: '簡答：\\((1,12)\\)。過程：由兩個零點設 \\(y=a(x+1)(x-3)\\)。代入 \\((0,9)\\) 得 \\(-3a=9\\)，所以 \\(a=-3\\)。對稱軸為兩根平均 \\(x=1\\)，代入得 \\(y=12\\)，頂點為 \\((1,12)\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132AbsoluteValueQuadraticSet(count) {
    const templates = [
      {
        q: '試求函數 \\(y=|x^2-2x|-4\\) 的 \\(x\\) 軸交點。',
        a: '簡答：\\((1-\\sqrt5,0),(1+\\sqrt5,0)\\)。過程：令 \\(|x^2-2x|-4=0\\)，得 \\(|x^2-2x|=4\\)。方程 \\(x^2-2x=4\\) 有解 \\(x=1\\pm\\sqrt5\\)；方程 \\(x^2-2x=-4\\) 無實根，所以交點如上。',
      },
      {
        q: '設 \\(2\\le x\\le4\\)，求 \\(f(x)=|x^2-4|-2x\\) 的最大值與最小值。',
        a: '簡答：最大值 4，最小值 -4。過程：在 \\([2,4]\\) 上，\\(x^2-4\\ge0\\)，所以 \\(f(x)=x^2-2x-4=(x-1)^2-5\\)。此函數在 \\([2,4]\\) 遞增，故最小值 \\(f(2)=-4\\)，最大值 \\(f(4)=4\\)。',
      },
      {
        q: '若方程式 \\(|x^2-2x-3|=k\\) 恰有 4 個相異實根，求實數 \\(k\\) 的範圍。',
        a: '簡答：\\(0<k<4\\)。過程：\\(x^2-2x-3=(x-1)^2-4\\)，其最小值為 -4，且零點為 -1 與 3。取絕對值後，水平線 \\(y=k\\) 若要切出四個相異交點，需介於 0 與中間最高高度 4 之間，所以 \\(0<k<4\\)。',
      },
      {
        q: '求 \\(f(x)=x^2-a|x|+2\\) 在區間 \\([-1,1]\\) 內的最小值。',
        a: '簡答：若 \\(a\\le0\\)，最小值為 2；若 \\(0<a<2\\)，最小值為 \\(2-\\frac{a^2}{4}\\)；若 \\(a\\ge2\\)，最小值為 \\(3-a\\)。過程：令 \\(t=|x|\\)，則 \\(0\\le t\\le1\\)，原式成為 \\(t^2-at+2\\)。在區間上檢查頂點 \\(t=\\frac a2\\) 與端點即可得到三段結果。',
      },
      {
        q: '討論 \\(y=|x^2-3x|-x+1\\) 的 \\(x\\) 軸交點。',
        a: '簡答：\\((1+\\sqrt2,0),(2+\\sqrt3,0)\\)。過程：令 \\(|x^2-3x|-x+1=0\\)，需 \\(x\\ge1\\)。若 \\(0<x<3\\)，則 \\(|x^2-3x|=-x^2+3x\\)，解得 \\(x=1+\\sqrt2\\)。若 \\(x\\ge3\\)，則 \\(|x^2-3x|=x^2-3x\\)，解得 \\(x=2+\\sqrt3\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132AlgebraicExtremaSet(count) {
    const templates = [
      {
        q: '設 \\(x,y\\) 為實數且 \\(x^2+3y^2=1\\)，求 \\(2x+3y^2\\) 的最大值與最小值。',
        a: '簡答：最大值 2，最小值 -2。過程：令 \\(t=3y^2\\)，則 \\(0\\le t\\le1\\)，且 \\(x^2=1-t\\)。原式為 \\(2x+t\\)。最大時取 \\(x=\\sqrt{1-t}\\)，可得最大 2；最小時取 \\(x=-\\sqrt{1-t}\\)，可得最小 -2。',
      },
      {
        q: '若 \\(x^2+2y^2=1\\)，求 \\(2x+3y^2\\) 的最大值。',
        a: '簡答：\\(\\frac{13}{6}\\)。過程：令 \\(t=y^2\\)，則 \\(0\\le t\\le\\frac12\\)，且 \\(x\\le\\sqrt{1-2t}\\)。要取最大，令 \\(x=\\sqrt{1-2t}\\)，原式為 \\(2\\sqrt{1-2t}+3t\\)。配方或微分可得最值在 \\(t=\\frac5{18}\\)，最大值為 \\(\\frac{13}{6}\\)。',
      },
      {
        q: '給定 \\(y=\\sqrt{4-(x-4)^2}-3\\)，求 \\(x^2+y^2\\) 的最小值。',
        a: '簡答：9。過程：此圖形是圓 \\((x-4)^2+(y+3)^2=4\\) 的上半部。圓心 \\((4,-3)\\) 到原點距離為 5，半徑為 2，所以圓上離原點最近距離為 3，且最近點在上半圓上。因此 \\(x^2+y^2\\) 的最小值為 \\(3^2=9\\)。',
      },
      {
        q: '若 \\((x,y)\\) 在單位圓上，求二次式 \\(3x+4y^2\\) 的範圍。',
        a: '簡答：\\(-3\\le3x+4y^2\\le\\frac{73}{16}\\)。過程：令 \\(t=y^2\\)，則 \\(0\\le t\\le1\\)，且 \\(x=\\pm\\sqrt{1-t}\\)。最小取負號，在 \\(t=0\\) 得 -3；最大取正號，最大化 \\(3\\sqrt{1-t}+4t\\)，得最大值 \\(\\frac{73}{16}\\)。',
      },
      {
        q: '設 \\(x+2y=4\\)，且 \\(x,y\\ge0\\)，求 \\(x^2+y^2\\) 的最大值與最小值。',
        a: '簡答：最大值 16，最小值 \\(\\frac{16}{5}\\)。過程：線段端點為 \\((4,0),(0,2)\\)，端點距離平方分別為 16 與 4。離原點最近點是原點到直線 \\(x+2y=4\\) 的垂足 \\((\\frac45,\\frac85)\\)，距離平方為 \\(\\frac{16}{5}\\)。所以最大值為 16，最小值為 \\(\\frac{16}{5}\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132QuadraticSymmetryFunctionalRelationsSet(count) {
    const templates = [
      {
        q: '若二次函數 \\(f(x)=x^2+bx+c\\) 滿足 \\(f(2+t)=f(2-t)\\) 對任意實數 \\(t\\) 恆成立，試比較 \\(f(1),f(2),f(3)\\) 的大小關係。',
        a: '簡答：\\(f(2)<f(1)=f(3)\\)。過程：條件表示圖形以 \\(x=2\\) 為對稱軸。又二次項係數為正，所以頂點在 \\(x=2\\) 且為最小點；\\(1\\) 與 \\(3\\) 到對稱軸距離相同，因此 \\(f(1)=f(3)>f(2)\\)。',
      },
      {
        q: '設二次函數 \\(f(x)=a(x-h)^2+5\\)，其中 \\(a>0\\)。若 \\(f(3-t)=f(3+t)\\) 對任意實數 \\(t\\) 恆成立，試判定下列何者正確：(1) \\(f(0)>0\\)；(2) \\(f(-1)\\le f(7)\\)。',
        a: '簡答：(1)、(2) 皆正確。過程：由 \\(f(3-t)=f(3+t)\\) 可知對稱軸為 \\(x=3\\)，所以 \\(h=3\\)。因此 \\(f(0)=9a+5>0\\)；又 \\(-1\\) 與 \\(7\\) 到對稱軸距離同為 4，故 \\(f(-1)=f(7)\\)，所以 \\(f(-1)\\le f(7)\\) 正確。',
      },
      {
        q: '已知實係數二次函數 \\(f(x)=ax^2+bx+c\\) 滿足 \\(f(-1)=-3\\)、\\(f(3)=-1\\)，且判別式 \\(D<0\\)。說明為何 \\(a<0\\) 且 \\(c<0\\)。',
        a: '簡答：因 \\(D<0\\) 且已有負函數值，所以 \\(a<0\\)，並且 \\(c<0\\)。過程：判別式 \\(D<0\\) 表示圖形不與 \\(x\\) 軸相交，函數值恆同號。已知 \\(f(-1)=-3<0\\)，所以整個圖形都在 \\(x\\) 軸下方，開口必向下，即 \\(a<0\\)。又 \\(c=f(0)\\)，也必小於 0。',
      },
      {
        q: '若二次函數 \\(f(x)\\) 滿足 \\(f(5-t)=f(-7+t)\\)，且已知其開口向下，判定 \\(f(2)\\) 與 \\(f(-4)\\) 的大小。',
        a: '簡答：\\(f(2)=f(-4)\\)。過程：兩個對稱輸入 \\(5-t\\) 與 \\(-7+t\\) 的中點為 \\(\\frac{5-t+(-7+t)}2=-1\\)，所以對稱軸為 \\(x=-1\\)。\\(2\\) 與 \\(-4\\) 到 \\(-1\\) 的距離都為 3，因此函數值相等。',
      },
      {
        q: '已知二次函數 \\(f(x)\\) 的對稱軸為 \\(x=2\\)，且 \\(f(0)=11\\)、\\(f(3)=5\\)，求 \\(f(x)\\) 的一般式。',
        a: '簡答：\\(f(x)=2x^2-8x+11\\)。過程：設 \\(f(x)=a(x-2)^2+k\\)。代入 \\(f(0)=11\\) 得 \\(4a+k=11\\)；代入 \\(f(3)=5\\) 得 \\(a+k=5\\)。相減得 \\(3a=6\\)，所以 \\(a=2,k=3\\)。因此 \\(f(x)=2(x-2)^2+3=2x^2-8x+11\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132ParabolaInterceptDistanceSet(count) {
    const templates = [
      {
        q: '已知拋物線 \\(y=x^2+ax+b\\) 與 \\(x\\) 軸交於 \\(P,Q\\) 兩點且 \\(PQ=7\\)。若改為 \\(y=x^2+ax+(b+2)\\)，求與 \\(x\\) 軸的新交點距離。',
        a: '簡答：\\(\\sqrt{41}\\)。過程：首項係數為 1 時，兩根距離為 \\(\\sqrt{D}\\)。原式交點距離 7，故 \\(a^2-4b=49\\)。新式判別式為 \\(a^2-4(b+2)=49-8=41\\)，所以新距離為 \\(\\sqrt{41}\\)。',
      },
      {
        q: '二次函數 \\(y=ax^2+bx+6\\) 的頂點為 \\((2,-2)\\)，求此圖形與 \\(x\\) 軸兩交點間的距離。',
        a: '簡答：2。過程：設 \\(y=a(x-2)^2-2\\)。代入 \\((0,6)\\)，得 \\(4a-2=6\\)，所以 \\(a=2\\)。令 \\(2(x-2)^2-2=0\\)，得 \\(x=1,3\\)，兩交點距離為 2。',
      },
      {
        q: '設二次函數 \\(y=ax^2+bx\\) 在 \\(x=1\\) 時有最小值 \\(-\\frac1a\\)，求 \\(3a+b\\) 的值。',
        a: '簡答：1。過程：頂點 \\(x=1\\) 表示 \\(-\\frac{b}{2a}=1\\)，故 \\(b=-2a\\)。最小值為 \\(f(1)=a+b=-a\\)，又題目給 \\(-\\frac1a\\)，所以 \\(-a=-\\frac1a\\)，且有最小值需 \\(a>0\\)，得 \\(a=1,b=-2\\)。因此 \\(3a+b=1\\)。',
      },
      {
        q: '拋物線與 \\(x\\) 軸交於 \\((-4,0)\\) 與 \\((1,0)\\)，且 \\(y\\) 截距為 2，求其頂點坐標。',
        a: '簡答：\\((-\\frac32,\\frac{25}{8})\\)。過程：設 \\(y=a(x+4)(x-1)\\)。代入 \\((0,2)\\)，得 \\(-4a=2\\)，所以 \\(a=-\\frac12\\)。對稱軸為兩根平均 \\(x=-\\frac32\\)，代回得 \\(y=\\frac{25}{8}\\)。',
      },
      {
        q: '已知拋物線頂點為 \\((1,-7)\\)，且與 \\(x\\) 軸兩交點間的距離為 4，求此二次函數的方程式。',
        a: '簡答：\\(y=\\frac74(x-1)^2-7\\)。過程：設 \\(y=a(x-1)^2-7\\)。令 \\(y=0\\)，得 \\((x-1)^2=\\frac7a\\)，兩根距離為 \\(2\\sqrt{\\frac7a}=4\\)。解得 \\(a=\\frac74\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132QuadraticStructuralModelingSet(count) {
    const templates = [
      {
        q: '有一半徑為 14 呎的半圓形隧道口，一輛寬 7 呎、高 13 呎的卡車若靠著中央分道線行駛，是否能安全通過？',
        a: '簡答：可以。過程：以隧道中心為原點，半圓為 \\(x^2+y^2=196\\)。車寬 7 呎，半寬為 3.5 呎，車頂兩側在 \\(x=\\pm3.5\\)。此處高度 \\(y=\\sqrt{196-3.5^2}=\\sqrt{183.75}>13\\)，所以能通過。',
      },
      {
        q: '以每秒 \\(v\\) 公尺發射信號彈，高度 \\(y=vt-4.9t^2\\)。若 5 秒時高度為 245 公尺，求信號彈在 245 公尺以上的時間共有幾秒？',
        a: '簡答：5 秒。過程：代入 \\(t=5,y=245\\)，得 \\(245=5v-4.9\\cdot25\\)，所以 \\(v=73.5\\)。解 \\(73.5t-4.9t^2\\ge245\\)，得 \\(5\\le t\\le10\\)，時間長度為 5 秒。',
      },
      {
        q: '某商品進價 30 元，定價 50 元時可賣 80 個；若售價每降 1 元，多賣 20 個，求最大利潤時的售價。',
        a: '簡答：42 元。過程：設降價 \\(x\\) 元，售價為 \\(50-x\\)，銷量為 \\(80+20x\\)。利潤為 \\((50-x-30)(80+20x)=(20-x)(80+20x)=-20x^2+320x+1600\\)。頂點在 \\(x=8\\)，所以最大利潤時售價為 \\(50-8=42\\) 元。',
      },
      {
        q: '拋物線噴泉頂點離牆 1 公尺，高度為 4 公尺，且在離牆 3 公尺處落地。以牆腳為原點、地面為 \\(x\\) 軸，求噴泉軌跡方程式。',
        a: '簡答：\\(y=-(x-1)^2+4\\)。過程：頂點為 \\((1,4)\\)，設 \\(y=a(x-1)^2+4\\)。代入落地點 \\((3,0)\\)，得 \\(0=4a+4\\)，所以 \\(a=-1\\)。',
      },
      {
        q: '牛排溫度 \\(T=\\frac{700}{k^2-7k+20}\\)（\\(k\\) 為分鐘），求使牛排溫度不大於 5 度的最少時間。',
        a: '簡答：15 分鐘。過程：需 \\(\\frac{700}{k^2-7k+20}\\le5\\)。分母在題目情境中為正，化簡得 \\(k^2-7k+20\\ge140\\)，即 \\((k-15)(k+8)\\ge0\\)。因 \\(k\\ge0\\)，最少為 \\(k=15\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132MonomialFunctionFeaturesSet(count) {
    const templates = [
      {
        q: '三次函數 \\(y=2x^3+6x^2+6x+7\\) 向右平移 \\(h\\)、向上平移 \\(k\\) 後可得單項函數 \\(y=2x^3\\)，求 \\((h,k)\\)。',
        a: '簡答：\\((h,k)=(1,-5)\\)。過程：\\(2x^3+6x^2+6x+7=2(x+1)^3+5\\)。若向右平移 1，得 \\(2x^3+5\\)；再向上平移 \\(-5\\)（即向下 5），得 \\(2x^3\\)。',
      },
      {
        q: '已知四次函數 \\(y=ax^4\\)（\\(a>0\\)）通過點 \\((p,q)\\)。判定 \\(y=-ax^4\\) 的圖形必通過哪些點。',
        a: '簡答：\\((p,-q)\\) 與 \\((-p,-q)\\)。過程：由 \\((p,q)\\) 在 \\(y=ax^4\\) 上，得 \\(q=ap^4\\)。對 \\(y=-ax^4\\)，當 \\(x=p\\) 或 \\(x=-p\\) 時，函數值皆為 \\(-ap^4=-q\\)。',
      },
      {
        q: '比較 \\(T_1:y=\\frac13x^2\\)、\\(T_2:y=\\frac12x^2\\)、\\(T_3:y=-2x^2\\) 的開口大小，依由大到小排列。',
        a: '簡答：\\(T_1,T_2,T_3\\)。過程：二次函數 \\(y=ax^2\\) 的開口大小由 \\(|a|\\) 決定，\\(|a|\\) 越小開口越大。三者 \\(|a|\\) 分別為 \\(\\frac13,\\frac12,2\\)，所以開口由大到小為 \\(T_1,T_2,T_3\\)。',
      },
      {
        q: '給定一次函數 \\(f(x)=2x-3\\)。判定三次函數 \\(g(x)=2(x-3)^3\\) 可由 \\(y=2x^3\\) 如何平移得到。',
        a: '簡答：向右平移 3 單位。過程：\\(g(x)=2(x-3)^3\\) 是把 \\(y=2x^3\\) 中的 \\(x\\) 換成 \\(x-3\\)，所以圖形向右平移 3 單位，拐點由 \\((0,0)\\) 移到 \\((3,0)\\)。',
      },
      {
        q: '判定 \\(y=x^5\\) 是否為奇函數，並說明其圖形對於原點對稱的幾何意義。',
        a: '簡答：是奇函數；圖形對原點對稱。過程：令 \\(f(x)=x^5\\)，則 \\(f(-x)=(-x)^5=-x^5=-f(x)\\)。這表示若 \\((x,y)\\) 在圖形上，則 \\((-x,-y)\\) 也在圖形上，所以圖形對原點對稱。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132CompoundRegionsExtremaSet(count) {
    const templates = [
      {
        q: '設 \\(x,y\\) 滿足 \\(x\\ge0,y\\ge0,3x+2y\\le12,x+y\\ge2\\)，求 \\(x^2+y^2\\) 的最小值。',
        a: '簡答：2。過程：要求 \\(x^2+y^2\\) 最小，就是找區域中離原點最近的點。限制 \\(x+y\\ge2\\) 把靠近原點的部分切掉，原點到直線 \\(x+y=2\\) 的垂足為 \\((1,1)\\)，且符合其他限制，所以最小值為 \\(1^2+1^2=2\\)。',
      },
      {
        q: '設 \\(x,y\\) 為實數，滿足 \\(x+2y=4\\) 且 \\(x,y\\ge0\\)。求 \\(x^2+y^2\\) 的最大值。',
        a: '簡答：16。過程：可行區域是線段，端點為 \\((4,0)\\) 與 \\((0,2)\\)。\\(x^2+y^2\\) 在端點分別為 16 與 4，因此最大值為 16。',
      },
      {
        q: '設 \\(f(x)=|x-1|+2|x-2|+3|x+1|\\)，求 \\(f(x)\\) 的最小值及其發生的 \\(x\\) 值範圍。',
        a: '簡答：最小值 8，發生於 \\(-1\\le x\\le1\\)。過程：加權絕對值和的最小值發生在加權中位數位置。三點為 \\(-1,1,2\\)，權重分別為 3,1,2，總權重為 6；在 \\([-1,1]\\) 斜率為 0，所以整段都是最小點。代入 \\(x=0\\)，得最小值 \\(1+4+3=8\\)。',
      },
      {
        q: '若 \\(x^2+2y^2=1\\)，求 \\(2x+3y^2\\) 的最大值與最小值。',
        a: '簡答：最大值 \\(\\frac{13}{6}\\)，最小值 -2。過程：令 \\(t=y^2\\)，則 \\(0\\le t\\le\\frac12\\)，且 \\(x=\\pm\\sqrt{1-2t}\\)。取正號時最大化 \\(2\\sqrt{1-2t}+3t\\)，得最大值 \\(\\frac{13}{6}\\)；取負號時最小值在 \\(t=0\\)，為 -2。',
      },
      {
        q: '已知 \\(P(a,b)\\) 為圓 \\(x^2+y^2-4x-2y+4=0\\) 上的動點，求 \\(a^2+(b-1)^2\\) 的最大值。',
        a: '簡答：9。過程：圓化為 \\((a-2)^2+(b-1)^2=1\\)。令 \\(u=a-2,v=b-1\\)，則 \\(u^2+v^2=1\\)，而 \\(a^2+(b-1)^2=(u+2)^2+v^2=u^2+v^2+4u+4=5+4u\\)。因 \\(-1\\le u\\le1\\)，最大值為 9。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132CubicTransformCenterSet(count) {
    const templates = [
      {
        q: '將三次函數 \\(y=2x^3+6x^2+6x+7\\) 向右平移 \\(h\\) 個單位，再向上平移 \\(k\\) 個單位，可得單項函數 \\(y=2x^3\\)，求數對 \\((h,k)\\)。',
        a: '簡答：\\((h,k)=(1,-5)\\)。過程：\\(2x^3+6x^2+6x+7=2(x+1)^3+5\\)，其對稱中心為 \\((-1,5)\\)。要移到 \\(y=2x^3\\) 的中心 \\((0,0)\\)，需向右 1、向下 5，所以 \\((h,k)=(1,-5)\\)。',
      },
      {
        q: '已知三次函數 \\(y=x^3-6x^2+9x+2\\)，求其圖形的對稱中心坐標。',
        a: '簡答：\\((2,4)\\)。過程：三次函數 \\(ax^3+bx^2+cx+d\\) 的對稱中心橫坐標為 \\(h=-\\frac{b}{3a}\\)。此題 \\(h=-\\frac{-6}{3}=2\\)，代入得 \\(k=f(2)=8-24+18+2=4\\)。',
      },
      {
        q: '若 \\(f(x)=(x-2)^3-3\\)，說明其圖形是由 \\(y=x^3\\) 如何平移而得。',
        a: '簡答：向右平移 2 單位，再向下平移 3 單位。過程：\\((x-2)^3\\) 表示把 \\(y=x^3\\) 向右移 2；外面的 \\(-3\\) 表示再向下移 3，因此對稱中心由 \\((0,0)\\) 移到 \\((2,-3)\\)。',
      },
      {
        q: '給定對稱中心為 \\((1,5)\\)，且領導係數為 1 的三次函數。若圖形通過 \\((2,9)\\)，求其標準式。',
        a: '簡答：\\(y=(x-1)^3+3(x-1)+5\\)。過程：設標準式為 \\(y=(x-1)^3+p(x-1)+5\\)。代入 \\((2,9)\\)，得 \\(9=1+p+5\\)，所以 \\(p=3\\)。',
      },
      {
        q: '三次函數 \\(y=ax^3\\) 的圖形對稱於原點。若平移後中心變為 \\((3,-2)\\)，求新函數式。',
        a: '簡答：\\(y=a(x-3)^3-2\\)。過程：單項三次函數中心在 \\((0,0)\\)。中心平移到 \\((3,-2)\\) 表示向右 3、向下 2，因此把 \\(x\\) 換為 \\(x-3\\)，再減 2。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132CubicLocalLinearApproximationSet(count) {
    const templates = [
      {
        q: '設 \\(f(x)=x^3+bx^2+cx+d\\)，已知圖形對稱中心的 \\(x\\) 坐標為 1，且在 \\(x=2\\) 附近的一次近似為 \\(y=5x+4\\)，求 \\((b,c,d)\\)。',
        a: '簡答：\\((b,c,d)=(-3,5,8)\\)。過程：中心橫坐標為 \\(-\\frac b3=1\\)，得 \\(b=-3\\)。一次近似 \\(y=5x+4\\) 是切線，所以 \\(f(2)=14\\)、\\(f\\prime(2)=5\\)。因 \\(f\\prime(x)=3x^2+2bx+c\\)，代入得 \\(12-12+c=5\\)，故 \\(c=5\\)。再由 \\(f(2)=8-12+10+d=14\\)，得 \\(d=8\\)。',
      },
      {
        q: '求三次函數 \\(y=-x^3+2x-4\\) 在 \\(x=-1\\) 附近的一次近似式，並用它估計 \\(x=-1+\\frac1{50}\\) 時的函數值。',
        a: '簡答：一次近似式為 \\(y=-x-6\\)，估計值為 \\(-\\frac{251}{50}\\)。過程：\\(f(-1)=-5\\)，且 \\(f\\prime(x)=-3x^2+2\\)，所以 \\(f\\prime(-1)=-1\\)。切線為 \\(y+5=-(x+1)\\)，即 \\(y=-x-6\\)。代入 \\(x=-1+\\frac1{50}\\)，得 \\(-\\frac{251}{50}\\)。',
      },
      {
        q: '利用一次近似，求 \\(f(x)=x^3-4x^2+7x-1\\) 在 \\(x=2+\\frac1{1000}\\) 時的近似值。',
        a: '簡答：\\(5.003\\)。過程：\\(f(2)=5\\)，\\(f\\prime(x)=3x^2-8x+7\\)，所以 \\(f\\prime(2)=3\\)。當 \\(x=2+\\frac1{1000}\\) 時，\\(\\Delta x=\\frac1{1000}\\)，一次近似為 \\(5+3\\cdot\\frac1{1000}=5.003\\)。',
      },
      {
        q: '若三次函數 \\(f(x)=ax^3+bx^2+cx+d\\) 的圖形對稱中心為 \\((0,3)\\)，且在 \\(x=2\\) 附近近似於 \\(y=-3x-11\\)，求 \\(a\\) 值。',
        a: '簡答：\\(a=\\frac78\\)。過程：中心為 \\((0,3)\\)，可設 \\(f(x)=ax^3+px+3\\)。切線 \\(y=-3x-11\\) 在 \\(x=2\\) 的值為 -17，斜率為 -3。故 \\(8a+2p+3=-17\\)，且 \\(12a+p=-3\\)。解得 \\(a=\\frac78\\)。',
      },
      {
        q: '已知函數 \\(f\\) 在 \\(x=h\\) 附近滿足 \\(f(h)=k\\)、\\(f\\prime(h)=m\\)。寫出該處的一次近似式。',
        a: '簡答：\\(y=m(x-h)+k\\)。過程：一次近似就是在該點的切線。切線通過 \\((h,k)\\)，斜率為 \\(m\\)，所以方程式為 \\(y-k=m(x-h)\\)，即 \\(y=m(x-h)+k\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132CubicRootsCenterRelationSet(count) {
    const templates = [
      {
        q: '已知 \\(f(x)=x^3-6x^2+11x-6\\) 的三個根為 1,2,3，求其對稱中心的 \\(x\\) 坐標。',
        a: '簡答：2。過程：三次函數的對稱中心橫坐標等於三根的平均，\\(h=\\frac{1+2+3}{3}=2\\)。也可由 \\(-\\frac b{3a}=\\frac6{3}=2\\) 得到。',
      },
      {
        q: '若三次函數 \\(f(x)\\) 與 \\(x\\) 軸交於三點，其中兩點為 \\((-1,0)\\) 與 \\((5,0)\\)，且對稱中心 \\(x\\) 坐標為 2，求第三個交點。',
        a: '簡答：\\((2,0)\\)。過程：設三根為 \\(-1,5,r\\)。由中心橫坐標 \\(2=\\frac{-1+5+r}{3}\\)，得 \\(r=2\\)，所以第三個交點為 \\((2,0)\\)。',
      },
      {
        q: '設 \\(f(x)=x^3+3x^2+kx+5\\)。若其三個根成等差數列，求對稱中心坐標。',
        a: '簡答：\\((-1,0)\\)。過程：三根成等差時，中間根等於三根平均，也就是對稱中心的 \\(x\\) 坐標。由 \\(-\\frac b{3a}=-1\\) 知中心橫坐標為 -1；且此點為中間根，所以 \\(f(-1)=0\\)，中心為 \\((-1,0)\\)。',
      },
      {
        q: '已知三次方程 \\(f(x)=0\\) 的三根和為 9，求 \\(f(x)\\) 圖形對稱中心的 \\(x\\) 坐標。',
        a: '簡答：3。過程：三次函數的對稱中心橫坐標是三根平均，所以 \\(h=\\frac{9}{3}=3\\)。',
      },
      {
        q: '判定三次函數 \\(f(x)=ax^3+bx^2+cx+d\\) 的對稱中心，其 \\(x\\) 坐標是否必落在三個實根構成的區間內。',
        a: '簡答：是。過程：若三個實根為 \\(x_1,x_2,x_3\\)，則中心橫坐標為 \\(h=\\frac{x_1+x_2+x_3}{3}\\)。三個數的平均必介於最小值與最大值之間，因此中心的 \\(x\\) 坐標必落在三根構成的區間內。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132CubicSymmetryEvaluationSet(count) {
    const templates = [
      {
        q: '已知 \\(f(x)\\) 的對稱中心為 \\((2,5)\\)，求 \\(f(1)+f(3)\\) 之值。',
        a: '簡答：10。過程：\\(1\\) 與 \\(3\\) 關於 \\(x=2\\) 對稱，三次函數對稱中心為 \\((2,5)\\) 時，對稱兩點的函數值平均為 5，所以 \\(f(1)+f(3)=10\\)。',
      },
      {
        q: '設 \\(f(x)=x^3-3x^2+4\\)，求 \\(f(-100)+f(102)\\) 之值。',
        a: '簡答：4。過程：此函數中心橫坐標為 \\(-\\frac{-3}{3}=1\\)，且 \\(f(1)=2\\)，中心為 \\((1,2)\\)。\\(-100\\) 與 \\(102\\) 關於 1 對稱，因此和為 \\(2\\cdot2=4\\)。',
      },
      {
        q: '若 \\(f(x)\\) 滿足 \\(f(2-t)+f(2+t)=10\\) 對任意實數 \\(t\\) 恆成立，求此函數圖形的對稱中心。',
        a: '簡答：\\((2,5)\\)。過程：輸入 \\(2-t\\) 與 \\(2+t\\) 關於 \\(x=2\\) 對稱，且函數值和恆為 10，所以函數值平均為 5，對稱中心為 \\((2,5)\\)。',
      },
      {
        q: '已知 \\(f(x)=(x-3)^3+2(x-3)+1\\)，計算 \\(\\sum_{i=1}^{5} f(i)\\)。',
        a: '簡答：5。過程：中心為 \\((3,1)\\)。\\(f(1)+f(5)=2\\)、\\(f(2)+f(4)=2\\)，且 \\(f(3)=1\\)。所以總和為 \\(2+2+1=5\\)。',
      },
      {
        q: '給定三次函數的對稱中心為 \\((h,k)\\)。若 \\(f(h-1)=7\\)，求 \\(f(h+1)\\)。',
        a: '簡答：\\(2k-7\\)。過程：\\(h-1\\) 與 \\(h+1\\) 關於 \\(h\\) 對稱，因此兩個函數值的平均為 \\(k\\)。所以 \\(\\frac{7+f(h+1)}2=k\\)，得 \\(f(h+1)=2k-7\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132CubicMonomialOverlapSet(count) {
    const templates = [
      {
        q: '判定 \\(f(x)=x^3-3x^2+3x+5\\) 經平移後是否能與 \\(y=x^3\\) 重合。',
        a: '簡答：可以。過程：\\(x^3-3x^2+3x+5=(x-1)^3+6\\)，沒有一次項 \\((x-1)\\) 的部分。只要向左平移 1、向下平移 6，就可與 \\(y=x^3\\) 重合。',
      },
      {
        q: '給定 \\(f(x)=ax^3+bx^2+cx+d\\)，求 \\(a,b,c\\) 需滿足什麼代數關係，才能使其平移後成為單項函數。',
        a: '簡答：\\(b^2=3ac\\)。過程：令中心橫坐標 \\(h=-\\frac{b}{3a}\\)，把函數寫成 \\(a(x-h)^3+p(x-h)+k\\)。若要平移成單項函數，必須 \\(p=0\\)。化簡可得 \\(p=c-\\frac{b^2}{3a}\\)，所以條件為 \\(b^2=3ac\\)。',
      },
      {
        q: '若 \\(f(x)=2x^3-12x^2+24x-11\\)，求將其平移至 \\(y=2x^3\\) 的位移。',
        a: '簡答：向左平移 2 單位，再向下平移 5 單位。過程：\\(f(x)=2(x-2)^3+5\\)，中心為 \\((2,5)\\)。要移到 \\(y=2x^3\\) 的中心 \\((0,0)\\)，需向左 2、向下 5。',
      },
      {
        q: '下列哪些函數平移後可成為奇函數 \\(y=x^3\\)：(1) \\(y=x^3-x\\)；(2) \\(y=x^3-3x^2+3x\\)。',
        a: '簡答：(2)。過程：(1) 已是奇函數，但含有一次項，不能平移成單項 \\(x^3\\)。(2) 可寫為 \\((x-1)^3+1\\)，向左 1、向下 1 後就是 \\(y=x^3\\)。',
      },
      {
        q: '若 \\(f(x)=x^3+kx^2+3x+1\\) 可平移至 \\(y=x^3\\)，求 \\(k\\) 之值。',
        a: '簡答：\\(k=\\pm3\\)。過程：能平移成單項三次函數需滿足 \\(b^2=3ac\\)。此題 \\(a=1,b=k,c=3\\)，故 \\(k^2=9\\)，所以 \\(k=\\pm3\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132CubicInflectionTangentSet(count) {
    const templates = [
      {
        q: '求 \\(f(x)=(x-2)^3+4(x-2)+5\\) 在對稱中心處的切線方程式。',
        a: '簡答：\\(y=4x-3\\)。過程：標準式顯示對稱中心為 \\((2,5)\\)，且中心處斜率為一次項係數 4。切線為 \\(y-5=4(x-2)\\)，即 \\(y=4x-3\\)。',
      },
      {
        q: '已知三次函數的對稱中心為 \\((1,3)\\)，中心附近近似線為 \\(y=2x+1\\)，且領導係數為 1，求該函數的標準式。',
        a: '簡答：\\(y=(x-1)^3+2(x-1)+3\\)。過程：中心為 \\((1,3)\\)，領導係數為 1，設 \\(y=(x-1)^3+p(x-1)+3\\)。中心切線斜率為 \\(p\\)，而 \\(y=2x+1\\) 的斜率為 2，所以 \\(p=2\\)。',
      },
      {
        q: '設 \\(f(x)=a(x-h)^3+p(x-h)+k\\)。說明為何其在對稱中心處的一次近似，就是平移後函數的一次項。',
        a: '簡答：中心處一次近似為 \\(y=p(x-h)+k\\)。過程：對稱中心是 \\((h,k)\\)。令 \\(u=x-h\\)，函數為 \\(au^3+pu+k\\)。在 \\(u\\) 很小時，三次項 \\(au^3\\) 比一次項小很多，因此一次近似就是 \\(pu+k\\)，也就是 \\(y=p(x-h)+k\\)。',
      },
      {
        q: '若三次函數 \\(f(x)=-(x-1)^3-2(x-1)+3\\)，判定該函數是否為嚴格遞減函數。',
        a: '簡答：是。過程：\\(f\\prime(x)=-3(x-1)^2-2\\)，對所有實數 \\(x\\) 皆小於 0，所以函數在全域嚴格遞減。',
      },
      {
        q: '求 \\(f(x)=x^3-3x\\) 在原點（對稱中心）的切線，並判定此切線與圖形的交點數。',
        a: '簡答：切線為 \\(y=-3x\\)，只有 1 個交點（原點，重根）。過程：\\(f(0)=0\\)，\\(f\\prime(x)=3x^2-3\\)，所以 \\(f\\prime(0)=-3\\)，切線為 \\(y=-3x\\)。聯立 \\(x^3-3x=-3x\\) 得 \\(x^3=0\\)，只有 \\(x=0\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS132CubicChordMidpointSet(count) {
    const templates = [
      {
        q: '直線 \\(L\\) 通過三次函數圖形的中心 \\(M(1,2)\\)，且與圖形交於 \\(A,B\\) 兩點。若 \\(A=(3,10)\\)，求 \\(B\\) 點坐標。',
        a: '簡答：\\((-1,-6)\\)。過程：通過對稱中心的割線，其兩個交點以中心為中點。所以 \\(B=2M-A=(2\\cdot1-3,2\\cdot2-10)=(-1,-6)\\)。',
      },
      {
        q: '設 \\(f(x)=x^3-3x\\)。若點 \\(P(\\alpha,\\beta)\\) 在圖形上，證明 \\((-\\alpha,-\\beta)\\) 亦在圖形上。',
        a: '簡答：因 \\(f\\) 是奇函數，所以成立。過程：\\(f(-\\alpha)=(-\\alpha)^3-3(-\\alpha)=-\\alpha^3+3\\alpha=-(\\alpha^3-3\\alpha)=-f(\\alpha)=-\\beta\\)。因此 \\((-\\alpha,-\\beta)\\) 也在圖形上。',
      },
      {
        q: '證明：若一條直線與三次函數交於三點且這三點的 \\(x\\) 坐標成等差數列，則中間的那一點必在對稱中心的同一條垂直線上。',
        a: '簡答：中間點的 \\(x\\) 坐標等於對稱中心的 \\(x\\) 坐標。過程：三次函數與直線相減仍為三次式。若三個交點的 \\(x\\) 坐標為 \\(r-d,r,r+d\\)，則三根平均為 \\(r\\)。三根平均等於所得三次式的中心橫坐標，也就是原三次函數圖形的中心橫坐標。',
      },
      {
        q: '已知三次函數對稱於原點，且通過 \\((1,2)\\) 與 \\((2,10)\\)，求此函數方程式。',
        a: '簡答：\\(y=x^3+x\\)。過程：對稱於原點且為三次函數，可設 \\(y=ax^3+px\\)。代入 \\((1,2)\\) 得 \\(a+p=2\\)；代入 \\((2,10)\\) 得 \\(8a+2p=10\\)。解得 \\(a=1,p=1\\)。',
      },
      {
        q: '在 \\(f(x)=x^3+px\\) 的圖形上取相異兩點 \\(A,B\\)，且原點是 \\(AB\\) 的中點。若 \\(A=(t,t^3+pt)\\)，求線段 \\(AB\\) 的長度表示式。',
        a: '簡答：\\(2\\sqrt{t^2+(t^3+pt)^2}\\)。過程：原點是中點且圖形對原點對稱，所以 \\(B=(-t,-t^3-pt)\\)。因此 \\(AB=2\\cdot OA=2\\sqrt{t^2+(t^3+pt)^2}\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }
  // ── s1-3-2 新增：分段函數代值計算 ───────────────────────────────────
  function buildS132PiecewiseFunctionEvalSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        // f(x) = { ax+b  x≥0; cx+d  x<0 }
        const a = randInt(1,4), b = randInt(-3,3);
        const c = randInt(1,4), d = randInt(-3,3);
        const p = randInt(1,4), q = randInt(-4,-1);
        const fp = a*p+b, fq = c*q+d;
        const bStr = b >= 0 ? `+${b}` : `${b}`;
        const dStr = d >= 0 ? `+${d}` : `${d}`;
        questions.push(
          `設 \\(f(x)=\\begin{cases}${a}x${bStr}, & x\\ge0\\\\ ${c}x${dStr}, & x<0\\end{cases}\\)，求 \\(f(${p})\\) 與 \\(f(${q})\\)。`
        );
        answers.push(
          `簡答：\\(f(${p})=${fp}\\)，\\(f(${q})=${fq}\\)。` +
          `過程：\\(${p}\\ge0\\) 用第一段，\\(f(${p})=${a}\\cdot${wrapIfNegative(p)}${bStr}=${fp}\\)；` +
          `\\(${q}<0\\) 用第二段，\\(f(${q})=${c}\\cdot${wrapIfNegative(q)}${dStr}=${fq}\\)。`
        );
      } else if (mode === 1) {
        // f(x) = { x^2+a  x≥1; bx+c  x<1 }
        const a = randInt(0,5), b = randInt(1,4), c = randInt(-5,5);
        const p = randInt(1,4), q = randInt(-3,0);
        const fp = p*p+a, fq = b*q+c;
        const aStr = a >= 0 ? `+${a}` : `${a}`;
        const cStr = c >= 0 ? `+${c}` : `${c}`;
        questions.push(
          `設 \\(f(x)=\\begin{cases}x^2${aStr}, & x\\ge1\\\\ ${b}x${cStr}, & x<1\\end{cases}\\)，求 \\(f(${p})\\) 與 \\(f(${q})\\)。`
        );
        answers.push(
          `簡答：\\(f(${p})=${fp}\\)，\\(f(${q})=${fq}\\)。` +
          `過程：\\(${p}\\ge1\\) 用第一段，\\(f(${p})=${p}^2${aStr}=${fp}\\)；` +
          `\\(${q}<1\\) 用第二段，\\(f(${q})=${b}\\cdot${wrapIfNegative(q)}${cStr}=${fq}\\)。`
        );
      } else if (mode === 2) {
        // f(x) = { x+a  x>k; bx+c  x≤k }
        const a = randInt(1,5), b = randInt(2,4), c = randInt(-5,5);
        const k = randInt(-2,2);
        const m = randInt(1,3);
        const p = k+m, q = k;
        const fp = p+a, fq = b*k+c;
        const aStr = a >= 0 ? `+${a}` : `${a}`;
        const cStr = c >= 0 ? `+${c}` : `${c}`;
        questions.push(
          `設 \\(f(x)=\\begin{cases}x${aStr}, & x>${k}\\\\ ${b}x${cStr}, & x\\le${k}\\end{cases}\\)，求 \\(f(${p})\\) 與 \\(f(${q})\\)。`
        );
        answers.push(
          `簡答：\\(f(${p})=${fp}\\)，\\(f(${q})=${fq}\\)。` +
          `過程：\\(${p}>${k}\\) 用第一段，\\(f(${p})=${p}${aStr}=${fp}\\)；` +
          `\\(${q}\\le${k}\\) 用第二段，\\(f(${q})=${b}\\cdot${wrapIfNegative(q)}${cStr}=${fq}\\)。`
        );
      } else if (mode === 3) {
        // f(x) = { x^2  x≥0; 2x+a  x<0 }，求 f(p) 和 f(q)
        const a = randInt(-5,5);
        const p = randInt(1,4), q = randInt(-4,-1);
        const fp = p*p, fq = 2*q+a;
        const aStr = a >= 0 ? `+${a}` : `${a}`;
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
        const a = randInt(5,10), d = randInt(-5,0);
        const b = randInt(1,3), c = randInt(-3,3);
        const k1 = randInt(-3,-1), k2 = randInt(1,3);
        const p = k2+1, q0 = k1+Math.floor((k2-k1)/2), r0 = k1-1;
        const fk2p1 = a, fmid = b*q0+c, fk1m1 = d;
        const cStr = c >= 0 ? `+${c}` : `${c}`;
        questions.push(
          `設 \\(f(x)=\\begin{cases}${a}, & x>${k2}\\\\ ${b}x${cStr}, & ${k1}<x\\le${k2}\\\\ ${d}, & x\\le${k1}\\end{cases}\\)，` +
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  // ── s1-3-2 新增：合成函數計算與反推 ────────────────────────────────
  function buildS132CompositeFunctionSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        // 給 f(x)=ax+b, g(x)=x^2+c，求 f(g(m))
        const a = randInt(1,3), b = randInt(-3,3), c = randInt(-3,3), m = randInt(-3,3);
        const gm = m*m+c, fgm = a*gm+b;
        const bStr = b >= 0 ? `+${b}` : `${b}`;
        const cStr = c >= 0 ? `+${c}` : `${c}`;
        questions.push(
          `設 \\(f(x)=${a}x${bStr}\\)，\\(g(x)=x^2${cStr}\\)，求 \\(f(g(${m}))\\)。`
        );
        answers.push(
          `簡答：\\(${fgm}\\)。` +
          `過程：\\(g(${m})=${m}^2${cStr}=${gm}\\)，` +
          `\\(f(g(${m}))=f(${gm})=${a}\\cdot${wrapIfNegative(gm)}${bStr}=${fgm}\\)。`
        );
      } else if (mode === 1) {
        // 給 f(x)=ax+b，求 f(f(n))
        const a = randInt(2,4), b = randInt(-3,3), n = randInt(-2,2);
        const fn = a*n+b, ffn = a*fn+b;
        const bStr = b >= 0 ? `+${b}` : `${b}`;
        questions.push(`設 \\(f(x)=${a}x${bStr}\\)，求 \\(f(f(${n}))\\)。`);
        answers.push(
          `簡答：\\(${ffn}\\)。` +
          `過程：\\(f(${n})=${a}\\cdot${wrapIfNegative(n)}${bStr}=${fn}\\)，` +
          `\\(f(f(${n}))=f(${fn})=${a}\\cdot${wrapIfNegative(fn)}${bStr}=${ffn}\\)。`
        );
      } else if (mode === 2) {
        // 已知 f(g(x))=ax+b 且 g(x)=x-k，求 f(x)
        // f(x) = ax+(b+ak)
        const a = randInt(1,4), k = randInt(1,3);
        const b = randInt(-4,4);
        const q = b + a*k;
        const bStr = b >= 0 ? `+${b}` : `${b}`;
        const qStr = q >= 0 ? `+${q}` : `${q}`;
        const compStr = b === 0 ? `${a}x` : `${a}x${bStr}`;
        questions.push(
          `已知 \\(f(g(x))=${a}x${bStr}\\) 且 \\(g(x)=x-${k}\\)，求 \\(f(x)\\)。`
        );
        answers.push(
          `簡答：\\(f(x)=${a}x${qStr}\\)。` +
          `過程：設 \\(f(x)=px+q\\)。因 \\(f(g(x))=f(x-${k})=p(x-${k})+q=px${-k*1>=0?'+':''}${-k}p+q\\)，` +
          `比較係數得 \\(p=${a}\\)，\\(-${k}p+q=${b}\\)，解得 \\(q=${q}\\)。`
        );
      } else if (mode === 3) {
        // 已知 g(f(x))=ax+b 且 f(x)=x+k，求 g(x)
        // g(x) = ax+(b-ak)
        const a = randInt(1,4), k = randInt(1,3);
        const b = randInt(-4,4);
        const r = b - a*k;
        const bStr = b >= 0 ? `+${b}` : `${b}`;
        const rStr = r >= 0 ? `+${r}` : `${r}`;
        questions.push(
          `已知 \\(g(f(x))=${a}x${bStr}\\) 且 \\(f(x)=x+${k}\\)，求 \\(g(x)\\)。`
        );
        answers.push(
          `簡答：\\(g(x)=${a}x${rStr}\\)。` +
          `過程：設 \\(g(x)=px+q\\)。因 \\(g(f(x))=g(x+${k})=p(x+${k})+q=px+${k}p+q\\)，` +
          `比較係數得 \\(p=${a}\\)，\\(${k}p+q=${b}\\)，解得 \\(q=${r}\\)。`
        );
      } else {
        // 已知 f 為一次函數且 f(f(x))=a^2x+(a+1)b，求 f(x)=ax+b
        // f(f(x))=a^2*x+a*b+b=a^2*x+b(a+1)
        const a = randInt(2,4), b = randInt(1,4);
        const a2 = a*a, comp_const = b*(a+1);
        const a2Str = a2 === 1 ? 'x' : `${a2}x`;
        const bStr = b >= 0 ? `+${b}` : `${b}`;
        questions.push(
          `設 \\(f(x)\\) 為一次函數且 \\(f(f(x))=${a2}x+${comp_const}\\)，求 \\(f(x)\\)。`
        );
        answers.push(
          `簡答：\\(f(x)=${a}x${bStr}\\)。` +
          `過程：設 \\(f(x)=px+q\\)，則 \\(f(f(x))=p^2x+pq+q=p^2x+q(p+1)\\)。` +
          `比較得 \\(p^2=${a2}\\Rightarrow p=${a}\\)（取正），\\(q(p+1)=${comp_const}\\Rightarrow q=${b}\\)。`
        );
      }
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  // ── s1-3-3 新增：絕對值不等式 ───────────────────────────────────────
  function buildS133AbsoluteValueInequalitySet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        // |x+a| < b → -b-a < x < b-a
        const a = randInt(-3,3), b = randInt(2,6);
        const lo = -b-a, hi = b-a;
        const aStr = a >= 0 ? `+${a}` : `${a}`;
        questions.push(`解不等式 \\(|x${aStr}|<${b}\\)。`);
        answers.push(
          `簡答：\\(${lo}<x<${hi}\\)。` +
          `過程：\\(|x${aStr}|<${b}\\) 等價於 \\(-${b}<x${aStr}<${b}\\)，` +
          `各減 \\(${a}\\) 得 \\(${lo}<x<${hi}\\)。`
        );
      } else if (mode === 1) {
        // |x-a| > b → x < a-b 或 x > a+b
        const a = randInt(-3,3), b = randInt(1,5);
        const lo = a-b, hi = a+b;
        const aStr = a >= 0 ? `-${a}` : `+${-a}`;
        questions.push(`解不等式 \\(|x${aStr}|>${b}\\)。`);
        answers.push(
          `簡答：\\(x<${lo}\\) 或 \\(x>${hi}\\)。` +
          `過程：\\(|x${aStr}|>${b}\\) 等價於 \\(x${aStr}<-${b}\\) 或 \\(x${aStr}>${b}\\)，` +
          `移項得 \\(x<${lo}\\) 或 \\(x>${hi}\\)。`
        );
      } else if (mode === 2) {
        // |2x+a| ≤ b → (-b-a)/2 ≤ x ≤ (b-a)/2，取 a,b 使結果為整數
        const a = randInt(-3,3)*2, b = randInt(2,5)*2;
        const lo = (-b-a)/2, hi = (b-a)/2;
        const aStr = a >= 0 ? `+${a}` : `${a}`;
        questions.push(`解不等式 \\(|2x${aStr}|\\le${b}\\)。`);
        answers.push(
          `簡答：\\(${lo}\\le x\\le${hi}\\)。` +
          `過程：\\(-${b}\\le2x${aStr}\\le${b}\\)，` +
          `減 \\(${a}\\) 得 \\(${-b-a}\\le2x\\le${b-a}\\)，` +
          `除以 2 得 \\(${lo}\\le x\\le${hi}\\)。`
        );
      } else if (mode === 3) {
        // |2x-a| ≥ b → x ≤ (a-b)/2 或 x ≥ (a+b)/2，同樣取偶數
        const a = randInt(-2,4)*2, b = randInt(1,4)*2;
        const lo = (a-b)/2, hi = (a+b)/2;
        const aStr = a >= 0 ? `-${a}` : `+${-a}`;
        questions.push(`解不等式 \\(|2x${aStr}|\\ge${b}\\)。`);
        answers.push(
          `簡答：\\(x\\le${lo}\\) 或 \\(x\\ge${hi}\\)。` +
          `過程：\\(2x${aStr}\\le-${b}\\) 或 \\(2x${aStr}\\ge${b}\\)，` +
          `移項除以 2 得 \\(x\\le${lo}\\) 或 \\(x\\ge${hi}\\)。`
        );
      } else {
        // |x+a| ≤ |x-b|，a,b≥0，a+b>0 → x ≤ (b-a)/2
        const a = randInt(0,3)*2, b = randInt(1,4)*2;
        const mid = (b-a)/2;
        const aStr = a === 0 ? 'x' : `x+${a}`;
        const bStr = b === 0 ? 'x' : `x-${b}`;
        questions.push(`解不等式 \\(|${aStr}|\\le|${bStr}|\\)。`);
        answers.push(
          `簡答：\\(x\\le${mid}\\)。` +
          `過程：兩邊平方（均非負），\\((x+${a})^2\\le(x-${b})^2\\)，` +
          `展開得 \\(x^2+${2*a}x+${a*a}\\le x^2-${2*b}x+${b*b}\\)，` +
          `化簡得 \\(${2*(a+b)}x\\le${b*b-a*a}\\)，故 \\(x\\le${mid}\\)。`
        );
      }
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  // ── s1-3-3 新增：兩絕對值不等式 ────────────────────────────────────
  function buildS133DoubleAbsoluteInequalitySet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        // |x-a|+|x-b| ≤ c，a<b，c>b-a，解為 [(a+b-c)/2, (a+b+c)/2]
        const a = randInt(0,2);
        const b = a + 2*randInt(1,3);
        const extra = 2*randInt(1,3);
        const c = (b-a)+extra;
        const lo = (a+b-c)/2, hi = (a+b+c)/2;
        questions.push(`解不等式 \\(|x-${a}|+|x-${b}|\\le${c}\\)。`);
        answers.push(
          `簡答：\\(${lo}\\le x\\le${hi}\\)。` +
          `過程：分三段討論。\\(x\\le${a}\\) 時，左式 \\(=${a}-x+${b}-x=${a+b}-2x\\le${c}\\)，得 \\(x\\ge${lo}\\)；` +
          `\\(${a}\\le x\\le${b}\\) 時，左式 \\(=x-${a}+${b}-x=${b-a}\\le${c}\\) 恆成立；` +
          `\\(x\\ge${b}\\) 時，左式 \\(=x-${a}+x-${b}=2x-${a+b}\\le${c}\\)，得 \\(x\\le${hi}\\)。` +
          `綜合得 \\(${lo}\\le x\\le${hi}\\)。`
        );
      } else if (mode === 1) {
        // |x-a|+|x-b| ≥ c，a<b，c>b-a，解為 x≤(a+b-c)/2 或 x≥(a+b+c)/2
        const a = randInt(0,2);
        const b = a + 2*randInt(1,3);
        const extra = 2*randInt(1,3);
        const c = (b-a)+extra;
        const lo = (a+b-c)/2, hi = (a+b+c)/2;
        questions.push(`解不等式 \\(|x-${a}|+|x-${b}|\\ge${c}\\)。`);
        answers.push(
          `簡答：\\(x\\le${lo}\\) 或 \\(x\\ge${hi}\\)。` +
          `過程：分段討論。\\(x\\ge${b}\\) 時，\\(2x-${a+b}\\ge${c}\\) 得 \\(x\\ge${hi}\\)；` +
          `\\(${a}\\le x\\le${b}\\) 時，\\(${b-a}\\ge${c}\\) 不成立（因 \\(${b-a}<${c}\\)）；` +
          `\\(x\\le${a}\\) 時，\\(${a+b}-2x\\ge${c}\\) 得 \\(x\\le${lo}\\)。`
        );
      } else if (mode === 2) {
        // |x-a| < |x-b|，a<b → x < (a+b)/2（點比較靠近 a）
        const a = randInt(0,3);
        const diff = 2*randInt(1,4);
        const b = a + diff;
        const mid = (a+b)/2;
        questions.push(`解不等式 \\(|x-${a}|<|x-${b}|\\)。`);
        answers.push(
          `簡答：\\(x<${mid}\\)。` +
          `過程：兩邊平方，\\((x-${a})^2<(x-${b})^2\\)，` +
          `展開得 \\(-${2*a}x+${a*a}<-${2*b}x+${b*b}\\)，` +
          `整理得 \\(${2*(b-a)}x<${b*b-a*a}=${(b-a)*(b+a)}\\)，` +
          `故 \\(x<${mid}\\)。（幾何意義：\\(x\\) 到 \\(${a}\\) 的距離小於到 \\(${b}\\) 的距離，即 \\(x\\) 位於 \\(${a}\\) 與 \\(${b}\\) 的中點 \\(${mid}\\) 左側。）`
        );
      } else if (mode === 3) {
        // |x-a| > |x-b|，a<b → x > (a+b)/2（點比較靠近 b）
        const a = randInt(0,3);
        const diff = 2*randInt(1,4);
        const b = a + diff;
        const mid = (a+b)/2;
        questions.push(`解不等式 \\(|x-${a}|>|x-${b}|\\)。`);
        answers.push(
          `簡答：\\(x>${mid}\\)。` +
          `過程：兩邊平方，\\((x-${a})^2>(x-${b})^2\\)，` +
          `整理得 \\(${2*(b-a)}x>${b*b-a*a}\\)，故 \\(x>${mid}\\)。` +
          `（幾何意義：\\(x\\) 位於中點 \\(${mid}\\) 右側。）`
        );
      } else {
        // |x+a|+|x-b| ≤ c，a>0，b>0，解為 [(b-a-c)/2, (b-a+c)/2]
        const a = randInt(1,3);
        const b = randInt(1,3);
        const extra = 2*randInt(1,3);
        const c = (a+b)+extra;
        const lo = (b-a-c)/2, hi = (b-a+c)/2;
        const aStr = `x+${a}`;
        const bStr = `x-${b}`;
        questions.push(`解不等式 \\(|${aStr}|+|${bStr}|\\le${c}\\)。`);
        answers.push(
          `簡答：\\(${lo}\\le x\\le${hi}\\)。` +
          `過程：改寫為 \\(|x-(-${a})|+|x-${b}|\\le${c}\\)，` +
          `兩定點為 \\(-${a}\\) 與 \\(${b}\\)，距離為 \\(${a+b}\\)，\\(c=${c}>${a+b}\\)，有解。` +
          `利用公式，解為 \\(\\frac{-${a}+${b}-${c}}{2}\\le x\\le\\frac{-${a}+${b}+${c}}{2}\\)，即 \\(${lo}\\le x\\le${hi}\\)。`
        );
      }
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }


  function buildS133QuadraticDiscriminantSolveSet(count) {
    const templates = [
      {
        q: '解不等式 \\(x^2+2x-3>0\\)。',
        a: '簡答：\\(x<-3\\) 或 \\(x>1\\)。過程：因式分解得 \\((x+3)(x-1)>0\\)。兩根為 -3 與 1，開口向上，所以在兩根外側為正。',
      },
      {
        q: '解不等式 \\(x^2-6x+9\\le0\\)。',
        a: '簡答：\\(x=3\\)。過程：\\(x^2-6x+9=(x-3)^2\\)。平方數恆不小於 0，要滿足 \\((x-3)^2\\le0\\)，只能等於 0，所以 \\(x=3\\)。',
      },
      {
        q: '解不等式 \\(x^2+x+1>0\\)。',
        a: '簡答：全體實數。過程：判別式 \\(D=1-4=-3<0\\)，且領導係數為正，所以圖形全在 \\(x\\) 軸上方，對所有實數皆大於 0。',
      },
      {
        q: '解不等式 \\(-x^2+3x-5>0\\)。',
        a: '簡答：無實數解。過程：\\(-x^2+3x-5\\) 的判別式為 \\(9-20=-11<0\\)，且領導係數為負，所以圖形全在 \\(x\\) 軸下方，不可能大於 0。',
      },
      {
        q: '求滿足 \\(-4\\le x^2-5x\\le6\\) 的整數解共有幾個。',
        a: '簡答：6 個。過程：由 \\(x^2-5x\\ge-4\\) 得 \\((x-1)(x-4)\\ge0\\)，所以 \\(x\\le1\\) 或 \\(x\\ge4\\)。由 \\(x^2-5x\\le6\\) 得 \\((x+1)(x-6)\\le0\\)，所以 \\(-1\\le x\\le6\\)。交集為 \\([-1,1]\\cup[4,6]\\)，整數為 \\(-1,0,1,4,5,6\\)，共 6 個。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS133QuadraticAlwaysSignParameterSet(count) {
    const templates = [
      {
        q: '若 \\(kx^2+2x+k>0\\) 對所有實數 \\(x\\) 恆成立，求實數 \\(k\\) 的範圍。',
        a: '簡答：\\(k>1\\)。過程：二次式要恆正，需領導係數 \\(k>0\\)，且判別式 \\(D=4-4k^2<0\\)。解得 \\(k>1\\) 或 \\(k<-1\\)，再與 \\(k>0\\) 取交集，得 \\(k>1\\)。',
      },
      {
        q: '已知二次函數 \\(f(x)=ax^2-2x+a\\) 之值恆為正，求實數 \\(a\\) 的範圍。',
        a: '簡答：\\(a>1\\)。過程：恆正需 \\(a>0\\) 且 \\(D=(-2)^2-4a^2<0\\)。得 \\(a^2>1\\)，與 \\(a>0\\) 合併為 \\(a>1\\)。',
      },
      {
        q: '若 \\(x^2+ax+(a+1)<0\\) 沒有實數解，求 \\(a\\) 的範圍。',
        a: '簡答：\\(2-2\\sqrt2\\le a\\le2+2\\sqrt2\\)。過程：不等式 \\(<0\\) 沒有實數解，表示二次式對所有實數皆 \\(\\ge0\\)。因開口向上，需 \\(D=a^2-4(a+1)\\le0\\)，即 \\(a^2-4a-4\\le0\\)，解得範圍如上。',
      },
      {
        q: '設 \\(m\\) 為實數。若 \\(y=-x^2+4mx-1\\) 的圖形恆在直線 \\(y=2x-3m\\) 的下方，求 \\(m\\) 的範圍。',
        a: '簡答：\\(0<m<\\frac14\\)。過程：恆在下方表示 \\(-x^2+4mx-1-(2x-3m)<0\\)，即 \\(-x^2+(4m-2)x+3m-1<0\\) 對所有實數成立。開口已向下，只需判別式小於 0：\\((4m-2)^2+4(3m-1)<0\\)，化簡為 \\(16m^2-4m<0\\)，故 \\(0<m<\\frac14\\)。',
      },
      {
        q: '已知對任意實數 \\(x\\)，分式 \\(\\frac{x^2+kx+k}{x^2+x+2}\\le1\\) 恆成立，求 \\(k\\) 的範圍。',
        a: '簡答：\\(k=1\\)。過程：分母 \\(x^2+x+2\\) 判別式小於 0 且開口向上，所以恆正。移項得 \\(x^2+kx+k\\le x^2+x+2\\)，即 \\((k-1)x+(k-2)\\le0\\) 對所有實數成立。一次式要對所有實數恆 \\(\\le0\\)，斜率需為 0，故 \\(k=1\\)，此時常數為 -1，成立。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS133QuadraticInverseCoefficientSet(count) {
    const templates = [
      {
        q: '若不等式 \\(ax^2+5x+b>0\\) 的解為 \\(\\frac13<x<\\frac12\\)，求 \\(a+b\\) 之值。',
        a: '簡答：\\(-7\\)。過程：解在兩根之間，故開口向下。設 \\(ax^2+5x+b=a(x-\\frac13)(x-\\frac12)\\)。一次項係數為 \\(-\\frac56a=5\\)，得 \\(a=-6\\)。常數項 \\(b=\\frac a6=-1\\)，所以 \\(a+b=-7\\)。',
      },
      {
        q: '已知 \\(ax^2+bx+10>0\\) 的解為 \\(-2<x<5\\)，求數對 \\((a,b)\\)。',
        a: '簡答：\\((a,b)=(-1,3)\\)。過程：解在兩根之間，故 \\(a<0\\)，且兩根為 -2,5。設 \\(ax^2+bx+10=a(x+2)(x-5)\\)。常數項為 \\(-10a=10\\)，得 \\(a=-1\\)，所以 \\(b=-3a=3\\)。',
      },
      {
        q: '設 \\(f(x)=ax^2+bx+c\\)。若 \\(f(x)>0\\) 的解為 \\(1<x<4\\)，且 \\(f(0)=-4\\)，求 \\(f(x)\\)。',
        a: '簡答：\\(f(x)=-x^2+5x-4\\)。過程：解在兩根之間且為正，表示開口向下。設 \\(f(x)=a(x-1)(x-4)\\)。代入 \\(f(0)=4a=-4\\)，得 \\(a=-1\\)，所以 \\(f(x)=-(x-1)(x-4)=-x^2+5x-4\\)。',
      },
      {
        q: '已知 \\(ax^2+bx+c>0\\) 的解為 \\(-2<x<5\\)，求 \\(ax^2-bx+c<0\\) 的解。',
        a: '簡答：\\(x<-5\\) 或 \\(x>2\\)。過程：令 \\(g(x)=ax^2-bx+c=f(-x)\\)。若 \\(g(x)<0\\)，等同於 \\(f(-x)<0\\)。原本 \\(f(x)>0\\) 在 \\((-2,5)\\)，故 \\(f(x)<0\\) 在外側；換成 \\(-x\\) 後，\\(g(x)>0\\) 在 \\(-5<x<2\\)，所以 \\(g(x)<0\\) 為 \\(x<-5\\) 或 \\(x>2\\)。',
      },
      {
        q: '若 \\(|ax+1|\\le b\\) 的解為 \\(-1\\le x\\le5\\)，反求實數 \\(a,b\\)。',
        a: '簡答：\\((a,b)=(-\\frac12,\\frac32)\\)。過程：\\(|ax+1|\\le b\\) 的解區間中心為 \\(-\\frac1a\\)。給定區間中心為 2，所以 \\(-\\frac1a=2\\)，得 \\(a=-\\frac12\\)。半長為 3，且半長等於 \\(\\frac{b}{|a|}\\)，所以 \\(b=3\\cdot\\frac12=\\frac32\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS133QuadraticInequalityFromSolutionSet(count) {
    const questions = [];
    const answers = [];

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
      const f1 = `(x${r1 >= 0 ? '-' : '+'}${Math.abs(r1)})`;
      const f2 = `(x${r2 >= 0 ? '-' : '+'}${Math.abs(r2)})`;

      questions.push(
        `已知二次不等式 \\(${lead}x^2+mx+n${relation}\\) 的解為 \\(${interval}\\)，求 \\((m,n)\\)。`
      );
      answers.push(
        `簡答：\\((m,n)=(${b},${c})\\)。過程：解的端點就是兩根 \\(${r1}\\)、\\(${r2}\\)，且首項係數為 \\(${lead}\\)，所以二次式為 \\(${lead}${f1}${f2}=${poly}\\)。因此 \\(m=${b},n=${c}\\)。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS133QuadraticSubstitutionSolutionSet(count) {
    const templates = [
      {
        q: '設 \\(f(x)>0\\) 的解為 \\(-4<x<2\\)，求 \\(f(2x)<0\\) 的解。',
        a: '簡答：\\(x<-2\\) 或 \\(x>1\\)。過程：\\(f(2x)>0\\) 需 \\(-4<2x<2\\)，即 \\(-2<x<1\\)。因此 \\(f(2x)<0\\) 為外側且不含端點，得 \\(x<-2\\) 或 \\(x>1\\)。',
      },
      {
        q: '若 \\(f(x)=-x^2+ax+b>0\\) 的解是 \\(-2<x<3\\)，求 \\(f(x-1)<0\\) 的解。',
        a: '簡答：\\(x<-1\\) 或 \\(x>4\\)。過程：\\(f(x-1)>0\\) 表示 \\(-2<x-1<3\\)，所以 \\(-1<x<4\\)。故 \\(f(x-1)<0\\) 為外側且不含端點，得 \\(x<-1\\) 或 \\(x>4\\)。',
      },
      {
        q: '設二次函數 \\(f(x)\\) 滿足 \\(f(x)\\ge0\\) 的解為 \\(1\\le x\\le3\\)，求 \\(f(2x-1)\\ge0\\) 的解。',
        a: '簡答：\\(1\\le x\\le2\\)。過程：把輸入 \\(2x-1\\) 放進原解區間，得 \\(1\\le2x-1\\le3\\)。解得 \\(1\\le x\\le2\\)。',
      },
      {
        q: '已知 \\(f(3x-1)<0\\) 的解為 \\(5<x<9\\)，求 \\(f(x)<0\\) 的解。',
        a: '簡答：\\(14<x<26\\)。過程：令 \\(u=3x-1\\)。當 \\(5<x<9\\) 時，\\(14<u<26\\)。因此原函數 \\(f(u)<0\\) 的解為 \\(14<u<26\\)，改寫成 \\(x\\) 即 \\(14<x<26\\)。',
      },
      {
        q: '若 \\(f(x)\\le0\\) 的解為 \\(-3\\le x\\le5\\)，求 \\(f(\\frac{x}{2})>0\\) 的解。',
        a: '簡答：\\(x<-6\\) 或 \\(x>10\\)。過程：\\(f(\\frac{x}{2})\\le0\\) 表示 \\(-3\\le\\frac{x}{2}\\le5\\)，所以 \\(-6\\le x\\le10\\)。要求 \\(>0\\)，取外側得 \\(x<-6\\) 或 \\(x>10\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS133QuadraticAppliedSubstitutionSet(count) {
    const templates = [
      {
        q: '解指數不等式 \\(2\\cdot4^x-17\\cdot2^x+8>0\\)。',
        a: '簡答：\\(x<-1\\) 或 \\(x>3\\)。過程：令 \\(t=2^x>0\\)，原式成為 \\(2t^2-17t+8>0\\)，因式分解為 \\((2t-1)(t-8)>0\\)，得 \\(t<\\frac12\\) 或 \\(t>8\\)。換回 \\(2^x\\)，得 \\(x<-1\\) 或 \\(x>3\\)。',
      },
      {
        q: '求滿足 \\(4^x-6\\cdot2^x+8\\le0\\) 的 \\(x\\) 範圍。',
        a: '簡答：\\(1\\le x\\le2\\)。過程：令 \\(t=2^x>0\\)，則 \\(4^x=t^2\\)。原式為 \\(t^2-6t+8\\le0\\)，即 \\((t-2)(t-4)\\le0\\)，得 \\(2\\le t\\le4\\)。換回 \\(2^x\\)，得 \\(1\\le x\\le2\\)。',
      },
      {
        q: '長 6、寬 4 的池塘外圍鋪等寬 \\(x\\) 的小路。若路面總面積介於 56 與 96 之間，求 \\(x\\) 範圍。',
        a: '簡答：\\(2<x<3\\)。過程：外框尺寸為 \\((6+2x)(4+2x)\\)，路面面積為 \\((6+2x)(4+2x)-24=4x^2+20x\\)。解 \\(56<4x^2+20x<96\\)，即 \\(14<x^2+5x<24\\)，得 \\(2<x<3\\)。',
      },
      {
        q: '用長為 \\(x,x+1,x+2\\) 的三條線段圍成一鈍角三角形，求 \\(x\\) 的範圍。',
        a: '簡答：\\(1<x<3\\)。過程：先要能成三角形：\\(x+(x+1)>x+2\\)，得 \\(x>1\\)。最大邊為 \\(x+2\\)，鈍角需 \\((x+2)^2>x^2+(x+1)^2\\)，化簡得 \\((x-3)(x+1)<0\\)，所以 \\(-1<x<3\\)。合併得 \\(1<x<3\\)。',
      },
      {
        q: '某稅率為 \\(r\\%\\) 時，銷售額估計為 \\(800(1-\\frac{r}{50})\\) 萬元。若稅收至少 112 萬元，求 \\(r\\) 的範圍。',
        a: '簡答：\\(10\\le r\\le40\\)。過程：稅收為 \\(\\frac r{100}\\cdot800(1-\\frac r{50})\\)。令其 \\(\\ge112\\)，化簡得 \\(r(50-r)\\ge700\\)，即 \\(r^2-50r+700\\le0\\)。兩根為 10 與 40，所以 \\(10\\le r\\le40\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS133HighDegreeSignInequalitySet(count) {
    const templates = [
      {
        q: '解不等式 \\((x+1)(x-2)^2(x-3)^3\\le0\\)。',
        a: '簡答：\\([-1,3]\\)。過程：根為 -1、2、3，其中 2 為偶數重根，不改變正負號；-1 與 3 為奇數重根，會改變正負號。由右側為正往左判號，可得小於等於 0 的範圍為 \\([-1,3]\\)。',
      },
      {
        q: '解不等式 \\((x-1)^{101}(x-2)^{102}(x-5)^{103}(x-9)^{104}<0\\)。',
        a: '簡答：\\((1,2)\\cup(2,5)\\)。過程：偶數重根 2、9 不改變正負號，奇數重根 1、5 會改變正負號。由最右側為正判號，負的區間為 \\((1,5)\\)，但 \\(x=2\\) 使乘積為 0，嚴格小於 0 時需排除，所以為 \\((1,2)\\cup(2,5)\\)。',
      },
      {
        q: '解不等式 \\((x^2+x+3)(x+1)^4(x-2)^3(x+3)^5(x-4)^7>0\\)。',
        a: '簡答：\\((-3,-1)\\cup(-1,2)\\cup(4,\\infty)\\)。過程：\\(x^2+x+3\\) 恆正，\\(x=-1\\) 是偶數重根不變號；\\(-3,2,4\\) 是奇數重根。由右側為正往左判號，嚴格大於 0 的範圍如上，且各根皆不包含。',
      },
      {
        q: '若 \\(-5\\le x\\le6\\)，判定 \\((x+3)^5(x-2)^2(x-4)^3\\ge0\\) 的整數解個數。',
        a: '簡答：6 個。過程：根為 -3、2、4，其中 2 為偶數重根不變號。判號得解集為 \\((-\\infty,-3]\\cup[4,\\infty)\\)。與 \\([-5,6]\\) 交集為 \\([-5,-3]\\cup[4,6]\\)，整數共有 \\(-5,-4,-3,4,5,6\\)，共 6 個。',
      },
      {
        q: '已知三次多項式 \\(f(x)\\) 的領導係數為正，且圖形通過 \\((-2,0),(-1,0),(1,0)\\)，求 \\(f(x)<0\\) 的範圍。',
        a: '簡答：\\((-\\infty,-2)\\cup(-1,1)\\)。過程：可看作 \\(f(x)=a(x+2)(x+1)(x-1)\\)，且 \\(a>0\\)。由最右側為正，依序跨過 1、-1、-2 變號，得負值區間為 \\((-\\infty,-2)\\cup(-1,1)\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS133RationalInequalitySet(count) {
    const templates = [
      {
        q: '解分式不等式 \\(\\frac{x-1}{x+3}<-2\\)。',
        a: '簡答：\\(-3<x<-\\frac53\\)。過程：移項得 \\(\\frac{x-1+2x+6}{x+3}<0\\)，即 \\(\\frac{3x+5}{x+3}<0\\)。臨界點為 \\(-3,-\\frac53\\)，判號得 \\(-3<x<-\\frac53\\)。',
      },
      {
        q: '解分式不等式 \\(\\frac{(x+1)^2(x+2)}{x+2}>0\\)，並注意定義域。',
        a: '簡答：\\(x\\in\\mathbb R\\)，且 \\(x\\ne-2,-1\\)。過程：原式要求 \\(x\\ne-2\\)。約分後為 \\((x+1)^2>0\\)，故還需 \\(x\\ne-1\\)。所以解為所有實數但排除 -2 與 -1。',
      },
      {
        q: '求不等式 \\(\\frac{x^2-5x+6}{x^2+5x+4}<1\\) 的實數解。',
        a: '簡答：\\((-4,-1)\\cup(\\frac15,\\infty)\\)。過程：移項通分得 \\(\\frac{-10x+2}{(x+1)(x+4)}<0\\)。臨界點為 -4、-1、\\(\\frac15\\)，判號得解集如上，且分母為 0 的點不可取。',
      },
      {
        q: '解分式不等式 \\(\\frac1{x+1}+\\frac1{x+4}\\ge\\frac1{x+3}+\\frac1{x+2}\\)。',
        a: '簡答：\\((-4,-3)\\cup[-\\frac52,-2)\\cup(-1,\\infty)\\)。過程：移項通分可得 \\(\\frac{2x+5}{(x+1)(x+2)(x+3)(x+4)}\\ge0\\)。臨界點為 -4、-3、\\(-\\frac52\\)、-2、-1，且 -4、-3、-2、-1 不可取，判號得解集。',
      },
      {
        q: '判定 \\(y=\\frac{x-2}{(x^2+x+1)(x-1)}\\ge0\\) 的 \\(x\\) 值範圍。',
        a: '簡答：\\((-\\infty,1)\\cup[2,\\infty)\\)。過程：\\(x^2+x+1\\) 恆正，所以只需判定 \\(\\frac{x-2}{x-1}\\ge0\\)，且 \\(x\\ne1\\)。判號得 \\((-\\infty,1)\\cup[2,\\infty)\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS133SameSolutionTransformSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;
      const a = randInt(-5, 1);
      const b = a + randInt(3, 7);
      const fa = formatS131LinearFactor(a);
      const fb = formatS131LinearFactor(b);

      if (type === 0) {
        const c = i % 2 === 0 ? a - randInt(1, 3) : b + randInt(1, 3);
        const fc = formatS131LinearFactor(c);
        questions.push(`解不等式 \\((${fa})(${fb})(${fc})^2\\le0\\)，並說明它和 \\((${fa})(${fb})\\le0\\) 是否有相同解集。`);
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
          `簡答：\\((-\\infty,${a}]\\cup[${b},\\infty)\\)。過程：\\(${positive}=${hBase}^2+${d}\\)，對所有實數都大於 0，所以不改變不等式正負號。只需解 \\((${fa})(${fb})\\ge0\\)，得到 \\(x\\le${a}\\) 或 \\(x\\ge${b}\\)。`
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS133AdvancedAlwaysSignSet(count) {
    const templates = [
      {
        q: '若對所有實數 \\(x\\)，二次式 \\(kx^2+2x+k\\) 的值恆為正，求 \\(k\\) 的範圍。',
        a: '簡答：\\(k>1\\)。過程：恆正需 \\(k>0\\) 且判別式 \\(4-4k^2<0\\)。解得 \\(k>1\\) 或 \\(k<-1\\)，再與 \\(k>0\\) 取交集，得 \\(k>1\\)。',
      },
      {
        q: '已知 \\((a^2-1)x^2+(a-1)x+1>0\\) 對任意實數 \\(x\\) 恆成立，求 \\(a\\) 的範圍。',
        a: '簡答：\\(a<-\\frac53\\) 或 \\(a\\ge1\\)。過程：若為真正二次式，需 \\(a^2-1>0\\) 且判別式 \\((a-1)^2-4(a^2-1)<0\\)，化簡得 \\((3a+5)(a-1)>0\\)，所以 \\(a<-\\frac53\\) 或 \\(a>1\\)。另 \\(a=1\\) 時原式為 1，亦成立。',
      },
      {
        q: '設 \\(f(x)=(a+3)x^2-4x+a\\) 恆正，求實數 \\(a\\) 的範圍。',
        a: '簡答：\\(a>1\\)。過程：恆正需 \\(a+3>0\\)，且 \\(D=16-4a(a+3)<0\\)。化簡得 \\(a^2+3a-4>0\\)，即 \\((a+4)(a-1)>0\\)。再與 \\(a>-3\\) 取交集，得 \\(a>1\\)。',
      },
      {
        q: '若不等式 \\(x^2+ax+(a+1)<0\\) 沒有實數解，求 \\(a\\) 的範圍。',
        a: '簡答：\\(2-2\\sqrt2\\le a\\le2+2\\sqrt2\\)。過程：開口向上且 \\(<0\\) 無解，表示二次式恆 \\(\\ge0\\)。故 \\(D=a^2-4(a+1)\\le0\\)，解得 \\(2-2\\sqrt2\\le a\\le2+2\\sqrt2\\)。',
      },
      {
        q: '討論實數 \\(k\\)，使得 \\(\\frac{x^2+kx+k}{x^2+x+2}\\le1\\) 對所有實數 \\(x\\) 恆成立。',
        a: '簡答：\\(k=1\\)。過程：分母 \\(x^2+x+2\\) 恆正。移項後得 \\((k-1)x+(k-2)\\le0\\) 對所有實數成立。一次式若對所有實數有上界不超過 0，斜率必為 0，故 \\(k=1\\)，此時常數為 -1，成立。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS133AdvancedInverseProblemSet(count) {
    const templates = [
      {
        q: '若不等式 \\(ax^2+5x+b>0\\) 的解為 \\(-\\frac12<x<3\\)，求 \\(a+b\\)。',
        a: '簡答：1。過程：設 \\(ax^2+5x+b=a(x+\\frac12)(x-3)\\)。一次項係數為 \\(-\\frac52a=5\\)，得 \\(a=-2\\)。常數 \\(b=-\\frac32a=3\\)，所以 \\(a+b=1\\)。',
      },
      {
        q: '已知二次不等式 \\(ax^2+bx+10>0\\) 的解為 \\(-2<x<5\\)，求 \\(2ax^2-bx+5<0\\) 的解。',
        a: '簡答：\\(x<-\\frac52\\) 或 \\(x>1\\)。過程：由前半題可得 \\((a,b)=(-1,3)\\)。代入得 \\(-2x^2-3x+5<0\\)，等同於 \\(2x^2+3x-5>0\\)，因式分解為 \\((2x+5)(x-1)>0\\)，故 \\(x<-\\frac52\\) 或 \\(x>1\\)。',
      },
      {
        q: '設 \\(f(x)\\) 為二次函數，若 \\(f(x)>0\\) 的解是 \\(-1<x<3\\)，求 \\(f(3x-5)<0\\) 的解。',
        a: '簡答：\\(x<\\frac43\\) 或 \\(x>\\frac83\\)。過程：\\(f(3x-5)>0\\) 需 \\(-1<3x-5<3\\)，解得 \\(\\frac43<x<\\frac83\\)。要求 \\(<0\\)，取外側且不含端點。',
      },
      {
        q: '三次不等式 \\(a(x+2)(x-1)(x-4)\\le0\\) 的解為 \\(-2\\le x\\le1\\) 或 \\(x\\ge4\\)，求 \\(a\\) 的正負。',
        a: '簡答：\\(a<0\\)。過程：三根為 -2、1、4。若 \\(a<0\\)，右端 \\((4,\\infty)\\) 為負，依序變號後 \\(\\le0\\) 的範圍正是 \\([-2,1]\\cup[4,\\infty)\\)。所以 \\(a<0\\)。',
      },
      {
        q: '若 \\(f(3x-1)<0\\) 的解為 \\(5<x<9\\)，求 \\(f(2x+5)\\ge0\\) 的解。',
        a: '簡答：\\(x\\le\\frac92\\) 或 \\(x\\ge\\frac{21}{2}\\)。過程：由 \\(f(3x-1)<0\\) 的解 \\(5<x<9\\)，可知 \\(f(u)<0\\) 的解為 \\(14<u<26\\)。所以 \\(f(2x+5)<0\\) 時 \\(14<2x+5<26\\)，即 \\(\\frac92<x<\\frac{21}{2}\\)。要求 \\(\\ge0\\)，取外側。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS133GeometricAppliedInequalitySet(count) {
    const templates = [
      {
        q: '用長為 \\(x,x+1,x+2\\) 的三條線段圍成一鈍角三角形，求 \\(x\\) 的範圍。',
        a: '簡答：\\(1<x<3\\)。過程：能成三角形需 \\(x+(x+1)>x+2\\)，得 \\(x>1\\)。最大邊為 \\(x+2\\)，鈍角需 \\((x+2)^2>x^2+(x+1)^2\\)，化簡得 \\((x-3)(x+1)<0\\)，即 \\(-1<x<3\\)。合併得 \\(1<x<3\\)。',
      },
      {
        q: '長方形池塘外圍長 6、寬 4，外圈鋪等寬 \\(x\\) 的小路。若路面總面積須介於 56 與 96 之間，求 \\(x\\) 的範圍。',
        a: '簡答：\\(2<x<3\\)。過程：外框面積為 \\((6+2x)(4+2x)\\)，路面面積為 \\((6+2x)(4+2x)-24=4x^2+20x\\)。解 \\(56<4x^2+20x<96\\)，即 \\(14<x^2+5x<24\\)，得 \\(2<x<3\\)。',
      },
      {
        q: '已知垂直上拋高度為 \\(y=58.8t-4.9t^2\\)。求高度不低於 98 公尺的時間長度。',
        a: '簡答：8 秒。過程：解 \\(58.8t-4.9t^2\\ge98\\)。兩邊除以 4.9 得 \\(-t^2+12t\\ge20\\)，即 \\(t^2-12t+20\\le0\\)。根為 2 與 10，所以時間為 \\(2\\le t\\le10\\)，長度 8 秒。',
      },
      {
        q: '牆角用 9 公尺護欄圍成長方形，靠牆兩邊不需護欄。若面積至少 18 且不超過 20 平方公尺，求其中一邊長 \\(x\\) 的範圍。',
        a: '簡答：\\([3,4]\\cup[5,6]\\)。過程：兩邊長可設為 \\(x\\) 與 \\(9-x\\)，面積為 \\(x(9-x)\\)。解 \\(18\\le x(9-x)\\le20\\)。由 \\(x(9-x)\\ge18\\) 得 \\(3\\le x\\le6\\)；由 \\(x(9-x)\\le20\\) 得 \\(x\\le4\\) 或 \\(x\\ge5\\)。交集為 \\([3,4]\\cup[5,6]\\)。',
      },
      {
        q: '某稅率為 \\(r\\%\\) 時，銷售額估計為 \\(800(1-\\frac{r}{50})\\) 萬元。若稅收至少 112 萬元，求稅率 \\(r\\) 的範圍。',
        a: '簡答：\\(10\\le r\\le40\\)。過程：稅收為 \\(\\frac r{100}\\cdot800(1-\\frac r{50})\\)。令其 \\(\\ge112\\)，化簡得 \\(r(50-r)\\ge700\\)，即 \\(r^2-50r+700\\le0\\)。兩根為 10 與 40，所以 \\(10\\le r\\le40\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS133CubicInequalitySet(count) {
    const templates = [
      {
        q: '解不等式 \\((x+1)(x-2)(x-3)\\le0\\)。',
        a: '簡答：\\((-\\infty,-1]\\cup[2,3]\\)。過程：三個零點為 -1、2、3，且領導係數為正。由最右側為正開始判號，依序跨過 3、2、-1 都會變號，因此 \\(\\le0\\) 的範圍為 \\((-\\infty,-1]\\cup[2,3]\\)。',
      },
      {
        q: '已知三次函數 \\(f(x)\\) 的領導係數為正，且與 \\(x\\) 軸交於 \\(-4,0,3\\)，求 \\(f(x)<0\\) 的解。',
        a: '簡答：\\((-\\infty,-4)\\cup(0,3)\\)。過程：領導係數為正，所以最右側 \\((3,\\infty)\\) 為正。三個交點皆為一次穿越，正負號每跨一根改變一次，因此負值區間為 \\((-\\infty,-4)\\cup(0,3)\\)。',
      },
      {
        q: '若 \\(f(x)=x(x+2)(x-2)\\)，求不等式 \\(f(x-1)\\ge0\\) 的解。',
        a: '簡答：\\([-1,1]\\cup[3,\\infty)\\)。過程：先令 \\(u=x-1\\)。\\(f(u)=u(u+2)(u-2)\\) 的根為 -2、0、2，且領導係數為正，所以 \\(f(u)\\ge0\\) 時 \\(-2\\le u\\le0\\) 或 \\(u\\ge2\\)。代回 \\(u=x-1\\)，得 \\(-1\\le x\\le1\\) 或 \\(x\\ge3\\)。',
      },
      {
        q: '解不等式 \\(x^3-5x^2+2x+8<0\\)。',
        a: '簡答：\\((-\\infty,-1)\\cup(2,4)\\)。過程：因式分解 \\(x^3-5x^2+2x+8=(x+1)(x-2)(x-4)\\)。三根為 -1、2、4，領導係數為正，由最右側為正往左交替判號，負值區間為 \\((-\\infty,-1)\\cup(2,4)\\)。',
      },
      {
        q: '已知三次函數 \\(f(x)\\) 的領導係數為正，且圖形通過 \\((-1,0),(1,0),(2,0)\\)，求 \\(f(x)>0\\) 的範圍。',
        a: '簡答：\\((-1,1)\\cup(2,\\infty)\\)。過程：可設 \\(f(x)=a(x+1)(x-1)(x-2)\\)，其中 \\(a>0\\)。由最右側為正，跨過每個一次根都會變號，所以正值區間為 \\((-1,1)\\cup(2,\\infty)\\)。',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
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


  // ── s1-3 新增生成器 ────────────────────────────────────────────────────────

  // s1-3-2: 由函數值決定一次函數 (5 modes)
  function buildS132LinearFunctionFromPointsSet(count) {
    function sn(k) { return formatS122SignedNumber(k); }
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
        const a = [2, 3, -2, -3][randInt(0, 3)];
        const b = randInt(-3, 3);
        const ff0 = a * b + b;         // f(b) = ab+b
        const ff1 = a * (a + b) + b;   // f(a+b) = a(a+b)+b
        return {
          q: `設 \\(f(x)=ax+b\\)，已知 \\(f(f(0))=${ff0}\\)，\\(f(f(1))=${ff1}\\)，求 \\(a\\) 與 \\(b\\)。`,
          a: `簡答：\\(a=${a}\\)，\\(b=${b}\\)。過程：\\(f(0)=b\\)，\\(f(f(0))=f(b)=ab+b=b(a+1)=${ff0}\\)。\\(f(1)=a+b\\)，\\(f(f(1))=a(a+b)+b=a^2+ab+b=${ff1}\\)。兩式相減得 \\(a^2=${ff1 - ff0}\\)，故 \\(a=${a}\\)，代回得 \\(b=${b}\\)。`,
        };
      },
      // Mode 4: 已知f(2x+1)=px+q，求f(x)
      () => {
        const a = [1, 2, 3][randInt(0, 2)];
        const b = randInt(-4, 4);
        const coeffX = 2 * a;
        const constTerm = a + b;
        const constStr = constTerm === 0 ? '' : (constTerm > 0 ? '+' + constTerm : '' + constTerm);
        return {
          q: `設 \\(f(x)\\) 為一次函數，已知 \\(f(2x+1)=${coeffX}x${constStr}\\)，求 \\(f(x)\\)。`,
          a: `簡答：\\(f(x)=${fmtL(a, b)}\\)。過程：令 \\(t=2x+1\\)，則 \\(x=\\dfrac{t-1}{2}\\)。\\(f(t)=${coeffX}\\cdot\\dfrac{t-1}{2}${constStr}=${a}t${sn(b)}\\)。所以 \\(f(x)=${fmtL(a, b)}\\)。`,
        };
      },
    ];
    const questions = [], answers = [];
    for (let i = 0; i < count; i++) {
      const { q, a } = modes[i % modes.length]();
      questions.push(q);
      answers.push(a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  // s1-3-2: 由三點求二次函數係數 (5 modes)
  function buildS132QuadraticThreePointsSet(count) {
    function sn(k) { return formatS122SignedNumber(k); }
    function fmtQ(a, b, c) {
      // format ax²+bx+c
      const aTerm = a === 1 ? 'x^2' : a === -1 ? '-x^2' : a + 'x^2';
      const bTerm = b === 0 ? '' : (b === 1 ? '+x' : b === -1 ? '-x' : (b > 0 ? '+' + b + 'x' : b + 'x'));
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
        const r1 = randInt(-3, 0);
        const r2 = randInt(1, 4);
        // f(x) = a(x-r1)(x-r2), f(0) = a*(-r1)*(-r2) = a*r1*r2 (sign: r1≤0,r2>0 → r1*r2≤0)
        const yint = a * r1 * r2;
        const bCoef = -a * (r1 + r2);
        const cCoef = a * r1 * r2;
        const r1Str = r1 > 0 ? '-' + r1 : '+' + Math.abs(r1);
        const r2Str = r2 > 0 ? '-' + r2 : '+' + Math.abs(r2);
        return {
          q: `已知二次函數圖形與 \\(x\\) 軸交於 \\((${r1},0)\\) 和 \\((${r2},0)\\)，且 \\(y\\) 軸截距為 \\(${yint}\\)，求此函數。`,
          a: `簡答：\\(f(x)=${fmtQ(a, bCoef, cCoef)}\\)。過程：設 \\(f(x)=a(x${r1Str})(x${r2Str})\\)。代入 \\(x=0\\)：\\(f(0)=a\\cdot(${-r1})\\cdot(${-r2})=${yint}\\)，得 \\(a=${a}\\)。展開得 \\(f(x)=${fmtQ(a, bCoef, cCoef)}\\)。`,
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
          a: `簡答：\\(f(${p})=${yp}\\)。過程：由 \\(f(${x1})=${y1}\\)：\\(${x1 * x1}+${x1}a+b=${y1}\\)；由 \\(f(${x2})=${y2}\\)：\\(${x2 * x2}+${x2}a+b=${y2}\\)。兩式相減：\\(${x2 - x1}a=${y2 - y1 - (x2 * x2 - x1 * x1)}\\)，得 \\(a=${a}\\)，\\(b=${b}\\)。\\(f(${p})=${yp}\\)。`,
        };
      },
    ];
    const questions = [], answers = [];
    for (let i = 0; i < count; i++) {
      const { q, a } = modes[i % modes.length]();
      questions.push(q);
      answers.push(a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
          a: `簡答：\\(x\\geq${sol}\\)。過程：需 \\(x\\geq0\\) 且 \\(x\\geq0\\)（RHS須非負），平方得 \\(x+${a}\\leq x^2\\)，即 \\(x^2-x-${a}\\geq0\\)，\\((x-${sol})(x+${k})\\geq0\\)，解得 \\(x\\leq-${k}\\) 或 \\(x\\geq${sol}\\)。結合 \\(x\\geq0\\) 得 \\(x\\geq${sol}\\)。`,
        };
      },
      // Mode 3: √(a-x) > x-b, clean triples: (a,b,c): solution x<c
      // (a=5,b=3,c=4),(a=10,b=4,c=6),(a=4,b=2,c=3),(a=11,b=5,c=7),(a=3,b=1,c=2)
      () => {
        const triples = [[5,3,4],[10,4,6],[4,2,3],[11,5,7],[3,1,2]];
        const [a, b, c] = triples[randInt(0, 4)];
        return {
          q: `解不等式 \\(\\sqrt{${a}-x}>x-${b}\\)。`,
          a: `簡答：\\(x<${c}\\)（且 \\(x\\leq${a}\\)）。過程：定義域 \\(x\\leq${a}\\)。當 \\(x<${b}\\) 時，右側為負，左側非負，不等式自動成立。當 \\(x\\geq${b}\\) 時，兩側非負，平方得 \\(${a}-x>(x-${b})^2\\)，整理得 \\((x-${b})(x-${c})<0\\)（或類似），解得 \\(${b}\\leq x<${c}\\)。合併：\\(x<${c}\\)。`,
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
    const questions = [], answers = [];
    for (let i = 0; i < count; i++) {
      const { q, a } = modes[i % modes.length]();
      questions.push(q);
      answers.push(a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
        const fa = fmtAbsTerm(a), fb = fmtAbsTerm(b);
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
        const fa = fmtAbsTerm(a), fb = fmtAbsTerm(b), fc = fmtAbsTerm(c);
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
        const minVal = (d - a) + (c - b);
        const fa = fmtAbsTerm(a), fb = fmtAbsTerm(b), fc = fmtAbsTerm(c), fd = fmtAbsTerm(d);
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
        const slopeMid = p - q;     // slope in (a,b): p-q < 0
        const fa = fmtAbsTerm(a), fb = fmtAbsTerm(b);
        return {
          q: `求 \\(f(x)=${p}${fa}+${q}${fb}\\) 的最小值。`,
          a: `簡答：最小值為 \\(${minVal}\\)，在 \\(x=${b}\\) 時取得。過程：\\(f(x)\\) 的斜率：\\(x<${a}\\) 時為 \\(-(${p}+${q})\\)（遞減），\\(${a}<x<${b}\\) 時為 \\(${p}-${q}=${slopeMid}\\)（仍遞減），\\(x>${b}\\) 時為 \\(${p}+${q}\\)（遞增）。最小值在斜率由負轉正的 \\(x=${b}\\) 處：\\(f(${b})=${p}\\cdot${b - a}+0=${minVal}\\)。`,
        };
      },
    ];
    const questions = [], answers = [];
    for (let i = 0; i < count; i++) {
      const { q, a } = modes[i % modes.length]();
      questions.push(q);
      answers.push(a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    's1-2-1-linear-fractional-region-extrema': {
      type: 'drill',
      title: '線性分式在區域上的極值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS121LinearFractionalRegionExtremaSet(5);
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

  const bundleFingerprint = 's1-bundle-v20260701-s1-3-sanmin-v1';
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== 'object') return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
