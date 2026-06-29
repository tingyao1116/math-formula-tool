(() => {
  const store = window.formulaPracticeStore;
  if (!store || typeof store.registerConfigs !== 'function') return;

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

  function pickFromList(list) {
    return list[randInt(0, list.length - 1)];
  }

  function trimDecimalString(text) {
    const source = String(text || '').trim();
    if (!source.includes('.')) return source;
    return source.replace(/0+$/g, '').replace(/\.$/g, '');
  }

  function e522PlainFraction(numerator, denominator) {
    const reduced = reduceFraction(numerator, denominator);
    if (reduced.denominator === 1) return `${reduced.numerator}`;
    return `${reduced.numerator}/${reduced.denominator}`;
  }

  function e522LatexFraction(numerator, denominator) {
    return formatFraction(numerator, denominator);
  }

  function e522Inline(tex) {
    return `\\(${tex}\\)`;
  }

  function e522MixedInline(whole, numerator, denominator) {
    return e522Inline(`${whole}${e522LatexFraction(numerator, denominator)}`);
  }

  function e522MixedToImproper(whole, numerator, denominator) {
    return { numerator: whole * denominator + numerator, denominator };
  }

  function buildE522IntegerFractionMultiplySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const denominator = pickFromList([3, 4, 5, 6, 7, 8, 9, 10, 12, 15]);
      const numerator = pickFromList([2, 3, 4, 5, 7, 8, 9, 10, 11, 13]);
      const integer = pickFromList([6, 8, 9, 10, 12, 14, 15, 18, 20, 24, 30, 36, 42]);
      const productN = integer * numerator;
      const productD = denominator;
      questions.push(`計算：${e522Inline(`${integer} \\times ${e522LatexFraction(numerator, denominator)}`)}。`);
      summaryAnswers.push(`$${e522LatexFraction(productN, productD)}$`);
      answers.push(
        `簡答：$${e522LatexFraction(productN, productD)}$。過程：整數乘分數 = 整數 × 分子 ÷ 分母，所以 ${integer} × ${e522LatexFraction(numerator, denominator)} = ${e522LatexFraction(productN, productD)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE522IntegerMixedMultiplySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const integer = pickFromList([3, 4, 5, 6, 7, 8, 9, 10]);
      const whole = pickFromList([1, 2, 3, 4, 5, 6]);
      const denominator = pickFromList([2, 3, 4, 5, 6, 8]);
      const numerator = randInt(1, denominator - 1);
      const improper = e522MixedToImproper(whole, numerator, denominator);
      const productN = integer * improper.numerator;
      const productD = improper.denominator;
      questions.push(
        `計算：${e522Inline(`${integer} \\times ${whole}${e522LatexFraction(numerator, denominator)}`)}。`
      );
      summaryAnswers.push(`$${e522LatexFraction(productN, productD)}$`);
      answers.push(
        `簡答：$${e522LatexFraction(productN, productD)}$。過程：先把帶分數化成假分數，${whole}${e522LatexFraction(numerator, denominator)} = ${e522LatexFraction(improper.numerator, improper.denominator)}，再乘 ${integer}，得到 $${e522LatexFraction(productN, productD)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE522FractionFractionMultiplySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const b = pickFromList([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
      const d = pickFromList([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
      let a = randInt(1, 10);
      let c = randInt(1, 10);
      while (a % b === 0) a = randInt(1, 10);
      while (c % d === 0) c = randInt(1, 10);
      const productN = a * c;
      const productD = b * d;
      questions.push(`計算：${e522Inline(`${e522LatexFraction(a, b)} \\times ${e522LatexFraction(c, d)}`)}。`);
      summaryAnswers.push(`$${e522LatexFraction(productN, productD)}$`);
      answers.push(
        `簡答：$${e522LatexFraction(productN, productD)}$。過程：分數乘分數就是分子乘分子、分母乘分母，所以 ${e522LatexFraction(a, b)} × ${e522LatexFraction(c, d)} = ${e522LatexFraction(productN, productD)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE522CrossCancelMultiplySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const common = pickFromList([2, 3, 4, 5, 6, 7, 8]);
      const a = pickFromList([1, 2, 3, 4, 5]);
      const b = pickFromList([1, 2, 3, 4, 5]);
      const c = pickFromList([2, 3, 4, 5, 6]);
      const d = pickFromList([2, 3, 4, 5, 6]);
      const n1 = common * a;
      const d2 = common * d;
      const d1 = pickFromList([3, 4, 5, 6, 7, 8, 9, 10]);
      const n2 = randInt(1, 9);
      const productN = n1 * n2;
      const productD = d1 * d2;
      questions.push(`計算：${e522Inline(`${e522LatexFraction(n1, d1)} \\times ${e522LatexFraction(n2, d2)}`)}。`);
      summaryAnswers.push(`$${e522LatexFraction(productN, productD)}$`);
      answers.push(
        `簡答：$${e522LatexFraction(productN, productD)}$。過程：可先交叉約分，因為 ${n1} 和 ${d2} 都可約掉 ${common}，再相乘仍會得到 $${e522LatexFraction(productN, productD)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE522DiscreteFractionOfQuantitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const items = [
      ['一盒月餅', '個'],
      ['一盒雞蛋', '顆'],
      ['一本書', '頁'],
      ['一盒彩筆', '枝'],
      ['哥哥的零用錢', '元'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [objectName, unit] = items[i % items.length];
      const denominator = pickFromList([2, 3, 4, 5, 6, 8, 10]);
      const numerator = randInt(1, denominator - 1);
      const base = denominator * pickFromList([6, 8, 10, 12, 15, 20, 24, 30, 40]);
      const answer = (base * numerator) / denominator;
      questions.push(
        `${objectName}有 ${base} ${unit}，${objectName}的 ${e522Inline(e522LatexFraction(numerator, denominator))} 是幾${unit}？`
      );
      summaryAnswers.push(`${answer}${unit}`);
      answers.push(
        `簡答：${answer}${unit}。過程：求 ${e522LatexFraction(numerator, denominator)} 倍，就是 ${base} × ${e522LatexFraction(numerator, denominator)} = ${answer}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE522ContinuousFractionApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const templates = [
      ['操場跑道一圈', '公尺', '弟弟跑了'],
      ['一包麵粉重', '公斤', '做水餃皮用了'],
      ['一瓶可樂有', '公升', '冰箱裡有'],
      ['1 公斤香蕉賣', '元', '買了'],
      ['長方形花圃長', '公尺', '寬是'],
    ];
    for (let i = 0; i < count; i += 1) {
      const index = i % templates.length;
      if (index === 0) {
        const base = pickFromList([120, 160, 180, 200, 240, 300]);
        const denominator = pickFromList([2, 3, 4, 5, 6, 8]);
        const numerator = randInt(1, denominator - 1);
        const answer = (base * numerator) / denominator;
        questions.push(
          `操場跑道一圈 ${base} 公尺，弟弟跑了 ${e522Inline(e522LatexFraction(numerator, denominator))} 圈，是跑了幾公尺？`
        );
        summaryAnswers.push(`${answer}公尺`);
        answers.push(
          `簡答：${answer}公尺。過程：跑的距離 = ${base} × ${e522LatexFraction(numerator, denominator)} = ${answer}。`
        );
      } else if (index === 1) {
        const base = pickFromList([2, 3, 4, 5, 6, 8, 10]);
        const denominator = pickFromList([2, 3, 4, 5, 6]);
        const numerator = randInt(1, denominator - 1);
        const answer = (base * numerator) / denominator;
        questions.push(
          `一包麵粉重 ${base} 公斤，做點心用了 ${e522Inline(e522LatexFraction(numerator, denominator))} 包，是用了幾公斤？`
        );
        summaryAnswers.push(`${e522PlainFraction(base * numerator, denominator)}公斤`);
        answers.push(
          `簡答：${e522PlainFraction(base * numerator, denominator)}公斤。過程：重量 = ${base} × ${e522LatexFraction(numerator, denominator)} = ${e522LatexFraction(base * numerator, denominator)}，也就是 ${e522PlainFraction(base * numerator, denominator)} 公斤。`
        );
      } else if (index === 2) {
        const base = pickFromList([1, 2, 3, 4]);
        const whole = pickFromList([1, 2, 3]);
        const denominator = pickFromList([2, 3, 4, 5, 6]);
        const numerator = randInt(1, denominator - 1);
        const improper = e522MixedToImproper(whole, numerator, denominator);
        const answerN = base * improper.numerator;
        const answerD = improper.denominator;
        questions.push(
          `一瓶可樂有 ${base} 公升，冰箱裡有 ${e522MixedInline(whole, numerator, denominator)} 瓶，是幾公升？`
        );
        summaryAnswers.push(`${e522PlainFraction(answerN, answerD)}公升`);
        answers.push(
          `簡答：${e522PlainFraction(answerN, answerD)}公升。過程：先把 ${whole}${e522LatexFraction(numerator, denominator)} 瓶化成 ${e522LatexFraction(improper.numerator, improper.denominator)} 瓶，再乘每瓶 ${base} 公升，得到 ${e522LatexFraction(answerN, answerD)} 公升。`
        );
      } else if (index === 3) {
        const base = pickFromList([20, 24, 30, 36, 40, 55, 60]);
        const whole = pickFromList([1, 2, 3]);
        const denominator = pickFromList([2, 3, 4, 5, 6]);
        const numerator = randInt(1, denominator - 1);
        const improper = e522MixedToImproper(whole, numerator, denominator);
        const answerN = base * improper.numerator;
        const answerD = improper.denominator;
        questions.push(
          `1 公斤水果賣 ${base} 元，買了 ${e522MixedInline(whole, numerator, denominator)} 公斤，要付多少元？`
        );
        summaryAnswers.push(`${e522PlainFraction(answerN, answerD)}元`);
        answers.push(
          `簡答：${e522PlainFraction(answerN, answerD)}元。過程：總價 = ${base} × ${e522LatexFraction(improper.numerator, improper.denominator)} = ${e522LatexFraction(answerN, answerD)}，也就是 ${e522PlainFraction(answerN, answerD)} 元。`
        );
      } else {
        const length = pickFromList([6, 8, 9, 10, 12, 15]);
        const denominator = pickFromList([2, 3, 4, 5, 6]);
        const numerator = randInt(1, denominator - 1);
        const areaN = length * numerator;
        const areaD = denominator;
        questions.push(
          `長方形花圃長 ${length} 公尺，寬是 ${e522Inline(e522LatexFraction(numerator, denominator))} 公尺，面積是多少平方公尺？`
        );
        summaryAnswers.push(`${e522PlainFraction(areaN, areaD)}平方公尺`);
        answers.push(
          `簡答：${e522PlainFraction(areaN, areaD)}平方公尺。過程：面積 = 長 × 寬 = ${length} × ${e522LatexFraction(numerator, denominator)} = ${e522LatexFraction(areaN, areaD)}，所以是 ${e522PlainFraction(areaN, areaD)} 平方公尺。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE522FractionOfFractionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const templates = [
      ['一個香瓜重', '公斤', '個香瓜重多少'],
      ['一瓶燕麥奶有', '公升', '哥哥喝了'],
      ['一包糖重', '公斤', '做點心用掉全部的'],
      ['一塊長方形地', '平方公尺', '用了其中的'],
      ['一個長方形花圃，長', '公尺', '寬'],
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const d1 = pickFromList([2, 3, 4, 5, 6, 8, 10]);
      const n1 = randInt(1, d1 - 1);
      const d2 = pickFromList([2, 3, 4, 5, 6, 8, 10]);
      const n2 = randInt(1, d2 - 1);
      const prodN = n1 * n2;
      const prodD = d1 * d2;
      if (mode === 0) {
        questions.push(
          `一個香瓜重 ${e522Inline(e522LatexFraction(n1, d1))} 公斤，${e522Inline(e522LatexFraction(n2, d2))} 個香瓜重多少公斤？`
        );
        summaryAnswers.push(`${e522PlainFraction(prodN, prodD)}公斤`);
        answers.push(
          `簡答：${e522PlainFraction(prodN, prodD)}公斤。過程：${e522LatexFraction(n2, d2)} 個香瓜的重量 = ${e522LatexFraction(n1, d1)} × ${e522LatexFraction(n2, d2)} = ${e522LatexFraction(prodN, prodD)}。`
        );
      } else if (mode === 1) {
        questions.push(
          `一瓶燕麥奶有 ${e522Inline(e522LatexFraction(n1, d1))} 公升，哥哥喝了 ${e522Inline(e522LatexFraction(n2, d2))} 瓶，是喝了幾公升？`
        );
        summaryAnswers.push(`${e522PlainFraction(prodN, prodD)}公升`);
        answers.push(
          `簡答：${e522PlainFraction(prodN, prodD)}公升。過程：容量 = ${e522LatexFraction(n1, d1)} × ${e522LatexFraction(n2, d2)} = ${e522LatexFraction(prodN, prodD)}。`
        );
      } else if (mode === 2) {
        questions.push(
          `一包糖重 ${e522Inline(e522LatexFraction(n1, d1))} 公斤，做點心用掉全部的 ${e522Inline(e522LatexFraction(n2, d2))}，共用掉多少公斤？`
        );
        summaryAnswers.push(`${e522PlainFraction(prodN, prodD)}公斤`);
        answers.push(
          `簡答：${e522PlainFraction(prodN, prodD)}公斤。過程：用掉的重量 = ${e522LatexFraction(n1, d1)} × ${e522LatexFraction(n2, d2)} = ${e522LatexFraction(prodN, prodD)}。`
        );
      } else if (mode === 3) {
        questions.push(
          `一塊長方形地面積是 ${e522Inline(e522LatexFraction(n1, d1))} 平方公尺，又用了其中的 ${e522Inline(e522LatexFraction(n2, d2))}，共用了多少平方公尺？`
        );
        summaryAnswers.push(`${e522PlainFraction(prodN, prodD)}平方公尺`);
        answers.push(
          `簡答：${e522PlainFraction(prodN, prodD)}平方公尺。過程：部分的部分要用乘法，所以 ${e522LatexFraction(n1, d1)} × ${e522LatexFraction(n2, d2)} = ${e522LatexFraction(prodN, prodD)}。`
        );
      } else {
        const length = pickFromList([3, 4, 5, 6, 8, 10]);
        const widthN = length * n1 * n2;
        const widthD = d1 * d2;
        questions.push(
          `一個長方形花圃長 ${length} 公尺，寬是 ${e522Inline(`${e522LatexFraction(n1, d1)} \\times ${e522LatexFraction(n2, d2)}`)} 公尺，面積是多少平方公尺？`
        );
        summaryAnswers.push(`${e522PlainFraction(widthN, widthD)}平方公尺`);
        answers.push(
          `簡答：${e522PlainFraction(widthN, widthD)}平方公尺。過程：面積 = ${length} × ${e522LatexFraction(n1, d1)} × ${e522LatexFraction(n2, d2)} = ${e522LatexFraction(widthN, widthD)}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE522QuotientFractionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickFromList([2, 3, 5, 6, 7, 8, 9, 11, 12, 13, 15, 20]);
      const b = pickFromList([3, 4, 5, 6, 7, 8, 9, 11, 13]);
      questions.push(`把 ${a} ÷ ${b} 寫成分數。`);
      summaryAnswers.push(`$${e522LatexFraction(a, b)}$`);
      answers.push(
        `簡答：$${e522LatexFraction(a, b)}$。過程：整數相除寫成分數時，被除數當分子、除數當分母，所以 ${a} ÷ ${b} = ${e522LatexFraction(a, b)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE522QuotientDecimalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const denominators = [2, 4, 5, 8, 10, 20, 25];
    for (let i = 0; i < count; i += 1) {
      const denominator = pickFromList(denominators);
      const quotient = pickFromList([0.4, 0.5, 0.6, 0.75, 0.9, 1.2, 1.25, 1.5, 2.4, 3.5, 4.05, 6.48]);
      const dividend = Number((denominator * quotient).toFixed(2));
      questions.push(`計算：${trimDecimalString(dividend.toString())} ÷ ${denominator}。`);
      summaryAnswers.push(`${trimDecimalString(quotient.toString())}`);
      answers.push(
        `簡答：${trimDecimalString(quotient.toString())}。過程：直接相除，${trimDecimalString(dividend.toString())} ÷ ${denominator} = ${trimDecimalString(quotient.toString())}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE522QuotientEstimateSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const targets = [
      { a: 1.2, b: 3, digits: 2 },
      { a: 1.3, b: 3, digits: 2 },
      { a: 5, b: 6, digits: 2 },
      { a: 9.8, b: 9, digits: 2 },
      { a: 650, b: 9, digits: 1 },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = targets[i % targets.length];
      const answer = (item.a / item.b).toFixed(item.digits);
      const ask = item.digits === 1 ? '小數點後第一位' : '小數點後第二位';
      questions.push(`計算：${item.a} ÷ ${item.b}，取概數到${ask}。`);
      summaryAnswers.push(`${answer}`);
      answers.push(`簡答：${answer}。過程：先相除得到循環或無限小數，再依題意四捨五入到${ask}，所以答案是 ${answer}。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE522DivideByPowersSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const divisors = [10, 100, 1000];
    for (let i = 0; i < count; i += 1) {
      const divisor = divisors[i % divisors.length];
      const value = pickFromList([4.9, 7.5, 12.3, 50.2, 123, 502, 543, 789.6, 0.84]);
      const answer = trimDecimalString((value / divisor).toFixed(6));
      questions.push(`不必直式，直接計算：${trimDecimalString(value.toString())} ÷ ${divisor}。`);
      summaryAnswers.push(`${answer}`);
      answers.push(
        `簡答：${answer}。過程：除以 ${divisor} 就是把小數點向左移 ${String(divisor).length - 1} 位，所以答案是 ${answer}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE522ProductCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const integer = pickFromList([12, 18, 24, 30, 40]);
        const denominator = pickFromList([2, 3, 4, 5, 6, 8, 10]);
        const numerator = randInt(1, denominator - 1);
        questions.push(
          `不用計算，比較大小：${e522Inline(`${integer} \\times ${e522LatexFraction(numerator, denominator)}`)} □ ${integer}（填入 >、< 或 =）。`
        );
        summaryAnswers.push(`<`);
        answers.push(
          `簡答：<。過程：因為乘數 ${e522LatexFraction(numerator, denominator)} 小於 1，所以積會比被乘數 ${integer} 小。`
        );
        continue;
      }
      if (mode === 1) {
        const denominator = pickFromList([2, 3, 4, 5, 6, 8]);
        const numerator = denominator;
        const integer = pickFromList([6, 8, 10, 12, 15, 20]);
        questions.push(
          `不用計算，比較大小：${e522Inline(`${integer} \\times ${e522LatexFraction(numerator, denominator)}`)} □ ${integer}（填入 >、< 或 =）。`
        );
        summaryAnswers.push(`=`);
        answers.push(
          `簡答：=。過程：因為乘數 ${e522LatexFraction(numerator, denominator)} = 1，所以積和被乘數一樣大。`
        );
        continue;
      }
      const integer = pickFromList([4, 6, 8, 10, 12]);
      const whole = pickFromList([1, 2, 3]);
      const denominator = pickFromList([2, 3, 4, 5, 6]);
      const numerator = randInt(1, denominator - 1);
      questions.push(
        `不用計算，比較大小：${e522Inline(`${integer} \\times ${whole}${e522LatexFraction(numerator, denominator)}`)} □ ${integer}（填入 >、< 或 =）。`
      );
      summaryAnswers.push(`>`);
      answers.push(
        `簡答：>。過程：${whole}${e522LatexFraction(numerator, denominator)} 大於 1，所以積會比被乘數 ${integer} 大。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE522FractionDivideIntegerSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const denominator = pickFromList([2, 3, 4, 5, 6, 8, 10, 12, 20]);
      let numerator = pickFromList([3, 4, 5, 6, 7, 8, 9, 12, 15, 18, 20, 23]);
      while (numerator % denominator === 0) numerator = pickFromList([3, 4, 5, 6, 7, 8, 9, 12, 15, 18, 20, 23]);
      const integer = pickFromList([2, 3, 4, 5, 6, 8]);
      questions.push(`計算：${e522Inline(`${e522LatexFraction(numerator, denominator)} \\div ${integer}`)}。`);
      summaryAnswers.push(`$${e522LatexFraction(numerator, denominator * integer)}$`);
      answers.push(
        `簡答：$${e522LatexFraction(numerator, denominator * integer)}$。過程：分數除以整數，就是分母乘整數，所以 ${e522LatexFraction(numerator, denominator)} ÷ ${integer} = ${e522LatexFraction(numerator, denominator * integer)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE522MultiStepApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const denominator1 = pickFromList([3, 4, 5, 6, 8]);
        const numerator1 = randInt(1, denominator1 - 1);
        const denominator2 = pickFromList([2, 3, 4, 5]);
        const pieces = denominator2 * pickFromList([2, 3, 4, 5]);
        const totalN = numerator1 * pieces;
        const totalD = denominator1 * denominator2;
        questions.push(
          `一桶果汁用了 ${e522Inline(e522LatexFraction(numerator1, denominator1))} 桶，將用剩下的果汁平均分成 ${pieces} 杯，每杯是幾桶？`
        );
        summaryAnswers.push(`${e522PlainFraction(denominator1 - numerator1, denominator1 * pieces)}桶`);
        answers.push(
          `簡答：${e522PlainFraction(denominator1 - numerator1, denominator1 * pieces)}桶。過程：先算剩下 ${1}-${e522LatexFraction(numerator1, denominator1)} = ${e522LatexFraction(denominator1 - numerator1, denominator1)} 桶，再除以 ${pieces}，得到 ${e522LatexFraction(denominator1 - numerator1, denominator1 * pieces)} 桶。`
        );
        continue;
      }
      if (mode === 1) {
        const total = pickFromList([6, 8, 10, 12, 15]);
        const useDen = pickFromList([2, 3, 4, 5, 6]);
        const useNum = randInt(1, useDen - 1);
        const split = pickFromList([2, 3, 4, 5]);
        const remainN = total * (useDen - useNum);
        const remainD = useDen;
        questions.push(
          `一條長 ${total} 公尺的彩帶，先用了全長的 ${e522Inline(e522LatexFraction(useNum, useDen))}，再把剩下的平均分成 ${split} 段，每段長多少公尺？`
        );
        summaryAnswers.push(`${e522PlainFraction(remainN, remainD * split)}公尺`);
        answers.push(
          `簡答：${e522PlainFraction(remainN, remainD * split)}公尺。過程：先剩下 ${total} × ${e522LatexFraction(useDen - useNum, useDen)} = ${e522LatexFraction(remainN, remainD)} 公尺，再除以 ${split}，得到 ${e522LatexFraction(remainN, remainD * split)} 公尺。`
        );
        continue;
      }
      if (mode === 2) {
        const totalKmDen = 12;
        const totalKmNum = pickFromList([12, 18, 20, 24, 25, 30]);
        const walkDen = pickFromList([2, 3, 4, 5, 6, 10]);
        const walkNum = randInt(1, walkDen - 1);
        const answerN = totalKmNum * walkNum;
        const answerD = totalKmDen * walkDen;
        questions.push(
          `全長 ${e522Inline(e522LatexFraction(totalKmNum, totalKmDen))} 公里的步道，走了全長的 ${e522Inline(e522LatexFraction(walkNum, walkDen))}，共走了幾公里？`
        );
        summaryAnswers.push(`${e522PlainFraction(answerN, answerD)}公里`);
        answers.push(
          `簡答：${e522PlainFraction(answerN, answerD)}公里。過程：部分長度 = ${e522LatexFraction(totalKmNum, totalKmDen)} × ${e522LatexFraction(walkNum, walkDen)} = ${e522LatexFraction(answerN, answerD)} 公里。`
        );
        continue;
      }
      const minutes = pickFromList([15, 24, 30, 36, 45, 75]);
      const people = pickFromList([2, 3, 4, 5, 6, 8]);
      questions.push(`${minutes} 分鐘平均分給 ${people} 人，每人分到多少分鐘？（用分數表示）`);
      summaryAnswers.push(`${e522PlainFraction(minutes, people)}分鐘`);
      answers.push(
        `簡答：${e522PlainFraction(minutes, people)}分鐘。過程：平均分就是除法，所以 ${minutes} ÷ ${people} = ${e522LatexFraction(minutes, people)} 分鐘。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE522MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const bank = banks[randInt(0, banks.length - 1)];
      const built = bank(1);
      questions.push(built.questions[0]);
      summaryAnswers.push((built.summaryAnswers || [''])[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE522MultiplyFourSet(count) {
    return buildE522MixedSet(
      [
        buildE522IntegerFractionMultiplySet,
        buildE522IntegerMixedMultiplySet,
        buildE522FractionFractionMultiplySet,
        buildE522CrossCancelMultiplySet,
      ],
      count
    );
  }

  function buildE522AmountThreeSet(count) {
    return buildE522MixedSet(
      [
        buildE522DiscreteFractionOfQuantitySet,
        buildE522ContinuousFractionApplicationSet,
        buildE522FractionOfFractionSet,
      ],
      count
    );
  }

  function buildE522QuotientThreeSet(count) {
    return buildE522MixedSet(
      [buildE522QuotientFractionSet, buildE522QuotientDecimalSet, buildE522QuotientEstimateSet],
      count
    );
  }

  function buildE522CompareTwoSet(count) {
    return buildE522MixedSet([buildE522ProductCompareSet, buildE522DivideByPowersSet], count);
  }

  function buildE522DivisionApplicationTwoSet(count) {
    return buildE522MixedSet([buildE522FractionDivideIntegerSet, buildE522MultiStepApplicationSet], count);
  }

  function e526FormatNumber(value, digits = 6) {
    return trimDecimalString(Number(value.toFixed(digits)).toString());
  }

  // ─── e5-2-2 新增 generators ───────────────────────────────────────────────

  // 帶分數 × 帶分數
  function buildE522MixedMixedMultiplySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // 預先確認答案為整數或簡單分數的帶分數對
    const cases = [
      { w1: 1, n1: 3, d1: 4, w2: 2, n2: 2, d2: 7 },   // 7/4 × 16/7 = 4
      { w1: 1, n1: 2, d1: 3, w2: 2, n2: 1, d2: 4 },   // 5/3 × 9/4 = 15/4 = 3又3/4
      { w1: 3, n1: 1, d1: 2, w2: 1, n2: 1, d2: 7 },   // 7/2 × 8/7 = 4
      { w1: 4, n1: 1, d1: 5, w2: 1, n2: 2, d2: 7 },   // 21/5 × 9/7 = 27/5 = 5又2/5
      { w1: 1, n1: 1, d1: 2, w2: 2, n2: 2, d2: 3 },   // 3/2 × 8/3 = 4
      { w1: 2, n1: 1, d1: 4, w2: 1, n2: 2, d2: 9 },   // 9/4 × 11/9 = 11/4 = 2又3/4
      { w1: 1, n1: 4, d1: 5, w2: 2, n2: 1, d2: 9 },   // 9/5 × 19/9 = 19/5 = 3又4/5
      { w1: 3, n1: 1, d1: 3, w2: 1, n2: 1, d2: 5 },   // 10/3 × 6/5 = 4
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      const imp1 = c.w1 * c.d1 + c.n1;  // 轉假分數分子
      const imp2 = c.w2 * c.d2 + c.n2;
      // 計算結果：(imp1/d1) × (imp2/d2)
      const numProd = imp1 * imp2;
      const denProd = c.d1 * c.d2;
      const g = gcdInt(numProd, denProd);
      const rn = numProd / g;
      const rd = denProd / g;
      let ansStr, shortStr;
      if (rd === 1) {
        ansStr = `${rn}`;
        shortStr = `${rn}`;
      } else if (rn > rd) {
        const w = Math.floor(rn / rd);
        const rem = rn % rd;
        ansStr = rem === 0 ? `${w}` : e522Inline(`${w}${e522LatexFraction(rem, rd)}`);
        shortStr = rem === 0 ? `${w}` : `${w}又${rem}/${rd}`;
      } else {
        ansStr = e522Inline(e522LatexFraction(rn, rd));
        shortStr = `${rn}/${rd}`;
      }
      const q1 = `${c.w1}${e522LatexFraction(c.n1, c.d1)}`;
      const q2 = `${c.w2}${e522LatexFraction(c.n2, c.d2)}`;
      questions.push(`計算：${e522Inline(`${q1} \\times ${q2}`)}`);
      summaryAnswers.push(shortStr);
      answers.push(formatPracticeShortAnswer(shortStr,
        `先將帶分數化為假分數：${e522Inline(`${q1} = ${e522LatexFraction(imp1,c.d1)}`)}，${e522Inline(`${q2} = ${e522LatexFraction(imp2,c.d2)}`)}，再相乘並約分得 ${ansStr}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  // 三個分數（含帶分數或整數）連乘，含交叉約分
  function buildE522TripleMultiplySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // 預先選好答案整潔的案例
    const cases = [
      { nums: [2, 9, 5],  dens: [3, 10, 8],  ans: '3/4' },
      { nums: [1, 2, 3],  dens: [2, 3, 4],   ans: '1/4' },
      { nums: [11,6, 14], dens: [12,7, 33],  ans: '1/3' },
      { nums: [2, 5, 4],  dens: [5, 8, 7],   ans: '1/7' },
      { nums: [3, 8, 5],  dens: [4, 9, 6],   ans: '5/9' },
      { nums: [7, 8, 3],  dens: [12,21, 4],  ans: '1/6' },
      { nums: [3, 4, 1],  dens: [4, 9, 2],   ans: '1/6' },
      { nums: [2, 3, 3],  dens: [3, 5, 4],   ans: '3/10' },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      const parts = c.nums.map((n, k) => e522LatexFraction(n, c.dens[k]));
      const expr = parts.join(' \\times ');
      questions.push(`計算：${e522Inline(expr)}`);
      summaryAnswers.push(c.ans);
      answers.push(formatPracticeShortAnswer(c.ans,
        `利用交叉約分，分子分母間先消去公因數，再相乘，結果為 ${e522Inline(c.ans.includes('/') ? e522LatexFraction(...c.ans.split('/').map(Number)) : c.ans)}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  // 混合四則（含乘法與加減，需注意運算順序）
  function buildE522AddMultiplyMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // 預先準備好有整潔答案的算式
    const cases = [
      // 先乘後加/減
      { expr: '\\frac{3}{4} \\times \\frac{8}{9} - \\frac{1}{3}',   ans: '1/3',  proc: '先算 3/4×8/9=2/3，再 2/3-1/3=1/3' },
      { expr: '\\frac{5}{7} \\times \\frac{14}{15} + \\frac{1}{3}', ans: '2/3',  proc: '先算 5/7×14/15=2/3，再 2/3+1/3=1（等於1）' },
      { expr: '\\frac{3}{8} + \\frac{5}{6} \\times \\frac{9}{10}',  ans: '7/8',  proc: '先算 5/6×9/10=3/4，再 3/8+3/4=9/8=1又1/8' },
      { expr: '1 - \\frac{2}{5} \\times \\frac{5}{8}',              ans: '3/4',  proc: '先算 2/5×5/8=1/4，再 1-1/4=3/4' },
      { expr: '\\frac{5}{8} \\times 4 + \\frac{1}{2} \\times 8',    ans: '6又1/2', proc: '5/8×4=5/2，1/2×8=4，再 5/2+4=13/2=6又1/2' },
      // 括號先加後乘
      { expr: '\\left(\\frac{1}{2} + \\frac{1}{3}\\right) \\times \\frac{6}{5}', ans: '1', proc: '先算 1/2+1/3=5/6，再 5/6×6/5=1' },
      { expr: '\\left(\\frac{3}{4} - \\frac{1}{2}\\right) \\times \\frac{8}{9}', ans: '2/9', proc: '先算 3/4-1/2=1/4，再 1/4×8/9=2/9' },
      { expr: '\\left(\\frac{1}{2} + \\frac{1}{3} + \\frac{1}{4}\\right) \\times 12', ans: '13', proc: '先算 1/2+1/3+1/4=13/12，再 13/12×12=13' },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      questions.push(`計算：${e522Inline(c.expr)}`);
      summaryAnswers.push(c.ans);
      answers.push(formatPracticeShortAnswer(c.ans, `${c.proc}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  // 剩餘量應用（用了X分之Y，剩下多少）
  function buildE522RemainderApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { total: 30, fracN: 2, fracD: 5, ctx: '一條繩子長 $30$ 公尺，用了 $\\frac{2}{5}$', unit: '公尺', used: 12, rem: 18, usedFrac: '2/5' },
      { total: 24, fracN: 3, fracD: 8, ctx: '一袋麵粉重 $24$ 公斤，用了 $\\frac{3}{8}$', unit: '公斤', used: 9, rem: 15, usedFrac: '3/8' },
      { total: 45, fracN: 2, fracD: 9, ctx: '花圃有 $45$ 株花，凋謝了 $\\frac{2}{9}$', unit: '株', used: 10, rem: 35, usedFrac: '2/9' },
      { total: 60, fracN: 3, fracD: 4, ctx: '一桶油有 $60$ 公升，用了 $\\frac{3}{4}$', unit: '公升', used: 45, rem: 15, usedFrac: '3/4' },
      { total: 36, fracN: 5, fracD: 9, ctx: '書架上有 $36$ 本書，借出了 $\\frac{5}{9}$', unit: '本', used: 20, rem: 16, usedFrac: '5/9' },
      { total: 40, fracN: 3, fracD: 5, ctx: '一桶水有 $40$ 公升，用了 $\\frac{3}{5}$', unit: '公升', used: 24, rem: 16, usedFrac: '3/5' },
      { total: 50, fracN: 2, fracD: 5, ctx: '工廠生產了 $50$ 個零件，出貨了 $\\frac{2}{5}$', unit: '個', used: 20, rem: 30, usedFrac: '2/5' },
      { total: 56, fracN: 3, fracD: 7, ctx: '一包糖果有 $56$ 顆，分出了 $\\frac{3}{7}$', unit: '顆', used: 24, rem: 32, usedFrac: '3/7' },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      questions.push(`${c.ctx}，還剩下多少${c.unit}？`);
      summaryAnswers.push(`${c.rem} ${c.unit}`);
      answers.push(formatPracticeShortAnswer(`${c.rem} ${c.unit}`,
        `用了 ${c.total} × ${e522Inline(e522LatexFraction(c.fracN,c.fracD))} = ${c.used} ${c.unit}，剩下 ${c.total} - ${c.used} = ${c.rem} ${c.unit}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  // 兩步驟消耗應用（先用X分之Y，再用剩下的P分之Q）
  function buildE522TwoStepConsumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { total: 1, f1n: 1, f1d: 3, f2n: 1, f2d: 2, ctx: '一本書，第一天讀了全書的 $\\frac{1}{3}$，第二天讀了剩下的 $\\frac{1}{2}$', rem: '1/6', proc: '剩 1-1/3=2/3；再用 2/3×1/2=1/3；最後剩 2/3-1/3=1/3（或 1×2/3×1/2=1/3→剩1-1/3-1/3=1/3）' },
      { total: 1, f1n: 1, f1d: 4, f2n: 1, f2d: 3, ctx: '一條布料，剪去了 $\\frac{1}{4}$，再剪去剩下的 $\\frac{1}{3}$', rem: '1/2', proc: '剩 3/4；再用 3/4×1/3=1/4；最後剩 3/4-1/4=1/2' },
      { total: 60, f1n: 1, f1d: 3, f2n: 1, f2d: 2, ctx: '一桶水有 $60$ 公升，先倒出 $\\frac{1}{3}$，再倒出剩下的 $\\frac{1}{2}$', rem: 20, proc: '剩 60×2/3=40；再倒 40×1/2=20；最後剩 20 公升', unit: '公升' },
      { total: 1, f1n: 2, f1d: 5, f2n: 1, f2d: 2, ctx: '一塊蛋糕，小明吃了 $\\frac{2}{5}$，媽媽吃了剩下的 $\\frac{1}{2}$', rem: '3/10', proc: '剩 3/5；媽媽吃 3/5×1/2=3/10；最後剩 3/5-3/10=3/10' },
      { total: 1, f1n: 1, f1d: 5, f2n: 1, f2d: 4, ctx: '一段繩子，第一次剪去 $\\frac{1}{5}$，第二次剪去剩下的 $\\frac{1}{4}$', rem: '3/5', proc: '剩 4/5；再剪 4/5×1/4=1/5；最後剩 4/5-1/5=3/5' },
      { total: 48, f1n: 1, f1d: 4, f2n: 1, f2d: 3, ctx: '箱子裡有 $48$ 顆糖，先分出 $\\frac{1}{4}$，再分出剩下的 $\\frac{1}{3}$', rem: 24, proc: '剩 48×3/4=36；再分 36×1/3=12；最後剩 36-12=24 顆', unit: '顆' },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      const remStr = typeof c.rem === 'number' ? `${c.rem} ${c.unit}` : (c.rem.includes('/') ? e522Inline(e522LatexFraction(...c.rem.split('/').map(Number))) : c.rem);
      const remShort = typeof c.rem === 'number' ? `${c.rem} ${c.unit}` : c.rem;
      questions.push(`${c.ctx}，最後還剩下多少${typeof c.rem === 'number' ? c.unit : '（用分率表示）'}？`);
      summaryAnswers.push(remShort);
      answers.push(formatPracticeShortAnswer(remShort, `${c.proc}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  // e5-2-2 新三小類綜合
  function buildE522NewThreeSet(count) {
    return buildE522MixedSet([buildE522MixedMixedMultiplySet, buildE522TripleMultiplySet, buildE522AddMultiplyMixedSet], count);
  }

  // ─── e5-2-2 新增 generators 結束 ─────────────────────────────────────────

  function e526FractionLatex(numerator, denominator) {
    return `\\frac{${numerator}}{${denominator}}`;
  }

  function e526MixedLatex(whole, numerator, denominator) {
    return `${whole}${e526FractionLatex(numerator, denominator)}`;
  }

  function e526FiniteDecimalBank() {
    return [
      0.02, 0.03, 0.04, 0.05, 0.08, 0.09, 0.12, 0.15, 0.2, 0.24, 0.25, 0.3, 0.35, 0.4, 0.45, 0.48, 0.5, 0.6, 0.72, 0.75,
      0.8, 0.84, 0.96, 1.04, 1.08, 1.09, 1.2, 1.25, 1.4, 1.5, 1.75, 2.08, 2.25, 2.4, 2.5, 3.15, 3.2, 3.6, 4.05, 4.8,
    ];
  }

  function buildE526IntegerDivideDecimalSet(count) {
    const divisors = [4, 5, 6, 8, 10, 12, 16, 20, 24, 25, 40, 50, 125];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      let divisor = pickFromList(divisors);
      let quotient = pickFromList(e526FiniteDecimalBank());
      let dividend = quotient * divisor;
      while (!Number.isInteger(dividend) || Number.isInteger(quotient)) {
        divisor = pickFromList(divisors);
        quotient = pickFromList(e526FiniteDecimalBank());
        dividend = quotient * divisor;
      }
      questions.push(`計算：${dividend} ÷ ${divisor}。`);
      summaryAnswers.push(`${e526FormatNumber(quotient)}`);
      answers.push(
        `簡答：${e526FormatNumber(quotient)}。過程：${dividend} ÷ ${divisor} 不能整除時，要在個位後補小數點與 0 繼續除，最後得到 ${e526FormatNumber(quotient)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE526DecimalDivideIntegerSet(count) {
    const divisors = [2, 4, 5, 6, 8, 10, 12, 16, 20, 25];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const divisor = pickFromList(divisors);
      const quotient = pickFromList(e526FiniteDecimalBank());
      const dividend = Number((quotient * divisor).toFixed(3));
      if (Number.isInteger(dividend)) {
        i -= 1;
        continue;
      }
      questions.push(`計算：${e526FormatNumber(dividend)} ÷ ${divisor}。`);
      summaryAnswers.push(`${e526FormatNumber(quotient)}`);
      answers.push(
        `簡答：${e526FormatNumber(quotient)}。過程：把商的小數點和被除數的小數位對齊，直接做除法，可得 ${e526FormatNumber(dividend)} ÷ ${divisor} = ${e526FormatNumber(quotient)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE526QuotientZeroGapSet(count) {
    const quotientBank = [0.02, 0.04, 0.06, 0.08, 0.09, 0.105, 0.108, 1.04, 1.05, 1.09, 1.25, 2.08];
    const divisorBank = [4, 5, 6, 7, 8, 9, 10, 12];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      let quotient = pickFromList(quotientBank);
      let divisor = pickFromList(divisorBank);
      let dividend = Number((quotient * divisor).toFixed(3));
      while (Number.isInteger(dividend)) {
        quotient = pickFromList(quotientBank);
        divisor = pickFromList(divisorBank);
        dividend = Number((quotient * divisor).toFixed(3));
      }
      questions.push(`計算：${e526FormatNumber(dividend)} ÷ ${divisor}。`);
      summaryAnswers.push(`${e526FormatNumber(quotient)}`);
      answers.push(
        `簡答：${e526FormatNumber(quotient)}。過程：做除法時，如果某一位不夠除，商要補 0 佔位，再把下一位帶下來，所以答案是 ${e526FormatNumber(quotient)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE526FractionToDecimalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modes = [
      { numerator: 13, denominator: 4, text: `13 ÷ 4`, answer: 3.25 },
      { numerator: 4, denominator: 5, text: `4 ÷ 5`, answer: 0.8 },
      { numerator: 3, denominator: 8, text: `3 ÷ 8`, answer: 0.375 },
      { whole: 2, numerator: 7, denominator: 8, text: `2 + 7 ÷ 8`, answer: 2.875 },
      { whole: 5, numerator: 13, denominator: 25, text: `5 + 13 ÷ 25`, answer: 5.52 },
      { numerator: 21, denominator: 6, text: `21 ÷ 6`, answer: 3.5 },
      { numerator: 15, denominator: 8, text: `15 ÷ 8`, answer: 1.875 },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = modes[i % modes.length];
      const questionText =
        item.whole != null
          ? `${e526MixedLatex(item.whole, item.numerator, item.denominator)}`
          : `${e526FractionLatex(item.numerator, item.denominator)}`;
      questions.push(`把 ${questionText} 化成小數。`);
      summaryAnswers.push(`${e526FormatNumber(item.answer)}`);
      answers.push(
        `簡答：${e526FormatNumber(item.answer)}。過程：分數化小數就是做除法，${item.text} = ${e526FormatNumber(item.answer)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE526DivideByPowersSet(count) {
    const divisors = [10, 100, 1000];
    const values = [4.9, 7.83, 12.3, 56.4, 64.9, 72.4, 81.9, 123, 235, 502, 572];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const divisor = divisors[i % divisors.length];
      const value = pickFromList(values);
      const answer = value / divisor;
      questions.push(`不必直式，直接計算：${e526FormatNumber(value)} ÷ ${divisor}。`);
      summaryAnswers.push(`${e526FormatNumber(answer)}`);
      answers.push(
        `簡答：${e526FormatNumber(answer)}。過程：除以 ${divisor} 就是把小數點向左移 ${String(divisor).length - 1} 位，所以答案是 ${e526FormatNumber(answer)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE526RoundingSet(count) {
    const bank = [
      { dividend: 1.3, divisor: 3, digits: 2 },
      { dividend: 12.2, divisor: 7, digits: 1 },
      { dividend: 5.35, divisor: 15, digits: 2 },
      { dividend: 23.12, divisor: 6, digits: 1 },
      { dividend: 9.8, divisor: 9, digits: 2 },
      { dividend: 22.39, divisor: 21, digits: 2 },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = bank[i % bank.length];
      const digitsText = item.digits === 1 ? '小數點後第一位' : '小數點後第二位';
      const answer = Number((item.dividend / item.divisor).toFixed(item.digits));
      questions.push(`計算：${e526FormatNumber(item.dividend)} ÷ ${item.divisor}，取概數到${digitsText}。`);
      summaryAnswers.push(`${e526FormatNumber(answer)}`);
      answers.push(
        `簡答：${e526FormatNumber(answer)}。過程：先做除法，再依題意四捨五入到${digitsText}，所以答案是 ${e526FormatNumber(answer)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE526EqualSharingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      { total: 12, unit: '公斤的綠豆', groups: 16, answer: 0.75, resultUnit: '公斤' },
      { total: 2, unit: '公升的牛奶', groups: 5, answer: 0.4, resultUnit: '公升' },
      { total: 35, unit: '公升的青草茶', groups: 56, answer: 0.625, resultUnit: '公升' },
      { total: 0.14, unit: '公升的黑麥汁', groups: 7, answer: 0.02, resultUnit: '公升' },
      { total: 9, unit: '公尺的繩子', groups: 4, answer: 2.25, resultUnit: '公尺' },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = bank[i % bank.length];
      questions.push(
        `把 ${e526FormatNumber(item.total)} ${item.unit}平均分成 ${item.groups} 份，每一份是多少${item.resultUnit}？`
      );
      summaryAnswers.push(`${e526FormatNumber(item.answer)}${item.resultUnit}`);
      answers.push(
        `簡答：${e526FormatNumber(item.answer)}${item.resultUnit}。過程：平均分就是用總量除以份數，所以 ${e526FormatNumber(item.total)} ÷ ${item.groups} = ${e526FormatNumber(item.answer)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE526GeometryDimensionSet(count) {
    const bank = [
      {
        question: '一個正方形花圃的周長是 25 公尺，每邊長是多少公尺？',
        answer: 6.25,
        explain: '正方形每邊長 = 周長 ÷ 4，所以 25 ÷ 4 = 6.25。',
        unit: '公尺',
      },
      {
        question: '長方形面積是 15.4 平方公分，長是 4 公分，寬是多少公分？',
        answer: 3.85,
        explain: '寬 = 面積 ÷ 長，所以 15.4 ÷ 4 = 3.85。',
        unit: '公分',
      },
      {
        question: '一條長 18 公尺的繩子平均分成 8 段，每段長幾公尺？',
        answer: 2.25,
        explain: '每段長 = 總長 ÷ 段數，所以 18 ÷ 8 = 2.25。',
        unit: '公尺',
      },
      {
        question: '一個長方形花圃面積是 87.01 平方公尺，長是 14 公尺，寬是多少公尺？',
        answer: 6.215,
        explain: '寬 = 面積 ÷ 長，所以 87.01 ÷ 14 = 6.215。',
        unit: '公尺',
      },
      {
        question: '一個長方形花園的周長是 65 公尺，若長與寬相等，邊長是多少公尺？',
        answer: 16.25,
        explain: '四條邊一樣長，所以每邊長 = 65 ÷ 4 = 16.25。',
        unit: '公尺',
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = bank[i % bank.length];
      questions.push(item.question);
      summaryAnswers.push(`${e526FormatNumber(item.answer)}${item.unit}`);
      answers.push(`簡答：${e526FormatNumber(item.answer)}${item.unit}。過程：${item.explain}`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE526AverageUnitSet(count) {
    const bank = [
      { question: '14 盒梨子重 32.48 公斤，平均一盒梨子重多少公斤？', answer: 2.32, unit: '公斤' },
      { question: '水龍頭 15 小時可以流出 109.95 公升的水，平均一小時流出多少公升？', answer: 7.33, unit: '公升' },
      { question: '18 臺洗衣機共重 135.45 公斤，平均一臺重幾公斤？', answer: 7.525, unit: '公斤' },
      { question: '19 個螺絲共重 39.52 克，平均一個螺絲重幾克？', answer: 2.08, unit: '克' },
      { question: '甲商店 4 杯紅茶賣 54 元，平均一杯幾元？', answer: 13.5, unit: '元' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = bank[i % bank.length];
      questions.push(item.question);
      summaryAnswers.push(`${e526FormatNumber(item.answer)}${item.unit}`);
      answers.push(
        `簡答：${e526FormatNumber(item.answer)}${item.unit}。過程：平均每 1 單位是多少，就是用總量除以總份數，所以答案是 ${e526FormatNumber(item.answer)}${item.unit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE526TimeUnitConvertSet(count) {
    const bank = [
      {
        question: '看一部電影花了 135 分鐘，135 分鐘是幾小時？（用小數表示）',
        answer: 2.25,
        explain: '1 小時 = 60 分，所以 135 ÷ 60 = 2.25 小時。',
        unit: '小時',
      },
      {
        question: '弟弟參加活動 30 小時才達成，30 小時也可以說是幾日？',
        answer: 1.25,
        explain: '1 日 = 24 小時，所以 30 ÷ 24 = 1.25 日。',
        unit: '日',
      },
      {
        question: '看展走路上學花了 9 分鐘，也可以說是幾時？',
        answer: 0.15,
        explain: '1 小時 = 60 分，所以 9 ÷ 60 = 0.15 小時。',
        unit: '小時',
      },
      {
        question: '15 秒鐘是多少分鐘？（用小數表示）',
        answer: 0.25,
        explain: '1 分鐘 = 60 秒，所以 15 ÷ 60 = 0.25 分鐘。',
        unit: '分鐘',
      },
      {
        question: '爸爸開車環島花了 36 小時完成，也就是花了幾日？',
        answer: 1.5,
        explain: '1 日 = 24 小時，所以 36 ÷ 24 = 1.5 日。',
        unit: '日',
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = bank[i % bank.length];
      questions.push(item.question);
      summaryAnswers.push(`${e526FormatNumber(item.answer)}${item.unit}`);
      answers.push(`簡答：${e526FormatNumber(item.answer)}${item.unit}。過程：${item.explain}`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE526MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = banks[randInt(0, banks.length - 1)](1);
      questions.push(built.questions[0]);
      summaryAnswers.push((built.summaryAnswers || [''])[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE526BasicThreeSet(count) {
    return buildE526MixedSet(
      [buildE526IntegerDivideDecimalSet, buildE526DecimalDivideIntegerSet, buildE526QuotientZeroGapSet],
      count
    );
  }

  function buildE526ConvertTwoSet(count) {
    return buildE526MixedSet([buildE526FractionToDecimalSet, buildE526DivideByPowersSet], count);
  }

  function buildE526RoundingOneSet(count) {
    return buildE526MixedSet([buildE526RoundingSet], count);
  }

  function buildE526ApplicationThreeSet(count) {
    return buildE526MixedSet([buildE526EqualSharingSet, buildE526GeometryDimensionSet, buildE526AverageUnitSet], count);
  }

  function buildE526TimeOneSet(count) {
    return buildE526MixedSet([buildE526TimeUnitConvertSet], count);
  }

  function e527FormatNumber(value, digits = 2) {
    if (Number.isInteger(value)) return `${value}`;
    return trimDecimalString(Number(value.toFixed(digits)).toString());
  }

  function e527Answer(shortAnswer, process) {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function buildE527CubeEdgeSurfaceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const edges = [3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20];
    for (let i = 0; i < count; i += 1) {
      const edge = pickFromList(edges);
      const surface = 6 * edge * edge;
      questions.push(`一個正方體的邊長是 $${edge}$ 公分，表面積是多少平方公分？`);
      summaryAnswers.push(`$${surface}$ 平方公分`);
      answers.push(
        e527Answer(
          `$${surface}$ 平方公分`,
          `正方體有 $6$ 個全等的正方形面，每一面的面積是 $${edge}\\times${edge}=${edge * edge}$，所以表面積是 $${edge * edge}\\times6=${surface}$ 平方公分。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527CubeFaceAreaSurfaceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const faceAreas = [9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 225];
    for (let i = 0; i < count; i += 1) {
      const faceArea = pickFromList(faceAreas);
      const surface = faceArea * 6;
      questions.push(`一個正方體其中一個面的面積是 $${faceArea}$ 平方公分，它的表面積是多少平方公分？`);
      summaryAnswers.push(`$${surface}$ 平方公分`);
      answers.push(
        e527Answer(
          `$${surface}$ 平方公分`,
          `正方體 $6$ 個面的面積都相等，所以表面積 $= ${faceArea}\\times6 = ${surface}$ 平方公分。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527CubeInverseEdgeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const edges = [2, 3, 4, 5, 6, 8, 10];
    for (let i = 0; i < count; i += 1) {
      const edge = pickFromList(edges);
      const faceArea = edge * edge;
      const surface = faceArea * 6;
      questions.push(`一個正方體的表面積是 $${surface}$ 平方公分，它的邊長是多少公分？`);
      summaryAnswers.push(`$${edge}$ 公分`);
      answers.push(
        e527Answer(
          `$${edge}$ 公分`,
          `先用表面積除以 $6$，求出一個面的面積：$${surface}\\div6=${faceArea}$。再因為正方形面積 $= 邊長\\times邊長$，所以邊長是 $${edge}$ 公分。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527RectSurfaceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const triples = [
      [7, 4, 3],
      [12, 8, 5],
      [14, 8, 10],
      [15, 6, 4],
      [13, 6, 10],
      [10, 6, 9],
      [16, 9, 4],
    ];
    for (let i = 0; i < count; i += 1) {
      const [length, width, height] = pickFromList(triples);
      const surface = 2 * (length * width + width * height + length * height);
      questions.push(`一個長方體的長、寬、高分別是 $${length}$、$${width}$、$${height}$ 公分，表面積是多少平方公分？`);
      summaryAnswers.push(`$${surface}$ 平方公分`);
      answers.push(
        e527Answer(
          `$${surface}$ 平方公分`,
          `長方體表面積 $=2\\times(長\\times寬+寬\\times高+長\\times高)$，所以 $2\\times(${length}\\times${width}+${width}\\times${height}+${length}\\times${height})=${surface}$ 平方公分。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527SpecialRectSurfaceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const pairs = [
      [5, 8],
      [6, 10],
      [7, 12],
      [8, 15],
      [9, 5],
      [6, 11],
    ];
    for (let i = 0; i < count; i += 1) {
      const [side, height] = pickFromList(pairs);
      const squareFace = side * side;
      const rectFace = side * height;
      const surface = 2 * squareFace + 4 * rectFace;
      questions.push(`一個長方體的底面是邊長 $${side}$ 公分的正方形，高是 $${height}$ 公分，表面積是多少平方公分？`);
      summaryAnswers.push(`$${surface}$ 平方公分`);
      answers.push(
        e527Answer(
          `$${surface}$ 平方公分`,
          `這種長方體有 $2$ 個正方形面與 $4$ 個一樣大的長方形面。正方形面積是 $${side}\\times${side}=${squareFace}$，長方形面積是 $${side}\\times${height}=${rectFace}$，所以表面積 $=2\\times${squareFace}+4\\times${rectFace}=${surface}$ 平方公分。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527VolumeToSurfaceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const triples = [
      [9, 8, 2],
      [10, 5, 6],
      [12, 4, 5],
      [14, 3, 4],
      [15, 6, 2],
      [16, 4, 3],
    ];
    for (let i = 0; i < count; i += 1) {
      const [length, width, height] = pickFromList(triples);
      const volume = length * width * height;
      const surface = 2 * (length * width + width * height + length * height);
      const variant = i % 3;
      if (variant === 0) {
        questions.push(
          `一個長方體的體積是 $${volume}$ 立方公分，長是 $${length}$ 公分、寬是 $${width}$ 公分，表面積是多少平方公分？`
        );
        summaryAnswers.push(`$${surface}$ 平方公分`);
        answers.push(
          e527Answer(
            `$${surface}$ 平方公分`,
            `先求高：$${volume}\\div${length}\\div${width}=${height}$。再算表面積：$2\\times(${length}\\times${width}+${width}\\times${height}+${length}\\times${height})=${surface}$ 平方公分。`
          )
        );
      } else if (variant === 1) {
        questions.push(
          `一個長方體的體積是 $${volume}$ 立方公分，長是 $${length}$ 公分、高是 $${height}$ 公分，表面積是多少平方公分？`
        );
        summaryAnswers.push(`$${surface}$ 平方公分`);
        answers.push(
          e527Answer(
            `$${surface}$ 平方公分`,
            `先求寬：$${volume}\\div${length}\\div${height}=${width}$。再算表面積：$2\\times(${length}\\times${width}+${width}\\times${height}+${length}\\times${height})=${surface}$ 平方公分。`
          )
        );
      } else {
        questions.push(
          `一個長方體的體積是 $${volume}$ 立方公分，寬是 $${width}$ 公分、高是 $${height}$ 公分，表面積是多少平方公分？`
        );
        summaryAnswers.push(`$${surface}$ 平方公分`);
        answers.push(
          e527Answer(
            `$${surface}$ 平方公分`,
            `先求長：$${volume}\\div${width}\\div${height}=${length}$。再算表面積：$2\\times(${length}\\times${width}+${width}\\times${height}+${length}\\times${height})=${surface}$ 平方公分。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527FullCoverApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = ['包裝紙盒', '木箱外面塗漆', '禮盒外層彩繪', '石材六面磨光'];
    const triples = [
      [24, 10, 8],
      [15, 12, 10],
      [10, 4, 5],
      [100, 80, 20],
      [18, 12, 6],
    ];
    for (let i = 0; i < count; i += 1) {
      const [length, width, height] = pickFromList(triples);
      const context = contexts[i % contexts.length];
      const surface = 2 * (length * width + width * height + length * height);
      questions.push(
        `一個長方體要做「${context}」，長 $${length}$ 公分、寬 $${width}$ 公分、高 $${height}$ 公分，全部外表面共需要多少平方公分？`
      );
      summaryAnswers.push(`$${surface}$ 平方公分`);
      answers.push(
        e527Answer(
          `$${surface}$ 平方公分`,
          `這題是算全部外表面，所以用長方體表面積公式：$2\\times(${length}\\times${width}+${width}\\times${height}+${length}\\times${height})=${surface}$ 平方公分。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527LateralWrapSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const triples = [
      [10, 10, 12],
      [12, 4, 5],
      [24, 8.5, 10],
      [15, 6, 9],
      [18, 10, 12],
    ];
    for (let i = 0; i < count; i += 1) {
      const [length, width, height] = pickFromList(triples);
      const lateral = 2 * (length + width) * height;
      questions.push(
        `一個長方體盒子長 $${length}$ 公分、寬 $${width}$ 公分、高 $${height}$ 公分，只在側面繞一圈貼上包裝紙，包裝紙面積是多少平方公分？`
      );
      summaryAnswers.push(`$${e527FormatNumber(lateral)}$ 平方公分`);
      answers.push(
        e527Answer(
          `$${e527FormatNumber(lateral)}$ 平方公分`,
          `只貼側面一圈，不含上下面，所以面積 $= 底面周長\\times高 = 2\\times(${length}+${width})\\times${height}=${e527FormatNumber(lateral)}$ 平方公分。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527CutIncreaseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const items = [
      [7, 2],
      [10, 2],
      [10, 3],
      [15, 3],
      [20, 2],
      [20, 4],
    ];
    for (let i = 0; i < count; i += 1) {
      const [edge, parts] = pickFromList(items);
      const increase = 2 * (parts - 1) * edge * edge;
      questions.push(
        `把一個邊長 $${edge}$ 公分的正方體平均切成 $${parts}$ 個一樣大的長方體，表面積共增加多少平方公分？`
      );
      summaryAnswers.push(`$${increase}$ 平方公分`);
      answers.push(
        e527Answer(
          `$${increase}$ 平方公分`,
          `每切一刀都會多出 $2$ 個切面，每個切面的面積是 $${edge}\\times${edge}=${edge * edge}$。平均切成 $${parts}$ 塊需要切 $${parts - 1}$ 刀，所以共增加 $2\\times${edge * edge}\\times${parts - 1}=${increase}$ 平方公分。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527MergeDecreaseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const items = [
      [2, 5],
      [3, 5],
      [4, 5],
      [5, 4],
      [3, 8],
    ];
    for (let i = 0; i < count; i += 1) {
      const [cubeCount, edge] = pickFromList(items);
      const decrease = 2 * (cubeCount - 1) * edge * edge;
      questions.push(
        `把 $${cubeCount}$ 個邊長 $${edge}$ 公分的正方體排成一直排黏在一起，新立體的表面積比原來共減少多少平方公分？`
      );
      summaryAnswers.push(`$${decrease}$ 平方公分`);
      answers.push(
        e527Answer(
          `$${decrease}$ 平方公分`,
          `每多黏住一次，就有 $2$ 個面被貼住看不見。每個面的面積是 $${edge}\\times${edge}=${edge * edge}$，一共貼住 $${cubeCount - 1}$ 次，所以共減少 $2\\times${edge * edge}\\times${cubeCount - 1}=${decrease}$ 平方公分。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527UnitCubeSurfaceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const dims = [
      [2, 5, 1],
      [4, 3, 2],
      [3, 2, 1],
      [2, 3, 3],
      [2, 3, 4],
      [1, 4, 6],
    ];
    for (let i = 0; i < count; i += 1) {
      const [length, width, height] = pickFromList(dims);
      const cubeCount = length * width * height;
      const surface = 2 * (length * width + width * height + length * height);
      questions.push(
        `用 $${cubeCount}$ 個邊長 $1$ 公分的正方體積木排成 $${length}\\times${width}\\times${height}$ 的長方體，表面積是多少平方公分？`
      );
      summaryAnswers.push(`$${surface}$ 平方公分`);
      answers.push(
        e527Answer(
          `$${surface}$ 平方公分`,
          `邊長都是 $1$ 公分，所以可直接把外形看成長方體。表面積 $=2\\times(${length}\\times${width}+${width}\\times${height}+${length}\\times${height})=${surface}$ 平方公分。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527ArrangementCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { volume: 16, a: [1, 2, 8], b: [2, 2, 4] },
      { volume: 18, a: [1, 3, 6], b: [2, 3, 3] },
      { volume: 24, a: [1, 4, 6], b: [2, 3, 4] },
      { volume: 12, a: [1, 2, 6], b: [2, 2, 3] },
      { volume: 8, a: [1, 1, 8], b: [2, 2, 2] },
    ];
    for (let i = 0; i < count; i += 1) {
      const { volume, a, b } = pickFromList(cases);
      const surfaceA = 2 * (a[0] * a[1] + a[1] * a[2] + a[0] * a[2]);
      const surfaceB = 2 * (b[0] * b[1] + b[1] * b[2] + b[0] * b[2]);
      const winner =
        surfaceA < surfaceB ? `乙（${b[0]}\\times${b[1]}\\times${b[2]}）` : `甲（${a[0]}\\times${a[1]}\\times${a[2]}）`;
      questions.push(
        `同樣用 $${volume}$ 個邊長 $1$ 公分的正方體積木排成立體。甲排成 $${a[0]}\\times${a[1]}\\times${a[2]}$，乙排成 $${b[0]}\\times${b[1]}\\times${b[2]}$，哪一個表面積較小？`
      );
      summaryAnswers.push(surfaceA < surfaceB ? winner : `乙（${b[0]}\\times${b[1]}\\times${b[2]}）`);
      answers.push(
        e527Answer(
          surfaceA < surfaceB ? `甲較小` : `乙較小`,
          `甲的表面積是 $2\\times(${a[0]}\\times${a[1]}+${a[1]}\\times${a[2]}+${a[0]}\\times${a[2]})=${surfaceA}$；乙的表面積是 $2\\times(${b[0]}\\times${b[1]}+${b[1]}\\times${b[2]}+${b[0]}\\times${b[2]})=${surfaceB}$，所以${surfaceA < surfaceB ? '甲' : '乙'}的表面積較小。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](4);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      summaryAnswers.push(generated.summaryAnswers[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527CubeThreeSet(count) {
    return buildE527MixedSet(
      [buildE527CubeEdgeSurfaceSet, buildE527CubeFaceAreaSurfaceSet, buildE527CubeInverseEdgeSet],
      count
    );
  }

  function buildE527RectThreeSet(count) {
    return buildE527MixedSet(
      [buildE527RectSurfaceSet, buildE527SpecialRectSurfaceSet, buildE527VolumeToSurfaceSet],
      count
    );
  }

  function buildE527LifeTwoSet(count) {
    return buildE527MixedSet([buildE527FullCoverApplicationSet, buildE527LateralWrapSet], count);
  }

  function buildE527CutMergeTwoSet(count) {
    return buildE527MixedSet([buildE527CutIncreaseSet, buildE527MergeDecreaseSet], count);
  }

  function buildE527BlockCompareTwoSet(count) {
    return buildE527MixedSet([buildE527UnitCubeSurfaceSet, buildE527ArrangementCompareSet], count);
  }

  function buildE527OpenTopRectSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { l: 20, w: 15, h: 10, ctx: '收納盒' },
      { l: 15, w: 10, h: 8,  ctx: '木盒' },
      { l: 12, w: 9,  h: 6,  ctx: '紙盒' },
      { l: 14, w: 10, h: 8,  ctx: '禮物盒' },
      { l: 18, w: 12, h: 8,  ctx: '抽屜' },
      { l: 12, w: 8,  h: 6,  ctx: '紙盒' },
      { l: 10, w: 8,  h: 5,  ctx: '收納盒' },
      { l: 25, w: 18, h: 12, ctx: '木箱' },
      { l: 16, w: 12, h: 7,  ctx: '紙盒' },
    ];
    for (let i = 0; i < count; i += 1) {
      const { l, w, h, ctx } = pickFromList(cases);
      const sa = l * w + 2 * l * h + 2 * w * h;
      questions.push(`製作一個無蓋的長方體${ctx}，長 $${l}$ 公分、寬 $${w}$ 公分、高 $${h}$ 公分，至少需要多少平方公分的材料？`);
      summaryAnswers.push(`$${sa}$ 平方公分`);
      answers.push(e527Answer(
        `$${sa}$ 平方公分`,
        `無蓋長方體只有 $5$ 個面（沒有上蓋）。面積 $=$ 底面積 $+$ 四個側面積 $=${l}\\times${w}+2\\times${l}\\times${h}+2\\times${w}\\times${h}=${l*w}+${2*l*h}+${2*w*h}=${sa}$ 平方公分。`
      ));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527OpenTopCubeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const edges = [3, 4, 5, 6, 7, 8, 9, 10, 12];
    const contexts = ['正方體紙盒', '正方體水槽', '正方體收納盒', '正方體花盆'];
    for (let i = 0; i < count; i += 1) {
      const edge = pickFromList(edges);
      const ctx = pickFromList(contexts);
      const sa = 5 * edge * edge;
      questions.push(`製作一個無蓋的${ctx}，邊長是 $${edge}$ 公分，至少需要多少平方公分的材料？`);
      summaryAnswers.push(`$${sa}$ 平方公分`);
      answers.push(e527Answer(
        `$${sa}$ 平方公分`,
        `無蓋正方體有 $5$ 個面，每個面的面積是 $${edge}\\times${edge}=${edge*edge}$，所以共需 $${edge*edge}\\times5=${sa}$ 平方公分。`
      ));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527InverseHeightSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // 已驗證：(SA/2 - l*w) / (l+w) = h 為整數
    const cases = [
      { l: 6,  w: 4, h: 5 },  // SA=148
      { l: 8,  w: 5, h: 3 },  // SA=158
      { l: 9,  w: 6, h: 4 },  // SA=228
      { l: 10, w: 6, h: 5 },  // SA=280
      { l: 7,  w: 5, h: 3 },  // SA=142
      { l: 10, w: 4, h: 6 },  // SA=248
      { l: 8,  w: 6, h: 4 },  // SA=208
      { l: 11, w: 7, h: 5 },  // SA=334
      { l: 12, w: 8, h: 6 },  // SA=432
      { l: 15, w: 10, h: 8 }, // SA=700
    ];
    for (let i = 0; i < count; i += 1) {
      const { l, w, h } = pickFromList(cases);
      const sa = 2 * (l * w + l * h + w * h);
      questions.push(`一個長方體的表面積是 $${sa}$ 平方公分，已知長是 $${l}$ 公分、寬是 $${w}$ 公分，請問它的高是多少公分？`);
      summaryAnswers.push(`$${h}$ 公分`);
      answers.push(e527Answer(
        `$${h}$ 公分`,
        `設高為 $h$，由表面積公式：$2\\times(${l}\\times${w}+${l}\\times h+${w}\\times h)=${sa}$，整理得 $2\\times(${l*w}+${l+w}h)=${sa}$，所以 $${l+w}h=${sa/2-l*w}$，高 $h=${h}$ 公分。`
      ));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527RoomWindowSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // 粉刷四面牆，扣除一扇門（2×1=2m²）和一扇窗（1.5×1=1.5m²）
    const rooms = [
      { l: 6,   w: 4,   h: 3   },  // walls=60, ans=56.5
      { l: 7,   w: 5,   h: 3   },  // walls=72, ans=68.5
      { l: 8,   w: 6,   h: 3   },  // walls=84, ans=80.5
      { l: 7,   w: 4,   h: 3   },  // walls=66, ans=62.5
      { l: 8,   w: 5,   h: 3   },  // walls=78, ans=74.5
      { l: 6,   w: 4,   h: 2.5 },  // walls=50, ans=46.5
      { l: 9,   w: 6,   h: 3   },  // walls=90, ans=86.5
      { l: 10,  w: 7,   h: 3   },  // walls=102, ans=98.5
    ];
    for (let i = 0; i < count; i += 1) {
      const { l, w, h } = pickFromList(rooms);
      const walls = 2 * h * (l + w);
      const doorArea = 2 * 1;
      const winArea = 1.5 * 1;
      const total = walls - doorArea - winArea;
      questions.push(
        `一間房間的長是 $${l}$ 公尺、寬是 $${w}$ 公尺、高是 $${h}$ 公尺。四面牆壁上有一扇門（長 $2$ 公尺、寬 $1$ 公尺）和一扇窗戶（長 $1.5$ 公尺、寬 $1$ 公尺）。若要粉刷四面牆壁（不包含門和窗戶的面積），粉刷面積是多少平方公尺？`
      );
      summaryAnswers.push(`$${e527FormatNumber(total)}$ 平方公尺`);
      answers.push(e527Answer(
        `$${e527FormatNumber(total)}$ 平方公尺`,
        `四面牆面積 $=$ 底面周長 $\\times$ 高 $=2\\times(${l}+${w})\\times${h}=${e527FormatNumber(walls)}$ 平方公尺。扣除門 $2\\times1=2$ 平方公尺和窗 $1.5\\times1=1.5$ 平方公尺，所以粉刷面積 $=${e527FormatNumber(walls)}-2-1.5=${e527FormatNumber(total)}$ 平方公尺。`
      ));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527DimChangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // 改變一個維度（長），求表面積的增減量
    // ΔSA = 2 × |Δl| × (w + h)
    const cases = [
      { l: 12, w: 6,  h: 4, delta: 4, dir: 'decrease' }, // ΔSA=80
      { l: 10, w: 6,  h: 4, delta: 3, dir: 'decrease' }, // ΔSA=60
      { l: 8,  w: 6,  h: 4, delta: 2, dir: 'increase' }, // ΔSA=40
      { l: 15, w: 8,  h: 5, delta: 5, dir: 'decrease' }, // ΔSA=130
      { l: 9,  w: 7,  h: 5, delta: 3, dir: 'increase' }, // ΔSA=72
      { l: 14, w: 10, h: 6, delta: 5, dir: 'decrease' }, // ΔSA=160
      { l: 10, w: 5,  h: 3, delta: 4, dir: 'decrease' }, // ΔSA=64
      { l: 8,  w: 4,  h: 3, delta: 2, dir: 'increase' }, // ΔSA=28
    ];
    for (let i = 0; i < count; i += 1) {
      const { l, w, h, delta, dir } = pickFromList(cases);
      const diffSA = 2 * delta * (w + h);
      const changeWord = dir === 'increase' ? '增加' : '減少';
      questions.push(
        `一個長方體，長 $${l}$ 公分、寬 $${w}$ 公分、高 $${h}$ 公分。若將長${changeWord} $${delta}$ 公分，寬和高不變，則表面積會${changeWord}多少平方公分？`
      );
      summaryAnswers.push(`${changeWord} $${diffSA}$ 平方公分`);
      answers.push(e527Answer(
        `${changeWord} $${diffSA}$ 平方公分`,
        `長改變 $${delta}$ 公分，影響到與長有關的 $4$ 個面（前後面和上下面各 $2$ 個）。表面積變化量 $=2\\times${delta}\\times(寬+高)=2\\times${delta}\\times(${w}+${h})=2\\times${delta}\\times${w+h}=${diffSA}$ 平方公分。`
      ));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE527OpenTopTwoSet(count) {
    return buildE527MixedSet([buildE527OpenTopRectSet, buildE527OpenTopCubeSet], count);
  }

  function buildE527InverseRoomTwoSet(count) {
    return buildE527MixedSet([buildE527InverseHeightSet, buildE527RoomWindowSet], count);
  }

  function e528FormatNumber(value, digits = 4) {
    if (Number.isInteger(value)) return `${value}`;
    return trimDecimalString(Number(value.toFixed(digits)).toString());
  }

  function e528PercentText(value, digits = 2) {
    return `${e528FormatNumber(value, digits)}%`;
  }

  function e528Answer(shortAnswer, process) {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function e528PickRateFraction() {
    const bank = [
      [1, 2],
      [1, 4],
      [3, 4],
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [1, 8],
      [3, 8],
      [5, 8],
      [7, 8],
      [3, 10],
      [7, 10],
      [9, 20],
      [13, 20],
      [17, 25],
      [21, 25],
      [3, 25],
      [7, 25],
      [3, 40],
      [11, 25],
      [31, 100],
    ];
    return pickFromList(bank);
  }

  function e528SimplifyFraction(numerator, denominator) {
    const divisor = gcd(Math.abs(numerator), Math.abs(denominator));
    return [numerator / divisor, denominator / divisor];
  }

  function e528FractionText(numerator, denominator) {
    const [top, bottom] = e528SimplifyFraction(numerator, denominator);
    return `${top}/${bottom}`;
  }

  function e528RateText(numerator, denominator) {
    const rate = numerator / denominator;
    return `${e528FractionText(numerator, denominator)}（也可寫成 ${e528FormatNumber(rate)}）`;
  }

  function e528BuildPartWholeContext() {
    const [num, den] = e528PickRateFraction();
    const multiplier = randInt(4, 18);
    const whole = den * multiplier;
    const part = num * multiplier;
    const other = whole - part;
    const contexts = [
      {
        wholeLabel: '雞蛋總數',
        partLabel: '壞掉的雞蛋',
        wholeUnit: '顆',
        askLabel: '壞掉的比率',
        question: `阿祥雜貨店共有 ${whole} 顆雞蛋，其中 ${part} 顆壞掉，壞掉的比率是多少？`,
      },
      {
        wholeLabel: '全班人數',
        partLabel: '女生人數',
        wholeUnit: '人',
        askLabel: '女生占全班的比率',
        question: `五年甲班共有 ${whole} 人，其中女生有 ${part} 人，女生占全班的比率是多少？`,
      },
      {
        wholeLabel: '球的總數',
        partLabel: '黑球顆數',
        wholeUnit: '顆',
        askLabel: '黑球占全部球的比率',
        question: `箱子裡共有 ${whole} 顆球，其中黑球有 ${part} 顆，黑球占全部球的比率是多少？`,
      },
      {
        wholeLabel: '飲料總量',
        partLabel: '海綿水中的酒精',
        wholeUnit: '毫升',
        askLabel: '酒精所占的比率',
        question: `一杯 ${whole} 毫升的海綿水中含有 ${part} 毫升的酒精，酒精所占的比率是多少？`,
      },
      {
        wholeLabel: '題目總數',
        partLabel: '答對題數',
        wholeUnit: '題',
        askLabel: '答對率',
        question: `一份練習卷共有 ${whole} 題，嘉嘉答對了 ${part} 題，答對率是多少？`,
      },
    ];
    return { num, den, whole, part, other, ...pickFromList(contexts) };
  }

  function buildE528BasicRateSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = e528BuildPartWholeContext();
      const rate = item.part / item.whole;
      const short = e528RateText(item.part, item.whole);
      questions.push(item.question);
      summaryAnswers.push(short);
      answers.push(
        e528Answer(
          short,
          `${item.askLabel} = ${item.partLabel} ÷ ${item.wholeLabel} = ${item.part} ÷ ${item.whole} = ${e528FractionText(item.part, item.whole)} = ${e528FormatNumber(rate)}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528PartFromRateSet(count) {
    const contexts = [
      { label: '金魚', unit: '條', question: '水族箱裡共有 {whole} 條魚，其中金魚占 {rate}，金魚有幾條？' },
      { label: '通過的人', unit: '人', question: '英語檢定共有 {whole} 人參加，通過率是 {rate}，通過的有幾人？' },
      { label: '紅花', unit: '朵', question: '花園裡共有 {whole} 朵花，紅花占 {rate}，紅花有幾朵？' },
      { label: '女生', unit: '人', question: '全校共有 {whole} 人，其中女生占 {rate}，女生有幾人？' },
      { label: '存起來的錢', unit: '元', question: '哥哥有 {whole} 元零用錢，其中 {rate} 存起來，存了幾元？' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [num, den] = e528PickRateFraction();
      const multiplier = randInt(4, 20);
      const whole = den * multiplier;
      const part = num * multiplier;
      const context = pickFromList(contexts);
      const rateText = e528FractionText(num, den);
      const question = context.question.replace('{whole}', whole).replace('{rate}', rateText);
      questions.push(question);
      summaryAnswers.push(`${part}${context.unit}`);
      answers.push(
        e528Answer(
          `${part}${context.unit}`,
          `${context.label} = 全部量 × 比率 = ${whole} × ${e528FractionText(num, den)} = ${part}，所以答案是 ${part}${context.unit}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528ComplementRateSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      { knownLabel: '出席率', unknownLabel: '缺席率', question: '五年甲班出席率是 {known}，請問缺席率是多少？' },
      {
        knownLabel: '紅花的比率',
        unknownLabel: '紫花的比率',
        question: '媽媽買了花，紅花占 {known}，剩下的都是紫花，紫花占的比率是多少？',
      },
      { knownLabel: '及格率', unknownLabel: '不及格率', question: '數學測驗的及格率是 {known}，不及格率是多少？' },
      {
        knownLabel: '肉包的比率',
        unknownLabel: '菜包的比率',
        question: '包子店賣出的包子中，肉包占 {known}，其餘皆是菜包，菜包的比率是多少？',
      },
      {
        knownLabel: '候選人 A 得票率',
        unknownLabel: '另一人的得票率',
        question: '若某次選舉中，候選人 A 的得票率是 {known}，且只有兩位候選人，另一人的得票率是多少？',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const [num, den] = e528PickRateFraction();
      const remainNum = den - num;
      const context = contexts[i % contexts.length];
      const knownText = e528FractionText(num, den);
      const short = e528FractionText(remainNum, den);
      questions.push(context.question.replace('{known}', knownText));
      summaryAnswers.push(short);
      answers.push(
        e528Answer(
          short,
          `${context.unknownLabel} = 1 - ${context.knownLabel} = 1 - ${e528FractionText(num, den)} = ${e528FractionText(remainNum, den)}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528PercentFromDataSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      {
        wholeLabel: '投球總數',
        partLabel: '投進題數',
        question: '籃球賽中，共投出 {whole} 球，投進 {part} 球，進球率是多少？',
      },
      {
        wholeLabel: '參加人數',
        partLabel: '錄取人數',
        question: '田徑隊徵選有 {whole} 人參加，錄取 {part} 人，錄取率是多少？',
      },
      {
        wholeLabel: '果汁總量',
        partLabel: '蘋果原汁',
        question: '{whole} 毫升果汁中含有 {part} 毫升蘋果原汁，蘋果汁含量百分率是多少？',
      },
      {
        wholeLabel: '測驗題數',
        partLabel: '答對題數',
        question: '一份練習卷有 {whole} 題，皮皮答對 {part} 題，答對率是多少？',
      },
      { wholeLabel: '全班人數', partLabel: '最高分人數', question: '{whole} 人中，最高分有 {part} 人，百分率是多少？' },
    ];
    for (let i = 0; i < count; i += 1) {
      const [num, den] = e528PickRateFraction();
      const multiplier = randInt(4, 16);
      const whole = den * multiplier;
      const part = num * multiplier;
      const percent = (part / whole) * 100;
      const context = pickFromList(contexts);
      questions.push(context.question.replace('{whole}', whole).replace('{part}', part));
      summaryAnswers.push(e528PercentText(percent));
      answers.push(
        e528Answer(
          e528PercentText(percent),
          `百分率 = 部分量 ÷ 全部量 × 100% = ${part} ÷ ${whole} × 100% = ${e528PercentText(percent)}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528PartFromPercentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      { label: '答對題數', unit: '題', question: '數學小考共有 {whole} 題，答對率是 {percent}，他答對幾題？' },
      { label: '水分', unit: '公斤', question: '雅琪體重 {whole} 公斤，身體中水分占 {percent}，水分有幾公斤？' },
      { label: '鹽', unit: '公克', question: '{whole} 公克的湖水中含有 {percent} 的鹽，含有幾公克鹽？' },
      { label: '存款', unit: '元', question: '哥哥有 {whole} 元零用錢，他把其中的 {percent} 存起來，存了幾元？' },
      { label: '女生', unit: '人', question: '全校共有 {whole} 人，其中 {percent} 是女生，女生有幾人？' },
    ];
    for (let i = 0; i < count; i += 1) {
      const [num, den] = e528PickRateFraction();
      const multiplier = randInt(4, 18);
      const whole = den * multiplier;
      const part = num * multiplier;
      const percent = (num / den) * 100;
      const context = pickFromList(contexts);
      questions.push(context.question.replace('{whole}', whole).replace('{percent}', e528PercentText(percent)));
      summaryAnswers.push(`${part}${context.unit}`);
      answers.push(
        e528Answer(
          `${part}${context.unit}`,
          `${context.label} = 全部量 × 百分率 = ${whole} × ${e528PercentText(percent)} = ${whole} × ${e528FormatNumber(num / den)} = ${part}，所以答案是 ${part}${context.unit}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528RateCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      {
        aLabel: '弘欣',
        bLabel: '瀚瀚',
        unit: '枝',
        wholeA: 20,
        partA: 6,
        wholeB: 16,
        partB: 4,
        target: '命中率',
      },
      {
        aLabel: '甲班',
        bLabel: '乙班',
        unit: '人',
        wholeA: 33,
        partA: 11,
        wholeB: 32,
        partB: 8,
        target: '不及格率',
      },
      {
        aLabel: '思好',
        bLabel: '品妍',
        unit: '球',
        wholeA: 15,
        partA: 6,
        wholeB: 30,
        partB: 3,
        target: '進球率',
      },
      {
        aLabel: '甲超市',
        bLabel: '乙超市',
        unit: '折',
        wholeA: 4,
        partA: 3,
        wholeB: 10,
        partB: 8,
        target: '折後價格占原價的比率',
      },
      {
        aLabel: '一班',
        bLabel: '二班',
        cLabel: '三班',
        wholeA: 25,
        partA: 9,
        wholeB: 8,
        partB: 3,
        wholeC: 7,
        partC: 3,
        target: '近視率',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      if (item.cLabel) {
        const rateA = item.partA / item.wholeA;
        const rateB = item.partB / item.wholeB;
        const rateC = item.partC / item.wholeC;
        const best = [
          { label: item.aLabel, rate: rateA },
          { label: item.bLabel, rate: rateB },
          { label: item.cLabel, rate: rateC },
        ].sort((a, b) => b.rate - a.rate)[0];
        questions.push(
          `比較三班近視率：一班是 ${item.partA}/${item.wholeA}，二班是 ${item.partB}/${item.wholeB}，三班是 ${item.partC}/${item.wholeC}，哪班近視率最高？`
        );
        summaryAnswers.push(best.label);
        answers.push(
          e528Answer(
            best.label,
            `把三個比率化成小數：一班 ${e528FormatNumber(rateA)}、二班 ${e528FormatNumber(rateB)}、三班 ${e528FormatNumber(rateC)}，所以${best.label}最高。`
          )
        );
      } else {
        const rateA = item.partA / item.wholeA;
        const rateB = item.partB / item.wholeB;
        const best = rateA > rateB ? item.aLabel : item.bLabel;
        questions.push(
          `${item.aLabel}投了 ${item.wholeA}${item.unit}中成功 ${item.partA}${item.unit}，${item.bLabel}投了 ${item.wholeB}${item.unit}中成功 ${item.partB}${item.unit}，誰的${item.target}較高？`
        );
        summaryAnswers.push(best);
        answers.push(
          e528Answer(
            best,
            `${item.aLabel}的${item.target}是 ${item.partA}/${item.wholeA} = ${e528FormatNumber(rateA)}，${item.bLabel}的${item.target}是 ${item.partB}/${item.wholeB} = ${e528FormatNumber(rateB)}，所以${best}較高。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528ExactConvertSet(count) {
    const bank = [0.08, 0.16, 0.35, 0.45, 0.7, 0.971, 1.2, 0.72, 0.125, 0.006];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const value = pickFromList(bank);
      if (i % 2 === 0) {
        const percent = value * 100;
        questions.push(`將 ${e528FormatNumber(value)} 化為百分率。`);
        summaryAnswers.push(e528PercentText(percent));
        answers.push(
          e528Answer(
            e528PercentText(percent),
            `小數化百分率就是乘以 100，再加上 %，所以 ${e528FormatNumber(value)} × 100 = ${e528FormatNumber(percent)}，答案是 ${e528PercentText(percent)}。`
          )
        );
      } else {
        const percent = value * 100;
        questions.push(`將 ${e528PercentText(percent)} 化為小數。`);
        summaryAnswers.push(e528FormatNumber(value));
        answers.push(
          e528Answer(
            e528FormatNumber(value),
            `百分率化小數就是除以 100，所以 ${e528PercentText(percent)} = ${e528FormatNumber(percent)} ÷ 100 = ${e528FormatNumber(value)}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528PercentToFractionSet(count) {
    const percents = [23, 45, 68, 75, 18, 6.8, 1.8, 12.5, 15.2];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const percent = pickFromList(percents);
      const scale = String(percent).includes('.') ? 1000 : 100;
      const rawTop = Math.round(percent * (scale / 100));
      const [top, bottom] = e528SimplifyFraction(rawTop, scale);
      questions.push(`將 ${e528PercentText(percent)} 化為分數。`);
      summaryAnswers.push(`${top}/${bottom}`);
      answers.push(
        e528Answer(
          `${top}/${bottom}`,
          `百分率先寫成分母是 100 的分數；若百分率本身有小數，就先改成分母是 1000 的分數。${e528PercentText(percent)} = ${rawTop}/${scale} = ${top}/${bottom}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528FractionToPercentExpandSet(count) {
    const bank = [
      [1, 4],
      [7, 10],
      [13, 20],
      [14, 25],
      [17, 50],
      [3, 5],
      [9, 20],
      [21, 25],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [top, bottom] = pickFromList(bank);
      const percent = (top / bottom) * 100;
      const factor = 100 / bottom;
      questions.push(`將 ${top}/${bottom} 化為百分率。`);
      summaryAnswers.push(e528PercentText(percent));
      answers.push(
        e528Answer(
          e528PercentText(percent),
          `把分數擴成分母 100：${top}/${bottom} = ${top}×${factor}/${bottom}×${factor} = ${top * factor}/100 = ${e528PercentText(percent)}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528FractionToPercentRoundSet(count) {
    const bank = [
      [3, 8, 1],
      [5, 6, 0],
      [1, 3, 0],
      [7, 24, 1],
      [3, 7, 0],
      [11, 12, 0],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [top, bottom, digits] = pickFromList(bank);
      const rawPercent = (top / bottom) * 100;
      const percent = Number(rawPercent.toFixed(digits));
      const placeText = digits === 0 ? '整數百分率' : '百分位';
      questions.push(`將 ${top}/${bottom} 化為百分率，取概數到${placeText}。`);
      summaryAnswers.push(e528PercentText(percent, digits === 0 ? 0 : digits));
      answers.push(
        e528Answer(
          e528PercentText(percent, digits === 0 ? 0 : digits),
          `${top}/${bottom} 先用除法化成小數，再乘以 100%。因為 ${top} ÷ ${bottom} ≈ ${e528FormatNumber(top / bottom, 4)}，所以百分率約是 ${e528FormatNumber(rawPercent, 4)}%，依題意取概數後得 ${e528PercentText(percent, digits === 0 ? 0 : digits)}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528DiscountFoldSet(count) {
    const bank = [
      { price: 3200, fold: 70, label: '圓標特會員卡', item: '球鞋' },
      { price: 3000, fold: 80, label: '全館', item: '洋裝' },
      { price: 8500, fold: 75, label: '週年慶', item: '書桌' },
      { price: 26800, fold: 75, label: '傢俱店', item: '餐桌' },
      { price: 360, fold: 55, label: '特價五五折', item: '彩色筆' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = bank[i % bank.length];
      const sale = Math.round((item.price * item.fold) / 100);
      const foldText = item.fold % 10 === 0 ? `${item.fold / 10}折` : `${e528FormatNumber(item.fold / 10, 1)}折`;
      questions.push(`一個定價 ${item.price} 元的${item.item}，${item.label}${foldText}出售，售價是多少元？`);
      summaryAnswers.push(`${sale}元`);
      answers.push(
        e528Answer(
          `${sale}元`,
          `${foldText}代表售價是定價的 ${item.fold}%，所以售價 = ${item.price} × ${item.fold}% = ${sale} 元。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528PercentOffSet(count) {
    const bank = [
      { price: 2500, off: 10, item: '車票' },
      { price: 1600, off: 30, item: '休閒褲' },
      { price: 8000, off: 15, item: '遊戲機' },
      { price: 3390, off: 40, item: '運動背包' },
      { price: 9000, off: 30, item: '小說套書' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = bank[i % bank.length];
      const remain = 100 - item.off;
      const sale = Math.round((item.price * remain) / 100);
      questions.push(`${item.item}原價 ${item.price} 元，現在全面 ${item.off}% off，售價是多少元？`);
      summaryAnswers.push(`${sale}元`);
      answers.push(
        e528Answer(
          `${sale}元`,
          `${item.off}% off 是打掉原價的 ${item.off}%，也就是付原價的 ${remain}%。所以售價 = ${item.price} × ${remain}% = ${sale} 元。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528MarkupSet(count) {
    const bank = [
      { cost: 3000, markup: 30, item: '外套' },
      { cost: 2500, markup: 40, item: '書包' },
      { cost: 4300, markup: 20, item: '球鞋' },
      { cost: 800, markup: 25, item: '模型' },
      { cost: 240, markup: 10, item: '飲料' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = bank[i % bank.length];
      const price = Math.round((item.cost * (100 + item.markup)) / 100);
      const markupText =
        item.markup % 10 === 0 ? `${item.markup / 10}成` : `${e528FormatNumber(item.markup / 10, 1)}成`;
      questions.push(`一件${item.item}成本 ${item.cost} 元，老闆加 ${markupText} 作為定價，定價是多少元？`);
      summaryAnswers.push(`${price}元`);
      answers.push(
        e528Answer(
          `${price}元`,
          `${markupText}就是加 ${item.markup}%，所以定價 = 成本 × (1 + ${item.markup}%) = ${item.cost} × ${e528FormatNumber((100 + item.markup) / 100)} = ${price} 元。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528ServiceMultiStepSet(count) {
    const bank = [
      { amount: 420, people: 1, step: 'service', rate: 10 },
      { amount: 990, people: 8, step: 'service', rate: 10 },
      { amount: 1200, people: 1, step: 'markup-discount', markup: 30, fold: 85 },
      { amount: 10000, people: 1, step: 'markup-discount-profit', markup: 40, fold: 70 },
      { amount: 3000, people: 1, step: 'double-discount', off: 20, fold: 90 },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = bank[i % bank.length];
      if (item.step === 'service') {
        const total = Math.round(item.amount * (1 + item.rate / 100));
        const text =
          item.people > 1
            ? `一餐 ${item.amount} 元，加收一成服務費，${item.people} 人各點一份，一共要付多少元？`
            : `點了 ${item.amount} 元的餐點，加收一成服務費，共要付多少元？`;
        questions.push(text);
        summaryAnswers.push(`${total * item.people}元`);
        answers.push(
          e528Answer(
            `${total * item.people}元`,
            `先算一份加服務費後的價格：${item.amount} × 1.1 = ${total}。${item.people > 1 ? `再乘上 ${item.people} 份，得到 ${total * item.people} 元。` : `所以共要付 ${total} 元。`}`
          )
        );
      } else if (item.step === 'markup-discount') {
        const markupPrice = item.amount * 1.3;
        const sale = Math.round((markupPrice * item.fold) / 100);
        questions.push(`運動外套成本 ${item.amount} 元，先加三成定價後再打八五折，售價是多少元？`);
        summaryAnswers.push(`${sale}元`);
        answers.push(
          e528Answer(
            `${sale}元`,
            `先加三成：${item.amount} × 1.3 = ${markupPrice}。再打八五折：${markupPrice} × 0.85 = ${sale}，所以售價是 ${sale} 元。`
          )
        );
      } else if (item.step === 'markup-discount-profit') {
        const markupPrice = item.amount * 1.4;
        const sale = Math.round(markupPrice * 0.7);
        const profit = sale - item.amount;
        const result = profit >= 0 ? `賺${profit}元` : `賠${Math.abs(profit)}元`;
        questions.push(`一件商品成本 ${item.amount} 元，加四成定價後按定價打七折出售，是賺還是賠？賺或賠多少元？`);
        summaryAnswers.push(result);
        answers.push(
          e528Answer(
            result,
            `先加四成定價：${item.amount} × 1.4 = ${markupPrice}。再打七折售出：${markupPrice} × 0.7 = ${sale}。和成本 ${item.amount} 比較，${sale > item.amount ? '賺' : '賠'} ${Math.abs(profit)} 元。`
          )
        );
      } else {
        const afterOff = item.amount * (1 - item.off / 100);
        const sale = Math.round((afterOff * item.fold) / 100);
        questions.push(`定價 ${item.amount} 元的背包先打 ${item.off}% off，再打九折，售價是多少元？`);
        summaryAnswers.push(`${sale}元`);
        answers.push(
          e528Answer(
            `${sale}元`,
            `先做 ${item.off}% off：${item.amount} × ${e528FormatNumber((100 - item.off) / 100)} = ${afterOff}。再打九折：${afterOff} × 0.9 = ${sale} 元。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528FindDiscountRateSet(count) {
    const bank = [
      { original: 38000, sale: 30400, item: '按摩椅', ask: '幾折出售' },
      { original: 2500, sale: 2000, item: '積木', ask: '幾折出售' },
      { original: 1580, sale: 1185, item: '鞋子', ask: '幾折出售' },
      { original: 50000, sale: 18000, item: '房租', ask: '房租占薪資的幾成' },
      { original: 100000, sale: 15000, item: '車貸', ask: '車貸占總收入的幾成' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = bank[i % bank.length];
      const rate = item.sale / item.original;
      if (item.ask.includes('幾折')) {
        const fold = rate * 10;
        questions.push(`一件${item.item}定價 ${item.original} 元，實際售價 ${item.sale} 元，是打幾折出售？`);
        summaryAnswers.push(`${e528FormatNumber(fold, 1)}折`);
        answers.push(
          e528Answer(
            `${e528FormatNumber(fold, 1)}折`,
            `折數 = 售價 ÷ 定價 × 10 = ${item.sale} ÷ ${item.original} × 10 = ${e528FormatNumber(fold, 1)}，所以是 ${e528FormatNumber(fold, 1)} 折。`
          )
        );
      } else {
        const percent = rate * 100;
        const tenth = rate * 10;
        questions.push(`月薪 ${item.original} 元，${item.item}是 ${item.sale} 元，${item.ask}？`);
        summaryAnswers.push(`${e528FormatNumber(tenth, 1)}成`);
        answers.push(
          e528Answer(
            `${e528FormatNumber(tenth, 1)}成`,
            `先算比率：${item.sale} ÷ ${item.original} = ${e528FormatNumber(rate)} = ${e528PercentText(percent)}，也就是 ${e528FormatNumber(tenth, 1)} 成。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](4);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      summaryAnswers.push(generated.summaryAnswers[itemIndex]);
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528RelativeCompareSet(count) {
    // 甲比乙多/少幾%（相對比較）
    const pool = [
      { aName: '甲班', bName: '乙班', a: 60, b: 50, item: '人數', moreOrLess: '多' },
      { aName: '今年', bName: '去年', a: 120, b: 100, item: '產量（公斤）', moreOrLess: '多' },
      { aName: '大包', bName: '小包', a: 75, b: 50, item: '重量（公克）', moreOrLess: '多' },
      { aName: '甲', bName: '乙', a: 80, b: 100, item: '存款（元）', moreOrLess: '少' },
      { aName: '新價', bName: '舊價', a: 90, b: 120, item: '售價（元）', moreOrLess: '少' },
      { aName: '甲校', bName: '乙校', a: 48, b: 40, item: '出席人數', moreOrLess: '多' },
      { aName: '小明', bName: '小華', a: 84, b: 70, item: '分數', moreOrLess: '多' },
      { aName: '二月', bName: '一月', a: 68, b: 80, item: '銷售量', moreOrLess: '少' },
      { aName: '甲', bName: '乙', a: 110, b: 100, item: '體重（公斤）', moreOrLess: '多' },
      { aName: '今天', bName: '昨天', a: 144, b: 120, item: '步數', moreOrLess: '多' },
    ];
    const questions = [], answers = [], summaryAnswers = [];
    for (let i = 0; i < count; i++) {
      const t = pool[randInt(0, pool.length - 1)];
      const diff = Math.abs(t.a - t.b);
      const base = t.moreOrLess === '多' ? t.b : t.a;
      const pct = Math.round(diff / base * 100);
      questions.push(
        `${t.aName}的${t.item}是 $${t.a}$，${t.bName}的${t.item}是 $${t.b}$，` +
        `${t.aName}比${t.bName}${t.moreOrLess}百分之幾？`
      );
      answers.push(
        `差：$${t.a}-${t.b}=${diff > 0 ? diff : t.b - t.a}$（取絕對值）。` +
        `以${t.bName === (t.moreOrLess === '多' ? t.bName : t.aName) ? (t.moreOrLess === '多' ? t.bName : t.aName) : t.bName}為基準：` +
        `$${diff}\div${base}\times100\%=${pct}\%$。` +
        `故${t.aName}比${t.bName}${t.moreOrLess}百分之 $${pct}$。`
      );
      summaryAnswers.push(`$${pct}\%$`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528PercentChangeSet(count) {
    // 增加/減少某%後是原來的幾%
    const pool = [
      { item: '一件商品', pct: 20, upOrDown: '增加', result: 120 },
      { item: '學校人數', pct: 10, upOrDown: '減少', result: 90 },
      { item: '某商品售價', pct: 15, upOrDown: '增加', result: 115 },
      { item: '工廠產量', pct: 25, upOrDown: '減少', result: 75 },
      { item: '存款金額', pct: 8, upOrDown: '增加', result: 108 },
      { item: '班上人數', pct: 5, upOrDown: '減少', result: 95 },
      { item: '商品進價', pct: 30, upOrDown: '增加', result: 130 },
      { item: '水電費', pct: 12, upOrDown: '減少', result: 88 },
      { item: '年薪', pct: 6, upOrDown: '增加', result: 106 },
      { item: '零件數量', pct: 40, upOrDown: '減少', result: 60 },
    ];
    const questions = [], answers = [], summaryAnswers = [];
    for (let i = 0; i < count; i++) {
      const t = pool[randInt(0, pool.length - 1)];
      questions.push(
        `${t.item}${t.upOrDown}了百分之 $${t.pct}$ 後，` +
        `是原來的百分之幾？`
      );
      answers.push(
        `${t.upOrDown === '增加' ? '增加' : '減少'}了 $${t.pct}\%$，` +
        `故${t.upOrDown === '增加' ? '加上' : '減去'} $${t.pct}\%$：` +
        `$100\%${t.upOrDown === '增加' ? '+' : '-'}${t.pct}\%=${t.result}\%$。` +
        `所以是原來的 $${t.result}\%$。`
      );
      summaryAnswers.push(`$${t.result}\%$`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528FindOriginalSet(count) {
    // 已知折扣後（或增加後）的價格，逆推原價
    const pool = [
      { name: '一件外套', discount: 8, pct: 80, after: 480, original: 600 },
      { name: '一雙球鞋', discount: 7, pct: 70, after: 560, original: 800 },
      { name: '一本書', discount: 9, pct: 90, after: 270, original: 300 },
      { name: '一台玩具車', discount: 6, pct: 60, after: 360, original: 600 },
      { name: '一件T恤', discount: 75, pct: 75, after: 300, original: 400, isDirect: true },
      { name: '一個書包', discount: 8, pct: 80, after: 640, original: 800 },
      { name: '一雙手套', discount: 5, pct: 50, after: 250, original: 500 },
      { name: '一頂帽子', discount: 9, pct: 90, after: 180, original: 200 },
      { name: '一件雨衣', discount: 7, pct: 70, after: 420, original: 600 },
      { name: '一個水壺', discount: 6, pct: 60, after: 240, original: 400 },
    ];
    const questions = [], answers = [], summaryAnswers = [];
    for (let i = 0; i < count; i++) {
      const t = pool[randInt(0, pool.length - 1)];
      const label = t.isDirect ? `售價是原價的 $${t.pct}\%$` : `打了 $${t.discount}$ 折`;
      questions.push(
        `${t.name}${label}，折後售價為 $${t.after}$ 元，原價是多少元？`
      );
      answers.push(
        `折後售價 $=${t.after}$ 元，占原價的 $${t.pct}\%$。` +
        `原價 $=${t.after}\div${t.pct}\%=${t.after}\times\dfrac{100}{${t.pct}}=${t.original}$ 元。`
      );
      summaryAnswers.push(`$${t.original}$ 元`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE528CompareChangeThreeSet(count) {
    return buildE528MixedSet([
      buildE528RelativeCompareSet,
      buildE528PercentChangeSet,
      buildE528FindOriginalSet,
    ], count);
  }

  function buildE528BasicThreeSet(count) {
    return buildE528MixedSet([buildE528BasicRateSet, buildE528PartFromRateSet, buildE528ComplementRateSet], count);
  }

  function buildE528PercentThreeSet(count) {
    return buildE528MixedSet(
      [buildE528PercentFromDataSet, buildE528PartFromPercentSet, buildE528RateCompareSet],
      count
    );
  }

  function buildE528ConvertFourSet(count) {
    return buildE528MixedSet(
      [
        buildE528ExactConvertSet,
        buildE528PercentToFractionSet,
        buildE528FractionToPercentExpandSet,
        buildE528FractionToPercentRoundSet,
      ],
      count
    );
  }

  function buildE528PriceFiveSet(count) {
    return buildE528MixedSet(
      [
        buildE528DiscountFoldSet,
        buildE528PercentOffSet,
        buildE528MarkupSet,
        buildE528ServiceMultiStepSet,
        buildE528FindDiscountRateSet,
      ],
      count
    );
  }

  function e529FormatDuration(totalMinutes) {
    const safeTotal = Math.max(0, Math.round(totalMinutes));
    const days = Math.floor(safeTotal / 1440);
    const remainAfterDays = safeTotal % 1440;
    const hours = Math.floor(remainAfterDays / 60);
    const minutes = remainAfterDays % 60;
    const parts = [];
    if (days > 0) parts.push(`${days}日`);
    if (hours > 0) parts.push(`${hours}小時`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}分`);
    return parts.join('');
  }

  function e529FormatHourMinute(hours, minutes) {
    const parts = [];
    if (hours > 0) parts.push(`${hours}小時`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}分`);
    return parts.join('');
  }

  function e529Answer(shortAnswer, process) {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function e529FormatMinuteSecond(totalSeconds) {
    const safeTotal = Math.max(0, Math.round(totalSeconds));
    const minutes = Math.floor(safeTotal / 60);
    const seconds = safeTotal % 60;
    if (minutes === 0) return `${seconds}秒`;
    if (seconds === 0) return `${minutes}分`;
    return `${minutes}分${seconds}秒`;
  }

  function e529FormatDayHour(totalHours) {
    const safeTotal = Math.max(0, Math.round(totalHours));
    const days = Math.floor(safeTotal / 24);
    const hours = safeTotal % 24;
    if (days === 0) return `${hours}小時`;
    if (hours === 0) return `${days}日`;
    return `${days}日${hours}小時`;
  }

  function e529FormatDecimalNumber(value, digits = 3) {
    return trimDecimalString(Number(value.toFixed(digits)).toString());
  }

  function e529FormatClockMinute(totalMinutes) {
    const normalized = ((totalMinutes % 1440) + 1440) % 1440;
    const hour24 = Math.floor(normalized / 60);
    const minute = normalized % 60;
    if (hour24 === 12) return `中午12時${minute}分`;
    const period = hour24 < 12 ? '上午' : '下午';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${period}${hour12}時${minute}分`;
  }

  function e529FormatClockSecond(totalSeconds) {
    const normalized = ((totalSeconds % 86400) + 86400) % 86400;
    const hour24 = Math.floor(normalized / 3600);
    const minute = Math.floor((normalized % 3600) / 60);
    const second = normalized % 60;
    if (hour24 === 12) return `中午12時${minute}分${second}秒`;
    const period = hour24 < 12 ? '上午' : '下午';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${period}${hour12}時${minute}分${second}秒`;
  }

  function e529FormatFractionUnit(numerator, denominator, unit) {
    return `$${formatFraction(numerator, denominator)}$${unit}`;
  }

  function e529BuildScaledDuration(totalSeconds, levels = ['day', 'hour', 'minute', 'second']) {
    let remain = Math.max(0, Math.round(totalSeconds));
    const parts = [];
    if (levels.includes('day')) {
      const days = Math.floor(remain / 86400);
      if (days > 0) parts.push(`${days}日`);
      remain %= 86400;
    }
    if (levels.includes('hour')) {
      const hours = Math.floor(remain / 3600);
      if (hours > 0) parts.push(`${hours}小時`);
      remain %= 3600;
    }
    if (levels.includes('minute')) {
      const minutes = Math.floor(remain / 60);
      if (minutes > 0) parts.push(`${minutes}分`);
      remain %= 60;
    }
    if (levels.includes('second')) {
      if (remain > 0 || parts.length === 0) parts.push(`${remain}秒`);
    } else if (parts.length === 0) {
      parts.push('0分');
    }
    return parts.join('');
  }

  function buildE529LargeToCompoundSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      {
        unit: '日',
        smallUnit: '小時',
        factor: 24,
        wholes: [1, 2, 3, 4, 5, 6],
        pieces: [0.25, 0.5, 0.75],
        formatter: (whole, piece) => `${whole + piece}日`,
        answer: (whole, piece) => `${whole}日${piece * 24}小時`,
      },
      {
        unit: '日',
        smallUnit: '小時',
        factor: 24,
        wholes: [1, 2, 3, 4, 5],
        fractions: [
          [1, 4],
          [1, 2],
          [3, 4],
          [5, 8],
        ],
        formatter: (whole, frac) => `${whole}${e529FormatFractionUnit(frac[0], frac[1], '日')}`,
        answer: (whole, frac) => `${whole}日${(24 * frac[0]) / frac[1]}小時`,
      },
      {
        unit: '小時',
        smallUnit: '分',
        factor: 60,
        wholes: [1, 2, 3, 4, 5, 6],
        pieces: [0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.75],
        formatter: (whole, piece) => `${e529FormatDecimalNumber(whole + piece)}小時`,
        answer: (whole, piece) => `${whole}小時${piece * 60}分`,
      },
      {
        unit: '小時',
        smallUnit: '分',
        factor: 60,
        wholes: [1, 2, 3, 4, 5],
        fractions: [
          [1, 4],
          [1, 3],
          [2, 5],
          [3, 4],
        ],
        formatter: (whole, frac) => `${whole}${e529FormatFractionUnit(frac[0], frac[1], '小時')}`,
        answer: (whole, frac) => `${whole}小時${(60 * frac[0]) / frac[1]}分`,
      },
      {
        unit: '分',
        smallUnit: '秒',
        factor: 60,
        wholes: [2, 3, 4, 5, 6, 8, 10],
        pieces: [0.2, 0.25, 0.4, 0.5, 0.6, 0.75],
        formatter: (whole, piece) => `${e529FormatDecimalNumber(whole + piece)}分`,
        answer: (whole, piece) => `${whole}分${piece * 60}秒`,
      },
      {
        unit: '分',
        smallUnit: '秒',
        factor: 60,
        wholes: [2, 3, 4, 5, 6, 8],
        fractions: [
          [1, 4],
          [1, 3],
          [2, 5],
          [1, 2],
          [3, 5],
        ],
        formatter: (whole, frac) => `${whole}${e529FormatFractionUnit(frac[0], frac[1], '分')}`,
        answer: (whole, frac) => `${whole}分${(60 * frac[0]) / frac[1]}秒`,
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = pickFromList(cases);
      if (item.pieces) {
        const whole = pickFromList(item.wholes);
        const piece = pickFromList(item.pieces);
        const sourceText = item.formatter(whole, piece);
        const answerText = item.answer(whole, piece);
        questions.push(`${sourceText}等於幾${item.unit}${item.smallUnit}？`);
        summaryAnswers.push(answerText);
        answers.push(
          e529Answer(
            answerText,
            `${item.unit}換成${item.smallUnit}要乘 ${item.factor}。所以 ${item.factor} × ${piece} = ${piece * item.factor}，因此 ${sourceText} = ${answerText}。`
          )
        );
      } else {
        const whole = pickFromList(item.wholes);
        const frac = pickFromList(item.fractions);
        const sourceText = item.formatter(whole, frac);
        const answerText = item.answer(whole, frac);
        questions.push(`${sourceText}等於幾${item.unit}${item.smallUnit}？`);
        summaryAnswers.push(answerText);
        answers.push(
          e529Answer(
            answerText,
            `${item.unit}換成${item.smallUnit}要乘 ${item.factor}。所以 ${item.factor} × ${e529FormatFractionUnit(frac[0], frac[1], '')} = ${(item.factor * frac[0]) / frac[1]}，因此 ${sourceText} = ${answerText}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529SmallToLargeDecimalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modes = [
      { from: '小時', to: '日', divisor: 24, values: [6, 12, 18, 30, 36, 42, 48] },
      { from: '分', to: '小時', divisor: 60, values: [15, 30, 45, 75, 90, 105, 150] },
      { from: '秒', to: '分', divisor: 60, values: [15, 30, 45, 75, 90, 120, 150] },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      const value = pickFromList(mode.values);
      const result = value / mode.divisor;
      const answerText = `${e529FormatDecimalNumber(result)}${mode.to}`;
      questions.push(`${value}${mode.from}也可以說是幾${mode.to}？（用小數表示）`);
      summaryAnswers.push(answerText);
      answers.push(
        e529Answer(
          answerText,
          `${mode.from}換成${mode.to}要除以 ${mode.divisor}，所以 ${value} ÷ ${mode.divisor} = ${e529FormatDecimalNumber(result)}，答案是 ${answerText}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529SmallToLargeFractionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modes = [
      { from: '小時', to: '日', divisor: 24, values: [5, 7, 8, 10, 11, 13, 17] },
      { from: '分', to: '小時', divisor: 60, values: [10, 20, 25, 35, 40, 50] },
      { from: '秒', to: '分', divisor: 60, values: [10, 20, 25, 35, 40, 50] },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      const value = pickFromList(mode.values);
      const reduced = reduceFraction(value, mode.divisor);
      const answerText = `$${formatFraction(reduced.numerator, reduced.denominator)}$${mode.to}`;
      questions.push(`${value}${mode.from}也可以說是幾${mode.to}？（用分數表示）`);
      summaryAnswers.push(answerText);
      answers.push(
        e529Answer(
          answerText,
          `${mode.from}換成${mode.to}要除以 ${mode.divisor}，所以 ${value} ÷ ${mode.divisor} = ${e529FormatFractionUnit(reduced.numerator, reduced.denominator, mode.to)}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529CompareTimeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const people = [
      ['怡君', '容真'],
      ['恩柔', '芳瑜'],
      ['秋雅', '子健'],
      ['小安', '阿哲'],
    ];
    for (let i = 0; i < count; i += 1) {
      const pair = people[i % people.length];
      const mode = i % 4;
      if (mode === 0) {
        const leftMinutes = pickFromList([75, 81, 84, 96, 105]);
        const rightMinutes = pickFromList([74, 79, 88, 92, 110].filter((value) => value !== leftMinutes));
        const leftText = `${e529FormatDecimalNumber(leftMinutes / 60, 2)}小時`;
        const rightText = e529FormatHourMinute(Math.floor(rightMinutes / 60), rightMinutes % 60);
        const relation = leftMinutes > rightMinutes ? `${pair[0]}較久` : `${pair[1]}較久`;
        questions.push(`${pair[0]}練習了 ${leftText}，${pair[1]}練習了 ${rightText}，誰練習時間較久？`);
        summaryAnswers.push(relation);
        answers.push(
          e529Answer(
            relation,
            `${leftText} = ${e529FormatHourMinute(Math.floor(leftMinutes / 60), leftMinutes % 60)}。再比較 ${leftMinutes} 分和 ${rightMinutes} 分，所以 ${relation}。`
          )
        );
      } else if (mode === 1) {
        const leftDecimal = pickFromList([1.2, 1.35, 1.5, 1.75, 2.1]);
        const leftSeconds = Math.round(leftDecimal * 60);
        const rightSeconds = pickFromList([70, 79, 84, 96, 112, 126].filter((value) => value !== leftSeconds));
        const leftText = `${e529FormatDecimalNumber(leftDecimal, 2)}分`;
        const rightText = e529FormatMinuteSecond(rightSeconds);
        const relation = leftSeconds > rightSeconds ? `${pair[0]}較久` : `${pair[1]}較久`;
        questions.push(`${pair[0]}花了 ${leftText}，${pair[1]}花了 ${rightText}，誰花的時間較久？`);
        summaryAnswers.push(relation);
        answers.push(
          e529Answer(
            relation,
            `${leftText} = ${e529FormatMinuteSecond(leftSeconds)}。改成秒比較：${leftSeconds} 秒和 ${rightSeconds} 秒，所以 ${relation}。`
          )
        );
      } else if (mode === 2) {
        const leftDays = pickFromList([2, 3, 4, 5]);
        const leftHours = pickFromList([4, 8, 12, 16, 20]);
        const leftTotal = leftDays * 24 + leftHours;
        const rightTotal = pickFromList([leftTotal - 6, leftTotal - 2, leftTotal + 3, leftTotal + 8]);
        const relation = leftTotal > rightTotal ? '>' : '<';
        questions.push(`比較時間長短：${leftDays}日${leftHours}小時 ${relation === '>' ? '□' : '□'} ${rightTotal}小時`);
        summaryAnswers.push(relation);
        answers.push(
          e529Answer(
            relation,
            `${leftDays}日${leftHours}小時 = ${leftDays * 24}+${leftHours} = ${leftTotal}小時。再和 ${rightTotal}小時比較，可得 ${leftTotal} ${relation} ${rightTotal}。`
          )
        );
      } else {
        const leftMinutes = pickFromList([240, 300, 360, 420, 480]);
        const rightHours = pickFromList([4, 5, 6, 7, 8]);
        const relation = leftMinutes > rightHours * 60 ? '>' : '<';
        questions.push(`比較時間長短：${rightHours}小時 □ ${leftMinutes}分鐘`);
        summaryAnswers.push(rightHours * 60 > leftMinutes ? '>' : '<');
        answers.push(
          e529Answer(
            rightHours * 60 > leftMinutes ? '>' : '<',
            `${rightHours}小時 = ${rightHours * 60}分鐘。再和 ${leftMinutes}分鐘比較，可得 ${rightHours * 60 > leftMinutes ? '>' : '<'}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529MinuteSecondMultiplySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['摺一朵紙玫瑰', '朵'],
      ['播放一首歌', '次'],
      ['跑操場一圈', '圈'],
      ['沖一杯咖啡', '杯'],
      ['做一次舞蹈練習', '次'],
    ];
    const basePairs = [
      [1, 18],
      [1, 34],
      [2, 15],
      [3, 8],
      [3, 20],
      [4, 12],
      [6, 21],
    ];
    const counts = [3, 4, 5, 6, 7, 8, 10, 12];
    for (let i = 0; i < count; i += 1) {
      const [minute, second] = pickFromList(basePairs);
      const times = pickFromList(counts);
      const totalSeconds = (minute * 60 + second) * times;
      const answerText = e529FormatMinuteSecond(totalSeconds);
      const [action, unit] = contexts[i % contexts.length];
      questions.push(`${action}要 ${minute}分${second}秒，做 ${times}${unit}共要幾分幾秒？`);
      summaryAnswers.push(answerText);
      answers.push(
        e529Answer(
          answerText,
          `先把一次的時間換成秒：${minute}分${second}秒 = ${minute * 60 + second}秒。再算 ${minute * 60 + second} × ${times} = ${totalSeconds}秒，最後換回幾分幾秒，所以是 ${answerText}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529HourMinuteMultiplySetV2(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['參加一次社團課', '次'],
      ['每天練習小提琴', '天'],
      ['烤一盤蛋糕', '盤'],
      ['播映一場電影', '場'],
      ['修理一輛機車', '輛'],
    ];
    const basePairs = [
      [1, 10],
      [1, 20],
      [1, 35],
      [1, 38],
      [2, 20],
      [2, 35],
      [3, 15],
    ];
    const counts = [2, 3, 4, 5, 6, 7];
    for (let i = 0; i < count; i += 1) {
      const [hour, minute] = pickFromList(basePairs);
      const times = pickFromList(counts);
      const totalMinutes = (hour * 60 + minute) * times;
      const answerText = e529FormatDuration(totalMinutes);
      const [action, unit] = contexts[i % contexts.length];
      questions.push(`${action}要 ${hour}小時${minute}分，做 ${times}${unit}共要幾小時幾分？`);
      summaryAnswers.push(answerText);
      answers.push(
        e529Answer(
          answerText,
          `先把一次的時間換成分鐘：${hour}小時${minute}分 = ${hour * 60 + minute}分。再算 ${hour * 60 + minute} × ${times} = ${totalMinutes}分，最後換回幾小時幾分，所以是 ${answerText}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529DayHourMultiplySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['製作一張沙發椅', '張'],
      ['手工製作一個皮包', '個'],
      ['月球繞地球一圈', '圈'],
      ['做一件禮服', '件'],
      ['社區停水一次', '次'],
    ];
    const basePairs = [
      [1, 8],
      [2, 12],
      [3, 5],
      [4, 12],
      [6, 12],
      [8, 4],
      [29, 12],
    ];
    const counts = [2, 3, 4, 5, 6, 7];
    for (let i = 0; i < count; i += 1) {
      const [day, hour] = pickFromList(basePairs);
      const times = pickFromList(counts);
      const totalHours = (day * 24 + hour) * times;
      const answerText = e529FormatDayHour(totalHours);
      const [action, unit] = contexts[i % contexts.length];
      questions.push(`${action}要 ${day}日${hour}小時，做 ${times}${unit}共要幾日幾小時？`);
      summaryAnswers.push(answerText);
      answers.push(
        e529Answer(
          answerText,
          `先把一次的時間換成小時：${day}日${hour}小時 = ${day * 24 + hour}小時。再算 ${day * 24 + hour} × ${times} = ${totalHours}小時，最後換回幾日幾小時，所以是 ${answerText}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529FixedPeriodAccumulateSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      { intro: '每天散步', base: [1, 40], countLabel: '一星期', count: 7, unit: '小時分' },
      { intro: '每天慢跑', base: [1, 25], countLabel: '一星期', count: 7, unit: '小時分' },
      { intro: '每個月閱讀', base: [3, 7], countLabel: '9個月', count: 9, unit: '日時' },
      { intro: '每天直排輪上課', base: [1, 20], countLabel: '4個星期', count: 28, unit: '日時' },
      { intro: '手錶每天快', base: [0, 24], countLabel: '5天', count: 5, unit: '分秒' },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = contexts[i % contexts.length];
      if (item.unit === '小時分') {
        const [hour, minute] = item.base;
        const totalMinutes = (hour * 60 + minute) * item.count;
        const answerText = e529FormatDuration(totalMinutes);
        questions.push(`${item.intro}${hour}小時${minute}分，${item.countLabel}共累計幾小時幾分？`);
        summaryAnswers.push(answerText);
        answers.push(
          e529Answer(
            answerText,
            `先把每天換成分鐘：${hour}小時${minute}分 = ${hour * 60 + minute}分。再乘上 ${item.count}，得到 ${hour * 60 + minute} × ${item.count} = ${totalMinutes}分，換回幾小時幾分就是 ${answerText}。`
          )
        );
      } else if (item.unit === '日時') {
        const [day, hour] = item.base;
        const totalHours = (day * 24 + hour) * item.count;
        const answerText = e529FormatDayHour(totalHours);
        questions.push(`${item.intro}${day}日${hour}小時，${item.countLabel}共累計幾日幾小時？`);
        summaryAnswers.push(answerText);
        answers.push(
          e529Answer(
            answerText,
            `先把每次換成小時：${day}日${hour}小時 = ${day * 24 + hour}小時。再乘上 ${item.count}，得到 ${day * 24 + hour} × ${item.count} = ${totalHours}小時，換回幾日幾小時就是 ${answerText}。`
          )
        );
      } else {
        const [, second] = item.base;
        const totalSeconds = second * item.count;
        const answerText = e529FormatMinuteSecond(totalSeconds);
        questions.push(`${item.intro}${second}秒，${item.countLabel}共快幾分幾秒？`);
        summaryAnswers.push(answerText);
        answers.push(
          e529Answer(
            answerText,
            `${second}秒每天累積 ${item.count} 天，共 ${second} × ${item.count} = ${totalSeconds}秒，換回幾分幾秒就是 ${answerText}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529AverageDurationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const templates = [
      {
        itemName: '歌曲',
        countUnit: '遍',
        countChoices: [3, 4, 5, 6],
        eachChoices: [145, 165, 185, 205],
        answerKind: 'ms',
        ask: '平均唱一遍要幾分幾秒',
        totalText: (total) => e529FormatMinuteSecond(total),
      },
      {
        itemName: '圍巾',
        countUnit: '條',
        countChoices: [4, 6, 8],
        eachChoices: [45, 60, 72, 84, 95],
        answerKind: 'hm',
        ask: '平均編一條要幾小時幾分',
        totalText: (total) => e529FormatDuration(total / 60),
      },
      {
        itemName: '積木城堡',
        countUnit: '座',
        countChoices: [2, 3, 4],
        eachChoices: [28, 36, 40, 52],
        answerKind: 'dh',
        ask: '平均組裝一座要幾日幾小時',
        totalText: (total) => e529FormatDayHour(total / 3600),
      },
      {
        itemName: '自行車圈數',
        countUnit: '圈',
        countChoices: [4, 5, 6],
        eachChoices: [52, 64, 75, 84],
        answerKind: 'hm',
        ask: '平均騎一圈要幾小時幾分',
        totalText: (total) => e529FormatDuration(total / 60),
      },
      {
        itemName: '沙包',
        countUnit: '個',
        countChoices: [4, 5, 6, 8],
        eachChoices: [65, 85, 95, 125],
        answerKind: 'ms',
        ask: '平均做一個要幾分幾秒',
        totalText: (total) => e529FormatMinuteSecond(total),
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = templates[i % templates.length];
      const countValue = pickFromList(item.countChoices);
      const eachBase = pickFromList(item.eachChoices);
      const eachSeconds =
        item.answerKind === 'dh' ? eachBase * 3600 : item.answerKind === 'hm' ? eachBase * 60 : eachBase;
      const totalSeconds = eachSeconds * countValue;
      let answerText = '';
      if (item.answerKind === 'ms') {
        answerText = e529FormatMinuteSecond(eachSeconds);
      } else if (item.answerKind === 'hm') {
        answerText = e529FormatDuration(eachSeconds / 60);
      } else {
        answerText = e529FormatDayHour(eachSeconds / 3600);
      }
      questions.push(
        `共花了${item.totalText(totalSeconds)}完成 ${countValue}${item.countUnit}${item.itemName}，${item.ask}？`
      );
      summaryAnswers.push(answerText);
      answers.push(
        e529Answer(
          answerText,
          `平均每一個所用時間 = 總時間 ÷ 數量。先把總時間統一成秒，再算 ${totalSeconds} ÷ ${countValue} = ${eachSeconds} 秒，最後換回題目要的形式，所以是 ${answerText}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529ContainedCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      {
        thing: '摺一個紙盒',
        eachChoices: [3 * 60, 4 * 60, 5 * 60],
        countChoices: [18, 24, 30, 35],
        answerUnit: '個紙盒',
      },
      { thing: '播放一次影片', eachChoices: [60, 70, 80, 90], countChoices: [180, 240, 300], answerUnit: '次' },
      {
        thing: '烤一個吐司',
        eachChoices: [4 * 60 + 10, 4 * 60 + 16, 4 * 60 + 25],
        countChoices: [12, 13, 14],
        answerUnit: '個吐司',
      },
      {
        thing: '播放一次主題曲',
        eachChoices: [3 * 60 + 10, 3 * 60 + 20, 3 * 60 + 30],
        countChoices: [2, 3, 4],
        answerUnit: '遍',
        totalChoices: [10 * 60, 12 * 60, 15 * 60],
      },
      {
        thing: '製作一件模型',
        eachChoices: [25 * 60, 30 * 60, 35 * 60],
        countChoices: [3, 4, 5],
        answerUnit: '個',
        fromElapsed: true,
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = contexts[i % contexts.length];
      const eachSeconds = pickFromList(item.eachChoices);
      let totalSeconds = 0;
      let totalText = '';
      let detail = '';
      if (item.fromElapsed) {
        const countValue = pickFromList(item.countChoices);
        const extra = pickFromList([0, Math.floor(eachSeconds / 3)]);
        totalSeconds = eachSeconds * countValue + extra;
        const start = pickFromList([9 * 3600 + 20 * 60, 10 * 3600 + 15 * 60, 13 * 3600 + 5 * 60]);
        const end = start + totalSeconds;
        totalText = `從${e529FormatClockMinute(start / 60)}到${e529FormatClockMinute(end / 60)}`;
        detail = `先算經過時間：${e529FormatClockMinute(end / 60)} - ${e529FormatClockMinute(start / 60)} = ${e529BuildScaledDuration(totalSeconds, ['hour', 'minute', 'second'])}。`;
      } else {
        if (item.totalChoices) {
          totalSeconds = pickFromList(item.totalChoices);
        } else {
          const countValue = pickFromList(item.countChoices);
          const extra = pickFromList([0, Math.floor(eachSeconds / 4), Math.floor(eachSeconds / 2)]);
          totalSeconds = eachSeconds * countValue + extra;
        }
        totalText = e529BuildScaledDuration(totalSeconds, ['hour', 'minute', 'second']);
      }
      const countValue = Math.floor(totalSeconds / eachSeconds);
      questions.push(
        `${item.thing}需要 ${e529BuildScaledDuration(eachSeconds, ['hour', 'minute', 'second'])}，${totalText}最多可以完成幾${item.answerUnit}？`
      );
      summaryAnswers.push(`${countValue}${item.answerUnit}`);
      answers.push(
        e529Answer(
          `${countValue}${item.answerUnit}`,
          `${detail}每${item.thing}要 ${e529BuildScaledDuration(eachSeconds, ['hour', 'minute', 'second'])}，所以能完成的次數 = ${totalSeconds} ÷ ${eachSeconds} = ${countValue}，答案是 ${countValue}${item.answerUnit}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529ElapsedThenAverageSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { start: 8 * 60 + 30, duration: 4 * 95, unitCount: 4, ask: '平均繞一圈要幾小時幾分', clock: 'minute' },
      { start: 13 * 60 + 24, duration: 3 * 92, unitCount: 3, ask: '平均做一個要幾小時幾分', clock: 'minute' },
      { start: 9 * 3600 + 20 * 60 + 10, duration: 4 * 84, unitCount: 4, ask: '平均一人跑幾分幾秒', clock: 'second' },
      { start: 14 * 60 + 10, duration: 5 * 30, unitCount: 5, ask: '平均游1公里要幾分鐘', clock: 'minute-short' },
      { start: 13 * 60, duration: 5 * 77, unitCount: 5, ask: '平均組裝一個要幾分鐘', clock: 'minute-short' },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      if (item.clock === 'second') {
        const end = item.start + item.duration;
        const answerText = e529FormatMinuteSecond(item.duration / item.unitCount);
        questions.push(
          `從${e529FormatClockSecond(item.start)}到${e529FormatClockSecond(end)}共完成 ${item.unitCount} 次，${item.ask}？`
        );
        summaryAnswers.push(answerText);
        answers.push(
          e529Answer(
            answerText,
            `先算經過時間：${e529FormatClockSecond(end)} - ${e529FormatClockSecond(item.start)} = ${e529FormatMinuteSecond(item.duration)}。再算 ${item.duration} ÷ ${item.unitCount} = ${item.duration / item.unitCount} 秒，所以平均是 ${answerText}。`
          )
        );
      } else {
        const end = item.start + item.duration;
        const answerMinutes = item.duration / item.unitCount;
        const answerText = item.clock === 'minute-short' ? `${answerMinutes}分鐘` : e529FormatDuration(answerMinutes);
        questions.push(
          `從${e529FormatClockMinute(item.start)}到${e529FormatClockMinute(end)}共完成 ${item.unitCount} 次，${item.ask}？`
        );
        summaryAnswers.push(answerText);
        answers.push(
          e529Answer(
            answerText,
            `先算經過時間：${e529FormatClockMinute(end)} - ${e529FormatClockMinute(item.start)} = ${e529FormatDuration(item.duration)}。再算 ${item.duration} ÷ ${item.unitCount} = ${answerMinutes} 分，所以平均是 ${answerText}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529NthDepartureSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { firstChoices: [6 * 60 + 10, 7 * 60, 7 * 60 + 20], intervalChoices: [20, 25, 30], nthChoices: [5, 6, 7] },
      { firstChoices: [13 * 60 + 10, 13 * 60 + 30, 14 * 60], intervalChoices: [40, 45, 50], nthChoices: [6, 7, 8] },
      {
        firstChoices: [15 * 60 + 20, 16 * 60 + 35, 17 * 60 + 10],
        intervalChoices: [35, 40, 50],
        nthChoices: [4, 5, 6],
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const first = pickFromList(item.firstChoices);
      const interval = pickFromList(item.intervalChoices);
      const nth = pickFromList(item.nthChoices);
      const target = first + interval * (nth - 1);
      const answerText = e529FormatClockMinute(target);
      questions.push(
        `第一班在${e529FormatClockMinute(first)}出發，每隔${interval}分鐘一班，第 ${nth} 班是什麼時候出發？`
      );
      summaryAnswers.push(answerText);
      answers.push(
        e529Answer(
          answerText,
          `從第1班到第${nth}班有 ${nth - 1} 個間隔，所以經過時間是 ${interval} × ${nth - 1} = ${interval * (nth - 1)} 分。再用 ${e529FormatClockMinute(first)} 往後推 ${interval * (nth - 1)} 分，就得到 ${answerText}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529IntervalCountMinusOneSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      {
        minuteMode: true,
        firstChoices: [13 * 60 + 10, 13 * 60 + 30, 14 * 60],
        intervalChoices: [40, 50, 60],
        tripsChoices: [6, 8, 10],
      },
      {
        minuteMode: true,
        firstChoices: [6 * 60 + 10, 6 * 60 + 20, 7 * 60],
        intervalChoices: [20, 24, 26],
        tripsChoices: [10, 18, 26],
      },
      { secondMode: true, intervalChoices: [30, 35, 40], groupsChoices: [7, 9, 10] },
      {
        minuteMode: true,
        firstChoices: [7 * 60, 7 * 60 + 10, 7 * 60 + 30],
        intervalChoices: [15, 20, 25],
        tripsChoices: [4, 5, 6],
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      if (item.secondMode) {
        const interval = pickFromList(item.intervalChoices);
        const groups = pickFromList(item.groupsChoices);
        const total = interval * (groups - 1);
        const answerText = e529FormatMinuteSecond(interval);
        questions.push(
          `每隔固定秒數放行一組，從第1組到第${groups}組共經過${e529FormatMinuteSecond(total)}，每隔幾分幾秒放行一組？`
        );
        summaryAnswers.push(answerText);
        answers.push(
          e529Answer(
            answerText,
            `第1組到第${groups}組共有 ${groups - 1} 個間隔，所以每個間隔 = ${total} ÷ ${groups - 1} = ${interval} 秒，也就是 ${answerText}。`
          )
        );
      } else {
        const first = pickFromList(item.firstChoices);
        const interval = pickFromList(item.intervalChoices);
        const trips = pickFromList(item.tripsChoices);
        const last = first + interval * (trips - 1);
        const total = last - first;
        const answerText = `${interval}分鐘`;
        questions.push(
          `第一班在${e529FormatClockMinute(first)}出發，最後一班在${e529FormatClockMinute(last)}出發，共 ${trips} 班次，間隔幾分鐘一班？`
        );
        summaryAnswers.push(answerText);
        answers.push(
          e529Answer(
            answerText,
            `先算首末兩班相差 ${total} 分。因為 ${trips} 班次之間共有 ${trips - 1} 個間隔，所以每個間隔 = ${total} ÷ ${trips - 1} = ${interval} 分鐘。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529AddThenMultiplySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      {
        question: '爸爸每週運動 4 次，每次先快走 45 分鐘，再慢跑 1 小時 20 分鐘，一週共運動幾小時幾分？',
        partSeconds: [45 * 60, (60 + 20) * 60],
        times: 4,
        answerKind: 'hm',
      },
      {
        question: '弦樂團每週練習 5 次，每次先自練 40 分鐘，再合奏 1 小時 10 分鐘，共練幾小時幾分？',
        partSeconds: [40 * 60, (60 + 10) * 60],
        times: 5,
        answerKind: 'hm',
      },
      {
        question: '一場教學包包含 7 分 40 秒影片和 30 秒遊戲，完成 5 場共要幾分幾秒？',
        partSeconds: [7 * 60 + 40, 30],
        times: 5,
        answerKind: 'ms',
      },
      {
        question: '媽媽每次炸薯條都要先準備材料 10 分鐘，加上炸的時間 6 分 50 秒，炸 4 次共花幾分幾秒？',
        partSeconds: [10 * 60, 6 * 60 + 50],
        times: 4,
        answerKind: 'ms',
      },
      {
        question: '每部影片前有 5 分 20 秒廣告，影片長 28 分 50 秒，連播 6 次共幾小時幾分？',
        partSeconds: [5 * 60 + 20, 28 * 60 + 50],
        times: 6,
        answerKind: 'hm',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const onceSeconds = item.partSeconds.reduce((sum, value) => sum + value, 0);
      const totalSeconds = onceSeconds * item.times;
      const answerText =
        item.answerKind === 'ms' ? e529FormatMinuteSecond(totalSeconds) : e529FormatDuration(totalSeconds / 60);
      questions.push(item.question);
      summaryAnswers.push(answerText);
      answers.push(
        e529Answer(
          answerText,
          `先把每次的兩段時間相加：${item.partSeconds.join(' + ')} = ${onceSeconds} 秒。再算 ${onceSeconds} × ${item.times} = ${totalSeconds} 秒，最後換回題目要的形式，所以是 ${answerText}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529WorkConstantSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { unit: '個農夫', oldChoices: [2, 3, 4], newChoices: [4, 6, 8], timeUnit: '天', totalWork: 12 },
      { unit: '位師傅', oldChoices: [3, 4, 5], newChoices: [6, 8, 10], timeUnit: '天', totalWork: 24 },
      { unit: '條生產線', oldChoices: [4, 6, 8], newChoices: [6, 8, 12], timeUnit: '小時', totalWork: 72 },
      { unit: '人', oldChoices: [4, 6, 8], newChoices: [8, 10, 12], timeUnit: '天', totalWork: 24 },
      { unit: '台機器', oldChoices: [2, 3, 4], newChoices: [4, 6, 8], timeUnit: '小時', totalWork: 60 },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const oldCount = pickFromList(item.oldChoices);
      const newCount = pickFromList(item.newChoices.filter((value) => value !== oldCount));
      const oldTime = item.totalWork / oldCount;
      const newTime = item.totalWork / newCount;
      const answerText = `${newTime}${item.timeUnit}`;
      questions.push(
        `${oldCount}${item.unit}${oldTime}${item.timeUnit}完成，若改成${newCount}${item.unit}一起做，需要多少${item.timeUnit}？`
      );
      summaryAnswers.push(answerText);
      answers.push(
        e529Answer(
          answerText,
          `總工作量不變，所以 ${oldCount} × ${oldTime} = ${newCount} × 新時間。先算總工作量是 ${oldCount * oldTime}，再用 ${oldCount * oldTime} ÷ ${newCount} = ${newTime}，所以需要 ${answerText}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529EfficiencyGapSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      {
        totalSeconds: 10 * 3600 + 30 * 60,
        oldCount: 6,
        newCount: 70,
        context: '3D列印',
        unit: '個吊飾',
        label: '1個吊飾',
        answerUnit: '小時分',
      },
      {
        totalSeconds: 4 * 3600 + 12 * 60,
        oldCount: 9,
        newCount: 42,
        context: '手工組裝',
        unit: '件',
        label: '1件',
        answerUnit: '分秒',
      },
      {
        totalSeconds: 18 * 60 + 40,
        oldCount: 10,
        newCount: 16,
        context: '編織效率',
        unit: '個',
        label: '1個',
        answerUnit: '秒',
      },
      {
        totalSeconds: 30 * 60 + 150,
        oldCount: 30,
        newCount: 60,
        context: '工廠更新',
        unit: '個',
        label: '1個',
        answerUnit: '秒',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const oldPer = item.totalSeconds / item.oldCount;
      const newPer = item.totalSeconds / item.newCount;
      const diff = oldPer - newPer;
      let answerText = '';
      if (item.answerUnit === '小時分') {
        answerText = e529FormatDuration(diff / 60);
      } else if (item.answerUnit === '分秒') {
        answerText = e529FormatMinuteSecond(diff);
      } else {
        answerText = `${diff}秒`;
      }
      questions.push(
        `${item.context}：舊機器做 ${item.oldCount}${item.unit}共花 ${e529BuildScaledDuration(item.totalSeconds, ['hour', 'minute', 'second'])}，新機器同樣時間做 ${item.newCount}${item.unit}，做 ${item.label}相差多久？`
      );
      summaryAnswers.push(answerText);
      answers.push(
        e529Answer(
          answerText,
          `舊機器平均做 ${item.label}要 ${item.totalSeconds} ÷ ${item.oldCount} = ${oldPer} 秒，新機器平均做 ${item.label}要 ${item.totalSeconds} ÷ ${item.newCount} = ${newPer} 秒。相差 ${oldPer} - ${newPer} = ${diff} 秒，所以是 ${answerText}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529CompositeSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](1);
      questions.push(generated.questions[0]);
      summaryAnswers.push(generated.summaryAnswers[0]);
      answers.push(generated.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529ConvertCompareFourSet(count) {
    return buildE529CompositeSet(
      [
        buildE529LargeToCompoundSet,
        buildE529SmallToLargeDecimalSet,
        buildE529SmallToLargeFractionSet,
        buildE529CompareTimeSet,
      ],
      count
    );
  }

  function buildE529RepeatFourSet(count) {
    return buildE529CompositeSet(
      [
        buildE529MinuteSecondMultiplySet,
        buildE529HourMinuteMultiplySetV2,
        buildE529DayHourMultiplySet,
        buildE529FixedPeriodAccumulateSet,
      ],
      count
    );
  }

  function buildE529DivisionThreeSet(count) {
    return buildE529CompositeSet(
      [buildE529AverageDurationSet, buildE529ContainedCountSet, buildE529ElapsedThenAverageSet],
      count
    );
  }

  function buildE529ScheduleTwoSet(count) {
    return buildE529CompositeSet([buildE529NthDepartureSet, buildE529IntervalCountMinusOneSet], count);
  }

  function buildE529ApplicationThreeSet(count) {
    return buildE529CompositeSet(
      [buildE529AddThenMultiplySet, buildE529WorkConstantSet, buildE529EfficiencyGapSet],
      count
    );
  }


  function buildE529SpeedDistanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // 24 組已驗算的（時速, 行駛小時, 行駛分鐘, 距離）— 答案均為整數公里
    const pool = [
      { speed: 60, h: 2, m: 30, dist: 150 },
      { speed: 70, h: 2, m: 30, dist: 175 },
      { speed: 80, h: 2, m: 15, dist: 180 },
      { speed: 80, h: 3, m: 15, dist: 260 },
      { speed: 90, h: 3, m: 40, dist: 330 },
      { speed: 100, h: 1, m: 30, dist: 150 },
      { speed: 75, h: 2, m: 40, dist: 200 },
      { speed: 60, h: 2, m: 45, dist: 165 },
      { speed: 48, h: 2, m: 30, dist: 120 },
      { speed: 120, h: 1, m: 30, dist: 180 },
      { speed: 60, h: 1, m: 45, dist: 105 },
      { speed: 96, h: 2, m: 30, dist: 240 },
      { speed: 60, h: 2, m: 20, dist: 140 },
      { speed: 84, h: 2, m: 20, dist: 196 },
      { speed: 80, h: 2, m: 45, dist: 220 },
      { speed: 66, h: 2, m: 20, dist: 154 },
      { speed: 54, h: 2, m: 40, dist: 144 },
      { speed: 75, h: 1, m: 20, dist: 100 },
      { speed: 60, h: 3, m: 20, dist: 200 },
      { speed: 90, h: 1, m: 20, dist: 120 },
      { speed: 105, h: 2, m: 40, dist: 280 },
      { speed: 72, h: 1, m: 40, dist: 120 },
      { speed: 80, h: 1, m: 30, dist: 120 },
      { speed: 60, h: 3, m: 45, dist: 225 },
    ];
    // 情境用語，增加題目多樣性
    const ctxFns = [
      (s, t) => `一輛汽車以時速 ${s} 公里行駛，行駛了 ${t}，請問共走了多少公里？`,
      (s, t) => `一列火車以時速 ${s} 公里的速度行駛，行駛 ${t} 後共走了多少公里？`,
      (s, t) => `一輛公車以時速 ${s} 公里前進，行駛了 ${t}，共行駛了多少公里？`,
      (s, t) => `一輛卡車以時速 ${s} 公里行駛，行駛 ${t} 後，抵達目的地，距離是多少公里？`,
      (s, t) => `小明搭乘時速 ${s} 公里的火車，乘坐了 ${t}，共移動了多少公里？`,
    ];
    // 把分鐘轉成小數或分數說明
    function toFracStr(h, m) {
      if (m === 30) return `${h}.5 小時`;
      if (m === 15) return `${h}.25 小時`;
      if (m === 45) return `${h}.75 小時`;
      if (m === 20) return `${h} 又 1/3 小時`;
      if (m === 40) return `${h} 又 2/3 小時`;
      return `${h + m / 60} 小時`;
    }
    for (let i = 0; i < count; i += 1) {
      const c = pool[randInt(0, pool.length - 1)];
      const timeStr = `${c.h} 小時 ${c.m} 分`;
      const fracStr = toFracStr(c.h, c.m);
      const ctx = ctxFns[randInt(0, ctxFns.length - 1)];
      questions.push(ctx(c.speed, timeStr));
      summaryAnswers.push(`${c.dist}公里`);
      answers.push(
        `簡答：${c.dist}公里。過程：先換算時間，${timeStr} = ${fracStr}，距離 = 時速 × 時間 = ${c.speed} × ${fracStr} = ${c.dist} 公里。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529MatchWithBreakSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // 15 組已驗算的比賽情境（total = sections×secMin + breaks×breakMin + halftime）
    const pool = [
      { sport: '籃球賽', sections: 4, secMin: 12, breaks: 3, breakMin: 2, halftime: 15, total: 69, unit: '節' },
      { sport: '足球賽', sections: 2, secMin: 45, breaks: 1, breakMin: 15, halftime: 0, total: 105, unit: '半場' },
      { sport: '排球賽', sections: 3, secMin: 20, breaks: 2, breakMin: 5, halftime: 10, total: 80, unit: '局' },
      { sport: '桌球賽', sections: 5, secMin: 15, breaks: 4, breakMin: 2, halftime: 0, total: 83, unit: '局' },
      { sport: '橄欖球賽', sections: 4, secMin: 10, breaks: 3, breakMin: 3, halftime: 12, total: 61, unit: '節' },
      { sport: '羽球賽', sections: 3, secMin: 25, breaks: 2, breakMin: 5, halftime: 0, total: 85, unit: '局' },
      { sport: '手球賽', sections: 2, secMin: 30, breaks: 1, breakMin: 10, halftime: 0, total: 70, unit: '半場' },
      { sport: '棒球賽', sections: 3, secMin: 20, breaks: 2, breakMin: 3, halftime: 5, total: 71, unit: '節' },
      { sport: '冰上曲棍球賽', sections: 3, secMin: 20, breaks: 2, breakMin: 15, halftime: 0, total: 90, unit: '節' },
      { sport: '網球賽', sections: 3, secMin: 30, breaks: 2, breakMin: 5, halftime: 0, total: 100, unit: '盤' },
      { sport: '籃球賽', sections: 4, secMin: 10, breaks: 3, breakMin: 2, halftime: 15, total: 61, unit: '節' },
      { sport: '足球賽', sections: 2, secMin: 40, breaks: 1, breakMin: 20, halftime: 0, total: 100, unit: '半場' },
      { sport: '游泳接力賽', sections: 4, secMin: 5, breaks: 3, breakMin: 2, halftime: 0, total: 26, unit: '輪' },
      { sport: '壘球賽', sections: 3, secMin: 25, breaks: 2, breakMin: 5, halftime: 0, total: 85, unit: '局' },
      { sport: '排球賽', sections: 5, secMin: 15, breaks: 4, breakMin: 3, halftime: 0, total: 87, unit: '局' },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = pool[randInt(0, pool.length - 1)];
      const gamePart = `${c.sections} ${c.unit} × 每${c.unit} ${c.secMin} 分 = ${c.sections * c.secMin} 分`;
      const breakPart = c.breaks > 0 ? `${c.breaks} 次${c.unit}間休息 × ${c.breakMin} 分 = ${c.breaks * c.breakMin} 分` : '';
      const halftimePart = c.halftime > 0 ? `大中場休息 ${c.halftime} 分` : '';
      const parts = [gamePart, breakPart, halftimePart].filter(Boolean);
      questions.push(
        `一場${c.sport}共 ${c.sections} ${c.unit}，每${c.unit}進行 ${c.secMin} 分鐘，${c.unit}間休息 ${c.breakMin} 分鐘${c.halftime > 0 ? `，另有大中場休息 ${c.halftime} 分鐘` : ''}，整場比賽共歷時多少分鐘？`
      );
      summaryAnswers.push(`${c.total}分鐘`);
      answers.push(
        `簡答：${c.total}分鐘。過程：${parts.join('；')}；合計 ${c.total} 分鐘。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529TimeRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // 秒數轉時間字串（秒→「X分Y秒」或「X分鐘」或「X秒」）
    function secToStr(s) {
      if (s < 60) return `${s}秒`;
      const m = Math.floor(s / 60);
      const r = s % 60;
      return r === 0 ? `${m}分鐘` : `${m}分${r}秒`;
    }
    // 15 組情境（sec1 為秒，ratio 已驗算，sec2 = sec1 × ratio）
    const pool = [
      { activity: '游泳', dist1: '100公尺', dist2: '200公尺', sec1: 85, ratio: 2 },
      { activity: '走路', dist1: '500公尺', dist2: '1500公尺', sec1: 360, ratio: 3 },
      { activity: '跑步', dist1: '100公尺', dist2: '300公尺', sec1: 75, ratio: 3 },
      { activity: '游泳', dist1: '50公尺', dist2: '100公尺', sec1: 35, ratio: 2 },
      { activity: '健走', dist1: '1公里', dist2: '3公里', sec1: 900, ratio: 3 },
      { activity: '騎腳踏車', dist1: '2公里', dist2: '6公里', sec1: 480, ratio: 3 },
      { activity: '賽跑', dist1: '200公尺', dist2: '400公尺', sec1: 40, ratio: 2 },
      { activity: '跑步', dist1: '1公里', dist2: '2公里', sec1: 300, ratio: 2 },
      { activity: '慢跑', dist1: '2公里', dist2: '10公里', sec1: 720, ratio: 5 },
      { activity: '游泳', dist1: '100公尺', dist2: '400公尺', sec1: 90, ratio: 4 },
      { activity: '走路', dist1: '200公尺', dist2: '800公尺', sec1: 120, ratio: 4 },
      { activity: '騎車', dist1: '5公里', dist2: '15公里', sec1: 1200, ratio: 3 },
      { activity: '游泳', dist1: '100公尺', dist2: '500公尺', sec1: 80, ratio: 5 },
      { activity: '跑步', dist1: '400公尺', dist2: '800公尺', sec1: 80, ratio: 2 },
      { activity: '健走', dist1: '500公尺', dist2: '2500公尺', sec1: 360, ratio: 5 },
    ];
    // 使用不同稱呼增加多樣性
    const names = ['小明', '小華', '小美', '小強', '小莉', '小傑'];
    for (let i = 0; i < count; i += 1) {
      const c = pool[randInt(0, pool.length - 1)];
      const sec2 = c.sec1 * c.ratio;
      const t1 = secToStr(c.sec1);
      const t2 = secToStr(sec2);
      const name = names[randInt(0, names.length - 1)];
      questions.push(
        `${name}${c.activity}${c.dist1}需要 ${t1}，${c.activity}${c.dist2}需要 ${t2}，${c.activity}${c.dist2}所需的時間是${c.activity}${c.dist1}的幾倍？`
      );
      summaryAnswers.push(`${c.ratio}倍`);
      answers.push(
        `簡答：${c.ratio}倍。過程：先統一單位，${t2} = ${sec2}秒，${t1} = ${c.sec1}秒，${sec2} ÷ ${c.sec1} = ${c.ratio} 倍。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE529SpeedMatchThreeSet(count) {
    return buildE529CompositeSet(
      [buildE529SpeedDistanceSet, buildE529MatchWithBreakSet, buildE529TimeRatioSet],
      count
    );
  }

  function e530Answer(shortAnswer, process) {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function e530Trim(value, digits = 3) {
    return trimDecimalString(Number(value.toFixed(digits)).toString());
  }

  function e530FormatLengthKm(kmValue) {
    return `${e530Trim(kmValue)}公里`;
  }

  function e530FormatWeightTonnes(tonneValue) {
    return `${e530Trim(tonneValue)}公噸`;
  }

  function e530FormatAreaSquareMeters(squareMeterValue) {
    return `${e530Trim(squareMeterValue)}平方公尺`;
  }

  function e530FormatAreaAres(areValue) {
    return `${e530Trim(areValue)}公畝`;
  }

  function e530FormatAreaHectares(hectareValue) {
    return `${e530Trim(hectareValue)}公頃`;
  }

  function e530FormatAreaSquareKilometers(squareKmValue) {
    return `${e530Trim(squareKmValue)}平方公里`;
  }

  function buildE530MeterKilometerConvertSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const meter = pickFromList([205, 342, 809, 1280, 1940, 2005, 2167, 3776, 4200, 5605]);
        const kilometer = meter / 1000;
        const answerText = e530FormatLengthKm(kilometer);
        questions.push(`${meter}公尺也可以說是幾公里？`);
        summaryAnswers.push(answerText);
        answers.push(
          e530Answer(
            answerText,
            `1 公里 = 1000 公尺，所以 ${meter} 公尺 ÷ 1000 = ${e530Trim(kilometer)}，因此是 ${answerText}。`
          )
        );
      } else {
        const kilometer = pickFromList([0.38, 0.64, 1.307, 2.015, 3.776, 4.2, 6.4, 12.08, 15.25, 42.195]);
        const meter = kilometer * 1000;
        const answerText = `${meter}公尺`;
        questions.push(`${e530Trim(kilometer)}公里等於幾公尺？`);
        summaryAnswers.push(answerText);
        answers.push(
          e530Answer(answerText, `1 公里 = 1000 公尺，所以 ${e530Trim(kilometer)} 公里 × 1000 = ${meter} 公尺。`)
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE530LengthUnitJudgmentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      ['老師參加的路跑比賽全長大約是 10（　）', '公里'],
      ['新竹到臺中的距離大約 95（　）', '公里'],
      ['學校操場一圈大約是 200（　）', '公尺'],
      ['運動場的操場一圈大約是 400（　）', '公尺'],
      ['爸爸的身高是 170（　）', '公分'],
      ['一張書桌的長大約是 120（　）', '公分'],
      ['從教室走到校門口大約是 350（　）', '公尺'],
      ['臺北到高雄的距離大約是 350（　）', '公里'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [questionBody, unit] = bank[i % bank.length];
      questions.push(`${questionBody}，應該填入什麼單位？`);
      summaryAnswers.push(unit);
      answers.push(
        e530Answer(unit, `依照生活經驗判斷，這個情境的長度量級最適合用「${unit}」表示，所以答案是 ${unit}。`)
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE530LengthCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [3600, 3, 60],
      [4030, 4, 30],
      [2070, 2, 70],
      [1700, 1, 700],
      [2007, 2, 7],
      [5605, 5, 605],
      [4800, 4, 900],
      [1250, 1, 180],
    ];
    for (let i = 0; i < count; i += 1) {
      const [leftMeters, rightKm, rightMeters] = bank[i % bank.length];
      const rightTotal = rightKm * 1000 + rightMeters;
      const symbol = leftMeters > rightTotal ? '>' : leftMeters < rightTotal ? '<' : '=';
      questions.push(`比比看：${leftMeters}公尺 □ ${rightKm}公里${rightMeters}公尺`);
      summaryAnswers.push(symbol);
      answers.push(
        e530Answer(
          symbol,
          `${rightKm} 公里 ${rightMeters} 公尺 = ${rightTotal} 公尺。比較 ${leftMeters} 公尺和 ${rightTotal} 公尺，可得 ${leftMeters} ${symbol} ${rightTotal}，所以填 ${symbol}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE530LengthApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const types = [
      () => {
        const hours = pickFromList([2, 3, 4, 5, 6, 8]);
        const perHour = pickFromList([3.2, 3.5, 3.75, 3.85, 4.1, 4.25]);
        const totalKm = e530Trim(hours * perHour, 2);
        const answerText = `${e530Trim(perHour, 2)}公里`;
        return {
          question: `健行活動中，隊伍 ${hours} 小時走完 ${totalKm} 公里，平均 1 小時走幾公里？`,
          answer: answerText,
          process: `${totalKm} 公里 ÷ ${hours} 小時 = ${e530Trim(perHour, 2)} 公里，所以平均 1 小時走 ${answerText}。`,
        };
      },
      () => {
        const kilometers = pickFromList([15, 18, 20, 24, 30, 36]);
        const fuelPerKm = pickFromList([0.6, 0.7, 0.75, 0.8, 0.85]);
        const totalFuel = e530Trim(kilometers * fuelPerKm, 2);
        const answerText = `${e530Trim(fuelPerKm, 2)}公升`;
        return {
          question: `車子行駛 ${kilometers} 公里共用了 ${totalFuel} 公升汽油，平均 1 公里用多少公升汽油？`,
          answer: answerText,
          process: `${totalFuel} 公升 ÷ ${kilometers} 公里 = ${e530Trim(fuelPerKm, 2)} 公升，所以平均 1 公里用 ${answerText} 汽油。`,
        };
      },
      () => {
        const totalKm = pickFromList([24, 30, 35, 42, 48, 60]);
        const numerator = pickFromList([2, 3, 4, 5, 7]);
        const denominator = pickFromList([5, 8, 10]);
        const distance = (totalKm * numerator) / denominator;
        const answerText = `${e530Trim(distance, 2)}公里`;
        return {
          question: `甲、乙兩地相距 ${totalKm} 公里，位在全程的 ${numerator}/${denominator} 處有一個休息站，這個休息站離甲地幾公里？`,
          answer: answerText,
          process: `全程 ${totalKm} 公里，休息站在全程的 ${numerator}/${denominator} 處，所以距離甲地 ${totalKm} × ${numerator}/${denominator} = ${e530Trim(distance, 2)} 公里。`,
        };
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const built = types[i % types.length]();
      questions.push(built.question);
      summaryAnswers.push(built.answer);
      answers.push(e530Answer(built.answer, built.process));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE530TonneKilogramConvertSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const kilograms = pickFromList([20, 650, 1700, 6500, 8100, 9060, 12500, 27600, 81000]);
        const tonnes = kilograms / 1000;
        const answerText = e530FormatWeightTonnes(tonnes);
        questions.push(`${kilograms}公斤也可以說是幾公噸？`);
        summaryAnswers.push(answerText);
        answers.push(
          e530Answer(
            answerText,
            `1 公噸 = 1000 公斤，所以 ${kilograms} 公斤 ÷ 1000 = ${e530Trim(tonnes)}，因此是 ${answerText}。`
          )
        );
      } else {
        const tonnes = pickFromList([1.025, 3.9, 13.5, 20, 42.08, 102]);
        const kilograms = tonnes * 1000;
        const answerText = `${kilograms}公斤`;
        questions.push(`${e530Trim(tonnes)}公噸等於幾公斤？`);
        summaryAnswers.push(answerText);
        answers.push(
          e530Answer(answerText, `1 公噸 = 1000 公斤，所以 ${e530Trim(tonnes)} 公噸 × 1000 = ${kilograms} 公斤。`)
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE530WeightUnitJudgmentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      ['一輛客運的重量大約是 16.5（　）', '公噸'],
      ['成年貓熊的體重大約是 90（　）', '公斤'],
      ['一個馬克杯大約重 340（　）', '公克'],
      ['一隻雞的體重大約 1.2（　）', '公斤'],
      ['一本數學課本約重 300（　）', '公克'],
      ['一台大卡車載貨後約重 18（　）', '公噸'],
      ['一顆蘋果大約重 180（　）', '公克'],
      ['一包白米大約重 5（　）', '公斤'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [questionBody, unit] = bank[i % bank.length];
      questions.push(`${questionBody}，應該填入什麼單位？`);
      summaryAnswers.push(unit);
      answers.push(e530Answer(unit, `依照物體常見的重量大小判斷，這裡最適合用「${unit}」表示，所以答案是 ${unit}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE530WeightCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [6014, 6.14],
      [20670, 2.067],
      [18000, 18],
      [1137, 1.137],
      [7005, 7.005],
      [8450, 8.45],
      [3200, 3.02],
      [9500, 9.8],
    ];
    for (let i = 0; i < count; i += 1) {
      const [leftKilograms, rightTonnes] = bank[i % bank.length];
      const rightKilograms = rightTonnes * 1000;
      const symbol = leftKilograms > rightKilograms ? '>' : leftKilograms < rightKilograms ? '<' : '=';
      questions.push(`比比看：${leftKilograms}公斤 □ ${e530Trim(rightTonnes)}公噸`);
      summaryAnswers.push(symbol);
      answers.push(
        e530Answer(
          symbol,
          `${e530Trim(rightTonnes)} 公噸 = ${rightKilograms} 公斤。比較 ${leftKilograms} 公斤和 ${rightKilograms} 公斤，可得 ${leftKilograms} ${symbol} ${rightKilograms}，所以填 ${symbol}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE530WeightApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const types = [
      () => {
        const perDay = pickFromList([125, 240, 360, 515, 620, 750]);
        const days = pickFromList([7, 10, 20, 30]);
        const totalKg = perDay * days;
        const tonnes = totalKg / 1000;
        const answerText = e530FormatWeightTonnes(tonnes);
        return {
          question: `果菜市場每天進貨 ${perDay} 公斤蔬果，${days} 天共進貨多少公噸？`,
          answer: answerText,
          process: `先算總重量：${perDay} × ${days} = ${totalKg} 公斤。再換成公噸：${totalKg} ÷ 1000 = ${e530Trim(tonnes)} 公噸，所以是 ${answerText}。`,
        };
      },
      () => {
        const totalTonnes = pickFromList([4, 5, 6, 8, 10]);
        const eachKg = pickFromList([500, 1000, 1250, 2000, 2500]);
        const totalKg = totalTonnes * 1000;
        const times = totalKg / eachKg;
        const answerText = `${times}次`;
        return {
          question: `倉庫有 ${totalTonnes} 公噸飼料，小貨車一次載 ${eachKg} 公斤，幾次能載完？`,
          answer: answerText,
          process: `${totalTonnes} 公噸 = ${totalKg} 公斤，再算 ${totalKg} ÷ ${eachKg} = ${times}，所以要 ${answerText}。`,
        };
      },
      () => {
        const emptyTonnes = pickFromList([3.2, 3.8, 4.3, 5.1, 5.6]);
        const cargoKg = pickFromList([1200, 1800, 2400, 3200, 4500]);
        const totalTonnes = emptyTonnes + cargoKg / 1000;
        const answerText = e530FormatWeightTonnes(totalTonnes);
        return {
          question: `貨車空車重 ${e530Trim(emptyTonnes)} 公噸，裝貨後增加 ${cargoKg} 公斤，貨車總重幾公噸？`,
          answer: answerText,
          process: `${cargoKg} 公斤 = ${e530Trim(cargoKg / 1000)} 公噸，所以總重是 ${e530Trim(emptyTonnes)} + ${e530Trim(cargoKg / 1000)} = ${e530Trim(totalTonnes)} 公噸。`,
        };
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const built = types[i % types.length]();
      questions.push(built.question);
      summaryAnswers.push(built.answer);
      answers.push(e530Answer(built.answer, built.process));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE530AreaAdjacentConvertSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const hectares = pickFromList([3, 5, 8, 9.3, 12, 18, 24]);
        const ares = hectares * 100;
        const answerText = `${ares}公畝`;
        questions.push(`${e530Trim(hectares)}公頃等於幾公畝？`);
        summaryAnswers.push(answerText);
        answers.push(
          e530Answer(
            answerText,
            `1 公頃 = 100 公畝，所以 ${e530Trim(hectares)} 公頃 = ${e530Trim(hectares)} × 100 = ${ares} 公畝。`
          )
        );
      } else if (mode === 1) {
        const squareMeters = pickFromList([600, 750, 1200, 4500, 8500, 12300]);
        const ares = squareMeters / 100;
        const answerText = e530FormatAreaAres(ares);
        questions.push(`${squareMeters}平方公尺等於幾公畝？`);
        summaryAnswers.push(answerText);
        answers.push(
          e530Answer(
            answerText,
            `100 平方公尺 = 1 公畝，所以 ${squareMeters} 平方公尺 ÷ 100 = ${e530Trim(ares)} 公畝。`
          )
        );
      } else if (mode === 2) {
        const ares = pickFromList([46, 85, 120.6, 230, 460, 750]);
        const hectares = ares / 100;
        const answerText = e530FormatAreaHectares(hectares);
        questions.push(`${e530Trim(ares)}公畝等於幾公頃？`);
        summaryAnswers.push(answerText);
        answers.push(
          e530Answer(answerText, `100 公畝 = 1 公頃，所以 ${e530Trim(ares)} 公畝 ÷ 100 = ${e530Trim(hectares)} 公頃。`)
        );
      } else {
        const squareKm = pickFromList([1.5, 2.3, 4.6, 8, 12.06]);
        const hectares = squareKm * 100;
        const answerText = `${hectares}公頃`;
        questions.push(`${e530Trim(squareKm)}平方公里等於幾公頃？`);
        summaryAnswers.push(answerText);
        answers.push(
          e530Answer(
            answerText,
            `1 平方公里 = 100 公頃，所以 ${e530Trim(squareKm)} 平方公里 = ${e530Trim(squareKm)} × 100 = ${hectares} 公頃。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE530AreaCrossConvertSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const hectares = pickFromList([4, 8, 12, 16, 25, 30]);
        const squareMeters = hectares * 10000;
        const answerText = `${squareMeters}平方公尺`;
        questions.push(`${hectares}公頃等於幾平方公尺？`);
        summaryAnswers.push(answerText);
        answers.push(
          e530Answer(
            answerText,
            `1 公頃 = 10000 平方公尺，所以 ${hectares} 公頃 = ${hectares} × 10000 = ${squareMeters} 平方公尺。`
          )
        );
      } else if (mode === 1) {
        const ares = pickFromList([30.23, 45.5, 60.8, 85, 120.5]);
        const squareMeters = ares * 100;
        const answerText = e530FormatAreaSquareMeters(squareMeters);
        questions.push(`${e530Trim(ares)}公畝等於幾平方公尺？`);
        summaryAnswers.push(answerText);
        answers.push(
          e530Answer(
            answerText,
            `1 公畝 = 100 平方公尺，所以 ${e530Trim(ares)} 公畝 = ${e530Trim(ares)} × 100 = ${e530Trim(squareMeters)} 平方公尺。`
          )
        );
      } else if (mode === 2) {
        const squareKm = pickFromList([0.006, 0.08, 0.25, 1.2, 3.45]);
        const ares = squareKm * 10000;
        const answerText = `${ares}公畝`;
        questions.push(`${e530Trim(squareKm)}平方公里等於幾公畝？`);
        summaryAnswers.push(answerText);
        answers.push(
          e530Answer(
            answerText,
            `1 平方公里 = 100 公頃 = 10000 公畝，所以 ${e530Trim(squareKm)} 平方公里 = ${e530Trim(squareKm)} × 10000 = ${ares} 公畝。`
          )
        );
      } else {
        const squareMeters = pickFromList([123500, 235000, 456000, 780000]);
        const hectares = squareMeters / 10000;
        const answerText = e530FormatAreaHectares(hectares);
        questions.push(`${squareMeters}平方公尺等於幾公頃？`);
        summaryAnswers.push(answerText);
        answers.push(
          e530Answer(
            answerText,
            `1 公頃 = 10000 平方公尺，所以 ${squareMeters} 平方公尺 ÷ 10000 = ${e530Trim(hectares)} 公頃。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE530AreaUnitJudgmentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      ['學校操場一圈的面積大約是 65（　）', '公畝'],
      ['教室的面積大約是 120（　）', '平方公尺'],
      ['臺灣本島的總面積大約是 36000（　）', '平方公里'],
      ['一塊可以耕地的農田大約是 2（　）', '公頃'],
      ['一個標準羽球場的面積約 82（　）', '平方公尺'],
      ['一個社區公園的面積大約是 5（　）', '公畝'],
      ['一個縣市的面積大約是 1200（　）', '平方公里'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [questionBody, unit] = bank[i % bank.length];
      questions.push(`${questionBody}，應該填入什麼單位？`);
      summaryAnswers.push(unit);
      answers.push(e530Answer(unit, `依照面積大小判斷，這個情境最適合用「${unit}」表示，所以答案是 ${unit}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE530AreaCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const compareBank = [
      { type: 'compare', leftText: '60公頃', leftValue: 600000, rightText: '600公畝', rightValue: 60000 },
      { type: 'compare', leftText: '8公頃', leftValue: 80000, rightText: '80平方公尺', rightValue: 80 },
      { type: 'compare', leftText: '1.5平方公里', leftValue: 1500000, rightText: '1500公頃', rightValue: 15000000 },
      { type: 'compare', leftText: '23公畝', leftValue: 2300, rightText: '0.18公頃', rightValue: 1800 },
      {
        type: 'sort',
        items: [
          { text: '2.3公頃', value: 23000 },
          { text: '230平方公尺', value: 230 },
          { text: '23公畝', value: 2300 },
        ],
      },
      {
        type: 'sort',
        items: [
          { text: '85公頃', value: 850000 },
          { text: '8500平方公尺', value: 8500 },
          { text: '850公畝', value: 85000 },
        ],
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = compareBank[i % compareBank.length];
      if (item.type === 'compare') {
        const symbol = item.leftValue > item.rightValue ? '>' : item.leftValue < item.rightValue ? '<' : '=';
        questions.push(`比較大小：${item.leftText} □ ${item.rightText}`);
        summaryAnswers.push(symbol);
        answers.push(
          e530Answer(
            symbol,
            `先統一成平方公尺比較：${item.leftText} = ${item.leftValue} 平方公尺，${item.rightText} = ${item.rightValue} 平方公尺，所以填 ${symbol}。`
          )
        );
      } else {
        const sorted = [...item.items].sort((a, b) => b.value - a.value);
        const answerText = sorted.map((entry) => entry.text).join(' > ');
        questions.push(`將 ${item.items.map((entry) => entry.text).join('、')} 由大到小排列。`);
        summaryAnswers.push(answerText);
        answers.push(e530Answer(answerText, `先統一成平方公尺比較，再由大到小排列，可得 ${answerText}。`));
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE530AreaShapeApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const types = [
      () => {
        const length = pickFromList([105, 120, 150, 180, 220]);
        const width = pickFromList([40, 65, 80, 90]);
        const areaSqm = length * width;
        const are = areaSqm / 100;
        const answerText = e530FormatAreaAres(are);
        return {
          question: `一塊長方形菜園長 ${length} 公尺、寬 ${width} 公尺，面積是幾公畝？`,
          answer: answerText,
          process: `長方形面積 = 長 × 寬 = ${length} × ${width} = ${areaSqm} 平方公尺。再換成公畝：${areaSqm} ÷ 100 = ${e530Trim(are)} 公畝，所以是 ${answerText}。`,
        };
      },
      () => {
        const base = pickFromList([3000, 3600, 4500, 5200]);
        const heightKm = pickFromList([0.2, 0.4, 0.6, 1, 1.2]);
        const heightMeters = heightKm * 1000;
        const areaSqm = (base * heightMeters) / 2;
        const squareKm = areaSqm / 1000000;
        const answerText = e530FormatAreaSquareKilometers(squareKm);
        return {
          question: `一塊三角形土地底 ${base} 公尺、高 ${e530Trim(heightKm)} 公里，面積是幾平方公里？`,
          answer: answerText,
          process: `${e530Trim(heightKm)} 公里 = ${heightMeters} 公尺。三角形面積 = 底 × 高 ÷ 2 = ${base} × ${heightMeters} ÷ 2 = ${areaSqm} 平方公尺。再換成平方公里：${areaSqm} ÷ 1000000 = ${e530Trim(squareKm)} 平方公里。`,
        };
      },
      () => {
        const upper = pickFromList([300, 400, 500, 600]);
        const lower = pickFromList([700, 900, 1000, 1200]);
        const height = pickFromList([40, 50, 80, 100]);
        const areaSqm = ((upper + lower) * height) / 2;
        const are = areaSqm / 100;
        const answerText = e530FormatAreaAres(are);
        return {
          question: `一塊梯形土地上底 ${upper} 公尺、下底 ${lower} 公尺、高 ${height} 公尺，面積是幾公畝？`,
          answer: answerText,
          process: `梯形面積 = （上底 + 下底）× 高 ÷ 2 = （${upper} + ${lower}）× ${height} ÷ 2 = ${areaSqm} 平方公尺。再換成公畝：${areaSqm} ÷ 100 = ${e530Trim(are)} 公畝。`,
        };
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const built = types[i % types.length]();
      questions.push(built.question);
      summaryAnswers.push(built.answer);
      answers.push(e530Answer(built.answer, built.process));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE530MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = banks[i % banks.length](1);
      questions.push(built.questions[0]);
      summaryAnswers.push(built.summaryAnswers[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE530LengthFourSet(count) {
    return buildE530MixedSet(
      [
        buildE530MeterKilometerConvertSet,
        buildE530LengthUnitJudgmentSet,
        buildE530LengthCompareSet,
        buildE530LengthApplicationSet,
      ],
      count
    );
  }

  function buildE530WeightFourSet(count) {
    return buildE530MixedSet(
      [
        buildE530TonneKilogramConvertSet,
        buildE530WeightUnitJudgmentSet,
        buildE530WeightCompareSet,
        buildE530WeightApplicationSet,
      ],
      count
    );
  }

  function buildE530AreaFiveSet(count) {
    return buildE530MixedSet(
      [
        buildE530AreaAdjacentConvertSet,
        buildE530AreaCrossConvertSet,
        buildE530AreaUnitJudgmentSet,
        buildE530AreaCompareSet,
        buildE530AreaShapeApplicationSet,
      ],
      count
    );
  }

  function e525FormatInteger(value) {
    return Number(value).toLocaleString('en-US');
  }

  function e525FourDigitToChinese(value) {
    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const units = ['千', '百', '十', ''];
    const padded = String(value).padStart(4, '0');
    let result = '';
    let needZero = false;
    for (let i = 0; i < 4; i += 1) {
      const digit = Number(padded[i]);
      const unit = units[i];
      const hasLaterNonZero = padded
        .slice(i + 1)
        .split('')
        .some((ch) => ch !== '0');
      if (digit === 0) {
        if (result && hasLaterNonZero) needZero = true;
        continue;
      }
      if (needZero) {
        result += '零';
        needZero = false;
      }
      if (unit === '十' && digit === 1 && result === '') {
        result += '十';
      } else {
        result += `${digits[digit]}${unit}`;
      }
    }
    return result || '零';
  }

  function e525NumberToChinese(value) {
    if (value === 0) return '零';
    const bigUnits = ['', '萬', '億', '兆'];
    const groups = [];
    let remaining = value;
    while (remaining > 0) {
      groups.push(remaining % 10000);
      remaining = Math.floor(remaining / 10000);
    }
    let result = '';
    let pendingZero = false;
    for (let i = groups.length - 1; i >= 0; i -= 1) {
      const group = groups[i];
      if (group === 0) {
        if (result) pendingZero = true;
        continue;
      }
      if (pendingZero || (result && group < 1000)) {
        result += '零';
      }
      result += `${e525FourDigitToChinese(group)}${bigUnits[i]}`;
      pendingZero = false;
    }
    return result;
  }

  function e525PlaceNames() {
    return [
      '個位',
      '十位',
      '百位',
      '千位',
      '萬位',
      '十萬位',
      '百萬位',
      '千萬位',
      '億位',
      '十億位',
      '百億位',
      '千億位',
      '兆位',
    ];
  }

  function e525DigitAtPlace(value, placeIndex) {
    return Math.floor(value / 10 ** placeIndex) % 10;
  }

  function e525MakeLargeNumber(minDigits = 8, maxDigits = 12) {
    const digits = randInt(minDigits, maxDigits);
    let text = String(randInt(1, 9));
    while (text.length < digits) {
      text += String(randInt(0, 9));
    }
    return Number(text);
  }

  function e525MonthLabels() {
    return ['一月', '二月', '三月', '四月', '五月', '六月'];
  }

  function e525WeekLabels() {
    return ['週一', '週二', '週三', '週四', '週五', '週六'];
  }

  function e525BuildSeries(labels, minValue, maxValue, step) {
    const values = [];
    let current = randInt(minValue, maxValue);
    values.push(current);
    for (let i = 1; i < labels.length; i += 1) {
      current += pickFromList([-2, -1, 1, 2, 3]) * step;
      current = Math.max(minValue, Math.min(maxValue, current));
      values.push(current);
    }
    return values;
  }

  function e525SeriesText(labels, values, unit) {
    return labels.map((label, index) => `${label}${values[index]}${unit}`).join('、');
  }

  function buildE525ChineseConvertSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 2;
      const value = e525MakeLargeNumber(9, 13);
      if (mode === 0) {
        const chinese = e525NumberToChinese(value);
        questions.push(`把「${chinese}」記成阿拉伯數字。`);
        summaryAnswers.push(e525FormatInteger(value));
        answers.push(
          `簡答：${e525FormatInteger(value)}。過程：依照「兆、億、萬、個」每四位一組來還原，所以這個數是 ${e525FormatInteger(value)}。`
        );
      } else {
        const chinese = e525NumberToChinese(value);
        questions.push(`把 ${e525FormatInteger(value)} 用中文讀法記下來。`);
        summaryAnswers.push(chinese);
        answers.push(`簡答：${chinese}。過程：從右往左每四位一組，依序配上萬、億、兆，所以讀作「${chinese}」。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525PlaceDigitSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const names = e525PlaceNames();
    for (let i = 0; i < count; i += 1) {
      const value = e525MakeLargeNumber(9, 13);
      const maxPlace = String(value).length - 1;
      const place = randInt(0, maxPlace);
      const digit = e525DigitAtPlace(value, place);
      questions.push(`在 ${e525FormatInteger(value)} 中，${names[place]}數字是多少？`);
      summaryAnswers.push(`${digit}`);
      answers.push(`簡答：${digit}。過程：從個位往左數，${names[place]}上的數字就是 ${digit}。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525UnitComposeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const units = [
      { value: 1000000000000, label: '兆', max: 5 },
      { value: 100000000, label: '億', max: 9 },
      { value: 10000, label: '萬', max: 9999 },
      { value: 1, label: '個', max: 9999 },
    ];
    for (let i = 0; i < count; i += 1) {
      const picks = units.map((unit) => ({ ...unit, count: randInt(0, unit.max) }));
      if (picks.every((item) => item.count === 0)) picks[1].count = randInt(1, 9);
      const value = picks.reduce((sum, item) => sum + item.count * item.value, 0);
      const prompt = picks
        .filter((item) => item.count > 0)
        .map((item) => `${item.count}${item.label}`)
        .join('、');
      questions.push(`${prompt}，合起來是多少？`);
      summaryAnswers.push(e525FormatInteger(value));
      answers.push(
        `簡答：${e525FormatInteger(value)}。過程：把各單位都換成個再相加，所以答案是 ${e525FormatInteger(value)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525ExpandedNotationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 2;
      const value = e525MakeLargeNumber(5, 9);
      const digits = String(value).split('');
      if (mode === 0) {
        const parts = digits.map((digit, index) => `${digit}×${10 ** (digits.length - 1 - index)}`).join(' + ');
        questions.push(`把 ${e525FormatInteger(value)} 寫成十進位表示法。`);
        summaryAnswers.push(parts);
        answers.push(`簡答：${parts}。過程：把每一位拆成「數字 × 位值」，再全部相加。`);
      } else {
        const nonZeroParts = digits
          .map((digit, index) => ({ digit: Number(digit), value: 10 ** (digits.length - 1 - index) }))
          .filter((item) => item.digit !== 0)
          .map((item) => `${item.digit}×${item.value}`)
          .join(' + ');
        questions.push(`把 ${nonZeroParts} 合起來，寫成原來的數。`);
        summaryAnswers.push(e525FormatInteger(value));
        answers.push(`簡答：${e525FormatInteger(value)}。過程：依各位值相加，得到 ${e525FormatInteger(value)}。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525PlaceRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const pairs = [
      ['千位', '百位', 10],
      ['萬位', '千位', 10],
      ['億位', '萬位', 10000],
      ['兆', '億', 10000],
      ['十億', '百萬', 1000],
    ];
    for (let i = 0; i < count; i += 1) {
      const [left, right, ratio] = pairs[i % pairs.length];
      questions.push(`「${left.replace('位', '')}」是「${right.replace('位', '')}」的幾倍？`);
      summaryAnswers.push(`${ratio}倍`);
      answers.push(`簡答：${ratio}倍。過程：十進位每往左一位就是前一位的 10 倍，依位值差去推，所以是 ${ratio} 倍。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525LargeCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 2;
      if (mode === 0) {
        let a = e525MakeLargeNumber(9, 12);
        let b = e525MakeLargeNumber(9, 12);
        while (a === b) b = e525MakeLargeNumber(9, 12);
        const symbol = a > b ? '>' : '<';
        questions.push(`比較大小：${e525FormatInteger(a)} □ ${e525FormatInteger(b)}（填入 > 或 <）。`);
        summaryAnswers.push(symbol);
        answers.push(
          `簡答：${symbol}。過程：先比位數，位數相同比最高位開始逐位比較，所以 ${e525FormatInteger(a)} ${symbol} ${e525FormatInteger(b)}。`
        );
      } else {
        const values = [e525MakeLargeNumber(9, 12), e525MakeLargeNumber(9, 12), e525MakeLargeNumber(9, 12)];
        const labels = ['甲', '乙', '丙'];
        const items = values.map((value, index) => ({ label: labels[index], value }));
        const sorted = [...items].sort((x, y) => y.value - x.value);
        questions.push(
          `將 ${items.map((item) => `${item.label}：${e525FormatInteger(item.value)}`).join('、')} 由大到小排列。`
        );
        summaryAnswers.push(sorted.map((item) => item.label).join('＞'));
        answers.push(
          `簡答：${sorted.map((item) => item.label).join('＞')}。過程：先比位數，位數相同再從高位往右比，所以排序如上。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525TrailingZeroSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const a = pickFromList([12, 17, 25, 38, 65, 78]) * 100;
        const b = pickFromList([2, 4, 5, 6, 8]) * 100;
        const answer = a * b;
        questions.push(`計算：${e525FormatInteger(a)} × ${e525FormatInteger(b)}。`);
        summaryAnswers.push(e525FormatInteger(answer));
        answers.push(
          `簡答：${e525FormatInteger(answer)}。過程：先算前面的 ${a / 100} × ${b / 100}，再補上 4 個 0，所以答案是 ${e525FormatInteger(answer)}。`
        );
      } else if (mode === 1) {
        const a = pickFromList([24, 36, 54, 72, 96]) * 1000;
        const b = pickFromList([2, 3, 4, 6, 8]) * 100;
        const answer = a / b;
        questions.push(`計算：${e525FormatInteger(a)} ÷ ${e525FormatInteger(b)}。`);
        summaryAnswers.push(`${answer}`);
        answers.push(`簡答：${answer}。過程：被除數和除數都先去掉相同個數的 0，再做簡單除法，所以答案是 ${answer}。`);
      } else {
        const a = pickFromList([14, 18, 23, 34, 56]);
        const b = pickFromList([12, 15, 16, 24, 28]);
        const product = a * b;
        questions.push(`已知 ${a} × ${b} = ${product}，不計算直接寫出 ${a * 100} × ${b * 10} 的答案。`);
        summaryAnswers.push(e525FormatInteger(product * 1000));
        answers.push(
          `簡答：${e525FormatInteger(product * 1000)}。過程：一個乘數放大 100 倍，另一個放大 10 倍，所以積放大 1000 倍。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525LineSingleReadSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const labels = e525WeekLabels();
    for (let i = 0; i < count; i += 1) {
      const values = e525BuildSeries(labels, 60, 180, 10);
      const unit = '人';
      const mode = i % 4;
      const text = e525SeriesText(labels, values, unit);
      if (mode === 0) {
        const maxValue = Math.max(...values);
        const label = labels[values.indexOf(maxValue)];
        questions.push(`某折線圖資料如下（單位：${unit}）：${text}。哪一天的人數最多？`);
        summaryAnswers.push(`${label}`);
        answers.push(`簡答：${label}。過程：逐一比較各天數值，最大的是 ${maxValue}${unit}，出現在${label}。`);
      } else if (mode === 1) {
        const minValue = Math.min(...values);
        const label = labels[values.indexOf(minValue)];
        questions.push(`某折線圖資料如下（單位：${unit}）：${text}。哪一天的人數最少？`);
        summaryAnswers.push(`${label}`);
        answers.push(`簡答：${label}。過程：逐一比較各天數值，最小的是 ${minValue}${unit}，出現在${label}。`);
      } else if (mode === 2) {
        const index = randInt(0, labels.length - 1);
        questions.push(`某折線圖資料如下（單位：${unit}）：${text}。${labels[index]}是多少${unit}？`);
        summaryAnswers.push(`${values[index]}${unit}`);
        answers.push(`簡答：${values[index]}${unit}。過程：直接讀出 ${labels[index]} 對應的數值即可。`);
      } else {
        const a = randInt(0, labels.length - 2);
        const b = randInt(a + 1, labels.length - 1);
        const diff = Math.abs(values[b] - values[a]);
        questions.push(`某折線圖資料如下（單位：${unit}）：${text}。${labels[a]}和${labels[b]}相差多少${unit}？`);
        summaryAnswers.push(`${diff}${unit}`);
        answers.push(`簡答：${diff}${unit}。過程：用較大的數減較小的數，得到 ${diff}${unit}。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525LineDoubleCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const labels = e525MonthLabels();
    for (let i = 0; i < count; i += 1) {
      const aValues = e525BuildSeries(labels, 80, 220, 10);
      const bValues = e525BuildSeries(labels, 80, 220, 10);
      const unit = '盒';
      const textA = e525SeriesText(labels, aValues, unit);
      const textB = e525SeriesText(labels, bValues, unit);
      const mode = i % 3;
      if (mode === 0) {
        const index = randInt(0, labels.length - 1);
        const winner =
          aValues[index] === bValues[index] ? '一樣多' : aValues[index] > bValues[index] ? '甲線較多' : '乙線較多';
        questions.push(
          `某雙線折線圖資料如下（單位：${unit}）。甲線：${textA}。乙線：${textB}。在${labels[index]}，哪一條線比較高？`
        );
        summaryAnswers.push(winner);
        answers.push(
          `簡答：${winner}。過程：${labels[index]} 時，甲線是 ${aValues[index]}${unit}，乙線是 ${bValues[index]}${unit}，直接比較即可。`
        );
      } else if (mode === 1) {
        const gaps = labels.map((_, index) => Math.abs(aValues[index] - bValues[index]));
        const maxGap = Math.max(...gaps);
        const label = labels[gaps.indexOf(maxGap)];
        questions.push(
          `某雙線折線圖資料如下（單位：${unit}）。甲線：${textA}。乙線：${textB}。哪一個月份兩條線相差最多？`
        );
        summaryAnswers.push(`${label}`);
        answers.push(`簡答：${label}。過程：逐月比較差距，最大差距是 ${maxGap}${unit}，出現在${label}。`);
      } else {
        const aTotal = aValues.reduce((sum, value) => sum + value, 0);
        const bTotal = bValues.reduce((sum, value) => sum + value, 0);
        const winner = aTotal === bTotal ? '一樣多' : aTotal > bTotal ? '甲線總量較多' : '乙線總量較多';
        questions.push(
          `某雙線折線圖資料如下（單位：${unit}）。甲線：${textA}。乙線：${textB}。全部月份合計後，哪一條線總量較多？`
        );
        summaryAnswers.push(winner);
        answers.push(
          `簡答：${winner}。過程：甲線總量是 ${aTotal}${unit}，乙線總量是 ${bTotal}${unit}，直接比較總和即可。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525LineTrendSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const labels = e525WeekLabels();
    for (let i = 0; i < count; i += 1) {
      const values = e525BuildSeries(labels, 40, 160, 10);
      const unit = '公分';
      const text = e525SeriesText(labels, values, unit);
      const mode = i % 3;
      if (mode === 0) {
        const index = randInt(0, labels.length - 2);
        const trend = values[index + 1] > values[index] ? '上升' : values[index + 1] < values[index] ? '下降' : '持平';
        questions.push(
          `某折線圖資料如下（單位：${unit}）：${text}。從${labels[index]}到${labels[index + 1]}的變化趨勢是上升、下降還是持平？`
        );
        summaryAnswers.push(trend);
        answers.push(
          `簡答：${trend}。過程：${labels[index]} 是 ${values[index]}${unit}，${labels[index + 1]} 是 ${values[index + 1]}${unit}，所以趨勢是${trend}。`
        );
      } else if (mode === 1) {
        let bestIndex = 0;
        let bestRise = values[1] - values[0];
        for (let j = 1; j < values.length - 1; j += 1) {
          const rise = values[j + 1] - values[j];
          if (rise > bestRise) {
            bestRise = rise;
            bestIndex = j;
          }
        }
        questions.push(`某折線圖資料如下（單位：${unit}）：${text}。哪一段的增加最多？`);
        summaryAnswers.push(`${labels[bestIndex]}到${labels[bestIndex + 1]}`);
        answers.push(
          `簡答：${labels[bestIndex]}到${labels[bestIndex + 1]}。過程：逐段比較增加量，最大增加量出現在這一段。`
        );
      } else {
        const flatSegments = [];
        for (let j = 0; j < values.length - 1; j += 1) {
          if (values[j] === values[j + 1]) flatSegments.push(`${labels[j]}到${labels[j + 1]}`);
        }
        questions.push(`某折線圖資料如下（單位：${unit}）：${text}。哪些相鄰兩天的數值沒有改變？若沒有請寫「沒有」。`);
        summaryAnswers.push(flatSegments.length ? flatSegments.join('、') : '沒有');
        answers.push(
          `簡答：${flatSegments.length ? flatSegments.join('、') : '沒有'}。過程：檢查相鄰兩天數值是否相同即可。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525LineStructureSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const xAxisBanks = [
      ['一月到六月', '月份'],
      ['週一到週六', '日期'],
      ['上午 8 時到下午 1 時', '時間'],
      ['第 1 週到第 6 週', '週次'],
    ];
    const yAxisBanks = ['銷量', '來客人數', '身高', '水位'];
    const units = ['盒', '人', '公分', '公尺'];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const [xLabels, answer] = xAxisBanks[i % xAxisBanks.length];
        const yAxis = yAxisBanks[i % yAxisBanks.length];
        questions.push(`某折線圖的橫軸標示「${xLabels}」，縱軸標示「${yAxis}」。這張圖的橫軸主要表示什麼？`);
        summaryAnswers.push(answer);
        answers.push(
          `簡答：${answer}。過程：橫軸通常用來放依序變化的時間或項目；這裡標的是「${xLabels}」，所以橫軸表示${answer}。`
        );
      } else if (mode === 1) {
        const step = pickFromList([5, 10, 20, 50]);
        const grid = pickFromList([3, 4, 6, 8]);
        const unit = units[i % units.length];
        questions.push(`某折線圖的縱軸每一小格代表 ${step}${unit}，如果某一點在第 ${grid} 小格，它代表多少${unit}？`);
        summaryAnswers.push(`${step * grid}${unit}`);
        answers.push(
          `簡答：${step * grid}${unit}。過程：每一小格 ${step}${unit}，第 ${grid} 小格就是 ${step} × ${grid} = ${step * grid}${unit}。`
        );
      } else if (mode === 2) {
        const yAxis = yAxisBanks[i % yAxisBanks.length];
        questions.push(`折線圖把各點連起來後，最主要是方便看出什麼？（以「${yAxis}」資料為例）`);
        summaryAnswers.push('變化趨勢');
        answers.push('簡答：變化趨勢。過程：把點連線後，比較容易看出資料是上升、下降還是持平。');
      } else {
        const start = pickFromList([100, 200, 500, 1000]);
        const yAxis = yAxisBanks[i % yAxisBanks.length];
        questions.push(
          `某折線圖的縱軸標示「${yAxis}」，下方有波浪線，第一個刻度從 ${start} 開始。這個波浪線通常表示什麼？`
        );
        summaryAnswers.push('縱軸省略了一段數值');
        answers.push(
          `簡答：縱軸省略了一段數值。過程：因為刻度不是從 0 連續畫上來，而是直接從 ${start} 開始，所以中間有一段被省略了。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525LineConditionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const labels = e525MonthLabels();
    for (let i = 0; i < count; i += 1) {
      const values = e525BuildSeries(labels, 90, 260, 10);
      const unit = '件';
      const threshold = pickFromList([120, 140, 160, 180, 200]);
      const matched = labels.filter((_, index) => values[index] >= threshold);
      const text = e525SeriesText(labels, values, unit);
      questions.push(
        `某折線圖資料如下（單位：${unit}）：${text}。哪些月份的數值不少於 ${threshold}${unit}？若沒有請寫「沒有」。`
      );
      summaryAnswers.push(matched.length ? matched.join('、') : '沒有');
      answers.push(
        `簡答：${matched.length ? matched.join('、') : '沒有'}。過程：逐月檢查是否達到 ${threshold}${unit}，符合條件的月份列出即可。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = banks[randInt(0, banks.length - 1)](1);
      questions.push(built.questions[0]);
      summaryAnswers.push((built.summaryAnswers || [''])[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525ReadPlaceThreeSet(count) {
    return buildE525MixedSet([buildE525ChineseConvertSet, buildE525PlaceDigitSet, buildE525UnitComposeSet], count);
  }

  function buildE525StructureThreeSet(count) {
    return buildE525MixedSet([buildE525ExpandedNotationSet, buildE525PlaceRatioSet, buildE525TrailingZeroSet], count);
  }

  function buildE525CompareOneSet(count) {
    return buildE525MixedSet([buildE525LargeCompareSet], count);
  }

  function buildE525LineReadCompareTwoSet(count) {
    return buildE525MixedSet([buildE525LineSingleReadSet, buildE525LineDoubleCompareSet], count);
  }

  function buildE525LineTrendStructureTwoSet(count) {
    return buildE525MixedSet([buildE525LineTrendSet, buildE525LineStructureSet, buildE525LineConditionSet], count);
  }


  function buildE525PieComplementSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { parts: [['A', 30], ['B', 25], ['C', 20]], other: 25, topic: '學生最喜歡的科目', unit: '' },
      { parts: [['搭公車', 40], ['家長接送', 35], ['走路', 15]], other: 10, topic: '上學方式', unit: '' },
      { parts: [['紅色', 30], ['藍色', 25], ['黃色', 20]], other: 25, topic: '最喜歡的顏色', unit: '' },
      { parts: [['亞洲', 45], ['美洲', 30], ['歐洲', 15]], other: 10, topic: '銷售地區', unit: '' },
      { parts: [['籃球', 35], ['排球', 25], ['游泳', 20]], other: 20, topic: '運動項目', unit: '' },
      { parts: [['食物', 40], ['房租', 30], ['交通', 15]], other: 15, topic: '家庭支出', unit: '' },
      { parts: [['國語', 30], ['數學', 25], ['英語', 20]], other: 25, topic: '考試科目成績分布', unit: '' },
      { parts: [['搭捷運', 40], ['開車', 30], ['騎機車', 20]], other: 10, topic: '通勤方式', unit: '' },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      const knownSum = c.parts.reduce((s, p) => s + p[1], 0);
      const partDesc = c.parts.map(p => `${p[0]} 占 ${p[1]}%`).join('、');
      questions.push(
        `某圓形圖顯示${c.topic}的分布，其中${partDesc}，請問「其他」占百分之幾？`
      );
      summaryAnswers.push(`${c.other}%`);
      answers.push(
        `簡答：${c.other}%。過程：已知各項合計 ${c.parts.map(p => p[1]).join(' + ')} = ${knownSum}%，圓形圖總共 100%，所以其他 = 100% - ${knownSum}% = ${c.other}%。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525PieAngleCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { angle: 90, pct: 25, total: 400, count: 100, totalLabel: '400人', section: '女生' },
      { angle: 108, pct: 30, total: 600, count: 180, totalLabel: '600件', section: 'A產品' },
      { angle: 72, pct: 20, total: 500, count: 100, totalLabel: '500名', section: '三年級' },
      { angle: 144, pct: 40, total: 300, count: 120, totalLabel: '300份', section: '晚餐' },
      { angle: 36, pct: 10, total: 800, count: 80, totalLabel: '800人', section: '其他' },
      { angle: 120, pct: 33, total: 300, count: 100, totalLabel: '300人', section: '乙組' },
      { angle: 54, pct: 15, total: 400, count: 60, totalLabel: '400件', section: 'C商品' },
      { angle: 180, pct: 50, total: 200, count: 100, totalLabel: '200名', section: '男生' },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      if (i % 2 === 0) {
        questions.push(
          `圓形圖中，某扇形的圓心角是 ${c.angle} 度，請問這個扇形占整個圓形圖的百分之幾？`
        );
        summaryAnswers.push(`${c.pct}%`);
        answers.push(
          `簡答：${c.pct}%。過程：${c.angle} ÷ 360 × 100% ≈ ${c.pct}%。`
        );
      } else {
        questions.push(
          `某圓形圖代表 ${c.totalLabel}，其中「${c.section}」占 ${c.pct}%，請問「${c.section}」有多少？`
        );
        summaryAnswers.push(`${c.count}`);
        answers.push(
          `簡答：${c.count}。過程：${c.total} × ${c.pct}% = ${c.total} × ${c.pct / 100} = ${c.count}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525PieInverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { pct: 25, part: 180, total: 720, partLabel: '180人', topic: '喜歡音樂的學生', totalLabel: '720人' },
      { pct: 20, part: 100, total: 500, partLabel: '100份', topic: 'A選項的問卷', totalLabel: '500份' },
      { pct: 40, part: 160, total: 400, partLabel: '160人', topic: '搭公車的員工', totalLabel: '400人' },
      { pct: 30, part: 90, total: 300, partLabel: '90件', topic: 'B商品', totalLabel: '300件' },
      { pct: 50, part: 250, total: 500, partLabel: '250名', topic: '女生', totalLabel: '500名' },
      { pct: 25, part: 60, total: 240, partLabel: '60人', topic: '喜歡足球', totalLabel: '240人' },
      { pct: 15, part: 45, total: 300, partLabel: '45人', topic: '選擇其他科目', totalLabel: '300人' },
      { pct: 35, part: 70, total: 200, partLabel: '70份', topic: 'C套餐', totalLabel: '200份' },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      questions.push(
        `某圓形圖中，「${c.topic}」占 ${c.pct}%，代表 ${c.partLabel}，請問這個圓形圖的總數是多少？`
      );
      summaryAnswers.push(`${c.total}`);
      answers.push(
        `簡答：${c.total}。過程：部分 ÷ 百分率 = 全體，${c.part} ÷ ${c.pct}% = ${c.part} ÷ ${c.pct / 100} = ${c.total}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE525PieThreeSet(count) {
    return buildE525MixedSet(
      [buildE525PieComplementSet, buildE525PieAngleCountSet, buildE525PieInverseSet],
      count
    );
  }

  function e524FormatNumber(value, digits = 4) {
    return trimDecimalString(Number(value.toFixed(digits)).toString());
  }

  function e524CountDecimals(value) {
    const text = e524FormatNumber(value, 6);
    if (!text.includes('.')) return 0;
    return text.split('.')[1].length;
  }

  function buildE524DecimalIntegerSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const decimals = [1.2, 1.25, 1.375, 2.409, 3.701, 4.75, 5.2, 6.025, 7.56, 8.125];
      const a = pickFromList(decimals);
      const b = pickFromList([3, 4, 5, 6, 7, 8, 9, 12, 16, 20, 25]);
      const product = a * b;
      questions.push(`計算：${e524FormatNumber(a)} × ${b}。`);
      summaryAnswers.push(`${e524FormatNumber(product)}`);
      answers.push(
        `簡答：${e524FormatNumber(product)}。過程：先把 ${e524FormatNumber(a)} 看成整數乘法，再依小數位數點回去，所以答案是 ${e524FormatNumber(product)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE524DecimalDecimalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [0.8, 5.2],
      [1.52, 2.79],
      [2.4, 1.68],
      [3.25, 0.48],
      [4.16, 1.05],
      [7.5, 3.92],
      [8.4, 0.75],
      [12.5, 0.24],
      [24, 1.25],
      [36, 0.125],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = pickFromList(bank);
      const product = a * b;
      questions.push(`計算：${e524FormatNumber(a)} × ${e524FormatNumber(b)}。`);
      summaryAnswers.push(`${e524FormatNumber(product)}`);
      answers.push(
        `簡答：${e524FormatNumber(product)}。過程：先當成整數乘法，再看 ${e524FormatNumber(a)} 和 ${e524FormatNumber(b)} 一共有 ${e524CountDecimals(a) + e524CountDecimals(b)} 位小數，把小數點點回去，得到 ${e524FormatNumber(product)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE524ShiftRightSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const values = [1.609, 2.75, 3.306, 4.037, 4.632, 6.371, 12.13, 16.09];
    const multipliers = [10, 100, 1000];
    for (let i = 0; i < count; i += 1) {
      const value = pickFromList(values);
      const multiplier = multipliers[i % multipliers.length];
      const answer = value * multiplier;
      questions.push(`不必直式，直接計算：${e524FormatNumber(value)} × ${multiplier}。`);
      summaryAnswers.push(`${e524FormatNumber(answer)}`);
      answers.push(
        `簡答：${e524FormatNumber(answer)}。過程：乘以 ${multiplier} 就是把小數點向右移 ${String(multiplier).length - 1} 位，所以答案是 ${e524FormatNumber(answer)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE524ShiftLeftSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const values = [8, 179, 486, 752, 2468, 3050, 420, 96];
    const multipliers = [0.1, 0.01, 0.001];
    for (let i = 0; i < count; i += 1) {
      const value = pickFromList(values);
      const multiplier = multipliers[i % multipliers.length];
      const answer = value * multiplier;
      questions.push(`不必直式，直接計算：${value} × ${multiplier}。`);
      summaryAnswers.push(`${e524FormatNumber(answer)}`);
      answers.push(
        `簡答：${e524FormatNumber(answer)}。過程：乘以 ${multiplier} 就是把小數點向左移 ${Math.round(Math.abs(Math.log10(multiplier)))} 位，所以答案是 ${e524FormatNumber(answer)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE524InferFromIntegerSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [42, 215],
      [52, 909],
      [36, 22],
      [1475, 12],
      [11, 44],
      [83, 67],
      [423, 15],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = bank[i % bank.length];
      const integerProduct = a * b;
      const shiftA = pickFromList([1, 2]);
      const shiftB = pickFromList([1, 2]);
      const x = a / 10 ** shiftA;
      const y = b / 10 ** shiftB;
      const answer = x * y;
      questions.push(
        `已知 ${a} × ${b} = ${integerProduct}，求 ${e524FormatNumber(x)} × ${e524FormatNumber(y)} 的答案。`
      );
      summaryAnswers.push(`${e524FormatNumber(answer)}`);
      answers.push(
        `簡答：${e524FormatNumber(answer)}。過程：原本乘積是 ${integerProduct}，現在 ${a} 變成 ${e524FormatNumber(x)}，縮小 ${10 ** shiftA} 倍；${b} 變成 ${e524FormatNumber(y)}，縮小 ${10 ** shiftB} 倍，所以積縮小 ${10 ** (shiftA + shiftB)} 倍，答案是 ${integerProduct} ÷ ${10 ** (shiftA + shiftB)} = ${e524FormatNumber(answer)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE524CompareProductSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const multiplicands = [0.9, 1.25, 2.38, 3.28, 7.56, 16.4];
    const multipliers = [0.31, 0.95, 0.99, 1, 1.01, 1.25, 1.57, 9.8];
    for (let i = 0; i < count; i += 1) {
      const a = multiplicands[i % multiplicands.length];
      const b = multipliers[randInt(0, multipliers.length - 1)];
      const symbol = b > 1 ? '>' : b < 1 ? '<' : '=';
      questions.push(
        `不用計算，比較大小：${e524FormatNumber(a)} × ${e524FormatNumber(b)} □ ${e524FormatNumber(a)}（填入 >、< 或 =）。`
      );
      summaryAnswers.push(symbol);
      answers.push(
        `簡答：${symbol}。過程：因為乘數 ${e524FormatNumber(b)} ${b > 1 ? '大於' : b < 1 ? '小於' : '等於'} 1，所以積${b > 1 ? '大於' : b < 1 ? '小於' : '等於'}被乘數 ${e524FormatNumber(a)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE524DecimalPlaceCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [0.1, 0.201],
      [2.51, 20.1],
      [0.05, 0.09],
      [0.17, 0.4],
      [3.205, 1.02],
      [12.3, 0.04],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = bank[i % bank.length];
      const places = e524CountDecimals(a) + e524CountDecimals(b);
      questions.push(`${e524FormatNumber(a)} × ${e524FormatNumber(b)} 得到的答案是幾位小數？`);
      summaryAnswers.push(`${places}位小數`);
      answers.push(
        `簡答：${places}位小數。過程：${e524FormatNumber(a)} 有 ${e524CountDecimals(a)} 位小數，${e524FormatNumber(b)} 有 ${e524CountDecimals(b)} 位小數，所以積共有 ${places} 位小數。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE524OrderCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const banks = [
      { base: 3.52, multipliers: [1.02, 1, 0.86], names: ['甲', '乙', '丙'] },
      { base: 29.2, multipliers: [0.1, 1.2, 5], names: ['甲', '乙', '丙'] },
      { base: 80, multipliers: [0.75, 1, 1.4], names: ['甲', '乙', '丙'] },
      { base: 250, multipliers: [0.8, 1, 1.5], names: ['甲', '乙', '丙'] },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = banks[i % banks.length];
      const values = item.multipliers.map((m, idx) => ({
        name: item.names[idx],
        value: item.base * m,
        text: `${item.base} × ${m}`,
      }));
      const sorted = [...values].sort((x, y) => y.value - x.value);
      questions.push(`不必直算，將 ${values.map((v) => `${v.name}：${v.text}`).join('、')} 由大到小排列。`);
      summaryAnswers.push(sorted.map((v) => v.name).join('＞'));
      answers.push(
        `簡答：${sorted.map((v) => v.name).join('＞')}。過程：因為被乘數 ${item.base} 相同，只要比較乘數大小即可，乘數越大，積越大。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE524ApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const price = pickFromList([31.6, 55, 84, 100, 250]);
        const weight = pickFromList([0.5, 0.6, 0.8, 1.5, 2.25]);
        const total = price * weight;
        questions.push(`單價計算：1 公斤賣 ${price} 元，買 ${e524FormatNumber(weight)} 公斤，要付多少元？`);
        summaryAnswers.push(`${e524FormatNumber(total)}元`);
        answers.push(
          `簡答：${e524FormatNumber(total)}元。過程：總價 = 單價 × 重量 = ${price} × ${e524FormatNumber(weight)} = ${e524FormatNumber(total)}。`
        );
      } else if (mode === 1) {
        const length = pickFromList([5.5, 7.24, 12.5, 22.8, 55]);
        const width = pickFromList([4.5, 6.4, 9.98, 1.2, 0.75]);
        const area = length * width;
        questions.push(
          `面積計算：一塊長方形地長 ${e524FormatNumber(length)} 公尺、寬 ${e524FormatNumber(width)} 公尺，面積是多少平方公尺？`
        );
        summaryAnswers.push(`${e524FormatNumber(area)}平方公尺`);
        answers.push(
          `簡答：${e524FormatNumber(area)}平方公尺。過程：面積 = 長 × 寬 = ${e524FormatNumber(length)} × ${e524FormatNumber(width)} = ${e524FormatNumber(area)}。`
        );
      } else if (mode === 2) {
        const unit = pickFromList([0.175, 0.454, 1.7, 2.3, 8.375]);
        const countItems = pickFromList([8, 9, 12, 15, 25]);
        const total = unit * countItems;
        questions.push(`重量計算：每份重 ${e524FormatNumber(unit)} 公斤，共有 ${countItems} 份，總共重多少公斤？`);
        summaryAnswers.push(`${e524FormatNumber(total)}公斤`);
        answers.push(
          `簡答：${e524FormatNumber(total)}公斤。過程：總重量 = 每份重量 × 份數 = ${e524FormatNumber(unit)} × ${countItems} = ${e524FormatNumber(total)}。`
        );
      } else if (mode === 3) {
        const capacity = pickFromList([1.7, 2, 15.275, 30.04]);
        const countBottles = pickFromList([1.5, 2.25, 6.4, 9]);
        const total = capacity * countBottles;
        questions.push(
          `容量計算：一瓶有 ${e524FormatNumber(capacity)} 公升，${e524FormatNumber(countBottles)} 瓶共有多少公升？`
        );
        summaryAnswers.push(`${e524FormatNumber(total)}公升`);
        answers.push(
          `簡答：${e524FormatNumber(total)}公升。過程：總容量 = 每瓶容量 × 瓶數 = ${e524FormatNumber(capacity)} × ${e524FormatNumber(countBottles)} = ${e524FormatNumber(total)}。`
        );
      } else {
        const base = pickFromList([25.5, 40.5, 42.5, 68, 80]);
        const multiplier = pickFromList([1.02, 1.5, 1.66, 1.75, 2.4]);
        const total = base * multiplier;
        questions.push(
          `倍數應用：甲數是 ${e524FormatNumber(base)}，乙數是甲數的 ${e524FormatNumber(multiplier)} 倍，乙數是多少？`
        );
        summaryAnswers.push(`${e524FormatNumber(total)}`);
        answers.push(
          `簡答：${e524FormatNumber(total)}。過程：乙數 = 甲數 × 倍數 = ${e524FormatNumber(base)} × ${e524FormatNumber(multiplier)} = ${e524FormatNumber(total)}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE524DistributiveLawSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { expr: '3.6\\times7.2-3.6\\times2.2',                   hint: '提出公因數：$3.6\\times(7.2-2.2)=3.6\\times5$',                                ans: 18 },
      { expr: '1.8\\times4.5-0.8\\times4.5',                   hint: '提出公因數：$(1.8-0.8)\\times4.5=1\\times4.5$',                                ans: 4.5 },
      { expr: '(3.2+4.8)\\times2.5',                           hint: '先加括號內：$8\\times2.5$',                                                     ans: 20 },
      { expr: '(7.5-2.5)\\times1.6',                           hint: '先算括號：$5\\times1.6$',                                                       ans: 8 },
      { expr: '(1.5+2.5)\\times6',                             hint: '先算括號：$4\\times6$',                                                         ans: 24 },
      { expr: '(2.5+1.5)\\times4.8',                           hint: '先算括號：$4\\times4.8$',                                                       ans: 19.2 },
      { expr: '2.4\\times0.25+3.6\\times0.25+4\\times0.25',   hint: '提出公因數：$(2.4+3.6+4)\\times0.25=10\\times0.25$',                            ans: 2.5 },
      { expr: '1.25\\times3.2+1.25\\times4.8-1.25\\times1',   hint: '提出公因數：$1.25\\times(3.2+4.8-1)=1.25\\times7$',                            ans: 8.75 },
      { expr: '8.2\\times1.6+8.2\\times2.4-8.2\\times0.5',    hint: '提出公因數：$8.2\\times(1.6+2.4-0.5)=8.2\\times3.5$',                         ans: 28.7 },
      { expr: '5.2\\times1.8+5.2\\times3.2-5.2\\times1',      hint: '提出公因數：$5.2\\times(1.8+3.2-1)=5.2\\times4$',                              ans: 20.8 },
      { expr: '9.5\\times2.8-9.5\\times1.8+9.5\\times0.2',    hint: '提出公因數：$9.5\\times(2.8-1.8+0.2)=9.5\\times1.2$',                         ans: 11.4 },
      { expr: '1.8\\times3.2-1.8\\times1.2+1.8\\times0.8',    hint: '提出公因數：$1.8\\times(3.2-1.2+0.8)=1.8\\times2.8$',                         ans: 5.04 },
      { expr: '6.8\\times2.5-6.8\\times1.5+6.8\\times0.5',    hint: '提出公因數：$6.8\\times(2.5-1.5+0.5)=6.8\\times1.5$',                         ans: 10.2 },
      { expr: '4.5\\times(3.2-1.2)+4.5\\times0.8',            hint: '先算括號：$4.5\\times2+4.5\\times0.8=4.5\\times(2+0.8)=4.5\\times2.8$',       ans: 12.6 },
      { expr: '7.5\\times(4.2-2.2)-7.5\\times0.8',            hint: '先算括號：$7.5\\times2-7.5\\times0.8=7.5\\times(2-0.8)=7.5\\times1.2$',       ans: 9 },
    ];
    for (let i = 0; i < count; i += 1) {
      const { expr, hint, ans } = pickFromList(cases);
      const ansStr = Number.isInteger(ans) ? `${ans}` : `${ans}`;
      questions.push(`計算：$${expr}$。`);
      summaryAnswers.push(`$${ansStr}$`);
      answers.push(`簡答：$${ansStr}$。提示：${hint}，答案為 $${ansStr}$。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE524CleverGroupingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { expr: '0.4\\times2.5\\times1.7',       ans: 1.7,  hint: '先算 $0.4\\times2.5=1$，再 $1\\times1.7=1.7$' },
      { expr: '1.25\\times3.6\\times0.8',       ans: 3.6,  hint: '先算 $1.25\\times0.8=1$，再 $1\\times3.6=3.6$' },
      { expr: '0.8\\times3.5\\times0.25',       ans: 0.7,  hint: '先算 $0.8\\times0.25=0.2$，再 $0.2\\times3.5=0.7$' },
      { expr: '2.5\\times4\\times1.3',          ans: 13,   hint: '先算 $2.5\\times4=10$，再 $10\\times1.3=13$' },
      { expr: '1.25\\times8\\times2.4',         ans: 24,   hint: '先算 $1.25\\times8=10$，再 $10\\times2.4=24$' },
      { expr: '4\\times0.25\\times5.8',         ans: 5.8,  hint: '先算 $4\\times0.25=1$，再 $1\\times5.8=5.8$' },
      { expr: '5\\times0.2\\times6.3',          ans: 6.3,  hint: '先算 $5\\times0.2=1$，再 $1\\times6.3=6.3$' },
      { expr: '2.5\\times0.4\\times3.7',        ans: 3.7,  hint: '先算 $2.5\\times0.4=1$，再 $1\\times3.7=3.7$' },
      { expr: '1.25\\times4\\times2.6',         ans: 13,   hint: '先算 $1.25\\times4=5$，再 $5\\times2.6=13$' },
      { expr: '0.4\\times0.25\\times70',        ans: 7,    hint: '先算 $0.4\\times0.25=0.1$，再 $0.1\\times70=7$' },
      { expr: '1.6\\times0.125\\times5',        ans: 1,    hint: '先算 $1.6\\times0.125=0.2$，再 $0.2\\times5=1$' },
      { expr: '0.25\\times4.6\\times4',         ans: 4.6,  hint: '先算 $0.25\\times4=1$，再 $1\\times4.6=4.6$' },
      { expr: '3.6\\times2.5\\times0.4',        ans: 3.6,  hint: '先算 $2.5\\times0.4=1$，再 $1\\times3.6=3.6$' },
    ];
    for (let i = 0; i < count; i += 1) {
      const { expr, ans, hint } = pickFromList(cases);
      const ansStr = Number.isInteger(ans) ? `${ans}` : `${ans}`;
      questions.push(`利用湊整的方法計算：$${expr}$。`);
      summaryAnswers.push(`$${ansStr}$`);
      answers.push(`簡答：$${ansStr}$。方法：${hint}。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE524DiscountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const discountItems = [
      { item: '書包',   price: 1250, rate: 0.9,  type: 'discount' },
      { item: '玩具',   price: 480,  rate: 0.85, type: 'discount' },
      { item: '書包',   price: 450,  rate: 0.8,  type: 'discount' },
      { item: '運動鞋', price: 800,  rate: 0.75, type: 'discount' },
      { item: '外套',   price: 1200, rate: 0.8,  type: 'discount' },
      { item: '背包',   price: 600,  rate: 0.9,  type: 'discount' },
      { item: '手錶',   price: 2400, rate: 0.85, type: 'discount' },
      { item: '球鞋',   price: 500,  rate: 0.7,  type: 'discount' },
    ];
    const markupItems = [
      { item: '水壺',   cost: 650,  mult: 1.05, type: 'markup' },
      { item: '桌子',   cost: 3500, mult: 1.2,  type: 'markup' },
      { item: '椅子',   cost: 800,  mult: 1.1,  type: 'markup' },
      { item: '書架',   cost: 2000, mult: 1.15, type: 'markup' },
      { item: '電風扇', cost: 1200, mult: 1.1,  type: 'markup' },
    ];
    const allCases = [...discountItems, ...markupItems];
    for (let i = 0; i < count; i += 1) {
      const c = pickFromList(allCases);
      if (c.type === 'discount') {
        const sale = Math.round(c.price * c.rate * 100) / 100;
        const rateStr = `${c.rate}`;
        questions.push(`一個${c.item}原價 $${c.price}$ 元，現在打 $${rateStr}$ 折（即原價的 $${rateStr}$ 倍）出售，售價是多少元？`);
        summaryAnswers.push(`$${sale}$ 元`);
        answers.push(`簡答：$${sale}$ 元。計算：售價 $=${c.price}\\times${rateStr}=${sale}$ 元。`);
      } else {
        const sale = Math.round(c.cost * c.mult * 100) / 100;
        questions.push(`一個${c.item}成本是 $${c.cost}$ 元，老闆以成本的 $${c.mult}$ 倍出售，售價是多少元？`);
        summaryAnswers.push(`$${sale}$ 元`);
        answers.push(`簡答：$${sale}$ 元。計算：售價 $=${c.cost}\\times${c.mult}=${sale}$ 元。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE524DistributiveCleverTwoSet(count) {
    return buildE524MixedSet([buildE524DistributiveLawSet, buildE524CleverGroupingSet], count);
  }

  function buildE524MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = banks[randInt(0, banks.length - 1)](1);
      questions.push(built.questions[0]);
      summaryAnswers.push((built.summaryAnswers || [''])[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE524DirectTwoSet(count) {
    return buildE524MixedSet([buildE524DecimalIntegerSet, buildE524DecimalDecimalSet], count);
  }

  function buildE524ShiftTwoSet(count) {
    return buildE524MixedSet([buildE524ShiftRightSet, buildE524ShiftLeftSet], count);
  }

  function buildE524InferTwoSet(count) {
    return buildE524MixedSet([buildE524InferFromIntegerSet, buildE524DecimalPlaceCountSet], count);
  }

  function buildE524JudgeThreeSet(count) {
    return buildE524MixedSet(
      [buildE524CompareProductSet, buildE524OrderCompareSet, buildE524DecimalPlaceCountSet],
      count
    );
  }

  function buildE524ApplicationOneSet(count) {
    return buildE524MixedSet([buildE524ApplicationSet], count);
  }

  function e523FormatNumber(value, digits = 2) {
    return trimDecimalString(Number(value.toFixed(digits)).toString());
  }

  function buildE523BasicUnitConvertSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const liters = pickFromList([2, 3, 5, 7, 9, 12, 15]);
        const ml = liters * 1000;
        questions.push(`${liters} 公升等於多少毫升？也等於多少立方公分？`);
        summaryAnswers.push(`${ml}毫升，${ml}立方公分`);
        answers.push(
          `簡答：${ml}毫升，${ml}立方公分。過程：1 公升 = 1000 毫升 = 1000 立方公分，所以 ${liters} 公升 = ${ml} 毫升 = ${ml} 立方公分。`
        );
      } else if (mode === 1) {
        const cm3 = pickFromList([12000, 15000, 20000, 25000, 36000, 90000]);
        const liters = cm3 / 1000;
        questions.push(`${cm3} 立方公分等於多少公升？`);
        summaryAnswers.push(`${liters}公升`);
        answers.push(`簡答：${liters}公升。過程：1000 立方公分 = 1 公升，所以 ${cm3} ÷ 1000 = ${liters} 公升。`);
      } else if (mode === 2) {
        const liters = pickFromList([7, 8, 9, 10]);
        const extraMl = pickFromList([100, 150, 200, 250, 320, 450]);
        const totalCm3 = liters * 1000 + extraMl;
        questions.push(`${liters} 公升 ${extraMl} 毫升等於多少立方公分？`);
        summaryAnswers.push(`${totalCm3}立方公分`);
        answers.push(
          `簡答：${totalCm3}立方公分。過程：${liters} 公升 = ${liters * 1000} 毫升，再加上 ${extraMl} 毫升，共 ${totalCm3} 毫升，也就是 ${totalCm3} 立方公分。`
        );
      } else if (mode === 3) {
        const ml = pickFromList([250, 500, 650, 900, 1250]);
        questions.push(`一個容量 ${ml} 毫升的寶特瓶，也可以說它的容積是多少立方公分？`);
        summaryAnswers.push(`${ml}立方公分`);
        answers.push(`簡答：${ml}立方公分。過程：1 毫升 = 1 立方公分，所以 ${ml} 毫升就是 ${ml} 立方公分。`);
      } else {
        const liters = pickFromList([4, 5, 6, 7, 8]);
        const extraMl = pickFromList([50, 80, 120, 200, 350]);
        const cc = liters * 1000 + extraMl;
        questions.push(`${liters} 公升 ${extraMl} 毫升等於多少 c.c.？`);
        summaryAnswers.push(`${cc}c.c.`);
        answers.push(
          `簡答：${cc}c.c.。過程：1 公升 = 1000 c.c.，1 毫升 = 1 c.c.，所以 ${liters} 公升 ${extraMl} 毫升 = ${cc} c.c.。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE523LargeUnitConvertSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const m3 = pickFromList([3, 6, 9, 10.08, 12, 15]);
        const liters = m3 * 1000;
        questions.push(`${e523FormatNumber(m3)} 立方公尺等於多少公升？`);
        summaryAnswers.push(`${e523FormatNumber(liters, 0)}公升`);
        answers.push(
          `簡答：${e523FormatNumber(liters, 0)}公升。過程：1 立方公尺 = 1000 公升，所以 ${e523FormatNumber(m3)} × 1000 = ${e523FormatNumber(liters, 0)} 公升。`
        );
      } else if (mode === 1) {
        const liters = pickFromList([9000, 12000, 15000, 18000, 24000]);
        const m3 = liters / 1000;
        questions.push(`${liters} 公升等於多少立方公尺？`);
        summaryAnswers.push(`${e523FormatNumber(m3)}立方公尺`);
        answers.push(
          `簡答：${e523FormatNumber(m3)}立方公尺。過程：1000 公升 = 1 立方公尺，所以 ${liters} ÷ 1000 = ${e523FormatNumber(m3)} 立方公尺。`
        );
      } else if (mode === 2) {
        const degrees = pickFromList([12, 18, 24, 36, 48, 60]);
        questions.push(`某戶上個月用了 ${degrees} 度的水，請問用了多少立方公尺的水？`);
        summaryAnswers.push(`${degrees}立方公尺`);
        answers.push(
          `簡答：${degrees}立方公尺。過程：1 度水 = 1 立方公尺，所以用了 ${degrees} 度水，就是 ${degrees} 立方公尺。`
        );
      } else if (mode === 3) {
        const liters = pickFromList([2000, 4000, 6000, 8000, 12000]);
        const kL = liters / 1000;
        questions.push(`${liters} 公升也可以說是幾公秉（kL）？`);
        summaryAnswers.push(`${e523FormatNumber(kL)}公秉`);
        answers.push(
          `簡答：${e523FormatNumber(kL)}公秉。過程：1 公秉 = 1000 公升，所以 ${liters} ÷ 1000 = ${e523FormatNumber(kL)} 公秉。`
        );
      } else {
        const length = pickFromList([4, 5, 6, 8]);
        const width = pickFromList([3, 4, 5]);
        const height = pickFromList([2, 2.5, 3, 4]);
        const m3 = length * width * height;
        const liters = m3 * 1000;
        questions.push(`一個長方體水槽，裡面長 ${length} 公尺、寬 ${width} 公尺、高 ${height} 公尺，容積是多少公升？`);
        summaryAnswers.push(`${e523FormatNumber(liters, 0)}公升`);
        answers.push(
          `簡答：${e523FormatNumber(liters, 0)}公升。過程：先算容積 ${length} × ${width} × ${height} = ${e523FormatNumber(m3)} 立方公尺，再乘 1000 變成 ${e523FormatNumber(liters, 0)} 公升。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE523InnerCapacitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const side = pickFromList([5, 8, 10, 12, 15]);
        const volume = side ** 3;
        questions.push(`有一個正方體盒子，內部邊長是 ${side} 公分，容積是多少立方公分？`);
        summaryAnswers.push(`${volume}立方公分`);
        answers.push(
          `簡答：${volume}立方公分。過程：正方體容積 = 邊長 × 邊長 × 邊長 = ${side} × ${side} × ${side} = ${volume}。`
        );
      } else if (mode === 1) {
        const length = pickFromList([8, 10, 12, 15, 20]);
        const width = pickFromList([4, 5, 6, 8]);
        const height = pickFromList([3, 5, 7, 10]);
        const volume = length * width * height;
        questions.push(
          `一個長方體容器，裡面長 ${length} 公分、寬 ${width} 公分、高 ${height} 公分，容積是多少立方公分？`
        );
        summaryAnswers.push(`${volume}立方公分`);
        answers.push(
          `簡答：${volume}立方公分。過程：容積 = 長 × 寬 × 高 = ${length} × ${width} × ${height} = ${volume}。`
        );
      } else if (mode === 2) {
        const side = pickFromList([2, 3, 4, 5]);
        const m3 = side ** 3;
        questions.push(`有一個正方體魚缸，裡面每邊長是 ${side} 公尺，它的容積是多少立方公尺？`);
        summaryAnswers.push(`${m3}立方公尺`);
        answers.push(`簡答：${m3}立方公尺。過程：正方體容積 = ${side} × ${side} × ${side} = ${m3} 立方公尺。`);
      } else if (mode === 3) {
        const length = pickFromList([50, 60, 80]);
        const width = pickFromList([30, 40, 50]);
        const height = pickFromList([20, 25, 30, 40]);
        const volume = length * width * height;
        questions.push(
          `一個長方體置物櫃，裡面長 ${length} 公分、寬 ${width} 公分、高 ${height} 公分，可裝滿幾立方公分的空間？`
        );
        summaryAnswers.push(`${volume}立方公分`);
        answers.push(`簡答：${volume}立方公分。過程：空間大小就是容積，${length} × ${width} × ${height} = ${volume}。`);
      } else {
        const length = pickFromList([40, 60, 80]);
        const width = pickFromList([20, 30, 50]);
        const height = pickFromList([20, 25, 40]);
        const volume = length * width * height;
        const liters = volume / 1000;
        questions.push(
          `一個長方體塑膠容器，裡面長 ${length} 公分、寬 ${width} 公分、高 ${height} 公分，容量是多少公升？`
        );
        summaryAnswers.push(`${e523FormatNumber(liters)}公升`);
        answers.push(
          `簡答：${e523FormatNumber(liters)}公升。過程：先算容積 ${length} × ${width} × ${height} = ${volume} 立方公分，再除以 1000，得到 ${e523FormatNumber(liters)} 公升。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE523ThicknessCapacitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const hasLid = i % 2 === 0;
      if (i % 4 === 0) {
        const outerL = pickFromList([28, 31, 35, 42, 46, 52]);
        const outerW = pickFromList([25, 26, 27, 31, 32]);
        const outerH = pickFromList([18, 20, 21, 27, 31]);
        const t = pickFromList([0.5, 1, 2]);
        const innerL = outerL - 2 * t;
        const innerW = outerW - 2 * t;
        const innerH = hasLid ? outerH - 2 * t : outerH - t;
        const volume = innerL * innerW * innerH;
        const title = hasLid ? '有蓋容器' : '無蓋容器';
        questions.push(
          `${title}：外面長 ${outerL} 公分、寬 ${outerW} 公分、高 ${outerH} 公分，厚度 ${t} 公分，容積是多少立方公分？`
        );
        summaryAnswers.push(`${e523FormatNumber(volume)}立方公分`);
        answers.push(
          `簡答：${e523FormatNumber(volume)}立方公分。過程：內部長 = ${outerL} - 2×${t} = ${e523FormatNumber(innerL)}，內部寬 = ${outerW} - 2×${t} = ${e523FormatNumber(innerW)}，內部高 = ${outerH} - ${hasLid ? `2×${t}` : `${t}`} = ${e523FormatNumber(innerH)}，所以容積 = ${e523FormatNumber(innerL)} × ${e523FormatNumber(innerW)} × ${e523FormatNumber(innerH)} = ${e523FormatNumber(volume)}。`
        );
      } else if (i % 4 === 1) {
        const outerL = pickFromList([42, 52, 60]);
        const outerW = pickFromList([27, 32, 36]);
        const outerH = pickFromList([21, 27, 30]);
        const t = 1;
        const innerL = outerL - 2 * t;
        const innerW = outerW - 2 * t;
        const innerH = outerH - 2 * t;
        const liters = (innerL * innerW * innerH) / 1000;
        questions.push(
          `有蓋容器：外面長 ${outerL} 公分、寬 ${outerW} 公分、高 ${outerH} 公分，厚度 ${t} 公分，它的容量是多少公升幾毫升？`
        );
        const wholeL = Math.floor(liters);
        const ml = innerL * innerW * innerH - wholeL * 1000;
        summaryAnswers.push(`${wholeL}公升${ml}毫升`);
        answers.push(
          `簡答：${wholeL}公升${ml}毫升。過程：內部尺寸是 ${innerL} × ${innerW} × ${innerH}，容積 = ${innerL * innerW * innerH} 立方公分，也就是 ${wholeL} 公升 ${ml} 毫升。`
        );
      } else if (i % 4 === 2) {
        const outerSide = pickFromList([31, 33, 35, 42]);
        const t = pickFromList([0.5, 1, 2, 3]);
        const innerSide = outerSide - 2 * t;
        const volume = innerSide ** 3;
        questions.push(`有蓋正方體盒：外面每邊長 ${outerSide} 公分，厚度 ${t} 公分，容積是多少立方公分？`);
        summaryAnswers.push(`${e523FormatNumber(volume)}立方公分`);
        answers.push(
          `簡答：${e523FormatNumber(volume)}立方公分。過程：內部邊長 = ${outerSide} - 2×${t} = ${e523FormatNumber(innerSide)}，所以容積 = ${e523FormatNumber(innerSide)}^3 = ${e523FormatNumber(volume)}。`
        );
      } else {
        const outerSide = pickFromList([28, 30, 33, 36]);
        const t = pickFromList([1, 2, 3]);
        const innerSide = outerSide - 2 * t;
        const innerHeight = outerSide - t;
        const volume = innerSide * innerSide * innerHeight;
        questions.push(`無蓋正方體盒：外面每邊長 ${outerSide} 公分，厚度 ${t} 公分，容積是多少立方公分？`);
        summaryAnswers.push(`${e523FormatNumber(volume)}立方公分`);
        answers.push(
          `簡答：${e523FormatNumber(volume)}立方公分。過程：無蓋盒的內部長寬都減 2 倍厚度，高只扣底部厚度，所以內部尺寸是 ${e523FormatNumber(innerSide)} × ${e523FormatNumber(innerSide)} × ${e523FormatNumber(innerHeight)}，容積 = ${e523FormatNumber(volume)}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE523CapacityCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const items = [
      {
        leftValue: 5000,
        leftUnit: '毫升',
        rightValue: 4999,
        rightUnit: '立方公分',
        symbol: '>',
        reason: '5000 毫升 = 5000 立方公分',
      },
      {
        leftValue: 400,
        leftUnit: '立方公分',
        rightValue: 0.4,
        rightUnit: '公升',
        symbol: '=',
        reason: '0.4 公升 = 400 毫升 = 400 立方公分',
      },
      {
        leftValue: 720000,
        leftUnit: '毫升',
        rightValue: 72,
        rightUnit: '立方公尺',
        symbol: '<',
        reason: '72 立方公尺 = 72000 公升 = 72,000,000 毫升',
      },
      {
        leftValue: 9,
        leftUnit: '公升',
        rightValue: 9000,
        rightUnit: '立方公分',
        symbol: '=',
        reason: '9 公升 = 9000 毫升 = 9000 立方公分',
      },
      {
        leftValue: 20,
        leftUnit: '度的水',
        rightValue: 20,
        rightUnit: '立方公尺的水量',
        symbol: '=',
        reason: '1 度水 = 1 立方公尺',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = items[i % items.length];
      questions.push(
        `比較大小：${item.leftValue}${item.leftUnit} □ ${item.rightValue}${item.rightUnit}（填入 >、< 或 =）。`
      );
      summaryAnswers.push(item.symbol);
      answers.push(`簡答：${item.symbol}。過程：${item.reason}，所以左邊 ${item.symbol} 右邊。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE523FillWaterLevelSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const length = pickFromList([15, 20, 24, 30, 40]);
      const width = pickFromList([10, 12, 16, 20, 30]);
      const area = length * width;
      const height = pickFromList([8, 10, 12, 16, 20, 24]);
      const waterHeight = pickFromList([4, 6, 8, 10, 12, 15]);
      const volume = area * waterHeight;
      if (i % 2 === 0) {
        questions.push(
          `有一個長方體容器，裡面長 ${length} 公分、寬 ${width} 公分、高 ${height + 10} 公分，倒入 ${volume} 毫升的水後，水深是多少公分？`
        );
        summaryAnswers.push(`${waterHeight}公分`);
        answers.push(
          `簡答：${waterHeight}公分。過程：${volume} 毫升 = ${volume} 立方公分，水深 = 容積 ÷ 底面積 = ${volume} ÷ (${length} × ${width}) = ${waterHeight}。`
        );
      } else {
        questions.push(
          `一個長 ${length} 公分、寬 ${width} 公分的長方體容器，倒入 ${volume} 毫升的水剛好裝滿，容器的高是多少公分？`
        );
        summaryAnswers.push(`${waterHeight}公分`);
        answers.push(
          `簡答：${waterHeight}公分。過程：容器高度 = 容積 ÷ 底面積 = ${volume} ÷ (${length} × ${width}) = ${waterHeight}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE523DisplacementSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const length = pickFromList([18, 20, 25, 30, 32, 40]);
      const width = pickFromList([10, 12, 15, 16, 20]);
      const area = length * width;
      const delta = pickFromList([1, 2, 3, 4]);
      const totalVolume = area * delta;
      if (i % 2 === 0) {
        const pieces = pickFromList([2, 3, 4, 5]);
        const each = totalVolume / pieces;
        questions.push(
          `長方體容器內部長 ${length} 公分、寬 ${width} 公分，放入 ${pieces} 個完全沉入水中的相同積木後，水位上升 ${delta} 公分，每個積木體積是多少立方公分？`
        );
        summaryAnswers.push(`${each}立方公分`);
        answers.push(
          `簡答：${each}立方公分。過程：水位上升的體積 = 底面積 × 高度變化 = ${length} × ${width} × ${delta} = ${totalVolume}，再除以 ${pieces}，每個是 ${each}。`
        );
      } else {
        questions.push(
          `長方體水箱內部長 ${length} 公分、寬 ${width} 公分，放入石頭後水位由 ${10 + delta} 公分上升到 ${10 + 2 * delta} 公分，石頭體積是多少立方公分？`
        );
        summaryAnswers.push(`${totalVolume}立方公分`);
        answers.push(
          `簡答：${totalVolume}立方公分。過程：水位上升 ${delta} 公分，排開的水量就是石頭體積，所以體積 = ${length} × ${width} × ${delta} = ${totalVolume}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE523OverflowSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const volume = pickFromList([40, 50, 80, 120, 160, 200]);
        questions.push(`把體積 ${volume} 立方公分的鐵塊放入裝滿水的量杯，會溢出多少毫升的水？`);
        summaryAnswers.push(`${volume}毫升`);
        answers.push(
          `簡答：${volume}毫升。過程：完全沉入後溢出的水量 = 物體體積，而 1 毫升 = 1 立方公分，所以會溢出 ${volume} 毫升。`
        );
      } else if (mode === 1) {
        const per = pickFromList([120, 180, 240, 280]);
        const countPieces = pickFromList([2, 3, 4, 5]);
        const total = per * countPieces;
        questions.push(
          `將 ${countPieces} 顆相同的球放入裝滿水的杯子，溢出 ${total} 毫升的水，1 顆球的體積是多少立方公分？`
        );
        summaryAnswers.push(`${per}立方公分`);
        answers.push(
          `簡答：${per}立方公分。過程：溢出的總水量就是 ${countPieces} 顆球的總體積，所以每顆球體積 = ${total} ÷ ${countPieces} = ${per} 立方公分。`
        );
      } else {
        const overflowL = pickFromList([1.2, 1.5, 2.3, 3.6]);
        const cm3 = overflowL * 1000;
        questions.push(
          `裝滿水的臉盆放入一塊塑膠板後，完全沉入水中溢出 ${overflowL} 公升的水，塑膠板體積是多少立方公分？`
        );
        summaryAnswers.push(`${e523FormatNumber(cm3, 0)}立方公分`);
        answers.push(
          `簡答：${e523FormatNumber(cm3, 0)}立方公分。過程：溢水量 = 物體體積，${overflowL} 公升 = ${e523FormatNumber(cm3, 0)} 立方公分，所以塑膠板體積是 ${e523FormatNumber(cm3, 0)} 立方公分。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE523LargeApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const length = pickFromList([30, 40, 50]);
        const width = pickFromList([15, 20, 25]);
        const depth = pickFromList([2, 2.5, 3]);
        const m3 = length * width * depth;
        questions.push(`一個內部長 ${length} 公尺、寬 ${width} 公尺、深 ${depth} 公尺的游泳池，容積是多少立方公尺？`);
        summaryAnswers.push(`${e523FormatNumber(m3)}立方公尺`);
        answers.push(
          `簡答：${e523FormatNumber(m3)}立方公尺。過程：容積 = ${length} × ${width} × ${depth} = ${e523FormatNumber(m3)} 立方公尺。`
        );
      } else if (mode === 1) {
        const degrees = pickFromList([18, 24, 36, 48, 53, 60]);
        questions.push(`水費單顯示用了 ${degrees} 度水，這等於多少公升的水？`);
        summaryAnswers.push(`${degrees * 1000}公升`);
        answers.push(
          `簡答：${degrees * 1000}公升。過程：1 度水 = 1 立方公尺 = 1000 公升，所以 ${degrees} 度 = ${degrees * 1000} 公升。`
        );
      } else if (mode === 2) {
        const side = pickFromList([2, 3, 4]);
        const m3 = side ** 3;
        const liters = m3 * 1000;
        questions.push(`一個正方體蓄水池，裡面每邊長 ${side} 公尺，它的容量是多少公升？`);
        summaryAnswers.push(`${liters}公升`);
        answers.push(`簡答：${liters}公升。過程：先算容積 ${side}^3 = ${m3} 立方公尺，再乘 1000 變成 ${liters} 公升。`);
      } else if (mode === 3) {
        const length = pickFromList([2, 3, 4, 5, 6]);
        const width = pickFromList([1, 2, 3, 5]);
        const height = pickFromList([2, 3, 4]);
        const degrees = length * width * height;
        questions.push(`一個水塔裡面長 ${length} 公尺、寬 ${width} 公尺、高 ${height} 公尺，裝滿水共有幾度水？`);
        summaryAnswers.push(`${degrees}度`);
        answers.push(
          `簡答：${degrees}度。過程：容積 = ${length} × ${width} × ${height} = ${degrees} 立方公尺，而 1 度水 = 1 立方公尺，所以共有 ${degrees} 度。`
        );
      } else {
        const length = 2;
        const width = 1;
        const height = 2;
        const daily = pickFromList([1, 2, 3, 4]);
        const total = length * width * height;
        const days = total / daily;
        questions.push(
          `一個水塔裡面長 ${length} 公尺、寬 ${width} 公尺、高 ${height} 公尺，裝滿水後若每天用 ${daily} 度水，可以用幾天？`
        );
        summaryAnswers.push(`${days}天`);
        answers.push(
          `簡答：${days}天。過程：水塔容積 = ${length} × ${width} × ${height} = ${total} 立方公尺 = ${total} 度水，每天用 ${daily} 度，所以可用 ${total} ÷ ${daily} = ${days} 天。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE523MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const bank = banks[randInt(0, banks.length - 1)];
      const built = bank(1);
      questions.push(built.questions[0]);
      summaryAnswers.push((built.summaryAnswers || [''])[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE523ConvertTwoSet(count) {
    return buildE523MixedSet([buildE523BasicUnitConvertSet, buildE523LargeUnitConvertSet], count);
  }

  function buildE523ContainerTwoSet(count) {
    return buildE523MixedSet([buildE523InnerCapacitySet, buildE523ThicknessCapacitySet], count);
  }

  function buildE523WaterTwoSet(count) {
    return buildE523MixedSet([buildE523FillWaterLevelSet, buildE523DisplacementSet], count);
  }

  function buildE523OverflowCompareTwoSet(count) {
    return buildE523MixedSet([buildE523OverflowSet, buildE523CapacityCompareSet], count);
  }

  function buildE523LargeOneSet(count) {
    return buildE523MixedSet([buildE523LargeApplicationSet], count);
  }



  function buildE523RockCupThreeSet(count) {
    return buildE523MixedSet([
      buildE523RockWaterLevelSet,
      buildE523CupPourSet,
      buildE523FractionBaseAreaSet,
    ], count);
  }

  function buildE523RockWaterLevelSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // 底面積尺寸池（公分）
    const dimPool = [
      [30, 20], [40, 25], [50, 40], [60, 40], [70, 60],
      [80, 50], [90, 70], [45, 30], [50, 30], [60, 50],
      [40, 40], [80, 60], [60, 40], [50, 50], [70, 50],
      [30, 30], [55, 40], [75, 40], [40, 30], [60, 30],
    ];
    // 水面高度池與上升量池（確保 finalH = waterH + delta 為整數）
    const waterHPool = [5, 6, 7, 8, 9, 10, 11, 12, 15, 6, 8, 10, 7, 9, 5];
    const deltaPool  = [2, 3, 4, 5, 6, 3, 4, 5, 2, 4, 3, 6, 5, 4, 3];
    for (let i = 0; i < count; i += 1) {
      const [L, W] = dimPool[randInt(0, dimPool.length - 1)];
      const waterH = waterHPool[randInt(0, waterHPool.length - 1)];
      const delta = deltaPool[randInt(0, deltaPool.length - 1)];
      const finalH = waterH + delta;
      const containerH = finalH + randInt(5, 15);
      const area = L * W;
      const waterVol = waterH * area;
      const rockVol = delta * area;
      const waterL = waterVol / 1000;
      // 水量字串：可整除時用公升，否則用毫升
      const waterStr = Number.isInteger(waterL) ? `${waterL} 公升` : `${waterVol} 毫升`;
      const waterConvertStr = Number.isInteger(waterL) ? `${waterL} 公升 = ${waterVol} 立方公分，` : '';
      if (i % 2 === 0) {
        // 類型 A：已知石頭體積，求最終水面高度
        questions.push(
          `一個長方體容器，內部長 ${L} 公分、寬 ${W} 公分、高 ${containerH} 公分。先倒入 ${waterStr} 的水，再放入一塊體積 ${rockVol} 立方公分的石頭，完全沉入水中，水面高度是多少公分？`
        );
        summaryAnswers.push(`${finalH}公分`);
        answers.push(
          `簡答：${finalH}公分。過程：${waterConvertStr}底面積 = ${L} × ${W} = ${area} 平方公分，水 + 石頭總體積 = ${waterVol} + ${rockVol} = ${waterVol + rockVol} 立方公分，水面高 = ${waterVol + rockVol} ÷ ${area} = ${finalH} 公分。`
        );
      } else {
        // 類型 B：已知水面上升量，求石頭體積
        questions.push(
          `一個長方體容器，內部長 ${L} 公分、寬 ${W} 公分。原本裡面有 ${waterStr} 的水（水面高 ${waterH} 公分），放入一塊石頭完全沉入後，水面上升到 ${finalH} 公分，請問石頭的體積是多少立方公分？`
        );
        summaryAnswers.push(`${rockVol}立方公分`);
        answers.push(
          `簡答：${rockVol}立方公分。過程：底面積 = ${L} × ${W} = ${area} 平方公分，水面上升 = ${finalH} − ${waterH} = ${delta} 公分，石頭體積 = ${area} × ${delta} = ${rockVol} 立方公分。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE523CupPourSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // 類型 A：大容器倒入小杯（15 組，totalMl ÷ cupMl = cups 均為整數）
    const typeAPool = [
      { totalL: 2, totalMl: 2000, cupMl: 500, cups: 4, item: '水瓶', liquid: '水' },
      { totalL: 3, totalMl: 3000, cupMl: 300, cups: 10, item: '果汁瓶', liquid: '果汁' },
      { totalL: 2, totalMl: 2000, cupMl: 400, cups: 5, item: '保特瓶', liquid: '茶' },
      { totalL: 1.5, totalMl: 1500, cupMl: 300, cups: 5, item: '牛奶盒', liquid: '牛奶' },
      { totalL: 5, totalMl: 5000, cupMl: 250, cups: 20, item: '水桶', liquid: '水' },
      { totalL: 2.5, totalMl: 2500, cupMl: 500, cups: 5, item: '茶壺', liquid: '茶' },
      { totalL: 4, totalMl: 4000, cupMl: 250, cups: 16, item: '果汁瓶', liquid: '果汁' },
      { totalL: 1.8, totalMl: 1800, cupMl: 300, cups: 6, item: '果汁瓶', liquid: '柳橙汁' },
      { totalL: 2, totalMl: 2000, cupMl: 250, cups: 8, item: '茶壺', liquid: '紅茶' },
      { totalL: 1.2, totalMl: 1200, cupMl: 400, cups: 3, item: '水瓶', liquid: '牛奶' },
      { totalL: 3, totalMl: 3000, cupMl: 500, cups: 6, item: '水桶', liquid: '果汁' },
      { totalL: 0.6, totalMl: 600, cupMl: 150, cups: 4, item: '礦泉水', liquid: '水' },
      { totalL: 10, totalMl: 10000, cupMl: 500, cups: 20, item: '大水桶', liquid: '水' },
      { totalL: 15, totalMl: 15000, cupMl: 750, cups: 20, item: '水桶', liquid: '水' },
      { totalL: 2.4, totalMl: 2400, cupMl: 300, cups: 8, item: '果汁瓶', liquid: '蘋果汁' },
    ];
    // 類型 B：正方體裝滿水倒入長方體，求水深（所有答案均已驗算為整數）
    const typeBPool = [
      { sideA: 10, vol: 1000, L: 20, W: 10, area: 200, finalH: 5 },
      { sideA: 8, vol: 512, L: 16, W: 4, area: 64, finalH: 8 },
      { sideA: 15, vol: 3375, L: 25, W: 9, area: 225, finalH: 15 },
      { sideA: 12, vol: 1728, L: 24, W: 9, area: 216, finalH: 8 },
      { sideA: 20, vol: 8000, L: 40, W: 20, area: 800, finalH: 10 },
      { sideA: 10, vol: 1000, L: 25, W: 4, area: 100, finalH: 10 },
      { sideA: 6, vol: 216, L: 12, W: 6, area: 72, finalH: 3 },
      { sideA: 9, vol: 729, L: 27, W: 9, area: 243, finalH: 3 },
      { sideA: 15, vol: 3375, L: 27, W: 25, area: 675, finalH: 5 },
      { sideA: 10, vol: 1000, L: 20, W: 5, area: 100, finalH: 10 },
      { sideA: 12, vol: 1728, L: 18, W: 16, area: 288, finalH: 6 },
      { sideA: 18, vol: 5832, L: 27, W: 24, area: 648, finalH: 9 },
      { sideA: 5, vol: 125, L: 5, W: 5, area: 25, finalH: 5 },
      { sideA: 4, vol: 64, L: 8, W: 4, area: 32, finalH: 2 },
      { sideA: 12, vol: 1728, L: 48, W: 9, area: 432, finalH: 4 },
    ];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const c = typeAPool[randInt(0, typeAPool.length - 1)];
        questions.push(
          `一個容量 ${c.totalL} 公升的${c.item}裝滿${c.liquid}，倒入容量 ${c.cupMl} 毫升的杯子，可以倒幾杯？`
        );
        summaryAnswers.push(`${c.cups}杯`);
        answers.push(
          `簡答：${c.cups}杯。過程：${c.totalL} 公升 = ${c.totalMl} 毫升，${c.totalMl} ÷ ${c.cupMl} = ${c.cups} 杯。`
        );
      } else {
        const c = typeBPool[randInt(0, typeBPool.length - 1)];
        questions.push(
          `一個內部邊長 ${c.sideA} 公分的正方體容器裝滿水，全部倒入一個內部長 ${c.L} 公分、寬 ${c.W} 公分的長方體容器，水深是多少公分？`
        );
        summaryAnswers.push(`${c.finalH}公分`);
        answers.push(
          `簡答：${c.finalH}公分。過程：正方體容積 = ${c.sideA}³ = ${c.vol} 立方公分，底面積 = ${c.L} × ${c.W} = ${c.area} 平方公分，水深 = ${c.vol} ÷ ${c.area} = ${c.finalH} 公分。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE523FractionBaseAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // 類型 A：容器裝幾分之幾的水，求水量（公升）—— 所有答案均為整數公升
    const typeAPool = [
      { L: 60, W: 40, H: 50, num: 3, den: 4, frac: '3/4', waterVol: 90000, waterL: 90 },
      { L: 30, W: 20, H: 25, num: 3, den: 5, frac: '3/5', waterVol: 9000, waterL: 9 },
      { L: 40, W: 25, H: 20, num: 1, den: 2, frac: '1/2', waterVol: 10000, waterL: 10 },
      { L: 50, W: 40, H: 30, num: 3, den: 4, frac: '3/4', waterVol: 45000, waterL: 45 },
      { L: 60, W: 50, H: 40, num: 2, den: 3, frac: '2/3', waterVol: 80000, waterL: 80 },
      { L: 40, W: 30, H: 25, num: 2, den: 5, frac: '2/5', waterVol: 12000, waterL: 12 },
      { L: 70, W: 50, H: 60, num: 1, den: 2, frac: '1/2', waterVol: 105000, waterL: 105 },
      { L: 60, W: 40, H: 50, num: 1, den: 3, frac: '1/3', waterVol: 40000, waterL: 40 },
      { L: 80, W: 50, H: 60, num: 3, den: 4, frac: '3/4', waterVol: 180000, waterL: 180 },
      { L: 45, W: 40, H: 50, num: 2, den: 3, frac: '2/3', waterVol: 60000, waterL: 60 },
      { L: 50, W: 40, H: 45, num: 4, den: 9, frac: '4/9', waterVol: 40000, waterL: 40 },
      { L: 60, W: 50, H: 25, num: 4, den: 5, frac: '4/5', waterVol: 60000, waterL: 60 },
      { L: 30, W: 25, H: 16, num: 3, den: 4, frac: '3/4', waterVol: 9000, waterL: 9 },
      { L: 50, W: 30, H: 40, num: 1, den: 2, frac: '1/2', waterVol: 30000, waterL: 30 },
      { L: 70, W: 60, H: 50, num: 1, den: 3, frac: '1/3', waterVol: 70000, waterL: 70 },
    ];
    // 類型 B：已知容積與水深，求底面積（vol ÷ depth = area，均驗算為整數）
    const typeBPool = [
      { volStr: '20 公升', vol: 20000, depth: 16, depthU: '公分', area: 1250, areaU: '平方公分', thing: '魚缸' },
      { volStr: '30 公升', vol: 30000, depth: 20, depthU: '公分', area: 1500, areaU: '平方公分', thing: '魚缸' },
      { volStr: '12 公升', vol: 12000, depth: 8, depthU: '公分', area: 1500, areaU: '平方公分', thing: '水族箱' },
      { volStr: '36 公升', vol: 36000, depth: 30, depthU: '公分', area: 1200, areaU: '平方公分', thing: '水槽' },
      { volStr: '3500 立方公分', vol: 3500, depth: 5, depthU: '公分', area: 700, areaU: '平方公分', thing: '水箱' },
      { volStr: '6 公升', vol: 6000, depth: 4, depthU: '公分', area: 1500, areaU: '平方公分', thing: '魚缸' },
      { volStr: '45 公升', vol: 45000, depth: 30, depthU: '公分', area: 1500, areaU: '平方公分', thing: '水族箱' },
      { volStr: '8 公升', vol: 8000, depth: 5, depthU: '公分', area: 1600, areaU: '平方公分', thing: '水箱' },
      { volStr: '24 公升', vol: 24000, depth: 15, depthU: '公分', area: 1600, areaU: '平方公分', thing: '水族箱' },
      { volStr: '10 公升', vol: 10000, depth: 8, depthU: '公分', area: 1250, areaU: '平方公分', thing: '魚缸' },
      { volStr: '75 立方公尺', vol: 75, depth: 1, depthU: '公尺', area: 75, areaU: '平方公尺', thing: '游泳池' },
      { volStr: '50 立方公尺', vol: 50, depth: 2, depthU: '公尺', area: 25, areaU: '平方公尺', thing: '游泳池' },
      { volStr: '120 立方公尺', vol: 120, depth: 3, depthU: '公尺', area: 40, areaU: '平方公尺', thing: '蓄水池' },
      { volStr: '15 公升', vol: 15000, depth: 12, depthU: '公分', area: 1250, areaU: '平方公分', thing: '水槽' },
      { volStr: '18 公升', vol: 18000, depth: 9, depthU: '公分', area: 2000, areaU: '平方公分', thing: '水族箱' },
    ];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const c = typeAPool[randInt(0, typeAPool.length - 1)];
        const totalVol = c.L * c.W * c.H;
        questions.push(
          `一個長方體容器，內部長 ${c.L} 公分、寬 ${c.W} 公分、高 ${c.H} 公分，裡面裝了 ${c.frac} 的水，請問有多少公升的水？`
        );
        summaryAnswers.push(`${c.waterL}公升`);
        answers.push(
          `簡答：${c.waterL}公升。過程：容器容積 = ${c.L} × ${c.W} × ${c.H} = ${totalVol} 立方公分，水量 = ${totalVol} × ${c.num}/${c.den} = ${c.waterVol} 立方公分 = ${c.waterL} 公升。`
        );
      } else {
        const c = typeBPool[randInt(0, typeBPool.length - 1)];
        questions.push(
          `一個${c.thing}裝有 ${c.volStr} 的水，水深 ${c.depth} ${c.depthU}，請問${c.thing}的底面積是多少${c.areaU}？`
        );
        summaryAnswers.push(`${c.area}${c.areaU}`);
        answers.push(
          `簡答：${c.area}${c.areaU}。過程：底面積 = 水量 ÷ 水深 = ${c.vol} ÷ ${c.depth} = ${c.area} ${c.areaU}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE523RockCupThreeSet(count) {
    return buildE523MixedSet(
      [buildE523RockWaterLevelSet, buildE523CupPourSet, buildE523FractionBaseAreaSet],
      count
    );
  }

  function e511Answer(shortAnswer, process) {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function e511Trim(value, digits = 5) {
    return trimDecimalString(Number(value.toFixed(digits)).toString());
  }

  function e511Fixed(value, digits) {
    return Number(value).toFixed(digits);
  }

  function e511IntegerToChinese(value) {
    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const n = Number(value);
    if (n === 0) return '零';
    if (n < 10) return digits[n];
    if (n < 20) return `十${n % 10 === 0 ? '' : digits[n % 10]}`;
    if (n < 100) return `${digits[Math.floor(n / 10)]}十${n % 10 === 0 ? '' : digits[n % 10]}`;
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    if (remainder === 0) return `${digits[hundreds]}百`;
    if (remainder < 10) return `${digits[hundreds]}百零${digits[remainder]}`;
    return `${digits[hundreds]}百${e511IntegerToChinese(remainder)}`;
  }

  function e511DecimalToChinese(value, digitsCount) {
    const digitMap = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const text = e511Fixed(value, digitsCount);
    const [integerText, decimalText] = text.split('.');
    const integerPart = e511IntegerToChinese(Number(integerText));
    return `${integerPart}點${decimalText
      .split('')
      .map((digit) => digitMap[Number(digit)])
      .join('')}`;
  }

  function e511CountUnitValue(unitText) {
    const map = {
      1: 1,
      0.1: 0.1,
      0.01: 0.01,
      0.001: 0.001,
      0.0001: 0.0001,
      0.00001: 0.00001,
    };
    return map[unitText] || 0;
  }

  function e511FormatDigitList(digits) {
    return digits.length ? digits.join('、') : '無';
  }

  function e511RoundText(valueText, keepDigits) {
    const source = String(valueText || '').trim();
    const [rawInteger, rawDecimal = ''] = source.split('.');
    let integerText = rawInteger || '0';
    let decimalText = rawDecimal;
    while (decimalText.length < keepDigits + 1) decimalText += '0';

    if (keepDigits === 0) {
      let integerValue = Number(integerText);
      if (Number(decimalText[0] || '0') >= 5) integerValue += 1;
      return String(integerValue);
    }

    const keptDigits = decimalText.slice(0, keepDigits).split('');
    const nextDigit = Number(decimalText[keepDigits] || '0');
    if (nextDigit >= 5) {
      let carry = 1;
      for (let index = keptDigits.length - 1; index >= 0; index -= 1) {
        const sum = Number(keptDigits[index]) + carry;
        keptDigits[index] = String(sum % 10);
        carry = Math.floor(sum / 10);
        if (!carry) break;
      }
      if (carry) {
        integerText = String(Number(integerText) + carry);
      }
    }
    return `${integerText}.${keptDigits.join('')}`;
  }

  function buildE511ReadWriteSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const integerPart = pickFromList([0, 3, 5, 8, 12, 17, 21, 34, 56, 80]);
      const digitsCount = pickFromList([3, 4, 5]);
      const decimalDigits = [];
      for (let j = 0; j < digitsCount; j += 1) {
        decimalDigits.push(String(randInt(0, 9)));
      }
      if (decimalDigits.every((digit) => digit === '0')) {
        decimalDigits[digitsCount - 1] = String(randInt(1, 9));
      }
      const numberText = `${integerPart}.${decimalDigits.join('')}`;
      const chineseText = e511DecimalToChinese(Number(numberText), digitsCount);
      if (i % 2 === 0) {
        questions.push(`「${chineseText}」記作什麼？`);
        summaryAnswers.push(numberText);
        answers.push(
          e511Answer(
            numberText,
            `整數部分是 ${e511IntegerToChinese(integerPart)}，寫成 ${integerPart}；小數部分依序是 ${decimalDigits.join('、')}，所以記作 ${numberText}。`
          )
        );
      } else {
        questions.push(`${numberText} 應如何正確讀出？`);
        summaryAnswers.push(chineseText);
        answers.push(
          e511Answer(
            chineseText,
            `整數部分 ${integerPart} 讀作「${e511IntegerToChinese(integerPart)}」，小數點後每一位要分開讀，所以 ${numberText} 讀作「${chineseText}」。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE511PlaceCompositionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const units = ['0.1', '0.01', '0.001', '0.0001'];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const ones = randInt(1, 9);
        const tenths = randInt(0, 9);
        const hundredths = randInt(0, 9);
        const thousandths = randInt(1, 9);
        const value = ones + tenths * 0.1 + hundredths * 0.01 + thousandths * 0.001;
        const answerText = e511Fixed(value, 3);
        questions.push(
          `${ones} 個 1、${tenths} 個 0.1、${hundredths} 個 0.01 和 ${thousandths} 個 0.001 合起來是多少？`
        );
        summaryAnswers.push(answerText);
        answers.push(
          e511Answer(
            answerText,
            `合起來是 ${ones} + ${tenths * 0.1} + ${hundredths * 0.01} + ${thousandths * 0.001} = ${answerText}。`
          )
        );
      } else if (mode === 1) {
        const unitText = pickFromList(units);
        const countValue = pickFromList([8, 12, 25, 105, 399, 6300, 8000]);
        const value = countValue * e511CountUnitValue(unitText);
        const digits = Math.max(1, unitText.split('.')[1].length);
        const answerText = e511Fixed(value, digits);
        questions.push(`${countValue} 個 ${unitText} 合起來是多少？`);
        summaryAnswers.push(answerText);
        answers.push(
          e511Answer(answerText, `${countValue} 個 ${unitText} 就是 ${countValue} × ${unitText} = ${answerText}。`)
        );
      } else {
        const unitText = pickFromList(['0.001', '0.0001', '0.00001']);
        const digits = unitText.split('.')[1].length;
        const countValue = pickFromList([12, 25, 48, 125, 340]);
        const value = countValue * e511CountUnitValue(unitText);
        const answerText = `${countValue}個`;
        questions.push(`${e511Fixed(value, digits)} 是由幾個 ${unitText} 合起來的？`);
        summaryAnswers.push(answerText);
        answers.push(
          e511Answer(
            answerText,
            `要求有幾個 ${unitText}，就是 ${e511Fixed(value, digits)} ÷ ${unitText} = ${countValue}，所以是 ${answerText}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE511PlaceDigitMeaningSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const placeBank = [
      { name: '十分位', digits: 1, valueText: '0.1' },
      { name: '百分位', digits: 2, valueText: '0.01' },
      { name: '千分位', digits: 3, valueText: '0.001' },
      { name: '萬分位', digits: 4, valueText: '0.0001' },
    ];
    for (let i = 0; i < count; i += 1) {
      const digitsCount = pickFromList([3, 4]);
      const integerPart = randInt(1, 30);
      const decimalDigits = [];
      for (let j = 0; j < digitsCount; j += 1) {
        decimalDigits.push(String(randInt(0, 9)));
      }
      const valueText = `${integerPart}.${decimalDigits.join('')}`;
      const place = placeBank[randInt(0, Math.min(digitsCount, placeBank.length) - 1)];
      const digit = decimalDigits[place.digits - 1];
      if (i % 2 === 0) {
        const answerText = `${digit}`;
        questions.push(`在 ${valueText} 中，「${place.name}」的數字是多少？`);
        summaryAnswers.push(answerText);
        answers.push(
          e511Answer(
            answerText,
            `小數點後第 ${place.digits} 位就是${place.name}，${valueText} 的 ${place.name} 數字是 ${digit}。`
          )
        );
      } else {
        const answerText = `${digit}個${place.valueText}`;
        questions.push(`在 ${valueText} 中，「${place.name}」上的數字 ${digit} 表示什麼？`);
        summaryAnswers.push(answerText);
        answers.push(
          e511Answer(
            answerText,
            `${place.name} 表示每一個是 ${place.valueText}，所以數字 ${digit} 代表 ${digit} 個 ${place.valueText}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE511CompareFillSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      let built = null;
      while (!built) {
        const integerPart = randInt(0, 20);
        const digitsCount = pickFromList([3, 4]);
        const leftDigits = [];
        const rightDigits = [];
        for (let j = 0; j < digitsCount; j += 1) {
          leftDigits.push(String(randInt(0, 9)));
          rightDigits.push(String(randInt(0, 9)));
        }
        const blankIndex = randInt(0, digitsCount - 1);
        const symbol = pickFromList(['>', '<']);
        const validDigits = [];
        for (let digit = 0; digit <= 9; digit += 1) {
          const candidateDigits = [...leftDigits];
          candidateDigits[blankIndex] = String(digit);
          const leftValue = Number(`${integerPart}.${candidateDigits.join('')}`);
          const rightValue = Number(`${integerPart}.${rightDigits.join('')}`);
          if ((symbol === '>' && leftValue > rightValue) || (symbol === '<' && leftValue < rightValue)) {
            validDigits.push(String(digit));
          }
        }
        if (validDigits.length === 0 || validDigits.length === 10) continue;
        const leftDisplay = `${integerPart}.${leftDigits.map((digit, index) => (index === blankIndex ? '□' : digit)).join('')}`;
        const rightDisplay = `${integerPart}.${rightDigits.join('')}`;
        built = { leftDisplay, rightDisplay, symbol, validDigits, blankIndex };
      }
      const answerText = e511FormatDigitList(built.validDigits);
      questions.push(`${built.leftDisplay} ${built.symbol} ${built.rightDisplay}，□ 中可以填入 0～9 中的哪些數字？`);
      summaryAnswers.push(answerText);
      answers.push(
        e511Answer(
          answerText,
          `從左到右比較大小，關鍵在小數點後第 ${built.blankIndex + 1} 位附近。逐一代入 0～9，可行的是 ${answerText}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE511TrimZeroSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = ['3.5000', '2.1608', '7.8002', '5.0007', '60.0', '8.0400', '0.2300', '12.3400'];
    for (let i = 0; i < count; i += 1) {
      const text = bank[i % bank.length];
      let answerText = text;
      if (text.includes('.')) {
        const [integerPart, decimalPart] = text.split('.');
        const trimmedDecimal = decimalPart.replace(/0+$/, '');
        answerText = trimmedDecimal ? `${integerPart}.${trimmedDecimal}` : integerPart;
      }
      questions.push(`把 ${text} 去掉可以省略的 0 後，應寫成什麼？`);
      summaryAnswers.push(answerText);
      answers.push(
        e511Answer(
          answerText,
          `只有小數末尾多出的 0 可以省略；夾在中間的 0 不能刪掉，所以 ${text} 應寫成 ${answerText}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE511ColumnAddSubtractSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const digitsA = pickFromList([2, 3, 4]);
      const digitsB = pickFromList([2, 3, 4]);
      const a = randInt(100, 9999) / 10 ** digitsA;
      let b = randInt(100, 9999) / 10 ** digitsB;
      const useAdd = i % 2 === 0;
      if (!useAdd && b > a) {
        const temp = a;
        b = temp / 2;
      }
      const result = useAdd ? a + b : a - b;
      const answerText = e511Trim(result, 6);
      questions.push(`計算：${e511Trim(a, 4)} ${useAdd ? '+' : '−'} ${e511Trim(b, 4)} = （　）`);
      summaryAnswers.push(answerText);
      answers.push(
        e511Answer(answerText, `先把小數點對齊，再做 ${useAdd ? '加法' : '減法'}。計算後得到 ${answerText}。`)
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE511ApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const types = [
      () => {
        const a = e511Trim(randInt(300, 900) / 1000, 3);
        const b = e511Trim(randInt(300, 900) / 1000, 3);
        const answerText = Number(a) > Number(b) ? 'A 路線' : 'B 路線';
        return {
          question: `A 路線長 ${a} 公里，B 路線長 ${b} 公里，哪條路線比較長？`,
          answer: answerText,
          process: `比較 ${a} 和 ${b}，較大的那一條路線較長，所以答案是 ${answerText}。`,
        };
      },
      () => {
        const original = randInt(4000, 9000) / 10000;
        const added = randInt(100, 900) / 10000;
        const total = original + added;
        const answerText = e511Trim(total, 5);
        return {
          question: `罐子裡原有 ${e511Trim(original, 4)} 公斤綠豆，再倒入 ${e511Trim(added, 4)} 公斤後，現在共有多少公斤？`,
          answer: answerText,
          process: `總量 = 原有 + 倒入 = ${e511Trim(original, 4)} + ${e511Trim(added, 4)} = ${answerText}（公斤）。`,
        };
      },
      () => {
        const original = randInt(12000, 30000) / 10000;
        const used = randInt(3000, 9000) / 10000;
        const left = original - used;
        const answerText = e511Trim(left, 5);
        return {
          question: `牛奶原有 ${e511Trim(original, 4)} 公升，喝掉 ${e511Trim(used, 4)} 公升，還剩下多少公升？`,
          answer: answerText,
          process: `剩下的量 = 原有 − 喝掉 = ${e511Trim(original, 4)} − ${e511Trim(used, 4)} = ${answerText}（公升）。`,
        };
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const built = types[i % types.length]();
      questions.push(built.question);
      summaryAnswers.push(built.answer);
      answers.push(e511Answer(built.answer, built.process));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE511RoundDirectSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const placeBank = [
      { name: '個位', digits: 0 },
      { name: '十分位', digits: 1 },
      { name: '百分位', digits: 2 },
    ];
    for (let i = 0; i < count; i += 1) {
      const place = placeBank[i % placeBank.length];
      if (i % 2 === 0) {
        const value = randInt(1000, 99999) / 1000;
        const sourceText = e511Fixed(value, 3);
        const rounded = e511RoundText(sourceText, place.digits);
        questions.push(`${sourceText} 用四捨五入法取概數到${place.name}是多少？`);
        summaryAnswers.push(rounded);
        answers.push(
          e511Answer(
            rounded,
            `看 ${place.name}後面一位來決定四捨五入，${sourceText} 取到${place.name}後是 ${rounded}。`
          )
        );
      } else {
        const cityA = pickFromList(['臺北到高雄', '臺北到臺中', '嘉義到臺南', '基隆到新竹']);
        const value = randInt(12000, 250000) / 1000;
        const sourceText = e511Fixed(value, 3);
        const rounded = e511RoundText(sourceText, 1);
        questions.push(`${cityA}距離約 ${sourceText} 公里，取概數到十分位是多少公里？`);
        summaryAnswers.push(`${rounded}公里`);
        answers.push(
          e511Answer(`${rounded}公里`, `${sourceText} 公里取概數到十分位，要看百分位數字，所以答案是 ${rounded} 公里。`)
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE511RoundKeepZeroSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      { value: 8.04, digits: 1, place: '十分位' },
      { value: 1.99, digits: 1, place: '十分位' },
      { value: 5.395, digits: 2, place: '百分位' },
      { value: 16.795, digits: 2, place: '百分位' },
      { value: 3.004, digits: 2, place: '百分位' },
      { value: 2.951, digits: 1, place: '十分位' },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = bank[i % bank.length];
      const sourceText = e511Fixed(item.value, 3);
      const answerText = e511RoundText(sourceText, item.digits);
      questions.push(`${sourceText} 用四捨五入法取概數到${item.place}是多少？`);
      summaryAnswers.push(answerText);
      answers.push(
        e511Answer(
          answerText,
          `取概數到${item.place}後，最後一位如果是 0 也要保留，表示精確到這一位，所以答案要寫成 ${answerText}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE511RoundMultiPlaceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const value = randInt(10000, 99999) / 1000;
      const sourceText = e511Fixed(value, 3);
      const ones = e511RoundText(sourceText, 0);
      const tenths = e511RoundText(sourceText, 1);
      const hundredths = e511RoundText(sourceText, 2);
      const answerText = `${ones}、${tenths}、${hundredths}`;
      questions.push(`${sourceText} 分別取概數到個位、十分位與百分位各是多少？`);
      summaryAnswers.push(answerText);
      answers.push(
        e511Answer(
          answerText,
          `同一個數分別取到不同位數時，要各自看下一位：取到個位是 ${ones}，取到十分位是 ${tenths}，取到百分位是 ${hundredths}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE511RoundSelectionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const digits = i % 2 === 0 ? 1 : 2;
      const target =
        digits === 1 ? Number((randInt(10, 99) / 10).toFixed(1)) : Number((randInt(100, 999) / 100).toFixed(2));
      const options = [];
      while (options.length < 5) {
        const offset = pickFromList([-0.06, -0.04, -0.01, 0, 0.01, 0.024, 0.049, 0.051, 0.08]);
        const candidate = Number((target + offset).toFixed(3));
        const text = e511Trim(candidate, 3);
        if (!options.includes(text)) options.push(text);
      }
      const targetText = target.toFixed(digits);
      const winners = options
        .filter((text) => e511RoundText(text, digits) === targetText)
        .sort((a, b) => Number(a) - Number(b));
      const placeText = digits === 1 ? '十分位' : '百分位';
      questions.push(`下面哪些數取概數到${placeText}會得到 ${targetText}？（選項：${options.join('、')}）`);
      summaryAnswers.push(winners.join('、'));
      answers.push(
        e511Answer(
          winners.join('、'),
          `逐一把選項取概數到${placeText}，會得到 ${targetText} 的有 ${winners.join('、')}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE511RoundHiddenDigitSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      let built = null;
      while (!built) {
        const integerPart = randInt(1, 40);
        const tenths = randInt(0, 9);
        const hundredths = randInt(0, 9);
        const thousandths = randInt(0, 9);
        const mode = i % 2;
        if (mode === 0) {
          const base = `${integerPart}.${tenths}□`;
          const target = `${integerPart}.${tenths}`;
          const validDigits = [];
          for (let digit = 0; digit <= 9; digit += 1) {
            const valueText = `${integerPart}.${tenths}${digit}`;
            if (e511RoundText(valueText, 1) === Number(target).toFixed(1)) {
              validDigits.push(String(digit));
            }
          }
          if (validDigits.length && validDigits.length < 10) {
            built = {
              question: `${base} 用四捨五入法取概數到十分位是 ${target}，□ 裡可以填入哪些數字？`,
              answer: e511FormatDigitList(validDigits),
              process: `要取到十分位，就看百分位。逐一檢查後，□ 可以填 ${e511FormatDigitList(validDigits)}。`,
            };
          }
        } else {
          const base = `${integerPart}.${tenths}${hundredths}□`;
          const target = Number(`${integerPart}.${tenths}${hundredths}`).toFixed(2);
          const validDigits = [];
          for (let digit = 0; digit <= 9; digit += 1) {
            const valueText = `${integerPart}.${tenths}${hundredths}${digit}`;
            if (e511RoundText(valueText, 2) === target) {
              validDigits.push(String(digit));
            }
          }
          if (validDigits.length && validDigits.length < 10) {
            built = {
              question: `${base} 用四捨五入法取概數到百分位是 ${target}，□ 裡可以填入哪些數字？`,
              answer: e511FormatDigitList(validDigits),
              process: `要取到百分位，就看千分位。逐一檢查後，□ 可以填 ${e511FormatDigitList(validDigits)}。`,
            };
          }
        }
      }
      questions.push(built.question);
      summaryAnswers.push(built.answer);
      answers.push(e511Answer(built.answer, built.process));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE511MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = banks[i % banks.length](1);
      questions.push(built.questions[0]);
      summaryAnswers.push(built.summaryAnswers[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE511LiteracyThreeSet(count) {
    return buildE511MixedSet(
      [buildE511ReadWriteSet, buildE511PlaceCompositionSet, buildE511PlaceDigitMeaningSet],
      count
    );
  }

  function buildE511CompareTwoSet(count) {
    return buildE511MixedSet([buildE511CompareFillSet, buildE511TrimZeroSet], count);
  }

  function buildE511ComputeTwoSet(count) {
    return buildE511MixedSet([buildE511ColumnAddSubtractSet, buildE511ApplicationSet], count);
  }

  function buildE511RoundThreeSet(count) {
    return buildE511MixedSet([buildE511RoundDirectSet, buildE511RoundKeepZeroSet, buildE511RoundMultiPlaceSet], count);
  }

  function buildE511ReverseTwoSet(count) {
    return buildE511MixedSet([buildE511RoundSelectionSet, buildE511RoundHiddenDigitSet], count);
  }

  function e512Answer(shortAnswer, process) {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function e512FormatList(values) {
    return values.map((value) => String(value)).join('、');
  }

  function e512ListFactors(value) {
    const factors = [];
    for (let i = 1; i * i <= value; i += 1) {
      if (value % i !== 0) continue;
      factors.push(i);
      if (i !== value / i) factors.push(value / i);
    }
    return factors.sort((a, b) => a - b);
  }

  function e512Gcd(a, b) {
    let x = Math.abs(Number(a) || 0);
    let y = Math.abs(Number(b) || 0);
    while (y) {
      const temp = x % y;
      x = y;
      y = temp;
    }
    return x;
  }

  function e512SampleOptionSet(correctPool, wrongPool, correctCount, totalCount) {
    const chosenCorrect = shuffle([...correctPool]).slice(0, Math.min(correctCount, correctPool.length));
    const chosenWrong = shuffle([...wrongPool]).slice(0, Math.max(0, totalCount - chosenCorrect.length));
    return shuffle([...chosenCorrect, ...chosenWrong]).slice(0, totalCount);
  }

  function buildE512DivisibleSelectionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const dividendBank = [24, 36, 48, 60, 72, 84, 90, 96, 108, 120, 128, 150];
    for (let i = 0; i < count; i += 1) {
      const dividend = dividendBank[i % dividendBank.length];
      const factors = e512ListFactors(dividend).filter((value) => value <= 20);
      const nonFactors = Array.from({ length: 20 }, (_, index) => index + 1).filter((value) => dividend % value !== 0);
      if (i % 2 === 0) {
        const options = e512SampleOptionSet(factors, nonFactors, 4, 7).sort((a, b) => a - b);
        const winners = options.filter((value) => dividend % value === 0);
        const answerText = e512FormatList(winners);
        questions.push(`${dividend} 可以被下面哪些數整除？（選項：${e512FormatList(options)}）`);
        summaryAnswers.push(answerText);
        answers.push(
          e512Answer(answerText, `能整除表示除完餘數是 0。逐一檢查後，${dividend} 可以被 ${answerText} 整除。`)
        );
      } else {
        const divisors = shuffle(factors.filter((value) => value > 1)).slice(0, 2);
        const nonDivisors = shuffle(nonFactors.filter((value) => value > 1)).slice(0, 2);
        const options = shuffle([
          `${dividend} ÷ ${divisors[0]}`,
          `${dividend} ÷ ${divisors[1]}`,
          `${dividend} ÷ ${nonDivisors[0]}`,
          `${dividend} ÷ ${nonDivisors[1]}`,
        ]);
        const winners = options.filter((text) => {
          const divisor = Number(text.split('÷')[1].trim());
          return dividend % divisor === 0;
        });
        const answerText = e512FormatList(winners);
        questions.push(`下面哪些算式可以整除？（選項：${e512FormatList(options)}）`);
        summaryAnswers.push(answerText);
        answers.push(e512Answer(answerText, `整除就是除完沒有餘數。逐一檢查後，可以整除的是 ${answerText}。`));
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE512FactorRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [5, 8],
      [6, 9],
      [7, 12],
      [8, 15],
      [9, 10],
      [12, 14],
      [13, 6],
      [15, 16],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = bank[i % bank.length];
      const product = a * b;
      if (i % 3 === 0) {
        questions.push(`觀察 ${a} × ${b} = ${product}，${a} 和 ${b} 都是 ${product} 的什麼數？`);
        summaryAnswers.push('因數');
        answers.push(
          e512Answer(
            '因數',
            `因為 ${a} × ${b} = ${product}，能相乘得到 ${product} 的數就是 ${product} 的因數，所以 ${a} 和 ${b} 都是因數。`
          )
        );
      } else if (i % 3 === 1) {
        questions.push(`已知 ${product} ÷ ${a} = ${b}，${product} 是 ${a} 的什麼數？${a} 是 ${product} 的什麼數？`);
        summaryAnswers.push(`${product} 是 ${a} 的倍數，${a} 是 ${product} 的因數`);
        answers.push(
          e512Answer(
            `${product} 是 ${a} 的倍數，${a} 是 ${product} 的因數`,
            `因為 ${product} ÷ ${a} = ${b}，除得盡，所以 ${a} 能整除 ${product}。因此 ${product} 是 ${a} 的倍數，${a} 是 ${product} 的因數。`
          )
        );
      } else {
        const statement = `${a} 和 ${b} 都是 ${product} 的倍數`;
        const correction = `${a} 和 ${b} 都是 ${product} 的因數`;
        questions.push(`判斷正誤：${statement}。`);
        summaryAnswers.push(`錯，${correction}`);
        answers.push(
          e512Answer(
            `錯，${correction}`,
            `因為 ${a} × ${b} = ${product}，所以 ${a} 和 ${b} 都可以整除 ${product}，它們是 ${product} 的因數，不是倍數。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE512FactorListSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [16, 18, 24, 25, 28, 35, 36, 40, 45, 49, 60, 72];
    for (let i = 0; i < count; i += 1) {
      const value = bank[i % bank.length];
      const factors = e512ListFactors(value);
      const answerText = e512FormatList(factors);
      questions.push(`寫出 ${value} 的所有因數。`);
      summaryAnswers.push(answerText);
      answers.push(e512Answer(answerText, `依序找出可以整除 ${value} 的整數，全部列出是 ${answerText}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE512FactorPropertySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [24, 30, 35, 36, 42, 49, 64, 81, 90, 150];
    for (let i = 0; i < count; i += 1) {
      const value = bank[i % bank.length];
      const factors = e512ListFactors(value);
      if (i % 3 === 0) {
        const answerText = `${factors[0]} 和 ${factors[factors.length - 1]}`;
        questions.push(`找出 ${value} 的最小因數與最大因數各是多少？`);
        summaryAnswers.push(answerText);
        answers.push(
          e512Answer(
            answerText,
            `任何正整數的最小因數一定是 1，最大因數一定是自己，所以 ${value} 的最小因數與最大因數是 ${answerText}。`
          )
        );
      } else if (i % 3 === 1) {
        const pool = Array.from({ length: 10 }, (_, index) => index + 1);
        const winners = pool.filter((candidate) => value % candidate === 0);
        const answerText = e512FormatList(winners);
        questions.push(`在 1～10 的數字中，哪些是 ${value} 的因數？`);
        summaryAnswers.push(answerText);
        answers.push(e512Answer(answerText, `從 1 到 10 逐一檢查能否整除 ${value}，符合的是 ${answerText}。`));
      } else {
        const trimmedFactors = factors.slice(1, -1);
        const answerText = `${value}`;
        questions.push(`一個數的因數由小到大排是 1、${e512FormatList(trimmedFactors)}、${value}，原數是多少？`);
        summaryAnswers.push(answerText);
        answers.push(
          e512Answer(answerText, `一個數的最大因數一定是它自己。題目最後一個因數是 ${value}，所以原數就是 ${value}。`)
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE512CommonFactorListSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [18, 30],
      [24, 28],
      [12, 18],
      [15, 20],
      [30, 45],
      [42, 35],
      [60, 75],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = bank[i % bank.length];
      const commonFactors = e512ListFactors(e512Gcd(a, b));
      const gcd = commonFactors[commonFactors.length - 1];
      const answerText = `${e512FormatList(commonFactors)}；最大公因數是 ${gcd}`;
      questions.push(`找出 ${a} 和 ${b} 的所有公因數，並找出最大公因數。`);
      summaryAnswers.push(answerText);
      answers.push(
        e512Answer(
          answerText,
          `先分別找出 ${a} 和 ${b} 的因數，再找出共同的部分，可得公因數是 ${e512FormatList(commonFactors)}，其中最大的是 ${gcd}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE512GcdDirectSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [14, 8],
      [16, 48],
      [27, 36],
      [28, 34],
      [45, 60],
      [63, 84],
      [72, 96],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = bank[i % bank.length];
      const gcd = e512Gcd(a, b);
      questions.push(`找出 ${a} 和 ${b} 的最大公因數。`);
      summaryAnswers.push(`${gcd}`);
      answers.push(e512Answer(`${gcd}`, `能同時整除 ${a} 和 ${b} 的最大整數是 ${gcd}，所以最大公因數是 ${gcd}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE512CommonFactorPropertySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const pairBank = [
      [24, 16, 4],
      [48, 18, 6],
      [30, 45, 15],
      [20, 28, 4],
    ];
    const coprimeBank = [
      [14, 19],
      [21, 22],
      [25, 28],
    ];
    const nonCoprimeBank = [
      [15, 24],
      [20, 28],
      [18, 30],
      [24, 36],
      [35, 49],
    ];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const [a, b, common] = pairBank[i % pairBank.length];
        questions.push(`已知 ${common} 是 ${a} 的因數，也是 ${b} 的因數，那麼 ${common} 是 ${a} 和 ${b} 的什麼數？`);
        summaryAnswers.push('公因數');
        answers.push(
          e512Answer('公因數', `同時是 ${a} 和 ${b} 的因數，就叫做 ${a} 和 ${b} 的公因數，所以答案是公因數。`)
        );
      } else {
        const winner = pickFromList(coprimeBank);
        const options = shuffle([winner, ...shuffle([...nonCoprimeBank]).slice(0, 3)]);
        const answerText = `${winner[0]} 和 ${winner[1]}`;
        questions.push(`下列哪一組數的公因數只有 1？（選項：${options.map(([a, b]) => `${a} 和 ${b}`).join('、')}）`);
        summaryAnswers.push(answerText);
        answers.push(
          e512Answer(
            answerText,
            `公因數只有 1 代表這兩個數互質。逐一檢查後，${answerText} 的最大公因數是 1，所以答案是 ${answerText}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE512PackGroupSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      ['16 支筆和 40 片餅乾要平均分配，每袋筆和餅乾都一樣多且剛好分完，最多可以分成幾袋？', 16, 40, '袋'],
      ['24 朵玫瑰和 36 朵菊花要分裝在花瓶裡，每瓶花量相同且全部裝完，最多需要幾個花瓶？', 24, 36, '個花瓶'],
      ['32 個男生和 56 個女生要分組，每組男生、女生人數各一樣且剛好分完，最多可分成幾組？', 32, 56, '組'],
      ['甲班有 20 人、乙班有 30 人，兩班一起分組活動且每組人數相同又分完，每組最多有幾人？', 20, 30, '人'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [questionText, a, b, targetUnit] = bank[i % bank.length];
      const gcd = e512Gcd(a, b);
      questions.push(questionText);
      summaryAnswers.push(`${gcd}${targetUnit}`);
      answers.push(
        e512Answer(
          `${gcd}${targetUnit}`,
          `要分得一樣多又剛好分完，就是找 ${a} 和 ${b} 的最大公因數。${a} 和 ${b} 的最大公因數是 ${gcd}，所以最多可以分成 ${gcd}${targetUnit}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE512CutIntervalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      ['一張長方形紙長 30 公分、寬 25 公分，想剪成一樣大的正方形', 30, 25, '公分'],
      ['一張方格紙長 24 公分、寬 16 公分，想剪成一樣大的正方形且全部剪完', 24, 16, '公分'],
      ['在長 28 公尺、寬 42 公尺的公園周圍每隔相同距離種一棵且四個角都要種', 28, 42, '公尺'],
      ['兩條彩帶分別長 18 公分和 24 公分，要剪成一樣長的小段且長度為整數', 18, 24, '公分'],
      ['兩根木棍分別長 10 公分和 15 公分，要切成等長小段且不剩', 10, 15, '公分'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [questionText, a, b, unit] = bank[i % bank.length];
      const gcd = e512Gcd(a, b);
      questions.push(`${questionText}，最長是多少${unit}？`);
      summaryAnswers.push(`${gcd}${unit}`);
      answers.push(
        e512Answer(
          `${gcd}${unit}`,
          `要分成一樣長又剛好分完，就是找 ${a} 和 ${b} 的最大公因數。最大公因數是 ${gcd}，所以答案是 ${gcd} ${unit}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE512UnitRateInferenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      ['皮皮買同樣的鉛筆花了 72 元，美美買同樣的鉛筆花了 60 元，每枝鉛筆價錢最多是多少元？', 72, 60, '元'],
      ['一人買同樣的餅乾花了 48 元，另一人買同樣餅乾花了 56 元，每片餅乾單價最多是幾元？', 48, 56, '元'],
      ['皮皮已看了 60 頁小說，丹丹已看了 40 頁，而且兩人每天看的一樣多，他們每天最多看幾頁？', 60, 40, '頁'],
      ['甲班有 25 人，乙班有 30 人，兩班混合分組且每組人數相同又分完，每組最多有幾人？', 25, 30, '人'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [questionText, a, b, unit] = bank[i % bank.length];
      const gcd = e512Gcd(a, b);
      questions.push(questionText);
      summaryAnswers.push(`${gcd}${unit}`);
      answers.push(
        e512Answer(
          `${gcd}${unit}`,
          `在單價或每次相同數量固定的情況下，要求「最多」就是找兩個總數的最大公因數。${a} 和 ${b} 的最大公因數是 ${gcd}，所以答案是 ${gcd}${unit}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE512MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = banks[i % banks.length](1);
      questions.push(built.questions[0]);
      summaryAnswers.push(built.summaryAnswers[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE512BasicsTwoSet(count) {
    return buildE512MixedSet([buildE512DivisibleSelectionSet, buildE512FactorRelationSet], count);
  }

  function buildE512SingleNumberTwoSet(count) {
    return buildE512MixedSet([buildE512FactorListSet, buildE512FactorPropertySet], count);
  }

  function buildE512CommonThreeSet(count) {
    return buildE512MixedSet(
      [buildE512CommonFactorListSet, buildE512GcdDirectSet, buildE512CommonFactorPropertySet],
      count
    );
  }

  function buildE512ApplicationThreeSet(count) {
    return buildE512MixedSet([buildE512PackGroupSet, buildE512CutIntervalSet, buildE512UnitRateInferenceSet], count);
  }

  // ─── e5-1-2 新增 generators ───────────────────────────────────────────────

  // 質因數分解
  function buildE512PrimeFactorizationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // 預先計算好的質因數分解，用短除法說明
    const cases = [
      { n: 28,  factors: '2 × 2 × 7',   proc: '28 ÷ 2 = 14，14 ÷ 2 = 7（質數），所以 28 = 2 × 2 × 7' },
      { n: 42,  factors: '2 × 3 × 7',   proc: '42 ÷ 2 = 21，21 ÷ 3 = 7（質數），所以 42 = 2 × 3 × 7' },
      { n: 48,  factors: '2 × 2 × 2 × 2 × 3', proc: '48 ÷ 2 = 24，24 ÷ 2 = 12，12 ÷ 2 = 6，6 ÷ 2 = 3（質數），所以 48 = 2⁴ × 3' },
      { n: 60,  factors: '2 × 2 × 3 × 5', proc: '60 ÷ 2 = 30，30 ÷ 2 = 15，15 ÷ 3 = 5（質數），所以 60 = 2² × 3 × 5' },
      { n: 63,  factors: '3 × 3 × 7',   proc: '63 ÷ 3 = 21，21 ÷ 3 = 7（質數），所以 63 = 3 × 3 × 7' },
      { n: 70,  factors: '2 × 5 × 7',   proc: '70 ÷ 2 = 35，35 ÷ 5 = 7（質數），所以 70 = 2 × 5 × 7' },
      { n: 75,  factors: '3 × 5 × 5',   proc: '75 ÷ 3 = 25，25 ÷ 5 = 5（質數），所以 75 = 3 × 5 × 5' },
      { n: 84,  factors: '2 × 2 × 3 × 7', proc: '84 ÷ 2 = 42，42 ÷ 2 = 21，21 ÷ 3 = 7（質數），所以 84 = 2² × 3 × 7' },
      { n: 90,  factors: '2 × 3 × 3 × 5', proc: '90 ÷ 2 = 45，45 ÷ 3 = 15，15 ÷ 3 = 5（質數），所以 90 = 2 × 3² × 5' },
      { n: 96,  factors: '2 × 2 × 2 × 2 × 2 × 3', proc: '96 ÷ 2 = 48，48 ÷ 2 = 24，24 ÷ 2 = 12，12 ÷ 2 = 6，6 ÷ 2 = 3（質數），所以 96 = 2⁵ × 3' },
      { n: 100, factors: '2 × 2 × 5 × 5', proc: '100 ÷ 2 = 50，50 ÷ 2 = 25，25 ÷ 5 = 5（質數），所以 100 = 2² × 5²' },
      { n: 105, factors: '3 × 5 × 7',   proc: '105 ÷ 3 = 35，35 ÷ 5 = 7（質數），所以 105 = 3 × 5 × 7' },
      { n: 120, factors: '2 × 2 × 2 × 3 × 5', proc: '120 ÷ 2 = 60，60 ÷ 2 = 30，30 ÷ 2 = 15，15 ÷ 3 = 5（質數），所以 120 = 2³ × 3 × 5' },
      { n: 126, factors: '2 × 3 × 3 × 7', proc: '126 ÷ 2 = 63，63 ÷ 3 = 21，21 ÷ 3 = 7（質數），所以 126 = 2 × 3² × 7' },
      { n: 144, factors: '2 × 2 × 2 × 2 × 3 × 3', proc: '144 ÷ 2 = 72，72 ÷ 2 = 36，36 ÷ 2 = 18，18 ÷ 2 = 9，9 ÷ 3 = 3（質數），所以 144 = 2⁴ × 3²' },
      { n: 168, factors: '2 × 2 × 2 × 3 × 7', proc: '168 ÷ 2 = 84，84 ÷ 2 = 42，42 ÷ 2 = 21，21 ÷ 3 = 7（質數），所以 168 = 2³ × 3 × 7' },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      questions.push(`將 $${c.n}$ 分解成質因數的乘積。`);
      summaryAnswers.push(c.factors);
      answers.push(formatPracticeShortAnswer(c.factors, c.proc));
    }
    return { questions, summaryAnswers, answers };
  }

  // ─── e5-1-2 新增 generators 結束 ─────────────────────────────────────────

  function e513Answer(shortAnswer, process) {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function e513FormatList(values) {
    return values.map((value) => String(value)).join('、');
  }

  function e513ListMultiplesInRange(base, start, end) {
    const first = Math.ceil(start / base) * base;
    const values = [];
    for (let value = first; value <= end; value += base) values.push(value);
    return values;
  }

  function buildE513MultipleSequenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [4, 6, 7, 8, 9, 12, 13, 14, 15, 18, 20, 25];
    for (let i = 0; i < count; i += 1) {
      const base = bank[i % bank.length];
      const amount = i % 2 === 0 ? 4 : 5;
      const multiples = Array.from({ length: amount }, (_, index) => base * (index + 1));
      const answerText = e513FormatList(multiples);
      if (i % 3 === 0) {
        questions.push(`從 1 倍開始，依序寫出 ${amount} 個 ${base} 的倍數。`);
      } else if (i % 3 === 1) {
        questions.push(`寫出 ${base} 的前 ${amount} 個倍數。`);
      } else {
        questions.push(`依序寫出 ${base} 乘以 1、2、3、${amount} 的結果。`);
      }
      summaryAnswers.push(answerText);
      answers.push(
        e513Answer(
          answerText,
          `${base} 的倍數就是 ${base} 乘以整數的結果，所以前 ${amount} 個倍數依序是 ${answerText}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE513MultipleRuleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const pools = {
      2: [18, 24, 35, 46, 57, 60, 72, 83, 94, 105, 126, 148],
      5: [15, 24, 35, 48, 50, 67, 70, 85, 96, 105, 130, 141],
      10: [20, 31, 40, 52, 60, 73, 80, 94, 100, 115, 120, 132],
    };
    for (let i = 0; i < count; i += 1) {
      const target = [2, 5, 10][i % 3];
      if (i % 2 === 0) {
        const options = shuffle([...pools[target]]).slice(0, 6);
        const winners = options.filter((value) => value % target === 0).sort((a, b) => a - b);
        const answerText = e513FormatList(winners);
        questions.push(`下面哪些數是 ${target} 的倍數？（選項：${e513FormatList(options)}）`);
        summaryAnswers.push(answerText);
        answers.push(e513Answer(answerText, `判斷 ${target} 的倍數可看個位數。符合規律的有 ${answerText}。`));
      } else {
        const prefix = randInt(12, 98);
        const digitBank = target === 2 ? [0, 2, 4, 6, 8] : target === 5 ? [0, 5] : [0];
        const winner = pickFromList(digitBank);
        const value = `${prefix}${winner}`;
        questions.push(`${value} 是 ${target} 的倍數，□ 裡可以填入哪些數字？`);
        const answerText = digitBank.join('、');
        summaryAnswers.push(answerText);
        answers.push(
          e513Answer(
            answerText,
            `${target} 的倍數只要看個位數。${target} 的倍數個位數可以是 ${answerText}，所以符合條件。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE513RangeMultipleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [6, 30, 80],
      [7, 40, 90],
      [8, 20, 100],
      [9, 50, 120],
      [12, 60, 150],
      [15, 100, 180],
    ];
    for (let i = 0; i < count; i += 1) {
      const [base, start, end] = bank[i % bank.length];
      if (i % 2 === 0) {
        const values = e513ListMultiplesInRange(base, start, end);
        const answerText = e513FormatList(values);
        questions.push(`在 ${start}～${end} 之間，${base} 的倍數有哪些？`);
        summaryAnswers.push(answerText);
        answers.push(
          e513Answer(
            answerText,
            `先找不小於 ${start} 的第一個 ${base} 的倍數，再每次加 ${base}。所以答案是 ${answerText}。`
          )
        );
      } else {
        const limit = end - randInt(0, Math.min(12, end - start));
        const largest = Math.floor(limit / base) * base;
        questions.push(`${limit} 以內，最大的 ${base} 的倍數是多少？`);
        summaryAnswers.push(`${largest}`);
        answers.push(
          e513Answer(
            `${largest}`,
            `不超過 ${limit} 的最大 ${base} 的倍數，就是 ${Math.floor(limit / base)} × ${base} = ${largest}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE513CommonMultipleListSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [12, 15],
      [14, 21],
      [8, 20],
      [6, 9],
      [18, 27],
      [10, 12],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = bank[i % bank.length];
      const common = lcm(a, b);
      const values = [common, common * 2, common * 3];
      const answerText = `${e513FormatList(values)}；最小公倍數是 ${common}`;
      questions.push(`找出 ${a} 和 ${b} 的 3 個公倍數，並寫出最小公倍數。`);
      summaryAnswers.push(answerText);
      answers.push(
        e513Answer(
          answerText,
          `${a} 和 ${b} 的公倍數都是最小公倍數 ${common} 的倍數，所以前 3 個正公倍數是 ${e513FormatList(values)}，其中最小公倍數是 ${common}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE513LcmDirectSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [14, 8],
      [16, 24],
      [18, 30],
      [12, 16],
      [21, 28],
      [24, 36],
      [15, 20],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = bank[i % bank.length];
      const common = lcm(a, b);
      questions.push(`找出 ${a} 和 ${b} 的最小公倍數。`);
      summaryAnswers.push(`${common}`);
      answers.push(
        e513Answer(`${common}`, `同時是 ${a} 和 ${b} 的倍數中最小的正整數是 ${common}，所以最小公倍數是 ${common}。`)
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE513GroupMinTotalSet(count) {
    window.__e513LastSource = 'e5-bundle';
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      ['幼兒園學員每 6 人一組或每 8 人一組都能剛好分完，最少有幾人？', 6, 8, '人'],
      ['一袋糖果每 15 顆裝一包或每 18 顆裝一包都能裝完，這袋糖果最少有幾顆？', 15, 18, '顆'],
      ['軟糖每 8 顆裝一包或每 12 顆裝一包都能裝完，軟糖最少有幾顆？', 8, 12, '顆'],
      ['番茄每 4 個一堆或每 10 個一堆都能剛好分完，這籃番茄最少有幾個？', 4, 10, '個'],
      ['鉛筆平均分給 14 人或 20 人都能剛好分完，這箱鉛筆最少有幾枝？', 14, 20, '枝'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [questionText, a, b, unit] = bank[i % bank.length];
      const common = lcm(a, b);
      questions.push(`${questionText}`);
      summaryAnswers.push(`${common}${unit}`);
      answers.push(
        e513Answer(
          `${common}${unit}`,
          `要同時能用 ${a} 和 ${b} 分完，總數要是 ${a} 和 ${b} 的公倍數；題目問最少，所以找最小公倍數 ${common}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE513RectangleSquareMinSideSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      ['用長 8 公分、寬 6 公分的長方形紙卡拼成一個正方形，邊長最短是幾公分？', 8, 6, '公分'],
      ['用長 12 公分、寬 8 公分的長方形紙板拼成一個正方形，邊長最短是幾公分？', 12, 8, '公分'],
      ['用長 10 公分、寬 8 公分的木板拼成一個大正方形，拼成的正方形邊長最短是幾公分？', 10, 8, '公分'],
      ['用長 20 公分、寬 15 公分的花磚拼成一個正方形牆面，正方形邊長最小是幾公分？', 20, 15, '公分'],
      ['用長 5 公分、寬 4 公分的紙卡拼出一個最小的正方形，邊長是幾公分？', 5, 4, '公分'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [questionText, length, width, unit] = bank[i % bank.length];
      const side = lcm(length, width);
      questions.push(questionText);
      summaryAnswers.push(`${side}${unit}`);
      answers.push(
        e513Answer(
          `${side}${unit}`,
          `正方形邊長要同時是 ${length} 和 ${width} 的倍數，且要求最短，所以找最小公倍數 ${side}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE513PeriodSyncSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      ['芒果甜點每 8 天供應一次，抹茶甜點每 6 天供應一次，今天兩種都有，最少再等幾天會同時供應？', 8, 6, '天'],
      ['三姊弟分別每 3 天、5 天、7 天回家一次，他們最少幾天後會同時回家？', 3, 5, 7, '天'],
      ['三個女兒分別每 5 天、4 天、3 天回家一次，她們要多少天才可以同時回家？', 5, 4, 3, '天'],
      ['爸爸每 4 天運動一次，媽媽每 6 天運動一次，今天兩人都運動，下次同時運動是幾天後？', 4, 6, '天'],
    ];
    for (let i = 0; i < count; i += 1) {
      const item = bank[i % bank.length];
      if (item.length === 4) {
        const [questionText, a, b, unit] = item;
        const common = lcm(a, b);
        questions.push(questionText);
        summaryAnswers.push(`${common}${unit}`);
        answers.push(
          e513Answer(
            `${common}${unit}`,
            `再次同時發生的時間是週期 ${a} 和 ${b} 的最小公倍數，所以答案是 ${common}${unit}。`
          )
        );
      } else {
        const [questionText, a, b, c, unit] = item;
        const common = lcm(lcm(a, b), c);
        questions.push(questionText);
        summaryAnswers.push(`${common}${unit}`);
        answers.push(
          e513Answer(
            `${common}${unit}`,
            `三個週期要同時重疊，找 ${a}、${b}、${c} 的最小公倍數，可得 ${common}${unit}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE513RangeCommonMultipleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [6, 8, 50, 90, '參加人數'],
      [6, 8, 1, 50, '參加學員數量'],
      [8, 10, 75, 95, '水果總數'],
      [7, 11, 1, 99, '影印紙張數'],
      [6, 9, 20, 60, '彈珠總數'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b, start, end, label] = bank[i % bank.length];
      const values = e513ListMultiplesInRange(lcm(a, b), start, end);
      const answerText = e513FormatList(values);
      questions.push(`${label}在 ${start}～${end} 之間，每 ${a} 個一組或每 ${b} 個一組都能剛好分完，可能有多少？`);
      summaryAnswers.push(answerText);
      answers.push(
        e513Answer(
          answerText,
          `要同時被 ${a} 和 ${b} 整除，所以要找它們的公倍數。最小公倍數是 ${lcm(a, b)}，在範圍內符合的有 ${answerText}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE513EqualSpendingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      ['老師買原子筆和便利貼花的錢一樣多，原子筆 30 元，便利貼 12 元，最少分別花了多少元？', 30, 12, '元'],
      [
        '買 35 元牛奶或 40 元果汁，各買若干杯後花的錢一樣多且不超過 300 元，買一種飲料的錢可能是多少？',
        35,
        40,
        '元',
        300,
      ],
      ['檸檬派 25 元，草莓派 40 元，各買了一些且花費相同，買檸檬派至少花了多少元？', 25, 40, '元'],
      ['全部買 12 元藍筆或全部買 15 元螢光筆都剛好花完錢，最少有幾元？', 12, 15, '元'],
      ['A 巧克力 6 元，B 巧克力 9 元，各買若干個且總額相同，花的錢最少是幾元？', 6, 9, '元'],
    ];
    for (let i = 0; i < count; i += 1) {
      const item = bank[i % bank.length];
      const [questionText, a, b, unit, limit] = item;
      const common = lcm(a, b);
      let answerText = `${common}${unit}`;
      let process = `兩種花費要一樣，就是找 ${a} 和 ${b} 的公倍數；題目問最少，所以找最小公倍數 ${common}。`;
      if (typeof limit === 'number') {
        const values = e513ListMultiplesInRange(common, common, limit);
        answerText = e513FormatList(values);
        process = `相同花費必須是 ${a} 和 ${b} 的公倍數。最小公倍數是 ${common}，在不超過 ${limit} 元的條件下，可能的共同金額有 ${answerText}。`;
      }
      questions.push(questionText);
      summaryAnswers.push(answerText);
      answers.push(e513Answer(answerText, process));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE513MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = banks[i % banks.length](1);
      questions.push(built.questions[0]);
      summaryAnswers.push(built.summaryAnswers[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE513MultipleThreeSet(count) {
    return buildE513MixedSet(
      [buildE513MultipleSequenceSet, buildE513MultipleRuleSet, buildE513RangeMultipleSet],
      count
    );
  }

  function buildE513LcmTwoSet(count) {
    return buildE513MixedSet([buildE513CommonMultipleListSet, buildE513LcmDirectSet], count);
  }

  function buildE513ApplicationThreeSet(count) {
    return buildE513MixedSet(
      [buildE513GroupMinTotalSet, buildE513RectangleSquareMinSideSet, buildE513PeriodSyncSet],
      count
    );
  }

  function buildE513RangeSpendingTwoSet(count) {
    return buildE513MixedSet([buildE513RangeCommonMultipleSet, buildE513EqualSpendingSet], count);
  }

  function e514Answer(shortAnswer, process) {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function e514Frac(frac, mixed = false) {
    return `$${fractionToLatex(makeFraction(frac.num, frac.den), mixed)}$`;
  }

  function e514FormatFractionList(items, mixed = false) {
    return items.map((item) => e514Frac(item, mixed)).join('、');
  }

  function e514PickBaseFraction() {
    const den = pickFromList([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
    const num = randInt(1, den - 1);
    return makeFraction(num, den);
  }

  function e514MakeScaledFraction(frac, scale) {
    return { num: frac.num * scale, den: frac.den * scale };
  }

  function buildE514ExpandEquivalentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = e514PickBaseFraction();
      const scale = randInt(2, 9);
      const scaled = e514MakeScaledFraction(base, scale);
      if (i % 3 === 0) {
        questions.push(`${e514Frac(base)} = $\\frac{\\Box}{${scaled.den}}$，空格應填多少？`);
        summaryAnswers.push(`${scaled.num}`);
        answers.push(
          e514Answer(
            `${scaled.num}`,
            `擴分就是分子、分母同乘同一個整數。因為 ${base.den} × ${scale} = ${scaled.den}，所以分子也要乘 ${scale}，得到 ${base.num} × ${scale} = ${scaled.num}。`
          )
        );
      } else if (i % 3 === 1) {
        const targetDen = pickFromList([24, 30, 36, 40, 48]);
        const denBank = [2, 3, 4, 5, 6, 8, 10, 12].filter((value) => targetDen % value === 0);
        const chosen = shuffle(denBank)
          .slice(0, 3)
          .sort((a, b) => a - b);
        const fracs = chosen.map((den) => makeFraction(randInt(1, den - 1), den));
        const expanded = fracs.map((frac) => makeFraction(frac.num * (targetDen / frac.den), targetDen));
        const answerText = e514FormatFractionList(expanded);
        questions.push(`把 ${e514FormatFractionList(fracs)} 擴成分母都是 ${targetDen} 的分數。`);
        summaryAnswers.push(answerText);
        answers.push(
          e514Answer(
            answerText,
            `要擴成分母 ${targetDen}，每個分數都要看分母乘幾會變成 ${targetDen}，再讓分子乘同樣的倍數，所以可得 ${answerText}。`
          )
        );
      } else {
        const limit = pickFromList([40, 50, 60, 72, 90, 100]);
        const possible = [];
        for (let k = 2; k * base.den < limit; k += 1) {
          possible.push(makeFraction(base.num * k, base.den * k));
        }
        const answerText = e514FormatFractionList(possible);
        questions.push(`用擴分找出 ${e514Frac(base)} 的等值分數中，分母小於 ${limit} 的有哪些？`);
        summaryAnswers.push(answerText);
        answers.push(
          e514Answer(
            answerText,
            `等值分數可由 ${e514Frac(base)} 的分子、分母同乘 2、3、4……得到。分母要小於 ${limit}，所以符合的有 ${answerText}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE514ReduceEquivalentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [14, 35, 7],
      [18, 24, 6],
      [21, 42, 3],
      [27, 60, 3],
      [33, 55, 11],
      [40, 56, 8],
      [45, 75, 15],
    ];
    for (let i = 0; i < count; i += 1) {
      const [n, d, g] = bank[i % bank.length];
      const reduced = makeFraction(n, d);
      if (i % 3 === 0) {
        questions.push(
          `${e514Frac({ num: n, den: d })} = $\\frac{${n}÷${g}}{${d}÷${g}}$ = $\\frac{\\Box}{${reduced.den}}$，空格應填多少？`
        );
        summaryAnswers.push(`${reduced.num}`);
        answers.push(
          e514Answer(
            `${reduced.num}`,
            `約分就是分子、分母同除以公因數 ${g}。所以 ${n} ÷ ${g} = ${reduced.num}，${d} ÷ ${g} = ${reduced.den}。`
          )
        );
      } else if (i % 3 === 1) {
        questions.push(`${e514Frac({ num: n, den: d })} = $\\frac{${reduced.num}}{\\Box}$，空格應填多少？`);
        summaryAnswers.push(`${reduced.den}`);
        answers.push(
          e514Answer(
            `${reduced.den}`,
            `把 ${e514Frac({ num: n, den: d })} 的分子、分母同除以最大公因數 ${gcdInt(n, d)}，可得最簡分數 ${e514Frac(reduced)}，所以空格是 ${reduced.den}。`
          )
        );
      } else {
        questions.push(`把 ${e514Frac({ num: n, den: d })} 約分成最簡分數。`);
        summaryAnswers.push(e514Frac(reduced));
        answers.push(
          e514Answer(
            e514Frac(reduced),
            `${n} 和 ${d} 的最大公因數是 ${gcdInt(n, d)}，所以同除以 ${gcdInt(n, d)}，得到最簡分數 ${e514Frac(reduced)}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE514DivisionFractionConvertSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const wordBank = [
      ['把 24 公尺長的緞帶平均剪成 5 段，每段長幾公尺？', 24, 5, '公尺'],
      ['15 人平分 7 個披薩，全部分完，每人可以分到幾個披薩？', 7, 15, '個披薩'],
      ['把 11 公升的果菜汁裝入容量 3 公升的塑膠桶中，全部裝完，可以裝成幾桶？', 11, 3, '桶'],
    ];
    for (let i = 0; i < count; i += 1) {
      if (i % 3 === 0) {
        const a = pickFromList([5, 7, 8, 9, 11, 13, 15, 17]);
        const b = pickFromList([2, 3, 4, 5, 6, 7, 8, 9]);
        const frac = makeFraction(a, b);
        questions.push(`${a} ÷ ${b} = （　）`);
        summaryAnswers.push(e514Frac(frac, true));
        answers.push(
          e514Answer(
            e514Frac(frac, true),
            `整數相除可以記成分數，${a} ÷ ${b} = ${e514Frac({ num: a, den: b }, true)}。`
          )
        );
      } else if (i % 3 === 1) {
        const a = pickFromList([22, 25, 28, 31, 37, 43]);
        const b = pickFromList([4, 5, 6, 7, 8, 9, 11]);
        const frac = makeFraction(a, b);
        questions.push(`${a} ÷ ${b} = （　）（用帶分數或假分數表示）`);
        summaryAnswers.push(`${e514Frac(frac, true)} 或 ${e514Frac(frac)}`);
        answers.push(
          e514Answer(
            `${e514Frac(frac, true)} 或 ${e514Frac(frac)}`,
            `除法記作分數是 ${e514Frac(frac)}，如果改寫成帶分數，就是 ${e514Frac(frac, true)}。`
          )
        );
      } else {
        const [questionText, n, d, unit] = wordBank[Math.floor(i / 3) % wordBank.length];
        const frac = makeFraction(n, d);
        questions.push(questionText);
        summaryAnswers.push(`${e514Frac(frac, true)}${unit}`);
        answers.push(
          e514Answer(
            `${e514Frac(frac, true)}${unit}`,
            `依題意是 ${n} ÷ ${d}，所以可記成分數 ${e514Frac(frac)}，也就是 ${e514Frac(frac, true)}${unit}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE514EquivalentChainSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [2, 5, [2, 4, 7]],
      [3, 8, [3, 5, 6]],
      [4, 9, [2, 5, 8]],
      [5, 12, [2, 3, 7]],
      [7, 10, [2, 4, 6]],
    ];
    for (let i = 0; i < count; i += 1) {
      const [n, d, scales] = bank[i % bank.length];
      const a = e514MakeScaledFraction({ num: n, den: d }, scales[0]);
      const b = e514MakeScaledFraction({ num: n, den: d }, scales[1]);
      const c = e514MakeScaledFraction({ num: n, den: d }, scales[2]);
      questions.push(
        `連等式填空：$\\frac{${a.num}}{${a.den}}=\\frac{\\Box}{${d}}=\\frac{${b.num}}{\\Box}=\\frac{\\Box}{${c.den}}$。`
      );
      summaryAnswers.push(`${n}、${b.den}、${c.num}`);
      answers.push(
        e514Answer(
          `${n}、${b.den}、${c.num}`,
          `這三個分數都是同一個等值分數。還原後的基本分數是 ${e514Frac({ num: n, den: d })}，所以三個空格依序是 ${n}、${b.den}、${c.num}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE514IrreducibleJudgeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const reducible = [
      makeFraction(6, 8),
      makeFraction(9, 12),
      makeFraction(14, 21),
      makeFraction(18, 24),
      makeFraction(20, 35),
    ].map((frac) => ({ ...frac, reducible: true }));
    const irreducible = [
      makeFraction(3, 4),
      makeFraction(8, 27),
      makeFraction(13, 91),
      makeFraction(5, 12),
      makeFraction(7, 15),
    ].map((frac) => ({ ...frac, reducible: false }));
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const options = shuffle([...shuffle(irreducible).slice(0, 3), ...shuffle(reducible).slice(0, 2)]);
        const winners = options.filter((item) => gcdInt(item.num, item.den) === 1).map((item) => e514Frac(item));
        const answerText = winners.join('、');
        questions.push(`下面哪些分數已經不能再約分？把它們圈出來：${options.map((item) => e514Frac(item)).join('、')}`);
        summaryAnswers.push(answerText);
        answers.push(
          e514Answer(answerText, `最簡分數代表分子、分母的最大公因數是 1。逐一檢查後，不能再約分的是 ${answerText}。`)
        );
      } else {
        const winner = pickFromList(irreducible);
        const options = shuffle([winner, ...shuffle(reducible).slice(0, 3)]);
        const answerText = e514Frac(winner);
        questions.push(`下列分數中，哪一個是最簡分數？（選項：${options.map((item) => e514Frac(item)).join('、')}）`);
        summaryAnswers.push(answerText);
        answers.push(
          e514Answer(
            answerText,
            `只要分子、分母還有大於 1 的公因數，就還能約分。選項中只有 ${answerText} 的分子、分母互質，所以它是最簡分數。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE514ConditionFillSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 3 === 0) {
        const target = e514PickBaseFraction();
        const left = makeFraction(Math.max(1, target.num - 1), target.den);
        const right = makeFraction(Math.min(target.den - 1, target.num + 2), target.den);
        const otherA = makeFraction(target.num + 1, target.den + 1);
        const otherB = makeFraction(target.num + 2, target.den + 1);
        questions.push(
          `${e514Frac(target)} 是在 ${e514Frac(left)} 和 ${e514Frac(right)} 之間，還是在 ${e514Frac(otherA)} 和 ${e514Frac(otherB)} 之間？`
        );
        summaryAnswers.push(`${e514Frac(left)} 和 ${e514Frac(right)} 之間`);
        answers.push(
          e514Answer(
            `${e514Frac(left)} 和 ${e514Frac(right)} 之間`,
            `因為 ${e514Frac(left)} < ${e514Frac(target)} < ${e514Frac(right)}，所以 ${e514Frac(target)} 落在前一組區間。`
          )
        );
      } else if (i % 3 === 1) {
        const den = pickFromList([3, 4, 5, 6, 7, 8]);
        const num = randInt(1, den - 1);
        const right = e514PickBaseFraction();
        const winners = [];
        for (let digit = 1; digit <= 9; digit += 1) {
          if (num / digit > right.num / right.den) winners.push(digit);
        }
        const answerText = winners.join('、');
        questions.push(
          `在 $\\frac{${num}}{\\Box}$ 的分母填入 1～9 的哪幾個數字，會使 $\\frac{${num}}{\\Box}>${fractionToLatex(right)}$？`
        );
        summaryAnswers.push(answerText);
        answers.push(
          e514Answer(
            answerText,
            `把 $\\frac{${num}}{\\Box}$ 的分母依序代入 1～9，再和 ${e514Frac(right)} 比較大小，可知符合的是 ${answerText}。`
          )
        );
      } else {
        const base = makeFraction(pickFromList([1, 2, 3, 4, 5]), pickFromList([6, 7, 8, 9, 10, 12]));
        const addNum = base.num * randInt(2, 4);
        const newScale = (base.num + addNum) / base.num;
        const newDen = base.den * newScale;
        const deltaDen = newDen - base.den;
        questions.push(`若 ${e514Frac(base)} 的分子加上 ${addNum} 後，分母應加上多少，其值才會和原本分數相等？`);
        summaryAnswers.push(`${deltaDen}`);
        answers.push(
          e514Answer(
            `${deltaDen}`,
            `要保持分數值不變，就是做擴分。分子從 ${base.num} 變成 ${base.num + addNum}，代表乘了 ${newScale}，所以分母也要乘 ${newScale}，變成 ${newDen}，因此分母應加上 ${deltaDen}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE514CommonDenominatorCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const pairBank = [
      [makeFraction(2, 3), makeFraction(1, 2)],
      [makeFraction(5, 14), makeFraction(8, 21)],
      [makeFraction(11, 13), makeFraction(20, 8)],
      [makeMixedFraction(2, 13, 14), makeMixedFraction(2, 16, 21)],
      [makeFraction(7, 9), makeFraction(5, 6)],
    ];
    for (let i = 0; i < count; i += 1) {
      const [left, right] = pairBank[i % pairBank.length];
      const sign =
        left.num / left.den > right.num / right.den ? '>' : left.num / left.den < right.num / right.den ? '<' : '=';
      const common = lcm(left.den, right.den);
      const leftNum = left.num * (common / left.den);
      const rightNum = right.num * (common / right.den);
      questions.push(`比較 ${e514Frac(left, true)} 和 ${e514Frac(right, true)} 的大小。`);
      summaryAnswers.push(sign);
      answers.push(
        e514Answer(
          sign,
          `通分成分母 ${common} 後，分別是 $\\frac{${leftNum}}{${common}}$ 和 $\\frac{${rightNum}}{${common}}$。因為 ${leftNum}${sign}${rightNum}，所以 ${e514Frac(left, true)} ${sign} ${e514Frac(right, true)}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE514PropertyCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 3 === 0) {
        const num = pickFromList([1, 2, 3, 5, 7]);
        const denA = randInt(num + 2, num + 12);
        const denB = denA + randInt(1, 6);
        questions.push(`比較 ${e514Frac({ num, den: denA })} 和 ${e514Frac({ num, den: denB })} 的大小（不用通分）。`);
        summaryAnswers.push('>');
        answers.push(
          e514Answer(
            '>',
            `分子相同時，分母越大，分數越小。因為 ${denA} < ${denB}，所以 ${e514Frac({ num, den: denA })} > ${e514Frac({ num, den: denB })}。`
          )
        );
      } else if (i % 3 === 1) {
        const den = pickFromList([8, 10, 12, 15, 20, 24]);
        const a = randInt(1, den - 1);
        let b = randInt(1, den - 1);
        while (b === a) b = randInt(1, den - 1);
        const sign = a > b ? '>' : '<';
        questions.push(`比較 ${e514Frac({ num: a, den })} 和 ${e514Frac({ num: b, den })} 的大小（不用通分）。`);
        summaryAnswers.push(sign);
        answers.push(
          e514Answer(
            sign,
            `分母相同時，分子越大，分數越大。因為 ${a}${sign}${b}，所以 ${e514Frac({ num: a, den })} ${sign} ${e514Frac({ num: b, den })}。`
          )
        );
      } else {
        const leftDen = randInt(10, 18);
        const rightDen = randInt(6, 12);
        const left = makeFraction(randInt(Math.max(1, leftDen - 4), leftDen - 1), leftDen);
        let right = makeFraction(randInt(Math.max(1, rightDen - 4), rightDen - 1), rightDen);
        while (left.num * right.den === right.num * left.den) {
          right = makeFraction(randInt(Math.max(1, rightDen - 4), rightDen - 1), rightDen);
        }
        const leftGap = 1 - left.num / left.den;
        const rightGap = 1 - right.num / right.den;
        const sign = leftGap < rightGap ? '>' : '<';
        questions.push(`比較 ${e514Frac(left)} 和 ${e514Frac(right)} 的大小（觀察哪一個分數與 1 的距離比較近）。`);
        summaryAnswers.push(sign);
        answers.push(
          e514Answer(
            sign,
            `越接近 1 的分數越大。${e514Frac(left)} 與 1 的差是 ${e514Frac(makeFraction(left.den - left.num, left.den))}，${e514Frac(right)} 與 1 的差是 ${e514Frac(makeFraction(right.den - right.num, right.den))}，因此 ${e514Frac(left)} ${sign} ${e514Frac(right)}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE514UnlikeDenominatorAddSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [makeFraction(2, 3), makeFraction(5, 7)],
      [makeFraction(4, 12), makeFraction(16, 15)],
      [makeFraction(9, 14), makeFraction(6, 21)],
      [makeMixedFraction(1, 2, 9), makeFraction(13, 6)],
      [makeMixedFraction(1, 3, 10), makeMixedFraction(1, 6, 16)],
    ];
    for (let i = 0; i < count; i += 1) {
      const [left, right] = bank[i % bank.length];
      const result = addFraction(left, right);
      const common = lcm(left.den, right.den);
      const leftNum = left.num * (common / left.den);
      const rightNum = right.num * (common / right.den);
      questions.push(`計算：${e514Frac(left, true)} + ${e514Frac(right, true)} = （　）`);
      summaryAnswers.push(e514Frac(result, true));
      answers.push(
        e514Answer(
          e514Frac(result, true),
          `先通分成分母 ${common}：${e514Frac(left, true)} = $\\frac{${leftNum}}{${common}}$，${e514Frac(right, true)} = $\\frac{${rightNum}}{${common}}$。相加後得 $\\frac{${leftNum + rightNum}}{${common}}=${fractionToLatex(result, true)}$。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE514UnlikeDenominatorSubSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [makeFraction(5, 6), makeFraction(10, 15)],
      [makeFraction(21, 20), makeFraction(15, 25)],
      [makeMixedFraction(6, 1, 2), makeFraction(28, 5)],
      [makeMixedFraction(7, 3, 8), makeMixedFraction(4, 9, 10)],
      [makeMixedFraction(5, 1, 4), makeMixedFraction(3, 7, 10)],
    ];
    for (let i = 0; i < count; i += 1) {
      const [left, right] = bank[i % bank.length];
      const result = subFraction(left, right);
      const common = lcm(left.den, right.den);
      const leftNum = left.num * (common / left.den);
      const rightNum = right.num * (common / right.den);
      questions.push(`計算：${e514Frac(left, true)} - ${e514Frac(right, true)} = （　）`);
      summaryAnswers.push(e514Frac(result, true));
      answers.push(
        e514Answer(
          e514Frac(result, true),
          `先通分成分母 ${common}：${e514Frac(left, true)} = $\\frac{${leftNum}}{${common}}$，${e514Frac(right, true)} = $\\frac{${rightNum}}{${common}}$。相減後得 $\\frac{${leftNum - rightNum}}{${common}}=${fractionToLatex(result, true)}$。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE514MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = banks[i % banks.length](1);
      questions.push(built.questions[0]);
      summaryAnswers.push(built.summaryAnswers[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE514EquivalentFourSet(count) {
    return buildE514MixedSet(
      [
        buildE514ExpandEquivalentSet,
        buildE514ReduceEquivalentSet,
        buildE514DivisionFractionConvertSet,
        buildE514EquivalentChainSet,
      ],
      count
    );
  }

  function buildE514JudgeTwoSet(count) {
    return buildE514MixedSet([buildE514IrreducibleJudgeSet, buildE514ConditionFillSet], count);
  }

  function buildE514CompareTwoSet(count) {
    return buildE514MixedSet([buildE514CommonDenominatorCompareSet, buildE514PropertyCompareSet], count);
  }

  function buildE514CalcTwoSet(count) {
    return buildE514MixedSet([buildE514UnlikeDenominatorAddSet, buildE514UnlikeDenominatorSubSet], count);
  }

  // ─── e5-1-4 新增 generators ───────────────────────────────────────────────

  // 三個分數通分並比較大小
  function buildE514CommonDenom3Set(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { fracs: [{n:1,d:4},{n:2,d:7},{n:3,d:14}], lcd:28, order:'1/4 < 2/7 < 3/14' },
      { fracs: [{n:1,d:3},{n:1,d:5},{n:1,d:15}], lcd:15, order:'1/15 < 1/5 < 1/3' },
      { fracs: [{n:3,d:8},{n:5,d:12},{n:7,d:24}], lcd:24, order:'3/8 < 5/12 < 7/24' },
      { fracs: [{n:2,d:7},{n:3,d:14},{n:5,d:21}], lcd:42, order:'5/21 < 2/7 < 3/14' },
      { fracs: [{n:1,d:2},{n:1,d:3},{n:1,d:6}], lcd:6, order:'1/6 < 1/3 < 1/2' },
      { fracs: [{n:1,d:4},{n:2,d:5},{n:3,d:8}], lcd:40, order:'1/4 < 3/8 < 2/5' },
      { fracs: [{n:3,d:4},{n:1,d:3},{n:5,d:6}], lcd:12, order:'1/3 < 3/4 < 5/6' },
      { fracs: [{n:7,d:12},{n:5,d:8},{n:2,d:3}], lcd:24, order:'7/12 < 2/3 < 5/8' },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      const fracStrs = c.fracs.map(f => `$\\frac{${f.n}}{${f.d}}$`).join('、');
      // 轉換後排序
      const converted = c.fracs.map(f => ({ orig: `${f.n}/${f.d}`, val: f.n/f.d, newN: f.n*(c.lcd/f.d) }));
      converted.sort((a,b) => a.val - b.val);
      const sortedStr = converted.map(f => `$\\frac{${f.orig.split('/')[0]}}{${f.orig.split('/')[1]}}$`).join(' < ');
      questions.push(`將 ${fracStrs} 通分（公分母：${c.lcd}），再從小到大排列。`);
      summaryAnswers.push(c.order);
      answers.push(e514Answer(c.order,
        `公分母是 ${c.lcd}，通分後各分子為 ${converted.map(f=>f.newN).join('、')}，由小到大：${sortedStr}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  // 三項分數混合加減法
  function buildE514MixedCalc3Set(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { expr: '\\frac{7}{9} - \\frac{1}{6} + \\frac{1}{3}', ans: '17/18', proc: '公分母18：14/18-3/18+6/18=17/18' },
      { expr: '\\frac{3}{8} + \\frac{1}{6} - \\frac{1}{12}', ans: '5/8', proc: '公分母24：9/24+4/24-2/24=11/24（化簡：無法化簡）', fixAns: '11/24', fixProc: '公分母24：9/24+4/24-2/24=11/24' },
      { expr: '\\frac{5}{6} - \\frac{1}{3} + \\frac{1}{9}', ans: '5/9', proc: '公分母18：15/18-6/18+2/18=11/18' },
      { expr: '\\frac{2}{5} + \\frac{3}{10} + \\frac{1}{4}', ans: '19/20', proc: '公分母20：8/20+6/20+5/20=19/20' },
      { expr: '\\frac{1}{4} + \\frac{3}{10} - \\frac{1}{20}', ans: '1/2', proc: '公分母20：5/20+6/20-1/20=10/20=1/2' },
      { expr: '\\frac{3}{4} - \\frac{1}{5} + \\frac{1}{10}', ans: '13/20', proc: '公分母20：15/20-4/20+2/20=13/20' },
      { expr: '\\frac{7}{9} - \\frac{2}{3} + \\frac{1}{6}', ans: '5/18', proc: '公分母18：14/18-12/18+3/18=5/18' },
      { expr: '\\frac{2}{3} + \\frac{1}{4} - \\frac{5}{12}', ans: '1/2', proc: '公分母12：8/12+3/12-5/12=6/12=1/2' },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      const useAns = c.fixAns || c.ans;
      const useProc = c.fixProc || c.proc;
      questions.push(`計算：$${c.expr}$`);
      summaryAnswers.push(useAns);
      answers.push(e514Answer(useAns, `${useProc}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  // 多步驟分數加減應用題
  function buildE514MultiStepSubSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { ctx: '小安有 $\\frac{3}{4}$ 瓶果汁，喝了 $\\frac{1}{3}$ 瓶，又倒掉了 $\\frac{1}{9}$ 瓶', unit: '瓶', proc: '3/4-1/3-1/9=27/36-12/36-4/36=11/36', fixRem: '11/36' },
      { ctx: '媽媽做了 $\\frac{5}{6}$ 公斤的餅乾，小明吃了 $\\frac{1}{3}$ 公斤，小花吃了 $\\frac{1}{4}$ 公斤', rem: '1/4', unit: '公斤', proc: '5/6-1/3-1/4=10/12-4/12-3/12=3/12=1/4', fixRem: '1/4' },
      { ctx: '小明有 $\\frac{3}{4}$ 公斤的糖果，分給弟弟 $\\frac{1}{3}$ 公斤，再分給妹妹 $\\frac{1}{6}$ 公斤', rem: '1/4', unit: '公斤', proc: '3/4-1/3-1/6=9/12-4/12-2/12=3/12=1/4', fixRem: '1/4' },
      { ctx: '爸爸買了 $\\frac{7}{10}$ 公斤的肉，燉湯用了 $\\frac{1}{5}$ 公斤，炒菜用了 $\\frac{1}{4}$ 公斤', rem: '1/4', unit: '公斤', proc: '7/10-1/5-1/4=14/20-4/20-5/20=5/20=1/4', fixRem: '1/4' },
      { ctx: '小陳有 $\\frac{2}{3}$ 包餅乾，送給小李 $\\frac{1}{6}$ 包，自己吃掉 $\\frac{1}{4}$ 包', rem: '1/4', unit: '包', proc: '2/3-1/6-1/4=8/12-2/12-3/12=3/12=1/4', fixRem: '1/4' },
      { ctx: '一瓶果汁有 $\\frac{5}{6}$ 公升，小美喝了 $\\frac{1}{2}$ 公升，小莉喝了 $\\frac{1}{9}$ 公升', unit: '公升', proc: '5/6-1/2-1/9=15/18-9/18-2/18=4/18=2/9', fixRem: '2/9' },
      { ctx: '小強一天花了 $\\frac{1}{3}$ 的時間睡覺，$\\frac{1}{4}$ 的時間讀書', rem: '5/12', unit: '（用分率表示）', proc: '1-1/3-1/4=12/12-4/12-3/12=5/12', fixRem: '5/12' },
      { ctx: '一袋米有 $\\frac{11}{12}$ 公斤，煮飯用了 $\\frac{1}{3}$ 公斤，燉雞用了 $\\frac{1}{4}$ 公斤', rem: '1/3', unit: '公斤', proc: '11/12-1/3-1/4=11/12-4/12-3/12=4/12=1/3', fixRem: '1/3' },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      const ansStr = c.fixRem;
      questions.push(`${c.ctx}，還剩下多少${c.unit}？`);
      summaryAnswers.push(ansStr);
      answers.push(e514Answer(ansStr, `${c.fixProc || c.proc}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  // 三小類綜合
  function buildE514ThreeFracThreeSet(count) {
    return buildE514MixedSet([buildE514CommonDenom3Set, buildE514MixedCalc3Set, buildE514MultiStepSubSet], count);
  }

  // ─── e5-1-4 新增 generators 結束 ─────────────────────────────────────────

  function e515Answer(shortAnswer, process) {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function e515List(values) {
    return values.map((value) => String(value)).join('、');
  }

  function e515PolygonName(sides) {
    const names = {
      3: '三角形',
      4: '四邊形',
      5: '五邊形',
      6: '六邊形',
      7: '七邊形',
      8: '八邊形',
      9: '九邊形',
      10: '十邊形',
      11: '十一邊形',
      12: '十二邊形',
    };
    return names[sides] || `${sides}邊形`;
  }

  function e515CanFormTriangle(a, b, c) {
    const sides = [a, b, c].sort((x, y) => x - y);
    return sides[0] + sides[1] > sides[2];
  }

  function buildE515CanFormTriangleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const validBank = [
      [4, 4, 7],
      [6, 9, 10],
      [8, 9, 12],
      [12, 12, 15],
      [18, 20, 29],
    ];
    const invalidBank = [
      [4, 4, 8],
      [8, 8, 16],
      [9, 9, 18],
      [10, 12, 22],
      [7, 13, 20],
    ];
    for (let i = 0; i < count; i += 1) {
      const sides = i % 2 === 0 ? validBank[i % validBank.length] : invalidBank[i % invalidBank.length];
      const sorted = [...sides].sort((a, b) => a - b);
      const can = e515CanFormTriangle(...sides);
      questions.push(
        `下面三根線段的長度分別是 ${sides[0]} 公分、${sides[1]} 公分、${sides[2]} 公分，可以圍成三角形嗎？`
      );
      summaryAnswers.push(can ? '可以' : '不可以');
      answers.push(
        e515Answer(
          can ? '可以' : '不可以',
          `判斷時看較短兩邊和是否大於最長邊。這裡 ${sorted[0]} + ${sorted[1]} = ${sorted[0] + sorted[1]}${can ? ' > ' : ' ≤ '}${sorted[2]}，所以${can ? '可以' : '不可以'}圍成三角形。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE515ThirdSideRangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [4, 6],
      [5, 10],
      [4, 13],
      [7, 10],
      [8, 12],
      [9, 15],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = bank[i % bank.length];
      const min = Math.abs(a - b) + 1;
      const max = a + b - 1;
      if (i % 2 === 0) {
        const options = shuffle([min - 1, min, min + 1, max, max + 1]).filter(
          (value, index, array) => value > 0 && array.indexOf(value) === index
        );
        const winners = options.filter((value) => value >= min && value <= max).sort((x, y) => x - y);
        questions.push(
          `已知兩邊長分別是 ${a} 公分和 ${b} 公分，下列哪些長度可以是第三邊？（選項：${e515List(options)} 公分）`
        );
        summaryAnswers.push(`${e515List(winners)} 公分`);
        answers.push(
          e515Answer(
            `${e515List(winners)} 公分`,
            `第三邊要滿足大於兩邊差、且小於兩邊和，所以範圍是大於 ${Math.abs(a - b)} 公分且小於 ${a + b} 公分，也就是 ${min}～${max} 公分。符合的是 ${e515List(winners)} 公分。`
          )
        );
      } else {
        questions.push(`三角形兩邊長是 ${a} 公分和 ${b} 公分，第三邊可能的整數範圍是多少？`);
        summaryAnswers.push(`${min}～${max} 公分`);
        answers.push(
          e515Answer(
            `${min}～${max} 公分`,
            `第三邊必須滿足 ${Math.abs(a - b)} < 第三邊 < ${a + b}，所以整數範圍是 ${min}～${max} 公分。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE515IsoscelesThirdSideSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [6, 13],
      [4, 8],
      [9, 9],
      [12, 12],
      [9, 17],
      [10, 21],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = bank[i % bank.length];
      const possible = [];
      if (e515CanFormTriangle(a, a, b)) possible.push(a);
      if (a !== b && e515CanFormTriangle(a, b, b)) possible.push(b);
      const unique = [...new Set(possible)];
      if (i % 2 === 0) {
        const answerText = unique.length === 1 ? `${unique[0]} 公分` : `${e515List(unique)} 公分`;
        questions.push(`等腰三角形有兩邊長分別是 ${a} 公分和 ${b} 公分，第三邊長可能是多少公分？`);
        summaryAnswers.push(answerText);
        answers.push(
          e515Answer(
            answerText,
            `等腰三角形第三邊只能和其中一邊相等，所以只要檢查 ${a},${a},${b} 和 ${a},${b},${b} 能不能成三角形。符合條件的是 ${answerText}。`
          )
        );
      } else {
        const options = shuffle([Math.max(1, a - 1), a, b, b + 2]).filter(
          (value, index, array) => array.indexOf(value) === index
        );
        const winners = options.filter((value) => unique.includes(value)).sort((x, y) => x - y);
        questions.push(
          `一個等腰三角形兩邊長分別是 ${a} 公分和 ${b} 公分，哪幾個選項可能是第三邊？（選項：${e515List(options)} 公分）`
        );
        summaryAnswers.push(`${e515List(winners)} 公分`);
        answers.push(
          e515Answer(
            `${e515List(winners)} 公分`,
            `第三邊必須和其中一邊相等，再檢查三角形兩邊和大於第三邊。符合的是 ${e515List(winners)} 公分。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE515PolygonRegularBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const sideBank = [5, 6, 7, 8, 9, 10, 11, 12];
    for (let i = 0; i < count; i += 1) {
      const sides = sideBank[i % sideBank.length];
      const name = e515PolygonName(sides);
      if (i % 3 === 0) {
        questions.push(`${name}有幾個角、幾條邊和幾個頂點？`);
        summaryAnswers.push(`${sides} 個角、${sides} 條邊、${sides} 個頂點`);
        answers.push(
          e515Answer(
            `${sides} 個角、${sides} 條邊、${sides} 個頂點`,
            `${name}的角、邊、頂點數量都相同，所以都是 ${sides}。`
          )
        );
      } else if (i % 3 === 1) {
        questions.push(`一個多邊形有 ${sides} 個頂點，它是幾邊形？`);
        summaryAnswers.push(name);
        answers.push(e515Answer(name, `多邊形有幾個頂點，就有幾條邊，所以有 ${sides} 個頂點的是${name}。`));
      } else {
        const statements = shuffle([
          {
            text: `一個多邊形每條邊都一樣長，就一定是正多邊形。`,
            ok: false,
            why: `正多邊形除了每條邊都相等，還要每個角都一樣大。`,
          },
          {
            text: `正${name}的每條邊都一樣長，而且每個角都一樣大。`,
            ok: true,
            why: `正多邊形的定義就是每邊等長、每角相等。`,
          },
          {
            text: `一個四個角都是直角的長方形，就一定是正多邊形。`,
            ok: false,
            why: `長方形四個角雖然相等，但邊長不一定都相等，所以不一定是正多邊形。`,
          },
        ]);
        const statement = statements[0];
        questions.push(`判斷正誤：${statement.text}`);
        summaryAnswers.push(statement.ok ? '對' : '錯');
        answers.push(e515Answer(statement.ok ? '對' : '錯', statement.why));
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE515TriangleAngleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [40, 70],
      [25, 30],
      [76, 54],
      [75, 80],
      [37, 90],
      [52, 68],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = bank[i % bank.length];
      const third = 180 - a - b;
      if (i % 2 === 0) {
        questions.push(`三角形其中兩個角分別是 ${a}° 和 ${b}°，第三個角是幾度？`);
      } else {
        questions.push(`一個三角形的兩個角是 ${a}°、${b}°，求另一個角的度數。`);
      }
      summaryAnswers.push(`${third}°`);
      answers.push(
        e515Answer(`${third}°`, `三角形 3 個內角和是 180°，所以第三個角 = 180° - ${a}° - ${b}° = ${third}°。`)
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE515IsoscelesEquilateralAngleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 3 === 0) {
        const vertex = pickFromList([40, 50, 70, 80, 100, 110]);
        const base = (180 - vertex) / 2;
        questions.push(`一個等腰三角形的頂角是 ${vertex}°，它的底角各是多少度？`);
        summaryAnswers.push(`${base}°`);
        answers.push(
          e515Answer(
            `${base}°`,
            `等腰三角形兩個底角相等。先用 180° - ${vertex}° = ${180 - vertex}°，再平均分成兩個底角，所以每個底角是 ${base}°。`
          )
        );
      } else if (i % 3 === 1) {
        const base = pickFromList([36, 42, 47, 55, 72]);
        const vertex = 180 - 2 * base;
        questions.push(`一個等腰三角形的一個底角是 ${base}°，它的頂角是多少度？`);
        summaryAnswers.push(`${vertex}°`);
        answers.push(
          e515Answer(`${vertex}°`, `等腰三角形兩個底角一樣大，所以頂角 = 180° - 2 × ${base}° = ${vertex}°。`)
        );
      } else {
        questions.push(`正三角形的 3 條邊一樣長，它的一個角是多少度？`);
        summaryAnswers.push('60°');
        answers.push(e515Answer('60°', `正三角形 3 個角都一樣大，而內角和是 180°，所以每個角都是 180° ÷ 3 = 60°。`));
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE515QuadrilateralAngleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [75, 105, 120],
      [110, 60, 110],
      [90, 90, 43],
      [33, 64, 106],
      [52, 74, 117],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b, c] = bank[i % bank.length];
      const d = 360 - a - b - c;
      if (i % 2 === 0) {
        questions.push(`四邊形中三個角分別是 ${a}°、${b}°、${c}°，第四個角是幾度？`);
      } else {
        questions.push(`一個四邊形的三個內角是 ${a}°、${b}°、${c}°，求另一個角的度數。`);
      }
      summaryAnswers.push(`${d}°`);
      answers.push(
        e515Answer(`${d}°`, `四邊形的 4 個內角和是 360°，所以第四個角 = 360° - ${a}° - ${b}° - ${c}° = ${d}°。`)
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE515ParallelogramAngleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [58, 62, 70, 108, 130, 146];
    for (let i = 0; i < count; i += 1) {
      const angle = bank[i % bank.length];
      const adjacent = 180 - angle;
      if (i % 3 === 0) {
        questions.push(`平行四邊形 ABCD 中，已知 ∠B = ${angle}°，求 ∠C 是幾度？`);
        summaryAnswers.push(`${adjacent}°`);
        answers.push(
          e515Answer(`${adjacent}°`, `平行四邊形鄰角和是 180°，所以 ∠C = 180° - ${angle}° = ${adjacent}°。`)
        );
      } else if (i % 3 === 1) {
        questions.push(`平行四邊形 EFGH 中，已知 ∠E = ${angle}°，求 ∠G 是幾度？`);
        summaryAnswers.push(`${angle}°`);
        answers.push(e515Answer(`${angle}°`, `平行四邊形對角相等，所以 ∠G = ∠E = ${angle}°。`));
      } else {
        questions.push(`平行四邊形中有一個角是 ${angle}°，找出其他三個角的度數。`);
        summaryAnswers.push(`${adjacent}°、${angle}°、${adjacent}°`);
        answers.push(
          e515Answer(
            `${adjacent}°、${angle}°、${adjacent}°`,
            `平行四邊形對角相等、鄰角互補，所以另一個對角也是 ${angle}°，兩個鄰角都是 180° - ${angle}° = ${adjacent}°。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE515SectorFractionToAngleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      [1, 5],
      [1, 12],
      [1, 9],
      [1, 20],
      [1, 15],
      [1, 8],
      [3, 10],
    ];
    for (let i = 0; i < count; i += 1) {
      const [num, den] = bank[i % bank.length];
      const angle = (360 * num) / den;
      questions.push(`一個 $\\frac{${num}}{${den}}$ 圓的扇形，圓心角是多少度？`);
      summaryAnswers.push(`${angle}°`);
      answers.push(
        e515Answer(`${angle}°`, `圓心角 = 360° × 幾分之幾圓，所以 = 360° × $\\frac{${num}}{${den}}$ = ${angle}°。`)
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE515SectorAngleToFractionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const angles = [36, 45, 72, 80, 90, 120, 135, 150];
    for (let i = 0; i < count; i += 1) {
      const angle = angles[i % angles.length];
      const frac = reduceFraction(angle, 360);
      questions.push(`一個圓心角 ${angle}° 的扇形，是幾分之幾圓？`);
      summaryAnswers.push(`$\\frac{${frac.numerator}}{${frac.denominator}}$ 圓`);
      answers.push(
        e515Answer(
          `$\\frac{${frac.numerator}}{${frac.denominator}}$ 圓`,
          `幾分之幾圓 = 圓心角 ÷ 360°，所以 = $\\frac{${angle}}{360}$ = $\\frac{${frac.numerator}}{${frac.denominator}}$ 圓。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE515SectorComplementAngleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [72, 90, 125, 135, 290, 315];
    for (let i = 0; i < count; i += 1) {
      const given = bank[i % bank.length];
      const rest = 360 - given;
      if (i % 2 === 0) {
        questions.push(`已知圓內空白處的角度為 ${given}°，求鋪色扇形的圓心角。`);
      } else {
        questions.push(`已知一個扇形挖去 ${given}° 後，剩下部分的圓心角是多少度？`);
      }
      summaryAnswers.push(`${rest}°`);
      answers.push(e515Answer(`${rest}°`, `整個圓是 360°，剩下的扇形角度 = 360° - ${given}° = ${rest}°。`));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE515SectorMultiRegionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      { given: ['135°', '175°'], used: 135 + 175, answer: 50 },
      { given: ['90°', '160°'], used: 90 + 160, answer: 110 },
      { given: ['$\\frac14$ 圓', '$\\frac15$ 圓'], used: 90 + 72, answer: 198 },
      { given: ['半圓', '45°'], used: 180 + 45, answer: 135 },
      { given: ['$\\frac14$ 圓', '126°'], used: 90 + 126, answer: 144 },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = bank[i % bank.length];
      questions.push(`已知圓內另外兩塊區域分別是 ${item.given[0]} 和 ${item.given[1]}，求剩餘區域的圓心角。`);
      summaryAnswers.push(`${item.answer}°`);
      answers.push(
        e515Answer(
          `${item.answer}°`,
          `整個圓是 360°。先把已知區域換成角度後相加，共 ${item.used}°，所以剩餘區域 = 360° - ${item.used}° = ${item.answer}°。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE515MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = banks[i % banks.length](1);
      questions.push(built.questions[0]);
      summaryAnswers.push(built.summaryAnswers[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE515TriangleSideThreeSet(count) {
    return buildE515MixedSet(
      [buildE515CanFormTriangleSet, buildE515ThirdSideRangeSet, buildE515IsoscelesThirdSideSet],
      count
    );
  }

  function buildE515PolygonAngleFiveSet(count) {
    return buildE515MixedSet(
      [
        buildE515PolygonRegularBasicSet,
        buildE515TriangleAngleSet,
        buildE515IsoscelesEquilateralAngleSet,
        buildE515QuadrilateralAngleSet,
        buildE515ParallelogramAngleSet,
      ],
      count
    );
  }

  function buildE515SectorFourSet(count) {
    return buildE515MixedSet(
      [
        buildE515SectorFractionToAngleSet,
        buildE515SectorAngleToFractionSet,
        buildE515SectorComplementAngleSet,
        buildE515SectorMultiRegionSet,
      ],
      count
    );
  }

  function e516Answer(shortAnswer, process) {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function e516Frac(frac, mixed = false) {
    return `$${fractionToLatex(makeFraction(frac.num, frac.den), mixed)}$`;
  }

  function e516PickDenominatorPair() {
    return pickFromList([
      [2, 3],
      [3, 4],
      [3, 5],
      [4, 5],
      [4, 7],
      [5, 6],
      [5, 8],
      [6, 7],
      [7, 9],
      [8, 9],
    ]);
  }

  // ─── e5-1-5 新增面積 generators ──────────────────────────────────────────

  // 平行四邊形面積 = 底 × 高
  function buildE515ParallelogramAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { base: 14, height: 7,  unit: '公分', ctx: '一個平行四邊形的底是 $14$ 公分，高是 $7$ 公分' },
      { base: 12, height: 8,  unit: '公分', ctx: '平行四邊形的底長 $12$ 公分，高 $8$ 公分' },
      { base: 16, height: 8,  unit: '公分', ctx: '一塊平行四邊形土地，底是 $16$ 公分，高是 $8$ 公分' },
      { base: 20, height: 12, unit: '公分', ctx: '平行四邊形底 $20$ 公分，高 $12$ 公分' },
      { base: 15, height: 9,  unit: '公尺', ctx: '一塊平行四邊形土地，底是 $15$ 公尺，高是 $9$ 公尺' },
      { base: 24, height: 5,  unit: '公分', ctx: '平行四邊形底 $24$ 公分，高 $5$ 公分' },
      { base: 18, height: 6,  unit: '公分', ctx: '一個平行四邊形，底 $18$ 公分，高 $6$ 公分' },
      { base: 30, height: 9,  unit: '公分', ctx: '平行四邊形底 $30$ 公分，高 $9$ 公分' },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      const area = c.base * c.height;
      const q = `${c.ctx}，請問這個平行四邊形的面積是多少平方${c.unit}？`;
      const ans = `${area} 平方${c.unit}`;
      questions.push(q);
      summaryAnswers.push(ans);
      answers.push(formatPracticeShortAnswer(ans,
        `平行四邊形面積 = 底 × 高 = ${c.base} × ${c.height} = ${area} 平方${c.unit}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  // 梯形面積 = (上底 + 下底) × 高 ÷ 2
  function buildE515TrapezoidAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { top: 8,  bot: 12, h: 7,  unit: '公分', ctx: '一個梯形，上底 $8$ 公分，下底 $12$ 公分，高 $7$ 公分' },
      { top: 5,  bot: 11, h: 4,  unit: '公分', ctx: '梯形上底 $5$ 公分，下底 $11$ 公分，高 $4$ 公分' },
      { top: 6,  bot: 10, h: 5,  unit: '公分', ctx: '梯形上底 $6$ 公分，下底 $10$ 公分，高 $5$ 公分' },
      { top: 5,  bot: 7,  h: 4,  unit: '公分', ctx: '一個梯形，上底 $5$ 公分，下底 $7$ 公分，高 $4$ 公分' },
      { top: 7,  bot: 13, h: 6,  unit: '公分', ctx: '梯形上底 $7$ 公分，下底 $13$ 公分，高 $6$ 公分' },
      { top: 6,  bot: 14, h: 5,  unit: '公分', ctx: '梯形上底 $6$ 公分，下底 $14$ 公分，高 $5$ 公分' },
      { top: 8,  bot: 12, h: 5,  unit: '公分', ctx: '梯形上底 $8$ 公分，下底 $12$ 公分，高 $5$ 公分' },
      { top: 9,  bot: 15, h: 4,  unit: '公分', ctx: '梯形上底 $9$ 公分，下底 $15$ 公分，高 $4$ 公分' },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      const area = (c.top + c.bot) * c.h / 2;
      const q = `${c.ctx}，請問這個梯形的面積是多少平方${c.unit}？`;
      const ans = `${area} 平方${c.unit}`;
      questions.push(q);
      summaryAnswers.push(ans);
      answers.push(formatPracticeShortAnswer(ans,
        `梯形面積 = (上底 + 下底) × 高 ÷ 2 = (${c.top} + ${c.bot}) × ${c.h} ÷ 2 = ${c.top + c.bot} × ${c.h} ÷ 2 = ${area} 平方${c.unit}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  // 三角形面積 = 底 × 高 ÷ 2
  function buildE515TriangleAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { base: 10, height: 12, unit: '公分', ctx: '一個三角形，底是 $10$ 公分，高是 $12$ 公分' },
      { base: 8,  height: 6,  unit: '公分', ctx: '三角形的底 $8$ 公分，高 $6$ 公分' },
      { base: 35, height: 20, unit: '公分', ctx: '一塊三角形的布料，底 $35$ 公分，高 $20$ 公分' },
      { base: 10, height: 12, unit: '公分', ctx: '一塊三角形廣告牌，底 $10$ 公分，高 $12$ 公分' },
      { base: 15, height: 10, unit: '公分', ctx: '三角形底 $15$ 公分，高 $10$ 公分' },
      { base: 8,  height: 6,  unit: '公尺', ctx: '一塊三角形土地，底 $8$ 公尺，高 $6$ 公尺' },
      { base: 40, height: 25, unit: '公分', ctx: '三角形底 $40$ 公分，高 $25$ 公分' },
      { base: 12, height: 9,  unit: '公分', ctx: '一個三角形，底 $12$ 公分，高 $9$ 公分' },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      const area = c.base * c.height / 2;
      const q = `${c.ctx}，請問這個三角形的面積是多少平方${c.unit}？`;
      const ans = `${area} 平方${c.unit}`;
      questions.push(q);
      summaryAnswers.push(ans);
      answers.push(formatPracticeShortAnswer(ans,
        `三角形面積 = 底 × 高 ÷ 2 = ${c.base} × ${c.height} ÷ 2 = ${area} 平方${c.unit}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  // 面積三小類綜合
  function buildE515AreaThreeSet(count) {
    return buildE515MixedSet([buildE515ParallelogramAreaSet, buildE515TrapezoidAreaSet, buildE515TriangleAreaSet], count);
  }

  // ─── e5-1-5 新增面積 generators 結束 ─────────────────────────────────────

  function e516RandomProperFraction(den) {
    return makeFraction(randInt(1, den - 1), den);
  }

  function e516RandomImproperFraction(den, wholeMax = 3) {
    return makeFraction(randInt(den + 1, den * wholeMax - 1), den);
  }

  function buildE516ProperAddSubSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [d1, d2] = e516PickDenominatorPair();
      const left = e516RandomProperFraction(d1);
      let right = e516RandomProperFraction(d2);
      const useAdd = i % 2 === 0;
      let result = null;
      if (useAdd) {
        result = addFraction(left, right);
      } else {
        while (left.num / left.den <= right.num / right.den) {
          right = e516RandomProperFraction(d2);
        }
        result = subFraction(left, right);
      }
      const common = lcm(left.den, right.den);
      const leftNum = left.num * (common / left.den);
      const rightNum = right.num * (common / right.den);
      questions.push(`計算：${e516Frac(left)} ${useAdd ? '+' : '-'} ${e516Frac(right)} = （　）`);
      summaryAnswers.push(e516Frac(result));
      answers.push(
        e516Answer(
          e516Frac(result),
          `先通分成分母 ${common}：${e516Frac(left)} = $\\frac{${leftNum}}{${common}}$，${e516Frac(right)} = $\\frac{${rightNum}}{${common}}$。${useAdd ? '相加' : '相減'}後得 $\\frac{${useAdd ? leftNum + rightNum : leftNum - rightNum}}{${common}}=${fractionToLatex(result)}$。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE516ImproperCalcSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [d1, d2] = e516PickDenominatorPair();
      const left =
        i % 3 === 0 ? e516RandomImproperFraction(d1) : makeMixedFraction(randInt(1, 3), randInt(1, d1 - 1), d1);
      let right =
        i % 3 === 1 ? e516RandomImproperFraction(d2) : makeMixedFraction(randInt(1, 2), randInt(1, d2 - 1), d2);
      const useAdd = i % 2 === 0;
      if (!useAdd) {
        while (left.num / left.den <= right.num / right.den) {
          right =
            i % 3 === 1 ? e516RandomImproperFraction(d2) : makeMixedFraction(randInt(1, 2), randInt(1, d2 - 1), d2);
        }
      }
      const result = useAdd ? addFraction(left, right) : subFraction(left, right);
      questions.push(`計算：${e516Frac(left, true)} ${useAdd ? '+' : '-'} ${e516Frac(right, true)} = （　）`);
      summaryAnswers.push(e516Frac(result, true));
      answers.push(
        e516Answer(
          e516Frac(result, true),
          `先把兩個數都當成假分數來通分計算。${e516Frac(left, true)} ${useAdd ? '+' : '-'} ${e516Frac(right, true)} = ${e516Frac(result)}，整理後可寫成 ${e516Frac(result, true)}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE516MixedAddSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [d1, d2] = e516PickDenominatorPair();
      const left = makeMixedFraction(randInt(1, 4), randInt(1, d1 - 1), d1);
      const useFraction = i % 2 === 0;
      const right = useFraction
        ? makeFraction(randInt(1, d2 - 1), d2)
        : makeMixedFraction(randInt(1, 3), randInt(1, d2 - 1), d2);
      const result = addFraction(left, right);
      questions.push(`計算：${e516Frac(left, true)} + ${e516Frac(right, true)} = （　）`);
      summaryAnswers.push(e516Frac(result, true));
      answers.push(
        e516Answer(
          e516Frac(result, true),
          `先把整數部分與分數部分一起看成分數計算，再通分相加。最後整理成帶分數，可得 ${e516Frac(result, true)}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE516MixedBorrowSubSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [d1, d2] = e516PickDenominatorPair();
      const common = lcm(d1, d2);
      const leftWhole = randInt(2, 6);
      const rightWhole = randInt(1, leftWhole - 1);
      const leftNumerator = randInt(1, d1 - 1);
      let rightNumerator = randInt(1, d2 - 1);
      while (leftNumerator * (common / d1) >= rightNumerator * (common / d2)) {
        rightNumerator = randInt(1, d2 - 1);
      }
      const left = makeMixedFraction(leftWhole, leftNumerator, d1);
      const right = makeMixedFraction(rightWhole, rightNumerator, d2);
      const result = subFraction(left, right);
      questions.push(`計算：${e516Frac(left, true)} - ${e516Frac(right, true)} = （　）`);
      summaryAnswers.push(e516Frac(result, true));
      answers.push(
        e516Answer(
          e516Frac(result, true),
          `因為被減數的分數部分不夠減，所以先向整數部分借 1，再把 1 化成分數後通分計算。整理後得 ${e516Frac(result, true)}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE516TotalApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const templates = [
      ['阿姨將', '公升的紅茶和', '公升的鮮奶混合，混合後共有多少公升？', '公升'],
      ['媽媽買了', '公斤的白米和', '公斤的糙米，混合後共有多少公斤？', '公斤'],
      ['老師布置教室用了', '公尺的紅緞帶和', '公尺的藍緞帶，總共用掉幾公尺？', '公尺'],
      ['點心盒裡放了', '公斤的葡萄和', '公斤的蘋果，合起來有多少公斤？', '公斤'],
    ];
    for (let i = 0; i < count; i += 1) {
      const row = templates[i % templates.length];
      const [d1, d2] = e516PickDenominatorPair();
      const leftFrac = makeMixedFraction(randInt(1, 4), randInt(1, d1 - 1), d1);
      const rightFrac =
        i % 2 === 0 ? makeFraction(randInt(1, d2 - 1), d2) : makeMixedFraction(randInt(1, 3), randInt(1, d2 - 1), d2);
      const result = addFraction(leftFrac, rightFrac);
      questions.push(`${row[0]}${e516Frac(leftFrac, true)}${row[1]}${e516Frac(rightFrac, true)}${row[2]}`);
      summaryAnswers.push(`${e516Frac(result, true)}${row[3]}`);
      answers.push(
        e516Answer(
          `${e516Frac(result, true)}${row[3]}`,
          `題目在求共多少，使用加法。${e516Frac(leftFrac, true)} + ${e516Frac(rightFrac, true)} = ${e516Frac(result, true)}，所以答案是 ${e516Frac(result, true)}${row[3]}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE516DifferenceApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const templates = [
      ['爸爸的體重是', '公斤，媽媽的體重是', '公斤，兩人的體重相差多少公斤？', '公斤'],
      ['大水桶裝了', '公升，水壺裡有', '公升，兩者相差多少公升？', '公升'],
      ['紅繩長', '公尺，藍繩長', '公尺，紅繩比藍繩長多少公尺？', '公尺'],
      ['大袋米重', '公斤，小袋米重', '公斤，大袋米比小袋米多幾公斤？', '公斤'],
    ];
    for (let i = 0; i < count; i += 1) {
      const row = templates[i % templates.length];
      const [d1, d2] = e516PickDenominatorPair();
      let left = makeMixedFraction(randInt(2, 7), randInt(1, d1 - 1), d1);
      let right =
        i % 2 === 0 ? makeFraction(randInt(1, d2 - 1), d2) : makeMixedFraction(randInt(1, 5), randInt(1, d2 - 1), d2);
      while (left.num / left.den <= right.num / right.den) {
        left = makeMixedFraction(randInt(2, 7), randInt(1, d1 - 1), d1);
        right =
          i % 2 === 0 ? makeFraction(randInt(1, d2 - 1), d2) : makeMixedFraction(randInt(1, 5), randInt(1, d2 - 1), d2);
      }
      const result = subFraction(left, right);
      questions.push(`${row[0]}${e516Frac(left, true)}${row[1]}${e516Frac(right, true)}${row[2]}`);
      summaryAnswers.push(`${e516Frac(result, true)}${row[3]}`);
      answers.push(
        e516Answer(
          `${e516Frac(result, true)}${row[3]}`,
          `題目問相差多少或誰比較多，就是用減法。${e516Frac(left, true)} - ${e516Frac(right, true)} = ${e516Frac(result, true)}，所以相差 ${e516Frac(result, true)}${row[3]}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE516RemainingApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const templates = [
      ['桌上有', '盤果凍，賣掉', '盤後，還剩下多少盤？', '盤'],
      ['一桶礦泉水有', '公升，喝掉', '公升後，還剩下多少公升？', '公升'],
      ['水壺裡有', '公升的果汁，倒出', '公升後，還剩下幾公升？', '公升'],
      ['倉庫裡有', '公斤的米，搬走', '公斤後，還剩下多少公斤？', '公斤'],
    ];
    for (let i = 0; i < count; i += 1) {
      const row = templates[i % templates.length];
      const [d1, d2] = e516PickDenominatorPair();
      const original = makeMixedFraction(randInt(2, 6), randInt(1, d1 - 1), d1);
      let used =
        i % 2 === 0 ? makeFraction(randInt(1, d2 - 1), d2) : makeMixedFraction(randInt(1, 3), randInt(1, d2 - 1), d2);
      while (original.num / original.den <= used.num / used.den) {
        used =
          i % 2 === 0 ? makeFraction(randInt(1, d2 - 1), d2) : makeMixedFraction(randInt(1, 3), randInt(1, d2 - 1), d2);
      }
      const result = subFraction(original, used);
      questions.push(`${row[0]}${e516Frac(original, true)}${row[1]}${e516Frac(used, true)}${row[2]}`);
      summaryAnswers.push(`${e516Frac(result, true)}${row[3]}`);
      answers.push(
        e516Answer(
          `${e516Frac(result, true)}${row[3]}`,
          `題目在求還剩下多少，用原有減掉用掉的部分。${e516Frac(original, true)} - ${e516Frac(used, true)} = ${e516Frac(result, true)}，所以答案是 ${e516Frac(result, true)}${row[3]}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE516OriginalAmountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const templates = [
      ['阿姨買一桶蜂蜜，用掉', '公升後剩', '公升，這桶蜂蜜原有幾公升？', '公升'],
      ['餐廳買了一桶油，用掉', '公升後剩', '公升，這桶油原有幾公升？', '公升'],
      ['哥哥用掉', '公尺膠帶後剩下', '公尺，這卷膠帶原來長幾公尺？', '公尺'],
      ['安安做勞作用掉', '公尺緞帶，還剩下', '公尺，這條緞帶原長幾公尺？', '公尺'],
    ];
    for (let i = 0; i < count; i += 1) {
      const row = templates[i % templates.length];
      const [d1, d2] = e516PickDenominatorPair();
      const used =
        i % 2 === 0 ? makeFraction(randInt(1, d1 - 1), d1) : makeMixedFraction(randInt(1, 3), randInt(1, d1 - 1), d1);
      const left = makeMixedFraction(randInt(1, 4), randInt(1, d2 - 1), d2);
      const result = addFraction(used, left);
      questions.push(`${row[0]}${e516Frac(used, true)}${row[1]}${e516Frac(left, true)}${row[2]}`);
      summaryAnswers.push(`${e516Frac(result, true)}${row[3]}`);
      answers.push(
        e516Answer(
          `${e516Frac(result, true)}${row[3]}`,
          `原有量 = 用掉 + 剩下，所以 ${e516Frac(used, true)} + ${e516Frac(left, true)} = ${e516Frac(result, true)}。因此原來有 ${e516Frac(result, true)}${row[3]}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE516DivisionIntegratedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bank = [
      ['compare', '棒棒糖', '軟糖', '公斤', '一袋棒棒糖比一袋軟糖多幾公斤？'],
      ['compare', '白米', '糯米', '公斤', '一包白米比一包糯米重幾公斤？'],
      ['add', '燕麥', '紫米', '公斤', '一袋燕麥和一袋紫米共重多少公斤？'],
      ['compare', '紅繩', '藍繩', '公尺', '一段紅繩比一段藍繩長幾公尺？'],
      ['compare', '果汁', '綠豆湯', '公升', '哪一個容器裝得比較多？相差幾公升？'],
    ];
    for (let i = 0; i < count; i += 1) {
      const row = bank[i % bank.length];
      const [d1, d2] = e516PickDenominatorPair();
      const leftEach = makeFraction(randInt(d1 + 1, d1 * 4 - 1), d1);
      const rightEach = makeFraction(randInt(d2 + 1, d2 * 4 - 1), d2);
      const leftCount = randInt(2, 10);
      const rightCount = randInt(2, 10);
      const leftTotal = makeFraction(leftEach.num * leftCount, leftEach.den);
      const rightTotal = makeFraction(rightEach.num * rightCount, rightEach.den);
      const isCompare = row[0] === 'compare';
      const larger = leftEach.num / leftEach.den >= rightEach.num / rightEach.den ? leftEach : rightEach;
      const smaller = larger === leftEach ? rightEach : leftEach;
      const result = isCompare ? subFraction(larger, smaller) : addFraction(leftEach, rightEach);
      questions.push(
        `${e516Frac(leftTotal, true)}${row[3]}的${row[1]}平均分成 ${leftCount} 份，${e516Frac(rightTotal, true)}${row[3]}的${row[2]}平均分成 ${rightCount} 份，${row[4]}`
      );
      if (isCompare) {
        summaryAnswers.push(`${e516Frac(result, true)}${row[3]}`);
        answers.push(
          e516Answer(
            `${e516Frac(result, true)}${row[3]}`,
            `先算每一份的量：${e516Frac(leftTotal, true)} ÷ ${leftCount} = ${e516Frac(leftEach)}，${e516Frac(rightTotal, true)} ÷ ${rightCount} = ${e516Frac(rightEach)}。再比較大小並相減，可得相差 ${e516Frac(result, true)}${row[3]}。`
          )
        );
      } else {
        summaryAnswers.push(`${e516Frac(result, true)}${row[3]}`);
        answers.push(
          e516Answer(
            `${e516Frac(result, true)}${row[3]}`,
            `先算每一份的量：${e516Frac(leftTotal, true)} ÷ ${leftCount} = ${e516Frac(leftEach)}，${e516Frac(rightTotal, true)} ÷ ${rightCount} = ${e516Frac(rightEach)}。再相加，得到 ${e516Frac(result, true)}${row[3]}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE516MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = banks[i % banks.length](1);
      questions.push(built.questions[0]);
      summaryAnswers.push(built.summaryAnswers[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE516BasicTwoSet(count) {
    return buildE516MixedSet([buildE516ProperAddSubSet, buildE516ImproperCalcSet], count);
  }

  function buildE516MixedTwoSet(count) {
    return buildE516MixedSet([buildE516MixedAddSet, buildE516MixedBorrowSubSet], count);
  }

  function buildE516ApplicationFiveSet(count) {
    return buildE516MixedSet(
      [
        buildE516TotalApplicationSet,
        buildE516DifferenceApplicationSet,
        buildE516RemainingApplicationSet,
        buildE516OriginalAmountSet,
        buildE516DivisionIntegratedSet,
      ],
      count
    );
  }

  function e517Answer(shortAnswer, process) {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function e517PickLetters(count) {
    const pool = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');
    const picked = [];
    while (picked.length < count) {
      const candidate = pickFromList(pool);
      if (!picked.includes(candidate)) picked.push(candidate);
    }
    return picked;
  }

  function buildE517RegularAxisCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const sides = randInt(3, 12);
      questions.push(`正 ${sides} 邊形有幾條對稱軸？`);
      summaryAnswers.push(`${sides} 條`);
      answers.push(
        e517Answer(`${sides} 條`, `正多邊形的對稱軸條數和邊數一樣多，所以正 ${sides} 邊形有 ${sides} 條對稱軸。`)
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE517CommonShapeSymmetrySet(count) {
    const bank = [
      ['長方形', '是，2 條', '長方形沿著兩條中線對摺都能重合，所以有 2 條對稱軸。'],
      ['正方形', '是，4 條', '正方形的兩條中線與兩條對角線都可以當對稱軸，所以有 4 條。'],
      ['等腰三角形', '是，1 條', '等腰三角形只有通過頂角與底邊中點的那一條對稱軸，所以有 1 條。'],
      ['正三角形', '是，3 條', '正三角形三個頂點都能對應到底邊中點，所以共有 3 條對稱軸。'],
      ['菱形', '是，2 條', '菱形沿著兩條對角線對摺都能重合，所以有 2 條對稱軸。'],
      ['等腰梯形', '是，1 條', '等腰梯形只有通過兩底中點的那一條對稱軸。'],
      ['圓形', '是，無限多條', '所有通過圓心的直線都可以當對稱軸，所以有無限多條。'],
      ['平行四邊形', '否，0 條', '一般平行四邊形對摺後無法完全重合，所以不是線對稱圖形。'],
      ['一般梯形', '否，0 條', '一般梯形沒有左右完全對應的鏡射結構，所以不是線對稱圖形。'],
      ['不等邊三角形', '否，0 條', '三邊都不同時，無法沿一條直線對摺重合，所以不是線對稱圖形。'],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const row = bank[(i + randInt(0, bank.length - 1)) % bank.length];
      questions.push(`${row[0]}是不是線對稱圖形？如果是，有幾條對稱軸？`);
      summaryAnswers.push(row[1]);
      answers.push(e517Answer(row[1], row[2]));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE517MirrorDistanceSet(count) {
    const axisNames = ['直線 ℓ', '對稱軸 m', '對稱軸 n', '直線 p'];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = e517PickLetters(2);
      const axis = pickFromList(axisNames);
      const distance = randInt(2, 18);
      questions.push(
        `點 ${a} 和點 ${b} 互為 ${axis} 的對稱點。若點 ${a} 到 ${axis} 的垂直距離是 ${distance} 公分，則點 ${b} 到 ${axis} 的垂直距離是多少公分？`
      );
      summaryAnswers.push(`${distance} 公分`);
      answers.push(
        e517Answer(
          `${distance} 公分`,
          `對稱點到對稱軸的垂直距離相等，所以點 ${b} 到 ${axis} 的垂直距離也是 ${distance} 公分。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE517MirrorSegmentLengthSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const [a, b, c, d] = e517PickLetters(4);
        const length = randInt(4, 28);
        questions.push(
          `在線對稱圖形中，線段 ${a}${b} 的對稱邊是線段 ${c}${d}。若 ${a}${b} 長 ${length} 公分，則 ${c}${d} 長多少公分？`
        );
        summaryAnswers.push(`${length} 公分`);
        answers.push(
          e517Answer(`${length} 公分`, `對稱邊一樣長，所以 ${c}${d} 和 ${a}${b} 長度相等，都是 ${length} 公分。`)
        );
      } else {
        const left1 = randInt(3, 12);
        const left2 = randInt(3, 12);
        const left3 = randInt(3, 12);
        const total = left1 + left2 + left3;
        questions.push(
          `一個線對稱圖形左半邊的三條外邊長分別是 ${left1}、${left2}、${left3} 公分，則右半邊對應三條外邊的總長是多少公分？`
        );
        summaryAnswers.push(`${total} 公分`);
        answers.push(
          e517Answer(
            `${total} 公分`,
            `線對稱圖形左右對應的邊長相等，所以右半邊對應三條外邊總長和左半邊一樣，也是 ${left1}+${left2}+${left3}=${total} 公分。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE517MirrorAngleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = e517PickLetters(2);
      const angle = randInt(35, 145);
      questions.push(`某線對稱圖形中，∠${a} 和 ∠${b} 互為對稱角。若 ∠${a} = ${angle}°，則 ∠${b} 是多少度？`);
      summaryAnswers.push(`${angle}°`);
      answers.push(e517Answer(`${angle}°`, `對稱角大小相等，所以 ∠${b} = ∠${a} = ${angle}°。`));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE517PerimeterSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const leftSum = randInt(12, 40);
        const base = randInt(4, 20);
        const perimeter = leftSum * 2 + base;
        questions.push(
          `一個線對稱五邊形，左右兩側外框互為鏡射，左半邊外框總長為 ${leftSum} 公分，底邊長為 ${base} 公分，求整個周長。`
        );
        summaryAnswers.push(`${perimeter} 公分`);
        answers.push(
          e517Answer(
            `${perimeter} 公分`,
            `左右兩側外框互為鏡射，所以兩側總長是 ${leftSum} × 2 = ${leftSum * 2} 公分，再加上底邊 ${base} 公分，周長是 ${perimeter} 公分。`
          )
        );
      } else {
        const leftSum = randInt(10, 30);
        const top = randInt(3, 15);
        const bottom = randInt(4, 18);
        const perimeter = leftSum * 2 + top + bottom;
        questions.push(
          `一個線對稱六邊形，左右兩側外框互為鏡射，左半邊外框總長為 ${leftSum} 公分，上底長 ${top} 公分，下底長 ${bottom} 公分，求整個周長。`
        );
        summaryAnswers.push(`${perimeter} 公分`);
        answers.push(
          e517Answer(
            `${perimeter} 公分`,
            `左右兩側外框一樣長，所以兩側共 ${leftSum} × 2 = ${leftSum * 2} 公分，再加上上底和下底 ${top}+${bottom} 公分，可得周長 ${perimeter} 公分。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE517MixedSet(builders, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = builders[i % builders.length](1);
      questions.push(built.questions[0]);
      summaryAnswers.push(built.summaryAnswers[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE517AxisTwoSet(count) {
    return buildE517MixedSet([buildE517RegularAxisCountSet, buildE517CommonShapeSymmetrySet], count);
  }

  function buildE517CalcFourSet(count) {
    return buildE517MixedSet(
      [buildE517MirrorDistanceSet, buildE517MirrorSegmentLengthSet, buildE517MirrorAngleSet, buildE517PerimeterSet],
      count
    );
  }

  function e518Answer(shortAnswer, process) {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function e518Number(min, max) {
    return randInt(min, max);
  }

  function buildE518BasicMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      let question = '';
      let value = 0;
      let process = '';
      if (i % 4 === 0) {
        const a = e518Number(4, 15);
        const b = e518Number(12, 48);
        const c = e518Number(2, 8);
        const d = e518Number(2, 9);
        const inside = b + c * d;
        value = a * inside;
        question = `${a} × (${b} + ${c} × ${d}) = （　）`;
        process = `先算括號內的乘法 ${c} × ${d} = ${c * d}，再算括號 ${b} + ${c * d} = ${inside}，最後 ${a} × ${inside} = ${value}。`;
      } else if (i % 4 === 1) {
        const a = e518Number(120, 600);
        const b = e518Number(3, 9);
        const c = e518Number(2, 9);
        const d = e518Number(15, 80);
        value = a - b * c + d;
        question = `${a} - ${b} × ${c} + ${d} = （　）`;
        process = `先算乘法 ${b} × ${c} = ${b * c}，再依序由左到右計算：${a} - ${b * c} + ${d} = ${value}。`;
      } else if (i % 4 === 2) {
        const a = e518Number(12, 36);
        const b = e518Number(4, 12);
        const c = e518Number(2, 9);
        const d = e518Number(2, 9);
        value = a * b + c * d;
        question = `${a} × ${b} + ${c} × ${d} = （　）`;
        process = `先算兩個乘法：${a} × ${b} = ${a * b}，${c} × ${d} = ${c * d}，再相加得到 ${value}。`;
      } else {
        const a = e518Number(300, 900);
        const b = e518Number(40, 90);
        const c = e518Number(2, 9);
        const d = e518Number(2, 9);
        const inside = b - c;
        value = a - d * inside;
        question = `${a} - ${d} × (${b} - ${c}) = （　）`;
        process = `先算括號 ${b} - ${c} = ${inside}，再算乘法 ${d} × ${inside} = ${d * inside}，最後 ${a} - ${d * inside} = ${value}。`;
      }
      questions.push(`計算：${question}`);
      summaryAnswers.push(`${value}`);
      answers.push(e518Answer(`${value}`, process));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE518EquivalentJudgeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickFromList([1200, 1600, 1800, 2400, 3600, 4800, 7200, 8400, 9600]);
      const b = pickFromList([12, 15, 16, 20, 24, 25, 30, 40, 45]);
      const c = pickFromList([2, 3, 4, 5, 6, 8, 10]);
      const equal = i % 2 === 0;
      const expr1 = `${a} ÷ ${b} ÷ ${c}`;
      const expr2 = equal ? `${a} ÷ (${b} × ${c})` : `${a} ÷ (${b} ÷ ${c})`;
      const v1 = a / b / c;
      const v2 = equal ? a / (b * c) : a / (b / c);
      const resultText = equal ? '相同' : '不同';
      questions.push(`判斷：${expr1} 和 ${expr2} 的結果是否相同？`);
      summaryAnswers.push(resultText);
      answers.push(
        e518Answer(
          resultText,
          `先算第一式：${expr1} = ${v1}。第二式 ${expr2} = ${v2}。因為兩式結果${equal ? '都等於 ' + v1 : `分別是 ${v1} 和 ${v2}`}，所以答案是${resultText}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE518ChainDivisionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const factorBank = [
      [25, 4],
      [50, 2],
      [125, 8],
      [45, 2],
      [15, 4],
      [5, 20],
      [16, 5],
      [32, 25],
    ];
    for (let i = 0; i < count; i += 1) {
      const [b, c] = factorBank[i % factorBank.length];
      const base = pickFromList([200, 300, 400, 600, 900, 1200, 1800]);
      const a = base * b * c;
      const value = a / b / c;
      questions.push(`計算：${a} ÷ ${b} ÷ ${c} = （　）`);
      summaryAnswers.push(`${value}`);
      answers.push(
        e518Answer(
          `${value}`,
          `連除可以改寫成除以兩個除數的乘積：${a} ÷ ${b} ÷ ${c} = ${a} ÷ (${b} × ${c}) = ${a} ÷ ${b * c} = ${value}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE518DistributiveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      let question = '';
      let value = 0;
      let process = '';
      if (i % 4 === 0) {
        const a = e518Number(12, 90);
        const b = e518Number(11, 40);
        const c = e518Number(11, 40);
        value = a * b + a * c;
        question = `${a} × ${b} + ${a} × ${c} = （　）`;
        process = `提出公因數 ${a}：${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c}) = ${a} × ${b + c} = ${value}。`;
      } else if (i % 4 === 1) {
        const a = e518Number(12, 90);
        const b = e518Number(60, 99);
        const c = e518Number(10, b - 10);
        value = a * b - a * c;
        question = `${a} × ${b} - ${a} × ${c} = （　）`;
        process = `提出公因數 ${a}：${a} × ${b} - ${a} × ${c} = ${a} × (${b} - ${c}) = ${a} × ${b - c} = ${value}。`;
      } else if (i % 4 === 2) {
        const a = e518Number(120, 980);
        const b = pickFromList([98, 99, 101, 102, 998, 999, 1001]);
        value = a * b;
        if (b > 100) {
          question = `${a} × ${b} = （　）`;
          const base = b >= 998 ? 1000 : 100;
          process = `把 ${b} 拆成 ${base}${b > base ? '+' : '-'}${Math.abs(b - base)}：${a} × ${b} = ${a} × (${base}${b > base ? '+' : '-'}${Math.abs(b - base)}) = ${value}。`;
        } else {
          question = `${a} × ${b} = （　）`;
          process = `把 ${b} 拆成 100-${100 - b}：${a} × ${b} = ${a} × (100-${100 - b}) = ${a * 100} - ${a * (100 - b)} = ${value}。`;
        }
      } else {
        const a = e518Number(20, 120);
        const b = e518Number(11, 90);
        value = a * b + a;
        question = `${a} × ${b} + ${a} = （　）`;
        process = `把單獨的 ${a} 看成 ${a} × 1：${a} × ${b} + ${a} = ${a} × ${b} + ${a} × 1 = ${a} × (${b} + 1) = ${value}。`;
      }
      questions.push(`簡便計算：${question}`);
      summaryAnswers.push(`${value}`);
      answers.push(e518Answer(`${value}`, process));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE518ApplicationExpressionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 4 === 0) {
        const a = e518Number(80, 180);
        const b = e518Number(60, 160);
        const discount = e518Number(10, 40);
        const pay = pickFromList([300, 400, 500, 600, 700]);
        const value = pay - (a + b - discount);
        questions.push(`購物找零：買了 ${a} 元商品和 ${b} 元商品，折價 ${discount} 元，付 ${pay} 元，應找回多少元？`);
        summaryAnswers.push(`${value} 元`);
        answers.push(
          e518Answer(
            `${value} 元`,
            `先算實付金額：${a}+${b}-${discount}=${a + b - discount} 元，再用 ${pay}-${a + b - discount}=${value}，所以找回 ${value} 元。`
          )
        );
      } else if (i % 4 === 1) {
        const total = pickFromList([96, 120, 144, 180, 210]);
        const perBox = pickFromList([6, 8, 10, 12, 15]);
        const boxesPerPack = pickFromList([2, 3, 4, 5]);
        const value = total / (perBox * boxesPerPack);
        questions.push(
          `分裝問題：共有 ${total} 個物品，每 ${perBox} 個裝一盒，每 ${boxesPerPack} 盒裝一袋，共可裝成幾袋？`
        );
        summaryAnswers.push(`${value} 袋`);
        answers.push(
          e518Answer(
            `${value} 袋`,
            `先算一袋有幾個：${perBox} × ${boxesPerPack} = ${perBox * boxesPerPack} 個，再算 ${total} ÷ ${perBox * boxesPerPack} = ${value} 袋。`
          )
        );
      } else if (i % 4 === 2) {
        const setA = e518Number(6, 15);
        const totalA = setA * pickFromList([18, 24, 30, 36]);
        const setB = e518Number(4, 12);
        const totalB = setB * pickFromList([24, 30, 36, 42]);
        const unitA = totalA / setA;
        const unitB = totalB / setB;
        const cheaper = unitA < unitB ? 'A' : 'B';
        const diff = Math.abs(unitA - unitB);
        questions.push(
          `單價比較：A 品牌 ${setA} 件賣 ${totalA} 元，B 品牌 ${setB} 件賣 ${totalB} 元，哪一個單價比較便宜？便宜幾元？`
        );
        summaryAnswers.push(`${cheaper} 品牌，便宜 ${diff} 元`);
        answers.push(
          e518Answer(
            `${cheaper} 品牌，便宜 ${diff} 元`,
            `A 的單價是 ${totalA} ÷ ${setA} = ${unitA} 元，B 的單價是 ${totalB} ÷ ${setB} = ${unitB} 元。較便宜的是 ${cheaper} 品牌，差 ${diff} 元。`
          )
        );
      } else {
        const length = e518Number(20, 60);
        const width = e518Number(10, 30);
        const side = e518Number(8, 20);
        const rect = length * width;
        const square = side * side;
        const value = Math.abs(rect - square);
        const symbol = rect >= square ? '多' : '少';
        questions.push(
          `面積比較：長方形長 ${length} 公尺、寬 ${width} 公尺，正方形邊長 ${side} 公尺，長方形面積比正方形面積${symbol}多少平方公尺？`
        );
        summaryAnswers.push(`${value} 平方公尺`);
        answers.push(
          e518Answer(
            `${value} 平方公尺`,
            `長方形面積 ${length} × ${width} = ${rect}，正方形面積 ${side} × ${side} = ${square}，相差 ${value} 平方公尺。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE518AverageBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 3 === 0) {
        const nums = Array.from({ length: 4 }, () => e518Number(70, 98));
        const total = nums.reduce((sum, value) => sum + value, 0);
        const avg = total / nums.length;
        questions.push(`平均數：${nums.join('、')} 的平均是多少？`);
        summaryAnswers.push(`${avg}`);
        answers.push(
          e518Answer(`${avg}`, `先求總和 ${nums.join('+')} = ${total}，再用 ${total} ÷ ${nums.length} = ${avg}。`)
        );
      } else if (i % 3 === 1) {
        const items = Array.from({ length: 3 }, () => pickFromList([180, 210, 240, 270, 300, 330, 360]));
        const total = items.reduce((sum, value) => sum + value, 0);
        const avg = total / 3;
        questions.push(`費用平攤：三人分別付了 ${items[0]} 元、${items[1]} 元、${items[2]} 元，平均每人要付多少元？`);
        summaryAnswers.push(`${avg} 元`);
        answers.push(e518Answer(`${avg} 元`, `先算總共付了 ${total} 元，再用 ${total} ÷ 3 = ${avg} 元。`));
      } else {
        const nums = Array.from({ length: 5 }, () => pickFromList([120, 180, 240, 300, 360, 420, 480, 540, 600]));
        const total = nums.reduce((sum, value) => sum + value, 0);
        const avg = total / 5;
        questions.push(`一段時間的平均：五天的數量分別是 ${nums.join('、')}，平均一天是多少？`);
        summaryAnswers.push(`${avg}`);
        answers.push(e518Answer(`${avg}`, `先加總得到 ${total}，再除以 5，${total} ÷ 5 = ${avg}。`));
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE518AverageTargetSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const countDone = pickFromList([3, 4, 5]);
      const scores = Array.from({ length: countDone }, () => e518Number(78, 96));
      const targetAvg = e518Number(82, 95);
      const totalNeed = targetAvg * (countDone + 1);
      const current = scores.reduce((sum, value) => sum + value, 0);
      const need = totalNeed - current;
      questions.push(
        `目標平均：前 ${countDone} 次成績分別是 ${scores.join('、')}，若要讓 ${countDone + 1} 次的平均達到 ${targetAvg}，下一次至少要得到幾分？`
      );
      summaryAnswers.push(`${need} 分`);
      answers.push(
        e518Answer(
          `${need} 分`,
          `目標總分是 ${targetAvg} × ${countDone + 1} = ${totalNeed} 分，現在已有 ${current} 分，所以還需要 ${totalNeed} - ${current} = ${need} 分。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE518BalancePaymentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const pays = Array.from({ length: 3 }, () => pickFromList([180, 210, 240, 270, 300, 330, 360, 420, 450, 480]));
      const total = pays.reduce((sum, value) => sum + value, 0);
      const avg = total / 3;
      const maxValue = Math.max(...pays);
      const names = ['甲', '乙', '丙'];
      const maxIndex = pays.indexOf(maxValue);
      const give = maxValue - avg;
      questions.push(
        `平攤後補差額：甲付 ${pays[0]} 元，乙付 ${pays[1]} 元，丙付 ${pays[2]} 元，平均每人應付多少元？多付的人應拿回多少元？`
      );
      summaryAnswers.push(`平均 ${avg} 元，${names[maxIndex]}應拿回 ${give} 元`);
      answers.push(
        e518Answer(
          `平均 ${avg} 元，${names[maxIndex]}應拿回 ${give} 元`,
          `總共付了 ${total} 元，所以平均每人 ${total} ÷ 3 = ${avg} 元。${names[maxIndex]}付了 ${maxValue} 元，比平均多 ${maxValue} - ${avg} = ${give} 元，所以應拿回 ${give} 元。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE518MixedSet(builders, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = builders[i % builders.length](1);
      questions.push(built.questions[0]);
      summaryAnswers.push(built.summaryAnswers[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE518BasicTwoSet(count) {
    return buildE518MixedSet([buildE518BasicMixedSet, buildE518EquivalentJudgeSet], count);
  }

  function buildE518PropertyTwoSet(count) {
    return buildE518MixedSet([buildE518ChainDivisionSet, buildE518DistributiveSet], count);
  }

  function buildE518ApplicationTwoSet(count) {
    return buildE518MixedSet([buildE518ApplicationExpressionSet, buildE518AverageBasicSet], count);
  }

  function buildE518AverageAdvancedTwoSet(count) {
    return buildE518MixedSet([buildE518AverageTargetSet, buildE518BalancePaymentSet], count);
  }

  function e519Answer(shortAnswer, process) {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function buildE519ParallelogramDirectSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = randInt(8, 40);
      const height = randInt(4, 24);
      const area = base * height;
      if (i % 2 === 0) {
        questions.push(`平行四邊形的底是 ${base} 公分，高是 ${height} 公分，面積是多少平方公分？`);
        answers.push(
          e519Answer(`${area} 平方公分`, `平行四邊形面積 = 底 × 高，所以 ${base} × ${height} = ${area} 平方公分。`)
        );
      } else {
        const side = base + randInt(2, 12);
        questions.push(
          `一個平行四邊形的底是 ${base} 公分，斜邊長 ${side} 公分，底邊與對邊的垂直距離是 ${height} 公分，面積是多少平方公分？`
        );
        answers.push(
          e519Answer(
            `${area} 平方公分`,
            `面積只看底和對應的高，斜邊 ${side} 公分不是面積公式需要的量，所以面積 = ${base} × ${height} = ${area} 平方公分。`
          )
        );
      }
      summaryAnswers.push(`${area} 平方公分`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519ParallelogramReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = randInt(6, 36);
      const height = randInt(4, 18);
      const area = base * height;
      if (i % 2 === 0) {
        questions.push(`平行四邊形的面積是 ${area} 平方公分，底是 ${base} 公分，高是多少公分？`);
        summaryAnswers.push(`${height} 公分`);
        answers.push(e519Answer(`${height} 公分`, `高 = 面積 ÷ 底，所以 ${area} ÷ ${base} = ${height} 公分。`));
      } else {
        questions.push(`平行四邊形的面積是 ${area} 平方公分，高是 ${height} 公分，底是多少公分？`);
        summaryAnswers.push(`${base} 公分`);
        answers.push(e519Answer(`${base} 公分`, `底 = 面積 ÷ 高，所以 ${area} ÷ ${height} = ${base} 公分。`));
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519ParallelogramScaleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const ratios = [2, 3, 4, 5];
    for (let i = 0; i < count; i += 1) {
      const k = pickFromList(ratios);
      questions.push(`一個平行四邊形的底不變，高變成原來的 ${k} 倍，面積會變成原來的幾倍？`);
      summaryAnswers.push(`${k} 倍`);
      answers.push(e519Answer(`${k} 倍`, `面積 = 底 × 高。底不變時，高變成 ${k} 倍，面積也會變成 ${k} 倍。`));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519ParallelogramEqualAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = randInt(8, 24);
      const height = randInt(4, 16);
      const area = base * height;
      if (i % 2 === 0) {
        questions.push(
          `甲、乙兩個平行四邊形的底和高都分別相等。若甲的底是 ${base} 公分、高是 ${height} 公分，乙的形狀雖然不同，但底和高與甲相同，兩者面積是否相等？`
        );
        summaryAnswers.push('相等');
        answers.push(
          e519Answer(
            '相等',
            `只要底和高分別相等，面積就相等。甲的面積是 ${base} × ${height} = ${area}，乙也一樣，所以相等。`
          )
        );
      } else {
        const rectArea = area;
        questions.push(
          `一個長方形長 ${base} 公分、寬 ${height} 公分；另一個平行四邊形底是 ${base} 公分、高是 ${height} 公分。哪一個面積較大？`
        );
        summaryAnswers.push('一樣大');
        answers.push(
          e519Answer(
            '一樣大',
            `長方形面積是 ${base} × ${height} = ${rectArea}，平行四邊形面積也是 ${base} × ${height} = ${rectArea}，所以一樣大。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519ParallelogramCompositeSet(count) {
    return buildE518MixedSet(
      [
        buildE519ParallelogramDirectSet,
        buildE519ParallelogramReverseSet,
        buildE519ParallelogramScaleSet,
        buildE519ParallelogramEqualAreaSet,
      ],
      count
    );
  }

  function buildE519TriangleDirectSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = randInt(6, 40);
      const height = randInt(4, 24);
      const area = (base * height) / 2;
      if (i % 2 === 0) {
        questions.push(`三角形的底是 ${base} 公分，高是 ${height} 公分，面積是多少平方公分？`);
      } else {
        questions.push(`一個三角形底是 ${base} 公尺，高是 ${height} 公尺，面積是多少平方公尺？`);
      }
      summaryAnswers.push(`${area} ${i % 2 === 0 ? '平方公分' : '平方公尺'}`);
      answers.push(
        e519Answer(
          `${area} ${i % 2 === 0 ? '平方公分' : '平方公尺'}`,
          `三角形面積 = 底 × 高 ÷ 2，所以 ${base} × ${height} ÷ 2 = ${area}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519TriangleReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = randInt(4, 24);
      const height = randInt(4, 18);
      const area = (base * height) / 2;
      if (i % 2 === 0) {
        questions.push(`三角形面積是 ${area} 平方公分，底是 ${base} 公分，高是多少公分？`);
        summaryAnswers.push(`${height} 公分`);
        answers.push(
          e519Answer(
            `${height} 公分`,
            `先用面積公式倒推：高 = 面積 × 2 ÷ 底，所以 ${area} × 2 ÷ ${base} = ${height} 公分。`
          )
        );
      } else {
        questions.push(`三角形面積是 ${area} 平方公分，高是 ${height} 公分，底是多少公分？`);
        summaryAnswers.push(`${base} 公分`);
        answers.push(e519Answer(`${base} 公分`, `底 = 面積 × 2 ÷ 高，所以 ${area} × 2 ÷ ${height} = ${base} 公分。`));
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519TriangleScaleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const ratios = [2, 3, 4, 5];
    for (let i = 0; i < count; i += 1) {
      const k = pickFromList(ratios);
      if (i % 2 === 0) {
        questions.push(`三角形的底不變，高變成原來的 ${k} 倍，面積會變成原來的幾倍？`);
        summaryAnswers.push(`${k} 倍`);
        answers.push(
          e519Answer(`${k} 倍`, `三角形面積 = 底 × 高 ÷ 2。底不變時，高變成 ${k} 倍，面積也會變成 ${k} 倍。`)
        );
      } else {
        const baseA = randInt(4, 12);
        const heightA = randInt(4, 12);
        const product = baseA * heightA;
        let baseB = randInt(4, 16);
        while (product % baseB !== 0) baseB = randInt(4, 16);
        const heightB = product / baseB;
        questions.push(
          `甲三角形的底、高分別是 ${baseA} 公分和 ${heightA} 公分；乙三角形的底、高分別是 ${baseB} 公分和 ${heightB} 公分。兩個三角形的面積是否相等？`
        );
        summaryAnswers.push('相等');
        answers.push(
          e519Answer(
            '相等',
            `三角形面積看底 × 高 ÷ 2。甲的底高乘積是 ${baseA} × ${heightA} = ${product}，乙的底高乘積是 ${baseB} × ${heightB} = ${product}，所以面積相等。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519TriangleEqualAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = randInt(6, 20);
      const height = randInt(4, 18);
      const rectArea = base * height;
      const triArea = rectArea / 2;
      questions.push(
        `一個長方形長 ${base} 公分、寬 ${height} 公分；另一個三角形底是 ${base} 公分、高是 ${height} 公分。哪一個面積較大？差多少平方公分？`
      );
      summaryAnswers.push(`長方形較大，差 ${triArea} 平方公分`);
      answers.push(
        e519Answer(
          `長方形較大，差 ${triArea} 平方公分`,
          `長方形面積是 ${base} × ${height} = ${rectArea}，三角形面積是 ${base} × ${height} ÷ 2 = ${triArea}，所以長方形較大，差 ${triArea} 平方公分。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519TriangleCompositeSet(count) {
    return buildE518MixedSet(
      [
        buildE519TriangleDirectSet,
        buildE519TriangleReverseSet,
        buildE519TriangleScaleSet,
        buildE519TriangleEqualAreaSet,
      ],
      count
    );
  }

  function buildE519TrapezoidDirectSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const upper = randInt(4, 18);
      const lower = randInt(upper + 2, upper + 20);
      const height = randInt(4, 16);
      const area = ((upper + lower) * height) / 2;
      questions.push(`梯形的上底是 ${upper} 公分，下底是 ${lower} 公分，高是 ${height} 公分，面積是多少平方公分？`);
      summaryAnswers.push(`${area} 平方公分`);
      answers.push(
        e519Answer(
          `${area} 平方公分`,
          `梯形面積 = （上底 + 下底）× 高 ÷ 2，所以 (${upper} + ${lower}) × ${height} ÷ 2 = ${area} 平方公分。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519TrapezoidApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const units = ['公尺', '公分'];
    const nouns = ['梯形田地', '梯形菜園', '梯形木板', '梯形地毯'];
    for (let i = 0; i < count; i += 1) {
      const upper = randInt(5, 16);
      const lower = randInt(upper + 3, upper + 20);
      const height = randInt(4, 15);
      const area = ((upper + lower) * height) / 2;
      const unit = pickFromList(units);
      const noun = pickFromList(nouns);
      questions.push(
        `一個${noun}的上底是 ${upper}${unit}，下底是 ${lower}${unit}，高是 ${height}${unit}，面積是多少平方${unit}？`
      );
      summaryAnswers.push(`${area} 平方${unit}`);
      answers.push(
        e519Answer(
          `${area} 平方${unit}`,
          `套用梯形面積公式：(${upper} + ${lower}) × ${height} ÷ 2 = ${area}，所以面積是 ${area} 平方${unit}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519TrapezoidRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const trapArea = pickFromList([24, 36, 48, 60, 72, 84, 96, 108]);
        const paraArea = trapArea * 2;
        questions.push(
          `兩個全等梯形拼成一個平行四邊形後，平行四邊形面積是 ${paraArea} 平方公分。求其中一個梯形的面積。`
        );
        summaryAnswers.push(`${trapArea} 平方公分`);
        answers.push(
          e519Answer(
            `${trapArea} 平方公分`,
            `兩個全等梯形拼成的平行四邊形面積是兩個梯形面積總和，所以一個梯形面積 = ${paraArea} ÷ 2 = ${trapArea} 平方公分。`
          )
        );
      } else {
        const upper = randInt(4, 12);
        const lower = randInt(upper + 4, upper + 16);
        const height = randInt(4, 14);
        const paraBase = upper + lower;
        const paraArea = paraBase * height;
        const trapArea = paraArea / 2;
        questions.push(
          `兩個全等梯形可以拼成一個底是 ${paraBase} 公分、高是 ${height} 公分的平行四邊形。求其中一個梯形的面積。`
        );
        summaryAnswers.push(`${trapArea} 平方公分`);
        answers.push(
          e519Answer(
            `${trapArea} 平方公分`,
            `先算拼成的平行四邊形面積：${paraBase} × ${height} = ${paraArea}。一個梯形是它的一半，所以面積是 ${paraArea} ÷ 2 = ${trapArea} 平方公分。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519TrapezoidScaleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const ratios = [2, 3, 4];
    for (let i = 0; i < count; i += 1) {
      const k = pickFromList(ratios);
      if (i % 2 === 0) {
        questions.push(`梯形的上底與下底都不變，高變成原來的 ${k} 倍，面積會變成原來的幾倍？`);
        summaryAnswers.push(`${k} 倍`);
        answers.push(
          e519Answer(
            `${k} 倍`,
            `梯形面積 = （上底 + 下底）× 高 ÷ 2。當上底和下底不變時，高變成 ${k} 倍，面積也會變成 ${k} 倍。`
          )
        );
      } else {
        const upper = randInt(5, 15);
        const lower = randInt(upper + 3, upper + 18);
        const height = randInt(4, 15);
        const area = ((upper + lower) * height) / 2;
        questions.push(`一個梯形的面積是 ${area} 平方公分，上底與下底的和是 ${upper + lower} 公分，高是多少公分？`);
        summaryAnswers.push(`${height} 公分`);
        answers.push(
          e519Answer(
            `${height} 公分`,
            `由梯形面積公式可得 高 = 面積 × 2 ÷（上底 + 下底），所以 ${area} × 2 ÷ ${upper + lower} = ${height} 公分。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519TrapezoidCompositeSet(count) {
    return buildE518MixedSet(
      [
        buildE519TrapezoidDirectSet,
        buildE519TrapezoidApplicationSet,
        buildE519TrapezoidRelationSet,
        buildE519TrapezoidScaleSet,
      ],
      count
    );
  }

  function buildE519CompositeAddSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const rectL = randInt(8, 20);
        const rectW = randInt(4, 12);
        const triB = randInt(6, 18);
        const triH = randInt(4, 12);
        const area = rectL * rectW + (triB * triH) / 2;
        questions.push(
          `一個圖形由一個長方形和一個三角形組成。長方形長 ${rectL} 公分、寬 ${rectW} 公分；三角形底 ${triB} 公分、高 ${triH} 公分。求總面積。`
        );
        summaryAnswers.push(`${area} 平方公分`);
        answers.push(
          e519Answer(
            `${area} 平方公分`,
            `長方形面積 ${rectL} × ${rectW} = ${rectL * rectW}，三角形面積 ${triB} × ${triH} ÷ 2 = ${(triB * triH) / 2}，相加得 ${area} 平方公分。`
          )
        );
      } else {
        const pBase = randInt(8, 18);
        const pHeight = randInt(4, 12);
        const triB = randInt(6, 16);
        const triH = randInt(4, 10);
        const area = pBase * pHeight + (triB * triH) / 2;
        questions.push(
          `一個圖形由一個平行四邊形和一個三角形組成。平行四邊形底 ${pBase} 公分、高 ${pHeight} 公分；三角形底 ${triB} 公分、高 ${triH} 公分。求總面積。`
        );
        summaryAnswers.push(`${area} 平方公分`);
        answers.push(
          e519Answer(
            `${area} 平方公分`,
            `平行四邊形面積 ${pBase} × ${pHeight} = ${pBase * pHeight}，三角形面積 ${triB} × ${triH} ÷ 2 = ${(triB * triH) / 2}，相加得 ${area} 平方公分。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519CompositeSubtractSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const rectL = randInt(12, 30);
        const rectW = randInt(8, 20);
        const triB = randInt(4, rectL - 2);
        const triH = randInt(4, rectW - 1);
        const area = rectL * rectW - (triB * triH) / 2;
        questions.push(
          `一個長方形面積要扣掉內部一個白色三角形。長方形長 ${rectL} 公分、寬 ${rectW} 公分；白色三角形底 ${triB} 公分、高 ${triH} 公分。求剩下的面積。`
        );
        summaryAnswers.push(`${area} 平方公分`);
        answers.push(
          e519Answer(
            `${area} 平方公分`,
            `先算大長方形面積 ${rectL} × ${rectW} = ${rectL * rectW}，再減掉白色三角形面積 ${triB} × ${triH} ÷ 2 = ${(triB * triH) / 2}，得到 ${area} 平方公分。`
          )
        );
      } else {
        const trapU = randInt(6, 14);
        const trapL = randInt(trapU + 4, trapU + 18);
        const trapH = randInt(4, 14);
        const square = randInt(2, 8);
        const trapArea = ((trapU + trapL) * trapH) / 2;
        const area = trapArea - square * square;
        questions.push(
          `一個大梯形內部挖去一個小正方形。梯形上底 ${trapU} 公分、下底 ${trapL} 公分、高 ${trapH} 公分；小正方形邊長 ${square} 公分。求剩下面積。`
        );
        summaryAnswers.push(`${area} 平方公分`);
        answers.push(
          e519Answer(
            `${area} 平方公分`,
            `梯形面積是 (${trapU} + ${trapL}) × ${trapH} ÷ 2 = ${trapArea}，小正方形面積是 ${square} × ${square} = ${square * square}，相減得 ${area} 平方公分。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519CompositeTranslationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const rectL = randInt(18, 40);
      const rectW = randInt(12, 24);
      const roadBase = randInt(6, Math.max(8, rectL - 6));
      const roadHeight = randInt(2, Math.max(3, rectW - 4));
      const remain = rectL * rectW - roadBase * roadHeight;
      questions.push(
        `一塊長方形花圃長 ${rectL} 公尺、寬 ${rectW} 公尺，中間開了一條平行四邊形道路，道路的底是 ${roadBase} 公尺、高是 ${roadHeight} 公尺。求剩下種花區域的面積。`
      );
      summaryAnswers.push(`${remain} 平方公尺`);
      answers.push(
        e519Answer(
          `${remain} 平方公尺`,
          `整塊花圃面積是 ${rectL} × ${rectW} = ${rectL * rectW}，道路面積是 ${roadBase} × ${roadHeight} = ${roadBase * roadHeight}，剩下面積 = ${rectL * rectW} - ${roadBase * roadHeight} = ${remain} 平方公尺。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519CompositeRuleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const triBase = randInt(4, 12);
      const triHeight = randInt(4, 12);
      const triArea = (triBase * triHeight) / 2;
      const triCount = pickFromList([3, 4, 5, 6]);
      const rectL = randInt(6, 18);
      const rectW = randInt(4, 10);
      const area = triArea * triCount + rectL * rectW;
      questions.push(
        `一個規則拼組圖形由 ${triCount} 個全等三角形與 1 個長方形組成。每個三角形的底是 ${triBase} 公分、高是 ${triHeight} 公分；長方形長 ${rectL} 公分、寬 ${rectW} 公分。求整個圖形面積。`
      );
      summaryAnswers.push(`${area} 平方公分`);
      answers.push(
        e519Answer(
          `${area} 平方公分`,
          `每個三角形面積是 ${triBase} × ${triHeight} ÷ 2 = ${triArea}，${triCount} 個共 ${triArea * triCount} 平方公分；長方形面積是 ${rectL} × ${rectW} = ${rectL * rectW}，相加得 ${area} 平方公分。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE519CompositeFourSet(count) {
    return buildE518MixedSet(
      [
        buildE519CompositeAddSet,
        buildE519CompositeSubtractSet,
        buildE519CompositeTranslationSet,
        buildE519CompositeRuleSet,
      ],
      count
    );
  }

  function e510Answer(shortAnswer, process) {
    return formatPracticeShortAnswer(shortAnswer, process);
  }

  function e510PolygonName(sides) {
    const names = {
      3: '三角形',
      4: '四邊形',
      5: '五邊形',
      6: '六邊形',
      7: '七邊形',
      8: '八邊形',
      9: '九邊形',
      10: '十邊形',
      12: '十二邊形',
    };
    return names[sides] || `${sides} 邊形`;
  }

  function e510PrismName(sides) {
    const names = {
      3: '三角柱',
      4: '四角柱',
      5: '五角柱',
      6: '六角柱',
      7: '七角柱',
      8: '八角柱',
      9: '九角柱',
      10: '十角柱',
      12: '十二角柱',
    };
    return names[sides] || `${sides} 角柱`;
  }

  function e510PyramidName(sides) {
    const names = {
      3: '三角錐',
      4: '四角錐',
      5: '五角錐',
      6: '六角錐',
      7: '七角錐',
      8: '八角錐',
      9: '九角錐',
      10: '十角錐',
      12: '十二角錐',
    };
    return names[sides] || `${sides} 角錐`;
  }

  function buildE510PrismNamingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const sidesList = [3, 4, 5, 6, 8];
    for (let i = 0; i < count; i += 1) {
      const sides = pickFromList(sidesList);
      const base = e510PolygonName(sides);
      const name = e510PrismName(sides);
      if (i % 2 === 0) {
        questions.push(`一個柱體的底面是${base}，這個柱體叫作什麼？`);
        answers.push(e510Answer(name, `柱體依底面形狀命名，底面是${base}，所以叫作${name}。`));
      } else {
        questions.push(`一個立體有兩個互相平行且全等的${base}底面，側面都是長方形。它是什麼柱體？`);
        answers.push(
          e510Answer(name, `有兩個互相平行且全等的底面，側面是長方形，這是柱體；底面是${base}，所以是${name}。`)
        );
      }
      summaryAnswers.push(name);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510PrismElementsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const sidesList = [3, 4, 5, 6, 8, 9];
    for (let i = 0; i < count; i += 1) {
      const sides = pickFromList(sidesList);
      const faces = sides + 2;
      const vertices = sides * 2;
      const edges = sides * 3;
      const name = e510PrismName(sides);
      questions.push(`${name}有幾個面、幾個頂點和幾條邊？`);
      summaryAnswers.push(`${faces} 個面、${vertices} 個頂點、${edges} 條邊`);
      answers.push(
        e510Answer(
          `${faces} 個面、${vertices} 個頂點、${edges} 條邊`,
          `柱體若底面有 ${sides} 條邊，則面數 = ${sides} + 2 = ${faces}，頂點數 = ${sides} × 2 = ${vertices}，邊數 = ${sides} × 3 = ${edges}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510PrismFaceRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const sidesList = [3, 4, 5, 6, 8];
    for (let i = 0; i < count; i += 1) {
      const sides = pickFromList(sidesList);
      const name = e510PrismName(sides);
      if (i % 2 === 0) {
        questions.push(`${name}的兩個底面有什麼關係？`);
        summaryAnswers.push('互相平行且全等');
        answers.push(
          e510Answer('互相平行且全等', `柱體的兩個底面形狀與大小相同，而且位置互相平行，所以是互相平行且全等。`)
        );
      } else {
        questions.push(`${name}中，底面和側面通常是互相平行還是互相垂直？`);
        summaryAnswers.push('互相垂直');
        answers.push(
          e510Answer('互相垂直', `直柱體的側面從底面邊往上延伸，底面與側面相交成直角，所以通常說底面和側面互相垂直。`)
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510PrismReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const sidesList = [3, 4, 5, 6, 8, 10];
    for (let i = 0; i < count; i += 1) {
      const sides = pickFromList(sidesList);
      const name = e510PrismName(sides);
      if (i % 2 === 0) {
        const vertices = sides * 2;
        questions.push(`一個柱體有 ${vertices} 個頂點，它的底面是什麼形狀？這個柱體叫作什麼？`);
        summaryAnswers.push(`${e510PolygonName(sides)}，${name}`);
        answers.push(
          e510Answer(
            `${e510PolygonName(sides)}，${name}`,
            `柱體頂點數 = 底面邊數 × 2，所以底面邊數 = ${vertices} ÷ 2 = ${sides}，底面是${e510PolygonName(sides)}，柱體是${name}。`
          )
        );
      } else {
        const edges = sides * 3;
        questions.push(`一個柱體有 ${edges} 條邊，它的底面有幾條邊？這個柱體叫作什麼？`);
        summaryAnswers.push(`${sides} 條邊，${name}`);
        answers.push(
          e510Answer(
            `${sides} 條邊，${name}`,
            `柱體邊數 = 底面邊數 × 3，所以底面邊數 = ${edges} ÷ 3 = ${sides}，這個柱體是${name}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510PrismMixedSet(count) {
    return buildE518MixedSet(
      [buildE510PrismNamingSet, buildE510PrismElementsSet, buildE510PrismFaceRelationSet, buildE510PrismReverseSet],
      count
    );
  }

  function buildE510PyramidNamingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const sidesList = [3, 4, 5, 6, 8, 12];
    for (let i = 0; i < count; i += 1) {
      const sides = pickFromList(sidesList);
      const base = e510PolygonName(sides);
      const name = e510PyramidName(sides);
      questions.push(`一個錐體的底面是${base}，這個錐體叫作什麼？`);
      summaryAnswers.push(name);
      answers.push(e510Answer(name, `錐體依底面形狀命名。底面是${base}，所以叫作${name}。`));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510PyramidElementsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const sidesList = [3, 4, 5, 6, 7, 9, 10];
    for (let i = 0; i < count; i += 1) {
      const sides = pickFromList(sidesList);
      const faces = sides + 1;
      const vertices = sides + 1;
      const edges = sides * 2;
      const name = e510PyramidName(sides);
      questions.push(`${name}有幾個面、幾個頂點和幾條邊？`);
      summaryAnswers.push(`${faces} 個面、${vertices} 個頂點、${edges} 條邊`);
      answers.push(
        e510Answer(
          `${faces} 個面、${vertices} 個頂點、${edges} 條邊`,
          `錐體若底面有 ${sides} 條邊，則面數 = ${sides} + 1 = ${faces}，頂點數 = ${sides} + 1 = ${vertices}，邊數 = ${sides} × 2 = ${edges}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510PyramidFaceRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const sidesList = [3, 4, 5, 6, 8];
    for (let i = 0; i < count; i += 1) {
      const sides = pickFromList(sidesList);
      const name = e510PyramidName(sides);
      if (i % 2 === 0) {
        questions.push(`${name}的側面是什麼形狀？側面有幾個？`);
        summaryAnswers.push(`三角形，${sides} 個`);
        answers.push(
          e510Answer(
            `三角形，${sides} 個`,
            `錐體的每個側面都是三角形，側面個數和底面邊數相同。${name}的底面有 ${sides} 條邊，所以有 ${sides} 個三角形側面。`
          )
        );
      } else {
        questions.push(`${name}有沒有兩個互相平行的底面？`);
        summaryAnswers.push('沒有');
        answers.push(e510Answer('沒有', `錐體只有一個底面和一個尖端，和柱體不同，所以沒有兩個互相平行的底面。`));
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510PyramidReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const sidesList = [3, 4, 5, 6, 8, 12];
    for (let i = 0; i < count; i += 1) {
      const sides = pickFromList(sidesList);
      const name = e510PyramidName(sides);
      if (i % 2 === 0) {
        const vertices = sides + 1;
        questions.push(`一個錐體有 ${vertices} 個頂點，它的底面是什麼形狀？這個錐體叫作什麼？`);
        summaryAnswers.push(`${e510PolygonName(sides)}，${name}`);
        answers.push(
          e510Answer(
            `${e510PolygonName(sides)}，${name}`,
            `錐體頂點數 = 底面邊數 + 1，所以底面邊數 = ${vertices} - 1 = ${sides}，底面是${e510PolygonName(sides)}，這個錐體是${name}。`
          )
        );
      } else {
        const edges = sides * 2;
        questions.push(`一個錐體有 ${edges} 條邊，它有幾個側面？是什麼錐體？`);
        summaryAnswers.push(`${sides} 個側面，${name}`);
        answers.push(
          e510Answer(
            `${sides} 個側面，${name}`,
            `錐體邊數 = 底面邊數 × 2，所以底面邊數 = ${edges} ÷ 2 = ${sides}。側面個數也是 ${sides} 個，因此是${name}。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510PyramidMixedSet(count) {
    return buildE518MixedSet(
      [
        buildE510PyramidNamingSet,
        buildE510PyramidElementsSet,
        buildE510PyramidFaceRelationSet,
        buildE510PyramidReverseSet,
      ],
      count
    );
  }

  function buildE510CuboidFaceRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const relations = [
      ['長方體中，相鄰的兩個面通常有什麼關係？', '互相垂直', '長方體的相鄰面共用一條邊，並形成直角，所以互相垂直。'],
      ['長方體中，相對的兩個面通常有什麼關係？', '互相平行', '長方體的相對面不相交，而且方向相同，所以互相平行。'],
      ['正方體中，頂面和底面有什麼關係？', '互相平行', '正方體也是長方體的一種，頂面和底面是相對面，所以互相平行。'],
      ['正方體中，側面和底面通常有什麼關係？', '互相垂直', '正方體的側面立在底面上，兩面相交成直角，所以互相垂直。'],
    ];
    for (let i = 0; i < count; i += 1) {
      const item = relations[i % relations.length];
      questions.push(item[0]);
      summaryAnswers.push(item[1]);
      answers.push(e510Answer(item[1], item[2]));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510CuboidCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      [
        '長方體中，與一個指定面互相垂直的面有幾個？',
        '4 個',
        '長方體共有 6 個面。與指定面相對的 1 個面互相平行，剩下圍在四周的 4 個面都與它互相垂直。',
      ],
      [
        '長方體中，與一個指定面互相平行的面有幾個？',
        '1 個',
        '長方體每個面都有一個相對面，這個相對面和它互相平行，所以是 1 個。',
      ],
      ['正方體中，和底面互相垂直的面有幾個？', '4 個', '正方體底面四周的 4 個側面都和底面互相垂直。'],
      [
        '四角錐中，和底面互相平行的面有幾個？',
        '0 個',
        '錐體只有一個底面，其餘側面都接到尖端，沒有另一個面和底面互相平行。',
      ],
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      questions.push(item[0]);
      summaryAnswers.push(item[1]);
      answers.push(e510Answer(item[1], item[2]));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510CuboidEverydaySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      ['教室的天花板和地板', '互相平行', '天花板和地板是上下相對的平面，方向相同且不相交，所以互相平行。'],
      ['教室的牆面和地板', '互相垂直', '牆面立在地板上，兩個平面形成直角，所以互相垂直。'],
      ['書櫃的層板和左右側板', '互相垂直', '層板是水平面，左右側板是直立面，兩者相交成直角，所以互相垂直。'],
      ['長方體盒子的前面和後面', '互相平行', '前面和後面是相對面，方向相同且不相交，所以互相平行。'],
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      questions.push(`${item[0]}通常是互相平行還是互相垂直？`);
      summaryAnswers.push(item[1]);
      answers.push(e510Answer(item[1], item[2]));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510CuboidMixedSet(count) {
    return buildE518MixedSet(
      [buildE510CuboidFaceRelationSet, buildE510CuboidCountSet, buildE510CuboidEverydaySet],
      count
    );
  }

  function buildE510SpherePartsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const radius = pickFromList([3, 4, 5, 6, 8, 10, 12]);
      const diameter = radius * 2;
      if (i % 2 === 0) {
        questions.push(`一顆球的半徑是 ${radius} 公分，它的直徑是多少公分？`);
        summaryAnswers.push(`${diameter} 公分`);
        answers.push(e510Answer(`${diameter} 公分`, `直徑 = 半徑 × 2，所以 ${radius} × 2 = ${diameter} 公分。`));
      } else {
        questions.push(`一顆球的直徑是 ${diameter} 公分，它的半徑是多少公分？`);
        summaryAnswers.push(`${radius} 公分`);
        answers.push(e510Answer(`${radius} 公分`, `半徑 = 直徑 ÷ 2，所以 ${diameter} ÷ 2 = ${radius} 公分。`));
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510SphereSectionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      [
        '通過球心的平面切球，切面是什麼形狀？',
        '圓形',
        '球被平面切開時，切面會是圓形；若平面通過球心，得到的是最大的圓。',
      ],
      ['一顆球任意切開，切面可能是什麼形狀？', '圓形', '球從任何方向被平面切開，切面都是圓形，只是圓的大小可能不同。'],
      ['通過球心的切面，其直徑和球的直徑有什麼關係？', '一樣長', '通過球心的切面是最大圓，這個圓的直徑就是球的直徑。'],
      [
        '沒有通過球心的切面，半徑會比球的半徑大、相等還是小？',
        '較小',
        '離球心越遠的切面越小；沒有通過球心時，切面圓的半徑比球的半徑小。',
      ],
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      questions.push(item[0]);
      summaryAnswers.push(item[1]);
      answers.push(e510Answer(item[1], item[2]));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510SphereCylinderSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const radius = pickFromList([3, 4, 5, 6, 8, 10]);
      const balls = pickFromList([3, 4, 5, 6]);
      const diameter = radius * 2;
      const height = diameter * balls;
      if (i % 2 === 0) {
        questions.push(
          `一個圓筒剛好裝滿 ${balls} 顆直徑 ${diameter} 公分的球，球上下排成一直線，圓筒的高度是多少公分？`
        );
        summaryAnswers.push(`${height} 公分`);
        answers.push(
          e510Answer(
            `${height} 公分`,
            `每顆球占一個直徑的高度，${balls} 顆共 ${diameter} × ${balls} = ${height} 公分。`
          )
        );
      } else {
        questions.push(
          `一個圓筒剛好裝滿 ${balls} 顆半徑 ${radius} 公分的球，球上下排成一直線，圓筒底面的直徑是多少公分？`
        );
        summaryAnswers.push(`${diameter} 公分`);
        answers.push(
          e510Answer(
            `${diameter} 公分`,
            `圓筒底面剛好容納球的最寬處，所以底面直徑等於球的直徑：${radius} × 2 = ${diameter} 公分。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510SphereBoxSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const diameter = pickFromList([6, 8, 10, 12, 15, 20, 25]);
      const rows = pickFromList([2, 3, 4]);
      const cols = pickFromList([3, 4, 5]);
      const heightLayers = pickFromList([1, 2]);
      const length = diameter * cols;
      const width = diameter * rows;
      const height = diameter * heightLayers;
      questions.push(
        `長方體盒子剛好裝滿 ${rows} 排、每排 ${cols} 顆、共 ${heightLayers} 層的球。每顆球直徑 ${diameter} 公分，盒子的長、寬、高至少各是多少公分？`
      );
      summaryAnswers.push(`長 ${length} 公分、寬 ${width} 公分、高 ${height} 公分`);
      answers.push(
        e510Answer(
          `長 ${length} 公分、寬 ${width} 公分、高 ${height} 公分`,
          `每一個方向都用球的直徑累加：長 = ${diameter} × ${cols} = ${length}，寬 = ${diameter} × ${rows} = ${width}，高 = ${diameter} × ${heightLayers} = ${height}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510SphereMixedSet(count) {
    return buildE518MixedSet(
      [buildE510SpherePartsSet, buildE510SphereSectionSet, buildE510SphereCylinderSet, buildE510SphereBoxSet],
      count
    );
  }

  function buildE510NetSolidNameSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { parts: ['2 個圓形', '1 個長方形'], base: '圓形', answer: '圓柱' },
      { parts: ['1 個圓形', '1 個扇形'], base: '圓形', answer: '圓錐' },
      { parts: ['2 個三角形', '3 個長方形'], base: '三角形', answer: '三角柱' },
      { parts: ['2 個五邊形', '5 個長方形'], base: '五邊形', answer: '五角柱' },
      { parts: ['4 個三角形'], base: '三角形', answer: '三角錐' },
      { parts: ['1 個四邊形', '4 個三角形'], base: '四邊形', answer: '四角錐' },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      questions.push(`一個展開圖由 ${item.parts.join('、')} 組成，摺起來可能是哪一種立體？`);
      summaryAnswers.push(item.answer);
      answers.push(
        e510Answer(
          item.answer,
          `展開圖要看底面與側面。這組圖形的底面特徵是${item.base}，側面數量也符合${item.answer}，所以摺成${item.answer}。`
        )
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510NetElementCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const sidesList = [3, 4, 5, 6, 8, 10];
    for (let i = 0; i < count; i += 1) {
      const sides = pickFromList(sidesList);
      if (i % 2 === 0) {
        const sideFaces = sides;
        questions.push(`${e510PrismName(sides)}的展開圖中，側面應該由幾個長方形組成？`);
        summaryAnswers.push(`${sideFaces} 個`);
        answers.push(
          e510Answer(
            `${sideFaces} 個`,
            `柱體的每一條底邊對應一個側面長方形，所以側面長方形個數 = 底面邊數 = ${sides} 個。`
          )
        );
      } else {
        const sideFaces = sides;
        questions.push(`${e510PyramidName(sides)}的展開圖中，側面應該由幾個三角形組成？`);
        summaryAnswers.push(`${sideFaces} 個`);
        answers.push(
          e510Answer(
            `${sideFaces} 個`,
            `錐體的每一條底邊對應一個側面三角形，所以側面三角形個數 = 底面邊數 = ${sides} 個。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510NetEdgeMatchSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const sides = pickFromList([3, 4, 5, 6, 8]);
      const baseEdge = pickFromList([3, 4, 5, 6, 8, 10, 12]);
      const perimeter = sides * baseEdge;
      if (i % 2 === 0) {
        questions.push(
          `${e510PrismName(sides)}的底面每邊長 ${baseEdge} 公分。展開圖中一排側面長方形連起來的總長，應等於底面周長多少公分？`
        );
        summaryAnswers.push(`${perimeter} 公分`);
        answers.push(
          e510Answer(
            `${perimeter} 公分`,
            `柱體側面展開後會沿著底面周長排開，所以總長 = ${baseEdge} × ${sides} = ${perimeter} 公分。`
          )
        );
      } else {
        questions.push(
          `${e510PyramidName(sides)}的底面每邊長 ${baseEdge} 公分。展開圖中 ${sides} 個側面三角形與底面相接的邊，合起來長多少公分？`
        );
        summaryAnswers.push(`${perimeter} 公分`);
        answers.push(
          e510Answer(
            `${perimeter} 公分`,
            `每個側面三角形都有一條邊要貼到底面邊上，合起來就是底面周長：${baseEdge} × ${sides} = ${perimeter} 公分。`
          )
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510NetFaceRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      [
        '長方體展開圖中，兩個隔著一個面的長方形摺合後通常會成為什麼關係？',
        '互相平行',
        '長方體的相對面在摺合後互相平行，展開圖中被一個面隔開的兩面常對應到相對面。',
      ],
      ['柱體展開圖中，兩個底面摺合後有什麼關係？', '互相平行', '柱體的兩個底面摺合後位在上下兩側，互相平行且全等。'],
      [
        '五角柱展開圖中，側面和底面摺合後通常有什麼關係？',
        '互相垂直',
        '直柱體的側面摺起後立在底面邊上，所以側面和底面互相垂直。',
      ],
      [
        '圓柱展開圖中，側面長方形的長和底面圓的什麼量相等？',
        '圓周長',
        '圓柱側面展開成長方形，長方形的長剛好繞底面一圈，所以等於圓周長。',
      ],
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      questions.push(item[0]);
      summaryAnswers.push(item[1]);
      answers.push(e510Answer(item[1], item[2]));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE510NetMixedSet(count) {
    return buildE518MixedSet(
      [buildE510NetSolidNameSet, buildE510NetElementCountSet, buildE510NetEdgeMatchSet, buildE510NetFaceRelationSet],
      count
    );
  }

  function e521FormatNumber(value, digits = 2) {
    return trimDecimalString(Number(value.toFixed(digits)).toString());
  }

  function buildE521BasicVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const length = pickFromList([12, 15, 18, 20, 24, 25, 30, 36, 40, 45, 50, 60, 90]);
        const width = pickFromList([4, 5, 6, 8, 10, 12, 14, 16, 20]);
        const height = pickFromList([2, 3, 4, 5, 6, 8, 10]);
        const volume = length * width * height;
        questions.push(
          `一個長方體的長是 ${length} 公分、寬是 ${width} 公分、高是 ${height} 公分，它的體積是多少立方公分？`
        );
        summaryAnswers.push(`${volume}立方公分`);
        answers.push(
          `簡答：${volume}立方公分。過程：長方體體積 = 長 × 寬 × 高 = ${length} × ${width} × ${height} = ${volume}。`
        );
      } else {
        const side = pickFromList([4, 5, 6, 8, 10, 12, 14]);
        const volume = side * side * side;
        questions.push(`一個正方體的邊長是 ${side} 公分，體積是多少立方公分？`);
        summaryAnswers.push(`${volume}立方公分`);
        answers.push(
          `簡答：${volume}立方公分。過程：正方體體積 = 邊長 × 邊長 × 邊長 = ${side} × ${side} × ${side} = ${volume}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE521ReverseVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const length = pickFromList([6, 8, 9, 10, 12, 15]);
        const width = pickFromList([3, 4, 5, 6, 7, 8]);
        const height = pickFromList([2, 3, 4, 5, 6, 8]);
        const volume = length * width * height;
        questions.push(
          `一個長方體的體積是 ${volume} 立方公分，長 ${length} 公分、寬 ${width} 公分，它的高是多少公分？`
        );
        summaryAnswers.push(`${height}公分`);
        answers.push(`簡答：${height}公分。過程：高 = 體積 ÷ 長 ÷ 寬 = ${volume} ÷ ${length} ÷ ${width} = ${height}。`);
        continue;
      }
      if (mode === 1) {
        const side = pickFromList([3, 4, 5, 6, 8, 10, 12]);
        const volume = side * side * side;
        questions.push(`一個正方體的體積是 ${volume} 立方公分，它的邊長是多少公分？`);
        summaryAnswers.push(`${side}公分`);
        answers.push(
          `簡答：${side}公分。過程：正方體的邊長立方等於體積，因為 ${side} × ${side} × ${side} = ${volume}，所以邊長是 ${side} 公分。`
        );
        continue;
      }
      const sideA = pickFromList([6, 8, 10, 12]);
      const heightA = pickFromList([2, 3, 4, 5]);
      const volume = sideA * sideA * heightA;
      const lengthB = pickFromList([8, 10, 12, 15, 16, 20]);
      const widthB = pickFromList([2, 3, 4, 5, 6]);
      if (volume % (lengthB * widthB) !== 0) {
        i -= 1;
        continue;
      }
      const heightB = volume / (lengthB * widthB);
      questions.push(
        `甲正方柱底面邊長 ${sideA} 公分、高 ${heightA} 公分；乙長方體長 ${lengthB} 公分、寬 ${widthB} 公分。若兩者體積相同，乙的高是多少公分？`
      );
      summaryAnswers.push(`${heightB}公分`);
      answers.push(
        `簡答：${heightB}公分。過程：甲的體積 = ${sideA} × ${sideA} × ${heightA} = ${volume}。乙的高 = ${volume} ÷ ${lengthB} ÷ ${widthB} = ${heightB}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE521VolumeUnitConvertSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const m3 = pickFromList([3, 5, 9, 12, 15, 20, 25]);
        const cm3 = m3 * 1000000;
        questions.push(`${m3} 立方公尺等於多少立方公分？`);
        summaryAnswers.push(`${cm3}立方公分`);
        answers.push(`簡答：${cm3}立方公分。過程：1 立方公尺 = 1,000,000 立方公分，所以 ${m3} × 1,000,000 = ${cm3}。`);
        continue;
      }
      if (mode === 1) {
        const cm3 = pickFromList([12, 18, 25, 27]) * 1000000;
        const m3 = cm3 / 1000000;
        questions.push(`${cm3} 立方公分等於多少立方公尺？`);
        summaryAnswers.push(`${m3}立方公尺`);
        answers.push(`簡答：${m3}立方公尺。過程：1,000,000 立方公分 = 1 立方公尺，所以 ${cm3} ÷ 1,000,000 = ${m3}。`);
        continue;
      }
      if (mode === 2) {
        const sideCm = pickFromList([100, 120, 150, 200, 250, 300]);
        const sideM = sideCm / 100;
        const volume = sideM * sideM * sideM;
        questions.push(`一個邊長 ${sideCm} 公分的正方體，體積是多少立方公尺？`);
        summaryAnswers.push(`${e521FormatNumber(volume)}立方公尺`);
        answers.push(
          `簡答：${e521FormatNumber(volume)}立方公尺。過程：先換成公尺，邊長 = ${sideCm} ÷ 100 = ${sideM} 公尺，所以體積 = ${sideM} × ${sideM} × ${sideM} = ${e521FormatNumber(volume)}。`
        );
        continue;
      }
      const sideM = pickFromList([1, 1.2, 1.5, 2, 2.5, 3]);
      const volume = sideM * sideM * sideM * 1000000;
      questions.push(`一個邊長 ${sideM} 公尺的正方體，體積是多少立方公分？`);
      summaryAnswers.push(`${e521FormatNumber(volume, 0)}立方公分`);
      answers.push(
        `簡答：${e521FormatNumber(volume, 0)}立方公分。過程：先算體積 = ${sideM} × ${sideM} × ${sideM} = ${e521FormatNumber(sideM * sideM * sideM)} 立方公尺，再乘 1,000,000 變成立方公分，得到 ${e521FormatNumber(volume, 0)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE521CapacityConvertSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const m3 = pickFromList([2, 3, 5, 8, 10, 12, 15]);
        questions.push(`${m3} 立方公尺等於多少公升？`);
        summaryAnswers.push(`${m3 * 1000}公升`);
        answers.push(`簡答：${m3 * 1000}公升。過程：1 立方公尺 = 1000 公升，所以 ${m3} × 1000 = ${m3 * 1000}。`);
        continue;
      }
      if (mode === 1) {
        const liters = pickFromList([2000, 3500, 8000, 12000, 15000, 60000]);
        const m3 = liters / 1000;
        questions.push(`${liters} 公升等於多少立方公尺？`);
        summaryAnswers.push(`${e521FormatNumber(m3)}立方公尺`);
        answers.push(
          `簡答：${e521FormatNumber(m3)}立方公尺。過程：1000 公升 = 1 立方公尺，所以 ${liters} ÷ 1000 = ${e521FormatNumber(m3)}。`
        );
        continue;
      }
      if (mode === 2) {
        const degrees = pickFromList([12, 18, 25, 36, 53, 80]);
        questions.push(`某住家本月用了 ${degrees} 度水，這等於多少立方公尺的水？`);
        summaryAnswers.push(`${degrees}立方公尺`);
        answers.push(
          `簡答：${degrees}立方公尺。過程：1 度水就是 1 立方公尺，所以 ${degrees} 度水 = ${degrees} 立方公尺。`
        );
        continue;
      }
      const liters = pickFromList([3000, 6000, 9000, 15000, 24000]);
      const degrees = liters / 1000;
      questions.push(`${liters} 公升的水，也可以說是幾度水？`);
      summaryAnswers.push(`${e521FormatNumber(degrees)}度`);
      answers.push(
        `簡答：${e521FormatNumber(degrees)}度。過程：1000 公升 = 1 度水，所以 ${liters} ÷ 1000 = ${e521FormatNumber(degrees)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE521MixedUnitVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const lengthCm = pickFromList([120, 125, 150, 180, 200, 250]);
        const widthCm = pickFromList([40, 50, 60, 75, 80]);
        const heightM = pickFromList([1, 1.2, 1.5, 2, 2.5]);
        const heightCm = heightM * 100;
        const volume = lengthCm * widthCm * heightCm;
        questions.push(
          `一個長方體木箱，長 ${lengthCm} 公分、寬 ${widthCm} 公分、高 ${heightM} 公尺，體積是多少立方公分？`
        );
        summaryAnswers.push(`${e521FormatNumber(volume, 0)}立方公分`);
        answers.push(
          `簡答：${e521FormatNumber(volume, 0)}立方公分。過程：先把高換成公分，${heightM} 公尺 = ${heightCm} 公分，所以體積 = ${lengthCm} × ${widthCm} × ${heightCm} = ${e521FormatNumber(volume, 0)}。`
        );
        continue;
      }
      if (mode === 1) {
        const lengthM = pickFromList([2, 2.4, 3, 4, 4.5, 6]);
        const widthM = pickFromList([1.5, 2, 2.5, 3, 3.5]);
        const heightCm = pickFromList([80, 100, 120, 150, 200]);
        const heightM = heightCm / 100;
        const volume = lengthM * widthM * heightM;
        questions.push(
          `一個長方體水池，長 ${lengthM} 公尺、寬 ${widthM} 公尺、高 ${heightCm} 公分，體積是多少立方公尺？`
        );
        summaryAnswers.push(`${e521FormatNumber(volume)}立方公尺`);
        answers.push(
          `簡答：${e521FormatNumber(volume)}立方公尺。過程：先把高換成公尺，${heightCm} 公分 = ${heightM} 公尺，所以體積 = ${lengthM} × ${widthM} × ${heightM} = ${e521FormatNumber(volume)}。`
        );
        continue;
      }
      const lengthM = pickFromList([1.2, 1.5, 2, 2.5]);
      const widthCm = pickFromList([40, 50, 60, 80, 100]);
      const heightCm = pickFromList([30, 40, 50, 70, 90]);
      const volumeCm3 = lengthM * 100 * widthCm * heightCm;
      questions.push(`一個櫃子長 ${lengthM} 公尺、寬 ${widthCm} 公分、高 ${heightCm} 公分，體積是多少立方公分？`);
      summaryAnswers.push(`${e521FormatNumber(volumeCm3, 0)}立方公分`);
      answers.push(
        `簡答：${e521FormatNumber(volumeCm3, 0)}立方公分。過程：先把長換成公分，${lengthM} 公尺 = ${lengthM * 100} 公分，所以體積 = ${lengthM * 100} × ${widthCm} × ${heightCm} = ${e521FormatNumber(volumeCm3, 0)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE521CuttingCompositeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 2;
      if (mode === 0) {
        const aL = pickFromList([8, 10, 12, 15]);
        const commonW = pickFromList([4, 5, 6, 8]);
        const aH = pickFromList([3, 4, 5, 6]);
        const bL = pickFromList([12, 15, 18, 20]);
        const bH = pickFromList([2, 3, 4, 5]);
        const volume = aL * commonW * aH + bL * commonW * bH;
        questions.push(
          `一個 L 形體由兩個長方體組成：第一個長方體長 ${aL} 公分、寬 ${commonW} 公分、高 ${aH} 公分；第二個長方體長 ${bL} 公分、寬 ${commonW} 公分、高 ${bH} 公分，求總體積。`
        );
        summaryAnswers.push(`${volume}立方公分`);
        answers.push(
          `簡答：${volume}立方公分。過程：分成兩塊長方體相加，體積 = ${aL} × ${commonW} × ${aH} + ${bL} × ${commonW} × ${bH} = ${volume}。`
        );
        continue;
      }
      const bottomL = pickFromList([10, 12, 15, 18]);
      const bottomW = pickFromList([6, 8, 10]);
      const bottomH = pickFromList([2, 3, 4]);
      const topL = pickFromList([4, 5, 6, 8]);
      const topW = bottomW;
      const topH = pickFromList([2, 3, 4, 5]);
      const volume = bottomL * bottomW * bottomH + topL * topW * topH;
      questions.push(
        `一個階梯形體可看成上下兩個長方體：下層長 ${bottomL} 公分、寬 ${bottomW} 公分、高 ${bottomH} 公分；上層長 ${topL} 公分、寬 ${topW} 公分、高 ${topH} 公分，求體積。`
      );
      summaryAnswers.push(`${volume}立方公分`);
      answers.push(
        `簡答：${volume}立方公分。過程：下層體積 ${bottomL} × ${bottomW} × ${bottomH}，上層體積 ${topL} × ${topW} × ${topH}，相加得到 ${volume}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE521FillCutSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 2;
      if (mode === 0) {
        const outer = pickFromList([12, 15, 18, 20]);
        const cutL = pickFromList([4, 5, 6, 8]);
        const cutW = pickFromList([4, 5, 6]);
        const cutH = pickFromList([3, 4, 5, 6]);
        if (cutL >= outer || cutW >= outer || cutH >= outer) {
          i -= 1;
          continue;
        }
        const remain = outer * outer * outer - cutL * cutW * cutH;
        questions.push(
          `一個邊長 ${outer} 公分的正方體，角落被挖掉一個長 ${cutL} 公分、寬 ${cutW} 公分、高 ${cutH} 公分的小長方體，剩下的體積是多少？`
        );
        summaryAnswers.push(`${remain}立方公分`);
        answers.push(
          `簡答：${remain}立方公分。過程：先算大正方體體積 ${outer} × ${outer} × ${outer} = ${outer * outer * outer}，再扣掉缺口 ${cutL} × ${cutW} × ${cutH} = ${cutL * cutW * cutH}，所以剩下 ${remain}。`
        );
        continue;
      }
      const outerL = pickFromList([20, 24, 30, 36]);
      const outerW = pickFromList([12, 15, 18, 20]);
      const outerH = pickFromList([6, 8, 10, 12]);
      const cutL = pickFromList([6, 8, 10, 12]);
      const cutW = pickFromList([4, 5, 6, 8]);
      const cutH = pickFromList([2, 3, 4, 5]);
      if (cutL >= outerL || cutW >= outerW || cutH >= outerH) {
        i -= 1;
        continue;
      }
      const remain = outerL * outerW * outerH - cutL * cutW * cutH;
      questions.push(
        `一個長方體長 ${outerL} 公分、寬 ${outerW} 公分、高 ${outerH} 公分，中間挖掉一個長 ${cutL} 公分、寬 ${cutW} 公分、高 ${cutH} 公分的缺口，剩餘體積是多少？`
      );
      summaryAnswers.push(`${remain}立方公分`);
      answers.push(
        `簡答：${remain}立方公分。過程：原來體積 = ${outerL} × ${outerW} × ${outerH} = ${outerL * outerW * outerH}，缺口體積 = ${cutL} × ${cutW} × ${cutH} = ${cutL * cutW * cutH}，相減得 ${remain}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE521WaterDisplacementSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const length = pickFromList([12, 15, 18, 20, 24]);
        const width = pickFromList([8, 10, 12, 15]);
        const rise = pickFromList([1, 2, 3, 4, 5]);
        const volume = length * width * rise;
        questions.push(
          `底面長 ${length} 公分、寬 ${width} 公分的長方體容器，放入石頭後水面上升 ${rise} 公分，石頭的體積是多少立方公分？`
        );
        summaryAnswers.push(`${volume}立方公分`);
        answers.push(
          `簡答：${volume}立方公分。過程：排開水的體積 = 底面積 × 上升高度 = (${length} × ${width}) × ${rise} = ${volume}。`
        );
        continue;
      }
      if (mode === 1) {
        const side = pickFromList([12, 15, 18, 20]);
        const rise = pickFromList([1, 2, 3, 4]);
        const countStone = pickFromList([2, 3, 4, 5, 6]);
        const each = side * side * rise;
        const total = each * countStone;
        questions.push(
          `內部邊長 ${side} 公分的正方體容器，放入 ${countStone} 塊相同鐵塊後，水深共上升 ${rise} 公分。這 ${countStone} 塊鐵塊總體積是多少立方公分？`
        );
        summaryAnswers.push(`${total}立方公分`);
        answers.push(
          `簡答：${total}立方公分。過程：容器底面積 = ${side} × ${side} = ${side * side}，水位上升 ${rise} 公分，所以排水體積 = ${side * side} × ${rise} = ${each}。這就是 ${countStone} 塊總體積，共 ${total} 立方公分。`
        );
        continue;
      }
      const baseArea = pickFromList([12, 20, 24, 30, 36, 48]);
      const rise = pickFromList([2, 3, 4, 5, 6]);
      const pieces = pickFromList([2, 3, 4, 5]);
      const eachVolume = (baseArea * rise) / pieces;
      if (!Number.isInteger(eachVolume)) {
        i -= 1;
        continue;
      }
      questions.push(
        `底面積 ${baseArea} 平方公分的浴池放入 ${pieces} 個相同石塊後，水位共上升 ${rise} 公分。一個石塊的體積是多少立方公分？`
      );
      summaryAnswers.push(`${eachVolume}立方公分`);
      answers.push(
        `簡答：${eachVolume}立方公分。過程：總排水體積 = ${baseArea} × ${rise} = ${baseArea * rise} 立方公分，再平均分給 ${pieces} 個石塊，所以一個石塊體積 = ${baseArea * rise} ÷ ${pieces} = ${eachVolume}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE521ThicknessCapacitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 2;
      if (mode === 0) {
        const outerL = pickFromList([24, 30, 36, 42]);
        const outerW = pickFromList([18, 21, 24, 27]);
        const outerH = pickFromList([20, 24, 28, 31]);
        const t = pickFromList([1, 2, 3]);
        if (outerL <= 2 * t || outerW <= 2 * t || outerH <= 2 * t) {
          i -= 1;
          continue;
        }
        const innerL = outerL - 2 * t;
        const innerW = outerW - 2 * t;
        const innerH = outerH - 2 * t;
        const volume = innerL * innerW * innerH;
        questions.push(
          `一個有蓋長方體容器，外面長 ${outerL} 公分、寬 ${outerW} 公分、高 ${outerH} 公分，容器厚度都是 ${t} 公分，容積是多少立方公分？`
        );
        summaryAnswers.push(`${volume}立方公分`);
        answers.push(
          `簡答：${volume}立方公分。過程：內部長寬高分別是 ${outerL} - 2×${t} = ${innerL}、${outerW} - 2×${t} = ${innerW}、${outerH} - 2×${t} = ${innerH}，所以容積 = ${innerL} × ${innerW} × ${innerH} = ${volume}。`
        );
        continue;
      }
      const outerL = pickFromList([20, 24, 26, 30, 35]);
      const outerW = pickFromList([15, 18, 21, 24]);
      const outerH = pickFromList([12, 15, 18, 20, 24]);
      const t = pickFromList([1, 2, 3]);
      if (outerL <= 2 * t || outerW <= 2 * t || outerH <= t) {
        i -= 1;
        continue;
      }
      const innerL = outerL - 2 * t;
      const innerW = outerW - 2 * t;
      const innerH = outerH - t;
      const volume = innerL * innerW * innerH;
      questions.push(
        `一個無蓋長方體收納盒，外面長 ${outerL} 公分、寬 ${outerW} 公分、高 ${outerH} 公分，盒壁與底厚都是 ${t} 公分，容積是多少立方公分？`
      );
      summaryAnswers.push(`${volume}立方公分`);
      answers.push(
        `簡答：${volume}立方公分。過程：無蓋盒的內部長寬各減 2 倍厚度，高只要扣底部厚度，所以內部尺寸是 ${innerL} × ${innerW} × ${innerH}，容積 = ${volume}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE521LargeContainerSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const length = pickFromList([20, 25, 30, 40]);
        const width = pickFromList([10, 12, 15, 20, 25]);
        const depth = pickFromList([1.5, 2, 2.5, 3]);
        const m3 = length * width * depth;
        const liters = m3 * 1000;
        questions.push(`一個長 ${length} 公尺、寬 ${width} 公尺、深 ${depth} 公尺的游泳池，裝滿水大約有多少公升？`);
        summaryAnswers.push(`${e521FormatNumber(liters, 0)}公升`);
        answers.push(
          `簡答：${e521FormatNumber(liters, 0)}公升。過程：先算體積 = ${length} × ${width} × ${depth} = ${e521FormatNumber(m3)} 立方公尺，再乘 1000 變成公升，得到 ${e521FormatNumber(liters, 0)} 公升。`
        );
        continue;
      }
      if (mode === 1) {
        const side = pickFromList([1, 1.5, 2, 2.5, 3]);
        const m3 = side * side * side;
        const liters = m3 * 1000;
        questions.push(`一個內部邊長 ${side} 公尺的正方體蓄水池，容量是多少公升？`);
        summaryAnswers.push(`${e521FormatNumber(liters, 0)}公升`);
        answers.push(
          `簡答：${e521FormatNumber(liters, 0)}公升。過程：體積 = ${side} × ${side} × ${side} = ${e521FormatNumber(m3)} 立方公尺，再換成公升是 ${e521FormatNumber(liters, 0)} 公升。`
        );
        continue;
      }
      const degrees = pickFromList([8, 12, 20, 35, 53, 80]);
      const liters = degrees * 1000;
      questions.push(`水費單上顯示本月用了 ${degrees} 度水，這等於多少公升的水？`);
      summaryAnswers.push(`${liters}公升`);
      answers.push(
        `簡答：${liters}公升。過程：1 度水 = 1 立方公尺 = 1000 公升，所以 ${degrees} 度 = ${degrees} × 1000 = ${liters} 公升。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE521MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const bank = banks[randInt(0, banks.length - 1)];
      const built = bank(1);
      questions.push(built.questions[0]);
      summaryAnswers.push((built.summaryAnswers || [''])[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE521BasicTwoSet(count) {
    return buildE521MixedSet([buildE521BasicVolumeSet, buildE521ReverseVolumeSet], count);
  }

  function buildE521ConvertThreeSet(count) {
    return buildE521MixedSet(
      [buildE521VolumeUnitConvertSet, buildE521CapacityConvertSet, buildE521MixedUnitVolumeSet],
      count
    );
  }

  function buildE521CompositeThreeSet(count) {
    return buildE521MixedSet([buildE521CuttingCompositeSet, buildE521FillCutSet, buildE521WaterDisplacementSet], count);
  }

  function buildE521AppliedTwoSet(count) {
    return buildE521MixedSet([buildE521ThicknessCapacitySet, buildE521LargeContainerSet], count);
  }

  const E619_LENGTH_TO_CM = {
    公分: 1,
    公尺: 100,
    公里: 100000,
  };

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

  function makeMixedFraction(whole, fracNum, den, negative = false) {
    const absWhole = Math.abs(whole);
    const num = absWhole * den + fracNum;
    return makeFraction(negative ? -num : num, den);
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  function formatPracticeShortAnswer(shortAnswer, process = '') {
    const shortText = String(shortAnswer || '').trim();
    const processText = String(process || '').trim();
    return processText ? `簡答：${shortText}\n過程：${processText}` : `簡答：${shortText}`;
  }

  const bundleFingerprint = 'e5-bundle-v20260619-v4';
  const nextConfigs = {
    'e5-2-5-chinese-convert-drill': {
      type: 'drill',
      title: '大數與中文讀法互換',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE525ChineseConvertSet(5);
      },
    },
    'e5-2-5-place-digit-drill': {
      type: 'drill',
      title: '位值與位名辨識',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE525PlaceDigitSet(5);
      },
    },
    'e5-2-5-unit-compose-drill': {
      type: 'drill',
      title: '大數合成與單位組成',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE525UnitComposeSet(5);
      },
    },
    'e5-2-5-expanded-notation-drill': {
      type: 'drill',
      title: '數的十進位表示法',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE525ExpandedNotationSet(5);
      },
    },
    'e5-2-5-place-ratio-drill': {
      type: 'drill',
      title: '位值間的倍數關係',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE525PlaceRatioSet(5);
      },
    },
    'e5-2-5-large-compare-drill': {
      type: 'drill',
      title: '大數大小比較與排序',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE525LargeCompareSet(5);
      },
    },
    'e5-2-5-trailing-zero-operation-drill': {
      type: 'drill',
      title: '末位有 0 的乘除運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE525TrailingZeroSet(5);
      },
    },
    'e5-2-5-line-single-read-drill': {
      type: 'drill',
      title: '折線圖單線讀值',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE525LineSingleReadSet(5);
      },
    },
    'e5-2-5-line-double-compare-drill': {
      type: 'drill',
      title: '折線圖雙線比較',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE525LineDoubleCompareSet(5);
      },
    },
    'e5-2-5-line-trend-drill': {
      type: 'drill',
      title: '折線圖趨勢判讀',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE525LineTrendSet(5);
      },
    },
    'e5-2-5-line-structure-drill': {
      type: 'drill',
      title: '折線圖結構與刻度理解',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE525LineStructureSet(5);
      },
    },
    'e5-2-5-line-condition-drill': {
      type: 'drill',
      title: '依條件查找折線圖資訊',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE525LineConditionSet(5);
      },
    },
    'e5-2-5-read-place-three-subtypes': {
      type: 'drill',
      title: '大數讀寫與位值三小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE525ReadPlaceThreeSet(5);
      },
    },
    'e5-2-5-structure-three-subtypes': {
      type: 'drill',
      title: '十進位與倍數三小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE525StructureThreeSet(5);
      },
    },
    'e5-2-5-compare-one-subtype': {
      type: 'drill',
      title: '大數大小比較與排序',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE525CompareOneSet(5);
      },
    },
    'e5-2-5-line-read-compare-two-subtypes': {
      type: 'drill',
      title: '折線圖讀值與比較二小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE525LineReadCompareTwoSet(5);
      },
    },
    'e5-2-5-line-trend-structure-two-subtypes': {
      type: 'drill',
      title: '折線圖趨勢與結構三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE525LineTrendStructureTwoSet(5);
      },
    },
    'e5-2-5-pie-complement-drill': {
      type: 'drill',
      title: '圓形圖百分比補集',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE525PieComplementSet(5);
      },
    },
    'e5-2-5-pie-angle-count-drill': {
      type: 'drill',
      title: '圓形圖角度↔百分比↔數量',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE525PieAngleCountSet(5);
      },
    },
    'e5-2-5-pie-inverse-drill': {
      type: 'drill',
      title: '由部分逆推圓形圖全體',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE525PieInverseSet(5);
      },
    },
    'e5-2-5-pie-three-subtypes': {
      type: 'drill',
      title: '圓形圖三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE525PieThreeSet(5);
      },
    },
    'e5-2-6-integer-divide-decimal-drill': {
      type: 'drill',
      title: '整數除以整數（商是小數）',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE526IntegerDivideDecimalSet(5);
      },
    },
    'e5-2-6-decimal-divide-integer-drill': {
      type: 'drill',
      title: '小數除以整數（精確除盡）',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE526DecimalDivideIntegerSet(5);
      },
    },
    'e5-2-6-quotient-zero-gap-drill': {
      type: 'drill',
      title: '商缺位與補 0',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE526QuotientZeroGapSet(5);
      },
    },
    'e5-2-6-fraction-to-decimal-drill': {
      type: 'drill',
      title: '分數化為小數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE526FractionToDecimalSet(5);
      },
    },
    'e5-2-6-divide-by-powers-drill': {
      type: 'drill',
      title: '除以 10、100、1000',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE526DivideByPowersSet(5);
      },
    },
    'e5-2-6-quotient-rounding-drill': {
      type: 'drill',
      title: '除不盡時取概數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE526RoundingSet(5);
      },
    },
    'e5-2-6-equal-sharing-drill': {
      type: 'drill',
      title: '平分分配問題',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE526EqualSharingSet(5);
      },
    },
    'e5-2-6-geometry-dimension-drill': {
      type: 'drill',
      title: '幾何量與長寬反推',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE526GeometryDimensionSet(5);
      },
    },
    'e5-2-6-average-unit-drill': {
      type: 'drill',
      title: '平均單位量計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE526AverageUnitSet(5);
      },
    },
    'e5-2-6-time-unit-convert-drill': {
      type: 'drill',
      title: '時間單位換算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE526TimeUnitConvertSet(5);
      },
    },
    'e5-2-6-basic-three-subtypes': {
      type: 'drill',
      title: '直式計算三小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE526BasicThreeSet(5);
      },
    },
    'e5-2-6-convert-two-subtypes': {
      type: 'drill',
      title: '轉換兩小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE526ConvertTwoSet(5);
      },
    },
    'e5-2-6-rounding-one-subtype': {
      type: 'drill',
      title: '概數處理',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE526RoundingOneSet(5);
      },
    },
    'e5-2-6-application-three-subtypes': {
      type: 'drill',
      title: '應用三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE526ApplicationThreeSet(5);
      },
    },
    'e5-2-6-time-one-subtype': {
      type: 'drill',
      title: '時間換算應用',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE526TimeOneSet(5);
      },
    },
    'e5-2-7-cube-edge-surface-drill': {
      type: 'drill',
      title: '正方體表面積（已知邊長）',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE527CubeEdgeSurfaceSet(5);
      },
    },
    'e5-2-7-cube-face-area-surface-drill': {
      type: 'drill',
      title: '正方體表面積（已知一面面積）',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE527CubeFaceAreaSurfaceSet(5);
      },
    },
    'e5-2-7-cube-inverse-edge-drill': {
      type: 'drill',
      title: '已知表面積求邊長',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE527CubeInverseEdgeSet(5);
      },
    },
    'e5-2-7-rect-surface-drill': {
      type: 'drill',
      title: '長方體表面積（三邊不同）',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE527RectSurfaceSet(5);
      },
    },
    'e5-2-7-special-rect-surface-drill': {
      type: 'drill',
      title: '特殊長方體表面積（兩面正方形）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE527SpecialRectSurfaceSet(5);
      },
    },
    'e5-2-7-volume-to-surface-drill': {
      type: 'drill',
      title: '透過體積求表面積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE527VolumeToSurfaceSet(5);
      },
    },
    'e5-2-7-full-cover-application-drill': {
      type: 'drill',
      title: '生活情境全表面積',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE527FullCoverApplicationSet(5);
      },
    },
    'e5-2-7-lateral-wrap-drill': {
      type: 'drill',
      title: '側面一圈包裝面積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE527LateralWrapSet(5);
      },
    },
    'e5-2-7-cut-increase-drill': {
      type: 'drill',
      title: '切割後表面積增加',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE527CutIncreaseSet(5);
      },
    },
    'e5-2-7-merge-decrease-drill': {
      type: 'drill',
      title: '黏合後表面積減少',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE527MergeDecreaseSet(5);
      },
    },
    'e5-2-7-unit-cube-surface-drill': {
      type: 'drill',
      title: '積木排成長方體的表面積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE527UnitCubeSurfaceSet(5);
      },
    },
    'e5-2-7-arrangement-compare-drill': {
      type: 'drill',
      title: '不同排列的表面積比較',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE527ArrangementCompareSet(5);
      },
    },
    'e5-2-7-cube-three-subtypes': {
      type: 'drill',
      title: '正方體三小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE527CubeThreeSet(5);
      },
    },
    'e5-2-7-rect-three-subtypes': {
      type: 'drill',
      title: '長方體三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE527RectThreeSet(5);
      },
    },
    'e5-2-7-life-two-subtypes': {
      type: 'drill',
      title: '生活情境兩小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE527LifeTwoSet(5);
      },
    },
    'e5-2-7-cut-merge-two-subtypes': {
      type: 'drill',
      title: '切割與合併兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE527CutMergeTwoSet(5);
      },
    },
    'e5-2-7-block-compare-two-subtypes': {
      type: 'drill',
      title: '積木與排列兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE527BlockCompareTwoSet(5);
      },
    },
    'e5-2-7-open-top-rect-drill': {
      type: 'drill',
      title: '無蓋長方體表面積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE527OpenTopRectSet(5);
      },
    },
    'e5-2-7-open-top-cube-drill': {
      type: 'drill',
      title: '無蓋正方體表面積',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE527OpenTopCubeSet(5);
      },
    },
    'e5-2-7-inverse-height-drill': {
      type: 'drill',
      title: '長方體逆推高',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE527InverseHeightSet(5);
      },
    },
    'e5-2-7-room-window-drill': {
      type: 'drill',
      title: '房間粉刷扣除門窗',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE527RoomWindowSet(5);
      },
    },
    'e5-2-7-dim-change-drill': {
      type: 'drill',
      title: '一個維度改變後的表面積差',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildE527DimChangeSet(5);
      },
    },
    'e5-2-7-open-top-two-subtypes': {
      type: 'drill',
      title: '無蓋長方體與無蓋正方體兩小類',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE527OpenTopTwoSet(5);
      },
    },
    'e5-2-7-inverse-room-two-subtypes': {
      type: 'drill',
      title: '逆推高與粉刷扣門窗兩小類',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE527InverseRoomTwoSet(5);
      },
    },
    'e5-2-8-basic-rate-drill': {
      type: 'drill',
      title: '求基本比率（部分 ÷ 全部）',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE528BasicRateSet(5);
      },
    },
    'e5-2-8-part-from-rate-drill': {
      type: 'drill',
      title: '由比率求部分量',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE528PartFromRateSet(5);
      },
    },
    'e5-2-8-complement-rate-drill': {
      type: 'drill',
      title: '互補比率（總和為 1）',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE528ComplementRateSet(5);
      },
    },
    'e5-2-8-percent-from-data-drill': {
      type: 'drill',
      title: '求情境中的百分率',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE528PercentFromDataSet(5);
      },
    },
    'e5-2-8-part-from-percent-drill': {
      type: 'drill',
      title: '由百分率求部分量',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE528PartFromPercentSet(5);
      },
    },
    'e5-2-8-rate-compare-drill': {
      type: 'drill',
      title: '比率的大小比較',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE528RateCompareSet(5);
      },
    },
    'e5-2-8-exact-convert-drill': {
      type: 'drill',
      title: '百分率與小數互換',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE528ExactConvertSet(5);
      },
    },
    'e5-2-8-percent-to-fraction-drill': {
      type: 'drill',
      title: '百分率化分數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE528PercentToFractionSet(5);
      },
    },
    'e5-2-8-fraction-to-percent-expand-drill': {
      type: 'drill',
      title: '分數化百分率（擴分法）',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE528FractionToPercentExpandSet(5);
      },
    },
    'e5-2-8-fraction-to-percent-round-drill': {
      type: 'drill',
      title: '分數化百分率（除法概數）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE528FractionToPercentRoundSet(5);
      },
    },
    'e5-2-8-discount-fold-drill': {
      type: 'drill',
      title: '基礎折扣計算（折數）',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE528DiscountFoldSet(5);
      },
    },
    'e5-2-8-percent-off-drill': {
      type: 'drill',
      title: '% off 的應用',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE528PercentOffSet(5);
      },
    },
    'e5-2-8-markup-drill': {
      type: 'drill',
      title: '成本加成定價',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE528MarkupSet(5);
      },
    },
    'e5-2-8-service-multi-step-drill': {
      type: 'drill',
      title: '服務費與多步驟百分率',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE528ServiceMultiStepSet(5);
      },
    },
    'e5-2-8-find-discount-rate-drill': {
      type: 'drill',
      title: '反求折數或成數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE528FindDiscountRateSet(5);
      },
    },
    'e5-2-8-basic-three-subtypes': {
      type: 'drill',
      title: '比率與部分量三小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE528BasicThreeSet(5);
      },
    },
    'e5-2-8-percent-three-subtypes': {
      type: 'drill',
      title: '百分率求值三小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE528PercentThreeSet(5);
      },
    },
    'e5-2-8-convert-four-subtypes': {
      type: 'drill',
      title: '百分率互換四小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE528ConvertFourSet(5);
      },
    },
    'e5-2-8-price-five-subtypes': {
      type: 'drill',
      title: '折扣與成數五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE528PriceFiveSet(5);
      },
    },
    'e5-2-8-relative-compare-drill': {
      type: 'drill',
      title: '甲比乙多/少幾%',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE528RelativeCompareSet(5);
      },
    },
    'e5-2-8-percent-change-drill': {
      type: 'drill',
      title: '增減後是原來的幾%',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE528PercentChangeSet(5);
      },
    },
    'e5-2-8-find-original-drill': {
      type: 'drill',
      title: '已知折扣後價格逆推原價',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE528FindOriginalSet(5);
      },
    },
    'e5-2-8-compare-change-three-subtypes': {
      type: 'drill',
      title: '相對比較、增減百分率與逆推原價三小類',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE528CompareChangeThreeSet(5);
      },
    },
    'e5-2-9-large-to-compound-drill': {
      type: 'drill',
      title: '大單位化複名數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE529LargeToCompoundSet(5);
      },
    },
    'e5-2-9-small-to-large-decimal-drill': {
      type: 'drill',
      title: '小單位化大單位（小數）',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE529SmallToLargeDecimalSet(5);
      },
    },
    'e5-2-9-small-to-large-fraction-drill': {
      type: 'drill',
      title: '小單位化大單位（分數）',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE529SmallToLargeFractionSet(5);
      },
    },
    'e5-2-9-compare-time-drill': {
      type: 'drill',
      title: '時間的大小比較',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE529CompareTimeSet(5);
      },
    },
    'e5-2-9-minute-second-multiply-drill': {
      type: 'drill',
      title: '分與秒的乘法',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE529MinuteSecondMultiplySet(5);
      },
    },
    'e5-2-9-hour-minute-multiply-advanced-drill': {
      type: 'drill',
      title: '時與分的乘法',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE529HourMinuteMultiplySetV2(5);
      },
    },
    'e5-2-9-day-hour-multiply-drill': {
      type: 'drill',
      title: '日與時的乘法',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529DayHourMultiplySet(5);
      },
    },
    'e5-2-9-fixed-period-accumulate-drill': {
      type: 'drill',
      title: '固定週期的時間累計',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529FixedPeriodAccumulateSet(5);
      },
    },
    'e5-2-9-average-duration-drill': {
      type: 'drill',
      title: '平均時長的計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529AverageDurationSet(5);
      },
    },
    'e5-2-9-contained-count-drill': {
      type: 'drill',
      title: '包含除（可完成幾次）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529ContainedCountSet(5);
      },
    },
    'e5-2-9-elapsed-then-average-drill': {
      type: 'drill',
      title: '先算經過時間再求平均',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529ElapsedThenAverageSet(5);
      },
    },
    'e5-2-9-nth-departure-drill': {
      type: 'drill',
      title: '依固定間隔推第 n 次時刻',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529NthDepartureSet(5);
      },
    },
    'e5-2-9-interval-count-minus-one-drill': {
      type: 'drill',
      title: '時間間隔題（間隔數 = 數量 - 1）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529IntervalCountMinusOneSet(5);
      },
    },
    'e5-2-9-add-then-multiply-drill': {
      type: 'drill',
      title: '先加減再乘的綜合累計',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529AddThenMultiplySet(5);
      },
    },
    'e5-2-9-work-constant-drill': {
      type: 'drill',
      title: '簡單工程問題（工作量不變）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529WorkConstantSet(5);
      },
    },
    'e5-2-9-efficiency-gap-drill': {
      type: 'drill',
      title: '生產效能比較（單位時間差）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529EfficiencyGapSet(5);
      },
    },
    'e5-1-2-divisible-selection-drill': {
      type: 'drill',
      title: '整除判別與篩選',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE512DivisibleSelectionSet(5);
      },
    },
    'e5-1-2-factor-relation-drill': {
      type: 'drill',
      title: '因數與倍數關係判別',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE512FactorRelationSet(5);
      },
    },
    'e5-1-2-factor-list-drill': {
      type: 'drill',
      title: '找出一個數的所有因數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE512FactorListSet(5);
      },
    },
    'e5-1-2-factor-property-drill': {
      type: 'drill',
      title: '單一整數因數性質',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE512FactorPropertySet(5);
      },
    },
    'e5-1-2-common-factor-list-drill': {
      type: 'drill',
      title: '列舉公因數並找最大公因數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE512CommonFactorListSet(5);
      },
    },
    'e5-1-2-gcd-direct-drill': {
      type: 'drill',
      title: '直接求最大公因數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE512GcdDirectSet(5);
      },
    },
    'e5-1-2-common-factor-property-drill': {
      type: 'drill',
      title: '公因數性質判斷',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE512CommonFactorPropertySet(5);
      },
    },
    'e5-1-2-pack-group-drill': {
      type: 'drill',
      title: '平分分裝與分組求最多',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE512PackGroupSet(5);
      },
    },
    'e5-1-2-cut-interval-drill': {
      type: 'drill',
      title: '裁切與等距長度求最長',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE512CutIntervalSet(5);
      },
    },
    'e5-1-2-unit-rate-inference-drill': {
      type: 'drill',
      title: '由總數反推最大單位量',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE512UnitRateInferenceSet(5);
      },
    },
    'e5-1-2-basics-two-subtypes': {
      type: 'drill',
      title: '整除與因倍關係兩小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE512BasicsTwoSet(5);
      },
    },
    'e5-1-2-single-number-two-subtypes': {
      type: 'drill',
      title: '單一整數因數兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE512SingleNumberTwoSet(5);
      },
    },
    'e5-1-2-common-three-subtypes': {
      type: 'drill',
      title: '公因數與最大公因數三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE512CommonThreeSet(5);
      },
    },
    'e5-1-2-application-three-subtypes': {
      type: 'drill',
      title: '最大公因數應用三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE512ApplicationThreeSet(5);
      },
    },
    'e5-1-2-prime-factorization-drill': {
      type: 'drill',
      title: '質因數分解',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE512PrimeFactorizationSet(5);
      },
    },
    'e5-1-3-multiple-sequence-drill': {
      type: 'drill',
      title: '基礎倍數列舉',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE513MultipleSequenceSet(5);
      },
    },
    'e5-1-3-multiple-rule-drill': {
      type: 'drill',
      title: '2、5、10 的倍數規律',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE513MultipleRuleSet(5);
      },
    },
    'e5-1-3-range-multiple-drill': {
      type: 'drill',
      title: '指定範圍內的倍數尋找',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE513RangeMultipleSet(5);
      },
    },
    'e5-1-3-common-multiple-list-drill': {
      type: 'drill',
      title: '列舉公倍數並找最小公倍數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE513CommonMultipleListSet(5);
      },
    },
    'e5-1-3-lcm-direct-drill': {
      type: 'drill',
      title: '直接求最小公倍數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE513LcmDirectSet(5);
      },
    },
    'e5-1-3-group-min-total-drill': {
      type: 'drill',
      title: '分組與分裝求最少總量',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE513GroupMinTotalSet(5);
      },
    },
    'e5-1-3-rectangle-square-min-side-drill': {
      type: 'drill',
      title: '拼成正方形求最短邊長',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE513RectangleSquareMinSideSet(5);
      },
    },
    'e5-1-3-period-sync-drill': {
      type: 'drill',
      title: '週期重疊求再次同時發生',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE513PeriodSyncSet(5);
      },
    },
    'e5-1-3-range-common-multiple-drill': {
      type: 'drill',
      title: '指定範圍內的公倍數應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE513RangeCommonMultipleSet(5);
      },
    },
    'e5-1-3-equal-spending-drill': {
      type: 'drill',
      title: '相同花費找共同總金額',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE513EqualSpendingSet(5);
      },
    },
    'e5-1-3-multiple-three-subtypes': {
      type: 'drill',
      title: '倍數基礎三小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE513MultipleThreeSet(5);
      },
    },
    'e5-1-3-lcm-two-subtypes': {
      type: 'drill',
      title: '公倍數與最小公倍數兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE513LcmTwoSet(5);
      },
    },
    'e5-1-3-application-three-subtypes': {
      type: 'drill',
      title: '最小公倍數應用三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE513ApplicationThreeSet(5);
      },
    },
    'e5-1-3-range-spending-two-subtypes': {
      type: 'drill',
      title: '範圍與花費兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE513RangeSpendingTwoSet(5);
      },
    },
    'e5-1-4-expand-equivalent-drill': {
      type: 'drill',
      title: '擴分找等值分數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE514ExpandEquivalentSet(5);
      },
    },
    'e5-1-4-reduce-equivalent-drill': {
      type: 'drill',
      title: '約分找等值分數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE514ReduceEquivalentSet(5);
      },
    },
    'e5-1-4-division-fraction-convert-drill': {
      type: 'drill',
      title: '整數相除與分數的轉換',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE514DivisionFractionConvertSet(5);
      },
    },
    'e5-1-4-equivalent-chain-drill': {
      type: 'drill',
      title: '連等式的等值分數填空',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE514EquivalentChainSet(5);
      },
    },
    'e5-1-4-irreducible-judge-drill': {
      type: 'drill',
      title: '辨識最簡分數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE514IrreducibleJudgeSet(5);
      },
    },
    'e5-1-4-condition-fill-drill': {
      type: 'drill',
      title: '指定條件的填位練習',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE514ConditionFillSet(5);
      },
    },
    'e5-1-4-common-denominator-compare-drill': {
      type: 'drill',
      title: '通分後比較分數大小',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE514CommonDenominatorCompareSet(5);
      },
    },
    'e5-1-4-property-compare-drill': {
      type: 'drill',
      title: '不用通分的方法比較大小',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE514PropertyCompareSet(5);
      },
    },
    'e5-1-4-unlike-denominator-add-drill': {
      type: 'drill',
      title: '異分母分數的加法',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE514UnlikeDenominatorAddSet(5);
      },
    },
    'e5-1-4-unlike-denominator-sub-drill': {
      type: 'drill',
      title: '異分母分數的減法',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE514UnlikeDenominatorSubSet(5);
      },
    },
    'e5-1-4-equivalent-four-subtypes': {
      type: 'drill',
      title: '等值分數與轉換四小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE514EquivalentFourSet(5);
      },
    },
    'e5-1-4-judge-two-subtypes': {
      type: 'drill',
      title: '最簡分數與條件判斷兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE514JudgeTwoSet(5);
      },
    },
    'e5-1-4-compare-two-subtypes': {
      type: 'drill',
      title: '分數大小比較兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE514CompareTwoSet(5);
      },
    },
    'e5-1-4-calc-two-subtypes': {
      type: 'drill',
      title: '異分母加減兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE514CalcTwoSet(5);
      },
    },
    'e5-1-4-common-denom3-drill': {
      type: 'drill',
      title: '三個分數通分並比較大小',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE514CommonDenom3Set(5);
      },
    },
    'e5-1-4-mixed-calc3-drill': {
      type: 'drill',
      title: '三項分數混合加減',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE514MixedCalc3Set(5);
      },
    },
    'e5-1-4-multi-step-sub-drill': {
      type: 'drill',
      title: '多步驟分數減法應用題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE514MultiStepSubSet(5);
      },
    },
    'e5-1-4-three-frac-three-subtypes': {
      type: 'drill',
      title: '分數進階三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE514ThreeFracThreeSet(5);
      },
    },
    'e5-1-5-can-form-triangle-drill': {
      type: 'drill',
      title: '判斷能否圍成三角形',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE515CanFormTriangleSet(5);
      },
    },
    'e5-1-5-third-side-range-drill': {
      type: 'drill',
      title: '第三邊可能的範圍',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE515ThirdSideRangeSet(5);
      },
    },
    'e5-1-5-isosceles-third-side-drill': {
      type: 'drill',
      title: '等腰三角形的第三邊判斷',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE515IsoscelesThirdSideSet(5);
      },
    },
    'e5-1-5-polygon-regular-basic-drill': {
      type: 'drill',
      title: '多邊形與正多邊形基礎',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE515PolygonRegularBasicSet(5);
      },
    },
    'e5-1-5-triangle-angle-drill': {
      type: 'drill',
      title: '三角形角度給二求一',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE515TriangleAngleSet(5);
      },
    },
    'e5-1-5-isosceles-equilateral-angle-drill': {
      type: 'drill',
      title: '等腰與正三角形的特殊角',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE515IsoscelesEquilateralAngleSet(5);
      },
    },
    'e5-1-5-quadrilateral-angle-drill': {
      type: 'drill',
      title: '四邊形角度給三求一',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE515QuadrilateralAngleSet(5);
      },
    },
    'e5-1-5-parallelogram-angle-drill': {
      type: 'drill',
      title: '平行四邊形角度性質',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE515ParallelogramAngleSet(5);
      },
    },
    'e5-1-5-sector-fraction-to-angle-drill': {
      type: 'drill',
      title: '幾分之幾圓換成圓心角',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE515SectorFractionToAngleSet(5);
      },
    },
    'e5-1-5-sector-angle-to-fraction-drill': {
      type: 'drill',
      title: '圓心角換算成幾分之幾圓',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE515SectorAngleToFractionSet(5);
      },
    },
    'e5-1-5-sector-complement-angle-drill': {
      type: 'drill',
      title: '由整圓扣除求扇形角度',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE515SectorComplementAngleSet(5);
      },
    },
    'e5-1-5-sector-multi-region-drill': {
      type: 'drill',
      title: '圓內多區域的剩餘角度',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE515SectorMultiRegionSet(5);
      },
    },
    'e5-1-5-triangle-side-three-subtypes': {
      type: 'drill',
      title: '三角形邊長三小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE515TriangleSideThreeSet(5);
      },
    },
    'e5-1-5-polygon-angle-five-subtypes': {
      type: 'drill',
      title: '多邊形與角度五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE515PolygonAngleFiveSet(5);
      },
    },
    'e5-1-5-sector-four-subtypes': {
      type: 'drill',
      title: '扇形圓心角四小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE515SectorFourSet(5);
      },
    },
    'e5-1-5-parallelogram-area-drill': {
      type: 'drill',
      title: '平行四邊形面積',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE515ParallelogramAreaSet(5);
      },
    },
    'e5-1-5-trapezoid-area-drill': {
      type: 'drill',
      title: '梯形面積',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE515TrapezoidAreaSet(5);
      },
    },
    'e5-1-5-triangle-area-drill': {
      type: 'drill',
      title: '三角形面積',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE515TriangleAreaSet(5);
      },
    },
    'e5-1-5-area-three-subtypes': {
      type: 'drill',
      title: '多邊形面積三小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE515AreaThreeSet(5);
      },
    },
    'e5-1-6-proper-add-sub-drill': {
      type: 'drill',
      title: '異分母真分數的加減',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE516ProperAddSubSet(5);
      },
    },
    'e5-1-6-improper-calc-drill': {
      type: 'drill',
      title: '含假分數或帶分數的加減',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE516ImproperCalcSet(5);
      },
    },
    'e5-1-6-mixed-add-drill': {
      type: 'drill',
      title: '異分母帶分數的加法',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE516MixedAddSet(5);
      },
    },
    'e5-1-6-mixed-borrow-sub-drill': {
      type: 'drill',
      title: '需要借位的帶分數減法',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE516MixedBorrowSubSet(5);
      },
    },
    'e5-1-6-total-application-drill': {
      type: 'drill',
      title: '總量情境加法',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE516TotalApplicationSet(5);
      },
    },
    'e5-1-6-difference-application-drill': {
      type: 'drill',
      title: '相差與比較情境',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE516DifferenceApplicationSet(5);
      },
    },
    'e5-1-6-remaining-application-drill': {
      type: 'drill',
      title: '剩餘量情境',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE516RemainingApplicationSet(5);
      },
    },
    'e5-1-6-original-application-drill': {
      type: 'drill',
      title: '還原原有總量',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE516OriginalAmountSet(5);
      },
    },
    'e5-1-6-division-integrated-drill': {
      type: 'drill',
      title: '平均分配後再比較或合併',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE516DivisionIntegratedSet(5);
      },
    },
    'e5-1-6-basic-two-subtypes': {
      type: 'drill',
      title: '基礎異分母計算兩小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE516BasicTwoSet(5);
      },
    },
    'e5-1-6-mixed-two-subtypes': {
      type: 'drill',
      title: '帶分數加減兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE516MixedTwoSet(5);
      },
    },
    'e5-1-6-application-five-subtypes': {
      type: 'drill',
      title: '情境應用五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE516ApplicationFiveSet(5);
      },
    },
    'e5-1-7-regular-axis-count-drill': {
      type: 'drill',
      title: '正多邊形的對稱軸數量',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE517RegularAxisCountSet(5);
      },
    },
    'e5-1-7-common-shape-symmetry-drill': {
      type: 'drill',
      title: '常見圖形的線對稱判斷',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE517CommonShapeSymmetrySet(5);
      },
    },
    'e5-1-7-mirror-distance-drill': {
      type: 'drill',
      title: '對稱點到對稱軸的距離',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE517MirrorDistanceSet(5);
      },
    },
    'e5-1-7-mirror-segment-length-drill': {
      type: 'drill',
      title: '對稱邊長度與對應總長',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE517MirrorSegmentLengthSet(5);
      },
    },
    'e5-1-7-mirror-angle-drill': {
      type: 'drill',
      title: '對稱角大小計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE517MirrorAngleSet(5);
      },
    },
    'e5-1-7-perimeter-drill': {
      type: 'drill',
      title: '線對稱圖形的周長計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE517PerimeterSet(5);
      },
    },
    'e5-1-7-axis-two-subtypes': {
      type: 'drill',
      title: '對稱軸判斷與數量兩小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE517AxisTwoSet(5);
      },
    },
    'e5-1-7-calc-four-subtypes': {
      type: 'drill',
      title: '利用對稱性計算四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE517CalcFourSet(5);
      },
    },
    'e5-1-8-basic-mixed-drill': {
      type: 'drill',
      title: '基礎混合計算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE518BasicMixedSet(5);
      },
    },
    'e5-1-8-equivalent-judge-drill': {
      type: 'drill',
      title: '算式結果是否相同',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE518EquivalentJudgeSet(5);
      },
    },
    'e5-1-8-chain-division-drill': {
      type: 'drill',
      title: '連除的簡便計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE518ChainDivisionSet(5);
      },
    },
    'e5-1-8-distributive-drill': {
      type: 'drill',
      title: '分配律的簡便計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE518DistributiveSet(5);
      },
    },
    'e5-1-8-application-expression-drill': {
      type: 'drill',
      title: '三步驟情境列式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE518ApplicationExpressionSet(5);
      },
    },
    'e5-1-8-average-basic-drill': {
      type: 'drill',
      title: '基礎平均問題',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE518AverageBasicSet(5);
      },
    },
    'e5-1-8-average-target-drill': {
      type: 'drill',
      title: '目標平均反推',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE518AverageTargetSet(5);
      },
    },
    'e5-1-8-balance-payment-drill': {
      type: 'drill',
      title: '平攤後的補差額',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE518BalancePaymentSet(5);
      },
    },
    'e5-1-8-basic-two-subtypes': {
      type: 'drill',
      title: '基礎運算與等值判斷兩小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE518BasicTwoSet(5);
      },
    },
    'e5-1-8-property-two-subtypes': {
      type: 'drill',
      title: '連除與分配律兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE518PropertyTwoSet(5);
      },
    },
    'e5-1-8-application-two-subtypes': {
      type: 'drill',
      title: '生活情境列式兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE518ApplicationTwoSet(5);
      },
    },
    'e5-1-8-average-advanced-two-subtypes': {
      type: 'drill',
      title: '平均進階應用兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE518AverageAdvancedTwoSet(5);
      },
    },
    'e5-1-9-parallelogram-direct-drill': {
      type: 'drill',
      title: '平行四邊形面積直接計算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE519ParallelogramDirectSet(5);
      },
    },
    'e5-1-9-parallelogram-reverse-drill': {
      type: 'drill',
      title: '平行四邊形逆向求底或高',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519ParallelogramReverseSet(5);
      },
    },
    'e5-1-9-parallelogram-scale-drill': {
      type: 'drill',
      title: '平行四邊形面積倍率與等積判斷',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519ParallelogramScaleSet(5);
      },
    },
    'e5-1-9-parallelogram-equal-area-drill': {
      type: 'drill',
      title: '平行四邊形等底等高與等積判斷',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519ParallelogramEqualAreaSet(5);
      },
    },
    'e5-1-9-parallelogram-four-subtypes': {
      type: 'drill',
      title: '平行四邊形面積四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519ParallelogramCompositeSet(5);
      },
    },
    'e5-1-9-triangle-direct-drill': {
      type: 'drill',
      title: '三角形面積直接計算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE519TriangleDirectSet(5);
      },
    },
    'e5-1-9-triangle-reverse-drill': {
      type: 'drill',
      title: '三角形逆向求底或高',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519TriangleReverseSet(5);
      },
    },
    'e5-1-9-triangle-scale-drill': {
      type: 'drill',
      title: '三角形面積倍率與等積判斷',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519TriangleScaleSet(5);
      },
    },
    'e5-1-9-triangle-equal-area-drill': {
      type: 'drill',
      title: '三角形與其他圖形面積比較',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519TriangleEqualAreaSet(5);
      },
    },
    'e5-1-9-triangle-four-subtypes': {
      type: 'drill',
      title: '三角形面積四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519TriangleCompositeSet(5);
      },
    },
    'e5-1-9-trapezoid-direct-drill': {
      type: 'drill',
      title: '梯形面積直接計算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE519TrapezoidDirectSet(5);
      },
    },
    'e5-1-9-trapezoid-application-drill': {
      type: 'drill',
      title: '梯形生活情境面積',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE519TrapezoidApplicationSet(5);
      },
    },
    'e5-1-9-trapezoid-relation-drill': {
      type: 'drill',
      title: '梯形與平行四邊形關係轉化',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519TrapezoidRelationSet(5);
      },
    },
    'e5-1-9-trapezoid-scale-drill': {
      type: 'drill',
      title: '梯形面積倍率與逆算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519TrapezoidScaleSet(5);
      },
    },
    'e5-1-9-trapezoid-four-subtypes': {
      type: 'drill',
      title: '梯形面積四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519TrapezoidCompositeSet(5);
      },
    },
    'e5-1-9-composite-add-drill': {
      type: 'drill',
      title: '複合圖形分割後加總',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519CompositeAddSet(5);
      },
    },
    'e5-1-9-composite-subtract-drill': {
      type: 'drill',
      title: '複合圖形扣除白色區域',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519CompositeSubtractSet(5);
      },
    },
    'e5-1-9-composite-translation-drill': {
      type: 'drill',
      title: '平移道路與剩餘面積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519CompositeTranslationSet(5);
      },
    },
    'e5-1-9-composite-rule-drill': {
      type: 'drill',
      title: '規則元件拼組面積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519CompositeRuleSet(5);
      },
    },
    'e5-1-9-composite-four-subtypes': {
      type: 'drill',
      title: '複合圖形面積四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE519CompositeFourSet(5);
      },
    },
    'e5-1-10-prism-naming-drill': {
      type: 'drill',
      title: '柱體命名與底面判斷',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE510PrismNamingSet(5);
      },
    },
    'e5-1-10-prism-elements-drill': {
      type: 'drill',
      title: '柱體面頂點邊數計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510PrismElementsSet(5);
      },
    },
    'e5-1-10-prism-face-relation-drill': {
      type: 'drill',
      title: '柱體面與面關係判斷',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510PrismFaceRelationSet(5);
      },
    },
    'e5-1-10-prism-reverse-drill': {
      type: 'drill',
      title: '由柱體元素逆推名稱',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510PrismReverseSet(5);
      },
    },
    'e5-1-10-prism-four-subtypes': {
      type: 'drill',
      title: '柱體性質四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510PrismMixedSet(5);
      },
    },
    'e5-1-10-pyramid-naming-drill': {
      type: 'drill',
      title: '錐體命名與底面判斷',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE510PyramidNamingSet(5);
      },
    },
    'e5-1-10-pyramid-elements-drill': {
      type: 'drill',
      title: '錐體面頂點邊數計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510PyramidElementsSet(5);
      },
    },
    'e5-1-10-pyramid-face-relation-drill': {
      type: 'drill',
      title: '錐體底面與側面關係',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510PyramidFaceRelationSet(5);
      },
    },
    'e5-1-10-pyramid-reverse-drill': {
      type: 'drill',
      title: '由錐體元素逆推名稱',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510PyramidReverseSet(5);
      },
    },
    'e5-1-10-pyramid-four-subtypes': {
      type: 'drill',
      title: '錐體性質四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510PyramidMixedSet(5);
      },
    },
    'e5-1-10-cuboid-face-relation-drill': {
      type: 'drill',
      title: '長方體與正方體面關係',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE510CuboidFaceRelationSet(5);
      },
    },
    'e5-1-10-cuboid-count-drill': {
      type: 'drill',
      title: '指定面的平行垂直面數量',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510CuboidCountSet(5);
      },
    },
    'e5-1-10-cuboid-everyday-drill': {
      type: 'drill',
      title: '生活情境中的面關係',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE510CuboidEverydaySet(5);
      },
    },
    'e5-1-10-cuboid-three-subtypes': {
      type: 'drill',
      title: '長方體與正方體面關係三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510CuboidMixedSet(5);
      },
    },
    'e5-1-10-sphere-parts-drill': {
      type: 'drill',
      title: '球體半徑直徑換算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE510SpherePartsSet(5);
      },
    },
    'e5-1-10-sphere-section-drill': {
      type: 'drill',
      title: '球體剖面性質判斷',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510SphereSectionSet(5);
      },
    },
    'e5-1-10-sphere-cylinder-drill': {
      type: 'drill',
      title: '球裝入圓筒尺寸計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510SphereCylinderSet(5);
      },
    },
    'e5-1-10-sphere-box-drill': {
      type: 'drill',
      title: '球裝入長方體盒尺寸計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510SphereBoxSet(5);
      },
    },
    'e5-1-10-sphere-four-subtypes': {
      type: 'drill',
      title: '球體與容器尺寸四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510SphereMixedSet(5);
      },
    },
    'e5-1-10-net-solid-name-drill': {
      type: 'drill',
      title: '展開圖對應立體名稱',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510NetSolidNameSet(5);
      },
    },
    'e5-1-10-net-element-count-drill': {
      type: 'drill',
      title: '展開圖組成元素數量',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510NetElementCountSet(5);
      },
    },
    'e5-1-10-net-edge-match-drill': {
      type: 'drill',
      title: '展開圖邊長對應與換算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510NetEdgeMatchSet(5);
      },
    },
    'e5-1-10-net-face-relation-drill': {
      type: 'drill',
      title: '展開圖摺合後面關係',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510NetFaceRelationSet(5);
      },
    },
    'e5-1-10-net-four-subtypes': {
      type: 'drill',
      title: '展開圖推理四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE510NetMixedSet(5);
      },
    },
    'e5-2-2-mixed-mixed-multiply-drill': {
      type: 'drill',
      title: '帶分數乘帶分數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE522MixedMixedMultiplySet(5);
      },
    },
    'e5-2-2-triple-multiply-drill': {
      type: 'drill',
      title: '三個分數連乘',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE522TripleMultiplySet(5);
      },
    },
    'e5-2-2-add-multiply-mixed-drill': {
      type: 'drill',
      title: '分數混合四則（乘加減）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE522AddMultiplyMixedSet(5);
      },
    },
    'e5-2-2-remainder-application-drill': {
      type: 'drill',
      title: '剩餘量應用',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE522RemainderApplicationSet(5);
      },
    },
    'e5-2-2-two-step-consume-drill': {
      type: 'drill',
      title: '兩步驟消耗應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE522TwoStepConsumeSet(5);
      },
    },
    'e5-2-2-new-three-subtypes': {
      type: 'drill',
      title: '進階分數計算三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE522NewThreeSet(5);
      },
    },
    'e5-1-1-read-write-drill': {
      type: 'drill',
      title: '小數的讀法與記法',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE511ReadWriteSet(5);
      },
    },
    'e5-1-1-place-composition-drill': {
      type: 'drill',
      title: '小數位值化聚',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE511PlaceCompositionSet(5);
      },
    },
    'e5-1-1-place-digit-meaning-drill': {
      type: 'drill',
      title: '指定位數的數字與意義',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE511PlaceDigitMeaningSet(5);
      },
    },
    'e5-1-1-compare-fill-drill': {
      type: 'drill',
      title: '小數大小比較填空',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE511CompareFillSet(5);
      },
    },
    'e5-1-1-trim-zero-drill': {
      type: 'drill',
      title: '小數末尾 0 的省略判斷',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE511TrimZeroSet(5);
      },
    },
    'e5-1-1-column-add-subtract-drill': {
      type: 'drill',
      title: '小數直式加減',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE511ColumnAddSubtractSet(5);
      },
    },
    'e5-1-1-application-drill': {
      type: 'drill',
      title: '生活情境加減應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE511ApplicationSet(5);
      },
    },
    'e5-1-1-round-direct-drill': {
      type: 'drill',
      title: '四捨五入法取概數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE511RoundDirectSet(5);
      },
    },
    'e5-1-1-round-keep-zero-drill': {
      type: 'drill',
      title: '取概數後保留 0',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE511RoundKeepZeroSet(5);
      },
    },
    'e5-1-1-round-multi-place-drill': {
      type: 'drill',
      title: '同一個數取到不同位數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE511RoundMultiPlaceSet(5);
      },
    },
    'e5-1-1-round-selection-drill': {
      type: 'drill',
      title: '符合指定概數結果的數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE511RoundSelectionSet(5);
      },
    },
    'e5-1-1-round-hidden-digit-drill': {
      type: 'drill',
      title: '依概數反推空格數字',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE511RoundHiddenDigitSet(5);
      },
    },
    'e5-1-1-literacy-three-subtypes': {
      type: 'drill',
      title: '讀寫與位值三小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE511LiteracyThreeSet(5);
      },
    },
    'e5-1-1-compare-two-subtypes': {
      type: 'drill',
      title: '比較與去 0 兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE511CompareTwoSet(5);
      },
    },
    'e5-1-1-compute-two-subtypes': {
      type: 'drill',
      title: '計算與應用兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE511ComputeTwoSet(5);
      },
    },
    'e5-1-1-round-three-subtypes': {
      type: 'drill',
      title: '取概數三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE511RoundThreeSet(5);
      },
    },
    'e5-1-1-reverse-two-subtypes': {
      type: 'drill',
      title: '概數逆推兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE511ReverseTwoSet(5);
      },
    },
    'e5-2-9-convert-compare-four-subtypes': {
      type: 'drill',
      title: '換算與比較四小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE529ConvertCompareFourSet(5);
      },
    },
    'e5-2-9-repeat-four-subtypes': {
      type: 'drill',
      title: '重複事件總時間四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529RepeatFourSet(5);
      },
    },
    'e5-2-9-division-three-subtypes': {
      type: 'drill',
      title: '平均與包含除三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529DivisionThreeSet(5);
      },
    },
    'e5-2-9-schedule-two-subtypes': {
      type: 'drill',
      title: '時刻與班距兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529ScheduleTwoSet(5);
      },
    },
    'e5-2-9-application-three-subtypes': {
      type: 'drill',
      title: '綜合應用三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529ApplicationThreeSet(5);
      },
    },
    'e5-2-9-speed-distance-drill': {
      type: 'drill',
      title: '速度 × 時間 ＝ 距離（含單位換算）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529SpeedDistanceSet(5);
      },
    },
    'e5-2-9-match-with-break-drill': {
      type: 'drill',
      title: '比賽節數與休息時間計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529MatchWithBreakSet(5);
      },
    },
    'e5-2-9-time-ratio-drill': {
      type: 'drill',
      title: '時間倍數比較',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529TimeRatioSet(5);
      },
    },
    'e5-2-9-speed-match-three-subtypes': {
      type: 'drill',
      title: '速度距離、比賽時間與時間倍數三小類',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE529SpeedMatchThreeSet(5);
      },
    },
    'e5-2-10-meter-kilometer-convert-drill': {
      type: 'drill',
      title: '公尺與公里換算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE530MeterKilometerConvertSet(5);
      },
    },
    'e5-2-10-length-unit-judgment-drill': {
      type: 'drill',
      title: '適當長度單位判斷',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE530LengthUnitJudgmentSet(5);
      },
    },
    'e5-2-10-length-compare-drill': {
      type: 'drill',
      title: '長度大小比較',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE530LengthCompareSet(5);
      },
    },
    'e5-2-10-length-application-drill': {
      type: 'drill',
      title: '長度乘除法應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE530LengthApplicationSet(5);
      },
    },
    'e5-2-10-tonne-kilogram-convert-drill': {
      type: 'drill',
      title: '公斤與公噸換算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE530TonneKilogramConvertSet(5);
      },
    },
    'e5-2-10-weight-unit-judgment-drill': {
      type: 'drill',
      title: '適當重量單位判斷',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE530WeightUnitJudgmentSet(5);
      },
    },
    'e5-2-10-weight-compare-drill': {
      type: 'drill',
      title: '重量大小比較',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE530WeightCompareSet(5);
      },
    },
    'e5-2-10-weight-application-drill': {
      type: 'drill',
      title: '重量乘除法應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE530WeightApplicationSet(5);
      },
    },
    'e5-2-10-area-adjacent-convert-drill': {
      type: 'drill',
      title: '相鄰面積單位換算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE530AreaAdjacentConvertSet(5);
      },
    },
    'e5-2-10-area-cross-convert-drill': {
      type: 'drill',
      title: '跨單位面積換算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE530AreaCrossConvertSet(5);
      },
    },
    'e5-2-10-area-unit-judgment-drill': {
      type: 'drill',
      title: '適當面積單位判斷',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE530AreaUnitJudgmentSet(5);
      },
    },
    'e5-2-10-area-compare-drill': {
      type: 'drill',
      title: '面積大小比較與排序',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE530AreaCompareSet(5);
      },
    },
    'e5-2-10-area-shape-application-drill': {
      type: 'drill',
      title: '圖形面積換單位應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE530AreaShapeApplicationSet(5);
      },
    },
    'e5-2-10-length-four-subtypes': {
      type: 'drill',
      title: '長度大單位四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE530LengthFourSet(5);
      },
    },
    'e5-2-10-weight-four-subtypes': {
      type: 'drill',
      title: '重量大單位四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE530WeightFourSet(5);
      },
    },
    'e5-2-10-area-five-subtypes': {
      type: 'drill',
      title: '面積大單位五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE530AreaFiveSet(5);
      },
    },
    'e5-2-4-decimal-integer-direct-drill': {
      type: 'drill',
      title: '小數乘整數直式計算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE524DecimalIntegerSet(5);
      },
    },
    'e5-2-4-decimal-decimal-direct-drill': {
      type: 'drill',
      title: '小數乘小數直式計算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE524DecimalDecimalSet(5);
      },
    },
    'e5-2-4-shift-right-drill': {
      type: 'drill',
      title: '乘 10、100、1000 的位移',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE524ShiftRightSet(5);
      },
    },
    'e5-2-4-shift-left-drill': {
      type: 'drill',
      title: '乘 0.1、0.01、0.001 的位移',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE524ShiftLeftSet(5);
      },
    },
    'e5-2-4-infer-from-integer-drill': {
      type: 'drill',
      title: '由整數算式推小數乘法',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE524InferFromIntegerSet(5);
      },
    },
    'e5-2-4-compare-product-drill': {
      type: 'drill',
      title: '不計算判斷積與被乘數大小',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE524CompareProductSet(5);
      },
    },
    'e5-2-4-decimal-place-count-drill': {
      type: 'drill',
      title: '積的小數位數判斷',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE524DecimalPlaceCountSet(5);
      },
    },
    'e5-2-4-order-compare-drill': {
      type: 'drill',
      title: '多個數值的大小排序',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE524OrderCompareSet(5);
      },
    },
    'e5-2-4-application-drill': {
      type: 'drill',
      title: '生活情境中的小數乘法',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE524ApplicationSet(5);
      },
    },
    'e5-2-4-direct-two-subtypes': {
      type: 'drill',
      title: '直式計算二小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE524DirectTwoSet(5);
      },
    },
    'e5-2-4-shift-two-subtypes': {
      type: 'drill',
      title: '位值移動二小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE524ShiftTwoSet(5);
      },
    },
    'e5-2-4-infer-two-subtypes': {
      type: 'drill',
      title: '由整數推小數二小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE524InferTwoSet(5);
      },
    },
    'e5-2-4-judge-three-subtypes': {
      type: 'drill',
      title: '積大小與位值三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE524JudgeThreeSet(5);
      },
    },
    'e5-2-4-application-one-subtype': {
      type: 'drill',
      title: '生活情境中的小數乘法',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE524ApplicationOneSet(5);
      },
    },
    'e5-2-4-distributive-law-drill': {
      type: 'drill',
      title: '分配律簡便計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE524DistributiveLawSet(5);
      },
    },
    'e5-2-4-clever-grouping-drill': {
      type: 'drill',
      title: '湊整巧算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE524CleverGroupingSet(5);
      },
    },
    'e5-2-4-discount-drill': {
      type: 'drill',
      title: '折扣與售價計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE524DiscountSet(5);
      },
    },
    'e5-2-4-distributive-clever-two-subtypes': {
      type: 'drill',
      title: '分配律與湊整兩小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE524DistributiveCleverTwoSet(5);
      },
    },
    'e5-2-3-basic-unit-convert-drill': {
      type: 'drill',
      title: '容積與容量基本換算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE523BasicUnitConvertSet(5);
      },
    },
    'e5-2-3-large-unit-convert-drill': {
      type: 'drill',
      title: '大型單位與水度換算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE523LargeUnitConvertSet(5);
      },
    },
    'e5-2-3-inner-dimension-capacity-drill': {
      type: 'drill',
      title: '直接由內部尺寸求容積',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE523InnerCapacitySet(5);
      },
    },
    'e5-2-3-thickness-capacity-drill': {
      type: 'drill',
      title: '考厚度的容器容積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE523ThicknessCapacitySet(5);
      },
    },
    'e5-2-3-capacity-compare-drill': {
      type: 'drill',
      title: '容積與容量大小比較',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE523CapacityCompareSet(5);
      },
    },
    'e5-2-3-fill-water-level-drill': {
      type: 'drill',
      title: '倒入水量求水深',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE523FillWaterLevelSet(5);
      },
    },
    'e5-2-3-displacement-volume-drill': {
      type: 'drill',
      title: '排水法求物體體積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE523DisplacementSet(5);
      },
    },
    'e5-2-3-overflow-volume-drill': {
      type: 'drill',
      title: '溢水量與物體體積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE523OverflowSet(5);
      },
    },
    'e5-2-3-large-application-drill': {
      type: 'drill',
      title: '大型容積生活應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE523LargeApplicationSet(5);
      },
    },
    'e5-2-3-convert-two-subtypes': {
      type: 'drill',
      title: '單位換算二小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE523ConvertTwoSet(5);
      },
    },
    'e5-2-3-container-two-subtypes': {
      type: 'drill',
      title: '容器容積二小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE523ContainerTwoSet(5);
      },
    },
    'e5-2-3-water-two-subtypes': {
      type: 'drill',
      title: '倒水與排水二小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE523WaterTwoSet(5);
      },
    },
    'e5-2-3-rock-cup-three-subtypes': {
      type: 'drill',
      title: '水位石頭、杯子倒水與分數水量三小類',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE523RockCupThreeSet(5);
      },
    },
    'e5-2-3-overflow-compare-two-subtypes': {
      type: 'drill',
      title: '溢水與大小比較二小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE523OverflowCompareTwoSet(5);
      },
    },
    'e5-2-3-large-one-subtype': {
      type: 'drill',
      title: '大型容積生活應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE523LargeOneSet(5);
      },
    },
    'e5-2-3-rock-water-level-drill': {
      type: 'drill',
      title: '石頭投入水位變化',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE523RockWaterLevelSet(5);
      },
    },
    'e5-2-3-cup-pour-drill': {
      type: 'drill',
      title: '杯子倒水容積計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE523CupPourSet(5);
      },
    },
    'e5-2-3-fraction-base-area-drill': {
      type: 'drill',
      title: '分數底面積容積計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE523FractionBaseAreaSet(5);
      },
    },
    'e5-2-2-integer-fraction-multiply-drill': {
      type: 'drill',
      title: '整數乘真分數與假分數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE522IntegerFractionMultiplySet(5);
      },
    },
    'e5-2-2-integer-mixed-multiply-drill': {
      type: 'drill',
      title: '整數乘帶分數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE522IntegerMixedMultiplySet(5);
      },
    },
    'e5-2-2-fraction-fraction-multiply-drill': {
      type: 'drill',
      title: '分數乘分數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE522FractionFractionMultiplySet(5);
      },
    },
    'e5-2-2-cross-cancel-multiply-drill': {
      type: 'drill',
      title: '先約分再相乘',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE522CrossCancelMultiplySet(5);
      },
    },
    'e5-2-2-discrete-fraction-amount-drill': {
      type: 'drill',
      title: '離散量的分數倍',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE522DiscreteFractionOfQuantitySet(5);
      },
    },
    'e5-2-2-continuous-fraction-application-drill': {
      type: 'drill',
      title: '連續量的分數倍應用',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE522ContinuousFractionApplicationSet(5);
      },
    },
    'e5-2-2-fraction-of-fraction-drill': {
      type: 'drill',
      title: '分數的分數應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE522FractionOfFractionSet(5);
      },
    },
    'e5-2-2-quotient-fraction-drill': {
      type: 'drill',
      title: '商寫成分數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE522QuotientFractionSet(5);
      },
    },
    'e5-2-2-quotient-decimal-drill': {
      type: 'drill',
      title: '商寫成有限小數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE522QuotientDecimalSet(5);
      },
    },
    'e5-2-2-quotient-estimate-drill': {
      type: 'drill',
      title: '除不盡的概數處理',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE522QuotientEstimateSet(5);
      },
    },
    'e5-2-2-divide-powers-drill': {
      type: 'drill',
      title: '除以 10、100、1000 的規律',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE522DivideByPowersSet(5);
      },
    },
    'e5-2-2-product-compare-drill': {
      type: 'drill',
      title: '不用計算判斷積大小',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE522ProductCompareSet(5);
      },
    },
    'e5-2-2-fraction-divide-integer-drill': {
      type: 'drill',
      title: '分數除以整數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE522FractionDivideIntegerSet(5);
      },
    },
    'e5-2-2-multi-step-application-drill': {
      type: 'drill',
      title: '多步驟分數應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE522MultiStepApplicationSet(5);
      },
    },
    'e5-2-2-multiply-four-subtypes': {
      type: 'drill',
      title: '分數乘法四小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE522MultiplyFourSet(5);
      },
    },
    'e5-2-2-amount-three-subtypes': {
      type: 'drill',
      title: '分數倍與生活量三小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE522AmountThreeSet(5);
      },
    },
    'e5-2-2-quotient-three-subtypes': {
      type: 'drill',
      title: '商的表示三小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE522QuotientThreeSet(5);
      },
    },
    'e5-2-2-compare-two-subtypes': {
      type: 'drill',
      title: '關係判斷二小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE522CompareTwoSet(5);
      },
    },
    'e5-2-2-division-application-two-subtypes': {
      type: 'drill',
      title: '分數除法與應用二小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE522DivisionApplicationTwoSet(5);
      },
    },
    'e5-2-1-basic-volume-drill': {
      type: 'drill',
      title: '基本長方體與正方體體積',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE521BasicVolumeSet(5);
      },
    },
    'e5-2-1-reverse-volume-drill': {
      type: 'drill',
      title: '逆向求未知邊長或高',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE521ReverseVolumeSet(5);
      },
    },
    'e5-2-1-volume-unit-convert-drill': {
      type: 'drill',
      title: '體積單位換算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE521VolumeUnitConvertSet(5);
      },
    },
    'e5-2-1-capacity-convert-drill': {
      type: 'drill',
      title: '體積、容量與水度換算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE521CapacityConvertSet(5);
      },
    },
    'e5-2-1-mixed-unit-volume-drill': {
      type: 'drill',
      title: '跨單位混合體積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE521MixedUnitVolumeSet(5);
      },
    },
    'e5-2-1-cutting-composite-drill': {
      type: 'drill',
      title: '切割法複合體積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE521CuttingCompositeSet(5);
      },
    },
    'e5-2-1-fill-cut-drill': {
      type: 'drill',
      title: '填補法缺口體積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE521FillCutSet(5);
      },
    },
    'e5-2-1-water-displacement-drill': {
      type: 'drill',
      title: '水位上升與排水體積',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE521WaterDisplacementSet(5);
      },
    },
    'e5-2-1-thickness-capacity-drill': {
      type: 'drill',
      title: '容積與厚度計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE521ThicknessCapacitySet(5);
      },
    },
    'e5-2-1-large-container-drill': {
      type: 'drill',
      title: '大型容器生活應用',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE521LargeContainerSet(5);
      },
    },
    'e5-2-1-basic-two-subtypes': {
      type: 'drill',
      title: '基本體積與逆向二小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE521BasicTwoSet(5);
      },
    },
    'e5-2-1-convert-three-subtypes': {
      type: 'drill',
      title: '單位、容積與換算三小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildE521ConvertThreeSet(5);
      },
    },
    'e5-2-1-composite-three-subtypes': {
      type: 'drill',
      title: '複合體積與排水三小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE521CompositeThreeSet(5);
      },
    },
    'e5-2-1-applied-two-subtypes': {
      type: 'drill',
      title: '容積與生活應用二小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildE521AppliedTwoSet(5);
      },
    },
  };

  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== 'object') return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
