(() => {
  const store = window.formulaPracticeStore;
  if (!store || typeof store.registerConfigs !== "function") return;

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

  function buildS223MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers, answers };
  }

  function s242Pick(list) {
    return list[randInt(0, list.length - 1)];
  }

  function s311PiFrac(num, den = 1) {
    const frac = simplifyFraction(num, den);
    const n = frac.num;
    const d = frac.den;
    if (n === 0) return '0';
    const sign = n < 0 ? '-' : '';
    const absN = Math.abs(n);
    const body = absN === 1 ? '\\pi' : `${absN}\\pi`;
    return d === 1 ? `${sign}${body}` : `${sign}\\frac{${body}}{${d}}`;
  }

  function s311PlainFrac(num, den = 1) {
    return formatFraction(num, den);
  }

  function buildS311DegreeRadianConversionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const degreeCases = [15, 18, 24, 30, 36, 45, 60, 72, 90, 120, 135, 150, 210, 225, 270, 300, 330];
    const radCases = [
      [1, 6],
      [1, 4],
      [1, 3],
      [1, 2],
      [2, 3],
      [3, 4],
      [5, 6],
      [7, 6],
      [5, 4],
      [4, 3],
      [3, 2],
      [17, 12],
    ];
    for (let i = 0; i < count; i += 1) {
      if (i % 3 === 0) {
        const degree = s242Pick(degreeCases);
        const rad = s311PiFrac(degree, 180);
        questions.push(`將 \\(${degree}^\\circ\\) 化為弧度。`);
        answers.push(
          `簡答：\\(${rad}\\)。過程：度數化弧度要乘上 \\(\\frac{\\pi}{180}\\)，所以 \\(${degree}^\\circ=${degree}\\cdot\\frac{\\pi}{180}=${rad}\\)。`
        );
        continue;
      }
      if (i % 3 === 1) {
        const [num, den] = s242Pick(radCases);
        const degree = (num * 180) / den;
        questions.push(`將 \\(${s311PiFrac(num, den)}\\) 弧度化為度。`);
        answers.push(
          `簡答：\\(${degree}^\\circ\\)。過程：弧度化度數要乘上 \\(\\frac{180}{\\pi}\\)，所以 \\(${s311PiFrac(num, den)}\\cdot\\frac{180}{\\pi}=${degree}^\\circ\\)。`
        );
        continue;
      }
      const degree = s242Pick([12, 18, 24, 36, 48, 72]);
      const minute = s242Pick([10, 20, 24, 30, 40, 45]);
      const totalMinutes = degree * 60 + minute;
      const rad = s311PiFrac(totalMinutes, 10800);
      questions.push(`將 \\(${degree}^\\circ${minute}'\\) 化為弧度。`);
      answers.push(
        `簡答：\\(${rad}\\)。過程：先把角度化成度，\\(${degree}^\\circ${minute}'=${degree}+\\frac{${minute}}{60}=\\frac{${totalMinutes}}{60}^\\circ\\)。再乘 \\(\\frac{\\pi}{180}\\)，得 \\(${rad}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS311SectorParameterSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const r = s242Pick([3, 4, 5, 6, 8, 10, 12]);
        const theta = s242Pick([
          [1, 3],
          [1, 2],
          [2, 3],
          [3, 4],
          [5, 6],
        ]);
        const arc = s311PiFrac(r * theta[0], theta[1]);
        const area = s311PiFrac(r * r * theta[0], 2 * theta[1]);
        questions.push(`已知扇形半徑為 ${r}，圓心角為 \\(${s311PiFrac(theta[0], theta[1])}\\)，求弧長與面積。`);
        answers.push(
          `簡答：弧長 \\(${arc}\\)，面積 \\(${area}\\)。過程：弧度制下 \\(s=r\\theta\\)，\\(A=\\frac12r^2\\theta\\)。代入 \\(r=${r}\\)、\\(\\theta=${s311PiFrac(theta[0], theta[1])}\\) 即得。`
        );
        continue;
      }
      if (mode === 1) {
        const r = s242Pick([4, 5, 6, 8, 10, 12]);
        const theta = s242Pick([
          [1, 4],
          [1, 3],
          [2, 3],
          [3, 5],
        ]);
        const arc = s311PiFrac(r * theta[0], theta[1]);
        questions.push(`已知扇形半徑為 ${r}，弧長為 \\(${arc}\\)，求圓心角弧度。`);
        answers.push(
          `簡答：\\(${s311PiFrac(theta[0], theta[1])}\\)。過程：由 \\(s=r\\theta\\)，可得 \\(\\theta=\\frac{s}{r}=\\frac{${arc}}{${r}}=${s311PiFrac(theta[0], theta[1])}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const r = s242Pick([3, 4, 5, 6, 8]);
        const theta = s242Pick([
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 5],
        ]);
        const area = s311PiFrac(r * r * theta[0], 2 * theta[1]);
        questions.push(`扇形半徑為 ${r}，圓心角為 \\(${s311PiFrac(theta[0], theta[1])}\\)，求扇形面積。`);
        answers.push(
          `簡答：\\(${area}\\)。過程：扇形面積公式為 \\(A=\\frac12r^2\\theta\\)，代入可得 \\(A=\\frac12\\cdot${r}^2\\cdot${s311PiFrac(theta[0], theta[1])}=${area}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const r = s242Pick([3, 4, 5, 6, 9]);
        const theta = s242Pick([
          [1, 3],
          [1, 2],
          [2, 3],
        ]);
        const arc = s311PiFrac(r * theta[0], theta[1]);
        const area = s311PiFrac(r * r * theta[0], 2 * theta[1]);
        questions.push(
          `一扇形的面積數值恰為其弧長數值的 ${formatFraction(r, 2)} 倍。若弧長為 \\(${arc}\\)，求半徑與圓心角。`
        );
        answers.push(
          `簡答：半徑 ${r}，圓心角 \\(${s311PiFrac(theta[0], theta[1])}\\)。過程：因為 \\(A=\\frac12rs\\)，所以 \\(\\frac{A}{s}=\\frac r2\\)。由題目可得 \\(r=${r}\\)，再用 \\(\\theta=s/r\\)，得 \\(\\theta=${s311PiFrac(theta[0], theta[1])}\\)。本題面積為 \\(${area}\\)，可驗算。`
        );
        continue;
      }
      const r = s242Pick([4, 6, 8, 10]);
      const arc = s311PiFrac(r, 1);
      const theta = '\\pi';
      const area = s311PiFrac(r * r, 2);
      questions.push(`半徑為 ${r} 的圓中，一弦把圓周分成兩弧，其中一弧長為 \\(${arc}\\)，求對應扇形面積。`);
      answers.push(
        `簡答：\\(${area}\\)。過程：由 \\(s=r\\theta\\)，\\(\\theta=\\frac{${arc}}{${r}}=${theta}\\)。扇形面積 \\(A=\\frac12r^2\\theta=\\frac12\\cdot${r}^2\\cdot\\pi=${area}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS311ClockSectorSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const minuteCases = [10, 15, 20, 25, 30, 35, 40, 45];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const len = s242Pick([5, 6, 8, 10, 12]);
        const mins = s242Pick(minuteCases);
        const theta = s311PiFrac(mins, 30);
        const area = s311PiFrac(len * len * mins, 60);
        questions.push(`分針長 ${len} 公分，從某時刻起轉動 ${mins} 分鐘，求分針掃過的扇形面積。`);
        answers.push(
          `簡答：\\(${area}\\) 平方公分。過程：分針 ${mins} 分鐘轉過 \\(\\theta=${s311PiFrac(mins, 30)}\\)。面積 \\(A=\\frac12\\cdot${len}^2\\cdot${theta}=${area}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const len = s242Pick([4, 5, 6, 8]);
        const hours = s242Pick([2, 3, 4, 5]);
        const theta = s311PiFrac(hours, 6);
        const area = s311PiFrac(len * len * hours, 12);
        questions.push(`時針長 ${len} 公分，從中午 12:00 到下午 ${hours}:00，求時針掃過的扇形面積。`);
        answers.push(
          `簡答：\\(${area}\\) 平方公分。過程：時針每小時轉 \\(\\frac{\\pi}{6}\\)，${hours} 小時轉 \\(${theta}\\)。面積為 \\(\\frac12\\cdot${len}^2\\cdot${theta}=${area}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const len = s242Pick([5, 8, 10, 12]);
        const mins = s242Pick([10, 20, 30, 40]);
        const arc = s311PiFrac(len * mins, 30);
        questions.push(`分針長 ${len} 公分，${mins} 分鐘內針尖移動了多少公分？`);
        answers.push(
          `簡答：\\(${arc}\\) 公分。過程：針尖走過的是弧長，\\(s=r\\theta\\)。${mins} 分鐘對應 \\(\\theta=${s311PiFrac(mins, 30)}\\)，所以 \\(s=${len}\\cdot${s311PiFrac(mins, 30)}=${arc}\\)。`
        );
        continue;
      }
      const m = s242Pick([10, 20, 30, 40, 50]);
      const hourAngle = s311PiFrac(m, 360);
      const minuteAngle = s311PiFrac(m, 30);
      questions.push(`鐘面上從整點後經過 ${m} 分鐘，時針與分針各自轉過多少弧度？`);
      answers.push(
        `簡答：時針 \\(${hourAngle}\\)，分針 \\(${minuteAngle}\\)。過程：時針 12 小時轉 \\(2\\pi\\)，每分鐘轉 \\(\\frac{\\pi}{360}\\)；分針 60 分鐘轉 \\(2\\pi\\)，每分鐘轉 \\(\\frac{\\pi}{30}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS311RollingMotionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const r = s242Pick([10, 20, 25, 50]);
        const distance = r * s242Pick([2, 3, 4, 5]);
        const theta = s311PlainFrac(distance, r);
        questions.push(`半徑為 ${r} 公分的輪子在地上滾動 ${distance} 公分，求輪子轉過的角度（弧度）。`);
        answers.push(
          `簡答：\\(${theta}\\) 弧度。過程：滾動時接觸點不打滑，位移等於弧長，所以 \\(s=r\\theta\\)。代入 \\(${distance}=${r}\\theta\\)，得 \\(\\theta=${theta}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const speed = s242Pick([36, 54, 72, 90]);
        const seconds = s242Pick([5, 10, 20]);
        const angle = s242Pick([30, 45, 60, 90]);
        const distance = formatFraction(speed * 1000 * seconds, 3600);
        const radius =
          angle === 30
            ? s311PlainFrac(speed * 1000 * seconds, 3600) + '\\cdot\\frac{6}{\\pi}'
            : `\\frac{${distance}}{${s311PiFrac(angle, 180)}}`;
        questions.push(
          `時速 ${speed} 公里的車，在圓形道路上行駛 ${seconds} 秒後轉了 \\(${angle}^\\circ\\)，求公路半徑。`
        );
        answers.push(
          `簡答：\\(${radius}\\) 公尺。過程：先把速度乘時間得到弧長 \\(s=${distance}\\) 公尺，再把 \\(${angle}^\\circ\\) 化為 \\(${s311PiFrac(angle, 180)}\\)。由 \\(s=r\\theta\\)，得 \\(r=\\frac{s}{\\theta}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const r = s242Pick([2, 3, 4, 5]);
        const theta = s242Pick([
          [2, 1],
          [3, 1],
          [4, 1],
          [5, 1],
        ]);
        const arc = r * theta[0];
        questions.push(`半徑為 ${r} 的圓周上，一點沿逆時針方向移動 ${arc} 單位，求轉過的弧度。`);
        answers.push(
          `簡答：\\(${theta[0]}\\) 弧度。過程：弧長公式 \\(s=r\\theta\\)，所以 \\(\\theta=\\frac{s}{r}=\\frac{${arc}}{${r}}=${theta[0]}\\)。`
        );
        continue;
      }
      const r1 = s242Pick([2, 3, 4]);
      const r2 = r1 + s242Pick([2, 4, 6]);
      const axle = r1 + r2 + s242Pick([2, 4, 6]);
      const belt = s311PiFrac(r1 + r2, 1) + `+2\\sqrt{${axle * axle - (r2 - r1) * (r2 - r1)}}`;
      questions.push(
        `兩輪半徑分別為 ${r1} 與 ${r2}，輪心距為 ${axle}，若外公切線皮帶繞過兩輪且兩輪不相交，求皮帶長的表示式。`
      );
      answers.push(
        `簡答：\\(${belt}\\)。過程：皮帶長由兩段直線外公切線與兩段圓弧組成。直線部分每段長為 \\(\\sqrt{d^2-(R-r)^2}\\)，兩段共兩倍；弧線總角度合計為 \\(2\\pi\\)，所以弧線總長為 \\(\\pi(R+r)\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS311OverlapAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = s242Pick([4, 6, 8, 10, 12]);
        const ans = `${a * a}\\left(\\frac{\\pi}{2}-1\\right)`;
        questions.push(
          `邊長為 ${a} 的正方形中，以相鄰兩個頂點為圓心、邊長為半徑畫兩段圓弧，求兩弧交疊的眼形區域面積。`
        );
        answers.push(
          `簡答：\\(${ans}\\)。過程：交疊區域由兩個 \\(90^\\circ\\) 扇形扣掉正方形組成，面積為 \\(2\\cdot\\frac14\\pi ${a}^2-${a}^2=${ans}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const r = s242Pick([3, 4, 5, 6, 8]);
        const coeff = r * r;
        questions.push(`兩個半徑皆為 ${r} 的圓，兩圓心距也為 ${r}。求兩圓交集的面積。`);
        answers.push(
          `簡答：\\(${coeff}\\left(\\frac{2\\pi}{3}-\\frac{\\sqrt3}{2}\\right)\\)。過程：交集由兩個 \\(120^\\circ\\) 扇形扣掉兩個等邊三角形組成，所以面積為 \\(2\\cdot\\frac12\\cdot${r}^2\\cdot\\frac{2\\pi}{3}-2\\cdot\\frac{\\sqrt3}{4}\\cdot${r}^2\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const r = s242Pick([2, 3, 4, 5, 6]);
        const theta = s242Pick([
          [1, 3],
          [1, 2],
          [2, 3],
        ]);
        const ring = s242Pick([1, 2, 3]);
        const big = r + ring;
        const ans = s311PiFrac((big * big - r * r) * theta[0], 2 * theta[1]);
        questions.push(
          `兩個同心扇形的圓心角都是 \\(${s311PiFrac(theta[0], theta[1])}\\)，半徑分別為 ${r} 與 ${big}，求夾在兩弧之間的扇環面積。`
        );
        answers.push(
          `簡答：\\(${ans}\\)。過程：扇環面積為兩個扇形面積相減，\\(A=\\frac12(${big}^2-${r}^2)\\cdot${s311PiFrac(theta[0], theta[1])}=${ans}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const side = s242Pick([6, 8, 10, 12]);
        const r = side / 2;
        const ans = `${side * side}-${r * r}\\pi`;
        questions.push(`邊長為 ${side} 的正方形中，以正方形中心為圓心、半邊長為半徑畫圓，求正方形內但圓外的面積。`);
        answers.push(
          `簡答：\\(${ans}\\)。過程：所求面積等於正方形面積扣掉圓面積，為 \\(${side}^2-\\pi\\cdot${r}^2=${ans}\\)。`
        );
        continue;
      }
      const l = s242Pick([6, 8, 10, 12]);
      const baseR = s242Pick([2, 3, 4]);
      const theta = s311PiFrac(2 * baseR, l);
      questions.push(`圓錐的展開圖是一個半徑為 ${l} 的扇形，圓錐底面半徑為 ${baseR}，求此扇形的圓心角。`);
      answers.push(
        `簡答：\\(${theta}\\) 弧度。過程：展開扇形的弧長等於底面圓周 \\(2\\pi\\cdot${baseR}\\)，且弧長 \\(s=${l}\\theta\\)，所以 \\(\\theta=\\frac{2\\pi\\cdot${baseR}}{${l}}=${theta}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS311SectorExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const p = s242Pick([24, 30, 36, 40, 48]);
        const r = p / 4;
        const area = r * r;
        questions.push(`已知一扇形周長為 ${p}，當半徑為何時面積最大？最大面積為何？`);
        answers.push(
          `簡答：半徑 \\(${r}\\)，最大面積 \\(${area}\\)。過程：周長 \\(p=2r+s\\)，面積 \\(A=\\frac12rs=\\frac12r(p-2r)\\)，這是開口向下的二次式，頂點在 \\(r=\\frac p4=${r}\\)，最大面積為 \\(${area}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const area = s242Pick([36, 64, 100, 144]);
        const r = Math.sqrt(area);
        questions.push(`在所有面積為 ${area} 的扇形中，求周長最小時的半徑。`);
        answers.push(
          `簡答：\\(${r}\\)。過程：\\(A=\\frac12rs\\)，周長 \\(P=2r+s=2r+\\frac{2A}{r}\\)。由 AM-GM 或配方，最小發生在 \\(2r=\\frac{2A}{r}\\)，故 \\(r^2=A\\)，得 \\(r=${r}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const p = s242Pick([12, 20, 28, 32]);
        const r = p / 4;
        questions.push(`周長固定為 ${p} 的扇形，面積最大時弧長與半徑之比為何？`);
        answers.push(
          `簡答：\\(s:r=2:1\\)。過程：周長 \\(p=2r+s\\)，面積 \\(A=\\frac12rs\\)。乘積在 \\(2r=s\\) 時最大，所以 \\(s:r=2:1\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const k = s242Pick([18, 32, 50, 72]);
        questions.push(`若扇形面積固定為 \\(k\\)，求周長最小時半徑長（以 \\(k\\) 表示）。`);
        answers.push(
          `簡答：\\(r=\\sqrt{k}\\)。過程：\\(k=\\frac12rs\\)，所以 \\(s=\\frac{2k}{r}\\)。周長 \\(P=2r+\\frac{2k}{r}\\)，由 AM-GM，最小發生在 \\(2r=\\frac{2k}{r}\\)，故 \\(r=\\sqrt{k}\\)。`
        );
        continue;
      }
      const p = s242Pick([12, 16, 20, 24]);
      const r = p / 4;
      questions.push(`周長為 ${p} 的所有扇形中，面積最大時圓心角為多少弧度？`);
      answers.push(
        `簡答：2 弧度。過程：面積最大時 \\(s=2r\\)，而 \\(s=r\\theta\\)，因此 \\(\\theta=2\\) 弧度。此時半徑為 \\(${r}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS311RightTriangleReciprocalSet(count) {
    const triples = [
      { a: 3, b: 4, c: 5 },
      { a: 5, b: 12, c: 13 },
      { a: 8, b: 15, c: 17 },
      { a: 7, b: 24, c: 25 },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const t = s242Pick(triples);
      const mode = i % 4;
      if (mode === 0) {
        questions.push(
          `直角 \\(\\triangle ABC\\) 中，\\(\\angle C=90^\\circ\\)，對 \\(A\\) 的對邊 \\(a=${t.a}\\)、鄰邊 \\(b=${t.b}\\)、斜邊 \\(c=${t.c}\\)，求 \\(\\sec A\\)、\\(\\csc A\\)、\\(\\cot A\\)。`
        );
        answers.push(
          `簡答：\\(\\sec A=${s311PlainFrac(t.c, t.b)},\\ \\csc A=${s311PlainFrac(t.c, t.a)},\\ \\cot A=${s311PlainFrac(t.b, t.a)}\\)。過程：\\(\\sec A=\\frac1{\\cos A}=\\frac cb\\)，\\(\\csc A=\\frac1{\\sin A}=\\frac ca\\)，\\(\\cot A=\\frac1{\\tan A}=\\frac ba\\)。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`已知 \\(\\sec A=${s311PlainFrac(t.c, t.b)}\\)，且鄰邊長為 ${t.b}，求斜邊長。`);
        answers.push(
          `簡答：${t.c}。過程：\\(\\sec A=\\frac{斜邊}{鄰邊}\\)，所以斜邊 \\(=${t.b}\\cdot ${s311PlainFrac(t.c, t.b)}=${t.c}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`直角三角形中，若 \\(\\tan A=${s311PlainFrac(t.a, t.b)}\\)，求 \\(\\csc A+\\cot A\\)。`);
        answers.push(
          `簡答：\\(${s311PlainFrac(t.c + t.b, t.a)}\\)。過程：可取對邊、鄰邊、斜邊為 ${t.a},${t.b},${t.c}，所以 \\(\\csc A=\\frac{${t.c}}{${t.a}}\\)，\\(\\cot A=\\frac{${t.b}}{${t.a}}\\)，相加為 \\(${s311PlainFrac(t.c + t.b, t.a)}\\)。`
        );
        continue;
      }
      questions.push(`若 \\(\\cos A=${s311PlainFrac(t.b, t.c)}\\)，求 \\(\\sec A+\\tan A\\)。`);
      answers.push(
        `簡答：\\(${s311PlainFrac(t.c + t.a, t.b)}\\)。過程：\\(\\cos A=\\frac{${t.b}}{${t.c}}\\)，可得鄰邊 ${t.b}、斜邊 ${t.c}、對邊 ${t.a}。因此 \\(\\sec A=\\frac{${t.c}}{${t.b}}\\)，\\(\\tan A=\\frac{${t.a}}{${t.b}}\\)，相加為 \\(${s311PlainFrac(t.c + t.a, t.b)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS311ReciprocalFromOneRatioSet(count) {
    const triples = [
      { s: [3, 5], c: [4, 5], t: [3, 4] },
      { s: [5, 13], c: [12, 13], t: [5, 12] },
      { s: [8, 17], c: [15, 17], t: [8, 15] },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(triples);
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`若 \\(\\sin\\theta=${s311PlainFrac(item.s[0], item.s[1])}\\)，求 \\(\\csc\\theta\\)。`);
        answers.push(
          `簡答：\\(${s311PlainFrac(item.s[1], item.s[0])}\\)。過程：\\(\\csc\\theta=\\frac1{\\sin\\theta}\\)，所以直接取倒數。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(
          `若 \\(\\cos\\theta=${s311PlainFrac(item.c[0], item.c[1])}\\)，求 \\(\\sec\\theta+\\tan\\theta\\)。`
        );
        answers.push(
          `簡答：\\(${s311PlainFrac(item.c[1] + item.s[0], item.c[0])}\\)。過程：由直角三角形可取鄰邊 ${item.c[0]}、斜邊 ${item.c[1]}、對邊 ${item.s[0]}，所以 \\(\\sec\\theta=\\frac{${item.c[1]}}{${item.c[0]}}\\)，\\(\\tan\\theta=\\frac{${item.s[0]}}{${item.c[0]}}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(
          `若 \\(\\tan\\theta=${s311PlainFrac(item.t[0], item.t[1])}\\)，求 \\(\\cot\\theta-\\csc^2\\theta\\)。`
        );
        const val = simplifyFraction(item.t[1], item.t[0]);
        const csc2 = simplifyFraction(item.s[1] * item.s[1], item.s[0] * item.s[0]);
        const ans = simplifyFraction(val.num * csc2.den - csc2.num * val.den, val.den * csc2.den);
        answers.push(
          `簡答：\\(${fractionToLatex(ans)}\\)。過程：\\(\\cot\\theta=${s311PlainFrac(item.t[1], item.t[0])}\\)，\\(\\csc^2\\theta=\\frac{${item.s[1] * item.s[1]}}{${item.s[0] * item.s[0]}}\\)，相減並約分得 \\(${fractionToLatex(ans)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`若 \\(\\cos\\theta=k\\)，試以 \\(k\\) 表示 \\(\\sec\\theta\\)。`);
        answers.push(
          `簡答：\\(\\sec\\theta=\\frac1k\\)。過程：\\(\\sec\\theta\\) 是 \\(\\cos\\theta\\) 的倒數，所以 \\(\\sec\\theta=\\frac{1}{\\cos\\theta}=\\frac1k\\)。`
        );
        continue;
      }
      questions.push(
        `已知 \\(\\tan\\theta=${s311PlainFrac(item.t[0], item.t[1])}\\)，求 \\(\\frac{\\sin\\theta+\\cos\\theta}{\\sec\\theta+\\csc\\theta}\\)。`
      );
      const numerator = item.s[0] + item.c[0];
      const denominator = item.c[1] / item.c[0] + item.s[1] / item.s[0];
      const ans = simplifyFraction(numerator * item.s[0] * item.c[0], item.s[1] * (item.s[0] + item.c[0]));
      answers.push(
        `簡答：\\(${fractionToLatex(ans)}\\)。過程：取對邊、鄰邊、斜邊為 ${item.t[0]},${item.t[1]},${item.s[1]}，把 \\(\\sin,\\cos,\\sec,\\csc\\) 全部改成分數後化簡，可得 \\(${fractionToLatex(ans)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS311ReciprocalIdentitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const angles = [10, 20, 30, 40, 50, 60, 70];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = s242Pick(angles);
        questions.push(`計算 \\(\\frac{1}{1+\\sin^2 ${a}^\\circ}+\\frac{1}{1+\\csc^2 ${a}^\\circ}\\) 之值。`);
        answers.push(
          `簡答：1。過程：設 \\(x=\\sin^2 ${a}^\\circ\\)，則 \\(\\csc^2 ${a}^\\circ=\\frac1x\\)。原式為 \\(\\frac1{1+x}+\\frac1{1+1/x}=\\frac1{1+x}+\\frac{x}{1+x}=1\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const a = s242Pick(angles);
        questions.push(`計算 \\(\\frac{1}{\\cos^2 ${a}^\\circ}-\\frac{1}{\\cot^2 ${a}^\\circ}\\) 之值。`);
        answers.push(
          `簡答：1。過程：\\(\\frac1{\\cos^2\\theta}=\\sec^2\\theta\\)，\\(\\frac1{\\cot^2\\theta}=\\tan^2\\theta\\)。由 \\(\\sec^2\\theta-\\tan^2\\theta=1\\)，得原式為 1。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`化簡 \\((\\sec\\theta+\\tan\\theta)(1-\\sin\\theta)\\)。`);
        answers.push(
          `簡答：\\(\\cos\\theta\\)。過程：\\(\\sec\\theta+\\tan\\theta=\\frac{1+\\sin\\theta}{\\cos\\theta}\\)，所以原式為 \\(\\frac{(1+\\sin\\theta)(1-\\sin\\theta)}{\\cos\\theta}=\\frac{1-\sin^2\\theta}{\\cos\\theta}=\\cos\\theta\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const k = s242Pick([2, 3, 4, 5]);
        const ans = s311PlainFrac(1, k);
        questions.push(`已知 \\(\\sec\\theta+\\tan\\theta=${k}\\)，求 \\(\\sec\\theta-\\tan\\theta\\)。`);
        answers.push(
          `簡答：\\(${ans}\\)。過程：因為 \\((\\sec\\theta+\\tan\\theta)(\\sec\\theta-\\tan\\theta)=\\sec^2\\theta-\\tan^2\\theta=1\\)，所以 \\(\\sec\\theta-\\tan\\theta=\\frac1{${k}}\\)。`
        );
        continue;
      }
      questions.push(
        `證明或化簡 \\(\\sqrt{\\sec^2\\theta+\\csc^2\\theta}\\) 可表示為 \\(\\sec\\theta\\csc\\theta\\)（假設 \\(\\theta\\) 為銳角）。`
      );
      answers.push(
        `簡答：\\(\\sqrt{\\sec^2\\theta+\\csc^2\\theta}=\\sec\\theta\\csc\\theta\\)。過程：平方根內為 \\(\\frac1{\\cos^2\\theta}+\\frac1{\\sin^2\\theta}=\\frac{\\sin^2\\theta+\cos^2\\theta}{\\sin^2\\theta\cos^2\\theta}=\\frac1{\\sin^2\\theta\cos^2\\theta}\\)。銳角時取正，得 \\(\\frac1{\\sin\\theta\cos\\theta}=\\sec\\theta\\csc\\theta\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS311ReciprocalComparisonSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = s242Pick([20, 30, 40]);
        const b = a + s242Pick([20, 30, 40]);
        const c = b + s242Pick([20, 30]);
        questions.push(`比較 \\(\\sec ${a}^\\circ,\\sec ${b}^\\circ,\\sec ${c}^\\circ\\) 的大小。`);
        answers.push(
          `簡答：\\(\\sec ${a}^\\circ<\\sec ${b}^\\circ<\\sec ${c}^\\circ\\)。過程：在 \\(0^\\circ\\) 到 \\(90^\\circ\\) 內，\\(\\cos\\theta\\) 遞減，所以倒數 \\(\\sec\\theta\\) 遞增。`
        );
        continue;
      }
      if (mode === 1) {
        const a = s242Pick([10, 20, 30]);
        const b = a + s242Pick([20, 30]);
        const c = b + s242Pick([20, 30]);
        questions.push(`比較 \\(\\csc ${a}^\\circ,\\csc ${b}^\\circ,\\csc ${c}^\\circ\\) 的大小。`);
        answers.push(
          `簡答：\\(\\csc ${a}^\\circ>\\csc ${b}^\\circ>\\csc ${c}^\\circ\\)。過程：在 \\(0^\\circ\\) 到 \\(90^\\circ\\) 內，\\(\\sin\\theta\\) 遞增，所以倒數 \\(\\csc\\theta\\) 遞減。`
        );
        continue;
      }
      if (mode === 2) {
        const a = s242Pick([20, 30, 40]);
        questions.push(`判斷 \\(\\sec ${a}^\\circ\\) 與 \\(\\csc ${a}^\\circ\\) 誰較大。`);
        const relation = a < 45 ? '\\csc' : a > 45 ? '\\sec' : '兩者相等';
        answers.push(
          `簡答：${relation === '兩者相等' ? relation : `\\(${relation} ${a}^\\circ\\) 較大`}。過程：比較 \\(\\sec\\theta=1/\\cos\\theta\\) 與 \\(\\csc\\theta=1/\\sin\\theta\\)，等同比較 \\(\\sin\\theta\\) 與 \\(\\cos\\theta\\) 的大小。`
        );
        continue;
      }
      if (mode === 3) {
        const a = s242Pick([10, 20, 30, 40]);
        questions.push(
          `令 \\(a=\\cot ${a}^\\circ\\)、\\(b=\\sec ${a}^\\circ\\)、\\(c=\\csc ${a}^\\circ\\)，比較 \\(a,b,c\\) 的大小。`
        );
        answers.push(
          `簡答：\\(c>a>b\\)。過程：因為 \\(0^\\circ<${a}^\\circ<45^\\circ\\)，所以 \\(\\sin\\theta<\\cos\\theta\\)。三者為 \\(\\cot\\theta=\\frac{\\cos\\theta}{\\sin\\theta}\\)、\\(\\sec\\theta=\\frac1{\\cos\\theta}\\)、\\(\\csc\\theta=\\frac1{\\sin\\theta}\\)，可判得 \\(\\csc\\theta>\\cot\\theta>\\sec\\theta\\)。`
        );
        continue;
      }
      questions.push(`已知 \\(0^\\circ<\\theta<45^\\circ\\)，判斷 \\(\\csc\\theta>\\sec\\theta\\) 是否恆成立。`);
      answers.push(
        `簡答：成立。過程：在 \\(0^\\circ<\\theta<45^\\circ\\) 時，\\(\\sin\\theta<\\cos\\theta\\)，取正倒數後不等號反向，故 \\(\\csc\\theta=\\frac1{\sin\theta}>\\frac1{\cos\theta}=\\sec\\theta\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS311SpecialReciprocalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const item = s242Pick([
          { q: '\\sec60^\\circ+\\csc30^\\circ+\\cot45^\\circ', ans: '5' },
          { q: '\\sec45^\\circ\\csc45^\\circ+\\cot45^\\circ', ans: '3' },
          { q: '\\sec30^\\circ\\sin60^\\circ+\\csc30^\\circ', ans: '3' },
        ]);
        questions.push(`求 \\(${item.q}\\)。`);
        answers.push(`簡答：${item.ans}。過程：將特殊角三角比代入後化簡，可得 ${item.ans}。`);
        continue;
        questions.push(`求 \\(\\sec60^\\circ+\\csc30^\\circ+\\cot45^\\circ\\)。`);
        answers.push(
          `簡答：5。過程：\\(\\sec60^\\circ=2\\)，\\(\\csc30^\\circ=2\\)，\\(\\cot45^\\circ=1\\)，所以總和為 5。`
        );
        continue;
      }
      if (mode === 1) {
        const item = s242Pick([
          { q: '\\sec^2 45^\\circ\\cdot\\cot30^\\circ\\cdot\\sin60^\\circ', ans: '3' },
          { q: '\\csc^2 45^\\circ\\cdot\\tan30^\\circ\\cdot\\cos30^\\circ', ans: '1' },
          { q: '\\sec^2 60^\\circ\\cdot\\sin30^\\circ', ans: '2' },
        ]);
        questions.push(`計算 \\(${item.q}\\)。`);
        answers.push(
          `簡答：${item.ans}。過程：代入 \\(30^\\circ,45^\\circ,60^\\circ\\) 的特殊角值，乘積化簡得 ${item.ans}。`
        );
        continue;
        questions.push(`計算 \\(\\sec^2 45^\\circ\\cdot\\cot30^\\circ\\cdot\\sin60^\\circ\\)。`);
        answers.push(
          `簡答：3。過程：\\(\\sec45^\\circ=\\sqrt2\\)，故 \\(\\sec^2 45^\\circ=2\\)；\\(\\cot30^\\circ=\\sqrt3\\)，\\(\\sin60^\\circ=\\frac{\\sqrt3}{2}\\)，乘積為 3。`
        );
        continue;
      }
      if (mode === 2) {
        const d = s242Pick([
          [1, 3],
          [1, 2],
          [1, 4],
        ]);
        const dText = s311PlainFrac(d[0], d[1]);
        const sinCos = simplifyFraction(d[1] * d[1] - d[0] * d[0], 2 * d[1] * d[1]);
        const ans = simplifyFraction(d[0] * sinCos.den, d[1] * sinCos.num);
        questions.push(`若 \\(\\sin\\theta-\\cos\\theta=${dText}\\)，求 \\(\\sec\\theta-\\csc\\theta\\) 的值。`);
        answers.push(
          `簡答：\\(${fractionToLatex(ans)}\\)。過程：由 \\((\\sin\\theta-\\cos\\theta)^2=1-2\\sin\\theta\\cos\\theta\\)，得 \\(\\sin\\theta\\cos\\theta=${fractionToLatex(sinCos)}\\)。又 \\(\\sec\\theta-\\csc\\theta=\\frac{\\sin\\theta-\\cos\\theta}{\\sin\\theta\\cos\\theta}\\)，代入可得 \\(${fractionToLatex(ans)}\\)。`
        );
        continue;
        questions.push(`若 \\(\\sin\\theta-\\cos\\theta=\\frac13\\)，求 \\(\\sec\\theta-\\csc\\theta\\) 的值。`);
        answers.push(
          `簡答：\\(\\frac34\\)。過程：由 \\((\\sin\\theta-\\cos\\theta)^2=1-2\\sin\\theta\\cos\\theta\\)，得 \\(\\sin\\theta\\cos\\theta=\\frac49\\)。又 \\(\\sec\\theta-\\csc\\theta=\\frac{\\sin\\theta-\\cos\\theta}{\\sin\\theta\\cos\\theta}=\\frac{1/3}{4/9}=\\frac34\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const a = s242Pick([70, 80]);
        questions.push(`求 \\(\\sec${a}^\\circ-\\sqrt3\\csc${a}^\\circ\\) 的精確轉換式。`);
        answers.push(
          `簡答：\\(\\frac{2\\sin(${a}^\\circ-60^\\circ)}{\\sin${a}^\\circ\\cos${a}^\\circ}\\)。過程：通分得 \\(\\frac{\\sin${a}^\\circ-\\sqrt3\\cos${a}^\\circ}{\\sin${a}^\\circ\\cos${a}^\\circ}\\)，分子可用和差角公式改寫成 \\(2\\sin(${a}^\\circ-60^\\circ)\\)。`
        );
        continue;
        questions.push(`求 \\(\\sec80^\\circ-\\sqrt3\\csc80^\\circ\\) 的精確轉換式。`);
        answers.push(
          `簡答：\\(\\frac{2\\sin(80^\\circ-60^\\circ)}{\\sin80^\\circ\\cos80^\\circ}\\)。過程：通分得 \\(\\frac{\\sin80^\\circ-\sqrt3\\cos80^\\circ}{\\sin80^\\circ\\cos80^\\circ}\\)，分子可用和差角公式改寫成 \\(2\\sin20^\\circ\\)。`
        );
        continue;
      }
      questions.push(
        `已知二次方程式 \\(x^2-px+q=0\\) 的兩根為 \\(\\sec\\theta,\\csc\\theta\\)，試以 \\(p,q\\) 表示 \\(\\tan\\theta+\cot\\theta\\)。`
      );
      answers.push(
        `簡答：\\(q\\)。過程：兩根積 \\(q=\\sec\\theta\\csc\\theta\\)。而 \\(\\tan\\theta+\cot\\theta=\\frac{\\sin^2\\theta+\\cos^2\\theta}{\\sin\\theta\\cos\\theta}=\\sec\\theta\\csc\\theta\\)，所以其值為 \\(q\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS311RadianSectorFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS311DegreeRadianConversionSet,
        buildS311SectorParameterSet,
        buildS311ClockSectorSet,
        buildS311RollingMotionSet,
        buildS311OverlapAreaSet,
      ],
      count
    );
  }

  function buildS311SectorApplicationFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS311SectorParameterSet,
        buildS311ClockSectorSet,
        buildS311RollingMotionSet,
        buildS311OverlapAreaSet,
        buildS311SectorExtremaSet,
      ],
      count
    );
  }

  function buildS311ReciprocalTrigFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS311RightTriangleReciprocalSet,
        buildS311ReciprocalFromOneRatioSet,
        buildS311ReciprocalIdentitySet,
        buildS311ReciprocalComparisonSet,
        buildS311SpecialReciprocalSet,
      ],
      count
    );
  }

  function buildS311DegreeRadianConversionSubtypeSet(count) {
    return buildS311DegreeRadianConversionSet(count);
  }

  function buildS311SectorParameterSubtypeSet(count) {
    return buildS311SectorParameterSet(count);
  }

  function buildS311ClockSectorSubtypeSet(count) {
    return buildS311ClockSectorSet(count);
  }

  function buildS311RollingMotionSubtypeSet(count) {
    return buildS311RollingMotionSet(count);
  }

  function buildS311OverlapAreaSubtypeSet(count) {
    return buildS311OverlapAreaSet(count);
  }

  function buildS311SectorExtremaSubtypeSet(count) {
    return buildS311SectorExtremaSet(count);
  }

  function buildS311RightTriangleReciprocalSubtypeSet(count) {
    return buildS311RightTriangleReciprocalSet(count);
  }

  function buildS311ReciprocalFromOneRatioSubtypeSet(count) {
    return buildS311ReciprocalFromOneRatioSet(count);
  }

  function buildS311ReciprocalIdentitySubtypeSet(count) {
    return buildS311ReciprocalIdentitySet(count);
  }

  function buildS311ReciprocalComparisonSubtypeSet(count) {
    return buildS311ReciprocalComparisonSet(count);
  }

  function buildS311SpecialReciprocalSubtypeSet(count) {
    return buildS311SpecialReciprocalSet(count);
  }

  function s312Frac(num, den = 1) {
    return formatFraction(num, den);
  }

  function s312RootFrac(num, den) {
    const frac = simplifyFraction(num, den);
    if (frac.den === 1) return formatRadical(frac.num);
    return `\\frac{${formatRadical(frac.num * frac.den)}}{${frac.den}}`;
  }

  const S312_TRIPLES = [
    { a: 3, b: 4, c: 5 },
    { a: 5, b: 12, c: 13 },
    { a: 8, b: 15, c: 17 },
    { a: 7, b: 24, c: 25 },
  ];

  function buildS312DoubleFromSingleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const t = s242Pick(S312_TRIPLES);
      const mode = i % 5;
      if (mode === 0) {
        const cosSign = s242Pick([1, -1]);
        const quadrant = cosSign > 0 ? '第一象限' : '第二象限';
        const sin2 = s312Frac(2 * t.a * t.b * cosSign, t.c * t.c);
        const cos2 = s312Frac(t.b * t.b - t.a * t.a, t.c * t.c);
        questions.push(
          `已知 \\(\\sin\\theta=${s312Frac(t.a, t.c)}\\)，且 \\(\\theta\\) 在${quadrant}，求 \\(\\sin2\\theta\\) 與 \\(\\cos2\\theta\\)。`
        );
        answers.push(
          `簡答：\\(\\sin2\\theta=${sin2},\\ \\cos2\\theta=${cos2}\\)。過程：先由象限判斷 \\(\\cos\\theta=${s312Frac(cosSign * t.b, t.c)}\\)。再用 \\(\\sin2\\theta=2\\sin\\theta\\cos\\theta\\)，\\(\\cos2\\theta=1-2\\sin^2\\theta\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const cos = s242Pick([t.b, -t.b]);
        const ans = s312Frac(2 * cos * cos - t.c * t.c, t.c * t.c);
        questions.push(`若 \\(\\cos\\theta=${s312Frac(cos, t.c)}\\)，求 \\(\\cos2\\theta\\)。`);
        answers.push(
          `簡答：\\(${ans}\\)。過程：\\(\\cos2\\theta=2\\cos^2\\theta-1=2\\left(${s312Frac(cos, t.c)}\\right)^2-1=${ans}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const tan = s242Pick([
          [1, 2],
          [2, 3],
          [3, 4],
          [2, 1],
          [3, 1],
        ]);
        const ans = s312Frac(2 * tan[0] * tan[1], tan[1] * tan[1] - tan[0] * tan[0]);
        questions.push(`已知 \\(\\tan\\theta=${s312Frac(tan[0], tan[1])}\\)，求 \\(\\tan2\\theta\\)。`);
        answers.push(
          `簡答：\\(${ans}\\)。過程：\\(\\tan2\\theta=\\frac{2\\tan\\theta}{1-\\tan^2\\theta}\\)，代入 \\(${s312Frac(tan[0], tan[1])}\\) 後約分得 \\(${ans}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const k = s242Pick([
          [1, 2],
          [2, 3],
          [3, 5],
          [4, 5],
        ]);
        const ans = s312Frac(k[0] * k[0] - k[1] * k[1], k[1] * k[1]);
        questions.push(`設 \\(\\sin\\theta+\\cos\\theta=${s312Frac(k[0], k[1])}\\)，求 \\(\\sin2\\theta\\)。`);
        answers.push(
          `簡答：\\(${ans}\\)。過程：\\((\\sin\\theta+\\cos\\theta)^2=1+\\sin2\\theta\\)，所以 \\(\\sin2\\theta=\\left(${s312Frac(k[0], k[1])}\\right)^2-1=${ans}\\)。`
        );
        continue;
      }
      const k = s242Pick([
        [1, 3],
        [1, 4],
        [2, 5],
      ]);
      const sin2 = s312Frac(k[1] * k[1] - k[0] * k[0], k[1] * k[1]);
      const ans = s312Frac(1 - 2 * (k[1] * k[1] - k[0] * k[0]) ** 2, k[1] ** 4);
      questions.push(
        `若 \\(\\sin\\theta-\\cos\\theta=${s312Frac(k[0], k[1])}\\)，先求 \\(\\sin2\\theta\\)，再求 \\(\\cos4\\theta\\)。`
      );
      answers.push(
        `簡答：\\(\\sin2\\theta=${sin2},\\ \\cos4\\theta=${ans}\\)。過程：\\((\\sin\\theta-\\cos\\theta)^2=1-\\sin2\\theta\\)，先得 \\(\\sin2\\theta=${sin2}\\)，再用 \\(\\cos4\\theta=1-2\\sin^2 2\\theta\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312HalfAngleKnownSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const data = [
      { cos: [3, 5], range: '第三象限', sinHalfSign: 1, cosHalfSign: -1 },
      { cos: [-3, 5], range: '第二象限', sinHalfSign: 1, cosHalfSign: 1 },
      { cos: [-5, 13], range: '第三象限', sinHalfSign: 1, cosHalfSign: -1 },
      { cos: [12, 13], range: '第四象限', sinHalfSign: 1, cosHalfSign: 1 },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(data);
      const c = simplifyFraction(item.cos[0], item.cos[1]);
      const sinHalf2 = simplifyFraction(c.den - c.num, 2 * c.den);
      const cosHalf2 = simplifyFraction(c.den + c.num, 2 * c.den);
      const mode = i % 5;
      if (mode === 0) {
        questions.push(
          `設 \\(\\cos\\theta=${fractionToLatex(c)}\\)，且 \\(\\theta\\) 在${item.range}，求 \\(\\sin^2\\frac{\\theta}{2}\\)。`
        );
        answers.push(
          `簡答：\\(${fractionToLatex(sinHalf2)}\\)。過程：\\(\\sin^2\\frac{\\theta}{2}=\\frac{1-\\cos\\theta}{2}\\)，代入 \\(${fractionToLatex(c)}\\) 得 \\(${fractionToLatex(sinHalf2)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(
          `設 \\(\\cos\\theta=${fractionToLatex(c)}\\)，且 \\(\\theta\\) 在${item.range}，求 \\(\\cos^2\\frac{\\theta}{2}\\)。`
        );
        answers.push(
          `簡答：\\(${fractionToLatex(cosHalf2)}\\)。過程：\\(\\cos^2\\frac{\\theta}{2}=\\frac{1+\\cos\\theta}{2}\\)，代入即可。`
        );
        continue;
      }
      if (mode === 2) {
        const ans = simplifyFraction(sinHalf2.num * cosHalf2.den, sinHalf2.den * cosHalf2.num);
        questions.push(
          `設 \\(\\cos\\theta=${fractionToLatex(c)}\\)，且 \\(\\theta\\) 在${item.range}，求 \\(\\tan^2\\frac{\\theta}{2}\\)。`
        );
        answers.push(
          `簡答：\\(${fractionToLatex(ans)}\\)。過程：\\(\\tan^2\\frac{\\theta}{2}=\\frac{1-\\cos\\theta}{1+\\cos\\theta}\\)，代入後約分。`
        );
        continue;
      }
      if (mode === 3) {
        const ans = s312RootFrac(sinHalf2.num, sinHalf2.den);
        questions.push(
          `設 \\(\\cos\\theta=${fractionToLatex(c)}\\)，且 \\(\\frac{\\theta}{2}\\) 位於第一象限，求 \\(\\sin\\frac{\\theta}{2}\\)。`
        );
        answers.push(
          `簡答：\\(${ans}\\)。過程：先用 \\(\\sin^2\\frac{\\theta}{2}=\\frac{1-\\cos\\theta}{2}\\)，再由 \\(\\frac{\\theta}{2}\\) 在第一象限取正根。`
        );
        continue;
      }
      const ans = s312RootFrac(cosHalf2.num, cosHalf2.den);
      questions.push(
        `設 \\(\\cos\\theta=${fractionToLatex(c)}\\)，且 \\(\\frac{\\theta}{2}\\) 位於第一象限，求 \\(\\cos\\frac{\\theta}{2}\\)。`
      );
      answers.push(
        `簡答：\\(${ans}\\)。過程：\\(\\cos^2\\frac{\\theta}{2}=\\frac{1+\\cos\\theta}{2}\\)，再依象限取正根。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312RadicalHalfSimplifySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const angle = s242Pick([100, 120, 140, 160]);
        questions.push(`若 \\(90^\\circ< x <180^\\circ\\)，化簡 \\(\\sqrt{1+\\sin x}\\)。`);
        answers.push(
          `簡答：\\(\\sin\\frac{x}{2}+\\cos\\frac{x}{2}\\)。過程：\\(1+\\sin x=\\left(\\sin\\frac{x}{2}+\\cos\\frac{x}{2}\\right)^2\\)。因為 \\(${angle}^\\circ\\) 所在範圍使括號為正，所以可去根號。`
        );
        continue;
      }
      if (mode === 1) {
        const angle = s242Pick([300, 320, 340]);
        questions.push(`化簡 \\(\\sqrt{1-\\sin ${angle}^\\circ}\\)。`);
        answers.push(
          `簡答：\\(\\cos ${angle / 2}^\\circ-\\sin ${angle / 2}^\\circ\\)。過程：\\(1-\\sin x=\\left(\\cos\\frac{x}{2}-\\sin\\frac{x}{2}\\right)^2\\)，再由角度範圍判斷正負。`
        );
        continue;
      }
      if (mode === 2) {
        const a = s242Pick([40, 60, 80]);
        questions.push(`化簡 \\(\\sqrt{2+2\\cos ${a}^\\circ}\\)。`);
        answers.push(
          `簡答：\\(2\\cos ${a / 2}^\\circ\\)。過程：\\(2+2\\cos x=4\\cos^2\\frac{x}{2}\\)，且本題半角為銳角，取正得 \\(2\\cos\\frac{x}{2}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const a = s242Pick([60, 100, 120]);
        questions.push(`求 \\(\\sqrt{\\frac{1-\\cos ${a}^\\circ}{1+\\cos ${a}^\\circ}}\\) 的值並判定正負號。`);
        answers.push(
          `簡答：\\(\\tan ${a / 2}^\\circ\\)。過程：\\(\\frac{1-\\cos x}{1+\\cos x}=\\tan^2\\frac{x}{2}\\)，本題 \\(\\frac{x}{2}\\) 為銳角，故取正。`
        );
        continue;
      }
      const a = s242Pick([20, 30, 40]);
      questions.push(
        `化簡 \\(\\sqrt{2+\\sqrt{2+2\\cos ${4 * a}^\\circ}}\\)，其中 \\(0^\\circ<${a}^\\circ<45^\\circ\\)。`
      );
      answers.push(
        `簡答：\\(2\\cos ${a}^\\circ\\)。過程：內層 \\(\\sqrt{2+2\\cos4a}=2\\cos2a\\)，原式變成 \\(\\sqrt{2+2\\cos2a}=2\\cos a\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312TanSubstitutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const tans = [
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 1],
      [3, 1],
    ];
    for (let i = 0; i < count; i += 1) {
      const [n, d] = s242Pick(tans);
      const sin2 = simplifyFraction(2 * n * d, n * n + d * d);
      const cos2 = simplifyFraction(d * d - n * n, n * n + d * d);
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`若 \\(\\tan\\theta=${s312Frac(n, d)}\\)，求 \\(\\sin2\\theta+\\cos2\\theta\\)。`);
        const ans = simplifyFraction(sin2.num * cos2.den + cos2.num * sin2.den, sin2.den * cos2.den);
        answers.push(
          `簡答：\\(${fractionToLatex(ans)}\\)。過程：由萬能公式 \\(\\sin2\\theta=\\frac{2t}{1+t^2}\\)，\\(\\cos2\\theta=\\frac{1-t^2}{1+t^2}\\)，其中 \\(t=${s312Frac(n, d)}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const ans = simplifyFraction(3 * sin2.num * cos2.den + 4 * cos2.num * sin2.den, sin2.den * cos2.den);
        questions.push(`已知 \\(\\tan\\theta=${s312Frac(n, d)}\\)，求 \\(3\\sin2\\theta+4\\cos2\\theta\\)。`);
        answers.push(
          `簡答：\\(${fractionToLatex(ans)}\\)。過程：先用正切萬能公式求 \\(\\sin2\\theta=${fractionToLatex(sin2)}\\)、\\(\\cos2\\theta=${fractionToLatex(cos2)}\\)，再代入線性組合。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(
          `設 \\(t=\\tan\\frac{\\theta}{2}\\)，將 \\(3\\sin\\theta+4\\cos\\theta\\) 表示為 \\(t\\) 的分式。`
        );
        answers.push(
          `簡答：\\(\\frac{6t+4(1-t^2)}{1+t^2}\\)。過程：代入 \\(\\sin\\theta=\\frac{2t}{1+t^2}\\)，\\(\\cos\\theta=\\frac{1-t^2}{1+t^2}\\) 後合併。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(
          `已知 \\(\\tan\\frac{\\theta}{2}=${s312Frac(n, d)}\\)，求 \\(\\frac{1+\\sin\\theta}{\\cos\\theta}\\)。`
        );
        const ans = simplifyFraction((n + d) * (n + d), d * d - n * n);
        answers.push(
          `簡答：\\(${fractionToLatex(ans)}\\)。過程：用 \\(\\sin\\theta=\\frac{2t}{1+t^2}\\)、\\(\\cos\\theta=\\frac{1-t^2}{1+t^2}\\)，原式為 \\(\\frac{(1+t)^2}{1-t^2}\\)。`
        );
        continue;
      }
      questions.push(`若 \\(\\tan x=k\\)，以 \\(k\\) 表示 \\(\\frac{1+\\sin2x}{\\cos2x}\\)。`);
      answers.push(
        `簡答：\\(\\frac{(1+k)^2}{1-k^2}\\)。過程：代入 \\(\\sin2x=\\frac{2k}{1+k^2}\\)、\\(\\cos2x=\\frac{1-k^2}{1+k^2}\\)，再合併分式。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312QuadraticDoubleHalfSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const t = s242Pick(S312_TRIPLES);
        const a = t.c * t.c;
        const b = -t.c * (t.a + t.b);
        const c = t.a * t.b;
        const ans = s312Frac(2 * t.a * t.b, t.c * t.c);
        questions.push(
          `若 \\(\\sin\\theta,\\cos\\theta\\) 為方程式 \\(${a}x^2${b < 0 ? b : `+${b}`}x+${c}=0\\) 的兩根，求 \\(\\sin2\\theta\\)。`
        );
        answers.push(
          `簡答：\\(${ans}\\)。過程：兩根積為 \\(\\sin\\theta\\cos\\theta=\\frac{${c}}{${a}}\\)，所以 \\(\\sin2\\theta=2\\sin\\theta\\cos\\theta=${ans}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(
          `已知方程式 \\(x^2+px+q=0\\) 的二根為 \\(\\sin\\theta,\\cos\\theta\\)，以 \\(p,q\\) 表示 \\(1+\\sin2\\theta\\)。`
        );
        answers.push(
          `簡答：\\(1+2q\\)。過程：二根積為 \\(q=\\sin\\theta\\cos\\theta\\)，所以 \\(1+\\sin2\\theta=1+2\\sin\\theta\\cos\\theta=1+2q\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(
          `若 \\(\\tan\\alpha,\\tan\\beta\\) 為方程式 \\(x^2-5x+1=0\\) 的兩根，求 \\(\\tan(\\alpha+\\beta)\\)。`
        );
        answers.push(
          `簡答：不存在。過程：兩根和為 5、積為 1，所以 \\(\\tan(\\alpha+\\beta)=\\frac{5}{1-1}\\)，分母為 0，表示 \\(\\alpha+\\beta\\) 對應垂直方向，正切值不存在。`
        );
        continue;
      }
      if (mode === 3) {
        const root = s242Pick([
          [1, 2],
          [3, 4],
          [4, 5],
        ]);
        questions.push(
          `設 \\(\\sin\\theta\\) 是 \\(4x^2+4x-3=0\\) 的一根，且 \\(\\theta\\) 為銳角，求 \\(\\cos2\\theta\\)。`
        );
        answers.push(
          `簡答：\\(\\frac12\\)。過程：方程式正根為 \\(\\frac12\\)，所以 \\(\\sin\\theta=\\frac12\\)。由 \\(\\cos2\\theta=1-2\\sin^2\\theta\\)，得 \\(\\frac12\\)。`
        );
        continue;
      }
      questions.push(`解三角方程式 \\(\\cos2x-5\\cos x+3=0\\)，令 \\(u=\\cos x\\) 化為二次式。`);
      answers.push(
        `簡答：\\(2u^2-5u+2=0\\)，所以 \\(u=\\frac12\\) 或 \\(u=2\\)，有效為 \\(\\cos x=\\frac12\\)。過程：\\(\\cos2x=2\\cos^2x-1\\)，代入後整理並排除不可能的 \\(\\cos x=2\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312ProductValuesSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`求 \\(\\cos20^\\circ\\cos40^\\circ\\cos80^\\circ\\) 的值。`);
        answers.push(
          `簡答：\\(\\frac18\\)。過程：同乘 \\(2\\sin20^\\circ\\)，利用 \\(2\\sin x\\cos x=\\sin2x\\) 連續倍角，可得 \\(2\\sin20^\\circ\\cos20^\\circ\\cos40^\\circ\\cos80^\\circ=\\sin160^\\circ=\\sin20^\\circ\\)，故原式為 \\(\\frac18\\)。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`求 \\(\\sin20^\\circ\\sin40^\\circ\\sin80^\\circ\\) 的值。`);
        answers.push(
          `簡答：\\(\\frac{\\sqrt3}{8}\\)。過程：由 \\(\\sin3x=4\\sin x\\sin(60^\\circ+x)\\sin(60^\\circ-x)\\)，取 \\(x=20^\\circ\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`計算 \\(\\cos\\frac{\\pi}{7}\\cos\\frac{2\\pi}{7}\\cos\\frac{4\\pi}{7}\\)。`);
        answers.push(
          `簡答：\\(-\\frac18\\)。過程：這是 \\(20^\\circ,40^\\circ,80^\\circ\\) 型的弧度版本，注意其中 \\(\\cos\\frac{4\\pi}{7}<0\\)，結果為 \\(-\\frac18\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const a = s242Pick([10, 20]);
        questions.push(
          `證明 \\(\\sin ${a}^\\circ\\sin(60^\\circ-${a}^\\circ)\\sin(60^\\circ+${a}^\\circ)=\\frac14\\sin ${3 * a}^\\circ\\)。`
        );
        answers.push(
          `簡答：恆成立。過程：使用三倍角的連乘變形 \\(\\sin3x=4\\sin x\\sin(60^\\circ-x)\\sin(60^\\circ+x)\\)，令 \\(x=${a}^\\circ\\)。`
        );
        continue;
      }
      questions.push(`計算 \\(\\tan20^\\circ\\tan40^\\circ\\tan80^\\circ\\)。`);
      answers.push(
        `簡答：\\(\\sqrt3\\)。過程：利用 \\(\\tan x\\tan(60^\\circ-x)\\tan(60^\\circ+x)=\\tan3x\\)，取 \\(x=20^\\circ\\)，得 \\(\\tan60^\\circ=\\sqrt3\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312SumDifferenceExactSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cases = [
      { q: '\\sin75^\\circ', ans: '\\frac{\\sqrt6+\\sqrt2}{4}', process: '\\sin(45^\\circ+30^\\circ)' },
      { q: '\\cos15^\\circ', ans: '\\frac{\\sqrt6+\\sqrt2}{4}', process: '\\cos(45^\\circ-30^\\circ)' },
      { q: '\\tan75^\\circ', ans: '2+\\sqrt3', process: '\\tan(45^\\circ+30^\\circ)' },
      { q: '\\cos75^\\circ', ans: '\\frac{\\sqrt6-\\sqrt2}{4}', process: '\\cos(45^\\circ+30^\\circ)' },
      { q: '\\tan15^\\circ', ans: '2-\\sqrt3', process: '\\tan(45^\\circ-30^\\circ)' },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      questions.push(`求 \\(${item.q}\\) 的精確值。`);
      answers.push(`簡答：\\(${item.ans}\\)。過程：將角度拆成 ${item.process}，再套用和差角公式化簡。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312CompoundQuadrantSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const triples = [
      { s: [3, 5], c: [4, 5] },
      { s: [5, 13], c: [12, 13] },
      { s: [8, 17], c: [15, 17] },
    ];
    for (let i = 0; i < count; i += 1) {
      const a = s242Pick(triples);
      const b = s242Pick(triples);
      const mode = i % 5;
      if (mode === 0) {
        const ans = simplifyFraction(a.s[0] * b.c[0] + a.c[0] * b.s[0], a.s[1] * b.c[1]);
        questions.push(
          `設 \\(\\alpha,\\beta\\) 均為銳角，\\(\\sin\\alpha=${s312Frac(a.s[0], a.s[1])}\\)、\\(\\cos\\beta=${s312Frac(b.c[0], b.c[1])}\\)，求 \\(\\sin(\\alpha+\\beta)\\)。`
        );
        answers.push(
          `簡答：\\(${fractionToLatex(ans)}\\)。過程：先由直角三角形補出 \\(\\cos\\alpha\\)、\\(\\sin\\beta\\)，再用 \\(\\sin(\\alpha+\\beta)=\\sin\\alpha\\cos\\beta+\\cos\\alpha\\sin\\beta\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const ans = simplifyFraction(a.c[0] * b.c[0] - a.s[0] * b.s[0], a.c[1] * b.c[1]);
        questions.push(
          `設 \\(\\alpha,\\beta\\) 均為銳角，\\(\\cos\\alpha=${s312Frac(a.c[0], a.c[1])}\\)、\\(\\sin\\beta=${s312Frac(b.s[0], b.s[1])}\\)，求 \\(\\cos(\\alpha+\\beta)\\)。`
        );
        answers.push(
          `簡答：\\(${fractionToLatex(ans)}\\)。過程：補出 \\(\\sin\\alpha\\)、\\(\\cos\\beta\\)，再代入 \\(\\cos(\\alpha+\\beta)=\\cos\\alpha\\cos\\beta-\\sin\\alpha\\sin\\beta\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(
          `已知 \\(\\theta\\) 為第三象限角且 \\(\\cos\\theta=-${s312Frac(a.c[0], a.c[1])}\\)，求 \\(\\cos(\\theta+\\frac{\\pi}{6})\\)。`
        );
        answers.push(
          `簡答：\\(-\\frac{${a.c[0]}\\sqrt3+${a.s[0]}}{${2 * a.c[1]}}\\)。過程：第三象限 \\(\\sin\\theta=-${s312Frac(a.s[0], a.s[1])}\\)，再展開 \\(\\cos(\\theta+\\frac\\pi6)\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const ans = simplifyFraction(1 * 2 + 1 * 1, 2 * 2);
        questions.push(`若 \\(\\tan\\alpha=\\frac12\\)、\\(\\tan\\beta=\\frac13\\)，求 \\(\\tan(\\alpha+\\beta)\\)。`);
        answers.push(`簡答：\\(1\\)。過程：\\(\\tan(\\alpha+\\beta)=\\frac{\\frac12+\\frac13}{1-\\frac16}=1\\)。`);
        continue;
      }
      questions.push(`若 \\(\\alpha-\\beta=45^\\circ\\)，求 \\((1+\\tan\\alpha)(1-\\tan\\beta)\\) 的值。`);
      answers.push(
        `簡答：2。過程：由 \\(\\tan(\\alpha-\\beta)=1\\)，得 \\(\\frac{\\tan\\alpha-\\tan\\beta}{1+\\tan\\alpha\\tan\\beta}=1\\)，整理即 \\((1+\\tan\\alpha)(1-\\tan\\beta)=2\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312InverseFormulaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const pairs = [
      [17, 47],
      [82, 38],
      [80, 20],
      [15, 75],
      [35, 25],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = s242Pick(pairs);
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`化簡並計算 \\(\\sin${a}^\\circ\\cos${b}^\\circ-\\cos${a}^\\circ\\sin${b}^\\circ\\)。`);
        answers.push(
          `簡答：\\(\\sin(${a - b}^\\circ)\\)。過程：辨認為 \\(\\sin A\\cos B-\\cos A\\sin B=\\sin(A-B)\\)。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`計算 \\(\\cos${a}^\\circ\\cos${b}^\\circ+\\sin${a}^\\circ\\sin${b}^\\circ\\)。`);
        answers.push(`簡答：\\(\\cos(${a - b}^\\circ)\\)。過程：套用 \\(\\cos(A-B)=\\cos A\\cos B+\\sin A\\sin B\\)。`);
        continue;
      }
      if (mode === 2) {
        questions.push(`計算 \\(\\frac{\\tan${a}^\\circ+\\tan${b}^\\circ}{1-\\tan${a}^\\circ\\tan${b}^\\circ}\\)。`);
        answers.push(`簡答：\\(\\tan(${a + b}^\\circ)\\)。過程：這正是 \\(\\tan(A+B)\\) 的公式。`);
        continue;
      }
      if (mode === 3) {
        questions.push(`求 \\(\\sin80^\\circ\\cos20^\\circ-\\cos80^\\circ\\sin20^\\circ\\) 的結果。`);
        answers.push(
          `簡答：\\(\\frac{\\sqrt3}{2}\\)。過程：原式為 \\(\\sin(80^\\circ-20^\\circ)=\\sin60^\\circ=\\frac{\\sqrt3}{2}\\)。`
        );
        continue;
      }
      questions.push(
        `計算 \\(\\cos\\frac{\\pi}{12}\\cos\\frac{5\\pi}{12}+\\sin\\frac{\\pi}{12}\\sin\\frac{5\\pi}{12}\\)。`
      );
      answers.push(
        `簡答：\\(\\frac12\\)。過程：原式為 \\(\\cos(\\frac{\\pi}{12}-\\frac{5\\pi}{12})=\\cos(-\\frac{\\pi}{3})=\\frac12\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312TanEquationLineAngleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const [m1, m2] = s242Pick([
          [1, 2],
          [1, -2],
          [2, 4],
          [3, -1],
          [3, 4],
        ]);
        const ans = s312Frac(Math.abs(m1 - m2), Math.abs(1 + m1 * m2));
        questions.push(`兩直線斜率分別為 ${m1} 與 ${m2}，求其夾角 \\(\\phi\\) 的 \\(\\tan\\phi\\)。`);
        answers.push(
          `簡答：\\(${ans}\\)。過程：\\(\\tan\\phi=\\left|\\frac{m_1-m_2}{1+m_1m_2}\\right|\\)，代入兩斜率並取正值得 \\(${ans}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`求直線 \\(3x+y-3=0\\) 與 \\(2x-y+1=0\\) 的夾角正切值。`);
        answers.push(
          `簡答：\\(\\frac54\\)。過程：兩斜率為 \\(-3\\) 與 \\(2\\)，代入 \\(\\left|\\frac{m_1-m_2}{1+m_1m_2}\\right|\\) 得 \\(\\frac54\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`設兩直線斜率為 \\(m\\) 與 \\(1\\)，若夾角為 \\(45^\\circ\\)，求 \\(m\\) 的可能值。`);
        answers.push(
          `簡答：\\(0\\) 或不存在斜率的垂直線情形另論。過程：令 \\(\\left|\\frac{m-1}{1+m}\\right|=1\\)，解得 \\(m=0\\)；另一支對應分母為 0 的垂直情況。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`已知 \\(A(2,1),B(-3,4),O(0,0)\\)，求 \\(\\tan\\angle AOB\\)。`);
        answers.push(
          `簡答：\\(\\frac{11}{3}\\)。過程：\\(OA\\) 斜率 \\(\\frac12\\)，\\(OB\\) 斜率 \\(-\\frac43\\)，代入兩直線夾角公式。`
        );
        continue;
      }
      questions.push(`在正方形網格中，一條線斜率為 2，另一條線斜率為 \\(-\\frac12\\)，求兩線夾角。`);
      answers.push(`簡答：\\(90^\\circ\\)。過程：兩斜率乘積為 \\(-1\\)，所以兩線互相垂直。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312TriangleInteriorSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = s242Pick([1, 2, 3]);
        const b = s242Pick([2, 3, 4]);
        const ans = s312Frac(-(a + b), 1 - a * b);
        questions.push(`在 \\(\\triangle ABC\\) 中，已知 \\(\\tan A=${a}\\)、\\(\\tan B=${b}\\)，求 \\(\\tan C\\)。`);
        answers.push(
          `簡答：\\(${ans}\\)。過程：因 \\(C=180^\\circ-(A+B)\\)，所以 \\(\\tan C=-\\tan(A+B)=-\\frac{\\tan A+\\tan B}{1-\\tan A\\tan B}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(
          `在 \\(\\triangle ABC\\) 中，已知 \\(\\cos A=\\frac45\\)、\\(\\cos B=\\frac{12}{13}\\)，求 \\(\\cos C\\)。`
        );
        answers.push(
          `簡答：\\(-\\frac{16}{65}\\)。過程：\\(C=180^\\circ-(A+B)\\)，所以 \\(\\cos C=-\\cos(A+B)\\)。補出 \\(\\sin A=\\frac35\\)、\\(\\sin B=\\frac5{13}\\) 後代入。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`若 \\(\\tan A,\\tan B\\) 為方程式 \\(x^2-5x+1=0\\) 的兩根，求 \\(\\tan C\\)。`);
        answers.push(
          `簡答：不存在。過程：兩根和為 5、積為 1，所以 \\(\\tan(A+B)=\\frac{5}{1-1}\\) 不存在，表示 \\(A+B=90^\\circ\\)，因此 \\(C=90^\\circ\\)，\\(\\tan C\\) 不存在。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(
          `在 \\(\\triangle ABC\\) 中，已知 \\(\\sin A=\\frac35\\)、\\(\\cos B=\\frac5{13}\\)，求 \\(\\sin C\\)。`
        );
        answers.push(
          `簡答：\\(\\frac{56}{65}\\)。過程：\\(\\sin C=\\sin(A+B)=\\sin A\\cos B+\\cos A\\sin B\\)，補出 \\(\\cos A=\\frac45\\)、\\(\\sin B=\\frac{12}{13}\\)。`
        );
        continue;
      }
      questions.push(`已知 \\(A+B=120^\\circ\\)，求 \\(\\tan A+\\tan B+\\sqrt3\\tan A\\tan B\\) 的值。`);
      answers.push(
        `簡答：\\(-\\sqrt3\\)。過程：由 \\(\\tan(A+B)=\\tan120^\\circ=-\\sqrt3\\)，整理 \\(\\frac{\\tan A+\\tan B}{1-\\tan A\\tan B}=-\\sqrt3\\) 即得。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312RotationCoordinateSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const points = [
      [3, 4],
      [2, -1],
      [4, 0],
      [3, 1],
    ];
    for (let i = 0; i < count; i += 1) {
      const [x, y] = s242Pick(points);
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`將點 \\(P(${x},${y})\\) 繞原點逆時針旋轉 \\(90^\\circ\\)，求新座標。`);
        answers.push(
          `簡答：\\((- ${y},${x})\\)。過程：逆時針旋轉 \\(90^\\circ\\) 的公式為 \\((x,y)\\mapsto(-y,x)\\)。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`將點 \\(P(${x},${y})\\) 繞原點順時針旋轉 \\(90^\\circ\\)，求新座標。`);
        answers.push(`簡答：\\((${y},-${x})\\)。過程：順時針旋轉 \\(90^\\circ\\) 的公式為 \\((x,y)\\mapsto(y,-x)\\)。`);
        continue;
      }
      if (mode === 2) {
        questions.push(`將點 \\((4,0)\\) 繞原點逆時針旋轉 \\(60^\\circ\\)，求新座標。`);
        answers.push(
          `簡答：\\((2,2\\sqrt3)\\)。過程：\\((r,0)\\) 旋轉 \\(60^\\circ\\) 後為 \\((r\\cos60^\\circ,r\\sin60^\\circ)\\)，代入 \\(r=4\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`單位向量 \\((\\cos100^\\circ,\\sin100^\\circ)\\) 旋轉 \\(80^\\circ\\) 後的新向量座標為何？`);
        answers.push(
          `簡答：\\((-1,0)\\)。過程：極角由 \\(100^\\circ\\) 加上 \\(80^\\circ\\) 得 \\(180^\\circ\\)，所以座標為 \\((\\cos180^\\circ,\\sin180^\\circ)=(-1,0)\\)。`
        );
        continue;
      }
      questions.push(`已知 \\(A(3,1)\\) 繞原點旋轉 \\(\\theta\\) 後得到 \\(A'(-1,3)\\)，求 \\(\\theta\\)。`);
      answers.push(
        `簡答：\\(90^\\circ\\)。過程：\\((x,y)\\mapsto(-y,x)\\) 正是逆時針 \\(90^\\circ\\) 旋轉，而 \\((3,1)\\mapsto(-1,3)\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312TripleFromSingleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const s = s242Pick([
          [1, 3],
          [2, 5],
          [3, 5],
        ]);
        const ans = simplifyFraction(3 * s[0] * s[1] * s[1] - 4 * s[0] ** 3, s[1] ** 3);
        questions.push(`已知 \\(\\sin\\theta=${s312Frac(s[0], s[1])}\\)，求 \\(\\sin3\\theta\\)。`);
        answers.push(
          `簡答：\\(${fractionToLatex(ans)}\\)。過程：\\(\\sin3\\theta=3\\sin\\theta-4\\sin^3\\theta\\)，代入後約分。`
        );
        continue;
      }
      if (mode === 1) {
        const c = s242Pick([
          [1, 2],
          [2, 3],
          [3, 5],
        ]);
        const ans = simplifyFraction(4 * c[0] ** 3 - 3 * c[0] * c[1] * c[1], c[1] ** 3);
        questions.push(`已知 \\(\\cos\\theta=${s312Frac(c[0], c[1])}\\)，求 \\(\\cos3\\theta\\)。`);
        answers.push(
          `簡答：\\(${fractionToLatex(ans)}\\)。過程：\\(\\cos3\\theta=4\\cos^3\\theta-3\\cos\\theta\\)，代入化簡。`
        );
        continue;
      }
      if (mode === 2) {
        const t = s242Pick([
          [1, 2],
          [2, 1],
          [3, 2],
        ]);
        const ans = simplifyFraction(3 * t[0] * t[1] * t[1] - t[0] ** 3, t[1] ** 3 - 3 * t[0] * t[0] * t[1]);
        questions.push(
          `設 \\(\\theta\\) 為銳角且 \\(\\tan\\theta=${s312Frac(t[0], t[1])}\\)，求 \\(\\tan3\\theta\\)。`
        );
        answers.push(
          `簡答：\\(${fractionToLatex(ans)}\\)。過程：\\(\\tan3\\theta=\\frac{3t-t^3}{1-3t^2}\\)，其中 \\(t=\\tan\\theta\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const k = s242Pick([1, 2, 3]);
        questions.push(`已知 \\(\\cos\\theta=k\\)，以 \\(k\\) 表示 \\(2\\cos3\\theta+6\\cos\\theta\\)。`);
        answers.push(
          `簡答：\\(8k^3\\)。過程：\\(\\cos3\\theta=4k^3-3k\\)，所以 \\(2\\cos3\\theta+6k=2(4k^3-3k)+6k=8k^3\\)。`
        );
        continue;
      }
      questions.push(`若 \\(x=\\cos20^\\circ\\)，求 \\(8x^3-6x+1\\) 的值。`);
      answers.push(`簡答：2。過程：\\(4x^3-3x=\\cos60^\\circ=\\frac12\\)，所以 \\(8x^3-6x+1=2\\cdot\\frac12+1=2\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312TripleProductSet(count) {
    return buildS312ProductValuesSet(count);
  }

  function buildS312TriplePolynomialSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`求以 \\((x+\\sin10^\\circ)\\) 除 \\(8x^3-6x+2\\) 的餘式。`);
        answers.push(
          `簡答：1。過程：餘式為 \\(f(-\\sin10^\\circ)\\)。利用 \\(\\sin30^\\circ=3\\sin10^\\circ-4\\sin^310^\\circ\\)，可得 \\(8(-s)^3-6(-s)+2=1\\)。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`已知 \\(f(x)=4x^3-3x-1\\)，求 \\(f(\\cos40^\\circ)\\)。`);
        answers.push(
          `簡答：\\(-\\frac32\\)。過程：\\(4\\cos^340^\\circ-3\\cos40^\\circ=\\cos120^\\circ=-\\frac12\\)，再減 1 得 \\(-\\frac32\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`若 \\(x=\\cos20^\\circ\\)，求 \\(16x^3-12x+1\\) 的精確值。`);
        answers.push(
          `簡答：3。過程：\\(4x^3-3x=\\cos60^\\circ=\\frac12\\)，所以 \\(16x^3-12x+1=4\\cdot\\frac12+1=3\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`已知 \\(x\\) 滿足 \\(4x^3-3x=\\frac12\\)，求可能的特殊角表示。`);
        answers.push(
          `簡答：\\(x=\\cos20^\\circ,\\cos100^\\circ,\\cos260^\\circ\\) 等同餘角。過程：把左式視為 \\(\\cos3\\theta\\)，令 \\(x=\\cos\\theta\\)，則 \\(3\\theta=60^\\circ+360^\\circ k\\)。`
        );
        continue;
      }
      questions.push(`求 \\(16\\cos^320^\\circ-12\\cos20^\\circ+1\\) 的值。`);
      answers.push(`簡答：3。過程：由 \\(4\\cos^3x-3\\cos x=\\cos3x\\)，原式為 \\(4\\cos60^\\circ+1=3\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312Special1836Set(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cases = [
      { q: '證明 \\(\\sin18^\\circ\\) 為方程式 \\(4x^2+2x-1=0\\) 的正根。', a: '\\sin18^\\circ=\\frac{\\sqrt5-1}{4}' },
      {
        q: '利用三倍角公式求 \\(\\cos54^\\circ\\) 與 \\(\\sin18^\\circ\\) 的關係。',
        a: '\\cos54^\\circ=\\sin36^\\circ',
      },
      { q: '計算 \\(\\cos36^\\circ-\\cos72^\\circ\\) 的定值。', a: '\\frac12' },
      { q: '求 \\(\\sin18^\\circ\\cos36^\\circ\\) 的乘積值。', a: '\\frac{\\sqrt5-1}{8}\\cdot\\frac{\\sqrt5+1}{4}' },
      { q: '已知正五邊形對角線長為 \\(d\\)、邊長為 \\(s\\)，求 \\(d:s\\)。', a: '\\frac{1+\\sqrt5}{2}:1' },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      questions.push(item.q);
      answers.push(
        `簡答：\\(${item.a}\\)。過程：使用 \\(18^\\circ,36^\\circ,72^\\circ\\) 與五邊形的黃金比例關係，必要時由倍角或三倍角公式推得。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312TripleExpressionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`化簡 \\(\\frac{\\sin3\\theta}{\\sin\\theta}-\\frac{\\cos3\\theta}{\\cos\\theta}\\)。`);
        answers.push(
          `簡答：2。過程：分別展開為 \\(3-4\\sin^2\\theta\\) 與 \\(4\\cos^2\\theta-3\\)，相減後用 \\(\\sin^2\\theta+\\cos^2\\theta=1\\)。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`求 \\(\\frac{\\sin15^\\circ}{\\sin5^\\circ}-\\frac{\\cos15^\\circ}{\\cos5^\\circ}\\) 之值。`);
        answers.push(`簡答：2。過程：令 \\(\\theta=5^\\circ\\)，套用上一題的三倍角化簡式。`);
        continue;
      }
      if (mode === 2) {
        questions.push(`證明 \\(\\frac{3\\cos\\theta+\\cos3\\theta}{3\\sin\\theta-\\sin3\\theta}=\\cot^3\\theta\\)。`);
        answers.push(
          `簡答：恆成立。過程：分子為 \\(4\\cos^3\\theta\\)，分母為 \\(4\\sin^3\\theta\\)，相除得 \\(\\cot^3\\theta\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`化簡 \\(\\sin3\\theta\\csc\\theta+\\cos3\\theta\\sec\\theta\\)。`);
        answers.push(
          `簡答：2。過程：化為 \\(\\frac{\\sin3\\theta}{\\sin\\theta}+\\frac{\\cos3\\theta}{\\cos\\theta}\\)，展開後常數與平方項合併為 2。`
        );
        continue;
      }
      questions.push(`若 \\(\\sin\\theta-\\cos\\theta=\\frac13\\)，求 \\(\\sin3\\theta+\\cos3\\theta\\) 的值。`);
      answers.push(
        `簡答：\\(\\frac{17}{27}\\)。過程：令 \\(u=\\sin\\theta+\\cos\\theta\\)，由差平方可得 \\(\\sin\\theta\\cos\\theta=\\frac49\\)，再用三次和公式整理。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312AngleFormulaAlgebraSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`已知 \\(\\sin(A+B)=\\frac12\\)、\\(\\sin(A-B)=\\frac13\\)，求 \\(\\sin^2A-\\sin^2B\\)。`);
        answers.push(`簡答：\\(\\frac16\\)。過程：\\(\\sin(A+B)\\sin(A-B)=\\sin^2A-\\sin^2B\\)，直接相乘。`);
        continue;
      }
      if (mode === 1) {
        questions.push(`已知 \\(\\sin A+\\sin B=a\\)、\\(\\cos A+\\cos B=b\\)，以 \\(a,b\\) 表示 \\(\\cos(A-B)\\)。`);
        answers.push(
          `簡答：\\(\\frac{a^2+b^2-2}{2}\\)。過程：平方相加，\\((\\sin A+\\sin B)^2+(\\cos A+\\cos B)^2=2+2\\cos(A-B)\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`求 \\(\\sin^2(x+30^\\circ)+\\sin^2(x-30^\\circ)+\\cos^2x\\) 的定值。`);
        answers.push(`簡答：\\(\\frac32\\)。過程：展開兩個平方並相加，交叉項抵消，再用 \\(\\sin^2x+\\cos^2x=1\\)。`);
        continue;
      }
      if (mode === 3) {
        questions.push(
          `若 \\(\\tan A,\\tan B\\) 為方程式兩根，說明如何用和差角求 \\(\\frac{\\sin(A+B)}{\\cos A\\cos B}\\)。`
        );
        answers.push(
          `簡答：\\(\\tan A+\\tan B\\)。過程：\\(\\sin(A+B)=\\sin A\\cos B+\\cos A\\sin B\\)，除以 \\(\\cos A\\cos B\\) 得 \\(\\tan A+\\tan B\\)。`
        );
        continue;
      }
      questions.push(`計算 \\(\\cos(A+B)\\cos(A-B)\\) 並改寫成 \\(\\cos^2A\\) 與 \\(\\sin^2B\\) 的形式。`);
      answers.push(`簡答：\\(\\cos^2A-\\sin^2B\\)。過程：利用積化和差或直接展開 \\(\\cos(A+B)\\cos(A-B)\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312PositiveTanProductSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`計算 \\((1+\\tan21^\\circ)(1+\\tan24^\\circ)\\) 的值。`);
        answers.push(
          `簡答：2。過程：因 \\(21^\\circ+24^\\circ=45^\\circ\\)，由 \\(\\tan(\\alpha+\\beta)=1\\) 可整理為 \\((1+\\tan\\alpha)(1+\\tan\\beta)=2\\)。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(
          `求 \\((1+\\tan1^\\circ)(1+\\tan2^\\circ)\\cdots(1+\\tan44^\\circ)\\) 可表示為 \\(2^n\\)，求 \\(n\\)。`
        );
        answers.push(
          `簡答：22。過程：將 \\(k^\\circ\\) 與 \\((45-k)^\\circ\\) 配對，每對乘積為 2，另有 \\(1+\\tan45^\\circ=2\\) 的類比視題目範圍調整；本題 44 項配成 22 對。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`計算 \\(\\tan20^\\circ+\\tan40^\\circ+\\sqrt3\\tan20^\\circ\\tan40^\\circ\\)。`);
        answers.push(`簡答：\\(\\sqrt3\\)。過程：由 \\(\\tan(20^\\circ+40^\\circ)=\\sqrt3\\)，整理正切和公式。`);
        continue;
      }
      if (mode === 3) {
        questions.push(`計算 \\(\\tan80^\\circ-\\tan20^\\circ-\\sqrt3\\tan80^\\circ\\tan20^\\circ\\)。`);
        answers.push(`簡答：\\(\\sqrt3\\)。過程：由 \\(\\tan(80^\\circ-20^\\circ)=\\sqrt3\\)，整理正切差公式。`);
        continue;
      }
      questions.push(`設 \\(\\alpha-\\beta=225^\\circ\\)，求 \\((1+\\tan\\alpha)(1-\\tan\\beta)\\) 的值。`);
      answers.push(`簡答：2。過程：\\(\\tan225^\\circ=1\\)，代入 \\(\\tan(\\alpha-\\beta)\\) 並整理。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312GridAngleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`在正方形網格中，兩線斜率分別為 1 與 2，求夾角的正切值。`);
        answers.push(`簡答：\\(\\frac13\\)。過程：\\(\\tan\\phi=\\left|\\frac{2-1}{1+2}\\right|=\\frac13\\)。`);
        continue;
      }
      if (mode === 1) {
        questions.push(`已知正方形中一條對角線斜率為 1，另一條線斜率為 2，求兩線夾角的正切值。`);
        answers.push(`簡答：\\(\\frac13\\)。過程：用兩直線夾角公式，\\(m_1=1,m_2=2\\)。`);
        continue;
      }
      if (mode === 2) {
        questions.push(`三個相同正方形並排，求連結左下角到右上角所得直線與水平線的正切值。`);
        answers.push(`簡答：\\(\\frac13\\)。過程：高度為 1，水平距離為 3，所以斜率也是角的正切值。`);
        continue;
      }
      if (mode === 3) {
        questions.push(
          `在 \\(3\\times3\\) 網格中，一條線從 \\((0,0)\\) 到 \\((3,1)\\)，另一條從 \\((0,0)\\) 到 \\((1,3)\\)，求夾角正切值。`
        );
        answers.push(
          `簡答：\\(\\frac45\\)。過程：兩斜率為 \\(\\frac13\\) 與 3，代入 \\(\\left|\\frac{m_2-m_1}{1+m_1m_2}\\right|\\)。`
        );
        continue;
      }
      questions.push(`長方形內切一個直角三角形，兩銳角的正切分別為 \\(\\frac12\\) 與 \\(\\frac13\\)，求兩角和的正切。`);
      answers.push(`簡答：1。過程：\\(\\tan(A+B)=\\frac{\\frac12+\\frac13}{1-\\frac16}=1\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312DoubleHalfFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS312DoubleFromSingleSet,
        buildS312HalfAngleKnownSet,
        buildS312RadicalHalfSimplifySet,
        buildS312TanSubstitutionSet,
        buildS312QuadraticDoubleHalfSet,
      ],
      count
    );
  }

  function buildS312SumDifferenceFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS312SumDifferenceExactSet,
        buildS312CompoundQuadrantSet,
        buildS312InverseFormulaSet,
        buildS312TanEquationLineAngleSet,
        buildS312TriangleInteriorSet,
      ],
      count
    );
  }

  function buildS312TripleAngleFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS312TripleFromSingleSet,
        buildS312TripleProductSet,
        buildS312TriplePolynomialSet,
        buildS312Special1836Set,
        buildS312TripleExpressionSet,
      ],
      count
    );
  }

  function buildS312ApplicationFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS312RotationCoordinateSet,
        buildS312PositiveTanProductSet,
        buildS312AngleFormulaAlgebraSet,
        buildS312GridAngleSet,
        buildS312ProductValuesSet,
      ],
      count
    );
  }

  function buildS312DoubleFromSingleSubtypeSet(count) {
    return buildS312DoubleFromSingleSet(count);
  }

  function buildS312HalfAngleKnownSubtypeSet(count) {
    return buildS312HalfAngleKnownSet(count);
  }

  function buildS312RadicalHalfSimplifySubtypeSet(count) {
    return buildS312RadicalHalfSimplifySet(count);
  }

  function buildS312TanSubstitutionSubtypeSet(count) {
    return buildS312TanSubstitutionSet(count);
  }

  function buildS312QuadraticDoubleHalfSubtypeSet(count) {
    return buildS312QuadraticDoubleHalfSet(count);
  }

  function buildS312ProductValuesSubtypeSet(count) {
    return buildS312ProductValuesSet(count);
  }

  function buildS312SumDifferenceExactSubtypeSet(count) {
    return buildS312SumDifferenceExactSet(count);
  }

  function buildS312CompoundQuadrantSubtypeSet(count) {
    return buildS312CompoundQuadrantSet(count);
  }

  function buildS312InverseFormulaSubtypeSet(count) {
    return buildS312InverseFormulaSet(count);
  }

  function buildS312TanEquationLineAngleSubtypeSet(count) {
    return buildS312TanEquationLineAngleSet(count);
  }

  function buildS312TriangleInteriorSubtypeSet(count) {
    return buildS312TriangleInteriorSet(count);
  }

  function buildS312RotationCoordinateSubtypeSet(count) {
    return buildS312RotationCoordinateSet(count);
  }

  function buildS312TripleFromSingleSubtypeSet(count) {
    return buildS312TripleFromSingleSet(count);
  }

  function buildS312TripleProductSubtypeSet(count) {
    return buildS312TripleProductSet(count);
  }

  function buildS312TriplePolynomialSubtypeSet(count) {
    return buildS312TriplePolynomialSet(count);
  }

  function buildS312Special1836SubtypeSet(count) {
    return buildS312Special1836Set(count);
  }

  function buildS312TripleExpressionSubtypeSet(count) {
    return buildS312TripleExpressionSet(count);
  }

  function buildS312PositiveTanProductSubtypeSet(count) {
    return buildS312PositiveTanProductSet(count);
  }

  function buildS312AngleFormulaAlgebraSubtypeSet(count) {
    return buildS312AngleFormulaAlgebraSet(count);
  }

  function buildS312GridAngleSubtypeSet(count) {
    return buildS312GridAngleSet(count);
  }

  function buildS312SinCosSumSquareSet(count) {
    // 已知 sinA+sinB=p 且 cosA+cosB=q，求 cos(A-B)
    // 公式：(p)²+(q)² = 2+2cos(A-B)，故 cos(A-B)=(p²+q²-2)/2
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cases = [
      { p: '\\frac{\\sqrt{6}}{2}', q: '\\frac{\\sqrt{2}}{2}', pSq: '\\frac{3}{2}', qSq: '\\frac{1}{2}', sumSq: '2', cosAB: '0' },
      { p: '1',                         q: '1',                         pSq: '1',             qSq: '1',             sumSq: '2', cosAB: '0' },
      { p: '\\sqrt{2}',               q: '0',                         pSq: '2',             qSq: '0',             sumSq: '2', cosAB: '0' },
      { p: '0',                         q: '\\sqrt{2}',               pSq: '0',             qSq: '2',             sumSq: '2', cosAB: '0' },
      { p: '\\frac{1}{2}',            q: '\\frac{\\sqrt{3}}{2}',  pSq: '\\frac{1}{4}', qSq: '\\frac{3}{4}', sumSq: '1', cosAB: '-\\frac{1}{2}' },
      { p: '\\frac{\\sqrt{2}}{2}',  q: '\\frac{\\sqrt{2}}{2}',  pSq: '\\frac{1}{2}', qSq: '\\frac{1}{2}', sumSq: '1', cosAB: '-\\frac{1}{2}' },
      { p: '1',                         q: '0',                         pSq: '1',             qSq: '0',             sumSq: '1', cosAB: '-\\frac{1}{2}' },
      { p: '\\sqrt{2}',               q: '1',                         pSq: '2',             qSq: '1',             sumSq: '3', cosAB: '\\frac{1}{2}' },
      { p: '1',                         q: '\\sqrt{2}',               pSq: '1',             qSq: '2',             sumSq: '3', cosAB: '\\frac{1}{2}' },
      { p: '\\sqrt{3}',               q: '1',                         pSq: '3',             qSq: '1',             sumSq: '4', cosAB: '1' },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = s242Pick(cases);
      if (i % 2 === 0) {
        questions.push(`已知 \\(\\sin A+\\sin B=${item.p}\\)，\\(\\cos A+\\cos B=${item.q}\\)，求 \\(\\cos(A-B)\\)。`);
        answers.push(`簡答：\\(${item.cosAB}\\)。過程：兩式平方後相加，\\((${item.p})^2+(${item.q})^2=${item.pSq}+${item.qSq}=${item.sumSq}\\)。展開左邊得 \\(2+2\\cos(A-B)=${item.sumSq}\\)，因此 \\(\\cos(A-B)=${item.cosAB}\\)。`);
      } else {
        questions.push(`已知 \\(\\sin x+\\sin y=${item.p}\\)，\\(\\cos x+\\cos y=${item.q}\\)，求 \\(\\cos(x-y)\\)。`);
        answers.push(`簡答：\\(${item.cosAB}\\)。過程：\\((\\sin x+\\sin y)^2+(\\cos x+\\cos y)^2=2+2\\cos(x-y)\\)，代入得 \\(2+2\\cos(x-y)=${item.sumSq}\\)，所以 \\(\\cos(x-y)=${item.cosAB}\\)。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312SinCosSumSquareSubtypeSet(count) {
    return buildS312SinCosSumSquareSet(count);
  }

  function s313Pick(items) {
    return items[randInt(0, items.length - 1)];
  }

  function s313Pi(num, den = 1) {
    const f = makeFraction(num, den);
    if (f.num === 0) return '0';
    const sign = f.num < 0 ? '-' : '';
    const absNum = Math.abs(f.num);
    if (f.den === 1) {
      if (absNum === 1) return `${sign}\\pi`;
      return `${sign}${absNum}\\pi`;
    }
    if (absNum === 1) return `${sign}\\frac{\\pi}{${f.den}}`;
    return `${sign}\\frac{${absNum}\\pi}{${f.den}}`;
  }

  function s313ShiftText(hNum, hDen = 1) {
    const h = makeFraction(hNum, hDen);
    if (h.num === 0) return 'x';
    const body = s313Pi(Math.abs(h.num), h.den);
    return h.num > 0 ? `x-${body}` : `x+${body}`;
  }

  function s313Arg(k, hNum = 0, hDen = 1) {
    const shift = s313ShiftText(hNum, hDen);
    if (hNum === 0) return k === 1 ? 'x' : `${k}x`;
    return k === 1 ? shift : `${k}(${shift})`;
  }

  function s313SignedNumber(n) {
    if (n === 0) return '';
    return n > 0 ? `+${n}` : `${n}`;
  }

  function s313RangeText(a, d) {
    const low = d - Math.abs(a);
    const high = d + Math.abs(a);
    return `\\([${low},${high}]\\)`;
  }

  function s313FuncText(kind, a, arg, d = 0) {
    const coeff = a === 1 ? '' : a === -1 ? '-' : `${a}`;
    return `y=${coeff}\\${kind}(${arg})${s313SignedNumber(d)}`;
  }

  function buildS313PeriodAmplitudeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const kind = s313Pick(['sin', 'cos', 'tan']);
      const k = s313Pick([2, 3, 4, 5, 6]);
      const a = kind === 'tan' ? s313Pick([1, -1, 2, -2]) : s313Pick([2, -2, 3, -3, 4, -4, 5]);
      const h = s313Pick([
        [0, 1],
        [1, 6],
        [1, 4],
        [1, 3],
        [-1, 6],
      ]);
      const d = s313Pick([-3, -1, 0, 2, 4]);
      const period = kind === 'tan' ? s313Pi(1, k) : s313Pi(2, k);
      const f = s313FuncText(kind, a, s313Arg(k, h[0], h[1]), d);
      if (kind === 'tan') {
        questions.push(`求函數 \\(${f}\\) 的最小正週期。`);
        answers.push(
          `簡答：\\(${period}\\)。過程：正切函數 \\(\\tan x\\) 的基本週期為 \\(\\pi\\)，內部角為 \\(${k}\\) 倍，所以週期為 \\(\\frac{\\pi}{${k}}\\)。外部的係數與上下平移不改變週期。`
        );
      } else {
        questions.push(`求函數 \\(${f}\\) 的振幅與最小正週期。`);
        answers.push(
          `簡答：振幅 \\(${Math.abs(a)}\\)，週期 \\(${period}\\)。過程：\\(\\sin\\) 與 \\(\\cos\\) 的振幅為外部係數絕對值 \\(|${a}|=${Math.abs(a)}\\)，基本週期 \\(2\\pi\\) 被內部係數 ${k} 壓縮為 \\(\\frac{2\\pi}{${k}}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313TransformEquationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const bases = ['sin', 'cos', 'tan'];
    for (let i = 0; i < count; i += 1) {
      const kind = s313Pick(bases);
      const k = s313Pick([1, 2, 3, 4]);
      const h = s313Pick([
        [1, 6],
        [1, 4],
        [1, 3],
        [-1, 4],
        [0, 1],
      ]);
      const a = s313Pick([2, 3, -2, -3]);
      const d = s313Pick([-2, -1, 1, 3]);
      const f = s313FuncText(kind, a, s313Arg(k, h[0], h[1]), d);
      questions.push(
        `將 \\(y=\\${kind} x\\) 的圖形水平位移 \\(${s313Pi(h[0], h[1])}\\)，再將振幅或縱向伸縮倍數變為 \\(${a}\\)，最後上下平移 ${d} 單位，求新函數。`
      );
      answers.push(
        `簡答：\\(${f}\\)。過程：水平位移寫成 \\(x-h\\)，內部若再作 ${k} 倍水平壓縮則成 \\(${s313Arg(k, h[0], h[1])}\\)；外部乘上 ${a}，再加上 ${d}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313SymmetrySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const kind = s313Pick(['sin', 'cos']);
      const k = s313Pick([1, 2, 3, 4]);
      const h = s313Pick([
        [0, 1],
        [1, 6],
        [1, 4],
        [1, 3],
      ]);
      const d = s313Pick([-2, 0, 3]);
      const a = s313Pick([2, -3, 4]);
      const f = s313FuncText(kind, a, s313Arg(k, h[0], h[1]), d);
      if (kind === 'cos') {
        questions.push(`求函數 \\(${f}\\) 的一族對稱軸方程式。`);
        answers.push(
          `簡答：\\(x=${s313Pi(h[0], h[1])}+\\frac{n\\pi}{${k}}\\)，\\(n\\in\\mathbb Z\\)。過程：\\(\\cos\\) 的波峰、波谷都落在對稱軸上；令內部角為 \\(n\\pi\\)，解得 \\(x=h+\\frac{n\\pi}{${k}}\\)。`
        );
      } else {
        questions.push(`求函數 \\(${f}\\) 的一族對稱中心。`);
        answers.push(
          `簡答：\\((${s313Pi(h[0], h[1])}+\\frac{n\\pi}{${k}},${d})\\)，\\(n\\in\\mathbb Z\\)。過程：\\(\\sin\\) 圖形的平衡點是對稱中心；令內部角為 \\(n\\pi\\)，函數值回到中線 \\(y=${d}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313AbsolutePeriodSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const kind = s313Pick(['sin', 'cos']);
      const k = s313Pick([1, 2, 3, 4, 5]);
      const period = s313Pi(1, k);
      questions.push(`求函數 \\(y=|\\${kind} ${k === 1 ? 'x' : `${k}x`}|\\) 的最小正週期。`);
      answers.push(
        `簡答：\\(${period}\\)。過程：原本 \\(\\${kind}\\) 的週期為 \\(\\frac{2\\pi}{${k}}\\)，加絕對值後上下兩半波重合，週期減半為 \\(\\frac{\\pi}{${k}}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313MonotonicIntervalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const k = s313Pick([1, 2, 3, 4]);
      const sign = s313Pick([1, -1]);
      const end = s313Pi(1, k);
      const mid = s313Pi(1, 2 * k);
      const body = k === 1 ? 'x' : `${k}x`;
      if (sign > 0) {
        questions.push(`在區間 \\([0,${end}]\\) 內，寫出函數 \\(y=\\sin ${body}\\) 的遞增區間與遞減區間。`);
        answers.push(
          `簡答：遞增 \\([0,${mid}]\\)，遞減 \\([${mid},${end}]\\)。過程：令 \\(u=${body}\\)，當 \\(u\\) 從 0 到 \\(\\frac{\\pi}{2}\\) 時 \\(\\sin u\\) 遞增；從 \\(\\frac{\\pi}{2}\\) 到 \\(\\pi\\) 時遞減，再把 \\(u\\) 換回 \\(x\\)。`
        );
      } else {
        questions.push(`在區間 \\([0,${end}]\\) 內，寫出函數 \\(y=-\\sin ${body}\\) 的遞增區間與遞減區間。`);
        answers.push(
          `簡答：遞增 \\([${mid},${end}]\\)，遞減 \\([0,${mid}]\\)。過程：\\(-\\sin u\\) 會把 \\(\\sin u\\) 的增減方向上下翻轉；原本先增後減，因此翻轉後先減後增。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313ExtremaRangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const kind = s313Pick(['sin', 'cos']);
      const a = s313Pick([2, -2, 3, -4, 5]);
      const k = s313Pick([1, 2, 3, 4]);
      const d = s313Pick([-3, -1, 0, 2, 5]);
      const f = s313FuncText(kind, a, s313Arg(k), d);
      questions.push(`求函數 \\(${f}\\) 的最大值、最小值與值域。`);
      answers.push(
        `簡答：最大值 ${d + Math.abs(a)}，最小值 ${d - Math.abs(a)}，值域 ${s313RangeText(a, d)}。過程：\\(\\${kind}\\) 的值域為 \\([-1,1]\\)，乘上 ${a} 後上下幅度為 ${Math.abs(a)}，再平移到中線 \\(y=${d}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313RestrictedRangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = s313Pick([2, 3, -2, -3, 4]);
      const d = s313Pick([-2, 0, 1, 3]);
      const low = Math.min(d, d + a);
      const high = Math.max(d, d + a);
      questions.push(
        `在區間 \\([0,\\pi]\\) 內，求 \\(y=${a === 1 ? '' : a === -1 ? '-' : a}\\sin x${s313SignedNumber(d)}\\) 的值域。`
      );
      answers.push(
        `簡答：\\([${low},${high}]\\)。過程：在 \\([0,\\pi]\\) 內，\\(\\sin x\\) 的值域為 \\([0,1]\\)。代入 \\(y=${a}\\sin x${s313SignedNumber(d)}\\)，端點與最高點給出值域。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313RootCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const constants = [
      { text: '0', per: 2 },
      { text: '\\frac12', per: 2 },
      { text: '-\\frac12', per: 2 },
      { text: '1', per: 1 },
      { text: '-1', per: 1 },
    ];
    for (let i = 0; i < count; i += 1) {
      const k = s313Pick([1, 2, 3, 4]);
      const c = s313Pick(constants);
      const total = c.per * k;
      questions.push(
        `在區間 \\([0,2\\pi)\\) 內，判定方程式 \\(\\sin ${k === 1 ? 'x' : `${k}x`}=${c.text}\\) 有幾個實根。`
      );
      answers.push(
        `簡答：${total} 個。過程：\\(\\sin u=${c.text}\\) 在一個週期 \\([0,2\\pi)\\) 內有 ${c.per} 個解；\\(u=${k === 1 ? 'x' : `${k}x`}\\) 讓 \\([0,2\\pi)\\) 內包含 ${k} 個完整週期，所以共有 ${total} 個。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313EquationCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 2;
      const k = s313Pick([1, 2, 3, 4]);
      if (mode === 0) {
        questions.push(
          `在區間 \\([0,2\\pi)\\) 內，方程式 \\(|\\cos ${k === 1 ? 'x' : `${k}x`}|=\\frac12\\) 有幾個解？`
        );
        answers.push(
          `簡答：${4 * k} 個。過程：\\(|\\cos u|=\\frac12\\) 在一個週期內有 4 個解，\\(u=${k === 1 ? 'x' : `${k}x`}\\) 造成 ${k} 個完整週期。`
        );
      } else {
        const m = s313Pick([-2, -1, 1, 2, 3]);
        questions.push(`在區間 \\([0,2\\pi)\\) 內，方程式 \\(\\tan ${k === 1 ? 'x' : `${k}x`}=${m}\\) 有幾個解？`);
        answers.push(
          `簡答：${2 * k} 個。過程：\\(\\tan u=${m}\\) 每個長度 \\(\\pi\\) 的週期有 1 個解；\\(u=${k === 1 ? 'x' : `${k}x`}\\) 在 \\([0,2\\pi)\\) 內走過 ${2 * k} 個正切週期。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313ExactComparisonSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const angles = [
      { a: '\\frac{\\pi}{6}', s: '\\frac12', c: '\\frac{\\sqrt3}{2}', type: 'half' },
      { a: '\\frac{\\pi}{4}', s: '\\frac{\\sqrt2}{2}', c: '\\frac{\\sqrt2}{2}', type: 'sqrt2' },
      { a: '\\frac{\\pi}{3}', s: '\\frac{\\sqrt3}{2}', c: '\\frac12', type: 'sqrt3' },
    ];
    function specialValue(k, type) {
      if (type === 'half') return fractionToLatex(makeFraction(k + 2, 2));
      if (type === 'sqrt2') {
        if (k === 1) return `1+\\frac{\\sqrt2}{2}`;
        if (k === 2) return `1+\\sqrt2`;
        return `1+\\frac{${k}\\sqrt2}{2}`;
      }
      if (k === 1) return `1+\\frac{\\sqrt3}{2}`;
      if (k === 2) return `1+\\sqrt3`;
      return `1+\\frac{${k}\\sqrt3}{2}`;
    }
    for (let i = 0; i < count; i += 1) {
      const item = s313Pick(angles);
      const k = s313Pick([1, 2, 3]);
      const value = specialValue(k, item.type);
      const coeff = k === 1 ? '' : `${k}`;
      const mult = k === 1 ? item.s : `${k}\\cdot ${item.s}`;
      questions.push(
        `設 \\(f(x)=${coeff}\\sin x+1\\)，求 \\(f(${item.a})\\)，並判斷 \\(\\sin ${item.a}\\) 與 \\(\\cos ${item.a}\\) 的大小。`
      );
      answers.push(
        `簡答：\\(f(${item.a})=${value}\\)。過程：直接代入特殊角；\\(${item.a}\\) 的正弦值為 \\(${item.s}\\)，餘弦值為 \\(${item.c}\\)，所以 \\(f(${item.a})=${mult}+1=${value}\\)，再比較正弦與餘弦的大小。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313GraphParameterSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = s313Pick([2, 3, 4, 5]);
      const d = s313Pick([-2, 0, 3]);
      const k = s313Pick([1, 2, 3, 4]);
      const max = d + a;
      const min = d - a;
      const period = s313Pi(2, k);
      questions.push(
        `某正弦函數可寫成 \\(y=a\\sin bx+d\\)，其最大值為 ${max}、最小值為 ${min}、最小正週期為 \\(${period}\\)。求 \\(a,d,b\\) 的一組可能值。`
      );
      answers.push(
        `簡答：\\(a=${a},d=${d},b=${k}\\)。過程：振幅 \\(a=\\frac{${max}-(${min})}{2}=${a}\\)，中線 \\(d=\\frac{${max}+(${min})}{2}=${d}\\)；週期 \\(\\frac{2\\pi}{b}=${period}\\)，所以 \\(b=${k}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313PeakValleySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = s313Pick([2, 3, 4]);
      const d = s313Pick([-1, 0, 2]);
      const k = s313Pick([1, 2, 3]);
      const peakX = s313Pi(1, 2 * k);
      const valleyX = s313Pi(3, 2 * k);
      questions.push(
        `一個函數形如 \\(y=a\\sin bx+d\\)，已知波峰在 \\((${peakX},${d + a})\\)，相鄰波谷在 \\((${valleyX},${d - a})\\)。求此函數。`
      );
      answers.push(
        `簡答：\\(y=${a}\\sin ${k === 1 ? 'x' : `${k}x`}${s313SignedNumber(d)}\\)。過程：波峰與波谷的中線為 \\(y=${d}\\)，振幅為 ${a}；\\(\\sin bx\\) 的第一個波峰在 \\(x=\\frac{\\pi}{2b}\\)，由 \\(${peakX}\\) 得 \\(b=${k}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313FerrisModelSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const r = s313Pick([10, 15, 20, 30]);
      const low = s313Pick([2, 5, 8]);
      const minutes = s313Pick([4, 5, 6, 10]);
      const center = low + r;
      questions.push(
        `摩天輪半徑 ${r} 公尺，最低點離地 ${low} 公尺，轉一圈 ${minutes} 分鐘。若乘客從最低點開始，寫出高度 \\(h(t)\\) 與時間 \\(t\\)（分鐘）的函數式。`
      );
      answers.push(
        `簡答：\\(h(t)=${center}-${r}\\cos\\frac{2\\pi t}{${minutes}}\\)。過程：中線高度為 ${center}，振幅為 ${r}，角速度為 \\(\\frac{2\\pi}{${minutes}}\\)。從最低點開始，所以用 \\(-\\cos\\) 表示。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313ClockPendulumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const len = s313Pick([6, 8, 10, 12]);
      const minutes = s313Pick([10, 15, 20, 30]);
      const theta = s313Pi(minutes, 30);
      const area = simplifyFraction(len * len * minutes, 60);
      questions.push(`分針長 ${len} 公分，從某時刻開始經過 ${minutes} 分鐘，求分針掃過的扇形面積。`);
      answers.push(
        `簡答：\\(${fractionToLatex(area)}\\pi\\) 平方公分。過程：${minutes} 分鐘對應圓心角 \\(${theta}\\) 弧度，扇形面積為 \\(\\frac12 r^2\\theta=\\frac12\\cdot${len}^2\\cdot ${theta}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313ReverseTransformSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const kind = s313Pick(['sin', 'cos']);
      const a = s313Pick([2, 3, 4]);
      const k = s313Pick([2, 3, 4]);
      const h = s313Pick([
        [1, 6],
        [1, 4],
        [1, 3],
      ]);
      const d = s313Pick([-2, 1, 3]);
      const f = s313FuncText(kind, a, s313Arg(k, h[0], h[1]), d);
      questions.push(`函數 \\(y=\\${kind} x\\) 經過水平壓縮、平移與縱向變換後得到 \\(${f}\\)。說明其變換步驟。`);
      answers.push(
        `簡答：水平壓縮為原來的 \\(\\frac1{${k}}\\) 倍，向右平移 \\(${s313Pi(h[0], h[1])}\\)，縱向伸縮 ${a} 倍，並上下平移 ${d} 單位。過程：由內部 \\(${s313Arg(k, h[0], h[1])}\\) 讀出水平變換，由外部係數 ${a} 與常數 ${d} 讀出縱向變換。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313PeriodTransformFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS313PeriodAmplitudeSet,
        buildS313TransformEquationSet,
        buildS313SymmetrySet,
        buildS313AbsolutePeriodSet,
        buildS313MonotonicIntervalSet,
      ],
      count
    );
  }

  function buildS313RangeEquationFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS313ExtremaRangeSet,
        buildS313RestrictedRangeSet,
        buildS313RootCountSet,
        buildS313EquationCountSet,
        buildS313ExactComparisonSet,
      ],
      count
    );
  }

  function buildS313ParameterModelFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS313GraphParameterSet,
        buildS313PeakValleySet,
        buildS313FerrisModelSet,
        buildS313ClockPendulumSet,
        buildS313ReverseTransformSet,
      ],
      count
    );
  }

  function buildS313PeriodAmplitudeSubtypeSet(count) {
    return buildS313PeriodAmplitudeSet(count);
  }

  function buildS313TransformEquationSubtypeSet(count) {
    return buildS313TransformEquationSet(count);
  }

  function buildS313SymmetrySubtypeSet(count) {
    return buildS313SymmetrySet(count);
  }

  function buildS313AbsolutePeriodSubtypeSet(count) {
    return buildS313AbsolutePeriodSet(count);
  }

  function buildS313MonotonicIntervalSubtypeSet(count) {
    return buildS313MonotonicIntervalSet(count);
  }

  function buildS313ExtremaRangeSubtypeSet(count) {
    return buildS313ExtremaRangeSet(count);
  }

  function buildS313RestrictedRangeSubtypeSet(count) {
    return buildS313RestrictedRangeSet(count);
  }

  function buildS313RootCountSubtypeSet(count) {
    return buildS313RootCountSet(count);
  }

  function buildS313EquationCountSubtypeSet(count) {
    return buildS313EquationCountSet(count);
  }

  function buildS313ExactComparisonSubtypeSet(count) {
    return buildS313ExactComparisonSet(count);
  }

  function buildS313GraphParameterSubtypeSet(count) {
    return buildS313GraphParameterSet(count);
  }

  function buildS313PeakValleySubtypeSet(count) {
    return buildS313PeakValleySet(count);
  }

  function buildS313FerrisModelSubtypeSet(count) {
    return buildS313FerrisModelSet(count);
  }

  function buildS313ClockPendulumSubtypeSet(count) {
    return buildS313ClockPendulumSet(count);
  }

  function buildS313ReverseTransformSubtypeSet(count) {
    return buildS313ReverseTransformSet(count);
  }

  function s314TrigTerm(coeff, trig, first = false) {
    if (coeff === 0) return '';
    const sign = coeff < 0 ? '-' : first ? '' : '+';
    const abs = Math.abs(coeff);
    const body = abs === 1 ? `\\${trig} x` : `${abs}\\${trig} x`;
    return `${sign}${body}`;
  }

  function s314CoeffBody(coeff, body, first = false) {
    if (coeff === 0) return '';
    const sign = coeff < 0 ? '-' : first ? '' : '+';
    const abs = Math.abs(coeff);
    return `${sign}${abs === 1 ? body : `${abs}${body}`}`;
  }

  function s314ComboText(a, b, c = 0) {
    const first = s314TrigTerm(a, 'sin', true);
    const second = s314TrigTerm(b, 'cos', !first);
    const base = `${first}${second}` || '0';
    return `${base}${s313SignedNumber(c)}`;
  }

  function s314Triple() {
    return s313Pick([
      [3, 4, 5],
      [5, 12, 13],
      [8, 15, 17],
      [7, 24, 25],
    ]);
  }

  function s314MaxMinText(maxValue, minValue) {
    return `最大值 ${maxValue}，最小值 ${minValue}`;
  }

  function s314Root2LinearText(integerPart, rootCoeff) {
    const terms = [];
    if (integerPart !== 0) terms.push(`${integerPart}`);
    if (rootCoeff !== 0) {
      const abs = Math.abs(rootCoeff);
      const rootTerm = abs === 1 ? '\\sqrt2' : `${abs}\\sqrt2`;
      if (terms.length === 0) {
        terms.push(rootCoeff < 0 ? `-${rootTerm}` : rootTerm);
      } else {
        terms.push(`${rootCoeff < 0 ? '-' : '+'}${rootTerm}`);
      }
    }
    return terms.join('') || '0';
  }

  function s314ValueText(numerator, denominator = 1) {
    const value = simplifyFraction(numerator, denominator);
    if (value.den === 1) return `${value.num}`;
    const sign = value.num < 0 ? '-' : '';
    return `${sign}\\frac{${Math.abs(value.num)}}{${value.den}}`;
  }

  function s314TrigArgument(variable, multiple) {
    return multiple === 1 ? variable : `${multiple}${variable}`;
  }

  function s314CoeffParen(coeff, body) {
    if (coeff === 1) return body;
    if (coeff === -1) return `-${body}`;
    return `${coeff}${body}`;
  }

  function buildS314BasicComboExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const [p, q, r] = s314Triple();
      const signA = s313Pick([1, -1]);
      const signB = s313Pick([1, -1]);
      const a = signA * p;
      const b = signB * q;
      const c = s313Pick([-5, -2, 0, 3, 7]);
      questions.push(`求函數 \\(y=${s314ComboText(a, b, c)}\\) 的最大值與最小值。`);
      answers.push(
        `簡答：${s314MaxMinText(c + r, c - r)}。過程：把 \\(${s314ComboText(a, b)}\\) 疊合成 \\(${r}\\sin(x+\\theta)\\)，其中 \\(\\cos\\theta=${formatFraction(a, r)}\\)、\\(\\sin\\theta=${formatFraction(b, r)}\\)。因此原函數值域為 \\([${c - r},${c + r}]\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS314RestrictedRangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = s313Pick([1, 2, 3, 4]);
      const c = s313Pick([-3, 0, 2]);
      const mode = i % 2;
      if (mode === 0) {
        questions.push(
          `在 \\(0\\le x\\le \\frac{\\pi}{2}\\) 範圍內，求 \\(y=${a}(\\sin x+\\cos x)${s313SignedNumber(c)}\\) 的最大值與最小值。`
        );
        answers.push(
          `簡答：最大值 \\(${s314Root2LinearText(c, a)}\\)，最小值 ${c + a}。過程：\\(\\sin x+\\cos x=\\sqrt2\\sin(x+\\frac\\pi4)\\)。在此區間內，\\(\\sin x+\\cos x\\) 的最大值為 \\(\\sqrt2\\)，兩端點的值都為 1，所以代回即可。`
        );
      } else {
        questions.push(
          `在 \\(-\\frac{\\pi}{4}\\le x\\le \\frac{\\pi}{4}\\) 範圍內，求 \\(y=${a}(\\sin x+\\cos x)${s313SignedNumber(c)}\\) 的值域。`
        );
        answers.push(
          `簡答：\\([${c},${s314Root2LinearText(c, a)}]\\)。過程：令 \\(t=x+\\frac\\pi4\\)，則 \\(t\\in[0,\\frac\\pi2]\\)，\\(\\sin x+\\cos x=\\sqrt2\\sin t\\)，所以範圍從 0 到 \\(\\sqrt2\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS314QuadraticReductionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const [p, q, r] = s314Triple();
      const base = s313Pick([1, 3, 5]);
      const a = base;
      const c = base + 2 * p;
      const b = 2 * q;
      const mid = base + p;
      const expr = `${s314CoeffBody(a, '\\sin^2x', true)}${s314CoeffBody(b, '\\sin x\\cos x')}${s314CoeffBody(c, '\\cos^2x')}`;
      questions.push(`求 \\(y=${expr}\\) 的最大值與最小值。`);
      answers.push(
        `簡答：最大值 ${mid + r}，最小值 ${mid - r}。過程：用 \\(\\sin^2x=\\frac{1-\\cos2x}{2}\\)、\\(\\cos^2x=\\frac{1+\\cos2x}{2}\\)、\\(\\sin x\\cos x=\\frac12\\sin2x\\)，可化為 \\(${mid}+${p}\\cos2x+${q}\\sin2x\\)，振幅為 \\(\\sqrt{${p}^2+${q}^2}=${r}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS314SubstitutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const m = s313Pick([1, 2]);
      const n = s313Pick([1, 2]);
      const linearPart = s314CoeffParen(m, '(\\sin x+\\cos x)');
      const tLinearPart = s314CoeffBody(m, 't');
      questions.push(`令 \\(t=\\sin x+\\cos x\\)，求函數 \\(y=(\\sin x+\\cos x)^2+${linearPart}+${n}\\) 的最小值。`);
      answers.push(
        `簡答：\\(${s314ValueText(4 * n - m * m, 4)}\\)。過程：令 \\(t=\\sin x+\\cos x\\)，則 \\(t\\in[-\\sqrt2,\\sqrt2]\\)，原式成 \\(t^2${tLinearPart}+${n}\\)。頂點 \\(t=-\\frac{${m}}{2}\\) 落在範圍內，所以最小值為 \\(${n}-\\frac{${m * m}}{4}=${s314ValueText(4 * n - m * m, 4)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS314FractionalExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = s313Pick([1, 2, 3]);
      const b = s313Pick([1, 2]);
      const c = s313Pick([3, 4, 5]);
      const d = s313Pick([1, 2]);
      const f1 = simplifyFraction(a - b, c - d);
      const f2 = simplifyFraction(a + b, c + d);
      const values = [f1, f2].sort((x, y) => x.num / x.den - y.num / y.den);
      const numerator = `${a}${s314CoeffBody(b, '\\sin x')}`;
      const denominator = `${c}${s314CoeffBody(d, '\\sin x')}`;
      const numeratorU = `${a}${s314CoeffBody(b, 'u')}`;
      const denominatorU = `${c}${s314CoeffBody(d, 'u')}`;
      questions.push(`求函數 \\(f(x)=\\frac{${numerator}}{${denominator}}\\) 的最大值與最小值。`);
      answers.push(
        `簡答：最大值 \\(${s314ValueText(values[1].num, values[1].den)}\\)，最小值 \\(${s314ValueText(values[0].num, values[0].den)}\\)。過程：令 \\(u=\\sin x\\)，\\(-1\\le u\\le1\\)，且分母 \\(${denominatorU}\\) 恆為正。分式 \\(\\frac{${numeratorU}}{${denominatorU}}\\) 在此區間單調，因此只需比較 \\(u=-1,1\\) 的值。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS314ParameterInverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const [a0, b0, r] = s314Triple();
      const k = s313Pick([1, 2, 3, 4]);
      const d = s313Pick([-3, 0, 5]);
      const max = d + r;
      const min = d - r;
      const period = s313Pi(2, k);
      questions.push(
        `設 \\(f(x)=a\\sin kx+b\\cos kx+c\\)，已知週期為 \\(${period}\\)、最大值為 ${max}、最小值為 ${min}，且 \\(a=${a0}\\)、\\(b>0\\)。求 \\(b,c\\) 與 \\(k\\)。`
      );
      answers.push(
        `簡答：\\(b=${b0},c=${d},k=${k}\\)。過程：最大最小值給出振幅 \\(R=\\frac{${max}-(${min})}{2}=${r}\\)，中線 \\(c=\\frac{${max}+(${min})}{2}=${d}\\)。又 \\(R^2=a^2+b^2\\)，所以 \\(b=\\sqrt{${r}^2-${a0}^2}=${b0}\\)。週期 \\(\\frac{2\\pi}{k}=${period}\\)，因此 \\(k=${k}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS314EquationSolvingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const sinCases = [
      { c: '0',                          ans: '0,\\pi',                               hint: '\\(\\sin\\theta=0\\) 在 \\([0,2\\pi)\\) 時 \\(\\theta=0,\\pi\\)。' },
      { c: '\\frac{1}{2}',             ans: '\\frac{\\pi}{6},\\frac{5\\pi}{6}', hint: '基本角 \\(\\frac{\\pi}{6}\\)，第二象限解 \\(\\pi-\\frac{\\pi}{6}=\\frac{5\\pi}{6}\\)。' },
      { c: '-\\frac{1}{2}',            ans: '\\frac{7\\pi}{6},\\frac{11\\pi}{6}', hint: '第三象限 \\(\\pi+\\frac{\\pi}{6}\\)，第四象限 \\(2\\pi-\\frac{\\pi}{6}\\)。' },
      { c: '\\frac{\\sqrt{2}}{2}',   ans: '\\frac{\\pi}{4},\\frac{3\\pi}{4}', hint: '基本角 \\(\\frac{\\pi}{4}\\)，第二象限解 \\(\\pi-\\frac{\\pi}{4}=\\frac{3\\pi}{4}\\)。' },
      { c: '-\\frac{\\sqrt{2}}{2}',  ans: '\\frac{5\\pi}{4},\\frac{7\\pi}{4}', hint: '第三象限 \\(\\pi+\\frac{\\pi}{4}\\)，第四象限 \\(2\\pi-\\frac{\\pi}{4}\\)。' },
      { c: '\\frac{\\sqrt{3}}{2}',   ans: '\\frac{\\pi}{3},\\frac{2\\pi}{3}', hint: '基本角 \\(\\frac{\\pi}{3}\\)，第二象限解 \\(\\pi-\\frac{\\pi}{3}=\\frac{2\\pi}{3}\\)。' },
      { c: '-\\frac{\\sqrt{3}}{2}',  ans: '\\frac{4\\pi}{3},\\frac{5\\pi}{3}', hint: '第三象限 \\(\\pi+\\frac{\\pi}{3}\\)，第四象限 \\(2\\pi-\\frac{\\pi}{3}\\)。' },
      { c: '1',                          ans: '\\frac{\\pi}{2}',                     hint: '\\(\\sin\\theta=1\\) 只有唯一解 \\(\\frac{\\pi}{2}\\)。' },
      { c: '-1',                         ans: '\\frac{3\\pi}{2}',                    hint: '\\(\\sin\\theta=-1\\) 只有唯一解 \\(\\frac{3\\pi}{2}\\)。' },
    ];
    const cosCases = [
      { c: '0',                          ans: '\\frac{\\pi}{2},\\frac{3\\pi}{2}', hint: '\\(\\cos\\theta=0\\) 在 \\([0,2\\pi)\\) 時 \\(\\theta=\\frac{\\pi}{2},\\frac{3\\pi}{2}\\)。' },
      { c: '\\frac{1}{2}',             ans: '\\frac{\\pi}{3},\\frac{5\\pi}{3}', hint: '第一象限 \\(\\frac{\\pi}{3}\\)，第四象限 \\(2\\pi-\\frac{\\pi}{3}=\\frac{5\\pi}{3}\\)。' },
      { c: '-\\frac{1}{2}',            ans: '\\frac{2\\pi}{3},\\frac{4\\pi}{3}', hint: '第二象限 \\(\\pi-\\frac{\\pi}{3}\\)，第三象限 \\(\\pi+\\frac{\\pi}{3}\\)。' },
      { c: '\\frac{\\sqrt{2}}{2}',   ans: '\\frac{\\pi}{4},\\frac{7\\pi}{4}', hint: '第一象限 \\(\\frac{\\pi}{4}\\)，第四象限 \\(2\\pi-\\frac{\\pi}{4}=\\frac{7\\pi}{4}\\)。' },
      { c: '-\\frac{\\sqrt{2}}{2}',  ans: '\\frac{3\\pi}{4},\\frac{5\\pi}{4}', hint: '第二象限 \\(\\pi-\\frac{\\pi}{4}\\)，第三象限 \\(\\pi+\\frac{\\pi}{4}\\)。' },
      { c: '\\frac{\\sqrt{3}}{2}',   ans: '\\frac{\\pi}{6},\\frac{11\\pi}{6}', hint: '第一象限 \\(\\frac{\\pi}{6}\\)，第四象限 \\(2\\pi-\\frac{\\pi}{6}=\\frac{11\\pi}{6}\\)。' },
      { c: '-\\frac{\\sqrt{3}}{2}',  ans: '\\frac{5\\pi}{6},\\frac{7\\pi}{6}', hint: '第二象限 \\(\\pi-\\frac{\\pi}{6}\\)，第三象限 \\(\\pi+\\frac{\\pi}{6}\\)。' },
      { c: '1',                          ans: '0',                                        hint: '\\(\\cos\\theta=1\\) 只有唯一解 \\(0\\)。' },
      { c: '-1',                         ans: '\\pi',                                   hint: '\\(\\cos\\theta=-1\\) 只有唯一解 \\(\\pi\\)。' },
    ];
    const tanCases = [
      { c: '0',                            ans: '0,\\pi',                               hint: '\\(\\tan\\theta=0\\) 在 \\([0,2\\pi)\\) 時 \\(\\theta=0,\\pi\\)。' },
      { c: '1',                            ans: '\\frac{\\pi}{4},\\frac{5\\pi}{4}', hint: '第一象限 \\(\\frac{\\pi}{4}\\)，第三象限 \\(\\pi+\\frac{\\pi}{4}=\\frac{5\\pi}{4}\\)。' },
      { c: '-1',                           ans: '\\frac{3\\pi}{4},\\frac{7\\pi}{4}', hint: '第二象限 \\(\\pi-\\frac{\\pi}{4}\\)，第四象限 \\(2\\pi-\\frac{\\pi}{4}\\)。' },
      { c: '\\sqrt{3}',                  ans: '\\frac{\\pi}{3},\\frac{4\\pi}{3}', hint: '第一象限 \\(\\frac{\\pi}{3}\\)，第三象限 \\(\\pi+\\frac{\\pi}{3}=\\frac{4\\pi}{3}\\)。' },
      { c: '-\\sqrt{3}',                 ans: '\\frac{2\\pi}{3},\\frac{5\\pi}{3}', hint: '第二象限 \\(\\pi-\\frac{\\pi}{3}\\)，第四象限 \\(2\\pi-\\frac{\\pi}{3}\\)。' },
      { c: '\\frac{\\sqrt{3}}{3}',     ans: '\\frac{\\pi}{6},\\frac{7\\pi}{6}', hint: '\\(\\tan\\frac{\\pi}{6}=\\frac{\\sqrt{3}}{3}\\)，第三象限 \\(\\pi+\\frac{\\pi}{6}=\\frac{7\\pi}{6}\\)。' },
      { c: '-\\frac{\\sqrt{3}}{3}',    ans: '\\frac{5\\pi}{6},\\frac{11\\pi}{6}', hint: '第二象限 \\(\\pi-\\frac{\\pi}{6}\\)，第四象限 \\(2\\pi-\\frac{\\pi}{6}\\)。' },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const item = s313Pick(sinCases);
        questions.push(`解方程式 \\(\\sin\\theta=${item.c}\\)，求 \\(0\\le\\theta<2\\pi\\) 內的所有解。`);
        answers.push(`簡答：\\(\\theta=${item.ans}\\)。過程：${item.hint}`);
      } else if (mode === 1) {
        const item = s313Pick(cosCases);
        questions.push(`解方程式 \\(\\cos\\theta=${item.c}\\)，求 \\(0\\le\\theta<2\\pi\\) 內的所有解。`);
        answers.push(`簡答：\\(\\theta=${item.ans}\\)。過程：${item.hint}`);
      } else {
        const item = s313Pick(tanCases);
        questions.push(`解方程式 \\(\\tan\\theta=${item.c}\\)，求 \\(0\\le\\theta<2\\pi\\) 內的所有解。`);
        answers.push(`簡答：\\(\\theta=${item.ans}\\)。過程：${item.hint}`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS314CombineFormSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const [p, q, r] = s314Triple();
      const mode = i % 2;
      if (mode === 0) {
        questions.push(
          `將 \\(${p}\\sin x+${q}\\cos x\\) 化為 \\(R\\sin(x+\\theta)\\) 的形式，求 \\(R\\)、\\(\\cos\\theta\\)、\\(\\sin\\theta\\)。`
        );
        answers.push(
          `簡答：\\(R=${r},\\cos\\theta=${formatFraction(p, r)},\\sin\\theta=${formatFraction(q, r)}\\)。過程：展開 \\(R\\sin(x+\\theta)=R\\cos\\theta\\sin x+R\\sin\\theta\\cos x\\)，比較係數。`
        );
      } else {
        questions.push(
          `將 \\(${p}\\sin x-${q}\\cos x\\) 化為 \\(R\\sin(x-\\phi)\\) 的形式，求 \\(R\\)、\\(\\cos\\phi\\)、\\(\\sin\\phi\\)。`
        );
        answers.push(
          `簡答：\\(R=${r},\\cos\\phi=${formatFraction(p, r)},\\sin\\phi=${formatFraction(q, r)}\\)。過程：展開 \\(R\\sin(x-\\phi)=R\\cos\\phi\\sin x-R\\sin\\phi\\cos x\\)，再比較 \\(\\sin x\\)、\\(\\cos x\\) 的係數。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS314GeometryModelSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const r = s313Pick([2, 3, 4, 5, 6]);
      questions.push(
        `在半徑為 ${r} 的半圓內接一個矩形，設矩形右上角與圓心連線和水平軸夾角為 \\(\\theta\\)。求矩形面積的最大值。`
      );
      answers.push(
        `簡答：${r * r}。過程：矩形寬為 \\(${2 * r}\\cos\\theta\\)，高為 \\(${r}\\sin\\theta\\)，面積 \\(A=${2 * r * r}\\sin\\theta\\cos\\theta=${r * r}\\sin2\\theta\\)，最大值為 ${r * r}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS314WaveModelSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const [a, b, r] = s314Triple();
      const w = s313Pick([1, 2, 3, 4]);
      questions.push(
        `兩個同頻波疊合後位移為 \\(y=${a}\\sin ${s314TrigArgument('t', w)}+${b}\\cos ${s314TrigArgument('t', w)}\\)。求合成波的最大位移。`
      );
      answers.push(
        `簡答：${r}。過程：同頻的 \\(a\\sin\\omega t+b\\cos\\omega t\\) 可疊合成 \\(R\\sin(\\omega t+\\theta)\\)，其中 \\(R=\\sqrt{${a}^2+${b}^2}=${r}\\)，所以最大位移為 ${r}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS314TrigInequalityParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const sinGtCases = [
      { c: '\\frac{1}{2}',            ans: '\\frac{\\pi}{6}<\\theta<\\frac{5\\pi}{6}',   detail: '\\(\\sin\\theta=\\frac{1}{2}\\) 解為 \\(\\frac{\\pi}{6},\\frac{5\\pi}{6}\\)，\\(\\sin\\theta>\\frac{1}{2}\\) 在兩解之間。' },
      { c: '\\frac{\\sqrt{2}}{2}',  ans: '\\frac{\\pi}{4}<\\theta<\\frac{3\\pi}{4}',   detail: '\\(\\sin\\theta=\\frac{\\sqrt{2}}{2}\\) 解為 \\(\\frac{\\pi}{4},\\frac{3\\pi}{4}\\)，取中間弧段。' },
      { c: '\\frac{\\sqrt{3}}{2}',  ans: '\\frac{\\pi}{3}<\\theta<\\frac{2\\pi}{3}',   detail: '\\(\\sin\\theta=\\frac{\\sqrt{3}}{2}\\) 解為 \\(\\frac{\\pi}{3},\\frac{2\\pi}{3}\\)，取中間弧段。' },
      { c: '0',                          ans: '0<\\theta<\\pi',                                   detail: '\\(\\sin\\theta>0\\) 在第一、二象限，即 \\((0,\\pi)\\)。' },
      { c: '-\\frac{1}{2}',           ans: '0\\le\\theta<\\frac{7\\pi}{6}\\text{ 或 }\\frac{11\\pi}{6}<\\theta<2\\pi', detail: '補集：\\(\\sin\\theta\\le-\\frac{1}{2}\\) 的範圍為 \\([\\frac{7\\pi}{6},\\frac{11\\pi}{6}]\\)，取補集。' },
    ];
    const cosLtCases = [
      { c: '\\frac{\\sqrt{3}}{2}',  ans: '\\frac{\\pi}{6}<\\theta<\\frac{11\\pi}{6}',  detail: '\\(\\cos\\theta=\\frac{\\sqrt{3}}{2}\\) 解為 \\(\\frac{\\pi}{6},\\frac{11\\pi}{6}\\)，中間弧段 \\(\\cos\\theta<\\frac{\\sqrt{3}}{2}\\)。' },
      { c: '\\frac{1}{2}',            ans: '\\frac{\\pi}{3}<\\theta<\\frac{5\\pi}{3}',   detail: '\\(\\cos\\theta=\\frac{1}{2}\\) 解為 \\(\\frac{\\pi}{3},\\frac{5\\pi}{3}\\)，中間弧段較大。' },
      { c: '0',                          ans: '\\frac{\\pi}{2}<\\theta<\\frac{3\\pi}{2}',  detail: '\\(\\cos\\theta<0\\) 在第二、三象限 \\((\\frac{\\pi}{2},\\frac{3\\pi}{2})\\)。' },
      { c: '-\\frac{1}{2}',           ans: '\\frac{2\\pi}{3}<\\theta<\\frac{4\\pi}{3}', detail: '\\(\\cos\\theta=-\\frac{1}{2}\\) 解為 \\(\\frac{2\\pi}{3},\\frac{4\\pi}{3}\\)，之間 \\(\\cos\\theta<-\\frac{1}{2}\\)。' },
      { c: '-\\frac{\\sqrt{3}}{2}',  ans: '\\frac{5\\pi}{6}<\\theta<\\frac{7\\pi}{6}', detail: '\\(\\cos\\theta=-\\frac{\\sqrt{3}}{2}\\) 解為 \\(\\frac{5\\pi}{6},\\frac{7\\pi}{6}\\)，之間弧段最小。' },
    ];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const item = s313Pick(sinGtCases);
        questions.push(`解不等式 \\(\\sin\\theta>${item.c}\\)，其中 \\(0\\le\\theta<2\\pi\\)。`);
        answers.push(`簡答：\\(${item.ans}\\)。過程：${item.detail}`);
      } else {
        const item = s313Pick(cosLtCases);
        questions.push(`解不等式 \\(\\cos\\theta<${item.c}\\)，其中 \\(0\\le\\theta<2\\pi\\)。`);
        answers.push(`簡答：\\(${item.ans}\\)。過程：${item.detail}`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS314InverseTrigEvalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const arcsinCases = [
      { expr: '\\sin\\frac{5\\pi}{6}',  val: '\\frac{\\pi}{6}',  hint: '\\(\\sin\\frac{5\\pi}{6}=\\frac{1}{2}\\)，\\(\\arcsin\\frac{1}{2}=\\frac{\\pi}{6}\\)（在 \\([-\\frac{\\pi}{2},\\frac{\\pi}{2}]\\) 內）。' },
      { expr: '\\sin\\frac{2\\pi}{3}',  val: '\\frac{\\pi}{3}',  hint: '\\(\\sin\\frac{2\\pi}{3}=\\frac{\\sqrt{3}}{2}\\)，\\(\\arcsin\\frac{\\sqrt{3}}{2}=\\frac{\\pi}{3}\\)。' },
      { expr: '\\sin\\frac{3\\pi}{4}',  val: '\\frac{\\pi}{4}',  hint: '\\(\\sin\\frac{3\\pi}{4}=\\frac{\\sqrt{2}}{2}\\)，\\(\\arcsin\\frac{\\sqrt{2}}{2}=\\frac{\\pi}{4}\\)。' },
      { expr: '\\sin\\frac{7\\pi}{6}',  val: '-\\frac{\\pi}{6}', hint: '\\(\\sin\\frac{7\\pi}{6}=-\\frac{1}{2}\\)，\\(\\arcsin(-\\frac{1}{2})=-\\frac{\\pi}{6}\\)。' },
      { expr: '\\sin\\frac{4\\pi}{3}',  val: '-\\frac{\\pi}{3}', hint: '\\(\\sin\\frac{4\\pi}{3}=-\\frac{\\sqrt{3}}{2}\\)，\\(\\arcsin(-\\frac{\\sqrt{3}}{2})=-\\frac{\\pi}{3}\\)。' },
      { expr: '\\sin\\frac{5\\pi}{4}',  val: '-\\frac{\\pi}{4}', hint: '\\(\\sin\\frac{5\\pi}{4}=-\\frac{\\sqrt{2}}{2}\\)，\\(\\arcsin(-\\frac{\\sqrt{2}}{2})=-\\frac{\\pi}{4}\\)。' },
    ];
    const arccosCases = [
      { expr: '\\cos\\frac{7\\pi}{6}',   val: '\\frac{5\\pi}{6}', hint: '\\(\\cos\\frac{7\\pi}{6}=-\\frac{\\sqrt{3}}{2}\\)，\\(\\arccos(-\\frac{\\sqrt{3}}{2})=\\frac{5\\pi}{6}\\)。' },
      { expr: '\\cos\\frac{5\\pi}{4}',   val: '\\frac{3\\pi}{4}', hint: '\\(\\cos\\frac{5\\pi}{4}=-\\frac{\\sqrt{2}}{2}\\)，\\(\\arccos(-\\frac{\\sqrt{2}}{2})=\\frac{3\\pi}{4}\\)。' },
      { expr: '\\cos\\frac{4\\pi}{3}',   val: '\\frac{2\\pi}{3}', hint: '\\(\\cos\\frac{4\\pi}{3}=-\\frac{1}{2}\\)，\\(\\arccos(-\\frac{1}{2})=\\frac{2\\pi}{3}\\)。' },
      { expr: '\\cos\\frac{5\\pi}{3}',   val: '\\frac{\\pi}{3}',  hint: '\\(\\cos\\frac{5\\pi}{3}=\\frac{1}{2}\\)，\\(\\arccos\\frac{1}{2}=\\frac{\\pi}{3}\\)。' },
      { expr: '\\cos(-\\frac{\\pi}{6})', val: '\\frac{\\pi}{6}',  hint: '\\(\\cos(-\\frac{\\pi}{6})=\\frac{\\sqrt{3}}{2}\\)（餘弦為偶函數），\\(\\arccos\\frac{\\sqrt{3}}{2}=\\frac{\\pi}{6}\\)。' },
      { expr: '\\cos(-\\frac{\\pi}{4})', val: '\\frac{\\pi}{4}',  hint: '\\(\\cos(-\\frac{\\pi}{4})=\\frac{\\sqrt{2}}{2}\\)，\\(\\arccos\\frac{\\sqrt{2}}{2}=\\frac{\\pi}{4}\\)。' },
    ];
    const arctanCases = [
      { expr: '\\sqrt{3}',               val: '\\frac{\\pi}{3}',  hint: '\\(\\tan\\frac{\\pi}{3}=\\sqrt{3}\\)，值域 \\((-\\frac{\\pi}{2},\\frac{\\pi}{2})\\)。' },
      { expr: '-\\sqrt{3}',              val: '-\\frac{\\pi}{3}', hint: '\\(\\tan(-\\frac{\\pi}{3})=-\\sqrt{3}\\)。' },
      { expr: '1',                          val: '\\frac{\\pi}{4}',  hint: '\\(\\tan\\frac{\\pi}{4}=1\\)，\\(\\arctan 1=\\frac{\\pi}{4}\\)。' },
      { expr: '-1',                         val: '-\\frac{\\pi}{4}', hint: '\\(\\tan(-\\frac{\\pi}{4})=-1\\)，\\(\\arctan(-1)=-\\frac{\\pi}{4}\\)。' },
      { expr: '\\frac{\\sqrt{3}}{3}',  val: '\\frac{\\pi}{6}',  hint: '\\(\\tan\\frac{\\pi}{6}=\\frac{1}{\\sqrt{3}}=\\frac{\\sqrt{3}}{3}\\)，\\(\\arctan\\frac{\\sqrt{3}}{3}=\\frac{\\pi}{6}\\)。' },
      { expr: '-\\frac{\\sqrt{3}}{3}', val: '-\\frac{\\pi}{6}', hint: '\\(\\arctan(-\\frac{\\sqrt{3}}{3})=-\\frac{\\pi}{6}\\)。' },
      { expr: '0',                          val: '0',                    hint: '\\(\\tan 0=0\\)，\\(\\arctan 0=0\\)。' },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const item = s313Pick(arcsinCases);
        questions.push(`求 \\(\\arcsin(${item.expr})\\) 的值。`);
        answers.push(`簡答：\\(${item.val}\\)。過程：${item.hint}`);
      } else if (mode === 1) {
        const item = s313Pick(arccosCases);
        questions.push(`求 \\(\\arccos(${item.expr})\\) 的值。`);
        answers.push(`簡答：\\(${item.val}\\)。過程：${item.hint}`);
      } else {
        const item = s313Pick(arctanCases);
        questions.push(`求 \\(\\arctan(${item.expr})\\) 的值。`);
        answers.push(`簡答：\\(${item.val}\\)。過程：${item.hint}`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS314TrigInequalityParameterizedSubtypeSet(count) {
    return buildS314TrigInequalityParameterizedSet(count);
  }

  function buildS314InverseTrigEvalSubtypeSet(count) {
    return buildS314InverseTrigEvalSet(count);
  }

  function buildS314ComboExtremaFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS314BasicComboExtremaSet,
        buildS314RestrictedRangeSet,
        buildS314QuadraticReductionSet,
        buildS314SubstitutionSet,
        buildS314FractionalExtremaSet,
      ],
      count
    );
  }

  function buildS314InverseModelFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS314ParameterInverseSet,
        buildS314EquationSolvingSet,
        buildS314CombineFormSet,
        buildS314GeometryModelSet,
        buildS314WaveModelSet,
      ],
      count
    );
  }

  function buildS314BasicComboExtremaSubtypeSet(count) {
    return buildS314BasicComboExtremaSet(count);
  }

  function buildS314RestrictedRangeSubtypeSet(count) {
    return buildS314RestrictedRangeSet(count);
  }

  function buildS314QuadraticReductionSubtypeSet(count) {
    return buildS314QuadraticReductionSet(count);
  }

  function buildS314SubstitutionSubtypeSet(count) {
    return buildS314SubstitutionSet(count);
  }

  function buildS314FractionalExtremaSubtypeSet(count) {
    return buildS314FractionalExtremaSet(count);
  }

  function buildS314ParameterInverseSubtypeSet(count) {
    return buildS314ParameterInverseSet(count);
  }

  function buildS314EquationSolvingSubtypeSet(count) {
    return buildS314EquationSolvingSet(count);
  }

  function buildS314CombineFormSubtypeSet(count) {
    return buildS314CombineFormSet(count);
  }

  function buildS314GeometryModelSubtypeSet(count) {
    return buildS314GeometryModelSet(count);
  }

  function buildS314WaveModelSubtypeSet(count) {
    return buildS314WaveModelSet(count);
  }

  function s31Pick(list) {
    return list[randInt(0, list.length - 1)];
  }

  function s31Signed(value) {
    if (value === 0) return '';
    return value > 0 ? `+${value}` : `${value}`;
  }

  function s31SignedTerm(value, body) {
    if (value === 0) return '';
    const sign = value > 0 ? '+' : '-';
    const absValue = Math.abs(value);
    const coefficient = absValue === 1 ? '' : `${absValue}`;
    return `${sign}${coefficient}${body}`;
  }

  function s31FirstTerm(value, body) {
    if (value === 0) return '';
    const absValue = Math.abs(value);
    const coefficient = absValue === 1 ? '' : `${absValue}`;
    return `${value < 0 ? '-' : ''}${coefficient}${body}`;
  }

  function s31SinCosExpression(a, b, k = 1, c = 0) {
    const angle = k === 1 ? 'x' : `${k}x`;
    let text = `${s31FirstTerm(a, `\\sin ${angle}`)}${s31SignedTerm(b, `\\cos ${angle}`)}${s31Signed(c)}`;
    text = text.replace(/^\+/, '');
    return text || '0';
  }

  function s31PiText(num, den = 1) {
    return s311PiFrac(num, den);
  }

  function s31SqrtTerm(coef, rad) {
    if (coef === 0) return '0';
    const sign = coef < 0 ? '-' : '';
    const absCoef = Math.abs(coef);
    const body = rad === 1 ? `${absCoef}` : `${absCoef === 1 ? '' : absCoef}\\sqrt{${rad}}`;
    return `${sign}${body}`;
  }

  function s31AddTex(left, right) {
    return right.startsWith('-') ? `${left}${right}` : `${left}+${right}`;
  }

  function buildS311SectorConeParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cases = [
      { slant: 5, degree: 216, base: 3, height: 4, volume: '12\\pi' },
      { slant: 10, degree: 216, base: 6, height: 8, volume: '96\\pi' },
      { slant: 10, degree: 288, base: 8, height: 6, volume: '128\\pi' },
      { slant: 15, degree: 288, base: 12, height: 9, volume: '432\\pi' },
      { slant: 25, degree: 288, base: 20, height: 15, volume: '2000\\pi' },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      questions.push(
        `將半徑為 \\(${item.slant}\\) 、圓心角為 \\(${item.degree}^\\circ\\) 的扇形兩條半徑黏合成圓錐側面。求此圓錐的底面半徑、高，以及體積。`
      );
      answers.push(
        `底面半徑 \\(${item.base}\\)，高 \\(${item.height}\\)，體積 \\(${item.volume}\\)。扇形弧長等於圓錐底圓周長，所以 \\(2\\pi r=${item.slant}\\cdot ${s31PiText(item.degree, 180)}\\)，得 \\(r=${item.base}\\)。母線長為 \\(${item.slant}\\)，因此 \\(h=\\sqrt{${item.slant}^2-${item.base}^2}=${item.height}\\)，體積 \\(V=\\frac13\\pi r^2h=${item.volume}\\)。答案：底面半徑 \\(${item.base}\\)，高 \\(${item.height}\\)，體積 \\(${item.volume}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312TangentAdditionEquationParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const equationCases = [
      { shift: 20, value: '1', delta: 45, theta: 65 },
      { shift: 35, value: '0', delta: 0, theta: 35 },
      { shift: 15, value: '-1', delta: -45, theta: -30 },
    ];
    const tangentCases = [
      { aNum: 1, aDen: 5, sumNum: 1, sumDen: 1 },
      { aNum: 2, aDen: 7, sumNum: 3, sumDen: 4 },
      { aNum: 1, aDen: 3, sumNum: 2, sumDen: 1 },
    ];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const item = equationCases[(i / 2) % equationCases.length];
        questions.push(
          `已知 \\(-90^\\circ<\\theta<90^\\circ\\)，且 \\(\\frac{\\tan\\theta-\\tan ${item.shift}^\\circ}{1+\\tan\\theta\\tan ${item.shift}^\\circ}=${item.value}\\)。求 \\(\\theta\\)。`
        );
        answers.push(
          `\\(\\theta=${item.theta}^\\circ\\)。左式就是 \\(\\tan(\\theta-${item.shift}^\\circ)\\)，所以 \\(\\theta-${item.shift}^\\circ=${item.delta}^\\circ\\)，得 \\(\\theta=${item.theta}^\\circ\\)。答案：\\(\\theta=${item.theta}^\\circ\\)。`
        );
      } else {
        const item = tangentCases[((i - 1) / 2) % tangentCases.length];
        const numerator = item.sumNum * item.aDen - item.aNum * item.sumDen;
        const denominator = item.sumDen * item.aDen + item.aNum * item.sumNum;
        const answer = formatFraction(numerator, denominator);
        questions.push(
          `已知 \\(\\tan\\alpha=${formatFraction(item.aNum, item.aDen)}\\)，\\(\\tan(\\alpha+\\beta)=${formatFraction(item.sumNum, item.sumDen)}\\)，求 \\(\\tan\\beta\\)。`
        );
        answers.push(
          `\\(\\tan\\beta=${answer}\\)。由 \\(\\tan(\\alpha+\\beta)=\\frac{\\tan\\alpha+\\tan\\beta}{1-\\tan\\alpha\\tan\\beta}\\) 反解，\\(\\tan\\beta=\\frac{\\tan(\\alpha+\\beta)-\\tan\\alpha}{1+\\tan\\alpha\\tan(\\alpha+\\beta)}=${answer}\\)。答案：\\(\\tan\\beta=${answer}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS312CosArithmeticProgressionParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cases = [
      { n: 2, shift: 45, interval: '0^\\circ<\\theta<180^\\circ' },
      { n: 3, shift: 60, interval: '0^\\circ<\\theta<180^\\circ' },
      { n: 4, shift: 30, interval: '0^\\circ<\\theta<180^\\circ' },
      { n: 5, shift: 72, interval: '0^\\circ<\\theta<180^\\circ' },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const values = [];
      for (let k = 0; k < item.n; k += 1) {
        values.push(formatFraction(90 + 180 * k, item.n));
      }
      questions.push(
        `設 \\(${item.interval}\\)。若 \\(\\cos(${item.n}\\theta-${item.shift}^\\circ)\\)、\\(\\cos ${item.n}\\theta\\)、\\(\\cos(${item.n}\\theta+${item.shift}^\\circ)\\) 成等差數列，則 \\(\\theta\\) 有幾個可能值？`
      );
      answers.push(
        `共有 \\(${item.n}\\) 個。等差條件給 \\(2\\cos ${item.n}\\theta=\\cos(${item.n}\\theta-${item.shift}^\\circ)+\\cos(${item.n}\\theta+${item.shift}^\\circ)=2\\cos ${item.n}\\theta\\cos ${item.shift}^\\circ\\)。因 \\(\\cos ${item.shift}^\\circ\\ne1\\)，所以 \\(\\cos ${item.n}\\theta=0\\)。在 \\(0^\\circ<\\theta<180^\\circ\\) 中，\\(\\theta=${values.join(', ')}\\)，共有 \\(${item.n}\\) 個。答案：\\(${item.n}\\) 個。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313LinearSinCosGraphFactsParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cases = [
      { a: 3, b: 4, r: 5, k: 1, c: 2 },
      { a: 5, b: 12, r: 13, k: 2, c: -1 },
      { a: 8, b: 6, r: 10, k: 3, c: 4 },
      { a: 7, b: 24, r: 25, k: 1, c: -3 },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const expression = s31SinCosExpression(item.a, item.b, item.k, item.c);
      questions.push(
        `設 \\(f(x)=${expression}\\)。求振幅、週期、\\(y\\) 軸截距、最大值與最小值。`
      );
      answers.push(
        `振幅 \\(${item.r}\\)，週期 \\(${s31PiText(2, item.k)}\\)，\\(y\\) 軸截距 \\(${item.b + item.c}\\)，最大值 \\(${item.c + item.r}\\)，最小值 \\(${item.c - item.r}\\)。因 \\(a\\sin kx+b\\cos kx\\) 的振幅為 \\(\\sqrt{a^2+b^2}\\)，本題為 \\(\\sqrt{${item.a}^2+${item.b}^2}=${item.r}\\)。答案：振幅 \\(${item.r}\\)，週期 \\(${s31PiText(2, item.k)}\\)，截距 \\(${item.b + item.c}\\)，最大 \\(${item.c + item.r}\\)，最小 \\(${item.c - item.r}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS313PeakValleyFunctionParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cases = [
      { amp: 3, mid: 1, k: 1 },
      { amp: 4, mid: -2, k: 2 },
      { amp: 5, mid: 3, k: 3 },
      { amp: 2, mid: -1, k: 4 },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const maxY = item.mid + item.amp;
      const minY = item.mid - item.amp;
      const maxX = s31PiText(1, 2 * item.k);
      const minX = s31PiText(3, 2 * item.k);
      const expression = `${item.amp}\\sin ${item.k === 1 ? 'x' : `${item.k}x`}${s31Signed(item.mid)}`;
      questions.push(
        `某正弦函數的相鄰最高點為 \\((${maxX},${maxY})\\)，相鄰最低點為 \\((${minX},${minY})\\)。若可寫成 \\(y=A\\sin kx+d\\) 且 \\(A>0\\)，求此函數。`
      );
      answers.push(
        `\\(y=${expression}\\)。振幅 \\(A=\\frac{${maxY}-(${minY})}{2}=${item.amp}\\)，中線 \\(d=\\frac{${maxY}+(${minY})}{2}=${item.mid}\\)。最高點到相鄰最低點是半個週期，所以半週期為 \\(${s31PiText(1, item.k)}\\)，週期為 \\(${s31PiText(2, item.k)}\\)，得 \\(k=${item.k}\\)。答案：\\(y=${expression}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS314LinearComboInequalityParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cases = [
      {
        expression: '\\sqrt{3}\\cos x-\\sin x',
        relation: '\\le',
        threshold: '1',
        combined: '2\\cos(x+\\frac{\\pi}{6})',
        normalized: '\\cos(x+\\frac{\\pi}{6})\\le\\frac12',
        answer: '\\frac{\\pi}{6}\\le x\\le\\frac{3\\pi}{2}',
      },
      {
        expression: '\\sin x-\\cos x',
        relation: '\\ge',
        threshold: '1',
        combined: '\\sqrt{2}\\sin(x-\\frac{\\pi}{4})',
        normalized: '\\sin(x-\\frac{\\pi}{4})\\ge\\frac{\\sqrt{2}}{2}',
        answer: '\\frac{\\pi}{2}\\le x\\le\\pi',
      },
      {
        expression: '\\sqrt{3}\\sin x+\\cos x',
        relation: '>',
        threshold: '1',
        combined: '2\\sin(x+\\frac{\\pi}{6})',
        normalized: '\\sin(x+\\frac{\\pi}{6})>\\frac12',
        answer: '0<x<\\frac{2\\pi}{3}',
      },
      {
        expression: '\\cos x+\\sin x',
        relation: '<',
        threshold: '0',
        combined: '\\sqrt{2}\\sin(x+\\frac{\\pi}{4})',
        normalized: '\\sin(x+\\frac{\\pi}{4})<0',
        answer: '\\frac{3\\pi}{4}<x<2\\pi',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      questions.push(
        `在 \\(0\\le x<2\\pi\\) 中，解不等式 \\(${item.expression}${item.relation}${item.threshold}\\)。`
      );
      answers.push(
        `解為 \\(${item.answer}\\)。先合成 \\(${item.expression}=${item.combined}\\)，原不等式化為 \\(${item.normalized}\\)，再回到 \\(0\\le x<2\\pi\\) 的範圍取解。答案：\\(${item.answer}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS314MaxPointTangentParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const cases = [
      { a: 3, b: 4, c: 1 },
      { a: 5, b: 12, c: -2 },
      { a: 8, b: 15, c: 3 },
      { a: 7, b: 24, c: -1 },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const expression = s31SinCosExpression(item.a, item.b, 1, item.c);
      questions.push(
        `已知 \\(f(x)=${expression}\\) 在 \\(0<x<\\frac{\\pi}{2}\\) 時於 \\(x=\\alpha\\) 取得最大值。求 \\(\\tan\\alpha\\)。`
      );
      answers.push(
        `\\(\\tan\\alpha=${formatFraction(item.a, item.b)}\\)。最大值發生在 \\(f'(x)=0\\)，即 \\(${item.a}\\cos x-${item.b}\\sin x=0\\)，所以 \\(\\tan\\alpha=\\frac{${item.a}}{${item.b}}\\)。答案：\\(\\tan\\alpha=${formatFraction(item.a, item.b)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function s321Plus(value) {
    if (value === 0) return '';
    return value > 0 ? `+${value}` : `${value}`;
  }

  function s321Fraction(num, den) {
    const frac = simplifyFraction(num, den);
    return frac.den === 1 ? `${frac.num}` : `\\frac{${frac.num}}{${frac.den}}`;
  }

  function s321IntervalFromRoots(a, b, relation) {
    const left = Math.min(a, b);
    const right = Math.max(a, b);
    if (relation === '<') return `\\(${left}<x<${right}\\)`;
    if (relation === '\\le') return `\\(${left}\\le x\\le ${right}\\)`;
    if (relation === '>') return `\\(x<${left}\\) 或 \\(x>${right}\\)`;
    return `\\(x\\le ${left}\\) 或 \\(x\\ge ${right}\\)`;
  }

  function s321Pick(items) {
    return items[randInt(0, items.length - 1)];
  }

  function buildS321ExponentLawSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const b = s321Pick([2, 3, 5]);
        const m = s321Pick([2, 3, 4]);
        const n = s321Pick([2, 3]);
        const value = Math.pow(b, m * n);
        questions.push(`計算 \\((${b}^{${m}})^{${n}}\\) 的值。`);
        answers.push(
          `簡答：${value}。過程：乘方的乘方，指數相乘，\\((${b}^{${m}})^{${n}}=${b}^{${m * n}}=${value}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const b = s321Pick([2, 3, 5]);
        const p = s321Pick([2, 3]);
        const q = s321Pick([2, 3, 4]);
        const value = Math.pow(b, q - p);
        questions.push(`化簡 \\(\\left(\\frac{1}{${b}}\\right)^{-${q}}\\div ${b}^{${p}}\\)。`);
        answers.push(
          `簡答：${value}。過程：\\((\\frac1{${b}})^{-${q}}=${b}^{${q}}\\)，再同底數相除，得 \\(${b}^{${q}-${p}}=${b}^{${q - p}}=${value}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const b = s321Pick([2, 3, 5]);
        const m = s321Pick([2, 3, 4]);
        const value = b ** 2;
        questions.push(`求 \\((${b ** m})^{${formatFraction(1, m)}}\\cdot ${b}^{-1}\\cdot ${b}^2\\) 的精確值。`);
        answers.push(
          `簡答：${value}。過程：\\((${b ** m})^{${formatFraction(1, m)}}=${b}\\)，原式為 \\(${b}\\cdot${b}^{-1}\\cdot${b}^2=${b}^{1-1+2}=${b}^2=${value}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const n = s321Pick([2, 3, 4]);
        const numerator = Math.pow(5, n) + Math.pow(5, -n);
        questions.push(`已知 \\(a^{x}+a^{-x}=5\\)，求 \\(a^{${n}x}+a^{-${n}x}\\) 可用遞推或平方關係表示的值。`);
        const value = n === 2 ? 23 : n === 3 ? 110 : 527;
        answers.push(
          `簡答：${value}。過程：令 \\(t=a^x+a^{-x}=5\\)。利用 \\(a^{2x}+a^{-2x}=t^2-2\\)，逐次遞推即可；本題代入後得到 ${value}。`
        );
        continue;
      }
      const n = s321Pick([2, 3, 4, 5]);
      questions.push(`化簡 \\((a^{1/${n}}-b^{1/${n}})(a^{1/${n}}+b^{1/${n}})\\)。`);
      answers.push(
        `簡答：\\(a^{${formatFraction(2, n)}}-b^{${formatFraction(2, n)}}\\)。過程：套用平方差，\\(X=a^{1/${n}},Y=b^{1/${n}}\\)，則 \\((X-Y)(X+Y)=X^2-Y^2\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS321SizeComparisonSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = s321Pick([2, 3, 5]);
        const p = s321Pick([2, 3, 4]);
        const q = p + s321Pick([1, 2]);
        questions.push(`比較 \\(\\sqrt[${p}]{${a}}\\) 與 \\(\\sqrt[${q}]{${a}}\\) 的大小。`);
        answers.push(
          `簡答：\\(\\sqrt[${p}]{${a}}>\\sqrt[${q}]{${a}}\\)。過程：因為 ${a}>1，指數函數遞增，且 \\(\\frac1{${p}}>\\frac1{${q}}\\)，所以前者較大。`
        );
        continue;
      }
      if (mode === 1) {
        const p = s321Pick([2, 3, 4]);
        const q = p + 1;
        questions.push(`比較 \\((\\frac12)^{${p}}\\) 與 \\((\\frac12)^{${q}}\\) 的大小。`);
        answers.push(
          `簡答：\\((\\frac12)^{${p}}>(\\frac12)^{${q}}\\)。過程：底數 \\(\\frac12\\) 介於 0 與 1，指數愈大值愈小；因為 ${p}<${q}，所以前者較大。`
        );
        continue;
      }
      if (mode === 2) {
        const p = s321Pick([2, 3, 4]);
        questions.push(`若 \\(0<a<1\\)，比較 \\(a^2,a^3,a^{${formatFraction(1, p)}}\\) 的大小。`);
        answers.push(
          `簡答：\\(a^{${formatFraction(1, p)}}>a^2>a^3\\)。過程：當 \\(0<a<1\\) 時，指數愈大，值愈小；因為 \\(\\frac1{${p}}<2<3\\)，所以大小如上。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`比較 \\((\\sqrt2)^3\\) 與 \\((\\sqrt3)^2\\) 的大小。`);
        answers.push(
          `簡答：\\((\\sqrt2)^3< (\\sqrt3)^2\\)。過程：前者為 \\(2\\sqrt2\\)，平方後為 8；後者為 3，平方後為 9，兩者皆正，所以後者較大。`
        );
        continue;
      }
      const a = s321Pick([2, 3, 5]);
      questions.push(
        `比較 \\(a^{${formatFraction(1, 2)}}\\)、\\(a^{${formatFraction(2, 3)}}\\)、\\(a^{-1}\\) 的大小，其中 \\(a=${a}\\)。`
      );
      answers.push(
        `簡答：\\(a^{${formatFraction(2, 3)}}>a^{${formatFraction(1, 2)}}>a^{-1}\\)。過程：因為底數 ${a}>1，指數愈大值愈大，直接比較 \\(\\frac23,\\frac12,-1\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS321EquationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = s321Pick([2, 3, 4, 5]);
        const m = s321Pick([2, 3, 4]);
        const sol = s321Pick([-2, -1, 1, 2, 3]);
        const c = m * sol - 1;
        questions.push(`解方程式 \\(${a}^{${m}x-1}=${a}^{${c}}\\)。`);
        answers.push(
          `簡答：\\(x=${sol}\\)。過程：同底數且底數不為 1，可比較指數，得 \\(${m}x-1=${c}\\)，所以 \\(x=${sol}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const r = s321Pick([2, 3, 4]);
        const s = r + 1;
        const sum = r + s;
        const prod = r * s;
        questions.push(`解方程式 \\(4^x-${sum}\\cdot2^x+${prod}=0\\)。`);
        answers.push(
          `簡答：\\(x=\\log_2 ${r}\\) 或 \\(x=\\log_2 ${s}\\)。過程：令 \\(t=2^x>0\\)，得 \\(t^2-${sum}t+${prod}=0=(t-${r})(t-${s})\\)，所以 \\(2^x=${r}\\) 或 \\(2^x=${s}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const n = s321Pick([1, 2, 3]);
        questions.push(`解方程式 \\(25^x-2\\cdot5^{x-${n}}+5^{-${2 * n}}=0\\)。`);
        answers.push(
          `簡答：\\(x=-${n}\\)。過程：令 \\(t=5^x>0\\)，原式為 \\(t^2-2\\cdot5^{-${n}}t+5^{-${2 * n}}=0=(t-5^{-${n}})^2\\)，所以 \\(5^x=5^{-${n}}\\)，得 \\(x=-${n}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const a = s321Pick([2, 3, 4]);
        const b = a + 1;
        questions.push(`解聯立方程 \\(2^x+3^y=${a + b}\\)、\\(2^x\\cdot3^y=${a * b}\\)。`);
        answers.push(
          `簡答：\\((2^x,3^y)=(${a},${b})\\) 或 \\((${b},${a})\\)，再分別取對數。過程：令 \\(u=2^x,v=3^y\\)，則 \\(u+v=${a + b}\\)、\\(uv=${a * b}\\)，所以 \\(u,v\\) 是方程 \\(t^2-${a + b}t+${a * b}=0\\) 的兩根。`
        );
        continue;
      }
      const m = s321Pick([2, 4]);
      const sumText = s321Fraction(m * m + 1, m);
      const rhsText = s321Fraction(3 * (m * m + 1) - 2 * m, m);
      questions.push(`解方程式 \\(3(2^x+2^{-x})-2=${rhsText}\\)。`);
      answers.push(
        `簡答：\\(x=\\log_2 ${m}\\) 或 \\(x=-\\log_2 ${m}\\)。過程：令 \\(t=2^x>0\\)，得 \\(t+\\frac1t=${sumText}\\)，所以 \\(t=${m}\\) 或 \\(t=\\frac1{${m}}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS321InequalitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const left = s321Pick([-3, -2, -1]);
        const right = s321Pick([2, 3, 4]);
        const sum = left + right;
        const prod = left * right;
        const mid = sum === 0 ? 'x^2' : `x^2${s321Plus(-sum)}x`;
        questions.push(`解不等式 \\((\\frac12)^{${mid}${s321Plus(prod)}}>1\\)。`);
        answers.push(
          `簡答：${s321IntervalFromRoots(left, right, '<')}。過程：\\(1=(\\frac12)^0\\)，底數 \\(\\frac12<1\\)，所以指數需小於 0；此二次式的兩根為 ${left}、${right}，開口向上，小於 0 時落在兩根之間。`
        );
        continue;
      }
      if (mode === 1) {
        const r = s321Pick([2, 3, 4]);
        const s = r + 2;
        const sum = r + s;
        const prod = r * s;
        questions.push(`解不等式 \\(4^x-${sum}\\cdot2^x+${prod}>0\\)。`);
        answers.push(
          `簡答：\\(x<\\log_2 ${r}\\) 或 \\(x>\\log_2 ${s}\\)。過程：令 \\(t=2^x>0\\)，得 \\((t-${r})(t-${s})>0\\)，所以 \\(t<${r}\\) 或 \\(t>${s}\\)，再轉回 \\(x\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`解不等式 \\((\\frac{16}{25})^x+2(\\frac45)^x-3\\le0\\)。`);
        answers.push(
          `簡答：\\(x\\ge0\\)。過程：令 \\(t=(\\frac45)^x>0\\)，則 \\(t^2+2t-3\\le0\\)，得 \\(0<t\\le1\\)。因 \\(0<\\frac45<1\\)，\\((\\frac45)^x\\le1\\) 等價於 \\(x\\ge0\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const left = s321Pick([1, 2]);
        const right = left + s321Pick([2, 3]);
        const sum = left + right;
        const prod = left * right;
        questions.push(`解不等式 \\((\\frac{1}{10})^{x^2-${sum}x+${prod}}\\ge1\\)。`);
        answers.push(
          `簡答：\\(${left}\\le x\\le ${right}\\)。過程：\\(1=(\\frac{1}{10})^0\\)，底數小於 1，所以指數需 \\(\\le0\\)。即 \\((x-${left})(x-${right})\\le0\\)，解得 \\(${left}\\le x\\le ${right}\\)。`
        );
        continue;
      }
      questions.push(`解連續不等式 \\(\\frac13<3^{2x-1}<27\\)。`);
      answers.push(
        `簡答：\\(0<x<2\\)。過程：把兩側都寫成 3 的次方，\\(3^{-1}<3^{2x-1}<3^3\\)，底數大於 1，不等號方向不變。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS321ApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const start = s321Pick([2, 3, 5]);
        const ratio = s321Pick([2, 3, 4]);
        questions.push(`某細菌每小時變為原來的 ${ratio} 倍，若初始有 ${start} 個，求 \\(t\\) 小時後的數量函數。`);
        answers.push(
          `簡答：\\(N(t)=${start}\\cdot${ratio}^t\\)。過程：每經過 1 小時乘上 ${ratio}，連續 \\(t\\) 次就是指數模型。`
        );
        continue;
      }
      if (mode === 1) {
        const half = s321Pick([2, 3, 5]);
        const start = s321Pick([400, 800, 1600]);
        questions.push(`某物質半衰期為 ${half} 小時，初始量為 ${start}，求 ${2 * half} 小時後剩餘量。`);
        answers.push(
          `簡答：${start / 4}。過程：${2 * half} 小時是 2 個半衰期，所以剩餘 \\(${start}(\\frac12)^2=${start / 4}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const p = s321Pick([10000, 20000, 50000]);
        const r = s321Pick([2, 3, 5]);
        questions.push(`本金 ${p} 元存入銀行，年利率 ${r}% 且每年複利一次，寫出 \\(n\\) 年後本利和公式。`);
        answers.push(
          `簡答：\\(${p}(1+\\frac{${r}}{100})^n\\)。過程：每年乘上 \\(1+\\frac{${r}}{100}\\)，連續 \\(n\\) 年即為複利模型。`
        );
        continue;
      }
      if (mode === 3) {
        const rate = s321Pick([70, 80, 90]);
        questions.push(
          `光線每通過一塊透明板會剩下原強度的 ${rate}%，求通過 \\(n\\) 塊後強度小於原來 \\(\\frac35\\) 的不等式。`
        );
        answers.push(
          `簡答：\\((\\frac{${rate}}{100})^n<\\frac35\\)。過程：每通過一塊就乘上 \\(\\frac{${rate}}{100}\\)，所以剩餘比例為 \\((\\frac{${rate}}{100})^n\\)，要小於原強度的 \\(\\frac35\\)。`
        );
        continue;
      }
      const start = s321Pick([200, 400, 800]);
      questions.push(`某藥物在血液中每 2 小時濃度減半，初始濃度為 ${start}，求 8 小時後濃度。`);
      answers.push(`簡答：${start / 16}。過程：8 小時是 4 個半衰期，濃度為 \\(${start}(\\frac12)^4=${start / 16}\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS321GraphFeatureSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = s321Pick([2, 3, 4, 5]);
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`函數 \\(y=${a}^x\\) 是否通過 \\((0,1)\\)？水平漸近線為何？`);
        answers.push(
          `簡答：通過 \\((0,1)\\)，水平漸近線為 \\(y=0\\)。過程：代入 \\(x=0\\)，得 \\(${a}^0=1\\)；指數函數值永遠趨近但不等於 0。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`判斷 \\(y=${a}^x\\) 是遞增還是遞減，並說明原因。`);
        answers.push(`簡答：遞增。過程：因為底數 ${a}>1，所以 \\(x\\) 增加時，\\(${a}^x\\) 也增加。`);
        continue;
      }
      if (mode === 2) {
        questions.push(`求 \\(y=${a}^{x-2}+3\\) 的水平漸近線與通過點 \\((2,?)\\)。`);
        answers.push(
          `簡答：水平漸近線 \\(y=3\\)，通過 \\((2,4)\\)。過程：由 \\(y=${a}^{x-2}\\) 上移 3 得漸近線；代入 \\(x=2\\) 得 \\(${a}^0+3=4\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`判斷 \\(\\frac{${a}^x+${a}^{-x}}{2}\\ge1\\) 是否恆成立。`);
        answers.push(
          `簡答：恆成立。過程：令 \\(t=${a}^x>0\\)，則 \\(\\frac{t+1/t}{2}\\ge1\\)，等號在 \\(t=1\\) 即 \\(x=0\\) 時成立。`
        );
        continue;
      }
      questions.push(`判斷 \\(y=${a}^x\\) 與反函數 \\(y=\\log_${a}x\\) 是否關於直線 \\(y=x\\) 對稱。`);
      answers.push(`簡答：是。過程：互為反函數的兩個圖形會關於直線 \\(y=x\\) 對稱。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS321GraphTransformSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = s321Pick([2, 3, 4]);
      const h = s321Pick([1, 2, 3]);
      const k = s321Pick([-2, 1, 3]);
      const mode = i % 5;
      if (mode === 0) {
        const moveY = k > 0 ? `上移 ${k}` : `下移 ${Math.abs(k)}`;
        questions.push(`將 \\(y=${a}^x\\) 的圖形向右平移 ${h} 單位並${moveY}單位，求新函數。`);
        answers.push(
          `簡答：\\(y=${a}^{x-${h}}${s321Plus(k)}\\)。過程：向右平移把 \\(x\\) 換成 \\(x-${h}\\)，${moveY}表示整體${k > 0 ? `加 ${k}` : `減 ${Math.abs(k)}`}。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`求 \\(y=${a}^x\\) 關於 \\(y\\) 軸對稱後的函數式。`);
        answers.push(`簡答：\\(y=${a}^{-x}\\)。過程：關於 \\(y\\) 軸對稱時，把 \\(x\\) 換成 \\(-x\\)。`);
        continue;
      }
      if (mode === 2) {
        questions.push(`求 \\(y=${a}^x\\) 以原點為對稱中心後的函數式。`);
        answers.push(`簡答：\\(y=-${a}^{-x}\\)。過程：原點對稱等於先 \\(x\\to -x\\)，再 \\(y\\to -y\\)。`);
        continue;
      }
      if (mode === 3) {
        questions.push(`描述 \\(y=${a}^{|x|}\\) 的圖形特徵。`);
        answers.push(
          `簡答：關於 \\(y\\) 軸對稱，且最低點為 \\((0,1)\\)。過程：\\(|x|\\) 使左右兩側都取 \\(y=${a}^{|x|}\\)，所以圖形左右對稱。`
        );
        continue;
      }
      questions.push(`已知 \\(y=3^x\\) 平移後通過 \\((0,5)\\)、\\((1,11)\\)，求平移後的函數式。`);
      answers.push(
        `簡答：\\(y=3^{x+1}+2\\)。過程：設 \\(y=3^{x-h}+k\\)。代入兩點可得 \\(3^{-h}+k=5\\)、\\(3^{1-h}+k=11\\)，相減得 \\(2\\cdot3^{-h}=6\\)，故 \\(h=-1,k=2\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS321CompositeExtremaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const h = s321Pick([2, 3, 4]);
        const c = s321Pick([5, 9, 18]);
        const min = c;
        const rightValue = 16 - 4 * h + h * h + c;
        const maxText = s321Fraction(rightValue, 1);
        questions.push(`求 \\(f(x)=4^x-${2 * h}\\cdot2^x+${h * h + c}\\) 在區間 \\([-2,2]\\) 內的最大值與最小值。`);
        answers.push(
          `簡答：最小值 ${min}，最大值 ${maxText}。過程：令 \\(t=2^x\\)，則 \\(t\\in[\\frac14,4]\\)，且 \\(f(t)=(t-${h})^2+${c}\\)。頂點 \\(t=${h}\\) 在區間內，所以最小值為 ${min}；端點代入 \\(t=\\frac14,4\\) 比較得最大值 ${maxText}。`
        );
        continue;
      }
      if (mode === 1) {
        const h = s321Pick([2, 3, 4]);
        const c = s321Pick([7, 9, 12]);
        questions.push(`求 \\(y=-(\\frac19)^x+${2 * h}(\\frac13)^x+${c - h * h}\\) 在 \\([-2,1]\\) 上的最大值。`);
        answers.push(
          `簡答：${c}。過程：令 \\(t=(\\frac13)^x\\)，則 \\(t\\in[\\frac13,9]\\)，原式為 \\(-t^2+${2 * h}t+${c - h * h}=-(t-${h})^2+${c}\\)。因 ${h} 在區間內，所以最大值為 ${c}。`
        );
        continue;
      }
      if (mode === 2) {
        const h = s321Pick([1, 2, 3]);
        const c = s321Pick([4, 6, 8]);
        questions.push(`給定 \\(f(x)=9^x-${2 * h}\\cdot3^x+${h * h + c}\\)，求其最小值。`);
        answers.push(
          `簡答：${c}。過程：令 \\(t=3^x>0\\)，則 \\(f=t^2-${2 * h}t+${h * h + c}=(t-${h})^2+${c}\\)。因 \\(t=${h}>0\\) 可達，所以最小值為 ${c}。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`求 \\(a^x+a^{-x}\\) 的最小值與此時 \\(x\\) 的值，其中 \\(a>1\\)。`);
        answers.push(`簡答：最小值 2，於 \\(x=0\\) 時取得。過程：令 \\(t=a^x>0\\)，則 \\(t+\\frac1t\\ge2\\)。`);
        continue;
      }
      const total = s321Pick([6, 8, 10]);
      const min = 2 * Math.pow(3, total / 2);
      questions.push(`若點 \\((x,y)\\) 在直線 \\(x+2y=${total}\\) 上，求 \\(3^x+9^y\\) 的最小值。`);
      answers.push(
        `簡答：${min}。過程：由 \\(x=${total}-2y\\)，原式為 \\(3^{${total}-2y}+3^{2y}\\)。令 \\(t=3^{2y}>0\\)，成 \\(\\frac{3^{${total}}}{t}+t\\)，由 AM-GM 得最小值 \\(2\\sqrt{3^{${total}}}=${min}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS321AdvancedInequalitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const k = s321Pick([4, 6, 8, 10]);
        const min = 2 * Math.pow(3, k / 2);
        questions.push(`已知 \\(a+b=${k}\\)，求 \\(3^a+3^b\\) 的最小值。`);
        answers.push(
          `簡答：${min}。過程：令 \\(u=3^a,v=3^b\\)，則 \\(uv=3^{${k}}\\)。由 AM-GM，\\(u+v\\ge2\\sqrt{uv}=2\\cdot3^{${k / 2}}=${min}\\)，等號在 \\(a=b=${k / 2}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const base = s321Pick([2, 3, 5]);
        questions.push(`求 \\(y=${base}^x+${base}^{-x}\\) 的最小值，並求此時 \\(x\\) 的值。`);
        answers.push(
          `簡答：最小值 2，於 \\(x=0\\) 時取得。過程：令 \\(t=${base}^x>0\\)，則 \\(y=t+\\frac1t\\ge2\\)，等號在 \\(t=1\\)，也就是 \\(x=0\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const k = s321Pick([1, 2, 3]);
        const min = Math.pow(3, 2 * k);
        questions.push(`求 \\(27^{x^2+${s321Fraction(2 * k, 3)}}\\) 的最小值。`);
        answers.push(
          `簡答：${min}。過程：底數 27 大於 1，指數愈小值愈小；\\(x^2\\ge0\\)，故指數最小為 \\(\\frac{${2 * k}}{3}\\)，最小值 \\(27^{${s321Fraction(2 * k, 3)}}=${min}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const k = s321Pick([8, 10, 12]);
        questions.push(`已知 \\(a+b=${k}\\)，求 \\(2^a+2^b\\) 的最小值。`);
        answers.push(
          `簡答：\\(${2 * Math.pow(2, k / 2)}\\)。過程：令 \\(u=2^a,v=2^b\\)，則 \\(uv=2^{${k}}\\)。由 AM-GM 得 \\(u+v\\ge2\\cdot2^{${k / 2}}\\)，等號在 \\(a=b=${k / 2}\\)。`
        );
        continue;
      }
      const c = s321Pick([2, 3, 4]);
      questions.push(`設 \\(2^x+2^{-x}=t\\)，將 \\(4^x+4^{-x}\\) 表為 \\(t\\) 的多項式，並求 \\(t=${c}\\) 時的值。`);
      answers.push(
        `簡答：\\(t^2-2\\)，代入得 ${c * c - 2}。過程：\\((2^x+2^{-x})^2=4^x+2+4^{-x}\\)，所以 \\(4^x+4^{-x}=t^2-2\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS321AdvancedComparisonSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`比較 \\((0.7)^{${formatFraction(3, 2)}}\\)、\\((0.7)^2\\)、\\((0.7)^{-1}\\) 的大小。`);
        answers.push(
          `簡答：\\((0.7)^{-1}>(0.7)^{${formatFraction(3, 2)}}>(0.7)^2\\)。過程：底數介於 0 與 1 時，指數愈大值愈小；比較指數 \\(-1<\\frac32<2\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const a = s321Pick([2, 3, 5]);
        questions.push(
          `給予相同指數 \\(\\frac12\\)，比較 \\(2^{${formatFraction(1, 2)}}\\)、\\(3^{${formatFraction(1, 2)}}\\)、\\(5^{${formatFraction(1, 2)}}\\) 的大小。`
        );
        answers.push(
          `簡答：\\(5^{${formatFraction(1, 2)}}>3^{${formatFraction(1, 2)}}>2^{${formatFraction(1, 2)}}\\)。過程：指數 \\(\\frac12>0\\)，底數愈大，值愈大。`
        );
        continue;
      }
      if (mode === 2) {
        const p = s321Pick([2, 3, 4]);
        questions.push(`若 \\(0<a<1\\)，比較 \\(a^2,a^3,a^{${formatFraction(1, p)}}\\) 的大小。`);
        answers.push(`簡答：\\(a^{${formatFraction(1, p)}}>a^2>a^3\\)。過程：底數介於 0 與 1，指數愈大值愈小。`);
        continue;
      }
      if (mode === 3) {
        questions.push(`比較 \\((\\sqrt2)^3\\) 與 \\((\\sqrt3)^2\\) 的大小。`);
        answers.push(
          `簡答：\\((\\sqrt2)^3<(\\sqrt3)^2\\)。過程：兩數皆正，平方比較得 \\(((\\sqrt2)^3)^2=8\\)、\\(((\\sqrt3)^2)^2=9\\)，所以後者較大。`
        );
        continue;
      }
      questions.push(`判斷方程式 \\(2^x=x+3\\) 的實根個數。`);
      answers.push(
        `簡答：2 個。過程：令 \\(F(x)=2^x-x-3\\)。\\(F(-3)>0,F(-2)<0\\)，故 \\((-3,-2)\\) 有一根；\\(F(1)<0,F(2)>0\\)，故 \\((1,2)\\) 有一根。又 \\(F''(x)=(\\ln2)^2 2^x>0\\)，凸函數至多有兩個零點，所以共 2 根。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS321FunctionalEquationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = s321Pick([2, 3, 5]);
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`設 \\(f(x)=${a}^x\\)，判斷 \\(f(x+y)=f(x)f(y)\\) 是否恆成立。`);
        answers.push(`簡答：成立。過程：\\(${a}^{x+y}=${a}^x\\cdot${a}^y\\)，這是指數函數的核心性質。`);
        continue;
      }
      if (mode === 1) {
        const k = s321Pick([2, 3, 4]);
        questions.push(`若 \\(f(x)=a^x\\) 且 \\(f(${k})=${Math.pow(a, k)}\\)，求 \\(f(-${k})\\)。`);
        answers.push(
          `簡答：\\(${formatFraction(1, Math.pow(a, k))}\\)。過程：\\(f(-${k})=a^{-${k}}=\\frac1{a^${k}}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`證明對任意實數 \\(x_1,x_2\\)，\\(f(x_1+x_2)=f(x_1)f(x_2)\\)，其中 \\(f(x)=a^x\\)。`);
        answers.push(`簡答：成立。過程：依指數律 \\(a^{x_1+x_2}=a^{x_1}a^{x_2}\\)。`);
        continue;
      }
      if (mode === 3) {
        questions.push(`判斷指數函數 \\(f(x)=a^x\\) 是否為一對一函數。`);
        answers.push(`簡答：是。過程：當 \\(a>1\\) 時遞增，當 \\(0<a<1\\) 時遞減，兩種情況皆單調，所以一對一。`);
        continue;
      }
      questions.push(`若 \\(f(x)=a^x\\)、\\(f(k)=125\\)，求 \\(f(-k)\\)。`);
      answers.push(`簡答：\\(\\frac1{125}\\)。過程：\\(f(k)f(-k)=a^k a^{-k}=1\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS321SymmetricExpressionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const t = s321Pick([3, 4, 5]);
        questions.push(`已知 \\(a^x+a^{-x}=${t}\\)，求 \\(a^{2x}+a^{-2x}\\)。`);
        answers.push(
          `簡答：${t * t - 2}。過程：平方得 \\((a^x+a^{-x})^2=a^{2x}+2+a^{-2x}\\)，所以答案為 \\(${t}^2-2\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const t = s321Pick([3, 4]);
        questions.push(`令 \\(t=a^x+a^{-x}\\)，以 \\(t\\) 表示 \\(a^{3x}+a^{-3x}\\)。`);
        answers.push(`簡答：\\(t^3-3t\\)。過程：利用 \\((u+v)^3=u^3+v^3+3uv(u+v)\\)，其中 \\(uv=1\\)。`);
        continue;
      }
      if (mode === 2) {
        questions.push(`解方程式 \\(2(4^x+4^{-x})-9(2^x+2^{-x})+14=0\\)。`);
        answers.push(
          `簡答：令 \\(t=2^x+2^{-x}\\)，轉為二次方程。過程：\\(4^x+4^{-x}=t^2-2\\)，代入後解 \\(2(t^2-2)-9t+14=0\\)，且需 \\(t\\ge2\\)。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push(`已知 \\(a^{1/2}+a^{-1/2}=\\sqrt5\\)，求 \\(a+a^{-1}\\)。`);
        answers.push(`簡答：3。過程：平方得 \\(a+2+a^{-1}=5\\)，所以 \\(a+a^{-1}=3\\)。`);
        continue;
      }
      questions.push(`已知 \\(a^{2x}=5\\)，計算 \\(\\frac{a^{3x}+a^{-3x}}{a^x+a^{-x}}\\)。`);
      answers.push(
        `簡答：\\(\\sqrt5+\\frac1{\\sqrt5}-1\\)。過程：令 \\(u=a^x\\)，則 \\(u^2=5\\)，用 \\(u^3+u^{-3}=(u+u^{-1})(u^2+u^{-2}-1)\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS321HyperbolicFunctionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const a = s321Pick([2, 3, 5]);
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`設 \\(f(x)=\\frac{${a}^x-${a}^{-x}}{${a}^x+${a}^{-x}}\\)，證明 \\(f(-x)=-f(x)\\)。`);
        answers.push(`簡答：是奇函數。過程：把 \\(-x\\) 代入後，分子變號、分母不變，所以 \\(f(-x)=-f(x)\\)。`);
        continue;
      }
      if (mode === 1) {
        questions.push(`求 \\(f(x)=\\frac{${a}^x+${a}^{-x}}{${a}^x-${a}^{-x}}\\) 的定義域。`);
        answers.push(`簡答：\\(x\\ne0\\)。過程：分母為 0 時 \\(${a}^x=${a}^{-x}\\)，得 \\(x=0\\)，需排除。`);
        continue;
      }
      if (mode === 2) {
        questions.push(`若 \\(f(x)=\\frac{${a}^x-${a}^{-x}}{2}\\)，求 \\(f(0)\\)。`);
        answers.push(`簡答：0。過程：代入 \\(x=0\\)，分子為 \\(1-1=0\\)。`);
        continue;
      }
      if (mode === 3) {
        questions.push(`若 \\(g(x)=\\frac{${a}^x+${a}^{-x}}{2}\\)，求其最小值。`);
        answers.push(`簡答：1。過程：令 \\(t=${a}^x>0\\)，\\(\\frac{t+1/t}{2}\\ge1\\)，等號在 \\(t=1\\)。`);
        continue;
      }
      questions.push(`設 \\(f(x)=\\frac{${a}^{2x}-${a}^{-2x}}{2}\\)，用 \\(f(x)\\) 的想法說明其奇偶性。`);
      answers.push(`簡答：奇函數。過程：代入 \\(-x\\) 後，兩項互換並整體變號。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS321IntersectionRootCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`判定方程式 \\(2^x=x^2\\) 有幾個實數解。`);
        answers.push(`簡答：3 個。過程：觀察 \\(y=2^x\\) 與 \\(y=x^2\\) 的交點，可由圖形與代入區間判定共有 3 個。`);
        continue;
      }
      if (mode === 1) {
        questions.push(`判定方程式 \\(10^x=x\\) 有幾個實根。`);
        answers.push(`簡答：0 個。過程：若 \\(x\\le0\\)，左式正而右式非正；若 \\(x>0\\)，\\(10^x>x\\)，所以無解。`);
        continue;
      }
      if (mode === 2) {
        questions.push(`求 \\(y=2^x\\) 與 \\(y=x^2\\) 的圖形交點個數。`);
        answers.push(`簡答：3 個。過程：等同判斷方程 \\(2^x=x^2\\)，可用圖形或符號變化分區判斷。`);
        continue;
      }
      if (mode === 3) {
        questions.push(`判定 \\((\\frac12)^x=x+1\\) 的實根個數。`);
        answers.push(
          `簡答：1 個。過程：左式 \\((\\frac12)^x\\) 遞減，右式 \\(x+1\\) 遞增，因此至多一個交點；代入 \\(x=0\\) 成立，所以恰有 1 個實根。`
        );
        continue;
      }
      questions.push(`利用圖形判定 \\(2^x=-x+2\\) 有幾個解。`);
      answers.push(
        `簡答：1 個。過程：令 \\(F(x)=2^x+x-2\\)，則 \\(F'(x)=(\\ln2)2^x+1>0\\)，所以 \\(F\\) 嚴格遞增；又 \\(F(0)=-1,F(1)=1\\)，因此恰有 1 個實根。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS321ParameterFromGraphSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        questions.push(`函數 \\(y=c\\cdot a^x+k\\) 通過 \\((0,0),(1,4),(-1,-\\frac43)\\)，求 \\(a,c,k\\)。`);
        answers.push(
          `簡答：\\(a=3,c=3,k=-3\\)。過程：代入三點得 \\(c+k=0\\)、\\(ca+k=4\\)、\\(c/a+k=-\\frac43\\)，解聯立可得。`
        );
        continue;
      }
      if (mode === 1) {
        questions.push(`已知指數函數通過 \\((0,16)\\) 與 \\((1,8)\\)，求形如 \\(y=C\\cdot r^x\\) 的函數式。`);
        answers.push(
          `簡答：\\(y=16(\\frac12)^x\\)。過程：代入 \\(x=0\\) 得 \\(C=16\\)，再由 \\(16r=8\\) 得 \\(r=\\frac12\\)。`
        );
        continue;
      }
      if (mode === 2) {
        questions.push(`某細菌在 2 天後有 20000 個，3.5 天後有 160000 個，求其增殖倍率模型的底數。`);
        answers.push(`簡答：每日倍率為 4。過程：設 \\(N(t)=C a^t\\)，兩式相除得 \\(a^{1.5}=8\\)，所以 \\(a=4\\)。`);
        continue;
      }
      if (mode === 3) {
        questions.push(`已知一指數圖形的水平漸近線為 \\(y=-2\\)，且通過 \\((0,0)\\)，寫出一個可能的解析式。`);
        answers.push(
          `簡答：例如 \\(y=2\\cdot2^x-2\\)。過程：設 \\(y=C a^x-2\\)，代入 \\((0,0)\\) 得 \\(C-2=0\\)，所以 \\(C=2\\)。取 \\(a=2\\) 可得一個可能式 \\(y=2\\cdot2^x-2\\)。`
        );
        continue;
      }
      questions.push(`已知 \\(y=a^x\\) 通過 \\((2,9)\\)，求 \\(y=27\\) 對應的 \\(x\\)。`);
      answers.push(`簡答：3。過程：由 \\(a^2=9\\) 且 \\(a>0\\)，得 \\(a=3\\)。所以 \\(3^x=27\\)，\\(x=3\\)。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS321BasicFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS321ExponentLawSet,
        buildS321SizeComparisonSet,
        buildS321EquationSet,
        buildS321InequalitySet,
        buildS321ApplicationSet,
      ],
      count
    );
  }

  function buildS321GraphExtremaFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS321GraphFeatureSet,
        buildS321GraphTransformSet,
        buildS321CompositeExtremaSet,
        buildS321AdvancedInequalitySet,
        buildS321AdvancedComparisonSet,
      ],
      count
    );
  }

  function buildS321AdvancedAlgebraFiveSubtypeMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS321FunctionalEquationSet,
        buildS321SymmetricExpressionSet,
        buildS321HyperbolicFunctionSet,
        buildS321IntersectionRootCountSet,
        buildS321ParameterFromGraphSet,
      ],
      count
    );
  }

  function buildS321ExponentLawSubtypeSet(count) {
    return buildS321ExponentLawSet(count);
  }

  function buildS321SizeComparisonSubtypeSet(count) {
    return buildS321SizeComparisonSet(count);
  }

  function buildS321EquationSubtypeSet(count) {
    return buildS321EquationSet(count);
  }

  function buildS321InequalitySubtypeSet(count) {
    return buildS321InequalitySet(count);
  }

  function buildS321ApplicationSubtypeSet(count) {
    return buildS321ApplicationSet(count);
  }

  function buildS321GraphFeatureSubtypeSet(count) {
    return buildS321GraphFeatureSet(count);
  }

  function buildS321GraphTransformSubtypeSet(count) {
    return buildS321GraphTransformSet(count);
  }

  function buildS321CompositeExtremaSubtypeSet(count) {
    return buildS321CompositeExtremaSet(count);
  }

  function buildS321AdvancedInequalitySubtypeSet(count) {
    return buildS321AdvancedInequalitySet(count);
  }

  function buildS321AdvancedComparisonSubtypeSet(count) {
    return buildS321AdvancedComparisonSet(count);
  }

  function buildS321FunctionalEquationSubtypeSet(count) {
    return buildS321FunctionalEquationSet(count);
  }

  function buildS321SymmetricExpressionSubtypeSet(count) {
    return buildS321SymmetricExpressionSet(count);
  }

  function buildS321HyperbolicFunctionSubtypeSet(count) {
    return buildS321HyperbolicFunctionSet(count);
  }

  function buildS321IntersectionRootCountSubtypeSet(count) {
    return buildS321IntersectionRootCountSet(count);
  }

  function buildS321ParameterFromGraphSubtypeSet(count) {
    return buildS321ParameterFromGraphSet(count);
  }


  // ── NEW: 不同底數指數方程 (s3-2-1) ──────────────────────────
  function buildS321DiffBaseExpEquationSet(count) {
    const caseMakers = [
      () => {
        // a^x = b^(x+k)  →  x = k·lg(b)/(lg(a)-lg(b))
        const pairs = [[5,3],[4,3],[3,2],[6,2],[5,2]];
        const [a, b] = pairs[randInt(0, pairs.length-1)];
        const k = s321Pick([1,2,3]);
        return {
          q: `解方程式 \\(${a}^x=${b}^{x+${k}}\\)。`,
          a: `簡答：\\(x=\\dfrac{${k}\\lg ${b}}{\\lg ${a}-\\lg ${b}}\\)。過程：兩邊取常用對數，\\(x\\lg ${a}=(x+${k})\\lg ${b}\\)，整理得 \\(x(\\lg ${a}-\\lg ${b})=${k}\\lg ${b}\\)。`
        };
      },
      () => {
        // a^(x+k) = b^x  →  x = k·lg(a)/(lg(b)-lg(a))
        const pairs = [[2,3],[2,5],[3,5],[4,7],[3,7]];
        const [a, b] = pairs[randInt(0, pairs.length-1)];
        const k = s321Pick([1,2]);
        return {
          q: `解方程式 \\(${a}^{x+${k}}=${b}^x\\)。`,
          a: `簡答：\\(x=\\dfrac{${k}\\lg ${a}}{\\lg ${b}-\\lg ${a}}\\)。過程：兩邊取常用對數，\\((x+${k})\\lg ${a}=x\\lg ${b}\\)，整理得 \\(x(\\lg ${b}-\\lg ${a})=${k}\\lg ${a}\\)。`
        };
      },
      () => {
        // p^(2x-k) = q^x  →  x = k·lg(p)/(2·lg(p)-lg(q))
        const pairs = [[3,5],[3,7],[2,5],[5,7]];
        const [p, q] = pairs[randInt(0, pairs.length-1)];
        const k = s321Pick([1,2]);
        return {
          q: `解方程式 \\(${p}^{2x-${k}}=${q}^x\\)。`,
          a: `簡答：\\(x=\\dfrac{${k}\\lg ${p}}{2\\lg ${p}-\\lg ${q}}\\)。過程：兩邊取常用對數，\\((2x-${k})\\lg ${p}=x\\lg ${q}\\)，整理得 \\(x(2\\lg ${p}-\\lg ${q})=${k}\\lg ${p}\\)。`
        };
      },
      () => {
        // b^x = 10^(x-k)  →  x·lg(b) = x-k  →  x = k/(1-lg(b))
        const b = s321Pick([2,3,4,5,6]);
        const k = s321Pick([1,2,3]);
        return {
          q: `解方程式 \\(${b}^x=10^{x-${k}}\\)。`,
          a: `簡答：\\(x=\\dfrac{${k}}{1-\\lg ${b}}\\)。過程：兩邊取常用對數，\\(x\\lg ${b}=x-${k}\\)，整理得 \\(x(1-\\lg ${b})=${k}\\)，故 \\(x=${k}/(1-\\lg ${b})\\)。`
        };
      },
      () => {
        // 4^x = 3^(x+k)  →  2x·lg2 = (x+k)·lg3  →  x(2lg2-lg3) = k·lg3
        const pairs = [[4,3],[4,5],[9,5],[9,2]];
        const [a2, b2] = pairs[randInt(0, pairs.length-1)];
        const la = a2 === 4 ? '2\\lg 2' : (a2===9 ? '2\\lg 3' : `\\lg ${a2}`);
        const k2 = s321Pick([1,2,3]);
        return {
          q: `解方程式 \\(${a2}^x=${b2}^{x+${k2}}\\)。`,
          a: `簡答：\\(x=\\dfrac{${k2}\\lg ${b2}}{${la}-\\lg ${b2}}\\)。過程：兩邊取常用對數，\\(x\\lg ${a2}=(x+${k2})\\lg ${b2}\\)，整理後除以係數得解。`
        };
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i++) {
      const { q, a } = caseMakers[i % caseMakers.length]();
      questions.push(q);
      answers.push(a);
    }
    return { questions, summaryAnswers, answers };
  }
  function buildS321DiffBaseExpEquationSubtypeSet(count) {
    return buildS321DiffBaseExpEquationSet(count);
  }

  function s322Pick(items) {
    return items[randInt(0, items.length - 1)];
  }

  function s322M(expr) {
    return '\\(' + expr + '\\)';
  }

  function s322FormatMathInText(text) {
    return String(text || '')
      .split(/(\\\(.+?\\\))/g)
      .map((part) => {
        if (/^\\\(.+\\\)$/u.test(part)) return part;
        return part.replace(
          /([\\A-Za-z0-9{}_^+\-*/=<>()[\]., ]*[\\_^=<>+\-*/][\\A-Za-z0-9{}_^+\-*/=<>()[\]., ]*)/g,
          (match) => {
            const leading = match.match(/^\s*/u)[0];
            const trailing = match.match(/\s*$/u)[0];
            const expr = match.trim();
            if (!expr || /^[+\-*/=<>.,]+$/u.test(expr) || /^[A-Z]+-[A-Z]+$/u.test(expr)) return match;
            return leading + s322M(expr) + trailing;
          }
        );
      })
      .join('');
  }

  function s322Ans(shortAnswer, process) {
    var normalizedProcess = String(process || '').replace(/。+$/g, '');
    return '簡答：' + shortAnswer + '。過程：' + s322FormatMathInText(normalizedProcess) + '。';
  }

  function s322Log(base, arg) {
    return '\\log_{' + base + '}' + (arg || '');
  }

  function s322Frac(num, den) {
    if (Number.isInteger(num) && Number.isInteger(den)) return formatFraction(num, den);
    return '\\frac{' + num + '}{' + den + '}';
  }

  function s322Pow(base, exp) {
    return base + '^{' + exp + '}';
  }

  function s322Item(question, shortAnswer, process) {
    return { question, answer: s322Ans(shortAnswer, process) };
  }

  function s322MakeSet(count, builders) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = builders[i % builders.length]();
      questions.push(item.question);
      answers.push(item.answer);
    }
    return { questions, summaryAnswers, answers };
  }

  function s322Single(builder) {
    const set = builder(1);
    return { question: set.questions[0], answer: set.answers[0] };
  }

  function buildS322DefinitionSet(count = 5) {
    const builders = [
      () => {
        const b = s322Pick([2, 3, 5, 7]);
        const n = randInt(2, 6);
        return s322Item(
          '求 ' + s322M(s322Log(b, s322Pow(b, n))) + ' 的值。',
          String(n),
          '依定義，' + b + ' 的 ' + n + ' 次方等於真數，所以對數值為 ' + n
        );
      },
      () => {
        const b = s322Pick([2, 3, 4, 5]);
        const n = randInt(2, 5);
        return s322Item(
          '若 ' + s322M(s322Log(b, 'x') + '=-' + n) + '，求 ' + s322M('x') + '。',
          s322M('x=' + s322Frac(1, Math.pow(b, n))),
          '由對數定義得 x=' + b + '^{-' + n + '}=' + s322Frac(1, Math.pow(b, n))
        );
      },
      () => {
        const b = s322Pick([2, 3, 5, 7]);
        const n = randInt(1, 4);
        return s322Item(
          '計算 ' + s322M(s322Log(b, s322Frac(1, Math.pow(b, n)))) + ' 的值。',
          String(-n),
          '因為 ' + s322Frac(1, Math.pow(b, n)) + '=' + b + '^{-' + n + '}，所以對數值為 -' + n
        );
      },
      () => {
        const b = s322Pick([2, 3, 5]);
        const p = randInt(2, 4);
        const q = randInt(3, 9);
        return s322Item(
          '求 ' + s322M(s322Log(s322Pow(b, p), s322Pow(b, q))) + ' 的值。',
          s322M(s322Frac(q, p)),
          '設值為 t，則 (' + b + '^{' + p + '})^t=' + b + '^{' + q + '}，故 pt=' + q + '，t=' + s322Frac(q, p)
        );
      },
      () => {
        const x = s322Pick([2, 3, 4, 5]);
        const n = randInt(2, 4);
        const value = Math.pow(x, n);
        return s322Item(
          '若 ' + s322M(s322Log('x', value) + '=' + n) + '，求 ' + s322M('x') + '。',
          s322M('x=' + x),
          '由 x^{' + n + '}=' + value + '，且底數 x>0、x\\ne1，所以 x=' + x
        );
      },
    ];
    return s322MakeSet(count, builders);
  }

  function buildS322LawSimplificationSet(count = 5) {
    const builders = [
      () => {
        const a = s322Pick([3, 5, 7, 9]);
        const b = s322Pick([2, 4, 6, 8]);
        return s322Item(
          '化簡 ' + s322M(s322Log(10, s322Frac(a, b)) + '+' + s322Log(10, b)) + '。',
          s322M(s322Log(10, a)),
          '同底對數相加可合併為乘法，故為 \\log_{10}(' + s322Frac(a, b) + '\\cdot' + b + ')=\\log_{10}' + a
        );
      },
      () => {
        const p = randInt(2, 4);
        const b = s322Pick([2, 3, 5]);
        return s322Item(
          '將 ' + s322M(p + s322Log(b, 'x') + '-' + p + s322Log(b, 'y')) + ' 合併為單一對數。',
          s322M(s322Log(b, s322Frac('x^{' + p + '}', 'y^{' + p + '}'))),
          '先用係數移入次方，再用減法律化成除法。'
        );
      },
      () => {
        const b = s322Pick([2, 3, 6]);
        const n = randInt(2, 5);
        return s322Item(
          '化簡 ' + s322M(s322Log(b, 'x^{' + n + '}') + '-' + s322Log(b, 'x')) + '。',
          s322M(n - 1 + s322Log(b, 'x')),
          '同底相減為相除，得到 \\log_{' + b + '}x^{' + (n - 1) + '}=' + (n - 1) + '\\log_{' + b + '}x'
        );
      },
      () => {
        const b = s322Pick([3, 4, 5]);
        return s322Item(
          '計算 ' + s322M('(' + s322Log(b, b * b) + '+' + s322Log(b, b) + ')^2') + ' 的值。',
          '9',
          '因為 \\log_{' + b + '}' + b * b + '=2 且 \\log_{' + b + '}' + b + '=1，所以平方為 (2+1)^2=9'
        );
      },
      () => {
        const b = s322Pick([2, 5, 10]);
        const m = s322Pick([2, 3, 4]);
        return s322Item(
          '化簡 ' + s322M(m + s322Log(b, '(3x+2y)') + '-' + m + s322Log(b, '(6x+4y)')) + '。',
          s322M(m + s322Log(b, s322Frac(1, 2))),
          '因為 6x+4y=2(3x+2y)，合併後為 ' + m + '\\log_{' + b + '}\\frac{1}{2}'
        );
      },
    ];
    return s322MakeSet(count, builders);
  }

  function buildS322SubstitutionSet(count = 5) {
    const builders = [
      () =>
        s322Item(
          '設 ' +
            s322M(s322Log(10, '2') + '=a,' + s322Log(10, '3') + '=b') +
            '，試以 ' +
            s322M('a,b') +
            ' 表示 ' +
            s322M(s322Log(10, '1.2')) +
            '。',
          s322M('a+b-1'),
          '1.2=12/10，故 \\log_{10}1.2=\\log_{10}12-1=a+b-1'
        ),
      () =>
        s322Item(
          '設 ' +
            s322M(s322Log(10, '2') + '=a,' + s322Log(10, '3') + '=b') +
            '，試以 ' +
            s322M('a,b') +
            ' 表示 ' +
            s322M(s322Log(5, '2')) +
            '。',
          s322M(s322Frac('a', '1-a')),
          '換底得 \\log_{5}2=\\frac{\\log_{10}2}{\\log_{10}5}=\\frac{a}{1-a}'
        ),
      () => {
        const n = s322Pick([18, 24, 72, 180]);
        const ans = n === 18 ? 'a+2b' : n === 24 ? '3a+b' : n === 72 ? '3a+2b' : '2a+2b+1';
        return s322Item(
          '若 ' +
            s322M(s322Log(10, '2') + '=a,' + s322Log(10, '3') + '=b') +
            '，試以 ' +
            s322M('a,b') +
            ' 表示 ' +
            s322M(s322Log(10, String(n))) +
            '。',
          s322M(ans),
          '將 ' + n + ' 分解為 2、3 與 10 的乘積後使用加法律。'
        );
      },
      () =>
        s322Item(
          '設 ' +
            s322M('a=' + s322Log(2, '3') + ',b=' + s322Log(3, '7')) +
            '，試以 ' +
            s322M('a,b') +
            ' 表示 ' +
            s322M(s322Log(12, '42')) +
            '。',
          s322M(s322Frac('ab+b+1', 'a+2')),
          '以底數 3 換底，分子為 \\log_{3}42=1+b+ab，分母為 \\log_{3}12=a+2。'
        ),
      () =>
        s322Item(
          '設 ' +
            s322M('a=' + s322Log(2, '3') + ',b=' + s322Log(3, '11')) +
            '，試以 ' +
            s322M('a,b') +
            ' 表示 ' +
            s322M(s322Log(44, '66')) +
            '。',
          s322M(s322Frac('1+a+ab', '2+a+b')),
          '以底數 2 換底，\\log_{2}66=1+a+ab，\\log_{2}44=2+a+b。'
        ),
    ];
    return s322MakeSet(count, builders);
  }

  function buildS322BasicEquationSet(count = 5) {
    const builders = [
      () => {
        const b = s322Pick([2, 3, 5]);
        const n = randInt(2, 4);
        const shift = randInt(1, 5);
        return s322Item(
          '解方程式 ' + s322M(s322Log(b, '(x+' + shift + ')') + '=' + n) + '。',
          s322M('x=' + (Math.pow(b, n) - shift)),
          '由 x+' + shift + '=' + Math.pow(b, n) + '，解得 x=' + (Math.pow(b, n) - shift) + '，且真數為正。'
        );
      },
      () => {
        const b = s322Pick([3, 4, 5]);
        const n = randInt(2, 4);
        const shift = randInt(1, 6);
        return s322Item(
          '解方程式 ' + s322M(s322Log(b, '(x-' + shift + ')') + '=' + n) + '。',
          s322M('x=' + (Math.pow(b, n) + shift)),
          '由 x-' + shift + '=' + Math.pow(b, n) + '，所以 x=' + (Math.pow(b, n) + shift) + '。'
        );
      },
      () =>
        s322Item(
          '解方程式 ' + s322M(s322Log(2, 'x') + '+' + s322Log(2, '(x-2)') + '=3') + '。',
          s322M('x=4'),
          '合併得 x(x-2)=8，且 x>2；解得 x=4。'
        ),
      () =>
        s322Item(
          '解方程式 ' + s322M(s322Log(3, 'k') + '+' + s322Log(3, '(2k+3)') + '=2') + '。',
          s322M('k=' + s322Frac(3, 2)),
          '合併得 k(2k+3)=9，取正根 k=3/2。'
        ),
      () =>
        s322Item(
          '解方程式 ' + s322M('1+' + s322Log(2, 'x') + '=' + s322Log(4, '(x+3)')) + '。',
          s322M('x=1'),
          '改成以 2 為底：2+\\log_{2}x=\\frac{1}{2}\\log_{2}(x+3)，整理並檢查真數後得 x=1。'
        ),
    ];
    return s322MakeSet(count, builders);
  }

  function buildS322DomainSet(count = 5) {
    const builders = [
      () => {
        const h = randInt(2, 5);
        return s322Item(
          '若 ' + s322M(s322Log('x+' + h, '(x^2-2x+15)')) + ' 有意義，求實數 ' + s322M('x') + ' 的範圍。',
          s322M('x>-' + h + ',\\ x\\ne' + (1 - h)),
          '真數 x^2-2x+15 恆正，只需底數 x+' + h + '>0 且 x+' + h + '\\ne1。'
        );
      },
      () =>
        s322Item(
          '判斷下列對數是否有意義：' +
            s322M(s322Log(1, '5') + ',' + s322Log(4, '(-3)') + ',' + s322Log(10, '0')) +
            '。',
          '三者皆無意義',
          '底數不能為 1，真數必須大於 0；三個式子各違反其中一項。'
        ),
      () =>
        s322Item(
          '若 ' + s322M(s322Log('x', '(x+2)')) + ' 有意義，求 ' + s322M('x') + ' 的範圍。',
          s322M('x>0,\\ x\\ne1'),
          '底數 x>0 且 x\\ne1；真數 x+2>0，合併後為 x>0 且 x\\ne1。'
        ),
      () =>
        s322Item(
          '若 ' + s322M(s322Log('2-x', '(x+1)')) + ' 有意義，求 ' + s322M('x') + ' 的範圍。',
          s322M('-1<x<2,\\ x\\ne1'),
          '真數 x+1>0，底數 2-x>0 且 2-x\\ne1，合併得 -1<x<2 且 x\\ne1。'
        ),
      () =>
        s322Item(
          '若 ' + s322M(s322Log('x-1', '(3x-5)')) + ' 有意義，求 ' + s322M('x') + ' 的限制條件。',
          s322M('x>' + s322Frac(5, 3) + ',\\ x\\ne2'),
          '真數 3x-5>0，底數 x-1>0 且 x-1\\ne1，合併後得 x>5/3 且 x\\ne2。'
        ),
    ];
    return s322MakeSet(count, builders);
  }

  function buildS322BasicMixedSet(count = 5) {
    const pools = [
      buildS322DefinitionSet,
      buildS322LawSimplificationSet,
      buildS322SubstitutionSet,
      buildS322BasicEquationSet,
      buildS322DomainSet,
    ];
    return s322MakeSet(
      count,
      pools.map((builder) => () => s322Single(builder))
    );
  }

  function buildS322MonotoneInequalitySet(count = 5) {
    const builders = [
      () => {
        const b = s322Pick([2, 3, 5]);
        const c = s322Pick([2, 3, 4]);
        return s322Item(
          '解不等式 ' + s322M(s322Log(b, '(' + c + 'x)') + '>' + s322Log(b, '(x+' + c + ')')) + '。',
          s322M('x>' + s322Frac(c, c - 1)),
          '底數 ' + b + '>1，方向不變；比較 ' + c + 'x>x+' + c + '，並合併真數為正的條件。'
        );
      },
      () =>
        s322Item(
          '解不等式 ' + s322M(s322Log(s322Frac(1, 3), 'x') + '>2') + '。',
          s322M('0<x<' + s322Frac(1, 9)),
          '底數介於 0 與 1，方向反向：x<(1/3)^2。'
        ),
      () =>
        s322Item(
          '解不等式 ' + s322M(s322Log(3, '(5x)') + '\\le ' + s322Log(3, '(x+4)')) + '。',
          s322M('0<x\\le1'),
          '底數 3>1，方向不變；5x\\le x+4 得 x\\le1，再合併 x>0。'
        ),
      () =>
        s322Item(
          '解不等式 ' + s322M(s322Log(s322Frac(1, 2), '(3x-1)') + '\\ge -2') + '。',
          s322M(s322Frac(1, 3) + '<x\\le' + s322Frac(5, 3)),
          '底數小於 1，方向反向；3x-1\\le4，且 3x-1>0。'
        ),
      () =>
        s322Item(
          '求滿足 ' + s322M(s322Log(0.5, '(x^2-3x+2)') + '>' + s322Log(0.5, '(x+1)')) + ' 的 ' + s322M('x') + ' 範圍。',
          s322M('2-\\sqrt{3}<x<1,\\ \\text{或}\\ 2<x<2+\\sqrt{3}'),
          '真數條件給 -1<x<1 或 x>2。底數 0.5<1，故 x^2-3x+2<x+1，得 2-\\sqrt{3}<x<2+\\sqrt{3}；兩者交集即答案。'
        ),
    ];
    return s322MakeSet(count, builders);
  }

  function buildS322LawInequalitySet(count = 5) {
    const builders = [
      () =>
        s322Item(
          '解不等式 ' + s322M(s322Log(2, 'x') + '+' + s322Log(2, '(x+1)') + '>1') + '。',
          s322M('x>1'),
          '合併為 \\log_{2}(x(x+1))>1，得 x(x+1)>2，且 x>0。'
        ),
      () =>
        s322Item(
          '解不等式 ' + s322M(s322Log(3, '(x-4)') + '<' + s322Log(9, '(x-2)')) + '。',
          s322M('4<x<6'),
          '定義域為 x>4。將右式換底為 \\frac{1}{2}\\log_{3}(x-2)，同乘 2 後得 (x-4)^2<x-2，解得 3<x<6，再與定義域取交集。'
        ),
      () =>
        s322Item(
          '解不等式 ' + s322M('2+' + s322Log(3, '(x-2)') + '\\le ' + s322Log(3, '(x+6)')) + '。',
          s322M('2<x\\le3'),
          '將 2 寫成 \\log_{3}9，合併得 9(x-2)\\le x+6，並檢查 x>2。'
        ),
      () =>
        s322Item(
          '解不等式 ' +
            s322M(s322Log(s322Frac(1, 2), '(x-1)') + '+' + s322Log(s322Frac(1, 2), '(x-3)') + '\\ge -3') +
            '。',
          s322M('3<x\\le5'),
          '先得 x>3，再合併為 \\log_{1/2}((x-1)(x-3))\\ge-3；因底數小於 1，轉成 (x-1)(x-3)\\le8，得 -1\\le x\\le5，最後取 x>3。'
        ),
      () =>
        s322Item(
          '解不等式 ' + s322M(s322Log(0.7, '(x-3)') + '>' + s322Log(0.49, '(x^2-3x-2)')) + '。',
          s322M('x>' + s322Frac(11, 3)),
          '定義域要求 x>3 且 x^2-3x-2>0。因 0.49=0.7^2，右式等於 \\frac{1}{2}\\log_{0.7}(x^2-3x-2)=\\log_{0.7}\\sqrt{x^2-3x-2}；底數小於 1，故 x-3<\\sqrt{x^2-3x-2}，解得 x>11/3。'
        ),
    ];
    return s322MakeSet(count, builders);
  }

  function buildS322QuadraticLogInequalitySet(count = 5) {
    const builders = [
      () =>
        s322Item(
          '解不等式 ' + s322M('(' + s322Log(2, 'x') + ')^2-3' + s322Log(2, 'x') + '-4\\le0') + '。',
          s322M(s322Frac(1, 2) + '\\le x\\le16'),
          '令 t=\\log_{2}x，解 (t-4)(t+1)\\le0 得 -1\\le t\\le4。'
        ),
      () =>
        s322Item(
          '解不等式 ' + s322M('(\\log x)^2-2\\log x-15>0') + '。',
          s322M('0<x<10^{-3},\\ \\text{或}\\ x>10^5'),
          '令 t=\\log x，則 (t-5)(t+3)>0，所以 t<-3 或 t>5；再轉回 x。'
        ),
      () =>
        s322Item(
          '若 ' +
            s322M('1\\le x\\le27') +
            '，求 ' +
            s322M('f(x)=(' + s322Log(3, 'x') + ')^2-4' + s322Log(3, 'x') + '+5') +
            ' 的最大值與最小值。',
          '最大值 5，最小值 1',
          '令 t=\\log_{3}x，則 0\\le t\\le3，f=(t-2)^2+1。'
        ),
      () =>
        s322Item(
          '解不等式 ' + s322M('2(\\log_{10}x)^2-5\\log_{10}x+2\\ge0') + '。',
          s322M('0<x\\le\\sqrt{10},\\ \\text{或}\\ x\\ge100'),
          '令 t=\\log_{10}x，二次式分解為 (2t-1)(t-2)\\ge0，所以 t\\le1/2 或 t\\ge2，再回代。'
        ),
      () =>
        s322Item(
          '解不等式 ' + s322M(s322Log(2, '(x^2+x+1)') + '+\\sqrt{' + s322Log(2, '(x^2+x+1)') + '}<2') + '。',
          s322M(s322Frac('-1-\\sqrt{5}', 2) + '<x\\le-1,\\ \\text{或}\\ 0\\le x<' + s322Frac('-1+\\sqrt{5}', 2)),
          '令 t=\\sqrt{\\log_{2}(x^2+x+1)}，則 t^2+t<2 且 t\\ge0，得 0\\le t<1。故 1\\le x^2+x+1<2，再解二次不等式。'
        ),
    ];
    return s322MakeSet(count, builders);
  }

  function buildS322NestedLogSet(count = 5) {
    const builders = [
      () =>
        s322Item(
          '若 ' + s322M(s322Log(3, '(' + s322Log(2, 'x') + ')')) + ' 有意義，求 ' + s322M('x') + ' 的範圍。',
          s322M('x>1'),
          '最外層真數需大於 0，所以 \\log_{2}x>0，得 x>1。'
        ),
      () =>
        s322Item(
          '若 ' +
            s322M(s322Log(s322Frac(1, 2), '(' + s322Log(3, 'x') + ')')) +
            ' 有意義，求 ' +
            s322M('x') +
            ' 的範圍。',
          s322M('x>1'),
          '外層真數需大於 0，所以 \\log_{3}x>0，得 x>1；底數 1/2 本身合法。'
        ),
      () =>
        s322Item(
          '解不等式 ' + s322M('0<' + s322Log(s322Frac(1, 2), '(' + s322Log(2, 'x') + ')') + '<2') + '。',
          s322M('2^{1/4}<x<2'),
          '令 u=\\log_{2}x。因底數 1/2 小於 1，0<\\log_{1/2}u<2 等價於 1/4<u<1，所以 2^{1/4}<x<2。'
        ),
      () =>
        s322Item(
          '若 ' +
            s322M(s322Log(4, '(' + s322Log(s322Frac(1, 3), '(' + s322Log(2, '(x+1)') + ')') + ')')) +
            ' 有意義，求 ' +
            s322M('x') +
            ' 的範圍。',
          s322M('0<x<1'),
          '外層要求 \\log_{1/3}(\\log_{2}(x+1))>0。因底數 1/3 小於 1，所以 0<\\log_{2}(x+1)<1，得 0<x<1。'
        ),
      () =>
        s322Item(
          '解不等式 ' +
            s322M(s322Log(2, '(' + s322Log(s322Frac(1, 2), '(' + s322Log(2, 'x') + ')') + ')') + '>1') +
            '。',
          s322M('1<x<2^{1/4}'),
          '令 u=\\log_{2}x，v=\\log_{1/2}u。由 \\log_{2}v>1 得 v>2；再由底數 1/2 遞減得 0<u<1/4，因此 1<x<2^{1/4}。'
        ),
    ];
    return s322MakeSet(count, builders);
  }

  function buildS322UnknownBaseDomainSet(count = 5) {
    const builders = [
      () =>
        s322Item(
          '解不等式 ' + s322M(s322Log('x', '(x+2)') + '\\le1') + '。',
          s322M('0<x<1'),
          '定義域為 x>0 且 x\\ne1。若 x>1，需 x+2\\le x，不可能；若 0<x<1，方向反轉，x+2\\ge x 恆成立。'
        ),
      () =>
        s322Item(
          '若 ' + s322M(s322Log('x-2', '(-x^2+5x-4)')) + ' 有意義，求 ' + s322M('x') + ' 的範圍。',
          s322M('2<x<3,\\ \\text{或}\\ 3<x<4'),
          '底數 x-2>0 且 x-2\\ne1，真數 -(x-1)(x-4)>0；合併後為 2<x<4 且 x\\ne3。'
        ),
      () =>
        s322Item(
          '若 ' + s322M(s322Log('x+2', '(x^2-2x+15)')) + ' 有意義，求實數 ' + s322M('x') + ' 的範圍。',
          s322M('x>-2,\\ x\\ne-1'),
          '真數恆正，底數需滿足 x+2>0 且 x+2\\ne1。'
        ),
      () =>
        s322Item(
          '若 ' + s322M(s322Log('x-1', '(3x-5)')) + ' 有意義，求 ' + s322M('x') + ' 的限制條件。',
          s322M('x>' + s322Frac(5, 3) + ',\\ x\\ne2'),
          '真數與底數條件同時成立。'
        ),
      () =>
        s322Item(
          '解不等式 ' + s322M(s322Log('x-1', '(x+1)') + '>1') + '。',
          s322M('x>2'),
          '定義域為 x>1 且 x\\ne2。若 x>2，底數大於 1，x+1>x-1 恆成立；若 1<x<2，方向反轉但 x+1<x-1 不可能。'
        ),
    ];
    return s322MakeSet(count, builders);
  }

  function buildS322InequalityMixedSet(count = 5) {
    const pools = [
      buildS322MonotoneInequalitySet,
      buildS322LawInequalitySet,
      buildS322QuadraticLogInequalitySet,
      buildS322NestedLogSet,
      buildS322UnknownBaseDomainSet,
    ];
    return s322MakeSet(
      count,
      pools.map((builder) => () => s322Single(builder))
    );
  }

  function buildS322ChainProductSet(count = 5) {
    const builders = [
      () =>
        s322Item(
          '計算 ' + s322M(s322Log(2, '3') + '\\cdot' + s322Log(3, '4') + '\\cdot' + s322Log(4, '8')) + ' 的值。',
          '3',
          '連鎖相乘可消去中間底數，最後得到 \\log_{2}8=3。'
        ),
      () =>
        s322Item(
          '求 ' +
            s322M(
              '(' + s322Log(2, '3') + '+' + s322Log(4, '9') + ')(' + s322Log(3, '4') + '+' + s322Log(9, '2') + ')'
            ) +
            ' 的值。',
          '依換底化為同一變數後計算',
          '令 a=\\log_{2}3，則各項可改寫成 a 或 1/a，再化簡。'
        ),
      () =>
        s322Item(
          '計算 ' + s322M(s322Log(3, '5') + '\\cdot' + s322Log(5, '7') + '\\cdot' + s322Log(7, '81')) + ' 的值。',
          '4',
          '連鎖消去後為 \\log_{3}81=4。'
        ),
      () =>
        s322Item(
          '化簡 ' +
            s322M(s322Log('a', 'b') + '\\cdot' + s322Log('b', 'c') + '\\cdot' + s322Log('c', 'a')) +
            ' 的結果。',
          '1',
          '換底後分子分母完全相消。'
        ),
      () =>
        s322Item(
          '求 ' + s322M(s322Log('\\sqrt{2}', '3') + '\\cdot' + s322Log(9, '16')) + ' 的精確值。',
          '4',
          '第一項為 2\\log_{2}3，第二項為 2\\log_{3}2，相乘得 4。'
        ),
    ];
    return s322MakeSet(count, builders);
  }

  function buildS322ExponentPositionSet(count = 5) {
    const builders = [
      () => s322Item('求 ' + s322M('3^{' + s322Log(3, '5') + '}') + ' 的值。', '5', 'a^{\\log_{a} b}=b。'),
      () =>
        s322Item(
          '計算 ' + s322M('5^{' + s322Log(7, '3') + '}-3^{' + s322Log(7, '5') + '}') + ' 之值。',
          '0',
          '利用 a^{\\log_{c} b}=b^{\\log_{c} a}，兩項相等。'
        ),
      () =>
        s322Item(
          '已知 ' + s322M('x^{' + s322Log(2, '5') + '}=25') + '，求 ' + s322M('x') + ' 之值。',
          '4',
          '25=5^2=(2^{\\log_{2}5})^2=4^{\\log_{2}5}，故 x=4。'
        ),
      () =>
        s322Item(
          '計算 ' + s322M('10^{2' + s322Log(10, '3') + '}') + ' 的簡化結果。',
          '9',
          '10^{2\\log_{10}3}=10^{\\log_{10}9}=9。'
        ),
      () =>
        s322Item(
          '求 ' + s322M('2^{' + s322Log(2, '3') + '+' + s322Log(2, '5') + '}') + ' 的值。',
          '15',
          '指數先合併為 \\log_{2}15，再用 a^{\\log_{a} b}=b。'
        ),
    ];
    return s322MakeSet(count, builders);
  }

  function buildS322LogExtremaSet(count = 5) {
    const builders = [
      () =>
        s322Item(
          '設 ' + s322M('x,y') + ' 為正數且 ' + s322M('x+y=90') + '，求 ' + s322M('\\log x+\\log y') + ' 的最大值。',
          s322M('\\log 2025'),
          '和固定時乘積 xy 最大發生在 x=y=45，故對數和最大為 \\log(45^2)。'
        ),
      () =>
        s322Item(
          '已知 ' + s322M(s322Log(2, 'x') + '+' + s322Log(2, 'y') + '=2') + '，求 ' + s322M('x+y') + ' 的最小值。',
          '4',
          '由 xy=4，正數和 x+y 的最小值為 2\\sqrt{xy}=4。'
        ),
      () =>
        s322Item(
          '若 ' +
            s322M('x,y>0') +
            ' 且 ' +
            s322M('x+4y=8') +
            '，求 ' +
            s322M(s322Log(s322Frac(1, 2), 'x') + '+' + s322Log(s322Frac(1, 2), 'y')) +
            ' 的最小值。',
          '先使 xy 最大',
          '底數 1/2 小於 1，對數和為 \\log_{1/2}(xy)，xy 越大值越小。'
        ),
      () =>
        s322Item(
          '在 ' + s322M('x+2y=12') + ' 的條件下，求 ' + s322M(s322Log(2, 'x') + '+' + s322Log(4, 'y')) + ' 的最大值。',
          '化成乘積極值後求得',
          '將 \\log_{4}y 改為 \\frac12\\log_{2}y，再用加權 AM-GM。'
        ),
      () =>
        s322Item(
          '設 ' + s322M('x>2') + '，求 ' + s322M('f(x)=2\\log(x-1)-\\log(x-2)') + ' 的最小值。',
          '4',
          '合併為 \\log\\frac{(x-1)^2}{x-2}，令 t=x-2>0，內部為 t+2+1/t，最小為 4。'
        ),
    ];
    return s322MakeSet(count, builders);
  }

  function buildS322DigitScientificSet(count = 5) {
    const builders = [
      () =>
        s322Item(
          '已知 ' +
            s322M(s322Log(10, '2') + '\\approx0.3010,' + s322Log(10, '3') + '\\approx0.4771') +
            '，求 ' +
            s322M('6^{100}') +
            ' 為幾位數。',
          '78 位',
          '100\\log_{10}6=100(0.3010+0.4771)=77.81，位數為 77+1=78。'
        ),
      () =>
        s322Item(
          '判定 ' + s322M('2^{100}') + ' 表為十進位數時是多少位數。',
          '31 位',
          '100\\log_{10}2\\approx30.10，位數為 30+1=31。'
        ),
      () =>
        s322Item(
          '將 ' + s322M('(5/6)^{100}') + ' 表示成小數，從小數點後第幾位開始出現不為 0 的數字？',
          '第 18 位',
          '用對數估計其介於 10^{-18} 與 10^{-17} 之間。'
        ),
      () =>
        s322Item(
          '求最小正整數 ' + s322M('n') + '，使得 ' + s322M('(5/4)^n>10^{20}') + '。',
          '由 ' + s322M('n\\log_{10}(5/4)>20') + ' 決定',
          '取滿足 n>20/\\log_{10}(5/4) 的最小整數。'
        ),
      () =>
        s322Item(
          '已知 ' + s322M('2^n') + ' 是最高位數字為 2 的 12 位數，求整數 ' + s322M('n') + ' 的可能值。',
          '由 ' + s322M('2\\times10^{11}\\le2^n<3\\times10^{11}') + ' 判定',
          '兩邊取常用對數即可得到 n 的整數範圍。'
        ),
    ];
    return s322MakeSet(count, builders);
  }

  function buildS322RadicalBaseSet(count = 5) {
    const builders = [
      () =>
        s322Item('計算 ' + s322M(s322Log(4, '8')) + ' 之值。', s322M(s322Frac(3, 2)), '4=2^2，8=2^3，所以值為 3/2。'),
      () =>
        s322Item(
          '求 ' + s322M(s322Log(27, '81')) + ' 的精確值。',
          s322M(s322Frac(4, 3)),
          '27=3^3，81=3^4，所以值為 4/3。'
        ),
      () =>
        s322Item(
          '化簡 ' + s322M(s322Log('\\sqrt{3}', '27')) + ' 的結果。',
          '6',
          '\\sqrt3=3^{1/2}，27=3^3，故值為 3/(1/2)=6。'
        ),
      () =>
        s322Item(
          '計算 ' + s322M(s322Log(0.25, s322Frac(1, 32))) + ' 之值。',
          s322M(s322Frac(5, 2)),
          '0.25=2^{-2}，1/32=2^{-5}，所以值為 (-5)/(-2)=5/2。'
        ),
      () =>
        s322Item(
          '求 ' + s322M(s322Log(16, '32') + '+' + s322Log(9, '\\sqrt{3}')) + ' 的和。',
          s322M(s322Frac(3, 2)),
          '前者為 5/4，後者為 1/4，總和為 3/2。'
        ),
    ];
    return s322MakeSet(count, builders);
  }

  function buildS322AdvancedMixedSet(count = 5) {
    const pools = [
      buildS322ChainProductSet,
      buildS322ExponentPositionSet,
      buildS322LogExtremaSet,
      buildS322DigitScientificSet,
      buildS322RadicalBaseSet,
    ];
    return s322MakeSet(
      count,
      pools.map((builder) => () => s322Single(builder))
    );
  }

  function buildS322DefinitionSubtypeSet(count = 5) {
    return buildS322DefinitionSet(count);
  }

  function buildS322LawSimplificationSubtypeSet(count = 5) {
    return buildS322LawSimplificationSet(count);
  }

  function buildS322SubstitutionSubtypeSet(count = 5) {
    return buildS322SubstitutionSet(count);
  }

  function buildS322BasicEquationSubtypeSet(count = 5) {
    return buildS322BasicEquationSet(count);
  }

  function buildS322DomainSubtypeSet(count = 5) {
    return buildS322DomainSet(count);
  }

  function buildS322MonotoneInequalitySubtypeSet(count = 5) {
    return buildS322MonotoneInequalitySet(count);
  }

  function buildS322LawInequalitySubtypeSet(count = 5) {
    return buildS322LawInequalitySet(count);
  }

  function buildS322QuadraticLogInequalitySubtypeSet(count = 5) {
    return buildS322QuadraticLogInequalitySet(count);
  }

  function buildS322NestedLogSubtypeSet(count = 5) {
    return buildS322NestedLogSet(count);
  }

  function buildS322UnknownBaseDomainSubtypeSet(count = 5) {
    return buildS322UnknownBaseDomainSet(count);
  }

  function buildS322ChainProductSubtypeSet(count = 5) {
    return buildS322ChainProductSet(count);
  }

  function buildS322ExponentPositionSubtypeSet(count = 5) {
    return buildS322ExponentPositionSet(count);
  }

  function buildS322LogExtremaSubtypeSet(count = 5) {
    return buildS322LogExtremaSet(count);
  }

  function buildS322DigitScientificSubtypeSet(count = 5) {
    return buildS322DigitScientificSet(count);
  }

  function buildS322RadicalBaseSubtypeSet(count = 5) {
    return buildS322RadicalBaseSet(count);
  }


  // ── NEW: 換底多基對數方程 (s3-2-2) ───────────────────────────
  function buildS322ChangeBaseLogEquationSet(count = 5) {
    const builders = [
      () => {
        // log_2(x)+log_4(x)+log_8(x) = k  →  (11/6)log_2(x)=k  →  x=2^(6k/11)
        const k = s322Pick([11,22,33]);
        const pw = (6*k/11);
        return s322Item(
          '解方程式 ' + s322M('\\log_2 x+\\log_4 x+\\log_8 x='+k) + '。',
          s322M('x=2^{'+pw+'}'),
          '統一換成以 2 為底：\\frac{11}{6}\\log_2 x='+k+'，得 \\log_2 x='+pw+'。'
        );
      },
      () => {
        // log_2(x)+log_4(x) = k  →  (3/2)log_2(x)=k  →  x=2^(2k/3)
        const k = s322Pick([3,6,9,12]);
        const pw = (2*k/3);
        return s322Item(
          '解方程式 ' + s322M('\\log_2 x+\\log_4 x='+k) + '。',
          s322M('x=2^{'+pw+'}'),
          '換底：\\log_4 x=\\tfrac12\\log_2 x，代入得 \\tfrac32\\log_2 x='+k+'，解得 \\log_2 x='+pw+'。'
        );
      },
      () => {
        // log_3(x)+log_9(x) = k  →  (4/3)log_3(x)=k  →  x=3^(3k/4)
        const k = s322Pick([4,8,12]);
        const pw = (3*k/4);
        return s322Item(
          '解方程式 ' + s322M('\\log_3 x+\\log_9 x='+k) + '。',
          s322M('x=3^{'+pw+'}'),
          '換底：\\log_9 x=\\tfrac12\\log_3 x，代入得 \\tfrac32 \\cdot \\tfrac{2}{3}\\cdot 2\\log_3 x='+k+'；整理得 \\tfrac{4}{3}\\log_3 x='+k+'，x=3^{'+pw+'}。'
        );
      },
      () => {
        // log_2(x+h) = log_4(x+C) where C=h^2+4h+2 and answer is x=2
        const h = s322Pick([1,2,3]);
        const C = h*h + 4*h + 2;
        return s322Item(
          '解方程式 ' + s322M('\\log_2(x+'+h+')=\\log_4(x+'+C+')') + '。',
          s322M('x=2'),
          '將右邊換底：\\log_4(x+'+C+')=\\tfrac12\\log_2(x+'+C+')，兩邊乘 2 後得 (x+'+h+')^2=x+'+C+'，展開整理後僅 x=2 滿足真數條件。'
        );
      },
      () => {
        // log_2(x)+log_4(x)+log_16(x) = k  →  (7/4)log_2(x)=k  →  x=2^(4k/7)
        const k = s322Pick([7,14,21]);
        const pw = (4*k/7);
        return s322Item(
          '解方程式 ' + s322M('\\log_2 x+\\log_4 x+\\log_{16} x='+k) + '。',
          s322M('x=2^{'+pw+'}'),
          '換底為以 2 為底：\\tfrac{7}{4}\\log_2 x='+k+'，得 \\log_2 x='+pw+'。'
        );
      },
    ];
    return s322MakeSet(count, builders);
  }
  function buildS322ChangeBaseLogEquationSubtypeSet(count = 5) {
    return buildS322ChangeBaseLogEquationSet(count);
  }

  // ── NEW: 對數二次方程與變底方程 (s3-2-2) ─────────────────────
  function buildS322SpecialLogEquationSet(count = 5) {
    const builders = [
      () => {
        // log_b(x^2-c) = 1  →  x^2-c=b  →  x=±√(b+c)
        const pairs = [[5,4],[3,6],[7,2],[2,14],[5,20]];
        const [b, c] = pairs[randInt(0, pairs.length-1)];
        const ans = Math.sqrt(b+c);
        const ansStr = Number.isInteger(ans) ? String(ans) : '\\sqrt{'+(b+c)+'}';
        return s322Item(
          '解方程式 ' + s322M('\\log_'+b+'(x^2-'+c+')=1') + '。',
          s322M('x=\\pm '+ansStr),
          'x^2-'+c+'='+b+'，得 x^2='+(b+c)+'，因真數需正故 |x|>\\sqrt{'+c+'}，兩根均符合。'
        );
      },
      () => {
        // log_b(x^2+c) = 2  →  x^2+c=b^2  →  x=±√(b^2-c)
        const cases = [[2,3],[3,5],[4,7],[3,8],[5,16]];
        const [b, c] = cases[randInt(0, cases.length-1)];
        const val = b*b - c;
        const ansStr = Number.isInteger(Math.sqrt(val)) ? String(Math.sqrt(val)) : '\\sqrt{'+val+'}';
        return s322Item(
          '解方程式 ' + s322M('\\log_'+b+'(x^2+'+c+')=2') + '。',
          s322M('x=\\pm '+ansStr),
          '真數 x^2+'+c+'='+b+'^2='+(b*b)+'，得 x^2='+(b*b-c)+'，兩根均使真數為正。'
        );
      },
      () => {
        // log_x(2x+3) = 2  →  x^2-2x-3=0  →  x=3 (domain: x>0,x≠1)
        const cases = [
          {a:2, b:3, ans:3, eq:'x^2-2x-3=0，(x-3)(x+1)=0', roots:'x=3 或 x=-1'},
          {a:1, b:12, ans:4, eq:'x^2-x-12=0，(x-4)(x+3)=0', roots:'x=4 或 x=-3'},
          {a:4, b:12, ans:6, eq:'x^2-4x-12=0，(x-6)(x+2)=0', roots:'x=6 或 x=-2'},
        ];
        const c = cases[randInt(0, cases.length-1)];
        const expr = c.a===1 ? `x+${c.b}` : `${c.a}x+${c.b}`;
        return s322Item(
          '解方程式 ' + s322M('\\log_x('+expr+')=2') + '。',
          s322M('x='+c.ans),
          'x^2='+expr+'，整理得 '+c.eq+'；取 x>0 且 x\\ne1 的根，得 x='+c.ans+'。'
        );
      },
      () => {
        // log_5(x^2-4) = 1  →  x^2=9  →  x=±3
        const cases = [
          {b:5,c:4,val:9,ans:'\\pm3'},
          {b:3,c:1,val:4,ans:'\\pm2'},
          {b:4,c:3,val:7,ans:'\\pm\\sqrt7'},
          {b:2,c:1,val:3,ans:'\\pm\\sqrt3'},
        ];
        const cas = cases[randInt(0, cases.length-1)];
        return s322Item(
          '解方程式 ' + s322M('\\log_'+cas.b+'(x^2-'+cas.c+')=1') + '。',
          s322M('x='+cas.ans),
          '真數 x^2-'+cas.c+'='+cas.b+'，得 x^2='+(cas.b+cas.c)+'='+ cas.val +'，確認兩根均使 x^2>'+cas.c+'。'
        );
      },
      () => {
        // log_x(5x-6) = 2  →  x^2-5x+6=0  →  x=2 or 3
        return s322Item(
          '解方程式 ' + s322M('\\log_x(5x-6)=2') + '。',
          s322M('x=2 或 x=3'),
          'x^2=5x-6，整理得 x^2-5x+6=0，(x-2)(x-3)=0；兩根均滿足 x>0,x\\ne1 且 5x-6>0。'
        );
      },
    ];
    return s322MakeSet(count, builders);
  }
  function buildS322SpecialLogEquationSubtypeSet(count = 5) {
    return buildS322SpecialLogEquationSet(count);
  }

  // ── NEW: 不同底數與倒數對數不等式 (s3-2-2) ──────────────────
  function buildS322DiffBaseLogInequalitySet(count = 5) {
    const builders = [
      () => {
        // log_2(x) > log_4(ax-c)  →  x^2>ax-c (with specific roots r,s)
        // Using r=1,s=2: a=3,c=2. Domain: x>2/3. Answer: (2/3,1)∪(2,∞)
        const cases = [
          {r:1,s:2,a:3,c:2,dom:'x>\\tfrac23',ans:'\\tfrac23<x<1 或 x>2'},
          {r:1,s:3,a:4,c:3,dom:'x>\\tfrac34',ans:'\\tfrac34<x<1 或 x>3'},
          {r:2,s:3,a:5,c:6,dom:'x>\\tfrac65',ans:'\\tfrac65<x<2 或 x>3'},
        ];
        const c = cases[randInt(0, cases.length-1)];
        return s322Item(
          '解不等式 ' + s322M('\\log_2 x>\\log_4('+c.a+'x-'+c.c+')') + '。',
          s322M(c.ans),
          '換底：\\log_4('+c.a+'x-'+c.c+')=\\tfrac12\\log_2('+c.a+'x-'+c.c+')，不等式化為 x^2>'+c.a+'x-'+c.c+'；定義域 '+c.dom+'，解 (x-'+c.r+')(x-'+c.s+')>0 後取交集。'
        );
      },
      () => {
        // 1/log_b(x) > k  →  1<x<b^(1/k)
        const cases = [
          {b:5,k:2,ans:'1<x<\\sqrt5'},
          {b:3,k:2,ans:'1<x<\\sqrt3'},
          {b:2,k:3,ans:'1<x<\\sqrt[3]{2}'},
          {b:4,k:2,ans:'1<x<2'},
          {b:5,k:1,ans:'1<x<5'},
        ];
        const c = cases[randInt(0, cases.length-1)];
        return s322Item(
          '解不等式 ' + s322M('\\dfrac{1}{\\log_'+c.b+' x}>'+c.k) + '。',
          s322M(c.ans),
          '需 \\log_'+c.b+' x\\ne0。當 x>1 時 \\log_'+c.b+' x>0，不等式等價於 \\log_'+c.b+' x<\\tfrac{1}{'+c.k+'}，即 x<'+c.b+'^{1/'+c.k+'}；當 0<x<1 時左側為負，不滿足。'
        );
      },
      () => {
        // 1/log_b(x) < -1  →  1/b < x < 1
        const b = s322Pick([2,3,4,5]);
        return s322Item(
          '解不等式 ' + s322M('\\dfrac{1}{\\log_'+b+' x}<-1') + '。',
          s322M('\\tfrac{1}{'+b+'}<x<1'),
          '當 0<x<1 時 \\log_'+b+' x<0，乘以 \\log_'+b+' x（負值）方向反向：1>-\\log_'+b+' x，即 \\log_'+b+' x>-1，得 x>\\tfrac{1}{'+b+'}；當 x>1 時左側為正，不符合。'
        );
      },
      () => {
        // log_2(x+c) > log_4(bx+d)  →  (x+c)^2 > bx+d with roots
        // Choose c=1,b=2,d=1: (x+1)^2>2x+1 → x^2+2x+1>2x+1 → x^2>0 → x≠0; domain x>-1, domain 2x+1>0 → x>-1/2
        // Answer: x>-1/2 but x≠0. Hmm, messy.
        // Better: (x+1)^2 > x+3 → x^2+2x+1>x+3 → x^2+x-2>0 → (x+2)(x-1)>0 → x<-2 or x>1
        // b=1,d=3: log_2(x+1) > log_4(x+3): (x+1)^2 > x+3, domain x>-1 AND x>-3, so x>-1
        // x^2+x-2>0 AND x>-1: x<-2 or x>1, intersect with x>-1 gives x>1
        const h = s322Pick([1,2,3]);
        const bv = 1; const dv = h*h+2*h-1+1; // (x+h)^2 > x+dv where (x-1) is root
        // (1+h)^2 = 1+dv → dv = (1+h)^2-1 = h^2+2h
        // roots of x^2+(2h-1)x+(h^2-dv)=0: x^2+(2h-1)x-1=0... let me just use fixed nice cases
        const niceCases = [
          {h:1,d:4,rootSmall:-2,rootLarge:1,domLow:-1},
          {h:2,d:7,rootSmall:-3,rootLarge:1,domLow:-2},
          {h:3,d:12,rootSmall:-4,rootLarge:1,domLow:-3},
        ];
        const cas = niceCases[randInt(0, niceCases.length-1)];
        // (x+h)^2 > x+d: x^2+(2h-1)x+h^2-d > 0
        // For h=1,d=4: x^2+x-3>0... hmm let me verify
        // h=1,d=4: (x+1)^2>x+4 → x^2+2x+1>x+4 → x^2+x-3>0. Roots: (-1±√13)/2. Not clean.
        // Let me just use specific clean cases instead.
        return s322Item(
          '解不等式 ' + s322M('\\log_2(x+1)>\\log_4(x+3)') + '。',
          s322M('x>1'),
          '換底：\\log_4(x+3)=\\tfrac12\\log_2(x+3)，不等式化為 2\\log_2(x+1)>\\log_2(x+3)，即 (x+1)^2>x+3；定義域 x>-1，解 x^2+x-2>0 得 x>1 或 x<-2，取交集得 x>1。'
        );
      },
      () => {
        // log_3(x) > log_9(4x-3)  →  (x)^2 > 4x-3 → (x-1)(x-3)>0  domain x>3/4
        // answer: (3/4,1)∪(3,∞)... wait actually log_9(4x-3)=(1/2)log_3(4x-3)
        // 2log_3(x) > log_3(4x-3) → x^2>4x-3 → x^2-4x+3>0 → (x-1)(x-3)>0
        // domain: x>0 AND 4x-3>0 → x>3/4
        // combined: (3/4,1)∪(3,∞)
        return s322Item(
          '解不等式 ' + s322M('\\log_3 x>\\log_9(4x-3)') + '。',
          s322M('\\tfrac34<x<1 或 x>3'),
          '換底：\\log_9(4x-3)=\\tfrac12\\log_3(4x-3)，不等式化為 x^2>4x-3；定義域 x>\\tfrac34，解 (x-1)(x-3)>0 後取交集得 \\tfrac34<x<1 或 x>3。'
        );
      },
    ];
    return s322MakeSet(count, builders);
  }
  function buildS322DiffBaseLogInequalitySubtypeSet(count = 5) {
    return buildS322DiffBaseLogInequalitySet(count);
  }

  function s323Pick(items) {
    return items[randInt(0, items.length - 1)];
  }

  function s323M(s) {
    return '\\(' + s + '\\)';
  }

  function s323Ans(short, process) {
    const clean = (value) => String(value).replace(/[。.]$/u, '');
    return '簡答：' + clean(short) + '。過程：' + clean(process) + '。';
  }

  function s323MakeSet(count, builders) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const built = builders[i % builders.length]();
      questions.push(built.q);
      answers.push(built.a);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildS323QA(q, short, process) {
    return { q, a: s323Ans(short, process) };
  }

  function s323MJ(...parts) {
    return s323M(parts.join(''));
  }

  function buildS323ChainProductSet(count) {
    const builders = [
      () =>
        buildS323QA(
          '計算 ' + s323M('\\log_2 3\\cdot\\log_3 4\\cdot\\log_4 8') + ' 的值。',
          s323M('3'),
          '連鎖後成為 ' + s323M('\\log_2 8=3') + '。'
        ),
      () =>
        buildS323QA(
          '計算 ' + s323M('\\log_3 5\\cdot\\log_5 7\\cdot\\log_7 81') + ' 的值。',
          s323M('4'),
          '連鎖後成為 ' + s323M('\\log_3 81=4') + '。'
        ),
      () => {
        const a = s323Pick([2, 3, 5]);
        const b = s323Pick([3, 4, 7]);
        return buildS323QA(
          '化簡 ' + s323MJ('\\log_', a, ' ', b, '\\cdot\\log_', b, ' ', a) + '。',
          s323M('1'),
          '利用 ' + s323M('\\log_a b\\cdot\\log_b a=1') + '。'
        );
      },
      () => {
        const a = s323Pick([2, 3, 5]);
        const n = s323Pick([2, 3, 4]);
        return buildS323QA(
          '計算 ' + s323MJ('\\log_', a, ' ', Math.pow(a, n)) + '。',
          s323M(String(n)),
          '因為 ' + s323MJ(a, '^{', n, '}=', Math.pow(a, n)) + '。'
        );
      },
      () => {
        const a = s323Pick([2, 3]);
        return buildS323QA(
          '計算 ' + s323MJ('\\log_{\\sqrt{', a, '}} ', a) + '。',
          s323M('2'),
          '因為 ' + s323MJ('(\\sqrt{', a, '})^2=', a) + '。'
        );
      },
    ];
    return s323MakeSet(count, builders);
  }

  function buildS323ExponentPositionSet(count) {
    const builders = [
      () => {
        const a = s323Pick([2, 3, 5]);
        const b = s323Pick([3, 4, 7]);
        return buildS323QA(
          '化簡 ' + s323MJ(a, '^{\\log_', a, ' ', b, '}') + '。',
          s323M(String(b)),
          '利用 ' + s323M('a^{\\log_a b}=b') + '。'
        );
      },
      () => {
        const a = s323Pick([2, 3]);
        const b = s323Pick([5, 7]);
        return buildS323QA(
          '計算 ' + s323MJ(a, '^{2\\log_', a, ' ', b, '}') + '。',
          s323M(String(b * b)),
          '先化成 ' + s323M('(a^{\\log_a b})^2=b^2') + '。'
        );
      },
      () => {
        const a = s323Pick([2, 3]);
        const b = s323Pick([5, 7]);
        return buildS323QA(
          '已知 ' + s323MJ('x^{\\log_', a, ' ', b, '}=', b * b) + '，求 ' + s323MJ('\\log_', a, ' x') + '。',
          s323M('2'),
          '把左式改寫成 ' + s323M('b^{\\log_a x}') + '，所以指數相等。'
        );
      },
      () => {
        const a = s323Pick([2, 3, 5]);
        const m = s323Pick([2, 3, 4]);
        return buildS323QA(
          '計算 ' + s323MJ(a, '^{\\log_', a, ' ', m, '}+', m, '^{\\log_', a, ' ', a, '}') + '。',
          s323M(String(2 * m)),
          '兩項分別化為 ' + s323M(m) + ' 與 ' + s323M(m) + '。'
        );
      },
      () =>
        buildS323QA(
          '化簡 ' + s323M('10^{2\\log 3}') + '。',
          s323M('9'),
          '常用對數底數為 10，故 ' + s323M('10^{2\\log3}=3^2') + '。'
        ),
    ];
    return s323MakeSet(count, builders);
  }

  function buildS323RadicalBaseSet(count) {
    const builders = [
      () => {
        const a = s323Pick([2, 3, 5]);
        const n = s323Pick([2, 3]);
        return buildS323QA(
          '計算 ' + s323MJ('\\log_{\\sqrt{', a, '}} ', Math.pow(a, n)) + '。',
          s323M(String(2 * n)),
          '底數是 ' + s323MJ(a, '^{1/2}') + '，所以指數需加倍。'
        );
      },
      () => {
        const a = s323Pick([2, 3, 5]);
        return buildS323QA(
          '求 ' + s323MJ('\\log_{', a * a, '} ', a) + ' 的值。',
          s323M('\\frac12'),
          '因為 ' + s323MJ(a * a, '^{1/2}=', a) + '。'
        );
      },
      () => {
        const a = s323Pick([2, 3, 5]);
        return buildS323QA(
          '化簡 ' + s323MJ('\\log_{1/', a, '} ', Math.pow(a, 3)) + '。',
          s323M('-3'),
          '底數是 ' + s323MJ(a, '^{-1}') + '。'
        );
      },
      () => {
        const a = s323Pick([2, 3]);
        return buildS323QA(
          '計算 ' + s323MJ('\\log_{', a, '^3} \\sqrt{', a, '}') + '。',
          s323M('\\frac16'),
          '解 ' + s323MJ('(', a, '^3)^x=', a, '^{1/2}') + '。'
        );
      },
      () => {
        const a = s323Pick([4, 9, 16]);
        return buildS323QA(
          '求 ' + s323MJ('\\log_{\\sqrt{', a, '}} \\frac1{', a, '}') + '。',
          s323M('-2'),
          '平方得到 ' + a + '，倒數所以指數為 ' + s323M('-2') + '。'
        );
      },
    ];
    return s323MakeSet(count, builders);
  }

  function buildS323DigitScientificSet(count) {
    const builders = [
      () => {
        const d = s323Pick([
          { base: 2, approx: 0.301 },
          { base: 3, approx: 0.4771 },
          { base: 6, approx: 0.7782 },
        ]);
        const n = s323Pick([20, 40, 60]);
        const digits = Math.floor(n * d.approx) + 1;
        return buildS323QA(
          '已知 ' +
            s323MJ('\\log ', d.base, '\\approx ', d.approx.toFixed(4)) +
            '，判斷 ' +
            s323MJ(d.base, '^{', n, '}') +
            ' 是幾位數。',
          s323M(String(digits)) + ' 位數',
          '位數為 ' + s323MJ('\\lfloor n\\log ', d.base, '\\rfloor+1') + '。'
        );
      },
      () => {
        const n = s323Pick([40, 60, 100]);
        return buildS323QA(
          '將 ' + s323MJ('(\\frac12)^{', n, '}') + ' 表成小數，從小數點後第幾位開始出現非 0 數字？',
          '第 ' + (Math.floor(0.301 * n) + 1) + ' 位',
          '用 ' + s323MJ('\\log(1/2)^', n, '=-', n, '\\log2') + ' 判斷首數。'
        );
      },
      () => {
        const n = s323Pick([20, 50, 100]);
        return buildS323QA(
          '已知 ' + s323M('\\log2\\approx0.3010') + '，判斷 ' + s323MJ('2^{', n, '}') + ' 的最高位數字需看哪個部分。',
          '看尾數 ' + s323MJ('\\{0.3010\\times', n, '\\}'),
          '最高位數字由科學記號係數決定，也就是對數的小數部分。'
        );
      },
      () =>
        buildS323QA(
          '把 ' + s323M('235000') + ' 寫成科學記號，並寫出其常用對數的首數。',
          s323M('2.35\\times10^5') + '，首數 5',
          '科學記號中 ' + s323M('10^5') + ' 給出首數。'
        ),
      () =>
        buildS323QA(
          '求最小正整數 ' + s323M('n') + ' 使 ' + s323M('(5/4)^n>10^{20}') + ' 的判斷方法。',
          '取常用對數比較',
          '兩邊取對數，得到 ' + s323M('n\\log(5/4)>20') + '。'
        ),
    ];
    return s323MakeSet(count, builders);
  }

  function buildS323LogIdentityExtremaSet(count) {
    const builders = [
      () => {
        const sum = s323Pick([20, 30, 40, 60]);
        const half = sum / 2;
        return buildS323QA(
          '設 ' + s323M('x,y>0') + ' 且 ' + s323MJ('x+y=', sum) + '，求 ' + s323M('\\log x+\\log y') + ' 的最大值。',
          s323MJ('\\log ', half * half),
          '化為 ' + s323M('\\log(xy)') + '，和固定時乘積最大在 ' + s323MJ('x=y=', half) + '。'
        );
      },
      () => {
        const sum = s323Pick([8, 10, 12]);
        return buildS323QA(
          '已知 ' + s323MJ('\\log_2x+\\log_2y=', sum) + '，求 ' + s323M('x+y') + ' 的最小值。',
          s323M(String(2 * Math.pow(2, sum / 2))),
          '由 ' + s323MJ('xy=2^{', sum, '}') + '，再用 ' + s323M('x+y\\ge2\\sqrt{xy}') + '。'
        );
      },
      () => {
        const c = s323Pick([2, 3, 4]);
        return buildS323QA(
          '設 ' +
            s323MJ('x>', c) +
            '，求 ' +
            s323MJ('f(x)=2\\log(x-', c - 1, ')-\\log(x-', c, ')') +
            ' 的最小值與此時 ' +
            s323M('x') +
            '。',
          '最小值 ' + s323M('\\log4') + '，此時 ' + s323MJ('x=', c + 1),
          '令 ' + s323MJ('t=x-', c, '>0') + '，則 ' + s323M('f=\\log((t+1)^2/t)\\ge\\log4') + '。'
        );
      },
      () => {
        const k = s323Pick([1, 2, 3]);
        return buildS323QA(
          '當 ' +
            s323M('1\\le x\\le27') +
            ' 時，求 ' +
            s323MJ('f(x)=(\\log_3x)^2-', 2 * k, '\\log_3x+', k * k + 1) +
            ' 的最大值與最小值。',
          '令 ' + s323M('t=\\log_3x') + ' 後比較端點與頂點',
          '此時 ' + s323M('0\\le t\\le3') + '，原式為二次函數。'
        );
      },
      () => {
        const b = s323Pick([32, 40, 48]);
        return buildS323QA(
          '設 ' +
            s323M('x,y>0') +
            ' 且 ' +
            s323MJ('x+4y=', b) +
            '，求 ' +
            s323M('\\log_{1/2} x+\\log_{1/2} y') +
            ' 的最小值。',
          s323MJ('\\log_{1/2} ', (b * b) / 16),
          '底數小於 1，所以要讓 ' + s323M('xy') + ' 最大；由 AM-GM 得最大乘積。'
        );
      },
    ];
    return s323MakeSet(count, builders);
  }

  function buildS323DomainFeatureSet(count) {
    const builders = [
      () => {
        const base = s323Pick([2, 3, 5]);
        const h = s323Pick([1, 2, 3]);
        return buildS323QA(
          '求函數 ' + s323MJ('y=\\log_', base, '(x-', h, ')') + ' 的定義域與鉛直漸近線。',
          '定義域 ' + s323MJ('x>', h) + '；漸近線 ' + s323MJ('x=', h),
          '真數必須大於 0。'
        );
      },
      () => {
        const base = s323Pick([2, 3, 5]);
        const k = s323Pick([-2, -1, 1, 2]);
        return buildS323QA(
          '判斷 ' + s323MJ('y=\\log_', base, 'x+', k) + ' 必通過哪一點。',
          s323MJ('(1,', k, ')'),
          '因為 ' + s323MJ('\\log_', base, ' 1=0') + '。'
        );
      },
      () => {
        const base = s323Pick([2, 3, 5]);
        return buildS323QA(
          '判斷 ' + s323MJ('y=\\log_', base, 'x') + ' 與 ' + s323MJ('y=', base, '^x') + ' 的對稱軸。',
          s323M('y=x'),
          '同底指數與對數互為反函數。'
        );
      },
      () => {
        const base = s323Pick([2, 3, 5]);
        return buildS323QA(
          '列出 ' + s323MJ('y=\\log_', base, 'x') + ' 的兩個固定通過點。',
          s323M('(1,0)') + '、' + s323MJ('(', base, ',1)'),
          '分別代入真數 1 與 ' + base + '。'
        );
      },
      () => {
        const base = s323Pick([2, 3]);
        const h = s323Pick([1, 2, 3]);
        const k = s323Pick([1, 2]);
        return buildS323QA(
          '求 ' + s323MJ('y=\\log_', base, '(x-', h, ')+', k) + ' 的定義域與一個固定通過點。',
          '定義域 ' + s323MJ('x>', h) + '；通過 ' + s323MJ('(', h + 1, ',', k, ')'),
          '令真數為 1。'
        );
      },
    ];
    return s323MakeSet(count, builders);
  }

  function buildS323TransformSet(count) {
    const builders = [
      () => {
        const base = s323Pick([2, 3, 5]);
        const h = s323Pick([2, 3, 4]);
        const k = s323Pick([1, 2, 3]);
        return buildS323QA(
          '將 ' + s323MJ('y=\\log_', base, 'x') + ' 向右平移 ' + h + ' 單位，再向上平移 ' + k + ' 單位，求新函數。',
          s323MJ('y=\\log_', base, '(x-', h, ')+', k),
          '右移改成 ' + s323MJ('x-', h) + '，上移加 ' + k + '。'
        );
      },
      () => {
        const base = s323Pick([2, 3, 5]);
        return buildS323QA(
          '求 ' + s323MJ('y=\\log_', base, 'x') + ' 關於 y 軸對稱後的函數。',
          s323MJ('y=\\log_', base, '(-x)'),
          '關於 y 軸對稱時把 x 改成 -x。'
        );
      },
      () => {
        const base = s323Pick([2, 3, 5]);
        return buildS323QA(
          '求 ' + s323MJ('y=\\log_', base, 'x') + ' 關於 x 軸對稱後的函數。',
          s323MJ('y=-\\log_', base, 'x'),
          '關於 x 軸對稱時函數值取相反數。'
        );
      },
      () => {
        const base = s323Pick([2, 3, 5]);
        const a = s323Pick([2, 3]);
        return buildS323QA(
          '將 ' + s323MJ('y=\\log_', base, 'x') + ' 沿 x 軸壓縮為原來的 ' + s323MJ('\\frac1{', a, '}') + '，求新函數。',
          s323MJ('y=\\log_', base, '(', a, 'x)'),
          '水平壓縮為原來的 ' + s323MJ('1/', a) + '，把 x 改成 ' + s323MJ(a, 'x') + '。'
        );
      },
      () => {
        const base = s323Pick([2, 3]);
        const h = s323Pick([1, 2]);
        return buildS323QA(
          '已知 ' +
            s323MJ('y=\\log_', base, 'x') +
            ' 平移後漸近線為 ' +
            s323MJ('x=', h) +
            '，且通過 ' +
            s323MJ('(', h + base, ',1)') +
            '，求函數。',
          s323MJ('y=\\log_', base, '(x-', h, ')'),
          '漸近線由 ' + s323M('x=0') + ' 平移到 ' + s323MJ('x=', h) + '。'
        );
      },
    ];
    return s323MakeSet(count, builders);
  }

  function buildS323ComparisonSet(count) {
    const builders = [
      () => {
        const base = s323Pick([2, 3, 5]);
        const a = s323Pick([2, 3, 4]);
        const b = a + 2;
        return buildS323QA(
          '比較 ' + s323MJ('\\log_', base, ' ', a) + ' 與 ' + s323MJ('\\log_', base, ' ', b) + ' 的大小。',
          s323MJ('\\log_', base, ' ', a, '<\\log_', base, ' ', b),
          '底數大於 1，真數愈大對數愈大。'
        );
      },
      () => {
        const den = s323Pick([2, 3, 4]);
        const a = s323Pick([2, 3, 4]);
        const b = a + 2;
        return buildS323QA(
          '比較 ' + s323MJ('\\log_{1/', den, '} ', a) + ' 與 ' + s323MJ('\\log_{1/', den, '} ', b) + ' 的大小。',
          s323MJ('\\log_{1/', den, '} ', a, '>\\log_{1/', den, '} ', b),
          '底數介於 0 與 1，真數愈大對數愈小。'
        );
      },
      () => buildS323QA('判斷 ' + s323M('\\log_2\\frac43') + ' 的正負。', '正', '底數大於 1 且真數大於 1。'),
      () => buildS323QA('判斷 ' + s323M('\\log_{0.3}2') + ' 的正負。', '負', '底數介於 0 與 1，真數大於 1。'),
      () =>
        buildS323QA(
          '若 ' + s323M('0<a<b<1') + '，比較 ' + s323M('\\log_a b') + ' 與 ' + s323M('\\log_b a') + '。',
          s323M('\\log_a b<\\log_b a'),
          '令 ' + s323M('a=b^t,t>1') + '，則兩者為 ' + s323M('1/t') + ' 與 ' + s323M('t') + '。'
        ),
    ];
    return s323MakeSet(count, builders);
  }

  function buildS323EquationRootSet(count) {
    const builders = [
      () => {
        const base = s323Pick([2, 3, 5]);
        const r = s323Pick([1, 2, 3]);
        const n = s323Pick([1, 2, 3]);
        return buildS323QA(
          '解方程式 ' + s323MJ('\\log_', base, '(x-', r, ')=', n) + '。',
          s323MJ('x=', r + Math.pow(base, n)),
          '轉為 ' + s323MJ('x-', r, '=', Math.pow(base, n)) + '。'
        );
      },
      () => {
        const base = s323Pick([2, 3]);
        const a = s323Pick([1, 2]);
        const diff = s323Pick([2, 3]);
        const prod = a * (a + diff);
        return buildS323QA(
          '解方程式 ' + s323MJ('\\log_', base, ' x+\\log_', base, '(x+', diff, ')=\\log_', base, ' ', prod) + '。',
          s323MJ('x=', a),
          '合併成 ' + s323MJ('x(x+', diff, ')=', prod) + '，並檢查真數。'
        );
      },
      () => {
        const base = s323Pick([2, 3]);
        const n = s323Pick([1, 2, 3]);
        return buildS323QA(
          '解 ' + s323MJ('|\\log_', base, ' x|=', n) + '。',
          s323MJ('x=', Math.pow(base, n)) + ' 或 ' + s323MJ('x=\\frac1{', Math.pow(base, n), '}'),
          '分成正負兩個對數方程式。'
        );
      },
      () =>
        buildS323QA(
          '判定方程式 ' + s323M('\\log_2x=x-1') + ' 的實數解個數。',
          '2 個',
          '圖形交點或代入可得 ' + s323M('x=1,2') + '，凹性可排除其他解。'
        ),
      () => {
        const c = s323Pick([2, 3, 4]);
        return buildS323QA(
          '判定 ' + s323M('y=\\log_2x') + ' 與 ' + s323MJ('y=\\log_2(', c, 'x)') + ' 的交點個數。',
          '0 個',
          '若相交則 ' + s323MJ('x=', c, 'x') + '，與 ' + s323M('x>0') + ' 矛盾。'
        );
      },
    ];
    return s323MakeSet(count, builders);
  }

  function buildS323InverseSet(count) {
    const builders = [
      () => {
        const base = s323Pick([2, 3, 5]);
        const h = s323Pick([1, 2, 3]);
        return buildS323QA(
          '已知 ' + s323MJ('f(x)=\\log_', base, '(x-', h, ')') + '，求 ' + s323M('f^{-1}(x)') + '。',
          s323MJ('f^{-1}(x)=', base, '^x+', h),
          '交換 x,y 後解出 y。'
        );
      },
      () => {
        const base = s323Pick([2, 3]);
        const k = s323Pick([1, 2, 3]);
        return buildS323QA(
          '已知 ' + s323MJ('f(x)=', base, '^x-', k) + '，求 ' + s323M('f^{-1}(x)') + '。',
          s323MJ('f^{-1}(x)=\\log_', base, '(x+', k, ')'),
          '移項後取對數。'
        );
      },
      () =>
        buildS323QA(
          '說明 ' + s323M('y=2^x') + ' 與 ' + s323M('y=\\log_2x') + ' 的對稱軸。',
          s323M('y=x'),
          '互為反函數，所以關於 ' + s323M('y=x') + ' 對稱。'
        ),
      () => {
        const base = s323Pick([2, 3]);
        return buildS323QA(
          '已知 ' + s323MJ('f(x)=\\log_', base, 'x') + '，求 ' + s323MJ('f^{-1}(', base, ')') + '。',
          s323M(String(Math.pow(base, base))),
          '反函數為 ' + s323MJ(base, '^x') + '。'
        );
      },
      () => {
        const base = s323Pick([2, 3]);
        const h = s323Pick([1, 2]);
        const k = s323Pick([1, 2]);
        return buildS323QA(
          '已知 ' + s323MJ('f(x)=\\log_', base, '(x-', h, ')+', k) + '，求反函數。',
          s323MJ('f^{-1}(x)=', base, '^{x-', k, '}+', h),
          '先移去 ' + k + '，再轉成指數式。'
        );
      },
    ];
    return s323MakeSet(count, builders);
  }

  function buildS323JensenSet(count) {
    const builders = [
      () => {
        const base = s323Pick([2, 3, 5]);
        return buildS323QA(
          '若 ' +
            s323M('x_1\\ne x_2') +
            ' 且皆為正，比較 ' +
            s323MJ('\\log_', base, '\\frac{x_1+x_2}{2}') +
            ' 與 ' +
            s323MJ('\\frac{\\log_', base, 'x_1+\\log_', base, 'x_2}{2}') +
            '。',
          s323MJ('\\log_', base, '\\frac{x_1+x_2}{2}>\\frac{\\log_', base, 'x_1+\\log_', base, 'x_2}{2}'),
          '對數函數凹向下，套用 Jensen 不等式。'
        );
      },
      () =>
        buildS323QA(
          '判斷 ' + s323M('\\log_2\\sqrt{ab}=\\frac{\\log_2a+\\log_2b}{2}') + ' 是否恆成立。',
          '恆成立',
          '左式為 ' + s323M('\\frac12\\log_2(ab)') + '。'
        ),
      () =>
        buildS323QA(
          '對數圖形上兩點連成弦，弦的中點在圖形上方還是下方？',
          '在圖形下方',
          '底數大於 1 的對數圖形凹向下。'
        ),
      () => {
        const base = s323Pick([2, 3]);
        return buildS323QA(
          '若 ' + s323MJ('f(x)=\\log_', base, 'x') + '，比較中點函數值與兩端函數值平均。',
          '中點函數值較大',
          '這是凹向下函數的中點性質。'
        );
      },
      () =>
        buildS323QA(
          '利用凹性判斷 ' + s323M('\\log_2\\sqrt{ab}') + ' 與 ' + s323M('(\\log_2a+\\log_2b)/2') + ' 的關係。',
          '相等',
          '這題是幾何平均，直接用對數律化簡。'
        ),
    ];
    return s323MakeSet(count, builders);
  }

  function buildS323ModelingSet(count) {
    const builders = [
      () => {
        const d1 = s323Pick([50, 60, 70]);
        const inc = s323Pick([10, 20, 30]);
        return buildS323QA(
          '聲音由 ' + d1 + ' 分貝增加為 ' + (d1 + inc) + ' 分貝，強度變為幾倍？',
          s323MJ('10^{', inc / 10, '}'),
          '分貝差滿足 ' + s323M('\\Delta d=10\\log(I_2/I_1)') + '。'
        );
      },
      () =>
        buildS323QA(
          '亮度感覺模型 ' + s323M('y=a\\log_2x') + ' 通過 ' + s323M('(8,6)') + '，求 ' + s323M('a') + '。',
          s323M('a=2'),
          '代入得 ' + s323M('6=3a') + '。'
        ),
      () =>
        buildS323QA(
          '利用班佛法則 ' + s323M('P(d)=\\log(1+1/d)') + '，求首位數字為 1 的比例。',
          s323M('\\log2'),
          '代入 ' + s323M('d=1') + '。'
        ),
      () => {
        const base = s323Pick([2, 10]);
        return buildS323QA(
          '某量每增加 1 單位就乘以 ' + base + '，初值為 ' + s323M('A') + '，寫出第 ' + s323M('t') + ' 單位後的對數式。',
          s323MJ('\\log N=\\log A+t\\log ', base),
          '由 ' + s323MJ('N=A\\cdot ', base, '^t') + ' 取對數。'
        );
      },
      () => {
        const ratio = s323Pick([10, 100]);
        return buildS323QA(
          '視星等每差 5 等亮度相差 ' + ratio + ' 倍，差 1 等的亮度比為何？',
          s323MJ(ratio, '^{1/5}'),
          '設每差 1 等為 r 倍，則 ' + s323MJ('r^5=', ratio) + '。'
        );
      },
    ];
    return s323MakeSet(count, builders);
  }

  function buildS323AbsoluteLogSet(count) {
    const builders = [
      () => {
        const base = s323Pick([2, 3]);
        const n = s323Pick([1, 2, 3]);
        return buildS323QA(
          '解方程式 ' + s323MJ('|\\log_', base, ' x|=', n) + '。',
          s323MJ('x=', Math.pow(base, n)) + ' 或 ' + s323MJ('x=\\frac1{', Math.pow(base, n), '}'),
          '分成 ' + s323MJ('\\log_', base, ' x=\\pm ', n) + '。'
        );
      },
      () => {
        const base = s323Pick([2, 3]);
        const c = s323Pick([1, 2, 3]);
        return buildS323QA(
          '求 ' + s323MJ('y=|\\log_', base, ' x|') + ' 與 ' + s323MJ('y=', c) + ' 的交點個數。',
          '2 個',
          '等價於 ' + s323MJ('\\log_', base, ' x=\\pm ', c) + '。'
        );
      },
      () =>
        buildS323QA(
          '判斷 ' + s323M('y=\\log_2|x|') + ' 是否關於 y 軸對稱。',
          '是',
          '把 x 換成 -x，' + s323M('|x|') + ' 不變。'
        ),
      () =>
        buildS323QA(
          '求 ' + s323M('y=|\\log_2x|') + ' 的最小值。',
          s323M('0'),
          '絕對值最小為 0，發生在 ' + s323M('x=1') + '。'
        ),
      () =>
        buildS323QA(
          '比較 ' + s323M('y=\\log_2|x|') + ' 與 ' + s323M('y=|\\log_2x|') + ' 的定義域。',
          '前者 ' + s323M('x\\ne0') + '；後者 ' + s323M('x>0'),
          '前者只需 ' + s323M('|x|>0') + '，後者真數需 ' + s323M('x>0') + '。'
        ),
    ];
    return s323MakeSet(count, builders);
  }

  function buildS323OperationsMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS323ChainProductSet,
        buildS323ExponentPositionSet,
        buildS323RadicalBaseSet,
        buildS323DigitScientificSet,
        buildS323LogIdentityExtremaSet,
      ],
      count
    );
  }

  function buildS323GraphMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS323DomainFeatureSet,
        buildS323TransformSet,
        buildS323ComparisonSet,
        buildS323EquationRootSet,
        buildS323InverseSet,
      ],
      count
    );
  }

  function buildS323ApplicationMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS323JensenSet,
        buildS323ModelingSet,
        buildS323AbsoluteLogSet,
        buildS323LogIdentityExtremaSet,
        buildS323DigitScientificSet,
      ],
      count
    );
  }

  function buildS323ChainProductSubtypeSet(count) {
    return buildS323ChainProductSet(count);
  }

  function buildS323ExponentPositionSubtypeSet(count) {
    return buildS323ExponentPositionSet(count);
  }

  function buildS323RadicalBaseSubtypeSet(count) {
    return buildS323RadicalBaseSet(count);
  }

  function buildS323DigitScientificSubtypeSet(count) {
    return buildS323DigitScientificSet(count);
  }

  function buildS323LogIdentityExtremaSubtypeSet(count) {
    return buildS323LogIdentityExtremaSet(count);
  }

  function buildS323DomainFeatureSubtypeSet(count) {
    return buildS323DomainFeatureSet(count);
  }

  function buildS323TransformSubtypeSet(count) {
    return buildS323TransformSet(count);
  }

  function buildS323ComparisonSubtypeSet(count) {
    return buildS323ComparisonSet(count);
  }

  function buildS323EquationRootSubtypeSet(count) {
    return buildS323EquationRootSet(count);
  }

  function buildS323InverseSubtypeSet(count) {
    return buildS323InverseSet(count);
  }

  function buildS323JensenSubtypeSet(count) {
    return buildS323JensenSet(count);
  }

  function buildS323ModelingSubtypeSet(count) {
    return buildS323ModelingSet(count);
  }

  function buildS323AbsoluteLogSubtypeSet(count) {
    return buildS323AbsoluteLogSet(count);
  }

  function buildS323LogExtremaReviewSubtypeSet(count) {
    return buildS323LogIdentityExtremaSet(count);
  }

  function buildS323DigitApplicationReviewSubtypeSet(count) {
    return buildS323DigitScientificSet(count);
  }


  // ── NEW: 對數函數奇偶性與值域 (s3-2-3) ─────────────────────
  function buildS323LogParityRangeSet(count) {
    const builders = [
      () => buildS323QA(
        '已知 ' + s323M('f(x)=\\log_2(x+\\sqrt{x^2+1})') + '，判斷 ' + s323M('f(x)') + ' 的奇偶性並說明理由。',
        '奇函數',
        '定義域對稱於原點。計算 f(-x)=\\log_2(-x+\\sqrt{x^2+1})；注意 (-x+\\sqrt{x^2+1})(x+\\sqrt{x^2+1})=1，故 f(-x)=\\log_2(1/(x+\\sqrt{x^2+1}))=-f(x)。'
      ),
      () => {
        const b = s323Pick([2,3,5]);
        const h = s323Pick([1,2,3]);
        const k = s323Pick([1,2,4]);
        const minVal = b===2&&k===4 ? 2 : (b===3&&k===3 ? 1 : (b===2&&k===1 ? 0 : `\\log_${b} ${k}`));
        const minStr = (k===1) ? '0' : (k===b ? '1' : (k===b*b ? '2' : `\\log_{${b}} ${k}`));
        return buildS323QA(
          '求函數 ' + s323M('y=\\log_'+b+'((x-'+h+')^2+'+k+')') + ' 的值域。',
          s323M('['+minStr+',+\\infty)'),
          '(x-'+h+')^2+'+k+' \\ge '+k+'，故 y\\ge\\log_{'+b+'} '+k+'='+minStr+'；當 x='+h+' 時取等，值域為 ['+minStr+',+\\infty)。'
        );
      },
      () => buildS323QA(
        '已知 ' + s323M('f(x)=\\log_3(x^2+1)') + '，判斷 ' + s323M('f(x)') + ' 的奇偶性。',
        '偶函數',
        '定義域 \\mathbb{R} 對稱於原點。f(-x)=\\log_3((-x)^2+1)=\\log_3(x^2+1)=f(x)，故為偶函數。'
      ),
      () => {
        const b = s323Pick([2,3]);
        const h = s323Pick([1,2]);
        const minK = 1; // (x+h)^2 + 1 >= 1
        return buildS323QA(
          '求函數 ' + s323M('y=\\log_'+b+'(x^2+'+2*h+'x+'+(h*h+1)+')') + ' 的值域。',
          s323M('[0,+\\infty)'),
          '配方得 (x+'+h+')^2+1\\ge1，故 y=\\log_'+b+'((x+'+h+')^2+1)\\ge\\log_'+b+' 1=0。值域為 [0,+\\infty)。'
        );
      },
      () => buildS323QA(
        '已知 ' + s323M('g(x)=\\log(x^2-x+1)+\\log(x^2+x+1)') + '，判斷 ' + s323M('g(x)') + ' 的奇偶性。',
        '偶函數',
        '化簡：g(x)=\\log((x^2+1)^2-x^2)=\\log(x^4+x^2+1)；因 x^4+x^2+1 僅含偶次項，g(-x)=g(x)，故為偶函數。'
      ),
    ];
    return s323MakeSet(count, builders);
  }
  function buildS323LogParityRangeSubtypeSet(count) {
    return buildS323LogParityRangeSet(count);
  }

  // ── NEW: 冪對數方程 x^(log x) 型 (s3-2-3) ──────────────────
  function buildS323PowerLogEquationSet(count) {
    const builders = [
      () => {
        // x^(log x) = 10^m · x^n  →  (log x)^2 = m + n·log x  →  t^2-n·t-m=0
        // m=2,n=1: t^2-t-2=0, t=2 or t=-1, x=100 or x=0.1
        return buildS323QA(
          '解方程式 ' + s323M('x^{\\log x}=100x') + '（\\(x>0\\)）。',
          s323M('x=100 或 x=0.1'),
          '兩邊取常用對數得 (\\log x)^2=\\log(100x)=2+\\log x；令 t=\\log x，則 t^2-t-2=0，(t-2)(t+1)=0，t=2 或 t=-1，故 x=10^2=100 或 x=10^{-1}=0.1。'
        );
      },
      () => {
        // m=3,n=2: t^2-2t-3=0, t=3 or t=-1, x=1000 or 0.1
        return buildS323QA(
          '解方程式 ' + s323M('x^{\\log x}=1000x^2') + '（\\(x>0\\)）。',
          s323M('x=1000 或 x=0.1'),
          '取對數：(\\log x)^2=3+2\\log x；令 t=\\log x，t^2-2t-3=0，(t-3)(t+1)=0，t=3 或 t=-1，x=10^3 或 10^{-1}。'
        );
      },
      () => {
        // m=6,n=1: t^2-t-6=0, t=3 or t=-2, x=1000 or 0.01
        return buildS323QA(
          '解方程式 ' + s323M('x^{\\log x}=10^6 x') + '（\\(x>0\\)）。',
          s323M('x=10^3 或 x=10^{-2}'),
          '取對數：(\\log x)^2=6+\\log x；令 t=\\log x，t^2-t-6=0，(t-3)(t+2)=0，t=3 或 t=-2。'
        );
      },
      () => {
        // x^(log_2 x) = 8x^2  →  (log_2 x)^2 = 3 + 2·log_2 x  →  t^2-2t-3=0, t=3 or -1, x=8 or 1/2
        return buildS323QA(
          '解方程式 ' + s323M('x^{\\log_2 x}=8x^2') + '（\\(x>0\\)）。',
          s323M('x=8 或 x=\\tfrac12'),
          '兩邊取 \\log_2：(\\log_2 x)^2=\\log_2(8x^2)=3+2\\log_2 x；令 t=\\log_2 x，t^2-2t-3=0，t=3 或 t=-1，x=2^3=8 或 x=2^{-1}=\\tfrac12。'
        );
      },
      () => {
        // x^(log_3 x) = 27x^3  →  (log_3 x)^2 = 3+3·log_3 x  →  t^2-3t-... wait
        // Actually (log_3 x)^2 = log_3(27x^3) = 3+3·log_3 x  →  t^2-3t-3=0 (not clean)
        // Better: x^(log_3 x) = 9·x^4  →  (log_3 x)^2 = log_3(9x^4) = 2+4·log_3 x
        // t^2-4t-... hmm. Let me try: x^(log_3 x) = 9x  → t^2=2+t → t^2-t-2=0 → t=2 or t=-1 → x=9 or 1/3
        return buildS323QA(
          '解方程式 ' + s323M('x^{\\log_3 x}=9x') + '（\\(x>0\\)）。',
          s323M('x=9 或 x=\\tfrac13'),
          '兩邊取 \\log_3：(\\log_3 x)^2=\\log_3(9x)=2+\\log_3 x；令 t=\\log_3 x，t^2-t-2=0，(t-2)(t+1)=0，t=2 或 t=-1，x=9 或 \\tfrac13。'
        );
      },
    ];
    return s323MakeSet(count, builders);
  }
  function buildS323PowerLogEquationSubtypeSet(count) {
    return buildS323PowerLogEquationSet(count);
  }

  function s324Pick(items) {
    return items[randInt(0, items.length - 1)];
  }

  function s324M(s) {
    return '\\(' + s + '\\)';
  }

  function s324MJ(...parts) {
    return s324M(parts.join(''));
  }

  function s324Ans(short, process) {
    const clean = (value) => String(value).replace(/[。.]$/u, '');
    return '簡答：' + clean(short) + '。過程：' + clean(process) + '。';
  }

  function s324QA(q, short, process) {
    return { q, a: s324Ans(short, process) };
  }

  function s324MakeSet(count, builders) {
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

  function buildS324GrowthDecaySet(count) {
    const builders = [
      () => {
        const k = s324Pick([2, 3, 4, 6]);
        const start = s324Pick([50, 100, 200]);
        const target = s324Pick(['10^{8}', '10^{10}', '10^{12}']);
        return s324QA(
          '某細菌每 ' +
            k +
            ' 小時變為原來的 3 倍，初始有 ' +
            start +
            ' 株，經過幾天後會超過 ' +
            s324M(target) +
            ' 株？',
          s324MJ('t>', k, '\\frac{\\log(', target, '/', start, ')}{\\log 3}') + ' 小時，再換算成天',
          '建立 ' + s324MJ('N(t)=', start, '\\cdot3^{t/', k, '}') + '，令它大於 ' + s324M(target) + ' 後取對數。'
        );
      },
      () => {
        const half = s324Pick([5700, 5730]);
        const den = s324Pick([8, 16, 32]);
        return s324QA(
          '碳 14 半衰期約 ' + half + ' 年，若含量剩原來的 ' + s324MJ('\\frac1{', den, '}') + '，約經過幾年？',
          s324MJ(half * Math.log2(den)) + ' 年',
          '剩餘比例為 ' + s324MJ('(\\frac12)^n=\\frac1{', den, '}') + '，所以經過 ' + Math.log2(den) + ' 個半衰期。'
        );
      },
      () => {
        const y1 = s324Pick([1980, 1990, 2000]);
        const gap = s324Pick([5, 10]);
        const p1 = s324Pick([40, 50, 60]);
        const ratio = s324Pick([1.1, 1.2, 1.5]);
        const p2 = Math.round(p1 * ratio);
        return s324QA(
          '某人口在 ' +
            y1 +
            ' 年為 ' +
            p1 +
            ' 萬人，' +
            (y1 + gap) +
            ' 年為 ' +
            p2 +
            ' 萬人。若每年按固定倍率成長，預測 ' +
            (y1 + 2 * gap) +
            ' 年人口。',
          s324MJ(p1, '\\cdot', ratio.toFixed(1), '^2') + ' 萬人',
          '每 ' + gap + ' 年倍率為 ' + ratio.toFixed(1) + '，再過同樣時間再乘一次。'
        );
      },
      () => {
        const t1 = s324Pick([3, 6]);
        const a1 = s324Pick([20, 40]);
        const a2 = a1 * s324Pick([4, 8]);
        const t2 = s324Pick([9, 12]);
        return s324QA(
          '布袋蓮面積每月按固定倍率變化，' +
            t1 +
            ' 個月後由 ' +
            a1 +
            ' 平方公尺變為 ' +
            a2 +
            ' 平方公尺，求 ' +
            t2 +
            ' 個月後面積。',
          s324MJ(a1, '\\cdot(', a2 / a1, ')^{', t2, '/', t1, '}') + ' 平方公尺',
          '先由 ' + s324MJ('A(t)=', a1, '\\cdot r^t') + ' 得 ' + s324MJ('r^{', t1, '}=', a2 / a1) + '。'
        );
      },
      () => {
        const init = s324Pick([300, 450, 600]);
        const r = s324Pick([0.5, 0.64, 0.8]);
        const t = s324Pick([1.5, 2, 3]);
        return s324QA(
          '藥物濃度模型為 ' + s324MJ('M(t)=', init, '(', r, ')^t') + ' 毫克，求 ' + t + ' 小時後剩餘量。',
          s324MJ(init, '\\cdot', r, '^{', t, '}') + ' 毫克',
          '直接把時間代入指數衰減模型。'
        );
      },
    ];
    return s324MakeSet(count, builders);
  }

  function buildS324CoolingSet(count) {
    const builders = [
      () => {
        const env = s324Pick([18, 20, 25]);
        const start = s324Pick([80, 90, 100]);
        const h = s324Pick([10, 20]);
        const t = 2 * h;
        const mid = env + (start - env) / 2;
        return s324QA(
          '一杯飲品由 ' +
            start +
            '°C 放在 ' +
            env +
            '°C 房間，已知 ' +
            h +
            ' 分鐘後溫度降為 ' +
            mid +
            '°C，求 ' +
            t +
            ' 分鐘後溫度。',
          env + (start - env) / 4 + '°C',
          '溫差每 ' + h + ' 分鐘減半，所以兩段時間後剩原溫差的 ' + s324M('1/4') + '。'
        );
      },
      () => {
        const env = s324Pick([20, 22]);
        const body = s324Pick([30, 32]);
        const h = s324Pick([4, 5]);
        const t = 2 * h;
        return s324QA(
          '停電後室溫固定為 ' +
            env +
            '°C，某物體溫度 ' +
            body +
            '°C，溫差每 ' +
            h +
            ' 小時減半，求 ' +
            t +
            ' 小時後溫度。',
          env + (body - env) / 4 + '°C',
          '牛頓冷卻型可寫成 ' + s324M('T=a+(b-a)(1/2)^{t/h}') + '。'
        );
      },
      () => {
        const start = s324Pick([25, 30]);
        const inc = s324Pick([20, 30]);
        return s324QA(
          '加熱金屬符合指數趨近模型，1 分鐘後由 ' +
            start +
            '°C 升至 ' +
            (start + inc) +
            '°C。若每分鐘剩餘未升溫差距減半，求 3 分鐘後相對於起點的升溫量。',
          '約為第一分鐘升溫量的 ' + s324M('1+1/2+1/4') + ' 倍',
          '每分鐘新增升溫量按等比衰減。'
        );
      },
      () => {
        const t1 = s324Pick([2, 3]);
        const t2 = t1 + 3;
        const T1 = s324Pick([70, 80]);
        const T2 = s324Pick([40, 50]);
        return s324QA(
          '某冷卻模型為 ' +
            s324M('T=a+b(1/2)^t') +
            '，已知 ' +
            t1 +
            ' 小時為 ' +
            T1 +
            '°C、' +
            t2 +
            ' 小時為 ' +
            T2 +
            '°C，求環境溫度 ' +
            s324M('a') +
            ' 的求法。',
          '解聯立式 ' + s324MJ('T_1=a+b(1/2)^{', t1, '}') + '、' + s324MJ('T_2=a+b(1/2)^{', t2, '}'),
          '兩筆觀測可反推出環境溫度與初始溫差。'
        );
      },
      () => {
        const diff = s324Pick([16, 32, 64]);
        return s324QA(
          '若物體與環境的溫差每 30 分鐘減半，初始溫差為 ' + diff + '°C，問溫差小於 1°C 至少需多久？',
          s324MJ('30\\lceil\\log_2 ', diff, '\\rceil') + ' 分鐘',
          '要使 ' + s324MJ(diff, '(1/2)^n<1') + '。'
        );
      },
    ];
    return s324MakeSet(count, builders);
  }

  function buildS324FinanceSet(count) {
    const builders = [
      () => {
        const r = s324Pick([2, 3, 4, 5]);
        return s324QA(
          '年利率 ' + r + '% 每年複利一次，本金至少需存幾年才會翻倍？',
          s324MJ('n>\\frac{\\log2}{\\log(1+', r / 100, ')}'),
          '由 ' + s324MJ('(1+', r / 100, ')^n>2') + ' 取對數。'
        );
      },
      () => {
        const p = s324Pick([100, 300, 500]);
        const r = s324Pick([2, 3, 4]);
        const n = s324Pick([3, 5]);
        return s324QA(
          '貸款 ' + p + ' 萬元，年利率 ' + r + '%，' + n + ' 年期滿。比較複利與單利的本利和差距。',
          '複利 ' + s324MJ(p, '(1+', r / 100, ')^', n) + '；單利 ' + s324MJ(p, '(1+', (n * r) / 100, ')'),
          '單利用 ' + s324M('P(1+nr)') + '，複利用 ' + s324M('P(1+r)^n') + '。'
        );
      },
      () => {
        const p = s324Pick([1, 2, 5]);
        const r = s324Pick([3, 4]);
        const n = s324Pick([5, 10]);
        return s324QA(
          '每年年初存入 ' + p + ' 萬元，年利率 ' + r + '% 複利，' + n + ' 年後總金額如何表示？',
          s324MJ(p, '(1+', r / 100, ')\\frac{(1+', r / 100, ')^', n, '-1}{', r / 100, '}') + ' 萬元',
          '年初投入是期初年金，每筆都比期末年金多滾一年。'
        );
      },
      () => {
        const loss = s324Pick([1, 2, 5]);
        const target = s324Pick([50, 25]);
        return s324QA(
          '資產每期損失 ' + loss + '%，求經過幾期後資產低於原來的 ' + target + '%。',
          s324MJ('n>\\frac{\\log(', target / 100, ')}{\\log(1-', loss / 100, ')}'),
          '建立 ' + s324MJ('S=P(1-', loss / 100, ')^n') + '。'
        );
      },
      () => {
        const r = s324Pick([3, 6, 12]);
        const m = s324Pick([4, 12]);
        const y = s324Pick([5, 10]);
        return s324QA(
          '年利率 ' + r + '% 改為每年 ' + m + ' 次複利，求 ' + y + ' 年後 1 萬元本利和。',
          s324MJ('(1+', r / (100 * m), ')^{', m * y, '}') + ' 萬元',
          '每期利率為年利率除以 ' + m + '，期數為 ' + m * y + '。'
        );
      },
    ];
    return s324MakeSet(count, builders);
  }

  function buildS324DigitSet(count) {
    const builders = [
      () => {
        const base = s324Pick([2, 3, 5]);
        const n = s324Pick([50, 100]);
        const approx = { 2: 0.301, 3: 0.4771, 5: 0.699 }[base];
        return s324QA(
          '已知 ' +
            s324MJ('\\log ', base, '\\approx ', approx) +
            '，判斷 ' +
            s324MJ(base, '^{', n, '}') +
            ' 是幾位數。',
          s324MJ('\\lfloor ', (n * approx).toFixed(4), '\\rfloor+1') + ' 位數',
          '位數由 ' + s324MJ('\\lfloor n\\log ', base, '\\rfloor+1') + ' 決定。'
        );
      },
      () => {
        const base = s324Pick([2, 3, 6]);
        const n = s324Pick([20, 40, 60]);
        return s324QA(
          '判斷 ' + s324MJ(base, '^{', n, '}') + ' 最高位數字時，應看對數的哪一部分？',
          '看 ' + s324MJ('\\{', n, '\\log ', base, '\\}') + ' 的尾數',
          '首數決定位數，尾數決定科學記號係數。'
        );
      },
      () => {
        const n = s324Pick([40, 60, 100]);
        return s324QA(
          '將 ' + s324MJ('(5/6)^{', n, '}') + ' 表為小數，如何判定小數點後第幾位才出現非 0？',
          '看 ' + s324MJ('-', n, '\\log(5/6)') + ' 的首數',
          '小於 1 的正數用對數首數判斷前導 0 的個數。'
        );
      },
      () => {
        const a = s324Pick([5, 6]);
        const b = s324Pick([4, 5]);
        const target = s324Pick([10, 20]);
        return s324QA(
          '求最小正整數 ' + s324M('n') + '，使 ' + s324MJ('(', a, '/', b, ')^n>10^{', target, '}') + '。',
          s324MJ('n>\\frac{', target, '}{\\log(', a, '/', b, ')}'),
          '兩邊取常用對數後解一次不等式。'
        );
      },
      () => {
        const d = s324Pick([2, 3, 4]);
        const len = s324Pick([10, 12]);
        return s324QA(
          '已知 ' +
            s324MJ('2^n') +
            ' 是最高位數字為 ' +
            d +
            ' 的 ' +
            len +
            ' 位數，說明 ' +
            s324M('n') +
            ' 的判定條件。',
          s324MJ('10^{', len - 1, '}\\le2^n<10^{', len, '}') + ' 且首位落在 ' + d + ' 的區間',
          '用常用對數把位數與首位條件轉成 ' + s324M('n') + ' 的範圍。'
        );
      },
    ];
    return s324MakeSet(count, builders);
  }

  function buildS324LogScaleScienceSet(count) {
    const builders = [
      () => {
        const a = s324Pick([70, 80]);
        const b = a + s324Pick([10, 20]);
        return s324QA(
          '分貝由 ' + a + ' 增加為 ' + b + '，聲音強度變為原來的幾倍？',
          s324MJ('10^{', (b - a) / 10, '}'),
          '分貝差 ' + s324M('=10\\log(I_2/I_1)') + '。'
        );
      },
      () => {
        const diff = s324Pick([2, 3, 4]);
        return s324QA(
          '芮氏規模每增加 1，能量約增加 32 倍。若兩次地震規模差 ' + diff + '，能量約相差幾倍？',
          s324MJ('32^{', diff, '}'),
          '能量倍率按規模差做指數成長。'
        );
      },
      () => {
        const c = s324Pick(['3.5\\times10^{-5}', '2\\times10^{-6}', '4\\times10^{-4}']);
        return s324QA(
          '氫離子濃度 ' + s324M('[H^+]=' + c) + '，用對數表示 pH 值。',
          s324MJ('pH=-\\log(', c, ')'),
          '定義 ' + s324M('pH=-\\log[H^+]') + '。'
        );
      },
      () => {
        const m = s324Pick([1, 2, 3]);
        return s324QA(
          '視星等公式為 ' +
            s324M('m=-2.5\\log(I/I_0)') +
            '。若甲星比乙星亮 ' +
            s324M('10^' + m) +
            ' 倍，星等差為多少？',
          s324MJ('-2.5\\times', m),
          '亮度倍率取對數後乘以 ' + s324M('-2.5') + '。'
        );
      },
      () => {
        const x = s324Pick([8, 10, 16]);
        const y = s324Pick([1, 2, 4]);
        return s324QA(
          '亮度感受 ' + s324M('y=a\\log_2x') + ' 通過 ' + s324MJ('(', x, ',', y, ')') + '，求 ' + s324M('a') + '。',
          s324MJ('a=\\frac{', y, '}{\\log_2 ', x, '}'),
          '代入座標後解比例常數。'
        );
      },
    ];
    return s324MakeSet(count, builders);
  }

  function buildS324PerceptionSet(count) {
    const builders = [
      () => {
        const x = s324Pick([2, 4, 8]);
        const y = s324Pick([1, 2, 3]);
        return s324QA(
          '感官量模型 ' +
            s324M('y=a\\log_2x') +
            ' 通過 ' +
            s324MJ('(', x, ',', y, ')') +
            '，求參數 ' +
            s324M('a') +
            '。',
          s324MJ('a=', y, '/\\log_2 ', x),
          '把點代入模型。'
        );
      },
      () => {
        const from = s324Pick([1, 2]);
        const to = from + 2;
        return s324QA(
          '若亮度感受由 ' + from + ' 提升到 ' + to + '，在 ' + s324M('y=a\\log_2x') + ' 模型下，物理刺激需變為幾倍？',
          s324MJ('2^{', to - from, '}'),
          '感受差 ' + (to - from) + ' 代表真數倍率為 ' + s324MJ('2^{', to - from, '}') + '。'
        );
      },
      () => {
        const inc = s324Pick([1, 2]);
        return s324QA(
          '重量感受 ' +
            s324M('W_s=k\\log W') +
            '，若增加 100 克使感受增加 ' +
            inc +
            ' 單位，再增加幾克才會再增加 ' +
            inc +
            ' 單位？',
          '需乘上相同倍率，不是再加 100 克',
          '對數感受的等差變化對應物理量的等比變化。'
        );
      },
      () => {
        const ratio = s324Pick([2, 4, 10]);
        return s324QA(
          '兩種光源物理強度相差 ' + ratio + ' 倍，感受差可如何表示？',
          s324MJ('a\\log ', ratio),
          '感受差為 ' + s324M('a(\\log I_2-\\log I_1)=a\\log(I_2/I_1)') + '。'
        );
      },
      () => {
        return s324QA(
          '若感官模型為 ' + s324M('y=a\\log_k x') + '，判斷感官閾值 ' + s324M('y=0') + ' 對應的物理刺激。',
          s324M('x=1'),
          '因為 ' + s324M('\\log_k1=0') + '。'
        );
      },
    ];
    return s324MakeSet(count, builders);
  }

  function buildS324SoundAdditionSet(count) {
    const builders = [
      () => {
        const L = s324Pick([60, 70, 80]);
        const n = s324Pick([10, 100]);
        return s324QA(
          n + ' 個各為 ' + L + ' 分貝的相同聲源同時發聲，總分貝為多少？',
          s324MJ(L, '+10\\log ', n) + ' 分貝',
          '強度加成為 ' + n + ' 倍，分貝增加 ' + s324MJ('10\\log ', n) + '。'
        );
      },
      () => {
        const L = s324Pick([50, 60]);
        const n = s324Pick([4, 8, 16]);
        return s324QA(
          n + ' 人同時以 ' + L + ' 分貝說話，總分貝如何表示？',
          s324MJ(L, '+10\\log ', n),
          '總強度為單人強度的 ' + n + ' 倍。'
        );
      },
      () => {
        const a = s324Pick([80, 90]);
        const b = a + s324Pick([3, 10]);
        return s324QA(
          '噪音由 ' + a + ' 分貝增加到 ' + b + ' 分貝，物理強度增加幾倍？',
          s324MJ('10^{', (b - a) / 10, '}'),
          '分貝差轉成強度倍率。'
        );
      },
      () => {
        const high = s324Pick([90, 100]);
        const low = high - 20;
        return s324QA(
          '若要把噪音由 ' + high + ' 分貝降到 ' + low + ' 分貝，需把強度降為原來的幾分之一？',
          s324MJ('10^{-2}'),
          '降低 20 分貝代表強度乘上 ' + s324M('10^{-2}') + '。'
        );
      },
      () => {
        return s324QA(
          '比較「1000 隻蚊子每隻 0 分貝」與「1 個人 60 分貝」的總分貝。',
          '蚊子總分貝為 ' + s324M('30') + '，低於 60 分貝',
          s324M('0+10\\log1000=30') + '。'
        );
      },
    ];
    return s324MakeSet(count, builders);
  }

  function buildS324EarthquakeSet(count) {
    const builders = [
      () => {
        const diff = s324Pick([1, 2, 3]);
        return s324QA(
          '芮氏規模相差 ' + diff + '，震幅約相差幾倍？',
          s324MJ('10^{', diff, '}'),
          '規模每差 1，震幅差 10 倍。'
        );
      },
      () => {
        const diff = s324Pick([2, 4, 6]);
        return s324QA(
          '若兩次地震釋放能量相差 ' + s324MJ('10^', diff) + ' 倍，芮氏規模約相差多少？',
          s324MJ('\\frac{', diff, '}{1.5}'),
          '能量倍率約為 ' + s324M('10^{1.5\\Delta M}') + '。'
        );
      },
      () => {
        const M = s324Pick([6.5, 7.0, 7.3]);
        return s324QA(
          '利用 ' + s324M('\\log E=11.8+1.5M') + '，表示規模 ' + M + ' 地震能量。',
          s324MJ('E=10^{11.8+1.5\\times', M, '}'),
          '由能量公式直接轉回指數式。'
        );
      },
      () => {
        const e = s324Pick([18, 20]);
        return s324QA(
          '已知地震能量約為 ' + s324MJ('10^{', e, '}') + ' 爾格，求芮氏規模。',
          s324MJ('M=\\frac{', e, '-11.8}{1.5}'),
          '由 ' + s324M('\\log E=11.8+1.5M') + ' 解 ' + s324M('M') + '。'
        );
      },
      () => {
        const factor = s324Pick([100, 500, 1000]);
        return s324QA(
          '若震幅增加 ' + factor + ' 倍，規模增加量如何表示？',
          s324MJ('\\log ', factor),
          '震幅倍率是 ' + s324M('10^{\\Delta M}') + '。'
        );
      },
    ];
    return s324MakeSet(count, builders);
  }

  function buildS324MortgageSet(count) {
    const builders = [
      () => {
        const P = s324Pick([500, 1000]);
        const r = s324Pick([1.2, 2.4]);
        const y = s324Pick([10, 20]);
        return s324QA(
          '貸款 ' + P + ' 萬元，年利率 ' + r + '%，期限 ' + y + ' 年，若每月複利一次，一次清償本利和如何表示？',
          s324MJ(P, '(1+', (r / 1200).toFixed(3), ')^{', 12 * y, '}') + ' 萬元',
          '月利率為年利率除以 12，期數為月數。'
        );
      },
      () => {
        return s324QA(
          '若採本息平均攤還且每月還款固定，使用對數時主要用來求什麼？',
          '求還清期數或反推利率',
          '固定月付額會形成等比級數，整理後常需取對數。'
        );
      },
      () => {
        const r = s324Pick([3, 4]);
        const y = s324Pick([3, 5]);
        return s324QA(
          '比較年利率 ' + r + '% 的貸款在 ' + y + ' 年期滿時，複利與單利的本利和差距。',
          '差距為 ' + s324MJ('P[(1+', r / 100, ')^', y, '-(1+', (y * r) / 100, ')]'),
          '同本金下直接相減。'
        );
      },
      () => {
        const p = s324Pick([1, 2]);
        const r = s324Pick([4, 5]);
        const y = s324Pick([10, 20]);
        return s324QA(
          '每年年初投入 ' + p + ' 萬元，年利率 ' + r + '%，求 ' + y + ' 年後總金額。',
          s324MJ(p, '(1+', r / 100, ')\\frac{(1+', r / 100, ')^', y, '-1}{', r / 100, '}') + ' 萬元',
          '期初年金公式。'
        );
      },
      () => {
        const target = s324Pick([100, 200]);
        const r = s324Pick([3, 4]);
        return s324QA(
          '若目標金額為 ' + target + ' 萬元，年利率 ' + r + '%，一次投入本金至少要多少才可在 10 年後達標？',
          s324MJ('\\frac{', target, '}{(1+', r / 100, ')^{10}}') + ' 萬元',
          '由 ' + s324M('S=P(1+r)^n') + ' 反推本金。'
        );
      },
    ];
    return s324MakeSet(count, builders);
  }

  function buildS324LightFilterSet(count) {
    const builders = [
      () => {
        const keep = s324Pick([0.8, 0.9]);
        const threshold = s324Pick([0.6, 0.5]);
        return s324QA(
          '光線每通過一片濾鏡保留原強度的 ' + keep + '，至少幾片後強度低於原來的 ' + threshold + '？',
          s324MJ('n>\\frac{\\log ', threshold, '}{\\log ', keep, '}'),
          '建立 ' + s324MJ('I=I_0\\cdot', keep, '^n') + '。'
        );
      },
      () => {
        const k = s324Pick([0.5, 0.7, 0.8]);
        return s324QA(
          '若光線穿透率為 ' + k + '，通過 ' + s324M('n') + ' 層後強度比例為何？',
          s324MJ(k, '^n'),
          '每層都乘上同一比例。'
        );
      },
      () => {
        const a = s324Pick([0.8, 0.9]);
        const b = s324Pick([0.5, 0.6]);
        return s324QA(
          '比較兩種濾光片穿透率 ' + a + ' 與 ' + b + '，哪一種衰減較慢？',
          a > b ? String(a) : String(b),
          '穿透率越接近 1，每層衰減越慢。'
        );
      },
      () => {
        const half = s324Pick([8, 10]);
        return s324QA(
          '放射性物質半衰期 ' + half + ' 天，' + 3 * half + ' 天後剩餘比例為何？',
          s324M('1/8'),
          '經過 3 個半衰期。'
        );
      },
      () => {
        return s324QA(
          '環境照度 ' +
            s324M('x') +
            ' 與視覺感受 ' +
            s324M('y') +
            ' 呈 ' +
            s324M('y=a\\log x+b') +
            '，若照度乘以 10，感受增加多少？',
          s324M('a'),
          '因為 ' + s324M('\\log(10x)-\\log x=1') + '。'
        );
      },
    ];
    return s324MakeSet(count, builders);
  }

  function buildS324InformationSet(count) {
    const builders = [
      () => {
        const start = s324Pick([10, 20, 50]);
        const a = s324Pick([2, 3]);
        const target = s324Pick([1000, 5000]);
        return s324QA(
          '訊息每天傳給原來的 ' + a + ' 倍人數，初始 ' + start + ' 人知道，達到 ' + target + ' 人至少需幾天？',
          s324MJ('n>\\frac{\\log(', target, '/', start, ')}{\\log ', a, '}'),
          '建立 ' + s324MJ('N=', start, '\\cdot', a, '^n') + '。'
        );
      },
      () => {
        const a = s324Pick([2, 3]);
        return s324QA(
          '若訊息傳播模型為 ' + s324MJ('N(t)=N_0\\cdot', a, '^t') + '，比較第 6 天與第 3 天的人數倍率。',
          s324MJ(a, '^3'),
          '相除後只剩時間差的指數。'
        );
      },
      () => {
        const a = s324Pick([1.2, 1.5, 2]);
        return s324QA(
          '不同傳播率 ' + s324M('a') + ' 下，達成同一覆蓋量所需時間如何比較？',
          '傳播率越大，所需時間越短',
          '時間為 ' + s324M('t=\\log(N/N_0)/\\log a') + '。'
        );
      },
      () => {
        const k = s324Pick([0.7, 0.8, 0.9]);
        return s324QA(
          '病毒濃度每天衰減為原來的 ' + k + '，求降到 10% 以下所需天數。',
          s324MJ('n>\\frac{\\log0.1}{\\log ', k, '}'),
          '衰減模型為 ' + s324MJ('N=N_0\\cdot', k, '^n') + '。'
        );
      },
      () => {
        const days = s324Pick([5, 7]);
        const q = s324Pick([4, 8]);
        return s324QA(
          '某昆蟲數量 ' + days + ' 天後變為原來的 ' + q + ' 倍，求每日成長倍率。',
          s324MJ(q, '^{1/', days, '}'),
          '令每日倍率為 ' + s324M('a') + '，則 ' + s324MJ('a^{', days, '}=', q) + '。'
        );
      },
    ];
    return s324MakeSet(count, builders);
  }

  function buildS324TemporalProportionalitySet(count) {
    const builders = [
      () => {
        const pair = s324Pick([
          [2, 3],
          [2, 5],
          [3, 4],
          [4, 5],
        ]);
        const a = pair[0],
          b = pair[1],
          ab = a * b;
        return s324QA(
          '某植物面積按固定倍率成長，達到 ' +
            a +
            '、' +
            b +
            '、' +
            ab +
            ' 平方公尺所需時間分別為 ' +
            s324MJ('t_{', a, '},t_{', b, '},t_{', ab, '}') +
            '，證明時間關係。',
          s324MJ('t_{', a, '}+t_{', b, '}=t_{', ab, '}'),
          '時間與倍率的對數成正比，且 ' + s324MJ('\\log ', a, '+\\log ', b, '=\\log ', ab) + '。'
        );
      },
      () => {
        const pair = s324Pick([
          [2, 3],
          [2, 5],
          [3, 4],
          [3, 5],
        ]);
        const k = pair[0],
          m = pair[1];
        return s324QA(
          '某細菌增加到 ' +
            k +
            ' 倍、' +
            m +
            ' 倍、' +
            k * m +
            ' 倍所需時間分別為 ' +
            s324M('x,y,z') +
            '，說明三者關係。',
          s324M('x+y=z'),
          '同一成長率下，時間與倍率的對數成正比，因為 ' + s324MJ('\\log ', k, '+\\log ', m, '=\\log ', k * m) + '。'
        );
      },
      () => {
        const r = s324Pick([0.8, 0.85, 0.9]);
        const target = s324Pick([0.5, 0.25]);
        return s324QA(
          '資源每年保留 ' + r + '，求降到原來 ' + target * 100 + '% 所需年數。',
          s324MJ('n>\\frac{\\log ', target, '}{\\log ', r, '}'),
          '衰減到比例目標時取對數。'
        );
      },
      () => {
        const k = s324Pick([2, 3, 4]);
        const period = s324Pick([1, 2, 3]);
        return s324QA(
          '細菌每 ' +
            period +
            ' 小時變為 ' +
            k +
            ' 倍，證明增加到 ' +
            s324M('N') +
            ' 倍與 ' +
            s324M(k + 'N') +
            ' 倍的時間差固定。',
          '固定為 ' + period + ' 小時',
          '後者比前者多乘 ' + k + '，正好是一個成長週期。'
        );
      },
      () => {
        const h = s324Pick([1, 2, 3]);
        return s324QA(
          '若成長模型取對數後，時間每增加 ' + h + ' 單位，對數值都增加同一常數，如何判斷模型？',
          '可判斷為穩定的指數成長或衰減模型',
          '指數模型取對數後會變成直線，固定時間差對應固定對數差。'
        );
      },
    ];
    return s324MakeSet(count, builders);
  }

  function buildS324LogLinearSet(count) {
    const builders = [
      () => {
        const p = s324Pick([
          [3, 2],
          [2, 3],
          [5, 2],
        ]);
        return s324QA(
          '研究物理量 ' +
            s324M('Y') +
            ' 與尺度 ' +
            s324M('x') +
            '，若 ' +
            s324M('\\log Y') +
            ' 對 ' +
            s324M('\\log x') +
            ' 的斜率為 ' +
            s324MJ('\\frac{', p[0], '}{', p[1], '}') +
            '，寫出冪次關係。',
          s324MJ('Y=Cx^{', p[0], '/', p[1], '}'),
          '雙對數圖的斜率就是冪次，所以 ' + s324M('Y=Cx^m') + '。'
        );
      },
      () => {
        const target = s324Pick([900, 1000]);
        return s324QA(
          '營收與費用滿足 ' +
            s324M('S(x)=400+250\\log x') +
            '，若營收預計達 ' +
            target +
            ' 千元，費用投入 ' +
            s324M('x') +
            ' 如何表示？',
          s324MJ('x=10^{(', target, '-400)/250}'),
          '移項後把對數式轉成指數式。'
        );
      },
      () => {
        const d = s324Pick([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        return s324QA(
          '根據班佛法則，首位數字為 ' + d + ' 的比例如何表示？',
          s324MJ('P=', '\\log(1+\\frac1{', d, '})'),
          '首位落在 ' + s324MJ('[', d, ',', d + 1, ')') + ' 的對數長度。'
        );
      },
      () => {
        const x1 = s324Pick([2, 3]);
        const x2 = x1 + 1;
        return s324QA(
          '用內插估算對數表中 ' + s324M('x') + ' 介於 ' + x1 + ' 與 ' + x2 + ' 的對數值，核心假設是什麼？',
          '在短區間內近似線性',
          '把對數曲線局部視為直線做比例分配。'
        );
      },
      () => {
        const cm = s324Pick([10, 20, 30]);
        return s324QA(
          '頭髮直徑 ' + cm + ' 微米，轉為公尺後其常用對數如何表示？',
          s324MJ('\\log(', cm, '\\times10^{-6})'),
          '先轉成科學記號，再用對數律拆開。'
        );
      },
    ];
    return s324MakeSet(count, builders);
  }

  function buildS324LearningSet(count) {
    const builders = [
      () => {
        const base = s324Pick([68, 75]);
        const drop = s324Pick([10, 15]);
        const t = s324Pick([3, 5]);
        return s324QA(
          '某課程剛結束平均分數 ' +
            base +
            ' 分，' +
            s324M('t') +
            ' 個月後模型為 ' +
            s324MJ('S(t)=', base, '-', drop, '\\log(t+1)') +
            '，求 ' +
            t +
            ' 個月後分數。',
          s324MJ(base, '-', drop, '\\log ', t + 1) + ' 分',
          '直接代入月份。'
        );
      },
      () => {
        const target = s324Pick([49, 60]);
        return s324QA(
          '若 ' + s324M('S(t)=68-15\\log(t+1)') + '，求降到 ' + target + ' 分所需時間。',
          s324MJ('t=10^{(68-', target, ')/15}-1'),
          '移項後把對數式轉成指數式。'
        );
      },
      () => {
        const w = s324Pick([800, 1000]);
        const k = s324Pick([0.8, 0.9]);
        return s324QA(
          '英文單字記憶量 ' + w + ' 字，一週後剩 ' + w * k + ' 字；若每週按固定比例衰退，兩週後剩多少？',
          String(w * k * k) + ' 字',
          '每週乘同一衰退比例。'
        );
      },
      () => {
        return s324QA(
          '比較兩種學習法的衰退係數 ' + s324M('k') + '，哪一個較持久？',
          '衰退係數較接近 1 者較持久',
          '模型 ' + s324M('W(t)=W_0\\cdot k^t') + ' 中 ' + s324M('k') + ' 越大下降越慢。'
        );
      },
      () => {
        const target = s324Pick([80, 90]);
        return s324QA(
          '若設定目標分數 ' + target + '，模型 ' + s324M('S(n)=100-20(0.8)^n') + '，求達標所需最少複習週期。',
          s324MJ('100-20(0.8)^n\\ge ', target),
          '把目標分數代入不等式後取對數。'
        );
      },
    ];
    return s324MakeSet(count, builders);
  }

  function buildS324SpecialDistributionSet(count) {
    const builders = [
      () => {
        const p = s324Pick([
          [3, 2],
          [2, 3],
          [5, 2],
        ]);
        return s324QA(
          '某組變數取對數後呈直線，斜率為 ' + s324MJ('\\frac{', p[0], '}{', p[1], '}') + '，寫出冪次模型。',
          s324MJ('Y=Cx^{', p[0], '/', p[1], '}'),
          '對數直線斜率就是冪次。'
        );
      },
      () => {
        const d = s324Pick([4, 5, 6, 7]);
        return s324QA(
          '依班佛法則，首位數字為 ' + d + ' 的比例是多少？',
          s324MJ('\\log(1+\\frac1{', d, '})'),
          '套用 ' + s324M('P(d)=\\log(1+1/d)') + '。'
        );
      },
      () => {
        const slope = s324Pick([120, 180, 250]);
        const factor = s324Pick([10, 100]);
        return s324QA(
          '銷售與費用滿足 ' + s324MJ('S(x)=400+', slope, '\\log x') + '，若費用變為 ' + factor + ' 倍，營收增加多少？',
          '增加 ' + slope * Math.log10(factor) + ' 千元',
          '因為 ' + s324MJ('\\log(', factor, 'x)-\\log x=', Math.log10(factor)) + '。'
        );
      },
      () => {
        const ratio = s324Pick([16, 64, 128]);
        return s324QA(
          '視覺面積感知與實際面積的 ' +
            s324M('0.7') +
            ' 次方成正比。若感覺地圖大國是小國的 ' +
            ratio +
            ' 倍，實際面積比如何表示？',
          s324MJ(ratio, '^{1/0.7}'),
          '感覺比是實際比的 ' + s324M('0.7') + ' 次方。'
        );
      },
      () => {
        const model = s324Pick(['冪函數', '指數函數']);
        return s324QA(
          '若模型屬於' + model + '，應如何取對數後觀察座標平面上的圖形特徵？',
          model === '冪函數' ? '雙對數圖為直線' : '半對數圖為直線',
          model === '冪函數'
            ? '若 ' + s324M('y=Cx^a') + '，則 ' + s324M('\\log y=\\log C+a\\log x') + '。'
            : '若 ' + s324M('y=Ca^x') + '，則 ' + s324M('\\log y=\\log C+x\\log a') + '。'
        );
      },
    ];
    return s324MakeSet(count, builders);
  }

  function buildS324GrowthMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS324GrowthDecaySet,
        buildS324CoolingSet,
        buildS324LightFilterSet,
        buildS324InformationSet,
        buildS324LearningSet,
      ],
      count
    );
  }

  function buildS324LogScaleMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS324LogScaleScienceSet,
        buildS324PerceptionSet,
        buildS324SoundAdditionSet,
        buildS324EarthquakeSet,
        buildS324LogLinearSet,
      ],
      count
    );
  }

  function buildS324FinanceModelMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS324FinanceSet,
        buildS324MortgageSet,
        buildS324DigitSet,
        buildS324TemporalProportionalitySet,
        buildS324SpecialDistributionSet,
      ],
      count
    );
  }

  function buildS324GrowthDecaySubtypeSet(count) {
    return buildS324GrowthDecaySet(count);
  }

  function buildS324CoolingSubtypeSet(count) {
    return buildS324CoolingSet(count);
  }

  function buildS324LightFilterSubtypeSet(count) {
    return buildS324LightFilterSet(count);
  }

  function buildS324InformationSubtypeSet(count) {
    return buildS324InformationSet(count);
  }

  function buildS324LearningSubtypeSet(count) {
    return buildS324LearningSet(count);
  }

  function buildS324LogScaleScienceSubtypeSet(count) {
    return buildS324LogScaleScienceSet(count);
  }

  function buildS324PerceptionSubtypeSet(count) {
    return buildS324PerceptionSet(count);
  }

  function buildS324SoundAdditionSubtypeSet(count) {
    return buildS324SoundAdditionSet(count);
  }

  function buildS324EarthquakeSubtypeSet(count) {
    return buildS324EarthquakeSet(count);
  }

  function buildS324LogLinearSubtypeSet(count) {
    return buildS324LogLinearSet(count);
  }

  function buildS324FinanceSubtypeSet(count) {
    return buildS324FinanceSet(count);
  }

  function buildS324MortgageSubtypeSet(count) {
    return buildS324MortgageSet(count);
  }

  function buildS324DigitSubtypeSet(count) {
    return buildS324DigitSet(count);
  }

  function buildS324TemporalSubtypeSet(count) {
    return buildS324TemporalProportionalitySet(count);
  }

  function buildS324SpecialDistributionSubtypeSet(count) {
    return buildS324SpecialDistributionSet(count);
  }

  function s32CleanAnswer(short, process) {
    return `答案：${short}。解析：${process}`;
  }

  function s32CleanSet(count, builders) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const item = builders[i % builders.length]();
      questions.push(item.q);
      answers.push(s32CleanAnswer(item.short, item.process));
    }
    return { questions, summaryAnswers, answers };
  }

  function s32LogApprox(base) {
    const table = { 2: '0.3010', 3: '0.4771', 5: '0.6990' };
    return table[base] || `\\log ${base}`;
  }

  function buildS321PowerRootComparisonCleanSet(count) {
    const builders = [
      () => ({
        q: '比較 \\(a=\\sqrt2\\)、\\(b=\\sqrt[3]{3}\\)、\\(c=\\sqrt[4]{4}\\) 的大小。',
        short: '\\(b>a=c\\)',
        process:
          '三數同為正數，可同取 12 次方比較。\\(a^{12}=2^6=64\\)，\\(b^{12}=3^4=81\\)，\\(c^{12}=4^3=64\\)，所以 \\(b>a=c\\)。',
      }),
      () => ({
        q: '比較 \\(a=\\sqrt3\\)、\\(b=\\sqrt[3]{4}\\)、\\(c=\\sqrt[6]{16}\\) 的大小。',
        short: '\\(a>b=c\\)',
        process:
          '同取 6 次方比較：\\(a^6=3^3=27\\)，\\(b^6=4^2=16\\)，\\(c^6=16\\)，所以 \\(a>b=c\\)。',
      }),
      () => ({
        q: '比較 \\(a=\\sqrt[3]{2}\\)、\\(b=\\sqrt[4]{4}\\)、\\(c=\\sqrt[6]{8}\\) 的大小。',
        short: '\\(b=c>a\\)',
        process:
          '把底數都寫成 2 的冪：\\(a=2^{1/3}\\)，\\(b=(2^2)^{1/4}=2^{1/2}\\)，\\(c=(2^3)^{1/6}=2^{1/2}\\)。因 \\(\\frac12>\\frac13\\)，所以 \\(b=c>a\\)。',
      }),
      () => ({
        q: '比較 \\(a=\\sqrt[4]{\\frac1{16}}\\)、\\(b=\\sqrt[3]{\\frac1{8}}\\)、\\(c=\\sqrt{\\frac14}\\) 的大小。',
        short: '\\(a=b=c\\)',
        process:
          '三者分別為 \\((2^{-4})^{1/4}=2^{-1}\\)、\\((2^{-3})^{1/3}=2^{-1}\\)、\\((2^{-2})^{1/2}=2^{-1}\\)，所以三者相等。',
      }),
    ];
    return s32CleanSet(count, builders);
  }

  function buildS321ExponentialIntegerCountCleanSet(count) {
    const cases = [
      { base: 2, lo: 3, hi: 4, ans: '4 個，分別是 \\(10,11,12,13\\)' },
      { base: 3, lo: 5, hi: 6, ans: '2 個，分別是 \\(11,12\\)' },
      { base: 2, lo: 6, hi: 7, ans: '3 個，分別是 \\(20,21,22\\)' },
      { base: 3, lo: 3, hi: 4, ans: '2 個，分別是 \\(7,8\\)' },
    ];
    const builders = cases.map((item) => () => {
      const logText = s32LogApprox(item.base);
      return {
        q: `已知 \\(\\log ${item.base}\\approx ${logText}\\)。有多少個整數 \\(x\\) 滿足 \\(10^{${item.lo}}<${item.base}^x<10^{${item.hi}}\\)？`,
        short: item.ans,
        process: `兩邊取常用對數，得 \\(${item.lo}<x\\log ${item.base}<${item.hi}\\)，也就是 \\(\\frac{${item.lo}}{${logText}}<x<\\frac{${item.hi}}{${logText}}\\)，再取其中的整數。`,
      };
    });
    return s32CleanSet(count, builders);
  }

  function buildS321ExponentialGraphParameterCleanSet(count) {
    const cases = [
      { c: 1, A: 2, r: 3 },
      { c: -1, A: 4, r: 2 },
      { c: 2, A: 3, r: 4 },
      { c: -2, A: 5, r: 2 },
    ];
    const builders = cases.map((item) => () => ({
      q: `函數 \\(y=c+A r^x\\) 的水平漸近線為 \\(y=${item.c}\\)，且通過 \\((0,${item.c + item.A})\\)、\\((1,${item.c + item.A * item.r})\\)。求此函數。`,
      short: `\\(y=${item.c}+${item.A}\\cdot ${item.r}^x\\)`,
      process:
        `由水平漸近線得 \\(c=${item.c}\\)。代入 \\(x=0\\)，\\(c+A=${item.c + item.A}\\)，得 \\(A=${item.A}\\)。再代入 \\(x=1\\)，\\(c+Ar=${item.c + item.A * item.r}\\)，得 \\(r=${item.r}\\)。`,
    }));
    return s32CleanSet(count, builders);
  }

  function buildS322DominantLogApproxCleanSet(count) {
    const cases = [
      { px: 2.8, py: 5.6, m: 2, n: 1, ans: '約為 \\(5.9\\)' },
      { px: 1.5, py: 2.6, m: 5, n: 3, ans: '約為 \\(7.8\\)' },
      { px: 4, py: 6, m: 1, n: 1, ans: '約為 \\(6\\)' },
      { px: 3.2, py: 2.1, m: 2, n: 3, ans: '約為 \\(6.6\\)' },
    ];
    const builders = cases.map((item) => () => {
      const left = item.m * item.px;
      const right = item.n * item.py;
      return {
        q: `已知 \\(\\log x=${item.px}\\)、\\(\\log y=${item.py}\\)。估計 \\(\\log(x^{${item.m}}+y^{${item.n}})\\) 最接近多少？`,
        short: item.ans,
        process:
          `先比較兩項的數量級：\\(\\log x^{${item.m}}=${left}\\)，\\(\\log y^{${item.n}}=${right}\\)。和的對數會接近較大的數量級；若兩者接近，再補上 \\(\\log 2\\) 的影響。本題主導項指數為 ${Math.max(left, right)}。`,
      };
    });
    return s32CleanSet(count, builders);
  }

  function buildS322LogDomainIntegerCountCleanSet(count) {
    const cases = [
      { a: 2, b: 8, c: 7, valid: [4, 5, 6] },
      { a: 1, b: 7, c: 10, valid: [3, 4] },
      { a: 3, b: 10, c: 16, valid: [5] },
      { a: 2, b: 9, c: 14, valid: [4, 5, 6] },
    ];
    const builders = cases.map((item) => () => ({
      q: `使 \\(\\log_{x-${item.a}}(-x^2+${item.b}x-${item.c})\\) 有意義的整數 \\(x\\) 共有幾個？`,
      short: `\\(${item.valid.length}\\) 個`,
      process:
        `需同時滿足底數 \\(x-${item.a}>0\\)、\\(x-${item.a}\\ne1\\)，以及真數 \\(-x^2+${item.b}x-${item.c}>0\\)。把這些條件交集後，整數解為 \\(${item.valid.join(', ')}\\)，共有 \\(${item.valid.length}\\) 個。`,
    }));
    return s32CleanSet(count, builders);
  }

  function buildS322ChainChangeBaseCleanSet(count) {
    const cases = [
      { p: 2, q: 3, r: 4 },
      { p: 3, q: 4, r: 5 },
      { p: 2, q: 5, r: 6 },
      { p: 4, q: 5, r: 6 },
    ];
    const builders = cases.map((item) => {
      const sum = item.p + item.q + item.r;
      return () => ({
        q: `設 \\(a,b,c>1\\)，且 \\(\\log_a x=\\frac1{${item.p}}\\)、\\(\\log_b x=\\frac1{${item.q}}\\)、\\(\\log_c x=\\frac1{${item.r}}\\)。求 \\(\\log_{abc}x\\)。`,
        short: `\\(\\frac1{${sum}}\\)`,
        process:
          `由 \\(\\log_a x=1/${item.p}\\) 得 \\(a=x^{${item.p}}\\)，同理 \\(b=x^{${item.q}}\\)、\\(c=x^{${item.r}}\\)。所以 \\(abc=x^{${sum}}\\)，\\(\\log_{abc}x=\\log_{x^{${sum}}}x=\\frac1{${sum}}\\)。`,
      });
    });
    return s32CleanSet(count, builders);
  }

  function buildS323LogPointTransformCleanSet(count) {
    const cases = [
      { k: 1, m: 2 },
      { k: 2, m: 3 },
      { k: -1, m: 2 },
      { k: 3, m: 2 },
    ];
    const builders = cases.map((item) => () => ({
      q: `若 \\((a,b)\\) 在 \\(y=\\log x\\) 的圖形上，請寫出另外兩個也在圖形上的點：一個由 \\(x\\) 乘以 \\(10^{${item.k}}\\) 得到，一個由 \\(x\\) 變成 \\(a^{${item.m}}\\) 得到。`,
      short: `\\((10^{${item.k}}a,b+${item.k})\\)、\\((a^{${item.m}},${item.m}b)\\)`,
      process:
        `因 \\(b=\\log a\\)。所以 \\(\\log(10^{${item.k}}a)=${item.k}+\\log a=b+${item.k}\\)，且 \\(\\log(a^{${item.m}})=${item.m}\\log a=${item.m}b\\)。`,
    }));
    return s32CleanSet(count, builders);
  }

  function buildS323LogBaseOrderCleanSet(count) {
    const builders = [
      () => ({
        q: '若 \\(x>1\\)，且 \\(\\log_a x<\\log_b x<0\\)，判斷 \\(a,b\\) 的大小範圍。',
        short: '\\(0<b<a<1\\)',
        process:
          '因 \\(x>1\\) 時 \\(\\ln x>0\\)，而對數值小於 0 表示底數在 \\(0\\) 與 \\(1\\) 之間。函數 \\(\\log_t x=\\ln x/\\ln t\\) 在 \\(0<t<1\\) 時會隨 \\(t\\) 變大而變小，所以 \\(\\log_a x<\\log_b x\\) 得 \\(a>b\\)。',
      }),
      () => ({
        q: '若 \\(0<x<1\\)，且 \\(0<\\log_a x<\\log_b x\\)，判斷 \\(a,b\\) 的大小範圍。',
        short: '\\(0<b<a<1\\)',
        process:
          '此時 \\(\\ln x<0\\)，對數值為正表示底數也在 \\(0\\) 與 \\(1\\) 之間。在 \\(0<t<1\\) 時分母 \\(\\ln t<0\\)，比較可得底數越大，對數值越小，所以 \\(a>b\\)。',
      }),
      () => ({
        q: '若 \\(x>1\\)，且 \\(0<\\log_a x<\\log_b x\\)，判斷 \\(a,b\\) 的大小範圍。',
        short: '\\(1<b<a\\)',
        process:
          '對數值為正且 \\(x>1\\)，底數都大於 1。底數越大，\\(\\log_{底數}x\\) 越小，所以 \\(\\log_a x<\\log_b x\\) 得 \\(a>b>1\\)。',
      }),
      () => ({
        q: '若 \\(0<x<1\\)，且 \\(\\log_a x<\\log_b x<0\\)，判斷 \\(a,b\\) 的大小範圍。',
        short: '\\(1<a<b\\)',
        process:
          '對數值為負且 \\(0<x<1\\)，底數都大於 1。底數越大，負值越接近 0，所以 \\(\\log_a x<\\log_b x\\) 得 \\(a<b\\)。',
      }),
    ];
    return s32CleanSet(count, builders);
  }

  function buildS324GrowthThresholdCleanSet(count) {
    const cases = [
      { start: 10, rate: 2, period: 1, target: '10^8', unit: '小時' },
      { start: 100, rate: 3, period: 2, target: '10^6', unit: '小時' },
      { start: 100, rate: 0.5, period: 30, target: '30', unit: '分鐘' },
      { start: 20000, rate: 0.96, period: 1, target: '500', unit: '天' },
    ];
    const builders = cases.map((item) => () => ({
      q: `某量一開始為 \\(${item.start}\\)，每 \\(${item.period}\\) ${item.unit} 會乘以 \\(${item.rate}\\)。至少經過多久會${item.rate > 1 ? '超過' : '低於'} \\(${item.target}\\)？請列出可取對數求解的不等式。`,
      short: `\\(t>${item.period}\\cdot\\frac{\\log(${item.target}/${item.start})}{\\log ${item.rate}}\\)`,
      process:
        `模型為 \\(N(t)=${item.start}\\cdot ${item.rate}^{t/${item.period}}\\)。令它與目標量比較後取對數，再注意 \\(\\log ${item.rate}\\) 的正負；化簡可得門檻時間 \\(t>${item.period}\\cdot\\frac{\\log(${item.target}/${item.start})}{\\log ${item.rate}}\\)。`,
    }));
    return s32CleanSet(count, builders);
  }

  function buildS324LogScaleRatioCleanSet(count) {
    const builders = [
      () => ({
        q: '芮氏規模每增加 \\(\\Delta M=2\\)，若能量滿足 \\(\\log E=11.8+1.5M\\)，能量變為幾倍？',
        short: '\\(10^3=1000\\) 倍',
        process: '能量比為 \\(10^{1.5\\Delta M}=10^{1.5\\times2}=10^3\\)。',
      }),
      () => ({
        q: '星等定義為 \\(m=-2.5\\log(F/F_0)\\)。若甲星比乙星亮，星等小 \\(5\\)，則甲的光強是乙的幾倍？',
        short: '\\(100\\) 倍',
        process: '星等差 \\(m_甲-m_乙=-5\\)，所以 \\(-2.5\\log(F_甲/F_乙)=-5\\)，得 \\(F_甲/F_乙=10^2=100\\)。',
      }),
      () => ({
        q: '溶液 pH 定義為 \\(\\mathrm{pH}=-\\log[H^+]\\)。若 A 的 pH 比 B 小 2，A 的氫離子濃度是 B 的幾倍？',
        short: '\\(100\\) 倍',
        process: 'pH 小 2 代表 \\(-\\log[H^+]\\) 小 2，所以 \\([H^+]\\) 大 \\(10^2\\) 倍。',
      }),
      () => ({
        q: '班佛法則中最高位數字為 \\(d\\) 的比例為 \\(\\log(1+1/d)\\)。最高位數字為 2、3、4 的比例合計是多少？',
        short: '\\(\\log\\frac52\\)',
        process:
          '\\(\\log\\frac32+\\log\\frac43+\\log\\frac54=\\log(\\frac32\\cdot\\frac43\\cdot\\frac54)=\\log\\frac52\\)。',
      }),
    ];
    return s32CleanSet(count, builders);
  }

  function buildS324CompoundInferenceCleanSet(count) {
    const cases = [
      { p: 1000, after: 2200, n: 100 },
      { p: 10, after: 98.5, n: 24 },
      { p: 200, after: 500, n: 5 },
      { p: 50, after: 80, n: 3 },
    ];
    const builders = cases.map((item) => () => ({
      q: `某量依固定倍率成長，初始為 \\(${item.p}\\)，經過 \\(${item.n}\\) 單位時間後為 \\(${item.after}\\)。若再經過同樣 \\(${item.n}\\) 單位時間，數量是多少？`,
      short: `\\(\\frac{${item.after}^2}{${item.p}}\\)`,
      process:
        `固定倍率模型中，相同時間乘上相同倍率。前 \\(${item.n}\\) 單位時間的倍率為 \\(${item.after}/${item.p}\\)，再過同樣時間再乘一次，所以結果為 \\(${item.after}\\cdot\\frac{${item.after}}{${item.p}}=\\frac{${item.after}^2}{${item.p}}\\)。`,
    }));
    return s32CleanSet(count, builders);
  }

  function s33Det(ax, ay, bx, by) {
    return ax * by - ay * bx;
  }

  function s33Vector(x, y) {
    return `(${x},${y})`;
  }

  function buildS331BarycentricInteriorCleanSet(count) {
    const cases = [
      { fixed: [1, 3], variable: 't', upper: [2, 3] },
      { fixed: [2, 5], variable: 's', upper: [3, 5] },
      { fixed: [1, 4], variable: 'k', upper: [3, 4] },
      { fixed: [3, 7], variable: 't', upper: [4, 7] },
    ];
    return s32CleanSet(count, cases.map((item) => () => ({
      q: `在三角形 \\(ABC\\) 中，若 \\(\\vec{AP}=${formatFraction(item.fixed[0], item.fixed[1])}\\vec{AB}+${item.variable}\\vec{AC}\\)。求 ${item.variable} 的範圍，使 \\(P\\) 落在三角形 \\(ABC\\) 的內部。`,
      short: `\\(0<${item.variable}<${formatFraction(item.upper[0], item.upper[1])}\\)`,
      process: `若 \\(\\vec{AP}=x\\vec{AB}+y\\vec{AC}\\)，點 \\(P\\) 在三角形內部的條件為 \\(x>0\\)、\\(y>0\\)、\\(x+y<1\\)。本題 \\(x=${formatFraction(item.fixed[0], item.fixed[1])}\\)，所以 \\(0<${item.variable}<${formatFraction(item.upper[0], item.upper[1])}\\)。`,
    })));
  }

  function buildS331AreaRatioCoefficientCleanSet(count) {
    const cases = [
      { x: [1, 5], y: [2, 5] },
      { x: [1, 3], y: [1, 4] },
      { x: [2, 7], y: [3, 7] },
      { x: [3, 8], y: [1, 2] },
    ];
    return s32CleanSet(count, cases.map((item) => () => ({
      q: `設 \\(P\\) 滿足 \\(\\vec{AP}=${formatFraction(item.x[0], item.x[1])}\\vec{AB}+${formatFraction(item.y[0], item.y[1])}\\vec{AC}\\)。求 \\(\\frac{[ABP]}{[ABC]}\\)。`,
      short: `\\(${formatFraction(item.y[0], item.y[1])}\\)`,
      process: `以 \\(AB\\) 為共同底邊時，高度只看 \\(\\vec{AC}\\) 方向的係數。因 \\(P\\) 的 \\(\\vec{AC}\\) 係數為 \\(${formatFraction(item.y[0], item.y[1])}\\)，所以 \\([ABP]/[ABC]=${formatFraction(item.y[0], item.y[1])}\\)。`,
    })));
  }

  function buildS331SegmentSectionCleanSet(count) {
    const cases = [
      { m: 2, n: 3 },
      { m: 3, n: 2 },
      { m: 1, n: 4 },
      { m: 4, n: 5 },
    ];
    return s32CleanSet(count, cases.map((item) => {
      const total = item.m + item.n;
      return () => ({
        q: `在三角形 \\(ABC\\) 中，點 \\(D\\) 在 \\(BC\\) 上且 \\(BD:DC=${item.m}:${item.n}\\)。若 \\(\\vec{AD}=x\\vec{AB}+y\\vec{AC}\\)，求 \\((x,y)\\)。`,
        short: `\\((${formatFraction(item.n, total)},${formatFraction(item.m, total)})\\)`,
        process: `內分點公式給 \\(\\vec{AD}=\\frac{${item.n}}{${total}}\\vec{AB}+\\frac{${item.m}}{${total}}\\vec{AC}\\)，所以 \\((x,y)=(${formatFraction(item.n, total)},${formatFraction(item.m, total)})\\)。`,
      });
    }));
  }

  function buildS332ProjectionEqualityCleanSet(count) {
    const cases = [
      { u: [2, 1], v: [5, 3], p: 4 },
      { u: [3, 2], v: [1, 5], p: 2 },
      { u: [1, -2], v: [6, 1], p: 4 },
      { u: [4, -1], v: [2, 3], p: 1 },
    ];
    return s32CleanSet(count, cases.map((item) => {
      const target = item.v[0] * item.u[0] + item.v[1] * item.u[1];
      const t = formatFraction(target - item.p * item.u[0], item.u[1]);
      return () => ({
        q: `已知方向向量 \\(\\vec{u}=${s33Vector(item.u[0], item.u[1])}\\)。若 \\(\\vec{v}=${s33Vector(item.v[0], item.v[1])}\\) 與 \\(\\vec{w}=(${item.p},t)\\) 在 \\(\\vec{u}\\) 方向上的正射影長度相等，求 \\(t\\)。`,
        short: `\\(t=${t}\\)`,
        process: `同方向正射影長度相等，等價於內積相等：\\(\\vec{v}\\cdot\\vec{u}=\\vec{w}\\cdot\\vec{u}\\)。所以 \\(${target}=${item.p * item.u[0]}+${item.u[1]}t\\)，得 \\(t=${t}\\)。`,
      });
    }));
  }

  function buildS332ParametricMinLengthCleanSet(count) {
    const cases = [
      { a: [-7, -9], b: [3, 1] },
      { a: [5, -1], b: [1, 2] },
      { a: [-2, 6], b: [2, -1] },
      { a: [4, 7], b: [2, 1] },
    ];
    return s32CleanSet(count, cases.map((item) => {
      const dot = item.a[0] * item.b[0] + item.a[1] * item.b[1];
      const norm = item.b[0] ** 2 + item.b[1] ** 2;
      const t = formatFraction(-dot, norm);
      return () => ({
        q: `令 \\(\\vec{v}=${s33Vector(item.a[0], item.a[1])}+t${s33Vector(item.b[0], item.b[1])}\\)。求使 \\(|\\vec{v}|\\) 最小的 \\(t\\)。`,
        short: `\\(t=${t}\\)`,
        process: `\\(|\\vec a+t\\vec b|\\) 最小時，\\(\\vec a+t\\vec b\\) 與 \\(\\vec b\\) 垂直，所以 \\((\\vec a+t\\vec b)\\cdot\\vec b=0\\)。也就是 \\(${dot}+${norm}t=0\\)，得 \\(t=${t}\\)。`,
      });
    }));
  }

  function buildS332RegionAreaCleanSet(count) {
    const cases = [
      { b: [4, 3], c: [2, -1], xw: 2, yw: 3 },
      { b: [2, 1], c: [1, 2], xw: 3, yw: 2 },
      { b: [5, -2], c: [1, 4], xw: 2, yw: 2 },
      { b: [3, 1], c: [-1, 2], xw: 4, yw: 1 },
    ];
    return s32CleanSet(count, cases.map((item) => {
      const det = Math.abs(s33Det(item.b[0], item.b[1], item.c[0], item.c[1]));
      const area = det * item.xw * item.yw;
      return () => ({
        q: `已知 \\(\\vec{AB}=${s33Vector(item.b[0], item.b[1])}\\)、\\(\\vec{AC}=${s33Vector(item.c[0], item.c[1])}\\)。若 \\(\\vec{AP}=x\\vec{AB}+y\\vec{AC}\\)，且 \\(0\\le x\\le ${item.xw}\\)、\\(0\\le y\\le ${item.yw}\\)，求所有 \\(P\\) 形成區域的面積。`,
        short: `\\(${area}\\)`,
        process: `係數平面的矩形面積為 \\(${item.xw}\\cdot${item.yw}\\)。基本平行四邊形面積為 \\(|\\det|=${det}\\)，所以實際面積為 \\(${det}\\cdot${item.xw}\\cdot${item.yw}=${area}\\)。`,
      });
    }));
  }

  function buildS333TriangleSideDotCleanSet(count) {
    const cases = [
      { ab: 5, ac: 8, bc: 7 },
      { ab: 4, ac: 3, bc: 5 },
      { ab: 6, ac: 7, bc: 5 },
      { ab: 5, ac: 5, bc: 6 },
    ];
    return s32CleanSet(count, cases.map((item) => {
      const abac = (item.ab ** 2 + item.ac ** 2 - item.bc ** 2) / 2;
      return () => ({
        q: `在三角形 \\(ABC\\) 中，\\(AB=${item.ab}\\)、\\(AC=${item.ac}\\)、\\(BC=${item.bc}\\)。求 \\(\\vec{AB}\\cdot\\vec{CA}\\)。`,
        short: `\\(${-abac}\\)`,
        process: `由餘弦定理得 \\(\\vec{AB}\\cdot\\vec{AC}=\\frac{AB^2+AC^2-BC^2}{2}=${abac}\\)。又 \\(\\vec{CA}=-\\vec{AC}\\)，所以 \\(\\vec{AB}\\cdot\\vec{CA}=${-abac}\\)。`,
      });
    }));
  }

  function buildS333ProjectionVectorCleanSet(count) {
    const cases = [
      { a: [3, 4], b: [1, 2] },
      { a: [5, 1], b: [2, -1] },
      { a: [-1, 7], b: [3, 1] },
      { a: [4, -2], b: [1, -1] },
    ];
    return s32CleanSet(count, cases.map((item) => {
      const dot = item.a[0] * item.b[0] + item.a[1] * item.b[1];
      const norm = item.b[0] ** 2 + item.b[1] ** 2;
      const x = formatFraction(dot * item.b[0], norm);
      const y = formatFraction(dot * item.b[1], norm);
      return () => ({
        q: `求 \\(\\vec{a}=${s33Vector(item.a[0], item.a[1])}\\) 在 \\(\\vec{b}=${s33Vector(item.b[0], item.b[1])}\\) 上的正射影向量。`,
        short: `\\((${x},${y})\\)`,
        process: `正射影向量為 \\(\\frac{\\vec a\\cdot\\vec b}{|\\vec b|^2}\\vec b\\)。本題 \\(\\vec a\\cdot\\vec b=${dot}\\)，\\(|\\vec b|^2=${norm}\\)，所以正射影為 \\((${x},${y})\\)。`,
      });
    }));
  }

  function buildS333NormRelationAngleCleanSet(count) {
    const cases = [
      { a: 1, b: 2, k: 2, r2: 13 },
      { a: 2, b: 3, k: 1, r2: 7 },
      { a: 3, b: 4, k: 1, r2: 37 },
      { a: 2, b: 5, k: 1, r2: 19 },
    ];
    return s32CleanSet(count, cases.map((item) => {
      const num = item.r2 - item.a ** 2 - item.k ** 2 * item.b ** 2;
      const den = 2 * item.k * item.a * item.b;
      return () => ({
        q: `已知 \\(|\\vec a|=${item.a}\\)、\\(|\\vec b|=${item.b}\\)、\\(|\\vec a+${item.k}\\vec b|=\\sqrt{${item.r2}}\\)。求 \\(\\cos\\theta\\)，其中 \\(\\theta\\) 為 \\(\\vec a\\) 與 \\(\\vec b\\) 的夾角。`,
        short: `\\(${formatFraction(num, den)}\\)`,
        process: `平方展開：\\(|\\vec a+${item.k}\\vec b|^2=|\\vec a|^2+${item.k ** 2}|\\vec b|^2+2\\cdot${item.k}|\\vec a||\\vec b|\\cos\\theta\\)。代入得 \\(\\cos\\theta=${formatFraction(num, den)}\\)。`,
      });
    }));
  }

  function buildS334DeterminantOperationCleanSet(count) {
    const cases = [
      { d: 5, desc: '第一列乘以 3', ans: 15 },
      { d: -4, desc: '第二列加上第一列的 2 倍', ans: -4 },
      { d: 6, desc: '交換兩行', ans: -6 },
      { d: 7, desc: '兩列都乘以 4', ans: 112 },
    ];
    return s32CleanSet(count, cases.map((item) => () => ({
      q: `已知二階行列式 \\(D=\\begin{vmatrix}a&b\\\\c&d\\end{vmatrix}=${item.d}\\)。若對行列式做「${item.desc}」，新行列式值是多少？`,
      short: `\\(${item.ans}\\)`,
      process: `行列式性質：單一列乘以 \\(k\\) 時行列式乘以 \\(k\\)；某列加上另一列倍數時值不變；交換兩行會變號；兩列都乘以 \\(k\\) 時會乘以 \\(k^2\\)。所以本題新值為 \\(${item.ans}\\)。`,
    })));
  }

  function buildS334CramerParameterCleanSet(count) {
    const cases = [
      { a: 2, b: 3, c: 5, lambda: 2 },
      { a: 1, b: -4, c: 3, lambda: -3 },
      { a: 3, b: 2, c: 7, lambda: 4 },
      { a: -2, b: 5, c: 1, lambda: 3 },
    ];
    return s32CleanSet(count, cases.map((item) => {
      const target = item.lambda * item.c;
      return () => ({
        q: `討論方程組 \\(\\begin{cases}${item.a}x+${item.b}y=${item.c}\\\\${item.lambda * item.a}x+${item.lambda * item.b}y=k\\end{cases}\\)。求 \\(k\\) 為何時有無限多解；為何時無解。`,
        short: `\\(k=${target}\\) 時無限多解；\\(k\\ne ${target}\\) 時無解`,
        process: `第二式左邊是第一式左邊的 \\(${item.lambda}\\) 倍。若右邊也同倍，兩式代表同一直線，有無限多解；所以 \\(k=${target}\\)。若 \\(k\\ne${target}\\)，兩式平行不同線，無解。`,
      });
    }));
  }

  function buildS334AreaScaleCleanSet(count) {
    const cases = [
      { matrix: [2, 1, 1, 3], area: 6 },
      { matrix: [1, -2, 3, 1], area: 4 },
      { matrix: [3, 0, 2, 2], area: 5 },
      { matrix: [2, -1, -1, 2], area: 8 },
    ];
    return s32CleanSet(count, cases.map((item) => {
      const [a, b, c, d] = item.matrix;
      const det = Math.abs(s33Det(a, b, c, d));
      return () => ({
        q: `平面圖形面積為 \\(${item.area}\\)。經線性變換 \\(T(x,y)=(${a}x+${b}y,${c}x+${d}y)\\) 後，面積變為多少？`,
        short: `\\(${det * item.area}\\)`,
        process: `線性變換的面積倍率為 \\(|\\det\\begin{pmatrix}${a}&${b}\\\\${c}&${d}\\end{pmatrix}|=${det}\\)。所以新面積為 \\(${item.area}\\cdot${det}=${det * item.area}\\)。`,
      });
    }));
  }

  function s331Gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x || 1;
  }

  function s331Frac(num, den) {
    if (den === 0) return '未定義';
    let n = num;
    let d = den;
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = s331Gcd(n, d);
    n /= g;
    d /= g;
    if (d === 1) return String(n);
    return '\\frac{' + n + '}{' + d + '}';
  }

  function s331LenText(x, y) {
    const n = x * x + y * y;
    const root = Math.sqrt(n);
    if (Number.isInteger(root)) return String(root);
    let outside = 1;
    let inside = n;
    for (let k = Math.floor(root); k >= 2; k -= 1) {
      if (n % (k * k) === 0) {
        outside = k;
        inside = n / (k * k);
        break;
      }
    }
    if (outside === 1) return '\\sqrt{' + inside + '}';
    return outside + '\\sqrt{' + inside + '}';
  }

  function s331Det(ax, ay, bx, by) {
    return ax * by - ay * bx;
  }

  function s331Coeff(num, den) {
    const text = s331Frac(num, den);
    return text === '1' ? '' : text;
  }

  function s331UvExpression(uCoeff, vCoeff) {
    const uPart = (uCoeff === 1 ? '' : String(uCoeff)) + 'u';
    const sign = vCoeff < 0 ? '-' : '+';
    const absV = Math.abs(vCoeff);
    const vPart = (absV === 1 ? '' : String(absV)) + 'v';
    return uPart + sign + vPart;
  }

  function s331CoprimePair(max = 5) {
    let a = 1;
    let b = 1;
    do {
      a = randInt(1, max);
      b = randInt(1, max);
    } while (s331Gcd(a, b) !== 1);
    return [a, b];
  }

  function s331ReducedRatio3(a, b, c) {
    const g = s331Gcd(s331Gcd(a, b), c);
    return [a / g, b / g, c / g];
  }

  function s331VectorTerm(coef, vectorTex) {
    return (coef === 1 ? '' : String(coef)) + vectorTex;
  }

  function s331VectorLinearTerms(terms) {
    return terms
      .filter((term) => term.num !== 0)
      .map((term, index) => {
        const sign = term.num < 0 ? '-' : index === 0 ? '' : '+';
        const coeff = s331Coeff(Math.abs(term.num), term.den || 1);
        return sign + coeff + term.symbol;
      })
      .join('');
  }

  function buildS331CoordinateLengthSet(count) {
    const builders = [
      () => {
        const u = [randInt(-4, 5), randInt(-5, 4)];
        const v = [randInt(-5, 4), randInt(-4, 5)];
        const p = s324Pick([2, 3, -2]);
        const q = s324Pick([2, -1, -3]);
        const ans = [p * u[0] - q * v[0], p * u[1] - q * v[1]];
        const expr = q >= 0 ? p + 'u-' + q + 'v' : p + 'u+' + -q + 'v';
        return s331QA(
          '設向量 ' +
            s331MJ('u=', s331Vec(u[0], u[1]), ',\\ v=', s331Vec(v[0], v[1])) +
            '，求 ' +
            s331M(expr) +
            ' 的坐標表示。',
          s331MJ(s331Vec(ans[0], ans[1])),
          '逐項計算，' + s331MJ(expr, '=', s331Vec(ans[0], ans[1])) + '。'
        );
      },
      () => {
        const ax = randInt(-4, 4);
        const ay = randInt(-4, 4);
        const dx = randInt(-6, 6) || 3;
        const dy = randInt(-6, 6) || -4;
        return s331QA(
          '已知 ' +
            s331Point('A', ax, ay) +
            '、' +
            s331Point('B', ax + dx, ay + dy) +
            '，求向量 ' +
            s331M('\\overrightarrow{AB}') +
            ' 及其長度。',
          s331MJ('\\overrightarrow{AB}=', s331Vec(dx, dy), ',\\ |\\overrightarrow{AB}|=', s331LenText(dx, dy)),
          '用終點減起點，長度為 ' + s331MJ('\\sqrt{', dx * dx, '+', dy * dy, '}=', s331LenText(dx, dy)) + '。'
        );
      },
      () => {
        const a = [randInt(-4, 5), randInt(-4, 5)];
        const b = [randInt(-4, 5), randInt(-4, 5)];
        const x = 2 * a[0] - b[0];
        const y = 2 * a[1] - b[1];
        return s331QA(
          '已知 ' +
            s331MJ('a=', s331Vec(a[0], a[1]), ',\\ b=', s331Vec(b[0], b[1])) +
            '，計算 ' +
            s331M('|2a-b|') +
            '。',
          s331MJ(s331LenText(x, y)),
          '先得 ' + s331MJ('2a-b=', s331Vec(x, y)) + '，再算長度。'
        );
      },
      () => {
        const a = [randInt(-3, 4), randInt(-3, 4)];
        const t = randInt(-3, 3) || 2;
        const b = [a[0] + t, a[1] - 2 * t];
        return s331QA(
          '已知 ' +
            s331MJ('\\overrightarrow{AB}=', s331Vec(t, -2 * t)) +
            ' 且 ' +
            s331Point('A', a[0], a[1]) +
            '，求終點 ' +
            s331M('B') +
            ' 的坐標。',
          s331MJ('B', s331Vec(b[0], b[1])),
          '由 ' + s331M('B=A+\\overrightarrow{AB}') + '，逐項相加即可。'
        );
      },
      () => {
        const u = [randInt(1, 5), randInt(-5, 5)];
        const v = [randInt(-5, 5), randInt(1, 5)];
        const t = -s331Det(u[0], u[1], v[0], v[1]);
        return s331QA(
          '設 ' +
            s331MJ('u=', s331Vec(u[0], u[1]), ',\\ v=', s331Vec(v[0], v[1])) +
            '，求平行四邊形由 ' +
            s331M('u,v') +
            ' 張成的面積。',
          s331MJ(Math.abs(t)),
          '面積為行列式絕對值 ' + s331MJ('|', u[0], '\\cdot', v[1], '-', u[1], '\\cdot', v[0], '|') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331ParallelCollinearSet(count) {
    const builders = [
      () => {
        const a = randInt(1, 5);
        const b = randInt(-5, 5) || 2;
        const k = randInt(-3, 4) || 2;
        return s331QA(
          '設 ' +
            s331MJ('a=', s331Vec(a, b), ',\\ b=', s331Vec(k * a, 't')) +
            '，若 ' +
            s331M('a\\parallel b') +
            '，求實數 ' +
            s331M('t') +
            '。',
          s331MJ('t=', k * b),
          '平行時分量成比例，所以 ' + s331MJ('\\frac{', k * a, '}{', a, '}=\\frac{t}{', b, '}') + '。'
        );
      },
      () => {
        const a = randInt(1, 5);
        const c = randInt(1, 5);
        const x = randInt(-4, 5) || 2;
        const b = (x * c) / a;
        const scaledB = Number.isInteger(b) ? b : x * c;
        const scaledC = Number.isInteger(b) ? c : a * c;
        return s331QA(
          '設 ' +
            s331MJ('u=', s331Vec('x', a), ',\\ v=', s331Vec(scaledB, scaledC)) +
            '，若 ' +
            s331M('u\\parallel v') +
            '，求 ' +
            s331M('x') +
            '。',
          s331MJ('x=', x),
          '平行時 ' + s331M('\\frac{x}{' + scaledB + '}=\\frac{' + a + '}{' + scaledC + '}') + '，交叉相乘即可。'
        );
      },
      () => {
        const ax = randInt(-4, 4);
        const ay = randInt(-4, 4);
        const bx = ax + randInt(2, 6);
        const by = ay + randInt(-3, 4);
        const t = randInt(2, 4);
        const cx = ax + t * (bx - ax);
        const cy = ay + t * (by - ay);
        return s331QA(
          '設 ' +
            s331Point('A', ax, ay) +
            '、' +
            s331Point('B', bx, by) +
            '、' +
            s331Point('C', cx, 'k') +
            ' 三點共線，求 ' +
            s331M('k') +
            '。',
          s331MJ('k=', cy),
          '三點共線等同 ' + s331M('\\overrightarrow{AB}\\parallel\\overrightarrow{AC}') + '，代入行列式為 0。'
        );
      },
      () => {
        const ax = randInt(-3, 3);
        const ay = randInt(-3, 3);
        const dx = randInt(1, 5);
        const dy = randInt(-4, 4) || 2;
        const x = randInt(2, 4);
        return s331QA(
          '已知 ' +
            s331Point('A', ax, ay) +
            '、' +
            s331Point('B', ax + dx, ay + dy) +
            '、' +
            s331Point('C', ax + x * dx, ay + x * dy) +
            ' 共線，判定 ' +
            s331M('\\overrightarrow{AB}') +
            ' 與 ' +
            s331M('\\overrightarrow{AC}') +
            ' 是否平行，並求比例。',
          s331MJ('\\overrightarrow{AC}=', x, '\\overrightarrow{AB}'),
          '因 ' + s331M('C') + ' 是從 ' + s331M('A') + ' 沿同一方向走 ' + x + ' 倍位移，所以兩向量平行。'
        );
      },
      () => {
        const a = [1, 2];
        const b = [-1, 3];
        const t = randInt(-3, 4) || 1;
        const left = [a[0] + t * b[0], a[1] + t * b[1]];
        const right = [2 * a[0] - b[0], 2 * a[1] - b[1]];
        return s331QA(
          '設 ' +
            s331MJ('a=', s331Vec(a[0], a[1]), ',\\ b=', s331Vec(b[0], b[1])) +
            '，若 ' +
            s331MJ('(a+tb)\\parallel(2a-b)') +
            '，求 ' +
            s331M('t') +
            '。',
          s331MJ('t=', t),
          '令兩向量行列式為 0：' +
            s331MJ('\\det(', s331Vec(left[0], left[1]), ',', s331Vec(right[0], right[1]), ')=0') +
            '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331LinearCombinationSet(count) {
    const builders = [
      () => {
        const a = [1, 2];
        const b = [2, 1];
        const x = randInt(-4, 4);
        const y = randInt(-4, 4);
        const c = [x * a[0] + y * b[0], x * a[1] + y * b[1]];
        return s331QA(
          '將向量 ' +
            s331MJ('c=', s331Vec(c[0], c[1])) +
            ' 表為 ' +
            s331MJ('a=', s331Vec(1, 2)) +
            ' 與 ' +
            s331MJ('b=', s331Vec(2, 1)) +
            ' 的線性組合，求 ' +
            s331M('x,y') +
            ' 使 ' +
            s331M('c=xa+yb') +
            '。',
          s331MJ('x=', x, ',\\ y=', y),
          '比較兩個坐標分量並解二元一次聯立方程式。'
        );
      },
      () => {
        const x = randInt(-3, 4);
        const y = randInt(-3, 4);
        return s331QA(
          '設 ' +
            s331M('u,v') +
            ' 不平行，若 ' +
            s331MJ('(', x - y + 2, ')u+(', x + y - 4, ')v=0') +
            '，求數對 ' +
            s331M('(x,y)') +
            '。',
          s331MJ('(x,y)=', s331Vec(x, y)),
          '因 ' + s331M('u,v') + ' 不平行，兩個係數都必須為 0。'
        );
      },
      () => {
        const ab = [randInt(1, 5), randInt(-4, 4)];
        const ad = [randInt(-4, 4), randInt(1, 5)];
        return s331QA(
          '在平行四邊形 ' +
            s331M('ABCD') +
            ' 中，已知 ' +
            s331MJ('\\overrightarrow{AB}=', s331Vec(ab[0], ab[1]), ',\\ \\overrightarrow{AD}=', s331Vec(ad[0], ad[1])) +
            '，求對角線向量 ' +
            s331M('\\overrightarrow{AC}') +
            '。',
          s331MJ('\\overrightarrow{AC}=', s331Vec(ab[0] + ad[0], ab[1] + ad[1])),
          '平行四邊形對角線為 ' + s331M('\\overrightarrow{AB}+\\overrightarrow{AD}') + '。'
        );
      },
      () => {
        const oa = [2, 1];
        const ob = [1, 2];
        const x = randInt(-3, 4);
        const y = randInt(-3, 4);
        const op = [2 * x + y, x + 2 * y];
        return s331QA(
          '給定 ' +
            s331MJ('\\overrightarrow{OA}=', s331Vec(2, 1), ',\\ \\overrightarrow{OB}=', s331Vec(1, 2)) +
            '，若 ' +
            s331MJ('\\overrightarrow{OP}=', s331Vec(op[0], op[1])) +
            '，求 ' +
            s331M('\\overrightarrow{OP}=x\\overrightarrow{OA}+y\\overrightarrow{OB}') +
            ' 中的係數。',
          s331MJ('x=', x, ',\\ y=', y),
          '把右式展開成坐標後比較兩分量。'
        );
      },
      () => {
        const a = [1, -3];
        const b = [2, 1];
        const x = randInt(-3, 4);
        const y = randInt(-3, 4);
        const c = [x * a[0] + y * b[0], x * a[1] + y * b[1]];
        return s331QA(
          '若 ' +
            s331MJ('a=', s331Vec(1, -3), ',\\ b=', s331Vec(2, 1), ',\\ c=', s331Vec(c[0], c[1])) +
            ' 且 ' +
            s331M('c=xa+yb') +
            '，求 ' +
            s331M('x,y') +
            '。',
          s331MJ('x=', x, ',\\ y=', y),
          '由 ' + s331M('xa+yb') + ' 的兩個坐標分量建立聯立方程式。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331SectionRatioSet(count) {
    const builders = [
      () =>
        s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，' +
            s331M('D') +
            ' 為 ' +
            s331M('BC') +
            ' 中點，若 ' +
            s331MJ('\\overrightarrow{AD}=x\\overrightarrow{AB}+y\\overrightarrow{AC}') +
            '，求 ' +
            s331M('x,y') +
            '。',
          s331MJ('x=y=\\frac12'),
          '中點表示從 ' +
            s331M('B,C') +
            ' 各取一半，所以 ' +
            s331M('\\overrightarrow{AD}=\\frac12\\overrightarrow{AB}+\\frac12\\overrightarrow{AC}') +
            '。'
        ),
      () => {
        const m = randInt(1, 4);
        const n = randInt(1, 4);
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，點 ' +
            s331M('D') +
            ' 在 ' +
            s331M('BC') +
            ' 上且 ' +
            s331MJ('BD:DC=', m, ':', n) +
            '。若 ' +
            s331MJ('\\overrightarrow{AD}=x\\overrightarrow{AB}+y\\overrightarrow{AC}') +
            '，求 ' +
            s331M('x,y') +
            '。',
          s331MJ('x=', s331Frac(n, m + n), ',\\ y=', s331Frac(m, m + n)),
          '內分點公式給 ' +
            s331M('\\overrightarrow{AD}=\\frac{DC}{BD+DC}\\overrightarrow{AB}+\\frac{BD}{BD+DC}\\overrightarrow{AC}') +
            '。'
        );
      },
      () =>
        s331QA(
          '設 ' +
            s331M('G') +
            ' 為 ' +
            s331M('\\triangle ABC') +
            ' 的重心，求 ' +
            s331M('\\overrightarrow{AG}') +
            ' 以 ' +
            s331M('\\overrightarrow{AB},\\overrightarrow{AC}') +
            ' 表示。',
          s331MJ('\\overrightarrow{AG}=\\frac13\\overrightarrow{AB}+\\frac13\\overrightarrow{AC}'),
          '重心坐標是三頂點平均，從 ' + s331M('A') + ' 看即取兩邊向量各三分之一。'
        ),
      () => {
        const m = randInt(1, 4);
        const n = randInt(1, 4);
        return s331QA(
          '平行四邊形 ' +
            s331M('ABCD') +
            ' 中，點 ' +
            s331M('E') +
            ' 在 ' +
            s331M('CD') +
            ' 上且 ' +
            s331MJ('CE:ED=', m, ':', n) +
            '。以邊向量表示 ' +
            s331M('\\overrightarrow{AE}') +
            '。',
          s331MJ('\\overrightarrow{AE}=\\overrightarrow{AD}+', s331Frac(m, m + n), '\\overrightarrow{AB}'),
          '由 ' +
            s331M('CD\\parallel AB') +
            '，且 ' +
            s331M('CE') +
            ' 佔 ' +
            s331MJ('\\frac{', m, '}{', m + n, '}') +
            ' 條 ' +
            s331M('CD') +
            '。'
        );
      },
      () => {
        const p = randInt(1, 4);
        const q = randInt(1, 4);
        return s331QA(
          '已知 ' +
            s331MJ('\\overrightarrow{AP}=\\frac{', q, '}{', p + q, '}\\overrightarrow{AB}') +
            '，求 ' +
            s331M('AP:PB') +
            '。',
          s331MJ('AP:PB=', q, ':', p),
          '若 ' +
            s331M('AP') +
            ' 佔全長的 ' +
            s331MJ('\\frac{', q, '}{', p + q, '}') +
            '，剩下為 ' +
            s331MJ('\\frac{', p, '}{', p + q, '}') +
            '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331UnitDirectionSet(count) {
    const builders = [
      () => {
        const v = s324Pick([
          [3, 4],
          [5, 12],
          [8, 6],
          [-3, 4],
          [4, -3],
        ]);
        const len = s331LenText(v[0], v[1]);
        return s331QA(
          '求向量 ' + s331MJ('a=', s331Vec(v[0], v[1])) + ' 同方向的單位向量。',
          s331MJ(
            s331Vec(
              s331Frac(v[0], Number(len) || v[0] * v[0] + v[1] * v[1]),
              s331Frac(v[1], Number(len) || v[0] * v[0] + v[1] * v[1])
            )
          ),
          '單位向量為 ' + s331M('\\frac{a}{|a|}') + '，此題 ' + s331M('|a|=' + len) + '。'
        );
      },
      () => {
        const data = s324Pick([
          { angle: 30, c: '\\frac{\\sqrt3}{2}', s: '\\frac12' },
          { angle: 45, c: '\\frac{\\sqrt2}{2}', s: '\\frac{\\sqrt2}{2}' },
          { angle: 60, c: '\\frac12', s: '\\frac{\\sqrt3}{2}' },
          { angle: 120, c: '-\\frac12', s: '\\frac{\\sqrt3}{2}' },
        ]);
        const r = s324Pick([4, 6, 8, 10]);
        return s331QA(
          '已知向量長度為 ' + r + '，方向角為 ' + data.angle + '°，求其坐標表示。',
          s331MJ(r, '(', data.c, ',', data.s, ')'),
          '向量坐標為 ' + s331M('r(\\cos\\theta,\\sin\\theta)') + '。'
        );
      },
      () => {
        const v = s324Pick([
          [3, 4],
          [5, 12],
          [8, 6],
        ]);
        const k = s324Pick([2, 3]);
        return s331QA(
          '已知 ' +
            s331MJ('a=', s331Vec(v[0], v[1])) +
            '，求與 ' +
            s331M('a') +
            ' 反方向且長度為 ' +
            k * Number(s331LenText(v[0], v[1])) +
            ' 的向量。',
          s331MJ(s331Vec(-k * v[0], -k * v[1])),
          '先取反方向，再把單位比例放大 ' + k + ' 倍。'
        );
      },
      () => {
        const data = s324Pick([
          { v: [3, 4], r: 5 },
          { v: [-3, 4], r: 5 },
          { v: [5, -12], r: 13 },
        ]);
        return s331QA(
          '將向量 ' +
            s331MJ('v=', s331Vec(data.v[0], data.v[1])) +
            ' 表示成 ' +
            s331M('r(\\cos\\theta,\\sin\\theta)') +
            ' 的型式。',
          s331MJ(data.r, '(', s331Frac(data.v[0], data.r), ',', s331Frac(data.v[1], data.r), ')'),
          '長度為 ' + data.r + '，所以方向餘弦與方向正弦分別為坐標除以長度。'
        );
      },
      () => {
        const speed = s324Pick([20, 30, 40]);
        const data = s324Pick([
          { angle: 30, x: '\\frac{\\sqrt3}{2}', y: '\\frac12' },
          { angle: 60, x: '\\frac12', y: '\\frac{\\sqrt3}{2}' },
        ]);
        return s331QA(
          '一球以速率 ' + speed + '、仰角 ' + data.angle + '° 投出，求初速度向量的水平與鉛直分量。',
          s331MJ(s331Vec(speed + data.x, speed + data.y)),
          '速度分量為 ' + s331M('(v\\cos\\theta,v\\sin\\theta)') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331PolygonVectorCountSet(count) {
    const builders = [
      () => {
        const n = randInt(5, 10);
        return s331QA(
          '已知正 ' + n + ' 邊形的 ' + n + ' 個頂點，任取兩點為始點與終點，共可決定多少個相異的非零有向量？',
          s331MJ(n * (n - 1), '\\text{ 個}'),
          '有向量要分始點與終點，始點有 ' + n + ' 種，終點不能相同有 ' + (n - 1) + ' 種。'
        );
      },
      () => {
        const n = randInt(4, 9);
        return s331QA(
          '在一邊長為 1 的正 ' + n + ' 邊形中，以頂點為始點與終點，且向量長度等於 1 的相異向量共有幾個？',
          s331MJ(2 * n, '\\text{ 個}'),
          '每條邊可形成兩個方向的單位邊向量，共 ' + n + ' 條邊。'
        );
      },
      () =>
        s331QA(
          '已知正方形 ' + s331M('ABCD') + ' 的四個頂點及中心點 ' + s331M('O') + '，這五個點共可決定多少個非零有向量？',
          s331MJ('20\\text{ 個}'),
          '五點中任選始點與不同終點，數量為 ' + s331M('5\\times4=20') + '。'
        ),
      () => {
        const n = s324Pick([6, 8, 10, 12]);
        return s331QA(
          '在正 ' + n + ' 邊形中，若只考慮長度最長的對角線向量，共有多少個非零有向量？',
          s331MJ(n, '\\text{ 個}'),
          '偶數邊形最長對角線連到對頂點，每個頂點恰有一個對頂點，因此有 ' + n + ' 個有向量。'
        );
      },
      () => {
        const m = randInt(2, 4);
        const n = randInt(2, 4);
        return s331QA(
          '一個由 ' +
            m +
            ' 列、' +
            n +
            ' 行正六邊形組成的網格，若每個小六邊形的每一邊都代表一個方向向量，問未合併前共有多少個邊向量？',
          s331MJ(6 * m * n, '\\text{ 個}'),
          '每個正六邊形有 6 條邊，各自代表一個方向向量，共 ' + s331M('6mn') + ' 個。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331VectorChainSet(count) {
    const builders = [
      () =>
        s331QA(
          '化簡向量式：' +
            s331M('\\overrightarrow{AB}+\\overrightarrow{BC}+\\overrightarrow{CD}+\\overrightarrow{DA}') +
            '。',
          s331M('\\vec{0}'),
          '首尾相接繞回原點，總位移為零向量。'
        ),
      () =>
        s331QA(
          '用單一向量表示：' + s331M('\\overrightarrow{PT}+\\overrightarrow{TS}+\\overrightarrow{SQ}') + '。',
          s331M('\\overrightarrow{PQ}'),
          '前兩項合成 ' +
            s331M('\\overrightarrow{PS}') +
            '，再加 ' +
            s331M('\\overrightarrow{SQ}') +
            ' 得 ' +
            s331M('\\overrightarrow{PQ}') +
            '。'
        ),
      () =>
        s331QA(
          '化簡：' + s331M('\\overrightarrow{AC}+\\overrightarrow{CE}+\\overrightarrow{EB}') + '。',
          s331M('\\overrightarrow{AB}'),
          '依序從 A 走到 C、E、B，總位移就是 ' + s331M('\\overrightarrow{AB}') + '。'
        ),
      () =>
        s331QA(
          '給定任意四點 ' +
            s331M('P,Q,R,S') +
            '，化簡 ' +
            s331M('\\overrightarrow{PT}-\\overrightarrow{QT}+\\overrightarrow{SR}-\\overrightarrow{SQ}') +
            '。',
          s331M('\\overrightarrow{PR}'),
          '因 ' +
            s331M('\\overrightarrow{PT}-\\overrightarrow{QT}=\\overrightarrow{PQ}') +
            '，且 ' +
            s331M('\\overrightarrow{SR}-\\overrightarrow{SQ}=\\overrightarrow{QR}') +
            '。'
        ),
      () =>
        s331QA(
          '在五邊形 ' +
            s331M('ABCDE') +
            ' 中，化簡 ' +
            s331M('\\overrightarrow{AC}-\\overrightarrow{AD}+\\overrightarrow{DE}') +
            '。',
          s331M('\\overrightarrow{CE}'),
          '先把 ' +
            s331M('-\\overrightarrow{AD}') +
            ' 改為 ' +
            s331M('\\overrightarrow{DA}') +
            '，則路徑為 C 到 E 的位移。'
        ),
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331VectorEquationSet(count) {
    const builders = [
      () => {
        const a = [5, 0];
        const b = [0, 5];
        return s331QA(
          '已知 ' + s331M('3a-4(2b-x)+7x=2(a+3x)') + '，試以 ' + s331M('a,b') + ' 表示向量 ' + s331M('x') + '。',
          s331M('x=\\frac{-a+8b}{5}'),
          '展開後得 ' + s331M('3a-8b+11x=2a+6x') + '，所以 ' + s331M('5x=-a+8b') + '。'
        );
      },
      () => {
        const u = [randInt(-3, 4), randInt(-3, 4)];
        const v = [randInt(-3, 4), randInt(-3, 4)];
        const p = [u[0] + v[0], u[1] + v[1]];
        const q = [3 * u[0] - 2 * v[0], 3 * u[1] - 2 * v[1]];
        return s331QA(
          '設 ' +
            s331MJ('u+v=', s331Vec(p[0], p[1]), ',\\ 3u-2v=', s331Vec(q[0], q[1])) +
            '，求向量 ' +
            s331M('u,v') +
            '。',
          s331MJ('u=', s331Vec(u[0], u[1]), ',\\ v=', s331Vec(v[0], v[1])),
          '把第一式乘 2 後與第二式相加可得 ' + s331M('5u') + '，再回代求 ' + s331M('v') + '。'
        );
      },
      () => {
        const c = [3 * randInt(-3, 3), 3 * randInt(-3, 3)];
        const v = [Math.floor((2 * c[0]) / 3), Math.floor((2 * c[1]) / 3)];
        return s331QA(
          '若向量 ' +
            s331M('v') +
            ' 滿足 ' +
            s331MJ('5v-2(v+', s331Vec(c[0], c[1]), ')=0') +
            '，求 ' +
            s331M('v') +
            ' 的坐標表示。',
          s331MJ('v=', s331Vec(v[0], v[1])),
          '展開得 ' + s331M('3v=2c') + '，所以 ' + s331M('v=\\frac23c') + '。'
        );
      },
      () => {
        const x = randInt(-3, 4);
        const y = randInt(-3, 4);
        const p = [x + y, 2 * x - y];
        return s331QA(
          '若 ' +
            s331MJ('x', s331Vec(1, 2), '+y', s331Vec(1, -1), '=', s331Vec(p[0], p[1])) +
            '，求 ' +
            s331M('x,y') +
            '。',
          s331MJ('x=', x, ',\\ y=', y),
          '把向量方程拆成兩個坐標方程。'
        );
      },
      () => {
        const p = [randInt(-4, 4), randInt(-4, 4)];
        const q = [randInt(-4, 4), randInt(-4, 4)];
        const d = [q[0] - p[0], q[1] - p[1]];
        return s331QA(
          '已知點 ' +
            s331Point('P', p[0], p[1]) +
            ' 平移向量 ' +
            s331MJ('v=', s331Vec(d[0], d[1])) +
            ' 後到達 ' +
            s331M('Q') +
            '，求 ' +
            s331M('Q') +
            ' 的坐標。',
          s331MJ('Q', s331Vec(q[0], q[1])),
          '點的平移就是坐標逐項加上位移向量。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331RegionSet(count) {
    const builders = [
      () => {
        const a = [randInt(2, 5), randInt(-3, 3)];
        const b = [randInt(-3, 3), randInt(2, 5)];
        const area = Math.abs(s331Det(a[0], a[1], b[0], b[1]));
        return s331QA(
          '若 ' +
            s331M('0\\le x\\le1,\\ 0\\le y\\le1') +
            '，描述 ' +
            s331M('P=xA+yB') +
            ' 所形成的區域，已知 ' +
            s331MJ('\\overrightarrow{OA}=', s331Vec(a[0], a[1]), ',\\ \\overrightarrow{OB}=', s331Vec(b[0], b[1])) +
            '，並求面積。',
          '平行四邊形，面積 ' + s331MJ(area),
          '兩個係數獨立在 0 到 1 變動，張成平行四邊形，面積為行列式絕對值。'
        );
      },
      () =>
        s331QA(
          '若 ' + s331M('x,y\\ge0') + ' 且 ' + s331M('x+y=1') + '，判定 ' + s331M('P=xA+yB') + ' 的軌跡落在何處。',
          '線段 ' + s331M('AB'),
          '兩係數非負且和為 1，是線段內分點的表示法。'
        ),
      () => {
        const a = [3, 1];
        const b = [1, 4];
        const area = Math.abs(s331Det(a[0], a[1], b[0], b[1])) / 2;
        return s331QA(
          '若 ' +
            s331M('x,y\\ge0') +
            ' 且 ' +
            s331M('x+y\\le1') +
            '，已知 ' +
            s331MJ('\\overrightarrow{OA}=', s331Vec(3, 1), ',\\ \\overrightarrow{OB}=', s331Vec(1, 4)) +
            '，求 ' +
            s331M('P=xA+yB') +
            ' 所在三角形面積。',
          s331MJ(area),
          '此區域為 ' + s331M('\\triangle OAB') + '，面積為平行四邊形面積的一半。'
        );
      },
      () => {
        const a = [2, 1];
        const b = [-1, 3];
        const area = 4 * Math.abs(s331Det(a[0], a[1], b[0], b[1]));
        return s331QA(
          '若 ' +
            s331M('-1\\le x\\le1,\\ -1\\le y\\le1') +
            '，且 ' +
            s331MJ('\\overrightarrow{OA}=', s331Vec(2, 1), ',\\ \\overrightarrow{OB}=', s331Vec(-1, 3)) +
            '，求 ' +
            s331M('P=xA+yB') +
            ' 所形成區域的面積。',
          s331MJ(area),
          '係數區域是邊長 2 與 2 的矩形，因此面積倍率為 4。'
        );
      },
      () => {
        const m = randInt(2, 4);
        const n = randInt(2, 4);
        return s331QA(
          '給予範圍 ' +
            s331MJ('0\\le x\\le', m, ',\\ 1\\le y\\le', n) +
            '，判斷 ' +
            s331M('P=xA+yB') +
            ' 形成的區域形狀。',
          '平移後的平行四邊形',
          '改變 ' + s331M('y') + ' 的起點只會平移區域；兩個係數仍各自在一段區間內變動。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331PhysicsSet(count) {
    const builders = [
      () => {
        const forces = [
          [randInt(-5, 5), randInt(-5, 5)],
          [randInt(-5, 5), randInt(-5, 5)],
          [randInt(-5, 5), randInt(-5, 5)],
          [randInt(-5, 5), randInt(-5, 5)],
        ];
        const sx = forces.reduce((sum, f) => sum + f[0], 0);
        const sy = forces.reduce((sum, f) => sum + f[1], 0);
        return s331QA(
          '點 ' +
            s331M('P') +
            ' 受四個力 ' +
            forces.map((f, i) => s331MJ('F_', i + 1, '=', s331Vec(f[0], f[1]))).join('、') +
            ' 作用。若要保持靜態平衡，需加的外力 ' +
            s331M('F_5') +
            ' 為何？',
          s331MJ('F_5=', s331Vec(-sx, -sy)),
          '平衡時合力為零，所以第五個力是前四力合力的相反向量。'
        );
      },
      () => {
        const f = [randInt(-4, 5), randInt(-4, 5)];
        const p = [randInt(-3, 3), randInt(-3, 3)];
        const q = [p[0] + randInt(1, 5), p[1] + randInt(-4, 4)];
        const d = [q[0] - p[0], q[1] - p[1]];
        const work = f[0] * d[0] + f[1] * d[1];
        return s331QA(
          '一質點受力 ' +
            s331MJ('F=', s331Vec(f[0], f[1])) +
            '，由 ' +
            s331Point('P', p[0], p[1]) +
            ' 移到 ' +
            s331Point('Q', q[0], q[1]) +
            '，求此力所作的功。',
          s331MJ(work),
          '功為力與位移的內積：' + s331MJ('F\\cdot\\overrightarrow{PQ}=', work) + '。'
        );
      },
      () => {
        const boat = [randInt(2, 5), randInt(1, 4)];
        const current = [randInt(-2, 2), randInt(-2, 2)];
        const t = randInt(2, 5);
        return s331QA(
          '船的航行速度向量為 ' +
            s331MJ(s331Vec(boat[0], boat[1])) +
            '，水流速度向量為 ' +
            s331MJ(s331Vec(current[0], current[1])) +
            '。航行 ' +
            t +
            ' 小時後，實際對地位移向量為何？',
          s331MJ(s331Vec(t * (boat[0] + current[0]), t * (boat[1] + current[1]))),
          '先加速度向量，再乘以時間。'
        );
      },
      () => {
        const f1 = [randInt(-5, 5), randInt(-5, 5)];
        const f2 = [randInt(-5, 5), randInt(-5, 5)];
        return s331QA(
          '三力達成平衡，已知其中兩力為 ' +
            s331MJ('F_1=', s331Vec(f1[0], f1[1]), ',\\ F_2=', s331Vec(f2[0], f2[1])) +
            '，求第三力 ' +
            s331M('F_3') +
            '。',
          s331MJ('F_3=', s331Vec(-(f1[0] + f2[0]), -(f1[1] + f2[1]))),
          '三力平衡表示 ' + s331M('F_1+F_2+F_3=0') + '。'
        );
      },
      () => {
        const speed = s324Pick([20, 30, 40]);
        return s331QA(
          '若一球以速率 ' + speed + '、仰角 30° 投出，求其初速度向量的水平與鉛直分量。',
          s331MJ('(', speed, '\\frac{\\sqrt3}{2},', speed, '\\frac12)'),
          '用 ' + s331M('(v\\cos30^\\circ,v\\sin30^\\circ)') + ' 分解速度向量。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331TriangleSectionCenterSet(count) {
    const builders = [
      () => {
        const [m, n] = s331CoprimePair(5);
        const sum = m + n;
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，點 ' +
            s331M('D') +
            ' 在 ' +
            s331M('BC') +
            ' 上，且 ' +
            s331MJ('BD:DC=', m, ':', n) +
            '。若 ' +
            s331MJ('\\overrightarrow{AD}=x\\overrightarrow{AB}+y\\overrightarrow{AC}') +
            '，求 ' +
            s331M('x,y') +
            '。',
          s331MJ('x=', s331Frac(n, sum), ',\\ y=', s331Frac(m, sum)),
          s331M('D') +
            ' 是 ' +
            s331M('BC') +
            ' 的內分點，從 ' +
            s331M('A') +
            ' 看過去，靠近 ' +
            s331M('B') +
            ' 的係數是對邊段 ' +
            s331M('DC') +
            ' 的比例，所以 ' +
            s331MJ(
              '\\overrightarrow{AD}=',
              s331Coeff(n, sum),
              '\\overrightarrow{AB}+',
              s331Coeff(m, sum),
              '\\overrightarrow{AC}'
            ) +
            '。'
        );
      },
      () => {
        const [m, n] = s331CoprimePair(4);
        const sum = m + n;
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，點 ' +
            s331M('E') +
            ' 在 ' +
            s331M('AC') +
            ' 上，且 ' +
            s331MJ('AE:EC=', m, ':', n) +
            '。試以 ' +
            s331M('\\overrightarrow{AB},\\overrightarrow{AC}') +
            ' 表示 ' +
            s331M('\\overrightarrow{BE}') +
            '。',
          s331MJ('\\overrightarrow{BE}=-\\overrightarrow{AB}+', s331Coeff(m, sum), '\\overrightarrow{AC}'),
          '由 ' +
            s331M('\\overrightarrow{BE}=\\overrightarrow{BA}+\\overrightarrow{AE}') +
            '，且 ' +
            s331MJ('\\overrightarrow{AE}=', s331Coeff(m, sum), '\\overrightarrow{AC}') +
            '，合併即可。'
        );
      },
      () =>
        s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，' +
            s331M('M,N') +
            ' 分別為 ' +
            s331M('AB,AC') +
            ' 的中點。試以單一向量表示 ' +
            s331M('\\overrightarrow{MN}') +
            '。',
          s331MJ('\\overrightarrow{MN}=\\frac12\\overrightarrow{BC}'),
          '中點連線平行第三邊且長度為一半，所以方向同 ' +
            s331M('\\overrightarrow{BC}') +
            '，係數為 ' +
            s331M('\\frac12') +
            '。'
        ),
      () =>
        s331QA(
          '設 ' +
            s331M('G') +
            ' 為 ' +
            s331M('\\triangle ABC') +
            ' 的重心。試以 ' +
            s331M('\\overrightarrow{AB},\\overrightarrow{AC}') +
            ' 表示 ' +
            s331M('\\overrightarrow{AG}') +
            '。',
          s331MJ('\\overrightarrow{AG}=\\frac13\\overrightarrow{AB}+\\frac13\\overrightarrow{AC}'),
          '重心在三條中線交點，從頂點 ' + s331M('A') + ' 出發等於把兩邊向量各取三分之一。'
        ),
      () => {
        const k = randInt(2, 5);
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，點 ' +
            s331M('D') +
            ' 在 ' +
            s331M('BC') +
            ' 上，且 ' +
            s331MJ(
              '\\overrightarrow{AD}=\\frac{1}{',
              k,
              '}\\overrightarrow{AB}+\\frac{',
              k - 1,
              '}{',
              k,
              '}\\overrightarrow{AC}'
            ) +
            '。求 ' +
            s331M('BD:DC') +
            '。',
          s331MJ('BD:DC=', k - 1, ':1'),
          '內分點表示中，' +
            s331M('\\overrightarrow{AC}') +
            ' 的係數對應 ' +
            s331M('BD') +
            ' 所占比例，因此 ' +
            s331MJ('BD:DC=', k - 1, ':1') +
            '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331AreaRatioVectorSet(count) {
    const builders = [
      () => {
        const ratio = s331ReducedRatio3(randInt(1, 5), randInt(1, 5), randInt(1, 5));
        const [p, q, r] = ratio;
        const relation =
          s331VectorTerm(p, '\\overrightarrow{PA}') +
          '+' +
          s331VectorTerm(q, '\\overrightarrow{PB}') +
          '+' +
          s331VectorTerm(r, '\\overrightarrow{PC}') +
          '=\\vec{0}';
        return s331QA(
          '點 ' +
            s331M('P') +
            ' 在 ' +
            s331M('\\triangle ABC') +
            ' 內，且 ' +
            s331MJ(relation) +
            '。求 ' +
            s331M('[PBC]:[PCA]:[PAB]') +
            '。',
          s331MJ(p, ':', q, ':', r),
          '三個係數可視為重心式的權重；對應到對邊三角形面積，所以面積比為係數比。'
        );
      },
      () => {
        const [m, n] = s331CoprimePair(5);
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，點 ' +
            s331M('D') +
            ' 在 ' +
            s331M('BC') +
            ' 上且 ' +
            s331MJ('BD:DC=', m, ':', n) +
            '。求 ' +
            s331M('[ABD]:[ADC]') +
            '。',
          s331MJ(m, ':', n),
          '兩個三角形同高，面積比等於底邊比 ' + s331M('BD:DC') + '。'
        );
      },
      () => {
        const [m, n] = s331CoprimePair(4);
        const [p, q] = s331CoprimePair(4);
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，' +
            s331M('E') +
            ' 在 ' +
            s331M('AB') +
            ' 上且 ' +
            s331MJ('AE:EB=', m, ':', n) +
            '，' +
            s331M('F') +
            ' 在 ' +
            s331M('AC') +
            ' 上且 ' +
            s331MJ('AF:FC=', p, ':', q) +
            '。求 ' +
            s331M('[AEF]:[ABC]') +
            '。',
          s331MJ(s331Frac(m * p, (m + n) * (p + q))),
          '兩邊從 ' +
            s331M('A') +
            ' 出發的縮放倍率分別為 ' +
            s331MJ(s331Frac(m, m + n), '、', s331Frac(p, p + q)) +
            '，面積倍率為兩倍率相乘。'
        );
      },
      () =>
        s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，' +
            s331M('M') +
            ' 為 ' +
            s331M('BC') +
            ' 中點。求 ' +
            s331M('[ABM]:[ACM]') +
            '。',
          s331MJ('1:1'),
          '兩三角形同高，且底邊 ' + s331M('BM=CM') + '，所以面積相等。'
        ),
      () =>
        s331QA(
          '設 ' + s331M('G') + ' 為 ' + s331M('\\triangle ABC') + ' 的重心。求 ' + s331M('[GAB]:[GBC]:[GCA]') + '。',
          s331MJ('1:1:1'),
          '重心到三邊形成的三個小三角形面積相等，可由三條中線把三角形分成六個等面積小三角形看出。'
        ),
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331QuadrilateralDecompositionSet(count) {
    const builders = [
      () => {
        const [m, n] = s331CoprimePair(5);
        return s331QA(
          '平行四邊形 ' +
            s331M('ABCD') +
            ' 中，點 ' +
            s331M('E') +
            ' 在 ' +
            s331M('CD') +
            ' 上且 ' +
            s331MJ('CE:ED=', m, ':', n) +
            '。試以 ' +
            s331M('\\overrightarrow{AB},\\overrightarrow{AD}') +
            ' 表示 ' +
            s331M('\\overrightarrow{AE}') +
            '。',
          s331MJ('\\overrightarrow{AE}=\\overrightarrow{AD}+', s331Coeff(m, m + n), '\\overrightarrow{AB}'),
          '先走 ' +
            s331M('\\overrightarrow{AD}') +
            ' 到 ' +
            s331M('D') +
            ' 所在水平，再沿 ' +
            s331M('CD') +
            ' 方向走 ' +
            s331M('CE') +
            ' 的比例。'
        );
      },
      () =>
        s331QA(
          '平行四邊形 ' +
            s331M('ABCD') +
            ' 的對角線交於 ' +
            s331M('O') +
            '。試以 ' +
            s331M('\\overrightarrow{AB},\\overrightarrow{AD}') +
            ' 表示 ' +
            s331M('\\overrightarrow{AO}') +
            '。',
          s331MJ('\\overrightarrow{AO}=\\frac12\\overrightarrow{AB}+\\frac12\\overrightarrow{AD}'),
          '平行四邊形對角線互相平分，且 ' +
            s331M('\\overrightarrow{AC}=\\overrightarrow{AB}+\\overrightarrow{AD}') +
            '。'
        ),
      () => {
        const [m, n] = s331CoprimePair(4);
        return s331QA(
          '平行四邊形 ' +
            s331M('ABCD') +
            ' 中，點 ' +
            s331M('P') +
            ' 在對角線 ' +
            s331M('AC') +
            ' 上且 ' +
            s331MJ('AP:PC=', m, ':', n) +
            '。試以 ' +
            s331M('\\overrightarrow{AB},\\overrightarrow{AD}') +
            ' 表示 ' +
            s331M('\\overrightarrow{AP}') +
            '。',
          s331MJ(
            '\\overrightarrow{AP}=',
            s331Coeff(m, m + n),
            '\\overrightarrow{AB}+',
            s331Coeff(m, m + n),
            '\\overrightarrow{AD}'
          ),
          '因 ' +
            s331M('\\overrightarrow{AC}=\\overrightarrow{AB}+\\overrightarrow{AD}') +
            '，而 ' +
            s331M('AP') +
            ' 佔對角線的 ' +
            s331MJ(s331Frac(m, m + n)) +
            '。'
        );
      },
      () =>
        s331QA(
          '菱形 ' +
            s331M('ABCD') +
            ' 中，' +
            s331M('O') +
            ' 為兩對角線交點。化簡 ' +
            s331M('\\overrightarrow{AB}+\\overrightarrow{AD}-2\\overrightarrow{AO}') +
            '。',
          s331M('\\vec{0}'),
          '在平行四邊形或菱形中，' +
            s331M('2\\overrightarrow{AO}=\\overrightarrow{AC}=\\overrightarrow{AB}+\\overrightarrow{AD}') +
            '。'
        ),
      () => {
        const m = randInt(2, 5);
        return s331QA(
          '梯形 ' +
            s331M('ABCD') +
            ' 中，' +
            s331M('AB\\parallel CD') +
            '，且 ' +
            s331M('M,N') +
            ' 分別為兩腰 ' +
            s331M('AD,BC') +
            ' 的中點。若 ' +
            s331M('\\overrightarrow{AB}=u') +
            '、' +
            s331M('\\overrightarrow{DC}=v') +
            '，以 ' +
            s331M('u,v') +
            ' 表示 ' +
            s331M('\\overrightarrow{MN}') +
            '。',
          s331MJ('\\overrightarrow{MN}=\\frac12(u+v)'),
          '梯形中位線方向與兩底平行，向量長度與方向等於兩底向量的平均。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331TriangleCenterRatioSet(count) {
    const builders = [
      () => {
        const [m, n] = s331CoprimePair(5);
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，' +
            s331M('G') +
            ' 為重心，點 ' +
            s331M('P') +
            ' 在 ' +
            s331M('AG') +
            ' 上且 ' +
            s331MJ('AP:PG=', m, ':', n) +
            '。試以 ' +
            s331M('\\overrightarrow{AB},\\overrightarrow{AC}') +
            ' 表示 ' +
            s331M('\\overrightarrow{AP}') +
            '。',
          s331MJ(
            '\\overrightarrow{AP}=',
            s331Coeff(m, 3 * (m + n)),
            '\\overrightarrow{AB}+',
            s331Coeff(m, 3 * (m + n)),
            '\\overrightarrow{AC}'
          ),
          '先用重心性質 ' +
            s331M('\\overrightarrow{AG}=\\frac13\\overrightarrow{AB}+\\frac13\\overrightarrow{AC}') +
            '，再取 ' +
            s331MJ(s331Frac(m, m + n)) +
            ' 倍。'
        );
      },
      () => {
        const [m, n] = s331CoprimePair(5);
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，點 ' +
            s331M('H') +
            ' 在中線 ' +
            s331M('AM') +
            ' 上，且 ' +
            s331MJ('AH:HM=', m, ':', n) +
            '，其中 ' +
            s331M('M') +
            ' 為 ' +
            s331M('BC') +
            ' 中點。試以 ' +
            s331M('\\overrightarrow{AB},\\overrightarrow{AC}') +
            ' 表示 ' +
            s331M('\\overrightarrow{AH}') +
            '。',
          s331MJ(
            '\\overrightarrow{AH}=',
            s331Coeff(m, 2 * (m + n)),
            '\\overrightarrow{AB}+',
            s331Coeff(m, 2 * (m + n)),
            '\\overrightarrow{AC}'
          ),
          '先得 ' +
            s331M('\\overrightarrow{AM}=\\frac12\\overrightarrow{AB}+\\frac12\\overrightarrow{AC}') +
            '，再取中線上的 ' +
            s331MJ(s331Frac(m, m + n)) +
            '。'
        );
      },
      () => {
        const [m, n] = s331CoprimePair(5);
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，點 ' +
            s331M('D') +
            ' 在 ' +
            s331M('BC') +
            ' 上且 ' +
            s331MJ('BD:DC=', m, ':', n) +
            '。若 ' +
            s331M('G') +
            ' 為 ' +
            s331M('\\triangle ABD') +
            ' 的重心，試以 ' +
            s331M('\\overrightarrow{AB},\\overrightarrow{AC}') +
            ' 表示 ' +
            s331M('\\overrightarrow{AG}') +
            '。',
          s331MJ(
            '\\overrightarrow{AG}=',
            s331Coeff(2 * n + m, 3 * (m + n)),
            '\\overrightarrow{AB}+',
            s331Coeff(m, 3 * (m + n)),
            '\\overrightarrow{AC}'
          ),
          '在 ' +
            s331M('\\triangle ABD') +
            ' 中，' +
            s331M('\\overrightarrow{AG}=\\frac13\\overrightarrow{AB}+\\frac13\\overrightarrow{AD}') +
            '，再代入分點向量。'
        );
      },
      () => {
        const [m, n] = s331CoprimePair(5);
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，點 ' +
            s331M('D') +
            ' 在 ' +
            s331M('BC') +
            ' 上且 ' +
            s331MJ('BD:DC=', m, ':', n) +
            '。若 ' +
            s331M('I') +
            ' 在 ' +
            s331M('AD') +
            ' 上且 ' +
            s331MJ('AI:ID=2:1') +
            '，試以 ' +
            s331M('\\overrightarrow{AB},\\overrightarrow{AC}') +
            ' 表示 ' +
            s331M('\\overrightarrow{AI}') +
            '。',
          s331MJ(
            '\\overrightarrow{AI}=',
            s331Coeff(2 * n, 3 * (m + n)),
            '\\overrightarrow{AB}+',
            s331Coeff(2 * m, 3 * (m + n)),
            '\\overrightarrow{AC}'
          ),
          '先用分點公式求 ' + s331M('\\overrightarrow{AD}') + '，再取 ' + s331M('\\frac23\\overrightarrow{AD}') + '。'
        );
      },
      () => {
        const [m, n] = s331CoprimePair(4);
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，點 ' +
            s331M('D') +
            ' 在 ' +
            s331M('BC') +
            ' 上且 ' +
            s331MJ('BD:DC=', m, ':', n) +
            '。若 ' +
            s331M('E') +
            ' 為 ' +
            s331M('AD') +
            ' 中點，求 ' +
            s331M('[ABE]:[ACE]') +
            '。',
          s331MJ(m, ':', n),
          '兩三角形 ' +
            s331M('ABE,ACE') +
            ' 以 ' +
            s331M('E') +
            ' 到 ' +
            s331M('BC') +
            ' 的垂距比例相同，最後仍由 ' +
            s331M('BD:DC') +
            ' 決定面積比。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331TriangleAreaCoefficientAdvancedSet(count) {
    const builders = [
      () => {
        const ratio = s331ReducedRatio3(randInt(1, 5), randInt(1, 5), randInt(1, 5));
        const [p, q, r] = ratio;
        const relation =
          s331VectorTerm(p, '\\overrightarrow{PA}') +
          '+' +
          s331VectorTerm(q, '\\overrightarrow{PB}') +
          '+' +
          s331VectorTerm(r, '\\overrightarrow{PC}') +
          '=\\vec 0';
        return s331QA(
          '點 ' +
            s331M('P') +
            ' 在 ' +
            s331M('\\triangle ABC') +
            ' 內，且 ' +
            s331MJ(relation) +
            '。求 ' +
            s331M('[PAB]:[PBC]:[PCA]') +
            '。',
          s331MJ(r, ':', p, ':', q),
          '係數分別對應對邊小三角形面積：' + s331M('[PBC]:[PCA]:[PAB]=p:q:r') + '，依題目順序改寫即可。'
        );
      },
      () => {
        const area = s324Pick([36, 48, 60, 72]);
        const ratio = s331ReducedRatio3(randInt(1, 5), randInt(1, 5), randInt(1, 5));
        const [p, q, r] = ratio;
        const total = p + q + r;
        const relation =
          s331VectorTerm(p, '\\overrightarrow{PA}') +
          '+' +
          s331VectorTerm(q, '\\overrightarrow{PB}') +
          '+' +
          s331VectorTerm(r, '\\overrightarrow{PC}') +
          '=\\vec 0';
        return s331QA(
          '點 ' +
            s331M('P') +
            ' 在 ' +
            s331M('\\triangle ABC') +
            ' 內，且 ' +
            s331MJ(relation) +
            '。若 ' +
            s331M('[ABC]=' + area) +
            '，求 ' +
            s331M('[PBC]') +
            '。',
          s331MJ(s331Frac(area * p, total)),
          '由面積比 ' + s331MJ('[PBC]:[PCA]:[PAB]=', p, ':', q, ':', r) + '，用總面積按比例分配。'
        );
      },
      () => {
        const [m, n] = s331CoprimePair(5);
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，點 ' +
            s331M('P') +
            ' 滿足 ' +
            s331MJ(
              '\\overrightarrow{AP}=',
              s331Frac(m, m + n),
              '\\overrightarrow{AB}+',
              s331Frac(n, m + n),
              '\\overrightarrow{AC}'
            ) +
            '。判斷 ' +
            s331M('P') +
            ' 是否在 ' +
            s331M('BC') +
            ' 上，並求 ' +
            s331M('BP:PC') +
            '。',
          s331MJ('P\\text{ 在 }BC\\text{ 上， }BP:PC=', n, ':', m),
          '兩個係數皆非負且和為 1，點落在 ' + s331M('BC') + '；係數互看對邊段，得到比例。'
        );
      },
      () => {
        const [m, n] = s331CoprimePair(5);
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，點 ' +
            s331M('P') +
            ' 滿足 ' +
            s331MJ(
              '\\overrightarrow{AP}=',
              s331Frac(m, m + n),
              '\\overrightarrow{AB}-',
              s331Frac(n, m + n),
              '\\overrightarrow{AC}'
            ) +
            '。判斷 ' +
            s331M('P') +
            ' 位於 ' +
            s331M('\\triangle ABC') +
            ' 的內部、邊上或外部。',
          s331M('P\\text{ 在三角形外部}'),
          '三角形內部或邊上需要以兩邊向量表示時係數非負且和不超過 1；此題有負係數，因此在外部。'
        );
      },
      () =>
        s331QA(
          '若點 ' +
            s331M('P') +
            ' 在 ' +
            s331M('\\triangle ABC') +
            ' 內，且 ' +
            s331M('\\overrightarrow{PA}+\\overrightarrow{PB}+\\overrightarrow{PC}=\\vec 0') +
            '，判斷 ' +
            s331M('P') +
            ' 是哪一個心點，並求三個小三角形面積比。',
          s331MJ('P\\text{ 為重心，面積比 }1:1:1'),
          '三個係數相同時，點為重心；重心把三角形分成三個等面積三角形。'
        ),
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331PolygonChainCountGeometrySet(count) {
    const builders = [
      () =>
        s331QA(
          '化簡向量式：' + s331M('\\overrightarrow{AB}+\\overrightarrow{BC}+\\overrightarrow{CD}') + '。',
          s331M('\\overrightarrow{AD}'),
          '首尾相接時，總位移可直接由起點指向終點。'
        ),
      () =>
        s331QA(
          '化簡向量式：' + s331M('\\overrightarrow{AC}-\\overrightarrow{BC}') + '。',
          s331M('\\overrightarrow{AB}'),
          '減去 ' +
            s331M('\\overrightarrow{BC}') +
            ' 等於加上 ' +
            s331M('\\overrightarrow{CB}') +
            '，路徑為 ' +
            s331M('A\\to C\\to B') +
            '。'
        ),
      () => {
        const n = randInt(5, 10);
        return s331QA(
          '正 ' + n + ' 邊形有 ' + n + ' 個頂點。若任取不同兩頂點作為始點與終點，能決定多少個非零有向線段？',
          s331MJ(n * (n - 1), '\\text{ 個}'),
          '先選始點有 ' +
            n +
            ' 種，再選不同終點有 ' +
            (n - 1) +
            ' 種；此處計算的是有向線段，不把平移後相同的自由向量合併。'
        );
      },
      () => {
        const n = randInt(4, 9);
        return s331QA(
          '正 ' + n + ' 邊形只沿外框邊走。若每一邊兩個方向都算一個非零有向線段，共有幾個？',
          s331MJ(2 * n, '\\text{ 個}'),
          '正 ' + n + ' 邊形有 ' + n + ' 條邊，每條邊可取兩個方向。'
        );
      },
      () =>
        s331QA(
          '在六邊形 ' +
            s331M('ABCDEF') +
            ' 中，化簡 ' +
            s331M(
              '\\overrightarrow{AB}+\\overrightarrow{BC}+\\overrightarrow{CD}+\\overrightarrow{DE}+\\overrightarrow{EF}'
            ) +
            '。',
          s331M('\\overrightarrow{AF}'),
          '連續位移從 ' + s331M('A') + ' 走到 ' + s331M('F') + '，中間點全部抵消。'
        ),
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331GeometricGridCombinationSet(count) {
    const builders = [
      () => {
        const a = randInt(1, 5);
        const b = randInt(1, 5);
        return s331QA(
          '在平行四邊形格線中，以同一頂點 ' +
            s331M('O') +
            ' 為起點，基本邊向量為 ' +
            s331M('u,v') +
            '。點 ' +
            s331M('P') +
            ' 由 ' +
            s331M('O') +
            ' 沿 ' +
            s331M('u') +
            ' 方向走 ' +
            a +
            ' 格，再沿 ' +
            s331M('v') +
            ' 方向走 ' +
            b +
            ' 格。表示 ' +
            s331M('\\overrightarrow{OP}') +
            '。',
          s331MJ('\\overrightarrow{OP}=', s331UvExpression(a, b)),
          '格線位移可分解為兩個基本方向的步數總和。'
        );
      },
      () => {
        const a = randInt(1, 4);
        const b = randInt(1, 4);
        const c = a + randInt(1, 3);
        const d = b + randInt(1, 3);
        return s331QA(
          '在以 ' +
            s331M('u,v') +
            ' 為基本方向的菱形格中，若 ' +
            s331MJ('\\overrightarrow{OP}=', s331UvExpression(a, b)) +
            '、' +
            s331MJ('\\overrightarrow{OQ}=', s331UvExpression(c, d)) +
            '，表示 ' +
            s331M('\\overrightarrow{PQ}') +
            '。',
          s331MJ('\\overrightarrow{PQ}=', s331UvExpression(c - a, d - b)),
          '由 ' +
            s331M('\\overrightarrow{PQ}=\\overrightarrow{OQ}-\\overrightarrow{OP}') +
            '，分別相減兩個基本方向的係數。'
        );
      },
      () => {
        const a = randInt(1, 4);
        const b = randInt(1, 4);
        const c = a + 2 * randInt(1, 3);
        const d = b + 2 * randInt(1, 3);
        return s331QA(
          '在以 ' +
            s331M('u,v') +
            ' 為基本方向的平行四邊形格中，' +
            s331MJ('\\overrightarrow{OP}=', s331UvExpression(a, b)) +
            '、' +
            s331MJ('\\overrightarrow{OQ}=', s331UvExpression(c, d)) +
            '。若 ' +
            s331M('M') +
            ' 為 ' +
            s331M('PQ') +
            ' 中點，表示 ' +
            s331M('\\overrightarrow{OM}') +
            '。',
          s331MJ('\\overrightarrow{OM}=', s331Coeff(a + c, 2), 'u+', s331Coeff(b + d, 2), 'v'),
          '中點的位移向量等於兩端點位移向量的平均。'
        );
      },
      () => {
        const a = randInt(2, 5);
        const b = randInt(2, 5);
        return s331QA(
          '在平行四邊形 ' +
            s331M('OABC') +
            ' 中，' +
            s331M('\\overrightarrow{OA}=u') +
            '、' +
            s331M('\\overrightarrow{OC}=v') +
            '。若點 ' +
            s331M('P') +
            ' 在由邊方向形成的格線上，且 ' +
            s331MJ('\\overrightarrow{OP}=', s331UvExpression(a, b)) +
            '，說明 ' +
            s331M('P') +
            ' 的走法。',
          '沿 ' + s331M('u') + ' 方向走 ' + a + ' 格，沿 ' + s331M('v') + ' 方向走 ' + b + ' 格',
          '幾何格線中的線性組合就是沿兩個基本邊方向分別累加位移。'
        );
      },
      () => {
        const a = randInt(1, 4);
        const b = randInt(1, 4);
        return s331QA(
          '在菱形格中，若 ' +
            s331M('\\overrightarrow{OA}=u') +
            '、' +
            s331M('\\overrightarrow{OB}=v') +
            '，且 ' +
            s331M('P') +
            ' 是平行四邊形 ' +
            s331M('OAPB') +
            ' 的第四個頂點。若再從 ' +
            s331M('P') +
            ' 沿 ' +
            s331M('u') +
            ' 方向走 ' +
            a +
            ' 格、沿 ' +
            s331M('v') +
            ' 方向走 ' +
            b +
            ' 格到 ' +
            s331M('Q') +
            '，表示 ' +
            s331M('\\overrightarrow{OQ}') +
            '。',
          s331MJ('\\overrightarrow{OQ}=', s331UvExpression(a + 1, b + 1)),
          '先到第四頂點得到 ' + s331M('u+v') + '，再加上後續格線位移。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331TriangleCenterLinearCombinationSet(count) {
    const builders = [
      () => {
        const sides = s324Pick([
          [5, 6, 7],
          [4, 5, 6],
          [6, 7, 8],
          [5, 7, 8],
        ]);
        const [a, b, c] = sides;
        const sum = a + b + c;
        const expr = s331VectorLinearTerms([
          { num: a, den: sum, symbol: '\\overrightarrow{OA}' },
          { num: b, den: sum, symbol: '\\overrightarrow{OB}' },
          { num: c, den: sum, symbol: '\\overrightarrow{OC}' },
        ]);
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，已知邊長 ' +
            s331MJ('BC=', a, ',\\ CA=', b, ',\\ AB=', c) +
            '。若 ' +
            s331M('I') +
            ' 為內心，試以任意原點 ' +
            s331M('O') +
            ' 的位置向量表示 ' +
            s331M('\\overrightarrow{OI}') +
            '。',
          s331MJ('\\overrightarrow{OI}=', expr),
          '內心是三邊長加權平均，權重分別對應對邊長 ' + s331M('a:b:c') + '。'
        );
      },
      () => {
        const sides = s324Pick([
          [5, 6, 7],
          [4, 6, 7],
          [6, 8, 9],
        ]);
        const [a, b, c] = sides;
        const den = -a + b + c;
        const expr = s331VectorLinearTerms([
          { num: -a, den, symbol: '\\overrightarrow{OA}' },
          { num: b, den, symbol: '\\overrightarrow{OB}' },
          { num: c, den, symbol: '\\overrightarrow{OC}' },
        ]);
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，已知 ' +
            s331MJ('BC=', a, ',\\ CA=', b, ',\\ AB=', c) +
            '。若 ' +
            s331M('I_A') +
            ' 為對應頂點 ' +
            s331M('A') +
            ' 的旁心，試以 ' +
            s331M('\\overrightarrow{OA},\\overrightarrow{OB},\\overrightarrow{OC}') +
            ' 表示 ' +
            s331M('\\overrightarrow{OI_A}') +
            '。',
          s331MJ('\\overrightarrow{OI_A}=', expr),
          '旁心可視為帶符號的邊長加權平均，對 ' + s331M('A') + ' 的係數取負。'
        );
      },
      () => {
        const k = s324Pick([2, 3, 4, 5]);
        return s331QA(
          '已知 ' +
            s331M('G') +
            ' 為 ' +
            s331M('\\triangle ABC') +
            ' 的重心，且 ' +
            s331MJ('\\overrightarrow{OA}+\\overrightarrow{OB}+\\overrightarrow{OC}=k\\overrightarrow{OG}') +
            '。求實數 ' +
            s331M('k') +
            '。',
          s331M('k=3'),
          '重心位置向量為三頂點位置向量的平均，所以三個頂點位置向量相加等於 ' + s331M('3\\overrightarrow{OG}') + '。'
        );
      },
      () => {
        const [m, n] = s331CoprimePair(5);
        const expr = s331VectorLinearTerms([
          { num: n, den: m + n, symbol: '\\overrightarrow{OB}' },
          { num: m, den: m + n, symbol: '\\overrightarrow{OC}' },
        ]);
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，' +
            s331M('\\angle A') +
            ' 的內角平分線交 ' +
            s331M('BC') +
            ' 於 ' +
            s331M('D') +
            '，且 ' +
            s331MJ('AB:AC=', m, ':', n) +
            '。以 ' +
            s331M('\\overrightarrow{OB},\\overrightarrow{OC}') +
            ' 表示 ' +
            s331M('\\overrightarrow{OD}') +
            '。',
          s331MJ('\\overrightarrow{OD}=', expr),
          '角平分線定理給 ' + s331M('BD:DC=AB:AC') + '，再套用線段內分的位置向量公式。'
        );
      },
      () => {
        const [m, n] = s331CoprimePair(5);
        const expr = s331VectorLinearTerms([
          { num: n, den: m + n, symbol: '\\overrightarrow{AB}' },
          { num: m, den: m + n, symbol: '\\overrightarrow{AC}' },
        ]);
        return s331QA(
          '在 ' +
            s331M('\\triangle ABC') +
            ' 中，點 ' +
            s331M('D') +
            ' 在 ' +
            s331M('BC') +
            ' 上且 ' +
            s331MJ('BD:DC=', m, ':', n) +
            '。若 ' +
            s331M('G') +
            ' 是 ' +
            s331M('\\triangle ABC') +
            ' 的重心，判斷 ' +
            s331M('\\overrightarrow{AD}') +
            ' 與 ' +
            s331M('\\overrightarrow{AG}') +
            ' 的表示差異。',
          s331MJ(
            '\\overrightarrow{AD}=',
            expr,
            ',\\ \\overrightarrow{AG}=\\frac13\\overrightarrow{AB}+\\frac13\\overrightarrow{AC}'
          ),
          '分點由線段比例決定；重心則固定為兩邊向量各三分之一。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331PolyhedronVectorCountSet(count) {
    const builders = [
      () => {
        const n = randInt(5, 10);
        return s331QA(
          '已知正 ' + n + ' 邊形的所有頂點，若任取兩個不同頂點分別作為始點與終點，可形成多少個非零有向線段？',
          s331MJ(n * (n - 1), '\\text{ 個}'),
          '先選始點有 ' + n + ' 種，再選不同終點有 ' + (n - 1) + ' 種。'
        );
      },
      () => {
        const n = s324Pick([5, 6, 8, 10]);
        return s331QA(
          '一個正 ' + n + ' 邊柱共有 ' + 2 * n + ' 個頂點。若只用頂點作為始點與終點，共可決定多少個非零有向線段？',
          s331MJ(2 * n * (2 * n - 1), '\\text{ 個}'),
          '共有 ' + 2 * n + ' 個頂點；有向線段需區分始點與終點，所以數量為 ' + s331M('N(N-1)') + '。'
        );
      },
      () => {
        const n = s324Pick([6, 8, 10, 12]);
        return s331QA(
          '在正 ' + n + ' 邊形中，只考慮連接對頂點的最長對角線有向量，共有多少個？',
          s331MJ(n, '\\text{ 個}'),
          '偶數邊形中每個頂點恰有一個對頂點，從每個頂點出發各形成一個最長對角線有向量。'
        );
      },
      () => {
        const n = randInt(4, 9);
        return s331QA(
          '正 ' +
            n +
            ' 邊形加上中心點 ' +
            s331M('O') +
            '，共有 ' +
            (n + 1) +
            ' 個點。任取兩個不同點作始點與終點，可形成多少個非零有向線段？',
          s331MJ((n + 1) * n, '\\text{ 個}'),
          '共有 ' + (n + 1) + ' 個點，始點選定後終點不能相同，因此為 ' + s331M('(n+1)n') + '。'
        );
      },
      () => {
        const n = s324Pick([4, 5, 6, 8]);
        return s331QA(
          '在正 ' + n + ' 邊形外框上，只考慮一條邊長的邊向量，且兩個方向都算，會有多少個？',
          s331MJ(2 * n, '\\text{ 個}'),
          '正 ' + n + ' 邊形有 ' + n + ' 條邊，每條邊可形成兩個方向的有向線段。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS331GeometricVectorsMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS331TriangleSectionCenterSet,
        buildS331AreaRatioVectorSet,
        buildS331QuadrilateralDecompositionSet,
        buildS331TriangleCenterRatioSet,
        buildS331TriangleAreaCoefficientAdvancedSet,
        buildS331TriangleCenterLinearCombinationSet,
        buildS331PolygonChainCountGeometrySet,
        buildS331PolyhedronVectorCountSet,
        buildS331GeometricGridCombinationSet,
      ],
      count
    );
  }

  function s332Term(coef, symbol, isFirst = false) {
    if (coef === 0) return '';
    const absCoef = Math.abs(coef);
    const body = (absCoef === 1 ? '' : String(absCoef)) + symbol;
    if (coef < 0) return '-' + body;
    return isFirst ? body : '+' + body;
  }

  function s332Expression(terms) {
    return terms
      .map((term, index) => s332Term(term[0], term[1], index === 0))
      .join('')
      .replace(/^\+/, '');
  }

  function s332SignedConst(value) {
    if (value === 0) return '';
    return value > 0 ? '+' + value : String(value);
  }

  function s332LinearForm(a, b) {
    const parts = [];
    const pushTerm = (coef, symbol) => {
      if (coef === 0) return;
      const absCoef = Math.abs(coef);
      const body = (absCoef === 1 ? '' : String(absCoef)) + symbol;
      if (!parts.length) {
        parts.push(coef < 0 ? '-' + body : body);
      } else {
        parts.push((coef < 0 ? '-' : '+') + body);
      }
    };
    pushTerm(a, 'x');
    pushTerm(b, 'y');
    return parts.join('') || '0';
  }

  function s332VecAdd(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
  }

  function s332VecScale(k, v) {
    return [k * v[0], k * v[1]];
  }

  function s332Dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }

  function s332PointTex(name, p) {
    return s331Point(name, p[0], p[1]);
  }

  function buildS332CoordinateOperationLengthSet(count) {
    const builders = [
      () => {
        const u = [randInt(-5, 5) || 2, randInt(-5, 5) || -3];
        const v = [randInt(-5, 5) || -4, randInt(-5, 5) || 1];
        const p = s324Pick([2, 3, -2, -3]);
        const q = s324Pick([2, -1, -3]);
        const ans = s332VecAdd(s332VecScale(p, u), s332VecScale(q, v));
        const expr = s332Expression([
          [p, 'u'],
          [q, 'v'],
        ]);
        return s331QA(
          '設向量 ' +
            s331MJ('u=', s331Vec(u[0], u[1]), ',\\ v=', s331Vec(v[0], v[1])) +
            '，求 ' +
            s331M(expr) +
            ' 的坐標表示。',
          s331MJ(expr, '=', s331Vec(ans[0], ans[1])),
          '分別計算兩個分量：' + s331MJ(expr, '=', s331Vec(ans[0], ans[1])) + '。'
        );
      },
      () => {
        const a = [randInt(-4, 4), randInt(-4, 4)];
        const d = s324Pick([
          [3, 4],
          [5, 12],
          [-4, 3],
          [6, -8],
          [-5, -12],
        ]);
        const b = s332VecAdd(a, d);
        return s331QA(
          '已知 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '，求向量 ' +
            s331M('\\overrightarrow{AB}') +
            ' 及其長度 ' +
            s331M('|AB|') +
            '。',
          s331MJ('\\overrightarrow{AB}=', s331Vec(d[0], d[1]), ',\\ |AB|=', s331LenText(d[0], d[1])),
          '終點坐標減起點坐標得到向量，長度用 ' + s331M('\\sqrt{x^2+y^2}') + '。'
        );
      },
      () => {
        const a = [randInt(-4, 5), randInt(-4, 5)];
        const b = [randInt(-4, 5), randInt(-4, 5)];
        const c = s332VecAdd(s332VecScale(2, a), s332VecScale(-1, b));
        return s331QA(
          '已知 ' +
            s331MJ('a=', s331Vec(a[0], a[1]), ',\\ b=', s331Vec(b[0], b[1])) +
            '，計算 ' +
            s331M('|2a-b|') +
            '。',
          s331MJ('|2a-b|=', s331LenText(c[0], c[1])),
          '先求 ' + s331MJ('2a-b=', s331Vec(c[0], c[1])) + '，再計算此向量長度。'
        );
      },
      () => {
        const b = s324Pick([
          [2, 1],
          [1, 2],
          [3, 1],
          [1, -2],
          [2, -1],
        ]);
        const t0 = randInt(-3, 3) || 2;
        const k = randInt(1, 4);
        const perpendicular = [-k * b[1], k * b[0]];
        const a = s332VecAdd(perpendicular, s332VecScale(-t0, b));
        const minLen = s331LenText(perpendicular[0], perpendicular[1]);
        return s331QA(
          '設 ' +
            s331MJ('a=', s331Vec(a[0], a[1]), ',\\ b=', s331Vec(b[0], b[1])) +
            '，求向量 ' +
            s331M('c=a+tb') +
            ' 的長度最小值，並求此時 ' +
            s331M('t') +
            '。',
          s331MJ('t=', t0, ',\\ |c|_{\\min}=', minLen),
          '當 ' +
            s331M('a+tb') +
            ' 垂直於 ' +
            s331M('b') +
            ' 時長度最小；由點積 ' +
            s331M('(a+tb)\\cdot b=0') +
            ' 解出 ' +
            s331M('t') +
            '。'
        );
      },
      () => {
        const a = [randInt(-4, 4), randInt(-4, 4)];
        const d = [randInt(-6, 6) || 3, randInt(-6, 6) || -2];
        const b = s332VecAdd(a, d);
        return s331QA(
          '已知 ' +
            s331MJ('\\overrightarrow{AB}=', s331Vec(d[0], d[1])) +
            ' 且 ' +
            s332PointTex('A', a) +
            '，求終點 ' +
            s331M('B') +
            ' 的坐標。',
          s331MJ('B=', s331Vec(b[0], b[1])),
          '由 ' + s331M('B=A+\\overrightarrow{AB}') + '，把坐標逐項相加。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS332ParallelCollinearParameterSet(count) {
    const builders = [
      () => {
        const a = randInt(1, 5);
        const b = randInt(-5, 5) || 2;
        const k = randInt(-4, 4) || 2;
        return s331QA(
          '設 ' +
            s331MJ('a=', s331Vec(a, b), ',\\ b=', s331Vec(k * a, 't')) +
            '，若 ' +
            s331M('a\\parallel b') +
            '，求實數 ' +
            s331M('t') +
            '。',
          s331MJ('t=', k * b),
          '平行向量分量成比例，所以 ' + s331MJ('\\frac{', k * a, '}{', a, '}=\\frac{t}{', b, '}') + '。'
        );
      },
      () => {
        const a = randInt(1, 5);
        const k = randInt(-4, 4) || 2;
        const x = randInt(-4, 5) || 2;
        return s331QA(
          '已知 ' +
            s331MJ('u=', s331Vec('x', a), ',\\ v=', s331Vec(k * x, k * a)) +
            '，若 ' +
            s331M('u\\parallel v') +
            '，求 ' +
            s331M('x') +
            '。',
          s331MJ('x=', x),
          '平行時分量成比例，所以 ' +
            s331MJ('\\frac{x}{', k * x, '}=\\frac{', a, '}{', k * a, '}') +
            '，解得 ' +
            s331M('x') +
            '。'
        );
      },
      () => {
        const a = [randInt(-4, 4), randInt(-4, 4)];
        const d = [randInt(2, 6), randInt(-4, 4) || 2];
        const t = randInt(2, 4);
        const b = s332VecAdd(a, d);
        const c = s332VecAdd(a, s332VecScale(t, d));
        return s331QA(
          '已知 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '、' +
            s331Point('C', c[0], 'k') +
            ' 三點共線，求實數 ' +
            s331M('k') +
            '。',
          s331MJ('k=', c[1]),
          '三點共線表示 ' +
            s331M('\\overrightarrow{AB}') +
            ' 與 ' +
            s331M('\\overrightarrow{AC}') +
            ' 平行，代入行列式為 0。'
        );
      },
      () => {
        const a = [randInt(-3, 3), randInt(-3, 3)];
        const d = [randInt(1, 5), randInt(-4, 4) || 2];
        const t = randInt(2, 4);
        const b = s332VecAdd(a, d);
        const c = s332VecAdd(a, s332VecScale(t, d));
        return s331QA(
          '已知 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '、' +
            s332PointTex('C', c) +
            '。判定 ' +
            s331M('\\overrightarrow{AB}') +
            ' 與 ' +
            s331M('\\overrightarrow{AC}') +
            ' 是否平行，並求比例。',
          s331MJ('\\overrightarrow{AC}=', t, '\\overrightarrow{AB}'),
          '因 ' +
            s331M('C') +
            ' 是由 ' +
            s331M('A') +
            ' 沿 ' +
            s331M('\\overrightarrow{AB}') +
            ' 方向走 ' +
            t +
            ' 倍位移，所以兩向量平行。'
        );
      },
      () => {
        const a = [1, 2];
        const b = [-1, 3];
        const t = randInt(-3, 4) || 1;
        const left = s332VecAdd(a, s332VecScale(t, b));
        const right = s332VecAdd(s332VecScale(2, a), s332VecScale(-1, b));
        return s331QA(
          '設 ' +
            s331MJ('a=', s331Vec(a[0], a[1]), ',\\ b=', s331Vec(b[0], b[1])) +
            '，若 ' +
            s331MJ('(a+tb)\\parallel(2a-b)') +
            '，求 ' +
            s331M('t') +
            '。',
          s331MJ('t=', t),
          '令兩向量行列式為 0：' +
            s331MJ('\\det(', s331Vec(left[0], left[1]), ',', s331Vec(right[0], right[1]), ')=0') +
            '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS332LinearCombinationEquationSet(count) {
    const builders = [
      () => {
        const a = [1, 2];
        const b = [2, 1];
        const x = randInt(-4, 4) || 2;
        const y = randInt(-4, 4) || -1;
        const c = s332VecAdd(s332VecScale(x, a), s332VecScale(y, b));
        return s331QA(
          '將向量 ' +
            s331MJ('c=', s331Vec(c[0], c[1])) +
            ' 表為 ' +
            s331MJ('a=', s331Vec(1, 2)) +
            ' 與 ' +
            s331MJ('b=', s331Vec(2, 1)) +
            ' 的線性組合，求 ' +
            s331M('x,y') +
            ' 使 ' +
            s331M('c=xa+yb') +
            '。',
          s331MJ('x=', x, ',\\ y=', y),
          '把 ' + s331M('xa+yb') + ' 展開成坐標後比較兩個分量，解二元一次聯立方程式。'
        );
      },
      () => {
        const x = randInt(-3, 4) || 1;
        const y = randInt(-3, 4) || -2;
        const c1 = y - x;
        const c2 = x + y;
        return s331QA(
          '設 ' +
            s331M('u,v') +
            ' 不平行，若 ' +
            s331MJ('(x-y', s332SignedConst(c1), ')u+(x+y', s332SignedConst(-c2), ')v=0') +
            '，求數對 ' +
            s331M('(x,y)') +
            '。',
          s331MJ('(x,y)=', s331Vec(x, y)),
          '因 ' + s331M('u,v') + ' 不平行，零向量表示唯一，所以兩個係數都必須為 0。'
        );
      },
      () => {
        const u = [randInt(-3, 4) || 2, randInt(-3, 4) || -1];
        const v = [randInt(-3, 4) || -2, randInt(-3, 4) || 3];
        const p = s332VecAdd(u, v);
        const q = s332VecAdd(s332VecScale(3, u), s332VecScale(-2, v));
        return s331QA(
          '設 ' +
            s331MJ('u+v=', s331Vec(p[0], p[1]), ',\\ 3u-2v=', s331Vec(q[0], q[1])) +
            '，求向量 ' +
            s331M('u,v') +
            '。',
          s331MJ('u=', s331Vec(u[0], u[1]), ',\\ v=', s331Vec(v[0], v[1])),
          '把第一式乘 2 後與第二式相加可得 ' + s331M('5u') + '，求出 ' + s331M('u') + ' 後再回代求 ' + s331M('v') + '。'
        );
      },
      () => {
        const c = [3 * (randInt(-3, 3) || 2), 3 * (randInt(-3, 3) || -1)];
        const v = [(2 * c[0]) / 3, (2 * c[1]) / 3];
        return s331QA(
          '若向量 ' +
            s331M('v') +
            ' 滿足 ' +
            s331MJ('5v-2(v+', s331Vec(c[0], c[1]), ')=0') +
            '，求 ' +
            s331M('v') +
            ' 的坐標表示。',
          s331MJ('v=', s331Vec(v[0], v[1])),
          '展開得 ' + s331M('3v=2c') + '，所以 ' + s331M('v=\\frac23c') + '。'
        );
      },
      () => {
        const x = randInt(-3, 4) || 2;
        const y = randInt(-3, 4) || -1;
        const p = [x + y, 2 * x - y];
        return s331QA(
          '若 ' +
            s331MJ('x', s331Vec(1, 2), '+y', s331Vec(1, -1), '=', s331Vec(p[0], p[1])) +
            '，求 ' +
            s331M('x,y') +
            '。',
          s331MJ('x=', x, ',\\ y=', y),
          '把向量方程拆成兩個坐標方程：' + s331M('x+y') + ' 與 ' + s331M('2x-y') + ' 分別比較。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS332DirectionComponentsSet(count) {
    const builders = [
      () => {
        const v = s324Pick([
          [3, 4],
          [5, 12],
          [8, 6],
          [-3, 4],
          [4, -3],
        ]);
        const len = s331LenText(v[0], v[1]);
        return s331QA(
          '求向量 ' + s331MJ('a=', s331Vec(v[0], v[1])) + ' 同方向的單位向量。',
          s331MJ(
            s331Vec(
              s331Frac(v[0], Number(len) || v[0] * v[0] + v[1] * v[1]),
              s331Frac(v[1], Number(len) || v[0] * v[0] + v[1] * v[1])
            )
          ),
          '同方向單位向量為 ' + s331M('\\frac{a}{|a|}') + '，此題 ' + s331M('|a|=' + len) + '。'
        );
      },
      () => {
        const data = s324Pick([
          { angle: 30, c: '\\frac{\\sqrt3}{2}', s: '\\frac12' },
          { angle: 45, c: '\\frac{\\sqrt2}{2}', s: '\\frac{\\sqrt2}{2}' },
          { angle: 60, c: '\\frac12', s: '\\frac{\\sqrt3}{2}' },
          { angle: 120, c: '-\\frac12', s: '\\frac{\\sqrt3}{2}' },
        ]);
        const r = s324Pick([4, 6, 8, 10]);
        return s331QA(
          '已知向量長度為 ' + r + '，方向角為 ' + data.angle + '°，求其坐標表示。',
          s331MJ(r, '(', data.c, ',', data.s, ')'),
          '坐標表示為 ' + s331M('r(\\cos\\theta,\\sin\\theta)') + '。'
        );
      },
      () => {
        const data = s324Pick([
          { v: [3, 4], r: 5 },
          { v: [-3, 4], r: 5 },
          { v: [5, -12], r: 13 },
          { v: [-8, -6], r: 10 },
        ]);
        return s331QA(
          '將向量 ' +
            s331MJ('v=', s331Vec(data.v[0], data.v[1])) +
            ' 表示成 ' +
            s331M('r(\\cos\\theta,\\sin\\theta)') +
            ' 的型式。',
          s331MJ(data.r, '(', s331Frac(data.v[0], data.r), ',', s331Frac(data.v[1], data.r), ')'),
          '先求長度 ' + s331M('r') + '，再把兩個坐標分別除以長度得到方向餘弦與方向正弦。'
        );
      },
      () => {
        const speed = s324Pick([20, 30, 40, 60]);
        const data = s324Pick([
          { angle: 30, x: '\\frac{\\sqrt3}{2}', y: '\\frac12' },
          { angle: 45, x: '\\frac{\\sqrt2}{2}', y: '\\frac{\\sqrt2}{2}' },
          { angle: 60, x: '\\frac12', y: '\\frac{\\sqrt3}{2}' },
        ]);
        return s331QA(
          '若一球以速率 ' + speed + '、仰角 ' + data.angle + '° 投出，求初速度向量的水平與鉛直分量。',
          s331MJ('(', speed, data.x, ',', speed, data.y, ')'),
          '速度分量為 ' + s331M('(v\\cos\\theta,v\\sin\\theta)') + '。'
        );
      },
      () => {
        const p = [randInt(-4, 4), randInt(-4, 4)];
        const data = s324Pick([
          { d: [3, 3], angle: '45^\\circ' },
          { d: [3, -3], angle: '315^\\circ' },
          { d: [-4, 4], angle: '135^\\circ' },
          { d: [-4, -4], angle: '225^\\circ' },
          { d: [5, 0], angle: '0^\\circ' },
          { d: [0, -6], angle: '270^\\circ' },
        ]);
        const d = data.d;
        const q = s332VecAdd(p, d);
        return s331QA(
          '已知點 ' + s332PointTex('P', p) + ' 平移到 ' + s332PointTex('Q', q) + '，求位移向量的方向角。',
          s331M(data.angle),
          '先求位移向量 ' + s331MJ('\\overrightarrow{PQ}=', s331Vec(d[0], d[1])) + '，再依象限與斜率判斷方向角。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS332ApplicationsProjectionMotionSet(count) {
    const builders = [
      () => {
        const p = [randInt(-4, 4), randInt(-4, 4)];
        const v = [randInt(-5, 5) || 3, randInt(-5, 5) || -2];
        const q = s332VecAdd(p, v);
        return s331QA(
          '已知點 ' +
            s332PointTex('P', p) +
            ' 依向量 ' +
            s331MJ('v=', s331Vec(v[0], v[1])) +
            ' 平移後得到 ' +
            s331M('P\\prime') +
            '，求 ' +
            s331M('P\\prime') +
            ' 的坐標。',
          s331MJ('P\\prime=', s331Vec(q[0], q[1])),
          '點平移就是坐標逐項加上位移向量。'
        );
      },
      () => {
        const a = [randInt(-5, 2), randInt(-4, 4)];
        const d = [randInt(2, 6), randInt(-3, 3) || 2];
        const m = randInt(1, 4);
        const n = randInt(1, 4);
        const b = s332VecAdd(a, d);
        const p = [s331Frac(n * a[0] + m * b[0], m + n), s331Frac(n * a[1] + m * b[1], m + n)];
        return s331QA(
          '已知 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '，點 ' +
            s331M('P') +
            ' 在線段 ' +
            s331M('AB') +
            ' 上且 ' +
            s331MJ('AP:PB=', m, ':', n) +
            '，求內分點 ' +
            s331M('P') +
            ' 的坐標。',
          s331MJ('P=', s331Vec(p[0], p[1])),
          '內分點公式為 ' + s331M('P=\\frac{nA+mB}{m+n}') + '，代入坐標後約分。'
        );
      },
      () => {
        const u = s324Pick([
          [3, 4],
          [5, 0],
          [0, 6],
          [6, 8],
        ]);
        const v = s324Pick([
          [4, 3],
          [-3, 4],
          [5, 0],
          [0, 5],
        ]);
        const dot = s332Dot(u, v);
        const len = Number(s331LenText(v[0], v[1]));
        return s331QA(
          '求向量 ' +
            s331MJ('u=', s331Vec(u[0], u[1])) +
            ' 在 ' +
            s331MJ('v=', s331Vec(v[0], v[1])) +
            ' 上的正射影純量。',
          s331MJ(s331Frac(dot, len)),
          '正射影純量為 ' + s331M('\\frac{u\\cdot v}{|v|}') + '，此題 ' + s331M('|v|=' + len) + '。'
        );
      },
      () => {
        const forces = [
          [randInt(-5, 5) || 2, randInt(-5, 5) || -1],
          [randInt(-5, 5) || -3, randInt(-5, 5) || 4],
          [randInt(-5, 5) || 1, randInt(-5, 5) || 2],
        ];
        const sum = forces.reduce((acc, item) => [acc[0] + item[0], acc[1] + item[1]], [0, 0]);
        const balance = [-sum[0], -sum[1]];
        return s331QA(
          '質點 ' +
            s331M('P') +
            ' 受三個力 ' +
            forces.map((f, i) => s331MJ('F_', i + 1, '=', s331Vec(f[0], f[1]))).join('、') +
            ' 作用。若要保持靜態平衡，需加的第四個力為何？',
          s331MJ('F_4=', s331Vec(balance[0], balance[1])),
          '平衡條件是合力為零，所以新增外力是前三力合力的相反向量。'
        );
      },
      () => {
        const boat = [randInt(2, 6), randInt(1, 5)];
        const current = [randInt(-2, 2), randInt(-2, 2)];
        const t = randInt(2, 5);
        const displacement = s332VecScale(t, s332VecAdd(boat, current));
        return s331QA(
          '船的航行速度向量為 ' +
            s331MJ(s331Vec(boat[0], boat[1])) +
            '，水流速度向量為 ' +
            s331MJ(s331Vec(current[0], current[1])) +
            '。航行 ' +
            t +
            ' 小時後，實際對地位移向量為何？',
          s331MJ(s331Vec(displacement[0], displacement[1])),
          '先把船速與水流速度相加成對地速度，再乘上時間。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function s332LineEquationFromPointDir(point, dir) {
    let a = dir[1];
    let b = -dir[0];
    let c = -(a * point[0] + b * point[1]);
    const g = s331Gcd(s331Gcd(a, b), c);
    a /= g;
    b /= g;
    c /= g;
    if (a < 0 || (a === 0 && b < 0)) {
      a = -a;
      b = -b;
      c = -c;
    }
    const bx = b === 0 ? '' : (b > 0 ? '+' : '') + (b === 1 ? '' : b === -1 ? '-' : b) + 'y';
    const cx = c === 0 ? '' : (c > 0 ? '+' : '') + c;
    const ax = a === 0 ? '' : (a === 1 ? '' : a === -1 ? '-' : a) + 'x';
    return ax + bx + cx + '=0';
  }

  function buildS332CoordinateSectionRatioSet(count) {
    const builders = [
      () => {
        const a = [randInt(-5, 3), randInt(-4, 4)];
        const step = [randInt(1, 4), randInt(-3, 3) || 2];
        const m = randInt(1, 4);
        const n = randInt(1, 4);
        const b = s332VecAdd(a, s332VecScale(m + n, step));
        const p = s332VecAdd(a, s332VecScale(m, step));
        return s331QA(
          '已知 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '，點 ' +
            s331M('P') +
            ' 在線段 ' +
            s331M('AB') +
            ' 上且 ' +
            s331MJ('AP:PB=', m, ':', n) +
            '。求內分點 ' +
            s331M('P') +
            ' 的坐標。',
          s331MJ('P=', s331Vec(p[0], p[1])),
          '由內分點公式 ' +
            s331M('P=\\frac{nA+mB}{m+n}') +
            '，或從 ' +
            s331M('A') +
            ' 沿 ' +
            s331M('\\overrightarrow{AB}') +
            ' 走 ' +
            s331MJ(s331Frac(m, m + n)) +
            '。'
        );
      },
      () => {
        const a = [randInt(-4, 4), randInt(-4, 4)];
        const step = [randInt(1, 4), randInt(-3, 3) || -2];
        const m = randInt(3, 6);
        const n = randInt(1, m - 1);
        const b = s332VecAdd(a, s332VecScale(m - n, step));
        const p = s332VecAdd(a, s332VecScale(m, step));
        return s331QA(
          '已知 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '。點 ' +
            s331M('P') +
            ' 在直線 ' +
            s331M('AB') +
            ' 上且位於線段外，並滿足 ' +
            s331MJ('AP:PB=', m, ':', n) +
            '，求 ' +
            s331M('P') +
            ' 的坐標。',
          s331MJ('P=', s331Vec(p[0], p[1])),
          '外分時可想成從 ' +
            s331M('A') +
            ' 沿 ' +
            s331M('AB') +
            ' 方向繼續走；此建構中 ' +
            s331M('AP') +
            ' 是 ' +
            m +
            ' 份，' +
            s331M('PB') +
            ' 是 ' +
            n +
            ' 份。'
        );
      },
      () => {
        const p = [randInt(-5, 5), randInt(-5, 5)];
        const q = [randInt(-5, 5), randInt(-5, 5)];
        const mid = [s331Frac(p[0] + q[0], 2), s331Frac(p[1] + q[1], 2)];
        return s331QA(
          '已知 ' + s332PointTex('P', p) + '、' + s332PointTex('Q', q) + '，求線段 ' + s331M('PQ') + ' 的中點坐標。',
          s331MJ(s331Vec(mid[0], mid[1])),
          '中點坐標為兩端點坐標分別取平均。'
        );
      },
      () => {
        const a = [randInt(-4, 4), randInt(-4, 4)];
        const step = [randInt(1, 4), randInt(-3, 3) || 1];
        const m = randInt(2, 5);
        const b = s332VecAdd(a, s332VecScale(m, step));
        const p = s332VecAdd(a, s332VecScale(randInt(1, m - 1), step));
        const ap = Math.abs(p[0] - a[0]) + Math.abs(p[1] - a[1]);
        const pb = Math.abs(b[0] - p[0]) + Math.abs(b[1] - p[1]);
        const g = s331Gcd(ap, pb);
        return s331QA(
          '已知 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '、' +
            s332PointTex('P', p) +
            ' 三點共線，判斷 ' +
            s331M('P') +
            ' 是否在線段 ' +
            s331M('AB') +
            ' 上，並求 ' +
            s331M('AP:PB') +
            '。',
          s331MJ('P\\text{ 在線段 }AB\\text{ 上， }AP:PB=', ap / g, ':', pb / g),
          '三點由同一步向量建構，且 ' + s331M('P') + ' 位於 ' + s331M('A,B') + ' 之間；距離比等於步數比。'
        );
      },
      () => {
        const a = [randInt(-4, 4), randInt(-4, 4)];
        const b = [a[0] + randInt(2, 6), a[1] + randInt(-3, 3)];
        const d = [b[0] - a[0], b[1] - a[1]];
        return s331QA(
          '已知 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '，求 ' +
            s331M('\\overrightarrow{AB}') +
            '，並寫出通過 ' +
            s331M('A,B') +
            ' 的直線方向向量。',
          s331MJ('\\overrightarrow{AB}=', s331Vec(d[0], d[1]), '\\text{，方向向量可取 }', s331Vec(d[0], d[1])),
          '終點減起點得到位移向量；直線的方向向量可取任一非零倍的 ' + s331M('\\overrightarrow{AB}') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS332ParametricLineExtremaSet(count) {
    const builders = [
      () => {
        const base = [randInt(-4, 4), randInt(-4, 4)];
        const dir = s324Pick([
          [1, 2],
          [2, 1],
          [3, -1],
          [1, -3],
          [2, -2],
        ]);
        const line = s332LineEquationFromPointDir(base, dir);
        return s331QA(
          '將直線參數式 ' +
            s331MJ(
              '\\begin{cases}x=',
              base[0],
              s332SignedConst(dir[0]) + 't\\\\ y=',
              base[1],
              s332SignedConst(dir[1]) + 't\\end{cases}'
            ) +
            ' 化為一般式。',
          s331M(line),
          '方向向量為 ' +
            s331MJ(s331Vec(dir[0], dir[1])) +
            '，法向量可取 ' +
            s331MJ(s331Vec(dir[1], -dir[0])) +
            '，代入通過點即可。'
        );
      },
      () => {
        const base = [randInt(-4, 4), randInt(-4, 4)];
        const dir = s324Pick([
          [3, 4],
          [4, 3],
          [5, 0],
          [0, 5],
        ]);
        const t0 = randInt(-3, 3) || 2;
        const h = randInt(1, 4);
        const foot = s332VecAdd(base, s332VecScale(t0, dir));
        const perp = [-dir[1], dir[0]];
        const q = [foot[0] + h * perp[0], foot[1] + h * perp[1]];
        const minDistance = h * Number(s331LenText(dir[0], dir[1]));
        return s331QA(
          '動點 ' +
            s331M('P') +
            ' 在直線 ' +
            s331MJ('P=', s331Vec(base[0], base[1]), '+t', s331Vec(dir[0], dir[1])) +
            ' 上移動。若固定點 ' +
            s331MJ('Q=', s331Vec(q[0], q[1])) +
            '，求 ' +
            s331M('PQ') +
            ' 長度最小時的 ' +
            s331M('t') +
            ' 與最小距離。',
          s331MJ('t=', t0, ',\\ PQ_{\\min}=', minDistance),
          '距離最小時 ' + s331M('PQ') + ' 垂直直線方向；此題垂足對應參數 ' + s331M('t=' + t0) + '。'
        );
      },
      () => {
        const a = [randInt(-4, 4), randInt(-4, 4)];
        const d = [randInt(2, 5), randInt(-3, 3) || 2];
        const b = s332VecAdd(a, d);
        const alpha = randInt(-3, 3) || 2;
        const beta = randInt(-3, 3) || -1;
        const va = alpha * a[0] + beta * a[1];
        const vb = alpha * b[0] + beta * b[1];
        const maxPoint = va >= vb ? 'A' : 'B';
        const minPoint = va <= vb ? 'A' : 'B';
        return s331QA(
          '點 ' +
            s331M('P') +
            ' 在線段 ' +
            s331M('AB') +
            ' 上，其中 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '。求 ' +
            s331M(s332LinearForm(alpha, beta)) +
            ' 的最大值與最小值。',
          s331MJ(
            '\\max=',
            Math.max(va, vb),
            '\\text{ 於 }',
            maxPoint,
            ',\\ \\min=',
            Math.min(va, vb),
            '\\text{ 於 }',
            minPoint
          ),
          '線性式在線段上的極值出現在端點，比較代入 ' + s331M('A,B') + ' 的值即可。'
        );
      },
      () => {
        const base = [randInt(-3, 3), randInt(-3, 3)];
        const dir = s324Pick([
          [1, 2],
          [2, -1],
          [3, 1],
          [1, -2],
        ]);
        const t = randInt(-3, 4) || 2;
        const p = s332VecAdd(base, s332VecScale(t, dir));
        return s331QA(
          '直線上動點 ' +
            s331M('P') +
            ' 滿足 ' +
            s331MJ('P=', s331Vec(base[0], base[1]), '+t', s331Vec(dir[0], dir[1])) +
            '。若 ' +
            s332PointTex('P', p) +
            '，求參數 ' +
            s331M('t') +
            '。',
          s331MJ('t=', t),
          '比較任一非零方向分量即可求出同一個參數值。'
        );
      },
      () => {
        const base = [randInt(-3, 3), randInt(-3, 3)];
        const dir = s324Pick([
          [3, 4],
          [4, 3],
          [5, 0],
          [0, 5],
        ]);
        const t = randInt(1, 4);
        const p = s332VecAdd(base, s332VecScale(t, dir));
        return s331QA(
          '動點 ' +
            s331M('P') +
            ' 由 ' +
            s331MJ(s331Vec(base[0], base[1])) +
            ' 沿方向向量 ' +
            s331MJ(s331Vec(dir[0], dir[1])) +
            ' 移動。若移動參數為 ' +
            t +
            '，求新位置與移動距離。',
          s331MJ('P=', s331Vec(p[0], p[1]), ',\\ \\text{距離}=', t * Number(s331LenText(dir[0], dir[1]))),
          '位置為起點加上 ' + s331M('t') + ' 倍方向向量；距離為 ' + s331M('|t|\\cdot|v|') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS332CoordinatePointSynthesisSet(count) {
    const builders = [
      () => {
        const a = [randInt(-4, 4), randInt(-4, 4)];
        const b = [a[0] + randInt(2, 6), a[1] + randInt(-3, 3)];
        const c = [b[0] + randInt(-3, 3), b[1] + randInt(2, 6)];
        const d = [a[0] + c[0] - b[0], a[1] + c[1] - b[1]];
        return s331QA(
          '已知平行四邊形 ' +
            s331M('ABCD') +
            ' 的三個連續頂點為 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '、' +
            s332PointTex('C', c) +
            '，求第四個頂點 ' +
            s331M('D') +
            ' 的坐標。',
          s331MJ('D=', s331Vec(d[0], d[1])),
          '平行四邊形對角頂點滿足 ' + s331M('A+C=B+D') + '，所以 ' + s331M('D=A+C-B') + '。'
        );
      },
      () => {
        const a = [randInt(-4, 4), randInt(-4, 4)];
        const b = [randInt(-4, 4), randInt(-4, 4)];
        const c = [randInt(-4, 4), randInt(-4, 4)];
        const d = [randInt(-4, 4), randInt(-4, 4)];
        const ab = [b[0] - a[0], b[1] - a[1]];
        const cd = [d[0] - c[0], d[1] - c[1]];
        const ans = [2 * ab[0] + cd[0], 2 * ab[1] + cd[1]];
        return s331QA(
          '已知 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '、' +
            s332PointTex('C', c) +
            '、' +
            s332PointTex('D', d) +
            '，求向量 ' +
            s331M('2\\overrightarrow{AB}+\\overrightarrow{CD}') +
            ' 的坐標。',
          s331MJ(s331Vec(ans[0], ans[1])),
          '先分別求 ' +
            s331M('\\overrightarrow{AB}=B-A') +
            ' 與 ' +
            s331M('\\overrightarrow{CD}=D-C') +
            '，再做向量加法。'
        );
      },
      () => {
        const a = [randInt(-4, 4), randInt(-4, 4)];
        const d1 = [randInt(1, 5), randInt(-4, 4) || 2];
        const d2 = [randInt(-4, 4) || -2, randInt(1, 5)];
        const b = s332VecAdd(a, d1);
        const c = s332VecAdd(a, d2);
        const ac = [c[0] - a[0], c[1] - a[1]];
        const bc = [c[0] - b[0], c[1] - b[1]];
        return s331QA(
          '已知 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '、' +
            s332PointTex('C', c) +
            '，求 ' +
            s331M('\\overrightarrow{AC}') +
            ' 與 ' +
            s331M('\\overrightarrow{BC}') +
            ' 的坐標表示。',
          s331MJ('\\overrightarrow{AC}=', s331Vec(ac[0], ac[1]), ',\\ \\overrightarrow{BC}=', s331Vec(bc[0], bc[1])),
          '向量坐標一律使用終點減起點。'
        );
      },
      () => {
        const a = [randInt(-5, 2), randInt(-4, 4)];
        const d = [randInt(2, 5), randInt(-3, 3) || 2];
        const m = randInt(2, 5);
        const b = s332VecAdd(a, s332VecScale(m, d));
        const p = s332VecAdd(a, d);
        return s331QA(
          '已知 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '，點 ' +
            s332PointTex('P', p) +
            ' 在直線 ' +
            s331M('AB') +
            ' 上。判斷 ' +
            s331M('P') +
            ' 是否在線段 ' +
            s331M('AB') +
            ' 上，並求 ' +
            s331M('AP:PB') +
            '。',
          s331MJ('P\\text{ 在線段 }AB\\text{ 上， }AP:PB=1:', m - 1),
          '由建構可知 ' +
            s331M('\\overrightarrow{AP}') +
            ' 是一步，而 ' +
            s331M('\\overrightarrow{AB}') +
            ' 是 ' +
            m +
            ' 步，所以比例為 ' +
            s331M('1:(m-1)') +
            '。'
        );
      },
      () => {
        const a = [randInt(-4, 4), randInt(-4, 4)];
        const ab = [randInt(-4, 4) || 2, randInt(-4, 4) || -1];
        const cd = [randInt(-4, 4) || -3, randInt(-4, 4) || 2];
        const ans = [2 * ab[0] + cd[0], 2 * ab[1] + cd[1]];
        return s331QA(
          '若 ' +
            s331MJ('\\overrightarrow{AB}=', s331Vec(ab[0], ab[1]), ',\\ \\overrightarrow{CD}=', s331Vec(cd[0], cd[1])) +
            '，且 ' +
            s332PointTex('A', a) +
            '，求點 ' +
            s331M('E') +
            ' 使 ' +
            s331M('\\overrightarrow{AE}=2\\overrightarrow{AB}+\\overrightarrow{CD}') +
            '。',
          s331MJ('E=', s331Vec(a[0] + ans[0], a[1] + ans[1])),
          '先求目標位移向量，再用 ' + s331M('E=A+\\overrightarrow{AE}') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS332ProjectionExtremaLatticeSet(count) {
    const builders = [
      () => {
        const u = s324Pick([
          [6, 2],
          [5, 5],
          [8, -4],
          [3, 6],
        ]);
        const v = s324Pick([
          [3, 0],
          [0, 4],
          [4, 3],
          [3, 4],
        ]);
        const dot = s332Dot(u, v);
        const lenSq = s332Dot(v, v);
        const scalar = s331Frac(dot, Math.sqrt(lenSq));
        const projection = [s331Frac(dot * v[0], lenSq), s331Frac(dot * v[1], lenSq)];
        return s331QA(
          '求向量 ' +
            s331MJ('u=', s331Vec(u[0], u[1])) +
            ' 在 ' +
            s331MJ('v=', s331Vec(v[0], v[1])) +
            ' 上的正射影向量，並寫出正射影純量。',
          s331MJ('\\operatorname{proj}_v u=', s331Vec(projection[0], projection[1]), ',\\ \\text{純量}=', scalar),
          '正射影向量為 ' + s331M('\\frac{u\\cdot v}{|v|^2}v') + '，純量為 ' + s331M('\\frac{u\\cdot v}{|v|}') + '。'
        );
      },
      () => {
        const a = [randInt(-5, 2), randInt(-4, 4)];
        const step = [randInt(1, 4), randInt(-3, 3) || 2];
        const k = randInt(3, 8);
        const b = s332VecAdd(a, s332VecScale(k, step));
        const countPoints = s331Gcd(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) + 1;
        return s331QA(
          '已知 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '，線段 ' +
            s331M('AB') +
            ' 上坐標皆為整數的格子點共有幾個？',
          s331MJ(countPoints, '\\text{ 個}'),
          '線段上整數格點數為 ' + s331M('\\gcd(|\\Delta x|,|\\Delta y|)+1') + '。'
        );
      },
      () => {
        const a = [randInt(-4, 4), randInt(-4, 4)];
        const d = s324Pick([
          [3, 4],
          [4, 3],
          [5, 0],
          [0, 5],
        ]);
        const b = s332VecAdd(a, d);
        const normal = [-d[1], d[0]];
        const h = randInt(1, 4);
        const p = s332VecAdd(a, s332VecScale(h, normal));
        return s331QA(
          '已知線段端點 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '，點 ' +
            s332PointTex('P', p) +
            '。求 ' +
            s331M('P') +
            ' 到直線 ' +
            s331M('AB') +
            ' 的距離。',
          s331MJ(h * Number(s331LenText(d[0], d[1]))),
          '此題將 ' +
            s331M('P') +
            ' 設在通過 ' +
            s331M('A') +
            ' 且垂直 ' +
            s331M('AB') +
            ' 的方向上，距離為垂直位移長度。'
        );
      },
      () => {
        const a = [randInt(-4, 4), randInt(-4, 4)];
        const b = [a[0] + randInt(2, 6), a[1] + randInt(-4, 4)];
        const alpha = randInt(-4, 4) || 2;
        const beta = randInt(-4, 4) || -3;
        const va = alpha * a[0] + beta * a[1];
        const vb = alpha * b[0] + beta * b[1];
        return s331QA(
          '點 ' +
            s331M('P(x,y)') +
            ' 在線段 ' +
            s331M('AB') +
            ' 上，其中 ' +
            s332PointTex('A', a) +
            '、' +
            s332PointTex('B', b) +
            '。求 ' +
            s331M(s332LinearForm(alpha, beta)) +
            ' 的最大值與最小值。',
          s331MJ('\\max=', Math.max(va, vb), ',\\ \\min=', Math.min(va, vb)),
          '線性函數在線段上的極值出現在端點，只需比較代入 ' + s331M('A,B') + ' 的值。'
        );
      },
      () => {
        const b = s324Pick([
          [2, 1],
          [1, 2],
          [3, 1],
          [2, -1],
        ]);
        const t0 = randInt(-4, 4) || 2;
        const k = randInt(1, 4);
        const perpendicular = [-k * b[1], k * b[0]];
        const a = s332VecAdd(perpendicular, s332VecScale(-t0, b));
        return s331QA(
          '設 ' +
            s331MJ('a=', s331Vec(a[0], a[1]), ',\\ b=', s331Vec(b[0], b[1])) +
            '。求 ' +
            s331M('|a+tb|') +
            ' 的最小值與此時 ' +
            s331M('t') +
            '。',
          s331MJ('t=', t0, ',\\ |a+tb|_{\\min}=', s331LenText(perpendicular[0], perpendicular[1])),
          '當 ' + s331M('a+tb') + ' 垂直於方向向量 ' + s331M('b') + ' 時，長度最小。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS332LineDirectionNormalSet(count) {
    const pairPool = [
      { A: [1, 3], B: [5, 6] },
      { A: [2, 1], B: [5, 5] },
      { A: [0, 2], B: [4, -1] },
      { A: [-1, 2], B: [3, 5] },
      { A: [2, -1], B: [5, 3] },
      { A: [1, 0], B: [4, 4] },
    ];
    const builders = [
      () => {
        const { A, B } = s324Pick(pairPool);
        const dx = B[0] - A[0];
        const dy = B[1] - A[1];
        return s331QA(
          '已知 ' + s332PointTex('A', A) + '、' + s332PointTex('B', B) +
            '，求直線 ' + s331M('AB') + ' 的一組方向向量與法向量。',
          s331MJ('方向向量：', s331Vec(dx, dy), '，法向量：', s331Vec(-dy, dx)),
          '方向向量取 ' + s331MJ('\\overrightarrow{AB}=', s331Vec(dx, dy)) +
            '；法向量與方向向量垂直，旋轉 ' + s331M('90^\\circ') +
            ' 得 ' + s331MJ(s331Vec(-dy, dx)) + '。'
        );
      },
      () => {
        const { A, B } = s324Pick(pairPool);
        const dx = B[0] - A[0];
        const dy = B[1] - A[1];
        const P = [randInt(-2, 3), randInt(-2, 3)];
        const na = -dy;
        const nb = dx;
        const c = -(na * P[0] + nb * P[1]);
        return s331QA(
          '已知 ' + s332PointTex('A', A) + '、' + s332PointTex('B', B) +
            '，求過點 ' + s332PointTex('P', P) + ' 且與直線 ' + s331M('AB') +
            ' 平行的直線方程式。',
          s331MJ(s333LineTex(na, nb, c)),
          '平行直線與 ' + s331M('AB') + ' 同法向量 ' + s331MJ(s331Vec(na, nb)) +
            '，代入點 ' + s332PointTex('P', P) + ' 即得方程式。'
        );
      },
      () => {
        const { A, B } = s324Pick(pairPool);
        const dx = B[0] - A[0];
        const dy = B[1] - A[1];
        const P = [randInt(-2, 3), randInt(-2, 3)];
        const na = dx;
        const nb = dy;
        const c = -(na * P[0] + nb * P[1]);
        return s331QA(
          '已知 ' + s332PointTex('A', A) + '、' + s332PointTex('B', B) +
            '，求過點 ' + s332PointTex('P', P) + ' 且與直線 ' + s331M('AB') +
            ' 垂直的直線方程式。',
          s331MJ(s333LineTex(na, nb, c)),
          '垂直直線的法向量即 ' + s331M('AB') + ' 的方向向量 ' +
            s331MJ(s331Vec(dx, dy)) + '，代入點 ' + s332PointTex('P', P) +
            ' 即得方程式。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS332CoordinateVectorsMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS332CoordinateOperationLengthSet,
        buildS332ParallelCollinearParameterSet,
        buildS332LinearCombinationEquationSet,
        buildS332DirectionComponentsSet,
        buildS332ApplicationsProjectionMotionSet,
        buildS332CoordinateSectionRatioSet,
        buildS332ParametricLineExtremaSet,
        buildS332CoordinatePointSynthesisSet,
        buildS332ProjectionExtremaLatticeSet,
      ],
      count
    );
  }

  function buildS333TriangleAngleCosineSet(count) {
    const angleAtATemplates = [
      { dB: [3, 0], dC: [0, 4],  cosStr: '0' },
      { dB: [4, 3], dC: [-3, 4], cosStr: '0' },
      { dB: [3, 4], dC: [4, 0],  cosStr: '\\dfrac{3}{5}' },
      { dB: [4, 3], dC: [0, 4],  cosStr: '\\dfrac{3}{5}' },
      { dB: [4, 3], dC: [4, 0],  cosStr: '\\dfrac{4}{5}' },
      { dB: [3, 4], dC: [0, 3],  cosStr: '\\dfrac{4}{5}' },
    ];
    const angleAtBTemplates = [
      { dA: [-3, 0], dC: [0, 4],  cosStr: '0' },
      { dA: [-4, -3], dC: [-3, 4], cosStr: '0' },
      { dA: [-3, -4], dC: [0, 4], cosStr: '-\\dfrac{3}{5}' },
      { dA: [-4, -3], dC: [0, 4], cosStr: '-\\dfrac{3}{5}' },
      { dA: [-3, -4], dC: [0, 3], cosStr: '-\\dfrac{4}{5}' },
    ];
    const classifyTemplates = [
      { dB: [3, 0], dC: [0, 4],  typeStr: '直角三角形' },
      { dB: [4, 3], dC: [-3, 4], typeStr: '直角三角形' },
      { dB: [3, 4], dC: [4, 3],  typeStr: '銳角三角形' },
      { dB: [4, 2], dC: [2, 4],  typeStr: '銳角三角形' },
      { dB: [4, 0], dC: [1, 3],  typeStr: '銳角三角形' },
    ];
    const builders = [
      () => {
        const tmpl = s324Pick(angleAtATemplates);
        const A = [randInt(-2, 3), randInt(-2, 3)];
        const B = [A[0] + tmpl.dB[0], A[1] + tmpl.dB[1]];
        const C = [A[0] + tmpl.dC[0], A[1] + tmpl.dC[1]];
        const AB = [B[0] - A[0], B[1] - A[1]];
        const AC = [C[0] - A[0], C[1] - A[1]];
        const dotVal = s333Dot(AB, AC);
        return s331QA(
          '已知 ' + s332PointTex('A', A) + '、' + s332PointTex('B', B) + '、' +
            s332PointTex('C', C) + '，求 ' + s331M('\\angle BAC') + ' 的餘弦值。',
          s331MJ('\\cos\\angle BAC=', tmpl.cosStr),
          s331MJ('\\overrightarrow{AB}=', s331Vec(AB[0], AB[1])) + '，' +
            s331MJ('\\overrightarrow{AC}=', s331Vec(AC[0], AC[1])) + '；' +
            '內積 ' + s331M('\\overrightarrow{AB}\\cdot\\overrightarrow{AC}=' + dotVal) +
            '，由 ' + s331M('\\cos\\theta=\\dfrac{\\overrightarrow{AB}\\cdot\\overrightarrow{AC}}{|\\overrightarrow{AB}||\\overrightarrow{AC}|}') +
            ' 代入得 ' + s331MJ(tmpl.cosStr) + '。'
        );
      },
      () => {
        const tmpl = s324Pick(angleAtBTemplates);
        const B = [randInt(-2, 3), randInt(-2, 3)];
        const A = [B[0] + tmpl.dA[0], B[1] + tmpl.dA[1]];
        const C = [B[0] + tmpl.dC[0], B[1] + tmpl.dC[1]];
        const BA = [A[0] - B[0], A[1] - B[1]];
        const BC = [C[0] - B[0], C[1] - B[1]];
        const dotVal = s333Dot(BA, BC);
        return s331QA(
          '已知 ' + s332PointTex('A', A) + '、' + s332PointTex('B', B) + '、' +
            s332PointTex('C', C) + '，求 ' + s331M('\\angle ABC') + ' 的餘弦值。',
          s331MJ('\\cos\\angle ABC=', tmpl.cosStr),
          s331MJ('\\overrightarrow{BA}=', s331Vec(BA[0], BA[1])) + '，' +
            s331MJ('\\overrightarrow{BC}=', s331Vec(BC[0], BC[1])) + '；' +
            '內積 ' + s331M('\\overrightarrow{BA}\\cdot\\overrightarrow{BC}=' + dotVal) +
            '，由公式代入得 ' + s331MJ(tmpl.cosStr) + '。'
        );
      },
      () => {
        const tmpl = s324Pick(classifyTemplates);
        const A = [randInt(-2, 3), randInt(-2, 3)];
        const B = [A[0] + tmpl.dB[0], A[1] + tmpl.dB[1]];
        const C = [A[0] + tmpl.dC[0], A[1] + tmpl.dC[1]];
        const AB = [B[0]-A[0], B[1]-A[1]];
        const AC = [C[0]-A[0], C[1]-A[1]];
        const BC = [C[0]-B[0], C[1]-B[1]];
        const BA = [-AB[0], -AB[1]];
        const CA = [-AC[0], -AC[1]];
        const CB = [-BC[0], -BC[1]];
        const dA = s333Dot(AB, AC);
        const dB = s333Dot(BA, BC);
        const dC = s333Dot(CA, CB);
        return s331QA(
          '已知 ' + s332PointTex('A', A) + '、' + s332PointTex('B', B) + '、' +
            s332PointTex('C', C) + '，利用向量內積判斷 ' + s331M('\\triangle ABC') +
            ' 是銳角、直角或鈍角三角形。',
          tmpl.typeStr,
          '內積 ' + s331M('\\overrightarrow{AB}\\cdot\\overrightarrow{AC}=' + dA) +
            '，' + s331M('\\overrightarrow{BA}\\cdot\\overrightarrow{BC}=' + dB) +
            '，' + s331M('\\overrightarrow{CA}\\cdot\\overrightarrow{CB}=' + dC) +
            '；三者均正則銳角，有零則直角，有負則鈍角。本題為' + tmpl.typeStr + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS333VectorFromDotConstraintsSet(count) {
    const validCases = [
      { a:[1,2], b:[2,-1], p:5, q:0, x:1, y:2 },
      { a:[1,2], b:[2,-1], p:4, q:3, x:2, y:1 },
      { a:[1,2], b:[2,-1], p:7, q:-1, x:1, y:3 },
      { a:[1,1], b:[1,-1], p:5, q:1, x:3, y:2 },
      { a:[1,1], b:[1,-1], p:4, q:-2, x:1, y:3 },
      { a:[1,1], b:[1,-1], p:6, q:2, x:4, y:2 },
      { a:[2,1], b:[1,2], p:5, q:4, x:2, y:1 },
      { a:[2,1], b:[1,2], p:5, q:7, x:1, y:3 },
      { a:[2,1], b:[1,2], p:8, q:7, x:3, y:2 },
    ];
    const builders = [
      () => {
        const cs = s324Pick(validCases);
        return s331QA(
          '已知 ' + s331MJ('\\vec{a}=', s331Vec(cs.a[0], cs.a[1])) + '，' +
            s331MJ('\\vec{b}=', s331Vec(cs.b[0], cs.b[1])) + '。' +
            '求滿足 ' + s331MJ('\\vec{c}\\cdot\\vec{a}=', cs.p) + ' 且 ' +
            s331MJ('\\vec{c}\\cdot\\vec{b}=', cs.q) + ' 的向量 ' + s331M('\\vec{c}=(x,y)') + '。',
          s331MJ('\\vec{c}=', s331Vec(cs.x, cs.y)),
          '設 ' + s331M('\\vec{c}=(x,y)') + '，內積條件為：' +
            s331MJ(cs.a[0], 'x+', cs.a[1], 'y=', cs.p) + '，' +
            s331MJ(cs.b[0], 'x+', cs.b[1], 'y=', cs.q) +
            '。解聯立方程式得 ' + s331MJ('x=', cs.x, ',\\ y=', cs.y) + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS333NormRelationConditionSet(count) {
    const builders = [
      () => {
        return s331QA(
          '設 ' + s331M('\\vec{a}') + ' 與 ' + s331M('\\vec{b}') +
            ' 為兩非零向量，若 ' + s331MJ('|\\vec{a}+\\vec{b}|=|\\vec{a}-\\vec{b}|') +
            '，求 ' + s331M('\\vec{a}') + ' 與 ' + s331M('\\vec{b}') + ' 的夾角。',
          s331M('90^\\circ'),
          '兩邊平方：' + s331M('|\\vec{a}|^2+2\\vec{a}\\cdot\\vec{b}+|\\vec{b}|^2=|\\vec{a}|^2-2\\vec{a}\\cdot\\vec{b}+|\\vec{b}|^2') +
            '，化簡得 ' + s331M('4\\vec{a}\\cdot\\vec{b}=0') + '，即 ' +
            s331M('\\vec{a}\\perp\\vec{b}') + '，夾角為 ' + s331M('90^\\circ') + '。'
        );
      },
      () => {
        return s331QA(
          '設 ' + s331M('\\vec{a}') + ' 與 ' + s331M('\\vec{b}') +
            ' 為兩單位向量，且 ' + s331MJ('|\\vec{a}-\\vec{b}|=\\sqrt{2}') +
            '，求夾角 ' + s331M('\\theta') + '（0^\\circ\\le\\theta\\le180^\\circ）。',
          s331M('90^\\circ'),
          '兩邊平方：' + s331M('|\\vec{a}|^2-2\\vec{a}\\cdot\\vec{b}+|\\vec{b}|^2=2') +
            '，即 ' + s331M('1-2\\vec{a}\\cdot\\vec{b}+1=2') +
            '，所以 ' + s331M('\\vec{a}\\cdot\\vec{b}=0') + '，夾角 ' + s331M('90^\\circ') + '。'
        );
      },
      () => {
        return s331QA(
          '設 ' + s331M('\\vec{a}') + ' 與 ' + s331M('\\vec{b}') +
            ' 為兩單位向量，且 ' + s331MJ('|\\vec{a}+\\vec{b}|=\\sqrt{3}') +
            '，求夾角 ' + s331M('\\theta') + '（0^\\circ\\le\\theta\\le180^\\circ）。',
          s331M('60^\\circ'),
          '兩邊平方：' + s331M('1+2\\vec{a}\\cdot\\vec{b}+1=3') +
            '，所以 ' + s331M('\\vec{a}\\cdot\\vec{b}=\\dfrac{1}{2}') + '，夾角 ' + s331M('60^\\circ') + '。'
        );
      },
      () => {
        return s331QA(
          '設 ' + s331M('\\vec{a}') + ' 與 ' + s331M('\\vec{b}') +
            ' 為兩單位向量，且 ' + s331MJ('|\\vec{a}+\\vec{b}|=1') +
            '，求夾角 ' + s331M('\\theta') + '（0^\\circ\\le\\theta\\le180^\\circ）。',
          s331M('120^\\circ'),
          '兩邊平方：' + s331M('1+2\\vec{a}\\cdot\\vec{b}+1=1') +
            '，所以 ' + s331M('\\vec{a}\\cdot\\vec{b}=-\\dfrac{1}{2}') + '，夾角 ' + s331M('120^\\circ') + '。'
        );
      },
      () => {
        const lenA = s324Pick([2, 3, 4]);
        const lenB = s324Pick([3, 4, 5]);
        const angle = s324Pick([
          { d: 60, ab: lenA * lenB / 2 },
          { d: 120, ab: -lenA * lenB / 2 },
        ]);
        const normSq = lenA * lenA + lenB * lenB + 2 * angle.ab;
        const sqrtVal = Math.round(Math.sqrt(normSq));
        const normStr = sqrtVal * sqrtVal === normSq ? String(sqrtVal) : '\\sqrt{' + normSq + '}';
        return s331QA(
          '已知 ' + s331MJ('|\\vec{a}|=', lenA, ',\\ |\\vec{b}|=', lenB) +
            '，且 ' + s331M('\\vec{a}') + ' 與 ' + s331M('\\vec{b}') + ' 夾角為 ' +
            s331M(angle.d + '^\\circ') +
            '，求 ' + s331M('|\\vec{a}+\\vec{b}|') + '。',
          s331MJ(normStr),
          s331M('|\\vec{a}+\\vec{b}|^2=|\\vec{a}|^2+2\\vec{a}\\cdot\\vec{b}+|\\vec{b}|^2') +
            '；其中 ' + s331MJ('\\vec{a}\\cdot\\vec{b}=', lenA, '\\cdot', lenB, '\\cos', angle.d, '^\\circ=', angle.ab) +
            '，代入得 ' + s331MJ('|\\vec{a}+\\vec{b}|^2=', normSq) +
            '，所以 ' + s331MJ('|\\vec{a}+\\vec{b}|=', normStr) + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function s333Dot(u, v) {
    return u[0] * v[0] + u[1] * v[1];
  }

  function s333NormSq(v) {
    return s333Dot(v, v);
  }

  function s333Det(u, v) {
    return u[0] * v[1] - u[1] * v[0];
  }

  function s333Sqrt(n) {
    const root = Math.sqrt(n);
    if (Number.isInteger(root)) return String(root);
    return '\\sqrt{' + n + '}';
  }

  function s333Quotient(numer, denom) {
    if (numer === 0) return '0';
    const numericDenom = typeof denom === 'number' ? denom : /^-?\d+$/.test(String(denom)) ? Number(denom) : null;
    if (numericDenom !== null) return s331Frac(numer, numericDenom);
    return '\\frac{' + numer + '}{' + denom + '}';
  }

  function s333RadicalMultiple(k, n) {
    const root = Math.sqrt(n);
    if (Number.isInteger(root)) return String(k * root);
    return (k === 1 ? '' : String(k)) + '\\sqrt{' + n + '}';
  }

  function s333LineTex(a, b, c) {
    let text = s332LinearForm(a, b);
    if (c > 0) text += '+' + c;
    if (c < 0) text += c;
    return text + '=0';
  }

  function s333PointFracTex(name, x, y) {
    return name + '(' + s331Frac(x.n, x.d) + ',' + s331Frac(y.n, y.d) + ')';
  }

  function buildS333DotBasicSet(count) {
    const builders = [
      () => {
        const u = [randInt(-5, 5) || 2, randInt(-5, 5) || -3];
        const v = [randInt(-4, 5) || 1, randInt(-4, 5) || 4];
        const w = [randInt(-4, 4) || -1, randInt(-4, 4) || 2];
        const ans = 2 * s333Dot(u, v) - 3 * s333Dot(u, w);
        return s331QA(
          '設 ' +
            s331MJ('u=', s331Vec(u[0], u[1]), ',\\ v=', s331Vec(v[0], v[1]), ',\\ w=', s331Vec(w[0], w[1])) +
            '，求 ' +
            s331M('u\\cdot(2v-3w)') +
            ' 的值。',
          s331MJ(ans),
          '先利用分配律：' + s331M('u\\cdot(2v-3w)=2u\\cdot v-3u\\cdot w') + '，再代入坐標內積。'
        );
      },
      () => {
        const a = s324Pick([3, 4, 5, 6, 8]);
        const b = s324Pick([4, 5, 6, 7, 9]);
        const angle = s324Pick([
          { d: 60, c: '1/2' },
          { d: 90, c: '0' },
          { d: 120, c: '-1/2' },
        ]);
        const ans = angle.d === 90 ? 0 : angle.d === 60 ? s331Frac(a * b, 2) : s331Frac(-a * b, 2);
        return s331QA(
          '已知 ' +
            s331MJ('|a|=', a, ',\\ |b|=', b) +
            '，且兩向量夾角為 ' +
            s331M(angle.d + '^\\circ') +
            '，求 ' +
            s331M('a\\cdot b') +
            '。',
          s331MJ(ans),
          '使用 ' +
            s331M('a\\cdot b=|a||b|\\cos\\theta') +
            '，其中 ' +
            s331M('\\cos ' + angle.d + '^\\circ=' + angle.c) +
            '。'
        );
      },
      () => {
        const n = s324Pick([4, 5, 6, 8]);
        const side = randInt(2, 6);
        const step = 360 / n;
        const k = randInt(1, Math.floor(n / 2));
        const angle = step * k;
        const cosText =
          angle === 60
            ? '1/2'
            : angle === 90
              ? '0'
              : angle === 120
                ? '-1/2'
                : angle === 180
                  ? '-1'
                  : '\\cos ' + angle + '^\\circ';
        const ans =
          angle === 60
            ? s331Frac(side * side, 2)
            : angle === 90
              ? '0'
              : angle === 120
                ? s331Frac(-side * side, 2)
                : angle === 180
                  ? String(-side * side)
                  : side * side + '\\cos ' + angle + '^\\circ';
        return s331QA(
          '正 ' + n + ' 邊形邊長為 ' + side + '，從同一頂點作相隔 ' + k + ' 邊的兩條邊向量，求它們的內積。',
          s331MJ(ans),
          '兩向量長度皆為邊長，夾角為 ' +
            s331M(angle + '^\\circ') +
            '，所以內積為 ' +
            s331M(side + '^2\\cdot ' + cosText) +
            '。'
        );
      },
      () => {
        const a = randInt(4, 8);
        const b = randInt(4, 9);
        const c = randInt(Math.abs(a - b) + 1, a + b - 1);
        const ans = s331Frac(a * a + b * b - c * c, 2);
        return s331QA(
          '已知 ' +
            s331M('\\triangle ABC') +
            ' 中 ' +
            s331MJ('AB=', a, ',\\ AC=', b, ',\\ BC=', c) +
            '，求 ' +
            s331M('\\overrightarrow{AB}\\cdot\\overrightarrow{AC}') +
            '。',
          s331MJ(ans),
          '由餘弦定理 ' + s331M('BC^2=AB^2+AC^2-2\\overrightarrow{AB}\\cdot\\overrightarrow{AC}') + '，移項即可。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS333AngleSet(count) {
    const builders = [
      () => {
        const a = s324Pick([
          [1, 0],
          [2, 1],
          [3, 1],
          [1, 2],
        ]);
        const b = s324Pick([
          [0, 1],
          [1, 2],
          [2, -1],
          [3, 4],
        ]);
        const dot = s333Dot(a, b);
        const denom = s333Sqrt(s333NormSq(a) * s333NormSq(b));
        return s331QA(
          '求向量 ' + s331MJ('a=', s331Vec(a[0], a[1]), ',\\ b=', s331Vec(b[0], b[1])) + ' 的夾角餘弦值。',
          s331MJ('\\cos\\theta=', s333Quotient(dot, denom)),
          '用 ' + s331M('\\cos\\theta=\\frac{a\\cdot b}{|a||b|}') + '，先算內積，再除以兩長度乘積。'
        );
      },
      () => {
        const a = s324Pick([
          [1, 0],
          [0, 1],
          [1, 1],
          [1, -1],
        ]);
        const b = s324Pick([
          [1, 1],
          [1, -1],
          [0, 1],
          [-1, 0],
        ]);
        const dot = s333Dot(a, b);
        const label = dot > 0 ? '銳角' : dot < 0 ? '鈍角' : '直角';
        return s331QA(
          '不求角度，判斷 ' +
            s331MJ('a=', s331Vec(a[0], a[1]), ',\\ b=', s331Vec(b[0], b[1])) +
            ' 的夾角是銳角、直角或鈍角。',
          label,
          '看內積正負即可：' + s331M('a\\cdot b=' + dot) + '，正為銳角，零為直角，負為鈍角。'
        );
      },
      () => {
        const angle = s324Pick([30, 45, 60, 120, 135]);
        const r = randInt(2, 5);
        const cosMap = {
          30: '\\frac{\\sqrt{3}}{2}',
          45: '\\frac{\\sqrt{2}}{2}',
          60: '\\frac12',
          120: '-\\frac12',
          135: '-\\frac{\\sqrt{2}}{2}',
        };
        return s331QA(
          '設 ' +
            s331M('a=' + r + '(\\cos ' + angle + '^\\circ,\\sin ' + angle + '^\\circ)') +
            '，求 ' +
            s331M('a') +
            ' 與正向 ' +
            s331M('x') +
            ' 軸的夾角餘弦值。',
          s331MJ(cosMap[angle]),
          '向量已寫成極坐標形式，與正向 ' + s331M('x') + ' 軸的夾角就是 ' + s331M(angle + '^\\circ') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS333PerpendicularParameterSet(count) {
    const builders = [
      () => {
        const k0 = randInt(-4, 4) || 2;
        const a = [1, k0 + 1];
        const v = [2 * k0, 3];
        const inner = s333Dot(a, v);
        return s331QA(
          '已知 ' +
            s331MJ('a=', s331Vec(1, 'k+1'), ',\\ v=', s331Vec('2k', 3)) +
            ' 的內積為 ' +
            inner +
            '，求實數 ' +
            s331M('k') +
            '。',
          s331MJ('k=', k0),
          '列式 ' + s331M('1\\cdot 2k+(k+1)\\cdot3=' + inner) + '，解一次方程式。'
        );
      },
      () => {
        const t0 = randInt(-4, 4) || 1;
        const a = [1, 2];
        const b = [t0, 1];
        const u = s332VecAdd(a, s332VecScale(2, b));
        const v = s332VecAdd(s332VecScale(2, a), s332VecScale(-1, b));
        return s331QA(
          '設 ' +
            s331MJ('a=', s331Vec(1, 2), ',\\ b=', s331Vec('t', 1)) +
            '，若 ' +
            s331M('(a+2b)\\perp(2a-b)') +
            '，求 ' +
            s331M('t') +
            '。',
          s331MJ('t=', t0),
          '垂直表示內積為 0；代入後解得符合條件的參數。檢查時 ' +
            s331M(s331Vec(u[0], u[1]) + '\\cdot' + s331Vec(v[0], v[1]) + '=0') +
            '。'
        );
      },
      () => {
        const b = s324Pick([
          [3, 1],
          [2, 1],
          [1, 2],
          [4, -1],
        ]);
        const t0 = randInt(-5, 5) || 2;
        const perp = [-b[1], b[0]];
        const a = s332VecAdd(s332VecScale(1, perp), s332VecScale(-t0, b));
        return s331QA(
          '已知 ' +
            s331MJ('a=', s331Vec(a[0], a[1]), ',\\ b=', s331Vec(b[0], b[1])) +
            '，若 ' +
            s331M('a+tb') +
            ' 的長度最小，求 ' +
            s331M('t') +
            '。',
          s331MJ('t=', t0),
          '長度最小時 ' + s331M('a+tb\\perp b') + '，所以 ' + s331M('(a+tb)\\cdot b=0') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS333NormAlgebraSet(count) {
    const builders = [
      () => {
        const lenA = randInt(2, 6);
        const lenB = randInt(3, 7);
        const angle = s324Pick([
          { d: 60, c: 1 },
          { d: 120, c: -1 },
        ]);
        const normSq = lenA * lenA + lenB * lenB + angle.c * lenA * lenB;
        return s331QA(
          '已知 ' +
            s331MJ('|a|=', lenA, ',\\ |b|=', lenB) +
            '，且夾角為 ' +
            s331M(angle.d + '^\\circ') +
            '，求 ' +
            s331M('|a+b|^2') +
            '。',
          s331MJ(normSq),
          '平方性質：' +
            s331M('|a+b|^2=|a|^2+2a\\cdot b+|b|^2') +
            '，而 ' +
            s331M('2a\\cdot b=' + angle.c * lenA * lenB) +
            '。'
        );
      },
      () => {
        const lenU = randInt(8, 16);
        const lenV = randInt(8, 16);
        const diff = randInt(4, 12);
        const sumSq = 2 * lenU * lenU + 2 * lenV * lenV - diff * diff;
        return s331QA(
          '已知 ' + s331MJ('|u|=', lenU, ',\\ |v|=', lenV, ',\\ |u-v|=', diff) + '，求 ' + s331M('|u+v|^2') + '。',
          s331MJ(sumSq),
          '用平行四邊形恆等式：' + s331M('|u+v|^2+|u-v|^2=2|u|^2+2|v|^2') + '。'
        );
      },
      () => {
        const a = randInt(2, 5);
        const b = randInt(3, 6);
        const c = randInt(4, 8);
        const dot = s331Frac(c * c - a * a - b * b, 2);
        return s331QA(
          '設 ' + s331MJ('|a|=', a, ',\\ |b|=', b, ',\\ |a+b|=', c) + '，求 ' + s331M('a\\cdot b') + '。',
          s331MJ(dot),
          '由 ' + s331M('|a+b|^2=|a|^2+2a\\cdot b+|b|^2') + ' 反推內積。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS333ProjectionLengthSet(count) {
    const builders = [
      () => {
        const a = s324Pick([
          [4, 2],
          [5, 1],
          [3, -1],
          [6, 2],
        ]);
        const b = s324Pick([
          [2, 1],
          [1, 2],
          [3, 4],
          [4, 3],
        ]);
        const dot = s333Dot(a, b);
        return s331QA(
          '求 ' +
            s331MJ('a=', s331Vec(a[0], a[1])) +
            ' 在 ' +
            s331MJ('b=', s331Vec(b[0], b[1])) +
            ' 方向上的正射影量。',
          s331MJ(s333Quotient(dot, s331LenText(b[0], b[1]))),
          '正射影量為 ' + s331M('\\frac{a\\cdot b}{|b|}') + '，有正負號，表示與 ' + s331M('b') + ' 同向或反向。'
        );
      },
      () => {
        const a = s324Pick([
          [3, 4],
          [5, 12],
          [8, 6],
        ]);
        const b = s324Pick([
          [4, 3],
          [12, 5],
          [6, 8],
        ]);
        const dot = Math.abs(s333Dot(a, b));
        return s331QA(
          '求 ' +
            s331MJ('a=', s331Vec(a[0], a[1])) +
            ' 在 ' +
            s331MJ('b=', s331Vec(b[0], b[1])) +
            ' 所在直線上的投影長。',
          s331MJ(s333Quotient(dot, s331LenText(b[0], b[1]))),
          '投影長取非負，為 ' + s331M('\\left|\\frac{a\\cdot b}{|b|}\\right|') + '。'
        );
      },
      () => {
        const u = s324Pick([
          [1, 0],
          [0, 1],
          [3, 4],
          [4, 3],
        ]);
        const a = [randInt(-5, 5) || 3, randInt(-5, 5) || -2];
        const dot = s333Dot(a, u);
        return s331QA(
          '若 ' +
            s331MJ('u=', s331Vec(u[0], u[1])) +
            ' 是方向向量，求 ' +
            s331MJ('a=', s331Vec(a[0], a[1])) +
            ' 在 ' +
            s331M('u') +
            ' 方向上的正射影量。',
          s331MJ(s333Quotient(dot, s331LenText(u[0], u[1]))),
          '若 ' + s331M('u') + ' 是單位向量，答案就是 ' + s331M('a\\cdot u') + '；否則仍要除以 ' + s331M('|u|') + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS333ProjectionVectorSet(count) {
    const builders = [
      () => {
        const a = s324Pick([
          [2, 1],
          [3, 4],
          [5, 2],
          [-1, 3],
        ]);
        const b = s324Pick([
          [1, 2],
          [2, 1],
          [3, 1],
          [1, -2],
        ]);
        const dot = s333Dot(a, b);
        const lenSq = s333NormSq(b);
        return s331QA(
          '求 ' + s331MJ('a=', s331Vec(a[0], a[1])) + ' 在 ' + s331MJ('b=', s331Vec(b[0], b[1])) + ' 上的正射影向量。',
          s331MJ('\\operatorname{proj}_b a=', s331Vec(s331Frac(dot * b[0], lenSq), s331Frac(dot * b[1], lenSq))),
          '正射影向量公式為 ' + s331M('\\operatorname{proj}_b a=\\frac{a\\cdot b}{|b|^2}b') + '。'
        );
      },
      () => {
        const b = s324Pick([
          [1, 2],
          [2, 1],
          [3, 4],
        ]);
        const scale = randInt(-3, 3) || 2;
        const perpScale = randInt(1, 4);
        const para = s332VecScale(scale, b);
        const perp = s332VecScale(perpScale, [-b[1], b[0]]);
        const a = s332VecAdd(para, perp);
        return s331QA(
          '將向量 ' +
            s331MJ('a=', s331Vec(a[0], a[1])) +
            ' 分解為平行於 ' +
            s331MJ('b=', s331Vec(b[0], b[1])) +
            ' 與垂直於 ' +
            s331M('b') +
            ' 的兩個向量。',
          s331MJ(s331Vec(para[0], para[1]), '\\text{ 與 }', s331Vec(perp[0], perp[1])),
          '平行分量就是正射影向量，垂直分量為 ' + s331M('a-\\operatorname{proj}_b a') + '。'
        );
      },
      () => {
        const x0 = randInt(-3, 3) || 1;
        const b = [1, 2];
        const proj = [-2, -4];
        const a = [x0, 4];
        const dotNeeded = s333Dot(proj, b);
        const answer = dotNeeded - 8;
        return s331QA(
          '已知 ' +
            s331M('a=(x,4)') +
            ' 在 ' +
            s331M('b=(1,2)') +
            ' 上的正射影向量為 ' +
            s331M('(-2,-4)') +
            '，求 ' +
            s331M('x') +
            '。',
          s331MJ('x=', answer),
          '由 ' +
            s331M('\\frac{a\\cdot b}{|b|^2}b=(-2,-4)') +
            '，可知 ' +
            s331M('a\\cdot b=-10') +
            '，所以 ' +
            s331M('x+8=-10') +
            '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS333CauchyExtremaSet(count) {
    const builders = [
      () => {
        const r = randInt(2, 5);
        const a = randInt(1, 5);
        const b = randInt(-5, 5) || 3;
        const max = s333RadicalMultiple(r, a * a + b * b);
        return s331QA(
          '已知實數 ' +
            s331M('x,y') +
            ' 滿足 ' +
            s331M('x^2+y^2=' + r * r) +
            '，求 ' +
            s331M(a + 'x' + (b >= 0 ? '+' + b : b) + 'y') +
            ' 的最大值與最小值。',
          s331MJ('\\max=', max, ',\\ \\min=-', max),
          '柯西不等式給出 ' + s331M('|ax+by|\\leq\\sqrt{a^2+b^2}\\sqrt{x^2+y^2}') + '。'
        );
      },
      () => {
        const a = randInt(2, 5);
        const b = randInt(2, 5);
        const k = randInt(8, 24);
        const min = s331Frac(k * k, a * a + b * b);
        const x = s331Frac(k * a, a * a + b * b);
        const y = s331Frac(k * b, a * a + b * b);
        return s331QA(
          '已知 ' +
            s331M(a + 'x+' + b + 'y=' + k) +
            '，求 ' +
            s331M('x^2+y^2') +
            ' 的最小值及此時 ' +
            s331M('(x,y)') +
            '。',
          s331MJ('\\min=', min, ',\\ (x,y)=(', x, ',', y, ')'),
          '由柯西：' +
            s331M('(' + k + ')^2\\leq(' + (a * a + b * b) + ')(x^2+y^2)') +
            '，等號時 ' +
            s331M('(x,y)') +
            ' 與 ' +
            s331M('(' + a + ',' + b + ')') +
            ' 平行。'
        );
      },
      () => {
        const p = randInt(1, 5);
        const q = randInt(1, 5);
        return s331QA(
          '若 ' +
            s331M('a,b>0') +
            '，利用柯西不等式求 ' +
            s331M('(a+' + p + 'b)\\left(\\frac{' + q + '}{a}+\\frac{1}{b}\\right)') +
            ' 的最小值。',
          s331MJ('(\\sqrt{' + q + '}+\\sqrt{' + p + '})^2'),
          '套用 ' + s331M('(x_1^2+x_2^2)(y_1^2+y_2^2)\\geq(x_1y_1+x_2y_2)^2') + '，保留根式可避免近似誤差。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS333DistanceLineSet(count) {
    const builders = [
      () => {
        const a = randInt(1, 5);
        const b = randInt(-5, 5) || 2;
        const c = randInt(-8, 8);
        const p = [randInt(-4, 4), randInt(-4, 4)];
        const numerator = Math.abs(a * p[0] + b * p[1] + c);
        return s331QA(
          '求點 ' + s331M('P(' + p[0] + ',' + p[1] + ')') + ' 到直線 ' + s331M(s333LineTex(a, b, c)) + ' 的距離。',
          s331MJ(s333Quotient(numerator, s333Sqrt(a * a + b * b))),
          '距離公式來自法向量投影：' + s331M('d=\\frac{|ax_0+by_0+c|}{\\sqrt{a^2+b^2}}') + '。'
        );
      },
      () => {
        const a = randInt(1, 4);
        const b = randInt(1, 4);
        const c1 = randInt(-5, 5);
        const gap = randInt(2, 9);
        const c2 = c1 + gap;
        return s331QA(
          '求兩平行直線 ' + s331M(s333LineTex(a, b, c1)) + ' 與 ' + s331M(s333LineTex(a, b, c2)) + ' 的距離。',
          s331MJ(s333Quotient(Math.abs(c2 - c1), s333Sqrt(a * a + b * b))),
          '同法向量平行線距離為 ' + s331M('\\frac{|c_2-c_1|}{\\sqrt{a^2+b^2}}') + '。'
        );
      },
      () => {
        const p = [randInt(-3, 4), randInt(-2, 5)];
        const a = 1;
        const b = -2;
        const c = randInt(-4, 4);
        const value = a * p[0] + b * p[1] + c;
        const reflectedX = { n: p[0] * 5 - 2 * value * a, d: 5 };
        const reflectedY = { n: p[1] * 5 - 2 * value * b, d: 5 };
        return s331QA(
          '求點 ' + s331M('P(' + p[0] + ',' + p[1] + ')') + ' 對直線 ' + s331M(s333LineTex(a, b, c)) + ' 的對稱點。',
          s331M(s333PointFracTex('P\\prime', reflectedX, reflectedY)),
          '先沿法向量 ' + s331M('(1,-2)') + ' 找垂足，再延長同距離得到對稱點。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS333AreaInnerProductSet(count) {
    const builders = [
      () => {
        const a = [randInt(-5, 5) || 4, randInt(-5, 5) || 1];
        const b = [randInt(-5, 5) || -2, randInt(-5, 5) || 3];
        const det = Math.abs(s333Det(a, b));
        return s331QA(
          '由同一點作兩向量 ' +
            s331MJ('u=', s331Vec(a[0], a[1]), ',\\ v=', s331Vec(b[0], b[1])) +
            '，求所夾三角形面積。',
          s331MJ(s331Frac(det, 2)),
          '面積可用 ' +
            s331M('\\frac12\\sqrt{|u|^2|v|^2-(u\\cdot v)^2}') +
            '，在坐標下等同 ' +
            s331M('\\frac12|x_1y_2-x_2y_1|') +
            '。'
        );
      },
      () => {
        const lenA = randInt(2, 6);
        const lenB = randInt(2, 6);
        const dot = randInt(-lenA * lenB + 1, lenA * lenB - 1);
        const rad = lenA * lenA * lenB * lenB - dot * dot;
        return s331QA(
          '已知 ' +
            s331MJ('|AB|=', lenA, ',\\ |AC|=', lenB, ',\\ \\overrightarrow{AB}\\cdot\\overrightarrow{AC}=', dot) +
            '，求 ' +
            s331M('\\triangle ABC') +
            ' 面積。',
          s331MJ('\\frac{' + s333Sqrt(rad) + '}{2}'),
          '用內積面積公式：' + s331M('K=\\frac12\\sqrt{|u|^2|v|^2-(u\\cdot v)^2}') + '。'
        );
      },
      () => {
        const u = [randInt(1, 5), randInt(-3, 5) || 2];
        const v = [randInt(-4, 5) || -1, randInt(1, 5)];
        const area = Math.abs(s333Det(u, v));
        return s331QA(
          '向量 ' +
            s331MJ('u=', s331Vec(u[0], u[1]), ',\\ v=', s331Vec(v[0], v[1])) +
            ' 張成一個平行四邊形，求其面積。',
          s331MJ(area),
          '平行四邊形面積為 ' + s331M('\\sqrt{|u|^2|v|^2-(u\\cdot v)^2}') + '，坐標計算可直接用行列式絕對值。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS333WorkAreaApplicationSet(count) {
    const builders = [
      () => {
        const force = [randInt(2, 8), randInt(-4, 6) || 3];
        const displacement = [randInt(2, 8), randInt(-4, 6) || 1];
        return s331QA(
          '一質點受力 ' +
            s331MJ('F=', s331Vec(force[0], force[1])) +
            '，位移為 ' +
            s331MJ('AB=', s331Vec(displacement[0], displacement[1])) +
            '，求此力所作的功。',
          s331MJ(s333Dot(force, displacement)),
          '作功是力在位移方向上的內積：' + s331M('W=F\\cdot AB') + '。'
        );
      },
      () => {
        const a = [randInt(1, 5), randInt(-4, 4) || 2];
        const b = [randInt(-4, 5) || 3, randInt(1, 5)];
        const combo1 = s332VecAdd(s332VecScale(2, a), s332VecScale(3, b));
        const combo2 = s332VecAdd(a, s332VecScale(-1, b));
        const area = Math.abs(s333Det(combo1, combo2));
        return s331QA(
          '已知平行四邊形由 ' +
            s331MJ('a=', s331Vec(a[0], a[1]), ',\\ b=', s331Vec(b[0], b[1])) +
            ' 張成，求 ' +
            s331M('2a+3b') +
            ' 與 ' +
            s331M('a-b') +
            ' 張成的平行四邊形面積。',
          s331MJ(area),
          '先求兩個新向量，再用行列式或內積面積公式計算。'
        );
      },
      () => {
        const p = [randInt(2, 8), 0];
        const q = [0, randInt(2, 8)];
        const area = s331Frac(p[0] * q[1], 2);
        return s331QA(
          '點 ' +
            s331M('A(' + p[0] + ',0)') +
            '、' +
            s331M('B(0,' + q[1] + ')') +
            ' 分別在坐標軸上，求 ' +
            s331M('\\triangle OAB') +
            ' 面積。',
          s331MJ(area),
          '可視為兩向量 ' + s331M('OA') + '、' + s331M('OB') + ' 張成面積的一半；此題文字完整，不需要額外圖形。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS333InnerProductMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS333DotBasicSet,
        buildS333AngleSet,
        buildS333PerpendicularParameterSet,
        buildS333NormAlgebraSet,
        buildS333ProjectionLengthSet,
        buildS333ProjectionVectorSet,
        buildS333CauchyExtremaSet,
        buildS333DistanceLineSet,
        buildS333AreaInnerProductSet,
        buildS333WorkAreaApplicationSet,
      ],
      count
    );
  }

  function s334Det(a, b, c, d) {
    return a * d - b * c;
  }

  function s334DetTex(a, b, c, d) {
    return '\\begin{vmatrix}' + a + '&' + b + '\\\\' + c + '&' + d + '\\end{vmatrix}';
  }

  function s334SystemTex(a, b, e, c, d, f) {
    return (
      '\\begin{cases}' +
      a +
      'x' +
      (b >= 0 ? '+' + b : b) +
      'y=' +
      e +
      '\\\\' +
      c +
      'x' +
      (d >= 0 ? '+' + d : d) +
      'y=' +
      f +
      '\\end{cases}'
    );
  }

  function s334SignedTerm(coef, symbol) {
    if (coef === 0) return '';
    if (coef === 1) return '+' + symbol;
    if (coef === -1) return '-' + symbol;
    return (coef > 0 ? '+' : '') + coef + symbol;
  }

  function buildS334BasicDeterminantSet(count) {
    const builders = [
      () => {
        const a = randInt(-8, 9) || 3;
        const b = randInt(-8, 9) || -2;
        const c = randInt(-8, 9) || 4;
        const d = randInt(-8, 9) || 5;
        return s331QA(
          '計算行列式 ' + s331M(s334DetTex(a, b, c, d)) + ' 的值。',
          s331MJ(s334Det(a, b, c, d)),
          '二階行列式定義為 ' + s331M('\\begin{vmatrix}a&b\\\\c&d\\end{vmatrix}=ad-bc') + '。'
        );
      },
      () => {
        const m = randInt(2, 6);
        const n = randInt(2, 7);
        const a = randInt(1, 5);
        const b = randInt(-5, 5) || 2;
        const c = randInt(-5, 5) || -3;
        const d = randInt(1, 6);
        const base = s334Det(a, b, c, d);
        return s331QA(
          '計算 ' + s331M(s334DetTex(m * a, n * b, m * c, n * d)) + ' 的值。',
          s331MJ(m * n * base),
          '第一行列可各提出公因數：' +
            s331M(s334DetTex(m + 'a', n + 'b', m + 'c', n + 'd') + '=' + m * n + s334DetTex('a', 'b', 'c', 'd')) +
            '。'
        );
      },
      () => {
        const x = randInt(5, 30);
        const y = randInt(5, 30);
        const r = randInt(2, 9);
        return s331QA(
          '計算 ' + s331M(s334DetTex(x, x + r, y, y + r)) + ' 的值。',
          s331MJ(r * (x - y)),
          '展開得 ' + s331M('x(y+' + r + ')-(x+' + r + ')y=' + r + '(x-y)') + '。'
        );
      },
      () => {
        const k = randInt(1, 6);
        const n = s324Pick([2, 3, 5, 7, 11, 13]);
        return s331QA(
          '計算 ' +
            s331M(
              s334DetTex('\\sqrt{' + n + '}-' + k, '\\sqrt{' + n + '}', '\\sqrt{' + n + '}+' + k, '\\sqrt{' + n + '}')
            ) +
            ' 的值。',
          s331MJ('-' + 2 * k + '\\sqrt{' + n + '}'),
          '兩項相減後，含 ' + s331M('n') + ' 的部分抵消，只剩根式一次項。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS334DeterminantPropertiesSet(count) {
    const builders = [
      () => {
        const D = randInt(-8, 8) || 3;
        const p = randInt(2, 5);
        const q = randInt(-4, 4) || -1;
        const r = randInt(-4, 4) || 2;
        const s = randInt(2, 5);
        const factor = p * s - q * r;
        return s331QA(
          '已知 ' +
            s331M(s334DetTex('a', 'b', 'c', 'd') + '=' + D) +
            '，求 ' +
            s331M(
              s334DetTex(
                p + 'a' + s334SignedTerm(q, 'b'),
                r + 'a' + s334SignedTerm(s, 'b'),
                p + 'c' + s334SignedTerm(q, 'd'),
                r + 'c' + s334SignedTerm(s, 'd')
              )
            ) +
            ' 的值。',
          s331MJ(factor * D),
          '把兩欄視為原兩欄的線性組合，新的行列式會乘上 ' + s331M(s334DetTex(p, r, q, s) + '=' + factor) + '。'
        );
      },
      () => {
        const D = randInt(2, 9);
        const p = randInt(2, 5);
        const q = randInt(-3, 4) || 1;
        return s331QA(
          '已知 ' +
            s331M(s334DetTex('a', 'b', 'c', 'd') + '=' + D) +
            '，求 ' +
            s331M(s334DetTex('a+' + p + 'b', 'b', 'c+' + p + 'd', 'd')) +
            ' 與 ' +
            s331M(s334DetTex(q + 'a', q + 'b', 'c', 'd')) +
            ' 的值。',
          s331MJ(D, '\\text{ 與 }', q * D),
          '某一欄加上另一欄的倍數，行列式不變；某一列同乘 ' + q + '，行列式也同乘 ' + q + '。'
        );
      },
      () => {
        const D = randInt(-7, 7) || 4;
        const p = randInt(2, 6);
        return s331QA(
          '若 ' +
            s331M(s334DetTex('a', 'b', 'c', 'd') + '=' + D) +
            '，判斷下列哪一個也等於 ' +
            s331M(D) +
            '：' +
            s331M(s334DetTex('a', 'b', 'c+' + p + 'a', 'd+' + p + 'b')) +
            '、' +
            s331M(s334DetTex(p + 'a', p + 'b', 'c', 'd')) +
            '。',
          '第一個',
          '第二列加上第一列的倍數，行列式不變；第一列同乘 ' + p + ' 則行列式會乘以 ' + p + '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS334CramerSystemSet(count) {
    const builders = [
      () => {
        let a = randInt(-5, 5) || 2;
        let b = randInt(-5, 5) || -3;
        let c = randInt(-5, 5) || 4;
        let d = randInt(-5, 5) || 1;
        while (s334Det(a, b, c, d) === 0) d = randInt(-5, 5) || 1;
        const x = randInt(-4, 5);
        const y = randInt(-4, 5);
        const e = a * x + b * y;
        const f = c * x + d * y;
        return s331QA(
          '利用克拉瑪公式解方程組 ' + s331M(s334SystemTex(a, b, e, c, d, f)) + '。',
          s331MJ('(x,y)=(', x, ',', y, ')'),
          '令 ' +
            s331M('\\Delta=' + s334DetTex(a, b, c, d)) +
            '，再算 ' +
            s331M('\\Delta_x,\\Delta_y') +
            '，最後 ' +
            s331M('x=\\Delta_x/\\Delta,\\ y=\\Delta_y/\\Delta') +
            '。'
        );
      },
      () => {
        return s331QA(
          '討論方程組 ' +
            s331M('\\begin{cases}kx+y=k+2\\\\x+ky=k\\end{cases}') +
            ' 在不同 ' +
            s331M('k') +
            ' 值下的解的情形。',
          s331M('k\\ne\\pm1') + ' 時恰有一解；' + s331M('k=1') + ' 時無解；' + s331M('k=-1') + ' 時無限多解。',
          '係數行列式為 ' +
            s331M('k^2-1') +
            '。當行列式不為 0 時有唯一解；再分別代入 ' +
            s331M('k=1,-1') +
            ' 檢查是否矛盾或同一直線。'
        );
      },
      () => {
        const x = randInt(-4, 4) || 3;
        const y = randInt(-4, 4) || 2;
        return s331QA(
          '若方程組 ' +
            s331M('\\begin{cases}a_1x+b_1y=c_1\\\\a_2x+b_2y=c_2\\end{cases}') +
            ' 的解為 ' +
            s331M('(' + x + ',' + y + ')') +
            '，求新方程組 ' +
            s331M('\\begin{cases}a_1x+2b_1y=3c_1\\\\a_2x+2b_2y=3c_2\\end{cases}') +
            ' 的解。',
          s331MJ('(x,y)=(', 3 * x, ',', s331Frac(3 * y, 2), ')'),
          '令 ' +
            s331M('X=x,\\ Y=2y') +
            '，新方程組等同原方程組右邊放大 3 倍，所以 ' +
            s331M('(X,Y)=(3' + x + ',3' + y + ')') +
            '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS334AreaDeterminantSet(count) {
    const builders = [
      () => {
        const A = [randInt(-5, 5), randInt(-5, 5)];
        const u = [randInt(1, 6), randInt(-5, 5) || 2];
        const v = [randInt(-5, 5) || -3, randInt(1, 6)];
        const B = s332VecAdd(A, u);
        const C = s332VecAdd(A, v);
        const area2 = Math.abs(s334Det(u[0], v[0], u[1], v[1]));
        return s331QA(
          '已知 ' +
            s332PointTex('A', A) +
            '、' +
            s332PointTex('B', B) +
            '、' +
            s332PointTex('C', C) +
            '，求 ' +
            s331M('\\triangle ABC') +
            ' 面積。',
          s331MJ(s331Frac(area2, 2)),
          '先取 ' +
            s331M('\\overrightarrow{AB},\\overrightarrow{AC}') +
            '，三角形面積為 ' +
            s331M('\\frac12|\\det(AB,AC)|') +
            '。'
        );
      },
      () => {
        const a = [randInt(-5, 5) || 2, randInt(-5, 5) || 1];
        const b = [randInt(-5, 5) || -3, randInt(-5, 5) || 4];
        const area = Math.abs(s334Det(a[0], b[0], a[1], b[1]));
        return s331QA(
          '向量 ' + s331MJ('a=', s331Vec(a[0], a[1]), ',\\ b=', s331Vec(b[0], b[1])) + ' 張成一個平行四邊形，求面積。',
          s331MJ(area),
          '平行四邊形面積就是兩向量組成行列式的絕對值。'
        );
      },
      () => {
        const A = [0, 0];
        const B = [randInt(2, 8), randInt(1, 5)];
        const C = [B[0] + randInt(2, 6), B[1] + randInt(2, 6)];
        const D = [randInt(-2, 4), randInt(2, 8)];
        const shoelace = Math.abs(
          A[0] * B[1] + B[0] * C[1] + C[0] * D[1] + D[0] * A[1] - A[1] * B[0] - B[1] * C[0] - C[1] * D[0] - D[1] * A[0]
        );
        return s331QA(
          '四邊形頂點依逆時針為 ' +
            s331M('A(0,0),B(' + B[0] + ',' + B[1] + '),C(' + C[0] + ',' + C[1] + '),D(' + D[0] + ',' + D[1] + ')') +
            '，求其面積。',
          s331MJ(s331Frac(shoelace, 2)),
          '用鞋帶公式，等同把多邊形拆成二階行列式面積相加。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS334ParallelCollinearRegionSet(count) {
    const builders = [
      () => {
        const A = [randInt(-4, 4), randInt(-4, 4)];
        const d = [randInt(2, 6), randInt(-4, 4) || 1];
        const B = s332VecAdd(A, d);
        const t = randInt(-3, 5);
        const C = s332VecAdd(A, s332VecScale(t, d));
        return s331QA(
          '已知 ' +
            s332PointTex('A', A) +
            '、' +
            s332PointTex('B', B) +
            '、' +
            s331M('C(k,' + C[1] + ')') +
            ' 三點共線，求 ' +
            s331M('k') +
            '。',
          s331MJ('k=', C[0]),
          '三點共線表示 ' + s331M('\\det(AB,AC)=0') + '。'
        );
      },
      () => {
        const a = [randInt(-5, 5) || 3, randInt(-5, 5) || -1];
        const k = randInt(-4, 4) || 2;
        const b = s332VecScale(k, a);
        return s331QA(
          '已知向量 ' +
            s331MJ('a=', s331Vec(a[0], a[1]), ',\\ b=', s331Vec('x', b[1])) +
            ' 平行，求 ' +
            s331M('x') +
            '。',
          s331MJ('x=', b[0]),
          '兩向量平行等同二階行列式為 0：' + s331M('\\det(a,b)=0') + '。'
        );
      },
      () => {
        const A = [randInt(-3, 3), randInt(-3, 3)];
        const B = [A[0] + randInt(2, 6), A[1] + randInt(-2, 3)];
        const D = [A[0] + randInt(-2, 3), A[1] + randInt(2, 6)];
        const C = s332VecAdd(B, [D[0] - A[0], D[1] - A[1]]);
        return s331QA(
          '平行四邊形 ' +
            s331M('ABCD') +
            ' 中，已知 ' +
            s332PointTex('A', A) +
            '、' +
            s332PointTex('B', B) +
            '、' +
            s332PointTex('D', D) +
            '，求 ' +
            s331M('C') +
            '。',
          s331M('C(' + C[0] + ',' + C[1] + ')'),
          '平行四邊形對邊平行且等長，可用 ' + s331M('C=B+D-A') + ' 推得頂點。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS334TransformedAreaSet(count) {
    const builders = [
      () => {
        const baseArea = randInt(3, 12);
        const xLen = randInt(1, 4);
        const yLen = randInt(1, 4);
        return s331QA(
          '已知 ' +
            s331M('\\triangle ABC') +
            ' 面積為 ' +
            baseArea +
            '，若 ' +
            s331M('AP=xAB+yAC') +
            ' 且 ' +
            s331M('0\\le x\\le ' + xLen + ',\\ 0\\le y\\le ' + yLen) +
            '，求點 ' +
            s331M('P') +
            ' 掃過的區域面積。',
          s331MJ(2 * baseArea * xLen * yLen),
          '由 ' +
            s331M('AB,AC') +
            ' 張成的平行四邊形面積是三角形的 2 倍，再乘上係數區域面積 ' +
            s331M(xLen + '\\cdot' + yLen) +
            '。'
        );
      },
      () => {
        const area = randInt(2, 8);
        const p = randInt(2, 5);
        const q = randInt(-4, 4) || 1;
        const r = randInt(-4, 4) || 2;
        const s = randInt(2, 5);
        const factor = Math.abs(p * s - q * r);
        return s331QA(
          '已知向量 ' +
            s331M('a,b') +
            ' 張成的平行四邊形面積為 ' +
            area +
            '，求 ' +
            s331M(p + 'a' + s334SignedTerm(q, 'b')) +
            ' 與 ' +
            s331M(r + 'a' + s334SignedTerm(s, 'b')) +
            ' 張成的面積。',
          s331MJ(factor * area),
          '線性組合後面積會乘上係數行列式的絕對值：' +
            s331M('\\left|' + s334DetTex(p, r, q, s) + '\\right|=' + factor) +
            '。'
        );
      },
      () => {
        const triArea = randInt(4, 12);
        return s331QA(
          '已知 ' +
            s331M('\\triangle ABC') +
            ' 面積為 ' +
            triArea +
            '，若 ' +
            s331M('AP=xAB+yAC') +
            ' 且 ' +
            s331M('0\\le x,\\ 0\\le y,\\ x+y\\le1') +
            '，求點 ' +
            s331M('P') +
            ' 的區域面積。',
          s331MJ(triArea),
          '係數區域本身是一個面積 ' +
            s331M('\\frac12') +
            ' 的三角形，對應到原平面後正好是 ' +
            s331M('\\triangle ABC') +
            '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS334TriangleAreaRatioSet(count) {
    const builders = [
      () => {
        const l = randInt(1, 6);
        const m = randInt(1, 6);
        const n = randInt(1, 6);
        return s331QA(
          '若 ' +
            s331M('P') +
            ' 為 ' +
            s331M('\\triangle ABC') +
            ' 內部一點，且 ' +
            s331M(l + 'PA+' + m + 'PB+' + n + 'PC=0') +
            '，求 ' +
            s331M('\\triangle PAB:\\triangle PBC:\\triangle PCA') +
            '。',
          s331MJ(n, ':', l, ':', m),
          '由係數可得重心坐標比例 ' +
            s331M('P=\\frac{' + l + 'A+' + m + 'B+' + n + 'C}{' + (l + m + n) + '}') +
            '；三個小三角形面積依對應頂點係數分配。'
        );
      },
      () => {
        const p = randInt(2, 6);
        const q = randInt(2, 6);
        return s331QA(
          '設 ' +
            s331M('P') +
            ' 在 ' +
            s331M('\\triangle ABC') +
            ' 內且 ' +
            s331M('AP=\\frac{1}{' + p + '}AB+\\frac{1}{' + q + '}AC') +
            '，求 ' +
            s331M('\\triangle ABP') +
            ' 與 ' +
            s331M('\\triangle ABC') +
            ' 的面積比。',
          s331MJ('\\frac{1}{' + q + '}'),
          '以 ' +
            s331M('AB,AC') +
            ' 為基底時，' +
            s331M('P') +
            ' 到 ' +
            s331M('AB') +
            ' 的高度比例就是 ' +
            s331M('AC') +
            ' 方向係數。'
        );
      },
      () => {
        const l = randInt(1, 5);
        const m = randInt(1, 5);
        const n = randInt(1, 5);
        const area = randInt(12, 36);
        return s331QA(
          '已知 ' +
            s331M('\\triangle ABC') +
            ' 面積為 ' +
            area +
            '，且內部點 ' +
            s331M('P') +
            ' 滿足 ' +
            s331M(l + 'PA+' + m + 'PB+' + n + 'PC=0') +
            '，求 ' +
            s331M('\\triangle PBC') +
            ' 面積。',
          s331MJ(s331Frac(l * area, l + m + n)),
          s331M('\\triangle PBC') +
            ' 對應頂點 ' +
            s331M('A') +
            ' 的係數，所以面積比例為 ' +
            s331M(l + ':' + (l + m + n)) +
            '。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS334CollinearParameterSet(count) {
    const builders = [
      () => {
        const A = [randInt(-4, 4), randInt(-4, 4)];
        const B = [A[0] + randInt(2, 7), A[1] + randInt(-4, 4) || A[1] + 1];
        const t = randInt(-3, 5);
        const C = [A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])];
        return s331QA(
          '已知 ' +
            s332PointTex('A', A) +
            '、' +
            s332PointTex('B', B) +
            '、' +
            s331M('C(k,' + C[1] + ')') +
            ' 三點共線，求 ' +
            s331M('k') +
            '。',
          s331MJ('k=', C[0]),
          '利用三點共線形成的三角形面積為 0，也就是行列式為 0。'
        );
      },
      () => {
        const k = randInt(-4, 5) || 2;
        const AB = [k - 3, 2];
        const BC = [5, k - 3];
        return s331QA(
          '已知 ' +
            s331MJ('\\overrightarrow{AB}=', s331Vec('k-3', 2), ',\\ \\overrightarrow{BC}=', s331Vec(5, 'k-3')) +
            '，若 ' +
            s331M('A,B,C') +
            ' 共線，求 ' +
            s331M('k') +
            '。',
          s331MJ('k=', k),
          '共線表示兩向量平行，所以 ' + s331M('\\det(AB,BC)=0') + '；本題參數設計為可重生版本。'
        );
      },
      () => {
        const A = [randInt(-5, 5), randInt(-5, 5)];
        const u = [randInt(1, 5), randInt(-4, 4) || 1];
        const B = s332VecAdd(A, s332VecScale(randInt(1, 4), u));
        const C = s332VecAdd(A, s332VecScale(randInt(2, 5), u));
        return s331QA(
          '判斷 ' + s332PointTex('A', A) + '、' + s332PointTex('B', B) + '、' + s332PointTex('C', C) + ' 是否共線。',
          '共線',
          '計算 ' + s331M('\\det(AB,AC)=0') + '，所以三點共線。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS334SpecialAlgebraSet(count) {
    const builders = [
      () => {
        return s331QA(
          '計算 ' + s331M(s334DetTex('\\sin\\theta', '\\cos\\theta', '\\cos\\theta', '-\\sin\\theta')) + ' 的值。',
          s331MJ('-1'),
          '展開得 ' + s331M('-\\sin^2\\theta-\\cos^2\\theta=-1') + '。'
        );
      },
      () => {
        const n = randInt(2, 8);
        const rootSq = randInt(1, 12);
        const value = rootSq - n;
        const answer = Number.isInteger(Math.sqrt(rootSq))
          ? s331MJ('x=\\pm', Math.sqrt(rootSq))
          : s331MJ('x=\\pm\\sqrt{' + rootSq + '}');
        return s331QA(
          '解行列式方程 ' + s331M(s334DetTex('x', 1, n, 'x') + '=' + value) + '。',
          answer,
          '先展開為 ' + s331M('x^2-' + n + '=' + value) + '，再解二次方程。'
        );
      },
      () => {
        const D1 = randInt(1, 7);
        const D2 = randInt(1, 7);
        return s331QA(
          '已知 ' +
            s331M(s334DetTex('a', 'b', 'c', 'd') + '=' + D1) +
            ' 且 ' +
            s331M(s334DetTex('a', 'b', 'e', 'f') + '=' + D2) +
            '，求 ' +
            s331M(s334DetTex('a', 'b', 'c+e', 'd+f')) +
            '。',
          s331MJ(D1 + D2),
          '行列式對某一列具有線性性質，所以可以拆成兩個已知行列式相加。'
        );
      },
    ];
    return s331MakeSet(count, builders);
  }

  function buildS334BasicMixedSet(count) {
    return buildS223MixedSet(
      [buildS334BasicDeterminantSet, buildS334DeterminantPropertiesSet, buildS334SpecialAlgebraSet],
      count
    );
  }

  function buildS334CramerMixedSet(count) {
    return buildS223MixedSet(
      [buildS334CramerSystemSet, buildS334ParallelCollinearRegionSet, buildS334CollinearParameterSet],
      count
    );
  }

  function buildS334AreaMixedSet(count) {
    return buildS223MixedSet(
      [buildS334AreaDeterminantSet, buildS334TransformedAreaSet, buildS334TriangleAreaRatioSet],
      count
    );
  }

  function buildS331VectorAlgebraMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS331CoordinateLengthSet,
        buildS331ParallelCollinearSet,
        buildS331LinearCombinationSet,
        buildS331VectorChainSet,
        buildS331VectorEquationSet,
      ],
      count
    );
  }

  function buildS331VectorGeometryMixedSet(count) {
    return buildS223MixedSet(
      [
        buildS331SectionRatioSet,
        buildS331UnitDirectionSet,
        buildS331PolygonVectorCountSet,
        buildS331RegionSet,
        buildS331PhysicsSet,
      ],
      count
    );
  }

  function s331M(s) {
    return '\\(' + s + '\\)';
  }

  function s331MJ(...parts) {
    return s331M(parts.join(''));
  }

  function s331Vec(x, y) {
    return '(' + x + ', ' + y + ')';
  }

  function s331Point(name, x, y) {
    return name + '(' + x + ', ' + y + ')';
  }

  function s331Ans(short, process) {
    const clean = (value) => String(value).replace(/[。.]$/u, '');
    return '簡答：' + clean(short) + '。過程：' + clean(process) + '。';
  }

  function s331QA(q, short, process) {
    return { q, a: s331Ans(short, process) };
  }

  function s331MakeSet(count, builders) {
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

    const answerLabelIndex = text.lastIndexOf('答案：');
    if (answerLabelIndex >= 0) {
      const candidate = text
        .slice(answerLabelIndex + '答案：'.length)
        .split('。解析：')[0]
        .trim()
        .replace(/[。]+$/, '');
      if (candidate) return candidate;
    }

    const directKeywords = ['答案：', '所以', '解得', '結果是', '因此', '答案是', '可得'];
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

  function createAnswerList(summaryAnswers) {
    const answers = [];
    const nativePush = Array.prototype.push;
    answers.push = function pushAnswerWithSummary(...items) {
      items.forEach((item) => {
        summaryAnswers.push(deriveSummaryAnswerFromDetail(item));
      });
      return nativePush.apply(this, items);
    };
    return answers;
  }

  /* ============================================================
   * 新增小類（依三民版 S3-1 三角函數學生卷整理）
   * 以下 3 個 generator 皆使用 randInt/Math.random 進行真隨機參數化，
   * 每次呼叫 generate() 都會重新抽樣，不是固定樣板。
   * ============================================================ */

  /* ---------- 時鐘指針夾角（給定 H 點 M 分，求時針與分針夾角） ---------- */
  function buildS311ClockHandsAngleParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const H = randInt(1, 12);
      const M = randInt(1, 59);
      const Hmod = H % 12;
      const diffTimesTwo = Math.abs(60 * Hmod - 11 * M);
      const k = Math.min(diffTimesTwo, 720 - diffTimesTwo);
      const degWhole = Math.floor(k / 2);
      const degHalf = k % 2 === 1;
      const degText = degHalf ? `${degWhole}.5` : `${degWhole}`;
      const fr = reduceFraction(k, 360);
      const radLatex = k === 0 ? '0' : (fr.denominator === 1 ? `${fr.numerator}\\pi` : `\\dfrac{${fr.numerator}}{${fr.denominator}}\\pi`);

      questions.push(
        `鐘面為一標準時鐘（時針、分針皆等速轉動），在 ${H} 點 ${M} 分時，時針與分針之夾角（取不超過 \\(180^\\circ\\) 的角）為多少弳？`
      );
      answers.push(
        `簡答：\\(${radLatex}\\) 弳（即 \\(${degText}^\\circ\\)）。過程：以 12 點方向為基準，時針經過 ${H} 點 ${M} 分時轉過 \\(30^\\circ\\times ${Hmod}+0.5^\\circ\\times ${M}\\)，分針轉過 \\(6^\\circ\\times ${M}\\)，兩者角度差取絕對值後再與 \\(360^\\circ\\) 減之取較小者，得夾角 \\(${degText}^\\circ=${radLatex}\\) 弳。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  /* ---------- 兩輪皮帶長（外接皮帶，兩輪同向轉動，皮帶不交叉） ---------- */
  function buildS311BeltTwoPulleysParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const r = randInt(1, 5);
      const gap = randInt(2 * r + 1, 2 * r + 8); // R - r
      const R = r + gap;
      const d = 2 * gap; // 使 (R-r)/d = 1/2，夾角恆為 30 度，確保答案為乾淨的根號與 π 形式
      const Lcoef = gap; // L = gap * sqrt(3)
      const piCoefNumerator = 4 * R + 2 * r;
      const piFrac = reduceFraction(piCoefNumerator, 3);
      const piText = piFrac.denominator === 1 ? `${piFrac.numerator}\\pi` : `\\dfrac{${piFrac.numerator}}{${piFrac.denominator}}\\pi`;

      questions.push(
        `兩個皮帶輪的半徑分別為 ${r} 與 ${R}（單位：公分），兩輪中心距離為 ${d} 公分，以皮帶緊繞兩輪外側使兩輪同向轉動（皮帶不交叉），試求皮帶長。（答案可用根號與 \\(\\pi\\) 表示）`
      );
      answers.push(
        `簡答：\\((${2 * Lcoef}\\sqrt{3}+${piText})\\) 公分。過程：設小輪半徑 \\(r=${r}\\)，大輪半徑 \\(R=${R}\\)，中心距 \\(d=${d}\\)。因為 \\(\\dfrac{R-r}{d}=\\dfrac{${gap}}{${d}}=\\dfrac12\\)，可知皮帶與圓心連線的夾角 \\(\\theta=30^\\circ=\\dfrac{\\pi}{6}\\)。兩段公切線長 \\(L=\\sqrt{d^2-(R-r)^2}=\\sqrt{${d}^2-${gap}^2}=${Lcoef}\\sqrt{3}\\)，共兩段為 \\(${2 * Lcoef}\\sqrt{3}\\)。皮帶繞大輪的弧角為 \\(\\pi+2\\theta=\\dfrac{4\\pi}{3}\\)，繞小輪的弧角為 \\(\\pi-2\\theta=\\dfrac{2\\pi}{3}\\)，兩段弧長之和為 \\(R\\cdot\\dfrac{4\\pi}{3}+r\\cdot\\dfrac{2\\pi}{3}=${piText}\\)。故皮帶總長為 \\(${2 * Lcoef}\\sqrt{3}+${piText}\\) 公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  /* ---------- 七圓（六圓環繞一圓）緊密排列外圍包裝長度 ---------- */
  function buildS311SevenCirclesBandParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = [
      { obj: '圓柱形鋼筋', unit: '公分', verb: '環繞' },
      { obj: '圓形管件', unit: '公分', verb: '包裝' },
    ];
    for (let i = 0; i < count; i += 1) {
      const r = randInt(2, 12);
      const ctx = contexts[i % contexts.length];
      const total = 12 * r;
      questions.push(
        `如圖，7 根半徑皆為 ${r}（單位：${ctx.unit}）的${ctx.obj}緊密排列，其中 6 根${ctx.verb}排列在中央 1 根周圍且彼此外切，若用鐵條緊貼${ctx.verb}外圍 6 根${ctx.obj}一圈，試求所需鐵條的長度。（答案可用 \\(\\pi\\) 表示）`
      );
      answers.push(
        `簡答：\\((${total}+${2 * r}\\pi)\\) ${ctx.unit}。過程：外圍 6 根圓兩兩外切，圓心連線構成正六邊形，每邊長 \\(=2r=${2 * r}\\)，故 6 段公切線（緊貼直線段）總長為 \\(6\\times 2r=${total}\\)。轉彎處 6 段弧的圓心角之和恰為一整圈 \\(360^\\circ\\)，弧長之和為 \\(2\\pi r=${2 * r}\\pi\\)。所以鐵條總長為 \\(${total}+${2 * r}\\pi\\) ${ctx.unit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  /* ============================================================
   * 新增小類（依三民版 S3-2 指數對數學生卷整理）
   * 以下 1 個 generator 使用 randInt/Math.random 進行真隨機參數化，
   * 每次呼叫 generate() 都會重新抽樣，不是固定樣板。
   * ============================================================ */

  function fAdd(f1, f2) { return reduceFraction(f1.numerator * f2.denominator + f2.numerator * f1.denominator, f1.denominator * f2.denominator); }
  function fSub(f1, f2) { return reduceFraction(f1.numerator * f2.denominator - f2.numerator * f1.denominator, f1.denominator * f2.denominator); }
  function fMul(f1, f2) { return reduceFraction(f1.numerator * f2.numerator, f1.denominator * f2.denominator); }
  function fAddInt(f, k) { return reduceFraction(f.numerator + k * f.denominator, f.denominator); }
  function fFrac(n, d) { return reduceFraction(n, d); }
  function fToLatex(f) {
    if (f.denominator === 1) return `${f.numerator}`;
    const sign = f.numerator < 0 ? '-' : '';
    return `${sign}\\dfrac{${Math.abs(f.numerator)}}{${f.denominator}}`;
  }

  /* ---------- 指數分式函數合成求值：由 f(α)、f(β) 求 f(α±β) ---------- */
  function buildS321HyperbolicComposeParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const bases = [2, 3, 5, 7];
    const pool = [2, 3, 4, 5, 6, -2, -3, -4, -5, -6];

    for (let i = 0; i < count; i += 1) {
      const a = bases[randInt(0, bases.length - 1)];
      const variant = i % 2; // 0: 求 f(α-β)  1: 求 f(α+β)

      let p, q, AA, BB;
      let guard = 0;
      do {
        p = pool[randInt(0, pool.length - 1)];
        q = pool[randInt(0, pool.length - 1)];
        AA = fFrac(p + 1, p - 1); // A^2
        BB = fFrac(q + 1, q - 1); // B^2
        guard += 1;
      } while (
        guard < 30 &&
        ((variant === 0 && (p === q || fSub(AA, BB).numerator === 0)) ||
          (variant === 1 && fMul(AA, BB).numerator === fMul(AA, BB).denominator))
      );

      let result;
      if (variant === 0) {
        // f(α-β) = (A^2+B^2)/(A^2-B^2)
        const num = fAdd(AA, BB);
        const den = fSub(AA, BB);
        result = fFrac(num.numerator * den.denominator, num.denominator * den.numerator);
        questions.push(
          `設 \\(f(x)=\\dfrac{${a}^x+${a}^{-x}}{${a}^x-${a}^{-x}}\\)（\\(x\\neq0\\)），已知 \\(f(\\alpha)=${p}\\)，\\(f(\\beta)=${q}\\)，試求 \\(f(\\alpha-\\beta)\\) 的值。`
        );
        answers.push(
          `簡答：\\(${fToLatex(result)}\\)。過程：設 \\(A=${a}^{\\alpha},B=${a}^{\\beta}\\)。由 \\(f(\\alpha)=\\dfrac{A^2+1}{A^2-1}=${p}\\) 解得 \\(A^2=\\dfrac{${p}+1}{${p}-1}=${fToLatex(AA)}\\)；同理由 \\(f(\\beta)=${q}\\) 解得 \\(B^2=${fToLatex(BB)}\\)。又 \\(f(\\alpha-\\beta)=\\dfrac{\\frac{A}{B}+\\frac{B}{A}}{\\frac{A}{B}-\\frac{B}{A}}=\\dfrac{A^2+B^2}{A^2-B^2}\\)，代入得 \\(f(\\alpha-\\beta)=\\dfrac{${fToLatex(num)}}{${fToLatex(den)}}=${fToLatex(result)}\\)。`
        );
      } else {
        const AB2 = fMul(AA, BB); // (AB)^2
        const num = fAddInt(AB2, 1);
        const den = fAddInt(AB2, -1);
        if (den.numerator === 0) { i -= 1; continue; } // 極少數退化狀況，重新這一題
        result = fFrac(num.numerator * den.denominator, num.denominator * den.numerator);
        questions.push(
          `設 \\(f(x)=\\dfrac{${a}^x+${a}^{-x}}{${a}^x-${a}^{-x}}\\)（\\(x\\neq0\\)），已知 \\(f(\\alpha)=${p}\\)，\\(f(\\beta)=${q}\\)，試求 \\(f(\\alpha+\\beta)\\) 的值。`
        );
        answers.push(
          `簡答：\\(${fToLatex(result)}\\)。過程：設 \\(A=${a}^{\\alpha},B=${a}^{\\beta}\\)。由 \\(f(\\alpha)=${p}\\) 解得 \\(A^2=${fToLatex(AA)}\\)；由 \\(f(\\beta)=${q}\\) 解得 \\(B^2=${fToLatex(BB)}\\)，故 \\((AB)^2=A^2B^2=${fToLatex(AB2)}\\)。又 \\(f(\\alpha+\\beta)=\\dfrac{AB+\\frac{1}{AB}}{AB-\\frac{1}{AB}}=\\dfrac{(AB)^2+1}{(AB)^2-1}\\)，代入得 \\(f(\\alpha+\\beta)=\\dfrac{${fToLatex(num)}}{${fToLatex(den)}}=${fToLatex(result)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  /* ============================================================
   * 新增小類（依三民版 S3-3 平面向量學生卷整理）
   * 以下 2 個 generator 使用 randInt/Math.random 進行真隨機參數化，
   * 每次呼叫 generate() 都會重新抽樣，不是固定樣板。
   * ============================================================ */

  function s332FracLatex(f) {
    if (f.denominator === 1) return `${f.numerator}`;
    const sign = f.numerator < 0 ? '-' : '';
    return `${sign}\\dfrac{${Math.abs(f.numerator)}}{${f.denominator}}`;
  }

  /* ---------- 兩直線交角（法向量／方向向量內積） ---------- */
  function buildS332LineAngleVectorParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // 整數邊長的直角三角形斜邊組（含正負號變化），確保長度是整數，避免根號
    const base = [
      [3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13],
      [8, 15, 17], [15, 8, 17], [7, 24, 25], [24, 7, 25],
      [6, 8, 10], [9, 12, 15], [20, 21, 29], [21, 20, 29],
    ];

    function randSignedVec() {
      const [x, y, mag] = base[randInt(0, base.length - 1)];
      const sx = Math.random() < 0.5 ? -1 : 1;
      const sy = Math.random() < 0.5 ? -1 : 1;
      return { x: sx * x, y: sy * y, mag };
    }

    function isParallel(v1, v2) {
      return v1.x * v2.y - v1.y * v2.x === 0;
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2; // 0: 一般式（用法向量）  1: 參數式（用方向向量）
      let v1, v2;
      let guard = 0;
      do {
        v1 = randSignedVec();
        v2 = randSignedVec();
        guard += 1;
      } while (guard < 30 && isParallel(v1, v2));

      const dot = v1.x * v2.x + v1.y * v2.y;
      const absDotFrac = reduceFraction(Math.abs(dot), v1.mag * v2.mag);
      const cosLatex = absDotFrac.numerator === 0 ? '0' : s332FracLatex(absDotFrac);
      const isPerp = dot === 0;

      if (variant === 0) {
        const c1 = randInt(-9, 9);
        const c2 = randInt(-9, 9);
        const line1 = `${v1.x}x${v1.y >= 0 ? '+' : ''}${v1.y}y${c1 >= 0 ? '+' : ''}${c1}=0`;
        const line2 = `${v2.x}x${v2.y >= 0 ? '+' : ''}${v2.y}y${c2 >= 0 ? '+' : ''}${c2}=0`;
        questions.push(
          `坐標平面上，兩直線 \\(L_1:${line1}\\)、\\(L_2:${line2}\\)，設其夾角（銳角或直角）為 \\(\\theta\\)，試求 \\(\\cos\\theta\\) 的值。`
        );
        if (isPerp) {
          answers.push(
            `簡答：\\(\\cos\\theta=0\\)（即 \\(\\theta=90^\\circ\\)）。過程：\\(L_1\\) 的法向量為 \\((${v1.x},${v1.y})\\)，\\(L_2\\) 的法向量為 \\((${v2.x},${v2.y})\\)，其內積 \\((${v1.x})(${v2.x})+(${v1.y})(${v2.y})=${dot}=0\\)，故兩法向量垂直，兩直線亦垂直。`
          );
        } else {
          answers.push(
            `簡答：\\(\\cos\\theta=${cosLatex}\\)。過程：\\(L_1\\) 的法向量為 \\((${v1.x},${v1.y})\\)（長度 ${v1.mag}），\\(L_2\\) 的法向量為 \\((${v2.x},${v2.y})\\)（長度 ${v2.mag}）。兩法向量內積為 \\((${v1.x})(${v2.x})+(${v1.y})(${v2.y})=${dot}\\)，故 \\(\\cos\\theta=\\dfrac{|${dot}|}{${v1.mag}\\times${v2.mag}}=${cosLatex}\\)。`
          );
        }
      } else {
        questions.push(
          `坐標平面上，直線 \\(L_1\\) 的一個方向向量為 \\((${v1.x},${v1.y})\\)，直線 \\(L_2\\) 的一個方向向量為 \\((${v2.x},${v2.y})\\)，設 \\(L_1\\) 與 \\(L_2\\) 的夾角（銳角或直角）為 \\(\\theta\\)，試求 \\(\\cos\\theta\\) 的值。`
        );
        if (isPerp) {
          answers.push(
            `簡答：\\(\\cos\\theta=0\\)（即 \\(\\theta=90^\\circ\\)）。過程：兩方向向量內積為 \\((${v1.x})(${v2.x})+(${v1.y})(${v2.y})=${dot}=0\\)，故兩直線互相垂直。`
          );
        } else {
          answers.push(
            `簡答：\\(\\cos\\theta=${cosLatex}\\)。過程：方向向量長度分別為 ${v1.mag}、${v2.mag}，內積為 \\((${v1.x})(${v2.x})+(${v1.y})(${v2.y})=${dot}\\)，故 \\(\\cos\\theta=\\dfrac{|${dot}|}{${v1.mag}\\times${v2.mag}}=${cosLatex}\\)。`
          );
        }
      }
    }
    return { questions, summaryAnswers, answers };
  }

  /* ---------- 由頂點坐標求垂心與外心坐標 ---------- */
  function buildS332TriangleCenterCoordinateParameterizedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function s332Cross(A, B, C) {
      return (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
    }
    function s332RandPoint() {
      return [randInt(-6, 6), randInt(-6, 6)];
    }
    function s332PointTexLocal(name, P) {
      return `${name}(${P[0]},${P[1]})`;
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2; // 0: 垂心  1: 外心
      let A, B, C;
      let guard = 0;
      do {
        A = s332RandPoint();
        B = s332RandPoint();
        C = s332RandPoint();
        guard += 1;
      } while (guard < 40 && s332Cross(A, B, C) === 0);

      if (variant === 0) {
        // 垂心 H：(H-A)·(C-B)=0, (H-B)·(C-A)=0
        const a1 = C[0] - B[0], b1 = C[1] - B[1];
        const r1 = A[0] * a1 + A[1] * b1;
        const a2 = C[0] - A[0], b2 = C[1] - A[1];
        const r2 = B[0] * a2 + B[1] * b2;
        const det = a1 * b2 - a2 * b1;
        const xFrac = reduceFraction(r1 * b2 - r2 * b1, det);
        const yFrac = reduceFraction(a1 * r2 - a2 * r1, det);
        questions.push(
          `已知平面上三點 \\(${s332PointTexLocal('A', A)}\\)、\\(${s332PointTexLocal('B', B)}\\)、\\(${s332PointTexLocal('C', C)}\\)，試求 \\(\\triangle ABC\\) 的垂心 \\(H\\) 的坐標。`
        );
        answers.push(
          `簡答：\\(H(${s332FracLatex(xFrac)},${s332FracLatex(yFrac)})\\)。過程：垂心滿足 \\(\\overrightarrow{AH}\\perp\\overrightarrow{BC}\\) 且 \\(\\overrightarrow{BH}\\perp\\overrightarrow{AC}\\)，設 \\(H(x,y)\\)，代入內積為 0 的兩條件並解聯立方程式，得 \\(H(${s332FracLatex(xFrac)},${s332FracLatex(yFrac)})\\)。`
        );
      } else {
        // 外心 O：|OA|^2=|OB|^2=|OC|^2
        const a1 = 2 * (B[0] - A[0]), b1 = 2 * (B[1] - A[1]);
        const r1 = (B[0] * B[0] + B[1] * B[1]) - (A[0] * A[0] + A[1] * A[1]);
        const a2 = 2 * (C[0] - A[0]), b2 = 2 * (C[1] - A[1]);
        const r2 = (C[0] * C[0] + C[1] * C[1]) - (A[0] * A[0] + A[1] * A[1]);
        const det = a1 * b2 - a2 * b1;
        const xFrac = reduceFraction(r1 * b2 - r2 * b1, det);
        const yFrac = reduceFraction(a1 * r2 - a2 * r1, det);
        questions.push(
          `已知平面上三點 \\(${s332PointTexLocal('A', A)}\\)、\\(${s332PointTexLocal('B', B)}\\)、\\(${s332PointTexLocal('C', C)}\\)，試求 \\(\\triangle ABC\\) 的外心 \\(O\\) 的坐標。`
        );
        answers.push(
          `簡答：\\(O(${s332FracLatex(xFrac)},${s332FracLatex(yFrac)})\\)。過程：外心到三頂點等距，設 \\(O(x,y)\\)，由 \\(|OA|^2=|OB|^2\\) 與 \\(|OA|^2=|OC|^2\\) 展開整理成兩條線性方程式並解聯立，得 \\(O(${s332FracLatex(xFrac)},${s332FracLatex(yFrac)})\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  const nextConfigs = {
      's3-1-1-clock-hands-angle-parameterized': {
        type: 'drill',
        title: '時鐘指針夾角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311ClockHandsAngleParameterizedSet(5);
        },
      },
      's3-1-1-belt-two-pulleys-parameterized': {
        type: 'drill',
        title: '兩輪皮帶長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311BeltTwoPulleysParameterizedSet(5);
        },
      },
      's3-1-1-seven-circles-band-parameterized': {
        type: 'drill',
        title: '七圓緊密排列外圍包裝長度',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311SevenCirclesBandParameterizedSet(5);
        },
      },
      's3-1-1-sector-cone-parameterized': {
        type: 'drill',
        title: '扇形展開成圓錐：半徑、高與體積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311SectorConeParameterizedSet(5);
        },
      },
      's3-1-1-radian-sector-five-subtypes': {
        type: 'drill',
        title: '弧度、扇形與旋轉基礎五小類',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311RadianSectorFiveSubtypeMixedSet(5);
        },
      },
      's3-1-1-degree-radian-conversion': {
        type: 'drill',
        title: '度數與弧度的精確互換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311DegreeRadianConversionSubtypeSet(5);
        },
      },
      's3-1-1-sector-parameter': {
        type: 'drill',
        title: '扇形基本參數互求',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311SectorParameterSubtypeSet(5);
        },
      },
      's3-1-1-clock-sector': {
        type: 'drill',
        title: '時鐘指針掃過區域',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311ClockSectorSubtypeSet(5);
        },
      },
      's3-1-1-rolling-motion': {
        type: 'drill',
        title: '滾動與旋轉應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311RollingMotionSubtypeSet(5);
        },
      },
      's3-1-1-sector-application-five-subtypes': {
        type: 'drill',
        title: '扇形面積、疊合圖形與極值五小類',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311SectorApplicationFiveSubtypeMixedSet(5);
        },
      },
      's3-1-1-overlap-area': {
        type: 'drill',
        title: '幾何圖形中的陰影面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311OverlapAreaSubtypeSet(5);
        },
      },
      's3-1-1-sector-extrema': {
        type: 'drill',
        title: '扇形的極值問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311SectorExtremaSubtypeSet(5);
        },
      },
      's3-1-1-reciprocal-trig-five-subtypes': {
        type: 'drill',
        title: '進階三角比與倒數關係五小類',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311ReciprocalTrigFiveSubtypeMixedSet(5);
        },
      },
      's3-1-1-right-triangle-reciprocal': {
        type: 'drill',
        title: '直角三角形與進階三角比互求',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311RightTriangleReciprocalSubtypeSet(5);
        },
      },
      's3-1-1-reciprocal-from-one-ratio': {
        type: 'drill',
        title: '基本函數與倒數函數的轉化求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311ReciprocalFromOneRatioSubtypeSet(5);
        },
      },
      's3-1-1-reciprocal-identity': {
        type: 'drill',
        title: '倒數關係與分式化簡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311ReciprocalIdentitySubtypeSet(5);
        },
      },
      's3-1-1-reciprocal-comparison': {
        type: 'drill',
        title: '進階三角比的大小比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311ReciprocalComparisonSubtypeSet(5);
        },
      },
      's3-1-1-special-reciprocal': {
        type: 'drill',
        title: '特殊角與代數組合求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS311SpecialReciprocalSubtypeSet(5);
        },
      },
      's3-1-2-double-half-five-subtypes': {
        type: 'drill',
        title: '倍角、半角與萬能代換五小類',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312DoubleHalfFiveSubtypeMixedSet(5);
        },
      },
      's3-1-2-tangent-addition-equation-parameterized': {
        type: 'drill',
        title: '正切和差角：方程與反解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312TangentAdditionEquationParameterizedSet(5);
        },
      },
      's3-1-2-cos-arithmetic-progression-parameterized': {
        type: 'drill',
        title: '餘弦等差數列條件',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312CosArithmeticProgressionParameterizedSet(5);
        },
      },
      's3-1-2-double-from-single': {
        type: 'drill',
        title: '已知單角比值求倍角值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312DoubleFromSingleSubtypeSet(5);
        },
      },
      's3-1-2-half-angle-known-quadrant': {
        type: 'drill',
        title: '已知單角比值與象限求半角值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312HalfAngleKnownSubtypeSet(5);
        },
      },
      's3-1-2-radical-half-simplify': {
        type: 'drill',
        title: '半角公式去根號與根式化簡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312RadicalHalfSimplifySubtypeSet(5);
        },
      },
      's3-1-2-tangent-substitution': {
        type: 'drill',
        title: '萬能公式與正切代換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312TanSubstitutionSubtypeSet(5);
        },
      },
      's3-1-2-quadratic-roots-double': {
        type: 'drill',
        title: '倍角與代數方程式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312QuadraticDoubleHalfSubtypeSet(5);
        },
      },
      's3-1-2-sum-difference-five-subtypes': {
        type: 'drill',
        title: '和差角公式與角度應用五小類',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312SumDifferenceFiveSubtypeMixedSet(5);
        },
      },
      's3-1-2-exact-sum-difference': {
        type: 'drill',
        title: '非特殊角精確值求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312SumDifferenceExactSubtypeSet(5);
        },
      },
      's3-1-2-compound-quadrant': {
        type: 'drill',
        title: '給定值與象限條件的複合求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312CompoundQuadrantSubtypeSet(5);
        },
      },
      's3-1-2-inverse-formula-simplify': {
        type: 'drill',
        title: '倒用公式與化簡運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312InverseFormulaSubtypeSet(5);
        },
      },
      's3-1-2-tangent-line-angle': {
        type: 'drill',
        title: '正切公式與直線夾角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312TanEquationLineAngleSubtypeSet(5);
        },
      },
      's3-1-2-triangle-interior-relations': {
        type: 'drill',
        title: '三角形內角關係應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312TriangleInteriorSubtypeSet(5);
        },
      },
      's3-1-2-triple-angle-five-subtypes': {
        type: 'drill',
        title: '三倍角公式與特殊角五小類',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312TripleAngleFiveSubtypeMixedSet(5);
        },
      },
      's3-1-2-triple-from-single': {
        type: 'drill',
        title: '已知單角比值求三倍角值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312TripleFromSingleSubtypeSet(5);
        },
      },
      's3-1-2-triple-product': {
        type: 'drill',
        title: '三倍角連乘積與數列求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312TripleProductSubtypeSet(5);
        },
      },
      's3-1-2-triple-polynomial': {
        type: 'drill',
        title: '三倍角與多項式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312TriplePolynomialSubtypeSet(5);
        },
      },
      's3-1-2-special-18-36': {
        type: 'drill',
        title: '特殊角 18° 與 36° 推導應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312Special1836SubtypeSet(5);
        },
      },
      's3-1-2-triple-expression': {
        type: 'drill',
        title: '三倍角公式的代數化簡與分式題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312TripleExpressionSubtypeSet(5);
        },
      },
      's3-1-2-geometry-rotation-five-subtypes': {
        type: 'drill',
        title: '三角公式的代數與幾何應用五小類',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312ApplicationFiveSubtypeMixedSet(5);
        },
      },
      's3-1-2-coordinate-rotation': {
        type: 'drill',
        title: '座標旋轉求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312RotationCoordinateSubtypeSet(5);
        },
      },
      's3-1-2-positive-tangent-product': {
        type: 'drill',
        title: '正切定值與連乘積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312PositiveTanProductSubtypeSet(5);
        },
      },
      's3-1-2-sum-difference-algebra': {
        type: 'drill',
        title: '和差角與代數恆等式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312AngleFormulaAlgebraSubtypeSet(5);
        },
      },
      's3-1-2-grid-angle': {
        type: 'drill',
        title: '幾何網格與圖形拼接',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312GridAngleSubtypeSet(5);
        },
      },
      's3-1-2-product-values': {
        type: 'drill',
        title: '倍角與三倍角連乘積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312ProductValuesSubtypeSet(5);
        },
      },
      's3-1-2-sin-cos-sum-square': {
        type: 'drill',
        title: '正弦餘弦和平方求差角餘弦',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS312SinCosSumSquareSubtypeSet(5);
        },
      },
      's3-1-3-period-transform-five-subtypes': {
        type: 'drill',
        title: '三角函數週期、變換與對稱五小類',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313PeriodTransformFiveSubtypeMixedSet(5);
        },
      },
      's3-1-3-linear-sincos-graph-facts-parameterized': {
        type: 'drill',
        title: 'a sin kx + b cos kx 圖形基本量',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313LinearSinCosGraphFactsParameterizedSet(5);
        },
      },
      's3-1-3-peak-valley-function-parameterized': {
        type: 'drill',
        title: '由相鄰最高點與最低點求函數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313PeakValleyFunctionParameterizedSet(5);
        },
      },
      's3-1-3-period-amplitude-basic': {
        type: 'drill',
        title: '週期與振幅判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313PeriodAmplitudeSubtypeSet(5);
        },
      },
      's3-1-3-transform-equation': {
        type: 'drill',
        title: '圖形變換後的函數式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313TransformEquationSubtypeSet(5);
        },
      },
      's3-1-3-symmetry-axis-center': {
        type: 'drill',
        title: '對稱軸與對稱中心判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313SymmetrySubtypeSet(5);
        },
      },
      's3-1-3-absolute-period': {
        type: 'drill',
        title: '含絕對值圖形的週期',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313AbsolutePeriodSubtypeSet(5);
        },
      },
      's3-1-3-monotonic-interval': {
        type: 'drill',
        title: '單調區間分析',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313MonotonicIntervalSubtypeSet(5);
        },
      },
      's3-1-3-range-equation-five-subtypes': {
        type: 'drill',
        title: '三角函數值域、極值與解個數五小類',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313RangeEquationFiveSubtypeMixedSet(5);
        },
      },
      's3-1-3-extrema-range': {
        type: 'drill',
        title: '最大值、最小值與值域',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313ExtremaRangeSubtypeSet(5);
        },
      },
      's3-1-3-restricted-range': {
        type: 'drill',
        title: '限制區間內的值域',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313RestrictedRangeSubtypeSet(5);
        },
      },
      's3-1-3-root-count-graph': {
        type: 'drill',
        title: '圖形交點與方程根數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313RootCountSubtypeSet(5);
        },
      },
      's3-1-3-equation-count-periodic': {
        type: 'drill',
        title: '週期方程式的解個數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313EquationCountSubtypeSet(5);
        },
      },
      's3-1-3-exact-value-comparison': {
        type: 'drill',
        title: '精確求值與大小比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313ExactComparisonSubtypeSet(5);
        },
      },
      's3-1-3-parameter-model-five-subtypes': {
        type: 'drill',
        title: '三角函數參數反推與情境建模五小類',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313ParameterModelFiveSubtypeMixedSet(5);
        },
      },
      's3-1-3-graph-parameter-inference': {
        type: 'drill',
        title: '由最大最小值與週期反推參數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313GraphParameterSubtypeSet(5);
        },
      },
      's3-1-3-peak-valley-parameter': {
        type: 'drill',
        title: '由波峰波谷座標反推函數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313PeakValleySubtypeSet(5);
        },
      },
      's3-1-3-ferris-wheel-model': {
        type: 'drill',
        title: '摩天輪高度函數建模',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313FerrisModelSubtypeSet(5);
        },
      },
      's3-1-3-clock-sector-model': {
        type: 'drill',
        title: '時鐘指針與週期情境',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313ClockPendulumSubtypeSet(5);
        },
      },
      's3-1-3-reverse-transform': {
        type: 'drill',
        title: '反推圖形變換步驟',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS313ReverseTransformSubtypeSet(5);
        },
      },
      's3-1-4-combo-extrema-five-subtypes': {
        type: 'drill',
        title: '疊合公式、值域與極值五小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's3-1-4-basic-combo-extrema',
          's3-1-4-restricted-domain-extrema',
          's3-1-4-quadratic-trig-extrema',
          's3-1-4-substitution-extrema',
          's3-1-4-rational-trig-extrema',
        ],
        generate() {
          return buildS314ComboExtremaFiveSubtypeMixedSet(5);
        },
      },
      's3-1-4-linear-combo-inequality-parameterized': {
        type: 'drill',
        title: '合成後解三角不等式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS314LinearComboInequalityParameterizedSet(5);
        },
      },
      's3-1-4-combo-max-point-tangent-parameterized': {
        type: 'drill',
        title: '合成函數最大點的正切值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS314MaxPointTangentParameterizedSet(5);
        },
      },
      's3-1-4-basic-combo-extrema': {
        type: 'drill',
        title: '基本疊合與最大最小值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS314BasicComboExtremaSubtypeSet(5);
        },
      },
      's3-1-4-restricted-domain-extrema': {
        type: 'drill',
        title: '受限區間內的疊合極值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS314RestrictedRangeSubtypeSet(5);
        },
      },
      's3-1-4-quadratic-trig-extrema': {
        type: 'drill',
        title: '二次三角式降次與極值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS314QuadraticReductionSubtypeSet(5);
        },
      },
      's3-1-4-substitution-extrema': {
        type: 'drill',
        title: '換元法與疊合極值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS314SubstitutionSubtypeSet(5);
        },
      },
      's3-1-4-rational-trig-extrema': {
        type: 'drill',
        title: '分式型三角函數極值',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS314FractionalExtremaSubtypeSet(5);
        },
      },
      's3-1-4-parameter-equation-model-five-subtypes': {
        type: 'drill',
        title: '疊合參數反推、解角與建模五小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's3-1-4-parameter-inverse',
          's3-1-4-equation-solving',
          's3-1-4-combo-form-conversion',
          's3-1-4-wave-model',
          's3-1-4-geometry-model',
        ],
        generate() {
          return buildS314InverseModelFiveSubtypeMixedSet(5);
        },
      },
      's3-1-4-parameter-inverse': {
        type: 'drill',
        title: '由極值與週期反推係數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS314ParameterInverseSubtypeSet(5);
        },
      },
      's3-1-4-equation-solving': {
        type: 'drill',
        title: '疊合方程式求角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS314EquationSolvingSubtypeSet(5);
        },
      },
      's3-1-4-combo-form-conversion': {
        type: 'drill',
        title: '轉換成指定正弦或餘弦形式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS314CombineFormSubtypeSet(5);
        },
      },
      's3-1-4-wave-model': {
        type: 'drill',
        title: '雙波疊合與最大位移',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS314WaveModelSubtypeSet(5);
        },
      },
      's3-1-4-geometry-model': {
        type: 'drill',
        title: '幾何圖形中的疊合應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS314GeometryModelSubtypeSet(5);
        },
      },
      's3-1-4-trig-inequality-parameterized': {
        type: 'drill',
        title: '三角不等式在[0,2π)的解集',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS314TrigInequalityParameterizedSubtypeSet(5);
        },
      },
      's3-1-4-inverse-trig-eval': {
        type: 'drill',
        title: '反三角函數值計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS314InverseTrigEvalSubtypeSet(5);
        },
      },
      's3-2-1-power-root-comparison-clean': {
        type: 'drill',
        title: '指數根式大小比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321PowerRootComparisonCleanSet(5);
        },
      },
      's3-2-1-exponential-integer-count-clean': {
        type: 'drill',
        title: '指數不等式的整數解個數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321ExponentialIntegerCountCleanSet(5);
        },
      },
      's3-2-1-exponential-graph-parameter-clean': {
        type: 'drill',
        title: '由漸近線與兩點求指數函數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321ExponentialGraphParameterCleanSet(5);
        },
      },
      's3-2-1-exponent-laws-equations-five-subtypes': {
        type: 'drill',
        title: '指數律、方程與應用五小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's3-2-1-exponent-law-simplification',
          's3-2-1-size-comparison',
          's3-2-1-exponential-equations',
          's3-2-1-exponential-inequalities',
          's3-2-1-growth-decay-applications',
        ],
        generate() {
          return buildS321BasicFiveSubtypeMixedSet(5);
        },
      },
      's3-2-1-exponent-law-simplification': {
        type: 'drill',
        title: '指數律基本運算與化簡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321ExponentLawSubtypeSet(5);
        },
      },
      's3-2-1-size-comparison': {
        type: 'drill',
        title: '指數式大小比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321SizeComparisonSubtypeSet(5);
        },
      },
      's3-2-1-exponential-equations': {
        type: 'drill',
        title: '指數方程式求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321EquationSubtypeSet(5);
        },
      },
      's3-2-1-exponential-inequalities': {
        type: 'drill',
        title: '指數不等式解法',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321InequalitySubtypeSet(5);
        },
      },
      's3-2-1-growth-decay-applications': {
        type: 'drill',
        title: '指數模型增殖與衰變應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321ApplicationSubtypeSet(5);
        },
      },
      's3-2-1-graphs-extrema-five-subtypes': {
        type: 'drill',
        title: '指數函數圖形、變換與極值五小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's3-2-1-graph-features',
          's3-2-1-graph-transformations',
          's3-2-1-composite-extrema',
          's3-2-1-amgm-extrema',
          's3-2-1-advanced-comparison',
        ],
        generate() {
          return buildS321GraphExtremaFiveSubtypeMixedSet(5);
        },
      },
      's3-2-1-graph-features': {
        type: 'drill',
        title: '指數函數圖形特徵辨識',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321GraphFeatureSubtypeSet(5);
        },
      },
      's3-2-1-graph-transformations': {
        type: 'drill',
        title: '指數函數圖形平移鏡射伸縮',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321GraphTransformSubtypeSet(5);
        },
      },
      's3-2-1-composite-extrema': {
        type: 'drill',
        title: '複合指數函數配方極值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321CompositeExtremaSubtypeSet(5);
        },
      },
      's3-2-1-amgm-extrema': {
        type: 'drill',
        title: '算幾不等式與指數極值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321AdvancedInequalitySubtypeSet(5);
        },
      },
      's3-2-1-advanced-comparison': {
        type: 'drill',
        title: '單調性與進階大小比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321AdvancedComparisonSubtypeSet(5);
        },
      },
      's3-2-1-advanced-algebra-five-subtypes': {
        type: 'drill',
        title: '指數函數進階代數與反推五小類',
        difficulty: 'hard',
        questionCount: 5,
        subtypes: [
          's3-2-1-functional-equations',
          's3-2-1-symmetric-expressions',
          's3-2-1-hyperbolic-fraction',
          's3-2-1-root-count-graph',
          's3-2-1-parameter-from-graph',
        ],
        generate() {
          return buildS321AdvancedAlgebraFiveSubtypeMixedSet(5);
        },
      },
      's3-2-1-functional-equations': {
        type: 'drill',
        title: '指數函數方程式與恆等判別',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321FunctionalEquationSubtypeSet(5);
        },
      },
      's3-2-1-symmetric-expressions': {
        type: 'drill',
        title: '對稱和式與代數變形',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321SymmetricExpressionSubtypeSet(5);
        },
      },
      's3-2-1-hyperbolic-fraction': {
        type: 'drill',
        title: '指數分式函數求值與範圍',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321HyperbolicFunctionSubtypeSet(5);
        },
      },
      's3-2-1-hyperbolic-compose-parameterized': {
        type: 'drill',
        title: '指數分式函數合成求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321HyperbolicComposeParameterizedSet(5);
        },
      },
      's3-2-1-root-count-graph': {
        type: 'drill',
        title: '指數方程實根個數判定',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS321IntersectionRootCountSubtypeSet(5);
        },
      },
      's3-2-1-parameter-from-graph': {
        type: 'drill',
        title: '圖形特徵反推參數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321ParameterFromGraphSubtypeSet(5);
        },
      },
      's3-2-1-diff-base-exp-equation': {
        type: 'drill',
        title: '不同底數指數方程取對數求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS321DiffBaseExpEquationSubtypeSet(5);
        },
      },
      's3-2-2-dominant-log-approx-clean': {
        type: 'drill',
        title: '對數估算：和式的主導項',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322DominantLogApproxCleanSet(5);
        },
      },
      's3-2-2-log-domain-integer-count-clean': {
        type: 'drill',
        title: '對數定義域的整數解個數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322LogDomainIntegerCountCleanSet(5);
        },
      },
      's3-2-2-chain-change-base-clean': {
        type: 'drill',
        title: '連鎖換底與複合底數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322ChainChangeBaseCleanSet(5);
        },
      },
      's3-2-2-log-definition-laws-five-subtypes': {
        type: 'drill',
        title: '對數定義、運算與代換五小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's3-2-2-log-definition-values',
          's3-2-2-log-law-simplification',
          's3-2-2-known-log-substitution',
          's3-2-2-basic-log-equations',
          's3-2-2-log-domain-conditions',
        ],
        generate() {
          return buildS322BasicMixedSet(5);
        },
      },
      's3-2-2-log-definition-values': {
        type: 'drill',
        title: '對數定義與基本求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322DefinitionSubtypeSet(5);
        },
      },
      's3-2-2-log-law-simplification': {
        type: 'drill',
        title: '對數律化簡與綜合運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322LawSimplificationSubtypeSet(5);
        },
      },
      's3-2-2-known-log-substitution': {
        type: 'drill',
        title: '已知 log 2、log 3 的代換求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322SubstitutionSubtypeSet(5);
        },
      },
      's3-2-2-basic-log-equations': {
        type: 'drill',
        title: '基礎對數方程式求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322BasicEquationSubtypeSet(5);
        },
      },
      's3-2-2-log-domain-conditions': {
        type: 'drill',
        title: '對數定義域與有意義條件',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322DomainSubtypeSet(5);
        },
      },
      's3-2-2-log-inequalities-domain-five-subtypes': {
        type: 'drill',
        title: '對數不等式、定義域與進階方程五小類',
        difficulty: 'hard',
        questionCount: 5,
        subtypes: [
          's3-2-2-monotone-log-inequalities',
          's3-2-2-log-law-inequalities',
          's3-2-2-quadratic-log-inequalities',
          's3-2-2-nested-log-conditions',
          's3-2-2-unknown-base-domain',
        ],
        generate() {
          return buildS322InequalityMixedSet(5);
        },
      },
      's3-2-2-monotone-log-inequalities': {
        type: 'drill',
        title: '基礎同底比較型不等式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322MonotoneInequalitySubtypeSet(5);
        },
      },
      's3-2-2-log-law-inequalities': {
        type: 'drill',
        title: '對數律化簡與變底比較型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322LawInequalitySubtypeSet(5);
        },
      },
      's3-2-2-quadratic-log-inequalities': {
        type: 'drill',
        title: '代換二次式型對數不等式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322QuadraticLogInequalitySubtypeSet(5);
        },
      },
      's3-2-2-nested-log-conditions': {
        type: 'drill',
        title: '多重對數型有意義條件',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS322NestedLogSubtypeSet(5);
        },
      },
      's3-2-2-unknown-base-domain': {
        type: 'drill',
        title: '底數含未知數的定義域限制',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS322UnknownBaseDomainSubtypeSet(5);
        },
      },
      's3-2-2-log-advanced-applications-five-subtypes': {
        type: 'drill',
        title: '對數連鎖、極值與位數應用五小類',
        difficulty: 'hard',
        questionCount: 5,
        subtypes: [
          's3-2-2-chain-product-logs',
          's3-2-2-exponent-position-exchange',
          's3-2-2-log-amgm-extrema',
          's3-2-2-digit-scientific-notation',
          's3-2-2-radical-rational-base',
        ],
        generate() {
          return buildS322AdvancedMixedSet(5);
        },
      },
      's3-2-2-chain-product-logs': {
        type: 'drill',
        title: '對數連鎖律與連乘積運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322ChainProductSubtypeSet(5);
        },
      },
      's3-2-2-exponent-position-exchange': {
        type: 'drill',
        title: '對數在指數位置的交換性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322ExponentPositionSubtypeSet(5);
        },
      },
      's3-2-2-log-amgm-extrema': {
        type: 'drill',
        title: '結合算幾不等式的對數極值',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS322LogExtremaSubtypeSet(5);
        },
      },
      's3-2-2-digit-scientific-notation': {
        type: 'drill',
        title: '對數與科學記號的位數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322DigitScientificSubtypeSet(5);
        },
      },
      's3-2-2-radical-rational-base': {
        type: 'drill',
        title: '底數與真數含次方根的綜合化簡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322RadicalBaseSubtypeSet(5);
        },
      },
      's3-2-2-change-base-log-equation': {
        type: 'drill',
        title: '換底多基對數方程求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322ChangeBaseLogEquationSubtypeSet(5);
        },
      },
      's3-2-2-special-log-equation': {
        type: 'drill',
        title: '對數二次方程與變底方程',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322SpecialLogEquationSubtypeSet(5);
        },
      },
      's3-2-2-diff-base-log-inequality': {
        type: 'drill',
        title: '不同底數與倒數對數不等式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS322DiffBaseLogInequalitySubtypeSet(5);
        },
      },
      's3-2-3-log-point-transform-clean': {
        type: 'drill',
        title: '對數圖形上的點變換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS323LogPointTransformCleanSet(5);
        },
      },
      's3-2-3-log-base-order-clean': {
        type: 'drill',
        title: '由對數大小判斷底數範圍',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS323LogBaseOrderCleanSet(5);
        },
      },
      's3-2-3-log-operations-applications-five-subtypes': {
        type: 'drill',
        title: '對數連鎖、次方位置與位數應用五小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's3-2-3-chain-product-logs',
          's3-2-3-exponent-position-exchange',
          's3-2-3-radical-rational-base',
          's3-2-3-digit-scientific-notation',
          's3-2-3-log-identity-extrema',
        ],
        generate() {
          return buildS323OperationsMixedSet(5);
        },
      },
      's3-2-3-chain-product-logs': {
        type: 'drill',
        title: '對數連鎖律與連乘積運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS323ChainProductSubtypeSet(5);
        },
      },
      's3-2-3-exponent-position-exchange': {
        type: 'drill',
        title: '對數在指數位置的交換性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS323ExponentPositionSubtypeSet(5);
        },
      },
      's3-2-3-radical-rational-base': {
        type: 'drill',
        title: '底數與真數含次方根的綜合化簡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS323RadicalBaseSubtypeSet(5);
        },
      },
      's3-2-3-digit-scientific-notation': {
        type: 'drill',
        title: '對數與科學記號的位數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS323DigitScientificSubtypeSet(5);
        },
      },
      's3-2-3-log-identity-extrema': {
        type: 'drill',
        title: '結合算幾不等式的對數極值',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS323LogIdentityExtremaSubtypeSet(5);
        },
      },
      's3-2-3-log-graphs-equations-five-subtypes': {
        type: 'drill',
        title: '對數函數圖形、方程與反函數五小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's3-2-3-domain-and-features',
          's3-2-3-transformations-reflections',
          's3-2-3-log-comparison',
          's3-2-3-equation-root-count',
          's3-2-3-inverse-functions',
        ],
        generate() {
          return buildS323GraphMixedSet(5);
        },
      },
      's3-2-3-domain-and-features': {
        type: 'drill',
        title: '對數函數的定義域與圖形特徵',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS323DomainFeatureSubtypeSet(5);
        },
      },
      's3-2-3-transformations-reflections': {
        type: 'drill',
        title: '函數圖形的平移與對稱變換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS323TransformSubtypeSet(5);
        },
      },
      's3-2-3-log-comparison': {
        type: 'drill',
        title: '對數式的大小比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS323ComparisonSubtypeSet(5);
        },
      },
      's3-2-3-equation-root-count': {
        type: 'drill',
        title: '對數方程式求解與實根個數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS323EquationRootSubtypeSet(5);
        },
      },
      's3-2-3-inverse-functions': {
        type: 'drill',
        title: '對數與指數的反函數關係',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS323InverseSubtypeSet(5);
        },
      },
      's3-2-3-log-extrema-models-five-subtypes': {
        type: 'drill',
        title: '對數極值、凹性與模型應用五小類',
        difficulty: 'hard',
        questionCount: 5,
        subtypes: [
          's3-2-3-jensen-midpoint',
          's3-2-3-modeling-applications',
          's3-2-3-absolute-log-graphs',
          's3-2-3-log-extrema-review',
          's3-2-3-digit-application-review',
        ],
        generate() {
          return buildS323ApplicationMixedSet(5);
        },
      },
      's3-2-3-jensen-midpoint': {
        type: 'drill',
        title: '對數圖形的凹性與中點不等式',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS323JensenSubtypeSet(5);
        },
      },
      's3-2-3-modeling-applications': {
        type: 'drill',
        title: '對數函數的素養建模應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS323ModelingSubtypeSet(5);
        },
      },
      's3-2-3-absolute-log-graphs': {
        type: 'drill',
        title: '含絕對值的對數圖形分析',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS323AbsoluteLogSubtypeSet(5);
        },
      },
      's3-2-3-log-extrema-review': {
        type: 'drill',
        title: '對數極值與不等式複習',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS323LogExtremaReviewSubtypeSet(5);
        },
      },
      's3-2-3-digit-application-review': {
        type: 'drill',
        title: '位數與科學記號應用複習',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS323DigitApplicationReviewSubtypeSet(5);
        },
      },
      's3-2-3-log-parity-range': {
        type: 'drill',
        title: '對數函數奇偶性與值域分析',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS323LogParityRangeSubtypeSet(5);
        },
      },
      's3-2-3-power-log-equation': {
        type: 'drill',
        title: '冪對數方程 x^(log x) 型求解',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS323PowerLogEquationSubtypeSet(5);
        },
      },
      's3-2-4-growth-threshold-clean': {
        type: 'drill',
        title: '指數成長衰退的門檻時間',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS324GrowthThresholdCleanSet(5);
        },
      },
      's3-2-4-log-scale-ratio-clean': {
        type: 'drill',
        title: '對數尺度的倍率判讀',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS324LogScaleRatioCleanSet(5);
        },
      },
      's3-2-4-compound-inference-clean': {
        type: 'drill',
        title: '固定倍率成長的倍期推算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS324CompoundInferenceCleanSet(5);
        },
      },
      's3-2-4-growth-decay-models-five-subtypes': {
        type: 'drill',
        title: '指數成長衰減與時間模型五小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's3-2-4-growth-decay',
          's3-2-4-newton-cooling',
          's3-2-4-light-filters',
          's3-2-4-information-spreading',
          's3-2-4-learning-forgetting',
        ],
        generate() {
          return buildS324GrowthMixedSet(5);
        },
      },
      's3-2-4-growth-decay': {
        type: 'drill',
        title: '生物增殖與放射性衰變',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS324GrowthDecaySubtypeSet(5);
        },
      },
      's3-2-4-newton-cooling': {
        type: 'drill',
        title: '牛頓冷卻與溫度變化建模',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS324CoolingSubtypeSet(5);
        },
      },
      's3-2-4-light-filters': {
        type: 'drill',
        title: '光線穿透與濾鏡衰減模型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS324LightFilterSubtypeSet(5);
        },
      },
      's3-2-4-information-spreading': {
        type: 'drill',
        title: '訊息傳播與擴散模型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS324InformationSubtypeSet(5);
        },
      },
      's3-2-4-learning-forgetting': {
        type: 'drill',
        title: '遺忘曲線與學習成效',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS324LearningSubtypeSet(5);
        },
      },
      's3-2-4-log-scale-science-five-subtypes': {
        type: 'drill',
        title: '對數尺度與科學量級五小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's3-2-4-scientific-log-scales',
          's3-2-4-perception-magnitude',
          's3-2-4-sound-source-addition',
          's3-2-4-earthquake-energy',
          's3-2-4-log-linear-modeling',
        ],
        generate() {
          return buildS324LogScaleMixedSet(5);
        },
      },
      's3-2-4-scientific-log-scales': {
        type: 'drill',
        title: '科學尺度與感官量級應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS324LogScaleScienceSubtypeSet(5);
        },
      },
      's3-2-4-perception-magnitude': {
        type: 'drill',
        title: '心理物理學與感官量級',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS324PerceptionSubtypeSet(5);
        },
      },
      's3-2-4-sound-source-addition': {
        type: 'drill',
        title: '多聲源分貝疊加',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS324SoundAdditionSubtypeSet(5);
        },
      },
      's3-2-4-earthquake-energy': {
        type: 'drill',
        title: '地震規模與震幅能量轉換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS324EarthquakeSubtypeSet(5);
        },
      },
      's3-2-4-log-linear-modeling': {
        type: 'drill',
        title: '斜率與經驗公式的對數線性化',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS324LogLinearSubtypeSet(5);
        },
      },
      's3-2-4-finance-digits-models-five-subtypes': {
        type: 'drill',
        title: '複利財務、位數與特殊分配五小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's3-2-4-compound-finance',
          's3-2-4-amortization-mortgage',
          's3-2-4-digit-place-leading',
          's3-2-4-temporal-proportionality',
          's3-2-4-special-distribution-laws',
        ],
        generate() {
          return buildS324FinanceModelMixedSet(5);
        },
      },
      's3-2-4-compound-finance': {
        type: 'drill',
        title: '複利與理財規劃',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS324FinanceSubtypeSet(5);
        },
      },
      's3-2-4-amortization-mortgage': {
        type: 'drill',
        title: '分期付款與房貸模型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS324MortgageSubtypeSet(5);
        },
      },
      's3-2-4-digit-place-leading': {
        type: 'drill',
        title: '大數位數與小數非零位判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS324DigitSubtypeSet(5);
        },
      },
      's3-2-4-temporal-proportionality': {
        type: 'drill',
        title: '比例對稱性與時間相加性',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS324TemporalSubtypeSet(5);
        },
      },
      's3-2-4-special-distribution-laws': {
        type: 'drill',
        title: '克卜勒、班佛法則與特殊分配',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS324SpecialDistributionSubtypeSet(5);
        },
      },
      's3-3-1-barycentric-interior-clean': {
        type: 'drill',
        title: '三角形內部的向量係數條件',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331BarycentricInteriorCleanSet(5);
        },
      },
      's3-3-1-area-ratio-coefficient-clean': {
        type: 'drill',
        title: '由向量係數求三角形面積比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331AreaRatioCoefficientCleanSet(5);
        },
      },
      's3-3-1-segment-section-clean': {
        type: 'drill',
        title: '線段內分點的向量表示',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331SegmentSectionCleanSet(5);
        },
      },
      's3-3-1-vector-algebra-relations-five-subtypes': {
        type: 'drill',
        title: '向量代數與線性關係五小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's3-3-1-coordinate-length',
          's3-3-1-parallel-collinear',
          's3-3-1-linear-combination',
          's3-3-1-vector-chain-simplify',
          's3-3-1-vector-equations',
        ],
        generate() {
          return buildS331VectorAlgebraMixedSet(5);
        },
      },
      's3-3-1-coordinate-length': {
        type: 'drill',
        title: '向量坐標運算與長度計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331CoordinateLengthSet(5);
        },
      },
      's3-3-1-parallel-collinear': {
        type: 'drill',
        title: '兩向量平行與三點共線判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331ParallelCollinearSet(5);
        },
      },
      's3-3-1-linear-combination': {
        type: 'drill',
        title: '向量線性組合與係數求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331LinearCombinationSet(5);
        },
      },
      's3-3-1-vector-chain-simplify': {
        type: 'drill',
        title: '向量鏈化簡與單一向量表示',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331VectorChainSet(5);
        },
      },
      's3-3-1-vector-equations': {
        type: 'drill',
        title: '向量方程式求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331VectorEquationSet(5);
        },
      },
      's3-3-1-vector-geometry-applications-five-subtypes': {
        type: 'drill',
        title: '幾何分點、區域與應用五小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's3-3-1-section-ratio',
          's3-3-1-unit-direction',
          's3-3-1-polygon-vector-count',
          's3-3-1-linear-combination-region',
          's3-3-1-physics-components',
        ],
        generate() {
          return buildS331VectorGeometryMixedSet(5);
        },
      },
      's3-3-1-geometric-vectors-five-subtypes': {
        type: 'drill',
        title: '幾何向量九小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's3-3-1-triangle-section-centers',
          's3-3-1-area-ratio-vectors',
          's3-3-1-quadrilateral-decomposition',
          's3-3-1-triangle-center-ratios',
          's3-3-1-triangle-area-coefficient-advanced',
          's3-3-1-triangle-centers-linear-combination',
          's3-3-1-polygon-chain-count',
          's3-3-1-polyhedron-vector-count',
          's3-3-1-geometric-grid-combination',
        ],
        generate() {
          return buildS331GeometricVectorsMixedSet(5);
        },
      },
      's3-3-1-section-ratio': {
        type: 'drill',
        title: '幾何圖形中的分點公式與比例應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331SectionRatioSet(5);
        },
      },
      's3-3-1-unit-direction': {
        type: 'drill',
        title: '單位向量與方向角轉換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331UnitDirectionSet(5);
        },
      },
      's3-3-1-polygon-vector-count': {
        type: 'drill',
        title: '多邊形頂點所決定的向量計數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331PolygonVectorCountSet(5);
        },
      },
      's3-3-1-linear-combination-region': {
        type: 'drill',
        title: '線性組合係數限制下的區域判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331RegionSet(5);
        },
      },
      's3-3-1-physics-components': {
        type: 'drill',
        title: '物理力學與靜態平衡應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331PhysicsSet(5);
        },
      },
      's3-3-1-triangle-section-centers': {
        type: 'drill',
        title: '三角形分點與心點向量',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331TriangleSectionCenterSet(5);
        },
      },
      's3-3-1-area-ratio-vectors': {
        type: 'drill',
        title: '面積比與向量係數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331AreaRatioVectorSet(5);
        },
      },
      's3-3-1-quadrilateral-decomposition': {
        type: 'drill',
        title: '四邊形分點與向量分解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331QuadrilateralDecompositionSet(5);
        },
      },
      's3-3-1-triangle-center-ratios': {
        type: 'drill',
        title: '三角形心點與比例向量',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331TriangleCenterRatioSet(5);
        },
      },
      's3-3-1-triangle-area-coefficient-advanced': {
        type: 'drill',
        title: '三角形面積係數關係',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS331TriangleAreaCoefficientAdvancedSet(5);
        },
      },
      's3-3-1-triangle-centers-linear-combination': {
        type: 'drill',
        title: '三角形心點線性組合',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS331TriangleCenterLinearCombinationSet(5);
        },
      },
      's3-3-1-polygon-chain-count': {
        type: 'drill',
        title: '多邊形向量鏈與有向線段計數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331PolygonChainCountGeometrySet(5);
        },
      },
      's3-3-1-polyhedron-vector-count': {
        type: 'drill',
        title: '多邊形與立體頂點向量計數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331PolyhedronVectorCountSet(5);
        },
      },
      's3-3-1-geometric-grid-combination': {
        type: 'drill',
        title: '幾何格線中的線性組合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS331GeometricGridCombinationSet(5);
        },
      },
      's3-3-2-projection-equality-clean': {
        type: 'drill',
        title: '正射影相等求參數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS332ProjectionEqualityCleanSet(5);
        },
      },
      's3-3-2-parametric-min-length-clean': {
        type: 'drill',
        title: '參數向量長度最小值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS332ParametricMinLengthCleanSet(5);
        },
      },
      's3-3-2-region-area-clean': {
        type: 'drill',
        title: '座標向量係數區域面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS332RegionAreaCleanSet(5);
        },
      },
      's3-3-2-coordinate-vectors-five-subtypes': {
        type: 'drill',
        title: '座標向量九小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's3-3-2-coordinate-operations-length',
          's3-3-2-parallel-collinear-parameters',
          's3-3-2-linear-combination-equations',
          's3-3-2-direction-components',
          's3-3-2-applications-projection-motion',
          's3-3-2-coordinate-section-ratio',
          's3-3-2-parametric-line-extrema',
          's3-3-2-coordinate-point-synthesis',
          's3-3-2-projection-extrema-lattice',
        ],
        generate() {
          return buildS332CoordinateVectorsMixedSet(5);
        },
      },
      's3-3-2-coordinate-operations-length': {
        type: 'drill',
        title: '座標運算與長度計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS332CoordinateOperationLengthSet(5);
        },
      },
      's3-3-2-parallel-collinear-parameters': {
        type: 'drill',
        title: '平行共線與參數求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS332ParallelCollinearParameterSet(5);
        },
      },
      's3-3-2-linear-combination-equations': {
        type: 'drill',
        title: '線性組合與向量方程式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS332LinearCombinationEquationSet(5);
        },
      },
      's3-3-2-direction-components': {
        type: 'drill',
        title: '方向角、分量與單位向量',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS332DirectionComponentsSet(5);
        },
      },
      's3-3-2-applications-projection-motion': {
        type: 'drill',
        title: '座標應用、投影與運動分量',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS332ApplicationsProjectionMotionSet(5);
        },
      },
      's3-3-2-coordinate-section-ratio': {
        type: 'drill',
        title: '內外分點與線段比例',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS332CoordinateSectionRatioSet(5);
        },
      },
      's3-3-2-parametric-line-extrema': {
        type: 'drill',
        title: '直線參數式與極值',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS332ParametricLineExtremaSet(5);
        },
      },
      's3-3-2-coordinate-point-synthesis': {
        type: 'drill',
        title: '點坐標與向量合成',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS332CoordinatePointSynthesisSet(5);
        },
      },
      's3-3-2-projection-extrema-lattice': {
        type: 'drill',
        title: '投影、線段格點與長度極值',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS332ProjectionExtremaLatticeSet(5);
        },
      },
      's3-3-2-line-direction-normal': {
        type: 'drill',
        title: '直線方向向量、法向量與平行垂直方程式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS332LineDirectionNormalSet(5);
        },
      },
      's3-3-2-line-angle-vector-parameterized': {
        type: 'drill',
        title: '兩直線交角（法向量／方向向量內積）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS332LineAngleVectorParameterizedSet(5);
        },
      },
      's3-3-2-triangle-center-coordinate-parameterized': {
        type: 'drill',
        title: '由頂點坐標求垂心與外心坐標',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS332TriangleCenterCoordinateParameterizedSet(5);
        },
      },
      's3-3-3-triangle-side-dot-clean': {
        type: 'drill',
        title: '由三邊長求向量內積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS333TriangleSideDotCleanSet(5);
        },
      },
      's3-3-3-projection-vector-clean': {
        type: 'drill',
        title: '座標向量的正射影向量',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS333ProjectionVectorCleanSet(5);
        },
      },
      's3-3-3-norm-relation-angle-clean': {
        type: 'drill',
        title: '由長度關係求夾角餘弦',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS333NormRelationAngleCleanSet(5);
        },
      },
      's3-3-3-inner-product-projection-applications-ten-subtypes': {
        type: 'drill',
        title: '內積、投影與應用十小類',
        difficulty: 'hard',
        questionCount: 5,
        subtypes: [
          's3-3-3-dot-basic-computation',
          's3-3-3-angle-dot-product',
          's3-3-3-perpendicular-parameter',
          's3-3-3-norm-algebra',
          's3-3-3-projection-length',
          's3-3-3-projection-vector',
          's3-3-3-cauchy-extrema',
          's3-3-3-distance-line-projection',
          's3-3-3-area-inner-product',
          's3-3-3-work-area-applications',
        ],
        generate() {
          return buildS333InnerProductMixedSet(5);
        },
      },
      's3-3-3-dot-basic-computation': {
        type: 'drill',
        title: '內積基本計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS333DotBasicSet(5);
        },
      },
      's3-3-3-angle-dot-product': {
        type: 'drill',
        title: '向量夾角判定與計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS333AngleSet(5);
        },
      },
      's3-3-3-perpendicular-parameter': {
        type: 'drill',
        title: '垂直條件與參數求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS333PerpendicularParameterSet(5);
        },
      },
      's3-3-3-norm-algebra': {
        type: 'drill',
        title: '向量和差長度與運算性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS333NormAlgebraSet(5);
        },
      },
      's3-3-3-projection-length': {
        type: 'drill',
        title: '正射影長度與射影量',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS333ProjectionLengthSet(5);
        },
      },
      's3-3-3-projection-vector': {
        type: 'drill',
        title: '正射影向量與分解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS333ProjectionVectorSet(5);
        },
      },
      's3-3-3-cauchy-extrema': {
        type: 'drill',
        title: '柯西不等式與極值',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS333CauchyExtremaSet(5);
        },
      },
      's3-3-3-distance-line-projection': {
        type: 'drill',
        title: '點到直線距離與投影',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS333DistanceLineSet(5);
        },
      },
      's3-3-3-area-inner-product': {
        type: 'drill',
        title: '內積與面積計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS333AreaInnerProductSet(5);
        },
      },
      's3-3-3-work-area-applications': {
        type: 'drill',
        title: '作功與幾何面積應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS333WorkAreaApplicationSet(5);
        },
      },
      's3-3-3-triangle-angle-cosine': {
        type: 'drill',
        title: '三角形頂角餘弦與三角形類型判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS333TriangleAngleCosineSet(5);
        },
      },
      's3-3-3-vector-from-dot-constraints': {
        type: 'drill',
        title: '由兩個內積條件解向量',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS333VectorFromDotConstraintsSet(5);
        },
      },
      's3-3-3-norm-relation-condition': {
        type: 'drill',
        title: '向量和差長度條件推夾角關係',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS333NormRelationConditionSet(5);
        },
      },
      's3-3-4-determinant-operation-clean': {
        type: 'drill',
        title: '二階行列式列運算性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS334DeterminantOperationCleanSet(5);
        },
      },
      's3-3-4-cramer-parameter-clean': {
        type: 'drill',
        title: '參數方程組的無限多解與無解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS334CramerParameterCleanSet(5);
        },
      },
      's3-3-4-area-scale-clean': {
        type: 'drill',
        title: '線性變換的面積倍率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS334AreaScaleCleanSet(5);
        },
      },
      's3-3-4-basic-determinant-three-subtypes': {
        type: 'drill',
        title: '行列式基本三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: [
          's3-3-4-basic-determinants',
          's3-3-4-determinant-properties',
          's3-3-4-special-algebraic-determinants',
        ],
        generate() {
          return buildS334BasicMixedSet(5);
        },
      },
      's3-3-4-cramer-parameter-three-subtypes': {
        type: 'drill',
        title: '克拉瑪與參數判定三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s3-3-4-cramer-systems', 's3-3-4-parallel-collinear-regions', 's3-3-4-collinear-parameters'],
        generate() {
          return buildS334CramerMixedSet(5);
        },
      },
      's3-3-4-area-transform-three-subtypes': {
        type: 'drill',
        title: '行列式面積三小類',
        difficulty: 'medium',
        questionCount: 5,
        subtypes: ['s3-3-4-area-determinants', 's3-3-4-transformed-area', 's3-3-4-triangle-area-ratios'],
        generate() {
          return buildS334AreaMixedSet(5);
        },
      },
      's3-3-4-basic-determinants': {
        type: 'drill',
        title: '二階行列式基本求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS334BasicDeterminantSet(5);
        },
      },
      's3-3-4-determinant-properties': {
        type: 'drill',
        title: '行列式運算性質',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS334DeterminantPropertiesSet(5);
        },
      },
      's3-3-4-cramer-systems': {
        type: 'drill',
        title: '克拉瑪公式與方程組',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS334CramerSystemSet(5);
        },
      },
      's3-3-4-area-determinants': {
        type: 'drill',
        title: '幾何圖形的面積計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS334AreaDeterminantSet(5);
        },
      },
      's3-3-4-parallel-collinear-regions': {
        type: 'drill',
        title: '平行、共線與頂點推算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS334ParallelCollinearRegionSet(5);
        },
      },
      's3-3-4-transformed-area': {
        type: 'drill',
        title: '向量張成區域的面積變換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS334TransformedAreaSet(5);
        },
      },
      's3-3-4-triangle-area-ratios': {
        type: 'drill',
        title: '三角形內部點面積比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS334TriangleAreaRatioSet(5);
        },
      },
      's3-3-4-collinear-parameters': {
        type: 'drill',
        title: '三點共線的參數求解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildS334CollinearParameterSet(5);
        },
      },
      's3-3-4-special-algebraic-determinants': {
        type: 'drill',
        title: '特殊函數與複雜項行列式',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildS334SpecialAlgebraSet(5);
        },
      },
  };

  const bundleFingerprint = "s3-bundle-v20260706-summary-v1";
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== "object") return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
