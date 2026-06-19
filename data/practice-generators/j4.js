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

  function formatTerm(coef, variable = 'x') {
    if (coef === 1) return variable;
    if (coef === -1) return `-${variable}`;
    return `${coef}${variable}`;
  }

  function formatLinearExpr(a, b) {
    if (a === 0) return `${b}`;
    const xPart = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
    if (b === 0) return xPart;
    return `${xPart}${b > 0 ? '+' : ''}${b}`;
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

  function divFraction(a, b) {
    return makeFraction(a.num * b.den, a.den * b.num);
  }

  function absFraction(a) {
    return { num: Math.abs(a.num), den: a.den };
  }

  function buildJ411FindAnFromA1DNSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a1 = pickNonZero(-30, 30);
      const d = pickNonZero(-9, 9);
      const n = randInt(6, 25);
      const an = a1 + (n - 1) * d;
      questions.push(`已知等差數列首項 \\(a_1=${a1}\\)、公差 \\(d=${d}\\)，求第 ${n} 項 \\(a_${n}\\)。`);
      answers.push(`簡答：\\(a_${n}=${an}\\)。`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ411TwoTermsFindA1DSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const m = randInt(2, 8);
      const n = randInt(m + 2, m + 10);
      const d = pickNonZero(-8, 8);
      const a1 = pickNonZero(-25, 25);
      const am = a1 + (m - 1) * d;
      const an = a1 + (n - 1) * d;
      const askMode = i % 2;
      if (askMode === 0) {
        questions.push(`已知等差數列 \\(a_${m}=${am},\\ a_${n}=${an}\\)，求公差 \\(d\\) 與首項 \\(a_1\\)。`);
        answers.push(`簡答：\\(d=${d},\\ a_1=${a1}\\)。`);
      } else {
        const k = randInt(n + 1, n + 10);
        const ak = a1 + (k - 1) * d;
        questions.push(`已知等差數列 \\(a_${m}=${am},\\ a_${n}=${an}\\)，求第 ${k} 項 \\(a_${k}\\)。`);
        answers.push(`簡答：\\(a_${k}=${ak}\\)。`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ411FindNSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a1 = pickNonZero(-20, 20);
      const d = pickNonZero(-8, 8);
      const n = randInt(8, 30);
      const an = a1 + (n - 1) * d;
      questions.push(`等差數列 \\(${a1},\\ ${a1 + d},\\ ${a1 + 2 * d},\\ldots,\\ ${an}\\)，共有幾項？`);
      answers.push(`簡答：${n} 項。`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ411CoreMixedSet(count) {
    const banks = [buildJ411FindAnFromA1DNSet, buildJ411TwoTermsFindA1DSet, buildJ411FindNSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ411MiddleTermApplySet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const x = randInt(3, 12);
        const b = randInt(4, 16);
        const c = 2 * b - x;
        questions.push(`已知 \\(${x},\\ b,\\ ${c}\\) 三數成等差數列，求 \\(b\\)。`);
        answers.push(`簡答：\\(b=${b}\\)。`);
      } else if (mode === 1) {
        const a = randInt(2, 12);
        const b = randInt(3, 12);
        const x = 2 * b - a;
        questions.push(`若 \\(${a},\\ x,\\ ${b}\\) 三數成等差數列，求 \\(x\\)。`);
        answers.push(`簡答：\\(x=${x}\\)。`);
      } else if (mode === 2) {
        const p = randInt(2, 8);
        const x = randInt(2, 10);
        const y = randInt(2, 10);
        // 2(px+1)=(px+y)+(px-y+2) always true by design; ask x-like linear solve
        const left = 2 * (p * x + 1);
        const rightC = (p + 1) * x - 5;
        questions.push(`設 \\(${p}x+1,\\ ${p}x+${y},\\ ${p}x-${y + 2}\\) 成等差數列，求 \\(x\\)。`);
        answers.push(`簡答：\\(x=${x}\\)。`);
      } else {
        const s = randInt(5, 20);
        const p = randInt(2, 12);
        const q = randInt(2, 12);
        questions.push(`設兩數的等差中項為 ${s}，且兩數之積為 ${p * q}，求這兩數。`);
        answers.push(`簡答：${p} 與 ${q}。`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ411InsertNumbersSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const a = pickNonZero(-30, 30);
        const d = pickNonZero(-8, 8);
        const m = randInt(2, 10);
        const b = a + (m + 1) * d;
        questions.push(`在 ${a} 與 ${b} 之間插入 ${m} 個數使其成等差數列，求新公差 \\(d\\)。`);
        answers.push(`簡答：\\(d=${d}\\)。`);
      } else if (mode === 1) {
        const a = pickNonZero(-30, 30);
        const d = pickNonZero(-6, 6);
        const m = randInt(3, 12);
        const b = a + (m + 1) * d;
        const k = randInt(2, m);
        const target = a + k * d;
        questions.push(`在 ${a} 與 ${b} 之間插入 ${m} 個數成等差數列，求插入的第 ${k} 個數。`);
        answers.push(`簡答：${target}。`);
      } else if (mode === 2) {
        const a = pickNonZero(-20, 20);
        const d = pickNonZero(-5, 5);
        const m = randInt(4, 15);
        const b = a + (m + 1) * d;
        questions.push(`在 ${a} 與 ${b} 之間插入 \\(n\\) 個數使其成等差數列，若公差為 ${d}，求 \\(n\\)。`);
        answers.push(`簡答：\\(n=${m}\\)。`);
      } else {
        const a = pickNonZero(-20, 20);
        const d = pickNonZero(-7, 7);
        const m = randInt(5, 20);
        const b = a + (m + 1) * d;
        const idx = randInt(1, m);
        const x = a + idx * d;
        questions.push(`在 ${a} 與 ${b} 間插入 ${m} 個數成等差數列，求插入後第 ${idx} 個數。`);
        answers.push(`簡答：${x}。`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ411RangeMultipleCountSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const k = [3, 4, 5, 6, 7, 8][randInt(0, 5)];
        const L = randInt(1, 120);
        const R = L + randInt(80, 260);
        const cnt = Math.floor(R / k) - Math.floor((L - 1) / k);
        questions.push(`在 ${L} 到 ${R} 的整數中，${k} 的倍數有多少個？`);
        answers.push(`簡答：${cnt} 個。`);
      } else if (mode === 1) {
        const d = [2, 3, 4, 5, 6, 7][randInt(0, 5)];
        const r = randInt(0, d - 1);
        const L = randInt(1, 120);
        const R = L + randInt(80, 260);
        const cnt = Math.floor((R - r) / d) - Math.floor((L - 1 - r) / d);
        questions.push(`在 ${L} 到 ${R} 的整數中，除以 ${d} 餘 ${r} 的數共有多少個？`);
        answers.push(`簡答：${cnt} 個。`);
      } else if (mode === 2) {
        const k = [4, 6, 8, 9, 10, 12][randInt(0, 5)];
        const L = randInt(1, 150);
        const R = L + randInt(90, 260);
        const cnt = Math.floor(R / k) - Math.floor((L - 1) / k);
        questions.push(`在 ${L} 到 ${R} 的整數中，能被 ${k} 整除的數有多少個？`);
        answers.push(`簡答：${cnt} 個。`);
      } else {
        const k = [5, 7, 9][randInt(0, 2)];
        const L = randInt(1, 100);
        const R = L + randInt(100, 260);
        const cnt = Math.floor(R / k) - Math.floor((L - 1) / k);
        questions.push(`在整數區間 [${L}, ${R}] 中，${k} 的倍數共有多少個？`);
        answers.push(`簡答：${cnt} 個。`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ411CommonTermTwoAPSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      const d1 = [2, 3, 4, 5, 6][randInt(0, 4)];
      const d2 = [3, 4, 5, 6, 7][randInt(0, 4)];
      const L = (d1 * d2) / gcdInt(d1, d2);
      const t = randInt(2, 8);
      const firstCommon = t * L + randInt(0, 2);
      const a1 = firstCommon - d1 * randInt(1, 3);
      const b1 = firstCommon - d2 * randInt(1, 3);
      const c1 = firstCommon;
      const c2 = firstCommon + L;
      const c3 = firstCommon + 2 * L;
      if (mode === 0) {
        questions.push(
          `數列甲為 ${a1}, ${a1 + d1}, ${a1 + 2 * d1}, ...；數列乙為 ${b1}, ${b1 + d2}, ${b1 + 2 * d2}, ...，求前 3 個共同項。`
        );
        answers.push(`簡答：${c1}、${c2}、${c3}。`);
      } else if (mode === 1) {
        const n = randInt(5, 12);
        const cn = firstCommon + (n - 1) * L;
        questions.push(
          `數列 A：${a1}, ${a1 + d1}, ${a1 + 2 * d1}, ...；數列 B：${b1}, ${b1 + d2}, ${b1 + 2 * d2}, ...，求共同項形成新數列的第 ${n} 項。`
        );
        answers.push(`簡答：${cn}。`);
      } else if (mode === 2) {
        questions.push(
          `已知兩等差數列 ${a1}, ${a1 + d1}, ${a1 + 2 * d1}, ... 與 ${b1}, ${b1 + d2}, ${b1 + 2 * d2}, ...，求最小共同項。`
        );
        answers.push(`簡答：${firstCommon}。`);
      } else {
        questions.push(`若數列甲首項 ${a1} 公差 ${d1}；數列乙首項 ${b1} 公差 ${d2}，求最小共同項。`);
        answers.push(`簡答：${firstCommon}。`);
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function formatApList(a1, d, visibleCount = 4) {
    return Array.from({ length: visibleCount }, (_, index) => a1 + index * d).join(', ');
  }

  function formatSignedAdd(value) {
    return value >= 0 ? `+${value}` : `${value}`;
  }

  function formatPairSum(a, b) {
    return `${a}${formatSignedAdd(b)}`;
  }

  function formatSnQuadratic(p, q) {
    const quad = p === 1 ? 'n^2' : `${p}n^2`;
    if (q === 0) return quad;
    if (q === 1) return `${quad}+n`;
    if (q === -1) return `${quad}-n`;
    return `${quad}${formatSignedAdd(q)}n`;
  }

  function formatLinearN(coef, constant) {
    const nPart = coef === 1 ? 'n' : coef === -1 ? '-n' : `${coef}n`;
    return `${nPart}${constant === 0 ? '' : formatSignedAdd(constant)}`;
  }

  function formatApNthFormula(a1, d) {
    return `${a1}${d >= 0 ? `+${d}` : d}(n-1)`;
  }

  function latexSub(base, index) {
    return `${base}_{${index}}`;
  }

  function formatApListLatex(a1, d, visibleCount = 4) {
    return `\\(${formatApList(a1, d, visibleCount)}, \\ldots\\)`;
  }

  function powInt(base, exponent) {
    let result = 1;
    for (let i = 0; i < exponent; i += 1) result *= base;
    return result;
  }

  function powFraction(frac, exponent) {
    let result = makeFraction(1, 1);
    for (let i = 0; i < exponent; i += 1) result = mulFraction(result, frac);
    return result;
  }

  function formatFractionLatexForFactor(frac) {
    const value = makeFraction(frac.num, frac.den);
    const body = formatRatioLatex(value);
    return value.den === 1 && value.num > 0 ? body : `\\left(${body}\\right)`;
  }

  function formatRatioLatex(frac) {
    const value = makeFraction(frac.num, frac.den);
    return formatFraction(value.num, value.den);
  }

  function formatGeometricTermLatex(value) {
    if (typeof value === 'number') return `${value}`;
    return formatFraction(value.num, value.den);
  }

  function formatGeometricListLatex(a1, ratio, visibleCount = 4) {
    const terms = [];
    let current = makeFraction(a1.num, a1.den);
    for (let i = 0; i < visibleCount; i += 1) {
      terms.push(formatGeometricTermLatex(current));
      current = mulFraction(current, ratio);
    }
    return `\\(${terms.join(', ')}, \\ldots\\)`;
  }

  function geometricTerm(a1, ratio, n) {
    return mulFraction(a1, powFraction(ratio, n - 1));
  }

  function formatGeometricNthFormula(a1, ratio, n) {
    return `${formatGeometricTermLatex(a1)}\\cdot ${formatFractionLatexForFactor(ratio)}^{${n - 1}}`;
  }

  function inlineMath(text) {
    return `\\(${text}\\)`;
  }

  function apSumFromFirstLast(n, first, last) {
    return (n * (first + last)) / 2;
  }

  function firstInRangeByRemainder(start, divisor, remainder) {
    const mod = ((remainder % divisor) + divisor) % divisor;
    const offset = (mod - (start % divisor) + divisor) % divisor;
    return start + offset;
  }

  function buildJ413SeriesFormulaCoreSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a1 = pickNonZero(-18, 24);
        const d = pickNonZero(-8, 8);
        const n = randInt(8, 24);
        const an = a1 + (n - 1) * d;
        const sum = apSumFromFirstLast(n, a1, an);
        questions.push(`已知一等差級數的首項為 ${a1}，公差為 ${d}，求前 ${n} 項和 \\(${latexSub('S', n)}\\)。`);
        answers.push(
          `簡答：\\(${latexSub('S', n)}=${sum}\\)。過程：第 ${n} 項 \\(${latexSub('a', n)}=a_1+(${n}-1)d=${a1}+${n - 1}\\cdot(${d})=${an}\\)，所以 \\(${latexSub('S', n)}=\\frac{${n}(${formatPairSum(a1, an)})}{2}=${sum}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const a1 = pickNonZero(-20, 20);
        const d = pickNonZero(-7, 7);
        const n = randInt(9, 22);
        const an = a1 + (n - 1) * d;
        const sum = apSumFromFirstLast(n, a1, an);
        questions.push(`等差級數 ${formatApListLatex(a1, d)} 中，求前 ${n} 項和。`);
        answers.push(
          `簡答：${sum}。過程：首項為 ${a1}，公差為 ${d}，末項 \\(${latexSub('a', n)}=${a1}+${n - 1}\\cdot(${d})=${an}\\)，故 \\(${latexSub('S', n)}=\\frac{${n}(${formatPairSum(a1, an)})}{2}=${sum}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const a1 = pickNonZero(-25, 25);
        const n = randInt(8, 20);
        const an = a1 + (n - 1) * pickNonZero(-6, 6);
        const sum = apSumFromFirstLast(n, a1, an);
        questions.push(`已知一等差級數的首項為 ${a1}，第 ${n} 項為 ${an}，求前 ${n} 項和 \\(${latexSub('S', n)}\\)。`);
        answers.push(
          `簡答：\\(${latexSub('S', n)}=${sum}\\)。過程：已知首項與末項，可直接配對求和：\\(${latexSub('S', n)}=\\frac{${n}(${formatPairSum(a1, an)})}{2}=${sum}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const n = randInt(8, 18);
        const d = pickNonZero(-6, 6);
        const a1 = pickNonZero(-18, 24);
        const an = a1 + (n - 1) * d;
        const sumN = apSumFromFirstLast(n, a1, an);
        const m = n + randInt(8, 22);
        const am = a1 + (m - 1) * d;
        const sumM = apSumFromFirstLast(m, a1, am);
        questions.push(
          `設一等差級數的前 ${n} 項和為 ${sumN}，前 ${m} 項和為 ${sumM}，且首項為 ${a1}，求此級數的公差。`
        );
        answers.push(
          `簡答：公差 \\(d=${d}\\)。過程：由 \\(S_n=\\frac{n[2a_1+(n-1)d]}{2}\\)，代入 \\(${sumN}=\\frac{${n}[2\\cdot${a1}+${n - 1}d]}{2}\\)，解得 \\(d=${d}\\)；再代入前 ${m} 項和可驗算為 ${sumM}。`
        );
        continue;
      }
      const a1 = randInt(2, 14);
      const d = randInt(2, 7);
      const n = randInt(10, 20);
      const an = a1 + (n - 1) * d;
      const sum = apSumFromFirstLast(n, a1, an);
      questions.push(`已知等差級數首項為 ${a1}，末項為 ${an}，總和為 ${sum}，求此級數共有幾項。`);
      answers.push(
        `簡答：${n} 項。過程：設共有 \\(n\\) 項，\\(S_n=\\frac{n(${formatPairSum(a1, an)})}{2}=${sum}\\)，所以 \\(n=\\frac{2\\cdot${sum}}{${formatPairSum(a1, an)}}=${n}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ413RangeMultipleSumSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const divisor = [4, 5, 6, 8, 9, 10, 12][randInt(0, 6)];
        const start = randInt(1, 120);
        const end = start + randInt(180, 520);
        const first = firstInRangeByRemainder(start, divisor, 0);
        const last = end - (((end % divisor) - 0 + divisor) % divisor);
        const n = (last - first) / divisor + 1;
        const sum = apSumFromFirstLast(n, first, last);
        questions.push(`求 ${start} 到 ${end} 的整數中，所有 ${divisor} 的倍數之總和。`);
        answers.push(
          `簡答：${sum}。過程：第一個倍數是 ${first}，最後一個倍數是 ${last}，公差為 ${divisor}，項數 \\(n=\\frac{${last}-${first}}{${divisor}}+1=${n}\\)，總和 \\(S=\\frac{${n}(${first}+${last})}{2}=${sum}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const divisor = [5, 6, 7, 8, 9, 11, 13][randInt(0, 6)];
        const remainder = randInt(1, divisor - 1);
        const start = randInt(40, 180);
        const end = start + randInt(160, 420);
        const first = firstInRangeByRemainder(start, divisor, remainder);
        const last = end - (((end % divisor) - remainder + divisor) % divisor);
        const n = (last - first) / divisor + 1;
        const sum = apSumFromFirstLast(n, first, last);
        questions.push(`求 ${start} 到 ${end} 的整數中，除以 ${divisor} 餘 ${remainder} 的所有整數之和。`);
        answers.push(
          `簡答：${sum}。過程：符合條件的數形成等差數列，首項 ${first}、末項 ${last}、公差 ${divisor}，項數 \\(\\frac{${last}-${first}}{${divisor}}+1=${n}\\)，所以總和為 \\(\\frac{${n}(${first}+${last})}{2}=${sum}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const start = randInt(1, 80);
        const end = start + randInt(80, 180);
        const first = start % 2 === 1 ? start : start + 1;
        const last = end % 2 === 1 ? end : end - 1;
        const n = (last - first) / 2 + 1;
        const sum = apSumFromFirstLast(n, first, last);
        questions.push(`求 ${start} 到 ${end} 的整數中，所有奇數的總和。`);
        answers.push(
          `簡答：${sum}。過程：奇數依序為 ${first}, ${first + 2}, ${first + 4}, \\ldots, ${last}，項數 \\(\\frac{${last}-${first}}{2}+1=${n}\\)，總和 \\(\\frac{${n}(${first}+${last})}{2}=${sum}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const divisor = [3, 4, 5, 6, 7][randInt(0, 4)];
        const remainder = randInt(1, divisor - 1);
        const start = randInt(20, 120);
        const end = start + randInt(120, 320);
        const first = firstInRangeByRemainder(start, divisor, remainder);
        const last = end - (((end % divisor) - remainder + divisor) % divisor);
        const n = (last - first) / divisor + 1;
        const sum = apSumFromFirstLast(n, first, last);
        questions.push(`求 ${start} 到 ${end} 的整數中，除以 ${divisor} 餘 ${remainder} 的整數共有幾個？其總和為何？`);
        answers.push(
          `簡答：共 ${n} 個，總和 ${sum}。過程：首項 ${first}、末項 ${last}、公差 ${divisor}，所以項數 \\(\\frac{${last}-${first}}{${divisor}}+1=${n}\\)，總和 \\(\\frac{${n}(${first}+${last})}{2}=${sum}\\)。`
        );
        continue;
      }
      const divisor = [7, 11, 13][randInt(0, 2)];
      const start = randInt(100, 260);
      const end = start + randInt(380, 740);
      const first = firstInRangeByRemainder(start, divisor, 0);
      const last = end - (((end % divisor) + divisor) % divisor);
      const n = (last - first) / divisor + 1;
      const sum = apSumFromFirstLast(n, first, last);
      questions.push(`求 ${start} 到 ${end} 的整數中，能被 ${divisor} 整除的數共有幾個？其總和為何？`);
      answers.push(
        `簡答：共 ${n} 個，總和 ${sum}。過程：符合條件的第一個數是 ${first}，最後一個數是 ${last}，公差 ${divisor}，故項數為 ${n}，總和為 \\(\\frac{${n}(${first}+${last})}{2}=${sum}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ413MaxMinSumSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const dAbs = randInt(2, 7);
        let a1 = randInt(30, 85);
        while (a1 % dAbs === 0) a1 = randInt(30, 85);
        const d = -dAbs;
        const firstNegativeIndex = Math.floor(a1 / dAbs) + 2;
        const lastPositiveIndex = firstNegativeIndex - 1;
        const lastPositive = a1 + (lastPositiveIndex - 1) * d;
        const maxSum = apSumFromFirstLast(lastPositiveIndex, a1, lastPositive);
        questions.push(
          `有一等差級數為 ${formatApListLatex(a1, d)}，求：(1) 從第幾項開始為負數？(2) 前幾項的和最大？最大值為多少？`
        );
        answers.push(
          `簡答：(1) 第 ${firstNegativeIndex} 項開始為負數；(2) 前 ${lastPositiveIndex} 項和最大，最大值 ${maxSum}。過程：\\(a_n=${formatApNthFormula(a1, d)}\\)。解 \\(a_n<0\\) 得第一個負項為第 ${firstNegativeIndex} 項；最大和要加到最後一個正項，第 ${lastPositiveIndex} 項為 ${lastPositive}，所以最大和 \\(\\frac{${lastPositiveIndex}(${formatPairSum(a1, lastPositive)})}{2}=${maxSum}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const d = randInt(3, 8);
        const firstPositiveIndex = randInt(8, 18);
        let a1 = -d * (firstPositiveIndex - 1) + randInt(1, d);
        while (Math.abs(a1) % d === 0) {
          a1 = -d * (firstPositiveIndex - 1) + randInt(1, d);
        }
        const lastNegativeIndex = firstPositiveIndex - 1;
        const lastNegative = a1 + (lastNegativeIndex - 1) * d;
        const minSum = apSumFromFirstLast(lastNegativeIndex, a1, lastNegative);
        questions.push(`等差級數首項為 ${a1}，公差為 ${d}。若前 \\(n\\) 項和會先變小再變大，求 \\(S_n\\) 的最小值。`);
        answers.push(
          `簡答：最小值 ${minSum}。過程：\\(a_n=${formatApNthFormula(a1, d)}\\)。前面都是負項時，總和會越加越小；第一個正項是第 ${firstPositiveIndex} 項，所以最小和在前 ${lastNegativeIndex} 項，\\(${latexSub('S', lastNegativeIndex)}=\\frac{${lastNegativeIndex}(${formatPairSum(a1, lastNegative)})}{2}=${minSum}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const d = -randInt(2, 6);
        let a1 = randInt(35, 85);
        while (a1 % Math.abs(d) === 0) a1 = randInt(35, 85);
        const peakN = Math.floor((a1 - 1) / Math.abs(d)) + 1;
        const an = a1 + (peakN - 1) * d;
        const sum = apSumFromFirstLast(peakN, a1, an);
        questions.push(`已知等差級數首項為 ${a1}，公差為 ${d}，求前幾項和最大？最大值為何？`);
        answers.push(
          `簡答：前 ${peakN} 項和最大，最大值 ${sum}。過程：因為公差為負，項會逐漸變小；和最大時加到最後一個正項。第 ${peakN} 項為 ${an}，下一項為 ${an + d}<0，所以最大和為 \\(${latexSub('S', peakN)}=\\frac{${peakN}(${formatPairSum(a1, an)})}{2}=${sum}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const d = randInt(2, 7);
        let a1 = -randInt(20, 70);
        while (Math.abs(a1) % d === 0) a1 = -randInt(20, 70);
        const firstPositiveIndex = Math.floor(-a1 / d) + 2;
        const lastNegativeIndex = firstPositiveIndex - 1;
        const lastNegative = a1 + (lastNegativeIndex - 1) * d;
        const minSum = apSumFromFirstLast(lastNegativeIndex, a1, lastNegative);
        questions.push(`等差級數 ${formatApListLatex(a1, d)}，若前 \\(n\\) 項和為負數，則 \\(S_n\\) 的最小值為何？`);
        answers.push(
          `簡答：${minSum}。過程：首項為負且公差為正，累加到最後一個負項時總和最小。第 ${lastNegativeIndex} 項為 ${lastNegative}，第 ${firstPositiveIndex} 項開始為正，所以最小值 \\(${latexSub('S', lastNegativeIndex)}=\\frac{${lastNegativeIndex}(${formatPairSum(a1, lastNegative)})}{2}=${minSum}\\)。`
        );
        continue;
      }
      const d = -randInt(2, 6);
      let a1 = randInt(35, 80);
      while (a1 % Math.abs(d) === 0) a1 = randInt(35, 80);
      const lastPositiveIndex = Math.floor((a1 - 1) / Math.abs(d)) + 1;
      const lastPositive = a1 + (lastPositiveIndex - 1) * d;
      const maxSum = apSumFromFirstLast(lastPositiveIndex, a1, lastPositive);
      questions.push(`已知等差級數首項為 ${a1}，公差為 ${d}，求前幾項和最大？此最大值為多少？`);
      answers.push(
        `簡答：前 ${lastPositiveIndex} 項和最大，最大值 ${maxSum}。過程：\\(a_n=${formatApNthFormula(a1, d)}\\)，最後一個正項是第 ${lastPositiveIndex} 項，值為 ${lastPositive}；再下一項為 ${lastPositive + d}<0，所以最大和為 \\(\\frac{${lastPositiveIndex}(${formatPairSum(a1, lastPositive)})}{2}=${maxSum}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ413WordApplicationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const rows = randInt(12, 28);
        const first = randInt(10, 35);
        const d = randInt(2, 5);
        const last = first + (rows - 1) * d;
        const total = apSumFromFirstLast(rows, first, last);
        questions.push(
          `某表演廳共有 ${rows} 排座位，第一排有 ${first} 個座位，每一排比前一排多 ${d} 個，求全廳總座位數。`
        );
        answers.push(
          `簡答：${total} 個座位。過程：各排座位數形成等差數列，首項 ${first}、公差 ${d}、第 ${rows} 排 ${last} 個，所以總數 \\(${latexSub('S', rows)}=\\frac{${rows}(${first}+${last})}{2}=${total}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const days = randInt(10, 21);
        const first = randInt(3, 15);
        const d = randInt(2, 8);
        const last = first + (days - 1) * d;
        const total = apSumFromFirstLast(days, first, last);
        questions.push(`小哲第一天存 ${first} 元，之後每天都比前一天多存 ${d} 元，連續存 ${days} 天後，共存了多少元？`);
        answers.push(
          `簡答：${total} 元。過程：每天存款為等差數列，末日金額 ${last} 元，故總存款 \\(\\frac{${days}(${first}+${last})}{2}=${total}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const layers = randInt(6, 18);
        const top = randInt(1, 6);
        const d = randInt(1, 4);
        const bottom = top + (layers - 1) * d;
        const total = apSumFromFirstLast(layers, top, bottom);
        questions.push(`大賣場將罐頭堆成 ${layers} 層，最上層有 ${top} 罐，每往下一層多 ${d} 罐，求共有幾罐。`);
        answers.push(
          `簡答：${total} 罐。過程：每層罐數為等差數列，最下層 ${bottom} 罐，總罐數 \\(\\frac{${layers}(${top}+${bottom})}{2}=${total}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const seconds = randInt(6, 14);
        const first = randInt(3, 8);
        const d = randInt(3, 10);
        const last = first + (seconds - 1) * d;
        const total = apSumFromFirstLast(seconds, first, last);
        questions.push(
          `一物體第 1 秒落下 ${first} 公尺，之後每一秒比前一秒多落下 ${d} 公尺，求 ${seconds} 秒內共下落多少公尺。`
        );
        answers.push(
          `簡答：${total} 公尺。過程：每秒距離形成等差數列，第 ${seconds} 秒落下 ${last} 公尺，所以總距離 \\(\\frac{${seconds}(${first}+${last})}{2}=${total}\\)。`
        );
        continue;
      }
      const awards = randInt(6, 15);
      const first = randInt(120, 500);
      const d = randInt(50, 300);
      const total = apSumFromFirstLast(awards, first, first + (awards - 1) * d);
      const top = first + (awards - 1) * d;
      questions.push(
        `某公司發放獎金，共 ${awards} 個獎項且金額成等差數列。已知最小獎為 ${first} 元，每一級多 ${d} 元，求最大獎與總獎金。`
      );
      answers.push(
        `簡答：最大獎 ${top} 元，總獎金 ${total} 元。過程：最大獎為第 ${awards} 項，\\(${first}+${awards - 1}\\cdot${d}=${top}\\)；總獎金 \\(\\frac{${awards}(${first}+${top})}{2}=${total}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ413SnRelationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const p = randInt(1, 5);
        const q = pickNonZero(-8, 12);
        const n = randInt(6, 15);
        const an = p * (2 * n - 1) + q;
        questions.push(`已知一等差級數前 \\(n\\) 項和 \\(S_n=${formatSnQuadratic(p, q)}\\)，求此數列的第 ${n} 項。`);
        answers.push(
          `簡答：\\(${latexSub('a', n)}=${an}\\)。過程：\\(a_n=S_n-S_{n-1}\\)。所以 \\(a_n=${formatSnQuadratic(p, q)}-[${p === 1 ? '' : p}(n-1)^2${q === 0 ? '' : `${formatSignedAdd(q)}(n-1)`}]=${formatLinearN(2 * p, q - p)}\\)，代入 \\(n=${n}\\) 得 ${an}。`
        );
        continue;
      }
      if (mode === 1) {
        const p = randInt(2, 6);
        const q = pickNonZero(-10, 14);
        const n = randInt(5, 12);
        const an = p * (2 * n - 1) + q;
        const d = 2 * p;
        questions.push(`設等差級數前 \\(n\\) 項和 \\(S_n=${formatSnQuadratic(p, q)}\\)，求第 ${n} 項及公差。`);
        answers.push(
          `簡答：\\(${latexSub('a', n)}=${an}\\)，公差 \\(d=${d}\\)。過程：\\(a_n=S_n-S_{n-1}=${formatLinearN(2 * p, q - p)}\\)，代入 ${n} 得 ${an}；因 \\(a_n\\) 的一次式係數為 ${2 * p}，故公差為 ${d}。`
        );
        continue;
      }
      if (mode === 2) {
        const d = [2, 4, 6, 8, 10][randInt(0, 4)];
        const p = d / 2;
        const q = pickNonZero(-8, 10);
        questions.push(`若一等差級數前 \\(n\\) 項和為 \\(S_n=${formatSnQuadratic(p, q)}\\)，求其公差 \\(d\\)。`);
        answers.push(
          `簡答：\\(d=${d}\\)。過程：\\(a_n=S_n-S_{n-1}=${formatLinearN(2 * p, q - p)}\\)，所以相鄰兩項差固定為一次式係數 ${2 * p}，即公差 ${d}。`
        );
        continue;
      }
      if (mode === 3) {
        const a1 = pickNonZero(-12, 18);
        const d = pickNonZero(2, 8);
        const s12 = apSumFromFirstLast(12, a1, a1 + 11 * d);
        const s13 = apSumFromFirstLast(13, a1, a1 + 12 * d);
        const a13 = s13 - s12;
        questions.push(`已知等差級數 \\(S_{12}=${s12}\\)、\\(S_{13}=${s13}\\)，求此數列的第 13 項。`);
        answers.push(
          `簡答：\\(a_{13}=${a13}\\)。過程：\\(S_{13}\\) 比 \\(S_{12}\\) 多出第 13 項，所以 \\(a_{13}=S_{13}-S_{12}=${s13}-${s12}=${a13}\\)。`
        );
        continue;
      }
      let p1 = randInt(1, 5);
      let q1 = pickNonZero(-6, 10);
      let p2 = randInt(1, 5);
      let q2 = pickNonZero(-6, 10);
      const askN = randInt(3, 8);
      let a = p1 * (2 * askN - 1) + q1;
      let b = p2 * (2 * askN - 1) + q2;
      while (a <= 0 || b <= 0) {
        p1 = randInt(1, 5);
        q1 = pickNonZero(-6, 10);
        p2 = randInt(1, 5);
        q2 = pickNonZero(-6, 10);
        a = p1 * (2 * askN - 1) + q1;
        b = p2 * (2 * askN - 1) + q2;
      }
      const g = gcdInt(a, b);
      const ra = a / g;
      const rb = b / g;
      questions.push(
        `若兩個等差級數的前 \\(n\\) 項和分別為 \\(S_n=${formatSnQuadratic(p1, q1)}\\)、\\(T_n=${formatSnQuadratic(p2, q2)}\\)，求兩數列第 ${askN} 項的比。`
      );
      answers.push(
        `簡答：${ra}:${rb}。過程：第 \\(n\\) 項為前 \\(n\\) 項和減前 \\(n-1\\) 項和。故 \\(${latexSub('a', askN)}=${a}\\)，\\(${latexSub('b', askN)}=${b}\\)，比為 ${a}:${b}=${ra}:${rb}。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ413ArithmeticSeriesMixedSet(count) {
    const banks = [
      buildJ413SeriesFormulaCoreSet,
      buildJ413RangeMultipleSumSet,
      buildJ413MaxMinSumSet,
      buildJ413WordApplicationSet,
      buildJ413SnRelationSet,
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

  function buildJ412GeometricNthTermSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      let a1;
      let r;
      let n;
      if (mode === 0) {
        a1 = makeFraction(pickNonZero(2, 12), 1);
        r = [makeFraction(2), makeFraction(3), makeFraction(-2)][randInt(0, 2)];
        n = randInt(4, 7);
      } else if (mode === 1) {
        a1 = makeFraction(pickNonZero(-9, 9), 1);
        r = [makeFraction(-2), makeFraction(-3), makeFraction(2), makeFraction(3)][randInt(0, 3)];
        n = randInt(4, 6);
      } else if (mode === 2) {
        a1 = makeFraction([1, 2, 3, 4, 5][randInt(0, 4)], [2, 3, 4][randInt(0, 2)]);
        r = [makeFraction(2), makeFraction(3), makeFraction(-2)][randInt(0, 2)];
        n = randInt(4, 7);
      } else if (mode === 3) {
        const den = [2, 3, 4, 5][randInt(0, 3)];
        a1 = makeFraction(pickNonZero(-6, 6), den);
        r = [makeFraction(-2), makeFraction(2), makeFraction(-3)][randInt(0, 2)];
        n = randInt(4, 7);
      } else {
        r = [makeFraction(1, 2), makeFraction(2, 3), makeFraction(3, 4), makeFraction(-1, 2)][randInt(0, 3)];
        n = randInt(4, 7);
        const scale = powInt(r.den, n - 1);
        a1 = makeFraction(pickNonZero(1, 8) * scale, 1);
      }
      const an = geometricTerm(a1, r, n);
      questions.push(
        `已知一等比數列的首項 \\(a_1=${formatGeometricTermLatex(a1)}\\)，公比 \\(r=${formatRatioLatex(r)}\\)，求第 ${n} 項 \\(${latexSub('a', n)}\\)。`
      );
      answers.push(
        `簡答：\\(${latexSub('a', n)}=${formatGeometricTermLatex(an)}\\)。過程：\\(${latexSub('a', n)}=a_1r^{${n - 1}}=${formatGeometricNthFormula(a1, r, n)}=${formatGeometricTermLatex(an)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ412FindRatioFirstTermSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a1 = makeFraction(pickNonZero(1, 8), 1);
        const r = [makeFraction(2), makeFraction(3), makeFraction(-2), makeFraction(-3)][randInt(0, 3)];
        const m = randInt(2, 4);
        const n = m + 1;
        const am = geometricTerm(a1, r, m);
        const an = geometricTerm(a1, r, n);
        questions.push(
          `設一等比數列的第 ${m} 項為 ${formatGeometricTermLatex(am)}，第 ${n} 項為 ${formatGeometricTermLatex(an)}，求公比 \\(r\\)。`
        );
        answers.push(
          `簡答：\\(r=${formatRatioLatex(r)}\\)。過程：相鄰兩項相除，\\(r=\\frac{a_${n}}{a_${m}}=${formatGeometricTermLatex(an)}\\div ${formatGeometricTermLatex(am)}=${formatRatioLatex(r)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const r = [makeFraction(2), makeFraction(-2), makeFraction(3), makeFraction(-3)][randInt(0, 3)];
        const a1 = makeFraction(pickNonZero(1, 6), 1);
        const m = randInt(2, 4);
        const n = m + 3;
        const am = geometricTerm(a1, r, m);
        const an = geometricTerm(a1, r, n);
        questions.push(
          `已知一等比數列的第 ${m} 項為 ${formatGeometricTermLatex(am)}，第 ${n} 項為 ${formatGeometricTermLatex(an)}，且公比為整數，求公比 \\(r\\)。`
        );
        answers.push(
          `簡答：\\(r=${formatRatioLatex(r)}\\)。過程：\\(\\frac{${latexSub('a', n)}}{${latexSub('a', m)}}=r^{${n - m}}\\)，所以 \\(r^${n - m}=${formatGeometricTermLatex(an)}\\div ${formatGeometricTermLatex(am)}=${formatRatioLatex(powFraction(r, n - m))}\\)。因為 ${n - m} 是奇數，符號可一起判定，得 \\(r=${formatRatioLatex(r)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const a1 = makeFraction(pickNonZero(2, 10), 1);
        const r = [makeFraction(2), makeFraction(3), makeFraction(-2)][randInt(0, 2)];
        const m = randInt(3, 5);
        const am = geometricTerm(a1, r, m);
        questions.push(
          `已知一等比數列的第 ${m} 項為 ${formatGeometricTermLatex(am)}，公比 \\(r=${formatRatioLatex(r)}\\)，求首項 \\(a_1\\)。`
        );
        answers.push(
          `簡答：\\(a_1=${formatGeometricTermLatex(a1)}\\)。過程：\\(a_${m}=a_1r^{${m - 1}}\\)，所以 \\(a_1=${formatGeometricTermLatex(am)}\\div ${formatFractionLatexForFactor(r)}^{${m - 1}}=${formatGeometricTermLatex(a1)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const r = [makeFraction(1, 2), makeFraction(2, 3), makeFraction(-1, 2)][randInt(0, 2)];
        const m = randInt(3, 5);
        const a1 = makeFraction(pickNonZero(1, 7) * powInt(r.den, m - 1), 1);
        const am = geometricTerm(a1, r, m);
        questions.push(
          `已知一等比數列的第 ${m} 項為 ${formatGeometricTermLatex(am)}，公比 \\(r=${formatRatioLatex(r)}\\)，求首項 \\(a_1\\)。`
        );
        answers.push(
          `簡答：\\(a_1=${formatGeometricTermLatex(a1)}\\)。過程：\\(a_${m}=a_1r^{${m - 1}}\\)，所以 \\(a_1=${formatGeometricTermLatex(am)}\\div ${formatFractionLatexForFactor(r)}^{${m - 1}}=${formatGeometricTermLatex(a1)}\\)。`
        );
        continue;
      }
      const a1 = makeFraction(pickNonZero(1, 9), 1);
      const r = [makeFraction(-2), makeFraction(-3), makeFraction(2), makeFraction(3)][randInt(0, 3)];
      const m = [4, 6][randInt(0, 1)];
      const am = geometricTerm(a1, r, m);
      questions.push(
        `一等比數列的首項為 ${formatGeometricTermLatex(a1)}，第 ${m} 項為 ${formatGeometricTermLatex(am)}，求公比 \\(r\\)。`
      );
      answers.push(
        `簡答：\\(r=${formatRatioLatex(r)}\\)。過程：\\(a_${m}=a_1r^{${m - 1}}\\)，所以 \\(r^{${m - 1}}=${formatGeometricTermLatex(am)}\\div ${formatGeometricTermLatex(a1)}=${formatRatioLatex(powFraction(r, m - 1))}\\)。因為 ${m - 1} 是奇數，符號可一起判定，得 \\(r=${formatRatioLatex(r)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ412GeometricMeanUnknownSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = randInt(2, 12);
        const c = a * [4, 9, 16][randInt(0, 2)];
        const yAbs = Math.sqrt(a * c);
        questions.push(`已知 ${a} 與 ${c} 的等比中項為 \\(y\\)，求 \\(y\\) 的值。`);
        answers.push(
          `簡答：\\(y=\\pm ${yAbs}\\)。過程：三數成等比時，中項平方等於兩端乘積，\\(y^2=${a}\\cdot${c}=${a * c}\\)，所以 \\(y=\\pm ${yAbs}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const [leftShift, rightShift] = [
          [2, 4],
          [3, 6],
          [3, 4],
          [4, 6],
        ][randInt(0, 3)];
        const x = (leftShift * rightShift) / (rightShift - leftShift);
        const linearCoeff = rightShift - leftShift;
        const linearLeft = linearCoeff === 1 ? 'x' : `${linearCoeff}x`;
        questions.push(`若 \\(x-${leftShift},\\ x,\\ x+${rightShift}\\) 三數成等比數列，求 \\(x\\) 之值。`);
        answers.push(
          `簡答：\\(x=${x}\\)。過程：三數成等比時，中項平方等於兩端乘積，\\(x^2=(x-${leftShift})(x+${rightShift})\\)。展開後消去 \\(x^2\\)，得 \\(${linearLeft}=${leftShift * rightShift}\\)，所以 \\(x=${x}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const x = [2, 3, 4, 5, 6][randInt(0, 4)];
        const ratio = [2, 3, 4][randInt(0, 2)];
        const middle = x * ratio;
        const last = x * ratio * ratio;
        questions.push(`若 \\(x,\\ ${middle},\\ ${last}\\) 三數成等比數列，且各項皆為正數，求 \\(x\\) 之值。`);
        answers.push(
          `簡答：\\(x=${x}\\)。過程：中項平方等於兩端乘積，\\(${middle}^2=x\\cdot${last}\\)，所以 \\(x=\\frac{${middle * middle}}{${last}}=${x}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const a = [2, 3, 5, 6][randInt(0, 3)];
        const c = a * [8, 18, 32][randInt(0, 2)];
        const product = a * c;
        const root = formatRadical(product);
        questions.push(`求 \\(${a}\\) 與 \\(${c}\\) 的等比中項。`);
        answers.push(
          `簡答：\\(\\pm ${root}\\)。過程：設等比中項為 \\(y\\)，則 \\(y^2=${a}\\cdot${c}=${product}\\)，所以 \\(y=\\pm ${root}\\)。`
        );
        continue;
      }
      const first = -[2, 3, 4, 5][randInt(0, 3)];
      const last = first * [4, 9, 16][randInt(0, 2)];
      const product = first * last;
      const mAbs = Math.sqrt(product);
      questions.push(`已知 \\(${first},\\ m,\\ ${last}\\) 三數成等比數列，求 \\(m\\) 的值。`);
      answers.push(
        `簡答：\\(m=\\pm ${mAbs}\\)。過程：若三數成等比，必須 \\(m^2=${first}\\cdot${last}=${product}\\)，所以 \\(m=\\pm ${mAbs}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ412TermIndexSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const r =
        mode === 1
          ? makeFraction(1, [2, 3, 5][randInt(0, 2)])
          : [makeFraction(2), makeFraction(3), makeFraction(-2), makeFraction(-3)][randInt(0, 3)];
      const a1 = mode === 1 ? makeFraction(powInt(r.den, randInt(3, 5)), 1) : makeFraction(pickNonZero(1, 7), 1);
      const n = randInt(4, 8);
      const an = geometricTerm(a1, r, n);
      if (mode === 0 || mode === 1) {
        questions.push(
          `等比數列 ${formatGeometricListLatex(a1, r)}，請問 ${inlineMath(formatGeometricTermLatex(an))} 是該數列的第幾項？`
        );
        answers.push(
          `簡答：第 ${n} 項。過程：\\(${formatGeometricTermLatex(an)}=${formatGeometricTermLatex(a1)}\\cdot ${formatFractionLatexForFactor(r)}^{${n - 1}}\\)，所以它是第 ${n} 項。`
        );
        continue;
      }
      if (mode === 2) {
        const miss = mulFraction(an, r);
        questions.push(
          `等比數列 ${formatGeometricListLatex(a1, r)}，請問 ${inlineMath(formatGeometricTermLatex(miss))} 是該數列的第幾項？`
        );
        answers.push(
          `簡答：第 ${n + 1} 項。過程：從首項開始乘公比，\\(${formatGeometricTermLatex(miss)}=${formatGeometricTermLatex(a1)}\\cdot ${formatFractionLatexForFactor(r)}^{${n}}\\)，所以是第 ${n + 1} 項。`
        );
        continue;
      }
      if (mode === 3) {
        const target = geometricTerm(a1, r, n);
        questions.push(
          `已知一等比數列的首項為 ${formatGeometricTermLatex(a1)}，公比為 ${formatRatioLatex(r)}，若某一項為 ${inlineMath(formatGeometricTermLatex(target))}，求它是第幾項。`
        );
        answers.push(
          `簡答：第 ${n} 項。過程：\\(a_n=${formatGeometricTermLatex(a1)}\\cdot ${formatFractionLatexForFactor(r)}^{n-1}\\)。比對 ${formatGeometricTermLatex(target)} 可得 \\(n-1=${n - 1}\\)，所以 \\(n=${n}\\)。`
        );
        continue;
      }
      const notTerm = addFraction(an, makeFraction(1, 1));
      questions.push(
        `等比數列 ${formatGeometricListLatex(a1, r)}，請問 ${inlineMath(formatGeometricTermLatex(notTerm))} 是不是此數列的一項？`
      );
      answers.push(
        `簡答：不是。過程：相鄰項都固定乘以 \\(r=${formatRatioLatex(r)}\\)，而 ${formatGeometricTermLatex(notTerm)} 介於已生成的等比項附近，無法寫成 \\(${formatGeometricTermLatex(a1)}\\cdot ${formatFractionLatexForFactor(r)}^k\\)（\\(k\\) 為非負整數），所以不是。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ412WordApplicationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const hours = randInt(5, 10);
        const initial = randInt(1, 5);
        const total = initial * powInt(2, hours);
        questions.push(`細菌分裂：某種細菌每小時分裂為 2 個，若一開始有 ${initial} 個，則 ${hours} 小時後共有多少個？`);
        answers.push(
          `簡答：${total} 個。過程：每小時乘以 2，形成等比數列；${hours} 小時後為 \\(${initial}\\cdot 2^{${hours}}=${total}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const folds = randInt(3, 7);
        const numerator = [1, 2, 3, 5][randInt(0, 3)];
        const denominator = [1000, 2000, 4000][randInt(0, 2)];
        const start = makeFraction(numerator, denominator);
        const total = mulFraction(start, makeFraction(powInt(2, folds), 1));
        questions.push(
          `摺紙厚度：一張紙厚度為 \\(${formatGeometricTermLatex(start)}\\) 公分，對摺 ${folds} 次後，總厚度為多少公分？`
        );
        answers.push(
          `簡答：\\(${formatGeometricTermLatex(total)}\\) 公分。過程：每摺一次厚度乘以 2，所以厚度為 \\(${formatGeometricTermLatex(start)}\\cdot 2^{${folds}}=${formatGeometricTermLatex(total)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const height = [128, 192, 256, 320][randInt(0, 3)];
        const bounce = randInt(3, 6);
        const ratio = [makeFraction(1, 2), makeFraction(3, 4)][randInt(0, 1)];
        const h = mulFraction(makeFraction(height), powFraction(ratio, bounce));
        questions.push(
          `球體反彈：一顆球從 ${height} 公尺高處落下，每次反彈高度為原高度的 \\(${formatRatioLatex(ratio)}\\)，求第 ${bounce} 次反彈的高度。`
        );
        answers.push(
          `簡答：\\(${formatGeometricTermLatex(h)}\\) 公尺。過程：每次反彈高度都乘以 \\(${formatRatioLatex(ratio)}\\)，所以第 ${bounce} 次為 \\(${height}\\cdot ${formatFractionLatexForFactor(ratio)}^{${bounce}}=${formatGeometricTermLatex(h)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const price = [80, 100, 120, 150][randInt(0, 3)];
        const years = randInt(2, 5);
        const ratio = [makeFraction(4, 5), makeFraction(3, 4), makeFraction(9, 10)][randInt(0, 2)];
        const value = mulFraction(makeFraction(price), powFraction(ratio, years));
        questions.push(
          `價值折舊：新車售價 ${price} 萬元，每年折舊後剩原來的 \\(${formatRatioLatex(ratio)}\\)，求 ${years} 年後的車價。`
        );
        answers.push(
          `簡答：\\(${formatGeometricTermLatex(value)}\\) 萬元。過程：每年都乘以 \\(${formatRatioLatex(ratio)}\\)，所以 ${years} 年後為 \\(${price}\\cdot ${formatFractionLatexForFactor(ratio)}^{${years}}=${formatGeometricTermLatex(value)}\\)。`
        );
        continue;
      }
      const population = [30000, 50000, 60000, 80000][randInt(0, 3)];
      const years = randInt(2, 4);
      const ratio = [makeFraction(11, 10), makeFraction(6, 5), makeFraction(21, 20)][randInt(0, 2)];
      const future = mulFraction(makeFraction(population), powFraction(ratio, years));
      questions.push(
        `複利成長：某城市人口每年變為前一年的 \\(${formatRatioLatex(ratio)}\\)，若今年人口為 ${population} 人，求 ${years} 年後的人口數。`
      );
      answers.push(
        `簡答：\\(${formatGeometricTermLatex(future)}\\) 人。過程：每年乘以 \\(${formatRatioLatex(ratio)}\\)，${years} 年後為 \\(${population}\\cdot ${formatFractionLatexForFactor(ratio)}^{${years}}=${formatGeometricTermLatex(future)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ412GeometricSequenceMixedSet(count) {
    const banks = [
      buildJ412GeometricNthTermSet,
      buildJ412FindRatioFirstTermSet,
      buildJ412GeometricMeanUnknownSet,
      buildJ412TermIndexSet,
      buildJ412WordApplicationSet,
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

  function formatFunctionLinear(a, b, variable = 'x') {
    return formatLinearExpr(a, b).replaceAll('x', variable);
  }

  function formatFunctionQuadratic(a, b, c) {
    const parts = [];
    if (a !== 0) parts.push(a === 1 ? 'x^2' : a === -1 ? '-x^2' : `${a}x^2`);
    if (b !== 0) {
      const term = b === 1 ? 'x' : b === -1 ? '-x' : `${b}x`;
      parts.push(parts.length && b > 0 ? `+${term}` : term);
    }
    if (c !== 0) parts.push(parts.length && c > 0 ? `+${c}` : `${c}`);
    return parts.join('') || '0';
  }

  function formatFunctionFractionValue(value) {
    const frac = typeof value === 'number' ? makeFraction(value, 1) : makeFraction(value.num, value.den);
    return formatFraction(frac.num, frac.den);
  }

  function formatProductForSubstitution(coef, value) {
    if (coef === 1) return wrapIfNegative(value);
    if (coef === -1) return `-${wrapIfNegative(value)}`;
    return `${coef}\\cdot(${value})`;
  }

  function formatProductWithLatexValue(coef, valueText) {
    const body = String(valueText || '0');
    const wrapped = body.startsWith('-') ? `\\left(${body}\\right)` : body;
    if (coef === 1) return body;
    if (coef === -1) return `-${wrapped}`;
    return `${coef}\\cdot${wrapped}`;
  }

  function formatSquareProductForSubstitution(coef, value) {
    if (coef === 1) return `(${value})^2`;
    if (coef === -1) return `-(${value})^2`;
    return `${coef}\\cdot(${value})^2`;
  }

  function pickFlowMultiplier() {
    return [-5, -4, -3, -2, 2, 3, 4, 5][randInt(0, 7)];
  }

  function formatUnknownSlopeFunction(constant) {
    return `mx${constant === 0 ? '' : formatSignedAdd(constant)}`;
  }

  function functionAnswer(isFunction, reason) {
    return `簡答：${isFunction ? '是函數' : '不是函數'}。過程：${reason}`;
  }

  function buildJ421FunctionRelationJudgeSet(count) {
    const questions = [];
    const answers = [];
    const contexts = [
      {
        x: '一位學生的身分證字號',
        y: '該學生的生日',
        ok: true,
        reason: '每一個身分證字號只屬於一位學生，因此生日也固定。',
      },
      { x: '一位學生的年齡', y: '該學生的姓名', ok: false, reason: '同一年齡可能有很多位學生，會對到不同姓名。' },
      { x: '正方形的邊長', y: '此正方形的面積', ok: true, reason: '邊長固定時，面積就是邊長平方，只會有一個值。' },
      { x: '長方形的周長', y: '此長方形的面積', ok: false, reason: '同一個周長可以有不同長寬，例如面積可能不同。' },
      {
        x: '同一天中的時刻',
        y: '某路口測得的氣溫',
        ok: true,
        reason: '若每個時刻只記錄一次氣溫，時刻固定就只有一個測量值。',
      },
      {
        x: '某班學生的座號',
        y: '該座號學生的數學段考分數',
        ok: true,
        reason: '在同一班同一次考試中，每個座號只對到一個分數。',
      },
      {
        x: '商品的原價',
        y: '打八折後的售價',
        ok: true,
        reason: '原價固定時，售價就是原價乘以 \\(\\frac{4}{5}\\)，只會有一個值。',
      },
      { x: '一個整數', y: '它的平方根', ok: false, reason: '例如 x=9 時，y 可以是 3 或 -3，同一個 x 對到兩個 y。' },
      { x: '月份', y: '該月天數（以平年為準）', ok: true, reason: '以平年為準時，每個月份的天數固定。' },
      { x: '一個人的身高', y: '此人的體重', ok: false, reason: '同樣身高的人可能有不同體重。' },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const item = contexts[randInt(0, contexts.length - 1)];
        questions.push(
          `判斷是非：若 \\(x\\) 為${item.x}，\\(y\\) 為${item.y}，則 \\(y\\) 是 \\(x\\) 的函數。這句話是否正確？`
        );
        answers.push(
          `簡答：${item.ok ? '正確' : '錯誤'}。過程：${item.reason}所以${item.ok ? '符合' : '不符合'}「同一個 x 只對到一個 y」的函數判別。`
        );
        continue;
      }
      if (mode === 1) {
        const duplicateX = randInt(-3, 5);
        const y1 = randInt(-8, 8);
        const y2 = y1 + randInt(1, 6);
        const pairs = shuffle([
          `(${duplicateX}, ${y1})`,
          `(${duplicateX}, ${y2})`,
          `(${duplicateX + randInt(1, 4)}, ${randInt(-8, 8)})`,
          `(${duplicateX - randInt(1, 4)}, ${randInt(-8, 8)})`,
        ]);
        questions.push(`下列對應關係：${pairs.join('、')}。請判斷 \\(y\\) 是否為 \\(x\\) 的函數。`);
        answers.push(
          functionAnswer(false, `同一個 \\(x=${duplicateX}\\) 同時對到 \\(y=${y1}\\) 與 \\(y=${y2}\\)，違反函數定義。`)
        );
        continue;
      }
      if (mode === 2) {
        const xs = shuffle([randInt(-5, -1), randInt(0, 3), randInt(4, 8), randInt(9, 12)]);
        const a = pickNonZero(-4, 4);
        const b = randInt(-8, 8);
        const pairs = xs.map((x) => `(${x}, ${a * x + b})`);
        questions.push(`下列對應關係：${pairs.join('、')}。請判斷 \\(y\\) 是否為 \\(x\\) 的函數。`);
        answers.push(functionAnswer(true, `每一個列出的 \\(x\\) 都只出現一次，也都只對到一個 \\(y\\)，所以是函數。`));
        continue;
      }
      if (mode === 3) {
        const t = randInt(2, 9);
        questions.push(
          `關係式 \\(y^2=x\\) 中，若 \\(x=${t * t}\\)，請列出可能的 \\(y\\) 值，並判斷 \\(y\\) 是否為 \\(x\\) 的函數。`
        );
        answers.push(
          `簡答：\\(y=${t}\\) 或 \\(y=-${t}\\)，不是函數。過程：\\(y^2=${t * t}\\) 時，\\(y\\) 有正負兩個值；同一個 \\(x\\) 對到兩個 \\(y\\)，所以不是函數。`
        );
        continue;
      }
      const a = pickNonZero(-5, 5);
      const b = randInt(-9, 9);
      questions.push(`關係式 \\(y=${formatFunctionLinear(a, b)}\\) 中，請判斷 \\(y\\) 是否為 \\(x\\) 的函數。`);
      answers.push(
        functionAnswer(
          true,
          `任意給定一個 \\(x\\)，代入 \\(y=${formatFunctionLinear(a, b)}\\) 都只會算出一個 \\(y\\) 值，所以是函數。`
        )
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ421FunctionValueBasicSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = pickNonZero(-6, 6);
        const b = randInt(-12, 12);
        const x1 = randInt(-5, 8);
        const x2 = randInt(-5, 8);
        const v1 = a * x1 + b;
        const v2 = a * x2 + b;
        questions.push(`若函數 \\(f(x)=${formatFunctionLinear(a, b)}\\)，求 \\(f(${x1})\\) 與 \\(f(${x2})\\) 的值。`);
        answers.push(
          `簡答：\\(f(${x1})=${v1}\\)，\\(f(${x2})=${v2}\\)。過程：\\(f(${x1})=${formatProductForSubstitution(a, x1)}${formatSignedAdd(b)}=${v1}\\)；\\(f(${x2})=${formatProductForSubstitution(a, x2)}${formatSignedAdd(b)}=${v2}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const a = pickNonZero(1, 4);
        const b = pickNonZero(-6, 6);
        const c = randInt(-10, 10);
        const x = randInt(-4, 5);
        const value = a * x * x + b * x + c;
        questions.push(`已知函數 \\(g(x)=${formatFunctionQuadratic(a, b, c)}\\)，求 \\(g(${x})\\)。`);
        answers.push(
          `簡答：\\(g(${x})=${value}\\)。過程：\\(g(${x})=${formatSquareProductForSubstitution(a, x)}${b === 0 ? '' : formatSignedAdd(b) + `\\cdot(${x})`}${c === 0 ? '' : formatSignedAdd(c)}=${value}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const a = pickNonZero(-5, 5);
        const h = randInt(-8, 8);
        const c = randInt(1, 9);
        const x = randInt(-6, 8);
        const value = Math.abs(a * x + h) + c;
        questions.push(`設函數 \\(f(x)=|${formatFunctionLinear(a, h)}|+${c}\\)，求 \\(f(${x})\\)。`);
        answers.push(
          `簡答：\\(f(${x})=${value}\\)。過程：先算絕對值內部 \\(${formatProductForSubstitution(a, x)}${formatSignedAdd(h)}=${a * x + h}\\)，所以 \\(f(${x})=|${a * x + h}|+${c}=${value}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const c = pickNonZero(-12, 12);
        const x1 = randInt(-20, 20);
        const x2 = randInt(-20, 20);
        questions.push(`若 \\(f(x)=${c}\\) 為常數函數，求 \\(f(${x1})+f(${x2})\\)。`);
        answers.push(
          `簡答：${2 * c}。過程：常數函數不論輸入多少，輸出都等於 ${c}，所以 \\(f(${x1})+f(${x2})=${c}${formatSignedAdd(c)}=${2 * c}\\)。`
        );
        continue;
      }
      const denShift = randInt(1, 8);
      const numerator = pickNonZero(-24, 24);
      let x = randInt(-8, 10);
      while (x + denShift === 0) x = randInt(-8, 10);
      const value = makeFraction(numerator, x + denShift);
      questions.push(`設函數 \\(h(x)=\\frac{${numerator}}{x${formatSignedAdd(denShift)}}\\)，求 \\(h(${x})\\)。`);
      answers.push(
        `簡答：\\(h(${x})=${formatFunctionFractionValue(value)}\\)。過程：分母為 \\(${x}${formatSignedAdd(denShift)}=${x + denShift}\\)，所以 \\(h(${x})=\\frac{${numerator}}{${x + denShift}}=${formatFunctionFractionValue(value)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ421FunctionReverseSolveSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = pickNonZero(-6, 6);
        const x = randInt(-5, 8);
        const k = pickNonZero(-12, 12);
        const fx = a * x + k;
        questions.push(`已知函數 \\(f(x)=${formatFunctionLinear(a, 0)}+k\\)，且 \\(f(${x})=${fx}\\)，求 \\(k\\)。`);
        answers.push(
          `簡答：\\(k=${k}\\)。過程：\\(f(${x})=${formatProductForSubstitution(a, x)}+k=${fx}\\)，所以 \\(k=${fx}${formatSignedAdd(-a * x)}=${k}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const a = pickNonZero(-5, 5);
        const b = randInt(-9, 9);
        const x = randInt(-6, 6);
        const target = a * x + b;
        questions.push(`若 \\(g(x)=${formatFunctionLinear(a, b)}\\)，且 \\(g(a_0)=${target}\\)，求 \\(a_0\\) 的值。`);
        answers.push(
          `簡答：\\(a_0=${x}\\)。過程：令輸入為 \\(a_0\\)，\\(${formatFunctionLinear(a, b).replaceAll('x', 'a_0')}=${target}\\)，解得 \\(a_0=${x}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const a = pickNonZero(-5, 5);
        const b = randInt(-8, 8);
        const x = pickNonZero(-4, 7);
        const m = pickNonZero(-5, 5);
        const c = a * x + b - m * x;
        questions.push(
          `已知兩個一次函數 \\(f(x)=${formatFunctionLinear(a, b)}\\) 與 \\(g(x)=${formatUnknownSlopeFunction(c)}\\)，在 \\(x=${x}\\) 時函數值相等，求 \\(m\\)。`
        );
        answers.push(
          `簡答：\\(m=${m}\\)。過程：在 \\(x=${x}\\) 時，\\(f(${x})=${a * x + b}\\)，而 \\(g(${x})=${formatFunctionLinear(x, c, 'm')}\\)。令 \\(${formatFunctionLinear(x, c, 'm')}=${a * x + b}\\)，得 \\(m=${formatFraction(a * x + b - c, x)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const k = pickNonZero(-6, 8);
        const x = randInt(-8, 8);
        const value = (k * x - 1) / 2;
        if (!Number.isInteger(value)) {
          i -= 1;
          continue;
        }
        questions.push(`若函數 \\(f(x)=\\frac{kx-1}{2}\\)，且 \\(f(${x})=${value}\\)，求 \\(k\\)。`);
        answers.push(
          `簡答：\\(k=${k}\\)。過程：\\(\\frac{${formatTerm(x, 'k')}-1}{2}=${value}\\)，兩邊乘以 2 得 \\(${formatTerm(x, 'k')}-1=${2 * value}\\)，所以 \\(k=${k}\\)。`
        );
        continue;
      }
      const a = pickNonZero(-6, 6);
      const b = randInt(-10, 10);
      const input = randInt(-6, 8);
      const target = a * input + b;
      questions.push(`設 \\(f(x)=${formatFunctionLinear(a, b)}\\)。若 \\(f(t)=${target}\\)，求 \\(t\\)。`);
      answers.push(
        `簡答：\\(t=${input}\\)。過程：\\(${formatFunctionLinear(a, b, 't')}=${target}\\)，所以 \\(${formatTerm(a, 't')}=${target - b}\\)，解得 \\(t=${input}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ421FunctionFlowCompositeSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const add = randInt(1, 8);
        const mul = pickFlowMultiplier();
        const sub = randInt(1, 12);
        const a = mul;
        const b = mul * add - sub;
        questions.push(
          `有一計算流程：輸入 \\(x\\) → 加 ${add} → 乘以 ${mul} → 減 ${sub} → 輸出 \\(y\\)。請寫出 \\(y\\) 與 \\(x\\) 的關係式。`
        );
        answers.push(
          `簡答：\\(y=${formatFunctionLinear(a, b)}\\)。過程：加 ${add} 後為 \\(x${formatSignedAdd(add)}\\)，乘以 ${mul} 得 \\(${mul}(x${formatSignedAdd(add)})\\)，再減 ${sub}，所以 \\(y=${formatFunctionLinear(a, b)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const add = randInt(1, 8);
        const mul = pickFlowMultiplier();
        const sub = randInt(1, 12);
        const x = randInt(-6, 8);
        const y = mul * (x + add) - sub;
        questions.push(
          `承上類流程：輸入 \\(x\\) → 加 ${add} → 乘以 ${mul} → 減 ${sub} → 輸出 \\(y\\)。若輸入 ${x}，輸出為多少？`
        );
        answers.push(`簡答：${y}。過程：\\(y=${mul}(${x}${formatSignedAdd(add)})-${sub}=${y}\\)。`);
        continue;
      }
      if (mode === 2) {
        const add = randInt(1, 6);
        const mul = pickNonZero(2, 6);
        const sub = randInt(1, 10);
        const x = randInt(-5, 8);
        const y = mul * (x + add) - sub;
        questions.push(
          `流程為：輸入 \\(x\\) → 加 ${add} → 乘以 ${mul} → 減 ${sub} → 輸出 \\(y\\)。若輸出為 ${y}，求輸入 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：逆推時先加回 ${sub} 得 ${y + sub}，再除以 ${mul} 得 ${x + add}，最後減 ${add}，所以 \\(x=${x}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const a = pickNonZero(-4, 4);
        const b = randInt(-6, 6);
        const c = pickNonZero(-4, 4);
        const d = randInt(-6, 6);
        const x = randInt(-5, 6);
        const gx = c * x + d;
        const value = a * gx + b;
        questions.push(
          `若 \\(f(x)=${formatFunctionLinear(a, b)}\\)，\\(g(x)=${formatFunctionLinear(c, d)}\\)，求 \\(f(g(${x}))\\)。`
        );
        answers.push(
          `簡答：${value}。過程：先算 \\(g(${x})=${c}\\cdot(${x})${formatSignedAdd(d)}=${gx}\\)，再算 \\(f(${gx})=${a}\\cdot(${gx})${formatSignedAdd(b)}=${value}\\)。`
        );
        continue;
      }
      const a = pickNonZero(-5, 5);
      const b = randInt(-8, 8);
      const n = randInt(3, 6);
      let sum = 0;
      for (let x = 1; x <= n; x += 1) sum += a * x + b;
      const sumInputText = `(1+\\cdots+${n})`;
      const aSumText = a === 1 ? sumInputText : a === -1 ? `-${sumInputText}` : `${a}${sumInputText}`;
      const aSumValue = a * ((n * (n + 1)) / 2);
      const bSumText = b === 0 ? '' : `${formatSignedAdd(b)}\\cdot${n}`;
      const totalText = b === 0 ? `${aSumValue}` : `${aSumValue}${formatSignedAdd(b * n)}`;
      questions.push(`已知函數 \\(f(x)=${formatFunctionLinear(a, b)}\\)，求 \\(f(1)+f(2)+\\cdots+f(${n})\\)。`);
      answers.push(`簡答：${sum}。過程：\\(f(1)+\\cdots+f(${n})=${aSumText}${bSumText}=${totalText}=${sum}\\)。`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ421FunctionWordModelSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const c = [10, 15, 20, 25, 30, 35][randInt(0, 5)];
        const f = makeFraction(9 * c + 160, 5);
        questions.push(
          `溫標轉換：華氏溫度 \\(F\\) 與攝氏溫度 \\(C\\) 的關係為 \\(F=\\frac{9}{5}C+32\\)。當 \\(C=${c}\\) 時，求 \\(F\\)。`
        );
        answers.push(
          `簡答：\\(F=${formatFunctionFractionValue(f)}\\)。過程：代入 \\(C=${c}\\)，\\(F=\\frac{9}{5}\\cdot${c}+32=${formatFunctionFractionValue(f)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const side = randInt(4, 18);
        const perimeter = 4 * side;
        questions.push(
          `幾何周長：一正方形邊長為 \\(x\\) 公分，周長為 \\(y\\) 公分。請寫出 \\(y\\) 與 \\(x\\) 的函數關係式，並求邊長為 ${side} 公分時的周長。`
        );
        answers.push(
          `簡答：\\(y=4x\\)，周長 ${perimeter} 公分。過程：正方形有 4 條等長邊，所以 \\(y=4x\\)。代入 \\(x=${side}\\)，得 \\(y=4\\cdot${side}=${perimeter}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const speed = [40, 50, 60, 70, 80, 90][randInt(0, 5)];
        const hours = randInt(2, 6);
        const distance = speed * hours;
        questions.push(
          `等速運動：一輛車以每小時 ${speed} 公里的固定速度行駛 \\(x\\) 小時，距離為 \\(y\\) 公里。求 \\(y\\) 與 \\(x\\) 的關係式，並求行駛 ${hours} 小時的距離。`
        );
        answers.push(
          `簡答：\\(y=${speed}x\\)，距離 ${distance} 公里。過程：距離等於速度乘以時間，所以 \\(y=${speed}x\\)；代入 \\(x=${hours}\\)，\\(y=${speed}\\cdot${hours}=${distance}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const initial = randInt(16, 30);
        const rate = [makeFraction(1, 2), makeFraction(2, 3), makeFraction(3, 4)][randInt(0, 2)];
        const minutes = randInt(6, 18);
        const remain = subFraction(makeFraction(initial), mulFraction(rate, makeFraction(minutes)));
        if (remain.num < 0) {
          i -= 1;
          continue;
        }
        questions.push(
          `消耗模型：一支長 ${initial} 公分的蠟燭，每分鐘燃燒 \\(${formatFunctionFractionValue(rate)}\\) 公分。若燃燒 \\(x\\) 分鐘後剩下 \\(y\\) 公分，求關係式及燃燒 ${minutes} 分鐘後的長度。`
        );
        answers.push(
          `簡答：\\(y=${initial}-${formatFunctionFractionValue(rate)}x\\)，剩 \\(${formatFunctionFractionValue(remain)}\\) 公分。過程：剩餘長度等於原長減去燃燒長度，所以 \\(y=${initial}-${formatFunctionFractionValue(rate)}x\\)。代入 \\(x=${minutes}\\)，得 \\(y=${initial}-${formatFunctionFractionValue(rate)}\\cdot${minutes}=${formatFunctionFractionValue(remain)}\\)。`
        );
        continue;
      }
      const seconds = randInt(360, 900);
      const extra = seconds - 300;
      const cost = makeFraction(1800 + extra, 10);
      questions.push(
        `資費計算：某通話費前 300 秒共收 180 元，超過 300 秒後每秒收 \\(\\frac{1}{10}\\) 元。若通話時間為 \\(x\\) 秒（\\(x>300\\)），總費用為 \\(y\\) 元，求關係式及通話 ${seconds} 秒的費用。`
      );
      answers.push(
        `簡答：\\(y=180+\\frac{x-300}{10}\\)，費用 \\(${formatFunctionFractionValue(cost)}\\) 元。過程：超過的秒數是 \\(x-300\\)，所以 \\(y=180+\\frac{x-300}{10}\\)。代入 \\(x=${seconds}\\)，\\(y=180+\\frac{${extra}}{10}=${formatFunctionFractionValue(cost)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ421FunctionMixedSet(count) {
    const banks = [
      buildJ421FunctionRelationJudgeSet,
      buildJ421FunctionValueBasicSet,
      buildJ421FunctionReverseSolveSet,
      buildJ421FunctionFlowCompositeSet,
      buildJ421FunctionWordModelSet,
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

  function formatSignedFractionTerm(frac) {
    const value = makeFraction(frac.num, frac.den);
    const absText = formatFraction(Math.abs(value.num), value.den);
    return value.num >= 0 ? `+${absText}` : `-${absText}`;
  }

  function formatFractionCoeffTerm(frac, variable = 'x') {
    const value = makeFraction(frac.num, frac.den);
    if (value.num === 0) return '0';
    if (value.den === 1) return formatTerm(value.num, variable);
    const sign = value.num < 0 ? '-' : '';
    const absText = formatFraction(Math.abs(value.num), value.den);
    return `${sign}${absText}${variable}`;
  }

  function formatLinearFractionExpr(slope, intercept, variable = 'x') {
    const m = makeFraction(slope.num, slope.den);
    const b = makeFraction(intercept.num, intercept.den);
    const mText = formatFractionCoeffTerm(m, variable);
    if (b.num === 0) return mText;
    return `${mText}${formatSignedFractionTerm(b)}`;
  }

  function formatPoint(x, y) {
    return `(${formatFunctionFractionValue(x)}, ${formatFunctionFractionValue(y)})`;
  }

  function formatDifferenceText(a, b) {
    return `${a}${formatSignedAdd(-b)}`;
  }

  function lineThroughPointSlope(pointX, pointY, slope) {
    const intercept = subFraction(makeFraction(pointY, 1), mulFraction(slope, makeFraction(pointX, 1)));
    return { slope, intercept };
  }

  function buildJ422LinearEquationTwoPointsSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const a = pickNonZero(-5, 5);
      const b = randInt(-12, 12);
      let x1 = randInt(-5, 5);
      let x2 = randInt(-5, 5);
      while (x2 === x1) x2 = randInt(-5, 5);
      const y1 = a * x1 + b;
      const y2 = a * x2 + b;
      if (mode === 0) {
        questions.push(
          `已知一次函數 \\(f(x)=ax+b\\) 的圖形通過 ${formatPoint(x1, y1)} 與 ${formatPoint(x2, y2)}，求此函數關係式。`
        );
        answers.push(
          `簡答：\\(f(x)=${formatFunctionLinear(a, b)}\\)。過程：斜率 \\(a=\\frac{${formatDifferenceText(y2, y1)}}{${formatDifferenceText(x2, x1)}}=${a}\\)。代入 ${formatPoint(x1, y1)}，得 \\(${y1}=${formatProductForSubstitution(a, x1)}+b\\)，所以 \\(b=${b}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const askX = randInt(-6, 8);
        const askY = a * askX + b;
        questions.push(
          `設線型函數通過 ${formatPoint(x1, y1)} 與 ${formatPoint(x2, y2)}，求當 \\(x=${askX}\\) 時的函數值。`
        );
        answers.push(
          `簡答：${askY}。過程：先求斜率 \\(a=\\frac{${formatDifferenceText(y2, y1)}}{${formatDifferenceText(x2, x1)}}=${a}\\)，再得函數式 \\(y=${formatFunctionLinear(a, b)}\\)。代入 \\(x=${askX}\\)，\\(y=${askY}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`若線型函數 \\(y=g(x)\\) 通過 ${formatPoint(x1, y1)} 與 ${formatPoint(x2, y2)}，求其圖形。`);
        answers.push(
          `簡答：\\(y=${formatFunctionLinear(a, b)}\\)。過程：\\(a=\\frac{${formatDifferenceText(y2, y1)}}{${formatDifferenceText(x2, x1)}}=${a}\\)，代入其中一點求得截距 \\(b=${b}\\)，所以圖形為直線 \\(y=${formatFunctionLinear(a, b)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(
          `已知一次函數圖形通過 ${formatPoint(x1, y1)} 與 ${formatPoint(x2, y2)}，求此函數的斜率與 \\(y\\) 軸截距。`
        );
        answers.push(
          `簡答：斜率 ${a}，\\(y\\) 軸截距 ${b}。過程：斜率 \\(\\frac{${formatDifferenceText(y2, y1)}}{${formatDifferenceText(x2, x1)}}=${a}\\)；函數式為 \\(y=${formatFunctionLinear(a, b)}\\)，故 \\(y\\) 軸截距為 ${b}。`
        );
        continue;
      }
      const f1 = a + b;
      const f2 = 2 * a + b;
      questions.push(`一次函數 \\(f(x)=ax+b\\) 滿足 \\(f(1)=${f1}\\) 且 \\(f(2)=${f2}\\)，求 \\(f(x)\\)。`);
      answers.push(
        `簡答：\\(f(x)=${formatFunctionLinear(a, b)}\\)。過程：\\(a=f(2)-f(1)=${formatDifferenceText(f2, f1)}=${a}\\)，再由 \\(a+b=${f1}\\) 得 \\(b=${b}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ422InterceptPositionSet(count) {
    const questions = [];
    const answers = [];
    const quadrantNames = ['第一象限', '第二象限', '第三象限', '第四象限'];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const xIntercept = pickNonZero(-8, 8);
        const yIntercept = pickNonZero(-10, 10);
        const slope = makeFraction(-yIntercept, xIntercept);
        questions.push(
          `求一次函數 \\(y=${formatLinearFractionExpr(slope, makeFraction(yIntercept))}\\) 與 \\(x\\) 軸、\\(y\\) 軸的交點座標。`
        );
        answers.push(
          `簡答：\\(x\\) 軸交點 ${formatPoint(xIntercept, 0)}，\\(y\\) 軸交點 ${formatPoint(0, yIntercept)}。過程：令 \\(y=0\\) 得 \\(x=${xIntercept}\\)；令 \\(x=0\\) 得 \\(y=${yIntercept}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const a = pickNonZero(-5, 5);
        const b = pickNonZero(-12, 12);
        const missing =
          a > 0 && b > 0 ? '第四象限' : a > 0 && b < 0 ? '第二象限' : a < 0 && b > 0 ? '第三象限' : '第一象限';
        questions.push(`已知函數 \\(f(x)=${formatFunctionLinear(a, b)}\\)，請問其圖形不通過哪一個象限？`);
        answers.push(
          `簡答：不通過${missing}。過程：斜率 ${a > 0 ? '為正' : '為負'}，\\(y\\) 軸截距 ${b > 0 ? '為正' : '為負'}，依直線穿過兩軸的位置判斷，缺少${missing}。`
        );
        continue;
      }
      if (mode === 2) {
        const a = -randInt(1, 6);
        const b = randInt(2, 12);
        questions.push(`若一次函數 \\(y=ax+b\\) 中，\\(ab>0\\) 且 \\(a<0\\)，則其圖形通過哪些象限？`);
        answers.push(
          `簡答：第二、第三、第四象限。過程：\\(a<0\\) 且 \\(ab>0\\)，所以 \\(b<0\\)。斜率負、截距負時，直線不通過第一象限，故通過第二、第三、第四象限。`
        );
        continue;
      }
      if (mode === 3) {
        const xIntercept = pickNonZero(-9, 9);
        const yIntercept = pickNonZero(-9, 9);
        questions.push(
          `一次函數的圖形與兩座標軸交於 ${formatPoint(xIntercept, 0)}、${formatPoint(0, yIntercept)}，求此兩交點所形成線段的中點座標。`
        );
        answers.push(
          `簡答：\\((${formatFraction(xIntercept, 2)}, ${formatFraction(yIntercept, 2)})\\)。過程：中點座標為 \\((\\frac{${xIntercept}+0}{2},\\frac{0${formatSignedAdd(yIntercept)}}{2})=(${formatFraction(xIntercept, 2)}, ${formatFraction(yIntercept, 2)})\\)。`
        );
        continue;
      }
      const c = pickNonZero(-9, 9);
      const pass = c > 0 ? ['第一象限', '第二象限'] : ['第三象限', '第四象限'];
      const missing = quadrantNames.filter((q) => !pass.includes(q)).join('、');
      questions.push(`已知常數函數 \\(f(x)=${c}\\)，請問其圖形通過哪些象限？`);
      answers.push(
        `簡答：通過${pass.join('、')}。過程：圖形是水平直線 \\(y=${c}\\)，在 \\(x>0\\) 與 \\(x<0\\) 都有點；因為 \\(y${c > 0 ? '>0' : '<0'}\\)，所以不通過${missing}。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ422AxisAreaSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const xIntercept = pickNonZero(-10, 10);
      const yIntercept = pickNonZero(-12, 12);
      const slope = makeFraction(-yIntercept, xIntercept);
      const area = Math.abs(xIntercept * yIntercept) / 2;
      if (mode === 0) {
        questions.push(
          `計算一次函數 \\(y=${formatLinearFractionExpr(slope, makeFraction(yIntercept))}\\) 的圖形與兩坐標軸所圍成的三角形面積。`
        );
        answers.push(
          `簡答：${formatFunctionFractionValue(makeFraction(Math.abs(xIntercept * yIntercept), 2))} 平方單位。過程：\\(x\\) 軸截距為 ${xIntercept}，\\(y\\) 軸截距為 ${yIntercept}，面積 \\(=\\frac{|${xIntercept}\\cdot${yIntercept}|}{2}=${formatFunctionFractionValue(makeFraction(Math.abs(xIntercept * yIntercept), 2))}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const b = [4, 6, 8, 10, 12][randInt(0, 4)];
        const targetArea = [12, 16, 18, 24, 30, 36][randInt(0, 5)];
        const x0 = (2 * targetArea) / b;
        if (!Number.isInteger(x0)) {
          i -= 1;
          continue;
        }
        const a = makeFraction(-b, x0);
        questions.push(
          `若一次函數 \\(y=ax+${b}\\) 的圖形與兩坐標軸圍成的面積為 ${targetArea} 平方單位，且 \\(a<0\\)，求 \\(a\\)。`
        );
        answers.push(
          `簡答：\\(a=${formatFunctionFractionValue(a)}\\)。過程：\\(y\\) 軸截距為 ${b}，面積 \\(\\frac{|x_0|\\cdot${b}}{2}=${targetArea}\\)，得 \\(x_0=${x0}\\)。又 \\(0=a\\cdot${x0}+${b}\\)，所以 \\(a=${formatFunctionFractionValue(a)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(
          `計算一次函數 \\(y=${formatLinearFractionExpr(slope, makeFraction(yIntercept))}\\) 的圖形與兩坐標軸所圍成的三角形面積，並列出兩截距。`
        );
        answers.push(
          `簡答：截距為 ${formatPoint(xIntercept, 0)}、${formatPoint(0, yIntercept)}，面積 \\(${formatFunctionFractionValue(makeFraction(Math.abs(xIntercept * yIntercept), 2))}\\)。過程：令 \\(y=0\\) 得 \\(x=${xIntercept}\\)，令 \\(x=0\\) 得 \\(y=${yIntercept}\\)，面積為兩截距絕對值乘積的一半。`
        );
        continue;
      }
      if (mode === 3) {
        const a = pickNonZero(-6, 6);
        const b = pickNonZero(-10, 10);
        const x0 = makeFraction(-b, a);
        const areaFrac = makeFraction(Math.abs(b * b), 2 * Math.abs(a));
        questions.push(`設一次函數 \\(f(x)=${formatFunctionLinear(a, b)}\\)，求其圖形與兩坐標軸所形成的圖形面積。`);
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(areaFrac)}\\) 平方單位。過程：\\(y\\) 軸截距為 ${b}，\\(x\\) 軸截距為 \\(${formatFunctionFractionValue(x0)}\\)，面積 \\(=\\frac{|${formatFunctionFractionValue(x0)}\\cdot${b}|}{2}=${formatFunctionFractionValue(areaFrac)}\\)。`
        );
        continue;
      }
      questions.push(
        `求一次函數 \\(y=${formatLinearFractionExpr(slope, makeFraction(yIntercept))}\\) 的圖形與兩坐標軸圍成的面積。`
      );
      answers.push(
        `簡答：\\(${formatFunctionFractionValue(makeFraction(Math.abs(xIntercept * yIntercept), 2))}\\) 平方單位。過程：兩軸截距分別為 ${formatFunctionFractionValue(makeFraction(xIntercept))} 與 ${formatFunctionFractionValue(makeFraction(yIntercept))}，所以面積為 \\(\\frac{|${xIntercept}\\cdot${yIntercept}|}{2}=${formatFunctionFractionValue(makeFraction(Math.abs(xIntercept * yIntercept), 2))}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ422LineIntersectionParallelSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const px = randInt(-5, 6);
        const py = randInt(-8, 8);
        let m1 = pickNonZero(-5, 5);
        let m2 = pickNonZero(-5, 5);
        while (m2 === m1) m2 = pickNonZero(-5, 5);
        const line1 = lineThroughPointSlope(px, py, makeFraction(m1));
        const line2 = lineThroughPointSlope(px, py, makeFraction(m2));
        const diffSlope = m1 - m2;
        const diffIntercept = line2.intercept.num / line2.intercept.den - line1.intercept.num / line1.intercept.den;
        questions.push(
          `求兩個一次函數 \\(y=${formatLinearFractionExpr(line1.slope, line1.intercept)}\\) 與 \\(y=${formatLinearFractionExpr(line2.slope, line2.intercept)}\\) 的圖形交點座標。`
        );
        answers.push(
          `簡答：${formatPoint(px, py)}。過程：聯立兩式，移項得 \\(${formatTerm(diffSlope, 'x')}=${diffIntercept}\\)，解得 \\(x=${px}\\)，代回得 \\(y=${py}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const c1 = pickNonZero(-10, 10);
        const c2 = pickNonZero(-10, 10);
        questions.push(`求一次函數 \\(y=${c1}\\) 與 \\(y=${formatFunctionLinear(-2, c2)}\\) 圖形的交點座標。`);
        const x = makeFraction(c2 - c1, 2);
        answers.push(
          `簡答：${formatPoint(x, c1)}。過程：聯立 \\(${c1}=-2x${formatSignedAdd(c2)}\\)，得 \\(x=${formatFunctionFractionValue(x)}\\)，所以交點為 ${formatPoint(x, c1)}。`
        );
        continue;
      }
      if (mode === 2) {
        const c = randInt(-10, 10);
        const xAxisPoint = pickNonZero(-6, 6);
        const knownSlope = -3;
        const knownIntercept = -knownSlope * xAxisPoint;
        const unknownA = makeFraction(-c, xAxisPoint);
        questions.push(
          `若直線 \\(y=ax${formatSignedAdd(c)}\\) 與 \\(y=${formatFunctionLinear(knownSlope, knownIntercept)}\\) 的圖形相交於 \\(x\\) 軸上，求 \\(a\\)。`
        );
        answers.push(
          `簡答：\\(a=${formatFunctionFractionValue(unknownA)}\\)。過程：交點在 \\(x\\) 軸上表示 \\(y=0\\)。令第一條直線通過 \\((${xAxisPoint},0)\\)，則 \\(0=a\\cdot${xAxisPoint}${formatSignedAdd(c)}\\)，所以 \\(a=${formatFunctionFractionValue(unknownA)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const m = pickNonZero(-6, 6);
        const lineConst = randInt(-20, 20);
        questions.push(
          `已知兩函數 \\(f(x)=${formatTerm(m, 'x')}+7k-11\\) 與 \\(g(x)=${formatFunctionLinear(-8, lineConst)}\\) 的圖形交點在 \\(x\\) 軸上。若 \\(f\\) 的斜率為 ${m}，求符合交點在 \\(x\\) 軸時的 \\(k\\)（以 \\(x\\) 軸交點由 \\(g\\) 決定）。`
        );
        const gxZero = makeFraction(lineConst, 8);
        const kValue = makeFraction(11 * 8 - m * lineConst, 56);
        answers.push(
          `簡答：\\(k=${formatFunctionFractionValue(kValue)}\\)。過程：交點在 \\(x\\) 軸上，先由 \\(g(x)=-8x${formatSignedAdd(lineConst)}=0\\) 得 \\(x=${formatFunctionFractionValue(gxZero)}\\)。代入 \\(f\\)：\\(${formatProductWithLatexValue(m, formatFunctionFractionValue(gxZero))}+7k-11=0\\)，解得 \\(k=${formatFunctionFractionValue(kValue)}\\)。`
        );
        continue;
      }
      const px = randInt(-4, 5);
      const py = randInt(-6, 8);
      const slope = pickNonZero(-5, 5);
      const b = py - slope * px;
      let knownB = randInt(-8, 8);
      while (knownB === b) knownB = randInt(-8, 8);
      questions.push(
        `設直線 \\(y=ax+b\\) 與 \\(y=${formatFunctionLinear(slope, knownB)}\\) 平行，且通過 ${formatPoint(px, py)}，求 \\(a+b\\)。`
      );
      answers.push(
        `簡答：\\(a+b=${slope + b}\\)。過程：平行直線斜率相同，所以 \\(a=${slope}\\)。代入 ${formatPoint(px, py)} 得 \\(${py}=${formatProductForSubstitution(slope, px)}+b\\)，所以 \\(b=${b}\\)，\\(a+b=${slope + b}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ422LinearFunctionMixedSet(count) {
    const banks = [
      buildJ422LinearEquationTwoPointsSet,
      buildJ422InterceptPositionSet,
      buildJ422AxisAreaSet,
      buildJ422LineIntersectionParallelSet,
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

  function buildJ431TriangleInteriorAngleSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    const ratioSets = [
      [1, 2, 3],
      [1, 3, 5],
      [2, 3, 4],
      [2, 5, 5],
      [3, 4, 5],
      [4, 5, 6],
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = (i + startOffset) % 5;
      if (mode === 0) {
        let ratio = ratioSets[randInt(0, ratioSets.length - 1)];
        let unit = 180 / ratio.reduce((sum, value) => sum + value, 0);
        while (!Number.isInteger(unit)) {
          ratio = ratioSets[randInt(0, ratioSets.length - 1)];
          unit = 180 / ratio.reduce((sum, value) => sum + value, 0);
        }
        const angles = ratio.map((value) => value * unit);
        questions.push(`已知 \\(\\triangle ABC\\) 三個內角的度數比為 ${ratio.join(':')}，求此三角形的最大角。`);
        answers.push(
          `簡答：${Math.max(...angles)}°。過程：三角形內角和為 180°，比例總和為 ${ratio.reduce((sum, value) => sum + value, 0)} 份，所以一份為 ${unit}°，三角分別為 ${angles.join('°、')}°，最大角為 ${Math.max(...angles)}°。`
        );
        continue;
      }
      if (mode === 1) {
        let x = randInt(20, 40);
        let a = randInt(-20, 20);
        let b = 180 - 6 * x - a;
        while (2 * x + a <= 0 || 3 * x + b <= 0 || b < -40 || b > 60) {
          x = randInt(20, 40);
          a = randInt(-20, 20);
          b = 180 - 6 * x - a;
        }
        const exprA = `2x${formatSignedAdd(a)}`;
        const exprC = `3x${formatSignedAdd(b)}`;
        const sumExpr = `${exprA}+x${exprC.startsWith('-') ? exprC : `+${exprC}`}`;
        questions.push(
          `若 \\(\\triangle ABC\\) 的三內角分別為 \\(${exprA}\\)°、\\(x\\)°、\\(${exprC}\\)°，求 \\(x\\) 之值。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：三角形內角和為 180°，所以 \\(${sumExpr}=180\\)，化簡得 \\(${formatFunctionLinear(6, a + b)}=180\\)，解得 \\(x=${x}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const angleA = randInt(35, 90);
        const diff = [10, 20, 30, 40][randInt(0, 3)];
        if ((180 - angleA + diff) % 2 !== 0) {
          i -= 1;
          continue;
        }
        const angleB = (180 - angleA + diff) / 2;
        const angleC = angleB - diff;
        if (angleC <= 0) {
          i -= 1;
          continue;
        }
        questions.push(
          `在 \\(\\triangle ABC\\) 中，已知 \\(\\angle A=${angleA}°\\)，且 \\(\\angle B-\\angle C=${diff}°\\)，求 \\(\\angle B\\)。`
        );
        answers.push(
          `簡答：\\(\\angle B=${angleB}°\\)。過程：\\(\\angle B+\\angle C=180°-${angleA}°=${180 - angleA}°\\)，又 \\(\\angle B-\\angle C=${diff}°\\)。兩式相加得 \\(2\\angle B=${2 * angleB}°\\)，所以 \\(\\angle B=${angleB}°\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const known = randInt(40, 100);
        const ratio = [
          [1, 2],
          [2, 3],
          [3, 4],
          [3, 5],
        ][randInt(0, 3)];
        const remain = 180 - known;
        const unit = remain / (ratio[0] + ratio[1]);
        if (!Number.isInteger(unit)) {
          i -= 1;
          continue;
        }
        const small = Math.min(ratio[0] * unit, ratio[1] * unit, known);
        questions.push(`已知三角形的一個內角為 ${known}°，另外兩個內角的度數比為 ${ratio[0]}:${ratio[1]}，求最小角。`);
        answers.push(
          `簡答：${small}°。過程：另外兩角和為 \\(180°-${known}°=${remain}°\\)，比例共 ${ratio[0] + ratio[1]} 份，一份為 ${unit}°，三角為 ${known}°、${ratio[0] * unit}°、${ratio[1] * unit}°，最小角為 ${small}°。`
        );
        continue;
      }
      const angleB = randInt(35, 85);
      const angleA = randInt(30, 100 - Math.floor(angleB / 2));
      const angleC = 180 - angleA - angleB;
      if (angleC <= 0) {
        i -= 1;
        continue;
      }
      const sumAB = angleA + angleB;
      const sumBC = angleB + angleC;
      questions.push(
        `若 \\(\\triangle ABC\\) 中，\\(\\angle A+\\angle B=${sumAB}°\\)，且 \\(\\angle B+\\angle C=${sumBC}°\\)，求 \\(\\angle B\\) 的度數。`
      );
      answers.push(
        `簡答：\\(\\angle B=${angleB}°\\)。過程：兩式相加得 \\(\\angle A+2\\angle B+\\angle C=${sumAB + sumBC}°\\)。因為 \\(\\angle A+\\angle B+\\angle C=180°\\)，所以 \\(\\angle B=${sumAB + sumBC}°-180°=${angleB}°\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ431PolygonInteriorSumSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = (i + startOffset) % 5;
      if (mode === 0) {
        const n = randInt(5, 14);
        const sum = (n - 2) * 180;
        questions.push(`求一個 ${n} 邊形的內角和為多少度？`);
        answers.push(
          `簡答：${sum}°。過程：\\(n\\) 邊形內角和為 \\((n-2)\\times180°\\)，所以 \\((${n}-2)\\times180°=${sum}°\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const n = randInt(5, 16);
        const sum = (n - 2) * 180;
        questions.push(`若一個多邊形的內角總和為 ${sum}°，則此多邊形為幾邊形？`);
        answers.push(
          `簡答：${n} 邊形。過程：設為 \\(n\\) 邊形，\\((n-2)\\times180=${sum}\\)，所以 \\(n-2=${sum / 180}\\)，\\(n=${n}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const diagonals = randInt(3, 9);
        const n = diagonals + 3;
        const sum = (n - 2) * 180;
        questions.push(`已知一個多邊形從其中一個頂點最多可以作出 ${diagonals} 條對角線，求此多邊形的內角和。`);
        answers.push(
          `簡答：${sum}°。過程：從一頂點可作的對角線數為 \\(n-3\\)，所以 \\(n-3=${diagonals}\\)，得 \\(n=${n}\\)。內角和為 \\((${n}-2)\\times180=${sum}°\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const k = randInt(2, 6);
        const n = 2 + 2 * k;
        const sum = (n - 2) * 180;
        questions.push(`若一個多邊形的內角總和是其外角和的 ${k} 倍，求此多邊形的邊數。`);
        answers.push(
          `簡答：${n} 邊形。過程：任意多邊形外角和為 360°，內角和為 \\((n-2)180°\\)。由 \\((n-2)180=${k}\\cdot360\\)，得 \\(n-2=${2 * k}\\)，所以 \\(n=${n}\\)。`
        );
        continue;
      }
      const n = randInt(5, 12);
      const d = [2, 4, 6, 8][randInt(0, 3)];
      const total = (n - 2) * 180;
      const firstNumerator = 2 * total - n * (n - 1) * d;
      const firstDenominator = 2 * n;
      if (firstNumerator <= 0 || firstNumerator % firstDenominator !== 0) {
        i -= 1;
        continue;
      }
      const first = firstNumerator / firstDenominator;
      questions.push(`一個 \\(n\\) 邊形的所有內角由小到大成等差數列，公差為 ${d}°，若最小角為 ${first}°，求 \\(n\\)。`);
      answers.push(
        `簡答：\\(n=${n}\\)。過程：內角和為 \\((n-2)180°\\)。等差角總和為 \\(\\frac{n[2\\cdot${first}+(n-1)\\cdot${d}]}{2}\\)。代入檢查得 \\(n=${n}\\) 時，總和為 ${total}°，符合 \\((n-2)180°\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ431RegularPolygonAngleSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    const regularNs = [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20];
    for (let i = 0; i < count; i += 1) {
      const mode = (i + startOffset) % 5;
      if (mode === 0) {
        const n = regularNs[randInt(0, regularNs.length - 1)];
        const angle = makeFraction((n - 2) * 180, n);
        questions.push(`求正 ${n} 邊形的一個內角是多少度？`);
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(angle)}°\\)。過程：正 \\(n\\) 邊形每個內角相等，為 \\(\\frac{(${n}-2)\\times180°}{${n}}=${formatFunctionFractionValue(angle)}°\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const n = regularNs[randInt(0, regularNs.length - 1)];
        const angle = makeFraction((n - 2) * 180, n);
        questions.push(
          `若一個正多邊形的每一個內角為 \\(${formatFunctionFractionValue(angle)}°\\)，則此多邊形為幾邊形？`
        );
        answers.push(
          `簡答：正 ${n} 邊形。過程：正多邊形外角為 \\(180°-${formatFunctionFractionValue(angle)}°=${formatFunctionFractionValue(makeFraction(360, n))}°\\)，邊數 \\(n=\\frac{360°}{${formatFunctionFractionValue(makeFraction(360, n))}°}=${n}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const n = [5, 6, 8, 9, 10, 12, 15, 18][randInt(0, 7)];
        const exterior = makeFraction(360, n);
        questions.push(
          `已知一個正多邊形的每一個外角為 \\(${formatFunctionFractionValue(exterior)}°\\)，求其邊數 \\(n\\)。`
        );
        answers.push(
          `簡答：\\(n=${n}\\)。過程：正多邊形外角和為 360°，每一外角相等，所以 \\(n=\\frac{360}{${formatFunctionFractionValue(exterior)}}=${n}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const n = [6, 8, 10, 12, 15][randInt(0, 4)];
        const interior = makeFraction((n - 2) * 180, n);
        const exterior = makeFraction(360, n);
        const ratio = divFraction(interior, exterior);
        questions.push(
          `若某正多邊形的一個內角度數是其外角度數的 ${formatFunctionFractionValue(ratio)} 倍，求此多邊形的內角和。`
        );
        answers.push(
          `簡答：${(n - 2) * 180}°。過程：設邊數為 \\(n\\)，\\(\\frac{內角}{外角}=\\frac{180-360/n}{360/n}=\\frac{${n - 2}}{2}=${formatFunctionFractionValue(ratio)}\\)，得 \\(n=${n}\\)。內角和為 \\((${n}-2)180=${(n - 2) * 180}°\\)。`
        );
        continue;
      }
      const n1 = [6, 8, 10, 12][randInt(0, 3)];
      const n2 = n1 + [1, 2, 4][randInt(0, 2)];
      const angle1 = makeFraction((n1 - 2) * 180, n1);
      const angle2 = makeFraction((n2 - 2) * 180, n2);
      const diff = subFraction(angle2, angle1);
      questions.push(`計算正 ${n1} 邊形與正 ${n2} 邊形各一個內角的度數相差多少？`);
      answers.push(
        `簡答：\\(${formatFunctionFractionValue(absFraction(diff))}°\\)。過程：正 ${n1} 邊形一內角為 \\(${formatFunctionFractionValue(angle1)}°\\)，正 ${n2} 邊形一內角為 \\(${formatFunctionFractionValue(angle2)}°\\)，相差 \\(${formatFunctionFractionValue(absFraction(diff))}°\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ431PolygonAngleMixedSet(count) {
    const banks = [buildJ431TriangleInteriorAngleSet, buildJ431PolygonInteriorSumSet, buildJ431RegularPolygonAngleSet];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1, Math.floor(i / banks.length));
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ431ComplementarySupplementaryAngleSet(count) {
    const questions = [];
    const answers = [];
    const ratioPairs = [
      [1, 2],
      [2, 3],
      [3, 7],
      [4, 5],
      [5, 7],
      [7, 8],
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        let ratio = ratioPairs[randInt(0, ratioPairs.length - 1)];
        let unit = 180 / (ratio[0] + ratio[1]);
        while (!Number.isInteger(unit)) {
          ratio = ratioPairs[randInt(0, ratioPairs.length - 1)];
          unit = 180 / (ratio[0] + ratio[1]);
        }
        const angleA = ratio[0] * unit;
        const angleB = ratio[1] * unit;
        questions.push(
          `已知 \\(\\angle A\\) 與 \\(\\angle B\\) 互為補角，且 \\(\\angle A:\\angle B=${ratio[0]}:${ratio[1]}\\)，求 \\(\\angle A\\) 的度數。`
        );
        answers.push(
          `簡答：\\(\\angle A=${angleA}°\\)。過程：互為補角表示兩角和為 180°。比例共 ${ratio[0] + ratio[1]} 份，一份為 ${unit}°，所以 \\(\\angle A=${ratio[0]}\\cdot${unit}°=${angleA}°\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const k = [3, 4, 6, 10][randInt(0, 3)];
        const angle = (90 * (k - 2)) / (k - 1);
        questions.push(`若 \\(\\angle A\\) 的補角是 \\(\\angle A\\) 餘角的 ${k} 倍，求 \\(\\angle A\\) 是多少度？`);
        answers.push(
          `簡答：\\(\\angle A=${angle}°\\)。過程：\\(\\angle A\\) 的補角為 \\(180°-A\\)，餘角為 \\(90°-A\\)。由 \\(180-A=${k}(90-A)\\)，解得 \\(A=${angle}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const x = randInt(10, 35);
        const a = randInt(2, 5);
        const c = randInt(2, 5);
        const b = randInt(5, 40);
        const d = 180 - (a + c) * x - b;
        if (a * x + b <= 0 || c * x + d <= 0 || d < -40 || d > 60) {
          i -= 1;
          continue;
        }
        const angle1 = a * x + b;
        const angle2 = c * x + d;
        const expr1 = formatFunctionLinear(a, b);
        const expr2 = formatFunctionLinear(c, d);
        questions.push(
          `若 \\(\\angle 1=(${expr1})°\\)，\\(\\angle 2=(${expr2})°\\)，且 \\(\\angle 1\\) 與 \\(\\angle 2\\) 互補，求 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：互補表示兩角和為 180°，所以 \\((${expr1})+(${expr2})=180\\)，化簡得 \\(${formatFunctionLinear(a + c, b + d)}=180\\)，解得 \\(x=${x}\\)。此時兩角為 ${angle1}°、${angle2}°。`
        );
        continue;
      }
      if (mode === 3) {
        const angle3 = randInt(20, 70);
        const angle2 = 90 - angle3;
        const angle1 = 180 - angle2;
        questions.push(
          `若 \\(\\angle 1\\) 是 \\(\\angle 2\\) 的補角，\\(\\angle 2\\) 是 \\(\\angle 3\\) 的餘角，已知 \\(\\angle 3=${angle3}°\\)，求 \\(\\angle 1\\)。`
        );
        answers.push(
          `簡答：\\(\\angle 1=${angle1}°\\)。過程：\\(\\angle 2\\) 是 \\(\\angle 3\\) 的餘角，所以 \\(\\angle 2=90°-${angle3}°=${angle2}°\\)。\\(\\angle 1\\) 是 \\(\\angle 2\\) 的補角，所以 \\(\\angle 1=180°-${angle2}°=${angle1}°\\)。`
        );
        continue;
      }
      const extra = [10, 15, 20, 25, 30, 35, 40][randInt(0, 6)];
      questions.push(`一個角的補角比它的餘角的 2 倍多 ${extra}°，求這個角的度數。`);
      answers.push(
        `簡答：${extra}°。過程：設此角為 \\(x°\\)，補角為 \\(180°-x\\)，餘角為 \\(90°-x\\)。依題意 \\(180-x=2(90-x)+${extra}\\)，化簡得 \\(x=${extra}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function bisectionCountForParts(parts) {
    let value = Number(parts);
    let count = 0;
    while (value > 1 && value % 2 === 0) {
      value /= 2;
      count += 1;
    }
    return value === 1 ? count : null;
  }

  function buildJ432ConstructionBisectionSet(count) {
    const questions = [];
    const answers = [];
    const ratioCores = [
      [1, 3],
      [3, 5],
      [5, 11],
      [7, 9],
      [7, 25],
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const core = ratioCores[randInt(0, ratioCores.length - 1)];
        const scale = [1, 2, 3, 4, 5][randInt(0, 4)];
        const left = core[0] * scale;
        const right = core[1] * scale;
        const totalParts = core[0] + core[1];
        const steps = bisectionCountForParts(totalParts);
        questions.push(`若欲將線段 \\(AB\\) 分成 ${left}:${right} 的兩段，至少需作幾次「中垂線作圖」？`);
        answers.push(
          `簡答：${steps} 次。過程：比例 ${left}:${right} 先約分為 ${core[0]}:${core[1]}，共 ${totalParts} 等份。每作一次中垂線可把現有小段再二等分，所以要得到 ${totalParts} 等份需連續二分 ${steps} 次。`
        );
        continue;
      }
      if (mode === 1) {
        const divisor = [4, 8, 16][randInt(0, 2)];
        const basePool = [64, 80, 96, 112, 120, 128, 144, 160, 192, 240].filter((value) => value % divisor === 0);
        const base = basePool[randInt(0, basePool.length - 1)];
        const target = base / divisor;
        const steps = bisectionCountForParts(divisor);
        questions.push(`若要將一個 ${base}° 的角平分出一個 ${target}° 的角，至少需利用「角平分線作圖」幾次？`);
        answers.push(
          `簡答：${steps} 次。過程：${base}° 要變成 ${target}°，等於要分成 \\(\\frac{${base}}{${target}}=${divisor}\\) 等份。因為 ${divisor}=2^${steps}，所以需連續作 ${steps} 次角平分線。`
        );
        continue;
      }
      if (mode === 2) {
        const denominator = [4, 8, 16, 32][randInt(0, 3)];
        const totalPool = [8, 12, 16, 20, 24, 32, 40, 48, 64].filter((value) => value % denominator === 0);
        const total = totalPool[randInt(0, totalPool.length - 1)];
        if (total % denominator !== 0) {
          i -= 1;
          continue;
        }
        const numeratorPool = Array.from({ length: denominator - 1 }, (_, index) => index + 1).filter(
          (value) => bisectionCountForParts(denominator / gcdInt(value, denominator)) >= 2
        );
        const numerator = numeratorPool[randInt(0, numeratorPool.length - 1)];
        const length = (total / denominator) * numerator;
        const g = gcdInt(length, total);
        const reducedDen = total / g;
        const steps = bisectionCountForParts(reducedDen);
        if (steps === null || steps < 2) {
          i -= 1;
          continue;
        }
        if (numerator === 1) {
          questions.push(
            `若要在 \\(AB\\) 上作出長度為原線段 \\(\\frac{1}{${denominator}}\\) 的小段，至少需作幾次中點作圖？`
          );
          answers.push(
            `簡答：${steps} 次。過程：長度變為原來的 \\(\\frac{1}{${denominator}}\\)，表示要連續二分到 ${denominator} 等份。因為 ${denominator}=2^${steps}，所以至少需 ${steps} 次。`
          );
        } else {
          questions.push(
            `已知線段 \\(AB=${total}\\) 公分，欲在其上找一點 \\(C\\) 使 \\(AC=${length}\\) 公分；若只用中點作圖法，最少需作幾次？`
          );
          answers.push(
            `簡答：${steps} 次。過程：\\(AC:AB=${length}:${total}\\)，約分後分母為 ${reducedDen}，表示需把 \\(AB\\) 分成 ${reducedDen} 等份才能定位。因為 ${reducedDen}=2^${steps}，所以最少需 ${steps} 次中點作圖。`
          );
        }
        continue;
      }
      if (mode === 3) {
        const parts = [4, 8, 16, 32][randInt(0, 3)];
        const points = parts - 1;
        questions.push(`若要把線段 \\(AB\\) 分成 ${parts} 等份，且所有等分點都要作出來，至少需要作幾次中垂線作圖？`);
        answers.push(
          `簡答：${points} 次。過程：分成 ${parts} 等份時，線段內共有 ${parts}-1=${points} 個等分點需要作出；題目要求全部等分點，所以至少需 ${points} 次作圖。`
        );
        continue;
      }
      const angle = [80, 96, 112, 120, 144, 160][randInt(0, 5)];
      const steps = randInt(2, 4);
      const smallest = makeFraction(angle, 2 ** steps);
      questions.push(`已知 \\(\\angle A=${angle}°\\)，若連續作 ${steps} 次角平分線，則最小的角為多少度？`);
      answers.push(
        `簡答：\\(${formatFunctionFractionValue(smallest)}°\\)。過程：每作一次角平分線，角度變為原來的一半；連續 ${steps} 次後為 \\(\\frac{${angle}}{2^${steps}}=${formatFunctionFractionValue(smallest)}°\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function pickAcuteAngle() {
    return randInt(20, 80);
  }

  function pickObtuseAngle() {
    return randInt(100, 160);
  }

  function formatAngleOptions(values) {
    return values.map((value) => `${value}°`).join(' 或 ');
  }

  function angleParallelValues(angle) {
    const other = 180 - angle;
    return angle === other ? [angle] : [angle, other].sort((a, b) => a - b);
  }

  function anglePerpValues(angle) {
    return angleParallelValues(angle);
  }

  function angleMixedValues(angle) {
    if (angle < 90) return [90 - angle, 90 + angle];
    return [angle - 90, 270 - angle];
  }

  function buildJ441ParallelAcuteSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const angle = pickAcuteAngle();
      const values = angleParallelValues(angle);
      const mode = (i + startOffset) % 3;
      if (mode === 0) {
        questions.push(
          `已知銳角 \\(\\angle A=${angle}°\\)，且 \\(\\angle A\\) 的兩邊分別平行於 \\(\\angle B\\) 的兩邊，求 \\(\\angle B\\) 所有可能的度數。`
        );
      } else if (mode === 1) {
        questions.push(`若兩個角的對應邊互相平行，其中一角為 ${angle}°，則另一角在 180° 以內可能是多少度？`);
      } else {
        questions.push(
          `銳角 \\(\\angle A\\) 為 ${angle}°。若 \\(\\angle B\\) 與它形成「兩邊平行型」，求 \\(\\angle B\\) 的可能值。`
        );
      }
      answers.push(
        `簡答：${formatAngleOptions(values)}。過程：兩邊分別平行時，兩角可能相等或互補，所以 \\(\\angle B=${angle}°\\) 或 \\(180°-${angle}°=${180 - angle}°\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ441ParallelObtuseSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const angle = pickObtuseAngle();
      const values = angleParallelValues(angle);
      const mode = (i + startOffset) % 3;
      if (mode === 0) {
        questions.push(
          `已知鈍角 \\(\\angle A=${angle}°\\)，且 \\(\\angle A\\) 的兩邊分別平行於 \\(\\angle B\\) 的兩邊，求 \\(\\angle B\\) 所有可能的度數。`
        );
      } else if (mode === 1) {
        questions.push(
          `若 \\(\\angle A=${angle}°\\)，另一角的兩邊分別與 \\(\\angle A\\) 的兩邊平行，則另一角可能為幾度？`
        );
      } else {
        questions.push(`鈍角 ${angle}° 經由兩邊平行型對應到另一個角，求另一角在 180° 以內的可能度數。`);
      }
      answers.push(
        `簡答：${formatAngleOptions(values)}。過程：兩邊平行型會得到同角或補角，所以可能為 ${angle}°，也可能為 \\(180°-${angle}°=${180 - angle}°\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ441PerpendicularAcuteSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const angle = pickAcuteAngle();
      const values = anglePerpValues(angle);
      const mode = (i + startOffset) % 3;
      if (mode === 0) {
        questions.push(
          `已知銳角 \\(\\angle A=${angle}°\\)，且 \\(\\angle A\\) 的兩邊分別垂直於 \\(\\angle B\\) 的兩邊，求 \\(\\angle B\\) 所有可能的度數。`
        );
      } else if (mode === 1) {
        questions.push(`兩個角的對應邊互相垂直，若其中一角為 ${angle}°，另一角可能是多少度？`);
      } else {
        questions.push(`銳角 ${angle}° 與另一角屬於「兩邊垂直型」，求另一角在 180° 以內的可能值。`);
      }
      answers.push(
        `簡答：${formatAngleOptions(values)}。過程：兩邊分別垂直時，旋轉後的夾角關係仍可能相等或互補，所以 \\(\\angle B=${angle}°\\) 或 \\(180°-${angle}°=${180 - angle}°\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ441PerpendicularObtuseSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const angle = pickObtuseAngle();
      const values = anglePerpValues(angle);
      const mode = (i + startOffset) % 3;
      if (mode === 0) {
        questions.push(
          `已知鈍角 \\(\\angle A=${angle}°\\)，且 \\(\\angle A\\) 的兩邊分別垂直於 \\(\\angle B\\) 的兩邊，求 \\(\\angle B\\) 所有可能的度數。`
        );
      } else if (mode === 1) {
        questions.push(`若一個 ${angle}° 的角與另一角兩邊互相垂直，另一角可能是多少度？`);
      } else {
        questions.push(
          `鈍角 \\(\\angle A=${angle}°\\)。若 \\(\\angle B\\) 是兩邊垂直型對應角，求 \\(\\angle B\\) 的可能度數。`
        );
      }
      answers.push(
        `簡答：${formatAngleOptions(values)}。過程：兩邊垂直型同樣會出現同角或補角，所以可能為 ${angle}° 或 \\(180°-${angle}°=${180 - angle}°\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ441MixedAcuteSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const angle = pickAcuteAngle();
      const values = angleMixedValues(angle);
      const mode = (i + startOffset) % 3;
      if (mode === 0) {
        questions.push(
          `已知銳角 \\(\\angle A=${angle}°\\)，\\(\\angle A\\) 與 \\(\\angle B\\) 的一邊互相平行，另一邊互相垂直，求 \\(\\angle B\\) 在 180° 以內的度數。`
        );
      } else if (mode === 1) {
        questions.push(`若一個 ${angle}° 的銳角與另一角呈「一平行一垂直型」，求另一角可能是多少度？`);
      } else {
        questions.push(
          `銳角 \\(\\angle A=${angle}°\\)。若 \\(\\angle B\\) 有一邊與 \\(\\angle A\\) 平行，另一邊與 \\(\\angle A\\) 垂直，求 \\(\\angle B\\) 的可能值。`
        );
      }
      answers.push(
        `簡答：${formatAngleOptions(values)}。過程：一平行一垂直時，會與 90° 形成互餘或相差 90°。因 \\(\\angle A\\) 為銳角，所以 \\(\\angle B=90°-${angle}°=${90 - angle}°\\) 或 \\(90°+${angle}°=${90 + angle}°\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ441MixedObtuseSet(count, startOffset = 0) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const angle = pickObtuseAngle();
      const values = angleMixedValues(angle);
      const mode = (i + startOffset) % 3;
      if (mode === 0) {
        questions.push(
          `已知鈍角 \\(\\angle A=${angle}°\\)，\\(\\angle A\\) 與 \\(\\angle B\\) 的一邊互相平行，另一邊互相垂直，求 \\(\\angle B\\) 在 180° 以內的度數。`
        );
      } else if (mode === 1) {
        questions.push(`若一個 ${angle}° 的鈍角與另一角呈「一平行一垂直型」，求另一角可能是多少度？`);
      } else {
        questions.push(
          `鈍角 \\(\\angle A=${angle}°\\)。若 \\(\\angle B\\) 有一邊與 \\(\\angle A\\) 平行、另一邊與 \\(\\angle A\\) 垂直，求 \\(\\angle B\\) 的可能值。`
        );
      }
      answers.push(
        `簡答：${formatAngleOptions(values)}。過程：一平行一垂直且 \\(\\angle A\\) 為鈍角時，常用 180° 內角處理：相差 90° 得 \\(${angle}°-90°=${angle - 90}°\\)，另一個為 \\(270°-${angle}°=${270 - angle}°\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ441ParallelPerpendicularAngleMixedSet(count) {
    const banks = [
      buildJ441ParallelAcuteSet,
      buildJ441ParallelObtuseSet,
      buildJ441PerpendicularAcuteSet,
      buildJ441PerpendicularObtuseSet,
      buildJ441MixedAcuteSet,
      buildJ441MixedObtuseSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const one = banks[i % banks.length](1, Math.floor(i / banks.length));
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  const J442_SHAPE_CODES = [
    { code: '甲', name: '正方形', props: ['A', 'B', 'D', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N'] },
    { code: '乙', name: '矩形', props: ['B', 'E', 'G', 'H', 'J', 'K', 'M'] },
    { code: '丙', name: '菱形', props: ['A', 'B', 'D', 'E', 'H', 'K', 'L', 'N'] },
    { code: '丁', name: '平行四邊形', props: ['B', 'E', 'H', 'K'] },
    { code: '戊', name: '等腰梯形', props: ['C', 'F', 'J', 'M'] },
    { code: '己', name: '箏形', props: ['D', 'I', 'L', 'O'] },
  ];

  const J442_PROPERTY_CODES = [
    { code: 'A', name: '四邊等長' },
    { code: 'B', name: '二組對邊等長' },
    { code: 'C', name: '只一組對邊等長' },
    { code: 'D', name: '二組鄰邊等長' },
    { code: 'E', name: '二組對邊平行' },
    { code: 'F', name: '只一組對邊平行' },
    { code: 'G', name: '四角垂直' },
    { code: 'H', name: '二組對角相等' },
    { code: 'I', name: '只一組對角相等' },
    { code: 'J', name: '二組鄰角相等' },
    { code: 'K', name: '對角線互相平分' },
    { code: 'L', name: '對角線互相垂直' },
    { code: 'M', name: '對角線等長' },
    { code: 'N', name: '二對角線為角平分線' },
    { code: 'O', name: '只一對角線為角平分線' },
  ];

  function formatJ442ShapeList() {
    return J442_SHAPE_CODES.map((item) => `${item.code}. ${item.name}`).join('；');
  }

  function formatJ442PropertyList() {
    return J442_PROPERTY_CODES.map((item) => `${item.code}. ${item.name}`).join('；');
  }

  function j442PropertyNames(codes) {
    const names = codes.map((code) => J442_PROPERTY_CODES.find((item) => item.code === code)?.name || code);
    return names.join('、');
  }

  function j442ShapeNames(codes) {
    const names = codes.map((code) => J442_SHAPE_CODES.find((item) => item.code === code)?.name || code);
    return names.join('、');
  }

  function j442ShapesForProperty(propertyCode) {
    return J442_SHAPE_CODES.filter((shape) => shape.props.includes(propertyCode)).map((shape) => shape.code);
  }

  function buildJ442QuadrilateralPropertyCodeSet(count) {
    const questions = [];
    const answers = [];
    const shapeList = formatJ442ShapeList();
    const propertyList = formatJ442PropertyList();
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const prompts = J442_SHAPE_CODES.map((shape, index) => `(${index + 1}) ${shape.name}`).join(' ');
        const simple = J442_SHAPE_CODES.map((shape) => `${shape.name}: ${shape.props.join('、')}`).join('\n');
        const process = J442_SHAPE_CODES.map(
          (shape) => `${shape.name} 具有 ${j442PropertyNames(shape.props)}，所以填 ${shape.props.join('、')}`
        ).join('\n');
        questions.push(`性質代號選項：${propertyList}。請依每個圖形，填入它必定具有的性質代號：${prompts}。`);
        answers.push(`簡答：\n${simple}\n過程：\n${process}`);
        continue;
      }
      const selectedProps = shuffle(J442_PROPERTY_CODES).slice(0, 4);
      const prompts = selectedProps.map((prop, index) => `(${index + 1}) ${prop.name}`).join(' ');
      const simple = selectedProps
        .map((prop) => `${prop.name}: ${j442ShapesForProperty(prop.code).join('、')}`)
        .join('\n');
      const process = selectedProps
        .map((prop) => {
          const shapeCodes = j442ShapesForProperty(prop.code);
          return `具有「${prop.name}」的圖形是 ${j442ShapeNames(shapeCodes)}，所以填 ${shapeCodes.join('、')}`;
        })
        .join('\n');
      questions.push(`圖形代號選項：${shapeList}。請依每個性質名稱，填入符合的圖形代號：${prompts}。`);
      answers.push(`簡答：\n${simple}\n過程：\n${process}`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ443TrapezoidMidlineBasicSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const top = randInt(4, 18);
        const bottom = top + randInt(2, 18);
        const mid = makeFraction(top + bottom, 2);
        questions.push(`已知一梯形的上底為 ${top}、下底為 ${bottom}，求其中線長。`);
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(mid)}\\)。過程：梯形中線長為上底與下底的平均，\\(\\frac{${top}+${bottom}}{2}=${formatFunctionFractionValue(mid)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const top = randInt(4, 15);
        const bottom = top + randInt(4, 20);
        const mid = makeFraction(top + bottom, 2);
        questions.push(`設一梯形的中線長為 \\(${formatFunctionFractionValue(mid)}\\)，上底為 ${top}，求下底長度。`);
        answers.push(
          `簡答：${bottom}。過程：\\(中線=\\frac{上底+下底}{2}\\)，所以 \\(${formatFunctionFractionValue(mid)}=\\frac{${top}+下底}{2}\\)。兩邊乘以 2 得 ${top}+下底=${top + bottom}，故下底為 ${bottom}。`
        );
        continue;
      }
      if (mode === 2) {
        const ratio = [
          [1, 3],
          [2, 3],
          [3, 5],
          [4, 7],
        ][randInt(0, 3)];
        const unit = randInt(2, 8);
        const top = ratio[0] * unit;
        const bottom = ratio[1] * unit;
        const mid = makeFraction(top + bottom, 2);
        const topExpr = formatTerm(ratio[0], 'x');
        const bottomExpr = formatTerm(ratio[1], 'x');
        const sumExpr = formatTerm(ratio[0] + ratio[1], 'x');
        questions.push(
          `若一梯形的上底與下底之比為 ${ratio[0]}:${ratio[1]}，且中線長為 \\(${formatFunctionFractionValue(mid)}\\)，求下底。`
        );
        answers.push(
          `簡答：${bottom}。過程：設上底、下底分別為 ${topExpr}、${bottomExpr}，則中線 \\(=\\frac{${topExpr}+${bottomExpr}}{2}=\\frac{${sumExpr}}{2}\\)。由中線為 \\(${formatFunctionFractionValue(mid)}\\) 得 \\(x=${unit}\\)，所以下底為 ${ratio[1]}\\cdot${unit}=${bottom}。`
        );
        continue;
      }
      if (mode === 3) {
        const top = randInt(4, 16);
        const diff = randInt(3, 15);
        const bottom = top + diff;
        const mid = makeFraction(top + bottom, 2);
        questions.push(
          `已知梯形的中線長為 \\(${formatFunctionFractionValue(mid)}\\)，且下底比上底長 ${diff}，求上底長度。`
        );
        answers.push(
          `簡答：${top}。過程：設上底為 \\(x\\)，下底為 \\(x+${diff}\\)。\\(\\frac{x+x+${diff}}{2}=${formatFunctionFractionValue(mid)}\\)，所以 \\(2x+${diff}=${top + bottom}\\)，解得 \\(x=${top}\\)。`
        );
        continue;
      }
      const x = randInt(3, 12);
      const topConst = randInt(1, 6);
      const bottomA = randInt(2, 4);
      const bottomConst = 2 * 13 - (1 + bottomA) * x - topConst;
      const mid = makeFraction(x + topConst + (bottomA * x + bottomConst), 2);
      if (
        bottomA * x + bottomConst <= 0 ||
        topConst + x <= 0 ||
        mid.num !== 13 * mid.den ||
        bottomConst < -8 ||
        bottomConst > 12
      ) {
        i -= 1;
        continue;
      }
      questions.push(
        `若一梯形的上底為 \\(x+${topConst}\\)，下底為 \\(${formatFunctionLinear(bottomA, bottomConst)}\\)，中線長為 13，求 \\(x\\) 之值。`
      );
      answers.push(
        `簡答：\\(x=${x}\\)。過程：中線公式為 \\(\\frac{(x+${topConst})+(${formatFunctionLinear(bottomA, bottomConst)})}{2}=13\\)，化簡得 \\(${formatFunctionLinear(1 + bottomA, topConst + bottomConst)}=26\\)，解得 \\(x=${x}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ443ParallelDivisionSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const top = randInt(4, 12);
        const bottom = top + randInt(6, 20);
        const mid = makeFraction(top + bottom, 2);
        questions.push(
          `梯形 \\(ABCD\\) 中，\\(AD\\parallel BC\\)，\\(E,F\\) 為兩腰中點。若 \\(AD=${top}\\)，\\(BC=${bottom}\\)，求 \\(EF\\)。`
        );
        answers.push(
          `簡答：\\(EF=${formatFunctionFractionValue(mid)}\\)。過程：兩腰中點連線為梯形中線，長度為兩底平均，\\(EF=\\frac{${top}+${bottom}}{2}=${formatFunctionFractionValue(mid)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const top = randInt(4, 10);
        const bottom = top + randInt(8, 24);
        const first = makeFraction(2 * top + bottom, 3);
        const second = makeFraction(top + 2 * bottom, 3);
        questions.push(`梯形的兩腰被三等分，且上底為 ${top}、下底為 ${bottom}，求中間兩條平行線段的長度。`);
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(first)}\\)、\\(${formatFunctionFractionValue(second)}\\)。過程：從上底到下底的平行線長成等差變化，公差為 \\(\\frac{${bottom}-${top}}{3}\\)。兩條分割線長為 \\(${formatFunctionFractionValue(first)}\\)、\\(${formatFunctionFractionValue(second)}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const top = randInt(4, 12);
        const bottom = top + randInt(8, 24);
        const first = makeFraction(2 * top + bottom, 3);
        const second = makeFraction(top + 2 * bottom, 3);
        const sum = addFraction(first, second);
        questions.push(
          `梯形 \\(ABCD\\) 中，將兩腰三等分。已知上底為 ${top}、下底為 ${bottom}，求中間兩條分割線段長度之和。`
        );
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(sum)}\\)。過程：三等分時中間兩線長為 \\(\\frac{2上底+下底}{3}\\)、\\(\\frac{上底+2下底}{3}\\)，相加為 \\(${formatFunctionFractionValue(first)}+${formatFunctionFractionValue(second)}=${formatFunctionFractionValue(sum)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const top = randInt(3, 10);
        const bottom = top + randInt(8, 28);
        const q1 = makeFraction(3 * top + bottom, 4);
        const q2 = makeFraction(top + bottom, 2);
        const q3 = makeFraction(top + 3 * bottom, 4);
        questions.push(
          `梯形 \\(ABCD\\) 中，將兩腰四等分。已知上底為 ${top}、下底為 ${bottom}，求中間三條平行線段的長度。`
        );
        answers.push(
          `簡答：\\(${formatFunctionFractionValue(q1)}\\)、\\(${formatFunctionFractionValue(q2)}\\)、\\(${formatFunctionFractionValue(q3)}\\)。過程：平行線段長從上底到下底等差變化，四等分時三條中間線依序為 \\(\\frac{3上底+下底}{4}\\)、\\(\\frac{上底+下底}{2}\\)、\\(\\frac{上底+3下底}{4}\\)，代入得上述結果。`
        );
        continue;
      }
      const top = randInt(4, 12);
      const bottom = top + randInt(12, 28);
      const parts = 3;
      const d = makeFraction(bottom - top, parts);
      const first = addFraction(makeFraction(top), d);
      const second = addFraction(makeFraction(top), mulFraction(d, makeFraction(2)));
      questions.push(
        `若梯形被三條等距的中位線分成四層，已知最上面一條線段長為 ${top}，最下面一條線段長為 ${bottom}，求中間兩層線段長之和。`
      );
      answers.push(
        `簡答：\\(${formatFunctionFractionValue(addFraction(first, second))}\\)。過程：四層表示從最上到最下共有 3 個等差間隔，公差為 \\(\\frac{${bottom}-${top}}{3}=${formatFunctionFractionValue(d)}\\)。中間兩層為 \\(${formatFunctionFractionValue(first)}\\)、\\(${formatFunctionFractionValue(second)}\\)，和為 \\(${formatFunctionFractionValue(addFraction(first, second))}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
      'j4-1-1-ap-core-mixed': {
        type: 'drill',
        title: '等差數列核心綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ411CoreMixedSet(6);
        },
      },
      'j4-1-1-ap-find-an': {
        type: 'drill',
        title: '基礎通項求值',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ411FindAnFromA1DNSet(5);
        },
      },
      'j4-1-1-ap-two-terms': {
        type: 'drill',
        title: '已知兩項求首項公差',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ411TwoTermsFindA1DSet(5);
        },
      },
      'j4-1-1-ap-find-n': {
        type: 'drill',
        title: '求項數判定',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ411FindNSet(5);
        },
      },
      'j4-1-1-ap-middle-term': {
        type: 'drill',
        title: '等差中項應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ411MiddleTermApplySet(5);
        },
      },
      'j4-1-1-ap-insert': {
        type: 'drill',
        title: '插入數與新公差',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ411InsertNumbersSet(5);
        },
      },
      'j4-1-1-ap-range-multiple-count': {
        type: 'drill',
        title: '範圍倍數判定（計算個數）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ411RangeMultipleCountSet(5);
        },
      },
      'j4-1-1-ap-common-term': {
        type: 'drill',
        title: '兩等差數列共同項',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ411CommonTermTwoAPSet(5);
        },
      },
      'j4-1-2-geometric-mixed': {
        type: 'drill',
        title: '等比數列五大題型綜合',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildJ412GeometricSequenceMixedSet(10);
        },
      },
      'j4-1-2-geometric-nth-term': {
        type: 'drill',
        title: '基礎通項求值',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ412GeometricNthTermSet(5);
        },
      },
      'j4-1-2-geometric-find-ratio-first': {
        type: 'drill',
        title: '求公比與首項',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ412FindRatioFirstTermSet(5);
        },
      },
      'j4-1-2-geometric-mean-unknown': {
        type: 'drill',
        title: '等比中項與代數應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ412GeometricMeanUnknownSet(5);
        },
      },
      'j4-1-2-geometric-term-index': {
        type: 'drill',
        title: '項數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ412TermIndexSet(5);
        },
      },
      'j4-1-2-geometric-word-applications': {
        type: 'drill',
        title: '生活應用規律',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ412WordApplicationSet(5);
        },
      },
      'j4-1-3-series-mixed': {
        type: 'drill',
        title: '等差級數五大題型綜合',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildJ413ArithmeticSeriesMixedSet(10);
        },
      },
      'j4-1-3-series-formula-core': {
        type: 'drill',
        title: '基礎求和與反求練習',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ413SeriesFormulaCoreSet(5);
        },
      },
      'j4-1-3-range-multiple-sum': {
        type: 'drill',
        title: '特定範圍內的倍數與餘數總和',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ413RangeMultipleSumSet(5);
        },
      },
      'j4-1-3-max-min-sum': {
        type: 'drill',
        title: '級數最大值與最小值判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ413MaxMinSumSet(5);
        },
      },
      'j4-1-3-word-applications': {
        type: 'drill',
        title: '生活情境與幾何排列應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ413WordApplicationSet(5);
        },
      },
      'j4-1-3-sn-relation': {
        type: 'drill',
        title: '進階 S_n 函數與項的關係',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ413SnRelationSet(5);
        },
      },
      'j4-2-1-function-mixed': {
        type: 'drill',
        title: '函數五大題型綜合',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildJ421FunctionMixedSet(10);
        },
      },
      'j4-2-1-function-relation-judge': {
        type: 'drill',
        title: '函數關係判別題',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ421FunctionRelationJudgeSet(5);
        },
      },
      'j4-2-1-function-value-basic': {
        type: 'drill',
        title: '基礎函數值計算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ421FunctionValueBasicSet(5);
        },
      },
      'j4-2-1-function-reverse-solve': {
        type: 'drill',
        title: '函數值的反求與未知數求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ421FunctionReverseSolveSet(5);
        },
      },
      'j4-2-1-function-flow-composite': {
        type: 'drill',
        title: '計算流程圖與複合運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ421FunctionFlowCompositeSet(5);
        },
      },
      'j4-2-1-function-word-model': {
        type: 'drill',
        title: '生活情境與公式轉換應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ421FunctionWordModelSet(5);
        },
      },
      'j4-2-2-linear-function-mixed': {
        type: 'drill',
        title: '線型函數四大題型綜合',
        difficulty: 'medium',
        questionCount: 8,
        generate() {
          return buildJ422LinearFunctionMixedSet(8);
        },
      },
      'j4-2-2-linear-equation-two-points': {
        type: 'drill',
        title: '求線型函數關係式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ422LinearEquationTwoPointsSet(5);
        },
      },
      'j4-2-2-intercept-position': {
        type: 'drill',
        title: '坐標軸交點與圖形位置判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ422InterceptPositionSet(5);
        },
      },
      'j4-2-2-axis-area': {
        type: 'drill',
        title: '線型函數圖形與坐標軸的面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ422AxisAreaSet(5);
        },
      },
      'j4-2-2-line-intersection-parallel': {
        type: 'drill',
        title: '兩直線交點與平行性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ422LineIntersectionParallelSet(5);
        },
      },
      'j4-3-1-polygon-angle-mixed': {
        type: 'drill',
        title: '三角形與多邊形角度綜合',
        difficulty: 'medium',
        questionCount: 9,
        generate() {
          return buildJ431PolygonAngleMixedSet(9);
        },
      },
      'j4-3-1-complementary-supplementary-angles': {
        type: 'drill',
        title: '補角與餘角推理綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ431ComplementarySupplementaryAngleSet(5);
        },
      },
      'j4-3-2-construction-bisection-count': {
        type: 'drill',
        title: '尺規作圖平分次數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ432ConstructionBisectionSet(5);
        },
      },
      'j4-4-1-parallel-perpendicular-angles': {
        type: 'drill',
        title: '平行垂直角度六型綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ441ParallelPerpendicularAngleMixedSet(6);
        },
      },
      'j4-4-2-quadrilateral-property-codes': {
        type: 'drill',
        title: '特殊四邊形性質代號判讀',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ442QuadrilateralPropertyCodeSet(6);
        },
      },
      'j4-4-3-trapezoid-midline-basic': {
        type: 'drill',
        title: '梯形中線基本運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ443TrapezoidMidlineBasicSet(5);
        },
      },
      'j4-4-3-parallel-division': {
        type: 'drill',
        title: '多重平行線分割',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ443ParallelDivisionSet(5);
        },
      },
  };

  const bundleFingerprint = "j4-bundle-v20260619-v1";
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== "object") return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
