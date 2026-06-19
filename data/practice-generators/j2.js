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
    const answers = [];

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ213HeadsCoinsScoreSet(count) {
    const questions = [];
    const answers = [];

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ213DigitPlaceValueSet(count) {
    const questions = [];
    const answers = [];

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
        `設十位數字為 $x$，個位數字為 $y$。依題意可列聯立方程式 $${formatSystemLatex(`y=x+2`, `10x+y=4(x+y)+${extra}`)}$。解得 $x=${tens},\\ y=${ones}$，所以原數是 ${original}。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ213AgeChaseSet(count) {
    const questions = [];
    const answers = [];

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ213SpeedChaseSet(count) {
    const questions = [];
    const answers = [];

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function lcmInt(a, b) {
    return Math.abs(a * b) / gcdInt(a, b);
  }

  function buildJ213AllocationWorkSet(count) {
    const questions = [];
    const answers = [];

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ213TieredFeeSet(count) {
    const questions = [];
    const answers = [];

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ213ClassicalTextSet(count) {
    const questions = [];
    const answers = [];

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ221AxisDistanceSet(count) {
    const questions = [];
    const answers = [];
    const quadrantLabel = ['一', '二', '三', '四'];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const x = randInt(-9, 9) || 4;
        const y = randInt(-9, 9) || -3;
        questions.push(`如果點 $P(${x},${y})$ 表示平面上一點，求 $P$ 點到 $x$ 軸與 $y$ 軸的距離。`);
        answers.push(
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
        answers.push(
          `到 $y$ 軸距離是 $|x|=${dx}$，到 $x$ 軸距離是 $|y|=${dy}$。再依第${qLabel}象限判斷正負，可得 $A${point}$。`
        );
        continue;
      }

      questions.push(
        `若點 $P$ 位於第${qLabel}象限，且 $P$ 點到 $x$ 軸距離為 ${dy}，到 $y$ 軸距離為 ${dx}，求 $P$ 的座標。`
      );
      answers.push(`到兩軸的距離先告訴我們 $|x|=${dx}$、$|y|=${dy}$，再依第${qLabel}象限判斷正負，所以 $P${point}$。`);
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ221QuadrantBasicSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(pts.map((p) => `${p.name} 在 ${quadrantName(p.x, p.y)}`).join('，') + '。');
        continue;
      }

      if (variant === 1) {
        const s = [2, 3, 4, 5][randInt(0, 3)];
        const t = [2, 3, 4, 5][randInt(0, 3)];
        questions.push(
          `若 $s>0,t<0$，則點 $A\\left(\\frac{s}{t},-\\frac{t}{s}\\right)$ 與 $B(-t^2,st)$ 分別位於第幾象限？`
        );
        answers.push(
          `因為 $s>0,t<0$，所以 $\\frac{s}{t}<0$、$-\\frac{t}{s}>0$，故點 $A$ 在第二象限；又 $-t^2<0$、$st<0$，所以點 $B$ 在第三象限。`
        );
        continue;
      }

      questions.push(`已知點 $P(ab,a-b)$ 在第二象限，判斷 $a\\cdot b$ 為正數或負數。`);
      answers.push(
        `點 $P(ab,a-b)$ 在第二象限，表示第一個坐標 $ab<0$、第二個坐標 $a-b>0$。題目只問 $a\\cdot b$ 的正負，所以可直接判斷 $a\\cdot b$ 為負數。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ221TranslationSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const x = randInt(-6, 6);
        const y = randInt(-6, 6);
        const right = randInt(2, 6);
        const up = randInt(2, 5);
        questions.push(`若從點 $A(${x},${y})$ 出發，先向右移 ${right} 單位，再向上移 ${up} 單位，求終點座標。`);
        answers.push(
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
        answers.push(
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
      answers.push(
        `設點 $E$ 為 $(x,y)$。右移 ${right} 單位後 $x$ 變成 ${endX}$，所以原本 $x=${endX}-${right}=${startX}$；下移 ${down} 單位後 $y$ 變成 ${endY}$，所以原本 $y=${endY}+${down}=${startY}$。故點 $E$ 為 $(${startX},${startY})$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ221AxisSpecialSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(
          `在 $${askXAxis ? 'x' : 'y'}$ 軸上的點需滿足 ${askXAxis ? '$y=0$' : '$x=0$'}，所以答案是 ${target.join('、')}。`
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { xCoef: 2, xConst: -3, yCoef: 3, yConst: 2 },
          { xCoef: 3, xConst: -6, yCoef: 2, yConst: 4 },
          { xCoef: 4, xConst: -10, yCoef: 5, yConst: 5 },
          { xCoef: 5, xConst: -15, yCoef: 3, yConst: 6 },
          { xCoef: 6, xConst: -9, yCoef: 4, yConst: 8 },
          { xCoef: 7, xConst: -14, yCoef: 5, yConst: 10 },
        ];
        const pick = templates[cycle % templates.length];
        const k1 = makeFraction(-pick.xConst, pick.xCoef);
        const k2 = makeFraction(-pick.yConst, pick.yCoef);
        questions.push(
          `已知 $A(${pick.xCoef}k${pick.xConst >= 0 ? '+' : ''}${pick.xConst},${pick.yCoef}k${pick.yConst >= 0 ? '+' : ''}${pick.yConst})$ 不屬於任何象限，求 $k$ 的可能值。`
        );
        answers.push(
          `不屬於任何象限表示點在坐標軸上，所以要嘛 ${pick.xCoef}k${pick.xConst >= 0 ? '+' : ''}${pick.xConst}=0，要嘛 ${pick.yCoef}k${pick.yConst >= 0 ? '+' : ''}${pick.yConst}=0。解得 $k=${fractionToLatex(k1, true)}$ 或 $k=${fractionToLatex(k2, true)}$。`
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
      answers.push(
        `位在 $x$ 軸上的點需滿足 $y=0$，所以 $${mCoef}m${yConst >= 0 ? '+' : ''}${yConst}=0$，解得 $m=${k}$。代回後 $y=0$，因此 $A(${xConst},0)$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ221MidpointSet(count) {
    const questions = [];
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
        answers.push(
          `中點公式是 $M\\left(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2}\\right)$，所以 $M=\\left(\\frac{${x1}+${x2}}{2},\\frac{${y1}+${y2}}{2}\\right)=(${mx},${my})$。`
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
        answers.push(
          `因為中點滿足 $\\frac{${ax}+x_B}{2}=${mx}$、$\\frac{${ay}+y_B}{2}=${my}$，所以 $x_B=2\\times ${mx}-${ax}=${bx}$，$y_B=2\\times ${my}-${ay}=${by}$。故 $B(${bx},${by})$。`
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
      answers.push(
        `圓心是直徑中點，所以 $\\left(\\frac{${ax}+x_B}{2},\\frac{${ay}+y_B}{2}\\right)=(${cx},${cy})$。解得 $x_B=2\\times(${cx})-(${ax})=${bx}$，$y_B=2\\times(${cy})-(${ay})=${by}$，所以 $B(${bx},${by})$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ221SymmetrySet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const x = randInt(-8, 8) || 3;
      const y = randInt(-8, 8) || -4;

      if (variant === 0) {
        questions.push(`求點 $A(${x},${y})$ 關於 $x$ 軸的對稱點座標。`);
        answers.push(`關於 $x$ 軸對稱時，$x$ 坐標不變，$y$ 坐標變號，所以對稱點是 $(${x},${-y})$。`);
        continue;
      }

      if (variant === 1) {
        questions.push(`求點 $B(${x},${y})$ 關於 $y$ 軸的對稱點座標。`);
        answers.push(`關於 $y$ 軸對稱時，$y$ 坐標不變，$x$ 坐標變號，所以對稱點是 $(${-x},${y})$。`);
        continue;
      }

      questions.push(`求點 $C(${x},${y})$ 關於原點的對稱點座標。`);
      answers.push(`關於原點對稱時，$x$、$y$ 都變號，所以對稱點是 $(${-x},${-y})$。`);
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ221AreaSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(
          `因為 $A、B$ 在同一條水平線上，所以可把 $\\overline{AB}$ 當底，底長是 ${bx}-${ax}=${base}，高是 ${cy}-${yBase}=${height}。面積為 $\\frac{1}{2}\\times ${base}\\times ${height}=${area}$。`
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
        answers.push(
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
      answers.push(
        `點 $A、B$ 在 $x$ 軸上，所以可把 $\\overline{AB}$ 當底，底長是 $${bx}-(${ax})=${width}$；點 $C$ 到 $x$ 軸的高是 ${y}。因此面積為 $\\frac{1}{2}\\times ${width}\\times ${y}=${area}$，和 $a$ 的值無關。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ221QuadrantReasoningSet(count) {
    const questions = [];
    const answers = [];

    function qName(id) {
      return ['第一象限', '第二象限', '第三象限', '第四象限'][id - 1];
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const q = randInt(1, 4);
        const result = q === 1 ? 1 : q === 2 ? 4 : q === 3 ? 1 : 4;
        questions.push(`若點 $P(a,b)$ 在${qName(q)}，則點 $Q(a^2,ab)$ 在第幾象限？`);
        answers.push(
          `因為 $a^2>0$，所以 $Q$ 的 $x$ 坐標一定為正。又在${qName(q)}時，$ab$ ${q === 1 || q === 3 ? '為正' : '為負'}，所以 $Q(a^2,ab)$ 在${qName(result)}。`
        );
        continue;
      }

      if (variant === 1) {
        const conds = [
          { ab: '<0', sum: '>0' },
          { ab: '<0', sum: '<0' },
          { ab: '>0', sum: '>0' },
          { ab: '>0', sum: '<0' },
        ];
        const pick = conds[cycle % conds.length];
        questions.push(`已知 $ab${pick.ab}$ 且 $a+b${pick.sum}$，判斷點 $A(a,b^2)$ 位於第幾象限。`);
        if (pick.ab === '<0') {
          answers.push(
            `由 $ab<0$ 可知 $a、b$ 異號，因此 $a$ 可能為正也可能為負；而 $b^2>0$ 一定為正，所以點 $A(a,b^2)$ 可能在第一象限或第二象限。`
          );
        } else if (pick.sum === '>0') {
          answers.push(`由 $ab>0$ 且 $a+b>0$ 可知 $a,b$ 同為正數，所以 $a>0$、$b^2>0$，點 $A(a,b^2)$ 在第一象限。`);
        } else {
          answers.push(`由 $ab>0$ 且 $a+b<0$ 可知 $a,b$ 同為負數，所以 $a<0$、$b^2>0$，點 $A(a,b^2)$ 在第二象限。`);
        }
        continue;
      }

      const quadrant = randInt(1, 4);
      const result = quadrant === 1 ? 2 : quadrant === 2 ? 3 : quadrant === 3 ? 4 : 1;
      questions.push(`若點 $A(s,t)$ 在${qName(quadrant)}，則點 $B(-t,s)$ 在第幾象限？`);
      answers.push(
        `在${qName(quadrant)}時，$s、t$ 的正負可先判斷出來，再代入 $B(-t,s)$。整理後可知 $B$ 在${qName(result)}。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ221NonnegativeSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const x = randInt(-4, 4);
        const y = randInt(-4, 4);
        const c1 = 3 * x - 7 * y;
        const c2 = 2 * x + y;
        questions.push(`若 $|3x-7y-${c1}|+|2x+y-${c2}|=0$，求數對 $(x,y)$ 所在的象限。`);
        answers.push(
          `因為兩個絕對值和為 0，所以必須同時為 0，可列 $3x-7y=${c1}$、$2x+y=${c2}$。解得 $(x,y)=(${x},${y})$，所以數對在${x > 0 && y > 0 ? '第一象限' : x < 0 && y > 0 ? '第二象限' : x < 0 && y < 0 ? '第三象限' : x > 0 && y < 0 ? '第四象限' : x === 0 && y === 0 ? '原點' : x === 0 ? 'y 軸上' : 'x 軸上'}。`
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { p: 1, q: 2, r: 2, s: -1, t: 6 },
          { p: 1, q: -3, r: 3, s: 2, t: -5 },
          { p: 2, q: -4, r: -1, s: 1, t: 1 },
          { p: 1, q: -1, r: 2, s: 3, t: -8 },
          { p: -1, q: 5, r: 1, s: -2, t: 3 },
          { p: 2, q: 6, r: 1, s: -1, t: -4 },
        ];
        const pick = templates[cycle % templates.length];
        const x = divFraction(makeFraction(-pick.q, 1), makeFraction(pick.p, 1));
        const y = subFraction(mulFraction(makeFraction(pick.r, 1), x), makeFraction(-pick.t, 1));
        const yFinal = divFraction(y, makeFraction(pick.s, 1));
        const xText = fractionToLatex(x, true);
        const yText = fractionToLatex(yFinal, true);
        const term1 = `${formatTerm(pick.p, 'x')}${pick.q >= 0 ? '+' : ''}${pick.q}`;
        const term2 = `${formatTerm(pick.r, 'x')}${pick.s >= 0 ? '+' : ''}${formatTerm(pick.s, 'y')}${pick.t >= 0 ? '+' : ''}${pick.t}`;
        questions.push(`已知 $(${term1})^2+(${term2})^2=0$，求點 $(x,y)$ 的座標。`);
        answers.push(
          `平方和為 0，表示兩項都要是 0，所以可列 ${term1}=0、${term2}=0。先由第一式得 $x=${xText}$，再代入第二式得 $y=${yText}$，所以點為 $(${xText},${yText})$。`
        );
        continue;
      }

      const templates = [
        { c1: 10, c2: 2, p: 2, q: 1, r: 1, s: -1 },
        { c1: -3, c2: 4, p: 1, q: -2, r: 2, s: 1 },
        { c1: 8, c2: -1, p: 3, q: -1, r: 1, s: 1 },
        { c1: 6, c2: 5, p: 2, q: 3, r: 1, s: -2 },
        { c1: -4, c2: 1, p: 1, q: 1, r: 2, s: -3 },
        { c1: 12, c2: -2, p: 4, q: -1, r: 1, s: 2 },
      ];
      const pick = templates[cycle % templates.length];
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
      answers.push(
        `由非負性質可知 ${eq1}=0 且 ${eq2}=0。解此聯立方程式可得 $a=${fractionToLatex(aVal, true)},\\ b=${fractionToLatex(bVal, true)}$。點 $P(a,b)$ 到 $x$ 軸的距離是 $|b|=${fractionToLatex(axisDist, true)}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const a = [2, 3, 4, 5][randInt(0, 3)];
        const b = [1, 2, 3, 4][randInt(0, 3)];
        const y0 = randInt(-4, 4);
        const m = randInt(-5, 5);
        const c = a * m + b * y0;
        questions.push(`若點 $(m,${y0})$ 在直線 $${formatAxByEq(a, b, c)}$ 上，求 $m$ 的值。`);
        answers.push(
          `點在直線上，表示把坐標代入方程式後等號一定成立，所以可列 $${a}m${b * y0 >= 0 ? '+' : ''}${b * y0}=${c}$。整理可得 $m=${m}$。`
        );
        continue;
      }

      if (variant === 1) {
        const p = [2, 3, 4][randInt(0, 2)];
        const q = [-5, -4, -3][randInt(0, 2)];
        const aValue = [1, 2, 3, 4][randInt(0, 3)];
        const r = (p - q) * aValue;
        questions.push(`若點 $(${p}a,${q}a+${r})$ 在直線 $x=y$ 上，求 $a$ 的值。`);
        answers.push(
          `在直線 $x=y$ 上，表示橫坐標與縱坐標相等，所以可列 $${p}a=${q}a+${r}$。移項得 $${p - q}a=${r}$，所以 $a=${aValue}$。`
        );
        continue;
      }

      const a = [1, 2, 3, 4][randInt(0, 3)];
      const b = [1, 2, 3, 5][randInt(0, 3)];
      const c0 = randInt(-8, 8);
      const k = c0;
      questions.push(`若方程式 $${formatTwoVarExpr(a, -b, c0)}-k=0$ 的圖形通過原點 $(0,0)$，求 $k$ 的值。`);
      answers.push(`圖形通過原點表示把 $(0,0)$ 代入後要成立，所以原式變成 $${c0}-k=0$，因此 $k=${k}$。`);
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ222InterceptAreaSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const templates = [
          { xInt: 2, yInt: 3 },
          { xInt: 3, yInt: 4 },
          { xInt: 4, yInt: 5 },
          { xInt: 5, yInt: 6 },
          { xInt: 6, yInt: 4 },
          { xInt: 8, yInt: 3 },
          { xInt: 9, yInt: 2 },
          { xInt: 10, yInt: 3 },
          { xInt: 12, yInt: 2 },
          { xInt: 7, yInt: 4 },
        ];
        const pick = templates[cycle % templates.length];
        const xInt = pick.xInt;
        const yInt = pick.yInt;
        const a = yInt;
        const b = xInt;
        const c = xInt * yInt;
        const area = (xInt * yInt) / 2;
        questions.push(`求直線 $${formatAxByEq(a, b, c)}$ 與兩坐標軸的交點座標，並求其圍成的三角形面積。`);
        answers.push(
          `令 $y=0$，得 $${a}x=${c}$，所以與 $x$ 軸交於 $(${xInt},0)$；令 $x=0$，得 $${b}y=${c}$，所以與 $y$ 軸交於 $(0,${yInt})$。因此與坐標軸圍成的三角形面積為 $\\frac{1}{2}\\times ${xInt}\\times ${yInt}=${area}$。`
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { a: 3, b: 2 },
          { a: 4, b: 3 },
          { a: 5, b: 4 },
          { a: 6, b: 2 },
          { a: 8, b: 3 },
          { a: 9, b: 4 },
          { a: 10, b: 5 },
          { a: 12, b: 3 },
          { a: 14, b: 2 },
          { a: 15, b: 4 },
        ];
        const pick = templates[cycle % templates.length];
        const a = pick.a;
        const b = pick.b;
        const area = (a * b) / 2;
        questions.push(
          `若直線 $\\frac{x}{a}+\\frac{y}{${b}}=1$ 的圖形與兩軸所圍成的三角形面積為 ${area}，且直線不通過第四象限，求 $a$ 的值。`
        );
        answers.push(
          `這條直線的截距是 $(a,0)$ 與 $(0,${b})$，所以三角形面積是 $\\frac{1}{2}\\times |a|\\times ${b}=${area}$，可得 $|a|=${a}$。又題目說不通過第四象限，表示 $x$ 截距要為正，因此 $a=${a}$。`
        );
        continue;
      }

      const templates = [
        { m: 1, b: 3 },
        { m: 1, b: 4 },
        { m: 1, b: 5 },
        { m: 2, b: 4 },
        { m: 2, b: 6 },
        { m: 3, b: 6 },
        { m: 2, b: 8 },
        { m: 3, b: 9 },
        { m: 4, b: 8 },
        { m: 5, b: 10 },
      ];
      const pick = templates[cycle % templates.length];
      const m = pick.m;
      const b = pick.b;
      const xInt = b / m;
      const area = (xInt * b) / 2;
      questions.push(`方程式 $y=-${m}x+${b}$ 與兩軸交於 $P,Q$ 兩點，求 $\\triangle POQ$（$O$ 為原點）的面積。`);
      answers.push(
        `令 $x=0$，得 $y=${b}$，所以一個截距點是 $(0,${b})$；令 $y=0$，得 $x=${xInt}$，另一個截距點是 $(${xInt},0)$。因此 $\\triangle POQ$ 的面積為 $\\frac{1}{2}\\times ${xInt}\\times ${b}=${area}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ222QuadrantExclusionSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        questions.push(`已知 $a<0$，則一次函數 $f(x)=ax+5$ 的圖形不通過第幾象限？`);
        answers.push(
          `因為斜率 $a<0$，圖形往右下降，且截距是 5，所以直線會經過第一、第二、第四象限，不會通過第三象限。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(`若 $ab>0$ 且 $a+b<0$，則直線 $ax+by+1=0$ 不通過第幾象限？`);
        answers.push(
          `由 $ab>0$ 且 $a+b<0$ 可知 $a,b$ 都是負數。把式子改寫成 $y=-\\frac{a}{b}x-\\frac{1}{b}$，可知斜率為負、截距為正，因此圖形經過第一、第二、第四象限，不通過第三象限。`
        );
        continue;
      }

      questions.push(`方程式 $y=ax+b$ 的圖形通過第一、三、四象限，則方程式 $y=ax-b$ 不通過第幾象限？`);
      answers.push(
        `原直線通過第一、三、四象限，表示斜率 $a>0$ 且截距 $b<0$。因此 $y=ax-b$ 其實是正斜率、正截距的直線，會經過第一、第二、第三象限，不通過第四象限。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ222ParallelPerpendicularSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const x0 = randInt(-6, 6);
        const y0 = randInt(-6, 6);
        questions.push(`寫出通過點 $(${x0},${y0})$ 且平行 $y$ 軸的直線方程式。`);
        answers.push(`平行 $y$ 軸的直線是鉛直線，所有點的 $x$ 坐標都相同，所以方程式是 $x=${x0}$。`);
        continue;
      }

      if (variant === 1) {
        const x1 = randInt(-6, 0);
        const x2 = randInt(1, 8);
        const y = randInt(-5, 5);
        questions.push(`直線通過點 $(${x1},${y})$ 與 $(${x2},${y})$ 兩點，求此直線方程式。`);
        answers.push(`兩點的 $y$ 坐標相同，表示這是一條水平線，所以方程式是 $y=${y}$。`);
        continue;
      }

      if (variant === 2) {
        const x = randInt(-6, 6);
        const y = makeFraction(randInt(-7, 7), 2);
        questions.push(`通過點 $(${x},${fractionToLatex(y)})$ 且垂直 $y$ 軸的直線方程式為何？`);
        answers.push(`垂直 $y$ 軸就是平行 $x$ 軸，這是一條水平線，所以方程式是 $y=${fractionToLatex(y)}$。`);
        continue;
      }

      const x = randInt(-5, 5);
      const y1 = randInt(-6, 0);
      const y2 = randInt(1, 7);
      questions.push(`直線通過點 $(${x},${y1})$ 與 $(${x},${y2})$ 兩點，求此直線方程式。`);
      answers.push(`兩點的 $x$ 坐標相同，表示這是一條鉛直線，所以方程式是 $x=${x}$。`);
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ222LineFromPointsSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(
          `把兩點代入 $y=ax+b$，可列聯立方程式 $${formatSystemLatex(`${x1}a+b=${y1}`, `${x2}a+b=${y2}`)}$。相減可得 $a=${m}$，再代回得 $b=${b}$，所以直線方程式是 $${formatLineSlopeIntercept(m, b)}$。`
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
        answers.push(
          `把兩點代入 $ax+by=3$，可列聯立方程式 $${formatSystemLatex(`${p1.x}a${p1.y >= 0 ? '+' : ''}${p1.y}b=3`, `${p2.x}a${p2.y >= 0 ? '+' : ''}${p2.y}b=3`)}$。解得 $a=${a},\\ b=${b}$，所以直線方程式是 $${formatAxByEq(a, b, 3)}$。`
        );
        continue;
      }

      const x1 = randInt(-4, 2);
      const y1 = randInt(-6, 4);
      const x2 = x1 + randInt(2, 5);
      const y2 = y1 + pickNonZero(-5, 5);
      const line = lineThroughPointsStd(x1, y1, x2, y2);
      questions.push(`求通過點 $(${x1},${y1})$ 與 $(${x2},${y2})$ 兩點的直線方程式。`);
      answers.push(
        `設直線為一般式。由兩點可先求方向，再整理成標準型。計算可得這條直線的方程式是 $${formatAxByEq(line.a, line.b, line.c)}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ222TwoQuadrantsSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const p = [4, 5, 6, 7][randInt(0, 3)];
        const q = [8, 9, 10, 11][randInt(0, 3)];
        questions.push(`已知線型函數 $f(x)=ax+${p}-${q}x+a$ 的圖形只通過兩個象限，求 $a$ 的值。`);
        answers.push(
          `先化簡為 $y=(a-${q})x+(a+${p})$。若這是一條斜直線且只通過兩個象限，就必須通過原點，所以截距要是 0，可得 $a+${p}=0$，所以 $a=-${p}$。此外，若斜率為 0，就會變成水平線，也只會通過上方或下方兩個象限，因此還有 $a-${q}=0$，得 $a=${q}$。所以 $a$ 的值有 $-${p}$ 或 $${q}$。`
        );
        continue;
      }

      if (variant === 1) {
        const x = [1, 2, 3][randInt(0, 2)];
        const m = [1, 2, 3][randInt(0, 2)];
        const y = m * x;
        questions.push(`若直線 $L$ 只通過第一、三象限且經過點 $(${x},${y})$，求其方程式。`);
        answers.push(
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
        questions.push(`若直線 $L$ 只通過第二、四象限且經過點 $(${x},${y})$，求其方程式。`);
        answers.push(
          `只通過第二、四象限的直線必須通過原點，且斜率為負。由點 $(${x},${y})$ 與原點可求斜率為 $\\frac{${y}}{${x}}=-\\frac{${rise}}{${run}}$，所以方程式可寫成 $y=-\\frac{${rise}}{${run}}x$，也可整理成 $${rise}x+${run}y=0$。`
        );
        continue;
      }

      questions.push(`若直線 $L$ 只通過第一、二象限且經過點 $(-3,7)$，求其方程式。`);
      answers.push(
        `只通過第一、二象限表示這條直線必須是位於 $x$ 軸上方的水平線，所以 $y$ 坐標固定。又因為通過點 $(-3,7)$，所以方程式是 $y=7$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ222TranslationLineSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(
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
        answers.push(
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
      answers.push(
        `設原點是 $(x,y)$。向右移 ${right} 單位後，左式會多出 ${a}×${right}=${a * right}；若再向下移 $t$ 單位，因為 $y$ 減少 $t$，左式會少掉 $${b}t$。要讓方程式仍成立，就要 $${a * right}-${b}t=0$，因此 $t=${down}$。所以要向下移 ${down} 單位。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ222TwoLinesAreaSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const templates = [
          { a: 1, d: 2 },
          { a: 1, d: 3 },
          { a: 2, d: 2 },
          { a: 2, d: 3 },
          { a: 3, d: 2 },
          { a: 3, d: 3 },
          { a: 4, d: 2 },
          { a: 4, d: 3 },
          { a: 5, d: 2 },
          { a: 2, d: 4 },
        ];
        const pick = templates[cycle % templates.length];
        const a = pick.a;
        const d = pick.d;
        const c = a * d;
        const area = d * c;
        questions.push(`求兩直線 $${formatAxByEq(a, 1, c)}$ 與 $${formatAxByEq(a, -1, -c)}$ 和 $x$ 軸所圍成區域面積。`);
        answers.push(
          `兩直線交點在 $(0,${c})$；與 $x$ 軸交點分別為 $(${d},0)$、$(-${d},0)$。因此底長是 ${2 * d}，高是 ${c}，面積為 $\\frac{1}{2}\\times ${2 * d}\\times ${c}=${area}$。`
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { px: 2, py: 2, up: 3, down: 2 },
          { px: 3, py: 4, up: 4, down: 3 },
          { px: 4, py: 6, up: 5, down: 4 },
          { px: 3, py: 2, up: 5, down: 2 },
          { px: 2, py: 4, up: 4, down: 2 },
          { px: 4, py: 2, up: 6, down: 3 },
          { px: 5, py: 4, up: 3, down: 2 },
          { px: 3, py: 6, up: 4, down: 4 },
        ];
        const pick = templates[cycle % templates.length];
        const px = pick.px;
        const py = pick.py;
        const y1 = py + pick.up;
        const y2 = py - pick.down;
        const l1 = lineThroughPointsStd(0, y1, px, py);
        const l2 = lineThroughPointsStd(0, y2, px, py);
        const area = (px * (y1 - y2)) / 2;
        questions.push(
          `求兩直線 $${formatAxByEq(l1.a, l1.b, l1.c)}$ 與 $${formatAxByEq(l2.a, l2.b, l2.c)}$ 和 $y$ 軸所圍成區域面積。`
        );
        answers.push(
          `兩直線交點是 $(${px},${py})$，與 $y$ 軸交點分別是 $(0,${y1})$、$(0,${y2})$。因此底長是 ${y1 - y2}，高是 ${px}，面積為 $\\frac{1}{2}\\times ${y1 - y2}\\times ${px}=${area}$。`
        );
        continue;
      }

      const templates = [
        { px: 1, py: 3, left: 2, right: 3 },
        { px: 2, py: 4, left: 3, right: 2 },
        { px: 3, py: 6, left: 4, right: 3 },
        { px: 2, py: 3, left: 2, right: 4 },
        { px: 1, py: 4, left: 3, right: 4 },
        { px: 3, py: 4, left: 3, right: 3 },
        { px: 2, py: 6, left: 4, right: 2 },
        { px: 4, py: 3, left: 2, right: 5 },
      ];
      const pick = templates[cycle % templates.length];
      const px = pick.px;
      const py = pick.py;
      const x1 = px - pick.left;
      const x2 = px + pick.right;
      const l1 = lineThroughPointsStd(px, py, x1, 0);
      const l2 = lineThroughPointsStd(px, py, x2, 0);
      const area = ((x2 - x1) * py) / 2;
      questions.push(
        `已知 $L_1:${formatAxByEq(l1.a, l1.b, l1.c)}$ 與 $L_2:${formatAxByEq(l2.a, l2.b, l2.c)}$ 交於點 $A$，且分別交 $x$ 軸於 $B,C$，求 $\\triangle ABC$ 面積。`
      );
      answers.push(
        `由題意可知交點 $A=(${px},${py})$，而 $B,C$ 在 $x$ 軸上，座標分別是 $(${x1},0)$、$(${x2},0)$。因此 $\\overline{BC}$ 長為 ${x2 - x1}$，高為 ${py}$，所以 $\\triangle ABC$ 面積為 $\\frac{1}{2}\\times ${x2 - x1}\\times ${py}=${area}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const count100 = randInt(3, 12);
        const count10 = randInt(4, 15);
        questions.push(`錢包內有 $x$ 張佰元鈔票與 $y$ 個拾元硬幣，總共有多少元？請用 $x,y$ 列出代數式。`);
        answers.push(`一張佰元鈔票是 100 元，一個拾元硬幣是 10 元，所以總金額可記成 $100x+10y$。`);
        continue;
      }

      if (variant === 1) {
        const full = randInt(120, 260);
        const half = randInt(60, 140);
        questions.push(
          `阿里山全票一張 ${full} 元、半票一張 ${half} 元，若買了 $x$ 張全票與 $y$ 張半票，共需多少錢？請用 $x,y$ 列出代數式。`
        );
        answers.push(`全票總價是 $${full}x$，半票總價是 $${half}y$，所以總金額可記成 $${full}x+${half}y$。`);
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
        answers.push(
          `${itemA}總價是 $${onePrice}x$，${itemB}總價是 $${anotherPrice}y$，所以總金額可記成 $${onePrice}x+${anotherPrice}y$。`
        );
        continue;
      }

      if (variant === 3) {
        const tens = randInt(1, 8);
        const ones = randInt(1, 9);
        questions.push(`若一個兩位數的十位數字是 $x$、個位數字是 $y$，請用 $x,y$ 列出這個兩位數的代數式。`);
        answers.push(`十位數字代表 $10x$，個位數字代表 $y$，所以這個兩位數可記成 $10x+y$。`);
        continue;
      }

      const fixedFee = randInt(2, 8) * 10;
      const rose = randInt(20, 50);
      const lily = randInt(40, 80);
      questions.push(
        `花店包裝一束花，玫瑰每枝 ${rose} 元、百合每枝 ${lily} 元，另加包裝費 ${fixedFee} 元。若用了 $x$ 枝玫瑰與 $y$ 枝百合，總價應記成什麼代數式？`
      );
      answers.push(
        `玫瑰總價是 $${rose}x$，百合總價是 $${lily}y$，再加上包裝費 ${fixedFee} 元，所以總價可記成 $${rose}x+${lily}y+${fixedFee}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ2ClassifySet(count) {
    const questions = [];
    const answers = [];
    const parameterNames = ['a', 'b', 'm', 'n'];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const expr = formatTwoVarExpr(pickNonZero(-8, 8), pickNonZero(-8, 8), randInt(-9, 9));
        questions.push(`判斷：$${expr}$ 是二元一次式、二元一次方程式，還是都不是？`);
        answers.push(`$${expr}$ 沒有等號，且只含 $x,y$ 的一次項，所以它是二元一次式。`);
        continue;
      }

      if (variant === 1) {
        const expr = formatTwoVarExpr(pickNonZero(-8, 8), pickNonZero(-8, 8), 0);
        const rhs = randInt(-12, 12);
        questions.push(`判斷：$${expr}=${rhs}$ 是二元一次式、二元一次方程式，還是都不是？`);
        answers.push(`$${expr}=${rhs}$ 有等號，而且 $x,y$ 都只出現一次，所以它是二元一次方程式。`);
        continue;
      }

      if (variant === 2) {
        const expr = `${pickNonZero(1, 6)}x^2${pickNonZero(-6, 6) >= 0 ? '+' : ''}${pickNonZero(-6, 6)}y`;
        questions.push(`判斷：$${expr}$ 是二元一次式、二元一次方程式，還是都不是？`);
        answers.push(`它含有 $x^2$，已經不是一次，所以不屬於二元一次式，也不是二元一次方程式。`);
        continue;
      }

      if (variant === 3) {
        const expr = `${pickNonZero(1, 5)}xy${pickNonZero(-6, 6) >= 0 ? '+' : ''}${pickNonZero(-6, 6)}x${pickNonZero(-9, 9) >= 0 ? '+' : ''}${randInt(-9, 9)}`;
        questions.push(`判斷：$${expr}$ 是二元一次式、二元一次方程式，還是都不是？`);
        answers.push(`它含有 $xy$，出現兩個未知數相乘，所以不是二元一次式，也不是二元一次方程式。`);
        continue;
      }

      const name = parameterNames[i % parameterNames.length];
      const expr = `${pickNonZero(1, 6)}x+${name}`;
      questions.push(`判斷：$${expr}$ 是二元一次式、二元一次方程式，還是都不是？`);
      answers.push(`它只有一個未知數 $x$，${name} 在這裡是參數，不是第二個未知數，所以不算二元一次式。`);
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ2ExpressionSimplifySet(count) {
    const questions = [];
    const answers = [];

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
      answers.push(`把 $x$ 項、$y$ 項與常數項分別合併，可得 $${formatTwoVarExpr(xCoef, yCoef, constant)}$。`);
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ2DistributeExpandSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(`利用分配律把 ${k} 乘進去，得 $${result}$。`);
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
        answers.push(`括號前是負數，分配後每一項都要變號，所以 $${k}(${inside})=${result}$。`);
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
      questions.push(`化簡：$${first}${expandedSecond.startsWith('-') ? '' : '+'}${second}$。`);
      answers.push(
        `先分別展開兩個括號：$${first}+${second}=${expandedFirst}${expandedSecond.startsWith('-') ? '' : '+'}${expandedSecond}$，再合併同類項得 $${result}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ2EvaluateExpressionSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const xValue = randInt(-5, 5);
      const yValue = randInt(-5, 5);
      const a = pickNonZero(-9, 9);
      const b = pickNonZero(-9, 9);
      const c = randInt(-9, 9);
      const expr = formatTwoVarExpr(a, b, c);
      const result = a * xValue + b * yValue + c;
      questions.push(`當 $x=${xValue},\\ y=${yValue}$ 時，求 $${expr}$ 的值。`);
      answers.push(
        `把 $x=${xValue},\\ y=${yValue}$ 代入，可得 $${a}\\times(${xValue})${b >= 0 ? '+' : ''}${b}\\times(${yValue})${c >= 0 ? '+' : ''}${c}=${result}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ2FractionSimplifySet(count) {
    const questions = [];
    const answers = [];
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
      answers.push(
        `先通分成分母都是 $${l}$：$${left}${usePlus ? '+' : '-'}${right}=\\frac{${formatTwoVarExpr(a1 * (l / d1), b1 * (l / d1), c1 * (l / d1))}}{${l}}${usePlus ? '+' : '-'}\\frac{${formatTwoVarExpr(a2 * (l / d2), b2 * (l / d2), c2 * (l / d2))}}{${l}}$。合併分子後得 $${result}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ2OrderedPairCheckSet(count) {
    const questions = [];
    const answers = [];

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
      answers.push(
        `把 $(x,y)=(${xValue},${yValue})$ 代入左邊，可得 $${ax}\\times(${xValue})${by >= 0 ? '+' : ''}${by}\\times(${yValue})=${leftValue}$。${leftValue === rhs ? `因為左右兩邊都等於 ${rhs}，所以這組數對是解。` : `因為左邊等於 ${leftValue}，右邊是 ${rhs}，兩邊不相等，所以這組數對不是解。`}`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ2ParameterSubstitutionSet(count) {
    const questions = [];
    const answers = [];
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
      answers.push(
        `把 $(x,y)=(${xValue},${yValue})$ 代入，可得 $${fixedCoef === 1 ? '' : fixedCoef === -1 ? '-' : fixedCoef}${xValue}${constant >= 0 ? '+' : ''}${constant}+${name}(${yValue})=${rhs}$。整理後得到 $${yValue}${name}=${rhs - fixedCoef * xValue - constant}$，所以 ${name}=$${paramValue}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ2EquivalentTransformSet(count) {
    const questions = [];
    const answers = [];

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
      answers.push(
        `先把含 $x,y$ 的項移到左邊，常數移到右邊：$${left}=${right}\\Rightarrow ${formatTwoVarExpr(finalAx, finalBy)}=${finalC}$。所以標準型是 $${formatTwoVarExpr(finalAx, finalBy)}=${finalC}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ2IntegerConstraintSet(count) {
    const questions = [];
    const answers = [];
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
      const total = randInt(3, 7) * a * b;
      const pairs = [];
      for (let x = 0; x <= total; x += 1) {
        const remain = total - a * x;
        if (remain < 0) break;
        if (remain % b === 0) pairs.push([x, remain / b]);
      }
      if (pairs.length < 3 || pairs.length > 6) continue;
      questions.push(`求方程式 $${a}x+${b}y=${total}$ 的所有非負整數解。`);
      const pairText = pairs.map(([x, y]) => `(${x},${y})`).join('、');
      answers.push(
        `由 $${a}x+${b}y=${total}$ 可知 $y=\\frac{${total}-${a}x}{${b}}$。逐一檢查非負整數條件後，可得所有非負整數解為 $${pairText}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ2SolveForVariableSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-6, 6);
      const b = pickNonZero(-6, 6);
      const c = pickNonZero(-12, 12);
      const equation = `${formatTwoVarExpr(a, b)}=${c}`;
      const xNumerator = `${c}${b > 0 ? '-' : '+'}${Math.abs(b)}y`;
      const yNumerator = `${c}${a > 0 ? '-' : '+'}${Math.abs(a)}x`;
      questions.push(`將方程式 $${equation}$ 分別整理成 $x=\\cdots$ 與 $y=\\cdots$。`);
      answers.push(
        `先整理成 $x$ 用 $y$ 表示：$${a}x=${c}${b > 0 ? '-' : '+'}${Math.abs(b)}y$，所以 $x=\\frac{${xNumerator}}{${a}}$。再整理成 $y$ 用 $x$ 表示：$${b}y=${c}${a > 0 ? '-' : '+'}${Math.abs(a)}x$，所以 $y=\\frac{${yNumerator}}{${b}}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function formatSystemLatex(eq1, eq2) {
    return String.raw`\left\{\begin{array}{l}${eq1}\\${eq2}\end{array}\right.`;
  }

  function buildJ212SubstitutionBasicSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(
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
        answers.push(
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
      answers.push(
        `先由第一式整理得 $y=${a1}x-${c1}$，代入第二式：$${a2}x+${b2}(${a1}x-${c1})=${c2}$。解得 $x=${xValue}$，再代回得 $y=${yValue}$，所以 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ212EliminationAdjustmentSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(
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
        answers.push(
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
      answers.push(
        `先把兩式調整成 $x$ 的係數同為 ${l}$：第一式乘 ${m1}，第二式乘 ${m2}$。整理後再相減，可得到 $y=${yValue}$，再代回得 $x=${xValue}$，因此 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ212FractionDecimalSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(
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
        answers.push(
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
      answers.push(
        `先把第一式乘 2、第二式乘 3，得 $x+y=${2 * a}$、$x-y=${3 * b}$。兩式相加可得 $2x=${2 * a + 3 * b}$，所以 $x=${xValue}$；再代回得 $y=${yValue}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ212SolutionTypeSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const a = pickNonZero(1, 7);
        const b = pickNonZero(1, 7);
        const c = pickNonZero(2, 20);
        const eq1 = `${a}x+${b}y=${c}`;
        const eq2 = `${2 * a}x+${2 * b}y=${2 * c}`;
        questions.push(`判斷聯立方程式 $${formatSystemLatex(eq1, eq2)}$ 的解的情形。`);
        answers.push(
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
        answers.push(`因為左邊完全相同，但右邊常數不同，所以兩條直線平行而不重合，因此無解。`);
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
        answers.push(
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
        answers.push(
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
      answers.push(
        `若要有無限多組解，三組比值必須都相同。已知 $\\frac{${a}}{${ratioDen * a}}=\\frac{1}{${ratioDen}}$，所以要有 $\\frac{${b}}{k}=\\frac{1}{${ratioDen}}$，解得 $k=${k}$。同時常數比 $\\frac{${c}}{${ratioDen * c}}=\\frac{1}{${ratioDen}}$ 也一致，所以確實是無限多組解。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ212TripleEqualSet(count) {
    const questions = [];
    const answers = [];

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
      answers.push(
        `把三個式子相等拆成兩個方程式：$${expr1}=${target}$ 與 $${expr2}=${target}$，可得聯立方程式 $${formatSystemLatex(sys1, sys2)}$。解得 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ212SymmetricSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(
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
      answers.push(
        `兩式相加得 $(${a + b})x+(${a + b})y=0$，所以 $x+y=0$，即 $y=-x$。代回第一式可得 $x=${xValue},\ y=${yValue}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ212AbsZeroSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(
          `因為兩個絕對值都不會小於 0，而它們的和等於 0，所以兩個絕對值內部都必須等於 0。故可列成聯立方程式 $${formatSystemLatex(`${expr1}=0`, `${expr2}=0`)}$，解得 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      if (variant === 1) {
        questions.push(`若 $(${expr1})^2+(${expr2})^2=0$，求 $(x,y)$。`);
        answers.push(
          `因為平方都不會小於 0，而兩個平方和等於 0，所以每一項平方都必須是 0。故有 $${formatSystemLatex(`${expr1}=0`, `${expr2}=0`)}$，解得 $(x,y)=(${xValue},${yValue})$。`
        );
        continue;
      }

      questions.push(`若 $|${expr1}|+(${expr2})^2=0$，求 $(x,y)$。`);
      answers.push(
        `因為絕對值與平方都不會小於 0，而它們的和等於 0，所以 $|${expr1}|=0$ 且 $(${expr2})^2=0$。因此可列成 $${formatSystemLatex(`${expr1}=0`, `${expr2}=0`)}$，解得 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];

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
        answers.push(
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
        answers.push(
          `把 $x=${xValue},\\ y=${yValue}$ 代入，可得 $(${xValue})a${yValue >= 0 ? '+' : ''}(${yValue})b=${c1}$ 與 $(${xValue})b${-yValue >= 0 ? '+' : ''}(${-yValue})a=${c2}$。解這個關於 $a,b$ 的聯立方程式，可得 $a=${a},\\ b=${b}$，所以 $|a-b|=${Math.abs(a - b)}$。`
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
        answers.push(
          `先解聯立方程式，可得 $(x,y)=(${xValue},${yValue})$。因為題目說 $x=a,\\ y=b$，所以 $a=${xValue},\\ b=${yValue}$，故 $a+b-1=${xValue}+${yValue}-1=${xValue + yValue - 1}$。`
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
      answers.push(
        `把 $x=${xValue},\\ y=${yValue}$ 代入第一式，得 $${xValue}a+3\\times(${yValue})=${rhs1}$，所以 $${xValue}a=${rhs1 - 3 * yValue}$，解得 $a=${a}$。再代入第二式，得 $2\\times(${xValue})+${yValue}b=${rhs2}$，所以 $${yValue}b=${rhs2 - 2 * xValue}$，解得 $b=${b}$。因此 $a-b=${a - b}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ212ErrorDiagnosisSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(
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
      answers.push(
        `因為莉莉只看錯 $b$，所以她的錯解一定滿足第二式：$3\\times(${wrong1.x})+c\\times(${wrong1.y})=${c2}$，可得 $c=${c}$。因為奇奇只看錯 $c$，所以他的錯解一定滿足第一式：$4\\times(${wrong2.x})+b\\times(${wrong2.y})=${c1}$，可得 $b=${b}$。因此原方程式是 $${formatSystemLatex(`4x+${b}y=${c1}`, `3x+${c}y=${c2}`)}$，解得 $(x,y)=(${xValue},${yValue})$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ212SharedSolutionSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(
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
        answers.push(
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
      answers.push(
        `先由第二組純數字的聯立方程式解得 $x=${xValue},\\ y=${yValue}$。再代回第一組 $ax+by=${c1}$、$ax-by=${c2}$，即可解得 $a=${a},\\ b=${b}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ212ThirdConditionSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(
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
        answers.push(
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
        answers.push(
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
      answers.push(
        `由聯立方程式先求得 $(x,y)=(2,1)$，也確實滿足 $x=2y$。把它代入第三條件 $px+qy=${k}$，可得 $2p+q=${k}$。因此答案就是 $${k}$。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ212SpecialReverseSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(
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
        answers.push(
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
        answers.push(
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
      answers.push(
        `若無解，前兩組係數要成比例，但常數比不同。先由 $\\frac{1}{${p}}=\\frac{a}{-${r}}$ 得 $a=${a}$。此時係數比固定是 $\\frac{1}{${p}}$，但常數比是 $\\frac{${q}}{${s}}$，與 $\\frac{1}{${p}}$ 不同，因此確實無解。`
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;

      if (variant === 0) {
        const left = randomMixedFraction(1, 3, [2, 3, 4, 5], false);
        const right = randomProperFraction([2, 3, 4, 5, 6]);
        if (randInt(0, 1) === 0) {
          const ratio = normalizeRatioFromFractions(left, right);
          const common = lcm(left.den, right.den);
          questions.push(`將 $${integerOrFractionLatex(left)}:${fractionToLatex(right)}$ 化為最簡整數比。`);
          answers.push(
            `先把兩項都看成分數，再同乘分母的最小公倍數 ${common}，可得整數比。約分後，最簡整數比為 $${ratio.a}:${ratio.b}$。`
          );
        } else {
          const value = divFraction(left, right);
          questions.push(`求 $${integerOrFractionLatex(left)}:${fractionToLatex(right)}$ 的比值。`);
          answers.push(
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
          answers.push(
            `先把小數化成分數：$${left.text}=${fractionToLatex(left.frac)}$。再同乘分母的最小公倍數 ${common}，約分後得最簡整數比 $${ratio.a}:${ratio.b}$。`
          );
        } else {
          const value = divFraction(left.frac, right);
          questions.push(`求 $${left.text}:${integerOrFractionLatex(right)}$ 的比值。`);
          answers.push(
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
        answers.push(
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
        answers.push(
          `先把時間都化成秒：${minute} 分 ${second} 秒 $=${totalSecond}$ 秒，${otherMinute} 分鐘 $=${otherMinute * 60}$ 秒，所以最簡整數比為 $${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      const left = makeFraction(randInt(3, 9), randInt(2, 6));
      const right = negateFraction(makeFraction(randInt(2, 8), randInt(2, 6)));
      const value = divFraction(left, right);
      questions.push(`求 $${fractionToLatex(left)}:${fractionToLatex(right)}$ 的比值。`);
      answers.push(
        `比值就是前項除以後項，所以 $${fractionToLatex(left)}\\div ${fractionToLatex(right)}=${fractionToLatex(value)}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231ProportionSolveSet(count) {
    const questions = [];
    const answers = [];

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
        answers.push(
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
        answers.push(`比值為 ${c} 表示 $\\dfrac{${a}x+1}{${b}}=${c}$。所以 $${a}x+1=${c * b}$，解得 $x=${x}$。`);
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
        answers.push(
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
        answers.push(
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
      answers.push(
        `由比例式可得 $${ratio.b}(${formatSingleVarExpr(-1, p)})=${ratio.a}(${formatSingleVarExpr(3, -q)})$。整理後解得 $x=${x}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231RelationTransformSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        const p = randInt(3, 8);
        const q = randInt(2, 6);
        const m = randInt(2, 5);
        const n = randInt(2, 5);
        const ratio = normalizeRatioInts(m * q, n * p);
        questions.push(`已知 $${p}x=${q}y$（$x,y\\ne 0$），求 $${m}x:${n}y$。`);
        answers.push(
          `由 $${p}x=${q}y$ 可得 $x:y=${q}:${p}$。因此 $${m}x:${n}y=${m}\\times ${q}:${n}\\times ${p}=${ratio.a}:${ratio.b}$。`
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
        answers.push(
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
        questions.push(`已知 $x:y=${base.a}:${base.b}$，求 $(${a}x+${b}y):(${c}x+${d}y)$。`);
        answers.push(
          `由 $x:y=${base.a}:${base.b}$，可設 $x=${base.a}k,\\ y=${base.b}k$。代入得 $(${a}x+${b}y):(${c}x+${d}y)=(${a * base.a + b * base.b})k:(${c * base.a + d * base.b})k=${result.a}:${result.b}$。`
        );
        continue;
      }

      const base = normalizeRatioInts(randInt(2, 5), randInt(2, 5));
      const numerator = 3 * base.a * base.a + 4 * base.a * base.b;
      const denominator = 2 * base.a * base.b + 5 * base.b * base.b;
      const value = simplifyFraction(numerator, denominator);
      questions.push(`已知 $x:y=${base.a}:${base.b}$，求 $\\dfrac{3x^2+4xy}{2xy+5y^2}$ 的值。`);
      answers.push(
        `由 $x:y=${base.a}:${base.b}$，可設 $x=${base.a}k,\\ y=${base.b}k$。代入後分子為 $(3\\times ${base.a}^2+4\\times ${base.a}\\times ${base.b})k^2=${numerator}k^2$，分母為 $(2\\times ${base.a}\\times ${base.b}+5\\times ${base.b}^2)k^2=${denominator}k^2$，所以值為 $${fractionToLatex(value)}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ231BasicSingleStepSet(count) {
    const questions = [];
    const answers = [];

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
    const answers = [];
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
          `設父子現在分別為 $${pick.m}k,\ ${pick.n}k$ 歲。${pick.years} 年後年齡和為 $(${pick.m}+${pick.n})k+2\\times ${pick.years}=${pick.sum}$，解得 $k=${unit}$。因此父親現在 ${father} 歲，兒子現在 ${son} 歲。`
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
    const answers = [];

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
            `${formatPercentLatexLocal(simplifyFraction(avg.num * 100, avg.den))}\\%`,
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
          `有一杯 ${total} 公克、濃度 ${start}% 的食鹽水，若要把濃度稀釋成 ${target}% ，需要再加入多少公克的水？`
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
            `甲 ${fractionToLatex(concA)}、乙 ${fractionToLatex(concB)}`,
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
    const answers = [];

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
          `${fractionToLatex(addWater)} 公克`,
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
    const answers = [];

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
        questions.push(`已知 $x:y=${m}:${n}$，且 $${xTerm(a)}${b > 0 ? '+' : ''}${yTerm(b)}=${total}$，求 $x,y$。`);
        answers.push(
          `設 $x=${m}k,\\ y=${n}k$。代入 $${xTerm(a)}${b > 0 ? '+' : ''}${yTerm(b)}=${total}$，得 $${kTerm(a * m)}+${kTerm(b * n)}=${total}$，所以 $k=${k}$。因此 $x=${x},\\ y=${y}$。`
        );
        continue;
      }

      if (variant === 1) {
        const m = randInt(2, 6);
        let n = -randInt(2, 5);
        while (Math.abs(m) === Math.abs(n)) n = -randInt(2, 5);
        const ratio = normalizeRatioInts(m + n, m - n);
        questions.push(`已知 $(a+b):(a-b)=${m}:${n}$，求 $a:b$。`);
        answers.push(
          `設 $a+b=${m}k,\\ a-b=${n}k$。兩式相加得 $2a=${m + n}k$，相減得 $2b=${m - n}k$，所以 $a:b=${m + n}:${m - n}=${ratio.a}:${ratio.b}$。`
        );
        continue;
      }

      if (variant === 2) {
        const m = randInt(2, 5);
        const n = randInt(1, 4);
        const ratio = normalizeRatioInts(m * m - n * n, m * m + n * n);
        questions.push(`已知 $x:y=${m}:${n}$，求 $(x^2-y^2):(x^2+y^2)$。`);
        answers.push(
          `設 $x=${m}k,\\ y=${n}k$。則 $(x^2-y^2):(x^2+y^2)=(${m}^2k^2-${n}^2k^2):(${m}^2k^2+${n}^2k^2)=(${m * m - n * n}):(${m * m + n * n})=${ratio.a}:${ratio.b}$。`
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
        questions.push(`已知 $x:y=${m}:${n}$，且 $${xTerm(a)}-${yTerm(b)}=${rhs}$，求 $x,y$。`);
        answers.push(
          `設 $x=${m}k,\\ y=${n}k$。代入 $${xTerm(a)}-${yTerm(b)}=${rhs}$ 得 $${kTerm(a * m)}-${kTerm(b * n)}=${rhs}$，所以 $${kTerm(a * m - b * n)}=${rhs}$，解得 $k=${k}$。因此 $x=${x},\\ y=${y}$。`
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
      answers.push(
        `設 $x+y=${m}k,\\ x-y=${n}k$。兩式相加得 $2x=${m + n}k$，所以 $x=${formatFraction(m + n, 2)}k$；相減得 $2y=${m - n}k$，所以 $y=${formatFraction(m - n, 2)}k$。因此 $(x+2y):(2x-y)=\\left(${formatFraction(m + n, 2)}k+2\\times${formatFraction(m - n, 2)}k\\right):\\left(2\\times${formatFraction(m + n, 2)}k-${formatFraction(m - n, 2)}k\\right)=${3 * m - n}:${m + 3 * n}=${ratio.a}:${ratio.b}$。`
      );
    }

    return finalizeJ231Set(questions, answers);
  }

  function buildJ232BasicDirectInverseSet(count) {
    const questions = [];
    const answers = [];
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ232LinearComboProportionSet(count) {
    const questions = [];
    const answers = [];
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
          `設 $x:y=m:n$，則題目的比可寫成 $(${leftA}m-${formatTerm(leftB, 'n')}):(${rightA}m+${formatTerm(rightB, 'n')})$。由已知比可反推 $x:y=${xRatio.a}:${xRatio.b}$。再設 $x=${xRatio.a}k,\\ y=${xRatio.b}k$，可得 $(3x+2y):(5x-6y)=(${3 * xRatio.a + 2 * xRatio.b})k:(${5 * xRatio.a - 6 * xRatio.b})k=${secondRatio.a}:${secondRatio.b}$。`
        )
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ232SquareProportionSet(count) {
    const questions = [];
    const answers = [];
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ232ChainedVariationSet(count) {
    const questions = [];
    const answers = [];
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
        questions.push(
          `已知 $T=Y-Z$，其中 $Y$ 與 $x$ 成正比，$Z$ 與 $x$ 成反比。若當 $x=${x0}$ 時，$Y=${fractionToLatex(y0)}$；當 $x=${x1}$ 時，$Z=${fractionToLatex(z0)}$，求 $T$ 與 $x$ 的關係式，並求當 $x=${x1}$ 時的 $T$。`
        );
        answers.push(
          formatJ232Answer(
            `$T=${t1Text}$`,
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ232PercentChangeSet(count) {
    const questions = [];
    const answers = [];
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ232WordJudgmentSet(count) {
    const questions = [];
    const answers = [];

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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ241InequalityLanguageSet(count) {
    const questions = [];
    const answers = [];
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
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

  function formatPracticeShortAnswer(shortAnswer, process = '') {
    const shortText = String(shortAnswer || '').trim();
    const processText = String(process || '').trim();
    return processText ? `簡答：${shortText}\n過程：${processText}` : `簡答：${shortText}`;
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

  function formatJ231Answer(shortAnswer, process = '') {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function finalizeJ231Set(questions, answers) {
    const detailedAnswers = answers.map((answer) => {
      const text = String(answer || '').trim();
      if (text.startsWith('簡答：')) return text;
      return formatJ231Answer(inferPracticeShortAnswer(text), text);
    });
    return {
      questions,
      summaryAnswers: detailedAnswers.map(deriveSummaryAnswerFromDetail),
      answers: detailedAnswers,
    };
  }

  function formatJ232Answer(shortAnswer, process = '') {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function formatJ241Answer(shortAnswer, process = '') {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function formatJ242Answer(shortAnswer, process = '') {
    return formatPracticeShortAnswer(shortAnswer, process);
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
    const answers = [];
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
            `先移項整理：$${formatTerm(leftCoef, 'x')}${rightCoef > 0 ? '-' : '+'}${formatTerm(Math.abs(rightCoef), 'x')}${rawOp}${rhsConst}${bias >= 0 ? '-' : '+'}${Math.abs(bias)}$，可得 $${formatIneqAxRelB(A, rawOp, rhsConst - bias)}$。${A < 0 ? `再除以負數 ${A} 要變號，` : ''}所以解是 $${solution}$。`
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
          `解不等式：$${p}(x${r >= 0 ? '+' : ''}${r})${displayIneqOp(rawOp)}${formatLinearExpr(q, rhs)}$。`
        );
        answers.push(
          formatJ241Answer(
            `$${solution}$`,
            `先展開得 $${p}x${p * r >= 0 ? '+' : ''}${p * r}${rawOp}${formatLinearExpr(q, rhs)}$。移項整理後可得 $${formatIneqAxRelB(A, rawOp, rhs - p * r)}$。${A < 0 ? `兩邊同除以負數 ${A} 要變號，` : ''}因此 $${solution}$。`
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
        `解不等式：$${p}(x${r >= 0 ? '+' : ''}${r})-${q}(x${u >= 0 ? '+' : ''}${u})${displayIneqOp(rawOp)}${rhs}$。`
      );
      answers.push(
        formatJ241Answer(
          `$${solution}$`,
          `先展開得 $${p}x${p * r >= 0 ? '+' : ''}${p * r}-${q}x${q * u >= 0 ? '-' : '+'}${Math.abs(q * u)}${rawOp}${rhs}$，整理後為 $${formatIneqAxRelB(A, rawOp, rhs - constPart)}$。${A < 0 ? `再除以負數 ${A} 時要變號，` : ''}所以解為 $${solution}$。`
        )
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ241DecimalSolveSet(count) {
    const questions = [];
    const answers = [];
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
          `解不等式：$${trimFixed(coef / scale)}x${bias >= 0 ? '+' : ''}${trimFixed(bias / scale)}${displayIneqOp(rawOp)}${trimFixed(rhsCoef / scale)}x${rhsConst >= 0 ? '+' : ''}${trimFixed(rhsConst / scale)}$。`
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
          `解不等式：$${p}\\left(${inner}\\right)${displayIneqOp(rawOp)}${trimFixed(q / 10)}x${rhs >= 0 ? '+' : ''}${trimFixed(rhs / 10)}$。`
        );
        answers.push(
          formatJ241Answer(
            `$${solution}$`,
            `先展開並把小數同乘以 $10$ 化成整數，可得 $${p * 10}(x${r >= 0 ? '+' : ''}${r})${rawOp}${formatLinearExpr(q, rhs)}$。整理後為 $${formatIneqAxRelB(A, rawOp, rhs - 10 * p * r)}$。${A < 0 ? `除以負數 ${A} 要變號，` : ''}所以 $${solution}$。`
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
        `解不等式：$${trimFixed(p / 10)}(10x${r >= 0 ? '+' : ''}${10 * r})-${trimFixed(q / 10)}(10x${u >= 0 ? '+' : ''}${10 * u})${displayIneqOp(rawOp)}${trimFixed(rhs / 10)}$。`
      );
      answers.push(
        formatJ241Answer(
          `$${solution}$`,
          `先展開並整理得 $${p}(10x${r >= 0 ? '+' : ''}${10 * r})-${q}(10x${u >= 0 ? '+' : ''}${10 * u})${rawOp}${rhs}$，進一步可化成 $${formatIneqAxRelB(A, rawOp, rhs - constPart)}$。${A < 0 ? `再除以負數 ${A} 要變號，` : ''}因此 $${solution}$。`
        )
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ241FractionSolveSet(count) {
    const questions = [];
    const answers = [];
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ241RangeSet(count) {
    const questions = [];
    const answers = [];

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
      const yExpr =
        coef.den === 1 && coef.num === 1
          ? `x${bias >= 0 ? '+' : ''}${bias}`
          : coef.den === 1 && coef.num === -1
            ? `-x${bias >= 0 ? '+' : ''}${bias}`
            : `${coefText}x${bias >= 0 ? '+' : ''}${bias}`;
      const rangeAnswer = `${formatIneqBound(lowerY)}${yLeft}y${yRight}${formatIneqBound(upperY)}`;
      questions.push(`已知 $${low}${xExprLeft}x${xExprRight}${high}$，求 $y=${yExpr}$ 的範圍。`);
      answers.push(
        formatJ241Answer(
          `$${rangeAnswer}$`,
          `因為 $y=${yExpr}$ ${increasing ? '會隨 $x$ 增加而增加' : '會隨 $x$ 增加而減少'}，所以只要代入兩個端點判斷最小與最大值。可得 $${rangeAnswer}$。`
        )
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ241ReverseCoeffSet(count) {
    const questions = [];
    const answers = [];
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
          `若 $ax${c >= 0 ? '+' : ''}${c}${displayIneqOp(rawOp)}${formatLinearExpr(rightCoef, d)}$ 的解為 $x${displayIneqOp(solOp)}${target}$，求 $a$。`
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ241KnownSolutionParamRangeSet(count) {
    const questions = [];
    const answers = [];
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
        const leftExpr = `ax${leftBias >= 0 ? '+' : ''}${leftBias}`;
        const rightExpr = formatLinearExpr(rightCoef, rightConst);
        questions.push(
          `已知 $x=${x0}$ 為不等式 $${leftExpr}${displayIneqOp(rawOp)}${rightExpr}$ 的解，求 $a$ 的範圍，並求滿足條件的${askText}整數。`
        );
        answers.push(
          formatJ241Answer(
            `$a${displayIneqOp(solOp)}${fractionToLatex(target, true)}$，${askText}整數為 $${integerAnswer}$`,
            `把 $x=${x0}$ 代入，可得 $${x0}a${leftBias >= 0 ? '+' : ''}${leftBias}${displayIneqOp(rawOp)}${rightCoef * x0}${rightConst >= 0 ? '+' : ''}${rightConst}$。整理得 $${x0}a${displayIneqOp(rawOp)}${rightCoef * x0 + rightConst - leftBias}$。再解得 $a${displayIneqOp(solOp)}${fractionToLatex(target, true)}$。因此滿足條件的${askText}整數為 $${integerAnswer}$。`
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ241SameSolutionSet(count) {
    const questions = [];
    const answers = [];
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
          `若不等式 $${p}(x${r >= 0 ? '+' : ''}${r})${displayIneqOp(raw1)}${formatLinearExpr(q, rhs1)}$ 的解與 $${s}(x${u >= 0 ? '+' : ''}${u})${displayIneqOp(raw2)}${formatLinearExpr(t, rhs2)}+a$ 的解相同，求 $a$。`
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
          `若 $${p}(x${r >= 0 ? '+' : ''}${r})-${q}(x${u >= 0 ? '+' : ''}${u})${displayIneqOp(raw1)}${rhs1}$ 的解與 $${s}(x${m >= 0 ? '+' : ''}${m})-${t}(x${u >= 0 ? '+' : ''}${u})${displayIneqOp(raw2)}a$ 的解相同，求 $a$。`
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
        `若不等式 $${p}(x${r >= 0 ? '+' : ''}${r})${displayIneqOp(raw1)}${formatLinearExpr(q, rhs1)}$ 的解與 $${s}(x${u >= 0 ? '+' : ''}${u})${displayIneqOp(raw2)}${t}x+a$ 的解相同，求 $a$。`
      );
      answers.push(
        formatJ241Answer(
          `$a=${a}$`,
          `先把第一個不等式化簡，得 $${formatIneqSolution(solOp, makeFraction(target))}$。第二個不等式整理成 $${formatTerm(B, 'x')}${displayIneqOp(raw2)}${secondRhs}$。要和前式解相同，就要有 $${secondRhs}=${B * target}$，解得 $a=${a}$。`
        )
      );
    }

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ242BasicWordSet(count) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 6;
      const cycle = Math.floor(i / 6);

      if (variant === 0) {
        const countItem = 4 + (cycle % 4);
        const budget = 90 + cycle * 17 + countItem;
        const bound = fractionToLatex(makeFraction(budget, countItem), true);
        questions.push(`預算購買：一枝螢光筆 $x$ 元，買 ${countItem} 枝的錢不夠付 ${budget} 元，求 $x$ 的範圍。`);
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ242RegularWordSet(count) {
    const questions = [];
    const answers = [];

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
          `停車費率：某停車場每小時收費 ${rate} 元，不滿 1 小時以 1 小時計。若停了 $x$ 小時，總費用不超過 ${cap} 元，求 $x$ 的範圍。`
        );
        const bound = fractionToLatex(makeFraction(cap, rate), true);
        const maxHours = Math.floor(cap / rate);
        answers.push(
          formatJ242Answer(
            `$x≤${bound}$，最多 ${maxHours} 小時`,
            `依題意：$${rate}x≤${cap}$，所以 $x≤${bound}$。若題目限制以小時計，則最多可停 ${maxHours} 小時。`
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

    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ242AdvancedWordSet(count) {
    const questions = [];
    const answers = [];

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
            `若錯 $x$ 題，則對了 $${total}-x$ 題，得分為 $${score}(${total}-x)-${penalty}x$。依題意：$${score}(${total}-x)-${penalty}x>${bound}$，整理得 $${coef}x<${score * total - bound}$，即 $x<${boundText}$。因此 $x$ 的最大值是 ${maxWrong}。`
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
      'j2-1-1-context-to-equation-drill': {
        type: 'drill',
        title: '文字敘述轉換為代數式',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ2ContextEquationSet(5);
        },
      },
      'j2-1-1-expression-classify-drill': {
        type: 'drill',
        title: '二元一次式與方程式判別',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ2ClassifySet(5);
        },
      },
      'j2-1-1-evaluate-expression-drill': {
        type: 'drill',
        title: '求二元一次式的值',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ2EvaluateExpressionSet(5);
        },
      },
      'j2-1-1-expression-simplify-drill': {
        type: 'drill',
        title: '二元一次式的化簡（合併同類項）',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ2ExpressionSimplifySet(5);
        },
      },
      'j2-1-1-distribute-expand-drill': {
        type: 'drill',
        title: '去括號與分配律運算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ2DistributeExpandSet(5);
        },
      },
      'j2-1-1-fraction-simplify-drill': {
        type: 'drill',
        title: '分數形式的化簡（通分）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ2FractionSimplifySet(5);
        },
      },
      'j2-1-1-ordered-pair-check-drill': {
        type: 'drill',
        title: '數對代入與成立判斷',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ2OrderedPairCheckSet(5);
        },
      },
      'j2-1-1-parameter-substitution-drill': {
        type: 'drill',
        title: '參數題代入求係數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ2ParameterSubstitutionSet(5);
        },
      },
      'j2-1-1-equivalent-transform-drill': {
        type: 'drill',
        title: '標準型整理（移項）',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ2EquivalentTransformSet(5);
        },
      },
      'j2-1-1-integer-constraint-drill': {
        type: 'drill',
        title: '列出多組整數解',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ2IntegerConstraintSet(5);
        },
      },
      'j2-1-1-solve-for-variable-drill': {
        type: 'drill',
        title: '整理成 x 表示 y、y 表示 x',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ2SolveForVariableSet(5);
        },
      },
      'j2-1-2-substitution-basic-drill': {
        type: 'drill',
        title: '代入消去法的基礎練習',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ212SubstitutionBasicSet(5);
        },
      },
      'j2-1-2-elimination-adjustment-drill': {
        type: 'drill',
        title: '加減消去法的係數調整',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ212EliminationAdjustmentSet(5);
        },
      },
      'j2-1-2-fraction-decimal-drill': {
        type: 'drill',
        title: '分數與小數型的化簡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ212FractionDecimalSet(5);
        },
      },
      'j2-1-2-solution-type-drill': {
        type: 'drill',
        title: '解的個數判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ212SolutionTypeSet(5);
        },
      },
      'j2-1-2-triple-equal-drill': {
        type: 'drill',
        title: '特殊結構運算（A=B=C）',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212TripleEqualSet(5);
        },
      },
      'j2-1-2-symmetric-system-drill': {
        type: 'drill',
        title: '特殊結構運算（係數對稱）',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212SymmetricSet(5);
        },
      },
      'j2-1-2-abs-zero-drill': {
        type: 'drill',
        title: '特殊結構運算（非負性質）',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212AbsZeroSet(5);
        },
      },
      'j2-1-2-known-solution-coeff-drill': {
        type: 'drill',
        title: '已知解反求係數',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212KnownSolutionCoeffSet(5);
        },
      },
      'j2-1-2-error-diagnosis-drill': {
        type: 'drill',
        title: '看錯題目（邏輯排錯）',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212ErrorDiagnosisSet(5);
        },
      },
      'j2-1-2-shared-solution-drill': {
        type: 'drill',
        title: '同解問題（兩組方程組共有解）',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212SharedSolutionSet(5);
        },
      },
      'j2-1-2-third-condition-drill': {
        type: 'drill',
        title: '解滿足第三個條件',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212ThirdConditionSet(5);
        },
      },
      'j2-1-2-special-reverse-drill': {
        type: 'drill',
        title: '特殊解情形的反求',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ212SpecialReverseSet(5);
        },
      },
      'j2-1-3-money-ticket-drill': {
        type: 'drill',
        title: '濃度與混合問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ213MoneyTicketSet(5);
        },
      },
      'j2-1-3-heads-coins-score-drill': {
        type: 'drill',
        title: '淨重、毛重與容器問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ213HeadsCoinsScoreSet(5);
        },
      },
      'j2-1-3-digit-placevalue-drill': {
        type: 'drill',
        title: '數字位數與交換問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ213DigitPlaceValueSet(5);
        },
      },
      'j2-1-3-age-chase-drill': {
        type: 'drill',
        title: '測驗得分與勝負判定',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ213AgeChaseSet(5);
        },
      },
      'j2-1-3-speed-chase-drill': {
        type: 'drill',
        title: '行程速率與追趕問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ213SpeedChaseSet(5);
        },
      },
      'j2-1-3-allocation-work-drill': {
        type: 'drill',
        title: '分配與工程問題',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ213AllocationWorkSet(5);
        },
      },
      'j2-1-3-tiered-fee-drill': {
        type: 'drill',
        title: '基本費與超額計費問題',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ213TieredFeeSet(5);
        },
      },
      'j2-1-3-classical-text-drill': {
        type: 'drill',
        title: '古文應用題',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ213ClassicalTextSet(5);
        },
      },
      'j2-2-1-axis-distance-drill': {
        type: 'drill',
        title: '點的坐標表示法與坐標軸距離',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ221AxisDistanceSet(5);
        },
      },
      'j2-2-1-quadrant-basic-drill': {
        type: 'drill',
        title: '各象限及其性質符號判別',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ221QuadrantBasicSet(5);
        },
      },
      'j2-2-1-translation-basic-drill': {
        type: 'drill',
        title: '坐標平面上的平移移動',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ221TranslationSet(5);
        },
      },
      'j2-2-1-axis-special-drill': {
        type: 'drill',
        title: '坐標軸上的點與特殊位置判定',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ221AxisSpecialSet(5);
        },
      },
      'j2-2-1-midpoint-drill': {
        type: 'drill',
        title: '中點坐標公式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ221MidpointSet(5);
        },
      },
      'j2-2-1-symmetry-drill': {
        type: 'drill',
        title: '坐標平面上的對稱點',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ221SymmetrySet(5);
        },
      },
      'j2-2-1-area-drill': {
        type: 'drill',
        title: '幾何圖形的面積計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ221AreaSet(5);
        },
      },
      'j2-2-1-quadrant-reasoning-drill': {
        type: 'drill',
        title: '含代數參數的象限推理',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ221QuadrantReasoningSet(5);
        },
      },
      'j2-2-1-nonnegative-drill': {
        type: 'drill',
        title: '絕對值與平方的非負性質應用',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ221NonnegativeSet(5);
        },
      },
      'j2-2-2-point-line-relation-drill': {
        type: 'drill',
        title: '含有未知數的點與方程式關係',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ222PointLineRelationSet(5);
        },
      },
      'j2-2-2-intercept-area-drill': {
        type: 'drill',
        title: '利用截距找交點與三角形面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ222InterceptAreaSet(5);
        },
      },
      'j2-2-2-quadrant-exclusion-drill': {
        type: 'drill',
        title: '由係數正負判斷不通過之象限',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ222QuadrantExclusionSet(5);
        },
      },
      'j2-2-2-parallel-perpendicular-drill': {
        type: 'drill',
        title: '水平線與鉛垂線的判定與方程',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ222ParallelPerpendicularSet(5);
        },
      },
      'j2-2-2-line-from-points-drill': {
        type: 'drill',
        title: '已知兩點求直線方程式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ222LineFromPointsSet(5);
        },
      },
      'j2-2-2-only-two-quadrants-drill': {
        type: 'drill',
        title: '進階判斷：只通過兩個象限',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ222TwoQuadrantsSet(5);
        },
      },
      'j2-2-2-point-translation-line-drill': {
        type: 'drill',
        title: '點的平移與直線的變動',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ222TranslationLineSet(5);
        },
      },
      'j2-2-2-two-lines-area-drill': {
        type: 'drill',
        title: '兩直線交點與坐標軸圍成面積',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ222TwoLinesAreaSet(5);
        },
      },
      'j2-3-1-ratio-simplify-drill': {
        type: 'drill',
        title: '比例化簡與比值運算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ231RatioSimplifySet(5);
        },
      },
      'j2-3-1-proportion-solve-drill': {
        type: 'drill',
        title: '比例式求解未知數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ231ProportionSolveSet(5);
        },
      },
      'j2-3-1-relation-transform-drill': {
        type: 'drill',
        title: '關係式與比例式互換',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ231RelationTransformSet(5);
        },
      },
      'j2-3-1-k-method-drill': {
        type: 'drill',
        title: '設比例常數求值',
        difficulty: 'challenge',
        questionCount: 5,
        generate() {
          return buildJ231KMethodSet(5);
        },
      },
      'j2-3-1-basic-single-step-drill': {
        type: 'drill',
        title: '基本題型（單層動作）',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ231BasicSingleStepSet(5);
        },
      },
      'j2-3-1-regular-two-step-drill': {
        type: 'drill',
        title: '正規題型（二層動作）',
        difficulty: 'medium',
        questionCount: 7,
        generate() {
          return buildJ231RegularTwoStepSet(7);
        },
      },
      'j2-3-1-advanced-three-step-drill': {
        type: 'drill',
        title: '進階題型（三層動作）',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ231AdvancedThreeStepSet(5);
        },
      },
      'j2-3-1-concentration-reverse-drill': {
        type: 'drill',
        title: '濃度混合與逆推稀釋題',
        difficulty: 'challenge',
        questionCount: 6,
        generate() {
          return buildJ231ConcentrationReverseSet(6);
        },
      },
      'j2-3-2-basic-direct-inverse-drill': {
        type: 'drill',
        title: '基礎正反比運算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ232BasicDirectInverseSet(5);
        },
      },
      'j2-3-2-linear-combo-proportion-drill': {
        type: 'drill',
        title: '線性組合式比例',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ232LinearComboProportionSet(5);
        },
      },
      'j2-3-2-square-proportion-drill': {
        type: 'drill',
        title: '次方型比例',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ232SquareProportionSet(5);
        },
      },
      'j2-3-2-chained-variation-drill': {
        type: 'drill',
        title: '正反比鏈接',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ232ChainedVariationSet(5);
        },
      },
      'j2-3-2-percent-change-drill': {
        type: 'drill',
        title: '變量百分率異動下的比例計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ232PercentChangeSet(5);
        },
      },
      'j2-3-2-word-judgment-drill': {
        type: 'drill',
        title: '正反比文字判斷',
        difficulty: 'easy',
        questionCount: 10,
        generate() {
          return buildJ232WordJudgmentSet(10);
        },
      },
      'j2-4-1-inequality-language-drill': {
        type: 'drill',
        title: '基本判定與直覺題',
        difficulty: 'easy',
        questionCount: 8,
        generate() {
          return buildJ241InequalityLanguageSet(8);
        },
      },
      'j2-4-1-inequality-integer-drill': {
        type: 'drill',
        title: '正規解不等式（整數型）',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ241IntegerSolveSet(6);
        },
      },
      'j2-4-1-inequality-fraction-drill': {
        type: 'drill',
        title: '進階運算題（分數型）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ241FractionSolveSet(5);
        },
      },
      'j2-4-1-inequality-decimal-drill': {
        type: 'drill',
        title: '進階運算題（小數型）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ241DecimalSolveSet(5);
        },
      },
      'j2-4-1-inequality-range-drill': {
        type: 'drill',
        title: '範圍推導',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ241RangeSet(6);
        },
      },
      'j2-4-1-inequality-reverse-coeff-drill': {
        type: 'drill',
        title: '由解逆推原不等式中的未知係數',
        difficulty: 'hard',
        questionCount: 6,
        generate() {
          return buildJ241ReverseCoeffSet(6);
        },
      },
      'j2-4-1-inequality-known-solution-range-drill': {
        type: 'drill',
        title: '已知解反求參數範圍',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ241KnownSolutionParamRangeSet(5);
        },
      },
      'j2-4-1-inequality-same-solution-drill': {
        type: 'drill',
        title: '綜合應用題（兩不等式解相同）',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ241SameSolutionSet(5);
        },
      },
      'j2-4-2-basic-word-drill': {
        type: 'drill',
        title: '基本題型（單層動作）',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ242BasicWordSet(6);
        },
      },
      'j2-4-2-regular-word-drill': {
        type: 'drill',
        title: '正規題型（二層動作）',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ242RegularWordSet(6);
        },
      },
      'j2-4-2-advanced-word-drill': {
        type: 'drill',
        title: '進階題型（三層動作）',
        difficulty: 'hard',
        questionCount: 7,
        generate() {
          return buildJ242AdvancedWordSet(7);
        },
      },
  };

  const bundleFingerprint = "j2-bundle-v20260619-v1";
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== "object") return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
