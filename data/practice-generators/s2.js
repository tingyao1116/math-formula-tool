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

  function pickNonSquare(min, max) {
    let v = randInt(min, max);
    while (isPerfectSquare(v)) v = randInt(min, max);
    return v;
  }

  function formatLinearExpr(a, b) {
    if (a === 0) return `${b}`;
    const xPart = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
    if (b === 0) return xPart;
    return `${xPart}${b > 0 ? '+' : ''}${b}`;
  }

  function primeFactorize(n) {
    const factors = [];
    let value = Math.abs(Number(n) || 0);
    for (let p = 2; p * p <= value; p += p === 2 ? 1 : 2) {
      if (value % p !== 0) continue;
      let exp = 0;
      while (value % p === 0) {
        value /= p;
        exp += 1;
      }
      factors.push({ prime: p, exp });
    }
    if (value > 1) {
      factors.push({ prime: value, exp: 1 });
    }
    return factors;
  }

  function formatPrimeFactorization(factors) {
    return factors.map(({ prime, exp }) => (exp === 1 ? `${prime}` : `${prime}^{${exp}}`)).join(' \\times ');
  }

  function divisorCountFromFactors(factors) {
    return factors.reduce((product, { exp }) => product * (exp + 1), 1);
  }

  function divisorSumFromFactors(factors) {
    return factors.reduce((product, { prime, exp }) => {
      return product * ((prime ** (exp + 1) - 1) / (prime - 1));
    }, 1);
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

  function formatSignedAdd(value) {
    return value >= 0 ? `+${value}` : `${value}`;
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

  function latexSub(base, index) {
    return `${base}_{${index}}`;
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

  function buildS211SequenceFiveSubtypeMixedSet(count, fixedMode = null) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const aTerm = (index) => latexSub('a', index);
    for (let i = 0; i < count; i += 1) {
      const mode = Number.isInteger(fixedMode) ? fixedMode : i % 5;
      if (mode === 0) {
        const type = Number.isInteger(fixedMode) ? i % 5 : randInt(0, 4);
        if (type === 0) {
          const p = pickNonZero(-6, 8);
          const q = pickNonZero(-12, 12);
          const n = randInt(5, 15);
          const value = p * n + q;
          questions.push(`已知一般項公式。設 \\(a_n=${formatFunctionLinear(p, q, 'n')}\\)，求 \\(${aTerm(n)}\\)。`);
          answers.push(
            `簡答：\\(${aTerm(n)}=${value}\\)。過程：把 \\(n=${n}\\) 代入 \\(a_n=${formatFunctionLinear(p, q, 'n')}\\)，得 \\(${aTerm(n)}=${p}\\cdot${n}${q === 0 ? '' : formatSignedAdd(q)}=${value}\\)。`
          );
          continue;
        }
        if (type === 1) {
          const n = randInt(4, 12);
          const value = makeFraction(n, 2 * n + 1);
          questions.push(`已知一般項公式。設 \\(a_n=\\frac{n}{2n+1}\\)，求 \\(${aTerm(n)}\\)。`);
          answers.push(
            `簡答：\\(${aTerm(n)}=${formatFraction(value.num, value.den)}\\)。過程：代入 \\(n=${n}\\)，\\(${aTerm(n)}=\\frac{${n}}{2\\cdot${n}+1}=\\frac{${n}}{${2 * n + 1}}=${formatFraction(value.num, value.den)}\\)。`
          );
          continue;
        }
        if (type === 2) {
          const n = randInt(3, 7);
          const base = [-2, -3][randInt(0, 1)];
          const value = powInt(base, n) * (n + 1);
          questions.push(`已知一般項公式。設 \\(a_n=(${base})^n(n+1)\\)，求 \\(${aTerm(n)}\\)。`);
          answers.push(
            `簡答：\\(${aTerm(n)}=${value}\\)。過程：代入 \\(n=${n}\\)，\\(${aTerm(n)}=(${base})^{${n}}(${n}+1)=${powInt(base, n)}\\cdot${n + 1}=${value}\\)。`
          );
          continue;
        }
        if (type === 3) {
          const n = randInt(4, 9);
          const value = powInt(2, n - 1) + n * n;
          questions.push(`已知一般項公式。設 \\(a_n=2^{n-1}+n^2\\)，求 \\(${aTerm(n)}\\)。`);
          answers.push(
            `簡答：\\(${aTerm(n)}=${value}\\)。過程：代入 \\(n=${n}\\)，\\(${aTerm(n)}=2^{${n - 1}}+${n}^2=${powInt(2, n - 1)}+${n * n}=${value}\\)。`
          );
          continue;
        }
        const n = randInt(5, 14);
        const c = pickNonSquare(2 * n + 2, 5 * n + 20);
        const p = Math.max(1, Math.floor((c - 1) / n));
        const inside = p * n + 1;
        if (isPerfectSquare(inside)) {
          i -= 1;
          continue;
        }
        questions.push(`已知一般項公式。設 \\(a_n=\\sqrt{${p}n+1}\\)，求 \\(${aTerm(n)}\\)。`);
        answers.push(
          `簡答：\\(${aTerm(n)}=${formatRadical(inside)}\\)。過程：代入 \\(n=${n}\\)，\\(${aTerm(n)}=\\sqrt{${p}\\cdot${n}+1}=\\sqrt{${inside}}${simplifyRadical(inside).outside > 1 ? '=' + formatRadical(inside) : ''}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        const type = Number.isInteger(fixedMode) ? i % 5 : randInt(0, 4);
        if (type === 0) {
          const a1 = pickNonZero(-12, 20);
          const d = pickNonZero(-7, 7);
          const n = randInt(12, 30);
          const an = a1 + (n - 1) * d;
          questions.push(
            `等差數列基本參數計算。等差數列 \\(${aTerm(1)}=${a1}\\)，公差 \\(d=${d}\\)，求 \\(${aTerm(n)}\\)。`
          );
          answers.push(
            `簡答：\\(${aTerm(n)}=${an}\\)。過程：\\(a_n=a_1+(n-1)d\\)，所以 \\(${aTerm(n)}=${a1}+${n - 1}\\cdot(${d})=${an}\\)。`
          );
          continue;
        }
        if (type === 1) {
          const m = randInt(2, 5);
          const n = m + randInt(3, 8);
          const d = pickNonZero(2, 7);
          const a1 = pickNonZero(-10, 15);
          const am = a1 + (m - 1) * d;
          const an = a1 + (n - 1) * d;
          questions.push(`等差數列基本參數計算。等差數列第 ${m} 項為 ${am}，第 ${n} 項為 ${an}，求公差 \\(d\\)。`);
          answers.push(
            `簡答：\\(d=${d}\\)。過程：\\(${aTerm(n)}-${aTerm(m)}=(${n}-${m})d\\)，所以 \\(${an}-(${am})=${n - m}d\\)，得 \\(d=${d}\\)。`
          );
          continue;
        }
        if (type === 2) {
          const a = randInt(5, 20);
          const d = randInt(2, 6);
          const insert = randInt(5, 30);
          const b = a + (insert + 1) * d;
          questions.push(
            `等差數列基本參數計算。在 ${a} 與 ${b} 之間插入 ${insert} 個數使其成等差數列，求此數列的公差。`
          );
          answers.push(
            `簡答：\\(d=${d}\\)。過程：插入 ${insert} 個數後，從 ${a} 到 ${b} 共分成 ${insert + 1} 段，所以公差 \\(d=\\frac{${b}-${a}}{${insert + 1}}=${d}\\)。`
          );
          continue;
        }
        if (type === 3) {
          const a1 = randInt(20, 60);
          const d = -randInt(2, 8);
          const firstNeg = Math.floor(1 - a1 / d) + 1;
          const terms = [a1, a1 + d, a1 + 2 * d, a1 + 3 * d];
          questions.push(`等差數列基本參數計算。等差數列 \\(${terms.join(', ')},\\ldots\\)，問自第幾項開始變為負數？`);
          answers.push(
            `簡答：第 ${firstNeg} 項。過程：通項 \\(a_n=${a1}+(n-1)(${d})\\)。要求 \\(a_n<0\\)，解得 \\(n>1-\\frac{${a1}}{${d}}\\)，所以最小整數為 ${firstNeg}。`
          );
          continue;
        }
        const a1 = pickNonZero(-15, 15);
        const d = pickNonZero(-5, 5);
        const a5 = a1 + 4 * d;
        const a10 = a1 + 9 * d;
        const target = a1 + 13 * d;
        questions.push(
          `等差數列基本參數計算。已知等差數列 \\(${aTerm(5)}+${aTerm(10)}=${a5 + a10}\\)，求 \\(${aTerm(1)}+${aTerm(14)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(1)}+${aTerm(14)}=${a1 + target}\\)。過程：等差數列中，下標和相同的兩項和相等。因為 \\(5+10=1+14=15\\)，所以 \\(${aTerm(1)}+${aTerm(14)}=${aTerm(5)}+${aTerm(10)}=${a5 + a10}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        const type = Number.isInteger(fixedMode) ? i % 5 : randInt(0, 4);
        if (type === 0) {
          const a1 = [2, 3, 4][randInt(0, 2)];
          const r = [2, 3, -2][randInt(0, 2)];
          const n = randInt(5, 10);
          const an = a1 * powInt(r, n - 1);
          questions.push(
            `等比數列基本參數計算。等比數列 \\(${aTerm(1)}=${a1}\\)，公比 \\(r=${r}\\)，求 \\(${aTerm(n)}\\)。`
          );
          answers.push(
            `簡答：\\(${aTerm(n)}=${an}\\)。過程：\\(a_n=a_1r^{n-1}\\)，所以 \\(${aTerm(n)}=${a1}\\cdot(${r})^{${n - 1}}=${an}\\)。`
          );
          continue;
        }
        if (type === 1) {
          const r = [2, 3, -2][randInt(0, 2)];
          const a1 = pickNonZero(1, 5);
          const a2 = a1 * r;
          const a5 = a1 * powInt(r, 4);
          questions.push(`等比數列基本參數計算。等比數列第 2 項為 ${a2}，第 5 項為 ${a5}，求公比 \\(r\\)。`);
          answers.push(
            `簡答：\\(r=${r}\\)。過程：\\(\\frac{a_5}{a_2}=r^{5-2}=r^3\\)，所以 \\(r^3=\\frac{${a5}}{${a2}}=${powInt(r, 3)}\\)，得 \\(r=${r}\\)。`
          );
          continue;
        }
        if (type === 2) {
          const a = randInt(2, 5);
          const r = randInt(2, 4);
          const x = a * r;
          const y = a * r * r;
          const b = a * r * r * r;
          questions.push(
            `等比數列基本參數計算。在 ${a} 與 ${b} 之間插入兩個正數 \\(x,y\\)，使其成等比數列，求 \\((x,y)\\)。`
          );
          answers.push(
            `簡答：\\((x,y)=(${x},${y})\\)。過程：四項為 \\(${a},x,y,${b}\\)，公比 \\(r\\) 滿足 \\(${a}r^3=${b}\\)，得 \\(r=${r}\\)，所以 \\(x=${a}\\cdot${r}=${x}\\)，\\(y=${a}\\cdot${r}^2=${y}\\)。`
          );
          continue;
        }
        if (type === 3) {
          const a1 = makeFraction(1, [2, 3, 4][randInt(0, 2)]);
          const r = randInt(2, 4);
          const a4 = mulFraction(a1, makeFraction(powInt(r, 3), 1));
          const a8 = mulFraction(a1, makeFraction(powInt(r, 7), 1));
          questions.push(
            `等比數列基本參數計算。等比數列 \\(${aTerm(1)}=${formatFraction(a1.num, a1.den)}\\)，\\(${aTerm(4)}=${formatFraction(a4.num, a4.den)}\\)，求第 8 項。`
          );
          answers.push(
            `簡答：\\(${aTerm(8)}=${formatFraction(a8.num, a8.den)}\\)。過程：由 \\(${aTerm(4)}=a_1r^3\\)，得 \\(r=${r}\\)。所以 \\(${aTerm(8)}=a_1r^7=${formatFraction(a1.num, a1.den)}\\cdot${r}^7=${formatFraction(a8.num, a8.den)}\\)。`
          );
          continue;
        }
        const a1 = randInt(2, 8);
        const r = [2, 3][randInt(0, 1)];
        const a3 = a1 * r * r;
        const a5 = a1 * powInt(r, 4);
        questions.push(
          `等比數列基本參數計算。已知等比數列 \\(a_n\\) 每一項均為正數，若 \\(${aTerm(3)}=${a3}\\)、\\(${aTerm(5)}=${a5}\\)，求 \\(${aTerm(1)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(1)}=${a1}\\)。過程：\\(\\frac{${aTerm(5)}}{${aTerm(3)}}=r^2=\\frac{${a5}}{${a3}}=${r * r}\\)，且各項為正，所以 \\(r=${r}\\)。再由 \\(${aTerm(3)}=a_1r^2\\)，得 \\(${aTerm(1)}=${a3}\\div${r * r}=${a1}\\)。`
        );
        continue;
      }

      if (mode === 3) {
        const type = Number.isInteger(fixedMode) ? i % 5 : randInt(0, 4);
        if (type === 0) {
          const x = randInt(2, 9);
          const a = randInt(1, 5);
          const b = randInt(-3, 4);
          const c = 2 * x - a - 2 * b;
          questions.push(
            `等差中項與等比中項的應用。若 \\(x-${a},\\ 2x${formatSignedAdd(b)},\\ 5x${formatSignedAdd(-c)}\\) 三數成等差數列，求 \\(x\\)。`
          );
          answers.push(
            `簡答：\\(x=${x}\\)。過程：三數成等差表示中項兩倍等於兩端和：\\(2(2x${formatSignedAdd(b)})=(x-${a})+(5x${formatSignedAdd(-c)})\\)。整理後可得 \\(x=${x}\\)。`
          );
          continue;
        }
        if (type === 1) {
          const mid = [6, 9, 12][randInt(0, 2)];
          const last = (3 * mid * mid) / 9;
          const k = mid - 2;
          questions.push(`等差中項與等比中項的應用。若 \\(k+2\\) 是 3 與 ${last} 的等比中項，求 \\(k\\) 之值。`);
          answers.push(
            `簡答：\\(k=${k}\\) 或 \\(k=${-mid - 2}\\)。過程：等比中項平方等於兩端乘積，所以 \\((k+2)^2=3\\cdot${last}=${mid * mid}\\)，得 \\(k+2=\\pm${mid}\\)。`
          );
          continue;
        }
        if (type === 2) {
          const g = randInt(2, 6);
          const r = randInt(2, 4);
          const a = g / r;
          const b = g * r;
          const mid = formatFraction(g * (1 + r * r), 2 * r);
          const sum = makeFraction(g * (1 + r * r), r);
          const squareSum = makeFraction(g * g * (1 + r ** 4), r * r);
          questions.push(
            `等差中項與等比中項的應用。已知 \\(a,${g},b\\) 成等比數列，且 \\(a,${mid},b\\) 成等差數列，求 \\(a^2+b^2\\)。`
          );
          answers.push(
            `簡答：\\(${formatFraction(squareSum.num, squareSum.den)}\\)。過程：由等比得 \\(ab=${g * g}\\)，由等差得 \\(a+b=${formatFraction(sum.num, sum.den)}\\)。因此 \\(a^2+b^2=(a+b)^2-2ab=${formatFraction(squareSum.num, squareSum.den)}\\)。`
          );
          continue;
        }
        if (type === 3) {
          const center = randInt(3, 9);
          const r = randInt(2, 4);
          const left = center;
          const mid = center * r;
          const right = center * r * r;
          const product = mid ** 3;
          const sum = left + mid + right;
          questions.push(`等差中項與等比中項的應用。若三正數成等比數列，其積為 ${product}，其和為 ${sum}，求此三數。`);
          answers.push(
            `簡答：${left}、${mid}、${right}。過程：設三數為 \\(\\frac{a}{r},a,ar\\)。其積為 \\(a^3=${product}\\)，得 \\(a=${mid}\\)。再由總和 ${sum} 可得公比為 \\(${r}\\) 或 \\(\\frac1{${r}}\\)，所以三數為 ${left}、${mid}、${right}。`
          );
          continue;
        }
        const x = randInt(4, 12);
        const y = x + 2 * randInt(1, 5);
        const mean = (x + y) / 2;
        const product = x * y;
        questions.push(
          `等差中項與等比中項的應用。若 \\(x,y\\) 的算術平均數為 ${mean}，幾何平均數為 \\(\\sqrt{${product}}\\)，求以 \\(x,y\\) 為兩根的一元二次方程式。`
        );
        answers.push(
          `簡答：\\(t^2-${x + y}t+${product}=0\\)。過程：算術平均為 ${mean}，故 \\(x+y=${x + y}\\)；幾何平均為 \\(\\sqrt{${product}}\\)，故 \\(xy=${product}\\)。以 \\(x,y\\) 為根的方程式為 \\(t^2-(x+y)t+xy=0\\)，所以 \\(t^2-${x + y}t+${product}=0\\)。`
        );
        continue;
      }

      const type = Number.isInteger(fixedMode) ? i % 5 : randInt(0, 4);
      if (type === 0) {
        const a1 = randInt(1, 8);
        const c = randInt(2, 6);
        const n = randInt(10, 40);
        const an = a1 + (n - 1) * c;
        questions.push(
          `基礎遞迴關係式的項數推導。設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=a_{n-1}+${c}\\ (n\\geq2)\\)，求 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${an}\\)。過程：每次增加 ${c}，所以是等差數列，\\(a_n=a_1+(n-1)${c}\\)。代入 \\(n=${n}\\)，得 \\(${aTerm(n)}=${an}\\)。`
        );
        continue;
      }
      if (type === 1) {
        const n = randInt(4, 7);
        const a1 = randInt(1, 3);
        let value = a1;
        for (let j = 2; j <= n; j += 1) value = 2 * value + 1;
        questions.push(
          `基礎遞迴關係式的項數推導。設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=2a_{n-1}+1\\ (n\\geq2)\\)，求 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${value}\\)。過程：逐項推得 \\(${aTerm(2)}=${2 * a1 + 1}\\)，再依同一遞迴式推到第 ${n} 項，可得 \\(${aTerm(n)}=${value}\\)。`
        );
        continue;
      }
      if (type === 2) {
        const n = randInt(4, 7);
        const a1 = randInt(1, 4);
        let value = a1;
        for (let j = 2; j <= n; j += 1) value *= j;
        questions.push(
          `基礎遞迴關係式的項數推導。設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=n\\cdot a_{n-1}\\ (n\\geq2)\\)，求 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${value}\\)。過程：\\(a_n=n(n-1)\\cdots2\\cdot a_1\\)，所以 \\(${aTerm(n)}=${n}!\\cdot${a1}=${value}\\)。`
        );
        continue;
      }
      if (type === 3) {
        const n = [10, 20, 50, 100][randInt(0, 3)];
        questions.push(
          `基礎遞迴關係式的項數推導。設 \\(${aTerm(1)}=2\\)，\\(a_n=\\frac{1}{1-a_{n-1}}\\)，求 \\(${aTerm(n)}\\)。`
        );
        const cycle = [2, -1, makeFraction(1, 2)];
        const value = cycle[(n - 1) % 3];
        const text = typeof value === 'number' ? `${value}` : formatFraction(value.num, value.den);
        answers.push(
          `簡答：\\(${aTerm(n)}=${text}\\)。過程：依序算得 \\(${aTerm(1)}=2\\)、\\(${aTerm(2)}=-1\\)、\\(${aTerm(3)}=\\frac12\\)、\\(${aTerm(4)}=2\\)，所以週期為 3。因為 ${n} 除以 3 的餘數決定位置，得 \\(${aTerm(n)}=${text}\\)。`
        );
        continue;
      }
      const n = randInt(8, 15);
      const value = n * n;
      questions.push(
        `基礎遞迴關係式的項數推導。設 \\(${aTerm(1)}=1\\)，\\(a_n=a_{n-1}+(2n-1)\\)，求 \\(${aTerm(n)}\\)。`
      );
      answers.push(
        `簡答：\\(${aTerm(n)}=${value}\\)。過程：每次增加奇數，\\(a_n=1+3+5+\\cdots+(2n-1)=n^2\\)。代入 \\(n=${n}\\)，得 \\(${aTerm(n)}=${n}^2=${value}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS211NthFormulaValueSet(count) {
    return buildS211SequenceFiveSubtypeMixedSet(count, 0);
  }

  function buildS211ArithmeticBasicParameterSet(count) {
    return buildS211SequenceFiveSubtypeMixedSet(count, 1);
  }

  function buildS211GeometricBasicParameterSet(count) {
    return buildS211SequenceFiveSubtypeMixedSet(count, 2);
  }

  function buildS211MeansApplicationSet(count) {
    return buildS211SequenceFiveSubtypeMixedSet(count, 3);
  }

  function buildS211BasicRecurrenceTermSet(count) {
    return buildS211SequenceFiveSubtypeMixedSet(count, 4);
  }

  function buildS211ArithmeticGeometricMixedParameterSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const aTerm = (index) => latexSub('a', index);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const first = [2, 3, 4, 5, 6, 7, 10][randInt(0, 6)];
        const r = [2, 3][randInt(0, 1)];
        const k = [3, 5][randInt(0, 1)]; // 插入 k 個數（k 為奇數，公比有 ± 兩解）
        const power = k + 1;
        const last = first * powInt(r, power);
        const countText = k === 3 ? '三' : '五';
        const midVars = k === 3 ? 'x,y,z' : 'x_1,x_2,x_3,x_4,x_5';
        questions.push(
          `等差與等比數列的混合參數：在 ${first} 與 ${last} 之間插入${countText}個實數 \\(${midVars}\\)，使這 ${k + 2} 個數成等比數列，求此數列所有可能的公比。`
        );
        answers.push(
          `簡答：\\(r=${r}\\) 或 \\(r=-${r}\\)。過程：首末共 ${k + 2} 項，所以 \\(${first}r^{${power}}=${last}\\)，得 \\(r^{${power}}=${powInt(r, power)}\\)。因 ${power} 為偶數，實數公比為 \\(\\pm${r}\\)。`
        );
        continue;
      }

      if (type === 1) {
        // a-t,b-t,c+t 成等比；a,b,c 成遞增等差(公差 d)。b=[t^2+(d+t)^2]/(2t)。
        let d = 2 * randInt(1, 8);
        let t = randInt(1, 3);
        let b = (t * t + (d + t) * (d + t)) / (2 * t);
        for (let attempt = 0; !Number.isInteger(b) && attempt < 40; attempt += 1) {
          d = 2 * randInt(1, 8);
          t = randInt(1, 3);
          b = (t * t + (d + t) * (d + t)) / (2 * t);
        }
        if (!Number.isInteger(b)) {
          d = 2;
          t = 1;
          b = (t * t + (d + t) * (d + t)) / (2 * t);
        }
        const a = b - d;
        const c = b + d;
        const sum = a + b + c;
        questions.push(
          `等差與等比數列的混合參數：已知 \\(a,b,c\\) 成遞增等差數列且和為 ${sum}；若 \\(a-${t},b-${t},c+${t}\\) 成等比數列，求 \\((a,b,c)\\)。`
        );
        answers.push(
          `簡答：\\((a,b,c)=(${a},${b},${c})\\)。過程：設三數為 \\(b-d,b,b+d\\)，由和為 ${sum} 得 \\(b=${b}\\)。又 \\((b-${t})^2=(b-d-${t})(b+d+${t})\\)，解得 \\(d=${d}\\)，所以三數為 ${a},${b},${c}。`
        );
        continue;
      }

      if (type === 2) {
        // a,g,b 成等比 => ab=g^2 ; a,m,b 成等差 => a+b=2m ; |a-b|=2√(m^2-g^2)
        let g = 2;
        let m = 5;
        for (let attempt = 0; attempt < 20; attempt += 1) {
          g = randInt(2, 6);
          m = g + randInt(1, 6);
          if (!isPerfectSquare(m * m - g * g)) break; // 避免答案退化為整數，保持根式練習
        }
        const inside = 4 * (m * m - g * g);
        questions.push(
          `等差與等比數列的混合參數：已知 \\(a,${g},b\\) 三數成等比數列，且 \\(a,${m},b\\) 三數成等差數列，求 \\(|a-b|\\) 的值。`
        );
        answers.push(
          `簡答：\\(${formatRadical(inside)}\\)。過程：由等比中項得 \\(ab=${g}^2=${g * g}\\)；由等差中項得 \\(a+b=${2 * m}\\)。因此 \\((a-b)^2=(a+b)^2-4ab=${4 * m * m}-${4 * g * g}=${inside}\\)，所以 \\(|a-b|=${formatRadical(inside)}\\)。`
        );
        continue;
      }

      if (type === 3) {
        const first = randInt(8, 18);
        const d = randInt(2, 5);
        const insert = randInt(4, 10);
        const last = first + (insert + 1) * d;
        const fourth = first + 3 * d;
        questions.push(
          `等差與等比數列的混合參數：在 ${first} 與 ${last} 之間插入 \\(k\\) 個數使其成等差數列。若第四項為 ${fourth}，求 \\(k\\)。`
        );
        answers.push(
          `簡答：\\(k=${insert}\\)。過程：第四項為 \\(${first}+3d=${fourth}\\)，所以公差 \\(d=${d}\\)。從 ${first} 到 ${last} 的總段數為 \\(\\frac{${last}-${first}}{${d}}=${insert + 1}\\)，因此插入數 \\(k=${insert + 1}-1=${insert}\\)。`
        );
        continue;
      }

      const base = [2, 3, 5, 7][randInt(0, 3)];
      if (randInt(0, 1) === 0) {
        questions.push(
          `等差與等比數列的混合參數：已知 \\(${aTerm(1)},${aTerm(2)},${aTerm(3)},${aTerm(4)},\\ldots\\) 成等差數列，公差為 \\(d\\)。設 \\(b_n=${base}^{a_n}\\)，證明 \\(b_n\\) 為等比數列並用 \\(d\\) 表示其公比。`
        );
        answers.push(
          `簡答：\\(b_n\\) 為等比數列，公比為 \\(${base}^d\\)。過程：因為 \\(a_{n+1}=a_n+d\\)，所以 \\(\\frac{b_{n+1}}{b_n}=\\frac{${base}^{a_{n+1}}}{${base}^{a_n}}=${base}^{a_{n+1}-a_n}=${base}^d\\)。相鄰兩項比值固定，故 \\(b_n\\) 是等比數列。`
        );
      } else {
        const dVal = pickNonZero(-3, 4);
        const ratioValue = dVal >= 0 ? `${powInt(base, dVal)}` : `\\frac{1}{${powInt(base, -dVal)}}`;
        questions.push(
          `等差與等比數列的混合參數：已知等差數列 \\(\\langle a_n\\rangle\\) 的公差為 \\(d=${dVal}\\)。設 \\(b_n=${base}^{a_n}\\)，證明 \\(b_n\\) 為等比數列並求其公比。`
        );
        answers.push(
          `簡答：\\(b_n\\) 為等比數列，公比為 \\(${base}^{${dVal}}=${ratioValue}\\)。過程：因為 \\(a_{n+1}=a_n+d\\)，所以 \\(\\frac{b_{n+1}}{b_n}=${base}^{a_{n+1}-a_n}=${base}^{${dVal}}=${ratioValue}\\)。比值固定，故 \\(b_n\\) 為等比數列。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS211VisualGroupPatternSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const aTerm = (index) => latexSub('a', index);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;
      const cycle = randInt(0, 29);

      if (type === 0) {
        const group = 8 + cycle + randInt(0, 8);
        const last = (group * (group + 1)) / 2;
        questions.push(
          `圖形規律與群數列：將自然數依序分組為 \\((1),(2,3),(4,5,6),\\ldots\\)，求第 ${group} 組中的最後一個數。`
        );
        answers.push(
          `簡答：${last}。過程：第 \\(k\\) 組有 \\(k\\) 個數，所以第 ${group} 組最後一個數是 \\(1+2+\\cdots+${group}=\\frac{${group}(${group}+1)}{2}=${last}\\)。`
        );
        continue;
      }

      if (type === 1) {
        const first = [5, 8, 12][randInt(0, 2)];
        const diff = [4, 6, 8][randInt(0, 2)];
        const n = 12 + cycle + randInt(0, 8);
        const value = first + (n - 1) * diff;
        questions.push(
          `圖形規律與群數列：用正方形磁磚鋪圖形，第 1 圖需 ${first} 塊，之後每增加一圖多 ${diff} 塊，求第 ${n} 圖需要幾塊磁磚。`
        );
        answers.push(
          `簡答：${value} 塊。過程：磁磚數形成等差數列，\\(${aTerm(1)}=${first}\\)、\\(d=${diff}\\)。所以 \\(${aTerm(n)}=${first}+(${n}-1)\\cdot${diff}=${value}\\)。`
        );
        continue;
      }

      if (type === 2) {
        const n = 6 + cycle + randInt(0, 6);
        const value = (n * (n + 1)) / 2 + 1;
        questions.push(
          `圖形規律與群數列：平面上有 ${n} 條直線，任兩線不平行且任三線不共點，最多可將平面分成幾個區域？`
        );
        answers.push(
          `簡答：${value} 個。過程：第 \\(n\\) 條直線最多和前面 \\(n-1\\) 條直線相交，新增 \\(n\\) 個區域，所以 \\(a_n=1+(1+2+\\cdots+n)=1+\\frac{n(n+1)}{2}\\)。代入 \\(n=${n}\\)，得 ${value}。`
        );
        continue;
      }

      if (type === 3) {
        const p = randInt(2, 6);
        const q = randInt(3, 9);
        const group = p + q - 1;
        const index = ((group - 1) * group) / 2 + p;
        questions.push(
          `圖形規律與群數列：數列 \\(\\frac{1}{1},\\frac{1}{2},\\frac{2}{1},\\frac{1}{3},\\frac{2}{2},\\frac{3}{1},\\ldots\\) 依分子分母和分組排列，問 \\(\\frac{${p}}{${q}}\\) 是第幾項？`
        );
        answers.push(
          `簡答：第 ${index} 項。過程：\\(\\frac{${p}}{${q}}\\) 的分子分母和為 ${p + q}，所以在第 ${group} 組；前面共有 \\(1+2+\\cdots+${group - 1}=\\frac{${group - 1}\\cdot${group}}{2}\\) 項。它在該組第 ${p} 個，因此項序為 ${index}。`
        );
        continue;
      }

      const layer = 8 + cycle + randInt(0, 5);
      const balls = (layer * (layer + 1)) / 2;
      questions.push(
        `圖形規律與群數列：一堆圓球排成三角堆，第 1 層 1 個、第 2 層 2 個、第 3 層 3 個，求第 ${layer} 層為止共有多少個圓球。`
      );
      answers.push(
        `簡答：${balls} 個。過程：總數是前三角數，\\(1+2+\\cdots+${layer}=\\frac{${layer}(${layer}+1)}{2}=${balls}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS211RecurrenceTransformSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const aTerm = (index) => latexSub('a', index);
    const fracText = (frac) => formatFraction(frac.num, frac.den);
    const transformFraction = (start, steps, coeffs) => {
      let value = makeFraction(start.num, start.den);
      const terms = [value];
      for (let j = 2; j <= steps; j += 1) {
        const numerator = addFraction(mulFraction(makeFraction(coeffs.a, 1), value), makeFraction(coeffs.b, 1));
        const denominator = addFraction(mulFraction(makeFraction(coeffs.c, 1), value), makeFraction(coeffs.d, 1));
        value = divFraction(numerator, denominator);
        terms.push(value);
      }
      return terms;
    };

    for (let i = 0; i < count; i += 1) {
      const type = i % 8;

      if (type === 0) {
        const a1 = randInt(2, 6);
        const n = randInt(6, 10);
        const value = (a1 - 1) * powInt(2, n - 1) + 1;
        questions.push(
          `線性遞迴轉換：設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=2a_{n-1}-1\\ (n\\geq2)\\)，求 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${value}\\)。過程：兩邊同減 1 得 \\(a_n-1=2(a_{n-1}-1)\\)，所以 \\(a_n-1=(${a1}-1)2^{n-1}\\)。代入 \\(n=${n}\\)，得 \\(${aTerm(n)}=${value}\\)。`
        );
        continue;
      }

      if (type === 1) {
        const a1 = randInt(1, 4);
        const n = randInt(4, 6);
        let value = a1;
        for (let j = 2; j <= n; j += 1) value = 3 * value + 2;
        questions.push(
          `線性遞迴轉換：設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=3a_{n-1}+2\\ (n\\geq2)\\)，求 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${value}\\)。過程：固定點為 \\(-1\\)，所以 \\(a_n+1=3(a_{n-1}+1)\\)。因此 \\(a_n+1=(${a1}+1)3^{n-1}\\)，代入 \\(n=${n}\\) 得 \\(${aTerm(n)}=${value}\\)。`
        );
        continue;
      }

      if (type === 2) {
        const a1 = [0, 2, 4][randInt(0, 2)];
        const n = randInt(5, 8);
        const value = addFraction(
          makeFraction(6, 1),
          mulFraction(makeFraction(a1 - 6, 1), makeFraction(1, powInt(2, n - 1)))
        );
        questions.push(
          `線性遞迴轉換：設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=\\frac12a_{n-1}+3\\ (n\\geq2)\\)，求一般項 \\(a_n\\)，並求 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(a_n=6+(${a1}-6)\\left(\\frac12\\right)^{n-1}\\)，\\(${aTerm(n)}=${fracText(value)}\\)。過程：固定點 \\(L\\) 滿足 \\(L=\\frac12L+3\\)，得 \\(L=6\\)。因此 \\(a_n-6=\\frac12(a_{n-1}-6)\\)，推出一般項並代入 \\(n=${n}\\)。`
        );
        continue;
      }

      if (type === 3) {
        const a1 = randInt(1, 4);
        const n = 4;
        let value = a1;
        const terms = [a1];
        for (let j = 2; j <= n; j += 1) {
          value = 2 * value + (j + 1);
          terms.push(value);
        }
        questions.push(
          `線性遞迴轉換：設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=2a_{n-1}+(n+1)\\ (n\\geq2)\\)，求 \\(${aTerm(4)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(4)}=${value}\\)。過程：\\(${aTerm(2)}=2\\cdot${a1}+3=${terms[1]}\\)，\\(${aTerm(3)}=2\\cdot${terms[1]}+4=${terms[2]}\\)，\\(${aTerm(4)}=2\\cdot${terms[2]}+5=${terms[3]}\\)。`
        );
        continue;
      }

      if (type === 4) {
        const c = [6, 8, 10][randInt(0, 2)];
        let a1 = randInt(1, c - 1);
        while (2 * a1 === c) a1 = randInt(1, c - 1);
        const a2 = -a1 + c;
        questions.push(
          `線性遞迴轉換：設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=-a_{n-1}+${c}\\ (n\\geq2)\\)，觀察此數列是否具有循環性。`
        );
        answers.push(
          `簡答：有，週期為 2。過程：\\(${aTerm(2)}=-${a1}+${c}=${a2}\\)，\\(${aTerm(3)}=-${a2}+${c}=${a1}\\)，之後會在 ${a1} 與 ${a2} 之間交替出現。`
        );
        continue;
      }

      if (type === 5) {
        const a1 = randInt(2, 5);
        const n = [10, 50, 100, 2026][randInt(0, 3)];
        const value = makeFraction(a1, a1 * n - a1 + 1);
        questions.push(
          `分式遞迴的規律觀察：設 \\(${aTerm(1)}=${a1}\\)，\\(a_{n+1}=\\frac{a_n}{a_n+1}\\)，求 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${fracText(value)}\\)。過程：令 \\(b_n=\\frac1{a_n}\\)，則 \\(b_{n+1}=\\frac{a_n+1}{a_n}=b_n+1\\)。因為 \\(b_1=\\frac1{${a1}}\\)，所以 \\(b_n=n-1+\\frac1{${a1}}\\)，故 \\(a_n=\\frac{${a1}}{${a1}n-${a1 - 1}}\\)。代入 \\(n=${n}\\) 得答案。`
        );
        continue;
      }

      if (type === 6) {
        const n = [20, 50, 100, 2026][randInt(0, 3)];
        const cycle = [2, -1, makeFraction(1, 2)];
        const value = cycle[(n - 1) % 3];
        const text = typeof value === 'number' ? `${value}` : fracText(value);
        questions.push(
          `分式遞迴的週期性：設 \\(${aTerm(1)}=2\\)，\\(a_n=\\frac{1}{1-a_{n-1}}\\ (n\\geq2)\\)，求 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${text}\\)。過程：逐項計算得 \\(${aTerm(1)}=2\\)、\\(${aTerm(2)}=-1\\)、\\(${aTerm(3)}=\\frac12\\)、\\(${aTerm(4)}=2\\)，所以週期為 3。依 ${n} 在週期中的位置可得 \\(${aTerm(n)}=${text}\\)。`
        );
        continue;
      }

      const templates = [
        {
          start: makeFraction(1, 1),
          coeffs: { a: -1, b: 4, c: -1, d: 3 },
          text: '\\frac{4-a_{n-1}}{3-a_{n-1}}',
          target: 4,
          conjecture: 'a_n=\\frac{2n-1}{n}',
        },
        {
          start: makeFraction(0, 1),
          coeffs: { a: 1, b: 1, c: -4, d: 5 },
          text: '\\frac{1+a_{n-1}}{5-4a_{n-1}}',
          target: 4,
          conjecture: 'a_n=\\frac{n-1}{2n+1}',
        },
      ];
      const pick = templates[randInt(0, templates.length - 1)];
      const terms = transformFraction(pick.start, pick.target, pick.coeffs);
      questions.push(
        `分式遞迴求值與推測：設 \\(${aTerm(1)}=${fracText(pick.start)}\\)，\\(a_n=${pick.text}\\)，求前 ${pick.target} 項並推測一般項。`
      );
      answers.push(
        `簡答：\\(${terms.map((v, idx) => `${aTerm(idx + 1)}=${fracText(v)}`).join(', ')}\\)，推測 \\(${pick.conjecture}\\)。過程：依遞迴式逐項代入可得前 ${pick.target} 項；觀察分子與分母隨 \\(n\\) 的線性變化，即可得到上述一般項。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS211CumulativeProductRecurrenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const aTerm = (index) => latexSub('a', index);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const a1 = randInt(1, 4);
        const n = randInt(8, 14);
        const value = a1 + (n - 1) * (2 * n + 3);
        questions.push(
          `累加型與累乘型遞迴：設 \\(${aTerm(1)}=${a1}\\)，\\(a_{n+1}-a_n=4n+3\\ (n\\geq1)\\)，求一般項 \\(a_n\\)。`
        );
        answers.push(
          `簡答：\\(a_n=${a1}+(n-1)(2n+3)\\)。過程：把差分累加，\\(a_n=a_1+\\sum_{k=1}^{n-1}(4k+3)\\)。計算得 \\(\\sum_{k=1}^{n-1}(4k+3)=(n-1)(2n+3)\\)，所以一般項如上；例如 \\(${aTerm(n)}=${value}\\)。`
        );
        continue;
      }

      if (type === 1) {
        const n = randInt(12, 24);
        const value = n * n;
        questions.push(
          `累加型與累乘型遞迴：設 \\(${aTerm(1)}=1\\)，\\(a_n=a_{n-1}+(2n-1)\\ (n\\geq2)\\)，求 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${value}\\)。過程：\\(a_n=1+3+5+\\cdots+(2n-1)=n^2\\)，所以 \\(${aTerm(n)}=${n}^2=${value}\\)。`
        );
        continue;
      }

      if (type === 2) {
        const n = [12, 20, 30, 50][randInt(0, 3)];
        const a1 = [2, 4, 6][randInt(0, 2)];
        const value = simplifyFraction(a1 * (n + 1), 2);
        questions.push(
          `累加型與累乘型遞迴：設 \\(${aTerm(1)}=${a1}\\)，\\(a_n=\\frac{n+1}{n}a_{n-1}\\ (n\\geq2)\\)，利用累乘法求 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${formatFraction(value.num, value.den)}\\)。過程：\\(a_n=${a1}\\cdot\\frac32\\cdot\\frac43\\cdot\\frac54\\cdots\\frac{n+1}{n}\\)，中間項相消後為 \\(${a1}\\cdot\\frac{n+1}{2}\\)。代入 \\(n=${n}\\)，得 \\(${aTerm(n)}=${formatFraction(value.num, value.den)}\\)。`
        );
        continue;
      }

      if (type === 3) {
        const n = randInt(6, 10);
        const value = powInt(2, n) - 1;
        questions.push(
          `累加型與累乘型遞迴：設 \\(${aTerm(1)}=1\\)，\\(a_n=a_{n-1}+2^{n-1}\\ (n\\geq2)\\)，求一般項並計算 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(a_n=2^n-1\\)，\\(${aTerm(n)}=${value}\\)。過程：\\(a_n=1+2+2^2+\\cdots+2^{n-1}\\)，這是等比級數和，所以 \\(a_n=2^n-1\\)。`
        );
        continue;
      }

      const n = randInt(8, 16);
      const value = makeFraction(1, n + 2);
      questions.push(
        `累加型與累乘型遞迴：設 \\(${aTerm(1)}=\\frac13\\)，\\(a_{n+1}=\\frac{n+2}{n+3}a_n\\)，求通式 \\(a_n\\)。`
      );
      answers.push(
        `簡答：\\(a_n=\\frac{1}{n+2}\\)。過程：累乘得 \\(a_n=\\frac13\\cdot\\frac34\\cdot\\frac45\\cdot\\frac56\\cdots\\frac{n+1}{n+2}\\)，中間項相消後得到 \\(a_n=\\frac1{n+2}\\)；例如 \\(${aTerm(n)}=${formatFraction(value.num, value.den)}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS211CombinatorialRecurrenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const aTerm = (index) => latexSub('a', index);
    const fib = [0, 1];
    for (let i = 2; i <= 40; i += 1) fib[i] = fib[i - 1] + fib[i - 2];

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const n = randInt(8, 14);
        const value = fib[n + 1];
        questions.push(`計數類遞迴：每次可爬 1 階或 2 階，爬到第 ${n} 階共有幾種方法？`);
        answers.push(
          `簡答：${value} 種。過程：設 \\(a_n\\) 為爬 \\(n\\) 階的方法數，最後一步可能從 \\(n-1\\) 階走 1 階，或從 \\(n-2\\) 階走 2 階，所以 \\(a_n=a_{n-1}+a_{n-2}\\)，且 \\(a_1=1,a_2=2\\)。因此 \\(${aTerm(n)}=${value}\\)。`
        );
        continue;
      }

      if (type === 1) {
        const n = randInt(6, 12);
        const value = fib[n + 1];
        questions.push(`計數類遞迴：用 \\(1\\times2\\) 的骨牌鋪滿 \\(2\\times${n}\\) 的長方形區域，共有幾種鋪法？`);
        answers.push(
          `簡答：${value} 種。過程：看最左邊：若放一塊直骨牌，剩 \\(2\\times(${n}-1)\\)；若放兩塊橫骨牌，剩 \\(2\\times(${n}-2)\\)。所以 \\(a_n=a_{n-1}+a_{n-2}\\)，\\(a_1=1,a_2=2\\)，得 \\(${aTerm(n)}=${value}\\)。`
        );
        continue;
      }

      if (type === 2) {
        const n = randInt(6, 12);
        const value = fib[n + 2];
        questions.push(`計數類遞迴：一排 ${n} 個格子塗紅、白兩色，規定白格不可相鄰，求共有幾種塗法。`);
        answers.push(
          `簡答：${value} 種。過程：若最後一格塗紅，前面有 \\(a_{n-1}\\) 種；若最後一格塗白，倒數第二格必為紅，前面有 \\(a_{n-2}\\) 種。因此 \\(a_n=a_{n-1}+a_{n-2}\\)，且 \\(a_1=2,a_2=3\\)，所以 \\(${aTerm(n)}=${value}\\)。`
        );
        continue;
      }

      if (type === 3) {
        const n = randInt(8, 14);
        const value = n % 2 === 0 ? -1 : 1;
        questions.push(
          `計數類遞迴：已知 \\(F_n\\) 為費氏數列，\\(F_1=F_2=1\\)。求 \\(F_{${n}}^2-F_{${n - 1}}F_{${n + 1}}\\) 的值。`
        );
        answers.push(
          `簡答：${value}。過程：卡西尼恆等式為 \\(F_n^2-F_{n-1}F_{n+1}=(-1)^{n-1}\\)。代入 \\(n=${n}\\)，得到 ${value}。`
        );
        continue;
      }

      const n = randInt(7, 13);
      const value = fib[n];
      questions.push(
        `計數類遞迴：一開始有 1 對新生兔子，每對兔子滿一個月後每月生 1 對，且兔子不死亡。若總對數形成費氏數列，求第 ${n} 個月共有幾對兔子。`
      );
      answers.push(
        `簡答：${value} 對。過程：第 \\(n\\) 個月的兔子來自上個月原有兔子，加上已成熟並生育的兔子，所以 \\(F_n=F_{n-1}+F_{n-2}\\)，\\(F_1=F_2=1\\)。因此 \\(F_{${n}}=${value}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS211GeometricCoordinateSequenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const aTerm = (index) => latexSub('a', index);
    const pointText = (x, y) => `(${formatFraction(x.num, x.den)},${formatFraction(y.num, y.den)})`;

    for (let i = 0; i < count; i += 1) {
      const type = i % 8;

      if (type === 0) {
        const n = randInt(5, 10);
        const value = powInt(2, n) - 1;
        questions.push(
          `幾何分割與座標數列：河內塔有 ${n} 個盤子，每次只能移動一個盤子，且大盤不可放在小盤上，求最少移動次數。`
        );
        answers.push(
          `簡答：${value} 次。過程：設最少次數為 \\(a_n\\)。先移上面 \\(n-1\\) 個盤需 \\(a_{n-1}\\) 次，再移最大盤 1 次，再移回 \\(n-1\\) 個盤，故 \\(a_n=2a_{n-1}+1\\)，\\(a_1=1\\)，所以 \\(a_n=2^n-1\\)。代入 \\(n=${n}\\) 得 ${value}。`
        );
        continue;
      }

      if (type === 1) {
        const n = randInt(6, 12);
        const value = (n * (n + 1)) / 2 + 1;
        questions.push(`幾何分割與座標數列：平面上有 ${n} 條直線，任兩條不平行且任三條不共點，最多可分割成幾個區域？`);
        answers.push(
          `簡答：${value} 個。過程：新增第 \\(n\\) 條直線時最多被前面直線切成 \\(n\\) 段，因此多出 \\(n\\) 個區域。故 \\(a_n=1+1+2+\\cdots+n=1+\\frac{n(n+1)}{2}\\)，代入得 ${value}。`
        );
        continue;
      }

      if (type === 2) {
        const n = randInt(5, 10);
        const value = n * n - n + 2;
        questions.push(
          `幾何分割與座標數列：平面上有 ${n} 個圓，任兩圓交於兩點且任三圓不共點，最多可將平面分成幾個區域？`
        );
        answers.push(
          `簡答：${value} 個。過程：第 \\(n\\) 個圓最多被前面 \\(n-1\\) 個圓切成 \\(2(n-1)\\) 段，因此新增 \\(2(n-1)\\) 個區域。由 \\(a_1=2\\)，得 \\(a_n=2+2(1+2+\\cdots+n-1)=n^2-n+2\\)。`
        );
        continue;
      }

      if (type === 3) {
        const n = randInt(6, 12);
        let x = makeFraction(1, 1);
        let y = makeFraction(0, 1);
        const dirs = [
          [0, 1],
          [1, 0],
          [0, -1],
          [-1, 0],
        ];
        for (let step = 2; step <= n; step += 1) {
          const len = makeFraction(1, step);
          const dir = dirs[(step - 2) % 4];
          x = addFraction(x, makeFraction(dir[0] * len.num, len.den));
          y = addFraction(y, makeFraction(dir[1] * len.num, len.den));
        }
        questions.push(
          `幾何分割與座標數列：一點 \\(P\\) 在座標平面上，\\(P_1=(1,0)\\)，之後依「上、右、下、左」循環移動，從 \\(P_{k-1}\\) 到 \\(P_k\\) 的距離為 \\(\\frac1k\\)。求 \\(P_{${n}}\\) 的座標。`
        );
        answers.push(
          `簡答：\\(P_{${n}}=${pointText(x, y)}\\)。過程：從 \\(P_1=(1,0)\\) 開始，依序把第 2 次到第 ${n} 次的位移向量相加；水平方向與鉛直方向分開累加，可得座標為 \\(${pointText(x, y)}\\)。`
        );
        continue;
      }

      if (type === 4) {
        const side = [3, 6, 9, 12][randInt(0, 3)];
        const n = randInt(2, 5);
        const value = makeFraction(3 * side * powInt(4, n), powInt(3, n));
        questions.push(
          `幾何分割與座標數列：正三角形邊長為 ${side}，依雪花曲線規則每一步把每段線段替換成原來的 \\(\\frac43\\) 倍長，求第 ${n} 步後的周長。`
        );
        answers.push(
          `簡答：\\(${fracTextForDisplay(value)}\\)。過程：初始周長為 \\(3\\cdot${side}\\)，每一步周長乘以 \\(\\frac43\\)，所以第 ${n} 步周長為 \\(3\\cdot${side}\\left(\\frac43\\right)^{${n}}=${fracTextForDisplay(value)}\\)。`
        );
        continue;
      }

      if (type === 5) {
        const n = randInt(7, 14);
        const diagonals = (n * (n - 3)) / 2;
        const increase = n - 1;
        questions.push(
          `幾何分割與座標數列：凸 \\(n\\) 邊形的對角線共有 \\(a_n\\) 條。若 \\(n=${n}\\)，求對角線數 \\(a_n\\)，並說明從 \\(n\\) 邊形增加一個頂點變成 \\(n+1\\) 邊形時，對角線會增加幾條。`
        );
        answers.push(
          `簡答：\\(a_n=${diagonals}\\)，增加 ${increase} 條。過程：每個頂點可連到 \\(n-3\\) 個非相鄰頂點，總共算了兩次，所以 \\(a_n=\\frac{n(n-3)}2\\)。代入 \\(n=${n}\\) 得 ${diagonals}；增加一點後，新增對角線數為 \\(a_{n+1}-a_n=n-1=${increase}\\)。`
        );
        continue;
      }

      if (type === 6) {
        const n = randInt(6, 12);
        const fib = [1, 2];
        for (let j = 2; j <= n; j += 1) fib[j] = fib[j - 1] + fib[j - 2];
        const value = fib[n];
        questions.push(
          `幾何分割與座標數列：一列 ${n} 個正方形用黑、白兩色塗滿，規定黑格不可連續相鄰，求共有幾種塗法。`
        );
        answers.push(
          `簡答：${value} 種。過程：設 \\(a_n\\) 為 \\(n\\) 格的塗法數。最後一格若為白，前面有 \\(a_{n-1}\\) 種；若為黑，倒數第二格必為白，前面有 \\(a_{n-2}\\) 種。因此 \\(a_n=a_{n-1}+a_{n-2}\\)，且 \\(a_1=2,a_2=3\\)，代入得 \\(${aTerm(n)}=${value}\\)。`
        );
        continue;
      }

      const sides = randInt(5, 10);
      const eachSide = randInt(4, 12);
      const total = sides * (eachSide - 1);
      questions.push(
        `幾何分割與座標數列：用鋼珠排成正 ${sides} 邊形，每邊有 ${eachSide} 顆鋼珠且頂點鋼珠不重複計算，求總共需要幾顆鋼珠。`
      );
      answers.push(
        `簡答：${total} 顆。過程：若每邊 ${eachSide} 顆，直接乘會把每個頂點算兩次。可改想成每邊提供 ${eachSide - 1} 顆新的鋼珠，所以總數為 \\(${sides}(${eachSide}-1)=${total}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function formatIntegerRatio(a, b) {
    const divisor = gcdInt(Math.abs(a), Math.abs(b)) || 1;
    return `${a / divisor}:${b / divisor}`;
  }

  function apSum(a1, d, n) {
    return (n * (2 * a1 + (n - 1) * d)) / 2;
  }

  function formatSeriesWithSigns(terms, lastTerm = null) {
    const pieces = terms.map((term, index) => {
      if (index === 0) return `${term}`;
      return term >= 0 ? `+${term}` : `${term}`;
    });
    if (lastTerm === null) return pieces.join('');
    const lastText = lastTerm >= 0 ? `+${lastTerm}` : `${lastTerm}`;
    return `${pieces.join('')}+\\cdots${lastText}`;
  }

  function buildS212SevenSubtypeMixedSet(count, fixedMode = null) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const aTerm = (index) => latexSub('a', index);
    const sTerm = (index) => latexSub('S', index);

    for (let i = 0; i < count; i += 1) {
      const mode = Number.isInteger(fixedMode) ? fixedMode : i % 7;

      if (mode === 0) {
        const type = i % 5;
        if (type === 0) {
          const a1 = randInt(10, 70);
          const d = -randInt(2, 6);
          const n = randInt(8, 18);
          const sum = apSum(a1, d, n);
          questions.push(
            `基礎公式求和。已知等差數列 \\(${aTerm(1)}=${a1}\\)，公差 \\(d=${d}\\)，求前 ${n} 項和 \\(${sTerm(n)}\\)。`
          );
          answers.push(
            `簡答：\\(${sTerm(n)}=${sum}\\)。過程：\\(S_n=\\frac{n}{2}[2a_1+(n-1)d]\\)，所以 \\(${sTerm(n)}=\\frac{${n}}{2}[2\\cdot${a1}+${n - 1}\\cdot(${d})]=${sum}\\)。`
          );
          continue;
        }
        if (type === 1) {
          const a1 = -randInt(1, 9);
          const d = randInt(3, 8);
          const n = randInt(10, 18);
          const last = a1 + (n - 1) * d;
          const sum = apSum(a1, d, n);
          questions.push(
            `基礎公式求和。求等差級數 \\(${formatSeriesWithSigns([a1, a1 + d, a1 + 2 * d], last)}\\) 的總和。`
          );
          answers.push(
            `簡答：${sum}。過程：首項為 ${a1}，末項為 ${last}，共有 \\(n=\\frac{${last}-(${a1})}{${d}}+1=${n}\\) 項。故總和 \\(S_n=\\frac{${n}(${a1}+${last})}{2}=${sum}\\)。`
          );
          continue;
        }
        if (type === 2) {
          const a1 = randInt(3, 12);
          const d = randInt(4, 9);
          const n = randInt(10, 20);
          const an = a1 + (n - 1) * d;
          const sum = apSum(a1, d, n);
          questions.push(`基礎公式求和。已知等差數列首項為 ${a1}，末項為 ${an}，總和為 ${sum}，求項數 \\(n\\)。`);
          answers.push(
            `簡答：\\(n=${n}\\)。過程：等差級數和 \\(S_n=\\frac{n(a_1+a_n)}{2}\\)，所以 \\(${sum}=\\frac{n(${a1}+${an})}{2}\\)，解得 \\(n=${n}\\)。`
          );
          continue;
        }
        if (type === 3) {
          const a1 = randInt(4, 12);
          const d = randInt(5, 9);
          const n = randInt(10, 16);
          const an = a1 + (n - 1) * d;
          const sum = apSum(a1, d, n);
          questions.push(
            `基礎公式求和。求等差級數 \\(${formatSeriesWithSigns([a1, a1 + d, a1 + 2 * d], an)}\\) 的總和。`
          );
          answers.push(
            `簡答：${sum}。過程：首項 ${a1}、公差 ${d}、末項 ${an}，故項數 \\(n=\\frac{${an}-${a1}}{${d}}+1=${n}\\)。總和為 \\(\\frac{${n}(${a1}+${an})}{2}=${sum}\\)。`
          );
          continue;
        }
        const n = randInt(8, 24);
        const a1 = randInt(2, 10);
        const d = randInt(1, 5);
        const firstTwoSum = 2 * a1 + d;
        const lastTwoSum = 2 * (a1 + (n - 1) * d) - d;
        const sum = apSum(a1, d, n);
        questions.push(
          `基礎公式求和。設一等差數列前兩項和為 ${firstTwoSum}，最後兩項和為 ${lastTwoSum}，總和為 ${sum}，求項數。`
        );
        answers.push(
          `簡答：${n} 項。過程：等差數列中，\\((a_1+a_2)+(a_{n-1}+a_n)=2(a_1+a_n)\\)，所以 \\(a_1+a_n=\\frac{${firstTwoSum}+${lastTwoSum}}{2}\\)。又 \\(S_n=\\frac{n(a_1+a_n)}{2}\\)，代入得 \\(${sum}=\\frac{n\\cdot${(firstTwoSum + lastTwoSum) / 2}}{2}\\)，故 \\(n=${n}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        const multiple = [4, 5, 6, 7, 8, 9, 11, 13][randInt(0, 7)];
        const startPool = [1, 50, 100, 200, 500];
        let start = startPool[randInt(0, startPool.length - 1)];
        let end = start + randInt(60, 180);
        if (i % 5 === 4) {
          start = 10;
          end = 99;
        }
        const first = Math.ceil(start / multiple) * multiple;
        const last = Math.floor(end / multiple) * multiple;
        const n = Math.floor((last - first) / multiple) + 1;
        const sum = n > 0 ? (n * (first + last)) / 2 : 0;
        questions.push(`範圍內倍數之和。求 ${start} 到 ${end} 的整數中，所有 ${multiple} 的倍數之總和。`);
        answers.push(
          `簡答：${sum}。過程：範圍內第一個 ${multiple} 的倍數是 ${first}，最後一個是 ${last}，形成公差 ${multiple} 的等差數列。項數 \\(n=\\frac{${last}-${first}}{${multiple}}+1=${n}\\)，所以總和為 \\(\\frac{${n}(${first}+${last})}{2}=${sum}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        const a1 = randInt(20, 120);
        const d = -randInt(2, 12);
        if (a1 % -d === 0) {
          i -= 1;
          continue;
        }
        const positiveCount = Math.floor((a1 - 1) / -d) + 1;
        const maxSum = apSum(a1, d, positiveCount);
        const lastPositive = a1 + (positiveCount - 1) * d;
        const next = a1 + positiveCount * d;
        questions.push(
          `級數和的最大值。已知等差數列 \\(${aTerm(1)}=${a1}\\)，公差 \\(d=${d}\\)，求前 \\(n\\) 項和 \\(S_n\\) 的最大值與此時的 \\(n\\)。`
        );
        answers.push(
          `簡答：當 \\(n=${positiveCount}\\) 時，最大值為 ${maxSum}。過程：公差為負，前項先增加總和，直到項變成負數後總和會下降。由 \\(a_n=${a1}+(n-1)(${d})>0\\) 得最後一個正項是 \\(a_{${positiveCount}}=${lastPositive}\\)，下一項 \\(a_{${positiveCount + 1}}=${next}\\le0\\)。所以最大和為 \\(S_{${positiveCount}}=\\frac{${positiveCount}(${a1}+${lastPositive})}{2}=${maxSum}\\)。`
        );
        continue;
      }

      if (mode === 3) {
        const type = i % 5;
        if (type < 3) {
          const p = randInt(1, 6);
          const q = pickNonZero(-8, 8);
          const coef = 2 * p;
          const constant = q - p;
          const n = randInt(6, 15);
          const value = coef * n + constant;
          questions.push(
            `已知 \\(S_n\\) 公式求一般項。設數列前 \\(n\\) 項和 \\(S_n=${formatSnQuadratic(p, q)}\\)，求一般項 \\(a_n\\)；並求 \\(${aTerm(n)}\\)。`
          );
          answers.push(
            `簡答：\\(a_n=${formatLinearN(coef, constant)}\\)，\\(${aTerm(n)}=${value}\\)。過程：\\(a_n=S_n-S_{n-1}\\)。相減得 \\(a_n=${formatLinearN(coef, constant)}\\)，代入 \\(n=${n}\\) 得 \\(${aTerm(n)}=${value}\\)。`
          );
          continue;
        }
        const p = randInt(2, 6);
        const q = -randInt(1, 8);
        const a1 = p + q;
        const coef = 2 * p;
        const constant = q - p;
        questions.push(
          `已知 \\(S_n\\) 公式求一般項。若 \\(S_n=${formatSnQuadratic(p, q)}\\)，求 \\(a_1\\) 與一般項 \\(a_n\\)。`
        );
        answers.push(
          `簡答：\\(a_1=${a1}\\)，\\(a_n=${formatLinearN(coef, constant)}\\)。過程：\\(a_1=S_1=${p}${formatSignedAdd(q)}=${a1}\\)。當 \\(n\\ge2\\) 時，\\(a_n=S_n-S_{n-1}=${formatLinearN(coef, constant)}\\)，代入 \\(n=1\\) 也得到 ${a1}，所以此式可作為一般項。`
        );
        continue;
      }

      if (mode === 4) {
        const alpha = randInt(2, 8);
        const beta = randInt(2, 8);
        const c1 = randInt(1, 5);
        const c2 = randInt(1, 5);
        const k = randInt(5, 20);
        const firstTerm = alpha * (2 * k - 1) + c1;
        const secondTerm = beta * (2 * k - 1) + c2;
        const ratio = formatIntegerRatio(firstTerm, secondTerm);
        questions.push(
          `兩等差數列的和與項之比。設兩數列前 \\(n\\) 項和分別為 \\(S_n=\\frac{n}{2}(${alpha}n+${c1})\\)、\\(T_n=\\frac{n}{2}(${beta}n+${c2})\\)，求兩數列第 ${k} 項之比。`
        );
        answers.pushWithSummary(
          `\\(${ratio}\\)`,
          `過程：由 \\(a_k=S_k-S_{k-1}=\\frac{${alpha}(2k-1)+${c1}}{2}\\)，\\(b_k=T_k-T_{k-1}=\\frac{${beta}(2k-1)+${c2}}{2}\\)。所以第 ${k} 項之比為 \\([${alpha}(2\\cdot${k}-1)+${c1}]:[${beta}(2\\cdot${k}-1)+${c2}]=${firstTerm}:${secondTerm}=${ratio}\\)。`
        );
        continue;
      }

      if (mode === 5) {
        const type = i % 5;
        if (type === 0) {
          const front = randInt(8, 20);
          const diff = randInt(1, 4);
          const rows = randInt(12, 30);
          const total = apSum(front, diff, rows);
          questions.push(
            `生活情境應用。電影院共有 ${rows} 排座位，最前排有 ${front} 個座位，後排比前排多 ${diff} 個座位，求全區總座位數。`
          );
          answers.push(
            `簡答：${total} 個。過程：每排座位數形成等差數列，首項 ${front}、公差 ${diff}、共 ${rows} 項。總和 \\(S_{${rows}}=\\frac{${rows}}{2}[2\\cdot${front}+${rows - 1}\\cdot${diff}]=${total}\\)。`
          );
          continue;
        }
        if (type === 1) {
          const layers = randInt(6, 14);
          const total = (layers * (layers + 1) * (layers + 2)) / 6;
          const bottomCups = (layers * (layers + 1)) / 2;
          questions.push(
            `生活情境應用。高腳杯堆成 ${layers} 層，底層每邊 ${layers} 杯排成正三角形，每往上一層每邊少一杯，求總杯數。`
          );
          answers.push(
            `簡答：${total} 杯。過程：底層有 \\(1+2+\\cdots+${layers}=${bottomCups}\\) 杯，往上依序為三角數 \\(T_{${layers}},T_{${layers - 1}},\\ldots,T_1\\)。總數為 \\(T_1+T_2+\\cdots+T_{${layers}}=\\frac{${layers}(${layers}+1)(${layers}+2)}{6}=${total}\\)。`
          );
          continue;
        }
        if (type === 2) {
          const seedSides = randInt(5, 12);
          const d = randInt(1, 4) * 5;
          const minAngle = (((seedSides - 2) * 180 * 2) / seedSides - (seedSides - 1) * d) / 2;
          if (!Number.isInteger(minAngle) || minAngle <= 0) {
            i -= 1;
            continue;
          }
          // 找所有 n>=3 且最大內角<180（真正凸多邊形）的整數解，需唯一
          const validNs = [];
          for (let n = 3; n <= 60; n += 1) {
            const apSumN = (n / 2) * (2 * minAngle + (n - 1) * d);
            if (apSumN === (n - 2) * 180 && minAngle + (n - 1) * d < 180) validNs.push(n);
          }
          if (validNs.length !== 1) {
            i -= 1;
            continue;
          }
          const sides = validNs[0];
          questions.push(`生活情境應用。一凸多邊形內角成等差數列，最小角為 ${minAngle}°，公差為 ${d}°，求邊數。`);
          answers.push(
            `簡答：${sides} 邊。過程：設邊數為 \\(n\\)，內角和為 \\((n-2)180°\\)。等差和為 \\(\\frac{n}{2}[2\\cdot${minAngle}+(n-1)${d}]=(n-2)180°\\)。解得 \\(n=${sides}\\)，此時最大內角 \\(${minAngle}+(${sides}-1)\\cdot${d}=${minAngle + (sides - 1) * d}°<180°\\)，符合凸多邊形。`
          );
          continue;
        }
        if (type === 3) {
          const n = randInt(12, 30);
          const first = randInt(8, 20);
          const d = randInt(1, 5);
          const total = apSum(first, d, n);
          questions.push(
            `生活情境應用。某人分 ${n} 期還款，各期款額成等差數列，第一期 ${first} 萬元，每期增加 ${d} 萬元，求總還款額。`
          );
          answers.push(
            `簡答：${total} 萬元。過程：還款額形成等差級數，首項 ${first}、公差 ${d}、共 ${n} 項。總和為 \\(\\frac{${n}}{2}[2\\cdot${first}+${n - 1}\\cdot${d}]=${total}\\)。`
          );
          continue;
        }
        const rows = randInt(10, 25);
        const first = randInt(6, 15);
        const diff = randInt(2, 5);
        const total = apSum(first, diff, rows);
        questions.push(
          `生活情境應用。某球場共有 ${rows} 排座位，第一排 ${first} 個座位，每排比前一排多 ${diff} 個，求總座位數。`
        );
        answers.push(
          `簡答：${total} 個。過程：座位數為等差級數，\\(a_1=${first}\\)、\\(d=${diff}\\)、\\(n=${rows}\\)。所以總和 \\(S_n=\\frac{${rows}}{2}[2\\cdot${first}+(${rows}-1)${diff}]=${total}\\)。`
        );
        continue;
      }

      const type = i % 5;
      if (type === 0) {
        const p = randInt(1, 5);
        const q = randInt(1, 8);
        questions.push(`給定前 \\(n\\) 項和公式求一般項。設 \\(S_n=${formatSnQuadratic(p, q)}\\)，求 \\(a_n\\)。`);
        answers.push(
          `簡答：\\(a_n=${formatLinearN(2 * p, q - p)}\\)。過程：\\(a_n=S_n-S_{n-1}\\)，將 \\(S_n\\) 與 \\(S_{n-1}\\) 相減，得 \\(a_n=${formatLinearN(2 * p, q - p)}\\)。`
        );
        continue;
      }
      if (type === 1) {
        const c = [2, 3, 4][randInt(0, 2)];
        const e = [1, 2, 3, 5][randInt(0, 3)];
        const n = randInt(5, 20);
        // S_n = n/(cn+e) => a_n = e / [(cn+e)(c(n-1)+e)]
        const value = makeFraction(e, (c * n + e) * (c * (n - 1) + e));
        questions.push(
          `給定前 \\(n\\) 項和公式求一般項。設 \\(S_n=\\frac{n}{${c}n+${e}}\\)，求 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${formatFraction(value.num, value.den)}\\)。過程：\\(a_n=S_n-S_{n-1}=\\frac{n}{${c}n+${e}}-\\frac{n-1}{${c}n${formatSignedAdd(e - c)}}=\\frac{${e}}{(${c}n+${e})(${c}n${formatSignedAdd(e - c)})}\\)。代入 \\(n=${n}\\)，得 \\(${aTerm(n)}=${formatFraction(value.num, value.den)}\\)。`
        );
        continue;
      }
      if (type === 2) {
        const r = [2, 3][randInt(0, 1)];
        const n = randInt(6, 16);
        const value = (r - 1) * powInt(r, n - 1);
        const coefText = r - 1 === 1 ? '' : `${r - 1}\\cdot`;
        questions.push(
          `給定前 \\(n\\) 項和公式求一般項。設 \\(S_n=${r}^n-1\\)，求 \\(${aTerm(n)}\\)，並判斷是否為等比數列。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${value}\\)，此數列為等比數列。過程：\\(a_n=S_n-S_{n-1}=(${r}^n-1)-(${r}^{n-1}-1)=${coefText}${r}^{n-1}\\)。相鄰兩項比值為 ${r}，所以是等比數列。`
        );
        continue;
      }
      if (type === 3) {
        const n = randInt(4, 14);
        const value = n * (n + 1);
        questions.push(`給定前 \\(n\\) 項和公式求一般項。設 \\(S_n=\\frac13n(n+1)(n+2)\\)，求 \\(${aTerm(n)}\\)。`);
        answers.push(
          `簡答：\\(${aTerm(n)}=${value}\\)。過程：\\(a_n=S_n-S_{n-1}=\\frac13n(n+1)(n+2)-\\frac13(n-1)n(n+1)=n(n+1)\\)。代入 \\(n=${n}\\)，得 ${value}。`
        );
        continue;
      }
      const p = randInt(2, 6);
      const q = -randInt(1, 6);
      const d = 2 * p;
      questions.push(
        `給定前 \\(n\\) 項和公式求一般項。設 \\(S_n=${formatSnQuadratic(p, q)}\\)，求 \\(a_{10}\\) 與公差 \\(d\\)，並判斷是否為等差數列。`
      );
      answers.push(
        `簡答：\\(a_{10}=${20 * p + q - p}\\)，\\(d=${d}\\)，是等差數列。過程：\\(a_n=S_n-S_{n-1}=${formatLinearN(2 * p, q - p)}\\)，這是 \\(n\\) 的一次式，因此為等差數列，公差為 ${d}。代入 \\(n=10\\)，得 \\(a_{10}=${20 * p + q - p}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS212BasicSumFormulaSet(count) {
    return buildS212SevenSubtypeMixedSet(count, 0);
  }

  function buildS212RangeMultipleSumSet(count) {
    return buildS212SevenSubtypeMixedSet(count, 1);
  }

  function buildS212MaxSumSet(count) {
    return buildS212SevenSubtypeMixedSet(count, 2);
  }

  function buildS212SnToAnSet(count) {
    return buildS212SevenSubtypeMixedSet(count, 3);
  }

  function buildS212TwoApRatioSet(count) {
    return buildS212SevenSubtypeMixedSet(count, 4);
  }

  function buildS212ApplicationSet(count) {
    return buildS212SevenSubtypeMixedSet(count, 5);
  }

  function buildS212GivenSnGeneralTermSet(count) {
    return buildS212SevenSubtypeMixedSet(count, 6);
  }

  function fractionText(frac) {
    return formatFraction(frac.num, frac.den);
  }

  function geometricSumFraction(a1, r, n) {
    let sum = makeFraction(0, 1);
    let term = makeFraction(a1.num, a1.den);
    for (let i = 0; i < n; i += 1) {
      sum = addFraction(sum, term);
      term = mulFraction(term, r);
    }
    return sum;
  }

  function geometricTermFraction(a1, r, n) {
    let term = makeFraction(a1.num, a1.den);
    for (let i = 1; i < n; i += 1) term = mulFraction(term, r);
    return term;
  }

  function formatGeometricSeriesTerms(a1, r, n, visibleCount = 4) {
    const terms = [];
    let term = makeFraction(a1.num, a1.den);
    const shown = Math.min(visibleCount, n);
    for (let i = 0; i < shown; i += 1) {
      terms.push(fractionText(term));
      term = mulFraction(term, r);
    }
    const last = geometricTermFraction(a1, r, n);
    const prefix = terms.map((text, index) => (index === 0 || text.startsWith('-') ? text : `+${text}`)).join('');
    const lastText = fractionText(last);
    if (n > visibleCount) return `${prefix}+\\cdots${lastText.startsWith('-') ? lastText : `+${lastText}`}`;
    return prefix;
  }

  function buildS212GeometricSeriesFiveSubtypeMixedSet(count, fixedMode = null) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const aTerm = (index) => latexSub('a', index);
    const sTerm = (index) => latexSub('S', index);

    for (let i = 0; i < count; i += 1) {
      const mode = Number.isInteger(fixedMode) ? fixedMode : i % 5;

      if (mode === 0) {
        const type = i % 5;
        if (type === 0) {
          const a1 = makeFraction(randInt(2, 8), 1);
          const r = makeFraction([-2, 2, 3][randInt(0, 2)], 1);
          const n = randInt(5, 9);
          const sum = geometricSumFraction(a1, r, n);
          questions.push(
            `基礎參數求和。已知等比數列 \\(${aTerm(1)}=${fractionText(a1)}\\)，公比 \\(r=${fractionText(r)}\\)，求前 ${n} 項和 \\(${sTerm(n)}\\)。`
          );
          answers.push(
            `簡答：\\(${sTerm(n)}=${fractionText(sum)}\\)。過程：等比級數和 \\(S_n=a_1\\frac{1-r^n}{1-r}\\)。代入 \\(a_1=${fractionText(a1)}\\)、\\(r=${fractionText(r)}\\)、\\(n=${n}\\)，得 \\(${sTerm(n)}=${fractionText(sum)}\\)。`
          );
          continue;
        }
        if (type === 1) {
          const den = [2, 3, 4][randInt(0, 2)];
          const a1 = makeFraction(1, den);
          const r = makeFraction(2, 1);
          const n = randInt(6, 10);
          const sum = geometricSumFraction(a1, r, n);
          questions.push(
            `基礎參數求和。已知等比數列 \\(${aTerm(1)}=${fractionText(a1)}\\)，公比 \\(r=2\\)，求前 ${n} 項和。`
          );
          answers.push(
            `簡答：\\(${fractionText(sum)}\\)。過程：\\(S_n=a_1\\frac{1-r^n}{1-r}\\)，所以 \\(S_{${n}}=${fractionText(a1)}\\cdot\\frac{1-2^{${n}}}{1-2}=${fractionText(sum)}\\)。`
          );
          continue;
        }
        if (type === 2) {
          const a1 = makeFraction(randInt(2, 9), 1);
          const r = makeFraction(2, 1);
          const n = randInt(5, 10);
          const sum = geometricSumFraction(a1, r, n);
          questions.push(
            `基礎參數求和。已知等比數列首項為 \\(${fractionText(a1)}\\)，公比為 2，總和為 \\(${fractionText(sum)}\\)，求項數 \\(n\\)。`
          );
          answers.push(
            `簡答：\\(n=${n}\\)。過程：\\(S_n=${fractionText(a1)}(2^n-1)\\)。由 \\(${fractionText(sum)}=${fractionText(a1)}(2^n-1)\\)，得 \\(2^n=${powInt(2, n)}\\)，所以 \\(n=${n}\\)。`
          );
          continue;
        }
        if (type === 3) {
          const a1 = randInt(2, 8);
          const r = [2, 3][randInt(0, 1)];
          questions.push(
            `基礎參數求和。已知等比數列 \\(${aTerm(1)}=${a1}\\)，公比 \\(r=${r}\\)，求前 \\(n\\) 項和 \\(S_n\\) 的公式。`
          );
          answers.push(
            `簡答：\\(S_n=${formatFraction(a1, r - 1)}(${r}^n-1)\\)。過程：\\(S_n=a_1\\frac{r^n-1}{r-1}\\)，代入 \\(a_1=${a1}\\)、\\(r=${r}\\)，得 \\(S_n=${formatFraction(a1, r - 1)}(${r}^n-1)\\)。`
          );
          continue;
        }
        const a1 = makeFraction([64, 128, 256][randInt(0, 2)], 1);
        const r = makeFraction(1, 2);
        const n = randInt(6, 10);
        const sum = geometricSumFraction(a1, r, n);
        questions.push(
          `基礎參數求和。設等比數列 \\(${aTerm(1)}=${fractionText(a1)}\\)，\\(r=\\frac12\\)，求前 ${n} 項和。`
        );
        answers.push(
          `簡答：\\(${fractionText(sum)}\\)。過程：\\(S_n=a_1\\frac{1-r^n}{1-r}\\)，所以 \\(S_{${n}}=${fractionText(a1)}\\cdot\\frac{1-(\\frac12)^{${n}}}{1-\\frac12}=${fractionText(sum)}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        const type = i % 5;
        if (type === 0 || type === 1) {
          const a1Pool = type === 0 ? [2, 4, 6, 8, 10] : [3, 5, 7, 9, 11];
          const a1 = makeFraction(a1Pool[randInt(0, a1Pool.length - 1)], 1);
          const r = makeFraction(type === 0 ? 2 : 3, 1);
          const n = randInt(5, 8);
          const last = geometricTermFraction(a1, r, n);
          const sum = geometricSumFraction(a1, r, n);
          questions.push(`級數求和計算。求等比級數 \\(${formatGeometricSeriesTerms(a1, r, n)}\\) 的總和。`);
          answers.push(
            `簡答：\\(${fractionText(sum)}\\)。過程：首項為 ${fractionText(a1)}，公比為 ${fractionText(r)}，末項為 ${fractionText(last)}，共有 ${n} 項。套用等比級數和公式得 \\(S_{${n}}=${fractionText(sum)}\\)。`
          );
          continue;
        }
        if (type === 2 || type === 3) {
          const a1Pool = type === 2 ? [128, 256, 384, 512] : [192, 320, 448, 576];
          const a1 = makeFraction(a1Pool[randInt(0, a1Pool.length - 1)], 1);
          const r = makeFraction(1, 2);
          const n = randInt(6, 9);
          const sum = geometricSumFraction(a1, r, n);
          questions.push(`級數求和計算。求等比級數 \\(${formatGeometricSeriesTerms(a1, r, n)}\\) 的總和。`);
          answers.push(
            `簡答：\\(${fractionText(sum)}\\)。過程：此級數首項為 ${fractionText(a1)}、公比為 \\(\\frac12\\)、共 ${n} 項，所以 \\(S_{${n}}=${fractionText(a1)}\\frac{1-(\\frac12)^{${n}}}{1-\\frac12}=${fractionText(sum)}\\)。`
          );
          continue;
        }
        const a1 = makeFraction(1, 1);
        const r = makeFraction(2, 3);
        const n = randInt(5, 9);
        const sum = geometricSumFraction(a1, r, n);
        questions.push(`級數求和計算。求等比級數 \\(1+\\frac23+\\frac49+\\cdots\\) 的前 ${n} 項和。`);
        answers.push(
          `簡答：\\(${fractionText(sum)}\\)。過程：首項為 1，公比為 \\(\\frac23\\)，所以 \\(S_{${n}}=\\frac{1-(\\frac23)^{${n}}}{1-\\frac23}=${fractionText(sum)}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        const base = randInt(1, 20);
        const q = [2, 3, 4, 5][randInt(0, 3)];
        const s1 = base;
        const s2 = base * (1 + q);
        const s3 = base * (1 + q + q * q);
        const block = [3, 4, 5, 6, 8, 10][randInt(0, 5)];
        questions.push(
          `分段和性質的應用。設等比級數前 ${block} 項和為 ${s1}，前 ${2 * block} 項和為 ${s2}，求前 ${3 * block} 項和。`
        );
        answers.push(
          `簡答：\\(${s3}\\)。過程：等比級數每一段相同長度的和也成等比。設第二段與第一段的比為 \\(q\\)，由 \\(${s2}=${s1}(1+q)\\) 得 \\(q=${q}\\)。所以前三段和為 \\(${s1}(1+${q}+${q}^2)=${s3}\\)。`
        );
        continue;
      }

      if (mode === 3) {
        const type = i % 5;
        if (type < 2) {
          const c = randInt(1, 6);
          const r = [2, 3][randInt(0, 1)];
          const n = randInt(4, 8);
          const an = c * (r - 1) * powInt(r, n - 1);
          questions.push(
            `已知 \\(S_n\\) 公式求一般項。設數列前 \\(n\\) 項和 \\(S_n=${c}(${r}^n-1)\\)，求 \\(${aTerm(n)}\\) 與此數列公比。`
          );
          answers.push(
            `簡答：\\(${aTerm(n)}=${an}\\)，公比為 ${r}。過程：\\(a_n=S_n-S_{n-1}=${c}(${r}^n-1)-${c}(${r}^{n-1}-1)=${c}(${r}-1)${r}^{n-1}\\)。代入 \\(n=${n}\\) 得 \\(${aTerm(n)}=${an}\\)，且相鄰項比為 ${r}。`
          );
          continue;
        }
        if (type === 2) {
          const c = randInt(1, 10);
          const r = [2, 3, 4][randInt(0, 2)];
          const coefficient = c * (r - 1);
          questions.push(`已知 \\(S_n\\) 公式求一般項。已知 \\(S_n=${c}(${r}^n-1)\\)，求一般項 \\(a_n\\)。`);
          answers.push(
            `簡答：\\(a_n=${coefficient}\\cdot${r}^{n-1}\\)。過程：\\(a_n=S_n-S_{n-1}=${c}(${r}^n-1)-${c}(${r}^{n-1}-1)=${coefficient}\\cdot${r}^{n-1}\\)。`
          );
          continue;
        }
        if (type === 3) {
          const c = randInt(1, 10);
          const r = [2, 3, 4][randInt(0, 2)];
          const n = randInt(4, 7);
          const an = c * (r - 1) * powInt(r, n - 1);
          questions.push(`已知 \\(S_n\\) 公式求一般項。已知 \\(S_n=${c}(${r}^n-1)\\)，求 \\(a_{${n}}\\)。`);
          answers.push(
            `簡答：\\(a_{${n}}=${an}\\)。過程：\\(a_n=S_n-S_{n-1}=${c}(${r}^n-1)-${c}(${r}^{n-1}-1)=${c * (r - 1)}\\cdot${r}^{n-1}\\)。代入 \\(n=${n}\\)，得 \\(a_{${n}}=${an}\\)。`
          );
          continue;
        }
        const c = randInt(1, 4);
        questions.push(
          `已知 \\(S_n\\) 公式求一般項。若 \\(S_n=${formatFraction(c, 2)}(4^n-1)\\)，求 \\(a_1\\) 與 \\(a_{10}\\)。`
        );
        answers.push(
          `簡答：\\(a_1=${formatFraction(3 * c, 2)}\\)，\\(a_{10}=${formatFraction(3 * c * powInt(4, 9), 2)}\\)。過程：\\(a_n=S_n-S_{n-1}=${formatFraction(c, 2)}(4^n-4^{n-1})=${formatFraction(3 * c, 2)}\\cdot4^{n-1}\\)。代入 \\(n=1,10\\) 即得答案。`
        );
        continue;
      }

      const type = i % 5;
      if (type === 0) {
        const principal = [10000, 20000, 50000][randInt(0, 2)];
        const rate = [2, 3, 5][randInt(0, 2)];
        const years = randInt(4, 10);
        questions.push(
          `生活情境應用。某人年初存入 ${principal} 元，年利率 ${rate}% 且每年計息一次，求 ${years} 年年底的本利和。`
        );
        answers.push(
          `簡答：\\(${principal}(1+\\frac{${rate}}{100})^{${years}}\\) 元。過程：複利成長每年乘上 \\(1+\\frac{${rate}}{100}\\)，所以 ${years} 年後本利和為 \\(${principal}(1+\\frac{${rate}}{100})^{${years}}\\)。`
        );
        continue;
      }
      if (type === 1) {
        const height = [81, 162, 243][randInt(0, 2)];
        const ratio = makeFraction(1, 3);
        const bounce = randInt(4, 7);
        let distance = makeFraction(height, 1);
        let rebound = makeFraction(height, 3);
        for (let j = 1; j < bounce; j += 1) {
          distance = addFraction(distance, mulFraction(makeFraction(2, 1), rebound));
          rebound = mulFraction(rebound, ratio);
        }
        questions.push(
          `生活情境應用。一個球從 \\(${height}\\) 公尺落下，每次著地後跳回原高度的 \\(\\frac13\\)，求第 ${bounce} 次著地時，球所經過的總路程。`
        );
        answers.push(
          `簡答：\\(${fractionText(distance)}\\) 公尺。過程：第一次落下為 ${height} 公尺；之後每次彈起與落下成對出現，長度形成等比級數。總路程為 \\(${height}+2(${height}\\cdot\\frac13+${height}\\cdot(\\frac13)^2+\\cdots+${height}\\cdot(\\frac13)^{${bounce - 1}})=${fractionText(distance)}\\)。`
        );
        continue;
      }
      if (type === 2) {
        const initial = [50, 100, 200][randInt(0, 2)];
        const hours = randInt(5, 10);
        const total = initial * powInt(2, hours);
        questions.push(
          `生活情境應用。某種細菌每小時分裂一次，一個變兩個。若初始有 ${initial} 個，問 ${hours} 小時後共有多少個細菌？`
        );
        answers.push(
          `簡答：${total} 個。過程：每小時數量乘以 2，是等比成長。${hours} 小時後為 \\(${initial}\\cdot2^{${hours}}=${total}\\)。`
        );
        continue;
      }
      if (type === 3) {
        const payment = [10000, 20000, 30000][randInt(0, 2)];
        const years = randInt(3, 6);
        questions.push(
          `生活情境應用。某分期付款每年底繳 ${payment} 元，年利率 10% 複利計息，連續繳 ${years} 年，求最後一年年底的累積價值。`
        );
        answers.push(
          `簡答：\\(${payment}\\left(1+\\frac{11}{10}+(\\frac{11}{10})^2+\\cdots+(\\frac{11}{10})^{${years - 1}}\\right)\\) 元。過程：每一期款項到最後一年年底累積的時間不同，形成等比級數，公比為 \\(\\frac{11}{10}\\)，所以累積價值為 \\(${payment}\\cdot\\frac{(\\frac{11}{10})^{${years}}-1}{\\frac{11}{10}-1}\\)。`
        );
        continue;
      }
      const side = randInt(3, 8);
      const steps = randInt(3, 6);
      questions.push(
        `生活情境應用。取一邊長為 ${side} 的正三角形，將其四等分後移走中間三角形，重複此步驟 ${steps} 次，求剩餘總面積是原面積的幾倍。`
      );
      answers.push(
        `簡答：\\((\\frac{3}{4})^{${steps}}\\) 倍。過程：每次移走目前面積的 \\(\\frac{1}{4}\\)，所以剩餘面積每次乘以 \\(\\frac{3}{4}\\)。重複 ${steps} 次後為原面積的 \\((\\frac{3}{4})^{${steps}}\\) 倍。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS212GeometricBasicSumSet(count) {
    return buildS212GeometricSeriesFiveSubtypeMixedSet(count, 0);
  }

  function buildS212GeometricSeriesComputeSet(count) {
    return buildS212GeometricSeriesFiveSubtypeMixedSet(count, 1);
  }

  function buildS212GeometricSegmentPropertySet(count) {
    return buildS212GeometricSeriesFiveSubtypeMixedSet(count, 2);
  }

  function buildS212GeometricSnToAnSet(count) {
    return buildS212GeometricSeriesFiveSubtypeMixedSet(count, 3);
  }

  function buildS212GeometricApplicationsSet(count) {
    return buildS212GeometricSeriesFiveSubtypeMixedSet(count, 4);
  }

  function sumFirstN(n) {
    return (n * (n + 1)) / 2;
  }

  function sumSquares(n) {
    return (n * (n + 1) * (2 * n + 1)) / 6;
  }

  function sumCubes(n) {
    const s = sumFirstN(n);
    return s * s;
  }

  function sumSquaresRange(start, end) {
    return sumSquares(end) - sumSquares(start - 1);
  }

  function buildS212SigmaFiveSubtypeMixedSet(count, fixedMode = null) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const mode = Number.isInteger(fixedMode) ? fixedMode : i % 5;

      if (mode === 0) {
        const type = i % 5;
        if (type === 0) {
          const upper = randInt(10, 32);
          const value = sumSquares(upper);
          questions.push(`標準公式與範圍變換。計算 \\(\\sum_{k=1}^{${upper}} k^2\\) 的值。`);
          answers.push(
            `簡答：${value}。過程：\\(\\sum_{k=1}^{n}k^2=\\frac{n(n+1)(2n+1)}{6}\\)。代入 \\(n=${upper}\\)，得 \\(\\frac{${upper}\\cdot${upper + 1}\\cdot${2 * upper + 1}}{6}=${value}\\)。`
          );
          continue;
        }
        if (type === 1) {
          const upper = randInt(6, 22);
          const value = sumCubes(upper) + upper;
          questions.push(`標準公式與範圍變換。求 \\(\\sum_{k=1}^{${upper}}(k^3+1)\\) 之總和。`);
          answers.push(
            `簡答：${value}。過程：\\(\\sum(k^3+1)=\\sum k^3+\\sum1\\)，且 \\(\\sum_{k=1}^{n}k^3=\\left[\\frac{n(n+1)}{2}\\right]^2\\)。代入 \\(n=${upper}\\)，得 \\(${sumCubes(upper)}+${upper}=${value}\\)。`
          );
          continue;
        }
        if (type === 2) {
          const start = randInt(5, 12);
          const end = start + randInt(6, 12);
          const value = sumSquaresRange(start, end);
          questions.push(`標準公式與範圍變換。計算 \\(${start}^2+${start + 1}^2+\\cdots+${end}^2\\) 的值。`);
          answers.push(
            `簡答：${value}。過程：改寫為 \\(\\sum_{k=${start}}^{${end}}k^2=\\sum_{k=1}^{${end}}k^2-\\sum_{k=1}^{${start - 1}}k^2\\)。所以值為 \\(${sumSquares(end)}-${sumSquares(start - 1)}=${value}\\)。`
          );
          continue;
        }
        if (type === 3) {
          const upper = randInt(8, 26);
          const value = sumSquares(upper) + sumFirstN(upper);
          questions.push(`標準公式與範圍變換。計算 \\(\\sum_{k=1}^{${upper}} k(k+1)\\) 的值。`);
          answers.push(
            `簡答：${value}。過程：\\(k(k+1)=k^2+k\\)，所以 \\(\\sum k(k+1)=\\sum k^2+\\sum k\\)。代入 \\(n=${upper}\\)，得 \\(${sumSquares(upper)}+${sumFirstN(upper)}=${value}\\)。`
          );
          continue;
        }
        const m = randInt(4, 14);
        const n = randInt(m + 3, m + 10);
        const value = sumCubes(n) - sumCubes(m);
        questions.push(`標準公式與範圍變換。設 \\(f(n)=\\sum_{k=1}^{n}k^3\\)，求 \\(f(${n})-f(${m})\\)。`);
        answers.push(
          `簡答：${value}。過程：\\(f(n)=\\left[\\frac{n(n+1)}{2}\\right]^2\\)。所以 \\(f(${n})-f(${m})=${sumCubes(n)}-${sumCubes(m)}=${value}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        const type = i % 5;
        if (type === 0) {
          const n = randInt(6, 15);
          const sA = randInt(10, 40);
          const sA2 = randInt(50, 200);
          const value = 2 * sA + 3 * n;
          questions.push(
            `線性性質與常數項處理。已知 \\(\\sum_{k=1}^{${n}}a_k=${sA}\\)、\\(\\sum_{k=1}^{${n}}a_k^2=${sA2}\\)，求 \\(\\sum_{k=1}^{${n}}(2a_k+3)\\)。`
          );
          answers.push(
            `簡答：${value}。過程：利用 Sigma 線性性質，\\(\\sum(2a_k+3)=2\\sum a_k+\\sum3=2\\cdot${sA}+3\\cdot${n}=${value}\\)。其中 \\(\\sum a_k^2\\) 是干擾資訊。`
          );
          continue;
        }
        if (type === 1) {
          const n = randInt(10, 30);
          const a = randInt(2, 8);
          const b = pickNonZero(-8, 8);
          const value = a * sumFirstN(n) + b * n;
          questions.push(`線性性質與常數項處理。計算 \\(\\sum_{k=1}^{${n}}(${a}k${formatSignedAdd(b)})\\) 的總和。`);
          answers.push(
            `簡答：${value}。過程：\\(\\sum(${a}k${formatSignedAdd(b)})=${a}\\sum k${formatSignedAdd(b)}\\sum1=${a}\\cdot${sumFirstN(n)}${formatSignedAdd(b)}\\cdot${n}=${value}\\)。`
          );
          continue;
        }
        if (type === 2) {
          const n = randInt(6, 18);
          const sumPlus = randInt(30, 80);
          const sumMinus = randInt(4, 28);
          const value = (sumPlus + sumMinus) / 2;
          if (!Number.isInteger(value)) {
            i -= 1;
            continue;
          }
          questions.push(
            `線性性質與常數項處理。若 \\(\\sum_{k=1}^{${n}}(a_k+b_k)=${sumPlus}\\) 且 \\(\\sum_{k=1}^{${n}}(a_k-b_k)=${sumMinus}\\)，求 \\(\\sum_{k=1}^{${n}}a_k\\)。`
          );
          answers.push(
            `簡答：${value}。過程：兩式相加得 \\(2\\sum a_k=${sumPlus}+${sumMinus}=${sumPlus + sumMinus}\\)，所以 \\(\\sum a_k=${value}\\)。`
          );
          continue;
        }
        if (type === 3) {
          const n = randInt(20, 120);
          const value = 4 * sumFirstN(n);
          questions.push(`線性性質與常數項處理。求 \\(\\sum_{k=1}^{${n}}(k+1)^2-\\sum_{k=1}^{${n}}(k-1)^2\\)。`);
          answers.push(
            `簡答：${value}。過程：\\((k+1)^2-(k-1)^2=4k\\)，所以原式為 \\(\\sum_{k=1}^{${n}}4k=4\\cdot${sumFirstN(n)}=${4 * sumFirstN(n)}\\)。注意若題目寫成兩個 Sigma 相減，也可合併成同一個 Sigma 後再化簡。`
          );
          continue;
        }
        const n = randInt(5, 20);
        const value = n * n;
        questions.push(`線性性質與常數項處理。計算 \\(\\sum_{k=1}^{${n}}(2k-1)\\)，並說明其結果為何。`);
        answers.push(
          `簡答：${value}。過程：\\(\\sum(2k-1)=2\\sum k-\\sum1=2\\cdot${sumFirstN(n)}-${n}=${value}\\)，所以前 ${n} 個正奇數和為 \\(n^2\\)。`
        );
        continue;
      }

      if (mode === 2) {
        const type = i % 5;
        if (type === 0) {
          const n = randInt(5, 15);
          const value = makeFraction(n, n + 1);
          questions.push(`分式拆項對消。求 \\(\\sum_{k=1}^{${n}}\\frac{1}{k(k+1)}\\) 的總和。`);
          answers.push(
            `簡答：\\(${fractionText(value)}\\)。過程：\\(\\frac{1}{k(k+1)}=\\frac1k-\\frac{1}{k+1}\\)。展開後中間項全部抵消，剩下 \\(1-\\frac{1}{${n + 1}}=${fractionText(value)}\\)。`
          );
          continue;
        }
        if (type === 1) {
          const start = randInt(1, 4);
          const terms = randInt(5, 10);
          const end = start + 2 * (terms - 1);
          const value = makeFraction(terms, start * (end + 2));
          questions.push(
            `分式拆項對消。計算 \\(\\frac{1}{${start}\\cdot${start + 2}}+\\frac{1}{${start + 2}\\cdot${start + 4}}+\\cdots+\\frac{1}{${end}\\cdot${end + 2}}\\)。`
          );
          answers.push(
            `簡答：\\(${fractionText(value)}\\)。過程：\\(\\frac{1}{k(k+2)}=\\frac12(\\frac1k-\\frac{1}{k+2})\\)。逐項抵消後只剩首尾，結果為 \\(${fractionText(value)}\\)。`
          );
          continue;
        }
        if (type === 2) {
          const n = randInt(4, 12);
          const value = makeFraction(n * (3 * n + 5), 4 * (n + 1) * (n + 2));
          questions.push(`分式拆項對消。求 \\(\\sum_{k=1}^{${n}}\\frac{1}{k(k+2)}\\) 之和。`);
          answers.push(
            `簡答：\\(${fractionText(value)}\\)。過程：\\(\\frac{1}{k(k+2)}=\\frac12(\\frac1k-\\frac{1}{k+2})\\)。相消後得 \\(\\frac12(1+\\frac12-\\frac{1}{${n + 1}}-\\frac{1}{${n + 2}})=${fractionText(value)}\\)。`
          );
          continue;
        }
        if (type === 3) {
          const n = randInt(5, 18);
          if (isPerfectSquare(n + 1)) {
            i -= 1;
            continue;
          }
          const value = `${formatRadical(n + 1)}-1`;
          questions.push(`分式拆項對消。計算 \\(\\sum_{k=1}^{${n}}\\frac{1}{\\sqrt{k+1}+\\sqrt{k}}\\)。`);
          answers.push(
            `簡答：\\(${value}\\)。過程：分母有理化，\\(\\frac{1}{\\sqrt{k+1}+\\sqrt{k}}=\\sqrt{k+1}-\\sqrt{k}\\)。展開後對消，剩下 \\(\\sqrt{${n + 1}}-1=${value}\\)。`
          );
          continue;
        }
        const n = randInt(5, 15);
        const value = makeFraction(n * n + 2 * n, (n + 1) * (n + 1));
        questions.push(`分式拆項對消。求 \\(\\sum_{k=1}^{${n}}\\frac{2k+1}{k^2(k+1)^2}\\)。`);
        answers.push(
          `簡答：\\(${fractionText(value)}\\)。過程：\\(\\frac{2k+1}{k^2(k+1)^2}=\\frac{1}{k^2}-\\frac{1}{(k+1)^2}\\)。展開後抵消，剩下 \\(1-\\frac{1}{(${n}+1)^2}=${fractionText(value)}\\)。`
        );
        continue;
      }

      if (mode === 3) {
        const type = i % 5;
        if (type === 0) {
          const n = randInt(8, 20);
          const value = 100 * sumFirstN(n) - sumSquares(n);
          questions.push(
            `數列規律轉化為 Sigma 記號。將 \\(1\\cdot99+2\\cdot98+3\\cdot97+\\cdots+${n}\\cdot${100 - n}\\) 寫成 Sigma 記號並求和。`
          );
          answers.push(
            `簡答：\\(\\sum_{k=1}^{${n}}k(100-k)=${value}\\)。過程：第 \\(k\\) 項為 \\(k(100-k)\\)，所以總和為 \\(100\\sum k-\\sum k^2=100\\cdot${sumFirstN(n)}-${sumSquares(n)}=${value}\\)。`
          );
          continue;
        }
        if (type === 1) {
          const n = randInt(5, 16);
          const value = sumFirstN(n) + sumSquares(n);
          questions.push(`數列規律轉化為 Sigma 記號。計算 \\(1\\cdot2+2\\cdot3+3\\cdot4+\\cdots+${n}(${n + 1})\\)。`);
          answers.push(
            `簡答：${value}。過程：第 \\(k\\) 項為 \\(k(k+1)\\)，所以總和 \\(\\sum_{k=1}^{${n}}k(k+1)=\\sum k^2+\\sum k=${sumSquares(n)}+${sumFirstN(n)}=${value}\\)。`
          );
          continue;
        }
        if (type === 2) {
          const first = randInt(3, 9);
          const d = randInt(3, 6);
          const last = first + d * randInt(8, 16);
          const n = (last - first) / d + 1;
          const value = (n * (first + last)) / 2;
          questions.push(
            `數列規律轉化為 Sigma 記號。級數 \\(${first}+${first + d}+${first + 2 * d}+\\cdots+${last}\\) 請用 Sigma 符號表示並求和。`
          );
          answers.push(
            `簡答：\\(\\sum_{k=1}^{${n}}[${first}+${d}(k-1)]=${value}\\)。過程：一般項為 \\(${first}+${d}(k-1)\\)，共有 ${n} 項，所以和為 \\(\\frac{${n}(${first}+${last})}{2}=${value}\\)。`
          );
          continue;
        }
        if (type === 3) {
          const n = randInt(6, 12);
          const sum = (n * (n + 1) * (n + 2)) / 6;
          questions.push(`數列規律轉化為 Sigma 記號。求 \\((1)+(1+2)+(1+2+3)+\\cdots+(1+2+\\cdots+${n})\\) 的總和。`);
          answers.push(
            `簡答：${sum}。過程：第 \\(k\\) 組為 \\(1+2+\\cdots+k=\\frac{k(k+1)}2\\)，所以總和為 \\(\\sum_{k=1}^{${n}}\\frac{k(k+1)}2=${sum}\\)。`
          );
          continue;
        }
        const n = randInt(6, 12);
        let total = 0;
        for (let k = 1; k <= n; k += 1) total += (3 * k - 2) * (3 * k);
        questions.push(`數列規律轉化為 Sigma 記號。計算 \\(1\\cdot3+4\\cdot6+7\\cdot9+\\cdots\\) 前 ${n} 項和。`);
        answers.push(
          `簡答：${total}。過程：第 \\(k\\) 項為 \\((3k-2)(3k)\\)，所以總和為 \\(\\sum_{k=1}^{${n}}(3k-2)(3k)\\)。展開為 \\(\\sum(9k^2-6k)\\)，代入公式得 ${total}。`
        );
        continue;
      }

      const type = i % 5;
      if (type === 0) {
        const r = [2, 3][randInt(0, 1)];
        const n = randInt(6, 16);
        const geo = (powInt(r, n + 1) - r) / (r - 1);
        const value = geo + sumFirstN(n);
        questions.push(`多項式與指數混合型 Sigma。求 \\(\\sum_{k=1}^{${n}}(${r}^k+k)\\) 的值。`);
        answers.push(
          `簡答：${value}。過程：拆成 \\(\\sum${r}^k+\\sum k\\)。其中 \\(\\sum_{k=1}^{${n}}${r}^k=\\dfrac{${r}^{${n + 1}}-${r}}{${r - 1}}=${geo}\\)，\\(\\sum k=${sumFirstN(n)}\\)，所以總和為 ${value}。`
        );
        continue;
      }
      if (type === 1) {
        const n = randInt(5, 13);
        const value = (powInt(3, n + 1) - 3) / 2 - 2 * sumFirstN(n) + n;
        questions.push(`多項式與指數混合型 Sigma。計算 \\(\\sum_{k=1}^{${n}}(3^k-2k+1)\\)。`);
        answers.push(
          `簡答：${value}。過程：拆成 \\(\\sum3^k-2\\sum k+\\sum1\\)。代入 \\(\\sum3^k=\\frac{3^{${n + 1}}-3}{2}\\)、\\(\\sum k=${sumFirstN(n)}\\)、\\(\\sum1=${n}\\)，得 ${value}。`
        );
        continue;
      }
      if (type === 2) {
        const n = randInt(4, 9);
        const x = randInt(2, 6);
        const y = randInt(1, 5);
        const value = powInt(x + y, n);
        questions.push(
          `多項式與指數混合型 Sigma。計算 \\(\\sum_{k=0}^{${n}}\\binom{${n}}{k}${x}^{${n}-k}${y}^{k}\\)。`
        );
        answers.push(
          `簡答：${value}。過程：由二項式定理，\\(\\sum_{k=0}^{n}\\binom{n}{k}x^{n-k}y^k=(x+y)^n\\)。所以原式為 \\((${x}+${y})^{${n}}=${value}\\)。`
        );
        continue;
      }
      if (type === 3) {
        const c = randInt(3, 8);
        const n = randInt(5, 14);
        const value = mulFraction(
          makeFraction(c, 1),
          subFraction(makeFraction(1, 1), powFraction(makeFraction(1, 2), n))
        );
        questions.push(`多項式與指數混合型 Sigma。求 \\(\\sum_{k=1}^{${n}}${c}\\cdot(\\frac12)^k\\) 的值。`);
        answers.push(
          `簡答：\\(${fractionText(value)}\\)。過程：這是首項 \\(\\frac{${c}}{2}\\)、公比 \\(\\frac12\\) 的等比級數；或直接用公式 \\(${c}\\sum_{k=1}^{${n}}(\\frac12)^k=${c}(1-(\\frac12)^{${n}})=${fractionText(value)}\\)。`
        );
        continue;
      }
      const s = randInt(0, 2);
      const n = randInt(5, 13);
      const hi = s + 1;
      const loStr = s === 0 ? 'k' : `k+${s}`;
      const endFact = n + s + 1;
      questions.push(`多項式與指數混合型 Sigma。計算 \\(\\sum_{k=1}^{${n}}[(k+${hi})!-(${loStr})!]\\)。`);
      answers.push(
        `簡答：\\(${endFact}!-${hi}!\\)。過程：階乘型望遠鏡和，展開後中間項全部抵消，剩下最大項 \\((${n}+${hi})!=${endFact}!\\) 減去最小項 \\(${hi}!\\)，即 \\(${endFact}!-${hi}!\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS212SigmaFormulaRangeSet(count) {
    return buildS212SigmaFiveSubtypeMixedSet(count, 0);
  }

  function buildS212SigmaLinearitySet(count) {
    return buildS212SigmaFiveSubtypeMixedSet(count, 1);
  }

  function buildS212SigmaTelescopingSet(count) {
    return buildS212SigmaFiveSubtypeMixedSet(count, 2);
  }

  function buildS212SigmaPatternSet(count) {
    return buildS212SigmaFiveSubtypeMixedSet(count, 3);
  }

  function buildS212SigmaMixedSet(count) {
    return buildS212SigmaFiveSubtypeMixedSet(count, 4);
  }

  function buildS212RepeatingDigitsSeriesSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const digit = randInt(2, 9);
      if (mode === 0) {
        questions.push(
          `求級數 \\(${digit}+${Number(`${digit}${digit}`)}+${Number(`${digit}${digit}${digit}`)}+\\cdots+\\underbrace{${digit}${digit}\\cdots${digit}}_{n\\text{ 位}}\\) 的總和公式。`
        );
        answers.push(
          `簡答：\\(\\frac{${digit}}9\\left(\\frac{10(10^n-1)}9-n\\right)\\)。過程：第 \\(k\\) 項為 \\(\\frac{${digit}}9(10^k-1)\\)。所以總和為 \\(\\frac{${digit}}9\\sum_{k=1}^{n}(10^k-1)=\\frac{${digit}}9\\left(\\frac{10(10^n-1)}9-n\\right)\\)。`
        );
      } else if (mode === 1) {
        const n = randInt(6, 15);
        questions.push(
          `計算級數 \\(0.${digit}+0.${digit}${digit}+0.${digit}${digit}${digit}+\\cdots\\) 前 ${n} 項之和。`
        );
        answers.push(
          `簡答：\\(\\frac{${digit * n}}9-\\frac{${digit}}{81}(1-10^{-${n}})\\)。過程：第 \\(k\\) 項為 \\(\\frac{${digit}}9(1-10^{-k})\\)。所以前 ${n} 項和為 \\(\\frac{${digit}}9\\left(${n}-\\frac{1-10^{-${n}}}{9}\\right)=\\frac{${digit * n}}9-\\frac{${digit}}{81}(1-10^{-${n}})\\)。`
        );
      } else if (mode === 2) {
        questions.push(
          `求級數 \\(${digit}+${Number(`${digit}${digit}`)}+${Number(`${digit}${digit}${digit}`)}+\\cdots\\) 至第 \\(n\\) 項的和，並以 \\(n\\) 的函數表示。`
        );
        answers.push(
          `簡答：\\(\\frac{${digit}}9\\left(\\frac{10(10^n-1)}9-n\\right)\\)。過程：第 \\(k\\) 項為 \\(\\frac{${digit}}9(10^k-1)\\)。所以總和為 \\(\\frac{${digit}}9\\left(\\frac{10(10^n-1)}9-n\\right)\\)。`
        );
      } else if (mode === 3) {
        const base = randInt(2, 9);
        const n = randInt(8, 18);
        questions.push(`計算 \\(${base}+${base}.${digit}+${base}.${digit}${digit}+\\cdots\\) 前 ${n} 項的總和。`);
        answers.push(
          `簡答：\\(${base * n}+\\frac{${digit}}9\\left(${n}-\\frac{1-10^{-${n}}}{1-10^{-1}}\\right)\\)。過程：第 \\(j+1\\) 項可寫成 \\(${base}+\\frac{${digit}}9(1-10^{-j})\\)，其中 \\(j=0,1,\\ldots,${n - 1}\\)。相加即得 \\(${base * n}+\\frac{${digit}}9\\left(${n}-\\frac{1-10^{-${n}}}{1-10^{-1}}\\right)\\)。`
        );
      } else {
        questions.push(
          `設 \\(a_n=\\underbrace{${digit}${digit}\\cdots${digit}}_{n\\text{ 位}}\\)，求 \\(\\sum_{k=1}^{n}a_k\\) 的一般項。`
        );
        answers.push(
          `簡答：\\(\\frac{${digit}}9\\left(\\frac{10(10^n-1)}9-n\\right)\\)。過程：\\(a_k=\\frac{${digit}}9(10^k-1)\\)。所以 \\(\\sum_{k=1}^{n}a_k=\\frac{${digit}}9\\left(\\frac{10(10^n-1)}9-n\\right)\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS212RadicalTelescopingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const n = randInt(24, 120);
        questions.push(`計算 \\(\\sum_{k=1}^{${n}}\\frac{1}{\\sqrt{k+1}+\\sqrt{k}}\\) 之值。`);
        answers.push(
          `簡答：\\(${formatRadical(n + 1)}-1\\)。過程：有理化得 \\(\\frac{1}{\\sqrt{k+1}+\\sqrt{k}}=\\sqrt{k+1}-\\sqrt{k}\\)。連續相消後剩 \\(\\sqrt{${n + 1}}-1=${formatRadical(n + 1)}-1\\)。`
        );
      } else if (mode === 1) {
        questions.push(
          `求級數 \\(\\frac1{\\sqrt3+\\sqrt1}+\\frac1{\\sqrt5+\\sqrt3}+\\cdots+\\frac1{\\sqrt{2n+1}+\\sqrt{2n-1}}\\) 的和。`
        );
        answers.push(
          `簡答：\\(\\frac{\\sqrt{2n+1}-1}{2}\\)。過程：\\(\\frac1{\\sqrt{2k+1}+\\sqrt{2k-1}}=\\frac{\\sqrt{2k+1}-\\sqrt{2k-1}}{2}\\)。展開後相消，剩 \\(\\frac{\\sqrt{2n+1}-1}{2}\\)。`
        );
      } else if (mode === 2) {
        const n = randInt(18, 72);
        const value = `\\frac{${formatRadical(2 * n + 1)}-1}{2}`;
        questions.push(`計算 \\(\\sum_{k=1}^{${n}}\\frac1{\\sqrt{2k+1}+\\sqrt{2k-1}}\\) 的值。`);
        answers.push(
          `簡答：\\(${value}\\)。過程：\\(\\frac1{\\sqrt{2k+1}+\\sqrt{2k-1}}=\\frac{\\sqrt{2k+1}-\\sqrt{2k-1}}{2}\\)。逐項相消後，剩 \\(\\frac{\\sqrt{${2 * n + 1}}-1}{2}=${value}\\)。`
        );
      } else if (mode === 3) {
        const n = randInt(20, 80);
        questions.push(`求級數 \\(\\sum_{k=1}^{${n}}\\frac{1}{\\sqrt{k+2}+\\sqrt{k+1}}\\) 的簡化值。`);
        answers.push(
          `簡答：\\(${formatRadical(n + 2)}-\\sqrt2\\)。過程：有理化後為 \\(\\sqrt{k+2}-\\sqrt{k+1}\\)。相消後剩 \\(\\sqrt{${n + 2}}-\\sqrt2=${formatRadical(n + 2)}-\\sqrt2\\)。`
        );
      } else {
        const n = randInt(40, 120);
        questions.push(
          `計算 \\(\\frac1{\\sqrt1+\\sqrt2}+\\frac1{\\sqrt2+\\sqrt3}+\\cdots+\\frac1{\\sqrt{${n}}+\\sqrt{${n + 1}}}\\)。`
        );
        answers.push(
          `簡答：\\(${formatRadical(n + 1)}-1\\)。過程：每一項有理化為 \\(\\sqrt{k+1}-\\sqrt{k}\\)。從 \\(k=1\\) 到 ${n} 相消後，剩 \\(\\sqrt{${n + 1}}-1=${formatRadical(n + 1)}-1\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS212ConsecutiveProductsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const n = randInt(6, 18);
      if (mode === 0) {
        const value = (n * (n + 1) * (n + 2)) / 3;
        questions.push(`計算 \\(1\\cdot2+2\\cdot3+3\\cdot4+\\cdots+${n}\\cdot${n + 1}\\) 的總和。`);
        answers.push(
          `簡答：${value}。過程：\\(k(k+1)=k^2+k\\)，所以總和為 \\(\\sum k^2+\\sum k=\\frac{${n}(${n}+1)(${n}+2)}3=${value}\\)。`
        );
      } else if (mode === 1) {
        const value = (n * (n + 1) * (n + 2) * (n + 3)) / 4;
        questions.push(`求級數 \\(1\\cdot2\\cdot3+2\\cdot3\\cdot4+\\cdots+${n}\\cdot${n + 1}\\cdot${n + 2}\\) 之值。`);
        answers.push(
          `簡答：${value}。過程：\\(k(k+1)(k+2)=6\\binom{k+2}{3}\\)，所以總和為 \\(6\\binom{${n + 3}}4=${value}\\)。`
        );
      } else if (mode === 2) {
        const value = (n * (4 * n * n + 6 * n - 1)) / 3;
        questions.push(`計算 \\(\\sum_{k=1}^{${n}}(2k-1)(2k+1)\\)。`);
        answers.push(
          `簡答：${value}。過程：\\((2k-1)(2k+1)=4k^2-1\\)。所以總和為 \\(4\\sum k^2-\\sum1=\\frac{${n}(4\\cdot${n}^2+6\\cdot${n}-1)}3=${value}\\)。`
        );
      } else if (mode === 3) {
        const value = (n * (n + 1) * (n + 2) * (n + 3) * (n + 4)) / 5;
        questions.push(`求 \\(\\sum_{k=1}^{${n}}k(k+1)(k+2)(k+3)\\) 的結果。`);
        answers.push(
          `簡答：${value}。過程：\\(k(k+1)(k+2)(k+3)=24\\binom{k+3}{4}\\)。因此總和為 \\(24\\binom{${n + 4}}5=${value}\\)。`
        );
      } else {
        const value = (n * (n + 1) * (2 * n + 1)) / 6;
        questions.push(`計算級數 \\(1^2+2^2+\\cdots+${n}^2\\)，並用 \\(\\sum k(k+1)-\\sum k\\) 推導。`);
        answers.push(
          `簡答：${value}。過程：因為 \\(k^2=k(k+1)-k\\)，所以 \\(\\sum k^2=\\sum k(k+1)-\\sum k=\\frac{${n}(${n}+1)(2\\cdot${n}+1)}6=${value}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS212GeometricStackingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const n = randInt(6, 16);
      if (mode === 0) {
        const value = (n * (n + 1) * (n + 2)) / 6;
        questions.push(`高腳杯三角堆：最底層為邊長 ${n} 的正三角形陣列，共堆疊 ${n} 層，求總杯數。`);
        answers.push(
          `簡答：${value}。過程：第 \\(k\\) 層為三角數 \\(\\frac{k(k+1)}2\\)。總杯數為 \\(\\sum_{k=1}^{${n}}\\frac{k(k+1)}2=${value}\\)。`
        );
      } else if (mode === 1) {
        const value = (n * (n + 1) * (2 * n + 1)) / 6;
        questions.push(`正方形柳丁塔：最底層為 \\(${n}\\times${n}\\) 的正方形，每往上一層長寬各減 1，求總個數。`);
        answers.push(
          `簡答：${value}。過程：各層個數為 \\(${n}^2,${n - 1}^2,\\ldots,1^2\\)，所以總數為 \\(1^2+2^2+\\cdots+${n}^2=${value}\\)。`
        );
      } else if (mode === 2) {
        const value = (n * (n + 1) * (4 * n + 5)) / 6;
        questions.push(`長方形積木堆：最上層 \\(1\\times3\\)，往下一層長寬各增 1 與 2，求堆疊 ${n} 層的總數。`);
        answers.pushWithSummary(
          `\\(${value}\\)`,
          `過程：由上往下第 \\(k+1\\) 層為 \\((1+k)(3+2k)\\)，其中 \\(k=0,1,\\ldots,${n - 1}\\)。展開為 \\(2k^2+5k+3\\)，加總得 \\(\\frac{${n}(${n}+1)(4\\cdot${n}+5)}6=${value}\\)。`
        );
      } else if (mode === 3) {
        questions.push(
          `同心圓環面積：半徑為 \\(1,2,\\ldots,${n}\\) 的 ${n} 個同心圓，求所有相鄰圓環面積組成的級數和。`
        );
        answers.push(
          `簡答：\\(${n * n - 1}\\pi\\)。過程：第 \\(k\\) 個圓環面積為 \\(\\pi k^2-\\pi(k-1)^2\\)，從 \\(k=2\\) 到 ${n} 相加後對消，剩 \\(\\pi\\cdot${n}^2-\\pi=${n * n - 1}\\pi\\)。`
        );
      } else {
        const value = (n * (n + 1)) / 2;
        questions.push(
          `座標螺線長度：點從原點出發，依「右、上、左、下」移動，且第 \\(k\\) 次移動距離為 \\(k\\)，求第 ${n} 次後路徑總長。`
        );
        answers.push(
          `簡答：${value}。過程：總路徑長就是 \\(1+2+3+\\cdots+${n}\\)，因此為 \\(\\frac{${n}(${n}+1)}2=${value}\\)。方向只影響位置，不影響路徑總長。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS212AlgebraicVariantsSigmaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const m = randInt(20, 80);
        questions.push(`計算 \\(\\sum_{k=1}^{${2 * m}}|k-${m + 0.5}|\\) 的值。`);
        answers.push(
          `簡答：${m * m}。過程：以 ${m + 0.5} 為中心，距離為 \\(0.5,1.5,\\ldots,${m - 0.5}\\)，左右各一個。因此總和為 \\(2(0.5+1.5+\\cdots+${m - 0.5})=${m * m}\\)。`
        );
      } else if (mode === 1) {
        const n = randInt(8, 20);
        questions.push(`求級數 \\(\\sum_{k=1}^{${n}}(k\\cdot k!)\\) 的值。`);
        answers.push(
          `簡答：\\(${n + 1}!-1\\)。過程：因為 \\(k\\cdot k!=(k+1)!-k!\\)，所以原式相消後剩 \\(${n + 1}!-1\\)。`
        );
      } else if (mode === 2) {
        const m = randInt(6, 14);
        const value = ((m - 1) * m * (4 * m + 1)) / 6 + m;
        questions.push(`計算 \\(\\sum_{k=1}^{${m * m}}\\lfloor\\sqrt{k}\\rfloor\\)。`);
        answers.push(
          `簡答：${value}。過程：\\(\\lfloor\\sqrt{k}\\rfloor=j\\) 時，從 \\(j=1\\) 到 ${m - 1} 各有 \\(2j+1\\) 個，再加上 \\(k=${m * m}\\) 時的 ${m}，得 ${value}。`
        );
      } else if (mode === 3) {
        const n = randInt(5, 10);
        const a = randInt(2, 4);
        const value = (1 + a) ** n;
        questions.push(`求 \\(\\sum_{k=0}^{${n}}\\binom{${n}}{k}\\cdot${a}^k\\) 的值。`);
        answers.push(
          `簡答：${value}。過程：由二項式定理，\\(\\sum_{k=0}^{${n}}\\binom{${n}}{k}1^{${n}-k}${a}^k=(1+${a})^{${n}}=${value}\\)。`
        );
      } else {
        const p = randInt(90, 99);
        const denominator = 100 - p;
        const minN = Math.floor(p / denominator) + 1;
        const inequalityStep =
          denominator === 1
            ? `得 \\(n>${p}\\)`
            : `得 \\(${denominator}n>${p}\\)，即 \\(n>\\frac{${p}}{${denominator}}\\)`;
        questions.push(`設 \\(f(n)=\\sum_{k=1}^{n}\\frac1{k^2+k}\\)，求滿足 \\(f(n)>0.${p}\\) 的最小正整數 \\(n\\)。`);
        answers.push(
          `簡答：${minN}。過程：\\(\\frac1{k^2+k}=\\frac1k-\\frac1{k+1}\\)，所以 \\(f(n)=1-\\frac1{n+1}=\\frac n{n+1}\\)。由 \\(\\frac n{n+1}>\\frac{${p}}{100}\\)，${inequalityStep}，最小正整數為 ${minN}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS212SpecialSeriesSigmaFiveSubtypeMixedSet(count) {
    const banks = [
      buildS212RepeatingDigitsSeriesSet,
      buildS212RadicalTelescopingSet,
      buildS212ConsecutiveProductsSet,
      buildS212GeometricStackingSet,
      buildS212AlgebraicVariantsSigmaSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](mixedBankSampleCount(count, banks.length));
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS212RepeatingDigitsSeriesSubtypeSet(count) {
    return buildS212RepeatingDigitsSeriesSet(count);
  }

  function buildS212RadicalTelescopingSubtypeSet(count) {
    return buildS212RadicalTelescopingSet(count);
  }

  function buildS212ConsecutiveProductsSubtypeSet(count) {
    return buildS212ConsecutiveProductsSet(count);
  }

  function buildS212GeometricStackingSubtypeSet(count) {
    return buildS212GeometricStackingSet(count);
  }

  function buildS212AlgebraicVariantsSigmaSubtypeSet(count) {
    return buildS212AlgebraicVariantsSigmaSet(count);
  }

  function buildS211DifferenceMethodNonlinearSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const aTerm = (idx) => latexSub('a', idx);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        // a_{n+1} = a_n + n^2 -> a_n = a_1 + sum_{k=1}^{n-1} k^2 = a_1 + (n-1)n(2n-1)/6
        const a1 = randInt(1, 5);
        const n = randInt(4, 8);
        const sumVal = ((n - 1) * n * (2 * n - 1)) / 6;
        const an = a1 + sumVal;
        questions.push(
          `差分法求一般項。設 \\(${aTerm(1)}=${a1}\\)，\\(a_{n+1}=a_n+n^2\\ (n\\geq1)\\)，求一般項 \\(a_n\\) 並計算 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${an}\\)。過程：逐步相減得 \\(a_n=a_1+\\sum_{k=1}^{n-1}k^2\\)。代入公式 \\(\\sum_{k=1}^{m}k^2=\\dfrac{m(m+1)(2m+1)}{6}\\)，得 \\(a_n=${a1}+\\dfrac{(n-1)n(2n-1)}{6}\\)。代入 \\(n=${n}\\)：\\(${aTerm(n)}=${a1}+${sumVal}=${an}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        // a_{n+1} = a_n + n(n+1) -> a_n = a_1 + (n-1)n(n+1)/3
        const a1 = randInt(1, 4);
        const n = randInt(4, 7);
        const sumVal = ((n - 1) * n * (n + 1)) / 3;
        const an = a1 + sumVal;
        questions.push(
          `差分法求一般項。設 \\(${aTerm(1)}=${a1}\\)，\\(a_{n+1}=a_n+n(n+1)\\ (n\\geq1)\\)，求一般項公式並計算 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${an}\\)。過程：\\(a_n=a_1+\\sum_{k=1}^{n-1}k(k+1)\\)。利用 \\(\\sum_{k=1}^{m}k(k+1)=\\dfrac{m(m+1)(m+2)}{3}\\)，代入 \\(m=n-1\\) 得 \\(a_n=${a1}+\\dfrac{(n-1)n(n+1)}{3}\\)。代入 \\(n=${n}\\)：\\(${aTerm(n)}=${a1}+${sumVal}=${an}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        // a_{n+1} = a_n + 1/(n(n+1)) -> a_n = a_1 + (n-1)/n (telescoping)
        const a1 = randInt(1, 3);
        const n = randInt(5, 10);
        // a_n = a_1 + (n-1)/n = (a1*n + n - 1)/n
        const numVal = a1 * n + n - 1;
        const ansStr = formatFraction(numVal, n);
        questions.push(
          `差分法（部分分式疊加）。設 \\(${aTerm(1)}=${a1}\\)，\\(a_{n+1}=a_n+\\dfrac{1}{n(n+1)}\\ (n\\geq1)\\)，求 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${ansStr}\\)。過程：由 \\(\\dfrac{1}{k(k+1)}=\\dfrac{1}{k}-\\dfrac{1}{k+1}\\)，逐步疊加得 \\(a_n=a_1+\\sum_{k=1}^{n-1}\\!\\left(\\dfrac{1}{k}-\\dfrac{1}{k+1}\\right)=${a1}+1-\\dfrac{1}{n}=${a1}+\\dfrac{n-1}{n}\\)。代入 \\(n=${n}\\) 得 \\(${aTerm(n)}=${ansStr}\\)。`
        );
        continue;
      }

      if (mode === 3) {
        // a_{n+1} = a_n + 1/((2n-1)(2n+1)) -> Sigma = (n-1)/(2n-1); a_n = a1 + (n-1)/(2n-1)
        const a1 = randInt(0, 2);
        const n = randInt(4, 8);
        // a_n = a1 + (n-1)/(2n-1) = (a1*(2n-1) + n-1)/(2n-1)
        const totalNum = a1 * (2 * n - 1) + (n - 1);
        const totalDen = 2 * n - 1;
        const ansStr = formatFraction(totalNum, totalDen);
        const a1Str = `${a1}`;
        questions.push(
          `差分法（奇數乘積部分分式）。設 \\(${aTerm(1)}=${a1Str}\\)，\\(a_{n+1}=a_n+\\dfrac{1}{(2n-1)(2n+1)}\\ (n\\geq1)\\)，求 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${ansStr}\\)。過程：\\(\\dfrac{1}{(2k-1)(2k+1)}=\\dfrac{1}{2}\\!\\left(\\dfrac{1}{2k-1}-\\dfrac{1}{2k+1}\\right)\\)。疊加後 \\(\\sum_{k=1}^{n-1}\\dfrac{1}{(2k-1)(2k+1)}=\\dfrac{1}{2}\\!\\left(1-\\dfrac{1}{2n-1}\\right)=\\dfrac{n-1}{2n-1}\\)，故 \\(${aTerm(n)}=${a1Str}+\\dfrac{n-1}{2n-1}\\Big|_{n=${n}}=${ansStr}\\)。`
        );
        continue;
      }

      // mode === 4: a_{n+1} = a_n + r^n -> a_n = a_1 + r(r^{n-1}-1)/(r-1)
      const r = [2, 3][randInt(0, 1)];
      const a1 = randInt(1, 3);
      const n = randInt(4, 6);
      // sum_{k=1}^{n-1} r^k = r(r^{n-1}-1)/(r-1)
      const sumVal = (r * (powInt(r, n - 1) - 1)) / (r - 1);
      const an = a1 + sumVal;
      const rExpr = r === 2 ? '2^n' : '3^n';
      questions.push(
        `差分法（指數型）。設 \\(${aTerm(1)}=${a1}\\)，\\(a_{n+1}=a_n+${rExpr}\\ (n\\geq1)\\)，求 \\(${aTerm(n)}\\)。`
      );
      answers.push(
        `簡答：\\(${aTerm(n)}=${an}\\)。過程：逐步相減得 \\(a_n=a_1+\\sum_{k=1}^{n-1}${r}^k\\)。等比級數求和：\\(\\sum_{k=1}^{n-1}${r}^k=\\dfrac{${r}(${r}^{n-1}-1)}{${r}-1}\\)。代入 \\(n=${n}\\)，\\(\\sum_{k=1}^{${n - 1}}${r}^k=${sumVal}\\)，故 \\(${aTerm(n)}=${a1}+${sumVal}=${an}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS212ReverseNFromSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        // AP S_n = n(2a1+(n-1)d)/2 = C, find n
        const a1 = randInt(1, 9);
        const d = [2, 3, 4, 5, 6][randInt(0, 4)];
        const n0 = randInt(7, 20);
        const C = (n0 * (2 * a1 + (n0 - 1) * d)) / 2;
        // quadratic: d*n^2 + (2a1-d)*n - 2C = 0
        const coefB = 2 * a1 - d;
        const discr = coefB * coefB + 8 * d * C;
        const sqrtD = Math.round(Math.sqrt(discr));
        const bTerm =
          coefB === 0 ? '' : coefB === 1 ? '+n' : coefB === -1 ? '-n' : coefB > 0 ? `+${coefB}n` : `${coefB}n`;
        const eqStr = `${d}n^2${bTerm}-${2 * C}=0`;
        const negB = -coefB;
        const negBStr = negB >= 0 ? `${negB}` : `(${negB})`;
        questions.push(
          `反求項數。等差數列首項 \\(a_1=${a1}\\)，公差 \\(d=${d}\\)，若前 \\(n\\) 項和 \\(S_n=${C}\\)，求 \\(n\\)。`
        );
        answers.push(
          `簡答：\\(n=${n0}\\)。過程：代入等差級數公式 \\(S_n=\\dfrac{n[2\\cdot${a1}+(n-1)\\cdot${d}]}{2}\\)，展開整理得 \\(${eqStr}\\)。判別式 \\(\\Delta=${discr}\\)，取正根 \\(n=\\dfrac{${negBStr}+${sqrtD}}{${2 * d}}=${n0}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        // sum_{k=1}^{n}(ak+b) = a*n(n+1)/2 + b*n = C, find n
        const a = [2, 3, 4, 5, 6][randInt(0, 4)];
        const b = randInt(1, 6);
        const n0 = randInt(7, 15);
        const C = (a * n0 * (n0 + 1)) / 2 + b * n0;
        // a*n^2 + (a+2b)*n - 2C = 0 (after *2)
        const coefA = a;
        const coefB = a + 2 * b;
        const discr = coefB * coefB + 4 * coefA * 2 * C;
        const sqrtD = Math.round(Math.sqrt(discr));
        const aStr = a === 1 ? 'k' : `${a}k`;
        const bPart = `+${b}`;
        const bnTerm = b === 1 ? 'n' : `${b}n`;
        questions.push(`反求項數。若 \\(\\sum_{k=1}^{n}(${aStr}${bPart})=${C}\\)，求 \\(n\\)。`);
        answers.push(
          `簡答：\\(n=${n0}\\)。過程：\\(\\sum_{k=1}^{n}(${aStr}${bPart})=${a}\\cdot\\dfrac{n(n+1)}{2}+${bnTerm}\\)，整理（兩邊乘 2）得 \\(${coefA}n^2+${coefB}n-${2 * C}=0\\)。判別式 \\(\\Delta=${discr}\\)，取正根 \\(n=\\dfrac{-${coefB}+${sqrtD}}{${2 * coefA}}=${n0}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        // sum_{k=1}^{n}(2k-1) = n^2 = C, find n = sqrt(C)
        const n0 = randInt(9, 30);
        const C = n0 * n0;
        questions.push(`反求項數（奇數求和）。奇數數列 \\(1+3+5+\\cdots+(2n-1)=${C}\\)，求 \\(n\\)。`);
        answers.push(
          `簡答：\\(n=${n0}\\)。過程：前 \\(n\\) 個奇數之和公式為 \\(\\sum_{k=1}^{n}(2k-1)=n^2\\)，所以 \\(n^2=${C}\\)，解得 \\(n=${n0}\\)。`
        );
        continue;
      }

      if (mode === 3) {
        // sum_{k=1}^{n}k = n(n+1)/2 = C, find n
        const n0 = randInt(9, 30);
        const C = (n0 * (n0 + 1)) / 2;
        const discr = 1 + 8 * C;
        const sqrtD = Math.round(Math.sqrt(discr));
        questions.push(`反求項數（自然數求和）。若 \\(1+2+3+\\cdots+n=${C}\\)，求 \\(n\\)。`);
        answers.push(
          `簡答：\\(n=${n0}\\)。過程：\\(\\dfrac{n(n+1)}{2}=${C}\\)，整理得 \\(n^2+n-${2 * C}=0\\)。判別式 \\(\\Delta=1+${8 * C}=${discr}\\)，取正根 \\(n=\\dfrac{-1+${sqrtD}}{2}=${n0}\\)。`
        );
        continue;
      }

      // mode === 4: GP sum: 1+r+r^2+...+r^{n-1} = (r^n-1)/(r-1) = C, find n
      const r = [2, 3, 5][randInt(0, 2)];
      const n0 = [4, 5, 6, 7, 8][randInt(0, 4)];
      const C = (powInt(r, n0) - 1) / (r - 1);
      const rN0 = powInt(r, n0);
      questions.push(`反求項數（等比級數）。若 \\(1+${r}+${r}^2+\\cdots+${r}^{n-1}=${C}\\)，求 \\(n\\)。`);
      answers.push(
        `簡答：\\(n=${n0}\\)。過程：等比級數和 \\(\\dfrac{${r}^n-1}{${r}-1}=${C}\\)，所以 \\(${r}^n-1=${C * (r - 1)}\\)，得 \\(${r}^n=${rN0}\\)。由此可得 \\(n=${n0}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS212NonStandardSigmaLimitsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        // sum_{k=0}^{n} r^k = (r^{n+1}-1)/(r-1), lower bound is 0
        const r = [2, 3][randInt(0, 1)];
        const n = randInt(4, 12);
        const total = (powInt(r, n + 1) - 1) / (r - 1);
        questions.push(`非標準下界的 Sigma。計算 \\(\\sum_{k=0}^{${n}}${r}^k\\)。`);
        answers.push(
          `簡答：${total}。過程：下界從 \\(k=0\\) 開始，包含 \\(${r}^0=1\\) 這一項，共有 ${n + 1} 項。等比級數公式：\\(\\sum_{k=0}^{n}r^k=\\dfrac{r^{n+1}-1}{r-1}\\)，代入 \\(r=${r},n=${n}\\)，得 \\(\\dfrac{${r}^{${n + 1}}-1}{${r - 1}}=${total}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        // sum_{k=m}^{n}(ak+b) with m >= 2
        const a = [2, 3, 4, 5][randInt(0, 3)];
        const b = randInt(1, 5);
        const m = [2, 3, 4, 5][randInt(0, 3)];
        const n = randInt(9, 18);
        // full sum: a*n(n+1)/2 + b*n
        const fullSum = (a * n * (n + 1)) / 2 + b * n;
        // prefix sum from 1 to m-1: a*(m-1)*m/2 + b*(m-1)
        const partSum = (a * (m - 1) * m) / 2 + b * (m - 1);
        const result = fullSum - partSum;
        const aStr = a === 1 ? 'k' : `${a}k`;
        const bPart = `+${b}`;
        questions.push(`非標準下界的 Sigma。計算 \\(\\sum_{k=${m}}^{${n}}(${aStr}${bPart})\\)。`);
        answers.push(
          `簡答：${result}。過程：拆分為 \\(\\sum_{k=1}^{${n}}(${aStr}${bPart})-\\sum_{k=1}^{${m - 1}}(${aStr}${bPart})\\)。前者 \\(=${fullSum}\\)，後者 \\(=${partSum}\\)，差為 \\(${result}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        // sum_{k=n+1}^{2n} k = n(3n+1)/2
        const n = randInt(5, 16);
        const result = (n * (3 * n + 1)) / 2;
        questions.push(
          `非標準上下界的 Sigma。計算 \\(\\sum_{k=${n + 1}}^{${2 * n}}k=${n + 1}+${n + 2}+\\cdots+${2 * n}\\)。`
        );
        answers.push(
          `簡答：${result}。過程：\\(\\sum_{k=n+1}^{2n}k=\\sum_{k=1}^{2n}k-\\sum_{k=1}^{n}k=\\dfrac{2n(2n+1)}{2}-\\dfrac{n(n+1)}{2}=\\dfrac{n(3n+1)}{2}\\)。代入 \\(n=${n}\\) 得 ${result}。`
        );
        continue;
      }

      if (mode === 3) {
        // sum_{k=m+1}^{n}(3k-1) using formula g(n) = n(3n+1)/2
        const m = [3, 4, 5, 6, 7, 8][randInt(0, 5)];
        const n = randInt(12, 26);
        // g(n) = sum_{k=1}^{n}(3k-1) = 3n(n+1)/2 - n = n(3n+1)/2
        const gn = (n * (3 * n + 1)) / 2;
        const gm = (m * (3 * m + 1)) / 2;
        const result = gn - gm;
        questions.push(
          `應用已知公式求部分和。已知 \\(\\sum_{k=1}^{n}(3k-1)=\\dfrac{n(3n+1)}{2}\\)，求 \\(\\sum_{k=${m + 1}}^{${n}}(3k-1)\\)。`
        );
        answers.push(
          `簡答：${result}。過程：\\(\\sum_{k=${m + 1}}^{${n}}(3k-1)=\\sum_{k=1}^{${n}}(3k-1)-\\sum_{k=1}^{${m}}(3k-1)\\)。代入公式得 \\(\\dfrac{${n}\\cdot${3 * n + 1}}{2}-\\dfrac{${m}\\cdot${3 * m + 1}}{2}=${gn}-${gm}=${result}\\)。`
        );
        continue;
      }

      // mode === 4: sum_{k=0}^{n-1}(ak+b) = a*(n-1)*n/2 + b*n (index from 0)
      const a = [2, 3, 4, 5][randInt(0, 3)];
      const b = randInt(0, 5);
      const n = randInt(7, 16);
      // sum_{k=0}^{n-1}(ak+b) = a*(n-1)*n/2 + b*n
      const result = (a * (n - 1) * n) / 2 + b * n;
      const aStr = a === 1 ? 'k' : `${a}k`;
      const bPart = b === 0 ? '' : `+${b}`;
      questions.push(`指標從 0 開始的 Sigma。計算 \\(\\sum_{k=0}^{${n - 1}}(${aStr}${bPart})\\)。`);
      answers.push(
        `簡答：${result}。過程：令 \\(j=k+1\\)，則 \\(\\sum_{k=0}^{n-1}(ak+b)=\\sum_{j=1}^{n}(a(j-1)+b)=a\\cdot\\dfrac{(n-1)n}{2}+bn\\)。代入 \\(a=${a},b=${b},n=${n}\\)，得 \\(${a}\\cdot${((n - 1) * n) / 2}+${b}\\cdot${n}=${result}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS211SequenceTransformationClassificationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const aTerm = (idx) => latexSub('a', idx);
    const bTerm = (idx) => latexSub('b', idx);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const base = [2, 3, 5][randInt(0, 2)];
        const d = pickNonZero(-4, 4);
        const ratio = d >= 0 ? `${base}^{${d}}` : `\\frac{1}{${base}^{${-d}}}`;
        questions.push(
          `設 \\(\\langle a_n\\rangle\\) 為等差數列，公差為 \\(d=${d}\\)，令 \\(b_n=${base}^{a_n}\\)。判斷 \\(\\langle b_n\\rangle\\) 是等差或等比數列，並求其公比或公差。`
        );
        answers.push(
          `簡答：\\(\\langle b_n\\rangle\\) 為等比數列，公比為 \\(${ratio}\\)。過程：\\(\\dfrac{b_{n+1}}{b_n}=\\dfrac{${base}^{a_{n+1}}}{${base}^{a_n}}=${base}^{a_{n+1}-a_n}=${base}^{${d}}\\)，相鄰兩項比值固定，所以是等比數列。`
        );
        continue;
      }

      if (mode === 1) {
        const d = pickNonZero(-5, 5);
        const c = pickNonZero(-4, 4);
        const k = randInt(-6, 6);
        const coefficientText = c === 1 ? '' : c === -1 ? '-' : `${c}`;
        const differenceText = c === 1 ? '(a_{n+1}-a_n)' : c === -1 ? '-(a_{n+1}-a_n)' : `${c}(a_{n+1}-a_n)`;
        const productText = c === 1 ? `${d}` : c === -1 ? `-(${d})` : `${c}\\cdot(${d})`;
        questions.push(
          `設 \\(\\langle a_n\\rangle\\) 為等差數列，公差為 \\(d=${d}\\)，令 \\(b_n=${coefficientText}a_n${k >= 0 ? '+' : ''}${k}\\)。判斷 \\(\\langle b_n\\rangle\\) 是否為等差數列，若是，求公差。`
        );
        answers.push(
          `簡答：是等差數列，公差為 \\(${c * d}\\)。過程：\\(b_{n+1}-b_n=${differenceText}=${productText}=${c * d}\\)，差固定。`
        );
        continue;
      }

      if (mode === 2) {
        const r = [2, 3, -2][randInt(0, 2)];
        const power = randInt(2, 4);
        questions.push(
          `設 \\(\\langle a_n\\rangle\\) 為每項皆非零的等比數列，公比為 \\(r=${r}\\)，令 \\(b_n=(a_n)^{${power}}\\)。判斷 \\(\\langle b_n\\rangle\\) 是否為等比數列，若是，求公比。`
        );
        answers.push(
          `簡答：是等比數列，公比為 \\(${powInt(r, power)}\\)。過程：\\(\\dfrac{b_{n+1}}{b_n}=\\left(\\dfrac{a_{n+1}}{a_n}\\right)^{${power}}=${r}^{${power}}=${powInt(r, power)}\\)，比值固定。`
        );
        continue;
      }

      if (mode === 3) {
        const d = pickNonZero(-4, 4);
        const add = pickNonZero(-3, 4);
        const addTerm = add === 1 ? '+n' : add === -1 ? '-n' : `${formatSignedAdd(add)}n`;
        questions.push(
          `設 \\(\\langle a_n\\rangle\\) 為等差數列，公差為 \\(${d}\\)，令 \\(b_n=a_n${addTerm}\\)。判斷 \\(\\langle b_n\\rangle\\) 是否為等差數列，若是，求公差。`
        );
        answers.push(
          `簡答：是等差數列，公差為 \\(${d + add}\\)。過程：\\(b_{n+1}-b_n=(a_{n+1}-a_n)${formatSignedAdd(add)}[(n+1)-n]=${d}${formatSignedAdd(add)}=${d + add}\\)。`
        );
        continue;
      }

      const r = [2, 3, -2][randInt(0, 2)];
      const multiplier = [2, 3, 4][randInt(0, 2)];
      questions.push(
        `設 \\(\\langle a_n\\rangle\\) 為等比數列，公比為 \\(${r}\\)，令 \\(b_n=${multiplier}^{n}a_n\\)。判斷 \\(\\langle b_n\\rangle\\) 是否為等比數列，若是，求公比。`
      );
      answers.push(
        `簡答：是等比數列，公比為 \\(${multiplier * r}\\)。過程：\\(\\dfrac{b_{n+1}}{b_n}=\\dfrac{${multiplier}^{n+1}a_{n+1}}{${multiplier}^{n}a_n}=${multiplier}\\cdot${r}=${multiplier * r}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS211RepeatedBlockSequenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    // 一般化的分組數列：第 m 段連續出現 m 個「a+(m-1)d」。
    // 當 a=1,d=1 時退化為經典的 (1,2,2,3,3,3,...)。
    const triangular = (g) => (g * (g + 1)) / 2;
    const blockSumThrough = (g, a, d) =>
      a * ((g * (g + 1)) / 2) + d * (((g - 1) * g * (g + 1)) / 3); // 前 T(g) 項總和

    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      const a = randInt(1, 4);
      const d = randInt(1, 4);
      const group = randInt(5, 14);
      const left = triangular(group - 1) + 1;
      const right = triangular(group);
      const blockValue = (j) => a + (j - 1) * d;
      const gv = blockValue(group);

      const prefix = [];
      for (let j = 1; j <= 4; j += 1) {
        for (let c = 0; c < j; c += 1) prefix.push(blockValue(j));
      }
      const seqText = `(${prefix.join(',')},\\ldots)`;
      const ruleText = `第 \\(m\\) 段連續出現 \\(m\\) 個 \\(${a}+(m-1)\\times${d}\\)`;

      if (mode === 0) {
        const index = randInt(left, right);
        questions.push(
          `數列 \\(\\langle a_n\\rangle=${seqText}\\) 的構成規則為：${ruleText}。求 \\(a_{${index}}\\)。`
        );
        answers.push(
          `簡答：\\(a_{${index}}=${gv}\\)。過程：到第 ${group - 1} 段為止共有 \\(1+2+\\cdots+${group - 1}=${left - 1}\\) 項，到第 ${group} 段為止共有 ${right} 項，所以第 ${index} 項落在第 ${group} 段，其值為 \\(${a}+(${group}-1)\\times${d}=${gv}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        questions.push(
          `分組數列 \\(${seqText}\\)（${ruleText}）中，若 \\(a_n=${gv}\\)，求所有可能的 \\(n\\) 範圍。`
        );
        answers.push(
          `簡答：\\(${left}\\le n\\le${right}\\)。過程：值 ${gv} 由 \\(${a}+(m-1)\\times${d}=${gv}\\) 解得為第 ${group} 段，佔第 ${left} 項到第 ${right} 項。`
        );
        continue;
      }

      if (mode === 2) {
        const total = blockSumThrough(group, a, d);
        questions.push(
          `分組數列 \\(${seqText}\\)（${ruleText}）中，求前 \\(${right}\\) 項的和。`
        );
        answers.push(
          `簡答：${total}。過程：前 ${right} 項剛好到第 ${group} 段結束。以「每段的值乘以個數」求和：\\(\\sum_{j=1}^{${group}} j[${a}+(j-1)${d}]=${a}\\cdot\\dfrac{${group}(${group}+1)}{2}+${d}\\cdot\\dfrac{(${group}-1)${group}(${group}+1)}{3}=${total}\\)。`
        );
        continue;
      }

      const extra = randInt(1, group);
      const index = left + extra - 1;
      const previousSum = blockSumThrough(group - 1, a, d);
      const partial = previousSum + extra * gv;
      questions.push(
        `分組數列 \\(${seqText}\\)（${ruleText}）中，求前 \\(${index}\\) 項的和。`
      );
      answers.push(
        `簡答：${partial}。過程：先加完前 ${group - 1} 段（共 ${left - 1} 項），和為 ${previousSum}。第 ${index} 項落在第 ${group} 段，再加上 ${extra} 個 ${gv}，故總和為 \\(${previousSum}+${extra}\\times${gv}=${partial}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS212ConsecutiveCubeRangeSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const start = randInt(3, 30);
      const end = start + randInt(4, 18);
      const sumToEnd = ((end * (end + 1)) / 2) ** 2;
      const before = (((start - 1) * start) / 2) ** 2;
      const result = sumToEnd - before;
      questions.push(`利用立方和公式，計算 \\(${start}^3+${start + 1}^3+\\cdots+${end}^3\\)。`);
      answers.push(
        `簡答：${result}。過程：\\(1^3+2^3+\\cdots+n^3=\\left[\\dfrac{n(n+1)}2\\right]^2\\)。所以所求為 \\(\\left[\\dfrac{${end}\\cdot${end + 1}}2\\right]^2-\\left[\\dfrac{${start - 1}\\cdot${start}}2\\right]^2=${sumToEnd}-${before}=${result}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS212GeometricPartialSumExtensionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const firstSum = randInt(5, 60);
      const rn = randInt(2, 8);
      const secondSum = firstSum * (1 + rn);
      const thirdSum = firstSum * (1 + rn + rn * rn);

      if (variant === 1) {
        // 已知 Sn、S2n，求 S4n
        const fourthSum = firstSum * (1 + rn + rn * rn + rn * rn * rn);
        questions.push(
          `一等比級數的前 \\(n\\) 項和為 \\(S_n=${firstSum}\\)，前 \\(2n\\) 項和為 \\(S_{2n}=${secondSum}\\)。求前 \\(4n\\) 項和 \\(S_{4n}\\)。`
        );
        answers.push(
          `簡答：\\(S_{4n}=${fourthSum}\\)。過程：由 \\(S_{2n}=S_n(1+r^n)\\)，即 ${secondSum}=${firstSum}(1+r^n)，得 \\(r^n=${rn}\\)。因此 \\(S_{4n}=S_n(1+r^n+r^{2n}+r^{3n})=${firstSum}(1+${rn}+${rn * rn}+${rn * rn * rn})=${fourthSum}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        // 已知 Sn、S2n，求第三段 a_{2n+1}+...+a_{3n}
        const blockThree = firstSum * rn * rn;
        questions.push(
          `一等比級數的前 \\(n\\) 項和為 \\(S_n=${firstSum}\\)，前 \\(2n\\) 項和為 \\(S_{2n}=${secondSum}\\)。求第三段 \\(a_{2n+1}+a_{2n+2}+\\cdots+a_{3n}\\)。`
        );
        answers.push(
          `簡答：${blockThree}。過程：由 \\(S_{2n}=S_n(1+r^n)\\) 得 \\(r^n=${rn}\\)。連續 \\(n\\) 項一段的和呈公比 \\(r^n\\) 的等比數列，第三段和 \\(=r^{2n}S_n=${rn * rn}\\times${firstSum}=${blockThree}\\)。`
        );
        continue;
      }

      questions.push(
        `一等比級數的前 \\(n\\) 項和為 \\(S_n=${firstSum}\\)，前 \\(2n\\) 項和為 \\(S_{2n}=${secondSum}\\)。求前 \\(3n\\) 項和 \\(S_{3n}\\)。`
      );
      answers.push(
        `簡答：\\(S_{3n}=${thirdSum}\\)。過程：設公比為 \\(r\\)，則第二段 \\(a_{n+1}+\\cdots+a_{2n}=r^nS_n\\)，所以 \\(S_{2n}=S_n(1+r^n)\\)。由 ${secondSum}=${firstSum}(1+r^n) 得 \\(r^n=${rn}\\)。因此 \\(S_{3n}=S_n(1+r^n+r^{2n})=${firstSum}(1+${rn}+${rn * rn})=${thirdSum}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS213InductionSumStepSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const form = randInt(0, 3);

      if (form === 1) {
        // Σ (c·i^2 + p) = c·n(n+1)(2n+1)/6 + p·n
        const c = randInt(1, 5);
        const p = pickNonZero(-6, 9);
        const cs = c === 1 ? '' : `${c}`;
        const term = `${c === 1 ? 'i^2' : `${c}i^2`}${formatSignedAdd(p)}`;
        const formula = `\\dfrac{${cs}n(n+1)(2n+1)}{6}${formatSignedAdd(p)}n`;
        questions.push(
          `用數學歸納法證明 \\(\\sum_{i=1}^{n}(${term})=${formula}\\)。若已假設 \\(n=k\\) 時成立，請完成 \\(n=k+1\\) 的關鍵推導。`
        );
        answers.push(
          `簡答：\\(S_{k+1}=\\dfrac{${cs}(k+1)(k+2)(2k+3)}{6}${formatSignedAdd(p)}(k+1)\\)。過程：由歸納假設 \\(S_k=\\dfrac{${cs}k(k+1)(2k+1)}{6}${formatSignedAdd(p)}k\\)，加上第 \\(k+1\\) 項 \\(${cs}(k+1)^2${formatSignedAdd(p)}\\)。二次部分 \\(\\dfrac{${cs}k(k+1)(2k+1)}{6}+${cs}(k+1)^2=\\dfrac{${cs}(k+1)(k+2)(2k+3)}{6}\\)，常數部分 \\(${p}k${formatSignedAdd(p)}=${p}(k+1)\\)，合併即為公式中 \\(n\\) 換成 \\(k+1\\)。`
        );
        continue;
      }

      if (form === 2) {
        // Σ (c·i^3 + p) = c·[n(n+1)/2]^2 + p·n
        const c = randInt(1, 5);
        const p = pickNonZero(-6, 9);
        const cs = c === 1 ? '' : `${c}`;
        const term = `${c === 1 ? 'i^3' : `${c}i^3`}${formatSignedAdd(p)}`;
        const formula = `${cs}\\left[\\dfrac{n(n+1)}{2}\\right]^2${formatSignedAdd(p)}n`;
        questions.push(
          `用數學歸納法證明 \\(\\sum_{i=1}^{n}(${term})=${formula}\\)。若已假設 \\(n=k\\) 時成立，請完成 \\(n=k+1\\) 的關鍵推導。`
        );
        answers.push(
          `簡答：\\(S_{k+1}=${cs}\\left[\\dfrac{(k+1)(k+2)}{2}\\right]^2${formatSignedAdd(p)}(k+1)\\)。過程：由歸納假設 \\(S_k=${cs}\\left[\\dfrac{k(k+1)}{2}\\right]^2${formatSignedAdd(p)}k\\)，加上第 \\(k+1\\) 項 \\(${cs}(k+1)^3${formatSignedAdd(p)}\\)。三次部分 \\(${cs}(k+1)^2\\left[\\dfrac{k^2}{4}+(k+1)\\right]=${cs}\\left[\\dfrac{(k+1)(k+2)}{2}\\right]^2\\)，常數部分 \\(${p}k${formatSignedAdd(p)}=${p}(k+1)\\)，合併即為公式中 \\(n\\) 換成 \\(k+1\\)。`
        );
        continue;
      }

      if (form === 3) {
        // Σ (i(i+e) + p) = n(n+1)(2n+1+3e)/6 + p·n
        const e = randInt(1, 5);
        const p = pickNonZero(-6, 9);
        const term = `i(i+${e})${formatSignedAdd(p)}`;
        const formula = `\\dfrac{n(n+1)(2n${formatSignedAdd(1 + 3 * e)})}{6}${formatSignedAdd(p)}n`;
        questions.push(
          `用數學歸納法證明 \\(\\sum_{i=1}^{n}(${term})=${formula}\\)。若已假設 \\(n=k\\) 時成立，請完成 \\(n=k+1\\) 的關鍵推導。`
        );
        answers.push(
          `簡答：\\(S_{k+1}=\\dfrac{(k+1)(k+2)(2k${formatSignedAdd(3 + 3 * e)})}{6}${formatSignedAdd(p)}(k+1)\\)。過程：由歸納假設 \\(S_k=\\dfrac{k(k+1)(2k${formatSignedAdd(1 + 3 * e)})}{6}${formatSignedAdd(p)}k\\)，加上第 \\(k+1\\) 項 \\((k+1)(k+1+${e})${formatSignedAdd(p)}\\)。乘積部分 \\(\\dfrac{(k+1)[k(2k${formatSignedAdd(1 + 3 * e)})+6(k+1+${e})]}{6}=\\dfrac{(k+1)(k+2)(2k${formatSignedAdd(3 + 3 * e)})}{6}\\)，常數部分 \\(${p}k${formatSignedAdd(p)}=${p}(k+1)\\)，合併即為公式中 \\(n\\) 換成 \\(k+1\\)。`
        );
        continue;
      }

      // form 0：一次型 Σ(ai+b)
      const a = randInt(2, 10);
      const b = randInt(-8, 10);
      const term = `${a}i${b >= 0 ? '+' : ''}${b}`;
      const formula = `\\frac{n(${a}n${formatSignedAdd(a + 2 * b)})}{2}`;
      const nextConst = a + 2 * b;
      const targetConst = 2 * a + 2 * b;
      questions.push(
        `用數學歸納法證明 \\(\\sum_{i=1}^{n}(${term})=${formula}\\)。若已假設 \\(n=k\\) 時成立，請完成 \\(n=k+1\\) 的關鍵推導。`
      );
      answers.push(
        `簡答：\\(S_{k+1}=\\dfrac{(k+1)(${a}k${formatSignedAdd(targetConst)})}{2}\\)。過程：由歸納假設 \\(S_k=\\dfrac{k(${a}k${formatSignedAdd(nextConst)})}{2}\\)，所以 \\(S_{k+1}=S_k+[${a}(k+1)${formatSignedAdd(b)}]=\\dfrac{k(${a}k${formatSignedAdd(nextConst)})}{2}+${a}k${formatSignedAdd(a + b)}\\)。整理得 \\(\\dfrac{(k+1)(${a}k${formatSignedAdd(targetConst)})}{2}\\)，這正是把公式中的 \\(n\\) 換成 \\(k+1\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS213InductionDivisibilityStepSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const m = [3, 5, 7, 11][randInt(0, 3)];
      const q = randInt(1, 5);
      const base = m * q + 1;
      let A = randInt(2, 30);
      while (A % m === 0) A = randInt(2, 30);
      const C = (m - (A % m)) % m;
      questions.push(
        `試用數學歸納法證明：對所有正整數 \\(n\\)，\\(${A}\\cdot${base}^n+${C}\\) 為 \\(${m}\\) 的倍數。若已假設 \\(n=k\\) 時成立，請寫出 \\(n=k+1\\) 的關鍵推導。`
      );
      answers.push(
        `簡答：\\(${A}\\cdot${base}^{k+1}+${C}\\) 也是 \\(${m}\\) 的倍數。過程：\\(${A}\\cdot${base}^{k+1}+${C}=${base}(${A}\\cdot${base}^{k}+${C})-${C}(${base}-1)\\)。第一項因歸納假設為 \\(${m}\\) 的倍數；第二項含有 \\(${base}-1=${base - 1}\\)，也是 \\(${m}\\) 的倍數。因此兩項相減仍為 \\(${m}\\) 的倍數。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS213InductionRecurrenceConjectureSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const r = [2, 3, 4, 5][randInt(0, 3)];
      const fixed = randInt(-9, 12);
      let a1 = randInt(-9, 24);
      while (a1 === fixed) a1 = randInt(-9, 24);
      const c = (1 - r) * fixed;
      const coefficient = a1 - fixed;
      const formula = `${fixed}${coefficient >= 0 ? '+' : ''}${coefficient}\\cdot${r}^{n-1}`;
      questions.push(
        `數列 \\(\\langle a_n\\rangle\\) 滿足 \\(a_1=${a1}\\)，\\(a_{n+1}=${r}a_n${c >= 0 ? '+' : ''}${c}\\)。請觀察並用數學歸納法驗證一般項 \\(a_n=${formula}\\)。`
      );
      answers.push(
        `簡答：\\(a_n=${formula}\\)。過程：當 \\(n=1\\) 時，右式為 \\(${fixed}${coefficient >= 0 ? '+' : ''}${coefficient}=${a1}\\)，成立。假設 \\(a_k=${fixed}${coefficient >= 0 ? '+' : ''}${coefficient}\\cdot${r}^{k-1}\\)，則 \\(a_{k+1}=${r}a_k${c >= 0 ? '+' : ''}${c}=${r}[${fixed}${coefficient >= 0 ? '+' : ''}${coefficient}\\cdot${r}^{k-1}]${c >= 0 ? '+' : ''}${c}=${fixed}${coefficient >= 0 ? '+' : ''}${coefficient}\\cdot${r}^{k}\\)，所以 \\(n=k+1\\) 成立。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function s21FactorText(root) {
    if (root === 0) return 'x';
    return `x${root > 0 ? '-' : '+'}${Math.abs(root)}`;
  }

  function buildS211ArithmeticCommonTermsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const d1 = [3, 4, 5, 6][randInt(0, 3)];
      const d2 = [5, 6, 7, 8][randInt(0, 3)];
      const step = lcm(d1, d2);
      const seedCommon = randInt(8, 24);
      const seedCount = randInt(4, 8);
      const a1 = seedCommon - randInt(0, 2) * d1;
      const b1 = seedCommon - randInt(0, 2) * d2;
      const limit = seedCommon + (seedCount - 1) * step + randInt(0, step - 1);
      // 依實際 a1,b1,d1,d2 計算真正的共同項，避免 a1/b1 造成比 seedCommon 更早的共同項
      let firstCommon = seedCommon;
      for (let x = Math.max(a1, b1); x <= Math.max(a1, b1) + step; x += 1) {
        if ((x - a1) % d1 === 0 && (x - b1) % d2 === 0) {
          firstCommon = x;
          break;
        }
      }
      let commonCount = 0;
      let lastCommon = firstCommon;
      let sum = 0;
      for (let x = firstCommon; x <= limit; x += step) {
        lastCommon = x;
        commonCount += 1;
        sum += x;
      }
      const commonDiffText = `${lastCommon}-${firstCommon < 0 ? `(${firstCommon})` : firstCommon}`;
      const firstPositiveCommon =
        firstCommon < 1 ? firstCommon + Math.ceil((1 - firstCommon) / step) * step : firstCommon;
      const positiveCommonCount =
        firstPositiveCommon > limit ? 0 : Math.floor((limit - firstPositiveCommon) / step) + 1;
      const lastPositiveCommon =
        positiveCommonCount > 0 ? firstPositiveCommon + (positiveCommonCount - 1) * step : null;

      if (i % 3 === 0) {
        questions.push(
          `兩個等差數列 \\(A:\\ ${a1},${a1 + d1},${a1 + 2 * d1},\\ldots\\) 與 \\(B:\\ ${b1},${b1 + d2},${b1 + 2 * d2},\\ldots\\)，求不超過 ${limit} 的共同項個數與總和。`
        );
        answers.push(
          `簡答：共同項 ${commonCount} 個，總和 ${sum}。過程：共同項仍成等差數列，公差為 \\(\\operatorname{lcm}(${d1},${d2})=${step}\\)。第一個共同項為 ${firstCommon}，最後一個共同項為 ${lastCommon}，所以個數 \\(=\\frac{${commonDiffText}}{${step}}+1=${commonCount}\\)，總和 \\(=\\frac{${commonCount}(${firstCommon}+${lastCommon})}{2}=${sum}\\)。`
        );
        continue;
      }

      if (i % 3 === 1) {
        const targetIndex = randInt(2, commonCount);
        const target = firstCommon + (targetIndex - 1) * step;
        questions.push(
          `兩等差數列的共同項依序排成 \\(\\langle c_n\\rangle\\)。若共同項的第一項為 ${firstCommon}，且兩原數列公差分別為 ${d1}、${d2}，求 \\(c_{${targetIndex}}\\)。`
        );
        answers.push(
          `簡答：\\(c_{${targetIndex}}=${target}\\)。過程：共同項公差為兩公差的最小公倍數 \\(\\operatorname{lcm}(${d1},${d2})=${step}\\)。因此 \\(c_n=${firstCommon}+(n-1)${step}\\)，代入 \\(n=${targetIndex}\\)，得 ${target}。`
        );
        continue;
      }

      questions.push(
        `在 1 到 ${limit} 之間，同時屬於等差數列 \\(${a1},${a1 + d1},${a1 + 2 * d1},\\ldots\\) 與 \\(${b1},${b1 + d2},${b1 + 2 * d2},\\ldots\\) 的數共有幾個？`
      );
      answers.pushWithSummary(
        `${positiveCommonCount} 個`,
        `過程：在正整數範圍內，第一個共同項為 ${firstPositiveCommon}，之後每隔 \\(\\operatorname{lcm}(${d1},${d2})=${step}\\) 出現一次。到 ${limit} 前最後共同項為 ${lastPositiveCommon}，所以共有 \\(\\frac{${lastPositiveCommon}-${firstPositiveCommon}}{${step}}+1=${positiveCommonCount}\\) 個。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS211GeometricProductSymmetrySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const aTerm = (idx) => latexSub('a', idx);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const a1 = randInt(1, 5);
        const r = [2, 3][randInt(0, 1)];
        const p = randInt(3, 6);
        const q = p + randInt(4, 8);
        const midSum = p + q;
        let left = randInt(1, midSum - 2);
        while (left === p || left === q) left = randInt(1, midSum - 2);
        const right = midSum - left;
        const value = a1 * a1 * powInt(r, p + q - 2);
        questions.push(
          `等比數列 \\(\\langle a_n\\rangle\\) 中，若 \\(${aTerm(p)}\\cdot ${aTerm(q)}=${value}\\)，求 \\(${aTerm(left)}\\cdot ${aTerm(right)}\\)。`
        );
        answers.push(
          `簡答：${value}。過程：等比數列中，兩項下標和相同，乘積就相同。因為 \\(${p}+${q}=${left}+${right}=${midSum}\\)，所以 \\(${aTerm(left)}\\cdot ${aTerm(right)}=${aTerm(p)}\\cdot ${aTerm(q)}=${value}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        const center = randInt(4, 11);
        const aCenter = [2, 3, 4, 5, 6, 7, 8, 9][randInt(0, 7)];
        const value = aCenter ** 2;
        questions.push(
          `正項等比數列中，若 \\(${aTerm(center - 2)}\\cdot ${aTerm(center + 2)}=${value}\\)，求 \\(${aTerm(center)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(center)}=${aCenter}\\)。過程：等比數列的對稱乘積滿足 \\(a_{${center - 2}}a_{${center + 2}}=a_{${center}}^2\\)。又各項為正，所以 \\(${aTerm(center)}=\\sqrt{${value}}=${aCenter}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        const n = [7, 9, 11, 13][randInt(0, 3)];
        const center = (n + 1) / 2;
        const midValue = [2, 3, 4, 5][randInt(0, 3)];
        const product = midValue ** n;
        questions.push(
          `正項等比數列共有 ${n} 項，且中間項 \\(${aTerm(center)}=${midValue}\\)。求 \\(a_1 a_2\\cdots a_{${n}}\\)。`
        );
        answers.push(
          `簡答：${product}。過程：首末對稱的乘積都等於中間項平方，全部 ${n} 項的乘積等於 \\(a_{${center}}^{${n}}=${midValue}^{${n}}=${product}\\)。`
        );
        continue;
      }

      if (mode === 3) {
        const r = [2, 3][randInt(0, 1)];
        const a1 = randInt(1, 5);
        const m = randInt(4, 9);
        const n = m + [2, 4, 6][randInt(0, 2)];
        const am = a1 * powInt(r, m - 1);
        const an = a1 * powInt(r, n - 1);
        const mid = (m + n) / 2;
        const product = am * an;
        questions.push(
          `正項等比數列中，\\(${aTerm(m)}=${am}\\)、\\(${aTerm(n)}=${an}\\)。若下標 ${m} 與 ${n} 的平均為 ${mid}，求 \\(${aTerm(mid)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(mid)}=${Math.sqrt(product)}\\)。過程：等比數列中 \\(a_m a_n=a_{\\frac{m+n}{2}}^2\\)。所以 \\(${aTerm(mid)}=\\sqrt{${am}\\cdot${an}}=${Math.sqrt(product)}\\)。`
        );
        continue;
      }

      const n = randInt(4, 10);
      const r = [2, 3][randInt(0, 1)];
      const a1 = randInt(1, 5);
      const aN = a1 * powInt(r, n - 1);
      const product = a1 * aN;
      questions.push(
        `等比數列共有 ${n} 項，首項為 ${a1}，末項為 ${aN}。求 \\(a_1 a_n\\)、\\(a_2a_{n-1}\\) 是否相等，並求其值。`
      );
      answers.push(
        `簡答：相等，值為 ${product}。過程：等比數列首末對稱兩項的下標和相同，所以 \\(a_1 a_n=a_2a_{n-1}=\\cdots\\)。本題 \\(a_1 a_n=${a1}\\cdot${aN}=${product}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS211ArithmeticGeometricBridgeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;

      if (mode < 2) {
        const aPools = [
          [4, 8, 12, 16, 20],
          [5, 9, 13, 17, 21],
          [6, 10, 14, 18, 22],
          [7, 11, 15, 19, 23],
          [24, 28, 32, 36, 40],
        ];
        const aPool = aPools[i % aPools.length];
        const a = aPool[randInt(0, aPool.length - 1)];
        const r = [3, 4][randInt(0, 1)];
        const b = a * r;
        const left = 2 * a - b;
        const right = b * r;
        if (left === 0) {
          i -= 1;
          continue;
        }
        const candidates = [];
        for (let x = -80; x <= 160; x += 1) {
          const y = 2 * x - left;
          if (x !== 0 && x * right === y * y) candidates.push([x, y]);
        }
        const candidateText = candidates.map(([x, y]) => `(${x},${y})`).join('，');
        const linearText = `2x${formatSignedAdd(-left)}`;
        questions.push(
          `四數 ${left},\\ x,\\ y,\\ ${right} 中，\\(x,y\\) 為整數。前三數成等差數列，後三數成等比數列，求所有可能的 \\((x,y)\\)。`
        );
        answers.push(
          `簡答：${candidateText}。過程：前三數成等差，所以 \\(2x=${left}+y\\)，即 \\(y=${linearText}\\)。後三數成等比，所以 \\(y^2=x\\cdot${right}\\)。代入後解整數解，可得 ${candidateText}。`
        );
        continue;
      }

      const parameterSets =
        mode === 2
          ? [
              [4, 2],
              [6, 3],
              [8, 2],
              [9, 3],
              [12, 3],
              [16, 2],
            ]
          : [
              [6, 2],
              [10, 2],
              [12, 2],
              [15, 3],
              [18, 3],
              [20, 2],
            ];
      const [a, r] = parameterSets[randInt(0, parameterSets.length - 1)];
      const left = a / r;
      const b = a * r;
      const right = 2 * b - a;
      const candidates = [];
      for (let x = -80; x <= 160; x += 1) {
        for (let y = -80; y <= 200; y += 1) {
          if (x * x === left * y && 2 * y === x + right) candidates.push([x, y]);
        }
      }
      const candidateText = candidates.map(([x, y]) => `(${x},${y})`).join('，');
      const leftY = left === 1 ? 'y' : left === -1 ? '-y' : `${left}y`;
      questions.push(
        `四數 ${left},\\ x,\\ y,\\ ${right} 中，\\(x,y\\) 為整數。前三數成等比數列，後三數成等差數列，求所有可能的 \\((x,y)\\)。`
      );
      answers.push(
        `簡答：${candidateText}。過程：前三數成等比給 \\(x^2=${leftY}\\)；後三數成等差給 \\(2y=x+${right}\\)。聯立求整數解，得 ${candidateText}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS211PrefixProductTermSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const aTerm = (idx) => latexSub('a', idx);

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const n = randInt(4, 9);
        const target = (n * n) / ((n - 1) * (n - 1));
        questions.push(`數列 \\(\\langle a_n\\rangle\\) 滿足 \\(a_1 a_2\\cdots a_n=n^2\\)。求 \\(${aTerm(n)}\\)。`);
        answers.push(
          `簡答：\\(${aTerm(n)}=${formatFraction(n * n, (n - 1) * (n - 1))}\\)。過程：\\(a_n=\\dfrac{a_1 a_2\\cdots a_n}{a_1 a_2\\cdots a_{n-1}}=\\dfrac{n^2}{(n-1)^2}\\)。代入 \\(n=${n}\\)，得 \\(${formatFraction(n * n, (n - 1) * (n - 1))}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        const n = randInt(4, 8);
        questions.push(
          `數列 \\(\\langle a_n\\rangle\\) 滿足 \\(a_1 a_2\\cdots a_n=2^n\\cdot n\\)。求 \\(${aTerm(n)}\\)。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${formatFraction(2 * n, n - 1)}\\)。過程：\\(a_n=\\dfrac{2^n n}{2^{n-1}(n-1)}=\\dfrac{2n}{n-1}\\)。代入 \\(n=${n}\\)，得 \\(${formatFraction(2 * n, n - 1)}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        const n = randInt(5, 10);
        questions.push(`數列 \\(\\langle a_n\\rangle\\) 滿足 \\(a_1 a_2\\cdots a_n=n!\\)。求 \\(${aTerm(n)}\\)。`);
        answers.push(`簡答：\\(${aTerm(n)}=${n}\\)。過程：\\(a_n=\\dfrac{n!}{(n-1)!}=n\\)，所以第 ${n} 項為 ${n}。`);
        continue;
      }

      if (mode === 3) {
        const n = randInt(4, 8);
        const a = (n * n) / ((n - 1) * (n - 1));
        const b = ((n + 2) * (n + 2)) / ((n + 1) * (n + 1));
        const product = makeFraction((n + 2) * (n + 2), (n - 1) * (n - 1));
        questions.push(`若 \\(a_1 a_2\\cdots a_n=n^2\\)，求 \\(${aTerm(n)}\\cdots ${aTerm(n + 2)}\\)。`);
        answers.push(
          `簡答：\\(${formatFraction(product.num, product.den)}\\)。過程：\\(${aTerm(n)}\\cdots ${aTerm(n + 2)}=\\dfrac{a_1\\cdots a_{${n + 2}}}{a_1\\cdots a_{${n - 1}}}=\\dfrac{${n + 2}^2}{${n - 1}^2}=${formatFraction(product.num, product.den)}\\)。`
        );
        continue;
      }

      const n = randInt(4, 8);
      questions.push(`數列 \\(\\langle a_n\\rangle\\) 滿足 \\(a_1 a_2\\cdots a_n=n(n+1)\\)。求一般項 \\(a_n\\)。`);
      answers.push(
        `簡答：\\(a_n=\\frac{n+1}{n-1}\\ (n\\ge2)\\)，且 \\(a_1=2\\)。過程：當 \\(n\\ge2\\)，\\(a_n=\\dfrac{n(n+1)}{(n-1)n}=\\dfrac{n+1}{n-1}\\)。例如 \\(${aTerm(n)}=${formatFraction(n + 1, n - 1)}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS212ArithmeticEndBlockCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const m = randInt(3, 5);
      const n = randInt(11, 24);
      const a1 = randInt(2, 20);
      const d = randInt(2, 8);
      const firstBlock = apSum(a1, d, m);
      const lastStart = a1 + (n - m) * d;
      const lastBlock = apSum(lastStart, d, m);
      const total = apSum(a1, d, n);

      if (i % 3 === 0) {
        questions.push(
          `一等差數列的前 ${m} 項和為 ${firstBlock}，最後 ${m} 項和為 ${lastBlock}，所有項之和為 ${total}，求此數列共有幾項。`
        );
        answers.push(
          `簡答：${n} 項。過程：前 ${m} 項和加上後 ${m} 項和為 \\(m(a_1+a_n)\\)，所以 \\(a_1+a_n=\\frac{${firstBlock}+${lastBlock}}{${m}}\\)。總和 \\(S_n=\\frac{n(a_1+a_n)}2=${total}\\)，故 \\(n=\\frac{2\\cdot${total}}{(${firstBlock}+${lastBlock})/${m}}=${n}\\)。`
        );
        continue;
      }

      if (i % 3 === 1) {
        const sumPair = a1 + (a1 + (n - 1) * d);
        questions.push(
          `一等差數列共有 ${n} 項，前 ${m} 項和為 ${firstBlock}，最後 ${m} 項和為 ${lastBlock}，求全數列總和。`
        );
        answers.push(
          `簡答：${total}。過程：前 ${m} 項和加後 ${m} 項和等於 \\(m(a_1+a_n)\\)，所以 \\(a_1+a_n=\\frac{${firstBlock}+${lastBlock}}{${m}}=${sumPair}\\)。全數列和 \\(S_n=\\frac{${n}(${sumPair})}{2}=${total}\\)。`
        );
        continue;
      }

      questions.push(
        `一等差數列前 ${m} 項和與最後 ${m} 項和分別為 ${firstBlock}、${lastBlock}。若全數列和為 ${total}，利用端項配對求項數。`
      );
      answers.push(
        `簡答：${n} 項。過程：等差數列端項配對可知 \\(S_n=\\frac{n(a_1+a_n)}2\\)。又前後各 ${m} 項合計為 \\(${m}(a_1+a_n)=${firstBlock + lastBlock}\\)，所以 \\(a_1+a_n=${(firstBlock + lastBlock) / m}\\)。代回總和即可得 \\(n=${n}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS213PeriodicRemainderSequenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function powMod(base, exponent, mod) {
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

    function cycleFor(base, mod) {
      const seen = new Map();
      const cycle = [];
      let value = ((base % mod) + mod) % mod;
      while (!seen.has(value)) {
        seen.set(value, cycle.length);
        cycle.push(value);
        value = (value * base) % mod;
      }
      return cycle.slice(seen.get(value));
    }

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const base = [3, 4, 7][randInt(0, 2)];
        const mod = [7, 10, 11][randInt(0, 2)];
        const n = randInt(40, 150);
        const answer = powMod(base, n, mod);
        const cycle = cycleFor(base, mod);
        questions.push(`設 \\(a_n\\) 為 \\(${base}^n\\) 除以 ${mod} 的餘數，求 \\(a_{${n}}\\)。`);
        answers.push(
          `簡答：${answer}。過程：\\(${base}^n\\) 除以 ${mod} 的餘數循環為 ${cycle.join('，')}，週期為 ${cycle.length}。因為 \\(${n}\\) 對週期取餘後落在第 ${((n - 1) % cycle.length) + 1} 個位置，所以 \\(a_{${n}}=${answer}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        const base = [3, 7][randInt(0, 1)];
        const mod = 10;
        const n = randInt(16, 60);
        const cycle = cycleFor(base, mod);
        const full = Math.floor(n / cycle.length);
        const rem = n % cycle.length;
        const sum =
          full * cycle.reduce((acc, value) => acc + value, 0) +
          cycle.slice(0, rem).reduce((acc, value) => acc + value, 0);
        questions.push(`設 \\(a_n\\) 為 \\(${base}^n\\) 的個位數，求 \\(a_1+a_2+\\cdots+a_{${n}}\\)。`);
        answers.push(
          `簡答：${sum}。過程：個位數循環為 ${cycle.join('，')}，一輪和為 ${cycle.reduce((acc, value) => acc + value, 0)}，週期 ${cycle.length}。前 ${n} 項包含 ${full} 輪又 ${rem} 項，所以總和為 ${sum}。`
        );
        continue;
      }

      if (mode === 2) {
        const n = randInt(20, 100);
        const answer = (powMod(5, 2 * n, 22) - powMod(3, n, 22) + 22) % 22;
        questions.push(`求 \\(5^{2\\cdot${n}}-3^{${n}}\\) 除以 22 的餘數。`);
        answers.push(
          `簡答：${answer}。過程：分別看模 22 的餘數循環。\\(5^{2n}=25^n\\equiv3^n\\pmod{22}\\)，所以 \\(5^{2n}-3^n\\equiv0\\pmod{22}\\)。本題餘數為 ${answer}。`
        );
        continue;
      }

      if (mode === 3) {
        const base = [2, 3, 5][randInt(0, 2)];
        const modChoices = base === 3 ? [7, 13] : [7, 9, 13];
        const mod = modChoices[randInt(0, modChoices.length - 1)];
        const n = randInt(30, 120);
        const answer = (powMod(base, n + 1, mod) - powMod(base, n, mod) + mod) % mod;
        const cycle = cycleFor(base, mod);
        questions.push(`設 \\(b_n=${base}^{n+1}-${base}^{n}\\)。求 \\(b_{${n}}\\) 除以 ${mod} 的餘數。`);
        answers.push(
          `簡答：${answer}。過程：\\(b_n=${base}^n(${base}-1)\\)，只要判斷 \\(${base}^n\\) 模 ${mod} 的循環。其餘數循環為 ${cycle.join('，')}，代入 \\(n=${n}\\) 可得餘數 ${answer}。`
        );
        continue;
      }

      const base = [2, 4, 6][randInt(0, 2)];
      const mod = [5, 7, 11][randInt(0, 2)];
      const n = randInt(30, 90);
      const answer = powMod(base, 2 * n + 1, mod);
      questions.push(`求 \\(${base}^{2n+1}\\) 在 \\(n=${n}\\) 時除以 ${mod} 的餘數。`);
      answers.push(
        `簡答：${answer}。過程：先把指數化為 \\(2n+1=${2 * n + 1}\\)，再用快速循環判斷 \\(${base}^{${2 * n + 1}}\\) 模 ${mod} 的餘數，得到 ${answer}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function combinationCount(n, r) {
    if (r < 0 || r > n) return 0;
    const m = Math.min(r, n - r);
    let numerator = 1;
    let denominator = 1;
    for (let k = 1; k <= m; k += 1) {
      numerator *= n - m + k;
      denominator *= k;
    }
    return numerator / denominator;
  }

  function countMultiplesInRange(start, end, divisor) {
    return Math.floor(end / divisor) - Math.floor((start - 1) / divisor);
  }

  function listCompetitionPaths(needA, needB) {
    const paths = [];
    function walk(a, b, path) {
      if (a === needA || b === needB) {
        paths.push(path);
        return;
      }
      walk(a + 1, b, `${path}甲`);
      walk(a, b + 1, `${path}乙`);
    }
    walk(0, 0, '');
    return paths;
  }

  function countCoinWays(target, coins) {
    let count = 0;
    function walk(index, remain) {
      if (index === coins.length - 1) {
        if (remain % coins[index] === 0) count += 1;
        return;
      }
      for (let amount = 0; amount <= remain; amount += coins[index]) {
        walk(index + 1, remain - amount);
      }
    }
    walk(0, target);
    return count;
  }

  function countNumbersContainingDigitUpTo999(digit) {
    if (digit === 0) return 171;
    return 999 - (Math.pow(9, 3) - 1);
  }

  function buildS221InclusionExclusionApplicationsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = randInt(0, 29);

      if (variant === 0) {
        const total = 46 + (cycle % 5) * 2;
        const math = 30 + (cycle % 5);
        const english = 28 + ((cycle * 2) % 5);
        const both = 18 + (cycle % 4);
        const atLeastOne = math + english - both;
        const neither = total - atLeastOne;
        questions.push(
          `某班 ${total} 人，數學及格 ${math} 人，英文及格 ${english} 人，兩科都及格 ${both} 人。求至少一科及格的人數與兩科都不及格的人數。`
        );
        answers.push(
          `簡答：至少一科及格 ${atLeastOne} 人；兩科都不及格 ${neither} 人。過程：由取捨原理，至少一科及格為 ${math}+${english}-${both}=${atLeastOne}。全班共有 ${total} 人，所以兩科都不及格為 ${total}-${atLeastOne}=${neither}。`
        );
        continue;
      }

      if (variant === 1) {
        const total = 42 + (cycle % 4) * 3;
        const passA = 24 + (cycle % 5);
        const passB = 22 + ((cycle * 2) % 5);
        const bothPass = 12 + (cycle % 4);
        const atLeastOnePass = passA + passB - bothPass;
        const bothFail = total - atLeastOnePass;
        const exactlyOne = atLeastOnePass - bothPass;
        questions.push(
          `某次測驗共 ${total} 人，甲科及格 ${passA} 人，乙科及格 ${passB} 人，兩科都及格 ${bothPass} 人。求兩科都不及格的人數與恰有一科及格的人數。`
        );
        answers.push(
          `簡答：兩科都不及格 ${bothFail} 人；恰有一科及格 ${exactlyOne} 人。過程：至少一科及格為 ${passA}+${passB}-${bothPass}=${atLeastOnePass}，所以兩科都不及格為 ${total}-${atLeastOnePass}=${bothFail}。恰有一科及格為至少一科及格扣掉兩科都及格，即 ${atLeastOnePass}-${bothPass}=${exactlyOne}。`
        );
        continue;
      }

      if (variant === 2) {
        const n = [300, 500, 1000, 1200][cycle % 4];
        const a = [2, 3, 4, 5][cycle % 4];
        const b = [3, 5, 7, 9][cycle % 4];
        const l = lcm(a, b);
        const result = countMultiplesInRange(1, n, a) + countMultiplesInRange(1, n, b) - countMultiplesInRange(1, n, l);
        questions.push(`在 1 到 ${n} 的正整數中，是 ${a} 的倍數或是 ${b} 的倍數者共有多少個？`);
        answers.push(
          `簡答：${result} 個。過程：${a} 的倍數有 ${countMultiplesInRange(1, n, a)} 個，${b} 的倍數有 ${countMultiplesInRange(1, n, b)} 個，同時為兩者倍數就是 ${l} 的倍數，有 ${countMultiplesInRange(1, n, l)} 個。由取捨原理得 ${countMultiplesInRange(1, n, a)}+${countMultiplesInRange(1, n, b)}-${countMultiplesInRange(1, n, l)}=${result}。`
        );
        continue;
      }

      if (variant === 3) {
        const total = 45 + (cycle % 4) * 3;
        const each = 8 + (cycle % 4);
        const pair = 3 + (cycle % 3);
        const triple = 1 + (cycle % 2);
        const atLeastOne = 3 * each - 3 * pair + triple;
        const none = total - atLeastOne;
        questions.push(
          `某班 ${total} 人參加國、英、數測驗，三科各及格 ${each} 人，任兩科都及格各有 ${pair} 人，三科都及格 ${triple} 人。求至少一科及格的人數。`
        );
        answers.push(
          `簡答：${atLeastOne} 人。過程：三集合取捨為三個單科相加，扣掉三個兩兩交集，再加回三科交集，所以至少一科及格人數為 ${each}+${each}+${each}-${pair}-${pair}-${pair}+${triple}=${atLeastOne}。若要檢查未及格任何一科，則為 ${total}-${atLeastOne}=${none} 人。`
        );
        continue;
      }

      const a = 18 + (cycle % 5);
      const b = 21 + ((cycle * 2) % 6);
      const union = a + b - (7 + (cycle % 4));
      const intersection = a + b - union;
      const aOnly = a - intersection;
      questions.push(
        `給定 \\(n(A)=${a}\\)、\\(n(B)=${b}\\)、\\(n(A\\cup B)=${union}\\)，求 \\(n(A\\cap B)\\) 與 \\(n(A-B)\\)。`
      );
      answers.push(
        `簡答：\\(n(A\\cap B)=${intersection}\\)，\\(n(A-B)=${aOnly}\\)。過程：由 \\(n(A\\cup B)=n(A)+n(B)-n(A\\cap B)\\)，得 \\(n(A\\cap B)=${a}+${b}-${union}=${intersection}\\)。而 \\(A-B\\) 表示只在 \\(A\\) 中的元素，所以 \\(n(A-B)=${a}-${intersection}=${aOnly}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS221CompetitionProbabilityPathsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = randInt(0, 29);

      if (variant === 0) {
        const aNow = cycle % 2 === 0 ? 2 : 1;
        const bNow = cycle % 2 === 0 ? 1 : 2;
        const needA = 3 - aNow;
        const needB = 3 - bNow;
        const paths = listCompetitionPaths(needA, needB);
        const scoreText = aNow > bNow ? `甲以 ${aNow}:${bNow} 領先` : `乙以 ${bNow}:${aNow} 領先`;
        questions.push(
          `甲、乙兩人比賽，先勝 3 場者贏得比賽。若目前${scoreText}，請用「甲、乙」列出後續所有可能的勝負路徑，並求共有幾種。`
        );
        answers.push(
          `簡答：${paths.length} 種，路徑為 ${paths.join('、')}。過程：甲還需要 ${needA} 勝，乙還需要 ${needB} 勝。逐場列舉，任一路徑一旦有人達到所需勝場就停止，所以可能路徑為 ${paths.join('、')}，共 ${paths.length} 種。`
        );
        continue;
      }

      if (variant === 1) {
        const teams = 4 + (cycle % 5);
        const games = combinationCount(teams, 2);
        questions.push(`${teams} 隊單循環賽，任兩隊都比一次且無和局，請問所有可能的對戰組合共有幾場？`);
        answers.push(
          `簡答：${games} 場。過程：循環賽的場次只看任兩隊配成一組，所以共有 \\(C(${teams},2)=\\dfrac{${teams}\\times${teams - 1}}2=${games}\\) 場。`
        );
        continue;
      }

      if (variant === 2) {
        const target = 3 + (cycle % 3);
        const maxThrows = target + 2;
        questions.push(
          `某人丟銅板，正面得 1 分、反面得 0 分，達 ${target} 分或丟滿 ${maxThrows} 次即停止。求最後得分可能有哪些。`
        );
        const scores = Array.from({ length: target + 1 }, (_, idx) => idx);
        answers.push(
          `簡答：${scores.join('、')} 分。過程：若在 ${maxThrows} 次內達到 ${target} 分就停止，最高分是 ${target} 分；若沒有達標，可能累積 0 到 ${target - 1} 分。因此最後得分可能為 ${scores.join('、')} 分。`
        );
        continue;
      }

      if (variant === 3) {
        const teams = 8 + 2 * (cycle % 5);
        const games = teams - 1;
        questions.push(`學校舉辦單淘汰賽，共有 ${teams} 隊參加。請問決出冠軍至少需要幾場比賽？`);
        answers.push(
          `簡答：${games} 場。過程：單淘汰賽每比一場淘汰 1 隊，最後留下冠軍 1 隊，所以必須淘汰 ${teams}-1=${games} 隊，也就是需要 ${games} 場。`
        );
        continue;
      }

      const teams = 5 + (cycle % 5);
      const games = teams * (teams - 1);
      questions.push(`雙循環賽中，若有 ${teams} 隊參加，任兩隊各比主客場 2 場，請問總比賽場次是多少？`);
      answers.push(
        `簡答：${games} 場。過程：任兩隊配對有 \\(C(${teams},2)=${combinationCount(teams, 2)}\\) 組，每組比 2 場，所以總場次為 \\(2C(${teams},2)=${games}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS221RouteSelectionCountingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = randInt(0, 29);

      if (variant === 0) {
        const first = 2 + (cycle % 4);
        const second = 3 + ((cycle * 2) % 4);
        const third = 2 + ((cycle * 3) % 3);
        const total = first * second * third;
        questions.push(
          `從甲地到乙地有 ${first} 條路，乙地到丙地有 ${second} 條路，丙地到丁地有 ${third} 條路。若依序從甲到丁，總共有多少種走法？`
        );
        answers.push(
          `簡答：${total} 種。過程：每一段路的選擇彼此獨立，依乘法原理共有 ${first}\\times${second}\\times${third}=${total} 種走法。`
        );
        continue;
      }

      if (variant === 1) {
        const mains = 4 + (cycle % 3);
        const soups = 2 + (cycle % 3);
        const drinks = 3 + ((cycle * 2) % 3);
        const total = mains * soups * drinks;
        questions.push(
          `餐廳提供 ${mains} 種主餐、${soups} 種湯品與 ${drinks} 種飲料，每人任選一份套餐（含主餐、湯、飲），共有多少種組合？`
        );
        answers.push(
          `簡答：${total} 種。過程：主餐、湯品、飲料各選一種，依乘法原理共有 ${mains}\\times${soups}\\times${drinks}=${total} 種。`
        );
        continue;
      }

      if (variant === 2) {
        const doors = 4 + (cycle % 4);
        const total = doors * (doors - 1);
        questions.push(
          `一室有 ${doors} 個門，某人由一個門進入、另一個不同的門出去。若只看「進門、出門」的路徑，共有多少種選法？`
        );
        answers.push(
          `簡答：${total} 種。過程：先選進門有 ${doors} 種，出門不能與進門相同，所以有 ${doors - 1} 種。依乘法原理共有 ${doors}\\times${doors - 1}=${total} 種。`
        );
        continue;
      }

      if (variant === 3) {
        const target = [30, 40, 50, 60][cycle % 4];
        const ways = countCoinWays(target, [10, 5, 1]);
        questions.push(
          `用 1 元、5 元、10 元硬幣湊成 ${target} 元，若只看各面額使用幾枚，不考慮排列順序，共有多少種方法？`
        );
        answers.push(
          `簡答：${ways} 種。過程：先固定 10 元硬幣的枚數，再用 5 元與 1 元補足。若 10 元硬幣有 \\(a\\) 枚，剩下 ${target}-10a 元可用 5 元硬幣取 0 到 \\(\\lfloor(${target}-10a)/5\\rfloor\\) 枚，其餘用 1 元補足；逐一加總共有 ${ways} 種。`
        );
        continue;
      }

      const factors = [2 + (cycle % 3), 3 + ((cycle + 1) % 3), 4 + ((cycle + 2) % 3)];
      const terms = factors.reduce((acc, value) => acc * value, 1);
      questions.push(
        `展開一個由三個括號相乘的式子，三個括號分別有 ${factors[0]}、${factors[1]}、${factors[2]} 項，且展開後沒有同類項可合併。共有多少個相異項？`
      );
      answers.push(
        `簡答：${terms} 項。過程：展開時每一項都來自三個括號各選一項，因此依乘法原理共有 ${factors[0]}\\times${factors[1]}\\times${factors[2]}=${terms} 個相異項。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS221DigitFormationCountingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = randInt(0, 29);

      if (variant === 0) {
        const digitCount = 5 + (cycle % 3);
        const total = (digitCount - 1) * (digitCount - 1) * (digitCount - 2);
        questions.push(`用含 0 的 ${digitCount} 個不同數字組成數字不重複的三位數，共有多少個？`);
        answers.push(
          `簡答：${total} 個。過程：百位不能是 0，有 ${digitCount - 1} 種；十位可用剩下 ${digitCount - 1} 種；個位再剩 ${digitCount - 2} 種。因此共有 ${digitCount - 1}\\times${digitCount - 1}\\times${digitCount - 2}=${total} 個。`
        );
        continue;
      }

      if (variant === 1) {
        const digitCount = 5 + (cycle % 4);
        const total = (digitCount - 1) * digitCount * digitCount;
        questions.push(`用含 0 的 ${digitCount} 個不同數字組成三位數，若數字可以重複，共有多少個？`);
        answers.push(
          `簡答：${total} 個。過程：百位不能是 0，有 ${digitCount - 1} 種；十位與個位都可使用全部 ${digitCount} 個數字。因此共有 ${digitCount - 1}\\times${digitCount}\\times${digitCount}=${total} 個。`
        );
        continue;
      }

      if (variant === 2) {
        const templates = [
          { n: 360, factors: '2^3\\times3^2\\times5', count: 24 },
          { n: 720, factors: '2^4\\times3^2\\times5', count: 30 },
          { n: 540, factors: '2^2\\times3^3\\times5', count: 24 },
        ];
        const item = templates[cycle % templates.length];
        questions.push(`求 ${item.n} 的正因數個數。`);
        answers.push(
          `簡答：${item.count} 個。過程：${item.n}=${item.factors}。若標準分解式為 \\(p^a q^b r^c\\)，正因數個數為 \\((a+1)(b+1)(c+1)\\)，所以共有 ${item.count} 個。`
        );
        continue;
      }

      if (variant === 3) {
        const digit = [3, 5, 7, 8][cycle % 4];
        const total = countNumbersContainingDigitUpTo999(digit);
        questions.push(`在 1 到 999 的正整數中，含有數字「${digit}」的數共有多少個？`);
        answers.push(
          `簡答：${total} 個。過程：把 1 到 999 補成三位形式來看，從 000 到 999 共 1000 個。完全不含 ${digit} 的三位字串有 \\(9^3\\) 個，其中 000 不在 1 到 999 但也不含 ${digit}。所以 1 到 999 中不含 ${digit} 的有 \\(9^3-1\\) 個，含 ${digit} 的有 \\(999-(9^3-1)=${total}\\) 個。`
        );
        continue;
      }

      const colors = 4 + (cycle % 2);
      const regions = 5;
      const total = Math.pow(colors - 1, regions) - (colors - 1);
      questions.push(`用 ${colors} 種不同顏色塗在圍成一圈的 ${regions} 個區域，相鄰區域不可同色，求塗色方法數。`);
      answers.push(
        `簡答：${total} 種。過程：圓環型塗色可用公式；當 \\(n\\) 為奇數時為 \\((m-1)^n-(m-1)\\)。此處 \\(m=${colors}\\)、\\(n=${regions}\\)，所以共有 \\(${colors - 1}^{${regions}}-${colors - 1}=${total}\\) 種。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS221MultipleSurveyCountingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = randInt(0, 29);

      if (variant === 0) {
        const n = [300, 500, 1000][cycle % 3];
        const a = 3;
        const b = 5 + 2 * (cycle % 2);
        const l = lcm(a, b);
        const result = countMultiplesInRange(1, n, a) + countMultiplesInRange(1, n, b) - countMultiplesInRange(1, n, l);
        questions.push(`在 1 到 ${n} 的正整數中，是 ${a} 的倍數或 ${b} 的倍數者共有多少個？`);
        answers.push(
          `簡答：${result} 個。過程：${a} 的倍數有 ${countMultiplesInRange(1, n, a)} 個，${b} 的倍數有 ${countMultiplesInRange(1, n, b)} 個，同時為兩者倍數的是 ${l} 的倍數，有 ${countMultiplesInRange(1, n, l)} 個。故共有 ${result} 個。`
        );
        continue;
      }

      if (variant === 1) {
        const n = [600, 800, 1000][cycle % 3];
        const a = 2;
        const b = 3 + 2 * (cycle % 2);
        const l = lcm(a, b);
        const result = countMultiplesInRange(1, n, a) - countMultiplesInRange(1, n, l);
        questions.push(`在 1 到 ${n} 的正整數中，是 ${a} 的倍數但不是 ${b} 的倍數者共有多少個？`);
        answers.push(
          `簡答：${result} 個。過程：先算 ${a} 的倍數有 ${countMultiplesInRange(1, n, a)} 個，再扣掉同時是 ${a} 與 ${b} 的倍數，也就是 ${l} 的倍數 ${countMultiplesInRange(1, n, l)} 個，所以共有 ${result} 個。`
        );
        continue;
      }

      if (variant === 2) {
        const total = 50 + (cycle % 4) * 5;
        const passE = 30 + (cycle % 5);
        const passM = 25 + ((cycle * 2) % 5);
        const bothPass = 15 + (cycle % 4);
        const failBoth = total - (passE + passM - bothPass);
        questions.push(
          `某班 ${total} 人，英文及格 ${passE} 人，數學及格 ${passM} 人，兩科都及格 ${bothPass} 人，求兩科都不及格的人數。`
        );
        answers.push(
          `簡答：${failBoth} 人。過程：至少一科及格為 ${passE}+${passM}-${bothPass}=${passE + passM - bothPass} 人，所以兩科都不及格為 ${total}-${passE + passM - bothPass}=${failBoth} 人。`
        );
        continue;
      }

      if (variant === 3) {
        const total = 100 + (cycle % 3) * 20;
        const coffee = 60 + (cycle % 5);
        const tea = 50 + ((cycle * 2) % 5);
        const both = 30 + (cycle % 4);
        const atLeastOne = coffee + tea - both;
        const exactlyOne = atLeastOne - both;
        questions.push(
          `調查 ${total} 人，愛喝咖啡 ${coffee} 人，愛喝茶 ${tea} 人，兩者都愛 ${both} 人。求至少愛一種與恰愛一種的人數。`
        );
        answers.push(
          `簡答：至少愛一種 ${atLeastOne} 人；恰愛一種 ${exactlyOne} 人。過程：至少愛一種為 ${coffee}+${tea}-${both}=${atLeastOne} 人。恰愛一種要扣掉兩者都愛的人，因此為 ${atLeastOne}-${both}=${exactlyOne} 人。`
        );
        continue;
      }

      const n = [300, 500, 700][cycle % 3];
      const a = 2 + (cycle % 2);
      const b = 3 + (cycle % 3);
      const l = lcm(a, b);
      const divisible =
        countMultiplesInRange(1, n, a) + countMultiplesInRange(1, n, b) - countMultiplesInRange(1, n, l);
      const result = n - divisible;
      questions.push(`在 1 到 ${n} 的正整數中，不被 ${a} 整除且不被 ${b} 整除的數有多少個？`);
      answers.push(
        `簡答：${result} 個。過程：先算會被 ${a} 或 ${b} 整除的數。由取捨原理共有 ${divisible} 個，所以都不被整除的有 ${n}-${divisible}=${result} 個。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS221CountingApplicationsFiveSubtypeMixedSet(count) {
    const banks = [
      buildS221InclusionExclusionApplicationsSet,
      buildS221CompetitionProbabilityPathsSet,
      buildS221RouteSelectionCountingSet,
      buildS221DigitFormationCountingSet,
      buildS221MultipleSurveyCountingSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](mixedBankSampleCount(count, banks.length));
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS221InclusionExclusionApplicationsSubtypeSet(count) {
    return buildS221InclusionExclusionApplicationsSet(count);
  }

  function buildS221CompetitionProbabilityPathsSubtypeSet(count) {
    return buildS221CompetitionProbabilityPathsSet(count);
  }

  function buildS221RouteSelectionCountingSubtypeSet(count) {
    return buildS221RouteSelectionCountingSet(count);
  }

  function buildS221DigitFormationCountingSubtypeSet(count) {
    return buildS221DigitFormationCountingSet(count);
  }

  function buildS221MultipleSurveyCountingSubtypeSet(count) {
    return buildS221MultipleSurveyCountingSet(count);
  }

  function countDivisorsMatching(factors, predicate) {
    let count = 0;
    function walk(index, divisor) {
      if (index === factors.length) {
        if (predicate(divisor)) count += 1;
        return;
      }
      const { prime, exp } = factors[index];
      let value = 1;
      for (let e = 0; e <= exp; e += 1) {
        walk(index + 1, divisor * value);
        value *= prime;
      }
    }
    walk(0, 1);
    return count;
  }

  function properColorCycleCount(colors, regions) {
    return Math.pow(colors - 1, regions) + (regions % 2 === 0 ? colors - 1 : -(colors - 1));
  }

  function countBinaryGridsWithAtLeastBlack(cells, minBlack) {
    let total = 0;
    for (let black = minBlack; black <= cells; black += 1) {
      total += combinationCount(cells, black);
    }
    return total;
  }

  function buildS221PolynomialExpansionTermCountingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = randInt(0, 29);

      if (variant === 0) {
        const sizes = [3 + (cycle % 2), 2 + (cycle % 2), 4 + (cycle % 3)];
        const total = sizes.reduce((acc, value) => acc * value, 1);
        questions.push(
          `展開三個括號相乘的式子，三個括號分別有 ${sizes[0]}、${sizes[1]}、${sizes[2]} 個互不同類的項，且展開後無同類項可合併，共有多少個相異項？`
        );
        answers.push(
          `簡答：${total} 個。過程：展開時每一項都來自三個括號各選一項，所以依乘法原理共有 ${sizes[0]}\\times${sizes[1]}\\times${sizes[2]}=${total} 個相異項。`
        );
        continue;
      }

      if (variant === 1) {
        const vars = 4 + (cycle % 2);
        const power = 2 + (cycle % 3);
        const total = combinationCount(vars + power - 1, power);
        questions.push(
          `展開 \\((${Array.from({ length: vars }, (_, idx) => String.fromCharCode(97 + idx)).join('+')})^{${power}}\\) 後，共有多少個相異項？`
        );
        answers.push(
          `簡答：${total} 個。過程：這等於把次方 ${power} 分配給 ${vars} 個變數，非負整數解個數為 \\(C(${power}+${vars}-1,${vars}-1)=C(${vars + power - 1},${vars - 1})=${total}\\)。`
        );
        continue;
      }

      if (variant === 2) {
        const power = 5 + (cycle % 3);
        const requiredDegree = 1 + 2 + 2;
        const remain = power - requiredDegree;
        const countTerms = remain >= 0 ? combinationCount(remain + 4 - 1, 4 - 1) : 0;
        questions.push(`在 \\((x+y+z+w)^{${power}}\\) 的展開式中，含有 \\(xy^2z^2\\) 因子的相異項共有多少項？`);
        answers.push(
          `簡答：${countTerms} 項。過程：含有此因子表示至少含有 \\(xy^2z^2\\)，已用去 ${requiredDegree} 次方。剩下 ${remain} 次方可分配給 \\(x,y,z,w\\) 四個變數，因此項數為 \\(C(${remain}+4-1,4-1)=${countTerms}\\)。`
        );
        continue;
      }

      if (variant === 3) {
        const vars = 4;
        const power = 4 + (cycle % 3);
        const withoutA = combinationCount(vars - 1 + power - 1, power);
        const total = combinationCount(vars + power - 1, power);
        const withA = total - withoutA;
        questions.push(`在 \\((a+b+c+d)^{${power}}\\) 的展開式中，含有 \\(a\\) 變數的項共有多少項？`);
        answers.push(
          `簡答：${withA} 項。過程：全部相異項有 \\(C(${power}+4-1,4-1)=${total}\\) 項。不含 \\(a\\) 的項只由 \\(b,c,d\\) 組成，有 \\(C(${power}+3-1,3-1)=${withoutA}\\) 項。所以含 \\(a\\) 的項數為 ${total}-${withoutA}=${withA}。`
        );
        continue;
      }

      const left = 3 + (cycle % 3);
      const right = 4 + (cycle % 3);
      const total = left * right;
      questions.push(`計算 \\((1+x+x^2+\\cdots+x^{${left - 1}})(a_1+a_2+\\cdots+a_{${right}})\\) 展開後的項數。`);
      answers.push(
        `簡答：${total} 項。過程：第一個括號有 ${left} 項，第二個括號有 ${right} 項，且沒有同類項可合併，所以展開後共有 ${left}\\times${right}=${total} 項。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS221DivisorCountingConditionsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = randInt(0, 29);

      if (variant === 0) {
        const n = [360, 540, 720][cycle % 3];
        const factors = primeFactorize(n);
        const countD = divisorCountFromFactors(factors);
        const sumD = divisorSumFromFactors(factors);
        questions.push(`求 $${n}$ 的正因數個數及其總和。`);
        answers.push(
          `簡答：正因數 $${countD}$ 個，總和 $${sumD}$。過程：\\(${n}=${formatPrimeFactorization(factors)}\\)。正因數個數為各指數加 $1$ 後相乘，得 $${countD}$ 個；正因數總和為各質因數等比和相乘，得 $${sumD}$。`
        );
        continue;
      }

      if (variant === 1) {
        const n = [5400, 7200, 10800][cycle % 3];
        const m = [12, 18, 20][cycle % 3];
        const factors = primeFactorize(n);
        const result = countDivisorsMatching(factors, (d) => d % m === 0);
        questions.push(`求 $${n}$ 的正因數中，為 $${m}$ 的倍數者共有多少個？`);
        answers.push(
          `簡答：$${result}$ 個。過程：先將 $${n}$ 分解為 \\(${formatPrimeFactorization(factors)}\\)。正因數若要是 $${m}$ 的倍數，必須至少含有 $${m}$ 的質因數需求；把符合條件的指數選擇數相乘，可得 $${result}$ 個。`
        );
        continue;
      }

      if (variant === 2) {
        const n = [1200, 1800, 2700][cycle % 3];
        const factors = primeFactorize(n);
        const result = countDivisorsMatching(factors, (d) => Number.isInteger(Math.sqrt(d)));
        questions.push(`求 $${n}$ 的正因數中，是完全平方數者共有多少個？`);
        answers.push(
          `簡答：$${result}$ 個。過程：完全平方數的每個質因數指數都必須是偶數。把 \\(${n}=${formatPrimeFactorization(factors)}\\) 中每個指數可取的偶數次方數量相乘，即得 $${result}$ 個。`
        );
        continue;
      }

      if (variant === 3) {
        const powers = [
          { a: 4, b: 3, c: 2 },
          { a: 5, b: 2, c: 3 },
          { a: 3, b: 4, c: 2 },
        ][cycle % 3];
        const total = (powers.a + 1) * (powers.b + 1) * (powers.c + 1);
        const oddNot5 = (powers.b + 1) * 1;
        questions.push(
          `設 \\(N=2^{${powers.a}}\\cdot3^{${powers.b}}\\cdot5^{${powers.c}}\\)，求 \\(N\\) 的正因數中，為偶數但不是 5 的倍數者共有多少個？`
        );
        answers.push(
          `簡答：\\(${powers.a * (powers.b + 1)}\\) 個。過程：偶數表示 2 的指數可取 1 到 ${powers.a}，共有 ${powers.a} 種；不是 5 的倍數表示 5 的指數只能取 0；3 的指數可取 0 到 ${powers.b}，共有 ${powers.b + 1} 種。因此共有 \\(${powers.a}\\times${powers.b + 1}\\times1=${powers.a * (powers.b + 1)}\\) 個。全部正因數則有 $${total}$ 個，這可作為檢查。`
        );
        continue;
      }

      const targetCount = [24, 36, 48][cycle % 3];
      const exp3 = 1 + (cycle % 3);
      const x = targetCount / (exp3 + 1) - 1;
      questions.push(`已知 \\(N=2^x\\cdot3^{${exp3}}\\) 有 ${targetCount} 個正因數，求 \\(x\\) 的值。`);
      answers.push(
        `簡答：\\(x=${x}\\)。過程：正因數個數為 \\((x+1)(${exp3}+1)=${targetCount}\\)。所以 \\(x+1=${targetCount / (exp3 + 1)}\\)，得 \\(x=${x}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS221RouteRestrictionCountingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = randInt(0, 29);

      if (variant === 0) {
        const hats = 3 + (cycle % 3);
        const shirts = 4 + (cycle % 3);
        const pants = 3 + (cycle % 2);
        const shoes = 2 + (cycle % 2);
        const total = hats * shirts * pants * shoes;
        questions.push(
          `阿杉有 ${hats} 頂帽子、${shirts} 件上衣、${pants} 條長褲、${shoes} 雙鞋子，外出時每樣必穿一件，共有多少種穿法？`
        );
        answers.push(
          `簡答：${total} 種。過程：每一類各選一件，依乘法原理共有 ${hats}\\times${shirts}\\times${pants}\\times${shoes}=${total} 種。`
        );
        continue;
      }

      if (variant === 1) {
        const doors = 5 + (cycle % 3);
        const onePerson = doors * (doors - 1);
        const total = onePerson * onePerson;
        questions.push(
          `一室有 ${doors} 個門，甲、乙兩人各自由一門進入且由不同門出去，每人不可由同一門進出。若兩人的選擇互不限制，共有多少種方法？`
        );
        answers.push(
          `簡答：${total} 種。過程：一個人的進出門選法為 ${doors}\\times${doors - 1}=${onePerson} 種。甲、乙各自選擇，依乘法原理共有 ${onePerson}\\times${onePerson}=${total} 種。`
        );
        continue;
      }

      if (variant === 2) {
        const a = 3 + (cycle % 3);
        const b = 2 + (cycle % 4);
        const outbound = a * b;
        const total = outbound * (outbound - 1);
        questions.push(
          `從甲地到乙地有 ${a} 條路，乙地到丙地有 ${b} 條路。求甲地經乙地往返丙地，且去回不可走完全相同路線的走法數。`
        );
        answers.push(
          `簡答：${total} 種。過程：單趟從甲經乙到丙有 ${a}\\times${b}=${outbound} 種。回程若不可走完全相同路線，剩 ${outbound - 1} 種，所以共有 ${outbound}\\times${outbound - 1}=${total} 種。`
        );
        continue;
      }

      if (variant === 3) {
        const drinks = 4 + (cycle % 3);
        const toppings = 3 + (cycle % 3);
        const sweetness = 3;
        const total = drinks * toppings * sweetness;
        questions.push(
          `某飲料店提供 ${drinks} 種茶飲、${toppings} 種配料與 ${sweetness} 種甜度，每杯飲料必選一種茶飲、一種配料與一種甜度，共有多少種組合？`
        );
        answers.push(
          `簡答：${total} 種。過程：三類選擇彼此獨立，依乘法原理共有 ${drinks}\\times${toppings}\\times${sweetness}=${total} 種。`
        );
        continue;
      }

      const branches = [2, 3, 4].map((value, idx) => value + ((cycle + idx) % 2));
      const total = branches.reduce((acc, value) => acc * value, 1);
      questions.push(
        `由 A 到 B 的電路中，有三個並聯分支分別有 ${branches[0]}、${branches[1]}、${branches[2]} 個開關；每個分支都需選一個開關接通，求使電路接通的方法數。`
      );
      answers.push(
        `簡答：${total} 種。過程：三個分支各選一個開關即可接通，依乘法原理共有 ${branches[0]}\\times${branches[1]}\\times${branches[2]}=${total} 種。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS221RestrictedDigitCountingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = randInt(0, 29);

      if (variant === 0) {
        const digitCount = 6 + (cycle % 4);
        const digits = Array.from({ length: digitCount }, (_, idx) => idx);
        const total = (digitCount - 1) * (digitCount - 1) * (digitCount - 2);
        const even = digits
          .filter((last) => last % 2 === 0)
          .reduce(
            (sum, last) =>
              sum + (last === 0 ? (digitCount - 1) * (digitCount - 2) : (digitCount - 2) * (digitCount - 2)),
            0
          );
        questions.push(`用 ${digits.join('、')} 組成數字不重複的三位數，共有多少個？其中為偶數者有多少個？`);
        answers.push(
          `簡答：共有 ${total} 個，其中偶數 ${even} 個。過程：全部三位數：百位 ${digitCount - 1} 種、十位 ${digitCount - 1} 種、個位 ${digitCount - 2} 種，共 ${total} 個。偶數看個位：若個位為 0，百位與十位有 \\(${digitCount - 1}\\times${digitCount - 2}\\) 種；若個位為其他偶數，各有 \\(${digitCount - 2}\\times${digitCount - 2}\\) 種，合計 ${even} 個。`
        );
        continue;
      }

      if (variant === 1) {
        const threshold = 2300 + 100 * (cycle % 4);
        let total = 0;
        for (let n = 1000; n <= 9999; n += 1) {
          const text = String(n);
          if ([...text].every((ch) => ['1', '2', '3', '4'].includes(ch)) && n > threshold) total += 1;
        }
        questions.push(`用 1、2、3、4 組成數字可重複的四位數，其中大於 ${threshold} 的數有多少個？`);
        answers.push(
          `簡答：${total} 個。過程：逐位討論。四位數共有 \\(4^4\\) 個，但需扣除不大於 ${threshold} 的情形；依千位與後續位數分段計數，可得大於 ${threshold} 的共有 ${total} 個。`
        );
        continue;
      }

      if (variant === 2) {
        const diff = 1 + (cycle % 4);
        const pairCount = Array.from({ length: 9 }, (_, idx) => idx + 1).reduce((sum, hundred) => {
          return sum + [hundred - diff, hundred + diff].filter((unit) => unit >= 0 && unit <= 9).length;
        }, 0);
        const total = pairCount * 10;
        questions.push(`三位數中，百位數與個位數之差的絕對值為 ${diff} 的數共有幾個？`);
        answers.push(
          `簡答：${total} 個。過程：百位可為 1 到 9。若個位與百位差 ${diff}，逐一計數共有 ${pairCount} 種百位與個位搭配；十位可任選 0 到 9，共 10 種，因此共有 ${pairCount}\\times10=${total} 個。`
        );
        continue;
      }

      if (variant === 3) {
        const digit = [3, 4, 5, 7][cycle % 4];
        const without = Math.pow(9, 3) - 1;
        questions.push(`由 1 到 999 的自然數中，完全不含數字「${digit}」的數共有多少個？`);
        answers.push(
          `簡答：${without} 個。過程：把數補成三位字串，從 000 到 999 中每一位都不能是 ${digit}，共有 \\(9^3\\) 個；但 000 不屬於 1 到 999，所以要扣掉 1 個，得 ${without} 個。`
        );
        continue;
      }

      const n = 6 + (cycle % 4);
      const total = combinationCount(n, 3);
      questions.push(`從 1 到 ${n} 中選出三個數組成遞增三位正整數 \\(abc\\)，滿足 \\(a<b<c\\)，共有多少組？`);
      answers.push(
        `簡答：${total} 組。過程：只要從 ${n} 個數字中選出 3 個，依由小到大排列就唯一形成 \\(a<b<c\\)。所以共有 \\(C(${n},3)=${total}\\) 組。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS221RegionColoringCountingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = randInt(0, 29);

      if (variant === 0) {
        const colors = 4 + (cycle % 3);
        const regions = 4 + (cycle % 3);
        const total = properColorCycleCount(colors, regions);
        const parityText =
          regions % 2 === 0
            ? `本題 \\(n=${regions}\\) 為偶數，所以公式化為 \\((m-1)^n+(m-1)\\)。`
            : `本題 \\(n=${regions}\\) 為奇數，所以公式化為 \\((m-1)^n-(m-1)\\)。`;
        questions.push(
          `用 ${colors} 種顏色塗成環狀排列的 ${regions} 個區域，相鄰區域不同色，顏色可重複使用，共有多少種塗法？`
        );
        answers.push(
          `簡答：${total} 種。過程：環狀相鄰塗色可用公式。${parityText}代入 \\(m=${colors}\\)、\\(n=${regions}\\)，得 ${total} 種。`
        );
        continue;
      }

      if (variant === 1) {
        const colors = 4 + (cycle % 2);
        const regions = 5 + (cycle % 3);
        const fixedColor = randInt(1, colors);
        const total = Math.pow(colors - 1, regions - 1);
        questions.push(
          `一列共有 ${regions} 個區域，相鄰區域不同色。若第 1 區已固定為第 ${fixedColor} 種顏色，且共有 ${colors} 種顏色可用，求塗色方法數。`
        );
        answers.push(
          `簡答：${total} 種。過程：第 1 區顏色已固定。從第 2 區開始，每一區只要避開前一區顏色，各有 ${colors - 1} 種選擇，所以共有 \\(${colors - 1}^{${regions - 1}}=${total}\\) 種。`
        );
        continue;
      }

      if (variant === 2) {
        const colors = 3 + (cycle % 3);
        const total = colors * Math.pow(colors - 1, 4);
        questions.push(
          `一地圖有 A、B、C、D、E 五區排成一列，相鄰區域不可同色。若有 ${colors} 種顏色可用，求塗色方法數。`
        );
        answers.push(
          `簡答：${total} 種。過程：第一區有 ${colors} 種選擇，之後每一區都只要避開前一區顏色，各有 ${colors - 1} 種，因此共有 ${colors}\\times${colors - 1}^4=${total} 種。`
        );
        continue;
      }

      if (variant === 3) {
        const colors = 3 + (cycle % 2);
        const total = properColorCycleCount(colors, 6);
        questions.push(`將正六邊形的六個頂點塗色，規定相鄰頂點不同色，現有 ${colors} 種顏色可用，求方法數。`);
        answers.push(
          `簡答：${total} 種。過程：六個頂點形成一個環，套用環狀塗色公式 \\((m-1)^6+(m-1)\\)。代入 \\(m=${colors}\\)，得 ${total} 種。`
        );
        continue;
      }

      const cells = 9;
      const minBlack = 2 + (cycle % 3);
      const total = countBinaryGridsWithAtLeastBlack(cells, minBlack);
      questions.push(`一九宮格格位固定，每格塗黑或白兩色，求至少有 ${minBlack} 格為黑色的圖形總數。`);
      answers.push(
        `簡答：${total} 種。過程：從 9 格中選黑格位置。至少 ${minBlack} 格黑色，所以方法數為 \\(C(9,${minBlack})+C(9,${minBlack + 1})+\\cdots+C(9,9)=${total}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS221AdvancedCountingFiveSubtypeMixedSet(count) {
    const banks = [
      buildS221PolynomialExpansionTermCountingSet,
      buildS221DivisorCountingConditionsSet,
      buildS221RouteRestrictionCountingSet,
      buildS221RestrictedDigitCountingSet,
      buildS221RegionColoringCountingSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](mixedBankSampleCount(count, banks.length));
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS221PolynomialExpansionTermCountingSubtypeSet(count) {
    return buildS221PolynomialExpansionTermCountingSet(count);
  }

  function buildS221DivisorCountingConditionsSubtypeSet(count) {
    return buildS221DivisorCountingConditionsSet(count);
  }

  function buildS221RouteRestrictionCountingSubtypeSet(count) {
    return buildS221RouteRestrictionCountingSet(count);
  }

  function buildS221RestrictedDigitCountingSubtypeSet(count) {
    return buildS221RestrictedDigitCountingSet(count);
  }

  function buildS221RegionColoringCountingSubtypeSet(count) {
    return buildS221RegionColoringCountingSet(count);
  }

  function buildS222PermutationEquationSet(count) {
    const templates = [
      {
        get q() {
          const variant = s242Pick([
            { k: 10, roots: '\\(n=4\\) 或 \\(n=5\\)', eq: 'n^2-9n+20=0', factor: '所以 \\(n=4\\) 或 \\(5\\)' },
            { k: 12, roots: '\\(n=3\\) 或 \\(n=8\\)', eq: 'n^2-11n+24=0', factor: '所以 \\(n=3\\) 或 \\(8\\)' },
          ]);
          this._v = variant;
          return `已知 \\(n\\) 為正整數，且 \\(P(n+1,3)=${variant.k}P(n-1,2)\\)，求 \\(n\\) 之值。`;
        },
        get a() {
          const v = this._v || { k: 10, roots: '\\(n=4\\) 或 \\(n=5\\)', eq: 'n^2-9n+20=0', factor: '所以 \\(n=4\\) 或 \\(5\\)' };
          return `簡答：${v.roots}。過程：\\(P(n+1,3)=(n+1)n(n-1)\\)，\\(P(n-1,2)=(n-1)(n-2)\\)。因為 \\(n\\ge3\\)，可同除以 \\(n-1\\)，得 \\(n(n+1)=${v.k}(n-2)\\)，即 \\(${v.eq}\\)，${v.factor}。`;
        },
      },
      {
        get q() {
          const n = randInt(7, 10);
          this._n = n;
          return `解方程式 \\(P(n,4)=${n * (n - 1) * (n - 2) * (n - 3)}\\)。`;
        },
        get a() {
          const n = this._n || 9;
          return `簡答：\\(n=${n}\\)。過程：\\(P(n,4)=n(n-1)(n-2)(n-3)\\)。試算 \\(${n}\\cdot${n - 1}\\cdot${n - 2}\\cdot${n - 3}=${n * (n - 1) * (n - 2) * (n - 3)}\\)，故 \\(n=${n}\\)。`;
        },
      },
      {
        get q() {
          const k = randInt(3, 9);
          this._k = k;
          return `已知 \\(P(n,3):P(n,2)=${k}:1\\)，求 \\(n\\)。`;
        },
        get a() {
          const k = this._k || 3;
          return `簡答：\\(n=${k + 2}\\)。過程：\\(P(n,3)=n(n-1)(n-2)\\)，\\(P(n,2)=n(n-1)\\)，比值為 \\(n-2\\)。由 \\(n-2=${k}\\)，得 \\(n=${k + 2}\\)。`;
        },
      },
      {
        q: '若 \\(P(n+1,4)-10P(n-1,2)=4P(n,3)\\)，求 \\(n\\) 之值。',
        a: '簡答：\\(n=5\\)。過程：展開得 \\((n+1)n(n-1)(n-2)-10(n-1)(n-2)=4n(n-1)(n-2)\\)。同除非零因子 \\((n-1)(n-2)\\)，得 \\(n(n+1)-10=4n\\)，即 \\(n^2-3n-10=0\\)，正整數解為 \\(n=5\\)。',
      },
      {
        get q() {
          const k = randInt(6, 15);
          this._k = k;
          return `已知 \\(P(n,3)=${k}P(n,2)\\)，求 \\(n\\) 之值。`;
        },
        get a() {
          const k = this._k || 12;
          return `簡答：\\(n=${k + 2}\\)。過程：\\(P(n,3)=n(n-1)(n-2)\\)，\\(P(n,2)=n(n-1)\\)。因為 \\(n\\ge3\\)，同除以 \\(n(n-1)\\)，得 \\(n-2=${k}\\)，所以 \\(n=${k + 2}\\)。`;
        },
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(varyTemplateQuestion(item.q, i, templates.length, count));
      answers.push(item.a);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS222IdenticalItemsPermutationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    const wordBank = [
      {
        word: 'SUCCESS',
        n: 7,
        repMap: [
          ['S', 3],
          ['C', 2],
        ],
      },
      {
        word: 'MISSISSIPPI',
        n: 11,
        repMap: [
          ['I', 4],
          ['S', 4],
          ['P', 2],
        ],
      },
      {
        word: 'COMMITTEE',
        n: 9,
        repMap: [
          ['M', 2],
          ['T', 2],
          ['E', 2],
        ],
      },
      {
        word: 'STATISTICS',
        n: 10,
        repMap: [
          ['S', 3],
          ['T', 3],
          ['I', 2],
        ],
      },
      {
        word: 'BANANA',
        n: 6,
        repMap: [
          ['A', 3],
          ['N', 2],
        ],
      },
      {
        word: 'ARRANGEMENT',
        n: 11,
        repMap: [
          ['A', 2],
          ['R', 2],
          ['N', 2],
          ['E', 2],
        ],
      },
      {
        word: 'TENNESSEE',
        n: 9,
        repMap: [
          ['E', 4],
          ['N', 2],
          ['S', 2],
        ],
      },
      {
        word: 'ENGINEERING',
        n: 11,
        repMap: [
          ['E', 3],
          ['N', 3],
          ['G', 2],
          ['I', 2],
        ],
      },
    ];
    const colorOptions = [
      ['紅', '藍', '白'],
      ['藍', '白', '黃'],
      ['紅', '綠', '白'],
      ['紅', '藍', '白', '黃'],
    ];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode !== 2) {
        // Word full permutation
        const idx = randInt(0, wordBank.length - 1);
        const { word, n, repMap } = wordBank[idx];
        let denom = 1;
        repMap.forEach(([, k]) => {
          denom *= factorialInt(k);
        });
        const total = factorialInt(n) / denom;
        const denomStr = repMap.map(([, k]) => `${k}!`).join('\\cdot');
        const repDesc = repMap.map(([l, k]) => `${l} 有 ${k} 個`).join('、');
        questions.push(
          mode === 0
            ? `將「${word}」這個單字的所有 ${n} 個字母全部重新排列，共有多少種不同的排法？`
            : `單字「${word}」共 ${n} 個字母，其中${repDesc}，其餘各 1 個。這 ${n} 個字母全部重排後有多少種不同的排列？`
        );
        answers.push(
          `簡答：${total} 種。過程：「${word}」共 ${n} 個字母，其中${repDesc}，其餘各 1 個。相同字母互換不增加新排列，所以排法為 \\(\\frac{${n}!}{${denomStr}}=${total}\\)。`
        );
      } else {
        // Flag signal problem
        const colors = colorOptions[randInt(0, colorOptions.length - 1)];
        const counts = colors.map(() => randInt(1, 3));
        counts[0] = Math.max(counts[0], 2);
        counts[1] = Math.max(counts[1], 2);
        const totalFlags = counts.reduce((s, c) => s + c, 0);
        let denom = 1;
        counts.forEach((k) => {
          denom *= factorialInt(k);
        });
        const total = factorialInt(totalFlags) / denom;
        const denomStr = counts.map((k) => `${k}!`).join('\\cdot');
        const colorDesc = colors.map((c, j) => `${c}旗 ${counts[j]} 面`).join('、');
        questions.push(`有${colorDesc}，共 ${totalFlags} 面，將這些旗子全部升上旗竿，可組成多少種不同的信號？`);
        answers.push(
          `簡答：${total} 種。過程：共 ${totalFlags} 面旗，${colorDesc}。相同顏色旗互換不增加新信號，排法為 \\(\\frac{${totalFlags}!}{${denomStr}}=${total}\\)。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS222FixedRelativeOrderSet(count) {
    const templates = [
      {
        q: '將「ALGEBRA」一字的字母重排，若其中的母音 A、E、A 必須保持原來的相對順序，共有多少種排法？',
        a: '簡答：840 種。過程：「ALGEBRA」共有 7 個字母，A 重複 2 個。全部不同排法為 \\(\\frac{7!}{2!}=2520\\)。三個母音 A、E、A 的相對位置共有 3 種可能，要求保持 A、E、A 表示 E 在兩個 A 中間，所以取其中一種，得 \\(2520\\div3=840\\) 種。',
      },
      {
        get q() {
          const n = randInt(6, 9);
          const g = randInt(3, 4);
          this._d = { n, g };
          const others = ['乙', '丙', '丁', '戊'].slice(0, g).join('、');
          return `甲、乙、丙等 ${n} 人排一列，若規定甲必須排在${others}之左，則共有多少種排法？`;
        },
        get a() {
          const d = this._d || { n: 7, g: 3 };
          const total = factorialInt(d.n) / (d.g + 1);
          return `簡答：${total} 種。過程：在甲與另外 ${d.g} 人共 ${d.g + 1} 人的相對順序中，甲排最左的機率為 \\(\\frac1{${d.g + 1}}\\)。全部 ${d.n} 人排列有 \\(${d.n}!\\) 種，所以符合者為 \\(\\frac{${d.n}!}{${d.g + 1}}=${total}\\)。`;
        },
      },
      {
        get q() {
          const variant = s242Pick([
            { word: 'ACCESS', total: 360, rep: 'S 重複 2 個，全部排法為 \\(\\frac{6!}{2!}=360\\)' },
            { word: 'BALLOON', total: 1260, rep: 'L、O 各重複 2 個，全部排法為 \\(\\frac{7!}{2!2!}=1260\\)' },
            { word: 'ORANGES', total: 5040, rep: '7 個字母皆相異，全部排法為 \\(7!=5040\\)' },
          ]);
          this._v = variant;
          return `重排「${variant.word}」一字，若限制 A 一定要排在 E 之前（不一定相鄰），共有幾種排法？`;
        },
        get a() {
          const v = this._v || { word: 'ACCESS', total: 360, rep: 'S 重複 2 個，全部排法為 \\(\\frac{6!}{2!}=360\\)' };
          return `簡答：${v.total / 2} 種。過程：「${v.word}」${v.rep}。A 與 E 的相對順序一半為 A 在 E 前，所以有 \\(${v.total}\\div2=${v.total / 2}\\) 種。`;
        },
      },
      {
        get q() {
          const k = randInt(3, 5);
          this._k = k;
          return `棒球隊 9 名球員排打擊順序，若教練規定 ${k} 位內野手必須安排在前 ${k} 棒，其餘 ${9 - k} 人排後 ${9 - k} 棒，共有幾種安排方式？`;
        },
        get a() {
          const k = this._k || 4;
          const total = factorialInt(k) * factorialInt(9 - k);
          return `簡答：${total} 種。過程：前 ${k} 棒由 ${k} 位內野手排列，有 \\(${k}!\\) 種；後 ${9 - k} 棒由其餘 ${9 - k} 人排列，有 \\(${9 - k}!\\) 種。總數為 \\(${k}!${9 - k}!=${total}\\)。`;
        },
      },
      {
        get q() {
          const n = randInt(4, 6);
          this._n = n;
          return `將${['甲、乙、丙、丁', '甲、乙、丙、丁、戊', '甲、乙、丙、丁、戊、己'][n - 4]} ${n} 人排成一列，規定甲必須在乙之左方，且乙必須在丙之左方，共有多少種排列？`;
        },
        get a() {
          const n = this._n || 4;
          const total = factorialInt(n) / 6;
          return `簡答：${total} 種。過程：甲、乙、丙三人的相對順序固定，${n} 人全排列中恰佔 \\(\\frac1{3!}\\)，所以有 \\(\\frac{${n}!}{3!}=${total}\\) 種。`;
        },
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(varyTemplateQuestion(item.q, i, templates.length, count));
      answers.push(item.a);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS222PositionConstraintSet(count) {
    const templates = [
      {
        get q() {
          const m = randInt(4, 6);
          const w = randInt(3, Math.min(4, m));
          this._d = { m, w };
          return `男生 ${m} 人與女生 ${w} 人排成一列拍照，若要求女生 ${w} 人完全不相鄰，共有多少種排列法？`;
        },
        get a() {
          const d = this._d || { m: 4, w: 3 };
          const total = factorialInt(d.m) * combinationCount(d.m + 1, d.w) * factorialInt(d.w);
          return `簡答：${total} 種。過程：先排 ${d.m} 位男生有 \\(${d.m}!\\) 種，形成 ${d.m + 1} 個空位。選 ${d.w} 個空位放女生並排列女生，有 \\(C(${d.m + 1},${d.w})${d.w}!\\) 種，所以總數為 \\(${d.m}!C(${d.m + 1},${d.w})${d.w}!=${total}\\)。`;
        },
      },
      {
        get q() {
          const m = randInt(5, 7);
          const w = randInt(4, 5);
          this._d = { m, w };
          return `男生 ${m} 人與女生 ${w} 人排成一列，若要求任意兩個女孩都不相鄰，共有多少種排列法？`;
        },
        get a() {
          const d = this._d || { m: 5, w: 4 };
          const total = factorialInt(d.m) * combinationCount(d.m + 1, d.w) * factorialInt(d.w);
          return `簡答：${total} 種。過程：先排 ${d.m} 位男生有 \\(${d.m}!\\) 種，形成 ${d.m + 1} 個空位。選 ${d.w} 個空位放女生並排列女生，有 \\(C(${d.m + 1},${d.w})${d.w}!\\) 種，故共有 \\(${d.m}!C(${d.m + 1},${d.w})${d.w}!=${total}\\) 種。`;
        },
      },
      {
        get q() {
          const n = randInt(5, 7);
          this._n = n;
          return `${['甲、乙、丙、丁、戊', '甲、乙、丙、丁、戊、己', '甲、乙、丙、丁、戊、己、庚'][n - 5]} ${n} 人排成一列，規定甲不排首位且乙不排末位，共有多少種排列法？`;
        },
        get a() {
          const n = this._n || 6;
          const total = factorialInt(n) - 2 * factorialInt(n - 1) + factorialInt(n - 2);
          return `簡答：${total} 種。過程：全部 \\(${n}!\\) 種。甲排首位有 \\(${n - 1}!\\) 種，乙排末位有 \\(${n - 1}!\\) 種，兩者同時發生有 \\(${n - 2}!\\) 種。由容斥得 \\(${n}!-2\\cdot${n - 1}!+${n - 2}!=${total}\\)。`;
        },
      },
      {
        get q() {
          const d = randInt(4, 6);
          this._d = d;
          return d === 4
            ? '將「庭院深深深幾許」七字全取排列，要求三個「深」字完全分開，共有多少種排法？'
            : `將 ${d} 個相異物與 3 件相同物排成一列，要求相同物兩兩完全分開，共有多少種排法？`;
        },
        get a() {
          const d = this._d || 4;
          const total = factorialInt(d) * combinationCount(d + 1, 3);
          const label = d === 4 ? '非「深」字' : '相異物';
          return `簡答：${total} 種。過程：先排 ${d} 個${label}，有 \\(${d}!\\) 種，形成 ${d + 1} 個空位。選 3 個空位放相同物，有 \\(C(${d + 1},3)\\) 種，所以共有 \\(${d}!C(${d + 1},3)=${total}\\) 種。`;
        },
      },
      {
        get q() {
          const n = randInt(3, 6);
          this._n = n;
          return `${n} 男 ${n} 女排成一列，要求男女相間的排列數共有多少種？`;
        },
        get a() {
          const n = this._n || 5;
          const total = 2 * factorialInt(n) * factorialInt(n);
          return `簡答：${total} 種。過程：性別位置可為男女交錯的兩種型態：男先或女先，共 2 種。男生內部有 \\(${n}!\\) 種，女生內部有 \\(${n}!\\) 種，所以共有 \\(2\\cdot${n}!\\cdot${n}!=${total}\\) 種。`;
        },
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(varyTemplateQuestion(item.q, i, templates.length, count));
      answers.push(item.a);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS222DerangementPositionExclusionSet(count) {
    const templates = [
      {
        get q() {
          const n = randInt(5, 7);
          this._n = n;
          return `${['甲、乙、丙、丁、戊', '甲、乙、丙、丁、戊、己', '甲、乙、丙、丁、戊、己、庚'][n - 5]} ${n} 人排成一列，若要求甲不排首位、乙不排第二位、丙不排第三位，共有多少種排列法？`;
        },
        get a() {
          const n = this._n || 5;
          const total = factorialInt(n) - 3 * factorialInt(n - 1) + 3 * factorialInt(n - 2) - factorialInt(n - 3);
          return `簡答：${total} 種。過程：總數 \\(${n}!\\)。扣掉三個指定人坐到禁位的情形，用容斥：\\(${n}!-3\\cdot${n - 1}!+3\\cdot${n - 2}!-${n - 3}!=${total}\\)。`;
        },
      },
      {
        get q() {
          const n = randInt(4, 6);
          this._n = n;
          return `有 ${n} 封不同的信與 ${n} 個寫好地址的信封，將信隨機放入，求恰有 ${n - 1} 封放錯的情形共有多少種？`;
        },
        get a() {
          const n = this._n || 5;
          const der = [1, 0, 1, 2, 9, 44][n - 1];
          return `簡答：${n * der} 種。過程：恰有 ${n - 1} 封放錯表示恰有 1 封放對。先選放對的信有 \\(C(${n},1)\\) 種，其餘 ${n - 1} 封完全錯置有 \\(!${n - 1}=${der}\\) 種，所以共有 \\(${n}\\cdot${der}=${n * der}\\) 種。`;
        },
      },
      {
        q: '將 1、2、3、4、5 五個數字排成一列 \\((a_1,a_2,a_3,a_4,a_5)\\)，求滿足 \\((a_1-1)(a_2-2)(a_3-3)\\ne0\\) 的排列數。',
        a: '簡答：64 種。過程：條件表示第 1 位不可放 1、第 2 位不可放 2、第 3 位不可放 3。與三個禁位容斥相同，所以為 \\(5!-3\\cdot4!+3\\cdot3!-2!=64\\)。',
      },
      {
        get q() {
          const n = randInt(8, 11);
          this._n = n;
          return `${n} 位學生排成一列，若甲不可排首位，且乙不可排末位，共有多少種排列法？`;
        },
        get a() {
          const n = this._n || 10;
          const total = factorialInt(n) - 2 * factorialInt(n - 1) + factorialInt(n - 2);
          return `簡答：${total} 種。過程：全部 \\(${n}!\\) 種。甲首位有 \\(${n - 1}!\\) 種，乙末位有 \\(${n - 1}!\\) 種，同時發生有 \\(${n - 2}!\\) 種。故為 \\(${n}!-2\\cdot${n - 1}!+${n - 2}!=${total}\\)。`;
        },
      },
      {
        q: '將 A、B、C、D、E 五人排成一列，規定 A 不在第 1 位、B 不在第 2 位、C 不在第 3 位，且 D 不在第 4 位，共有多少種排法？',
        a: '簡答：53 種。過程：全部有 \\(5!\\) 種。用容斥扣掉 4 個指定禁位：\\(5!-C(4,1)4!+C(4,2)3!-C(4,3)2!+C(4,4)1!=120-96+36-8+1=53\\) 種。',
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(varyTemplateQuestion(item.q, i, templates.length, count));
      answers.push(item.a);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS222DistributionRepeatedSet(count) {
    const templates = [
      {
        get q() {
          const letters = randInt(4, 6);
          const boxes = randInt(3, 5);
          this._d = { letters, boxes };
          return `將 ${letters} 封不同的信任意投入 ${boxes} 個不同的郵筒，每一封信都有 ${boxes} 種選擇，共有多少種投法？`;
        },
        get a() {
          const d = this._d || { letters: 5, boxes: 4 };
          return `簡答：${Math.pow(d.boxes, d.letters)} 種。過程：每封信可獨立選 ${d.boxes} 個郵筒之一，所以共有 \\(${d.boxes}^{${d.letters}}=${Math.pow(d.boxes, d.letters)}\\) 種。`;
        },
      },
      {
        get q() {
          const toys = randInt(5, 7);
          const kids = randInt(3, 4);
          this._d = { toys, kids };
          return `有 ${toys} 件相異玩具分給${kids === 3 ? '甲、乙、丙三' : '甲、乙、丙、丁四'}位兒童，若每人所得不限（可兼得，亦可不得），共有多少種分法？`;
        },
        get a() {
          const d = this._d || { toys: 6, kids: 3 };
          return `簡答：${Math.pow(d.kids, d.toys)} 種。過程：每件玩具有 ${d.kids} 種歸屬選擇，${d.toys} 件彼此獨立，所以共有 \\(${d.kids}^{${d.toys}}=${Math.pow(d.kids, d.toys)}\\) 種。`;
        },
      },
      {
        q: '一個四位數字密碼（第一位可為 0），每位數字可由 0 到 9 任選，若要求密碼中至少含兩個連續的「2」，共有多少組？',
        a: '簡答：280 組。過程：總密碼 \\(10^4\\)。至少出現一段「22」可由位置 12、23、34 做容斥。三段各有 100 組，兩段重疊或分離分別修正，最後得 280 組。',
      },
      {
        get q() {
          const prizes = randInt(3, 4);
          const students = randInt(4, 7);
          this._d = { prizes, students };
          return `用 ${prizes} 種不同獎品分給 ${students} 位學生，每種獎品可給任一學生且可重複得獎，共有多少種頒發方式？`;
        },
        get a() {
          const d = this._d || { prizes: 3, students: 5 };
          return `簡答：${Math.pow(d.students, d.prizes)} 種。過程：每種獎品有 ${d.students} 位學生可選，${d.prizes} 種獎品彼此獨立，所以共有 \\(${d.students}^{${d.prizes}}=${Math.pow(d.students, d.prizes)}\\) 種。`;
        },
      },
      {
        get q() {
          const balls = randInt(3, 5);
          const boxes = randInt(3, 4);
          this._d = { balls, boxes };
          return `將 ${balls} 顆不同球放入 ${boxes} 個不同盒子中，允許盒子為空，共有多少種放法？`;
        },
        get a() {
          const d = this._d || { balls: 4, boxes: 3 };
          return `簡答：${Math.pow(d.boxes, d.balls)} 種。過程：每顆球都有 ${d.boxes} 個盒子可選，${d.balls} 顆球獨立選擇，所以共有 \\(${d.boxes}^{${d.balls}}=${Math.pow(d.boxes, d.balls)}\\) 種。`;
        },
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(varyTemplateQuestion(item.q, i, templates.length, count));
      answers.push(item.a);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS222GridPathSet(count) {
    const templates = [
      {
        get q() {
          const m = randInt(5, 8);
          const n = randInt(3, 4);
          this._d = { m, n };
          return `在一個 \\(${m}\\times${n}\\) 的棋盤街道中，從 A 到 B 只能向右或向上走，共有多少種走法？`;
        },
        get a() {
          const d = this._d || { m: 7, n: 3 };
          const total = combinationCount(d.m + d.n, d.n);
          return `簡答：${total} 種。過程：需要向右 ${d.m} 步、向上 ${d.n} 步，共 ${d.m + d.n} 步，選出其中 ${d.n} 步向上即可，所以為 \\(C(${d.m + d.n},${d.n})=${total}\\)。`;
        },
      },
      {
        q: '在一個 \\(7\\times3\\) 的棋盤街道中，從 A 到 B 只能向右或向上走；若途中必須經過 \\(C(3,1)\\) 點且不經過 \\(D(5,2)\\) 點，走法有多少種？',
        a: '簡答：24 種。過程：經過 C 的走法為 \\(C(4,1)C(6,2)=60\\)。同時經過 C、D 的走法為 \\(C(4,1)C(3,1)C(3,1)=36\\)。所以經 C 但不經 D 為 \\(60-36=24\\)。',
      },
      {
        q: '在一個 \\(5\\times4\\) 的街道中，求經過 \\(C(2,1)\\) 或 \\(D(3,3)\\) 點的捷徑走法。只能向右或向上。',
        a: '簡答：93 種。過程：經 C 有 \\(C(3,1)C(6,3)=60\\) 種，經 D 有 \\(C(6,3)C(3,1)=60\\) 種，同時經 C 與 D 有 \\(C(3,1)C(3,2)C(3,1)=27\\) 種。取聯集為 \\(60+60-27=93\\)。',
      },
      {
        get q() {
          const R = randInt(5, 7);
          const U = randInt(3, 4);
          const a = randInt(2, R - 2);
          const b = randInt(1, U - 1);
          this._d = { R, U, a, b };
          return `在棋盤街道中，從 A 到 B 需向右 ${R} 步、向上 ${U} 步，若不經過 \\((${a},${b})\\)，共有多少種走法？`;
        },
        get a() {
          const d = this._d || { R: 6, U: 4, a: 3, b: 2 };
          const total = combinationCount(d.R + d.U, d.U);
          const via = combinationCount(d.a + d.b, d.b) * combinationCount(d.R - d.a + d.U - d.b, d.U - d.b);
          return `簡答：${total - via} 種。過程：全部走法為 \\(C(${d.R + d.U},${d.U})=${total}\\)。經過 \\((${d.a},${d.b})\\) 的走法為 \\(C(${d.a + d.b},${d.b})C(${d.R - d.a + d.U - d.b},${d.U - d.b})=${via}\\)。所以不經過該點為 \\(${total}-${via}=${total - via}\\)。`;
        },
      },
      {
        get q() {
          const k = randInt(2, 3);
          this._k = k;
          return `在 \\(${2 * k}\\times${2 * k}\\) 棋盤街道中，從左下角到右上角，若必須經過中心點 \\((${k},${k})\\)，共有多少種捷徑走法？`;
        },
        get a() {
          const k = this._k || 2;
          const half = combinationCount(2 * k, k);
          return `簡答：${half * half} 種。過程：從起點到中心需右 ${k}、上 ${k}，有 \\(C(${2 * k},${k})=${half}\\) 種；中心到終點同樣有 ${half} 種，所以共有 \\(${half}\\times${half}=${half * half}\\) 種。`;
        },
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(varyTemplateQuestion(item.q, i, templates.length, count));
      answers.push(item.a);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS222NumberFormationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    // P(n, k) = n*(n-1)*...*(n-k+1)
    function P(n, k) {
      if (k === 0) return 1;
      let r = 1;
      for (let j = 0; j < k; j += 1) r *= n - j;
      return r;
    }
    // 111...1 (k ones)
    function repunit(k) {
      let s = 0;
      for (let j = 0; j < k; j += 1) s = s * 10 + 1;
      return s;
    }

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;

      if (mode === 0) {
        // From {1..n}, k-digit numbers, count ODD
        const n = randInt(4, 7);
        const k = randInt(2, Math.min(n, 4));
        const odds = Math.ceil(n / 2); // odd digits in {1..n}
        const permsRest = P(n - 1, k - 1);
        const total = odds * permsRest;
        const maxOdd = 2 * odds - 1;
        questions.push(`從 1 到 ${n} 的數字中每個各取至多一次，組成 ${k} 位數，其中奇數共有多少個？`);
        answers.push(
          `簡答：${total} 個。過程：個位必須是奇數（1、3、...、${maxOdd}），共有 ${odds} 種選法；其餘 ${k - 1} 個位置從剩下 ${n - 1} 個數字中依序排列，有 \\(P(${n - 1},${k - 1})=${permsRest}\\) 種。故共有 \\(${odds}\\times${permsRest}=${total}\\) 個。`
        );
      } else if (mode === 1) {
        // From {0,1,...,n} (no leading zero), count k-digit numbers
        const n = randInt(3, 6);
        const k = randInt(2, Math.min(n, 3));
        const firstChoices = n; // non-zero: 1..n
        const restPerms = P(n, k - 1); // from remaining n digits
        const total = firstChoices * restPerms;
        questions.push(
          `從 0, 1, 2, ..., ${n} 共 ${n + 1} 個數字中，每個各取至多一次，組成 ${k} 位整數（首位不為 0），共有多少個？`
        );
        answers.push(
          `簡答：${total} 個。過程：首位不能為 0，可從 1 到 ${n} 選擇，有 ${n} 種；其餘 ${k - 1} 位從剩下 ${n} 個數字依序排，有 \\(P(${n},${k - 1})=${restPerms}\\) 種。故共有 \\(${n}\\times${restPerms}=${total}\\) 個。`
        );
      } else {
        // From {1..n}, k-digit, find sum of all arrangements
        const n = randInt(3, 5);
        const k = randInt(2, Math.min(n, 4));
        const permsEach = P(n - 1, k - 1); // times each digit appears per position
        const digitSum = (n * (n + 1)) / 2;
        const ru = repunit(k); // 111...1
        const total = digitSum * permsEach * ru;
        questions.push(`用 1 到 ${n} 的數字，每個各取至多一次，組成所有可能的 ${k} 位數，求這些數的總和。`);
        answers.push(
          `簡答：${total}。過程：每個數字 1 到 ${n} 在每個位置各出現 \\(P(${n - 1},${k - 1})=${permsEach}\\) 次。1 到 ${n} 的數字和為 ${digitSum}，各位之和為 \\(${digitSum}\\times${permsEach}\\)。再乘位值因子 ${ru}（即 ${k} 個 1）得總和 \\(${digitSum}\\times${permsEach}\\times${ru}=${total}\\)。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }
  function buildS222SignalsRunsSet(count) {
    const templates = [
      {
        q: '將 5 個「+」號與 6 個「-」號排成一列，要求恰好出現 4 次變號（如 +- 算一次），共有多少種排法？',
        a: '簡答：70 種。過程：恰 4 次變號表示共有 5 段連續同號區塊。段落符號可由 + 開始或 - 開始；分別把 5 個 + 與 6 個 - 分成對應段數的正整數和，加總得 70 種。',
      },
      {
        q: '以汽笛鳴放長、短聲作信號，長音 2 秒、短音 1 秒，間隔 1 秒。求歷時 15 秒且剛好鳴完可作成多少種信號。',
        a: '簡答：37 種。過程：若有 \\(k\\) 個音，間隔有 \\(k-1\\) 個，共耗 \\(15-(k-1)=16-k\\) 秒在聲音上。設長音有 \\(L\\) 個，則聲音時間為 \\(k+L\\)，所以 \\(L=16-2k\\)。可行的 \\(k\\) 為 6、7、8，分別得到 \\(C(6,4)+C(7,2)+C(8,0)=15+21+1=37\\) 種。',
      },
      {
        q: '將 6 個 x 與 4 個 y 任意排列，把連續相同的符號視為一個「連串」，求連串總數為 5 的排法有多少種？',
        a: '簡答：45 種。過程：連串總數為 5，可能是 x 有 3 串、y 有 2 串，或 x 有 2 串、y 有 3 串。第一種有 \\(C(5,2)C(3,1)=30\\) 種；第二種有 \\(C(5,1)C(3,2)=15\\) 種，合計 45 種。',
      },
      {
        get q() {
          const n = s242Pick([6, 8, 10]);
          const l = randInt(1, n / 2 - 1);
          this._d = { n, l };
          return `在數線上從原點出發移動 ${n} 步（每步 +1 或 -1），若已知最後落在 +${n - 2 * l} 位置，共有多少種移動路徑？`;
        },
        get a() {
          const d = this._d || { n: 6, l: 1 };
          const t = d.n - 2 * d.l;
          const total = combinationCount(d.n, d.l);
          return `簡答：${total} 種。過程：設向右步數為 \\(r\\)、向左為 \\(l\\)，則 \\(r+l=${d.n}\\)、\\(r-l=${t}\\)，解得 \\(r=${d.n - d.l},l=${d.l}\\)。所以只要選出哪 ${d.l} 步向左，有 \\(C(${d.n},${d.l})=${total}\\) 種。`;
        },
      },
      {
        q: '將 4 個 A 與 3 個 B 排成一列，要求 A 恰好分成 2 個連串，共有多少種排法？',
        a: '簡答：18 種。過程：先把 4 個 A 分成 2 個非空連串，有 \\(C(3,1)=3\\) 種分法。3 個 B 形成前、中、後共 4 個空位，選 2 個空位放入這兩段 A，有 \\(C(4,2)=6\\) 種，所以共有 \\(3\\cdot6=18\\) 種。',
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(varyTemplateQuestion(item.q, i, templates.length, count));
      answers.push(item.a);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS222InternalOrderConstraintSet(count) {
    const templates = [
      {
        get q() {
          const a = randInt(2, 3);
          const b = randInt(2, 4);
          const c = randInt(2, 3);
          this._d = { a, b, c };
          return `射擊氣球問題：用三串分別為 ${a}、${b}、${c} 個的氣球當靶子，規定每一串必須從最底下的氣球開始射破。射破全部 ${a + b + c} 個氣球的次序有多少種？`;
        },
        get a() {
          const d = this._d || { a: 2, b: 3, c: 3 };
          const n = d.a + d.b + d.c;
          const total = factorialInt(n) / (factorialInt(d.a) * factorialInt(d.b) * factorialInt(d.c));
          return `簡答：${total} 種。過程：每串內部順序固定，只需決定三串射擊動作在 ${n} 個位置中的交錯方式，所以為 \\(\\frac{${n}!}{${d.a}!${d.b}!${d.c}!}=${total}\\)。`;
        },
      },
      {
        q: '8 個身高互異的人排成一列，要求身高由左到右呈「低、高、低、高、低、高、低、高」的交錯型態，共有多少種排法？',
        a: '簡答：1385 種。過程：這是指定起伏方向的交錯排列數。8 個相異元素形成低高交錯的排列數為 Euler zigzag number \\(E_8=1385\\)。',
      },
      {
        q: '火車車廂彩繪：7 節車廂要畫上企鵝 2 節、無尾熊 2 節、貓熊 3 節，要求中間三節車廂必須三種動物各一，共有多少種畫法？',
        a: '簡答：72 種。過程：中間三節放三種動物各一，有 \\(3!\\) 種。剩下四節需放企鵝 1、無尾熊 1、貓熊 2，有 \\(\\frac{4!}{2!}=12\\) 種，所以共有 \\(3!\\cdot12=72\\) 種。',
      },
      {
        q: '棋盤填數限制：在 \\(2\\times3\\) 的六格表格中填入 1 到 6，規定 1 和 2 必須在同一行或同一列，共有多少種填法？',
        a: '簡答：432 種。過程：先選 1 的位置 6 種；2 與 1 同行或同列的位置有 3 個。其餘 4 個數任意排列有 \\(4!\\) 種，所以共有 \\(6\\cdot3\\cdot4!=432\\) 種。',
      },
      {
        q: '不同旗竿掛旗：有 5 面不同顏色的旗子，懸掛在 3 根高低不等的旗竿上，每根旗竿可掛多面或不掛，共可表示出多少種信號？',
        a: '簡答：2520 種。過程：先將 5 面旗排成一列，再用兩個隔板切成 3 根旗竿的垂直順序，允許空竿。共有 \\(5!\\cdot C(7,2)=2520\\) 種。',
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(varyTemplateQuestion(item.q, i, templates.length, count));
      answers.push(item.a);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS222PermutationCoreFiveSubtypeMixedSet(count) {
    const banks = [
      buildS222PermutationEquationSet,
      buildS222IdenticalItemsPermutationSet,
      buildS222FixedRelativeOrderSet,
      buildS222PositionConstraintSet,
      buildS222DerangementPositionExclusionSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](mixedBankSampleCount(count, banks.length));
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS222PermutationApplicationsFiveSubtypeMixedSet(count) {
    const banks = [
      buildS222DistributionRepeatedSet,
      buildS222GridPathSet,
      buildS222NumberFormationSet,
      buildS222SignalsRunsSet,
      buildS222InternalOrderConstraintSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](mixedBankSampleCount(count, banks.length));
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS222PermutationEquationSubtypeSet(count) {
    return buildS222PermutationEquationSet(count);
  }

  function buildS222IdenticalItemsPermutationSubtypeSet(count) {
    return buildS222IdenticalItemsPermutationSet(count);
  }

  function buildS222FixedRelativeOrderSubtypeSet(count) {
    return buildS222FixedRelativeOrderSet(count);
  }

  function buildS222PositionConstraintSubtypeSet(count) {
    return buildS222PositionConstraintSet(count);
  }

  function buildS222DerangementPositionExclusionSubtypeSet(count) {
    return buildS222DerangementPositionExclusionSet(count);
  }

  function buildS222DistributionRepeatedSubtypeSet(count) {
    return buildS222DistributionRepeatedSet(count);
  }

  function buildS222GridPathSubtypeSet(count) {
    return buildS222GridPathSet(count);
  }

  function buildS222NumberFormationSubtypeSet(count) {
    return buildS222NumberFormationSet(count);
  }

  function buildS222SignalsRunsSubtypeSet(count) {
    return buildS222SignalsRunsSet(count);
  }

  function buildS222InternalOrderConstraintSubtypeSet(count) {
    return buildS222InternalOrderConstraintSet(count);
  }

  function buildS223TemplateSet(templates, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(varyTemplateQuestion(item.q, i, templates.length, count));
      answers.push(item.a);
    }
    return { questions, summaryAnswers, answers };
  }

  // 動態版：templates 為函數陣列，每次呼叫產生隨機參數的 {q, a}。
  function buildS223DynamicSet(builders, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = builders[i % builders.length]();
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS223MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](mixedBankSampleCount(count, banks.length));
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      appendGeneratedPracticeItem({ questions, summaryAnswers, answers }, generated, itemIndex);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS223BinomialCoefficientSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const a = randInt(2, 3);
            const b = randInt(1, 3);
            const n = randInt(5, 7);
            const k = randInt(2, n - 2);
            this._d = { a, b, n, k };
            return `求 \\((${a}x-${b === 1 ? '' : b}y)^{${n}}\\) 展開式中 \\(x^{${k}}y^{${n - k}}\\) 項的係數。`;
          },
          get a() {
            const d = this._d || { a: 3, b: 2, n: 6, k: 3 };
            const coeff = combinationCount(d.n, d.k) * Math.pow(d.a, d.k) * Math.pow(-d.b, d.n - d.k);
            return `簡答：\\(${coeff}\\)。過程：取 ${d.n - d.k} 個 \\(-${d.b === 1 ? '' : d.b}y\\) 與 ${d.k} 個 \\(${d.a}x\\)，係數為 \\(C(${d.n},${d.k})${d.a}^{${d.k}}(-${d.b})^{${d.n - d.k}}=${coeff}\\)。`;
          },
        },
        {
          q: '求 \\((x^2+\\frac{2}{x})^6\\) 展開式中 \\(x^3\\) 項的係數。',
          a: '簡答：160。過程：通項為 \\(C(6,k)(x^2)^{6-k}(\\frac{2}{x})^k\\)，\\(x\\) 次方為 \\(12-3k\\)。令 \\(12-3k=3\\)，得 \\(k=3\\)，係數為 \\(C(6,3)2^3=160\\)。',
        },
        {
          q: '求 \\((x+y+z)^{10}\\) 展開式中相異項的個數。',
          a: '簡答：66 項。過程：每一項對應 \\(x^ay^bz^c\\)，其中 \\(a+b+c=10\\)、\\(a,b,c\\ge0\\)。非負整數解數為 \\(C(12,2)=66\\)。',
        },
        {
          q: '求 \\((2a-b)^8\\) 展開式中 \\(a^5b^3\\) 項的係數。',
          a: '簡答：\\(-1792\\)。過程：取 3 個 \\(-b\\) 與 5 個 \\(2a\\)，係數為 \\(C(8,3)2^5(-1)^3=-1792\\)。',
        },
        {
          q: '求 \\((x^2-3y)^5\\) 展開式中 \\(x^4y^3\\) 項的係數。',
          a: '簡答：\\(-270\\)。過程：通項為 \\(C(5,k)(x^2)^{5-k}(-3y)^k\\)。要 \\(y^3\\) 得 \\(k=3\\)，此時 \\(x^{2(2)}=x^4\\)，係數為 \\(C(5,3)(-3)^3=-270\\)。',
        },
      ],
      count
    );
  }

  function buildS223BinomialConstantTermSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '求 \\((2x-\\frac{1}{4x})^8\\) 展開式中的常數項。',
          a: '簡答：\\(\\frac{35}{8}\\)。過程：通項的 \\(x\\) 次方為 \\(8-k-k=8-2k\\)，令其為 0 得 \\(k=4\\)。常數項為 \\(C(8,4)2^4(-\\frac14)^4=\\frac{35}{8}\\)。',
        },
        {
          get q() {
            const n = s242Pick([6, 9, 12]);
            this._n = n;
            return `求 \\((x-\\frac{1}{x^2})^{${n}}\\) 展開式中的常數項。`;
          },
          get a() {
            const n = this._n || 9;
            const k = n / 3;
            const value = combinationCount(n, k) * Math.pow(-1, k);
            return `簡答：\\(${value}\\)。過程：通項的 \\(x\\) 次方為 \\(${n}-k-2k=${n}-3k\\)，令其為 0 得 \\(k=${k}\\)。常數項為 \\(C(${n},${k})(-1)^{${k}}=${value}\\)。`;
          },
        },
        {
          q: '求 \\((x^3+\\frac1x+1)^8\\) 展開式中的常數項。',
          a: '簡答：309。過程：設取 \\(x^3\\) 有 \\(a\\) 次，取 \\(\\frac1x\\) 有 \\(b\\) 次，需 \\(3a-b=0\\)，故 \\(b=3a\\)。可行 \\(a=0,1,2\\)，相加 \\(1+\\frac{8!}{1!3!4!}+\\frac{8!}{2!6!}=1+280+28=309\\)。',
        },
        {
          q: '求 \\((x^2-\\frac2x)^9\\) 展開式中的常數項。',
          a: '簡答：5376。過程：通項的 \\(x\\) 次方為 \\(18-3k\\)，令 \\(18-3k=0\\) 得 \\(k=6\\)。常數項為 \\(C(9,6)(-2)^6=5376\\)。',
        },
        {
          q: '求 \\((3x^2+\\frac1x)^6\\) 展開式中的常數項。',
          a: '簡答：135。過程：通項的 \\(x\\) 次方為 \\(12-3k\\)，令其為 0 得 \\(k=4\\)。常數項為 \\(C(6,4)3^2=135\\)。',
        },
      ],
      count
    );
  }

  function buildS223BinomialRemainderNumberSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '求 \\(11^{18}\\) 除以 1000 的餘數。',
          a: '簡答：481。過程：\\(11^2=121\\)，逐次取模 1000 計算，可得 \\(11^{18}\\equiv481\\pmod {1000}\\)，所以餘數為 481。',
        },
        {
          q: '求 \\(13^{11}\\) 的末兩位數字。',
          a: '簡答：37。過程：只需看除以 100 的餘數。計算得 \\(13^{11}\\equiv37\\pmod {100}\\)，所以末兩位為 37。',
        },
        {
          q: '證明 \\(19^{19}+1\\) 恆為 20 的倍數。',
          a: '簡答：成立。過程：因為 \\(19\\equiv-1\\pmod {20}\\)，所以 \\(19^{19}+1\\equiv(-1)^{19}+1=0\\pmod {20}\\)。',
        },
        {
          q: '求 \\(17^{15}\\) 除以 1000 的餘數。',
          a: '簡答：793。過程：反覆平方並取模 1000，可得 \\(17^{15}\\equiv793\\pmod {1000}\\)，所以餘數為 793。',
        },
        {
          q: '求 \\(9^{20}\\) 除以 10 的餘數。',
          a: '簡答：1。過程：\\(9\\equiv-1\\pmod {10}\\)，所以 \\(9^{20}\\equiv(-1)^{20}=1\\pmod {10}\\)。',
        },
      ],
      count
    );
  }

  function buildS223PolynomialRemainderBinomialSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '求以 \\((x-1)^3\\) 除 \\((x^2-2x+2)^{10}\\) 所得的餘式。',
          a: '簡答：\\(10x^2-20x+11\\)。過程：令 \\(t=x-1\\)，則 \\(x^2-2x+2=t^2+1\\)。模 \\(t^3\\) 時，\\((1+t^2)^{10}\\equiv1+10t^2\\)，故餘式為 \\(1+10(x-1)^2=10x^2-20x+11\\)。',
        },
        {
          q: '求 \\(x^{10}\\) 除以 \\((x+1)^2\\) 的餘式。',
          a: '簡答：\\(-10x-9\\)。過程：令 \\(t=x+1\\)，則 \\(x=t-1\\)。模 \\(t^2\\) 時，\\((t-1)^{10}\\equiv1-10t\\)，化回得 \\(1-10(x+1)=-10x-9\\)。',
        },
        {
          q: '求 \\((x+1)+(x+1)^2+\\cdots+(x+1)^8\\) 展開式中 \\(x^4\\) 項的係數。',
          a: '簡答：126。過程：\\((x+1)^r\\) 中 \\(x^4\\) 的係數為 \\(C(r,4)\\)。總係數為 \\(C(4,4)+C(5,4)+\\cdots+C(8,4)=C(9,5)=126\\)。',
        },
        {
          q: '求 \\((x^2+1)^5\\) 除以 \\((x-1)^2\\) 的餘式。',
          a: '簡答：\\(160x-128\\)。過程：餘式設為 \\(ax+b\\)。令 \\(f(x)=(x^2+1)^5\\)，則 \\(f(1)=32\\)、\\(f\\prime(1)=160\\)。由 \\(a+b=32\\)、\\(a=160\\) 得餘式 \\(160x-128\\)。',
        },
        {
          q: '求 \\(x^{12}\\) 除以 \\((x-1)^2\\) 的餘式。',
          a: '簡答：\\(12x-11\\)。過程：餘式設為 \\(ax+b\\)。由 \\(f(1)=1\\)、\\(f\\prime(1)=12\\)，得 \\(a=12\\)、\\(a+b=1\\)，所以餘式為 \\(12x-11\\)。',
        },
      ],
      count
    );
  }

  function buildS223CombinationIdentitySet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const N = s242Pick([30, 40, 50, 60, 100]);
            this._N = N;
            return `計算 \\(C(${N},0)+C(${N},2)+C(${N},4)+\\cdots+C(${N},${N})\\) 之值。`;
          },
          get a() {
            const N = this._N || 50;
            return `簡答：\\(2^{${N - 1}}\\)。過程：偶數項係數和等於奇數項係數和，且全部係數和為 \\((1+1)^{${N}}=2^{${N}}\\)，所以偶數項和為 \\(2^{${N - 1}}\\)。`;
          },
        },
        {
          get q() {
            const n = randInt(6, 9);
            this._n = n;
            return `若 \\(C(n,1)+2C(n,2)+4C(n,3)+\\cdots+2^{n-1}C(n,n)=${(Math.pow(3, n) - 1) / 2}\\)，求 \\(n\\)。`;
          },
          get a() {
            const n = this._n || 8;
            return `簡答：\\(n=${n}\\)。過程：左式為 \\(\\frac{(1+2)^n-1}{2}=\\frac{3^n-1}{2}\\)。令 \\(\\frac{3^n-1}{2}=${(Math.pow(3, n) - 1) / 2}\\)，得 \\(3^n=${Math.pow(3, n)}=3^{${n}}\\)，所以 \\(n=${n}\\)。`;
          },
        },
        {
          q: '計算 \\(C(11,0)+C(11,1)+C(11,2)+C(11,3)+C(11,4)+C(11,5)\\) 之值。',
          a: '簡答：1024。過程：因為 \\(n=11\\) 為奇數，前半係數和等於全部係數和的一半，所以值為 \\(2^{10}=1024\\)。',
        },
        {
          q: '計算 \\(C(10,0)-C(10,1)+C(10,2)-\\cdots+C(10,10)\\)。',
          a: '簡答：0。過程：代入 \\((1-1)^{10}\\)，展開即為該交錯和，所以結果為 0。',
        },
        {
          q: '證明 \\((C(n,0))^2+(C(n,1))^2+\\cdots+(C(n,n))^2=C(2n,n)\\)。',
          a: '簡答：成立。過程：利用 \\((1+x)^n(1+x)^n=(1+x)^{2n}\\)。比較 \\(x^n\\) 項係數，左邊為 \\(\\sum_{k=0}^n C(n,k)C(n,n-k)=\\sum_{k=0}^n C(n,k)^2\\)，右邊為 \\(C(2n,n)\\)。',
        },
      ],
      count
    );
  }

  function buildS223SubsetPropertySet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '從 1 到 20 的正整數中，任取相異三個數，其乘積為偶數的取法共有多少種？',
          a: '簡答：1020 種。過程：全部取法為 \\(C(20,3)=1140\\)。乘積為奇數表示三個都取奇數，奇數有 10 個，取法 \\(C(10,3)=120\\)。所以乘積為偶數有 \\(1140-120=1020\\) 種。',
        },
        {
          q: '從 1 到 20 的正整數中，任取相異三個數，其總和為 3 的倍數的取法共有多少種？',
          a: '簡答：384 種。過程：依除以 3 的餘數分類，餘 0 有 6 個，餘 1、餘 2 各 7 個。可取 \\((0,0,0),(1,1,1),(2,2,2),(0,1,2)\\)，所以共有 \\(C(6,3)+C(7,3)+C(7,3)+6\\cdot7\\cdot7=384\\) 種。',
        },
        {
          q: '從 1 到 9 的自然數中，任取三個相異數，使其成等差數列的方法數為何？',
          a: '簡答：16 種。過程：設公差為 \\(d\\)。可行首項數為 \\(9-2d\\)，其中 \\(d=1,2,3,4\\)，總數為 \\(7+5+3+1=16\\) 種。',
        },
        {
          q: '從 1 到 9 的自然數中，任取三個相異數，使三數之和為奇數的方法數為何？',
          a: '簡答：40 種。過程：1 到 9 中奇數 5 個、偶數 4 個。三數和為奇數可為 1 奇 2 偶或 3 奇，所以有 \\(C(5,1)C(4,2)+C(5,3)=30+10=40\\) 種。',
        },
        {
          q: '自 \\(\\{1,2,3,\\ldots,11\\}\\) 中任取三個相異數，其中乘積為 5 的倍數的取法共有幾種？',
          a: '簡答：81 種。過程：全部取法為 \\(C(11,3)=165\\)。不含 5 的倍數表示不能取 5、10，剩 9 個可選，取法 \\(C(9,3)=84\\)。故答案為 \\(165-84=81\\) 種。',
        },
      ],
      count
    );
  }

  function buildS223NonAdjacentSelectionSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const n = randInt(8, 13);
            const k = randInt(3, 4);
            this._d = { n, k };
            return `在一排 ${n} 個座位中選取 ${k} 個，要求這${k === 3 ? '三' : '四'}個座位兩兩不相鄰，共有幾種選法？`;
          },
          get a() {
            const d = this._d || { n: 10, k: 3 };
            const total = combinationCount(d.n - d.k + 1, d.k);
            return `簡答：${total} 種。過程：選 ${d.k} 個不相鄰位置可用間隔法，等於 \\(C(${d.n}-${d.k}+1,${d.k})=C(${d.n - d.k + 1},${d.k})=${total}\\) 種。`;
          },
        },
        {
          get q() {
            const n = randInt(6, 10);
            this._n = n;
            return `一家公司計畫在 ${n} 天中選擇 2 天停水，若要求停水的兩天不相連，共有幾種選擇？`;
          },
          get a() {
            const n = this._n || 7;
            const total = combinationCount(n, 2) - (n - 1);
            return `簡答：${total} 種。過程：任選兩天有 \\(C(${n},2)=${combinationCount(n, 2)}\\) 種，相鄰兩天有 ${n - 1} 種，所以不相鄰有 \\(${combinationCount(n, 2)}-${n - 1}=${total}\\) 種。`;
          },
        },
        {
          q: '甲、乙、丙、丁 4 人在一排 14 個座位中就坐，若任意兩人之間至少有 2 個空位，坐法有多少種？',
          a: '簡答：1680 種。過程：先選 4 個互距至少 3 的座位，方法數為 \\(C(14-2(4-1),4)=C(8,4)=70\\)。再安排 4 人有 \\(4!\\) 種，共 \\(70\\cdot24=1680\\) 種。',
        },
        {
          q: '一列火車有 10 節車廂，指定其中 3 節作為餐車且兩兩不相鄰，共有幾種指定方法？',
          a: '簡答：56 種。過程：這是從 10 個位置選 3 個不相鄰位置，方法數為 \\(C(8,3)=56\\)。',
        },
        {
          q: '甲、乙兩人在一排 10 個座位中，選擇不相鄰的兩個座位坐下，共有幾種坐法？',
          a: '簡答：72 種。過程：先選不相鄰的兩座位，有 \\(C(10,2)-9=36\\) 種；再安排甲乙有 \\(2!\\) 種，所以共有 72 種。',
        },
      ],
      count
    );
  }

  function buildS223PokerDiceSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '一副 52 張撲克牌中任取 5 張，組成 Full House（三張同點數加二張同點數）的情形共有幾種？',
          a: '簡答：3744 種。過程：先選三張的點數 13 種，再選花色 \\(C(4,3)\\)；再選一個不同點數作為一對，有 12 種，花色 \\(C(4,2)\\)。總數為 \\(13C(4,3)\\cdot12C(4,2)=3744\\)。',
        },
        {
          q: '一副 52 張撲克牌中任取 5 張，組成 Two Pairs（二對）的情形共有幾種？',
          a: '簡答：123552 種。過程：先選兩個點數作為對子，有 \\(C(13,2)\\) 種，各選花色 \\(C(4,2)^2\\)。第五張點數不能相同，有 11 種，花色 4 種。總數為 \\(C(13,2)C(4,2)^2\\cdot11\\cdot4=123552\\)。',
        },
        {
          q: '一副 52 張撲克牌中任取 5 張，五張花色皆相同（同花順也一併計入）的情形共有幾種？',
          a: '簡答：5148 種。過程：先選花色 4 種，再從同花色 13 張中選 5 張，有 \\(C(13,5)\\) 種，共 \\(4C(13,5)=5148\\) 種。',
        },
        {
          q: '同時擲三粒可區分的骰子，若記錄三粒骰子的點數順序且點數和為 9，共有幾種結果？',
          a: '簡答：25 種。過程：設三粒點數為 \\(x,y,z\\)，\\(1\\le x,y,z\\le6\\)，且 \\(x+y+z=9\\)。正整數解原有 \\(C(8,2)=28\\) 組，扣掉某一粒超過 6 的 3 組，得 25 種。',
        },
        {
          q: '同時擲三粒可區分的骰子，若三粒點數大小不同且點數和為 9，共有幾種結果？',
          a: '簡答：18 種。過程：不計順序的點數組合為 \\((1,2,6),(1,3,5),(2,3,4)\\) 三組。每組三數皆不同，各有 \\(3!\\) 種排列，共 \\(3\\cdot6=18\\) 種。',
        },
      ],
      count
    );
  }

  function buildS223HockeyStickIdentitySet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const N = s242Pick([49, 59, 79, 89, 99, 119]);
            this._N = N;
            return `利用巴斯卡定理計算 \\(C(2,2)+C(3,2)+C(4,2)+\\cdots+C(${N},2)\\) 的總和。`;
          },
          get a() {
            const N = this._N || 99;
            const total = combinationCount(N + 1, 3);
            return `簡答：\\(C(${N + 1},3)=${total}\\)。過程：曲棍球棒公式給出 \\(C(2,2)+C(3,2)+\\cdots+C(${N},2)=C(${N + 1},3)\\)。`;
          },
        },
        {
          q: '求級數和 \\(C(5,0)+C(6,1)+C(7,2)+\\cdots+C(100,95)\\) 的簡化結果。',
          a: '簡答：\\(C(101,6)\\)。過程：將各項改寫為 \\(C(5,5)+C(6,5)+\\cdots+C(100,5)\\)，由曲棍球棒公式得 \\(C(101,6)\\)。',
        },
        {
          get q() {
            const N = s242Pick([59, 69, 79, 89, 99]);
            this._N = N;
            return `計算 \\(C(3,3)+C(4,3)+C(5,3)+\\cdots+C(${N},3)\\)。`;
          },
          get a() {
            const N = this._N || 89;
            return `簡答：\\(C(${N + 1},4)\\)。過程：由曲棍球棒公式，\\(\\sum_{r=3}^{${N}}C(r,3)=C(${N + 1},4)\\)。`;
          },
        },
        {
          q: '若 \\(C(3,3)+C(4,3)+\\cdots+C(m,3)=C(n,4)\\)，求 \\((m,n)\\) 的關係。',
          a: '簡答：\\(n=m+1\\)。過程：曲棍球棒公式說 \\(C(3,3)+C(4,3)+\\cdots+C(m,3)=C(m+1,4)\\)，所以 \\(n=m+1\\)。',
        },
        {
          q: '求滿足 \\(2000<C(n,1)+C(n,2)+\\cdots+C(n,n)<3000\\) 的正整數 \\(n\\)。',
          a: '簡答：\\(n=11\\)。過程：左式為 \\((2^n-1)\\)。因 \\(2000<2^n-1<3000\\)，即 \\(2001<2^n<3001\\)，只有 \\(2^{11}=2048\\) 符合。',
        },
      ],
      count
    );
  }

  function buildS223RestrictedIntegerSolutionsSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '將 24 顆雞蛋分裝到紅、黃、綠三個籃子，每籃均須有蛋，且黃、綠兩籃必須裝奇數顆，方法數為何？',
          a: '簡答：66 種。過程：設黃、綠分別為 \\(2a+1,2b+1\\)，紅籃為正整數。則紅籃加 \\(2a+2b=22\\)。令 \\(a+b=s\\)，\\(s=0\\) 到 10，共 \\(1+2+\\cdots+11=66\\) 種。',
        },
        {
          q: '求三元一次方程式 \\(x+y+z=20\\) 的正偶數解共有多少組。',
          a: '簡答：36 組。過程：令 \\(x=2a,y=2b,z=2c\\)，其中 \\(a,b,c\\) 為正整數，則 \\(a+b+c=10\\)，解數為 \\(C(9,2)=36\\)。',
        },
        {
          q: '求方程式 \\(x+y+z=10\\) 滿足 \\(x>3,y\\ge1,z>-2\\) 的整數解組數。',
          a: '簡答：28 組。過程：令 \\(X=x-4\\ge0,Y=y-1\\ge0,Z=z+1\\ge0\\)，則 \\(X+Y+Z=6\\)，非負整數解為 \\(C(8,2)=28\\)。',
        },
        {
          q: '求四元一次方程式 \\(x+y+z+u=16\\) 的正奇數解共有多少組。',
          a: '簡答：84 組。過程：令每個變數為 \\(2a+1\\) 的形式，化為四個非負整數和為 6，解數為 \\(C(9,3)=84\\)。',
        },
        {
          q: '在 1 到 1000 的自然數中，各位數字之和為 10 的數共有幾個？',
          a: '簡答：63 個。過程：將 1 到 999 視為三位數 \\(abc\\)（允許前導 0），求 \\(a+b+c=10\\)，且每位不超過 9。非負解 \\(C(12,2)=66\\)，扣掉某一位為 10 的 3 組，得 63 個；1000 的數字和為 1，不計入。',
        },
      ],
      count
    );
  }

  function buildS223MaximumCoefficientSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '求 \\((1+2x)^{21}\\) 展開式中，係數最大的項為第幾項？',
          a: '簡答：第 15 項。過程：設 \\(x^k\\) 項係數為 \\(a_k=C(21,k)2^k\\)。比值 \\(\\frac{a_{k+1}}{a_k}=\\frac{21-k}{k+1}\\cdot2\\)。由比值跨過 1 可得最大在 \\(k=14\\)，故為第 \\(14+1=15\\) 項。',
        },
        {
          q: '求 \\((2x+3y)^{15}\\) 展開式中，\\(x^{15-k}y^k\\) 項係數最大時的 \\(k\\) 值。',
          a: '簡答：\\(k=9\\)。過程：係數 \\(a_k=C(15,k)2^{15-k}3^k\\)。\\(\\frac{a_{k+1}}{a_k}=\\frac{15-k}{k+1}\\cdot\\frac32\\)，比較與 1 的大小，最大落在 \\(k=9\\)。',
        },
        {
          q: '在 \\((x+2)^{10}\\) 的展開式中，找出滿足 \\(a_{k-1}\\le a_k\\) 的所有 \\(k\\) 值，並求最大係數。',
          a: '簡答：\\(k=1,2,3,4,5,6,7\\)，最大係數為 15360。過程：\\(a_k=C(10,k)2^k\\)。由 \\(a_k/a_{k-1}=\\frac{11-k}{k}\\cdot2\\ge1\\) 得 \\(k\\le7\\)。最大項在比值由大於 1 轉小於 1 後，為 \\(a_7=C(10,7)2^7=15360\\)。',
        },
        {
          q: '設 \\((3x+2)^{12}\\) 展開式，求數值最大的項。',
          a: '簡答：第 6 項。過程：設取 \\(2\\) 的次數為 \\(k\\)，係數為 \\(a_k=C(12,k)3^{12-k}2^k\\)。比值 \\(a_{k+1}/a_k=\\frac{12-k}{k+1}\\cdot\\frac23\\)，最大在 \\(k=5\\)，所以是第 6 項。',
        },
        {
          q: '求 \\((1+\\frac12)^{10}\\) 展開式中，係數絕對值最大的項。',
          a: '簡答：第 4 項。過程：第 \\(k+1\\) 項係數大小為 \\(C(10,k)(\\frac12)^k\\)。比值為 \\(\\frac{10-k}{k+1}\\cdot\\frac12\\)，最大落在 \\(k=3\\)，即第 4 項。',
        },
      ],
      count
    );
  }

  function buildS223ConsecutiveCoefficientSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '若 \\((1+x)^n\\) 展開式中，\\(x^4,x^5,x^6\\) 三項係數成等差數列，求正整數 \\(n\\)。',
          a: '簡答：\\(n=7\\) 或 \\(14\\)。過程：條件為 \\(2C(n,5)=C(n,4)+C(n,6)\\)。代入組合數比值化簡，可得 \\(n=7\\) 或 \\(14\\)；例如 \\(n=14\\) 時係數為 1001、2002、3003，確為等差。',
        },
        {
          q: '若 \\((1+x)^n\\) 展開式中，\\(x,x^2,x^3\\) 三項係數成等差數列，求 \\(n\\)。',
          a: '簡答：\\(n=7\\)。過程：條件為 \\(2C(n,2)=C(n,1)+C(n,3)\\)。代入 \\(n=7\\) 得三項係數 7、21、35，公差皆為 14，符合等差。',
        },
        {
          q: '設 \\((1+x)^8\\) 展開式中連續三項係數 \\(C(8,2),C(8,3),C(8,4)\\)，判斷是否為等差數列。',
          a: '簡答：不是。過程：三項為 28、56、70，前後差分別為 28、14，不相等，所以不是等差數列。',
        },
        {
          q: '已知 \\((1+x)^7\\) 展開式中 \\(x^3,x^4,x^5\\) 的係數，判斷是否成等差數列。',
          a: '簡答：不是。過程：三項係數為 \\(C(7,3)=35,C(7,4)=35,C(7,5)=21\\)，差為 0 與 -14，不相等，所以不是等差數列。',
        },
        {
          q: '若 \\((1+x)^n\\) 展開式中有連續三項係數比為 \\(1:2:3\\)，請說明可如何轉成組合數方程。',
          a: '簡答：設三項為 \\(C(n,r),C(n,r+1),C(n,r+2)\\)，列 \\(C(n,r):C(n,r+1):C(n,r+2)=1:2:3\\)。過程：利用 \\(\\frac{C(n,r+1)}{C(n,r)}=\\frac{n-r}{r+1}\\)、\\(\\frac{C(n,r+2)}{C(n,r+1)}=\\frac{n-r-1}{r+2}\\)，即可轉成關於 \\(n,r\\) 的方程組。',
        },
      ],
      count
    );
  }

  function buildS223WeightedBinomialSumSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '求多項式 \\((1+x)+(1+x)^2+\\cdots+(1+x)^{10}\\) 展開式中，\\(x^2\\) 項的係數。',
          a: '簡答：165。過程：\\((1+x)^r\\) 中 \\(x^2\\) 係數為 \\(C(r,2)\\)，總和為 \\(C(2,2)+C(3,2)+\\cdots+C(10,2)=C(11,3)=165\\)。',
        },
        {
          q: '求 \\((1-x)^2+(1-x)^3+\\cdots+(1-x)^{20}\\) 展開式中，\\(x^4\\) 項的係數。',
          a: '簡答：20349。過程：\\(x^4\\) 的符號為正，係數和為 \\(C(4,4)+C(5,4)+\\cdots+C(20,4)=C(21,5)=20349\\)。',
        },
        {
          q: '計算 \\((1+x^2)+2(1+x^2)^2+\\cdots+15(1+x^2)^{15}\\) 展開式中，\\(x^4\\) 項的係數。',
          a: '簡答：6580。過程：第 \\(k\\) 項對 \\(x^4\\) 的貢獻為 \\(kC(k,2)\\)。所以係數為 \\(\\sum_{k=1}^{15}kC(k,2)=6580\\)。',
        },
        {
          q: '求 \\((x^2-2x+2)^{10}\\) 被 \\((x-1)^3\\) 除所得的餘式。',
          a: '簡答：\\(10x^2-20x+11\\)。過程：令 \\(t=x-1\\)，則 \\(x^2-2x+2=1+t^2\\)。模 \\(t^3\\) 時只留到二次，得 \\(1+10t^2=10x^2-20x+11\\)。',
        },
        {
          q: '計算 \\(1+C(n,1)(\\frac13)+C(n,2)(\\frac13)^2+\\cdots+C(n,n)(\\frac13)^n\\)。',
          a: '簡答：\\((\\frac43)^n\\)。過程：這正是 \\((1+\\frac13)^n\\) 的二項式展開，所以值為 \\((\\frac43)^n\\)。',
        },
      ],
      count
    );
  }

  function buildS223MultinomialExpansionSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const a = randInt(2, 3);
            const b = randInt(1, 2);
            const n = a + b + randInt(1, 3);
            this._d = { n, a, b, d: n - a - b };
            const term = `x^{${a}}y^{${b}}${this._d.d === 1 ? 'u' : `u^{${this._d.d}}`}`;
            return `在 \\((x+y+z+u)^{${n}}\\) 展開式中，求 \\(${term}\\) 項的係數。`;
          },
          get a() {
            const d = this._d || { n: 6, a: 3, b: 2, d: 1 };
            const total = factorialInt(d.n) / (factorialInt(d.a) * factorialInt(d.b) * factorialInt(d.d));
            return `簡答：${total}。過程：由多項式定理，該項的係數為 \\(\\frac{${d.n}!}{${d.a}!${d.b}!${d.d}!}=${total}\\)。`;
          },
        },
        {
          get q() {
            const n = randInt(8, 10);
            const a = randInt(2, 4);
            const b = randInt(1, 3);
            this._d = { n, a, b, c: n - a - b };
            return `求 \\((x+y+z)^{${n}}\\) 展開式中 \\(x^{${a}}y^{${b}}z^{${this._d.c}}\\) 項的係數。`;
          },
          get a() {
            const d = this._d || { n: 10, a: 3, b: 2, c: 5 };
            const total = factorialInt(d.n) / (factorialInt(d.a) * factorialInt(d.b) * factorialInt(d.c));
            return `簡答：${total}。過程：由多項式定理，係數為 \\(\\frac{${d.n}!}{${d.a}!${d.b}!${d.c}!}=${total}\\)。`;
          },
        },
        {
          q: '求 \\((1+2x+3x^2)^4\\) 展開式中，\\(x^2\\) 項的係數。',
          a: '簡答：36。過程：產生 \\(x^2\\) 有兩種：取一次 \\(3x^2\\)，貢獻 \\(4\\cdot3=12\\)；或取兩次 \\(2x\\)，貢獻 \\(C(4,2)2^2=24\\)。合計 36。',
        },
        {
          q: '多項式 \\((a+b+c+d)^6\\) 展開後，合併同類項後共有多少個相異項？',
          a: '簡答：84 項。過程：相異項對應 \\(a,b,c,d\\) 的非負指數和為 6，解數為 \\(C(6+4-1,4-1)=C(9,3)=84\\)。',
        },
        {
          q: '求 \\((x+y+\\frac1z)^6\\) 展開式中，不含 \\(z\\) 變數的項之係數總和。',
          a: '簡答：64。過程：不含 \\(z\\) 表示不取 \\(\\frac1z\\)，只從 \\(x,y\\) 選，共為 \\((x+y)^6\\)。係數總和令 \\(x=y=1\\)，得 \\(2^6=64\\)。',
        },
      ],
      count
    );
  }

  function buildS223ComplexBinomialIdentitySet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '利用 \\((1+i)^{50}\\) 展開式，求 \\(C(50,0)-C(50,2)+C(50,4)-\\cdots+C(50,50)\\) 之值。',
          a: '簡答：0。過程：此和為 \\((1+i)^{50}\\) 的實部。因 \\(1+i=\\sqrt2(\\cos45^\\circ+i\\sin45^\\circ)\\)，50 倍角的實部為 0。',
        },
        {
          q: '計算 \\(C(10,0)-C(10,2)+C(10,4)-C(10,6)+C(10,8)-C(10,10)\\)。',
          a: '簡答：0。過程：這是 \\((1+i)^{10}\\) 的實部，而 \\((1+i)^{10}=32i\\)，實部為 0。',
        },
        {
          q: '求 \\(C(50,0)-C(50,1)+C(50,2)-\\cdots+C(50,50)\\) 之值。',
          a: '簡答：0。過程：代入二項式 \\((1-1)^{50}\\)，得交錯和為 0。',
        },
        {
          q: '設 \\(n=12\\)，求 \\(C(12,0)+C(12,4)+C(12,8)+C(12,12)\\)。',
          a: '簡答：992。過程：直接計算 \\(1+495+495+1=992\\)。若用根號過濾法，也可篩出指數為 4 的倍數的係數和。',
        },
        {
          q: '利用二項式定理證明 \\((C(n,0))^2+(C(n,1))^2+\\cdots+(C(n,n))^2=C(2n,n)\\)。',
          a: '簡答：成立。過程：比較 \\((1+x)^n(1+x)^n=(1+x)^{2n}\\) 中 \\(x^n\\) 項係數即可。',
        },
      ],
      count
    );
  }

  function buildS223ProductPartitionSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '求方程式 \\(xy=2^5\\cdot3^4\\) 的正整數解共有多少組。',
          a: '簡答：30 組。過程：把 \\(2\\) 的 5 個指數分給 \\(x,y\\)，有 6 種；把 \\(3\\) 的 4 個指數分給 \\(x,y\\)，有 5 種，共 \\(6\\cdot5=30\\) 組。',
        },
        {
          q: '求方程式 \\(xyz=2^5\\cdot3^4\\) 的正整數解共有多少組。',
          a: '簡答：315 組。過程：\\(2\\) 的指數分給三個變數有 \\(C(7,2)=21\\) 種，\\(3\\) 的指數有 \\(C(6,2)=15\\) 種，共 \\(21\\cdot15=315\\) 組。',
        },
        {
          q: '求 \\(xyzu=2^6\\cdot3^2\\cdot5^4\\) 的正整數解個數。',
          a: '簡答：29400 組。過程：三個質因數的指數分配分別為 \\(C(9,3),C(5,3),C(7,3)\\)，所以總數為 \\(84\\cdot10\\cdot35=29400\\)。',
        },
        {
          q: '滿足 \\(xyz=4000\\) 的所有整數解（考慮正負號）共有多少組？',
          a: '簡答：840 組。過程：\\(4000=2^5\\cdot5^3\\)，正整數解有 \\(C(7,2)C(5,2)=210\\) 組。三個整數乘積為正，負號可為 0 個或 2 個，共 4 種符號，因此共有 \\(210\\cdot4=840\\) 組。',
        },
        {
          q: '若 \\(abc=5000\\)，求有序正整數組 \\((a,b,c)\\) 的總數。',
          a: '簡答：150 組。過程：\\(5000=2^3\\cdot5^4\\)。指數分配給三個變數，方法數為 \\(C(5,2)C(6,2)=10\\cdot15=150\\)。',
        },
      ],
      count
    );
  }

  function buildS223NestedSubsetsSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const n = randInt(5, 7);
            this._n = n;
            return `設 \\(T=\\{1,2,\\ldots,${n}\\}\\)，求滿足 \\(\\varnothing\\subset A\\subset B\\subset T\\) 的有序對 \\((A,B)\\) 共有多少組？`;
          },
          get a() {
            const n = this._n || 6;
            const total = Math.pow(3, n) - 3 * Math.pow(2, n) + 3;
            return `簡答：${total} 組。過程：每個元素可在 \\(A\\)、在 \\(B\\setminus A\\)、或在 \\(T\\setminus B\\) 三類。三類都要非空，所以用容斥得 \\(3^{${n}}-3\\cdot2^{${n}}+3=${total}\\)。`;
          },
        },
        {
          q: '設 \\(U\\) 有 \\(n\\) 個元素，求滿足 \\(A\\subseteq B\\subseteq U\\) 且 \\(A\\ne B\\) 的集合組數。',
          a: '簡答：\\(3^n-2^n\\) 組。過程：每個元素可在 \\(A\\)、在 \\(B\\setminus A\\)、或在 \\(U\\setminus B\\)，共 \\(3^n\\) 組。扣掉 \\(A=B\\) 時每元素只分在 A 或外面，共 \\(2^n\\)，得 \\(3^n-2^n\\)。',
        },
        {
          q: '已知集合 \\(A,B\\) 為 \\(U\\) 的子集，滿足 \\(A\\cap B=\\varnothing\\) 的取法共有多少種？設 \\(|U|=n\\)。',
          a: '簡答：\\(3^n\\) 種。過程：每個元素有三種狀態：放入 A、放入 B、兩者都不放。因不能同時放入 A 與 B，所以共有 \\(3^n\\) 種。',
        },
        {
          q: '給定 \\(n\\) 個元素，求滿足 \\(A\\cup B=U\\) 的子集對 \\((A,B)\\) 數量。',
          a: '簡答：\\(3^n\\) 組。過程：每個元素至少在 A 或 B 之一，可為只在 A、只在 B、同時在 A 與 B，共三種狀態，所以共有 \\(3^n\\)。',
        },
        {
          q: '若 \\(S=\\{1,2,3\\}\\)，寫出 \\(S\\) 的所有子集個數，並說明其原因。',
          a: '簡答：8 個。過程：每個元素都有「選」或「不選」兩種狀態，3 個元素共有 \\(2^3=8\\) 個子集。',
        },
      ],
      count
    );
  }

  function buildS223RunsCountingSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '將 5 個 A 和 3 個 B 任意排列，求連串數為 3 的排法共有幾種？',
          a: '簡答：6 種。過程：連串數為 3 時，可能型態為 A-B-A 或 B-A-B。A-B-A：5 個 A 分兩串有 \\(C(4,1)=4\\) 種；B-A-B：3 個 B 分兩串有 \\(C(2,1)=2\\) 種。合計 \\(4+2=6\\) 種。',
        },
        {
          q: '將 6 個 x 和 4 個 y 任意排列，求連串數為 5 的排法有多少種？',
          a: '簡答：45 種。過程：若 x 有 3 串、y 有 2 串，方法為 \\(C(5,2)C(3,1)=30\\)；若 x 有 2 串、y 有 3 串，方法為 \\(C(5,1)C(3,2)=15\\)。合計 45 種。',
        },
        {
          q: '將 5 個「+」號與 6 個「-」號排成一列，要求恰好出現 4 個變號，共有多少種排法？',
          a: '簡答：70 種。過程：4 個變號表示 5 個連串。依起始符號分兩類，再將 5 個加號與 6 個減號分配到對應串數，合計為 70 種。',
        },
        {
          q: '一列火車有 10 節車廂，指定 3 節附廁所且兩兩不相鄰，共有幾種指定方法？',
          a: '簡答：56 種。過程：從 10 個位置中選 3 個不相鄰位置，方法數為 \\(C(10-3+1,3)=C(8,3)=56\\)。',
        },
        {
          q: '由 0、2、4、6 四個數字組成四位數，其中至少有兩個 2 連續的數共有幾個？',
          a: '簡答：33 個。過程：數字取自 \\(\\{0,2,4,6\\}\\) 且首位不為 0（共 \\(3\\cdot4^3=192\\) 個）。用位置 (1,2)、(2,3)、(3,4) 出現「22」做容斥：\\(|A_{12}|=16\\)、\\(|A_{23}|=|A_{34}|=12\\)、\\(|A_{12}\\cap A_{23}|=4\\)、\\(|A_{23}\\cap A_{34}|=3\\)、\\(|A_{12}\\cap A_{34}|=1\\)，三者交集為 1。故含「22」者為 \\(16+12+12-4-3-1+1=33\\) 個。',
        },
      ],
      count
    );
  }

  function buildS223RationalIrrationalTermsSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '在 \\((\\sqrt3+\\sqrt[13]{5})^{10}\\) 的展開式中，為有理數的項共有幾項？',
          a: '簡答：1 項。過程：通項含 \\(3^{(10-k)/2}5^{k/13}\\)。因 \\(0\\le k\\le10\\)，要 \\(5\\) 的指數為整數只能 \\(k=0\\)，且此時 \\(3^5\\) 為有理數，所以只有 1 項。',
        },
        {
          q: '求 \\((\\sqrt2+\\sqrt3)^6\\) 展開後化為 \\(a+b\\sqrt6\\) 形式中的整數 \\(a,b\\)。',
          a: '簡答：\\(a=485,b=198\\)。過程：先平方得 \\((\\sqrt2+\\sqrt3)^2=5+2\\sqrt6\\)，所以六次方為 \\((5+2\\sqrt6)^3=485+198\\sqrt6\\)。',
        },
        {
          q: '求 \\((\\sqrt[16]{2}+3)^{60}\\) 展開式中，不含根號的項共有幾項？',
          a: '簡答：4 項。過程：取 \\(\\sqrt[16]{2}\\) 的次數為 \\(k\\)，需 \\(k\\) 為 16 的倍數。\\(0\\le k\\le60\\)，可為 0、16、32、48，共 4 項。',
        },
        {
          q: '在 \\((x+\\frac1{x^2})^{12}\\) 的展開式中，求有理式項的個數。',
          a: '簡答：13 項。過程：展開式每一項都是 \\(x\\) 的整數次方，因此都是有理式項；\\(k=0,1,\\ldots,12\\)，共有 13 項。',
        },
        {
          q: '計算 \\((\\sqrt2+1)^6-(\\sqrt2-1)^6\\) 化簡後的值。',
          a: '簡答：\\(140\\sqrt2\\)。過程：\\((1+\\sqrt2)^6=99+70\\sqrt2\\)，\\((\\sqrt2-1)^6=99-70\\sqrt2\\)，相減得 \\(140\\sqrt2\\)。',
        },
      ],
      count
    );
  }

  function buildS223PolynomialRemainderVariantsSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '求以 \\((x-1)^3\\) 除 \\((x^2-2x+2)^{10}\\) 所得餘式。',
          a: '簡答：\\(10x^2-20x+11\\)。過程：令 \\(t=x-1\\)，原式成為 \\((1+t^2)^{10}\\)。模 \\(t^3\\) 只留 \\(1+10t^2\\)，化回得 \\(10x^2-20x+11\\)。',
        },
        {
          q: '求 \\(x^{30}\\) 除以 \\((x-1)^3\\) 的餘式。',
          a: '簡答：\\(435x^2-840x+406\\)。過程：餘式設為二次式。用 \\(f(1)=1\\)、\\(f\\prime(1)=30\\)、\\(f\\prime\\prime(1)=870\\) 對應餘式及其導數在 1 的值，可解得 \\(435x^2-840x+406\\)。',
        },
        {
          q: '求以 \\((x+1)^3\\) 除 \\(x^{100}-2\\) 所得餘式。',
          a: '簡答：\\(4950x^2+9800x+4849\\)。過程：餘式設為 \\(ax^2+bx+c\\)。令 \\(f(x)=x^{100}-2\\)，利用在 \\(x=-1\\) 的函數值、一階導數、二階導數相同，解得餘式。',
        },
        {
          q: '利用二項式定理求 \\(11^{18}\\) 除以 1000 的餘數。',
          a: '簡答：481。過程：\\(11^{18}=(10+1)^{18}\\)。模 1000 時只需保留 \\(1+18\\cdot10+C(18,2)10^2\\)，得 \\(1+180+15300\\equiv481\\pmod {1000}\\)。',
        },
        {
          q: '證明 \\(19^{19}+1\\) 恆為 20 的倍數。',
          a: '簡答：成立。過程：\\(19\\equiv-1\\pmod {20}\\)，所以 \\(19^{19}+1\\equiv(-1)^{19}+1=0\\pmod {20}\\)。',
        },
      ],
      count
    );
  }

  function buildS223BinomialBasicsFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS223BinomialCoefficientSet,
        buildS223BinomialConstantTermSet,
        buildS223BinomialRemainderNumberSet,
        buildS223PolynomialRemainderBinomialSet,
        buildS223CombinationIdentitySet,
      ],
      count
    );
  }

  function buildS223CombinationCountingFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS223SubsetPropertySet,
        buildS223NonAdjacentSelectionSet,
        buildS223PokerDiceSet,
        buildS223HockeyStickIdentitySet,
        buildS223RestrictedIntegerSolutionsSet,
      ],
      count
    );
  }

  function buildS223AdvancedBinomialFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS223MaximumCoefficientSet,
        buildS223ConsecutiveCoefficientSet,
        buildS223WeightedBinomialSumSet,
        buildS223MultinomialExpansionSet,
        buildS223ComplexBinomialIdentitySet,
      ],
      count
    );
  }

  function buildS223ApplicationsFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS223ProductPartitionSet,
        buildS223NestedSubsetsSet,
        buildS223RunsCountingSet,
        buildS223RationalIrrationalTermsSet,
        buildS223PolynomialRemainderVariantsSet,
      ],
      count
    );
  }

  function buildS223BinomialCoefficientSubtypeSet(count) {
    return buildS223BinomialCoefficientSet(count);
  }

  function buildS223BinomialConstantTermSubtypeSet(count) {
    return buildS223BinomialConstantTermSet(count);
  }

  function buildS223BinomialRemainderNumberSubtypeSet(count) {
    return buildS223BinomialRemainderNumberSet(count);
  }

  function buildS223PolynomialRemainderBinomialSubtypeSet(count) {
    return buildS223PolynomialRemainderBinomialSet(count);
  }

  function buildS223CombinationIdentitySubtypeSet(count) {
    return buildS223CombinationIdentitySet(count);
  }

  function buildS223SubsetPropertySubtypeSet(count) {
    return buildS223SubsetPropertySet(count);
  }

  function buildS223NonAdjacentSelectionSubtypeSet(count) {
    return buildS223NonAdjacentSelectionSet(count);
  }

  function buildS223PokerDiceSubtypeSet(count) {
    return buildS223PokerDiceSet(count);
  }

  function buildS223HockeyStickIdentitySubtypeSet(count) {
    return buildS223HockeyStickIdentitySet(count);
  }

  function buildS223RestrictedIntegerSolutionsSubtypeSet(count) {
    return buildS223RestrictedIntegerSolutionsSet(count);
  }

  function buildS223MaximumCoefficientSubtypeSet(count) {
    return buildS223MaximumCoefficientSet(count);
  }

  function buildS223ConsecutiveCoefficientSubtypeSet(count) {
    return buildS223ConsecutiveCoefficientSet(count);
  }

  function buildS223WeightedBinomialSumSubtypeSet(count) {
    return buildS223WeightedBinomialSumSet(count);
  }

  function buildS223MultinomialExpansionSubtypeSet(count) {
    return buildS223MultinomialExpansionSet(count);
  }

  function buildS223ComplexBinomialIdentitySubtypeSet(count) {
    return buildS223ComplexBinomialIdentitySet(count);
  }

  function buildS223ProductPartitionSubtypeSet(count) {
    return buildS223ProductPartitionSet(count);
  }

  function buildS223NestedSubsetsSubtypeSet(count) {
    return buildS223NestedSubsetsSet(count);
  }

  function buildS223RunsCountingSubtypeSet(count) {
    return buildS223RunsCountingSet(count);
  }

  function buildS223RationalIrrationalTermsSubtypeSet(count) {
    return buildS223RationalIrrationalTermsSet(count);
  }

  function buildS223PolynomialRemainderVariantsSubtypeSet(count) {
    return buildS223PolynomialRemainderVariantsSet(count);
  }

  function buildS223DistinctEqualNamedDistributionSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const k = randInt(3, 4);
            this._k = k;
            return `將 ${3 * k} 本相異書平均分給 3 個人，每人各得 ${k} 本，共有多少種分法？`;
          },
          get a() {
            const k = this._k || 4;
            const total = factorialInt(3 * k) / Math.pow(factorialInt(k), 3);
            return `簡答：${total} 種。過程：3 個人是具名的，依序選書給三人，方法數為 \\(\\frac{${3 * k}!}{${k}!${k}!${k}!}=${total}\\) 種。`;
          },
        },
        {
          get q() {
            const p = randInt(3, 4);
            const k = 2;
            this._d = { p, k };
            return `將 ${p * k} 件相異玩具平均分給${p === 3 ? '甲、乙、丙三' : '甲、乙、丙、丁四'}人，每人 ${k} 件，共有多少種分法？`;
          },
          get a() {
            const d = this._d || { p: 3, k: 2 };
            const total = factorialInt(d.p * d.k) / Math.pow(factorialInt(d.k), d.p);
            return `簡答：${total} 種。過程：每人各得 ${d.k} 件依序選取，方法數為 \\(\\frac{${d.p * d.k}!}{${Array(d.p).fill(`${d.k}!`).join('')}}=${total}\\) 種。`;
          },
        },
        {
          q: '將 9 顆相異球平均分給 3 個相異箱子，每箱 3 顆，共有多少種分法？',
          a: '簡答：1680 種。過程：箱子有名稱，所以只除以每箱內部排列，方法數為 \\(\\frac{9!}{3!3!3!}=1680\\) 種。',
        },
        {
          q: '將 15 份相異禮物平均分給 5 位小朋友，每人 3 份，共有多少種分法？',
          a: '簡答：168168000 種。過程：5 位小朋友具名，方法數為 \\(\\frac{15!}{(3!)^5}=168168000\\) 種。',
        },
        {
          q: '將 8 張相異電影票平均分給 4 位學生，每人 2 張，共有多少種分法？',
          a: '簡答：2520 種。過程：4 位學生具名，方法數為 \\(\\frac{8!}{2!2!2!2!}=2520\\) 種。',
        },
      ],
      count
    );
  }

  function buildS223DistinctEqualUnnamedPilesSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const k = randInt(3, 4);
            this._k = k;
            return `將 ${3 * k} 本相異書平均分成 3 堆，每堆 ${k} 本，共有多少種分堆方法？`;
          },
          get a() {
            const k = this._k || 4;
            const total = factorialInt(3 * k) / (Math.pow(factorialInt(k), 3) * 6);
            return `簡答：${total} 種。過程：先按具名三堆分為 \\(\\frac{${3 * k}!}{${k}!${k}!${k}!}\\)，但三堆無名稱，要再除以 \\(3!\\)，所以為 \\(\\frac{${3 * k}!}{(${k}!)^3 3!}=${total}\\) 種。`;
          },
        },
        {
          get q() {
            const k = randInt(2, 3);
            this._k = k;
            return `將 ${3 * k} 件相異物品平均分成 3 堆，每堆 ${k} 個，共有多少種分堆方法？`;
          },
          get a() {
            const k = this._k || 2;
            const total = factorialInt(3 * k) / (Math.pow(factorialInt(k), 3) * 6);
            return `簡答：${total} 種。過程：三堆無名稱，方法數為 \\(\\frac{${3 * k}!}{(${k}!)^3 3!}=${total}\\) 種。`;
          },
        },
        {
          get q() {
            const m = randInt(3, 6);
            this._m = m;
            return `將 ${2 * m} 位學生平均分成 2 組進行討論，每組 ${m} 人，共有多少種分組方法？`;
          },
          get a() {
            const m = this._m || 5;
            const total = factorialInt(2 * m) / (factorialInt(m) * factorialInt(m) * 2);
            return `簡答：${total} 種。過程：兩組無名稱，方法數為 \\(\\frac{${2 * m}!}{${m}!${m}!2!}=${total}\\) 種。`;
          },
        },
        {
          q: '將 9 本相異雜誌平均分成 3 堆，每堆 3 本，共有多少種分堆方法？',
          a: '簡答：280 種。過程：三堆無名稱，方法數為 \\(\\frac{9!}{(3!)^3 3!}=280\\) 種。',
        },
        {
          q: '將 8 顆相異珠子平均分成 4 堆，每堆 2 顆，共有多少種分堆方法？',
          a: '簡答：105 種。過程：四堆無名稱，方法數為 \\(\\frac{8!}{(2!)^4 4!}=105\\) 種。',
        },
      ],
      count
    );
  }

  function buildS223DistinctSpecifiedPileSizesSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const k = randInt(2, 4);
            const s = k === 2 ? 1 : randInt(1, 2);
            this._d = { k, s };
            return `將 ${2 * k + s} 件相異玩具按 ${k} 件、${k} 件、${s} 件分成三堆，共有多少種分法？`;
          },
          get a() {
            const d = this._d || { k: 4, s: 1 };
            const n = 2 * d.k + d.s;
            const total = factorialInt(n) / (factorialInt(d.k) * factorialInt(d.k) * factorialInt(d.s) * 2);
            return `簡答：${total} 種。過程：堆沒有名稱，且兩堆大小同為 ${d.k}，需除以 \\(2!\\)。方法數為 \\(\\frac{${n}!}{${d.k}!${d.k}!${d.s}!2!}=${total}\\) 種。`;
          },
        },
        {
          q: '將 10 本相異書按 3 本、3 本、2 本、2 本分成四堆，共有多少種分法？',
          a: '簡答：6300 種。過程：兩堆 3 本彼此不可分，兩堆 2 本也不可分，所以方法數為 \\(\\frac{10!}{3!3!2!2!2!2!}=6300\\) 種。',
        },
        {
          q: '將 6 件相異物按 2 件、2 件、1 件、1 件分成四堆，共有多少種分法？',
          a: '簡答：45 種。過程：兩堆 2 件相同大小、兩堆 1 件相同大小，方法數為 \\(\\frac{6!}{2!2!1!1!2!2!}=45\\) 種。',
        },
        {
          q: '將 12 位學生按 5 位、5 位、2 位分成三組，共有多少種分組方法？',
          a: '簡答：8316 種。過程：兩組 5 人大小相同需除以 \\(2!\\)，方法數為 \\(\\frac{12!}{5!5!2!2!}=8316\\) 種。',
        },
        {
          q: '將 8 顆相異球按 3 顆、3 顆、1 顆、1 顆分成四堆，共有多少種分法？',
          a: '簡答：280 種。過程：兩堆 3 顆與兩堆 1 顆各自同大小，方法數為 \\(\\frac{8!}{3!3!1!1!2!2!}=280\\) 種。',
        },
      ],
      count
    );
  }

  function buildS223RestrictedGroupingDistributionSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '將 10 位同學分到 A、B、C 三車，A 車 4 人，B、C 車各 3 人，且甲、乙必同乘 A 車，共有多少種分法？',
          a: '簡答：560 種。過程：甲乙已在 A 車，再從其餘 8 人選 2 人補入 A 車，有 \\(C(8,2)\\) 種；剩下 6 人選 3 人到 B 車，其餘到 C 車，有 \\(C(6,3)\\) 種，共 \\(C(8,2)C(6,3)=560\\) 種。',
        },
        {
          q: '將 9 人組成三隊進行比賽，每隊 3 人，且甲、乙兩人不在同一隊，共有多少種分隊方法？',
          a: '簡答：210 種。過程：全部無名分隊為 \\(\\frac{9!}{(3!)^3 3!}=280\\)。甲乙同隊時，第三人有 7 種，剩下 6 人分成兩隊有 \\(\\frac{6!}{3!3!2!}=10\\) 種，共 70 種。故不在同隊為 \\(280-70=210\\) 種。',
        },
        {
          q: '將 8 位新生平均分發到甲、乙、丙、丁四班，且甲、乙、丙三人必在不同班，共有多少種分法？',
          a: '簡答：1440 種。過程：先安排甲、乙、丙到不同班，有 \\(4\\cdot3\\cdot2=24\\) 種。剩下 5 人填入容量為 1、1、1、2 的班級，方法數為 \\(\\frac{5!}{2!}=60\\)，共 \\(24\\cdot60=1440\\) 種。',
        },
        {
          q: '將 6 本相異書分給甲、乙、丙三人，其中一人得 3 本，一人得 2 本，一人得 1 本，共有多少種分法？',
          a: '簡答：360 種。過程：先決定誰得 3 本、誰得 2 本、誰得 1 本，有 \\(3!\\) 種；再分書有 \\(\\frac{6!}{3!2!1!}=60\\) 種，共 \\(3!\\cdot60=360\\) 種。',
        },
        {
          q: '將 10 位學生分住 A、B、C 三間房，容量分別為 4、3、3 人，且甲、乙、丙三人必住不同房，共有多少種分法？',
          a: '簡答：1260 種。過程：先將甲乙丙分到三間不同房，有 \\(3!\\) 種。剩下 7 人填入剩餘容量 3、2、2，方法數為 \\(\\frac{7!}{3!2!2!}=210\\)，共 \\(6\\cdot210=1260\\) 種。',
        },
      ],
      count
    );
  }

  function buildS223IdenticalDistributionSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const n = randInt(8, 12);
            const m = randInt(3, 4);
            this._d = { n, m };
            return `將 ${n} 顆相同的球放入 ${m} 個不同箱子，每箱球數不限，共有多少種放法？`;
          },
          get a() {
            const d = this._d || { n: 10, m: 4 };
            const total = combinationCount(d.n + d.m - 1, d.m - 1);
            return `簡答：${total} 種。過程：這是非負整數解 \\(x_1+\\cdots+x_{${d.m}}=${d.n}\\)，解數為 \\(C(${d.n + d.m - 1},${d.m - 1})=${total}\\) 種。`;
          },
        },
        {
          get q() {
            const n = randInt(7, 11);
            this._n = n;
            return `將 ${n} 本相同的練習簿全部分給 4 個小朋友，每人可得 0 本或多本，共有多少種分法？`;
          },
          get a() {
            const n = this._n || 9;
            const total = combinationCount(n + 3, 3);
            return `簡答：${total} 種。過程：求 \\(x_1+x_2+x_3+x_4=${n}\\) 的非負整數解，解數為 \\(C(${n + 3},3)=${total}\\)。`;
          },
        },
        {
          q: '將 5 枝相同紅筆與 4 枝相同藍筆全部分給 3 人，每人每色可得任意枝數，共有多少種分法？',
          a: '簡答：315 種。過程：紅筆分配有 \\(C(7,2)=21\\) 種，藍筆分配有 \\(C(6,2)=15\\) 種，兩者獨立，所以共有 \\(21\\cdot15=315\\) 種。',
        },
        {
          q: '將 8 把相同的愛心傘買給 3 個不同的俱樂部，每個俱樂部可得 0 把或多把，共有多少種分法？',
          a: '簡答：45 種。過程：求 \\(x_1+x_2+x_3=8\\) 的非負整數解，解數為 \\(C(10,2)=45\\)。',
        },
        {
          q: '將 20 顆相同的雞蛋分裝到紅、黃、綠三個不同籃子，每籃至少有一顆，共有多少種分法？',
          a: '簡答：171 種。過程：求正整數解 \\(x+y+z=20\\)。令 \\(X=x-1,Y=y-1,Z=z-1\\)，則 \\(X+Y+Z=17\\)，解數為 \\(C(19,2)=171\\)。',
        },
      ],
      count
    );
  }

  function buildS223GroupingDistributionFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS223DistinctEqualNamedDistributionSet,
        buildS223DistinctEqualUnnamedPilesSet,
        buildS223DistinctSpecifiedPileSizesSet,
        buildS223RestrictedGroupingDistributionSet,
        buildS223IdenticalDistributionSet,
      ],
      count
    );
  }

  function buildS223DistinctEqualNamedDistributionSubtypeSet(count) {
    return buildS223DistinctEqualNamedDistributionSet(count);
  }

  function buildS223DistinctEqualUnnamedPilesSubtypeSet(count) {
    return buildS223DistinctEqualUnnamedPilesSet(count);
  }

  function buildS223DistinctSpecifiedPileSizesSubtypeSet(count) {
    return buildS223DistinctSpecifiedPileSizesSet(count);
  }

  function buildS223RestrictedGroupingDistributionSubtypeSet(count) {
    return buildS223RestrictedGroupingDistributionSet(count);
  }

  function buildS223IdenticalDistributionSubtypeSet(count) {
    return buildS223IdenticalDistributionSet(count);
  }

  function buildS224ClassicalProbabilitySet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '同時擲三粒公正骰子，求點數和為 12 的機率。',
          a: '簡答：\\(\\frac{25}{216}\\)。過程：三粒骰子共有 \\(6^3=216\\) 種等可能結果。令三點數為 \\(x,y,z\\)，\\(x+y+z=12\\)，逐一計數可得 25 種，所以機率為 \\(\\frac{25}{216}\\)。',
        },
        {
          get q() {
            const n = randInt(4, 6);
            const k = randInt(2, n - 2);
            this._d = { n, k };
            return `連續丟一個均勻硬幣 ${n} 次，求恰好出現 ${k} 次正面的機率。`;
          },
          get a() {
            const d = this._d || { n: 5, k: 3 };
            const ways = combinationCount(d.n, d.k);
            const total = Math.pow(2, d.n);
            return `簡答：\\(${formatFraction(ways, total)}\\)。過程：${d.n} 次結果共有 \\(2^{${d.n}}=${total}\\) 種。恰好 ${d.k} 次正面有 \\(C(${d.n},${d.k})=${ways}\\) 種，因此機率為 \\(\\frac{${ways}}{${total}}=${formatFraction(ways, total)}\\)。`;
          },
        },
        {
          get q() {
            const n = s242Pick([6, 8]);
            this._n = n;
            return `甲、乙兩人各擲一粒公正${n === 6 ? '骰子' : '八面骰'}一次（點數 1 到 ${n}），求甲的點數大於乙的點數之機率。`;
          },
          get a() {
            const n = this._n || 6;
            const fav = (n * (n - 1)) / 2;
            return `簡答：\\(${formatFraction(fav, n * n)}\\)。過程：共有 ${n * n} 種結果。甲大於乙的情形為 \\(1+2+\\cdots+${n - 1}=${fav}\\) 種，所以機率為 \\(\\frac{${fav}}{${n * n}}=${formatFraction(fav, n * n)}\\)。`;
          },
        },
        {
          q: '由 1 到 7 中任取相異四數，求四數之和為奇數的機率。',
          a: '簡答：\\(\\frac{16}{35}\\)。過程：全部取法為 \\(C(7,4)=35\\)。1 到 7 中奇數 4 個、偶數 3 個。四數和為奇數需取 1 個奇數或 3 個奇數，方法數為 \\(C(4,1)C(3,3)+C(4,3)C(3,1)=16\\)，故機率為 \\(\\frac{16}{35}\\)。',
        },
        {
          q: '同時擲三粒公正骰子，求恰好有兩粒骰子點數相同的機率。',
          a: '簡答：\\(\\frac{5}{12}\\)。過程：全部結果為 216 種。恰好一對相同：先選成對點數 6 種，再選另一點數 5 種，再選單獨點數位置 3 種，共 90 種，所以機率為 \\(\\frac{90}{216}=\\frac{5}{12}\\)。',
        },
      ],
      count
    );
  }

  function buildS224ConditionalBayesSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '已知某家庭有兩個小孩，且至少有一個是男孩，求另一個也是男孩的機率。',
          a: '簡答：\\(\\frac{1}{3}\\)。過程：至少一男的可能為男男、男女、女男，共 3 種等可能情形；其中另一個也是男孩只有男男 1 種，所以機率為 \\(\\frac{1}{3}\\)。',
        },
        {
          get q() {
            const prev = s242Pick([1, 2, 5]);
            const sens = s242Pick([90, 95, 99]);
            const fp = s242Pick([5, 10]);
            this._d = { prev, sens, fp };
            return `某疾病盛行率為 ${prev}%，篩檢對病人呈陽性的機率為 ${sens}%，對健康者誤判陽性的機率為 ${fp}%。若一人檢測為陽性，求其實際患病的機率。`;
          },
          get a() {
            const d = this._d || { prev: 1, sens: 95, fp: 5 };
            const numer = d.prev * d.sens;
            const denom = d.prev * d.sens + (100 - d.prev) * d.fp;
            const prevText = (d.prev / 100).toFixed(2);
            const fpText = (d.fp / 100).toFixed(2);
            return `簡答：\\(${formatFraction(numer, denom)}\\)。過程：由貝氏定理，機率為 \\(\\frac{${prevText}\\cdot0.${d.sens}}{${prevText}\\cdot0.${d.sens}+0.${100 - d.prev}\\cdot${fpText}}=\\frac{${numer}}{${denom}}=${formatFraction(numer, denom)}\\)。`;
          },
        },
        {
          q: '某產品由甲、乙兩廠生產，甲廠占 60%、乙廠占 40%，不良率分別為 2%、5%。若抽中一件不良品，求它來自甲廠的機率。',
          a: '簡答：\\(\\frac{3}{8}\\)。過程：不良且來自甲的機率為 \\(0.6\\cdot0.02=0.012\\)，總不良機率為 \\(0.012+0.4\\cdot0.05=0.032\\)，故所求為 \\(\\frac{0.012}{0.032}=\\frac{3}{8}\\)。',
        },
        {
          q: '袋中有 3 紅球、2 白球、5 綠球，連取三次且每次放回。求三次中剛好各取到紅、白、綠各一次的機率。',
          a: '簡答：\\(\\frac{9}{50}\\)。過程：指定順序紅白綠的機率為 \\(\\frac3{10}\\cdot\\frac2{10}\\cdot\\frac5{10}\\)，三色可排列 \\(3!\\) 種，所以機率為 \\(6\\cdot\\frac3{10}\\cdot\\frac2{10}\\cdot\\frac5{10}=\\frac{9}{50}\\)。',
        },
        {
          q: '某測謊器對說謊者顯示說謊的機率為 90%，對誠實者誤判說謊的機率為 8%。若受測者中說謊者占 20%，且測謊器顯示說謊，求此人真的說謊的機率。',
          a: '簡答：\\(\\frac{45}{61}\\)。過程：由貝氏定理，分子為 \\(0.2\\cdot0.9=0.18\\)，分母為 \\(0.18+0.8\\cdot0.08=0.244\\)，所以機率為 \\(\\frac{0.18}{0.244}=\\frac{45}{61}\\)。',
        },
      ],
      count
    );
  }

  function buildS224IndependentRepeatedSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const a = s242Pick([3, 4, 6]);
            const b = s242Pick([5, 7]);
            this._d = { a, b };
            return `甲、乙兩人射擊命中率分別為 0.${a} 與 0.${b}，且互不影響。兩人各射一發，求至少一人命中的機率。`;
          },
          get a() {
            const d = this._d || { a: 4, b: 5 };
            const missNumer = (10 - d.a) * (10 - d.b);
            const hitNumer = 100 - missNumer;
            return `簡答：\\(${formatFraction(hitNumer, 100)}\\)。過程：至少一人命中可用反面事件。兩人都不中的機率為 \\(0.${10 - d.a}\\cdot0.${10 - d.b}=\\frac{${missNumer}}{100}\\)，故所求為 \\(1-\\frac{${missNumer}}{100}=${formatFraction(hitNumer, 100)}\\)。`;
          },
        },
        {
          q: '連續投擲一枚公正硬幣 \\(n\\) 次，若要「至少出現一次正面」的機率大於 0.999，求 \\(n\\) 的最小值。',
          a: '簡答：10。過程：至少一次正面的機率為 \\(1-(\\frac12)^n\\)。令 \\(1-(\\frac12)^n>0.999\\)，即 \\(2^n>1000\\)，最小正整數為 \\(n=10\\)。',
        },
        {
          get q() {
            const a = s242Pick([6, 7, 8, 9]);
            const b = s242Pick([5, 6, 7]);
            this._d = { a, b };
            return `一個電路有兩個開關串聯，兩個開關各自接通的機率為 0.${a} 與 0.${b}，且互相獨立。求電流能通過的機率。`;
          },
          get a() {
            const d = this._d || { a: 8, b: 7 };
            const numer = d.a * d.b;
            return `簡答：\\(${formatFraction(numer, 100)}\\)。過程：串聯電路需兩個開關都接通，所以機率為 \\(0.${d.a}\\cdot0.${d.b}=\\frac{${numer}}{100}=${formatFraction(numer, 100)}\\)。`;
          },
        },
        {
          q: '重複擲一粒公正骰子，求恰好在第 10 次出現第 3 個 6 點的機率。',
          a: '簡答：\\(C(9,2)(\\frac16)^3(\\frac56)^7\\)。過程：第 10 次必為 6；前 9 次中需恰有 2 次為 6，故機率為 \\(C(9,2)(\\frac16)^2(\\frac56)^7\\cdot\\frac16\\)。',
        },
        {
          q: '甲、乙、丙三人獨立解題，解出的機率分別為 0.2、0.3、0.4。求此題至少一人解出的機率。',
          a: '簡答：\\(\\frac{83}{125}\\)。過程：至少一人解出等於 1 減去三人都沒解出，故機率為 \\(1-0.8\\cdot0.7\\cdot0.6=0.664=\\frac{83}{125}\\)。',
        },
      ],
      count
    );
  }

  function buildS224DrawingAllocationSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const r = randInt(3, 5);
            const w = randInt(4, 7);
            this._d = { r, w };
            return `袋中有 ${r} 紅球、${w} 白球，每次取一球不放回，求紅球比白球先取完的機率。`;
          },
          get a() {
            const d = this._d || { r: 4, w: 5 };
            return `簡答：\\(${formatFraction(d.w, d.r + d.w)}\\)。過程：哪一色先取完只看最後一球的顏色。若最後一球為白球，表示紅球先取完。最後一球是白球的機率為 \\(${formatFraction(d.w, d.r + d.w)}\\)。`;
          },
        },
        {
          q: '從 6 雙大小不同的鞋子中任取 4 隻，求 4 隻中恰有 2 隻成一雙的機率。',
          a: '簡答：\\(\\frac{16}{33}\\)。過程：全部取法為 \\(C(12,4)=495\\)。先選成雙的一雙有 6 種，再從其餘 5 雙選 2 雙並各取一隻，有 \\(C(5,2)2^2=40\\) 種，故機率為 \\(\\frac{6\\cdot40}{495}=\\frac{16}{33}\\)。',
        },
        {
          get q() {
            const N = s242Pick([9, 11]);
            const m = randInt(4, N - 3);
            this._d = { N, m };
            return `從 1 到 ${N} 號球中任取 3 球，求所得號碼中位數為 ${m} 的機率。`;
          },
          get a() {
            const d = this._d || { N: 9, m: 6 };
            const fav = (d.m - 1) * (d.N - d.m);
            const total = combinationCount(d.N, 3);
            return `簡答：\\(${formatFraction(fav, total)}\\)。過程：要中位數為 ${d.m}，必須取到 ${d.m}，且另取一個小於 ${d.m} 與一個大於 ${d.m} 的號碼。方法數為 \\(${d.m - 1}\\cdot${d.N - d.m}=${fav}\\)，全部為 \\(C(${d.N},3)=${total}\\)，機率為 \\(\\frac{${fav}}{${total}}=${formatFraction(fav, total)}\\)。`;
          },
        },
        {
          q: '袋中有 5 紅球、3 白球，每次取一球不放回，連取 3 球，求至少取到 2 顆紅球的機率。',
          a: '簡答：\\(\\frac{5}{7}\\)。過程：全部取法為 \\(C(8,3)=56\\)。至少 2 顆紅球包含 2 紅 1 白與 3 紅，方法數為 \\(C(5,2)C(3,1)+C(5,3)=40\\)，所以機率為 \\(\\frac{40}{56}=\\frac{5}{7}\\)。',
        },
        {
          q: '將 5 個不同的球隨機放入 3 個不同箱子，求無空箱的機率。',
          a: '簡答：\\(\\frac{50}{81}\\)。過程：全部放法為 \\(3^5=243\\)。無空箱表示三箱皆至少一球，由容斥得 \\(3^5-3\\cdot2^5+3=150\\) 種，故機率為 \\(\\frac{150}{243}=\\frac{50}{81}\\)。',
        },
      ],
      count
    );
  }

  function buildS224AlgebraGeometryProbabilitySet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '擲骰子兩次分別得點數 \\(a,b\\)，求方程式 \\(x^2+ax+b=0\\) 有實根的機率。',
          a: '簡答：\\(\\frac{19}{36}\\)。過程：需判別式 \\(a^2-4b\\ge0\\)。當 \\(a=1,2,3,4,5,6\\) 時，可行的 \\(b\\) 個數分別為 0、1、2、4、6、6，共 19 種；總數 36 種。',
        },
        {
          q: '擲骰子兩次得 \\(a,b\\)，求方程式 \\(x^2+ax+b=0\\) 具有有理根的機率。',
          a: '簡答：\\(\\frac{7}{36}\\)。過程：需 \\(a^2-4b\\) 為非負完全平方數。逐一檢查 \\(1\\le a,b\\le6\\)，共有 7 組符合，因此機率為 \\(\\frac{7}{36}\\)。',
        },
        {
          q: '在數線上從原點出發，每次等機率向右或向左移動 1 單位。求 6 次後落在 \\(+4\\) 位置的機率。',
          a: '簡答：\\(\\frac{3}{32}\\)。過程：設向右 \\(r\\) 次、向左 \\(l\\) 次，則 \\(r+l=6\\)、\\(r-l=4\\)，得 \\(r=5,l=1\\)。機率為 \\(\\frac{C(6,1)}{2^6}=\\frac{3}{32}\\)。',
        },
        {
          q: '從 1 到 10 號卡片中任取 3 張，求三張號碼可構成直角三角形三邊長的機率。',
          a: '簡答：\\(\\frac{1}{60}\\)。過程：1 到 10 中可形成直角三角形的三元組為 \\((3,4,5)\\) 與 \\((6,8,10)\\)，共 2 組。全部取法 \\(C(10,3)=120\\)，故機率為 \\(\\frac{2}{120}=\\frac{1}{60}\\)。',
        },
        {
          q: '在邊長為 2 的正方形 \\(-1\\le x\\le1,-1\\le y\\le1\\) 中任取一點，求該點落在單位圓 \\(x^2+y^2\\le1\\) 內的機率。',
          a: '簡答：\\(\\frac{\\pi}{4}\\)。過程：正方形面積為 4，單位圓面積為 \\(\\pi\\)。均勻取點時機率等於面積比，故為 \\(\\frac{\\pi}{4}\\)。',
        },
      ],
      count
    );
  }

  function buildS224ExpectedValueSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '同時擲三枚均勻硬幣，若出現三正面得 5 元，二正面得 3 元，一正面得 1 元，零正面得 0 元。若要遊戲公平，入場費應為多少元？',
          a: '簡答：\\(\\frac{17}{8}\\) 元。過程：期望獎金為 \\(5\\cdot\\frac18+3\\cdot\\frac38+1\\cdot\\frac38+0\\cdot\\frac18=\\frac{17}{8}\\)。公平入場費等於期望獎金。',
        },
        {
          get q() {
            const a = randInt(2, 4);
            const b = randInt(4, 6);
            this._d = { a, b };
            return `摸彩箱有 50 張彩券，其中 100 元獎金 ${a} 張、50 元 ${b} 張，其餘為 20 元。求隨機抽一張所得獎金的期望值。`;
          },
          get a() {
            const d = this._d || { a: 3, b: 5 };
            const rest = 50 - d.a - d.b;
            const total = 100 * d.a + 50 * d.b + 20 * rest;
            return `簡答：\\(${formatFraction(total, 50)}\\) 元。過程：其餘 ${rest} 張為 20 元，期望為 \\(\\frac{${d.a}\\cdot100+${d.b}\\cdot50+${rest}\\cdot20}{50}=${formatFraction(total, 50)}\\)。`;
          },
        },
        {
          q: '某銀行對違約率 0.4 的客戶提供 21 萬元貸款。若未違約，一年後收回 21.5 萬元；若違約，貸款全損。求銀行此筆貸款的期望損益。',
          a: '簡答：\\(-\\frac{81}{10}\\) 萬元。過程：未違約機率為 0.6，獲利 0.5 萬元；違約機率 0.4，損失 21 萬元。期望損益為 \\(0.6\\cdot0.5-0.4\\cdot21=-\\frac{81}{10}\\)。',
        },
        {
          q: '投擲一個公正骰子，出現 \\(n\\) 點可得 \\(n\\) 元，若每玩一次需付 4 元，求長期平均每局輸贏。',
          a: '簡答：平均每局輸 \\(\\frac12\\) 元。過程：骰子點數期望為 \\(\\frac{1+2+3+4+5+6}{6}=\\frac72\\)。扣除費用 4 元，期望損益為 \\(\\frac72-4=-\\frac12\\)。',
        },
        {
          q: '一不公正骰子各面出現機率與點數成正比。若擲出 \\(k\\) 點（\\(k\\in\\{1,2,3,4,5,6\\}\\)）得 210 元，其餘點數均賠 \\(x\\) 元，求遊戲公平時的 \\(x\\) 值。',
          a: '簡答：\\(x=\\frac{210k}{21-k}\\)。過程：各面機率為 \\(\\frac{i}{1+2+\\cdots+6}=\\frac{i}{21}\\)。公平表示 \\(210\\cdot\\frac{k}{21}-x(1-\\frac{k}{21})=0\\)，解得 \\(x=\\frac{210k}{21-k}\\)。',
        },
      ],
      count
    );
  }

  function buildS224ProbabilitySetRelationsSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '已知 \\(P(A)=\\frac12\\)、\\(P(B)=\\frac13\\)。若 \\(p=P(A\\cup B)\\)，求 \\(p\\) 的可能範圍。',
          a: '簡答：\\(\\frac12\\le p\\le\\frac56\\)。過程：聯集最小至少為較大者 \\(\\frac12\\)，最大不超過兩者和 \\(\\frac12+\\frac13=\\frac56\\)，所以範圍為 \\([\\frac12,\\frac56]\\)。',
        },
        {
          q: '學生 100 人中，喜好音樂者 51 人，喜好運動者 70 人。求同時喜好兩者的人數 \\(a\\) 之最大值與最小值。',
          a: '簡答：最小 21 人，最大 51 人。過程：交集最大不能超過較小集合，故最大 51。交集最小為 \\(51+70-100=21\\)。',
        },
        {
          q: '若 \\(A\\subseteq B\\)，且 \\(P(A)=0.4\\)，判斷 \\(P(B)\\) 的最小值。',
          a: '簡答：0.4。過程：因為 \\(A\\subset B\\)，所以 \\(P(B)\\ge P(A)=0.4\\)，故最小值為 0.4。',
        },
        {
          q: '自 1 到 100 的自然數中任取一數，求該數為 2 的倍數或 3 的倍數之機率。',
          a: '簡答：\\(\\frac{67}{100}\\)。過程：2 的倍數有 50 個，3 的倍數有 33 個，同時為 6 的倍數有 16 個。由取捨原理得 \\(50+33-16=67\\)，機率為 \\(\\frac{67}{100}\\)。',
        },
        {
          q: '給定 \\(P(A)=a\\)、\\(P(B)=b\\)、\\(P(A\\cap B)=c\\)，以 \\(a,b,c\\) 表示 \\(P(A^{\\prime}\\cap B)\\)。',
          a: '簡答：\\(b-c\\)。過程：事件 \\(B\\) 可分成互斥的 \\(A\\cap B\\) 與 \\(A^{\\prime}\\cap B\\)，所以 \\(P(A^{\\prime}\\cap B)=P(B)-P(A\\cap B)=b-c\\)。',
        },
      ],
      count
    );
  }

  function buildS224DistributionProbabilitySet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '甲、乙等 10 人抽籤乘坐 A、B、C 三車，載客量分別為 4、3、3 人。求甲、乙兩人恰好同乘 A 車的機率。',
          a: '簡答：\\(\\frac{2}{15}\\)。過程：A 車 4 人可由 10 人中選出，共 \\(C(10,4)\\) 種。甲乙都在 A 車時，再從其餘 8 人選 2 人，有 \\(C(8,2)\\) 種，機率為 \\(\\frac{C(8,2)}{C(10,4)}=\\frac{2}{15}\\)。',
        },
        {
          q: '將 12 人平均分成甲、乙、丙三隊，求其中 A、B 二人被分在不同隊的機率。',
          a: '簡答：\\(\\frac{8}{11}\\)。過程：固定 A 所在隊後，該隊剩 3 個位置；其餘 11 個位置中有 8 個在別隊，所以 B 與 A 不同隊的機率為 \\(\\frac{8}{11}\\)。',
        },
        {
          q: '將 5 封相異信任意投入 3 個不同郵筒中，求恰有一個郵筒沒有信的機率。',
          a: '簡答：\\(\\frac{10}{27}\\)。過程：全部投法 \\(3^5=243\\)。恰一空箱：先選空箱 3 種，剩兩箱都非空有 \\(2^5-2=30\\) 種，共 90 種，機率 \\(\\frac{90}{243}=\\frac{10}{27}\\)。',
        },
        {
          q: '12 張標號 1 到 12 的卡片平均分成兩疊各 6 張，求 1、2、3 三張卡片都在同一疊的機率。',
          a: '簡答：\\(\\frac{2}{11}\\)。過程：選第一疊共有 \\(C(12,6)\\) 種。三張同疊有 \\(2C(9,3)\\) 種，所以機率為 \\(\\frac{2C(9,3)}{C(12,6)}=\\frac{2}{11}\\)。',
        },
        {
          q: '從 20 位男生與 15 位女生中選 3 位代表，求選出的 3 位同學中既有男生也有女生的機率。',
          a: '簡答：\\(\\frac{90}{119}\\)。過程：全部選法為 \\(C(35,3)\\)。扣掉全男與全女，機率為 \\(1-\\frac{C(20,3)+C(15,3)}{C(35,3)}=\\frac{90}{119}\\)。',
        },
      ],
      count
    );
  }

  function buildS224InfiniteGamesSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '甲、乙兩人輪流擲一公正骰子，約定先擲出 6 點者獲勝。若由甲先擲，求甲獲勝的機率。',
          a: '簡答：\\(\\frac{6}{11}\\)。過程：甲第一輪勝率為 \\(\\frac16\\)。若兩人都未擲出 6，機率為 \\((\\frac56)^2\\)，局面回到原狀。故 \\(p=\\frac16+(\\frac56)^2p\\)，解得 \\(p=\\frac6{11}\\)。',
        },
        {
          q: '甲、乙、丙三人依序輪流擲骰子，先擲出 6 點者獲勝。求乙獲勝的機率。',
          a: '簡答：\\(\\frac{30}{91}\\)。過程：乙在每一輪勝出需甲先失敗、乙成功，若三人都失敗則回到原狀。故 \\(p=\\frac56\\cdot\\frac16+(\\frac56)^3p\\)，解得 \\(p=\\frac{30}{91}\\)。',
        },
        {
          q: '青蛙在 A、B、C、D、E 五塊石頭排成的環上跳，每次等機率跳到相鄰石頭。若從 A 出發，求跳 2 次後回到 A 的機率。',
          a: '簡答：\\(\\frac12\\)。過程：第一次必到 B 或 E。若到 B，第二次回 A 的機率 \\(\\frac12\\)；若到 E，同理為 \\(\\frac12\\)。所以總機率為 \\(\\frac12\\)。',
        },
        {
          q: '某人每天走甲路遲到的機率為 0.1，走乙路遲到的機率為 0.2。若未遲到則隔天仍走同一路，遲到則隔天換路。第一天走甲路，求第三天也走甲路的機率。',
          a: '簡答：\\(\\frac{83}{100}\\)。過程：第三天走甲路表示前兩天換路次數為偶數。可能為兩天都未遲到：\\(0.9\\cdot0.9\\)，或第一天遲到換乙、第二天又遲到換回甲：\\(0.1\\cdot0.2\\)。合計 \\(0.81+0.02=0.83=\\frac{83}{100}\\)。',
        },
        {
          q: '擲一粒公正骰子直到連續兩次點數相同即停止。求恰好投擲 3 次即停止的機率。',
          a: '簡答：\\(\\frac{5}{36}\\)。過程：第 2 次須與第 1 次不同，機率 \\(\\frac56\\)；第 3 次須與第 2 次相同，機率 \\(\\frac16\\)。故機率為 \\(\\frac56\\cdot\\frac16=\\frac{5}{36}\\)。',
        },
      ],
      count
    );
  }

  function buildS224SamplingDiagnosticSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const N = s242Pick([20, 50, 100]);
            const sens = s242Pick([90, 99]);
            const fp = 10;
            this._d = { N, sens, fp };
            return `竊賊只有一人，${N} 名賓客受測。測謊器對說謊者顯示說謊率 ${sens}%，對誠實者誤判率 ${fp}%。若測謊器顯示某人說謊，求他真的是竊賊的機率。`;
          },
          get a() {
            const d = this._d || { N: 50, sens: 99, fp: 10 };
            const numer = d.sens;
            const denom = d.sens + (d.N - 1) * d.fp;
            return `簡答：\\(${formatFraction(numer, denom)}\\)。過程：先驗機率為 \\(\\frac1{${d.N}}\\)。由貝氏定理，所求為 \\(\\frac{\\frac1{${d.N}}\\cdot0.${d.sens}}{\\frac1{${d.N}}\\cdot0.${d.sens}+\\frac{${d.N - 1}}{${d.N}}\\cdot0.${d.fp}}=${formatFraction(numer, denom)}\\)。`;
          },
        },
        {
          get q() {
            const N = s242Pick([40, 50, 60]);
            const k = s242Pick([4, 5, 6]);
            this._d = { N, k };
            return `班級 ${N} 人。老師以簡單隨機抽樣抽選 ${k} 人，求某一位指定學生被抽中的機率。`;
          },
          get a() {
            const d = this._d || { N: 50, k: 5 };
            return `簡答：\\(${formatFraction(d.k, d.N)}\\)。過程：簡單隨機抽樣中每位學生地位相同，被抽中的機率為 \\(\\frac{${d.k}}{${d.N}}=${formatFraction(d.k, d.N)}\\)。`;
          },
        },
        {
          q: '某疾病盛行率 4%，陽性檢測準確率 97%，無病者誤檢陽性率 2%。若一人檢測呈陽性，求其確實患病的機率。',
          a: '簡答：\\(\\frac{97}{145}\\)。過程：由貝氏定理，所求為 \\(\\frac{0.04\\cdot0.97}{0.04\\cdot0.97+0.96\\cdot0.02}=\\frac{97}{145}\\)。',
        },
        {
          q: '甲、乙兩廠產量占 70% 與 30%，不良率分別為 1% 與 5%。抽出一不良品，求其來自甲廠的機率。',
          a: '簡答：\\(\\frac{7}{22}\\)。過程：不良且來自甲的機率為 \\(0.7\\cdot0.01=0.007\\)，總不良率為 \\(0.007+0.3\\cdot0.05=0.022\\)，故機率為 \\(\\frac{0.007}{0.022}=\\frac{7}{22}\\)。',
        },
        {
          q: '三所學校班級數分別為 3、4、5，隨機選兩班考國文。求兩班來自不同學校的機率。',
          a: '簡答：\\(\\frac{47}{66}\\)。過程：全部選法為 \\(C(12,2)=66\\)。不同學校的選法為 \\(3\\cdot4+3\\cdot5+4\\cdot5=47\\)，故機率為 \\(\\frac{47}{66}\\)。',
        },
      ],
      count
    );
  }

  function buildS224BasicProbabilityFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS224ClassicalProbabilitySet,
        buildS224ConditionalBayesSet,
        buildS224IndependentRepeatedSet,
        buildS224DrawingAllocationSet,
        buildS224AlgebraGeometryProbabilitySet,
      ],
      count
    );
  }

  function buildS224AppliedProbabilityFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS224ExpectedValueSet,
        buildS224ProbabilitySetRelationsSet,
        buildS224DistributionProbabilitySet,
        buildS224InfiniteGamesSet,
        buildS224SamplingDiagnosticSet,
      ],
      count
    );
  }

  function buildS224ClassicalProbabilitySubtypeSet(count) {
    return buildS224ClassicalProbabilitySet(count);
  }

  function buildS224ConditionalBayesSubtypeSet(count) {
    return buildS224ConditionalBayesSet(count);
  }

  function buildS224IndependentRepeatedSubtypeSet(count) {
    return buildS224IndependentRepeatedSet(count);
  }

  function buildS224DrawingAllocationSubtypeSet(count) {
    return buildS224DrawingAllocationSet(count);
  }

  function buildS224AlgebraGeometryProbabilitySubtypeSet(count) {
    return buildS224AlgebraGeometryProbabilitySet(count);
  }

  function buildS224ExpectedValueSubtypeSet(count) {
    return buildS224ExpectedValueSet(count);
  }

  function buildS224ProbabilitySetRelationsSubtypeSet(count) {
    return buildS224ProbabilitySetRelationsSet(count);
  }

  function buildS224DistributionProbabilitySubtypeSet(count) {
    return buildS224DistributionProbabilitySet(count);
  }

  function buildS224InfiniteGamesSubtypeSet(count) {
    return buildS224InfiniteGamesSet(count);
  }

  function buildS224SamplingDiagnosticSubtypeSet(count) {
    return buildS224SamplingDiagnosticSet(count);
  }

  function factorialInt(n) {
    let value = 1;
    for (let i = 2; i <= n; i += 1) value *= i;
    return value;
  }

  function buildS221ProductRuleParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const scenarios = [
      {
        lead: '某餐廳推出套餐',
        labels: ['主餐', '湯品', '飲料'],
        units: ['種', '種', '種'],
      },
      {
        lead: '服飾店設計穿搭',
        labels: ['上衣', '長褲', '鞋子'],
        units: ['件', '件', '雙'],
      },
      {
        lead: '文具店組合禮盒',
        labels: ['原子筆', '筆記本', '貼紙包'],
        units: ['款', '款', '款'],
      },
      {
        lead: '校外教學安排路線',
        labels: ['去程方案', '午餐方案', '回程方案'],
        units: ['種', '種', '種'],
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const scenario = scenarios[i % scenarios.length];
      const a = randInt(2, 6);
      const b = randInt(2, 5);
      const c = randInt(2, 6);
      const total = a * b * c;
      questions.push(
        `${scenario.lead}，共有 ${a} ${scenario.units[0]}${scenario.labels[0]}、${b} ${scenario.units[1]}${scenario.labels[1]}與 ${c} ${scenario.units[2]}${scenario.labels[2]}可供選擇。若每次各選 1 種，則共有多少種不同的搭配方式？`
      );
      answers.push(
        `簡答：${total} 種。過程：依乘法原理，${scenario.labels[0]}有 ${a} 種選法，${scenario.labels[1]}有 ${b} 種選法，${scenario.labels[2]}有 ${c} 種選法，所以總數為 ${a}\\times${b}\\times${c}=${total}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS221InclusionExclusionMultiplesSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const pairs = [
      [2, 3],
      [2, 5],
      [3, 4],
      [3, 5],
      [4, 5],
      [5, 6],
    ];

    for (let i = 0; i < count; i += 1) {
      const [a, b] = pairs[i % pairs.length];
      const scale = randInt(6, 18);
      const totalCount = a * b * scale;
      const countA = Math.floor(totalCount / a);
      const countB = Math.floor(totalCount / b);
      const countBoth = Math.floor(totalCount / lcm(a, b));
      const union = countA + countB - countBoth;
      const probability = simplifyFraction(union, totalCount);
      questions.push(`從 1 到 ${totalCount} 的整數中隨機任取 1 個，求此數為 ${a} 的倍數或 ${b} 的倍數的機率。`);
      answers.push(
        `簡答：\\(${formatFraction(probability.num, probability.den)}\\)。過程：${a} 的倍數有 ${countA} 個，${b} 的倍數有 ${countB} 個，同時為兩者倍數者是 ${lcm(a, b)} 的倍數，共 ${countBoth} 個。由取捨原理，可得符合者共有 ${countA}+${countB}-${countBoth}=${union} 個，所以機率為 \\(\\frac{${union}}{${totalCount}}=${formatFraction(probability.num, probability.den)}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS222RepeatedLetterPermutationParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const repeatedCounts = shuffle([2, 2, 3, 3, 4])
        .slice(0, randInt(2, 3))
        .sort((x, y) => y - x);
      const singleCount = randInt(1, 3);
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const parts = [];
      let totalLetters = singleCount;
      repeatedCounts.forEach((value, index) => {
        totalLetters += value;
        parts.push(`${letters[index]} 有 ${value} 個`);
      });
      if (singleCount > 0) {
        const singleLetters = letters.slice(repeatedCounts.length, repeatedCounts.length + singleCount).join('、');
        parts.push(`其餘 ${singleCount} 個字母 ${singleLetters} 各 1 個`);
      }
      let denominator = 1;
      const denominatorText = repeatedCounts.map((value) => `${value}!`).join('\\cdot');
      repeatedCounts.forEach((value) => {
        denominator *= factorialInt(value);
      });
      const total = factorialInt(totalLetters) / denominator;
      questions.push(
        `某字串共有 ${totalLetters} 個字母，其中 ${parts.join('，')}。若將這 ${totalLetters} 個字母全部重新排列，共有多少種不同的排法？`
      );
      answers.push(
        `簡答：${total} 種。過程：共有 ${totalLetters} 個位置可排，若全部視為相異，排法為 ${totalLetters}!；但相同字母互換不產生新排法，所以要除以重複字母的階乘積，得 \\(\\frac{${totalLetters}!}{${denominatorText}}=${total}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS222AdjacentPairArrangementParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = [
      { noun: '位同學', subject: '甲、乙兩人' },
      { noun: '本不同的書', subject: '數學課本與英文課本' },
      { noun: '位隊員', subject: '隊長與副隊長' },
      { noun: '張卡片', subject: 'A 卡與 B 卡' },
    ];

    for (let i = 0; i < count; i += 1) {
      const context = contexts[i % contexts.length];
      const n = randInt(5, 9);
      const total = 2 * factorialInt(n - 1);
      questions.push(`將 ${n} ${context.noun}排成一列，若要求 ${context.subject}必須相鄰，則共有多少種排列方式？`);
      answers.push(
        `簡答：${total} 種。過程：把 ${context.subject}視為一個整體，則原來 ${n} 個對象可先看成 ${n - 1} 個單位排列，有 \\((${n - 1})!\\) 種；而這兩個對象內部還可交換順序 2 種，所以總數為 \\(2\\times(${n - 1})!=${total}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS223BinomialCoefficientParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const n = randInt(4, 8);
      const q = randInt(1, n - 1);
      const p = n - q;
      const a = pickNonZero(-4, 4);
      const b = pickNonZero(-4, 4);
      const coefficient = combinationCount(n, q) * powInt(a, p) * powInt(b, q);
      const xTerm = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
      const yTerm = b === 1 ? 'y' : b === -1 ? '-y' : `${b}y`;
      const binomial = `${xTerm}${b >= 0 ? '+' : ''}${yTerm}`;
      questions.push(`展開 \\((${binomial})^{${n}}\\)，求 \\(x^{${p}}y^{${q}}\\) 項的係數。`);
      answers.push(
        `簡答：${coefficient}。過程：在 \\((${binomial})^{${n}}\\) 中，要得到 \\(x^{${p}}y^{${q}}\\)，需從 ${n} 個因式中選 ${q} 個取 \\(${yTerm}\\)，其餘 ${p} 個取 \\(${xTerm}\\)。所以係數為 \\(C(${n},${q})\\cdot(${a})^{${p}}\\cdot(${b})^{${q}}=${coefficient}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS223IdenticalDistributionParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = [
      { item: '顆相同的糖果', people: '位小朋友', each: '位小朋友', variable: 'x' },
      { item: '本相同的練習簿', people: '位學生', each: '位學生', variable: 'x' },
      { item: '顆相同的球', people: '個不同箱子', each: '個箱子', variable: 'x' },
      { item: '支相同的鉛筆', people: '位同學', each: '位同學', variable: 'x' },
    ];

    for (let i = 0; i < count; i += 1) {
      const context = contexts[i % contexts.length];
      const boxes = randInt(3, 5);
      const minEach = randInt(0, 2);
      const totalItems = randInt(boxes * Math.max(minEach, 1) + 2, boxes * Math.max(minEach, 1) + 10);
      const shiftedTotal = totalItems - boxes * minEach;
      const ways = combinationCount(shiftedTotal + boxes - 1, boxes - 1);
      const conditionText =
        minEach === 0 ? `每${context.each}可分到 0 個或多個` : `每${context.each}至少分到 ${minEach} 個`;
      questions.push(
        `將 ${totalItems} ${context.item}分給 ${boxes} ${context.people}，${conditionText}，共有多少種分法？`
      );
      if (minEach === 0) {
        answers.push(
          `簡答：${ways} 種。過程：設各對象分得數量為 \\(${context.variable}_1,${context.variable}_2,\\ldots,${context.variable}_${boxes}\\)，則需滿足非負整數解 \\(${context.variable}_1+${context.variable}_2+\\cdots+${context.variable}_${boxes}=${totalItems}\\)。由插板法，解數為 \\(C(${totalItems + boxes - 1},${boxes - 1})=${ways}\\)。`
        );
      } else {
        answers.push(
          `簡答：${ways} 種。過程：設各對象分得數量為 \\(${context.variable}_1,${context.variable}_2,\\ldots,${context.variable}_${boxes}\\)，且每個都至少 ${minEach} 個。令 \\(${context.variable}_i'=${context.variable}_i-${minEach}\\)，則轉成非負整數解 \\(${context.variable}_1'+${context.variable}_2'+\\cdots+${context.variable}_${boxes}'=${shiftedTotal}\\)。由插板法，解數為 \\(C(${shiftedTotal + boxes - 1},${boxes - 1})=${ways}\\)。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS224ExactKDrawProbabilityParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = [
      { good: '紅球', bad: '白球' },
      { good: '良品', bad: '不良品' },
      { good: '男生', bad: '女生' },
      { good: '數學書', bad: '英文書' },
    ];

    for (let i = 0; i < count; i += 1) {
      const context = contexts[i % contexts.length];
      const good = randInt(4, 8);
      const bad = randInt(4, 8);
      const draw = randInt(2, 4);
      const k = randInt(1, Math.min(good, draw - 1));
      const numerator = combinationCount(good, k) * combinationCount(bad, draw - k);
      const denominator = combinationCount(good + bad, draw);
      const probability = simplifyFraction(numerator, denominator);
      questions.push(
        `袋中有 ${good} 個${context.good}與 ${bad} 個${context.bad}，今一次不放回取出 ${draw} 個，求恰好取到 ${k} 個${context.good}的機率。`
      );
      answers.push(
        `簡答：\\(${formatFraction(probability.num, probability.den)}\\)。過程：全部取法共有 \\(C(${good + bad},${draw})=${denominator}\\) 種；恰好取到 ${k} 個${context.good}時，要從 ${good} 個${context.good}中取 ${k} 個，再從 ${bad} 個${context.bad}中取 ${draw - k} 個，所以有 \\(C(${good},${k})C(${bad},${draw - k})=${numerator}\\) 種。故機率為 \\(\\frac{${numerator}}{${denominator}}=${formatFraction(probability.num, probability.den)}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS224EventCountRelationsParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const total = randInt(24, 60);
      const aCount = randInt(8, Math.floor(total * 0.65));
      const bCount = randInt(8, Math.floor(total * 0.65));
      const minIntersection = Math.max(1, aCount + bCount - total);
      const maxIntersection = Math.min(aCount, bCount) - 1;
      const intersection = randInt(minIntersection, Math.max(minIntersection, maxIntersection));
      if (i % 2 === 0) {
        const union = aCount + bCount - intersection;
        const probability = simplifyFraction(union, total);
        questions.push(
          `在一個共有 ${total} 個等可能結果的樣本空間中，已知事件 \\(A\\) 有 ${aCount} 個結果、事件 \\(B\\) 有 ${bCount} 個結果，且 \\(A\\cap B\\) 有 ${intersection} 個結果。求 \\(P(A\\cup B)\\)。`
        );
        answers.push(
          `簡答：\\(${formatFraction(probability.num, probability.den)}\\)。過程：由取捨原理，\\(|A\\cup B|=|A|+|B|-|A\\cap B|=${aCount}+${bCount}-${intersection}=${union}\\)。因此 \\(P(A\\cup B)=\\frac{|A\\cup B|}{|S|}=\\frac{${union}}{${total}}=${formatFraction(probability.num, probability.den)}\\)。`
        );
      } else {
        const conditional = simplifyFraction(intersection, bCount);
        questions.push(
          `在一個共有 ${total} 個等可能結果的樣本空間中，已知事件 \\(A\\) 有 ${aCount} 個結果、事件 \\(B\\) 有 ${bCount} 個結果，且 \\(A\\cap B\\) 有 ${intersection} 個結果。求條件機率 \\(P(A\\mid B)\\)。`
        );
        answers.push(
          `簡答：\\(${formatFraction(conditional.num, conditional.den)}\\)。過程：條件機率定義為 \\(P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}=\\frac{|A\\cap B|}{|B|}=\\frac{${intersection}}{${bCount}}=${formatFraction(conditional.num, conditional.den)}\\)。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS224ExpectedValueParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const favoredFaces = randInt(2, 4);
        const gain = randInt(8, 20);
        const loss = randInt(2, 8);
        const numerator = favoredFaces * gain - (6 - favoredFaces) * loss;
        const expectation = simplifyFraction(numerator, 6);
        questions.push(
          `擲 1 枚公正骰子一次。若點數落在指定的 ${favoredFaces} 個得分面上，可得 ${gain} 元；其餘 ${6 - favoredFaces} 個面需付 ${loss} 元。求每玩一次的期望值。`
        );
        answers.push(
          `簡答：\\(${formatFraction(expectation.num, expectation.den)}\\) 元。過程：得 ${gain} 元的機率為 \\(\\frac{${favoredFaces}}{6}\\)，付 ${loss} 元的機率為 \\(\\frac{${6 - favoredFaces}}{6}\\)。所以期望值為 \\(\\frac{${favoredFaces}}{6}\\cdot${gain}-\\frac{${6 - favoredFaces}}{6}\\cdot${loss}=\\frac{${numerator}}{6}=${formatFraction(expectation.num, expectation.den)}\\) 元。`
        );
      } else {
        const red = randInt(3, 7);
        const white = randInt(3, 7);
        const gain = randInt(10, 30);
        const loss = randInt(4, 12);
        const numerator = red * gain - white * loss;
        const expectation = simplifyFraction(numerator, red + white);
        questions.push(
          `袋中有 ${red} 顆紅球與 ${white} 顆白球。任取 1 球後放回；若取到紅球可得 ${gain} 元，取到白球需付 ${loss} 元。求每次遊戲的期望值。`
        );
        answers.push(
          `簡答：\\(${formatFraction(expectation.num, expectation.den)}\\) 元。過程：取到紅球的機率為 \\(\\frac{${red}}{${red + white}}\\)，取到白球的機率為 \\(\\frac{${white}}{${red + white}}\\)。所以期望值為 \\(\\frac{${red}}{${red + white}}\\cdot${gain}-\\frac{${white}}{${red + white}}\\cdot${loss}=\\frac{${numerator}}{${red + white}}=${formatFraction(expectation.num, expectation.den)}\\) 元。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // ── NEW s2-2-2 / s2-2-4 PARAMETERIZED BUILDERS ────────────────────────────

  function buildS222SameGroupTogetherArrangementParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    const subjectPairs = [
      { labels: ['數學', '英文'], units: ['本', '本'] },
      { labels: ['數學', '英文', '國文'], units: ['本', '本', '本'] },
      { labels: ['物理', '化學'], units: ['本', '本'] },
      { labels: ['數學', '英文', '物理'], units: ['本', '本', '本'] },
    ];

    for (let i = 0; i < count; i += 1) {
      const subjectIdx = i % subjectPairs.length;
      const { labels, units } = subjectPairs[subjectIdx];
      const numGroups = labels.length;
      // Randomly pick 2-4 books per subject
      const groupSizes = labels.map(() => randInt(2, 4));
      const totalBooks = groupSizes.reduce((s, c) => s + c, 0);
      // Ways: treat each group as block → numGroups! × product(groupSize!)
      let withinWays = 1;
      groupSizes.forEach((k) => {
        withinWays *= factorialInt(k);
      });
      const total = factorialInt(numGroups) * withinWays;
      const bookDesc = labels.map((l, j) => `${groupSizes[j]} 本${l}書`).join('、');
      const withinStr = groupSizes.map((k) => `${k}!`).join('\\times');
      questions.push(
        `將${bookDesc}共 ${totalBooks} 本不同的書排成一列，要求相同科目的書必須排在一起，共有多少種排法？`
      );
      answers.push(
        `簡答：${total} 種。過程：把每科書視為一個整體，共 ${numGroups} 個整體，排列有 \\(${numGroups}!=${factorialInt(numGroups)}\\) 種；每科書內部各自全排列，共有 \\(${withinStr}=${withinWays}\\) 種。故總排法為 \\(${factorialInt(numGroups)}\\times${withinWays}=${total}\\) 種。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS222GenderNonAdjacentParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    const contexts = [
      { maleName: '男生', femaleName: '女生', lineType: '一列' },
      { maleName: '男隊員', femaleName: '女隊員', lineType: '一排' },
      { maleName: '男同學', femaleName: '女同學', lineType: '一列' },
    ];

    for (let i = 0; i < count; i += 1) {
      const ctx = contexts[i % contexts.length];
      const f = randInt(3, 5); // females
      const m = randInt(2, f); // males ≤ females (ensures non-adjacent is possible)
      // Females arranged: f! ways
      // Insert m males into f+1 gaps (choose m gaps, arrange m males): P(f+1, m)
      const femaleWays = factorialInt(f);
      const gapChoices = combinationCount(f + 1, m) * factorialInt(m); // P(f+1, m)
      const total = femaleWays * gapChoices;
      questions.push(
        `將 ${m} 位${ctx.maleName}和 ${f} 位${ctx.femaleName}排成${ctx.lineType}，若規定任意兩位${ctx.maleName}不相鄰，共有多少種排法？`
      );
      answers.push(
        `簡答：${total} 種。過程：先將 ${f} 位${ctx.femaleName}排成${ctx.lineType}，有 \\(${f}!=${femaleWays}\\) 種。再將 ${m} 位${ctx.maleName}插入 ${f} 位${ctx.femaleName}之間及兩端共 ${f + 1} 個空位，從中選 ${m} 個並安排，有 \\(P(${f + 1},${m})=${gapChoices}\\) 種。故共有 \\(${femaleWays}\\times${gapChoices}=${total}\\) 種。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS224ThreeSetInclusionExclusionParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        // Integer count version (class/survey)
        const total = randInt(40, 80);
        const a = randInt(10, 25);
        const b = randInt(10, 25);
        const c = randInt(10, 25);
        const ab = randInt(3, Math.min(Math.floor(a / 2), Math.floor(b / 2)));
        const bc = randInt(3, Math.min(Math.floor(b / 2), Math.floor(c / 2)));
        const ac = randInt(3, Math.min(Math.floor(a / 2), Math.floor(c / 2)));
        const abc = randInt(1, Math.min(ab, bc, ac) - 1 || 1);
        const unionCount = a + b + c - ab - bc - ac + abc;
        // Verify union ≤ total
        if (unionCount > total || unionCount <= 0) {
          // fallback to fixed values
          const fa = 18;
          const fb = 20;
          const fc = 22;
          const fab = 7;
          const fbc = 8;
          const fac = 6;
          const fabc = 3;
          const fu = fa + fb + fc - fab - fbc - fac + fabc;
          const ft = 60;
          questions.push(
            `某班 ${ft} 人，喜歡科目 A 的有 ${fa} 人、B 有 ${fb} 人、C 有 ${fc} 人，A 和 B 都喜歡有 ${fab} 人，B 和 C 都喜歡有 ${fbc} 人，A 和 C 都喜歡有 ${fac} 人，三科都喜歡有 ${fabc} 人。求至少喜歡一科的人數。`
          );
          answers.push(
            `簡答：${fu} 人。過程：由三集合取捨原理，至少一科 ＝ ${fa}+${fb}+${fc}-${fab}-${fbc}-${fac}+${fabc}=${fu} 人。`
          );
          continue;
        }
        questions.push(
          `某班 ${total} 人，喜歡 A 科的有 ${a} 人、喜歡 B 科的有 ${b} 人、喜歡 C 科的有 ${c} 人；A 和 B 都喜歡有 ${ab} 人、B 和 C 都喜歡有 ${bc} 人、A 和 C 都喜歡有 ${ac} 人；三科都喜歡有 ${abc} 人。求至少喜歡一科的人數。`
        );
        answers.push(
          `簡答：${unionCount} 人。過程：由三集合取捨原理 \\(|A\\cup B\\cup C|=|A|+|B|+|C|-|A\\cap B|-|B\\cap C|-|A\\cap C|+|A\\cap B\\cap C|\\)，代入得 \\(${a}+${b}+${c}-${ab}-${bc}-${ac}+${abc}=${unionCount}\\) 人。`
        );
      } else {
        // Probability version
        // 先產生互斥的文氏圖區塊，確保所有交集數據能對應到真實事件。
        const pabc = 1;
        const abOnly = randInt(0, 1);
        const bcOnly = randInt(0, 1);
        const acOnly = randInt(0, 1);
        const aOnly = randInt(0, 2);
        const bOnly = randInt(0, 2);
        const cOnly = randInt(0, 2);
        const pab = abOnly + pabc;
        const pbc = bcOnly + pabc;
        const pac = acOnly + pabc;
        const pa = aOnly + abOnly + acOnly + pabc;
        const pb = bOnly + abOnly + bcOnly + pabc;
        const pc = cOnly + acOnly + bcOnly + pabc;
        const den = 10;
        // P(A∪B∪C) = pa/den + pb/den + pc/den - pab/den - pbc/den - pac/den + pabc/den
        const unionNum = aOnly + bOnly + cOnly + abOnly + bcOnly + acOnly + pabc;
        const { num: sNum, den: sDen } = simplifyFraction(unionNum, den);
        questions.push(
          `設三個事件 \\(A,B,C\\)，已知 \\(P(A)=${pa}/${den}\\)，\\(P(B)=${pb}/${den}\\)，\\(P(C)=${pc}/${den}\\)，\\(P(A\\cap B)=${pab}/${den}\\)，\\(P(B\\cap C)=${pbc}/${den}\\)，\\(P(A\\cap C)=${pac}/${den}\\)，\\(P(A\\cap B\\cap C)=${pabc}/${den}\\)。求 \\(P(A\\cup B\\cup C)\\)。`
        );
        answers.push(
          `簡答：\\(${formatFraction(sNum, sDen)}\\)。過程：由三集合取捨公式，\\(P(A\\cup B\\cup C)=\\frac{${pa}+${pb}+${pc}-${pab}-${pbc}-${pac}+${pabc}}{${den}}=\\frac{${unionNum}}{${den}}=${formatFraction(sNum, sDen)}\\)。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS224ComplementIndependentParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    // Simple fraction pairs (pa_num/den, pb_num/den) for clean arithmetic
    const fracPool = [
      [1, 3],
      [2, 3],
      [1, 4],
      [3, 4],
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [1, 6],
      [5, 6],
      [1, 2],
    ];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      const [an, ad] = fracPool[randInt(0, fracPool.length - 1)];
      const [bn, bd] = fracPool[randInt(0, fracPool.length - 1)];

      if (mode === 0) {
        // Independent A,B. Given P(A), P(B). Find P(A^c ∩ B) = (1-P(A))×P(B)
        const commonDen = ad * bd;
        const anCommon = an * bd;
        const acn = commonDen - anCommon; // (1-P(A)) numerator in commonDen
        const resNum = acn * bn; // P(A^c)×P(B) = (acn/commonDen)×(bn/bd) = acn*bn / (commonDen*bd)
        const resDen = commonDen * bd;
        const { num: sn, den: sd } = simplifyFraction(resNum, resDen);
        questions.push(
          `設 \\(A\\)、\\(B\\) 為兩個獨立事件，\\(P(A)=\\frac{${an}}{${ad}}\\)，\\(P(B)=\\frac{${bn}}{${bd}}\\)。求 \\(P(A^c\\cap B)\\)。`
        );
        answers.push(
          `簡答：\\(${formatFraction(sn, sd)}\\)。過程：因為 \\(A\\) 與 \\(B\\) 獨立，\\(A^c\\) 與 \\(B\\) 也獨立。所以 \\(P(A^c\\cap B)=P(A^c)\\cdot P(B)=(1-\\frac{${an}}{${ad}})\\cdot\\frac{${bn}}{${bd}}=\\frac{${ad - an}}{${ad}}\\cdot\\frac{${bn}}{${bd}}=${formatFraction(sn, sd)}\\)。`
        );
      } else if (mode === 1) {
        // Independent A,B. Given P(A) and P(A∪B). Find P(B).
        // P(A∪B) = P(A)+P(B)-P(A)P(B) → P(B)(1-P(A)) = P(A∪B)-P(A)
        // Choose P(A∪B) > P(A) and compute P(B) = (P(AUB)-P(A)) / (1-P(A))
        // Use an/ad for P(A); construct P(A∪B) = (an*k + some) / (ad*k) to get nice P(B)
        // Simpler: pick P(B) first, then compute P(A∪B)
        const [pbn, pbd] = fracPool[randInt(0, fracPool.length - 1)];
        // P(A∪B) = an/ad + pbn/pbd - an*pbn/(ad*pbd)
        const unionDen = ad * pbd;
        const unionNum = an * pbd + pbn * ad - an * pbn;
        const { num: unum, den: uden } = simplifyFraction(unionNum, unionDen);
        // P(B) to find: pbn/pbd
        const { num: bnum, den: bden } = simplifyFraction(pbn, pbd);
        questions.push(
          `設 \\(A\\)、\\(B\\) 為兩個獨立事件，\\(P(A)=\\frac{${an}}{${ad}}\\)，\\(P(A\\cup B)=${formatFraction(unum, uden)}\\)。求 \\(P(B)\\)。`
        );
        answers.push(
          `簡答：\\(${formatFraction(bnum, bden)}\\)。過程：由獨立事件公式 \\(P(A\\cup B)=P(A)+P(B)-P(A)P(B)=P(A)+P(B)(1-P(A))\\)。代入得 \\(${formatFraction(unum, uden)}=\\frac{${an}}{${ad}}+P(B)\\cdot\\frac{${ad - an}}{${ad}}\\)，解得 \\(P(B)=${formatFraction(bnum, bden)}\\)。`
        );
      } else {
        // Independent A,B. Find P(A^c ∪ B^c) = 1 - P(A∩B) = 1 - P(A)P(B)
        const commonDen = ad * bd;
        const prodNum = an * bn;
        const resNum = commonDen - prodNum;
        const { num: sn, den: sd } = simplifyFraction(resNum, commonDen);
        questions.push(
          `設 \\(A\\)、\\(B\\) 為兩個獨立事件，\\(P(A)=\\frac{${an}}{${ad}}\\)，\\(P(B)=\\frac{${bn}}{${bd}}\\)。求 \\(P(A^c\\cup B^c)\\)。`
        );
        answers.push(
          `簡答：\\(${formatFraction(sn, sd)}\\)。過程：由笛摩根定律，\\(A^c\\cup B^c=(A\\cap B)^c\\)，所以 \\(P(A^c\\cup B^c)=1-P(A\\cap B)\\)。又因為 \\(A\\)、\\(B\\) 獨立，\\(P(A\\cap B)=P(A)\\cdot P(B)=\\frac{${an}}{${ad}}\\cdot\\frac{${bn}}{${bd}}=\\frac{${prodNum}}{${commonDen}}\\)。故 \\(P(A^c\\cup B^c)=1-\\frac{${prodNum}}{${commonDen}}=\\frac{${resNum}}{${commonDen}}=${formatFraction(sn, sd)}\\)。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS224BiasedBinomialAtLeastParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    // Simple probability fractions and their complements
    const pOptions = [
      { n: 1, d: 2, label: '\\frac{1}{2}', qLabel: '\\frac{1}{2}' },
      { n: 1, d: 3, label: '\\frac{1}{3}', qLabel: '\\frac{2}{3}' },
      { n: 2, d: 3, label: '\\frac{2}{3}', qLabel: '\\frac{1}{3}' },
      { n: 1, d: 4, label: '\\frac{1}{4}', qLabel: '\\frac{3}{4}' },
      { n: 3, d: 4, label: '\\frac{3}{4}', qLabel: '\\frac{1}{4}' },
      { n: 2, d: 5, label: '\\frac{2}{5}', qLabel: '\\frac{3}{5}' },
    ];
    const contexts = [
      { trial: '擲一枚不公正的硬幣', success: '正面' },
      { trial: '射擊一次', success: '命中目標' },
      { trial: '投籃一次', success: '進球' },
      { trial: '做一次實驗', success: '成功' },
    ];

    for (let i = 0; i < count; i += 1) {
      const pOpt = pOptions[randInt(0, pOptions.length - 1)];
      const ctx = contexts[i % contexts.length];
      const n = randInt(3, 6);
      const mode = i % 2;

      if (mode === 0) {
        // P(X≥1) = 1-(1-p)^n
        // (1-p)^n = (q)^n where q = 1 - p
        const qn = pOpt.d - pOpt.n; // q numerator
        const qd = pOpt.d; // q denominator
        // q^n = qn^n / qd^n
        const qpowN = powInt(qn, n);
        const qpowD = powInt(qd, n);
        const resNum = qpowD - qpowN;
        const resDen = qpowD;
        const { num: sn, den: sd } = simplifyFraction(resNum, resDen);
        questions.push(
          `${ctx.trial}${ctx.success}的機率為 \\(${pOpt.label}\\)。今${ctx.trial.replace('一次', '')} ${n} 次，求至少${ctx.success}一次的機率。`
        );
        answers.push(
          `簡答：\\(${formatFraction(sn, sd)}\\)。過程：設 \\(X\\) 為${ctx.success}次數，則 \\(X\\sim B(${n},${pOpt.label})\\)。用對立事件：\\(P(X\\geq 1)=1-P(X=0)=1-(1-${pOpt.label})^{${n}}=1-(\\frac{${qn}}{${qd}})^{${n}}=1-\\frac{${qpowN}}{${qpowD}}=\\frac{${resNum}}{${qpowD}}=${formatFraction(sn, sd)}\\)。`
        );
      } else {
        // P(X≥2) = 1 - P(X=0) - P(X=1)
        // P(X=0) = q^n, P(X=1) = n*p*q^(n-1)
        const pn = pOpt.n;
        const pd = pOpt.d;
        const qn = pd - pn;
        const qd = pd;
        const qpowN = powInt(qn, n);
        const qpowD = powInt(qd, n);
        const qpowNm1 = powInt(qn, n - 1);
        const qpowDm1 = powInt(qd, n - 1);
        // P(X=0) = qn^n / qd^n
        // P(X=1) = n * pn/pd * qn^(n-1)/qd^(n-1) = n*pn*qn^(n-1) / (pd*qd^(n-1)) = n*pn*qn^(n-1)/qd^n
        const px0Num = qpowN;
        const px0Den = qpowD;
        const px1Num = n * pn * qpowNm1;
        const px1Den = qpowD;
        const pAtLeast2Num = qpowD - qpowN - n * pn * qpowNm1;
        const pAtLeast2Den = qpowD;
        const { num: sn, den: sd } = simplifyFraction(pAtLeast2Num, pAtLeast2Den);
        if (pAtLeast2Num <= 0) {
          // Fallback to P(X≥1)
          const qpn2 = powInt(qn, n);
          const qpd2 = powInt(qd, n);
          const rn2 = qpd2 - qpn2;
          const { num: sn2, den: sd2 } = simplifyFraction(rn2, qpd2);
          questions.push(
            `${ctx.trial}${ctx.success}的機率為 \\(${pOpt.label}\\)。今重複 ${n} 次，求至少一次${ctx.success}的機率。`
          );
          answers.push(
            `簡答：\\(${formatFraction(sn2, sd2)}\\)。過程：\\(P(X\\geq 1)=1-P(X=0)=1-(\\frac{${qn}}{${qd}})^{${n}}=${formatFraction(sn2, sd2)}\\)。`
          );
          continue;
        }
        questions.push(
          `${ctx.trial}${ctx.success}的機率為 \\(${pOpt.label}\\)。今重複 ${n} 次，求至少${ctx.success}兩次的機率。`
        );
        answers.push(
          `簡答：\\(${formatFraction(sn, sd)}\\)。過程：\\(X\\sim B(${n},${pOpt.label})\\)。用對立事件：\\(P(X\\geq 2)=1-P(X=0)-P(X=1)=1-(\\frac{${qn}}{${qd}})^{${n}}-${n}\\cdot\\frac{${pn}}{${pd}}\\cdot(\\frac{${qn}}{${qd}})^{${n - 1}}=1-\\frac{${px0Num}}{${px0Den}}-\\frac{${px1Num}}{${px1Den}}=\\frac{${pAtLeast2Num}}{${pAtLeast2Den}}=${formatFraction(sn, sd)}\\)。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS224TotalProbabilityParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    const contexts = [
      { aName: '甲工廠', bName: '乙工廠', item: '零件', goodName: '良品' },
      { aName: 'A 班', bName: 'B 班', item: '選手', goodName: '勝出' },
      { aName: '機器甲', bName: '機器乙', item: '產品', goodName: '合格品' },
      { aName: '晴天', bName: '非晴天', item: '情況', goodName: '訂位達成' },
    ];

    // Use fractions with denominator 10 or 20 for clean arithmetic
    const paFracs = [
      [3, 10],
      [4, 10],
      [6, 10],
      [7, 10],
      [2, 5],
      [3, 5],
    ];
    const condFracs = [
      [8, 10],
      [9, 10],
      [7, 10],
      [6, 10],
      [4, 5],
      [3, 4],
    ];

    for (let i = 0; i < count; i += 1) {
      const ctx = contexts[i % contexts.length];
      const [pan, pad] = paFracs[randInt(0, paFracs.length - 1)];
      const [pba_n, pba_d] = condFracs[randInt(0, condFracs.length - 1)];
      const [pbac_n, pbac_d] = condFracs[randInt(0, condFracs.length - 1)];
      // P(A) = pan/pad, P(A^c) = 1 - pan/pad = (pad-pan)/pad
      // P(B|A) = pba_n/pba_d, P(B|A^c) = pbac_n/pbac_d
      // P(B) = P(A)*P(B|A) + P(A^c)*P(B|A^c)
      //      = pan/pad * pba_n/pba_d + (pad-pan)/pad * pbac_n/pbac_d
      const commonDen = pad * pba_d * pbac_d;
      const term1 = pan * pba_n * pbac_d;
      const term2 = (pad - pan) * pbac_n * pba_d;
      const pbNum = term1 + term2;
      const pbDen = commonDen;
      const { num: sn, den: sd } = simplifyFraction(pbNum, pbDen);
      questions.push(
        `已知 \\(P(A)=\\frac{${pan}}{${pad}}\\)，\\(P(B\\mid A)=\\frac{${pba_n}}{${pba_d}}\\)，\\(P(B\\mid A^c)=\\frac{${pbac_n}}{${pbac_d}}\\)。利用全機率公式求 \\(P(B)\\)。`
      );
      answers.push(
        `簡答：\\(${formatFraction(sn, sd)}\\)。過程：由全機率公式，\\(P(B)=P(A)\\cdot P(B\\mid A)+P(A^c)\\cdot P(B\\mid A^c)=\\frac{${pan}}{${pad}}\\cdot\\frac{${pba_n}}{${pba_d}}+\\frac{${pad - pan}}{${pad}}\\cdot\\frac{${pbac_n}}{${pbac_d}}=\\frac{${term1}+${term2}}{${commonDen}}=\\frac{${pbNum}}{${pbDen}}=${formatFraction(sn, sd)}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS224HypergeometricExpectedValueParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    const contexts = [
      { red: '紅球', white: '白球', bag: '袋中' },
      { red: '良品', white: '不良品', bag: '箱中' },
      { red: '男生', white: '女生', bag: '班上' },
      { red: '中獎彩券', white: '未中獎彩券', bag: '盒中' },
    ];

    for (let i = 0; i < count; i += 1) {
      const ctx = contexts[i % contexts.length];
      const R = randInt(3, 8); // red items
      const W = randInt(3, 8); // white items
      const N = R + W;
      const n = randInt(2, Math.min(5, N - 1)); // draw count
      // E(X) = n * R / N (exact via linearity / indicator variables)
      const { num: eNum, den: eDen } = simplifyFraction(n * R, N);
      questions.push(
        `${ctx.bag}有 ${R} 個${ctx.red}和 ${W} 個${ctx.white}，今一次不放回地取出 ${n} 個，設 \\(X\\) 為取出的${ctx.red}個數，求 \\(E(X)\\)。`
      );
      answers.push(
        `簡答：\\(E(X)=${formatFraction(eNum, eDen)}\\)。過程：設 \\(X_j\\) 為第 \\(j\\) 個取出的物品是${ctx.red}的指示隨機變數（\\(j=1,2,\\ldots,${n}\\)），則每個 \\(P(X_j=1)=\\frac{${R}}{${N}}\\)（對稱性）。由期望值線性性，\\(E(X)=\\sum_{j=1}^{${n}} E(X_j)=${n}\\cdot\\frac{${R}}{${N}}=\\frac{${n * R}}{${N}}=${formatFraction(eNum, eDen)}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS221LicensePlateRestrictionsParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const letterSlots = randInt(2, 3);
        const digitSlots = randInt(3, 5);
        const forbiddenLast = randInt(1, 9);
        const letterWays = 26 ** letterSlots;
        const digitWays = 10 ** (digitSlots - 1) * 9 - 1;
        const total = letterWays * digitWays;
        questions.push(
          `某車牌由 ${letterSlots} 個大寫英文字母後接 ${digitSlots} 個數字組成。若最後一位數字不能是 ${forbiddenLast}，且數字部分不能全為 0，共有多少種車牌？`
        );
        answers.push(
          `簡答：${total} 種。過程：英文字母有 \\(26^{${letterSlots}}=${letterWays}\\) 種。數字部分最後一位不能是 ${forbiddenLast}，先有 \\(10^{${digitSlots - 1}}\\times9=${10 ** (digitSlots - 1) * 9}\\) 種；其中全為 0 的情形仍需排除 1 種，所以數字部分有 \\(${digitWays}\\) 種。總數為 \\(${letterWays}\\times${digitWays}=${total}\\) 種。`
        );
      } else if (mode === 1) {
        const digitSlots = 4;
        const target = randInt(1, 9);
        const total = 26 * (10 ** digitSlots - 10 ** (digitSlots - 2) * 9 * 9);
        questions.push(
          `舊型車牌共有 2 個大寫英文字母與 ${digitSlots} 個數字。若第一個英文字母固定，且最後兩個數字至少有一個是 ${target}，共有多少種車牌？`
        );
        answers.push(
          `簡答：${total} 種。過程：第二個英文字母有 26 種。數字部分先看全部 \\(10^${digitSlots}\\) 種，再扣掉最後兩位都不是 ${target} 的情形：前 ${digitSlots - 2} 位有 \\(10^{${digitSlots - 2}}\\) 種，末兩位各有 9 種，所以數字部分有 \\(10^${digitSlots}-10^{${digitSlots - 2}}\\times9\\times9=${10 ** digitSlots - 10 ** (digitSlots - 2) * 9 * 9}\\) 種。總數為 \\(26\\times${10 ** digitSlots - 10 ** (digitSlots - 2) * 9 * 9}=${total}\\) 種。`
        );
      } else {
        const hiddenDigits = randInt(1, 3);
        const hiddenLetters = randInt(1, 2);
        const total = 10 ** hiddenDigits * 26 ** hiddenLetters;
        questions.push(
          `某車牌有 ${hiddenDigits} 個數字與 ${hiddenLetters} 個大寫英文字母無法辨識。若其他位置都已確定，至多需要比對多少輛車？`
        );
        answers.push(
          `簡答：${total} 輛。過程：每個未知數字有 10 種可能，每個未知英文字母有 26 種可能，因此共有 \\(10^{${hiddenDigits}}\\times26^{${hiddenLetters}}=${total}\\) 種可能。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS221DistinctDistributionAtLeastParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function ontoCount(items, people) {
      let total = 0;
      for (let missing = 0; missing <= people; missing += 1) {
        const term = combinationCount(people, missing) * (people - missing) ** items;
        total += missing % 2 === 0 ? term : -term;
      }
      return total;
    }

    for (let i = 0; i < count; i += 1) {
      const items = randInt(5, 8);
      const people = randInt(3, 4);
      const mode = i % 3;
      if (mode === 0) {
        const total = people ** items - (people - 1) ** items;
        questions.push(
          `將 ${items} 件不同的獎品全部分給 ${people} 位同學，每件獎品只能給一人。若甲至少得到一件，共有多少種分法？`
        );
        answers.push(
          `簡答：${total} 種。過程：全部分法為 \\(${people}^{${items}}\\)。甲一件都沒有時，每件只能分給其他 ${people - 1} 人，有 \\(${people - 1}^{${items}}\\) 種。因此甲至少一件有 \\(${people}^{${items}}-${people - 1}^{${items}}=${total}\\) 種。`
        );
      } else if (mode === 1) {
        const total = people ** items - 2 * (people - 1) ** items + (people - 2) ** items;
        questions.push(`將 ${items} 件不同的獎品全部分給 ${people} 位同學。若甲、乙都至少得到一件，共有多少種分法？`);
        answers.push(
          `簡答：${total} 種。過程：用取捨原理。全部 \\(${people}^{${items}}\\) 種；甲沒得或乙沒得各有 \\(${people - 1}^{${items}}\\) 種；甲乙都沒得有 \\(${people - 2}^{${items}}\\) 種。所以答案為 \\(${people}^{${items}}-2\\cdot${people - 1}^{${items}}+${people - 2}^{${items}}=${total}\\) 種。`
        );
      } else {
        const total = ontoCount(items, people);
        questions.push(`將 ${items} 件不同的獎品全部分給 ${people} 位同學，且每人至少得到一件，共有多少種分法？`);
        answers.push(
          `簡答：${total} 種。過程：每人至少一件是「相異物分配到相異人且不得空手」。用取捨原理：\\(\\sum_{j=0}^{${people}}(-1)^j C(${people},j)(${people}-j)^{${items}}=${total}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS221FerryCapacityAssignmentParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function capacityWays(people, boats, cap, fixedFirstBoat = false) {
      const loads = Array(boats).fill(0);
      let total = 0;
      function walk(index, remaining) {
        if (index === boats - 1) {
          if (remaining > cap) return;
          loads[index] = remaining;
          let ways = factorialInt(people);
          loads.forEach((load) => {
            ways /= factorialInt(load);
          });
          total += ways;
          return;
        }
        for (let load = 0; load <= Math.min(cap, remaining); load += 1) {
          loads[index] = load;
          walk(index + 1, remaining - load);
        }
      }
      if (fixedFirstBoat) {
        loads[0] = 1;
        const restLoads = Array(boats).fill(0);
        let restTotal = 0;
        function restWalk(index, remaining) {
          if (index === boats) {
            if (remaining === 0) {
              const finalLoads = restLoads.slice();
              finalLoads[0] += 1;
              let ways = factorialInt(people - 1);
              finalLoads[0] -= 1;
              finalLoads.forEach((load) => {
                ways /= factorialInt(load);
              });
              restTotal += ways;
            }
            return;
          }
          const localCap = index === 0 ? cap - 1 : cap;
          for (let load = 0; load <= Math.min(localCap, remaining); load += 1) {
            restLoads[index] = load;
            restWalk(index + 1, remaining - load);
          }
        }
        restWalk(0, people - 1);
        return restTotal;
      }
      walk(0, people);
      return total;
    }

    for (let i = 0; i < count; i += 1) {
      const boats = 3;
      const cap = randInt(3, 5);
      const people = cap + randInt(1, 2);
      if (i % 2 === 0) {
        const total = capacityWays(people, boats, cap);
        const invalid = people === cap + 1 ? 3 : 3 + 6 * people;
        const invalidText =
          people === cap + 1
            ? `超載只會是 ${people} 人全在同一船，共 3 種`
            : `超載包含 ${people} 人全在同一船 3 種，以及某船 ${cap + 1} 人、另一船 1 人，共 \\(3\\times2\\times${people}=${6 * people}\\) 種`;
        questions.push(
          `${boats} 艘不同的渡船，每艘最多載 ${cap} 人。今有 ${people} 位乘客同時渡河，共有多少種安全乘載方法？`
        );
        answers.push(
          `簡答：${total} 種。過程：不管容量時，每人有 3 種選擇，共 \\(3^{${people}}=${3 ** people}\\) 種。排除超載情形：${invalidText}。所以安全乘載方法為 \\(${3 ** people}-${invalid}=${total}\\) 種。`
        );
      } else {
        const total = capacityWays(people, boats, cap, true);
        const invalid = people === cap + 1 ? 1 : 2 * cap + 5;
        const invalidText =
          people === cap + 1
            ? `只有其餘 ${people - 1} 人全搭 A 船會使 A 船超載，共 1 種`
            : `A 船超載有其餘 ${people - 1} 人全搭 A 船 1 種，或只有 1 人不搭 A 船共 \\(2\\times${people - 1}\\) 種；另有其餘 ${people - 1} 人全搭 B 船或全搭 C 船共 2 種，所以超載共 ${invalid} 種`;
        questions.push(
          `${boats} 艘不同的渡船，每艘最多載 ${cap} 人。今有 ${people} 位乘客同時渡河，若甲指定搭 A 船，共有多少種安全乘載方法？`
        );
        answers.push(
          `簡答：${total} 種。過程：先固定甲在 A 船，其餘 ${people - 1} 人各有 3 種選擇，共 \\(3^{${people - 1}}=${3 ** (people - 1)}\\) 種。排除超載情形：${invalidText}。所以共有 \\(${3 ** (people - 1)}-${invalid}=${total}\\) 種。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS222AdjacentPairEndRestrictionParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const n = randInt(5, 15);
      const totalAdjacent = 2 * factorialInt(n - 1);
      const badEnds = 4 * factorialInt(n - 2);
      const total = totalAdjacent - badEnds;
      questions.push(`${n} 位同學排成一列，其中甲不可排在首位或末位，且乙、丙必須相鄰，共有多少種排法？`);
      answers.push(
        `簡答：${total} 種。過程：先把乙、丙視為一塊，內部有 2 種，故相鄰總排法為 \\(2\\cdot${n - 1}!=${totalAdjacent}\\)。再扣掉甲在首或末的情形：甲固定一端時，乙丙仍成一塊，排法為 \\(2\\cdot${n - 2}!\\)，兩端共 \\(4\\cdot${n - 2}!=${badEnds}\\)。所以答案為 \\(${totalAdjacent}-${badEnds}=${total}\\) 種。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS222SameTypeNonAdjacentProgramsParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = [
      { special: '歌唱節目', otherA: '樂器演奏', otherB: '話劇' },
      { special: '舞蹈表演', otherA: '合唱', otherB: '短劇' },
      { special: '實驗展示', otherA: '演講', otherB: '問答活動' },
    ];
    for (let i = 0; i < count; i += 1) {
      const ctx = contexts[i % contexts.length];
      const special = randInt(2, 4);
      const a = randInt(2, 3);
      const b = randInt(2, 3);
      const others = a + b;
      const total = factorialInt(others) * combinationCount(others + 1, special) * factorialInt(special);
      questions.push(
        `同樂會有 ${a} 個${ctx.otherA}、${b} 個${ctx.otherB}、${special} 個${ctx.special}，所有節目皆不同。若 ${special} 個${ctx.special}都不相鄰，共有多少種演出順序？`
      );
      answers.push(
        `簡答：${total} 種。過程：先排非${ctx.special}的 ${others} 個節目，有 \\(${others}!=${factorialInt(others)}\\) 種。此時產生 ${others + 1} 個空位，從中選 ${special} 個放入${ctx.special}，並排列這 ${special} 個節目，有 \\(C(${others + 1},${special})\\cdot${special}!\\) 種。總數為 \\(${factorialInt(others)}\\times C(${others + 1},${special})\\times${special}!=${total}\\) 種。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS222RepeatedDigitLeadingZeroParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const zeroCount = randInt(1, 4);
      const pairCount = randInt(2, 5);
      const totalDigits = zeroCount + 2 * pairCount;
      const allWays =
        factorialInt(totalDigits) / (factorialInt(zeroCount) * factorialInt(pairCount) * factorialInt(pairCount));
      const leadingZeroWays =
        zeroCount > 0
          ? factorialInt(totalDigits - 1) /
            (factorialInt(zeroCount - 1) * factorialInt(pairCount) * factorialInt(pairCount))
          : 0;
      const total = allWays - leadingZeroWays;
      questions.push(
        `用 ${zeroCount} 個 0、${pairCount} 個 1、${pairCount} 個 2 排成 ${totalDigits} 位數，共可排成多少個不同的正整數？`
      );
      answers.push(
        `簡答：${total} 個。過程：先不管首位限制，不盡相異排列有 \\(\\frac{${totalDigits}!}{${zeroCount}!${pairCount}!${pairCount}!}=${allWays}\\) 種。首位為 0 時，剩下 ${totalDigits - 1} 位有 \\(\\frac{${totalDigits - 1}!}{${zeroCount - 1}!${pairCount}!${pairCount}!}=${leadingZeroWays}\\) 種。故可形成的正整數有 \\(${allWays}-${leadingZeroWays}=${total}\\) 個。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS222OrderedBlocksInternalPermutationParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const labels = ['冠軍獎盃', '亞軍獎盃', '季軍獎盃'];
    for (let i = 0; i < count; i += 1) {
      const sizes = [randInt(2, 4), randInt(3, 5), randInt(2, 4)];
      const total = sizes.reduce((product, size) => product * factorialInt(size), 1);
      questions.push(
        `有 ${sizes[0]} 座${labels[0]}、${sizes[1]} 座${labels[1]}、${sizes[2]} 座${labels[2]}（每座獎盃皆不同）要排成一列。若相同獎項放在一起，且由左至右固定為冠軍、亞軍、季軍，共有多少種排法？`
      );
      answers.push(
        `簡答：${total} 種。過程：三類獎盃的區塊順序已固定，不需再乘 \\(3!\\)。只需排列各區塊內部，故共有 \\(${sizes[0]}!\\times${sizes[1]}!\\times${sizes[2]}!=${total}\\) 種。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS221HandshakeCouplesParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const couples = randInt(5, 18);
      const manMan = combinationCount(couples, 2);
      const manWoman = couples * (couples - 1);
      const total = manMan + manWoman;
      questions.push(
        `有 ${couples} 對夫妻參加聚會。每位先生會和所有不是自己與不是自己太太的人握手；太太之間都不握手。若每兩人最多握手一次，則全場共有多少次握手？`
      );
      answers.push(
        `簡答：${total} 次。過程：先生與先生握手有 \\(C(${couples},2)=${manMan}\\) 次；先生與太太握手時，每位先生不和自己的太太握手，所以有 \\(${couples}\\times(${couples}-1)=${manWoman}\\) 次。太太之間不握手，因此總數為 \\(${manMan}+${manWoman}=${total}\\) 次。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS221FixedEndNoRepeatScheduleParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function fixedEndWays(days, choices) {
      let sameAsFirst = 1;
      let differentFromFirst = 0;
      for (let day = 2; day <= days; day += 1) {
        const nextSame = differentFromFirst;
        const nextDifferent = sameAsFirst * (choices - 1) + differentFromFirst * (choices - 2);
        sameAsFirst = nextSame;
        differentFromFirst = nextDifferent;
      }
      return sameAsFirst;
    }

    const contexts = [
      { place: '餐廳', action: '用餐' },
      { place: '咖啡店', action: '買飲料' },
      { place: '自習教室', action: '自習' },
      { place: '運動場地', action: '練習' },
    ];

    for (let i = 0; i < count; i += 1) {
      const context = contexts[i % contexts.length];
      const choices = randInt(4, 8);
      const days = randInt(4, 7);
      const total = fixedEndWays(days, choices);
      questions.push(
        `某人連續 ${days} 天要從 ${choices} 個${context.place}中各選 1 個去${context.action}。已知第 1 天與第 ${days} 天都固定去 A，且相鄰兩天不可去同一個${context.place}，共有多少種安排？`
      );
      answers.push(
        `簡答：${total} 種。過程：用狀態分成「當天在 A」與「當天不在 A」。第 1 天為 A，所以 \\((同,異)=(1,0)\\)。每天轉移時，\\(同' = 異\\)，\\(異' = 同\\times(${choices}-1)+異\\times(${choices}-2)\\)。連續推到第 ${days} 天，落在 A 的安排數為 ${total} 種。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS221AmbidextrousPairingParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    const contexts = [
      { activity: '桌球雙打', unit: '名選手' },
      { activity: '羽球雙打', unit: '名選手' },
      { activity: '實驗分工', unit: '名同學' },
    ];

    for (let i = 0; i < count; i += 1) {
      const context = contexts[i % contexts.length];
      const rightOnly = randInt(2, 6);
      const leftOnly = randInt(2, 5);
      const both = randInt(1, 4);
      const rightLeft = rightOnly * leftOnly;
      const oneBoth = both * (rightOnly + leftOnly);
      const bothBoth = combinationCount(both, 2);
      const total = rightLeft + oneBoth + bothBoth;
      questions.push(
        `某${context.activity}社團中，有 ${rightOnly} ${context.unit}只能用右手、${leftOnly} ${context.unit}只能用左手、${both} ${context.unit}左右手皆可。若要選出 2 人，使兩人可分配成一位右手、一位左手，共有多少種選法？`
      );
      answers.push(
        `簡答：${total} 種。過程：可分三類計數：右手專長配左手專長有 \\(${rightOnly}\\times${leftOnly}=${rightLeft}\\) 種；左右手皆可的人搭配任一專長者有 \\(${both}\\times(${rightOnly}+${leftOnly})=${oneBoth}\\) 種；兩位皆可者互配有 \\(C(${both},2)=${bothBoth}\\) 種。因此共有 \\(${rightLeft}+${oneBoth}+${bothBoth}=${total}\\) 種。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS222SpecifiedNonAdjacentParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = [
      { noun: '位同學', specials: '甲、乙、丙' },
      { noun: '張不同卡片', specials: 'A、B、C' },
      { noun: '位選手', specials: '隊長、副隊長、紀錄員' },
      { noun: '個不同節目', specials: '開場、壓軸、頒獎' },
    ];

    for (let i = 0; i < count; i += 1) {
      const context = contexts[i % contexts.length];
      const totalObjects = randInt(6, 10);
      const special = randInt(2, Math.min(3, totalObjects - 3));
      const others = totalObjects - special;
      const total = factorialInt(others) * combinationCount(others + 1, special) * factorialInt(special);
      const specialText = special === 3 ? context.specials : context.specials.split('、').slice(0, 2).join('、');
      questions.push(
        `將 ${totalObjects} ${context.noun}排成一列，其中 ${specialText} 這 ${special} 個指定對象任兩個都不可相鄰，共有多少種排法？`
      );
      answers.push(
        `簡答：${total} 種。過程：先排其餘 ${others} 個對象，有 \\(${others}!=${factorialInt(others)}\\) 種。排好後形成 ${others + 1} 個空位，從中選 ${special} 個放入指定對象，並排列指定對象，有 \\(C(${others + 1},${special})\\cdot${special}!\\) 種。所以共有 \\(${others}!\\times C(${others + 1},${special})\\times${special}!=${total}\\) 種。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS223BinomialAdjacentRatioParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function ratioEntry(n, r) {
      const values = [combinationCount(n, r - 1), combinationCount(n, r), combinationCount(n, r + 1)];
      const g = values.reduce((acc, value) => gcdInt(acc, value), values[0]);
      return values.map((value) => value / g);
    }

    function isUniqueRatio(ratio) {
      let hits = 0;
      let result = null;
      for (let n = 4; n <= 30; n += 1) {
        for (let r = 1; r <= n - 1; r += 1) {
          const candidate = ratioEntry(n, r);
          if (candidate[0] === ratio[0] && candidate[1] === ratio[1] && candidate[2] === ratio[2]) {
            hits += 1;
            result = { n, r };
          }
        }
      }
      return hits === 1 ? result : null;
    }

    for (let i = 0; i < count; i += 1) {
      let n = 8;
      let r = 3;
      let ratio = ratioEntry(n, r);
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const candidateN = randInt(7, 18);
        const candidateR = randInt(2, candidateN - 2);
        const candidateRatio = ratioEntry(candidateN, candidateR);
        const unique = isUniqueRatio(candidateRatio);
        if (unique && unique.n === candidateN && unique.r === candidateR) {
          n = candidateN;
          r = candidateR;
          ratio = candidateRatio;
          break;
        }
      }
      questions.push(
        `已知 \\(C(n,r-1):C(n,r):C(n,r+1)=${ratio[0]}:${ratio[1]}:${ratio[2]}\\)，且 \\(1\\le r\\le n-1\\)。求 \\(n\\) 與 \\(r\\)。`
      );
      answers.push(
        `簡答：\\(n=${n},\\ r=${r}\\)。過程：相鄰組合數比值滿足 \\(\\frac{C(n,r)}{C(n,r-1)}=\\frac{n-r+1}{r}=\\frac{${ratio[1]}}{${ratio[0]}}\\)，且 \\(\\frac{C(n,r+1)}{C(n,r)}=\\frac{n-r}{r+1}=\\frac{${ratio[2]}}{${ratio[1]}}\\)。聯立兩式可解得 \\(n=${n}\\)、\\(r=${r}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS224GridComparisonProbabilityParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const maxDigit = randInt(3, 14);
      const favorablePair = combinationCount(maxDigit, 2);
      const totalPair = maxDigit * maxDigit;
      const numerator = favorablePair * favorablePair;
      const denominator = totalPair * totalPair;
      const probability = simplifyFraction(numerator, denominator);
      questions.push(
        `用 1 到 ${maxDigit} 的整數隨機填入 \\(2\\times2\\) 方格的四個位置 A、B、C、D，每格獨立且可重複。求同時滿足 \\(A>B\\) 且 \\(C>D\\) 的機率。`
      );
      answers.push(
        `簡答：\\(${formatFraction(probability.num, probability.den)}\\)。過程：一組有序數對 \\((A,B)\\) 共有 \\(${maxDigit}^2=${totalPair}\\) 種，滿足 \\(A>B\\) 的有 \\(C(${maxDigit},2)=${favorablePair}\\) 種。同理 \\((C,D)\\) 也有 ${favorablePair} 種有利情形。故機率為 \\(\\frac{${favorablePair}^2}{${totalPair}^2}=\\frac{${numerator}}{${denominator}}=${formatFraction(probability.num, probability.den)}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS224OverlapDaysOffProbabilityParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const days = randInt(7, 14);
      const off = randInt(2, Math.min(5, Math.floor(days / 2)));
      const totalSecond = combinationCount(days, off);
      const disjoint = days - off >= off ? combinationCount(days - off, off) : 0;
      const favorable = totalSecond - disjoint;
      const probability = simplifyFraction(favorable, totalSecond);
      questions.push(
        `甲、乙兩人各自從 ${days} 天中選 ${off} 天休假，且每種選法等可能。若甲的休假日已決定，求乙至少有 1 天與甲同休的機率。`
      );
      answers.push(
        `簡答：\\(${formatFraction(probability.num, probability.den)}\\)。過程：乙的全部選法有 \\(C(${days},${off})=${totalSecond}\\) 種。用對立事件，乙完全不與甲同休時，只能從甲未休的 ${days - off} 天中選 ${off} 天，有 \\(C(${days - off},${off})=${disjoint}\\) 種。因此至少同休 1 天的機率為 \\(1-\\frac{${disjoint}}{${totalSecond}}=\\frac{${favorable}}{${totalSecond}}=${formatFraction(probability.num, probability.den)}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS231BasicUngroupedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const nOpts = [5, 8, 10, 12, 15, 20];
    const muOpts = [10, 20, 25, 30, 40, 50, 60, 70, 80];
    const sigOpts = [2, 3, 4, 5, 6, 8, 10];
    for (let i = 0; i < count; i++) {
      const mode = i % 3;
      if (mode === 0) {
        // Mode 0: Given Σx and Σx², find mean and std dev
        const n = nOpts[randInt(0, nOpts.length - 1)];
        const mu = muOpts[randInt(0, muOpts.length - 1)];
        const sig = sigOpts[randInt(0, sigOpts.length - 1)];
        const S = n * mu;
        const Q = n * (sig * sig + mu * mu);
        questions.push(
          `設 \\(x_1, x_2, \\dots, x_{${n}}\\) 為 ${n} 個數據，` +
            `且 \\(\\displaystyle\\sum_{i=1}^{${n}} x_i = ${S}\\)，` +
            `\\(\\displaystyle\\sum_{i=1}^{${n}} x_i^2 = ${Q}\\)。` +
            `求此 ${n} 個數據的平均數與母體標準差。`
        );
        answers.push(
          `簡答：平均數 \\(${mu}\\)，標準差 \\(${sig}\\)。` +
            `過程：\\(\\mu = \\dfrac{${S}}{${n}} = ${mu}\\)；` +
            `\\(\\sigma^2 = \\dfrac{${Q}}{${n}} - ${mu}^2 = ${sig * sig + mu * mu} - ${mu * mu} = ${sig * sig}\\)，` +
            `故 \\(\\sigma = ${sig}\\)。`
        );
      } else if (mode === 1) {
        // Mode 1: n values with known mean; add one new value → find new mean
        const n = [5, 8, 10, 12][randInt(0, 3)];
        const mu = muOpts[randInt(0, muOpts.length - 1)];
        const delta = [-20, -15, -10, -5, 5, 10, 15, 20][randInt(0, 7)];
        const newV = mu + delta;
        const oldSum = n * mu;
        const newSum = oldSum + newV;
        const newN = n + 1;
        // Check clean division
        const isClean = newSum % newN === 0;
        const newMuDisplay = isClean ? String(newSum / newN) : `\\dfrac{${newSum}}{${newN}}`;
        questions.push(`一組 ${n} 個數據的平均數為 ${mu}。` + `若新增數值 ${newV}，求新的 ${newN} 個數據的平均數。`);
        answers.push(
          `簡答：\\(${newMuDisplay}\\)。` +
            `過程：原總和為 \\(${n} \\times ${mu} = ${oldSum}\\)，加入 ${newV} 後總和為 \\(${newSum}\\)。` +
            `新平均數為 \\(\\dfrac{${newSum}}{${newN}} = ${newMuDisplay}\\)。`
        );
      } else {
        // Mode 2: n values missing one; find missing given mean
        const n = [5, 6, 7][randInt(0, 2)];
        const mu = muOpts[randInt(0, muOpts.length - 1)];
        const totalS = n * mu;
        // Build n-1 values with controlled offsets
        const devSetsByCount = {
          5: [
            [-10, -5, 0, 5],
            [-8, -2, 4, 6],
            [-6, 0, 2, 8],
          ],
          6: [
            [-15, -5, 0, 5, 10],
            [-12, -4, 2, 8, 14],
            [-10, -2, 4, 6, 12],
          ],
          7: [
            [-15, -10, -5, 0, 5, 10],
            [-12, -8, -4, 2, 8, 14],
            [-10, -6, -2, 4, 8, 12],
          ],
        };
        const devOptions = devSetsByCount[n];
        const devs = devOptions[randInt(0, devOptions.length - 1)];
        const knownVals = devs.map((d) => mu + d);
        const knownSum = knownVals.reduce((a, b) => a + b, 0);
        const missing = totalS - knownSum;
        const listStr = knownVals.join(', ');
        questions.push(
          `已知 ${n} 個數據的平均數為 ${mu}，其中 ${n - 1} 個數據為 \\(${listStr}\\)，求第 ${n} 個數據 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x = ${missing}\\)。` +
            `過程：${n} 個數據的總和為 \\(${n} \\times ${mu} = ${totalS}\\)。` +
            `已知 ${n - 1} 個數的和為 \\(${knownSum}\\)，` +
            `故 \\(x = ${totalS} - ${knownSum} = ${missing}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS231LinearTransformSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const aOpts = [2, 3, 4, 5, 10, 0.5, 1.5, 0.2];
    const bOpts = [3, 5, 10, 20, -10, -5, 0, 100];
    const muOpts = [10, 20, 30, 40, 50, 60];
    const sigOpts = [2, 3, 4, 5, 6, 8, 10];
    for (let i = 0; i < count; i++) {
      const mode = i % 3;
      if (mode === 0) {
        // Mode 0: given mu_x, sigma_x, a, b → find mu_y, sigma_y
        const a = aOpts[randInt(0, aOpts.length - 1)];
        const b = bOpts[randInt(0, bOpts.length - 1)];
        const mu = muOpts[randInt(0, muOpts.length - 1)];
        const sig = sigOpts[randInt(0, sigOpts.length - 1)];
        const muY = a * mu + b;
        const sigY = Math.abs(a) * sig;
        const aStr = s23FormatNumber(a);
        const muYStr = s23FormatNumber(muY);
        const sigYStr = s23FormatNumber(sigY);
        questions.push(
          `已知一組數據 \\(x\\) 的平均數為 \\(${mu}\\)、標準差為 \\(${sig}\\)。` +
            `若新數據 \\(y=${s23LinearExpr('x', a, b)}\\)，求 \\(y\\) 的平均數與標準差。`
        );
        answers.push(
          `簡答：平均數 \\(${muYStr}\\)，標準差 \\(${sigYStr}\\)。` +
            `過程：線性變換 \\(y=ax+b\\) 下，\\(\\mu_y=a\\mu_x+b=${aStr}\\times${mu}${s23SignedNumberText(b)}=${muYStr}\\)；` +
            `\\(\\sigma_y=|a|\\sigma_x=${s23FormatNumber(Math.abs(a))}\\times${sig}=${sigYStr}\\)。`
        );
      } else if (mode === 1) {
        // Mode 1: given mu_x, sigma_x, a, mu_y → find b
        const a = [2, 3, 4, 5][randInt(0, 3)];
        const mu = muOpts[randInt(0, muOpts.length - 1)];
        const sig = sigOpts[randInt(0, sigOpts.length - 1)];
        const bChoices = [-10, -5, 0, 5, 10, 15, 20];
        const b = bChoices[randInt(0, bChoices.length - 1)];
        const muY = a * mu + b;
        questions.push(
          `已知 \\(x\\) 的平均數為 \\(${mu}\\)，標準差為 \\(${sig}\\)。` +
            `若 \\(y = ${a}x + b\\) 的平均數為 \\(${muY}\\)，求常數 \\(b\\)。`
        );
        answers.push(
          `簡答：\\(b = ${b}\\)。` +
            `過程：\\(\\mu_y = a\\mu_x + b\\)，即 \\(${muY} = ${a} \\times ${mu} + b\\)，` +
            `解得 \\(b = ${muY} - ${a * mu} = ${b}\\)。`
        );
      } else {
        // Mode 2: given sigma_x and sigma_y → find |a|
        const a = [2, 3, 4, 5][randInt(0, 3)];
        const sig = sigOpts[randInt(0, sigOpts.length - 1)];
        const sigY = a * sig;
        const mu = muOpts[randInt(0, muOpts.length - 1)];
        const b = bOpts[randInt(0, bOpts.length - 1)];
        questions.push(
          `已知 \\(x\\) 的標準差為 \\(${sig}\\)，且 \\(y=ax${s23SignedNumberText(b)}\\)（\\(a>0\\)）的標準差為 \\(${sigY}\\)，求 \\(a\\)。`
        );
        answers.push(
          `簡答：\\(a = ${a}\\)。` +
            `過程：\\(\\sigma_y = |a| \\cdot \\sigma_x\\)，即 \\(${sigY} = a \\times ${sig}\\)，` +
            `解得 \\(a = \\dfrac{${sigY}}{${sig}} = ${a}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS231WeightedMeanSet(count) {
    return buildS223DynamicSet(
      [
        () => {
          const w = s242Pick([
            [3, 2, 5],
            [2, 3, 5],
            [4, 2, 4],
            [3, 3, 4],
            [2, 4, 4],
          ]);
          let s1 = 5 * randInt(12, 19);
          let s2 = 5 * randInt(12, 19);
          let s3 = 5 * randInt(12, 19);
          for (let retry = 0; retry < 20 && (w[0] * s1 + w[1] * s2 + w[2] * s3) % 10 !== 0; retry += 1) {
            s3 = 5 * randInt(12, 19);
          }
          if ((w[0] * s1 + w[1] * s2 + w[2] * s3) % 10 !== 0) s2 += 5;
          const total = (w[0] * s1 + w[1] * s2 + w[2] * s3) / 10;
          return {
            q: `某生平時考成績占 ${w[0] * 10}%，期中考占 ${w[1] * 10}%，期末考占 ${w[2] * 10}%。若成績分別為 ${s1}、${s2}、${s3}，求學期加權成績。`,
            a: `簡答：${total} 分。過程：加權平均為 \\(${s1}\\cdot0.${w[0]}+${s2}\\cdot0.${w[1]}+${s3}\\cdot0.${w[2]}=${total}\\)。`,
          };
        },
        () => {
          const n1 = 20 * randInt(8, 18);
          const n2 = 20 * randInt(4, 9);
          let m1 = 5 * randInt(10, 17);
          let m2 = 5 * randInt(8, 14);
          for (let retry = 0; retry < 20 && (n1 * m1 + n2 * m2) % (n1 + n2) !== 0; retry += 1) {
            m2 = 5 * randInt(8, 14);
          }
          const totalScore = n1 * m1 + n2 * m2;
          const n = n1 + n2;
          const avg = totalScore % n === 0 ? String(totalScore / n) : formatFraction(totalScore, n);
          return {
            q: `自然組 ${n1} 人平均 ${m1} 分，社會組 ${n2} 人平均 ${m2} 分，求全校總平均。`,
            a: `簡答：${avg} 分。過程：全校總分為 \\(${n1}\\cdot${m1}+${n2}\\cdot${m2}=${totalScore}\\)，總人數 ${n}，所以總平均為 \\(${avg}\\)。`,
          };
        },
        () => {
          const p0 = s242Pick([20, 25, 30, 40, 50]);
          const p1 = p0 + s242Pick([5, 10, 15]);
          const years = s242Pick([5, 10]);
          const frac = formatFraction(p1, p0);
          return {
            q: `某鎮${years === 10 ? '十' : '五'}年前人口 ${p0} 萬，現在 ${p1} 萬。假設每年成長率固定，求年平均成長率。`,
            a: `簡答：\\(\\sqrt[${years}]{${frac}}-1\\)。過程：設年平均成長率為 \\(r\\)，則 \\(${p0}(1+r)^{${years}}=${p1}\\)。所以 \\((1+r)^{${years}}=${frac}\\)，\\(r=\\sqrt[${years}]{${frac}}-1\\)。`,
          };
        },
        () => {
          const rates = s242Pick([
            [10, 20, 30],
            [10, 30, 50],
            [20, 30, 40],
            [5, 15, 25],
            [10, 25, 40],
          ]);
          const product = ((100 + rates[0]) * (100 + rates[1]) * (100 + rates[2])) / 1000000;
          const pText = String(Math.round(product * 10000) / 10000);
          return {
            q: `已知三年的產值成長率分別為 ${rates[0]}%、${rates[1]}%、${rates[2]}%，求三年的平均成長率。`,
            a: `簡答：\\(\\sqrt[3]{${pText}}-1\\)。過程：平均成長率需用幾何平均，令 \\(1+r=\\sqrt[3]{${(100 + rates[0]) / 100}\\cdot${(100 + rates[1]) / 100}\\cdot${(100 + rates[2]) / 100}}=\\sqrt[3]{${pText}}\\)，所以 \\(r=\\sqrt[3]{${pText}}-1\\)。`,
          };
        },
        () => {
          const [K, N] = s242Pick([
            ['k', 'n'],
            ['m', 'n'],
            ['a', 'N'],
            ['s', 'n'],
          ]);
          return {
            q: `一組資料由 \\(${K}\\) 個 1 與 \\(${N}-${K}\\) 個 0 組成，求這組資料的算術平均數與標準差公式。`,
            a: `簡答：平均數 \\(\\frac{${K}}{${N}}\\)，標準差 \\(\\sqrt{\\frac{${K}}{${N}}(1-\\frac{${K}}{${N}})}\\)。過程：1 的比例為 \\(p=\\frac{${K}}{${N}}\\)，平均數為 \\(p\\)。二元資料平方後仍為自身，所以 \\(E(X^2)=p\\)，變異數為 \\(p-p^2=p(1-p)\\)。`,
          };
        },
      ],
      count
    );
  }

  function buildS231ZScoreSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const muOpts = [60, 65, 70, 72, 75, 80];
    const sigOpts = [4, 5, 6, 8, 10, 12];
    for (let i = 0; i < count; i++) {
      const mode = i % 3;
      const mu = muOpts[randInt(0, muOpts.length - 1)];
      const sig = sigOpts[randInt(0, sigOpts.length - 1)];
      if (mode === 0) {
        // Mode 0: given x, mu, sigma → find z
        const zNums = [-2, -1, 0, 1, 2];
        const z = zNums[randInt(0, zNums.length - 1)];
        const x = mu + z * sig;
        questions.push(
          `某次考試全班平均分數為 \\(${mu}\\) 分，標準差為 \\(${sig}\\) 分。` +
            `若小明的分數為 \\(${x}\\) 分，求其標準分數（Z 分數）。`
        );
        answers.push(
          `簡答：Z 分數為 \\(${z}\\)。` +
            `過程：\\(z = \\dfrac{x - \\mu}{\\sigma} = \\dfrac{${x} - ${mu}}{${sig}} = \\dfrac{${x - mu}}{${sig}} = ${z}\\)。`
        );
      } else if (mode === 1) {
        // Mode 1: given z, mu, sigma → find x
        const zVals = [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2];
        const z = zVals[randInt(0, zVals.length - 1)];
        const xRaw = mu + z * sig;
        const isClean = Number.isInteger(xRaw);
        const xStr = isClean ? String(xRaw) : `${xRaw}`;
        questions.push(
          `已知某組數據平均數為 \\(${mu}\\)，標準差為 \\(${sig}\\)。` +
            `若某筆資料的 Z 分數為 \\(${z}\\)，求其原始數值。`
        );
        answers.push(
          `簡答：原始數值為 \\(${xStr}\\)。` +
            `過程：由 \\(z = \\dfrac{x - \\mu}{\\sigma}\\)，` +
            `得 \\(x = \\mu + z \\cdot \\sigma = ${mu} + (${z}) \\times ${sig} = ${xStr}\\)。`
        );
      } else {
        // Mode 2: given x, z → find mu (sigma known)
        const zNums2 = [-2, -1, 1, 2];
        const z = zNums2[randInt(0, zNums2.length - 1)];
        const x = mu + z * sig;
        questions.push(
          `已知某組數據標準差為 \\(${sig}\\)，且某筆原始數值為 \\(${x}\\)，其 Z 分數為 \\(${z}\\)，求此組數據的平均數 \\(\\mu\\)。`
        );
        answers.push(
          `簡答：\\(\\mu = ${mu}\\)。` +
            `過程：由 \\(z = \\dfrac{x - \\mu}{\\sigma}\\)，得 \\(${z} = \\dfrac{${x} - \\mu}{${sig}}\\)，` +
            `解得 \\(\\mu = ${x} - (${z} \\times ${sig}) = ${x} - (${z * sig}) = ${mu}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS231BinaryDataSet(count) {
    return buildS223DynamicSet(
      [
        () => {
          const n = s242Pick([10, 20, 25, 50]);
          const k = randInt(2, n - 2);
          const meanText = formatFraction(k, n);
          const stdText = `\\frac{${formatRadical(k * (n - k))}}{${n}}`;
          return {
            q: `一組 ${n} 筆數據中，有 ${k} 個 1 與 ${n - k} 個 0，求此組數據的平均數與標準差。`,
            a: `簡答：平均數 \\(${meanText}\\)，標準差 \\(${stdText}\\)。過程：1 的比例為 \\(p=${k}/${n}=${meanText}\\)，平均數為 \\(p\\)。標準差為 \\(\\sqrt{p(1-p)}=\\sqrt{\\frac{${k}}{${n}}\\cdot\\frac{${n - k}}{${n}}}=${stdText}\\)。`,
          };
        },
        () => {
          const [K, N] = s242Pick([
            ['k', 'n'],
            ['m', 'n'],
            ['a', 'N'],
          ]);
          return {
            q: `證明一組由 \\(${K}\\) 個 1 與 \\(${N}-${K}\\) 個 0 組成的數據，其標準差公式為 \\(\\sqrt{\\frac{${K}}{${N}}(1-\\frac{${K}}{${N}})}\\)。`,
            a: `簡答：成立。過程：令 \\(p=\\frac{${K}}{${N}}\\)。平均數為 \\(p\\)，且因 \\(0^2=0,1^2=1\\)，所以 \\(E(X^2)=p\\)。變異數為 \\(p-p^2=p(1-p)\\)，標準差即為 \\(\\sqrt{p(1-p)}\\)。`,
          };
        },
        () => {
          const variant = s242Pick([
            { std: '0.5', pAns: '\\frac12', why: '若為 0.5，則 \\(p(1-p)=\\frac14\\)，得 \\(p=\\frac12\\)。' },
            {
              std: '0.3',
              pAns: '\\frac1{10} 或 \\frac9{10}',
              why: '若為 0.3，則 \\(p(1-p)=0.09\\)，解得 \\(p=\\frac1{10}\\) 或 \\(\\frac9{10}\\)。',
            },
            {
              std: '0.4',
              pAns: '\\frac15 或 \\frac45',
              why: '若為 0.4，則 \\(p(1-p)=0.16\\)，解得 \\(p=\\frac15\\) 或 \\(\\frac45\\)。',
            },
          ]);
          return {
            q: `若一組 0 與 1 組成的數據標準差為 ${variant.std}，求數據中 1 所佔的比例。`,
            a: `簡答：\\(${variant.pAns}\\)。過程：令 1 的比例為 \\(p\\)，則標準差為 \\(\\sqrt{p(1-p)}\\)。${variant.why}`,
          };
        },
        () => {
          const pool = [
            [50, 20],
            [50, 10],
            [40, 10],
            [20, 5],
            [25, 5],
            [50, 30],
          ];
          let n = 50;
          let k = 20;
          let a = 10;
          for (let retry = 0; retry < 30; retry += 1) {
            const pair = pool[randInt(0, pool.length - 1)];
            const cand = s242Pick([10, 20]);
            if ((cand * pair[1]) % pair[0] === 0 && (cand * cand * pair[1] * (pair[0] - pair[1])) % (pair[0] * pair[0]) === 0) {
              n = pair[0];
              k = pair[1];
              a = cand;
              break;
            }
          }
          const b = 10 * randInt(2, 6);
          const mean = (a * k) / n + b;
          const varNew = (a * a * k * (n - k)) / (n * n);
          return {
            q: `將含有 ${k} 個 1 與 ${n - k} 個 0 的數據進行線性變換 \\(y=${a}x+${b}\\)，求新數據的平均數與變異數。`,
            a: `簡答：平均數 ${mean}，變異數 ${varNew}。過程：原資料 \\(p=${k}/${n}=${formatFraction(k, n)}\\)，平均為 \\(${formatFraction(k, n)}\\)，變異數為 \\(${formatFraction(k * (n - k), n * n)}\\)。變換後平均為 \\(${a}\\cdot${formatFraction(k, n)}+${b}=${mean}\\)，變異數乘以 \\(${a}^2\\)，得 ${varNew}。`,
          };
        },
        () => {
          const n1 = 10 * randInt(2, 5);
          const n2 = 10 * randInt(1, 4);
          const n = n1 + n2;
          const tPick = s242Pick([0.5, 0.6, 0.7, 0.8]);
          const ones = Math.round(tPick * n);
          const k1 = randInt(Math.max(1, ones - n2), Math.min(n1, ones - 1));
          const k2 = ones - k1;
          return {
            q: `兩組 0-1 數據合併後，已知總平均為 ${tPick}。若第一組有 ${n1} 筆且其中 ${k1} 個 1，第二組有 ${n2} 筆，求第二組中 1 的個數。`,
            a: `簡答：${k2} 個。過程：合併後共有 ${n} 筆，1 的總數為 \\(${tPick}\\cdot${n}=${ones}\\)。第一組已有 ${k1} 個 1，所以第二組有 \\(${ones}-${k1}=${k2}\\) 個 1。`,
          };
        },
      ],
      count
    );
  }

  function buildS231MergeLossSet(count) {
    return buildS223DynamicSet(
      [
        () => {
          let n1 = 6;
          let n2 = 4;
          let m1 = 3;
          let m2 = 8;
          for (let retry = 0; retry < 30; retry += 1) {
            n1 = randInt(4, 8);
            n2 = randInt(3, 6);
            m1 = randInt(2, 8);
            m2 = m1 + randInt(2, 6);
            if ((n1 * m1 + n2 * m2) % (n1 + n2) === 0) break;
          }
          if ((n1 * m1 + n2 * m2) % (n1 + n2) !== 0) {
            n1 = 6;
            n2 = 4;
            m1 = 3;
            m2 = 8;
          }
          const v1 = s242Pick([4, 9, 16]);
          const v2 = s242Pick([9, 16, 25]);
          const n = n1 + n2;
          const mu = (n1 * m1 + n2 * m2) / n;
          const ss = n1 * (v1 + m1 * m1) + n2 * (v2 + m2 * m2);
          const varNumer = ss - n * mu * mu;
          const varText = varNumer % n === 0 ? String(varNumer / n) : formatFraction(varNumer, n);
          return {
            q: `${n} 個數值中，前 ${n1} 個平均數為 ${m1}、變異數為 ${v1}；後 ${n2} 個平均數為 ${m2}、變異數為 ${v2}。求全體 ${n} 個數的平均數與變異數。`,
            a: `簡答：平均數 ${mu}，變異數 \\(${varText}\\)。過程：總平均為 \\(\\frac{${n1}\\cdot${m1}+${n2}\\cdot${m2}}{${n}}=${mu}\\)。總平方和為 \\(${n1}(${v1}+${m1}^2)+${n2}(${v2}+${m2}^2)=${ss}\\)，所以變異數為 \\(${ss}/${n}-${mu}^2=${varText}\\)。`,
          };
        },
        () => {
          const n = s242Pick([10, 12, 15, 20]);
          const mean = s242Pick([52, 56, 60, 64, 70]);
          const total = n * mean;
          const rest = 10 * randInt(8, 14);
          const knownSum = total - rest;
          return {
            q: `${n} 人參加考試，平均分數 ${mean}，標準差 4。已知其中 ${n - 2} 人的成績總和為 ${knownSum}，求剩餘 2 人的成績總和。`,
            a: `簡答：${rest}。過程：${n} 人總分為 \\(${n}\\cdot${mean}=${total}\\)，剩餘 2 人總分為 \\(${total}-${knownSum}=${rest}\\)。`,
          };
        },
        () => {
          const m = randInt(5, 12);
          const d = randInt(1, 3);
          const values = [m - 2 * d, m - d, m, m + d, m + 2 * d];
          const stdText = d === 1 ? '\\sqrt2' : `${d}\\sqrt2`;
          return {
            q: `已知 5 個數據成等差數列，且算術平均數為 ${m}，標準差為 \\(${stdText}\\)，求這 5 個數據。`,
            a: `簡答：\\(${values.join(',')}\\)。過程：5 個等差數可設為 \\(${m}-2d,${m}-d,${m},${m}+d,${m}+2d\\)。其變異數為 \\(\\frac{4d^2+d^2+d^2+4d^2}{5}=2d^2\\)，標準差為 \\(\\sqrt2|d|\\)。由 \\(\\sqrt2|d|=${stdText}\\) 得 \\(|d|=${d}\\)，故資料為 \\(${values.join(',')}\\)。`,
          };
        },
        () => {
          const combo = s242Pick([
            { n0: 9, mu: 12, sigma: 2, c: 2, newVarText: '4', newStdText: '2' },
            { n0: 8, mu: 10, sigma: 3, c: 3, newVarText: '9', newStdText: '3' },
            { n0: 10, mu: 15, sigma: 2, c: 4, newVarText: '6', newStdText: '\\sqrt6' },
            { n0: 9, mu: 20, sigma: 3, c: 5, newVarText: '\\frac{131}{11}', newStdText: '\\sqrt{\\frac{131}{11}}' },
          ]);
          const a1 = combo.mu - combo.c;
          const a2 = combo.mu + combo.c;
          const oldSS = combo.n0 * (combo.sigma * combo.sigma + combo.mu * combo.mu);
          const addSS = a1 * a1 + a2 * a2;
          return {
            q: `有 ${combo.n0} 個數的算術平均為 ${combo.mu}，標準差為 ${combo.sigma}。若新增兩個數 ${a1} 與 ${a2}，求此 ${combo.n0 + 2} 個數的新標準差。`,
            a: `簡答：\\(${combo.newStdText}\\)。過程：原總和為 ${combo.n0 * combo.mu}，原平方和為 \\(${combo.n0}(${combo.sigma}^2+${combo.mu}^2)=${oldSS}\\)。加入 ${a1}、${a2} 後總和 ${(combo.n0 + 2) * combo.mu}，平均仍為 ${combo.mu}；平方和增加 \\(${a1 * a1}+${a2 * a2}=${addSS}\\)，新平方和為 ${oldSS + addSS}。變異數為 \\(${oldSS + addSS}/${combo.n0 + 2}-${combo.mu}^2=${combo.newVarText}\\)，標準差為 \\(${combo.newStdText}\\)。`,
          };
        },
        () => {
          const n = randInt(8, 16);
          const mu = randInt(5, 14);
          const u = randInt(1, 3);
          const v = u === 1 ? 2 : 1;
          const A = mu + u * (n + 1);
          const B = mu + v * (n - 1);
          return {
            q: `一組 \\(n\\) 個數據中加入一個數 ${A} 後平均多 ${u}；若去掉一個數 ${B} 後平均少 ${v}，求原始個數 \\(n\\)。`,
            a: `簡答：${n}。過程：設原平均為 \\(\\mu\\)。加入 ${A} 後 \\(\\frac{n\\mu+${A}}{n+1}=\\mu+${u}\\)，得 \\(\\mu+${u}n=${A - u}\\)。去掉 ${B} 後 \\(\\frac{n\\mu-${B}}{n-1}=\\mu-${v}\\)，得 \\(\\mu+${v}n=${B + v}\\)。聯立解得 \\(n=${n}\\)、\\(\\mu=${mu}\\)。`,
          };
        },
      ],
      count
    );
  }

  function buildS231DataRevisionSet(count) {
    return buildS223DynamicSet(
      [
        () => {
          const n = s242Pick([10, 20, 25]);
          const mu = 5 * randInt(10, 16);
          const d = randInt(1, 3);
          const w = 5 * randInt(8, 12);
          const r = w + n * d;
          return {
            q: `某班 ${n} 位學生的數學成績平均為 ${mu} 分、標準差為 4 分。後來發現其中一人的成績「${r} 分」被誤植為「${w} 分」，求正確的平均數。`,
            a: `簡答：${mu + d} 分。過程：原登錄總分為 \\(${n}\\cdot${mu}=${n * mu}\\)。修正時總分增加 \\(${r}-${w}=${n * d}\\)，正確總分為 ${n * mu + n * d}，所以正確平均為 ${mu + d}。`,
          };
        },
        () => {
          const combo = s242Pick([
            { n: 10, mu: 60, sigma: 4, w: 50, r: 70, varText: '12', stdText: '2\\sqrt3' },
            { n: 10, mu: 50, sigma: 6, w: 40, r: 60, varText: '32', stdText: '4\\sqrt2' },
            { n: 20, mu: 30, sigma: 3, w: 25, r: 45, varText: '18', stdText: '3\\sqrt2' },
            { n: 10, mu: 70, sigma: 5, w: 60, r: 80, varText: '21', stdText: '\\sqrt{21}' },
          ]);
          const oldSS = combo.n * (combo.sigma * combo.sigma + combo.mu * combo.mu);
          const addSS = combo.r * combo.r - combo.w * combo.w;
          const newMu = combo.mu + (combo.r - combo.w) / combo.n;
          return {
            q: `某班 ${combo.n} 位學生的數學成績登錄平均為 ${combo.mu} 分、標準差為 ${combo.sigma} 分。後來發現其中一人的成績「${combo.r} 分」被誤植為「${combo.w} 分」，求修正後的正確標準差。`,
            a: `簡答：\\(${combo.stdText}\\)。過程：原登錄平方和為 \\(${combo.n}(${combo.sigma}^2+${combo.mu}^2)=${oldSS}\\)。修正平方和增加 \\(${combo.r}^2-${combo.w}^2=${addSS}\\)，得 ${oldSS + addSS}。正確平均為 ${newMu}，變異數為 \\(${oldSS + addSS}/${combo.n}-${newMu}^2=${combo.varText}\\)，標準差為 \\(${combo.stdText}\\)。`,
          };
        },
        () => {
          const n = s242Pick([12, 15, 20, 25]);
          const mu = randInt(10, 20);
          const t = randInt(5, Math.min(15, mu));
          const hi = mu + t;
          const lo = mu - t;
          return {
            q: `已知 ${n} 筆數據的平均數為 ${mu}，標準差為 2。若剔除其中兩筆明顯錯誤的離群值 ${hi} 與 ${lo}，求剩餘 ${n - 2} 筆的新平均數。`,
            a: `簡答：${mu}。過程：原總和為 \\(${n}\\cdot${mu}=${n * mu}\\)。剔除 ${hi} 與 ${lo} 後總和為 ${n * mu - hi - lo}，剩 ${n - 2} 筆，所以新平均為 \\(${n * mu - hi - lo}/${n - 2}=${mu}\\)。`,
          };
        },
        () => {
          const combo = s242Pick([
            { n: 5, sigma: 2, varText: '\\frac{20}{7}', stdText: '\\frac{2\\sqrt{35}}{7}' },
            { n: 6, sigma: 2, varText: '3', stdText: '\\sqrt3' },
            { n: 8, sigma: 3, varText: '\\frac{36}{5}', stdText: '\\frac{6\\sqrt5}{5}' },
            { n: 10, sigma: 3, varText: '\\frac{15}{2}', stdText: '\\frac{\\sqrt{30}}{2}' },
          ]);
          const mu = 5 * randInt(2, 8);
          const devSS = combo.n * combo.sigma * combo.sigma;
          return {
            q: `一組 ${combo.n} 筆數據的平均為 ${mu}，標準差為 ${combo.sigma}。若新增兩筆數據分別為 ${mu} 與 ${mu}，求這 ${combo.n + 2} 筆數據的新標準差。`,
            a: `簡答：\\(${combo.stdText}\\)。過程：原離差平方和為 \\(${combo.n}\\cdot${combo.sigma}^2=${devSS}\\)。新增兩筆都等於原平均 ${mu}，因此新平均仍為 ${mu}，離差平方和不變。新變異數為 \\(${devSS}/${combo.n + 2}=${combo.varText}\\)，標準差為 \\(${combo.stdText}\\)。`,
          };
        },
        () => {
          const n = s242Pick([10, 12, 15]);
          const mu = 10 * randInt(8, 15);
          const k = 10 * randInt(1, 3);
          const M = mu + k * (n - 1);
          return {
            q: `測量 ${n} 戶家庭所得，平均 ${mu} 萬。若其中最高所得家庭 ${M} 萬搬走，求剩餘 ${n - 1} 戶的平均所得。`,
            a: `簡答：${mu - k} 萬。過程：原總所得為 \\(${n}\\cdot${mu}=${n * mu}\\) 萬。搬走 ${M} 萬後剩 ${n * mu - M} 萬，平均為 \\(${n * mu - M}/${n - 1}=${mu - k}\\) 萬。`,
          };
        },
      ],
      count
    );
  }

  function buildS231GroupMergingSet(count) {
    return buildS223DynamicSet(
      [
        () => {
          let n1 = 20;
          let n2 = 30;
          let m1 = 70;
          let m2 = 80;
          for (let retry = 0; retry < 30; retry += 1) {
            n1 = 10 * randInt(2, 5);
            n2 = 10 * randInt(2, 5);
            m1 = 5 * randInt(12, 17);
            m2 = 5 * randInt(13, 18);
            if ((n1 * m1 + n2 * m2) % (n1 + n2) === 0) break;
          }
          const n = n1 + n2;
          const total = n1 * m1 + n2 * m2;
          const avg = total % n === 0 ? String(total / n) : formatFraction(total, n);
          return {
            q: `男生 ${n1} 人平均 ${m1} 分，標準差 5 分；女生 ${n2} 人平均 ${m2} 分，標準差 10 分。求全校 ${n} 人的加權平均數。`,
            a: `簡答：${avg} 分。過程：加權平均為 \\(\\frac{${n1}\\cdot${m1}+${n2}\\cdot${m2}}{${n}}=${avg}\\)。`,
          };
        },
        () => {
          const combo = s242Pick([
            { n1: 20, m1: 70, s1: 5, n2: 30, m2: 80, s2: 10, varText: '94', stdText: '\\sqrt{94}' },
            { n1: 10, m1: 60, s1: 4, n2: 10, m2: 70, s2: 6, varText: '51', stdText: '\\sqrt{51}' },
            { n1: 30, m1: 50, s1: 6, n2: 20, m2: 60, s2: 4, varText: '52', stdText: '2\\sqrt{13}' },
            { n1: 25, m1: 80, s1: 6, n2: 25, m2: 90, s2: 8, varText: '75', stdText: '5\\sqrt3' },
          ]);
          const n = combo.n1 + combo.n2;
          const mu = (combo.n1 * combo.m1 + combo.n2 * combo.m2) / n;
          const ss = combo.n1 * (combo.s1 * combo.s1 + combo.m1 * combo.m1) + combo.n2 * (combo.s2 * combo.s2 + combo.m2 * combo.m2);
          return {
            q: `男生 ${combo.n1} 人平均 ${combo.m1} 分、標準差 ${combo.s1} 分；女生 ${combo.n2} 人平均 ${combo.m2} 分、標準差 ${combo.s2} 分。求全校 ${n} 人的總標準差。`,
            a: `簡答：\\(${combo.stdText}\\)。過程：全校平均為 \\(\\frac{${combo.n1}\\cdot${combo.m1}+${combo.n2}\\cdot${combo.m2}}{${n}}=${mu}\\)。總平方和為 \\(${combo.n1}(${combo.s1}^2+${combo.m1}^2)+${combo.n2}(${combo.s2}^2+${combo.m2}^2)=${ss}\\)。變異數為 \\(${ss}/${n}-${mu}^2=${combo.varText}\\)，所以標準差為 \\(${combo.stdText}\\)。`,
          };
        },
        () => {
          const mu = 5 * randInt(10, 16);
          const combo = s242Pick([
            { n1: 40, s1: 6, n2: 60, s2: 8, varText: '\\frac{264}{5}', stdText: '\\frac{2\\sqrt{330}}{5}' },
            { n1: 50, s1: 6, n2: 50, s2: 8, varText: '50', stdText: '5\\sqrt2' },
            { n1: 30, s1: 4, n2: 70, s2: 6, varText: '\\frac{150}{5}'.replace('\\frac{150}{5}', '30'), stdText: '\\sqrt{30}' },
            { n1: 20, s1: 3, n2: 80, s2: 6, varText: '\\frac{153}{5}', stdText: '\\sqrt{\\frac{153}{5}}' },
          ]);
          const n = combo.n1 + combo.n2;
          return {
            q: `甲班平均 ${mu}，標準差 ${combo.s1}；乙班平均 ${mu}，標準差 ${combo.s2}。若甲班 ${combo.n1} 人、乙班 ${combo.n2} 人，求合併後的標準差。`,
            a: `簡答：\\(${combo.stdText}\\)。過程：兩班平均相同皆為 ${mu}，合併變異數為加權平均：\\(\\frac{${combo.n1}\\cdot${combo.s1}^2+${combo.n2}\\cdot${combo.s2}^2}{${n}}=${combo.varText}\\)，所以標準差為 \\(${combo.stdText}\\)。`,
          };
        },
        () => {
          const n0 = s242Pick([10, 20]);
          const m1 = randInt(4, 8);
          const gap = 2 * randInt(3, 6);
          const m2 = m1 + gap;
          const s1 = randInt(2, 3);
          const s2 = randInt(3, 5);
          const mu = (m1 + m2) / 2;
          const meanSq = (n0 * (s1 * s1 + m1 * m1) + n0 * (s2 * s2 + m2 * m2)) / (2 * n0);
          const varAns = meanSq - mu * mu;
          const varText = Number.isInteger(varAns) ? String(varAns) : formatFraction(Math.round(varAns * 2), 2);
          return {
            q: `有兩組數據 \\(X(n=${n0},\\mu=${m1},\\sigma=${s1})\\) 與 \\(Y(n=${n0},\\mu=${m2},\\sigma=${s2})\\)，求合併後 ${2 * n0} 筆數據的變異數。`,
            a: `簡答：\\(${varText}\\)。過程：合併平均為 \\(${mu}\\)。總平方平均為 \\(\\frac{${n0}(${s1}^2+${m1}^2)+${n0}(${s2}^2+${m2}^2)}{${2 * n0}}=${meanSq}\\)。變異數為 \\(${meanSq}-${mu}^2=${varText}\\)。`,
          };
        },
        () => {
          const m1 = randInt(8, 15);
          const d = randInt(1, 4);
          const muAll = m1 + d;
          const m2 = m1 + 2 * d;
          return {
            q: `已知兩組人數相同，第一組 \\(\\mu=${m1},\\sigma=3\\)，合併後總平均為 ${muAll}，總標準差為 4。求第二組數據的平均數。`,
            a: `簡答：${m2}。過程：兩組人數相同，合併平均是兩組平均的平均。設第二組平均為 \\(m\\)，則 \\(\\frac{${m1}+m}{2}=${muAll}\\)，解得 \\(m=${m2}\\)。`,
          };
        },
      ],
      count
    );
  }

  function buildS231AlgebraVarianceSet(count) {
    return buildS223DynamicSet(
      [
        () => {
          const n = s242Pick([20, 25, 40, 50]);
          const mu = s242Pick([10, 15, 20, 25]);
          const v = s242Pick([5, 10, 15, 20]);
          const S = n * mu;
          const T = n * (v + mu * mu);
          return {
            q: `給定 ${n} 筆數據，已知其總和 \\(\\sum x_i=${S}\\)，平方和 \\(\\sum x_i^2=${T}\\)，求其標準差。`,
            a: `簡答：\\(${formatRadical(v)}\\)。過程：平均為 \\(${S}/${n}=${mu}\\)。變異數為 \\(\\frac{${T}}{${n}}-${mu}^2=${v + mu * mu}-${mu * mu}=${v}\\)。因此標準差為 \\(${formatRadical(v)}\\)。`,
          };
        },
        () => {
          const n = s242Pick([10, 20, 25]);
          const mu = randInt(8, 16);
          const sigma = randInt(2, 5);
          const T = n * (sigma * sigma + mu * mu);
          return {
            q: `若 ${n} 筆數據的平均數為 ${mu}，標準差為 ${sigma}，求這 ${n} 筆數據的平方和 \\(\\sum x_i^2\\)。`,
            a: `簡答：${T}。過程：\\(\\sigma^2=\\frac1n\\sum x_i^2-\\mu^2\\)，所以 \\(${sigma * sigma}=\\frac1{${n}}\\sum x_i^2-${mu * mu}\\)，得 \\(\\sum x_i^2=${T}\\)。`,
          };
        },
        () => {
          const n = s242Pick([10, 20, 25]);
          const c = 5 * randInt(2, 4);
          const ybar = randInt(1, 4);
          const yvar = s242Pick([5, 10, 15]);
          const S1 = n * ybar;
          const S2 = n * (yvar + ybar * ybar);
          return {
            q: `已知 \\(\\sum_{i=1}^{${n}}(x_i-${c})=${S1}\\) 且 \\(\\sum_{i=1}^{${n}}(x_i-${c})^2=${S2}\\)，求原始數據的平均數與標準差。`,
            a: `簡答：平均數 ${c + ybar}，標準差 \\(${formatRadical(yvar)}\\)。過程：令 \\(y_i=x_i-${c}\\)，則 \\(\\bar y=${S1}/${n}=${ybar}\\)，所以 \\(\\bar x=${c + ybar}\\)。\\(y\\) 的變異數為 \\(${S2}/${n}-${ybar}^2=${yvar}\\)，平移不改變標準差，所以標準差為 \\(${formatRadical(yvar)}\\)。`,
          };
        },
        () => {
          const n = s242Pick([5, 8, 11]);
          const mu = s242Pick([6, 8, 10]);
          const extra = s242Pick([120, 180, 240, 300]);
          const T = n * mu * mu + extra;
          const newVar = extra / (n + 1);
          const varText = Number.isInteger(newVar) ? String(newVar) : formatFraction(extra, n + 1);
          const stdText = Number.isInteger(newVar) ? formatRadical(newVar) : `\\sqrt{${formatFraction(extra, n + 1)}}`;
          return {
            q: `設 ${n} 筆數據的平方和為 ${T}，平均數為 ${mu}；若加入一筆數據 \\(x_{${n + 1}}=${mu}\\)，求這 ${n + 1} 筆數據的新標準差。`,
            a: `簡答：\\(${stdText}\\)。過程：原總和為 ${n * mu}，加入 ${mu} 後平均仍為 ${mu}，平方和變 ${T + mu * mu}。新變異數為 \\(${T + mu * mu}/${n + 1}-${mu}^2=${varText}\\)，所以標準差為 \\(${stdText}\\)。`,
          };
        },
        () => {
          const [Sv, Tv, Nv] = s242Pick([
            ['S', 'T', 'n'],
            ['A', 'B', 'n'],
            ['P', 'Q', 'N'],
          ]);
          return {
            q: `給定數據滿足 \\(\\sum_{i=1}^{${Nv}} x_i=${Sv}\\) 且 \\(\\sum_{i=1}^{${Nv}} x_i^2=${Tv}\\)，試寫出變異數以 \\(${Sv},${Tv},${Nv}\\) 表示的通式。`,
            a: `簡答：\\(\\sigma^2=\\frac{${Tv}}{${Nv}}-(\\frac{${Sv}}{${Nv}})^2\\)。過程：平均數 \\(\\mu=\\frac{${Sv}}{${Nv}}\\)，又變異數公式為 \\(\\sigma^2=\\frac1n\\sum x_i^2-\\mu^2\\)，代入即得 \\(\\frac{${Tv}}{${Nv}}-(\\frac{${Sv}}{${Nv}})^2\\)。`,
          };
        },
      ],
      count
    );
  }

  function buildS231GeometricGrowthSet(count) {
    return buildS223DynamicSet(
      [
        () => {
          const rates = s242Pick([
            [10, 20, 30],
            [10, 30, 50],
            [20, 30, 40],
            [5, 15, 25],
            [10, 25, 40],
            [15, 20, 45],
          ]);
          const product = ((100 + rates[0]) * (100 + rates[1]) * (100 + rates[2])) / 1000000;
          const pText = String(Math.round(product * 10000) / 10000);
          return {
            q: `已知連續三年的產值成長率分別為 ${rates[0]}%、${rates[1]}%、${rates[2]}%，求這三年的平均成長率。`,
            a: `簡答：\\(\\sqrt[3]{${pText}}-1\\)。過程：平均成長率不是算術平均，而是 \\((1+r)^3=${(100 + rates[0]) / 100}\\cdot${(100 + rates[1]) / 100}\\cdot${(100 + rates[2]) / 100}=${pText}\\)，故 \\(r=\\sqrt[3]{${pText}}-1\\)。`,
          };
        },
        () => {
          const combo = s242Pick([
            { p0: 25, p1: 30, next: 36 },
            { p0: 20, p1: 30, next: 45 },
            { p0: 40, p1: 50, next: 62.5 },
            { p0: 16, p1: 20, next: 25 },
            { p0: 25, p1: 35, next: 49 },
            { p0: 50, p1: 60, next: 72 },
          ]);
          const frac = formatFraction(combo.p1, combo.p0);
          return {
            q: `某鎮十年前人口為 ${combo.p0} 萬，現在為 ${combo.p1} 萬，假設每年成長率固定，預測十年後的人口數。`,
            a: `簡答：\\(${combo.next}\\) 萬。過程：十年成長倍率為 \\(${combo.p1}/${combo.p0}=${frac}\\)。再過十年倍率相同，二十年後為 \\(${combo.p1}\\cdot${frac}=${combo.next}\\) 萬。`,
          };
        },
        () => {
          const rates = s242Pick([
            [-10, 20, 0, 50],
            [-20, 25, 0, 60],
            [-10, 10, 0, 40],
            [-25, 20, 0, 50],
          ]);
          const product = rates.reduce((acc, r) => (acc * (100 + r)) / 100, 1);
          const pText = String(Math.round(product * 10000) / 10000);
          return {
            q: `某項投資在四年內的獲利率分別為 ${rates[0]}%、${rates[1]}%、${rates[2]}%、${rates[3]}%，計算其四年平均獲利率。`,
            a: `簡答：\\(\\sqrt[4]{${pText}}-1\\)。過程：總倍率為 \\(${rates.map((r) => (100 + r) / 100).join('\\cdot')}=${pText}\\)。令平均倍率為 \\(1+r\\)，則 \\((1+r)^4=${pText}\\)，所以 \\(r=\\sqrt[4]{${pText}}-1\\)。`,
          };
        },
        () => {
          const init = s242Pick([50, 100, 200, 500]);
          return {
            q: `一細胞每小時分裂一次，數量加倍。若初始有 ${init} 個，求 \\(n\\) 小時後的數量及平均增長率。`,
            a: `簡答：數量 \\(${init}\\cdot2^n\\)，平均每小時增長率 100%。過程：每小時倍率為 2，故 \\(n\\) 小時後為 \\(${init}\\cdot2^n\\)。平均增長倍率仍為 2，所以增長率為 \\(2-1=100\\%\\)。`,
          };
        },
        () => {
          const combo = s242Pick([
            { g: 6, x4: 6, parts: [2, 9, 12] },
            { g: 6, x4: 3, parts: [4, 4, 27] },
            { g: 6, x4: 8, parts: [2, 9, 9] },
            { g: 6, x4: 4, parts: [3, 4, 27] },
            { g: 6, x4: 9, parts: [3, 6, 8] },
            { g: 4, x4: 4, parts: [2, 4, 8] },
            { g: 4, x4: 8, parts: [2, 2, 8] },
            { g: 8, x4: 8, parts: [4, 8, 16] },
          ]);
          const target = combo.g ** 4;
          const partial = combo.parts[0] * combo.parts[1] * combo.parts[2];
          return {
            q: `若一組數據的幾何平均數為 ${combo.g}，已知前三數為 ${combo.parts.join('、')}，求第四個數之值。`,
            a: `簡答：${combo.x4}。過程：四個數的幾何平均為 ${combo.g}，故乘積為 \\(${combo.g}^4=${target}\\)。前三數乘積為 \\(${combo.parts.join('\\cdot')}=${partial}\\)，第四個數為 \\(${target}/${partial}=${combo.x4}\\)。`,
          };
        },
      ],
      count
    );
  }

  function buildS231DeviationMinimizationSet(count) {
    return buildS223DynamicSet(
      [
        () => {
          const values = [randInt(1, 5), randInt(2, 8), randInt(4, 10), randInt(6, 12), s242Pick([16, 20, 25, 32])].sort(
            (a, b) => a - b
          );
          const sum = values.reduce((acc, v) => acc + v, 0);
          const ansText = sum % 5 === 0 ? String(sum / 5) : formatFraction(sum, 5);
          return {
            q: `給定數據 \\(\\{${values.join(',')}\\}\\)，求使 \\(f(x)=\\sum (x_i-x)^2\\) 最小的 \\(x\\) 值。`,
            a: `簡答：\\(${ansText}\\)。過程：平方離差和 \\(\\sum(x_i-x)^2\\) 在 \\(x\\) 等於平均數時最小。資料總和為 ${sum}、筆數 5，所以最小時 \\(x=${ansText}\\)。`,
          };
        },
        () => {
          const a = randInt(1, 3);
          const b = a + randInt(2, 4);
          const c = b + randInt(2, 5);
          const d = c + randInt(2, 4);
          const minVal = d + c - b - a;
          return {
            q: `求使 \\(f(x)=|x-${a}|+|x-${b}|+|x-${c}|+|x-${d}|\\) 產生最小值的 \\(x\\) 範圍及其最小值。`,
            a: `簡答：\\(${b}\\le x\\le${c}\\)，最小值 ${minVal}。過程：絕對離差和在中位數處最小；偶數筆資料時，任取兩個中間數 ${b} 與 ${c} 之間皆可。最小值為 \\((${d}-${a})+(${c}-${b})=${minVal}\\)。`,
          };
        },
        () => {
          const n = s242Pick([29, 35, 41, 49, 55, 61]);
          const mid = (n + 1) / 2;
          return {
            q: `設 ${n} 筆資料為 \\(1,2,3,\\ldots,${n}\\)，求使 \\(f(x)=\\sum_{k=1}^{${n}}|k-x|\\) 最小時的 \\(x\\) 值。`,
            a: `簡答：${mid}。過程：絕對離差和在中位數時最小。${n} 筆資料的中位數是第 ${mid} 個數，因此最小時 \\(x=${mid}\\)。`,
          };
        },
        () => {
          const mu = s242Pick([8, 10, 12, 15]);
          const k2 = mu + randInt(1, 4);
          const diff = (k2 - mu) * (k2 - mu);
          return {
            q: `已知數據的算術平均數為 ${mu}，證明當 \\(k=${mu}\\) 時，\\(\\sum (x_i-k)^2\\) 會小於當 \\(k=${k2}\\) 時的結果。`,
            a: `簡答：成立。過程：平方離差和在 \\(k=\\mu\\) 時最小。此處 \\(\\mu=${mu}\\)，且 \\(\\sum(x_i-${k2})^2=\\sum(x_i-${mu})^2+n(${k2}-${mu})^2=\\sum(x_i-${mu})^2+${diff}n\\)，因 \\(n>0\\)，所以 \\(k=${mu}\\) 時嚴格小於 \\(k=${k2}\\) 時的結果。`,
          };
        },
        () => {
          const target = s242Pick([
            { goal: '最小化誤差平方和', ans: '平均數' },
            { goal: '最小化絕對誤差和', ans: '中位數' },
          ]);
          return {
            q: `給定一組離散數據，判斷眾數、平均數、中位數中，哪一個最適合用於${target.goal}。`,
            a: `簡答：${target.ans}。過程：平方誤差和 \\(\\sum(x_i-a)^2\\) 的最小點是平均數；絕對誤差和的最小點是中位數；眾數則描述最常出現的值。`,
          };
        },
      ],
      count
    );
  }

  function buildS231PercentileOutlierSet(count) {
    return buildS223DynamicSet(
      [
        () => {
          const combo = s242Pick([
            { n: 15, p: 75, pos: 12 },
            { n: 19, p: 50, pos: 10 },
            { n: 19, p: 75, pos: 15 },
            { n: 24, p: 60, pos: 15 },
            { n: 39, p: 25, pos: 10 },
            { n: 15, p: 25, pos: 4 },
            { n: 19, p: 80, pos: 16 },
            { n: 29, p: 50, pos: 15 },
          ]);
          return {
            q: `給定 ${combo.n} 位同學的體重資料（已由小到大排列），求第 ${combo.p} 百分位數 \\(P_{${combo.p}}\\) 的位置。`,
            a: `簡答：第 ${combo.pos} 個資料。過程：位置可用 \\((n+1)\\times${combo.p}\\%=${combo.n + 1}\\times${combo.p / 100}=${combo.pos}\\)，所以 \\(P_{${combo.p}}\\) 位在第 ${combo.pos} 個資料。`,
          };
        },
        () => {
          const q1 = 5 * randInt(4, 10);
          const q3 = q1 + 5 * randInt(2, 8);
          return {
            q: `一組數據的 \\(Q_1=${q1}\\)、\\(Q_3=${q3}\\)，求其四分位距 \\(IQR\\)。`,
            a: `簡答：${q3 - q1}。過程：四分位距定義為 \\(IQR=Q_3-Q_1=${q3}-${q1}=${q3 - q1}\\)。`,
          };
        },
        () => {
          const q1 = 10 * randInt(3, 6);
          const iqr = 2 * randInt(5, 15);
          const q3 = q1 + iqr;
          const upper = q3 + 1.5 * iqr;
          const isOutlier = randInt(0, 1) === 0;
          const value = isOutlier ? upper + 5 * randInt(1, 4) : upper - 5 * randInt(1, 3);
          return {
            q: `根據 1.5 倍 \\(IQR\\) 規則，若 \\(Q_1=${q1}\\)、\\(Q_3=${q3}\\)，判斷數值 ${value} 是否為離群值。`,
            a: `簡答：${isOutlier ? '是' : '否'}。過程：\\(IQR=${iqr}\\)，上界為 \\(Q_3+1.5IQR=${q3}+${1.5 * iqr}=${upper}\\)。因 ${value} ${isOutlier ? '大於' : '不大於'} ${upper}，所以 ${value} ${isOutlier ? '是' : '不是'}離群值。`,
          };
        },
        () => {
          const rank = 5 * randInt(1, 8);
          return {
            q: `在 100 位同學的成績中，某生排名第 ${rank} 名（由高到低），求其所在的百分等級（PR 值）。`,
            a: `簡答：約 PR ${100 - rank}。過程：排名第 ${rank} 表示約有 ${100 - rank}% 的同學在其後方或不高於他，因此可估為 PR ${100 - rank}。`,
          };
        },
        () => {
          const p = s242Pick([40, 60, 70, 80]);
          return {
            q: `給定累積次數分配曲線，要求第 ${p} 百分位數 \\(P_{${p}}\\) 落在哪一個組距內，應如何判斷？`,
            a: `簡答：找累積次數首次達到總次數 ${p}% 的組距。過程：先算 \\(${p / 100}n\\) 的位置，再在累積次數表或曲線上找第一次超過或等於該位置的組距，該組距即包含 \\(P_{${p}}\\)。`,
          };
        },
      ],
      count
    );
  }

  function buildS231SamplingMethodsSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const interval = s242Pick([50, 100, 200]);
            const start = String(randInt(1, 9)).padStart(3, '0');
            this._cached = `全校 1000 人，編號 000 到 999。欲選取 ${1000 / interval} 人，若從 ${start} 號開始每隔 ${interval} 號取一人，此為哪種抽樣方法？`;
            return this._cached;
          },
          a: '簡答：系統抽樣。過程：先決定起始點，再依固定間隔抽取樣本，這正是系統抽樣。',
        },
        {
          get q() {
            const a = 50 * randInt(6, 10);
            const b = 50 * randInt(4, 8);
            const c = 1000 - a - b;
            this._parts = [a, b, c];
            return `某校有高一 ${a} 人、高二 ${b} 人、高三 ${c} 人，欲按比例抽取 100 人，求各年級應抽取的人數。`;
          },
          get a() {
            const [a, b, c] = this._parts || [400, 300, 300];
            return `簡答：高一 ${a / 10} 人，高二 ${b / 10} 人，高三 ${c / 10} 人。過程：總人數 1000，抽樣比例為 \\(100/1000=1/10\\)。各層抽取人數為 ${a}/10、${b}/10、${c}/10。`;
          },
        },
        {
          q: '判斷下列何者屬於簡單隨機抽樣：(A) 抽籤 (B) 隨機號碼表 (C) 街頭攔人採訪。',
          a: '簡答：(A)、(B)。過程：簡單隨機抽樣要求每個個體有相同且可控制的被抽機會。抽籤與隨機號碼表符合；街頭攔人採訪容易有偏差，不屬於簡單隨機抽樣。',
        },
        {
          q: '若母體中各群體間差異極大，但群體內部性質相近，應採用哪種抽樣方法較佳？',
          a: '簡答：分層抽樣。過程：當群體之間差異大時，應先按重要特徵分層，再從各層依比例或固定數抽樣，較能保持代表性。',
        },
        {
          q: '若母體分成若干群，每群結構與母體相似，隨機選取其中幾群進行普查，此為哪種方法？',
          a: '簡答：部落抽樣（集群抽樣）。過程：先把母體分成若干群，再抽取部分群並調查群內所有個體，屬於部落或集群抽樣。',
        },
      ],
      count
    );
  }

  function buildS231CumulativeFrequencySet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const leftIsA = randInt(0, 1) === 0;
            this._leftIsA = leftIsA;
            return leftIsA
              ? '給定甲、乙兩班的累積次數分配曲線，若甲班曲線在左、乙班在右，判斷哪一班的中位數較大。'
              : '給定甲、乙兩班的累積次數分配曲線，若乙班曲線在左、甲班在右，判斷哪一班的中位數較大。';
          },
          get a() {
            const leftIsA = this._leftIsA !== undefined ? this._leftIsA : true;
            const bigger = leftIsA ? '乙班' : '甲班';
            return `簡答：${bigger}較大。過程：累積曲線越往右，表示同一累積比例所對應的分數越高。中位數是累積比例 50% 的位置，因此曲線較右者中位數較大。`;
          },
        },
        {
          q: '從累積次數圖中觀察哪一個分數區間斜率最大，該區間代表什麼意義？',
          a: '簡答：該區間人數最多。過程：累積次數曲線在某區間上升越快，表示該區間累積增加的人數越多，也就是該組距的次數最大。',
        },
        {
          get q() {
            const steepIsA = randInt(0, 1) === 0;
            this._steepIsA = steepIsA;
            return steepIsA
              ? '若甲班曲線較陡峭且集中於中間，乙班較平緩，判斷哪一班標準差較小。'
              : '若乙班曲線較陡峭且集中於中間，甲班較平緩，判斷哪一班標準差較小。';
          },
          get a() {
            const steepIsA = this._steepIsA !== undefined ? this._steepIsA : true;
            const smaller = steepIsA ? '甲班' : '乙班';
            return `簡答：${smaller}較小。過程：資料越集中，離散程度越小，標準差越小。累積曲線集中在中間且上升較陡，表示分數較集中。`;
          },
        },
        {
          get q() {
            const n = s242Pick([80, 100, 120, 200]);
            const p = s242Pick([25, 40, 60, 75]);
            this._np = [n, p];
            return `給定 ${n} 人的累積次數圖，預測第 ${p} 百分位數 \\(P_{${p}}\\) 落在哪一組距內，應先找哪個累積次數位置？`;
          },
          get a() {
            const [n, p] = this._np || [100, 25];
            return `簡答：第 ${(n * p) / 100} 個位置。過程：在 ${n} 人資料中位置約為 \\(${n}\\times${p}\\%=${(n * p) / 100}\\)。在累積次數圖中找累積次數達 ${(n * p) / 100} 的組距。`;
          },
        },
        {
          get q() {
            const cut = s242Pick([50, 60, 70]);
            this._cut = cut;
            return `從累積次數表中估計及格人數（${cut} 分以上）占全體總人數的百分比，應如何計算？`;
          },
          get a() {
            const cut = this._cut || 60;
            return `簡答：\\(\\frac{總人數-未滿${cut}分累積人數}{總人數}\\times100\\%\\)。過程：累積次數表通常可讀出低於 ${cut} 分的人數，用總人數扣除即為 ${cut} 分以上的人數，再除以總人數得百分比。`;
          },
        },
      ],
      count
    );
  }

  function buildS231GroupedEstimationSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const n = s242Pick([50, 80, 100, 200]);
            const w = s242Pick([5, 10]);
            return `已知 ${n} 名學生考試成績的分組表（組距為 ${w}），假設組內均勻分布，求算術平均數時應使用哪個代表值？`;
          },
          a: '簡答：各組組中點。過程：分組資料不知道每筆原始數據，估計平均數時以每組組中點代表該組資料，再用 \\(\\frac{\\sum f_i m_i}{\\sum f_i}\\) 計算。',
        },
        {
          get q() {
            const n = s242Pick([60, 80, 100, 120, 200]);
            this._n = n;
            return `利用插補法估計分組數據的中位數時，若共有 ${n} 筆資料，應找第幾名與第幾名所在位置？`;
          },
          get a() {
            const n = this._n || 100;
            return `簡答：第 ${n / 2} 名與第 ${n / 2 + 1} 名附近。過程：偶數筆資料的中位數在第 \\(n/2\\) 與第 \\(n/2+1\\) 筆之間，因此 ${n} 筆資料要看第 ${n / 2}、${n / 2 + 1} 名所在組距。`;
          },
        },
        {
          q: '給定分組次數表，若以次數最高組的組中點作為該組數據的眾數估計值，這種估計的依據是什麼？',
          a: '簡答：眾數落在最高次數組內。過程：分組資料只能知道哪個組距出現最多次，因此以最高次數組代表眾數所在區間，再用組中點作粗略估計。',
        },
        {
          q: '若將分組數據的所有組距均縮小一半，討論其對算術平均數估計值的影響。',
          a: '簡答：通常估計會更精細，但需重新分組計算。過程：組距縮小後，組中點更接近原始資料位置，平均數估計通常較準；但若各組頻率重新分配不同，結果也可能改變。',
        },
        {
          get q() {
            const p = s242Pick([30, 40, 60, 70, 80]);
            this._p = p;
            return `從分組表中計算第 ${p} 百分位數 \\(P_{${p}}\\) 的估計值時，第一步應做什麼？`;
          },
          get a() {
            const p = this._p || 60;
            return `簡答：先找第 \\(${p / 100}n\\) 個資料落在哪一組。過程：百分位數要先定位。找出累積次數首次達到 \\(${p / 100}n\\) 的組距，再在該組距內用插補法估計。`;
          },
        },
      ],
      count
    );
  }

  // ===== NEW PARAMETRIZED GENERATORS =====

  function buildS231QuartilesIQRParameterizedSet(count) {
    // 四分位數與四分位距：給定 7~11 個有序整數，求 Q1, Q2, Q3, IQR
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i++) {
      const mode = i % 2;
      if (mode === 0) {
        // Odd n (7 or 9): Q2 = middle, Q1 = median of lower half, Q3 = median of upper half
        const n = [7, 9][randInt(0, 1)];
        const base = [40, 50, 60, 70][randInt(0, 3)];
        const step = [2, 3, 4, 5][randInt(0, 3)];
        // Generate arithmetic-ish sequence with small noise
        const vals = [];
        for (let k = 0; k < n; k++) {
          vals.push(base + k * step + randInt(0, 1) * randInt(-1, 1));
        }
        vals.sort((a, b) => a - b);
        // Remove duplicates for cleanliness
        const medianInfo = (arr) => {
          const mid = Math.floor(arr.length / 2);
          if (arr.length % 2 === 1) {
            return { value: arr[mid], calculation: `\\(第 ${mid + 1} 個 = ${arr[mid]}\\)` };
          }
          const value = (arr[mid - 1] + arr[mid]) / 2;
          return { value, calculation: `\\(\\dfrac{${arr[mid - 1]}+${arr[mid]}}{2} = ${value}\\)` };
        };
        const mid = Math.floor(n / 2);
        const q2 = medianInfo(vals);
        // Lower half: vals[0..mid-1], Q1 = median of those
        const lowerHalf = vals.slice(0, mid);
        const upperHalf = vals.slice(mid + 1);
        const q1 = medianInfo(lowerHalf);
        const q3 = medianInfo(upperHalf);
        const iqr = q3.value - q1.value;
        const valsStr = vals.join(', ');
        questions.push(
          `給定已排序的數據：\\(${valsStr}\\)。` +
            `求第一四分位數 \\(Q_1\\)、中位數 \\(Q_2\\)、第三四分位數 \\(Q_3\\) 與四分位距 \\(IQR\\)。`
        );
        answers.push(
          `簡答：\\(Q_1=${q1.value}\\)，\\(Q_2=${q2.value}\\)，\\(Q_3=${q3.value}\\)，\\(IQR=${iqr}\\)。` +
            `過程：共 ${n} 筆，\\(Q_2\\)（中位數）的計算為 ${q2.calculation}，所以 \\(Q_2=${q2.value}\\)。` +
            `下半部 \\(${lowerHalf.join(', ')}\\) 的中位數為 \\(Q_1=${q1.value}\\)（計算為 ${q1.calculation}）；` +
            `上半部 \\(${upperHalf.join(', ')}\\) 的中位數為 \\(Q_3=${q3.value}\\)（計算為 ${q3.calculation}）。` +
            `\\(IQR = Q_3 - Q_1 = ${q3.value} - ${q1.value} = ${iqr}\\)。`
        );
      } else {
        // Mode 1: even n (8 or 10)
        const n = [8, 10][randInt(0, 1)];
        const base = [40, 50, 60][randInt(0, 2)];
        const step = [3, 4, 5][randInt(0, 2)];
        const vals = [];
        for (let k = 0; k < n; k++) vals.push(base + k * step);
        const medianInfo = (arr) => {
          const len = arr.length;
          const mid = Math.floor(len / 2);
          if (len % 2 === 1) {
            return {
              value: arr[mid],
              text: String(arr[mid]),
              explanation: `第 ${mid + 1} 個 = ${arr[mid]}`,
            };
          }
          const sum = arr[mid - 1] + arr[mid];
          const value = sum / 2;
          return {
            value,
            text: String(value),
            explanation: `\\dfrac{${arr[mid - 1]}+${arr[mid]}}{2} = ${value}`,
          };
        };
        // Q2 = average of n/2 and n/2+1 (0-indexed: n/2-1 and n/2)
        const mid1 = n / 2 - 1,
          mid2 = n / 2;
        const q2 = medianInfo(vals);
        // Q1 = median of lower half (n/2 elements, which is even if n divisible by 4, odd otherwise)
        const lH = vals.slice(0, n / 2);
        const uH = vals.slice(n / 2);
        const q1 = medianInfo(lH);
        const q3 = medianInfo(uH);
        const iqrStr = String(q3.value - q1.value);
        const valsStr = vals.join(', ');
        questions.push(
          `給定已排序的 ${n} 筆數據：\\(${valsStr}\\)。` + `求 \\(Q_1\\)、\\(Q_2\\)、\\(Q_3\\) 與四分位距 \\(IQR\\)。`
        );
        answers.push(
          `簡答：\\(Q_1=${q1.text}\\)，\\(Q_2=${q2.text}\\)，\\(Q_3=${q3.text}\\)，\\(IQR=${iqrStr}\\)。` +
            `過程：共 ${n} 筆，\\(Q_2 = ${q2.explanation}\\)。` +
            `下半部 \\(${lH.join(', ')}\\)：\\(Q_1 = ${q1.explanation}\\)；` +
            `上半部 \\(${uH.join(', ')}\\)：\\(Q_3 = ${q3.explanation}\\)。` +
            `\\(IQR = ${q3.text} - ${q1.text} = ${iqrStr}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS231GroupedMeanParameterizedSet(count) {
    // 分組資料：給定組中點與次數，估計加權平均數；或求缺少的次數
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const midpointSets = [
      [25, 35, 45, 55],
      [30, 40, 50, 60],
      [55, 65, 75, 85],
      [10, 20, 30, 40],
    ];
    for (let i = 0; i < count; i++) {
      const mode = i % 2;
      const mpSet = midpointSets[randInt(0, midpointSets.length - 1)];
      const freqs = [randInt(3, 8), randInt(5, 12), randInt(8, 15), randInt(3, 7)];
      const n = freqs.reduce((a, b) => a + b, 0);
      const sumFM = mpSet.reduce((s, m, k) => s + m * freqs[k], 0);
      const mu = sumFM / n;
      const isClean = Number.isInteger(mu);
      const muStr = isClean ? String(mu) : `\\dfrac{${sumFM}}{${n}}`;
      if (mode === 0) {
        // Given midpoints and frequencies → estimate weighted mean
        const tableRows = mpSet
          .map((m, k) => `\\(${k > 0 ? mpSet[k - 1] : mpSet[k] - 5}\\sim${m + 5}\\) & \\(${m}\\) & \\(${freqs[k]}\\)`)
          .join(' \\\\ ');
        questions.push(
          `某班考試成績分組如下：組距各為 10，組中點依序為 \\(${mpSet.join(', ')}\\)，` +
            `各組人數依序為 \\(${freqs.join(', ')}\\)，共 ${n} 人。` +
            `試估計平均成績。`
        );
        const prodStr = mpSet.map((m, k) => `${m}\\times${freqs[k]}`).join(' + ');
        answers.push(
          `簡答：\\(\\bar{x} \\approx ${muStr}\\)。` +
            `過程：加權平均 \\(= \\dfrac{\\sum f_i m_i}{\\sum f_i} = \\dfrac{${prodStr}}{${n}} = \\dfrac{${sumFM}}{${n}} = ${muStr}\\)。`
        );
      } else {
        // Mode 1: given 3 frequencies and total mean → find missing frequency
        const missingIdx = randInt(0, 3);
        if (Math.abs(mu - mpSet[missingIdx]) < 1e-12) {
          // 此時加權平均式中的 x 會消去，無法唯一反推未知次數；重新取題。
          i -= 1;
          continue;
        }
        const knownFreqs = freqs.slice();
        const missingF = knownFreqs[missingIdx];
        knownFreqs[missingIdx] = null;
        // Total: n = sumKnownFreqs + missingF
        const knownN = freqs.reduce((s, f, k) => (k === missingIdx ? s : s + f), 0);
        const knownSumFM = mpSet.reduce((s, m, k) => (k === missingIdx ? s : s + m * freqs[k]), 0);
        const freqsDisplay = knownFreqs.map((f, k) => (f === null ? `x` : String(f))).join(', ');
        questions.push(
          `某班考試分組，組中點依序為 \\(${mpSet.join(', ')}\\)，` +
            `各組人數依序為 \\(${freqsDisplay}\\)，已知平均成績為 \\(${muStr}\\)。` +
            `求未知次數 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x = ${missingF}\\)。` +
            `過程：設總人數 \\(N = ${knownN} + x\\)。` +
            `由 \\(\\dfrac{${knownSumFM} + ${mpSet[missingIdx]}x}{${knownN} + x} = ${muStr}\\)，` +
            `解得 \\(x = ${missingF}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS232CorrelationFromSumsParameterizedSet(count) {
    // 給定 Sxx, Syy, Sxy 或 Σ → 計算相關係數 r
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // Pre-designed datasets giving clean r fractions
    const datasets = [
      { label: 'Sxx=100, Syy=400, Sxy=120', sxx: 100, syy: 400, sxy: 120, rNum: 3, rDen: 5 },
      { label: 'Sxx=50, Syy=200, Sxy=60', sxx: 50, syy: 200, sxy: 60, rNum: 3, rDen: 5 },
      { label: 'Sxx=25, Syy=100, Sxy=20', sxx: 25, syy: 100, sxy: 20, rNum: 2, rDen: 5 },
      { label: 'Sxx=36, Syy=100, Sxy=54', sxx: 36, syy: 100, sxy: 54, rNum: 9, rDen: 10 },
      { label: 'Sxx=100, Syy=64, Sxy=64', sxx: 100, syy: 64, sxy: 64, rNum: 4, rDen: 5 },
      { label: 'Sxx=100, Syy=25, Sxy=-40', sxx: 100, syy: 25, sxy: -40, rNum: -4, rDen: 5 },
      { label: 'Sxx=400, Syy=100, Sxy=120', sxx: 400, syy: 100, sxy: 120, rNum: 3, rDen: 5 },
      { label: 'Sxx=16, Syy=100, Sxy=-32', sxx: 16, syy: 100, sxy: -32, rNum: -4, rDen: 5 },
    ];
    for (let i = 0; i < count; i++) {
      const mode = i % 2;
      const ds = datasets[randInt(0, datasets.length - 1)];
      const gcd = (a, b) => (b ? gcd(b, a % b) : a);
      const g = gcd(Math.abs(ds.rNum), ds.rDen);
      const rNs = ds.rNum / g,
        rDs = ds.rDen / g;
      const rStr = rDs === 1 ? String(rNs) : `\\dfrac{${rNs}}{${rDs}}`;
      if (mode === 0) {
        // Direct: given Sxx, Syy, Sxy
        questions.push(
          `已知兩組變數的離差平方和與離差乘積和為：` +
            `\\(S_{xx} = ${ds.sxx}\\)，\\(S_{yy} = ${ds.syy}\\)，\\(S_{xy} = ${ds.sxy}\\)。` +
            `求 \\(x\\) 與 \\(y\\) 的相關係數 \\(r\\)。`
        );
        const rootValue = Math.sqrt(ds.sxx * ds.syy);
        answers.push(
          `簡答：\\(r = ${rStr}\\)。` +
            `過程：\\(r = \\dfrac{S_{xy}}{\\sqrt{S_{xx} \\cdot S_{yy}}} = \\dfrac{${ds.sxy}}{\\sqrt{${ds.sxx} \\times ${ds.syy}}} = \\dfrac{${ds.sxy}}{${rootValue}} = ${rStr}\\)。`
        );
      } else {
        // Mode 1: Scale up to Σ form
        const n = [5, 8, 10][randInt(0, 2)];
        const muX = [10, 20, 30][randInt(0, 2)];
        const muY = [15, 25, 35][randInt(0, 2)];
        const sumX = n * muX,
          sumY = n * muY;
        // Σx² = Sxx + (Σx)²/n = Sxx + n*muX²
        const sumX2 = ds.sxx + n * muX * muX;
        const sumY2 = ds.syy + n * muY * muY;
        const sumXY = ds.sxy + n * muX * muY;
        questions.push(
          `已知 \\(n = ${n}\\)，\\(\\sum x_i = ${sumX}\\)，\\(\\sum y_i = ${sumY}\\)，` +
            `\\(\\sum x_i^2 = ${sumX2}\\)，\\(\\sum y_i^2 = ${sumY2}\\)，\\(\\sum x_i y_i = ${sumXY}\\)。` +
            `求 \\(x\\) 與 \\(y\\) 的相關係數。`
        );
        answers.push(
          `簡答：\\(r = ${rStr}\\)。` +
            `過程：\\(S_{xx} = ${sumX2} - \\dfrac{${sumX}^2}{${n}} = ${ds.sxx}\\)，` +
            `\\(S_{yy} = ${sumY2} - \\dfrac{${sumY}^2}{${n}} = ${ds.syy}\\)，` +
            `\\(S_{xy} = ${sumXY} - \\dfrac{${sumX} \\times ${sumY}}{${n}} = ${ds.sxy}\\)。` +
            `\\(r = \\dfrac{${ds.sxy}}{\\sqrt{${ds.sxx} \\times ${ds.syy}}} = ${rStr}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS232LeastSquaresSmallDataParameterizedSet(count) {
    // 給定 3 個數據點（x=[1,2,3]），用最小平方法求迴歸直線 y=bx+a
    // b = (y3-y1)/2, ȳ = (y1+y2+y3)/3, a = ȳ - 2b
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const kOpts = [1, 2, 3, 4, 5]; // underlying slope
    const cOpts = [5, 10, 15, 20, 30]; // intercept offset
    const qOpts = [-6, -3, 0, 3, 6]; // noise on y2 (divisible by 3 → clean ȳ)
    for (let i = 0; i < count; i++) {
      const mode = i % 2;
      const k = kOpts[randInt(0, kOpts.length - 1)];
      const c = cOpts[randInt(0, cOpts.length - 1)];
      const q = qOpts[randInt(0, qOpts.length - 1)];
      // x=[1,2,3], y=[2k+c, 3k+q+c, 4k+c]
      const y1 = 2 * k + c,
        y2 = 3 * k + q + c,
        y3 = 4 * k + c;
      const b = k; // (y3-y1)/2 = (4k-2k)/2 = k
      const ybar = (y1 + y2 + y3) / 3; // = (9k+q+3c)/3 = 3k+q/3+c
      const a = ybar - 2 * b; // = k + q/3 + c
      const aIsClean = Number.isInteger(a);
      if (!aIsClean && mode === 1) {
        // Re-generate with q=0 to guarantee clean a
        const qSafe = 0;
        const y1s = 2 * k + c,
          y2s = 3 * k + c,
          y3s = 4 * k + c;
        const ybars = (y1s + y2s + y3s) / 3;
        const as = ybars - 2 * k;
        if (mode === 1) {
          // predict at x=5
          const x0 = 5,
            y0 = k * 5 + as;
          questions.push(
            `已知數據 \\((1,${y1s}),(2,${y2s}),(3,${y3s})\\)，` +
              `利用最小平方法求迴歸直線 \\(y = bx + a\\)，並預測 \\(x=5\\) 時 \\(y\\) 的值。`
          );
          answers.push(
            `簡答：迴歸線 \\(${s23LineEquationText(k, as)}\\)，\\(x=5\\) 時 \\(y=${y0}\\)。` +
              `過程：\\(\\bar x = 2\\)，\\(\\bar y = ${ybars}\\)；` +
              `\\(S_{xx} = 2\\)，\\(S_{xy} = (1-2)(${y1s}-${ybars})+(3-2)(${y3s}-${ybars}) = ${y3s - y1s}\\)；` +
              `\\(b = \\dfrac{${y3s - y1s}}{2} = ${k}\\)，\\(a = ${ybars} - ${k} \\times 2 = ${as}\\)。` +
              `預測：\\(y = ${k} \\times 5 + ${as} = ${y0}\\)。`
          );
          questions[questions.length - 1] && answers.push && null; // no-op
        }
        continue;
      }
      const aStr = Number.isInteger(a) ? String(a) : `\\dfrac{${a * 3}}{3}`;
      const aDisplay = Number.isInteger(a) ? String(a) : `${a}`;
      const lineText = s23LineEquationText(b, a);
      if (mode === 0) {
        // Just find the regression line
        const sxy = y3 - y1; // = 2k
        questions.push(
          `利用最小平方法，根據數據 \\((1,${y1}),(2,${y2}),(3,${y3})\\) 求 \\(y\\) 對 \\(x\\) 的迴歸直線 \\(y = bx + a\\)。`
        );
        answers.push(
          `簡答：\\(${lineText}\\)。` +
            `過程：\\(\\bar x = 2\\)，\\(\\bar y = \\dfrac{${y1}+${y2}+${y3}}{3} = ${ybar}\\)。` +
            `\\(S_{xx} = (1-2)^2+(2-2)^2+(3-2)^2 = 2\\)。` +
            `\\(S_{xy} = (1-2)(${y1}-${ybar})+(2-2)(${y2}-${ybar})+(3-2)(${y3}-${ybar}) = ${sxy}\\)。` +
            `\\(b = \\dfrac{${sxy}}{2} = ${b}\\)，\\(a = ${ybar} - ${b} \\times 2 = ${aDisplay}\\)，所以 \\(${lineText}\\)。`
        );
      } else {
        // Predict at x=4 or x=5
        const x0 = [4, 5][randInt(0, 1)];
        const y0 = b * x0 + a;
        const y0Str = Number.isInteger(y0) ? String(y0) : `${y0}`;
        questions.push(
          `已知數據為 \\((1,${y1}),(2,${y2}),(3,${y3})\\)。` +
            `求迴歸直線，並預測 \\(x = ${x0}\\) 時 \\(y\\) 的估計值。`
        );
        answers.push(
          `簡答：\\(${lineText}\\)，\\(x=${x0}\\) 時 \\(y=${y0Str}\\)。` +
            `過程：\\(b = \\dfrac{${y3}-${y1}}{2} = ${b}\\)，\\(\\bar y = ${ybar}\\)，\\(a = ${ybar} - ${b} \\times 2 = ${aDisplay}\\)。` +
            `預測：\\(y = ${b}\\times${x0}${s23SignedNumberText(a)}=${y0Str}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS231GeometricGrowthRateParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = ['公司營業額', '地區人口', '房價指數', '網站會員數'];
    const factorOptions = [
      { pct: -20, num: 80, den: 100 },
      { pct: -10, num: 90, den: 100 },
      { pct: 0, num: 100, den: 100 },
      { pct: 10, num: 110, den: 100 },
      { pct: 20, num: 120, den: 100 },
      { pct: 25, num: 125, den: 100 },
      { pct: 50, num: 150, den: 100 },
      { pct: 60, num: 160, den: 100 },
      { pct: 80, num: 180, den: 100 },
    ];

    for (let i = 0; i < count; i += 1) {
      const years = randInt(3, 5);
      const factors = [];
      for (let j = 0; j < years; j += 1) factors.push(factorOptions[randInt(0, factorOptions.length - 1)]);
      const productNum = factors.reduce((acc, item) => acc * item.num, 1);
      const productDen = factors.reduce((acc, item) => acc * item.den, 1);
      const productValue = productNum / productDen;
      const averageRate = Math.pow(productValue, 1 / years) - 1;
      const pctText = (averageRate * 100).toFixed(2);
      const rateText = factors.map((item) => `${item.pct}%`).join('、');
      const context = contexts[i % contexts.length];
      questions.push(
        `某${context}連續 ${years} 年的成長率依序為 ${rateText}。若要用同一個固定年成長率表示這 ${years} 年的整體變化，求平均年成長率約為多少百分比？`
      );
      answers.push(
        `簡答：約 \\(${pctText}\\%\\)。過程：平均成長率要用幾何平均。設平均年成長率為 \\(r\\)，則 \\((1+r)^{${years}}=${factors.map((item) => `\\frac{${item.num}}{100}`).join('\\times')}=\\frac{${productNum}}{${productDen}}\\)。所以 \\(r=\\sqrt[${years}]{\\frac{${productNum}}{${productDen}}}-1\\approx ${pctText}\\%\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS231SqrtScoreTransformParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = ['小考', '數學平時考', '能力測驗', '段考'];

    for (let i = 0; i < count; i += 1) {
      const n = [30, 40, 50, 60][randInt(0, 3)];
      const muY = [60, 65, 70, 75][randInt(0, 3)];
      const sigmaY = [8, 10, 12, 15, 20][randInt(0, 4)];
      const scale = 10;
      const numerator = muY * muY + sigmaY * sigmaY;
      const originalMean = numerator / (scale * scale);
      const originalText = Number.isInteger(originalMean) ? String(originalMean) : originalMean.toFixed(2);
      const context = contexts[i % contexts.length];
      questions.push(
        `某班 ${n} 人${context}成績較低，老師將每位同學原始成績 \\(X\\) 調整為 \\(Y=${scale}\\sqrt{X}\\)。已知調整後成績 \\(Y\\) 的平均數為 ${muY}，標準差為 ${sigmaY}，求原始成績 \\(X\\) 的平均數。`
      );
      answers.push(
        `簡答：\\(${originalText}\\)。過程：由 \\(Y=10\\sqrt{X}\\) 得 \\(X=\\frac{Y^2}{100}\\)，所以 \\(\\bar X=\\frac{E(Y^2)}{100}\\)。又 \\(E(Y^2)=\\sigma_Y^2+\\mu_Y^2=${sigmaY}^2+${muY}^2=${numerator}\\)，故 \\(\\bar X=\\frac{${numerator}}{100}=${originalText}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS231VarianceCorrectionDifferenceParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = ['義工時數', '測驗分數', '閱讀時數', '練習題數'];

    for (let i = 0; i < count; i += 1) {
      const n = [30, 40, 50, 60][randInt(0, 3)];
      const mean = [50, 60, 70, 80][randInt(0, 3)];
      const near = [5, 8, 10][randInt(0, 2)];
      const far = near + [10, 15, 20][randInt(0, 2)];
      const correctLow = mean - near;
      const correctHigh = mean + near;
      const wrongLow = mean - far;
      const wrongHigh = mean + far;
      const diffNum = 2 * (far * far - near * near);
      const diff = simplifyFraction(diffNum, n);
      const context = contexts[i % contexts.length];
      questions.push(
        `某班 ${n} 位同學的${context}平均數為 ${mean}。後來發現兩筆資料登記錯誤：正確應為 ${correctLow}、${correctHigh}，卻誤登為 ${wrongLow}、${wrongHigh}。若更正前標準差為 \\(x\\)，更正後標準差為 \\(y\\)，求 \\(x^2-y^2\\)。`
      );
      answers.push(
        `簡答：\\(${formatFraction(diff.num, diff.den)}\\)。過程：兩筆資料的總和在更正前後都為 ${2 * mean}，所以平均數不變。只需比較這兩筆對變異數的貢獻：誤登時離均差平方和為 \\(${far}^2+${far}^2\\)，正確時為 \\(${near}^2+${near}^2\\)。因此 \\(x^2-y^2=\\frac{2(${far}^2-${near}^2)}{${n}}=\\frac{${diffNum}}{${n}}=${formatFraction(diff.num, diff.den)}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS231EqualSizeGroupMergeParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = ['甲、乙兩班', '兩個校區', '兩組選手', '兩個社團'];

    for (let i = 0; i < count; i += 1) {
      const eachN = [10, 15, 20, 25][randInt(0, 3)];
      const center = [50, 60, 70, 80][randInt(0, 3)];
      const gap = [3, 4, 5, 6, 8][randInt(0, 4)];
      const sigma = [3, 4, 5, 6, 8][randInt(0, 4)];
      const meanA = center - gap;
      const meanB = center + gap;
      const variance = sigma * sigma + gap * gap;
      const sdText = isPerfectSquare(variance) ? `${Math.sqrt(variance)}` : `\\sqrt{${variance}}`;
      const context = contexts[i % contexts.length];
      questions.push(
        `${context}人數相同，各有 ${eachN} 人。甲組平均為 ${meanA}、標準差為 ${sigma}；乙組平均為 ${meanB}、標準差也為 ${sigma}。若合併成一組，求合併後的平均數與標準差。`
      );
      answers.push(
        `簡答：平均數 \\(${center}\\)，標準差 \\(${sdText}\\)。過程：兩組人數相同，所以合併平均為 \\(\\frac{${meanA}+${meanB}}2=${center}\\)。合併變異數為「組內變異」加「組間變異」：\\(${sigma}^2+${gap}^2=${variance}\\)，所以標準差為 \\(${sdText}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS231MeanMedianMissingScoreParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = ['五科成績', '五次小考分數', '五位同學的測驗分數', '五筆資料'];
    const offsetPairs = [
      [12, 4, 5, 11],
      [10, 3, 4, 9],
      [14, 6, 7, 13],
      [8, 2, 3, 7],
    ];

    for (let i = 0; i < count; i += 1) {
      const center = [65, 70, 75, 80, 85][randInt(0, 4)];
      const [leftFar, leftNear, rightNear, rightFar] = offsetPairs[randInt(0, offsetPairs.length - 1)];
      const known = [center - leftFar, center - leftNear, center + rightNear, center + rightFar];
      const knownSum = known.reduce((sum, value) => sum + value, 0);
      const context = contexts[i % contexts.length];
      questions.push(
        `某組${context}為 \\(${known.join(', ')}, x\\)。已知 \\(x\\) 為介於 ${center - leftNear} 與 ${center + rightNear} 之間且不等於端點的整數，且這五筆資料的算術平均數與中位數相等，求 \\(x\\)。`
      );
      answers.push(
        `簡答：\\(x=${center}\\)。過程：因 \\(${center - leftNear}<x<${center + rightNear}\\)，排序後中位數為 \\(x\\)。又平均數等於中位數，所以 \\(\\frac{${knownSum}+x}{5}=x\\)，得 \\(${knownSum}+x=5x\\)，故 \\(x=${center}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS231BoundedVarianceMaxParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = ['測驗成績', '產品誤差值', '每日溫差紀錄', '資料值'];

    for (let i = 0; i < count; i += 1) {
      const n = [8, 10, 12, 20][randInt(0, 3)];
      const low = [0, 10, 20, 30, 40][randInt(0, 4)];
      const halfRange = [5, 10, 15, 20, 25][randInt(0, 4)];
      const high = low + 2 * halfRange;
      const mean = low + halfRange;
      const variance = halfRange * halfRange;
      const halfN = n / 2;
      const context = contexts[i % contexts.length];
      questions.push(
        `有 ${n} 筆${context}，每筆都介於 ${low} 到 ${high} 之間（含端點），且算術平均數為 ${mean}。求這組資料的母體變異數最大可能值。`
      );
      answers.push(
        `簡答：\\(${variance}\\)。過程：平均數剛好是上下界中點，要讓資料最分散，就讓 ${halfN} 筆為 ${low}、${halfN} 筆為 ${high}。每筆到平均數的距離都是 ${halfRange}，所以最大變異數為 \\(${halfRange}^2=${variance}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS231DeleteEqualHighValuesParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = ['數學成績', '英文成績', '物理成績', '練習測驗分數'];

    for (let i = 0; i < count; i += 1) {
      const n = 10;
      const mean = [50, 60, 70, 80][randInt(0, 3)];
      const sigma = [4, 8, 12][randInt(0, 2)];
      const removed = mean + sigma;
      const newMean = mean - sigma / 4;
      const sdCoeff = sigma / 4;
      const sdText = sdCoeff === 1 ? '\\sqrt{15}' : `${sdCoeff}\\sqrt{15}`;
      const context = contexts[i % contexts.length];
      questions.push(
        `已知 ${n} 筆${context}的算術平均數為 ${mean}，母體標準差為 ${sigma}。若將其中兩筆資料 ${removed}、${removed} 刪除，求剩下 8 筆資料的算術平均數與母體標準差。`
      );
      answers.push(
        `簡答：平均數 \\(${newMean}\\)，標準差 \\(${sdText}\\)。過程：原總和為 \\(10\\cdot${mean}=${10 * mean}\\)，原平方和為 \\(10(${sigma}^2+${mean}^2)=${10 * (sigma * sigma + mean * mean)}\\)。刪除兩筆 ${removed} 後，剩餘總和為 \\(${10 * mean - 2 * removed}\\)，平均為 \\(${newMean}\\)。剩餘平方和為 \\(${10 * (sigma * sigma + mean * mean)}-2\\cdot${removed}^2=${10 * (sigma * sigma + mean * mean) - 2 * removed * removed}\\)，變異數為 \\(\\frac{${10 * (sigma * sigma + mean * mean) - 2 * removed * removed}}{8}-${newMean}^2=${15 * sdCoeff * sdCoeff}\\)，所以標準差為 \\(${sdText}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS232SignedLinearCorrelationParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const rOptions = [
      { label: '\\frac{1}{5}', value: [1, 5] },
      { label: '\\frac{2}{5}', value: [2, 5] },
      { label: '\\frac{3}{5}', value: [3, 5] },
      { label: '\\frac{4}{5}', value: [4, 5] },
      { label: '\\frac{3}{4}', value: [3, 4] },
    ];

    function linearText(variable, coef, shift) {
      const sign = shift >= 0 ? '+' : '-';
      const coefficient = coef === 1 ? '' : coef === -1 ? '-' : `${coef}`;
      return `${coefficient}${variable}${shift === 0 ? '' : `${sign}${Math.abs(shift)}`}`;
    }

    for (let i = 0; i < count; i += 1) {
      const r = rOptions[randInt(0, rOptions.length - 1)];
      const baseNegative = i % 3 === 0;
      const rNum = baseNegative ? -r.value[0] : r.value[0];
      const rDen = r.value[1];
      const a = pickNonZero(-5, 5);
      const c = pickNonZero(-5, 5);
      const b = randInt(-10, 10);
      const d = randInt(-10, 10);
      const sign = a * c > 0 ? 1 : -1;
      const result = simplifyFraction(sign * rNum, rDen);
      const rLabel = `${baseNegative ? '-' : ''}${r.label}`;
      questions.push(
        `已知 \\(x\\) 與 \\(y\\) 的相關係數為 \\(${rLabel}\\)。令 \\(z=${linearText('x', a, b)}\\)，\\(w=${linearText('y', c, d)}\\)，求 \\(z\\) 與 \\(w\\) 的相關係數。`
      );
      answers.push(
        `簡答：\\(${formatFraction(result.num, result.den)}\\)。過程：平移不影響相關係數；乘上正數不改變符號，乘上負數會改變符號。此題 \\(z\\) 的倍數係數為 ${a}，\\(w\\) 的倍數係數為 ${c}，兩者乘積${a * c > 0 ? '為正' : '為負'}，所以新相關係數為 \\(${formatFraction(result.num, result.den)}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS232PerfectLineCorrelationParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = ['成績資料', '身高體重資料', '投資與收益資料', '實驗數據'];

    for (let i = 0; i < count; i += 1) {
      const slope = pickNonZero(-5, 5);
      const intercept = randInt(-20, 20);
      const xStart = randInt(1, 6);
      const xs = [xStart, xStart + 1, xStart + 2, xStart + 3, xStart + 4];
      const points = xs.map((x) => `\\((${x},${slope * x + intercept})\\)`).join('、');
      const lineText = s23LineEquationText(slope, intercept);
      const result = slope > 0 ? 1 : -1;
      const trend = slope > 0 ? '正斜率' : '負斜率';
      const context = contexts[i % contexts.length];
      questions.push(
        `某組${context}的五個散布點為 ${points}，且它們全部落在直線 \\(${lineText}\\) 上。求這兩變數的相關係數 \\(r\\)。`
      );
      answers.push(
        `簡答：\\(r=${result}\\)。過程：所有點都落在同一條非水平、非鉛直直線上，所以是完全線性相關；此直線為${trend}，因此相關係數為 \\(${result}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS232RegressionLinePredictionParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = [
      { x: '投入廣告費（萬元）', y: '營業額（萬元）' },
      { x: '練習題數（十題）', y: '測驗分數' },
      { x: '產量（千件）', y: '單位成本（元）' },
      { x: '年齡（歲）', y: '收縮壓' },
    ];

    for (let i = 0; i < count; i += 1) {
      const context = contexts[i % contexts.length];
      const slope = pickNonZero(-5, 5);
      const x0 = randInt(5, 30);
      const intercept = slope < 0 ? randInt(Math.abs(slope) * x0 + 10, Math.abs(slope) * x0 + 80) : randInt(20, 120);
      const predicted = intercept + slope * x0;
      const signText = slope > 0 ? '增加' : '減少';
      const lineText = s23LineEquationText(slope, intercept);
      questions.push(
        `已知「${context.y}」對「${context.x}」的迴歸直線為 \\(${lineText}\\)。當 \\(x=${x0}\\) 時，預測 \\(y\\) 為多少？並說明 \\(x\\) 每增加 1 單位時，預測的 \\(y\\) 如何變化。`
      );
      answers.push(
        `簡答：\\(y=${predicted}\\)；每增加 1 單位，預測 \\(y\\) ${signText} ${Math.abs(slope)}。過程：代入 \\(x=${x0}\\)，得 \\(y=${intercept}${slope >= 0 ? '+' : '-'}${Math.abs(slope)}\\cdot${x0}=${predicted}\\)。迴歸線斜率為 ${slope}，表示 \\(x\\) 增加 1 單位時，預測值改變 ${slope}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS232StandardizedRegressionParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const rOptions = [
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [-1, 2],
      [-3, 4],
      [-4, 5],
    ];

    for (let i = 0; i < count; i += 1) {
      const [rNum, rDen] = rOptions[randInt(0, rOptions.length - 1)];
      const muX = [50, 60, 70, 80][randInt(0, 3)];
      const muY = [55, 65, 75, 85][randInt(0, 3)];
      const sigmaX = [5, 8, 10, 12][randInt(0, 3)];
      const sigmaY = [4, 6, 8, 10][randInt(0, 3)];
      const rText = formatFraction(rNum, rDen);
      questions.push(
        `已知兩變數 \\(X,Y\\) 的 \\(\\mu_X=${muX}\\)、\\(\\mu_Y=${muY}\\)、\\(\\sigma_X=${sigmaX}\\)、\\(\\sigma_Y=${sigmaY}\\)，相關係數 \\(r=${rText}\\)。若將資料標準化為 \\(X'=\\frac{X-\\mu_X}{\\sigma_X}\\)、\\(Y'=\\frac{Y-\\mu_Y}{\\sigma_Y}\\)，求 \\(Y'\\) 對 \\(X'\\) 的迴歸直線。`
      );
      answers.push(
        `簡答：\\(Y'=${rText}X'\\)。過程：標準化後 \\(\\mu_{X'}=\\mu_{Y'}=0\\)，且 \\(\\sigma_{X'}=\\sigma_{Y'}=1\\)。迴歸線必通過 \\((0,0)\\)，斜率為 \\(r\\frac{\\sigma_{Y'}}{\\sigma_{X'}}=${rText}\\)，所以 \\(Y'=${rText}X'\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS232RegressionCorrelationFromLineParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const rOptions = [
      [1, 2],
      [2, 3],
      [3, 4],
      [3, 5],
      [-1, 2],
      [-2, 3],
      [-3, 5],
    ];

    for (let i = 0; i < count; i += 1) {
      const [rNum, rDen] = rOptions[randInt(0, rOptions.length - 1)];
      const sigmaX = [4, 5, 6, 8, 10][randInt(0, 4)];
      const sigmaYBase = [6, 8, 10, 12, 15][randInt(0, 4)];
      const sigmaY = sigmaYBase % rDen === 0 ? sigmaYBase : sigmaYBase + (rDen - (sigmaYBase % rDen));
      const muX = [20, 30, 40, 50, 60][randInt(0, 4)];
      const muY = [30, 40, 50, 60, 70][randInt(0, 4)];
      const step = [1, 2, 3][randInt(0, 2)];
      const x0 = muX + step * sigmaX;
      const y0 = muY + (step * rNum * sigmaY) / rDen;
      const slope = simplifyFraction(rNum * sigmaY, rDen * sigmaX);
      const r = simplifyFraction(slope.num * sigmaX, slope.den * sigmaY);
      questions.push(
        `已知一組二維資料的 \\(\\mu_x=${muX}\\)、\\(\\mu_y=${muY}\\)、\\(\\sigma_x=${sigmaX}\\)、\\(\\sigma_y=${sigmaY}\\)。若 \\(y\\) 對 \\(x\\) 的最適直線通過點 \\((${muX},${muY})\\) 與 \\((${x0},${y0})\\)，求相關係數 \\(r\\)。`
      );
      answers.push(
        `簡答：\\(${formatFraction(r.num, r.den)}\\)。過程：最適直線斜率為 \\(b=\\frac{${y0}-${muY}}{${x0}-${muX}}=${formatFraction(slope.num, slope.den)}\\)。又 \\(b=r\\frac{\\sigma_y}{\\sigma_x}\\)，所以 \\(r=b\\frac{\\sigma_x}{\\sigma_y}=${formatFraction(slope.num, slope.den)}\\cdot\\frac{${sigmaX}}{${sigmaY}}=${formatFraction(r.num, r.den)}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildS231CoreStatsFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS231BasicUngroupedSet,
        buildS231LinearTransformSet,
        buildS231WeightedMeanSet,
        buildS231ZScoreSet,
        buildS231BinaryDataSet,
      ],
      count
    );
  }

  function buildS231RevisionMergeFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS231MergeLossSet,
        buildS231DataRevisionSet,
        buildS231GroupMergingSet,
        buildS231AlgebraVarianceSet,
        buildS231GeometricGrowthSet,
      ],
      count
    );
  }

  function buildS231DistributionInterpretationFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS231DeviationMinimizationSet,
        buildS231PercentileOutlierSet,
        buildS231SamplingMethodsSet,
        buildS231CumulativeFrequencySet,
        buildS231GroupedEstimationSet,
      ],
      count
    );
  }

  function buildS231BasicUngroupedSubtypeSet(count) {
    return buildS231BasicUngroupedSet(count);
  }

  function buildS231LinearTransformSubtypeSet(count) {
    return buildS231LinearTransformSet(count);
  }

  function buildS231WeightedMeanSubtypeSet(count) {
    return buildS231WeightedMeanSet(count);
  }

  function buildS231ZScoreSubtypeSet(count) {
    return buildS231ZScoreSet(count);
  }

  function buildS231BinaryDataSubtypeSet(count) {
    return buildS231BinaryDataSet(count);
  }

  function buildS231MergeLossSubtypeSet(count) {
    return buildS231MergeLossSet(count);
  }

  function buildS231DataRevisionSubtypeSet(count) {
    return buildS231DataRevisionSet(count);
  }

  function buildS231GroupMergingSubtypeSet(count) {
    return buildS231GroupMergingSet(count);
  }

  function buildS231AlgebraVarianceSubtypeSet(count) {
    return buildS231AlgebraVarianceSet(count);
  }

  function buildS231GeometricGrowthSubtypeSet(count) {
    return buildS231GeometricGrowthSet(count);
  }

  function buildS231DeviationMinimizationSubtypeSet(count) {
    return buildS231DeviationMinimizationSet(count);
  }

  function buildS231PercentileOutlierSubtypeSet(count) {
    return buildS231PercentileOutlierSet(count);
  }

  function buildS231SamplingMethodsSubtypeSet(count) {
    return buildS231SamplingMethodsSet(count);
  }

  function buildS231CumulativeFrequencySubtypeSet(count) {
    return buildS231CumulativeFrequencySet(count);
  }

  function buildS231GroupedEstimationSubtypeSet(count) {
    return buildS231GroupedEstimationSet(count);
  }

  function buildS232CorrelationBasicSet(count) {
    return buildS223DynamicSet(
      [
        () => {
          // 基底資料 (1,2),(2,4),(3,3),(4,5),(5,6)：Sxx=10, Syy=10, Sxy=9。
          // 平移不改變離差；y 翻轉會使 r 變號。
          const dx = randInt(0, 3);
          const dy = randInt(0, 5);
          const flip = randInt(0, 1) === 1;
          const baseY = [2, 4, 3, 5, 6];
          const ys = baseY.map((v) => (flip ? 8 - v : v) + dy);
          const xs = [1, 2, 3, 4, 5].map((v) => v + dx);
          const pts = xs.map((x, idx) => `(${x},${ys[idx]})`).join(',');
          const xbar = 3 + dx;
          const ybar = (flip ? 4 : 4) + dy;
          const rText = flip ? '-\\frac{9}{10}' : '\\frac{9}{10}';
          const sxyText = flip ? '-9' : '9';
          return {
            q: `給定 5 筆數據 \\((x,y):${pts}\\)，求其相關係數 \\(r\\)。`,
            a: `簡答：\\(r=${rText}\\)。過程：\\(\\bar x=${xbar},\\bar y=${ybar}\\)。計算得 \\(S_{xx}=10\\)、\\(S_{yy}=10\\)、\\(S_{xy}=${sxyText}\\)，所以 \\(r=\\frac{S_{xy}}{\\sqrt{S_{xx}S_{yy}}}=${rText}\\)。`,
          };
        },
        () => {
          const combo = s242Pick([
            { sxx: 2250, syy: 810, sxy: 1080, rText: '\\frac45' },
            { sxx: 400, syy: 900, sxy: 360, rText: '\\frac35' },
            { sxx: 1600, syy: 2500, sxy: 1200, rText: '\\frac35' },
            { sxx: 900, syy: 1600, sxy: 840, rText: '\\frac7{10}' },
            { sxx: 100, syy: 400, sxy: 180, rText: '\\frac9{10}' },
          ]);
          const n = 10;
          const xbar = 5 * randInt(10, 25);
          const ybar = 5 * randInt(8, 20);
          const sx = n * xbar;
          const sy = n * ybar;
          const sx2 = combo.sxx + (sx * sx) / n;
          const sy2 = combo.syy + (sy * sy) / n;
          const sxy2 = combo.sxy + (sx * sy) / n;
          return {
            q: `已知 \\(\\sum x_i=${sx},\\sum y_i=${sy},\\sum x_i^2=${sx2},\\sum y_i^2=${sy2},\\sum x_iy_i=${sxy2}\\)，樣本數 \\(n=${n}\\)，求相關係數 \\(r\\)。`,
            a: `簡答：\\(r=${combo.rText}\\)。過程：\\(S_{xx}=${sx2}-\\frac{${sx}^2}{${n}}=${combo.sxx}\\)，\\(S_{yy}=${sy2}-\\frac{${sy}^2}{${n}}=${combo.syy}\\)，\\(S_{xy}=${sxy2}-\\frac{${sx}\\cdot${sy}}{${n}}=${combo.sxy}\\)。所以 \\(r=\\frac{${combo.sxy}}{\\sqrt{${combo.sxx}\\cdot${combo.syy}}}=${combo.rText}\\)。`,
          };
        },
        () => {
          const combo = s242Pick([
            { sxx: 100, syy: 1600, sxy: 290, prod: 400, rText: '\\frac{29}{40}' },
            { sxx: 400, syy: 900, sxy: 480, prod: 600, rText: '\\frac45' },
            { sxx: 25, syy: 64, sxy: 30, prod: 40, rText: '\\frac34' },
            { sxx: 49, syy: 100, sxy: 49, prod: 70, rText: '\\frac7{10}' },
            { sxx: 225, syy: 400, sxy: -240, prod: 300, rText: '-\\frac45' },
          ]);
          return {
            q: `設 5 筆數據的離差平方和 \\(S_{xx}=${combo.sxx}\\)、\\(S_{yy}=${combo.syy}\\)，乘積和 \\(S_{xy}=${combo.sxy}\\)，求其相關係數。`,
            a: `簡答：\\(r=${combo.rText}\\)。過程：\\(r=\\frac{S_{xy}}{\\sqrt{S_{xx}S_{yy}}}=\\frac{${combo.sxy}}{\\sqrt{${combo.sxx}\\cdot${combo.syy}}}=\\frac{${combo.sxy}}{${combo.prod}}=${combo.rText}\\)。`,
          };
        },
        () => {
          const combo = s242Pick([
            { n: 10, sum: '7.5', rText: '\\frac34' },
            { n: 10, sum: '8', rText: '\\frac45' },
            { n: 20, sum: '12', rText: '\\frac35' },
            { n: 20, sum: '18', rText: '\\frac9{10}' },
            { n: 10, sum: '-6', rText: '-\\frac35' },
          ]);
          return {
            q: `若數據已標準化為 Z 分數 \\((x_i^{\\prime},y_i^{\\prime})\\)，且 \\(\\sum x_i^{\\prime}y_i^{\\prime}=${combo.sum}\\)、\\(n=${combo.n}\\)，求相關係數 \\(r\\)。`,
            a: `簡答：\\(r=${combo.rText}\\)。過程：標準化後 \\(r=\\frac1n\\sum x_i^{\\prime}y_i^{\\prime}\\)，所以 \\(r=\\frac{${combo.sum}}{${combo.n}}=${combo.rText}\\)。`,
          };
        },
        () => {
          const m = s242Pick([-3, -2, -1, 2, 3]);
          const c = randInt(1, 10);
          const rAns = m < 0 ? '-1' : '1';
          const mText = m === 1 ? '' : m === -1 ? '-' : String(m);
          return {
            q: `從 1 到 5 的整數對 \\((x,y)\\) 中，滿足 \\(y=${mText}x+${c}\\)。直接判定其相關係數。`,
            a: `簡答：\\(r=${rAns}\\)。過程：所有資料點都落在斜率為${m < 0 ? '負' : '正'}的同一直線上，且不是水平線或垂直線，因此完全${m < 0 ? '負' : '正'}相關，\\(r=${rAns}\\)。`,
          };
        },
      ],
      count
    );
  }

  function buildS232ScatterJudgmentSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const n = s242Pick(['四', '五', '六']);
            return `給定${n}個散布圖，若要依相關係數 \\(|r|\\) 的大小排序，應優先觀察什麼特徵？`;
          },
          a: '簡答：觀察點群貼近直線的程度。過程：\\(|r|\\) 衡量線性相關強度，點越貼近某條直線，\\(|r|\\) 越大；斜率正負只影響 \\(r\\) 的正負，不影響 \\(|r|\\) 大小。',
        },
        {
          q: '在 5 筆數據的散布圖中，若移除一筆遠離整體趨勢的離群點，剩餘資料的相關係數絕對值通常會如何改變？',
          a: '簡答：通常變大。過程：離群點若偏離原本線性趨勢，會拉低線性貼合程度；移除後點群較貼近直線，因此 \\(|r|\\) 通常變大。',
        },
        {
          q: '判斷下列何者屬於零相關但不是沒有關係：(A) 圓形分布 (B) 對稱於軸的拋物線 (C) 水平直線。',
          a: '簡答：(A)、(B)。過程：圓形分布與對稱拋物線可能有明顯非線性關係，但線性相關係數接近 0；水平直線則 \\(y\\) 無變異，相關係數通常不適用。',
        },
        {
          get q() {
            const up = randInt(0, 1) === 0;
            this._up = up;
            return `從散布圖觀察點群大致由${up ? '左下往右上' : '左上往右下'}，判斷 \\(x,y\\) 之間是正相關、負相關還是零相關。`;
          },
          get a() {
            const up = this._up !== undefined ? this._up : true;
            return up
              ? '簡答：正相關。過程：由左下往右上表示 \\(x\\) 增加時 \\(y\\) 也大致增加，所以相關係數為正。'
              : '簡答：負相關。過程：由左上往右下表示 \\(x\\) 增加時 \\(y\\) 大致減少，所以相關係數為負。';
          },
        },
        {
          get q() {
            const a = randInt(1, 5);
            const bAbs = randInt(1, 4);
            const neg = randInt(0, 1) === 0;
            const c = randInt(1, 9);
            this._d = { a, bAbs, neg, c };
            return neg
              ? `若所有散布點皆落在直線 \\(${a}x+${bAbs}y=${c}\\) 上，且 \\(x\\) 值不全相同，求其相關係數。`
              : `若所有散布點皆落在直線 \\(${a}x-${bAbs}y=${c}\\) 上，且 \\(x\\) 值不全相同，求其相關係數。`;
          },
          get a() {
            const d = this._d || { a: 3, bAbs: 2, neg: true, c: 5 };
            return d.neg
              ? `簡答：\\(r=-1\\)。過程：直線可寫為 \\(y=-\\frac{${d.a}}{${d.bAbs}}x+\\frac{${d.c}}{${d.bAbs}}\\)，斜率為負且所有點完全共線，因此完全負相關，\\(r=-1\\)。`
              : `簡答：\\(r=1\\)。過程：直線可寫為 \\(y=\\frac{${d.a}}{${d.bAbs}}x-\\frac{${d.c}}{${d.bAbs}}\\)，斜率為正且所有點完全共線，因此完全正相關，\\(r=1\\)。`;
          },
        },
      ],
      count
    );
  }

  function buildS232CorrelationSensitivitySet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const dx = randInt(0, 4);
            const dy = randInt(0, 5);
            this._o = [3 + dx, 10 + dy];
            const pts = [
              [1 + dx, 3 + dy],
              [2 + dx, 4 + dy],
              [4 + dx, 5 + dy],
              [3 + dx, 10 + dy],
              [10 + dx, 12 + dy],
            ]
              .map((p) => `(${p[0]},${p[1]})`)
              .join(',');
            return `給定 5 筆數據 \\(${pts}\\)。若去掉一點後希望剩下 4 筆資料的相關係數絕對值最大，應去掉哪一點？`;
          },
          get a() {
            const o = this._o || [3, 10];
            return `簡答：去掉 \\((${o[0]},${o[1]})\\)。過程：\\((${o[0]},${o[1]})\\) 明顯偏離其餘點的上升趨勢。移除後剩餘點較貼近上升直線，\\(|r|\\) 最大。`;
          },
        },
        {
          q: '在散布圖中，若某一點恰好落在原始數據的迴歸線上，移除該點後相關係數 \\(r\\) 的絕對值會如何變化？',
          a: '簡答：不一定。過程：該點在迴歸線上代表殘差為 0，但相關係數還受該點離平均點的遠近影響；移除後 \\(S_{xx},S_{yy},S_{xy}\\) 都會改變，因此 \\(|r|\\) 不一定變大或變小。',
        },
        {
          get q() {
            const r = s242Pick(['0.9', '0.95', '0.99', '-0.95']);
            this._r = r;
            return `若一組數據的 \\(r=${r}\\)，現加入一個極端離群值且遠離原趨勢線，判斷新相關係數的變化趨勢。`;
          },
          get a() {
            const r = this._r || '0.99';
            return `簡答：\\(|r|\\) 通常會變小。過程：原本 \\(r=${r}\\) 表示高度線性；加入遠離趨勢線的離群值會增加殘差、降低線性貼合程度，所以相關係數絕對值通常下降。`;
          },
        },
        {
          get q() {
            const s = 2 * randInt(1, 4);
            this._s = s;
            return `設 4 筆資料剛好構成邊長為 ${s} 的正方形四個頂點，若在正方形中心增加第 5 個點，其相關係數如何改變？`;
          },
          a: '簡答：仍為 0。過程：正方形四頂點關於中心對稱，\\(S_{xy}=0\\)。加入中心點後，該點對離差乘積沒有貢獻，仍保持 \\(S_{xy}=0\\)，因此 \\(r=0\\)。',
        },
        {
          q: '觀察散布圖，若所有點原本呈圓形分布（零相關），移除第一象限的點後，相關係數可能變成正或負？',
          a: '簡答：可能變成負相關。過程：圓形分布原本上下左右對稱，線性相關約為 0。移除第一象限點後，剩餘點的乘積離差平衡被破壞，可能使 \\(S_{xy}\\) 偏負，形成負相關。',
        },
      ],
      count
    );
  }

  function buildS232LinearTransformCorrelationSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const r = s242Pick(['0.5', '0.6', '0.7', '0.8', '0.9']);
            const a = randInt(2, 5);
            const b = randInt(2, 5);
            const e = randInt(1, 9);
            const f = randInt(1, 9);
            this._r = r;
            return `若 \\(x,y\\) 的相關係數為 ${r}，求 \\(z=${a}x+${e}\\) 與 \\(w=${b}y-${f}\\) 的相關係數。`;
          },
          get a() {
            const r = this._r || '0.8';
            return `簡答：${r}。過程：兩個變數都乘以正數再平移，不改變相關係數，所以 \\(r_{zw}=r_{xy}=${r}\\)。`;
          },
        },
        {
          get q() {
            const r = s242Pick(['0.4', '0.5', '0.6', '0.7', '0.8']);
            const b = randInt(2, 4);
            const s = randInt(1, 5);
            const t = randInt(1, 5);
            this._r = r;
            return `已知 \\(r(x,y)=${r}\\)，求 \\(r(-x+${s},${b}y+${t})\\) 之值。`;
          },
          get a() {
            const r = this._r || '0.6';
            return `簡答：\\(-${r}\\)。過程：平移不影響相關係數；乘以負數會改變符號，乘以正數不改變符號，所以新相關係數為 \\(-${r}\\)。`;
          },
        },
        {
          get q() {
            const combo = s242Pick([
              { b0: '0.4', kx: 2, ky: 3, ans: '\\frac35', calc: '\\frac32\\cdot0.4=0.6=\\frac35' },
              { b0: '0.5', kx: 2, ky: 3, ans: '\\frac34', calc: '\\frac32\\cdot0.5=0.75=\\frac34' },
              { b0: '0.6', kx: 3, ky: 2, ans: '\\frac25', calc: '\\frac23\\cdot0.6=0.4=\\frac25' },
              { b0: '0.8', kx: 4, ky: 3, ans: '\\frac35', calc: '\\frac34\\cdot0.8=0.6=\\frac35' },
              { b0: '0.9', kx: 3, ky: 2, ans: '\\frac35', calc: '\\frac23\\cdot0.9=0.6=\\frac35' },
            ]);
            this._c = combo;
            return `設 \\(y\\) 對 \\(x\\) 的迴歸線斜率為 ${combo.b0}。若將所有 \\(x\\) 乘以 ${combo.kx}、所有 \\(y\\) 乘以 ${combo.ky}，求新數據的迴歸線斜率。`;
          },
          get a() {
            const c = this._c || { b0: '0.4', kx: 2, ky: 3, ans: '\\frac35', calc: '\\frac32\\cdot0.4=0.6=\\frac35' };
            return `簡答：\\(${c.ans}\\)。過程：令 \\(X=${c.kx}x,Y=${c.ky}y\\)。新斜率為 \\(\\frac{${c.ky}}{${c.kx}}\\) 倍原斜率，所以為 \\(${c.calc}\\)。`;
          },
        },
        {
          get q() {
            const scale = s242Pick(['1.5', '1.2', '2', '0.8']);
            const shift = randInt(5, 20);
            this._s = scale;
            return `某班成績調整，新分數 \\(y=${scale}x-${shift}\\)。若原始分數與另一科 \\(z\\) 的相關係數為 \\(r\\)，求調整後分數 \\(y\\) 與 \\(z\\) 的相關係數。`;
          },
          get a() {
            const s = this._s || '1.5';
            return `簡答：\\(r\\)。過程：\\(y=${s}x-\\text{常數}\\) 是對 \\(x\\) 做正倍數線性變換，相關係數不變，因此 \\(r(y,z)=r(x,z)=r\\)。`;
          },
        },
        {
          q: '說明當 \\(x,y\\) 均標準化後，其迴歸直線必為 \\(y^{\\prime}=rx^{\\prime}\\)。',
          a: '簡答：成立。過程：標準化後 \\(\\mu_{x^{\\prime}}=\\mu_{y^{\\prime}}=0\\)，且 \\(\\sigma_{x^{\\prime}}=\\sigma_{y^{\\prime}}=1\\)。迴歸斜率為 \\(r\\frac{\\sigma_y}{\\sigma_x}=r\\)，又直線通過 \\((0,0)\\)，故為 \\(y^{\\prime}=rx^{\\prime}\\)。',
        },
      ],
      count
    );
  }

  function buildS232RegressionConsistencySet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const pair = s242Pick([
              ['m_1', 'm_2'],
              ['b_1', 'b_2'],
              ['k_1', 'k_2'],
            ]);
            this._p = pair;
            return `已知 \\(y\\) 對 \\(x\\) 的迴歸線斜率為 \\(${pair[0]}\\)，\\(x\\) 對 \\(y\\) 的迴歸線斜率為 \\(${pair[1]}\\)，說明 \\(${pair[0]}${pair[1]}=r^2\\)。`;
          },
          get a() {
            const p = this._p || ['m_1', 'm_2'];
            return `簡答：\\(${p[0]}${p[1]}=r^2\\)。過程：\\(${p[0]}=r\\frac{\\sigma_y}{\\sigma_x}\\)，\\(${p[1]}=r\\frac{\\sigma_x}{\\sigma_y}\\)，相乘得 \\(${p[0]}${p[1]}=r^2\\)。`;
          },
        },
        {
          get q() {
            const pos = randInt(0, 1) === 0;
            this._pos = pos;
            return `若 \\(y\\) 對 \\(x\\) 的迴歸線斜率為${pos ? '正' : '負'}，判斷 \\(x\\) 與 \\(y\\) 是否為${pos ? '正' : '負'}相關。`;
          },
          get a() {
            const pos = this._pos !== undefined ? this._pos : true;
            return `簡答：是。過程：迴歸斜率 \\(b=r\\frac{\\sigma_y}{\\sigma_x}\\)。標準差皆為正，所以斜率${pos ? '正' : '負'}代表 \\(r${pos ? '>' : '<'}0\\)，即${pos ? '正' : '負'}相關。`;
          },
        },
        {
          q: '給定兩組數據的平均數與標準差，且已知相關係數 \\(r\\)，計算迴歸直線時是否一定通過平均點？',
          a: '簡答：一定通過 \\((\\mu_x,\mu_y)\\)。過程：迴歸線形式為 \\(y-\mu_y=r\\frac{\\sigma_y}{\\sigma_x}(x-\mu_x)\\)，代入 \\((\\mu_x,\mu_y)\\) 必成立。',
        },
        {
          q: '兩組數據的散布情形不同，但各自計算出的迴歸直線相同。兩組的相關係數是否可能不同？',
          a: '簡答：可能不同。過程：迴歸直線只固定平均點與斜率；相關係數還受 \\(\\sigma_x,\\sigma_y\\) 與點群貼近直線程度影響，因此同一直線仍可能有不同 \\(r\\)。',
        },
        {
          get q() {
            const less = randInt(0, 1) === 0;
            this._less = less;
            return less
              ? '在迴歸直線 \\(y=a+bx\\) 中，已知 \\(b=r\\frac{\\sigma_y}{\\sigma_x}\\)。若 \\(\\sigma_x<\\sigma_y\\)，判斷 \\(|b|\\) 是否必大於 \\(|r|\\)。'
              : '在迴歸直線 \\(y=a+bx\\) 中，已知 \\(b=r\\frac{\\sigma_y}{\\sigma_x}\\)。若 \\(\\sigma_x>\\sigma_y\\)，判斷 \\(|b|\\) 是否必小於 \\(|r|\\)。';
          },
          get a() {
            const less = this._less !== undefined ? this._less : true;
            return less
              ? '簡答：不一定；當 \\(r\\ne0\\) 時才會大於。過程：\\(|b|=|r|\\frac{\\sigma_y}{\\sigma_x}\\)。因 \\(\\sigma_y>\\sigma_x\\)，若 \\(|r|>0\\)，則 \\(|b|>|r|\\)；但若 \\(r=0\\)，則 \\(|b|=|r|=0\\)，所以不能說必大於。'
              : '簡答：不一定；當 \\(r\\ne0\\) 時才會小於。過程：\\(|b|=|r|\\frac{\\sigma_y}{\\sigma_x}\\)。因 \\(\\sigma_y<\\sigma_x\\)，若 \\(|r|>0\\)，則 \\(|b|<|r|\\)；但若 \\(r=0\\)，則 \\(|b|=|r|=0\\)，所以不能說必小於。';
          },
        },
      ],
      count
    );
  }

  function buildS232RegressionLineSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // r values as fractions [num, den]
    const rFracs = [
      [1, 2],
      [2, 3],
      [3, 4],
      [3, 5],
      [4, 5],
      [-1, 2],
      [-2, 3],
      [-3, 4],
    ];
    const muXOpts = [40, 50, 60, 70, 80];
    const muYOpts = [50, 60, 70, 75, 80];
    const sigXOpts = [5, 8, 10, 12];
    const sigYOpts = [4, 6, 8, 10];
    for (let i = 0; i < count; i++) {
      const mode = i % 3;
      const rFrac = rFracs[randInt(0, rFracs.length - 1)];
      const rNum = rFrac[0],
        rDen = rFrac[1];
      const muX = muXOpts[randInt(0, muXOpts.length - 1)];
      const muY = muYOpts[randInt(0, muYOpts.length - 1)];
      const sigX = sigXOpts[randInt(0, sigXOpts.length - 1)];
      const sigY = sigYOpts[randInt(0, sigYOpts.length - 1)];
      // slope b = r * sigY / sigX (as fraction: rNum*sigY / rDen*sigX)
      const bNum = rNum * sigY;
      const bDen = rDen * sigX;
      const gcd = (a, b) => (b ? gcd(b, a % b) : a);
      const g = gcd(Math.abs(bNum), bDen);
      const bNs = bNum / g,
        bDs = bDen / g;
      const bStr = bDs === 1 ? String(bNs) : `\\dfrac{${bNs}}{${bDs}}`;
      const rStr = rDen === 1 ? String(rNum) : `\\dfrac{${rNum}}{${rDen}}`;
      if (mode === 0) {
        // Write equation + predict for x0
        const xStep = sigX * [1, 2, 3][randInt(0, 2)];
        const x0 = muX + xStep;
        // y0 = muY + bNs / bDs * xStep
        const y0Num = muY * bDs + bNs * xStep;
        const y0 = y0Num / bDs;
        const isClean = Number.isInteger(y0);
        const y0G = gcd(Math.abs(y0Num), bDs);
        const y0Str = isClean ? String(y0) : `\\dfrac{${y0Num / y0G}}{${bDs / y0G}}`;
        const pointSlopeText = s23PointSlopeEquationText(bStr, muX, muY);
        questions.push(
          `已知 \\(\\mu_x = ${muX}\\)，\\(\\mu_y = ${muY}\\)，` +
            `\\(\\sigma_x = ${sigX}\\)，\\(\\sigma_y = ${sigY}\\)，相關係數 \\(r = ${rStr}\\)。` +
            `求 \\(y\\) 對 \\(x\\) 的迴歸直線方程式，並預測 \\(x = ${x0}\\) 時 \\(y\\) 的值。`
        );
        answers.push(
          `簡答：迴歸線為 \\(${pointSlopeText}\\)，預測值 \\(y = ${y0Str}\\)。` +
            `過程：斜率 \\(b = r \\cdot \\dfrac{\\sigma_y}{\\sigma_x} = ${rStr} \\times \\dfrac{${sigY}}{${sigX}} = ${bStr}\\)。` +
            `迴歸線過均值點 \\((${muX}, ${muY})\\)，故方程式為 \\(${pointSlopeText}\\)。` +
            `代入 \\(x = ${x0}\\)：\\(y = ${muY} + ${bStr} \\times ${xStep} = ${y0Str}\\)。`
        );
      } else if (mode === 1) {
        // Given equation and muX → find muY
        // Use equation y = bStr * x + c where c = muY - bNs / bDs * muX
        const cNum = muY * bDs - bNs * muX;
        const cg = gcd(Math.abs(cNum), bDs);
        const cNs = cNum / cg,
          cDs = bDs / cg;
        const cAbsStr = cDs === 1 ? String(Math.abs(cNs)) : `\\dfrac{${Math.abs(cNs)}}{${cDs}}`;
        const cStr = cNs < 0 ? `-${cAbsStr}` : cAbsStr;
        const lineText = s23AppendSignedLatex(s23LatexCoeffVariableText(bStr, 'x'), cStr);
        const cProcess = s23AppendSignedLatex(`${bStr}\\times${muX}`, cStr);
        questions.push(`已知迴歸直線方程式為 \\(y=${lineText}\\)，且 \\(\\mu_x = ${muX}\\)，求 \\(\\mu_y\\)。`);
        answers.push(
          `簡答：\\(\\mu_y = ${muY}\\)。` +
            `過程：迴歸線必通過均值點 \\((\\mu_x, \\mu_y)\\)，代入 \\(x = ${muX}\\)：` +
            `\\(\\mu_y = ${cProcess} = ${muY}\\)。`
        );
      } else {
        // Given equation passes through mean + another point → find equation
        const xOther = muX - sigX;
        const yOtherNum = muY * bDs + bNs * -sigX;
        const yOther = yOtherNum / bDs;
        const isOtherClean = Number.isInteger(yOther);
        if (!isOtherClean) {
          // Fall back to mode 0 style
          questions.push(
            `已知 \\(\\mu_x = ${muX}\\)，\\(\\mu_y = ${muY}\\)，斜率 \\(b = ${bStr}\\)，寫出迴歸直線方程式。`
          );
          const pointSlopeText = s23PointSlopeEquationText(bStr, muX, muY);
          answers.push(
            `簡答：\\(${pointSlopeText}\\)。` +
              `過程：迴歸線斜率為 \\(${bStr}\\)，且必過均值點 \\((${muX}, ${muY})\\)。`
          );
        } else {
          questions.push(
            `某迴歸直線通過均值點 \\((${muX}, ${muY})\\) 及另一點 \\((${xOther}, ${yOther})\\)，求迴歸直線方程式。`
          );
          const pointSlopeText = s23PointSlopeEquationText(bStr, muX, muY);
          answers.push(
            `簡答：\\(${pointSlopeText}\\)。` +
              `過程：斜率 \\(= \\dfrac{${muY} - ${yOther}}{${muX} - ${xOther}} = \\dfrac{${muY - yOther}}{${muX - xOther}} = ${bStr}\\)。` +
              `通過均值點故方程式為 \\(${pointSlopeText}\\)。`
          );
        }
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS232ReciprocalSlopesSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // r as simple fractions [num, den], positive only (sign determined separately)
    const rFracs = [
      [1, 2],
      [2, 5],
      [3, 5],
      [3, 4],
      [4, 5],
    ];
    const sigXOpts = [4, 5, 8, 10];
    const sigYOpts = [2, 5, 8, 10];
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    for (let i = 0; i < count; i++) {
      const mode = i % 3;
      const rFrac = rFracs[randInt(0, rFracs.length - 1)];
      const rNum = rFrac[0],
        rDen = rFrac[1]; // |r| = rNum/rDen
      const sigX = sigXOpts[randInt(0, sigXOpts.length - 1)];
      const sigY = sigYOpts[randInt(0, sigYOpts.length - 1)];
      // b1 = r*sigY/sigX  →  b1 = rNum*sigY / rDen*sigX
      // b2 = r*sigX/sigY  →  b2 = rNum*sigX / rDen*sigY
      const b1Num = rNum * sigY,
        b1Den = rDen * sigX;
      const b2Num = rNum * sigX,
        b2Den = rDen * sigY;
      const g1 = gcd(b1Num, b1Den),
        g2 = gcd(b2Num, b2Den);
      const b1Ns = b1Num / g1,
        b1Ds = b1Den / g1;
      const b2Ns = b2Num / g2,
        b2Ds = b2Den / g2;
      const b1Str = b1Ds === 1 ? String(b1Ns) : `\\dfrac{${b1Ns}}{${b1Ds}}`;
      const b2Str = b2Ds === 1 ? String(b2Ns) : `\\dfrac{${b2Ns}}{${b2Ds}}`;
      const rStr = rDen === 1 ? String(rNum) : `\\dfrac{${rNum}}{${rDen}}`;
      const r2Num = rNum * rNum,
        r2Den = rDen * rDen;
      const gR2 = gcd(r2Num, r2Den);
      const r2Str = r2Den / gR2 === 1 ? String(r2Num / gR2) : `\\dfrac{${r2Num / gR2}}{${r2Den / gR2}}`;
      if (mode === 0) {
        // Given b1, b2 → find |r|
        questions.push(
          `已知 \\(y\\) 對 \\(x\\) 的迴歸線斜率為 \\(${b1Str}\\)，` +
            `\\(x\\) 對 \\(y\\) 的迴歸線斜率為 \\(${b2Str}\\)，` +
            `求相關係數 \\(r\\) 的絕對值。`
        );
        answers.push(
          `簡答：\\(|r| = ${rStr}\\)。` +
            `過程：兩迴歸線斜率之乘積等於 \\(r^2\\)，即 ` +
            `\\(r^2 = ${b1Str} \\times ${b2Str} = ${r2Str}\\)，` +
            `故 \\(|r| = ${rStr}\\)。`
        );
      } else if (mode === 1) {
        // Given r and b1 → find b2
        questions.push(
          `已知相關係數 \\(r = ${rStr}\\)，且 \\(y\\) 對 \\(x\\) 的迴歸線斜率為 \\(${b1Str}\\)，` +
            `求 \\(x\\) 對 \\(y\\) 的迴歸線斜率。`
        );
        answers.push(
          `簡答：\\(${b2Str}\\)。` +
            `過程：設斜率為 \\(m\\)，由 \\(m \\times ${b1Str} = r^2 = ${r2Str}\\)，` +
            `解得 \\(m = ${b2Str}\\)。`
        );
      } else {
        // Given r, sigX, sigY → find both slopes
        questions.push(
          `已知 \\(\\sigma_x = ${sigX}\\)，\\(\\sigma_y = ${sigY}\\)，相關係數 \\(r = ${rStr}\\)。` +
            `求 \\(y\\) 對 \\(x\\) 與 \\(x\\) 對 \\(y\\) 兩條迴歸線的斜率。`
        );
        answers.push(
          `簡答：\\(y\\) 對 \\(x\\) 斜率為 \\(${b1Str}\\)，\\(x\\) 對 \\(y\\) 斜率為 \\(${b2Str}\\)。` +
            `過程：\\(b_1 = r \\cdot \\dfrac{\\sigma_y}{\\sigma_x} = ${rStr} \\times \\dfrac{${sigY}}{${sigX}} = ${b1Str}\\)；` +
            `\\(b_2 = r \\cdot \\dfrac{\\sigma_x}{\\sigma_y} = ${rStr} \\times \\dfrac{${sigX}}{${sigY}} = ${b2Str}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS232MeanPointSet(count) {
    return buildS223DynamicSet(
      [
        () => {
          const m = randInt(2, 5);
          const c = randInt(1, 9);
          const mx = 5 * randInt(2, 8);
          const my = m * mx + c;
          return {
            q: `某組數據的迴歸線為 \\(y=${m}x+${c}\\)，已知 \\(\\mu_x=${mx}\\)，求 \\(\\mu_y\\)。`,
            a: `簡答：${my}。過程：迴歸線必通過平均點，所以 \\(\\mu_y=${m}\\cdot${mx}+${c}=${my}\\)。`,
          };
        },
        () => {
          const mx = 10 * randInt(4, 8);
          const my = 10 * randInt(4, 8);
          const dxs = s242Pick([10, 20]);
          const num = randInt(2, 9);
          const px = mx - dxs;
          const py = my - (num * dxs) / 10;
          if (!Number.isInteger(py)) {
            return {
              q: `已知 \\(\\mu_x=60,\\mu_y=70\\)，且迴歸線通過 \\((50,62)\\)，求該迴歸線方程式。`,
              a: `簡答：\\(y-70=\\frac{4}{5}(x-60)\\)。過程：迴歸線通過 \\((60,70)\\) 與 \\((50,62)\\)，斜率為 \\(\\frac{70-62}{60-50}=\\frac{4}{5}\\)，故方程式為 \\(y-70=\\frac{4}{5}(x-60)\\)。`,
            };
          }
          const slopeText = formatFraction(my - py, mx - px);
          return {
            q: `已知 \\(\\mu_x=${mx},\\mu_y=${my}\\)，且迴歸線通過 \\((${px},${py})\\)，求該迴歸線方程式。`,
            a: `簡答：\\(y-${my}=${slopeText}(x-${mx})\\)。過程：迴歸線通過 \\((${mx},${my})\\) 與 \\((${px},${py})\\)，斜率為 \\(\\frac{${my}-${py}}{${mx}-${px}}=${slopeText}\\)，故方程式為 \\(y-${my}=${slopeText}(x-${mx})\\)。`,
          };
        },
        () => {
          const x1 = randInt(1, 3);
          const x2 = x1 + 2;
          const a = 3 * randInt(3, 5) - x1 - x2;
          const mx = (x1 + x2 + a) / 3;
          const m = randInt(1, 3);
          const c = randInt(1, 4);
          const y1 = m * x1 + c + 1;
          const y2 = m * x2 + c - 1;
          const my = m * mx + c;
          const b = 3 * my - y1 - y2;
          const mTextLine = m === 1 ? 'x' : `${m}x`;
          return {
            q: `給定三筆數據 \\((${x1},${y1}),(${x2},${y2}),(a,b)\\)，若其迴歸線為 \\(y=${mTextLine}+${c}\\) 且 \\(\\mu_x=${mx}\\)，求數對 \\((a,b)\\)。`,
            a: `簡答：\\((${a},${b})\\)。過程：\\(\\mu_x=(${x1}+${x2}+a)/3=${mx}\\)，得 \\(a=${a}\\)。平均點在迴歸線上，所以 \\(\\mu_y=${m}\\cdot${mx}+${c}=${my}\\)。因此 \\((${y1}+${y2}+b)/3=${my}\\)，得 \\(b=${b}\\)。`,
          };
        },
        () => {
          const k = randInt(2, 4);
          const cross = 25 * randInt(1, 4);
          const c = (k + 1) * cross;
          return {
            q: `設 \\(y\\) 對 \\(x\\) 的迴歸線為 \\(y=-${k}x+${c}\\)。試問該直線與 \\(y=x\\) 的交點是否可能為平均點？`,
            a: `簡答：可能。過程：交點由 \\(x=-${k}x+${c}\\) 得 \\((${cross},${cross})\\)。只要資料的平均點為 \\((${cross},${cross})\\)，迴歸線就會通過它，因此該交點可能是平均點。`,
          };
        },
        () => {
          const mNum = s242Pick([1, 3]);
          const mx = 2 * randInt(2, 5);
          const c = randInt(1, 5);
          const my = (mNum * mx) / 2 + c;
          const mText = mNum === 1 ? '0.5' : '1.5';
          const slopeFrac = mNum === 1 ? '\\frac12' : '\\frac32';
          return {
            q: `若數據經過平移後新平均點為 \\((0,0)\\)，且原迴歸線為 \\(y=${mText}x+${c}\\)、\\(\\mu_x=${mx}\\)，求新迴歸線方程式。`,
            a: `簡答：\\(Y=${slopeFrac}X\\)。過程：原平均點在迴歸線上，故 \\(\\mu_y=${mText}\\cdot${mx}+${c}=${my}\\)。令 \\(X=x-${mx},Y=y-${my}\\)，代入原式得 \\(Y+${my}=${mText}(X+${mx})+${c}\\)，化簡為 \\(Y=${mText}X\\)。`,
          };
        },
      ],
      count
    );
  }

  function buildS232LeastSquaresSet(count) {
    return buildS223TemplateSet(
      [
        {
          get q() {
            const x1 = randInt(2, 4);
            const yMid = randInt(2, 4);
            const t = randInt(1, 2);
            this._d = { x1, yMid, t };
            return `給定數據 \\((${x1},${yMid - t}),(${x1 + 1},${yMid}),(${x1},${yMid + t})\\)，求實數 \\(a,b\\) 使 \\(D=\\sum_{i=1}^3(y_i-a-bx_i)^2\\) 最小。`;
          },
          get a() {
            const d = this._d || { x1: 2, yMid: 2, t: 1 };
            return `簡答：\\(a=${d.yMid},b=0\\)。過程：\\(\\bar x=\\frac{${3 * d.x1 + 1}}{3},\\bar y=${d.yMid}\\)。兩個 \\(x=${d.x1}\\) 的點其 \\(y\\) 對稱於 \\(\\bar y\\)，計算 \\(S_{xy}=0\\)，所以最小平方法斜率 \\(b=0\\)，截距 \\(a=\\bar y-b\\bar x=${d.yMid}\\)。`;
          },
        },
        {
          get q() {
            const b = randInt(2, 4);
            const a0 = randInt(-3, 2);
            const xs = [1, 2, 4, 5];
            const devs = [1, -1, -1, 1];
            const ys = xs.map((x, i) => a0 + b * x + devs[i]);
            this._d = { b, a0, xs, ys };
            const terms = xs.map((x, i) => `(a+${x === 1 ? '' : x}b-${ys[i]})^2`).join('+');
            return `設 \\(g(a,b)=${terms}\\)，求使 \\(g(a,b)\\) 產生最小值的數對 \\((a,b)\\)。`;
          },
          get a() {
            const d = this._d || { b: 2, a0: -1, xs: [1, 2, 4, 5], ys: [1, 3, 7, 9] };
            const xbar = 3;
            const ybar = (d.ys[0] + d.ys[1] + d.ys[2] + d.ys[3]) / 4;
            const pts = d.xs.map((x, i) => `(${x},${d.ys[i]})`).join(',');
            const sxy = d.xs.reduce((acc, x, i) => acc + (x - xbar) * (d.ys[i] - ybar), 0);
            return `簡答：\\((a,b)=(${d.a0},${d.b})\\)。過程：這等同用直線 \\(y=a+bx\\) 配適點 \\(${pts}\\)。由 \\(\\bar x=3,\\bar y=${ybar}\\)，\\(S_{xx}=10,S_{xy}=${sxy}\\)，得 \\(b=${d.b}\\)，\\(a=${ybar}-${d.b}\\cdot3=${d.a0}\\)。`;
          },
        },
        {
          get q() {
            const y1 = randInt(1, 4);
            const slope = randInt(1, 3);
            this._d = { y1, slope };
            return `已知三點 \\((1,${y1}),(2,${y1 + 1}),(3,k)\\)，若最小平方法所得迴歸線斜率為 ${slope}，求 \\(k\\)。`;
          },
          get a() {
            const d = this._d || { y1: 2, slope: 1 };
            const k = 2 * d.slope + d.y1;
            return `簡答：${k}。過程：\\(\\bar x=2\\)，\\(S_{xx}=2\\)。\\(S_{xy}=(-1)(${d.y1}-\\bar y)+0+(1)(k-\\bar y)=k-${d.y1}\\)。斜率 \\(b=\\frac{S_{xy}}{S_{xx}}=\\frac{k-${d.y1}}{2}=${d.slope}\\)，得 \\(k=${k}\\)。`;
          },
        },
        {
          q: '證明當 \\(y=a+bx\\) 為迴歸線時，\\(\\sum (y_i-\\mu_y)=b\\sum(x_i-\mu_x)\\) 恆成立。',
          a: '簡答：成立，且兩邊皆為 0。過程：由平均數定義，\\(\\sum(y_i-\mu_y)=0\\)、\\(\\sum(x_i-\mu_x)=0\\)，因此右邊 \\(b\\sum(x_i-\mu_x)=0\\)，兩邊相等。',
        },
        {
          q: '給定 \\(\\sum x_i,\\sum y_i,\\sum x_i^2,\\sum x_iy_i\\)，不代入簡化公式，直接列出最小平方法求 \\(a,b\\) 的聯立方程組。',
          a: '簡答：\\(na+b\\sum x_i=\\sum y_i\\)，\\(a\\sum x_i+b\\sum x_i^2=\\sum x_iy_i\\)。過程：使 \\(\\sum(y_i-a-bx_i)^2\\) 最小時，對 \\(a,b\\) 的偏導數為 0，得到這兩條 normal equations。',
        },
      ],
      count
    );
  }

  function buildS232TransformedRegressionSet(count) {
    return buildS223DynamicSet(
      [
        () => {
          const mDen = 2;
          const c = randInt(2, 6);
          const k = s242Pick([5, 10]);
          const s = randInt(1, 4);
          const t = randInt(2, 8);
          // y = x/2 + c；x' = kx + s，y' = y − t
          const slopeText = formatFraction(1, 2 * k);
          const constNumer = -s - 2 * k * (t - c);
          const constText = formatFraction(constNumer, 2 * k);
          return {
            q: `原數據 \\(y\\) 對 \\(x\\) 的迴歸線為 \\(y=0.5x+${c}\\)。若令 \\(x^{\\prime}=${k}x+${s}\\)、\\(y^{\\prime}=y-${t}\\)，求新數據 \\(y^{\\prime}\\) 對 \\(x^{\\prime}\\) 的迴歸線。`,
            a: `簡答：\\(y^{\\prime}=${slopeText}x^{\\prime}${constNumer >= 0 ? '+' : ''}${constText}\\)。過程：由 \\(x=\\frac{x^{\\prime}-${s}}{${k}}\\)、\\(y=y^{\\prime}+${t}\\)，代入 \\(y=0.5x+${c}\\)，得 \\(y^{\\prime}+${t}=\\frac12\\cdot\\frac{x^{\\prime}-${s}}{${k}}+${c}\\)，化簡即得。`,
          };
        },
        () => {
          const b = s242Pick([0.4, 0.5, 0.6, 0.8]);
          const c = 10 * randInt(3, 7);
          const newSlope = Math.round(b * 2.54 * 1000) / 1000;
          return {
            q: `已知身高 \\(x\\)（公分）與體重 \\(y\\)（公斤）的迴歸線為 \\(y=${b}x-${c}\\)。若將身高單位改為吋（1 吋 = 2.54 公分），求新的迴歸線斜率。`,
            a: `簡答：${newSlope}。過程：若新變數 \\(X\\) 為吋，則原身高 \\(x=2.54X\\)。代入得 \\(y=${b}(2.54X)-${c}=${newSlope}X-${c}\\)，斜率為 ${newSlope}。`,
          };
        },
        () => {
          const b = s242Pick(['0.25', '0.4', '0.75', '1.2']);
          const c = s242Pick(['0.13', '0.5', '1.4']);
          const dx = 5 * randInt(1, 4);
          const dy = 5 * randInt(2, 6);
          return {
            q: `設 \\(y\\) 對 \\(x\\) 的迴歸線為 \\(y=${b}x+${c}\\)。若將所有 \\(x_i\\) 均加上 ${dx}，所有 \\(y_i\\) 均加上 ${dy}，求迴歸線的斜率是否改變。`,
            a: `簡答：不改變，仍為 \\(${b}\\)。過程：平移資料只改變平均點與截距，不改變離差與斜率，因此新迴歸線斜率仍為 ${b}。`,
          };
        },
        () => {
          const combo = s242Pick([
            { r: '0.8', sx: 2, sy: 5, slope: 2 },
            { r: '0.6', sx: 3, sy: 10, slope: 2 },
            { r: '0.9', sx: 3, sy: 10, slope: 3 },
            { r: '0.5', sx: 2, sy: 16, slope: 4 },
          ]);
          const mx = 5 * randInt(2, 6);
          const my = combo.slope * mx;
          return {
            q: `若將數據標準化後所得迴歸線為 \\(y^{\\prime}=${combo.r}x^{\\prime}\\)，已知 \\(\\mu_x=${mx},\\mu_y=${my},\\sigma_x=${combo.sx},\\sigma_y=${combo.sy}\\)，還原出原始數據的迴歸線。`,
            a: `簡答：\\(y=${combo.slope}x\\)。過程：標準化迴歸線斜率 ${combo.r} 即 \\(r=${combo.r}\\)。原斜率為 \\(r\\frac{\\sigma_y}{\\sigma_x}=${combo.r}\\cdot\\frac{${combo.sy}}{${combo.sx}}=${combo.slope}\\)。通過平均點 \\((${mx},${my})\\)，所以 \\(y-${my}=${combo.slope}(x-${mx})\\)，即 \\(y=${combo.slope}x\\)。`,
          };
        },
        () => {
          const m = randInt(2, 5);
          const c = randInt(10, 30);
          const lift = randInt(3, 8);
          const slopeText = `\\frac{${10 * m}}{11}`;
          const newConst = c - lift;
          return {
            q: `某公司統計廣告費 \\(x\\) 與營業額 \\(y\\) 的關係為 \\(\\hat y=${m}x-${c}\\)。若廣告費改以「增加 10% 後的數值」\\(x^{\\prime}=\\frac{11}{10}x\\) 表示，且營業額全面提升 ${lift} 單位，求新預測模型。`,
            a: `簡答：\\(\\hat y^{\\prime}=${slopeText}x^{\\prime}-${newConst}\\)。過程：新營業額 \\(y^{\\prime}=y+${lift}\\)，且 \\(x=\\frac{10}{11}x^{\\prime}\\)。代入得 \\(\\hat y^{\\prime}=${m}\\cdot\\frac{10}{11}x^{\\prime}-${c}+${lift}=${slopeText}x^{\\prime}-${newConst}\\)。`,
          };
        },
      ],
      count
    );
  }

  function buildS232CorrelationFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS232CorrelationBasicSet,
        buildS232ScatterJudgmentSet,
        buildS232CorrelationSensitivitySet,
        buildS232LinearTransformCorrelationSet,
        buildS232RegressionConsistencySet,
      ],
      count
    );
  }

  function buildS232RegressionFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS232RegressionLineSet,
        buildS232ReciprocalSlopesSet,
        buildS232MeanPointSet,
        buildS232LeastSquaresSet,
        buildS232TransformedRegressionSet,
      ],
      count
    );
  }

  function buildS232CorrelationBasicSubtypeSet(count) {
    return buildS232CorrelationBasicSet(count);
  }

  function buildS232ScatterJudgmentSubtypeSet(count) {
    return buildS232ScatterJudgmentSet(count);
  }

  function buildS232CorrelationSensitivitySubtypeSet(count) {
    return buildS232CorrelationSensitivitySet(count);
  }

  function buildS232LinearTransformCorrelationSubtypeSet(count) {
    return buildS232LinearTransformCorrelationSet(count);
  }

  function buildS232RegressionConsistencySubtypeSet(count) {
    return buildS232RegressionConsistencySet(count);
  }

  function buildS232RegressionLineSubtypeSet(count) {
    return buildS232RegressionLineSet(count);
  }

  function buildS232ReciprocalSlopesSubtypeSet(count) {
    return buildS232ReciprocalSlopesSet(count);
  }

  function buildS232MeanPointSubtypeSet(count) {
    return buildS232MeanPointSet(count);
  }

  function buildS232LeastSquaresSubtypeSet(count) {
    return buildS232LeastSquaresSet(count);
  }

  function buildS232TransformedRegressionSubtypeSet(count) {
    return buildS232TransformedRegressionSet(count);
  }

  function s241Pick(list) {
    return list[randInt(0, list.length - 1)];
  }

  function s241SqrtCoeff(num, den = 1, rad = 1) {
    if (num === 0) return '0';
    const simplified = simplifyRadical(rad);
    const reduced = reduceFraction(num * simplified.outside, den);
    const sign = reduced.numerator < 0 ? '-' : '';
    const n = Math.abs(reduced.numerator);
    const d = reduced.denominator;
    if (simplified.inside === 1) return formatFraction(reduced.numerator, d);
    const coeff = n === 1 ? '' : `${n}`;
    const body = `${coeff}\\sqrt{${simplified.inside}}`;
    return d === 1 ? `${sign}${body}` : `${sign}\\frac{${body}}{${d}}`;
  }

  const S241_TRIG = {
    0: { sin: [0, 1, 1], cos: [1, 1, 1], tan: [0, 1], quad: '正 x 軸' },
    30: { sin: [1, 2, 1], cos: [1, 2, 3], tan: [1, 3, 3], quad: '第一象限' },
    45: { sin: [1, 2, 2], cos: [1, 2, 2], tan: [1, 1], quad: '第一象限' },
    60: { sin: [1, 2, 3], cos: [1, 2, 1], tan: [1, 1, 3], quad: '第一象限' },
    90: { sin: [1, 1, 1], cos: [0, 1, 1], tan: null, quad: '正 y 軸' },
    120: { sin: [1, 2, 3], cos: [-1, 2, 1], tan: [-1, 1, 3], quad: '第二象限' },
    135: { sin: [1, 2, 2], cos: [-1, 2, 2], tan: [-1, 1], quad: '第二象限' },
    150: { sin: [1, 2, 1], cos: [-1, 2, 3], tan: [-1, 3, 3], quad: '第二象限' },
    180: { sin: [0, 1, 1], cos: [-1, 1, 1], tan: [0, 1], quad: '負 x 軸' },
    210: { sin: [-1, 2, 1], cos: [-1, 2, 3], tan: [1, 3, 3], quad: '第三象限' },
    225: { sin: [-1, 2, 2], cos: [-1, 2, 2], tan: [1, 1], quad: '第三象限' },
    240: { sin: [-1, 2, 3], cos: [-1, 2, 1], tan: [1, 1, 3], quad: '第三象限' },
    270: { sin: [-1, 1, 1], cos: [0, 1, 1], tan: null, quad: '負 y 軸' },
    300: { sin: [-1, 2, 3], cos: [1, 2, 1], tan: [-1, 1, 3], quad: '第四象限' },
    315: { sin: [-1, 2, 2], cos: [1, 2, 2], tan: [-1, 1], quad: '第四象限' },
    330: { sin: [-1, 2, 1], cos: [1, 2, 3], tan: [-1, 3, 3], quad: '第四象限' },
  };

  function s241TrigLatex(entry) {
    if (!entry) return '\\text{不存在}';
    if (entry.length === 2) return formatFraction(entry[0], entry[1]);
    return s241SqrtCoeff(entry[0], entry[1], entry[2]);
  }

  function s241AngleMod(angle) {
    return ((angle % 360) + 360) % 360;
  }

  function s241Quadrant(angle) {
    const a = s241AngleMod(angle);
    if (a === 0) return '正 x 軸';
    if (a === 90) return '正 y 軸';
    if (a === 180) return '負 x 軸';
    if (a === 270) return '負 y 軸';
    if (a < 90) return '第一象限';
    if (a < 180) return '第二象限';
    if (a < 270) return '第三象限';
    return '第四象限';
  }

  function buildS241CoordinateConversionSet(count) {
    const standard = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const r = s241Pick([2, 3, 4, 5, 6, 8, 10, 12]);
        const theta = s241Pick(standard);
        const t = S241_TRIG[theta];
        const x = s241SqrtCoeff(r * t.cos[0], t.cos[1], t.cos[2]);
        const y = s241SqrtCoeff(r * t.sin[0], t.sin[1], t.sin[2]);
        questions.push(`將極坐標 \\([${r},${theta}^\\circ]\\) 轉換成直角坐標。`);
        answers.push(
          `簡答：\\((${x},${y})\\)。過程：\\(x=r\\cos\\theta=${r}\\cos${theta}^\\circ=${x}\\)，\\(y=r\\sin\\theta=${r}\\sin${theta}^\\circ=${y}\\)。`
        );
      } else {
        const point = s241Pick([
          { x: 5, y: 0, r: '5', theta: 0 },
          { x: -4, y: 0, r: '4', theta: 180 },
          { x: 0, y: 6, r: '6', theta: 90 },
          { x: 0, y: -7, r: '7', theta: 270 },
          { x: 3, y: 3, r: '3\\sqrt{2}', theta: 45 },
          { x: -2, y: 2, r: '2\\sqrt{2}', theta: 135 },
          { x: -6, y: -6, r: '6\\sqrt{2}', theta: 225 },
          { x: 4, y: -4, r: '4\\sqrt{2}', theta: 315 },
        ]);
        questions.push(
          `將直角坐標 \\((${point.x},${point.y})\\) 轉換成極坐標（取 \\(0^\\circ\\leq\\theta<360^\\circ\\)）。`
        );
        answers.push(
          `簡答：\\([${point.r},${point.theta}^\\circ]\\)。過程：\\(r=\\sqrt{x^2+y^2}=${point.r}\\)，再依點所在位置判斷角度為 \\(${point.theta}^\\circ\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241OneKnownRatioSet(count) {
    const triples = [
      { a: 3, b: 4, c: 5 },
      { a: 5, b: 12, c: 13 },
      { a: 8, b: 15, c: 17 },
      { a: 7, b: 24, c: 25 },
    ];
    const signs = {
      第一象限: [1, 1],
      第二象限: [-1, 1],
      第三象限: [-1, -1],
      第四象限: [1, -1],
    };
    const quadrants = Object.keys(signs);
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const tri = s241Pick(triples);
      const quadrant = s241Pick(quadrants);
      const [cosSign, sinSign] = signs[quadrant];
      const sinNum = sinSign * tri.a;
      const cosNum = cosSign * tri.b;
      if (i % 2 === 0) {
        questions.push(
          `已知 \\(\\sin\\theta=${formatFraction(sinNum, tri.c)}\\)，且 \\(\\theta\\) 在${quadrant}，求 \\(\\cos\\theta\\) 與 \\(\\tan\\theta\\)。`
        );
      } else {
        questions.push(
          `已知 \\(\\cos\\theta=${formatFraction(cosNum, tri.c)}\\)，且 \\(\\theta\\) 在${quadrant}，求 \\(\\sin\\theta\\) 與 \\(\\tan\\theta\\)。`
        );
      }
      answers.push(
        `簡答：\\(\\sin\\theta=${formatFraction(sinNum, tri.c)}\\)，\\(\\cos\\theta=${formatFraction(cosNum, tri.c)}\\)，\\(\\tan\\theta=${formatFraction(sinNum, cosNum)}\\)。過程：由已知比值先得直角三角形三邊比例為 ${tri.a}:${tri.b}:${tri.c}，再依${quadrant}決定正負號。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241CoterminalQuadrantSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      if (i % 3 === 0) {
        const sign = randInt(0, 1) === 0 ? 1 : -1;
        const angle = sign * (360 + 5 * randInt(1, 216));
        const remainder = s241AngleMod(angle);
        const positive = remainder === 0 ? 360 : remainder;
        const negative = remainder === 0 ? -360 : remainder - 360;
        questions.push(`求 \\(${angle}^\\circ\\) 的最小正同界角與最大負同界角。`);
        answers.push(
          `簡答：最小正同界角 \\(${positive}^\\circ\\)，最大負同界角 \\(${negative}^\\circ\\)。過程：同界角相差 \\(360^\\circ\\) 的整數倍，將 \\(${angle}^\\circ\\) 除以 360 取餘角即可。`
        );
      } else if (i % 3 === 1) {
        const quad = s241Pick(['第一象限', '第二象限', '第三象限', '第四象限']);
        const signs = {
          第一象限: '\\(\\sin\\theta>0,\\cos\\theta>0,\\tan\\theta>0\\)',
          第二象限: '\\(\\sin\\theta>0,\\cos\\theta<0,\\tan\\theta<0\\)',
          第三象限: '\\(\\sin\\theta<0,\\cos\\theta<0,\\tan\\theta>0\\)',
          第四象限: '\\(\\sin\\theta<0,\\cos\\theta>0,\\tan\\theta<0\\)',
        };
        questions.push(`若 \\(\\theta\\) 在${quad}，判斷 \\(\\sin\\theta,\\cos\\theta,\\tan\\theta\\) 的正負號。`);
        answers.push(
          `簡答：${signs[quad]}。過程：依各象限座標 \\((x,y)\\) 的正負判斷：\\(\\cos\\theta\\) 看 \\(x\\)，\\(\\sin\\theta\\) 看 \\(y\\)，\\(\\tan\\theta=\\frac{y}{x}\\)。`
        );
      } else {
        let angle = randInt(-720, 720);
        for (let retry = 0; retry < 10 && angle % 90 === 0; retry += 1) angle = randInt(-720, 720);
        if (angle % 90 === 0) angle += 37;
        const q = s241Quadrant(angle);
        questions.push(`判斷角 \\(${angle}^\\circ\\) 的終邊所在位置。`);
        answers.push(
          `簡答：${q}。過程：先化成 \\(0^\\circ\\leq\\theta<360^\\circ\\) 的同界角，得 \\(${s241AngleMod(angle)}^\\circ\\)，再判斷其象限或坐標軸。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241ReductionIdentitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const theta = s241Pick([10, 20, 30, 40, 50, 60, 70, 80]);
      const type = i % 5;
      if (type === 0) {
        const variant = s241Pick([
          {
            q: '\\sin(90^\\circ+\\theta)\\cos(90^\\circ+\\theta)-\\sin(180^\\circ-\\theta)\\cos(180^\\circ-\\theta)',
            why: '\\(\\sin(90^\\circ+\\theta)=\\cos\\theta\\)，\\(\\cos(90^\\circ+\\theta)=-\\sin\\theta\\)，第一項為 \\(-\\sin\\theta\\cos\\theta\\)。又 \\(\\sin(180^\\circ-\\theta)=\\sin\\theta\\)，\\(\\cos(180^\\circ-\\theta)=-\\cos\\theta\\)，第二項也為 \\(-\\sin\\theta\\cos\\theta\\)，相減得 0。',
          },
          {
            q: '\\sin(180^\\circ+\\theta)\\cos(180^\\circ+\\theta)-\\sin\\theta\\cos\\theta',
            why: '\\(\\sin(180^\\circ+\\theta)=-\\sin\\theta\\)、\\(\\cos(180^\\circ+\\theta)=-\\cos\\theta\\)，第一項為 \\(\\sin\\theta\\cos\\theta\\)，與第二項相減得 0。',
          },
          {
            q: '\\cos(360^\\circ-\\theta)\\cos(-\\theta)-\\cos^2\\theta',
            why: '\\(\\cos(360^\\circ-\\theta)=\\cos\\theta\\)、\\(\\cos(-\\theta)=\\cos\\theta\\)，第一項為 \\(\\cos^2\\theta\\)，相減得 0。',
          },
        ]);
        questions.push(`化簡 \\(${variant.q}\\)。`);
        answers.push(`簡答：0。過程：${variant.why}`);
      } else if (type === 1) {
        questions.push(`計算 \\(\\cos${theta}^\\circ+\\cos${180 - theta}^\\circ\\) 之值。`);
        answers.push(
          `簡答：0。過程：\\(\\cos(180^\\circ-\\theta)=-\\cos\\theta\\)，所以 \\(\\cos${theta}^\\circ+\\cos${180 - theta}^\\circ=\\cos${theta}^\\circ-\\cos${theta}^\\circ=0\\)。`
        );
      } else if (type === 2) {
        const angle = s241Pick([210, 225, 240, 300, 330]);
        const t = S241_TRIG[angle].tan;
        questions.push(`計算 \\(\\tan${angle}^\\circ\\) 的確切值。`);
        answers.push(
          `簡答：\\(${s241TrigLatex(t)}\\)。過程：先找參考角，再依象限決定正負；\\(${angle}^\\circ\\) 在${s241Quadrant(angle)}，所以 \\(\\tan${angle}^\\circ=${s241TrigLatex(t)}\\)。`
        );
      } else if (type === 3) {
        questions.push(`求 \\(\\sin^2${theta}^\\circ+\\sin^2${90 - theta}^\\circ\\) 的值。`);
        answers.push(
          `簡答：1。過程：\\(\\sin(90^\\circ-\\theta)=\\cos\\theta\\)，所以原式為 \\(\\sin^2\\theta+\\cos^2\\theta=1\\)。`
        );
      } else {
        questions.push(`已知 \\(\\cos(-${theta}^\\circ)=k\\)，試用 \\(k\\) 表示 \\(\\cos${theta}^\\circ\\)。`);
        answers.push(
          `簡答：\\(k\\)。過程：\\(\\cos\\) 是偶函數，\\(\\cos(-\\theta)=\\cos\\theta\\)，所以 \\(\\cos${theta}^\\circ=k\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241PolarGeometrySet(count) {
    const anglePairs = [
      [30, 90],
      [45, 135],
      [60, 120],
      [30, 150],
      [210, 300],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const r1 = s241Pick([2, 3, 4, 5, 6]);
      const r2 = s241Pick([3, 4, 5, 6, 8]);
      const [a, b] = s241Pick(anglePairs);
      const diff = Math.abs(b - a);
      const cosDiff = S241_TRIG[diff].cos;
      const sinDiff = S241_TRIG[diff].sin;
      if (i % 2 === 0) {
        const exactD2 = r1 * r1 + r2 * r2 - (2 * r1 * r2 * cosDiff[0]) / cosDiff[1];
        const dText = formatRadical(exactD2);
        questions.push(
          `在極坐標平面上有兩點 \\(P[${r1},${a}^\\circ]\\) 與 \\(Q[${r2},${b}^\\circ]\\)，求線段 \\(PQ\\) 的長度。`
        );
        answers.push(
          `簡答：\\(${dText}\\)。過程：兩點距離平方為 \\(r_1^2+r_2^2-2r_1r_2\\cos(\\theta_1-\\theta_2)\\)。代入得 \\(PQ^2=${exactD2}\\)，所以 \\(PQ=${dText}\\)。`
        );
      } else {
        const area = s241SqrtCoeff(r1 * r2 * sinDiff[0], 2 * sinDiff[1], sinDiff[2]);
        questions.push(
          `在極坐標平面上有兩點 \\(P[${r1},${a}^\\circ]\\) 與 \\(Q[${r2},${b}^\\circ]\\)，求 \\(\\triangle OPQ\\) 的面積。`
        );
        answers.push(
          `簡答：\\(${area}\\)。過程：\\(\\triangle OPQ\\) 面積為 \\(\\frac12r_1r_2\\sin|\\theta_1-\\theta_2|\\)。代入 \\(r_1=${r1},r_2=${r2},|\\theta_1-\\theta_2|=${diff}^\\circ\\)，得 \\(${area}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241TrigInterpolationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const start = s241Pick([20, 25, 30, 34, 40]);
      const step = 10;
      const target = s241Pick([2, 3, 4, 5, 6, 7, 8]);
      const v1 = Number((0.3 + start / 200 + randInt(0, 12) / 1000).toFixed(4));
      const inc = Number((randInt(16, 32) / 10000).toFixed(4));
      const v2 = Number((v1 + inc).toFixed(4));
      const value = Number((v1 + (inc * target) / step).toFixed(4));
      questions.push(
        `已知 \\(\\sin${start}^\\circ00'=${v1.toFixed(4)}\\)，\\(\\sin${start}^\\circ10'=${v2.toFixed(4)}\\)，利用內插法求 \\(\\sin${start}^\\circ${String(target).padStart(2, '0')}'\\) 的近似值。`
      );
      answers.push(
        `簡答：約 \\(${value.toFixed(4)}\\)。過程：目標角距離前一表值 ${target} 分，占 ${target}/${step}。線性內插為 \\(${v1.toFixed(4)}+(${v2.toFixed(4)}-${v1.toFixed(4)})\\cdot\\frac{${target}}{${step}}=${value.toFixed(4)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241TrigQuadraticRootsSet(count) {
    const angles = [30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const angle = s241Pick(angles);
      const trig = S241_TRIG[angle];
      const sinText = s241TrigLatex(trig.sin);
      const cosText = s241TrigLatex(trig.cos);
      const tanText = s241TrigLatex(trig.tan);
      const trigValue = (entry) =>
        entry.length === 2 ? entry[0] / entry[1] : (entry[0] * Math.sqrt(entry[2])) / entry[1];
      const difference = trigValue(trig.sin) - trigValue(trig.cos);
      const relation = Math.abs(difference) < 1e-10 ? '=' : difference > 0 ? '>' : '<';
      const sumText = `${sinText}${cosText.startsWith('-') ? cosText : `+${cosText}`}`;
      const prodText = s241SqrtCoeff(trig.sin[0] * trig.cos[0], trig.sin[1] * trig.cos[1], trig.sin[2] * trig.cos[2]);
      const prodTerm = prodText.startsWith('-') ? prodText : `+${prodText}`;
      questions.push(
        `設 \\(\\sin A\\) 與 \\(\\cos A\\) 為二次方程式 \\(t^2-(${sumText})t${prodTerm}=0\\) 的兩根，且 \\(A\\) 在${S241_TRIG[angle].quad}、\\(\\sin A${relation}\\cos A\\)，求 \\(\\tan A\\)。`
      );
      answers.push(
        `簡答：\\(\\tan A=${tanText}\\)。過程：方程兩根為 \\(\\sin A\\) 與 \\(\\cos A\\)，由係數可得其和與積。又 \\(A\\) 在${S241_TRIG[angle].quad}，對應標準角為 \\(${angle}^\\circ\\)，所以 \\(\\sin A=${sinText}\\)、\\(\\cos A=${cosText}\\)，故 \\(\\tan A=\\frac{\\sin A}{\\cos A}=${tanText}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241RepresentingSegmentsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const chordText = (r) => (r === 1 ? '\\(2\\sin\\frac{\\theta}{2}\\)' : `\\(2\\cdot${r}\\sin\\frac{\\theta}{2}\\)`);
    const halfChordText = (r) => (r === 1 ? `\\(\\sin\\frac{\\theta}{2}\\)` : `\\(${r}\\sin\\frac{\\theta}{2}\\)`);
    for (let i = 0; i < count; i += 1) {
      const type = i % 3;
      if (type === 0) {
        const r = s241Pick([1, 2, 3, 4, 5]);
        questions.push(
          `在半徑為 ${r} 的圓中，點 \\(T\\) 為切點且 \\(\\angle AOT=\\theta\\)。若切線與射線 \\(OA\\) 的延長線交於 \\(A\\)，試以 \\(\\theta\\) 表示 \\(OT\\) 與 \\(AT\\)。`
        );
        answers.push(
          `簡答：\\(OT=${r},\\ AT=${r}\\tan\\theta\\)。過程：\\(OT\\) 是半徑，所以為 ${r}；在直角三角形中，\\(\\tan\\theta=\\frac{AT}{OT}\\)，故 \\(AT=${r}\\tan\\theta\\)。`
        );
      } else if (type === 1) {
        const side = s241Pick([6, 8, 10, 12]);
        questions.push(
          `直角 \\(\\triangle ABC\\) 中，\\(\\angle C=90^\\circ\\)、\\(AB=${side}\\)，且 \\(CD\\) 為斜邊上的高。若 \\(\\angle A=\\theta\\)，以 \\(\\theta\\) 表示 \\(CD\\)。`
        );
        answers.push(
          `簡答：\\(CD=${side}\\sin\\theta\\cos\\theta\\)。過程：兩股為 \\(${side}\\sin\\theta\\) 與 \\(${side}\\cos\\theta\\)。面積也可寫成 \\(\\frac12\\cdot AB\\cdot CD\\)，故 \\(CD=\\frac{(${side}\\sin\\theta)(${side}\\cos\\theta)}{${side}}=${side}\\sin\\theta\\cos\\theta\\)。`
        );
      } else {
        const r = s241Pick([1, 2, 3, 4]);
        questions.push(`在半徑為 ${r} 的圓中，圓心角為 \\(\\theta\\) 的弦長如何以三角函數表示？`);
        answers.push(
          `簡答：${chordText(r)}。過程：連結圓心與弦中點會形成直角三角形，半弦長為 ${halfChordText(r)}，所以弦長為 ${chordText(r)}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241AngleBisectorAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const angle = s241Pick([60, 120]);
      const b = s241Pick([4, 6, 8, 10, 12]);
      const c = s241Pick([3, 5, 6, 8]);
      const cosHalf = angle === 60 ? [1, 2, 3] : [1, 2, 1];
      const len = s241SqrtCoeff(2 * b * c * cosHalf[0], (b + c) * cosHalf[1], cosHalf[2]);
      questions.push(
        `\\(\\triangle ABC\\) 中，\\(\\angle A=${angle}^\\circ\\)、\\(AB=${b}\\)、\\(AC=${c}\\)，求內角平分線 \\(AD\\) 的長度。`
      );
      answers.push(
        `簡答：\\(AD=${len}\\)。過程：角平分線長可由面積拆分或公式 \\(AD=\\frac{2bc\\cos(A/2)}{b+c}\\)。代入 \\(b=${b},c=${c},A=${angle}^\\circ\\)，得 \\(AD=${len}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241TrigExtremaIdentitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const s = s241Pick([
          [5, 4],
          [6, 5],
          [4, 3],
          [7, 5],
          [8, 7],
          [9, 7],
        ]);
        const product = formatFraction(s[0] * s[0] - s[1] * s[1], 2 * s[1] * s[1]);
        const cube = formatFraction(
          s[0] * s[0] * s[0] - 3 * s[0] * s[1] * s[1] * Number(product.split('{')[1] || 0),
          s[1] ** 3
        );
        questions.push(
          `已知 \\(\\sin\\theta+\\cos\\theta=${formatFraction(s[0], s[1])}\\)，求 \\(\\sin\\theta\\cos\\theta\\)。`
        );
        answers.push(
          `簡答：\\(${product}\\)。過程：平方得 \\((\\sin\\theta+\\cos\\theta)^2=1+2\\sin\\theta\\cos\\theta\\)。所以 \\(\\sin\\theta\\cos\\theta=\\frac{(${formatFraction(s[0], s[1])})^2-1}{2}=${product}\\)。`
        );
      } else {
        const a = s241Pick([1, 2, 3, 4, 5, 6]);
        const sinTerm = a === 1 ? '\\sin x' : `${a}\\sin x`;
        const vertexInRange = a <= 4;
        const maximum = vertexInRange ? formatFraction(8 + a * a, 8) : String(a - 1);
        const maximumReason = vertexInRange
          ? `頂點在 \\(t=-\\frac{${a}}4\\)，最大值為 \\(1+\\frac{${a * a}}8=${maximum}\\)`
          : `頂點 \\(t=-\\frac{${a}}4\\) 在範圍外，最大值在 \\(t=-1\\) 取得，為 \\(${a - 1}\\)`;
        questions.push(`求函數 \\(f(x)=\\cos 2x-${sinTerm}\\) 的最大值與最小值。`);
        answers.push(
          `簡答：最大值 \\(${maximum}\\)，最小值 \\(-${1 + a}\\)。過程：\\(\\cos2x=1-2\\sin^2x\\)。令 \\(t=\\sin x\\)，\\(-1\\le t\\le1\\)，則 \\(f=1-2t^2-${a === 1 ? '' : a}t\\)。此二次式開口向下，${maximumReason}；端點比較得最小值 \\(-${1 + a}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241SideAltitudeSineRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const hs = shuffle([3, 4, 6, 8, 12]).slice(0, 3);
      const inv = hs.map((h) => 1 / h);
      const lcm = hs.reduce((acc, h) => (acc * h) / gcdInt(acc, h), 1);
      const ratio = hs.map((h) => lcm / h);
      const g = ratio.reduce((acc, v) => gcdInt(acc, v), ratio[0]);
      const simple = ratio.map((v) => v / g);
      questions.push(
        `已知 \\(\\triangle ABC\\) 三邊上的高分別為 \\(h_a=${hs[0]},h_b=${hs[1]},h_c=${hs[2]}\\)，求 \\(\\sin A:\\sin B:\\sin C\\)。`
      );
      answers.push(
        `簡答：\\(${simple[0]}:${simple[1]}:${simple[2]}\\)。過程：同一三角形面積 \\(\\Delta=\\frac12ah_a=\\frac12bh_b=\\frac12ch_c\\)，所以邊長與高成反比。又正弦定理給 \\(\\sin A:\\sin B:\\sin C=a:b:c\\)，故比值為 \\(\\frac1{${hs[0]}}:\\frac1{${hs[1]}}:\\frac1{${hs[2]}}=${simple[0]}:${simple[1]}:${simple[2]}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241TerminalLineDefinitionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const x = s241Pick([2, 3, 4, -2, -3, -4]);
      const y = s241Pick([2, 3, 4, -2, -3, -4]);
      if (x === 0 || y === 0) continue;
      const r2 = x * x + y * y;
      const rText = formatRadical(r2);
      const quad = s241Quadrant((Math.atan2(y, x) * 180) / Math.PI);
      questions.push(
        `已知角 \\(\\theta\\) 的終邊通過點 \\(P(${x},${y})\\)，求 \\(\\sin\\theta,\\cos\\theta,\\tan\\theta\\)。`
      );
      const sinText = s241SqrtCoeff(y, r2, r2);
      const cosText = s241SqrtCoeff(x, r2, r2);
      answers.push(
        `簡答：\\(\\sin\\theta=${sinText}\\)，\\(\\cos\\theta=${cosText}\\)，\\(\\tan\\theta=${formatFraction(y, x)}\\)。過程：終邊上一點到原點距離為 \\(r=${rText}\\)。依定義 \\(\\sin\\theta=\\frac{y}{r}\\)、\\(\\cos\\theta=\\frac{x}{r}\\)，代入並有理化得 \\(\\sin\\theta=${sinText}\\)、\\(\\cos\\theta=${cosText}\\)，且此點在${quad}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241TriangleAngleIdentitySet(count) {
    const identities = [
      ['\\sin(A+B)', '\\sin(180^\\circ-C)=\\sin C'],
      ['\\cos(A+B)', '\\cos(180^\\circ-C)=-\\cos C'],
      ['\\sin\\frac{A+B}{2}', '\\sin(90^\\circ-\\frac{C}{2})=\\cos\\frac{C}{2}'],
      ['\\cos\\frac{A+B}{2}', '\\cos(90^\\circ-\\frac{C}{2})=\\sin\\frac{C}{2}'],
      ['\\tan(A+B)+\\tan C', '\\tan(180^\\circ-C)+\\tan C=-\\tan C+\\tan C=0'],
      ['\\sin(A+B)+\\sin C', '\\sin(180^\\circ-C)+\\sin C=2\\sin C'],
      ['\\cos(A+B)+\\cos C', '\\cos(180^\\circ-C)+\\cos C=0'],
      ['\\tan(A+B)\\tan C', '\\tan(180^\\circ-C)\\tan C=-\\tan^2 C'],
      ['\\sin(A+B)-\\sin C', '\\sin(180^\\circ-C)-\\sin C=0'],
      ['\\cos(A+B)-\\cos C', '\\cos(180^\\circ-C)-\\cos C=-2\\cos C'],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s241Pick(identities);
      const domainNote = item[0].includes('\\tan') ? '（假設相關正切值皆有定義）' : '';
      questions.push(`在 \\(\\triangle ABC\\) 中，化簡 \\(${item[0]}\\)${domainNote}。`);
      answers.push(
        `簡答：\\(${item[1].split('=')[item[1].split('=').length - 1]}\\)。過程：三角形內角和為 \\(A+B+C=180^\\circ\\)，所以 \\(A+B=180^\\circ-C\\)。代入後用誘導公式：\\(${item[1]}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241SquareSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const step = s241Pick([1, 2, 3, 5, 6, 9, 10, 15, 18, 30]);
      const func = s241Pick(['\\sin', '\\cos']);
      const termCount = 90 / step - 1;
      const ans = termCount % 2 === 0 ? `${termCount / 2}` : formatFraction(termCount, 2);
      questions.push(
        `計算 \\(${func}^2${step}^\\circ+${func}^2${2 * step}^\\circ+\\cdots+${func}^2${90 - step}^\\circ\\) 的值。`
      );
      answers.push(
        `簡答：\\(${ans}\\)。過程：利用互餘角關係與 \\(\\sin^2\\theta+\\cos^2\\theta=1\\)。將 \\(\\theta\\) 與 \\(90^\\circ-\\theta\\) 配對，每組和為 1；若出現 \\(45^\\circ\\)，其平方為 \\(\\frac12\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241SameAngleComparisonSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const theta = s241Pick([10, 15, 20, 30, 40, 45, 50, 60, 75, 80]);
        const order =
          theta < 45
            ? '\\(\\sin\\theta<\\tan\\theta<\\cos\\theta\\)'
            : theta === 45
              ? '\\(\\sin\\theta=\\cos\\theta<\\tan\\theta\\)'
              : '\\(\\cos\\theta<\\sin\\theta<\\tan\\theta\\)';
        questions.push(
          `已知 \\(\\theta=${theta}^\\circ\\)，比較 \\(\\sin\\theta,\\cos\\theta,\\tan\\theta\\) 的大小。`
        );
        answers.push(
          `簡答：${order}。過程：第一象限中 \\(\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}\\)。以 \\(45^\\circ\\) 為分界：小於 \\(45^\\circ\\) 時 \\(\\cos\\theta\\) 最大，大於 \\(45^\\circ\\) 時 \\(\\tan\\theta\\) 最大。`
        );
      } else {
        const mode = s241Pick([
          {
            text: '0^\\circ<\\theta<45^\\circ',
            order: '\\(\\sin\\theta<\\tan\\theta<\\cos\\theta\\)',
            reason:
              '\\(\\cos\\theta\\) 大於 \\(\\sin\\theta\\)，且 \\(0<\\cos\\theta<1\\)，所以 \\(\\tan\\theta\\) 介於兩者之間。',
          },
          {
            text: '45^\\circ<\\theta<90^\\circ',
            order: '\\(\\cos\\theta<\\sin\\theta<\\tan\\theta\\)',
            reason:
              '\\(\\sin\\theta\\) 大於 \\(\\cos\\theta\\)，且除以小於 1 的 \\(\\cos\\theta\\) 會使 \\(\\tan\\theta\\) 更大。',
          },
          {
            text: '0^\\circ<\\alpha<\\beta<90^\\circ',
            order: '\\(\\sin\\alpha<\\sin\\beta\\)，\\(\\cos\\alpha>\\cos\\beta\\)',
            reason: '\\(\\sin\\theta\\) 隨角度增加而增加，\\(\\cos\\theta\\) 隨角度增加而減少。',
          },
        ]);
        questions.push(`已知 \\(${mode.text}\\)，比較相關三角比的大小。`);
        answers.push(`簡答：${mode.order}。過程：${mode.reason}`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241BasicFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS241CoordinateConversionSet,
        buildS241OneKnownRatioSet,
        buildS241CoterminalQuadrantSet,
        buildS241ReductionIdentitySet,
        buildS241PolarGeometrySet,
      ],
      count
    );
  }

  function buildS241ComputationGeometryFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS241TrigInterpolationSet,
        buildS241TrigQuadraticRootsSet,
        buildS241RepresentingSegmentsSet,
        buildS241AngleBisectorAreaSet,
        buildS241TrigExtremaIdentitySet,
      ],
      count
    );
  }

  function buildS241TriangleIdentityFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS241SideAltitudeSineRatioSet,
        buildS241SameAngleComparisonSet,
        buildS241SquareSumSet,
        buildS241TerminalLineDefinitionSet,
        buildS241TriangleAngleIdentitySet,
      ],
      count
    );
  }

  function buildS241CoordinateConversionSubtypeSet(count) {
    return buildS241CoordinateConversionSet(count);
  }

  function buildS241OneKnownRatioSubtypeSet(count) {
    return buildS241OneKnownRatioSet(count);
  }

  function buildS241CoterminalQuadrantSubtypeSet(count) {
    return buildS241CoterminalQuadrantSet(count);
  }

  function buildS241ReductionIdentitySubtypeSet(count) {
    return buildS241ReductionIdentitySet(count);
  }

  function buildS241PolarGeometrySubtypeSet(count) {
    return buildS241PolarGeometrySet(count);
  }

  function buildS241TrigInterpolationSubtypeSet(count) {
    return buildS241TrigInterpolationSet(count);
  }

  function buildS241TrigQuadraticRootsSubtypeSet(count) {
    return buildS241TrigQuadraticRootsSet(count);
  }

  function buildS241RepresentingSegmentsSubtypeSet(count) {
    return buildS241RepresentingSegmentsSet(count);
  }

  function buildS241AngleBisectorAreaSubtypeSet(count) {
    return buildS241AngleBisectorAreaSet(count);
  }

  function buildS241TrigExtremaIdentitySubtypeSet(count) {
    return buildS241TrigExtremaIdentitySet(count);
  }

  function buildS241SideAltitudeSineRatioSubtypeSet(count) {
    return buildS241SideAltitudeSineRatioSet(count);
  }

  function buildS241SameAngleComparisonSubtypeSet(count) {
    return buildS241SameAngleComparisonSet(count);
  }

  function buildS241SquareSumSubtypeSet(count) {
    return buildS241SquareSumSet(count);
  }

  function buildS241TerminalLineDefinitionSubtypeSet(count) {
    return buildS241TerminalLineDefinitionSet(count);
  }

  function buildS241TriangleAngleIdentitySubtypeSet(count) {
    return buildS241TriangleAngleIdentitySet(count);
  }

  function s242Pick(list) {
    return list[randInt(0, list.length - 1)];
  }

  function s242RatioText(values) {
    const g = values.reduce((acc, value) => gcdInt(acc, Math.abs(value)), Math.abs(values[0]) || 1);
    return values.map((value) => value / g).join(':');
  }

  function s242RadicalProduct(coeff, rad = 1) {
    return s241SqrtCoeff(coeff, 1, rad);
  }

  function buildS242SineSideRatioSet(count) {
    const patterns = [
      { angles: [30, 60, 90], ratio: ['1', '\\sqrt{3}', '2'] },
      { angles: [60, 30, 90], ratio: ['\\sqrt{3}', '1', '2'] },
      { angles: [90, 30, 60], ratio: ['2', '1', '\\sqrt{3}'] },
      { angles: [45, 45, 90], ratio: ['1', '1', '\\sqrt{2}'] },
      { angles: [90, 45, 45], ratio: ['\\sqrt{2}', '1', '1'] },
      { angles: [30, 75, 75], ratio: ['2', '\\sqrt{6}+\\sqrt{2}', '\\sqrt{6}+\\sqrt{2}'] },
      { angles: [60, 60, 60], ratio: ['1', '1', '1'] },
      { angles: [120, 30, 30], ratio: ['\\sqrt{3}', '1', '1'] },
      { angles: [30, 30, 120], ratio: ['1', '1', '\\sqrt{3}'] },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(patterns);
      if (i % 2 === 0) {
        questions.push(
          `在 \\(\\triangle ABC\\) 中，若 \\(\\angle A:\\angle B:\\angle C=${item.angles[0]}:${item.angles[1]}:${item.angles[2]}\\)，求三邊長之比 \\(a:b:c\\)。`
        );
        answers.push(
          `簡答：\\(a:b:c=${item.ratio.join(':')}\\)。過程：由正弦定理，\\(a:b:c=\\sin A:\\sin B:\\sin C\\)。把三角形三內角代入，得 \\(\\sin${item.angles[0]}^\\circ:\\sin${item.angles[1]}^\\circ:\\sin${item.angles[2]}^\\circ=${item.ratio.join(':')}\\)。`
        );
      } else {
        const scale = s242Pick([2, 3, 4, 5, 6]);
        const sides = item.ratio.map((text) => {
          if (text === '1') return `${scale}`;
          if (text === '2') return `${2 * scale}`;
          if (text === '\\sqrt{2}') return s242RadicalProduct(scale, 2);
          if (text === '\\sqrt{3}') return s242RadicalProduct(scale, 3);
          return `${scale}(${text})`;
        });
        questions.push(
          `已知 \\(\\triangle ABC\\) 三邊長之比為 \\(${sides.join(':')}\\)，求 \\(\\sin A:\\sin B:\\sin C\\)。`
        );
        answers.push(
          `簡答：\\(${item.ratio.join(':')}\\)。過程：正弦定理可寫成 \\(a:b:c=\\sin A:\\sin B:\\sin C\\)。題目三邊同除以倍率 ${scale}，得 \\(${item.ratio.join(':')}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242AsaAasSet(count) {
    const cases = [
      {
        A: 30,
        B: 60,
        C: 90,
        sideName: 'a',
        sides(scale) {
          return [String(scale), s242RadicalProduct(scale, 3), String(2 * scale)];
        },
      },
      {
        A: 60,
        B: 30,
        C: 90,
        sideName: 'b',
        sides(scale) {
          return [s242RadicalProduct(scale, 3), String(scale), String(2 * scale)];
        },
      },
      {
        A: 45,
        B: 45,
        C: 90,
        sideName: 'a',
        sides(scale) {
          return [String(scale), String(scale), s242RadicalProduct(scale, 2)];
        },
      },
      {
        A: 30,
        B: 90,
        C: 60,
        sideName: 'a',
        sides(scale) {
          return [String(scale), String(2 * scale), s242RadicalProduct(scale, 3)];
        },
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([2, 3, 4, 5, 6, 8]);
      const [aText, bText, cText] = item.sides(scale);
      questions.push(
        `\\(\\triangle ABC\\) 中，\\(\\angle A=${item.A}^\\circ\\)、\\(\\angle B=${item.B}^\\circ\\)、\\(${item.sideName}=${scale}\\)，求其餘兩邊長。`
      );
      answers.push(
        `簡答：\\(a=${aText},b=${bText},c=${cText}\\)。過程：先得 \\(\\angle C=${item.C}^\\circ\\)。由正弦定理，\\(a:b:c=\\sin A:\\sin B:\\sin C\\)，再用已知邊長決定倍率。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242CircumradiusSet(count) {
    const angles = [30, 45, 60, 90, 120, 135, 150];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const R = s242Pick([3, 4, 5, 6, 8, 10]);
      const A = s242Pick(angles);
      const side = s241SqrtCoeff(2 * R * S241_TRIG[A].sin[0], S241_TRIG[A].sin[1], S241_TRIG[A].sin[2]);
      if (i % 2 === 0) {
        questions.push(
          `\\(\\triangle ABC\\) 的外接圓半徑為 \\(${R}\\)，且 \\(\\angle A=${A}^\\circ\\)，求對邊 \\(a\\)。`
        );
        answers.push(
          `簡答：\\(a=${side}\\)。過程：正弦定理給 \\(a=2R\\sin A\\)，代入 \\(R=${R}\\)、\\(A=${A}^\\circ\\)，得 \\(a=${side}\\)。`
        );
      } else {
        questions.push(
          `\\(\\triangle ABC\\) 中，\\(\\angle A=${A}^\\circ\\)，且對邊 \\(a=${side}\\)，求外接圓半徑 \\(R\\)。`
        );
        answers.push(
          `簡答：\\(R=${R}\\)。過程：\\(a=2R\\sin A\\)，所以 \\(R=\\frac{a}{2\\sin A}\\)。代入 \\(a=${side}\\)、\\(A=${A}^\\circ\\)，得 \\(R=${R}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242SsaAmbiguousSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const b = s242Pick([8, 10, 12, 14, 16, 18, 20]);
      const A = 30;
      const h = b / 2;
      const mode = i % 4;
      const a =
        mode === 0
          ? h - randInt(1, Math.max(1, h - 2))
          : mode === 1
            ? h
            : mode === 2
              ? h + randInt(1, h - 1)
              : b + randInt(1, 8);
      const result = mode === 0 ? '無解' : mode === 1 ? '一解' : mode === 2 ? '兩解' : '一解';
      const reason =
        mode === 0
          ? `\\(a=${a}<b\\sin A=${h}\\)`
          : mode === 1
            ? `\\(a=${a}=b\\sin A=${h}\\)，為直角三角形`
            : mode === 2
              ? `\\(b\\sin A=${h}<a=${a}<b=${b}\\)`
              : `\\(a=${a}\\ge b=${b}\\)`;
      questions.push(
        `已知 \\(\\triangle ABC\\) 中，\\(a=${a}\\)、\\(b=${b}\\)、\\(\\angle A=${A}^\\circ\\)，判斷此三角形有幾個解。`
      );
      answers.push(
        `簡答：${result}。過程：SSA 情形先比較 \\(a\\)、\\(b\\sin A\\)、\\(b\\)。本題 ${reason}，所以為${result}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242AltitudeSineRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const hs = shuffle([3, 4, 5, 6, 8, 10, 12]).slice(0, 3);
      const lcm = hs.reduce((acc, value) => (acc * value) / gcdInt(acc, value), 1);
      const ratio = hs.map((h) => lcm / h);
      questions.push(
        `\\(\\triangle ABC\\) 中，三邊上的高分別為 \\(h_a=${hs[0]},h_b=${hs[1]},h_c=${hs[2]}\\)，求 \\(\\sin A:\\sin B:\\sin C\\)。`
      );
      answers.push(
        `簡答：\\(${s242RatioText(ratio)}\\)。過程：同一三角形中 \\(a h_a=b h_b=c h_c=2\\Delta\\)，所以邊長與高成反比；又 \\(a:b:c=\\sin A:\\sin B:\\sin C\\)，故比值為 \\(\\frac1{${hs[0]}}:\\frac1{${hs[1]}}:\\frac1{${hs[2]}}=${s242RatioText(ratio)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242CosineSasSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const angles = [60, 90, 120];
    for (let i = 0; i < count; i += 1) {
      const b = s242Pick([3, 4, 5, 6, 8]);
      const c = s242Pick([4, 5, 7, 9]);
      const A = s242Pick(angles);
      const cos = A === 60 ? 1 : A === 90 ? 0 : -1;
      const cosDen = A === 90 ? 1 : 2;
      const a2 = b * b + c * c - (2 * b * c * cos) / cosDen;
      const aText = formatRadical(a2);
      questions.push(
        `在 \\(\\triangle ABC\\) 中，已知 \\(b=${b}\\)、\\(c=${c}\\)、\\(\\angle A=${A}^\\circ\\)，求邊長 \\(a\\)。`
      );
      answers.push(
        `簡答：\\(a=${aText}\\)。過程：餘弦定理 \\(a^2=b^2+c^2-2bc\\cos A\\)。代入得 \\(a^2=${a2}\\)，所以 \\(a=${aText}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242CosineSssAngleSet(count) {
    const triples = [
      { a: 5, b: 4, c: 3, angle: '90^\\circ', cos: '0' },
      { a: 13, b: 12, c: 5, angle: '90^\\circ', cos: '0' },
      { a: 7, b: 5, c: 3, angle: '120^\\circ', cos: '-\\frac12' },
      { a: 13, b: 8, c: 7, angle: '120^\\circ', cos: '-\\frac12' },
      { a: 7, b: 8, c: 5, angle: '60^\\circ', cos: '\\frac12' },
      { a: 5, b: 5, c: 6, angle: '約 \\(53.1^\\circ\\)', cos: '\\frac{3}{5}' },
      { a: 8, b: 7, c: 5, angle: '銳角', cos: '\\frac{1}{7}' },
      { a: 9, b: 7, c: 5, angle: '鈍角', cos: '-\\frac{1}{10}' },
      { a: 6, b: 5, c: 4, angle: '銳角', cos: '\\frac{1}{8}' },
      { a: 11, b: 8, c: 7, angle: '鈍角', cos: '-\\frac{1}{14}' },
      { a: 4, b: 5, c: 6, angle: '銳角', cos: '\\frac{3}{4}' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(triples);
      const scale = s242Pick([1, 2, 3, 4]);
      questions.push(
        `在 \\(\\triangle ABC\\) 中，已知 \\(a=${item.a * scale}\\)、\\(b=${item.b * scale}\\)、\\(c=${item.c * scale}\\)，求 \\(\\cos A\\) 並判斷 \\(\\angle A\\) 的類型。`
      );
      const type = item.cos.startsWith('-') ? '鈍角' : item.cos === '0' ? '直角' : '銳角';
      answers.push(
        `簡答：\\(\\cos A=${item.cos}\\)，\\(\\angle A\\) 為${type}。過程：\\(\\cos A=\\frac{b^2+c^2-a^2}{2bc}\\)。代入三邊得 \\(\\cos A=${item.cos}\\)，再由正負判斷角的類型。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242AlgebraicSideRelationSet(count) {
    const cases = [
      { k: 1, angle: '120^\\circ', cos: '-\\frac12' },
      { k: 2, angle: '90^\\circ', cos: '0' },
      { k: 3, angle: '60^\\circ', cos: '\\frac12' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const letter = s242Pick(['A', 'B', 'C']);
      const wording = s242Pick(['邊長關係', '代數條件', '三邊長']);
      const pair = letter === 'A' ? ['b', 'c', 'a'] : letter === 'B' ? ['c', 'a', 'b'] : ['a', 'b', 'c'];
      const coefficient = item.k === 1 ? '' : String(item.k);
      questions.push(
        `若 \\(\\triangle ABC\\) 的${wording}滿足 \\((${pair[2]}+${pair[0]}+${pair[1]})(${pair[0]}+${pair[1]}-${pair[2]})=${coefficient}${pair[0]}${pair[1]}\\)，求 \\(\\angle ${letter}\\) 的度數。`
      );
      answers.push(
        `簡答：\\(\\angle ${letter}=${item.angle}\\)。過程：左式為 \\((${pair[0]}+${pair[1]})^2-${pair[2]}^2=${pair[0]}^2+${pair[1]}^2-${pair[2]}^2+2${pair[0]}${pair[1]}\\)。由條件得 \\(${pair[0]}^2+${pair[1]}^2-${pair[2]}^2=(${item.k}-2)${pair[0]}${pair[1]}\\)，所以 \\(\\cos ${letter}=${item.cos}\\)，故 \\(\\angle ${letter}=${item.angle}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242TriangleShapeSet(count) {
    const cases = [
      { sides: [3, 4, 5], ans: '直角三角形', why: '\\(3^2+4^2=5^2\\)' },
      { sides: [4, 5, 6], ans: '銳角三角形', why: '\\(4^2+5^2>6^2\\)' },
      { sides: [3, 5, 7], ans: '鈍角三角形', why: '\\(3^2+5^2<7^2\\)' },
      { sides: [5, 5, 6], ans: '等腰銳角三角形', why: '有兩邊相等且 \\(5^2+5^2>6^2\\)' },
      { sides: [5, 12, 13], ans: '直角三角形', why: '\\(5^2+12^2=13^2\\)' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3, 4]);
      questions.push(`三角形三邊長分別為 ${item.sides.map((value) => value * scale).join('、')}，判斷此三角形的形狀。`);
      answers.push(`簡答：${item.ans}。過程：先取最大邊檢查平方關係；${item.why}，因此判定為${item.ans}。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242CyclicQuadrilateralDiagonalSet(count) {
    const cases = [
      { AB: 3, BC: 4, CD: 5, DA: 6, angleB: 60 },
      { AB: 4, BC: 5, CD: 6, DA: 7, angleB: 120 },
      { AB: 5, BC: 5, CD: 4, DA: 6, angleB: 60 },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const cos = item.angleB === 60 ? 1 / 2 : -1 / 2;
      const ac2 = item.AB * item.AB + item.BC * item.BC - 2 * item.AB * item.BC * cos;
      const dAngle = 180 - item.angleB;
      const scale = s242Pick([1, 2, 3, 4]);
      const acText = s241SqrtCoeff(scale, 1, ac2);
      questions.push(
        `圓內接四邊形 \\(ABCD\\) 中，\\(AB=${item.AB * scale}\\)、\\(BC=${item.BC * scale}\\)、\\(\\angle ABC=${item.angleB}^\\circ\\)，求對角線 \\(AC\\) 的長度，並寫出 \\(\\angle ADC\\)。`
      );
      answers.push(
        `簡答：\\(AC=${acText}\\)，\\(\\angle ADC=${dAngle}^\\circ\\)。過程：在 \\(\\triangle ABC\\) 用餘弦定理得 \\(AC^2=${scale * scale * ac2}\\)。又圓內接四邊形對角互補，所以 \\(\\angle ADC=180^\\circ-${item.angleB}^\\circ=${dAngle}^\\circ\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242TwoSideAngleAreaSet(count) {
    const angles = [30, 45, 60, 90, 120, 150];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const b = s242Pick([4, 6, 8, 10, 12]);
      const c = s242Pick([3, 5, 6, 7, 9]);
      const A = s242Pick(angles);
      const area = s241SqrtCoeff(b * c * S241_TRIG[A].sin[0], 2 * S241_TRIG[A].sin[1], S241_TRIG[A].sin[2]);
      questions.push(`在 \\(\\triangle ABC\\) 中，\\(AB=${c}\\)、\\(AC=${b}\\)、\\(\\angle A=${A}^\\circ\\)，求面積。`);
      answers.push(
        `簡答：\\(\\Delta=${area}\\)。過程：兩邊夾角面積公式 \\(\\Delta=\\frac12bc\\sin A\\)。代入得 \\(\\Delta=\\frac12\\cdot${b}\\cdot${c}\\cdot\\sin${A}^\\circ=${area}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242HeronAreaSet(count) {
    const cases = [
      { sides: [3, 4, 5], areaCoeff: 6, areaRad: 1 },
      { sides: [5, 5, 6], areaCoeff: 12, areaRad: 1 },
      { sides: [5, 6, 7], areaCoeff: 6, areaRad: 6 },
      { sides: [6, 8, 10], areaCoeff: 24, areaRad: 1 },
      { sides: [13, 14, 15], areaCoeff: 84, areaRad: 1 },
      { sides: [10, 9, 17], areaCoeff: 36, areaRad: 1 },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3, 4]);
      const sides = item.sides.map((value) => value * scale);
      const s = sides.reduce((a, b) => a + b, 0) / 2;
      const area = s241SqrtCoeff(item.areaCoeff * scale * scale, 1, item.areaRad);
      questions.push(`已知 \\(\\triangle ABC\\) 三邊長為 ${sides.join('、')}，利用海龍公式求面積。`);
      answers.push(
        `簡答：\\(\\Delta=${area}\\)。過程：半周長 \\(s=${s}\\)，海龍公式 \\(\\Delta=\\sqrt{s(s-a)(s-b)(s-c)}\\)。此題可視為基本邊組放大 ${scale} 倍，面積放大 ${scale * scale} 倍，得 \\(${area}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242InradiusCircumradiusSet(count) {
    const cases = [
      { sides: [3, 4, 5], r: [1, 1], R: [5, 2] },
      { sides: [5, 5, 6], r: [3, 2], R: [25, 8] },
      { sides: [6, 8, 10], r: [2, 1], R: [5, 1] },
      { sides: [13, 14, 15], r: [4, 1], R: [65, 8] },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3, 4]);
      const sides = item.sides.map((value) => value * scale);
      const s = sides.reduce((a, b) => a + b, 0) / 2;
      const rText = formatFraction(item.r[0] * scale, item.r[1]);
      const RText = formatFraction(item.R[0] * scale, item.R[1]);
      questions.push(
        `已知 \\(\\triangle ABC\\) 三邊長為 ${sides.join('、')}，求內切圓半徑 \\(r\\) 與外接圓半徑 \\(R\\)。`
      );
      answers.push(
        `簡答：\\(r=${rText}\\)，\\(R=${RText}\\)。過程：先由海龍公式得面積，半周長為 \\(s=${s}\\)。內切圓半徑 \\(r=\\frac{\\Delta}{s}\\)，外接圓半徑 \\(R=\\frac{abc}{4\\Delta}\\)。邊長放大 ${scale} 倍時，兩個半徑也放大 ${scale} 倍。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242CyclicQuadrilateralAreaSet(count) {
    const cases = [
      { sides: [4, 3, 3, 2], areaCoeff: 6, areaRad: 2 },
      { sides: [1, 2, 3, 4], areaCoeff: 2, areaRad: 6 },
      { sides: [2, 3, 4, 5], areaCoeff: 2, areaRad: 30 },
      { sides: [3, 3, 5, 5], areaCoeff: 15, areaRad: 1 },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3]);
      const sides = item.sides.map((value) => value * scale);
      const s = sides.reduce((a, b) => a + b, 0) / 2;
      const area = s241SqrtCoeff(item.areaCoeff * scale * scale, 1, item.areaRad);
      questions.push(`圓內接四邊形四邊長依序為 ${sides.join('、')}，求其面積。`);
      answers.push(
        `簡答：\\(${area}\\)。過程：圓內接四邊形可用婆羅摩笈多公式 \\(K=\\sqrt{(s-a)(s-b)(s-c)(s-d)}\\)。半周長 \\(s=${s}\\)；也可視為基本邊組放大 ${scale} 倍，面積放大 ${scale * scale} 倍。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242DiagonalAreaExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const d1 = s242Pick([4, 6, 8, 10, 12]);
      const d2 = s242Pick([5, 7, 9, 11]);
      const angle = s242Pick([30, 45, 60, 90, 120, 150]);
      const area = s241SqrtCoeff(
        d1 * d2 * S241_TRIG[angle].sin[0],
        2 * S241_TRIG[angle].sin[1],
        S241_TRIG[angle].sin[2]
      );
      if (i % 2 === 0) {
        questions.push(`已知四邊形兩對角線長為 ${d1} 與 ${d2}，夾角為 \\(${angle}^\\circ\\)，求此四邊形面積。`);
        answers.push(
          `簡答：\\(${area}\\)。過程：四邊形面積 \\(K=\\frac12d_1d_2\\sin\\theta\\)。代入得 \\(K=${area}\\)。`
        );
      } else {
        questions.push(`若四邊形兩對角線長固定為 ${d1} 與 ${d2}，求其面積最大值。`);
        answers.push(
          `簡答：\\(${formatFraction(d1 * d2, 2)}\\)。過程：\\(K=\\frac12d_1d_2\\sin\\theta\\)，當 \\(\\sin\\theta=1\\)，也就是對角線垂直時，面積最大為 \\(\\frac12\\cdot${d1}\\cdot${d2}=${formatFraction(d1 * d2, 2)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242MedianLengthSet(count) {
    const cases = [
      { a: 5, b: 7, c: 8, m2: 201 },
      { a: 6, b: 8, c: 10, m2: 292 },
      { a: 7, b: 5, c: 6, m2: 73 },
      { a: 8, b: 6, c: 9, m2: 170 },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3]);
      const mText = s241SqrtCoeff(scale, 2, item.m2);
      questions.push(
        `\\(\\triangle ABC\\) 中，\\(a=${item.a * scale}\\)、\\(b=${item.b * scale}\\)、\\(c=${item.c * scale}\\)，求 \\(BC\\) 邊上的中線長 \\(m_a\\)。`
      );
      answers.push(
        `簡答：\\(m_a=${mText}\\)。過程：中線公式 \\(m_a=\\frac12\\sqrt{2b^2+2c^2-a^2}\\)。代入三邊後化簡得 \\(m_a=${mText}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242AngleBisectorLengthSet(count) {
    const cases = [
      { A: 60, b: 12, c: 6 },
      { A: 60, b: 8, c: 6 },
      { A: 120, b: 4, c: 3 },
      { A: 60, b: 10, c: 5 },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3]);
      const cosHalf = item.A === 60 ? [1, 2, 3] : [1, 2, 1];
      const len = s241SqrtCoeff(2 * item.b * item.c * scale * cosHalf[0], (item.b + item.c) * cosHalf[1], cosHalf[2]);
      questions.push(
        `\\(\\triangle ABC\\) 中，\\(\\angle A=${item.A}^\\circ\\)、\\(AB=${item.c * scale}\\)、\\(AC=${item.b * scale}\\)，求內角平分線 \\(AD\\) 的長度。`
      );
      answers.push(
        `簡答：\\(AD=${len}\\)。過程：\\(AD=\\frac{2bc\\cos(A/2)}{b+c}\\)。代入 \\(b=${item.b * scale}\\)、\\(c=${item.c * scale}\\)、\\(A=${item.A}^\\circ\\)，得 \\(AD=${len}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242HeightProjectionSet(count) {
    const cases = [
      { hyp: 5, leg1: 3, leg2: 4, h: [12, 5] },
      { hyp: 13, leg1: 5, leg2: 12, h: [60, 13] },
      { hyp: 17, leg1: 8, leg2: 15, h: [120, 17] },
      { hyp: 25, leg1: 7, leg2: 24, h: [168, 25] },
      { hyp: 29, leg1: 20, leg2: 21, h: [420, 29] },
      { hyp: 41, leg1: 9, leg2: 40, h: [360, 41] },
      { hyp: 37, leg1: 12, leg2: 35, h: [420, 37] },
      { hyp: 53, leg1: 28, leg2: 45, h: [1260, 53] },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3, 4, 5]);
      const hText = formatFraction(item.h[0] * scale, item.h[1]);
      questions.push(
        `直角 \\(\\triangle ABC\\) 中，\\(\\angle C=90^\\circ\\)，兩股長為 ${item.leg1 * scale} 與 ${item.leg2 * scale}，求斜邊上的高。`
      );
      answers.push(
        `簡答：\\(${hText}\\)。過程：面積可寫成 \\(\\frac12\\cdot${item.leg1 * scale}\\cdot${item.leg2 * scale}\\)，也可寫成 \\(\\frac12\\cdot${item.hyp * scale}\\cdot h\\)。所以 \\(h=${hText}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242ParallelogramDiagonalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = s242Pick([4, 5, 6, 8]);
      const b = s242Pick([5, 7, 9]);
      const d1 = s242Pick([6, 8, 10]);
      const d2sq = 2 * (a * a + b * b) - d1 * d1;
      if (d2sq <= 0) {
        i -= 1;
        continue;
      }
      questions.push(`已知平行四邊形兩鄰邊長為 ${a} 與 ${b}，其中一條對角線長為 ${d1}，求另一條對角線長。`);
      answers.push(
        `簡答：\\(${formatRadical(d2sq)}\\)。過程：平行四邊形定理 \\(d_1^2+d_2^2=2(a^2+b^2)\\)。代入得 \\(d_2^2=2(${a}^2+${b}^2)-${d1}^2=${d2sq}\\)，故另一條對角線為 \\(${formatRadical(d2sq)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242TrapezoidAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const top = s242Pick([4, 5, 6, 8]);
      const bottom = top + s242Pick([4, 6, 8, 10]);
      const height = s242Pick([3, 4, 5, 6]);
      const area = ((top + bottom) * height) / 2;
      questions.push(`梯形上底為 ${top}、下底為 ${bottom}、高為 ${height}，求梯形面積。`);
      answers.push(
        `簡答：\\(${area}\\)。過程：梯形面積 \\(K=\\frac{(上底+下底)\\times 高}{2}=\\frac{(${top}+${bottom})\\cdot${height}}2=${area}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242SineLawFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS242SineSideRatioSet,
        buildS242AsaAasSet,
        buildS242CircumradiusSet,
        buildS242SsaAmbiguousSet,
        buildS242AltitudeSineRatioSet,
      ],
      count
    );
  }

  function buildS242CosineLawFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS242CosineSasSet,
        buildS242CosineSssAngleSet,
        buildS242AlgebraicSideRelationSet,
        buildS242TriangleShapeSet,
        buildS242CyclicQuadrilateralDiagonalSet,
      ],
      count
    );
  }

  function buildS242AreaRadiusFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS242TwoSideAngleAreaSet,
        buildS242HeronAreaSet,
        buildS242InradiusCircumradiusSet,
        buildS242CyclicQuadrilateralAreaSet,
        buildS242DiagonalAreaExtremaSet,
      ],
      count
    );
  }

  function buildS242SpecialSegmentFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS242MedianLengthSet,
        buildS242AngleBisectorLengthSet,
        buildS242HeightProjectionSet,
        buildS242ParallelogramDiagonalSet,
        buildS242TrapezoidAreaSet,
      ],
      count
    );
  }

  function buildS242SineSideRatioSubtypeSet(count) {
    return buildS242SineSideRatioSet(count);
  }

  function buildS242AsaAasSubtypeSet(count) {
    return buildS242AsaAasSet(count);
  }

  function buildS242CircumradiusSubtypeSet(count) {
    return buildS242CircumradiusSet(count);
  }

  function buildS242SsaAmbiguousSubtypeSet(count) {
    return buildS242SsaAmbiguousSet(count);
  }

  function buildS242AltitudeSineRatioSubtypeSet(count) {
    return buildS242AltitudeSineRatioSet(count);
  }

  function buildS242CosineSasSubtypeSet(count) {
    return buildS242CosineSasSet(count);
  }

  function buildS242CosineSssAngleSubtypeSet(count) {
    return buildS242CosineSssAngleSet(count);
  }

  function buildS242AlgebraicSideRelationSubtypeSet(count) {
    return buildS242AlgebraicSideRelationSet(count);
  }

  function buildS242TriangleShapeSubtypeSet(count) {
    return buildS242TriangleShapeSet(count);
  }

  function buildS242CyclicQuadrilateralDiagonalSubtypeSet(count) {
    return buildS242CyclicQuadrilateralDiagonalSet(count);
  }

  function buildS242TwoSideAngleAreaSubtypeSet(count) {
    return buildS242TwoSideAngleAreaSet(count);
  }

  function buildS242HeronAreaSubtypeSet(count) {
    return buildS242HeronAreaSet(count);
  }

  function buildS242InradiusCircumradiusSubtypeSet(count) {
    return buildS242InradiusCircumradiusSet(count);
  }

  function buildS242CyclicQuadrilateralAreaSubtypeSet(count) {
    return buildS242CyclicQuadrilateralAreaSet(count);
  }

  function buildS242DiagonalAreaExtremaSubtypeSet(count) {
    return buildS242DiagonalAreaExtremaSet(count);
  }

  function buildS242MedianLengthSubtypeSet(count) {
    return buildS242MedianLengthSet(count);
  }

  function buildS242AngleBisectorLengthSubtypeSet(count) {
    return buildS242AngleBisectorLengthSet(count);
  }

  function buildS242HeightProjectionSubtypeSet(count) {
    return buildS242HeightProjectionSet(count);
  }

  function buildS242ParallelogramDiagonalSubtypeSet(count) {
    return buildS242ParallelogramDiagonalSet(count);
  }

  function buildS242TrapezoidAreaSubtypeSet(count) {
    return buildS242TrapezoidAreaSet(count);
  }

  function s243CosineLengthText(a, b, angle) {
    const cosNum = S241_TRIG[angle].cos[0];
    const cosDen = S241_TRIG[angle].cos[1];
    const rad = S241_TRIG[angle].cos[2];
    if (rad !== 1) return null;
    const value = a * a + b * b - (2 * a * b * cosNum) / cosDen;
    if (!Number.isInteger(value) || value <= 0) return null;
    return { square: value, text: formatRadical(value) };
  }

  function buildS243AsaCrossDistanceSet(count) {
    const cases = [
      {
        base: 120,
        A: 45,
        B: 60,
        answer(scale) {
          return `${120 * scale}(\\sqrt{3}-1)`;
        },
        target: '目標 \(C\) 到右端觀測點 \(B\) 的距離',
      },
      {
        base: 100,
        A: 68,
        B: 30,
        answer(scale) {
          return `\\frac{${100 * scale}\\sin 68^\\circ}{\\sin 82^\\circ}`;
        },
        target: '小島 \(C\) 到右端觀測點 \(B\) 的距離',
      },
      {
        base: 200,
        A: 30,
        B: 55,
        answer(scale) {
          return `\\frac{${200 * scale}\\sin 30^\\circ}{\\sin 95^\\circ}`;
        },
        target: '目標 \(C\) 到右端觀測點 \(B\) 的距離',
      },
      {
        base: 160,
        A: 45,
        B: 45,
        answer(scale) {
          return `${80 * scale}\\sqrt{2}`;
        },
        target: '目標 \(C\) 到左端觀測點 \(A\) 的距離',
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      // 一半機率取特殊角案例（答案可化簡），一半機率隨機角度（答案保留正弦式）。
      if (randInt(0, 1) === 0) {
        const item = s242Pick(cases);
        const scale = s242Pick([1, 2, 3, 4]);
        const base = item.base * scale;
        const ans = item.answer(scale);
        questions.push(
          `岸邊取基線 \\(AB=${base}\\) 公尺，觀測對岸目標 \\(C\\)，已知 \\(\\angle CAB=${item.A}^\\circ\\)、\\(\\angle CBA=${item.B}^\\circ\\)，求${item.target}。`
        );
        answers.push(
          `簡答：\\(${ans}\\) 公尺。過程：先得 \\(\\angle C=180^\\circ-${item.A}^\\circ-${item.B}^\\circ\\)。由正弦定理，所求邊可用 \\(\\frac{AB}{\\sin C}\\) 與對應角的正弦相乘；代入基線與兩端角即可得到 \\(${ans}\\)。`
        );
      } else {
        const A = 5 * randInt(5, 14);
        let B = 5 * randInt(5, 14);
        for (let retry = 0; retry < 10 && A + B >= 155; retry += 1) B = 5 * randInt(5, 14);
        if (A + B >= 155) B = 150 - A;
        const base = 10 * randInt(5, 30);
        const ans = `\\frac{${base}\\sin ${A}^\\circ}{\\sin ${A + B}^\\circ}`;
        questions.push(
          `岸邊取基線 \\(AB=${base}\\) 公尺，觀測對岸目標 \\(C\\)，已知 \\(\\angle CAB=${A}^\\circ\\)、\\(\\angle CBA=${B}^\\circ\\)，求目標 \\(C\\) 到右端觀測點 \\(B\\) 的距離。`
        );
        answers.push(
          `簡答：\\(${ans}\\) 公尺。過程：先得 \\(\\angle C=180^\\circ-${A}^\\circ-${B}^\\circ=${180 - A - B}^\\circ\\)。由正弦定理 \\(\\frac{BC}{\\sin A}=\\frac{AB}{\\sin C}\\)，且 \\(\\sin(180^\\circ-${A + B}^\\circ)=\\sin ${A + B}^\\circ\\)，得 \\(BC=${ans}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243SasCrossDistanceSet(count) {
    const angles = [60, 90, 120];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = s242Pick([50, 80, 100, 120, 150]);
      const b = s242Pick([60, 90, 110, 140, 160]);
      const angle = s242Pick(angles);
      const len = s243CosineLengthText(a, b, angle);
      if (!len) {
        i -= 1;
        continue;
      }
      questions.push(
        `觀測員在 \\(C\\) 點量得兩個不可直接到達的目標 \\(A,B\\)，\\(AC=${a}\\) 公尺、\\(BC=${b}\\) 公尺，且 \\(\\angle ACB=${angle}^\\circ\\)，求 \\(AB\\) 距離。`
      );
      answers.push(
        `簡答：\\(${len.text}\\) 公尺。過程：這是兩邊一夾角，使用餘弦定理 \\(AB^2=AC^2+BC^2-2\\cdot AC\\cdot BC\\cos C\\)。代入得 \\(AB^2=${len.square}\\)，所以 \\(AB=${len.text}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243SlopeDoubleObservationSet(count) {
    const cases = [
      { d: 100, a: 30, b: 60, h: '50\\sqrt{3}' },
      { d: 200, a: 45, b: 75, h: '100(1+\\sqrt{3})' },
      { d: 120, a: 30, b: 45, h: '60(1+\\sqrt{3})' },
      { d: 80, a: 45, b: 60, h: '40(3+\\sqrt{3})' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3, 4]);
      questions.push(
        `某人沿地面朝山腳投影方向水平前進 ${item.d * scale} 公尺，仰角由 \\(${item.a}^\\circ\\) 變為 \\(${item.b}^\\circ\\)，求山頂相對於原水平線的高度。`
      );
      const h = item.h.replace(/^(\d+)/, (m) => String(Number(m) * scale));
      answers.push(
        `簡答：\\(${h}\\) 公尺。過程：設原位置到山腳投影的水平距離為 \\(x\\)，高度為 \\(h\\)。由 \\(h=x\\tan ${item.a}^\\circ=(x-${item.d * scale})\\tan ${item.b}^\\circ\\)，解出 \\(h=${h}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243SegmentedHeightSet(count) {
    const cases = [
      {
        d: 30,
        low: 45,
        high: 60,
        height(scale) {
          return `${30 * scale}(\\sqrt{3}-1)`;
        },
      },
      {
        d: 40,
        low: 30,
        high: 60,
        height(scale) {
          return `\\frac{${80 * scale}\\sqrt{3}}{3}`;
        },
      },
      {
        d: 50,
        low: 45,
        high: 60,
        height(scale) {
          return `${50 * scale}(\\sqrt{3}-1)`;
        },
      },
      {
        d: 60,
        low: 30,
        high: 45,
        height(scale) {
          return `${60 * scale}-${20 * scale}\\sqrt{3}`;
        },
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3]);
      const h = item.height(scale);
      questions.push(
        `在地面某點觀測一座建築，樓底仰角為 \\(${item.low}^\\circ\\)，樓頂仰角為 \\(${item.high}^\\circ\\)，觀測點到建築底部的水平距離為 ${item.d * scale} 公尺，求此段建築高度。`
      );
      answers.push(
        `簡答：\\(${h}\\) 公尺。過程：樓頂高度為 \\(d\\tan ${item.high}^\\circ\\)，樓底高度為 \\(d\\tan ${item.low}^\\circ\\)。兩者相減，得所求高度 \\(${h}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243ArbitraryDivisionLineSet(count) {
    const cases = [
      { AB: 5, AC: 5, BC: 5, BD: 1, DC: 4, d2: 21 },
      { AB: 7, AC: 3, BC: 5, BD: 1, DC: 4, d2: 37 },
      { AB: 6, AC: 4, BC: 5, BD: 2, DC: 3, d2: 22 },
      { AB: 9, AC: 6, BC: 5, BD: 4, DC: 1, d2: 41 },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3]);
      const ans = s241SqrtCoeff(scale, 1, item.d2);
      questions.push(
        `\\(\\triangle ABC\\) 中，\\(AB=${item.AB * scale}\\)、\\(AC=${item.AC * scale}\\)、\\(BC=${item.BC * scale}\\)。點 \\(D\\) 在 \\(BC\\) 上，且 \\(BD=${item.BD * scale}\\)、\\(DC=${item.DC * scale}\\)，求分線 \\(AD\\) 的長度。`
      );
      answers.push(
        `簡答：\\(AD=${ans}\\)。過程：用 Stewart 定理處理任意分點，\\(b^2m+c^2n=a(d^2+mn)\\)。代入三邊與分段長後解出 \\(AD=${ans}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243CommonElevationCircumradiusSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      let item;
      if (randInt(0, 1) === 0) {
        // 3-4-5 直角三角形（外接圓半徑 = 斜邊一半）
        const k = s242Pick([1, 2, 20, 40, 60, 100]);
        const theta = s242Pick([30, 45, 60]);
        const Rtext = k % 2 === 0 ? String((5 * k) / 2) : `\\frac{${5 * k}}{2}`;
        let h;
        if (theta === 30) h = k % 2 === 0 ? `\\frac{${(5 * k) / 2}\\sqrt{3}}{3}` : `\\frac{${5 * k}\\sqrt{3}}{6}`;
        else if (theta === 45) h = Rtext;
        else h = k % 2 === 0 ? `${(5 * k) / 2}\\sqrt{3}` : `\\frac{${5 * k}\\sqrt{3}}{2}`;
        item = { triangle: `${3 * k}、${4 * k}、${5 * k}`, R: Rtext, theta, h };
      } else {
        // 正三角形（R = s√3/3）
        const s = s242Pick([120, 150, 180, 210, 240, 300, 360]);
        const theta = s242Pick([30, 60]);
        const Rtext = `\\frac{${s}\\sqrt{3}}{3}`;
        const h = theta === 60 ? String(s) : s % 3 === 0 ? String(s / 3) : `\\frac{${s}}{3}`;
        item = { triangle: `${s}、${s}、${s}`, R: Rtext, theta, h };
      }
      const target = s242Pick(['塔頂', '山頂標誌', '無線電塔頂', '觀測氣球']);
      questions.push(
        `地面三點 \\(A,B,C\\) 對同一${target}的仰角都為 \\(${item.theta}^\\circ\\)，且 \\(\\triangle ABC\\) 的三邊長為 ${item.triangle} 公尺。求${target}高度。`
      );
      answers.push(
        `簡答：\\(${item.h}\\) 公尺。過程：三個觀測點仰角相同，目標底部投影到三點距離相同，因此投影點是 \\(\\triangle ABC\\) 的外心。水平距離為外接圓半徑 \\(R=${item.R}\\)，高度為 \\(R\\tan ${item.theta}^\\circ=${item.h}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243DepressionTwoTargetsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      let item;
      const template = randInt(0, 2);
      if (template === 0) {
        const n = s242Pick([100, 150, 200, 240, 300, 500, 1200, 2400]);
        item = { h: String(n), a: 45, b: 30, ans: `${n}(\\sqrt{3}-1)` };
      } else if (template === 1) {
        const c = s242Pick([50, 100, 150, 200, 250]);
        item = { h: `${c}\\sqrt{3}`, a: 60, b: 30, ans: String(2 * c) };
      } else {
        const c = s242Pick([60, 100, 120, 180, 240]);
        item = { h: `${c}\\sqrt{3}`, a: 60, b: 45, ans: `${c}(\\sqrt{3}-1)` };
      }
      const observer = s242Pick(['觀測點', '燈塔頂端', '觀景台', '高樓樓頂']);
      questions.push(
        `在高 \\(${item.h}\\) 公尺的${observer}，看到同一直線方向上的兩個地面目標，其俯角分別為 \\(${item.a}^\\circ\\)、\\(${item.b}^\\circ\\)。求兩目標間的水平距離。`
      );
      answers.push(
        `簡答：\\(${item.ans}\\) 公尺。過程：俯角等於仰角。到目標的水平距離分別為 \\(\\frac{h}{\\tan ${item.a}^\\circ}\\)、\\(\\frac{h}{\\tan ${item.b}^\\circ}\\)，相減即得 \\(${item.ans}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243SameElevationCircumcenterSet(count) {
    const cases = [
      { angle: 30, side: 300, known: '\\(\\angle ABC=45^\\circ\\)', R: '150\\sqrt{2}', h: '50\\sqrt{6}' },
      { angle: 15, side: 200, known: '\\(\\angle BAC=30^\\circ\\)', R: '200', h: '200(2-\\sqrt{3})' },
      { angle: 60, side: 500, known: '三邊長為 300、400、500', R: '250', h: '250\\sqrt{3}' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const target = s242Pick(['塔頂', '觀測氣球', '山頂標誌', '無線電塔頂']);
      questions.push(
        `地面三點對同一${target}的仰角均為 \\(${item.angle}^\\circ\\)，且觀測三角形的外接圓半徑為 \\(R=${item.R}\\)。求${target}高度。`
      );
      answers.push(
        `簡答：\\(${item.h}\\)。過程：仰角相同表示目標底部投影為觀測三角形外心，所以水平距離為 \\(R\\)。高度 \\(h=R\\tan ${item.angle}^\\circ=${item.h}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243OffsetCollinearObservationSet(count) {
    const units = [10, 20, 30, 40];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const unit = s242Pick(units);
      const abText = `${unit}(3-\\sqrt{3})`;
      const bcText = `${unit}(\\sqrt{3}-1)`;
      const heightText = `${unit}\\sqrt{3}`;
      const target = s242Pick([
        { base: '塔', sight: '塔頂' },
        { base: '旗桿', sight: '旗桿頂端' },
        { base: '高樓', sight: '高樓頂端' },
        { base: '繫留氣球', sight: '繫留氣球' },
      ]);
      questions.push(
        `地面共線三點 \\(A,B,C\\) 由遠到近依序位於${target.base}底部投影的同側，觀測${target.sight}的仰角依次為 \\(30^\\circ,45^\\circ,60^\\circ\\)。已知 \\(AB=${abText}\\) 公尺、\\(BC=${bcText}\\) 公尺，求${target.sight}高度。`
      );
      answers.push(
        `簡答：\\(${heightText}\\) 公尺。過程：設${target.base}底部投影為 \\(T\\)，高度為 \\(h\\)。由仰角得 \\(AT=\\sqrt{3}h\\)、\\(BT=h\\)、\\(CT=\\frac{h}{\\sqrt{3}}\\)。因此 \\(AB=(\\sqrt{3}-1)h=${abText}\\)，解得 \\(h=${heightText}\\)；並可驗證 \\(BC=h-\\frac{h}{\\sqrt{3}}=${bcText}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243SpatialMotionTrackingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const t = s242Pick([4, 5, 8, 10]);
      const m = s242Pick([40, 50, 60, 80, 100, 120]);
      const template = randInt(0, 2);
      let item;
      if (template === 0) {
        // 60°→30°：h=c√3 時 v=2c/t，取 c=t·m 使 v=2m。
        item = { h: `${t * m}\\sqrt{3}`, a: 60, b: 30, t, v: String(2 * m) };
      } else if (template === 1) {
        // 45°→30°：h=n 時 v=n(√3−1)/t，取 n=t·m 使 v=m(√3−1)。
        item = { h: String(t * m), a: 45, b: 30, t, v: `${m}(\\sqrt{3}-1)` };
      } else {
        // 60°→45°：水平距離差 h(1-1/√3)；取 h=t·m·√3，得 v=m(√3−1)。
        item = { h: `${t * m}\\sqrt{3}`, a: 60, b: 45, t, v: `${m}(\\sqrt{3}-1)` };
      }
      const object = s242Pick(['飛機', '無人機', '直升機', '觀測氣球']);
      questions.push(
        `${object}以固定高度沿通過觀測點與其地面投影的水平直線遠離觀測點，高度為 \\(${item.h}\\) 公尺，仰角由 \\(${item.a}^\\circ\\) 變為 \\(${item.b}^\\circ\\)，歷時 ${item.t} 秒。求${object}速率。`
      );
      answers.push(
        `簡答：\\(${item.v}\\) 公尺/秒。過程：水平距離為 \\(\\frac{h}{\\tan\\theta}\\)。兩次觀測的水平距離差除以時間，就是速率；代入 \\(${item.a}^\\circ\\)、\\(${item.b}^\\circ\\) 與 ${item.t} 秒，得 \\(${item.v}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243BearingNavigationSet(count) {
    const cases = [
      { d: 20, angle: 90, ans: '10\\sqrt{2}' },
      { d: 15, angle: 90, ans: '\\frac{15\\sqrt{2}}{2}' },
      { d: 20, angle: 120, ans: '\\frac{20\\sqrt{3}}{3}' },
      { d: 40, angle: 60, ans: '40' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const target = s242Pick(['島', '燈塔', '浮標', '雷達站']);
      questions.push(
        `一船由位置 \(A\) 向正北航行至位置 \(B\)，\(AB=${item.d}\) 公里。若兩次觀測到${target} \(C\) 的距離相同，且 \\(\\angle ACB=${item.angle}^\\circ\\)，求 \(AC=BC\) 的長度。`
      );
      answers.push(
        `簡答：\\(${item.ans}\\) 公里。過程：\\(\\triangle ABC\\) 為等腰三角形，底角均為 \\(\\frac{180^\\circ-${item.angle}^\\circ}{2}\\)。由正弦定理 \\(\\frac{AC}{\\sin((180^\\circ-${item.angle}^\\circ)/2)}=\\frac{${item.d}}{\\sin${item.angle}^\\circ}\\)，得 \\(AC=BC=${item.ans}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243PerpendicularBearingSet(count) {
    const cases = [
      { h: 150, a: 45, b: 45, ans: '150\\sqrt{2}' },
      { h: '100\\sqrt{3}', a: 60, b: 30, ans: '100\\sqrt{10}' },
      { h: 120, a: 45, b: 45, ans: '120\\sqrt{2}' },
      { h: '60\\sqrt{3}', a: 60, b: 60, ans: '60\\sqrt{2}' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const tower = s242Pick(['塔', '旗桿', '高樓', '觀測塔']);
      questions.push(
        `在${tower}的東方與南方各有一個觀測點，兩方向互相垂直。已知${tower}高 \\(${item.h}\\) 公尺，兩點觀測頂端的仰角分別為 \\(${item.a}^\\circ\\)、\\(${item.b}^\\circ\\)，求兩觀測點距離。`
      );
      answers.push(
        `簡答：\\(${item.ans}\\) 公尺。過程：兩觀測點到塔底的水平距離分別為 \\(\\frac{${item.h}}{\\tan ${item.a}^\\circ}\\)、\\(\\frac{${item.h}}{\\tan ${item.b}^\\circ}\\)。兩方向垂直，所以用畢氏定理求兩觀測點距離。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243TyphoonTrackingSet(count) {
    const cases = [
      { d: '100\\sqrt{3}', speed: '50\\sqrt{3}', ans: '2' },
      { d: 300, speed: 50, ans: '6' },
      { d: '200\\sqrt{3}', speed: '100\\sqrt{3}', ans: '2' },
      { d: 600, speed: 60, ans: '10' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const object = s242Pick(['颱風中心', '低氣壓中心', '暴風圈中心', '雷雨胞中心']);
      questions.push(
        `${object}目前距城市 \\(A\\) 為 \\(${item.d}\\) 公里，正沿通過城市 \(A\) 的直線以每小時 \\(${item.speed}\\) 公里朝城市前進。求抵達城市 \(A\) 所需時間。`
      );
      answers.push(
        `簡答：約 ${item.ans} 小時。過程：沿直線朝城市前進時，所需時間為距離除以速率，即 \\(\\frac{${item.d}}{${item.speed}}=${item.ans}\\)（小時）。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243UniformMotionAngleChangeSet(count) {
    const cases = [
      { h: '500\\sqrt{3}', from: 60, to: 30, t: 5, ans: '200' },
      { h: '200\\sqrt{3}', from: 30, to: 60, t: 10, ans: '40' },
      { h: 300, from: 45, to: 30, t: 5, ans: '60(\\sqrt{3}-1)' },
      { h: 600, from: 60, to: 45, t: 10, ans: '20(3-\\sqrt{3})' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const object = s242Pick(['物體', '無人機', '飛機', '觀測氣球']);
      const direction = item.to < item.from ? '遠離' : '朝向';
      questions.push(
        `一${object}以固定高度沿通過觀測點與其地面投影的水平直線${direction}觀測點，高度為 \\(${item.h}\\) 公尺，觀測仰角由 \\(${item.from}^\\circ\\) 變為 \\(${item.to}^\\circ\\)，歷時 ${item.t} 秒，求其水平速率。`
      );
      answers.push(
        `簡答：\\(${item.ans}\\) 公尺/秒。過程：每次觀測的水平距離都是 \\(\\frac{h}{\\tan\\theta}\\)。兩次水平距離差除以 ${item.t} 秒，即為水平速率。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243DynamicShortestDistanceSet(count) {
    const cases = [
      { D: 28, v1: 2, v2: 1, ans: '\\frac{28\\sqrt{5}}{5}' },
      { D: 20, v1: 3, v2: 4, ans: '16' },
      { D: 30, v1: 4, v2: 3, ans: '18' },
      { D: 50, v1: 5, v2: 12, ans: '\\frac{600}{13}' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const pair = s242Pick(['兩物體', '兩台車', '兩艘船', '兩個移動點']);
      const v2Term = item.v2 === 1 ? 't' : `${item.v2}t`;
      questions.push(
        `${pair}從相距 ${item.D} 公里的兩點出發。其中一個沿兩起點連線朝另一個起點前進，速率為 ${item.v1} 公里/時；另一個沿與該連線垂直的方向前進，速率為 ${item.v2} 公里/時。求兩者距離的最小值。`
      );
      answers.push(
        `簡答：\\(${item.ans}\\) 公里。過程：設時間為 \\(t\\)，距離平方可寫成 \\((${item.D}-${item.v1}t)^2+(${v2Term})^2\\)。這是一個二次式，配方或用頂點公式可得最小距離為 \\(${item.ans}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243AngleBisectorMeasurementSet(count) {
    return buildS242AngleBisectorLengthSet(count);
  }

  function buildS243MedianCentroidMeasurementSet(count) {
    const cases = [
      { a: 5, b: 7, c: 8, target: 'CA', vertex: 'B', m2: 129 },
      { a: 6, b: 8, c: 10, target: 'BC', vertex: 'A', m2: 292 },
      { a: 7, b: 5, c: 6, target: 'CA', vertex: 'B', m2: 145 },
      { a: 4, b: 6, c: 7, target: 'AB', vertex: 'C', m2: 55 },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3, 4]);
      const mText = s241SqrtCoeff(scale, 2, item.m2);
      questions.push(
        `\\(\\triangle ABC\\) 中，\\(BC=${item.a * scale}\\)、\\(CA=${item.b * scale}\\)、\\(AB=${item.c * scale}\\)，求 \\(${item.target}\\) 邊上的中線長；若重心為 \\(G\\)，再求 \\(${item.vertex}G\\)。`
      );
      answers.push(
        `簡答：中線長 \\(${mText}\\)，\\(${item.vertex}G=\\frac{2}{3}\\cdot ${mText}\\)。過程：中線公式為目標邊平方取負、另外兩邊平方各取兩倍後開根號再除以 2。重心把中線分成 \\(2:1\\)，所以 \\(${item.vertex}G=\\frac23\\) 倍中線長。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243DisplacementSegmentSet(count) {
    const cases = [
      { a: 60, b: 30, ans: '\\sqrt{3}' },
      { a: 30, b: 60, ans: '\\frac{\\sqrt{3}}{3}' },
      { a: 45, b: 45, ans: '1' },
      { a: 60, b: 60, ans: '\\frac{\\sqrt{3}}{3}' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const object = s242Pick(['物體', '觀測點', '光點', '移動點']);
      questions.push(
        `固定觀測點為 \(O\)。一${object}沿直線依序從 \(P\) 經 \(Q\) 到 \(R\)，且 \(PQ=QR\)、\\(\\angle POQ=${item.a}^\\circ\\)、\\(\\angle QOR=${item.b}^\\circ\\)。求 \\(\\tan\\angle OPQ\\)。`
      );
      answers.push(
        `簡答：\\(${item.ans}\\)。過程：設 \\(p=\\angle OPQ\\)。由 \(P,Q,R\) 共線可得另一端角為 \\(180^\\circ-${item.a}^\\circ-${item.b}^\\circ-p\\)。在兩個三角形套用正弦定理並用 \\(PQ=QR\\) 消去公共長度，再代入兩個觀測角，可得 \\(\\tan p=${item.ans}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243HeightProjectionStackSet(count) {
    return buildS243SegmentedHeightSet(count);
  }

  function buildS243BearingTargetDistanceSet(count) {
    return buildS243BearingNavigationSet(count);
  }

  function buildS243PlaneSurveyFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS243AsaCrossDistanceSet,
        buildS243SasCrossDistanceSet,
        buildS243SlopeDoubleObservationSet,
        buildS243SegmentedHeightSet,
        buildS243ArbitraryDivisionLineSet,
      ],
      count
    );
  }

  function buildS243ElevationSpatialFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS243CommonElevationCircumradiusSet,
        buildS243DepressionTwoTargetsSet,
        buildS243SameElevationCircumcenterSet,
        buildS243OffsetCollinearObservationSet,
        buildS243SpatialMotionTrackingSet,
      ],
      count
    );
  }

  function buildS243NavigationMotionFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS243BearingNavigationSet,
        buildS243PerpendicularBearingSet,
        buildS243TyphoonTrackingSet,
        buildS243UniformMotionAngleChangeSet,
        buildS243DynamicShortestDistanceSet,
      ],
      count
    );
  }

  function buildS243SpecialMeasurementFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS243AngleBisectorMeasurementSet,
        buildS243MedianCentroidMeasurementSet,
        buildS243DisplacementSegmentSet,
        buildS243HeightProjectionStackSet,
        buildS243BearingTargetDistanceSet,
      ],
      count
    );
  }

  function buildS243AsaCrossDistanceSubtypeSet(count) {
    return buildS243AsaCrossDistanceSet(count);
  }

  function buildS243SasCrossDistanceSubtypeSet(count) {
    return buildS243SasCrossDistanceSet(count);
  }

  function buildS243SlopeDoubleObservationSubtypeSet(count) {
    return buildS243SlopeDoubleObservationSet(count);
  }

  function buildS243SegmentedHeightSubtypeSet(count) {
    return buildS243SegmentedHeightSet(count);
  }

  function buildS243ArbitraryDivisionLineSubtypeSet(count) {
    return buildS243ArbitraryDivisionLineSet(count);
  }

  function buildS243CommonElevationCircumradiusSubtypeSet(count) {
    return buildS243CommonElevationCircumradiusSet(count);
  }

  function buildS243DepressionTwoTargetsSubtypeSet(count) {
    return buildS243DepressionTwoTargetsSet(count);
  }

  function buildS243SameElevationCircumcenterSubtypeSet(count) {
    return buildS243SameElevationCircumcenterSet(count);
  }

  function buildS243OffsetCollinearObservationSubtypeSet(count) {
    return buildS243OffsetCollinearObservationSet(count);
  }

  function buildS243SpatialMotionTrackingSubtypeSet(count) {
    return buildS243SpatialMotionTrackingSet(count);
  }

  function buildS243BearingNavigationSubtypeSet(count) {
    return buildS243BearingNavigationSet(count);
  }

  function buildS243PerpendicularBearingSubtypeSet(count) {
    return buildS243PerpendicularBearingSet(count);
  }

  function buildS243TyphoonTrackingSubtypeSet(count) {
    return buildS243TyphoonTrackingSet(count);
  }

  function buildS243UniformMotionAngleChangeSubtypeSet(count) {
    return buildS243UniformMotionAngleChangeSet(count);
  }

  function buildS243DynamicShortestDistanceSubtypeSet(count) {
    return buildS243DynamicShortestDistanceSet(count);
  }

  function buildS243AngleBisectorMeasurementSubtypeSet(count) {
    return buildS243AngleBisectorMeasurementSet(count);
  }

  function buildS243MedianCentroidMeasurementSubtypeSet(count) {
    return buildS243MedianCentroidMeasurementSet(count);
  }

  function buildS243DisplacementSegmentSubtypeSet(count) {
    return buildS243DisplacementSegmentSet(count);
  }

  function buildS243HeightProjectionStackSubtypeSet(count) {
    return buildS243HeightProjectionStackSet(count);
  }

  function buildS243BearingTargetDistanceSubtypeSet(count) {
    return buildS243BearingTargetDistanceSet(count);
  }

  function s24TrigApprox(entry) {
    if (!entry) return null;
    if (entry.length === 2) return entry[0] / entry[1];
    return (entry[0] * Math.sqrt(entry[2])) / entry[1];
  }

  function s24TrigNameValue(func, angle) {
    const value = S241_TRIG[angle][func];
    return `\\${func}${angle}^\\circ=${s241TrigLatex(value)}`;
  }

  function s24SignedValueText(value) {
    if (value === 0) return '0';
    return value > 0 ? `+${value}` : `${value}`;
  }

  function s24SignedTerm(coef, variable) {
    if (coef === 0) return '';
    const sign = coef > 0 ? '+' : '-';
    const n = Math.abs(coef);
    const body = n === 1 ? variable : `${n}${variable}`;
    return `${sign}${body}`;
  }

  function s24QuadraticFromRootsText(sumText, productText) {
    const middle = sumText === '0' ? '' : `-${sumText}t`;
    let product = '';
    if (productText !== '0') {
      product = productText.startsWith('-') ? productText : `+${productText}`;
    }
    return `t^2${middle}${product}=0`;
  }

  function s24LinearTrigText(sinCoef, cosCoef) {
    const first = sinCoef === 0 ? '' : `${sinCoef === 1 ? '' : sinCoef === -1 ? '-' : sinCoef}\\sin\\theta`;
    const second = s24SignedTerm(cosCoef, '\\cos\\theta');
    const raw = `${first}${second}`;
    return raw.startsWith('+') ? raw.slice(1) : raw;
  }

  function s24LinearTanText(coef, constant) {
    const tanPart = coef === 0 ? '' : `${coef === 1 ? '' : coef === -1 ? '-' : coef}\\tan\\theta`;
    if (constant === 0) return tanPart || '0';
    const raw = `${tanPart}${s24SignedValueText(constant)}`;
    return raw.startsWith('+') ? raw.slice(1) : raw;
  }

  function s24AngleLabel(angle) {
    return `${angle}^\\circ`;
  }

  function s24FormatDecimal(value, digits = 1) {
    return Number(value).toFixed(digits);
  }

  function buildS241TangentOrderingParameterizedSet(count) {
    const angleGroups = [
      [30, 210],
      [45, 225],
      [60, 240],
      [120, 300],
      [135, 315],
      [150, 330],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const picked = shuffle(angleGroups)
        .slice(0, 5)
        .map((group) => s241Pick(group));
      const sorted = picked.slice().sort((a, b) => s24TrigApprox(S241_TRIG[a].tan) - s24TrigApprox(S241_TRIG[b].tan));
      const values = sorted.map((angle) => s24TrigNameValue('tan', angle)).join('，');
      questions.push(`將下列正切值由小到大排列：\\(${picked.map((angle) => `\\tan${angle}^\\circ`).join('，')}\\)。`);
      answers.push(
        `簡答：\\(${sorted.map((angle) => `\\tan${angle}^\\circ`).join('<')}\\)。過程：先依象限判斷正負，再用特殊角正切值比較；\\(${values}\\)，所以由小到大如上。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241SinCosSumDifferenceParameterizedSet(count) {
    const triples = [
      { sin: [3, 5], cos: [4, 5] },
      { sin: [5, 13], cos: [12, 13] },
      { sin: [8, 17], cos: [15, 17] },
      { sin: [7, 25], cos: [24, 25] },
    ];
    const quadrants = [
      { name: '第一象限', sinSign: 1, cosSign: 1 },
      { name: '第二象限', sinSign: 1, cosSign: -1 },
      { name: '第三象限', sinSign: -1, cosSign: -1 },
      { name: '第四象限', sinSign: -1, cosSign: 1 },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const tri = s241Pick(triples);
      const quad = s241Pick(quadrants);
      const sinNum = quad.sinSign * tri.sin[0];
      const cosNum = quad.cosSign * tri.cos[0];
      const den = tri.sin[1];
      const useSum = i % 2 === 0;
      const givenNum = useSum ? sinNum + cosNum : sinNum - cosNum;
      const given = formatFraction(givenNum, den);
      const product = formatFraction(sinNum * cosNum, den * den);
      const other = useSum ? formatFraction(sinNum - cosNum, den) : formatFraction(sinNum + cosNum, den);
      questions.push(
        `已知 \\(\\theta\\) 在${quad.name}，且 \\(\\lvert\\sin\\theta\\rvert<\\lvert\\cos\\theta\\rvert\\)、\\(\\sin\\theta${useSum ? '+' : '-'}\\cos\\theta=${given}\\)，求 \\(\\sin\\theta\\cos\\theta\\) 與 \\(\\sin\\theta${useSum ? '-' : '+'}\\cos\\theta\\)。`
      );
      answers.push(
        `簡答：\\(\\sin\\theta\\cos\\theta=${product}\\)，\\(\\sin\\theta${useSum ? '-' : '+'}\\cos\\theta=${other}\\)。過程：由 \\((\\sin\\theta${useSum ? '+' : '-'}\\cos\\theta)^2=1${useSum ? '+' : '-'}2\\sin\\theta\\cos\\theta\\) 先求乘積，再依${quad.name}與 \\(\\lvert\\sin\\theta\\rvert<\\lvert\\cos\\theta\\rvert\\) 判斷 \\(\\sin\\theta=${formatFraction(sinNum, den)}\\)，\\(\\cos\\theta=${formatFraction(cosNum, den)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS241TangentExpressionParameterizedSet(count) {
    const tangentCases = [
      { quad: '第二象限', tan: [-3, 4] },
      { quad: '第二象限', tan: [-5, 12] },
      { quad: '第三象限', tan: [3, 4] },
      { quad: '第三象限', tan: [5, 12] },
      { quad: '第四象限', tan: [-4, 3] },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s241Pick(tangentCases);
      const [tn, td] = item.tan;
      const a = s241Pick([1, 2, 3, -2]);
      const b = s241Pick([1, 2, 3, -1]);
      const c = s241Pick([1, -1, 2]);
      const d = s241Pick([3, 4, 5, -2]);
      const numerator = a * tn + b * td;
      const denominator = c * tn + d * td;
      if (denominator === 0) {
        i -= 1;
        continue;
      }
      questions.push(
        `已知 \\(\\theta\\) 在${item.quad}，且 \\(\\tan\\theta=${formatFraction(tn, td)}\\)，求 \\(\\dfrac{${s24LinearTrigText(a, b)}}{${s24LinearTrigText(c, d)}}\\)。`
      );
      answers.push(
        `簡答：\\(${formatFraction(numerator, denominator)}\\)。過程：將分子、分母同除以 \\(\\cos\\theta\\)，原式變成 \\(\\dfrac{${s24LinearTanText(a, b)}}{${s24LinearTanText(c, d)}}\\)。代入 \\(\\tan\\theta=${formatFraction(tn, td)}\\)，得 \\(\\dfrac{${numerator}}{${denominator}}=${formatFraction(numerator, denominator)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242SideSumRatioSineRatioParameterizedSet(count) {
    const sideSets = [
      [3, 4, 5],
      [4, 5, 6],
      [5, 6, 7],
      [5, 7, 8],
      [6, 7, 9],
      [4, 6, 7],
      [5, 6, 8],
      [6, 8, 9],
      [7, 8, 10],
      [4, 7, 9],
      [5, 8, 9],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const sides = s242Pick(sideSets);
      const scale = s242Pick([1, 2, 3, 4]);
      const [a, b, c] = sides.map((value) => value * scale);
      const sums = [a + b, b + c, c + a];
      const sumGcd = sums.reduce((acc, value) => gcdInt(acc, Math.abs(value)), Math.abs(sums[0]) || 1);
      const ratioParts = sums.map((value) => value / sumGcd);
      const ratio = ratioParts.join(':');
      const answerRatio = s242RatioText([a, b, c]);
      questions.push(
        `在 \\(\\triangle ABC\\) 中，若 \\((a+b):(b+c):(c+a)=${ratio}\\)，且周長為 \\(${a + b + c}\\)，求 \\(\\sin A:\\sin B:\\sin C\\)。`
      );
      answers.push(
        `簡答：\\(${answerRatio}\\)。過程：設 \\(a+b=${ratioParts[0]}k\\)，\\(b+c=${ratioParts[1]}k\\)，\\(c+a=${ratioParts[2]}k\\)。相加減得 \\(a:b:c=${answerRatio}\\)。由正弦定理，\\(\\sin A:\\sin B:\\sin C=a:b:c=${answerRatio}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242SasSideAreaParameterizedSet(count) {
    const angles = [30, 45, 60, 90, 120];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const b = s242Pick([4, 5, 6, 8, 10, 12]);
      const c = s242Pick([3, 5, 7, 9, 11]);
      const A = s242Pick(angles);
      const cos = S241_TRIG[A].cos;
      const sin = S241_TRIG[A].sin;
      if (cos[2] !== 1) {
        i -= 1;
        continue;
      }
      const a2 = b * b + c * c - (2 * b * c * cos[0]) / cos[1];
      if (!Number.isInteger(a2) || a2 <= 0) {
        i -= 1;
        continue;
      }
      const area = s241SqrtCoeff(b * c * sin[0], 2 * sin[1], sin[2]);
      questions.push(
        `在 \\(\\triangle ABC\\) 中，已知 \\(b=${b}\\)、\\(c=${c}\\)、\\(\\angle A=${s24AngleLabel(A)}\\)，求 \\(a\\) 與三角形面積。`
      );
      answers.push(
        `簡答：\\(a=${formatRadical(a2)}\\)，面積 \\(=${area}\\)。過程：餘弦定理 \\(a^2=b^2+c^2-2bc\\cos A=${a2}\\)，所以 \\(a=${formatRadical(a2)}\\)。面積 \\(K=\\frac12bc\\sin A=${area}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS242IsoscelesCircumradiusParameterizedSet(count) {
    const cases = [
      {
        angle: 60,
        base(R) {
          return s241SqrtCoeff(R, 1, 3);
        },
        side(R) {
          return s241SqrtCoeff(R, 1, 3);
        },
        area(R) {
          return s241SqrtCoeff(3 * R * R, 4, 3);
        },
      },
      {
        angle: 90,
        base(R) {
          return `${2 * R}`;
        },
        side(R) {
          return s241SqrtCoeff(R, 1, 2);
        },
        area(R) {
          return `${R * R}`;
        },
      },
      {
        angle: 120,
        base(R) {
          return s241SqrtCoeff(R, 1, 3);
        },
        side(R) {
          return `${R}`;
        },
        area(R) {
          return s241SqrtCoeff(R * R, 4, 3);
        },
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const R = s242Pick([4, 6, 8, 10, 12]);
      questions.push(
        `等腰 \\(\\triangle ABC\\) 中，\\(AB=AC\\)，頂角 \\(\\angle A=${item.angle}^\\circ\\)，外接圓半徑為 \\(${R}\\)。求底邊 \\(BC\\) 與面積。`
      );
      answers.push(
        `簡答：\\(BC=${item.base(R)}\\)，面積 \\(=${item.area(R)}\\)。過程：由正弦定理 \\(a=2R\\sin A\\)，所以底邊 \\(BC=${item.base(R)}\\)。腰長 \\(AB=AC=${item.side(R)}\\)，再用 \\(K=\\frac12 AB\\cdot AC\\sin A\\) 得面積 \\(${item.area(R)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243TwoObservationHeightParameterizedSet(count) {
    const cases = [
      {
        d: 100,
        first: 30,
        second: 60,
        height(scale) {
          return `${50 * scale}\\sqrt{3}`;
        },
      },
      {
        d: 80,
        first: 45,
        second: 60,
        height(scale) {
          return `${40 * scale}(3+\\sqrt{3})`;
        },
      },
      {
        d: 120,
        first: 30,
        second: 45,
        height(scale) {
          return `${60 * scale}(1+\\sqrt{3})`;
        },
      },
      {
        d: 60,
        first: 45,
        second: 60,
        height(scale) {
          return `${30 * scale}(3+\\sqrt{3})`;
        },
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3]);
      const d = item.d * scale;
      const height = item.height(scale);
      questions.push(
        `某人觀測一座垂直建築物，第一次仰角為 \\(${item.first}^\\circ\\)，沿地面朝建築物底部水平前進 \\(${d}\\) 公尺後，仰角變為 \\(${item.second}^\\circ\\)。求建築物高度。`
      );
      answers.push(
        `簡答：\\(${height}\\) 公尺。過程：設第一次觀測點到建築物底部距離為 \\(x\\)，高度為 \\(h\\)。則 \\(h=x\\tan${item.first}^\\circ=(x-${d})\\tan${item.second}^\\circ\\)，解得 \\(h=${height}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243BearingCosineDistanceParameterizedSet(count) {
    const angles = [60, 90, 120];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const r1 = s242Pick([100, 150, 200, 300, 400]);
      const r2 = s242Pick([120, 180, 240, 300, 500]);
      const angle = s242Pick(angles);
      const len = s243CosineLengthText(r1, r2, angle);
      if (!len) {
        i -= 1;
        continue;
      }
      questions.push(
        `觀測點 \\(O\\) 測得船 \\(A\\) 距離 \\(${r1}\\) 公尺、船 \\(B\\) 距離 \\(${r2}\\) 公尺，且 \\(\\angle AOB=${angle}^\\circ\\)。求兩船距離 \\(AB\\)。`
      );
      answers.push(
        `簡答：\\(${len.text}\\) 公尺。過程：由餘弦定理，\\(AB^2=${r1}^2+${r2}^2-2\\cdot${r1}\\cdot${r2}\\cos${angle}^\\circ=${len.square}\\)，所以 \\(AB=${len.text}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS243HeightLimitFloorsParameterizedSet(count) {
    const cases = [
      { distanceKm: 3, tan: 0.1405, floorHeight: 5, angle: 8 },
      { distanceKm: 2, tan: 0.1763, floorHeight: 4, angle: 10 },
      { distanceKm: 5, tan: 0.0875, floorHeight: 5, angle: 5 },
      { distanceKm: 4, tan: 0.2126, floorHeight: 4, angle: 12 },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const maxHeight = item.distanceKm * 1000 * item.tan;
      const reserve = s242Pick([0, 1, 2, 3]);
      const usableHeight = maxHeight - reserve;
      const reserveText = reserve > 0 ? `，屋頂設備須預留 \\(${reserve}\\) 公尺高度` : '';
      const floors = Math.floor(usableHeight / item.floorHeight);
      questions.push(
        `某機場規定附近建築物頂端從機場中心看去的仰角不得超過 \\(${item.angle}^\\circ\\)。若基地離機場中心 \\(${item.distanceKm}\\) 公里，每層樓高 \\(${item.floorHeight}\\) 公尺${reserveText}，且 \\(\\tan${item.angle}^\\circ\\approx${item.tan}\\)，最多可蓋幾層？`
      );
      answers.push(
        `簡答：\\(${floors}\\) 層。過程：最高高度約為 \\(${item.distanceKm * 1000}\\times${item.tan}=${s24FormatDecimal(maxHeight, 1)}\\) 公尺。扣除預留高度後可用高度為 \\(${s24FormatDecimal(usableHeight, 1)}\\) 公尺，每層 \\(${item.floorHeight}\\) 公尺，所以最多 \\(\\left\\lfloor ${s24FormatDecimal(usableHeight, 1)}/${item.floorHeight}\\right\\rfloor=${floors}\\) 層。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function fracTextForDisplay(frac) {
    return formatFraction(frac.num, frac.den);
  }

  function formatFunctionLinear(a, b, variable = 'x') {
    return formatLinearExpr(a, b).replaceAll('x', variable);
  }

  function fracText(numerator, denominator) {
    return `\\frac{${numerator}}{${denominator}}`;
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
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
    const text = String(detail || '').trim();
    if (!text) return text;
    const cleaned = text
      .replace(/^(?:簡答|答案)[:：]\s*[\s\S]*?(?:。|；|\n|<br\s*\/?>)?\s*((?:過程|解析|詳解|說明)[:：])/, '$1')
      .replace(/^(?:簡答|答案)[:：]\s*[^。；\n]*(?:。|；)?\s*/, '')
      .trim();
    return cleaned || text;
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
    answers.pushWithSummary = function pushAnswerWithExplicitSummary(summary, detail) {
      summaryAnswers.push(summary);
      return nativePush.call(this, stripSummaryPrefixFromDetail(detail));
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

  function resolvePracticeCount(count, fallback = 5) {
    const parsed = Number(count);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(1, Math.floor(parsed));
  }

  function mixedBankSampleCount(count, bankCount) {
    return Math.max(5, Math.ceil(resolvePracticeCount(count, 5) / Math.max(1, bankCount)) + 5);
  }

  function varyTemplateQuestion(question, itemIndex, templateCount, requestedCount) {
    if (resolvePracticeCount(requestedCount, 5) <= templateCount || itemIndex < templateCount) return question;
    const prompts = [
      '請依題意作答：',
      '請完整寫出結論：',
      '請先整理條件後求解：',
      '請用適當方法完成：',
      '請列式或說明理由：',
    ];
    const prompt = prompts[(Math.floor(itemIndex / templateCount) - 1) % prompts.length];
    return `${prompt}${question}`;
  }

  /* ============================================================
   * 新增小類（依三民版 S2-2 排列組合 / 機率期望值學生卷整理）
   * 以下 8 個 generator 皆使用 randInt/Math.random 進行真隨機參數化，
   * 每次呼叫 generate() 都會重新抽樣，不是固定樣板。
   * ============================================================ */

  function s221SignedTerm(coef, symbol) {
    if (coef === 0) return '';
    const abs = Math.abs(coef);
    const magnitude = symbol ? (abs === 1 ? symbol : `${abs}${symbol}`) : `${abs}`;
    return coef > 0 ? `+${magnitude}` : `-${magnitude}`;
  }

  function s221FormatQuadraticExpr(varName, p, r) {
    let out = `${varName}^{2}`;
    out += s221SignedTerm(p, varName);
    out += s221SignedTerm(r, '');
    return out;
  }

  /* ---------- 集合相等與差集求未知數 ---------- */
  function buildS221SetEqualityUnknownsParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2;

      if (variant === 0) {
        const c = randInt(1, 3);
        const x0 = randInt(-6, 9);
        const y0 = pickNonZero(-6, 9);
        const M = x0 + y0;
        const N = x0 - c * y0;
        const x1 = x0 + y0 * (1 - c);
        const y1 = -y0;
        const secondExpr = `x${s221SignedTerm(-c, 'y')}`;

        questions.push(
          `設 \\(A=\\{x+y,\\ ${secondExpr}\\}\\)，\\(B=\\{${M},\\ ${N}\\}\\)。若 \\(A=B\\)，求所有滿足條件的有序數對 \\((x,y)\\)，並說明共有幾組。`
        );
        answers.push(
          `簡答：共有 2 組，為 \\((${x0},${y0})\\) 與 \\((${x1},${y1})\\)。過程：因為 \\(A=B\\) 是「集合」相等，\\(x+y\\) 與 \\(${secondExpr}\\) 這兩個值必對應到 \\(\\{${M},${N}\\}\\) 中的某一種配對方式，共有兩種情形：情形一 \\(x+y=${M},\\ ${secondExpr}=${N}\\)，解得 \\((x,y)=(${x0},${y0})\\)；情形二 \\(x+y=${N},\\ ${secondExpr}=${M}\\)，解得 \\((x,y)=(${x1},${y1})\\)；兩組都能使 \\(x+y\\ne ${secondExpr}\\)（即兩元素相異），所以都成立，共 2 組。`
        );
        continue;
      }

      const pool = shuffle([-5, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 4);
      const [k1, k2, k3, k4] = pool;
      const a0 = randInt(-5, 6);
      let p = pickNonZero(-4, 4);
      let a1 = -p - a0;
      let guard = 0;
      while (a1 === a0 && guard < 8) {
        p += 1;
        a1 = -p - a0;
        guard += 1;
      }
      const r = k3 - a0 * a0 - p * a0;
      const exprText = s221FormatQuadraticExpr('a', p, r);
      const sumRoots = -p;
      // 確保 expr 只在等於 k3 時有整數解；若也等於 B 的其他元素或 k2，會有漏解，需重新生成
      let extraSolution = false;
      let k3RootCount = 0;
      for (let av = -60; av <= 60; av += 1) {
        const ev = av * av + p * av + r;
        if (ev === k3) k3RootCount += 1;
        else if (ev === k1 || ev === k2 || ev === k4) {
          extraSolution = true;
          break;
        }
      }
      if (extraSolution || k3RootCount !== 2) {
        i -= 1;
        continue;
      }

      questions.push(
        `設 \\(A=\\{${k1},\\ ${k2},\\ ${exprText}\\}\\)，\\(B=\\{${k1},\\ ${k3},\\ ${k4}\\}\\)。若 \\(A-B=\\{${k2}\\}\\)，求所有可能的 \\(a\\) 值之和。`
      );
      answers.push(
        `簡答：${sumRoots}。過程：\\(${k1}\\) 同時在 \\(A\\)、\\(B\\) 中，而 \\(A-B=\\{${k2}\\}\\) 表示 \\(A\\) 中只有 ${k2} 不在 \\(B\\) 中，所以 \\(${exprText}\\) 必等於 \\(B\\) 中剩下的元素 ${k3}。解方程式 \\(${exprText}=${k3}\\)，即 \\(a^{2}${s221SignedTerm(p, 'a')}${s221SignedTerm(r - k3, '')}=0\\)，由根與係數關係，兩根之和為 \\(-(${p})=${sumRoots}\\)。所以所有可能的 \\(a\\) 值之和為 ${sumRoots}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  /* ---------- 命題的等價敘述與否定 ---------- */
  const S221_PROPOSITION_CONDITION_BANK = [
    { p: '數學及格', notP: '數學不及格' },
    { p: '英文及格', notP: '英文不及格' },
    { p: '國文70分以上', notP: '國文未達70分' },
    { p: '準時到校', notP: '沒有準時到校' },
    { p: '完成作業', notP: '沒有完成作業' },
    { p: '通過體適能測驗', notP: '沒有通過體適能測驗' },
    { p: '參加社團活動', notP: '沒有參加社團活動' },
  ];
  const S221_PROPOSITION_NAME_BANK = ['小明', '小華', '小美', '阿聰', '佳佳', '阿翔', '小婷', '志豪'];

  function buildS221PropositionEquivalenceNegationParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2;
      const name = S221_PROPOSITION_NAME_BANK[randInt(0, S221_PROPOSITION_NAME_BANK.length - 1)];
      const [condA, condB] = shuffle(S221_PROPOSITION_CONDITION_BANK).slice(0, 2);

      if (variant === 0) {
        const original = `若${name}${condA.p}，則${name}${condB.p}`;
        const converse = `若${name}${condB.p}，則${name}${condA.p}`;
        const inverse = `若${name}${condA.notP}，則${name}${condB.notP}`;
        const contrapositive = `若${name}${condB.notP}，則${name}${condA.notP}`;

        const options = shuffle([
          { text: contrapositive, correct: true },
          { text: converse, correct: false },
          { text: inverse, correct: false },
          { text: `若${name}${condA.p}，則${name}${condB.notP}`, correct: false },
        ]);
        const letters = ['A', 'B', 'C', 'D'];
        const correctLetter = letters[options.findIndex((o) => o.correct)];
        const optionText = options.map((o, idx) => `(${letters[idx]}) ${o.text}`).join('　');

        questions.push(
          `原命題為「${original}」。下列哪一個選項是這個命題的逆否命題，且和原命題保證邏輯等價？\n${optionText}`
        );
        answers.push(
          `簡答：(${correctLetter})。過程：「若P則Q」的逆否命題是「若非Q則非P」，只有逆否命題保證和原命題邏輯等價（逆命題與否命題都不保證等價）。本題逆否命題為「${contrapositive}」，對應選項 (${correctLetter})。`
        );
        continue;
      }

      const useOr = i % 4 < 2;
      const compoundText = useOr ? `${condA.p}或${condB.p}` : `${condA.p}且${condB.p}`;
      const correctNegation = useOr ? `${condA.notP}且${condB.notP}` : `${condA.notP}或${condB.notP}`;
      const wrong1 = useOr ? `${condA.notP}或${condB.notP}` : `${condA.notP}且${condB.notP}`;
      const wrong2 = `${condA.p}且${condB.p}`;
      const wrong3 = `${condA.notP}且${condB.p}`;

      const options = shuffle([
        { text: `${name}${correctNegation}`, correct: true },
        { text: `${name}${wrong1}`, correct: false },
        { text: `${name}${wrong2}`, correct: false },
        { text: `${name}${wrong3}`, correct: false },
      ]);
      const letters = ['A', 'B', 'C', 'D'];
      const correctLetter = letters[options.findIndex((o) => o.correct)];
      const optionText = options.map((o, idx) => `(${letters[idx]}) ${o.text}`).join('　');

      questions.push(`敘述「${name}${compoundText}」。下列哪一個選項是這個敘述的正確否定？\n${optionText}`);
      answers.push(
        `簡答：(${correctLetter})。過程：由笛摩根定律，「P或Q」的否定是「非P且非Q」，「P且Q」的否定是「非P或非Q」。本題正確否定為「${name}${correctNegation}」，對應選項 (${correctLetter})。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  /* ---------- 棋盤格矩形計數與指定點 ---------- */
  function s222CountRectanglesTotal(m, n) {
    return combinationCount(m + 1, 2) * combinationCount(n + 1, 2);
  }
  function s222CountRectanglesContainingCells(m, n, cells) {
    let count = 0;
    for (let x1 = 0; x1 <= m; x1 += 1) {
      for (let x2 = x1 + 1; x2 <= m; x2 += 1) {
        for (let y1 = 0; y1 <= n; y1 += 1) {
          for (let y2 = y1 + 1; y2 <= n; y2 += 1) {
            const hit = cells.some(({ ci, cj }) => ci - 1 >= x1 && ci <= x2 && cj - 1 >= y1 && cj <= y2);
            if (hit) count += 1;
          }
        }
      }
    }
    return count;
  }

  function buildS222GridRectangleCountParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const m = randInt(3, 6);
      const n = randInt(3, 6);

      if (variant === 0) {
        const total = s222CountRectanglesTotal(m, n);
        questions.push(
          `一個 \\(${m}\\times${n}\\) 的棋盤格（橫向 ${m} 格、縱向 ${n} 格，每格皆為單位正方形），其中大大小小的矩形（含正方形）共有多少個？`
        );
        answers.push(
          `簡答：${total} 個。過程：矩形由橫向 ${m + 1} 條直線中選 2 條、縱向 ${n + 1} 條直線中選 2 條決定，所以共有 \\(C(${m + 1},2)\\times C(${n + 1},2)=${combinationCount(m + 1, 2)}\\times${combinationCount(n + 1, 2)}=${total}\\) 個。`
        );
        continue;
      }

      if (variant === 1) {
        const ci = randInt(1, m);
        const cj = randInt(1, n);
        const total = s222CountRectanglesContainingCells(m, n, [{ ci, cj }]);
        const colWays = ci * (m - ci + 1);
        const rowWays = cj * (n - cj + 1);
        questions.push(
          `在 \\(${m}\\times${n}\\) 的棋盤格中（橫向 ${m} 格、縱向 ${n} 格），標記為 A 的小方格位於由左邊數第 ${ci} 格、由下方數第 ${cj} 格。試問包含 A 方格的矩形共有多少個？`
        );
        answers.push(
          `簡答：${total} 個。過程：矩形要包含這一格，橫向的兩條邊界要分別取在第 ${ci} 格左側或更左（共 ${ci} 種）與第 ${ci} 格右側或更右（共 ${m - ci + 1} 種），所以橫向有 ${colWays} 種取法；同理縱向有 ${rowWays} 種取法。故共有 \\(${colWays}\\times${rowWays}=${total}\\) 個。`
        );
        continue;
      }

      let ci1 = randInt(1, m);
      let cj1 = randInt(1, n);
      let ci2 = randInt(1, m);
      let cj2 = randInt(1, n);
      while (ci1 === ci2 && cj1 === cj2) {
        ci2 = randInt(1, m);
        cj2 = randInt(1, n);
      }
      const totalA = s222CountRectanglesContainingCells(m, n, [{ ci: ci1, cj: cj1 }]);
      const totalB = s222CountRectanglesContainingCells(m, n, [{ ci: ci2, cj: cj2 }]);
      const totalUnion = s222CountRectanglesContainingCells(m, n, [
        { ci: ci1, cj: cj1 },
        { ci: ci2, cj: cj2 },
      ]);
      let bothCount = 0;
      for (let x1 = 0; x1 <= m; x1 += 1) {
        for (let x2 = x1 + 1; x2 <= m; x2 += 1) {
          for (let y1 = 0; y1 <= n; y1 += 1) {
            for (let y2 = y1 + 1; y2 <= n; y2 += 1) {
              const hitsA = ci1 - 1 >= x1 && ci1 <= x2 && cj1 - 1 >= y1 && cj1 <= y2;
              const hitsB = ci2 - 1 >= x1 && ci2 <= x2 && cj2 - 1 >= y1 && cj2 <= y2;
              if (hitsA && hitsB) bothCount += 1;
            }
          }
        }
      }

      questions.push(
        `在 \\(${m}\\times${n}\\) 的棋盤格中（橫向 ${m} 格、縱向 ${n} 格），A 方格位於由左邊數第 ${ci1} 格、由下方數第 ${cj1} 格；B 方格位於由左邊數第 ${ci2} 格、由下方數第 ${cj2} 格。試問包含 A、B 兩方格中至少一格的矩形共有多少個？`
      );
      answers.push(
        `簡答：${totalUnion} 個。過程：先分別求出包含 A 的矩形有 ${totalA} 個，包含 B 的矩形有 ${totalB} 個，同時包含 A 與 B 的矩形有 ${bothCount} 個。由取捨原理，包含 A 或 B 的矩形共有 \\(${totalA}+${totalB}-${bothCount}=${totalUnion}\\) 個。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  /* ---------- 數線與格點跳動位移計數 ---------- */
  function s222CountLatticeWalks2D(steps, targetX, targetY) {
    let dp = { '0_0': 1 };
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (let s = 0; s < steps; s += 1) {
      const next = {};
      Object.keys(dp).forEach((key) => {
        const [x, y] = key.split('_').map(Number);
        const ways = dp[key];
        dirs.forEach(([dx, dy]) => {
          const nk = `${x + dx}_${y + dy}`;
          next[nk] = (next[nk] || 0) + ways;
        });
      });
      dp = next;
    }
    return dp[`${targetX}_${targetY}`] || 0;
  }

  function buildS222LatticeWalkDisplacementParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2;

      if (variant === 0) {
        const n = randInt(5, 9);
        let pos = 0;
        for (let s = 0; s < n; s += 1) {
          pos += Math.random() < 0.5 ? 1 : -1;
        }
        const d = pos;
        const r = (n + d) / 2;
        const ways = combinationCount(n, r);
        questions.push(
          `數線上有一隻甲蟲從原點出發，每次向左或向右移動 1 個單位，經過 ${n} 次移動後，恰好停在坐標 ${d} 的位置，則共有多少種不同的移動方式？`
        );
        answers.push(
          `簡答：${ways} 種。過程：設向右走了 \\(r\\) 次、向左走了 \\(${n}-r\\) 次，則位移為 \\(r-(${n}-r)=2r-${n}=${d}\\)，解得 \\(r=${r}\\)。只要從 ${n} 次移動中選出哪 ${r} 次是向右即可，共有 \\(C(${n},${r})=${ways}\\) 種。`
        );
        continue;
      }

      const n = randInt(4, 6);
      let x = 0;
      let y = 0;
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (let s = 0; s < n; s += 1) {
        const [dx, dy] = dirs[randInt(0, 3)];
        x += dx;
        y += dy;
      }
      const ways = s222CountLatticeWalks2D(n, x, y);
      questions.push(
        `坐標平面上有一質點從原點出發，每次可向上、下、左、右移動 1 個單位，經過 ${n} 次移動後，質點恰好停在 \\((${x},${y})\\)，則共有多少種不同的移動方式？`
      );
      answers.push(
        `簡答：${ways} 種。過程：把每次移動視為東、西、南、北四個方向之一，逐步累計所有走到 \\((${x},${y})\\) 的路徑數（可用逐步遞推的方式計算），可得共有 ${ways} 種不同的移動方式。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  /* ---------- 限制連續跳兩階的爬樓梯計數 ---------- */
  const S222_STAIR_NAME_BANK = ['小美', '阿聰', '小婷', '志豪', '佳佳', '阿翔'];

  function s222CountRestrictedStaircase(n) {
    const dp0 = new Array(n + 1).fill(0);
    const dp2 = new Array(n + 1).fill(0);
    if (n >= 1) {
      dp0[1] = 1;
      dp2[1] = 0;
    }
    if (n >= 2) {
      dp0[2] = dp0[1] + dp2[1];
      dp2[2] = 1;
    }
    for (let i = 3; i <= n; i += 1) {
      dp0[i] = dp0[i - 1] + dp2[i - 1];
      dp2[i] = dp0[i - 2];
    }
    return dp0[n] + dp2[n];
  }

  function buildS222RestrictedStaircaseParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const n = randInt(6, 12);
      const name = S222_STAIR_NAME_BANK[randInt(0, S222_STAIR_NAME_BANK.length - 1)];
      const total = s222CountRestrictedStaircase(n);
      questions.push(
        `${name}上樓梯時每一步可以上 1 階或上 2 階，但不會連續兩步都上 2 階。今${name}要走一個共 ${n} 階的樓梯，則上樓的方式共有多少種？`
      );
      answers.push(
        `簡答：${total} 種。過程：設 \\(a_i\\) 表示最後一步是上 1 階、走到第 \\(i\\) 階的方式數，\\(b_i\\) 表示最後一步是上 2 階、走到第 \\(i\\) 階的方式數。因為不能連續兩步都上 2 階，所以 \\(a_i=a_{i-1}+b_{i-1}\\)，\\(b_i=a_{i-2}\\)（2 階的前一步只能是「上 1 階」結束，不能又是「上 2 階」）。逐步遞推到第 ${n} 階，可得總方式數為 ${total} 種。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  /* ---------- 測驗猜題得分期望值 ---------- */
  function buildS224ExamPartialGuessExpectedScoreParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const totalOptions = Math.random() < 0.5 ? 5 : 4;
      const eliminated = totalOptions === 5 ? 2 : 1;
      const r2 = totalOptions - eliminated;
      const c = [4, 5, 8][randInt(0, 2)];
      const w = [1, 1, 2][randInt(0, 2)];
      const k1 = randInt(10, 18);
      const k3 = randInt(3, 8);
      const k5 = randInt(2, 6);
      const total = k1 + k3 + k5;

      const D = r2 * totalOptions;
      const numeratorE = k1 * c * D + k3 * (c - w * (r2 - 1)) * totalOptions + k5 * (c - w * (totalOptions - 1)) * r2;
      const frac = reduceFraction(numeratorE, D);
      const decimalValue = numeratorE / D;
      const rounded = Math.round(decimalValue);

      questions.push(
        `某次測驗共有 ${total} 題單一選擇題，每題有 ${totalOptions} 個選項，答對得 ${c} 分，答錯倒扣 ${w} 分。某生確定其中 ${k1} 題可以答對；另外有 ${k3} 題他確定其中 ${eliminated} 個選項錯誤，因此從剩下 ${r2} 個選項中隨機猜一個；剩下 ${k5} 題完全不會，只能從 ${totalOptions} 個選項中隨機猜一個。試求他這次測驗得分的期望值（四捨五入取最接近的整數）。`
      );
      answers.push(
        `簡答：約 ${rounded} 分（精確值為 \\(${frac.denominator === 1 ? frac.numerator : formatFraction(frac.numerator, frac.denominator)}\\) 分）。過程：確定答對的 ${k1} 題貢獻 \\(${k1}\\times${c}=${k1 * c}\\) 分。部分猜測的 ${k3} 題每題期望值為 \\(\\frac{${c}-${w}\\times${r2 - 1}}{${r2}}\\)，共貢獻 \\(${k3}\\times\\frac{${c - w * (r2 - 1)}}{${r2}}\\) 分。完全猜測的 ${k5} 題每題期望值為 \\(\\frac{${c}-${w}\\times${totalOptions - 1}}{${totalOptions}}\\)，共貢獻 \\(${k5}\\times\\frac{${c - w * (totalOptions - 1)}}{${totalOptions}}\\) 分。三部分加總後四捨五入，得期望值約為 ${rounded} 分。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  /* ---------- 線性機率分布求參數與期望值 ---------- */
  function buildS224LinearDistributionNormalizationParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const focus = i % 3;
      const n = randInt(5, 9);
      const sumK = (n * (n + 1)) / 2;
      const aFrac = reduceFraction(1, sumK);

      if (focus === 0) {
        questions.push(
          `設 \\(a\\) 為實數，隨機變數 \\(X\\) 的可能值為 1 到 ${n} 的整數，且 \\(P(X=k)=ak\\)（\\(k=1,2,\\ldots,${n}\\)）。求 \\(a\\) 的值。`
        );
        answers.push(
          `簡答：\\(a=${formatFraction(aFrac.numerator, aFrac.denominator)}\\)。過程：所有機率之和為 1，所以 \\(a(1+2+\\cdots+${n})=1\\)，即 \\(a\\times${sumK}=1\\)，解得 \\(a=${formatFraction(aFrac.numerator, aFrac.denominator)}\\)。`
        );
        continue;
      }

      if (focus === 1) {
        const eFrac = reduceFraction(2 * n + 1, 3);
        questions.push(
          `設 \\(a\\) 為實數，隨機變數 \\(X\\) 的可能值為 1 到 ${n} 的整數，且 \\(P(X=k)=ak\\)（\\(k=1,2,\\ldots,${n}\\)）。求 \\(E(X)\\) 的值。`
        );
        answers.push(
          `簡答：\\(E(X)=${formatFraction(eFrac.numerator, eFrac.denominator)}\\)。過程：先由歸一化條件解得 \\(a=${formatFraction(aFrac.numerator, aFrac.denominator)}\\)。\\(E(X)=\\sum_{k=1}^{${n}}k\\cdot ak=a\\sum_{k=1}^{${n}}k^{2}=a\\times\\frac{${n}\\times(${n}+1)\\times(2\\times${n}+1)}{6}\\)，化簡後得 \\(E(X)=\\frac{2\\times${n}+1}{3}=${formatFraction(eFrac.numerator, eFrac.denominator)}\\)。`
        );
        continue;
      }

      const m = randInt(2, n - 1);
      const numerator = n * (n + 1) - (m - 1) * m;
      const denominator = n * (n + 1);
      const probFrac = reduceFraction(numerator, denominator);
      questions.push(
        `設 \\(a\\) 為實數，隨機變數 \\(X\\) 的可能值為 1 到 ${n} 的整數，且 \\(P(X=k)=ak\\)（\\(k=1,2,\\ldots,${n}\\)）。求 \\(P(X\\ge ${m})\\) 的值。`
      );
      answers.push(
        `簡答：\\(P(X\\ge ${m})=${formatFraction(probFrac.numerator, probFrac.denominator)}\\)。過程：先由歸一化條件解得 \\(a=${formatFraction(aFrac.numerator, aFrac.denominator)}\\)。\\(P(X\\ge ${m})=a\\sum_{k=${m}}^{${n}}k=a\\times\\frac{(${n}+${m})(${n}-${m}+1)}{2}\\)，代入化簡後得 \\(P(X\\ge ${m})=${formatFraction(probFrac.numerator, probFrac.denominator)}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  /* ---------- 不放回抽球顏色取完順序機率 ---------- */
  const S224_COLOR_NAME_BANK = ['紅', '白', '黑', '黃', '綠', '藍'];

  function buildS224ColorExhaustedOrderParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2;
      const colorPool = shuffle(S224_COLOR_NAME_BANK).slice(0, 2);
      const countA = randInt(2, 8);
      const countB = randInt(2, 8);
      const total = countA + countB;

      if (variant === 0) {
        const frac = reduceFraction(countB, total);
        questions.push(
          `袋中有${colorPool[0]}球 ${countA} 顆、${colorPool[1]}球 ${countB} 顆，每次從袋中取出 1 球，取後不放回，直到所有球都被取完為止。求${colorPool[0]}球比${colorPool[1]}球先取完的機率。`
        );
        answers.push(
          `簡答：\\(${formatFraction(frac.numerator, frac.denominator)}\\)。過程：「${colorPool[0]}球先取完」等同於「最後一顆被取出的球是${colorPool[1]}球」。把所有 ${total} 顆球排成一列視為等機率的排列，最後一個位置是任一顆球的機率相同，是${colorPool[1]}球的機率為 \\(\\frac{${countB}}{${total}}\\)。所以${colorPool[0]}球先取完的機率為 \\(${formatFraction(frac.numerator, frac.denominator)}\\)。`
        );
        continue;
      }

      const frac = reduceFraction(countA, total);
      questions.push(
        `袋中有${colorPool[0]}球 ${countA} 顆、${colorPool[1]}球 ${countB} 顆，每次從袋中取出 1 球，取後不放回，直到所有球都被取完為止。求最後一顆被取出的球是${colorPool[0]}球的機率。`
      );
      answers.push(
        `簡答：\\(${formatFraction(frac.numerator, frac.denominator)}\\)。過程：把所有 ${total} 顆球視為排成一列的等機率排列，最後一個位置恰好是${colorPool[0]}球的機率，等於${colorPool[0]}球數占全部球數的比例，即 \\(\\frac{${countA}}{${total}}=${formatFraction(frac.numerator, frac.denominator)}\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  /* ============================================================
   * 新增小類（依三民版 S2-4 三角比學生卷整理）
   * 以下 3 個 generator 皆使用 randInt/Math.random 進行真隨機參數化，
   * 每次呼叫 generate() 都會重新抽樣，不是固定樣板。
   * ============================================================ */

  function s241RoundNum(x) {
    return Math.round(x * 1000) / 1000;
  }

  function s241TanFractionText(k1, k2, denom) {
    const num = Math.abs(k1 - k2);
    return `\\dfrac{${num}}{${Math.abs(denom)}}`;
  }

  /* ---------- 兩直線斜率求夾角 ---------- */
  function buildS241LineSlopeAngleParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const slopePool = [-4, -3, -2, -1, 1, 2, 3, 4];
    const slopeLineText = (k) => {
      if (k === 1) return 'y=x';
      if (k === -1) return 'y=-x';
      return `y=${k}x`;
    };
    const slopeSubtractionText = (a, b) => `${a}-${b < 0 ? `(${b})` : b}`;
    const denomText = (a, b) => {
      const product = a * b;
      if (product === 0) return '1';
      return product > 0 ? `1+${product}` : `1-${Math.abs(product)}`;
    };

    for (let i = 0; i < count; i += 1) {
      const k1 = slopePool[randInt(0, slopePool.length - 1)];
      let k2 = slopePool[randInt(0, slopePool.length - 1)];
      let guard = 0;
      while (k2 === k1 && guard < 8) {
        k2 = slopePool[randInt(0, slopePool.length - 1)];
        guard += 1;
      }

      const denom = 1 + k1 * k2;
      let angleDeg;
      let isPerpendicular = false;
      if (denom === 0) {
        angleDeg = 90;
        isPerpendicular = true;
      } else {
        const tanValue = Math.abs((k1 - k2) / denom);
        angleDeg = (Math.atan(tanValue) * 180) / Math.PI;
      }
      const rounded = Math.round(angleDeg * 10) / 10;
      questions.push(
        `坐標平面上，直線 \\(L_1\\) 的方程式為 \\(${slopeLineText(k1)}\\)，直線 \\(L_2\\) 的方程式為 \\(${slopeLineText(k2)}\\)，試求 \\(L_1\\) 與 \\(L_2\\) 兩直線所夾的銳角（或直角）角度。（四捨五入至小數點後第一位，單位為度）`
      );
      if (isPerpendicular) {
        answers.push(
          `簡答：\\(90^\\circ\\)。過程：因為 \\(1+k_1k_2=${denomText(k1, k2)}=0\\)，所以兩直線互相垂直，夾角為 \\(90^\\circ\\)。`
        );
      } else {
        answers.push(
          `簡答：約 \\(${rounded}^\\circ\\)。過程：兩直線斜率分別為 \\(k_1=${k1}\\)、\\(k_2=${k2}\\)，夾角 \\(\\theta\\) 滿足 \\(\\tan\\theta=\\left|\\dfrac{k_1-k_2}{1+k_1k_2}\\right|=\\left|\\dfrac{${slopeSubtractionText(k1, k2)}}{${denomText(k1, k2)}}\\right|=${s241TanFractionText(k1, k2, denom)}\\)，取 \\(\\theta=\\tan^{-1}(${s241RoundNum(Math.abs((k1 - k2) / denom))})\\approx${rounded}^\\circ\\)。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  /* ---------- 同界角象限個數統計 ---------- */
  function buildS241CoterminalQuadrantCountParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const units = [30, 45, 60];
    const quadrantNames = ['第一象限', '第二象限', '第三象限', '第四象限'];

    function quadrantOf(deg) {
      const m = ((deg % 360) + 360) % 360;
      if (m === 0 || m === 90 || m === 180 || m === 270) return 0;
      if (m > 0 && m < 90) return 1;
      if (m > 90 && m < 180) return 2;
      if (m > 180 && m < 270) return 3;
      return 4;
    }

    for (let i = 0; i < count; i += 1) {
      const unit = units[randInt(0, units.length - 1)];
      const n1 = randInt(1, 40);
      const n2 = n1 + randInt(40, 90);
      const quadIndex = randInt(1, 4);
      const quadName = quadrantNames[quadIndex - 1];

      let matchCount = 0;
      for (let n = n1; n <= n2; n += 1) {
        if (quadrantOf(unit * n) === quadIndex) matchCount += 1;
      }

      questions.push(
        `設 \\(\\theta_n=${unit}^\\circ\\times n\\)，\\(n\\) 為正整數且 \\(${n1}\\leq n\\leq ${n2}\\)，則 \\(\\theta_n\\) 中有幾個為${quadName}角？`
      );
      answers.push(
        `簡答：${matchCount} 個。過程：把 \\(n=${n1}\\) 到 \\(${n2}\\) 逐一代入 \\(\\theta_n=${unit}^\\circ\\times n\\)，化成 \\(0^\\circ\\) 到 \\(360^\\circ\\) 的同界角後判斷象限，恰好落在${quadName}（不含坐標軸上的角）的 \\(n\\) 值共有 ${matchCount} 個。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  /* ---------- 長方體空間角度 ---------- */
  function buildS243BoxSpaceAngleParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2;
      const p = randInt(3, 8);
      const q = randInt(3, 8);
      const r = randInt(3, 8);

      if (variant === 0) {
        const horizontal = Math.sqrt(p * p + (q / 2) * (q / 2));
        const angleRad = Math.atan(r / horizontal);
        const angleDeg = (angleRad * 180) / Math.PI;
        const rounded = Math.round(angleDeg * 10) / 10;

        questions.push(
          `長方體 \\(ABCD\\text{-}EFGH\\) 中，\\(\\overline{AB}=${p}\\)，\\(\\overline{AD}=${q}\\)，\\(\\overline{AE}=${r}\\)（\\(\\overline{AE}\\) 為鉛直棱），若 \\(P\\) 為棱 \\(\\overline{FG}\\) 的中點，試求直線 \\(AP\\) 與底面 \\(ABCD\\) 的夾角（即 \\(P\\) 沿 \\(AP\\) 方向對底面的仰角）。（四捨五入到小數點後第一位）`
        );
        answers.push(
          `簡答：約 \\(${rounded}^\\circ\\)。過程：以 \\(A\\) 為原點建立坐標，\\(B=(${p},0,0)\\)，\\(D=(0,${q},0)\\)，\\(E=(0,0,${r})\\)，則 \\(F=(${p},0,${r})\\)，\\(G=(${p},${q},${r})\\)，\\(P\\) 為 \\(\\overline{FG}\\) 中點得 \\(P=(${p},${q / 2},${r})\\)。\\(P\\) 在底面的投影到 \\(A\\) 的水平距離為 \\(\\sqrt{${p}^2+${q / 2}^2}\\approx${s241RoundNum(horizontal)}\\)，垂直高度為 ${r}，所以夾角 \\(\\theta=\\tan^{-1}\\dfrac{${r}}{${s241RoundNum(horizontal)}}\\approx${rounded}^\\circ\\)。`
        );
        continue;
      }

      const af = Math.sqrt(p * p + r * r);
      const ah = Math.sqrt(q * q + r * r);
      const cosAngle = (r * r) / (af * ah);
      const angleDeg = (Math.acos(cosAngle) * 180) / Math.PI;

      questions.push(
        `長方體 \\(ABCD\\text{-}EFGH\\) 中，\\(\\overline{AB}=${p}\\)，\\(\\overline{AD}=${q}\\)，\\(\\overline{AE}=${r}\\)，試求 \\(\\angle FAH\\) 的度數。（四捨五入至整數位）`
      );
      answers.push(
        `簡答：約 \\(${Math.round(angleDeg)}^\\circ\\)。過程：以 \\(A\\) 為原點建立坐標，\\(F=(${p},0,${r})\\)，\\(H=(0,${q},${r})\\)，則 \\(\\overline{AF}=\\sqrt{${p}^2+${r}^2}\\approx${s241RoundNum(af)}\\)，\\(\\overline{AH}=\\sqrt{${q}^2+${r}^2}\\approx${s241RoundNum(ah)}\\)，\\(\\overrightarrow{AF}\\cdot\\overrightarrow{AH}=${r}^2=${r * r}\\)（因為 \\(x,y\\) 分量互相垂直，僅 \\(z\\) 分量相乘）。所以 \\(\\cos\\angle FAH=\\dfrac{${r * r}}{${s241RoundNum(af)}\\times${s241RoundNum(ah)}}\\approx${s241RoundNum(cosAngle)}\\)，\\(\\angle FAH\\approx${Math.round(angleDeg)}^\\circ\\)。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function s24Frac(frac) {
    return formatFraction(frac.num, frac.den);
  }

  function s24RoundDegree(value) {
    return Math.round(value * 10) / 10;
  }

  function s24SignedTerm(value, unit = '') {
    if (value === 0) return '';
    const sign = value > 0 ? '+' : '-';
    const abs = Math.abs(value);
    const body = unit && abs === 1 ? unit : `${abs}${unit}`;
    return `${sign}${body}`;
  }

  function buildS242SsaSolutionRangeAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const b = 2 * randInt(5, 14);
        const h = b / 2;
        const values = [];
        for (let a = h + 1; a <= b - 1; a += 1) values.push(a);
        s21Add(
          set,
          `已知 \\(\\triangle ABC\\) 中，\\(b=${b}\\)、\\(\\angle A=30^\\circ\\)。若此三角形有兩解，求邊長 \\(a\\) 的整數範圍。`,
          `\\(${h}<a<${b}\\)，整數為 \\(${values.join(', ')}\\)`,
          `SSA 的關鍵比較是 \\(a\\)、\\(b\\sin A\\)、\\(b\\)。本題 \\(b\\sin A=${b}\\cdot\\frac12=${h}\\)，兩解條件為 \\(b\\sin A<a<b\\)，所以 \\(${h}<a<${b}\\)。`
        );
      } else if (mode === 1) {
        const b = 2 * randInt(5, 13);
        const h = b / 2;
        const cases = [
          { a: h - randInt(1, 3), result: '無解', reason: `a<b\\sin A` },
          { a: h, result: '一解（直角三角形）', reason: `a=b\\sin A` },
          { a: h + randInt(1, Math.max(1, b - h - 1)), result: '兩解', reason: `b\\sin A<a<b` },
          { a: b + randInt(1, 5), result: '一解', reason: `a\\ge b` },
        ];
        const item = cases[randInt(0, cases.length - 1)];
        s21Add(
          set,
          `在 \\(\\triangle ABC\\) 中，\\(a=${item.a}\\)、\\(b=${b}\\)、\\(\\angle A=30^\\circ\\)，判斷此三角形解的個數。`,
          item.result,
          `先算高度 \\(b\\sin A=${b}\\cdot\\frac12=${h}\\)。因為 \\(${item.reason}\\)，所以此 SSA 條件下共有${item.result}。`
        );
      } else if (mode === 2) {
        const b = 2 * randInt(5, 15);
        const a = b / 2;
        s21Add(
          set,
          `給定 \\(b=${b}\\)、\\(\\angle A=30^\\circ\\)。當 \\(a\\) 為何值時，三角形為直角三角形且只有一解？`,
          `\\(a=${a}\\)`,
          `SSA 中若 \\(a=b\\sin A\\)，高剛好落在端點，形成唯一的直角三角形。本題 \\(a=${b}\\cdot\\frac12=${a}\\)。`
        );
      } else if (mode === 3) {
        const m = randInt(4, 9);
        const b = 2 * m;
        const maxK = Math.ceil(m * Math.sqrt(3)) - 1;
        s21Add(
          set,
          `若 \\(a=k\\)、\\(b=${b}\\)、\\(\\angle A=60^\\circ\\)，且已知三角形無解，求正整數 \\(k\\) 的最大可能值。`,
          `\\(${maxK}\\)`,
          `無解條件是 \\(a<b\\sin A\\)。本題 \\(b\\sin A=${b}\\cdot\\frac{\\sqrt3}{2}=${m}\\sqrt3\\)，所以 \\(k<${m}\\sqrt3\\)，最大的正整數為 \\(${maxK}\\)。`
        );
      } else {
        const ratios = [
          { p: 2, q: 3 },
          { p: 3, q: 5 },
          { p: 4, q: 5 },
        ];
        const ratio = ratios[randInt(0, ratios.length - 1)];
        const scale = randInt(1, 4);
        const a = ratio.q * scale;
        const b = 2 * ratio.p * scale;
        const small = s24RoundDegree((Math.asin(ratio.p / ratio.q) * 180) / Math.PI);
        const large = s24RoundDegree(180 - small);
        s21Add(
          set,
          `已知 \\(a=${a}\\)、\\(b=${b}\\)、\\(\\angle A=30^\\circ\\)，求 \\(\\angle B\\) 的所有可能角度近似值。`,
          `約 \\(${small}^\\circ\\) 或 \\(${large}^\\circ\\)`,
          `由正弦定理 \\(\\frac{\\sin B}{b}=\\frac{\\sin A}{a}\\)，得 \\(\\sin B=\\frac{${b}\\cdot\\frac12}{${a}}=${formatFraction(ratio.p, ratio.q)}\\)。同一正弦值在 \\(0^\\circ\\) 到 \\(180^\\circ\\) 內可能對應兩角，因此 \\(B\\approx${small}^\\circ\\) 或 \\(${large}^\\circ\\)。`
        );
      }
    }
    return set;
  }

  function buildS242AngleBisectorMedianAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const angle = [60, 120][randInt(0, 1)];
        const b = [8, 10, 12, 15][randInt(0, 3)];
        const c = [6, 9, 12, 18][randInt(0, 3)];
        const len = angle === 60 ? s241SqrtCoeff(b * c, b + c, 3) : formatFraction(b * c, b + c);
        s21Add(
          set,
          `\\(\\triangle ABC\\) 中，\\(\\angle A=${angle}^\\circ\\)、\\(AB=${c}\\)、\\(AC=${b}\\)，求內角平分線 \\(AD\\) 的長度。`,
          `\\(AD=${len}\\)`,
          `內角平分線長可用 \\(AD=\\frac{2bc\\cos(A/2)}{b+c}\\)。代入 \\(b=${b}\\)、\\(c=${c}\\)、\\(A=${angle}^\\circ\\)，得 \\(AD=${len}\\)。`
        );
      } else if (mode === 1) {
        const cases = [
          { a: 21, b: 15, c: 18 },
          { a: 10, b: 13, c: 13 },
          { a: 14, b: 13, c: 15 },
          { a: 16, b: 10, c: 18 },
        ];
        const item = cases[randInt(0, cases.length - 1)];
        const m2num = 2 * item.b * item.b + 2 * item.c * item.c - item.a * item.a;
        const text = s241SqrtCoeff(1, 2, m2num);
        s21Add(
          set,
          `\\(\\triangle ABC\\) 三邊長為 \\(a=${item.a}\\)、\\(b=${item.b}\\)、\\(c=${item.c}\\)，求 \\(BC\\) 邊上的中線長 \\(m_a\\)。`,
          `\\(m_a=${text}\\)`,
          `中線定理給 \\(m_a=\\frac12\\sqrt{2b^2+2c^2-a^2}\\)。代入後 \\(m_a=\\frac12\\sqrt{${m2num}}=${text}\\)。`
        );
      } else if (mode === 2) {
        const m = randInt(2, 6);
        const n = randInt(3, 8);
        const k = randInt(3, 8);
        const bc = (m + n) * k;
        const bd = m * k;
        const dc = n * k;
        s21Add(
          set,
          `\\(\\triangle ABC\\) 中，\\(AD\\) 為 \\(\\angle A\\) 之平分線，且 \\(AB:AC=${m}:${n}\\)、\\(BC=${bc}\\)，求 \\(BD\\) 與 \\(DC\\)。`,
          `\\(BD=${bd}\\)，\\(DC=${dc}\\)`,
          `角平分線定理給 \\(BD:DC=AB:AC=${m}:${n}\\)。因 \\(BC=${bc}\\)，所以每一份為 \\(${k}\\)，故 \\(BD=${bd}\\)、\\(DC=${dc}\\)。`
        );
      } else if (mode === 3) {
        const a = randInt(5, 12);
        const b = randInt(4, 10);
        const d1 = randInt(5, 14);
        const d2sq = 2 * (a * a + b * b) - d1 * d1;
        if (d2sq <= 0 || d1 <= Math.abs(a - b) || d1 >= a + b) {
          i -= 1;
          continue;
        }
        s21Add(
          set,
          `在平行四邊形中，兩鄰邊長為 \\(${a}\\) 與 \\(${b}\\)，一條對角線長為 \\(${d1}\\)，求另一條對角線的長度。`,
          `\\(${formatRadical(d2sq)}\\)`,
          `平行四邊形對角線公式為 \\(d_1^2+d_2^2=2(a^2+b^2)\\)。所以 \\(d_2^2=2(${a}^2+${b}^2)-${d1}^2=${d2sq}\\)，故 \\(d_2=${formatRadical(d2sq)}\\)。`
        );
      } else {
        const m = randInt(2, 5);
        const n = randInt(3, 7);
        const total = (m + n) * randInt(4, 10);
        const area = makeFraction(total * m, m + n);
        s21Add(
          set,
          `\\(\\triangle ABC\\) 中，\\(AD\\) 為 \\(\\angle A\\) 之平分線，且 \\(AB:AC=${m}:${n}\\)、\\(\\triangle ABC\\) 面積為 \\(${total}\\)，求 \\(\\triangle ABD\\) 的面積。`,
          `\\(${s24Frac(area)}\\)`,
          `角平分線使 \\(BD:DC=AB:AC=${m}:${n}\\)。兩小三角形高相同，所以面積比也為 \\(${m}:${n}\\)。因此 \\([ABD]=${total}\\cdot\\frac{${m}}{${m + n}}=${s24Frac(area)}\\)。`
        );
      }
    }
    return set;
  }

  function buildS241TrigQuadraticAlgebraAdvancedSet(count) {
    const set = s21FreshSet();
    const exactAngles = [
      {
        angle: 30,
        sin: '\\frac12',
        cos: '\\frac{\\sqrt3}{2}',
        sum: '\\frac{1+\\sqrt3}{2}',
        prod: '\\frac{\\sqrt3}{4}',
        tan: '\\frac{\\sqrt3}{3}',
        relation: '<',
      },
      {
        angle: 45,
        sin: '\\frac{\\sqrt2}{2}',
        cos: '\\frac{\\sqrt2}{2}',
        sum: '\\sqrt2',
        prod: '\\frac12',
        tan: '1',
        relation: '=',
      },
      {
        angle: 60,
        sin: '\\frac{\\sqrt3}{2}',
        cos: '\\frac12',
        sum: '\\frac{1+\\sqrt3}{2}',
        prod: '\\frac{\\sqrt3}{4}',
        tan: '\\sqrt3',
        relation: '>',
      },
      {
        angle: 120,
        sin: '\\frac{\\sqrt3}{2}',
        cos: '-\\frac12',
        sum: '\\frac{\\sqrt3-1}{2}',
        prod: '-\\frac{\\sqrt3}{4}',
        tan: '-\\sqrt3',
        relation: '>',
      },
      {
        angle: 135,
        sin: '\\frac{\\sqrt2}{2}',
        cos: '-\\frac{\\sqrt2}{2}',
        sum: '0',
        prod: '-\\frac12',
        tan: '-1',
        relation: '>',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const item = exactAngles[randInt(0, exactAngles.length - 1)];
        s21Add(
          set,
          `設 \\(\\sin A\\) 與 \\(\\cos A\\) 為 \\(${s24QuadraticFromRootsText(item.sum, item.prod)}\\) 的兩根，且 \\(A\\) 為標準角、\\(\\sin A${item.relation}\\cos A\\)，求 \\(\\tan A\\)。`,
          `\\(${item.tan}\\)`,
          `兩根為 \\(\\sin A\\)、\\(\\cos A\\)，所以和為 \\(${item.sum}\\)，積為 \\(${item.prod}\\)。符合的標準角為 \\(${item.angle}^\\circ\\)，故 \\(\\tan A=${item.tan}\\)。`
        );
      } else if (mode === 1) {
        const den = randInt(4, 12);
        const maxNum = Math.min(Math.floor(Math.sqrt(2) * den) - 1, den + 5);
        if (maxNum <= den) {
          i -= 1;
          continue;
        }
        const frac = [randInt(den + 1, maxNum), den];
        const product = makeFraction(frac[0] * frac[0] - frac[1] * frac[1], 2 * frac[1] * frac[1]);
        s21Add(
          set,
          `已知 \\(\\sin\\theta+\\cos\\theta=${formatFraction(frac[0], frac[1])}\\)，求 \\(\\sin\\theta\\cos\\theta\\)。`,
          `\\(${s24Frac(product)}\\)`,
          `平方得 \\((\\sin\\theta+\\cos\\theta)^2=1+2\\sin\\theta\\cos\\theta\\)。所以 \\(\\sin\\theta\\cos\\theta=\\frac{(${formatFraction(frac[0], frac[1])})^2-1}{2}=${s24Frac(product)}\\)。`
        );
      } else if (mode === 2) {
        const qDen = randInt(3, 14);
        const qNum = randInt(1, Math.floor(qDen / 2));
        const q = [qNum, qDen];
        const reciprocal = makeFraction(q[1], q[0]);
        s21Add(
          set,
          `設 \\(\\sin A\\)、\\(\\cos A\\) 為 \\(x^2-px+q=0\\) 的兩根，且 \\(q=${formatFraction(q[0], q[1])}\\)，求 \\(\\tan A+\\cot A\\)。`,
          `\\(${s24Frac(reciprocal)}\\)`,
          `因 \\(\\sin A\\cos A=q\\)，而 \\(\\tan A+\\cot A=\\frac{\\sin^2 A+\\cos^2 A}{\\sin A\\cos A}=\\frac1q\\)。代入 \\(q=${formatFraction(q[0], q[1])}\\)，得 \\(${s24Frac(reciprocal)}\\)。`
        );
      } else if (mode === 3) {
        const den = randInt(4, 12);
        const frac = [randInt(1, Math.max(1, Math.floor(den * 0.6))), den];
        const rad = 2 * frac[1] * frac[1] - frac[0] * frac[0];
        const answer = s241SqrtCoeff(1, frac[1], rad);
        s21Add(
          set,
          `若 \\(\\theta\\) 在第二象限，且 \\(\\sin\\theta+\\cos\\theta=-${formatFraction(frac[0], frac[1])}\\)，求 \\(\\sin\\theta-\\cos\\theta\\)。`,
          `\\(${answer}\\)`,
          `由 \\((\\sin\\theta-\\cos\\theta)^2=2-(\\sin\\theta+\\cos\\theta)^2\\)，得 \\((\\sin\\theta-\\cos\\theta)^2=2-(${formatFraction(frac[0], frac[1])})^2\\)。第二象限中 \\(\\sin\\theta>0\\)、\\(\\cos\\theta<0\\)，所以取正值，答案為 \\(${answer}\\)。`
        );
      } else {
        const den = randInt(3, 12);
        const frac = [randInt(1, den - 1), den];
        const diff = makeFraction(frac[0], frac[1]);
        const product = makeFraction(frac[1] * frac[1] - frac[0] * frac[0], 2 * frac[1] * frac[1]);
        const answer = divFraction(diff, product);
        s21Add(
          set,
          `已知 \\(\\sin\\theta-\\cos\\theta=${s24Frac(diff)}\\)，求 \\(\\sec\\theta-\\csc\\theta\\)。`,
          `\\(${s24Frac(answer)}\\)`,
          `先由 \\((\\sin\\theta-\\cos\\theta)^2=1-2\\sin\\theta\\cos\\theta\\)，得 \\(\\sin\\theta\\cos\\theta=${s24Frac(product)}\\)。又 \\(\\sec\\theta-\\csc\\theta=\\frac{\\sin\\theta-\\cos\\theta}{\\sin\\theta\\cos\\theta}\\)，所以答案為 \\(${s24Frac(answer)}\\)。`
        );
      }
    }
    return set;
  }

  function buildS242CyclicPolygonAreaAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const cases = [
          { sides: [3, 5, 3, 5], areaCoeff: 15, areaRad: 1 },
          { sides: [4, 3, 3, 2], areaCoeff: 6, areaRad: 2 },
          { sides: [2, 3, 4, 5], areaCoeff: 2, areaRad: 30 },
        ];
        const item = cases[randInt(0, cases.length - 1)];
        const scale = randInt(1, 3);
        const sides = item.sides.map((x) => x * scale);
        const area = s241SqrtCoeff(item.areaCoeff * scale * scale, 1, item.areaRad);
        s21Add(
          set,
          `圓內接四邊形四邊長依序為 \\(${sides.join(', ')}\\)，利用婆羅摩笈多公式求其面積。`,
          `\\(${area}\\)`,
          `圓內接四邊形可用 \\(K=\\sqrt{(s-a)(s-b)(s-c)(s-d)}\\)。本題半周長 \\(s=${sides.reduce((a, b) => a + b, 0) / 2}\\)，代入得面積 \\(${area}\\)。`
        );
      } else if (mode === 1) {
        const cases = [
          { a: 3, b: 4, diagonal: 5 },
          { a: 5, b: 12, diagonal: 13 },
          { a: 8, b: 15, diagonal: 17 },
        ];
        const item = cases[randInt(0, cases.length - 1)];
        const scale = randInt(1, 4);
        const a = item.a * scale;
        const b = item.b * scale;
        const c = a;
        const d = b;
        const e = item.diagonal * scale;
        const f = makeFraction(a * c + b * d, e);
        s21Add(
          set,
          `已知圓內接四邊形 \\(ABCD\\) 中，\\(AB=${a}\\)、\\(BC=${b}\\)、\\(CD=${c}\\)、\\(DA=${d}\\)，且對角線 \\(AC=${e}\\)，求另一對角線 \\(BD\\)。`,
          `\\(BD=${s24Frac(f)}\\)`,
          `托勒密定理給 \\(AC\\cdot BD=AB\\cdot CD+BC\\cdot DA\\)。所以 \\(BD=\\frac{${a}\\cdot${c}+${b}\\cdot${d}}{${e}}=${s24Frac(f)}\\)。`
        );
      } else if (mode === 2) {
        const scale = randInt(1, 4);
        const sides = [13, 14, 15].map((x) => x * scale);
        const area = 84 * scale * scale;
        const r = 4 * scale;
        s21Add(
          set,
          `三角形三邊長為 \\(${sides.join(', ')}\\)，求其面積，並求其內切圓半徑。`,
          `面積 \\(${area}\\)，內切圓半徑 \\(${r}\\)`,
          `半周長 \\(s=${21 * scale}\\)。海龍公式得面積 \\(K=${area}\\)。又 \\(K=rs\\)，所以 \\(r=\\frac{${area}}{${21 * scale}}=${r}\\)。`
        );
      } else if (mode === 3) {
        const d1 = randInt(8, 18);
        const d2 = randInt(7, 16);
        const angle = [45, 60, 90][randInt(0, 2)];
        const sin = S241_TRIG[angle].sin;
        const area = s241SqrtCoeff(d1 * d2 * sin[0], 2 * sin[1], sin[2]);
        s21Add(
          set,
          `給定四邊形兩對角線長 \\(d_1=${d1}\\)、\\(d_2=${d2}\\)，且夾角為 \\(${angle}^\\circ\\)，求四邊形面積。`,
          `\\(${area}\\)`,
          `任意四邊形面積可寫成 \\(K=\\frac12d_1d_2\\sin\\theta\\)。代入 \\(d_1=${d1}\\)、\\(d_2=${d2}\\)、\\(\\theta=${angle}^\\circ\\)，得 \\(K=${area}\\)。`
        );
      } else {
        const side = randInt(3, 10);
        const area = s241SqrtCoeff(3 * side * side, 2, 3);
        s21Add(
          set,
          `正六邊形邊長為 \\(${side}\\)，將其分割為六個正三角形，求其總面積與外接圓半徑的關係。`,
          `面積 \\(${area}\\)，且外接圓半徑 \\(R=${side}\\)`,
          `正六邊形可分成 6 個邊長為 \\(${side}\\) 的正三角形，所以面積為 \\(6\\cdot\\frac{\\sqrt3}{4}\\cdot${side}^2=${area}\\)。正六邊形外接圓半徑等於邊長，故 \\(R=${side}\\)。`
        );
      }
    }
    return set;
  }

  function buildS243PlaneSurveyCosineAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const ac = randInt(8, 16) * 10;
        const bc = randInt(7, 15) * 10;
        const angle = [60, 90, 120][randInt(0, 2)];
        const len = s243CosineLengthText(ac, bc, angle);
        if (!len) {
          i -= 1;
          continue;
        }
        s21Add(
          set,
          `觀測員在 \\(C\\) 點測得兩目標 \\(A,B\\)，且 \\(AC=${ac}\\)、\\(BC=${bc}\\)、\\(\\angle ACB=${angle}^\\circ\\)，求 \\(AB\\) 距離。`,
          `\\(${len.text}\\)`,
          `直接用餘弦定理：\\(AB^2=${ac}^2+${bc}^2-2\\cdot${ac}\\cdot${bc}\\cos${angle}^\\circ=${len.square}\\)，所以 \\(AB=${len.text}\\)。`
        );
      } else if (mode === 1) {
        const d = [40, 60, 80, 120][randInt(0, 3)];
        const height = (d * (1 + Math.sqrt(3))) / 2;
        s21Add(
          set,
          `測量塔高時，先在遠點測得仰角 \\(30^\\circ\\)，沿地面朝塔底水平前進 \\(${d}\\) 公尺後仰角變為 \\(45^\\circ\\)，求塔高。`,
          `\\(${formatFraction(d, 2)}(1+\\sqrt3)\\) 公尺`,
          `設前進後到塔底距離為 \\(x\\)，塔高為 \\(h\\)。由 \\(45^\\circ\\) 得 \\(h=x\\)，由 \\(30^\\circ\\) 得 \\(h=(x+${d})\\tan30^\\circ\\)。解得 \\(h=\\frac{${d}}2(1+\\sqrt3)\\)，約 \\(${s23FormatDecimal(height, 2)}\\) 公尺。`
        );
      } else if (mode === 2) {
        const triples = [
          { legs: [9, 12], hyp: 15 },
          { legs: [5, 12], hyp: 13 },
          { legs: [8, 15], hyp: 17 },
          { legs: [7, 24], hyp: 25 },
        ];
        const item = triples[randInt(0, triples.length - 1)];
        const h = makeFraction(item.legs[0] * item.legs[1], item.hyp);
        s21Add(
          set,
          `直角 \\(\\triangle ABC\\) 中，\\(\\angle C=90^\\circ\\)，兩股長為 \\(${item.legs[0]}\\) 與 \\(${item.legs[1]}\\)，求斜邊上的高。`,
          `\\(${s24Frac(h)}\\)`,
          `面積可寫成 \\(\\frac12\\cdot${item.legs[0]}\\cdot${item.legs[1]}\\)，也可寫成 \\(\\frac12\\cdot${item.hyp}\\cdot h\\)。所以 \\(h=\\frac{${item.legs[0]}\\cdot${item.legs[1]}}{${item.hyp}}=${s24Frac(h)}\\)。`
        );
      } else if (mode === 3) {
        const d1 = randInt(6, 14);
        const d2 = randInt(4, 12);
        const angle = [60, 90, 120][randInt(0, 2)];
        const len = s243CosineLengthText(d1, d2, angle);
        if (!len) {
          i -= 1;
          continue;
        }
        s21Add(
          set,
          `兩船自同一港口出發，甲航行 \\(${d1}\\) 公里，乙航行 \\(${d2}\\) 公里，兩航向夾角為 \\(${angle}^\\circ\\)。求兩船間距離。`,
          `\\(${len.text}\\) 公里`,
          `把兩船與出發點連成三角形，兩船距離是夾角對邊。由餘弦定理得 \\(d^2=${d1}^2+${d2}^2-2\\cdot${d1}\\cdot${d2}\\cos${angle}^\\circ=${len.square}\\)，所以 \\(d=${len.text}\\)。`
        );
      } else {
        const d1 = randInt(8, 16) * 10;
        const d2 = randInt(10, 20) * 10;
        const angle = 60;
        const len = s243CosineLengthText(d1, d2, angle);
        s21Add(
          set,
          `已知兩建築物因障礙無法直接量距，在 \\(C\\) 點測得兩建築物距離分別為 \\(${d1}\\) 與 \\(${d2}\\) 公尺，夾角 \\(60^\\circ\\)，求建築物間距 \\(AB\\)。`,
          `\\(${len.text}\\) 公尺`,
          `這是跨越障礙的 SAS 測量。由餘弦定理 \\(AB^2=${d1}^2+${d2}^2-2\\cdot${d1}\\cdot${d2}\\cos60^\\circ=${len.square}\\)，故 \\(AB=${len.text}\\)。`
        );
      }
    }
    return set;
  }

  function s21FreshSet() {
    return { questions: [], summaryAnswers: [], answers: [] };
  }

  function s21Add(set, question, summary, detail) {
    set.questions.push(question);
    set.summaryAnswers.push(summary);
    set.answers.push(`詳解：${stripSummaryPrefixFromDetail(detail)}`);
  }

  function s21Lcm(a, b) {
    return Math.abs(a * b) / gcdInt(a, b);
  }

  function s21Signed(value) {
    if (value === 0) return '';
    return value > 0 ? `+${value}` : `${value}`;
  }

  function s21SignedLinearTerm(coefficient, variable) {
    if (coefficient === 0) return '';
    if (coefficient === 1) return `+${variable}`;
    if (coefficient === -1) return `-${variable}`;
    return `${s21Signed(coefficient)}${variable}`;
  }

  function s21ApTerm(first, diff, index) {
    return first + (index - 1) * diff;
  }

  function s21ApText(first, diff) {
    return `${first}, ${first + diff}, ${first + 2 * diff}, \\ldots`;
  }

  function s21LinearK(coef, constant) {
    const head = coef === 1 ? 'k' : `${coef}k`;
    if (constant === 0) return head;
    return `${head}${s21Signed(constant)}`;
  }

  function s21Factorial(n) {
    let value = 1;
    for (let i = 2; i <= n; i += 1) value *= i;
    return value;
  }

  function buildS211ArithmeticCommonTermsAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const d1 = [5, 6, 7, 8][randInt(0, 3)];
        const d2 = [7, 9, 10, 11][randInt(0, 3)];
        const step = s21Lcm(d1, d2);
        const firstCommon = randInt(30, 80);
        const a1 = firstCommon - d1 * randInt(1, Math.floor((step - 1) / d1));
        const b1 = firstCommon - d2 * randInt(1, Math.floor((step - 1) / d2));
        const n = randInt(3, 5);
        const sum = (n * (2 * firstCommon + (n - 1) * step)) / 2;
        s21Add(
          set,
          `數列 \\(A:${s21ApText(a1, d1)}\\) 與 \\(B:${s21ApText(b1, d2)}\\)，求前 ${n} 個共同項的總和。`,
          `\\(${sum}\\)`,
          `共同項仍成等差數列，公差為 \\([${d1},${d2}]=${step}\\)。本題第一個共同項為 \\(${firstCommon}\\)，所以前 ${n} 個共同項和為 \\(\\frac{${n}(2\\cdot${firstCommon}+${n - 1}\\cdot${step})}{2}=${sum}\\)。`
        );
      } else if (mode === 1) {
        const c1 = randInt(8, 30);
        const d1 = randInt(4, 9);
        const d2 = randInt(6, 12);
        const step = s21Lcm(d1, d2);
        const m = randInt(8, 15);
        const cm = c1 + (m - 1) * step;
        s21Add(
          set,
          `已知 \\(c_n\\) 為兩等差數列的共同項，首項 \\(c_1=${c1}\\)，兩原數列公差為 ${d1}、${d2}，求 \\(c_{${m}}\\)。`,
          `\\(${cm}\\)`,
          `共同項的公差是兩公差的最小公倍數：\\([${d1},${d2}]=${step}\\)。因此 \\(c_n=${c1}+(n-1)${step}\\)，所以 \\(c_{${m}}=${cm}\\)。`
        );
      } else if (mode === 2) {
        const left = randInt(80, 150);
        const right = left + randInt(250, 420);
        const m1 = [4, 5, 7][randInt(0, 2)];
        const m2 = [6, 8, 9][randInt(0, 2)];
        const r1 = randInt(0, m1 - 1);
        const commonDivisor = gcdInt(m1, m2);
        const compatibleR2 = [];
        for (let candidate = 0; candidate < m2; candidate += 1) {
          if ((candidate - r1) % commonDivisor === 0) compatibleR2.push(candidate);
        }
        const r2 = compatibleR2[randInt(0, compatibleR2.length - 1)];
        const mod = s21Lcm(m1, m2);
        let residue = 0;
        while (residue < mod && (residue % m1 !== r1 || residue % m2 !== r2)) residue += 1;
        const values = [];
        for (let x = left; x <= right; x += 1) {
          if (x % m1 === r1 && x % m2 === r2) values.push(x);
        }
        s21Add(
          set,
          `在 ${left} 到 ${right} 之間，同時是 ${m1} 的倍數餘 ${r1}，且為 ${m2} 的倍數餘 ${r2} 的數共有幾個？`,
          `\\(${values.length}\\)`,
          `先解同餘條件，得到共同型態為 \\(x\\equiv ${residue}\\pmod{${mod}}\\)。落在區間內的數形成公差 ${mod} 的等差數列，共有 \\(${values.length}\\) 個。`
        );
      } else if (mode === 3) {
        const d1 = randInt(4, 9);
        const d2 = randInt(5, 11);
        const step = s21Lcm(d1, d2);
        const value = randInt(60, 150);
        const m = randInt(4, 9);
        const n = randInt(5, 10);
        const a1 = value - (m - 1) * d1;
        const b1 = value - (n - 1) * d2;
        s21Add(
          set,
          `等差數列 \\(A\\) 的公差為 ${d1}，\\(B\\) 的公差為 ${d2}。若 \\(A\\) 的第 ${m} 項與 \\(B\\) 的第 ${n} 項同為 ${value}，且把此項視為共同項數列 \\(c_n\\) 的首項，求 \\(c_n\\)。`,
          `\\(c_n=${value}+(n-1)${step}\\)`,
          `兩數列分別可寫成 \\(A:${s21ApText(a1, d1)}\\)、\\(B:${s21ApText(b1, d2)}\\)。共同項間距為 \\([${d1},${d2}]=${step}\\)，所以 \\(c_n=${value}+(n-1)${step}\\)。`
        );
      } else {
        const d1 = [6, 8, 10, 12][randInt(0, 3)];
        const d2 = [9, 12, 15, 18][randInt(0, 3)];
        const step = s21Lcm(d1, d2);
        const first = randInt(10, 40);
        const limit = randInt(250, 500);
        const n = Math.max(0, Math.floor((limit - first) / step) + 1);
        const sum = n > 0 ? (n * (2 * first + (n - 1) * step)) / 2 : 0;
        s21Add(
          set,
          `兩個等差數列的共同項首項為 ${first}，原公差分別為 ${d1} 與 ${d2}。求不超過 ${limit} 的所有共同項之和。`,
          `\\(${sum}\\)`,
          `共同項公差為 \\([${d1},${d2}]=${step}\\)。不超過 ${limit} 的項數為 \\(\\lfloor\\frac{${limit}-${first}}{${step}}\\rfloor+1=${n}\\)，所以總和為 \\(${sum}\\)。`
        );
      }
    }
    return set;
  }

  function buildS211RecurrenceClosedFormAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a1 = randInt(2, 5);
        const n = randInt(8, 15);
        const value = makeFraction(a1, 1 + (n - 1) * a1);
        s21Add(
          set,
          `設 \\(a_1=${a1}\\)，且 \\(a_{n+1}=\\frac{a_n}{a_n+1}\\)，求 \\(a_{${n}}\\)。`,
          `\\(${formatFraction(value.num, value.den)}\\)`,
          `取倒數得 \\(\\frac1{a_{n+1}}=\\frac1{a_n}+1\\)，所以 \\(\\frac1{a_n}=\\frac1{${a1}}+(n-1)\\)。整理得 \\(a_n=\\frac{${a1}}{1+${a1}(n-1)}\\)，故 \\(a_{${n}}=${formatFraction(value.num, value.den)}\\)。`
        );
      } else if (mode === 1) {
        const r = [2, 3, 4][randInt(0, 2)];
        const fixed = randInt(-3, 5);
        const a1 = fixed + randInt(1, 5);
        const n = randInt(5, 9);
        const value = fixed + (a1 - fixed) * r ** (n - 1);
        const fixedDiffText = fixed === 0 ? '' : fixed < 0 ? `+${Math.abs(fixed)}` : `-${fixed}`;
        const initialDiffText = a1 - fixed;
        const closedFormText =
          fixed === 0 ? `${initialDiffText}\\cdot${r}^{n-1}` : `${fixed}+${initialDiffText}\\cdot${r}^{n-1}`;
        s21Add(
          set,
          `設 \\(a_1=${a1}\\)，且 \\(a_{n+1}=${r}a_n${s21Signed(fixed * (1 - r))}\\)。利用平移求 \\(a_{${n}}\\)。`,
          `\\(${value}\\)`,
          `固定點為 \\(${fixed}\\)，令 \\(b_n=a_n${fixedDiffText}\\)，則 \\(b_{n+1}=${r}b_n\\)。所以 \\(a_n=${closedFormText}\\)，代入 \\(n=${n}\\) 得 \\(${value}\\)。`
        );
      } else if (mode === 2) {
        const k = randInt(1, 5);
        const a1 = randInt(1, 4);
        const n = randInt(5, 10);
        const value = (a1 + k) * 2 ** (n - 1) - k;
        s21Add(
          set,
          `遞迴式 \\(a_{n+1}=2a_n+${k}\\)，已知 \\(a_1=${a1}\\)。令 \\(b_n=a_n+k\\)，求 \\(a_{${n}}\\)。`,
          `\\(${value}\\)`,
          `令 \\(b_n=a_n+${k}\\)，則 \\(b_{n+1}=2b_n\\)，且 \\(b_1=${a1 + k}\\)。所以 \\(a_n=${a1 + k}\\cdot2^{n-1}-${k}\\)，代入 \\(n=${n}\\) 得 \\(${value}\\)。`
        );
      } else if (mode === 3) {
        const a1 = randInt(1, 4);
        const a2 = randInt(2, 6);
        const n = randInt(7, 10);
        const arr = [0, a1, a2];
        for (let k = 3; k <= n; k += 1) arr[k] = arr[k - 1] + arr[k - 2];
        s21Add(
          set,
          `設 \\(a_1=${a1},a_2=${a2}\\)，且 \\(a_{n+2}=a_{n+1}+a_n\\)。求 \\(a_{${n}}\\)。`,
          `\\(${arr[n]}\\)`,
          `這是費氏型遞迴，依序計算即可：\\(${arr.slice(1, n + 1).join(', ')}\\)，所以 \\(a_{${n}}=${arr[n]}\\)。`
        );
      } else {
        const a1 = randInt(2, 8);
        const d = randInt(2, 6);
        const c = randInt(-2, 5);
        const n = randInt(8, 14);
        const value = a1 + (n - 1) * c + d * ((n * (n + 1)) / 2 - 1);
        s21Add(
          set,
          `數列滿足 \\(a_1=${a1}\\)，且 \\(a_n=a_{n-1}+${d}n${s21Signed(c)}\\)。求 \\(a_{${n}}\\)。`,
          `\\(${value}\\)`,
          `把每次增加量相加：\\(a_n=${a1}+\\sum_{k=2}^{n}(${d}k${s21Signed(c)})\\)。代入 \\(n=${n}\\)，得 \\(${value}\\)。`
        );
      }
    }
    return set;
  }

  function buildS212SigmaTelescopingAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const n = randInt(6, 14);
        const value = makeFraction(3 * n * (3 * n + 5), 4 * (n + 1) * (n + 2));
        s21Add(
          set,
          `計算 \\(\\sum_{k=1}^{${n}}\\frac{3}{k(k+2)}\\) 的值。`,
          `\\(${formatFraction(value.num, value.den)}\\)`,
          `因 \\(\\frac{3}{k(k+2)}=\\frac32(\\frac1k-\\frac1{k+2})\\)，中間項會對消，剩 \\(\\frac32(1+\\frac12-\\frac1{${n + 1}}-\\frac1{${n + 2}})=${formatFraction(value.num, value.den)}\\)。`
        );
      } else if (mode === 1) {
        const n = randInt(5, 12);
        const value = makeFraction(n, 2 * n + 1);
        s21Add(
          set,
          `求級數 \\(\\frac1{1\\cdot3}+\\frac1{3\\cdot5}+\\cdots+\\frac1{(2n-1)(2n+1)}\\) 在 \\(n=${n}\\) 時的和。`,
          `\\(${formatFraction(value.num, value.den)}\\)`,
          `\\(\\frac1{(2k-1)(2k+1)}=\\frac12(\\frac1{2k-1}-\\frac1{2k+1})\\)。對消後得 \\(\\frac12(1-\\frac1{2n+1})=\\frac{n}{2n+1}\\)，代入 \\(n=${n}\\) 得 \\(${formatFraction(value.num, value.den)}\\)。`
        );
      } else if (mode === 2) {
        const n = randInt(20, 80);
        const radSum = simplifyRadical(n + 1);
        const ansSum = radSum.inside === 1 ? `${radSum.outside - 1}` : `${formatRadical(n + 1)}-1`;
        const showSimpSum = radSum.outside > 1;
        s21Add(
          set,
          `計算 \\(\\sum_{k=1}^{${n}}(\\sqrt{k+1}-\\sqrt{k})\\)。`,
          `\\(${ansSum}\\)`,
          `相鄰根式會前後對消：\\((\\sqrt2-1)+(\\sqrt3-\\sqrt2)+\\cdots+(\\sqrt{${n + 1}}-\\sqrt{${n}})=\\sqrt{${n + 1}}-1${showSimpSum ? '=' + ansSum : ''}\\)。`
        );
      } else if (mode === 3) {
        const n = randInt(5, 9);
        s21Add(
          set,
          `求 \\(\\sum_{k=1}^{${n}}\\frac{k}{(k+1)!}\\) 的值。`,
          `\\(1-\\frac1{${n + 1}!}\\)`,
          `因 \\(\\frac{k}{(k+1)!}=\\frac1{k!}-\\frac1{(k+1)!}\\)，所以整串對消後剩 \\(1-\\frac1{(${n}+1)!}=1-\\frac1{${n + 1}!}\\)。`
        );
      } else {
        const a = randInt(2, 5);
        const b = randInt(1, 4);
        const n = randInt(5, 10);
        const value = makeFraction(a * n, b * (a * n + b));
        const left = s21LinearK(a, b - a);
        const right = s21LinearK(a, b);
        s21Add(
          set,
          `計算 \\(\\sum_{k=1}^{${n}}\\frac{${a}}{(${left})(${right})}\\)。`,
          `\\(${formatFraction(value.num, value.den)}\\)`,
          `拆成 \\(\\frac1{${left}}-\\frac1{${right}}\\)，前後對消後剩 \\(\\frac1{${b}}-\\frac1{${a * n + b}}=${formatFraction(value.num, value.den)}\\)。`
        );
      }
    }
    return set;
  }

  function buildS212SnToAnAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const p = randInt(1, 5);
        const q = randInt(-6, 8);
        const n = randInt(6, 12);
        const an = 2 * p * n + (q - p);
        const quadraticTerm = p === 1 ? 'n^2' : `${p}n^2`;
        s21Add(
          set,
          `若 \\(S_n=${quadraticTerm}${s21SignedLinearTerm(q, 'n')}\\)，求一般項 \\(a_n\\)，並求 \\(a_{${n}}\\)。`,
          `\\(a_n=${2 * p}n${s21Signed(q - p)}\\)，\\(a_{${n}}=${an}\\)`,
          `\\(a_n=S_n-S_{n-1}\\)。計算得 \\(a_n=${2 * p}n${s21Signed(q - p)}\\)，代入 \\(n=${n}\\) 得 \\(${an}\\)。`
        );
      } else if (mode === 1) {
        const A = randInt(1, 4);
        const r = [2, 3][randInt(0, 1)];
        s21Add(
          set,
          `已知 \\(S_n=${A}\\cdot${r}^n-${A}\\)，證明 \\(a_n\\) 為等比數列並求其公比。`,
          `\\(a_n=${A * (r - 1)}\\cdot${r}^{n-1}\\)，公比 \\(${r}\\)`,
          `\\(a_n=S_n-S_{n-1}=(${A}\\cdot${r}^n-${A})-(${A}\\cdot${r}^{n-1}-${A})=${A * (r - 1)}\\cdot${r}^{n-1}\\)，所以是等比數列，公比為 \\(${r}\\)。`
        );
      } else if (mode === 2) {
        const n = randInt(8, 15);
        const an = 3 * n * n - 3 * n + 1;
        s21Add(
          set,
          `設 \\(S_n=n^3\\)，求 \\(a_n\\) 並計算 \\(a_{${n}}\\)。`,
          `\\(a_n=3n^2-3n+1\\)，\\(a_{${n}}=${an}\\)`,
          `\\(a_n=n^3-(n-1)^3=3n^2-3n+1\\)。代入 \\(n=${n}\\)，得 \\(${an}\\)。`
        );
      } else if (mode === 3) {
        const a = randInt(1, 6);
        const b = randInt(-5, 8);
        s21Add(
          set,
          `若 \\(S_n=an^2+bn+c\\) 是某等差數列的前 \\(n\\) 項和，則 \\(c\\) 必須為何值？並以 \\(a,b\\) 表示公差 \\(d\\)。`,
          `\\(c=0\\)，\\(d=2a\\)`,
          `前 0 項和必為 0，所以 \\(S_0=c=0\\)。又 \\(a_n=S_n-S_{n-1}=2an+(b-a)\\)，這是等差數列，一般項係數差為 \\(2a\\)，所以公差 \\(d=2a\\)。`
        );
      } else {
        const n = randInt(4, 10);
        const value = makeFraction(1, n * (n + 1));
        s21Add(
          set,
          `已知 \\(S_n=\\frac{n}{n+1}\\)，求 \\(a_n\\) 並計算 \\(a_{${n}}\\)。`,
          `\\(a_n=\\frac1{n(n+1)}\\)，\\(a_{${n}}=${formatFraction(value.num, value.den)}\\)`,
          `\\(a_n=S_n-S_{n-1}=\\frac{n}{n+1}-\\frac{n-1}{n}=\\frac1{n(n+1)}\\)。代入 \\(n=${n}\\) 得 \\(${formatFraction(value.num, value.den)}\\)。`
        );
      }
    }
    return set;
  }

  function buildS212RepeatingDigitsApplicationsAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const digit = randInt(2, 9);
        const n = randInt(4, 7);
        let sum = 0;
        for (let k = 1; k <= n; k += 1) sum += digit * ((10 ** k - 1) / 9);
        s21Add(
          set,
          `求級數 \\(${digit}+${Number(`${digit}${digit}`)}+${Number(`${digit}${digit}${digit}`)}+\\cdots\\) 前 ${n} 項之和。`,
          `\\(${sum}\\)`,
          `第 \\(k\\) 項為 \\(${digit}\\cdot\\frac{10^k-1}{9}\\)。因此總和為 \\(\\frac{${digit}}9(\\sum_{k=1}^{${n}}10^k-${n})=${sum}\\)。`
        );
      } else if (mode === 1) {
        const initial = [50, 80, 100, 120][randInt(0, 3)];
        const rate = [2, 3, 4][randInt(0, 2)];
        const n = randInt(4, 8);
        const value = initial * rate ** n;
        s21Add(
          set,
          `某細胞分裂模型中，每過一小時數量變為 ${rate} 倍，若初始有 ${initial} 個，求 ${n} 小時後細胞的總數量。`,
          `\\(${value}\\) 個`,
          `這是等比數列，初始為 \\(${initial}\\)，每小時乘以 \\(${rate}\\)。${n} 小時後為 \\(${initial}\\cdot${rate}^{${n}}=${value}\\)。`
        );
      } else if (mode === 2) {
        const n = randInt(5, 10);
        const numerator = n * 9 * 10 ** n - (10 ** n - 1);
        const denominator = 9 * 10 ** n;
        const value = makeFraction(numerator, denominator);
        s21Add(
          set,
          `計算 \\(0.9+0.99+0.999+\\cdots\\) 前 ${n} 項之和。`,
          `\\(${formatFraction(value.num, value.den)}\\)`,
          `第 \\(k\\) 項為 \\(1-10^{-k}\\)，所以總和為 \\(${n}-\\sum_{k=1}^{${n}}10^{-k}=${n}-\\frac{1-10^{-${n}}}{9}=${formatFraction(value.num, value.den)}\\)。`
        );
      } else if (mode === 3) {
        const side = [6, 8, 10, 12][randInt(0, 3)];
        const n = randInt(2, 5);
        s21Add(
          set,
          `正三角形邊長為 \\(L=${side}\\)，每次取各黑色三角形邊中點連線並塗掉中央小三角形，重複 ${n} 次。求已塗掉面積占原面積的比例。`,
          `\\(1-(\\frac34)^{${n}}\\)`,
          `每次保留未塗色面積的 \\(\\frac34\\)，所以做 ${n} 次後未塗色比例為 \\((\\frac34)^{${n}}\\)，已塗掉比例為 \\(1-(\\frac34)^{${n}}\\)。`
        );
      } else {
        const side = randInt(2, 6);
        const n = randInt(3, 6);
        const numerator = 3 * side * 4 ** n;
        const denominator = 3 ** n;
        const value = makeFraction(numerator, denominator);
        s21Add(
          set,
          `雪花曲線從邊長 ${side} 的正三角形開始，每一步每段線變成原來的 \\(\\frac43\\) 倍。求第 ${n} 步後的總周長。`,
          `\\(${formatFraction(value.num, value.den)}\\)`,
          `初始周長為 \\(${3 * side}\\)，每一步乘以 \\(\\frac43\\)。所以第 ${n} 步周長為 \\(${3 * side}(\\frac43)^{${n}}=${formatFraction(value.num, value.den)}\\)。`
        );
      }
    }
    return set;
  }

  function s22Prob(num, den) {
    const value = makeFraction(num, den);
    return `\\frac{${value.num}}{${value.den}}`;
  }

  function s22PercentText(frac) {
    return `${formatFraction(frac.num * 100, frac.den)}\\%`;
  }

  function s22Pow(base, exponent) {
    return base ** exponent;
  }

  function buildS221RestrictedDistributionAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const gifts = randInt(5, 8);
        const people = 3;
        const total = people ** gifts;
        const bad = 2 * (people - 1) ** gifts - 1;
        const ways = total - bad;
        s21Add(
          set,
          `將 ${gifts} 件相異禮物分給甲、乙、丙 3 人，要求甲、乙兩人都至少分到 1 件，有多少種分法？`,
          `\\(${ways}\\) 種`,
          `全部分法為 \\(3^{${gifts}}=${total}\\)。扣掉甲空手或乙空手：各有 \\(2^{${gifts}}\\) 種，但甲乙都空手被重複扣一次，要加回 1 種。因此為 \\(3^{${gifts}}-2\\cdot2^{${gifts}}+1=${ways}\\)。`
        );
      } else if (mode === 1) {
        const people = randInt(3, 5);
        const each = randInt(1, 3);
        const extra = randInt(2, 6);
        const books = people * each + extra;
        const ways = combinationCount(extra + people - 1, people - 1);
        s21Add(
          set,
          `將 ${books} 本相同書分給 ${people} 人，每人至少 ${each} 本，有多少種分法？`,
          `\\(${ways}\\) 種`,
          `先每人發 ${each} 本，用掉 \\(${people}\\cdot${each}\\) 本，剩 ${extra} 本。剩下是非負整數解 \\(x_1+\\cdots+x_${people}=${extra}\\)，所以有 \\(C(${extra + people - 1},${people - 1})=${ways}\\) 種。`
        );
      } else if (mode === 2) {
        const letters = randInt(5, 8);
        const boxes = 3;
        const cap = randInt(Math.ceil(letters / 3), Math.max(2, letters - 2));
        let ways = 0;
        const allocations = [];
        for (let a = 0; a <= cap; a += 1) {
          for (let b = 0; b <= cap; b += 1) {
            const c = letters - a - b;
            if (c < 0 || c > cap) continue;
            const count = factorialInt(letters) / (factorialInt(a) * factorialInt(b) * factorialInt(c));
            ways += count;
            allocations.push(`\\((${a},${b},${c})\\)`);
          }
        }
        s21Add(
          set,
          `將 ${letters} 封不同信投入 3 個不同郵筒，若每個郵筒最多只能投 ${cap} 封，共有幾種投法？`,
          `\\(${ways}\\) 種`,
          `先列出各郵筒信件數 \\((a,b,c)\\)，需 \\(a+b+c=${letters}\\) 且每個不超過 ${cap}。可行分配為 ${allocations.join('、')}。每組分配有多項式排列數，合計為 \\(${ways}\\) 種。`
        );
      } else if (mode === 3) {
        const balls = randInt(5, 8);
        const boxes = randInt(3, 5);
        const total = boxes ** balls;
        const favorable = total - (boxes - 1) ** balls - balls * (boxes - 1) ** (balls - 1);
        s21Add(
          set,
          `將 ${balls} 個相異球隨機投入 ${boxes} 個相異盒子，求第 1 號箱至少有 2 球的機率。`,
          `\\(${s22Prob(favorable, total)}\\)`,
          `全部投入方式為 \\(${boxes}^{${balls}}=${total}\\)。第 1 號箱 0 球有 \\(${boxes - 1}^{${balls}}\\) 種；恰 1 球有 \\(${balls}(${boxes - 1})^{${balls - 1}}\\) 種。故機率為 \\(\\frac{${favorable}}{${total}}=${s22Prob(favorable, total)}\\)。`
        );
      } else {
        const students = randInt(5, 8);
        const courses = randInt(3, 4);
        let onto = 0;
        for (let j = 0; j <= courses; j += 1) {
          onto += (j % 2 === 0 ? 1 : -1) * combinationCount(courses, j) * (courses - j) ** students;
        }
        s21Add(
          set,
          `${students} 名學生各選修 ${courses} 門課中的 1 門，要求每門課至少有 1 人選修，共有多少種選法？`,
          `\\(${onto}\\) 種`,
          `這是把學生分到課程且每門不空的滿射計數。用容斥：\\(\\sum_{j=0}^{${courses}}(-1)^jC(${courses},j)(${courses}-j)^{${students}}=${onto}\\)。`
        );
      }
    }
    return set;
  }

  function buildS224ConditionalBayesAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const prevalence = makeFraction(randInt(5, 20), 100);
        const sensitivity = makeFraction(randInt(88, 98), 100);
        const falsePositive = makeFraction(randInt(2, 8), 100);
        const truePositive = mulFraction(prevalence, sensitivity);
        const falseAlarm = mulFraction(makeFraction(prevalence.den - prevalence.num, prevalence.den), falsePositive);
        const posterior = divFraction(truePositive, addFraction(truePositive, falseAlarm));
        s21Add(
          set,
          `某測謊器對說謊者判斷正確率為 ${s22PercentText(sensitivity)}，對誠實者誤判率為 ${s22PercentText(falsePositive)}。若母群中有 ${s22PercentText(prevalence)} 的人說謊，測謊器顯示說謊，求此人真的說謊的機率。`,
          `\\(${formatFraction(posterior.num, posterior.den)}\\)`,
          `用貝氏定理：\\(P(說謊|陽性)=\\frac{P(說謊)P(陽性|說謊)}{P(說謊)P(陽性|說謊)+P(誠實)P(陽性|誠實)}=${formatFraction(posterior.num, posterior.den)}\\)。`
        );
      } else if (mode === 1) {
        const pa = makeFraction(randInt(50, 70), 100);
        const qa = makeFraction(randInt(1, 4), 100);
        const qb = makeFraction(randInt(3, 8), 100);
        const badA = mulFraction(pa, qa);
        const badB = mulFraction(makeFraction(pa.den - pa.num, pa.den), qb);
        const posterior = divFraction(badA, addFraction(badA, badB));
        s21Add(
          set,
          `某工廠由甲、乙兩產線生產，甲占 ${s22PercentText(pa)}，乙占其餘。甲不良率 ${s22PercentText(qa)}，乙不良率 ${s22PercentText(qb)}。若抽到不良品，求其來自甲產線的機率。`,
          `\\(${formatFraction(posterior.num, posterior.den)}\\)`,
          `先算抽到不良且來自甲的機率，再除以總不良率：\\(\\frac{P(甲)P(不良|甲)}{P(甲)P(不良|甲)+P(乙)P(不良|乙)}=${formatFraction(posterior.num, posterior.den)}\\)。`
        );
      } else if (mode === 2) {
        const fairCount = randInt(1, 3);
        const doubleHeadCount = randInt(1, 3);
        const posterior = makeFraction(2 * doubleHeadCount, 2 * doubleHeadCount + fairCount);
        s21Add(
          set,
          `盒中有 ${fairCount} 枚均勻硬幣與 ${doubleHeadCount} 枚雙面人頭硬幣，隨機取一枚投擲，已知出現人頭，求此硬幣為雙面人頭硬幣的機率。`,
          `\\(${formatFraction(posterior.num, posterior.den)}\\)`,
          `出現人頭的權重：雙面人頭硬幣每枚貢獻 1，均勻硬幣每枚貢獻 \\(\\frac12\\)。所以機率為 \\(\\frac{${doubleHeadCount}}{${doubleHeadCount}+${fairCount}\\cdot\\frac12}=${formatFraction(posterior.num, posterior.den)}\\)。`
        );
      } else if (mode === 3) {
        const prevalence = makeFraction(randInt(1, 5), 100);
        const sensitivity = makeFraction(randInt(85, 95), 100);
        const falsePositive = makeFraction(randInt(1, 4), 100);
        const positiveSick = mulFraction(prevalence, sensitivity);
        const positiveHealthy = mulFraction(
          makeFraction(prevalence.den - prevalence.num, prevalence.den),
          falsePositive
        );
        const posteriorHealthy = divFraction(positiveHealthy, addFraction(positiveSick, positiveHealthy));
        s21Add(
          set,
          `某診斷試劑對患者檢出率為 ${s22PercentText(sensitivity)}，健康者誤報率為 ${s22PercentText(falsePositive)}，已知盛行率為 ${s22PercentText(prevalence)}。若檢驗為陽性，求受檢者其實健康的機率。`,
          `\\(${formatFraction(posteriorHealthy.num, posteriorHealthy.den)}\\)`,
          `陽性包含真正患者與健康誤報兩部分。所求為 \\(\\frac{P(健康)P(陽性|健康)}{P(患者)P(陽性|患者)+P(健康)P(陽性|健康)}=${formatFraction(posteriorHealthy.num, posteriorHealthy.den)}\\)。`
        );
      } else {
        const white = randInt(2, 5);
        const black = randInt(2, 5);
        const posterior = makeFraction(white - 1, white + black - 1);
        s21Add(
          set,
          `袋中有 ${white} 顆白球、${black} 顆黑球，不放回連抽 2 顆。已知第 2 次抽到白球，求第 1 次也抽到白球的機率。`,
          `\\(${formatFraction(posterior.num, posterior.den)}\\)`,
          `因每一顆球成為第 2 顆的機會相同；已知第 2 顆是白球後，剩下 ${white + black - 1} 顆中有 ${white - 1} 顆白球，所以第 1 顆為白球的機率為 \\(${formatFraction(posterior.num, posterior.den)}\\)。`
        );
      }
    }
    return set;
  }

  function buildS222PermutationPathRestrictionAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const m = randInt(3, 6);
        const n = randInt(3, 6);
        const cx = randInt(1, m - 1);
        const cy = randInt(1, n - 1);
        const total = combinationCount(m + n, m);
        const through = combinationCount(cx + cy, cx) * combinationCount(m - cx + n - cy, m - cx);
        s21Add(
          set,
          `在 \\(${m}\\times${n}\\) 的棋盤格中，從左下角到右上角走最短路徑且不經過指定點 \\((${cx},${cy})\\)，共有幾種走法？`,
          `\\(${total - through}\\) 種`,
          `全部最短路徑有 \\(C(${m + n},${m})=${total}\\) 種。經過 \\((${cx},${cy})\\) 的走法為 \\(C(${cx + cy},${cx})C(${m - cx + n - cy},${m - cx})=${through}\\)。相減得 \\(${total - through}\\) 種。`
        );
      } else if (mode === 1) {
        const maxDigit = randInt(4, 8);
        const favorablePair = (maxDigit * (maxDigit + 1)) / 2;
        const totalPair = maxDigit * maxDigit;
        const probability = makeFraction(favorablePair * favorablePair, totalPair * totalPair);
        s21Add(
          set,
          `用 1 到 ${maxDigit} 的數字填入 \\(2\\times2\\) 方格，每格可重複。求滿足左上 \\(A\\ge B\\) 且左下 \\(C\\ge D\\) 的機率。`,
          `\\(${formatFraction(probability.num, probability.den)}\\)`,
          `一組有序數對 \\((A,B)\\) 共有 \\(${maxDigit}^2\\) 種，其中 \\(A\\ge B\\) 有 \\(1+2+\\cdots+${maxDigit}=${favorablePair}\\) 種。上下兩組獨立，所以機率為 \\((\\frac{${favorablePair}}{${totalPair}})^2=${formatFraction(probability.num, probability.den)}\\)。`
        );
      } else if (mode === 2) {
        const totalPeople = randInt(7, 10);
        const special = 3;
        const others = totalPeople - special;
        const ways = factorialInt(others) * combinationCount(others + 1, special) * factorialInt(special);
        s21Add(
          set,
          `${totalPeople} 人排成一列，其中甲、乙、丙三人互不相鄰，共有幾種排法？`,
          `\\(${ways}\\) 種`,
          `先排其餘 ${others} 人，有 \\(${others}!\\) 種，形成 ${others + 1} 個空位。選 3 個空位放甲乙丙並排列，有 \\(C(${others + 1},3)3!\\) 種，總數為 \\(${ways}\\)。`
        );
      } else if (mode === 3) {
        const flags = randInt(4, 7);
        const poles = randInt(2, Math.min(4, flags));
        const ways = factorialInt(flags) * combinationCount(flags - 1, poles - 1);
        s21Add(
          set,
          `${flags} 面不同旗子掛在 ${poles} 根不同旗竿上，要求每根旗竿至少 1 面，且同一旗竿上下順序有別，共有幾種掛法？`,
          `\\(${ways}\\) 種`,
          `先把 ${flags} 面旗排成一列，有 \\(${flags}!\\) 種；再在 ${flags - 1} 個相鄰空隙中選 ${poles - 1} 個切成 ${poles} 段，分給不同旗竿，所以共有 \\(${flags}!C(${flags - 1},${poles - 1})=${ways}\\) 種。`
        );
      } else {
        const a = randInt(2, 4);
        const b = randInt(2, 4);
        const others = randInt(3, 5);
        const totalLetters = a + b + others;
        const total = factorialInt(totalLetters - b + 1) / factorialInt(a);
        s21Add(
          set,
          `有 ${a} 個相同 A、${b} 個相同 B 與 ${others} 個彼此不同字母，排成一列，要求所有 B 必須相鄰，共有幾種排法？`,
          `\\(${total}\\) 種`,
          `把 ${b} 個相同 B 視為一個區塊，連同 ${a} 個相同 A 與 ${others} 個彼此不同字母，共有 ${totalLetters - b + 1} 個物件，其中只有 A 重複 ${a} 個。故方法數為 \\(\\frac{${totalLetters - b + 1}!}{${a}!}=${total}\\) 種。`
        );
      }
    }
    return set;
  }

  function buildS224TransitionMatrixAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const stayA = makeFraction(randInt(5, 9), 10);
        const toAFromB = makeFraction(randInt(1, 5), 10);
        const steadyA = divFraction(toAFromB, addFraction(makeFraction(1, 1), subFraction(toAFromB, stayA)));
        s21Add(
          set,
          `設轉移矩陣 \\(P=\\begin{bmatrix}${formatFraction(stayA.num, stayA.den)}&${formatFraction(toAFromB.num, toAFromB.den)}\\\\${formatFraction(stayA.den - stayA.num, stayA.den)}&${formatFraction(toAFromB.den - toAFromB.num, toAFromB.den)}\\end{bmatrix}\\)，求穩定狀態中 A 狀態的比例。`,
          `\\(${formatFraction(steadyA.num, steadyA.den)}\\)`,
          `令穩定狀態為 \\((x,1-x)^T\\)。由 \\(x=${formatFraction(stayA.num, stayA.den)}x+${formatFraction(toAFromB.num, toAFromB.den)}(1-x)\\)，解得 \\(x=${formatFraction(steadyA.num, steadyA.den)}\\)。`
        );
      } else if (mode === 1) {
        const ss = makeFraction(randInt(5, 8), 10);
        const rr = makeFraction(randInt(5, 8), 10);
        const startSunny = randInt(0, 1) === 0;
        const days = randInt(2, 4);
        let sunny = startSunny ? makeFraction(1, 1) : makeFraction(0, 1);
        for (let d = 0; d < days; d += 1) {
          sunny = addFraction(
            mulFraction(ss, sunny),
            mulFraction(makeFraction(rr.den - rr.num, rr.den), subFraction(makeFraction(1, 1), sunny))
          );
        }
        s21Add(
          set,
          `天氣轉移：晴後仍晴機率 \\(${formatFraction(ss.num, ss.den)}\\)，雨後轉晴機率 \\(${formatFraction(rr.den - rr.num, rr.den)}\\)。若今天${startSunny ? '晴天' : '雨天'}，求 ${days} 天後為晴天的機率。`,
          `\\(${formatFraction(sunny.num, sunny.den)}\\)`,
          `令第 \\(n\\) 天晴天機率為 \\(p_n\\)，則 \\(p_{n+1}=${formatFraction(ss.num, ss.den)}p_n+${formatFraction(rr.den - rr.num, rr.den)}(1-p_n)\\)。由初始值連續代入 ${days} 次，得 \\(${formatFraction(sunny.num, sunny.den)}\\)。`
        );
      } else if (mode === 2) {
        const keep = makeFraction([6, 7, 8][randInt(0, 2)], 10);
        const lambda = makeFraction(2 * keep.num - keep.den, keep.den);
        const n = randInt(3, 8);
        const lambdaPow = powFraction(lambda, n);
        s21Add(
          set,
          `已知對稱轉移矩陣 \\(P=\\begin{bmatrix}${formatFraction(keep.num, keep.den)}&${formatFraction(keep.den - keep.num, keep.den)}\\\\${formatFraction(keep.den - keep.num, keep.den)}&${formatFraction(keep.num, keep.den)}\\end{bmatrix}\\)。求 \\(P^{${n}}\\) 中左上元素。`,
          `\\(\\frac12(1+(${formatFraction(lambda.num, lambda.den)})^{${n}})\\)`,
          `此矩陣特徵值為 \\(1\\) 與 \\(2p-1=${formatFraction(lambda.num, lambda.den)}\\)。因此 \\(P^n\\) 左上元素為 \\(\\frac12(1+(${formatFraction(lambda.num, lambda.den)})^n)\\)，代入 \\(n=${n}\\) 即可；其冪為 \\(${formatFraction(lambdaPow.num, lambdaPow.den)}\\)。`
        );
      } else if (mode === 3) {
        const d1 = randInt(2, 5);
        const d2 = randInt(6, 10);
        const n = randInt(3, 6);
        s21Add(
          set,
          `已知 \\(B=ADA^{-1}\\)，其中 \\(D=\\begin{bmatrix}${d1}&0\\\\0&${d2}\\end{bmatrix}\\)。求 \\(B^{${n}}\\) 可化成什麼形式。`,
          `\\(B^{${n}}=AD^{${n}}A^{-1}=A\\begin{bmatrix}${d1 ** n}&0\\\\0&${d2 ** n}\\end{bmatrix}A^{-1}\\)`,
          `相似矩陣的冪次可直接作用在對角矩陣上：\\((ADA^{-1})^n=AD^nA^{-1}\\)。所以只要把對角線元素各自做 ${n} 次方即可。`
        );
      } else {
        const a = randInt(2, 5);
        const b = randInt(3, 7);
        const ratioG = gcdInt(a, b);
        const ratioA = a / ratioG;
        const ratioB = b / ratioG;
        s21Add(
          set,
          `兩水槽 A、B 互相交換水量：每分鐘 A 水量的 \\(\\frac1{${a}}\\) 流入 B，B 水量的 \\(\\frac1{${b}}\\) 流入 A。求長期平衡時 A、B 水量的比例。`,
          `\\(${ratioA}:${ratioB}\\)`,
          `平衡時兩邊每分鐘交換量相等：\\(\\frac{A}{${a}}=\\frac{B}{${b}}\\)，即 \\(bA=aB\\)。因此 \\(A:B=${a}:${b}=${ratioA}:${ratioB}\\)。`
        );
      }
    }
    return set;
  }

  function buildS224ExpectationDistributionAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const prize = randInt(8, 20);
        const probNum = randInt(1, 5);
        const probDen = randInt(probNum + 2, 12);
        const fair = makeFraction(prize * probNum, probDen);
        s21Add(
          set,
          `同時擲兩枚硬幣，若出現兩正面可得 ${prize} 元。若要使遊戲公平，每局應繳多少元？`,
          `\\(${formatFraction(prize, 4)}\\) 元`,
          `兩正面的機率為 \\(\\frac14\\)，公平入場費等於獎金期望值：\\(${prize}\\cdot\\frac14=${formatFraction(prize, 4)}\\) 元。`
        );
      } else if (mode === 1) {
        const total = randInt(16, 24);
        const known = randInt(6, 12);
        const choices = randInt(4, 5);
        const rightScore = randInt(4, 6);
        const wrongScore = -randInt(1, 3);
        const expected =
          known * rightScore +
          ((total - known) * makeFraction(rightScore + (choices - 1) * wrongScore, choices).num) /
            makeFraction(rightScore + (choices - 1) * wrongScore, choices).den;
        const guessEv = makeFraction(rightScore + (choices - 1) * wrongScore, choices);
        const totalEv = addFraction(
          makeFraction(known * rightScore, 1),
          makeFraction((total - known) * guessEv.num, guessEv.den)
        );
        s21Add(
          set,
          `某生參加 ${total} 題單選測驗（${choices} 選 1），答對 ${rightScore} 分、答錯 ${wrongScore} 分。已知確定會做 ${known} 題，其餘隨機猜答，求得分期望值。`,
          `\\(${formatFraction(totalEv.num, totalEv.den)}\\) 分`,
          `每題猜答期望為 \\(\\frac{${rightScore}+${choices - 1}\\cdot(${wrongScore})}{${choices}}=${formatFraction(guessEv.num, guessEv.den)}\\)。總期望為 \\(${known}\\cdot${rightScore}+${total - known}\\cdot${formatFraction(guessEv.num, guessEv.den)}=${formatFraction(totalEv.num, totalEv.den)}\\)。`
        );
      } else if (mode === 2) {
        const red = randInt(4, 8);
        const white = randInt(3, 7);
        const draw = randInt(2, Math.min(5, red + white - 1));
        const ev = makeFraction(draw * red, red + white);
        s21Add(
          set,
          `袋中有 ${red} 顆紅球、${white} 顆白球，一次不放回取 ${draw} 球。設 \\(X\\) 為取到紅球個數，求 \\(E(X)\\)。`,
          `\\(${formatFraction(ev.num, ev.den)}\\)`,
          `超幾何分配的期望為抽取數乘以成功比例：\\(E(X)=${draw}\\cdot\\frac{${red}}{${red + white}}=${formatFraction(ev.num, ev.den)}\\)。`
        );
      } else if (mode === 3) {
        const target = randInt(4, 8);
        s21Add(
          set,
          `擲一顆 ${target} 面均勻骰子直到出現指定點數才停止，求擲骰次數的期望值。`,
          `\\(${target}\\) 次`,
          `這是成功機率 \\(p=\\frac1{${target}}\\) 的幾何分配，等待次數期望為 \\(\\frac1p=${target}\\)。`
        );
      } else {
        const premium = randInt(800, 1600);
        const payout = randInt(6, 15) * 10000;
        const pNum = randInt(3, 9);
        const pDen = 1000;
        const profit = makeFraction(premium * pDen - payout * pNum, pDen);
        s21Add(
          set,
          `某種保險年費 ${premium} 元，理賠額 ${payout} 元，事故發生率為 \\(\\frac{${pNum}}{${pDen}}\\)。求保險公司對每位客戶的期望獲利。`,
          `\\(${formatFraction(profit.num, profit.den)}\\) 元`,
          `期望獲利 = 保費 - 理賠額 \\(\\times\\) 事故機率，所以為 \\(${premium}-${payout}\\cdot\\frac{${pNum}}{${pDen}}=${formatFraction(profit.num, profit.den)}\\) 元。`
        );
      }
    }
    return set;
  }

  function s23MeanVarianceFromSum(n, sum, squareSum) {
    const mean = makeFraction(sum, n);
    const variance = subFraction(makeFraction(squareSum, n), mulFraction(mean, mean));
    return { mean, variance };
  }

  function s23FormatDecimal(value, digits = 3) {
    return Number(value)
      .toFixed(digits)
      .replace(/\.?0+$/, '');
  }

  function s23FormatNumber(value, digits = 4) {
    const factor = 10 ** digits;
    const rounded = Math.round((Number(value) + Number.EPSILON) * factor) / factor;
    return s23FormatDecimal(rounded, digits);
  }

  function s23SignedNumberText(value, digits = 4) {
    if (value === 0) return '';
    const text = s23FormatNumber(Math.abs(value), digits);
    return value > 0 ? `+${text}` : `-${text}`;
  }

  function s23CoeffVariableText(coef, variable = 'x', digits = 4) {
    if (coef === 1) return variable;
    if (coef === -1) return `-${variable}`;
    return `${s23FormatNumber(coef, digits)}${variable}`;
  }

  function s23LinearExpr(variable, coef, constant = 0, digits = 4) {
    return `${s23CoeffVariableText(coef, variable, digits)}${s23SignedNumberText(constant, digits)}`;
  }

  function s23LatexCoeffVariableText(coefText, variable = 'x') {
    if (coefText === '1') return variable;
    if (coefText === '-1') return `-${variable}`;
    return `${coefText}${variable}`;
  }

  function s23AppendSignedLatex(base, constantText) {
    if (!constantText || constantText === '0') return base;
    return constantText.startsWith('-') ? `${base}${constantText}` : `${base}+${constantText}`;
  }

  function s23LineEquationText(slope, intercept = 0, variable = 'x', yVariable = 'y') {
    return `${yVariable}=${s23LinearExpr(variable, slope, intercept)}`;
  }

  function s23PointSlopeEquationText(slopeText, xValue, yValue) {
    const coefficient = slopeText === '1' ? '' : slopeText === '-1' ? '-' : slopeText;
    return `y-${yValue}=${coefficient}(x-${xValue})`;
  }

  function buildS231BinaryDataAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const ones = randInt(12, 36);
        const zeros = randInt(12, 36);
        const total = ones + zeros;
        const mean = makeFraction(ones, total);
        const variance = makeFraction(ones * zeros, total * total);
        s21Add(
          set,
          `一組 ${total} 筆 0-1 數據中，有 ${ones} 個 1 與 ${zeros} 個 0。求此組數據的平均數與變異數。`,
          `平均數 \\(${formatFraction(mean.num, mean.den)}\\)，變異數 \\(${formatFraction(variance.num, variance.den)}\\)`,
          `0-1 數據的平均數就是 1 的比例 \\(p=\\frac{${ones}}{${total}}\\)。變異數為 \\(p(1-p)=\\frac{${ones}}{${total}}\\cdot\\frac{${zeros}}{${total}}=${formatFraction(variance.num, variance.den)}\\)。`
        );
      } else if (mode === 1) {
        const n1 = [30, 40, 50][randInt(0, 2)];
        const n2 = [40, 50, 60][randInt(0, 2)];
        const p1 = makeFraction(randInt(3, 7), 10);
        const p2 = makeFraction(randInt(4, 9), 10);
        const ones = (n1 * p1.num) / p1.den + (n2 * p2.num) / p2.den;
        if (!Number.isInteger(ones)) {
          i -= 1;
          continue;
        }
        const total = n1 + n2;
        const mean = makeFraction(ones, total);
        const variance = mulFraction(mean, subFraction(makeFraction(1, 1), mean));
        s21Add(
          set,
          `兩組 0-1 數據合併：第一組 \\(${n1}\\) 筆平均 \\(${formatFraction(p1.num, p1.den)}\\)，第二組 \\(${n2}\\) 筆平均 \\(${formatFraction(p2.num, p2.den)}\\)。求合併後的平均數與標準差。`,
          `平均數 \\(${formatFraction(mean.num, mean.den)}\\)，標準差 \\(\\sqrt{${formatFraction(variance.num, variance.den)}}\\)`,
          `先算 1 的總數：\\(${n1}\\cdot${formatFraction(p1.num, p1.den)}+${n2}\\cdot${formatFraction(p2.num, p2.den)}=${ones}\\)。合併平均為 \\(${formatFraction(mean.num, mean.den)}\\)，0-1 數據變異數為 \\(p(1-p)=${formatFraction(variance.num, variance.den)}\\)，標準差為其平方根。`
        );
      } else if (mode === 2) {
        const sigma = makeFraction(2, 5);
        s21Add(
          set,
          `若一組 0-1 數據的標準差為 \\(${formatFraction(sigma.num, sigma.den)}\\)，求數據中「1」所占比例可能為何。`,
          `\\(\\frac15\\) 或 \\(\\frac45\\)`,
          `設 1 的比例為 \\(p\\)。0-1 數據變異數為 \\(p(1-p)\\)，所以 \\(p(1-p)=(\\frac25)^2=\\frac4{25}\\)。解得 \\(p=\\frac15\\) 或 \\(\\frac45\\)。`
        );
      } else if (mode === 3) {
        const n = 100;
        const observedOnes = randInt(55, 85);
        const observedMean = makeFraction(observedOnes, 100);
        const errors = randInt(3, 9);
        const corrected = makeFraction(observedOnes - errors, n);
        s21Add(
          set,
          `已知 \\(n=100\\) 的 0-1 數據平均為 \\(${formatFraction(observedMean.num, observedMean.den)}\\)。若其中 ${errors} 個 0 誤改為 1，求修正後平均數。`,
          `\\(${formatFraction(corrected.num, corrected.den)}\\)`,
          `平均數乘以 100 就是目前記錄的 1 的個數。修正時要把誤加的 ${errors} 個 1 扣回，所以新平均為 \\(\\frac{${observedOnes}-${errors}}{100}=${formatFraction(corrected.num, corrected.den)}\\)。`
        );
      } else {
        const n = randInt(8, 20);
        const value = randInt(0, 1);
        s21Add(
          set,
          `證明當 ${n} 筆 0-1 數據全為 ${value} 時，其標準差必為 0。`,
          `標準差為 \\(0\\)`,
          `所有資料都相同時，每筆資料都等於平均數，所有離差皆為 0，因此變異數與標準差都為 0。0-1 數據也可用 \\(p(1-p)\\)：若全為 0，\\(p=0\\)；全為 1，\\(p=1\\)，變異數皆為 0。`
        );
      }
    }
    return set;
  }

  function buildS231LinearTransformUpdateAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const mean = randInt(50, 80);
        const sd = randInt(4, 12);
        const a = pickNonZero(-4, 4);
        const b = randInt(-20, 20);
        s21Add(
          set,
          `原始數據平均為 ${mean}、標準差為 ${sd}。經變換 \\(${s23LineEquationText(a, b)}\\) 後，求新數據的平均數與標準差。`,
          `平均數 \\(${a * mean + b}\\)，標準差 \\(${Math.abs(a) * sd}\\)`,
          `線性變換 \\(y=ax+b\\) 會使平均數變為 \\(a\\bar x+b\\)，標準差變為 \\(|a|s\\)。所以新平均為 \\(${a}\\cdot${mean}${s23SignedNumberText(b)}=${a * mean + b}\\)，新標準差為 \\(${Math.abs(a)}\\cdot${sd}=${Math.abs(a) * sd}\\)。`
        );
      } else if (mode === 1) {
        const oldMean = randInt(30, 60);
        const oldSd = randInt(5, 12);
        const a = randInt(2, 4);
        const b = randInt(-30, 30);
        const newMean = a * oldMean + b;
        const newSd = a * oldSd;
        s21Add(
          set,
          `某次考試全班平均 ${oldMean} 分、標準差 ${oldSd} 分。老師以正倍率 \\(a>0\\) 將每人分數變成 \\(y=ax+b\\)，使新平均為 ${newMean}、新標準差為 ${newSd}。求 \\((a,b)\\)。`,
          `\\((a,b)=(${a},${b})\\)`,
          `標準差只受倍率影響，所以 \\(|a|=${newSd}/${oldSd}=${a}\\)。題設給定 \\(a>0\\)，故 \\(a=${a}\\)。再由平均數 \\(${newMean}=${a}\\cdot${oldMean}+b\\)，得 \\(b=${b}\\)。`
        );
      } else if (mode === 2) {
        const oldSd = randInt(10, 30);
        const d = randInt(2, 6);
        const newSd = makeFraction(oldSd, d);
        s21Add(
          set,
          `若數據 \\(X\\) 的標準差為 ${oldSd}，變換為 \\(Y=\\frac{X-c}{${d}}\\)。求 \\(Y\\) 的標準差。`,
          `\\(${formatFraction(newSd.num, newSd.den)}\\)`,
          `平移 \\(-c\\) 不影響標準差，除以 ${d} 會讓標準差除以 ${d}。所以 \\(s_Y=\\frac{${oldSd}}{${d}}=${formatFraction(newSd.num, newSd.den)}\\)。`
        );
      } else if (mode === 3) {
        const sd = randInt(3, 12);
        s21Add(
          set,
          `比較 \\(y=2x+5\\) 與 \\(y=-2x+100\\) 對原始數據標準差的影響。若原標準差為 ${sd}，兩者的新標準差是否相同？`,
          `相同，皆為 \\(${2 * sd}\\)`,
          `標準差只看倍率的絕對值。兩個變換的倍率分別為 2 與 -2，絕對值皆為 2，因此新標準差都等於 \\(2\\cdot${sd}=${2 * sd}\\)。`
        );
      } else {
        const n = 10;
        const mean = randInt(4, 8);
        const variance = randInt(3, 12);
        const sumSquares = n * (variance + mean * mean);
        const a = pickNonZero(-4, 4);
        const b = randInt(-10, 10);
        const yVariance = a * a * variance;
        const transformText = s23LinearExpr('x_i', a, b);
        s21Add(
          set,
          `已知 \\(x_1,\\ldots,x_{10}\\) 的平均為 ${mean}，且 \\(\\sum x_i^2=${sumSquares}\\)。若 \\(y_i=${transformText}\\)，求 \\(Y\\) 的變異數。`,
          `\\(${yVariance}\\)`,
          `先由 \\(Var(X)=\\frac{\\sum x_i^2}{10}-\\bar x^2=${sumSquares}/10-${mean}^2=${variance}\\)。線性變換的變異數為 \\(Var(aX+b)=a^2Var(X)\\)，所以 \\(Var(Y)=${a * a}\\cdot${variance}=${yVariance}\\)。`
        );
      }
    }
    return set;
  }

  function buildS231DataCorrectionAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const n = randInt(8, 15);
        const mean = randInt(15, 30);
        const variance = randInt(4, 20);
        const wrong = mean + randInt(5, 12);
        const correct = mean - randInt(3, 8);
        if ((wrong - mean) * (wrong - mean) > (n - 1) * variance) {
          i -= 1;
          continue;
        }
        const sum = n * mean;
        const squareSum = n * (variance + mean * mean);
        const fixed = s23MeanVarianceFromSum(n, sum - wrong + correct, squareSum - wrong * wrong + correct * correct);
        if (fixed.variance.num < 0) {
          i -= 1;
          continue;
        }
        s21Add(
          set,
          `某組 ${n} 筆數據平均 ${mean}、變異數 ${variance}。發現一筆 ${wrong} 應改為 ${correct}，求更正後平均數與變異數。`,
          `平均數 \\(${formatFraction(fixed.mean.num, fixed.mean.den)}\\)，變異數 \\(${formatFraction(fixed.variance.num, fixed.variance.den)}\\)`,
          `用總和與平方和更新。原總和 \\(${n}\\cdot${mean}\\)，原平方和 \\(${n}(${variance}+${mean}^2)\\)。更正後扣掉 ${wrong}、加回 ${correct}，平方和也扣 \\(${wrong}^2\\)、加 \\(${correct}^2\\)，再代入 \\(Var=\\frac{\\sum x_i^2}{n}-\\bar x^2\\)。`
        );
      } else if (mode === 1) {
        const n = randInt(30, 60);
        const oldA = randInt(70, 90);
        const oldB = randInt(30, 50);
        const delta = randInt(5, 15);
        const newA = oldA - delta;
        const newB = oldB + delta;
        const change = makeFraction(newA * newA + newB * newB - oldA * oldA - oldB * oldB, n);
        s21Add(
          set,
          `班級 ${n} 人，更正前有兩筆資料誤為 ${oldA} 與 ${oldB}，正確應為 ${newA} 與 ${newB}。若平均數不變，求變異數改變量。`,
          `\\(${formatFraction(change.num, change.den)}\\)`,
          `兩筆資料總和相同，所以平均數不變。變異數改變量只剩平方和改變除以人數：\\(\\frac{${newA}^2+${newB}^2-${oldA}^2-${oldB}^2}{${n}}=${formatFraction(change.num, change.den)}\\)。`
        );
      } else if (mode === 2) {
        const n = [40, 50, 80][randInt(0, 2)];
        const diff = [100, 200, 300][randInt(0, 2)];
        const change = makeFraction(-diff, n);
        s21Add(
          set,
          `若更正兩筆資料 \\((a,b)\\to(c,d)\\)，滿足 \\(a+b=c+d\\)，且 \\(a^2+b^2-(c^2+d^2)=${diff}\\)，總人數為 ${n}，求變異數增加或減少多少。`,
          `減少 \\(${formatFraction(diff, n)}\\)`,
          `總和不變，所以平均數不變。新平方和比舊平方和少 ${diff}，因此變異數減少 \\(\\frac{${diff}}{${n}}=${formatFraction(diff, n)}\\)。`
        );
      } else if (mode === 3) {
        const n = randInt(15, 30);
        const mean = randInt(10, 20);
        const missing = randInt(5, mean - 1);
        const newMean = makeFraction(n * mean + missing, n + 1);
        s21Add(
          set,
          `${n} 人義工時數平均 ${mean} 小時。更正後發現少算了一個人的 ${missing} 小時，求新平均。`,
          `\\(${formatFraction(newMean.num, newMean.den)}\\) 小時`,
          `原總時數為 \\(${n}\\cdot${mean}\\)。補入 ${missing} 小時後，總人數變 ${n + 1}，新平均為 \\(\\frac{${n * mean}+${missing}}{${n + 1}}=${formatFraction(newMean.num, newMean.den)}\\)。`
        );
      } else {
        const n = [20, 40, 100][randInt(0, 2)];
        const low = 0;
        const high = 100;
        const mid = 50;
        const decrease = makeFraction(high * high + low * low - 2 * mid * mid, n);
        s21Add(
          set,
          `某資料有 ${n} 筆，將兩個極端值 ${low} 與 ${high} 更正為兩筆 ${mid}。若原平均為 ${mid}，求變異數的變化量。`,
          `減少 \\(${formatFraction(decrease.num, decrease.den)}\\)`,
          `兩筆資料總和同為 100，所以平均數不變。平方和由 \\(0^2+100^2\\) 變為 \\(50^2+50^2\\)，減少 5000，因此變異數減少 \\(\\frac{5000}{${n}}=${formatFraction(decrease.num, decrease.den)}\\)。`
        );
      }
    }
    return set;
  }

  function buildS232RegressionPredictionAdvancedSet(count) {
    const set = s21FreshSet();
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const xbar = randInt(3, 8);
        const ybar = randInt(6, 15);
        const sxx = randInt(4, 12);
        const slopeNum = randInt(1, 6);
        const slope = makeFraction(slopeNum, sxx);
        const sxy = slopeNum;
        const intercept = subFraction(makeFraction(ybar, 1), mulFraction(slope, makeFraction(xbar, 1)));
        s21Add(
          set,
          `已知 \\(\\bar x=${xbar},\\bar y=${ybar},S_{xx}=${sxx},S_{xy}=${sxy}\\)。求 \\(Y\\) 對 \\(X\\) 的迴歸直線。`,
          `\\(${s23PointSlopeEquationText(formatFraction(slope.num, slope.den), xbar, ybar)}\\)`,
          `迴歸斜率 \\(b=\\frac{S_{xy}}{S_{xx}}=${formatFraction(slope.num, slope.den)}\\)，且迴歸線必通過平均點 \\((\\bar x,\\bar y)=(${xbar},${ybar})\\)。所以 \\(${s23PointSlopeEquationText(formatFraction(slope.num, slope.den), xbar, ybar)}\\)。`
        );
      } else if (mode === 1) {
        const a = makeFraction(randInt(5, 12), 10);
        const b = randInt(5, 20);
        const x = randInt(8, 20);
        const y = addFraction(mulFraction(a, makeFraction(x, 1)), makeFraction(b, 1));
        const slopeText = formatFraction(a.num, a.den);
        const lineText = s23AppendSignedLatex(s23LatexCoeffVariableText(slopeText, 'x'), String(b));
        s21Add(
          set,
          `利用迴歸直線 \\(y=${lineText}\\) 預測當 \\(x=${x}\\) 時的 \\(y\\) 值。`,
          `\\(${formatFraction(y.num, y.den)}\\)`,
          `直接代入迴歸式：\\(y=${slopeText}\\cdot${x}+${b}=${formatFraction(y.num, y.den)}\\)。`
        );
      } else if (mode === 2) {
        const h = randInt(3, 8);
        const k = randInt(8, 20);
        const slope = randInt(1, 4);
        const intercept = k - slope * h;
        const lineText = s23LineEquationText(slope, intercept);
        s21Add(
          set,
          `若數據經線性變換 \\(x'=x-${h},y'=y-${k}\\) 後，迴歸直線通過原點且為 \\(${s23LineEquationText(slope, 0, "x'", "y'")}\\)，求原始迴歸直線必通過哪一點，並寫出方程式。`,
          `通過 \\((${h},${k})\\)，\\(${lineText}\\)`,
          `變換後原點 \\((0,0)\\) 對應原資料中的 \\((${h},${k})\\)，所以原迴歸線必過此點。由 \\(y-${k}=${slope}(x-${h})\\)，整理得 \\(${lineText}\\)。`
        );
      } else if (mode === 3) {
        const e = randInt(1, 3);
        const points = [
          [1, 2],
          [2, 4],
          [3, 6 + e],
        ];
        const xs = points.map((p) => p[0]);
        const ys = points.map((p) => p[1]);
        const xbar = xs.reduce((a, b) => a + b, 0) / 3;
        const ybar = ys.reduce((a, b) => a + b, 0) / 3;
        const sxx = xs.reduce((sum, x) => sum + (x - xbar) ** 2, 0);
        const syy = ys.reduce((sum, y) => sum + (y - ybar) ** 2, 0);
        const sxy = points.reduce((sum, p) => sum + (p[0] - xbar) * (p[1] - ybar), 0);
        const r = sxy / Math.sqrt(sxx * syy);
        s21Add(
          set,
          `已知 3 筆數據 \\((1,2),(2,4),(3,${6 + e})\\)，求其相關係數 \\(r\\) 的近似值。`,
          `\\(${s23FormatDecimal(r, 3)}\\)`,
          `先算 \\(\\bar x=${s23FormatDecimal(xbar, 3)},\\bar y=${s23FormatDecimal(ybar, 3)}\\)，再用 \\(r=\\frac{S_{xy}}{\\sqrt{S_{xx}S_{yy}}}\\)。本題 \\(S_{xx}=${s23FormatDecimal(sxx, 3)},S_{yy}=${s23FormatDecimal(syy, 3)},S_{xy}=${s23FormatDecimal(sxy, 3)}\\)，所以 \\(r\\approx${s23FormatDecimal(r, 3)}\\)。`
        );
      } else {
        const m = -randInt(1, 4);
        const b = randInt(5, 20);
        s21Add(
          set,
          `若所有數據點 \\((x_i,y_i)\\) 均落在直線 \\(${s23LineEquationText(m, b)}\\) 上，且 \\(x_i\\) 不全相同，求 \\(X\\) 與 \\(Y\\) 的相關係數。`,
          `\\(-1\\)`,
          `所有點完全落在同一直線上，表示完全線性相關。因斜率 \\(${m}<0\\)，所以相關係數為 \\(-1\\)。`
        );
      }
    }
    return set;
  }

  const nextConfigs = {
    's2-1-1-sequence-core-five-subtypes': {
      type: 'drill',
      title: '數列核心五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS211SequenceFiveSubtypeMixedSet(5);
      },
    },
    's2-1-1-nth-formula-value': {
      type: 'drill',
      title: '已知一般項公式求特定項',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildS211NthFormulaValueSet(5);
      },
    },
    's2-1-1-arithmetic-basic-parameters': {
      type: 'drill',
      title: '等差數列基本參數計算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildS211ArithmeticBasicParameterSet(5);
      },
    },
    's2-1-1-geometric-basic-parameters': {
      type: 'drill',
      title: '等比數列基本參數計算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildS211GeometricBasicParameterSet(5);
      },
    },
    's2-1-1-means-application': {
      type: 'drill',
      title: '等差中項與等比中項應用',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildS211MeansApplicationSet(5);
      },
    },
    's2-1-1-basic-recurrence-terms': {
      type: 'drill',
      title: '基礎遞迴關係式項數推導',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildS211BasicRecurrenceTermSet(5);
      },
    },
    's2-1-1-arithmetic-geometric-mixed-parameters': {
      type: 'drill',
      title: '等差與等比數列的混合參數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS211ArithmeticGeometricMixedParameterSet(5);
      },
    },
    's2-1-1-sequence-transformation-classification': {
      type: 'drill',
      title: '數列轉換後的等差等比判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS211SequenceTransformationClassificationSet(5);
      },
    },
    's2-1-1-visual-group-patterns': {
      type: 'drill',
      title: '圖形規律與群數列',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS211VisualGroupPatternSet(5);
      },
    },
    's2-1-1-repeated-block-sequence': {
      type: 'drill',
      title: '重複分組數列的項與部分和',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS211RepeatedBlockSequenceSet(5);
      },
    },
    's2-1-1-recurrence-transform-mixed': {
      type: 'drill',
      title: '遞迴轉換與一般項推測',
      difficulty: 'medium',
      questionCount: 8,
      generate() {
        return buildS211RecurrenceTransformSet(8);
      },
    },
    's2-1-1-cumulative-product-recurrence': {
      type: 'drill',
      title: '累加型與累乘型遞迴',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS211CumulativeProductRecurrenceSet(5);
      },
    },
    's2-1-1-combinatorial-recurrence': {
      type: 'drill',
      title: '計數類遞迴與費氏數列',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS211CombinatorialRecurrenceSet(5);
      },
    },
    's2-1-1-geometric-coordinate-sequences': {
      type: 'drill',
      title: '幾何分割與座標數列',
      difficulty: 'medium',
      questionCount: 8,
      generate() {
        return buildS211GeometricCoordinateSequenceSet(8);
      },
    },
    's2-1-1-arithmetic-common-terms': {
      type: 'drill',
      title: '兩等差數列的共同項',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS211ArithmeticCommonTermsSet(5);
      },
    },
    's2-1-1-arithmetic-common-terms-advanced': {
      type: 'drill',
      title: '兩等差數列共同項',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS211ArithmeticCommonTermsAdvancedSet(5);
      },
    },
    's2-1-1-geometric-product-symmetry': {
      type: 'drill',
      title: '等比數列的對稱乘積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS211GeometricProductSymmetrySet(5);
      },
    },
    's2-1-1-arithmetic-geometric-bridge': {
      type: 'drill',
      title: '等差等比混合條件反推',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS211ArithmeticGeometricBridgeSet(5);
      },
    },
    's2-1-1-recurrence-closed-form-advanced': {
      type: 'drill',
      title: '遞迴數列與通項性質',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS211RecurrenceClosedFormAdvancedSet(5);
      },
    },
    's2-1-1-prefix-product-terms': {
      type: 'drill',
      title: '前綴乘積反求數列項',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS211PrefixProductTermSet(5);
      },
    },
    's2-1-2-series-sum-seven-subtypes': {
      type: 'drill',
      title: '等差級數與求和七小類綜合',
      difficulty: 'medium',
      questionCount: 7,
      generate() {
        return buildS212SevenSubtypeMixedSet(7);
      },
    },
    's2-1-2-basic-sum-formula': {
      type: 'drill',
      title: '基礎公式求和',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildS212BasicSumFormulaSet(5);
      },
    },
    's2-1-2-consecutive-cube-range-sum': {
      type: 'drill',
      title: '連續立方和的區間計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212ConsecutiveCubeRangeSumSet(5);
      },
    },
    's2-1-2-range-multiple-sum': {
      type: 'drill',
      title: '範圍內倍數之和',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildS212RangeMultipleSumSet(5);
      },
    },
    's2-1-2-max-sum': {
      type: 'drill',
      title: '級數和的最大值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212MaxSumSet(5);
      },
    },
    's2-1-2-sn-to-an': {
      type: 'drill',
      title: '已知 Sn 公式求一般項',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212SnToAnSet(5);
      },
    },
    's2-1-2-sn-to-an-advanced': {
      type: 'drill',
      title: '由 Sn 反求 an',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS212SnToAnAdvancedSet(5);
      },
    },
    's2-1-2-two-ap-ratio': {
      type: 'drill',
      title: '兩等差數列的和與項之比',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212TwoApRatioSet(5);
      },
    },
    's2-1-2-applications': {
      type: 'drill',
      title: '等差級數生活情境應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212ApplicationSet(5);
      },
    },
    's2-1-2-given-sn-general-term': {
      type: 'drill',
      title: '給定前 n 項和公式求一般項',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212GivenSnGeneralTermSet(5);
      },
    },
    's2-1-2-geometric-series-five-subtypes': {
      type: 'drill',
      title: '等比級數與複利五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212GeometricSeriesFiveSubtypeMixedSet(5);
      },
    },
    's2-1-2-geometric-basic-sum': {
      type: 'drill',
      title: '等比級數基礎參數求和',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildS212GeometricBasicSumSet(5);
      },
    },
    's2-1-2-geometric-series-compute': {
      type: 'drill',
      title: '等比級數求和計算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildS212GeometricSeriesComputeSet(5);
      },
    },
    's2-1-2-geometric-segment-property': {
      type: 'drill',
      title: '等比級數分段和性質',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212GeometricSegmentPropertySet(5);
      },
    },
    's2-1-2-geometric-partial-sum-extension': {
      type: 'drill',
      title: '等比級數分段和反推延伸',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212GeometricPartialSumExtensionSet(5);
      },
    },
    's2-1-2-geometric-sn-to-an': {
      type: 'drill',
      title: '等比型 Sn 公式求一般項',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212GeometricSnToAnSet(5);
      },
    },
    's2-1-2-geometric-applications': {
      type: 'drill',
      title: '等比級數生活情境應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212GeometricApplicationsSet(5);
      },
    },
    's2-1-2-sigma-five-subtypes': {
      type: 'drill',
      title: 'Sigma 求和五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212SigmaFiveSubtypeMixedSet(5);
      },
    },
    's2-1-2-sigma-formula-range': {
      type: 'drill',
      title: 'Sigma 標準公式與範圍變換',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildS212SigmaFormulaRangeSet(5);
      },
    },
    's2-1-2-sigma-linearity': {
      type: 'drill',
      title: 'Sigma 線性性質與常數項',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildS212SigmaLinearitySet(5);
      },
    },
    's2-1-2-sigma-telescoping': {
      type: 'drill',
      title: '分式拆項對消',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212SigmaTelescopingSet(5);
      },
    },
    's2-1-2-sigma-telescoping-advanced': {
      type: 'drill',
      title: 'Sigma 運算與分式對消',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS212SigmaTelescopingAdvancedSet(5);
      },
    },
    's2-1-2-sigma-pattern': {
      type: 'drill',
      title: '數列規律轉化為 Sigma 記號',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212SigmaPatternSet(5);
      },
    },
    's2-1-2-sigma-mixed': {
      type: 'drill',
      title: '多項式與指數混合型 Sigma',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212SigmaMixedSet(5);
      },
    },
    's2-1-2-special-series-sigma-five-subtypes': {
      type: 'drill',
      title: '特殊級數與 Sigma 應用五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212SpecialSeriesSigmaFiveSubtypeMixedSet(5);
      },
    },
    's2-1-2-repeating-digits-series': {
      type: 'drill',
      title: '重複數字級數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212RepeatingDigitsSeriesSubtypeSet(5);
      },
    },
    's2-1-2-repeating-digits-applications-advanced': {
      type: 'drill',
      title: '重複數字級數與生活建模',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildS212RepeatingDigitsApplicationsAdvancedSet(5);
      },
    },
    's2-1-2-radical-special-telescoping': {
      type: 'drill',
      title: '根式與特殊分式對消',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212RadicalTelescopingSubtypeSet(5);
      },
    },
    's2-1-2-consecutive-products-sum': {
      type: 'drill',
      title: '連續整數乘積之級數和',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212ConsecutiveProductsSubtypeSet(5);
      },
    },
    's2-1-2-geometric-stacking-series': {
      type: 'drill',
      title: '空間幾何規律與點陣計數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212GeometricStackingSubtypeSet(5);
      },
    },
    's2-1-2-algebraic-variants-sigma': {
      type: 'drill',
      title: '結合特殊代數結構的 Sigma',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212AlgebraicVariantsSigmaSubtypeSet(5);
      },
    },
    's2-1-1-difference-method-nonlinear': {
      type: 'drill',
      title: '差分法（非線性型）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS211DifferenceMethodNonlinearSet(5);
      },
    },
    's2-1-2-reverse-n-from-sum': {
      type: 'drill',
      title: '已知級數和反求項數 n',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212ReverseNFromSumSet(5);
      },
    },
    's2-1-2-non-standard-sigma-limits': {
      type: 'drill',
      title: '非標準下界的 Sigma 求和',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212NonStandardSigmaLimitsSet(5);
      },
    },
    's2-1-2-arithmetic-end-block-count': {
      type: 'drill',
      title: '等差級數前後端項和反推',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS212ArithmeticEndBlockCountSet(5);
      },
    },
    's2-1-3-induction-sum-step': {
      type: 'drill',
      title: '數學歸納法的級數公式推導',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS213InductionSumStepSet(5);
      },
    },
    's2-1-3-induction-divisibility-step': {
      type: 'drill',
      title: '數學歸納法的整除證明',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS213InductionDivisibilityStepSet(5);
      },
    },
    's2-1-3-induction-recurrence-conjecture': {
      type: 'drill',
      title: '遞迴一般項的歸納驗證',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS213InductionRecurrenceConjectureSet(5);
      },
    },
    's2-1-3-periodic-remainder-sequence': {
      type: 'drill',
      title: '週期餘數與整除循環',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildS213PeriodicRemainderSequenceSet(5);
      },
    },
    's2-2-1-counting-applications-five-subtypes': {
      type: 'drill',
      title: '取捨計數與排列組合五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221CountingApplicationsFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-inclusion-exclusion-applications': {
      type: 'drill',
      title: '取捨原理與文氏圖應用',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221InclusionExclusionApplicationsSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-competition-probability-paths': {
      type: 'drill',
      title: '賽制與勝負機率路徑',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221CompetitionProbabilityPathsSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-route-selection-counting': {
      type: 'drill',
      title: '路徑、選購與搭配問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221RouteSelectionCountingSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-digit-formation-counting': {
      type: 'drill',
      title: '數字組成與計數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221DigitFormationCountingSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-multiple-survey-counting': {
      type: 'drill',
      title: '倍數計數與調查統計',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221MultipleSurveyCountingSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-product-rule-parameterized': {
      type: 'drill',
      title: '乘法原理的參數化搭配題',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildS221ProductRuleParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-inclusion-exclusion-multiples': {
      type: 'drill',
      title: '倍數聯集的取捨原理',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildS221InclusionExclusionMultiplesSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-license-plate-restrictions-parameterized': {
      type: 'drill',
      title: '車牌號碼限制計數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221LicensePlateRestrictionsParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-distinct-distribution-at-least-parameterized': {
      type: 'drill',
      title: '相異物分配與至少限制',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221DistinctDistributionAtLeastParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-restricted-distribution-advanced': {
      type: 'drill',
      title: '具限制條件的相異物分配',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildS221RestrictedDistributionAdvancedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-ferry-capacity-assignment-parameterized': {
      type: 'drill',
      title: '渡船容量限制分配',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221FerryCapacityAssignmentParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-handshake-couples-parameterized': {
      type: 'drill',
      title: '夫妻握手計數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221HandshakeCouplesParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-fixed-end-no-repeat-schedule-parameterized': {
      type: 'drill',
      title: '固定首尾且相鄰不同的安排',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221FixedEndNoRepeatScheduleParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-ambidextrous-pairing-parameterized': {
      type: 'drill',
      title: '左右手皆可的配對計數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221AmbidextrousPairingParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-advanced-counting-five-subtypes': {
      type: 'drill',
      title: '展開項數因數路徑與塗色五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221AdvancedCountingFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-polynomial-expansion-term-counting': {
      type: 'drill',
      title: '多項式展開項數與同型項',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221PolynomialExpansionTermCountingSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-divisor-counting-conditions': {
      type: 'drill',
      title: '正因數個數與特定倍數判別',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221DivisorCountingConditionsSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-route-restriction-counting': {
      type: 'drill',
      title: '搭配、路徑與開關問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221RouteRestrictionCountingSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-restricted-digit-counting': {
      type: 'drill',
      title: '數字組成與限制條件',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221RestrictedDigitCountingSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-region-coloring-counting': {
      type: 'drill',
      title: '區域塗色問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221RegionColoringCountingSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-permutation-core-five-subtypes': {
      type: 'drill',
      title: '排列公式與直線排列限制五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222PermutationCoreFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-permutation-equations': {
      type: 'drill',
      title: '排列數公式的代數運算',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222PermutationEquationSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-identical-items-permutation': {
      type: 'drill',
      title: '不盡相異物排列',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222IdenticalItemsPermutationSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-fixed-relative-order': {
      type: 'drill',
      title: '指定項目的相對順序固定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222FixedRelativeOrderSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-position-constraints': {
      type: 'drill',
      title: '限制條件的直線排列',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222PositionConstraintSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-derangement-position-exclusion': {
      type: 'drill',
      title: '多重位置限制與錯排應用',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222DerangementPositionExclusionSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-permutation-applications-five-subtypes': {
      type: 'drill',
      title: '路徑數字信號與分配五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222PermutationApplicationsFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-distribution-repeated': {
      type: 'drill',
      title: '重複排列與分配問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222DistributionRepeatedSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-grid-paths': {
      type: 'drill',
      title: '棋盤街道的捷徑走法',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222GridPathSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-number-formation': {
      type: 'drill',
      title: '數字組成與限制條件',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222NumberFormationSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-signals-runs': {
      type: 'drill',
      title: '信號組成與連串變化數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222SignalsRunsSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-internal-order-constraints': {
      type: 'drill',
      title: '具備內部次序限制的分組排列',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222InternalOrderConstraintSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-repeated-letter-permutation-parameterized': {
      type: 'drill',
      title: '重複字母排列總數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222RepeatedLetterPermutationParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-adjacent-pair-arrangement-parameterized': {
      type: 'drill',
      title: '指定兩項相鄰的排列',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222AdjacentPairArrangementParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-adjacent-pair-end-restriction-parameterized': {
      type: 'drill',
      title: '相鄰成組與端點限制',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222AdjacentPairEndRestrictionParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-same-type-nonadjacent-programs-parameterized': {
      type: 'drill',
      title: '同類節目不相鄰排列',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222SameTypeNonAdjacentProgramsParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-repeated-digit-leading-zero-parameterized': {
      type: 'drill',
      title: '重複數字與首位不可為零',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222RepeatedDigitLeadingZeroParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-ordered-blocks-internal-permutation-parameterized': {
      type: 'drill',
      title: '固定區塊順序的內部排列',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222OrderedBlocksInternalPermutationParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-specified-non-adjacent-parameterized': {
      type: 'drill',
      title: '指定對象兩兩不相鄰排列',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222SpecifiedNonAdjacentParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-permutation-path-restriction-advanced': {
      type: 'drill',
      title: '排列組合與路徑限制',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildS222PermutationPathRestrictionAdvancedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-binomial-basics-five-subtypes': {
      type: 'drill',
      title: '二項式展開與基本應用五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223BinomialBasicsFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-binomial-coefficient': {
      type: 'drill',
      title: '求展開式中指定項的係數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223BinomialCoefficientSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-binomial-constant-term': {
      type: 'drill',
      title: '求展開式中的常數項',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223BinomialConstantTermSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-binomial-remainder-number': {
      type: 'drill',
      title: '大數除法的餘數判定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223BinomialRemainderNumberSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-polynomial-remainder-binomial': {
      type: 'drill',
      title: '多項式除法的餘式計算',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223PolynomialRemainderBinomialSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-combination-identity': {
      type: 'drill',
      title: '組合數恆等式求和',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223CombinationIdentitySubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-combination-counting-five-subtypes': {
      type: 'drill',
      title: '組合計數與限制取法五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223CombinationCountingFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-subset-property': {
      type: 'drill',
      title: '數字子集的特殊性質判定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223SubsetPropertySubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-non-adjacent-selection': {
      type: 'drill',
      title: '不相鄰選取問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223NonAdjacentSelectionSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-poker-dice': {
      type: 'drill',
      title: '撲克牌牌型與骰子點數組合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223PokerDiceSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-hockey-stick-identity': {
      type: 'drill',
      title: '組合恆等式與曲棍球棒求和',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223HockeyStickIdentitySubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-restricted-integer-solutions': {
      type: 'drill',
      title: '整除性奇偶與範圍限制方程解',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223RestrictedIntegerSolutionsSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-advanced-binomial-five-subtypes': {
      type: 'drill',
      title: '進階二項式係數與多項式五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223AdvancedBinomialFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-maximum-coefficient': {
      type: 'drill',
      title: '係數最大項的判定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223MaximumCoefficientSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-consecutive-coefficients': {
      type: 'drill',
      title: '連續項係數成特殊數列',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223ConsecutiveCoefficientSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-weighted-binomial-sums': {
      type: 'drill',
      title: '二項式展開的級數求和',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223WeightedBinomialSumSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-multinomial-expansion': {
      type: 'drill',
      title: '多項式展開與同型項計數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223MultinomialExpansionSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-complex-binomial-identity': {
      type: 'drill',
      title: '二項式與複數結合的組合求和',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223ComplexBinomialIdentitySubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-applications-five-subtypes': {
      type: 'drill',
      title: '分配集合連串與有理項五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223ApplicationsFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-product-partition': {
      type: 'drill',
      title: '正整數乘積的分解與方程式解',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223ProductPartitionSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-nested-subsets': {
      type: 'drill',
      title: '巢狀集合與包含關係計數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223NestedSubsetsSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-runs-counting': {
      type: 'drill',
      title: '符號排列的連串問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223RunsCountingSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-rational-irrational-terms': {
      type: 'drill',
      title: '二項式展開的有理項與無理項計數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223RationalIrrationalTermsSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-polynomial-remainder-variants': {
      type: 'drill',
      title: '多項式除法的二項式應用',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223PolynomialRemainderVariantsSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-grouping-distribution-five-subtypes': {
      type: 'drill',
      title: '分組分堆與同物分配五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223GroupingDistributionFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-binomial-coefficient-parameterized': {
      type: 'drill',
      title: '二項式指定項係數參數題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223BinomialCoefficientParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-identical-distribution-parameterized': {
      type: 'drill',
      title: '相同物分配與最低限制',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223IdenticalDistributionParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-binomial-adjacent-ratio-parameterized': {
      type: 'drill',
      title: '連續組合數比值求 n 與 r',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223BinomialAdjacentRatioParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-distinct-equal-named-distribution': {
      type: 'drill',
      title: '相異物平均給特定對象',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223DistinctEqualNamedDistributionSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-distinct-equal-unnamed-piles': {
      type: 'drill',
      title: '相異物平均分成若干堆',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223DistinctEqualUnnamedPilesSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-distinct-specified-pile-sizes': {
      type: 'drill',
      title: '相異物按指定數量分堆',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223DistinctSpecifiedPileSizesSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-restricted-grouping-distribution': {
      type: 'drill',
      title: '具備特定人選限制的分組分配',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223RestrictedGroupingDistributionSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-3-identical-distribution': {
      type: 'drill',
      title: '相同物分配給相異對象',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS223IdenticalDistributionSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-basic-probability-five-subtypes': {
      type: 'drill',
      title: '古典機率與條件事件五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224BasicProbabilityFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-classical-probability': {
      type: 'drill',
      title: '古典機率：骰子硬幣與卡片計數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224ClassicalProbabilitySubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-conditional-bayes': {
      type: 'drill',
      title: '條件機率與貝氏定理',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224ConditionalBayesSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-conditional-bayes-advanced': {
      type: 'drill',
      title: '條件機率與貝氏定理',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildS224ConditionalBayesAdvancedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-independent-repeated': {
      type: 'drill',
      title: '獨立事件與重複試驗',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224IndependentRepeatedSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-drawing-allocation': {
      type: 'drill',
      title: '取球與分配問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224DrawingAllocationSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-algebra-geometry-probability': {
      type: 'drill',
      title: '代數幾何機率結合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224AlgebraGeometryProbabilitySubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-applied-probability-five-subtypes': {
      type: 'drill',
      title: '期望值集合與抽樣應用五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224AppliedProbabilityFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-expected-value': {
      type: 'drill',
      title: '期望值與公平遊戲',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224ExpectedValueSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-expectation-distribution-advanced': {
      type: 'drill',
      title: '期望值與機率分布',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildS224ExpectationDistributionAdvancedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-probability-set-relations': {
      type: 'drill',
      title: '機率性質與集合邊界判定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224ProbabilitySetRelationsSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-distribution-probability': {
      type: 'drill',
      title: '分組分堆與分配的機率',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224DistributionProbabilitySubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-infinite-games': {
      type: 'drill',
      title: '無窮循環賽與狀態轉移',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224InfiniteGamesSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-sampling-diagnostic': {
      type: 'drill',
      title: '抽樣調查與診斷誤判',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224SamplingDiagnosticSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-exact-k-draw-probability-parameterized': {
      type: 'drill',
      title: '不放回抽取的恰好機率',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224ExactKDrawProbabilityParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-event-count-relations-parameterized': {
      type: 'drill',
      title: '事件交並與條件機率',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224EventCountRelationsParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-expected-value-parameterized': {
      type: 'drill',
      title: '期望值與遊戲損益參數題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224ExpectedValueParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-same-group-together-parameterized': {
      type: 'drill',
      title: '同科目書排在一起（分組排列）',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222SameGroupTogetherArrangementParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-gender-non-adjacent-parameterized': {
      type: 'drill',
      title: '男女不相鄰排列',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222GenderNonAdjacentParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-three-set-union-parameterized': {
      type: 'drill',
      title: '三集合取捨原理與機率',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224ThreeSetInclusionExclusionParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-complement-independent-parameterized': {
      type: 'drill',
      title: '補集事件與獨立事件',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224ComplementIndependentParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-biased-binomial-at-least-parameterized': {
      type: 'drill',
      title: '二項分佈至少 k 次',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224BiasedBinomialAtLeastParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-total-probability-parameterized': {
      type: 'drill',
      title: '全機率公式',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224TotalProbabilityParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-hypergeometric-expected-value-parameterized': {
      type: 'drill',
      title: '超幾何分佈期望值',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224HypergeometricExpectedValueParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-grid-comparison-probability-parameterized': {
      type: 'drill',
      title: '方格大小比較機率',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224GridComparisonProbabilityParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-overlap-days-off-probability-parameterized': {
      type: 'drill',
      title: '休假日重疊機率',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224OverlapDaysOffProbabilityParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-transition-matrix-advanced': {
      type: 'drill',
      title: '轉移矩陣與穩定狀態',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildS224TransitionMatrixAdvancedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-quartiles-iqr-parameterized': {
      type: 'drill',
      title: '四分位數與四分位距',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231QuartilesIQRParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-grouped-mean-parameterized': {
      type: 'drill',
      title: '分組資料加權平均數估計',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231GroupedMeanParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-correlation-from-sums-parameterized': {
      type: 'drill',
      title: '由離差積和計算相關係數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232CorrelationFromSumsParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-least-squares-small-data-parameterized': {
      type: 'drill',
      title: '三點最小平方法迴歸直線',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232LeastSquaresSmallDataParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-geometric-growth-rate-parameterized': {
      type: 'drill',
      title: '平均成長率的幾何平均',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231GeometricGrowthRateParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-sqrt-score-transform-parameterized': {
      type: 'drill',
      title: '開根號調分反推原始平均',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231SqrtScoreTransformParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-variance-correction-difference-parameterized': {
      type: 'drill',
      title: '資料更正與變異數差',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231VarianceCorrectionDifferenceParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-equal-size-group-merge-parameterized': {
      type: 'drill',
      title: '等人數兩組合併平均與標準差',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231EqualSizeGroupMergeParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-mean-median-missing-score-parameterized': {
      type: 'drill',
      title: '平均數等於中位數反推缺值',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231MeanMedianMissingScoreParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-bounded-variance-max-parameterized': {
      type: 'drill',
      title: '範圍限制下的最大變異數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231BoundedVarianceMaxParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-delete-equal-high-values-parameterized': {
      type: 'drill',
      title: '刪除兩筆資料後重算平均與標準差',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231DeleteEqualHighValuesParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-signed-linear-correlation-parameterized': {
      type: 'drill',
      title: '正負線性變換下的相關係數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232SignedLinearCorrelationParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-perfect-line-correlation-parameterized': {
      type: 'drill',
      title: '完全線性相關的相關係數判定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232PerfectLineCorrelationParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-regression-line-prediction-parameterized': {
      type: 'drill',
      title: '由迴歸直線預測與解讀斜率',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232RegressionLinePredictionParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-regression-prediction-advanced': {
      type: 'drill',
      title: '迴歸直線與預測',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildS232RegressionPredictionAdvancedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-standardized-regression-parameterized': {
      type: 'drill',
      title: '標準化後的迴歸直線',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232StandardizedRegressionParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-regression-correlation-from-line-parameterized': {
      type: 'drill',
      title: '由迴歸線斜率反推相關係數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232RegressionCorrelationFromLineParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-tangent-ordering-parameterized': {
      type: 'drill',
      title: '正切值象限判斷與大小排列',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241TangentOrderingParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-sin-cos-sum-difference-parameterized': {
      type: 'drill',
      title: '正弦餘弦和差反推與乘積',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241SinCosSumDifferenceParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-trig-quadratic-algebra-advanced': {
      type: 'drill',
      title: '三角函數與二次方程根的代數綜合',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildS241TrigQuadraticAlgebraAdvancedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-tangent-expression-parameterized': {
      type: 'drill',
      title: '已知正切值化簡正餘弦分式',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241TangentExpressionParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-side-sum-ratio-sine-ratio-parameterized': {
      type: 'drill',
      title: '邊長和比例反推正弦比例',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242SideSumRatioSineRatioParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-ssa-solution-range-advanced': {
      type: 'drill',
      title: 'SSA 條件下的解數邊界判定',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildS242SsaSolutionRangeAdvancedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-sas-side-area-parameterized': {
      type: 'drill',
      title: '兩邊夾角求第三邊與面積',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242SasSideAreaParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-angle-bisector-median-advanced': {
      type: 'drill',
      title: '內角平分線與中線長度的精確計算',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildS242AngleBisectorMedianAdvancedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-isosceles-circumradius-parameterized': {
      type: 'drill',
      title: '等腰三角形外接圓半徑求底邊與面積',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242IsoscelesCircumradiusParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-cyclic-polygon-area-advanced': {
      type: 'drill',
      title: '圓內接四邊形與多邊形面積',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildS242CyclicPolygonAreaAdvancedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-two-observation-height-parameterized': {
      type: 'drill',
      title: '兩次仰角觀測求高度',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243TwoObservationHeightParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-bearing-cosine-distance-parameterized': {
      type: 'drill',
      title: '方位夾角與餘弦定理求距離',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243BearingCosineDistanceParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-plane-survey-cosine-advanced': {
      type: 'drill',
      title: '平面測量與餘弦定理建模',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildS243PlaneSurveyCosineAdvancedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-height-limit-floors-parameterized': {
      type: 'drill',
      title: '仰角限制求建築樓層上限',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243HeightLimitFloorsParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-core-stats-five-subtypes': {
      type: 'drill',
      title: '基本統計量與資料變換五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231CoreStatsFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-basic-ungrouped-statistics': {
      type: 'drill',
      title: '基礎統計量計算（未分組數據）',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231BasicUngroupedSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-linear-transform-statistics': {
      type: 'drill',
      title: '數據的線性變換',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231LinearTransformSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-linear-transform-update-advanced': {
      type: 'drill',
      title: '數據線性變換與統計量更新',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildS231LinearTransformUpdateAdvancedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-weighted-mean-applications': {
      type: 'drill',
      title: '加權平均與幾何平均數應用',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231WeightedMeanSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-z-score-standardization': {
      type: 'drill',
      title: '數據標準化（Z 分數）',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231ZScoreSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-binary-data-analysis': {
      type: 'drill',
      title: '二元數據（0 與 1）的特殊標準差',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231BinaryDataSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-binary-data-statistics-advanced': {
      type: 'drill',
      title: '二元數據（0 與 1）的統計特性',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildS231BinaryDataAdvancedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-revision-merge-five-subtypes': {
      type: 'drill',
      title: '資料修正合併與變異追蹤五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231RevisionMergeFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-merge-loss-tracking': {
      type: 'drill',
      title: '數據合併與缺失值追蹤',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231MergeLossSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-data-revision': {
      type: 'drill',
      title: '數據更正與修補',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231DataRevisionSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-data-correction-statistics-advanced': {
      type: 'drill',
      title: '資料更正對平均與變異數的影響',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildS231DataCorrectionAdvancedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-group-merging': {
      type: 'drill',
      title: '多組數據合併',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231GroupMergingSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-algebraic-sums-variance': {
      type: 'drill',
      title: '平方和與變異數公式應用',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231AlgebraVarianceSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-geometric-mean-growth': {
      type: 'drill',
      title: '幾何平均數與平均成長率',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231GeometricGrowthSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-distribution-interpretation-five-subtypes': {
      type: 'drill',
      title: '分布判讀抽樣與分組資料五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231DistributionInterpretationFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-deviation-minimization': {
      type: 'drill',
      title: '離差平方與絕對值的極小化',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231DeviationMinimizationSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-percentile-outlier': {
      type: 'drill',
      title: '百分位數、四分位數與離群值',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231PercentileOutlierSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-sampling-methods': {
      type: 'drill',
      title: '抽樣方法與樣本代表性',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231SamplingMethodsSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-cumulative-frequency': {
      type: 'drill',
      title: '累積次數分配曲線的判定與比較',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231CumulativeFrequencySubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-1-grouped-data-estimation': {
      type: 'drill',
      title: '分組數據的統計量估計',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS231GroupedEstimationSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-correlation-five-subtypes': {
      type: 'drill',
      title: '相關係數與散布圖判讀五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232CorrelationFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-correlation-basic': {
      type: 'drill',
      title: '相關係數的基本計算',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232CorrelationBasicSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-scatter-judgment': {
      type: 'drill',
      title: '散布圖的判讀與性質',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232ScatterJudgmentSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-correlation-sensitivity': {
      type: 'drill',
      title: '特定點對相關係數的敏感度分析',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232CorrelationSensitivitySubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-linear-transform-correlation': {
      type: 'drill',
      title: '線性變換對相關係數與迴歸線的影響',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232LinearTransformCorrelationSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-regression-consistency': {
      type: 'drill',
      title: '迴歸分析的綜合性質判定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232RegressionConsistencySubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-regression-five-subtypes': {
      type: 'drill',
      title: '迴歸線最小平方法與變換五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232RegressionFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-regression-line': {
      type: 'drill',
      title: '迴歸直線方程式與預測',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232RegressionLineSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-reciprocal-slopes': {
      type: 'drill',
      title: '雙重迴歸線的斜率關係',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232ReciprocalSlopesSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-mean-point': {
      type: 'drill',
      title: '利用必過平均點性質求值',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232MeanPointSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-least-squares': {
      type: 'drill',
      title: '最小平方法定義的代數運算',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232LeastSquaresSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-3-2-transformed-regression': {
      type: 'drill',
      title: '變數線性變換後的迴歸線預測',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS232TransformedRegressionSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-basic-angle-coordinate-five-subtypes': {
      type: 'drill',
      title: '三角比座標象限與極座標五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241BasicFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-coordinate-conversion': {
      type: 'drill',
      title: '極坐標與直角坐標互換',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241CoordinateConversionSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-one-known-ratio': {
      type: 'drill',
      title: '已知廣義角三角比求其他項',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241OneKnownRatioSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-coterminal-quadrant': {
      type: 'drill',
      title: '同界角與象限角判別',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241CoterminalQuadrantSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-reduction-identities': {
      type: 'drill',
      title: '誘導公式與式子化簡',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241ReductionIdentitySubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-polar-geometry': {
      type: 'drill',
      title: '極坐標的幾何計算',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241PolarGeometrySubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-computation-geometry-five-subtypes': {
      type: 'drill',
      title: '三角函數計算與幾何應用五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241ComputationGeometryFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-trig-interpolation': {
      type: 'drill',
      title: '三角函數表與線性內插法',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241TrigInterpolationSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-trig-quadratic-roots': {
      type: 'drill',
      title: '三角比與二次方程式的根',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241TrigQuadraticRootsSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-representing-segments': {
      type: 'drill',
      title: '幾何圖形中的線段長度代數表示',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241RepresentingSegmentsSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-angle-bisector-area': {
      type: 'drill',
      title: '角平分線長度與面積性質',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241AngleBisectorAreaSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-trig-extrema-identities': {
      type: 'drill',
      title: '三角恆等式的極值與判定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241TrigExtremaIdentitySubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-side-altitude-sine-ratio': {
      type: 'drill',
      title: '邊長高與三角比的比例轉化',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241SideAltitudeSineRatioSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-same-angle-comparison': {
      type: 'drill',
      title: '同一角度不同三角比的大小比較',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241SameAngleComparisonSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-square-sum-identities': {
      type: 'drill',
      title: '平方關係與餘角性質的級數求和',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241SquareSumSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-terminal-line-definition': {
      type: 'drill',
      title: '終邊落在特定直線上的廣義角定義',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241TerminalLineDefinitionSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-triangle-angle-identities': {
      type: 'drill',
      title: '三角形內角特有的三角恆等變換',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241TriangleAngleIdentitySubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-triangle-identity-five-subtypes': {
      type: 'drill',
      title: '三角形比例比較與恆等式五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241TriangleIdentityFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-sine-law-five-subtypes': {
      type: 'drill',
      title: '正弦定理與邊角比例五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242SineLawFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-cosine-law-five-subtypes': {
      type: 'drill',
      title: '餘弦定理與三角形判定五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242CosineLawFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-area-radius-five-subtypes': {
      type: 'drill',
      title: '面積公式與內外接圓五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242AreaRadiusFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-special-segment-five-subtypes': {
      type: 'drill',
      title: '特殊線段與四邊形幾何五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242SpecialSegmentFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-sine-side-ratio': {
      type: 'drill',
      title: '邊角比例轉換與代數運算',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242SineSideRatioSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-asa-aas': {
      type: 'drill',
      title: '已知兩角一邊求其他元素',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242AsaAasSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-circumradius': {
      type: 'drill',
      title: '外接圓半徑的推導與計算',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242CircumradiusSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-ssa-ambiguous': {
      type: 'drill',
      title: 'SSA 條件下的解數判定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242SsaAmbiguousSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-altitude-sine-ratio': {
      type: 'drill',
      title: '結合高與邊角比例的綜合題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242AltitudeSineRatioSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-cosine-sas': {
      type: 'drill',
      title: '已知兩邊一夾角求第三邊',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242CosineSasSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-cosine-sss-angle': {
      type: 'drill',
      title: '已知三邊長求內角',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242CosineSssAngleSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-algebraic-side-relation': {
      type: 'drill',
      title: '邊角關係的代數恆等式與比例轉換',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242AlgebraicSideRelationSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-triangle-shape': {
      type: 'drill',
      title: '三角形的形狀判定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242TriangleShapeSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-cyclic-quadrilateral-diagonal': {
      type: 'drill',
      title: '圓內接四邊形的邊長與對角線',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242CyclicQuadrilateralDiagonalSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-two-side-angle-area': {
      type: 'drill',
      title: '兩邊一夾角面積公式',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242TwoSideAngleAreaSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-heron-area': {
      type: 'drill',
      title: '海龍公式求面積',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242HeronAreaSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-inradius-circumradius': {
      type: 'drill',
      title: '面積與外接圓內切圓半徑的關係',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242InradiusCircumradiusSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-cyclic-quadrilateral-area': {
      type: 'drill',
      title: '圓內接四邊形的面積',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242CyclicQuadrilateralAreaSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-diagonal-area-extrema': {
      type: 'drill',
      title: '對角線與夾角及面積最大值的應用',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242DiagonalAreaExtremaSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-median-length': {
      type: 'drill',
      title: '中線定理與中線長度計算',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242MedianLengthSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-angle-bisector-length': {
      type: 'drill',
      title: '角平分線長度判定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242AngleBisectorLengthSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-height-projection': {
      type: 'drill',
      title: '高的比例與投影關係',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242HeightProjectionSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-parallelogram-diagonal': {
      type: 'drill',
      title: '平行四邊形定理與複合四邊形幾何',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242ParallelogramDiagonalSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-2-trapezoid-area': {
      type: 'drill',
      title: '梯形與多邊形面積應用',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS242TrapezoidAreaSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-elevation-spatial-five-subtypes': {
      type: 'drill',
      title: '立體仰俯角與空間測量五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243ElevationSpatialFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-navigation-motion-five-subtypes': {
      type: 'drill',
      title: '航行方位與動態追蹤五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243NavigationMotionFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-plane-survey-five-subtypes': {
      type: 'drill',
      title: '平面測量與跨越障礙五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243PlaneSurveyFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-special-measurement-five-subtypes': {
      type: 'drill',
      title: '特殊線段與測量模型五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243SpecialMeasurementFiveSubtypeMixedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-asa-cross-distance': {
      type: 'drill',
      title: '平面測量：跨越障礙求距離（ASA/AAS）',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243AsaCrossDistanceSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-sas-cross-distance': {
      type: 'drill',
      title: '平面測量：跨越障礙物求距離（SAS）',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243SasCrossDistanceSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-slope-double-observation': {
      type: 'drill',
      title: '平面測量：坡度上的二次觀測',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243SlopeDoubleObservationSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-segmented-height': {
      type: 'drill',
      title: '分段高度與疊加測量題型',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243SegmentedHeightSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-arbitrary-division-line': {
      type: 'drill',
      title: '任意分點的距離與分線',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243ArbitraryDivisionLineSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-common-elevation-circumradius': {
      type: 'drill',
      title: '立體測量：共仰角求高度',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243CommonElevationCircumradiusSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-depression-two-targets': {
      type: 'drill',
      title: '高處對地面多目標觀測',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243DepressionTwoTargetsSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-same-elevation-circumcenter': {
      type: 'drill',
      title: '共仰角觀測與外心性質',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243SameElevationCircumcenterSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-offset-collinear-observation': {
      type: 'drill',
      title: '非通過底部的共線三點觀測',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243OffsetCollinearObservationSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-spatial-motion-tracking': {
      type: 'drill',
      title: '空間動態目標與方位追蹤',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243SpatialMotionTrackingSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-bearing-navigation': {
      type: 'drill',
      title: '航行與追蹤：方位轉換與目標間距',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243BearingNavigationSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-perpendicular-bearing': {
      type: 'drill',
      title: '方位角與垂直方向觀測',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243PerpendicularBearingSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-typhoon-tracking': {
      type: 'drill',
      title: '颱風侵襲路徑分析',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243TyphoonTrackingSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-uniform-motion-angle-change': {
      type: 'drill',
      title: '等速運動與角度變化率',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243UniformMotionAngleChangeSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-dynamic-shortest-distance': {
      type: 'drill',
      title: '動態運動：兩移動物體間的最短距離',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243DynamicShortestDistanceSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-angle-bisector-measurement': {
      type: 'drill',
      title: '角平分線測量題型',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243AngleBisectorMeasurementSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-median-centroid-measurement': {
      type: 'drill',
      title: '中線定理與重心測量題型',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243MedianCentroidMeasurementSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-displacement-segment': {
      type: 'drill',
      title: '動態運動產生的位移線段',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243DisplacementSegmentSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-height-projection-stack': {
      type: 'drill',
      title: '分段高度與投影疊加',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243HeightProjectionStackSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-bearing-target-distance': {
      type: 'drill',
      title: '方位角與目標距離計算',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243BearingTargetDistanceSubtypeSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-set-equality-unknowns-parameterized': {
      type: 'drill',
      title: '集合相等與差集求未知數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221SetEqualityUnknownsParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-1-proposition-equivalence-negation-parameterized': {
      type: 'drill',
      title: '命題的等價敘述與否定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS221PropositionEquivalenceNegationParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-grid-rectangle-count-parameterized': {
      type: 'drill',
      title: '棋盤格矩形計數與指定點',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222GridRectangleCountParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-lattice-walk-displacement-parameterized': {
      type: 'drill',
      title: '數線與格點跳動位移計數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222LatticeWalkDisplacementParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-2-restricted-consecutive-step-staircase-parameterized': {
      type: 'drill',
      title: '限制連續跳兩階的爬樓梯計數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS222RestrictedStaircaseParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-exam-partial-guess-expected-score-parameterized': {
      type: 'drill',
      title: '測驗猜題得分期望值',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224ExamPartialGuessExpectedScoreParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-linear-distribution-normalization-parameterized': {
      type: 'drill',
      title: '線性機率分布求參數與期望值',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224LinearDistributionNormalizationParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-2-4-color-exhausted-order-parameterized': {
      type: 'drill',
      title: '不放回抽球顏色取完順序機率',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS224ColorExhaustedOrderParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-line-slope-angle-parameterized': {
      type: 'drill',
      title: '兩直線斜率求夾角',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241LineSlopeAngleParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-1-coterminal-quadrant-count-parameterized': {
      type: 'drill',
      title: '同界角象限個數統計',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS241CoterminalQuadrantCountParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
    's2-4-3-box-space-angle-parameterized': {
      type: 'drill',
      title: '長方體空間角度',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildS243BoxSpaceAngleParameterizedSet(resolvePracticeCount(count, 5));
      },
    },
  };

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
    if (!id.startsWith('s2-1-') || !config || typeof config.generate !== 'function') return;
    const originalGenerate = config.generate;
    const target = config.questionCount;
    config.generate = function generateUniqueS21PracticeSet() {
      return buildUniquePracticeSet(() => originalGenerate.call(this), target);
    };
  });

  Object.entries(nextConfigs).forEach(([id, config]) => {
    if (!id.startsWith('s2-2-') || !config || typeof config.generate !== 'function') return;
    const originalGenerate = config.generate;
    const target = config.questionCount;
    config.generate = function generateUniqueS22PracticeSet() {
      return buildUniquePracticeSet(() => originalGenerate.call(this), target);
    };
  });

  Object.entries(nextConfigs).forEach(([id, config]) => {
    if (!id.startsWith('s2-3-') || !config || typeof config.generate !== 'function') return;
    const originalGenerate = config.generate;
    const target = config.questionCount;
    config.generate = function generateUniqueS23PracticeSet() {
      return buildUniquePracticeSet(() => originalGenerate.call(this), target);
    };
  });

  Object.entries(nextConfigs).forEach(([id, config]) => {
    if (!id.startsWith('s2-4-') || !config || typeof config.generate !== 'function') return;
    const originalGenerate = config.generate;
    const target = config.questionCount;
    config.generate = function generateUniqueS24PracticeSet() {
      return buildUniquePracticeSet(() => originalGenerate.call(this), target);
    };
  });

  const s2QuestionPrompts = [
    '請依題意作答：',
    '請完整寫出結論：',
    '請先整理條件後求解：',
    '請用適當方法完成：',
    '請列式或說明理由：',
  ];
  Object.entries(nextConfigs).forEach(([id, config]) => {
    if (!id.startsWith('s2-2-') && !id.startsWith('s2-3-') && !id.startsWith('s2-4-')) return;
    const generate = config.generate;
    config.generate = function generateS2WithWordingVariation(count) {
      const generated = generate.call(this, count);
      const prompt = s2QuestionPrompts[randInt(0, s2QuestionPrompts.length - 1)];
      return {
        ...generated,
        questions: generated.questions.map((question) => `${prompt}${question}`),
      };
    };
  });

  const fingerprint = 's2-bundle-v20260717-s22-s23-s24-parameterized-infinite-v8';
  if (window.__s2BundleFingerprint === fingerprint) return;
  window.__s2BundleFingerprint = fingerprint;
  window.formulaPracticeStore.registerConfigs(nextConfigs);
})();
