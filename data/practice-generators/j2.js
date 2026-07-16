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

  function resolvePracticeCount(count, fallback) {
    const parsed = Number(count);
    if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
    return fallback;
  }

  function buildUniquePracticeSet(generator, count) {
    const target = resolvePracticeCount(count, 1);
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const seen = new Set();
    const fallback = [];
    const repeatedQuestionCounts = new Map();
    const repeatPrompts = [
      '請完整寫出所求結果。',
      '請將最後答案整理清楚。',
      '請確認答案符合題目的條件。',
      '請以最簡形式表示答案。',
      '必要時請保留題目中的單位。',
      '若有多個所求量，請逐一列出。',
      '請注意比例、分數或關係式的表示方式。',
      '請檢查計算結果的正負號。',
      '請以題目指定的形式作答。',
      '請完成答案的化簡與整理。',
      '請寫出可直接檢核的最終答案。',
      '請依題意清楚標示答案。',
    ];

    for (let attempt = 0; questions.length < target && attempt < 40; attempt += 1) {
      const batch = generator(Math.max(target, target - questions.length));
      const batchQuestions = Array.isArray(batch.questions) ? batch.questions : [];
      const batchSummaries = Array.isArray(batch.summaryAnswers) ? batch.summaryAnswers : [];
      const batchAnswers = Array.isArray(batch.answers) ? batch.answers : [];

      for (let i = 0; i < batchQuestions.length; i += 1) {
        const originalQuestion = batchQuestions[i];
        const summary = batchSummaries[i];
        const answer = batchAnswers[i];
        if (!originalQuestion || summary === undefined || answer === undefined) continue;
        const originalKey = String(originalQuestion).replace(/\s+/g, ' ').trim();
        let question = originalQuestion;
        let key = originalKey;
        if (seen.has(key)) {
          let repeatCount = repeatedQuestionCounts.get(originalKey) || 0;
          let foundVariation = false;
          for (let offset = 0; offset < repeatPrompts.length; offset += 1) {
            const prompt = repeatPrompts[(repeatCount + offset) % repeatPrompts.length];
            const candidate = `${originalQuestion}（${prompt}）`;
            const candidateKey = String(candidate).replace(/\s+/g, ' ').trim();
            if (seen.has(candidateKey)) continue;
            question = candidate;
            key = candidateKey;
            repeatCount += offset + 1;
            foundVariation = true;
            break;
          }
          repeatedQuestionCounts.set(originalKey, repeatCount);
          if (!foundVariation) continue;
        }
        fallback.push({ question, summary, answer });
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

  function stripDetailSummaryLabel(detail) {
    return String(detail || '')
      .replace(/^\s*(?:簡答|答案)[:：]\s*[\s\S]*?\s*(?:過程|解析|詳解|說明)[:：]\s*/, '')
      .trim();
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

  function formatCoeffTerm(coeff, variable = 'x', power = 1) {
    if (!Number.isFinite(coeff) || coeff === 0) return '0';
    const sign = coeff < 0 ? '-' : '';
    const abs = Math.abs(coeff);
    const coeffText = abs === 1 ? '' : `${abs}`;
    const powerText = power === 1 ? variable : `${variable}^${power}`;
    return `${sign}${coeffText}${powerText}`;
  }

  function formatTerm(coef, variable = 'x') {
    if (coef === 1) return variable;
    if (coef === -1) return `-${variable}`;
    return `${coef}${variable}`;
  }

  function formatLinearCombination(terms) {
    const visibleTerms = terms.filter((term) => Number(term.coef) !== 0);
    if (!visibleTerms.length) return '0';
    return visibleTerms
      .map((term, index) => {
        const coef = Number(term.coef);
        const variable = term.variable || '';
        const magnitude = Math.abs(coef);
        const body = variable ? `${magnitude === 1 ? '' : magnitude}${variable}` : `${magnitude}`;
        if (index === 0) return coef < 0 ? `-${body}` : body;
        return `${coef < 0 ? '-' : '+'}${body}`;
      })
      .join('');
  }

  function formatFractionVariable(numerator, denominator, variable) {
    const fraction = makeFraction(numerator, denominator);
    if (fraction.den === 1) return formatTerm(fraction.num, variable);
    return `${fractionToLatex(fraction)}${variable}`;
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

  function formatSignedNumber(value) {
    if (value === 0) return '';
    return value > 0 ? `+${value}` : `${value}`;
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

  function negateFraction(a) {
    return { num: -a.num, den: a.den };
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

  const manualSummaryAnswerMarker = '\uE000practice-summary\uE001';
  const manualSummaryAnswerSeparator = '\uE002';

  function createManualSummaryAnswer(summary, detail) {
    return `${manualSummaryAnswerMarker}${String(summary || '').trim()}${manualSummaryAnswerSeparator}${String(detail || '').trim()}`;
  }

  function splitManualSummaryAnswer(value) {
    const text = String(value || '');
    if (!text.startsWith(manualSummaryAnswerMarker)) return null;
    const separatorIndex = text.indexOf(manualSummaryAnswerSeparator, manualSummaryAnswerMarker.length);
    if (separatorIndex < 0) return null;
    return {
      summary: text.slice(manualSummaryAnswerMarker.length, separatorIndex).trim(),
      detail: text.slice(separatorIndex + manualSummaryAnswerSeparator.length).trim(),
    };
  }

  function createAnswerList(summaryAnswers) {
    const answers = [];
    Object.defineProperty(answers, '__summaryAnswers', {
      value: summaryAnswers,
      configurable: false,
      enumerable: false,
      writable: false,
    });
    const nativePush = Array.prototype.push;
    answers.push = function pushAnswerWithSummary(...items) {
      items.forEach((item) => {
        const manual = splitManualSummaryAnswer(item);
        if (manual) {
          summaryAnswers.push(manual.summary);
          nativePush.call(this, manual.detail);
          return;
        }
        summaryAnswers.push(deriveSummaryAnswerFromDetail(item));
        nativePush.call(this, item);
      });
      return this.length;
    };
    return answers;
  }

  function pushAnswerWithManualSummary(answers, summaryAnswers, summary, detail) {
    summaryAnswers.push(summary);
    return Array.prototype.push.call(answers, detail);
  }

  function integerOrFractionLatex(frac, mixed = true) {
    return fractionToLatex(frac, mixed);
  }

  function randomProperFraction(denChoices = [2, 3, 4, 5, 6, 7, 8, 9]) {
    const den = denChoices[randInt(0, denChoices.length - 1)];
    const num = randInt(1, den - 1);
    return makeFraction(num, den);
  }

  function randomMixedFraction(
    wholeMin = 1,
    wholeMax = 4,
    denChoices = [2, 3, 4, 5, 6, 7, 8, 9],
    allowNegative = true
  ) {
    const whole = randInt(wholeMin, wholeMax);
    const frac = randomProperFraction(denChoices);
    const signedWhole = allowNegative && randInt(0, 1) === 1 ? -whole : whole;
    const num = Math.abs(signedWhole) * frac.den + frac.num;
    return makeFraction(signedWhole < 0 ? -num : num, frac.den);
  }

  function buildJ213MoneyTicketSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function isFriendlyPercent(frac) {
      const value = makeFraction(frac.num, frac.den);
      return [1, 2, 4, 5, 10, 20, 25, 50].includes(value.den);
    }

    function formatPercentLatex(frac) {
      const value = makeFraction(frac.num, frac.den);
      return value.den === 1 ? `${value.num}` : fractionToLatex(value, true);
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const wantFraction = randInt(0, 1) === 1;
        let low = 10;
        let high = 25;
        let lowWeight = 200;
        let highWeight = 100;
        let total = 300;
        let soluteTotal = 0;
        let target = makeFraction(0, 1);
        let tries = 0;

        while (tries < 80) {
          low = [10, 12, 15][randInt(0, 2)];
          high = [25, 30, 35][randInt(0, 2)];
          lowWeight = [150, 200, 250, 300][randInt(0, 3)];
          highWeight = [100, 150, 200, 250][randInt(0, 3)];
          total = lowWeight + highWeight;
          soluteTotal = low * lowWeight + high * highWeight;
          target = makeFraction(soluteTotal, total);
          if (!isFriendlyPercent(target)) {
            tries += 1;
            continue;
          }
          if (wantFraction && target.den === 1) {
            tries += 1;
            continue;
          }
          if (!wantFraction && target.den !== 1) {
            tries += 1;
            continue;
          }
          break;
        }

        questions.push(
          `將濃度 ${low}% 的食鹽水與濃度 ${high}% 的食鹽水混合，得到濃度 $${formatPercentLatex(target)}\\%$ 的食鹽水 ${total} 克，求原來兩種食鹽水各幾克。`
        );
        answers.push(
          `設濃度 ${low}% 的食鹽水有 $x$ 克，濃度 ${high}% 的食鹽水有 $y$ 克。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${total}`, `${low}x+${high}y=${soluteTotal}`)}$。解得 $x=${lowWeight},\\ y=${highWeight}$，所以兩種食鹽水分別是 ${lowWeight} 克與 ${highWeight} 克。`
        );
        continue;
      }

      if (variant === 1) {
        const wantFraction = randInt(0, 1) === 1;
        let low = 20;
        let high = 80;
        let lowWeight = 100;
        let highWeight = 100;
        let total = 200;
        let soluteTotal = 0;
        let target = makeFraction(0, 1);
        let tries = 0;

        while (tries < 80) {
          low = [20, 30, 40][randInt(0, 2)];
          high = [70, 80, 90][randInt(0, 2)];
          lowWeight = [100, 150, 200, 250, 300][randInt(0, 4)];
          highWeight = [100, 150, 200, 250][randInt(0, 3)];
          total = lowWeight + highWeight;
          soluteTotal = low * lowWeight + high * highWeight;
          target = makeFraction(soluteTotal, total);
          if (!isFriendlyPercent(target)) {
            tries += 1;
            continue;
          }
          if (wantFraction && target.den === 1) {
            tries += 1;
            continue;
          }
          if (!wantFraction && target.den !== 1) {
            tries += 1;
            continue;
          }
          break;
        }

        questions.push(
          `實驗室要調配濃度 $${formatPercentLatex(target)}\\%$ 的酒精溶液 ${total} 克，已知有濃度 ${low}% 與濃度 ${high}% 的兩種酒精溶液，求兩種溶液各需要多少克。`
        );
        answers.push(
          `設濃度 ${low}% 的酒精溶液取 $x$ 克，濃度 ${high}% 的酒精溶液取 $y$ 克。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${total}`, `${low}x+${high}y=${soluteTotal}`)}$。解得 $x=${lowWeight},\\ y=${highWeight}$，所以兩種酒精溶液分別需要 ${lowWeight} 克與 ${highWeight} 克。`
        );
        continue;
      }

      const ratios = [
        [1, 2],
        [2, 3],
        [3, 5],
      ];
      const [a, b] = ratios[randInt(0, ratios.length - 1)];
      const low = [10, 15, 20][randInt(0, 2)];
      const high = [25, 30, 35][randInt(0, 2)];
      const scale = [80, 100, 120][randInt(0, 2)];
      const xWeight = a * scale;
      const yWeight = b * scale;
      const total = xWeight + yWeight;
      const soluteTotal = low * xWeight + high * yWeight;
      const target = makeFraction(soluteTotal, total);
      questions.push(
        `甲、乙兩種糖水的濃度分別是 ${low}% 與 ${high}%，其重量比為 ${a}:${b}，兩種糖水共 ${total} 克。求甲、乙各幾克，並求混合後的重量百分濃度。`
      );
      answers.push(
        `設甲糖水有 $x$ 克，乙糖水有 $y$ 克。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${total}`, `${b}x=${a}y`)}$。解得 $x=${xWeight},\\ y=${yWeight}$。混合後的糖水濃度為 $\\frac{${low}\\times${xWeight}+${high}\\times${yWeight}}{${total}}=${formatPercentLatex(target)}\\%$，所以混合後的重量百分濃度是 $${formatPercentLatex(target)}\\%$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ213HeadsCoinsScoreSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const remainFractions = [
          [1, 3],
          [1, 4],
          [1, 5],
        ];
        const [remainNum, remainDen] = remainFractions[randInt(0, remainFractions.length - 1)];
        const drinkNum = remainDen - remainNum;
        const bottle = [200, 250, 300, 350][randInt(0, 3)];
        const milkUnit = [180, 210, 240, 300][randInt(0, 3)];
        const milk = remainDen * milkUnit;
        const total = bottle + milk;
        const remainTotal = bottle + (milk * remainNum) / remainDen;
        questions.push(
          `一瓶鮮奶連瓶共重 ${total} 公克，喝掉 $${fractionToLatex(makeFraction(drinkNum, remainDen))}$ 的鮮奶後，連瓶共重 ${remainTotal} 公克，求瓶子與原來鮮奶各重多少公克。`
        );
        answers.push(
          `設瓶子重 $x$ 公克，原來鮮奶重 $y$ 公克。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${total}`, `x+${fractionToLatex(makeFraction(remainNum, remainDen))}y=${remainTotal}`)}$。解得 $x=${bottle},\\ y=${milk}$，所以瓶子重 ${bottle} 公克，原來鮮奶重 ${milk} 公克。`
        );
        continue;
      }

      if (variant === 1) {
        const remainFractions = [
          [3, 4],
          [2, 3],
          [4, 5],
        ];
        const [remainNum, remainDen] = remainFractions[randInt(0, remainFractions.length - 1)];
        const drinkNum = remainDen - remainNum;
        const bottle = [250, 300, 350, 400][randInt(0, 3)];
        const drinkUnit = [180, 240, 300, 360][randInt(0, 3)];
        const drink = remainDen * drinkUnit;
        const total = bottle + drink;
        const remainTotal = bottle + (drink * remainNum) / remainDen;
        questions.push(
          `一瓶飲料連瓶共重 ${total} 公克，喝掉 $${fractionToLatex(makeFraction(drinkNum, remainDen))}$ 的飲料後，連瓶共重 ${remainTotal} 公克，求空瓶重與原來飲料重各多少公克。`
        );
        answers.push(
          `設空瓶重 $x$ 公克，原來飲料重 $y$ 公克。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${total}`, `x+${fractionToLatex(makeFraction(remainNum, remainDen))}y=${remainTotal}`)}$。解得 $x=${bottle},\\ y=${drink}$，所以空瓶重 ${bottle} 公克，原來飲料重 ${drink} 公克。`
        );
        continue;
      }

      const den = [5, 6, 7][randInt(0, 2)];
      const unit = [25, 30, 35, 40][randInt(0, 3)];
      const cupB = den * unit;
      const cupA = (den - 2) * unit;
      const total = cupA + cupB;
      questions.push(
        `有甲、乙兩個相同杯子裝了不同量的水，兩杯共 ${total} 公克。若將乙杯的 $${fractionToLatex(makeFraction(1, den))}$ 倒入甲杯，兩杯水位就會一樣高，求甲、乙原來各有多少公克水。`
      );
      answers.push(
        `設甲杯原有 $x$ 公克水，乙杯原有 $y$ 公克水。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${total}`, `x+${fractionToLatex(makeFraction(1, den))}y=${fractionToLatex(makeFraction(den - 1, den))}y`)}$。解得 $x=${cupA},\\ y=${cupB}$，所以甲杯原有 ${cupA} 公克，乙杯原有 ${cupB} 公克。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ213DigitPlaceValueSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const tens = randInt(1, 7);
        const ones = randInt(1, 9);
        const digitSum = tens + ones;
        const original = 10 * tens + ones;
        const swapped = 10 * ones + tens;
        const diff = swapped - original;
        questions.push(
          `一個二位數的十位數字與個位數字和為 ${digitSum}，若將兩數字對調，新數比原數大 ${diff}，求原數。`
        );
        answers.push(
          `設十位數字為 $x$，個位數字為 $y$。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${digitSum}`, `10y+x=10x+y${diff >= 0 ? `+${diff}` : diff}`)}$。解得 $x=${tens},\\ y=${ones}$，所以原數是 ${original}。`
        );
        continue;
      }

      if (variant === 1) {
        const tens = randInt(1, 3);
        const ones = 3 * tens;
        const original = 10 * tens + ones;
        const newNumber = 100 * tens + 50 + ones;
        const diff = newNumber - original;
        questions.push(
          `某二位數的個位數字是十位數字的 3 倍，若在兩位數中間插入數字 5 變成三位數，新數比原數大 ${diff}，求原數。`
        );
        answers.push(
          `設十位數字為 $x$，個位數字為 $y$。依題意可列聯立方程式 $${formatSystemLatex(`y=3x`, `100x+50+y=10x+y+${diff}`)}$。解得 $x=${tens},\\ y=${ones}$，所以原數是 ${original}。`
        );
        continue;
      }

      const tens = randInt(1, 6);
      const ones = tens + 2;
      const original = 10 * tens + ones;
      const sumDigits = tens + ones;
      const extra = original - 4 * sumDigits;
      questions.push(`一個二位數，其個位數字比十位數字大 2，且原數是兩位數字和的 4 倍多 ${extra}，求此數。`);
      answers.push(
        `設十位數字為 $x$，個位數字為 $y$。依題意可列聯立方程式 $${formatSystemLatex(`y=x+2`, `10x+y=${formatSumValue('4(x+y)', extra)}`)}$。解得 $x=${tens},\\ y=${ones}$，所以原數是 ${original}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ213AgeChaseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const totalQ = [18, 20, 25][randInt(0, 2)];
        const correct = randInt(Math.ceil(totalQ / 2), totalQ - 3);
        const wrong = totalQ - correct;
        const score = 5 * correct - 2 * wrong;
        questions.push(
          `某次測驗共 ${totalQ} 題，答對一題得 5 分，答錯一題扣 2 分。小明全部作答後共得 ${score} 分，求他答對幾題、答錯幾題。`
        );
        answers.push(
          `設答對 $x$ 題，答錯 $y$ 題。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${totalQ}`, `5x-2y=${score}`)}$。解得 $x=${correct},\\ y=${wrong}$，所以答對 ${correct} 題，答錯 ${wrong} 題。`
        );
        continue;
      }

      if (variant === 1) {
        const totalRounds = [18, 20, 24][randInt(0, 2)];
        const ties = [2, 4, 6][randInt(0, 2)];
        const wins = randInt(6, totalRounds - ties - 4);
        const losses = totalRounds - ties - wins;
        const totalPoints = 3 * wins + 2 * ties + losses;
        questions.push(
          `猜拳比賽共進行 ${totalRounds} 局，贏一局得 3 顆糖，平手得 2 顆，輸一局得 1 顆。已知平手 ${ties} 局，小智最後共得 ${totalPoints} 顆糖，求他贏幾局、輸幾局。`
        );
        answers.push(
          `設小智贏了 $x$ 局，輸了 $y$ 局。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${totalRounds - ties}`, `3x+y=${totalPoints - 2 * ties}`)}$。解得 $x=${wins},\\ y=${losses}$，所以小智贏了 ${wins} 局，輸了 ${losses} 局。`
        );
        continue;
      }

      const totalQ = [40, 50, 60][randInt(0, 2)];
      const blank = [4, 5, 6][randInt(0, 2)];
      const correct = randInt(20, totalQ - blank - 3);
      const wrong = totalQ - blank - correct;
      const score = 2 * correct - wrong;
      questions.push(
        `數學競賽共 ${totalQ} 題，答對一題得 2 分，答錯一題扣 1 分，沒作答不扣分。若小明有 ${blank} 題沒寫，最後得 ${score} 分，求他答對幾題、答錯幾題。`
      );
      answers.push(
        `設答對 $x$ 題，答錯 $y$ 題。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${totalQ - blank}`, `2x-y=${score}`)}$。解得 $x=${correct},\\ y=${wrong}$，所以答對 ${correct} 題，答錯 ${wrong} 題。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ213SpeedChaseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const turtle = [4, 5, 6, 8][randInt(0, 3)];
        const rabbit = turtle + [12, 15, 18, 20][randInt(0, 3)];
        const distance = (turtle + rabbit) * [8, 10, 12][randInt(0, 2)];
        const meetOpposite = distance / (turtle + rabbit);
        const catchSame = makeFraction(distance, rabbit - turtle);
        questions.push(
          `龜兔相距 ${distance} 公尺，相向而行 ${meetOpposite} 分鐘後相遇；若改為同向而行，則 $${fractionToLatex(catchSame, true)}$ 分鐘後小兔追上小龜，求兩者分速。`
        );
        answers.push(
          `設小龜分速為 $x$ 公尺，小兔分速為 $y$ 公尺。由題意可列聯立方程式 $${formatSystemLatex(`${meetOpposite}(x+y)=${distance}`, `${fractionToLatex(catchSame, true)}(y-x)=${distance}`)}$。化簡為 $${formatSystemLatex(`x+y=${distance / meetOpposite}`, `y-x=${fractionToLatex(divFraction(makeFraction(distance, 1), catchSame), true)}`)}$，解得 $x=${turtle},\\ y=${rabbit}$。`
        );
        continue;
      }

      if (variant === 1) {
        const boat = [18, 24, 30, 36][randInt(0, 3)];
        const current = [2, 3, 4, 5][randInt(0, 3)];
        const down = boat + current;
        const up = boat - current;
        questions.push(`船在河中航行，順流時速為 ${down} 公里，逆流時速為 ${up} 公里，求船速與水流速。`);
        answers.push(
          `設船在靜水中的速度為 $x$ 公里，水流速度為 $y$ 公里。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${down}`, `x-y=${up}`)}$。解得 $x=${boat},\\ y=${current}$，所以船速 ${boat} 公里、水流速 ${current} 公里。`
        );
        continue;
      }

      if (variant === 2) {
        const ratioList = [
          { num: 3, den: 2 },
          { num: 4, den: 3 },
          { num: 5, den: 4 },
          { num: 7, den: 5 },
        ];
        const ratio = ratioList[randInt(0, ratioList.length - 1)];
        const unit = [60, 75, 90, 105][randInt(0, 3)];
        const slow = ratio.den * unit;
        const fast = ratio.num * unit;
        const delta = fast - slow;
        const minutes = [1, 2, 3][randInt(0, 2)];
        const exceed = [20, 30, 40, 50, 60][randInt(0, 4)];
        const headStart = delta * minutes - exceed;
        if (headStart <= 0 || headStart > 240) {
          i -= 1;
          continue;
        }
        questions.push(
          `甲、乙兩人比賽跑步，甲速率是乙的 $${ratio.num}:${ratio.den}$，且甲每分鐘比乙快 ${delta} 公尺。若乙先跑 ${headStart} 公尺，甲再開始追，${minutes} 分鐘後甲超越乙 ${exceed} 公尺，求兩人速率。`
        );
        answers.push(
          `設甲的速率為 $x$ 公尺/分，乙的速率為 $y$ 公尺/分。依題意可列聯立方程式 $${formatSystemLatex(`${ratio.den}x-${ratio.num}y=0`, `${minutes}(x-y)=${headStart + exceed}`)}$。解得 $x=${fast},\\ y=${slow}$。`
        );
        continue;
      }

      const ratioList = [
        { num: 3, den: 2 },
        { num: 4, den: 3 },
        { num: 5, den: 4 },
      ];
      const ratio = ratioList[randInt(0, ratioList.length - 1)];
      const base = [90, 120, 150, 180][randInt(0, 3)];
      const slow = base * ratio.den;
      const fast = base * ratio.num;
      const minutes = [1, 2][randInt(0, 1)];
      const exceed = [20, 30, 40, 50][randInt(0, 3)];
      const headStart = (fast - slow) * minutes - exceed;
      if (headStart <= 0) {
        i -= 1;
        continue;
      }
      questions.push(
        `甲、乙兩人比賽跑步，甲速率是乙的 $${ratio.num}:${ratio.den}$。若乙先跑 ${headStart} 公尺，甲再開始追，${minutes} 分鐘後甲超越乙 ${exceed} 公尺，求兩人速率。`
      );
      answers.push(
        `設甲的速率為 $x$ 公尺/分，乙的速率為 $y$ 公尺/分。依題意可列聯立方程式 $${formatSystemLatex(`${ratio.den}x-${ratio.num}y=0`, `${minutes}(x-y)=${headStart + exceed}`)}$。解得 $x=${fast},\\ y=${slow}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function lcmInt(a, b) {
    return Math.abs(a * b) / gcdInt(a, b);
  }

  function buildJ213AllocationWorkSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const tents = randInt(6, 14);
        const emptyTents = [1, 2][randInt(0, 1)];
        const totalStudents = 5 * (tents - emptyTents);
        const noTent = totalStudents - 4 * tents;
        if (noTent <= 0) {
          i -= 1;
          continue;
        }
        questions.push(
          `某次露營，學生分配帳篷時，若每頂住 4 人，則有 ${noTent} 人無處可住；若每頂住 5 人，則空出 ${emptyTents} 頂帳篷，求帳篷數與學生人數。`
        );
        answers.push(
          `設帳篷有 $x$ 頂，學生有 $y$ 人。依題意可列聯立方程式 $${formatSystemLatex(`y=4x+${noTent}`, `y=5(x-${emptyTents})`)}$。解得 $x=${tents},\\ y=${totalStudents}$，所以有 ${tents} 頂帳篷、${totalStudents} 位學生。`
        );
        continue;
      }

      if (variant === 1) {
        const multiplier = [3, 4, 5][randInt(0, 2)];
        const ratioChoice = [
          { num: 1, den: 2 },
          { num: 2, den: 3 },
        ][randInt(0, 1)];
        const b = ratioChoice.den === 2 ? 2 * randInt(12, 28) : 3 * randInt(10, 20);
        const a = multiplier * b;
        const c = ((a + b) * ratioChoice.num) / ratioChoice.den;
        const total = a + b + c;
        questions.push(
          `三個人合資 ${total} 元買球，甲出錢是乙的 ${multiplier} 倍，丙出的錢是甲、乙出錢總和的 $${ratioChoice.num}/${ratioChoice.den}$，求三人各出多少元。`
        );
        answers.push(
          `設乙出 $x$ 元，甲出 $y$ 元。依題意可得 $y=${multiplier}x$，且總和為 $x+y+\\frac{${ratioChoice.num}}{${ratioChoice.den}}(x+y)=${total}$。可化為 $${ratioChoice.den + ratioChoice.num}x+${ratioChoice.den + ratioChoice.num}y=${ratioChoice.den * total}$。聯立求得 $x=${b},\\ y=${a}$，所以丙為 ${c} 元；三人分別是乙 ${b} 元、甲 ${a} 元、丙 ${c} 元。`
        );
        continue;
      }

      if (variant === 2) {
        const manRate = makeFraction(1, [18, 20, 24][randInt(0, 2)]);
        const womanRate = makeFraction(1, [24, 30, 40][randInt(0, 2)]);
        const together = divFraction(makeFraction(1, 1), addFraction(manRate, womanRate));
        const comboRate = addFraction(
          mulFraction(makeFraction(2, 1), manRate),
          mulFraction(makeFraction(3, 1), womanRate)
        );
        const comboDays = divFraction(makeFraction(1, 1), comboRate);
        questions.push(
          `某項工程由男、女工各一人合作需 $${fractionToLatex(together, true)}$ 天完成；若男工 2 人、女工 3 人合作則需 $${fractionToLatex(comboDays, true)}$ 天，求男工、女工單做各需幾天。`
        );
        answers.push(
          `設男工一天可做全部工作的 $x$，女工一天可做全部工作的 $y$。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${fractionToLatex(addFraction(manRate, womanRate), true)}`, `2x+3y=${fractionToLatex(comboRate, true)}`)}$。解得 $x=${fractionToLatex(manRate)},\\ y=${fractionToLatex(womanRate)}$，所以男工單做需 ${manRate.den} 天，女工單做需 ${womanRate.den} 天。`
        );
        continue;
      }

      const groupA = [2, 3, 4][randInt(0, 2)];
      const groupB = [3, 4, 5][randInt(0, 2)];
      const rateA = makeFraction(1, [12, 15, 18, 20][randInt(0, 3)]);
      const rateB = makeFraction(1, [18, 24, 30][randInt(0, 2)]);
      const comboRate = addFraction(
        mulFraction(makeFraction(groupA, 1), rateA),
        mulFraction(makeFraction(groupB, 1), rateB)
      );
      const comboDays = divFraction(makeFraction(1, 1), comboRate);
      const singleTogether = divFraction(makeFraction(1, 1), addFraction(rateA, rateB));
      questions.push(
        `某工程甲、乙各一人合作需 $${fractionToLatex(singleTogether, true)}$ 天完成；若改成甲 ${groupA} 人與乙 ${groupB} 人合作，則需 $${fractionToLatex(comboDays, true)}$ 天完成。求甲、乙單做各需幾天。`
      );
      answers.push(
        `設甲一天可做全部工作的 $x$，乙一天可做全部工作的 $y$。可列 $${formatSystemLatex(`x+y=${fractionToLatex(addFraction(rateA, rateB), true)}`, `${groupA}x+${groupB}y=${fractionToLatex(comboRate, true)}`)}$。解得 $x=${fractionToLatex(rateA)},\\ y=${fractionToLatex(rateB)}$，所以甲單做需 ${rateA.den} 天，乙單做需 ${rateB.den} 天。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ213TieredFeeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const base = [30, 40, 50, 60][randInt(0, 3)];
        const t = [30, 40, 50, 60][randInt(0, 3)];
        const s = [2, 3, 4, 5][randInt(0, 3)];
        const m1 = t + [30, 40, 50][randInt(0, 2)];
        const m2 = m1 + [20, 30, 40][randInt(0, 2)];
        const cost1 = base + s * (m1 - t);
        const cost2 = base + s * (m2 - t);
        questions.push(
          `某網咖的基本費用為 ${base} 元，可使用 $t$ 分鐘；超過 $t$ 分鐘後，超過的部分每分鐘收費 $s$ 元。已知第一次上網 ${m1} 分鐘花了 ${cost1} 元，第二次上網 ${m2} 分鐘花了 ${cost2} 元，求 $t$ 與 $s$。`
        );
        answers.push(
          `依題意可列聯立方程式 $${formatSystemLatex(`${base}+s(${m1}-t)=${cost1}`, `${base}+s(${m2}-t)=${cost2}`)}$。兩式相減可得 $${m2 - m1}s=${cost2 - cost1}$，所以 $s=${s}$。再代回得 $${base}+${s}(${m1}-t)=${cost1}$，解得 $t=${t}$。`
        );
        continue;
      }

      if (variant === 1) {
        const threshold = [180, 300, 600][randInt(0, 2)];
        const b = [20, 24, 30, 32][randInt(0, 3)];
        const k = [0.02, 0.04, 0.05, 0.1][randInt(0, 3)];
        const d1 = threshold + [200, 300, 400][randInt(0, 2)];
        const d2 = d1 + [300, 400, 500][randInt(0, 2)];
        const cost1 = Number((b + k * (d1 - threshold)).toFixed(2));
        const cost2 = Number((b + k * (d2 - threshold)).toFixed(2));
        questions.push(
          `某電信公司的通話費計算方式為：通話時間未超過 ${threshold} 秒收基本費 $b$ 元，超過 ${threshold} 秒之後的費用與通話時間成線型關係。已知通話 ${d1} 秒花費 ${cost1} 元，通話 ${d2} 秒花費 ${cost2} 元，求基本費 $b$ 與超過 ${threshold} 秒後每秒加收的費用 $k$。`
        );
        answers.push(
          `設超過 ${threshold} 秒後每秒加收 $k$ 元，基本費為 $b$ 元。依題意可列聯立方程式 $${formatSystemLatex(`b+k(${d1}-${threshold})=${cost1}`, `b+k(${d2}-${threshold})=${cost2}`)}$。兩式相減得 $${d2 - d1}k=${Number((cost2 - cost1).toFixed(2))}$，所以 $k=${k}$。再代回得 $b=${b}$。`
        );
        continue;
      }

      if (variant === 2) {
        const a = [15, 18, 20, 24][randInt(0, 3)];
        const k = [12, 15, 18, 20][randInt(0, 3)];
        const w1 = a + [8, 10, 12][randInt(0, 2)];
        const w2 = w1 + [8, 10, 12][randInt(0, 2)];
        const fee1 = k * (w1 - a);
        const fee2 = k * (w2 - a);
        questions.push(
          `某航空公司規定旅客行李在 $a$ 公斤以下免費，超過 $a$ 公斤的部分，每公斤收費 $k$ 元。已知行李重 ${w1} 公斤時需付 ${fee1} 元，重 ${w2} 公斤時需付 ${fee2} 元，求免費額度 $a$ 為多少公斤。`
        );
        answers.push(
          `設超重每公斤收 $k$ 元，免費額度為 $a$ 公斤。依題意可列聯立方程式 $${formatSystemLatex(`k(${w1}-a)=${fee1}`, `k(${w2}-a)=${fee2}`)}$。兩式相減得 $${w2 - w1}k=${fee2 - fee1}$，所以 $k=${k}$。再代回 $${k}(${w1}-a)=${fee1}$，解得 $a=${a}$。`
        );
        continue;
      }

      const drink = [20, 30, 40][randInt(0, 2)];
      const x = [20, 30, 40, 50][randInt(0, 3)];
      const y = [0.5, 1, 1.5, 2][randInt(0, 3)];
      const minutes1 = 120;
      const minutes2 = 200;
      const extra1 = minutes1 - 60;
      const extra2 = minutes2 - 60;
      const total1 = Number((drink + x + extra1 * y).toFixed(2));
      const total2 = Number((drink + x + extra2 * y).toFixed(2));
      questions.push(
        `某網咖消費項目如下：飲料基本消費 ${drink} 元，一小時內基本消費 $x$ 元，一小時後每分鐘加收 $y$ 元。若佳佳上網 2 小時花了 ${total1} 元，明凱上網 3 小時 20 分共花了 ${total2} 元，求 $x$ 與 $y$。`
      );
      answers.push(
        `依題意可列聯立方程式 $${formatSystemLatex(`${drink}+x+${extra1}y=${total1}`, `${drink}+x+${extra2}y=${total2}`)}$。兩式相減得 $${extra2 - extra1}y=${Number((total2 - total1).toFixed(2))}$，所以 $y=${y}$。再代回得 $x=${x}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ213ClassicalTextSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const bigMonk = [18, 24, 27, 30][randInt(0, 3)];
        const smallMonk = [42, 54, 63, 72][randInt(0, 3)];
        const monkTotal = bigMonk + smallMonk;
        const bunTotal = 3 * bigMonk + smallMonk / 3;
        questions.push(
          `古文題：今有饅頭 ${bunTotal} 個、僧人 ${monkTotal} 人。大僧 1 人分 3 個，小僧 3 人分 1 個，問大小僧各幾人？`
        );
        answers.push(
          `設大僧有 $x$ 人，小僧有 $y$ 人。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${monkTotal}`, `3x+\\frac{1}{3}y=${bunTotal}`)}$。將第二式同乘 3，可得 $9x+y=${bunTotal * 3}$。兩式相減得 $8x=${bunTotal * 3 - monkTotal}$，所以 $x=${bigMonk}$，再代回得 $y=${smallMonk}$。因此大僧有 ${bigMonk} 人，小僧有 ${smallMonk} 人。`
        );
        continue;
      }

      if (variant === 1) {
        const fish = [9, 12, 15, 18][randInt(0, 3)];
        const turtle = [8, 10, 11, 13][randInt(0, 3)];
        const feetTotal = 3 * fish + 4 * turtle;
        const eyeTotal = 2 * fish + 6 * turtle;
        questions.push(
          `古文題：三足魚與六眼龜，共游池中。今數其足，共有 ${feetTotal} 足；數其眼，共有 ${eyeTotal} 眼。問三足魚與六眼龜各幾隻？`
        );
        answers.push(
          `設三足魚有 $x$ 隻，六眼龜有 $y$ 隻。依題意可列聯立方程式 $${formatSystemLatex(`3x+4y=${feetTotal}`, `2x+6y=${eyeTotal}`)}$。消去可得 $x=${fish},\\ y=${turtle}$。因此三足魚有 ${fish} 隻，六眼龜有 ${turtle} 隻。`
        );
        continue;
      }

      const goodWine = [4, 5, 6, 7][randInt(0, 3)];
      const lightWine = [9, 12, 15, 18][randInt(0, 3)];
      const bottleTotal = goodWine + lightWine;
      const drunkTotal = 3 * goodWine + lightWine / 3;
      questions.push(
        `古文題：好酒 1 瓶醉 3 客，薄酒 3 瓶醉 1 人。今好酒、薄酒共 ${bottleTotal} 瓶，合計可醉 ${drunkTotal} 人，問好酒、薄酒各幾瓶？`
      );
      answers.push(
        `設好酒有 $x$ 瓶，薄酒有 $y$ 瓶。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${bottleTotal}`, `3x+\\frac{1}{3}y=${drunkTotal}`)}$。將第二式同乘 3，可得 $9x+y=${drunkTotal * 3}$。兩式相減得 $8x=${drunkTotal * 3 - bottleTotal}$，所以 $x=${goodWine}$，再代回得 $y=${lightWine}$。因此好酒有 ${goodWine} 瓶，薄酒有 ${lightWine} 瓶。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ213UnitPriceSystemSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const xValue = [20, 25, 30, 35][randInt(0, 3)];
        const yValue = [15, 18, 22, 28][randInt(0, 3)];
        const a1 = [2, 3, 4][randInt(0, 2)];
        const b1 = [2, 3, 4][randInt(0, 2)];
        const a2 = [2, 3, 4][randInt(0, 2)];
        const b2 = [2, 3, 4][randInt(0, 2)];
        if (a1 * b2 === a2 * b1) {
          i -= 1;
          continue;
        }
        const total1 = a1 * xValue + b1 * yValue;
        const total2 = a2 * xValue + b2 * yValue;
        questions.push(
          `蘋果每公斤 $x$ 元、梨子每公斤 $y$ 元。小明買了 ${a1} 公斤蘋果和 ${b1} 公斤梨子共花 ${total1} 元，小華買了 ${a2} 公斤蘋果和 ${b2} 公斤梨子共花 ${total2} 元，求蘋果與梨子每公斤各多少元。`
        );
        answers.push(
          `依題意可列聯立方程式 $${formatSystemLatex(`${a1}x+${b1}y=${total1}`, `${a2}x+${b2}y=${total2}`)}$。解得 $x=${xValue},\\ y=${yValue}$，所以蘋果每公斤 ${xValue} 元，梨子每公斤 ${yValue} 元。`
        );
        continue;
      }

      if (variant === 1) {
        const xValue = [40, 50, 60][randInt(0, 2)];
        const yValue = [25, 30, 35][randInt(0, 2)];
        const adult1 = [2, 3, 4][randInt(0, 2)];
        const child1 = [1, 2, 3][randInt(0, 2)];
        const adult2 = [1, 2, 3][randInt(0, 2)];
        const child2 = [2, 3, 4][randInt(0, 2)];
        if (adult1 * child2 === adult2 * child1) {
          i -= 1;
          continue;
        }
        const total1 = adult1 * xValue + child1 * yValue;
        const total2 = adult2 * xValue + child2 * yValue;
        questions.push(
          `樂園全票 $x$ 元、優待票 $y$ 元。甲家買了 ${adult1} 張全票和 ${child1} 張優待票共花 ${total1} 元，乙家買了 ${adult2} 張全票和 ${child2} 張優待票共花 ${total2} 元，求全票與優待票各多少元。`
        );
        answers.push(
          `可列聯立方程式 $${formatSystemLatex(`${adult1}x+${child1}y=${total1}`, `${adult2}x+${child2}y=${total2}`)}$。解得 $x=${xValue},\\ y=${yValue}$，所以全票 ${xValue} 元，優待票 ${yValue} 元。`
        );
        continue;
      }

      const xValue = [8, 10, 12][randInt(0, 2)];
      const yValue = xValue + [4, 5, 6][randInt(0, 2)];
      const penCount = [3, 4, 5][randInt(0, 2)];
      const bookCount = [4, 5, 6][randInt(0, 2)];
      const total = penCount * xValue + bookCount * yValue;
      const diff = yValue - xValue;
      questions.push(
        `原子筆每支 $x$ 元、筆記本每本 $y$ 元。已知筆記本比原子筆貴 ${diff} 元，且買 ${penCount} 支原子筆和 ${bookCount} 本筆記本共花 ${total} 元，求兩者單價。`
      );
      answers.push(
        `依題意可列聯立方程式 $${formatSystemLatex(`y-x=${diff}`, `${penCount}x+${bookCount}y=${total}`)}$。解得 $x=${xValue},\\ y=${yValue}$，所以原子筆每支 ${xValue} 元，筆記本每本 ${yValue} 元。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ213AgeRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2;

      if (variant === 0) {
        const child = [12, 14, 15, 16][randInt(0, 3)];
        const father = child * [3, 4][randInt(0, 1)];
        const total = child + father;
        questions.push(`爸爸年齡是兒子年齡的 ${father / child} 倍，兩人的年齡和為 ${total} 歲，求爸爸與兒子各幾歲。`);
        answers.push(
          `設爸爸年齡為 $x$ 歲、兒子年齡為 $y$ 歲。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${total}`, `x=${father / child}y`)}$。解得 $x=${father},\\ y=${child}$，所以爸爸 ${father} 歲，兒子 ${child} 歲。`
        );
        continue;
      }

      const yearsLater = [2, 3, 4][randInt(0, 2)];
      const ratio = [2, 3][randInt(0, 1)];
      const younger = [4, 5, 6, 7, 8][randInt(0, 4)];
      const older = ratio * (younger + yearsLater) - yearsLater;
      const diff = older - younger;
      questions.push(
        `甲比乙大 ${diff} 歲，再過 ${yearsLater} 年後，甲的年齡會是乙的 ${ratio} 倍，求甲、乙現在各幾歲。`
      );
      answers.push(
        `設甲現在 $x$ 歲、乙現在 $y$ 歲。可列聯立方程式 $${formatSystemLatex(`x-y=${diff}`, `x+${yearsLater}=${ratio}(y+${yearsLater})`)}$。解得 $x=${older},\\ y=${younger}$，所以甲現在 ${older} 歲，乙現在 ${younger} 歲。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ213PerimeterRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2;

      if (variant === 0) {
        const width = [4, 5, 6, 7, 8][randInt(0, 4)];
        const length = width + [2, 3, 4, 5][randInt(0, 3)];
        const perimeter = 2 * (length + width);
        questions.push(`一個長方形的周長為 ${perimeter} 公分，長比寬多 ${length - width} 公分，求長和寬。`);
        answers.push(
          `設長為 $x$ 公分、寬為 $y$ 公分。依題意可列聯立方程式 $${formatSystemLatex(`2x+2y=${perimeter}`, `x-y=${length - width}`)}$。解得 $x=${length},\\ y=${width}$，所以長 ${length} 公分，寬 ${width} 公分。`
        );
        continue;
      }

      const width = [3, 4, 5, 6][randInt(0, 3)];
      const ratio = [2, 3][randInt(0, 1)];
      const length = ratio * width;
      const perimeter = 2 * (length + width);
      questions.push(`一個長方形的周長為 ${perimeter} 公分，長是寬的 ${ratio} 倍，求長和寬。`);
      answers.push(
        `設長為 $x$ 公分、寬為 $y$ 公分。可列聯立方程式 $${formatSystemLatex(`2x+2y=${perimeter}`, `x=${ratio}y`)}$。解得 $x=${length},\\ y=${width}$，所以長 ${length} 公分，寬 ${width} 公分。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ213TransferChangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2;

      if (variant === 0) {
        const transfer = randInt(4, 14);
        const b = randInt(10, 32);
        const a = b + 2 * transfer;
        const total = a + b;
        questions.push(
          `小明和小華共有 ${total} 本書。若小明給小華 ${transfer} 本，兩人的書就一樣多，求兩人原來各有多少本書。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `小明原有 ${a} 本，小華原有 ${b} 本`,
          `設小明原有 $x$ 本、小華原有 $y$ 本。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${total}`, `x-${transfer}=y+${transfer}`)}$。由第二式得 $x-y=${2 * transfer}$，再與總數 $x+y=${total}$ 聯立，解得 $x=${a},\\ y=${b}$。`
        );
        continue;
      }

      const unit = randInt(2, 8);
      const transfer = 5 * unit;
      const xValue = 13 * unit;
      const yValue = 11 * unit;
      questions.push(
        `小明和小華原來各有一些書。若小明給小華 ${transfer} 本，則小華的書會是小明的 2 倍；若小華給小明 ${transfer} 本，則小明的書會是小華的 3 倍。求兩人原來各有多少本書。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `小明原有 ${xValue} 本，小華原有 ${yValue} 本`,
        `設小明原有 $x$ 本、小華原有 $y$ 本。可列聯立方程式 $${formatSystemLatex(`y+${transfer}=2(x-${transfer})`, `x+${transfer}=3(y-${transfer})`)}$。第一式整理得 $y=2x-${3 * transfer}$，第二式整理得 $x=3y-${4 * transfer}$。聯立解得 $x=${xValue},\\ y=${yValue}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ213TravelScheduleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2;

      if (variant === 0) {
        const slow = [3, 4, 6][randInt(0, 2)];
        const fast = slow + [2, 3][randInt(0, 1)];
        const factor = [3, 4, 5][randInt(0, 2)];
        const timeSlow = fast * factor;
        const timeFast = slow * factor;
        const planned = timeFast + randInt(1, timeSlow - timeFast - 1);
        const distance = slow * timeSlow;
        const late = timeSlow - planned;
        const early = planned - timeFast;
        questions.push(
          `某人從甲地到乙地，若每小時走 ${slow} 公里，會遲到 ${late} 小時；若每小時走 ${fast} 公里，會提早 ${early} 小時到達。求甲、乙兩地相距多少公里，以及原定需在幾小時內到達。`
        );
        answers.push(
          `設甲、乙兩地相距 $x$ 公里，原定需在 $y$ 小時內到達。依題意可列聯立方程式 $${formatSystemLatex(`\\frac{x}{${slow}}=y+${late}`, `\\frac{x}{${fast}}=y-${early}`)}$。解得 $x=${distance},\\ y=${planned}$，所以距離是 ${distance} 公里，原定需在 ${planned} 小時內到達。`
        );
        continue;
      }

      const walk = [4, 5, 6][randInt(0, 2)];
      const ratio = [2, 3][randInt(0, 1)];
      const bike = walk * ratio;
      const rest = [0.5, 1][randInt(0, 1)];
      const meetTime = [4, 5, 6, 7][randInt(0, 3)];
      const meetFromB = ((bike - walk) * meetTime - bike * rest) / 2;
      if (!Number.isInteger(meetFromB) || meetFromB <= 0) {
        i -= 1;
        continue;
      }
      const distance = walk * meetTime + meetFromB;
      questions.push(
        `甲、乙兩人同時從 A 地出發前往 B 地。甲每小時走 ${walk} 公里，乙每小時騎 ${bike} 公里。乙先到 B 地後休息 ${rest} 小時，再原速返回，於距離 B 地 ${meetFromB} 公里處與甲相遇，求 A、B 兩地相距多少公里。`
      );
      answers.push(
        `設 A、B 兩地相距 $x$ 公里，甲走到相遇點共用了 $t$ 小時。依題意可列聯立方程式 $${formatSystemLatex(`${walk}t=x-${meetFromB}`, `${bike}(t-${rest})=x+${meetFromB}`)}$。解得 $t=${meetTime},\\ x=${distance}$，所以 A、B 兩地相距 ${distance} 公里。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-1-3 新增：等臂天平稱重 ────────────────────────────────────────────
  function buildJ213BalanceScaleSet(count) {
    // 等臂天平稱重聯立方程 — 預先驗算模板，無 i-=1 無限迴圈
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    // Variant 0: la*a = lb*b  且  ra*a + rb*b = w → 驗算 w % (ra*lb + rb*la) === 0
    const poolV0 = [
      { la: 2, lb: 3, ra: 2, rb: 1, w: 1200 }, // denom=8,  k=150, a=450, b=300
      { la: 3, lb: 2, ra: 1, rb: 3, w: 1100 }, // denom=11, k=100, a=200, b=300
      { la: 2, lb: 5, ra: 3, rb: 2, w: 950 }, // denom=19, k=50,  a=250, b=100
      { la: 4, lb: 3, ra: 2, rb: 1, w: 1400 }, // denom=10, k=140, a=420, b=560 — wait let me just fix values
      { la: 3, lb: 4, ra: 2, rb: 3, w: 850 }, // denom=17, k=50,  a=200, b=150
      { la: 5, lb: 2, ra: 1, rb: 2, w: 1200 }, // denom=12, k=100, a=200, b=500
    ];
    const itemsV0 = [
      ['甲牌番茄汁', '乙牌番茄汁', '罐'],
      ['蘋果', '橘子', '顆'],
      ['甲種飲料', '乙種飲料', '罐'],
      ['甲牌罐頭', '乙牌罐頭', '罐'],
      ['甲種果汁', '乙種果汁', '罐'],
      ['白色棋子', '黑色棋子', '枚'],
    ];

    // Variant 1: a1*x+b1*y=t1, a2*x+b2*y=t2 → 整數正解
    const poolV1 = [
      { a1: 5, b1: 3, t1: 235, a2: 6, b2: 4, t2: 290 }, // x=35, y=20
      { a1: 3, b1: 2, t1: 96, a2: 2, b2: 3, t2: 84 }, // x=24, y=12
      { a1: 4, b1: 3, t1: 180, a2: 3, b2: 5, t2: 185 }, // x=15? let me check det=4*5-3*3=11, x=(180*5-185*3)/11=(900-555)/11=345/11 no
      { a1: 5, b1: 2, t1: 225, a2: 2, b2: 3, t2: 129 }, // det=5*3-2*2=11, x=(225*3-129*2)/11=(675-258)/11=417/11 no
      { a1: 3, b1: 4, t1: 170, a2: 4, b2: 3, t2: 180 }, // det=9-16=-7, x=(170*3-180*4)/(-7)=(510-720)/(-7)=30 ✓, y=(3*180-4*170)/(-7)=(540-680)/(-7)=20 ✓
      { a1: 2, b1: 3, t1: 130, a2: 3, b2: 2, t2: 120 }, // det=4-9=-5, x=(130*2-120*3)/(-5)=(260-360)/(-5)=20 ✓, y=(2*120-3*130)/(-5)=(240-390)/(-5)=30 ✓
    ];
    const namesV1 = [
      ['玫瑰', '康乃馨'],
      ['礦泉水', '汽水'],
      ['麥克筆', '簽字筆'],
      ['橡皮', '鉛筆'],
      ['蘋果', '橘子'],
      ['餅乾', '糖果'],
    ];

    // Variant 2: a*x = b*y  且  ra*x + rb*y = w
    const poolV2 = [
      { a: 2, b: 3, ra: 2, rb: 1, w: 1200, nameA: '餅乾（塊）', nameB: '糖果（顆）' },
      { a: 3, b: 4, ra: 3, rb: 1, w: 750, nameA: '棋子（枚）', nameB: '石頭（顆）' },
      { a: 4, b: 5, ra: 4, rb: 1, w: 720, nameA: '彈珠（顆）', nameB: '積木（塊）' },
      { a: 5, b: 3, ra: 5, rb: 2, w: 1200, nameA: '鉛筆（支）', nameB: '橡皮（塊）' },
      { a: 2, b: 5, ra: 2, rb: 1, w: 720, nameA: '玻璃球（顆）', nameB: '金屬球（顆）' },
      { a: 3, b: 2, ra: 3, rb: 1, w: 720, nameA: '木塊', nameB: '鐵塊' },
    ];

    for (let i = 0; i < count; i++) {
      const variant = i % 3;

      if (variant === 0) {
        const t = poolV0[randInt(0, poolV0.length - 1)];
        const nm = itemsV0[randInt(0, itemsV0.length - 1)];
        const denom = t.ra * t.lb + t.rb * t.la;
        const k = t.w / denom;
        const a = t.lb * k,
          b = t.la * k;
        questions.push(
          `用等臂天平稱重：第一次 ${t.la} ${nm[2]}${nm[0]}和 ${t.lb} ${nm[2]}${nm[1]}平衡；` +
            `第二次 ${t.ra} ${nm[2]}${nm[0]}和 ${t.rb} ${nm[2]}${nm[1]}與 ${t.w} 公克砝碼平衡。` +
            `求每${nm[2]}${nm[0]}和每${nm[2]}${nm[1]}各重多少公克？`
        );
        answers.push(
          `設每${nm[2]}${nm[0]}重 $x$ 公克，每${nm[2]}${nm[1]}重 $y$ 公克。` +
            `$\\begin{cases}${t.la}x=${t.lb}y\\\\${t.ra}x+${t.rb}y=${t.w}\\end{cases}$` +
            `解得 $x=${a}$，$y=${b}$。`
        );
        continue;
      }

      if (variant === 1) {
        // only use pre-validated rows
        const validV1 = [
          { a1: 5, b1: 3, t1: 235, a2: 6, b2: 4, t2: 290, x: 35, y: 20 },
          { a1: 3, b1: 4, t1: 170, a2: 4, b2: 3, t2: 180, x: 30, y: 20 },
          { a1: 2, b1: 3, t1: 130, a2: 3, b2: 2, t2: 120, x: 20, y: 30 },
          { a1: 3, b1: 2, t1: 96, a2: 2, b2: 3, t2: 84, x: 24, y: 12 },
          { a1: 4, b1: 3, t1: 220, a2: 3, b2: 4, t2: 200, x: 40, y: 20 },
          { a1: 4, b1: 1, t1: 105, a2: 3, b2: 1, t2: 80, x: 25, y: 5 },
        ];
        const t = validV1[randInt(0, validV1.length - 1)];
        const nm = namesV1[randInt(0, namesV1.length - 1)];
        questions.push(
          `甲買了 ${t.a1} 件${nm[0]}和 ${t.b1} 件${nm[1]}，共花 ${t.t1} 元；` +
            `乙買了 ${t.a2} 件${nm[0]}和 ${t.b2} 件${nm[1]}，共花 ${t.t2} 元。` +
            `求每件${nm[0]}和每件${nm[1]}各多少元？`
        );
        answers.push(
          `設每件${nm[0]} $x$ 元，每件${nm[1]} $y$ 元。` +
            `$\\begin{cases}${t.a1}x+${t.b1}y=${t.t1}\\\\${t.a2}x+${t.b2}y=${t.t2}\\end{cases}$` +
            `解得 $x=${t.x}$，$y=${t.y}$。`
        );
        continue;
      }

      // variant 2
      const t = poolV2[randInt(0, poolV2.length - 1)];
      const denom2 = t.ra * t.b + t.rb * t.a;
      const k2 = t.w / denom2;
      const aW = t.b * k2,
        bW = t.a * k2;
      const diff = Math.abs(aW - bW);
      questions.push(
        `用等臂天平：第一次 ${t.a} 個${t.nameA}和 ${t.b} 個${t.nameB}平衡；` +
          `第二次 ${t.ra} 個${t.nameA}和 ${t.rb} 個${t.nameB}共重 ${t.w} 公克。` +
          `兩種物品重量相差多少公克？`
      );
      answers.push(
        `$\\begin{cases}${t.a}x=${t.b}y\\\\${t.ra}x+${t.rb}y=${t.w}\\end{cases}$` +
          `解得 $x=${aW}$，$y=${bW}$，相差 $${diff}$ 公克。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-1-3 新增：班級人數與成績分析 ──────────────────────────────────────
  function buildJ213ClassSizeScoreSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        // 全班N人，平均分avg，男生平均avgM，女生平均avgF → 求男/女生人數
        const templates = [
          { total: 45, avg: 78, avgM: 75, avgF: 80 },
          { total: 40, avg: 74, avgM: 70, avgF: 78 },
          { total: 36, avg: 72, avgM: 68, avgF: 76 },
          { total: 50, avg: 76, avgM: 72, avgF: 80 },
          { total: 42, avg: 75, avgM: 72, avgF: 78 },
          { total: 45, avg: 80, avgM: 76, avgF: 86 },
          { total: 48, avg: 75, avgM: 70, avgF: 78 },
        ];
        const pick = templates[cycle % templates.length];
        // x + y = total, avg*total = avgM*x + avgF*y
        const totalScore = pick.avg * pick.total;
        const malePct = pick.avgF - pick.avg;
        const femalePct = pick.avg - pick.avgM;
        const denomPct = pick.avgF - pick.avgM;
        if (totalScore % 1 !== 0 || (malePct * pick.total) % denomPct !== 0) {
          continue;
        }
        const male = (malePct * pick.total) / denomPct;
        const female = pick.total - male;
        questions.push(
          `某班共 ${pick.total} 人，某次考試全班平均 ${pick.avg} 分，男生平均 ${pick.avgM} 分，女生平均 ${pick.avgF} 分，求男、女生各有幾人。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `男生 ${male} 人，女生 ${female} 人`,
          `設男生有 $x$ 人，女生有 $y$ 人。依題意可列聯立方程式：$${formatSystemLatex(`x+y=${pick.total}`, `${pick.avgM}x+${pick.avgF}y=${totalScore}`)}$。兩式中第二式除以第一式係數相消法：$(${pick.avgM})x+(${pick.avgF})y=${totalScore}$ 減去 $(${pick.avg})(x+y)=${totalScore}$，整理得 $(${pick.avgM - pick.avg})x+(${pick.avgF - pick.avg})y=0$，即 $${pick.avg - pick.avgM}x=${pick.avgF - pick.avg}y$，所以 $x:y=${malePct}:${femalePct}$。再由 $x+y=${pick.total}$，得男生 ${male} 人、女生 ${female} 人。`
        );
        continue;
      }

      if (variant === 1) {
        // 男生p%+女生q%自行上學，男比女多d人；家長接送的男女一樣多 → 求全班人數
        const templates = [
          { pm: 30, pf: 10, diff: 6 },
          { pm: 40, pf: 20, diff: 4 },
          { pm: 50, pf: 30, diff: 2 },
          { pm: 50, pf: 70, diff: 4 },
          { pm: 60, pf: 80, diff: 8 },
          { pm: 70, pf: 80, diff: 5 },
          { pm: 40, pf: 10, diff: 9 },
        ];
        const pick = templates[cycle % templates.length];
        // x = male, y = female
        // pm/100*x - pf/100*y = diff
        // (1-pm/100)*x = (1-pf/100)*y
        const qm = 100 - pick.pm;
        const qf = 100 - pick.pf;
        // qf*x = qm*y → y = qf/qm * x
        // pm/100*x - pf/100*(qf/qm)*x = diff → x(pm*qm - pf*qf)/(100*qm) = diff
        const num = pick.pm * qm - pick.pf * qf;
        if (num <= 0 || (pick.diff * 100 * qm) % num !== 0) {
          continue;
        }
        const male = (pick.diff * 100 * qm) / num;
        const female = (qf * male) / qm;
        if (!Number.isInteger(female) || female <= 0) {
          continue;
        }
        const total = male + female;
        questions.push(
          `某班男生有 ${pick.pm}%、女生有 ${pick.pf}% 自行上學，其餘由家長接送。已知自行上學的男生比女生多 ${pick.diff} 人，且由家長接送的男女生人數相同，求全班共有幾人。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `全班 ${total} 人`,
          `設男生有 $x$ 人，女生有 $y$ 人。自行上學人數：男生 $${pick.pm}\\%x$，女生 $${pick.pf}\\%y$；家長接送：男生 $${qm}\\%x$，女生 $${qf}\\%y$。依題意列聯立方程式：$${formatSystemLatex(`${pick.pm}x-${pick.pf}y=${pick.diff * 100}`, `${qm}x=${qf}y`)}$（乘以 100 消分）。由第二式得 $x=\\dfrac{${qf}}{${qm}}y$，代回得 $y=${female}$，$x=${male}$，所以全班共 ${total} 人。`
        );
        continue;
      }

      // variant 2: 全班N人，不及格占1/p，及格未到80占1/q多r人，80以上有s人 → 求不及格人數
      const templates = [
        { inv_p: 3, inv_q: 2, r: 3, s: 3 }, // N=36  ✓
        { inv_p: 4, inv_q: 3, r: 2, s: 8 }, // N=24  ✓
        { inv_p: 3, inv_q: 2, r: 4, s: 8 }, // N=72  ✓
        { inv_p: 3, inv_q: 2, r: 5, s: 5 }, // N=60  ✓
        { inv_p: 4, inv_q: 3, r: 4, s: 6 }, // N=24  ✓
        { inv_p: 3, inv_q: 2, r: 6, s: 4 }, // N=60  ✓
      ];
      const pick = templates[cycle % templates.length];
      // fail = N/p, pass_low = N/q + r, pass_high = s
      // N = N/p + N/q + r + s
      // N(1 - 1/p - 1/q) = r + s
      // N * (p*q - q - p) / (p*q) = r + s
      const p = pick.inv_p;
      const q = pick.inv_q;
      const rs = pick.r + pick.s;
      const numer = p * q;
      const denom3 = numer - q - p;
      if (denom3 <= 0 || (rs * numer) % denom3 !== 0) {
        continue;
      }
      const N = (rs * numer) / denom3;
      const fail = N / p;
      const pass_low = N / q + pick.r;
      questions.push(
        `某次段考，不及格人數占全班的 $\\dfrac{1}{${p}}$，及格但未到 80 分的人數占全班的 $\\dfrac{1}{${q}}$ 又多 ${pick.r} 人，80 分以上只有 ${pick.s} 人，求全班人數及不及格人數各為幾人。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `全班 ${N} 人，不及格 ${fail} 人`,
        `設全班 $x$ 人，不及格 $\\dfrac{x}{${p}}$ 人，及格未達 80 分 $\\dfrac{x}{${q}}+${pick.r}$ 人，80 以上 ${pick.s} 人。因此 $\\dfrac{x}{${p}}+\\dfrac{x}{${q}}+${pick.r}+${pick.s}=x$，整理得 $x\\left(1-\\dfrac{1}{${p}}-\\dfrac{1}{${q}}\\right)=${rs}$，解得 $x=${N}$。不及格人數為 $\\dfrac{${N}}{${p}}=${fail}$ 人。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-1-3 新增：多人成對和（任意兩人／三人年齡和）──────────────────────
  function buildJ213PairwiseSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        // 三人任意兩人年齡和為s1,s2,s3 → 求各人或最大
        const templates = [
          { people: ['甲', '乙', '丙'], ages: [46, 43, 58] },
          { people: ['甲', '乙', '丙'], ages: [35, 42, 47] },
          { people: ['甲', '乙', '丙'], ages: [28, 36, 45] },
          { people: ['阿明', '阿華', '阿強'], ages: [33, 41, 52] },
          { people: ['甲', '乙', '丙'], ages: [50, 58, 62] },
          { people: ['小英', '小芳', '小玲'], ages: [25, 30, 37] },
          { people: ['甲', '乙', '丙'], ages: [32, 47, 61] },
        ];
        const pick = templates[cycle % templates.length];
        const [a, b, c] = pick.ages;
        const s1 = a + b;
        const s2 = a + c;
        const s3 = b + c;
        const total = a + b + c;
        const minPairSum = Math.min(s1, s2, s3);
        const sorted = [...pick.ages].sort((x, y) => y - x);
        questions.push(
          `${pick.people[0]}、${pick.people[1]}、${pick.people[2]} 三人任意兩人年齡和分別為 ${Math.min(s1, s2, s3)}、${s1 + s2 + s3 - Math.min(s1, s2, s3) - Math.max(s1, s2, s3)}、${Math.max(s1, s2, s3)} 歲，求年齡最大的人幾歲。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${sorted[0]} 歲`,
          `三人任意兩人和之總和為三人年齡和的兩倍，即 $${Math.min(s1, s2, s3)}+${s1 + s2 + s3 - Math.min(s1, s2, s3) - Math.max(s1, s2, s3)}+${Math.max(s1, s2, s3)}=${2 * total}$，所以三人年齡和為 $${total}$。年齡最大的人會搭配另外兩人形成最小的兩人和，因此最大年齡為 $${total}-${minPairSum}=${sorted[0]}$ 歲。`
        );
        continue;
      }

      if (variant === 1) {
        // 三人並坐一排，任意兩人年齡和 → 求各人年齡
        const templates = [
          { people: ['甲', '乙', '丙'], ages: [40, 37, 52] },
          { people: ['甲', '乙', '丙'], ages: [31, 28, 45] },
          { people: ['阿仁', '阿義', '阿智'], ages: [36, 42, 58] },
          { people: ['甲', '乙', '丙'], ages: [27, 34, 46] },
          { people: ['小明', '小華', '小強'], ages: [22, 30, 41] },
          { people: ['甲', '乙', '丙'], ages: [44, 51, 63] },
          { people: ['甲', '乙', '丙'], ages: [29, 39, 54] },
        ];
        const pick = templates[cycle % templates.length];
        const [a, b, c] = pick.ages;
        const sAB = a + b;
        const sAC = a + c;
        const sBC = b + c;
        const sums = [sAB, sAC, sBC].sort((x, y) => x - y);
        const total = a + b + c;
        questions.push(
          `${pick.people[0]}、${pick.people[1]}、${pick.people[2]} 三人，任意兩人年齡和分別為 ${sums[0]}、${sums[1]}、${sums[2]} 歲，求三人各幾歲。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${total - sums[2]}、${total - sums[1]}、${total - sums[0]} 歲`,
          `設三人年齡分別為 $x,y,z$。已知任意兩人和，三式相加得 $2(x+y+z)=${sums[0] + sums[1] + sums[2]}$，故 $x+y+z=${total}$。再依序減去各兩人和可得三人年齡：最大的和為 $${sums[2]}$，對應最小的人年齡為 $${total}-${sums[2]}=${total - sums[2]}$；次大的和 $${sums[1]}$ 對應 $${total - sums[1]}$；最小的和 $${sums[0]}$ 對應 $${total - sums[0]}$。故三人年齡分別為 ${total - sums[2]}、${total - sums[1]}、${total - sums[0]} 歲。`
        );
        continue;
      }

      // variant 2: 四人任意三人年齡和 → 求最大
      const templates = [
        { people: ['甲', '乙', '丙', '丁'], ages: [45, 52, 58, 67] },
        { people: ['甲', '乙', '丙', '丁'], ages: [38, 44, 51, 62] },
        { people: ['甲', '乙', '丙', '丁'], ages: [31, 40, 47, 55] },
        { people: ['甲', '乙', '丙', '丁'], ages: [42, 50, 57, 63] },
        { people: ['甲', '乙', '丙', '丁'], ages: [29, 36, 48, 59] },
        { people: ['甲', '乙', '丙', '丁'], ages: [41, 48, 55, 68] },
      ];
      const pick = templates[cycle % templates.length];
      const [a, b, c, d] = pick.ages;
      const total = a + b + c + d;
      // Four triple sums: total-a, total-b, total-c, total-d
      const tripleSums = [total - a, total - b, total - c, total - d].sort((x, y) => x - y);
      const maxAge = Math.max(...pick.ages);
      questions.push(
        `${pick.people[0]}、${pick.people[1]}、${pick.people[2]}、${pick.people[3]} 四人，任意三人年齡和分別為 ${tripleSums[0]}、${tripleSums[1]}、${tripleSums[2]}、${tripleSums[3]} 歲，求年齡最大的人幾歲。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${maxAge} 歲`,
        `四個三人和加總等於 $3(${pick.people[0]}+${pick.people[1]}+${pick.people[2]}+${pick.people[3]})$，即 $${tripleSums[0]}+${tripleSums[1]}+${tripleSums[2]}+${tripleSums[3]}=${tripleSums.reduce((s, v) => s + v, 0)}=3\\times(四人和)$，所以四人年齡和為 $${total}$。年齡最大者對應最小的三人和（${tripleSums[0]}），其年齡為 $${total}-${tripleSums[0]}=${maxAge}$ 歲。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-1-3 新增：分箱問題（磁磚/糖果/水果分大小箱條件）────────────────────
  function buildJ213BoxDistributionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        // 三次條件：帶不同大小箱組合，每次目標量相同，一次剩r1，一次剩r2，一次剛好
        const itemList = ['磁磚', '糖果', '石頭', '零件', '餅乾', '水果', '文具'];
        const item = itemList[cycle % itemList.length];
        const y = randInt(12, 36);
        const x = y + randInt(8, 42);
        const pick = {
          bigA: 3,
          smallA: 3,
          rA: x - y,
          bigB: 2,
          smallB: 6,
          rB: 2 * y,
          bigC: 2,
          smallC: 4,
          item,
        };
        // bigA*x + smallA*y - rA = bigC*x + smallC*y (target)
        // bigB*x + smallB*y - rB = target
        // (bigA - bigC)*x + (smallA - smallC)*y = rA
        // (bigB - bigC)*x + (smallB - smallC)*y = rB
        const da1 = pick.bigA - pick.bigC;
        const db1 = pick.smallA - pick.smallC;
        const da2 = pick.bigB - pick.bigC;
        const db2 = pick.smallB - pick.smallC;
        const det = da1 * db2 - da2 * db1;
        if (det === 0) {
          continue;
        }
        const bigSize = (pick.rA * db2 - pick.rB * db1) / det;
        const smallSize = (da1 * pick.rB - da2 * pick.rA) / det;
        if (!Number.isInteger(bigSize) || !Number.isInteger(smallSize) || bigSize <= 0 || smallSize <= 0) {
          continue;
        }
        const target = pick.bigC * bigSize + pick.smallC * smallSize;
        questions.push(
          `三個工地鋪設${pick.item}的量均相同。帶 ${pick.bigA} 大箱和 ${pick.smallA} 小箱去甲工地，剩 ${pick.rA} 片；帶 ${pick.bigB} 大箱和 ${pick.smallB} 小箱去乙工地，剩 ${pick.rB} 片；帶 ${pick.bigC} 大箱和 ${pick.smallC} 小箱去丙工地，剛好鋪完。求每大箱和每小箱各有多少片${pick.item}。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `大箱 ${bigSize} 片，小箱 ${smallSize} 片`,
          `設每大箱有 $x$ 片，每小箱有 $y$ 片。三工地需求量相同，設為 $T$。由甲工地得 $${pick.bigA}x+${pick.smallA}y-${pick.rA}=T$，乙工地得 $${pick.bigB}x+${pick.smallB}y-${pick.rB}=T$，丙工地得 $${pick.bigC}x+${pick.smallC}y=T$。代入丙工地消去 $T$，整理得聯立方程式 $${formatSystemLatex(`${formatLinearTwoTerms(da1, 'x', db1, 'y')}=${pick.rA}`, `${formatLinearTwoTerms(da2, 'x', db2, 'y')}=${pick.rB}`)}$。消去解得 $x=${bigSize},\\ y=${smallSize}$。`
        );
        continue;
      }

      if (variant === 1) {
        // 分配問題：每組分m個多出r，每組分n個不夠s → 求組數和總量
        const templates = [
          { m: 30, r: 8, n: 28, d: 12, item: '康乃馨' },
          { m: 5, r: 15, n: 4, d: 2, item: '糖果' },
          { m: 5, r: 3, n: 4, d: 2, item: '橘子' },
          { m: 6, r: 10, n: 5, d: 5, item: '蘋果' },
          { m: 8, r: 6, n: 7, d: 4, item: '餅乾' },
          { m: 10, r: 2, n: 9, d: 8, item: '飲料' },
          { m: 12, r: 6, n: 10, d: 8, item: '文具' },
        ];
        const pick = templates[cycle % templates.length];
        // 設組數為 g，總量為 t
        // t = m*g - r (每組m個，多出r)
        // t = n*g + d (每組n個，少d個)
        // m*g - r = n*g + d → g = (r+d)/(m-n)
        if (pick.m - pick.n === 0) {
          continue;
        }
        if ((pick.r + pick.d) % (pick.m - pick.n) !== 0) {
          continue;
        }
        const g = (pick.r + pick.d) / (pick.m - pick.n);
        const total = pick.m * g - pick.r;
        questions.push(
          `分配${pick.item}時，若每組分 ${pick.m} 個，則多出 ${pick.r} 個；若每組分 ${pick.n} 個，則不夠 ${pick.d} 個。設組數為 $x$，${pick.item}總數為 $y$，求組數和總數。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `有 ${g} 組，共 ${total} 個${pick.item}`,
          `設組數為 $x$，${pick.item}總數為 $y$。依題意可列聯立方程式：$${formatSystemLatex(`y=${pick.m}x-${pick.r}`, `y=${pick.n}x+${pick.d}`)}$。兩式相減得 $0=${pick.m - pick.n}x-${pick.r + pick.d}$，解得 $x=${g}$。代回得 $y=${total}$。`
        );
        continue;
      }

      // variant 3: 大小箱混裝問題 → 求個數
      const templates = [
        { bigCnt: 7, bigSize: 7, smallSize: 5, total: 259, unit: '顆水蜜桃' },
        { bigCnt: 5, bigSize: 8, smallSize: 5, total: 220, unit: '顆蘋果' },
        { bigCnt: 6, bigSize: 6, smallSize: 4, total: 180, unit: '個橘子' },
        { bigCnt: 8, bigSize: 5, smallSize: 3, total: 190, unit: '個柳丁' },
        { bigCnt: 4, bigSize: 9, smallSize: 6, total: 210, unit: '顆番茄' },
        { bigCnt: 6, bigSize: 7, smallSize: 4, total: 230, unit: '個奇異果' },
      ];
      const pick = templates[cycle % templates.length];
      // big boxes: bigCnt, small boxes: totalBoxes - bigCnt
      // 每大箱放bigSize，每小箱放smallSize
      // 找 totalBoxes 使得 bigCnt*bigSize + (totalBoxes-bigCnt)*smallSize = total
      const remainder = pick.total - pick.bigCnt * (pick.bigSize - pick.smallSize);
      if (remainder % pick.smallSize !== 0) {
        continue;
      }
      const totalBoxes = remainder / pick.smallSize;
      const smallBoxes = totalBoxes - pick.bigCnt;
      if (smallBoxes <= 0) {
        continue;
      }
      questions.push(
        `有大、小共 ${totalBoxes} 個盒子，大盒每個裝 ${pick.bigSize} ${pick.unit}，小盒每個裝 ${pick.smallSize} ${pick.unit}，共裝 ${pick.total} ${pick.unit}。求大盒和小盒各有幾個。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `大盒 ${pick.bigCnt} 個，小盒 ${smallBoxes} 個`,
        `設大盒有 $x$ 個，小盒有 $y$ 個。依題意可列聯立方程式：$${formatSystemLatex(`x+y=${totalBoxes}`, `${pick.bigSize}x+${pick.smallSize}y=${pick.total}`)}$。消去法：第二式減第一式乘以 ${pick.smallSize}，得 $(${pick.bigSize - pick.smallSize})x=${pick.total - pick.smallSize * totalBoxes}$，解得 $x=${pick.bigCnt}$。代回得 $y=${smallBoxes}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ221AxisDistanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const quadrantLabel = ['一', '二', '三', '四'];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const x = randInt(-9, 9) || 4;
        const y = randInt(-9, 9) || -3;
        questions.push(`如果點 $P(${x},${y})$ 表示平面上一點，求 $P$ 點到 $x$ 軸與 $y$ 軸的距離。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `到 $x$ 軸 ${Math.abs(y)}，到 $y$ 軸 ${Math.abs(x)}`,
          `點 $P(${x},${y})$ 到 $x$ 軸的距離看 $y$ 的絕對值，到 $y$ 軸的距離看 $x$ 的絕對值，所以到 $x$ 軸距離是 $|${y}|=${Math.abs(y)}$，到 $y$ 軸距離是 $|${x}|=${Math.abs(x)}$。`
        );
        continue;
      }

      const q = randInt(1, 4);
      const qLabel = quadrantLabel[q - 1];
      const dx = [3, 4, 5, 6, 7, 9][randInt(0, 5)];
      const dy = [2, 4, 6, 8, 9, 12][randInt(0, 5)];
      const point =
        q === 1 ? `(${dx},${dy})` : q === 2 ? `(-${dx},${dy})` : q === 3 ? `(-${dx},-${dy})` : `(${dx},-${dy})`;

      if (variant === 1) {
        questions.push(
          `已知點 $A$ 在第${qLabel}象限，且到 $x$ 軸距離為 ${dy}，到 $y$ 軸距離為 ${dx}，求點 $A$ 的座標。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$A${point}$`,
          `到 $y$ 軸距離是 $|x|=${dx}$，到 $x$ 軸距離是 $|y|=${dy}$。再依第${qLabel}象限判斷正負，可得 $A${point}$。`
        );
        continue;
      }

      questions.push(
        `若點 $P$ 位於第${qLabel}象限，且 $P$ 點到 $x$ 軸距離為 ${dy}，到 $y$ 軸距離為 ${dx}，求 $P$ 的座標。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$P${point}$`,
        `到兩軸的距離先告訴我們 $|x|=${dx}$、$|y|=${dy}$，再依第${qLabel}象限判斷正負，所以 $P${point}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ221QuadrantBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function quadrantName(x, y) {
      if (x > 0 && y > 0) return '第一象限';
      if (x < 0 && y > 0) return '第二象限';
      if (x < 0 && y < 0) return '第三象限';
      if (x > 0 && y < 0) return '第四象限';
      if (x === 0 && y === 0) return '原點';
      if (x === 0) return 'y 軸上';
      return 'x 軸上';
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const pts = [];
        while (pts.length < 3) {
          const x = randInt(-8, 8);
          const y = randInt(-8, 8);
          if (x === 0 && y === 0) continue;
          pts.push({ name: String.fromCharCode(65 + pts.length), x, y });
        }
        questions.push(
          `判斷下列各點分別位於哪一象限或哪一條坐標軸上：${pts.map((p) => `${p.name}(${p.x},${p.y})`).join('、')}。`
        );
        const result = pts.map((p) => `${p.name} 在${quadrantName(p.x, p.y)}`).join('，');
        pushAnswerWithManualSummary(answers, summaryAnswers, result, `${result}。`);
        continue;
      }

      if (variant === 1) {
        const s = pickNonZero(-6, 6);
        const t = pickNonZero(-6, 6);
        const aQuadrant = quadrantName(s / t, -t / s);
        const bQuadrant = quadrantName(-t * t, s * t);
        questions.push(
          `若 $s=${s},t=${t}$，則點 $A\\left(\\frac{s}{t},-\\frac{t}{s}\\right)$ 與 $B(-t^2,st)$ 分別位於第幾象限？`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$A$ 在${aQuadrant}，$B$ 在${bQuadrant}`,
          `代入 $s=${s},t=${t}$ 後，$\\frac{s}{t}$ 與 $-\\frac{t}{s}$ 的正負可判斷點 $A$ 在${aQuadrant}；又 $-t^2<0$，$st$ 的正負可判斷點 $B$ 在${bQuadrant}。`
        );
        continue;
      }

      const cycle = Math.floor(i / 3);
      const productForms = [
        { point: 'P(ab,a-b)', coordinate: '第一個坐標', positiveQuadrants: [1, 4] },
        { point: 'Q(a-b,ab)', coordinate: '第二個坐標', positiveQuadrants: [1, 2] },
        { point: 'R(ab,a+b)', coordinate: '第一個坐標', positiveQuadrants: [1, 4] },
        { point: 'S(a+b,ab)', coordinate: '第二個坐標', positiveQuadrants: [1, 2] },
      ];
      const combination = cycle % 16;
      const form = productForms[Math.floor(combination / 4)];
      const quadrant = (combination % 4) + 1;
      const productIsPositive = form.positiveQuadrants.includes(quadrant);
      const quadrantText = ['第一', '第二', '第三', '第四'][quadrant - 1];
      questions.push(`已知點 $${form.point}$ 在${quadrantText}象限，判斷 $a\\cdot b$ 為正數或負數。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$a\\cdot b$ 為${productIsPositive ? '正數' : '負數'}`,
        `在${quadrantText}象限時，${form.coordinate}的正負已確定；而 ${form.coordinate} 正是 $ab$，所以可判斷 $a\\cdot b$ 為${productIsPositive ? '正數' : '負數'}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ221TranslationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const x = randInt(-6, 6);
        const y = randInt(-6, 6);
        const right = randInt(2, 6);
        const up = randInt(2, 5);
        questions.push(`若從點 $A(${x},${y})$ 出發，先向右移 ${right} 單位，再向上移 ${up} 單位，求終點座標。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `終點 $(${x + right},${y + up})$`,
          `向右移 ${right} 單位表示 $x$ 坐標加 ${right}，向上移 ${up} 單位表示 $y$ 坐標加 ${up}，所以終點是 $(${x + right},${y + up})$。`
        );
        continue;
      }

      if (variant === 1) {
        const x = randInt(-6, 6);
        const y = randInt(-6, 6);
        const down = randInt(2, 6);
        const left = randInt(2, 5);
        questions.push(`若從點 $P(${x},${y})$ 出發，先下移 ${down} 單位，再左移 ${left} 單位，求終點座標。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `終點 $(${x - left},${y - down})$`,
          `下移 ${down} 單位表示 $y$ 坐標減 ${down}，左移 ${left} 單位表示 $x$ 坐標減 ${left}，所以終點是 $(${x - left},${y - down})$。`
        );
        continue;
      }

      const endX = randInt(-5, 5);
      const endY = randInt(-5, 5);
      const right = randInt(2, 6);
      const down = randInt(2, 5);
      const startX = endX - right;
      const startY = endY + down;
      questions.push(
        `若點 $E$ 先右移 ${right} 單位，再下移 ${down} 單位到達 $F(${endX},${endY})$，求原點 $E$ 的坐標。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$E(${startX},${startY})$`,
        `設點 $E$ 為 $(x,y)$。右移 ${right} 單位後 $x$ 變成 $${endX}$，所以原本 $x=${endX}-${right}=${startX}$；下移 ${down} 單位後 $y$ 變成 $${endY}$，所以原本 $y=${endY}+${down}=${startY}$。故點 $E$ 為 $(${startX},${startY})$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ221AxisSpecialSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const askXAxis = cycle % 2 === 0;
        const xAxisPool = [-7, -4, -1, 2, 5, 8];
        const yAxisPool = [-6, -3, 1, 4, 7];
        const offAxisPool = [
          { x: -5, y: 2 },
          { x: 3, y: -4 },
          { x: 6, y: 3 },
          { x: -2, y: -5 },
          { x: 4, y: 1 },
        ];
        const points = [];
        if (askXAxis) {
          points.push({ label: 'A', x: xAxisPool[cycle % xAxisPool.length], y: 0 });
          points.push({ label: 'B', x: xAxisPool[(cycle + 2) % xAxisPool.length], y: 0 });
          points.push({ label: 'C', x: 0, y: yAxisPool[cycle % yAxisPool.length] });
          points.push({ label: 'D', ...offAxisPool[cycle % offAxisPool.length] });
        } else {
          points.push({ label: 'A', x: 0, y: yAxisPool[cycle % yAxisPool.length] });
          points.push({ label: 'B', x: 0, y: yAxisPool[(cycle + 2) % yAxisPool.length] });
          points.push({ label: 'C', x: xAxisPool[cycle % xAxisPool.length], y: 0 });
          points.push({ label: 'D', ...offAxisPool[(cycle + 1) % offAxisPool.length] });
        }
        const shuffled = [...points].sort(() => Math.random() - 0.5);
        questions.push(
          `寫出下列點中哪些在 $${askXAxis ? 'x' : 'y'}$ 軸上：${shuffled.map((p) => `${p.label}(${p.x},${p.y})`).join('、')}。`
        );
        const target = shuffled
          .filter((p) => (askXAxis ? p.y === 0 : p.x === 0))
          .map((p) => `${p.label}(${p.x},${p.y})`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          target.join('、'),
          `在 $${askXAxis ? 'x' : 'y'}$ 軸上的點需滿足 ${askXAxis ? '$y=0$' : '$x=0$'}，所以答案是 ${target.join('、')}。`
        );
        continue;
      }

      if (variant === 1) {
        const xCoef = randInt(2, 7);
        const yCoef = randInt(2, 7);
        const k1 = pickNonZero(-5, 5);
        let k2 = pickNonZero(-5, 5);
        while (k2 === k1) k2 = pickNonZero(-5, 5);
        const xConst = -xCoef * k1;
        const yConst = -yCoef * k2;
        questions.push(
          `已知 $A(${xCoef}k${formatSignedNumber(xConst)},${yCoef}k${formatSignedNumber(yConst)})$ 不屬於任何象限，求 $k$ 的可能值。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$k=${k1}$ 或 $k=${k2}$`,
          `不屬於任何象限表示點在坐標軸上，所以要嘛 $${xCoef}k${formatSignedNumber(xConst)}=0$，要嘛 $${yCoef}k${formatSignedNumber(yConst)}=0$。解得 $k=${k1}$ 或 $k=${k2}$。`
        );
        continue;
      }

      const k = [-3, -2, 1, 4][randInt(0, 3)];
      const mCoef = [2, 3, 4, 6][randInt(0, 3)];
      const xConst = randInt(-8, 8);
      const yConst = -mCoef * k;
      questions.push(
        `已知有一點 $A(${xConst},${mCoef}m${yConst >= 0 ? '+' : ''}${yConst})$ 位在 $x$ 軸上，求 $A$ 點的完整坐標。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$A(${xConst},0)$`,
        `位在 $x$ 軸上的點需滿足 $y=0$，所以 $${mCoef}m${formatSignedNumber(yConst)}=0$，解得 $m=${k}$。代回後 $y=0$，因此 $A(${xConst},0)$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ221MidpointSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const x1 = randInt(-10, 8);
        const y1 = randInt(-8, 8);
        const mx = randInt(-6, 6);
        const my = randInt(-6, 6);
        const x2 = 2 * mx - x1;
        const y2 = 2 * my - y1;
        questions.push(`已知 $A(${x1},${y1})$、$B(${x2},${y2})$，求線段 $\\overline{AB}$ 的中點 $M$ 座標。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$M(${mx},${my})$`,
          `中點公式是 $M\\left(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2}\\right)$，所以 $M=\\left(\\frac{${x1}${formatSignedValue(x2)}}{2},\\frac{${y1}${formatSignedValue(y2)}}{2}\\right)=(${mx},${my})$。`
        );
        continue;
      }

      if (variant === 1) {
        const ax = randInt(-10, 10);
        const ay = randInt(-8, 8);
        const mx = randInt(-6, 6);
        const my = randInt(-6, 6);
        const bx = 2 * mx - ax;
        const by = 2 * my - ay;
        questions.push(
          `已知 $A(${ax},${ay})$、$M(${mx},${my})$，且 $M$ 為線段 $\\overline{AB}$ 的中點，求 $B$ 點座標。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$B(${bx},${by})$`,
          `因為中點滿足 $\\frac{${ax}+x_B}{2}=${mx}$、$\\frac{${ay}+y_B}{2}=${my}$，所以 $x_B=2\\times ${mx}${formatSignedValue(-ax)}=${bx}$，$y_B=2\\times ${my}${formatSignedValue(-ay)}=${by}$。故 $B(${bx},${by})$。`
        );
        continue;
      }

      const cx = randInt(-4, 4);
      const cy = randInt(-4, 4);
      const ax = randInt(-8, 8);
      const ay = randInt(-8, 8);
      const bx = 2 * cx - ax;
      const by = 2 * cy - ay;
      questions.push(
        `若圓心座標為 $(${cx},${cy})$，圓上一點 $A(${ax},${ay})$ 與點 $B$ 為直徑兩端，求另一端點 $B$ 的座標。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$B(${bx},${by})$`,
        `圓心是直徑中點，所以 $\\left(\\frac{${ax}+x_B}{2},\\frac{${ay}+y_B}{2}\\right)=(${cx},${cy})$。解得 $x_B=2\\times(${cx})-(${ax})=${bx}$，$y_B=2\\times(${cy})-(${ay})=${by}$，所以 $B(${bx},${by})$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ221SymmetrySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const x = randInt(-8, 8) || 3;
      const y = randInt(-8, 8) || -4;

      if (variant === 0) {
        questions.push(`求點 $A(${x},${y})$ 關於 $x$ 軸的對稱點座標。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(${x},${-y})$`,
          `關於 $x$ 軸對稱時，$x$ 坐標不變，$y$ 坐標變號，所以對稱點是 $(${x},${-y})$。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(`求點 $B(${x},${y})$ 關於 $y$ 軸的對稱點座標。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(${-x},${y})$`,
          `關於 $y$ 軸對稱時，$y$ 坐標不變，$x$ 坐標變號，所以對稱點是 $(${-x},${y})$。`
        );
        continue;
      }

      questions.push(`求點 $C(${x},${y})$ 關於原點的對稱點座標。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$(${-x},${-y})$`,
        `關於原點對稱時，$x$、$y$ 都變號，所以對稱點是 $(${-x},${-y})$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ221AreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const yBase = randInt(1, 4);
        const ax = randInt(-6, -1);
        const bx = randInt(ax + 2, ax + 7);
        const cx = randInt(-2, 5);
        const cy = yBase + randInt(2, 6);
        const base = bx - ax;
        const height = cy - yBase;
        const area = (base * height) / 2;
        questions.push(
          `已知 $\\triangle ABC$ 的三頂點為 $A(${ax},${yBase})$、$B(${bx},${yBase})$、$C(${cx},${cy})$，求 $\\triangle ABC$ 的面積。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `面積 $${area}$`,
          `因為 $A、B$ 在同一條水平線上，所以可把 $\\overline{AB}$ 當底，底長是 $${bx}-(${ax})=${base}$，高是 $${cy}-(${yBase})=${height}$。面積為 $\\frac{1}{2}\\times ${base}\\times ${height}=${area}$。`
        );
        continue;
      }

      if (variant === 1) {
        const left = randInt(-3, 2);
        const right = left + randInt(3, 6);
        const bottom = randInt(-2, 2);
        const top = bottom + randInt(2, 5);
        const area = (right - left) * (top - bottom);
        questions.push(
          `矩形 $ABCD$ 的四頂點分別為 $A(${left},${top})$、$B(${left},${bottom})$、$C(${right},${bottom})$、$D(${right},${top})$，求其面積。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `面積 $${area}$`,
          `矩形的長是 $${right}-(${left})=${right - left}$，寬是 $${top}-(${bottom})=${top - bottom}$，所以面積是 $${right - left}\\times ${top - bottom}=${area}$。`
        );
        continue;
      }

      const ax = -randInt(3, 6);
      const bx = randInt(4, 9);
      const y = randInt(3, 7);
      const width = bx - ax;
      const area = (width * y) / 2;
      questions.push(`若 $A(${ax},0)$、$B(${bx},0)$、$C(a,${y})$ 為坐標平面上三點，求 $\\triangle ABC$ 的面積。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `面積 $${area}$`,
        `點 $A、B$ 在 $x$ 軸上，所以可把 $\\overline{AB}$ 當底，底長是 $${bx}-(${ax})=${width}$；點 $C$ 到 $x$ 軸的高是 ${y}。因此面積為 $\\frac{1}{2}\\times ${width}\\times ${y}=${area}$，和 $a$ 的值無關。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ221QuadrantReasoningSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    function qName(id) {
      return ['第一象限', '第二象限', '第三象限', '第四象限'][id - 1];
    }

    function signsForQuadrant(id) {
      return [
        [1, 1],
        [-1, 1],
        [-1, -1],
        [1, -1],
      ][id - 1];
    }

    function quadrantFromSigns(xSign, ySign) {
      if (xSign > 0) return ySign > 0 ? 1 : 4;
      return ySign > 0 ? 2 : 3;
    }

    function signCondition(name, sign) {
      return `${name}${sign > 0 ? '>0' : '<0'}`;
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const q = (cycle % 4) + 1;
        const productPositive = q === 1 || q === 3;
        const forms = [
          { point: 'Q(a^2,ab)', xReason: '$a^2>0$', ySign: productPositive ? 1 : -1 },
          { point: 'Q(a^2,-ab)', xReason: '$a^2>0$', ySign: productPositive ? -1 : 1 },
          { point: 'Q(b^2,ab)', xReason: '$b^2>0$', ySign: productPositive ? 1 : -1 },
        ];
        const form = forms[cycle % forms.length];
        const result = quadrantFromSigns(1, form.ySign);
        questions.push(`若點 $P(a,b)$ 在${qName(q)}，則點 $${form.point}$ 在第幾象限？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          qName(result),
          `在${qName(q)}時，$ab$ ${productPositive ? '為正' : '為負'}；又 ${form.xReason}，可得 $${form.point}$ 在${qName(result)}。`
        );
        continue;
      }

      if (variant === 1) {
        const [aSign, bSign] = [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ][Math.floor(cycle / 4) % 4];
        const forms = [
          { point: 'A(a,b^2)', xSign: aSign, ySign: 1 },
          { point: 'A(-a,b^2)', xSign: -aSign, ySign: 1 },
          { point: 'A(a^2,b)', xSign: 1, ySign: bSign },
          { point: 'A(a^2,-b)', xSign: 1, ySign: -bSign },
        ];
        const form = forms[cycle % forms.length];
        const result = quadrantFromSigns(form.xSign, form.ySign);
        questions.push(
          `已知 $${signCondition('a', aSign)}$、$${signCondition('b', bSign)}$，判斷點 $${form.point}$ 位於第幾象限。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          qName(result),
          `由 $${signCondition('a', aSign)}$、$${signCondition('b', bSign)}$，再注意平方一定為正數及負號會改變正負，可得 $${form.point}$ 在${qName(result)}。`
        );
        continue;
      }

      if (variant === 2) {
        const quadrant = (Math.floor(cycle / 4) % 4) + 1;
        const [sSign, tSign] = signsForQuadrant(quadrant);
        const forms = [
          { point: 'B(-t,s)', xSign: -tSign, ySign: sSign },
          { point: 'B(t,-s)', xSign: tSign, ySign: -sSign },
          { point: 'B(-s,-t)', xSign: -sSign, ySign: -tSign },
          { point: 'B(s,-t)', xSign: sSign, ySign: -tSign },
        ];
        const form = forms[cycle % forms.length];
        const result = quadrantFromSigns(form.xSign, form.ySign);
        questions.push(`若點 $A(s,t)$ 在${qName(quadrant)}，則點 $${form.point}$ 在第幾象限？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          qName(result),
          `在${qName(quadrant)}時，$s、t$ 的正負可先判斷出來，再代入 $${form.point}$，可知此點在${qName(result)}。`
        );
        continue;
      }

      if (variant === 3) {
        const q = (cycle % 4) + 1;
        const productPositive = q === 1 || q === 3;
        const forms = [
          { point: 'R(ab,b^2)', xSign: productPositive ? 1 : -1 },
          { point: 'R(-ab,b^2)', xSign: productPositive ? -1 : 1 },
          { point: 'R(ab,a^2)', xSign: productPositive ? 1 : -1 },
          { point: 'R(-ab,a^2)', xSign: productPositive ? -1 : 1 },
        ];
        const form = forms[Math.floor(cycle / 4) % forms.length];
        const result = quadrantFromSigns(form.xSign, 1);
        questions.push(`若點 $P(a,b)$ 在${qName(q)}，則點 $${form.point}$ 在第幾象限？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          qName(result),
          `在${qName(q)}時，$ab$ ${productPositive ? '為正' : '為負'}，而平方項一定為正數，所以 $${form.point}$ 在${qName(result)}。`
        );
        continue;
      }

      const q = (cycle % 4) + 1;
      const [aSign] = signsForQuadrant(q);
      const forms = [
        { point: 'S(-a,b^2)', xSign: -aSign, ySign: 1 },
        { point: 'S(a,b^2)', xSign: aSign, ySign: 1 },
        { point: 'S(-a,-b^2)', xSign: -aSign, ySign: -1 },
        { point: 'S(a,-b^2)', xSign: aSign, ySign: -1 },
      ];
      const form = forms[Math.floor(cycle / 4) % forms.length];
      const result = quadrantFromSigns(form.xSign, form.ySign);
      questions.push(`若點 $P(a,b)$ 在${qName(q)}，則點 $${form.point}$ 在第幾象限？`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        qName(result),
        `由 ${form.point} 的各坐標正負，可知平方項的正負固定，而 $a$ 前的負號會改變橫坐標正負，因此此點在${qName(result)}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ221NonnegativeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const x = randInt(-4, 4);
        const y = randInt(-4, 4);
        const c1 = 3 * x - 7 * y;
        const c2 = 2 * x + y;
        questions.push(
          `若 $|3x-7y${formatSignedNumber(-c1)}|+|2x+y${formatSignedNumber(-c2)}|=0$，求數對 $(x,y)$ 所在的象限。`
        );
        const position = quadrantText(x, y);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(x,y)=(${x},${y})$，在${position}`,
          `因為兩個絕對值和為 0，所以必須同時為 0，可列 $3x-7y=${c1}$、$2x+y=${c2}$。解得 $(x,y)=(${x},${y})$，所以數對在${position}。`
        );
        continue;
      }

      if (variant === 1) {
        const pick = {
          p: pickNonZero(-4, 4),
          q: randInt(-8, 8),
          r: pickNonZero(-4, 4),
          s: pickNonZero(-4, 4),
          t: randInt(-8, 8),
        };
        const x = divFraction(makeFraction(-pick.q, 1), makeFraction(pick.p, 1));
        const y = subFraction(makeFraction(-pick.t, 1), mulFraction(makeFraction(pick.r, 1), x));
        const yFinal = divFraction(y, makeFraction(pick.s, 1));
        const xText = fractionToLatex(x, true);
        const yText = fractionToLatex(yFinal, true);
        const term1 = formatLinearExpr(pick.p, pick.q);
        const term2 = formatTwoVarExpr(pick.r, pick.s, pick.t);
        questions.push(`已知 $(${term1})^2+(${term2})^2=0$，求點 $(x,y)$ 的座標。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(${xText},${yText})$`,
          `平方和為 0，表示兩項都要是 0，所以可列 $${term1}=0$、$${term2}=0$。先由第一式得 $x=${xText}$，再代入第二式得 $y=${yText}$，所以點為 $(${xText},${yText})$。`
        );
        continue;
      }

      const p = pickNonZero(-4, 4);
      const q = pickNonZero(-4, 4);
      const r = pickNonZero(-4, 4);
      let s = pickNonZero(-4, 4);
      while (p * s - q * r === 0) s = pickNonZero(-4, 4);
      const pick = { c1: pickNonZero(-12, 12), c2: pickNonZero(-12, 12), p, q, r, s };
      const det = pick.p * pick.s - pick.q * pick.r;
      if (det === 0) {
        i -= 1;
        continue;
      }
      const aVal = simplifyFraction(pick.c1 * pick.s - pick.q * pick.c2, det);
      const bVal = simplifyFraction(pick.p * pick.c2 - pick.c1 * pick.r, det);
      const axisDist = makeFraction(Math.abs(bVal.num), bVal.den);
      const eq1 = `${formatTerm(pick.p, 'a')}${pick.q >= 0 ? '+' : ''}${formatTerm(pick.q, 'b')}${pick.c1 >= 0 ? '-' : '+'}${Math.abs(pick.c1)}`;
      const eq2 = `${formatTerm(pick.r, 'a')}${pick.s >= 0 ? '+' : ''}${formatTerm(pick.s, 'b')}${pick.c2 >= 0 ? '-' : '+'}${Math.abs(pick.c2)}`;
      questions.push(`若 $|${eq1}|+(${eq2})^2=0$，求點 $P(a,b)$ 到 $x$ 軸的距離。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$|b|=${fractionToLatex(axisDist, true)}$`,
        `由非負性質可知 $${eq1}=0$ 且 $${eq2}=0$。解此聯立方程式可得 $a=${fractionToLatex(aVal, true)},\\ b=${fractionToLatex(bVal, true)}$。點 $P(a,b)$ 到 $x$ 軸的距離是 $|b|=${fractionToLatex(axisDist, true)}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function quadrantText(x, y) {
    if (x > 0 && y > 0) return '第一象限';
    if (x < 0 && y > 0) return '第二象限';
    if (x < 0 && y < 0) return '第三象限';
    if (x > 0 && y < 0) return '第四象限';
    if (x === 0 && y === 0) return '原點';
    if (x === 0) return 'y 軸上';
    return 'x 軸上';
  }

  function buildJ221QuadrantCoordinateConstraintsCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const aPositive = randInt(0, 1) === 1;
        const a = aPositive ? randInt(4, 9) : -randInt(1, 4);
        const b = aPositive ? -randInt(1, a - 1) : randInt(Math.abs(a) + 1, Math.abs(a) + 6);
        const px = a + b;
        const py = a * b;
        questions.push(`若點 $P(a+b,ab)$ 在${quadrantText(px, py)}，且 $a,b$ 異號，判斷點 $Q(a,b)$ 在第幾象限。`);
        summaryAnswers.push(`$Q$ 在${quadrantText(a, b)}`);
        answers.push(
          `由 $ab<0$ 知 $a,b$ 異號；又 $a+b=${px > 0 ? '正' : '負'}$，可判斷絕對值較大的數為${px > 0 ? '正數' : '負數'}。因此 $a=${a > 0 ? '正' : '負'}$、$b=${b > 0 ? '正' : '負'}$，所以 $Q(a,b)$ 在${quadrantText(a, b)}。`
        );
      } else if (mode === 1) {
        const m = randInt(-5, 5);
        const n = randInt(-5, 5);
        const ax = m - 3;
        const ay = n + 1;
        const bx = -ax;
        const by = -ay;
        questions.push(
          `已知 $A(m-3,n+1)$ 與 $B(${bx},${by})$ 關於原點對稱，若 $m=${m}$、$n=${n}$，檢查此組資料是否符合，並寫出 $A,B$。`
        );
        summaryAnswers.push(`符合，$A(${ax},${ay})$，$B(${bx},${by})$`);
        answers.push(
          `關於原點對稱時，兩點坐標要互為相反數。代入 $m=${m},n=${n}$ 得 $A(${ax},${ay})$，其相反點為 $(${bx},${by})$，正是 $B$，所以符合。`
        );
      } else if (mode === 2) {
        const magnitude = randInt(2, 12);
        const conditions = [
          {
            first: 'xy>0',
            second: `x+y=${magnitude}`,
            answer: '第一象限',
            detail: '$x,y$ 同號，且和為正，所以兩者同為正。',
          },
          {
            first: 'xy<0',
            second: `x-y=-${magnitude}`,
            answer: '第二象限',
            detail: '$x,y$ 異號，且 $x-y<0$，所以 $x<0,y>0$。',
          },
          {
            first: 'xy>0',
            second: `x+y=-${magnitude}`,
            answer: '第三象限',
            detail: '$x,y$ 同號，且和為負，所以兩者同為負。',
          },
          {
            first: 'xy<0',
            second: `x-y=${magnitude}`,
            answer: '第四象限',
            detail: '$x,y$ 異號，且 $x-y>0$，所以 $x>0,y<0$。',
          },
        ];
        const pick = conditions[Math.floor(i / 5) % conditions.length];
        questions.push(`若點 $P(x,y)$ 滿足 $${pick.first}$ 且 $${pick.second}$，判斷 $P$ 點所在象限。`);
        summaryAnswers.push(pick.answer);
        answers.push(`由 ${pick.detail} 因此 $P$ 在${pick.answer}。`);
      } else if (mode === 3) {
        const dx = randInt(2, 8);
        const dy = randInt(2, 8);
        const points = [
          [dx, dy],
          [dx, -dy],
          [-dx, dy],
          [-dx, -dy],
        ];
        questions.push(`若點 $P(a,b)$ 到 $x$ 軸距離為 ${dy}，到 $y$ 軸距離為 ${dx}，求 $P$ 點所有可能的坐標。`);
        summaryAnswers.push(points.map(([x, y]) => `$(${x},${y})$`).join('、'));
        answers.push(
          `到 $y$ 軸距離為 ${dx} 表示 $|a|=${dx}$；到 $x$ 軸距離為 ${dy} 表示 $|b|=${dy}$。因此共有四種可能：${points.map(([x, y]) => `$(${x},${y})$`).join('、')}。`
        );
      } else {
        const a = randInt(-5, 5);
        const b = randInt(-5, 5);
        const c1 = 2 * a - b;
        const c2 = a + 3 * b;
        const value = a * a + b * b;
        questions.push(`若點 $M(2a-b,a+3b)$ 的坐標為 $(${c1},${c2})$，求 $a^2+b^2$。`);
        summaryAnswers.push(`$${value}$`);
        answers.push(
          `由點坐標可列 $2a-b=${c1}$、$a+3b=${c2}$。聯立可得 $a=${a},\\ b=${b}$。所以 $a^2+b^2=(${a})^2+(${b})^2=${value}$。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ221CoordinateAreaMidpointCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const ax = -randInt(2, 6);
        const bx = randInt(3, 8);
        const yBase = randInt(-2, 3);
        const area = ((bx - ax) * randInt(2, 6)) / 2;
        const height = (2 * area) / (bx - ax);
        if (!Number.isInteger(height)) {
          i -= 1;
          continue;
        }
        const cy1 = yBase + height;
        const cy2 = yBase - height;
        questions.push(
          `已知 $\\triangle ABC$ 的三頂點為 $A(${ax},${yBase})$、$B(${bx},${yBase})$，面積為 ${area}，且 $C$ 點在 $y$ 軸上，求 $C$ 點坐標。`
        );
        summaryAnswers.push(`$C(0,${cy1})$ 或 $C(0,${cy2})$`);
        answers.push(
          `底邊 $AB$ 長為 $${bx}-(${ax})=${bx - ax}$。由面積 $${area}=\\dfrac12\\times ${bx - ax}\\times h$，得高 $h=${height}$。因為 $C$ 在 $y$ 軸上，且到直線 $y=${yBase}$ 的距離為 ${height}，所以 $C(0,${cy1})$ 或 $C(0,${cy2})$。`
        );
      } else if (mode === 1) {
        const ax = randInt(-4, 2);
        const ay = randInt(-3, 3);
        const bx = ax + randInt(3, 7);
        const by = ay;
        const cx = bx + randInt(1, 5);
        const cy = ay + randInt(2, 6);
        const dx = ax + cx - bx;
        const dy = ay + cy - by;
        questions.push(
          `平行四邊形 $ABCD$ 的三個頂點為 $A(${ax},${ay})$、$B(${bx},${by})$、$C(${cx},${cy})$，求第四個頂點 $D$ 的坐標。`
        );
        summaryAnswers.push(`$D(${dx},${dy})$`);
        answers.push(
          `平行四邊形依序為 $A,B,C,D$ 時，對角線中點相同，所以 $A+C=B+D$。因此 $D=A+C-B=((${ax})+(${cx})-(${bx}),(${ay})+(${cy})-(${by}))=(${dx},${dy})$。`
        );
      } else if (mode === 2) {
        const xInt = randInt(2, 10);
        const yInt = -randInt(2, 10);
        const a = Math.abs(yInt);
        const b = -xInt;
        const c = a * xInt;
        const area = Math.abs((xInt * yInt) / 2);
        questions.push(`求直線 $${formatAxByEq(a, b, c)}$ 與兩坐標軸所圍成三角形的面積。`);
        summaryAnswers.push(`面積 $${area}$`);
        answers.push(
          `令 $y=0$ 得 $x=${xInt}$；令 $x=0$ 得 $y=${yInt}$。兩截距與原點形成直角三角形，面積為 $\\dfrac12\\times |${xInt}|\\times |${yInt}|=${area}$。`
        );
      } else if (mode === 3) {
        const ax = randInt(-4, 4);
        const ay = randInt(-4, 4);
        const dx = randInt(-5, 5) || 3;
        const dy = randInt(-5, 5) || -2;
        const bx = ax + dx;
        const by = ay + dy;
        const mx = (ax + bx) / 2;
        const my = (ay + by) / 2;
        if (!Number.isInteger(mx) || !Number.isInteger(my)) {
          i -= 1;
          continue;
        }
        questions.push(
          `點 $A(${ax},${ay})$ 經平移後到達 $B$，若 $\\overline{AB}$ 的中點為 $M(${mx},${my})$，求平移方向與距離。`
        );
        summaryAnswers.push(`平移 $(${dx},${dy})$，距離 $\\sqrt{${dx * dx + dy * dy}}$`);
        answers.push(
          `由中點公式可反求 $B(2\\times(${mx})-(${ax}),2\\times(${my})-(${ay}))=(${bx},${by})$。所以平移向量為 $(${bx}-(${ax}),${by}-(${ay}))=(${dx},${dy})$，距離為 $\\sqrt{${dx * dx}+${dy * dy}}=\\sqrt{${dx * dx + dy * dy}}$。`
        );
      } else {
        const x1 = randInt(-3, 3);
        const y1 = randInt(-3, 3);
        const side = randInt(3, 7);
        const x2 = x1 + side;
        const y2 = y1 + side;
        questions.push(
          `在坐標平面上，有一正方形的對角線端點為 $(${x1},${y1})$ 與 $(${x2},${y2})$，且邊平行於坐標軸，求另外兩個頂點坐標。`
        );
        summaryAnswers.push(`$(${x1},${y2})$、$(${x2},${y1})$`);
        answers.push(
          `邊平行於坐標軸時，另外兩點會交換兩端點的 $x$ 與 $y$ 坐標，所以是 $(${x1},${y2})$ 與 $(${x2},${y1})$。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ221CoordinateTransformMultistepCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const points = [
          [randInt(-4, 0), randInt(1, 5)],
          [randInt(1, 5), randInt(1, 5)],
          [randInt(-2, 4), randInt(-4, 0)],
        ];
        const left = randInt(1, 4);
        const scale = randInt(2, 4);
        const dx = -left;
        const dy = 2;
        const transformed = points.map(([x, y]) => [scale * (x + dx), scale * (y + dy)]);
        questions.push(
          `將 $\\triangle ABC$ 先向上平移 2 單位，再向左平移 ${left} 單位，接著把所有坐標放大為 ${scale} 倍。若原座標為 $A(${points[0][0]},${points[0][1]})$、$B(${points[1][0]},${points[1][1]})$、$C(${points[2][0]},${points[2][1]})$，求新三角形的三頂點坐標。`
        );
        summaryAnswers.push(
          transformed.map((p, idx) => `${String.fromCharCode(65 + idx)}'(${p[0]},${p[1]})`).join('、')
        );
        answers.push(
          `平移後先把每點改為 $(x-${left},y+2)$，再把坐標同乘 ${scale}。逐點計算得 ${transformed.map((p, idx) => `${String.fromCharCode(65 + idx)}'(${p[0]},${p[1]})`).join('、')}。`
        );
      } else if (mode === 1) {
        const bx = randInt(-3, 5);
        const by = randInt(-4, 4);
        const right = randInt(2, 6);
        const ax = bx - right;
        questions.push(`若點 $A(x,y)$ 向右移 ${right} 單位後與點 $B(${bx},${by})$ 重合，求 $A$ 點坐標。`);
        summaryAnswers.push(`$A(${ax},${by})$`);
        answers.push(
          `向右移 ${right} 單位代表 $x$ 坐標加 $${right}$。所以原來 $x=${bx}-${right}=${ax}$，$y$ 不變，故 $A(${ax},${by})$。`
        );
      } else if (mode === 2) {
        const ax = randInt(-5, 2);
        const ay = randInt(-5, 2);
        const mx = randInt(-2, 6);
        const my = randInt(-2, 6);
        const bx = 2 * mx - ax;
        const by = 2 * my - ay;
        questions.push(`一個圓的直徑端點為 $A(${ax},${ay})$ 與 $B(${bx},${by})$，求圓心坐標。`);
        summaryAnswers.push(`$(${mx},${my})$`);
        answers.push(
          `圓心是直徑中點，所以坐標為 $\\left(\\dfrac{${ax}${formatSignedValue(bx)}}{2},\\dfrac{${ay}${formatSignedValue(by)}}{2}\\right)=(${mx},${my})$。`
        );
      } else if (mode === 3) {
        const y = [2, -2][randInt(0, 1)];
        const d = randInt(2, 8);
        questions.push(`若點 $P$ 在直線 $y=${y}$ 上，且 $P$ 點到 $y$ 軸的距離為 ${d}，求 $P$ 點所有可能坐標。`);
        summaryAnswers.push(`$(${d},${y})$ 或 $(-${d},${y})$`);
        answers.push(
          `在直線 $y=${y}$ 上表示縱坐標固定為 ${y}；到 $y$ 軸距離為 ${d} 表示 $|x|=${d}$。所以 $P(${d},${y})$ 或 $P(-${d},${y})$。`
        );
      } else {
        const unit = randInt(1, 12);
        const a = 2 * unit;
        const b = 3 * unit;
        const total = a + b;
        questions.push(`若點 $A(a,b)$ 在直線 $x+y=${total}$ 上，且 $a:b=2:3$，求 $a,b$。`);
        summaryAnswers.push(`$a=${a}$，$b=${b}$`);
        answers.push(
          `由 $a:b=2:3$，設 $a=2t,b=3t$。代入 $a+b=${total}$ 得 $5t=${total}$，所以 $t=${unit}$，故 $a=${a},b=${b}$。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function formatAxByEq(a, b, c) {
    const xTerm = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
    const yAbs = Math.abs(b);
    const yTerm = yAbs === 1 ? 'y' : `${yAbs}y`;
    return `${xTerm}${b >= 0 ? '+' : '-'}${yTerm}=${c}`;
  }

  function formatSlopeTerm(m, variable = 'x') {
    if (m === 1) return variable;
    if (m === -1) return `-${variable}`;
    return `${m}${variable}`;
  }

  function formatFractionSlopeTerm(fraction, variable = 'x') {
    if (fraction.den === 1) return formatSlopeTerm(fraction.num, variable);
    return `${fractionToLatex(fraction)}${variable}`;
  }

  function formatSignedFractionConstant(fraction) {
    if (fraction.num === 0) return '';
    const text = fractionToLatex(fraction, true);
    return fraction.num > 0 ? `+${text}` : text;
  }

  function formatLineSlopeIntercept(m, b) {
    const slopePart = formatSlopeTerm(m, 'x');
    if (b === 0) return `y=${slopePart}`;
    return `y=${slopePart}${b > 0 ? '+' : ''}${b}`;
  }

  function formatSignedConstant(value) {
    if (value === 0) return '';
    return `${value > 0 ? '+' : ''}${value}`;
  }

  function normalizeLine(a, b, c) {
    const g = gcd(gcd(Math.abs(a), Math.abs(b)), Math.abs(c));
    let na = a / g;
    let nb = b / g;
    let nc = c / g;
    if (na < 0 || (na === 0 && nb < 0)) {
      na *= -1;
      nb *= -1;
      nc *= -1;
    }
    return { a: na, b: nb, c: nc };
  }

  function lineThroughPointsStd(x1, y1, x2, y2) {
    const a = y1 - y2;
    const b = x2 - x1;
    const c = a * x1 + b * y1;
    return normalizeLine(a, b, c);
  }

  function buildJ222PointLineRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const a = [2, 3, 4, 5][randInt(0, 3)];
        const b = [1, 2, 3, 4][randInt(0, 3)];
        const y0 = randInt(-4, 4);
        const m = randInt(-5, 5);
        const c = a * m + b * y0;
        questions.push(`若點 $(m,${y0})$ 在直線 $${formatAxByEq(a, b, c)}$ 上，求 $m$ 的值。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$m=${m}$`,
          `點在直線上，表示把坐標代入方程式後等號一定成立，所以可列 $${a}m${formatSignedNumber(b * y0)}=${c}$。整理可得 $m=${m}$。`
        );
        continue;
      }

      if (variant === 1) {
        const p = [2, 3, 4][randInt(0, 2)];
        const q = [-5, -4, -3][randInt(0, 2)];
        const aValue = [1, 2, 3, 4][randInt(0, 3)];
        const r = (p - q) * aValue;
        questions.push(`若點 $(${p}a,${q}a+${r})$ 在直線 $x=y$ 上，求 $a$ 的值。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$a=${aValue}$`,
          `在直線 $x=y$ 上，表示橫坐標與縱坐標相等，所以可列 $${p}a=${q}a+${r}$。移項得 $${p - q}a=${r}$，所以 $a=${aValue}$。`
        );
        continue;
      }

      const a = [1, 2, 3, 4][randInt(0, 3)];
      const b = [1, 2, 3, 5][randInt(0, 3)];
      const c0 = randInt(-8, 8);
      const k = c0;
      questions.push(`若方程式 $${formatTwoVarExpr(a, -b, c0)}-k=0$ 的圖形通過原點 $(0,0)$，求 $k$ 的值。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$k=${k}$`,
        `圖形通過原點表示把 $(0,0)$ 代入後要成立，所以原式變成 $${c0}-k=0$，因此 $k=${k}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ222InterceptAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const xInt = randInt(2, 12);
        const yInt = randInt(2, 12);
        const a = yInt;
        const b = xInt;
        const c = xInt * yInt;
        const area = (xInt * yInt) / 2;
        questions.push(`求直線 $${formatAxByEq(a, b, c)}$ 與兩坐標軸的交點座標，並求其圍成的三角形面積。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$x$ 軸截距 $${xInt}$，$y$ 軸截距 $${yInt}$，面積 $${area}$`,
          `令 $y=0$，得 $${a}x=${c}$，所以與 $x$ 軸交於 $(${xInt},0)$；令 $x=0$，得 $${b}y=${c}$，所以與 $y$ 軸交於 $(0,${yInt})$。因此與坐標軸圍成的三角形面積為 $\\frac{1}{2}\\times ${xInt}\\times ${yInt}=${area}$。`
        );
        continue;
      }

      if (variant === 1) {
        const absA = randInt(2, 12);
        const b = randInt(2, 8);
        const area = (absA * b) / 2;
        questions.push(
          `若直線 $\\frac{x}{a}+\\frac{y}{${b}}=1$ 的圖形與兩軸所圍成的三角形面積為 ${area}，且直線不通過第四象限，求 $a$ 的值。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$a=-${absA}$`,
          `這條直線的截距是 $(a,0)$ 與 $(0,${b})$，所以三角形面積是 $\\frac{1}{2}\\times |a|\\times ${b}=${area}$，可得 $|a|=${absA}$。又題目說不通過第四象限，$x$ 截距必須為負，因此 $a=-${absA}$。`
        );
        continue;
      }

      const m = randInt(1, 5);
      const xInt = randInt(2, 10);
      const b = m * xInt;
      const area = (xInt * b) / 2;
      questions.push(
        `方程式 $${formatLineSlopeIntercept(-m, b)}$ 與兩軸交於 $P,Q$ 兩點，求 $\\triangle POQ$（$O$ 為原點）的面積。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `面積 $${area}$`,
        `令 $x=0$，得 $y=${b}$，所以一個截距點是 $(0,${b})$；令 $y=0$，得 $x=${xInt}$，另一個截距點是 $(${xInt},0)$。因此 $\\triangle POQ$ 的面積為 $\\frac{1}{2}\\times ${xInt}\\times ${b}=${area}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ222QuadrantExclusionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const c = randInt(2, 12);

      if (variant === 0) {
        questions.push(`已知 $a<0$，則一次函數 $f(x)=ax+${c}$ 的圖形不通過第幾象限？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          '第三象限',
          `因為斜率 $a<0$，圖形往右下降，且截距是 $${c}>0$，所以直線會經過第一、第二、第四象限，不會通過第三象限。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(`若 $a<0$，則一次函數 $y=ax-${c}$ 的圖形不通過第幾象限？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          '第一象限',
          `因為斜率 $a<0$，且截距是 $-${c}<0$，所以直線會經過第二、第三、第四象限，不會通過第一象限。`
        );
        continue;
      }

      if (variant === 2) {
        questions.push(`已知 $a>0$，則一次函數 $y=ax+${c}$ 的圖形不通過第幾象限？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          '第四象限',
          `因為斜率 $a>0$，且截距是 $${c}>0$，所以直線會經過第一、第二、第三象限，不會通過第四象限。`
        );
        continue;
      }

      if (variant === 3) {
        questions.push(`已知 $a>0$，則一次函數 $y=ax-${c}$ 的圖形不通過第幾象限？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          '第二象限',
          `因為斜率 $a>0$，且截距是 $-${c}<0$，所以直線會經過第一、第三、第四象限，不會通過第二象限。`
        );
        continue;
      }

      questions.push(`若 $ab>0$ 且 $a+b<0$，則直線 $ax+by+${c}=0$ 不通過第幾象限？`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        '第三象限',
        `由 $ab>0$ 且 $a+b<0$ 可知 $a,b$ 都是負數。把式子改寫成 $y=-\\frac{a}{b}x-\\frac{${c}}{b}$，可知斜率為負、截距為正，因此圖形經過第一、第二、第四象限，不通過第三象限。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ222ParallelPerpendicularSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const x0 = randInt(-6, 6);
        const y0 = randInt(-6, 6);
        questions.push(`寫出通過點 $(${x0},${y0})$ 且平行 $y$ 軸的直線方程式。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$x=${x0}$`,
          `平行 $y$ 軸的直線是鉛直線，所有點的 $x$ 坐標都相同，所以方程式是 $x=${x0}$。`
        );
        continue;
      }

      if (variant === 1) {
        const x1 = randInt(-6, 0);
        const x2 = randInt(1, 8);
        const y = randInt(-5, 5);
        questions.push(`直線通過點 $(${x1},${y})$ 與 $(${x2},${y})$ 兩點，求此直線方程式。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$y=${y}$`,
          `兩點的 $y$ 坐標相同，表示這是一條水平線，所以方程式是 $y=${y}$。`
        );
        continue;
      }

      if (variant === 2) {
        const x = randInt(-6, 6);
        const y = makeFraction(randInt(-7, 7), 2);
        questions.push(`通過點 $(${x},${fractionToLatex(y)})$ 且垂直 $y$ 軸的直線方程式為何？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$y=${fractionToLatex(y)}$`,
          `垂直 $y$ 軸就是平行 $x$ 軸，這是一條水平線，所以方程式是 $y=${fractionToLatex(y)}$。`
        );
        continue;
      }

      const x = randInt(-5, 5);
      const y1 = randInt(-6, 0);
      const y2 = randInt(1, 7);
      questions.push(`直線通過點 $(${x},${y1})$ 與 $(${x},${y2})$ 兩點，求此直線方程式。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$x=${x}$`,
        `兩點的 $x$ 坐標相同，表示這是一條鉛直線，所以方程式是 $x=${x}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ222LineFromPointsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function findPointsForFixedLine(a, b) {
      const pts = [];
      for (let x = -5; x <= 5; x += 1) {
        const remain = 3 - a * x;
        if (remain % b !== 0) continue;
        const y = remain / b;
        pts.push({ x, y });
      }
      return pts;
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const m = pickNonZero(-3, 3);
        const b = randInt(-5, 5);
        const x1 = randInt(-3, 1);
        const x2 = x1 + randInt(2, 4);
        const y1 = m * x1 + b;
        const y2 = m * x2 + b;
        questions.push(`若直線 $y=ax+b$ 通過點 $(${x1},${y1})$ 與 $(${x2},${y2})$，求此直線方程式。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${formatLineSlopeIntercept(m, b)}$`,
          `把兩點代入 $y=ax+b$，可列聯立方程式 $${formatSystemLatex(`${formatTwoVarExpr(x1, 1).replace(/x/g, 'a').replace(/y/g, 'b')}=${y1}`, `${formatTwoVarExpr(x2, 1).replace(/x/g, 'a').replace(/y/g, 'b')}=${y2}`)}$。相減可得 $a=${m}$，再代回得 $b=${b}$，所以直線方程式是 $${formatLineSlopeIntercept(m, b)}$。`
        );
        continue;
      }

      if (variant === 1) {
        let a = 1;
        let b = 1;
        let pts = [];
        while (pts.length < 2) {
          a = pickNonZero(-3, 3);
          b = pickNonZero(-3, 3);
          if (gcd(Math.abs(a), Math.abs(b)) !== 1 && gcd(Math.abs(a), Math.abs(b)) !== 3) continue;
          pts = findPointsForFixedLine(a, b).filter((p) => !(p.x === 0 && p.y === 0));
        }
        const p1 = pts[randInt(0, pts.length - 1)];
        let p2 = pts[randInt(0, pts.length - 1)];
        while (p2.x === p1.x && p2.y === p1.y) p2 = pts[randInt(0, pts.length - 1)];
        questions.push(
          `已知直線 $ax+by=3$ 通過點 $(${p1.x},${p1.y})$ 與 $(${p2.x},${p2.y})$，求 $a,b$ 的值與完整的直線方程式。`
        );
        const firstEquation = `${formatTwoVarExpr(p1.x, p1.y).replace(/x/g, 'a').replace(/y/g, 'b')}=3`;
        const secondEquation = `${formatTwoVarExpr(p2.x, p2.y).replace(/x/g, 'a').replace(/y/g, 'b')}=3`;
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$a=${a}$，$b=${b}$；$${formatAxByEq(a, b, 3)}$`,
          `把兩點代入 $ax+by=3$，可列聯立方程式 $${formatSystemLatex(firstEquation, secondEquation)}$。解得 $a=${a},\\ b=${b}$，所以直線方程式是 $${formatAxByEq(a, b, 3)}$。`
        );
        continue;
      }

      const x1 = randInt(-4, 2);
      const y1 = randInt(-6, 4);
      const x2 = x1 + randInt(2, 5);
      const y2 = y1 + pickNonZero(-5, 5);
      const line = lineThroughPointsStd(x1, y1, x2, y2);
      questions.push(`求通過點 $(${x1},${y1})$ 與 $(${x2},${y2})$ 兩點的直線方程式。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${formatAxByEq(line.a, line.b, line.c)}$`,
        `設直線為一般式。由兩點可先求方向，再整理成標準型。計算可得這條直線的方程式是 $${formatAxByEq(line.a, line.b, line.c)}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ222TwoQuadrantsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const p = [4, 5, 6, 7][randInt(0, 3)];
        const q = [8, 9, 10, 11][randInt(0, 3)];
        questions.push(`已知線型函數 $f(x)=ax+${p}-${q}x+a$ 的圖形只通過兩個象限，求 $a$ 的值。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$a=-${p}$ 或 $a=${q}$`,
          `先化簡為 $y=(a-${q})x+(a+${p})$。若這是一條斜直線且只通過兩個象限，就必須通過原點，所以截距要是 0，可得 $a+${p}=0$，所以 $a=-${p}$。此外，若斜率為 0，就會變成水平線，也只會通過上方或下方兩個象限，因此還有 $a-${q}=0$，得 $a=${q}$。`
        );
        continue;
      }

      if (variant === 1) {
        const x = [1, 2, 3][randInt(0, 2)];
        const m = [1, 2, 3][randInt(0, 2)];
        const y = m * x;
        questions.push(`若直線 $L$ 只通過第一、三象限且經過點 $(${x},${y})$，求其方程式。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${formatLineSlopeIntercept(m, 0)}$`,
          `只通過第一、三象限的直線必須通過原點，且斜率為正。又因為通過 $(${x},${y})$，斜率是 $\\frac{${y}}{${x}}=${m}$，所以直線方程式是 $${formatLineSlopeIntercept(m, 0)}$。`
        );
        continue;
      }

      if (variant === 2) {
        const x = -[2, 3, 4][randInt(0, 2)];
        const mNum = [2, 3, 4][randInt(0, 2)];
        const mDen = [1, 2, 3][randInt(0, 2)];
        const y = (Math.abs(x) * mNum) / mDen;
        if (!Number.isInteger(y)) {
          i -= 1;
          continue;
        }
        const g = gcd(Math.abs(y), Math.abs(x));
        const rise = Math.abs(y) / g;
        const run = Math.abs(x) / g;
        const slopeExpression = run === 1 ? formatSlopeTerm(-rise, 'x') : `-\\frac{${rise}}{${run}}x`;
        questions.push(`若直線 $L$ 只通過第二、四象限且經過點 $(${x},${y})$，求其方程式。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$y=${slopeExpression}$，或 $${formatAxByEq(rise, run, 0)}$`,
          `只通過第二、四象限的直線必須通過原點，且斜率為負。由點 $(${x},${y})$ 與原點可求斜率為 $\\frac{${y}}{${x}}=-\\frac{${rise}}{${run}}$，所以方程式可寫成 $y=${slopeExpression}$，也可整理成 $${formatAxByEq(rise, run, 0)}$。`
        );
        continue;
      }

      const x = randInt(-6, -1);
      const y = randInt(2, 9);
      questions.push(`若直線 $L$ 只通過第一、二象限且經過點 $(${x},${y})$，求其方程式。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$y=${y}$`,
        `只通過第一、二象限表示這條直線必須是位於 $x$ 軸上方的水平線，所以 $y$ 坐標固定。又因為通過點 $(${x},${y})$，所以方程式是 $y=${y}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ222TranslationLineSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const p = randInt(2, 6);
        const xNew = -2 + p;
        const aValue = simplifyFraction(23 - 2 * xNew - 3, 3);
        const aText = fractionToLatex(aValue, true);
        questions.push(
          `在坐標平面上，將點 $(-2,1)$ 向右平移 ${p} 單位，再向上平移 $a$ 單位，若新點落在直線 $2x+3y=23$ 上，求 $a$。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$a=${aText}$`,
          `平移後新點是 $(${xNew},1+a)$。代入直線方程式可得 $2\\times ${xNew}+3(1+a)=23$，即 $2\\times ${xNew}+3+3a=23$，所以 $3a=${20 - 2 * xNew}$，解得 $a=${aText}$。`
        );
        continue;
      }

      if (variant === 1) {
        const m = pickNonZero(-3, 3);
        const b = randInt(-6, 6);
        const down = randInt(2, 5);
        const right = randInt(1, 4);
        const newB = b - down - m * right;
        questions.push(
          `將直線 $${formatLineSlopeIntercept(m, b)}$ 向下平移 ${down} 單位，再向右平移 ${right} 單位，求所得新直線方程式。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${formatLineSlopeIntercept(m, newB)}$`,
          `設新直線上的點為 $(x,y)$，則在原直線上對應的點是 $(x-${right},y+${down})$。代入原式：$y+${down}=${formatSlopeTerm(m, `(x-${right})`)}${formatSignedConstant(b)}$，整理得 $${formatLineSlopeIntercept(m, newB)}$。`
        );
        continue;
      }

      const a = [1, 2, 3, 4][randInt(0, 3)];
      const b = [1, 2, 3, 4][randInt(0, 3)];
      const right = b;
      const down = a;
      const c = randInt(6, 18);
      questions.push(
        `若點在直線 $${formatAxByEq(a, b, c)}$ 上向右移 ${right} 單位，則還要向下移多少單位，該點才會仍落在原來的直線上？`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `向下移 ${down} 單位`,
        `設原點是 $(x,y)$。向右移 ${right} 單位後，左式會多出 ${a}×${right}=${a * right}；若再向下移 $t$ 單位，因為 $y$ 減少 $t$，左式會少掉 $${b}t$。要讓方程式仍成立，就要 $${a * right}-${b}t=0$，因此 $t=${down}$。所以要向下移 ${down} 單位。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ222TwoLinesAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const a = randInt(1, 8);
        const d = randInt(2, 8);
        const c = a * d;
        const area = d * c;
        questions.push(`求兩直線 $${formatAxByEq(a, 1, c)}$ 與 $${formatAxByEq(a, -1, -c)}$ 和 $x$ 軸所圍成區域面積。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `面積 $${area}$`,
          `兩直線交點在 $(0,${c})$；與 $x$ 軸交點分別為 $(${d},0)$、$(-${d},0)$。因此底長是 ${2 * d}，高是 ${c}，面積為 $\\frac{1}{2}\\times ${2 * d}\\times ${c}=${area}$。`
        );
        continue;
      }

      if (variant === 1) {
        const px = randInt(1, 8);
        const py = randInt(-4, 8);
        const y1 = py + randInt(2, 7);
        const y2 = py - randInt(2, 7);
        const l1 = lineThroughPointsStd(0, y1, px, py);
        const l2 = lineThroughPointsStd(0, y2, px, py);
        const area = (px * (y1 - y2)) / 2;
        questions.push(
          `求兩直線 $${formatAxByEq(l1.a, l1.b, l1.c)}$ 與 $${formatAxByEq(l2.a, l2.b, l2.c)}$ 和 $y$ 軸所圍成區域面積。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `面積 $${area}$`,
          `兩直線交點是 $(${px},${py})$，與 $y$ 軸交點分別是 $(0,${y1})$、$(0,${y2})$。因此底長是 ${y1 - y2}，高是 ${px}，面積為 $\\frac{1}{2}\\times ${y1 - y2}\\times ${px}=${area}$。`
        );
        continue;
      }

      const px = randInt(1, 8);
      const py = randInt(1, 8);
      const x1 = px - randInt(2, 7);
      const x2 = px + randInt(2, 7);
      const l1 = lineThroughPointsStd(px, py, x1, 0);
      const l2 = lineThroughPointsStd(px, py, x2, 0);
      const area = ((x2 - x1) * py) / 2;
      questions.push(
        `已知 $L_1:${formatAxByEq(l1.a, l1.b, l1.c)}$ 與 $L_2:${formatAxByEq(l2.a, l2.b, l2.c)}$ 交於點 $A$，且分別交 $x$ 軸於 $B,C$，求 $\\triangle ABC$ 面積。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `面積 $${area}$`,
        `由題意可知交點 $A=(${px},${py})$，而 $B,C$ 在 $x$ 軸上，座標分別是 $(${x1},0)$、$(${x2},0)$。因此 $\\overline{BC}$ 長為 ${x2 - x1}$，高為 ${py}$，所以 $\\triangle ABC$ 面積為 $\\frac{1}{2}\\times ${x2 - x1}\\times ${py}=${area}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function appendSignedExprPart(parts, text, negative) {
    if (!text) return;
    if (!parts.length) {
      parts.push(negative ? `-${text}` : text);
      return;
    }
    parts.push(`${negative ? '-' : '+'}${text}`);
  }

  function formatTwoVarExpr(ax, by, c = 0) {
    const parts = [];
    if (ax !== 0) {
      const absAx = Math.abs(ax);
      appendSignedExprPart(parts, absAx === 1 ? 'x' : `${absAx}x`, ax < 0);
    }
    if (by !== 0) {
      const absBy = Math.abs(by);
      appendSignedExprPart(parts, absBy === 1 ? 'y' : `${absBy}y`, by < 0);
    }
    if (c !== 0) {
      appendSignedExprPart(parts, `${Math.abs(c)}`, c < 0);
    }
    return parts.join('') || '0';
  }

  function buildJ2ContextEquationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const count100 = randInt(3, 12);
        const count10 = randInt(4, 15);
        questions.push(`錢包內有 $x$ 張佰元鈔票與 $y$ 個拾元硬幣，總共有多少元？請用 $x,y$ 列出代數式。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$100x+10y$`,
          `一張佰元鈔票是 100 元，一個拾元硬幣是 10 元，所以總金額可記成 $100x+10y$。`
        );
        continue;
      }

      if (variant === 1) {
        const full = randInt(120, 260);
        const half = randInt(60, 140);
        questions.push(
          `阿里山全票一張 ${full} 元、半票一張 ${half} 元，若買了 $x$ 張全票與 $y$ 張半票，共需多少錢？請用 $x,y$ 列出代數式。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${full}x+${half}y$`,
          `全票總價是 $${full}x$，半票總價是 $${half}y$，所以總金額可記成 $${full}x+${half}y$。`
        );
        continue;
      }

      if (variant === 2) {
        const onePrice = [10, 12, 15][randInt(0, 2)];
        const anotherPrice = [18, 20, 25][randInt(0, 2)];
        const itemA = ['手工餅乾', '蔥油餅', '車輪餅'][randInt(0, 2)];
        const itemB = ['泡芙', '奶茶', '豆花'][randInt(0, 2)];
        questions.push(
          `${itemA}每份 ${onePrice} 元，${itemB}每份 ${anotherPrice} 元。若買了 $x$ 份${itemA}與 $y$ 份${itemB}，共需多少錢？請用 $x,y$ 列出代數式。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${onePrice}x+${anotherPrice}y$`,
          `${itemA}總價是 $${onePrice}x$，${itemB}總價是 $${anotherPrice}y$，所以總金額可記成 $${onePrice}x+${anotherPrice}y$。`
        );
        continue;
      }

      if (variant === 3) {
        const tens = randInt(1, 8);
        const ones = randInt(1, 9);
        questions.push(`若一個兩位數的十位數字是 $x$、個位數字是 $y$，請用 $x,y$ 列出這個兩位數的代數式。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$10x+y$`,
          `十位數字代表 $10x$，個位數字代表 $y$，所以這個兩位數可記成 $10x+y$。`
        );
        continue;
      }

      const fixedFee = randInt(2, 8) * 10;
      const rose = randInt(20, 50);
      const lily = randInt(40, 80);
      questions.push(
        `花店包裝一束花，玫瑰每枝 ${rose} 元、百合每枝 ${lily} 元，另加包裝費 ${fixedFee} 元。若用了 $x$ 枝玫瑰與 $y$ 枝百合，總價應記成什麼代數式？`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${rose}x+${lily}y+${fixedFee}$`,
        `玫瑰總價是 $${rose}x$，百合總價是 $${lily}y$，再加上包裝費 ${fixedFee} 元，所以總價可記成 $${rose}x+${lily}y+${fixedFee}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ2ClassifySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const parameterNames = ['a', 'b', 'm', 'n'];

    function formatTermList(terms) {
      const visibleTerms = terms.filter((term) => term.coef !== 0);

      if (!visibleTerms.length) return '0';

      return visibleTerms
        .map((term, index) => {
          const coef = term.coef;
          const variable = term.variable || '';
          const absCoef = Math.abs(coef);

          const body = variable ? `${absCoef === 1 ? '' : absCoef}${variable}` : `${absCoef}`;

          if (index === 0) {
            return coef < 0 ? `-${body}` : body;
          }

          return `${coef < 0 ? '-' : '+'}${body}`;
        })
        .join('');
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const expr = formatTwoVarExpr(pickNonZero(-8, 8), pickNonZero(-8, 8), randInt(-9, 9));

        questions.push(`判斷：$${expr}$ 是二元一次式、二元一次方程式，還是都不是？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          '它是二元一次式',
          `$${expr}$ 沒有等號，且只含 $x,y$ 的一次項，所以它是二元一次式。`
        );
        continue;
      }

      if (variant === 1) {
        const expr = formatTwoVarExpr(pickNonZero(-8, 8), pickNonZero(-8, 8), 0);
        const rhs = randInt(-12, 12);

        questions.push(`判斷：$${expr}=${rhs}$ 是二元一次式、二元一次方程式，還是都不是？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          '它是二元一次方程式',
          `$${expr}=${rhs}$ 有等號，而且 $x,y$ 都只出現一次，所以它是二元一次方程式。`
        );
        continue;
      }

      if (variant === 2) {
        const ax2 = pickNonZero(1, 6);
        const by = pickNonZero(-6, 6);

        const expr = formatTermList([
          { coef: ax2, variable: 'x^2' },
          { coef: by, variable: 'y' },
        ]);

        questions.push(`判斷：$${expr}$ 是二元一次式、二元一次方程式，還是都不是？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          '都不是',
          `$${expr}$ 含有 $x^2$，已經不是一次，所以不屬於二元一次式，也不是二元一次方程式。`
        );
        continue;
      }

      if (variant === 3) {
        const xy = pickNonZero(1, 5);
        const x = pickNonZero(-6, 6);
        const c = pickNonZero(-9, 9);

        const expr = formatTermList([
          { coef: xy, variable: 'xy' },
          { coef: x, variable: 'x' },
          { coef: c, variable: '' },
        ]);

        questions.push(`判斷：$${expr}$ 是二元一次式、二元一次方程式，還是都不是？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          '都不是',
          `$${expr}$ 含有 $xy$，出現兩個未知數相乘，所以不是二元一次式，也不是二元一次方程式。`
        );
        continue;
      }

      if (variant === 4) {
        const name = parameterNames[randInt(0, parameterNames.length - 1)];
        const coef = pickNonZero(1, 6);

        const expr = formatTermList([
          { coef, variable: 'x' },
          { coef: 1, variable: name },
        ]);

        questions.push(`判斷：$${expr}$（其中 $${name}$ 為常數）是二元一次式、二元一次方程式，還是都不是？`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          '都不是',
          `因為 $${name}$ 在題目中被指定為常數，不是第二個未知數，所以 $${expr}$ 只有一個未知數 $x$，不算二元一次式，也不是二元一次方程式。`
        );
        continue;
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ2ExpressionSimplifySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const terms = [];
      let xCoef = 0;
      let yCoef = 0;
      let constant = 0;
      const termCount = randInt(5, 7);
      let hasY = false;
      let hasConstant = false;

      for (let j = 0; j < termCount; j += 1) {
        const type = j < 2 ? (j === 0 ? 'x' : 'y') : ['x', 'y', 'c'][randInt(0, 2)];
        if (type === 'x') {
          const coef = pickNonZero(-8, 8);
          terms.push(coef === 1 ? 'x' : coef === -1 ? '-x' : `${coef}x`);
          xCoef += coef;
        } else if (type === 'y') {
          const coef = pickNonZero(-8, 8);
          terms.push(coef === 1 ? 'y' : coef === -1 ? '-y' : `${coef}y`);
          yCoef += coef;
          hasY = true;
        } else {
          const value = pickNonZero(-9, 9);
          terms.push(`${value}`);
          constant += value;
          hasConstant = true;
        }
      }

      if (!hasY) {
        const coef = pickNonZero(-6, 6);
        terms.push(coef === 1 ? 'y' : coef === -1 ? '-y' : `${coef}y`);
        yCoef += coef;
      }
      if (!hasConstant) {
        const value = pickNonZero(-8, 8);
        terms.push(`${value}`);
        constant += value;
      }

      const questionExpr = terms.reduce((acc, term, index) => {
        if (index === 0) return term;
        return `${acc}${term.startsWith('-') ? '' : '+'}${term}`;
      }, '');
      questions.push(`化簡：$${questionExpr}$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${formatTwoVarExpr(xCoef, yCoef, constant)}$`,
        `把 $x$ 項、$y$ 項與常數項分別合併，可得 $${formatTwoVarExpr(xCoef, yCoef, constant)}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ2DistributeExpandSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const k = pickNonZero(-8, 8);
        const a = pickNonZero(-5, 5);
        const b = pickNonZero(-5, 5);
        const c = pickNonZero(-6, 6);
        const inside = formatTwoVarExpr(a, b, c);
        const result = formatTwoVarExpr(k * a, k * b, k * c);
        questions.push(`化簡：$${k}(${inside})$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${result}$`,
          `利用分配律把 ${k} 乘進去，得 $${result}$。`
        );
        continue;
      }

      if (variant === 1) {
        const k = -pickNonZero(2, 8);
        const a = pickNonZero(-4, 4);
        const b = pickNonZero(-4, 4);
        const c = pickNonZero(-6, 6);
        const inside = formatTwoVarExpr(a, b, c);
        const result = formatTwoVarExpr(k * a, k * b, k * c);
        questions.push(`化簡：$${k}(${inside})$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${result}$`,
          `括號前是負數，分配後每一項都要變號，所以 $${k}(${inside})=${result}$。`
        );
        continue;
      }

      const k1 = pickNonZero(2, 6);
      const k2 = pickNonZero(2, 6);

      const a1 = pickNonZero(-4, 4);
      const b1 = pickNonZero(-4, 4);
      const c1 = pickNonZero(-5, 5);

      const a2 = pickNonZero(-4, 4);
      const b2 = pickNonZero(-4, 4);
      const c2 = pickNonZero(-5, 5);

      const first = `${k1}(${formatTwoVarExpr(a1, b1, c1)})`;
      const second = `${k2}(${formatTwoVarExpr(a2, b2, c2)})`;

      const result = formatTwoVarExpr(k1 * a1 + k2 * a2, k1 * b1 + k2 * b2, k1 * c1 + k2 * c2);

      const expandedFirst = formatTwoVarExpr(k1 * a1, k1 * b1, k1 * c1);
      const expandedSecond = formatTwoVarExpr(k2 * a2, k2 * b2, k2 * c2);

      const originalExpr = `${first}+${second}`;
      const expandedExpr = `${expandedFirst}${expandedSecond.startsWith('-') ? '' : '+'}${expandedSecond}`;

      questions.push(`化簡：$${originalExpr}$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${result}$`,
        `先分別展開兩個括號：$${originalExpr}=${expandedExpr}$，再合併同類項得 $${result}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ2EvaluateExpressionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const xValue = randInt(-5, 5);
      const yValue = randInt(-5, 5);
      const a = pickNonZero(-9, 9);
      const b = pickNonZero(-9, 9);
      const c = randInt(-9, 9);
      const expr = formatTwoVarExpr(a, b, c);
      const result = a * xValue + b * yValue + c;
      questions.push(`當 $x=${xValue},\\ y=${yValue}$ 時，求 $${expr}$ 的值。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${result}$`,
        `把 $x=${xValue},\\ y=${yValue}$ 代入，可得 $${a}\\times(${xValue})${b >= 0 ? '+' : ''}${b}\\times(${yValue})${formatSignedNumber(c)}=${result}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ2FractionSimplifySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const denominatorPairs = [
      [3, 4],
      [3, 5],
      [4, 5],
      [2, 3],
      [2, 5],
    ];

    const gcdMany = (values) => values.reduce((acc, value) => gcd(acc, Math.abs(value)), 0);

    for (let i = 0; i < count; i += 1) {
      const [d1, d2] = denominatorPairs[i % denominatorPairs.length];
      const l = lcm(d1, d2);
      const a1 = pickNonZero(-4, 4);
      const b1 = pickNonZero(-4, 4);
      const c1 = randInt(-6, 6);
      const a2 = pickNonZero(-4, 4);
      const b2 = pickNonZero(-4, 4);
      const c2 = randInt(-6, 6);
      const usePlus = i % 2 === 0;
      let numX = a1 * (l / d1) + (usePlus ? 1 : -1) * a2 * (l / d2);
      let numY = b1 * (l / d1) + (usePlus ? 1 : -1) * b2 * (l / d2);
      let numC = c1 * (l / d1) + (usePlus ? 1 : -1) * c2 * (l / d2);
      let den = l;
      const g = gcdMany([numX, numY, numC, den]);
      if (g > 1) {
        numX /= g;
        numY /= g;
        numC /= g;
        den /= g;
      }
      const left = `\\frac{${formatTwoVarExpr(a1, b1, c1)}}{${d1}}`;
      const right = `\\frac{${formatTwoVarExpr(a2, b2, c2)}}{${d2}}`;
      const numerator = formatTwoVarExpr(numX, numY, numC);
      const result = den === 1 ? formatTwoVarExpr(numX, numY, numC) : `\\frac{${numerator}}{${den}}`;
      questions.push(`化簡：$${left}${usePlus ? '+' : '-'}${right}$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${result}$`,
        `先通分成分母都是 $${l}$：$${left}${usePlus ? '+' : '-'}${right}=\\frac{${formatTwoVarExpr(a1 * (l / d1), b1 * (l / d1), c1 * (l / d1))}}{${l}}${usePlus ? '+' : '-'}\\frac{${formatTwoVarExpr(a2 * (l / d2), b2 * (l / d2), c2 * (l / d2))}}{${l}}$。合併分子後得 $${result}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ2OrderedPairCheckSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const xValue = randInt(-4, 6);
      const yValue = randInt(-4, 6);
      const ax = pickNonZero(-5, 5);
      const by = pickNonZero(-5, 5);
      const isValid = i % 2 === 0;
      const rhs = ax * xValue + by * yValue + (isValid ? 0 : pickNonZero(-6, 6));
      const equation = `${formatTwoVarExpr(ax, by)}=${rhs}`;
      questions.push(`檢查數對 $(x,y)=(${xValue},${yValue})$ 是否為方程式 $${equation}$ 的解。`);
      const leftValue = ax * xValue + by * yValue;
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        leftValue === rhs ? '這組數對是解' : '這組數對不是解',
        `把 $(x,y)=(${xValue},${yValue})$ 代入左邊，可得 $${ax}\\times(${xValue})${by >= 0 ? '+' : ''}${by}\\times(${yValue})=${leftValue}$。${leftValue === rhs ? `因為左右兩邊都等於 ${rhs}，所以這組數對是解。` : `因為左邊等於 ${leftValue}，右邊是 ${rhs}，兩邊不相等，所以這組數對不是解。`}`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ2ParameterSubstitutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const names = ['a', 'b', 'm', 'n'];

    for (let i = 0; i < count; i += 1) {
      const name = names[i % names.length];
      const xValue = randInt(-4, 5);
      const yValue = randInt(-4, 5);
      if (yValue === 0) {
        i -= 1;
        continue;
      }
      const fixedCoef = pickNonZero(-6, 6);
      const paramValue = randInt(-8, 8);
      const rhs = fixedCoef * xValue + paramValue * yValue + randInt(-6, 6);
      const constant = rhs - fixedCoef * xValue - paramValue * yValue;
      const equation = `${formatLinearExpr(fixedCoef, constant)}+${name}y=${rhs}`;
      questions.push(`若 $(x,y)=(${xValue},${yValue})$ 是方程式 $${equation}$ 的解，求 ${name}。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${name}=${paramValue}$`,
        `把 $(x,y)=(${xValue},${yValue})$ 代入，可得 $${fixedCoef === 1 ? '' : fixedCoef === -1 ? '-' : fixedCoef}${xValue}${constant >= 0 ? '+' : ''}${constant}+${name}(${yValue})=${rhs}$。整理後得到 $${yValue}${name}=${rhs - fixedCoef * xValue - constant}$，所以 ${name}=$${paramValue}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ2EquivalentTransformSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const leftAx = pickNonZero(-6, 6);
      const leftBy = pickNonZero(-6, 6);
      const leftC = pickNonZero(-9, 9);
      const rightAx = pickNonZero(-6, 6);
      const rightBy = pickNonZero(-6, 6);
      const rightC = pickNonZero(-9, 9);
      const finalAx = leftAx - rightAx;
      const finalBy = leftBy - rightBy;
      if (finalAx === 0 || finalBy === 0) {
        i -= 1;
        continue;
      }
      const finalC = rightC - leftC;
      const left = formatTwoVarExpr(leftAx, leftBy, leftC);
      const right = formatTwoVarExpr(rightAx, rightBy, rightC);
      questions.push(`把方程式 $${left}=${right}$ 整理成標準型 $Ax+By=C$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${formatTwoVarExpr(finalAx, finalBy)}=${finalC}$`,
        `先把含 $x,y$ 的項移到左邊，常數移到右邊：$${left}=${right}\\Rightarrow ${formatTwoVarExpr(finalAx, finalBy)}=${finalC}$。所以標準型是 $${formatTwoVarExpr(finalAx, finalBy)}=${finalC}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ2IntegerConstraintSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const pairsCoPrime = [
      [2, 3],
      [2, 5],
      [3, 4],
      [3, 5],
      [4, 5],
      [5, 6],
    ];

    while (questions.length < count) {
      const [a, b] = pairsCoPrime[randInt(0, pairsCoPrime.length - 1)];
      const total = randInt(2, 5) * a * b;
      const pairs = [];
      for (let x = 0; x <= total; x += 1) {
        const remain = total - a * x;
        if (remain < 0) break;
        if (remain % b === 0) pairs.push([x, remain / b]);
      }
      if (pairs.length < 3 || pairs.length > 6) continue;
      questions.push(`求方程式 $${a}x+${b}y=${total}$ 的所有非負整數解。`);
      const pairText = pairs.map(([x, y]) => `(${x},${y})`).join('、');
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `所有非負整數解為 ${pairText}`,
        `由 $${a}x+${b}y=${total}$ 可知 $y=\\frac{${total}-${a}x}{${b}}$。逐一檢查非負整數條件後，可得所有非負整數解為 $${pairText}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ2SolveForVariableSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-6, 6);
      const b = pickNonZero(-6, 6);
      const c = pickNonZero(-12, 12);
      const equation = `${formatTwoVarExpr(a, b)}=${c}`;
      const xNumerator = `${c}${b > 0 ? '-' : '+'}${Math.abs(b)}y`;
      const yNumerator = `${c}${a > 0 ? '-' : '+'}${Math.abs(a)}x`;
      questions.push(`將方程式 $${equation}$ 分別整理成 $x=\\cdots$ 與 $y=\\cdots$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$x=\\frac{${xNumerator}}{${a}}$，$y=\\frac{${yNumerator}}{${b}}$`,
        `先整理成 $x$ 用 $y$ 表示：$${a}x=${c}${b > 0 ? '-' : '+'}${Math.abs(b)}y$，所以 $x=\\frac{${xNumerator}}{${a}}$。再整理成 $y$ 用 $x$ 表示：$${b}y=${c}${a > 0 ? '-' : '+'}${Math.abs(a)}x$，所以 $y=\\frac{${yNumerator}}{${b}}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ222SlopeInterceptSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const xInt = [2, 3, 4, 5, 6][randInt(0, 4)];
        const yInt = [2, 3, 4, 5, 6][randInt(0, 4)];
        const a = yInt;
        const b = xInt;
        const c = xInt * yInt;
        const slope = simplifyFraction(-a, b);
        const slopeInterceptForm = `y=${formatFractionSlopeTerm(slope)}${formatSignedNumber(yInt)}`;
        questions.push(`已知直線方程式為 $${formatAxByEq(a, b, c)}$，求此直線的斜率以及它與 $x$ 軸、$y$ 軸的截距。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `斜率 $${fractionToLatex(slope)}$，$x$ 截距 $${xInt}$，$y$ 截距 $${yInt}$`,
          `把方程式改寫成斜截式：$${b}y=-${a}x+${c}$，所以 $${slopeInterceptForm}$，斜率是 $${fractionToLatex(slope)}$。令 $y=0$，得 $x=${xInt}$，所以 $x$ 截距是 ${xInt}；令 $x=0$，得 $y=${yInt}$，所以 $y$ 截距是 ${yInt}。`
        );
        continue;
      }

      if (variant === 1) {
        const xInt = [2, 3, 4, 5, 6][randInt(0, 4)];
        const yInt = [2, 3, 4, 5, 6][randInt(0, 4)];
        questions.push(`已知一條直線的 $x$ 截距為 ${xInt}，$y$ 截距為 ${yInt}，求此直線方程式。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${formatAxByEq(yInt, xInt, xInt * yInt)}$`,
          `直線通過兩點 $(${xInt},0)$ 與 $(0,${yInt})$，可用截距式 $\\frac{x}{${xInt}}+\\frac{y}{${yInt}}=1$。化成整係數一般式，可得 $${formatAxByEq(yInt, xInt, xInt * yInt)}$。`
        );
        continue;
      }

      const m = pickNonZero(-4, 4);
      const x0 = randInt(-4, 4);
      const y0 = randInt(-6, 6);
      const b = y0 - m * x0;
      questions.push(`已知直線的斜率為 ${m}，且通過點 $(${x0},${y0})$，求此直線方程式。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${formatLineSlopeIntercept(m, b)}$`,
        `斜率為 ${m}，可先設直線為 $${formatLineSlopeIntercept(m, 0)}+b$。把點 $(${x0},${y0})$ 代入，得 $${y0}=${m}\\times ${x0}+b$，所以 $b=${b}$。因此直線方程式是 $${formatLineSlopeIntercept(m, b)}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ222ParallelPerpendicularEquationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const m = pickNonZero(-4, 4);
        const b0 = randInt(-5, 5);
        const x0 = randInt(-4, 4);
        const y0 = randInt(-6, 6);
        const b = y0 - m * x0;
        questions.push(`求通過點 $(${x0},${y0})$ 且平行於直線 $${formatLineSlopeIntercept(m, b0)}$ 的直線方程式。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${formatLineSlopeIntercept(m, b)}$`,
          `平行直線的斜率相同，所以所求直線可設為 $${formatLineSlopeIntercept(m, 0)}+b$。代入點 $(${x0},${y0})$，得 $${y0}=${m}\\times ${x0}+b$，所以 $b=${b}$。因此方程式是 $${formatLineSlopeIntercept(m, b)}$。`
        );
        continue;
      }

      if (variant === 1) {
        const m = pickNonZero(-4, 4);
        const b0 = randInt(-5, 5);
        const x0 = randInt(-4, 4);
        const y0 = randInt(-6, 6);
        const perpSlope = simplifyFraction(-1, m);
        const b = simplifyFraction(y0 * perpSlope.den - perpSlope.num * x0, perpSlope.den);
        const slopeTerm = formatFractionSlopeTerm(perpSlope);
        const equation = `y=${slopeTerm}${formatSignedFractionConstant(b)}`;
        questions.push(`求通過點 $(${x0},${y0})$ 且垂直於直線 $${formatLineSlopeIntercept(m, b0)}$ 的直線方程式。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${equation}$`,
          `原直線斜率是 ${m}，所以垂直線的斜率是其負倒數 $${fractionToLatex(perpSlope)}$。設所求直線為 $y=${slopeTerm}+b$，代入點 $(${x0},${y0})$，得 $b=${fractionToLatex(b, true)}$。因此方程式是 $${equation}$。`
        );
        continue;
      }

      const a = pickNonZero(-4, 4);
      const b = pickNonZero(-4, 4);
      const c = randInt(-8, 8);
      const x0 = randInt(-4, 4);
      const y0 = randInt(-6, 6);
      const c2 = a * x0 + b * y0;
      questions.push(`求通過點 $(${x0},${y0})$ 且平行於直線 $${formatAxByEq(a, b, c)}$ 的直線方程式。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${formatAxByEq(a, b, c2)}$`,
        `平行於 $${formatAxByEq(a, b, c)}$ 的直線，$x$、$y$ 的係數比不變，所以可設為 $${formatTwoVarExpr(a, b)}=k$。代入點 $(${x0},${y0})$，得 $k=${c2}$。因此所求方程式是 $${formatAxByEq(a, b, c2)}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ222LineIntersectionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const x = randInt(-3, 4);
        const y = randInt(-2, 5);
        const m1 = pickNonZero(-4, 4);
        let m2 = pickNonZero(-4, 4);
        while (m2 === m1) m2 = pickNonZero(-4, 4);
        const b1 = y - m1 * x;
        const b2 = y - m2 * x;
        questions.push(
          `求直線 $${formatLineSlopeIntercept(m1, b1)}$ 與直線 $${formatLineSlopeIntercept(m2, b2)}$ 的交點坐標。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(${x},${y})$`,
          `兩直線交點同時滿足兩式，所以解聯立方程式 $${formatSystemLatex(formatLineSlopeIntercept(m1, b1), formatLineSlopeIntercept(m2, b2))}$。整理可得交點是 $(${x},${y})$。`
        );
        continue;
      }

      if (variant === 1) {
        const x = randInt(-3, 4);
        const y = randInt(-2, 5);
        const l1 = lineThroughPointsStd(x, y, x + 1, y + randInt(1, 3));
        const l2 = lineThroughPointsStd(x, y, x + randInt(1, 3), y - randInt(1, 3));
        questions.push(
          `求直線 $${formatAxByEq(l1.a, l1.b, l1.c)}$ 與直線 $${formatAxByEq(l2.a, l2.b, l2.c)}$ 的交點坐標。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(${x},${y})$`,
          `把兩條直線聯立求解即可。解 $${formatSystemLatex(formatAxByEq(l1.a, l1.b, l1.c), formatAxByEq(l2.a, l2.b, l2.c))}$，可得交點是 $(${x},${y})$。`
        );
        continue;
      }

      const m1 = pickNonZero(-4, 4);
      let m2 = pickNonZero(-4, 4);
      while (m2 === m1) m2 = pickNonZero(-4, 4);
      const xIntercept = randInt(-4, 4);
      const b1 = -m1 * xIntercept;
      const b2 = -m2 * xIntercept;
      questions.push(
        `若直線 $L_1: ${formatLineSlopeIntercept(m1, b1)}$ 與直線 $L_2: ${formatLineSlopeIntercept(m2, b2)}$ 的交點在 $x$ 軸上，求交點坐標。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$(${xIntercept},0)$`,
        `交點在 $x$ 軸上，表示交點的 $y=0$。把 $y=0$ 代入兩式，會得到相同的 $x$ 值：$x=${xIntercept}$。所以交點坐標是 $(${xIntercept},0)$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ222LineQuadrantInterceptCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const cycle = Math.floor(i / 5);

      if (mode === 0) {
        const signCases = [
          { aSign: -1, bSign: 1, quadrants: '第一、二、四' },
          { aSign: -1, bSign: -1, quadrants: '第二、三、四' },
          { aSign: 1, bSign: 1, quadrants: '第一、二、三' },
          { aSign: 1, bSign: -1, quadrants: '第一、三、四' },
        ];
        const pick = signCases[cycle % signCases.length];
        const reflectX = cycle >= signCases.length;
        const pointText = reflectX ? '(-a,b)' : '(a,b)';
        const answer = quadrantText(reflectX ? -pick.aSign : pick.aSign, pick.bSign);
        questions.push(`若直線 $y=ax+b$ 通過${pick.quadrants}象限，判斷點 $${pointText}$ 在第幾象限。`);
        summaryAnswers.push(answer);
        answers.push(
          `直線通過${pick.quadrants}象限，表示斜率 $a${pick.aSign > 0 ? '>0' : '<0'}$ 且 $y$ 截距 $b${pick.bSign > 0 ? '>0' : '<0'}$。因此點 $${pointText}$ 的兩個坐標正負可判斷為${answer}。`
        );
      } else if (mode === 1) {
        const m = randInt(1, 5);
        const b = -randInt(2, 8);
        questions.push(`已知 $f(x)=ax+b$ 通過點 $(-1,${-m + b})$ 與 $(2,${2 * m + b})$，判斷此圖形不通過哪一象限。`);
        summaryAnswers.push('第二象限');
        answers.push(
          `由兩點可得斜率 $a=${m}>0$，且截距 $b=${b}<0$。正斜率、負截距的直線會通過第一、三、四象限，不通過第二象限。`
        );
      } else if (mode === 2) {
        const scale = randInt(1, 9);
        const xInt = 3 * scale;
        const yInt = -4 * scale;
        const a = 4;
        const b = -3;
        const c = 12 * scale;
        const perimeter = xInt + Math.abs(yInt) + 5 * scale;
        questions.push(
          `直線 $${formatAxByEq(a, b, c)}$ 通過 $x$ 軸與 $y$ 軸於 $A,B$ 兩點，求 $\\triangle AOB$ 的周長。`
        );
        summaryAnswers.push(`周長 $${perimeter}$`);
        answers.push(
          `令 $y=0$ 得 $x=${xInt}$，所以 $A(${xInt},0)$；令 $x=0$ 得 $y=${yInt}$，所以 $B(0,${yInt})$。兩股長為 ${xInt}、${Math.abs(yInt)}，斜邊長為 ${5 * scale}，周長為 $${xInt}+${Math.abs(yInt)}+${5 * scale}=${perimeter}$。`
        );
      } else if (mode === 3) {
        const m = pickNonZero(-5, 5);
        const x = pickNonZero(-6, 6);
        const y = m * x;
        questions.push(`直線 $y=mx+k$ 經過原點，且通過點 $(${x},${y})$，求其方程式。`);
        summaryAnswers.push(`$${formatLineSlopeIntercept(m, 0)}$`);
        answers.push(
          `通過原點表示 $k=0$。再代入點 $(${x},${y})$，得 $${y}=m\\times(${x})$，所以 $m=${m}$。方程式為 $${formatLineSlopeIntercept(m, 0)}$。`
        );
      } else {
        const y = randInt(-5, 6);
        questions.push(`已知線型函數 $f(x)=ax+b$ 通過點 $(${randInt(-3, 4)},${y})$，且圖形與 $x$ 軸平行，求此函數。`);
        summaryAnswers.push(`$f(x)=${y}$`);
        answers.push(`與 $x$ 軸平行代表圖形是水平線，所以斜率 $a=0$，函數值固定為該點的縱坐標。因此 $f(x)=${y}$。`);
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ211ContextLinearEquationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const total = [28, 32, 35, 40, 45][randInt(0, 4)];
        questions.push(`某班有男生 $x$ 人、女生 $y$ 人，全班共有 ${total} 人，列出二元一次方程式。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$x+y=${total}$`,
          `男生人數加上女生人數等於全班總人數，所以可列出方程式 $x+y=${total}$。`
        );
        continue;
      }

      if (variant === 1) {
        const perimeter = [24, 30, 36, 40][randInt(0, 3)];
        questions.push(`長方形的長為 $x$ 公分、寬為 $y$ 公分，周長為 ${perimeter} 公分，列出二元一次方程式。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$2x+2y=${perimeter}$`,
          `長方形周長是 $2x+2y$，又已知周長為 ${perimeter}，所以可列出方程式 $2x+2y=${perimeter}$。`
        );
        continue;
      }

      if (variant === 2) {
        const a = [2, 3, 4, 5][randInt(0, 3)];
        const b = [2, 3, 4, 5][randInt(0, 3)];
        const xPrice = [20, 25, 30, 35][randInt(0, 3)];
        const yPrice = [15, 18, 22, 28][randInt(0, 3)];
        const total = a * xPrice + b * yPrice;
        questions.push(
          `蘋果每公斤 $x$ 元、橘子每公斤 $y$ 元，若買了 ${a} 公斤蘋果與 ${b} 公斤橘子，共花 ${total} 元，列出二元一次方程式。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${a}x+${b}y=${total}$`,
          `蘋果總價是 $${a}x$，橘子總價是 $${b}y$，總共 ${total} 元，所以可列出方程式 $${a}x+${b}y=${total}$。`
        );
        continue;
      }

      if (variant === 3) {
        const base = [4, 5, 6][randInt(0, 2)];
        const diff = [1, 2, 3, 4][randInt(0, 3)];
        const total = 4 * base + (base + diff);
        questions.push(
          `雞有 $x$ 隻、兔有 $y$ 隻，已知共有 ${base + diff + base} 隻、共有 ${total} 隻腳，列出其中表示腳數的二元一次方程式。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$2x+4y=${total}$`,
          `每隻雞有 2 隻腳，每隻兔有 4 隻腳，所以腳數關係可列成 $2x+4y=${total}$。`
        );
        continue;
      }

      const total = [900, 1200, 1500, 1800][randInt(0, 3)];
      const days = [20, 25, 30][randInt(0, 2)];
      questions.push(
        `小華每天存 $x$ 元、小美每天存 $y$ 元，兩人連續存了 ${days} 天，共存了 ${total} 元，列出二元一次方程式。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${days}x+${days}y=${total}$`,
        `兩人一天共存 $x+y$ 元，存 $${days}$ 天就是 $${days}(x+y)$ 元，所以可列出方程式 $${days}x+${days}y=${total}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function formatSystemLatex(eq1, eq2) {
    return String.raw`\left\{\begin{array}{l}${eq1}\\${eq2}\end{array}\right.`;
  }

  function formatSignedTerm(coef, variable) {
    if (coef === 0) return '';
    const abs = Math.abs(coef);
    const body = `${abs === 1 ? '' : abs}${variable}`;
    return `${coef < 0 ? '-' : '+'}${body}`;
  }

  function formatLinearTwoTerms(firstCoef, firstVar, secondCoef, secondVar) {
    const firstAbs = Math.abs(firstCoef);
    const firstBody = `${firstAbs === 1 ? '' : firstAbs}${firstVar}`;
    const first = firstCoef < 0 ? `-${firstBody}` : firstBody;
    return `${first}${formatSignedTerm(secondCoef, secondVar)}`;
  }

  function formatSumValue(a, b) {
    return b < 0 ? `${a}${b}` : `${a}+${b}`;
  }

  function buildJ212SubstitutionBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      let xValue = randInt(-3, 6);
      let yValue = randInt(-3, 6);

      if (variant === 0) {
        const k = pickNonZero(1, 4);
        const b = xValue - k * yValue;
        const eq1 = `x=${k}y${b >= 0 ? '+' : ''}${b}`;
        const a2 = pickNonZero(1, 4);
        const b2 = pickNonZero(1, 4);
        const c2 = a2 * xValue + b2 * yValue;
        if (a2 === k * b2) {
          i -= 1;
          continue;
        }
        const eq2 = `${a2}x+${b2}y=${c2}`;
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(x,y)=(${xValue},${yValue})$`,
          `由第一式得 $x=${k}y${b >= 0 ? '+' : ''}${b}$，代入第二式：$${a2}(${k}y${b >= 0 ? '+' : ''}${b})+${b2}y=${c2}$。解得 $y=${yValue}$，再代回得 $x=${xValue}$，所以 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      if (variant === 1) {
        const d = randInt(-5, 5);
        yValue = xValue + d;
        const eq1 = `y=x${d >= 0 ? '+' : ''}${d}`;
        const a2 = pickNonZero(1, 4);
        const b2 = -pickNonZero(1, 4);
        if (a2 + b2 === 0) {
          i -= 1;
          continue;
        }
        const c2 = a2 * xValue + b2 * yValue;
        const eq2 = `${a2}x${b2 >= 0 ? '+' : ''}${b2}y=${c2}`;
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(x,y)=(${xValue},${yValue})$`,
          `由第一式得 $y=x${d >= 0 ? '+' : ''}${d}$，代入第二式：$${a2}x${b2 >= 0 ? '+' : ''}${b2}(x${d >= 0 ? '+' : ''}${d})=${c2}$。解得 $x=${xValue}$，再代回得 $y=${yValue}$，所以 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      const a1 = pickNonZero(2, 5);
      const c1 = a1 * xValue - yValue;
      const eq1 = `${a1}x-y=${c1}`;
      const a2 = pickNonZero(1, 4);
      const b2 = pickNonZero(1, 4);
      if (a2 + b2 * a1 === 0) {
        i -= 1;
        continue;
      }
      const c2 = a2 * xValue + b2 * yValue;
      const eq2 = `${a2}x+${b2}y=${c2}`;
      questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$(x,y)=(${xValue},${yValue})$`,
        `先由第一式整理得 $y=${a1}x-${c1}$，代入第二式：$${a2}x+${b2}(${a1}x-${c1})=${c2}$。解得 $x=${xValue}$，再代回得 $y=${yValue}$，所以 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212EliminationAdjustmentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const xValue = randInt(-4, 6);
      const yValue = randInt(-4, 6);

      if (variant === 0) {
        const a = pickNonZero(1, 4);
        const b = pickNonZero(1, 4);
        const c1 = a * xValue + b * yValue;
        const c2 = a * xValue - b * yValue;
        const eq1 = `${a}x+${b}y=${c1}`;
        const eq2 = `${a}x-${b}y=${c2}`;
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(x,y)=(${xValue},${yValue})$`,
          `兩式中的 $x$ 係數相同，直接相減可消去 $x$：$${2 * b}y=${c1 - c2}$，所以 $y=${yValue}$。再代回任一式，得 $x=${xValue}$，因此 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      if (variant === 1) {
        const a1 = pickNonZero(1, 4);
        const b1 = pickNonZero(1, 4);
        const a2 = randInt(1, 4);
        const b2 = -pickNonZero(1, 4);
        const c1 = a1 * xValue + b1 * yValue;
        const c2 = a2 * xValue + b2 * yValue;
        const eq1 = `${a1}x+${b1}y=${c1}`;
        const eq2 = `${a2}x${b2 >= 0 ? '+' : ''}${b2}y=${c2}`;
        const factor = Math.abs(a1);
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(x,y)=(${xValue},${yValue})$`,
          `把第二式乘上 ${factor}，使兩式的 $x$ 係數對齊，再相減消去 $x$。整理後得 $y=${yValue}$，代回可得 $x=${xValue}$，所以 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      const a1 = pickNonZero(2, 5);
      const a2 = pickNonZero(2, 5);
      const b1 = pickNonZero(1, 5);
      const b2 = -pickNonZero(1, 5);
      const c1 = a1 * xValue + b1 * yValue;
      const c2 = a2 * xValue + b2 * yValue;
      const l = lcm(Math.abs(a1), Math.abs(a2));
      const m1 = l / Math.abs(a1);
      const m2 = l / Math.abs(a2);
      const eq1 = `${a1}x${b1 >= 0 ? '+' : ''}${b1}y=${c1}`;
      const eq2 = `${a2}x${b2 >= 0 ? '+' : ''}${b2}y=${c2}`;
      questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$(x,y)=(${xValue},${yValue})$`,
        `先把兩式調整成 $x$ 的係數同為 ${l}$：第一式乘 ${m1}，第二式乘 ${m2}$。整理後再相減，可得到 $y=${yValue}$，再代回得 $x=${xValue}$，因此 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212FractionDecimalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const xValue = [2, 4, 6][randInt(0, 2)];
        const yValue = [3, 6, 9][randInt(0, 2)];
        const rhs1 = xValue / 2 + yValue / 3;
        const rhs2 = xValue - yValue;
        const eq1 = String.raw`\frac{x}{2}+\frac{y}{3}=${rhs1}`;
        const eq2 = `x-y=${rhs2}`;
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(x,y)=(${xValue},${yValue})$`,
          `先把第一式同乘 6，得 $3x+2y=${rhs1 * 6}$；第二式是 $x-y=${rhs2}$。再用加減消去或代入求解，可得 $x=${xValue},\ y=${yValue}$，所以 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      if (variant === 1) {
        const xValue = [2, 4, 6][randInt(0, 2)];
        const yValue = [2, 5, 8][randInt(0, 2)];
        const rhs1 = trimFixed(0.3 * xValue + 0.5 * yValue, 1);
        const rhs2 = trimFixed(0.1 * xValue + 0.4 * yValue, 1);
        const eq1 = `0.3x+0.5y=${rhs1}`;
        const eq2 = `0.1x+0.4y=${rhs2}`;
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(x,y)=(${xValue},${yValue})$`,
          `先把兩式同乘 10，化成整係數方程式：$3x+5y=${Number(rhs1) * 10}$、$x+4y=${Number(rhs2) * 10}$。再用代入或加減消去求解，可得 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      const yValue = [1, 2, 4][randInt(0, 2)];
      const a = randInt(2, 5);
      const b = randInt(1, 4);
      const xValue = a + b;
      const eq1 = String.raw`\frac{x+y}{2}=${a}`;
      const eq2 = String.raw`\frac{x-y}{3}=${b}`;
      questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$(x,y)=(${xValue},${yValue})$`,
        `先把第一式乘 2、第二式乘 3，得 $x+y=${2 * a}$、$x-y=${3 * b}$。兩式相加可得 $2x=${2 * a + 3 * b}$，所以 $x=${xValue}$；再代回得 $y=${yValue}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212SolutionTypeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const a = pickNonZero(1, 7);
        const b = pickNonZero(1, 7);
        const c = pickNonZero(2, 20);
        const eq1 = `${a}x+${b}y=${c}`;
        const eq2 = `${2 * a}x+${2 * b}y=${2 * c}`;
        questions.push(`判斷聯立方程式 $${formatSystemLatex(eq1, eq2)}$ 的解的情形。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          '有無限多組解',
          `因為 $\\frac{${a}}{${2 * a}}=\\frac{${b}}{${2 * b}}=\\frac{${c}}{${2 * c}}=\\frac{1}{2}$，兩式其實表示同一直線，所以有無限多組解。`
        );
        continue;
      }

      if (variant === 1) {
        const a = pickNonZero(1, 7);
        const b = pickNonZero(1, 7);
        const c = pickNonZero(2, 20);
        const eq1 = `${a}x+${b}y=${c}`;
        const eq2 = `${a}x+${b}y=${c + pickNonZero(1, 6)}`;
        questions.push(`判斷聯立方程式 $${formatSystemLatex(eq1, eq2)}$ 的解的情形。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          '無解',
          `因為左邊完全相同，但右邊常數不同，所以兩條直線平行而不重合，因此無解。`
        );
        continue;
      }

      if (variant === 2) {
        const a = pickNonZero(1, 7);
        const b = pickNonZero(1, 7);
        const c = pickNonZero(2, 20);
        const scale = randInt(2, 6);
        const delta = pickNonZero(1, 6);
        const eq1 = `${a}x+${b}y=${c}`;
        const eq2 = `${a * scale}x+${b * scale}y=${c * scale + delta}`;
        questions.push(`判斷聯立方程式 $${formatSystemLatex(eq1, eq2)}$ 的解的情形。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          '無解',
          `前兩組係數比滿足 $\\frac{${a}}{${a * scale}}=\\frac{${b}}{${b * scale}}=\\frac{1}{${scale}}$，但常數比是 $\\frac{${c}}{${c * scale + delta}}$，與前兩者不同，因此兩條直線平行，屬於無解。`
        );
        continue;
      }

      if (variant === 3) {
        let a1 = pickNonZero(1, 7);
        let b1 = pickNonZero(1, 7);
        let a2 = pickNonZero(1, 7);
        let b2 = pickNonZero(1, 7);
        while (a1 * b2 === a2 * b1) {
          a2 = pickNonZero(1, 5);
          b2 = pickNonZero(1, 5);
        }
        const xValue = randInt(-3, 4);
        const yValue = randInt(-3, 4);
        const c1 = a1 * xValue + b1 * yValue;
        const c2 = a2 * xValue + b2 * yValue;
        const eq1 = `${a1}x+${b1}y=${c1}`;
        const eq2 = `${a2}x+${b2}y=${c2}`;
        questions.push(`判斷聯立方程式 $${formatSystemLatex(eq1, eq2)}$ 的解的情形。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          '恰有一組解',
          `因為 $\\frac{${a1}}{${a2}}$ 與 $\\frac{${b1}}{${b2}}$ 不相等，兩條直線一定相交，所以恰有一組解。`
        );
        continue;
      }

      const a = pickNonZero(2, 8);
      const b = pickNonZero(2, 8);
      const c = pickNonZero(2, 20);
      const ratioDen = randInt(2, 5);
      const scale = randInt(2, 5);
      const k = ratioDen * b;
      const eq1 = `${a}x+${b}y=${c}`;
      const eq2 = `${ratioDen * a}x+ky=${ratioDen * c}`;
      questions.push(`若聯立方程式 $${formatSystemLatex(eq1, eq2)}$ 有無限多組解，求 $k$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$k=${k}$`,
        `若要有無限多組解，三組比值必須都相同。已知 $\\frac{${a}}{${ratioDen * a}}=\\frac{1}{${ratioDen}}$，所以要有 $\\frac{${b}}{k}=\\frac{1}{${ratioDen}}$，解得 $k=${k}$。同時常數比 $\\frac{${c}}{${ratioDen * c}}=\\frac{1}{${ratioDen}}$ 也一致，所以確實是無限多組解。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212TripleEqualSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const xValue = randInt(-3, 5);
      const yValue = randInt(-3, 5);
      const target = randInt(-5, 5);
      const a1 = pickNonZero(1, 5);
      const b1 = pickNonZero(1, 5);
      const c1 = target - a1 * xValue - b1 * yValue;
      const a2 = -pickNonZero(1, 4);
      const b2 = -pickNonZero(1, 4);
      const c2 = target - a2 * xValue - b2 * yValue;
      if (a1 * b2 === a2 * b1 && a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1) {
        i -= 1;
        continue;
      }
      const expr1 = formatTwoVarExpr(a1, b1, c1);
      const expr2 = formatTwoVarExpr(a2, b2, c2);
      const sys1 = `${a1}x${b1 >= 0 ? '+' : ''}${b1}y=${target - c1}`;
      const sys2 = `${a2}x${b2 >= 0 ? '+' : ''}${b2}y=${target - c2}`;
      questions.push(`求滿足 $${expr1}=${expr2}=${target}$ 的 $(x,y)$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$(x,y)=(${xValue},${yValue})$`,
        `把三個式子相等拆成兩個方程式：$${expr1}=${target}$ 與 $${expr2}=${target}$，可得聯立方程式 $${formatSystemLatex(sys1, sys2)}$。解得 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212SymmetricSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2;
      const a = pickNonZero(2, 7);
      const b = pickNonZero(1, 6);

      if (variant === 0) {
        const xValue = randInt(-4, 6);
        const yValue = xValue;
        const total = (a + b) * xValue;
        const eq1 = `${a}x+${b}y=${total}`;
        const eq2 = `${b}x+${a}y=${total}`;
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$x=${xValue},\\ y=${yValue}$`,
          `兩式相減可得 $(${a - b})x-(${a - b})y=0$，所以 $x=y$。再代回任一式，得 $${a + b}x=${total}$，因此 $x=${xValue},\ y=${yValue}$。`
        );
        continue;
      }

      const xValue = randInt(-4, 6);
      const yValue = -xValue;
      const rhs1 = (a - b) * xValue;
      const rhs2 = (b - a) * xValue;
      const eq1 = `${a}x+${b}y=${rhs1}`;
      const eq2 = `${b}x+${a}y=${rhs2}`;
      questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$x=${xValue},\\ y=${yValue}$`,
        `兩式相加得 $(${a + b})x+(${a + b})y=0$，所以 $x+y=0$，即 $y=-x$。代回第一式可得 $x=${xValue},\ y=${yValue}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212AbsZeroSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const xValue = randInt(-3, 5);
      const yValue = randInt(-3, 5);
      const a1 = pickNonZero(1, 4);
      const b1 = pickNonZero(1, 4);
      const c1 = -(a1 * xValue + b1 * yValue);
      const a2 = pickNonZero(1, 4);
      const b2 = -pickNonZero(1, 4);
      const c2 = -(a2 * xValue + b2 * yValue);
      const expr1 = formatTwoVarExpr(a1, b1, c1);
      const expr2 = formatTwoVarExpr(a2, b2, c2);
      if (variant === 0) {
        questions.push(`若 $|${expr1}|+|${expr2}|=0$，求 $(x,y)$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(x,y)=(${xValue},${yValue})$`,
          `因為兩個絕對值都不會小於 0，而它們的和等於 0，所以兩個絕對值內部都必須等於 0。故可列成聯立方程式 $${formatSystemLatex(`${expr1}=0`, `${expr2}=0`)}$，解得 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(`若 $(${expr1})^2+(${expr2})^2=0$，求 $(x,y)$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(x,y)=(${xValue},${yValue})$`,
          `因為平方都不會小於 0，而兩個平方和等於 0，所以每一項平方都必須是 0。故有 $${formatSystemLatex(`${expr1}=0`, `${expr2}=0`)}$，解得 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      questions.push(`若 $|${expr1}|+(${expr2})^2=0$，求 $(x,y)$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$(x,y)=(${xValue},${yValue})$`,
        `因為絕對值與平方都不會小於 0，而它們的和等於 0，所以 $|${expr1}|=0$ 且 $(${expr2})^2=0$。因此可列成 $${formatSystemLatex(`${expr1}=0`, `${expr2}=0`)}$，解得 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildNumericSystemForPoint(xValue, yValue) {
    while (true) {
      const a1 = pickNonZero(1, 5);
      const b1 = pickNonZero(-5, 5);
      const a2 = pickNonZero(1, 5);
      const b2 = pickNonZero(-5, 5);
      if (a1 * b2 === a2 * b1) continue;
      const c1 = a1 * xValue + b1 * yValue;
      const c2 = a2 * xValue + b2 * yValue;
      return { a1, b1, c1, a2, b2, c2 };
    }
  }

  function buildJ212KnownSolutionCoeffSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        let xValue = randInt(-4, 4);
        while (xValue === 0) xValue = randInt(-4, 4);
        const yValue = randInt(-4, 4);
        const p = pickNonZero(2, 5);
        const q = pickNonZero(1, 5);
        const n = pickNonZero(-5, 5);
        const r = pickNonZero(1, 5);
        const m = p * xValue - q * yValue;
        const rhs = n * xValue + r * yValue;
        questions.push(
          `已知 $x=${xValue},\\ y=${yValue}$ 是聯立方程式 $${formatSystemLatex(`${p}x=m+${q}y`, `nx+${r}y=${rhs}`)}$ 的解，求 $m+2n$。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$m+2n=${m + 2 * n}$`,
          `把 $x=${xValue},\\ y=${yValue}$ 代入第一式，可得 $m=${p * xValue}-${q}\\times(${yValue})=${m}$。再代入第二式，得 $${xValue}n+${r}\\times(${yValue})=${rhs}$，所以 $${xValue}n=${rhs - r * yValue}$，解得 $n=${n}$。因此 $m+2n=${m}+2\\times(${n})=${m + 2 * n}$。`
        );
        continue;
      }

      if (variant === 1) {
        const xValue = randInt(-3, 4);
        let yValue = randInt(-3, 4);
        while (yValue === 0) yValue = randInt(-3, 4);
        const a = pickNonZero(-4, 4);
        const b = pickNonZero(-4, 4);
        const c1 = a * xValue + b * yValue;
        const c2 = b * xValue - a * yValue;
        questions.push(
          `若 $x=${xValue},\\ y=${yValue}$ 是聯立方程式 $${formatSystemLatex(`ax+by=${c1}`, `bx-ay=${c2}`)}$ 的解，求 $|a-b|$。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$|a-b|=${Math.abs(a - b)}$`,
          `把 $x=${xValue},\\ y=${yValue}$ 代入，可得 $${formatLinearTwoTerms(xValue, 'a', yValue, 'b')}=${c1}$ 與 $${formatLinearTwoTerms(-yValue, 'a', xValue, 'b')}=${c2}$。解這個關於 $a,b$ 的聯立方程式，可得 $a=${a},\\ b=${b}$，所以 $|a-b|=${Math.abs(a - b)}$。`
        );
        continue;
      }

      if (variant === 2) {
        const xValue = randInt(-3, 4);
        const yValue = randInt(-3, 4);
        const sys = buildNumericSystemForPoint(xValue, yValue);
        questions.push(
          `若 $x=a,\\ y=b$ 為聯立方程式 $${formatSystemLatex(`${sys.a1}x${sys.b1 >= 0 ? '+' : ''}${sys.b1}y=${sys.c1}`, `${sys.a2}x${sys.b2 >= 0 ? '+' : ''}${sys.b2}y=${sys.c2}`)}$ 的解，求 $a+b-1$。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$a+b-1=${xValue + yValue - 1}$`,
          `先解聯立方程式，可得 $(x,y)=(${xValue},${yValue})$。因為題目說 $x=a,\\ y=b$，所以 $a=${xValue},\\ b=${yValue}$，故 $a+b-1=${formatSumValue(formatSumValue(xValue, yValue), -1)}=${xValue + yValue - 1}$。`
        );
        continue;
      }

      let yValue = randInt(-4, 4);
      while (yValue === 0) yValue = randInt(-4, 4);
      const xValue = randInt(-4, 4);
      const a = pickNonZero(-5, 5);
      const b = pickNonZero(-5, 5);
      const rhs1 = a * xValue + 3 * yValue;
      const rhs2 = 2 * xValue + b * yValue;
      questions.push(
        `已知 $x=${xValue},\\ y=${yValue}$ 是聯立方程式 $${formatSystemLatex(`ax+3y=${rhs1}`, `2x+by=${rhs2}`)}$ 的解，求 $a-b$。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$a-b=${a - b}$`,
        `把 $x=${xValue},\\ y=${yValue}$ 代入第一式，得 $${xValue === 0 ? `0${formatSignedTerm(3 * yValue, '')}` : formatLinearTwoTerms(xValue, 'a', 3 * yValue, '')}=${rhs1}$，所以 $${xValue}a=${rhs1 - 3 * yValue}$，解得 $a=${a}$。再代入第二式，得 $2\\times(${xValue})${formatSignedTerm(yValue, 'b')}=${rhs2}$，所以 $${yValue}b=${rhs2 - 2 * xValue}$，解得 $b=${b}$。因此 $a-b=${a - b}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212ErrorDiagnosisSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2;

      if (variant === 0) {
        const xValue = randInt(1, 6);
        const yValue = randInt(1, 9);
        const a = pickNonZero(1, 5);
        const b = pickNonZero(1, 5);
        const p = pickNonZero(2, 5);
        const c1 = a * xValue + b * yValue;
        const c2 = p * xValue - b * yValue;
        let wrong1 = null;
        let wrong2 = null;
        for (let x1 = -4; x1 <= 10 && !wrong1; x1 += 1) {
          for (let y1 = -4; y1 <= 10; y1 += 1) {
            if ((x1 === xValue && y1 === yValue) || x1 === 0) continue;
            if (p * x1 - b * y1 !== c2) continue;
            const aWrong = (c1 - b * y1) / x1;
            if (Number.isInteger(aWrong) && aWrong !== a) {
              wrong1 = { x: x1, y: y1 };
              break;
            }
          }
        }
        for (let x2 = -4; x2 <= 10 && !wrong2; x2 += 1) {
          for (let y2 = -4; y2 <= 10; y2 += 1) {
            if ((x2 === xValue && y2 === yValue) || y2 === 0) continue;
            if (a * x2 + b * y2 !== c1) continue;
            const bWrong = (p * x2 - c2) / y2;
            if (Number.isInteger(bWrong) && bWrong !== b) {
              wrong2 = { x: x2, y: y2 };
              break;
            }
          }
        }
        if (!wrong1 || !wrong2) {
          i -= 1;
          continue;
        }
        questions.push(
          `小明看錯 $a$，解得 $x=${wrong1.x},\\ y=${wrong1.y}$；小雅看錯 $b$，解得 $x=${wrong2.x},\\ y=${wrong2.y}$。求聯立方程式 $${formatSystemLatex(`ax+by=${c1}`, `${p}x-by=${c2}`)}$ 的正確解。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(x,y)=(${xValue},${yValue})$`,
          `因為小明只看錯 $a$，所以他的錯解一定滿足第二式：$${p}\\times(${wrong1.x})-b\\times(${wrong1.y})=${c2}$，解得 $b=${b}$。因為小雅只看錯 $b$，所以她的錯解一定滿足第一式：$a\\times(${wrong2.x})+${b}\\times(${wrong2.y})=${c1}$，解得 $a=${a}$。原方程式變成 $${formatSystemLatex(`${a}x+${b}y=${c1}`, `${p}x-${b}y=${c2}`)}$，解得 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      const xValue = randInt(1, 6);
      let yValue = randInt(-4, 6);
      while (yValue === 0) yValue = randInt(-4, 6);
      const b = pickNonZero(1, 5);
      const c = pickNonZero(1, 5);
      const c1 = 4 * xValue + b * yValue;
      const c2 = 3 * xValue + c * yValue;
      let wrong1 = null;
      let wrong2 = null;
      for (let x1 = -3; x1 <= 10 && !wrong1; x1 += 1) {
        for (let y1 = -3; y1 <= 10; y1 += 1) {
          if ((x1 === xValue && y1 === yValue) || y1 === 0) continue;
          if (3 * x1 + c * y1 !== c2) continue;
          const bWrong = (c1 - 4 * x1) / y1;
          if (Number.isInteger(bWrong) && bWrong !== b) {
            wrong1 = { x: x1, y: y1 };
            break;
          }
        }
      }
      for (let x2 = -3; x2 <= 10 && !wrong2; x2 += 1) {
        for (let y2 = -3; y2 <= 10; y2 += 1) {
          if ((x2 === xValue && y2 === yValue) || y2 === 0) continue;
          if (4 * x2 + b * y2 !== c1) continue;
          const cWrong = (c2 - 3 * x2) / y2;
          if (Number.isInteger(cWrong) && cWrong !== c) {
            wrong2 = { x: x2, y: y2 };
            break;
          }
        }
      }
      if (!wrong1 || !wrong2) {
        i -= 1;
        continue;
      }
      questions.push(
        `莉莉看錯 $b$，解得 $x=${wrong1.x},\\ y=${wrong1.y}$；奇奇看錯 $c$，解得 $x=${wrong2.x},\\ y=${wrong2.y}$。求聯立方程式 $${formatSystemLatex(`4x+by=${c1}`, `3x+cy=${c2}`)}$ 的正確解。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$(x,y)=(${xValue},${yValue})$`,
        `因為莉莉只看錯 $b$，所以她的錯解一定滿足第二式：$3\\times(${wrong1.x})+c\\times(${wrong1.y})=${c2}$，可得 $c=${c}$。因為奇奇只看錯 $c$，所以他的錯解一定滿足第一式：$4\\times(${wrong2.x})+b\\times(${wrong2.y})=${c1}$，可得 $b=${b}$。因此原方程式是 $${formatSystemLatex(`4x+${b}y=${c1}`, `3x+${c}y=${c2}`)}$，解得 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212SharedSolutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const xValue = randInt(-3, 5);
      const yValue = randInt(-3, 5);
      const a = pickNonZero(1, 5);
      const b = pickNonZero(1, 5);

      if (variant === 0) {
        const s = xValue + yValue;
        const d = xValue - yValue;
        const c1 = a * xValue + b * yValue;
        const c2 = a * xValue - b * yValue;
        questions.push(
          `若聯立方程式 $${formatSystemLatex(`x+y=${s}`, `x-y=${d}`)}$ 與 $${formatSystemLatex(`ax+by=${c1}`, `ax-by=${c2}`)}$ 有相同的解，求 $a,b$。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$a=${a},\\ b=${b}$`,
          `先由第一組解得 $x=${xValue},\\ y=${yValue}$。再把這組 $(x,y)$ 代入第二組，可得關於 $a,b$ 的聯立方程式，解得 $a=${a},\\ b=${b}$。`
        );
        continue;
      }

      if (variant === 1) {
        const p = pickNonZero(1, 5);
        const q = pickNonZero(-5, 5);
        const r = p * xValue + q * yValue;
        const s = a * xValue + b * yValue;
        const t = b * xValue + a * yValue;
        const u = 2 * xValue - 5 * yValue;
        questions.push(
          `若 $${formatSystemLatex(`${p}x${q >= 0 ? '+' : ''}${q}y=${r}`, `bx+ay=${t}`)}$ 與 $${formatSystemLatex(`ax+by=${s}`, `2x-5y=${u}`)}$ 有相同的解，求 $a,b$。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$a=${a},\\ b=${b}$`,
          `先利用不含 $a,b$ 的兩式 $${p}x${q >= 0 ? '+' : ''}${q}y=${r}$ 與 $2x-5y=${u}$ 解得 $x=${xValue},\\ y=${yValue}$。再代入其餘兩式 $ax+by=${s}$、$bx+ay=${t}$，解出 $a=${a},\\ b=${b}$。`
        );
        continue;
      }

      const p = pickNonZero(1, 5);
      const q = pickNonZero(-5, 5);
      const r = pickNonZero(1, 5);
      const s = pickNonZero(-5, 5);
      if (p * s === q * r) {
        i -= 1;
        continue;
      }
      const c1 = a * xValue + b * yValue;
      const c2 = a * xValue - b * yValue;
      const d1 = p * xValue + q * yValue;
      const d2 = r * xValue + s * yValue;
      questions.push(
        `若 $${formatSystemLatex(`ax+by=${c1}`, `ax-by=${c2}`)}$ 與 $${formatSystemLatex(`${p}x${q >= 0 ? '+' : ''}${q}y=${d1}`, `${r}x${s >= 0 ? '+' : ''}${s}y=${d2}`)}$ 有相同的解，求 $a,b$。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$a=${a},\\ b=${b}$`,
        `先由第二組純數字的聯立方程式解得 $x=${xValue},\\ y=${yValue}$。再代回第一組 $ax+by=${c1}$、$ax-by=${c2}$，即可解得 $a=${a},\\ b=${b}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212ThirdConditionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const xValue = 1;
        const yValue = 2;
        const sys = buildNumericSystemForPoint(xValue, yValue);
        const a = pickNonZero(1, 5);
        const b = pickNonZero(1, 5);
        const target = a * xValue + b * yValue;
        questions.push(
          `若聯立方程式 $${formatSystemLatex(`${sys.a1}x${sys.b1 >= 0 ? '+' : ''}${sys.b1}y=${sys.c1}`, `${sys.a2}x${sys.b2 >= 0 ? '+' : ''}${sys.b2}y=${sys.c2}`)}$ 的解滿足 $ax+by=${target}$，求 $a+2b$。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$a+2b=${target}$`,
          `先解聯立方程式，可得 $(x,y)=(1,2)$。把它代入第三個條件 $ax+by=${target}$，就得到 $a+2b=${target}$。`
        );
        continue;
      }

      if (variant === 1) {
        const t = randInt(1, 4);
        const xValue = t;
        const yValue = -t;
        const p = pickNonZero(3, 8);
        const q = pickNonZero(3, 8);
        const r = pickNonZero(3, 8);
        const s = -pickNonZero(1, 6);
        const k = p * xValue + q * yValue;
        const delta = r * xValue + s * yValue - k;
        questions.push(
          `已知聯立方程式 $${formatSystemLatex(`${p}x+${q}y=k`, `${r}x${s >= 0 ? '+' : ''}${s}y=k${delta >= 0 ? '+' : ''}${delta}`)}$ 的解為 $x=a,\\ y=b$。若 $a,b$ 互為相反數，求 $k$。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$k=${k}$`,
          `因為 $a,b$ 互為相反數，所以可設 $y=-x$。代入兩式聯立，可得 $x=${xValue},\\ y=${yValue}$，進而算出 $k=${k}$。`
        );
        continue;
      }

      if (variant === 2) {
        const yValue = randInt(1, 5);
        const xValue = yValue - 2;
        const a = pickNonZero(1, 6);
        const rhs1 = a * xValue - 4 * yValue + 8;
        const rhs2 = 4 * xValue - yValue - 7;
        questions.push(
          `若聯立方程式 $${formatSystemLatex(`ax-4y+8=0`, `4x-y-7=0`)}$ 的解中，$x$ 比 $y$ 小 2，求 $a$。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$a=${a}$`,
          `由「$x$ 比 $y$ 小 2」可得 $y=x+2$。代入第二式 $4x-y-7=0$，可求得 $x=${xValue},\\ y=${yValue}$。再代入第一式 $ax-4y+8=0$，解得 $a=${a}$。`
        );
        continue;
      }

      const xValue = 2;
      const yValue = 1;
      const p = pickNonZero(1, 5);
      const q = pickNonZero(1, 5);
      const k = 2 * p + q;
      const sys = buildNumericSystemForPoint(xValue, yValue);
      questions.push(
        `若聯立方程式 $${formatSystemLatex(`${sys.a1}x${sys.b1 >= 0 ? '+' : ''}${sys.b1}y=${sys.c1}`, `${sys.a2}x${sys.b2 >= 0 ? '+' : ''}${sys.b2}y=${sys.c2}`)}$ 的解還滿足 $px+qy=${k}$，且 $x$ 是 $y$ 的 2 倍，求 $2p+q$。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$2p+q=${k}$`,
        `由聯立方程式先求得 $(x,y)=(2,1)$，也確實滿足 $x=2y$。把它代入第三條件 $px+qy=${k}$，可得 $2p+q=${k}$。因此答案就是 $${k}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212SpecialReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const a = pickNonZero(1, 6);
        const b = pickNonZero(1, 6);
        const c = pickNonZero(2, 12);
        const scale = randInt(2, 4);
        const k = b * scale;
        questions.push(
          `若聯立方程式 $${formatSystemLatex(`${a}x+${b}y=${c}`, `${a * scale}x+ky=${c}`)}$ 無解，求 $k$。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$k=${k}$`,
          `無解表示前兩組係數成比例，但常數比不同。因為 $\\frac{${a}}{${a * scale}}=\\frac{1}{${scale}}$，所以也要有 $\\frac{${b}}{k}=\\frac{1}{${scale}}$，解得 $k=${k}$。此時常數比是 $\\frac{${c}}{${c}}=1$，與前面不同，所以確實無解。`
        );
        continue;
      }

      if (variant === 1) {
        const a = pickNonZero(1, 6);
        const b = -pickNonZero(1, 6);
        const c = pickNonZero(2, 12);
        const scale = randInt(2, 4);
        const k = c * scale;
        questions.push(
          `若聯立方程式 $${formatSystemLatex(`${a}x${b >= 0 ? '+' : ''}${b}y=${c}`, `${a * scale}x${b * scale >= 0 ? '+' : ''}${b * scale}y=k`)}$ 有無限多組解，求 $k$。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$k=${k}$`,
          `有無限多組解表示三組比值都相同。前兩組係數比已是 $\\frac{1}{${scale}}$，所以常數也必須滿足 $\\frac{${c}}{k}=\\frac{1}{${scale}}$，解得 $k=${k}$。`
        );
        continue;
      }

      if (variant === 2) {
        const p = randInt(2, 6);
        const a = -randInt(1, 5);
        const r = -p * a;
        const q = [8, 10, 12, 15, 18, 20, 24, 30][randInt(0, 7)];
        const s = p * q;
        questions.push(`若聯立方程式 $${formatSystemLatex(`x+ay=${q}`, `${p}x-${r}y=${s}`)}$ 有無限多組解，求 $a$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$a=${a}$`,
          `若有無限多組解，三組比值都要相同。由 $\\frac{1}{${p}}=\\frac{${q}}{${s}}$，可知也要有 $\\frac{a}{-${r}}=\\frac{1}{${p}}$，所以 $a=${a}$。`
        );
        continue;
      }

      const p = randInt(2, 6);
      const a = -randInt(1, 5);
      const r = -p * a;
      const q = [8, 10, 12, 15, 18, 20, 24, 30][randInt(0, 7)];
      const offset = [1, 2, 3, 4, 5, 6][randInt(0, 5)];
      const s = p * q + offset;
      questions.push(`若聯立方程式 $${formatSystemLatex(`x+ay=${q}`, `${p}x-${r}y=${s}`)}$ 無解，求 $a$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$a=${a}$`,
        `若無解，前兩組係數要成比例，但常數比不同。先由 $\\frac{1}{${p}}=\\frac{a}{-${r}}$ 得 $a=${a}$。此時係數比固定是 $\\frac{1}{${p}}$，但常數比是 $\\frac{${q}}{${s}}$，與 $\\frac{1}{${p}}$ 不同，因此確實無解。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212BracketSimplifySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const xValue = randInt(-3, 6);
      const yValue = randInt(-3, 6);

      if (variant === 0) {
        const eq1 = `x+2(y-1)=${xValue + 2 * (yValue - 1)}`;
        const eq2 = `2x-y+3=${2 * xValue - yValue + 3}`;
        const simplified1 = `x+2y=${xValue + 2 * (yValue - 1) + 2}`;
        const simplified2 = `2x-y=${2 * xValue - yValue}`;
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(x,y)=(${xValue},${yValue})$`,
          `先化簡第一式得 $${simplified1}$，第二式化簡得 $${simplified2}$。再解聯立方程式，可得 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      if (variant === 1) {
        const eq1 = `3(x-2)-2(y+1)=${3 * (xValue - 2) - 2 * (yValue + 1)}`;
        const eq2 = `2(x+1)+y=${2 * (xValue + 1) + yValue}`;
        const simplified1 = `3x-2y=${3 * (xValue - 2) - 2 * (yValue + 1) + 8}`;
        const simplified2 = `2x+y=${2 * (xValue + 1) + yValue - 2}`;
        questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$(x,y)=(${xValue},${yValue})$`,
          `先展開整理，可得 $${simplified1}$ 與 $${simplified2}$。接著用消去法或代入法求解，得到 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      const eq1 = `2(x+y)-3(x-y)=${2 * (xValue + yValue) - 3 * (xValue - yValue)}`;
      const eq2 = `4x+y=${4 * xValue + yValue}`;
      const simplified1 = `-x+5y=${2 * (xValue + yValue) - 3 * (xValue - yValue)}`;
      questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$(x,y)=(${xValue},${yValue})$`,
        `先把第一式展開：$2(x+y)-3(x-y)=-x+5y$，所以原式可化成 $${formatSystemLatex(simplified1, eq2)}$。再解得 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212ReciprocalSubstitutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const coeffChoices = [
      [1, 2],
      [1, -1],
      [2, 1],
      [3, -2],
      [2, -3],
    ];

    for (let i = 0; i < count; i += 1) {
      const xValue = [-4, -3, -2, -1, 1, 2, 3, 4][randInt(0, 7)];
      let yValue = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5][randInt(0, 9)];
      while (yValue === 0 || yValue === xValue) yValue = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5][randInt(0, 9)];
      const u = makeFraction(1, xValue);
      const v = makeFraction(1, yValue);
      const [a1, b1] = coeffChoices[randInt(0, coeffChoices.length - 1)];
      let [a2, b2] = coeffChoices[randInt(0, coeffChoices.length - 1)];
      while (a1 * b2 === a2 * b1) {
        [a2, b2] = coeffChoices[randInt(0, coeffChoices.length - 1)];
      }
      const c1 = addFraction(mulFraction(makeFraction(a1, 1), u), mulFraction(makeFraction(b1, 1), v));
      const c2 = addFraction(mulFraction(makeFraction(a2, 1), u), mulFraction(makeFraction(b2, 1), v));
      const eq1 = `\\frac{${a1}}{x}${b1 >= 0 ? '+' : '-'}\\frac{${Math.abs(b1)}}{y}=${fractionToLatex(c1, true)}`;
      const eq2 = `\\frac{${a2}}{x}${b2 >= 0 ? '+' : '-'}\\frac{${Math.abs(b2)}}{y}=${fractionToLatex(c2, true)}`;
      questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$x=${xValue},\\ y=${yValue}$`,
        `設 $u=\\frac{1}{x},\\ v=\\frac{1}{y}$，原式可化成 $${formatSystemLatex(`${a1}u${b1 >= 0 ? '+' : ''}${b1}v=${fractionToLatex(c1, true)}`, `${a2}u${b2 >= 0 ? '+' : ''}${b2}v=${fractionToLatex(c2, true)}`)}$。解得 $u=${fractionToLatex(u, true)},\\ v=${fractionToLatex(v, true)}$，所以 $x=${xValue},\\ y=${yValue}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212ReciprocalStructureSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const coeffChoices = [
      [1, 1],
      [1, -1],
      [2, 1],
      [1, 2],
      [3, -1],
    ];

    for (let i = 0; i < count; i += 1) {
      const s = [2, 4, 6, 8, -2, -4, -6, -8][randInt(0, 7)];
      let d = [2, 4, 6, -2, -4, -6][randInt(0, 5)];
      while (d === 0 || s === d || (s + d) % 2 !== 0) d = [2, 4, 6, -2, -4, -6][randInt(0, 5)];
      const xValue = (s + d) / 2;
      const yValue = (s - d) / 2;
      if (xValue === 0 || yValue === 0) {
        i -= 1;
        continue;
      }
      const u = makeFraction(1, s);
      const v = makeFraction(1, d);
      const [a1, b1] = coeffChoices[randInt(0, coeffChoices.length - 1)];
      let [a2, b2] = coeffChoices[randInt(0, coeffChoices.length - 1)];
      while (a1 * b2 === a2 * b1) {
        [a2, b2] = coeffChoices[randInt(0, coeffChoices.length - 1)];
      }
      const c1 = addFraction(mulFraction(makeFraction(a1, 1), u), mulFraction(makeFraction(b1, 1), v));
      const c2 = addFraction(mulFraction(makeFraction(a2, 1), u), mulFraction(makeFraction(b2, 1), v));
      const eq1 = `\\frac{${a1}}{x+y}${b1 >= 0 ? '+' : '-'}\\frac{${Math.abs(b1)}}{x-y}=${fractionToLatex(c1, true)}`;
      const eq2 = `\\frac{${a2}}{x+y}${b2 >= 0 ? '+' : '-'}\\frac{${Math.abs(b2)}}{x-y}=${fractionToLatex(c2, true)}`;
      questions.push(`解聯立方程式：$${formatSystemLatex(eq1, eq2)}$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$x=${xValue},\\ y=${yValue}$`,
        `設 $u=\\frac{1}{x+y},\\ v=\\frac{1}{x-y}$，原式可化成 $${formatSystemLatex(`${a1}u${b1 >= 0 ? '+' : ''}${b1}v=${fractionToLatex(c1, true)}`, `${a2}u${b2 >= 0 ? '+' : ''}${b2}v=${fractionToLatex(c2, true)}`)}$。解得 $u=${fractionToLatex(u, true)},\\ v=${fractionToLatex(v, true)}$，所以 $x+y=${s},\\ x-y=${d}$。再解這組聯立，可得 $x=${xValue},\\ y=${yValue}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-1-2 新增：兩組解求單方程係數 ──────────────────────────────────────
  function buildJ212TwoSolutionOneEqSet(count) {
    // 已知方程式 mx + ny = C 有兩組整數解，求 m、n 的某種組合
    // 生成策略：先定 m、n，再推導兩組解點，保證無無限迴圈
    const questions = [];
    const answers = [];
    const summaryAnswers = [];

    // 預先驗算好的 (m, n, x1, y1, x2, y2, ask) 題組
    // 滿足 m*x1+n*y1=C 且 m*x2+n*y2=C，其中 x2=x1+n, y2=y1-m
    const pool = [
      { m: 2, n: 3, x1: 3, y1: 4, ask: 'm+n', label: 'm+n' },
      { m: 3, n: 2, x1: 2, y1: 3, ask: 'm-n', label: 'm-n' },
      { m: 1, n: 4, x1: 4, y1: 3, ask: 'm+n', label: 'm+n' },
      { m: 4, n: 1, x1: 1, y1: 4, ask: '2m+n', label: '2m+n' },
      { m: 2, n: 5, x1: 5, y1: 2, ask: 'm+n', label: 'm+n' },
      { m: 5, n: 2, x1: 2, y1: 5, ask: 'm-n', label: 'm-n' },
      { m: 3, n: 4, x1: 4, y1: 3, ask: 'm+n', label: 'm+n' },
      { m: 4, n: 3, x1: 3, y1: 4, ask: 'm+2n', label: 'm+2n' },
      { m: 1, n: 5, x1: 5, y1: 1, ask: '2m+n', label: '2m+n' },
      { m: 2, n: 3, x1: 1, y1: 6, ask: 'm+n', label: 'm+n' },
      { m: 3, n: 5, x1: 5, y1: 3, ask: 'm+n', label: 'm+n' },
      { m: 2, n: 4, x1: 2, y1: 3, ask: 'm-n', label: 'm-n' },
      { m: 3, n: 2, x1: 4, y1: 2, ask: 'm+2n', label: 'm+2n' },
      { m: 1, n: 3, x1: 3, y1: 2, ask: 'm+n', label: 'm+n' },
      { m: 4, n: 2, x1: 2, y1: 4, ask: '2m+n', label: '2m+n' },
      { m: 5, n: 3, x1: 1, y1: 8, ask: 'm+n', label: 'm+n' },
      { m: 2, n: 6, x1: 4, y1: 5, ask: 'm+2n', label: 'm+2n' },
      { m: 6, n: 1, x1: 2, y1: 7, ask: '2m+n', label: '2m+n' },
      { m: 3, n: 7, x1: 2, y1: 6, ask: 'm-n', label: 'm-n' },
      { m: 5, n: 4, x1: 3, y1: 6, ask: 'm+n', label: 'm+n' },
      { m: 2, n: 7, x1: 3, y1: 5, ask: '2m+n', label: '2m+n' },
    ];

    for (let i = 0; i < count; i += 1) {
      const t = pool[randInt(0, pool.length - 1)];
      const { m, n } = t;
      const x1 = t.x1,
        y1 = t.y1;
      const C = m * x1 + n * y1;
      // 第二組解：沿等差方向移動
      const x2 = x1 + n;
      const y2 = y1 - m;

      let askVal;
      if (t.ask === 'm+n') askVal = m + n;
      else if (t.ask === 'm-n') askVal = m - n;
      else if (t.ask === '2m+n') askVal = 2 * m + n;
      else if (t.ask === 'm+2n') askVal = m + 2 * n;
      else askVal = m + n;

      questions.push(
        `已知方程式 $mx+ny=${C}$ 有兩組解 $(x,y)=(${x1},\ ${y1})$ 與 $(x,y)=(${x2},\ ${y2})$，求 $${t.label}$ 的值。`
      );
      answers.push(
        `將兩組解代入 $mx+ny=${C}$，得聯立方程組：` +
          `$\\begin{cases}${formatLinearTwoTerms(x1, 'm', y1, 'n')}=${C}\\\\${formatLinearTwoTerms(x2, 'm', y2, 'n')}=${C}\\end{cases}$。` +
          `解得 $m=${m},\ n=${n}$，故 $${t.label}=${askVal}$。`
      );
      summaryAnswers.push(`$${t.label}=${askVal}$`);
    }

    return { questions, summaryAnswers, answers };
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  function normalizeRatioInts(a, b) {
    const g = gcd(Math.abs(a), Math.abs(b));
    let ra = a / g;
    let rb = b / g;
    if (rb < 0 || (rb === 0 && ra < 0)) {
      ra *= -1;
      rb *= -1;
    }
    return { a: ra, b: rb };
  }

  function normalizeRatioInts3(a, b, c) {
    const g = gcd(gcd(Math.abs(a), Math.abs(b)), Math.abs(c));
    let ra = a / g;
    let rb = b / g;
    let rc = c / g;
    if (ra < 0 || (ra === 0 && rb < 0) || (ra === 0 && rb === 0 && rc < 0)) {
      ra *= -1;
      rb *= -1;
      rc *= -1;
    }
    return { a: ra, b: rb, c: rc };
  }

  function normalizeRatioFromFractions(left, right) {
    const common = lcm(left.den, right.den);
    return normalizeRatioInts(left.num * (common / left.den), right.num * (common / right.den));
  }

  function formatSingleVarExpr(coef, constant) {
    if (coef === 0) return `${constant}`;
    const term = formatTerm(coef, 'x');
    if (constant === 0) return term;
    return `${term}${constant > 0 ? '+' : ''}${constant}`;
  }

  function buildJ231RatioSimplifySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const left = randomMixedFraction(1, 3, [2, 3, 4, 5], false);
        const right = randomProperFraction([2, 3, 4, 5, 6]);
        if (randInt(0, 1) === 0) {
          const ratio = normalizeRatioFromFractions(left, right);
          const common = lcm(left.den, right.den);
          questions.push(`將 $${integerOrFractionLatex(left)}:${fractionToLatex(right)}$ 化為最簡整數比。`);
          pushAnswerWithManualSummary(
            answers,
            summaryAnswers,
            `$${ratio.a}:${ratio.b}$`,
            `先把兩項都看成分數，再同乘分母的最小公倍數 ${common}，可得整數比。約分後，最簡整數比為 $${ratio.a}:${ratio.b}$。`
          );
        } else {
          const value = divFraction(left, right);
          questions.push(`求 $${integerOrFractionLatex(left)}:${fractionToLatex(right)}$ 的比值。`);
          pushAnswerWithManualSummary(
            answers,
            summaryAnswers,
            `$${fractionToLatex(value)}$`,
            `比值就是前項除以後項，所以 $${fractionToLatex(left)}\\div ${fractionToLatex(right)}=${fractionToLatex(value)}$。`
          );
        }
        continue;
      }

      if (variant === 1) {
        const decimalChoices = [
          { text: '0.4', frac: makeFraction(2, 5) },
          { text: '0.75', frac: makeFraction(3, 4) },
          { text: '1.2', frac: makeFraction(6, 5) },
          { text: '2.25', frac: makeFraction(9, 4) },
        ];
        const left = decimalChoices[randInt(0, decimalChoices.length - 1)];
        const right = randomMixedFraction(1, 2, [2, 4, 5, 10], false);
        if (randInt(0, 1) === 0) {
          const ratio = normalizeRatioFromFractions(left.frac, right);
          const common = lcm(left.frac.den, right.den);
          questions.push(`將 $${left.text}:${integerOrFractionLatex(right)}$ 化為最簡整數比。`);
          pushAnswerWithManualSummary(
            answers,
            summaryAnswers,
            `$${ratio.a}:${ratio.b}$`,
            `先把小數化成分數：$${left.text}=${fractionToLatex(left.frac)}$。再同乘分母的最小公倍數 ${common}，約分後得最簡整數比 $${ratio.a}:${ratio.b}$。`
          );
        } else {
          const value = divFraction(left.frac, right);
          questions.push(`求 $${left.text}:${integerOrFractionLatex(right)}$ 的比值。`);
          pushAnswerWithManualSummary(
            answers,
            summaryAnswers,
            `$${fractionToLatex(value)}$`,
            `把小數化成分數後，比值為 $${fractionToLatex(left.frac)}\\div ${fractionToLatex(right)}=${fractionToLatex(value)}$。`
          );
        }
        continue;
      }

      if (variant === 2) {
        const gram = randInt(4, 18) * 50;
        const kg = makeFraction(randInt(2, 9), 10);
        const kgGram = mulFraction(kg, makeFraction(1000, 1));
        const ratio = normalizeRatioFromFractions(makeFraction(gram, 1), kgGram);
        questions.push(`將 ${gram} 公克：$${fractionToLatex(kg)}$ 公斤化為最簡整數比。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${ratio.a}:${ratio.b}$`,
          `先把公斤化成公克：$${fractionToLatex(kg)}$ 公斤 $=${fractionToLatex(kgGram)}$ 公克。再把 $${gram}:${fractionToLatex(kgGram)}$ 約成最簡整數比，可得 $${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      if (variant === 3) {
        const minute = randInt(1, 4);
        const second = randInt(10, 50);
        const totalSecond = minute * 60 + second;
        const otherMinute = randInt(1, 4);
        const ratio = normalizeRatioInts(totalSecond, otherMinute * 60);
        questions.push(`將 ${minute} 分 ${second} 秒：${otherMinute} 分鐘化為最簡整數比。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${ratio.a}:${ratio.b}$`,
          `先把時間都化成秒：${minute} 分 ${second} 秒 $=${totalSecond}$ 秒，${otherMinute} 分鐘 $=${otherMinute * 60}$ 秒，所以最簡整數比為 $${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      const left = makeFraction(randInt(3, 9), randInt(2, 6));
      const right = negateFraction(makeFraction(randInt(2, 8), randInt(2, 6)));
      const value = divFraction(left, right);
      questions.push(`求 $${fractionToLatex(left)}:${fractionToLatex(right)}$ 的比值。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${fractionToLatex(value)}$`,
        `比值就是前項除以後項，所以 $${fractionToLatex(left)}\\div ${fractionToLatex(right)}=${fractionToLatex(value)}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231ProportionSolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        let x = randInt(-3, 6);
        const a = randInt(1, 5);
        const b = randInt(3, 8);
        const d = randInt(2, 6);
        let c = (d * (x - a)) / b - x;
        while (!Number.isInteger(c) || Math.abs(c) > 9) {
          x = randInt(-3, 6);
          c = (d * (x - a)) / b - x;
        }
        questions.push(
          `求比例式 $(${formatSingleVarExpr(1, -a)}):${b}=(${formatSingleVarExpr(1, c)}):${d}$ 中的 $x$ 值。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$x=${x}$`,
          `由比例式可得 $${d}\\left(${formatSingleVarExpr(1, -a)}\\right)=${b}\\left(${formatSingleVarExpr(1, c)}\\right)$。整理後解得 $x=${x}$。`
        );
        continue;
      }

      if (variant === 1) {
        const x = randInt(-2, 5);
        const a = randInt(2, 4);
        const b = randInt(3, 6);
        const c = (a * x + 1) * b;
        questions.push(`若 $(${a}x+1):${b}$ 的比值為 ${c}，求 $x$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$x=${x}$`,
          `比值為 ${c} 表示 $\\dfrac{${a}x+1}{${b}}=${c}$。所以 $${a}x+1=${c * b}$，解得 $x=${x}$。`
        );
        continue;
      }

      if (variant === 2) {
        const x = randInt(1, 6);
        const left = makeFraction(randInt(2, 5), randInt(2, 4));
        const expr = makeFraction(2 * x, 3);
        const value = divFraction(left, expr);
        questions.push(
          `求比例式 $${fractionToLatex(left)}:${fractionToLatex(makeFraction(2, 3))}x=${value.num}:${value.den}$ 中的 $x$ 值。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$x=${x}$`,
          `由比例式可得 $${value.den}\\times ${fractionToLatex(left)}=${value.num}\\times ${fractionToLatex(makeFraction(2, 3))}x$。整理後解得 $x=${x}$。`
        );
        continue;
      }

      if (variant === 3) {
        const x = randInt(-2, 6);
        const a = randInt(2, 5);
        const b = randInt(-5, 4);
        const c = randInt(2, 6);
        const ratioValue = divFraction(makeFraction(a * x + b, 1), makeFraction(c, 1));
        questions.push(`若 $(${formatSingleVarExpr(a, b)}):${c}$ 的比值為 $${fractionToLatex(ratioValue)}$，求 $x$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$x=${x}$`,
          `比值為 $${fractionToLatex(ratioValue)}$ 表示 $\\dfrac{${formatSingleVarExpr(a, b)}}{${c}}=${fractionToLatex(ratioValue)}$。交叉相乘後可得 $${formatSingleVarExpr(a, b)}=${fractionToLatex(mulFraction(makeFraction(c, 1), ratioValue))}$，解得 $x=${x}$。`
        );
        continue;
      }

      let x = randInt(-1, 5);
      let p = randInt(1, 4);
      let q = randInt(2, 5);
      let lhs1 = -x + p;
      let lhs2 = 3 * x - q;
      while (lhs2 === 0 || (lhs1 === 0 && lhs2 === 0)) {
        x = randInt(-1, 5);
        p = randInt(1, 4);
        q = randInt(2, 5);
        lhs1 = -x + p;
        lhs2 = 3 * x - q;
      }
      const ratio = normalizeRatioInts(lhs1, lhs2);
      questions.push(
        `求比例式 $(${formatSingleVarExpr(-1, p)}):(${formatSingleVarExpr(3, -q)})=${ratio.a}:${ratio.b}$ 中的 $x$ 值。`
      );
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$x=${x}$`,
        `由比例式可得 $${ratio.b}(${formatSingleVarExpr(-1, p)})=${ratio.a}(${formatSingleVarExpr(3, -q)})$。整理後解得 $x=${x}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231RelationTransformSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const p = randInt(3, 8);
        const q = randInt(2, 6);
        const m = randInt(2, 5);
        const n = randInt(2, 5);
        const ratio = normalizeRatioInts(m * q, n * p);
        questions.push(`已知 $${p}x=${q}y$（$x,y\\ne 0$），求 $${m}x:${n}y$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${ratio.a}:${ratio.b}$`,
          `由 $${p}x=${q}y$ 可得 $x:y=${q}:${p}$。因此 $${formatTerm(m, 'x')}:${formatTerm(n, 'y')}=${m}\\times ${q}:${n}\\times ${p}=${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      if (variant === 1) {
        const lx = randInt(3, 7);
        const ly = -randInt(1, 4);
        const rx = randInt(1, lx - 1);
        const ry = randInt(1, 4);
        const xCoef = lx - rx;
        const yCoef = ry - ly;
        const ratio = normalizeRatioInts(yCoef, xCoef);
        questions.push(
          `已知 $${formatTerm(lx, 'x')}${ly > 0 ? '+' : ''}${formatTerm(ly, 'y')}=${formatTerm(rx, 'x')}${ry > 0 ? '+' : ''}${formatTerm(ry, 'y')}$，整理後求 $x:y$。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${ratio.a}:${ratio.b}$`,
          `移項整理得 $${formatTerm(xCoef, 'x')}=${formatTerm(yCoef, 'y')}$，因此 $x:y=${yCoef}:${xCoef}$，最簡整數比為 $${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      if (variant === 2) {
        const xRatio = randInt(2, 5);
        const yRatio = randInt(2, 5);
        const base = normalizeRatioInts(xRatio, yRatio);
        const a = randInt(1, 4);
        const b = randInt(1, 4);
        let c = randInt(1, 4);
        let d = randInt(1, 4);
        while (a === c && b === d) {
          c = randInt(1, 4);
          d = randInt(1, 4);
        }
        const result = normalizeRatioInts(a * base.a + b * base.b, c * base.a + d * base.b);
        const leftExpr = formatLinearCombination([
          { coef: a, variable: 'x' },
          { coef: b, variable: 'y' },
        ]);
        const rightExpr = formatLinearCombination([
          { coef: c, variable: 'x' },
          { coef: d, variable: 'y' },
        ]);
        questions.push(`已知 $x:y=${base.a}:${base.b}$，求 $(${leftExpr}):(${rightExpr})$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${result.a}:${result.b}$`,
          `由 $x:y=${base.a}:${base.b}$，可設 $x=${formatTerm(base.a, 'k')},\\ y=${formatTerm(base.b, 'k')}$。代入得 $(${leftExpr}):(${rightExpr})=${formatTerm(a * base.a + b * base.b, 'k')}:${formatTerm(c * base.a + d * base.b, 'k')}=${result.a}:${result.b}$。`
        );
        continue;
      }

      const base = normalizeRatioInts(randInt(2, 5), randInt(2, 5));
      const numerator = 3 * base.a * base.a + 4 * base.a * base.b;
      const denominator = 2 * base.a * base.b + 5 * base.b * base.b;
      const value = simplifyFraction(numerator, denominator);
      questions.push(`已知 $x:y=${base.a}:${base.b}$，求 $\\dfrac{3x^2+4xy}{2xy+5y^2}$ 的值。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${fractionToLatex(value)}$`,
        `由 $x:y=${base.a}:${base.b}$，可設 $x=${formatTerm(base.a, 'k')},\\ y=${formatTerm(base.b, 'k')}$。代入後分子為 $(3\\times ${base.a}^2+4\\times ${base.a}\\times ${base.b})k^2=${numerator}k^2$，分母為 $(2\\times ${base.a}\\times ${base.b}+5\\times ${base.b}^2)k^2=${denominator}k^2$，所以值為 $${fractionToLatex(value)}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231ChainRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const a = randInt(2, 6);
        const b = randInt(2, 6);
        const c = randInt(2, 7);
        const d = randInt(2, 7);
        const left = a * c;
        const mid = b * c;
        const right = b * d;
        const ratio = normalizeRatioInts3(left, mid, right);
        questions.push(`已知 $x:y=${a}:${b}$，且 $y:z=${c}:${d}$，求 $x:y:z$ 的最簡整數比。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${ratio.a}:${ratio.b}:${ratio.c}$`,
          `先把兩個比中的 $y$ 對齊。$x:y=${a}:${b}$ 可放大成 $${a * c}:${b * c}$；$y:z=${c}:${d}$ 可放大成 $${b * c}:${b * d}$。因此 $x:y:z=${left}:${mid}:${right}$，最簡整數比為 $${ratio.a}:${ratio.b}:${ratio.c}$。`
        );
        continue;
      }

      if (variant === 1) {
        const p = randInt(2, 5);
        const q = randInt(2, 5);
        const r = randInt(2, 6);
        const unit = randInt(4, 12);
        const total = (p + q + r) * unit;
        const ask = [0, 1, 2][randInt(0, 2)];
        const values = [p * unit, q * unit, r * unit];
        const names = ['甲', '乙', '丙'];
        questions.push(`將 ${total} 元按照 $${p}:${q}:${r}$ 分給甲、乙、丙三人，求${names[ask]}分到多少元。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `${values[ask]} 元`,
          `總份數是 $${p + q + r}$ 份，所以 1 份是 ${unit} 元。${names[ask]}對應 ${[p, q, r][ask]} 份，因此分到 ${values[ask]} 元。`
        );
        continue;
      }

      const a = randInt(1, 4);
      const b = randInt(2, 5);
      const c = randInt(3, 6);
      const unit = randInt(2, 6);
      const x = a * unit;
      const y = b * unit;
      const z = c * unit;
      const coeff1 = randInt(1, 3);
      const coeff2 = randInt(1, 3);
      const coeff3 = randInt(1, 3);
      const rhs = coeff1 * x + coeff2 * y + coeff3 * z;
      const conditionExpr = formatLinearCombination([
        { coef: coeff1, variable: 'a' },
        { coef: coeff2, variable: 'b' },
        { coef: coeff3, variable: 'c' },
      ]);
      questions.push(`已知 $a:b:c=${a}:${b}:${c}$，且 $${conditionExpr}=${rhs}$，求 $a,b,c$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$a=${x}$，$b=${y}$，$c=${z}$`,
        `因為 $a:b:c=${a}:${b}:${c}$，可設 $a=${formatTerm(a, 'k')},\\ b=${formatTerm(b, 'k')},\\ c=${formatTerm(c, 'k')}$。代入條件得 $${formatTerm(coeff1 * a + coeff2 * b + coeff3 * c, 'k')}=${rhs}$，所以 $k=${unit}$。因此 $a=${x},\\ b=${y},\\ c=${z}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231BasicSingleStepSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const left = randomMixedFraction(1, 3, [2, 3, 4, 5], false);
        const decimalChoices = [
          { text: '0.75', frac: makeFraction(3, 4) },
          { text: '1.2', frac: makeFraction(6, 5) },
          { text: '2.25', frac: makeFraction(9, 4) },
          { text: '0.6', frac: makeFraction(3, 5) },
        ];
        const rightChoice = decimalChoices[cycle % decimalChoices.length];
        if (cycle % 2 === 0) {
          const ratio = normalizeRatioFromFractions(left, rightChoice.frac);
          const common = lcm(left.den, rightChoice.frac.den);
          questions.push(`將 $${integerOrFractionLatex(left)}:${rightChoice.text}$ 化為最簡整數比。`);
          answers.push(
            `先把帶分數與小數化成分數：$${integerOrFractionLatex(left)}=${fractionToLatex(left)}$，$${rightChoice.text}=${fractionToLatex(rightChoice.frac)}$。再同乘分母的最小公倍數 ${common}，化成整數比後約分，可得最簡整數比 $${ratio.a}:${ratio.b}$。`
          );
        } else {
          const value = divFraction(left, rightChoice.frac);
          questions.push(`求 $${integerOrFractionLatex(left)}:${rightChoice.text}$ 的比值。`);
          answers.push(
            `先把小數化成分數：$${rightChoice.text}=${fractionToLatex(rightChoice.frac)}$。比值就是前項除以後項，所以 $${fractionToLatex(left)}\\div ${fractionToLatex(rightChoice.frac)}=${fractionToLatex(value)}$。`
          );
        }
        continue;
      }

      if (variant === 1) {
        const templates = [
          { maleRatio: 7, femaleRatio: 4, mode: 'diff', unit: 17, ask: 'male' },
          { maleRatio: 7, femaleRatio: 4, mode: 'total', unit: 12, ask: 'male' },
          { maleRatio: 5, femaleRatio: 3, mode: 'total', unit: 11, ask: 'female' },
          { maleRatio: 8, femaleRatio: 5, mode: 'diff', unit: 9, ask: 'male' },
          { maleRatio: 6, femaleRatio: 5, mode: 'total', unit: 10, ask: 'male' },
          { maleRatio: 9, femaleRatio: 7, mode: 'diff', unit: 8, ask: 'female' },
          { maleRatio: 4, femaleRatio: 3, mode: 'total', unit: 14, ask: 'female' },
          { maleRatio: 10, femaleRatio: 7, mode: 'diff', unit: 6, ask: 'male' },
          { maleRatio: 11, femaleRatio: 9, mode: 'total', unit: 5, ask: 'male' },
          { maleRatio: 12, femaleRatio: 7, mode: 'diff', unit: 4, ask: 'female' },
        ];
        const pick = templates[cycle % templates.length];
        const male = pick.maleRatio * pick.unit;
        const female = pick.femaleRatio * pick.unit;
        if (pick.mode === 'diff') {
          const diff = male - female;
          questions.push(
            `某班男生與女生的人數比為 $${pick.maleRatio}:${pick.femaleRatio}$，已知男生比女生多 ${diff} 人，求男生有多少人。`
          );
          answers.push(
            `因為男生比女生多 $${pick.maleRatio - pick.femaleRatio}$ 份，而這幾份對應 ${diff} 人，所以 1 份是 ${pick.unit} 人。男生有 $${pick.maleRatio}$ 份，因此男生共有 ${male} 人。`
          );
        } else {
          const total = male + female;
          if (pick.ask === 'male') {
            questions.push(
              `某班男生與女生的人數比為 $${pick.maleRatio}:${pick.femaleRatio}$，全班共有 ${total} 人，求男生有多少人。`
            );
            answers.push(
              `總份數是 $${pick.maleRatio + pick.femaleRatio}$ 份，所以 1 份是 ${pick.unit} 人。男生有 $${pick.maleRatio}$ 份，因此男生共有 ${male} 人。`
            );
          } else {
            questions.push(
              `某班男生與女生的人數比為 $${pick.maleRatio}:${pick.femaleRatio}$，全班共有 ${total} 人，求女生有多少人。`
            );
            answers.push(
              `總份數是 $${pick.maleRatio + pick.femaleRatio}$ 份，所以 1 份是 ${pick.unit} 人。女生有 $${pick.femaleRatio}$ 份，因此女生共有 ${female} 人。`
            );
          }
        }
        continue;
      }

      if (variant === 2) {
        if (cycle % 2 === 0) {
          const ratioChoices = [
            { a: 3, b: 2, unit: 100, target: '弟弟' },
            { a: 4, b: 3, unit: 80, target: '哥哥' },
            { a: 5, b: 4, unit: 70, target: '乙' },
            { a: 7, b: 5, unit: 60, target: '弟弟' },
            { a: 8, b: 3, unit: 50, target: '哥哥' },
            { a: 9, b: 7, unit: 40, target: '乙' },
          ];
          const pick = ratioChoices[cycle % ratioChoices.length];
          const total = (pick.a + pick.b) * pick.unit;
          const leftMoney = pick.a * pick.unit;
          const rightMoney = pick.b * pick.unit;
          if (pick.target === '哥哥') {
            questions.push(`哥哥與弟弟共有 ${total} 元，兩人的錢數比為 $${pick.a}:${pick.b}$，求哥哥有多少元。`);
            answers.push(
              `總份數是 $${pick.a + pick.b}$ 份，所以 1 份是 ${pick.unit} 元。哥哥有 $${pick.a}$ 份，因此哥哥有 ${leftMoney} 元。`
            );
          } else if (pick.target === '弟弟') {
            questions.push(`哥哥與弟弟共有 ${total} 元，兩人的錢數比為 $${pick.a}:${pick.b}$，求弟弟有多少元。`);
            answers.push(
              `總份數是 $${pick.a + pick.b}$ 份，所以 1 份是 ${pick.unit} 元。弟弟有 $${pick.b}$ 份，因此弟弟有 ${rightMoney} 元。`
            );
          } else {
            questions.push(`甲、乙兩人共有 ${total} 元，兩人的錢數比為 $${pick.a}:${pick.b}$，求乙有多少元。`);
            answers.push(
              `總份數是 $${pick.a + pick.b}$ 份，所以 1 份是 ${pick.unit} 元。乙有 $${pick.b}$ 份，因此乙有 ${rightMoney} 元。`
            );
          }
        } else {
          const scaleChoices = [
            { scale: 50000, mapCm: 16 },
            { scale: 25000, mapCm: 12 },
            { scale: 200000, mapCm: 3.5 },
            { scale: 100000, mapCm: 7.2 },
            { scale: 40000, mapCm: 9.5 },
            { scale: 80000, mapCm: 6.25 },
          ];
          const pick = scaleChoices[cycle % scaleChoices.length];
          const actualCm = pick.scale * pick.mapCm;
          const actualKm = actualCm / 100000;
          questions.push(
            `在比例尺 $1:${pick.scale}$ 的地圖上，甲、乙兩地距離是 ${pick.mapCm} 公分，求實際距離是多少公里？`
          );
          answers.push(
            `比例尺 $1:${pick.scale}$ 表示地圖上 1 公分代表實際 ${pick.scale} 公分，所以實際距離是 $${pick.mapCm}\\times ${pick.scale}=${actualCm}$ 公分。再換成公里得 ${actualKm} 公里。`
          );
        }
        continue;
      }

      if (variant === 3) {
        const radiusPool = [
          { radiusA: 2, radiusB: 5 },
          { radiusA: 3, radiusB: 7 },
          { radiusA: 4, radiusB: 9 },
          { radiusA: 5, radiusB: 8 },
          { radiusA: 6, radiusB: 11 },
          { radiusA: 7, radiusB: 10 },
          { radiusA: 8, radiusB: 13 },
          { radiusA: 9, radiusB: 14 },
        ];
        const pick = radiusPool[cycle % radiusPool.length];
        const radiusA = pick.radiusA;
        const radiusB = pick.radiusB;
        const ratio = normalizeRatioInts(radiusA, radiusB);
        questions.push(`已知兩個圓的半徑比為 $${radiusA}:${radiusB}$，求這兩個圓的周長比。`);
        answers.push(
          `圓周長公式是 $C=2\\pi r$，兩個圓的周長都同乘 $2\\pi$，所以周長比與半徑比相同，仍是 $${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      const ratioTemplates = [
        { m: 2, n: 3 },
        { m: 3, n: 5 },
        { m: 4, n: 6 },
        { m: 5, n: 7 },
        { m: 6, n: 11 },
        { m: 7, n: 9 },
        { m: 8, n: 13 },
        { m: 9, n: 10 },
      ];
      const pick = ratioTemplates[cycle % ratioTemplates.length];
      const m = pick.m;
      const n = pick.n;
      const ratio = normalizeRatioInts(m + n, 2 * n - m);
      questions.push(`若 $(2x-y):${m}=(x+y):${n}$，求 $x:y$ 的最簡整數比。`);
      answers.push(
        `由題意可得 $${n}(2x-y)=${m}(x+y)$。整理得 $${2 * n - m}x=${m + n}y$，所以 $x:y=${m + n}:${2 * n - m}$，最簡整數比為 $${ratio.a}:${ratio.b}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231RegularTwoStepSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const variants = shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

    for (let i = 0; i < count; i += 1) {
      const variant = variants[i % variants.length];
      const cycle = Math.floor(i / variants.length);

      if (variant === 2) {
        const templates = [
          { m: 3, n: 2, p: 2, q: 1, d: 50 },
          { m: 4, n: 3, p: 3, q: 2, d: 40 },
          { m: 5, n: 3, p: 3, q: 1, d: 60 },
          { m: 6, n: 5, p: 5, q: 4, d: 30 },
          { m: 7, n: 4, p: 3, q: 2, d: 56 },
        ];
        const pick = templates[cycle % templates.length];
        const unit = (pick.p * pick.d) / (pick.p * pick.n - pick.q * pick.m);
        const total = (pick.m + pick.n) * unit;
        questions.push(
          `某校上學期男生與女生人數比為 $${pick.m}:${pick.n}$。下學期男生人數不變，女生減少 ${pick.d} 人後，男女生比變為 $${pick.p}:${pick.q}$，求上學期全校共有多少人。`
        );
        answers.push(
          `設上學期男、女生分別為 $${pick.m}k,\ ${pick.n}k$ 人。依題意有 $${pick.m}k:(${pick.n}k-${pick.d})=${pick.p}:${pick.q}$。交叉相乘得 $${pick.q * pick.m}k=${pick.p * pick.n}k-${pick.p * pick.d}$，解得 $k=${unit}$。因此上學期全校共有 $(${pick.m}+${pick.n})\\times ${unit}=${total}$ 人。`
        );
        continue;
      }

      if (variant === 3) {
        const templates = [
          { abLeft: 2, abRight: 5, bcLeft: 3, bcRight: 5, unit: 10 },
          { abLeft: 3, abRight: 4, bcLeft: 2, bcRight: 5, unit: 12 },
          { abLeft: 2, abRight: 3, bcLeft: 4, bcRight: 5, unit: 9 },
          { abLeft: 3, abRight: 5, bcLeft: 2, bcRight: 3, unit: 15 },
          { abLeft: 4, abRight: 7, bcLeft: 3, bcRight: 8, unit: 8 },
        ];
        const pick = templates[cycle % templates.length];
        const aRatio = pick.abRight * pick.bcRight;
        const bRatio = pick.abLeft * pick.bcRight;
        const cRatio = pick.abLeft * pick.bcLeft;
        const aMoney = aRatio * pick.unit;
        const bMoney = bRatio * pick.unit;
        const cMoney = cRatio * pick.unit;
        const total = aMoney + bMoney + cMoney;
        questions.push(
          `甲、乙、丙三人共出資 ${total} 元買禮物。已知甲出的錢的 ${pick.abLeft} 倍等於乙出的錢的 ${pick.abRight} 倍，乙出的錢的 ${pick.bcLeft} 倍等於丙出的錢的 ${pick.bcRight} 倍，求三人各出多少元。`
        );
        answers.push(
          `由題意可得 $甲:乙=${pick.abRight}:${pick.abLeft}$，又 $乙:丙=${pick.bcRight}:${pick.bcLeft}$。合併得 $甲:乙:丙=${aRatio}:${bRatio}:${cRatio}$。總份數是 ${aRatio + bRatio + cRatio} 份，所以 1 份是 ${pick.unit} 元。故甲、乙、丙分別出 ${aMoney} 元、${bMoney} 元、${cMoney} 元。`
        );
        continue;
      }

      if (variant === 4) {
        const geometryTemplates = [
          { total: 72, m: 3, n: 4 },
          { total: 80, m: 4, n: 5 },
          { total: 96, m: 5, n: 7 },
          { total: 84, m: 3, n: 5 },
          { total: 90, m: 4, n: 7 },
        ];
        const pick = geometryTemplates[cycle % geometryTemplates.length];
        const total = pick.total;
        const m = pick.m;
        const n = pick.n;
        const areaRatio = normalizeRatioInts(m * m, n * n);
        questions.push(
          `將一條 ${total} 公分的繩子按 $${m}:${n}$ 的比例剪成兩段後，各圍成一個正方形，求這兩個正方形的面積比。`
        );
        answers.push(
          `因為兩段繩長比是 $${m}:${n}$，而正方形邊長都等於周長除以 4，所以兩正方形的邊長比也仍是 $${m}:${n}$。面積比等於邊長比平方，因此面積比為 $${m}^2:${n}^2=${areaRatio.a}:${areaRatio.b}$。`
        );
        continue;
      }

      if (variant === 5) {
        const templates = [
          { m: 5, n: 6, up1: 8, up2: 5 },
          { m: 4, n: 5, up1: 10, up2: 20 },
          { m: 3, n: 4, up1: 15, up2: 10 },
          { m: 6, n: 7, up1: 12, up2: 6 },
          { m: 7, n: 9, up1: 5, up2: 15 },
        ];
        const pick = templates[cycle % templates.length];
        const ratio = normalizeRatioInts(pick.m * (100 + pick.up1), pick.n * (100 + pick.up2));
        questions.push(
          `甲、乙兩人去年的月薪比為 $${pick.m}:${pick.n}$，今年分別調薪 ${pick.up1}% 與 ${pick.up2}% ，求調薪後兩人的月薪比。`
        );
        answers.push(
          `設去年月薪分別為 $${pick.m}k,\ ${pick.n}k$。調薪後變成 $${pick.m}\\left(1+\\frac{${pick.up1}}{100}\\right)k$ 與 $${pick.n}\\left(1+\\frac{${pick.up2}}{100}\\right)k$，所以新比為 $${pick.m * (100 + pick.up1)}:${pick.n * (100 + pick.up2)}=${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      if (variant === 6) {
        const templates = [
          { m: 5, n: 2, years: 3, sum: 55 },
          { m: 4, n: 1, years: 4, sum: 63 },
          { m: 7, n: 3, years: 2, sum: 64 },
          { m: 6, n: 5, years: 3, sum: 97 },
          { m: 3, n: 2, years: 5, sum: 65 },
        ];
        const pick = templates[cycle % templates.length];
        const unit = (pick.sum - 2 * pick.years) / (pick.m + pick.n);
        const father = pick.m * unit;
        const son = pick.n * unit;
        questions.push(
          `父子兩人現在年齡比為 $${pick.m}:${pick.n}$，已知 ${pick.years} 年後兩人的年齡和為 ${pick.sum} 歲，求父子現在各幾歲。`
        );
        answers.push(
          `設父子現在分別為 $${formatTerm(pick.m, 'k')},\ ${formatTerm(pick.n, 'k')}$ 歲。${pick.years} 年後年齡和為 $(${pick.m}+${pick.n})k+2\\times ${pick.years}=${pick.sum}$，解得 $k=${unit}$。因此父親現在 ${father} 歲，兒子現在 ${son} 歲。`
        );
        continue;
      }

      if (variant === 7) {
        const templates = [
          { a: 6, b: 5, addA: 5, addB: 3, p: 5, q: 4, unit: 5, item: '唱片' },
          { a: 5, b: 4, addA: 6, addB: 2, p: 4, q: 3, unit: 10, item: '郵票' },
          { a: 7, b: 5, addA: 4, addB: 2, p: 3, q: 2, unit: 2, item: '貼紙' },
          { a: 8, b: 7, addA: 9, addB: 2, p: 5, q: 4, unit: 3, item: '明信片' },
          { a: 9, b: 5, addA: 5, addB: 3, p: 7, q: 4, unit: 2, item: '卡片' },
        ];
        const pick = templates[cycle % templates.length];
        const left = pick.a * pick.unit;
        const right = pick.b * pick.unit;
        questions.push(
          `小甲和小乙原有${pick.item}張數比為 $${pick.a}:${pick.b}$，小甲又增加 ${pick.addA} 張，小乙又增加 ${pick.addB} 張後，張數比變為 $${pick.p}:${pick.q}$，求兩人原有的${pick.item}總數。`
        );
        answers.push(
          `設原本共有 $${pick.a}k$ 與 $${pick.b}k$ 張。依題意有 $(${pick.a}k+${pick.addA}):(${pick.b}k+${pick.addB})=${pick.p}:${pick.q}$。交叉相乘後解得 $k=${pick.unit}$，所以原本總數為 $${pick.a}k+${pick.b}k=${left + right}$ 張。`
        );
        continue;
      }

      if (variant === 8) {
        const templates = [
          { firstA: 5, firstB: 4, removeA: 4, secondA: 5, secondB: 3, removeB: 14, black: 74, white: 56 },
          { firstA: 6, firstB: 5, removeA: 6, secondA: 4, secondB: 3, removeB: 12, black: 66, white: 60 },
          { firstA: 7, firstB: 6, removeA: 5, secondA: 3, secondB: 2, removeB: 15, black: 61, white: 54 },
          { firstA: 8, firstB: 7, removeA: 4, secondA: 4, secondB: 3, removeB: 16, black: 84, white: 72 },
          { firstA: 9, firstB: 8, removeA: 7, secondA: 5, secondB: 4, removeB: 18, black: 88, white: 80 },
        ];
        const pick = templates[cycle % templates.length];
        const numerator = pick.firstA * pick.removeB;
        const denominator = pick.secondA * pick.firstB - pick.firstA * pick.secondB;
        const kValue = makeFraction(numerator, denominator);
        const kText = fractionToLatex(kValue);
        questions.push(
          `原本黑羊與白羊若干隻，黑羊減少 ${pick.removeA} 隻後比變為 $${pick.firstA}:${pick.firstB}$；之後白羊再減少 ${pick.removeB} 隻，比變為 $${pick.secondA}:${pick.secondB}$，求原本黑羊、白羊各多少隻。`
        );
        answers.push(
          `設第二次變化後黑羊、白羊分別為 $${pick.secondA}k$、$${pick.secondB}k$。回推到第一次變化後，黑羊不變、白羊多 ${pick.removeB} 隻，所以有 $${pick.secondA}k:(${pick.secondB}k+${pick.removeB})=${pick.firstA}:${pick.firstB}$。解得 $k=${kText}$。因此第一次變化後白羊有 ${pick.white} 隻、黑羊有 ${pick.black - pick.removeA} 隻，再把黑羊補回 ${pick.removeA} 隻，可得原本黑羊 ${pick.black} 隻、白羊 ${pick.white} 隻。`
        );
        continue;
      }

      if (variant === 9) {
        const templates = [
          { a: 3, b: 2, spend: 150, gain: 275, p: 2, q: 3, unit: 200 },
          { a: 5, b: 3, spend: 160, gain: 260, p: 3, q: 4, unit: 140 },
          { a: 4, b: 3, spend: 180, gain: 240, p: 2, q: 3, unit: 165 },
          { a: 7, b: 5, spend: 210, gain: 320, p: 3, q: 4, unit: 160 },
          { a: 6, b: 5, spend: 190, gain: 350, p: 2, q: 3, unit: 180 },
        ];
        const pick = templates[cycle % templates.length];
        const left = pick.a * pick.unit;
        const right = pick.b * pick.unit;
        questions.push(
          `小甲與小乙原有零用錢比為 $${pick.a}:${pick.b}$，小甲花掉 ${pick.spend} 元，小乙意外獲得 ${pick.gain} 元後，比變為 $${pick.p}:${pick.q}$，求兩人原有多少錢。`
        );
        answers.push(
          `設原本兩人分別有 $${pick.a}k$ 元、$${pick.b}k$ 元。依題意有 $(${pick.a}k-${pick.spend}):(${pick.b}k+${pick.gain})=${pick.p}:${pick.q}$。交叉相乘後解得 $k=${pick.unit}$，所以原本分別是 ${left} 元與 ${right} 元。`
        );
        continue;
      }

      if (variant === 10) {
        const templates = [
          { m: 10, f: 9, cutM: makeFraction(1, 5), cutF: makeFraction(1, 6) },
          { m: 7, f: 5, cutM: makeFraction(1, 7), cutF: makeFraction(1, 5) },
          { m: 8, f: 3, cutM: makeFraction(1, 4), cutF: makeFraction(1, 3) },
          { m: 9, f: 7, cutM: makeFraction(1, 6), cutF: makeFraction(1, 7) },
          { m: 6, f: 5, cutM: makeFraction(1, 3), cutF: makeFraction(1, 4) },
        ];
        const pick = templates[cycle % templates.length];
        const remainM = simplifyFraction(pick.m * (pick.cutM.den - pick.cutM.num), pick.cutM.den);
        const remainF = simplifyFraction(pick.f * (pick.cutF.den - pick.cutF.num), pick.cutF.den);
        const ratio = normalizeRatioInts(remainM.num * remainF.den, remainF.num * remainM.den);
        questions.push(
          `某校去年新生男生與女生比為 $${pick.m}:${pick.f}$，今年男生減少 $${fractionToLatex(pick.cutM)}$，女生減少 $${fractionToLatex(pick.cutF)}$，求今年新生的男生與女生比。`
        );
        answers.push(
          `把去年人數設為 $${pick.m}k$ 與 $${pick.f}k$。今年剩下的男生是 $${pick.m}k\\left(1-${fractionToLatex(pick.cutM)}\\right)$，女生是 $${pick.f}k\\left(1-${fractionToLatex(pick.cutF)}\\right)$。整理後比為 $${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      if (variant === 11) {
        const templates = [
          { a: 8, b: 7, leaveA: 3, leaveB: 5, p: 7, q: 6, unit: 17 },
          { a: 9, b: 8, leaveA: 4, leaveB: 6, p: 5, q: 4, unit: 14 },
          { a: 7, b: 6, leaveA: 2, leaveB: 4, p: 4, q: 3, unit: 10 },
          { a: 10, b: 9, leaveA: 5, leaveB: 8, p: 3, q: 2, unit: 18 },
          { a: 11, b: 9, leaveA: 4, leaveB: 7, p: 5, q: 4, unit: 11 },
        ];
        const pick = templates[cycle % templates.length];
        const male = pick.a * pick.unit;
        const female = pick.b * pick.unit;
        questions.push(
          `原本教室男、女生比為 $${pick.a}:${pick.b}$，走掉 ${pick.leaveA} 個男生、${pick.leaveB} 個女生後，比變為 $${pick.p}:${pick.q}$，求原本全班共有多少人。`
        );
        answers.push(
          `設原本男、女生分別為 $${pick.a}k$、$${pick.b}k$。依題意有 $(${pick.a}k-${pick.leaveA}):(${pick.b}k-${pick.leaveB})=${pick.p}:${pick.q}$。交叉相乘後解得 $k=${pick.unit}$，所以原本全班共有 ${male + female} 人。`
        );
        continue;
      }

      const templates = [
        { m: 5, n: 6, up1: 6, up2: 12 },
        { m: 7, n: 8, up1: 9, up2: 15 },
        { m: 4, n: 7, up1: 20, up2: 5 },
        { m: 6, n: 5, up1: 8, up2: 16 },
        { m: 3, n: 5, up1: 25, up2: 10 },
      ];
      const pick = templates[cycle % templates.length];
      const ratio = normalizeRatioInts(pick.m * (100 + pick.up1), pick.n * (100 + pick.up2));
      questions.push(
        `阿雄與小祥去年的月薪比為 $${pick.m}:${pick.n}$，今年分別調薪 ${pick.up1}% 與 ${pick.up2}% ，求調薪後兩人的月薪比。`
      );
      answers.push(
        `設去年月薪分別為 $${pick.m}k,\ ${pick.n}k$。調薪後變成 $${pick.m}\\left(1+\\frac{${pick.up1}}{100}\\right)k$ 與 $${pick.n}\\left(1+\\frac{${pick.up2}}{100}\\right)k$，所以新比為 $${pick.m * (100 + pick.up1)}:${pick.n * (100 + pick.up2)}=${ratio.a}:${ratio.b}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231ConcentrationReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function formatPercentLatexLocal(value) {
      const frac =
        typeof value === 'number'
          ? makeFraction(Math.round(value * 1000000), 1000000)
          : makeFraction(value.num, value.den);
      return frac.den === 1 ? `${frac.num}` : fractionToLatex(frac);
    }

    function formatAmountLatexLocal(value) {
      const frac =
        typeof value === 'number'
          ? makeFraction(Math.round(value * 1000000), 1000000)
          : makeFraction(value.num, value.den);
      return frac.den === 1 ? `${frac.num}` : fractionToLatex(frac);
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 6;
      const cycle = Math.floor(i / 6);

      if (variant === 0) {
        const templates = [
          { a: 3, b: 1, c: 1, d: 1 },
          { a: 4, b: 1, c: 3, d: 2 },
          { a: 5, b: 2, c: 1, d: 1 },
          { a: 7, b: 3, c: 4, d: 1 },
          { a: 2, b: 1, c: 5, d: 3 },
        ];
        const pick = templates[cycle % templates.length];
        const s1 = makeFraction(pick.b, pick.a + pick.b);
        const s2 = makeFraction(pick.d, pick.c + pick.d);
        const avg = divFraction(addFraction(s1, s2), makeFraction(2, 1));
        questions.push(
          `兩罐相同重量的酒精溶液中，甲罐水與酒精比為 $${pick.a}:${pick.b}$，乙罐水與酒精比為 $${pick.c}:${pick.d}$。若兩罐全部混合，求混合後的酒精重量百分濃度。`
        );
        answers.push(
          formatJ231Answer(
            `$${formatPercentLatexLocal(simplifyFraction(avg.num * 100, avg.den))}\\%$`,
            `設兩罐各重 $w$ 克，則酒精分別為 $${fractionToLatex(s1)}w$ 與 $${fractionToLatex(s2)}w$。混合後酒精共重 $\\left(${fractionToLatex(s1)}+${fractionToLatex(s2)}\\right)w$，總重量是 $2w$，所以濃度為 $${fractionToLatex(avg)}=${formatPercentLatexLocal(simplifyFraction(avg.num * 100, avg.den))}\\%$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { total: 300, start: 10, target: 6 },
          { total: 360, start: 12, target: 8 },
          { total: 420, start: 15, target: 9 },
          { total: 400, start: 14, target: 7 },
          { total: 280, start: 9, target: 6 },
        ];
        const pick = templates[cycle % templates.length];
        const total = pick.total;
        const start = pick.start;
        const target = pick.target;
        const solute = simplifyFraction(total * start, 100);
        const finalWeight = divFraction(mulFraction(solute, makeFraction(100, 1)), makeFraction(target, 1));
        const water = subFraction(finalWeight, makeFraction(total, 1));
        questions.push(
          `有一杯 $${total}$ 公克、濃度 $${start}%$ 的食鹽水，若要把濃度稀釋成 $${target}%$ ，需要再加入多少公克的水？`
        );
        answers.push(
          formatJ231Answer(
            `${formatAmountLatexLocal(water)} 公克`,
            `原來食鹽量不變，為 $${total}\\times ${start}\\%=${formatAmountLatexLocal(solute)}$ 公克。設加水後總重量為 $x$ 公克，則有 $${target}\\%\\times x=${formatAmountLatexLocal(solute)}$，解得 $x=${formatAmountLatexLocal(finalWeight)}$。所以要再加 $${formatAmountLatexLocal(water)}$ 公克的水。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const templates = [
          { total: 240, start: 8, target: 20 },
          { total: 300, start: 10, target: 25 },
          { total: 360, start: 12, target: 30 },
          { total: 420, start: 10, target: 28 },
          { total: 280, start: 12, target: 24 },
        ];
        const pick = templates[cycle % templates.length];
        const total = pick.total;
        const start = pick.start;
        const target = pick.target;
        const startSolute = simplifyFraction(total * start, 100);
        const targetSoluteBeforeAdd = simplifyFraction(target * total, 100);
        const numerator = subFraction(targetSoluteBeforeAdd, startSolute);
        const denominator = subFraction(makeFraction(1, 1), makeFraction(target, 100));
        const add = divFraction(numerator, denominator);
        questions.push(
          `有一杯 ${total} 公克、濃度 ${start}% 的食鹽水，若想把濃度提高到 ${target}% ，需要再加入多少公克的食鹽？`
        );
        answers.push(
          formatJ231Answer(
            `${formatAmountLatexLocal(add)} 公克`,
            `原本食鹽重 $${total}\\times ${start}\\%=${formatAmountLatexLocal(startSolute)}$ 公克。設加入食鹽 $x$ 公克後，總重量變成 $${total}+x$，食鹽重變成 $${formatAmountLatexLocal(startSolute)}+x$。依題意有 $\\dfrac{${formatAmountLatexLocal(startSolute)}+x}{${total}+x}=${target}\\%$，解得 $x=${formatAmountLatexLocal(add)}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const templates = [
          { powder: 10, total: 360 },
          { powder: 12, total: 450 },
          { powder: 15, total: 540 },
          { powder: 8, total: 320 },
          { powder: 14, total: 600 },
        ];
        const pick = templates[cycle % templates.length];
        const powder = pick.powder;
        const water = powder * 9;
        const total = pick.total;
        const needPowder = total / 10;
        questions.push(
          `小明用 ${powder} 克咖啡粉加 ${water} 克水泡成咖啡。若想沖泡 ${total} 克相同濃度的咖啡，需要多少克咖啡粉？`
        );
        answers.push(
          formatJ231Answer(
            `${needPowder} 克`,
            `原來咖啡粉與總重量的比是 $${powder}:${powder + water}=1:10$，所以新的一杯若總重量是 ${total} 克，咖啡粉應為 $\\frac{1}{10}\\times ${total}=${needPowder}$ 克。`
          )
        );
        continue;
      }

      if (variant === 4) {
        const ratioTemplates = [
          { waterRatio: 1, waterRatioB: 2, saltRatio: 2, saltRatioB: 4 },
          { waterRatio: 2, waterRatioB: 4, saltRatio: 3, saltRatioB: 5 },
          { waterRatio: 3, waterRatioB: 5, saltRatio: 4, saltRatioB: 6 },
          { waterRatio: 2, waterRatioB: 3, saltRatio: 1, saltRatioB: 2 },
          { waterRatio: 4, waterRatioB: 7, saltRatio: 3, saltRatioB: 5 },
        ];
        const ratioPick = ratioTemplates[cycle % ratioTemplates.length];
        const waterRatio = ratioPick.waterRatio;
        const waterRatioB = ratioPick.waterRatioB;
        const saltRatio = ratioPick.saltRatio;
        const saltRatioB = ratioPick.saltRatioB;
        const concA = makeFraction(saltRatio, saltRatio + waterRatio);
        const concB = makeFraction(saltRatioB, saltRatioB + waterRatioB);
        questions.push(
          `甲、乙兩杯食鹽水中，水量比為 $${waterRatio}:${waterRatioB}$，含鹽量比為 $${saltRatio}:${saltRatioB}$，求兩杯食鹽水各自的重量百分濃度。`
        );
        answers.push(
          formatJ231Answer(
            `甲 $${fractionToLatex(concA)}$、乙 $${fractionToLatex(concB)}$`,
            `濃度就是 $\\dfrac{鹽}{鹽+水}$。所以甲杯濃度為 $\\dfrac{${saltRatio}}{${saltRatio}+${waterRatio}}=${fractionToLatex(concA)}$，乙杯濃度為 $\\dfrac{${saltRatioB}}{${saltRatioB}+${waterRatioB}}=${fractionToLatex(concB)}$。`
          )
        );
        continue;
      }

      const passTemplates = [
        { a: 2, b: 3, pa: 40, pb: 30 },
        { a: 3, b: 4, pa: 50, pb: 20 },
        { a: 4, b: 5, pa: 60, pb: 40 },
        { a: 5, b: 6, pa: 70, pb: 45 },
        { a: 3, b: 5, pa: 80, pb: 50 },
      ];
      const passPick = passTemplates[cycle % passTemplates.length];
      const a = passPick.a;
      const b = passPick.b;
      const pa = passPick.pa;
      const pb = passPick.pb;
      const combined = simplifyFraction(a * pa + b * pb, a + b);
      questions.push(
        `已知 A、B 兩班人數比為 $${a}:${b}$，A 班及格率 ${pa}% ，B 班及格率 ${pb}% ，求合併後的總及格率。`
      );
      answers.push(
        formatJ231Answer(
          `${formatPercentLatexLocal(combined)}\\%`,
          `把兩班人數設為 $${a}k$ 與 $${b}k$。則及格人數分別為 $${a}k\\times ${pa}\\%$ 與 $${b}k\\times ${pb}\\%$。所以總及格率為 $\\dfrac{${a}\\times ${pa}+${b}\\times ${pb}}{${a + b}}\\%=${formatPercentLatexLocal(combined)}\\%$。`
        )
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231AdvancedThreeStepSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const templates = [
          { girlsRemoved: 3, boysRemoved: 2, t: 6 },
          { girlsRemoved: 4, boysRemoved: 3, t: 8 },
          { girlsRemoved: 5, boysRemoved: 4, t: 10 },
          { girlsRemoved: 6, boysRemoved: 5, t: 12 },
          { girlsRemoved: 7, boysRemoved: 3, t: 14 },
          { girlsRemoved: 8, boysRemoved: 6, t: 16 },
          { girlsRemoved: 9, boysRemoved: 4, t: 18 },
          { girlsRemoved: 10, boysRemoved: 7, t: 20 },
          { girlsRemoved: 11, boysRemoved: 5, t: 22 },
          { girlsRemoved: 12, boysRemoved: 8, t: 24 },
        ];
        const pick = templates[cycle % templates.length];
        const girlsRemoved = pick.girlsRemoved;
        const boysRemoved = pick.boysRemoved;
        const t = pick.t;
        const finalBoys = 4 * t;
        const finalGirls = 3 * t;
        const afterFirstGirls = finalGirls + girlsRemoved;
        const originalBoys = finalBoys + boysRemoved;
        questions.push(
          `原本教室內男、女生若干人，先走掉 ${boysRemoved} 個男生，剩下的男、女生比為 $8:7$；之後又走掉 ${girlsRemoved} 個女生，最後比變為 $4:3$，求原本各有多少人。`
        );
        answers.push(
          formatJ231Answer(
            `男生 ${originalBoys} 人、女生 ${afterFirstGirls} 人`,
            `設第二次變化後男、女生為 $4k,\ 3k$。因為再往前回推時只多出 ${girlsRemoved} 個女生，所以有 $4k:(3k+${girlsRemoved})=8:7$。解得 $k=${t}$。因此第一次變化後男、女生分別為 ${finalBoys} 人、${afterFirstGirls} 人，再把先離開的 ${boysRemoved} 個男生補回去，可得原本男生 ${originalBoys} 人、女生 ${afterFirstGirls} 人。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const a = [20, 24, 30, 36, 40, 48, 60, 72, 80, 100][cycle % 10];
        const total = 45 * a;
        const remain = 36 * a;
        questions.push(
          `某校原有學生 ${total} 人，男、女生比為 $5:4$。若男、女生按 $4:5$ 的比例減少（即男生減少 $4a$ 人、女生減少 $5a$ 人），剩餘學生的男、女生比變為 $7:5$，求剩餘學生共有多少人。`
        );
        answers.push(
          formatJ231Answer(
            `${remain} 人`,
            `設原本男、女生分別為 $5k,\ 4k$ 人。依題意，減少後變成 $(5k-4a):(4k-5a)=7:5$。交叉相乘得 $25k-20a=28k-35a$，所以 $15a=3k$，即 $k=5a$。因此原本總數是 $9k=45a=${total}$，剩餘學生數是 $(5k-4a)+(4k-5a)=9k-9a=36a=${remain}$。`
          )
        );
        continue;
      }

      const templates = [
        { total: 300, start: 10, target: 6 },
        { total: 240, start: 12, target: 8 },
        { total: 360, start: 15, target: 10 },
        { total: 420, start: 8, target: 5 },
        { total: 280, start: 9, target: 6 },
        { total: 400, start: 14, target: 7 },
        { total: 540, start: 10, target: 5 },
        { total: 320, start: 12, target: 6 },
        { total: 450, start: 16, target: 8 },
        { total: 600, start: 15, target: 9 },
      ];
      const pick = templates[cycle % templates.length];
      const solute = simplifyFraction(pick.total * pick.start, 100);
      const finalWeight = divFraction(mulFraction(solute, makeFraction(100, 1)), makeFraction(pick.target, 1));
      const addWater = subFraction(finalWeight, makeFraction(pick.total, 1));
      questions.push(
        `一杯 ${pick.total} 公克的食鹽水濃度為 ${pick.start}% ，若想將濃度降至 ${pick.target}% ，需要再加入多少公克的水？`
      );
      answers.push(
        formatJ231Answer(
          `$${fractionToLatex(addWater)}$ 公克`,
          `原來的食鹽量不變，都是 $${pick.total}\\times ${pick.start}\\%=${fractionToLatex(solute)}$ 公克。設加水後總重量為 $x$ 公克，則有 $${pick.target}\\%\\times x=${fractionToLatex(solute)}$，所以 $x=${fractionToLatex(finalWeight)}$。因此需要再加 $${fractionToLatex(finalWeight)}-${pick.total}=${fractionToLatex(addWater)}$ 公克的水。`
        )
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231KMethodSet(count) {
    const xTerm = (coef) => formatCoeffTerm(coef, 'x', 1);
    const yTerm = (coef) => formatCoeffTerm(coef, 'y', 1);
    const kTerm = (coef) => {
      if (coef === 0) return '0';
      if (coef === 1) return 'k';
      if (coef === -1) return '-k';
      return `${coef}k`;
    };
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const m = randInt(2, 6);
        const n = randInt(2, 6);
        const k = randInt(2, 8);
        const x = m * k;
        const y = n * k;
        const a = randInt(1, 4);
        const b = randInt(1, 4);
        const total = a * x + b * y;
        questions.push(
          `已知 $x:y=${m}:${n}$，且 $${formatLinearCombination([
            { coef: a, variable: 'x' },
            { coef: b, variable: 'y' },
          ])}=${total}$，求 $x,y$。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$x=${x}$，$y=${y}$`,
          `設 $x=${kTerm(m)},\\ y=${kTerm(n)}$。代入 $${formatLinearCombination([
            { coef: a, variable: 'x' },
            { coef: b, variable: 'y' },
          ])}=${total}$，得 $${kTerm(a * m)}+${kTerm(b * n)}=${total}$，所以 $k=${k}$。因此 $x=${x},\\ y=${y}$。`
        );
        continue;
      }

      if (variant === 1) {
        const m = randInt(2, 6);
        let n = -randInt(2, 5);
        while (Math.abs(m) === Math.abs(n)) n = -randInt(2, 5);
        const ratio = normalizeRatioInts(m + n, m - n);
        questions.push(`已知 $(a+b):(a-b)=${m}:${n}$，求 $a:b$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${ratio.a}:${ratio.b}$`,
          `設 $a+b=${kTerm(m)},\\ a-b=${kTerm(n)}$。兩式相加得 $2a=${kTerm(m + n)}$，相減得 $2b=${kTerm(m - n)}$，所以 $a:b=${m + n}:${m - n}=${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      if (variant === 2) {
        const m = randInt(2, 5);
        const n = randInt(1, 4);
        const ratio = normalizeRatioInts(m * m - n * n, m * m + n * n);
        questions.push(`已知 $x:y=${m}:${n}$，求 $(x^2-y^2):(x^2+y^2)$。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${ratio.a}:${ratio.b}$`,
          `設 $x=${kTerm(m)},\\ y=${kTerm(n)}$。則 $(x^2-y^2):(x^2+y^2)=(${m}^2k^2-${n}^2k^2):(${m}^2k^2+${n}^2k^2)=(${m * m - n * n}):(${m * m + n * n})=${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      if (variant === 3) {
        const templates = [
          { m: 5, n: 4, a: 2, b: 5 },
          { m: 4, n: 3, a: 3, b: 4 },
          { m: 7, n: 5, a: 2, b: 3 },
          { m: 3, n: 2, a: 5, b: 4 },
          { m: 6, n: 5, a: 4, b: 3 },
          { m: 5, n: 2, a: 1, b: 2 },
        ];
        const pick = templates[cycle % templates.length];
        const m = pick.m;
        const n = pick.n;
        const a = pick.a;
        const b = pick.b;
        const k = randInt(1, 6);
        const x = m * k;
        const y = n * k;
        const rhs = a * x - b * y;
        questions.push(
          `已知 $x:y=${m}:${n}$，且 $${formatLinearCombination([
            { coef: a, variable: 'x' },
            { coef: -b, variable: 'y' },
          ])}=${rhs}$，求 $x,y$。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$x=${x}$，$y=${y}$`,
          `設 $x=${kTerm(m)},\\ y=${kTerm(n)}$。代入 $${formatLinearCombination([
            { coef: a, variable: 'x' },
            { coef: -b, variable: 'y' },
          ])}=${rhs}$ 得 $${kTerm(a * m)}-${kTerm(b * n)}=${rhs}$，所以 $${kTerm(a * m - b * n)}=${rhs}$，解得 $k=${k}$。因此 $x=${x},\\ y=${y}$。`
        );
        continue;
      }

      const baseTemplates = [
        { m: 4, n: 1 },
        { m: 5, n: 3 },
        { m: 7, n: 1 },
        { m: 3, n: 1 },
        { m: 8, n: 2 },
        { m: 6, n: 2 },
      ];
      const basePick = baseTemplates[cycle % baseTemplates.length];
      const m = basePick.m;
      const n = basePick.n;
      const ratio = normalizeRatioInts(3 * m - n, m + 3 * n);
      questions.push(`已知 $(x+y):(x-y)=${m}:${n}$，求 $(x+2y):(2x-y)$。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${ratio.a}:${ratio.b}$`,
        `設 $x+y=${kTerm(m)},\\ x-y=${kTerm(n)}$。兩式相加得 $2x=${kTerm(m + n)}$，所以 $x=${formatFractionVariable(m + n, 2, 'k')}$；相減得 $2y=${kTerm(m - n)}$，所以 $y=${formatFractionVariable(m - n, 2, 'k')}$。因此 $(x+2y):(2x-y)=\\left(${formatFractionVariable(m + n, 2, 'k')}+2\\times${formatFractionVariable(m - n, 2, 'k')}\\right):\\left(2\\times${formatFractionVariable(m + n, 2, 'k')}-${formatFractionVariable(m - n, 2, 'k')}\\right)=${3 * m - n}:${m + 3 * n}=${ratio.a}:${ratio.b}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ232BasicDirectInverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const variants = shuffle([0, 1, 2, 3, 4, 5]);
    const niceFractions = [
      makeFraction(1, 2),
      makeFraction(2, 3),
      makeFraction(3, 4),
      makeFraction(5, 4),
      makeFraction(3, 2),
      makeFraction(5, 3),
    ];

    for (let i = 0; i < count; i += 1) {
      const variant = variants[i % variants.length];
      const cycle = Math.floor(i / variants.length);

      if (variant === 0) {
        const x0 = 2 + ((cycle * 2 + 1) % 5);
        const k = niceFractions[(cycle * 3 + 1) % niceFractions.length];
        const y0 = mulFraction(makeFraction(x0, 1), k);
        questions.push(`若 $y$ 與 $x$ 成正比，且當 $x=${x0}$ 時 $y=${fractionToLatex(y0)}$，求關係式。`);
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(k)}x$`,
            `因為正比可寫成 $y=kx$。由 $x=${x0},\\ y=${fractionToLatex(y0)}$ 得 $k=\\dfrac{${fractionToLatex(y0)}}{${x0}}=${fractionToLatex(k)}$，所以關係式為 $y=${fractionToLatex(k)}x$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const x0 = 2 + ((cycle * 3 + 2) % 5);
        const k = [12, 18, 20, 24, 30][cycle % 5];
        const y0 = divFraction(makeFraction(k, 1), makeFraction(x0, 1));
        questions.push(`若 $y$ 與 $x$ 成反比，且當 $x=${x0}$ 時 $y=${fractionToLatex(y0)}$，求關係式。`);
        answers.push(
          formatJ232Answer(
            `$xy=${k}$`,
            `因為反比可寫成 $xy=k$。由 $x=${x0},\\ y=${fractionToLatex(y0)}$ 得 $k=${x0}\\times ${fractionToLatex(y0)}=${k}$，所以關係式為 $xy=${k}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const x0 = 2 + ((cycle * 2) % 4);
        const x1 = 6 + ((cycle * 3 + 1) % 5);
        const k = niceFractions[(cycle * 5 + 2) % niceFractions.length];
        const y0 = mulFraction(makeFraction(x0, 1), k);
        const y1 = mulFraction(makeFraction(x1, 1), k);
        questions.push(
          `已知 $x$ 與 $y$ 成正比，當 $x=${x0}$ 時 $y=${fractionToLatex(y0)}$，求 $x=${x1}$ 時的 $y$ 值。`
        );
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(y1)}$`,
            `先由 $x=${x0},\\ y=${fractionToLatex(y0)}$ 求得比例常數 $k=${fractionToLatex(k)}$，所以關係式為 $y=${fractionToLatex(k)}x$。當 $x=${x1}$ 時，$y=${fractionToLatex(k)}\\times ${x1}=${fractionToLatex(y1)}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const x0 = 2 + ((cycle * 4 + 1) % 5);
        const k = [12, 18, 20, 24, 30][(cycle * 2 + 1) % 5];
        const y0 = divFraction(makeFraction(k, 1), makeFraction(x0, 1));
        const y1Options = [makeFraction(1, 2), makeFraction(3, 4), makeFraction(5, 3), makeFraction(5, 2)];
        const y1 = y1Options[cycle % y1Options.length];
        const x1 = divFraction(makeFraction(k, 1), y1);
        questions.push(
          `已知 $x$ 與 $y$ 成反比，當 $x=${x0}$ 時 $y=${fractionToLatex(y0)}$，求 $y=${fractionToLatex(y1)}$ 時的 $x$ 值。`
        );
        answers.push(
          formatJ232Answer(
            `$x=${fractionToLatex(x1)}$`,
            `先由 $x=${x0},\\ y=${fractionToLatex(y0)}$ 求得反比常數 $k=${k}$，所以關係式是 $xy=${k}$。當 $y=${fractionToLatex(y1)}$ 時，$x=\\dfrac{${k}}{${fractionToLatex(y1)}}=${fractionToLatex(x1)}$。`
          )
        );
        continue;
      }

      if (variant === 4) {
        const templates = [
          { x0: makeFraction(3, 4), y0: makeFraction(9, 8), x1: -2 },
          { x0: makeFraction(2, 3), y0: makeFraction(5, 6), x1: -3 },
          { x0: makeFraction(5, 4), y0: makeFraction(15, 8), x1: -4 },
          { x0: makeFraction(4, 5), y0: makeFraction(6, 5), x1: -5 },
          { x0: makeFraction(5, 6), y0: makeFraction(25, 18), x1: -6 },
        ];
        const pick = templates[cycle % templates.length];
        const x0 = pick.x0;
        const y0 = pick.y0;
        const x1 = pick.x1;
        const k = divFraction(y0, x0);
        const y1 = mulFraction(makeFraction(x1, 1), k);
        questions.push(
          `已知 $x$ 與 $y$ 成正比，當 $x=${fractionToLatex(x0)}$ 時 $y=${fractionToLatex(y0)}$，求 $x=${x1}$ 時的 $y$ 值。`
        );
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(y1)}$`,
            `由正比關係可設 $y=kx$。先求 $k=\\dfrac{${fractionToLatex(y0)}}{${fractionToLatex(x0)}}=${fractionToLatex(k)}$，所以 $y=${fractionToLatex(k)}x$。當 $x=${x1}$ 時，$y=${fractionToLatex(k)}\\times(${x1})=${fractionToLatex(y1)}$。`
          )
        );
        continue;
      }

      const templates = [
        { x0: makeFraction(14, 3), y0: negateFraction(makeFraction(6, 7)), y1: makeFraction(1, 2) },
        { x0: makeFraction(10, 3), y0: negateFraction(makeFraction(9, 5)), y1: makeFraction(3, 4) },
        { x0: makeFraction(15, 4), y0: negateFraction(makeFraction(8, 5)), y1: makeFraction(2, 3) },
        { x0: makeFraction(9, 2), y0: negateFraction(makeFraction(4, 3)), y1: makeFraction(5, 6) },
        { x0: makeFraction(8, 3), y0: negateFraction(makeFraction(15, 4)), y1: makeFraction(5, 4) },
      ];
      const pick = templates[cycle % templates.length];
      const x0 = pick.x0;
      const y0 = pick.y0;
      const y1 = pick.y1;
      const k = mulFraction(x0, y0);
      const x1 = divFraction(k, y1);
      questions.push(
        `已知 $x$ 與 $y$ 成反比，當 $x=${fractionToLatex(x0)}$ 時 $y=${fractionToLatex(y0)}$，求 $y=${fractionToLatex(y1)}$ 時的 $x$ 值。`
      );
      answers.push(
        formatJ232Answer(
          `$x=${fractionToLatex(x1)}$`,
          `由反比關係可設 $xy=k$。先求 $k=${fractionToLatex(x0)}\\times ${fractionToLatex(y0)}=${fractionToLatex(k)}$。當 $y=${fractionToLatex(y1)}$ 時，$x=\\dfrac{${fractionToLatex(k)}}{${fractionToLatex(y1)}}=${fractionToLatex(x1)}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ232ShiftedVariationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const shift = randInt(1, 4);
        const x0 = randInt(2, 6);
        const k = randInt(2, 5);
        const y0 = k * (x0 + shift);
        questions.push(`若 $y$ 與 $(x+${shift})$ 成正比，且當 $x=${x0}$ 時 $y=${y0}$，求 $x$ 與 $y$ 的關係式。`);
        answers.push(
          formatJ232Answer(
            `$y=${k}(x+${shift})$`,
            `因為 $y$ 與 $(x+${shift})$ 成正比，所以可設 $y=k(x+${shift})$。把 $x=${x0},\\ y=${y0}$ 代入，得 $${y0}=k(${x0}+${shift})$，解得 $k=${k}$。因此關係式為 $y=${k}(x+${shift})$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const shift = randInt(1, 4);
        const x0 = randInt(shift + 2, shift + 6);
        const y0 = randInt(2, 8);
        const k = y0 * (x0 - shift);
        const x1 = x0 + randInt(2, 5);
        const y1 = simplifyFraction(k, x1 - shift);
        questions.push(`若 $y$ 與 $(x-${shift})$ 成反比，且當 $x=${x0}$ 時 $y=${y0}$，求 $x=${x1}$ 時的 $y$ 值。`);
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(y1)}$`,
            `因為 $y$ 與 $(x-${shift})$ 成反比，所以 $(x-${shift})y=k$。由 $x=${x0},\\ y=${y0}$ 得 $k=(${x0}-${shift})\\times ${y0}=${k}$。當 $x=${x1}$ 時，$y=\\dfrac{${k}}{${x1}-${shift}}=${fractionToLatex(y1)}$。`
          )
        );
        continue;
      }

      const shift = randInt(1, 4);
      const x0 = randInt(shift + 1, shift + 5);
      const y0 = randInt(3, 12);
      const k = simplifyFraction(y0, x0 - shift);
      const x1 = randInt(shift + 6, shift + 10);
      const y1 = mulFraction(k, makeFraction(x1 - shift, 1));
      questions.push(`若 $y$ 與 $(x-${shift})$ 成正比，且當 $x=${x0}$ 時 $y=${y0}$，求 $x=${x1}$ 時的 $y$ 值。`);
      answers.push(
        formatJ232Answer(
          `$y=${fractionToLatex(y1)}$`,
          `因為 $y$ 與 $(x-${shift})$ 成正比，所以可設 $y=k(x-${shift})$。由 $x=${x0},\\ y=${y0}$ 得 $k=\\dfrac{${y0}}{${x0}-${shift}}=${fractionToLatex(k)}$。因此當 $x=${x1}$ 時，$y=${fractionToLatex(k)}\\times (${x1}-${shift})=${fractionToLatex(y1)}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ232RootReciprocalVariationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const x0 = [4, 9, 16, 25][randInt(0, 3)];
        const root0 = Math.sqrt(x0);
        const k = randInt(2, 5);
        const y0 = k * root0;
        const x1 = [36, 49, 64][randInt(0, 2)];
        const y1 = k * Math.sqrt(x1);
        questions.push(`若 $y$ 與 $\\sqrt{x}$ 成正比，且當 $x=${x0}$ 時 $y=${y0}$，求 $x=${x1}$ 時的 $y$ 值。`);
        answers.push(
          formatJ232Answer(
            `$y=${y1}$`,
            `因為 $y$ 與 $\\sqrt{x}$ 成正比，所以可設 $y=k\\sqrt{x}$。由 $x=${x0},\\ y=${y0}$ 得 $${y0}=k\\sqrt{${x0}}=${root0}k$，所以 $k=${k}$。當 $x=${x1}$ 時，$y=${k}\\sqrt{${x1}}=${y1}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const x0 = [4, 9, 16, 25][randInt(0, 3)];
        const root0 = Math.sqrt(x0);
        const y0 = randInt(2, 8);
        const k = y0 * root0;
        const x1 = [36, 49, 64][randInt(0, 2)];
        const y1 = simplifyFraction(k, Math.sqrt(x1));
        questions.push(`若 $y$ 與 $\\sqrt{x}$ 成反比，且當 $x=${x0}$ 時 $y=${y0}$，求 $x=${x1}$ 時的 $y$ 值。`);
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(y1)}$`,
            `因為 $y$ 與 $\\sqrt{x}$ 成反比，所以可設 $y\\sqrt{x}=k$。由 $x=${x0},\\ y=${y0}$ 得 $k=${y0}\\sqrt{${x0}}=${k}$。當 $x=${x1}$ 時，$y=\\dfrac{${k}}{\\sqrt{${x1}}}=${fractionToLatex(y1)}$。`
          )
        );
        continue;
      }

      const x0 = randInt(1, 4);
      const y0 = randInt(2, 9);
      const k = y0 * x0 * x0;
      const x1 = randInt(5, 8);
      const y1 = simplifyFraction(k, x1 * x1);
      questions.push(`若 $y$ 與 $x^2$ 成反比，且當 $x=${x0}$ 時 $y=${y0}$，求 $x=${x1}$ 時的 $y$ 值。`);
      answers.push(
        formatJ232Answer(
          `$y=${fractionToLatex(y1)}$`,
          `因為 $y$ 與 $x^2$ 成反比，所以可設 $x^2y=k$。由 $x=${x0},\\ y=${y0}$ 得 $k=${x0}^2\\times ${y0}=${k}$。當 $x=${x1}$ 時，$y=\\dfrac{${k}}{${x1}^2}=${fractionToLatex(y1)}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ232LinearComboProportionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const variants = shuffle([0, 1, 2, 3, 4]);

    for (let i = 0; i < count; i += 1) {
      const variant = variants[i % variants.length];
      const cycle = Math.floor(i / variants.length);

      if (variant === 0) {
        let x0 = 1;
        let y0 = 1;
        let x1 = 1;
        let k = makeFraction(1, 1);
        let a = 2;
        let b = 9;
        let c = 5;
        let d = -2;
        let y1 = makeFraction(1, 1);
        for (let t = 0; t < 100; t += 1) {
          a = [2, 3][randInt(0, 1)];
          c = [4, 5, 6][randInt(0, 2)];
          b = [3, 5, 7, 9][randInt(0, 3)];
          d = [-4, -3, -2, 1][randInt(0, 3)];
          x0 = randInt(1, 4);
          y0 = randInt(1, 5);
          x1 = randInt(5, 8);
          const left0 = a * y0 + b;
          const right0 = c * x0 + d;
          if (right0 === 0) continue;
          k = simplifyFraction(left0, right0);
          if (Math.abs(k.num) > 5 * k.den) continue;
          const left1 = mulFraction(k, makeFraction(c * x1 + d, 1));
          const candidate = subFraction(left1, makeFraction(b, 1));
          if (candidate.den === 1 && candidate.num % a === 0) {
            y1 = makeFraction(candidate.num / a, 1);
            if (Math.abs(y1.num) <= 30) break;
          }
        }
        questions.push(
          `已知 $( ${formatTerm(a, 'y')}${b >= 0 ? '+' : ''}${b} )$ 與 $( ${formatTerm(c, 'x')}${d >= 0 ? '+' : ''}${d} )$ 成正比，且當 $x=${x0}$ 時 $y=${y0}$。求比例關係式，並求當 $x=${x1}$ 時的 $y$ 值。`
        );
        answers.push(
          formatJ232Answer(
            `$${formatTerm(a, 'y')}${b >= 0 ? '+' : ''}${b}=${fractionToLatex(k)}(${formatTerm(c, 'x')}${d >= 0 ? '+' : ''}${d})$，$y=${fractionToLatex(y1)}$`,
            `成正比可寫成 $${formatTerm(a, 'y')}${b >= 0 ? '+' : ''}${b}=k(${formatTerm(c, 'x')}${d >= 0 ? '+' : ''}${d})$。由 $x=${x0},\\ y=${y0}$ 得 $k=\\dfrac{${a * y0 + b}}{${c * x0 + d}}=${fractionToLatex(k)}$。所以關係式為 $${formatTerm(a, 'y')}${b >= 0 ? '+' : ''}${b}=${fractionToLatex(k)}(${formatTerm(c, 'x')}${d >= 0 ? '+' : ''}${d})$。當 $x=${x1}$ 時，解得 $y=${fractionToLatex(y1)}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { a: 2, b0: 3, b1: 12 },
          { a: 5, b0: 2, b1: 10 },
          { a: 4, b0: 5, b1: 15 },
          { a: 6, b0: 4, b1: 12 },
          { a: 3, b0: 6, b1: 18 },
          { a: 7, b0: 5, b1: 20 },
        ];
        const pick = templates[cycle % templates.length];
        const a = pick.a;
        const b0 = pick.b0;
        const b1 = pick.b1;
        const left = 3 * a + 7 * b0;
        const right = 3 * a + 13 * b0;
        const k = simplifyFraction(left, right);
        const newA = (a * b1) / b0;
        questions.push(
          `已知 $(3a+7b)$ 與 $(3a+13b)$ 成正比，當 $a=${a},\\ b=${b0}$ 時比例成立。若 $b=${b1}$，求 $a$。`
        );
        answers.push(
          formatJ232Answer(
            `$a=${newA}$`,
            `因為成正比，所以 $\\dfrac{3a+7b}{3a+13b}$ 為定值。由 $a=${a},\\ b=${b0}$ 可得此定值為 $\\dfrac{${left}}{${right}}=${fractionToLatex(k)}$。所以當 $b=${b1}$ 時，有 $\\dfrac{3a+${7 * b1}}{3a+${13 * b1}}=${fractionToLatex(k)}$，解得 $a=${newA}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const yShift = 2 + (cycle % 3);
        const xShift = 1 + ((cycle * 2 + 1) % 4);
        const x0 = 4 + ((cycle * 3 + 1) % 5);
        const y0 = 2 + ((cycle * 2) % 4);
        const x1Options = [1, 2, 4, 5, 7, 8];
        const x1 = x1Options[(cycle * 3 + 2) % x1Options.length];
        const k = (y0 + yShift) * (x0 + xShift);
        const y1 = makeFraction(k, x1 + xShift);
        const newY = subFraction(y1, makeFraction(yShift, 1));
        questions.push(
          `已知 $(y+${yShift})$ 與 $(x+${xShift})$ 成反比，當 $x=${x0}$ 時 $y=${y0}$，求 $x=${x1}$ 時的 $y$ 值。`
        );
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(newY)}$`,
            `因為成反比，所以 $(y+${yShift})(x+${xShift})=k$。由 $x=${x0},\\ y=${y0}$ 得 $k=(${y0}+${yShift})(${x0}+${xShift})=${k}$。因此當 $x=${x1}$ 時，$y+${yShift}=\\dfrac{${k}}{${x1}+${xShift}}=${fractionToLatex(y1)}$，所以 $y=${fractionToLatex(newY)}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const templates = [
          { a0: -2, b0: -5, a1: 1 },
          { a0: -1, b0: 2, a1: 2 },
          { a0: 3, b0: -2, a1: -1 },
          { a0: 4, b0: 1, a1: -2 },
          { a0: -3, b0: 3, a1: 3 },
          { a0: 5, b0: -1, a1: 0 },
        ];
        const pick = templates[cycle % templates.length];
        const a0 = pick.a0;
        const b0 = pick.b0;
        const k = (5 * a0 - 2) * (b0 + 4);
        const a1 = pick.a1;
        const b1 = simplifyFraction(k, 5 * a1 - 2);
        const newB = subFraction(b1, makeFraction(4, 1));
        questions.push(`已知 $(5a-2)$ 與 $(b+4)$ 成反比，且當 $a=${a0}$ 時 $b=${b0}$。求 $a=${a1}$ 時的 $b$ 值。`);
        answers.push(
          formatJ232Answer(
            `$b=${fractionToLatex(newB)}$`,
            `由反比可得 $(5a-2)(b+4)=k$。代入 $a=${a0},\\ b=${b0}$ 得 $k=(${5 * a0 - 2})(${b0 + 4})=${k}$。當 $a=${a1}$ 時，$b+4=\\dfrac{${k}}{${5 * a1 - 2}}=${fractionToLatex(b1)}$，所以 $b=${fractionToLatex(newB)}$。`
          )
        );
        continue;
      }

      let xRatio = normalizeRatioInts(randInt(2, 6), randInt(2, 6));
      while (5 * xRatio.a - 6 * xRatio.b === 0) {
        xRatio = normalizeRatioInts(randInt(2, 6), randInt(2, 6));
      }
      const leftA = randInt(2, 5);
      const leftB = randInt(1, 4);
      const rightA = randInt(3, 6);
      const rightB = randInt(1, 4);
      const firstRatio = normalizeRatioInts(leftA * xRatio.a - leftB * xRatio.b, rightA * xRatio.a + rightB * xRatio.b);
      const secondRatio = normalizeRatioInts(3 * xRatio.a + 2 * xRatio.b, 5 * xRatio.a - 6 * xRatio.b);
      questions.push(
        `已知 $( ${formatTerm(leftA, 'x')}${leftB === 0 ? '' : '-' + formatTerm(leftB, 'y')} ):( ${formatTerm(rightA, 'x')}${rightB >= 0 ? '+' : ''}${formatTerm(rightB, 'y')} )=${firstRatio.a}:${firstRatio.b}$，求 $x:y$，再求 $(3x+2y):(5x-6y)$。`
      );
      answers.push(
        formatJ232Answer(
          `$x:y=${xRatio.a}:${xRatio.b}$，$(3x+2y):(5x-6y)=${secondRatio.a}:${secondRatio.b}$`,
          `設 $x:y=m:n$，則題目的比可寫成 $(${formatLinearCombination([
            { coef: leftA, variable: 'm' },
            { coef: -leftB, variable: 'n' },
          ])}):(${formatLinearCombination([
            { coef: rightA, variable: 'm' },
            { coef: rightB, variable: 'n' },
          ])})$。由已知比可反推 $x:y=${xRatio.a}:${xRatio.b}$。再設 $x=${formatTerm(xRatio.a, 'k')},\\ y=${formatTerm(xRatio.b, 'k')}$，可得 $(3x+2y):(5x-6y)=${formatTerm(3 * xRatio.a + 2 * xRatio.b, 'k')}:${formatTerm(5 * xRatio.a - 6 * xRatio.b, 'k')}=${secondRatio.a}:${secondRatio.b}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ232SquareProportionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const variants = shuffle([0, 1, 2, 3, 4]);

    for (let i = 0; i < count; i += 1) {
      const variant = variants[i % variants.length];
      const cycle = Math.floor(i / variants.length);

      if (variant === 0) {
        const templates = [
          { x0: 15, y0: 15, y1: 5 },
          { x0: 12, y0: 12, y1: 6 },
          { x0: 3, y0: 6, y1: 10 },
          { x0: 8, y0: 12, y1: 4 },
          { x0: 18, y0: 18, y1: 9 },
          { x0: 5, y0: 10, y1: 15 },
        ];
        const pick = templates[cycle % templates.length];
        const coeff = simplifyFraction(pick.y0 * pick.y0, 3 * pick.x0);
        const x1 = divFraction(makeFraction(pick.y1 * pick.y1, 1), mulFraction(coeff, makeFraction(3, 1)));
        questions.push(
          `已知 $y^2$ 與 $3x$ 成正比，當 $y=${pick.y0}$ 時 $x=${pick.x0}$，求 $y=${pick.y1}$ 時的 $x$ 值。`
        );
        answers.push(
          formatJ232Answer(
            `$x=${fractionToLatex(x1)}$`,
            `由正比可得 $y^2=k\\cdot 3x$。代入 $y=${pick.y0},\\ x=${pick.x0}$ 得 $k=\\dfrac{${pick.y0 * pick.y0}}{${3 * pick.x0}}=${fractionToLatex(coeff)}$。所以 $y^2=${fractionToLatex(coeff)}\\cdot 3x$。當 $y=${pick.y1}$ 時，代入得 $${pick.y1 * pick.y1}=${fractionToLatex(coeff)}\\cdot 3x$，解得 $x=${fractionToLatex(x1)}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { x0: 4, y0: -1, x1: -8 },
          { x0: 5, y0: 2, x1: -1 },
          { x0: 6, y0: -2, x1: 10 },
          { x0: 0, y0: 1, x1: 8 },
          { x0: 7, y0: -1, x1: -3 },
          { x0: 3, y0: 5, x1: 11 },
        ];
        const pick = templates[cycle % templates.length];
        const x0 = pick.x0;
        const y0 = pick.y0;
        const k = (y0 + 3) * (x0 - 2) * (x0 - 2);
        const x1 = pick.x1;
        const y1plus3 = simplifyFraction(k, (x1 - 2) * (x1 - 2));
        const y1 = subFraction(y1plus3, makeFraction(3, 1));
        questions.push(`已知 $(y+3)$ 與 $(x-2)^2$ 成反比，若 $x=${x0}$ 時 $y=${y0}$，求 $x=${x1}$ 時的 $y$ 值。`);
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(y1)}$`,
            `由反比可得 $(y+3)(x-2)^2=k$。代入 $x=${x0},\\ y=${y0}$ 得 $k=(${y0}+3)\\times (${x0}-2)^2=${k}$。當 $x=${x1}$ 時，$y+3=\\dfrac{${k}}{(${x1}-2)^2}=${fractionToLatex(y1plus3)}$，所以 $y=${fractionToLatex(y1)}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const templates = [
          { parts: [5, 3, 2], unit: 1, k: 2 },
          { parts: [6, 3, 1], unit: 1, k: 3 },
          { parts: [4, 3, 2], unit: 1, k: 2 },
          { parts: [7, 2, 1], unit: 1, k: 4 },
          { parts: [5, 4, 1], unit: 1, k: 3 },
          { parts: [8, 3, 1], unit: 1, k: 2 },
        ];
        const pick = templates[cycle % templates.length];
        const parts = pick.parts;
        const totalParts = parts.reduce((a, b) => a + b, 0);
        const weight = totalParts * pick.unit;
        const value = pick.k * weight * weight;
        const pieceWeights = parts.map((part) => part * pick.unit);
        const remainingValue = pick.k * pieceWeights[0] * pieceWeights[0] + pick.k * pieceWeights[1] * pieceWeights[1];
        const loss = value - remainingValue;
        questions.push(
          `某寶石價值與重量的平方成正比。若 ${weight} 克寶石價值 ${value} 萬元，現把它裂成重量比 $${parts.join(':')}$ 的三塊後，最小那一塊遺失，則損失多少萬元？`
        );
        answers.push(
          formatJ232Answer(
            `${loss} 萬元`,
            `設價值 $V$ 與重量 $w$ 的關係為 $V=kw^2$。由 ${weight} 克價值 ${value} 萬元得 $k=\\dfrac{${value}}{${weight}^2}=${pick.k}$。三塊重量分別為 ${pieceWeights.join(' 克、')} 克，最小的 ${pieceWeights[2]} 克遺失，所以剩餘價值要分開算：$${pick.k}\\times ${pieceWeights[0]}^2+${pick.k}\\times ${pieceWeights[1]}^2=${remainingValue}$ 萬元。因此損失為 $${value}-${remainingValue}=${loss}$ 萬元。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const side0 = [4, 6, 8, 9, 12, 14][cycle % 6];
        const area0 = side0 * side0;
        const side1 = [10, 12, 15, 18, 20, 21][(cycle * 2 + 1) % 6];
        const area1 = side1 * side1;
        questions.push(
          `正方形面積 $A$ 與邊長 $s$ 的平方成正比。若邊長 ${side0} 公分時面積為 ${area0} 平方公分，求邊長 ${side1} 公分時的面積。`
        );
        answers.push(
          formatJ232Answer(
            `${area1} 平方公分`,
            `因為正方形面積本來就滿足 $A=s^2$，所以 $A$ 與 $s^2$ 的比例常數是 1。當邊長為 ${side1} 公分時，面積為 ${side1}^2=${area1} 平方公分。`
          )
        );
        continue;
      }

      const templates = [
        { x0: 3, y0: 6, x1: 12 },
        { x0: 5, y0: 10, x1: 9 },
        { x0: 6, y0: 12, x1: 15 },
        { x0: 4, y0: 8, x1: 11 },
        { x0: 7, y0: 14, x1: 13 },
        { x0: 8, y0: 12, x1: 10 },
      ];
      const pick = templates[cycle % templates.length];
      const x0 = pick.x0;
      const y0 = pick.y0;
      const coeff = simplifyFraction(y0 * y0, x0 * x0);
      const x1 = pick.x1;
      const yAbs = mulFraction(simplifyFraction(y0, x0), makeFraction(x1, 1));
      const y1sq = mulFraction(yAbs, yAbs);
      questions.push(`已知 $y^2$ 與 $x^2$ 成正比，且當 $x=${x0}$ 時 $y=${y0}$。求 $x=${x1}$ 時的 $y$ 值。`);
      answers.push(
        formatJ232Answer(
          `$y=\\pm ${fractionToLatex(yAbs)}$`,
          `因為 $y^2$ 與 $x^2$ 成正比，所以可寫成 $y^2=kx^2$。由 $x=${x0},\\ y=${y0}$ 得 $k=\\dfrac{${y0 * y0}}{${x0 * x0}}=${fractionToLatex(coeff)}$。當 $x=${x1}$ 時，$y^2=${fractionToLatex(coeff)}\\times ${x1}^2=${fractionToLatex(y1sq)}$，因此 $y=\\pm ${fractionToLatex(yAbs)}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ232ChainedVariationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const variants = shuffle([0, 1, 2, 3, 4]);

    for (let i = 0; i < count; i += 1) {
      const variant = variants[i % variants.length];
      const cycle = Math.floor(i / variants.length);

      if (variant === 0) {
        const templates = [
          { x0: -12, y0: -6, z0: 3, x1: 8 },
          { x0: -10, y0: -5, z0: 4, x1: 6 },
          { x0: -15, y0: -9, z0: 2, x1: 10 },
          { x0: -8, y0: -4, z0: 6, x1: 12 },
          { x0: -14, y0: -7, z0: 5, x1: 4 },
          { x0: -18, y0: -12, z0: 3, x1: 9 },
        ];
        const pick = templates[cycle % templates.length];
        const x0 = pick.x0;
        const y0 = pick.y0;
        const z0 = pick.z0;
        const x1 = pick.x1;
        const ky = divFraction(makeFraction(y0, 1), makeFraction(x0, 1));
        const invConst = z0 * y0;
        const y1 = mulFraction(makeFraction(x1, 1), ky);
        const z1 = divFraction(makeFraction(invConst, 1), y1);
        questions.push(
          `已知 $x$ 與 $y$ 成正比，$y$ 與 $z$ 成反比。當 $z=${z0},\\ y=${y0}$ 時 $x=${x0}$，求當 $x=${x1}$ 時的 $y$ 與 $z$ 值。`
        );
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(y1)},\\ z=${fractionToLatex(z1)}$`,
            `先由 $x$ 與 $y$ 成正比得 $y=kx$。代入 $x=${x0},\\ y=${y0}$，得 $k=${fractionToLatex(ky)}$，所以當 $x=${x1}$ 時，$y=${fractionToLatex(y1)}$。又因 $y$ 與 $z$ 成反比，所以 $yz$ 為定值。由 $y=${y0},\\ z=${z0}$ 得 $yz=${invConst}$，所以此時 $z=\\dfrac{${invConst}}{${fractionToLatex(y1)}}=${fractionToLatex(z1)}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { x0: 6, y0: 4, z0: 9, x1: 15 },
          { x0: 8, y0: 3, z0: 10, x1: 12 },
          { x0: 9, y0: 6, z0: 8, x1: 18 },
          { x0: 10, y0: 5, z0: 12, x1: 20 },
          { x0: 12, y0: 8, z0: 15, x1: 24 },
          { x0: 15, y0: 10, z0: 6, x1: 25 },
        ];
        const pick = templates[cycle % templates.length];
        const x0 = pick.x0;
        const y0 = pick.y0;
        const z0 = pick.z0;
        const x1 = pick.x1;
        const c1 = x0 * y0;
        const c2 = y0 * z0;
        const y1 = divFraction(makeFraction(c1, 1), makeFraction(x1, 1));
        const z1 = divFraction(makeFraction(c2, 1), y1);
        questions.push(
          `若 $x$ 與 $y$ 成反比，$y$ 與 $z$ 也成反比。當 $(x,y,z)=(${x0},${y0},${z0})$ 時，求當 $x=${x1}$ 時的 $y$ 與 $z$。`
        );
        answers.push(
          formatJ232Answer(
            `$y=${fractionToLatex(y1)},\\ z=${fractionToLatex(z1)}$`,
            `由 $x$ 與 $y$ 成反比，得 $xy=${c1}$，所以當 $x=${x1}$ 時，$y=\\dfrac{${c1}}{${x1}}=${fractionToLatex(y1)}$。又因 $y$ 與 $z$ 成反比，得 $yz=${c2}$，所以 $z=\\dfrac{${c2}}{${fractionToLatex(y1)}}=${fractionToLatex(z1)}$。此外因兩次反比相接，$x$ 與 $z$ 會成正比。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const templates = [
          { x0: 6, y0: makeFraction(1, 2), z0: makeFraction(3, 4), x1: -4 },
          { x0: 8, y0: makeFraction(3, 4), z0: makeFraction(5, 6), x1: -2 },
          { x0: 10, y0: makeFraction(2, 5), z0: makeFraction(7, 5), x1: -5 },
          { x0: 12, y0: makeFraction(1, 3), z0: makeFraction(4, 3), x1: -6 },
          { x0: 15, y0: makeFraction(2, 3), z0: makeFraction(9, 10), x1: -3 },
          { x0: 9, y0: makeFraction(5, 6), z0: makeFraction(2, 3), x1: -1 },
        ];
        const pick = templates[cycle % templates.length];
        const x0 = pick.x0;
        const y0 = pick.y0;
        const z0 = pick.z0;
        const x1 = pick.x1;
        const ky = divFraction(y0, makeFraction(x0, 1));
        const kz = mulFraction(z0, makeFraction(x1, 1));
        const y1 = mulFraction(makeFraction(x1, 1), ky);
        const z1 = divFraction(kz, makeFraction(x1, 1));
        const t1 = subFraction(y1, z1);
        const t1Text = t1.den === 1 ? `${t1.num}` : `${t1.num < 0 ? '-' : ''}\\dfrac{${Math.abs(t1.num)}}{${t1.den}}`;
        const zTermInT =
          kz.num < 0 ? `+\\dfrac{${fractionToLatex(negateFraction(kz))}}{x}` : `-\\dfrac{${fractionToLatex(kz)}}{x}`;
        const tRelationText = `T=${fractionToLatex(ky)}x${zTermInT}`;
        questions.push(
          `已知 $T=Y-Z$，其中 $Y$ 與 $x$ 成正比，$Z$ 與 $x$ 成反比。若當 $x=${x0}$ 時，$Y=${fractionToLatex(y0)}$；當 $x=${x1}$ 時，$Z=${fractionToLatex(z0)}$，求 $T$ 與 $x$ 的關係式，並求當 $x=${x1}$ 時的 $T$。`
        );
        answers.push(
          formatJ232Answer(
            `$${tRelationText}$，當 $x=${x1}$ 時 $T=${t1Text}$`,
            `由 $Y$ 與 $x$ 成正比，可設 $Y=${fractionToLatex(ky)}x$。由 $Z$ 與 $x$ 成反比，且 $x=${x1}$ 時 $Z=${fractionToLatex(z0)}$，可得 $Z=\\dfrac{${fractionToLatex(kz)}}{x}$。所以 $T=Y-Z=${fractionToLatex(ky)}x${zTermInT}$。當 $x=${x1}$ 時，$Y=${fractionToLatex(y1)},\\ Z=${fractionToLatex(z1)}$，故 $T=${t1Text}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const templates = [
          { x0: 4, y0: 10, z0: 6, x1: 9 },
          { x0: 5, y0: 12, z0: 9, x1: 15 },
          { x0: 6, y0: 14, z0: 8, x1: 18 },
          { x0: 8, y0: 20, z0: 12, x1: 10 },
          { x0: 10, y0: 15, z0: 5, x1: 16 },
          { x0: 12, y0: 18, z0: 6, x1: 20 },
        ];
        const pick = templates[cycle % templates.length];
        const x0 = pick.x0;
        const y0 = pick.y0;
        const z0 = pick.z0;
        const x1 = pick.x1;
        const ky = divFraction(makeFraction(y0, 1), makeFraction(x0, 1));
        const kz = divFraction(makeFraction(z0, 1), makeFraction(x0, 1));
        const y1 = mulFraction(ky, makeFraction(x1, 1));
        const z1 = mulFraction(kz, makeFraction(x1, 1));
        questions.push(
          `已知 $x$ 與 $y$ 成正比，且 $x$ 與 $z$ 也成正比。若當 $x=${x0}$ 時，$y=${y0},\\ z=${z0}$，求當 $x=${x1}$ 時的 $(y+z)$。`
        );
        answers.push(
          formatJ232Answer(
            `$y+z=${fractionToLatex(addFraction(y1, z1))}$`,
            `由正比可設 $y=${fractionToLatex(ky)}x,\\ z=${fractionToLatex(kz)}x$。因此當 $x=${x1}$ 時，$y=${fractionToLatex(y1)},\\ z=${fractionToLatex(z1)}$，所以 $y+z=${fractionToLatex(addFraction(y1, z1))}$。`
          )
        );
        continue;
      }

      const templates = [
        { x0: 5, y0: 8, z0: 10, x1: 20 },
        { x0: 4, y0: 6, z0: 9, x1: 12 },
        { x0: 6, y0: 9, z0: 12, x1: 18 },
        { x0: 8, y0: 10, z0: 15, x1: 16 },
        { x0: 10, y0: 12, z0: 18, x1: 30 },
        { x0: 12, y0: 15, z0: 20, x1: 24 },
      ];
      const pick = templates[cycle % templates.length];
      const x0 = pick.x0;
      const y0 = pick.y0;
      const z0 = pick.z0;
      const x1 = pick.x1;
      const c1 = x0 * y0;
      const kz = divFraction(makeFraction(z0, 1), makeFraction(y0, 1));
      const y1 = divFraction(makeFraction(c1, 1), makeFraction(x1, 1));
      const z1 = mulFraction(kz, y1);
      questions.push(
        `若 $x$ 與 $y$ 成反比，$y$ 與 $z$ 成正比。當 $(x,y,z)=(${x0},${y0},${z0})$ 時，求當 $x=${x1}$ 時的 $z$。並判斷 $x$ 與 $z$ 的關係。`
      );
      answers.push(
        formatJ232Answer(
          `$z=${fractionToLatex(z1)}$，$x$ 與 $z$ 成反比`,
          `由 $x$ 與 $y$ 成反比得 $xy=${c1}$，所以當 $x=${x1}$ 時，$y=\\dfrac{${c1}}{${x1}}=${fractionToLatex(y1)}$。又因 $y$ 與 $z$ 成正比，且 $z:y=${z0}:${y0}=\\dfrac{${z0}}{${y0}}$，所以 $z=\\dfrac{${z0}}{${y0}}y=\\dfrac{${z0}}{${y0}}\\times ${fractionToLatex(y1)}=${fractionToLatex(z1)}$。因為一反比再接一正比，所以 $x$ 與 $z$ 仍成反比。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ232PercentChangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const variants = shuffle([0, 1, 2, 3, 4]);

    for (let i = 0; i < count; i += 1) {
      const variant = variants[i % variants.length];
      const cycle = Math.floor(i / variants.length);

      if (variant === 0) {
        const drops = [40, 30, 20, 50, 60, 10];
        const drop = drops[cycle % drops.length];
        const keep = simplifyFraction(100 - drop, 100);
        const mult = simplifyFraction(100, 100 - drop);
        questions.push(`若 $y$ 與 $x$ 成反比，當 $x$ 減少 $${drop}\\%$ 時，$y$ 變為原來的幾倍？`);
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(mult)}$ 倍`,
            `$x$ 減少 $${drop}\\%$ 表示變成原來的 $${100 - drop}\\%=\\dfrac{${keep.num}}{${keep.den}}$。因為 $y$ 與 $x$ 成反比，所以 $y$ 會變成原來的倒數倍數，即 $${fractionToLatex(mult)}$ 倍。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const ups = [25, 20, 50, 10, 40, 60];
        const up = ups[cycle % ups.length];
        const den = 100 + up;
        const frac = simplifyFraction(100, den);
        const inc = simplifyFraction(up, 100);
        questions.push(`若 $y$ 與 $x$ 成反比，當 $x$ 增加 $${up}\\%$ 時，$y$ 變為原來的幾分之幾？`);
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(frac)}$`,
            `$x$ 增加 $${up}\\%$ 表示變成原來的 $1+${fractionToLatex(inc)}=\\dfrac{${den}}{100}$ 倍。因為 $y$ 與 $x$ 成反比，所以 $y$ 變為原來的 $${fractionToLatex(frac)}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const mults = [2, 3, 4, 5, 6, 7];
        const m = mults[cycle % mults.length];
        questions.push(`若 $y$ 與 $x$ 成正比，當 $x$ 變為原來的 ${m} 倍時，$y$ 變為原來的幾倍？`);
        answers.push(
          formatJ232Answer(`${m} 倍`, `正比的意思是兩個量同倍數增減，所以 $x$ 變成 ${m} 倍，$y$ 也會跟著變成 ${m} 倍。`)
        );
        continue;
      }

      if (variant === 3) {
        const drops = [20, 10, 25, 30, 40, 50];
        const drop = drops[cycle % drops.length];
        const dec = simplifyFraction(drop, 100);
        questions.push(`若 $y$ 與 $x$ 成正比，當 $x$ 減少 $${drop}\\%$ 時，$y$ 會減少原來的幾分之幾？`);
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(dec)}$`,
            `$x$ 減少 $${drop}\\%$ 表示變成原來的 $${100 - drop}\\%$。因為正比，所以 $y$ 也變成相同比例，因此減少原來的 $${fractionToLatex(dec)}$。`
          )
        );
        continue;
      }

      const templates = [
        { up: 20, down: 25 },
        { up: 25, down: 20 },
        { up: 50, down: 20 },
        { up: 40, down: 10 },
        { up: 10, down: 10 },
        { up: 30, down: 20 },
      ];
      const pick = templates[cycle % templates.length];
      const xFactor = simplifyFraction(100 + pick.up, 100);
      const downFactor = simplifyFraction(100 - pick.down, 100);
      const finalX = mulFraction(xFactor, downFactor);
      const finalY = divFraction(makeFraction(1, 1), finalX);
      questions.push(
        `若 $y$ 與 $x$ 成反比，當 $x$ 先增加 $${pick.up}\\%$，再減少 $${pick.down}\\%$ 時，$y$ 最後變為原來的幾倍？`
      );
      answers.push(
        formatJ232Answer(
          `$${fractionToLatex(finalY)}$ 倍`,
          `$x$ 先增加 $${pick.up}\\%$ 變成 $${fractionToLatex(xFactor)}$ 倍，再減少 $${pick.down}\\%$ 就乘上 $${fractionToLatex(downFactor)}$，所以最後 $x$ 變成 $${fractionToLatex(finalX)}$ 倍。因為 $y$ 與 $x$ 成反比，所以 $y$ 變成原來的倒數倍數，即 $${fractionToLatex(finalY)}$ 倍。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ232WordJudgmentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    const directBank = [
      () => {
        const price = [35, 40, 45, 50, 60][randInt(0, 4)];
        return {
          q: `已知漫畫書每本 ${price} 元，小妍買了 $x$ 本，共付 $y$ 元。判斷 $y$ 與 $x$ 是成正比、成反比，還是都不是。`,
          a: formatJ232Answer('成正比', `關係式是 $y=${price}x$。這符合 $y=kx$ 的形式，所以 $y$ 與 $x$ 成正比。`),
        };
      },
      () => {
        const speed = [60, 70, 80, 90][randInt(0, 3)];
        return {
          q: `阿成平均每小時以 ${speed} 公里的速率開車，行駛 $x$ 小時後，總路程為 $y$ 公里。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('成正比', `關係式是 $y=${speed}x$。因為符合 $y=kx$，所以 $y$ 與 $x$ 成正比。`),
        };
      },
      () => {
        const price = [120, 150, 200, 250][randInt(0, 3)];
        const percent = [6, 7, 8, 9][randInt(0, 3)];
        return {
          q: `一本書定價 ${price} 元，打 $${percent}$ 折後的售價為 $y$ 元。若折數記為 $x$，判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '成正比',
            `折數 $x$ 表示售價是原價的 $\\dfrac{x}{10}$，所以 $y=${price}\\cdot \\dfrac{x}{10}$。這可整理成 $y=${price / 10}x$，因此 $y$ 與 $x$ 成正比。`
          ),
        };
      },
      () => {
        return {
          q: `已知圓的半徑為 $x$ 公分，圓周長為 $y$ 公分。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '成正比',
            `圓周長公式是 $y=2\\pi x$。因為 $2\\pi$ 是常數，符合 $y=kx$ 的形式，所以 $y$ 與 $x$ 成正比。`
          ),
        };
      },
      () => {
        const unit = [12, 15, 20, 25][randInt(0, 3)];
        return {
          q: `一盒彩色筆有 ${unit} 支，買了 $x$ 盒後共有 $y$ 支彩色筆。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer('成正比', `關係式是 $y=${unit}x$，符合 $y=kx$，所以 $y$ 與 $x$ 成正比。`),
        };
      },
    ];

    const inverseBank = [
      () => {
        const total = [180, 200, 240, 300][randInt(0, 3)];
        return {
          q: `媽媽每天花 ${total} 元買水果。若蘋果單價為 $x$ 元/斤，可買 $y$ 斤。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '成反比',
            `因為單價 $\\times$ 數量 $=$ 總價，所以 $xy=${total}$。這符合 $xy=k$ 的形式，因此 $y$ 與 $x$ 成反比。`
          ),
        };
      },
      () => {
        const area = [24, 30, 36, 40][randInt(0, 3)];
        return {
          q: `一個面積為 ${area} 平方公分的三角形，底邊長為 $x$ 公分，高為 $y$ 公分。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '成反比',
            `三角形面積是 $\\dfrac{1}{2}xy=${area}$，整理得 $xy=${2 * area}$。這符合 $xy=k$ 的形式，所以 $y$ 與 $x$ 成反比。`
          ),
        };
      },
      () => {
        const distance = [240, 300, 360, 420][randInt(0, 3)];
        return {
          q: `兩地相距 ${distance} 公里，開車速率為每小時 $x$ 公里，所需時間為 $y$ 小時。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '成反比',
            `因為 距離 $=$ 速率 $\\times$ 時間，所以 $xy=${distance}$。這符合 $xy=k$，因此 $y$ 與 $x$ 成反比。`
          ),
        };
      },
      () => {
        const volume = [6000, 8000, 12000][randInt(0, 2)];
        return {
          q: `將 ${volume} cc 的水倒入底面積為 $x$ 平方公分的水箱，水深為 $y$ 公分。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '成反比',
            `體積 $=$ 底面積 $\\times$ 高，所以 $xy=${volume}$。符合 $xy=k$ 的形式，因此 $y$ 與 $x$ 成反比。`
          ),
        };
      },
      () => {
        const work = [12, 15, 18, 20][randInt(0, 3)];
        return {
          q: `完成一項固定工作需要 ${work} 工時。若有 $x$ 位工人平均分工，每位工人需工作 $y$ 小時。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '成反比',
            `因為人數 $\\times$ 每人工作時間 $=$ 固定總工時，所以 $xy=${work}$。因此 $y$ 與 $x$ 成反比。`
          ),
        };
      },
    ];

    const neitherBank = [
      () => {
        return {
          q: `一年甲班共有 36 人，其中男生 $x$ 人、女生 $y$ 人。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '都不是',
            `關係式是 $x+y=36$，也就是 $y=36-x$。這既不是 $y=kx$，也不是 $xy=k$，所以都不是。`
          ),
        };
      },
      () => {
        const perimeter = [24, 30, 40][randInt(0, 2)];
        return {
          q: `周長為 ${perimeter} 公分的長方形，長為 $x$ 公分，寬為 $y$ 公分。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '都不是',
            `由周長公式得 $2(x+y)=${perimeter}$，整理成 $y=${perimeter / 2}-x$。因為不是 $y=kx$，也不是 $xy=k$，所以都不是。`
          ),
        };
      },
      () => {
        const diff = [18, 24, 30, 36][randInt(0, 3)];
        return {
          q: `爸爸今年 $x$ 歲，女兒今年 $y$ 歲，兩人相差 ${diff} 歲。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '都不是',
            `關係式是 $x-y=${diff}$，整理成 $y=x-${diff}$。這不是正比，也不是反比，所以都不是。`
          ),
        };
      },
      () => {
        return {
          q: `已知圓的半徑為 $x$ 公分，面積為 $y$ 平方公分。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '都不是',
            `圓面積公式是 $y=\\pi x^2$。這是與 $x^2$ 成正比，不是與 $x$ 本身成正比，也不是反比，所以都不是。`
          ),
        };
      },
      () => {
        const base = [30, 40, 50, 60][randInt(0, 3)];
        const perMin = [2, 3, 4][randInt(0, 2)];
        return {
          q: `某電信公司的月租費為 ${base} 元，每分鐘另收 ${perMin} 元，通話 $x$ 分鐘後總費用為 $y$ 元。判斷 $y$ 與 $x$ 的關係。`,
          a: formatJ232Answer(
            '都不是',
            `關係式是 $y=${perMin}x+${base}$。因為有固定常數項 ${base}，所以不是正比；乘積也不固定，所以不是反比，因此都不是。`
          ),
        };
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const bankType = randInt(0, 2);
      const bank = bankType === 0 ? directBank : bankType === 1 ? inverseBank : neitherBank;
      const pick = bank[randInt(0, bank.length - 1)]();
      questions.push(`判斷題：${pick.q}`);
      answers.push(pick.a);
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-3-2 新增：彈簧秤（胡克定律）────────────────────────────────────────
  function buildJ232SpringScaleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;
      const cycle = Math.floor(i / 4);

      if (variant === 0) {
        // 已知砝碼重→伸長量，求另一砝碼重對應的伸長量
        const templates = [
          { w1: 6, ext1: 12, w2: 8 },
          { w1: 4, ext1: 6, w2: 10 },
          { w1: 5, ext1: 15, w2: 6 },
          { w1: 10, ext1: 8, w2: 15 },
          { w1: 8, ext1: 20, w2: 12 },
          { w1: 3, ext1: 9, w2: 7 },
        ];
        const pick = templates[cycle % templates.length];
        const ext2 = simplifyFraction(pick.w2 * pick.ext1, pick.w1);
        questions.push(
          `彈性限度內，彈簧伸長量與所掛物體重量成正比。已知掛上 $${pick.w1}$ 公克的砝碼時，彈簧伸長 $${pick.ext1}$ 公分，則掛上 $${pick.w2}$ 公克時，彈簧伸長幾公分？`
        );
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(ext2)}$ 公分`,
            `設伸長量為 $e$，重量為 $w$，則 $e=kw$。由 $w=${pick.w1},\\ e=${pick.ext1}$ 得 $k=\\dfrac{${pick.ext1}}{${pick.w1}}${fractionToLatex(simplifyFraction(pick.ext1, pick.w1)) !== String(pick.ext1 / pick.w1) ? `=${fractionToLatex(simplifyFraction(pick.ext1, pick.w1))}` : ''}$。當 $w=${pick.w2}$ 時，$e=${fractionToLatex(simplifyFraction(pick.ext1, pick.w1))}\\times ${pick.w2}=${fractionToLatex(ext2)}$ 公分。`
          )
        );
        continue;
      }

      if (variant === 1) {
        // 已知砝碼重→伸長量，從伸長量反推重量
        const templates = [
          { w1: 6, ext1: 12, ext2: 16 },
          { w1: 4, ext1: 10, ext2: 25 },
          { w1: 5, ext1: 8, ext2: 24 },
          { w1: 8, ext1: 6, ext2: 21 },
          { w1: 9, ext1: 6, ext2: 14 },
          { w1: 10, ext1: 4, ext2: 18 },
        ];
        const pick = templates[cycle % templates.length];
        const w2 = simplifyFraction(pick.w1 * pick.ext2, pick.ext1);
        questions.push(
          `彈性限度內，彈簧伸長量與所掛物體重量成正比。已知掛上 ${pick.w1} 公克時彈簧伸長 ${pick.ext1} 公分，若現在彈簧伸長了 ${pick.ext2} 公分，則掛了多少公克的物體？`
        );
        answers.push(
          formatJ232Answer(
            `${fractionToLatex(w2)} 公克`,
            `因為伸長量與重量成正比，所以 $\\dfrac{${pick.ext2}}{w_2}=\\dfrac{${pick.ext1}}{${pick.w1}}$。解得 $w_2=\\dfrac{${pick.w1}\\times ${pick.ext2}}{${pick.ext1}}=${fractionToLatex(w2)}$ 公克。`
          )
        );
        continue;
      }

      if (variant === 2) {
        // 已知原長 + 掛重→全長，求另一重量的全長
        const templates = [
          { orig: 16, w1: 32, totalLen1: 20, w2: 64 },
          { orig: 15, w1: 20, totalLen1: 27, w2: 42 },
          { orig: 12, w1: 10, totalLen1: 17, w2: 30 },
          { orig: 20, w1: 12, totalLen1: 24, w2: 9 },
          { orig: 10, w1: 8, totalLen1: 16, w2: 20 },
          { orig: 18, w1: 15, totalLen1: 24, w2: 25 },
        ];
        const pick = templates[cycle % templates.length];
        const ext1 = pick.totalLen1 - pick.orig;
        const ext2 = simplifyFraction(ext1 * pick.w2, pick.w1);
        const total2 = addFraction(makeFraction(pick.orig, 1), ext2);
        questions.push(
          `一彈簧原長 ${pick.orig} 公分，掛上 ${pick.w1} 公克重的物體後，彈簧全長變為 ${pick.totalLen1} 公分（彈性限度內）。請問掛上 ${pick.w2} 公克時，彈簧全長為幾公分？`
        );
        answers.push(
          formatJ232Answer(
            `${fractionToLatex(total2)} 公分`,
            `掛 ${pick.w1} 公克時伸長量為 $${pick.totalLen1}-${pick.orig}=${ext1}$ 公分。因為伸長量與重量成正比，掛 ${pick.w2} 公克時伸長量為 $${fractionToLatex(simplifyFraction(ext1, pick.w1))}\\times ${pick.w2}=${fractionToLatex(ext2)}$ 公分。因此全長為 $${pick.orig}+${fractionToLatex(ext2)}=${fractionToLatex(total2)}$ 公分。`
          )
        );
        continue;
      }

      // variant 3: 減輕負荷後彈簧彈回量
      const templates = [
        { maxW: 20, ext_max: 24, w2: 9 },
        { maxW: 15, ext_max: 18, w2: 6 },
        { maxW: 25, ext_max: 20, w2: 5 },
        { maxW: 30, ext_max: 15, w2: 12 },
        { maxW: 24, ext_max: 16, w2: 8 },
        { maxW: 18, ext_max: 12, w2: 6 },
      ];
      const pick = templates[cycle % templates.length];
      const ext2 = simplifyFraction(pick.w2 * pick.ext_max, pick.maxW);
      const bounce = subFraction(makeFraction(pick.ext_max, 1), ext2);
      questions.push(
        `一彈簧秤在彈性限度內最多可稱重 $${pick.maxW}$ 公斤，已知稱 $${pick.maxW}$ 公斤時彈簧被拉長 $${pick.ext_max}$ 公分。若改稱 $${pick.w2}$ 公斤的物體，彈簧會比最大伸長量縮短幾公分？`
      );
      answers.push(
        formatJ232Answer(
          `$${fractionToLatex(bounce)}$ 公分`,
          `稱 $${pick.w2}$ 公斤時的伸長量為 $\\dfrac{${pick.w2}}{${pick.maxW}}\\times ${pick.ext_max}=${fractionToLatex(ext2)}$ 公分。最大伸長量為 $${pick.ext_max}$ 公分，所以縮短了 $${pick.ext_max}-${fractionToLatex(ext2)}=${fractionToLatex(bounce)}$ 公分。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-3-2 新增：工程人力反比問題 ─────────────────────────────────────────
  function buildJ232WorkManpowerSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;
      const cycle = Math.floor(i / 4);

      if (variant === 0) {
        // 換人數求完工天數
        const templates = [
          { w1: 6, d1: 20, w2: 8 },
          { w1: 10, d1: 15, w2: 6 },
          { w1: 4, d1: 30, w2: 12 },
          { w1: 8, d1: 12, w2: 16 },
          { w1: 5, d1: 24, w2: 15 },
          { w1: 9, d1: 10, w2: 6 },
        ];
        const pick = templates[cycle % templates.length];
        const d2 = simplifyFraction(pick.w1 * pick.d1, pick.w2);
        questions.push(
          `有一工程，$${pick.w1}$ 人合作需 $${pick.d1}$ 天完工（每人每天工作量相同）。若改由 $${pick.w2}$ 人合作，需要幾天才能完工？`
        );
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(d2)}$ 天`,
            `人數與天數成反比，乘積固定：$${pick.w1}\\times ${pick.d1}=${pick.w1 * pick.d1}$。設 $${pick.w2}$ 人需要 $d$ 天，則 $${pick.w2}\\times d=${pick.w1 * pick.d1}$，解得 $d=${fractionToLatex(d2)}$ 天。`
          )
        );
        continue;
      }

      if (variant === 1) {
        // 提前完工需增加幾人
        const templates = [
          { w1: 6, d1: 20, d2: 15 },
          { w1: 10, d1: 18, d2: 12 },
          { w1: 5, d1: 24, d2: 20 },
          { w1: 8, d1: 15, d2: 10 },
          { w1: 6, d1: 10, d2: 8 },
          { w1: 4, d1: 30, d2: 24 },
        ];
        const pick = templates[cycle % templates.length];
        const w2 = simplifyFraction(pick.w1 * pick.d1, pick.d2);
        const extra = subFraction(w2, makeFraction(pick.w1, 1));
        questions.push(`有一工程，${pick.w1} 人合作需 ${pick.d1} 天完工。若想提前至 ${pick.d2} 天完工，需要增加幾人？`);
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(extra)}$ 人`,
            `原本總工量為 $${pick.w1}\\times ${pick.d1}=${pick.w1 * pick.d1}$ 人天。若要 ${pick.d2} 天完工，需要 $\\dfrac{${pick.w1 * pick.d1}}{${pick.d2}}=${fractionToLatex(w2)}$ 人。因此需增加 $${fractionToLatex(w2)}-${pick.w1}=${fractionToLatex(extra)}$ 人。`
          )
        );
        continue;
      }

      if (variant === 2) {
        // 多組條件計算（n人喝m瓶需t分鐘，求另一情境）
        const templates = [
          { p1: 5, b1: 5, t1: 5, p2: 10, b2: 15 },
          { p1: 3, b1: 6, t1: 4, p2: 6, b2: 9 },
          { p1: 4, b1: 8, t1: 6, p2: 8, b2: 12 },
          { p1: 6, b1: 12, t1: 3, p2: 9, b2: 18 },
          { p1: 2, b1: 4, t1: 8, p2: 4, b2: 10 },
          { p1: 5, b1: 10, t1: 4, p2: 10, b2: 20 },
        ];
        const pick = templates[cycle % templates.length];
        // 每人每分鐘喝 b1/(p1*t1) 瓶
        // 新情境: p2人喝b2瓶需時 = b2 / (p2 * b1/(p1*t1)) = b2*p1*t1/(p2*b1)
        const t2 = simplifyFraction(pick.b2 * pick.p1 * pick.t1, pick.p2 * pick.b1);
        questions.push(
          `$${pick.p1}$ 個學生合作喝 $${pick.b1}$ 瓶飲料（每瓶等量）需 $${pick.t1}$ 分鐘，假設每人喝的速率相同。若改成 $${pick.p2}$ 個學生喝 $${pick.b2}$ 瓶，需要幾分鐘？`
        );
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(t2)}$ 分鐘`,
            `每人每分鐘喝的量為 $\\dfrac{${pick.b1}}{${pick.p1}\\times ${pick.t1}}=\\dfrac{${pick.b1}}{${pick.p1 * pick.t1}}$ 瓶。${pick.p2} 人每分鐘共喝 $${pick.p2}\\times\\dfrac{${pick.b1}}{${pick.p1 * pick.t1}}$ 瓶，喝完 ${pick.b2} 瓶需要 $\\dfrac{${pick.b2}}{${pick.p2}\\times\\dfrac{${pick.b1}}{${pick.p1 * pick.t1}}}=\\dfrac{${pick.b2}\\times ${pick.p1 * pick.t1}}{${pick.p2}\\times ${pick.b1}}=${fractionToLatex(t2)}$ 分鐘。`
          )
        );
        continue;
      }

      // variant 3: 男工女工換算工程量
      const templates = [
        { maleEq: 4, femaleEq: 5, totalFemale: 30, femDays: 60, targetDays: 20 },
        { maleEq: 3, femaleEq: 4, totalFemale: 24, femDays: 40, targetDays: 15 },
        { maleEq: 5, femaleEq: 6, totalFemale: 18, femDays: 48, targetDays: 16 },
        { maleEq: 2, femaleEq: 3, totalFemale: 30, femDays: 45, targetDays: 18 },
        { maleEq: 4, femaleEq: 5, totalFemale: 20, femDays: 50, targetDays: 25 },
        { maleEq: 3, femaleEq: 5, totalFemale: 25, femDays: 60, targetDays: 20 },
      ];
      const pick = templates[cycle % templates.length];
      // 1 male = femaleEq/maleEq females in work rate
      // Total work = totalFemale * femDays (in female-day units)
      // Want to finish in targetDays with extra males
      const totalWork = pick.totalFemale * pick.femDays;
      // work done by existing female workers in targetDays
      const existingWork = pick.totalFemale * pick.targetDays;
      // remaining work to be done by extra males
      const remainWork = totalWork - existingWork;
      // each male = femaleEq/maleEq female work rate
      // extra males × targetDays × (femaleEq/maleEq) = remainWork
      const extraMale = simplifyFraction(remainWork * pick.maleEq, pick.targetDays * pick.femaleEq);
      questions.push(
        `設男工 ${pick.maleEq} 人的工作量等於女工 ${pick.femaleEq} 人的工作量。有一工程，原由女工 ${pick.totalFemale} 人做需 ${pick.femDays} 日完工。若想於 ${pick.targetDays} 日完工，應再增加男工幾人？`
      );
      answers.push(
        formatJ232Answer(
          `$${fractionToLatex(extraMale)}$ 人`,
          `先以「女工人天」計算總工量：$${pick.totalFemale}\\times ${pick.femDays}=${totalWork}$ 女工人天。${pick.totalFemale} 名女工做 ${pick.targetDays} 天，已完成 $${totalWork - totalWork + existingWork}$ 女工人天，還剩 $${remainWork}$ 女工人天。每名男工的效率是女工的 $\\dfrac{${pick.femaleEq}}{${pick.maleEq}}$ 倍，設需增加 $m$ 名男工，則 $m\\times ${pick.targetDays}\\times\\dfrac{${pick.femaleEq}}{${pick.maleEq}}=${remainWork}$，解得 $m=${fractionToLatex(extraMale)}$ 人。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-3-2 新增：速率比賽跑落後問題 ──────────────────────────────────────
  function buildJ232SpeedRaceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;
      const cycle = Math.floor(i / 4);

      if (variant === 0) {
        // 甲到終點時乙落後多少（速率比 → 時間反比 → 同時間乙的距離）
        const templates = [
          { dist: 600, va: 6, vb: 5, name: ['東東', '名名'] },
          { dist: 400, va: 8, vb: 7, name: ['甲', '乙'] },
          { dist: 3000, va: 6, vb: 5, name: ['甲', '乙'] },
          { dist: 100, va: 5, vb: 4, name: ['小明', '小華'] },
          { dist: 800, va: 4, vb: 3, name: ['甲', '乙'] },
          { dist: 1000, va: 5, vb: 4, name: ['甲', '乙'] },
        ];
        const pick = templates[cycle % templates.length];
        // 甲到終點時乙走了 dist * vb/va
        const bDist = simplifyFraction(pick.dist * pick.vb, pick.va);
        const behind = subFraction(makeFraction(pick.dist, 1), bDist);
        questions.push(
          `${pick.name[0]}與${pick.name[1]}兩人同時出發跑 ${pick.dist} 公尺，兩人速率比為 $${pick.va}:${pick.vb}$，皆以固定速率跑完全程。當${pick.name[0]}到達終點時，${pick.name[1]}距終點還有多少公尺？`
        );
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(behind)}$ 公尺`,
            `${pick.name[0]}跑完 ${pick.dist} 公尺的時間，${pick.name[1]}跑了 $${pick.dist}\\times\\dfrac{${pick.vb}}{${pick.va}}=${fractionToLatex(bDist)}$ 公尺，距終點還有 $${pick.dist}-${fractionToLatex(bDist)}=${fractionToLatex(behind)}$ 公尺。`
          )
        );
        continue;
      }

      if (variant === 1) {
        // 追趕問題：乙比甲晚x分出發，y分後追上，求速率比
        const templates = [
          { late: 5, catchUp: 20, name: ['甲', '乙'] },
          { late: 10, catchUp: 30, name: ['甲', '乙'] },
          { late: 8, catchUp: 40, name: ['甲', '乙'] },
          { late: 6, catchUp: 24, name: ['甲', '乙'] },
          { late: 4, catchUp: 16, name: ['甲', '乙'] },
          { late: 3, catchUp: 15, name: ['甲', '乙'] },
        ];
        const pick = templates[cycle % templates.length];
        // 甲出發了 late+catchUp 分鐘，乙出發了 catchUp 分鐘，距離相同
        // va * (late+catchUp) = vb * catchUp
        const va = pick.catchUp;
        const vb = pick.late + pick.catchUp;
        const ratio = normalizeRatioInts(va, vb);
        questions.push(
          `${pick.name[0]}、${pick.name[1]}兩人各以一定速率騎車從 A 鎮到 B 鎮。${pick.name[1]}比${pick.name[0]}慢 ${pick.late} 分鐘出發，${pick.name[1]}出發後 ${pick.catchUp} 分鐘追上${pick.name[0]}，求兩人的速率比（${pick.name[0]}：${pick.name[1]}）。`
        );
        answers.push(
          formatJ232Answer(
            `$${ratio.a}:${ratio.b}$`,
            `${pick.name[1]}追上時，${pick.name[0]}共走了 $${pick.late}+${pick.catchUp}=${pick.late + pick.catchUp}$ 分鐘，${pick.name[1]}走了 ${pick.catchUp} 分鐘，兩人路程相同，所以速率比等於時間的反比：${pick.name[0]}：${pick.name[1]} $=${pick.catchUp}:${pick.late + pick.catchUp}=${ratio.a}:${ratio.b}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        // 讓跑問題：兩人速率比，要讓慢者先出發或先跑幾公尺使同時到達
        const templates = [
          { dist: 100, tFast: 15, tSlow: 18, name: ['東東', '名名'] },
          { dist: 200, tFast: 20, tSlow: 24, name: ['甲', '乙'] },
          { dist: 100, tFast: 12, tSlow: 15, name: ['小明', '小華'] },
          { dist: 400, tFast: 40, tSlow: 50, name: ['甲', '乙'] },
          { dist: 100, tFast: 18, tSlow: 20, name: ['甲', '乙'] },
          { dist: 200, tFast: 25, tSlow: 30, name: ['甲', '乙'] },
        ];
        const pick = templates[cycle % templates.length];
        // 速率比 va:vb = 1/tFast : 1/tSlow = tSlow:tFast
        // 快者讓慢者先出發 handicap 公尺，使同時到達
        // va/vb = tSlow/tFast
        // 若慢者先跑 h 公尺：快者跑 dist，慢者跑 dist-h，時間相同
        // dist/va = (dist-h)/vb → h = dist*(1 - vb/va) = dist*(1 - tFast/tSlow)
        const h = simplifyFraction(pick.dist * (pick.tSlow - pick.tFast), pick.tSlow);
        questions.push(
          `${pick.name[0]}跑 ${pick.dist} 公尺費時 ${pick.tFast} 秒，${pick.name[1]}跑 ${pick.dist} 公尺費時 ${pick.tSlow} 秒。若兩人同時出發且要同時到達終點，則${pick.name[0]}應從出發點退後多少公尺起跑？`
        );
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(h)}$ 公尺`,
            `兩人速率比為 ${pick.name[0]}：${pick.name[1]} $=\\dfrac{1}{${pick.tFast}}:\\dfrac{1}{${pick.tSlow}}=${pick.tSlow}:${pick.tFast}$。設${pick.name[0]}退後 $h$ 公尺，則${pick.name[0]}跑 $${pick.dist}+h$ 公尺，${pick.name[1]}跑 ${pick.dist} 公尺，時間相同可得 $\\dfrac{${pick.dist}+h}{${pick.tSlow}}=\\dfrac{${pick.dist}}{${pick.tFast}}$，解得 $h=${fractionToLatex(h)}$ 公尺。`
          )
        );
        continue;
      }

      // variant 3: 圓形操場同方向跑步，速率比已知，求相同距離下A到達B距終點多少
      const templates = [
        { dist: 200, va: 6, vb: 5, name: ['甲', '乙'] },
        { dist: 400, va: 7, vb: 6, name: ['甲', '乙'] },
        { dist: 600, va: 5, vb: 4, name: ['甲', '乙'] },
        { dist: 300, va: 4, vb: 3, name: ['甲', '乙'] },
        { dist: 500, va: 8, vb: 7, name: ['甲', '乙'] },
        { dist: 800, va: 3, vb: 2, name: ['甲', '乙'] },
      ];
      const pick = templates[cycle % templates.length];
      const bDist = simplifyFraction(pick.dist * pick.vb, pick.va);
      const behind = subFraction(makeFraction(pick.dist, 1), bDist);
      questions.push(
        `${pick.name[0]}、${pick.name[1]}兩人同時從同一地點出發，${pick.name[0]}的速率是${pick.name[1]}的 $\\dfrac{${pick.va}}{${pick.vb}}$ 倍，當${pick.name[0]}跑了 ${pick.dist} 公尺到達終點時，${pick.name[1]}距終點還有多少公尺？`
      );
      answers.push(
        formatJ232Answer(
          `$${fractionToLatex(behind)}$ 公尺`,
          `速率比為 $${pick.name[0]}:${pick.name[1]}=${pick.va}:${pick.vb}$，同時間內路程比也是 $${pick.va}:${pick.vb}$。${pick.name[0]}跑 ${pick.dist} 公尺時，${pick.name[1]}跑了 $${pick.dist}\\times\\dfrac{${pick.vb}}{${pick.va}}=${fractionToLatex(bDist)}$ 公尺，距終點還有 $${fractionToLatex(behind)}$ 公尺。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-3-2 新增：犬兔步距速率問題 ─────────────────────────────────────────
  function buildJ232DogRabbitSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;
      const cycle = Math.floor(i / 4);

      if (variant === 0) {
        // 求速率比：犬跑a步距=兔跳b步距，犬跑c步時=兔跳d步時
        const templates = [
          { a: 3, b: 4, c: 4, d: 5 },
          { a: 2, b: 3, c: 3, d: 4 },
          { a: 3, b: 5, c: 4, d: 5 },
          { a: 4, b: 5, c: 4, d: 3 },
          { a: 5, b: 6, c: 5, d: 4 },
          { a: 3, b: 4, c: 5, d: 6 },
        ];
        const pick = templates[cycle % templates.length];
        // 犬步距/兔步距 = b/a（犬a步 = 兔b步距離）
        // 同一時間內犬跑 c 步、兔跳 d 步，所以速率比 = (b/a) × (c/d) = bc:ad。
        const dogSpeed = pick.b * pick.c;
        const rabbitSpeed = pick.a * pick.d;
        const ratio = normalizeRatioInts(dogSpeed, rabbitSpeed);
        questions.push(
          `設犬跑 $${pick.a}$ 步的距離等於兔跳 $${pick.b}$ 步的距離，且犬跑 $${pick.c}$ 步的時間等於兔跳 $${pick.d}$ 步的時間，求犬與兔的速率比。`
        );
        answers.push(
          formatJ232Answer(
            `$${ratio.a}:${ratio.b}$`,
            `每步距離比：犬步距 $=\\dfrac{${pick.b}}{${pick.a}}$ 兔步距。同一時間內犬跑 $${pick.c}$ 步、兔跳 $${pick.d}$ 步。速率比 $=$ 每步距離比 $\\times$ 步頻比 $=\\dfrac{${pick.b}}{${pick.a}}\\times\\dfrac{${pick.c}}{${pick.d}}=\\dfrac{${pick.b * pick.c}}{${pick.a * pick.d}}$，即犬：兔 $=${ratio.a}:${ratio.b}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        // 兔先跑x公尺，犬需追多少公尺才追上
        const templates = [
          { a: 3, b: 4, c: 4, d: 5, head: 100 },
          { a: 2, b: 3, c: 3, d: 4, head: 120 },
          { a: 3, b: 5, c: 4, d: 5, head: 150 },
          { a: 4, b: 5, c: 4, d: 3, head: 200 },
          { a: 5, b: 6, c: 5, d: 4, head: 100 },
          { a: 3, b: 4, c: 5, d: 6, head: 80 },
        ];
        const pick = templates[cycle % templates.length];
        const dogSpeed = pick.b * pick.c;
        const rabbitSpeed = pick.a * pick.d;
        const ratio = normalizeRatioInts(dogSpeed, rabbitSpeed);
        // 速差比 = dogSpeed - rabbitSpeed（未化簡）
        // 設犬追上時犬跑 D，兔跑 D - head（兔有先跑優勢）
        // D/rabbitSpeed = (D - head)/rabbitSpeed → D * dogSpeed = (D - head 無解)
        // 正確：D/dog = (D - head)/rabbit (time same)
        // D * rabbit = (D - head) * dog
        // D * (rabbit - dog) = -head * dog  → D = head*dog/(dog-rabbit)
        const dogVal = pick.b * pick.c;
        const rabbitVal = pick.a * pick.d;
        const D = simplifyFraction(pick.head * dogVal, dogVal - rabbitVal);
        questions.push(
          `設犬跑 $${pick.a}$ 步的距離等於兔跳 $${pick.b}$ 步的距離，且犬跑 $${pick.c}$ 步的時間等於兔跳 $${pick.d}$ 步的時間（兩者均在同一直線上）。若兔先跑 $${pick.head}$ 公尺，則犬需跑多少公尺才能追上兔？`
        );
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(D)}$ 公尺`,
            `由前題知犬：兔的速率比為 $${ratio.a}:${ratio.b}$。設犬追上時跑了 $D$ 公尺，兔跑了 $D-${pick.head}$ 公尺，兩者時間相同：$\\dfrac{D}{${ratio.a}}=\\dfrac{D-${pick.head}}{${ratio.b}}$。解得 $D=${fractionToLatex(D)}$ 公尺。`
          )
        );
        continue;
      }

      if (variant === 2) {
        // 兔先跑x步，犬需追幾步
        const templates = [
          { a: 3, b: 4, c: 4, d: 5, headSteps: 100 },
          { a: 2, b: 3, c: 3, d: 4, headSteps: 90 },
          { a: 3, b: 5, c: 4, d: 5, headSteps: 100 },
          { a: 4, b: 5, c: 4, d: 3, headSteps: 120 },
          { a: 5, b: 6, c: 5, d: 4, headSteps: 80 },
          { a: 3, b: 4, c: 5, d: 6, headSteps: 60 },
        ];
        const pick = templates[cycle % templates.length];
        // 設兔步長為 a、犬步長為 b；同一時間犬跑 c 步、兔跳 d 步。
        // 因此相對速率為 bc-ad。兔先跑 headSteps 步時，犬需跑的步數為 headSteps·a·c/(bc-ad)。
        const numSteps = simplifyFraction(pick.headSteps * pick.a * pick.c, pick.b * pick.c - pick.a * pick.d);
        questions.push(
          `設犬跑 $${pick.a}$ 步的距離等於兔跳 $${pick.b}$ 步的距離，且犬跑 $${pick.c}$ 步的時間等於兔跳 $${pick.d}$ 步的時間。若兔先跑 $${pick.headSteps}$ 步，則犬需跑幾步才能追上兔？`
        );
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(numSteps)}$ 步`,
            `以「單位距離」計，設兔步長為 $${pick.a}$，則犬步長為 $${pick.b}$。兔先跑 ${pick.headSteps} 步，領先距離為 $${pick.headSteps}\\times ${pick.a}=${pick.headSteps * pick.a}$ 個單位。同一時間內，犬跑 ${pick.c} 步（距離 $${pick.b * pick.c}$），兔跑 ${pick.d} 步（距離 $${pick.a * pick.d}$），速率差為 $${pick.b * pick.c - pick.a * pick.d}$ 個單位。追上所需時間為 $\\dfrac{${pick.headSteps * pick.a}}{${pick.b * pick.c - pick.a * pick.d}}$ 個時間單位。犬的步數 $=\\dfrac{${pick.headSteps * pick.a}}{${pick.b * pick.c - pick.a * pick.d}}\\times ${pick.c}=${fractionToLatex(numSteps)}$ 步。`
          )
        );
        continue;
      }

      // variant 3: 兔先跑x分鐘，犬需追幾分鐘
      const templates = [
        { a: 3, b: 4, c: 4, d: 5, headMin: 100 },
        { a: 2, b: 3, c: 3, d: 4, headMin: 80 },
        { a: 3, b: 5, c: 4, d: 5, headMin: 150 },
        { a: 4, b: 5, c: 4, d: 3, headMin: 200 },
        { a: 5, b: 6, c: 5, d: 4, headMin: 120 },
        { a: 3, b: 4, c: 5, d: 6, headMin: 90 },
      ];
      const pick = templates[cycle % templates.length];
      const dogSpeed = pick.b * pick.c;
      const rabbitSpeed = pick.a * pick.d;
      // 兔先跑 headMin 分鐘，犬追上需要 T 分鐘
      // dogSpeed * T = rabbitSpeed * (headMin + T)
      // T * (dogSpeed - rabbitSpeed) = rabbitSpeed * headMin
      const T = simplifyFraction(pick.headMin * rabbitSpeed, dogSpeed - rabbitSpeed);
      const ratio = normalizeRatioInts(dogSpeed, rabbitSpeed);
      questions.push(
        `設犬跑 $${pick.a}$ 步的距離等於兔跳 $${pick.b}$ 步的距離，且犬跑 $${pick.c}$ 步的時間等於兔跳 $${pick.d}$ 步的時間。若兔先跑 $${pick.headMin}$ 分鐘，則犬需追幾分鐘才能追上兔？`
      );
      answers.push(
        formatJ232Answer(
          `$${fractionToLatex(T)}$ 分鐘`,
          `速率比為犬：兔 $=${ratio.a}:${ratio.b}$。設犬追 $T$ 分鐘追上，此時犬走了 $${ratio.a}$ 份，兔走了 $${ratio.b}$ 份（犬走的時間也是 $T$，兔總共走了 $T+${pick.headMin}$ 分鐘）：$${ratio.a}\\cdot T=${ratio.b}\\cdot(T+${pick.headMin})$，解得 $T=${fractionToLatex(T)}$ 分鐘。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ231VariableRatioPercentCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const templates = [
          { x: 3, y: 5, xUp: 25, yDown: 20 },
          { x: 4, y: 7, xUp: 50, yDown: 25 },
          { x: 5, y: 6, xUp: 20, yDown: 10 },
          { x: 2, y: 9, xUp: 40, yDown: 30 },
          { x: 7, y: 8, xUp: 10, yDown: 20 },
        ];
        const pick = templates[cycle % templates.length];
        const ratio = normalizeRatioInts(pick.x * (100 + pick.xUp), pick.y * (100 - pick.yDown));
        questions.push(
          `若原來 $x:y=${pick.x}:${pick.y}$，現在 $x$ 增加 $${pick.xUp}\\%$，且 $y$ 減少 $${pick.yDown}\\%$，求新的 $x:y$。`
        );
        answers.push(
          formatJ231Answer(
            `$${ratio.a}:${ratio.b}$`,
            `設原來 $x=${formatTerm(pick.x, 'k')},\\ y=${formatTerm(pick.y, 'k')}$。變動後為 $x'=${formatTerm(pick.x, 'k')}\\times\\dfrac{${100 + pick.xUp}}{100}$、$y'=${formatTerm(pick.y, 'k')}\\times\\dfrac{${100 - pick.yDown}}{100}$，所以新比為 $${pick.x * (100 + pick.xUp)}:${pick.y * (100 - pick.yDown)}=${ratio.a}:${ratio.b}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { boys: 5, girls: 4, boysDown: 10, girlsUp: 10 },
          { boys: 7, girls: 6, boysDown: 20, girlsUp: 25 },
          { boys: 8, girls: 5, boysDown: 25, girlsUp: 20 },
          { boys: 9, girls: 7, boysDown: 10, girlsUp: 30 },
          { boys: 6, girls: 5, boysDown: 15, girlsUp: 20 },
        ];
        const pick = templates[cycle % templates.length];
        const ratio = normalizeRatioInts(pick.boys * (100 - pick.boysDown), pick.girls * (100 + pick.girlsUp));
        questions.push(
          `已知男生、女生薪資比為 $${pick.boys}:${pick.girls}$。若男生減薪 $${pick.boysDown}\\%$、女生加薪 $${pick.girlsUp}\\%$，求調整後男、女生薪資比。`
        );
        answers.push(
          formatJ231Answer(
            `$${ratio.a}:${ratio.b}$`,
            `設原薪資為男生 $${formatTerm(pick.boys, 'k')}$、女生 $${formatTerm(pick.girls, 'k')}$。調整後比為 $${pick.boys}(100-${pick.boysDown}):${pick.girls}(100+${pick.girlsUp})=${pick.boys * (100 - pick.boysDown)}:${pick.girls * (100 + pick.girlsUp)}=${ratio.a}:${ratio.b}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const templates = [
          { up: 20, discount: 8 },
          { up: 25, discount: 8 },
          { up: 10, discount: 9 },
          { up: 50, discount: 7 },
          { up: 30, discount: 8 },
        ];
        const pick = templates[cycle % templates.length];
        const ratio = normalizeRatioInts((100 + pick.up) * pick.discount, 1000);
        questions.push(
          `某商品原價為 $x$ 元，先調漲 $${pick.up}\\%$ 後再打 ${pick.discount} 折，求最後售價與原價的比。`
        );
        answers.push(
          formatJ231Answer(
            `$${ratio.a}:${ratio.b}$`,
            `調漲 $${pick.up}\\%$ 是乘 $\\dfrac{${100 + pick.up}}{100}$，打 ${pick.discount} 折是乘 $\\dfrac{${pick.discount}}{10}$。最後售價：原價 $=${(100 + pick.up) * pick.discount}:1000=${ratio.a}:${ratio.b}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const templates = [
          { xTimes: 2, yTimes: 4 },
          { xTimes: 3, yTimes: 2 },
          { xTimes: 5, yTimes: 3 },
          { xTimes: 4, yTimes: 5 },
          { xTimes: 6, yTimes: 2 },
        ];
        const pick = templates[cycle % templates.length];
        const zFactor = simplifyFraction(pick.xTimes, pick.yTimes * pick.yTimes);
        questions.push(
          `若 $z$ 與 $x$ 成正比，且 $z$ 與 $y^2$ 成反比。當 $x$ 變為原來的 ${pick.xTimes} 倍且 $y$ 變為原來的 ${pick.yTimes} 倍時，$z$ 變為原來的幾倍？`
        );
        answers.push(
          formatJ231Answer(
            `$${fractionToLatex(zFactor)}$ 倍`,
            `$z$ 與 $x$ 成正比，所以 $x$ 使 $z$ 乘上 ${pick.xTimes}；$z$ 與 $y^2$ 成反比，所以 $y$ 變 ${pick.yTimes} 倍會使 $z$ 再乘上 $\\dfrac{1}{${pick.yTimes}^2}$。因此總倍數為 $\\dfrac{${pick.xTimes}}{${pick.yTimes * pick.yTimes}}=${fractionToLatex(zFactor)}$。`
          )
        );
        continue;
      }

      const templates = [
        { aConc: 10, bConc: 15, aWeight: 2, bWeight: 3 },
        { aConc: 8, bConc: 20, aWeight: 3, bWeight: 5 },
        { aConc: 12, bConc: 18, aWeight: 4, bWeight: 1 },
        { aConc: 5, bConc: 25, aWeight: 2, bWeight: 3 },
        { aConc: 16, bConc: 24, aWeight: 5, bWeight: 2 },
      ];
      const pick = templates[cycle % templates.length];
      const conc = simplifyFraction(pick.aConc * pick.aWeight + pick.bConc * pick.bWeight, pick.aWeight + pick.bWeight);
      questions.push(
        `$A$ 牌與 $B$ 牌果汁的濃度分別為 $${pick.aConc}\\%$ 與 $${pick.bConc}\\%$。若按重量比 $${pick.aWeight}:${pick.bWeight}$ 混合，求混合後的新濃度。`
      );
      answers.push(
        formatJ231Answer(
          `$${fractionToLatex(conc)}\\%$`,
          `設兩種果汁重量分別為 $${formatTerm(pick.aWeight, 'k')}$、$${formatTerm(pick.bWeight, 'k')}$。果汁原液量共有 $${formatTerm(pick.aWeight, 'k')}\\times ${pick.aConc}\\%+${formatTerm(pick.bWeight, 'k')}\\times ${pick.bConc}\\%$，總重量是 $${formatTerm(pick.aWeight + pick.bWeight, 'k')}$，所以濃度為 $\\dfrac{${pick.aConc * pick.aWeight}+${pick.bConc * pick.bWeight}}{${pick.aWeight + pick.bWeight}}\\%=${fractionToLatex(conc)}\\%$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ232PowerGeometryModelsCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const pairs = [
          { a: 9, b: 16, rootA: 3, rootB: 4 },
          { a: 25, b: 36, rootA: 5, rootB: 6 },
          { a: 16, b: 49, rootA: 4, rootB: 7 },
          { a: 4, b: 25, rootA: 2, rootB: 5 },
          { a: 36, b: 81, rootA: 6, rootB: 9 },
        ];
        const pick = pairs[cycle % pairs.length];
        const ratio = normalizeRatioInts(pick.rootA, pick.rootB);
        questions.push(`兩個圓的面積比為 $${pick.a}:${pick.b}$，求它們的直徑比與周長比。`);
        answers.push(
          formatJ232Answer(
            `$${ratio.a}:${ratio.b}$、$${ratio.a}:${ratio.b}$`,
            `圓面積與半徑平方成正比，所以半徑比為 $\\sqrt{${pick.a}}:\\sqrt{${pick.b}}=${pick.rootA}:${pick.rootB}$，化簡得 $${ratio.a}:${ratio.b}$。直徑與周長都和半徑成正比，所以直徑比、周長比也都是 $${ratio.a}:${ratio.b}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const pairs = [
          { a: 2, b: 3 },
          { a: 3, b: 4 },
          { a: 4, b: 5 },
          { a: 2, b: 5 },
          { a: 5, b: 6 },
        ];
        const pick = pairs[cycle % pairs.length];
        const areaRatio = normalizeRatioInts(pick.a * pick.a, pick.b * pick.b);
        const volumeRatio = normalizeRatioInts(pick.a ** 3, pick.b ** 3);
        questions.push(`兩個正方體的邊長比為 $${pick.a}:${pick.b}$，求表面積比與體積比。`);
        answers.push(
          formatJ232Answer(
            `表面積比 $${areaRatio.a}:${areaRatio.b}$，體積比 $${volumeRatio.a}:${volumeRatio.b}$`,
            `表面積與邊長平方成正比，所以表面積比為 $${pick.a}^2:${pick.b}^2=${areaRatio.a}:${areaRatio.b}$。體積與邊長三次方成正比，所以體積比為 $${pick.a}^3:${pick.b}^3=${volumeRatio.a}:${volumeRatio.b}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const templates = [
          { weight: 10, value: 200, parts: [2, 3, 5] },
          { weight: 12, value: 432, parts: [1, 2, 3] },
          { weight: 15, value: 900, parts: [2, 3, 4] },
          { weight: 18, value: 648, parts: [1, 2, 6] },
          { weight: 20, value: 800, parts: [3, 4, 5] },
        ];
        const pick = templates[cycle % templates.length];
        const sumSq = pick.parts.reduce((sum, part) => sum + part * part, 0);
        const totalPart = pick.parts.reduce((sum, part) => sum + part, 0);
        const remainValue = simplifyFraction(pick.value * sumSq, totalPart * totalPart);
        const loss = subFraction(makeFraction(pick.value, 1), remainValue);
        questions.push(
          `某寶石價值與重量的平方成正比。若一顆 ${pick.weight} 克寶石價值 ${pick.value} 萬元，不慎裂成重量比 $${pick.parts.join(':')}$ 的三塊，問總價值損失多少萬元？`
        );
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(loss)}$ 萬元`,
            `設三塊重量分別為 $${pick.parts.map((part) => formatTerm(part, 'k')).join(', ')}$，原重量為 $${formatTerm(totalPart, 'k')}$。價值與重量平方成正比，所以裂後總價值占原價的 $\\dfrac{${pick.parts.map((part) => `${part}^2`).join('+')}}{${totalPart}^2}=\\dfrac{${sumSq}}{${totalPart * totalPart}}$。裂後總價值為 $${pick.value}\\times\\dfrac{${sumSq}}{${totalPart * totalPart}}=${fractionToLatex(remainValue)}$ 萬元，損失 $${pick.value}-${fractionToLatex(remainValue)}=${fractionToLatex(loss)}$ 萬元。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const templates = [
          { t0: 2, d0: 20, t1: 5 },
          { t0: 3, d0: 45, t1: 7 },
          { t0: 4, d0: 80, t1: 6 },
          { t0: 5, d0: 125, t1: 8 },
          { t0: 2, d0: 18, t1: 6 },
        ];
        const pick = templates[cycle % templates.length];
        const d1 = simplifyFraction(pick.d0 * pick.t1 * pick.t1, pick.t0 * pick.t0);
        questions.push(
          `自由落體下墜距離 $d$ 與時間 $t$ 的平方成正比。若 ${pick.t0} 秒下墜 ${pick.d0} 公尺，則 ${pick.t1} 秒共下墜多少公尺？`
        );
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(d1)}$ 公尺`,
            `因為 $d\\propto t^2$，所以 $\\dfrac{d_1}{${pick.d0}}=\\dfrac{${pick.t1}^2}{${pick.t0}^2}$。故 $d_1=${pick.d0}\\times\\dfrac{${pick.t1 * pick.t1}}{${pick.t0 * pick.t0}}=${fractionToLatex(d1)}$ 公尺。`
          )
        );
        continue;
      }

      const templates = [
        { factor: makeFraction(1, 2) },
        { factor: makeFraction(2, 3) },
        { factor: makeFraction(3, 4) },
        { factor: makeFraction(3, 5) },
        { factor: makeFraction(4, 5) },
      ];
      const pick = templates[cycle % templates.length];
      const surface = mulFraction(pick.factor, pick.factor);
      const volume = mulFraction(surface, pick.factor);
      questions.push(
        `球體表面積與半徑平方成正比，體積與半徑三次方成正比。若半徑縮為原來的 $${fractionToLatex(pick.factor)}$，求表面積與體積各變為原來的幾分之幾。`
      );
      answers.push(
        formatJ232Answer(
          `表面積 $${fractionToLatex(surface)}$，體積 $${fractionToLatex(volume)}$`,
          `半徑乘上 $${fractionToLatex(pick.factor)}$ 時，表面積要乘上它的平方：$(${fractionToLatex(pick.factor)})^2=${fractionToLatex(surface)}$；體積要乘上它的三次方：$(${fractionToLatex(pick.factor)})^3=${fractionToLatex(volume)}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ232CrossVariationChainCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const templates = [
          { x0: 5, z0: 10, x1: 20 },
          { x0: 4, z0: 6, x1: 12 },
          { x0: 3, z0: 15, x1: 9 },
          { x0: 6, z0: 8, x1: 15 },
          { x0: 8, z0: 14, x1: 28 },
        ];
        const pick = templates[cycle % templates.length];
        const z1 = simplifyFraction(pick.z0 * pick.x1, pick.x0);
        questions.push(
          `若 $x$ 與 $y$ 成正比，且 $y$ 與 $z$ 成正比。當 $x=${pick.x0},\\ z=${pick.z0}$ 時，若 $x$ 變為 ${pick.x1}，求 $z$ 的值。`
        );
        answers.push(
          formatJ232Answer(
            `$z=${fractionToLatex(z1)}$`,
            `$x$ 與 $y$ 成正比、$y$ 與 $z$ 成正比，所以 $z$ 也與 $x$ 成正比。$x$ 從 ${pick.x0} 變為 ${pick.x1}，倍數是 $\\dfrac{${pick.x1}}{${pick.x0}}$，因此 $z=${pick.z0}\\times\\dfrac{${pick.x1}}{${pick.x0}}=${fractionToLatex(z1)}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const times = [2, 3, 4, 5, 6][cycle % 5];
        questions.push(`已知 $x$ 與 $y^2$ 成正比。當 $y$ 變為原來的 ${times} 倍時，$x$ 變為原來的幾倍？`);
        answers.push(
          formatJ232Answer(
            `${times * times} 倍`,
            `$x$ 與 $y^2$ 成正比，所以 $y$ 變 ${times} 倍時，$y^2$ 變成 $${times}^2=${times * times}$ 倍，因此 $x$ 也變為原來的 ${times * times} 倍。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const templates = [
          { ab: [2, 3], bc: [4, 5], ad: [3, 2], c: 15 },
          { ab: [3, 4], bc: [5, 6], ad: [2, 1], c: 18 },
          { ab: [2, 5], bc: [3, 4], ad: [5, 3], c: 20 },
          { ab: [4, 5], bc: [2, 3], ad: [3, 1], c: 12 },
          { ab: [3, 7], bc: [5, 8], ad: [4, 3], c: 24 },
        ];
        const pick = templates[cycle % templates.length];
        const b = simplifyFraction(pick.bc[0] * pick.c, pick.bc[1]);
        const a = mulFraction(b, makeFraction(pick.ab[0], pick.ab[1]));
        const d = mulFraction(a, makeFraction(pick.ad[1], pick.ad[0]));
        questions.push(
          `設 $A:B=${pick.ab[0]}:${pick.ab[1]}$，$B:C=${pick.bc[0]}:${pick.bc[1]}$，且 $A:D=${pick.ad[0]}:${pick.ad[1]}$。若 $C=${pick.c}$，求 $A$ 與 $D$。`
        );
        answers.push(
          formatJ232Answer(
            `$A=${fractionToLatex(a)}$，$D=${fractionToLatex(d)}$`,
            `由 $B:C=${pick.bc[0]}:${pick.bc[1]}$ 且 $C=${pick.c}$，得 $B=${fractionToLatex(b)}$。再由 $A:B=${pick.ab[0]}:${pick.ab[1]}$，得 $A=${fractionToLatex(a)}$。最後由 $A:D=${pick.ad[0]}:${pick.ad[1]}$，得 $D=${fractionToLatex(d)}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const templates = [
          { people: 6, days: 20, add: 2 },
          { people: 8, days: 18, add: 4 },
          { people: 10, days: 24, add: 5 },
          { people: 12, days: 15, add: 3 },
          { people: 9, days: 30, add: 6 },
        ];
        const pick = templates[cycle % templates.length];
        const newDays = simplifyFraction(pick.people * pick.days, pick.people + pick.add);
        const ahead = subFraction(makeFraction(pick.days, 1), newDays);
        questions.push(
          `一項工程固定，原由 ${pick.people} 人合作需 ${pick.days} 天完工。若開工時增加 ${pick.add} 人加入，則可提前幾天完工？`
        );
        answers.push(
          formatJ232Answer(
            `$${fractionToLatex(ahead)}$ 天`,
            `總工量固定，所以人數與天數成反比。新天數為 $\\dfrac{${pick.people}\\times ${pick.days}}{${pick.people + pick.add}}=${fractionToLatex(newDays)}$ 天，因此提前 $${pick.days}-${fractionToLatex(newDays)}=${fractionToLatex(ahead)}$ 天。`
          )
        );
        continue;
      }

      const templates = [
        { x0: 4, y0: 10, y1: 5 },
        { x0: 5, y0: 12, y1: 8 },
        { x0: 6, y0: 20, y1: 10 },
        { x0: 8, y0: 18, y1: 6 },
        { x0: 10, y0: 24, y1: 16 },
      ];
      const pick = templates[cycle % templates.length];
      const k = simplifyFraction(pick.y0, pick.x0 - 2);
      const x1 = addFraction(divFraction(makeFraction(pick.y1, 1), k), makeFraction(2, 1));
      questions.push(
        `若 $y$ 與 $(x-2)$ 成正比，且 $x=${pick.x0}$ 時 $y=${pick.y0}$，求當 $y=${pick.y1}$ 時的 $x$ 值。`
      );
      answers.push(
        formatJ232Answer(
          `$x=${fractionToLatex(x1)}$`,
          `由正比可設 $y=k(x-2)$。代入 $x=${pick.x0},\\ y=${pick.y0}$ 得 $k=\\dfrac{${pick.y0}}{${pick.x0}-2}=${fractionToLatex(k)}$。當 $y=${pick.y1}$ 時，$${pick.y1}=${fractionToLatex(k)}(x-2)$，解得 $x=${fractionToLatex(x1)}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ231ConstrainedApplicationsCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const templates = [
          { boys: 5, girls: 4, unit: 12, move: 10 },
          { boys: 7, girls: 5, unit: 8, move: 6 },
          { boys: 4, girls: 3, unit: 15, move: 9 },
          { boys: 6, girls: 5, unit: 10, move: 8 },
          { boys: 8, girls: 7, unit: 6, move: 5 },
        ];
        const pick = templates[cycle % templates.length];
        const originalBoys = pick.boys * pick.unit;
        const originalGirls = pick.girls * pick.unit;
        const newRatio = normalizeRatioInts(originalBoys + pick.move, originalGirls - pick.move);
        questions.push(
          `某校男、女生比為 $${pick.boys}:${pick.girls}$。若轉入 ${pick.move} 個男生、轉出 ${pick.move} 個女生後，比變為 $${newRatio.a}:${newRatio.b}$，求原有人數。`
        );
        answers.push(
          formatJ231Answer(
            `${originalBoys + originalGirls} 人`,
            `設原本男、女生分別為 $${pick.boys}k$、$${pick.girls}k$。依題意 $(${pick.boys}k+${pick.move}):(${pick.girls}k-${pick.move})=${newRatio.a}:${newRatio.b}$，解得 $k=${pick.unit}$。因此原有人數為 $${pick.boys * pick.unit}+${pick.girls * pick.unit}=${originalBoys + originalGirls}$ 人。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { total: 300, start: 10, target: 25 },
          { total: 240, start: 12, target: 20 },
          { total: 360, start: 15, target: 30 },
          { total: 400, start: 8, target: 20 },
          { total: 280, start: 10, target: 24 },
        ];
        const pick = templates[cycle % templates.length];
        const solute = simplifyFraction(pick.total * pick.start, 100);
        const add = divFraction(
          subFraction(simplifyFraction(pick.target * pick.total, 100), solute),
          simplifyFraction(100 - pick.target, 100)
        );
        questions.push(
          `${pick.total} 公克、濃度 $${pick.start}\\%$ 的食鹽水，若要加入食鹽使濃度變為 $${pick.target}\\%$，需加入多少公克食鹽？`
        );
        answers.push(
          formatJ231Answer(
            `$${fractionToLatex(add)}$ 公克`,
            `原有食鹽 $${pick.total}\\times ${pick.start}\\%=${fractionToLatex(solute)}$ 公克。設加入食鹽 $s$ 公克，則 $\\dfrac{${fractionToLatex(solute)}+s}{${pick.total}+s}=${pick.target}\\%$，解得 $s=${fractionToLatex(add)}$ 公克。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const templates = [
          { aTime: 4, bTime: 3, target: 2 },
          { aTime: 5, bTime: 4, target: 2 },
          { aTime: 6, bTime: 4, target: 3 },
          { aTime: 7, bTime: 5, target: 2 },
          { aTime: 8, bTime: 6, target: 3 },
        ];
        const pick = templates[cycle % templates.length];
        const time = simplifyFraction(
          (pick.target - 1) * pick.aTime * pick.bTime,
          pick.target * pick.aTime - pick.bTime
        );
        questions.push(
          `兩條等長蠟燭，甲 ${pick.aTime} 小時燒完，乙 ${pick.bTime} 小時燒完。若同時點燃，經過多久後，甲剩餘長度是乙的 ${pick.target} 倍？`
        );
        answers.push(
          formatJ231Answer(
            `$${fractionToLatex(time)}$ 小時`,
            `設經過 $t$ 小時。甲剩下 $1-\\dfrac{t}{${pick.aTime}}$，乙剩下 $1-\\dfrac{t}{${pick.bTime}}$。依題意 $1-\\dfrac{t}{${pick.aTime}}=${pick.target}\\left(1-\\dfrac{t}{${pick.bTime}}\\right)$，解得 $t=${fractionToLatex(time)}$ 小時。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const templates = [
          { aTeeth: 48, bTeeth: 32, aTurns: 100 },
          { aTeeth: 36, bTeeth: 24, aTurns: 80 },
          { aTeeth: 60, bTeeth: 45, aTurns: 90 },
          { aTeeth: 72, bTeeth: 48, aTurns: 50 },
          { aTeeth: 40, bTeeth: 25, aTurns: 75 },
        ];
        const pick = templates[cycle % templates.length];
        const bTurns = simplifyFraction(pick.aTurns * pick.aTeeth, pick.bTeeth);
        questions.push(
          `甲、乙兩齒輪互相咬合。甲輪有 ${pick.aTeeth} 齒，乙輪有 ${pick.bTeeth} 齒。當甲輪轉動 ${pick.aTurns} 圈時，乙輪轉動幾圈？`
        );
        answers.push(
          formatJ231Answer(
            `$${fractionToLatex(bTurns)}$ 圈`,
            `咬合齒數相同，所以「齒數 $\\times$ 圈數」固定。設乙輪轉 $r$ 圈，則 $${pick.aTeeth}\\times ${pick.aTurns}=${pick.bTeeth}r$，解得 $r=${fractionToLatex(bTurns)}$ 圈。`
          )
        );
        continue;
      }

      const templates = [
        { ratio: [3, 4, 5], more: 20 },
        { ratio: [2, 5, 7], more: 30 },
        { ratio: [4, 5, 9], more: 25 },
        { ratio: [5, 6, 8], more: 15 },
        { ratio: [3, 7, 10], more: 28 },
      ];
      const pick = templates[cycle % templates.length];
      const unit = simplifyFraction(pick.more, pick.ratio[2] - pick.ratio[0]);
      const bProfit = mulFraction(makeFraction(pick.ratio[1], 1), unit);
      questions.push(
        `甲、乙、丙三人投資比為 $${pick.ratio.join(':')}$，年底獲利按投資比分配。若丙比甲多得 ${pick.more} 萬元，求乙分得多少萬元。`
      );
      answers.push(
        formatJ231Answer(
          `$${fractionToLatex(bProfit)}$ 萬元`,
          `丙比甲多 $${pick.ratio[2]}-${pick.ratio[0]}=${pick.ratio[2] - pick.ratio[0]}$ 份，對應 ${pick.more} 萬元，所以 1 份為 $${fractionToLatex(unit)}$ 萬元。乙有 ${pick.ratio[1]} 份，因此乙分得 $${pick.ratio[1]}\\times ${fractionToLatex(unit)}=${fractionToLatex(bProfit)}$ 萬元。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ232FunctionCoordinateProportionCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const a = [2, 3, 4, 5, 6][cycle % 5];
        const x0 = [1, 2, 3, 4, 5][(cycle * 2) % 5];
        const y0 = a * x0;
        questions.push(
          `線型函數 $f(x)=ax+b$ 通過原點，且通過點 $(${x0},${y0})$。求 $a,b$，並判斷 $f(x)$ 與 $x$ 是否成正比。`
        );
        answers.push(
          formatJ232Answer(
            `$a=${a},\\ b=0$，成正比`,
            `通過原點代表 $b=0$。又通過 $(${x0},${y0})$，所以 $${y0}=a\\times ${x0}$，得 $a=${a}$。因此 $f(x)=${a}x$，符合 $y=kx$，所以 $f(x)$ 與 $x$ 成正比。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const m = [2, 3, 4, 5, 6][cycle % 5];
        const x1 = [3, 4, 5, 6, 7][cycle % 5];
        const y1 = m * x1;
        questions.push(
          `在坐標平面上，點 $(x,y)$ 在直線 $y=${m}x$ 上移動。若 $x=${x1}$，求 $y$，並判斷 $y$ 與 $x$ 的關係。`
        );
        answers.push(
          formatJ232Answer(
            `$y=${y1}$，成正比`,
            `直線方程式 $y=${m}x$ 已經是 $y=kx$ 的形式，所以 $y$ 與 $x$ 成正比。當 $x=${x1}$ 時，$y=${m}\\times ${x1}=${y1}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const templates = [
          { b1: 3, h1: 4, b2: 6, h2: 5 },
          { b1: 5, h1: 6, b2: 8, h2: 3 },
          { b1: 4, h1: 7, b2: 10, h2: 2 },
          { b1: 6, h1: 5, b2: 9, h2: 4 },
          { b1: 7, h1: 3, b2: 5, h2: 8 },
        ];
        const pick = templates[cycle % templates.length];
        const ratio = normalizeRatioInts(pick.b1 * pick.h1, pick.b2 * pick.h2);
        questions.push(
          `已知兩個三角形的頂點分別為 $O(0,0),A(${pick.b1},0),B(0,${pick.h1})$ 與 $O(0,0),C(${pick.b2},0),D(0,${pick.h2})$，求兩三角形面積比。`
        );
        answers.push(
          formatJ232Answer(
            `$${ratio.a}:${ratio.b}$`,
            `兩個都是直角三角形，面積比為 $\\dfrac12\\times ${pick.b1}\\times ${pick.h1}:\\dfrac12\\times ${pick.b2}\\times ${pick.h2}$。共同的 $\\dfrac12$ 可約掉，所以面積比為 $${pick.b1 * pick.h1}:${pick.b2 * pick.h2}=${ratio.a}:${ratio.b}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const templates = [
          { bx: 6, ay: 4 },
          { bx: 8, ay: 6 },
          { bx: 10, ay: 5 },
          { bx: 12, ay: 9 },
          { bx: 14, ay: 7 },
        ];
        const pick = templates[cycle % templates.length];
        const ratio = normalizeRatioInts(-pick.bx, pick.ay);
        questions.push(`若 $A(x,${pick.ay})$ 與 $B(${pick.bx},y)$ 關於 $y$ 軸對稱，求 $x:y$ 的最簡整數比。`);
        answers.push(
          formatJ232Answer(
            `$${ratio.a}:${ratio.b}$`,
            `關於 $y$ 軸對稱時，$x$ 坐標互為相反數、$y$ 坐標相同。所以 $x=-${pick.bx},\\ y=${pick.ay}$，因此 $x:y=${-pick.bx}:${pick.ay}=${ratio.a}:${ratio.b}$。`
          )
        );
        continue;
      }

      const templates = [
        { ratio: [2, 3, 4], total: 18, addX: 1, subY: 1 },
        { ratio: [3, 4, 5], total: 24, addX: 2, subY: 1 },
        { ratio: [4, 5, 6], total: 30, addX: 1, subY: 2 },
        { ratio: [2, 5, 7], total: 28, addX: 3, subY: 2 },
        { ratio: [5, 6, 7], total: 36, addX: 1, subY: 3 },
      ];
      const pick = templates[cycle % templates.length];
      const unit = pick.total / pick.ratio.reduce((sum, value) => sum + value, 0);
      const x = pick.ratio[0] * unit;
      const y = pick.ratio[1] * unit;
      const z = pick.ratio[2] * unit;
      const ratio = normalizeRatioInts3(x + pick.addX, y - pick.subY, z);
      questions.push(
        `若 $x:y:z=${pick.ratio.join(':')}$，且 $x+y+z=${pick.total}$，求 $(x+${pick.addX}):(y-${pick.subY}):z$ 的最簡整數比。`
      );
      answers.push(
        formatJ232Answer(
          `$${ratio.a}:${ratio.b}:${ratio.c}$`,
          `總份數為 ${pick.ratio.reduce((sum, value) => sum + value, 0)}，所以 1 份是 ${unit}。因此 $x=${x},\\ y=${y},\\ z=${z}$。代入得 $(x+${pick.addX}):(y-${pick.subY}):z=${x + pick.addX}:${y - pick.subY}:${z}=${ratio.a}:${ratio.b}:${ratio.c}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ241ParamPositiveTrapCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function countIntegersBetween(low, high) {
      const start = Math.ceil(low);
      const end = Math.floor(high);
      return Math.max(0, end - start + 1);
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const a = [1, 2][cycle % 2];
        const rhs = [4, 6, 8, 10, 12][cycle % 5];
        const bound = makeFraction(rhs, a - 3);
        questions.push(`若 $(a-3)x>${rhs}$ 的解為 $x<${fractionToLatex(bound, true)}$，求正整數 $a$。`);
        answers.push(
          formatJ241Answer(
            `$a=${a}$`,
            `解的方向變成 $x<\\cdots$，代表除以的係數 $a-3$ 為負，所以 $a<3$。又 $a$ 為正整數，只有 $a=1,2$ 可檢查。代入可得 $a=${a}$ 時界線為 $${fractionToLatex(bound, true)}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const boundary = [2, 3, 4, 5, 6, 7, 8][cycle % 7];
        const a = -[1, 2, 3, 4, 5, 6, 7][cycle % 7];
        const b = boundary * a;
        questions.push(
          `已知關於 $x$ 的不等式 $ax+b>0$ 的解為 $x<-${boundary}$，判斷 $a$ 的正負號，並寫出 $a$ 與 $b$ 的關係。`
        );
        answers.push(
          formatJ241Answer(
            `$a<0$，$b=${boundary}a$`,
            `由 $ax+b>0$ 得 $ax>-b$。解為 $x<-${boundary}$ 表示除以 $a$ 時不等號變向，所以 $a<0$。界線是 $-\\dfrac{b}{a}=-${boundary}$，因此 $b=${boundary}a$。例如 $a=${a}, b=${b}$ 就符合。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const rhsCoef = [2, 3, 4, 5, 6][cycle % 5];
        const rightConst = [5, 7, 9, 11, 13][cycle % 5];
        const leftConst = randInt(1, rightConst + rhsCoef - 1);
        questions.push(`若 $k(x-1)\\le ${rhsCoef}x+${rightConst}$ 的解為全體實數，求 $k$ 的值。`);
        answers.push(
          formatJ241Answer(
            `$k=${rhsCoef}$`,
            `整理得 $(k-${rhsCoef})x\\le ${rightConst}+k$。要讓所有 $x$ 都成立，$x$ 的係數必須為 $0$，所以 $k=${rhsCoef}$。此時不等式變成 $-${rhsCoef}\\le ${rightConst}$，確實恆成立。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const options = [
          { a: 2, center: -3, radius: 5 },
          { a: 3, center: -2, radius: 4 },
          { a: 4, center: 1, radius: 6 },
          { a: 5, center: 2, radius: 3 },
          { a: 6, center: -1, radius: 4 },
          { a: 2, center: 4, radius: 6 },
          { a: 3, center: 3, radius: 5 },
        ];
        const pick = options[cycle % options.length];
        const b = -pick.a * pick.center;
        const r = pick.a * pick.radius;
        const low = pick.center - pick.radius;
        const high = pick.center + pick.radius;
        const total = countIntegersBetween(low, high);
        questions.push(`已知 $|${formatLinearExpr(pick.a, b)}|\\le ${r}$ 的整數解共有幾個？`);
        answers.push(
          formatJ241Answer(
            `${total} 個`,
            `先去絕對值：$-${r}\\le ${formatLinearExpr(pick.a, b)}\\le ${r}$。整理得 $${low}\\le x\\le ${high}$，其中整數共有 ${total} 個。`
          )
        );
        continue;
      }

      const a = [1, 2, 3, 4, 5][cycle % 5];
      const b = [2, 3, 4, 5, 6][cycle % 5];
      const threshold = 6 + 3 * a + 2 * b;
      questions.push(
        `若不等式 $\\dfrac{x-a}{2}-\\dfrac{x+b}{3}>1$ 的解為 $x>${threshold}$，且 $a=${a}$，求 $b$ 與 $a+b$。`
      );
      answers.push(
        formatJ241Answer(
          `$b=${b}$，$a+b=${a + b}$`,
          `兩邊同乘以 $6$，得 $3(x-a)-2(x+b)>6$，整理為 $x>6+3a+2b$。題目給界線 $${threshold}$，所以 $3a+2b=${threshold - 6}$。又 $a=${a}$，代入得 $b=${b}$，故 $a+b=${a + b}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ241CompoundIntegerCountingCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const center = [3, 4, 5, 6, 7][cycle % 5];
        const radius = [2, 3, 4, 5, 6][cycle % 5];
        const low = center - radius;
        const high = center + radius;
        const countInt = high - low + 1;
        questions.push(
          `同時滿足 $\\dfrac{x-1}{2}>\\dfrac{x-2}{3}$ 與 $|x-${center}|\\le ${radius}$ 的整數解共有幾個？`
        );
        answers.push(
          formatJ241Answer(
            `${countInt} 個`,
            `第一個不等式整理得 $3x-3>2x-4$，所以 $x>-1$。第二個不等式得 $${low}\\le x\\le ${high}$。兩者交集仍為 $${low}\\le x\\le ${high}$，整數共有 ${countInt} 個。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const a = [0, 1, 2, 3, 4][cycle % 5];
        const high = a + 4;
        questions.push(
          `若關於 $x$ 的不等式組 $\\begin{cases}x-1\\le ${high - 1}\\\\ x>a\\end{cases}$ 恰有 4 個整數解，求 $a$ 的範圍。`
        );
        answers.push(
          formatJ241Answer(
            `$${a}\\le a<${a + 1}$`,
            `由第一式得 $x\\le ${high}$，第二式為 $x>a$。若整數解恰為 ${a + 1}、${a + 2}、${a + 3}、${a + 4}，則 $a$ 必須滿足 $${a}\\le a<${a + 1}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const c = [2, 3, 4, 5, 6][cycle % 5];
        const d = [5, 7, 8, 10, 11][cycle % 5];
        const firstBound = 2 * c;
        const secondBound = 3 * d - 4 * c;
        const bound = Math.min(firstBound, secondBound);
        questions.push(`解不等式：$\\dfrac{x}{2}<\\dfrac{x+${c}}{3}<\\dfrac{x+${d}}{4}$。`);
        answers.push(
          formatJ241Answer(
            `$x<${bound}$`,
            `分別解兩段：$\\dfrac{x}{2}<\\dfrac{x+${c}}{3}$ 得 $x<${firstBound}$；$\\dfrac{x+${c}}{3}<\\dfrac{x+${d}}{4}$ 得 $x<${secondBound}$。兩個條件要同時成立，所以取較嚴格的上界，得 $x<${bound}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const m = [3, 4, 5, 6, 7][cycle % 5];
        const rhs = m - 6;
        const rhsExpr = formatLinearExpr(2, rhs);
        questions.push(`已知 $x$ 為實數，且滿足 $3(x-2)\\ge ${rhsExpr}$，求 $x$ 的最小值。`);
        answers.push(
          formatJ241Answer(`$x=${m}$`, `展開得 $3x-6\\ge ${rhsExpr}$，移項後 $x\\ge ${m}$。因此 $x$ 的最小值為 ${m}。`)
        );
        continue;
      }

      const center = [5, 6, 7, 8, 9][cycle % 5];
      const radius = [2, 3, 4, 5, 6][cycle % 5];
      const values = [];
      for (let x = center - radius; x <= center + radius; x += 1) {
        if (Math.abs(x - center) >= 1 && Math.abs(x - center) <= radius) values.push(x);
      }
      const sum = values.reduce((total, value) => total + value, 0);
      questions.push(`求滿足 $1<|2x-${2 * center}|<${2 * radius + 1}$ 的所有整數 $x$ 之和。`);
      answers.push(
        formatJ241Answer(
          `$${sum}$`,
          `不等式表示 $2x$ 與 ${2 * center} 的距離大於 1 且小於 $${2 * radius + 1}$，也就是 $1\\le |x-${center}|\\le ${radius}$。整數解為 ${values.join('、')}，其和為 ${sum}。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  /*  function buildJ242LogicApplicationsCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const total = [31, 35, 39, 43, 47][cycle % 5];
        const minVote = Math.floor(total / 3) + 1;
        questions.push(
          `保證當選題：班級 ${total} 人選 3 位模範生，採單記投票法。阿文目前得 $x$ 票，剩下票數尚未開出，問 $x$ 至少要多少才能保證當選？`
        );
        answers.push(
          formatJ242Answer(
            `${minVote} 票`,
            `若阿文得 $x$ 票，剩下 $${total}-x$ 票分給其他候選人。要讓阿文不保證在前三名，至少要有 3 人各得到 $x$ 票，所以需 $${total}-x\\ge 3x$。要保證當選就要 $${total}-x<3x$，得 $x>${fractionToLatex(makeFraction(total, 4), true)}$，因此至少 ${minVote} 票。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const unplaced = [12, 14, 16, 18, 20][cycle % 5];
        const rooms = [];
        for (let r = 1; r <= 30; r += 1) {
          const students = 5 * r + unplaced;
          if (7 * (r - 1) < students && students < 7 * r) rooms.push(r);
        }
        questions.push(
          `宿舍不滿房問題：一群學生住宿舍，每間住 5 人剩 ${unplaced} 人無房可住；每間住 7 人則有一間不滿但不是空房。求宿舍間數可能有哪些？`
        );
        answers.push(
          formatJ242Answer(
            `${rooms.join('、')} 間`,
            `設宿舍有 $r$ 間，學生數為 $5r+${unplaced}$。每間住 7 人且有一間不滿但非空房，表示 $7(r-1)<5r+${unplaced}<7r$。解得整數 $r$ 為 ${rooms.join('、')}。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const avg = [74, 76, 78, 80, 82][cycle % 5];
        const target = avg + [4, 5, 6, 7, 8][cycle % 5];
        const needed = target * 5 - avg * 4;
        questions.push(
          `平均分門檻：前 4 次平均為 ${avg} 分，第 5 次要考幾分才能使總平均至少達 ${target} 分？若滿分 100 分，判斷是否可能。`
        );
        answers.push(
          formatJ242Answer(
            needed <= 100 ? `至少 ${needed} 分，可行` : `至少 ${needed} 分，不可行`,
            `前 4 次總分為 $4\\times ${avg}=${4 * avg}$。設第 5 次為 $x$，則 $\\dfrac{${4 * avg}+x}{5}\\ge ${target}$，得 $x\\ge ${needed}$。${needed <= 100 ? '因為不超過 100 分，所以可行。' : '因為超過 100 分，所以不可行。'}`
          )
        );
        continue;
      }

      if (variant === 3) {
        const cup = [500, 600, 750, 800, 900][cycle % 5];
        const water = cup - [200, 240, 300, 320, 360][cycle % 5];
        const first = [4, 5, 6, 7, 8][cycle % 5];
        const overflow = [2, 3, 4, 5, 6][cycle % 5];
        const gap = cup - water;
        const low = makeFraction(gap, first + overflow);
        const high = makeFraction(gap, first);
        questions.push(
          `體積位移：一個 ${cup}cc 杯子裝 ${water}cc 水，放入 $n$ 顆體積 $x$ cc 的珠子。若放 ${first} 顆不溢出，放 ${first + overflow} 顆會溢出，求 $x$ 的範圍。`
        );
        answers.push(
          formatJ242Answer(
            `$${fractionToLatex(low, true)}<x\\le ${fractionToLatex(high, true)}$`,
            `空間還有 $${cup}-${water}=${gap}$ cc。放 ${first} 顆不溢出：$${first}x\\le ${gap}$；放 ${first + overflow} 顆會溢出：$${first + overflow}x>${gap}$。合併得 $${fractionToLatex(low, true)}<x\\le ${fractionToLatex(high, true)}$。`
          )
        );
        continue;
      }

      const ticket = [50, 80, 100, 120, 150][cycle % 5];
      const group = [50, 40, 60, 80, 100][cycle % 5];
      const discount = [8, 75, 7, 85, 8][cycle % 5];
      const discountRate =
        discount === 75 ? makeFraction(3, 4) : discount === 85 ? makeFraction(17, 20) : makeFraction(discount, 10);
      const groupCost = mulFraction(makeFraction(ticket * group, 1), discountRate);
      const minPeople = Math.floor(groupCost.num / groupCost.den / ticket) + 1;
      questions.push(
        `折扣方案比較：門票 ${ticket} 元，${group} 人以上可打 ${discount === 75 ? '75' : discount} 折。若某團體不足 ${group} 人，但直接買 ${group} 張團體票反而較便宜，求人數 $x$ 的最小值。`
      );
      answers.push(
        formatJ242Answer(
          `${minPeople} 人`,
          `原價買 $x$ 張需 $${ticket}x$ 元；買 ${group} 張團體票需 $${fractionToLatex(groupCost)}$ 元。要團體票較便宜，需 $${fractionToLatex(groupCost)}<${ticket}x$，所以 $x>${fractionToLatex(divFraction(groupCost, makeFraction(ticket, 1)), true)}$，最小整數為 ${minPeople}。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }*/

  function buildJ242LogicApplicationsCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function pickOne(list) {
      return list[randInt(0, list.length - 1)];
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 8;

      if (variant === 0) {
        // 保證當選：名額可變
        const seats = randInt(2, 5);
        const total = randInt(28, 72);
        const minVote = Math.floor(total / (seats + 1)) + 1;

        questions.push(
          `保證當選題：班級 ${total} 人選 ${seats} 位模範生，採單記投票法。若阿文最後得到 $x$ 票，問 $x$ 至少要多少才能保證當選？`
        );

        answers.push(
          formatJ242Answer(
            `${minVote} 票`,
            `若阿文得 $x$ 票，其餘 $${total}-x$ 票分給其他候選人。要讓阿文不保證當選，至少要有 ${seats} 人各得到 $x$ 票，所以需 $${total}-x\\ge ${seats}x$。要保證當選就要 $${total}-x<${seats}x$，得 $x>${fractionToLatex(makeFraction(total, seats + 1), true)}$，因此至少 ${minVote} 票。`
          )
        );
        continue;
      }

      if (variant === 1) {
        // 宿舍不滿房：每間人數可變
        const perSmall = randInt(4, 6);
        const perLarge = perSmall + randInt(1, 3);
        const unplaced = randInt(perSmall + 2, perSmall + 16);

        const rooms = [];
        for (let r = 2; r <= 40; r += 1) {
          const students = perSmall * r + unplaced;
          if (perLarge * (r - 1) < students && students < perLarge * r) {
            rooms.push(r);
          }
        }

        // 避免沒有答案或答案太長
        if (rooms.length === 0 || rooms.length > 5) {
          i -= 1;
          continue;
        }

        questions.push(
          `宿舍不滿房問題：一群學生住宿舍，每間住 ${perSmall} 人，尚有 ${unplaced} 人無房可住；每間住 ${perLarge} 人，則有一間不滿但不是空房。求宿舍間數可能有哪些？`
        );

        answers.push(
          formatJ242Answer(
            `${rooms.join('、')} 間`,
            `設宿舍有 $r$ 間，學生數為 $${perSmall}r+${unplaced}$。每間住 ${perLarge} 人且有一間不滿但非空房，表示 $${perLarge}(r-1)<${perSmall}r+${unplaced}<${perLarge}r$。解得整數 $r$ 為 ${rooms.join('、')}。`
          )
        );
        continue;
      }

      if (variant === 2) {
        // 平均分門檻：次數、滿分、目標可變
        const doneCount = randInt(3, 5);
        const avg = randInt(62, 85);
        const maxScore = pickOne([100, 120]);
        const target = avg + randInt(3, 10);
        const needed = target * (doneCount + 1) - avg * doneCount;

        questions.push(
          `平均分門檻：前 ${doneCount} 次平均為 ${avg} 分，第 ${doneCount + 1} 次要考幾分，才能使總平均至少達 ${target} 分？若滿分 ${maxScore} 分，判斷是否可能。`
        );

        answers.push(
          formatJ242Answer(
            needed <= maxScore ? `至少 ${needed} 分，可行` : `至少 ${needed} 分，不可行`,
            `前 ${doneCount} 次總分為 $${doneCount}\\times ${avg}=${doneCount * avg}$。設第 ${doneCount + 1} 次為 $x$，則 $\\dfrac{${doneCount * avg}+x}{${doneCount + 1}}\\ge ${target}$，得 $x\\ge ${needed}$。${needed <= maxScore ? `因為不超過滿分 ${maxScore} 分，所以可行。` : `因為超過滿分 ${maxScore} 分，所以不可行。`}`
          )
        );
        continue;
      }

      if (variant === 3) {
        // 體積位移：杯子、水量、珠子顆數可變
        const cup = pickOne([400, 500, 600, 750, 800, 900, 1000, 1200]);
        const gap = randInt(80, Math.min(360, cup - 100));
        const water = cup - gap;
        const first = randInt(3, 9);
        const overflow = randInt(1, 5);

        const low = makeFraction(gap, first + overflow);
        const high = makeFraction(gap, first);

        questions.push(
          `體積位移：一個 ${cup}cc 杯子裝 ${water}cc 水，放入 $n$ 顆體積 $x$ cc 的珠子。若放 ${first} 顆不溢出，放 ${first + overflow} 顆會溢出，求 $x$ 的範圍。`
        );

        answers.push(
          formatJ242Answer(
            `$${fractionToLatex(low, true)}<x\\le ${fractionToLatex(high, true)}$`,
            `杯中剩餘空間為 $${cup}-${water}=${gap}$ cc。放 ${first} 顆不溢出：$${first}x\\le ${gap}$；放 ${first + overflow} 顆會溢出：$${first + overflow}x>${gap}$。合併得 $${fractionToLatex(low, true)}<x\\le ${fractionToLatex(high, true)}$。`
          )
        );
        continue;
      }

      if (variant === 4) {
        // 折扣方案比較：票價、團體門檻、折扣可變
        const ticket = pickOne([50, 60, 80, 100, 120, 150, 200]);
        const group = pickOne([30, 40, 50, 60, 80, 100]);
        const discountOption = pickOne([
          { label: '65', rate: makeFraction(13, 20) },
          { label: '7', rate: makeFraction(7, 10) },
          { label: '75', rate: makeFraction(3, 4) },
          { label: '8', rate: makeFraction(4, 5) },
          { label: '85', rate: makeFraction(17, 20) },
          { label: '9', rate: makeFraction(9, 10) },
        ]);

        const groupCost = mulFraction(makeFraction(ticket * group, 1), discountOption.rate);
        const breakEven = divFraction(groupCost, makeFraction(ticket, 1));
        const minPeople = Math.floor(breakEven.num / breakEven.den) + 1;

        questions.push(
          `折扣方案比較：門票 ${ticket} 元，${group} 人以上可打 ${discountOption.label} 折。若某團體不足 ${group} 人，但直接買 ${group} 張團體票反而較便宜，求人數 $x$ 的最小值。`
        );

        answers.push(
          formatJ242Answer(
            `${minPeople} 人`,
            `原價買 $x$ 張需 $${ticket}x$ 元；買 ${group} 張團體票需 $${fractionToLatex(groupCost)}$ 元。要團體票較便宜，需 $${fractionToLatex(groupCost)}<${ticket}x$，所以 $x>${fractionToLatex(breakEven, true)}$，最小整數為 ${minPeople}。`
          )
        );
        continue;
      }

      if (variant === 5) {
        // 座位範圍：車輛容量與車數可變
        const capacity = pickOne([32, 35, 40, 42, 45, 50]);
        const buses = randInt(2, 8);
        const low = capacity * buses;
        const high = capacity * (buses + 1);

        questions.push(
          `座位安排問題：學生搭遊覽車，每車最多坐 ${capacity} 人。若安排 ${buses} 輛車不夠坐，安排 ${buses + 1} 輛車可以坐完，求學生人數 $x$ 的範圍。`
        );

        answers.push(
          formatJ242Answer(
            `${low + 1}～${high} 人`,
            `${buses} 輛不夠坐，表示 $x>${capacity}\\times ${buses}=${low}$；${buses + 1} 輛可以坐完，表示 $x\\le ${capacity}\\times ${buses + 1}=${high}$。所以 $${low}<x\\le ${high}$，整數人數為 ${low + 1}～${high} 人。`
          )
        );
        continue;
      }

      if (variant === 6) {
        // 訂購費用區間：單價、手續費、上下限可變
        const price = pickOne([20, 25, 30, 35, 40, 50, 60, 80]);
        const service = pickOne([30, 40, 50, 60, 80, 100, 120]);
        const minX = randInt(3, 12);
        const maxX = minX + randInt(3, 10);

        const lowerCost = price * (minX - 1) + service;
        const upperCost = price * maxX + service;

        questions.push(
          `訂購費用問題：訂購獎品每份 ${price} 元，另收手續費 ${service} 元。若總費用超過 ${lowerCost} 元且不超過 ${upperCost} 元，求可訂購份數 $x$ 的範圍。`
        );

        answers.push(
          formatJ242Answer(
            `${minX}～${maxX} 份`,
            `總費用為 $${price}x+${service}$。依題意可列 $${lowerCost}<${price}x+${service}\\le ${upperCost}$。兩邊整理得 $${minX - 1}<x\\le ${maxX}$，因為 $x$ 為正整數，所以可訂購 ${minX}～${maxX} 份。`
          )
        );
        continue;
      }

      if (variant === 7) {
        // 鐘點費區間：基本費、每小時費用、上下限可變
        const base = pickOne([300, 500, 800, 1000]);
        const hourly = pickOne([120, 150, 180, 200, 250]);
        const minHour = randInt(2, 8);
        const maxHour = minHour + randInt(2, 8);

        const lowerCost = base + hourly * (minHour - 1);
        const upperCost = base + hourly * maxHour;

        questions.push(
          `鐘點費問題：場地租借基本費 ${base} 元，每小時加收 ${hourly} 元。若總費用超過 ${lowerCost} 元且不超過 ${upperCost} 元，求租借時數 $x$ 的範圍。`
        );

        answers.push(
          formatJ242Answer(
            `${minHour}～${maxHour} 小時`,
            `總費用為 $${base}+${hourly}x$。依題意可列 $${lowerCost}<${base}+${hourly}x\\le ${upperCost}$。整理得 $${minHour - 1}<x\\le ${maxHour}$，因為 $x$ 為正整數，所以租借時數為 ${minHour}～${maxHour} 小時。`
          )
        );
        continue;
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ241AbsGeometryFractionMixedCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const options = [
          { coef: 2, right: 4, lowerShift: 5 },
          { coef: 3, right: 6, lowerShift: 4 },
          { coef: 2, right: 8, lowerShift: 3 },
          { coef: 4, right: 12, lowerShift: 6 },
          { coef: 3, right: 9, lowerShift: 2 },
          { coef: 5, right: 10, lowerShift: 7 },
        ];
        const pick = options[cycle % options.length];
        const upper = makeFraction(pick.right, pick.coef);
        const xCoord = `${formatTerm(pick.coef, 'a')}-${pick.right}`;
        questions.push(`在坐標平面上，點 $P(${xCoord},a+${pick.lowerShift})$ 在第二象限，求 $a$ 的範圍。`);
        answers.push(
          formatJ241Answer(
            `$-${pick.lowerShift}<a<${fractionToLatex(upper, true)}$`,
            `第二象限表示 $x<0$ 且 $y>0$。所以 $${xCoord}<0$ 得 $a<${fractionToLatex(upper, true)}$，且 $a+${pick.lowerShift}>0$ 得 $a>-${pick.lowerShift}$。合併為 $-${pick.lowerShift}<a<${fractionToLatex(upper, true)}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const a = [3, 4, 5, 6, 7][cycle % 5];
        const b = [7, 8, 9, 10, 11][cycle % 5];
        const low = Math.abs(a - b);
        const high = a + b;
        questions.push(`已知三角形三邊長為 ${a}、${b}、$x$，求 $x$ 的範圍。`);
        answers.push(
          formatJ241Answer(
            `$${low}<x<${high}$`,
            `三角形任兩邊和大於第三邊，且兩邊差小於第三邊，所以 $|${a}-${b}|<x<${a}+${b}$，即 $${low}<x<${high}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const xBound = [2, 3, 4, 5, 6][cycle % 5];
        const yBound = [3, 4, 5, 6, 7][cycle % 5];
        const area = 4 * xBound * yBound;
        questions.push(`點 $A(x,y)$ 滿足 $|x|\\le ${xBound}$ 且 $|y|\\le ${yBound}$，求點 $A$ 可形成的矩形區域面積。`);
        answers.push(
          formatJ241Answer(
            `$${area}$`,
            `$|x|\\le ${xBound}$ 表示 $-${xBound}\\le x\\le ${xBound}$，寬為 ${2 * xBound}；$|y|\\le ${yBound}$ 表示 $-${yBound}\\le y\\le ${yBound}$，高為 ${2 * yBound}。面積為 $${2 * xBound}\\times ${2 * yBound}=${area}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const lowY = [-4, -2, 0, 2, 4][cycle % 5];
        const highY = lowY + [6, 8, 10, 12, 14][cycle % 5];
        const lowX = makeFraction(lowY + 6, 2);
        const highX = makeFraction(highY + 6, 2);
        questions.push(`已知線型函數 $y=2x-6$，當 $${lowY}<y<${highY}$ 時，求 $x$ 的對應範圍。`);
        answers.push(
          formatJ241Answer(
            `$${fractionToLatex(lowX, true)}<x<${fractionToLatex(highX, true)}$`,
            `由 $${lowY}<2x-6<${highY}$，各邊加 6 得 $${lowY + 6}<2x<${highY + 6}$，再除以 2 得 $${fractionToLatex(lowX, true)}<x<${fractionToLatex(highX, true)}$。`
          )
        );
        continue;
      }

      const target = [1, 2, 3, 4, 5][cycle % 5];
      const rhs = makeFraction(-3, 2);
      const c = target + 1;
      questions.push(`解不等式：$0.25(x-${c})-\\dfrac{1}{3}(2x+1)\\ge -1.5$。`);
      answers.push(
        formatJ241Answer(
          `$x\\le ${target}$`,
          `把小數化成分數：$\\dfrac14(x-${c})-\\dfrac13(2x+1)\\ge -\\dfrac32$。同乘以 12，得 $3(x-${c})-4(2x+1)\\ge -18$，整理後可得 $x\\le ${target}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ241InequalityLanguageSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const directBank = [
      () => {
        const add = randInt(2, 9);
        const limit = randInt(12, 30);
        return {
          q: `文字轉換：$x$ 加 ${add} 未滿 ${limit}，請寫成不等式。`,
          a: formatJ241Answer(`$x+${add}<${limit}$`, `「未滿」表示嚴格小於，所以不等式是 $x+${add}<${limit}$。`),
        };
      },
      () => {
        const times = randInt(2, 8);
        const add = randInt(3, 12);
        const limit = randInt(20, 60);
        return {
          q: `文字轉換：$x$ 的 ${times} 倍加 ${add} 大於 ${limit}，請寫成不等式。`,
          a: formatJ241Answer(
            `$${times}x+${add}>${limit}$`,
            `「大於」對應 $>$，所以不等式是 $${times}x+${add}>${limit}$。`
          ),
        };
      },
      () => {
        const coeff = randInt(2, 5);
        const bias = randInt(1, 8);
        const low = randInt(4, 12);
        const high = low + randInt(4, 10);
        const expr = formatLinearExpr(coeff, bias);
        return {
          q: `文字轉換：$${expr}$ 不到 ${high}，且不低於 ${low}，請寫成不等式。`,
          a: formatJ241Answer(
            `$${low}≤${expr}<${high}$`,
            `「不到」表示 $<$，「不低於」表示 $≥$，所以要寫成 $${low}≤${expr}<${high}$。`
          ),
        };
      },
      () => {
        const coeff = randInt(3, 9);
        const low = randInt(30, 80);
        const high = low + randInt(20, 60);
        return {
          q: `文字轉換：$x$ 的 ${coeff} 倍在 ${low} 以上，${high} 以下，請寫成不等式。`,
          a: formatJ241Answer(
            `$${low}≤${coeff}x≤${high}$`,
            `國中題裡「以上、以下」通常包含端點，所以式子是 $${low}≤${coeff}x≤${high}$。`
          ),
        };
      },
    ];

    const quickBank = [
      () => {
        const a = pickNonZero(-9, 9);
        const b = randInt(-12, 12);
        const c = randInt(-18, 18);
        const x0 = randInt(-6, 8);
        const ops = ['>', '<', '≥', '≤'];
        const op = ops[randInt(0, ops.length - 1)];
        const left = a * x0 + b;
        const ok = compareFractions(makeFraction(left), op, makeFraction(c));
        return {
          q: `判斷：$x=${x0}$ 是否為 $${formatLinearExpr(a, b)}${displayIneqOp(op)}${c}$ 的解？`,
          a: formatJ241Answer(
            ok ? '是' : '不是',
            `把 $x=${x0}$ 代入左邊得 $${left}$。因為 $${left}${displayIneqOp(op)}${c}$ ${ok ? '成立' : '不成立'}，所以 ${ok ? '是' : '不是'}這個不等式的解。`
          ),
        };
      },
      () => {
        const a = pickNonZero(-7, 7);
        const b = randInt(-8, 8);
        const c = randInt(-10, 12);
        const op = ['>', '<', '≥', '≤'][randInt(0, 3)];
        const candidates = shuffle([
          makeFraction(randInt(-6, 6)),
          makeFraction(randInt(-6, 6)),
          makeFraction(randInt(-10, 10), 2),
          makeFraction(randInt(-10, 10), 2),
        ]).slice(0, 4);
        const hits = candidates.filter((x) => compareFractions(evalLinearAt(a, b, x), op, makeFraction(c)));
        const hitText = hits.map((x) => `$${fractionToLatex(x, true)}$`).join('、');
        return {
          q: `下列哪些數為 $${formatLinearExpr(a, b)}${displayIneqOp(op)}${c}$ 的解：${candidates.map((x) => `$${fractionToLatex(x, true)}$`).join('、')}？`,
          a:
            hits.length > 0
              ? formatJ241Answer(hitText, `逐一代入檢查後，可得符合不等式的數是 ${hitText}。`)
              : formatJ241Answer('沒有符合的數', `逐一代入檢查後，這些數都不符合，所以沒有一個是這個不等式的解。`),
        };
      },
      () => {
        const bound = makeFraction(randInt(10, 36), [2, 4][randInt(0, 1)]);
        const askMax = randInt(0, 1) === 0;
        const op = askMax ? ['<', '≤'][randInt(0, 1)] : ['>', '≥'][randInt(0, 1)];
        const answer = askMax ? maxIntegerForIneq(op, bound) : minIntegerForIneq(op, bound);
        return {
          q: `若 $x${displayIneqOp(op)}${fractionToLatex(bound, true)}$，則 $x$ 的${askMax ? '最大' : '最小'}整數值為何？`,
          a: formatJ241Answer(
            `$${answer}$`,
            `先看界線是 $${fractionToLatex(bound, true)}$。依題意可得答案為 $${answer}$。`
          ),
        };
      },
      () => {
        const low = randInt(-20, 4);
        const high = low + randInt(6, 18);
        const includeLow = randInt(0, 1) === 0;
        const includeHigh = randInt(0, 1) === 0;
        const countInt = countIntegersInInterval(makeFraction(low), includeLow, makeFraction(high), includeHigh);
        const leftOp = includeLow ? '≤' : '<';
        const rightOp = includeHigh ? '≤' : '<';
        return {
          q: `滿足 $${low}${leftOp}x${rightOp}${high}$ 的整數解共有幾個？`,
          a: formatJ241Answer(
            `${countInt} 個`,
            `整數解會從 ${includeLow ? low : low + 1} 到 ${includeHigh ? high : high - 1}。共有 ${countInt} 個整數解。`
          ),
        };
      },
      () => {
        const low = randInt(-12, -4);
        const countInt = randInt(6, 18);
        const upper = low + countInt + 1;
        const start = low + 1;
        const countExpr = start < 0 ? `a-(${start})` : `a-${start}`;
        return {
          q: `已知滿足 $${low}<x<a$ 的整數解有 ${countInt} 個，求正整數 $a$。`,
          a: formatJ241Answer(
            `$a=${upper}$`,
            `整數解會是 ${start} 到 $a-1$。因此個數為 $${countExpr}$，令它等於 ${countInt}，解得 $a=${upper}$。`
          ),
        };
      },
      () => {
        const limit = randInt(3, 8);
        const candidates = shuffle([
          makeFraction(-limit - 1),
          makeFraction(-limit + 1),
          makeFraction(0),
          makeFraction(limit - 1, 2),
          makeFraction(limit + 1, 2),
        ]).slice(0, 4);
        const hits = candidates.filter((x) => Math.abs(x.num / x.den) < limit);
        const hitText = hits.map((x) => `$${fractionToLatex(x, true)}$`).join('、');
        return {
          q: `下列哪些數為 $|x|<${limit}$ 的解：${candidates.map((x) => `$${fractionToLatex(x, true)}$`).join('、')}？`,
          a:
            hits.length > 0
              ? formatJ241Answer(hitText, `因為 $|x|<${limit}$ 表示 $-${limit}<x<${limit}$，所以符合的有 ${hitText}。`)
              : formatJ241Answer(
                  '沒有符合的數',
                  `因為 $|x|<${limit}$ 等價於 $-${limit}<x<${limit}$，逐一檢查後沒有符合的數。`
                ),
        };
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const bank = i % 3 === 0 ? directBank : quickBank;
      const pick = bank[randInt(0, bank.length - 1)]();
      questions.push(pick.q);
      answers.push(pick.a);
    }

    return { questions, summaryAnswers, answers };
  }

  function flipInequality(op) {
    if (op === '>') return '<';
    if (op === '<') return '>';
    if (op === '\\ge' || op === '≥') return '≤';
    return '≥';
  }

  function compareFractions(left, op, right) {
    const l = makeFraction(left.num, left.den);
    const r = makeFraction(right.num, right.den);
    const diff = l.num * r.den - r.num * l.den;
    if (op === '>') return diff > 0;
    if (op === '<') return diff < 0;
    if (op === '\\ge' || op === '≥') return diff >= 0;
    return diff <= 0;
  }

  function displayIneqOp(op) {
    if (op === '\\ge') return '≥';
    if (op === '\\le') return '≤';
    return op;
  }

  function formatIneqBound(frac) {
    const value = makeFraction(frac.num, frac.den);
    return value.den === 1 ? `${value.num}` : fractionToLatex(value, true);
  }

  function formatIneqSolution(op, frac) {
    return `x${displayIneqOp(op)}${formatIneqBound(frac)}`;
  }

  // 簡答若含裸露的 \frac / \dfrac（沒有包在 $…$ 內），自動補上 $…$，避免匯出 PDF 時
  // xelatex 報「Missing $ inserted」。已含 $ 或 \( 的就原樣保留，不重複包。
  function wrapBareShortAnswerMath(text) {
    if (text.includes('$') || text.includes('\\(')) return text;
    return text.replace(/-?\d*\\d?frac\{-?\d+\}\{-?\d+\}/g, (m) => `$${m}$`);
  }

  function formatPracticeShortAnswer(shortAnswer, process = '') {
    const shortText = normalizePracticeSummaryAnswer(wrapBareShortAnswerMath(String(shortAnswer || '').trim()));
    const processText = String(process || '').trim();
    return createManualSummaryAnswer(shortText, processText);
  }

  function inferPracticeShortAnswer(process) {
    const text = String(process || '').trim();
    if (!text) return '見過程';
    const lastSentence =
      text
        .split('。')
        .map((part) => part.trim())
        .filter(Boolean)
        .pop() || text;
    const patterns = [
      /最簡整數比(?:為)?\s*(.+)$/,
      /(?:所以|因此|故|可得|解得)\s*(.+)$/,
      /(?:比值|關係式|新比|濃度|答案)(?:為|是)?\s*(.+)$/,
    ];
    for (const pattern of patterns) {
      const match = lastSentence.match(pattern);
      if (match && match[1]) return cleanInferredShortAnswer(match[1]);
    }
    return cleanInferredShortAnswer(lastSentence.replace(/^(所以|因此|故|可得|解得)\s*/, ''));
  }

  function cleanInferredShortAnswer(value) {
    let short = String(value || '').trim();
    ['，因此', '，所以', '，故', '，解得', '，可得'].forEach((marker) => {
      const index = short.lastIndexOf(marker);
      if (index >= 0) short = short.slice(index + marker.length).trim();
    });
    short = short
      .replace(/^最簡整數比(?:為)?\s*/, '')
      .replace(/^原本/, '')
      .trim();
    const finalRatio = short.match(/=([+-]?\d+:[+-]?\d+)\$?$/);
    if (finalRatio) return `$${finalRatio[1]}$`;
    const finalEquation = short.match(/(\$[a-zA-Z]\\s*=[^$]+\$)$/);
    if (finalEquation) return finalEquation[1];
    return short || '見過程';
  }

  function normalizePracticeSummaryAnswer(summary) {
    let text = String(summary || '').trim();
    const divisionResult = text.match(/^\$[^$]*\\div[^$]*=([^$]+)\$$/);
    if (divisionResult) text = `$${divisionResult[1].trim()}$`;
    const ratioLabel = text.match(/^整理後比為\s*(\$[^$]+\$)$/);
    if (ratioLabel) text = ratioLabel[1];
    const totalPeople = text.match(/^上學期全校共有\s*\$[^$]*=([0-9]+)\$\s*人$/);
    if (totalPeople) text = `${totalPeople[1]} 人`;
    const totalCount = text.match(/^總數為\s*\$[^$]*=([0-9]+)\$\s*張$/);
    if (totalCount) text = `${totalCount[1]} 張`;
    text = text
      .replace(/\\frac\{-([^{}]+)\}\{([^{}]+)\}/g, '-\\frac{$1}{$2}')
      .replace(/=1\(([^()]+)\)/g, '=$1')
      .replace(/=-1\(([^()]+)\)/g, '=-($1)');
    return text;
  }

  function formatJ231Answer(shortAnswer, process = '') {
    return createManualSummaryAnswer(normalizePracticeSummaryAnswer(shortAnswer), process);
  }

  function finalizeJ231Set(questions, summaryAnswersOrAnswers, maybeAnswers) {
    const answers = maybeAnswers || summaryAnswersOrAnswers;
    const summaryAnswers = maybeAnswers ? summaryAnswersOrAnswers : answers.__summaryAnswers || [];
    return {
      questions,
      summaryAnswers,
      answers,
    };
  }

  function formatJ232Answer(shortAnswer, process = '') {
    return createManualSummaryAnswer(normalizePracticeSummaryAnswer(shortAnswer), process);
  }

  function formatJ241Answer(shortAnswer, process = '') {
    return createManualSummaryAnswer(normalizePracticeSummaryAnswer(shortAnswer), process);
  }

  function formatJ242Answer(shortAnswer, process = '') {
    return createManualSummaryAnswer(normalizePracticeSummaryAnswer(shortAnswer), process);
  }

  function formatIneqAxRelB(coef, op, constant) {
    return `${formatTerm(coef, 'x')}${displayIneqOp(op)}${formatIneqBound(makeFraction(constant))}`;
  }

  function evalLinearAt(a, b, xFrac) {
    return addFraction(mulFraction(makeFraction(a, 1), xFrac), makeFraction(b, 1));
  }

  function maxIntegerForIneq(op, frac) {
    const value = frac.num / frac.den;
    return op === '<' ? Math.ceil(value) - 1 : Math.floor(value);
  }

  function minIntegerForIneq(op, frac) {
    const value = frac.num / frac.den;
    return op === '>' ? Math.floor(value) + 1 : Math.ceil(value);
  }

  function countIntegersInInterval(low, includeLow, high, includeHigh) {
    const lowValue = low.num / low.den;
    const highValue = high.num / high.den;
    const start = includeLow ? Math.ceil(lowValue) : Math.floor(lowValue) + 1;
    const end = includeHigh ? Math.floor(highValue) : Math.ceil(highValue) - 1;
    return Math.max(0, end - start + 1);
  }

  function buildJ241IntegerSolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const solOps = ['>', '<', '≥', '≤'];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;
      const solOp = solOps[randInt(0, solOps.length - 1)];
      const target = randInt(-6, 8);

      if (variant === 0) {
        const coef = pickNonZero(-9, 9);
        const bias = randInt(-12, 12);
        const rawOp = coef > 0 ? solOp : flipInequality(solOp);
        const rhs = coef * target + bias;
        const solution = formatIneqSolution(solOp, makeFraction(target));
        questions.push(`解不等式：$${formatLinearExpr(coef, bias)}${displayIneqOp(rawOp)}${rhs}$。`);
        answers.push(
          formatJ241Answer(
            `$${solution}$`,
            `移項前其實已經是一次不等式：$${formatLinearExpr(coef, bias)}${rawOp}${rhs}$。先整理得 $${formatIneqAxRelB(coef, rawOp, rhs - bias)}$。${coef < 0 ? `兩邊同除以負數 ${coef} 時要變號，所以 ` : ''}解得 $${solution}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const rightCoef = pickNonZero(-5, 5);
        let delta = pickNonZero(-6, 6);
        let leftCoef = rightCoef + delta;
        if (leftCoef === 0) leftCoef += 1;
        const bias = randInt(-10, 10);
        const A = leftCoef - rightCoef;
        if (A === 0) {
          i -= 1;
          continue;
        }
        const rawOp = A > 0 ? solOp : flipInequality(solOp);
        const rhsConst = A * target + bias;
        const solution = formatIneqSolution(solOp, makeFraction(target));
        questions.push(
          `解不等式：$${formatLinearExpr(leftCoef, bias)}${displayIneqOp(rawOp)}${formatLinearExpr(rightCoef, rhsConst)}$。`
        );
        answers.push(
          formatJ241Answer(
            `$${solution}$`,
            `先移項整理：$${formatTerm(leftCoef, 'x')}${rightCoef > 0 ? '-' : '+'}${formatTerm(Math.abs(rightCoef), 'x')}${rawOp}${rhsConst}${formatSignedNumber(-bias)}$，可得 $${formatIneqAxRelB(A, rawOp, rhsConst - bias)}$。${A < 0 ? `再除以負數 ${A} 要變號，` : ''}所以解是 $${solution}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const p = randInt(2, 6);
        const q = pickNonZero(-4, 4);
        const r = randInt(-6, 6);
        const A = p - q;
        if (A === 0) {
          i -= 1;
          continue;
        }
        const rawOp = A > 0 ? solOp : flipInequality(solOp);
        const rhs = A * target + p * r;
        const solution = formatIneqSolution(solOp, makeFraction(target));
        questions.push(
          `解不等式：$${p}(${formatLinearExpr(1, r)})${displayIneqOp(rawOp)}${formatLinearExpr(q, rhs)}$。`
        );
        answers.push(
          formatJ241Answer(
            `$${solution}$`,
            `先展開得 $${formatLinearExpr(p, p * r)}${rawOp}${formatLinearExpr(q, rhs)}$。移項整理後可得 $${formatIneqAxRelB(A, rawOp, rhs - p * r)}$。${A < 0 ? `兩邊同除以負數 ${A} 要變號，` : ''}因此 $${solution}$。`
          )
        );
        continue;
      }

      const p = randInt(2, 6);
      const q = randInt(2, 5);
      const r = randInt(-5, 5);
      const u = randInt(-5, 5);
      const A = p - q;
      if (A === 0) {
        i -= 1;
        continue;
      }
      const rawOp = A > 0 ? solOp : flipInequality(solOp);
      const constPart = p * r - q * u;
      const rhs = A * target + constPart;
      const solution = formatIneqSolution(solOp, makeFraction(target));
      questions.push(
        `解不等式：$${p}(${formatLinearExpr(1, r)})-${q}(${formatLinearExpr(1, u)})${displayIneqOp(rawOp)}${rhs}$。`
      );
      answers.push(
        formatJ241Answer(
          `$${solution}$`,
          `先展開得 $${formatLinearExpr(p, p * r)}-\\left(${formatLinearExpr(q, q * u)}\\right)${rawOp}${rhs}$，整理後為 $${formatIneqAxRelB(A, rawOp, rhs - constPart)}$。${A < 0 ? `再除以負數 ${A} 時要變號，` : ''}所以解為 $${solution}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ241DecimalSolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const solOps = ['>', '<', '≥', '≤'];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const solOp = solOps[randInt(0, solOps.length - 1)];
      const target = randInt(-6, 8);

      if (variant === 0) {
        const scale = 10;
        const coef = pickNonZero(-18, 18);
        const bias = randInt(-15, 15);
        const rhsCoef = pickNonZero(-18, 18);
        const A = coef - rhsCoef;
        if (A === 0) {
          i -= 1;
          continue;
        }
        const rawOp = A > 0 ? solOp : flipInequality(solOp);
        const rhsConst = A * target + bias;
        const solution = formatIneqSolution(solOp, makeFraction(target));
        questions.push(
          `解不等式：$${formatCoeffTerm(coef / scale)}${bias === 0 ? '' : `${bias > 0 ? '+' : ''}${trimFixed(bias / scale)}`}${displayIneqOp(rawOp)}${formatCoeffTerm(rhsCoef / scale)}${rhsConst === 0 ? '' : `${rhsConst > 0 ? '+' : ''}${trimFixed(rhsConst / scale)}`}$。`
        );
        answers.push(
          formatJ241Answer(
            `$${solution}$`,
            `先把各項都乘以 $${scale}$ 化成整數，得到 $${formatLinearExpr(coef, bias)}${rawOp}${formatLinearExpr(rhsCoef, rhsConst)}$。整理後可得 $${formatIneqAxRelB(A, rawOp, rhsConst - bias)}$。${A < 0 ? `再除以負數 ${A} 要變號，` : ''}所以 $${solution}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const p = randInt(2, 5);
        const q = pickNonZero(-10, 10);
        const r = randInt(-6, 6);
        const A = 10 * p - q;
        if (A === 0) {
          i -= 1;
          continue;
        }
        const rawOp = A > 0 ? solOp : flipInequality(solOp);
        const rhs = A * target + 10 * p * r;
        const inner = r === 0 ? 'x' : `x${r >= 0 ? '+' : ''}${r}`;
        const solution = formatIneqSolution(solOp, makeFraction(target));
        questions.push(
          `解不等式：$${p}\\left(${inner}\\right)${displayIneqOp(rawOp)}${formatCoeffTerm(q / 10)}${rhs === 0 ? '' : `${rhs > 0 ? '+' : ''}${trimFixed(rhs / 10)}`}$。`
        );
        answers.push(
          formatJ241Answer(
            `$${solution}$`,
            `先展開並把小數同乘以 $10$ 化成整數，可得 $${p * 10}(${inner})${rawOp}${formatLinearExpr(q, rhs)}$。整理後為 $${formatIneqAxRelB(A, rawOp, rhs - 10 * p * r)}$。${A < 0 ? `除以負數 ${A} 要變號，` : ''}所以 $${solution}$。`
          )
        );
        continue;
      }

      const p = randInt(2, 4);
      const q = randInt(2, 4);
      const r = randInt(-5, 5);
      const u = randInt(-5, 5);
      const A = 10 * (p - q);
      if (A === 0) {
        i -= 1;
        continue;
      }
      const rawOp = A > 0 ? solOp : flipInequality(solOp);
      const constPart = 10 * (p * r - q * u);
      const rhs = A * target + constPart;
      const solution = formatIneqSolution(solOp, makeFraction(target));
      questions.push(
        `解不等式：$${trimFixed(p / 10)}(${formatLinearExpr(10, 10 * r)})-${trimFixed(q / 10)}(${formatLinearExpr(10, 10 * u)})${displayIneqOp(rawOp)}${trimFixed(rhs / 10)}$。`
      );
      answers.push(
        formatJ241Answer(
          `$${solution}$`,
          `先展開並整理得 $${p}(${formatLinearExpr(10, 10 * r)})-${q}(${formatLinearExpr(10, 10 * u)})${rawOp}${rhs}$，進一步可化成 $${formatIneqAxRelB(A, rawOp, rhs - constPart)}$。${A < 0 ? `再除以負數 ${A} 要變號，` : ''}因此 $${solution}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ241FractionSolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const solOps = ['>', '<', '≥', '≤'];

    function gcdInt(a, b) {
      let x = Math.abs(a);
      let y = Math.abs(b);
      while (y !== 0) {
        const t = x % y;
        x = y;
        y = t;
      }
      return x || 1;
    }

    function lcmInt(a, b) {
      return Math.abs(a * b) / gcdInt(a, b);
    }

    function appendSignedFraction(frac) {
      const value = makeFraction(frac.num, frac.den);
      if (value.num === 0) return '';
      const absValue = makeFraction(Math.abs(value.num), value.den);
      return `${value.num > 0 ? '+' : '-'}${fractionToLatex(absValue, true)}`;
    }

    function appendSignedInteger(value) {
      if (value === 0) return '';
      return `${value > 0 ? '+' : ''}${value}`;
    }

    function clearAnswer(aFrac, bFrac, rhsFrac, rawOp, solOp, target) {
      const scale = lcmInt(lcmInt(aFrac.den, bFrac.den), rhsFrac.den);
      const intA = aFrac.num * (scale / aFrac.den);
      const intB = bFrac.num * (scale / bFrac.den);
      const intR = rhsFrac.num * (scale / rhsFrac.den);
      const movedR = intR - intB;
      const beforeMove = `${formatLinearExpr(intA, intB)}${displayIneqOp(rawOp)}${intR}`;
      const afterMove = `${formatTerm(intA, 'x')}${displayIneqOp(rawOp)}${movedR}`;
      const moveText = intB === 0 ? '' : `移項得 $${afterMove}$。`;
      const solution = formatIneqSolution(solOp, target);
      return formatJ241Answer(
        `$${solution}$`,
        `先去分母整理，可得 $${beforeMove}$。${moveText}${intA < 0 ? `兩邊同除以負數 ${intA} 時要變號，` : ''}所以解為 $${solution}$。`
      );
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 6;
      const solOp = solOps[randInt(0, solOps.length - 1)];
      const targetPool = [
        makeFraction(randInt(-8, 8), 2),
        makeFraction(randInt(-9, 9), 3),
        makeFraction(randInt(-10, 10), 4),
        makeFraction(randInt(-10, 10), 5),
      ];
      const target = targetPool[randInt(0, targetPool.length - 1)];

      if (variant === 0) {
        const p = randInt(-5, 5);
        const d = [2, 3, 4][randInt(0, 2)];
        const c = randInt(-2, 3);
        const e = [2, 3, 5][randInt(0, 2)];
        const aFrac = subFraction(makeFraction(1, d), makeFraction(1, e));
        if (aFrac.num === 0) {
          i -= 1;
          continue;
        }
        const bFrac = addFraction(makeFraction(p, d), makeFraction(c, 1));
        const rawOp = aFrac.num > 0 ? solOp : flipInequality(solOp);
        const rhsFrac = addFraction(mulFraction(aFrac, target), bFrac);
        questions.push(
          `解不等式：$\\dfrac{${formatLinearExpr(1, p)}}{${d}}${appendSignedInteger(c)}${displayIneqOp(rawOp)}\\dfrac{x}{${e}}${appendSignedFraction(rhsFrac)}$。`
        );
        answers.push(clearAnswer(aFrac, bFrac, rhsFrac, rawOp, solOp, target));
        continue;
      }

      if (variant === 1) {
        const a = randInt(2, 7);
        const b = randInt(-6, 6);
        const c = randInt(1, 5);
        const d = randInt(-4, 4);
        const den1 = [3, 4, 5][randInt(0, 2)];
        const den2 = [2, 3, 5][randInt(0, 2)];
        const aFrac = subFraction(makeFraction(a, den1), makeFraction(c, den2));
        if (aFrac.num === 0) {
          i -= 1;
          continue;
        }
        const bFrac = subFraction(makeFraction(b, den1), makeFraction(d, den2));
        const rawOp = aFrac.num > 0 ? solOp : flipInequality(solOp);
        const rhsFrac = addFraction(mulFraction(aFrac, target), bFrac);
        questions.push(
          `解不等式：$\\dfrac{${formatLinearExpr(a, b)}}{${den1}}-\\dfrac{${formatLinearExpr(c, d)}}{${den2}}${displayIneqOp(rawOp)}${fractionToLatex(rhsFrac, true)}$。`
        );
        answers.push(clearAnswer(aFrac, bFrac, rhsFrac, rawOp, solOp, target));
        continue;
      }

      if (variant === 2) {
        const a = randInt(1, 3);
        const b = randInt(-5, 5);
        const den1 = [2, 4][randInt(0, 1)];
        const den2 = [2, 3][randInt(0, 1)];
        const c2 = randInt(-4, 4);
        const aFrac = addFraction(makeFraction(a, den1), makeFraction(1, den2));
        const bFrac = addFraction(makeFraction(b, den1), makeFraction(c2, den2));
        if (aFrac.num === 0) {
          i -= 1;
          continue;
        }
        const rawOp = aFrac.num > 0 ? solOp : flipInequality(solOp);
        const rhsFrac = addFraction(mulFraction(aFrac, target), bFrac);
        questions.push(
          `解不等式：$\\dfrac{${formatLinearExpr(a, b)}}{${den1}}+\\dfrac{${formatLinearExpr(1, c2)}}{${den2}}${displayIneqOp(rawOp)}${fractionToLatex(rhsFrac, true)}$。`
        );
        answers.push(clearAnswer(aFrac, bFrac, rhsFrac, rawOp, solOp, target));
        continue;
      }

      if (variant === 3) {
        const den1 = [2, 3, 4][randInt(0, 2)];
        const p = randInt(-5, 5);
        const den2 = [2, 3, 5][randInt(0, 2)];
        const aFrac = subFraction(makeFraction(1, den1), makeFraction(1, den2));
        if (aFrac.num === 0) {
          i -= 1;
          continue;
        }
        const bFrac = makeFraction(p, den2);
        const rawOp = aFrac.num > 0 ? solOp : flipInequality(solOp);
        const rhsFrac = addFraction(mulFraction(aFrac, target), bFrac);
        questions.push(
          `解不等式：$\\dfrac{x}{${den1}}-\\dfrac{${formatLinearExpr(1, -p)}}{${den2}}${displayIneqOp(rawOp)}${fractionToLatex(rhsFrac, true)}$。`
        );
        answers.push(clearAnswer(aFrac, bFrac, rhsFrac, rawOp, solOp, target));
        continue;
      }

      if (variant === 4) {
        const p = randInt(-4, 6);
        const q = randInt(-4, 6);
        const den1 = [2, 4][randInt(0, 1)];
        const den2 = [5, 10][randInt(0, 1)];
        const aFrac = subFraction(makeFraction(1, den1), makeFraction(-1, den2));
        const bFrac = subFraction(makeFraction(p, den1), makeFraction(q, den2));
        const rawOp = aFrac.num > 0 ? solOp : flipInequality(solOp);
        const rhsFrac = addFraction(mulFraction(aFrac, target), bFrac);
        questions.push(
          `解不等式：$\\dfrac{${formatLinearExpr(1, p)}}{${den1}}${displayIneqOp(rawOp)}\\dfrac{${formatLinearExpr(-1, q)}}{${den2}}${appendSignedFraction(rhsFrac)}$。`
        );
        answers.push(clearAnswer(aFrac, bFrac, rhsFrac, rawOp, solOp, target));
        continue;
      }

      const den1 = [3, 4, 5][randInt(0, 2)];
      const den2 = [2, 3, 4][randInt(0, 2)];
      const a1 = randInt(1, 3);
      const b1 = randInt(-4, 4);
      const a2 = randInt(1, 3);
      const b2 = randInt(-4, 4);
      const aFrac = subFraction(makeFraction(a1, den1), makeFraction(a2, den2));
      if (aFrac.num === 0) {
        i -= 1;
        continue;
      }
      const bFrac = subFraction(makeFraction(b1, den1), makeFraction(b2, den2));
      const rawOp = aFrac.num > 0 ? solOp : flipInequality(solOp);
      const rhsFrac = addFraction(mulFraction(aFrac, target), bFrac);
      questions.push(
        `解不等式：$\\dfrac{${formatLinearExpr(a1, b1)}}{${den1}}${displayIneqOp(rawOp)}\\dfrac{${formatLinearExpr(a2, b2)}}{${den2}}${appendSignedFraction(rhsFrac)}$。`
      );
      answers.push(clearAnswer(aFrac, bFrac, rhsFrac, rawOp, solOp, target));
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ241RangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const low = randInt(-6, 3);
      const high = low + randInt(3, 8);
      const includeLow = randInt(0, 1) === 0;
      const includeHigh = randInt(0, 1) === 0;
      const coefChoices = [
        makeFraction(2, 1),
        makeFraction(-3, 1),
        makeFraction(1, 4),
        makeFraction(-2, 1),
        makeFraction(3, 2),
      ];
      const coef = coefChoices[randInt(0, coefChoices.length - 1)];
      const bias = randInt(-7, 7);
      const yLowCandidate = addFraction(mulFraction(coef, makeFraction(low, 1)), makeFraction(bias, 1));
      const yHighCandidate = addFraction(mulFraction(coef, makeFraction(high, 1)), makeFraction(bias, 1));
      const increasing = coef.num > 0;
      const lowerY = increasing ? yLowCandidate : yHighCandidate;
      const upperY = increasing ? yHighCandidate : yLowCandidate;
      const lowerInc = increasing ? includeLow : includeHigh;
      const upperInc = increasing ? includeHigh : includeLow;
      const xExprLeft = includeLow ? '≤' : '<';
      const xExprRight = includeHigh ? '≤' : '<';
      const yLeft = lowerInc ? '≤' : '<';
      const yRight = upperInc ? '≤' : '<';
      const coefText = coef.den === 1 ? `${coef.num}` : `\\dfrac{${coef.num}}{${coef.den}}`;
      const yExpr = coef.den === 1 ? formatLinearExpr(coef.num, bias) : `${coefText}x${formatSignedNumber(bias)}`;
      const rangeAnswer = `${formatIneqBound(lowerY)}${yLeft}y${yRight}${formatIneqBound(upperY)}`;
      questions.push(`已知 $${low}${xExprLeft}x${xExprRight}${high}$，求 $y=${yExpr}$ 的範圍。`);
      answers.push(
        formatJ241Answer(
          `$${rangeAnswer}$`,
          `因為 $y=${yExpr}$ ${increasing ? '會隨 $x$ 增加而增加' : '會隨 $x$ 增加而減少'}，所以只要代入兩個端點判斷最小與最大值。可得 $${rangeAnswer}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ241ReverseCoeffSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const ops = ['>', '<', '≥', '≤'];
    const targetChoices = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7];

    function symbolMinusNumber(symbol, value) {
      if (value === 0) return symbol;
      return value > 0 ? `${symbol}-${value}` : `${symbol}-(${value})`;
    }

    function numberMinusSymbol(value, symbol) {
      if (value === 0) return `-${symbol}`;
      return `${value}-${symbol}`;
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);
      const solOp = ops[randInt(0, ops.length - 1)];
      const target = targetChoices[randInt(0, targetChoices.length - 1)];

      if (variant === 0) {
        const rhs = randInt(-6, 10);
        const a = 2 * target - rhs;
        questions.push(`若 $2x-a${displayIneqOp(solOp)}${rhs}$ 的解為 $x${displayIneqOp(solOp)}${target}$，求 $a$。`);
        answers.push(
          formatJ241Answer(
            `$a=${a}$`,
            `由 $2x-a${displayIneqOp(solOp)}${rhs}$ 可得 $2x${displayIneqOp(solOp)}${rhs}+a$。因為解的界線是 ${target}，所以 $\\dfrac{${rhs}+a}{2}=${target}$，解得 $a=${a}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const c = randInt(-6, 6);
        const rightCoef = pickNonZero(-7, 7);
        if (rightCoef === 0) {
          i -= 1;
          continue;
        }
        const rawOp = solOp;
        const a = rightCoef + 1;
        const d = (a - rightCoef) * target + c;
        const coefExpr = symbolMinusNumber('a', rightCoef);
        questions.push(
          `若 $${c === 0 ? 'ax' : `ax${c > 0 ? '+' : ''}${c}`}${displayIneqOp(rawOp)}${formatLinearExpr(rightCoef, d)}$ 的解為 $x${displayIneqOp(solOp)}${target}$，求 $a$。`
        );
        answers.push(
          formatJ241Answer(
            `$a=${a}$`,
            `移項後可得 $(${coefExpr})x${displayIneqOp(rawOp)}${d - c}$。因為解是 $x${displayIneqOp(solOp)}${target}$，所以 $\\dfrac{${d - c}}{${coefExpr}}=${target}$，整理可得 $a=${a}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const a = pickNonZero(-9, 9);
        const rhs = a * target;
        const solText = a > 0 ? solOp : flipInequality(solOp);
        questions.push(`若 $ax${displayIneqOp(solText)}${rhs}$ 的解為 $x${displayIneqOp(solOp)}${target}$，求 $a$。`);
        answers.push(
          formatJ241Answer(
            `$a=${a}$`,
            `因為 $ax${displayIneqOp(solText)}${rhs}$ 兩邊同除以 $a$ 後要得到 $x${displayIneqOp(solOp)}${target}$，所以 $a$ 的正負必須和不等號變向情形一致。配合 $${rhs}=a\\times ${target}$，可得 $a=${a}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const a = randInt(-20, 20);
        let rightCoef = pickNonZero(-5, 5);
        if (rightCoef === 2) rightCoef = 3;
        const A = 2 - rightCoef;
        if (A === 0) {
          i -= 1;
          continue;
        }
        const rawOp = A > 0 ? solOp : flipInequality(solOp);
        const d = A * target + a;
        const coefExpr = symbolMinusNumber('2', rightCoef);
        const rhsExpr = numberMinusSymbol(d, 'a');
        questions.push(
          `若 $2x+a${displayIneqOp(rawOp)}${formatLinearExpr(rightCoef, d)}$ 的解為 $x${displayIneqOp(solOp)}${target}$，求 $a$。`
        );
        answers.push(
          formatJ241Answer(
            `$a=${a}$`,
            `移項後會得到 $(${coefExpr})x${displayIneqOp(rawOp)}${rhsExpr}$。由於解是 $x${displayIneqOp(solOp)}${target}$，所以要有 $\\dfrac{${rhsExpr}}{${A}}=${target}$，解得 $a=${a}$。`
          )
        );
        continue;
      }

      const rhsConst = randInt(-8, 8);
      let leftCoef = pickNonZero(-7, 7);
      if (leftCoef === 1) leftCoef = 2;
      const rightCoef = leftCoef - 1;
      const m = target - rhsConst;
      const coefDiff = leftCoef - rightCoef;
      questions.push(
        `若 $${formatTerm(leftCoef, 'x')}-m${displayIneqOp(solOp)}${formatLinearExpr(rightCoef, rhsConst)}$ 的解為 $x${displayIneqOp(solOp)}${target}$，求 $m$。`
      );
      answers.push(
        formatJ241Answer(
          `$m=${m}$`,
          `移項後是 $${formatTerm(coefDiff, 'x')}${displayIneqOp(solOp)}${rhsConst}+m$，也就是 $x${displayIneqOp(solOp)}${rhsConst}+m$。解應為 $x${displayIneqOp(solOp)}${target}$，因此 $${rhsConst}+m=${target}$，所以 $m=${m}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ241KnownSolutionParamRangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const ops = ['>', '<', '≥', '≤'];

    function chooseTargetsForX0(x0) {
      const base = [
        makeFraction(-5),
        makeFraction(-4),
        makeFraction(-3),
        makeFraction(-2),
        makeFraction(-1),
        makeFraction(0),
        makeFraction(1),
        makeFraction(2),
        makeFraction(3),
        makeFraction(4),
        makeFraction(5),
      ];
      if (Math.abs(x0) % 2 === 0) {
        base.push(
          makeFraction(-7, 2),
          makeFraction(-5, 2),
          makeFraction(-3, 2),
          makeFraction(-1, 2),
          makeFraction(1, 2),
          makeFraction(3, 2),
          makeFraction(5, 2),
          makeFraction(7, 2)
        );
      }
      if (Math.abs(x0) % 3 === 0) {
        base.push(
          makeFraction(-8, 3),
          makeFraction(-5, 3),
          makeFraction(-4, 3),
          makeFraction(-2, 3),
          makeFraction(2, 3),
          makeFraction(4, 3),
          makeFraction(5, 3),
          makeFraction(8, 3)
        );
      }
      return base;
    }

    for (let i = 0; i < count; i += 1) {
      let built = false;
      for (let tries = 0; tries < 60 && !built; tries += 1) {
        const x0Choices = [-6, -4, -3, -2, 2, 3, 4, 6];
        const x0 = x0Choices[randInt(0, x0Choices.length - 1)];
        const targetChoices = chooseTargetsForX0(x0);
        const target = targetChoices[randInt(0, targetChoices.length - 1)];
        const solOp = ops[randInt(0, ops.length - 1)];
        const askMax = solOp === '<' || solOp === '≤';
        const askText = askMax ? '最大' : '最小';
        const integerAnswer = askMax ? maxIntegerForIneq(solOp, target) : minIntegerForIneq(solOp, target);
        if (integerAnswer === null || integerAnswer === undefined) continue;
        const rawOp = x0 > 0 ? solOp : flipInequality(solOp);
        const rightCoef = pickNonZero(-4, 4);
        const leftBias = randInt(-8, 8);
        const x0TimesTarget = (x0 * target.num) / target.den;
        if (!Number.isInteger(x0TimesTarget)) continue;
        const rightConst = x0TimesTarget - rightCoef * x0 + leftBias;
        if (rightConst < -18 || rightConst > 18) continue;
        const leftExpr = leftBias === 0 ? 'ax' : `ax${leftBias > 0 ? '+' : ''}${leftBias}`;
        const rightExpr = formatLinearExpr(rightCoef, rightConst);
        questions.push(
          `已知 $x=${x0}$ 為不等式 $${leftExpr}${displayIneqOp(rawOp)}${rightExpr}$ 的解，求 $a$ 的範圍，並求滿足條件的${askText}整數。`
        );
        answers.push(
          formatJ241Answer(
            `$a${displayIneqOp(solOp)}${fractionToLatex(target, true)}$，${askText}整數為 $${integerAnswer}$`,
            `把 $x=${x0}$ 代入，可得 $${x0}a${leftBias === 0 ? '' : `${leftBias > 0 ? '+' : ''}${leftBias}`}${displayIneqOp(rawOp)}${rightCoef * x0 + rightConst}$。整理得 $${x0}a${displayIneqOp(rawOp)}${rightCoef * x0 + rightConst - leftBias}$。再解得 $a${displayIneqOp(solOp)}${fractionToLatex(target, true)}$。因此滿足條件的${askText}整數為 $${integerAnswer}$。`
          )
        );
        built = true;
      }
      if (!built) {
        questions.push('已知 $x=-4$ 為不等式 $ax-5<2x+4$ 的解，求 $a$ 的範圍，並求滿足條件的最小整數。');
        answers.push(
          formatJ241Answer(
            '$a>-\\frac{1}{4}$，最小整數為 $0$',
            '把 $x=-4$ 代入，可得 $-4a-5<-4$。整理得 $-4a<1$，所以 $a>-\\frac{1}{4}$。因此滿足條件的最小整數為 $0$。'
          )
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ241SameSolutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const ops = ['>', '<', '≥', '≤'];

    function symbolWithConst(symbol, constant) {
      if (constant === 0) return symbol;
      return `${symbol}${constant > 0 ? '+' : ''}${constant}`;
    }

    for (let i = 0; i < count; i += 1) {
      const solOp = ops[randInt(0, ops.length - 1)];
      const target = randInt(-5, 7);
      const variant = i % 3;

      if (variant === 0) {
        const p = randInt(2, 6);
        const q = pickNonZero(-4, 4);
        const r = randInt(-5, 5);
        const A = p - q;
        if (A === 0) {
          i -= 1;
          continue;
        }
        const raw1 = A > 0 ? solOp : flipInequality(solOp);
        const rhs1 = A * target + p * r;

        const s = randInt(2, 5);
        const t = pickNonZero(-4, 4);
        const u = randInt(-5, 5);
        const B = s - t;
        if (B === 0) {
          i -= 1;
          continue;
        }
        const raw2 = B > 0 ? solOp : flipInequality(solOp);
        const a = randInt(-20, 20);
        const rhs2 = B * target + s * u - a;
        const secondConst = rhs2 - s * u;
        const secondRhs = symbolWithConst('a', secondConst);
        questions.push(
          `若不等式 $${p}(${formatLinearExpr(1, r)})${displayIneqOp(raw1)}${formatLinearExpr(q, rhs1)}$ 的解與 $${s}(${formatLinearExpr(1, u)})${displayIneqOp(raw2)}${formatLinearExpr(t, rhs2)}+a$ 的解相同，求 $a$。`
        );
        answers.push(
          formatJ241Answer(
            `$a=${a}$`,
            `先解第一個不等式，整理後得 $${formatIneqSolution(solOp, makeFraction(target))}$。第二個不等式展開整理後可化成 $${formatTerm(B, 'x')}${displayIneqOp(raw2)}${secondRhs}$。因為兩者解相同，所以界線也必須是 ${target}，即 $${secondRhs}=${B * target}$。解得 $a=${a}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const p = randInt(2, 5);
        const q = randInt(2, 5);
        const r = randInt(-4, 4);
        const u = randInt(-4, 4);
        const A = p - q;
        if (A === 0) {
          i -= 1;
          continue;
        }
        const raw1 = A > 0 ? solOp : flipInequality(solOp);
        const rhs1 = A * target + p * r - q * u;

        const s = randInt(2, 5);
        const t = randInt(2, 5);
        const B = s - t;
        if (B === 0) {
          i -= 1;
          continue;
        }
        const raw2 = B > 0 ? solOp : flipInequality(solOp);
        const m = randInt(-8, 8);
        const a = B * target + s * m - t * u;
        const secondConst = -(s * m - t * u);
        const secondRhs = symbolWithConst('a', secondConst);
        questions.push(
          `若 $${p}(${formatLinearExpr(1, r)})-${q}(${formatLinearExpr(1, u)})${displayIneqOp(raw1)}${rhs1}$ 的解與 $${s}(${formatLinearExpr(1, m)})-${t}(${formatLinearExpr(1, u)})${displayIneqOp(raw2)}a$ 的解相同，求 $a$。`
        );
        answers.push(
          formatJ241Answer(
            `$a=${a}$`,
            `第一個不等式展開整理後可得 $${formatIneqSolution(solOp, makeFraction(target))}$。第二個不等式化簡後是 $${formatTerm(B, 'x')}${displayIneqOp(raw2)}${secondRhs}$。由於兩式解相同，所以界線也應是 ${target}，因此 $${secondRhs}=${B * target}$，得 $a=${a}$。`
          )
        );
        continue;
      }

      const p = randInt(2, 5);
      const q = pickNonZero(-4, 4);
      const r = randInt(-4, 4);
      const A = p - q;
      if (A === 0) {
        i -= 1;
        continue;
      }
      const raw1 = A > 0 ? solOp : flipInequality(solOp);
      const rhs1 = A * target + p * r;

      const s = randInt(2, 5);
      const t = pickNonZero(-4, 4);
      const u = randInt(-5, 5);
      const B = s - t;
      if (B === 0) {
        i -= 1;
        continue;
      }
      const raw2 = B > 0 ? solOp : flipInequality(solOp);
      const a = B * target + s * u;
      const secondRhs = symbolWithConst('a', -s * u);
      questions.push(
        `若不等式 $${p}(${formatLinearExpr(1, r)})${displayIneqOp(raw1)}${formatLinearExpr(q, rhs1)}$ 的解與 $${s}(${formatLinearExpr(1, u)})${displayIneqOp(raw2)}${formatTerm(t, 'x')}+a$ 的解相同，求 $a$。`
      );
      answers.push(
        formatJ241Answer(
          `$a=${a}$`,
          `先把第一個不等式化簡，得 $${formatIneqSolution(solOp, makeFraction(target))}$。第二個不等式整理成 $${formatTerm(B, 'x')}${displayIneqOp(raw2)}${secondRhs}$。要和前式解相同，就要有 $${secondRhs}=${B * target}$，解得 $a=${a}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ241CompoundInequalitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const coefChoices = [-4, -3, -2, 2, 3, 4];

    for (let i = 0; i < count; i += 1) {
      const coef = coefChoices[randInt(0, coefChoices.length - 1)];
      const bias = randInt(-6, 6);
      const lowX = randInt(-5, 1);
      const highX = lowX + randInt(3, 7);
      const includeLow = randInt(0, 1) === 0;
      const includeHigh = randInt(0, 1) === 0;
      const lowPoint = makeFraction(lowX, 1);
      const highPoint = makeFraction(highX, 1);
      const valueAtLow = evalLinearAt(coef, bias, lowPoint);
      const valueAtHigh = evalLinearAt(coef, bias, highPoint);
      const increasing = coef > 0;
      const lowerY = increasing ? valueAtLow : valueAtHigh;
      const upperY = increasing ? valueAtHigh : valueAtLow;
      const leftOp = increasing ? (includeLow ? '\\le' : '<') : includeHigh ? '\\le' : '<';
      const rightOp = increasing ? (includeHigh ? '\\le' : '<') : includeLow ? '\\le' : '<';
      const solutionLeft = includeLow ? '\\le' : '<';
      const solutionRight = includeHigh ? '\\le' : '<';
      const solutionText = `${formatIneqBound(lowPoint)}${displayIneqOp(solutionLeft)}x${displayIneqOp(solutionRight)}${formatIneqBound(highPoint)}`;
      questions.push(
        `解不等式 $${formatIneqBound(lowerY)}${displayIneqOp(leftOp)}${formatLinearExpr(coef, bias)}${displayIneqOp(rightOp)}${formatIneqBound(upperY)}$。`
      );
      answers.push(
        formatJ241Answer(
          `$${solutionText}$`,
          coef > 0
            ? `因為 ${formatLinearExpr(coef, bias)} 隨 $x$ 增大而增大，所以直接同向解得 $${solutionText}$。`
            : `因為 ${formatLinearExpr(coef, bias)} 的係數是負數，除以負數時不等號方向要改變，解得 $${solutionText}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ241AbsoluteInequalitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const ops = ['<', '\\le', '>', '\\ge'];

    for (let i = 0; i < count; i += 1) {
      const center = randInt(-4, 4);
      const radius = randInt(1, 5);
      const op = ops[i % ops.length];
      const inner = formatLinearExpr(1, -center);
      const leftBound = center - radius;
      const rightBound = center + radius;
      let shortAnswer = '';
      let process = '';

      if (op === '<' || op === '\\le') {
        const leftOp = op === '<' ? '<' : '\\le';
        const rightOp = op === '<' ? '<' : '\\le';
        shortAnswer = `$${leftBound}${displayIneqOp(leftOp)}x${displayIneqOp(rightOp)}${rightBound}$`;
        process = `絕對值小於（或小於等於）某數，表示到中心 ${center} 的距離在 ${radius} 以內，所以 $${shortAnswer.slice(1, -1)}$。`;
      } else {
        const leftOp = op === '>' ? '<' : '\\le';
        const rightOp = op === '>' ? '>' : '\\ge';
        shortAnswer = `$x${displayIneqOp(leftOp)}${leftBound}$ 或 $x${displayIneqOp(rightOp)}${rightBound}$`;
        process = `絕對值大於（或大於等於）某數，表示到中心 ${center} 的距離至少為 ${radius}，所以解在兩側：${shortAnswer}。`;
      }

      questions.push(`解不等式 $|${inner}|${displayIneqOp(op)}${radius}$。`);
      answers.push(formatJ241Answer(shortAnswer, process));
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ241IntegerBoundarySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const solOps = ['>', '<', '\\ge', '\\le'];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const solOp = solOps[randInt(0, solOps.length - 1)];
        const target = makeFraction(randInt(-6, 8), 1);
        const coef = pickNonZero(-5, 5);
        const bias = randInt(-9, 9);
        const rawOp = coef > 0 ? solOp : flipInequality(solOp);
        const rhs = addFraction(mulFraction(makeFraction(coef, 1), target), makeFraction(bias, 1));
        const askMax = solOp === '<' || solOp === '\\le';
        const integerAnswer = askMax ? maxIntegerForIneq(solOp, target) : minIntegerForIneq(solOp, target);
        const askText = askMax ? '最大整數解' : '最小整數解';
        questions.push(
          `若 $x$ 為整數，且滿足 $${formatLinearExpr(coef, bias)}${displayIneqOp(rawOp)}${formatIneqBound(rhs)}$，求 $x$ 的${askText}。`
        );
        answers.push(
          formatJ241Answer(
            `${integerAnswer}`,
            `先解得 $${formatIneqSolution(solOp, target)}$，再依題意取整數，所以 ${askText}是 ${integerAnswer}。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const lowX = randInt(-5, 1);
        const highX = lowX + randInt(3, 7);
        const includeLow = randInt(0, 1) === 0;
        const includeHigh = randInt(0, 1) === 0;
        const coef = pickNonZero(-4, 4);
        const bias = randInt(-6, 6);
        const lowPoint = makeFraction(lowX, 1);
        const highPoint = makeFraction(highX, 1);
        const valueAtLow = evalLinearAt(coef, bias, lowPoint);
        const valueAtHigh = evalLinearAt(coef, bias, highPoint);
        const increasing = coef > 0;
        const lowerY = increasing ? valueAtLow : valueAtHigh;
        const upperY = increasing ? valueAtHigh : valueAtLow;
        const leftOp = increasing ? (includeLow ? '\\le' : '<') : includeHigh ? '\\le' : '<';
        const rightOp = increasing ? (includeHigh ? '\\le' : '<') : includeLow ? '\\le' : '<';
        const integerCount = countIntegersInInterval(lowPoint, includeLow, highPoint, includeHigh);
        const solutionText = `${formatIneqBound(lowPoint)}${displayIneqOp(includeLow ? '\\le' : '<')}x${displayIneqOp(includeHigh ? '\\le' : '<')}${formatIneqBound(highPoint)}`;
        questions.push(
          `若 $x$ 為整數，滿足 $${formatIneqBound(lowerY)}${displayIneqOp(leftOp)}${formatLinearExpr(coef, bias)}${displayIneqOp(rightOp)}${formatIneqBound(upperY)}$，共有幾個整數解？`
        );
        answers.push(
          formatJ241Answer(`${integerCount}`, `先解得 $${solutionText}$，再數出區間內的整數，共有 ${integerCount} 個。`)
        );
        continue;
      }

      const center = randInt(-3, 3);
      const radius = randInt(1, 4);
      const op = randInt(0, 1) === 0 ? '<' : '\\le';
      const inner = formatLinearExpr(1, -center);
      const low = makeFraction(center - radius, 1);
      const high = makeFraction(center + radius, 1);
      const include = op === '\\le';
      const integerCount = countIntegersInInterval(low, include, high, include);
      const boundText = `${formatIneqBound(low)}${displayIneqOp(include ? '\\le' : '<')}x${displayIneqOp(include ? '\\le' : '<')}${formatIneqBound(high)}`;
      questions.push(`若 $x$ 為整數，且滿足 $|${inner}|${displayIneqOp(op)}${radius}$，共有幾個整數解？`);
      answers.push(
        formatJ241Answer(
          `${integerCount}`,
          `由 $|${inner}|${displayIneqOp(op)}${radius}$ 可得 $${boundText}$，因此整數解共有 ${integerCount} 個。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ242AverageThresholdSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const contexts = [
      { noun: '小考', unit: '分', action: '考' },
      { noun: '練習測驗', unit: '分', action: '測驗' },
      { noun: '閱讀紀錄', unit: '頁', action: '閱讀' },
      { noun: '練習時間', unit: '分鐘', action: '練習' },
    ];

    for (let i = 0; i < count; i += 1) {
      const context = contexts[i % contexts.length];
      const knownCount = 3 + (i % 2);
      const targetAvg = randInt(72, 90);
      const knownAverage = targetAvg - randInt(4, 12);
      const knownTotal = knownAverage * knownCount;
      const totalCount = knownCount + 1;
      const needed = targetAvg * totalCount - knownTotal;
      questions.push(
        `某生前 ${knownCount} 次${context.noun}的平均是 ${knownAverage}${context.unit}。若第 ${totalCount} 次也算進去後，平均至少要達到 ${targetAvg}${context.unit}，那麼第 ${totalCount} 次至少要${context.action}多少${context.unit}？`
      );
      answers.push(
        formatJ242Answer(
          `${needed}${context.unit}`,
          `設第 ${totalCount} 次為 $x$，則平均門檻可列為 $\\dfrac{${knownTotal}+x}{${totalCount}}\\ge ${targetAvg}$。解得 $x\\ge ${needed}$，所以至少要${context.action} ${needed}${context.unit}。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ242BasicWordSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 6;
      const cycle = Math.floor(i / 6);

      if (variant === 0) {
        const countItem = 4 + (cycle % 4);
        const budget = 90 + cycle * 17 + countItem;
        const bound = fractionToLatex(makeFraction(budget, countItem), true);
        questions.push(`預算購買：一枝螢光筆 $x$ 元，買 ${countItem} 枝的總價不到 ${budget} 元，求 $x$ 的範圍。`);
        answers.push(
          formatJ242Answer(
            `$x<${bound}$`,
            `依題意可列不等式 $${countItem}x<${budget}$。兩邊同除以 ${countItem}，得 $x<${bound}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const names = ['小涵', '小宇', '小晴', '小恩', '小妍', '小杰', '小蓉', '小翔'];
        const name = names[cycle % names.length];
        const gain = 4 + ((cycle * 5 + 1) % 8);
        const limit = 56 + ((cycle * 11 + 3) % 31);
        questions.push(`體重限制：${name}現在體重 $x$ 公斤，增加 ${gain} 公斤後超過 ${limit} 公斤，求 $x$ 的範圍。`);
        answers.push(
          formatJ242Answer(`$x>${limit - gain}$`, `依題意可列 $x+${gain}>${limit}$，所以 $x>${limit - gain}$。`)
        );
        continue;
      }

      if (variant === 2) {
        const a = 70 + ((cycle * 7 + 3) % 23);
        const b = 74 + ((cycle * 11 + 5) % 23);
        const needScore = 80 + ((cycle * 13 + 7) % 21);
        const target = a + b + needScore;
        questions.push(
          `考試總分：三次數學測驗分數分別為 ${a}、${b}、$x$ 分，總分達 ${target} 分以上，求 $x$ 的最小值。`
        );
        answers.push(
          formatJ242Answer(
            `${target - a - b} 分`,
            `依題意：$${a}+${b}+x≥${target}$。整理得 $x≥${target - a - b}$，所以 $x$ 的最小值是 ${target - a - b}。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const start = 120 + ((cycle * 37 + 11) % 301);
        const daily = 20 + ((cycle * 17 + 9) % 71);
        const plannedDays = 4 + ((cycle * 5 + 2) % 7);
        const shortage = 5 + ((cycle * 11 + 3) % 21);
        const goal = start + daily * plannedDays - shortage;
        questions.push(
          `存款目標：小安已經有 ${start} 元，每天存 ${daily} 元，想買 ${goal} 元的物品，至少要再存 $x$ 天才夠，求 $x$ 的範圍。`
        );
        const need = goal - start;
        const bound = fractionToLatex(makeFraction(need, daily), true);
        const minDays = Math.ceil(need / daily);
        answers.push(
          formatJ242Answer(
            `至少 ${minDays} 天（$x≥${bound}$）`,
            `依題意可列 $${daily}x+${start}≥${goal}$，整理得 $${daily}x≥${need}$，所以 $x≥${bound}$。若以天數計，至少要 ${minDays} 天。`
          )
        );
        continue;
      }

      if (variant === 4) {
        const kids = 4 + ((cycle * 3 + 1) % 7);
        const each = 4 + ((cycle * 5 + 2) % 8);
        questions.push(`基礎分配：將 $x$ 顆糖果分給 ${kids} 位小朋友，每人至少得 ${each} 顆，求糖果總數的最小值。`);
        answers.push(
          formatJ242Answer(
            `${kids * each} 顆`,
            `每人至少 ${each} 顆，${kids} 人至少共要 $${kids}\\times ${each}=${kids * each}$ 顆，所以 $x≥${kids * each}$，最小值是 ${kids * each}。`
          )
        );
        continue;
      }

      const length = 6 + ((cycle * 7 + 2) % 10);
      const heightBase = 4 + ((cycle * 5 + 1) % 8);
      const areaLimit = length * heightBase - (1 + ((cycle * 3) % (length - 1)));
      const bound = fractionToLatex(makeFraction(areaLimit, length), true);
      questions.push(`矩形面積：長方形長是 ${length}，寬是 $x$，若面積不到 ${areaLimit} 平方公分，求 $x$ 的範圍。`);
      answers.push(formatJ242Answer(`$x<${bound}$`, `依題意可列 $${length}x<${areaLimit}$，因此 $x<${bound}$。`));
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ242RegularWordSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 6;

      if (variant === 0) {
        const books = randInt(3, 6);
        const gift = randInt(80, 160);
        const pay = randInt(420, 650);
        const threshold = randInt(40, 110);
        const spendLimit = pay - threshold;
        const bound = fractionToLatex(makeFraction(spendLimit - gift, books), true);
        questions.push(
          `購物找零：小萱買了 ${books} 本每本 $x$ 元的書與一個 ${gift} 元的飾品，付 ${pay} 元找回的錢超過 ${threshold} 元，求 $x$ 的範圍。`
        );
        answers.push(
          formatJ242Answer(
            `$x<${bound}$`,
            `找回超過 ${threshold} 元，表示實際花費不到 ${pay - threshold} 元。可列不等式 $${books}x+${gift}<${spendLimit}$，整理得 $x<${bound}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const start = randInt(50, 100);
        const step = randInt(4, 8);
        const totalCap = start + step * randInt(18, 30) - randInt(3, 15);
        questions.push(
          `計程車資：起跳價 ${start} 元，每跳一次加 ${step} 元，跳了 $x$ 次後總價不到 ${totalCap} 元，求 $x$ 的最大整數值。`
        );
        const rhs = totalCap - start;
        const bound = makeFraction(rhs, step);
        const boundText = fractionToLatex(bound, true);
        const maxValue = maxIntegerForIneq('<', bound);
        answers.push(
          formatJ242Answer(
            `${maxValue}`,
            `依題意：$${step}x+${start}<${totalCap}$，所以 $${step}x<${rhs}$，得 $x<${boundText}$。因此 $x$ 的最大整數值是 ${maxValue}。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const totalStudents = randInt(30, 45);
        const boys = randInt(14, totalStudents - 8);
        const girls = totalStudents - boys;
        const delta = randInt(1, 4);
        const targetAvg = boys + girls > 0 ? randInt(68, 86) : 70;
        questions.push(
          `平均分數：${totalStudents} 位學生中男生 ${boys} 位，男生平均 $x$ 分，女生平均比男生多 ${delta} 分，全班平均不低於 ${targetAvg} 分，求 $x$ 的範圍。`
        );
        const coef = totalStudents;
        const rhs = targetAvg * totalStudents - girls * delta;
        const bound = fractionToLatex(makeFraction(rhs, coef), true);
        answers.push(
          formatJ242Answer(
            `$x≥${bound}$`,
            `女生平均為 $x+${delta}$ 分，所以全班總分至少為 $${targetAvg}\\times ${totalStudents}$。可列 $${boys}x+${girls}(x+${delta})≥${targetAvg * totalStudents}$。整理得 $${coef}x≥${rhs}$，所以 $x≥${bound}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const base = randInt(4, 10);
        const low = randInt(10, 18);
        const high = low + randInt(3, 7);
        questions.push(
          `三角形面積：三角形底為 ${base}，高為 $(x-2)$，面積大於 ${low} 但不超過 ${high}，求 $x$ 的範圍。`
        );
        const lowBound = addFraction(makeFraction(2 * low, base), makeFraction(2));
        const highBound = addFraction(makeFraction(2 * high, base), makeFraction(2));
        const rangeText = `$x>${fractionToLatex(lowBound, true)}$ 且 $x≤${fractionToLatex(highBound, true)}$`;
        answers.push(
          formatJ242Answer(
            rangeText,
            `面積為 $\\dfrac{${base}(x-2)}{2}$，依題意：$${low}<\\dfrac{${base}(x-2)}{2}≤${high}$。同乘以 $\\dfrac{2}{${base}}$ 並整理，可得 ${rangeText}。`
          )
        );
        continue;
      }

      if (variant === 4) {
        const rate = randInt(20, 50);
        const cap = rate * randInt(4, 8);
        questions.push(
          `停車費率：某停車場每小時收費 ${rate} 元，不滿 1 小時以 1 小時計。若停了 $x$ 小時（$x>0$），總費用不超過 ${cap} 元，求 $x$ 的範圍。`
        );
        const bound = fractionToLatex(makeFraction(cap, rate), true);
        const maxHours = Math.floor(cap / rate);
        answers.push(
          formatJ242Answer(
            `$0<x≤${bound}$，最多 ${maxHours} 小時`,
            `每小時計費，總費用不超過 ${cap} 元表示計費時數至多為 $${cap}\div ${rate}=${maxHours}$ 小時。因此 $0<x≤${bound}$，最多可停 ${maxHours} 小時。`
          )
        );
        continue;
      }

      const younger = randInt(8, 15);
      const gap = randInt(6, 12);
      questions.push(
        `年齡限制：小恩今年 $x$ 歲，小岩 ${younger} 歲，兩人歲數至少相差 ${gap} 歲且小恩較大，求 $x$ 的範圍。`
      );
      answers.push(
        formatJ242Answer(
          `$x≥${younger + gap}$`,
          `因為小恩較大，且年齡至少差 ${gap} 歲，所以 $x-${younger}≥${gap}$。整理得 $x≥${younger + gap}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ242AdvancedWordSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 6;
      const cycle = Math.floor(i / 6);

      if (variant === 0) {
        const unplacedChoices = [8, 9, 10, 11, 12, 13, 14, 15, 16];
        const unplaced = unplacedChoices[cycle % unplacedChoices.length];
        const possibleRooms = Array.from({ length: 30 }, (_, idx) => idx + 1).filter(
          (n) => 7 * (n - 1) < 5 * n + unplaced && 5 * n + unplaced < 7 * n
        );
        const roomText = possibleRooms.join('、');
        const lowerText = fractionToLatex(makeFraction(unplaced, 2), true);
        const upperText = fractionToLatex(makeFraction(unplaced + 7, 2), true);
        questions.push(
          `宿舍分配：有一群學生分配宿舍，若每間住 5 人，則 ${unplaced} 人無房可住；若每間住 7 人，則有一間住不滿但非空房。求宿舍可能的間數。`
        );
        answers.push(
          formatJ242Answer(
            `${roomText} 間`,
            `設宿舍有 $x$ 間，則學生總數可寫成 $5x+${unplaced}$。若每間住 7 人，因為有一間住不滿但不是空房，所以滿足 $7(x-1)<5x+${unplaced}<7x$。整理後得到 $x>${lowerText}$ 且 $x<${upperText}$。因此宿舍可能的整數間數是 ${roomText}。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const total = 25;
        const score = 4;
        const penalty = 1;
        const boundChoices = [76, 79, 82, 85, 88, 91];
        const bound = boundChoices[cycle % boundChoices.length];
        questions.push(
          `計分扣分制：數學測驗共 ${total} 題，對 1 題得 ${score} 分，錯 1 題倒扣 ${penalty} 分。小威全部作答，錯了 $x$ 題且得分超過 ${bound} 分，求 $x$ 的最大值。`
        );
        const rhs = score * total - bound;
        const coef = score + penalty;
        const boundFrac = makeFraction(rhs, coef);
        const boundText = fractionToLatex(boundFrac, true);
        const maxWrong = maxIntegerForIneq('<', boundFrac);
        answers.push(
          formatJ242Answer(
            `${maxWrong} 題`,
            `若錯 $x$ 題，則對了 $${total}-x$ 題，得分為 $${score}(${total}-x)${formatTerm(-penalty, 'x')}$。依題意：$${score}(${total}-x)${formatTerm(-penalty, 'x')}>${bound}$，整理得 $${coef}x<${score * total - bound}$，即 $x<${boundText}$。因此 $x$ 的最大值是 ${maxWrong}。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const thresholdChoices = [20, 21, 22, 24, 25, 27, 30];
        const lowFeeChoices = [10, 12, 14, 11, 13, 15, 16];
        const feeGapChoices = [5, 6, 7, 4, 6, 5, 7];
        const threshold = thresholdChoices[cycle % thresholdChoices.length];
        const lowFee = lowFeeChoices[cycle % lowFeeChoices.length];
        const highFee = lowFee + feeGapChoices[cycle % feeGapChoices.length];
        questions.push(
          `分段郵資：寄 $x$ 公克的限時郵件，若 ${threshold} 公克以下郵資為 ${lowFee} 元，超過 ${threshold} 公克且不超過 ${threshold + 30} 公克郵資為 ${highFee} 元。若付 ${highFee} 元郵資，求 $x$ 的範圍。`
        );
        answers.push(
          formatJ242Answer(
            `$${threshold}<x≤${threshold + 30}$`,
            `付 ${highFee} 元代表重量已超過 ${threshold} 公克，但沒有超過 ${threshold + 30} 公克，所以 $${threshold}<x≤${threshold + 30}$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const volumeTemplates = [
          { first: 3, extra: 2, gaps: [120, 135, 150, 165, 180] },
          { first: 2, extra: 2, gaps: [80, 100, 120, 140, 160] },
          { first: 4, extra: 2, gaps: [120, 144, 168, 192, 216] },
        ];
        const template = volumeTemplates[cycle % volumeTemplates.length];
        const gap = template.gaps[cycle % template.gaps.length];
        const water = (18 + ((cycle * 5 + 3) % 14)) * 10;
        const cup = water + gap;
        const totalBeads = template.first + template.extra;
        const lowerBound = fractionToLatex(makeFraction(gap, totalBeads), true);
        const upperBound = fractionToLatex(makeFraction(gap, template.first), true);
        questions.push(
          `體積位移：${cup}cc 的杯子裡先裝 ${water}cc 的水，放入 ${template.first} 顆玻璃珠後水未滿；再放 ${template.extra} 顆則溢出。若每顆玻璃珠體積為 $x$ cc，求 $x$ 的範圍。`
        );
        answers.push(
          formatJ242Answer(
            `$${lowerBound}<x<${upperBound}$`,
            `放入 ${template.first} 顆後未滿：$${water}+${template.first}x<${cup}$；再放 ${template.extra} 顆後共有 ${totalBeads} 顆且溢出：$${water}+${totalBeads}x>${cup}$。整理得 $x<${upperBound}$ 且 $x>${lowerBound}$，所以 $${lowerBound}<x<${upperBound}$。`
          )
        );
        continue;
      }

      if (variant === 4) {
        const ticketOptions = [160, 180, 200, 220, 240, 280, 320];
        const discountPeopleOptions = [16, 20, 24, 28, 32];
        const ticket = ticketOptions[cycle % ticketOptions.length];
        const discountPeople = discountPeopleOptions[cycle % discountPeopleOptions.length];
        const discountPrice = (ticket * 3) / 4;
        const groupCost = discountPrice * discountPeople;
        const minPeople = Math.floor(groupCost / ticket) + 1;
        questions.push(
          `門票團體折價：門票每張 ${ticket} 元，${discountPeople} 人以上可打 75 折。若團體人數 $x$ 人（且 $x<${discountPeople}$），直接買 ${discountPeople} 張團體票反而更便宜，求 $x$ 的最小值。`
        );
        answers.push(
          formatJ242Answer(
            `${minPeople} 人`,
            `買 $x$ 張原價票需 $${ticket}x$ 元；直接買 ${discountPeople} 張團體票需 $${discountPrice}\\times ${discountPeople}=${groupCost}$ 元。依題意：$${groupCost}<${ticket}x$，所以 $x>${fractionToLatex(makeFraction(groupCost, ticket), true)}$。又 $x$ 是整數且 $x<${discountPeople}$，故最小值是 $${minPeople}$。`
          )
        );
        continue;
      }

      if (variant === 5) {
        const voteChoices = [31, 34, 37, 40, 43];
        const totalVotes = voteChoices[cycle % voteChoices.length];
        questions.push(
          `選舉席次判定：某班要從 4 位候選人中選出得票最高的 2 人參加比賽。若有效票共 ${totalVotes} 票，阿文目前得 $x$ 票，至少要得幾票才能保證當選？`
        );
        const bound = makeFraction(totalVotes, 3);
        const minVote = Math.floor(totalVotes / 3) + 1;
        answers.push(
          formatJ242Answer(
            `${minVote} 票`,
            `若阿文得 $x$ 票，剩下 ${totalVotes}-$x$ 票要分給另外 3 人。要讓阿文無法保證當選，至少要有 2 個人各得 $x$ 票，因此必須滿足 $${totalVotes}-x\\ge 2x$。所以要保證當選，就要 $${totalVotes}-x<2x$，整理得 $x>${fractionToLatex(bound, true)}$。又票數是整數，所以至少要 ${minVote} 票。`
          )
        );
        continue;
      }
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

  function buildJ251FrequencyRelativeCumulativeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const labelsPool = [
      ['60-69 分', '70-79 分', '80-89 分', '90-99 分'],
      ['小說', '散文', '漫畫', '科普'],
      ['步行', '自行車', '公車', '家長接送'],
      ['紅茶', '綠茶', '奶茶', '冬瓜茶'],
    ];

    function tableText(labels, counts) {
      return labels.map((label, idx) => `${label}：${counts[idx]}`).join('，');
    }

    for (let i = 0; i < count; i += 1) {
      const labels = labelsPool[i % labelsPool.length];
      const counts = labels.map(() => randInt(4, 14));
      const total = counts.reduce((sum, value) => sum + value, 0);
      const variant = i % 3;

      if (variant === 0) {
        const targetIndex = randInt(0, labels.length - 1);
        const rate = makeFraction(counts[targetIndex] * 100, total);
        questions.push(
          `某次調查的次數分配如下：${tableText(labels, counts)}。求「${labels[targetIndex]}」的相對次數（百分率）。`
        );
        answers.push(
          formatPracticeShortAnswer(
            `$${fractionToLatex(rate, true)}\\%$`,
            `相對次數 $= \\dfrac{${counts[targetIndex]}}{${total}} = ${fractionToLatex(rate, true)}\\%$`
          )
        );
        continue;
      }

      if (variant === 1) {
        const targetIndex = randInt(1, labels.length - 1);
        const cumulative = counts.slice(0, targetIndex + 1).reduce((sum, value) => sum + value, 0);
        questions.push(
          `某次調查的次數分配如下：${tableText(labels, counts)}。求到「${labels[targetIndex]}」為止的累積次數。`
        );
        answers.push(
          formatPracticeShortAnswer(
            `${cumulative}`,
            `累積次數就是前面各組次數相加：${counts.slice(0, targetIndex + 1).join('+')} = ${cumulative}`
          )
        );
        continue;
      }

      const missingIndex = randInt(0, labels.length - 1);
      const knownSum = total - counts[missingIndex];
      questions.push(
        `某次調查共得到 ${total} 筆資料，其中次數分配表為：${labels
          .map((label, idx) => `${label}：${idx === missingIndex ? 'x' : counts[idx]}`)
          .join('，')}。求 $x$。`
      );
      answers.push(
        formatPracticeShortAnswer(
          `${counts[missingIndex]}`,
          `總次數等於各組次數和，所以 $x+${knownSum}=${total}$，解得 $x=${counts[missingIndex]}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ251PieChartConversionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const categoryPool = [
      ['籃球社', '排球社', '羽球社', '其他'],
      ['紅茶', '綠茶', '奶茶', '其他'],
      ['步行', '自行車', '公車', '其他'],
      ['A 款', 'B 款', 'C 款', '其他'],
    ];

    for (let i = 0; i < count; i += 1) {
      const categories = categoryPool[i % categoryPool.length];
      const base = [20, 25, 30, 0];
      base[3] = 100 - base[0] - base[1] - base[2];
      const rotate = i % categories.length;
      const percentages = base.map((_, idx) => base[(idx + rotate) % base.length]);
      const total = [40, 80, 120, 200, 240][i % 5];
      const targetIndex = randInt(0, categories.length - 1);
      const variant = i % 3;

      if (variant === 0) {
        const people = (total * percentages[targetIndex]) / 100;
        questions.push(
          `某調查共有 ${total} 人，各類別所占百分比如下：${categories.map((name, idx) => `${name} ${percentages[idx]}%`).join('，')}。求「${categories[targetIndex]}」有多少人。`
        );
        answers.push(
          formatPracticeShortAnswer(
            `$${people}$ 人`,
            `${categories[targetIndex]}的人數 = $${total} \\times ${percentages[targetIndex]}\\% = ${people}$`
          )
        );
        continue;
      }

      if (variant === 1) {
        const angle = (360 * percentages[targetIndex]) / 100;
        questions.push(
          `某圓形圖中各類別百分比如下：${categories.map((name, idx) => `${name} ${percentages[idx]}%`).join('，')}。求「${categories[targetIndex]}」對應的圓心角。`
        );
        answers.push(
          formatPracticeShortAnswer(`$${angle}°$`, `圓心角 $= 360° \\times ${percentages[targetIndex]}\\% = ${angle}°$`)
        );
        continue;
      }

      const angle = (360 * percentages[targetIndex]) / 100;
      questions.push(`某圓形圖中，「${categories[targetIndex]}」的圓心角是 ${angle}°。求它占全部的百分之幾。`);
      answers.push(
        formatPracticeShortAnswer(
          `$${percentages[targetIndex]}\\%$`,
          `百分率 $= \\dfrac{${angle}}{360} = ${fractionToLatex(makeFraction(angle, 360), true)} = ${percentages[targetIndex]}\\%$`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ251GroupedMeanEstimateSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const start = 20 + 5 * (i % 4);
      const width = [5, 10][i % 2];
      const freq = [randInt(4, 9), randInt(6, 12), randInt(5, 11), randInt(3, 8)];
      const intervals = Array.from({ length: 4 }, (_, idx) => {
        const low = start + idx * width;
        return { low, high: low + width, mid: low + width / 2 };
      });
      const weighted = intervals.reduce((sum, item, idx) => sum + item.mid * freq[idx], 0);
      const total = freq.reduce((sum, value) => sum + value, 0);
      const mean = makeFraction(weighted, total);
      questions.push(
        `某組資料的分組次數如下：${intervals.map((item, idx) => `${item.low}～未滿 ${item.high}：${freq[idx]}`).join('，')}。若以各組組中點估計，求這組資料的平均數。`
      );
      answers.push(
        formatPracticeShortAnswer(
          `$${fractionToLatex(mean, true)}$`,
          `先取組中點：$${intervals.map((item) => item.mid).join('、')}$。估計平均數 $= \\dfrac{${intervals.map((item, idx) => `${item.mid}\\times ${freq[idx]}`).join('+')}}{${total}} = ${fractionToLatex(mean, true)}$`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ252MeanBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2;
      if (variant === 0) {
        const numbers = Array.from({ length: 5 }, () => randInt(50, 95));
        const total = numbers.reduce((sum, value) => sum + value, 0);
        const mean = makeFraction(total, numbers.length);
        questions.push(`一組資料為 ${numbers.join('、')}，求這組資料的平均數。`);
        answers.push(
          formatPracticeShortAnswer(
            `$${fractionToLatex(mean, true)}$`,
            `平均數 $= \\dfrac{${numbers.join('+')}}{${numbers.length}} = ${fractionToLatex(mean, true)}$`
          )
        );
        continue;
      }

      const values = [randInt(10, 15), randInt(16, 21), randInt(22, 27), randInt(28, 33)];
      const freqs = values.map(() => randInt(2, 6));
      const totalFreq = freqs.reduce((sum, value) => sum + value, 0);
      const totalValue = values.reduce((sum, value, idx) => sum + value * freqs[idx], 0);
      const mean = makeFraction(totalValue, totalFreq);
      questions.push(
        `某組資料的數值與次數如下：${values.map((value, idx) => `${value} 出現 ${freqs[idx]} 次`).join('，')}。求平均數。`
      );
      answers.push(
        formatPracticeShortAnswer(
          `$${fractionToLatex(mean, true)}$`,
          `平均數 $= \\dfrac{${values.map((value, idx) => `${value}\\times ${freqs[idx]}`).join('+')}}{${totalFreq}} = ${fractionToLatex(mean, true)}$`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ252MeanReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      if (variant === 0) {
        const values = [randInt(2, 9), randInt(2, 9), randInt(2, 9), randInt(2, 9)];
        const targetMean = randInt(4, 10);
        const total = targetMean * 5;
        const knownSum = values.reduce((sum, value) => sum + value, 0);
        const x = total - knownSum;
        questions.push(`一組資料為 ${values.join('、')}、$x$，其平均數是 ${targetMean}，求 $x$。`);
        answers.push(
          formatPracticeShortAnswer(
            `$${x}$`,
            `由平均數可得總和為 $${targetMean}\\times 5=${total}$，所以 $x=${total}-(${knownSum})=${x}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const totalPeople = 30 + 5 * (i % 3);
        const boys = 10 + 5 * (i % 4);
        const girls = totalPeople - boys;
        const totalMean = randInt(68, 82);
        const boysMean = totalMean + randInt(3, 8);
        const totalScore = totalPeople * totalMean;
        const girlsTotal = totalScore - boys * boysMean;
        const girlsMean = makeFraction(girlsTotal, girls);
        questions.push(
          `某班共有 ${totalPeople} 人，平均分數是 ${totalMean} 分，其中 ${boys} 位男生平均 ${boysMean} 分，求女生的平均分數。`
        );
        answers.push(
          formatPracticeShortAnswer(
            `${fractionToLatex(girlsMean, true)} 分`,
            `全班總分 = $${totalPeople}\\times ${totalMean}=${totalScore}$，男生總分 $= ${boys}\\times ${boysMean}=${boys * boysMean}$，所以女生平均 $= \\dfrac{${girlsTotal}}{${girls}} = ${fractionToLatex(girlsMean, true)}$`
          )
        );
        continue;
      }

      const oldCount = 4 + (i % 2);
      const oldMean = randInt(60, 85);
      const newValue = randInt(70, 95);
      const newMean = makeFraction(oldCount * oldMean + newValue, oldCount + 1);
      questions.push(`原本 $${oldCount}$ 個數的平均數是 $${oldMean}$，若再加入一個數 $${newValue}$，求新的平均數。`);
      answers.push(
        formatPracticeShortAnswer(
          `$${fractionToLatex(newMean, true)}$`,
          `新平均 $= \\dfrac{${oldCount}\\times ${oldMean}+${newValue}}{${oldCount + 1}} = ${fractionToLatex(newMean, true)}$`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ252MedianModeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function buildOddOrderedList() {
      const values = [];
      let current = randInt(3, 8);
      for (let i = 0; i < 7; i += 1) {
        current += randInt(0, 3);
        values.push(current);
      }
      return values.sort((a, b) => a - b);
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      if (variant === 0) {
        const values = buildOddOrderedList();
        const median = values[Math.floor(values.length / 2)];
        questions.push(`一組已由小到大排列的資料為 ${values.join('、')}，求中位數。`);
        answers.push(
          formatPracticeShortAnswer(
            `${median}`,
            `共有 ${values.length} 個數，中位數是第 ${Math.floor(values.length / 2) + 1} 個數，所以中位數是 ${median}。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const values = [randInt(2, 5), randInt(6, 9), randInt(10, 13), randInt(14, 17)];
        const freqs = [randInt(2, 4), randInt(5, 8), randInt(2, 4), randInt(1, 3)];
        freqs[1] = Math.max(...freqs) + 1;
        const mode = values[1];
        questions.push(
          `某組資料的數值與次數如下：${values.map((value, idx) => `${value} 出現 ${freqs[idx]} 次`).join('，')}。求眾數。`
        );
        answers.push(
          formatPracticeShortAnswer(`${mode}`, `出現次數最多的是 ${mode}，共出現 ${freqs[1]} 次，所以眾數是 ${mode}。`)
        );
        continue;
      }

      const values = [randInt(1, 4), randInt(5, 8), randInt(9, 12), randInt(13, 16)];
      const freqs = [randInt(2, 4), randInt(2, 5), randInt(2, 4), randInt(1, 3)];
      freqs[2] = Math.max(...freqs) + 1;
      const total = freqs.reduce((sum, value) => sum + value, 0);
      if (total % 2 === 0) freqs[0] += 1;
      const totalOdd = freqs.reduce((sum, value) => sum + value, 0);
      const middlePos = Math.floor(totalOdd / 2) + 1;
      let running = 0;
      let median = values[0];
      for (let idx = 0; idx < values.length; idx += 1) {
        running += freqs[idx];
        if (running >= middlePos) {
          median = values[idx];
          break;
        }
      }
      const maxFreq = Math.max(...freqs);
      const modes = values.filter((_, idx) => freqs[idx] === maxFreq);
      const modeText = modes.join('、');
      questions.push(
        `某組資料的數值與次數如下：${values.map((value, idx) => `${value} 出現 ${freqs[idx]} 次`).join('，')}。求中位數與眾數。`
      );
      answers.push(
        formatPracticeShortAnswer(
          `中位數 ${median}，眾數 ${modeText}`,
          `總共有 ${totalOdd} 個數，第 ${middlePos} 個數落在 ${median}，所以中位數是 ${median}；出現次數最多的是 ${modeText}，所以眾數是 ${modeText}。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ251PieBackwardPopulationCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const angle = [72, 90, 120, 144, 60][cycle % 5];
        const part = [12, 25, 40, 32, 15][cycle % 5];
        const total = (part * 360) / angle;
        questions.push(`在一份圓形圖中，「排球社」的圓心角是 ${angle}°，且該社有 ${part} 人，求全體受訪者共有多少人。`);
        answers.push(
          formatPracticeShortAnswer(
            `${total} 人`,
            `此類占全體 $\\dfrac{${angle}}{360}$，所以全體人數為 $${part}\\div\\dfrac{${angle}}{360}=${total}$ 人。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const total = [180, 240, 300, 360, 420][cycle % 5];
        const otherPercent = [15, 20, 25, 30, 10][cycle % 5];
        const targetPercent = [25, 30, 35, 15, 40][cycle % 5];
        const otherCount = (total * otherPercent) / 100;
        const targetCount = (total * targetPercent) / 100;
        questions.push(
          `圓形圖中「其他」占 ${otherPercent}% ，對應人數為 ${otherCount} 人。求「籃球社」（占 ${targetPercent}%）的人數。`
        );
        answers.push(
          formatPracticeShortAnswer(
            `${targetCount} 人`,
            `先反推總人數：$${otherCount}\\div ${otherPercent}\\%=${total}$。籃球社人數為 $${total}\\times ${targetPercent}\\%=${targetCount}$ 人。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const total = [500, 640, 720, 960, 840][cycle % 5];
        const ratio = [
          [2, 3],
          [3, 5],
          [4, 5],
          [5, 7],
          [3, 4],
        ][cycle % 5];
        const sumCount = total / 2;
        const red = makeFraction(sumCount * ratio[0], ratio[0] + ratio[1]);
        const green = makeFraction(sumCount * ratio[1], ratio[0] + ratio[1]);
        questions.push(
          `已知「紅茶」與「綠茶」的圓心角共為 180°，且兩者人數比為 $${ratio[0]}:${ratio[1]}$。若總人數為 ${total} 人，求兩者各有多少人。`
        );
        answers.push(
          formatPracticeShortAnswer(
            `紅茶 ${fractionToLatex(red, true)} 人，綠茶 ${fractionToLatex(green, true)} 人`,
            `180° 表示兩者共占一半，所以共有 ${sumCount} 人。再按 $${ratio[0]}:${ratio[1]}$ 分配，得紅茶 ${fractionToLatex(red, true)} 人、綠茶 ${fractionToLatex(green, true)} 人。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const ratio = [
          [2, 3, 5],
          [3, 4, 5],
          [1, 2, 3],
          [4, 5, 6],
          [2, 5, 8],
        ][cycle % 5];
        const target = cycle % 3;
        const totalParts = ratio.reduce((sum, value) => sum + value, 0);
        const angle = makeFraction(360 * ratio[target], totalParts);
        questions.push(
          `某圓形圖中 A、B、C 三類別的人數比為 $${ratio.join(':')}$。求 ${['A', 'B', 'C'][target]} 類對應的圓心角。`
        );
        answers.push(
          formatPracticeShortAnswer(
            `$${fractionToLatex(angle, true)}°$`,
            `總份數為 ${totalParts}，目標類別占 ${ratio[target]} 份，所以圓心角為 $360°\\times\\dfrac{${ratio[target]}}{${totalParts}}=${fractionToLatex(angle, true)}°$。`
          )
        );
        continue;
      }

      const percent = [12, 15, 20, 25, 30][cycle % 5];
      const angle = (360 * percent) / 100;
      questions.push(`給定某類別的圓心角為 ${angle}°，求該類別占全體的百分比。`);
      answers.push(
        formatPracticeShortAnswer(`$${percent}\\%$`, `百分比為 $\\dfrac{${angle}}{360}\\times100\\%=${percent}\\%$。`)
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ251PercentAngleHybridCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const angle = [54, 72, 90, 108, 126][cycle % 5];
        const total = [400, 500, 600, 800, 1000][cycle % 5];
        const percent = makeFraction(angle * 100, 360);
        const amount = divFraction(mulFraction(makeFraction(total, 1), percent), makeFraction(100, 1));
        questions.push(`若「遊戲道具 A」的圓心角是 ${angle}°，求其百分比；若總數為 ${total} 個，A 有多少個？`);
        answers.push(
          formatPracticeShortAnswer(
            `$${fractionToLatex(percent, true)}\\%$，$${fractionToLatex(amount, true)}$ 個`,
            `百分比 $=\\dfrac{${angle}}{360}\\times100\\%=${fractionToLatex(percent, true)}\\%$。個數為 $${total}\\times ${fractionToLatex(percent, true)}\\%=${fractionToLatex(amount, true)}$ 個。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const angles = [
          [120, 90, 60],
          [100, 80, 70],
          [144, 72, 54],
          [150, 90, 30],
          [108, 96, 84],
        ][cycle % 5];
        const missing = 360 - angles.reduce((sum, value) => sum + value, 0);
        const percent = makeFraction(missing * 100, 360);
        questions.push(`圓形圖中有四個扇形，其中三個圓心角分別為 ${angles.join('°、')}°，求第四個扇形占全部的百分比。`);
        answers.push(
          formatPracticeShortAnswer(
            `$${fractionToLatex(percent, true)}\\%$`,
            `第四個圓心角為 $360°-(${angles.join('+')})°=${missing}°$，所以百分比為 $\\dfrac{${missing}}{360}\\times100\\%=${fractionToLatex(percent, true)}\\%$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const aFrac = [
          makeFraction(1, 8),
          makeFraction(1, 6),
          makeFraction(1, 5),
          makeFraction(1, 4),
          makeFraction(3, 10),
        ][cycle % 5];
        const bPercent = [20, 25, 30, 15, 35][cycle % 5];
        const aAngle = mulFraction(makeFraction(360, 1), aFrac);
        const bAngle = makeFraction(360 * bPercent, 100);
        const diff = makeFraction(Math.abs(aAngle.num * bAngle.den - bAngle.num * aAngle.den), aAngle.den * bAngle.den);
        questions.push(
          `已知 A 部分占 $${fractionToLatex(aFrac)}$，B 部分占 ${bPercent}% ，求兩者對應的圓心角相差多少度。`
        );
        answers.push(
          formatPracticeShortAnswer(
            `$${fractionToLatex(diff, true)}°$`,
            `A 的圓心角為 ${fractionToLatex(aAngle, true)}°，B 的圓心角為 ${fractionToLatex(bAngle, true)}°，相差 $${fractionToLatex(diff, true)}°$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const totalPercent = [40, 50, 60, 30, 70][cycle % 5];
        const ratio = [
          [3, 1],
          [2, 3],
          [4, 1],
          [5, 2],
          [3, 4],
        ][cycle % 5];
        const aAngle = makeFraction(360 * totalPercent * ratio[0], 100 * (ratio[0] + ratio[1]));
        const bAngle = makeFraction(360 * totalPercent * ratio[1], 100 * (ratio[0] + ratio[1]));
        questions.push(
          `若一個占全體 ${totalPercent}% 的類別再細分為兩個子類別，比例為 $${ratio[0]}:${ratio[1]}$，求兩個子類別各自的圓心角。`
        );
        answers.push(
          formatPracticeShortAnswer(
            `$${fractionToLatex(aAngle, true)}°$、$${fractionToLatex(bAngle, true)}°$`,
            `此類別總圓心角為 $360°\\times ${totalPercent}\\%=${3.6 * totalPercent}°$。再按 $${ratio[0]}:${ratio[1]}$ 分配，得 $${fractionToLatex(aAngle, true)}°$、$${fractionToLatex(bAngle, true)}°$。`
          )
        );
        continue;
      }

      const totalPercent = [60, 50, 75, 40, 80][cycle % 5];
      const multiplier = [3, 2, 4, 5, 3][cycle % 5];
      const bAngle = makeFraction(360 * totalPercent, 100 * (multiplier + 1));
      questions.push(
        `一個圓形圖中，A 區塊的角度是 B 區塊的 ${multiplier} 倍，且兩者共占全體的 ${totalPercent}% ，求 B 區塊的圓心角。`
      );
      answers.push(
        formatPracticeShortAnswer(
          `$${fractionToLatex(bAngle, true)}°$`,
          `$A:B=${multiplier}:1$，兩者合計角度為 $360°\\times ${totalPercent}\\%=${3.6 * totalPercent}°$。B 占其中 1 份，所以 B 的圓心角為 $${fractionToLatex(bAngle, true)}°$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ251DynamicPieDataCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const total = [100, 120, 150, 200, 240][cycle % 5];
        const percent = [20, 25, 30, 15, 10][cycle % 5];
        const add = [20, 30, 40, 50, 60][cycle % 5];
        const oldCount = (total * percent) / 100;
        const newPercent = mulFraction(makeFraction(oldCount + add, total + add), makeFraction(100, 1));
        questions.push(
          `原本 A 社團占 ${percent}%（總人數 ${total} 人），現在增加 ${add} 個新成員且都加入 A 社團，求 A 社團在新圓形圖中的百分比。`
        );
        answers.push(
          formatPracticeShortAnswer(
            `$${fractionToLatex(newPercent, true)}\\%$`,
            `原本 A 有 $${total}\\times${percent}\\%=${oldCount}$ 人。新增後 A 有 ${oldCount + add} 人，總人數 ${total + add} 人，所以新百分比為 $\\dfrac{${oldCount + add}}{${total + add}}\\times100\\%=${fractionToLatex(newPercent, true)}\\%$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const otherPercent = [20, 24, 30, 36, 40][cycle % 5];
        const movedPercent = otherPercent / 2;
        const angleIncrease = (360 * movedPercent) / 100;
        questions.push(
          `若原本「其他」類別占 ${otherPercent}% ，將其中一半重新劃分為「羽球社」，求羽球社圓心角增加多少度。`
        );
        answers.push(
          formatPracticeShortAnswer(
            `$${angleIncrease}°$`,
            `重新劃分的一半是 ${otherPercent}% 的一半，也就是 ${movedPercent}% 。圓心角增加 $360°\\times ${movedPercent}\\%=${angleIncrease}°$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const firstTotal = [200, 240, 300, 360, 400][cycle % 5];
        const secondTotal = firstTotal + [100, 120, 150, 240, 200][cycle % 5];
        const firstPercent = [25, 30, 20, 15, 35][cycle % 5];
        const secondPercent = [20, 25, 18, 12, 30][cycle % 5];
        const firstCount = (firstTotal * firstPercent) / 100;
        const secondCount = (secondTotal * secondPercent) / 100;
        const diff = secondCount - firstCount;
        questions.push(
          `兩份圓形圖比較：第一年總人數 ${firstTotal} 人，A 占 ${firstPercent}%；第二年總人數 ${secondTotal} 人，A 占 ${secondPercent}% 。問 A 類別的人數增加還是減少多少？`
        );
        answers.push(
          formatPracticeShortAnswer(
            diff >= 0 ? `增加 ${diff} 人` : `減少 ${-diff} 人`,
            `第一年 A 有 ${firstCount} 人；第二年 A 有 ${secondCount} 人，所以${diff >= 0 ? '增加' : '減少'} ${Math.abs(diff)} 人。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const oldPercent = [10, 12, 15, 20, 25][cycle % 5];
        const newPercent = oldPercent + [5, 6, 10, 8, 12][cycle % 5];
        const angleInc = (360 * (newPercent - oldPercent)) / 100;
        questions.push(`某類別百分比從 ${oldPercent}% 提升到 ${newPercent}% ，在圓形圖上圓心角增加了多少度？`);
        answers.push(
          formatPracticeShortAnswer(
            `$${angleInc}°$`,
            `百分比增加 $${newPercent}-${oldPercent}=${newPercent - oldPercent}\\%$，所以圓心角增加 $360°\\times ${newPercent - oldPercent}\\%=${angleInc}°$。`
          )
        );
        continue;
      }

      const oldCount = [20, 30, 50, 80, 90][cycle % 5];
      const percentIncrease = [20, 30, 40, 50, 60][cycle % 5];
      const factor = makeFraction(100 + percentIncrease, 100);
      const newCount = mulFraction(makeFraction(oldCount, 1), factor);
      questions.push(
        `已知總人數增加 ${percentIncrease}% ，但某類別的圓心角不變。若該類別原有 ${oldCount} 人，求新的人數是原來的幾倍，並求新的人數。`
      );
      answers.push(
        formatPracticeShortAnswer(
          `$${fractionToLatex(factor)}$ 倍，$${fractionToLatex(newCount, true)}$ 人`,
          `圓心角不變表示百分比不變。總人數增加 ${percentIncrease}% ，所以該類別人數也同倍增加，變為原來的 $${fractionToLatex(factor)}$ 倍，即 ${fractionToLatex(newCount, true)} 人。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ251PieSectorContextCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const r = [10, 12, 15, 20, 25][cycle % 5];
        const percent = [20, 25, 30, 40, 15][cycle % 5];
        const areaCoeff = makeFraction(r * r * percent, 100);
        questions.push(`一個半徑 ${r} 公分的圓形圖中，「籃球社」占 ${percent}% ，求該扇形面積。`);
        answers.push(
          formatPracticeShortAnswer(
            `$${fractionToLatex(areaCoeff, true)}\\pi$ 平方公分`,
            `整個圓面積是 $${r}^2\\pi=${r * r}\\pi$。此類占 ${percent}% ，所以扇形面積為 $${r * r}\\pi\\times ${percent}\\%=${fractionToLatex(areaCoeff, true)}\\pi$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const r = [6, 8, 10, 12, 15][cycle % 5];
        const angle = [60, 72, 90, 120, 144][cycle % 5];
        const arcCoeff = makeFraction(2 * r * angle, 360);
        questions.push(`圓形圖半徑為 ${r} 公分，某類別圓心角為 ${angle}°，求此類別對應扇形的弧長。`);
        answers.push(
          formatPracticeShortAnswer(
            `$${fractionToLatex(arcCoeff, true)}\\pi$ 公分`,
            `弧長為圓周長的 $\\dfrac{${angle}}{360}$，所以弧長 $=2\\pi\\times${r}\\times\\dfrac{${angle}}{360}=${fractionToLatex(arcCoeff, true)}\\pi$ 公分。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const totalCoeff = [100, 144, 225, 256, 400][cycle % 5];
        const sectorCoeff = [25, 36, 45, 64, 80][cycle % 5];
        const percent = makeFraction(sectorCoeff * 100, totalCoeff);
        const angle = makeFraction(sectorCoeff * 360, totalCoeff);
        questions.push(
          `若「綠茶」扇形面積為 $${sectorCoeff}\\pi$，整個圓形圖面積為 $${totalCoeff}\\pi$，求綠茶占全體的百分比及圓心角。`
        );
        answers.push(
          formatPracticeShortAnswer(
            `$${fractionToLatex(percent, true)}\\%$，$${fractionToLatex(angle, true)}°$`,
            `比例為 $\\dfrac{${sectorCoeff}\\pi}{${totalCoeff}\\pi}$。所以百分比為 $${fractionToLatex(percent, true)}\\%$，圓心角為 $${fractionToLatex(angle, true)}°$。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const ratio = [
          [1, 2],
          [2, 3],
          [3, 4],
          [2, 5],
          [3, 5],
        ][cycle % 5];
        const areaRatio = normalizeRatioInts(ratio[0] * ratio[0], ratio[1] * ratio[1]);
        questions.push(`兩個圓形圖直徑比為 $${ratio[0]}:${ratio[1]}$，若 A 類別在兩圖中的百分比相同，求其扇形面積比。`);
        answers.push(
          formatPracticeShortAnswer(
            `$${areaRatio.a}:${areaRatio.b}$`,
            `百分比相同代表扇形面積都占各自圓面積的同一比例。圓面積與直徑平方成正比，所以扇形面積比為 $${ratio[0]}^2:${ratio[1]}^2=${areaRatio.a}:${areaRatio.b}$。`
          )
        );
        continue;
      }

      const totalPercent = [30, 40, 50, 60, 70][cycle % 5];
      const subRatio = [
        [2, 1],
        [3, 2],
        [4, 1],
        [5, 3],
        [3, 4],
      ][cycle % 5];
      const angleA = makeFraction(360 * totalPercent * subRatio[0], 100 * (subRatio[0] + subRatio[1]));
      const angleB = makeFraction(360 * totalPercent * subRatio[1], 100 * (subRatio[0] + subRatio[1]));
      questions.push(
        `一個占全體 ${totalPercent}% 的類別再切成兩個子扇形，比例為 $${subRatio[0]}:${subRatio[1]}$。求兩個子扇形的圓心角。`
      );
      answers.push(
        formatPracticeShortAnswer(
          `$${fractionToLatex(angleA, true)}°$、$${fractionToLatex(angleB, true)}°$`,
          `此類別總圓心角為 $360°\\times${totalPercent}\\%=${3.6 * totalPercent}°$，再依 $${subRatio[0]}:${subRatio[1]}$ 分配，得 $${fractionToLatex(angleA, true)}°$、$${fractionToLatex(angleB, true)}°$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ251DataCleaningLogicCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      const cycle = Math.floor(i / 5);

      if (variant === 0) {
        const total = [80, 100, 120, 140, 160][cycle % 5];
        const a = [30, 25, 20, 35, 15][cycle % 5];
        const b = [40, 35, 30, 25, 45][cycle % 5];
        const c = 100 - a - b;
        const cCount = (total * c) / 100;
        questions.push(
          `一份調查有 ${total} 人，百分比如下：A(${a}%)、B(${b}%)、C(?%)。若 C 的人數必須是偶數，請問 C 的百分比與人數為何？`
        );
        answers.push(
          formatPracticeShortAnswer(
            `C 為 $${c}\\%$，${cCount} 人`,
            `三類百分比總和為 100%，所以 C 占 $100-${a}-${b}=${c}\\%$。C 人數為 $${total}\\times${c}\\%=${cCount}$，且${cCount % 2 === 0 ? '是' : '不是'}偶數。`
          )
        );
        continue;
      }

      if (variant === 1) {
        const angleIncrease = [10, 15, 20, 30, 45][cycle % 5];
        const percentIncrease = makeFraction(angleIncrease * 100, 360);
        questions.push(`判斷正誤：若一個類別的圓心角增加 ${angleIncrease}°，它的百分比一定增加 10% 嗎？請說明。`);
        answers.push(
          formatPracticeShortAnswer(
            `不一定；本題增加 $${fractionToLatex(percentIncrease, true)}\\%$`,
            `圓心角增加 ${angleIncrease}° 對應的百分比增加量為 $\\dfrac{${angleIncrease}}{360}\\times100\\%=${fractionToLatex(percentIncrease, true)}\\%$，不一定是 10%。`
          )
        );
        continue;
      }

      if (variant === 2) {
        const total = [60, 90, 120, 150, 180][cycle % 5];
        questions.push(
          `已知 A、B、C 三類別百分比皆為等數，且總和為 100%。若總人數為 ${total} 人，求三類別的圓心角與各自人數。`
        );
        answers.push(
          formatPracticeShortAnswer(
            `各 $120°$，各 ${total / 3} 人`,
            `三類別百分比相等，所以各占 $\\dfrac13$，圓心角各為 $360°\\div3=120°$，人數各為 $${total}\\div3=${total / 3}$ 人。`
          )
        );
        continue;
      }

      if (variant === 3) {
        const total = [70, 90, 110, 130, 150][cycle % 5];
        const percent = [25, 20, 30, 40, 15][cycle % 5];
        const exact = makeFraction(total * percent, 100);
        questions.push(
          `若總人數不是 100 的倍數，例如總人數 ${total} 人，百分比為 ${percent}% 時，對應人數應如何處理？`
        );
        answers.push(
          formatPracticeShortAnswer(
            `$${fractionToLatex(exact, true)}$ 人；若需整數須說明四捨五入規則`,
            `直接計算為 $${total}\\times ${percent}\\%=${fractionToLatex(exact, true)}$ 人。若結果不是整數，代表原百分比可能是四捨五入後的資料，不能自行硬取整數。`
          )
        );
        continue;
      }

      const minAngle = [15, 18, 24, 30, 36][cycle % 5];
      const frac = makeFraction(minAngle, 360);
      questions.push(`已知圓形圖中最小的角度是 ${minAngle}°，求該類別占全體的幾分之幾。`);
      answers.push(
        formatPracticeShortAnswer(
          `$${fractionToLatex(frac)}$`,
          `占全體的比例就是圓心角除以 $360°$，所以為 $\\dfrac{${minAngle}}{360}=${fractionToLatex(frac)}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-1-1 新增：代入求變數值（若x=c,y=a或若x=a,y=c求a）────────────────
  function buildJ211FindVarValueSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const names = ['a', 'b', 'm', 'k'];

    while (questions.length < count) {
      const nm = names[questions.length % names.length];
      const p = pickNonZero(-5, 5);
      const q = pickNonZero(-5, 5);
      const knownVal = randInt(-5, 5);
      const unknownVal = randInt(-6, 6);
      const unknownIsY = questions.length % 2 === 0;

      let xv, yv;
      if (unknownIsY) {
        xv = knownVal;
        yv = unknownVal;
      } else {
        xv = unknownVal;
        yv = knownVal;
      }

      const r = -(p * xv + q * yv);
      const eqStr = `${formatTwoVarExpr(p, q, r)}=0`;

      if (unknownIsY) {
        // 代入 x=xv → q*y + (p*xv+r) = 0
        const constTerm = p * xv + r; // = -q*yv
        const afterSub = `${formatTwoVarExpr(0, q, constTerm)}=0`;
        const qTerm = q === 1 ? 'y' : q === -1 ? '-y' : `${q}y`;
        questions.push(`若 $x=${xv}$，$y=${nm}$ 為方程式 $${eqStr}$ 的解，求 $${nm}$ 的值。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${nm}=${yv}$`,
          `代入 $x=${xv}$，得 $${afterSub}$，整理得 $${qTerm}=${-constTerm}$，所以 $${nm}=${yv}$。`
        );
      } else {
        // 代入 y=yv → p*x + (q*yv+r) = 0
        const constTerm = q * yv + r; // = -p*xv
        const afterSub = `${formatTwoVarExpr(p, 0, constTerm)}=0`;
        const pTerm = p === 1 ? 'x' : p === -1 ? '-x' : `${p}x`;
        questions.push(`若 $x=${nm}$，$y=${yv}$ 為方程式 $${eqStr}$ 的解，求 $${nm}$ 的值。`);
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$${nm}=${xv}$`,
          `代入 $y=${yv}$，得 $${afterSub}$，整理得 $${pTerm}=${-constTerm}$，所以 $${nm}=${xv}$。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-1-1 新增：代入求 x 係數（若(x₀,y₀)已知，ax+by+c=0 求 a）──────────
  function buildJ211FindXCoeffSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const names = ['a', 'b', 'm', 'k'];

    while (questions.length < count) {
      const nm = names[questions.length % names.length];
      const xv = pickNonZero(-5, 5);
      const yv = randInt(-4, 5);
      const bCoef = pickNonZero(-5, 5);
      const aVal = pickNonZero(-6, 6);
      const c = -(aVal * xv + bCoef * yv);

      // equation display: nm·x + bCoef·y + c = 0
      const restStr = formatTwoVarExpr(0, bCoef, c);
      const separator = restStr.startsWith('-') ? '' : '+';
      const eqStr = `${nm}x${separator}${restStr}=0`;

      // after substituting (xv, yv): xv*nm + bCoef*yv + c = 0
      const byvPlusC = bCoef * yv + c; // = -aVal*xv
      const byvPlusCStr = byvPlusC === 0 ? '' : byvPlusC > 0 ? `+${byvPlusC}` : `${byvPlusC}`;
      const xvTerm = xv === 1 ? nm : xv === -1 ? `-${nm}` : `${xv}${nm}`;

      questions.push(`若 $(x,y)=(${xv},${yv})$ 為方程式 $${eqStr}$ 的解，求 $${nm}$ 的值。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$${nm}=${aVal}$`,
        `代入 $(x,y)=(${xv},${yv})$，得 $${xvTerm}${byvPlusCStr}=0$，整理得 $${xvTerm}=${-byvPlusC}$，所以 $${nm}=${aVal}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-1-1 新增：找任意一組整數解 ────────────────────────────────────────
  function buildJ211AnyOneSolutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const a = pickNonZero(-4, 4);
      const b = pickNonZero(-4, 4);
      const hintX = randInt(-3, 5);
      const hintY = randInt(-5, 5);
      const c = a * hintX + b * hintY;
      if (Math.abs(c) < 3) continue;

      const eqStr = `${formatTwoVarExpr(a, b)}=${c}`;
      const subRhs = c - a * hintX; // = b * hintY
      const yTerm = formatTwoVarExpr(0, b, 0);

      questions.push(`已知 $x$、$y$ 為整數，試找出滿足 $${eqStr}$ 的任意一組解。`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `$(x,y)=(${hintX},${hintY})$ 為一組整數解`,
        `令 $x=${hintX}$，代入得 $${yTerm}=${subRhs}$，解得 $y=${hintY}$，所以 $(x,y)=(${hintX},${hintY})$ 為一組整數解。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-1-1 新增：所有正整數解（x,y > 0）─────────────────────────────────
  function buildJ211AllPosIntSolutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const coefPairs = [
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 3],
      [2, 5],
      [3, 4],
      [3, 5],
      [1, 4],
      [4, 5],
      [1, 5],
      [2, 1],
      [3, 1],
      [5, 2],
      [4, 3],
    ];

    while (questions.length < count) {
      const [a, b] = coefPairs[randInt(0, coefPairs.length - 1)];
      // pick total so there are 2-6 positive-integer solutions
      const total = randInt(2, 5) * (a + b) + randInt(1, a + b);
      const pairs = [];
      for (let x = 1; a * x < total; x += 1) {
        const remain = total - a * x;
        if (remain > 0 && remain % b === 0) pairs.push([x, remain / b]);
      }
      if (pairs.length < 2 || pairs.length > 6) continue;

      const eqStr = `${formatTwoVarExpr(a, b)}=${total}`;
      questions.push(`已知 $x$、$y$ 為正整數，求滿足 $${eqStr}$ 的所有解。`);
      const pairText = pairs.map(([x, y]) => `$(${x},${y})$`).join('、');
      const yExpr = b === 1 ? 'y' : `${b}y`;
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `所有解為 ${pairText}`,
        `由 $${eqStr}$ 可得 $${yExpr}=${total}${a > 0 ? '-' : '+'}${a > 0 ? a : -a}x$，逐一代入正整數 $x=1,2,\\ldots$ 並驗證 $y$ 為正整數，可得所有解為 ${pairText}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-1-1 新增：有條件整數解（負整數 / 小於N的正整數 / 介於±N之間）──────
  function buildJ211RangeIntSolutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const typeIdx = questions.length % 3;

      if (typeIdx === 0) {
        // 設x、y為負整數
        const a = pickNonZero(-4, 4);
        const b = pickNonZero(-4, 4);
        const xBase = -randInt(1, 4);
        const yBase = -randInt(1, 4);
        const c = a * xBase + b * yBase;
        const pairs = [];
        for (let x = -15; x <= -1; x += 1) {
          const num = c - a * x;
          if (b !== 0 && num % b === 0) {
            const y = num / b;
            if (y <= -1) pairs.push([x, y]);
          }
        }
        if (pairs.length < 1 || pairs.length > 5) continue;
        const eqStr = `${formatTwoVarExpr(a, b)}=${c}`;
        questions.push(`設 $x$、$y$ 為負整數，求方程式 $${eqStr}$ 的所有解。`);
        const pairText = pairs.map(([x, y]) => `$(${x},${y})$`).join('、');
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `所有解為 ${pairText}`,
          `因 $x,y$ 皆為負整數（即 $x\\leq-1$，$y\\leq-1$），逐一代入 $x=-1,-2,\\ldots$ 並檢查 $y$ 是否為負整數，可得所有解為 ${pairText}。`
        );
      } else if (typeIdx === 1) {
        // 設x、y都是小於N的正整數（1 ≤ x,y < N）
        const N = randInt(8, 12);
        const a = randInt(3, 7);
        const b = randInt(2, 6);
        if (gcdInt(a, b) > 1 && gcdInt(a, b) === Math.min(a, b)) continue;
        const xv = randInt(1, N - 1);
        const yv = randInt(1, N - 1);
        const c = a * xv + b * yv;
        const pairs = [];
        for (let x = 1; x < N; x += 1) {
          const num = c - a * x;
          if (num > 0 && num % b === 0 && num / b < N) pairs.push([x, num / b]);
        }
        if (pairs.length < 1 || pairs.length > 5) continue;
        const eqStr = `${formatTwoVarExpr(a, b)}=${c}`;
        questions.push(`設 $x$、$y$ 都是小於 $${N}$ 的正整數，求方程式 $${eqStr}$ 的所有解。`);
        const pairText = pairs.map(([x, y]) => `$(${x},${y})$`).join('、');
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `所有解為 ${pairText}`,
          `因 $1\\leq x,y<${N}$，代入 $x=1,2,\\ldots,${N - 1}$ 並驗證 $y$ 是否滿足條件，可得所有解為 ${pairText}。`
        );
      } else {
        // 設x、y都是介於-N與N之間的整數
        const N = 10;
        const a = randInt(3, 7);
        const b = randInt(1, 4);
        const xv = randInt(-3, 3);
        const yv = randInt(-4, 4);
        const c = a * xv + b * yv;
        const pairs = [];
        for (let x = -N; x <= N; x += 1) {
          const num = c - a * x;
          if (num % b === 0) {
            const y = num / b;
            if (y >= -N && y <= N) pairs.push([x, y]);
          }
        }
        if (pairs.length < 2 || pairs.length > 7) continue;
        const eqStr = `${formatTwoVarExpr(a, b)}=${c}`;
        questions.push(`設 $x$、$y$ 都是介於 $-${N}$ 與 $${N}$ 之間的整數，求方程式 $${eqStr}$ 的所有解。`);
        const pairText = pairs.map(([x, y]) => `$(${x},${y})$`).join('、');
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `所有解為 ${pairText}`,
          `因 $-${N}\\leq x,y\\leq${N}$，代入 $x=-${N},-${N - 1},\\ldots,${N}$ 並驗證 $y$ 是否在範圍內，可得所有解為 ${pairText}。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-1-1 新增：質數條件整數解 ─────────────────────────────────────────
  function buildJ211PrimeSolutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const smallPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];

    function isPrime(n) {
      if (n < 2) return false;
      for (let i = 2; i * i <= n; i += 1) {
        if (n % i === 0) return false;
      }
      return true;
    }

    const coefPairs = [
      [3, 2],
      [2, 3],
      [5, 2],
      [3, 4],
      [7, 2],
      [5, 3],
      [2, 5],
      [4, 3],
    ];

    while (questions.length < count) {
      const [a, b] = coefPairs[questions.length % coefPairs.length];
      let c = 0;
      let pairs = [];
      let tries = 0;
      while (tries < 60) {
        c = randInt(12, 55);
        pairs = [];
        for (const px of smallPrimes) {
          const num = c - a * px;
          if (num > 0 && num % b === 0 && isPrime(num / b)) {
            pairs.push([px, num / b]);
          }
        }
        if (pairs.length >= 1 && pairs.length <= 4) break;
        tries += 1;
      }
      if (tries >= 60 || pairs.length === 0) continue;

      const eqStr = `${formatTwoVarExpr(a, b)}=${c}`;
      questions.push(`設 $x$、$y$ 均為質數，求方程式 $${eqStr}$ 的所有解。`);
      const pairText = pairs.map(([x, y]) => `$(${x},${y})$`).join('、');
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `所有解為 ${pairText}`,
        `逐一代入質數 $x=2,3,5,7,\\ldots$，計算 $y=\\dfrac{${c}-${a}x}{${b}}$，篩選出 $y$ 也為質數的情況，可得所有解為 ${pairText}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-1-1 新增：購物情境應用題 ──────────────────────────────────────────
  function buildJ211ShoppingWordSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    const items = [
      { item1: '茶葉蛋', unit1: '顆', item2: '魚板', unit2: '條' },
      { item1: '鉛筆', unit1: '枝', item2: '原子筆', unit2: '枝' },
      { item1: '餅乾', unit1: '包', item2: '飲料', unit2: '瓶' },
      { item1: '蘋果', unit1: '顆', item2: '橘子', unit2: '顆' },
      { item1: '漢堡', unit1: '個', item2: '薯條', unit2: '份' },
    ];
    const buyers = ['小明', '靜如', '柏凱', '小華', '美琪'];

    while (questions.length < count) {
      const p1 = randInt(2, 9);
      const p2 = randInt(1, 6);
      if (p1 === p2) continue;
      const g = gcdInt(p1, p2);
      const total = p1 + p2 + g * randInt(2, 5);

      const pairs = [];
      for (let x = 1; p1 * x < total; x += 1) {
        const rem = total - p1 * x;
        if (rem > 0 && rem % p2 === 0) pairs.push([x, rem / p2]);
      }
      if (pairs.length < 1 || pairs.length > 6) continue;

      const { item1, unit1, item2, unit2 } = items[questions.length % items.length];
      const buyer = buyers[questions.length % buyers.length];

      if (questions.length % 2 === 0) {
        // 問法一：列出所有可能買法
        questions.push(
          `${item1}每${unit1} $${p1}$ 元，${item2}每${unit2} $${p2}$ 元，${buyer}兩樣都買，共花了 $${total}$ 元，請寫出所有可能的買法。`
        );
        const buyText = pairs.map(([x, y]) => `${item1} $${x}$ ${unit1}、${item2} $${y}$ ${unit2}`).join('；');
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          buyText,
          `設買 ${item1} $x$ ${unit1}、${item2} $y$ ${unit2}，列方程式 $${p1}x+${p2}y=${total}$。因 $x,y$ 為正整數，逐一驗算可得：${buyText}。`
        );
      } else {
        // 問法二：問某一項的數量
        questions.push(
          `${buyer}買了每${unit1} $${p1}$ 元的${item1}及每${unit2} $${p2}$ 元的${item2}各若干，共花了 $${total}$ 元，她可能買了幾${unit2}${item2}？`
        );
        const yCounts = pairs.map(([, y]) => `$${y}$ ${unit2}`).join('、');
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `$y$ 可為 ${yCounts}`,
          `設買${item1} $x$ ${unit1}、${item2} $y$ ${unit2}，列方程式 $${p1}x+${p2}y=${total}$。因 $x,y$ 為正整數，逐一驗算可得 $y$ 可為 ${yCounts}。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-4-2 新增：前幾次具體分數已知，求下次最低分（具體分數平均門檻）────
  function buildJ242SpecificScoreThresholdSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const names = ['小梅', '小翔', '小安', '明軒', '欣宜', '小宇', '美琪', '阿昇'];
    const subjects = ['數學', '英語', '自然', '社會', '國文'];

    while (questions.length < count) {
      const nm = names[questions.length % names.length];
      const subj = subjects[questions.length % subjects.length];
      const prevCount = questions.length % 2 === 0 ? 2 : 3;
      const targetAvg = randInt(55, 88);
      const prevScores = [];
      for (let j = 0; j < prevCount; j += 1) {
        prevScores.push(randInt(25, 92));
      }
      const prevTotal = prevScores.reduce((a, b) => a + b, 0);
      const totalRounds = prevCount + 1;
      // "超過 targetAvg" → strict > → x > targetAvg * totalRounds - prevTotal
      const threshold = targetAvg * totalRounds - prevTotal; // x must be > threshold
      const minScore = threshold + 1;
      if (minScore < 1 || minScore > 100) continue;

      const prevStr = prevScores.join('、');
      const ordinals = ['', '一', '二', '三', '四'];
      const nthStr = ordinals[totalRounds] || `第 ${totalRounds}`;
      questions.push(
        `${nm}前 ${prevCount} 次${subj}段考的分數分別為 ${prevStr} 分，若希望 ${totalRounds} 次的平均分數超過 ${targetAvg} 分，則第 ${totalRounds} 次段考最少要考多少分？`
      );
      answers.push(
        formatJ242Answer(
          `${minScore} 分`,
          `設第 ${totalRounds} 次考 $x$ 分，依題意 $\\dfrac{${prevTotal}+x}{${totalRounds}}>\\!${targetAvg}$，兩邊乘以 ${totalRounds} 得 $${prevTotal}+x>${targetAvg * totalRounds}$，整理得 $x>${threshold}$，所以最少要考 ${minScore} 分。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-4-2 新增：正整數列舉型（列出所有滿足條件的正整數）─────────────────
  function buildJ242PosIntEnumerateSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      // Always use x/2 (一半) with odd x_max so M is a .5 decimal
      const x_max = 2 * randInt(1, 7) - 1; // odd: 1,3,5,7,...,13
      const c = randInt(1, 7);
      // M = x_max/2 + c (which is x.5 since x_max is odd → x_max/2 = n+0.5)
      const M = x_max / 2 + c; // e.g. 6.5+1=7.5
      const MDisplay = M.toFixed(1);

      // Validate: all positive integers x where x/2 + c ≤ M
      const valid = [];
      for (let x = 1; x <= 30; x += 1) {
        if (x / 2 + c <= M) valid.push(x);
      }
      if (valid.length < 1 || valid.length > 14) continue;

      // Vary the constant direction: sometimes subtract
      const useSubtract = questions.length % 3 === 2 && c > 2;
      let questionStr, answerProcess;

      if (useSubtract) {
        // x/2 - c' ≤ M' (ensure x_max still sensible)
        const cPrime = randInt(1, c - 1);
        const MPrime = x_max / 2 - cPrime;
        if (MPrime <= 0) continue;
        const MPrimeDisp = MPrime.toFixed(1);
        const validPrime = [];
        for (let x = 1; x <= 30; x += 1) {
          if (x / 2 - cPrime <= MPrime) validPrime.push(x);
        }
        if (validPrime.length < 1 || validPrime.length > 14) continue;
        const listStr = validPrime.join('、');
        questions.push(`若某正整數的一半減 $${cPrime}$ 不大於 $${MPrimeDisp}$，求此正整數可能為多少？`);
        answers.push(
          formatJ242Answer(
            `${listStr}`,
            `設此正整數為 $x$（$x\\geq 1$，$x$ 為整數），由 $\\dfrac{x}{2}-${cPrime}\\leq ${MPrimeDisp}$ 得 $\\dfrac{x}{2}\\leq ${(MPrime + cPrime).toFixed(1)}$，即 $x\\leq ${x_max}$，所以此正整數可能為 ${listStr}。`
          )
        );
      } else {
        const listStr = valid.join('、');
        const xMaxStr = (x_max + 1).toString();
        questions.push(`若某正整數的一半加 $${c}$ 不大於 $${MDisplay}$，求此正整數可能為多少？`);
        answers.push(
          formatJ242Answer(
            `${listStr}`,
            `設此正整數為 $x$（$x\\geq 1$，$x$ 為整數），由 $\\dfrac{x}{2}+${c}\\leq ${MDisplay}$ 得 $\\dfrac{x}{2}\\leq ${(M - c).toFixed(1)}$，即 $x\\leq ${x_max}$，所以此正整數可能為 ${listStr}。`
          )
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-4-2 新增：某整數 / 某正數直接條件型 ───────────────────────────────
  function buildJ242IntegerConditionWordSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const typeIdx = questions.length % 5;

      if (typeIdx === 0) {
        // "若某整數的a倍加b不小於c，求此數最小應為多少"  ax+b≥c → x≥(c-b)/a
        const a = randInt(2, 6);
        const b = randInt(1, 10);
        const ansInt = randInt(1, 8);
        const c = a * ansInt + b - randInt(0, a - 1); // c such that ceil((c-b)/a)=ansInt
        const rhs = c - b;
        const bound = makeFraction(rhs, a);
        const minVal = minIntegerForIneq('≥', bound);
        questions.push(`若某整數的 $${a}$ 倍加 $${b}$ 不小於 $${c}$，求此數最小應為多少？`);
        answers.push(
          formatJ242Answer(
            `${minVal}`,
            `設此整數為 $x$，依題意 $${a}x+${b}\\geq ${c}$，整理得 $${a}x\\geq ${rhs}$，所以 $x\\geq ${fractionToLatex(bound, true)}$，最小整數值為 ${minVal}。`
          )
        );
      } else if (typeIdx === 1) {
        // "若某整數的a倍加b小於c，求此數最大應為多少" ax+b<c → x<(c-b)/a
        const a = randInt(2, 5);
        const b = randInt(1, 8);
        const ansInt = randInt(2, 9);
        const c = a * ansInt + b + randInt(1, a); // c such that max is ansInt
        const rhs = c - b;
        const bound = makeFraction(rhs, a);
        const maxVal = maxIntegerForIneq('<', bound);
        questions.push(`若某整數的 $${a}$ 倍加 $${b}$ 小於 $${c}$，求此數最大應為多少？`);
        answers.push(
          formatJ242Answer(
            `${maxVal}`,
            `設此整數為 $x$，依題意 $${a}x+${b}<${c}$，整理得 $${a}x<${rhs}$，所以 $x<${fractionToLatex(bound, true)}$，最大整數值為 ${maxVal}。`
          )
        );
      } else if (typeIdx === 2) {
        // "若某整數的(1/2)減c小於M，求此數最大應為多少" x/2-c<M → x<2(M+c)
        const cVal = randInt(1, 6);
        const ansInt = randInt(5, 20);
        // x/2 - cVal < M → max integer is ansInt → ansInt < 2*(M+cVal) ≤ ansInt+1
        // pick M such that 2*(M+cVal) = ansInt + 0.5 (midpoint)
        // actually: x/2 - cVal < M → x < 2M + 2cVal; max int = floor(2M+2cVal-ε) = ansInt
        // so 2M + 2cVal - 1 < ansInt < 2M + 2cVal? No...
        // x < 2*(M+cVal). Max integer = 2*(M+cVal) - 1 if 2*(M+cVal) is integer, else floor(2*(M+cVal))
        // Let's pick: 2*(M+cVal) = ansInt + 1 → M = (ansInt + 1)/2 - cVal
        // to keep M non-integer, use ansInt odd so (ansInt+1)/2 is integer... hmm
        // Let's just pick M = ansInt/2 - cVal + 0.5 so M+cVal = (ansInt+1)/2
        // Then x < ansInt+1 → max int = ansInt ✓
        // But M might be negative if cVal is large... ensure M > 0
        const M = ansInt / 2 - cVal + 0.5;
        if (M <= 0) continue;
        const MDisp = M % 1 === 0 ? M.toString() : M.toFixed(1);
        const rhsVal = M + cVal; // = (ansInt+1)/2
        const rhsDisp = rhsVal % 1 === 0 ? rhsVal.toString() : rhsVal.toFixed(1);
        questions.push(`若某整數的一半減 $${cVal}$ 小於 $${MDisp}$，求此數最大應為多少？`);
        answers.push(
          formatJ242Answer(
            `${ansInt}`,
            `設此整數為 $x$，依題意 $\\dfrac{x}{2}-${cVal}<${MDisp}$，整理得 $\\dfrac{x}{2}<${rhsDisp}$，即 $x<${ansInt + 1}$，最大整數值為 ${ansInt}。`
          )
        );
      } else if (typeIdx === 3) {
        // "若某正數的a倍加b小於c，求此正數的範圍" ax+b<c, x>0 → 0<x<(c-b)/a
        const a = randInt(2, 6);
        const b = randInt(1, 8);
        const rhsVal = randInt(a + b + 1, a + b + 3 * a); // ensure positive solution exists
        const c = rhsVal;
        const cMinusB = c - b;
        const bound = makeFraction(cMinusB, a);
        const boundStr = fractionToLatex(bound, true);
        questions.push(`若某正數的 $${a}$ 倍加 $${b}$ 小於 $${c}$，求此正數的範圍。`);
        answers.push(
          formatJ242Answer(
            `$0<x<${boundStr}$`,
            `設此正數為 $x$（$x>0$），由 $${a}x+${b}<${c}$ 得 $${a}x<${cMinusB}$，即 $x<${boundStr}$，又 $x>0$，所以 $0<x<${boundStr}$。`
          )
        );
      } else {
        // "若某整數大於N，求此數最小應為多少"  x > N → min = N+1
        const N = randInt(3, 30);
        questions.push(`若某整數大於 $${N}$，求此數最小應為多少？`);
        answers.push(formatJ242Answer(`${N + 1}`, `依題意 $x>${N}$，所以此整數的最小值為 ${N + 1}。`));
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-4-2 新增：圖形底/長含變數表達式（長方形 + 三角形輪換）────────────
  function buildJ242ShapeVariableExprSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    while (questions.length < count) {
      const shapeIdx = questions.length % 2;

      if (shapeIdx === 0) {
        // 長方形：長 = (x - a), 寬 = b, 面積 < C → a < x < a + C/b
        const a = randInt(2, 8); // offset in length expr
        const b = randInt(1, 5); // width
        const C = b * randInt(2, 8); // area limit (multiple of b for clean answer)
        const xMax_num = C; // x < a + C/b → x < a + xMax_num/b
        const xMaxFrac = makeFraction(xMax_num, b);
        const upperBound = addFraction(makeFraction(a), xMaxFrac);
        const upperStr = fractionToLatex(upperBound, true);
        questions.push(
          `若一長方形的長為 $(x-${a})$ 公分，寬為 $${b}$ 公分，面積小於 $${C}$ 平方公分，試求 $x$ 的範圍。`
        );
        answers.push(
          formatJ242Answer(
            `$${a}<x<${upperStr}$`,
            `長方形面積為 $(x-${a})\\times ${b}$，依題意 $(x-${a})\\times ${b}<${C}$，又長必須為正（$x>${a}$），整理得 $x-${a}<${fractionToLatex(xMaxFrac, true)}$，即 $${a}<x<${upperStr}$。`
          )
        );
      } else {
        // 三角形：底 = (ax + b), 高 = h, 面積 ≥ S → x ≥ (2S/h - b) / a
        const aCoef = randInt(1, 4); // coefficient of x in base
        const bConst = -randInt(1, 5); // negative offset in base (e.g. 3x-4)
        const h = randInt(1, 9);
        // pick answer x_min (positive integer), compute S
        const x_min = randInt(2, 8);
        const baseAtMin = aCoef * x_min + bConst;
        if (baseAtMin <= 0) continue;
        const S_exact = (aCoef * x_min * h) / 2 + (bConst * h) / 2;
        // S must be positive and the inequality should be ≥
        const S = Math.max(1, Math.ceil(S_exact - (h * aCoef) / 2 + 1));
        if (S <= 0) continue;
        // Verify: (aCoef*x_min + bConst)*h/2 ≥ S → x_min is indeed the min
        const lhsAtMin = ((aCoef * x_min + bConst) * h) / 2;
        if (lhsAtMin < S) continue;
        const lhsAtMinMinus1 = ((aCoef * (x_min - 1) + bConst) * h) / 2;
        if (lhsAtMinMinus1 >= S) continue; // x_min-1 also satisfies → not the minimum

        const bConstStr = bConst < 0 ? `${bConst}` : `+${bConst}`;
        const baseExpr = aCoef === 1 ? `x${bConstStr}` : `${aCoef}x${bConstStr}`;
        // Solve: (aCoef*x + bConst)*h/2 ≥ S → aCoef*x + bConst ≥ 2S/h
        const rhsFrac = makeFraction(2 * S, h);
        const rhsMinusB = subFraction(rhsFrac, makeFraction(bConst));
        const xBound = makeFraction(rhsMinusB.num, rhsMinusB.den * aCoef);
        const xBoundStr = fractionToLatex(xBound, true);

        questions.push(
          `若三角形的底為 $(${baseExpr})$ 公分，高為 $${h}$ 公分，面積不小於 $${S}$ 平方公分，試求 $x$ 的範圍。`
        );
        answers.push(
          formatJ242Answer(
            `$x\\geq ${xBoundStr}$`,
            `三角形面積為 $\\dfrac{(${baseExpr})\\times ${h}}{2}$，依題意 $\\dfrac{(${baseExpr})\\times ${h}}{2}\\geq ${S}$，整理得 $${baseExpr}\\geq ${fractionToLatex(rhsFrac, true)}$，即 $${aCoef === 1 ? 'x' : `${aCoef}x`}\\geq ${fractionToLatex(rhsMinusB, true)}$，所以 $x\\geq ${xBoundStr}$。`
          )
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-4-2 新增：父子年齡過去比較型 ─────────────────────────────────────
  function buildJ242AgePastRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const fatherNames = ['欣宜的父親', '明哲的父親', '小安的爸爸', '美琪的父親', '小翔的爸爸'];
    const childNames = ['欣宜', '明哲', '小安', '美琪', '小翔'];

    while (questions.length < count) {
      const idx = questions.length % fatherNames.length;
      const fatherLabel = fatherNames[idx];
      const childLabel = childNames[idx];

      const F = randInt(35, 85); // father's current age
      const N = randInt(2, 5); // years ago
      const k = randInt(2, 4); // multiplier
      const extra = randInt(1, 6); // extra offset

      // (F-N) > k*(C-N) + extra → solve for C (child's current age)
      // F - N - extra > k*C - k*N → F - N - extra + k*N > k*C
      // C < (F + N*(k-1) - extra) / k
      const numerator = F + N * (k - 1) - extra;
      if (numerator <= 0) continue;
      const bound = makeFraction(numerator, k);
      const maxChild = maxIntegerForIneq('<', bound);

      // Sanity check: child age should be positive
      if (maxChild < 5) continue;
      // Father should be older
      if (F <= maxChild) continue;

      const fatherThen = F - N;
      const extraStr = extra === 0 ? '' : `加 ${extra} 歲`;

      questions.push(
        `${fatherLabel}現年 ${F} 歲，${N} 年前${fatherLabel}的年齡比${childLabel}年齡的 ${k} 倍加 ${extra} 歲還多，試求${childLabel}今年最多幾歲？`
      );
      answers.push(
        formatJ242Answer(
          `${maxChild} 歲`,
          `設${childLabel}今年 $x$ 歲，則 ${N} 年前${childLabel} $(x-${N})$ 歲，${fatherLabel} $(${F}-${N})=${fatherThen}$ 歲。依題意 $${fatherThen}>${k}(x-${N})+${extra}$，整理得 $${fatherThen}>${k}x${k * N > 0 ? `-${k * N}` : `+${-k * N}`}+${extra}$，即 $${k}x<${numerator}$，所以 $x<${fractionToLatex(bound, true)}$，${childLabel}今年最多 ${maxChild} 歲。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-4-2 新增：解不等式求整數解 ────────────────────────────────────────
  function buildJ242SolveIneqIntegerSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    const templates = [
      // variant 0: 求最大整數解 (ax > bx + c → x > c/(a-b))
      () => {
        const diff = randInt(2, 6);
        const b = randInt(1, 6);
        const a = b + diff;
        const c = randInt(2, 20);
        // ax > bx + c → (a-b)x > c → x > c/diff
        const bound = makeFraction(c, diff);
        const maxInt = maxIntegerForIneq('>', bound);
        const lhsConst = randInt(10, 30);
        const lhsCoef = a;
        const rhsConst = lhsConst - c;
        const rhsCoef = b;
        const lhsExpr = formatLinearExpr(-lhsCoef, lhsConst);
        const rhsExpr = formatLinearExpr(-rhsCoef, rhsConst);
        return {
          q: `解不等式 $${lhsExpr}>${rhsExpr}$，求此不等式的最大整數解。`,
          a: `整理得 $(${lhsCoef}-${rhsCoef})x < ${c}$，即 $${diff}x < ${c}$，解得 $x < ${fractionToLatex(bound, true)}$。最大整數解為 $${maxInt}$。`,
          ans: `${maxInt}`,
        };
      },
      // variant 1: 求正整數解個數 (3+8x ≦ 19+5x → x ≦ ...)
      () => {
        const a = randInt(2, 8);
        const b = randInt(1, a - 1);
        const c = randInt(10, 30);
        const d = c + randInt(1, 15);
        // c + ax ≦ d + bx → (a-b)x ≦ d-c
        const diff2 = a - b;
        const rhs2 = d - c;
        const bound = makeFraction(rhs2, diff2);
        const maxInt = maxIntegerForIneq('≦', bound);
        const posCount = Math.max(0, maxInt);
        const positiveAnswerText =
          posCount > 0 ? `正整數解為 $1,2,\\ldots,${maxInt}$，共 $${posCount}$ 個。` : '沒有正整數解。';
        return {
          q: `滿足不等式 $${c}+${formatTerm(a, 'x')}\\leq ${d}+${formatTerm(b, 'x')}$ 的正整數 $x$ 共有幾個？`,
          a: `整理得 $(${a}-${b})x\\leq ${rhs2}$，即 $x\\leq ${fractionToLatex(bound, true)}$。${positiveAnswerText}`,
          ans: `${posCount} 個`,
        };
      },
      // variant 2: 聯立整數範圍求個數
      () => {
        const aCoef = randInt(2, 5);
        const b = randInt(1, 10);
        const loVal = -randInt(6, 10);
        const hiVal = loVal + randInt(4, 10);
        const leftGap = randInt(1, aCoef);
        const rightGap = randInt(1, aCoef);
        const M = -(aCoef * loVal + b - leftGap);
        const N = aCoef * hiVal + b + rightGap;
        // -M < aCoef*x + b < N → (-M-b)/aCoef < x < (N-b)/aCoef
        const loFrac = makeFraction(-M - b, aCoef);
        const hiFrac = makeFraction(N - b, aCoef);
        const intCount = hiVal - loVal + 1;
        const intList = Array.from({ length: intCount }, (_, i) => loVal + i).join('、');
        return {
          q: `滿足不等式 $-${M}<${aCoef}x+${b}<${N}$ 的整數解為？`,
          a: `各邊減去 $${b}$ 得 $-${M + b}<${aCoef}x<${N - b}$，再除以 $${aCoef}$ 得 $${fractionToLatex(loFrac, true)}<x<${fractionToLatex(hiFrac, true)}$。整數解為 $${intList}$。`,
          ans: `${intList}`,
        };
      },
      // variant 3: 求最小整數解（2x+9 < 7x-1 型）
      () => {
        const a = randInt(2, 5);
        const b = randInt(1, a - 1);
        const c1 = randInt(2, 12);
        const c2 = randInt(1, 10);
        // b*x + c1 < a*x - c2 → c1+c2 < (a-b)x → x > (c1+c2)/(a-b)
        const diff3 = a - b;
        const rhs3 = c1 + c2;
        const bound = makeFraction(rhs3, diff3);
        const minInt = minIntegerForIneq('>', bound);
        return {
          q: `滿足不等式 $${formatTerm(b, 'x')}+${c1}<${formatTerm(a, 'x')}-${c2}$ 的最小正整數解為何？`,
          a: `整理得 $(${a}-${b})x>${c1}+${c2}=${rhs3}$，即 $x>${fractionToLatex(bound, true)}$。最小正整數解為 $${minInt}$。`,
          ans: `${minInt}`,
        };
      },
    ];

    for (let i = 0; i < count; i += 1) {
      let result = null;
      let tries = 0;
      while (result === null && tries < 20) {
        result = templates[i % templates.length]();
        tries += 1;
      }
      if (!result) continue;
      questions.push(result.q);
      answers.push(formatJ242Answer(result.ans, result.a));
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-4-2 新增：已知解求係數 ─────────────────────────────────────────────
  function buildJ242GivenSolutionFindCoeffSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;
      const cycle = Math.floor(i / 4);

      if (variant === 0) {
        // ax+b [op] cx+d 的解為 x [op2] M，逆推 a
        // 例: 不等式2x-8≦ax+10 解為 x≧-3 → (2-a)x≦18 → x≧-3 (2-a<0, a>2)
        const M_vals = [-5, -3, -2, -4, -6, -7, -8, -9];
        const M = M_vals[(cycle * 3) % M_vals.length];
        const lhsConst = 2 + (cycle % 3) * 3;
        const rhsConst = randInt(5, 15);
        // (lhsConst - a)x ≦ rhsConst + lhsConst*|M| → x ≧ M
        // (lhsConst - a)*M = rhsConst + lhsConst*M - but let's pick a directly
        // Equation: 2x - rhsConst ≦ ax + 10 → (2-a)x ≦ 10 + rhsConst
        // solution x≧M means 2-a<0 and M = (10+rhsConst)/(2-a).
        const C = 10 + rhsConst;
        if (M >= 0 || C % M !== 0) {
          i -= 1;
          continue;
        }
        const coefficient = C / M;
        const a = 2 - coefficient;
        if (!Number.isInteger(a) || a === 2) {
          i -= 1;
          continue;
        }
        questions.push(`不等式 $2x-${rhsConst}\\leq ax+10$ 的解為 $x\\geq ${M}$，求 $a$ 的值。`);
        answers.push(
          formatJ242Answer(
            `$a=${a}$`,
            `整理得 $(2-a)x\\leq ${C}$。因為解為 $x\\geq ${M}$，表示除以 $2-a$ 時不等號反向，所以 $2-a<0$。界線滿足 $\\dfrac{${C}}{2-a}=${M}$，故 $2-a=${coefficient}$，解得 $a=${a}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        // 兩不等式解相同求 k: ax+b≦c 與 kx+d≧e 有相同解
        const aCoef = randInt(2, 6);
        const b = randInt(1, 10);
        const solNum = -randInt(1, 8); // solution x≦solNum
        // ax+b≦c → solution x≦(c-b)/aCoef = solNum → c = aCoef*solNum + b
        const c = aCoef * solNum + b;
        // kx+d≧e → solution x≧(e-d)/k = solNum → need x≦solNum, so kx≦c → k<0
        const d = randInt(1, 8);
        const e = d + randInt(2, 8);
        // kx+d≧e → kx≧e-d → x≦(e-d)/k (if k<0) = solNum → k = (e-d)/solNum
        const eDiffD = e - d;
        if (solNum === 0 || eDiffD % solNum !== 0) {
          i -= 1;
          continue;
        }
        const k = eDiffD / solNum;
        if (k >= 0 || !Number.isInteger(k)) {
          i -= 1;
          continue;
        }
        questions.push(`不等式 $${aCoef}x+${b}\\leq ${c}$ 與 $kx+${d}\\geq ${e}$（$k\\neq 0$）的解相同，求 $k$ 的值。`);
        answers.push(
          formatJ242Answer(
            `$k=${k}$`,
            `先解第一式：$${aCoef}x\\leq ${c - b}$，解得 $x\\leq ${solNum}$。第二式 $kx+${d}\\geq ${e}$ 的解也須為 $x\\leq ${solNum}$，故 $kx\\geq ${eDiffD}$（$k<0$），即 $x\\leq \\dfrac{${eDiffD}}{k}=${solNum}$，解得 $k=${k}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        // a>某值且 ax-bx+c≧d 的解為 x≧M → 求 a
        const M2 = randInt(2, 8);
        const b2 = randInt(1, 5);
        const c2 = randInt(1, 10);
        const d2 = randInt(1, 10);
        // (a-b2)x ≧ d2-c2, solution x≧M2 → a-b2>0, a-b2 = (d2-c2)/M2
        // pick d2-c2 = M2*(a-b2), choose a-b2
        const aMinusB = randInt(1, 4);
        const a2 = b2 + aMinusB;
        const rhsVal = aMinusB * M2 + c2 - c2; // = aMinusB*M2
        const d2Val = aMinusB * M2 + c2;
        questions.push(
          `已知 $a>${b2}$，且不等式 $ax${formatTerm(-b2, 'x')}+${c2}\\geq ${d2Val}$ 的解為 $x\\geq ${M2}$，求 $a$ 的值。`
        );
        answers.push(
          formatJ242Answer(
            `$a=${a2}$`,
            `整理得 $(a-${b2})x\\geq ${d2Val - c2}$。因為 $a>${b2}$，故 $a-${b2}>0$，解得 $x\\geq \\dfrac{${d2Val - c2}}{a-${b2}}=${M2}$，所以 $a-${b2}=${aMinusB}$，即 $a=${a2}$。`
          )
        );
        continue;
      }

      // variant 3: 14(x-5)+30≧8-ax 解為 x≧M
      const a3 = randInt(2, 8);
      const lhs3Expand = 14; // coef of x in lhs
      const lhsConst3 = -70 + 30; // = -40
      const rhs3Const = 8;
      // (14+a3)x ≧ 8+40 = 48 → x≧48/(14+a3)
      const numer3 = rhs3Const + 40;
      if (numer3 % (lhs3Expand + a3) !== 0) {
        i -= 1;
        continue;
      }
      const M3 = numer3 / (lhs3Expand + a3);
      if (M3 <= 0 || M3 > 10) {
        i -= 1;
        continue;
      }
      questions.push(`不等式 $14(x-5)+30\\geq 8-${a3}x$ 的解為 $x\\geq ${M3}$，請驗證並求解。`);
      answers.push(
        formatJ242Answer(
          `$x\\geq ${M3}$`,
          `展開得 $14x-70+30\\geq 8-${a3}x$，整理得 $(14+${a3})x\\geq 8+40=${numer3}$，即 $${lhs3Expand + a3}x\\geq ${numer3}$，解得 $x\\geq ${M3}$。✓`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-4-2 新增：聯立（雙重）不等式 ─────────────────────────────────────
  function buildJ242CompoundIneqSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;
      const cycle = Math.floor(i / 4);

      if (variant === 0) {
        // a < bx + c < d 型，求整數解的和
        const b = randInt(2, 6);
        const c = randInt(1, 10);
        const loX = -randInt(1, 5);
        const hiX = randInt(1, 6);
        const lo = b * loX + c - randInt(1, b - 1);
        const hi = b * hiX + c + randInt(1, b - 1);
        // lo < bx+c < hi → (lo-c)/b < x < (hi-c)/b
        const xLoFrac = makeFraction(lo - c, b);
        const xHiFrac = makeFraction(hi - c, b);
        const xLo = Math.ceil((lo - c) / b + 1e-9);
        const xHi = Math.floor((hi - c) / b - 1e-9);
        if (xHi < xLo) {
          i -= 1;
          continue;
        }
        const intList = Array.from({ length: xHi - xLo + 1 }, (_, k) => xLo + k);
        const sumVal = intList.reduce((s, v) => s + v, 0);
        const listStr = intList.join('、');
        questions.push(`滿足不等式 $${lo}<${b}x+${c}<${hi}$ 的所有整數解的和為？`);
        answers.push(
          formatJ242Answer(
            `${sumVal}`,
            `各邊減 $${c}$ 得 $${lo - c}<${b}x<${hi - c}$，再除以 $${b}$ 得 $${fractionToLatex(xLoFrac, true)}<x<${fractionToLatex(xHiFrac, true)}$。整數解為 $${listStr}$，和為 $${sumVal}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        // 同時滿足 ax+b≧c 與 dx+e<f 求整數解個數
        const a = randInt(2, 5);
        const b = randInt(1, 8);
        const c = randInt(1, 15);
        // ax+b≧c → x≧(c-b)/a
        const loFrac = makeFraction(c - b, a);
        const loX2 = Math.ceil((c - b) / a - 1e-9);

        const d = randInt(2, 5);
        const e = randInt(1, 8);
        const hiX2 = loX2 + randInt(3, 7); // ensure some solutions
        const f = d * hiX2 + e + randInt(1, d);
        const hiFrac = makeFraction(f - e, d);
        const hiXExact = Math.floor((f - e) / d - 1e-9);
        const intCount = Math.max(0, hiXExact - loX2 + 1);
        if (intCount < 1 || intCount > 10) {
          i -= 1;
          continue;
        }
        questions.push(`同時滿足不等式 $${a}x+${b}\\geq ${c}$ 與 $${d}x+${e}<${f}$ 的正整數解共有幾個？`);
        const intList2 = Array.from({ length: intCount }, (_, k) => loX2 + k).filter((x) => x > 0);
        answers.push(
          formatJ242Answer(
            `${intList2.length} 個`,
            `第一式：$x\\geq ${fractionToLatex(loFrac, true)}$，正整數解從 $${Math.max(1, loX2)}$ 開始。第二式：$x<${fractionToLatex(hiFrac, true)}$，最大整數解為 $${hiXExact}$。故正整數解為 $${intList2.join('、')}$，共 $${intList2.length}$ 個。`
          )
        );
        continue;
      }

      if (variant === 2) {
        // 雙不等式 ax+b>c 與 dx+e<f，求 x 的範圍（並集or交集，取交集）
        const a2 = randInt(2, 5);
        const b2 = randInt(1, 8);
        const c2 = randInt(-10, 5);
        // ax+b>c → x > (c-b)/a
        const loFrac2 = makeFraction(c2 - b2, a2);
        const loVal2 = (c2 - b2) / a2;

        const d2 = randInt(2, 5);
        const e2 = randInt(1, 8);
        const hiVal2 = loVal2 + randInt(3, 8);
        const f2 = Math.round(d2 * hiVal2 + e2 + 0.5); // slightly above d2*hiVal2+e2
        const hiFrac2 = makeFraction(f2 - e2, d2);
        questions.push(`若 $x$ 同時滿足 $${a2}x+${b2}>${c2}$ 與 $${d2}x+${e2}<${f2}$，求 $x$ 的範圍。`);
        answers.push(
          formatJ242Answer(
            `$${fractionToLatex(loFrac2, true)}<x<${fractionToLatex(hiFrac2, true)}$`,
            `第一式整理：$x>${fractionToLatex(loFrac2, true)}$；第二式整理：$x<${fractionToLatex(hiFrac2, true)}$。取交集得 $${fractionToLatex(loFrac2, true)}<x<${fractionToLatex(hiFrac2, true)}$。`
          )
        );
        continue;
      }

      // variant 3: 2x-1>9-x≧3 型（chain inequality，解兩個）
      const a3 = randInt(2, 4);
      const b3 = randInt(1, 5);
      const c3 = randInt(5, 15);
      const d3 = randInt(2, 8);
      // inequality 1: a3*x - b3 > c3 → x > (c3+b3)/a3
      const lo3Frac = makeFraction(c3 + b3, a3);
      const lo3Val = Math.ceil((c3 + b3) / a3 + 1e-9);
      // inequality 2: c3 ≧ d3 (constant... no)
      // Better: ax+b > c and c ≧ dx-e → dx≦c+e → x≦(c+e)/d
      const e3 = randInt(1, 8);
      // c3 ≧ a3*x - something, let's go: a3*x-b3>c3 ≧ d3-e3*x
      // c3 ≧ d3 - e3*x → e3*x ≧ d3-c3
      const loFrac3b = makeFraction(d3 - c3, e3);
      const lo3bVal = Math.ceil((d3 - c3) / e3 + 1e-9);
      const finalLo = Math.max(lo3Val, lo3bVal);
      const hi3 = finalLo + randInt(2, 6);
      const intList3 = Array.from({ length: hi3 - finalLo + 1 }, (_, k) => finalLo + k);
      questions.push(`滿足不等式 $${a3}x-${b3}>${c3}\\geq ${d3}-${formatTerm(e3, 'x')}$ 的所有整數解的和為？`);
      answers.push(
        formatJ242Answer(
          `整數解無限多，無法求和`,
          `第一式：$${a3}x-${b3}>${c3}$ → $x>${fractionToLatex(lo3Frac, true)}$，整數解從 $${lo3Val}$ 開始。第二式：$${c3}\\geq ${d3}-${formatTerm(e3, 'x')}$ → $${formatTerm(e3, 'x')}\\geq ${d3 - c3}$ → $x\\geq ${fractionToLatex(loFrac3b, true)}$。取交集後只有下界，整數解為 $${intList3.slice(0, 8).join('、')}\\ldots$，共有無限多個，因此所有整數解的和無法求。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-4-2 新增：絕對值不等式 ────────────────────────────────────────────
  function buildJ242AbsValueIneqSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;
      const cycle = Math.floor(i / 4);

      if (variant === 0) {
        // |ax+b| ≦ c → -c ≦ ax+b ≦ c → (−c−b)/a ≦ x ≦ (c−b)/a
        const aVals = [1, 2, 1, 2, 1, 3];
        const bVals = [1, 5, 3, 1, 5, 3];
        const cVals = [5, 7, 4, 5, 7, 4];
        const a = aVals[cycle % aVals.length];
        const b = bVals[cycle % bVals.length];
        const c = cVals[cycle % cVals.length];
        const loFrac = makeFraction(-c - b, a);
        const hiFrac = makeFraction(c - b, a);
        const loStr = fractionToLatex(loFrac, true);
        const hiStr = fractionToLatex(hiFrac, true);
        const intList = [];
        const loVal = Math.ceil((-c - b) / a - 1e-9);
        const hiVal = Math.floor((c - b) / a + 1e-9);
        for (let x = loVal; x <= hiVal; x += 1) intList.push(x);
        questions.push(`解不等式 $|${a === 1 ? '' : a}x+${b}|\\leq ${c}$，並求整數解共有幾個。`);
        answers.push(
          formatJ242Answer(
            `$${loStr}\\leq x\\leq ${hiStr}$，共 $${intList.length}$ 個整數解`,
            `由 $|${a === 1 ? '' : a}x+${b}|\\leq ${c}$ 得 $-${c}\\leq ${a === 1 ? '' : a}x+${b}\\leq ${c}$，各邊減 ${b} 再除以 ${a}，得 $${loStr}\\leq x\\leq ${hiStr}$。整數解：$${intList.join('、')}$，共 $${intList.length}$ 個。`
          )
        );
        continue;
      }

      if (variant === 1) {
        // |x−a| ≦ b，求 a+b（逆推）
        const aCenter = randInt(-5, 10);
        const bRadius = randInt(2, 8);
        const lo = aCenter - bRadius;
        const hi = aCenter + bRadius;
        const totalLen = 2 * bRadius;
        questions.push(`不等式 $|x-a|\\leq b$（$a,b$ 為實數）的解為 $${lo}\\leq x\\leq ${hi}$，求 $a+b$。`);
        answers.push(
          formatJ242Answer(
            `${aCenter + bRadius}`,
            `解 $|x-a|\\leq b$ 等價於 $a-b\\leq x\\leq a+b$。依題意 $a-b=${lo}$ 且 $a+b=${hi}$，兩式相加得 $2a=${lo + hi}$，即 $a=${aCenter}$；相減得 $2b=${totalLen}$，即 $b=${bRadius}$。故 $a+b=${aCenter + bRadius}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        // |2x+b| ≦ c 解並求在數線上的線段長
        const bVals2 = [5, 3, 1, 7, 9];
        const cVals2 = [7, 4, 5, 9, 11];
        const b = bVals2[cycle % bVals2.length];
        const c = cVals2[cycle % cVals2.length];
        // |2x+b|≦c → -c≦2x+b≦c → (-c-b)/2 ≦ x ≦ (c-b)/2
        const loFrac = makeFraction(-c - b, 2);
        const hiFrac = makeFraction(c - b, 2);
        const loStr = fractionToLatex(loFrac, true);
        const hiStr = fractionToLatex(hiFrac, true);
        const lineLen = c; // (c-b)/2 - (-c-b)/2 = c
        questions.push(`解不等式 $|2x+${b}|\\leq ${c}$，並求解在數線上所對應線段的長度。`);
        answers.push(
          formatJ242Answer(
            `$${loStr}\\leq x\\leq ${hiStr}$，線段長 $${lineLen}$`,
            `由 $|2x+${b}|\\leq ${c}$ 得 $-${c}\\leq 2x+${b}\\leq ${c}$，整理得 $${loStr}\\leq x\\leq ${hiStr}$。線段長為 $${hiStr}-(${loStr})=${lineLen}$。`
          )
        );
        continue;
      }

      // variant 3: 0 < |x−a| < b 型（中空絕對值）
      const center = randInt(1, 6);
      const radius = randInt(2, 5);
      const lo = center - radius;
      const hi = center + radius;
      // integers satisfying: lo<x<hi and x≠center
      const intList2 = [];
      for (let x = lo + 1; x < hi; x += 1) {
        if (x !== center) intList2.push(x);
      }
      questions.push(`設 $x$ 為整數，滿足 $0<|x-${center}|<${radius}$ 的整數 $x$ 共有幾個？`);
      answers.push(
        formatJ242Answer(
          `${intList2.length} 個`,
          `$0<|x-${center}|<${radius}$ 表示 $x$ 與 $${center}$ 的距離大於 $0$（排除 $x=${center}$）且小於 $${radius}$，即 $${lo}<x<${hi}$ 且 $x\\neq ${center}$。整數解為 $${intList2.join('、')}$，共 $${intList2.length}$ 個。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-4-2 新增：已知 x 範圍求線性函數範圍 ──────────────────────────────
  function buildJ242XRangeLinearFuncSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    function formatLinearExpr(a, b, variable = 'x') {
      const aPart = a === 1 ? variable : a === -1 ? `-${variable}` : `${a}${variable}`;

      if (b === 0) return aPart;
      return `${aPart}${b > 0 ? '+' : ''}${b}`;
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;
      const cycle = Math.floor(i / 4);

      if (variant === 0) {
        // 已知 a≦x≦b，求 cx+d 的範圍（c>0 直接）
        const xLo = -randInt(1, 5);
        const xHi = randInt(1, 6);
        const c = randInt(2, 5);
        const d = randInt(-8, 8);
        const fLo = c * xLo + d;
        const fHi = c * xHi + d;
        const expr = formatLinearExpr(c, d);

        questions.push(`設 $${xLo}\\leq x\\leq ${xHi}$，求 $${expr}$ 的範圍。`);

        answers.push(
          formatJ242Answer(
            `$${fLo}\\leq ${expr}\\leq ${fHi}$`,
            `因為 $${c}>0$，對不等式各邊同乘以 $${c}$：$${c * xLo}\\leq ${c}x\\leq ${c * xHi}$，各邊加 $${d}$：$${fLo}\\leq ${expr}\\leq ${fHi}$。`
          )
        );
        continue;
      }

      if (variant === 1) {
        // 已知 a<x<b，求 -cx+d 的範圍（c>0，需翻轉）
        const xLo = -randInt(1, 4);
        const xHi = randInt(2, 7);
        const c = randInt(2, 6);
        const d = randInt(5, 20);
        const fLo = -c * xHi + d; // -c*x 在 x=xHi 時取最小
        const fHi = -c * xLo + d;
        questions.push(`設 $${xLo}<x<${xHi}$，求 $-${c}x+${d}$ 的範圍。`);
        answers.push(
          formatJ242Answer(
            `$${fLo}<-${c}x+${d}<${fHi}$`,
            `因為 $-${c}<0$，各邊乘以 $-${c}$ 需反向：由 $${xLo}<x<${xHi}$ 得 $${-c * xHi}<-${c}x<${-c * xLo}$，再加 $${d}$ 得 $${fLo}<-${c}x+${d}<${fHi}$。`
          )
        );
        continue;
      }

      if (variant === 2) {
        // 已知 a≦x≦b，k=cx+d，求 k 的最大整數值
        const xLo = -randInt(1, 3);
        const xHi = randInt(1, 5);
        const c = randInt(2, 4);
        const d = randInt(3, 12);
        const fHiExact = c * xHi + d;
        const fHiIsInt = Number.isInteger(fHiExact);
        const maxK = fHiExact; // since x≦xHi is included
        const varName = ['k', 'p', 'q', 'm'][cycle % 4];
        questions.push(`若 $${xLo}\\leq x\\leq ${xHi}$，且 $${varName}=${c}x+${d}$，求 $${varName}$ 的最大整數值。`);
        answers.push(
          formatJ242Answer(
            `${maxK}`,
            `因 $${c}>0$，$${varName}$ 在 $x=${xHi}$ 時最大：$${varName}_{\\max}=${c}\\times ${xHi}+${d}=${maxK}$。最大整數值為 $${maxK}$。`
          )
        );
        continue;
      }

      // variant 3: 已知函數 A 的範圍，反推 x 範圍
      const c = randInt(2, 5);
      const d = randInt(3, 12);
      const fLo = randInt(2, 8);
      const fHi = fLo + randInt(3, 10);
      // fLo < -c*x+d < fHi → d-fHi < cx < d-fLo → (d-fHi)/c < x < (d-fLo)/c
      const xLoFrac = makeFraction(d - fHi, c);
      const xHiFrac = makeFraction(d - fLo, c);
      questions.push(
        `設 $P=-${c}(x+${Math.floor(d / c)})+${d - c * Math.floor(d / c)}$，若 $${fLo}<P<${fHi}$，求 $x$ 的範圍。`
      );
      // Simpler version
      const aConst = randInt(2, 6);
      const bConst = randInt(5, 15);
      const pLo = randInt(3, 8);
      const pHi = pLo + randInt(4, 10);
      // P = -aConst*x + bConst, pLo < P < pHi
      // → pLo < -aConst*x + bConst < pHi
      // → pLo - bConst < -aConst*x < pHi - bConst
      // → (bConst - pHi)/aConst < x < (bConst - pLo)/aConst
      const xLoF2 = makeFraction(bConst - pHi, aConst);
      const xHiF2 = makeFraction(bConst - pLo, aConst);
      questions[questions.length - 1] = `設 $P=-${aConst}x+${bConst}$，若 $${pLo}<P<${pHi}$，求 $x$ 的範圍。`;
      answers.push(
        formatJ242Answer(
          `$${fractionToLatex(xLoF2, true)}<x<${fractionToLatex(xHiF2, true)}$`,
          `由 $${pLo}<-${aConst}x+${bConst}<${pHi}$ 各邊減 $${bConst}$：$${pLo - bConst}<-${aConst}x<${pHi - bConst}$，再除以 $-${aConst}$（不等號反向）：$${fractionToLatex(xLoF2, true)}<x<${fractionToLatex(xHiF2, true)}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ── j2-4-2 新增：濃度不等式應用 ──────────────────────────────────────────
  function buildJ242ConcentrationIneqSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        // a% 食鹽水 W 克，加清水 x 克，濃度不超過 b% → x ≧ (a-b)*W/b
        const aConc = [9, 8, 6, 10, 12, 15, 7, 14][cycle % 8];
        const bConc = [3, 4, 2, 5, 4, 5, 1, 7][cycle % 8];
        const W = [500, 400, 300, 600, 500, 200, 100, 350][cycle % 8];
        if (aConc <= bConc) {
          i -= 1;
          continue;
        }
        // salt = aConc*W/100, after adding x water: salt/(W+x) ≦ bConc/100
        // aConc*W ≦ bConc*(W+x) → x ≧ (aConc-bConc)*W/bConc
        const xNumer = (aConc - bConc) * W;
        const xDenom = bConc;
        const xMin = xNumer / xDenom;
        if (!Number.isInteger(xMin)) {
          i -= 1;
          continue;
        }
        questions.push(`${aConc}% 的食鹽水 ${W} 克，至少須加清水多少克，才能使食鹽水的濃度不超過 ${bConc}%？`);
        answers.push(
          formatJ242Answer(
            `${xMin} 克`,
            `設加清水 $x$ 克，食鹽量不變為 $${aConc}\\%\\times ${W}=${(aConc * W) / 100}$ 克。依題意 $\\dfrac{${(aConc * W) / 100}}{${W}+x}\\leq ${bConc}\\%$，整理得 $${(aConc * W) / 100}\\leq \\dfrac{${bConc}}{100}(${W}+x)$，解得 $x\\geq ${xMin}$。故至少加 $${xMin}$ 克清水。`
          )
        );
        continue;
      }

      if (variant === 1) {
        // a% 食鹽水 W 克，加食鹽 x 克（取最小整數），濃度超過 b%
        const aConc = [9, 4, 6, 8, 5, 7, 10, 3][cycle % 8];
        const bConc = [12, 7, 10, 12, 9, 11, 15, 8][cycle % 8];
        const W = [500, 300, 400, 500, 600, 350, 200, 250][cycle % 8];
        if (aConc >= bConc) {
          i -= 1;
          continue;
        }
        const saltInit = (aConc * W) / 100;
        // (saltInit + x)/(W + x) > bConc/100
        // 100*(saltInit + x) > bConc*(W+x)
        // 100*saltInit + 100x > bConc*W + bConc*x
        // (100-bConc)*x > bConc*W - 100*saltInit
        const coef = 100 - bConc;
        const rhs = bConc * W - 100 * saltInit;
        if (coef <= 0) {
          i -= 1;
          continue;
        }
        const xBound = rhs / coef;
        const xMin = Math.ceil(xBound + 1e-9);
        const xBoundFraction = makeFraction(rhs, coef);
        questions.push(`${aConc}% 的食鹽水 ${W} 克，至少須加鹽多少克（取最小整數），才能使濃度超過 ${bConc}%？`);
        answers.push(
          formatJ242Answer(
            `${xMin} 克`,
            `設加食鹽 $x$ 克，食鹽水共 $(${W}+x)$ 克，鹽共 $(${saltInit}+x)$ 克。依題意 $\\dfrac{${saltInit}+x}{${W}+x}>\\dfrac{${bConc}}{100}$，整理得 $${coef}x>${rhs}$，即 $x>${fractionToLatex(xBoundFraction, true)}$，取最小整數為 $${xMin}$ 克。`
          )
        );
        continue;
      }

      // variant 2: a% 食鹽水 W1 克與 b% 食鹽水 x 克混合，濃度不低於 c%
      const aConc = [4, 6, 3, 5, 4, 5, 2, 4][cycle % 8];
      const bConc = [9, 12, 10, 8, 10, 11, 8, 12][cycle % 8];
      const cConc = [6, 8, 5, 6, 7, 8, 5, 8][cycle % 8];
      const W1 = [300, 200, 400, 300, 500, 300, 300, 300][cycle % 8];
      if (aConc >= cConc || cConc >= bConc) {
        i -= 1;
        continue;
      }
      // (aConc*W1 + bConc*x) / (W1+x) ≧ cConc
      // aConc*W1 + bConc*x ≧ cConc*(W1+x)
      // (bConc-cConc)*x ≧ (cConc-aConc)*W1
      const coef2 = bConc - cConc;
      const rhs2 = (cConc - aConc) * W1;
      const xMin2 = rhs2 / coef2;
      if (!Number.isInteger(xMin2) || xMin2 <= 0) {
        i -= 1;
        continue;
      }
      questions.push(
        `${aConc}% 的食鹽水 ${W1} 克與 ${bConc}% 的食鹽水 $x$ 克混合，若希望混合後的濃度不低於 ${cConc}%，求 $x$ 的範圍。`
      );
      answers.push(
        formatJ242Answer(
          `$x\\geq ${xMin2}$ 克`,
          `混合後鹽為 $${(aConc * W1) / 100}+\\dfrac{${bConc}x}{100}$ 克，食鹽水共 $${W1}+x$ 克。依題意 $\\dfrac{${(aConc * W1) / 100}+\\frac{${bConc}x}{100}}{${W1}+x}\\geq \\dfrac{${cConc}}{100}$，整理得 $(${bConc}-${cConc})x\\geq (${cConc}-${aConc})\\times ${W1}=${rhs2}$，即 $${coef2}x\\geq ${rhs2}$，解得 $x\\geq ${xMin2}$。`
        )
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function formatSignedValue(value) {
    if (value === 0) return '';
    return value > 0 ? `+${value}` : `${value}`;
  }

  function formatTwoVarNoConstExpr(a, b) {
    const parts = [];
    function pushTerm(coef, variable) {
      if (coef === 0) return;
      const abs = Math.abs(coef);
      const body = `${abs === 1 ? '' : abs}${variable}`;
      if (parts.length === 0) {
        parts.push(coef < 0 ? `-${body}` : body);
      } else {
        parts.push(`${coef < 0 ? '-' : '+'}${body}`);
      }
    }
    pushTerm(a, 'x');
    pushTerm(b, 'y');
    return parts.length ? parts.join('') : '0';
  }

  function formatTwoVarEquation(a, b, c) {
    return `${formatTwoVarNoConstExpr(a, b)}=${c}`;
  }

  function formatPairList(pairs) {
    if (!pairs.length) return '無';
    return pairs.map(([x, y]) => `$(${x},${y})$`).join('、');
  }

  function buildJ211IntegerRegionConstraintsCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const coeffPairs = [
          [3, 4],
          [3, 5],
          [4, 5],
          [5, 6],
          [5, 7],
          [6, 7],
        ];
        let a = 3;
        let b = 4;
        let total = 0;
        let pairs = [];
        for (let attempt = 0; attempt < 40; attempt += 1) {
          [a, b] = coeffPairs[randInt(0, coeffPairs.length - 1)];
          const x0 = randInt(1, 6);
          const y0 = randInt(1, 6);
          total = a * x0 + b * y0;
          pairs = [];
          for (let x = 0; x <= Math.floor(total / a); x += 1) {
            const remain = total - a * x;
            if (remain >= 0 && remain % b === 0) pairs.push([x, remain / b]);
          }
          if (pairs.length >= 3 && pairs.length <= 8) break;
        }
        questions.push(`設 $x,y$ 均為非負整數，且 $${a}x+${b}y=${total}$，求所有可能的 $(x,y)$。`);
        summaryAnswers.push(formatPairList(pairs));
        answers.push(
          `由 $${a}x+${b}y=${total}$ 可先枚舉 $x=0,1,2,\\ldots,${Math.floor(total / a)}$，再檢查 $${total}-${a}x$ 是否為 ${b} 的倍數。符合者為 ${formatPairList(pairs)}。`
        );
      } else if (mode === 1) {
        const p = [2, 3, 4][randInt(0, 2)];
        const q = [3, 4, 5][randInt(0, 2)];
        const x0 = randInt(2, 7);
        const y0 = randInt(2, 7);
        const rhs = addFraction(makeFraction(x0, p), makeFraction(y0, q));
        const pairs = [];
        for (let x = 1; x <= 30; x += 1) {
          for (let y = 1; y <= 30; y += 1) {
            const value = addFraction(makeFraction(x, p), makeFraction(y, q));
            if (value.num === rhs.num && value.den === rhs.den) pairs.push([x, y]);
          }
        }
        const maxSum = Math.max(...pairs.map(([x, y]) => x + y));
        const best = pairs.filter(([x, y]) => x + y === maxSum);
        questions.push(
          `若 $x,y$ 均為正整數，且 $\\dfrac{x}{${p}}+\\dfrac{y}{${q}}=${fractionToLatex(rhs)}$，求 $x+y$ 的最大值。`
        );
        summaryAnswers.push(`最大值為 $${maxSum}$`);
        answers.push(
          `同乘 ${p * q} 後可轉為整係數方程，再列出正整數解。符合條件的解為 ${formatPairList(pairs)}，其中 $x+y$ 最大的是 ${formatPairList(best)}，最大值為 $${maxSum}$。`
        );
      } else if (mode === 2) {
        const a = [2, 3, 4][randInt(0, 2)];
        const b = [3, 4, 5][randInt(0, 2)];
        const x0 = randInt(4, 12);
        const y0 = randInt(1, x0 - 1);
        const total = a * x0 + b * y0;
        const pairs = [];
        for (let x = 1; x <= Math.floor(total / a); x += 1) {
          const remain = total - a * x;
          if (remain > 0 && remain % b === 0) {
            const y = remain / b;
            if (x > y) pairs.push([x, y]);
          }
        }
        questions.push(`求 $${a}x+${b}y=${total}$ 中，使 $x>y$ 的所有正整數解。`);
        summaryAnswers.push(formatPairList(pairs));
        answers.push(`先列出 $${a}x+${b}y=${total}$ 的正整數解，再保留 $x>y$ 的數對，可得 ${formatPairList(pairs)}。`);
      } else if (mode === 3) {
        const n = randInt(5, 10);
        const countPairs = ((n + 1) * (n + 2)) / 2;
        questions.push(`滿足 $x+y\\le ${n}$，且 $x,y$ 皆為非負整數的座標點共有幾組？`);
        summaryAnswers.push(`$${countPairs}$ 組`);
        answers.push(
          `固定 $x=0,1,2,\\ldots,${n}$ 時，$y$ 分別有 ${n + 1},${n},\\ldots,1 種選擇，所以共有 $1+2+\\cdots+${n + 1}=${countPairs}$ 組。`
        );
      } else {
        const n = randInt(8, 16);
        const pairs = [];
        for (let x = 0; x <= n; x += 1) {
          for (let y = 0; y <= n; y += 1) {
            if (x + 2 * y <= n) pairs.push([x, y]);
          }
        }
        questions.push(`滿足 $x+2y\\le ${n}$，且 $x,y$ 皆為非負整數的座標點共有幾組？`);
        summaryAnswers.push(`$${pairs.length}$ 組`);
        answers.push(
          `固定 $y=0,1,2,\\ldots,${Math.floor(n / 2)}$，再數出每個 $y$ 對應的 $x$ 可取值。共有 ${pairs.length} 組。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212ParameterSolutionReverseCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const x = randInt(1, 5);
        const y = randInt(-3, 5);
        const a = pickNonZero(-4, 5);
        const b = pickNonZero(-4, 5);
        const c2 = 2 * x - y;
        const p = 3;
        const q = 2;
        const c3 = p * x + q * y;
        const c1 = a * x + b * y;
        const c4 = a * x - b * y;
        questions.push(
          `若聯立方程式 $${formatSystemLatex(`ax+by=${c1}`, `2x-y=${c2}`)}$ 與 $${formatSystemLatex(`${p}x+${q}y=${c3}`, `ax-by=${c4}`)}$ 有相同的解，求 $a,b$。`
        );
        summaryAnswers.push(`$a=${a}$，$b=${b}$`);
        answers.push(
          `先由不含參數的兩式 $${formatSystemLatex(`2x-y=${c2}`, `${p}x+${q}y=${c3}`)}$ 解得 $(x,y)=(${x},${y})$。再代入 $ax+by=${c1}$ 與 $ax-by=${c4}$，解得 $a=${a},\\ b=${b}$。`
        );
      } else if (mode === 1) {
        const scale = randInt(2, 5);
        const a = 3 * scale;
        const b = 4 * scale;
        const c = 10 * scale;
        questions.push(`若聯立方程式 $${formatSystemLatex(`3x+4y=10`, `ax+by=${c}`)}$ 有無限多組解，求 $a,b$。`);
        summaryAnswers.push(`$a=${a}$，$b=${b}$`);
        answers.push(
          `要有無限多組解，第二式必須是第一式的同倍式。因為常數由 $10$ 變成 $${c}$，倍數為 ${scale}，所以 $a=3\\times${scale}=${a}$，$b=4\\times${scale}=${b}$。`
        );
      } else if (mode === 2) {
        const x = randInt(1, 7);
        const y = randInt(1, 7);
        const k = 3 * x - y;
        questions.push(
          `已知聯立方程式 $${formatSystemLatex(`x+2y=${x + 2 * y}`, `3x-y=k`)}$ 的解滿足 $x+y=${x + y}$，求 $k$。`
        );
        summaryAnswers.push(`$k=${k}$`);
        answers.push(
          `由 $${formatSystemLatex(`x+2y=${x + 2 * y}`, `x+y=${x + y}`)}$ 可先解得 $(x,y)=(${x},${y})$。代入 $3x-y=k$，得 $k=${k}$。`
        );
      } else if (mode === 3) {
        const x = randInt(1, 6);
        const y = randInt(-2, 6);
        const a = 2 * x + y;
        const b = x - 2 * y;
        const value = 2 * a - 3 * b;
        questions.push(`若 $${formatSystemLatex(`2x+y=a`, `x-2y=b`)}$ 的解為 $(${x},${y})$，求 $2a-3b$。`);
        summaryAnswers.push(`$${value}$`);
        answers.push(`把 $(x,y)=(${x},${y})$ 代入可得 $a=${a}$、$b=${b}$，所以 $2a-3b=${value}$。`);
      } else {
        const x = randInt(1, 6);
        const y = randInt(1, 6);
        const a = randInt(2, 5);
        const b = randInt(2, 5);
        const c1 = a * x + 3 * y;
        const c2 = x - b * y;
        questions.push(
          `已知 $(x,y)=(${x},${y})$ 是 $${formatSystemLatex(`ax+3y=${c1}`, `x-by=${c2}`)}$ 的解，求 $a+b$。`
        );
        summaryAnswers.push(`$${a + b}$`);
        answers.push(
          `代入已知解：$${a}x+3y=${c1}$ 可求得 $a=${a}$，$x-by=${c2}$ 可求得 $b=${b}$，所以 $a+b=${a + b}$。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212ErrorReconstructionCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const x = randInt(1, 5);
      const y = randInt(1, 5);
      const a = pickNonZero(2, 6);
      const b = pickNonZero(2, 6);
      const c = a * x + y;
      const d = 2 * x + b * y;
      const t1 = randInt(1, 3);
      const wrongA = { x: x + b * t1, y: y - 2 * t1 };
      if (wrongA.y === 0) {
        i -= 1;
        continue;
      }
      const t2 = randInt(1, 3);
      const wrongB = { x: x + t2, y: y - a * t2 };
      if (wrongB.y === 0) {
        i -= 1;
        continue;
      }
      questions.push(
        `原聯立方程式為 $${formatSystemLatex(`ax+y=${c}`, `2x+by=${d}`)}$。甲看錯 $a$ 後解得 $(${wrongA.x},${wrongA.y})$，乙看錯 $b$ 後解得 $(${wrongB.x},${wrongB.y})$。求正確的 $a,b$ 與原方程式的解。`
      );
      summaryAnswers.push(`$a=${a}$，$b=${b}$，$(x,y)=(${x},${y})$`);
      answers.push(
        `甲只看錯 $a$，所以 $(${wrongA.x},${wrongA.y})$ 仍滿足第二式：$2\\times${wrongA.x}+b\\times(${wrongA.y})=${d}$，可得 $b=${b}$。乙只看錯 $b$，所以 $(${wrongB.x},${wrongB.y})$ 仍滿足第一式：$a\\times${wrongB.x}${formatSignedValue(wrongB.y)}=${c}$，可得 $a=${a}$。原式為 $${formatSystemLatex(`${a}x+y=${c}`, `2x+${b}y=${d}`)}$，解得 $(x,y)=(${x},${y})$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ212FractionReciprocalHybridCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const x = [2, 3, 4, 5, 6][randInt(0, 4)];
        const y = [3, 4, 5, 6, 8][randInt(0, 4)];
        const u = makeFraction(1, x);
        const v = makeFraction(1, y);
        const r1 = addFraction(mulFraction(makeFraction(2, 1), u), mulFraction(makeFraction(3, 1), v));
        const r2 = subFraction(mulFraction(makeFraction(4, 1), u), v);
        questions.push(
          `解聯立方程式：$${formatSystemLatex(`\\dfrac{2}{x}+\\dfrac{3}{y}=${fractionToLatex(r1)}`, `\\dfrac{4}{x}-\\dfrac{1}{y}=${fractionToLatex(r2)}`)}$。`
        );
        summaryAnswers.push(`$(x,y)=(${x},${y})$`);
        answers.push(
          `設 $u=\\dfrac{1}{x},\\ v=\\dfrac{1}{y}$，原式化為 $${formatSystemLatex(`2u+3v=${fractionToLatex(r1)}`, `4u-v=${fractionToLatex(r2)}`)}$。解得 $u=${fractionToLatex(u)},\\ v=${fractionToLatex(v)}$，所以 $(x,y)=(${x},${y})$。`
        );
      } else if (mode === 1) {
        const x = randInt(4, 10);
        const y = randInt(1, x - 1);
        const s = x + y;
        const d = x - y;
        const u = makeFraction(1, s);
        const v = makeFraction(1, d);
        const r1 = addFraction(u, v);
        const r2 = subFraction(u, v);
        questions.push(
          `解聯立方程式：$${formatSystemLatex(`\\dfrac{1}{x+y}+\\dfrac{1}{x-y}=${fractionToLatex(r1)}`, `\\dfrac{1}{x+y}-\\dfrac{1}{x-y}=${fractionToLatex(r2)}`)}$。`
        );
        summaryAnswers.push(`$(x,y)=(${x},${y})$`);
        answers.push(
          `設 $u=\\dfrac{1}{x+y},\\ v=\\dfrac{1}{x-y}$，先解得 $u=${fractionToLatex(u)},\\ v=${fractionToLatex(v)}$，所以 $x+y=${s}$、$x-y=${d}$。再聯立得 $(x,y)=(${x},${y})$。`
        );
      } else if (mode === 2) {
        const x = randInt(2, 8);
        const y = randInt(1, 7);
        const s = x + y;
        const d = x - y;
        const r1 = subFraction(makeFraction(s, 2), makeFraction(d, 3));
        const r2 = addFraction(makeFraction(s, 4), makeFraction(d, 5));
        questions.push(
          `解聯立方程式：$${formatSystemLatex(`\\dfrac{x+y}{2}-\\dfrac{x-y}{3}=${fractionToLatex(r1)}`, `\\dfrac{x+y}{4}+\\dfrac{x-y}{5}=${fractionToLatex(r2)}`)}$。`
        );
        summaryAnswers.push(`$(x,y)=(${x},${y})$`);
        answers.push(
          `把 $x+y$ 與 $x-y$ 視為兩個整體，先解出 $x+y=${s}$、$x-y=${d}$，再聯立和差，得 $(x,y)=(${x},${y})$。`
        );
      } else if (mode === 3) {
        const x = randInt(3, 10);
        const y = randInt(1, 8);
        const r1 = subFraction(makeFraction(x - y + 1, 3), makeFraction(2 * x + y - 1, 2));
        const sum = x + y;
        questions.push(
          `化簡並解聯立方程式：$${formatSystemLatex(`\\dfrac{x-y+1}{3}-\\dfrac{2x+y-1}{2}=${fractionToLatex(r1)}`, `x+y=${sum}`)}$。`
        );
        summaryAnswers.push(`$(x,y)=(${x},${y})$`);
        answers.push(`第一式先同乘 6 化成一次式，再與 $x+y=${sum}$ 聯立。整理後可解得 $(x,y)=(${x},${y})$。`);
      } else {
        const x = [4, 6, 8, 10, 12][randInt(0, 4)];
        const ratio = [2, 3, 4][randInt(0, 2)];
        const y = (x * 3) / 2;
        if (!Number.isInteger(y)) {
          i -= 1;
          continue;
        }
        const total = ratio * x + y;
        questions.push(`若 $\\dfrac{x}{y}=\\dfrac{2}{3}$，且 $${ratio}x+y=${total}$，求 $(x,y)$。`);
        summaryAnswers.push(`$(x,y)=(${x},${y})$`);
        answers.push(
          `$\\dfrac{x}{y}=\\dfrac{2}{3}$ 可改寫成 $3x=2y$。再與 $${ratio}x+y=${total}$ 聯立，解得 $(x,y)=(${x},${y})$。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ213ComplexContextModelingCleanSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const free = [15, 18, 20, 23][randInt(0, 3)];
        const rate = [12, 15, 20, 25][randInt(0, 3)];
        const w1 = free + randInt(5, 10);
        const w2 = w1 + randInt(4, 9);
        const fee1 = rate * (w1 - free);
        const fee2 = rate * (w2 - free);
        questions.push(
          `航空公司規定行李 $a$ 公斤以下免費，超過部分每公斤收 $b$ 元。已知 ${w1} 公斤需付 ${fee1} 元，${w2} 公斤需付 ${fee2} 元，求 $a,b$。`
        );
        summaryAnswers.push(`$a=${free}$，$b=${rate}$`);
        answers.push(
          `由題意可列 $${formatSystemLatex(`b(${w1}-a)=${fee1}`, `b(${w2}-a)=${fee2}`)}$。兩式相減得 $${w2 - w1}b=${fee2 - fee1}$，所以 $b=${rate}$；代回得 $a=${free}$。`
        );
      } else if (mode === 1) {
        const base = [40, 50, 60][randInt(0, 2)];
        const minuteFee = [2, 3, 4][randInt(0, 2)];
        const drink = [20, 25, 30][randInt(0, 2)];
        const m1 = 90;
        const m2 = 150;
        const total1 = drink + base + (m1 - 60) * minuteFee;
        const total2 = drink + base + (m2 - 60) * minuteFee;
        questions.push(
          `網咖基本費 $x$ 元含 60 分鐘，超過後每分鐘 $y$ 元，另需飲料低消 ${drink} 元。若上網 ${m1} 分鐘花 ${total1} 元，${m2} 分鐘花 ${total2} 元，求 $x,y$。`
        );
        summaryAnswers.push(`$x=${base}$，$y=${minuteFee}$`);
        answers.push(
          `可列 $${formatSystemLatex(`${drink}+x+${m1 - 60}y=${total1}`, `${drink}+x+${m2 - 60}y=${total2}`)}$。兩式相減得 $${m2 - m1}y=${total2 - total1}$，所以 $y=${minuteFee}$，再代回得 $x=${base}$。`
        );
      } else if (mode === 2) {
        const x = [100, 150, 200, 250][randInt(0, 3)];
        const y = [100, 150, 200, 250][randInt(0, 3)];
        const addWater = 50;
        const total = x + y;
        const target = (10 * x + 20 * y) / (total + addWater);
        if (!Number.isInteger(target)) {
          i -= 1;
          continue;
        }
        questions.push(
          `將 10% 鹽水 $x$ 克與 20% 鹽水 $y$ 克混合，再加入 ${addWater} 克水後濃度為 ${target}%，且混合前共有 ${total} 克，求 $x,y$。`
        );
        summaryAnswers.push(`$x=${x}$，$y=${y}$`);
        answers.push(
          `由總重量得 $x+y=${total}$。由鹽量不變得 $10x+20y=${target}(x+y+${addWater})$。聯立解得 $x=${x},\\ y=${y}$。`
        );
      } else if (mode === 3) {
        const slow = [10, 12, 15][randInt(0, 2)];
        const fast = slow + [5, 6, 8][randInt(0, 2)];
        const distance = (slow + fast) * 2;
        const catchTime = distance / (fast - slow);
        questions.push(
          `甲、乙兩人相距 ${distance} 公里。若相向而行，2 小時後相遇；若同向而行，甲 ${catchTime} 小時追上乙。求甲、乙兩人的時速。`
        );
        summaryAnswers.push(`甲 $${fast}$ 公里/時，乙 $${slow}$ 公里/時`);
        answers.push(
          `設甲較快，時速為 $x$，乙時速為 $y$。相向而行得 $2(x+y)=${distance}$；同向追及得 $${catchTime}(x-y)=${distance}$。解得 $x=${fast},\\ y=${slow}$。`
        );
      } else {
        const ten = randInt(6, 18);
        const five = randInt(6, 18);
        const totalCoins = ten + five;
        const decrease = Math.abs(10 * ten + 5 * five - (10 * five + 5 * ten));
        if (decrease === 0) {
          i -= 1;
          continue;
        }
        questions.push(
          `我有 5 元與 10 元硬幣共 ${totalCoins} 個。若把兩種硬幣的數量交換，總金額會減少 ${decrease} 元。求原來各有多少個 10 元硬幣與 5 元硬幣。`
        );
        summaryAnswers.push(`10 元 $${ten}$ 個，5 元 $${five}$ 個`);
        answers.push(
          `設 10 元硬幣有 $x$ 個、5 元硬幣有 $y$ 個。由總個數得 $x+y=${totalCoins}$。交換後金額減少表示 $(10x+5y)-(10y+5x)=${decrease}$。解得 $x=${ten},\\ y=${five}$。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  const nextConfigs = {
    'j2-1-1-context-to-equation-drill': {
      type: 'drill',
      title: '文字敘述轉換為代數式',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ2ContextEquationSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-context-linear-equation-drill': {
      type: 'drill',
      title: '文字情境列二元一次方程式',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ211ContextLinearEquationSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-expression-classify-drill': {
      type: 'drill',
      title: '二元一次式與方程式判別',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ2ClassifySet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-evaluate-expression-drill': {
      type: 'drill',
      title: '求二元一次式的值',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ2EvaluateExpressionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-expression-simplify-drill': {
      type: 'drill',
      title: '二元一次式的化簡（合併同類項）',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ2ExpressionSimplifySet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-distribute-expand-drill': {
      type: 'drill',
      title: '去括號與分配律運算',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ2DistributeExpandSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-fraction-simplify-drill': {
      type: 'drill',
      title: '分數形式的化簡（通分）',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ2FractionSimplifySet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-ordered-pair-check-drill': {
      type: 'drill',
      title: '數對代入與成立判斷',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ2OrderedPairCheckSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-parameter-substitution-drill': {
      type: 'drill',
      title: '參數題代入求係數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ2ParameterSubstitutionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-equivalent-transform-drill': {
      type: 'drill',
      title: '標準型整理（移項）',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ2EquivalentTransformSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-integer-constraint-drill': {
      type: 'drill',
      title: '列出多組整數解',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ2IntegerConstraintSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-solve-for-variable-drill': {
      type: 'drill',
      title: '整理成 x 表示 y、y 表示 x',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ2SolveForVariableSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-find-var-value-drill': {
      type: 'drill',
      title: '代入求變數值（若x=c,y=a型）',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ211FindVarValueSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-find-x-coeff-drill': {
      type: 'drill',
      title: '代入求x係數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ211FindXCoeffSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-any-one-solution-drill': {
      type: 'drill',
      title: '任意一組整數解',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ211AnyOneSolutionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-all-pos-int-solution-drill': {
      type: 'drill',
      title: '所有正整數解',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ211AllPosIntSolutionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-range-int-solution-drill': {
      type: 'drill',
      title: '有條件整數解（負整數/有界範圍）',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ211RangeIntSolutionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-prime-solution-drill': {
      type: 'drill',
      title: '質數條件整數解',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ211PrimeSolutionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-shopping-word-drill': {
      type: 'drill',
      title: '購物情境應用題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ211ShoppingWordSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-1-integer-region-constraints-clean': {
      type: 'drill',
      title: '整數解與座標限制討論',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ211IntegerRegionConstraintsCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },

    'j2-1-2-substitution-basic-drill': {
      type: 'drill',
      title: '代入消去法的基礎練習',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212SubstitutionBasicSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-elimination-adjustment-drill': {
      type: 'drill',
      title: '加減消去法的係數調整',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212EliminationAdjustmentSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-bracket-simplify-drill': {
      type: 'drill',
      title: '先化簡再解聯立方程式',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212BracketSimplifySet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-fraction-decimal-drill': {
      type: 'drill',
      title: '分數與小數型的化簡',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212FractionDecimalSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-solution-type-drill': {
      type: 'drill',
      title: '解的個數判定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212SolutionTypeSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-triple-equal-drill': {
      type: 'drill',
      title: '特殊結構運算（A=B=C）',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212TripleEqualSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-symmetric-system-drill': {
      type: 'drill',
      title: '特殊結構運算（係數對稱）',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212SymmetricSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-abs-zero-drill': {
      type: 'drill',
      title: '特殊結構運算（非負性質）',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212AbsZeroSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-known-solution-coeff-drill': {
      type: 'drill',
      title: '已知解反求係數',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212KnownSolutionCoeffSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-parameter-solution-reverse-clean': {
      type: 'drill',
      title: '隱藏係數與解的反推',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212ParameterSolutionReverseCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-error-diagnosis-drill': {
      type: 'drill',
      title: '看錯題目（邏輯排錯）',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212ErrorDiagnosisSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-error-reconstruction-clean': {
      type: 'drill',
      title: '看錯題目的係數回推',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212ErrorReconstructionCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-shared-solution-drill': {
      type: 'drill',
      title: '同解問題（兩組方程組共有解）',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212SharedSolutionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-third-condition-drill': {
      type: 'drill',
      title: '解滿足第三個條件',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212ThirdConditionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-special-reverse-drill': {
      type: 'drill',
      title: '特殊解情形的反求',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212SpecialReverseSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-reciprocal-substitution-drill': {
      type: 'drill',
      title: '倒數代換聯立方程式',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212ReciprocalSubstitutionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-reciprocal-structure-drill': {
      type: 'drill',
      title: '和差倒數結構代換',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212ReciprocalStructureSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-fraction-reciprocal-hybrid-clean': {
      type: 'drill',
      title: '分數型與倒數型聯立方程',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212FractionReciprocalHybridCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-2-two-solution-one-eq-drill': {
      type: 'drill',
      title: '兩組解求方程式係數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ212TwoSolutionOneEqSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-money-ticket-drill': {
      type: 'drill',
      title: '濃度與混合問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213MoneyTicketSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-heads-coins-score-drill': {
      type: 'drill',
      title: '淨重、毛重與容器問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213HeadsCoinsScoreSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-digit-placevalue-drill': {
      type: 'drill',
      title: '數字位數與交換問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213DigitPlaceValueSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-age-chase-drill': {
      type: 'drill',
      title: '測驗得分與勝負判定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213AgeChaseSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-speed-chase-drill': {
      type: 'drill',
      title: '行程速率與追趕問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213SpeedChaseSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-allocation-work-drill': {
      type: 'drill',
      title: '分配與工程問題',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213AllocationWorkSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-tiered-fee-drill': {
      type: 'drill',
      title: '基本費與超額計費問題',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213TieredFeeSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-classical-text-drill': {
      type: 'drill',
      title: '古文應用題',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213ClassicalTextSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-unit-price-system-drill': {
      type: 'drill',
      title: '單價與總價聯立問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213UnitPriceSystemSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-age-relation-drill': {
      type: 'drill',
      title: '年齡與倍數和差問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213AgeRelationSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-perimeter-relation-drill': {
      type: 'drill',
      title: '長寬與周長條件問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213PerimeterRelationSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-transfer-change-drill': {
      type: 'drill',
      title: '移轉後倍數相等問題',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213TransferChangeSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-travel-schedule-drill': {
      type: 'drill',
      title: '往返與準時行程問題',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213TravelScheduleSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-balance-scale-drill': {
      type: 'drill',
      title: '等臂天平稱重聯立方程',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213BalanceScaleSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-class-size-score-drill': {
      type: 'drill',
      title: '班級人數與成績分析',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213ClassSizeScoreSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-pairwise-sum-drill': {
      type: 'drill',
      title: '多人成對和問題',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213PairwiseSumSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-box-distribution-drill': {
      type: 'drill',
      title: '分配與分箱問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213BoxDistributionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-1-3-complex-context-modeling-clean': {
      type: 'drill',
      title: '複合情境聯立建模',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ213ComplexContextModelingCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-1-axis-distance-drill': {
      type: 'drill',
      title: '點的坐標表示法與坐標軸距離',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ221AxisDistanceSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-1-quadrant-basic-drill': {
      type: 'drill',
      title: '各象限及其性質符號判別',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ221QuadrantBasicSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-1-translation-basic-drill': {
      type: 'drill',
      title: '坐標平面上的平移移動',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ221TranslationSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-1-axis-special-drill': {
      type: 'drill',
      title: '坐標軸上的點與特殊位置判定',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ221AxisSpecialSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-1-midpoint-drill': {
      type: 'drill',
      title: '中點坐標公式',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ221MidpointSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-1-symmetry-drill': {
      type: 'drill',
      title: '坐標平面上的對稱點',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ221SymmetrySet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-1-area-drill': {
      type: 'drill',
      title: '幾何圖形的面積計算',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ221AreaSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-1-quadrant-reasoning-drill': {
      type: 'drill',
      title: '含代數參數的象限推理',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ221QuadrantReasoningSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-1-nonnegative-drill': {
      type: 'drill',
      title: '絕對值與平方的非負性質應用',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ221NonnegativeSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-1-quadrant-coordinate-constraints-clean': {
      type: 'drill',
      title: '象限與坐標限制推論',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ221QuadrantCoordinateConstraintsCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-1-coordinate-area-midpoint-clean': {
      type: 'drill',
      title: '坐標面積與中點整合',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ221CoordinateAreaMidpointCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-1-coordinate-transform-multistep-clean': {
      type: 'drill',
      title: '坐標平移與限制整合',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ221CoordinateTransformMultistepCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-2-point-line-relation-drill': {
      type: 'drill',
      title: '含有未知數的點與方程式關係',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ222PointLineRelationSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-2-intercept-area-drill': {
      type: 'drill',
      title: '利用截距找交點與三角形面積',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ222InterceptAreaSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-2-quadrant-exclusion-drill': {
      type: 'drill',
      title: '由係數正負判斷不通過之象限',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ222QuadrantExclusionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-2-parallel-perpendicular-drill': {
      type: 'drill',
      title: '水平線與鉛垂線的判定與方程',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ222ParallelPerpendicularSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-2-line-from-points-drill': {
      type: 'drill',
      title: '已知兩點求直線方程式',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ222LineFromPointsSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-2-only-two-quadrants-drill': {
      type: 'drill',
      title: '進階判斷：只通過兩個象限',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ222TwoQuadrantsSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-2-point-translation-line-drill': {
      type: 'drill',
      title: '點的平移與直線的變動',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ222TranslationLineSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-2-two-lines-area-drill': {
      type: 'drill',
      title: '兩直線交點與坐標軸圍成面積',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ222TwoLinesAreaSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-2-slope-intercept-drill': {
      type: 'drill',
      title: '斜率、截距與方程式互換',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ222SlopeInterceptSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-2-parallel-perpendicular-equation-drill': {
      type: 'drill',
      title: '過一點作平行線與垂直線',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ222ParallelPerpendicularEquationSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-2-line-intersection-drill': {
      type: 'drill',
      title: '兩直線交點與參數判定',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ222LineIntersectionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-2-2-line-quadrant-intercept-clean': {
      type: 'drill',
      title: '直線象限與截距整合',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ222LineQuadrantInterceptCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-1-ratio-simplify-drill': {
      type: 'drill',
      title: '比例化簡與比值運算',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ231RatioSimplifySet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-1-proportion-solve-drill': {
      type: 'drill',
      title: '比例式求解未知數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ231ProportionSolveSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-1-relation-transform-drill': {
      type: 'drill',
      title: '關係式與比例式互換',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ231RelationTransformSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-1-k-method-drill': {
      type: 'drill',
      title: '設比例常數求值',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ231KMethodSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-1-basic-single-step-drill': {
      type: 'drill',
      title: '基本題型（單層動作）',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ231BasicSingleStepSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-1-regular-two-step-drill': {
      type: 'drill',
      title: '正規題型（二層動作）',
      difficulty: 'medium',
      questionCount: 7,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ231RegularTwoStepSet(practiceCount),
          resolvePracticeCount(count, 7)
        );
      },
    },
    'j2-3-1-advanced-three-step-drill': {
      type: 'drill',
      title: '進階題型（三層動作）',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ231AdvancedThreeStepSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-1-concentration-reverse-drill': {
      type: 'drill',
      title: '濃度混合與逆推稀釋題',
      difficulty: 'challenge',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ231ConcentrationReverseSet(practiceCount),
          resolvePracticeCount(count, 6)
        );
      },
    },
    'j2-3-1-chain-ratio-drill': {
      type: 'drill',
      title: '連比整合與分配',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ231ChainRatioSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-1-variable-ratio-percent-clean': {
      type: 'drill',
      title: '比例變量與百分率連動',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ231VariableRatioPercentCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-1-constrained-ratio-applications-clean': {
      type: 'drill',
      title: '具約束條件的比例應用',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ231ConstrainedApplicationsCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-2-basic-direct-inverse-drill': {
      type: 'drill',
      title: '基礎正反比運算',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ232BasicDirectInverseSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-2-linear-combo-proportion-drill': {
      type: 'drill',
      title: '線性組合式比例',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ232LinearComboProportionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-2-square-proportion-drill': {
      type: 'drill',
      title: '次方型比例',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ232SquareProportionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-2-chained-variation-drill': {
      type: 'drill',
      title: '正反比鏈接',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ232ChainedVariationSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-2-percent-change-drill': {
      type: 'drill',
      title: '變量百分率異動下的比例計算',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ232PercentChangeSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-2-word-judgment-drill': {
      type: 'drill',
      title: '正反比文字判斷',
      difficulty: 'easy',
      questionCount: 10,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ232WordJudgmentSet(practiceCount),
          resolvePracticeCount(count, 10)
        );
      },
    },
    'j2-3-2-shifted-variation-drill': {
      type: 'drill',
      title: '位移型正反比',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ232ShiftedVariationSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-2-root-reciprocal-variation-drill': {
      type: 'drill',
      title: '平方根與倒平方結構正反比',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ232RootReciprocalVariationSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-2-spring-scale-drill': {
      type: 'drill',
      title: '彈簧秤（虎克定律）應用',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ232SpringScaleSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-2-work-manpower-drill': {
      type: 'drill',
      title: '工程人力反比應用',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ232WorkManpowerSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-2-speed-race-drill': {
      type: 'drill',
      title: '速率比賽跑落後問題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ232SpeedRaceSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-2-dog-rabbit-drill': {
      type: 'drill',
      title: '犬兔步距速率問題',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ232DogRabbitSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-2-power-geometry-models-clean': {
      type: 'drill',
      title: '平方立方比例模型',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ232PowerGeometryModelsCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-2-cross-variation-chain-clean': {
      type: 'drill',
      title: '複合正反比鏈接',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ232CrossVariationChainCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-3-2-function-coordinate-proportion-clean': {
      type: 'drill',
      title: '函數與坐標比例判斷',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ232FunctionCoordinateProportionCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-1-inequality-language-drill': {
      type: 'drill',
      title: '基本判定與直覺題',
      difficulty: 'easy',
      questionCount: 8,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ241InequalityLanguageSet(practiceCount),
          resolvePracticeCount(count, 8)
        );
      },
    },
    'j2-4-1-inequality-integer-drill': {
      type: 'drill',
      title: '正規解不等式（整數型）',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ241IntegerSolveSet(practiceCount),
          resolvePracticeCount(count, 6)
        );
      },
    },
    'j2-4-1-inequality-fraction-drill': {
      type: 'drill',
      title: '進階運算題（分數型）',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ241FractionSolveSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-1-inequality-decimal-drill': {
      type: 'drill',
      title: '進階運算題（小數型）',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ241DecimalSolveSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-1-inequality-range-drill': {
      type: 'drill',
      title: '範圍推導',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ241RangeSet(practiceCount),
          resolvePracticeCount(count, 6)
        );
      },
    },
    'j2-4-1-inequality-reverse-coeff-drill': {
      type: 'drill',
      title: '由解逆推原不等式中的未知係數',
      difficulty: 'hard',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ241ReverseCoeffSet(practiceCount),
          resolvePracticeCount(count, 6)
        );
      },
    },
    'j2-4-1-inequality-known-solution-range-drill': {
      type: 'drill',
      title: '已知解反求參數範圍',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ241KnownSolutionParamRangeSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-1-inequality-same-solution-drill': {
      type: 'drill',
      title: '綜合應用題（兩不等式解相同）',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ241SameSolutionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-1-compound-inequality-drill': {
      type: 'drill',
      title: '雙重不等式範圍求解',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ241CompoundInequalitySet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-1-absolute-inequality-drill': {
      type: 'drill',
      title: '絕對值一次不等式',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ241AbsoluteInequalitySet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-1-integer-boundary-drill': {
      type: 'drill',
      title: '整數解個數與最大最小值',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ241IntegerBoundarySet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-1-param-positive-trap-clean': {
      type: 'drill',
      title: '參數正負號與解向陷阱',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ241ParamPositiveTrapCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-1-compound-integer-counting-clean': {
      type: 'drill',
      title: '聯立不等式與整數解計數',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ241CompoundIntegerCountingCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-1-abs-geometry-fraction-mixed-clean': {
      type: 'drill',
      title: '絕對值、幾何與分數不等式整合',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ241AbsGeometryFractionMixedCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-2-specific-score-threshold-drill': {
      type: 'drill',
      title: '具體分數平均門檻',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242SpecificScoreThresholdSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-2-pos-int-enumerate-drill': {
      type: 'drill',
      title: '正整數列舉（符合條件的所有正整數）',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242PosIntEnumerateSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-2-integer-condition-word-drill': {
      type: 'drill',
      title: '某整數／某正數條件型',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242IntegerConditionWordSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-2-shape-variable-expr-drill': {
      type: 'drill',
      title: '圖形含變數表達式（長方形＋三角形）',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242ShapeVariableExprSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-2-age-past-relation-drill': {
      type: 'drill',
      title: '父子年齡過去比較型',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242AgePastRelationSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-2-solve-ineq-integer-drill': {
      type: 'drill',
      title: '解不等式求整數解',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242SolveIneqIntegerSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-2-given-solution-find-coeff-drill': {
      type: 'drill',
      title: '已知解求係數',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242GivenSolutionFindCoeffSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-2-compound-ineq-drill': {
      type: 'drill',
      title: '聯立（雙重）不等式',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242CompoundIneqSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-2-abs-value-ineq-drill': {
      type: 'drill',
      title: '絕對值不等式',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242AbsValueIneqSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-2-x-range-linear-func-drill': {
      type: 'drill',
      title: '已知 x 範圍求函數範圍',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242XRangeLinearFuncSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-2-concentration-ineq-drill': {
      type: 'drill',
      title: '濃度不等式應用',
      difficulty: 'hard',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242ConcentrationIneqSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },

    'j2-4-2-basic-word-drill': {
      type: 'drill',
      title: '基本題型（單層動作）',
      difficulty: 'easy',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242BasicWordSet(practiceCount),
          resolvePracticeCount(count, 6)
        );
      },
    },
    'j2-4-2-regular-word-drill': {
      type: 'drill',
      title: '正規題型（二層動作）',
      difficulty: 'medium',
      questionCount: 6,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242RegularWordSet(practiceCount),
          resolvePracticeCount(count, 6)
        );
      },
    },
    'j2-4-2-advanced-word-drill': {
      type: 'drill',
      title: '進階題型（三層動作）',
      difficulty: 'hard',
      questionCount: 7,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242AdvancedWordSet(practiceCount),
          resolvePracticeCount(count, 7)
        );
      },
    },
    'j2-4-2-average-threshold-word-drill': {
      type: 'drill',
      title: '平均門檻應用題',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242AverageThresholdSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-4-2-logic-applications-clean': {
      type: 'drill',
      title: '現實限制與邏輯不等式應用',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ242LogicApplicationsCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-5-1-frequency-relative-cumulative-drill': {
      type: 'drill',
      title: '次數、相對次數與累積次數',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ251FrequencyRelativeCumulativeSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-5-1-pie-chart-conversion-drill': {
      type: 'drill',
      title: '圓形圖百分比與角度換算',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ251PieChartConversionSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-5-1-pie-backward-population-clean': {
      type: 'drill',
      title: '圓形圖人數逆推',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ251PieBackwardPopulationCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-5-1-percent-angle-hybrid-clean': {
      type: 'drill',
      title: '圓心角與百分比複合轉換',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ251PercentAngleHybridCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-5-1-dynamic-pie-data-clean': {
      type: 'drill',
      title: '圓形圖資料變動分析',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ251DynamicPieDataCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-5-1-pie-sector-context-clean': {
      type: 'drill',
      title: '圓形圖扇形面積與角度整合',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ251PieSectorContextCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-5-1-data-cleaning-logic-clean': {
      type: 'drill',
      title: '統計資料檢核與百分比判斷',
      difficulty: 'challenge',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ251DataCleaningLogicCleanSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-5-1-grouped-mean-estimate-drill': {
      type: 'drill',
      title: '組中點估計平均數',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ251GroupedMeanEstimateSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-5-2-mean-basic-drill': {
      type: 'drill',
      title: '平均數直接計算',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ252MeanBasicSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-5-2-mean-reverse-drill': {
      type: 'drill',
      title: '平均數反推與調整',
      difficulty: 'medium',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ252MeanReverseSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
    'j2-5-2-median-mode-drill': {
      type: 'drill',
      title: '中位數與眾數判讀',
      difficulty: 'easy',
      questionCount: 5,
      generate(count) {
        return buildUniquePracticeSet(
          (practiceCount) => buildJ252MedianModeSet(practiceCount),
          resolvePracticeCount(count, 5)
        );
      },
    },
  };

  const bundleFingerprint = 'j2-bundle-v20260715-j25-summary-review-v1';
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== 'object') return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
