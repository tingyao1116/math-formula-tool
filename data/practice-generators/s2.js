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
    const answers = [];
    const aTerm = (index) => latexSub('a', index);
    for (let i = 0; i < count; i += 1) {
      const mode = Number.isInteger(fixedMode) ? fixedMode : i % 5;
      if (mode === 0) {
        const type = randInt(0, 4);
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
          `簡答：\\(${aTerm(n)}=\\sqrt{${inside}}\\)。過程：代入 \\(n=${n}\\)，\\(${aTerm(n)}=\\sqrt{${p}\\cdot${n}+1}=\\sqrt{${inside}}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        const type = randInt(0, 4);
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
        const type = randInt(0, 4);
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
        const type = randInt(0, 4);
        if (type === 0) {
          questions.push(`等差中項與等比中項的應用。若 \\(x-1,\\ 2x+1,\\ 5x-3\\) 三數成等差數列，求 \\(x\\)。`);
          answers.push(
            `簡答：\\(x=3\\)。過程：三數成等差表示中項兩倍等於兩端和：\\(2(2x+1)=(x-1)+(5x-3)\\)。整理得 \\(4x+2=6x-4\\)，所以 \\(x=3\\)。`
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
          const a = 1;
          const b = 10;
          questions.push(
            `等差中項與等比中項的應用。已知 \\(a,2,b\\) 成等比數列，且 \\(a,5,b\\) 成等差數列，求 \\(a^2+b^2\\)。`
          );
          answers.push(
            `簡答：92。過程：由等比得 \\(2^2=ab\\)，所以 \\(ab=4\\)。由等差得 \\(a+b=10\\)。因此 \\(a^2+b^2=(a+b)^2-2ab=100-8=92\\)。`
          );
          continue;
        }
        if (type === 3) {
          const nums = [3, 6, 12];
          questions.push(`等差中項與等比中項的應用。若三正數成等比數列，其積為 216，其和為 21，求此三數。`);
          answers.push(
            `簡答：3、6、12。過程：設三數為 \\(\\frac{a}{r},a,ar\\)。其積為 \\(a^3=216\\)，得 \\(a=6\\)。又總和 21，所以 \\(\\frac{6}{r}+6+6r=21\\)，解得 \\(r=2\\) 或 \\(\\frac12\\)，三數為 3、6、12。`
          );
          continue;
        }
        questions.push(
          `等差中項與等比中項的應用。若 \\(x,y\\) 的算術平均數為 10，幾何平均數為 8，求以 \\(x,y\\) 為兩根的一元二次方程式。`
        );
        answers.push(
          `簡答：\\(t^2-20t+64=0\\)。過程：算術平均為 10，故 \\(x+y=20\\)；幾何平均為 8，故 \\(xy=64\\)。以 \\(x,y\\) 為根的方程式為 \\(t^2-(x+y)t+xy=0\\)，所以 \\(t^2-20t+64=0\\)。`
        );
        continue;
      }

      const type = randInt(0, 4);
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    const aTerm = (index) => latexSub('a', index);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;

      if (type === 0) {
        const first = [2, 3, 5][randInt(0, 2)];
        const r = [2, 3][randInt(0, 1)];
        const last = first * powInt(r, 4);
        questions.push(
          `等差與等比數列的混合參數：在 ${first} 與 ${last} 之間插入三個實數 \\(x,y,z\\)，使五個數成等比數列，求此數列所有可能的公比。`
        );
        answers.push(
          `簡答：\\(r=${r}\\) 或 \\(r=-${r}\\)。過程：五項為 \\(${first},x,y,z,${last}\\)，所以 \\(${first}r^4=${last}\\)，得 \\(r^4=${powInt(r, 4)}\\)。因此實數公比為 \\(\\pm${r}\\)。`
        );
        continue;
      }

      if (type === 1) {
        const d = 2 * randInt(1, 4);
        const b = (d * d + 2 * d + 2) / 2;
        const a = b - d;
        const c = b + d;
        const sum = a + b + c;
        questions.push(
          `等差與等比數列的混合參數：已知 \\(a,b,c\\) 成遞增等差數列且和為 ${sum}；若 \\(a-1,b-1,c+1\\) 成等比數列，求 \\((a,b,c)\\)。`
        );
        answers.push(
          `簡答：\\((a,b,c)=(${a},${b},${c})\\)。過程：設三數為 \\(b-d,b,b+d\\)，由和為 ${sum} 得 \\(b=${b}\\)。又 \\((b-1)^2=(b-d-1)(b+d+1)\\)，解得 \\(d=${d}\\)，所以三數為 ${a},${b},${c}。`
        );
        continue;
      }

      if (type === 2) {
        questions.push(
          `等差與等比數列的混合參數：已知 \\(a,2,b\\) 三數成等比數列，且 \\(a,5,b\\) 三數成等差數列，求 \\(|a-b|\\) 的值。`
        );
        answers.push(
          `簡答：\\(2\\sqrt{21}\\)。過程：由等比中項得 \\(ab=2^2=4\\)；由等差中項得 \\(a+b=10\\)。因此 \\((a-b)^2=(a+b)^2-4ab=100-16=84\\)，所以 \\(|a-b|=${formatRadical(84)}\\)。`
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

      const d = pickNonZero(-4, 5);
      questions.push(
        `等差與等比數列的混合參數：已知 \\(${aTerm(1)},${aTerm(2)},${aTerm(3)},${aTerm(4)}\\) 成等差數列，公差為 \\(d\\)。設 \\(b_n=2^{a_n}\\)，證明 \\(b_n\\) 為等比數列並用 \\(d\\) 表示其公比。`
      );
      answers.push(
        `簡答：\\(b_n\\) 為等比數列，公比為 \\(2^d\\)。過程：因為 \\(a_{n+1}=a_n+d\\)，所以 \\(\\frac{b_{n+1}}{b_n}=\\frac{2^{a_{n+1}}}{2^{a_n}}=2^{a_{n+1}-a_n}=2^d\\)。相鄰兩項比值固定，故 \\(b_n\\) 是等比數列。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS211VisualGroupPatternSet(count) {
    const questions = [];
    const answers = [];
    const aTerm = (index) => latexSub('a', index);

    for (let i = 0; i < count; i += 1) {
      const type = i % 5;
      const cycle = Math.floor(i / 5);

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS211RecurrenceTransformSet(count) {
    const questions = [];
    const answers = [];
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
        const a1 = randInt(1, c - 1);
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS211CumulativeProductRecurrenceSet(count) {
    const questions = [];
    const answers = [];
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS211CombinatorialRecurrenceSet(count) {
    const questions = [];
    const answers = [];
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS211GeometricCoordinateSequenceSet(count) {
    const questions = [];
    const answers = [];
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
          `簡答：\\(P_{${n}}=${pointText(x, y)}\\)。過程：從 \\(P_1=(1,0)\\) 開始，依序把第 2 次到第 ${n} 次的位移向量相加；水平方向與鉛直方向分開累加，可得座標為 ${pointText(x, y)}。`
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
            `簡答：\\(n=${n}\\)。過程：等差級數和 \\(S_n=\\frac{n(a_1+a_n)}{2}\\)，所以 ${sum}\\(=\\frac{n(${a1}+${an})}{2}\\)，解得 \\(n=${n}\\)。`
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
          `簡答：\\(a_1=${a1}\\)，\\(a_n=${formatLinearN(coef, constant)}\\)。過程：\\(a_1=S_1=${p}+(${q})=${a1}\\)。當 \\(n\\ge2\\) 時，\\(a_n=S_n-S_{n-1}=${formatLinearN(coef, constant)}\\)，代入 \\(n=1\\) 也得到 ${a1}，所以此式可作為一般項。`
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
          `兩等差數列的和與項之比。設兩等差數列前 \\(n\\) 項和之比為 \\((${alpha}n+${c1}):(${beta}n+${c2})\\)，求兩數列第 ${k} 項之比。`
        );
        answers.push(
          `簡答：${ratio}。過程：等差數列前 \\(n\\) 項和可寫成 \\(\\frac{n}{2}\\) 乘上一個關於 \\(n\\) 的一次式。若和比的一次式為 \\(${alpha}n+${c1}\\)，則第 \\(k\\) 項對應 \\(${alpha}(2k-1)+${c1}\\)。所以第 ${k} 項之比為 \\([${alpha}(2\\cdot${k}-1)+${c1}]:[${beta}(2\\cdot${k}-1)+${c2}]=${firstTerm}:${secondTerm}=${ratio}\\)。`
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
          const sides = randInt(5, 12);
          const d = randInt(1, 4) * 5;
          const minAngle = (((sides - 2) * 180 * 2) / sides - (sides - 1) * d) / 2;
          if (!Number.isInteger(minAngle) || minAngle <= 0) {
            i -= 1;
            continue;
          }
          questions.push(`生活情境應用。一凸多邊形內角成等差數列，最小角為 ${minAngle}°，公差為 ${d}°，求邊數。`);
          answers.push(
            `簡答：${sides} 邊。過程：設邊數為 \\(n\\)，內角和為 \\((n-2)180°\\)。等差和為 \\(\\frac{n}{2}[2\\cdot${minAngle}+(n-1)${d}]\\)。代入檢查可得 \\(n=${sides}\\) 時兩邊皆為 ${(sides - 2) * 180}°，所以邊數為 ${sides}。`
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
        const n = randInt(5, 12);
        const value = makeFraction(1, (2 * n + 1) * (2 * n - 1));
        questions.push(`給定前 \\(n\\) 項和公式求一般項。設 \\(S_n=\\frac{n}{2n+1}\\)，求 \\(${aTerm(n)}\\)。`);
        answers.push(
          `簡答：\\(${aTerm(n)}=${formatFraction(value.num, value.den)}\\)。過程：\\(a_n=S_n-S_{n-1}=\\frac{n}{2n+1}-\\frac{n-1}{2n-1}=\\frac{1}{(2n+1)(2n-1)}\\)。代入 \\(n=${n}\\)，得 \\(${aTerm(n)}=${formatFraction(value.num, value.den)}\\)。`
        );
        continue;
      }
      if (type === 2) {
        const n = randInt(6, 12);
        const value = powInt(2, n - 1);
        questions.push(
          `給定前 \\(n\\) 項和公式求一般項。設 \\(S_n=2^n-1\\)，求 \\(${aTerm(n)}\\)，並判斷是否為等比數列。`
        );
        answers.push(
          `簡答：\\(${aTerm(n)}=${value}\\)，此數列為等比數列。過程：\\(a_n=S_n-S_{n-1}=(2^n-1)-(2^{n-1}-1)=2^{n-1}\\)。相鄰兩項比值為 2，所以是等比數列。`
        );
        continue;
      }
      if (type === 3) {
        const n = randInt(4, 9);
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
            `簡答：${fractionText(sum)}。過程：\\(S_n=a_1\\frac{1-r^n}{1-r}\\)，所以 \\(S_{${n}}=${fractionText(a1)}\\cdot\\frac{1-2^{${n}}}{1-2}=${fractionText(sum)}\\)。`
          );
          continue;
        }
        if (type === 2) {
          const a1 = makeFraction(randInt(2, 9), 1);
          const r = makeFraction(2, 1);
          const n = randInt(5, 10);
          const sum = geometricSumFraction(a1, r, n);
          questions.push(
            `基礎參數求和。已知等比數列首項為 ${fractionText(a1)}，公比為 2，總和為 ${fractionText(sum)}，求項數 \\(n\\)。`
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
          `簡答：${fractionText(sum)}。過程：\\(S_n=a_1\\frac{1-r^n}{1-r}\\)，所以 \\(S_{${n}}=${fractionText(a1)}\\cdot\\frac{1-(\\frac12)^{${n}}}{1-\\frac12}=${fractionText(sum)}\\)。`
        );
        continue;
      }

      if (mode === 1) {
        const type = i % 5;
        if (type < 2) {
          const a1 = makeFraction([2, 3, 4, 5][randInt(0, 3)], 1);
          const r = makeFraction([2, 3][randInt(0, 1)], 1);
          const n = randInt(5, 8);
          const last = geometricTermFraction(a1, r, n);
          const sum = geometricSumFraction(a1, r, n);
          questions.push(`級數求和計算。求等比級數 \\(${formatGeometricSeriesTerms(a1, r, n)}\\) 的總和。`);
          answers.push(
            `簡答：${fractionText(sum)}。過程：首項為 ${fractionText(a1)}，公比為 ${fractionText(r)}，末項為 ${fractionText(last)}，共有 ${n} 項。套用等比級數和公式得 \\(S_{${n}}=${fractionText(sum)}\\)。`
          );
          continue;
        }
        if (type < 4) {
          const a1 = makeFraction([128, 256, 384][randInt(0, 2)], 1);
          const r = makeFraction(1, 2);
          const n = randInt(6, 9);
          const sum = geometricSumFraction(a1, r, n);
          questions.push(`級數求和計算。求等比級數 \\(${formatGeometricSeriesTerms(a1, r, n)}\\) 的總和。`);
          answers.push(
            `簡答：${fractionText(sum)}。過程：此級數首項為 ${fractionText(a1)}、公比為 \\(\\frac12\\)、共 ${n} 項，所以 \\(S_{${n}}=${fractionText(a1)}\\frac{1-(\\frac12)^{${n}}}{1-\\frac12}=${fractionText(sum)}\\)。`
          );
          continue;
        }
        const a1 = makeFraction(1, 1);
        const r = makeFraction(2, 3);
        const n = randInt(5, 9);
        const sum = geometricSumFraction(a1, r, n);
        questions.push(`級數求和計算。求等比級數 \\(1+\\frac23+\\frac49+\\cdots\\) 的前 ${n} 項和。`);
        answers.push(
          `簡答：${fractionText(sum)}。過程：首項為 1，公比為 \\(\\frac23\\)，所以 \\(S_{${n}}=\\frac{1-(\\frac23)^{${n}}}{1-\\frac23}=${fractionText(sum)}\\)。`
        );
        continue;
      }

      if (mode === 2) {
        const base = randInt(1, 8);
        const q = [2, 3, 4][randInt(0, 2)];
        const s1 = base;
        const s2 = base * (1 + q);
        const s3 = base * (1 + q + q * q);
        const block = [4, 5, 10][randInt(0, 2)];
        questions.push(
          `分段和性質的應用。設等比級數前 ${block} 項和為 ${s1}，前 ${2 * block} 項和為 ${s2}，求前 ${3 * block} 項和。`
        );
        answers.push(
          `簡答：${s3}。過程：等比級數每一段相同長度的和也成等比。設第二段與第一段的比為 \\(q\\)，由 \\(${s2}=${s1}(1+q)\\) 得 \\(q=${q}\\)。所以前三段和為 \\(${s1}(1+${q}+${q}^2)=${s3}\\)。`
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
        if (type < 4) {
          const c = randInt(1, 5);
          const r = 3;
          const n = randInt(4, 7);
          const an = c * (r - 1) * powInt(r, n - 1);
          questions.push(`已知 \\(S_n\\) 公式求一般項。已知 \\(S_n=${c}(3^n-1)\\)，求一般項 \\(a_n\\)。`);
          answers.push(
            `簡答：\\(a_n=${2 * c}\\cdot3^{n-1}\\)。過程：\\(a_n=S_n-S_{n-1}\\)，所以 \\(a_n=${c}(3^n-1)-${c}(3^{n-1}-1)=${2 * c}\\cdot3^{n-1}\\)。例如 \\(a_{${n}}=${an}\\)。`
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
          `生活情境應用。一個球從 ${height} 公尺落下，每次著地後跳回原高度的 \\(\\frac13\\)，求第 ${bounce} 次著地時，球所經過的總路程。`
        );
        answers.push(
          `簡答：${fractionText(distance)} 公尺。過程：第一次落下為 ${height} 公尺；之後每次彈起與落下成對出現，長度形成等比級數。總路程為 \\(${height}+2(${height}\\cdot\\frac13+${height}\\cdot(\\frac13)^2+\\cdots+${height}\\cdot(\\frac13)^{${bounce - 1}})=${fractionText(distance)}\\)。`
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = Number.isInteger(fixedMode) ? fixedMode : i % 5;

      if (mode === 0) {
        const type = i % 5;
        if (type === 0) {
          const upper = randInt(10, 25);
          const value = sumSquares(upper);
          questions.push(`標準公式與範圍變換。計算 \\(\\sum_{k=1}^{${upper}} k^2\\) 的值。`);
          answers.push(
            `簡答：${value}。過程：\\(\\sum_{k=1}^{n}k^2=\\frac{n(n+1)(2n+1)}{6}\\)。代入 \\(n=${upper}\\)，得 \\(\\frac{${upper}\\cdot${upper + 1}\\cdot${2 * upper + 1}}{6}=${value}\\)。`
          );
          continue;
        }
        if (type === 1) {
          const upper = randInt(6, 14);
          const value = sumCubes(upper) + upper;
          questions.push(`標準公式與範圍變換。求 \\(\\sum_{k=1}^{${upper}}(k^3+1)\\) 之總和。`);
          answers.push(
            `簡答：${value}。過程：\\(\\sum(k^3+1)=\\sum k^3+\\sum1\\)，且 \\(\\sum_{k=1}^{n}k^3=\\left[\\frac{n(n+1)}{2}\\right]^2\\)。代入 \\(n=${upper}\\)，得 ${sumCubes(upper)}+${upper}=${value}\\)。`
          );
          continue;
        }
        if (type === 2) {
          const start = randInt(5, 12);
          const end = start + randInt(6, 12);
          const value = sumSquaresRange(start, end);
          questions.push(`標準公式與範圍變換。計算 \\(${start}^2+${start + 1}^2+\\cdots+${end}^2\\) 的值。`);
          answers.push(
            `簡答：${value}。過程：改寫為 \\(\\sum_{k=${start}}^{${end}}k^2=\\sum_{k=1}^{${end}}k^2-\\sum_{k=1}^{${start - 1}}k^2\\)。所以值為 ${sumSquares(end)}-${sumSquares(start - 1)}=${value}。`
          );
          continue;
        }
        if (type === 3) {
          const upper = randInt(8, 18);
          const value = sumSquares(upper) + sumFirstN(upper);
          questions.push(`標準公式與範圍變換。計算 \\(\\sum_{k=1}^{${upper}} k(k+1)\\) 的值。`);
          answers.push(
            `簡答：${value}。過程：\\(k(k+1)=k^2+k\\)，所以 \\(\\sum k(k+1)=\\sum k^2+\\sum k\\)。代入 \\(n=${upper}\\)，得 ${sumSquares(upper)}+${sumFirstN(upper)}=${value}。`
          );
          continue;
        }
        const m = randInt(5, 10);
        const n = randInt(m + 3, m + 8);
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
          const value = makeFraction(n, 2 * (n + 2));
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
        const n = randInt(6, 14);
        const value = powInt(2, n + 1) - 2 + sumFirstN(n);
        questions.push(`多項式與指數混合型 Sigma。求 \\(\\sum_{k=1}^{${n}}(2^k+k)\\) 的值。`);
        answers.push(
          `簡答：${value}。過程：拆成 \\(\\sum2^k+\\sum k\\)。其中 \\(\\sum_{k=1}^{${n}}2^k=2^{${n + 1}}-2\\)，\\(\\sum k=${sumFirstN(n)}\\)，所以總和為 ${value}。`
        );
        continue;
      }
      if (type === 1) {
        const n = randInt(5, 10);
        const value = (powInt(3, n + 1) - 3) / 2 - 2 * sumFirstN(n) + n;
        questions.push(`多項式與指數混合型 Sigma。計算 \\(\\sum_{k=1}^{${n}}(3^k-2k+1)\\)。`);
        answers.push(
          `簡答：${value}。過程：拆成 \\(\\sum3^k-2\\sum k+\\sum1\\)。代入 \\(\\sum3^k=\\frac{3^{${n + 1}}-3}{2}\\)、\\(\\sum k=${sumFirstN(n)}\\)、\\(\\sum1=${n}\\)，得 ${value}。`
        );
        continue;
      }
      if (type === 2) {
        const n = randInt(4, 8);
        const x = randInt(2, 5);
        const y = randInt(1, 4);
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
        const n = randInt(6, 12);
        const value = mulFraction(
          makeFraction(5, 1),
          subFraction(makeFraction(1, 1), powFraction(makeFraction(1, 2), n))
        );
        questions.push(`多項式與指數混合型 Sigma。求 \\(\\sum_{k=1}^{${n}}5\\cdot(\\frac12)^k\\) 的值。`);
        answers.push(
          `簡答：\\(${fractionText(value)}\\)。過程：這是首項 \\(\\frac52\\)、公比 \\(\\frac12\\) 的等比級數；或直接用公式 \\(5\\sum_{k=1}^{${n}}(\\frac12)^k=5(1-(\\frac12)^{${n}})=${fractionText(value)}\\)。`
        );
        continue;
      }
      const n = randInt(5, 10);
      const value = n + 1;
      questions.push(`多項式與指數混合型 Sigma。計算 \\(\\sum_{k=1}^{${n}}[(k+1)!-k!]\\)。`);
      answers.push(
        `簡答：\\(${n + 1}!-1\\)。過程：這是階乘型望遠鏡和，展開後 \\((2!-1!)+(3!-2!)+\\cdots+((${n}+1)!-${n}!)\\)，中間項抵消，剩下 \\((${n}+1)!-1!\\)，即 \\(${n + 1}!-1\\)。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const templates = [
      {
        q: '求級數 \\(7+77+777+\\cdots+\\underbrace{77\\cdots7}_{n\\text{ 位}}\\) 的總和公式。',
        a: '簡答：\\(\\frac79\\left(\\frac{10(10^n-1)}9-n\\right)\\)。過程：第 \\(k\\) 項為 \\(\\frac79(10^k-1)\\)。所以總和為 \\(\\frac79\\sum_{k=1}^{n}(10^k-1)=\\frac79\\left(\\frac{10(10^n-1)}9-n\\right)\\)。',
      },
      {
        q: '計算級數 \\(0.6+0.66+0.666+\\cdots\\) 前 10 項之和。',
        a: '簡答：\\(\\frac{20}{3}-\\frac{2}{27}(1-10^{-10})\\)。過程：第 \\(k\\) 項 \\(0.\\underbrace{66\\cdots6}_{k\\text{ 位}}=\\frac23(1-10^{-k})\\)。所以前 10 項和為 \\(\\sum_{k=1}^{10}\\frac23(1-10^{-k})=\\frac{20}{3}-\\frac23\\cdot\\frac{1-10^{-10}}9\\)。',
      },
      {
        q: '求級數 \\(9+99+999+\\cdots\\) 至第 \\(n\\) 項的和，並以 \\(n\\) 的函數表示。',
        a: '簡答：\\(\\frac{10(10^n-1)}9-n\\)。過程：第 \\(k\\) 項為 \\(10^k-1\\)。所以總和為 \\(\\sum_{k=1}^{n}(10^k-1)=\\frac{10(10^n-1)}9-n\\)。',
      },
      {
        q: '計算 \\(5+5.5+5.55+\\cdots\\) 前 20 項的總和。',
        a: '簡答：\\(100+\\frac{100}{9}-\\frac{50}{81}(1-10^{-20})\\)。過程：第 \\(j+1\\) 項可寫成 \\(5+\\frac59(1-10^{-j})\\)，其中 \\(j=0,1,\\ldots,19\\)。因此總和為 \\(100+\\frac59\\left(20-\\frac{1-10^{-20}}{1-10^{-1}}\\right)=100+\\frac{100}{9}-\\frac{50}{81}(1-10^{-20})\\)。',
      },
      {
        q: '設 \\(a_n=\\underbrace{11\\cdots1}_{n\\text{ 位}}\\)，求 \\(\\sum_{k=1}^{n}a_k\\) 的一般項。',
        a: '簡答：\\(\\frac19\\left(\\frac{10(10^n-1)}9-n\\right)\\)。過程：\\(a_k=\\frac{10^k-1}{9}\\)。所以 \\(\\sum_{k=1}^{n}a_k=\\frac19\\sum_{k=1}^{n}(10^k-1)=\\frac19\\left(\\frac{10(10^n-1)}9-n\\right)\\)。',
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

  function buildS212RadicalTelescopingSet(count) {
    const templates = [
      {
        q: '計算 \\(\\sum_{k=1}^{99}\\frac{1}{\\sqrt{k+1}+\\sqrt{k}}\\) 之值。',
        a: '簡答：9。過程：有理化得 \\(\\frac{1}{\\sqrt{k+1}+\\sqrt{k}}=\\sqrt{k+1}-\\sqrt{k}\\)。連續相消後剩 \\(\\sqrt{100}-\\sqrt1=10-1=9\\)。',
      },
      {
        q: '求級數 \\(\\frac1{\\sqrt3+\\sqrt1}+\\frac1{\\sqrt5+\\sqrt3}+\\cdots+\\frac1{\\sqrt{2n+1}+\\sqrt{2n-1}}\\) 的和。',
        a: '簡答：\\(\\frac{\\sqrt{2n+1}-1}{2}\\)。過程：\\(\\frac1{\\sqrt{2k+1}+\\sqrt{2k-1}}=\\frac{\\sqrt{2k+1}-\\sqrt{2k-1}}{2}\\)。展開後相消，剩 \\(\\frac{\\sqrt{2n+1}-1}{2}\\)。',
      },
      {
        q: '計算 \\(\\sum_{k=1}^{n}\\frac{1}{\\sqrt{2k+1}+\\sqrt{2k-1}}\\) 的通式。',
        a: '簡答：\\(\\frac{\\sqrt{2n+1}-1}{2}\\)。過程：每一項有理化後為 \\(\\frac{\\sqrt{2k+1}-\\sqrt{2k-1}}{2}\\)。相鄰根式逐項抵消，因此總和為 \\(\\frac{\\sqrt{2n+1}-1}{2}\\)。',
      },
      {
        q: '求級數 \\(\\sum_{k=1}^{48}\\frac{1}{\\sqrt{k+2}+\\sqrt{k+1}}\\) 的簡化值。',
        a: '簡答：\\(4\\sqrt2\\)。過程：有理化得 \\(\\frac{1}{\\sqrt{k+2}+\\sqrt{k+1}}=\\sqrt{k+2}-\\sqrt{k+1}\\)。相消後剩 \\(\\sqrt{50}-\\sqrt2=5\\sqrt2-\\sqrt2=4\\sqrt2\\)。',
      },
      {
        q: '計算 \\(\\frac1{\\sqrt1+\\sqrt2}+\\frac1{\\sqrt2+\\sqrt3}+\\cdots+\\frac1{\\sqrt{99}+\\sqrt{100}}\\)。',
        a: '簡答：9。過程：每一項有理化為 \\(\\sqrt{k+1}-\\sqrt{k}\\)。從 \\(k=1\\) 到 99 相消後，剩 \\(\\sqrt{100}-\\sqrt1=9\\)。',
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

  function buildS212ConsecutiveProductsSet(count) {
    const templates = [
      {
        q: '計算 \\(1\\cdot2+2\\cdot3+3\\cdot4+\\cdots+n(n+1)\\) 的總和。',
        a: '簡答：\\(\\frac{n(n+1)(n+2)}3\\)。過程：\\(k(k+1)=k^2+k\\)，所以總和為 \\(\\sum k^2+\\sum k=\\frac{n(n+1)(2n+1)}6+\\frac{n(n+1)}2=\\frac{n(n+1)(n+2)}3\\)。',
      },
      {
        q: '求級數 \\(1\\cdot2\\cdot3+2\\cdot3\\cdot4+\\cdots+10\\cdot11\\cdot12\\) 之值。',
        a: '簡答：4290。過程：\\(k(k+1)(k+2)=6\\binom{k+2}{3}\\)，所以 \\(\\sum_{k=1}^{10}k(k+1)(k+2)=6\\binom{13}{4}=4290\\)。',
      },
      {
        q: '計算 \\(\\sum_{k=1}^{n}(2k-1)(2k+1)\\)。',
        a: '簡答：\\(\\frac{n(4n^2+6n-1)}3\\)。過程：\\((2k-1)(2k+1)=4k^2-1\\)。所以總和為 \\(4\\sum k^2-\\sum1=4\\cdot\\frac{n(n+1)(2n+1)}6-n=\\frac{n(4n^2+6n-1)}3\\)。',
      },
      {
        q: '求 \\(\\sum_{k=1}^{10}k(k+1)(k+2)(k+3)\\) 的結果。',
        a: '簡答：48048。過程：\\(k(k+1)(k+2)(k+3)=24\\binom{k+3}{4}\\)。因此 \\(\\sum_{k=1}^{10}k(k+1)(k+2)(k+3)=24\\binom{14}{5}=48048\\)。',
      },
      {
        q: '計算級數 \\(1^2+2^2+\\cdots+n^2\\) 的另一種推導方式：利用 \\(\\sum k(k+1)-\\sum k\\)。',
        a: '簡答：\\(\\frac{n(n+1)(2n+1)}6\\)。過程：因為 \\(k^2=k(k+1)-k\\)，所以 \\(\\sum k^2=\\sum k(k+1)-\\sum k=\\frac{n(n+1)(n+2)}3-\\frac{n(n+1)}2=\\frac{n(n+1)(2n+1)}6\\)。',
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

  function buildS212GeometricStackingSet(count) {
    const templates = [
      {
        q: '高腳杯三角堆：最底層為邊長 15 的正三角形陣列，共堆疊 15 層，求總杯數。',
        a: '簡答：680。過程：第 \\(k\\) 層為三角數 \\(\\frac{k(k+1)}2\\)。總杯數為 \\(\\sum_{k=1}^{15}\\frac{k(k+1)}2=\\frac12(\\sum k^2+\\sum k)=680\\)。',
      },
      {
        q: '正方形柳丁塔：最底層為 \\(10\\times10\\) 的正方形，每往上一層長寬各減 1，求總個數。',
        a: '簡答：385。過程：各層個數為 \\(10^2,9^2,\\ldots,1^2\\)，所以總數為 \\(1^2+2^2+\\cdots+10^2=385\\)。',
      },
      {
        q: '長方形積木堆：最上層 \\(1\\times3\\)，往下一層長寬各增 1 與 2，求堆疊 10 層的總數。',
        a: '簡答：825。過程：由上往下第 \\(k+1\\) 層為 \\((1+k)(3+2k)\\)，其中 \\(k=0,1,\\ldots,9\\)。展開得 \\(2k^2+5k+3\\)，總和為 \\(2\\cdot285+5\\cdot45+30=825\\)。',
      },
      {
        q: '同心圓環面積：半徑為 \\(1,2,\\ldots,n\\) 的 \\(n\\) 個同心圓，求所有相鄰圓環面積組成的級數和。',
        a: '簡答：\\((n^2-1)\\pi\\)。過程：第 \\(k\\) 個圓環面積為 \\(\\pi k^2-\\pi(k-1)^2\\)，從 \\(k=2\\) 到 \\(n\\) 相加後對消，剩 \\(\\pi n^2-\\pi=(n^2-1)\\pi\\)。',
      },
      {
        q: '座標螺線長度：點從原點出發，依「右、上、左、下」移動，且第 \\(k\\) 次移動距離為 \\(k\\)，求第 \\(n\\) 次後路徑總長。',
        a: '簡答：\\(\\frac{n(n+1)}2\\)。過程：總路徑長就是 \\(1+2+3+\\cdots+n\\)，因此為 \\(\\frac{n(n+1)}2\\)。方向只影響位置，不影響路徑總長。',
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

  function buildS212AlgebraicVariantsSigmaSet(count) {
    const templates = [
      {
        q: '計算 \\(\\sum_{k=1}^{100}|k-50.5|\\) 的值。',
        a: '簡答：2500。過程：以 50.5 為中心，距離為 \\(0.5,1.5,\\ldots,49.5\\)，左右各一個。因此總和為 \\(2(0.5+1.5+\\cdots+49.5)=2500\\)。',
      },
      {
        q: '求級數 \\(\\sum_{k=1}^{20}(k\\cdot k!)\\) 的值。',
        a: '簡答：\\(21!-1\\)。過程：因為 \\(k\\cdot k!=(k+1)!-k!\\)，所以原式為 \\((2!-1!)+(3!-2!)+\\cdots+(21!-20!)\\)，相消後剩 \\(21!-1\\)。',
      },
      {
        q: '計算 \\(\\sum_{k=1}^{100}\\lfloor\\sqrt{k}\\rfloor\\)。',
        a: '簡答：625。過程：\\(\\lfloor\\sqrt{k}\\rfloor=m\\) 時，通常有 \\(2m+1\\) 個整數 \\(k\\)；從 \\(m=1\\) 到 9 的貢獻為 \\(\\sum_{m=1}^{9}m(2m+1)\\)，再加上 \\(k=100\\) 時的 10，得 \\(2\\cdot285+45+10=625\\)。',
      },
      {
        q: '求 \\(\\sum_{k=0}^{10}\\binom{10}{k}\\cdot2^k\\) 的值。',
        a: '簡答：59049。過程：由二項式定理，\\(\\sum_{k=0}^{10}\\binom{10}{k}2^k=\\sum_{k=0}^{10}\\binom{10}{k}1^{10-k}2^k=(1+2)^{10}=3^{10}=59049\\)。',
      },
      {
        q: '設 \\(f(n)=\\sum_{k=1}^{n}\\frac1{k^2+k}\\)，求滿足 \\(f(n)>0.99\\) 的最小正整數 \\(n\\)。',
        a: '簡答：100。過程：\\(\\frac1{k^2+k}=\\frac1k-\\frac1{k+1}\\)，所以 \\(f(n)=1-\\frac1{n+1}=\\frac n{n+1}\\)。由 \\(\\frac n{n+1}>\\frac{99}{100}\\)，得 \\(100n>99n+99\\)，所以 \\(n>99\\)，最小正整數為 100。',
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

  function buildS212SpecialSeriesSigmaFiveSubtypeMixedSet(count) {
    const banks = [
      buildS212RepeatingDigitsSeriesSet,
      buildS212RadicalTelescopingSet,
      buildS212ConsecutiveProductsSet,
      buildS212GeometricStackingSet,
      buildS212AlgebraicVariantsSigmaSet,
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
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS221CompetitionProbabilityPathsSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const aNow = cycle % 2 === 0 ? 2 : 1;
        const bNow = cycle % 2 === 0 ? 1 : 2;
        const needA = 3 - aNow;
        const needB = 3 - bNow;
        const paths = listCompetitionPaths(needA, needB);
        questions.push(
          `甲、乙兩人比賽，先勝 3 場者贏得比賽。若目前甲以 ${aNow}:${bNow} 領先，請用「甲、乙」列出後續所有可能的勝負路徑，並求共有幾種。`
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS221RouteSelectionCountingSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS221DigitFormationCountingSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

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
        `簡答：${total} 種。過程：圓環型塗色可用公式 \\((m-1)^n+(-1)^n(m-1)\\)。此處 \\(m=${colors}\\)、\\(n=${regions}\\)，所以共有 \\(${colors - 1}^{${regions}}-${colors - 1}=${total}\\) 種。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS221MultipleSurveyCountingSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

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
        questions.push(`在 \\((x+y+z+w)^{${power}}\\) 的展開式中，與 \\(xy^2z^2\\) 同型的項共有多少項？`);
        answers.push(
          `簡答：${countTerms} 項。過程：同型表示至少含有 \\(x^1y^2z^2\\)，已用去 ${requiredDegree} 次方。剩下 ${remain} 次方可分配給 \\(x,y,z,w\\) 四個變數，因此項數為 \\(C(${remain}+4-1,4-1)=${countTerms}\\)。`
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS221DivisorCountingConditionsSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const n = [360, 540, 720][cycle % 3];
        const factors = primeFactorize(n);
        const countD = divisorCountFromFactors(factors);
        const sumD = divisorSumFromFactors(factors);
        questions.push(`求 ${n} 的正因數個數及其總和。`);
        answers.push(
          `簡答：正因數 ${countD} 個，總和 ${sumD}。過程：${n}=${formatPrimeFactorization(factors)}。正因數個數為各指數加 1 後相乘，得 ${countD} 個；正因數總和為各質因數等比和相乘，得 ${sumD}。`
        );
        continue;
      }

      if (variant === 1) {
        const n = [5400, 7200, 10800][cycle % 3];
        const m = [12, 18, 20][cycle % 3];
        const factors = primeFactorize(n);
        const result = countDivisorsMatching(factors, (d) => d % m === 0);
        questions.push(`求 ${n} 的正因數中，為 ${m} 的倍數者共有多少個？`);
        answers.push(
          `簡答：${result} 個。過程：先將 ${n} 分解為 ${formatPrimeFactorization(factors)}。正因數若要是 ${m} 的倍數，必須至少含有 ${m} 的質因數需求；把符合條件的指數選擇數相乘，可得 ${result} 個。`
        );
        continue;
      }

      if (variant === 2) {
        const n = [1200, 1800, 2700][cycle % 3];
        const factors = primeFactorize(n);
        const result = countDivisorsMatching(factors, (d) => Number.isInteger(Math.sqrt(d)));
        questions.push(`求 ${n} 的正因數中，是完全平方數者共有多少個？`);
        answers.push(
          `簡答：${result} 個。過程：完全平方數的每個質因數指數都必須是偶數。把 ${n}=${formatPrimeFactorization(factors)} 中每個指數可取的偶數次方數量相乘，即得 ${result} 個。`
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
          `簡答：${powers.a * (powers.b + 1)} 個。過程：偶數表示 2 的指數可取 1 到 ${powers.a}，共有 ${powers.a} 種；不是 5 的倍數表示 5 的指數只能取 0；3 的指數可取 0 到 ${powers.b}，共有 ${powers.b + 1} 種。因此共有 ${powers.a}\\times${powers.b + 1}\\times1=${powers.a * (powers.b + 1)} 個。全部正因數則有 ${total} 個，這可作為檢查。`
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS221RouteRestrictionCountingSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS221RestrictedDigitCountingSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const digits = [0, 1, 2, 3, 4, 5];
        const total = 5 * 5 * 4;
        const even = [0, 2, 4].reduce((sum, last) => sum + (last === 0 ? 5 * 4 : 4 * 4), 0);
        questions.push(`用 ${digits.join('、')} 組成數字不重複的三位數，共有多少個？其中為偶數者有多少個？`);
        answers.push(
          `簡答：共有 ${total} 個，其中偶數 ${even} 個。過程：全部三位數：百位 5 種、十位 5 種、個位 4 種，共 ${total} 個。偶數看個位：若個位為 0，百位與十位有 5\\times4 種；若個位為 2 或 4，各有 4\\times4 種，所以偶數共有 ${even} 個。`
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
        const pairCount = Array.from({ length: 9 }, (_, idx) => idx + 1).reduce((sum, hundred) => {
          return sum + [hundred - 2, hundred + 2].filter((unit) => unit >= 0 && unit <= 9).length;
        }, 0);
        const total = pairCount * 10;
        questions.push('三位數中，百位數與個位數之差的絕對值為 2 的數共有幾個？');
        answers.push(
          `簡答：${total} 個。過程：百位可為 1 到 9。若個位與百位差 2，逐一計數共有 ${pairCount} 種百位與個位搭配；十位可任選 0 到 9，共 10 種，因此共有 ${pairCount}\\times10=${total} 個。`
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS221RegionColoringCountingSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const colors = 4 + (cycle % 3);
        const regions = 4 + (cycle % 3);
        const total = properColorCycleCount(colors, regions);
        questions.push(
          `用 ${colors} 種顏色塗成環狀排列的 ${regions} 個區域，相鄰區域不同色，顏色可重複使用，共有多少種塗法？`
        );
        answers.push(
          `簡答：${total} 種。過程：環狀相鄰塗色可用公式 \\((m-1)^n+(-1)^n(m-1)\\)。代入 \\(m=${colors}\\)、\\(n=${regions}\\)，得 ${total} 種。`
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
        q: '已知 \\(n\\) 為正整數，且 \\(P(n+1,3)=10P(n-1,2)\\)，求 \\(n\\) 之值。',
        a: '簡答：\\(n=4\\) 或 \\(n=5\\)。過程：\\(P(n+1,3)=(n+1)n(n-1)\\)，\\(P(n-1,2)=(n-1)(n-2)\\)。因為 \\(n\\ge3\\)，可同除以 \\(n-1\\)，得 \\(n(n+1)=10(n-2)\\)，即 \\(n^2-9n+20=0\\)，所以 \\(n=4\\) 或 \\(5\\)。',
      },
      {
        q: '解方程式 \\(P(n,4)=3024\\)。',
        a: '簡答：\\(n=9\\)。過程：\\(P(n,4)=n(n-1)(n-2)(n-3)\\)。試算 \\(9\\cdot8\\cdot7\\cdot6=3024\\)，故 \\(n=9\\)。',
      },
      {
        q: '已知 \\(P(n,3):P(n,2)=3:1\\)，求 \\(n\\)。',
        a: '簡答：\\(n=5\\)。過程：\\(P(n,3)=n(n-1)(n-2)\\)，\\(P(n,2)=n(n-1)\\)，比值為 \\(n-2\\)。由 \\(n-2=3\\)，得 \\(n=5\\)。',
      },
      {
        q: '若 \\(P(n+1,4)-10P(n-1,2)=4P(n,3)\\)，求 \\(n\\) 之值。',
        a: '簡答：\\(n=5\\)。過程：展開得 \\((n+1)n(n-1)(n-2)-10(n-1)(n-2)=4n(n-1)(n-2)\\)。同除非零因子 \\((n-1)(n-2)\\)，得 \\(n(n+1)-10=4n\\)，即 \\(n^2-3n-10=0\\)，正整數解為 \\(n=5\\)。',
      },
      {
        q: '已知 \\(P(n,3)=12P(n,2)\\)，求 \\(n\\) 之值。',
        a: '簡答：\\(n=14\\)。過程：\\(P(n,3)=n(n-1)(n-2)\\)，\\(P(n,2)=n(n-1)\\)。因為 \\(n\\ge3\\)，同除以 \\(n(n-1)\\)，得 \\(n-2=12\\)，所以 \\(n=14\\)。',
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

  function buildS222IdenticalItemsPermutationSet(count) {
    const templates = [
      {
        q: '將「SUCCESS」一字中的所有字母重新排列，共有多少種不同的排法？',
        a: '簡答：1260 種。過程：「SUCCESS」共有 7 個字母，其中 S 有 3 個、C 有 2 個，其餘 U、E 各 1 個，所以排法為 \\(\\frac{7!}{3!2!}=1260\\)。',
      },
      {
        q: '將「AABBCC」六個字母排成一列，規定相同字母均不相鄰，共有幾種排法？',
        a: '簡答：30 種。過程：先不管相鄰，總排法 \\(\\frac{6!}{2!2!2!}=90\\)。扣除至少一組相鄰可用容斥計算；或直接分類排列三對相同字母，得到相同字母均不相鄰的排法為 30 種。',
      },
      {
        q: '從「TENNESSEE」的 9 個字母中，任取 4 個字母排列，共有多少種排法？',
        a: '簡答：163 種。過程：字母數量為 E4 個、N2 個、S2 個、T1 個。可用生成函數整理為 \\(4!\\) 乘上 \\((1+x+\\frac{x^2}{2!}+\\frac{x^3}{3!}+\\frac{x^4}{4!})(1+x+\\frac{x^2}{2!})^2(1+x)\\) 中 \\(x^4\\) 的係數，計算得 163 種。',
      },
      {
        q: '將「MISSISSIPPI」中的字母全部重排，共有多少種不同的排法？',
        a: '簡答：34650 種。過程：共有 11 個字母，其中 I 有 4 個、S 有 4 個、P 有 2 個、M 有 1 個，所以不同排法為 \\(\\frac{11!}{4!4!2!}=34650\\)。',
      },
      {
        q: '有藍旗 3 面、白旗 2 面、紅旗 1 面，全升上旗竿可組成多少種不同信號？',
        a: '簡答：60 種。過程：共 6 面旗，其中藍旗 3 面相同、白旗 2 面相同、紅旗 1 面，所以不同排列為 \\(\\frac{6!}{3!2!1!}=60\\)。',
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

  function buildS222FixedRelativeOrderSet(count) {
    const templates = [
      {
        q: '將「ALGEBRA」一字的字母重排，若其中的母音 A、E、A 必須保持原來的相對順序，共有多少種排法？',
        a: '簡答：840 種。過程：「ALGEBRA」共有 7 個字母，A 重複 2 個。全部不同排法為 \\(\\frac{7!}{2!}=2520\\)。三個母音 A、E、A 的相對位置共有 3 種可能，要求保持 A、E、A 表示 E 在兩個 A 中間，所以取其中一種，得 \\(2520\\div3=840\\) 種。',
      },
      {
        q: '甲、乙、丙等 7 人排一列，若規定甲必須排在乙、丙、丁之左，則共有多少種排法？',
        a: '簡答：1260 種。過程：在甲、乙、丙、丁四人的相對順序中，甲排最左的機率為 \\(\\frac14\\)。全部 7 人排列有 \\(7!\\) 種，所以符合者為 \\(\\frac{7!}{4}=1260\\)。',
      },
      {
        q: '重排「ACCESS」一字，若限制 A 一定要排在 E 之前（不一定相鄰），共有幾種排法？',
        a: '簡答：180 種。過程：「ACCESS」共有 6 個字母，S 重複 2 個，全部排法為 \\(\\frac{6!}{2!}=360\\)。A 與 E 的相對順序一半為 A 在 E 前，所以有 \\(360\\div2=180\\) 種。',
      },
      {
        q: '棒球隊 9 名球員排打擊順序，若教練規定 4 位內野手必須安排在前 4 棒，其餘 5 人排後 5 棒，共有幾種安排方式？',
        a: '簡答：2880 種。過程：前 4 棒由 4 位內野手排列，有 \\(4!\\) 種；後 5 棒由其餘 5 人排列，有 \\(5!\\) 種。總數為 \\(4!5!=2880\\)。',
      },
      {
        q: '將甲、乙、丙、丁 4 人排成一列，規定甲必須在乙之左方，且乙必須在丙之左方，共有多少種排列？',
        a: '簡答：4 種。過程：甲、乙、丙三人的相對順序固定為甲在乙左、乙在丙左，可視為只固定三人的先後。四個位置中選 3 個放甲乙丙，其順序唯一，剩下位置放丁，所以有 \\(C(4,3)=4\\) 種。',
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

  function buildS222PositionConstraintSet(count) {
    const templates = [
      {
        q: '男生 4 人與女生 3 人排成一列拍照，若要求女生 3 人完全不相鄰，共有多少種排列法？',
        a: '簡答：1440 種。過程：先排 4 位男生有 \\(4!\\) 種，形成 5 個空位。選 3 個空位放女生並排列女生，有 \\(C(5,3)3!\\) 種，所以總數為 \\(4!C(5,3)3!=1440\\)。',
      },
      {
        q: '男生 5 人與女生 4 人排成一列，若要求任意兩個女孩都不相鄰，共有多少種排列法？',
        a: '簡答：86400 種。過程：先排 5 位男生有 \\(5!\\) 種，形成 6 個空位。選 4 個空位放女生並排列女生，有 \\(C(6,4)4!\\) 種，故共有 \\(5!C(6,4)4!=86400\\) 種。',
      },
      {
        q: '甲、乙、丙、丁、戊、己 6 人排成一列，規定甲不排首位且乙不排末位，共有多少種排列法？',
        a: '簡答：504 種。過程：全部 \\(6!\\) 種。甲排首位有 \\(5!\\) 種，乙排末位有 \\(5!\\) 種，兩者同時發生有 \\(4!\\) 種。由容斥得 \\(6!-2\\cdot5!+4!=504\\)。',
      },
      {
        q: '將「庭院深深深幾許」七字全取排列，要求三個「深」字完全分開，共有多少種排法？',
        a: '簡答：240 種。過程：先排 4 個非「深」字，有 \\(4!\\) 種，形成 5 個空位。選 3 個空位放三個相同的「深」，有 \\(C(5,3)\\) 種，所以共有 \\(4!C(5,3)=240\\) 種。',
      },
      {
        q: '5 男 5 女排成一列，要求男女相間的排列數共有多少種？',
        a: '簡答：28800 種。過程：性別位置可為男男女女交錯的兩種型態：男先或女先，共 2 種。男生內部有 \\(5!\\) 種，女生內部有 \\(5!\\) 種，所以共有 \\(2\\cdot5!\\cdot5!=28800\\) 種。',
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

  function buildS222DerangementPositionExclusionSet(count) {
    const templates = [
      {
        q: '甲、乙、丙、丁、戊 5 人排成一列，若要求甲不排首位、乙不排第二位、丙不排第三位，共有多少種排列法？',
        a: '簡答：64 種。過程：總數 \\(5!\\)。扣掉三個指定人坐到禁位的情形，用容斥：\\(5!-3\\cdot4!+3\\cdot3!-2!=64\\)。',
      },
      {
        q: '有 5 封不同的信與 5 個寫好地址的信封，將信隨機放入，求恰有 4 封放錯的情形共有多少種？',
        a: '簡答：45 種。過程：恰有 4 封放錯表示恰有 1 封放對。先選放對的信有 \\(C(5,1)\\) 種，其餘 4 封完全錯置有 \\(!4=9\\) 種，所以共有 \\(5\\cdot9=45\\) 種。',
      },
      {
        q: '將 1、2、3、4、5 五個數字排成一列 \\((a_1,a_2,a_3,a_4,a_5)\\)，求滿足 \\((a_1-1)(a_2-2)(a_3-3)\\ne0\\) 的排列數。',
        a: '簡答：64 種。過程：條件表示第 1 位不可放 1、第 2 位不可放 2、第 3 位不可放 3。與三個禁位容斥相同，所以為 \\(5!-3\\cdot4!+3\\cdot3!-2!=64\\)。',
      },
      {
        q: '10 位學生排成一列，若甲不可排首位，且乙不可排末位，共有多少種排列法？',
        a: '簡答：2903040 種。過程：全部 \\(10!\\) 種。甲首位有 \\(9!\\) 種，乙末位有 \\(9!\\) 種，同時發生有 \\(8!\\) 種。故為 \\(10!-2\\cdot9!+8!=2903040\\)。',
      },
      {
        q: '將 A、B、C、D、E 五人排成一列，規定 A 不在第 1 位、B 不在第 2 位、C 不在第 3 位，且 D 不在第 4 位，共有多少種排法？',
        a: '簡答：53 種。過程：全部有 \\(5!\\) 種。用容斥扣掉 4 個指定禁位：\\(5!-C(4,1)4!+C(4,2)3!-C(4,3)2!+C(4,4)1!=120-96+36-8+1=53\\) 種。',
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

  function buildS222DistributionRepeatedSet(count) {
    const templates = [
      {
        q: '將 5 封不同的信任意投入 4 個不同的郵筒，每一封信都有 4 種選擇，共有多少種投法？',
        a: '簡答：1024 種。過程：每封信可獨立選 4 個郵筒之一，所以共有 \\(4^5=1024\\) 種。',
      },
      {
        q: '有 6 件相異玩具分給甲、乙、丙三位兒童，若每人所得不限（可兼得，亦可不得），共有多少種分法？',
        a: '簡答：729 種。過程：每件玩具有 3 種歸屬選擇，6 件彼此獨立，所以共有 \\(3^6=729\\) 種。',
      },
      {
        q: '一個四位數字密碼（第一位可為 0），每位數字可由 0 到 9 任選，若要求密碼中至少含兩個連續的「2」，共有多少組？',
        a: '簡答：280 組。過程：總密碼 \\(10^4\\)。至少出現一段「22」可由位置 12、23、34 做容斥。三段各有 100 組，兩段重疊或分離分別修正，最後得 280 組。',
      },
      {
        q: '用 3 種不同獎品分給 5 位學生，每種獎品可給任一學生且可重複得獎，共有多少種頒發方式？',
        a: '簡答：125 種。過程：每種獎品有 5 位學生可選，三種獎品彼此獨立，所以共有 \\(5^3=125\\) 種。',
      },
      {
        q: '將 4 顆不同球放入 3 個不同盒子中，允許盒子為空，共有多少種放法？',
        a: '簡答：81 種。過程：每顆球都有 3 個盒子可選，4 顆球獨立選擇，所以共有 \\(3^4=81\\) 種。',
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

  function buildS222GridPathSet(count) {
    const templates = [
      {
        q: '在一個 \\(7\\times3\\) 的棋盤街道中，從 A 到 B 只能向右或向上走，共有多少種走法？',
        a: '簡答：120 種。過程：需要向右 7 步、向上 3 步，共 10 步，選出其中 3 步向上即可，所以為 \\(C(10,3)=120\\)。',
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
        q: '在棋盤街道中，從 A 到 B 需向右 6 步、向上 4 步，若不經過 \\((3,2)\\)，共有多少種走法？',
        a: '簡答：110 種。過程：全部走法為 \\(C(10,4)=210\\)。經過 \\((3,2)\\) 的走法為 \\(C(5,2)C(5,2)=100\\)。所以不經過該點為 \\(210-100=110\\)。',
      },
      {
        q: '在 \\(4\\times4\\) 棋盤街道中，從左下角到右上角，若必須經過中心點 \\((2,2)\\)，共有多少種捷徑走法？',
        a: '簡答：36 種。過程：從起點到中心需右 2、上 2，有 \\(C(4,2)=6\\) 種；中心到終點同樣有 6 種，所以共有 \\(6\\times6=36\\) 種。',
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

  function buildS222NumberFormationSet(count) {
    const templates = [
      {
        q: '用 0、1、2、3、4、5 六個數字組成數字不重複的三位數，其中 4 的倍數共有多少個？',
        a: '簡答：24 個。過程：4 的倍數由末兩位決定。從可用數字中列出末兩位為 4 的倍數且不重複者，再選百位且不可為 0、不與末兩位重複，逐一加總得 24 個。',
      },
      {
        q: '用 1、2、3、4、5 五個數字排成五位數，數字可以重複，則大於 23104 的數有多少個？',
        a: '簡答：2250 個。過程：依位數比較。萬位大於 2 有 \\(3\\cdot5^4=1875\\) 個；萬位為 2 且千位大於 3 有 \\(2\\cdot5^3=250\\) 個；前兩位為 23 且百位大於 1 有 \\(4\\cdot5^2=100\\) 個；前三位為 231 時，十位一定大於 0，有 \\(5^2=25\\) 個。合計 \\(1875+250+100+25=2250\\) 個。',
      },
      {
        q: '利用 1、2、3、4 組成數字不重複的四位數，求所有排出的四位數之總和。',
        a: '簡答：66660。過程：每個數字在千、百、十、個位各出現 \\(3!=6\\) 次，所以總和為 \\((1+2+3+4)\\cdot6\\cdot(1000+100+10+1)=66660\\)。',
      },
      {
        q: '用 1、2、3、4、5 五個數字組成數字不重複的五位數奇數，共有多少個？',
        a: '簡答：72 個。過程：個位需為 1、3、5，有 3 種；其餘四位排列剩下 4 個數字，有 \\(4!\\) 種，所以共有 \\(3\\cdot4!=72\\) 個。',
      },
      {
        q: '用 0、1、2、3、4、5 不重複組成三位數，求所有作成三位數的總和。',
        a: '簡答：32640。過程：百位不能為 0。分位值計算：百位每個 1 到 5 各出現 \\(5\\cdot4=20\\) 次；十位與個位需分別扣除百位限制後計算，總和為 32640。',
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
        q: '在數線上從原點出發移動 6 步（每步 +1 或 -1），若已知最後落在 +4 位置，共有多少種移動路徑？',
        a: '簡答：6 種。過程：設向右步數為 \\(r\\)、向左為 \\(l\\)，則 \\(r+l=6\\)、\\(r-l=4\\)，解得 \\(r=5,l=1\\)。所以只要選出哪一步向左，有 \\(C(6,1)=6\\) 種。',
      },
      {
        q: '將 4 個 A 與 3 個 B 排成一列，要求 A 恰好分成 2 個連串，共有多少種排法？',
        a: '簡答：18 種。過程：先把 4 個 A 分成 2 個非空連串，有 \\(C(3,1)=3\\) 種分法。3 個 B 形成前、中、後共 4 個空位，選 2 個空位放入這兩段 A，有 \\(C(4,2)=6\\) 種，所以共有 \\(3\\cdot6=18\\) 種。',
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

  function buildS222InternalOrderConstraintSet(count) {
    const templates = [
      {
        q: '射擊氣球問題：用三串分別為 2、3、3 個的氣球當靶子，規定每一串必須從最底下的氣球開始射破。射破全部 8 個氣球的次序有多少種？',
        a: '簡答：560 種。過程：每串內部順序固定，只需決定三串射擊動作在 8 個位置中的交錯方式，所以為 \\(\\frac{8!}{2!3!3!}=560\\)。',
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      questions.push(item.q);
      answers.push(item.a);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS223MixedSet(banks, count) {
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

  function buildS223BinomialCoefficientSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '求 \\((3x-2y)^6\\) 展開式中 \\(x^3y^3\\) 項的係數。',
          a: '簡答：\\(-4320\\)。過程：取 3 個 \\(-2y\\) 與 3 個 \\(3x\\)，係數為 \\(C(6,3)3^3(-2)^3=20\\cdot27\\cdot(-8)=-4320\\)。',
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
          q: '求 \\((x-\\frac{1}{x^2})^9\\) 展開式中的常數項。',
          a: '簡答：\\(-84\\)。過程：通項的 \\(x\\) 次方為 \\(9-k-2k=9-3k\\)，令其為 0 得 \\(k=3\\)。常數項為 \\(C(9,3)(-1)^3=-84\\)。',
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
          q: '計算 \\(C(50,0)+C(50,2)+C(50,4)+\\cdots+C(50,50)\\) 之值。',
          a: '簡答：\\(2^{49}\\)。過程：偶數項係數和等於奇數項係數和，且全部係數和為 \\((1+1)^{50}=2^{50}\\)，所以偶數項和為 \\(2^{49}\\)。',
        },
        {
          q: '若 \\(C(n,1)+2C(n,2)+4C(n,3)+\\cdots+2^{n-1}C(n,n)=3280\\)，求 \\(n\\)。',
          a: '簡答：\\(n=8\\)。過程：左式為 \\(\\frac{(1+2)^n-1}{2}=\\frac{3^n-1}{2}\\)。令 \\(\\frac{3^n-1}{2}=3280\\)，得 \\(3^n=6561=3^8\\)，所以 \\(n=8\\)。',
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
          q: '在一排 10 個座位中選取 3 個，要求這三個座位兩兩不相鄰，共有幾種選法？',
          a: '簡答：56 種。過程：選 3 個不相鄰位置可用間隔法，等於 \\(C(10-3+1,3)=C(8,3)=56\\) 種。',
        },
        {
          q: '一家公司計畫在 7 天中選擇 2 天停水，若要求停水的兩天不相連，共有幾種選擇？',
          a: '簡答：15 種。過程：任選兩天有 \\(C(7,2)=21\\) 種，相鄰兩天有 6 種，所以不相鄰有 \\(21-6=15\\) 種。',
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
          q: '一副 52 張撲克牌中任取 5 張，五張花色皆相同的 Flush 情形共有幾種？',
          a: '簡答：5148 種。過程：先選花色 4 種，再從同花色 13 張中選 5 張，有 \\(C(13,5)\\) 種，共 \\(4C(13,5)=5148\\) 種。',
        },
        {
          q: '同時擲三粒相同的骰子，若記錄點數排列且點數和為 9，共有幾種結果？',
          a: '簡答：25 種。過程：設三粒點數為 \\(x,y,z\\)，\\(1\\le x,y,z\\le6\\)，且 \\(x+y+z=9\\)。正整數解原有 \\(C(8,2)=28\\) 組，扣掉某一粒超過 6 的 3 組，得 25 種。',
        },
        {
          q: '同時擲三粒骰子，若三粒點數大小不同且點數和為 9，共有幾種結果？',
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
          q: '利用巴斯卡定理計算 \\(C(2,2)+C(3,2)+C(4,2)+\\cdots+C(99,2)\\) 的總和。',
          a: '簡答：\\(C(100,3)=161700\\)。過程：曲棍球棒公式給出 \\(C(2,2)+C(3,2)+\\cdots+C(99,2)=C(100,3)\\)。',
        },
        {
          q: '求級數和 \\(C(5,0)+C(6,1)+C(7,2)+\\cdots+C(100,95)\\) 的簡化結果。',
          a: '簡答：\\(C(101,6)\\)。過程：將各項改寫為 \\(C(5,5)+C(6,5)+\\cdots+C(100,5)\\)，由曲棍球棒公式得 \\(C(101,6)\\)。',
        },
        {
          q: '計算 \\(C(3,3)+C(4,3)+C(5,3)+\\cdots+C(89,3)\\)。',
          a: '簡答：\\(C(90,4)\\)。過程：由曲棍球棒公式，\\(\\sum_{r=3}^{89}C(r,3)=C(90,4)\\)。',
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
          q: '在 \\((x+y+z+u)^6\\) 展開式中，求 \\(x^3y^2u\\) 項的係數。',
          a: '簡答：60。過程：由多項式定理，指定項 \\(x^3y^2u\\) 的係數為 \\(\\frac{6!}{3!2!1!}=60\\)。',
        },
        {
          q: '求 \\((x+y+z)^{10}\\) 展開式中 \\(x^3y^2z^5\\) 項的係數。',
          a: '簡答：2520。過程：由多項式定理，係數為 \\(\\frac{10!}{3!2!5!}=2520\\)。',
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
          q: '設 \\(T=\\{1,2,3,4,5,6\\}\\)，求滿足 \\(\\varnothing\\subset A\\subset B\\subset T\\) 的有序對 \\((A,B)\\) 共有多少組？',
          a: '簡答：540 組。過程：每個元素可在 \\(A\\)、在 \\(B\\setminus A\\)、或在 \\(T\\setminus B\\) 三類。三類都要非空，所以用容斥得 \\(3^6-3\\cdot2^6+3=540\\)。',
        },
        {
          q: '設 \\(U\\) 有 \\(n\\) 個元素，求滿足 \\(A\\subset B\\subset U\\) 且 \\(A\\ne B\\) 的集合組數。',
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
          a: '簡答：261 個。過程：四位數可重複且首位不可為 0。先用位置 12、23、34 出現「22」做容斥，再扣掉首位為 0 的情形，可得 261 個。',
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
          q: '將 12 本相異書平均分給 3 個人，每人各得 4 本，共有多少種分法？',
          a: '簡答：34650 種。過程：3 個人是具名的，依序選書給三人，方法數為 \\(\\frac{12!}{4!4!4!}=34650\\) 種。',
        },
        {
          q: '將 6 件相異玩具平均分給甲、乙、丙三人，每人 2 件，共有多少種分法？',
          a: '簡答：90 種。過程：甲得 2 件、乙得 2 件、丙得 2 件，方法數為 \\(\\frac{6!}{2!2!2!}=90\\) 種。',
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
          q: '將 12 本相異書平均分成 3 堆，每堆 4 本，共有多少種分堆方法？',
          a: '簡答：5775 種。過程：先按具名三堆分為 \\(\\frac{12!}{4!4!4!}\\)，但三堆無名稱，要再除以 \\(3!\\)，所以為 \\(\\frac{12!}{(4!)^3 3!}=5775\\) 種。',
        },
        {
          q: '將 6 件相異物品平均分成 3 堆，每堆 2 個，共有多少種分堆方法？',
          a: '簡答：15 種。過程：三堆無名稱，方法數為 \\(\\frac{6!}{(2!)^3 3!}=15\\) 種。',
        },
        {
          q: '將 10 位學生平均分成 2 組進行討論，每組 5 人，共有多少種分組方法？',
          a: '簡答：126 種。過程：兩組無名稱，方法數為 \\(\\frac{10!}{5!5!2!}=126\\) 種。',
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
          q: '將 9 件相異玩具按 4 件、4 件、1 件分成三堆，共有多少種分法？',
          a: '簡答：315 種。過程：堆沒有名稱，且兩堆大小同為 4，需除以 \\(2!\\)。方法數為 \\(\\frac{9!}{4!4!1!2!}=315\\) 種。',
        },
        {
          q: '將 10 本相異書按 3 本、3 本、2 本、2 本分成四堆，共有多少種分法？',
          a: '簡答：12600 種。過程：兩堆 3 本彼此不可分，兩堆 2 本也不可分，所以方法數為 \\(\\frac{10!}{3!3!2!2!2!2!}=12600\\) 種。',
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
          q: '將 10 顆相同的球放入 4 個不同箱子，每箱球數不限，共有多少種放法？',
          a: '簡答：286 種。過程：這是非負整數解 \\(x_1+x_2+x_3+x_4=10\\)，解數為 \\(C(13,3)=286\\) 種。',
        },
        {
          q: '將 9 本相同的練習簿全部分給 4 個小朋友，每人可得 0 本或多本，共有多少種分法？',
          a: '簡答：220 種。過程：求 \\(x_1+x_2+x_3+x_4=9\\) 的非負整數解，解數為 \\(C(12,3)=220\\)。',
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
          q: '連續丟一個均勻硬幣 5 次，求恰好出現 3 次正面的機率。',
          a: '簡答：\\(\\frac{5}{16}\\)。過程：5 次結果共有 \\(2^5=32\\) 種。恰好 3 次正面有 \\(C(5,3)=10\\) 種，因此機率為 \\(\\frac{10}{32}=\\frac{5}{16}\\)。',
        },
        {
          q: '甲、乙兩人各擲一粒公正骰子一次，求甲的點數大於乙的點數之機率。',
          a: '簡答：\\(\\frac{5}{12}\\)。過程：共有 36 種結果。甲大於乙的情形為 \\(1+2+3+4+5=15\\) 種，所以機率為 \\(\\frac{15}{36}=\\frac{5}{12}\\)。',
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
          q: '已知某家庭有兩個小孩，且其中一個是男孩，求另一個也是男孩的機率。',
          a: '簡答：\\(\\frac{1}{3}\\)。過程：至少一男的可能為男男、男女、女男，共 3 種等可能情形；其中另一個也是男孩只有男男 1 種，所以機率為 \\(\\frac{1}{3}\\)。',
        },
        {
          q: '某疾病盛行率為 1%，篩檢對病人呈陽性的機率為 95%，對健康者誤判陽性的機率為 5%。若一人檢測為陽性，求其實際患病的機率。',
          a: '簡答：\\(\\frac{19}{118}\\)。過程：由貝氏定理，機率為 \\(\\frac{0.01\\cdot0.95}{0.01\\cdot0.95+0.99\\cdot0.05}=\\frac{19}{118}\\)。',
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
          q: '甲、乙兩人射擊命中率分別為 0.4 與 0.5，且互不影響。兩人各射一發，求至少一人命中的機率。',
          a: '簡答：\\(\\frac{7}{10}\\)。過程：至少一人命中可用反面事件。兩人都不中的機率為 \\(0.6\\cdot0.5=0.3\\)，故所求為 \\(1-0.3=0.7=\\frac{7}{10}\\)。',
        },
        {
          q: '連續投擲一枚公正硬幣 \\(n\\) 次，若要「至少出現一次正面」的機率大於 0.999，求 \\(n\\) 的最小值。',
          a: '簡答：10。過程：至少一次正面的機率為 \\(1-(\\frac12)^n\\)。令 \\(1-(\\frac12)^n>0.999\\)，即 \\(2^n>1000\\)，最小正整數為 \\(n=10\\)。',
        },
        {
          q: '一個電路有兩個開關串聯，兩個開關各自接通的機率為 0.8 與 0.7，且互相獨立。求電流能通過的機率。',
          a: '簡答：\\(\\frac{14}{25}\\)。過程：串聯電路需兩個開關都接通，所以機率為 \\(0.8\\cdot0.7=0.56=\\frac{14}{25}\\)。',
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
          q: '袋中有 4 紅球、5 白球，每次取一球不放回，求紅球比白球先取完的機率。',
          a: '簡答：\\(\\frac{5}{9}\\)。過程：哪一色先取完只看最後一球的顏色。若最後一球為白球，表示紅球先取完。最後一球是白球的機率為 \\(\\frac59\\)。',
        },
        {
          q: '從 6 雙大小不同的鞋子中任取 4 隻，求 4 隻中恰有 2 隻成一雙的機率。',
          a: '簡答：\\(\\frac{16}{33}\\)。過程：全部取法為 \\(C(12,4)=495\\)。先選成雙的一雙有 6 種，再從其餘 5 雙選 2 雙並各取一隻，有 \\(C(5,2)2^2=40\\) 種，故機率為 \\(\\frac{6\\cdot40}{495}=\\frac{16}{33}\\)。',
        },
        {
          q: '從 1 到 9 號球中任取 3 球，求所得號碼中位數為 6 的機率。',
          a: '簡答：\\(\\frac{5}{28}\\)。過程：要中位數為 6，必須取到 6，且另取一個小於 6 與一個大於 6 的號碼。方法數為 \\(5\\cdot3=15\\)，全部為 \\(C(9,3)=84\\)，機率為 \\(\\frac{15}{84}=\\frac{5}{28}\\)。',
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
          q: '摸彩箱有 50 張彩券，其中 100 元獎金 3 張、50 元 5 張，其餘為 20 元。求隨機抽一張所得獎金的期望值。',
          a: '簡答：\\(\\frac{139}{5}\\) 元。過程：其餘 42 張為 20 元，期望為 \\(\\frac{3\\cdot100+5\\cdot50+42\\cdot20}{50}=\\frac{139}{5}\\)。',
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
          q: '一不公正骰子各面出現機率與點數成正比。若擲出 \\(k\\) 點得 210 元，其餘點數均賠 \\(x\\) 元，求遊戲公平時的 \\(x\\) 值。',
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
          q: '若 \\(A\\subset B\\)，且 \\(P(A)=0.4\\)，判斷 \\(P(B)\\) 的最小值。',
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
          q: '竊賊只有一人，50 名賓客受測。測謊器對說謊者顯示說謊率 99%，對誠實者誤判率 10%。若測謊器顯示某人說謊，求他真的是竊賊的機率。',
          a: '簡答：\\(\\frac{99}{589}\\)。過程：先驗機率為 \\(\\frac1{50}\\)。由貝氏定理，所求為 \\(\\frac{\\frac1{50}\\cdot0.99}{\\frac1{50}\\cdot0.99+\\frac{49}{50}\\cdot0.10}=\\frac{99}{589}\\)。',
        },
        {
          q: '班級 50 人（40 男 10 女）。老師以簡單隨機抽樣抽選 5 人，求某一位指定學生被抽中的機率。',
          a: '簡答：\\(\\frac{1}{10}\\)。過程：簡單隨機抽樣中每位學生地位相同，被抽中的機率為 \\(\\frac{5}{50}=\\frac{1}{10}\\)。',
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
    const answers = [];
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS221InclusionExclusionMultiplesSet(count) {
    const questions = [];
    const answers = [];
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
      questions.push(
        `從 1 到 ${totalCount} 的整數中隨機任取 1 個，求此數為 ${a} 的倍數或 ${b} 的倍數的機率。`
      );
      answers.push(
        `簡答：\\(${formatFraction(probability.num, probability.den)}\\)。過程：${a} 的倍數有 ${countA} 個，${b} 的倍數有 ${countB} 個，同時為兩者倍數者是 ${lcm(a, b)} 的倍數，共 ${countBoth} 個。由取捨原理，可得符合者共有 ${countA}+${countB}-${countBoth}=${union} 個，所以機率為 \\(\\frac{${union}}{${totalCount}}=${formatFraction(probability.num, probability.den)}\\)。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS222RepeatedLetterPermutationParameterizedSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const repeatedCounts = shuffle([2, 2, 3, 3, 4]).slice(0, randInt(2, 3)).sort((x, y) => y - x);
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
      const denominatorText = repeatedCounts.map((value) => `${value}!`).join('');
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS222AdjacentPairArrangementParameterizedSet(count) {
    const questions = [];
    const answers = [];
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
      questions.push(
        `將 ${n} ${context.noun}排成一列，若要求 ${context.subject}必須相鄰，則共有多少種排列方式？`
      );
      answers.push(
        `簡答：${total} 種。過程：把 ${context.subject}視為一個整體，則原來 ${n} 個對象可先看成 ${n - 1} 個單位排列，有 \\((${n - 1})!\\) 種；而這兩個對象內部還可交換順序 2 種，所以總數為 \\(2\\times(${n - 1})!=${total}\\)。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS223BinomialCoefficientParameterizedSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const n = randInt(4, 8);
      const q = randInt(1, n - 1);
      const p = n - q;
      const a = pickNonZero(-4, 4);
      const b = pickNonZero(-4, 4);
      const coefficient = combinationCount(n, q) * powInt(a, p) * powInt(b, q);
      questions.push(
        `展開 \\((${a}x${b >= 0 ? '+' : ''}${b}y)^{${n}}\\)，求 \\(x^{${p}}y^{${q}}\\) 項的係數。`
      );
      answers.push(
        `簡答：${coefficient}。過程：在 \\((${a}x${b >= 0 ? '+' : ''}${b}y)^{${n}}\\) 中，要得到 \\(x^{${p}}y^{${q}}\\)，需從 ${n} 個因式中選 ${q} 個取 \\(${b}y\\)，其餘 ${p} 個取 \\(${a}x\\)。所以係數為 \\(C(${n},${q})\\cdot(${a})^{${p}}\\cdot(${b})^{${q}}=${coefficient}\\)。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS223IdenticalDistributionParameterizedSet(count) {
    const questions = [];
    const answers = [];
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS224ExactKDrawProbabilityParameterizedSet(count) {
    const questions = [];
    const answers = [];
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS224EventCountRelationsParameterizedSet(count) {
    const questions = [];
    const answers = [];

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS224ExpectedValueParameterizedSet(count) {
    const questions = [];
    const answers = [];

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS231BasicUngroupedSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '給定資料 \\(\\{2,4,8,8,32\\}\\)，求其算術平均數、中位數與母體標準差。',
          a: '簡答：平均數 \\(\\mu=\\frac{54}{5}\\)，中位數 8，標準差 \\(\\sigma=\\frac{8\\sqrt{46}}{5}\\)。過程：總和為 54，所以 \\(\\mu=54/5\\)。排序後中位數為第 3 個 8。平方和為 \\(2^2+4^2+8^2+8^2+32^2=1172\\)，故 \\(\\sigma^2=\\frac{1172}{5}-(\\frac{54}{5})^2=\\frac{2944}{25}\\)，所以 \\(\\sigma=\\frac{8\\sqrt{46}}{5}\\)。',
        },
        {
          q: '一組資料為 \\(\\{120,116,108,104,102\\}\\)，求平均數 \\(\\mu\\)、離差平方和 \\(S_{xx}\\) 與標準差 \\(\\sigma\\)。',
          a: '簡答：\\(\\mu=110\\)，\\(S_{xx}=240\\)，\\(\\sigma=4\\sqrt3\\)。過程：總和 550，平均為 110。離差為 10、6、-2、-6、-8，平方和為 \\(100+36+4+36+64=240\\)。母體變異數為 \\(240/5=48\\)，所以 \\(\\sigma=4\\sqrt3\\)。',
        },
        {
          q: '資料為 \\(\\{90,85,85,80,70\\}\\)，求其算術平均數與標準差。',
          a: '簡答：平均數 82，標準差 \\(\\sqrt{46}\\)。過程：總和為 410，所以平均數為 82。平方和為 33850，變異數為 \\(33850/5-82^2=46\\)，故標準差為 \\(\\sqrt{46}\\)。',
        },
        {
          q: '計算資料 \\(\\{14,10,8,6,2\\}\\) 的算術平均數與母體標準差。',
          a: '簡答：平均數 8，標準差 \\(4\\)。過程：總和為 40，平均數為 8。離差為 6、2、0、-2、-6，平方和為 80，母體變異數為 \\(80/5=16\\)，所以標準差為 4。',
        },
        {
          q: '給定 40 筆數據，已知 \\(\\sum x_i=1000\\)、\\(\\sum x_i^2=29000\\)，求平均數與母體標準差。',
          a: '簡答：平均數 25，標準差 \\(10\\)。過程：\\(\\mu=1000/40=25\\)。又 \\(\\sigma^2=\\frac{29000}{40}-25^2=725-625=100\\)，所以 \\(\\sigma=10\\)。',
        },
      ],
      count
    );
  }

  function buildS231LinearTransformSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '已知一組數據 \\(x\\) 的平均數為 10、標準差為 3。若新數據 \\(y=4x+3\\)，求新平均數與新標準差。',
          a: '簡答：新平均數 43，新標準差 12。過程：線性變換 \\(y=ax+b\\) 下，\\(\\mu_y=a\\mu_x+b\\)、\\(\\sigma_y=|a|\\sigma_x\\)。所以 \\(\\mu_y=4\\cdot10+3=43\\)，\\(\\sigma_y=4\\cdot3=12\\)。',
        },
        {
          q: '測量長度 9 次，得到平均數 2.45、標準差 0.02。若將數據均乘以 100 再減去 240，求新數據的平均數與標準差。',
          a: '簡答：平均數 5，標準差 2。過程：新數據 \\(y=100x-240\\)。故 \\(\\mu_y=100\\cdot2.45-240=5\\)，\\(\\sigma_y=100\\cdot0.02=2\\)。',
        },
        {
          q: '某次考試原始成績 \\(x\\) 的標準差為 10，老師將成績調整為 \\(y=0.8x+20\\)。求調整後標準差。',
          a: '簡答：8。過程：加上常數不影響標準差，乘以 0.8 會讓標準差乘以 \\(|0.8|\\)。所以新標準差為 \\(0.8\\cdot10=8\\)。',
        },
        {
          q: '設數據 \\(z_i=3x_i+5\\)，且已知 \\(\\mu_x=10\\)、\\(\\sigma_x=4\\)，求 \\(\\mu_z\\) 與 \\(\\sigma_z\\)。',
          a: '簡答：\\(\\mu_z=35\\)，\\(\\sigma_z=12\\)。過程：\\(\\mu_z=3\\mu_x+5=35\\)，\\(\\sigma_z=|3|\\sigma_x=12\\)。',
        },
        {
          q: '已知原始數據平均值為 40，標準差為 10。若將數據變更為原本的 110%，求新的平均值與標準差。',
          a: '簡答：平均值 44，標準差 11。過程：新數據 \\(y=1.1x\\)，因此平均與標準差都乘以 1.1，得到 \\(44\\) 與 \\(11\\)。',
        },
      ],
      count
    );
  }

  function buildS231WeightedMeanSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '某生平時考成績占 30%，期中考占 20%，期末考占 50%。若成績分別為 80、85、90，求學期加權成績。',
          a: '簡答：86 分。過程：加權平均為 \\(80\\cdot0.3+85\\cdot0.2+90\\cdot0.5=24+17+45=86\\)。',
        },
        {
          q: '自然組 280 人平均 60 分，社會組 120 人平均 50 分，求全校總平均。',
          a: '簡答：57 分。過程：全校總分為 \\(280\\cdot60+120\\cdot50=22800\\)，總人數 400，所以總平均為 \\(22800/400=57\\)。',
        },
        {
          q: '某鎮十年前人口 25 萬，現在 30 萬。假設每年成長率固定，求年平均成長率。',
          a: '簡答：\\(\\sqrt[10]{\\frac65}-1\\)。過程：設年平均成長率為 \\(r\\)，則 \\(25(1+r)^{10}=30\\)。所以 \\((1+r)^{10}=\\frac65\\)，\\(r=\\sqrt[10]{\\frac65}-1\\)。',
        },
        {
          q: '已知三年的產值成長率分別為 10%、20%、30%，求三年的平均成長率。',
          a: '簡答：\\(\\sqrt[3]{1.716}-1\\)。過程：平均成長率需用幾何平均，令 \\(1+r=\\sqrt[3]{1.1\\cdot1.2\\cdot1.3}=\\sqrt[3]{1.716}\\)，所以 \\(r=\\sqrt[3]{1.716}-1\\)。',
        },
        {
          q: '一組資料由 \\(k\\) 個 1 與 \\(n-k\\) 個 0 組成，求這組資料的算術平均數與標準差公式。',
          a: '簡答：平均數 \\(\\frac{k}{n}\\)，標準差 \\(\\sqrt{\\frac{k}{n}(1-\\frac{k}{n})}\\)。過程：1 的比例為 \\(p=\\frac{k}{n}\\)，平均數為 \\(p\\)。二元資料平方後仍為自身，所以 \\(E(X^2)=p\\)，變異數為 \\(p-p^2=p(1-p)\\)。',
        },
      ],
      count
    );
  }

  function buildS231ZScoreSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '已知某生數學成績 80 分，班級平均 70 分，標準差 10 分，求其 Z 分數。',
          a: '簡答：1。過程：Z 分數為 \\(z=\\frac{x-\\mu}{\\sigma}=\\frac{80-70}{10}=1\\)。',
        },
        {
          q: '給定資料 \\(\\{2,6,4,8,10\\}\\)，將其中第一個數據 2 進行標準化，求其 Z 分數。',
          a: '簡答：\\(-\\sqrt2\\)。過程：平均數為 6，離差平方和為 40，母體標準差為 \\(\\sqrt{40/5}=2\\sqrt2\\)。所以 \\(z=\\frac{2-6}{2\\sqrt2}=-\\sqrt2\\)。',
        },
        {
          q: '若兩科成績 \\(X\\) 與 \\(Y\\) 分別標準化為 \\(X^{\\prime}\\) 與 \\(Y^{\\prime}\\)，說明 \\(\\mu_{X^{\\prime}}\\) 與 \\(\\sigma_{X^{\\prime}}\\) 的值。',
          a: '簡答：\\(\\mu_{X^{\\prime}}=0\\)，\\(\\sigma_{X^{\\prime}}=1\\)。過程：標準化定義為 \\(X^{\\prime}=\\frac{X-\mu_X}{\\sigma_X}\\)，減去平均後平均變 0，再除以標準差後標準差變 1。',
        },
        {
          q: '某生在兩次段考中的成績分別為 75 與 82。若兩次考試平均與標準差不同，應用什麼量判斷哪一次表現較佳？',
          a: '簡答：應比較兩次的 Z 分數。過程：原始分數不能直接比較，因為不同考試的平均與離散程度不同。將兩次成績都轉成 \\(z=\\frac{x-\mu}{\\sigma}\\)，Z 分數較大者表示相對表現較佳。',
        },
        {
          q: '若一組數據的 Z 分數為 1.5，且已知該組平均數 60、標準差 8，求該筆原始數據之值。',
          a: '簡答：72。過程：由 \\(z=\\frac{x-\mu}{\\sigma}\\)，得 \\(1.5=\\frac{x-60}{8}\\)，所以 \\(x=60+12=72\\)。',
        },
      ],
      count
    );
  }

  function buildS231BinaryDataSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '一組 10 筆數據中，有 4 個 1 與 6 個 0，求此組數據的平均數與標準差。',
          a: '簡答：平均數 \\(\\frac25\\)，標準差 \\(\\frac{\\sqrt6}{5}\\)。過程：1 的比例為 \\(p=4/10=2/5\\)，平均數為 \\(p\\)。標準差為 \\(\\sqrt{p(1-p)}=\\sqrt{\\frac25\\cdot\\frac35}=\\frac{\\sqrt6}{5}\\)。',
        },
        {
          q: '證明一組由 \\(k\\) 個 1 與 \\(n-k\\) 個 0 組成的數據，其標準差公式為 \\(\\sqrt{\\frac{k}{n}(1-\\frac{k}{n})}\\)。',
          a: '簡答：成立。過程：令 \\(p=\\frac{k}{n}\\)。平均數為 \\(p\\)，且因 \\(0^2=0,1^2=1\\)，所以 \\(E(X^2)=p\\)。變異數為 \\(p-p^2=p(1-p)\\)，標準差即為 \\(\\sqrt{p(1-p)}\\)。',
        },
        {
          q: '若一組 0 與 1 組成的數據標準差為 0.5，求數據中 1 所佔的比例。',
          a: '簡答：\\(\\frac12\\)。過程：令 1 的比例為 \\(p\\)，則標準差為 \\(\\sqrt{p(1-p)}\\)。若為 0.5，則 \\(p(1-p)=\\frac14\\)，得 \\(p=\\frac12\\)。',
        },
        {
          q: '將含有 20 個 1 與 30 個 0 的數據進行線性變換 \\(y=10x+50\\)，求新數據的平均數與變異數。',
          a: '簡答：平均數 54，變異數 24。過程：原資料 \\(p=20/50=2/5\\)，平均為 \\(2/5\\)，變異數為 \\(\\frac25\\cdot\\frac35=\\frac6{25}\\)。變換後平均為 \\(10\\cdot\\frac25+50=54\\)，變異數乘以 \\(10^2\\)，得 24。',
        },
        {
          q: '兩組 0-1 數據合併後，已知總平均為 0.7。若第一組有 30 筆且其中 18 個 1，第二組有 20 筆，求第二組中 1 的個數。',
          a: '簡答：17 個。過程：合併後共有 50 筆，1 的總數為 \\(0.7\\cdot50=35\\)。第一組已有 18 個 1，所以第二組有 \\(35-18=17\\) 個 1。',
        },
      ],
      count
    );
  }

  function buildS231MergeLossSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '10 個數值中，前 6 個平均數為 3、變異數為 9；後 4 個平均數為 8、變異數為 16。求全體 10 個數的平均數與變異數。',
          a: '簡答：平均數 5，變異數 \\(\\frac{89}{5}\\)。過程：總平均為 \\(\\frac{6\\cdot3+4\\cdot8}{10}=5\\)。總平方和為 \\(6(9+3^2)+4(16+8^2)=108+320=428\\)，所以變異數為 \\(428/10-5^2=\\frac{89}{5}\\)。',
        },
        {
          q: '10 人參加考試，平均分數 56，標準差 4。已知其中 8 人的成績總和為 460，求剩餘 2 人的成績總和。',
          a: '簡答：100。過程：10 人總分為 \\(10\\cdot56=560\\)，剩餘 2 人總分為 \\(560-460=100\\)。',
        },
        {
          q: '已知 5 個數據成等差數列，且算術平均數為 6，標準差為 \\(2\\sqrt2\\)，求這 5 個數據。',
          a: '簡答：\\(2,4,6,8,10\\)。過程：5 個等差數可設為 \\(6-2d,6-d,6,6+d,6+2d\\)。其變異數為 \\(\\frac{4d^2+d^2+d^2+4d^2}{5}=2d^2\\)，標準差為 \\(\\sqrt2|d|\\)。由 \\(\\sqrt2|d|=2\\sqrt2\\) 得 \\(|d|=2\\)，故資料為 \\(2,4,6,8,10\\)。',
        },
        {
          q: '有 9 個數的算術平均為 12，標準差為 2。若新增兩個數 10 與 14，求此 11 個數的新標準差。',
          a: '簡答：\\(2\\)。過程：原總和為 108，原平方和為 \\(9(2^2+12^2)=1332\\)。加入 10、14 後總和 132，平均仍為 12；平方和增加 \\(100+196=296\\)，新平方和為 1628。變異數為 \\(1628/11-12^2=4\\)，標準差為 2。',
        },
        {
          q: '一組 \\(n\\) 個數據中加入一個數 36 後平均多 2；若去掉一個數 20 後平均少 1，求原始個數 \\(n\\)。',
          a: '簡答：13。過程：設原平均為 \\(\\mu\\)。加入 36 後 \\(\\frac{n\\mu+36}{n+1}=\\mu+2\\)，得 \\(36=2n+\\mu+2\\)，即 \\(\\mu+2n=34\\)。去掉 20 後 \\(\\frac{n\\mu-20}{n-1}=\\mu-1\\)，得 \\(20=\\mu+n-1\\)，即 \\(\\mu+n=21\\)。聯立得 \\(n=13\\)。',
        },
      ],
      count
    );
  }

  function buildS231DataRevisionSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '某班 10 位學生的數學成績平均為 60 分、標準差為 4 分。後來發現其中一人的成績「70 分」被誤植為「50 分」，求正確的平均數。',
          a: '簡答：62 分。過程：原登錄總分為 \\(10\\cdot60=600\\)。修正時總分增加 \\(70-50=20\\)，正確總分為 620，所以正確平均為 62。',
        },
        {
          q: '某班 10 位學生的數學成績登錄平均為 60 分、標準差為 4 分。後來發現其中一人的成績「70 分」被誤植為「50 分」，求修正後的正確標準差。',
          a: '簡答：\\(2\\sqrt{14}\\)。過程：原登錄平方和為 \\(10(4^2+60^2)=36160\\)。修正平方和增加 \\(70^2-50^2=2400\\)，得 38560。正確平均為 62，變異數為 \\(38560/10-62^2=56\\)，標準差為 \\(2\\sqrt{14}\\)。',
        },
        {
          q: '已知 20 筆數據的平均數為 15，標準差為 2。若剔除其中兩筆明顯錯誤的離群值 30 與 0，求剩餘 18 筆的新平均數。',
          a: '簡答：15。過程：原總和為 \\(20\\cdot15=300\\)。剔除 30 與 0 後總和為 270，剩 18 筆，所以新平均為 \\(270/18=15\\)。',
        },
        {
          q: '一組 5 筆數據的平均為 10，標準差為 2。若新增兩筆數據分別為 10 與 10，求這 7 筆數據的新標準差。',
          a: '簡答：\\(\\frac{2\\sqrt{35}}{7}\\)。過程：原離差平方和為 \\(5\\cdot2^2=20\\)。新增兩筆都等於原平均 10，因此新平均仍為 10，離差平方和不變。新變異數為 \\(20/7\\)，標準差為 \\(\\sqrt{20/7}=\\frac{2\\sqrt{35}}{7}\\)。',
        },
        {
          q: '測量 10 戶家庭所得，平均 100 萬，標準差 20 萬。若其中最高所得家庭 280 萬搬走，求剩餘 9 戶的平均所得。',
          a: '簡答：80 萬。過程：原總所得為 \\(10\\cdot100=1000\\) 萬。搬走 280 萬後剩 720 萬，平均為 \\(720/9=80\\) 萬。',
        },
      ],
      count
    );
  }

  function buildS231GroupMergingSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '男生 20 人平均 70 分，標準差 5 分；女生 30 人平均 80 分，標準差 10 分。求全校 50 人的加權平均數。',
          a: '簡答：76 分。過程：加權平均為 \\(\\frac{20\\cdot70+30\\cdot80}{50}=76\\)。',
        },
        {
          q: '男生 20 人平均 70 分、標準差 5 分；女生 30 人平均 80 分、標準差 10 分。求全校 50 人的總標準差。',
          a: '簡答：\\(\\sqrt{89}\\)。過程：全校平均為 \\(\\frac{20\\cdot70+30\\cdot80}{50}=76\\)。總平方和為 \\(20(5^2+70^2)+30(10^2+80^2)=293250\\)。變異數為 \\(293250/50-76^2=89\\)，所以標準差為 \\(\\sqrt{89}\\)。',
        },
        {
          q: '甲班平均 65，標準差 6；乙班平均 65，標準差 8。若甲班 40 人、乙班 60 人，求合併後的標準差。',
          a: '簡答：\\(\\frac{2\\sqrt{345}}{5}\\)。過程：兩班平均相同皆為 65，合併變異數為加權平均：\\(\\frac{40\\cdot6^2+60\\cdot8^2}{100}=\\frac{276}{5}\\)，所以標準差為 \\(\\sqrt{\\frac{276}{5}}=\\frac{2\\sqrt{345}}{5}\\)。',
        },
        {
          q: '有兩組數據 \\(X(n=10,\\mu=5,\\sigma=2)\\) 與 \\(Y(n=10,\\mu=15,\\sigma=4)\\)，求合併後 20 筆數據的變異數。',
          a: '簡答：60。過程：合併平均為 \\(10\\)。總平方平均為 \\(\\frac{10(2^2+5^2)+10(4^2+15^2)}{20}=160\\)。變異數為 \\(160-10^2=60\\)。',
        },
        {
          q: '已知兩組人數相同，第一組 \\(\\mu=10,\\sigma=3\\)，合併後總平均為 12，總標準差為 4。求第二組數據的平均數。',
          a: '簡答：14。過程：兩組人數相同，合併平均是兩組平均的平均。設第二組平均為 \\(m\\)，則 \\(\\frac{10+m}{2}=12\\)，解得 \\(m=14\\)。',
        },
      ],
      count
    );
  }

  function buildS231AlgebraVarianceSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '給定 40 筆數據，已知其總和 \\(\\sum x_i=800\\)，平方和 \\(\\sum x_i^2=16400\\)，求其標準差。',
          a: '簡答：\\(\\sqrt{10}\\)。過程：平均為 \\(800/40=20\\)。變異數為 \\(\\frac{16400}{40}-20^2=410-400=10\\)。因此標準差為 \\(\\sqrt{10}\\)。',
        },
        {
          q: '若 10 筆數據的平均數為 12，標準差為 3，求這 10 筆數據的平方和 \\(\\sum x_i^2\\)。',
          a: '簡答：1530。過程：\\(\\sigma^2=\\frac1n\\sum x_i^2-\mu^2\\)，所以 \\(9=\\frac1{10}\\sum x_i^2-144\\)，得 \\(\\sum x_i^2=1530\\)。',
        },
        {
          q: '已知 \\(\\sum_{i=1}^{20}(x_i-10)=40\\) 且 \\(\\sum_{i=1}^{20}(x_i-10)^2=280\\)，求原始數據的平均數與標準差。',
          a: '簡答：平均數 12，標準差 \\(\\sqrt{10}\\)。過程：令 \\(y_i=x_i-10\\)，則 \\(\\bar y=40/20=2\\)，所以 \\(\\bar x=12\\)。\\(y\\) 的變異數為 \\(280/20-2^2=10\\)，平移不改變標準差，所以標準差為 \\(\\sqrt{10}\\)。',
        },
        {
          q: '設 5 筆數據的平方和為 500，平均數為 8；若加入一筆數據 \\(x_6=8\\)，求這 6 筆數據的新標準差。',
          a: '簡答：\\(\\sqrt{30}\\)。過程：原總和為 40，加入 8 後平均仍為 8，平方和變 564。新變異數為 \\(564/6-8^2=94-64=30\\)，所以標準差為 \\(\\sqrt{30}\\)。',
        },
        {
          q: '給定數據滿足 \\(\\sum_{i=1}^n x_i=S\\) 且 \\(\\sum_{i=1}^n x_i^2=T\\)，試寫出變異數以 \\(S,T,n\\) 表示的通式。',
          a: '簡答：\\(\\sigma^2=\\frac{T}{n}-(\\frac{S}{n})^2\\)。過程：平均數 \\(\\mu=\\frac{S}{n}\\)，又變異數公式為 \\(\\sigma^2=\\frac1n\\sum x_i^2-\mu^2\\)，代入即得 \\(\\frac{T}{n}-(\\frac{S}{n})^2\\)。',
        },
      ],
      count
    );
  }

  function buildS231GeometricGrowthSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '已知連續三年的產值成長率分別為 10%、20%、30%，求這三年的平均成長率。',
          a: '簡答：\\(\\sqrt[3]{1.716}-1\\)。過程：平均成長率不是算術平均，而是 \\((1+r)^3=1.1\\cdot1.2\\cdot1.3=1.716\\)，故 \\(r=\\sqrt[3]{1.716}-1\\)。',
        },
        {
          q: '某鎮十年前人口為 25 萬，現在為 30 萬，假設每年成長率固定，預測二十年後的人口數。',
          a: '簡答：\\(36\\) 萬。過程：十年成長倍率為 \\(30/25=6/5\\)。再過十年倍率相同，二十年後為 \\(30\\cdot\\frac65=36\\) 萬。',
        },
        {
          q: '某項投資在四年內的獲利率分別為 -10%、20%、0%、50%，計算其四年平均獲利率。',
          a: '簡答：\\(\\sqrt[4]{1.62}-1\\)。過程：總倍率為 \\(0.9\\cdot1.2\\cdot1\\cdot1.5=1.62\\)。令平均倍率為 \\(1+r\\)，則 \\((1+r)^4=1.62\\)，所以 \\(r=\\sqrt[4]{1.62}-1\\)。',
        },
        {
          q: '一細胞每小時分裂一次，數量加倍。若初始有 100 個，求 \\(n\\) 小時後的數量及平均增長率。',
          a: '簡答：數量 \\(100\\cdot2^n\\)，平均每小時增長率 100%。過程：每小時倍率為 2，故 \\(n\\) 小時後為 \\(100\\cdot2^n\\)。平均增長倍率仍為 2，所以增長率為 \\(2-1=100\\%\\)。',
        },
        {
          q: '若一組數據的幾何平均數為 6，已知前三數為 2、9、12，求第四個數之值。',
          a: '簡答：6。過程：四個數的幾何平均為 6，故乘積為 \\(6^4=1296\\)。前三數乘積為 \\(2\\cdot9\\cdot12=216\\)，第四個數為 \\(1296/216=6\\)。',
        },
      ],
      count
    );
  }

  function buildS231DeviationMinimizationSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '給定數據 \\(\\{2,4,8,8,32\\}\\)，求使 \\(f(x)=\\sum (x_i-x)^2\\) 最小的 \\(x\\) 值。',
          a: '簡答：\\(\\frac{54}{5}\\)。過程：平方離差和 \\(\\sum(x_i-x)^2\\) 在 \\(x\\) 等於平均數時最小。資料總和為 54、筆數 5，所以最小時 \\(x=54/5\\)。',
        },
        {
          q: '求使 \\(f(x)=|x-1|+|x-3|+|x-7|+|x-9|\\) 產生最小值的 \\(x\\) 範圍及其最小值。',
          a: '簡答：\\(3\\le x\\le7\\)，最小值 12。過程：絕對離差和在中位數處最小；偶數筆資料時，任取兩個中間數 3 與 7 之間皆可。最小值為 \\((3-1)+(7-3)+(9-7)=12\\)。',
        },
        {
          q: '設 49 筆資料為 \\(1,2,3,\\ldots,49\\)，求使 \\(f(x)=\\sum_{k=1}^{49}|k-x|\\) 最小時的 \\(x\\) 值。',
          a: '簡答：25。過程：絕對離差和在中位數時最小。49 筆資料的中位數是第 25 個數，因此最小時 \\(x=25\\)。',
        },
        {
          q: '已知數據的算術平均數為 10，證明當 \\(k=10\\) 時，\\(\\sum (x_i-k)^2\\) 會小於當 \\(k=12\\) 時的結果。',
          a: '簡答：成立。過程：平方離差和在 \\(k=\\mu\\) 時最小。因平均數 \\(\\mu=10\\)，所以 \\(k=10\\) 的平方離差和必不大於任何其他 \\(k\\)，特別小於或等於 \\(k=12\\) 的結果。',
        },
        {
          q: '給定一組離散數據，判斷眾數、平均數、中位數中，哪一個最適合用於最小化誤差平方和。',
          a: '簡答：平均數。過程：平方誤差和 \\(\\sum(x_i-a)^2\\) 的最小點是平均數；絕對誤差和的最小點是中位數；眾數則描述最常出現的值。',
        },
      ],
      count
    );
  }

  function buildS231PercentileOutlierSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '給定 15 位同學的體重資料（已由小到大排列），求第 75 百分位數 \\(P_{75}\\) 的位置。',
          a: '簡答：第 12 個資料。過程：位置可用 \\((n+1)\\times75\\%=16\\times0.75=12\\)，所以 \\(P_{75}\\) 位在第 12 個資料。',
        },
        {
          q: '一組數據的 \\(Q_1=40\\)、\\(Q_3=60\\)，求其四分位距 \\(IQR\\)。',
          a: '簡答：20。過程：四分位距定義為 \\(IQR=Q_3-Q_1=60-40=20\\)。',
        },
        {
          q: '根據 1.5 倍 \\(IQR\\) 規則，若 \\(Q_1=40\\)、\\(Q_3=60\\)，判斷數值 100 是否為離群值。',
          a: '簡答：是。過程：\\(IQR=20\\)，上界為 \\(Q_3+1.5IQR=60+30=90\\)。因 100 大於 90，所以 100 是離群值。',
        },
        {
          q: '在 100 位同學的成績中，某生排名第 20 名（由高到低），求其所在的百分等級（PR 值）。',
          a: '簡答：約 PR 80。過程：排名第 20 表示約有 80% 的同學在其後方或不高於他，因此可估為 PR 80。',
        },
        {
          q: '給定累積次數分配曲線，要求第 60 百分位數 \\(P_{60}\\) 落在哪一個組距內，應如何判斷？',
          a: '簡答：找累積次數首次達到總次數 60% 的組距。過程：先算 \\(0.6n\\) 的位置，再在累積次數表或曲線上找第一次超過或等於該位置的組距，該組距即包含 \\(P_{60}\\)。',
        },
      ],
      count
    );
  }

  function buildS231SamplingMethodsSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '全校 1000 人，編號 000 到 999。欲選取 10 人，若從 005 號開始每隔 100 號取一人，此為哪種抽樣方法？',
          a: '簡答：系統抽樣。過程：先決定起始點，再依固定間隔抽取樣本，這正是系統抽樣。',
        },
        {
          q: '某校有高一 400 人、高二 300 人、高三 300 人，欲按比例抽取 100 人，求各年級應抽取的人數。',
          a: '簡答：高一 40 人，高二 30 人，高三 30 人。過程：總人數 1000，抽樣比例為 \\(100/1000=1/10\\)。各層抽取人數為 400/10、300/10、300/10。',
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
          q: '給定甲、乙兩班的累積次數分配曲線，若甲班曲線在左、乙班在右，判斷哪一班的中位數較大。',
          a: '簡答：乙班較大。過程：累積曲線越往右，表示同一累積比例所對應的分數越高。中位數是累積比例 50% 的位置，因此曲線較右者中位數較大。',
        },
        {
          q: '從累積次數圖中觀察哪一個分數區間斜率最大，該區間代表什麼意義？',
          a: '簡答：該區間人數最多。過程：累積次數曲線在某區間上升越快，表示該區間累積增加的人數越多，也就是該組距的次數最大。',
        },
        {
          q: '若甲班曲線較陡峭且集中於中間，乙班較平緩，判斷哪一班標準差較小。',
          a: '簡答：甲班較小。過程：資料越集中，離散程度越小，標準差越小。累積曲線集中在中間且上升較陡，表示分數較集中。',
        },
        {
          q: '給定 100 人的累積次數圖，預測第 25 百分位數 \\(Q_1\\) 落在哪一組距內，應先找哪個累積次數位置？',
          a: '簡答：第 25 個位置。過程：\\(Q_1=P_{25}\\)，在 100 人資料中位置約為 \\(100\\times25\\%=25\\)。在累積次數圖中找累積次數達 25 的組距。',
        },
        {
          q: '從累積次數表中估計及格人數（60 分以上）占全體總人數的百分比，應如何計算？',
          a: '簡答：\\(\\frac{總人數-未滿60分累積人數}{總人數}\\times100\\%\\)。過程：累積次數表通常可讀出低於 60 分的人數，用總人數扣除即為 60 分以上的人數，再除以總人數得百分比。',
        },
      ],
      count
    );
  }

  function buildS231GroupedEstimationSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '已知 100 名學生考試成績的分組表（組距為 10），假設組內均勻分布，求算術平均數時應使用哪個代表值？',
          a: '簡答：各組組中點。過程：分組資料不知道每筆原始數據，估計平均數時以每組組中點代表該組資料，再用 \\(\\frac{\\sum f_i m_i}{\\sum f_i}\\) 計算。',
        },
        {
          q: '利用插補法估計分組數據的中位數時，若共有 100 筆資料，應找第幾名與第幾名所在位置？',
          a: '簡答：第 50 名與第 51 名附近。過程：偶數筆資料的中位數在第 \\(n/2\\) 與第 \\(n/2+1\\) 筆之間，因此 100 筆資料要看第 50、51 名所在組距。',
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
          q: '從分組表中計算第 60 百分位數 \\(P_{60}\\) 的估計值時，第一步應做什麼？',
          a: '簡答：先找第 \\(0.6n\\) 個資料落在哪一組。過程：百分位數要先定位。找出累積次數首次達到 \\(0.6n\\) 的組距，再在該組距內用插補法估計。',
        },
      ],
      count
    );
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
    return buildS223TemplateSet(
      [
        {
          q: '給定 5 筆數據 \\((x,y):(1,2),(2,4),(3,3),(4,5),(5,6)\\)，求其相關係數 \\(r\\)。',
          a: '簡答：\\(r=\\frac{9}{10}\\)。過程：\\(\\bar x=3,\\bar y=4\\)。計算得 \\(S_{xx}=10\\)、\\(S_{yy}=10\\)、\\(S_{xy}=9\\)，所以 \\(r=\\frac{S_{xy}}{\\sqrt{S_{xx}S_{yy}}}=\\frac9{10}\\)。',
        },
        {
          q: '已知 \\(\\sum x_i=1250,\\sum y_i=800,\\sum x_i^2=158500,\\sum y_i^2=64810,\\sum x_iy_i=101080\\)，樣本數 \\(n=10\\)，求相關係數 \\(r\\)。',
          a: '簡答：\\(r=\\frac45\\)。過程：\\(S_{xx}=158500-\\frac{1250^2}{10}=2250\\)，\\(S_{yy}=64810-\\frac{800^2}{10}=810\\)，\\(S_{xy}=101080-\\frac{1250\\cdot800}{10}=1080\\)。所以 \\(r=\\frac{1080}{\\sqrt{2250\\cdot810}}=\\frac45\\)。',
        },
        {
          q: '設 5 筆數據的離差平方和 \\(S_{xx}=100\\)、\\(S_{yy}=1600\\)，乘積和 \\(S_{xy}=290\\)，求其相關係數。',
          a: '簡答：\\(r=\\frac{29}{40}\\)。過程：\\(r=\\frac{S_{xy}}{\\sqrt{S_{xx}S_{yy}}}=\\frac{290}{\\sqrt{100\\cdot1600}}=\\frac{290}{400}=\\frac{29}{40}\\)。',
        },
        {
          q: '若數據已標準化為 Z 分數 \\((x_i^{\\prime},y_i^{\\prime})\\)，且 \\(\\sum x_i^{\\prime}y_i^{\\prime}=7.5\\)、\\(n=10\\)，求相關係數 \\(r\\)。',
          a: '簡答：\\(r=\\frac34\\)。過程：標準化後 \\(r=\\frac1n\\sum x_i^{\\prime}y_i^{\\prime}\\)，所以 \\(r=\\frac{7.5}{10}=0.75=\\frac34\\)。',
        },
        {
          q: '從 1 到 5 的整數對 \\((x,y)\\) 中，滿足 \\(y=-x+6\\)。直接判定其相關係數。',
          a: '簡答：\\(r=-1\\)。過程：所有資料點都落在斜率為負的同一直線上，且不是水平線或垂直線，因此完全負相關，\\(r=-1\\)。',
        },
      ],
      count
    );
  }

  function buildS232ScatterJudgmentSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '給定五個散布圖，若要依相關係數 \\(|r|\\) 的大小排序，應優先觀察什麼特徵？',
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
          q: '從散布圖觀察點群大致由左下往右上，判斷 \\(x,y\\) 之間是正相關、負相關還是零相關。',
          a: '簡答：正相關。過程：由左下往右上表示 \\(x\\) 增加時 \\(y\\) 也大致增加，所以相關係數為正。',
        },
        {
          q: '若所有散布點皆落在直線 \\(3x+2y=5\\) 上，求其相關係數。',
          a: '簡答：\\(r=-1\\)。過程：直線可寫為 \\(y=-\\frac32x+\\frac52\\)，斜率為負且所有點完全共線，因此完全負相關，\\(r=-1\\)。',
        },
      ],
      count
    );
  }

  function buildS232CorrelationSensitivitySet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '給定 5 筆數據 \\((1,3),(2,4),(4,5),(3,10),(10,12)\\)。若去掉一點後希望剩下 4 筆資料的相關係數絕對值最大，應去掉哪一點？',
          a: '簡答：去掉 \\((3,10)\\)。過程：\\((3,10)\\) 明顯偏離其餘點的上升趨勢。移除後剩餘點較貼近上升直線，\\(|r|\\) 最大。',
        },
        {
          q: '在散布圖中，若某一點恰好落在原始數據的迴歸線上，移除該點後相關係數 \\(r\\) 的絕對值會如何變化？',
          a: '簡答：不一定。過程：該點在迴歸線上代表殘差為 0，但相關係數還受該點離平均點的遠近影響；移除後 \\(S_{xx},S_{yy},S_{xy}\\) 都會改變，因此 \\(|r|\\) 不一定變大或變小。',
        },
        {
          q: '若一組數據的 \\(r=0.99\\)，現加入一個極端離群值且遠離原趨勢線，判斷新相關係數的變化趨勢。',
          a: '簡答：\\(|r|\\) 通常會變小。過程：原本 \\(r=0.99\\) 表示高度線性；加入遠離趨勢線的離群值會增加殘差、降低線性貼合程度，所以相關係數絕對值通常下降。',
        },
        {
          q: '設 4 筆資料剛好構成正方形四個頂點，若在正方形中心增加第 5 個點，其相關係數如何改變？',
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
          q: '若 \\(x,y\\) 的相關係數為 0.8，求 \\(z=2x+5\\) 與 \\(w=3y-2\\) 的相關係數。',
          a: '簡答：0.8。過程：兩個變數都乘以正數再平移，不改變相關係數，所以 \\(r_{zw}=r_{xy}=0.8\\)。',
        },
        {
          q: '已知 \\(r(x,y)=0.6\\)，求 \\(r(-x+1,2y+3)\\) 之值。',
          a: '簡答：\\(-0.6\\)。過程：平移不影響相關係數；乘以負數會改變符號，乘以正數不改變符號，所以新相關係數為 \\(-0.6\\)。',
        },
        {
          q: '設 \\(y\\) 對 \\(x\\) 的迴歸線斜率為 0.4。若將所有 \\(x\\) 乘以 2、所有 \\(y\\) 乘以 3，求新數據的迴歸線斜率。',
          a: '簡答：\\(\\frac35\\)。過程：令 \\(X=2x,Y=3y\\)。新斜率為 \\(\\frac{3}{2}\\) 倍原斜率，所以為 \\(\\frac32\\cdot0.4=0.6=\\frac35\\)。',
        },
        {
          q: '某班成績調整，新分數 \\(y=1.5x-10\\)。若原始分數與另一科 \\(z\\) 的相關係數為 \\(r\\)，求調整後分數 \\(y\\) 與 \\(z\\) 的相關係數。',
          a: '簡答：\\(r\\)。過程：\\(y=1.5x-10\\) 是對 \\(x\\) 做正倍數線性變換，相關係數不變，因此 \\(r(y,z)=r(x,z)=r\\)。',
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
          q: '已知 \\(y\\) 對 \\(x\\) 的迴歸線斜率為 \\(m_1\\)，\\(x\\) 對 \\(y\\) 的迴歸線斜率為 \\(m_2\\)，說明 \\(m_1m_2=r^2\\)。',
          a: '簡答：\\(m_1m_2=r^2\\)。過程：\\(m_1=r\\frac{\\sigma_y}{\\sigma_x}\\)，\\(m_2=r\\frac{\\sigma_x}{\\sigma_y}\\)，相乘得 \\(m_1m_2=r^2\\)。',
        },
        {
          q: '若 \\(y\\) 對 \\(x\\) 的迴歸線斜率為正，判斷 \\(x\\) 與 \\(y\\) 是否為正相關。',
          a: '簡答：是。過程：迴歸斜率 \\(b=r\\frac{\\sigma_y}{\\sigma_x}\\)。標準差皆為正，所以斜率正代表 \\(r>0\\)，即正相關。',
        },
        {
          q: '給定兩組數據的平均數與標準差，且已知相關係數 \\(r\\)，計算迴歸直線時是否一定通過平均點？',
          a: '簡答：一定通過 \\((\\mu_x,\mu_y)\\)。過程：迴歸線形式為 \\(y-\mu_y=r\\frac{\\sigma_y}{\\sigma_x}(x-\mu_x)\\)，代入 \\((\\mu_x,\mu_y)\\) 必成立。',
        },
        {
          q: '有四組數據 A、B、C、D，散布圖分布不同但計算出相同的迴歸直線，試問哪兩組可能相關係數不同？',
          a: '簡答：散布程度不同的兩組可能不同。過程：迴歸直線只固定平均點與斜率；相關係數還受 \\(\\sigma_x,\\sigma_y\\) 與點群貼近直線程度影響，因此同一直線仍可能有不同 \\(r\\)。',
        },
        {
          q: '在迴歸直線 \\(y=a+bx\\) 中，已知 \\(b=r\\frac{\\sigma_y}{\\sigma_x}\\)。若 \\(\\sigma_x<\\sigma_y\\)，判斷 \\(|b|\\) 是否必大於 \\(|r|\\)。',
          a: '簡答：不一定；當 \\(r\\ne0\\) 時才會大於。過程：\\(|b|=|r|\\frac{\\sigma_y}{\\sigma_x}\\)。因 \\(\\sigma_y>\\sigma_x\\)，若 \\(|r|>0\\)，則 \\(|b|>|r|\\)；但若 \\(r=0\\)，則 \\(|b|=|r|=0\\)，所以不能說必大於。',
        },
      ],
      count
    );
  }

  function buildS232RegressionLineSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '已知 \\(\\mu_x=60,\\mu_y=70,\\sigma_x=10,\\sigma_y=6,r=\\frac34\\)，求 \\(y\\) 對 \\(x\\) 的迴歸直線方程式。',
          a: '簡答：\\(y-70=\\frac9{20}(x-60)\\)。過程：斜率為 \\(r\\frac{\\sigma_y}{\\sigma_x}=\\frac34\\cdot\\frac6{10}=\\frac9{20}\\)。迴歸線通過 \\((60,70)\\)，故 \\(y-70=\\frac9{20}(x-60)\\)。',
        },
        {
          q: '已知 \\(\\mu_x=60,\\mu_y=70,\\sigma_x=10,\\sigma_y=6,r=\\frac34\\)。若 \\(x=80\\)，利用迴歸直線預測 \\(y\\)。',
          a: '簡答：79。過程：由迴歸線 \\(y-70=\\frac9{20}(x-60)\\)，代入 \\(x=80\\)，得 \\(y=70+\\frac9{20}\\cdot20=79\\)。',
        },
        {
          q: '給定數據 \\((3,1),(5,3),(1,t)\\)，若其迴歸直線為 \\(y=\\frac14x+\\frac54\\)，求 \\(t\\) 之值。',
          a: '簡答：2。過程：迴歸直線必通過平均點。\\(\\mu_x=(3+5+1)/3=3\\)，直線在 \\(x=3\\) 時 \\(y=2\\)，所以 \\(\\mu_y=(1+3+t)/3=2\\)，得 \\(t=2\\)。',
        },
        {
          q: '某商店統計廣告費 \\(x\\) 與銷售額 \\(y\\) 的迴歸直線為 \\(y=7.164+0.124x\\)。問廣告費增加 1 單位時，銷售額預估增加多少？',
          a: '簡答：0.124 單位。過程：迴歸線斜率 0.124 表示 \\(x\\) 每增加 1 單位，預測的 \\(y\\) 平均增加 0.124 單位。',
        },
        {
          q: '設 \\(y\\) 對 \\(x\\) 的迴歸方程式為 \\(y=2x+10\\)，已知 \\(\\mu_x=5\\)，求 \\(\\mu_y\\)。',
          a: '簡答：20。過程：迴歸線必通過平均點 \\((\\mu_x,\mu_y)\\)。代入 \\(x=5\\)，得 \\(\\mu_y=2\\cdot5+10=20\\)。',
        },
      ],
      count
    );
  }

  function buildS232ReciprocalSlopesSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '已知 \\(y\\) 對 \\(x\\) 的迴歸線斜率為 0.8，\\(x\\) 對 \\(y\\) 的迴歸線斜率為 0.2，求相關係數 \\(r\\) 的絕對值。',
          a: '簡答：\\(|r|=\\frac25\\)。過程：兩迴歸斜率乘積為 \\(r^2\\)，所以 \\(r^2=0.8\\cdot0.2=0.16\\)，故 \\(|r|=0.4=\\frac25\\)。',
        },
        {
          q: '設 \\(y\\) 對 \\(x\\) 的迴歸線為 \\(y=0.5x+1\\)，\\(x\\) 對 \\(y\\) 的迴歸線為 \\(x=0.5y+2\\)，求其相關係數 \\(r\\)。',
          a: '簡答：\\(r=\\frac12\\)。過程：兩斜率皆為正，故 \\(r>0\\)。又 \\(r^2=0.5\\cdot0.5=0.25\\)，所以 \\(r=0.5=\\frac12\\)。',
        },
        {
          q: '若兩變數相關係數 \\(r=0.6\\)，且 \\(y\\) 對 \\(x\\) 的迴歸線斜率為 0.4，求 \\(x\\) 對 \\(y\\) 的迴歸線斜率。',
          a: '簡答：\\(0.9\\)。過程：設另一斜率為 \\(m\\)，則 \\(0.4m=r^2=0.36\\)，所以 \\(m=0.9\\)。',
        },
        {
          q: '已知 \\(r=-0.8\\)，且 \\(y\\) 對 \\(x\\) 的迴歸線斜率為 -1.6，求 \\(x\\) 對 \\(y\\) 的迴歸線斜率。',
          a: '簡答：\\(-0.4\\)。過程：兩斜率乘積為 \\(r^2=0.64\\)。設另一斜率為 \\(m\\)，則 \\((-1.6)m=0.64\\)，故 \\(m=-0.4\\)。',
        },
        {
          q: '判斷：若 \\(y\\) 對 \\(x\\) 與 \\(x\\) 對 \\(y\\) 的迴歸直線斜率互為倒數，則相關係數 \\(r\\) 必為 1 或 -1。',
          a: '簡答：正確。過程：斜率互為倒數表示乘積為 1，而兩迴歸斜率乘積等於 \\(r^2\\)，所以 \\(r^2=1\\)，故 \\(r=1\\) 或 \\(-1\\)。',
        },
      ],
      count
    );
  }

  function buildS232MeanPointSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '某組數據的迴歸線為 \\(y=2x+5\\)，已知 \\(\\mu_x=10\\)，求 \\(\\mu_y\\)。',
          a: '簡答：25。過程：迴歸線必通過平均點，所以 \\(\\mu_y=2\\cdot10+5=25\\)。',
        },
        {
          q: '已知 \\(\\mu_x=60,\\mu_y=70\\)，且迴歸線通過 \\((50,62)\\)，求該迴歸線方程式。',
          a: '簡答：\\(y-70=\\frac45(x-60)\\)。過程：迴歸線通過 \\((60,70)\\) 與 \\((50,62)\\)，斜率為 \\(\\frac{70-62}{60-50}=\\frac45\\)，故方程式為 \\(y-70=\\frac45(x-60)\\)。',
        },
        {
          q: '給定三筆數據 \\((2,4),(4,6),(a,b)\\)，若其迴歸線為 \\(y=x+2\\) 且 \\(\\mu_x=4\\)，求數對 \\((a,b)\\)。',
          a: '簡答：\\((6,8)\\)。過程：\\(\\mu_x=(2+4+a)/3=4\\)，得 \\(a=6\\)。平均點在迴歸線上，所以 \\(\\mu_y=4+2=6\\)。因此 \\((4+6+b)/3=6\\)，得 \\(b=8\\)。',
        },
        {
          q: '設 \\(y\\) 對 \\(x\\) 的迴歸線為 \\(y=-3x+100\\)。試問該直線與 \\(y=x\\) 的交點是否可能為平均點？',
          a: '簡答：可能。過程：交點由 \\(x=-3x+100\\) 得 \\((25,25)\\)。只要資料的平均點為 \\((25,25)\\)，迴歸線就會通過它，因此該交點可能是平均點。',
        },
        {
          q: '若數據經過平移後新平均點為 \\((0,0)\\)，且原迴歸線為 \\(y=0.5x+3\\)、\\(\\mu_x=4\\)，求新迴歸線方程式。',
          a: '簡答：\\(Y=\\frac12X\\)。過程：原平均點在迴歸線上，故 \\(\\mu_y=0.5\\cdot4+3=5\\)。令 \\(X=x-4,Y=y-5\\)，代入原式得 \\(Y+5=0.5(X+4)+3\\)，化簡為 \\(Y=0.5X\\)。',
        },
      ],
      count
    );
  }

  function buildS232LeastSquaresSet(count) {
    return buildS223TemplateSet(
      [
        {
          q: '給定數據 \\((2,1),(3,2),(2,3)\\)，求實數 \\(a,b\\) 使 \\(D=\\sum_{i=1}^3(y_i-a-bx_i)^2\\) 最小。',
          a: '簡答：\\(a=2,b=0\\)。過程：\\(\\bar x=\\frac73,\\bar y=2\\)。計算 \\(S_{xy}=0\\)，所以最小平方法斜率 \\(b=0\\)，截距 \\(a=\\bar y-b\\bar x=2\\)。',
        },
        {
          q: '設 \\(g(a,b)=(a+b-1)^2+(a+2b-3)^2+(a+4b-7)^2+(a+5b-9)^2\\)，求使 \\(g(a,b)\\) 產生最小值的數對 \\((a,b)\\)。',
          a: '簡答：\\((a,b)=(-1,2)\\)。過程：這等同用直線 \\(y=a+bx\\) 配適點 \\((1,1),(2,3),(4,7),(5,9)\\)。由 \\(\\bar x=3,\\bar y=5\\)，\\(S_{xx}=10,S_{xy}=20\\)，得 \\(b=2\\)，\\(a=5-2\\cdot3=-1\\)。',
        },
        {
          q: '已知三點 \\((1,2),(2,3),(3,k)\\)，若最小平方法所得迴歸線斜率為 1，求 \\(k\\)。',
          a: '簡答：4。過程：\\(\\bar x=2\\)，\\(S_{xx}=2\\)。\\(\\bar y=\\frac{5+k}{3}\\)，\\(S_{xy}=(-1)(2-\\bar y)+0+(1)(k-\bar y)=k-2\\)。斜率 \\(b=\\frac{S_{xy}}{S_{xx}}=\\frac{k-2}{2}=1\\)，得 \\(k=4\\)。',
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
    return buildS223TemplateSet(
      [
        {
          q: '原數據 \\(y\\) 對 \\(x\\) 的迴歸線為 \\(y=0.5x+3\\)。若令 \\(x^{\\prime}=10x+2\\)、\\(y^{\\prime}=y-6\\)，求新數據 \\(y^{\\prime}\\) 對 \\(x^{\\prime}\\) 的迴歸線。',
          a: '簡答：\\(y^{\\prime}=\\frac1{20}x^{\\prime}-\\frac{31}{10}\\)。過程：由 \\(x=\\frac{x^{\\prime}-2}{10}\\)、\\(y=y^{\\prime}+6\\)，代入 \\(y=0.5x+3\\)，得 \\(y^{\\prime}+6=\\frac12\\cdot\\frac{x^{\\prime}-2}{10}+3\\)，化簡即得。',
        },
        {
          q: '已知身高 \\(x\\)（公分）與體重 \\(y\\)（公斤）的迴歸線為 \\(y=0.6x-50\\)。若將身高單位改為吋（1 吋 = 2.54 公分），求新的迴歸線斜率。',
          a: '簡答：1.524。過程：若新變數 \\(X\\) 為吋，則原身高 \\(x=2.54X\\)。代入得 \\(y=0.6(2.54X)-50=1.524X-50\\)，斜率為 1.524。',
        },
        {
          q: '設 \\(y\\) 對 \\(x\\) 的迴歸線為 \\(y=0.25x+0.13\\)。若將所有 \\(x_i\\) 均加上 10，所有 \\(y_i\\) 均加上 20，求迴歸線的斜率是否改變。',
          a: '簡答：不改變，仍為 \\(0.25\\)。過程：平移資料只改變平均點與截距，不改變離差與斜率，因此新迴歸線斜率仍為 0.25。',
        },
        {
          q: '若將數據標準化後所得迴歸線為 \\(y^{\\prime}=0.8x^{\\prime}\\)，已知 \\(\\mu_x=10,\\mu_y=20,\\sigma_x=2,\\sigma_y=5\\)，還原出原始數據的迴歸線。',
          a: '簡答：\\(y=2x\\)。過程：標準化迴歸線斜率 0.8 即 \\(r=0.8\\)。原斜率為 \\(r\\frac{\\sigma_y}{\\sigma_x}=0.8\\cdot\\frac52=2\\)。通過平均點 \\((10,20)\\)，所以 \\(y-20=2(x-10)\\)，即 \\(y=2x\\)。',
        },
        {
          q: '某公司統計廣告費 \\(x\\) 與營業額 \\(y\\) 的關係為 \\(\\hat y=3x-17\\)。若廣告費改以「增加 10% 後的數值」\\(x^{\\prime}=1.1x\\) 表示，且營業額全面提升 5 單位，求新預測模型。',
          a: '簡答：\\(\\hat y^{\\prime}=\\frac{30}{11}x^{\\prime}-12\\)。過程：新營業額 \\(y^{\\prime}=y+5\\)，且 \\(x=\\frac{x^{\\prime}}{1.1}=\\frac{10}{11}x^{\\prime}\\)。代入得 \\(\\hat y^{\\prime}=3\\cdot\\frac{10}{11}x^{\\prime}-17+5=\\frac{30}{11}x^{\\prime}-12\\)。',
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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS241CoterminalQuadrantSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 3 === 0) {
        const angle = s241Pick([720, 810, 930, 1120, 1280, -250, -530, 2000]);
        const positive = s241AngleMod(angle);
        const negative = positive === 0 ? -360 : positive - 360;
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
        const angle = s241Pick([120, 210, 237, 315, -177, -350, 725]);
        const q = s241Quadrant(angle);
        questions.push(`判斷角 \\(${angle}^\\circ\\) 的終邊所在位置。`);
        answers.push(
          `簡答：${q}。過程：先化成 \\(0^\\circ\\leq\\theta<360^\\circ\\) 的同界角，得 \\(${s241AngleMod(angle)}^\\circ\\)，再判斷其象限或坐標軸。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS241ReductionIdentitySet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const theta = s241Pick([10, 20, 30, 40, 50, 60, 70, 80]);
      const type = i % 5;
      if (type === 0) {
        questions.push(
          `化簡 \\(\\sin(90^\\circ+\\theta)\\cos(90^\\circ+\\theta)-\\sin(180^\\circ-\\theta)\\cos(180^\\circ-\\theta)\\)。`
        );
        answers.push(
          `簡答：0。過程：\\(\\sin(90^\\circ+\\theta)=\\cos\\theta\\)，\\(\\cos(90^\\circ+\\theta)=-\\sin\\theta\\)，第一項為 \\(-\\sin\\theta\\cos\\theta\\)。又 \\(\\sin(180^\\circ-\\theta)=\\sin\\theta\\)，\\(\\cos(180^\\circ-\\theta)=-\\cos\\theta\\)，第二項也為 \\(-\\sin\\theta\\cos\\theta\\)，相減得 0。`
        );
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS241TrigInterpolationSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS241TrigQuadraticRootsSet(count) {
    const angles = [30, 45, 60, 120, 135, 150];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const angle = s241Pick(angles);
      const trig = S241_TRIG[angle];
      const sinText = s241TrigLatex(trig.sin);
      const cosText = s241TrigLatex(trig.cos);
      const tanText = s241TrigLatex(trig.tan);
      const sumText = `${sinText}${cosText.startsWith('-') ? cosText : `+${cosText}`}`;
      const prodText = s241SqrtCoeff(trig.sin[0] * trig.cos[0], trig.sin[1] * trig.cos[1], trig.sin[2] * trig.cos[2]);
      const prodTerm = prodText.startsWith('-') ? prodText : `+${prodText}`;
      questions.push(
        `設 \\(\\sin A\\) 與 \\(\\cos A\\) 為二次方程式 \\(t^2-(${sumText})t${prodTerm}=0\\) 的兩根，且 \\(A\\) 在${S241_TRIG[angle].quad}，求 \\(\\tan A\\)。`
      );
      answers.push(
        `簡答：\\(\\tan A=${tanText}\\)。過程：方程兩根為 \\(\\sin A\\) 與 \\(\\cos A\\)，由係數可得其和與積。又 \\(A\\) 在${S241_TRIG[angle].quad}，對應標準角為 \\(${angle}^\\circ\\)，所以 \\(\\sin A=${sinText}\\)、\\(\\cos A=${cosText}\\)，故 \\(\\tan A=\\frac{\\sin A}{\\cos A}=${tanText}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS241RepresentingSegmentsSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const type = i % 3;
      if (type === 0) {
        questions.push(
          '在單位圓中，點 \\(T\\) 為切點且 \\(\\angle AOT=\\theta\\)。若切線與射線 \\(OA\\) 的延長線交於 \\(A\\)，試以 \\(\\theta\\) 表示 \\(OT\\) 與 \\(AT\\)。'
        );
        answers.push(
          '簡答：\\(OT=1,\\ AT=\\tan\\theta\\)。過程：\\(OT\\) 是半徑，所以為 1；在直角三角形中，\\(\\tan\\theta=\\frac{AT}{OT}\\)，故 \\(AT=\\tan\\theta\\)。'
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
          `簡答：\\(2\\cdot${r}\\sin\\frac{\\theta}{2}\\)。過程：連結圓心與弦中點會形成直角三角形，半弦長為 \\(${r}\\sin\\frac{\\theta}{2}\\)，所以弦長為 \\(2\\cdot${r}\\sin\\frac{\\theta}{2}\\)。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS241AngleBisectorAreaSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS241TrigExtremaIdentitySet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const s = s241Pick([
          [5, 4],
          [6, 5],
          [4, 3],
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
        const a = s241Pick([1, 2, 3, 4]);
        questions.push(`求函數 \\(f(x)=\\cos 2x-${a}\\sin x\\) 的最大值與最小值。`);
        answers.push(
          `簡答：最大值 \\(${formatFraction(8 + a * a, 8)}\\)，最小值 \\(-${1 + a}\\)。過程：\\(\\cos2x=1-2\\sin^2x\\)。令 \\(t=\\sin x\\)，\\(-1\\le t\\le1\\)，則 \\(f=1-2t^2-${a}t\\)。此二次式開口向下，頂點在 \\(t=-\\frac{${a}}4\\)，最大值為 \\(1+\\frac{${a * a}}8=${formatFraction(8 + a * a, 8)}\\)；端點比較得最小值 \\(-${1 + a}\\)。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS241SideAltitudeSineRatioSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS241TerminalLineDefinitionSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS241TriangleAngleIdentitySet(count) {
    const identities = [
      ['\\sin(A+B)', '\\sin(180^\\circ-C)=\\sin C'],
      ['\\cos(A+B)', '\\cos(180^\\circ-C)=-\\cos C'],
      ['\\sin\\frac{A+B}{2}', '\\sin(90^\\circ-\\frac C2)=\\cos\\frac C2'],
      ['\\cos\\frac{A+B}{2}', '\\cos(90^\\circ-\\frac C2)=\\sin\\frac C2'],
      ['\\tan(A+B)+\\tan C', '\\tan(180^\\circ-C)+\\tan C=-\\tan C+\\tan C=0'],
      ['\\sin(A+B)+\\sin C', '\\sin(180^\\circ-C)+\\sin C=2\\sin C'],
      ['\\cos(A+B)+\\cos C', '\\cos(180^\\circ-C)+\\cos C=0'],
      ['\\tan(A+B)\\tan C', '\\tan(180^\\circ-C)\\tan C=-\\tan^2 C'],
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s241Pick(identities);
      questions.push(`在 \\(\\triangle ABC\\) 中，化簡 \\(${item[0]}\\)。`);
      answers.push(
        `簡答：\\(${item[1].split('=')[item[1].split('=').length - 1]}\\)。過程：三角形內角和為 \\(A+B+C=180^\\circ\\)，所以 \\(A+B=180^\\circ-C\\)。代入後用誘導公式：\\(${item[1]}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS241SquareSumSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS241SameAngleComparisonSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
      { angles: [45, 45, 90], ratio: ['1', '1', '\\sqrt{2}'] },
      { angles: [30, 75, 75], ratio: ['1', '1+\\sqrt{3}', '1+\\sqrt{3}'] },
      { angles: [60, 60, 60], ratio: ['1', '1', '1'] },
    ];
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242CircumradiusSet(count) {
    const angles = [30, 45, 60, 90, 120, 135, 150];
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242SsaAmbiguousSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const b = s242Pick([8, 10, 12, 14, 16]);
      const A = 30;
      const h = b / 2;
      const mode = i % 4;
      const a = mode === 0 ? h - 1 : mode === 1 ? h : mode === 2 ? h + s242Pick([1, 2, 3]) : b + s242Pick([1, 2, 4]);
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242AltitudeSineRatioSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242CosineSasSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242CosineSssAngleSet(count) {
    const triples = [
      { a: 5, b: 4, c: 3, angle: '90^\\circ', cos: '0' },
      { a: 7, b: 5, c: 3, angle: '120^\\circ', cos: '-\\frac12' },
      { a: 13, b: 8, c: 7, angle: '120^\\circ', cos: '-\\frac12' },
      { a: 7, b: 8, c: 5, angle: '60^\\circ', cos: '\\frac12' },
      { a: 5, b: 5, c: 6, angle: '約 \\(73.7^\\circ\\)', cos: '\\frac{7}{25}' },
    ];
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242AlgebraicSideRelationSet(count) {
    const cases = [
      { k: 1, angle: '120^\\circ', cos: '-\\frac12' },
      { k: 2, angle: '90^\\circ', cos: '0' },
      { k: 3, angle: '60^\\circ', cos: '\\frac12' },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const letter = s242Pick(['A', 'B', 'C']);
      const pair = letter === 'A' ? ['b', 'c', 'a'] : letter === 'B' ? ['c', 'a', 'b'] : ['a', 'b', 'c'];
      questions.push(
        `若 \\(\\triangle ABC\\) 滿足 \\((${pair[2]}+${pair[0]}+${pair[1]})(${pair[0]}+${pair[1]}-${pair[2]})=${item.k}${pair[0]}${pair[1]}\\)，求 \\(\\angle ${letter}\\) 的度數。`
      );
      answers.push(
        `簡答：\\(\\angle ${letter}=${item.angle}\\)。過程：左式為 \\((${pair[0]}+${pair[1]})^2-${pair[2]}^2=${pair[0]}^2+${pair[1]}^2-${pair[2]}^2+2${pair[0]}${pair[1]}\\)。由條件得 \\(${pair[0]}^2+${pair[1]}^2-${pair[2]}^2=(${item.k}-2)${pair[0]}${pair[1]}\\)，所以 \\(\\cos ${letter}=${item.cos}\\)，故 \\(\\angle ${letter}=${item.angle}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3, 4]);
      questions.push(`三角形三邊長分別為 ${item.sides.map((value) => value * scale).join('、')}，判斷此三角形的形狀。`);
      answers.push(`簡答：${item.ans}。過程：先取最大邊檢查平方關係；${item.why}，因此判定為${item.ans}。`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242CyclicQuadrilateralDiagonalSet(count) {
    const cases = [
      { AB: 3, BC: 4, CD: 5, DA: 6, angleB: 60 },
      { AB: 4, BC: 5, CD: 6, DA: 7, angleB: 120 },
      { AB: 5, BC: 5, CD: 4, DA: 6, angleB: 60 },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const cos = item.angleB === 60 ? 1 / 2 : -1 / 2;
      const ac2 = item.AB * item.AB + item.BC * item.BC - 2 * item.AB * item.BC * cos;
      const dAngle = 180 - item.angleB;
      const scale = s242Pick([1, 2, 3]);
      const acText = s241SqrtCoeff(scale, 1, ac2);
      questions.push(
        `圓內接四邊形 \\(ABCD\\) 中，\\(AB=${item.AB * scale}\\)、\\(BC=${item.BC * scale}\\)、\\(\\angle ABC=${item.angleB}^\\circ\\)，求對角線 \\(AC\\) 的長度，並寫出 \\(\\angle ADC\\)。`
      );
      answers.push(
        `簡答：\\(AC=${acText}\\)，\\(\\angle ADC=${dAngle}^\\circ\\)。過程：在 \\(\\triangle ABC\\) 用餘弦定理得 \\(AC^2=${scale * scale * ac2}\\)。又圓內接四邊形對角互補，所以 \\(\\angle ADC=180^\\circ-${item.angleB}^\\circ=${dAngle}^\\circ\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242TwoSideAngleAreaSet(count) {
    const angles = [30, 45, 60, 90, 120, 150];
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3]);
      const sides = item.sides.map((value) => value * scale);
      const s = sides.reduce((a, b) => a + b, 0) / 2;
      const area = s241SqrtCoeff(item.areaCoeff * scale * scale, 1, item.areaRad);
      questions.push(`已知 \\(\\triangle ABC\\) 三邊長為 ${sides.join('、')}，利用海龍公式求面積。`);
      answers.push(
        `簡答：\\(\\Delta=${area}\\)。過程：半周長 \\(s=${s}\\)，海龍公式 \\(\\Delta=\\sqrt{s(s-a)(s-b)(s-c)}\\)。此題可視為基本邊組放大 ${scale} 倍，面積放大 ${scale * scale} 倍，得 \\(${area}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242InradiusCircumradiusSet(count) {
    const cases = [
      { sides: [3, 4, 5], r: [1, 1], R: [5, 2] },
      { sides: [5, 5, 6], r: [2, 1], R: [25, 8] },
      { sides: [6, 8, 10], r: [2, 1], R: [5, 1] },
      { sides: [13, 14, 15], r: [4, 1], R: [65, 8] },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3]);
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242CyclicQuadrilateralAreaSet(count) {
    const cases = [
      { sides: [4, 3, 3, 2], areaCoeff: 6, areaRad: 2 },
      { sides: [1, 2, 3, 4], areaCoeff: 2, areaRad: 6 },
      { sides: [2, 3, 4, 5], areaCoeff: 2, areaRad: 30 },
      { sides: [3, 3, 5, 5], areaCoeff: 4, areaRad: 14 },
    ];
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242DiagonalAreaExtremaSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242MedianLengthSet(count) {
    const cases = [
      { a: 5, b: 7, c: 8, m2: 129 },
      { a: 6, b: 8, c: 10, m2: 73 },
      { a: 7, b: 5, c: 6, m2: 85 },
      { a: 8, b: 6, c: 9, m2: 98 },
    ];
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242AngleBisectorLengthSet(count) {
    const cases = [
      { A: 60, b: 12, c: 6 },
      { A: 60, b: 8, c: 6 },
      { A: 120, b: 4, c: 3 },
      { A: 60, b: 10, c: 5 },
    ];
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242HeightProjectionSet(count) {
    const cases = [
      { hyp: 5, leg1: 3, leg2: 4, h: [12, 5] },
      { hyp: 10, leg1: 6, leg2: 8, h: [24, 5] },
      { hyp: 13, leg1: 5, leg2: 12, h: [60, 13] },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3]);
      const hText = formatFraction(item.h[0] * scale, item.h[1]);
      questions.push(
        `直角 \\(\\triangle ABC\\) 中，\\(\\angle C=90^\\circ\\)，兩股長為 ${item.leg1 * scale} 與 ${item.leg2 * scale}，求斜邊上的高。`
      );
      answers.push(
        `簡答：\\(${hText}\\)。過程：面積可寫成 \\(\\frac12\\cdot${item.leg1 * scale}\\cdot${item.leg2 * scale}\\)，也可寫成 \\(\\frac12\\cdot${item.hyp * scale}\\cdot h\\)。所以 \\(h=${hText}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242ParallelogramDiagonalSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS242TrapezoidAreaSet(count) {
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
        target: '對岸目標到右端觀測點的距離',
      },
      {
        base: 100,
        A: 68,
        B: 30,
        answer(scale) {
          return `\\frac{${100 * scale}\\sin 68^\\circ}{\\sin 82^\\circ}`;
        },
        target: '觀測點到小島的距離',
      },
      {
        base: 200,
        A: 30,
        B: 55,
        answer(scale) {
          return `\\frac{${200 * scale}\\sin 30^\\circ}{\\sin 95^\\circ}`;
        },
        target: '對岸目標到右端觀測點的距離',
      },
      {
        base: 160,
        A: 45,
        B: 45,
        answer(scale) {
          return `${80 * scale}\\sqrt{2}`;
        },
        target: '目標到左端觀測點的距離',
      },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3]);
      const base = item.base * scale;
      const ans = item.answer(scale);
      questions.push(
        `岸邊取基線 \\(AB=${base}\\) 公尺，觀測對岸目標 \\(C\\)，已知 \\(\\angle CAB=${item.A}^\\circ\\)、\\(\\angle CBA=${item.B}^\\circ\\)，求${item.target}。`
      );
      answers.push(
        `簡答：\\(${ans}\\) 公尺。過程：先得 \\(\\angle C=180^\\circ-${item.A}^\\circ-${item.B}^\\circ\\)。由正弦定理，所求邊可用 \\(\\frac{AB}{\\sin C}\\) 與對應角的正弦相乘；代入基線與兩端角即可得到 \\(${ans}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS243SasCrossDistanceSet(count) {
    const angles = [60, 90, 120];
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS243SlopeDoubleObservationSet(count) {
    const cases = [
      { d: 100, a: 30, b: 60, h: '50\\sqrt{3}' },
      { d: 200, a: 45, b: 75, h: '100(1+\\sqrt{3})' },
      { d: 120, a: 30, b: 45, h: '60(1+\\sqrt{3})' },
      { d: 80, a: 45, b: 60, h: '40(3+\\sqrt{3})' },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      const scale = s242Pick([1, 2, 3, 4]);
      questions.push(
        `某人沿著通往山頂的直線方向前進 ${item.d * scale} 公尺，仰角由 \\(${item.a}^\\circ\\) 變為 \\(${item.b}^\\circ\\)，求山頂相對於原水平線的高度。`
      );
      const h = item.h.replace(/^(\d+)/, (m) => String(Number(m) * scale));
      answers.push(
        `簡答：\\(${h}\\) 公尺。過程：設原位置到山腳投影的水平距離為 \\(x\\)，高度為 \\(h\\)。由 \\(h=x\\tan ${item.a}^\\circ=(x-${item.d * scale})\\tan ${item.b}^\\circ\\)，解出 \\(h=${h}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS243ArbitraryDivisionLineSet(count) {
    const cases = [
      { AB: 5, AC: 5, BC: 5, BD: 1, DC: 4, d2: 21 },
      { AB: 7, AC: 3, BC: 5, BD: 1, DC: 4, d2: 37 },
      { AB: 6, AC: 4, BC: 5, BD: 2, DC: 3, d2: 22 },
      { AB: 9, AC: 6, BC: 5, BD: 4, DC: 1, d2: 41 },
    ];
    const questions = [];
    const answers = [];
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
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS243CommonElevationCircumradiusSet(count) {
    const cases = [
      { triangle: '300、400、500', R: 250, theta: 30, h: '\\frac{250\\sqrt{3}}{3}' },
      { triangle: '300、300、300', R: '100\\sqrt{3}', theta: 30, h: '100' },
      { triangle: '3、4、5', R: '\\frac{5}{2}', theta: 60, h: '\\frac{5\\sqrt{3}}{2}' },
      { triangle: '200、200、200', R: '\\frac{200\\sqrt{3}}{3}', theta: 60, h: '200' },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      questions.push(
        `地面三點 \\(A,B,C\\) 對同一目標的仰角都為 \\(${item.theta}^\\circ\\)，且 \\(\\triangle ABC\\) 的三邊長為 ${item.triangle} 公尺。求目標高度。`
      );
      answers.push(
        `簡答：\\(${item.h}\\) 公尺。過程：三個觀測點仰角相同，目標底部投影到三點距離相同，因此投影點是 \\(\\triangle ABC\\) 的外心。水平距離為外接圓半徑 \\(R=${item.R}\\)，高度為 \\(R\\tan ${item.theta}^\\circ=${item.h}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS243DepressionTwoTargetsSet(count) {
    const cases = [
      { h: 150, a: 45, b: 30, ans: '150(\\sqrt{3}-1)' },
      { h: '100\\sqrt{3}', a: 60, b: 30, ans: '200' },
      { h: 200, a: 45, b: 30, ans: '200(\\sqrt{3}-1)' },
      { h: 2400, a: 45, b: 30, ans: '2400(\\sqrt{3}-1)' },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      questions.push(
        `在高 \\(${item.h}\\) 公尺的觀測點，看到同一直線方向上的兩個地面目標，其俯角分別為 \\(${item.a}^\\circ\\)、\\(${item.b}^\\circ\\)。求兩目標間的水平距離。`
      );
      answers.push(
        `簡答：\\(${item.ans}\\) 公尺。過程：俯角等於仰角。到目標的水平距離分別為 \\(\\frac{h}{\\tan ${item.a}^\\circ}\\)、\\(\\frac{h}{\\tan ${item.b}^\\circ}\\)，相減即得 \\(${item.ans}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS243SameElevationCircumcenterSet(count) {
    const cases = [
      { angle: 30, side: 300, known: '\\(\\angle ABC=45^\\circ\\)', R: '150\\sqrt{2}', h: '150\\sqrt{6}' },
      { angle: 15, side: 200, known: '\\(\\angle BAC=30^\\circ\\)', R: '200', h: '200(2-\\sqrt{3})' },
      { angle: 60, side: 500, known: '三邊長為 300、400、500', R: '250', h: '250\\sqrt{3}' },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      questions.push(
        `地面三點對同一目標的仰角均為 \\(${item.angle}^\\circ\\)。已知觀測三角形中 ${item.known}，且一邊長資料足以求得外接圓半徑 \\(R=${item.R}\\)。求目標高度。`
      );
      answers.push(
        `簡答：\\(${item.h}\\)。過程：仰角相同表示目標底部投影為觀測三角形外心，所以水平距離為 \\(R\\)。高度 \\(h=R\\tan ${item.angle}^\\circ=${item.h}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS243OffsetCollinearObservationSet(count) {
    const cases = [
      { AB: 100, BC: 100, ans: '50\\sqrt{3}' },
      { AB: 300, BC: 300, ans: '150\\sqrt{3}' },
      { AB: 200, BC: 100, ans: '100\\sqrt{3}' },
      { AB: 800, BC: 400, ans: '400\\sqrt{3}' },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      questions.push(
        `地面共線三點 \\(A,B,C\\) 觀測同一塔頂，仰角依次為 \\(30^\\circ,45^\\circ,60^\\circ\\)。已知 \\(AB=${item.AB}\\) 公尺、\\(BC=${item.BC}\\) 公尺，求塔高。`
      );
      answers.push(
        `簡答：\\(${item.ans}\\) 公尺。過程：設塔底不一定在三點連線上，利用三個觀測點到塔底投影的距離與高度構成直角三角形。由三個仰角的 \\(\\tan\\) 關係建立距離差，再解出高度為 \\(${item.ans}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS243SpatialMotionTrackingSet(count) {
    const cases = [
      { h: '500\\sqrt{3}', a: 60, b: 30, t: 5, v: '200\\sqrt{3}' },
      { h: '2400', a: 45, b: 30, t: 10, v: '240(\\sqrt{3}-1)' },
      { h: '1000', a: 45, b: 30, t: 5, v: '200(\\sqrt{3}-1)' },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      questions.push(
        `飛機等高度飛行，高度為 \\(${item.h}\\) 公尺，仰角由 \\(${item.a}^\\circ\\) 變為 \\(${item.b}^\\circ\\)，歷時 ${item.t} 秒。求飛機速率。`
      );
      answers.push(
        `簡答：\\(${item.v}\\) 公尺/秒。過程：水平距離為 \\(\\frac{h}{\\tan\\theta}\\)。兩次觀測的水平距離差除以時間，就是速率；代入 \\(${item.a}^\\circ\\)、\\(${item.b}^\\circ\\) 與 ${item.t} 秒，得 \\(${item.v}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS243BearingNavigationSet(count) {
    const cases = [
      { d: 20, angle: 90, ans: '20\\sqrt{2}' },
      { d: 15, angle: 90, ans: '15\\sqrt{2}' },
      { d: 20, angle: 120, ans: '20\\sqrt{3}' },
      { d: 40, angle: 60, ans: '40' },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      questions.push(
        `一船先向正北航行 ${item.d} 公里，之後由船上觀測島的方位改變，形成夾角 \\(${item.angle}^\\circ\\)。若兩次觀測到島的距離相同，求船與島的最近距離或兩位置間距離。`
      );
      answers.push(
        `簡答：\\(${item.ans}\\) 公里。過程：把航行路徑與兩條視線視為三角形，已知一邊與夾角。依題意用正弦定理或餘弦定理建立邊長關係，代入得 \\(${item.ans}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS243PerpendicularBearingSet(count) {
    const cases = [
      { h: 150, a: 45, b: 45, ans: '150\\sqrt{2}' },
      { h: '100\\sqrt{3}', a: 60, b: 30, ans: '100\\sqrt{10}' },
      { h: 120, a: 45, b: 45, ans: '120\\sqrt{2}' },
      { h: '60\\sqrt{3}', a: 60, b: 60, ans: '60\\sqrt{2}' },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      questions.push(
        `在塔的東方與南方各有一個觀測點，兩方向互相垂直。已知塔高 ${item.h} 公尺，兩點觀測塔頂的仰角分別為 \\(${item.a}^\\circ\\)、\\(${item.b}^\\circ\\)，求兩觀測點距離。`
      );
      answers.push(
        `簡答：\\(${item.ans}\\) 公尺。過程：兩觀測點到塔底的水平距離分別為 \\(\\frac{${item.h}}{\\tan ${item.a}^\\circ}\\)、\\(\\frac{${item.h}}{\\tan ${item.b}^\\circ}\\)。兩方向垂直，所以用畢氏定理求兩觀測點距離。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS243TyphoonTrackingSet(count) {
    const cases = [
      { d: '100\\sqrt{3}', speed: '50\\sqrt{3}', ans: '1' },
      { d: 300, speed: 50, ans: '6' },
      { d: '200\\sqrt{3}', speed: '100\\sqrt{3}', ans: '2' },
      { d: 600, speed: 60, ans: '10' },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      questions.push(
        `颱風中心在城市 \\(A\\) 的某一方位，距離為 \\(${item.d}\\) 公里，並沿直線以每小時 \\(${item.speed}\\) 公里前進。若其路徑會通過以 \\(A\\) 為圓心的警戒半徑，求進入警戒區後到最接近城市的時間。`
      );
      answers.push(
        `簡答：約 ${item.ans} 小時。過程：把城市到颱風路徑的垂線距離與颱風位移構成直角三角形。先判斷進入警戒區的位置，再用距離除以速率得到時間。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS243UniformMotionAngleChangeSet(count) {
    const cases = [
      { h: '500\\sqrt{3}', from: 60, to: 30, t: 5, ans: '200\\sqrt{3}' },
      { h: '200\\sqrt{3}', from: 30, to: 60, t: 10, ans: '40' },
      { h: 300, from: 45, to: 30, t: 5, ans: '60(\\sqrt{3}-1)' },
      { h: 600, from: 60, to: 45, t: 10, ans: '20(3-\\sqrt{3})' },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      questions.push(
        `一物體等速直線運動，高度為 \\(${item.h}\\) 公尺，觀測仰角由 \\(${item.from}^\\circ\\) 變為 \\(${item.to}^\\circ\\)，歷時 ${item.t} 秒，求其水平速率。`
      );
      answers.push(
        `簡答：\\(${item.ans}\\) 公尺/秒。過程：每次觀測的水平距離都是 \\(\\frac{h}{\\tan\\theta}\\)。兩次水平距離差除以 ${item.t} 秒，即為水平速率。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS243DynamicShortestDistanceSet(count) {
    const cases = [
      { D: 28, v1: 2, v2: 1, ans: '\\frac{28\\sqrt{5}}{5}' },
      { D: 20, v1: 3, v2: 4, ans: '16' },
      { D: 30, v1: 4, v2: 3, ans: '18' },
      { D: 50, v1: 5, v2: 12, ans: '\\frac{600}{13}' },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      questions.push(
        `兩物體從相距 ${item.D} 公里的兩點出發，行進方向互相垂直。一物體速率為 ${item.v1} 公里/時，另一物體速率為 ${item.v2} 公里/時，求兩者距離的最小值。`
      );
      answers.push(
        `簡答：\\(${item.ans}\\) 公里。過程：設時間為 \\(t\\)，距離平方可寫成 \\((${item.D}-${item.v1}t)^2+(${item.v2}t)^2\\)。這是一個二次式，配方或用頂點公式可得最小距離為 \\(${item.ans}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS243AngleBisectorMeasurementSet(count) {
    return buildS242AngleBisectorLengthSet(count);
  }

  function buildS243MedianCentroidMeasurementSet(count) {
    const cases = [
      { a: 5, b: 7, c: 8, m: '\\frac{\\sqrt{129}}{2}' },
      { a: 6, b: 8, c: 10, m: '\\frac{\\sqrt{73}}{2}' },
      { a: 7, b: 5, c: 6, m: '\\frac{\\sqrt{85}}{2}' },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      questions.push(
        `\\(\\triangle ABC\\) 中，三邊長為 \\(${item.a},${item.b},${item.c}\\)，求 \\(BC\\) 邊上的中線長；若重心為 \\(G\\)，再求 \\(AG\\)。`
      );
      answers.push(
        `簡答：中線長 \\(${item.m}\\)，\\(AG=\\frac{2}{3}\\cdot ${item.m}\\)。過程：中線公式 \\(m_a=\\frac12\\sqrt{2b^2+2c^2-a^2}\\)。重心把中線分成 \\(2:1\\)，所以 \\(AG=\\frac23m_a\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildS243DisplacementSegmentSet(count) {
    const cases = [
      { a: 90, b: 30, ans: '\\frac{\\sqrt{3}}{3}' },
      { a: 60, b: 30, ans: '\\sqrt{3}' },
      { a: 45, b: 30, ans: '1+\\sqrt{3}' },
      { a: 90, b: 45, ans: '1' },
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      questions.push(
        `一物體等速直線運動，從 \\(P\\) 到 \\(Q\\) 再到 \\(R\\)，且 \\(\\angle POQ=${item.a}^\\circ\\)、\\(\\angle QOR=${item.b}^\\circ\\)。若兩段時間相同，求 \\(\\tan\\angle OPQ\\)。`
      );
      answers.push(
        `簡答：\\(${item.ans}\\)。過程：等時間且等速表示兩段位移長相等。把 \\(P,Q,R\\) 與觀測點 \\(O\\) 構成三角形，再用正弦定理與角度關係可求 \\(\\tan\\angle OPQ=${item.ans}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
      's2-1-1-visual-group-patterns': {
        type: 'drill',
        title: '圖形規律與群數列',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS211VisualGroupPatternSet(5);
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
      's2-2-1-counting-applications-five-subtypes': {
        type: 'drill',
        title: '取捨計數與排列組合五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS221CountingApplicationsFiveSubtypeMixedSet(5);
        },
      },
      's2-2-1-inclusion-exclusion-applications': {
        type: 'drill',
        title: '取捨原理與文氏圖應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS221InclusionExclusionApplicationsSubtypeSet(5);
        },
      },
      's2-2-1-competition-probability-paths': {
        type: 'drill',
        title: '賽制與勝負機率路徑',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS221CompetitionProbabilityPathsSubtypeSet(5);
        },
      },
      's2-2-1-route-selection-counting': {
        type: 'drill',
        title: '路徑、選購與搭配問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS221RouteSelectionCountingSubtypeSet(5);
        },
      },
      's2-2-1-digit-formation-counting': {
        type: 'drill',
        title: '數字組成與計數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS221DigitFormationCountingSubtypeSet(5);
        },
      },
      's2-2-1-multiple-survey-counting': {
        type: 'drill',
        title: '倍數計數與調查統計',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS221MultipleSurveyCountingSubtypeSet(5);
        },
      },
      's2-2-1-product-rule-parameterized': {
        type: 'drill',
        title: '乘法原理的參數化搭配題',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildS221ProductRuleParameterizedSet(5);
        },
      },
      's2-2-1-inclusion-exclusion-multiples': {
        type: 'drill',
        title: '倍數聯集的取捨原理',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildS221InclusionExclusionMultiplesSet(5);
        },
      },
      's2-2-1-advanced-counting-five-subtypes': {
        type: 'drill',
        title: '展開項數因數路徑與塗色五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS221AdvancedCountingFiveSubtypeMixedSet(5);
        },
      },
      's2-2-1-polynomial-expansion-term-counting': {
        type: 'drill',
        title: '多項式展開項數與同型項',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS221PolynomialExpansionTermCountingSubtypeSet(5);
        },
      },
      's2-2-1-divisor-counting-conditions': {
        type: 'drill',
        title: '正因數個數與特定倍數判別',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS221DivisorCountingConditionsSubtypeSet(5);
        },
      },
      's2-2-1-route-restriction-counting': {
        type: 'drill',
        title: '搭配、路徑與開關問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS221RouteRestrictionCountingSubtypeSet(5);
        },
      },
      's2-2-1-restricted-digit-counting': {
        type: 'drill',
        title: '數字組成與限制條件',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS221RestrictedDigitCountingSubtypeSet(5);
        },
      },
      's2-2-1-region-coloring-counting': {
        type: 'drill',
        title: '區域塗色問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS221RegionColoringCountingSubtypeSet(5);
        },
      },
      's2-2-2-permutation-core-five-subtypes': {
        type: 'drill',
        title: '排列公式與直線排列限制五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS222PermutationCoreFiveSubtypeMixedSet(5);
        },
      },
      's2-2-2-permutation-equations': {
        type: 'drill',
        title: '排列數公式的代數運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS222PermutationEquationSubtypeSet(5);
        },
      },
      's2-2-2-identical-items-permutation': {
        type: 'drill',
        title: '不盡相異物排列',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS222IdenticalItemsPermutationSubtypeSet(5);
        },
      },
      's2-2-2-fixed-relative-order': {
        type: 'drill',
        title: '指定項目的相對順序固定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS222FixedRelativeOrderSubtypeSet(5);
        },
      },
      's2-2-2-position-constraints': {
        type: 'drill',
        title: '限制條件的直線排列',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS222PositionConstraintSubtypeSet(5);
        },
      },
      's2-2-2-derangement-position-exclusion': {
        type: 'drill',
        title: '多重位置限制與錯排應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS222DerangementPositionExclusionSubtypeSet(5);
        },
      },
      's2-2-2-permutation-applications-five-subtypes': {
        type: 'drill',
        title: '路徑數字信號與分配五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS222PermutationApplicationsFiveSubtypeMixedSet(5);
        },
      },
      's2-2-2-distribution-repeated': {
        type: 'drill',
        title: '重複排列與分配問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS222DistributionRepeatedSubtypeSet(5);
        },
      },
      's2-2-2-grid-paths': {
        type: 'drill',
        title: '棋盤街道的捷徑走法',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS222GridPathSubtypeSet(5);
        },
      },
      's2-2-2-number-formation': {
        type: 'drill',
        title: '數字組成與限制條件',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS222NumberFormationSubtypeSet(5);
        },
      },
      's2-2-2-signals-runs': {
        type: 'drill',
        title: '信號組成與連串變化數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS222SignalsRunsSubtypeSet(5);
        },
      },
      's2-2-2-internal-order-constraints': {
        type: 'drill',
        title: '具備內部次序限制的分組排列',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS222InternalOrderConstraintSubtypeSet(5);
        },
      },
      's2-2-2-repeated-letter-permutation-parameterized': {
        type: 'drill',
        title: '重複字母排列總數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS222RepeatedLetterPermutationParameterizedSet(5);
        },
      },
      's2-2-2-adjacent-pair-arrangement-parameterized': {
        type: 'drill',
        title: '指定兩項相鄰的排列',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS222AdjacentPairArrangementParameterizedSet(5);
        },
      },
      's2-2-3-binomial-basics-five-subtypes': {
        type: 'drill',
        title: '二項式展開與基本應用五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223BinomialBasicsFiveSubtypeMixedSet(5);
        },
      },
      's2-2-3-binomial-coefficient': {
        type: 'drill',
        title: '求展開式中指定項的係數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223BinomialCoefficientSubtypeSet(5);
        },
      },
      's2-2-3-binomial-constant-term': {
        type: 'drill',
        title: '求展開式中的常數項',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223BinomialConstantTermSubtypeSet(5);
        },
      },
      's2-2-3-binomial-remainder-number': {
        type: 'drill',
        title: '大數除法的餘數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223BinomialRemainderNumberSubtypeSet(5);
        },
      },
      's2-2-3-polynomial-remainder-binomial': {
        type: 'drill',
        title: '多項式除法的餘式計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223PolynomialRemainderBinomialSubtypeSet(5);
        },
      },
      's2-2-3-combination-identity': {
        type: 'drill',
        title: '組合數恆等式求和',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223CombinationIdentitySubtypeSet(5);
        },
      },
      's2-2-3-combination-counting-five-subtypes': {
        type: 'drill',
        title: '組合計數與限制取法五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223CombinationCountingFiveSubtypeMixedSet(5);
        },
      },
      's2-2-3-subset-property': {
        type: 'drill',
        title: '數字子集的特殊性質判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223SubsetPropertySubtypeSet(5);
        },
      },
      's2-2-3-non-adjacent-selection': {
        type: 'drill',
        title: '不相鄰選取問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223NonAdjacentSelectionSubtypeSet(5);
        },
      },
      's2-2-3-poker-dice': {
        type: 'drill',
        title: '撲克牌牌型與骰子點數組合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223PokerDiceSubtypeSet(5);
        },
      },
      's2-2-3-hockey-stick-identity': {
        type: 'drill',
        title: '組合恆等式與曲棍球棒求和',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223HockeyStickIdentitySubtypeSet(5);
        },
      },
      's2-2-3-restricted-integer-solutions': {
        type: 'drill',
        title: '整除性奇偶與範圍限制方程解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223RestrictedIntegerSolutionsSubtypeSet(5);
        },
      },
      's2-2-3-advanced-binomial-five-subtypes': {
        type: 'drill',
        title: '進階二項式係數與多項式五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223AdvancedBinomialFiveSubtypeMixedSet(5);
        },
      },
      's2-2-3-maximum-coefficient': {
        type: 'drill',
        title: '係數最大項的判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223MaximumCoefficientSubtypeSet(5);
        },
      },
      's2-2-3-consecutive-coefficients': {
        type: 'drill',
        title: '連續項係數成特殊數列',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223ConsecutiveCoefficientSubtypeSet(5);
        },
      },
      's2-2-3-weighted-binomial-sums': {
        type: 'drill',
        title: '二項式展開的級數求和',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223WeightedBinomialSumSubtypeSet(5);
        },
      },
      's2-2-3-multinomial-expansion': {
        type: 'drill',
        title: '多項式展開與同型項計數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223MultinomialExpansionSubtypeSet(5);
        },
      },
      's2-2-3-complex-binomial-identity': {
        type: 'drill',
        title: '二項式與複數結合的組合求和',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223ComplexBinomialIdentitySubtypeSet(5);
        },
      },
      's2-2-3-applications-five-subtypes': {
        type: 'drill',
        title: '分配集合連串與有理項五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223ApplicationsFiveSubtypeMixedSet(5);
        },
      },
      's2-2-3-product-partition': {
        type: 'drill',
        title: '正整數乘積的分解與方程式解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223ProductPartitionSubtypeSet(5);
        },
      },
      's2-2-3-nested-subsets': {
        type: 'drill',
        title: '巢狀集合與包含關係計數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223NestedSubsetsSubtypeSet(5);
        },
      },
      's2-2-3-runs-counting': {
        type: 'drill',
        title: '符號排列的連串問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223RunsCountingSubtypeSet(5);
        },
      },
      's2-2-3-rational-irrational-terms': {
        type: 'drill',
        title: '二項式展開的有理項與無理項計數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223RationalIrrationalTermsSubtypeSet(5);
        },
      },
      's2-2-3-polynomial-remainder-variants': {
        type: 'drill',
        title: '多項式除法的二項式應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223PolynomialRemainderVariantsSubtypeSet(5);
        },
      },
      's2-2-3-grouping-distribution-five-subtypes': {
        type: 'drill',
        title: '分組分堆與同物分配五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223GroupingDistributionFiveSubtypeMixedSet(5);
        },
      },
      's2-2-3-binomial-coefficient-parameterized': {
        type: 'drill',
        title: '二項式指定項係數參數題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223BinomialCoefficientParameterizedSet(5);
        },
      },
      's2-2-3-identical-distribution-parameterized': {
        type: 'drill',
        title: '相同物分配與最低限制',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223IdenticalDistributionParameterizedSet(5);
        },
      },
      's2-2-3-distinct-equal-named-distribution': {
        type: 'drill',
        title: '相異物平均給特定對象',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223DistinctEqualNamedDistributionSubtypeSet(5);
        },
      },
      's2-2-3-distinct-equal-unnamed-piles': {
        type: 'drill',
        title: '相異物平均分成若干堆',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223DistinctEqualUnnamedPilesSubtypeSet(5);
        },
      },
      's2-2-3-distinct-specified-pile-sizes': {
        type: 'drill',
        title: '相異物按指定數量分堆',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223DistinctSpecifiedPileSizesSubtypeSet(5);
        },
      },
      's2-2-3-restricted-grouping-distribution': {
        type: 'drill',
        title: '具備特定人選限制的分組分配',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223RestrictedGroupingDistributionSubtypeSet(5);
        },
      },
      's2-2-3-identical-distribution': {
        type: 'drill',
        title: '相同物分配給相異對象',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS223IdenticalDistributionSubtypeSet(5);
        },
      },
      's2-2-4-basic-probability-five-subtypes': {
        type: 'drill',
        title: '古典機率與條件事件五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS224BasicProbabilityFiveSubtypeMixedSet(5);
        },
      },
      's2-2-4-classical-probability': {
        type: 'drill',
        title: '古典機率：骰子硬幣與卡片計數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS224ClassicalProbabilitySubtypeSet(5);
        },
      },
      's2-2-4-conditional-bayes': {
        type: 'drill',
        title: '條件機率與貝氏定理',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS224ConditionalBayesSubtypeSet(5);
        },
      },
      's2-2-4-independent-repeated': {
        type: 'drill',
        title: '獨立事件與重複試驗',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS224IndependentRepeatedSubtypeSet(5);
        },
      },
      's2-2-4-drawing-allocation': {
        type: 'drill',
        title: '取球與分配問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS224DrawingAllocationSubtypeSet(5);
        },
      },
      's2-2-4-algebra-geometry-probability': {
        type: 'drill',
        title: '代數幾何機率結合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS224AlgebraGeometryProbabilitySubtypeSet(5);
        },
      },
      's2-2-4-applied-probability-five-subtypes': {
        type: 'drill',
        title: '期望值集合與抽樣應用五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS224AppliedProbabilityFiveSubtypeMixedSet(5);
        },
      },
      's2-2-4-expected-value': {
        type: 'drill',
        title: '期望值與公平遊戲',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS224ExpectedValueSubtypeSet(5);
        },
      },
      's2-2-4-probability-set-relations': {
        type: 'drill',
        title: '機率性質與集合邊界判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS224ProbabilitySetRelationsSubtypeSet(5);
        },
      },
      's2-2-4-distribution-probability': {
        type: 'drill',
        title: '分組分堆與分配的機率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS224DistributionProbabilitySubtypeSet(5);
        },
      },
      's2-2-4-infinite-games': {
        type: 'drill',
        title: '無窮循環賽與狀態轉移',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS224InfiniteGamesSubtypeSet(5);
        },
      },
      's2-2-4-sampling-diagnostic': {
        type: 'drill',
        title: '抽樣調查與診斷誤判',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS224SamplingDiagnosticSubtypeSet(5);
        },
      },
      's2-2-4-exact-k-draw-probability-parameterized': {
        type: 'drill',
        title: '不放回抽取的恰好機率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS224ExactKDrawProbabilityParameterizedSet(5);
        },
      },
      's2-2-4-event-count-relations-parameterized': {
        type: 'drill',
        title: '事件交並與條件機率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS224EventCountRelationsParameterizedSet(5);
        },
      },
      's2-2-4-expected-value-parameterized': {
        type: 'drill',
        title: '期望值與遊戲損益參數題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS224ExpectedValueParameterizedSet(5);
        },
      },
      's2-3-1-core-stats-five-subtypes': {
        type: 'drill',
        title: '基本統計量與資料變換五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231CoreStatsFiveSubtypeMixedSet(5);
        },
      },
      's2-3-1-basic-ungrouped-statistics': {
        type: 'drill',
        title: '基礎統計量計算（未分組數據）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231BasicUngroupedSubtypeSet(5);
        },
      },
      's2-3-1-linear-transform-statistics': {
        type: 'drill',
        title: '數據的線性變換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231LinearTransformSubtypeSet(5);
        },
      },
      's2-3-1-weighted-mean-applications': {
        type: 'drill',
        title: '加權平均與幾何平均數應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231WeightedMeanSubtypeSet(5);
        },
      },
      's2-3-1-z-score-standardization': {
        type: 'drill',
        title: '數據標準化（Z 分數）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231ZScoreSubtypeSet(5);
        },
      },
      's2-3-1-binary-data-analysis': {
        type: 'drill',
        title: '二元數據（0 與 1）的特殊標準差',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231BinaryDataSubtypeSet(5);
        },
      },
      's2-3-1-revision-merge-five-subtypes': {
        type: 'drill',
        title: '資料修正合併與變異追蹤五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231RevisionMergeFiveSubtypeMixedSet(5);
        },
      },
      's2-3-1-merge-loss-tracking': {
        type: 'drill',
        title: '數據合併與缺失值追蹤',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231MergeLossSubtypeSet(5);
        },
      },
      's2-3-1-data-revision': {
        type: 'drill',
        title: '數據更正與修補',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231DataRevisionSubtypeSet(5);
        },
      },
      's2-3-1-group-merging': {
        type: 'drill',
        title: '多組數據合併',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231GroupMergingSubtypeSet(5);
        },
      },
      's2-3-1-algebraic-sums-variance': {
        type: 'drill',
        title: '平方和與變異數公式應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231AlgebraVarianceSubtypeSet(5);
        },
      },
      's2-3-1-geometric-mean-growth': {
        type: 'drill',
        title: '幾何平均數與平均成長率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231GeometricGrowthSubtypeSet(5);
        },
      },
      's2-3-1-distribution-interpretation-five-subtypes': {
        type: 'drill',
        title: '分布判讀抽樣與分組資料五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231DistributionInterpretationFiveSubtypeMixedSet(5);
        },
      },
      's2-3-1-deviation-minimization': {
        type: 'drill',
        title: '離差平方與絕對值的極小化',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231DeviationMinimizationSubtypeSet(5);
        },
      },
      's2-3-1-percentile-outlier': {
        type: 'drill',
        title: '百分位數、四分位數與離群值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231PercentileOutlierSubtypeSet(5);
        },
      },
      's2-3-1-sampling-methods': {
        type: 'drill',
        title: '抽樣方法與樣本代表性',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231SamplingMethodsSubtypeSet(5);
        },
      },
      's2-3-1-cumulative-frequency': {
        type: 'drill',
        title: '累積次數分配曲線的判定與比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231CumulativeFrequencySubtypeSet(5);
        },
      },
      's2-3-1-grouped-data-estimation': {
        type: 'drill',
        title: '分組數據的統計量估計',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS231GroupedEstimationSubtypeSet(5);
        },
      },
      's2-3-2-correlation-five-subtypes': {
        type: 'drill',
        title: '相關係數與散布圖判讀五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS232CorrelationFiveSubtypeMixedSet(5);
        },
      },
      's2-3-2-correlation-basic': {
        type: 'drill',
        title: '相關係數的基本計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS232CorrelationBasicSubtypeSet(5);
        },
      },
      's2-3-2-scatter-judgment': {
        type: 'drill',
        title: '散布圖的判讀與性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS232ScatterJudgmentSubtypeSet(5);
        },
      },
      's2-3-2-correlation-sensitivity': {
        type: 'drill',
        title: '特定點對相關係數的敏感度分析',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS232CorrelationSensitivitySubtypeSet(5);
        },
      },
      's2-3-2-linear-transform-correlation': {
        type: 'drill',
        title: '線性變換對相關係數與迴歸線的影響',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS232LinearTransformCorrelationSubtypeSet(5);
        },
      },
      's2-3-2-regression-consistency': {
        type: 'drill',
        title: '迴歸分析的綜合性質判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS232RegressionConsistencySubtypeSet(5);
        },
      },
      's2-3-2-regression-five-subtypes': {
        type: 'drill',
        title: '迴歸線最小平方法與變換五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS232RegressionFiveSubtypeMixedSet(5);
        },
      },
      's2-3-2-regression-line': {
        type: 'drill',
        title: '迴歸直線方程式與預測',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS232RegressionLineSubtypeSet(5);
        },
      },
      's2-3-2-reciprocal-slopes': {
        type: 'drill',
        title: '雙重迴歸線的斜率關係',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS232ReciprocalSlopesSubtypeSet(5);
        },
      },
      's2-3-2-mean-point': {
        type: 'drill',
        title: '利用必過平均點性質求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS232MeanPointSubtypeSet(5);
        },
      },
      's2-3-2-least-squares': {
        type: 'drill',
        title: '最小平方法定義的代數運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS232LeastSquaresSubtypeSet(5);
        },
      },
      's2-3-2-transformed-regression': {
        type: 'drill',
        title: '變數線性變換後的迴歸線預測',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS232TransformedRegressionSubtypeSet(5);
        },
      },
      's2-4-1-basic-angle-coordinate-five-subtypes': {
        type: 'drill',
        title: '三角比座標象限與極座標五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241BasicFiveSubtypeMixedSet(5);
        },
      },
      's2-4-1-coordinate-conversion': {
        type: 'drill',
        title: '極坐標與直角坐標互換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241CoordinateConversionSubtypeSet(5);
        },
      },
      's2-4-1-one-known-ratio': {
        type: 'drill',
        title: '已知廣義角三角比求其他項',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241OneKnownRatioSubtypeSet(5);
        },
      },
      's2-4-1-coterminal-quadrant': {
        type: 'drill',
        title: '同界角與象限角判別',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241CoterminalQuadrantSubtypeSet(5);
        },
      },
      's2-4-1-reduction-identities': {
        type: 'drill',
        title: '誘導公式與式子化簡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241ReductionIdentitySubtypeSet(5);
        },
      },
      's2-4-1-polar-geometry': {
        type: 'drill',
        title: '極坐標的幾何計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241PolarGeometrySubtypeSet(5);
        },
      },
      's2-4-1-computation-geometry-five-subtypes': {
        type: 'drill',
        title: '三角函數計算與幾何應用五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241ComputationGeometryFiveSubtypeMixedSet(5);
        },
      },
      's2-4-1-trig-interpolation': {
        type: 'drill',
        title: '三角函數表與線性內插法',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241TrigInterpolationSubtypeSet(5);
        },
      },
      's2-4-1-trig-quadratic-roots': {
        type: 'drill',
        title: '三角比與二次方程式的根',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241TrigQuadraticRootsSubtypeSet(5);
        },
      },
      's2-4-1-representing-segments': {
        type: 'drill',
        title: '幾何圖形中的線段長度代數表示',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241RepresentingSegmentsSubtypeSet(5);
        },
      },
      's2-4-1-angle-bisector-area': {
        type: 'drill',
        title: '角平分線長度與面積性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241AngleBisectorAreaSubtypeSet(5);
        },
      },
      's2-4-1-trig-extrema-identities': {
        type: 'drill',
        title: '三角恆等式的極值與判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241TrigExtremaIdentitySubtypeSet(5);
        },
      },
      's2-4-1-triangle-identity-five-subtypes': {
        type: 'drill',
        title: '三角形比例比較與恆等式五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241TriangleIdentityFiveSubtypeMixedSet(5);
        },
      },
      's2-4-1-side-altitude-sine-ratio': {
        type: 'drill',
        title: '邊長高與三角比的比例轉化',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241SideAltitudeSineRatioSubtypeSet(5);
        },
      },
      's2-4-1-same-angle-comparison': {
        type: 'drill',
        title: '同一角度不同三角比的大小比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241SameAngleComparisonSubtypeSet(5);
        },
      },
      's2-4-1-square-sum-identities': {
        type: 'drill',
        title: '平方關係與餘角性質的級數求和',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241SquareSumSubtypeSet(5);
        },
      },
      's2-4-1-terminal-line-definition': {
        type: 'drill',
        title: '終邊落在特定直線上的廣義角定義',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241TerminalLineDefinitionSubtypeSet(5);
        },
      },
      's2-4-1-triangle-angle-identities': {
        type: 'drill',
        title: '三角形內角特有的三角恆等變換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS241TriangleAngleIdentitySubtypeSet(5);
        },
      },
      's2-4-2-sine-law-five-subtypes': {
        type: 'drill',
        title: '正弦定理與邊角比例五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242SineLawFiveSubtypeMixedSet(5);
        },
      },
      's2-4-2-sine-side-ratio': {
        type: 'drill',
        title: '邊角比例轉換與代數運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242SineSideRatioSubtypeSet(5);
        },
      },
      's2-4-2-asa-aas': {
        type: 'drill',
        title: '已知兩角一邊求其他元素',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242AsaAasSubtypeSet(5);
        },
      },
      's2-4-2-circumradius': {
        type: 'drill',
        title: '外接圓半徑的推導與計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242CircumradiusSubtypeSet(5);
        },
      },
      's2-4-2-ssa-ambiguous': {
        type: 'drill',
        title: 'SSA 條件下的解數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242SsaAmbiguousSubtypeSet(5);
        },
      },
      's2-4-2-altitude-sine-ratio': {
        type: 'drill',
        title: '結合高與邊角比例的綜合題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242AltitudeSineRatioSubtypeSet(5);
        },
      },
      's2-4-2-cosine-law-five-subtypes': {
        type: 'drill',
        title: '餘弦定理與三角形判定五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242CosineLawFiveSubtypeMixedSet(5);
        },
      },
      's2-4-2-cosine-sas': {
        type: 'drill',
        title: '已知兩邊一夾角求第三邊',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242CosineSasSubtypeSet(5);
        },
      },
      's2-4-2-cosine-sss-angle': {
        type: 'drill',
        title: '已知三邊長求內角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242CosineSssAngleSubtypeSet(5);
        },
      },
      's2-4-2-algebraic-side-relation': {
        type: 'drill',
        title: '邊角關係的代數恆等式與比例轉換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242AlgebraicSideRelationSubtypeSet(5);
        },
      },
      's2-4-2-triangle-shape': {
        type: 'drill',
        title: '三角形的形狀判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242TriangleShapeSubtypeSet(5);
        },
      },
      's2-4-2-cyclic-quadrilateral-diagonal': {
        type: 'drill',
        title: '圓內接四邊形的邊長與對角線',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242CyclicQuadrilateralDiagonalSubtypeSet(5);
        },
      },
      's2-4-2-area-radius-five-subtypes': {
        type: 'drill',
        title: '面積公式與內外接圓五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242AreaRadiusFiveSubtypeMixedSet(5);
        },
      },
      's2-4-2-two-side-angle-area': {
        type: 'drill',
        title: '兩邊一夾角面積公式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242TwoSideAngleAreaSubtypeSet(5);
        },
      },
      's2-4-2-heron-area': {
        type: 'drill',
        title: '海龍公式求面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242HeronAreaSubtypeSet(5);
        },
      },
      's2-4-2-inradius-circumradius': {
        type: 'drill',
        title: '面積與外接圓內切圓半徑的關係',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242InradiusCircumradiusSubtypeSet(5);
        },
      },
      's2-4-2-cyclic-quadrilateral-area': {
        type: 'drill',
        title: '圓內接四邊形的面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242CyclicQuadrilateralAreaSubtypeSet(5);
        },
      },
      's2-4-2-diagonal-area-extrema': {
        type: 'drill',
        title: '對角線與夾角及面積最大值的應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242DiagonalAreaExtremaSubtypeSet(5);
        },
      },
      's2-4-2-special-segment-five-subtypes': {
        type: 'drill',
        title: '特殊線段與四邊形幾何五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242SpecialSegmentFiveSubtypeMixedSet(5);
        },
      },
      's2-4-2-median-length': {
        type: 'drill',
        title: '中線定理與中線長度計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242MedianLengthSubtypeSet(5);
        },
      },
      's2-4-2-angle-bisector-length': {
        type: 'drill',
        title: '角平分線長度判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242AngleBisectorLengthSubtypeSet(5);
        },
      },
      's2-4-2-height-projection': {
        type: 'drill',
        title: '高的比例與投影關係',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242HeightProjectionSubtypeSet(5);
        },
      },
      's2-4-2-parallelogram-diagonal': {
        type: 'drill',
        title: '平行四邊形定理與複合四邊形幾何',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242ParallelogramDiagonalSubtypeSet(5);
        },
      },
      's2-4-2-trapezoid-area': {
        type: 'drill',
        title: '梯形與多邊形面積應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS242TrapezoidAreaSubtypeSet(5);
        },
      },
      's2-4-3-plane-survey-five-subtypes': {
        type: 'drill',
        title: '平面測量與跨越障礙五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243PlaneSurveyFiveSubtypeMixedSet(5);
        },
      },
      's2-4-3-asa-cross-distance': {
        type: 'drill',
        title: '平面測量：跨越障礙求距離（ASA/AAS）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243AsaCrossDistanceSubtypeSet(5);
        },
      },
      's2-4-3-sas-cross-distance': {
        type: 'drill',
        title: '平面測量：跨越障礙物求距離（SAS）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243SasCrossDistanceSubtypeSet(5);
        },
      },
      's2-4-3-slope-double-observation': {
        type: 'drill',
        title: '平面測量：坡度上的二次觀測',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243SlopeDoubleObservationSubtypeSet(5);
        },
      },
      's2-4-3-segmented-height': {
        type: 'drill',
        title: '分段高度與疊加測量題型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243SegmentedHeightSubtypeSet(5);
        },
      },
      's2-4-3-arbitrary-division-line': {
        type: 'drill',
        title: '任意分點的距離與分線',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243ArbitraryDivisionLineSubtypeSet(5);
        },
      },
      's2-4-3-elevation-spatial-five-subtypes': {
        type: 'drill',
        title: '立體仰俯角與空間測量五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243ElevationSpatialFiveSubtypeMixedSet(5);
        },
      },
      's2-4-3-common-elevation-circumradius': {
        type: 'drill',
        title: '立體測量：共仰角求高度',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243CommonElevationCircumradiusSubtypeSet(5);
        },
      },
      's2-4-3-depression-two-targets': {
        type: 'drill',
        title: '高處對地面多目標觀測',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243DepressionTwoTargetsSubtypeSet(5);
        },
      },
      's2-4-3-same-elevation-circumcenter': {
        type: 'drill',
        title: '共仰角觀測與外心性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243SameElevationCircumcenterSubtypeSet(5);
        },
      },
      's2-4-3-offset-collinear-observation': {
        type: 'drill',
        title: '非通過底部的共線三點觀測',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243OffsetCollinearObservationSubtypeSet(5);
        },
      },
      's2-4-3-spatial-motion-tracking': {
        type: 'drill',
        title: '空間動態目標與方位追蹤',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243SpatialMotionTrackingSubtypeSet(5);
        },
      },
      's2-4-3-navigation-motion-five-subtypes': {
        type: 'drill',
        title: '航行方位與動態追蹤五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243NavigationMotionFiveSubtypeMixedSet(5);
        },
      },
      's2-4-3-bearing-navigation': {
        type: 'drill',
        title: '航行與追蹤：方位轉換與目標間距',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243BearingNavigationSubtypeSet(5);
        },
      },
      's2-4-3-perpendicular-bearing': {
        type: 'drill',
        title: '方位角與垂直方向觀測',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243PerpendicularBearingSubtypeSet(5);
        },
      },
      's2-4-3-typhoon-tracking': {
        type: 'drill',
        title: '颱風侵襲路徑分析',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243TyphoonTrackingSubtypeSet(5);
        },
      },
      's2-4-3-uniform-motion-angle-change': {
        type: 'drill',
        title: '等速運動與角度變化率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243UniformMotionAngleChangeSubtypeSet(5);
        },
      },
      's2-4-3-dynamic-shortest-distance': {
        type: 'drill',
        title: '動態運動：兩移動物體間的最短距離',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243DynamicShortestDistanceSubtypeSet(5);
        },
      },
      's2-4-3-special-measurement-five-subtypes': {
        type: 'drill',
        title: '特殊線段與測量模型五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243SpecialMeasurementFiveSubtypeMixedSet(5);
        },
      },
      's2-4-3-angle-bisector-measurement': {
        type: 'drill',
        title: '角平分線測量題型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243AngleBisectorMeasurementSubtypeSet(5);
        },
      },
      's2-4-3-median-centroid-measurement': {
        type: 'drill',
        title: '中線定理與重心測量題型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243MedianCentroidMeasurementSubtypeSet(5);
        },
      },
      's2-4-3-displacement-segment': {
        type: 'drill',
        title: '動態運動產生的位移分線',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243DisplacementSegmentSubtypeSet(5);
        },
      },
      's2-4-3-height-projection-stack': {
        type: 'drill',
        title: '分段高度與投影疊加',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243HeightProjectionStackSubtypeSet(5);
        },
      },
      's2-4-3-bearing-target-distance': {
        type: 'drill',
        title: '方位與目標距離綜合測量',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS243BearingTargetDistanceSubtypeSet(5);
        },
      },
  };

  const bundleFingerprint = "s2-bundle-v20260619-v1";
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== "object") return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
