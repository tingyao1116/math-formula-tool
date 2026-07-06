(() => {
  const store = window.formulaPracticeStore;
  if (!store || typeof store.registerConfigs !== "function") return;

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickFromList(list) {
    return list[randInt(0, list.length - 1)];
  }

  function trimDecimalString(text) {
    const source = String(text || '').trim();
    if (!source.includes('.')) return source;
    return source.replace(/0+$/g, '').replace(/\.$/g, '');
  }

  function buildPrimeFactorList(max = 180) {
    return [
      12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 54, 56, 60, 72, 75, 84, 90, 96, 108, 120, 126, 140, 150, 168, 180,
    ].filter((value) => value <= max);
  }

  function buildE611PrimeCompositeJudgeSet(count) {
    const primeValues = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const compositeValues = [
      4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 33, 34, 35, 36,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const askPrime = randInt(0, 1) === 0;
      const n = askPrime ? pickFromList(primeValues) : pickFromList(compositeValues);
      questions.push(`${n} 是質數還是合數？`);
      if (askPrime) {
        summaryAnswers.push('質數');
        answers.push(`簡答：質數。過程：${n} 只有 1 和 ${n} 兩個正因數，所以是質數。`);
      } else {
        const divisor = [2, 3, 5, 7].find((value) => n % value === 0 && value !== n) || 2;
        summaryAnswers.push('合數');
        answers.push(`簡答：合數。過程：${n} 除了 1 和 ${n} 以外，還可以被 ${divisor} 整除，所以是合數。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE611PrimeFactorListSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const values = buildPrimeFactorList(120);
    for (let i = 0; i < count; i += 1) {
      const n = pickFromList(values);
      const factors = primeFactorize(n).map(({ prime }) => prime);
      const factorText = factors.join('、');
      questions.push(`找出 ${n} 的質因數有哪些？`);
      summaryAnswers.push(factorText);
      answers.push(
        `簡答：${factorText}。過程：${n} 的標準分解式是 $${formatPrimeFactorization(primeFactorize(n))}$，所以質因數是 ${factorText}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE611PrimeFactorizationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const values = buildPrimeFactorList(180);
    for (let i = 0; i < count; i += 1) {
      const n = pickFromList(values);
      const factorText = formatPrimeFactorization(primeFactorize(n));
      questions.push(`把 ${n} 做質因數分解，寫成標準分解式。`);
      summaryAnswers.push(`$${factorText}$`);
      answers.push(`簡答：$${factorText}$。過程：把 ${n} 連續除以質數，整理後得到標準分解式 $${factorText}$。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE611GcdDirectSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const pairs = [
      [30, 48],
      [54, 72],
      [70, 84],
      [48, 108],
      [81, 108],
      [36, 60],
      [56, 77],
      [52, 78],
      [24, 36],
      [45, 60],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = pickFromList(pairs);
      const g = gcd(a, b);
      questions.push(`找出 ${a} 和 ${b} 的最大公因數。`);
      summaryAnswers.push(`${g}`);
      answers.push(`簡答：${g}。過程：${a} 和 ${b} 的公因數中最大的是 ${g}，所以最大公因數是 ${g}。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE611GcdFactorFormSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const pairs = [
      [60, 84],
      [72, 108],
      [90, 150],
      [36, 54],
      [48, 72],
      [42, 70],
      [30, 45],
      [24, 90],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = pickFromList(pairs);
      const factorsA = formatPrimeFactorization(primeFactorize(a));
      const factorsB = formatPrimeFactorization(primeFactorize(b));
      const g = gcd(a, b);
      const common = formatPrimeFactorization(primeFactorize(g));
      questions.push(`已知 $${a}=${factorsA}$，$${b}=${factorsB}$，求 ${a} 和 ${b} 的最大公因數。`);
      summaryAnswers.push(`${g}`);
      answers.push(`簡答：${g}。過程：共同的質因數取較小次方，可得 $${common}$，所以最大公因數是 ${g}。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE611CoprimeJudgeSet(count) {
    const coprimePairs = [
      [9, 16],
      [19, 68],
      [18, 35],
      [8, 27],
      [14, 25],
      [21, 32],
    ];
    const nonCoprimePairs = [
      [36, 51],
      [15, 25],
      [24, 36],
      [18, 42],
      [14, 49],
      [20, 30],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const isCoprime = randInt(0, 1) === 0;
      const [a, b] = isCoprime ? pickFromList(coprimePairs) : pickFromList(nonCoprimePairs);
      const g = gcd(a, b);
      questions.push(`${a} 和 ${b} 是否互質？`);
      if (isCoprime) {
        summaryAnswers.push('是');
        answers.push(`簡答：是。過程：${a} 和 ${b} 的最大公因數是 1，所以這兩數互質。`);
      } else {
        summaryAnswers.push(`否，公因數有 ${g}`);
        answers.push(`簡答：否，公因數有 ${g}。過程：${a} 和 ${b} 的最大公因數是 ${g}，不是 1，所以不互質。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE611GroupingSet(count) {
    const contexts = [
      ['個奶油餅', '個蛋糕', '分給幾人'],
      ['顆蘋果', '顆水蜜桃', '裝幾盒'],
      ['本書', '枝鉛筆', '分給幾人'],
      ['顆藍球', '顆紅球', '裝幾袋'],
      ['位男生', '位女生', '分幾組'],
    ];
    const pairs = [
      [48, 60],
      [36, 24],
      [24, 30],
      [52, 78],
      [18, 24],
      [56, 77],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = pickFromList(pairs);
      const [unitA, unitB, askText] = pickFromList(contexts);
      const g = gcd(a, b);
      questions.push(`有 ${a}${unitA} 和 ${b}${unitB}，每一份都要一樣多，最多可以${askText}？`);
      summaryAnswers.push(`${g}`);
      answers.push(
        `簡答：${g}。過程：要分成最多份，而且每份一樣多，就是求 ${a} 和 ${b} 的最大公因數，所以答案是 ${g}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE611CutSquareSet(count) {
    const rectangles = [
      [84, 63],
      [96, 90],
      [24, 16],
      [108, 60],
      [40, 30],
      [125, 100],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [length, width] = pickFromList(rectangles);
      const g = gcd(length, width);
      questions.push(`一張長 ${length} 公分、寬 ${width} 公分的長方形紙，剪成最大的正方形，邊長是多少公分？`);
      summaryAnswers.push(`${g} 公分`);
      answers.push(`簡答：${g} 公分。過程：要剪成邊長最大的正方形，就是找長和寬的最大公因數，所以是 ${g} 公分。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE611LcmDirectSet(count) {
    const pairs = [
      [35, 49],
      [25, 30],
      [12, 18],
      [48, 84],
      [24, 18],
      [15, 21],
      [16, 20],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = pickFromList(pairs);
      const l = lcm(a, b);
      questions.push(`找出 ${a} 和 ${b} 的最小公倍數。`);
      summaryAnswers.push(`${l}`);
      answers.push(`簡答：${l}。過程：${a} 和 ${b} 的公倍數中最小的是 ${l}，所以最小公倍數是 ${l}。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE611LcmFactorFormSet(count) {
    const pairs = [
      [16, 18],
      [20, 36],
      [18, 30],
      [24, 40],
      [12, 45],
      [14, 21],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = pickFromList(pairs);
      const factorsA = formatPrimeFactorization(primeFactorize(a));
      const factorsB = formatPrimeFactorization(primeFactorize(b));
      const l = lcm(a, b);
      const factorText = formatPrimeFactorization(primeFactorize(l));
      questions.push(`已知 $${a}=${factorsA}$，$${b}=${factorsB}$，求 ${a} 和 ${b} 的最小公倍數。`);
      summaryAnswers.push(`${l}`);
      answers.push(`簡答：${l}。過程：全部質因數取較大次方，可得 $${factorText}$，所以最小公倍數是 ${l}。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE611LcmRelationSet(count) {
    const coprimePairs = [
      [5, 11],
      [8, 15],
      [16, 9],
      [7, 12],
    ];
    const multiplePairs = [
      [17, 51],
      [18, 54],
      [12, 60],
      [14, 42],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const askCoprime = randInt(0, 1) === 0;
      const [a, b] = askCoprime ? pickFromList(coprimePairs) : pickFromList(multiplePairs);
      const l = lcm(a, b);
      questions.push(`利用數的關係，求 ${a} 和 ${b} 的最小公倍數。`);
      if (askCoprime) {
        summaryAnswers.push(`${l}`);
        answers.push(`簡答：${l}。過程：${a} 和 ${b} 互質，所以最小公倍數等於兩數相乘：${a} × ${b} = ${l}。`);
      } else {
        const larger = Math.max(a, b);
        summaryAnswers.push(`${l}`);
        answers.push(`簡答：${l}。過程：${larger} 是另一數的倍數，所以最小公倍數就是較大的數 ${larger}。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE611PeriodicSyncSet(count) {
    const contexts = [
      ['公車', '15 分鐘一班', '公車', '25 分鐘一班', '下一次同時出現是幾分鐘後', '分鐘'],
      ['跑步', '5 天一次', '跑步', '3 天一次', '下次同一天進行是幾天後', '天'],
      ['噴水', '30 分鐘一次', '噴水', '45 分鐘一次', '下次同時噴水是多久後', '分鐘'],
      ['閃燈', '15 分鐘閃一次', '閃燈', '25 分鐘閃一次', '下次同時閃爍是多久後', '分鐘'],
    ];
    const values = [
      [15, 25],
      [5, 3],
      [30, 45],
      [15, 25],
      [4, 10],
      [4, 6],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const pair = pickFromList(values);
      const [a, b] = pair;
      const l = lcm(a, b);
      if (i % 5 === 4) {
        questions.push(`每隔 ${a} 公尺種一棵樹，每隔 ${b} 公尺設一盞燈，起點後第一個同時有樹與燈的地方距離起點多遠？`);
        summaryAnswers.push(`${l} 公尺`);
        answers.push(
          `簡答：${l} 公尺。過程：同時出現的位置要同時是 ${a} 和 ${b} 的倍數，所以找最小公倍數，答案是 ${l} 公尺。`
        );
      } else {
        const [nameA, textA, nameB, textB, askText, unit] = pickFromList(contexts);
        questions.push(`甲${nameA}${textA}，乙${nameB}${textB}，若現在同時開始，${askText}？`);
        summaryAnswers.push(`${l} ${unit}`);
        answers.push(`簡答：${l} ${unit}。過程：同時發生的間隔是 ${a} 和 ${b} 的最小公倍數，所以答案是 ${l} ${unit}。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE611AssembleSquareSet(count) {
    const rectangles = [
      [50, 70],
      [20, 12],
      [24, 42],
      [10, 8],
      [15, 18],
      [20, 16],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [length, width] = pickFromList(rectangles);
      const l = lcm(length, width);
      questions.push(`用長 ${length} 公分、寬 ${width} 公分的長方形拼成正方形，最短邊長是多少公分？`);
      summaryAnswers.push(`${l} 公分`);
      answers.push(
        `簡答：${l} 公分。過程：正方形邊長要同時是長 ${length} 和寬 ${width} 的倍數，所以取最小公倍數 ${l}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE611RangeMultipleSet(count) {
    const cases = [
      [300, 500, 16, 20],
      [200, 400, 15, 20],
      [400, 1000, 45, 60],
      [300, 550, 60, 90],
      [200, 450, 15, 21],
      [100, 200, 15, 18],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [start, end, a, b] = pickFromList(cases);
      const step = lcm(a, b);
      const values = [];
      for (let x = Math.ceil(start / step) * step; x <= end; x += step) {
        values.push(x);
      }
      questions.push(`找出 ${start} 到 ${end} 之間，${a} 和 ${b} 的所有公倍數。`);
      summaryAnswers.push(values.join('、'));
      answers.push(
        `簡答：${values.join('、')}。過程：先求 ${a} 和 ${b} 的最小公倍數為 ${step}，再從範圍內依序找它的倍數，所以答案是 ${values.join('、')}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE611MixedSet(banks, count) {
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

  function buildE611FoundationMixedSet(count) {
    return buildE611MixedSet(
      [buildE611PrimeCompositeJudgeSet, buildE611PrimeFactorListSet, buildE611PrimeFactorizationSet],
      count
    );
  }

  function buildE611GcdBasicMixedSet(count) {
    return buildE611MixedSet([buildE611GcdDirectSet, buildE611GcdFactorFormSet, buildE611CoprimeJudgeSet], count);
  }

  function buildE611GcdApplicationMixedSet(count) {
    return buildE611MixedSet([buildE611GroupingSet, buildE611CutSquareSet], count);
  }

  function buildE611LcmBasicMixedSet(count) {
    return buildE611MixedSet([buildE611LcmDirectSet, buildE611LcmFactorFormSet, buildE611LcmRelationSet], count);
  }

  function buildE611LcmApplicationMixedSet(count) {
    return buildE611MixedSet([buildE611PeriodicSyncSet, buildE611AssembleSquareSet, buildE611RangeMultipleSet], count);
  }

  function e612PickSimpleFraction(allowImproper = false) {
    const den = pickFromList([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
    let num = allowImproper ? randInt(1, den * 2 - 1) : randInt(1, den - 1);
    while (gcd(num, den) !== 1) num = allowImproper ? randInt(1, den * 2 - 1) : randInt(1, den - 1);
    return makeFraction(num, den);
  }

  function e612IntegerFromUnit(unitChoices = [2, 3, 4, 5, 6, 7, 8, 9]) {
    const unit = pickFromList(unitChoices);
    const factor = randInt(2, 8);
    return {
      unit,
      total: unit * factor,
      factor,
    };
  }

  function e612FractionQuestionText(left, right) {
    return `${integerOrFractionLatex(left)}\\div${integerOrFractionLatex(right)}`;
  }

  function e612AnswerMixedText(frac) {
    return integerOrFractionLatex(frac, true);
  }

  function e612CompareValue(left, right) {
    const l = makeFraction(left.num, left.den);
    const r = makeFraction(right.num, right.den);
    return l.num * r.den - r.num * l.den;
  }

  function buildE612SimplifyFractionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      [33, 88],
      [64, 36],
      [25, 10],
      [45, 21],
      [118, 48],
      [84, 126],
      [52, 78],
      [72, 108],
    ];
    for (let i = 0; i < count; i += 1) {
      const [num, den] = pickFromList(cases);
      const reduced = makeFraction(num, den);
      questions.push(`將 \\(${num}/${den}\\) 化為最簡分數。`);
      summaryAnswers.push(`$${fractionToLatex(reduced, true)}$`);
      answers.push(
        `簡答：$${fractionToLatex(reduced, true)}$。過程：分子與分母同除以最大公因數 ${gcd(num, den)}，得到最簡分數 $${fractionToLatex(reduced, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE612SameDenominatorDivisionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const den = pickFromList([6, 7, 8, 9, 10, 11, 12, 13]);
      const divisorNum = randInt(1, den - 1);
      const q = randInt(2, 7);
      const dividendNum = divisorNum * q;
      if (dividendNum > den * 2) {
        i -= 1;
        continue;
      }
      const left = makeFraction(dividendNum, den);
      const right = makeFraction(divisorNum, den);
      const result = makeFraction(q, 1);
      questions.push(`計算：\\(${fractionToLatex(left)}\\div${fractionToLatex(right)}\\)`);
      summaryAnswers.push(`$${fractionToLatex(result)}$`);
      answers.push(
        `簡答：$${fractionToLatex(result)}$。過程：同分母分數相除，可先看成分子相除：${dividendNum} ÷ ${divisorNum} = ${q}，所以結果是 $${fractionToLatex(result)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE612IntegerDivideFractionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const divisor = e612PickSimpleFraction(false);
      const resultInt = randInt(4, 20);
      const left = makeFraction(resultInt * divisor.num, divisor.den);
      if (left.den !== 1) {
        i -= 1;
        continue;
      }
      const dividend = makeFraction(left.num, 1);
      const result = divFraction(dividend, divisor);
      questions.push(`計算：\\(${fractionToLatex(dividend)}\\div${fractionToLatex(divisor)}\\)`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `簡答：$${fractionToLatex(result, true)}$。過程：整數先看成分母是 1 的分數，再乘除數的倒數：\\(${fractionToLatex(dividend)}\\div${fractionToLatex(divisor)}=${fractionToLatex(dividend)}\\times\\frac{${divisor.den}}{${divisor.num}}=${fractionToLatex(result, true)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE612GeneralFractionDivisionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const left =
        randInt(0, 1) === 0 ? e612PickSimpleFraction(true) : randomMixedFraction(1, 3, [2, 3, 4, 5, 6, 7, 8], false);
      const right =
        randInt(0, 1) === 0 ? e612PickSimpleFraction(false) : randomMixedFraction(1, 2, [2, 3, 4, 5, 6, 8], false);
      const result = divFraction(left, right);
      questions.push(`計算：\\(${e612FractionQuestionText(left, right)}\\)`);
      summaryAnswers.push(`$${e612AnswerMixedText(result)}$`);
      answers.push(
        `簡答：$${e612AnswerMixedText(result)}$。過程：除以分數等於乘它的倒數，所以 \\(${integerOrFractionLatex(left)}\\div${integerOrFractionLatex(right)}=${integerOrFractionLatex(left)}\\times\\frac{${right.den}}{${right.num}}=${e612AnswerMixedText(result)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE612PartitionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['公升的紅茶', '公升裝 1 瓶', '瓶'],
      ['公尺的棉繩', '公尺剪 1 段', '段'],
      ['公升的辣油', '公升裝 1 罐', '罐'],
      ['公斤的麵粉', '公斤裝一小袋', '袋'],
    ];
    for (let i = 0; i < count; i += 1) {
      const unit = e612IntegerFromUnit([2, 3, 4, 5, 6, 8]);
      const den = pickFromList([2, 3, 4, 5, 6, 8]);
      const total = makeFraction(unit.total, den);
      const part = makeFraction(unit.unit, den);
      const result = divFraction(total, part);
      const [noun, action, resultUnit] = pickFromList(contexts);
      questions.push(
        `某物有 \\(${fractionToLatex(total, true)}\\) ${noun}，每 \\(${fractionToLatex(part, true)}\\) ${action}，可以分成幾${resultUnit}？`
      );
      summaryAnswers.push(`$${fractionToLatex(result)}$`);
      answers.push(
        `簡答：$${fractionToLatex(result)}$ ${resultUnit}。過程：總量 ÷ 每一份 = \\(${fractionToLatex(total, true)}\\div${fractionToLatex(part, true)}=${fractionToLatex(result)}\\)，所以可分成 ${fractionToLatex(result)} ${resultUnit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE612ComparisonSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base =
        randInt(0, 1) === 0 ? e612PickSimpleFraction(true) : randomMixedFraction(1, 3, [2, 3, 4, 5, 6, 8], false);
      const divisor = pickFromList([
        makeFraction(1, 2),
        makeFraction(2, 3),
        makeFraction(3, 2),
        makeFraction(5, 4),
        makeFraction(base.num, base.den),
      ]);
      const quotient = divFraction(base, divisor);
      const compareBase = e612CompareValue(quotient, base);
      const compareOne = e612CompareValue(divisor, makeFraction(1, 1));
      const larger = compareBase > 0 ? '商較大' : compareBase < 0 ? '原分數較大' : '一樣大';
      const reason =
        compareOne < 0
          ? '因為除數小於 1，商會變大'
          : compareOne > 0
            ? '因為除數大於 1，商會變小'
            : '因為除以自己，結果就是 1';
      questions.push(
        `不先計算，判斷 \\(${integerOrFractionLatex(base)}\\div${integerOrFractionLatex(divisor)}\\) 和 \\(${integerOrFractionLatex(base)}\\) 誰比較大？`
      );
      summaryAnswers.push(larger);
      answers.push(
        `簡答：${larger}。過程：${reason}。本題中 \\(${integerOrFractionLatex(base)}\\div${integerOrFractionLatex(divisor)}=${integerOrFractionLatex(quotient, true)}\\)，所以判斷為「${larger}」。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE612UnitRateSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['公斤的甜桃花了', '元，1 公斤甜桃多少元', '元'],
      ['公升的牛奶售價', '元，平均 1 公升多少元', '元'],
      ['公尺的鐵絲花了', '元，1 公尺鐵絲多少元', '元'],
      ['公斤的玉米花了', '元，1 公斤玉米多少元', '元'],
    ];
    for (let i = 0; i < count; i += 1) {
      const oneValue = pickFromList([9, 12, 15, 18, 21, 24, 27, 30, 36]);
      const quantity =
        randInt(0, 1) === 0 ? e612PickSimpleFraction(true) : randomMixedFraction(1, 4, [2, 3, 4, 5, 6, 8], false);
      const totalCost = mulFraction(quantity, makeFraction(oneValue, 1));
      if (totalCost.den !== 1) {
        i -= 1;
        continue;
      }
      const [leftText, midText, unit] = pickFromList(contexts);
      questions.push(`買 \\(${integerOrFractionLatex(quantity, true)}\\) ${leftText} ${totalCost.num} ${midText}？`);
      summaryAnswers.push(`${oneValue} ${unit}`);
      answers.push(
        `簡答：${oneValue} ${unit}。過程：單位量 = 總價 ÷ 數量 = \\(${totalCost.num}\\div${integerOrFractionLatex(quantity, true)}=${oneValue}\\)，所以答案是 ${oneValue} ${unit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE612GeometryInverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      ['長方形海報', '面積', '平方公尺', '寬', '公尺', '長'],
      ['長方形菜園', '面積', '平方公尺', '長', '公尺', '寬'],
      ['平行四邊形', '面積', '平方公分', '底', '公分', '高'],
      ['正方形', '周長', '公尺', '4', '邊長', '公尺'],
    ];
    for (let i = 0; i < count; i += 1) {
      const pick = pickFromList(cases);
      if (pick[0] === '正方形') {
        const side = randInt(1, 6);
        const fracSide = makeFraction(side * 3 + 1, 2); // x.5 or integer
        const perimeter = mulFraction(fracSide, makeFraction(4, 1));
        questions.push(`一個周長是 \\(${integerOrFractionLatex(perimeter, true)}\\) 公尺的正方形，邊長是多少公尺？`);
        summaryAnswers.push(`$${integerOrFractionLatex(fracSide, true)}$`);
        answers.push(
          `簡答：$${integerOrFractionLatex(fracSide, true)}$ 公尺。過程：正方形邊長 = 周長 ÷ 4 = \\(${integerOrFractionLatex(perimeter, true)}\\div4=${integerOrFractionLatex(fracSide, true)}\\)。`
        );
      } else {
        const target = randInt(2, 6);
        const divisor =
          randInt(0, 1) === 0 ? e612PickSimpleFraction(true) : randomMixedFraction(1, 4, [2, 3, 4, 5, 6, 8], false);
        const total = mulFraction(makeFraction(target, 1), divisor);
        const [shape, totalName, totalUnit, knownSide, sideUnit, askSide] = pick;
        questions.push(
          `${shape}${totalName}是 \\(${integerOrFractionLatex(total, true)}\\) ${totalUnit}，${knownSide}是 \\(${integerOrFractionLatex(divisor, true)}\\) ${sideUnit}，${askSide}是多少${sideUnit}？`
        );
        summaryAnswers.push(`$${target}$`);
        answers.push(
          `簡答：$${target}$ ${sideUnit}。過程：要求另一邊，就是用 ${totalName} ÷ 已知一邊：\\(${integerOrFractionLatex(total, true)}\\div${integerOrFractionLatex(divisor, true)}=${target}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE612PartToWholeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      {
        unit: '頁',
        build: (partText, ratioText) => `看了 ${partText} 頁，占整本故事書的 ${ratioText}，整本故事書共有幾頁？`,
      },
      {
        unit: '公里',
        build: (partText, ratioText) => `已經鋪了 ${partText} 公里，占整條馬路的 ${ratioText}，這條馬路全長幾公里？`,
      },
      {
        unit: '人',
        build: (partText, ratioText) => `男學生有 ${partText} 人，占六年級學生的 ${ratioText}，六年級學生共有幾人？`,
      },
      {
        unit: '人',
        build: (partText, ratioText) => `六年級女生有 ${partText} 人，占全體學生的 ${ratioText}，六年級學生共有幾人？`,
      },
      {
        unit: '隻',
        build: (partText, ratioText) => `公羊有 ${partText} 隻，占全部綿羊的 ${ratioText}，全部共有幾隻？`,
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const part = pickFromList([20, 24, 36, 48, 72, 88, 96, 120]);
      const ratio = pickFromList([
        makeFraction(2, 3),
        makeFraction(5, 8),
        makeFraction(9, 14),
        makeFraction(11, 25),
        makeFraction(3, 5),
      ]);
      const whole = divFraction(makeFraction(part, 1), ratio);
      if (whole.den !== 1) {
        i -= 1;
        continue;
      }
      const picked = pickFromList(contexts);
      const ratioText = `\\(${fractionToLatex(ratio)}\\)`;
      questions.push(picked.build(part, ratioText));
      summaryAnswers.push(`${whole.num} ${picked.unit}`);
      answers.push(
        `簡答：${whole.num} ${picked.unit}。過程：整體量 = 部分量 ÷ 所占分率 = \\(${part}\\div${fractionToLatex(ratio)}=${whole.num}\\)，所以答案是 ${whole.num} ${picked.unit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE612RateApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = randInt(0, 1);
      const quantity =
        randInt(0, 1) === 0 ? randomMixedFraction(1, 6, [2, 3, 4, 5, 6, 8], false) : e612PickSimpleFraction(true);
      const unitValue = pickFromList([2, 3, 4, 5, 6, 8, 9, 10, 12]);
      const total = mulFraction(quantity, makeFraction(unitValue, 1));
      if (mode === 0) {
        const contexts = [
          ['蝸牛移動', '小時走了', '公里', '移動 1 公里需要幾小時', '小時'],
          ['注水時間', '分鐘注水', '公升', '注滿 1 公升需要幾分鐘', '分鐘'],
          ['編織長度', '小時織了', '公尺', '織 1 公尺需要幾小時', '小時'],
        ];
        const [name, timeText, amountUnit, askText, answerUnit] = pickFromList(contexts);
        const result = divFraction(quantity, total);
        questions.push(
          `${name}：在 \\(${integerOrFractionLatex(quantity, true)}\\) ${timeText} \\(${integerOrFractionLatex(total, true)}\\) ${amountUnit}，${askText}？`
        );
        summaryAnswers.push(`$${integerOrFractionLatex(result, true)}$ ${answerUnit}`);
        answers.push(
          `簡答：$${integerOrFractionLatex(result, true)}$ ${answerUnit}。過程：要求每 1 ${amountUnit} 需要多少${answerUnit}，要用時間（或份數）÷ 總量：\\(${integerOrFractionLatex(quantity, true)}\\div${integerOrFractionLatex(total, true)}=${integerOrFractionLatex(result, true)}\\)。`
        );
      } else {
        const [name, amountUnit, answerUnit] = pickFromList([
          ['騎車距離', '公里', '公里'],
          ['注水速度', '公升', '公升'],
          ['編織速度', '公尺', '公尺'],
        ]);
        const result = divFraction(total, quantity);
        questions.push(
          `${name}：在 \\(${integerOrFractionLatex(quantity, true)}\\) 小時內完成 \\(${integerOrFractionLatex(total, true)}\\) ${amountUnit}，那麼 1 小時可完成多少${amountUnit}？`
        );
        summaryAnswers.push(`$${integerOrFractionLatex(result, true)}$ ${answerUnit}`);
        answers.push(
          `簡答：$${integerOrFractionLatex(result, true)}$ ${answerUnit}。過程：要求每 1 小時可完成多少${amountUnit}，要用總量 ÷ 時間：\\(${integerOrFractionLatex(total, true)}\\div${integerOrFractionLatex(quantity, true)}=${integerOrFractionLatex(result, true)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }


  function buildE612RemainderCutSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // Each case: {total as [num,den], each as [num,den], pieces, remainder as [num,den]}
    // Verified: total = pieces×each + remainder, remainder < each
    const cases = [
      { totalN: 7,  totalD: 2, eachN: 5, eachD: 8, pieces: 5, remN: 3,  remD: 8  }, // 3.5 ÷ 5/8
      { totalN: 17, totalD: 4, eachN: 3, eachD: 8, pieces:11, remN: 1,  remD: 8  }, // 4.25 ÷ 3/8
      { totalN: 11, totalD: 2, eachN: 3, eachD: 4, pieces: 7, remN: 1,  remD: 4  }, // 5.5 ÷ 3/4
      { totalN: 8,  totalD: 3, eachN: 5, eachD: 6, pieces: 3, remN: 1,  remD: 6  }, // 2 2/3 ÷ 5/6
      { totalN: 9,  totalD: 2, eachN: 5, eachD: 6, pieces: 5, remN: 1,  remD: 3  }, // 4.5 ÷ 5/6
      { totalN: 13, totalD: 4, eachN: 5, eachD: 8, pieces: 5, remN: 1,  remD: 8  }, // 3.25 ÷ 5/8
      { totalN: 14, totalD: 3, eachN: 3, eachD: 4, pieces: 6, remN: 1,  remD: 6  }, // 4 2/3 ÷ 3/4
      { totalN: 13, totalD: 2, eachN: 3, eachD: 4, pieces: 8, remN: 1,  remD: 2  }, // 6.5 ÷ 3/4
    ];
    const ctxs = [
      ['緞帶', '公尺', '段', '公尺'],
      ['繩子', '公尺', '段', '公尺'],
      ['彩帶', '公尺', '段', '公尺'],
      ['鐵絲', '公尺', '段', '公尺'],
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      const [item, lengthUnit, pieceUnit, remUnit] = ctxs[i % ctxs.length];
      const totalStr = c.totalD === 1 ? `${c.totalN}` : (c.totalN % c.totalD === 0 ? `${c.totalN / c.totalD}` : (c.totalN > c.totalD ? `${Math.floor(c.totalN/c.totalD)}\\frac{${c.totalN % c.totalD}}{${c.totalD}}` : `\\frac{${c.totalN}}{${c.totalD}}`));
      const eachStr = `\\frac{${c.eachN}}{${c.eachD}}`;
      const remStr = c.remN === 0 ? '0' : (c.remN === c.remD ? '1' : `\\frac{${c.remN}}{${c.remD}}`);
      questions.push(`一條${item}長 $${totalStr}$ ${lengthUnit}，每 $${eachStr}$ ${lengthUnit}剪一段，最多可以剪幾段？剩下多少${remUnit}？`);
      summaryAnswers.push(`${c.pieces}段，餘$${remStr}$${remUnit}`);
      answers.push(`簡答：${c.pieces}段，餘$${remStr}$${remUnit}。過程：$${totalStr}\\div${eachStr}=${c.pieces}$⋯餘$${remStr}$，所以最多剪${c.pieces}段，剩下$${remStr}$${remUnit}。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE612MixedSet(banks, count) {
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

  function buildE612BasicsMixedSet(count) {
    return buildE612MixedSet(
      [
        buildE612SimplifyFractionSet,
        buildE612SameDenominatorDivisionSet,
        buildE612IntegerDivideFractionSet,
        buildE612GeneralFractionDivisionSet,
      ],
      count
    );
  }

  function buildE612ComparisonMixedSet(count) {
    return buildE612MixedSet([buildE612ComparisonSet], count);
  }

  function buildE612UnitMixedSet(count) {
    return buildE612MixedSet([buildE612PartitionSet, buildE612UnitRateSet], count);
  }

  function buildE612GeometryMixedSet(count) {
    return buildE612MixedSet([buildE612GeometryInverseSet], count);
  }

  function buildE612WholeMixedSet(count) {
    return buildE612MixedSet([buildE612PartToWholeSet], count);
  }

  function buildE612RateMixedSet(count) {
    return buildE612MixedSet([buildE612RateApplicationSet], count);
  }

  function buildE613SumInvariantSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      {
        unit: '格',
        build(total, known) {
          return `停車場共有 ${total} 格車位，已停了 ${known} 輛車，還有幾格空位？`;
        },
      },
      {
        unit: '頁',
        build(total, known) {
          return `一本故事書共有 ${total} 頁，今天已讀了 ${known} 頁，還剩幾頁沒讀？`;
        },
      },
      {
        unit: '小時',
        build(total, known) {
          return `一天共有 ${total} 小時，白天用了 ${known} 小時，夜晚有幾小時？`;
        },
      },
      {
        unit: '個',
        build(total, known) {
          return `電影院共有 ${total} 個座位，已賣出 ${known} 張票，還有幾個空位？`;
        },
      },
      {
        unit: '塊',
        build(total, known) {
          return `姐姐和妹妹一共吃了 ${total} 塊餅乾，姐姐吃了 ${known} 塊，妹妹吃了幾塊？`;
        },
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const total = pickFromList([24, 50, 72, 96, 120, 125, 180, 240, 352]);
      const known = randInt(Math.max(3, Math.floor(total / 6)), Math.floor((total * 4) / 5));
      const result = total - known;
      const picked = pickFromList(contexts);
      questions.push(picked.build(total, known));
      summaryAnswers.push(`${result} ${picked.unit}`);
      answers.push(
        `簡答：${result} ${picked.unit}。過程：這類是和不變，已知量 + 未知量 = 總量，所以未知量 = ${total} - ${known} = ${result}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE613DifferenceInvariantSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const namePairs = [
      ['爸爸', '兒子'],
      ['媽媽', '女兒'],
      ['哥哥', '弟弟'],
      ['姐姐', '妹妹'],
      ['阿姨', '小莉'],
    ];

    for (let i = 0; i < count; i += 1) {
      const mode = randInt(0, 2);
      if (mode === 0) {
        const [olderName, youngerName] = pickFromList(namePairs);
        const diff = randInt(12, 36);
        const youngerNow = randInt(4, 18);
        const olderNow = youngerNow + diff;
        const afterYears = randInt(2, 12);
        const result = youngerNow + afterYears;
        questions.push(
          `${olderName}今年 ${olderNow} 歲，${youngerName}今年 ${youngerNow} 歲。${afterYears} 年後，${youngerName}幾歲？`
        );
        summaryAnswers.push(`${result} 歲`);
        answers.push(
          `簡答：${result} 歲。過程：兩人的年齡差 ${diff} 歲會保持不變，但經過 ${afterYears} 年兩人都一起增加 ${afterYears} 歲，所以 ${youngerName}是 ${youngerNow} + ${afterYears} = ${result} 歲。`
        );
        continue;
      }

      if (mode === 1) {
        const [olderName, youngerName] = pickFromList(namePairs);
        const olderPast = randInt(18, 40);
        const youngerPast = randInt(1, olderPast - 8);
        const diff = olderPast - youngerPast;
        const youngerFuture = youngerPast + randInt(5, 14);
        const result = youngerFuture + diff;
        questions.push(
          `已知 ${olderName} ${olderPast} 歲時，${youngerName} ${youngerPast} 歲。當 ${youngerName} ${youngerFuture} 歲時，${olderName}幾歲？`
        );
        summaryAnswers.push(`${result} 歲`);
        answers.push(
          `簡答：${result} 歲。過程：兩人的年齡差固定是 ${olderPast} - ${youngerPast} = ${diff} 歲，所以當 ${youngerName} ${youngerFuture} 歲時，${olderName}是 ${youngerFuture} + ${diff} = ${result} 歲。`
        );
        continue;
      }

      const rocYear = randInt(80, 120);
      const civilYear = rocYear + 1911;
      if (randInt(0, 1) === 0) {
        questions.push(`民國 ${rocYear} 年是西元幾年？`);
        summaryAnswers.push(`${civilYear} 年`);
        answers.push(
          `簡答：${civilYear} 年。過程：西元年和民國年的差固定是 1911，所以西元年 = 民國年 + 1911 = ${rocYear} + 1911 = ${civilYear}。`
        );
      } else {
        questions.push(`西元 ${civilYear} 年是民國幾年？`);
        summaryAnswers.push(`民國 ${rocYear} 年`);
        answers.push(
          `簡答：民國 ${rocYear} 年。過程：民國年和西元年的差固定是 1911，所以民國年 = 西元年 - 1911 = ${civilYear} - 1911 = ${rocYear}。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE613RatioInvariantSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      {
        build(unitValue, q1, total1, q2, total2) {
          return `一枝螢光筆賣 ${unitValue} 元，買 ${q1} 枝要 ${total1} 元。若買 ${q2} 枝，要多少元？`;
        },
        answer(total2) {
          return `${total2} 元`;
        },
      },
      {
        build(unitValue, q1, total1, q2, total2) {
          return `工程隊每天鋪 ${unitValue} 公尺，${q1} 天共鋪 ${total1} 公尺。照這個速度，${q2} 天可鋪幾公尺？`;
        },
        answer(total2) {
          return `${total2} 公尺`;
        },
      },
      {
        build(unitValue, q1, total1, q2, total2) {
          return `點數兌換規則固定，${total1} 點可換 ${q1} 盒獎品。若有 ${total2} 點，可換幾盒獎品？`;
        },
        answer(q2) {
          return `${q2} 盒`;
        },
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const picked = pickFromList(contexts);
      const unitValue = pickFromList([6, 8, 10, 12, 15, 18, 20, 23, 25, 30]);
      const q1 = randInt(3, 9);
      const q2 = randInt(10, 20);
      const total1 = unitValue * q1;
      const total2 = unitValue * q2;
      questions.push(picked.build(unitValue, q1, total1, q2, total2));
      const resultText = picked === contexts[2] ? picked.answer(q2) : picked.answer(total2);
      summaryAnswers.push(resultText);
      answers.push(
        `簡答：${resultText}。過程：這類是商不變，單價（或每日進度、兌換比）固定，所以總量 ÷ 數量 = ${unitValue}。依此可得答案。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE613ProductInvariantSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      {
        unit: '杯',
        build(total, each) {
          return `一壺紅茶共有 ${total} 毫升，每杯裝 ${each} 毫升，可以裝幾杯？`;
        },
      },
      {
        unit: '組',
        build(total, each) {
          return `全班共有 ${total} 人，每組 ${each} 人，可以分成幾組？`;
        },
      },
      {
        unit: '天',
        build(total, each) {
          return `要存到 ${total} 元，每天存 ${each} 元，需要幾天？`;
        },
      },
      {
        unit: '分鐘',
        build(total, each) {
          return `浴缸共有 ${total} 公升水，每分鐘注入 ${each} 公升，要幾分鐘才會注滿？`;
        },
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const each = pickFromList([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25]);
      const factor = randInt(4, 15);
      const total = each * factor;
      const picked = pickFromList(contexts);
      questions.push(picked.build(total, each));
      summaryAnswers.push(`${factor} ${picked.unit}`);
      answers.push(
        `簡答：${factor} ${picked.unit}。過程：這類是積不變，總量 = 每份量 × 份數，所以份數 = ${total} ÷ ${each} = ${factor}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE613GrowthBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      { noun: '個咖啡杯', unit: '公分', baseMin: 3, baseMax: 15, incMin: 2, incMax: 6 },
      { noun: '部推車', unit: '公分', baseMin: 40, baseMax: 90, incMin: 6, incMax: 20 },
      { noun: '個花盆', unit: '公分', baseMin: 8, baseMax: 18, incMin: 3, incMax: 8 },
      { noun: '張椅子', unit: '公分', baseMin: 35, baseMax: 60, incMin: 4, incMax: 10 },
    ];

    for (let i = 0; i < count; i += 1) {
      const picked = pickFromList(contexts);
      const base = randInt(picked.baseMin, picked.baseMax);
      const inc = randInt(picked.incMin, picked.incMax);
      const n = randInt(4, 20);
      const result = base + inc * (n - 1);
      questions.push(
        `疊 ${n} ${picked.noun}時，高度（或總長）規律是「第 1 個 ${base}${picked.unit}，之後每多 1 個增加 ${inc}${picked.unit}」，求疊 ${n} 個時是多少${picked.unit}？`
      );
      summaryAnswers.push(`${result} ${picked.unit}`);
      answers.push(
        `簡答：${result} ${picked.unit}。過程：規律是「第 1 個 + 增加量 × (個數 - 1)」，所以 ${base} + ${inc} × (${n} - 1) = ${result}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE613GrowthInverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = randInt(0, 1);
      const base = randInt(36, 120);
      const inc = randInt(3, 18);

      if (mode === 0) {
        const second = base + inc;
        const n = randInt(6, 18);
        const result = base + inc * (n - 1);
        questions.push(
          `某種推車接排規律為：1 部長 ${base} 公分，2 部長 ${second} 公分。照此規律，${n} 部接排長幾公分？`
        );
        summaryAnswers.push(`${result} 公分`);
        answers.push(
          `簡答：${result} 公分。過程：每多 1 部就增加 ${second} - ${base} = ${inc} 公分，所以 ${n} 部長度是 ${base} + ${inc} × (${n} - 1) = ${result}。`
        );
        continue;
      }

      const n1 = randInt(8, 12);
      const n2 = randInt(n1 + 3, n1 + 8);
      const len1 = base + inc * (n1 - 1);
      const len2 = base + inc * (n2 - 1);
      questions.push(`${n1} 部推車接排長 ${len1} 公分，${n2} 部推車接排長 ${len2} 公分，求 1 部推車長幾公分？`);
      summaryAnswers.push(`${base} 公分`);
      answers.push(
        `簡答：${base} 公分。過程：每多 ${n2 - n1} 部增加 ${len2 - len1} 公分，所以每多 1 部增加 ${(len2 - len1) / (n2 - n1)} 公分。再由 ${len1} 倒推，1 部長 ${base} 公分。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE613IntervalBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = randInt(0, 2);
      const spacing = pickFromList([2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 25, 30, 45, 90]);

      if (mode === 0) {
        const intervals = randInt(8, 30);
        const length = spacing * intervals;
        const result = intervals + 1;
        questions.push(`一條長 ${length} 公尺的路，每隔 ${spacing} 公尺設一盞路燈，兩端都設，共需要幾盞？`);
        summaryAnswers.push(`${result} 盞`);
        answers.push(
          `簡答：${result} 盞。過程：先算間隔數 = ${length} ÷ ${spacing} = ${intervals}，兩端都設時，物體數 = 間隔數 + 1，所以是 ${intervals} + 1 = ${result}。`
        );
        continue;
      }

      if (mode === 1) {
        const intervals = randInt(10, 30);
        const length = spacing * intervals;
        const result = intervals - 1;
        questions.push(`一段長 ${length} 公尺的道路，每隔 ${spacing} 公尺設一路燈，兩端都不設，共需要幾盞？`);
        summaryAnswers.push(`${result} 盞`);
        answers.push(
          `簡答：${result} 盞。過程：間隔數 = ${length} ÷ ${spacing} = ${intervals}，兩端都不設時，物體數 = 間隔數 - 1，所以是 ${intervals} - 1 = ${result}。`
        );
        continue;
      }

      const countOnCircle = randInt(6, 24);
      const perimeter = spacing * countOnCircle;
      questions.push(`圓形跑道周長 ${perimeter} 公尺，每隔 ${spacing} 公尺設一個標記，共設了幾個標記？`);
      summaryAnswers.push(`${countOnCircle} 個`);
      answers.push(
        `簡答：${countOnCircle} 個。過程：圓形封閉時，標記數 = 間隔數，所以 ${perimeter} ÷ ${spacing} = ${countOnCircle}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE613IntervalIndexDistanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['路燈', '公尺'],
      ['樹', '公尺'],
      ['座位', '排'],
      ['電線桿', '公尺'],
    ];

    for (let i = 0; i < count; i += 1) {
      const [noun, unit] = pickFromList(contexts);
      const spacing = pickFromList(unit === '排' ? [1] : [5, 6, 8, 10, 12, 15, 18, 20, 25]);
      const start = randInt(5, 80);
      const end = start + randInt(8, 40);
      const result = (end - start) * spacing;
      const spacingText = unit === '排' ? `每 1 ${unit}算 1 個間隔` : `每隔 ${spacing} ${unit}一個`;
      questions.push(`${noun}${spacingText}，第 ${start} 個到第 ${end} 個相距多少${unit === '排' ? unit : '公尺'}？`);
      summaryAnswers.push(`${result} ${unit === '排' ? unit : '公尺'}`);
      answers.push(
        `簡答：${result} ${unit === '排' ? unit : '公尺'}。過程：中間有 ${end} - ${start} = ${end - start} 個間隔，所以距離是 ${end - start} × ${spacing} = ${result}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE613CycleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const patterns = [
      ['□', '○', '△', '◇', '○', '◇'],
      ['紅', '橙', '黃', '綠', '藍', '靛', '紫'],
      ['窗', '走', '走', '窗'],
      ['下', '中', '上'],
      ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'],
    ];

    for (let i = 0; i < count; i += 1) {
      const pattern = pickFromList(patterns);
      const n = randInt(pattern.length * 2, pattern.length * 8);
      const remainder = (n - 1) % pattern.length;
      const result = pattern[remainder];
      questions.push(`依照規律「${pattern.join('、')}」重複排列，第 ${n} 個是什麼？`);
      summaryAnswers.push(`${result}`);
      answers.push(
        `簡答：${result}。過程：每 ${pattern.length} 個一循環，${n} - 1 = ${n - 1}，餘 ${remainder}，所以對應到第 ${remainder + 1} 個，是 ${result}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE613ChickenRabbitSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      {
        aName: '雞',
        bName: '兔',
        aUnit: '隻',
        bUnit: '隻',
        attrA: 2,
        attrB: 4,
        attrUnit: '隻腳',
        build(totalCount, totalAttr) {
          return `雞和兔共 ${totalCount} 隻，共有 ${totalAttr} 隻腳，雞、兔各有幾隻？`;
        },
      },
      {
        aName: '10 元硬幣',
        bName: '50 元硬幣',
        aUnit: '枚',
        bUnit: '枚',
        attrA: 10,
        attrB: 50,
        attrUnit: '元',
        build(totalCount, totalAttr) {
          return `10 元和 50 元硬幣共 ${totalCount} 枚，總值 ${totalAttr} 元，各有幾枚？`;
        },
      },
      {
        aName: '圓桌',
        bName: '方桌',
        aUnit: '張',
        bUnit: '張',
        attrA: 10,
        attrB: 4,
        attrUnit: '個座位',
        build(totalCount, totalAttr) {
          return `圓桌和方桌共 ${totalCount} 張，全部坐滿共有 ${totalAttr} 個座位，圓桌、方桌各幾張？`;
        },
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const picked = pickFromList(contexts);
      const aCount = randInt(2, 10);
      const bCount = randInt(2, 10);
      const totalCount = aCount + bCount;
      const totalAttr = aCount * picked.attrA + bCount * picked.attrB;
      questions.push(picked.build(totalCount, totalAttr));
      summaryAnswers.push(`${picked.aName} ${aCount}${picked.aUnit}、${picked.bName} ${bCount}${picked.bUnit}`);
      answers.push(
        `簡答：${picked.aName} ${aCount}${picked.aUnit}、${picked.bName} ${bCount}${picked.bUnit}。過程：先假設全部都是${picked.aName}，則會有 ${totalCount * picked.attrA}${picked.attrUnit}；和實際的 ${totalAttr}${picked.attrUnit} 相差 ${totalAttr - totalCount * picked.attrA}。每把 1 個${picked.aName}換成 1 個${picked.bName}，會多 ${picked.attrB - picked.attrA}${picked.attrUnit}，所以 ${picked.bName}有 ${(totalAttr - totalCount * picked.attrA) / (picked.attrB - picked.attrA)}${picked.bUnit}，再求得 ${picked.aName}有 ${aCount}${picked.aUnit}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE613MixedSet(banks, count) {
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

  function buildE613SumMixedSet(count) {
    return buildE613MixedSet([buildE613SumInvariantSet], count);
  }

  function buildE613DifferenceMixedSet(count) {
    return buildE613MixedSet([buildE613DifferenceInvariantSet], count);
  }

  function buildE613RatioMixedSet(count) {
    return buildE613MixedSet([buildE613RatioInvariantSet], count);
  }

  function buildE613ProductMixedSet(count) {
    return buildE613MixedSet([buildE613ProductInvariantSet], count);
  }

  function buildE613GrowthMixedSet(count) {
    return buildE613MixedSet([buildE613GrowthBasicSet, buildE613GrowthInverseSet], count);
  }

  function buildE613IntervalMixedSet(count) {
    return buildE613MixedSet([buildE613IntervalBasicSet, buildE613IntervalIndexDistanceSet], count);
  }

  function buildE613CycleMixedSet(count) {
    return buildE613MixedSet([buildE613CycleSet], count);
  }

  function buildE613ChickenRabbitMixedSet(count) {
    return buildE613MixedSet([buildE613ChickenRabbitSet], count);
  }

  function e614DecimalText(frac) {
    return e621FractionToDecimalText(makeFraction(frac.num, frac.den));
  }

  function e614DecimalPlaces(text) {
    const source = String(text || '');
    const index = source.indexOf('.');
    return index < 0 ? 0 : source.length - index - 1;
  }

  function e614PickPositiveDecimal({ minInt = 0, maxInt = 30, places = [1, 2], allowInteger = false } = {}) {
    while (true) {
      const place = pickFromList(places);
      const den = 10 ** place;
      const minNumer = Math.max(1, minInt * den);
      const maxNumer = maxInt * den;
      const numer = randInt(minNumer, maxNumer);
      if (!allowInteger && numer % den === 0) continue;
      return makeFraction(numer, den);
    }
  }

  function e614RoundFractionText(frac, digits) {
    const value = frac.num / frac.den;
    return trimDecimalString(value.toFixed(digits));
  }

  function e614CompareFraction(a, b) {
    return a.num * b.den - b.num * a.den;
  }

  function e614BuildScaledExpression(dividend, divisor) {
    const dividendText = e614DecimalText(dividend);
    const divisorText = e614DecimalText(divisor);
    const shift = Math.max(e614DecimalPlaces(dividendText), e614DecimalPlaces(divisorText));
    const scale = 10 ** shift;
    return {
      dividendText,
      divisorText,
      shift,
      scaledDividend: trimDecimalString(String((dividend.num * scale) / dividend.den)),
      scaledDivisor: trimDecimalString(String((divisor.num * scale) / divisor.den)),
    };
  }

  function buildE614IntegerDivideDecimalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const resultChoices = [
      makeFraction(5, 2),
      makeFraction(5, 1),
      makeFraction(15, 2),
      makeFraction(10, 1),
      makeFraction(25, 2),
      makeFraction(20, 1),
      makeFraction(7, 1),
    ];

    while (questions.length < count) {
      const divisor = e614PickPositiveDecimal({ minInt: 0, maxInt: 4, places: [1, 2], allowInteger: false });
      const result = pickFromList(resultChoices);
      const dividend = mulFraction(divisor, result);
      if (dividend.den !== 1 || dividend.num > 120) continue;
      const divisorText = e614DecimalText(divisor);
      const resultText = e614DecimalText(result);
      questions.push(`計算：$${dividend.num}\\div${divisorText}$。`);
      summaryAnswers.push(`$${resultText}$`);
      answers.push(
        `簡答：$${resultText}$。過程：先把除數變成整數，可視為同乘 10 或 100。原式 $=${dividend.num}\\div${divisorText}=${resultText}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE614DecimalDivideDecimalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const resultChoices = [
      makeFraction(9, 10),
      makeFraction(5, 4),
      makeFraction(3, 2),
      makeFraction(7, 4),
      makeFraction(3, 1),
      makeFraction(15, 4),
      makeFraction(5, 1),
      makeFraction(7, 1),
      makeFraction(6, 1),
    ];

    while (questions.length < count) {
      const divisor = e614PickPositiveDecimal({ minInt: 0, maxInt: 9, places: [1, 2], allowInteger: false });
      const result = pickFromList(resultChoices);
      const dividend = mulFraction(divisor, result);
      const dividendText = e614DecimalText(dividend);
      const divisorText = e614DecimalText(divisor);
      if (e614DecimalPlaces(dividendText) > 2 || e614DecimalPlaces(divisorText) > 2) continue;
      questions.push(`計算：$${dividendText}\\div${divisorText}$。`);
      summaryAnswers.push(`$${e614DecimalText(result)}$`);
      answers.push(
        `簡答：$${e614DecimalText(result)}$。過程：把被除數和除數的小數點同步右移，使除數變成整數後再計算，結果是 $${e614DecimalText(result)}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE614EstimateQuotientSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    while (questions.length < count) {
      const divisor = e614PickPositiveDecimal({ minInt: 0, maxInt: 9, places: [1, 2], allowInteger: false });
      const digits = randInt(0, 1);
      const result = digits === 0 ? makeFraction(randInt(25, 220), 10) : makeFraction(randInt(12, 180), 100);
      const dividend = mulFraction(divisor, result);
      const dividendText = e614DecimalText(dividend);
      const divisorText = e614DecimalText(divisor);
      if (e614DecimalPlaces(dividendText) > 2 || e614DecimalPlaces(divisorText) > 2) continue;
      const roundedText = e614RoundFractionText(divFraction(dividend, divisor), digits);
      questions.push(
        `計算：$${dividendText}\\div${divisorText}$，商四捨五入到${digits === 0 ? '個位' : '小數第一位'}約是多少？`
      );
      summaryAnswers.push(`約 ${roundedText}`);
      answers.push(
        `簡答：約 ${roundedText}。過程：先算商為 $${e614DecimalText(divFraction(dividend, divisor))}$，再四捨五入到${digits === 0 ? '個位' : '小數第一位'}，得到約 ${roundedText}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE614EquivalentTransformSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    while (questions.length < count) {
      const dividend = e614PickPositiveDecimal({ minInt: 0, maxInt: 80, places: [1, 2], allowInteger: true });
      const divisor = e614PickPositiveDecimal({ minInt: 0, maxInt: 9, places: [1, 2], allowInteger: false });
      const built = e614BuildScaledExpression(dividend, divisor);
      if (Number(built.scaledDivisor) < 1) continue;
      if (randInt(0, 1) === 0) {
        questions.push(`將 $${built.dividendText}\\div${built.divisorText}$ 化成除數為整數的算式。`);
        summaryAnswers.push(`$${built.scaledDividend}\\div${built.scaledDivisor}$`);
        answers.push(
          `簡答：$${built.scaledDividend}\\div${built.scaledDivisor}$。過程：把被除數與除數同時乘 $10^{${built.shift}}$，商不變，所以可化成 $${built.scaledDividend}\\div${built.scaledDivisor}$。`
        );
      } else {
        questions.push(
          `判斷：$${built.dividendText}\\div${built.divisorText}$ 是否等於 $${built.scaledDividend}\\div${built.scaledDivisor}$？`
        );
        summaryAnswers.push('是');
        answers.push(`簡答：是。過程：被除數與除數同時乘 $10^{${built.shift}}$，商不變，所以兩式相等。`);
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE614CompareDividendRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const divisorChoices = [
      makeFraction(7, 10),
      makeFraction(4, 5),
      makeFraction(1, 1),
      makeFraction(6, 5),
      makeFraction(8, 5),
      makeFraction(21, 10),
      makeFraction(5, 2),
    ];

    for (let i = 0; i < count; i += 1) {
      const dividend = e614PickPositiveDecimal({ minInt: 0, maxInt: 90, places: [1, 2], allowInteger: true });
      const divisor = pickFromList(divisorChoices);
      const quotient = divFraction(dividend, divisor);
      const cmp = e614CompareFraction(quotient, dividend);
      const symbol = cmp > 0 ? '>' : cmp < 0 ? '<' : '=';
      const reason =
        e614CompareFraction(divisor, makeFraction(1, 1)) < 0
          ? '除數小於 1，商會比被除數大'
          : e614CompareFraction(divisor, makeFraction(1, 1)) > 0
            ? '除數大於 1，商會比被除數小'
            : '除數等於 1，商和被除數相等';
      questions.push(
        `不先計算，判斷：$${e614DecimalText(dividend)}\\div${e614DecimalText(divisor)}\\square${e614DecimalText(dividend)}$，應填入 $>$、$<$ 還是 $=$？`
      );
      summaryAnswers.push(symbol);
      answers.push(
        `簡答：$${symbol}$。過程：${reason}，所以 $${e614DecimalText(dividend)}\\div${e614DecimalText(divisor)} ${symbol} ${e614DecimalText(dividend)}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE614CompareSameDividendSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const dividend = e614PickPositiveDecimal({ minInt: 0, maxInt: 90, places: [1, 2], allowInteger: true });
      let divisorA = e614PickPositiveDecimal({ minInt: 0, maxInt: 9, places: [1, 2], allowInteger: false });
      let divisorB = e614PickPositiveDecimal({ minInt: 0, maxInt: 9, places: [1, 2], allowInteger: false });
      while (e614CompareFraction(divisorA, divisorB) === 0) {
        divisorB = e614PickPositiveDecimal({ minInt: 0, maxInt: 9, places: [1, 2], allowInteger: false });
      }
      const left = divFraction(dividend, divisorA);
      const right = divFraction(dividend, divisorB);
      const cmp = e614CompareFraction(left, right);
      const symbol = cmp > 0 ? '>' : '<';
      const reason =
        e614CompareFraction(divisorA, divisorB) < 0 ? '左邊除數較小，所以左邊商較大' : '右邊除數較小，所以右邊商較大';
      questions.push(
        `不先計算，判斷：$${e614DecimalText(dividend)}\\div${e614DecimalText(divisorA)}\\square${e614DecimalText(dividend)}\\div${e614DecimalText(divisorB)}$，應填入 $>$ 還是 $<$？`
      );
      summaryAnswers.push(symbol);
      answers.push(`簡答：$${symbol}$。過程：被除數相同時，除數較小，商反而較大。${reason}，所以應填 $${symbol}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE614PackagingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['公升紅茶', '公升裝一瓶', '瓶'],
      ['公斤砂糖', '公斤裝一包', '包'],
      ['公升果汁', '公升裝一瓶', '瓶'],
      ['公斤麵粉', '公斤裝一袋', '袋'],
    ];

    while (questions.length < count) {
      const each = e614PickPositiveDecimal({ minInt: 0, maxInt: 4, places: [1, 2], allowInteger: false });
      const pieces = randInt(4, 60);
      const total = mulFraction(each, makeFraction(pieces, 1));
      const totalText = e614DecimalText(total);
      if (e614DecimalPlaces(totalText) > 2) continue;
      const [unitName, actionText, resultUnit] = pickFromList(contexts);
      questions.push(
        `有 $${totalText}$ ${unitName}，每 $${e614DecimalText(each)}$ ${actionText}，共可裝幾${resultUnit}？`
      );
      summaryAnswers.push(`${pieces}${resultUnit}`);
      answers.push(
        `簡答：${pieces}${resultUnit}。過程：總量 ÷ 每份量 = $${totalText}\\div${e614DecimalText(each)}=${pieces}$，所以可以裝 ${pieces}${resultUnit}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE614UnitRateSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['公斤空心菜花了', '元，1 公斤多少元', '元'],
      ['公尺木條重', '公斤，1 公尺重幾公斤', '公斤'],
      ['公升果汁含糖', '公克，1 公升含糖幾公克', '公克'],
      ['平方公尺稻田產出', '公斤稻米，1 平方公尺產幾公斤', '公斤'],
    ];

    while (questions.length < count) {
      const unitValue = pickFromList([12, 15, 18, 20, 24, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90]);
      const quantity = e614PickPositiveDecimal({ minInt: 0, maxInt: 7, places: [1, 2], allowInteger: false });
      const total = mulFraction(quantity, makeFraction(unitValue, 1));
      const totalText = e614DecimalText(total);
      if (e614DecimalPlaces(totalText) > 2) continue;
      const [leftText, rightText, unit] = pickFromList(contexts);
      questions.push(`買 $${e614DecimalText(quantity)}$ ${leftText} $${totalText}$ ${rightText}？`);
      summaryAnswers.push(`${unitValue}${unit}`);
      answers.push(
        `簡答：${unitValue}${unit}。過程：求 1 單位的量，要用總量 ÷ 數量，所以 $${totalText}\\div${e614DecimalText(quantity)}=${unitValue}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE614GeometryInverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['長方形土地', '面積', '平方公尺', '寬', '公尺', '長'],
      ['長方形花圃', '面積', '平方公尺', '長', '公尺', '寬'],
      ['平行四邊形', '面積', '平方公分', '底', '公分', '高'],
    ];

    while (questions.length < count) {
      const answer = e614PickPositiveDecimal({ minInt: 1, maxInt: 12, places: [1, 2], allowInteger: true });
      const known = e614PickPositiveDecimal({ minInt: 1, maxInt: 12, places: [1, 2], allowInteger: true });
      const total = mulFraction(answer, known);
      const totalText = e614DecimalText(total);
      if (e614DecimalPlaces(totalText) > 3) continue;
      const [shape, totalName, totalUnit, knownName, sideUnit, askName] = pickFromList(contexts);
      questions.push(
        `${shape}${totalName}是 $${totalText}$ ${totalUnit}，${knownName}是 $${e614DecimalText(known)}$ ${sideUnit}，${askName}是多少${sideUnit}？`
      );
      summaryAnswers.push(`${e614DecimalText(answer)}${sideUnit}`);
      answers.push(
        `簡答：${e614DecimalText(answer)}${sideUnit}。過程：要求另一邊，用 ${totalName} ÷ 已知邊長：$${totalText}\\div${e614DecimalText(known)}=${e614DecimalText(answer)}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE614RatePercentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    while (questions.length < count) {
      if (randInt(0, 1) === 0) {
        const total = pickFromList([20, 25, 30, 40, 50, 80, 100, 120, 200, 700]);
        const hit = randInt(1, total - 1);
        const percent = (hit * 100) / total;
        const rounded = trimDecimalString(String(Math.round(percent)));
        questions.push(`共投了 ${total} 球，投進 ${hit} 球，進球率約是多少\\%？（四捨五入到百分率個位）`);
        summaryAnswers.push(`約${rounded}\\%`);
        answers.push(
          `簡答：約${rounded}\\%。過程：進球率 = 成功次數 ÷ 總次數 × 100\\% = ${hit} ÷ ${total} × 100\\% = ${trimDecimalString(percent.toFixed(2))}\\%，四捨五入後約為 ${rounded}\\%。`
        );
      } else {
        const unitRate = e614PickPositiveDecimal({ minInt: 0, maxInt: 4, places: [1, 2], allowInteger: false });
        const area = pickFromList([5, 6, 8, 10, 12, 15, 20]);
        const total = mulFraction(unitRate, makeFraction(area, 1));
        const totalText = e614DecimalText(total);
        if (e614DecimalPlaces(totalText) > 3) continue;
        questions.push(`${area} 平方公尺的田地產出 $${totalText}$ 公斤稻米，1 平方公尺可產幾公斤？（取到小數第二位）`);
        summaryAnswers.push(`${e614RoundFractionText(divFraction(total, makeFraction(area, 1)), 2)}公斤`);
        answers.push(
          `簡答：${e614RoundFractionText(divFraction(total, makeFraction(area, 1)), 2)}公斤。過程：單位產量 = 總產量 ÷ 面積 = $${totalText}\\div${area}=${e614DecimalText(unitRate)}$，取到小數第二位為 ${e614RoundFractionText(unitRate, 2)}。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildE614RemainderDivisionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['公斤紅豆', '公斤裝一包', '包', '公斤'],
      ['公升水', '公升裝一瓶', '瓶', '公升'],
      ['公尺彩帶', '公尺剪一段', '段', '公尺'],
      ['公升麥茶', '公升分裝在瓶子', '瓶', '公升'],
    ];

    while (questions.length < count) {
      const each = e614PickPositiveDecimal({ minInt: 0, maxInt: 4, places: [1, 2], allowInteger: false });
      const eachText = e614DecimalText(each);
      const places = Math.max(1, e614DecimalPlaces(eachText));
      const den = 10 ** places;
      const q = randInt(3, 30);
      const remainderUnits = randInt(1, Math.max(1, each.num - 1));
      const remainder = makeFraction(remainderUnits, each.den);
      if (e614CompareFraction(remainder, each) >= 0) continue;
      const total = addFraction(mulFraction(each, makeFraction(q, 1)), remainder);
      const totalText = e614DecimalText(total);
      if (e614DecimalPlaces(totalText) > 2) continue;
      const [itemUnit, actionText, resultUnit, remainUnit] = pickFromList(contexts);
      questions.push(
        `有 $${totalText}$ ${itemUnit}，每 $${eachText}$ ${actionText}，最多可分成幾${resultUnit}？剩下幾${remainUnit}？`
      );
      summaryAnswers.push(`${q}${resultUnit}，餘${e614DecimalText(remainder)}${remainUnit}`);
      answers.push(
        `簡答：${q}${resultUnit}，餘${e614DecimalText(remainder)}${remainUnit}。過程：$${totalText}\\div${eachText}=${q}$，剩下 $${e614DecimalText(remainder)}$ ${remainUnit}。餘數要比每一份 ${eachText} 小，且單位要和原量對齊。`
      );
    }

    return { questions, summaryAnswers, answers };
  }


  function buildE614MixedComputationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // Pre-verified clean cases, 4 modes
    const mode0 = [ // a÷b + c
      { a: '8.4',  b: '2.1', q: 4, c: '3.6', r: '7.6'  },
      { a: '15.2', b: '0.8', q:19, c: '5.5', r: '13.5' },
      { a: '12.6', b: '3.5', q: 3.6, c: '2.5', r: '6.1', rStr: '6.1' },
      { a: '20',   b: '1.25',q:16, c: '4',   r: '20'   },
      { a: '35',   b: '2.5', q:14, c: '6',   r: '20'   },
      { a: '7.2',  b: '1.2', q: 6, c: '3.8', r: '9.8'  },
    ];
    const mode1 = [ // a×b - c÷d
      { a: '3.6',  b: '2.5', ab: '9',  c: '12.8', d: '3.2', cd: '4',  r: '5'   },
      { a: '4.5',  b: '1.2', ab: '5.4',c: '2.7',  d: '0.9', cd: '3',  r: '2.4' },
      { a: '2.8',  b: '1.5', ab: '4.2',c: '6.4',  d: '0.8', cd: '8',  r: '-3.8', rStr: '4.2-8=-3.8', display: 'need-reorder'},
      { a: '5',    b: '1.4', ab: '7',  c: '3.6',  d: '1.2', cd: '3',  r: '4'   },
      { a: '1.5',  b: '2.4', ab: '3.6',c: '4.8',  d: '3.2', cd: '1.5',r: '2.1' },
    ];
    const mode2 = [ // (a+b) ÷ c
      { a: '5.2', b: '3.8', sum: '9',  c: '0.5', r: '18', rStr: '18' },
      { a: '2.5', b: '7.5', sum: '10', c: '2.5', r: '4',  rStr: '4'  },
      { a: '3.8', b: '1.2', sum: '5',  c: '1.25',r: '4',  rStr: '4'  },
      { a: '4.5', b: '0.5', sum: '5',  c: '0.4', r: '12.5',rStr: '12.5' },
      { a: '6.3', b: '0.7', sum: '7',  c: '1.4', r: '5',  rStr: '5'  },
    ];
    const mode3 = [ // a ÷ b × c
      { a: '12.6', b: '3.5', q: '3.6', c: '2.5', r: '9'   },
      { a: '7.5',  b: '0.25',q: '30',  c: '0.4', r: '12'  },
      { a: '25.2', b: '3.6', q: '7',   c: '1.4', r: '9.8' },
      { a: '4.8',  b: '1.2', q: '4',   c: '2.5', r: '10'  },
      { a: '6.4',  b: '0.8', q: '8',   c: '1.5', r: '12'  },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const c = mode0[i % mode0.length];
        const res = trimDecimalString(String(parseFloat(c.a)/parseFloat(c.b) + parseFloat(c.c)));
        questions.push(`計算 $${c.a}\div${c.b}+${c.c}=$？`);
        summaryAnswers.push(`$${res}$`);
        answers.push(`簡答：$${res}$。過程：先算除法 $${c.a}\div${c.b}=${trimDecimalString(String(parseFloat(c.a)/parseFloat(c.b)))}$，再加 ${c.c}，得 ${res}。`);
      } else if (mode === 1) {
        const c = mode1[Math.floor(i/4) % mode1.length];
        if (c.display === 'need-reorder') {
          // swap to avoid negative: use c÷d - a×b order or pick safe case
          const safe = mode1[0];
          const res = trimDecimalString(String(parseFloat(safe.a)*parseFloat(safe.b) - parseFloat(safe.c)/parseFloat(safe.d)));
          questions.push(`計算 $${safe.a}\times${safe.b}-${safe.c}\div${safe.d}=$？`);
          summaryAnswers.push(`$${res}$`);
          answers.push(`簡答：$${res}$。過程：先算 $${safe.a}\times${safe.b}=${safe.ab}$ 和 $${safe.c}\div${safe.d}=${safe.cd}$，再相減，得 ${res}。`);
        } else {
          const res = trimDecimalString(String(parseFloat(c.a)*parseFloat(c.b) - parseFloat(c.c)/parseFloat(c.d)));
          questions.push(`計算 $${c.a}\times${c.b}-${c.c}\div${c.d}=$？`);
          summaryAnswers.push(`$${res}$`);
          answers.push(`簡答：$${res}$。過程：先算 $${c.a}\times${c.b}=${c.ab}$ 和 $${c.c}\div${c.d}=${c.cd}$，再相減，得 ${res}。`);
        }
      } else if (mode === 2) {
        const c = mode2[Math.floor(i/4) % mode2.length];
        const res = trimDecimalString(String((parseFloat(c.a)+parseFloat(c.b)) / parseFloat(c.c)));
        questions.push(`計算 $(${c.a}+${c.b})\div${c.c}=$？`);
        summaryAnswers.push(`$${res}$`);
        answers.push(`簡答：$${res}$。過程：先算括號 $${c.a}+${c.b}=${c.sum}$，再除以 ${c.c}，得 ${res}。`);
      } else {
        const c = mode3[Math.floor(i/4) % mode3.length];
        const res = trimDecimalString(String(parseFloat(c.a)/parseFloat(c.b)*parseFloat(c.c)));
        questions.push(`計算 $${c.a}\div${c.b}\times${c.c}=$？`);
        summaryAnswers.push(`$${res}$`);
        answers.push(`簡答：$${res}$。過程：從左到右依序計算，$${c.a}\div${c.b}=${c.q}$，再 $${c.q}\times${c.c}=${res}$。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE614MixedSet(banks, count) {
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

  function buildE614BasicsMixedSet(count) {
    return buildE614MixedSet([buildE614IntegerDivideDecimalSet, buildE614DecimalDivideDecimalSet], count);
  }

  function buildE614JudgementMixedSet(count) {
    return buildE614MixedSet(
      [
        buildE614EstimateQuotientSet,
        buildE614EquivalentTransformSet,
        buildE614CompareDividendRelationSet,
        buildE614CompareSameDividendSet,
      ],
      count
    );
  }

  function buildE614UnitMixedSet(count) {
    return buildE614MixedSet([buildE614PackagingSet, buildE614UnitRateSet], count);
  }

  function buildE614InverseMixedSet(count) {
    return buildE614MixedSet([buildE614GeometryInverseSet, buildE614RatePercentSet], count);
  }

  function buildE614RemainderMixedSet(count) {
    return buildE614MixedSet([buildE614RemainderDivisionSet], count);
  }

  function e615FractionText(frac, mixed = true) {
    return integerOrFractionLatex(makeFraction(frac.num, frac.den), mixed);
  }

  function e615RatioText(left, right) {
    return `${e615FractionText(left)}:${e615FractionText(right)}`;
  }

  function e615FractionCompare(a, b) {
    return a.num * b.den - b.num * a.den;
  }

  function e615PickPositiveFraction(options = {}) {
    const {
      allowInteger = true,
      wholeMin = 0,
      wholeMax = 6,
      denominatorChoices = [2, 3, 4, 5, 6, 8, 10],
      forceFractionPart = false,
    } = options;
    if (allowInteger && randInt(0, 1) === 0 && !forceFractionPart) {
      return makeFraction(randInt(Math.max(1, wholeMin), Math.max(1, wholeMax)), 1);
    }
    return e621PickTerminatingFraction({
      allowZero: false,
      minWhole: wholeMin,
      maxWhole: wholeMax,
      forceFractionPart: true,
      denominatorChoices,
    });
  }

  function e615PickDistinctRatioPair() {
    while (true) {
      const left = e615PickPositiveFraction({ allowInteger: true });
      const right = e615PickPositiveFraction({ allowInteger: true });
      if (e615FractionCompare(left, right) !== 0) return [left, right];
    }
  }

  function e615ScaleRatioToIntegers(left, right) {
    const lcmDen = lcm(left.den, right.den);
    const a = (left.num * lcmDen) / left.den;
    const b = (right.num * lcmDen) / right.den;
    const g = gcd(Math.abs(a), Math.abs(b));
    return [a / g, b / g];
  }

  function e615PickRatioParts(totalMin = 4, totalMax = 15) {
    const a = randInt(1, totalMin);
    const b = randInt(1, totalMax);
    return gcd(a, b) === 1 ? [a, b] : e615PickRatioParts(totalMin, totalMax);
  }

  function buildE615RatioValueSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [left, right] = e615PickDistinctRatioPair();
      const value = divFraction(left, right);
      questions.push(`求比 $${e615RatioText(left, right)}$ 的比值。`);
      summaryAnswers.push(`$${e615FractionText(value)}$`);
      answers.push(
        `簡答：$${e615FractionText(value)}$。過程：比值就是前項 ÷ 後項，所以 $${e615FractionText(left)}\\div${e615FractionText(right)}=${e615FractionText(value)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE615SimplestRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [left, right] = e615PickDistinctRatioPair();
      const [a, b] = e615ScaleRatioToIntegers(left, right);
      questions.push(`把 $${e615RatioText(left, right)}$ 化成最簡整數比。`);
      summaryAnswers.push(`$${a}:${b}$`);
      answers.push(
        `簡答：$${a}:${b}$。過程：先同乘分母公倍數，把比化成整數比，再同除最大公因數，得到最簡整數比 $${a}:${b}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE615EquivalentRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 12);
      const b = randInt(2, 12);
      const scale = randInt(2, 9);
      const mode = i % 2;
      if (mode === 0) {
        const c = a * scale;
        questions.push(`已知 $${a}:${b}=(${c}):\\square$，求空格中的數。`);
        summaryAnswers.push(`$${b * scale}$`);
        answers.push(`簡答：$${b * scale}$。過程：前項乘上 ${scale}，後項也要乘上 ${scale}，所以空格是 ${b * scale}。`);
      } else {
        const d = b * scale;
        questions.push(`已知 $${a}:${b}=\\square:${d}$，求空格中的數。`);
        summaryAnswers.push(`$${a * scale}$`);
        answers.push(`簡答：$${a * scale}$。過程：後項乘上 ${scale}，前項也要乘上 ${scale}，所以空格是 ${a * scale}。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE615UnitComparisonSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const itemNames = ['蘋果', '白米', '果汁', '牛奶', '文具'];
    const unitNames = ['公斤', '公升', '本', '支'];
    for (let i = 0; i < count; i += 1) {
      const item = pickFromList(itemNames);
      const unit = i % 2 === 0 ? '公斤' : pickFromList(unitNames);
      const brandA = ['甲店', '乙店', '丙店'];
      const offers = [];
      for (let j = 0; j < 3; j += 1) {
        const quantity = makeFraction(randInt(2, 10) * (j + 2), randInt(1, 2));
        const unitPrice = randInt(12, 40);
        const total = mulFraction(quantity, makeFraction(unitPrice, 1));
        offers.push({ brand: brandA[j], quantity, total, unitPrice });
      }
      const best = offers.reduce((acc, itemRow) => (itemRow.unitPrice < acc.unitPrice ? itemRow : acc), offers[0]);
      questions.push(
        `${offers.map((row) => `${row.brand}${e615FractionText(row.quantity)}${unit}賣 ${row.total.num / row.total.den} 元`).join('，')}，哪一家平均每 1 ${unit} 最便宜？`
      );
      summaryAnswers.push(best.brand);
      answers.push(
        `簡答：${best.brand}。過程：分別求單位量的價格：${offers
          .map(
            (row) =>
              `${row.brand} 為 ${row.total.num / row.total.den}÷${e615FractionText(row.quantity)}=${row.unitPrice}`
          )
          .join('，')}，單價最小的是 ${best.brand}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE615ExchangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const scenarios = [
      { left: '張獎勵貼紙', right: '張榮譽卡', object: '榮譽卡', rightUnit: '張', leftUnit: '張' },
      { left: '張點數券', right: '枝飛鏢', object: '飛鏢', rightUnit: '枝', leftUnit: '張' },
      { left: '顆電池', right: '個布丁', object: '布丁', rightUnit: '個', leftUnit: '顆' },
      { left: '元新臺幣', right: '美元', object: '美元', rightUnit: '元', leftUnit: '元' },
    ];
    for (let i = 0; i < count; i += 1) {
      const s = scenarios[randInt(0, scenarios.length - 1)];
      const a = randInt(2, 12);
      const b = randInt(1, 6);
      const wanted = randInt(3, 12) * b;
      const answer = (wanted / b) * a;
      questions.push(
        `若 $${a}$ ${s.left} 可以換 $${b}$ ${s.right}，要換到 $${wanted}$ ${s.rightUnit}${s.object}，需要多少${s.left}？`
      );
      summaryAnswers.push(`${answer}${s.leftUnit}`);
      answers.push(
        `簡答：${answer}${s.leftUnit}。過程：先看比是 $${a}:${b}$，${wanted} 是 ${b} 的 ${wanted / b} 倍，所以前項也乘上 ${wanted / b}，得到 ${answer}${s.leftUnit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE615PartWholeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const total = randInt(60, 180) * 5;
      const part = randInt(1, 4);
      const whole = randInt(part + 1, 8);
      const value = Math.floor((total * part) / whole);
      const itemA = pickFromList(['男生', '白米', '小說類', '草蝦', '雞蛋']);
      const itemB = pickFromList(['全班', '總重', '全部書', '池中總蝦數', '總顆數']);
      questions.push(
        `已知 ${itemA} 與 ${itemB} 的比是 $${part}:${whole}$，若 ${itemB} 對應的總量是 ${total}，則 ${itemA} 對應多少？`
      );
      summaryAnswers.push(`${value}`);
      answers.push(
        `簡答：${value}。過程：部分量 ÷ 全體量 = ${part}/${whole}，所以部分量 = $${total}\\times\\frac{${part}}{${whole}}=${value}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE615DistributionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const themePairs = [
      ['男生', '女生'],
      ['蘋果', '橘子'],
      ['紅球', '藍球'],
      ['哥哥', '妹妹'],
      ['甲店', '乙店'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [a, b] = e615PickRatioParts(6, 9);
      const totalUnits = randInt(8, 20);
      const total = (a + b) * totalUnits;
      const leftValue = a * totalUnits;
      const rightValue = b * totalUnits;
      const [leftName, rightName] = pickFromList(themePairs);
      questions.push(
        `${leftName}與${rightName}的比是 $${a}:${b}$，總數是 ${total}，求 ${leftName} 和 ${rightName} 各是多少？`
      );
      summaryAnswers.push(`${leftName}${leftValue}，${rightName}${rightValue}`);
      answers.push(
        `簡答：${leftName}${leftValue}，${rightName}${rightValue}。過程：總份數是 ${a + b} 份，每 1 份是 ${total}÷${a + b}=${totalUnits}，所以分別是 ${a}×${totalUnits}=${leftValue}、${b}×${totalUnits}=${rightValue}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE615AdjustmentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const themes = [
      { a: '咖啡', b: '牛奶', unit: '公克' },
      { a: '蜂蜜', b: '紅茶', unit: '毫升' },
      { a: '白漆', b: '藍漆', unit: '桶' },
      { a: '鹽', b: '水', unit: '公克' },
      { a: '漂白水', b: '清水', unit: '毫升' },
    ];
    for (let i = 0; i < count; i += 1) {
      const theme = themes[randInt(0, themes.length - 1)];
      const [a, b] = e615PickRatioParts(2, 8);
      const scale = randInt(2, 8);
      const knownLeft = a * scale;
      const knownRight = b * scale;
      if (randInt(0, 1) === 0) {
        questions.push(
          `調配時 $${theme.a}:${theme.b}=${a}:${b}$。若用了 ${knownLeft}${theme.unit}${theme.a}，要維持相同比例，${theme.b} 需要多少${theme.unit}？`
        );
        summaryAnswers.push(`${knownRight}${theme.unit}`);
        answers.push(
          `簡答：${knownRight}${theme.unit}。過程：前項 ${a} 份變成 ${knownLeft}，放大倍數是 ${knownLeft / a}，所以後項也乘上同樣倍數，得到 ${knownRight}。`
        );
      } else {
        questions.push(
          `調配時 $${theme.a}:${theme.b}=${a}:${b}$。若用了 ${knownRight}${theme.unit}${theme.b}，要維持相同比例，${theme.a} 需要多少${theme.unit}？`
        );
        summaryAnswers.push(`${knownLeft}${theme.unit}`);
        answers.push(
          `簡答：${knownLeft}${theme.unit}。過程：後項 ${b} 份變成 ${knownRight}，放大倍數是 ${knownRight / b}，所以前項也乘上同樣倍數，得到 ${knownLeft}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE615PercentApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modes = ['discount', 'service', 'markup', 'saving'];
    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      if (mode === 'discount') {
        const original = randInt(12, 30) * 100;
        const ratioNum = randInt(6, 9);
        const paid = (original * ratioNum) / 10;
        questions.push(`商品打 ${ratioNum} 折後售價是 ${paid} 元，原價是多少元？`);
        summaryAnswers.push(`${original}元`);
        answers.push(
          `簡答：${original}元。過程：售價：原價 = ${ratioNum}:10，所以原價 = ${paid}÷${ratioNum}×10=${original}。`
        );
        continue;
      }
      if (mode === 'service') {
        const meal = randInt(20, 80) * 100;
        const paid = Math.floor(meal * 1.1);
        questions.push(`結帳時加收一成服務費，共付 ${paid} 元，未加服務費前是多少元？`);
        summaryAnswers.push(`${meal}元`);
        answers.push(`簡答：${meal}元。過程：總付金額：原價 = 11:10，所以原價 = ${paid}÷11×10=${meal}。`);
        continue;
      }
      if (mode === 'markup') {
        const cost = randInt(20, 80) * 10;
        const ratio = pickFromList([makeFraction(5, 4), makeFraction(13, 10), makeFraction(7, 5)]);
        const price = divFraction(mulFraction(makeFraction(cost, 1), ratio), makeFraction(1, 1));
        questions.push(`定價是成本的 $${e615FractionText(ratio, false)}$ 倍，若成本是 ${cost} 元，定價是多少元？`);
        summaryAnswers.push(`${price.num / price.den}元`);
        answers.push(
          `簡答：${price.num / price.den}元。過程：定價：成本 = ${e615FractionText(ratio, false)}:1，所以定價 = ${cost}×${e615FractionText(ratio, false)}=${price.num / price.den}。`
        );
        continue;
      }
      const salary = randInt(45, 90) * 100;
      const saveNum = pickFromList([1, 2, 3, 4]);
      const spent = salary - (salary * saveNum) / 10;
      questions.push(`把薪水的 ${saveNum} 成存起來，這個月花了 ${spent} 元，這個月薪水是多少元？`);
      summaryAnswers.push(`${salary}元`);
      answers.push(
        `簡答：${salary}元。過程：花費：薪水 = ${10 - saveNum}:10，所以薪水 = ${spent}÷${10 - saveNum}×10=${salary}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE615GeometrySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const scaleA = randInt(12, 20);
        const scaleB = 9;
        const width = scaleB * randInt(4, 10);
        const length = (scaleA * width) / scaleB;
        questions.push(`螢幕長：寬 = ${scaleA}:${scaleB}，若寬是 ${width} 公分，長是多少公分？`);
        summaryAnswers.push(`${length}公分`);
        answers.push(
          `簡答：${length}公分。過程：長：寬 = ${scaleA}:${scaleB}，寬 ${width} 對應 ${scaleB} 份，所以每份是 ${width}÷${scaleB}，長是 ${scaleA} 份，得到 ${length}。`
        );
        continue;
      }
      if (mode === 1) {
        const ratioA = pickFromList([1, 1, 1, 5]);
        const ratioB = ratioA === 5 ? 20000 : 500;
        const mapLen = randInt(3, 9);
        const actual = mapLen * ratioB;
        questions.push(`在比例尺 $1:${ratioB}$ 的地圖上，長 ${mapLen} 公分代表實際多少公分？`);
        summaryAnswers.push(`${actual}公分`);
        answers.push(
          `簡答：${actual}公分。過程：圖上：實際 = 1:${ratioB}，圖上 ${mapLen} 公分就代表實際 ${mapLen}×${ratioB}=${actual} 公分。`
        );
        continue;
      }
      if (mode === 2) {
        const personHeight = randInt(120, 180);
        const personShadow = randInt(60, 120);
        const objectShadow = randInt(90, 220);
        const objectHeight = makeFraction(personHeight * objectShadow, personShadow);
        questions.push(
          `同一時間下，身高 ${personHeight} 公分的人影長 ${personShadow} 公分；若另一物體影長 ${objectShadow} 公分，它的高度是多少公分？`
        );
        summaryAnswers.push(`${e615FractionText(objectHeight)}公分`);
        answers.push(
          `簡答：${e615FractionText(objectHeight)}公分。過程：同時測量時，高：影長比相同，所以 $${personHeight}:${personShadow}=x:${objectShadow}$，解得 $x=${e615FractionText(objectHeight)}$。`
        );
        continue;
      }
      const length = randInt(24, 72);
      const ratioL = pickFromList([2, 3, 4, 5, 6, 7, 8, 9]);
      const ratioW = pickFromList([2, 3, 4, 5]);
      const scale = length / ratioL;
      if (!Number.isInteger(scale)) {
        i -= 1;
        continue;
      }
      const width = ratioW * scale;
      const area = length * width;
      questions.push(`長方形長是 ${length} 公分，長與寬的比是 ${ratioL}:${ratioW}，面積是多少平方公分？`);
      summaryAnswers.push(`${area}平方公分`);
      answers.push(
        `簡答：${area}平方公分。過程：長 ${length} 對應 ${ratioL} 份，所以 1 份是 ${scale}，寬是 ${ratioW}×${scale}=${width}，面積是 ${length}×${width}=${area}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE615BenchmarkSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const k = pickFromList([makeFraction(3, 2), makeFraction(5, 2), makeFraction(5, 4), makeFraction(7, 4)]);
        questions.push(`甲數是乙數的 $${e615FractionText(k, false)}$ 倍，甲對乙的比怎麼寫？比值是多少？`);
        summaryAnswers.push(`$${e615FractionText(k, false)}:1$，$${e615FractionText(k)}$`);
        answers.push(
          `簡答：$${e615FractionText(k, false)}:1$，比值是 $${e615FractionText(k)}$。過程：幾倍就是前項 ÷ 後項的結果，所以甲：乙 = ${e615FractionText(k, false)}:1。`
        );
        continue;
      }
      if (mode === 1) {
        const num = pickFromList([8, 9, 12]);
        questions.push(`打 ${num} 折表示「售價：原價」的比是多少？比值是多少？`);
        summaryAnswers.push(`$${num}:10$，$${e615FractionText(makeFraction(num, 10))}$`);
        answers.push(
          `簡答：$${num}:10$，比值是 $${e615FractionText(makeFraction(num, 10))}$。過程：${num} 折就是原價的 ${num}/10，所以售價：原價 = ${num}:10。`
        );
        continue;
      }
      const ratio = pickFromList([makeFraction(5, 4), makeFraction(3, 2), makeFraction(8, 5)]);
      questions.push(`定價是成本的 $${e615FractionText(ratio, false)}$ 倍，定價對成本的比怎麼寫？比值是多少？`);
      summaryAnswers.push(`$${e615FractionText(ratio, false)}:1$，$${e615FractionText(ratio)}$`);
      answers.push(
        `簡答：$${e615FractionText(ratio, false)}:1$，比值是 $${e615FractionText(ratio)}$。過程：若 A 是 B 的幾倍，就表示 $A:B=幾倍:1$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }


  function buildE615ChainRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // Cases where B term already matches
    const directCases = [
      { a: '甲', b: '乙', c: '丙', ab: [1,2], bc: [2,3], abc: [1,2,3] },
      { a: '甲', b: '乙', c: '丙', ab: [2,3], bc: [3,4], abc: [2,3,4] },
      { a: 'A',  b: 'B',  c: 'C',  ab: [1,3], bc: [3,5], abc: [1,3,5] },
      { a: 'A',  b: 'B',  c: 'C',  ab: [4,5], bc: [5,6], abc: [4,5,6] },
      { a: '甲', b: '乙', c: '丙', ab: [3,5], bc: [5,7], abc: [3,5,7] },
    ];
    // Cases requiring LCM scaling
    const lcmCases = [
      { a: 'A',  b: 'B',  c: 'C',  ab: [1,2], bc: [3,4], lcmB: 6,  mAB: 3, mBC: 2, abc: [3,6,8]    },
      { a: '甲', b: '乙', c: '丙', ab: [2,3], bc: [4,5], lcmB: 12, mAB: 4, mBC: 3, abc: [8,12,15]  },
      { a: 'A',  b: 'B',  c: 'C',  ab: [3,4], bc: [2,3], lcmB: 4,  mAB: 1, mBC: 2, abc: [3,4,6]    },
      { a: '甲', b: '乙', c: '丙', ab: [2,5], bc: [3,4], lcmB: 15, mAB: 3, mBC: 5, abc: [6,15,20]  },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const c = directCases[i % directCases.length];
        questions.push(`已知 ${c.a}:${c.b}=${c.ab[0]}:${c.ab[1]}，${c.b}:${c.c}=${c.bc[0]}:${c.bc[1]}，求 ${c.a}:${c.b}:${c.c}。`);
        const res = c.abc.join(':');
        summaryAnswers.push(res);
        answers.push(`簡答：${res}。過程：兩個比中「${c.b}」的數值都是 ${c.ab[1]}，直接合併得 ${c.a}:${c.b}:${c.c}=${res}。`);
      } else if (mode === 1) {
        const c = lcmCases[i % lcmCases.length];
        questions.push(`已知 ${c.a}:${c.b}=${c.ab[0]}:${c.ab[1]}，${c.b}:${c.c}=${c.bc[0]}:${c.bc[1]}，求 ${c.a}:${c.b}:${c.c}。`);
        const res = c.abc.join(':');
        summaryAnswers.push(res);
        const s1a = c.ab[0]*c.mAB, s1b = c.ab[1]*c.mAB;
        const s2b = c.bc[0]*c.mBC, s2c = c.bc[1]*c.mBC;
        answers.push(`簡答：${res}。過程：把「${c.b}」化成相同的數。第一個比 ×${c.mAB} → ${s1a}:${s1b}，第二個比 ×${c.mBC} → ${s2b}:${s2c}，合併得 ${c.a}:${c.b}:${c.c}=${res}。`);
      } else {
        const c = directCases[i % directCases.length];
        const ac0 = c.abc[0], ac1 = c.abc[2];
        questions.push(`已知 ${c.a}:${c.b}=${c.ab[0]}:${c.ab[1]}，${c.b}:${c.c}=${c.bc[0]}:${c.bc[1]}，求 ${c.a}:${c.c}。`);
        summaryAnswers.push(`${ac0}:${ac1}`);
        answers.push(`簡答：${ac0}:${ac1}。過程：先求連比 ${c.a}:${c.b}:${c.c}=${c.abc.join(':')}，首項與末項的比為 ${ac0}:${ac1}。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE615DiscountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const items = ['上衣', '外套', '鞋子', '書包', '玩具', '運動鞋', '帽子'];
    const discountCases = [
      { label: '8折',  rate: 0.8  },
      { label: '85折', rate: 0.85 },
      { label: '75折', rate: 0.75 },
      { label: '9折',  rate: 0.9  },
      { label: '7折',  rate: 0.7  },
      { label: '95折', rate: 0.95 },
    ];
    const prices = [100, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000];
    for (let i = 0; i < count; i += 1) {
      const item = pickFromList(items);
      const dc = discountCases[i % discountCases.length];
      const price = pickFromList(prices);
      const sale = price * dc.rate;
      if (i % 2 === 0) {
        questions.push(`一件${item}原價 ${price} 元，打${dc.label}出售，售價是多少元？`);
        summaryAnswers.push(`${sale}元`);
        answers.push(`簡答：${sale}元。過程：打${dc.label}表示售價是原價的 ${dc.rate}，所以 ${price} × ${dc.rate} = ${sale}。`);
      } else {
        questions.push(`一件${item}打${dc.label}後售價是 ${sale} 元，原價是多少元？`);
        summaryAnswers.push(`${price}元`);
        answers.push(`簡答：${price}元。過程：打${dc.label}即售價 = 原價 × ${dc.rate}，所以原價 = ${sale} ÷ ${dc.rate} = ${price}。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE615MixedSet(banks, count) {
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

  function buildE615CoreMixedSet(count) {
    return buildE615MixedSet([buildE615RatioValueSet, buildE615SimplestRatioSet, buildE615EquivalentRatioSet], count);
  }

  function buildE615CompareMixedSet(count) {
    return buildE615MixedSet([buildE615UnitComparisonSet, buildE615ExchangeSet, buildE615BenchmarkSet], count);
  }

  function buildE615DistributionMixedSet(count) {
    return buildE615MixedSet([buildE615PartWholeSet, buildE615DistributionSet], count);
  }

  function buildE615AdjustPercentMixedSet(count) {
    return buildE615MixedSet([buildE615AdjustmentSet, buildE615PercentApplicationSet], count);
  }

  function buildE615GeometryMixedSet(count) {
    return buildE615MixedSet([buildE615GeometrySet], count);
  }

  const E616_PI = 3.14;

  function e616FormatNumber(value, digits = 2) {
    return trimDecimalString(Number(value.toFixed(digits)).toString());
  }

  function e616CircumferenceByDiameter(diameter) {
    return diameter * E616_PI;
  }

  function e616CircumferenceByRadius(radius) {
    return 2 * radius * E616_PI;
  }

  function e616ArcLength(radius, angle) {
    return (e616CircumferenceByRadius(radius) * angle) / 360;
  }

  function e616SectorPerimeter(radius, angle) {
    return e616ArcLength(radius, angle) + 2 * radius;
  }

  function e616PickAngle() {
    return pickFromList([30, 45, 60, 90, 120, 135, 150, 180, 210, 240, 270, 300]);
  }

  function buildE616PiConceptSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        questions.push('圓周長和直徑的比值，稱作什麼？');
        summaryAnswers.push('圓周率');
        answers.push('簡答：圓周率。過程：圓周率就是「圓周長 ÷ 直徑」的固定比值。');
        continue;
      }
      if (mode === 1) {
        const diameter = pickFromList([5, 8, 12, 18, 25]);
        const circumference = e616CircumferenceByDiameter(diameter);
        questions.push(`圓周長 ${e616FormatNumber(circumference)} 公分大約是直徑 ${diameter} 公分的幾倍？`);
        summaryAnswers.push('3.14 倍');
        answers.push(`簡答：3.14 倍。過程：圓周長 ÷ 直徑 = ${e616FormatNumber(circumference)} ÷ ${diameter} = 3.14。`);
        continue;
      }
      if (mode === 2) {
        const multiplier = pickFromList([2, 3, 4, 5]);
        questions.push(`若一個圓的直徑變成原來的 ${multiplier} 倍，圓周長會變成原來的幾倍？`);
        summaryAnswers.push(`${multiplier}倍`);
        answers.push(
          `簡答：${multiplier}倍。過程：圓周長 = 直徑 × 3.14，直徑放大 ${multiplier} 倍，圓周長也跟著放大 ${multiplier} 倍。`
        );
        continue;
      }
      if (mode === 3) {
        questions.push('大圓和小圓的圓周率，哪一個比較大？');
        summaryAnswers.push('一樣大');
        answers.push('簡答：一樣大。過程：圓周率是圓周長和直徑的固定比值，不會因為圓變大或變小而改變。');
        continue;
      }
      questions.push('圓周長大約是半徑的幾倍？');
      summaryAnswers.push('6.28 倍');
      answers.push('簡答：6.28 倍。過程：圓周長 = 半徑 × 2 × 3.14 = 半徑 × 6.28。');
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE616CircumferenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const diameter = pickFromList([6, 8, 10, 12, 15, 18, 20, 24, 30, 35, 40]);
        const circumference = e616CircumferenceByDiameter(diameter);
        questions.push(`一個直徑 ${diameter} 公分的圓，圓周長大約是多少公分？`);
        summaryAnswers.push(`${e616FormatNumber(circumference)}公分`);
        answers.push(
          `簡答：${e616FormatNumber(circumference)}公分。過程：圓周長 = 直徑 × 3.14 = ${diameter} × 3.14 = ${e616FormatNumber(circumference)}。`
        );
      } else {
        const radius = pickFromList([3, 4, 5, 6, 8, 9, 10, 12, 15, 18]);
        const circumference = e616CircumferenceByRadius(radius);
        questions.push(`一個半徑 ${radius} 公分的圓，圓周長大約是多少公分？`);
        summaryAnswers.push(`${e616FormatNumber(circumference)}公分`);
        answers.push(
          `簡答：${e616FormatNumber(circumference)}公分。過程：圓周長 = 半徑 × 2 × 3.14 = ${radius} × 2 × 3.14 = ${e616FormatNumber(circumference)}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE616InverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const diameter = pickFromList([6, 8, 10, 12, 15, 16, 20, 24, 30, 40, 50]);
        const circumference = e616CircumferenceByDiameter(diameter);
        questions.push(`一個圓的圓周長大約是 ${e616FormatNumber(circumference)} 公分，它的直徑大約是多少公分？`);
        summaryAnswers.push(`${diameter}公分`);
        answers.push(
          `簡答：${diameter}公分。過程：直徑 = 圓周長 ÷ 3.14 = ${e616FormatNumber(circumference)} ÷ 3.14 = ${diameter}。`
        );
      } else {
        const radius = pickFromList([3, 5, 6, 8, 10, 12, 15, 18, 20, 25]);
        const circumference = e616CircumferenceByRadius(radius);
        questions.push(`一個圓的圓周長大約是 ${e616FormatNumber(circumference)} 公分，它的半徑大約是多少公分？`);
        summaryAnswers.push(`${radius}公分`);
        answers.push(
          `簡答：${radius}公分。過程：半徑 = 圓周長 ÷ 3.14 ÷ 2 = ${e616FormatNumber(circumference)} ÷ 3.14 ÷ 2 = ${radius}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE616RollingDistanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const names = ['腳踏車輪', '模型車輪', '測距輪', '滾輪', '機器人輪'];
    for (let i = 0; i < count; i += 1) {
      const radius = pickFromList([4, 5, 6, 8, 10, 12, 15, 20, 25, 30]);
      const rounds = pickFromList([8, 10, 12, 20, 25, 40, 50, 100, 120, 200]);
      const name = pickFromList(names);
      const circumference = e616CircumferenceByRadius(radius);
      const distance = circumference * rounds;
      if (i % 2 === 0) {
        questions.push(`${name}半徑是 ${radius} 公分，轉了 ${rounds} 圈，大約前進了多少公分？`);
        summaryAnswers.push(`${e616FormatNumber(distance)}公分`);
        answers.push(
          `簡答：${e616FormatNumber(distance)}公分。過程：一圈前進的距離就是圓周長，為 ${radius} × 2 × 3.14 = ${e616FormatNumber(circumference)}，所以前進 ${e616FormatNumber(circumference)} × ${rounds} = ${e616FormatNumber(distance)}。`
        );
      } else {
        questions.push(`${name}半徑是 ${radius} 公分，若前進了 ${e616FormatNumber(distance)} 公分，大約轉了幾圈？`);
        summaryAnswers.push(`${rounds}圈`);
        answers.push(
          `簡答：${rounds}圈。過程：先求一圈的圓周長 ${e616FormatNumber(circumference)} 公分，再用總距離 ÷ 一圈距離 = ${e616FormatNumber(distance)} ÷ ${e616FormatNumber(circumference)} = ${rounds}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE616StepSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const placeNames = ['花圃', '沙坑', '池塘', '操場圓形花壇', '圓形步道'];
    for (let i = 0; i < count; i += 1) {
      const radius = pickFromList([5, 6, 8, 10, 12, 15, 20, 25, 30]);
      const stepLength = pickFromList([31.4, 47.1, 62.8, 15.7, 9.42, 18.84]);
      const circumference = e616CircumferenceByRadius(radius);
      const steps = circumference / stepLength;
      if (!Number.isInteger(steps) || steps < 10) {
        i -= 1;
        continue;
      }
      const place = pickFromList(placeNames);
      if (i % 2 === 0) {
        questions.push(
          `沿著${place}繞一圈共走了 ${steps} 步，每一步長約 ${e616FormatNumber(stepLength)} 公分，這個${place}的半徑大約是多少公分？`
        );
        summaryAnswers.push(`${radius}公分`);
        answers.push(
          `簡答：${radius}公分。過程：圓周長 = 步數 × 步長 = ${steps} × ${e616FormatNumber(stepLength)} = ${e616FormatNumber(circumference)}，半徑 = ${e616FormatNumber(circumference)} ÷ 3.14 ÷ 2 = ${radius}。`
        );
      } else {
        const diameter = radius * 2;
        questions.push(
          `沿著${place}繞一圈共走了 ${steps} 步，每一步長約 ${e616FormatNumber(stepLength)} 公分，這個${place}的直徑大約是多少公分？`
        );
        summaryAnswers.push(`${diameter}公分`);
        answers.push(
          `簡答：${diameter}公分。過程：圓周長 = ${steps} × ${e616FormatNumber(stepLength)} = ${e616FormatNumber(circumference)}，直徑 = ${e616FormatNumber(circumference)} ÷ 3.14 = ${diameter}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE616SectorPerimeterSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const radius = pickFromList([3, 4, 5, 6, 8, 9, 10, 12, 15, 18]);
        const angle = e616PickAngle();
        const arc = e616ArcLength(radius, angle);
        const perimeter = e616SectorPerimeter(radius, angle);
        questions.push(`半徑 ${radius} 公分、圓心角 ${angle}° 的扇形，周長大約是多少公分？`);
        summaryAnswers.push(`${e616FormatNumber(perimeter)}公分`);
        answers.push(
          `簡答：${e616FormatNumber(perimeter)}公分。過程：弧長 = 圓周長 × ${angle}/360 = ${e616FormatNumber(arc)}，扇形周長 = 弧長 + 2 條半徑 = ${e616FormatNumber(arc)} + ${2 * radius} = ${e616FormatNumber(perimeter)}。`
        );
        continue;
      }
      if (mode === 1) {
        const radius = pickFromList([3, 4, 5, 6, 8, 9, 10, 12]);
        const partDen = pickFromList([3, 4, 5, 6, 8, 10]);
        const partNum = pickFromList([1, 2, 3]);
        if (partNum >= partDen) {
          i -= 1;
          continue;
        }
        const angle = (360 * partNum) / partDen;
        const arc = e616ArcLength(radius, angle);
        const perimeter = e616SectorPerimeter(radius, angle);
        questions.push(
          `半徑 ${radius} 公分的圓，取其中 $\\frac{${partNum}}{${partDen}}$ 圓形成扇形，它的周長大約是多少公分？`
        );
        summaryAnswers.push(`${e616FormatNumber(perimeter)}公分`);
        answers.push(
          `簡答：${e616FormatNumber(perimeter)}公分。過程：這一段弧長是整個圓周長的 $\\frac{${partNum}}{${partDen}}$，所以弧長為 ${e616FormatNumber(arc)}，再加上兩條半徑 ${2 * radius}，周長是 ${e616FormatNumber(perimeter)}。`
        );
        continue;
      }
      const diameter = pickFromList([10, 12, 16, 18, 20, 24, 30, 40, 50]);
      const angle = e616PickAngle();
      const radius = diameter / 2;
      const arc = e616ArcLength(radius, angle);
      const perimeter = e616SectorPerimeter(radius, angle);
      questions.push(`直徑 ${diameter} 公分、圓心角 ${angle}° 的扇形，周長大約是多少公分？`);
      summaryAnswers.push(`${e616FormatNumber(perimeter)}公分`);
      answers.push(
        `簡答：${e616FormatNumber(perimeter)}公分。過程：半徑是 ${radius} 公分，弧長 = 圓周長 × ${angle}/360 = ${e616FormatNumber(arc)}，再加兩條半徑 ${diameter}，所以周長是 ${e616FormatNumber(perimeter)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE616SectorFromWholeCircumferenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const radius = pickFromList([5, 6, 8, 10, 12, 15, 18, 20]);
      const wholeCircumference = e616CircumferenceByRadius(radius);
      const angle = e616PickAngle();
      const arc = (wholeCircumference * angle) / 360;
      const perimeter = arc + 2 * radius;
      if (i % 2 === 0) {
        questions.push(
          `一個圓的圓周長是 ${e616FormatNumber(wholeCircumference)} 公分，取圓心角 ${angle}° 的扇形，這個扇形的周長大約是多少公分？`
        );
        summaryAnswers.push(`${e616FormatNumber(perimeter)}公分`);
        answers.push(
          `簡答：${e616FormatNumber(perimeter)}公分。過程：弧長是整個圓周長的 ${angle}/360，所以弧長 = ${e616FormatNumber(wholeCircumference)} × ${angle}/360 = ${e616FormatNumber(arc)}；半徑由整個圓周長反推得 ${radius}，扇形周長 = ${e616FormatNumber(arc)} + ${2 * radius} = ${e616FormatNumber(perimeter)}。`
        );
      } else {
        questions.push(
          `一個圓的圓周長是 ${e616FormatNumber(wholeCircumference)} 公分，取圓心角 ${angle}° 的扇形，這個扇形的弧長大約是多少公分？`
        );
        summaryAnswers.push(`${e616FormatNumber(arc)}公分`);
        answers.push(
          `簡答：${e616FormatNumber(arc)}公分。過程：弧長 = 整個圓周長 × ${angle}/360 = ${e616FormatNumber(wholeCircumference)} × ${angle}/360 = ${e616FormatNumber(arc)}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE616MultiplierSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const multiplier = pickFromList([2, 3, 4, 5, 6]);
      const mode = i % 3;
      if (mode === 0) {
        questions.push(`甲圓的直徑是乙圓的 ${multiplier} 倍，甲圓周長是乙圓周長的幾倍？`);
        summaryAnswers.push(`${multiplier}倍`);
        answers.push(`簡答：${multiplier}倍。過程：圓周長和直徑成正比，所以直徑幾倍，圓周長就是幾倍。`);
        continue;
      }
      if (mode === 1) {
        questions.push(`甲圓的半徑是乙圓的 ${multiplier} 倍，甲圓周長是乙圓周長的幾倍？`);
        summaryAnswers.push(`${multiplier}倍`);
        answers.push(`簡答：${multiplier}倍。過程：圓周長 = 半徑 × 2 × 3.14，所以半徑幾倍，圓周長也是幾倍。`);
        continue;
      }
      const diameterA = pickFromList([8, 10, 12, 15]);
      const diameterB = diameterA * multiplier;
      questions.push(`甲圓直徑 ${diameterA} 公分，乙圓直徑 ${diameterB} 公分，乙圓周長是甲圓周長的幾倍？`);
      summaryAnswers.push(`${multiplier}倍`);
      answers.push(
        `簡答：${multiplier}倍。過程：乙圓直徑是甲圓的 ${multiplier} 倍，圓周長也跟著放大 ${multiplier} 倍。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE616CircularIntervalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const scenes = [
      ['花圃', '盆花', '盆'],
      ['人造池', '告示牌', '個'],
      ['蛋糕邊緣', '奶油花', '朵'],
      ['跑道', '指標牌', '個'],
      ['圓形步道', '樹苗', '棵'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [place, objectName, unitWord] = pickFromList(scenes);
      const countObj = pickFromList([10, 12, 15, 16, 18, 20, 24, 25, 30]);
      const gap = pickFromList([2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 25, 30, 45, 50, 54]);
      const circumference = countObj * gap;
      if (i % 2 === 0) {
        questions.push(
          `一個${place}的周長是 ${circumference} 公尺，沿周圍每隔相同距離放 1 ${unitWord}${objectName}，共放了 ${countObj} ${unitWord}，相鄰兩${unitWord}${objectName}距離幾公尺？`
        );
        summaryAnswers.push(`${gap}公尺`);
        answers.push(
          `簡答：${gap}公尺。過程：圓周上首尾相接，間隔數 = 物件數，所以每段距離 = 周長 ÷ ${countObj} = ${circumference} ÷ ${countObj} = ${gap}。`
        );
      } else {
        questions.push(
          `在一個${place}周圍，每隔 ${gap} 公尺放 1 ${unitWord}${objectName}，共放了 ${countObj} ${unitWord}，這個${place}的周長是多少公尺？`
        );
        summaryAnswers.push(`${circumference}公尺`);
        answers.push(
          `簡答：${circumference}公尺。過程：圓周上首尾相接，間隔數 = 物件數，所以周長 = ${gap} × ${countObj} = ${circumference}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE616MixedSet(banks, count) {
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

  function buildE616FoundationMixedSet(count) {
    return buildE616MixedSet([buildE616PiConceptSet, buildE616CircumferenceSet, buildE616InverseSet], count);
  }

  function buildE616MotionMixedSet(count) {
    return buildE616MixedSet([buildE616RollingDistanceSet, buildE616StepSet], count);
  }

  function buildE616SectorMixedSet(count) {
    return buildE616MixedSet([buildE616SectorPerimeterSet, buildE616SectorFromWholeCircumferenceSet], count);
  }

  function buildE616MultiplierMixedSet(count) {
    return buildE616MixedSet([buildE616MultiplierSet], count);
  }

  function buildE616IntervalMixedSet(count) {
    return buildE616MixedSet([buildE616CircularIntervalSet], count);
  }


  function buildE616Pi22Over7Set(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const rCases = [3.5, 7, 10.5, 14, 17.5, 21];
    const dCases = [7, 14, 21, 28, 35, 42];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const r = rCases[i % rCases.length];
        const c = 2 * r * 22 / 7;
        questions.push(`一個半徑 ${r} 公分的圓，圓周長大約是多少公分？（圓周率用 $\\frac{22}{7}$ 計算）`);
        summaryAnswers.push(`${c}公分`);
        answers.push(`簡答：${c}公分。過程：圓周長 = 半徑 × 2 × $\\frac{22}{7}$ = ${r} × 2 × $\\frac{22}{7}$ = ${c}。`);
      } else if (mode === 1) {
        const d = dCases[i % dCases.length];
        const c = d * 22 / 7;
        questions.push(`一個直徑 ${d} 公分的圓，圓周長大約是多少公分？（圓周率用 $\\frac{22}{7}$ 計算）`);
        summaryAnswers.push(`${c}公分`);
        answers.push(`簡答：${c}公分。過程：圓周長 = 直徑 × $\\frac{22}{7}$ = ${d} × $\\frac{22}{7}$ = ${c}。`);
      } else if (mode === 2) {
        const d = dCases[i % dCases.length];
        const c = d * 22 / 7;
        questions.push(`一個圓的圓周長是 ${c} 公分，它的直徑是多少公分？（圓周率用 $\\frac{22}{7}$ 計算）`);
        summaryAnswers.push(`${d}公分`);
        answers.push(`簡答：${d}公分。過程：直徑 = 圓周長 ÷ $\\frac{22}{7}$ = ${c} × $\\frac{7}{22}$ = ${d}。`);
      } else {
        const r = rCases[i % rCases.length];
        const c = 2 * r * 22 / 7;
        questions.push(`一個圓的圓周長是 ${c} 公分，它的半徑是多少公分？（圓周率用 $\\frac{22}{7}$ 計算）`);
        summaryAnswers.push(`${r}公分`);
        answers.push(`簡答：${r}公分。過程：半徑 = 圓周長 ÷ $\\frac{22}{7}$ ÷ 2 = ${c} × $\\frac{7}{22}$ ÷ 2 = ${r}。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function e617FormatNumber(value, digits = 2) {
    return trimDecimalString(Number(value.toFixed(digits)).toString());
  }

  function e617CircleAreaByRadius(radius) {
    return radius * radius * E616_PI;
  }

  function e617CircleAreaByDiameter(diameter) {
    return e617CircleAreaByRadius(diameter / 2);
  }

  function e617SectorArea(radius, angle) {
    return (e617CircleAreaByRadius(radius) * angle) / 360;
  }

  function buildE617CircleAreaDirectSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const radius = pickFromList([3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20]);
        const area = e617CircleAreaByRadius(radius);
        questions.push(`半徑 ${radius} 公分的圓，面積大約是多少平方公分？`);
        summaryAnswers.push(`${e617FormatNumber(area)}平方公分`);
        answers.push(
          `簡答：${e617FormatNumber(area)}平方公分。過程：圓面積 = 半徑 × 半徑 × 3.14 = ${radius} × ${radius} × 3.14 = ${e617FormatNumber(area)}。`
        );
      } else {
        const diameter = pickFromList([6, 8, 10, 12, 14, 16, 20, 24, 26, 30, 40]);
        const radius = diameter / 2;
        const area = e617CircleAreaByDiameter(diameter);
        questions.push(`直徑 ${diameter} 公分的圓，面積大約是多少平方公分？`);
        summaryAnswers.push(`${e617FormatNumber(area)}平方公分`);
        answers.push(
          `簡答：${e617FormatNumber(area)}平方公分。過程：半徑 = ${diameter} ÷ 2 = ${radius}，圓面積 = ${radius} × ${radius} × 3.14 = ${e617FormatNumber(area)}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE617CircleAreaFromCircumferenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const radius = pickFromList([3, 4, 5, 6, 8, 10, 12, 15, 18, 20]);
      const circumference = e616CircumferenceByRadius(radius);
      const area = e617CircleAreaByRadius(radius);
      questions.push(`一個圓的圓周長大約是 ${e616FormatNumber(circumference)} 公分，它的面積大約是多少平方公分？`);
      summaryAnswers.push(`${e617FormatNumber(area)}平方公分`);
      answers.push(
        `簡答：${e617FormatNumber(area)}平方公分。過程：先求半徑 = 圓周長 ÷ 3.14 ÷ 2 = ${e616FormatNumber(circumference)} ÷ 3.14 ÷ 2 = ${radius}，再算面積 ${radius} × ${radius} × 3.14 = ${e617FormatNumber(area)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE617AreaMultiplierSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const multiplier = pickFromList([2, 3, 4, 5, 6]);
      if (i % 2 === 0) {
        questions.push(`甲圓半徑是乙圓半徑的 ${multiplier} 倍，甲圓面積是乙圓面積的幾倍？`);
        summaryAnswers.push(`${multiplier * multiplier}倍`);
        answers.push(
          `簡答：${multiplier * multiplier}倍。過程：圓面積和半徑平方成正比，所以半徑放大 ${multiplier} 倍，面積放大 ${multiplier}^2 = ${multiplier * multiplier} 倍。`
        );
      } else {
        const radiusA = pickFromList([3, 4, 5, 6, 8]);
        const radiusB = radiusA * multiplier;
        questions.push(`甲圓半徑 ${radiusA} 公分，乙圓半徑 ${radiusB} 公分，乙圓面積是甲圓面積的幾倍？`);
        summaryAnswers.push(`${multiplier * multiplier}倍`);
        answers.push(
          `簡答：${multiplier * multiplier}倍。過程：半徑比是 ${radiusB}:${radiusA} = ${multiplier}:1，所以面積比是 ${multiplier}^2:1 = ${multiplier * multiplier}:1。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE617SectorAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const radius = pickFromList([4, 5, 6, 8, 9, 10, 12, 15, 16, 18, 20]);
      const angle = e616PickAngle();
      const wholeArea = e617CircleAreaByRadius(radius);
      const area = e617SectorArea(radius, angle);
      questions.push(`半徑 ${radius} 公分、圓心角 ${angle}° 的扇形，面積大約是多少平方公分？`);
      summaryAnswers.push(`${e617FormatNumber(area)}平方公分`);
      answers.push(
        `簡答：${e617FormatNumber(area)}平方公分。過程：整個圓面積是 ${radius} × ${radius} × 3.14 = ${e617FormatNumber(wholeArea)}，扇形面積 = ${e617FormatNumber(wholeArea)} × ${angle}/360 = ${e617FormatNumber(area)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE617SectorFractionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const radius = pickFromList([6, 8, 9, 10, 12, 15, 18, 20, 24]);
      const den = pickFromList([3, 4, 5, 6, 8, 10, 12]);
      const num = pickFromList([1, 2, 3]);
      if (num >= den) {
        i -= 1;
        continue;
      }
      const angle = (360 * num) / den;
      const wholeArea = e617CircleAreaByRadius(radius);
      const area = (wholeArea * num) / den;
      questions.push(`半徑 ${radius} 公分的圓，取其中 $\\frac{${num}}{${den}}$ 圓形成扇形，面積大約是多少平方公分？`);
      summaryAnswers.push(`${e617FormatNumber(area)}平方公分`);
      answers.push(
        `簡答：${e617FormatNumber(area)}平方公分。過程：整個圓面積是 ${e617FormatNumber(wholeArea)}，這個扇形占整圓的 $\\frac{${num}}{${den}}$，所以面積 = ${e617FormatNumber(wholeArea)} × $\\frac{${num}}{${den}}$ = ${e617FormatNumber(area)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE617CompositeAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const side = pickFromList([12, 16, 20, 24, 28, 30]);
        const radius = side / 2;
        const squareArea = side * side;
        const circleArea = e617CircleAreaByRadius(radius);
        const remain = squareArea - circleArea;
        questions.push(`邊長 ${side} 公分的正方形中畫一個最大圓，剩餘部分面積大約是多少平方公分？`);
        summaryAnswers.push(`${e617FormatNumber(remain)}平方公分`);
        answers.push(
          `簡答：${e617FormatNumber(remain)}平方公分。過程：正方形面積是 ${side} × ${side} = ${squareArea}，最大圓半徑是 ${radius}，圓面積是 ${e617FormatNumber(circleArea)}，剩餘面積 = ${squareArea} - ${e617FormatNumber(circleArea)} = ${e617FormatNumber(remain)}。`
        );
        continue;
      }
      if (mode === 1) {
        const side = pickFromList([12, 16, 20, 24, 28]);
        const radius = side;
        const squareArea = side * side;
        const quarterArea = e617CircleAreaByRadius(radius) / 4;
        const remain = squareArea - quarterArea;
        questions.push(
          `邊長 ${side} 公分的正方形中，扣掉一個半徑 ${radius} 公分的 $\\frac{1}{4}$ 圓，剩餘面積大約是多少平方公分？`
        );
        summaryAnswers.push(`${e617FormatNumber(remain)}平方公分`);
        answers.push(
          `簡答：${e617FormatNumber(remain)}平方公分。過程：正方形面積是 ${squareArea}，$\\frac{1}{4}$ 圓面積是 ${e617FormatNumber(quarterArea)}，所以剩餘面積是 ${squareArea} - ${e617FormatNumber(quarterArea)} = ${e617FormatNumber(remain)}。`
        );
        continue;
      }
      if (mode === 2) {
        const outer = pickFromList([8, 10, 12, 15, 18, 20]);
        const inner = outer - pickFromList([1, 2, 3, 4]);
        const area = e617CircleAreaByRadius(outer) - e617CircleAreaByRadius(inner);
        questions.push(`外圓半徑 ${outer} 公分、內圓半徑 ${inner} 公分的環形，面積大約是多少平方公分？`);
        summaryAnswers.push(`${e617FormatNumber(area)}平方公分`);
        answers.push(
          `簡答：${e617FormatNumber(area)}平方公分。過程：環形面積 = 大圓面積 - 小圓面積 = ${e617FormatNumber(e617CircleAreaByRadius(outer))} - ${e617FormatNumber(e617CircleAreaByRadius(inner))} = ${e617FormatNumber(area)}。`
        );
        continue;
      }
      const rectL = pickFromList([18, 20, 24, 28, 30, 36]);
      const rectW = rectL - pickFromList([4, 6, 8, 10]);
      if (rectW <= 0) {
        i -= 1;
        continue;
      }
      const radius = rectW / 2;
      const rectArea = rectL * rectW;
      const circleArea = e617CircleAreaByRadius(radius);
      const remain = rectArea - circleArea;
      questions.push(`長 ${rectL} 公分、寬 ${rectW} 公分的長方形中畫一個最大圓，剩餘面積大約是多少平方公分？`);
      summaryAnswers.push(`${e617FormatNumber(remain)}平方公分`);
      answers.push(
        `簡答：${e617FormatNumber(remain)}平方公分。過程：長方形面積是 ${rectArea}，最大圓的直徑等於短邊 ${rectW}，半徑是 ${radius}，圓面積是 ${e617FormatNumber(circleArea)}，剩餘面積是 ${rectArea} - ${e617FormatNumber(circleArea)} = ${e617FormatNumber(remain)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE617RingApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const scenes = ['圓形浴池外圍步道', '噴水池外圍步道', '圓形花圃外圈', '圓形舞台外圍走道', '圓桌外圍桌巾'];
    for (let i = 0; i < count; i += 1) {
      const scene = pickFromList(scenes);
      const innerRadius = pickFromList([6, 8, 10, 12, 15, 18, 20]);
      const width = pickFromList([1, 2, 3, 4, 5]);
      const outerRadius = innerRadius + width;
      const area = e617CircleAreaByRadius(outerRadius) - e617CircleAreaByRadius(innerRadius);
      questions.push(`半徑 ${innerRadius} 公尺的${scene}，外圍再加寬 ${width} 公尺，新增部分面積大約是多少平方公尺？`);
      summaryAnswers.push(`${e617FormatNumber(area)}平方公尺`);
      answers.push(
        `簡答：${e617FormatNumber(area)}平方公尺。過程：新增部分是環形面積 = 外圓面積 - 內圓面積 = ${e617FormatNumber(e617CircleAreaByRadius(outerRadius))} - ${e617FormatNumber(e617CircleAreaByRadius(innerRadius))} = ${e617FormatNumber(area)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE617TetherSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const length = pickFromList([12, 16, 20, 24, 30, 36, 40]);
        const width = length / 2;
        const rope = width;
        const area = (e617CircleAreaByRadius(rope) * 3) / 4;
        questions.push(
          `長 ${length} 公尺、寬 ${width} 公尺的倉庫旁拴羊，繩長 ${rope} 公尺，活動面積大約是多少平方公尺？（視為 $\\frac{3}{4}$ 圓）`
        );
        summaryAnswers.push(`${e617FormatNumber(area)}平方公尺`);
        answers.push(
          `簡答：${e617FormatNumber(area)}平方公尺。過程：活動範圍視為半徑 ${rope} 的 $\\frac{3}{4}$ 圓，整圓面積是 ${e617FormatNumber(e617CircleAreaByRadius(rope))}，所以活動面積是 ${e617FormatNumber(area)}。`
        );
        continue;
      }
      if (mode === 1) {
        const width = pickFromList([8, 10, 12, 15, 20]);
        const rope = width + pickFromList([2, 4, 5, 6, 8]);
        const quarterRadius = rope - width;
        const baseArea = (e617CircleAreaByRadius(width) * 3) / 4;
        const extraArea = e617CircleAreaByRadius(quarterRadius) / 4;
        const area = baseArea + extraArea;
        questions.push(
          `一頭牛拴在長方形牛舍角落，短邊 ${width} 公尺，繩長 ${rope} 公尺，活動面積大約是多少平方公尺？（視為 $\\frac{3}{4}$ 圓加 $\\frac{1}{4}$ 圓）`
        );
        summaryAnswers.push(`${e617FormatNumber(area)}平方公尺`);
        answers.push(
          `簡答：${e617FormatNumber(area)}平方公尺。過程：先有半徑 ${width} 的 $\\frac{3}{4}$ 圓，再多出半徑 ${quarterRadius} 的 $\\frac{1}{4}$ 圓，所以總面積 = ${e617FormatNumber(baseArea)} + ${e617FormatNumber(extraArea)} = ${e617FormatNumber(area)}。`
        );
        continue;
      }
      const wallLength = pickFromList([20, 24, 25, 30, 36]);
      const rope = pickFromList([10, 12, 15, 18]);
      const area = e617CircleAreaByRadius(rope) / 2;
      questions.push(
        `把牛拴在長 ${wallLength} 公尺的牆壁中點，繩長 ${rope} 公尺，求活動面積大約是多少平方公尺。（提示：視為半圓）`
      );
      summaryAnswers.push(`${e617FormatNumber(area)}平方公尺`);
      answers.push(
        `簡答：${e617FormatNumber(area)}平方公尺。過程：牆壁擋住一半，活動範圍視為半徑 ${rope} 的半圓，面積是 ${e617FormatNumber(e617CircleAreaByRadius(rope))} ÷ 2 = ${e617FormatNumber(area)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }


  function buildE617AreaInverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const rCases = [2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20];
    const itemNames = ['水池', '圓桌', '鏡子', '花圃', '操場', '燈泡底面'];
    for (let i = 0; i < count; i += 1) {
      const r = rCases[i % rCases.length];
      const area = r * r * 3.14;
      const areaStr = trimDecimalString(area.toFixed(2));
      const item = itemNames[i % itemNames.length];
      if (i % 2 === 0) {
        questions.push(`一個${item}的面積大約是 ${areaStr} 平方公分，它的半徑大約是多少公分？（圓周率用 3.14）`);
        summaryAnswers.push(`${r}公分`);
        answers.push(`簡答：${r}公分。過程：半徑² = 面積 ÷ 3.14 = ${areaStr} ÷ 3.14 = ${r*r}，半徑 = $\\sqrt{${r*r}}$ = ${r}。`);
      } else {
        questions.push(`一個${item}的面積大約是 ${areaStr} 平方公分，它的直徑大約是多少公分？（圓周率用 3.14）`);
        summaryAnswers.push(`${r*2}公分`);
        answers.push(`簡答：${r*2}公分。過程：半徑² = ${areaStr} ÷ 3.14 = ${r*r}，半徑 = ${r}，直徑 = ${r} × 2 = ${r*2}。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE617MixedSet(banks, count) {
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

  function buildE617FoundationThreeSet(count) {
    return buildE617MixedSet(
      [buildE617CircleAreaDirectSet, buildE617CircleAreaFromCircumferenceSet, buildE617AreaMultiplierSet],
      count
    );
  }

  function buildE617SectorTwoSet(count) {
    return buildE617MixedSet([buildE617SectorAreaSet, buildE617SectorFractionSet], count);
  }

  function buildE617CompositeOneSet(count) {
    return buildE617MixedSet([buildE617CompositeAreaSet], count);
  }

  function buildE617RingOneSet(count) {
    return buildE617MixedSet([buildE617RingApplicationSet], count);
  }

  function buildE617TetherOneSet(count) {
    return buildE617MixedSet([buildE617TetherSet], count);
  }

  const E618_LENGTH_TO_METER = {
    公里: 1000,
    公尺: 1,
    公分: 0.01,
  };

  const E618_TIME_TO_SECOND = {
    小時: 3600,
    分: 60,
    秒: 1,
  };

  function e618FormatNumber(value, digits = 2) {
    return trimDecimalString(Number(value.toFixed(digits)).toString());
  }

  function e618UnitText(lengthUnit, timeUnit) {
    return `${lengthUnit}/${timeUnit === '小時' ? '時' : timeUnit}`;
  }

  function e618SpeedToMetersPerSecond(value, lengthUnit, timeUnit) {
    return (value * E618_LENGTH_TO_METER[lengthUnit]) / E618_TIME_TO_SECOND[timeUnit];
  }

  function e618ConvertFromMetersPerSecond(value, lengthUnit, timeUnit) {
    return (value * E618_TIME_TO_SECOND[timeUnit]) / E618_LENGTH_TO_METER[lengthUnit];
  }

  function e618ConvertSpeed(value, fromLength, fromTime, toLength, toTime) {
    return e618ConvertFromMetersPerSecond(e618SpeedToMetersPerSecond(value, fromLength, fromTime), toLength, toTime);
  }

  function e618PickDifferentUnitPair() {
    const pairs = [
      ['公里', '小時'],
      ['公里', '分'],
      ['公尺', '分'],
      ['公尺', '秒'],
      ['公分', '秒'],
    ];
    const left = pickFromList(pairs);
    let right = pickFromList(pairs);
    while (right[0] === left[0] && right[1] === left[1]) {
      right = pickFromList(pairs);
    }
    return { left, right };
  }

  function buildE618RateBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modes = [
      {
        distanceUnit: '公里',
        timeUnit: '小時',
        lengthUnit: '公里',
        speeds: [40, 48, 50, 60, 72, 80, 90, 100, 120],
        times: [1.25, 1.5, 2, 2.5, 3, 4],
      },
      {
        distanceUnit: '公尺',
        timeUnit: '分',
        lengthUnit: '公尺',
        speedUnit: '分',
        speeds: [45, 60, 72, 90, 120, 150, 180, 210, 240],
        times: [5, 6, 8, 10, 12, 15, 20],
      },
      {
        distanceUnit: '公尺',
        timeUnit: '秒',
        lengthUnit: '公尺',
        speedUnit: '秒',
        speeds: [4, 5, 6, 8, 9, 10, 12, 15],
        times: [5, 8, 10, 12, 16, 20],
      },
    ];
    const scenes = [
      ['開車', '行駛'],
      ['騎腳踏車', '前進'],
      ['跑步', '跑了'],
      ['步行', '走了'],
      ['滑板車', '滑行'],
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      const speed = pickFromList(mode.speeds);
      const time = pickFromList(mode.times);
      const distance = speed * time;
      const [subject, verb] = pickFromList(scenes);
      questions.push(
        `求速率：某人${subject} ${e618FormatNumber(distance)} ${mode.distanceUnit}，共花 ${e618FormatNumber(time)} ${mode.timeUnit}，平均每1${mode.timeUnit}${verb}多少${mode.lengthUnit}？`
      );
      summaryAnswers.push(`${e618FormatNumber(speed)}${e618UnitText(mode.lengthUnit, mode.timeUnit)}`);
      answers.push(
        `簡答：${e618FormatNumber(speed)}${e618UnitText(mode.lengthUnit, mode.timeUnit)}。過程：速率 = 距離 ÷ 時間 = ${e618FormatNumber(distance)} ÷ ${e618FormatNumber(time)} = ${e618FormatNumber(speed)}，所以速率是 ${e618FormatNumber(speed)}${e618UnitText(mode.lengthUnit, mode.timeUnit)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE618DistanceBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modes = [
      {
        lengthUnit: '公里',
        timeUnit: '小時',
        speeds: [12, 15, 18, 24, 30, 36, 40, 48, 60],
        times: [1.5, 2, 2.5, 3, 3.5, 4, 4.5],
      },
      {
        lengthUnit: '公尺',
        timeUnit: '分',
        speeds: [36.4, 45, 60, 72, 73, 90, 120, 150],
        times: [4, 5, 6.5, 8, 10, 12, 15],
      },
      { lengthUnit: '公尺', timeUnit: '秒', speeds: [0.8, 1.2, 1.3, 2, 4, 6, 8], times: [10, 12, 13, 15, 20, 25, 30] },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      const speed = pickFromList(mode.speeds);
      const time = pickFromList(mode.times);
      const distance = speed * time;
      questions.push(
        `求距離：速率是 ${e618FormatNumber(speed)}${e618UnitText(mode.lengthUnit, mode.timeUnit)}，持續 ${e618FormatNumber(time)} ${mode.timeUnit}，一共走了多少${mode.lengthUnit}？`
      );
      summaryAnswers.push(`${e618FormatNumber(distance)}${mode.lengthUnit}`);
      answers.push(
        `簡答：${e618FormatNumber(distance)}${mode.lengthUnit}。過程：距離 = 速率 × 時間 = ${e618FormatNumber(speed)} × ${e618FormatNumber(time)} = ${e618FormatNumber(distance)}，所以距離是 ${e618FormatNumber(distance)}${mode.lengthUnit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE618TimeBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modes = [
      {
        lengthUnit: '公里',
        timeUnit: '小時',
        speeds: [12, 18, 24, 31.5, 40, 48, 60, 72, 80, 90, 128],
        times: [1.2, 1.5, 2, 2.5, 3, 3.5, 4.5],
      },
      { lengthUnit: '公尺', timeUnit: '分', speeds: [18, 24, 30, 36.4, 45, 60, 72], times: [4, 5, 6, 8, 10, 12, 15] },
      { lengthUnit: '公尺', timeUnit: '秒', speeds: [4, 5, 6, 8, 10, 12, 15, 40], times: [5, 8, 10, 12, 15, 20, 25] },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      const speed = pickFromList(mode.speeds);
      const time = pickFromList(mode.times);
      const distance = speed * time;
      questions.push(
        `求時間：距離是 ${e618FormatNumber(distance)}${mode.lengthUnit}，速率是 ${e618FormatNumber(speed)}${e618UnitText(mode.lengthUnit, mode.timeUnit)}，需要多少${mode.timeUnit}？`
      );
      summaryAnswers.push(`${e618FormatNumber(time)}${mode.timeUnit}`);
      answers.push(
        `簡答：${e618FormatNumber(time)}${mode.timeUnit}。過程：時間 = 距離 ÷ 速率 = ${e618FormatNumber(distance)} ÷ ${e618FormatNumber(speed)} = ${e618FormatNumber(time)}，所以需要 ${e618FormatNumber(time)}${mode.timeUnit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE618LengthUnitConvertSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modes = [
      { value: [17, 45, 62, 120], fromLength: '公里', timeUnit: '小時', toLength: '公尺' },
      { value: [2.1, 6.2, 21, 45], fromLength: '公里', timeUnit: '分', toLength: '公尺' },
      { value: [6.4, 8.5, 9.89, 12.3], fromLength: '公尺', timeUnit: '秒', toLength: '公分' },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      const value = pickFromList(mode.value);
      const converted = e618ConvertSpeed(value, mode.fromLength, mode.timeUnit, mode.toLength, mode.timeUnit);
      questions.push(
        `速率換算：${e618FormatNumber(value)}${e618UnitText(mode.fromLength, mode.timeUnit)}，換成 ${e618UnitText(mode.toLength, mode.timeUnit)} 是多少？`
      );
      summaryAnswers.push(`${e618FormatNumber(converted)}${e618UnitText(mode.toLength, mode.timeUnit)}`);
      answers.push(
        `簡答：${e618FormatNumber(converted)}${e618UnitText(mode.toLength, mode.timeUnit)}。過程：時間單位不變，只換長度單位。${mode.fromLength === '公里' ? '1公里 = 1000公尺' : '1公尺 = 100公分'}，所以 ${e618FormatNumber(value)}${e618UnitText(mode.fromLength, mode.timeUnit)} = ${e618FormatNumber(converted)}${e618UnitText(mode.toLength, mode.timeUnit)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE618TimeUnitConvertSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modes = [
      {
        value: [60, 90, 120, 180, 240],
        lengthUnit: '公里',
        fromTime: '小時',
        toTime: '分',
        explain: '1小時 = 60分，所以要除以60',
      },
      {
        value: [54, 60, 72, 90, 120, 150, 600],
        lengthUnit: '公尺',
        fromTime: '分',
        toTime: '秒',
        explain: '1分 = 60秒，所以要除以60',
      },
      {
        value: [36, 72, 108, 144, 180],
        lengthUnit: '公里',
        fromTime: '小時',
        toTime: '秒',
        explain: '1小時 = 3600秒，所以要除以3600',
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      const value = pickFromList(mode.value);
      const converted = e618ConvertSpeed(value, mode.lengthUnit, mode.fromTime, mode.lengthUnit, mode.toTime);
      questions.push(
        `速率換算：${e618FormatNumber(value)}${e618UnitText(mode.lengthUnit, mode.fromTime)}，換成 ${e618UnitText(mode.lengthUnit, mode.toTime)} 是多少？`
      );
      summaryAnswers.push(`${e618FormatNumber(converted)}${e618UnitText(mode.lengthUnit, mode.toTime)}`);
      answers.push(
        `簡答：${e618FormatNumber(converted)}${e618UnitText(mode.lengthUnit, mode.toTime)}。過程：長度單位不變，只換時間單位。${mode.explain}，所以 ${e618FormatNumber(value)}${e618UnitText(mode.lengthUnit, mode.fromTime)} = ${e618FormatNumber(converted)}${e618UnitText(mode.lengthUnit, mode.toTime)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE618DoubleUnitConvertSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modes = [
      { value: [54, 72, 90, 120, 288], fromLength: '公里', fromTime: '小時', toLength: '公尺', toTime: '分' },
      {
        value: [36, 54, 72, 90, 108, 180, 468, 918],
        fromLength: '公里',
        fromTime: '小時',
        toLength: '公尺',
        toTime: '秒',
      },
      { value: [10, 12, 15, 20, 25], fromLength: '公尺', fromTime: '秒', toLength: '公里', toTime: '小時' },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      const value = pickFromList(mode.value);
      const converted = e618ConvertSpeed(value, mode.fromLength, mode.fromTime, mode.toLength, mode.toTime);
      questions.push(
        `連續換算：${e618FormatNumber(value)}${e618UnitText(mode.fromLength, mode.fromTime)}，換成 ${e618UnitText(mode.toLength, mode.toTime)} 是多少？`
      );
      summaryAnswers.push(`${e618FormatNumber(converted)}${e618UnitText(mode.toLength, mode.toTime)}`);
      answers.push(
        `簡答：${e618FormatNumber(converted)}${e618UnitText(mode.toLength, mode.toTime)}。過程：先把 ${mode.fromLength} 換成 ${mode.toLength}，再把 ${mode.fromTime} 換成 ${mode.toTime}，等同乘上對應換算倍數，所以得到 ${e618FormatNumber(converted)}${e618UnitText(mode.toLength, mode.toTime)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE618CompareSpeedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const labelsTwo = [
      ['甲車', '乙車'],
      ['小明', '小華'],
      ['羚羊', '獵豹'],
      ['甲', '乙'],
    ];
    const labelsThree = [
      ['甲車', '乙車', '丙車'],
      ['小華', '小安', '小芸'],
      ['海豚', '旗魚', '鯨魚'],
    ];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const mpsA = pickFromList([4, 5, 6, 8, 10, 12, 15, 21]);
        let mpsB = pickFromList([4, 5, 6, 8, 10, 12, 15, 21]);
        while (mpsB === mpsA) {
          mpsB = pickFromList([4, 5, 6, 8, 10, 12, 15, 21]);
        }
        const pair = e618PickDifferentUnitPair();
        const leftValue = e618ConvertFromMetersPerSecond(mpsA, pair.left[0], pair.left[1]);
        const rightValue = e618ConvertFromMetersPerSecond(mpsB, pair.right[0], pair.right[1]);
        const [leftLabel, rightLabel] = pickFromList(labelsTwo);
        const faster = mpsA > mpsB ? leftLabel : rightLabel;
        questions.push(
          `哪個較快：${leftLabel}速率 ${e618FormatNumber(leftValue)}${e618UnitText(pair.left[0], pair.left[1])}，${rightLabel}速率 ${e618FormatNumber(rightValue)}${e618UnitText(pair.right[0], pair.right[1])}？`
        );
        summaryAnswers.push(`${faster}較快`);
        answers.push(
          `簡答：${faster}較快。過程：先統一成公尺/秒，${leftLabel}是 ${e618FormatNumber(mpsA)}公尺/秒，${rightLabel}是 ${e618FormatNumber(mpsB)}公尺/秒，比較後可知 ${faster}較快。`
        );
      } else {
        const base = [4, 5, 6, 8, 10, 12, 15];
        const mpsList = [];
        while (mpsList.length < 3) {
          const value = pickFromList(base);
          if (!mpsList.includes(value)) {
            mpsList.push(value);
          }
        }
        const labels = pickFromList(labelsThree);
        const units = [
          ['公里', '小時'],
          ['公尺', '分'],
          ['公尺', '秒'],
        ];
        const shown = mpsList.map((mps, index) => {
          const unit = units[index];
          return {
            label: labels[index],
            mps,
            value: e618ConvertFromMetersPerSecond(mps, unit[0], unit[1]),
            unitText: e618UnitText(unit[0], unit[1]),
          };
        });
        const order = shown
          .slice()
          .sort((a, b) => b.mps - a.mps)
          .map((item) => item.label)
          .join('＞');
        questions.push(
          `由快到慢排序：${shown.map((item) => `${item.label}${e618FormatNumber(item.value)}${item.unitText}`).join('，')}。`
        );
        summaryAnswers.push(order);
        answers.push(
          `簡答：${order}。過程：先統一成公尺/秒，${shown.map((item) => `${item.label}=${e618FormatNumber(item.mps)}公尺/秒`).join('，')}，所以由快到慢是 ${order}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE618ProportionalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const multipliers = [2, 3, 4, 5];
    for (let i = 0; i < count; i += 1) {
      const k = pickFromList(multipliers);
      const mode = i % 4;
      if (mode === 0) {
        const speed = pickFromList([25, 40, 60, 80, 120]);
        questions.push(`速率固定：一輛車分速 ${speed} 公尺，時間從 1 分鐘變成 ${k} 分鐘，行駛距離會變為原來的幾倍？`);
        summaryAnswers.push(`${k}倍`);
        answers.push(
          `簡答：${k}倍。過程：速率固定時，距離 = 速率 × 時間，所以時間變成 ${k} 倍，距離也跟著變成 ${k} 倍。`
        );
        continue;
      }
      if (mode === 1) {
        const time = pickFromList([10, 15, 20, 30]);
        const base = pickFromList([30, 45, 60, 90]);
        questions.push(
          `時間固定：都走 ${time} 分鐘，甲的速率是 ${base} 公尺/分，乙的速率是 ${base * k} 公尺/分，乙走的距離是甲的幾倍？`
        );
        summaryAnswers.push(`${k}倍`);
        answers.push(
          `簡答：${k}倍。過程：時間固定時，距離和速率成正比。乙的速率是甲的 ${k} 倍，所以乙的距離也是甲的 ${k} 倍。`
        );
        continue;
      }
      if (mode === 2) {
        const speed = pickFromList([4, 5, 6, 8, 10]);
        questions.push(`速率固定：機器人秒速 ${speed} 公尺，若行走距離變為原來的 ${k} 倍，所需時間會變為原來的幾倍？`);
        summaryAnswers.push(`${k}倍`);
        answers.push(`簡答：${k}倍。過程：速率固定時，時間 = 距離 ÷ 速率，所以距離變成 ${k} 倍，時間也變成 ${k} 倍。`);
        continue;
      }
      const time = pickFromList([1, 2, 3, 4]);
      const slow = pickFromList([1.5, 2, 2.5, 3]);
      questions.push(
        `時間固定：爸爸和爺爺都散步 ${time} 小時，爸爸速率是 ${slow * k} 公里/時，爺爺速率是 ${slow} 公里/時，爸爸散步的距離是爺爺的幾倍？`
      );
      summaryAnswers.push(`${k}倍`);
      answers.push(
        `簡答：${k}倍。過程：兩人散步時間相同，距離比就等於速率比。爸爸速率是爺爺的 ${k} 倍，所以距離也是 ${k} 倍。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE618MixedSet(banks, count) {
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

  function buildE618BasicThreeSet(count) {
    return buildE618MixedSet([buildE618RateBasicSet, buildE618DistanceBasicSet, buildE618TimeBasicSet], count);
  }

  function buildE618ConvertThreeSet(count) {
    return buildE618MixedSet(
      [buildE618LengthUnitConvertSet, buildE618TimeUnitConvertSet, buildE618DoubleUnitConvertSet],
      count
    );
  }

  function buildE618CompareOneSet(count) {
    return buildE618MixedSet([buildE618CompareSpeedSet], count);
  }

  function buildE618ProportionOneSet(count) {
    return buildE618MixedSet([buildE618ProportionalSet], count);
  }

  function e619FormatNumber(value, digits = 2) {
    return trimDecimalString(Number(value.toFixed(digits)).toString());
  }

  function e619Gcd(a, b) {
    let x = Math.abs(Math.round(a));
    let y = Math.abs(Math.round(b));
    while (y !== 0) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x || 1;
  }

  function e619SimplifyRatio(a, b) {
    const g = e619Gcd(a, b);
    return { left: a / g, right: b / g };
  }

  const E619_LENGTH_TO_CM = {
    公分: 1,
    公尺: 100,
    公里: 100000,
  };

  function e619ScaleText(num, den = 1) {
    if (den === 1) return `${num}倍`;
    return `${num}/${den}倍`;
  }

  function e619RatioText(a, b) {
    return `${a}:${b}`;
  }

  function e619ToCm(value, unit) {
    return value * E619_LENGTH_TO_CM[unit];
  }

  function buildE619ScaleFactorSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const scale = pickFromList([2, 3, 4, 5]);
        const length = pickFromList([3, 4, 5, 6, 8]);
        const width = pickFromList([2, 3, 4, 5, 6]);
        questions.push(
          `原圖長 ${length}、寬 ${width}，另一圖長 ${length * scale}、寬 ${width * scale}，另一圖是原圖的幾倍放大圖？`
        );
        summaryAnswers.push(`${scale}倍`);
        answers.push(
          `簡答：${scale}倍。過程：對應邊長的倍數都是 ${length * scale} ÷ ${length} = ${scale}，所以這是 ${scale} 倍放大圖。`
        );
        continue;
      }
      if (mode === 1) {
        const den = pickFromList([2, 3, 4, 5]);
        const grid = pickFromList([4, 6, 8, 10, 12]);
        questions.push(`甲圖在方格紙上橫向占 ${grid} 格，乙圖占 ${grid / den} 格，乙圖是甲圖的幾分之幾倍縮圖？`);
        summaryAnswers.push(`${e619ScaleText(1, den)}`);
        answers.push(
          `簡答：${e619ScaleText(1, den)}。過程：乙圖與甲圖的對應長度比是 ${grid / den}:${grid} = 1:${den}，所以乙圖是甲圖的 ${e619ScaleText(1, den)} 縮圖。`
        );
        continue;
      }
      if (mode === 2) {
        const scale = pickFromList([2, 3, 4]);
        const a = pickFromList([3, 4, 5, 6]);
        const b = pickFromList([4, 5, 6, 8]);
        const c = pickFromList([5, 6, 7, 9]);
        questions.push(
          `三角形三邊長為 ${a}、${b}、${c}，另一三角形對應邊為 ${a * scale}、${b * scale}、${c * scale}，後者是前者的幾倍放大圖？`
        );
        summaryAnswers.push(`${scale}倍`);
        answers.push(
          `簡答：${scale}倍。過程：任一組對應邊比都相同，例如 ${a * scale} ÷ ${a} = ${scale}，所以後者是前者的 ${scale} 倍放大圖。`
        );
        continue;
      }
      const scale = pickFromList([2, 3, 4, 5]);
      const radius = pickFromList([2, 3, 4, 5, 6]);
      questions.push(`半徑 ${radius} 公分的圓放大成半徑 ${radius * scale} 公分的圓，放大倍數是多少？`);
      summaryAnswers.push(`${scale}倍`);
      answers.push(`簡答：${scale}倍。過程：半徑是對應長度，所以放大倍數 = ${radius * scale} ÷ ${radius} = ${scale}。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE619CorrespondingSideSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const scale = pickFromList([2, 3, 4, 5]);
        const side = pickFromList([3, 4, 5, 6, 8, 10]);
        questions.push(`甲圖邊長 AB 是 ${side} 公分，乙圖是甲圖的 ${scale} 倍放大圖，對應邊 DE 幾公分？`);
        summaryAnswers.push(`${side * scale}公分`);
        answers.push(
          `簡答：${side * scale}公分。過程：放大 ${scale} 倍時，對應邊長也乘 ${scale}，所以 DE = ${side} × ${scale} = ${side * scale}。`
        );
        continue;
      }
      if (mode === 1) {
        const den = pickFromList([2, 3, 4, 5]);
        const side = pickFromList([6, 8, 9, 10, 12, 15, 18]);
        questions.push(
          `乙圖是甲圖的 ${e619ScaleText(1, den)} 縮圖，若乙圖對應邊長是 ${side} 公分，甲圖對應邊長幾公分？`
        );
        summaryAnswers.push(`${side * den}公分`);
        answers.push(
          `簡答：${side * den}公分。過程：縮成 ${e619ScaleText(1, den)} 表示乙圖長度是甲圖的 $\\frac{1}{${den}}$，所以甲圖長度 = ${side} × ${den} = ${side * den}。`
        );
        continue;
      }
      const scaleNum = pickFromList([2, 3, 4]);
      const scaleDen = pickFromList([2, 3, 4, 5]);
      if (scaleNum >= scaleDen) {
        i -= 1;
        continue;
      }
      const side = scaleDen * pickFromList([2, 3, 4, 5]);
      const mapped = (side * scaleNum) / scaleDen;
      questions.push(
        `三角形 ABC 是 DEF 的 ${e619ScaleText(scaleNum, scaleDen)} 倍縮圖，若 DEF 的對應邊長是 ${side} 公分，則 ABC 的對應邊長幾公分？`
      );
      summaryAnswers.push(`${mapped}公分`);
      answers.push(
        `簡答：${mapped}公分。過程：縮放倍數是 ${e619ScaleText(scaleNum, scaleDen)}，所以對應邊長 = ${side} × ${scaleNum}/${scaleDen} = ${mapped}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE619AnglePropertySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const shapes = ['三角形', '梯形', '平行四邊形', '五邊形'];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const angle = pickFromList([30, 45, 60, 70, 90, 110, 120, 127, 135]);
        const scale = pickFromList([2, 3, 4, 5]);
        questions.push(`圖上原來的 ${angle}° 角，在 ${scale} 倍放大圖上的對應角是多少度？`);
        summaryAnswers.push(`${angle}°`);
        answers.push(`簡答：${angle}°。過程：放大圖與縮圖只改變長度，不改變角度，所以對應角仍是 ${angle}°。`);
        continue;
      }
      if (mode === 1) {
        const angle = pickFromList([40, 55, 72, 88, 105, 127, 140]);
        const shape = pickFromList(shapes);
        const scale = pickFromList([2, 3, 4]);
        questions.push(`${shape}的一個角是 ${angle}°，把它畫成 ${scale} 倍放大圖後，對應角是多少度？`);
        summaryAnswers.push(`${angle}°`);
        answers.push(`簡答：${angle}°。過程：相似放大時，對應角相等，所以放大前後的角度不變。`);
        continue;
      }
      const scale = pickFromList([2, 3, 4, 5]);
      const segment = pickFromList([3, 4, 5, 6, 8, 10]);
      const objectName = pickFromList(['三角形的高', '長方形的對角線', '梯形的中線', '平行四邊形的一條邊']);
      questions.push(`某圖形放大 ${scale} 倍後，${objectName}由 ${segment} 公分變成多少公分？`);
      summaryAnswers.push(`${segment * scale}公分`);
      answers.push(
        `簡答：${segment * scale}公分。過程：圖內所有對應線段都按相同倍數縮放，所以 ${objectName}也乘 ${scale}，得到 ${segment * scale} 公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE619PerimeterScaleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 2;
      if (mode === 0) {
        const scale = pickFromList([2, 3, 4, 5]);
        const perimeter = pickFromList([20, 24, 30, 36, 40, 48, 60]);
        questions.push(`一個圖形放大成原圖的 ${scale} 倍，若原來周長是 ${perimeter} 公分，放大後周長是多少公分？`);
        summaryAnswers.push(`${perimeter * scale}公分`);
        answers.push(
          `簡答：${perimeter * scale}公分。過程：周長屬於長度，會隨長度倍數等倍放大，所以 ${perimeter} × ${scale} = ${perimeter * scale}。`
        );
      } else {
        const scale = pickFromList([2, 3, 4, 5]);
        const multiple = pickFromList([5, 6, 8, 10, 12]);
        const newPerimeter = scale * multiple;
        questions.push(
          `某圖形是原圖的 ${e619ScaleText(1, scale)} 縮圖，若原來周長是 ${newPerimeter} 公分，縮圖的周長是多少公分？`
        );
        summaryAnswers.push(`${multiple}公分`);
        answers.push(
          `簡答：${multiple}公分。過程：周長隨長度同比例縮小，縮成 ${e619ScaleText(1, scale)} 時，周長也除以 ${scale}，所以 ${newPerimeter} ÷ ${scale} = ${multiple}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE619AreaScaleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const scale = pickFromList([2, 3, 4, 5]);
        questions.push(`一個圖形放大成原圖的 ${scale} 倍，面積會變成原圖的幾倍？`);
        summaryAnswers.push(`${scale * scale}倍`);
        answers.push(
          `簡答：${scale * scale}倍。過程：面積會隨長度倍數的平方改變，所以面積倍數是 ${scale}^2 = ${scale * scale}。`
        );
        continue;
      }
      if (mode === 1) {
        const scale = pickFromList([2, 3, 4]);
        const area = pickFromList([5, 8, 10, 12, 15, 20]);
        const enlarged = area * scale * scale;
        questions.push(`一個圖形面積是 ${area} 平方公分，把邊長放大 ${scale} 倍後，面積變成多少平方公分？`);
        summaryAnswers.push(`${enlarged}平方公分`);
        answers.push(
          `簡答：${enlarged}平方公分。過程：面積乘上 ${scale}^2 = ${scale * scale}，所以 ${area} × ${scale * scale} = ${enlarged}。`
        );
        continue;
      }
      const den = pickFromList([2, 3, 4, 5]);
      const area = den * den * pickFromList([2, 3, 4, 5]);
      const reduced = area / (den * den);
      questions.push(
        `一個圖形縮成原圖的 ${e619ScaleText(1, den)}，若原來面積是 ${area} 平方公分，縮圖面積是多少平方公分？`
      );
      summaryAnswers.push(`${reduced}平方公分`);
      answers.push(
        `簡答：${reduced}平方公分。過程：面積要乘上縮放倍數的平方，所以縮圖面積 = ${area} × (1/${den})^2 = ${area} ÷ ${den * den} = ${reduced}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE619CurvedScaleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const den = pickFromList([2, 3, 4, 5]);
        const diameter = pickFromList([30, 60, 90, 120, 150]);
        const circumference = (diameter * E616_PI) / den;
        questions.push(`直徑 ${diameter} 公分的圓，畫成 ${e619ScaleText(1, den)} 縮圖後，圓周長大約是多少公分？`);
        summaryAnswers.push(`${e619FormatNumber(circumference)}公分`);
        answers.push(
          `簡答：${e619FormatNumber(circumference)}公分。過程：圓周長屬於長度，縮圖後也縮成 ${e619ScaleText(1, den)}，原圓周長是 ${diameter} × 3.14 = ${e619FormatNumber(diameter * E616_PI)}，再除以 ${den} 得 ${e619FormatNumber(circumference)}。`
        );
        continue;
      }
      if (mode === 1) {
        const scale = pickFromList([2, 3, 4, 5]);
        const radius = pickFromList([1, 2, 3, 4, 5, 6]);
        questions.push(`方格紙中畫半徑 ${radius} 公分的圓，放大為 ${scale} 倍圖後，半徑變成幾公分？`);
        summaryAnswers.push(`${radius * scale}公分`);
        answers.push(
          `簡答：${radius * scale}公分。過程：半徑是對應長度，放大 ${scale} 倍後，半徑也乘 ${scale}，得到 ${radius * scale} 公分。`
        );
        continue;
      }
      if (mode === 2) {
        const angle = pickFromList([45, 60, 70, 90, 120, 150, 210, 270]);
        const scale = pickFromList([2, 3, 4]);
        questions.push(`圓心角 ${angle}° 的扇形，畫成 ${scale} 倍放大圖後，對應的圓心角是多少度？`);
        summaryAnswers.push(`${angle}°`);
        answers.push(`簡答：${angle}°。過程：放大圖只改變長度，不改變角度，所以扇形的對應圓心角仍是 ${angle}°。`);
        continue;
      }
      const scale = pickFromList([2, 3, 4, 5]);
      questions.push(`甲扇形是乙扇形的 ${e619ScaleText(1, scale)} 倍縮圖，甲的弧長是乙的幾分之幾？`);
      summaryAnswers.push(`${e619ScaleText(1, scale)}`);
      answers.push(
        `簡答：${e619ScaleText(1, scale)}。過程：弧長屬於長度，縮放後會和邊長一樣按同倍數改變，所以甲的弧長是乙的 ${e619ScaleText(1, scale)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE619ScaleFromMapSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mapCm = pickFromList([4, 5, 6, 7, 8, 10, 12, 15]);
      const perCmMeters = pickFromList([10, 20, 30, 50, 100, 160, 300, 500]);
      const actualMeters = mapCm * perCmMeters;
      const actualCm = actualMeters * 100;
      const ratio = e619SimplifyRatio(mapCm, actualCm);
      questions.push(`求比例尺：實際長 ${actualMeters} 公尺，在圖上長 ${mapCm} 公分，比例尺用「比」表示是多少？`);
      summaryAnswers.push(e619RatioText(ratio.left, ratio.right));
      answers.push(
        `簡答：${e619RatioText(ratio.left, ratio.right)}。過程：先把實際長換成公分，${actualMeters} 公尺 = ${actualCm} 公分，所以比例尺 = 圖上長 : 實際長 = ${mapCm}:${actualCm} = ${e619RatioText(ratio.left, ratio.right)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE619ActualLengthSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const scales = [5000, 6000, 10000, 20000, 50000, 100000, 200000];
    for (let i = 0; i < count; i += 1) {
      const scale = pickFromList(scales);
      const mapCm = pickFromList([2.2, 3, 4.5, 5, 6.8, 8.3, 12, 13]);
      const actualCm = mapCm * scale;
      const actualMeters = actualCm / 100;
      if (actualMeters >= 1000 && actualMeters % 1000 === 0) {
        const km = actualMeters / 1000;
        questions.push(`求實際長度：在比例尺 1:${scale} 的地圖上，圖上長 ${mapCm} 公分，實際長度是多少公里？`);
        summaryAnswers.push(`${e619FormatNumber(km)}公里`);
        answers.push(
          `簡答：${e619FormatNumber(km)}公里。過程：實際長 = 圖上長 × 比例尺 = ${mapCm} × ${scale} = ${e619FormatNumber(actualCm)} 公分 = ${e619FormatNumber(actualMeters)} 公尺 = ${e619FormatNumber(km)} 公里。`
        );
      } else {
        questions.push(`求實際長度：在比例尺 1:${scale} 的地圖上，圖上長 ${mapCm} 公分，實際長度是多少公尺？`);
        summaryAnswers.push(`${e619FormatNumber(actualMeters)}公尺`);
        answers.push(
          `簡答：${e619FormatNumber(actualMeters)}公尺。過程：實際長 = 圖上長 × 比例尺 = ${mapCm} × ${scale} = ${e619FormatNumber(actualCm)} 公分 = ${e619FormatNumber(actualMeters)} 公尺。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE619MapLengthSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const scales = [20, 100, 500, 1000, 2000, 10000, 20000, 100000];
    for (let i = 0; i < count; i += 1) {
      const scale = pickFromList(scales);
      const actualUnit = i % 2 === 0 ? '公尺' : '公里';
      let actualValue;
      if (actualUnit === '公尺') {
        actualValue = pickFromList([50, 120, 150, 300, 600, 750, 1200, 2345]);
      } else {
        actualValue = pickFromList([1.2, 2.4, 3.6, 4, 7.5, 15, 23.5]);
      }
      const actualCm = e619ToCm(actualValue, actualUnit);
      const mapCm = actualCm / scale;
      questions.push(`求圖上長度：實際長 ${actualValue}${actualUnit}，在比例尺 1:${scale} 的圖上長幾公分？`);
      summaryAnswers.push(`${e619FormatNumber(mapCm)}公分`);
      answers.push(
        `簡答：${e619FormatNumber(mapCm)}公分。過程：圖上長 = 實際長 ÷ 比例尺。先把實際長換成公分，得到 ${e619FormatNumber(actualCm)} 公分，再除以 ${scale}，所以圖上長是 ${e619FormatNumber(mapCm)} 公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE619ScaleRepresentationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 2;
      if (mode === 0) {
        const barCm = pickFromList([2, 3, 4, 5]);
        const perCmMeters = pickFromList([50, 100, 200, 300, 500]);
        const totalMeters = barCm * perCmMeters;
        const ratio = e619SimplifyRatio(1, perCmMeters * 100);
        questions.push(`比例尺圖示為 0-${totalMeters}公尺（整段長 ${barCm} 公分），換成比例尺「比」是多少？`);
        summaryAnswers.push(e619RatioText(ratio.left, ratio.right));
        answers.push(
          `簡答：${e619RatioText(ratio.left, ratio.right)}。過程：先求 1 公分代表 ${perCmMeters} 公尺，也就是 ${perCmMeters * 100} 公分，所以比例尺是 1:${perCmMeters * 100}。`
        );
      } else {
        const scale = pickFromList([1000, 2000, 5000, 6000, 10000, 25000]);
        const perCmMeters = scale / 100;
        questions.push(`比例尺是 1:${scale}，畫成圖示時，圖上 1 公分代表實際幾公尺？`);
        summaryAnswers.push(`${e619FormatNumber(perCmMeters)}公尺`);
        answers.push(
          `簡答：${e619FormatNumber(perCmMeters)}公尺。過程：1:${scale} 表示圖上 1 公分代表實際 ${scale} 公分，換成公尺就是 ${scale} ÷ 100 = ${e619FormatNumber(perCmMeters)} 公尺。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE619ScaleComparisonSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const small = pickFromList([100, 200, 500, 1000, 1500, 2000]);
        const large = small * pickFromList([2, 3, 5]);
        questions.push(`詳細度比較：比例尺 1:${small} 和 1:${large} 的兩張地圖，哪一張看得較詳細、範圍較小？`);
        summaryAnswers.push(`1:${small}`);
        answers.push(
          `簡答：1:${small}。過程：比例尺分母越小，圖上同樣 1 公分代表的實際距離越短，所以看得較詳細、表示範圍也較小。`
        );
        continue;
      }
      if (mode === 1) {
        const actualMeters = pickFromList([600, 1200, 1500, 2100, 3600, 5000]);
        const scaleA = pickFromList([1000, 1500, 2000, 3000]);
        const scaleB = scaleA * pickFromList([2, 3]);
        const mapA = (actualMeters * 100) / scaleA;
        const mapB = (actualMeters * 100) / scaleB;
        questions.push(
          `同一段 ${actualMeters} 公尺的道路，在比例尺 1:${scaleA} 的圖上長多少公分？在比例尺 1:${scaleB} 的圖上又長多少公分？哪一張比較長？`
        );
        summaryAnswers.push(
          `1:${scaleA} 的圖上較長，分別是 ${e619FormatNumber(mapA)}公分、${e619FormatNumber(mapB)}公分`
        );
        answers.push(
          `簡答：1:${scaleA} 的圖上較長，分別是 ${e619FormatNumber(mapA)}公分、${e619FormatNumber(mapB)}公分。過程：圖上長 = 實際長 ÷ 比例尺。因為 ${scaleA} 比 ${scaleB} 小，所以 1:${scaleA} 會畫得較長。`
        );
        continue;
      }
      const mapCm = pickFromList([4, 5, 6, 8, 10]);
      const scaleA = pickFromList([500, 1000, 2000, 5000]);
      const scaleB = scaleA * pickFromList([2, 3, 5]);
      const actualA = (mapCm * scaleA) / 100;
      const actualB = (mapCm * scaleB) / 100;
      questions.push(
        `兩張地圖上都量到 ${mapCm} 公分，若甲圖比例尺是 1:${scaleA}，乙圖比例尺是 1:${scaleB}，哪一張代表的實際範圍較大？`
      );
      summaryAnswers.push(`乙圖`);
      answers.push(
        `簡答：乙圖。過程：圖上長相同時，比例尺分母越大，代表的實際距離越長。甲圖是 ${e619FormatNumber(actualA)} 公尺，乙圖是 ${e619FormatNumber(actualB)} 公尺，所以乙圖代表的實際範圍較大。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE619MixedSet(banks, count) {
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

  function buildE619ScaleCoreThreeSet(count) {
    return buildE619MixedSet(
      [buildE619ScaleFactorSet, buildE619CorrespondingSideSet, buildE619AnglePropertySet],
      count
    );
  }

  function buildE619PerimeterAreaCurveThreeSet(count) {
    return buildE619MixedSet([buildE619PerimeterScaleSet, buildE619AreaScaleSet, buildE619CurvedScaleSet], count);
  }

  function buildE619ScaleBasicThreeSet(count) {
    return buildE619MixedSet([buildE619ScaleFromMapSet, buildE619ActualLengthSet, buildE619MapLengthSet], count);
  }

  function buildE619ScaleAppliedTwoSet(count) {
    return buildE619MixedSet([buildE619ScaleRepresentationSet, buildE619ScaleComparisonSet], count);
  }


  function buildE619AreaRatioToScaleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // n² times area → n times length
    const cases = [
      { n: 2, nSq: 4  },
      { n: 3, nSq: 9  },
      { n: 4, nSq: 16 },
      { n: 5, nSq: 25 },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      const mode = i % 3;
      if (mode === 0) {
        questions.push(`一個圖形的面積放大為原來的 $${c.nSq}$ 倍，邊長會變成原來的幾倍？`);
        summaryAnswers.push(`${c.n}倍`);
        answers.push(`簡答：${c.n}倍。過程：面積倍數是邊長倍數的平方，$\\sqrt{${c.nSq}}=${c.n}$，所以邊長變成 ${c.n} 倍。`);
      } else if (mode === 1) {
        const side = pickFromList([3, 4, 5, 6, 8, 10]);
        questions.push(`一個正方形邊長 ${side} 公分，把面積擴大為原來的 $${c.nSq}$ 倍，新的邊長是多少公分？`);
        summaryAnswers.push(`${side * c.n}公分`);
        answers.push(`簡答：${side * c.n}公分。過程：面積放大 ${c.nSq} 倍 → 邊長放大 $\\sqrt{${c.nSq}}=${c.n}$ 倍，新邊長 = ${side} × ${c.n} = ${side * c.n}。`);
      } else {
        const s1 = pickFromList([3, 4, 5, 6, 8, 10]);
        const s2 = s1 * c.n;
        questions.push(`甲正方形邊長 ${s1} 公分，乙正方形邊長 ${s2} 公分，乙的面積是甲的幾倍？`);
        summaryAnswers.push(`${c.nSq}倍`);
        answers.push(`簡答：${c.nSq}倍。過程：邊長比 ${s2}:${s1}=${c.n}:1，面積比 = 邊長比的平方 = ${c.n}²=${c.nSq}，所以乙的面積是甲的 ${c.nSq} 倍。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE619MapAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // actual_area_m2 = mapArea_cm2 × scale² / 10000
    const cases = [
      { scale: 100,  mapArea: 5,  actual: 5   },
      { scale: 200,  mapArea: 3,  actual: 12  },
      { scale: 500,  mapArea: 4,  actual: 100 },
      { scale: 1000, mapArea: 2,  actual: 200 },
      { scale: 2000, mapArea: 3,  actual: 1200},
      { scale: 200,  mapArea: 5,  actual: 20  },
      { scale: 500,  mapArea: 2,  actual: 50  },
      { scale: 1000, mapArea: 5,  actual: 500 },
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      const totalCmSq = c.mapArea * c.scale * c.scale;
      if (i % 2 === 0) {
        questions.push(`比例尺 1:${c.scale} 的地圖上，一塊地的面積是 ${c.mapArea} 平方公分，實際面積是多少平方公尺？`);
        summaryAnswers.push(`${c.actual}平方公尺`);
        answers.push(`簡答：${c.actual}平方公尺。過程：實際面積 = 圖上面積 × 比例尺² = ${c.mapArea} × ${c.scale}² = ${totalCmSq} 平方公分 = ${c.actual} 平方公尺。`);
      } else {
        questions.push(`比例尺 1:${c.scale} 的地圖上，實際 ${c.actual} 平方公尺的土地在地圖上面積是多少平方公分？`);
        summaryAnswers.push(`${c.mapArea}平方公分`);
        answers.push(`簡答：${c.mapArea}平方公分。過程：${c.actual} 平方公尺 = ${c.actual * 10000} 平方公分，圖上面積 = ${c.actual * 10000} ÷ ${c.scale}² = ${c.actual * 10000} ÷ ${c.scale * c.scale} = ${c.mapArea}。`);
      }
    }
    return { questions, summaryAnswers, answers };
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

  function ratioText(values) {
    return values.join(':');
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  function e621FractionToDecimalText(frac) {
    const value = makeFraction(frac.num, frac.den);
    return trimDecimalString((value.num / value.den).toFixed(6));
  }

  function e621DecimalTextToFraction(decimalText) {
    const source = String(decimalText || '').trim();
    if (!source.includes('.')) return makeFraction(Number(source || 0), 1);
    const negative = source.startsWith('-');
    const body = negative ? source.slice(1) : source;
    const [intPartText, decimalPartText] = body.split('.');
    const denominator = 10 ** decimalPartText.length;
    const numerator = Number(intPartText || 0) * denominator + Number(decimalPartText || 0);
    return makeFraction(negative ? -numerator : numerator, denominator);
  }

  function e621PickTerminatingFraction(options = {}) {
    const {
      allowZero = false,
      minWhole = 0,
      maxWhole = 3,
      forceFractionPart = false,
      denominatorChoices = [2, 4, 5, 8, 10, 20, 25],
    } = options;

    const denominator = pickFromList(denominatorChoices);
    let whole = randInt(minWhole, maxWhole);
    let numerator = randInt(0, denominator - 1);
    if (forceFractionPart) {
      while (numerator === 0) numerator = randInt(1, denominator - 1);
    }
    if (!allowZero) {
      while (whole === 0 && numerator === 0) {
        whole = randInt(minWhole, maxWhole);
        numerator = randInt(0, denominator - 1);
      }
    }
    return makeFraction(whole * denominator + numerator, denominator);
  }

  function buildE621DecimalToFractionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const value = e621PickTerminatingFraction({ minWhole: 0, maxWhole: 2, forceFractionPart: true });
      const decimalText = e621FractionToDecimalText(value);
      const rawFraction = e621DecimalTextToFraction(decimalText);
      questions.push(`將 $${decimalText}$ 化成最簡分數。`);
      summaryAnswers.push(`$${fractionToLatex(value)}$`);
      answers.push(
        `先把 $${decimalText}$ 寫成分數：$${fractionToLatex(rawFraction)}$。再約分，得到 $${fractionToLatex(value)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE621FractionToDecimalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const value = e621PickTerminatingFraction({ minWhole: 0, maxWhole: 2, forceFractionPart: true });
      const decimalText = e621FractionToDecimalText(value);
      questions.push(`將 $${fractionToLatex(value, true)}$ 化成小數。`);
      summaryAnswers.push(`$${decimalText}$`);
      answers.push(`把分數換成小數後，$${fractionToLatex(value, true)}=${decimalText}$。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE621DecimalToMixedFractionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const value = e621PickTerminatingFraction({ minWhole: 1, maxWhole: 4, forceFractionPart: true });
      const decimalText = e621FractionToDecimalText(value);
      const rawFraction = e621DecimalTextToFraction(decimalText);
      questions.push(`將 $${decimalText}$ 化成最簡帶分數。`);
      summaryAnswers.push(`$${fractionToLatex(value, true)}$`);
      answers.push(
        `先寫成分數：$${decimalText}=${fractionToLatex(rawFraction)}$。再約分並化成帶分數，得到 $${fractionToLatex(value, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE621FriendlyAddSubSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const denominator = pickFromList([2, 4, 5, 8, 10]);
      const fracTerm = makeFraction(randInt(1, denominator - 1), denominator);
      const decTerm = e621PickTerminatingFraction({
        minWhole: 0,
        maxWhole: 3,
        forceFractionPart: true,
        denominatorChoices: [4, 5, 8, 10],
      });
      const useAdd = randInt(0, 1) === 1;
      const result = useAdd ? addFraction(decTerm, fracTerm) : subFraction(decTerm, fracTerm);
      const decimalText = e621FractionToDecimalText(decTerm);
      questions.push(`計算：$${decimalText}${useAdd ? '+' : '-'}${fractionToLatex(fracTerm)}$。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `先把小數化成分數：$${decimalText}=${fractionToLatex(decTerm)}$。所以原式 $=${fractionToLatex(decTerm)}${useAdd ? '+' : '-'}${fractionToLatex(fracTerm)}=${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE621FriendlyMulDivSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const left = e621PickTerminatingFraction({
        minWhole: 0,
        maxWhole: 3,
        forceFractionPart: true,
        denominatorChoices: [4, 5, 8, 10],
      });
      const right = makeFraction(randInt(1, 5), pickFromList([2, 4, 5, 8, 10]));
      const useMultiply = randInt(0, 1) === 1;
      const result = useMultiply ? mulFraction(left, right) : divFraction(left, right);
      const leftText = e621FractionToDecimalText(left);
      questions.push(`計算：$${leftText}${useMultiply ? '\\times' : '\\div'}${fractionToLatex(right)}$。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `先把小數化成分數：$${leftText}=${fractionToLatex(left)}$。原式 $=${fractionToLatex(left)}${useMultiply ? '\\times' : '\\div'}${fractionToLatex(right)}=${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE621BracketMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const left = e621PickTerminatingFraction({
        minWhole: 1,
        maxWhole: 4,
        forceFractionPart: true,
        denominatorChoices: [4, 5, 8, 10],
      });
      const innerA = e621PickTerminatingFraction({
        minWhole: 0,
        maxWhole: 2,
        forceFractionPart: true,
        denominatorChoices: [4, 5, 8, 10],
      });
      const innerB = makeFraction(randInt(1, 4), pickFromList([2, 4, 5, 8, 10]));
      const op = randInt(0, 1) === 1 ? '+' : '-';
      const inner = op === '+' ? addFraction(innerA, innerB) : subFraction(innerA, innerB);
      const result = addFraction(left, inner);
      const leftText = e621FractionToDecimalText(left);
      const innerAText = e621FractionToDecimalText(innerA);
      questions.push(`計算：$${leftText}+\\left(${innerAText}${op}${fractionToLatex(innerB)}\\right)$。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `先算括號：$${innerAText}=${fractionToLatex(innerA)}$，所以括號內 $=${fractionToLatex(innerA)}${op}${fractionToLatex(innerB)}=${fractionToLatex(inner, true)}$。再算原式：$${leftText}+${fractionToLatex(inner, true)}=${fractionToLatex(left)}+${fractionToLatex(inner, true)}=${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE621CrossOperationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = e621PickTerminatingFraction({
        minWhole: 1,
        maxWhole: 3,
        forceFractionPart: true,
        denominatorChoices: [4, 5, 10],
      });
      const b = makeFraction(randInt(1, 4), pickFromList([2, 4, 5]));
      const c = randInt(2, 5);
      const d = e621PickTerminatingFraction({
        minWhole: 0,
        maxWhole: 2,
        forceFractionPart: true,
        denominatorChoices: [4, 5, 10],
      });
      const product = mulFraction(b, makeFraction(c, 1));
      const result = subFraction(addFraction(a, product), d);
      const aText = e621FractionToDecimalText(a);
      const dText = e621FractionToDecimalText(d);
      questions.push(`計算：$${aText}+${fractionToLatex(b)}\\times${c}-${dText}$。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `先算乘法：$${fractionToLatex(b)}\\times${c}=${fractionToLatex(product, true)}$。再把小數化成分數：$${aText}=${fractionToLatex(a)}$、$${dText}=${fractionToLatex(d)}$。所以原式 $=${fractionToLatex(a)}+${fractionToLatex(product, true)}-${fractionToLatex(d)}=${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE621DistributiveShortcutSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const common = e621PickTerminatingFraction({
        minWhole: 0,
        maxWhole: 3,
        forceFractionPart: true,
        denominatorChoices: [4, 5, 10],
      });
      const leftA = e621PickTerminatingFraction({
        minWhole: 0,
        maxWhole: 2,
        forceFractionPart: true,
        denominatorChoices: [4, 5, 10],
      });
      const leftB = subFraction(makeFraction(randInt(1, 4), 1), leftA);
      const result = mulFraction(addFraction(leftA, leftB), common);
      const commonText = e621FractionToDecimalText(common);
      const leftAText = e621FractionToDecimalText(leftA);
      const leftBText = e621FractionToDecimalText(leftB);
      questions.push(`利用分配律計算：$${leftAText}\\times${commonText}+${leftBText}\\times${commonText}$。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `提出公因數 $${commonText}$：$\\left(${leftAText}+${leftBText}\\right)\\times${commonText}$。因為 $${leftAText}+${leftBText}=${fractionToLatex(addFraction(leftA, leftB), true)}$，所以原式 $=${fractionToLatex(addFraction(leftA, leftB), true)}\\times${commonText}=${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE621AssociativeShortcutSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const targetInteger = randInt(2, 8);
      const left = e621PickTerminatingFraction({
        minWhole: 0,
        maxWhole: targetInteger - 1,
        forceFractionPart: true,
        denominatorChoices: [4, 5, 8, 10],
      });
      const complement = subFraction(makeFraction(targetInteger, 1), left);
      const middle = randomMixedFraction(1, 4, [2, 4, 5, 8, 10], false);
      const result = addFraction(addFraction(left, middle), complement);
      const leftText = e621FractionToDecimalText(left);
      const complementText = e621FractionToDecimalText(complement);
      questions.push(`利用結合律計算：$${leftText}+${fractionToLatex(middle, true)}+${complementText}$。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `先把前後兩項合併：$${leftText}+${complementText}=${targetInteger}$。所以原式 $=${targetInteger}+${fractionToLatex(middle, true)}=${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE621RectangleReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const length = e621PickTerminatingFraction({
        minWhole: 1,
        maxWhole: 5,
        forceFractionPart: true,
        denominatorChoices: [2, 4, 5, 10],
      });
      const width = e621PickTerminatingFraction({
        minWhole: 1,
        maxWhole: 4,
        forceFractionPart: true,
        denominatorChoices: [2, 4, 5, 10],
      });
      const area = mulFraction(length, width);
      const askWidth = randInt(0, 1) === 1;
      const askValue = askWidth ? width : length;
      const knownValue = askWidth ? length : width;
      questions.push(
        `長方形面積是 $${e621FractionToDecimalText(area)}$ 平方公分，${askWidth ? '長' : '寬'}是 $${e621FractionToDecimalText(knownValue)}$ 公分，求${askWidth ? '寬' : '長'}。`
      );
      summaryAnswers.push(`$${e621FractionToDecimalText(askValue)}$ 公分`);
      answers.push(
        `用面積 $\\div$ 已知邊長：$${e621FractionToDecimalText(area)}\\div${e621FractionToDecimalText(knownValue)}=${fractionToLatex(area)}\\div${fractionToLatex(knownValue)}=${fractionToLatex(askValue, true)}$，所以答案是 $${e621FractionToDecimalText(askValue)}$ 公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE621RemainingQuantitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const total = e621PickTerminatingFraction({
        minWhole: 2,
        maxWhole: 9,
        forceFractionPart: true,
        denominatorChoices: [2, 4, 5, 10],
      });
      const usedRate = pickFromList([
        makeFraction(1, 4),
        makeFraction(1, 5),
        makeFraction(2, 5),
        makeFraction(1, 2),
        makeFraction(3, 4),
      ]);
      const remain = mulFraction(total, subFraction(makeFraction(1, 1), usedRate));
      questions.push(
        `一桶果汁原有 $${e621FractionToDecimalText(total)}$ 公升，用掉全部的 $${fractionToLatex(usedRate)}$ 後，還剩多少公升？`
      );
      summaryAnswers.push(`$${e621FractionToDecimalText(remain)}$ 公升`);
      answers.push(
        `先求剩下的比率：$1-${fractionToLatex(usedRate)}=${fractionToLatex(subFraction(makeFraction(1, 1), usedRate))}$。所以剩下 $${e621FractionToDecimalText(total)}\\times${fractionToLatex(subFraction(makeFraction(1, 1), usedRate))}=${fractionToLatex(remain, true)}$，也就是 $${e621FractionToDecimalText(remain)}$ 公升。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE621UnitAmountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const each = e621PickTerminatingFraction({
        minWhole: 0,
        maxWhole: 2,
        forceFractionPart: true,
        denominatorChoices: [2, 4, 5, 10],
      });
      const pieceCount = randInt(3, 12);
      const total = mulFraction(each, makeFraction(pieceCount, 1));
      questions.push(
        `有 $${e621FractionToDecimalText(total)}$ 公升果汁，每杯裝 $${e621FractionToDecimalText(each)}$ 公升，可以裝滿幾杯？`
      );
      summaryAnswers.push(`$${pieceCount}$ 杯`);
      answers.push(
        `用總量除以每杯容量：$${e621FractionToDecimalText(total)}\\div${e621FractionToDecimalText(each)}=${fractionToLatex(total)}\\div${fractionToLatex(each)}=${pieceCount}$，所以可以裝滿 $${pieceCount}$ 杯。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE621MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](4);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      summaryAnswers.push(
        Array.isArray(generated.summaryAnswers) ? generated.summaryAnswers[itemIndex] : generated.answers[itemIndex]
      );
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE621ConversionMixedSet(count) {
    return buildE621MixedSet(
      [buildE621DecimalToFractionSet, buildE621FractionToDecimalSet, buildE621DecimalToMixedFractionSet],
      count
    );
  }

  function buildE621MixedCalcSet(count) {
    return buildE621MixedSet(
      [buildE621FriendlyAddSubSet, buildE621FriendlyMulDivSet, buildE621BracketMixedSet, buildE621CrossOperationSet],
      count
    );
  }

  function buildE621ShortcutMixedSet(count) {
    return buildE621MixedSet([buildE621DistributiveShortcutSet, buildE621AssociativeShortcutSet], count);
  }

  function buildE621ApplicationMixedSet(count) {
    return buildE621MixedSet(
      [buildE621RectangleReverseSet, buildE621RemainingQuantitySet, buildE621UnitAmountSet],
      count
    );
  }

  function e622FormatNumber(value) {
    return trimDecimalString(String(Number(value)));
  }

  function buildE622RateBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modes = [
      {
        speedUnit: '公尺/秒',
        distanceUnit: '公尺',
        timeUnit: '秒',
        speeds: [6, 8, 10, 12, 15, 18],
        times: [5, 8, 10, 12, 15, 20],
      },
      {
        speedUnit: '公尺/分',
        distanceUnit: '公尺',
        timeUnit: '分',
        speeds: [120, 150, 180, 200, 240, 300],
        times: [3, 4, 5, 6, 8, 10],
      },
      {
        speedUnit: '公里/時',
        distanceUnit: '公里',
        timeUnit: '小時',
        speeds: [40, 48, 50, 60, 72, 80],
        times: [1.5, 2, 2.5, 3, 3.5, 4],
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      const speed = pickFromList(mode.speeds);
      const time = pickFromList(mode.times);
      const distance = speed * time;
      questions.push(
        `求速率：某人移動 $${e622FormatNumber(distance)}$ ${mode.distanceUnit}，共花 $${e622FormatNumber(time)}$ ${mode.timeUnit}，速率是多少${mode.speedUnit}？`
      );
      summaryAnswers.push(`$${e622FormatNumber(speed)}$ ${mode.speedUnit}`);
      answers.push(
        `用速率公式：速率 $=\\frac{距離}{時間}=\\frac{${e622FormatNumber(distance)}}{${e622FormatNumber(time)}}=${e622FormatNumber(speed)}$，所以速率是 $${e622FormatNumber(speed)}$ ${mode.speedUnit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622DistanceBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modes = [
      {
        speedUnit: '公尺/秒',
        distanceUnit: '公尺',
        timeUnit: '秒',
        speeds: [6, 8, 10, 12, 15, 18],
        times: [5, 8, 10, 12, 15, 20],
      },
      {
        speedUnit: '公尺/分',
        distanceUnit: '公尺',
        timeUnit: '分',
        speeds: [120, 150, 180, 200, 240, 300],
        times: [3, 4, 5, 6, 8, 10],
      },
      {
        speedUnit: '公里/時',
        distanceUnit: '公里',
        timeUnit: '小時',
        speeds: [40, 48, 50, 60, 72, 80],
        times: [1.5, 2, 2.5, 3, 3.5, 4],
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      const speed = pickFromList(mode.speeds);
      const time = pickFromList(mode.times);
      const distance = speed * time;
      questions.push(
        `求距離：速率是 $${e622FormatNumber(speed)}$ ${mode.speedUnit}，移動了 $${e622FormatNumber(time)}$ ${mode.timeUnit}，共走多少 ${mode.distanceUnit}？`
      );
      summaryAnswers.push(`$${e622FormatNumber(distance)}$ ${mode.distanceUnit}`);
      answers.push(
        `用距離公式：距離 $=速率\\times 時間=${e622FormatNumber(speed)}\\times${e622FormatNumber(time)}=${e622FormatNumber(distance)}$，所以共走 $${e622FormatNumber(distance)}$ ${mode.distanceUnit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622TimeBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modes = [
      {
        speedUnit: '公尺/秒',
        distanceUnit: '公尺',
        timeUnit: '秒',
        speeds: [6, 8, 10, 12, 15],
        times: [5, 8, 10, 12, 15],
      },
      {
        speedUnit: '公尺/分',
        distanceUnit: '公尺',
        timeUnit: '分',
        speeds: [120, 150, 180, 200, 240],
        times: [3, 4, 5, 6, 8],
      },
      {
        speedUnit: '公里/時',
        distanceUnit: '公里',
        timeUnit: '小時',
        speeds: [40, 48, 50, 60, 72],
        times: [1.5, 2, 2.5, 3, 3.5],
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      const speed = pickFromList(mode.speeds);
      const time = pickFromList(mode.times);
      const distance = speed * time;
      questions.push(
        `求時間：速率是 $${e622FormatNumber(speed)}$ ${mode.speedUnit}，共移動 $${e622FormatNumber(distance)}$ ${mode.distanceUnit}，需要多少${mode.timeUnit}？`
      );
      summaryAnswers.push(`$${e622FormatNumber(time)}$ ${mode.timeUnit}`);
      answers.push(
        `用時間公式：時間 $=\\frac{距離}{速率}=\\frac{${e622FormatNumber(distance)}}{${e622FormatNumber(speed)}}=${e622FormatNumber(time)}$，所以需要 $${e622FormatNumber(time)}$ ${mode.timeUnit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622UnitConvertSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const variants = [
      {
        make() {
          const kmh = pickFromList([36, 54, 72, 90, 108, 144, 180, 216]);
          const mps = kmh / 3.6;
          return {
            q: `把時速 $${kmh}$ 公里換成秒速。`,
            s: `$${e622FormatNumber(mps)}$ 公尺/秒`,
            a: `因為 $1$ 公里 $=1000$ 公尺，$1$ 小時 $=3600$ 秒，所以 $${kmh}$ 公里/時 $=${kmh}\\times\\frac{1000}{3600}=${e622FormatNumber(mps)}$ 公尺/秒。`,
          };
        },
      },
      {
        make() {
          const kmh = pickFromList([18, 24, 30, 36, 48, 60, 72]);
          const mpm = (kmh * 1000) / 60;
          return {
            q: `把時速 $${kmh}$ 公里換成分速。`,
            s: `$${e622FormatNumber(mpm)}$ 公尺/分`,
            a: `因為 $1$ 公里 $=1000$ 公尺，$1$ 小時 $=60$ 分，所以 $${kmh}$ 公里/時 $=${kmh}\\times\\frac{1000}{60}=${e622FormatNumber(mpm)}$ 公尺/分。`,
          };
        },
      },
      {
        make() {
          const mpm = pickFromList([180, 240, 300, 360, 420, 600, 900, 1200]);
          const kmh = (mpm * 60) / 1000;
          return {
            q: `把分速 $${mpm}$ 公尺換成時速。`,
            s: `$${e622FormatNumber(kmh)}$ 公里/時`,
            a: `先把每分鐘換成每小時：$${mpm}\\times60=${mpm * 60}$ 公尺/時，再除以 $1000$ 化成公里，所以是 $${e622FormatNumber(kmh)}$ 公里/時。`,
          };
        },
      },
      {
        make() {
          const mps = pickFromList([5, 6, 8, 10, 12, 15, 20, 25]);
          const kmh = mps * 3.6;
          return {
            q: `把秒速 $${mps}$ 公尺換成時速。`,
            s: `$${e622FormatNumber(kmh)}$ 公里/時`,
            a: `因為 $1$ 秒 $=\\frac{1}{3600}$ 小時，$1$ 公尺 $=\\frac{1}{1000}$ 公里，所以秒速換時速要乘 $3.6$，得到 $${e622FormatNumber(kmh)}$ 公里/時。`,
          };
        },
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const built = variants[i % variants.length].make();
      questions.push(built.q);
      summaryAnswers.push(built.s);
      answers.push(built.a);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622CompareSpeedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const variants = [
      {
        leftName: '甲',
        leftValue: 36,
        leftUnit: '公尺/分',
        rightName: '乙',
        rightValue: 0.7,
        rightUnit: '公尺/秒',
        convert() {
          return { left: this.leftValue / 60, right: this.rightValue, unit: '公尺/秒' };
        },
      },
      {
        leftName: '美洲豹',
        leftValue: 1.3,
        leftUnit: '公里/分',
        rightName: '花豹',
        rightValue: 57,
        rightUnit: '公里/時',
        convert() {
          return { left: this.leftValue, right: this.rightValue / 60, unit: '公里/分' };
        },
      },
      {
        leftName: '普悠瑪',
        leftValue: 132,
        leftUnit: '公里/時',
        rightName: '太魯閣',
        rightValue: 2000,
        rightUnit: '公尺/分',
        convert() {
          return { left: (this.leftValue * 1000) / 60, right: this.rightValue, unit: '公尺/分' };
        },
      },
      {
        leftName: '爸爸',
        leftValue: 3.6,
        leftUnit: '公里/時',
        rightName: '叔叔',
        rightValue: 0.05,
        rightUnit: '公里/分',
        convert() {
          return { left: this.leftValue / 60, right: this.rightValue, unit: '公里/分' };
        },
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = variants[i % variants.length];
      const built = item.convert();
      const winner = built.left > built.right ? item.leftName : item.rightName;
      questions.push(
        `${item.leftName}的速度是 $${e622FormatNumber(item.leftValue)}$ ${item.leftUnit}，${item.rightName}的速度是 $${e622FormatNumber(item.rightValue)}$ ${item.rightUnit}，誰比較快？`
      );
      summaryAnswers.push(`${winner}`);
      answers.push(
        `先換成相同單位比較。${item.leftName} 是 $${e622FormatNumber(built.left)}$ ${built.unit}，${item.rightName} 是 $${e622FormatNumber(built.right)}$ ${built.unit}。因為 $${e622FormatNumber(built.left)}${built.left > built.right ? '>' : '<'}${e622FormatNumber(built.right)}$，所以較快的是 ${winner}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622AverageTwoStageSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const cases = [
        { speed1: 120, time1: 10, speed2: 180, time2: 5 },
        { speed1: 150, time1: 8, speed2: 90, time2: 12 },
        { speed1: 160, time1: 6, speed2: 100, time2: 9 },
        { speed1: 140, time1: 10, speed2: 80, time2: 15 },
        { speed1: 200, time1: 4, speed2: 120, time2: 6 },
      ];
      const { speed1, time1, speed2, time2 } = cases[(i + randInt(0, cases.length - 1)) % cases.length];
      const distance1 = speed1 * time1;
      const distance2 = speed2 * time2;
      const avg = (distance1 + distance2) / (time1 + time2);
      questions.push(
        `某人先以 $${speed1}$ 公尺/分走了 $${time1}$ 分鐘，再以 $${speed2}$ 公尺/分走了 $${time2}$ 分鐘，全程平均速率是多少公尺/分？`
      );
      summaryAnswers.push(`$${e622FormatNumber(avg)}$ 公尺/分`);
      answers.push(
        `平均速率不是把速率直接平均，而是用總距離除以總時間。總距離 $=${distance1}+${distance2}=${distance1 + distance2}$ 公尺，總時間 $=${time1}+${time2}=${time1 + time2}$ 分，所以平均速率 $=\\frac{${distance1 + distance2}}{${time1 + time2}}=${e622FormatNumber(avg)}$ 公尺/分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622AverageRoundTripSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const pairs = [
      { up: 2, down: 3, unit: '公里/時', distance: 6, avg: 2.4, scene: '上山下山' },
      { up: 4, down: 6, unit: '公尺/秒', distance: 12, avg: 4.8, scene: '折返跑' },
      { up: 60, down: 84, unit: '公尺/分', distance: 2800, avg: 70, scene: '來回公園' },
      { up: 3, down: 6, unit: '公里/時', distance: 9, avg: 4, scene: '原路來回' },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = pairs[i % pairs.length];
      const totalTime = item.distance / item.up + item.distance / item.down;
      const totalDistance = item.distance * 2;
      const avgText = e622FormatNumber(item.avg);
      questions.push(
        `${item.scene}：單程 $${item.distance}$ ${item.unit.includes('公里') ? '公里' : '公尺'}，去程速率 $${item.up}$ ${item.unit}，回程速率 $${item.down}$ ${item.unit}，來回平均速率是多少${item.unit}？`
      );
      summaryAnswers.push(`$${avgText}$ ${item.unit}`);
      answers.push(
        `先算總距離與總時間。總距離 $=2\\times${item.distance}=${totalDistance}$ ${item.unit.includes('公里') ? '公里' : '公尺'}，總時間 $=\\frac{${item.distance}}{${item.up}}+\\frac{${item.distance}}{${item.down}}=${e622FormatNumber(totalTime)}$。所以平均速率 $=\\frac{${totalDistance}}{${e622FormatNumber(totalTime)}}=${avgText}$ ${item.unit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622AverageSegmentKnownSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const cases = [
        { d1: 600, t1: 4, d2: 900, t2: 5, d3: 300, t3: 3 },
        { d1: 800, t1: 4, d2: 600, t2: 3, d3: 400, t3: 3 },
        { d1: 900, t1: 6, d2: 600, t2: 3, d3: 500, t3: 1 },
        { d1: 1200, t1: 6, d2: 900, t2: 4, d3: 600, t3: 5 },
        { d1: 1500, t1: 10, d2: 600, t2: 3, d3: 900, t3: 2 },
      ];
      const { d1, t1, d2, t2, d3, t3 } = cases[(i + randInt(0, cases.length - 1)) % cases.length];
      const totalDistance = d1 + d2 + d3;
      const totalTime = t1 + t2 + t3;
      const avg = totalDistance / totalTime;
      questions.push(
        `某人分三段移動：第一段 $${d1}$ 公尺花 $${t1}$ 分鐘，第二段 $${d2}$ 公尺花 $${t2}$ 分鐘，第三段 $${d3}$ 公尺花 $${t3}$ 分鐘，全程平均速率是多少公尺/分？`
      );
      summaryAnswers.push(`$${e622FormatNumber(avg)}$ 公尺/分`);
      answers.push(
        `總距離 $=${d1}+${d2}+${d3}=${totalDistance}$ 公尺，總時間 $=${t1}+${t2}+${t3}=${totalTime}$ 分，所以平均速率 $=\\frac{${totalDistance}}{${totalTime}}=${e622FormatNumber(avg)}$ 公尺/分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622OppositeMeetTimeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const speedA = pickFromList([60, 65, 70, 75, 80, 90]);
      const speedB = pickFromList([40, 45, 50, 55, 60, 70]);
      const time = pickFromList([6, 8, 10, 12, 14]);
      const distance = (speedA + speedB) * time;
      questions.push(
        `甲、乙兩人相向而行，甲速率 $${speedA}$ 公尺/分，乙速率 $${speedB}$ 公尺/分，兩地相距 $${distance}$ 公尺，幾分鐘後相遇？`
      );
      summaryAnswers.push(`$${time}$ 分鐘後`);
      answers.push(
        `相向而行用速度和。依題意：時間 $=\\frac{距離}{速度和}=\\frac{${distance}}{${speedA}+${speedB}}=${time}$，所以 $${time}$ 分鐘後相遇。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622OppositeDistanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const speedA = pickFromList([70, 80, 90, 100, 110]);
      const speedB = pickFromList([60, 70, 80, 90]);
      const time = pickFromList([3, 4, 5, 6, 8]);
      const distance = (speedA + speedB) * time;
      questions.push(
        `甲、乙兩人從同地反方向出發，甲速率 $${speedA}$ 公尺/分，乙速率 $${speedB}$ 公尺/分，$${time}$ 分鐘後兩人相距幾公尺？`
      );
      summaryAnswers.push(`$${distance}$ 公尺`);
      answers.push(
        `反方向出發後，相距速度是兩人的速度和，所以相距 $=(${speedA}+${speedB})\\times${time}=${distance}$ 公尺。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622SameDirectionGapSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const slow = pickFromList([150, 180, 200, 210, 240]);
      const fast = slow + pickFromList([20, 30, 40, 50, 60]);
      const time = pickFromList([5, 8, 10, 12, 15]);
      const gap = (fast - slow) * time;
      questions.push(
        `甲、乙同地同方向出發，甲速率 $${fast}$ 公尺/分，乙速率 $${slow}$ 公尺/分，$${time}$ 分鐘後甲會在乙前面幾公尺？`
      );
      summaryAnswers.push(`$${gap}$ 公尺`);
      answers.push(`同方向的距離差來自速度差，所以前後距離 $=(${fast}-${slow})\\times${time}=${gap}$ 公尺。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622ChaseTimeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const slow = pickFromList([60, 70, 75, 80, 90]);
      const fast = slow + pickFromList([10, 15, 20, 25, 30]);
      const leadDistance = (fast - slow) * pickFromList([6, 8, 10, 12]);
      const time = leadDistance / (fast - slow);
      questions.push(
        `甲在乙前方 $${leadDistance}$ 公尺，兩人同方向前進，甲速率 $${slow}$ 公尺/分，乙速率 $${fast}$ 公尺/分，乙幾分鐘後追上甲？`
      );
      summaryAnswers.push(`$${e622FormatNumber(time)}$ 分鐘後`);
      answers.push(
        `追趕用速度差。追上時間 $=\\frac{領先距離}{速度差}=\\frac{${leadDistance}}{${fast}-${slow}}=${e622FormatNumber(time)}$，所以 $${e622FormatNumber(time)}$ 分鐘後追上。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622DelayedChaseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const cases = [
        { slow: 60, fast: 80, delay: 4 },
        { slow: 70, fast: 91, delay: 3 },
        { slow: 75, fast: 100, delay: 2 },
        { slow: 80, fast: 112, delay: 4 },
        { slow: 90, fast: 120, delay: 5 },
      ];
      const { slow, fast, delay } = cases[(i + randInt(0, cases.length - 1)) % cases.length];
      const leadDistance = slow * delay;
      const chaseTime = leadDistance / (fast - slow);
      questions.push(
        `甲每分鐘走 $${slow}$ 公尺，先出發 $${delay}$ 分鐘；乙每分鐘走 $${fast}$ 公尺，之後才從同地出發。乙出發後幾分鐘會追上甲？`
      );
      summaryAnswers.push(`$${e622FormatNumber(chaseTime)}$ 分鐘後`);
      answers.push(
        `甲先走的領先距離是 $${slow}\\times${delay}=${leadDistance}$ 公尺。乙追趕時的速度差是 $${fast}-${slow}=${fast - slow}$ 公尺/分，所以追上時間 $=\\frac{${leadDistance}}{${fast - slow}}=${e622FormatNumber(chaseTime)}$ 分鐘。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622LifestyleGapSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const scenarios = [
      {
        unit: '元',
        period: '每月',
        action: '存錢',
        fasterName: '妹妹',
        slowerName: '姐姐',
        slowRate: 1600,
        fastRate: 2100,
        targetGap: 4500,
      },
      {
        unit: '字',
        period: '每分鐘',
        action: '打字',
        fasterName: '文華',
        slowerName: '易翰',
        slowRate: 60,
        fastRate: 80,
        targetGap: 600,
      },
      {
        unit: '個',
        period: '每日',
        action: '生產',
        fasterName: 'B 廠',
        slowerName: 'A 廠',
        slowRate: 50,
        fastRate: 100,
        targetGap: 1200,
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const s = scenarios[i % scenarios.length];
      const time = s.targetGap / (s.fastRate - s.slowRate);
      questions.push(
        `${s.fasterName}${s.period}${s.action} $${s.fastRate}$ ${s.unit}，${s.slowerName}${s.period}${s.action} $${s.slowRate}$ ${s.unit}，多久後兩者總量會相差 $${s.targetGap}$ ${s.unit}？`
      );
      summaryAnswers.push(
        `$${e622FormatNumber(time)}$ ${s.period === '每月' ? '個月' : s.period === '每日' ? '天' : '分鐘'}`
      );
      answers.push(
        `這題本質也是距離差問題。每${s.period.slice(1)}的差距增加量是 $${s.fastRate}-${s.slowRate}=${s.fastRate - s.slowRate}$ ${s.unit}，所以所需時間 $=\\frac{${s.targetGap}}{${s.fastRate - s.slowRate}}=${e622FormatNumber(time)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622FlowDirectSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const boat = pickFromList([12, 15, 18, 20, 24, 30]);
      const water = pickFromList([1, 2, 3, 4, 5]);
      const hours = pickFromList([3, 4, 5, 6, 8]);
      const direction = i % 2 === 0 ? '順流' : '逆流';
      const speed = direction === '順流' ? boat + water : boat - water;
      const distance = speed * hours;
      questions.push(
        `船在靜水中的速度是 $${boat}$ 公里/時，水流速度是 $${water}$ 公里/時，${direction}航行 $${hours}$ 小時可走幾公里？`
      );
      summaryAnswers.push(`$${distance}$ 公里`);
      answers.push(
        `${direction}速度 ${direction === '順流' ? '=' : '='} 船速 ${direction === '順流' ? '+' : '-'} 水速 $=${boat}${direction === '順流' ? '+' : '-'}${water}=${speed}$ 公里/時，所以距離 $=${speed}\\times${hours}=${distance}$ 公里。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622FlowSolveWaterSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const boat = pickFromList([10, 11, 12, 15, 18, 20]);
      const water = pickFromList([1, 2, 3, 4]);
      const direction = i % 2 === 0 ? '順流' : '逆流';
      const speed = direction === '順流' ? boat + water : boat - water;
      questions.push(
        `船在靜水中的速度是 $${boat}$ 公里/時，${direction}速度是 $${speed}$ 公里/時，水流速度是多少公里/時？`
      );
      summaryAnswers.push(`$${water}$ 公里/時`);
      answers.push(
        `${direction === '順流' ? '順流速度 = 船速 + 水速' : '逆流速度 = 船速 - 水速'}。所以水速 $=${direction === '順流' ? `${speed}-${boat}` : `${boat}-${speed}`}=${water}$ 公里/時。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622FlowRoundTripSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const cases = [
        { boat: 12, water: 2, distance: 50 },
        { boat: 15, water: 3, distance: 48 },
        { boat: 18, water: 2, distance: 64 },
        { boat: 20, water: 4, distance: 48 },
        { boat: 24, water: 3, distance: 84 },
      ];
      const { boat, water, distance } = cases[(i + randInt(0, cases.length - 1)) % cases.length];
      const downstreamTime = distance / (boat + water);
      const upstreamTime = distance / (boat - water);
      questions.push(
        `船在靜水中的速度是 $${boat}$ 公里/時，水流速度是 $${water}$ 公里/時。若順流航行 $${distance}$ 公里後原路逆流返回，回程需要幾小時？`
      );
      summaryAnswers.push(`$${e622FormatNumber(upstreamTime)}$ 小時`);
      answers.push(
        `回程是逆流，逆流速度 $=${boat}-${water}=${boat - water}$ 公里/時，所以回程時間 $=\\frac{${distance}}{${boat - water}}=${e622FormatNumber(upstreamTime)}$ 小時。順流時間是 $${e622FormatNumber(downstreamTime)}$ 小時，但本題只問回程。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622EscalatorSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const escalator = pickFromList([20, 24, 30, 36, 40]);
      const person = pickFromList([30, 36, 40, 45, 48, 60]);
      const sameDirection = i % 2 === 0;
      const speed = sameDirection ? escalator + person : Math.abs(person - escalator);
      questions.push(
        `電扶梯移動速度是 $${escalator}$ 公尺/分，人在平地行走速度是 $${person}$ 公尺/分。若人與電扶梯${sameDirection ? '同方向' : '反方向'}行走，每分鐘移動幾公尺？`
      );
      summaryAnswers.push(`$${speed}$ 公尺/分`);
      answers.push(
        `${sameDirection ? '同方向時速率相加' : '反方向時速率相減'}，所以每分鐘移動 $=${sameDirection ? `${escalator}+${person}` : `${person}-${escalator}`}=${speed}$ 公尺。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622PassPoleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const cases = [
        { length: 80, speed: 20 },
        { length: 90, speed: 15 },
        { length: 120, speed: 24 },
        { length: 135, speed: 15 },
        { length: 150, speed: 25 },
        { length: 180, speed: 30 },
      ];
      const { length, speed } = cases[(i + randInt(0, cases.length - 1)) % cases.length];
      const time = length / speed;
      questions.push(`一列火車長 $${length}$ 公尺，速率 $${speed}$ 公尺/秒，完全通過一根電線桿需要幾秒？`);
      summaryAnswers.push(`$${e622FormatNumber(time)}$ 秒`);
      answers.push(
        `通過電線桿時，總距離就是火車長，所以時間 $=\\frac{${length}}{${speed}}=${e622FormatNumber(time)}$ 秒。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622PassBridgeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const cases = [
        { train: 80, bridge: 120, speed: 20 },
        { train: 100, bridge: 140, speed: 20 },
        { train: 120, bridge: 180, speed: 25 },
        { train: 150, bridge: 210, speed: 30 },
        { train: 180, bridge: 300, speed: 24 },
      ];
      const { train, bridge, speed } = cases[(i + randInt(0, cases.length - 1)) % cases.length];
      const time = (train + bridge) / speed;
      questions.push(
        `一列火車長 $${train}$ 公尺，速率 $${speed}$ 公尺/秒，完全通過一座長 $${bridge}$ 公尺的橋需要幾秒？`
      );
      summaryAnswers.push(`$${e622FormatNumber(time)}$ 秒`);
      answers.push(
        `完全通過橋時，總距離 $=火車長+橋長=${train}+${bridge}=${train + bridge}$ 公尺，所以時間 $=\\frac{${train + bridge}}{${speed}}=${e622FormatNumber(time)}$ 秒。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622SolveObstacleLengthSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const cases = [
        { train: 80, speed: 20, time: 10.5 },
        { train: 100, speed: 25, time: 8 },
        { train: 120, speed: 24, time: 12.5 },
        { train: 150, speed: 30, time: 11 },
        { train: 180, speed: 20, time: 18 },
      ];
      const { train, speed, time } = cases[(i + randInt(0, cases.length - 1)) % cases.length];
      const obstacle = speed * time - train;
      questions.push(
        `一列火車長 $${train}$ 公尺，速率 $${speed}$ 公尺/秒，完全通過某橋共花 $${e622FormatNumber(time)}$ 秒，這座橋長幾公尺？`
      );
      summaryAnswers.push(`$${obstacle}$ 公尺`);
      answers.push(
        `完全通過時總距離 $=速度\\times 時間=${speed}\\times${e622FormatNumber(time)}=${speed * time}$ 公尺。橋長 $=總距離-火車長=${speed * time}-${train}=${obstacle}$ 公尺。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622EchoDistanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modes = [
      { sound: 340, speedUnit: '公尺/秒', distanceUnit: '公尺', times: [1, 2.5, 4, 6, 8] },
      { sound: 1500, speedUnit: '公尺/秒', distanceUnit: '公尺', times: [2, 4, 6, 8, 10] },
      { sound: 1.5, speedUnit: '公里/秒', distanceUnit: '公里', times: [2, 4, 6, 8] },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      const time = pickFromList(mode.times);
      const distance = (mode.sound * time) / 2;
      questions.push(
        `聲音傳播速度約為 $${e622FormatNumber(mode.sound)}$ ${mode.speedUnit}，發出聲音後經過 $${e622FormatNumber(time)}$ 秒聽到回聲，障礙物距離多遠？`
      );
      summaryAnswers.push(`$${e622FormatNumber(distance)}$ ${mode.distanceUnit}`);
      answers.push(
        `回聲是來回，所以單程距離 $=\\frac{聲速\\times 時間}{2}=\\frac{${e622FormatNumber(mode.sound)}\\times${e622FormatNumber(time)}}{2}=${e622FormatNumber(distance)}$ ${mode.distanceUnit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── e6-2-2 新增練習：分段路程、圓形追及、行駛剩餘 ──────────────────────

  function buildE622TwoSegDistanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { v1: 80, t1: 10, v2: 60, t2: 15, rest: 0 },
      { v1: 100, t1: 12, v2: 80, t2: 10, rest: 0 },
      { v1: 90, t1: 8,  v2: 70, t2: 12, rest: 0 },
      { v1: 120, t1: 5, v2: 90, t2: 10, rest: 5 },
      { v1: 80, t1: 15, v2: 60, t2: 20, rest: 10 },
      { v1: 100, t1: 8, v2: 70, t2: 15, rest: 0 },
    ];
    const contexts = ['小明', '小華', '小英', '小美'];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      const { v1, t1, v2, t2, rest } = c;
      const d1 = v1 * t1;
      const d2 = v2 * t2;
      const total = d1 + d2;
      const name = contexts[i % contexts.length];
      const restPart = rest > 0 ? `，然後休息 $${rest}$ 分鐘` : '';
      questions.push(
        `${name}以每分鐘 $${v1}$ 公尺的速率走了 $${t1}$ 分鐘${restPart}，再以每分鐘 $${v2}$ 公尺的速率走了 $${t2}$ 分鐘，請問他總共走了多少公尺？`
      );
      summaryAnswers.push(`$${total}$ 公尺`);
      answers.push(
        `第一段路程 $= ${v1} \\times ${t1} = ${d1}$ 公尺，第二段路程 $= ${v2} \\times ${t2} = ${d2}$ 公尺，` +
        `總路程 $= ${d1} + ${d2} = ${total}$ 公尺。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622CircularChaseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { track: 400, fast: 5, slow: 3 },   // diff=2, t=200s
      { track: 500, fast: 6, slow: 4 },   // diff=2, t=250s
      { track: 600, fast: 7, slow: 5 },   // diff=2, t=300s
      { track: 300, fast: 5, slow: 4 },   // diff=1, t=300s
      { track: 400, fast: 8, slow: 6 },   // diff=2, t=200s
      { track: 450, fast: 6, slow: 3 },   // diff=3, t=150s
    ];
    for (let i = 0; i < count; i += 1) {
      const c = cases[i % cases.length];
      const { track, fast, slow } = c;
      const diff = fast - slow;
      const time = track / diff;
      questions.push(
        `甲、乙兩人同時同地同方向繞著一個周長 $${track}$ 公尺的圓形跑道跑步，甲的速率是每秒 $${fast}$ 公尺，乙的速率是每秒 $${slow}$ 公尺，請問幾秒後甲會再次追上乙？`
      );
      summaryAnswers.push(`$${e622FormatNumber(time)}$ 秒後`);
      answers.push(
        `同向出發，甲每秒比乙多跑 $${fast} - ${slow} = ${diff}$ 公尺，當甲多跑一圈（$${track}$ 公尺）時才能追上乙，` +
        `所以追上時間 $= \\frac{${track}}{${diff}} = ${e622FormatNumber(time)}$ 秒。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622PartialRemainSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // mode 0: 行駛 X 小時後，還剩 Y 公里，求全程
    // mode 1: 全程 D 公里，速率 S km/h，中途休息 R 分鐘，求總時間
    const mode0Cases = [
      { speed: 80,  time: 3,   remaining: 40  },  // total=280km
      { speed: 100, time: 2.5, remaining: 50  },  // total=300km
      { speed: 60,  time: 4,   remaining: 60  },  // total=300km
      { speed: 90,  time: 2,   remaining: 30  },  // total=210km
      { speed: 80,  time: 2.5, remaining: 60  },  // total=260km
    ];
    const mode1Cases = [
      { dist: 480, speed: 80,  rest: 30  },  // 6+0.5=6.5h
      { dist: 240, speed: 80,  rest: 30  },  // 3+0.5=3.5h
      { dist: 300, speed: 100, rest: 60  },  // 3+1=4h
      { dist: 180, speed: 60,  rest: 30  },  // 3+0.5=3.5h
      { dist: 350, speed: 70,  rest: 30  },  // 5+0.5=5.5h
    ];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const c = mode0Cases[Math.floor(i / 2) % mode0Cases.length];
        const { speed, time, remaining } = c;
        const total = speed * time + remaining;
        questions.push(
          `一輛汽車以時速 $${speed}$ 公里行駛，開了 $${e622FormatNumber(time)}$ 小時後，還剩下 $${remaining}$ 公里才到達目的地，請問全程共有多少公里？`
        );
        summaryAnswers.push(`$${total}$ 公里`);
        answers.push(
          `已行駛距離 $= ${speed} \\times ${e622FormatNumber(time)} = ${speed * time}$ 公里，全程 $= ${speed * time} + ${remaining} = ${total}$ 公里。`
        );
      } else {
        const c = mode1Cases[Math.floor(i / 2) % mode1Cases.length];
        const { dist, speed, rest } = c;
        const driveTime = dist / speed;
        const totalTime = driveTime + rest / 60;
        questions.push(
          `一輛汽車以時速 $${speed}$ 公里行駛 $${dist}$ 公里，中途休息 $${rest}$ 分鐘，請問從出發到抵達共花了多少小時？`
        );
        summaryAnswers.push(`$${e622FormatNumber(totalTime)}$ 小時`);
        answers.push(
          `行駛時間 $= \\frac{${dist}}{${speed}} = ${e622FormatNumber(driveTime)}$ 小時，休息 $${rest}$ 分 $= ${e622FormatNumber(rest / 60)}$ 小時，` +
          `合計 $${e622FormatNumber(driveTime)} + ${e622FormatNumber(rest / 60)} = ${e622FormatNumber(totalTime)}$ 小時。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](4);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      summaryAnswers.push(
        Array.isArray(generated.summaryAnswers) ? generated.summaryAnswers[itemIndex] : generated.answers[itemIndex]
      );
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE622BasicMixedSet(count) {
    return buildE622MixedSet(
      [
        buildE622RateBasicSet,
        buildE622DistanceBasicSet,
        buildE622TimeBasicSet,
        buildE622UnitConvertSet,
        buildE622CompareSpeedSet,
      ],
      count
    );
  }

  function buildE622AverageMixedSet(count) {
    return buildE622MixedSet(
      [buildE622AverageTwoStageSet, buildE622AverageRoundTripSet, buildE622AverageSegmentKnownSet],
      count
    );
  }

  function buildE622RelativeMixedSet(count) {
    return buildE622MixedSet(
      [
        buildE622OppositeMeetTimeSet,
        buildE622OppositeDistanceSet,
        buildE622SameDirectionGapSet,
        buildE622ChaseTimeSet,
        buildE622DelayedChaseSet,
        buildE622LifestyleGapSet,
      ],
      count
    );
  }

  function buildE622FlowMixedSet(count) {
    return buildE622MixedSet(
      [buildE622FlowDirectSet, buildE622FlowSolveWaterSet, buildE622FlowRoundTripSet, buildE622EscalatorSet],
      count
    );
  }

  function buildE622ThroughMixedSet(count) {
    return buildE622MixedSet(
      [buildE622PassPoleSet, buildE622PassBridgeSet, buildE622SolveObstacleLengthSet, buildE622EchoDistanceSet],
      count
    );
  }

  const E623_PI = 3.14;

  function e623FormatNumber(value) {
    const rounded = Math.round(Number(value) * 100) / 100;
    return trimDecimalString(String(rounded));
  }

  function e623CircleArea(radius) {
    return E623_PI * radius * radius;
  }

  function e623CircleCircumference(radius) {
    return 2 * E623_PI * radius;
  }

  function buildE623PolygonPrismVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const length = pickFromList([6, 8, 9, 10, 12]);
        const width = pickFromList([4, 5, 6, 7]);
        const prismHeight = pickFromList([3, 4, 5, 6]);
        const baseArea = length * width;
        const volume = baseArea * prismHeight;
        questions.push(`長方柱的底面長 $${length}$ 公分、寬 $${width}$ 公分，柱高 $${prismHeight}$ 公分，求體積。`);
        summaryAnswers.push(`$${volume}$ 立方公分`);
        answers.push(
          `先算底面積：$${length}\\times${width}=${baseArea}$ 平方公分，再用柱體體積 $=\\text{底面積}\\times\\text{柱高}$，所以體積 $=${baseArea}\\times${prismHeight}=${volume}$ 立方公分。`
        );
      } else if (mode === 1) {
        const base = pickFromList([6, 8, 10, 12]);
        const baseHeight = pickFromList([3, 4, 5, 6]);
        const prismHeight = pickFromList([4, 5, 6, 8]);
        const baseArea = base * baseHeight;
        const volume = baseArea * prismHeight;
        questions.push(
          `平行四邊形柱的底面底 $${base}$ 公分、高 $${baseHeight}$ 公分，柱高 $${prismHeight}$ 公分，求體積。`
        );
        summaryAnswers.push(`$${volume}$ 立方公分`);
        answers.push(
          `底面積是 $${base}\\times${baseHeight}=${baseArea}$ 平方公分，所以體積 $=${baseArea}\\times${prismHeight}=${volume}$ 立方公分。`
        );
      } else if (mode === 2) {
        const base = pickFromList([6, 8, 10, 12]);
        const triHeight = pickFromList([3, 4, 5, 6]);
        const prismHeight = pickFromList([4, 5, 6, 8]);
        const baseArea = (base * triHeight) / 2;
        const volume = baseArea * prismHeight;
        questions.push(`三角柱的底面底 $${base}$ 公分、高 $${triHeight}$ 公分，柱高 $${prismHeight}$ 公分，求體積。`);
        summaryAnswers.push(`$${volume}$ 立方公分`);
        answers.push(
          `三角形底面積 $=\\frac{${base}\\times${triHeight}}{2}=${baseArea}$ 平方公分，所以體積 $=${baseArea}\\times${prismHeight}=${volume}$ 立方公分。`
        );
      } else {
        const upper = pickFromList([2, 3, 4, 5]);
        const lower = pickFromList([6, 8, 10, 12]);
        const trapHeight = pickFromList([3, 4, 5, 6]);
        const prismHeight = pickFromList([3, 4, 5, 6]);
        const baseArea = ((upper + lower) * trapHeight) / 2;
        const volume = baseArea * prismHeight;
        questions.push(
          `梯形柱的底面上底 $${upper}$ 公分、下底 $${lower}$ 公分、高 $${trapHeight}$ 公分，柱高 $${prismHeight}$ 公分，求體積。`
        );
        summaryAnswers.push(`$${volume}$ 立方公分`);
        answers.push(
          `梯形底面積 $=\\frac{(${upper}+${lower})\\times${trapHeight}}{2}=${baseArea}$ 平方公分，所以體積 $=${baseArea}\\times${prismHeight}=${volume}$ 立方公分。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623CylinderVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const radius = pickFromList([3, 4, 5, 6, 8, 10]);
      const height = pickFromList([5, 8, 10, 12, 15, 20]);
      const volume = e623CircleArea(radius) * height;
      questions.push(`圓柱的底面半徑是 $${radius}$ 公分，柱高是 $${height}$ 公分，求體積。（圓周率取 $3.14$）`);
      summaryAnswers.push(`約 $${e623FormatNumber(volume)}$ 立方公分`);
      answers.push(
        `圓柱體積 $=\\pi r^2h=3.14\\times${radius}^2\\times${height}=3.14\\times${radius * radius}\\times${height}=${e623FormatNumber(volume)}$，所以體積約為 $${e623FormatNumber(volume)}$ 立方公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623PartialCylinderVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const sectorAngles = [45, 60, 90, 120];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const diameter = pickFromList([6, 8, 10, 12]);
        const radius = diameter / 2;
        const height = pickFromList([6, 8, 10, 12]);
        const fullVolume = e623CircleArea(radius) * height;
        const volume = fullVolume / 2;
        questions.push(`半圓柱的底面直徑是 $${diameter}$ 公分，柱高是 $${height}$ 公分，求體積。（圓周率取 $3.14$）`);
        summaryAnswers.push(`約 $${e623FormatNumber(volume)}$ 立方公分`);
        answers.push(
          `先算整個圓柱體積：$3.14\\times${radius}^2\\times${height}=${e623FormatNumber(fullVolume)}$，半圓柱體積是它的一半，所以約為 $${e623FormatNumber(volume)}$ 立方公分。`
        );
      } else {
        const radius = pickFromList([3, 4, 5, 6]);
        const angle = sectorAngles[(i + randInt(0, sectorAngles.length - 1)) % sectorAngles.length];
        const height = pickFromList([5, 6, 8, 10]);
        const fullVolume = e623CircleArea(radius) * height;
        const volume = (fullVolume * angle) / 360;
        questions.push(
          `扇形柱的底面半徑是 $${radius}$ 公分、圓心角是 $${angle}^\\circ$，柱高是 $${height}$ 公分，求體積。（圓周率取 $3.14$）`
        );
        summaryAnswers.push(`約 $${e623FormatNumber(volume)}$ 立方公分`);
        answers.push(
          `先算整個圓柱體積：$3.14\\times${radius}^2\\times${height}=${e623FormatNumber(fullVolume)}$，扇形柱佔整個圓柱的 $\\frac{${angle}}{360}$，所以體積約為 $${e623FormatNumber(volume)}$ 立方公分。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623PolygonPrismSurfaceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const triples = [
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const [a, b, c] = triples[(i + randInt(0, triples.length - 1)) % triples.length];
        const prismHeight = pickFromList([6, 8, 10, 12]);
        const baseArea = (a * b) / 2;
        const perimeter = a + b + c;
        const surface = 2 * baseArea + perimeter * prismHeight;
        questions.push(
          `直角三角柱的底面三邊長分別為 $${a}$、$${b}$、$${c}$ 公分，柱高 $${prismHeight}$ 公分，求表面積。`
        );
        summaryAnswers.push(`$${surface}$ 平方公分`);
        answers.push(
          `表面積 $=2\\times\\text{底面積}+\\text{底面周長}\\times\\text{柱高}$。底面積 $=\\frac{${a}\\times${b}}{2}=${baseArea}$，底面周長 $=${a}+${b}+${c}=${perimeter}$，所以表面積 $=2\\times${baseArea}+${perimeter}\\times${prismHeight}=${surface}$ 平方公分。`
        );
      } else if (mode === 1) {
        const length = pickFromList([6, 8, 10, 12]);
        const width = pickFromList([4, 5, 6, 7]);
        const height = pickFromList([5, 6, 8, 10]);
        const surface = 2 * (length * width + length * height + width * height);
        questions.push(`長方體的長、寬、高分別為 $${length}$、$${width}$、$${height}$ 公分，求表面積。`);
        summaryAnswers.push(`$${surface}$ 平方公分`);
        answers.push(
          `長方體表面積 $=2(lw+lh+wh)=2(${length}\\times${width}+${length}\\times${height}+${width}\\times${height})=${surface}$ 平方公分。`
        );
      } else {
        const base = pickFromList([8, 10, 12, 15]);
        const side = pickFromList([5, 6, 7, 8]);
        const baseHeight = pickFromList([3, 4, 5, 6]);
        const prismHeight = pickFromList([6, 8, 10]);
        const baseArea = base * baseHeight;
        const perimeter = 2 * (base + side);
        const surface = 2 * baseArea + perimeter * prismHeight;
        questions.push(
          `平行四邊形柱的底面底 $${base}$ 公分、鄰邊 $${side}$ 公分、底面高 $${baseHeight}$ 公分，柱高 $${prismHeight}$ 公分，求表面積。`
        );
        summaryAnswers.push(`$${surface}$ 平方公分`);
        answers.push(
          `底面積 $=${base}\\times${baseHeight}=${baseArea}$，底面周長 $=2\\times(${base}+${side})=${perimeter}$，所以表面積 $=2\\times${baseArea}+${perimeter}\\times${prismHeight}=${surface}$ 平方公分。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623CylinderSurfaceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const diameter = pickFromList([6, 8, 10, 12, 14]);
      const radius = diameter / 2;
      const height = pickFromList([8, 10, 12, 15, 20]);
      const surface = 2 * e623CircleArea(radius) + e623CircleCircumference(radius) * height;
      questions.push(`圓柱的底面直徑是 $${diameter}$ 公分，柱高是 $${height}$ 公分，求表面積。（圓周率取 $3.14$）`);
      summaryAnswers.push(`約 $${e623FormatNumber(surface)}$ 平方公分`);
      answers.push(
        `表面積 $=2\\times\\text{底面積}+\\text{側面積}=2\\times3.14\\times${radius}^2+2\\times3.14\\times${radius}\\times${height}=${e623FormatNumber(surface)}$，所以表面積約為 $${e623FormatNumber(surface)}$ 平方公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623LateralAreaApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const diameter = pickFromList([8, 10, 12, 14]);
      const radius = diameter / 2;
      const height = pickFromList([10, 12, 15, 18]);
      const lateralArea = e623CircleCircumference(radius) * height;
      questions.push(
        `一個圓柱罐頭的直徑是 $${diameter}$ 公分，高是 $${height}$ 公分，側面貼滿標籤紙，標籤紙面積是多少？（圓周率取 $3.14$）`
      );
      summaryAnswers.push(`約 $${e623FormatNumber(lateralArea)}$ 平方公分`);
      answers.push(
        `標籤紙只包側面，所以面積 $=\\text{底面圓周長}\\times\\text{高}=2\\times3.14\\times${radius}\\times${height}=${e623FormatNumber(lateralArea)}$ 平方公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623MissingFaceSurfaceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const diameter = pickFromList([10, 12, 14, 16]);
        const radius = diameter / 2;
        const height = pickFromList([8, 10, 12, 15]);
        const area = e623CircleArea(radius) + e623CircleCircumference(radius) * height;
        questions.push(
          `一個無蓋圓柱形容器，底面直徑是 $${diameter}$ 公分，高是 $${height}$ 公分，求需要的材料面積。（圓周率取 $3.14$）`
        );
        summaryAnswers.push(`約 $${e623FormatNumber(area)}$ 平方公分`);
        answers.push(
          `無蓋表示只算一個底面和側面，所以面積 $=3.14\\times${radius}^2+2\\times3.14\\times${radius}\\times${height}=${e623FormatNumber(area)}$ 平方公分。`
        );
      } else {
        const diameter = pickFromList([20, 30, 40]);
        const radius = diameter / 2;
        const height = pickFromList([20, 25, 30]);
        const painted = e623CircleArea(radius) + e623CircleCircumference(radius) * height;
        questions.push(
          `一個圓柱形石凳直徑是 $${diameter}$ 公分，高是 $${height}$ 公分，底部不漆，求要粉刷的面積。（圓周率取 $3.14$）`
        );
        summaryAnswers.push(`約 $${e623FormatNumber(painted)}$ 平方公分`);
        answers.push(
          `底部不漆，所以要算上底面和側面。面積 $=3.14\\times${radius}^2+2\\times3.14\\times${radius}\\times${height}=${e623FormatNumber(painted)}$ 平方公分。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623ReverseBaseAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const baseArea = pickFromList([24, 30, 36, 42, 48, 54]);
      const height = pickFromList([3, 4, 5, 6, 8, 9]);
      const volume = baseArea * height;
      questions.push(`某柱體體積是 $${volume}$ 立方公分，柱高是 $${height}$ 公分，求底面積。`);
      summaryAnswers.push(`$${baseArea}$ 平方公分`);
      answers.push(`底面積 $=\\text{體積}\\div\\text{柱高}=${volume}\\div${height}=${baseArea}$ 平方公分。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623ReverseHeightSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const baseArea = pickFromList([9.42, 12.56, 18.84, 28.26]);
        const height = pickFromList([4, 5, 6, 8]);
        const volume = baseArea * height;
        questions.push(
          `圓柱體體積是 $${e623FormatNumber(volume)}$ 立方公分，底面積是 $${e623FormatNumber(baseArea)}$ 平方公分，求柱高。`
        );
        summaryAnswers.push(`$${height}$ 公分`);
        answers.push(
          `柱高 $=\\text{體積}\\div\\text{底面積}=${e623FormatNumber(volume)}\\div${e623FormatNumber(baseArea)}=${height}$ 公分。`
        );
      } else {
        const baseArea = pickFromList([24, 30, 36, 40, 48]);
        const height = pickFromList([4, 5, 6, 8, 10]);
        const volume = baseArea * height;
        questions.push(`某柱體體積是 $${volume}$ 立方公分，底面積是 $${baseArea}$ 平方公分，求柱高。`);
        summaryAnswers.push(`$${height}$ 公分`);
        answers.push(`柱高 $=\\text{體積}\\div\\text{底面積}=${volume}\\div${baseArea}=${height}$ 公分。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623ReverseWidthSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const length = pickFromList([12, 15, 18, 20]);
      const width = pickFromList([4, 5, 6, 8, 10]);
      const height = pickFromList([6, 8, 10, 12]);
      const volume = length * width * height;
      questions.push(`一個長方體體積是 $${volume}$ 立方公分，長是 $${length}$ 公分，高是 $${height}$ 公分，求寬。`);
      summaryAnswers.push(`$${width}$ 公分`);
      answers.push(
        `長方體體積 $=\\text{長}\\times\\text{寬}\\times\\text{高}$，所以寬 $=${volume}\\div${length}\\div${height}=${width}$ 公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623HeightCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const volume = pickFromList([240, 360, 480, 600, 720, 840]);
      const areaA = pickFromList([12, 15, 16, 20, 24]);
      const areaB = pickFromList([18, 21, 25, 30, 35]);
      const heightA = volume / areaA;
      const heightB = volume / areaB;
      const winner = heightA > heightB ? '甲柱' : '乙柱';
      questions.push(
        `甲柱與乙柱體積都為 $${volume}$ 立方公分，甲柱底面積是 $${areaA}$ 平方公分，乙柱底面積是 $${areaB}$ 平方公分，哪一個柱高比較長？`
      );
      summaryAnswers.push(`${winner}`);
      answers.push(
        `柱高 $=\\text{體積}\\div\\text{底面積}$。甲柱高 $=${volume}\\div${areaA}=${e623FormatNumber(heightA)}$ 公分，乙柱高 $=${volume}\\div${areaB}=${e623FormatNumber(heightB)}$ 公分，所以較高的是 ${winner}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623CompositePrismVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const rectLength = pickFromList([10, 12, 15, 18]);
        const rectWidth = pickFromList([6, 8, 10]);
        const triBase = pickFromList([6, 8, 10, 12]);
        const triHeight = pickFromList([3, 4, 5, 6]);
        const prismHeight = pickFromList([4, 5, 6, 8]);
        const baseArea = rectLength * rectWidth + (triBase * triHeight) / 2;
        const volume = baseArea * prismHeight;
        questions.push(
          `一個柱體的底面由長方形與三角形組成：長方形長 $${rectLength}$ 公分、寬 $${rectWidth}$ 公分，三角形底 $${triBase}$ 公分、高 $${triHeight}$ 公分，柱高 $${prismHeight}$ 公分，求體積。`
        );
        summaryAnswers.push(`$${volume}$ 立方公分`);
        answers.push(
          `先算複合底面積：$${rectLength}\\times${rectWidth}+\\frac{${triBase}\\times${triHeight}}{2}=${baseArea}$ 平方公分，再乘柱高 $${prismHeight}$，得到體積 $${volume}$ 立方公分。`
        );
      } else {
        const r1 = pickFromList([3, 4, 5]);
        const h1 = pickFromList([6, 8, 10]);
        const r2 = pickFromList([6, 8, 10]);
        const h2 = pickFromList([4, 5, 6]);
        const v1 = e623CircleArea(r1) * h1;
        const v2 = e623CircleArea(r2) * h2;
        const total = v1 + v2;
        questions.push(
          `上下堆疊兩個圓柱：上方圓柱半徑 $${r1}$ 公分、高 $${h1}$ 公分；下方圓柱半徑 $${r2}$ 公分、高 $${h2}$ 公分，求總體積。（圓周率取 $3.14$）`
        );
        summaryAnswers.push(`約 $${e623FormatNumber(total)}$ 立方公分`);
        answers.push(
          `總體積是兩個圓柱體積相加：$3.14\\times${r1}^2\\times${h1}+3.14\\times${r2}^2\\times${h2}=${e623FormatNumber(total)}$，所以總體積約為 $${e623FormatNumber(total)}$ 立方公分。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623HollowRectVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { outerL: 7, outerW: 4, innerL: 5, innerW: 2, height: 10 },
      { outerL: 9, outerW: 6, innerL: 7, innerW: 4, height: 12 },
      { outerL: 10, outerW: 8, innerL: 8, innerW: 6, height: 15 },
      { outerL: 12, outerW: 7, innerL: 10, innerW: 5, height: 9 },
    ];
    for (let i = 0; i < count; i += 1) {
      const { outerL, outerW, innerL, innerW, height } = cases[(i + randInt(0, cases.length - 1)) % cases.length];
      const outerVolume = outerL * outerW * height;
      const innerVolume = innerL * innerW * height;
      const material = outerVolume - innerVolume;
      questions.push(
        `一個空心長方柱外部底面是 $${outerL}\\times${outerW}$ 平方公分，內部空心底面是 $${innerL}\\times${innerW}$ 平方公分，高是 $${height}$ 公分，求材料體積。`
      );
      summaryAnswers.push(`$${material}$ 立方公分`);
      answers.push(
        `材料體積 $=\\text{外部體積}-\\text{內部空心體積}=(${outerL}\\times${outerW}\\times${height})-(${innerL}\\times${innerW}\\times${height})=${material}$ 立方公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623HollowCylinderVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const outerDiameter = pickFromList([16, 20, 22, 24, 30]);
      const thickness = pickFromList([1, 2, 3]);
      const height = pickFromList([20, 30, 40, 50]);
      const outerRadius = outerDiameter / 2;
      const innerRadius = outerRadius - thickness;
      const material = (e623CircleArea(outerRadius) - e623CircleArea(innerRadius)) * height;
      questions.push(
        `一個空心圓柱外徑是 $${outerDiameter}$ 公分，厚度是 $${thickness}$ 公分，高是 $${height}$ 公分，求材料體積。（圓周率取 $3.14$）`
      );
      summaryAnswers.push(`約 $${e623FormatNumber(material)}$ 立方公分`);
      answers.push(
        `外半徑是 $${outerRadius}$ 公分，內半徑是 $${innerRadius}$ 公分。材料體積 $=(3.14\\times${outerRadius}^2-3.14\\times${innerRadius}^2)\\times${height}=${e623FormatNumber(material)}$，所以約為 $${e623FormatNumber(material)}$ 立方公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623DrilledSolidVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const length = pickFromList([10, 12, 15, 18]);
        const width = pickFromList([8, 10, 12]);
        const height = pickFromList([10, 12, 15]);
        const cutSide = pickFromList([3, 4, 5, 6]);
        const remain = length * width * height - cutSide * cutSide * height;
        questions.push(
          `一個長方體長 $${length}$ 公分、寬 $${width}$ 公分、高 $${height}$ 公分，中間挖掉一個邊長 $${cutSide}$ 公分、貫穿上下的正方柱孔，求剩餘體積。`
        );
        summaryAnswers.push(`$${remain}$ 立方公分`);
        answers.push(
          `剩餘體積 $=\\text{大長方體體積}-\\text{挖掉的正方柱體積}=${length}\\times${width}\\times${height}-${cutSide}^2\\times${height}=${remain}$ 立方公分。`
        );
      } else {
        const side = pickFromList([10, 12, 15, 18]);
        const radius = pickFromList([2, 3, 4, 5]);
        const remain = side * side * side - e623CircleArea(radius) * side;
        questions.push(
          `一個邊長 $${side}$ 公分的正方體，中間挖掉一個半徑 $${radius}$ 公分、貫穿上下的圓柱孔，求剩餘體積。（圓周率取 $3.14$）`
        );
        summaryAnswers.push(`約 $${e623FormatNumber(remain)}$ 立方公分`);
        answers.push(
          `剩餘體積 $=\\text{正方體體積}-\\text{圓柱孔體積}=${side}^3-3.14\\times${radius}^2\\times${side}=${e623FormatNumber(remain)}$，所以約為 $${e623FormatNumber(remain)}$ 立方公分。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623TankCapacitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const diameter = pickFromList([10, 12, 14]);
        const radius = diameter / 2;
        const height = pickFromList([2, 3, 4]);
        const volume = e623CircleArea(radius) * height;
        questions.push(
          `一個圓柱形水塔內部直徑是 $${diameter}$ 公尺，高是 $${height}$ 公尺，最多可儲水多少立方公尺？（圓周率取 $3.14$）`
        );
        summaryAnswers.push(`約 $${e623FormatNumber(volume)}$ 立方公尺`);
        answers.push(
          `水塔容量就是圓柱體積：$3.14\\times${radius}^2\\times${height}=${e623FormatNumber(volume)}$，所以最多可儲水約 $${e623FormatNumber(volume)}$ 立方公尺。`
        );
      } else {
        const length = pickFromList([6, 8, 10]);
        const width = pickFromList([4, 5, 6]);
        const height = pickFromList([3, 4, 5]);
        const volume = length * width * height;
        questions.push(
          `一個長方體水箱長 $${length}$ 公尺、寬 $${width}$ 公尺、高 $${height}$ 公尺，最多可裝水多少立方公尺？`
        );
        summaryAnswers.push(`$${volume}$ 立方公尺`);
        answers.push(
          `水箱容量就是長方體體積：$${length}\\times${width}\\times${height}=${volume}$，所以最多可裝 $${volume}$ 立方公尺的水。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623LabelWrapSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const diameter = pickFromList([8, 10, 12, 14]);
      const radius = diameter / 2;
      const height = pickFromList([10, 12, 15, 18]);
      const area = e623CircleCircumference(radius) * height;
      questions.push(
        `一個圓柱禮盒的直徑是 $${diameter}$ 公分，高是 $${height}$ 公分，若只包側面，至少需要多少包裝紙？（圓周率取 $3.14$）`
      );
      summaryAnswers.push(`約 $${e623FormatNumber(area)}$ 平方公分`);
      answers.push(
        `只包側面，所以面積 $=\\text{底面圓周長}\\times\\text{高}=2\\times3.14\\times${radius}\\times${height}=${e623FormatNumber(area)}$ 平方公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623PaintAreaApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const diameter = pickFromList([20, 30, 40]);
      const radius = diameter / 2;
      const height = pickFromList([20, 25, 30]);
      const area = e623CircleArea(radius) + e623CircleCircumference(radius) * height;
      questions.push(
        `一個圓柱形石凳直徑是 $${diameter}$ 公分，高是 $${height}$ 公分，放在地面的底面不漆，求其餘部分的粉刷面積。（圓周率取 $3.14$）`
      );
      summaryAnswers.push(`約 $${e623FormatNumber(area)}$ 平方公分`);
      answers.push(
        `底面不漆，所以要算上底面和側面。面積 $=3.14\\times${radius}^2+2\\times3.14\\times${radius}\\times${height}=${e623FormatNumber(area)}$ 平方公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623WaterRiseDisplacementSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const baseLength = pickFromList([20, 25, 30]);
        const baseWidth = pickFromList([15, 18, 20]);
        const rise = pickFromList([2, 3, 4, 5]);
        const volume = baseLength * baseWidth * rise;
        questions.push(
          `一個長方體容器底面長 $${baseLength}$ 公分、寬 $${baseWidth}$ 公分，放入物體後水面上升 $${rise}$ 公分，求物體排開的體積。`
        );
        summaryAnswers.push(`$${volume}$ 立方公分`);
        answers.push(
          `排開的體積 $=\\text{底面積}\\times\\text{上升高度}=(${baseLength}\\times${baseWidth})\\times${rise}=${volume}$ 立方公分。`
        );
      } else {
        const baseArea = pickFromList([200, 240, 300, 360, 400]);
        const rise = pickFromList([2, 3, 4, 5]);
        const volume = baseArea * rise;
        questions.push(
          `一個柱形容器的底面積是 $${baseArea}$ 平方公分，放入石頭後水位上升 $${rise}$ 公分，求石頭體積。`
        );
        summaryAnswers.push(`$${volume}$ 立方公分`);
        answers.push(
          `石頭體積等於排開的水量，所以體積 $=\\text{底面積}\\times\\text{上升高度}=${baseArea}\\times${rise}=${volume}$ 立方公分。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623PackageCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { rA: 6, hA: 10, rB: 4, hB: 16 },
      { rA: 5, hA: 12, rB: 7, hB: 8 },
      { rA: 8, hA: 6, rB: 4, hB: 20 },
      { rA: 3, hA: 18, rB: 6, hB: 10 },
    ];
    for (let i = 0; i < count; i += 1) {
      const { rA, hA, rB, hB } = cases[(i + randInt(0, cases.length - 1)) % cases.length];
      const surfaceA = 2 * e623CircleArea(rA) + e623CircleCircumference(rA) * hA;
      const surfaceB = 2 * e623CircleArea(rB) + e623CircleCircumference(rB) * hB;
      const winner = surfaceA > surfaceB ? '甲盒' : '乙盒';
      questions.push(
        `兩個圓柱禮盒相比較：甲盒半徑 $${rA}$ 公分、高 $${hA}$ 公分；乙盒半徑 $${rB}$ 公分、高 $${hB}$ 公分，哪一個表面積較大？（圓周率取 $3.14$）`
      );
      summaryAnswers.push(`${winner}`);
      answers.push(
        `甲盒表面積約為 $${e623FormatNumber(surfaceA)}$ 平方公分，乙盒表面積約為 $${e623FormatNumber(surfaceB)}$ 平方公分，所以表面積較大的是 ${winner}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── e6-2-3 新增練習：最大圓柱與維度變化 ────────────────────────────────

  function buildE623CubeToMaxCylinderSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const edges = [4, 6, 8, 10];
    for (let i = 0; i < count; i += 1) {
      const a = edges[i % edges.length];
      const r = a / 2;
      const V = e623FormatNumber(3.14 * r * r * a);
      questions.push(
        `有一個邊長為 $${a}$ 公分的正方體，將其削成一個最大的圓柱，求這個圓柱的體積。（圓周率取 $3.14$）`
      );
      summaryAnswers.push(`$${V}$ 立方公分`);
      answers.push(
        `最大圓柱的底面半徑 $= ${a} \\div 2 = ${r}$ 公分，高 $= ${a}$ 公分，` +
        `體積 $= 3.14 \\times ${r} \\times ${r} \\times ${a} = ${V}$ 立方公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623DimChangeVolumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // mode 0: 長方體一邊增加 n 公分
    // mode 1: 長方體長增加 n%（僅長一邊改變）
    // mode 2: 圓柱半徑增加 n 公分
    // mode 3: 圓柱高增加 n 公分
    const rectPctCases = [
      { l: 8,  pct: 25, newL: 10, w: 6, h: 5 },
      { l: 12, pct: 25, newL: 15, w: 8, h: 5 },
      { l: 10, pct: 50, newL: 15, w: 4, h: 6 },
      { l: 4,  pct: 50, newL: 6,  w: 3, h: 5 },
      { l: 6,  pct: 50, newL: 9,  w: 4, h: 4 },
    ];
    const cylRCases = [
      { r: 2, dr: 1, h: 5 },
      { r: 3, dr: 2, h: 8 },
      { r: 5, dr: 1, h: 10 },
      { r: 4, dr: 2, h: 6 },
    ];
    const cylHCases = [
      { r: 3, dh: 2 },
      { r: 5, dh: 3 },
      { r: 4, dh: 5 },
      { r: 2, dh: 4 },
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;
      if (mode === 0) {
        const lList = [6, 8, 10, 12];
        const wList = [4, 5, 6];
        const hList = [3, 4, 5];
        const dlList = [2, 3, 4];
        const l  = lList[i % lList.length];
        const w  = wList[i % wList.length];
        const h  = hList[i % hList.length];
        const dl = dlList[i % dlList.length];
        const vOld = l * w * h;
        const vInc = dl * w * h;
        const vNew = vOld + vInc;
        questions.push(
          `一個長方體的長 $${l}$ 公分、寬 $${w}$ 公分、高 $${h}$ 公分，若將長增加 $${dl}$ 公分，體積會增加多少立方公分？`
        );
        summaryAnswers.push(`$${vInc}$ 立方公分`);
        answers.push(
          `原體積 $= ${l} \\times ${w} \\times ${h} = ${vOld}$ 立方公分，` +
          `新體積 $= ${l + dl} \\times ${w} \\times ${h} = ${vNew}$ 立方公分，` +
          `增加 $${vNew} - ${vOld} = ${vInc}$ 立方公分。`
        );
      } else if (mode === 1) {
        const c = rectPctCases[Math.floor(i / 4) % rectPctCases.length];
        const { l, pct, newL, w, h } = c;
        const vOld = l * w * h;
        const vNew = newL * w * h;
        const vInc = vNew - vOld;
        questions.push(
          `一個長方體的長 $${l}$ 公分、寬 $${w}$ 公分、高 $${h}$ 公分，若將長增加 $${pct}\\%$，體積會增加多少立方公分？`
        );
        summaryAnswers.push(`$${vInc}$ 立方公分`);
        answers.push(
          `長增加 $${pct}\\%$ 後變為 $${l} \\times (1 + ${pct}\\%) = ${newL}$ 公分，` +
          `新體積 $= ${newL} \\times ${w} \\times ${h} = ${vNew}$ 立方公分，` +
          `增加 $${vNew} - ${vOld} = ${vInc}$ 立方公分。`
        );
      } else if (mode === 2) {
        const c = cylRCases[Math.floor(i / 4) % cylRCases.length];
        const { r, dr, h } = c;
        const rNew = r + dr;
        const vOld = e623FormatNumber(3.14 * r * r * h);
        const vNew = e623FormatNumber(3.14 * rNew * rNew * h);
        const vInc = e623FormatNumber(3.14 * (rNew * rNew - r * r) * h);
        questions.push(
          `一個圓柱的底面半徑為 $${r}$ 公分，高為 $${h}$ 公分，若將半徑增加 $${dr}$ 公分，體積會增加多少立方公分？（圓周率取 $3.14$）`
        );
        summaryAnswers.push(`$${vInc}$ 立方公分`);
        answers.push(
          `新半徑 $= ${r} + ${dr} = ${rNew}$ 公分，原體積 $= 3.14 \\times ${r}^2 \\times ${h} = ${vOld}$ 立方公分，` +
          `新體積 $= 3.14 \\times ${rNew}^2 \\times ${h} = ${vNew}$ 立方公分，增加 $${vInc}$ 立方公分。`
        );
      } else {
        const c = cylHCases[Math.floor(i / 4) % cylHCases.length];
        const { r, dh } = c;
        const vInc = e623FormatNumber(3.14 * r * r * dh);
        questions.push(
          `一個圓柱的底面半徑為 $${r}$ 公分，若將高增加 $${dh}$ 公分，體積會增加多少立方公分？（圓周率取 $3.14$）`
        );
        summaryAnswers.push(`$${vInc}$ 立方公分`);
        answers.push(
          `體積增加量 $= 3.14 \\times ${r}^2 \\times ${dh} = 3.14 \\times ${r * r} \\times ${dh} = ${vInc}$ 立方公分。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE623MixedSet(banks, count) {
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

  function buildE623VolumeBasicMixedSet(count) {
    return buildE623MixedSet(
      [buildE623PolygonPrismVolumeSet, buildE623CylinderVolumeSet, buildE623PartialCylinderVolumeSet],
      count
    );
  }

  function buildE623SurfaceAreaMixedSet(count) {
    return buildE623MixedSet(
      [
        buildE623PolygonPrismSurfaceSet,
        buildE623CylinderSurfaceSet,
        buildE623LateralAreaApplicationSet,
        buildE623MissingFaceSurfaceSet,
      ],
      count
    );
  }

  function buildE623ReverseCompareMixedSet(count) {
    return buildE623MixedSet(
      [buildE623ReverseBaseAreaSet, buildE623ReverseHeightSet, buildE623ReverseWidthSet, buildE623HeightCompareSet],
      count
    );
  }

  function buildE623CompositeHollowMixedSet(count) {
    return buildE623MixedSet(
      [
        buildE623CompositePrismVolumeSet,
        buildE623HollowRectVolumeSet,
        buildE623HollowCylinderVolumeSet,
        buildE623DrilledSolidVolumeSet,
      ],
      count
    );
  }

  function buildE623ApplicationMixedSet(count) {
    return buildE623MixedSet(
      [
        buildE623TankCapacitySet,
        buildE623LabelWrapSet,
        buildE623PaintAreaApplicationSet,
        buildE623WaterRiseDisplacementSet,
        buildE623PackageCompareSet,
      ],
      count
    );
  }

  const E624_RATIO_CASES = [
    { num: 1, den: 5 },
    { num: 1, den: 4 },
    { num: 1, den: 2 },
    { num: 3, den: 4 },
    { num: 5, den: 4 },
    { num: 3, den: 2 },
    { num: 8, den: 5 },
    { num: 12, den: 5 },
  ];
  const E624_GROWTH_RATES = [5, 10, 15, 20, 25, 30];
  const E624_DISCOUNT_RATES = [10, 15, 20, 25, 30, 35];
  const E624_INTEREST_RATES = [1, 2, 2.5, 3, 5];

  function e624FormatNumber(value) {
    const rounded = Math.round(Number(value) * 100) / 100;
    return trimDecimalString(String(rounded));
  }

  function e624RatioLatex(ratio) {
    return fractionToLatex(makeFraction(ratio.num, ratio.den), true);
  }

  function e624BuildScaledPair(ratio, multipliers) {
    const scale = pickFromList(multipliers || [20, 25, 30, 40, 50, 60]);
    return {
      base: ratio.den * scale,
      compare: ratio.num * scale,
    };
  }

  function buildE624FindRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['橘子', '蘋果', '顆'],
      ['環河步道', '環山棧道', '公里'],
      ['水壺容量', '杯子容量', '毫升'],
      ['廣告海報面積', '牆壁面積', '平方公尺'],
    ];
    for (let i = 0; i < count; i += 1) {
      const ratio = pickFromList(E624_RATIO_CASES);
      const { base, compare } = e624BuildScaledPair(ratio, [12, 16, 20, 24, 30, 40]);
      const [baseLabel, compareLabel, unit] = contexts[i % contexts.length];
      const value = compare / base;
      questions.push(
        `${baseLabel}有 $${base}$ ${unit}，${compareLabel}有 $${compare}$ ${unit}，${compareLabel}是${baseLabel}的幾倍？`
      );
      summaryAnswers.push(`$${e624FormatNumber(value)}$ 倍`);
      answers.push(
        `比值 $=\\text{比較量}\\div\\text{基準量}=${compare}\\div${base}=${e624FormatNumber(value)}$，所以${compareLabel}是${baseLabel}的 $${e624FormatNumber(value)}$ 倍。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624FindComparedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['哥哥有', '妹妹的錢是哥哥的', '元', '妹妹有多少錢'],
      ['弟弟身高', '哥哥身高是弟弟的', '公分', '哥哥身高多少公分'],
      ['杯子容量', '水壺容量是杯子的', '毫升', '水壺容量多少毫升'],
      ['紅積木有', '藍積木是紅積木的', '個', '藍積木有多少個'],
    ];
    for (let i = 0; i < count; i += 1) {
      const ratio = pickFromList(E624_RATIO_CASES.filter((item) => item.num >= item.den));
      const { base, compare } = e624BuildScaledPair(ratio);
      const [basePrefix, relation, unit, ask] = contexts[i % contexts.length];
      questions.push(`${basePrefix} $${base}$ ${unit}，${relation} $${e624RatioLatex(ratio)}$ 倍，${ask}？`);
      summaryAnswers.push(`$${compare}$ ${unit}`);
      answers.push(
        `比較量 $=\\text{基準量}\\times\\text{比值}=${base}\\times${fractionToLatex(makeFraction(ratio.num, ratio.den))}=${compare}$，所以${ask.replace('多少', '')}是 $${compare}$ ${unit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624FindBaseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['妹妹有', '妹妹的錢是哥哥的', '元', '哥哥有多少錢'],
      ['小水壺容量', '小水壺是大水壺的', '毫升', '大水壺容量多少毫升'],
      ['弟弟身高', '弟弟身高是哥哥的', '公分', '哥哥身高多少公分'],
      ['乙段繩長', '甲段是乙段的', '公分', '乙段長多少公分'],
    ];
    for (let i = 0; i < count; i += 1) {
      const ratio = pickFromList(E624_RATIO_CASES.filter((item) => item.num !== item.den));
      const { base, compare } = e624BuildScaledPair(ratio, [15, 20, 24, 30, 40, 50]);
      const [comparePrefix, relation, unit, ask] = contexts[i % contexts.length];
      questions.push(`${comparePrefix} $${compare}$ ${unit}，${relation} $${e624RatioLatex(ratio)}$ 倍，${ask}？`);
      summaryAnswers.push(`$${base}$ ${unit}`);
      answers.push(
        `基準量 $=\\text{比較量}\\div\\text{比值}=${compare}\\div${fractionToLatex(makeFraction(ratio.num, ratio.den))}=${base}$，所以${ask.replace('多少', '')}是 $${base}$ ${unit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624FractionMultiplierSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const ratios = [
      { num: 7, den: 4 },
      { num: 5, den: 3 },
      { num: 9, den: 5 },
      { num: 5, den: 6 },
      { num: 3, den: 5 },
    ];
    for (let i = 0; i < count; i += 1) {
      const ratio = ratios[i % ratios.length];
      const { base, compare } = e624BuildScaledPair(ratio, [12, 18, 24, 30, 36]);
      if (i % 2 === 0) {
        questions.push(
          `一本書已讀 $${compare}$ 頁，正好是全書總頁數的 $${e624RatioLatex(ratio)}$ 倍，這本書共有幾頁？`
        );
        summaryAnswers.push(`$${base}$ 頁`);
        answers.push(
          `全書頁數是基準量，所以總頁數 $=\\text{已讀頁數}\\div\\text{比值}=${compare}\\div${fractionToLatex(makeFraction(ratio.num, ratio.den))}=${base}$，所以全書共有 $${base}$ 頁。`
        );
      } else {
        questions.push(`弟弟身高 $${base}$ 公分，哥哥身高是弟弟的 $${e624RatioLatex(ratio)}$ 倍，哥哥身高多少公分？`);
        summaryAnswers.push(`$${compare}$ 公分`);
        answers.push(
          `哥哥身高是比較量，所以 $${base}\\times${fractionToLatex(makeFraction(ratio.num, ratio.den))}=${compare}$，因此哥哥身高是 $${compare}$ 公分。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624SumPairSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['康康', '安安', '元'],
      ['爸爸', '小安', '公斤'],
      ['紅緞帶', '藍緞帶', '公分'],
      ['男生', '女生', '人'],
    ];
    for (let i = 0; i < count; i += 1) {
      const ratio = pickFromList(E624_RATIO_CASES.filter((item) => item.num > item.den));
      const scale = pickFromList([10, 15, 20, 25, 30]);
      const base = ratio.den * scale;
      const compare = ratio.num * scale;
      const total = base + compare;
      const [bigLabel, smallLabel, unit] = contexts[i % contexts.length];
      questions.push(
        `${bigLabel}與${smallLabel}合起來共有 $${total}$ ${unit}，${bigLabel}是${smallLabel}的 $${e624RatioLatex(ratio)}$ 倍，求兩者各有多少${unit}？`
      );
      summaryAnswers.push(`${bigLabel} $${compare}$ ${unit}，${smallLabel} $${base}$ ${unit}`);
      answers.push(
        `因為 $${bigLabel}:${smallLabel}=${ratio.num}:${ratio.den}$，總共是 $${ratio.num + ratio.den}$ 份，所以每 1 份 $=${total}\\div${ratio.num + ratio.den}=${scale}$。因此 ${bigLabel} 有 $${ratio.num}\\times${scale}=${compare}$ ${unit}，${smallLabel} 有 $${ratio.den}\\times${scale}=${base}$ ${unit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624MarkupTotalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['餐點費用', '另加一成服務費', '元'],
      ['綠茶容量', '新包裝增加', '毫升'],
      ['白菜原價', '颱風後漲價', '元'],
      ['商品定價', '加價', '元'],
    ];
    for (let i = 0; i < count; i += 1) {
      const base = pickFromList([240, 320, 450, 600, 800, 1200, 2400]);
      const rate = pickFromList(E624_GROWTH_RATES);
      const total = base * (1 + rate / 100);
      const [label, wording, unit] = contexts[i % contexts.length];
      questions.push(`${label}是 $${base}$ ${unit}，${wording} $${rate}\\%$ 後，總共是多少${unit}？`);
      summaryAnswers.push(`$${e624FormatNumber(total)}$ ${unit}`);
      answers.push(
        `加成後總量 $=\\text{基準量}\\times(1+\\text{百分率})=${base}\\times(1+${rate / 100})=${e624FormatNumber(total)}$，所以結果是 $${e624FormatNumber(total)}$ ${unit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624InterestTotalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const principal = pickFromList([10000, 20000, 30000, 50000, 80000, 150000]);
      const rate = pickFromList(E624_INTEREST_RATES);
      const total = principal * (1 + rate / 100);
      questions.push(`把 $${principal}$ 元存入銀行，一年利率是 $${rate}\\%$，一年後本利和共多少元？`);
      summaryAnswers.push(`$${e624FormatNumber(total)}$ 元`);
      answers.push(
        `本利和 $=\\text{本金}\\times(1+\\text{利率})=${principal}\\times(1+${rate / 100})=${e624FormatNumber(total)}$，所以一年後共有 $${e624FormatNumber(total)}$ 元。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624ExposedTotalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const ratios = [
      { num: 2, den: 1 },
      { num: 3, den: 2 },
      { num: 5, den: 4 },
      { num: 4, den: 3 },
    ];
    for (let i = 0; i < count; i += 1) {
      const ratio = ratios[i % ratios.length];
      const exposed = pickFromList([24, 30, 36, 40, 45, 60]);
      const underwater = (exposed * ratio.num) / ratio.den;
      const total = exposed + underwater;
      questions.push(
        `一支竹竿露出水面 $${exposed}$ 公分，水中的部分是露出部分的 $${e624RatioLatex(ratio)}$ 倍，這支竹竿全長多少公分？`
      );
      summaryAnswers.push(`$${e624FormatNumber(total)}$ 公分`);
      answers.push(
        `先算水中長度：$${exposed}\\times${fractionToLatex(makeFraction(ratio.num, ratio.den))}=${e624FormatNumber(underwater)}$ 公分。全長 $=${exposed}+${e624FormatNumber(underwater)}=${e624FormatNumber(total)}$ 公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624DifferencePairSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['花圃長', '花圃寬', '公尺'],
      ['大毛月薪', '小毛月薪', '元'],
      ['甲繩長', '乙繩長', '公分'],
      ['公車座位數', '遊覽車座位數', '個'],
    ];
    for (let i = 0; i < count; i += 1) {
      const ratio = pickFromList([
        { num: 6, den: 5 },
        { num: 5, den: 4 },
        { num: 4, den: 3 },
        { num: 3, den: 2 },
      ]);
      const scale = pickFromList([8, 10, 12, 15, 20]);
      const base = ratio.den * scale;
      const compare = ratio.num * scale;
      const diff = compare - base;
      const [bigLabel, smallLabel, unit] = contexts[i % contexts.length];
      questions.push(
        `${bigLabel}是${smallLabel}的 $${e624RatioLatex(ratio)}$ 倍，兩者相差 $${diff}$ ${unit}，求兩者各是多少${unit}？`
      );
      summaryAnswers.push(`${bigLabel} $${compare}$ ${unit}，${smallLabel} $${base}$ ${unit}`);
      answers.push(
        `因為 $${bigLabel}:${smallLabel}=${ratio.num}:${ratio.den}$，相差 $${ratio.num - ratio.den}$ 份，所以每 1 份 $=${diff}\\div${ratio.num - ratio.den}=${scale}$。因此 ${bigLabel} 有 $${ratio.num}\\times${scale}=${compare}$ ${unit}，${smallLabel} 有 $${ratio.den}\\times${scale}=${base}$ ${unit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624DiscountSavedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const original = pickFromList([250, 400, 560, 800, 1200, 2500, 4500]);
      const discount = pickFromList(E624_DISCOUNT_RATES);
      const saved = (original * discount) / 100;
      questions.push(`一件商品原價是 $${original}$ 元，現在打 $${10 - discount / 10}$ 折出售，便宜了幾元？`);
      summaryAnswers.push(`$${e624FormatNumber(saved)}$ 元`);
      answers.push(
        `便宜的金額就是原價的 $${discount}\\%$，所以省下 $${original}\\times${discount / 100}=${e624FormatNumber(saved)}$ 元。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624RemainingAmountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['零用錢', '買書用掉'],
      ['果汁', '喝掉'],
      ['飼料', '用掉'],
      ['存款', '先花掉'],
    ];
    for (let i = 0; i < count; i += 1) {
      const original = pickFromList([150, 200, 360, 450, 600, 1200, 4500]);
      const used = pickFromList([20, 25, 30, 35, 40, 46]);
      const remain = (original * (100 - used)) / 100;
      const [label, action] = contexts[i % contexts.length];
      questions.push(`${label}原有 $${original}$，${action} $${used}\\%$ 後，還剩多少？`);
      summaryAnswers.push(`$${e624FormatNumber(remain)}$`);
      answers.push(
        `剩餘量 $=\\text{原量}\\times(1-\\text{用掉率})=${original}\\times(1-${used / 100})=${e624FormatNumber(remain)}$，所以還剩 $${e624FormatNumber(remain)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624DifferenceFromBaseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const ratio = pickFromList([
        { num: 7, den: 10 },
        { num: 3, den: 4 },
        { num: 4, den: 5 },
        { num: 5, den: 6 },
      ]);
      const base = pickFromList([40, 60, 80, 100, 120, 150, 200]);
      const compare = (base * ratio.num) / ratio.den;
      const diff = base - compare;
      questions.push(`牧場有牛 $${base}$ 隻，羊是牛的 $${e624RatioLatex(ratio)}$ 倍，牛比羊多幾隻？`);
      summaryAnswers.push(`$${e624FormatNumber(diff)}$ 隻`);
      answers.push(
        `先算羊有多少隻：$${base}\\times${fractionToLatex(makeFraction(ratio.num, ratio.den))}=${e624FormatNumber(compare)}$。所以牛比羊多 $${base}-${e624FormatNumber(compare)}=${e624FormatNumber(diff)}$ 隻。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624RecoverOriginalFromRemainSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const used = pickFromList([20, 25, 30, 35, 40, 50]);
      const remainFactor = 100 - used;
      const scale = pickFromList([20, 25, 30, 40, 50, 60]);
      const original = scale * 100;
      const remain = (original * remainFactor) / 100;
      questions.push(`一筆數量用掉 $${used}\\%$ 後還剩 $${remain}$，原來是多少？`);
      summaryAnswers.push(`$${original}$`);
      answers.push(
        `剩下的是原來的 $${remainFactor}\\%$，所以原量 $=\\text{剩餘量}\\div${remainFactor / 100}=${remain}\\div${remainFactor / 100}=${original}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624RecoverOriginalFromDiscountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const discount = pickFromList(E624_DISCOUNT_RATES);
      const original = pickFromList([200, 250, 400, 800, 1200, 2500]);
      const saved = (original * discount) / 100;
      questions.push(`某商品打 $${10 - discount / 10}$ 折出售後，便宜了 $${saved}$ 元，原價是多少元？`);
      summaryAnswers.push(`$${original}$ 元`);
      answers.push(
        `便宜的金額是原價的 $${discount}\\%$，所以原價 $=\\text{便宜金額}\\div${discount / 100}=${saved}\\div${discount / 100}=${original}$ 元。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624RecoverCostFromMarkupSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const rate = pickFromList([20, 25, 28, 35, 40, 60]);
      const cost = pickFromList([300, 500, 800, 1200, 1500, 3200]);
      const price = (cost * (100 + rate)) / 100;
      questions.push(`某商品以成本加 $${rate}\\%$ 作為定價，若定價是 $${price}$ 元，成本是多少元？`);
      summaryAnswers.push(`$${e624FormatNumber(cost)}$ 元`);
      answers.push(
        `定價是成本的 $${100 + rate}\\%$，所以成本 $=\\text{定價}\\div${(100 + rate) / 100}=${price}\\div${(100 + rate) / 100}=${e624FormatNumber(cost)}$ 元。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624RecoverPrincipalFromFinalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const rate = pickFromList(E624_INTEREST_RATES);
      const principal = pickFromList([10000, 20000, 30000, 50000, 80000, 93000]);
      const finalAmount = principal * (1 + rate / 100);
      questions.push(
        `銀行一年利率是 $${rate}\\%$，一年後本利和是 $${e624FormatNumber(finalAmount)}$ 元，原來存入多少元？`
      );
      summaryAnswers.push(`$${principal}$ 元`);
      answers.push(
        `本利和是本金的 $${100 + rate}\\%$，所以本金 $=\\text{本利和}\\div${1 + rate / 100}=${e624FormatNumber(finalAmount)}\\div${1 + rate / 100}=${principal}$ 元。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624ThreePartDirectSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const bRatio = pickFromList([
        { num: 2, den: 1 },
        { num: 3, den: 2 },
      ]);
      const cRatio = pickFromList([
        { num: 2, den: 3 },
        { num: 3, den: 4 },
        { num: 4, den: 5 },
      ]);
      const commonDen = lcm(bRatio.den, cRatio.den);
      const a = commonDen * pickFromList([20, 24, 30, 36, 40]);
      const b = (a * bRatio.num) / bRatio.den;
      const c = (a * cRatio.num) / cRatio.den;
      questions.push(
        `甲袋有 $${a}$ 顆糖果，乙袋是甲袋的 $${e624RatioLatex(bRatio)}$ 倍，丙袋是甲袋的 $${e624RatioLatex(cRatio)}$ 倍，求乙袋和丙袋各有幾顆？`
      );
      summaryAnswers.push(`乙 $${e624FormatNumber(b)}$ 顆，丙 $${e624FormatNumber(c)}$ 顆`);
      answers.push(
        `乙袋 $=${a}\\times${fractionToLatex(makeFraction(bRatio.num, bRatio.den))}=${e624FormatNumber(b)}$ 顆；丙袋 $=${a}\\times${fractionToLatex(makeFraction(cRatio.num, cRatio.den))}=${e624FormatNumber(c)}$ 顆。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624ThreePartTotalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const scale = pickFromList([20, 25, 30, 40]);
      const a = 3 * scale;
      const b = 2 * scale;
      const c = 4 * scale;
      const total = a + b + c;
      questions.push(`甲、乙、丙三袋積木的數量比是 $3:2:4$，三袋合起來共有 $${total}$ 個，求甲、乙、丙各有多少個？`);
      summaryAnswers.push(`甲 $${a}$ 個，乙 $${b}$ 個，丙 $${c}$ 個`);
      answers.push(
        `總份數 $=3+2+4=9$ 份，所以每 1 份 $=${total}\\div9=${scale}$。因此甲有 $3\\times${scale}=${a}$ 個，乙有 $2\\times${scale}=${b}$ 個，丙有 $4\\times${scale}=${c}$ 個。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624AgeSumMultipleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const ratios = [
      { value: 2, childChoices: [5, 6, 8, 10, 12, 15] },
      { value: 3, childChoices: [5, 6, 8, 10, 12, 15] },
      { value: 4, childChoices: [5, 6, 8, 10, 12, 15] },
      { value: 4.6, childChoices: [5, 10, 15, 20] },
      { value: 5, childChoices: [5, 6, 8, 10, 12, 15] },
    ];
    for (let i = 0; i < count; i += 1) {
      const pick = ratios[i % ratios.length];
      const ratio = pick.value;
      const child = pickFromList(pick.childChoices);
      const elder = child * ratio;
      const sum = elder + child;
      questions.push(
        `兩人的年齡和是 $${e624FormatNumber(sum)}$ 歲，長者年齡是晚輩的 $${e624FormatNumber(ratio)}$ 倍，求兩人各幾歲？`
      );
      summaryAnswers.push(`長者 $${e624FormatNumber(elder)}$ 歲，晚輩 $${child}$ 歲`);
      answers.push(
        `把晚輩當 1 份，長者是 $${e624FormatNumber(ratio)}$ 份，所以總共是 $${e624FormatNumber(1 + ratio)}$ 份。每 1 份 $=${e624FormatNumber(sum)}\\div${e624FormatNumber(1 + ratio)}=${child}$，因此晚輩 $${child}$ 歲，長者 $${child}\\times${e624FormatNumber(ratio)}=${e624FormatNumber(elder)}$ 歲。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624GeometryRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const squareSide = pickFromList([8, 9, 10, 12, 15]);
      const pentSide = pickFromList([8, 10, 12, 15]);
      const squarePerimeter = squareSide * 4;
      const pentPerimeter = pentSide * 5;
      const ratio = pentPerimeter / squarePerimeter;
      questions.push(
        `正方形邊長是 $${squareSide}$ 公分，正五邊形邊長是 $${pentSide}$ 公分，正五邊形周長是正方形周長的幾倍？`
      );
      summaryAnswers.push(`$${e624FormatNumber(ratio)}$ 倍`);
      answers.push(
        `正方形周長 $=4\\times${squareSide}=${squarePerimeter}$，正五邊形周長 $=5\\times${pentSide}=${pentPerimeter}$。比值 $=${pentPerimeter}\\div${squarePerimeter}=${e624FormatNumber(ratio)}$，所以是 $${e624FormatNumber(ratio)}$ 倍。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](4);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      summaryAnswers.push(
        Array.isArray(generated.summaryAnswers) ? generated.summaryAnswers[itemIndex] : generated.answers[itemIndex]
      );
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE624BasicMixedSet(count) {
    return buildE624MixedSet(
      [buildE624FindRatioSet, buildE624FindComparedSet, buildE624FindBaseSet, buildE624FractionMultiplierSet],
      count
    );
  }

  function buildE624SumMixedSet(count) {
    return buildE624MixedSet(
      [buildE624SumPairSet, buildE624MarkupTotalSet, buildE624InterestTotalSet, buildE624ExposedTotalSet],
      count
    );
  }

  function buildE624DifferenceMixedSet(count) {
    return buildE624MixedSet(
      [
        buildE624DifferencePairSet,
        buildE624DiscountSavedSet,
        buildE624RemainingAmountSet,
        buildE624DifferenceFromBaseSet,
      ],
      count
    );
  }

  function buildE624ReverseMixedSet(count) {
    return buildE624MixedSet(
      [
        buildE624RecoverOriginalFromRemainSet,
        buildE624RecoverOriginalFromDiscountSet,
        buildE624RecoverCostFromMarkupSet,
        buildE624RecoverPrincipalFromFinalSet,
      ],
      count
    );
  }

  function buildE624ApplicationMixedSet(count) {
    return buildE624MixedSet(
      [buildE624ThreePartDirectSet, buildE624ThreePartTotalSet, buildE624AgeSumMultipleSet, buildE624GeometryRatioSet],
      count
    );
  }

  function e625FormatNumber(value) {
    const rounded = Math.round(Number(value) * 100) / 100;
    return trimDecimalString(String(rounded));
  }

  function buildE625SumDiffBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['男生', '女生', '人'],
      ['甲數', '乙數', ''],
      ['長', '寬', '公分'],
      ['哥哥的錢', '妹妹的錢', '元'],
    ];
    for (let i = 0; i < count; i += 1) {
      const bigger = pickFromList([12, 15, 18, 20, 24, 30, 36, 42]);
      const diff = pickFromList([2, 3, 4, 5, 6, 8, 10]);
      const smaller = bigger - diff;
      const sum = bigger + smaller;
      const [bigLabel, smallLabel, unit] = contexts[i % contexts.length];
      questions.push(
        `${bigLabel}和${smallLabel}合起來共 $${sum}$ ${unit}，${bigLabel}比${smallLabel}多 $${diff}$ ${unit}，求兩者各是多少${unit}？`
      );
      summaryAnswers.push(`${bigLabel} $${bigger}$ ${unit}，${smallLabel} $${smaller}$ ${unit}`);
      answers.push(
        `較小的是 $(${sum}-${diff})\\div2=${smaller}$，較大的是 $${smaller}+${diff}=${bigger}$。所以 ${bigLabel} 是 $${bigger}$ ${unit}，${smallLabel} 是 $${smaller}$ ${unit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625TransferEqualSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['哥哥', '弟弟', '元'],
      ['甲罐', '乙罐', '顆'],
      ['大桶', '小桶', '毫升'],
      ['姐姐', '妹妹', '點'],
    ];
    for (let i = 0; i < count; i += 1) {
      const transfer = pickFromList([5, 6, 7, 8, 10, 11, 12]);
      const smaller = pickFromList([24, 30, 36, 40, 45, 50, 60]);
      const bigger = smaller + 2 * transfer;
      const [bigLabel, smallLabel, unit] = contexts[i % contexts.length];
      questions.push(
        `${bigLabel}有 $${bigger}$ ${unit}，${smallLabel}有 $${smaller}$ ${unit}。若${bigLabel}拿出 $${transfer}$ ${unit}給${smallLabel}，兩人就一樣多。要問原來各有多少${unit}。`
      );
      summaryAnswers.push(`${bigLabel} $${bigger}$ ${unit}，${smallLabel} $${smaller}$ ${unit}`);
      answers.push(
        `拿出 $${transfer}$ ${unit}後會相等，表示原來兩者相差 $2\\times${transfer}=${2 * transfer}$ ${unit}。已知較少的是 $${smaller}$ ${unit}，所以較多的是 $${smaller}+${2 * transfer}=${bigger}$ ${unit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625RectangleSumDiffSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const width = pickFromList([20, 24, 28, 30, 35, 40, 45]);
      const diff = pickFromList([4, 6, 8, 10, 12]);
      const length = width + diff;
      const perimeter = 2 * (length + width);
      const sum = perimeter / 2;
      questions.push(`一個長方形周長是 $${perimeter}$ 公分，長比寬多 $${diff}$ 公分，求長與寬各是多少公分？`);
      summaryAnswers.push(`長 $${length}$ 公分，寬 $${width}$ 公分`);
      answers.push(
        `因為長加寬 $=\\frac{${perimeter}}{2}=${sum}$。又長比寬多 $${diff}$，所以寬 $=(${sum}-${diff})\\div2=${width}$，長 $=${width}+${diff}=${length}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625BalanceReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['爸爸', '媽媽', '點'],
      ['大杯', '小杯', '毫升'],
      ['大桶', '小桶', '顆'],
      ['哥哥', '弟弟', '元'],
    ];
    for (let i = 0; i < count; i += 1) {
      const smaller = pickFromList([18, 24, 30, 36, 40, 45, 50]);
      const transfer = pickFromList([4, 5, 6, 7, 8, 10]);
      const bigger = smaller + 2 * transfer;
      const [bigLabel, smallLabel, unit] = contexts[i % contexts.length];
      questions.push(
        `若${bigLabel}拿出 $${transfer}$ ${unit}給${smallLabel}，兩邊就會一樣多。已知${bigLabel}原來有 $${bigger}$ ${unit}，求${smallLabel}原來有多少${unit}？`
      );
      summaryAnswers.push(`$${smaller}$ ${unit}`);
      answers.push(
        `能夠拿出 $${transfer}$ ${unit}後相等，代表原來相差 $${2 * transfer}$ ${unit}。所以${smallLabel}原有 $${bigger}-${2 * transfer}=${smaller}$ ${unit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625AgeFutureMultipleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const ratios = [2, 3, 4, 5];
    for (let i = 0; i < count; i += 1) {
      const ratio = ratios[i % ratios.length];
      const childFuture = pickFromList([6, 8, 9, 10, 12, 15]);
      const years = pickFromList([1, 2, 3, 4, 5]);
      const childNow = childFuture - years;
      const adultNow = ratio * childFuture - years;
      if (childNow <= 0) {
        i -= 1;
        continue;
      }
      questions.push(`今年媽媽 $${adultNow}$ 歲，女兒 $${childNow}$ 歲，幾年後媽媽的年齡會是女兒的 $${ratio}$ 倍？`);
      summaryAnswers.push(`$${years}$ 年後`);
      answers.push(
        `設 $x$ 年後媽媽年齡是女兒的 $${ratio}$ 倍，則 $${adultNow}+x=${ratio}(${childNow}+x)$。整理得 $x=${years}$，所以是 $${years}$ 年後。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625AgePastMultipleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const ratios = [3, 4, 5, 6];
    for (let i = 0; i < count; i += 1) {
      const ratio = ratios[i % ratios.length];
      const childPast = pickFromList([3, 4, 5, 6, 7, 8]);
      const years = pickFromList([2, 3, 4, 5, 6, 7]);
      const childNow = childPast + years;
      const adultNow = ratio * childPast + years;
      questions.push(`叔叔今年 $${adultNow}$ 歲，小智 $${childNow}$ 歲，幾年前叔叔的年齡是小智的 $${ratio}$ 倍？`);
      summaryAnswers.push(`$${years}$ 年前`);
      answers.push(
        `往回推 $x$ 年時，兩人年齡分別是 $${adultNow}-x$、$${childNow}-x$。依題意 $${adultNow}-x=${ratio}(${childNow}-x)$，解得 $x=${years}$，所以是 $${years}$ 年前。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625AgeFutureConditionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const ratios = [2, 3, 4];
    for (let i = 0; i < count; i += 1) {
      const ratio = ratios[i % ratios.length];
      const years = pickFromList([2, 3, 4, 5]);
      const childFuture = pickFromList([9, 10, 12, 15, 18]);
      const adultNow = ratio * childFuture - years;
      const childNow = childFuture - years;
      questions.push(`爸爸今年 $${adultNow}$ 歲，$${years}$ 年後爸爸的年齡會是小雲的 $${ratio}$ 倍，小雲現在幾歲？`);
      summaryAnswers.push(`$${childNow}$ 歲`);
      answers.push(
        `$${years}$ 年後小雲的年齡應是 $(${adultNow}+${years})\\div${ratio}=${childFuture}$ 歲，所以現在是 $${childFuture}-${years}=${childNow}$ 歲。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625AgeDiffMultipleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const ratios = [3, 4, 5, 6];
    for (let i = 0; i < count; i += 1) {
      const ratio = ratios[i % ratios.length];
      const childWhen = pickFromList([4, 5, 6, 7, 8]);
      const diff = (ratio - 1) * childWhen;
      const adultNow = childWhen * ratio + pickFromList([8, 10, 12, 15]);
      const childNow = adultNow - diff;
      questions.push(
        `兩人相差 $${diff}$ 歲，當大人的年齡是小孩的 $${ratio}$ 倍時，小孩是 $${childWhen}$ 歲。若大人現在 $${adultNow}$ 歲，小孩現在幾歲？`
      );
      summaryAnswers.push(`$${childNow}$ 歲`);
      answers.push(`年齡差固定為 $${diff}$ 歲，所以現在小孩年齡 $=${adultNow}-${diff}=${childNow}$ 歲。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625ChickenRabbitLegSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['雞', '兔', 2, 4, '隻', '腳'],
      ['三輪車', '自行車', 3, 2, '輛', '輪'],
      ['四輪汽車', '六輪貨車', 4, 6, '輛', '輪'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [aLabel, bLabel, aUnit, bUnit, itemUnit, totalUnit] = contexts[i % contexts.length];
      const aCount = pickFromList([4, 5, 6, 7, 8, 9, 10, 12]);
      const bCount = pickFromList([3, 4, 5, 6, 7, 8, 9]);
      const totalCount = aCount + bCount;
      const totalFoot = aCount * aUnit + bCount * bUnit;
      questions.push(
        `某處有${aLabel}和${bLabel}共 $${totalCount}$ ${itemUnit}，合起來共有 $${totalFoot}$ ${totalUnit}，求${aLabel}與${bLabel}各有幾${itemUnit}？`
      );
      summaryAnswers.push(`${aLabel} $${aCount}$ ${itemUnit}，${bLabel} $${bCount}$ ${itemUnit}`);
      answers.push(
        `先全部假設成${aLabel}，則共有 $${totalCount}\\times${aUnit}=${totalCount * aUnit}$ ${totalUnit}。實際多出 $${totalFoot - totalCount * aUnit}$ ${totalUnit}，每把 1 ${aLabel}改成 1 ${bLabel} 會多 $${bUnit - aUnit}$ ${totalUnit}，所以 ${bLabel} 有 $(${totalFoot - totalCount * aUnit})\\div${bUnit - aUnit}=${bCount}$ ${itemUnit}，${aLabel} 有 $${totalCount}-${bCount}=${aCount}$ ${itemUnit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625ChickenRabbitMoneySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['10元硬幣', '50元硬幣', 10, 50, '枚', '元'],
      ['全票', '優待票', 30, 15, '張', '元'],
      ['1元郵票', '5元郵票', 1, 5, '張', '元'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [aLabel, bLabel, aValue, bValue, itemUnit, totalUnit] = contexts[i % contexts.length];
      const aCount = pickFromList([6, 7, 8, 10, 12, 15, 18, 22]);
      const bCount = pickFromList([4, 5, 6, 7, 8, 10, 12, 13]);
      const totalCount = aCount + bCount;
      const totalAmount = aCount * aValue + bCount * bValue;
      questions.push(
        `${aLabel}和${bLabel}共 $${totalCount}$ ${itemUnit}，合起來是 $${totalAmount}$ ${totalUnit}，求兩種各有幾${itemUnit}？`
      );
      summaryAnswers.push(`${aLabel} $${aCount}$ ${itemUnit}，${bLabel} $${bCount}$ ${itemUnit}`);
      answers.push(
        `先全部假設成${aLabel}，總金額會是 $${totalCount}\\times${aValue}=${totalCount * aValue}$ ${totalUnit}。實際多出 $${totalAmount - totalCount * aValue}$ ${totalUnit}，每把 1 ${aLabel}改成 1 ${bLabel} 會多 $${bValue - aValue}$ ${totalUnit}，所以 ${bLabel} 有 $(${totalAmount - totalCount * aValue})\\div${bValue - aValue}=${bCount}$ ${itemUnit}，${aLabel} 有 $${aCount}$ ${itemUnit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625ChickenRabbitScoreSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['選擇題', '填充題', 2, 3, '題', '分'],
      ['排骨便當', '鮭魚便當', 80, 100, '個', '元'],
      ['烏龍茶', '綠茶', 700, 600, '斤', '元'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [aLabel, bLabel, aValue, bValue, itemUnit, totalUnit] = contexts[i % contexts.length];
      const aCount = pickFromList([8, 10, 12, 15, 18, 20, 22, 23]);
      const bCount = pickFromList([3, 4, 5, 6, 7, 8, 10, 12]);
      const totalCount = aCount + bCount;
      const totalAmount = aCount * aValue + bCount * bValue;
      questions.push(
        `${aLabel}和${bLabel}共 $${totalCount}$ ${itemUnit}，合起來是 $${totalAmount}$ ${totalUnit}，求兩種各有幾${itemUnit}？`
      );
      summaryAnswers.push(`${aLabel} $${aCount}$ ${itemUnit}，${bLabel} $${bCount}$ ${itemUnit}`);
      const lowerLabel = aValue < bValue ? aLabel : bLabel;
      const higherLabel = aValue < bValue ? bLabel : aLabel;
      const lowerValue = Math.min(aValue, bValue);
      const higherValue = Math.max(aValue, bValue);
      const higherCount = aValue < bValue ? bCount : aCount;
      const lowerCount = totalCount - higherCount;
      answers.push(
        `先全部假設成${lowerLabel}，總量會是 $${totalCount}\\times${lowerValue}=${totalCount * lowerValue}$ ${totalUnit}。實際多出 $${totalAmount - totalCount * lowerValue}$ ${totalUnit}，每換成 1 個${higherLabel}會多 $${higherValue - lowerValue}$ ${totalUnit}，所以 ${higherLabel} 有 $(${totalAmount - totalCount * lowerValue})\\div${higherValue - lowerValue}=${higherCount}$ ${itemUnit}，${lowerLabel} 有 $${lowerCount}$ ${itemUnit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625AverageMissingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const totalDays = 5;
      const avg = pickFromList([100, 110, 120, 130, 150]);
      const known = avg + pickFromList([-16, -8, 0, 8, 16]);
      const remainAvg = (avg * totalDays - known) / 4;
      questions.push(
        `某店 $${totalDays}$ 天平均每天賣 $${avg}$ 個，已知第一天賣 $${known}$ 個，其餘 $4$ 天平均每天賣幾個？`
      );
      summaryAnswers.push(`$${e625FormatNumber(remainAvg)}$ 個`);
      answers.push(
        `$${totalDays}$ 天總數 $=${avg}\\times${totalDays}=${avg * totalDays}$ 個。扣掉第一天後剩 $${avg * totalDays - known}$ 個，再除以 $4$，得其餘四天平均是 $${e625FormatNumber(remainAvg)}$ 個。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625AverageTargetSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const prevCount = 3;
      const prevAvg = pickFromList([600, 800, 900, 1000, 1100]);
      const targetAvg = prevAvg - pickFromList([80, 100, 120, 150, 200]);
      const nextValue = targetAvg * 4 - prevAvg * prevCount;
      questions.push(
        `前 $${prevCount}$ 次平均是 $${prevAvg}$，若要讓前 $4$ 次平均變成 $${targetAvg}$，第 $4$ 次需要是多少？`
      );
      summaryAnswers.push(`$${nextValue}$`);
      answers.push(
        `前 $4$ 次總和應為 $${targetAvg}\\times4=${targetAvg * 4}$。前 $3$ 次總和是 $${prevAvg}\\times3=${prevAvg * 3}$，所以第 $4$ 次要是 $${targetAvg * 4}-${prevAvg * 3}=${nextValue}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625AverageMergeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const boys = pickFromList([4, 5, 6, 8]);
      const girls = pickFromList([3, 4, 5, 6]);
      const boysAvg = pickFromList([28, 30, 32, 33, 35, 36]);
      const totalAvg = pickFromList([26, 27, 28, 29, 30, 31]);
      const girlsAvg = ((boys + girls) * totalAvg - boys * boysAvg) / girls;
      if (!Number.isInteger(girlsAvg) || girlsAvg <= 0) {
        i -= 1;
        continue;
      }
      questions.push(
        `${boys} 位男生平均成績是 $${boysAvg}$ 分，再加入 ${girls} 位女生後，全班 ${boys + girls} 人平均變成 $${totalAvg}$ 分，求女生平均幾分？`
      );
      summaryAnswers.push(`$${girlsAvg}$ 分`);
      answers.push(
        `全班總分 $=${boys + girls}\\times${totalAvg}=${(boys + girls) * totalAvg}$，男生總分 $=${boys}\\times${boysAvg}=${boys * boysAvg}$，所以女生總分是 $${(boys + girls) * totalAvg - boys * boysAvg}$，再除以 ${girls} 得女生平均 $${girlsAvg}$ 分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625AverageSubjectSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const beforeSubjects = 3;
      const beforeAvg = pickFromList([78, 80, 82, 84, 86]);
      const addedSubjects = 2;
      const afterAvg = beforeAvg + pickFromList([1, 2, 3, 4]);
      const addedTotal = afterAvg * (beforeSubjects + addedSubjects) - beforeAvg * beforeSubjects;
      questions.push(
        `國、數、社三科平均 $${beforeAvg}$ 分，加入兩科後五科平均變成 $${afterAvg}$ 分，後面兩科合計幾分？`
      );
      summaryAnswers.push(`$${addedTotal}$ 分`);
      answers.push(
        `原本三科總分 $=${beforeSubjects}\\times${beforeAvg}=${beforeSubjects * beforeAvg}$，五科總分 $=5\\times${afterAvg}=${5 * afterAvg}$，所以新增兩科合計 $=${5 * afterAvg}-${beforeSubjects * beforeAvg}=${addedTotal}$ 分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625AdditionChoiceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['書架上有', '本不同繪本', '本不同小說', '從中選 1 本拿走'],
      ['飲料店有', '種冷飲', '種熱飲', '任選 1 杯'],
      ['早餐店有', '種主餐', '種單點', '任選 1 份'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [prefix, aText, bText, action] = contexts[i % contexts.length];
      const a = pickFromList([3, 4, 5, 6, 7]);
      const b = pickFromList([2, 3, 4, 5, 6]);
      const total = a + b;
      questions.push(`${prefix} $${a}$ ${aText}和 $${b}$ ${bText}，${action}，共有幾種選法？`);
      summaryAnswers.push(`$${total}$ 種`);
      answers.push(`這是分類單選，從前一類選 1 個或從後一類選 1 個，所以用加法原理：$${a}+${b}=${total}$ 種。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625MultiplicationPairSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['漢堡店有', '種漢堡', '種飲料', '各選 1 種搭配'],
      ['服飾店有', '件上衣', '條褲子', '挑選一套'],
      ['甜點店有', '種蛋糕', '種飲料', '各選 1 份'],
    ];
    for (let i = 0; i < count; i += 1) {
      const [prefix, aText, bText, action] = contexts[i % contexts.length];
      const a = pickFromList([3, 4, 5, 6]);
      const b = pickFromList([2, 3, 4, 5]);
      const total = a * b;
      questions.push(`${prefix} $${a}$ ${aText}和 $${b}$ ${bText}，${action}，共有幾種不同方式？`);
      summaryAnswers.push(`$${total}$ 種`);
      answers.push(
        `這是分步搭配，第一步有 $${a}$ 種，第二步有 $${b}$ 種，所以用乘法原理：$${a}\\times${b}=${total}$ 種。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625RouteSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const first = pickFromList([2, 3, 4, 5]);
      const second = pickFromList([2, 3, 4, 5]);
      const total = first * second;
      questions.push(
        `從甲地到乙地有 $${first}$ 條路，從乙地到丙地有 $${second}$ 條路。若必須經過乙地，從甲到丙共有幾種走法？`
      );
      summaryAnswers.push(`$${total}$ 種`);
      answers.push(
        `先選甲到乙的路，再選乙到丙的路，兩步彼此獨立，所以共有 $${first}\\times${second}=${total}$ 種走法。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625EntryExitSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const doors = pickFromList([4, 5, 6, 7]);
      const total = doors * (doors - 1);
      questions.push(`某地共有 $${doors}$ 個入口，從任一個口進入後，必須由其他出口離開，共有幾種進出方式？`);
      summaryAnswers.push(`$${total}$ 種`);
      answers.push(
        `先選入口有 $${doors}$ 種，出口不能和入口相同，所以有 $${doors - 1}$ 種。依乘法原理共有 $${doors}\\times${doors - 1}=${total}$ 種。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625DigitRestrictionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      {
        digits: [0, 1, 2, 3, 4, 5],
        repeat: true,
        ask: '偶數',
        resultFn(set) {
          return (set.length - 1) * 2 + (set.includes(0) ? 1 : 0);
        },
      },
      {
        digits: [0, 1, 2, 3, 4],
        repeat: true,
        ask: '奇數',
        resultFn(set) {
          return (set.length - 1) * 2;
        },
      },
      {
        digits: [0, 2, 3, 5],
        repeat: false,
        ask: '5 的倍數',
        resultFn() {
          return 5;
        },
      },
      {
        digits: [0, 2, 3, 5],
        repeat: false,
        ask: '小於 52',
        resultFn() {
          return 7;
        },
      },
    ];
    for (let i = 0; i < count; i += 1) {
      const item = cases[i % cases.length];
      const setText = item.digits.join('、');
      if (item.ask === '偶數') {
        const total = item.resultFn(item.digits);
        questions.push(`用「${setText}」排出二位數，數字可以重複使用，可以排出幾種偶數？`);
        summaryAnswers.push(`$${total}$ 種`);
        answers.push(`個位要是偶數，可選 $0、2、4$ 共 3 種；十位不能是 0，所以分情況算得共有 $${total}$ 種。`);
      } else if (item.ask === '奇數') {
        const total = item.resultFn(item.digits);
        questions.push(`用「${setText}」排出二位數，數字可以重複使用，可以排出幾種奇數？`);
        summaryAnswers.push(`$${total}$ 種`);
        answers.push(`個位要是奇數，可選 $1、3$ 共 2 種；十位不能是 0，有 4 種，所以共有 $4\\times2=${total}$ 種。`);
      } else if (item.ask === '5 的倍數') {
        questions.push(`用「${setText}」排出數字不重複的二位數，是 $5$ 的倍數的有幾種？`);
        summaryAnswers.push(`$5$ 種`);
        answers.push(`二位數是 5 的倍數，個位只能是 0 或 5。分兩種情況列出後共有 $5$ 種。`);
      } else {
        questions.push(`用「${setText}」排出數字不重複的二位數，其中小於 $52$ 的有幾種？`);
        summaryAnswers.push(`$7$ 種`);
        answers.push(`先看十位能不能是 0，再依十位是 2、3、5 分類比較大小，整理後共有 $7$ 種。`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](4);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      summaryAnswers.push(
        Array.isArray(generated.summaryAnswers) ? generated.summaryAnswers[itemIndex] : generated.answers[itemIndex]
      );
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE625SumDiffMixedSet(count) {
    return buildE625MixedSet(
      [buildE625SumDiffBasicSet, buildE625TransferEqualSet, buildE625RectangleSumDiffSet, buildE625BalanceReverseSet],
      count
    );
  }

  function buildE625AgeMixedSet(count) {
    return buildE625MixedSet(
      [
        buildE625AgeFutureMultipleSet,
        buildE625AgePastMultipleSet,
        buildE625AgeFutureConditionSet,
        buildE625AgeDiffMultipleSet,
      ],
      count
    );
  }

  function buildE625ChickenRabbitMixedSet(count) {
    return buildE625MixedSet(
      [buildE625ChickenRabbitLegSet, buildE625ChickenRabbitMoneySet, buildE625ChickenRabbitScoreSet],
      count
    );
  }

  function buildE625AverageMixedSet(count) {
    return buildE625MixedSet(
      [buildE625AverageMissingSet, buildE625AverageTargetSet, buildE625AverageMergeSet, buildE625AverageSubjectSet],
      count
    );
  }

  function buildE625PrincipleMixedSet(count) {
    return buildE625MixedSet(
      [
        buildE625AdditionChoiceSet,
        buildE625MultiplicationPairSet,
        buildE625RouteSet,
        buildE625EntryExitSet,
        buildE625DigitRestrictionSet,
      ],
      count
    );
  }

  // ── e6-2-5 新增練習：一元一次方程各類型 ─────────────────────────────────

  // 1. 整係數方程（ax+b=c 基礎；ax+b=cx+d 進階）
  function buildE625LinearIntCoefSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const a = pickFromList([2, 3, 4, 5, 6]);
        const x = pickFromList([3, 4, 5, 6, 7, 8, 9]);
        const b = pickFromList([2, 3, 4, 5, 6, 8]);
        const c = a * x + b;
        questions.push(`解方程：$${a}x + ${b} = ${c}$`);
        summaryAnswers.push(`$x = ${x}$`);
        answers.push(
          `移項：$${a}x = ${c} - ${b} = ${a * x}$，兩邊除以 $${a}$，得 $x = ${x}$。`
        );
      } else {
        const diffCoef = pickFromList([2, 3, 4]);
        const cCoef = pickFromList([1, 2, 3]);
        const aCoef = cCoef + diffCoef;
        const x = pickFromList([2, 3, 4, 5, 6, 7]);
        const b = pickFromList([2, 3, 4, 5]);
        const d = b + diffCoef * x;
        questions.push(`解方程：$${aCoef}x + ${b} = ${cCoef}x + ${d}$`);
        summaryAnswers.push(`$x = ${x}$`);
        answers.push(
          `移項合併：$(${aCoef} - ${cCoef})x = ${d} - ${b}$，即 $${diffCoef}x = ${diffCoef * x}$，得 $x = ${x}$。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  // 2. 分數係數方程（(1/q)x + b = c）
  function buildE625LinearFracCoefSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const q = pickFromList([2, 3, 4, 5]);
      const diff = pickFromList([2, 3, 4, 5, 6, 7]);
      const b = pickFromList([2, 3, 4, 5, 6]);
      const c = b + diff;
      const x = q * diff;
      questions.push(
        `某數的 $\\frac{1}{${q}}$ 加上 $${b}$ 等於 $${c}$，求這個數。`
      );
      summaryAnswers.push(`$x = ${x}$`);
      answers.push(
        `設此數為 $x$。列式：$\\frac{1}{${q}}x + ${b} = ${c}$，移項：$\\frac{x}{${q}} = ${diff}$，所以 $x = ${q} \\times ${diff} = ${x}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 3. 括號分式方程（(x+b)/c=d 基礎；(2x-b)/c=d 進階）
  function buildE625LinearBracketFracSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const c = pickFromList([2, 3, 4, 5]);
        const d = pickFromList([4, 5, 6, 7, 8, 9]);
        const b = pickFromList([2, 3, 4, 5, 6]);
        const raw = c * d - b;
        const x = raw > 0 ? raw : c * d - 1;
        const bUsed = raw > 0 ? b : 1;
        questions.push(`解方程：$\\frac{x + ${bUsed}}{${c}} = ${d}$`);
        summaryAnswers.push(`$x = ${x}$`);
        answers.push(
          `兩邊乘以 $${c}$：$x + ${bUsed} = ${c * d}$，移項得 $x = ${c * d} - ${bUsed} = ${x}$。`
        );
      } else {
        // (2x - b)/c = d，需 c*d + b 為偶數 → c 取偶數，b 取偶數
        const c = pickFromList([2, 4, 6]);
        const d = pickFromList([3, 4, 5, 6, 7]);
        const b = pickFromList([2, 4, 6, 8, 10]);
        const twoX = c * d + b;
        const x = twoX / 2;
        questions.push(`解方程：$\\frac{2x - ${b}}{${c}} = ${d}$`);
        summaryAnswers.push(`$x = ${x}$`);
        answers.push(
          `兩邊乘以 $${c}$：$2x - ${b} = ${c * d}$，移項：$2x = ${c * d} + ${b} = ${twoX}$，所以 $x = ${x}$。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  // 4. 通分型方程應用（x/a + x/b = total 情境包裝）
  function buildE625LinearFracMergeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // pair (3,6): 1/3+1/6=1/2，x=2*total
    // pair (2,6): 1/2+1/6=2/3，x=3*total/2，total需為偶數
    const ctxTemplates = [
      (a, b, total) =>
        `一段路，小明先走了全程的 $\\frac{1}{${a}}$，再走了全程的 $\\frac{1}{${b}}$，共走了 $${total}$ 公里。這段路全長多少公里？`,
      (a, b, total) =>
        `看一本書，第一天看了全書的 $\\frac{1}{${a}}$，第二天看了全書的 $\\frac{1}{${b}}$，兩天共看了 $${total}$ 頁。全書有多少頁？`,
      (a, b, total) =>
        `一桶水，第一次用掉了 $\\frac{1}{${a}}$ 桶，第二次用掉了 $\\frac{1}{${b}}$ 桶，共用了 $${total}$ 公升。這桶水共有多少公升？`,
    ];
    const unitWords = ['公里', '頁', '公升'];
    for (let i = 0; i < count; i += 1) {
      let pa, pb, lcm, numA, numB, sumNum, total, x;
      if (i % 2 === 0) {
        pa = 3; pb = 6; lcm = 6; numA = 2; numB = 1; sumNum = 3;
        total = pickFromList([5, 6, 7, 8, 9, 10, 12]);
        x = 2 * total;
      } else {
        pa = 2; pb = 6; lcm = 6; numA = 3; numB = 1; sumNum = 4;
        total = pickFromList([4, 6, 8, 10, 12]);
        x = 3 * total / 2;
      }
      const unit = unitWords[i % unitWords.length];
      questions.push(ctxTemplates[i % ctxTemplates.length](pa, pb, total));
      summaryAnswers.push(`$${x}$ ${unit}`);
      answers.push(
        `設全程（或總量）為 $x$ ${unit}。列式：$\\frac{x}{${pa}} + \\frac{x}{${pb}} = ${total}$，通分（公分母 $${lcm}$）：$\\frac{${numA}x + ${numB}x}{${lcm}} = ${total}$，化簡 $\\frac{${sumNum}x}{${lcm}} = ${total}$，解得 $x = ${total} \\times \\frac{${lcm}}{${sumNum}} = ${x}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 5. 分配求總量（ax + r = T，每組分 a 個剩 r 個）
  function buildE625DistributeRemainSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['顆糖果', '個小朋友', '每人', '顆', '多出', '顆'],
      ['本書', '位同學', '每人', '本', '還剩', '本'],
      ['支鉛筆', '個信封', '每封', '支', '剩', '支'],
      ['個橘子', '個盤子', '每盤', '個', '多', '個'],
    ];
    for (let i = 0; i < count; i += 1) {
      const a = pickFromList([3, 4, 5, 6, 7]);
      const r = pickFromList([1, 2, 3]);
      const x = pickFromList([5, 6, 7, 8, 9, 10]);
      const T = a * x + r;
      const [itemLabel, groupLabel, perWord, perUnit, remainWord, remainUnit] = contexts[i % contexts.length];
      questions.push(
        `有 $${T}$ ${itemLabel}，平均分給若干${groupLabel}，${perWord}分 $${a}$ ${perUnit}後${remainWord} $${r}$ ${remainUnit}。請問有幾個${groupLabel}？`
      );
      summaryAnswers.push(`$${x}$ 個${groupLabel}`);
      answers.push(
        `設有 $x$ 個${groupLabel}。列式：$${a}x + ${r} = ${T}$，移項：$${a}x = ${T - r}$，所以 $x = ${T - r} \\div ${a} = ${x}$。共有 $${x}$ 個${groupLabel}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 6. 找零求單價與數量（n×p ± change = total 情境）
  function buildE625PriceChangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const items = ['鉛筆', '橡皮擦', '本子', '尺', '糖果'];
    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        // 買 n 個付 total 找 change，求單價 p
        const n = pickFromList([2, 3, 4, 5, 6]);
        const p = pickFromList([3, 4, 5, 6, 7, 8, 9, 10]);
        const change = pickFromList([1, 2, 3, 4, 5]);
        const total = n * p + change;
        const item = items[i % items.length];
        questions.push(
          `小明買了 $${n}$ 支${item}，付了 $${total}$ 元，找回 $${change}$ 元。每支${item}多少元？`
        );
        summaryAnswers.push(`每支 $${p}$ 元`);
        answers.push(
          `設每支${item} $x$ 元。實際花費 $${total} - ${change} = ${n * p}$ 元，列式：$${n}x = ${n * p}$，所以 $x = ${p}$。每支${item} $${p}$ 元。`
        );
      } else {
        // 知道單價與總金額，求數量
        const p = pickFromList([4, 5, 6, 7, 8, 9, 10]);
        const n = pickFromList([3, 4, 5, 6, 7, 8]);
        const total = n * p;
        const item = items[(i + 1) % items.length];
        questions.push(
          `每支${item}售價 $${p}$ 元，小明共花了 $${total}$ 元買${item}。請問他買了幾支${item}？`
        );
        summaryAnswers.push(`$${n}$ 支`);
        answers.push(
          `設買了 $x$ 支${item}。列式：$${p}x = ${total}$，所以 $x = ${total} \\div ${p} = ${n}$。共買了 $${n}$ 支。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  // 7. 先用後分型（(x - a) / n = b，求原量）
  function buildE625ConsumeThenShareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['糖果', '個', '先拿走', '再平分給', '位同學', '位'],
      ['書', '本', '先取出', '再平均分給', '組', '組'],
      ['貼紙', '張', '先拿走', '再平分給', '個小朋友', '個'],
      ['蘋果', '顆', '先挑走', '再平均放入', '個籃子', '個'],
    ];
    for (let i = 0; i < count; i += 1) {
      const n = pickFromList([2, 3, 4, 5, 6]);
      const b = pickFromList([3, 4, 5, 6, 7, 8, 9]);
      const a = pickFromList([2, 3, 4, 5, 6, 8, 10]);
      const x = n * b + a;
      const [thing, unit, verb1, verb2, groupLabel, groupUnit] = contexts[i % contexts.length];
      questions.push(
        `有一些${thing}，${verb1} $${a}$ ${unit}後，${verb2} $${n}$ ${groupLabel}，每${groupUnit}分到 $${b}$ ${unit}。原來有多少${unit}？`
      );
      summaryAnswers.push(`$${x}$ ${unit}`);
      answers.push(
        `設原來有 $x$ ${unit}。列式：$\\frac{x - ${a}}{${n}} = ${b}$，兩邊乘以 $${n}$：$x - ${a} = ${n * b}$，移項得 $x = ${n * b} + ${a} = ${x}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 8. 盈虧問題（兩情境設方程求人數）
  function buildE625SurplusDeficitSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['學生', '位', '糖果', '顆'],
      ['小朋友', '位', '橘子', '個'],
      ['同學', '位', '鉛筆', '支'],
      ['學生', '位', '書', '本'],
    ];
    for (let i = 0; i < count; i += 1) {
      // 每人分 a 個多 surplus；每人分 a+1 個差 deficit
      // (a+1)*n - deficit = a*n + surplus → n = surplus + deficit
      const surplus = pickFromList([2, 3, 4, 5, 6, 7]);
      const deficit = pickFromList([1, 2, 3, 4, 5]);
      const n = surplus + deficit;
      const a = pickFromList([3, 4, 5]);
      const b = a + 1;
      const [personLabel, personUnit, thingLabel, thingUnit] = contexts[i % contexts.length];
      questions.push(
        `分${thingLabel}，每${personUnit}分 $${a}$ ${thingUnit}多出 $${surplus}$ ${thingUnit}；每${personUnit}分 $${b}$ ${thingUnit}少 $${deficit}$ ${thingUnit}。請問有幾位${personLabel}？`
      );
      summaryAnswers.push(`$${n}$ ${personUnit}`);
      answers.push(
        `設有 $x$ ${personUnit}。每${personUnit}分 $${a}$ ${thingUnit}時總數 $= ${a}x + ${surplus}$；每${personUnit}分 $${b}$ ${thingUnit}時總數 $= ${b}x - ${deficit}$。列式：$${a}x + ${surplus} = ${b}x - ${deficit}$，移項：$${deficit} + ${surplus} = ${b}x - ${a}x$，即 $${surplus + deficit} = x$，所以共有 $${n}$ ${personUnit}${personLabel}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 9. 分數消耗求原量（(1 - p/q)x = r）
  function buildE625FractionConsumeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      ['水箱', '水', '公升', '用掉了'],
      ['糖果袋', '糖果', '顆', '吃掉了'],
      ['存錢筒', '零用錢', '元', '花掉了'],
      ['書架上的', '書', '本', '借走了'],
    ];
    const fracList = [
      [1, 3], [1, 4], [1, 5], [2, 5], [1, 6], [3, 5], [2, 3], [3, 4],
    ];
    for (let i = 0; i < count; i += 1) {
      const [p, q] = fracList[i % fracList.length];
      const qMinusP = q - p;
      const rMultiple = pickFromList([2, 3, 4, 5, 6]);
      const r = rMultiple * qMinusP;
      const x = rMultiple * q;
      const [container, thing, unit, verbUsed] = contexts[i % contexts.length];
      questions.push(
        `${container}裡原來有一些${thing}，${verbUsed}了 $\\frac{${p}}{${q}}$ 後，還剩 $${r}$ ${unit}。原來有多少${unit}？`
      );
      summaryAnswers.push(`$${x}$ ${unit}`);
      answers.push(
        `設原來有 $x$ ${unit}。${verbUsed}了 $\\frac{${p}}{${q}}$，剩下 $\\left(1 - \\frac{${p}}{${q}}\\right)x = \\frac{${qMinusP}}{${q}}x = ${r}$，所以 $x = ${r} \\times \\frac{${q}}{${qMinusP}} = ${x}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // ── e6-2-5 新增練習結束 ──────────────────────────────────────────────────

  function e626FormatNumber(value) {
    if (Number.isInteger(value)) {
      return `${value}`;
    }
    return `${Number(value.toFixed(2))}`;
  }

  function e626PercentText(value) {
    return `${e626FormatNumber(value)}\\%`;
  }

  function e626AngleText(value) {
    return `${e626FormatNumber(value)}^\\circ`;
  }

  function buildE626Distribution(labels, percents, total) {
    return labels.map((label, index) => ({
      label,
      percent: percents[index],
      count: (total * percents[index]) / 100,
    }));
  }

  function buildE626CountToPercentSet(count) {
    const labelBanks = [
      ['童話', '科學', '漫畫', '其他'],
      ['蘋果', '香蕉', '鳳梨', '西瓜'],
      ['籃球', '躲避球', '棒球', '游泳'],
      ['甲班', '乙班', '丙班', '丁班'],
    ];
    const patterns = [
      [40, 25, 20, 15],
      [32, 28, 24, 16],
      [35, 30, 20, 15],
      [45, 20, 15, 20],
    ];
    const totals = [100, 120, 200, 240];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const labels = pickFromList(labelBanks);
      const percents = pickFromList(patterns);
      const total = pickFromList(totals.filter((n) => percents.every((p) => (n * p) % 100 === 0)));
      const items = buildE626Distribution(labels, percents, total);
      const text = items.map((item) => `${item.label} ${item.count}`).join('、');
      const result = items.map((item) => `${item.label} ${item.percent}\\%`).join('，');
      questions.push(`某項統計共有 ${total} 筆資料，其中 ${text}，求各項百分率。`);
      summaryAnswers.push(result);
      answers.push(
        `簡答：${result}。過程：先看總數是 ${total}，再用「部分量 ÷ 全部量 = 百分率」。${items
          .map((item) => `${item.label}：${item.count} ÷ ${total} = ${item.percent}\\%`)
          .join('；')}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE626AmountToPercentSet(count) {
    const labelBanks = [
      ['餐飲費', '交通費', '文具費', '娛樂費'],
      ['國語類', '社會類', '自然類', '藝術類'],
      ['書籍', '遊戲', '運動用品', '旅行'],
    ];
    const patterns = [
      [30, 25, 20, 25],
      [40, 20, 30, 10],
      [15, 35, 20, 30],
      [45, 20, 15, 20],
    ];
    const totals = [7200, 8000, 12000, 25000];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const labels = pickFromList(labelBanks);
      const percents = pickFromList(patterns);
      const total = pickFromList(totals);
      const items = buildE626Distribution(labels, percents, total);
      const text = items.map((item) => `${item.label} ${item.count} 元`).join('、');
      const result = items.map((item) => `${item.label} ${item.percent}\\%`).join('，');
      questions.push(`某筆總金額為 ${total} 元，其中 ${text}，求各項所占百分率。`);
      summaryAnswers.push(result);
      answers.push(
        `簡答：${result}。過程：總金額是 ${total} 元，所以各項百分率都用「該項金額 ÷ 總金額」。${items
          .map((item) => `${item.label}：${item.count} ÷ ${total} = ${item.percent}\\%`)
          .join('；')}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE626MissingPercentSet(count) {
    const labelBanks = [
      ['語文類', '自然類', '社會類', '藝術類'],
      ['甲班', '乙班', '丙班', '丁班'],
      ['食物', '交通', '娛樂', '儲蓄'],
    ];
    const patterns = [
      [35, 25, 20, 20],
      [40, 30, 15, 15],
      [28, 32, 20, 20],
      [45, 20, 10, 25],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const labels = pickFromList(labelBanks);
      const percents = pickFromList(patterns);
      const missingIndex = randInt(0, labels.length - 1);
      const known = labels
        .map((label, index) => (index === missingIndex ? null : `${label} ${percents[index]}\\%`))
        .filter(Boolean)
        .join('、');
      questions.push(`圓形圖共有四項，已知 ${known}，求 ${labels[missingIndex]} 的百分率。`);
      summaryAnswers.push(`${labels[missingIndex]} ${percents[missingIndex]}\\%`);
      answers.push(
        `簡答：${labels[missingIndex]} ${percents[missingIndex]}\\%。過程：全部合起來是 100\\%，所以 ${labels[missingIndex]} = 100\\% - (${percents
          .filter((_, index) => index !== missingIndex)
          .join('\\% + ')}\\%) = ${percents[missingIndex]}\\%。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE626PercentToAngleSet(count) {
    const percents = [5, 10, 12.5, 15, 20, 25, 30, 35, 40, 45];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const percent = pickFromList(percents);
      const angle = (360 * percent) / 100;
      questions.push(`圓形圖中某項占全體的 ${percent}\\%，求它的圓心角。`);
      summaryAnswers.push(`${e626AngleText(angle)}`);
      answers.push(
        `簡答：${e626AngleText(angle)}。過程：圓心角 = 360^\\circ × 百分率 = 360^\\circ × ${percent}\\% = ${e626AngleText(angle)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE626AngleToPercentSet(count) {
    const angles = [18, 36, 45, 54, 72, 90, 108, 126, 144, 162];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const angle = pickFromList(angles);
      const percent = (angle / 360) * 100;
      questions.push(`圓形圖中某項的圓心角是 ${angle}^\\circ，求它占全體的百分率。`);
      summaryAnswers.push(`${e626PercentText(percent)}`);
      answers.push(
        `簡答：${e626PercentText(percent)}。過程：百分率 = ${angle}^\\circ ÷ 360^\\circ × 100\\% = ${e626PercentText(percent)}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE626MixedAnglePercentSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const patterns = [
      [25, 20, 10, 45],
      [30, 15, 25, 30],
      [40, 15, 20, 25],
      [35, 25, 20, 20],
    ];
    const labelBanks = [
      ['A 類', 'B 類', 'C 類', 'D 類'],
      ['甲', '乙', '丙', '丁'],
    ];
    for (let i = 0; i < count; i += 1) {
      const percents = pickFromList(patterns);
      const labels = pickFromList(labelBanks);
      const askIndex = randInt(0, 3);
      const known = labels
        .map((label, index) => {
          if (index === askIndex) return null;
          return index % 2 === 0
            ? `${label} ${percents[index]}\\%`
            : `${label} ${(percents[index] * 360) / 100}^\\circ`;
        })
        .filter(Boolean)
        .join('、');
      const askAngle = askIndex % 2 === 1;
      const answerText = askAngle
        ? `${labels[askIndex]} ${(percents[askIndex] * 360) / 100}^\\circ`
        : `${labels[askIndex]} ${percents[askIndex]}\\%`;
      questions.push(
        `某圓形圖共有四項，已知 ${known}，求 ${labels[askIndex]} ${askAngle ? '的圓心角' : '所占百分率'}。`
      );
      summaryAnswers.push(answerText);
      answers.push(
        `簡答：${answerText}。過程：先把已知資料都看成百分率，總百分率為 100\\%。已知三項合計為 ${100 - percents[askIndex]}\\%，所以 ${labels[askIndex]} 占 ${percents[askIndex]}\\%。${askAngle ? `再用 360^\\circ × ${percents[askIndex]}\\% = ${(percents[askIndex] * 360) / 100}^\\circ。` : ''}`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE626PartFromPercentSet(count) {
    const contexts = [
      { total: 25000, unit: '元', labels: ['伙食費', '交通費', '育樂費', '雜支'], percents: [32, 30, 30, 8] },
      { total: 240, unit: '本', labels: ['語文類', '社會類', '自然類', '藝術類'], percents: [40, 20, 30, 10] },
      { total: 2300, unit: '萬人', labels: ['北部', '中部', '南部', '東部'], percents: [46, 25, 27, 2] },
      { total: 8000, unit: '元', labels: ['儲蓄', '買書', '看電影', '買球鞋'], percents: [45, 20, 15, 20] },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = pickFromList(contexts);
      const askIndex = randInt(0, item.labels.length - 1);
      const part = (item.total * item.percents[askIndex]) / 100;
      questions.push(
        `某資料總量是 ${item.total}${item.unit}，其中 ${item.labels[askIndex]} 占 ${item.percents[askIndex]}\\%，求 ${item.labels[askIndex]} 的數量。`
      );
      summaryAnswers.push(`${part}${item.unit}`);
      answers.push(
        `簡答：${part}${item.unit}。過程：部分量 = 全部量 × 百分率 = ${item.total} × ${item.percents[askIndex]}\\% = ${part}，所以 ${item.labels[askIndex]} 是 ${part}${item.unit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE626PartFromAngleSet(count) {
    const contexts = [
      { total: 24, unit: '小時', label: '睡眠' },
      { total: 120, unit: '人', label: 'A 型' },
      { total: 8000, unit: '票', label: '景點票' },
      { total: 200, unit: '本', label: '漫畫' },
    ];
    const angles = [36, 45, 72, 90, 108, 120, 135, 144];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = pickFromList(contexts);
      const angle = pickFromList(angles.filter((n) => (item.total * n) % 360 === 0));
      const part = (item.total * angle) / 360;
      questions.push(
        `某圓形圖中，${item.label} 的圓心角是 ${angle}^\\circ，若全部量是 ${item.total}${item.unit}，求 ${item.label} 的數量。`
      );
      summaryAnswers.push(`${part}${item.unit}`);
      answers.push(
        `簡答：${part}${item.unit}。過程：${item.label} 占全體的比率 = ${angle}^\\circ ÷ 360^\\circ = ${e626FormatNumber(angle / 360)}，所以數量 = ${item.total} × ${angle} ÷ 360 = ${part}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE626MultiPartAmountSet(count) {
    const contexts = [
      { total: 5400, unit: '元', labels: ['住宿費', '門票', '餐費', '交通費'], percents: [40, 25, 15, 20] },
      { total: 36000, unit: '元', labels: ['食費', '學費', '交通費', '其他'], percents: [25, 35, 20, 20] },
      { total: 2400, unit: '人', labels: ['同意', '不同意', '沒意見', '未回答'], percents: [48, 20, 22, 10] },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = pickFromList(contexts);
      const a = randInt(0, item.labels.length - 1);
      let b = randInt(0, item.labels.length - 1);
      while (b === a) b = randInt(0, item.labels.length - 1);
      const partA = (item.total * item.percents[a]) / 100;
      const partB = (item.total * item.percents[b]) / 100;
      questions.push(
        `某資料總量是 ${item.total}${item.unit}，其中 ${item.labels[a]} 占 ${item.percents[a]}\\%，${item.labels[b]} 占 ${item.percents[b]}\\%，求這兩項的數量。`
      );
      summaryAnswers.push(`${item.labels[a]} ${partA}${item.unit}，${item.labels[b]} ${partB}${item.unit}`);
      answers.push(
        `簡答：${item.labels[a]} ${partA}${item.unit}，${item.labels[b]} ${partB}${item.unit}。過程：${item.labels[a]} = ${item.total} × ${item.percents[a]}\\% = ${partA}；${item.labels[b]} = ${item.total} × ${item.percents[b]}\\% = ${partB}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE626SamePercentCompareSet(count) {
    const totals = [
      [3500, 6000],
      [1000, 700],
      [5000, 3000],
      [40, 30],
      [20000, 50000],
    ];
    const units = ['kg', '元', '瓶', '人', '元'];
    const labels = [
      ['上半年麥量', '下半年麥量', '麥'],
      ['郁哲零用錢', '文全零用錢', '儲蓄'],
      ['昨天進貨量', '今天進貨量', '果汁'],
      ['甲班總人數', '乙班總人數', '男生'],
      ['凱文家旅費', '海莉家旅費', '住宿費'],
    ];
    const percents = [25, 30, 16, 40, 50];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const idx = randInt(0, totals.length - 1);
      const totalA = totals[idx][0];
      const totalB = totals[idx][1];
      const percent = percents[idx];
      const valueA = (totalA * percent) / 100;
      const valueB = (totalB * percent) / 100;
      const unit = units[idx];
      const [nameA, nameB, target] = labels[idx];
      const answerText = valueA === valueB ? '一樣多' : valueA > valueB ? `${nameA}較多` : `${nameB}較多`;
      questions.push(
        `${nameA}為 ${totalA}${unit}、${nameB}為 ${totalB}${unit}，兩者的 ${target} 都占 ${percent}\\%，請問實際數量誰比較多？`
      );
      summaryAnswers.push(answerText);
      answers.push(
        `簡答：${answerText}。過程：${nameA} 的 ${target} 是 ${totalA} × ${percent}\\% = ${valueA}${unit}；${nameB} 的 ${target} 是 ${totalB} × ${percent}\\% = ${valueB}${unit}。所以 ${answerText}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE626DifferentPercentCompareSet(count) {
    const contexts = [
      { aName: '甲班', aTotal: 40, aPercent: 40, bName: '乙班', bTotal: 30, bPercent: 40, label: '男生', unit: '人' },
      {
        aName: '大賣場昨天',
        aTotal: 5000,
        aPercent: 16,
        bName: '大賣場今天',
        bTotal: 3000,
        bPercent: 15,
        label: '果汁',
        unit: '瓶',
      },
      {
        aName: '甲箱',
        aTotal: 5,
        aPercent: 40,
        bName: '乙箱',
        bTotal: 7,
        bPercent: 28.571428,
        label: '綠球',
        unit: '顆',
        fixedB: 2,
      },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = pickFromList(contexts);
      const valueA = item.fixedA != null ? item.fixedA : (item.aTotal * item.aPercent) / 100;
      const valueB = item.fixedB != null ? item.fixedB : (item.bTotal * item.bPercent) / 100;
      const answerText = valueA === valueB ? '一樣多' : valueA > valueB ? `${item.aName}較多` : `${item.bName}較多`;
      questions.push(
        `${item.aName} 的總量是 ${item.aTotal}${item.unit}，其中 ${item.label} 占 ${e626FormatNumber(item.aPercent)}\\%；${item.bName} 的總量是 ${item.bTotal}${item.unit}，其中 ${item.label} 占 ${e626FormatNumber(item.bPercent)}\\%。請問誰的 ${item.label} 實際數量較多？`
      );
      summaryAnswers.push(answerText);
      answers.push(
        `簡答：${answerText}。過程：${item.aName} 的 ${item.label} 為 ${e626FormatNumber(valueA)}${item.unit}；${item.bName} 的 ${item.label} 為 ${e626FormatNumber(valueB)}${item.unit}。比較後可知 ${answerText}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE626SpendCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const totals = [
      [1000, 30, 700, 40],
      [20000, 50, 50000, 40],
      [8000, 45, 6000, 30],
    ];
    for (let i = 0; i < count; i += 1) {
      const [aTotal, aPercent, bTotal, bPercent] = pickFromList(totals);
      const aValue = (aTotal * aPercent) / 100;
      const bValue = (bTotal * bPercent) / 100;
      const answerText = aValue === bValue ? '一樣多' : aValue > bValue ? '甲較多' : '乙較多';
      questions.push(
        `甲有 ${aTotal} 元，其中儲蓄 ${aPercent}\\%；乙有 ${bTotal} 元，其中儲蓄 ${bPercent}\\%。請問誰儲蓄的錢比較多？`
      );
      summaryAnswers.push(answerText);
      answers.push(
        `簡答：${answerText}。過程：甲儲蓄 ${aTotal} × ${aPercent}\\% = ${aValue} 元；乙儲蓄 ${bTotal} × ${bPercent}\\% = ${bValue} 元。比較後可知 ${answerText}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE626ChartSelectionSet(count) {
    const banks = [
      ['記錄一天內每小時的體溫變化', '折線圖'],
      ['比較各家分店去年的銷量多寡', '長條圖'],
      ['表示各種硬幣數量所占比例', '圓形圖'],
      ['觀察歷年學生總人數的增減趨勢', '折線圖'],
      ['表示不同職業人數所占全體的比例', '圓形圖'],
      ['比較四個班級回收量的多寡', '長條圖'],
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const [scenario, chart] = pickFromList(banks);
      questions.push(`要把「${scenario}」畫成統計圖，最適合用哪一種圖表？（長條圖、折線圖、圓形圖）`);
      summaryAnswers.push(chart);
      answers.push(
        `簡答：${chart}。過程：先看資料重點。這題強調${chart === '折線圖' ? '變化趨勢' : chart === '長條圖' ? '數量比較' : '各部分占全體的比例'}，所以最適合用${chart}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE626PossibilitySet(count) {
    const banks = [
      { total: 150, good: 2, ask: '抽到 1000 元現金', result: '很不可能' },
      { total: 80, good: 70, ask: '抽到藍色紙', result: '很可能' },
      { total: 10, good: 10, ask: '轉兩次的分數和大於 1', result: '一定' },
      { total: 300, good: 0, ask: '點開爸爸照片', result: '一定不能' },
      { total: 8, good: 5, ask: '抽到黑球', result: '比較可能' },
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const item = pickFromList(banks);
      questions.push(
        `某事件中有 ${item.good} 個有利結果，全部共有 ${item.total} 個可能結果。判斷「${item.ask}」屬於哪一種情形？（很可能、很不可能、比較可能、一定、一定不能）`
      );
      summaryAnswers.push(item.result);
      answers.push(
        `簡答：${item.result}。過程：先看有利結果占全部量的比例是 ${item.good}/${item.total}。比例越接近 1 越可能，等於 1 就是一定，等於 0 就是一定不能，所以本題判為「${item.result}」。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE626MixedPieReadingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const total = pickFromList([100, 120, 200, 240]);
      const percent = pickFromList([10, 20, 25, 30, 40]);
      const angle = (360 * percent) / 100;
      const askType = i % 2 === 0 ? 'angle' : 'percent';
      if (askType === 'angle') {
        questions.push(`某項在圓形圖中占 ${percent}\\%，請問它的圓心角是多少度？`);
        summaryAnswers.push(`${angle}^\\circ`);
        answers.push(`簡答：${angle}^\\circ。過程：圓心角 = 360^\\circ × ${percent}\\% = ${angle}^\\circ。`);
      } else {
        const part = (total * percent) / 100;
        questions.push(`某項在圓形圖中的圓心角是 ${angle}^\\circ，全部量為 ${total}，求這一項的數量。`);
        summaryAnswers.push(`${part}`);
        answers.push(
          `簡答：${part}。過程：先把角度換成百分率：${angle}^\\circ ÷ 360^\\circ = ${percent}\\%，再算 ${total} × ${percent}\\% = ${part}。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildE626MixedSet(banks, count) {
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

  function buildE626PercentMixedSet(count) {
    return buildE626MixedSet(
      [buildE626CountToPercentSet, buildE626AmountToPercentSet, buildE626MissingPercentSet],
      count
    );
  }

  function buildE626AngleMixedSet(count) {
    return buildE626MixedSet(
      [buildE626PercentToAngleSet, buildE626AngleToPercentSet, buildE626MixedAnglePercentSet],
      count
    );
  }

  function buildE626PartMixedSet(count) {
    return buildE626MixedSet(
      [buildE626PartFromPercentSet, buildE626PartFromAngleSet, buildE626MultiPartAmountSet],
      count
    );
  }

  function buildE626CompareMixedSet(count) {
    return buildE626MixedSet(
      [buildE626SamePercentCompareSet, buildE626DifferentPercentCompareSet, buildE626SpendCompareSet],
      count
    );
  }

  function buildE626InterpretMixedSet(count) {
    return buildE626MixedSet([buildE626ChartSelectionSet, buildE626PossibilitySet, buildE626MixedPieReadingSet], count);
  }

  // 從原始數據列表計算平均數
  function buildE626AverageFromDataSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const contexts = [
      { thing: '瀏覽量', unit: '次', labels: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'] },
      { thing: '氣溫', unit: '℃', labels: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'] },
      { thing: '成績', unit: '分', labels: ['第一次', '第二次', '第三次', '第四次', '第五次', '第六次'] },
      { thing: '作業時間', unit: '分鐘', labels: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'] },
      { thing: '月銷售額', unit: '萬元', labels: ['一月', '二月', '三月', '四月', '五月', '六月'] },
    ];
    // 每組偏差列表，各組之和為 0，保證 avg+offset > 0（avg 至少 20）
    const deviationsByN = {
      4: [[3, 5, -2, -6], [2, -3, 5, -4], [4, -2, -5, 3]],
      5: [[5, 3, -2, -4, -2], [4, -3, 5, -2, -4], [-3, 6, 2, -4, -1]],
      6: [[5, 3, -2, -4, -1, -1], [3, -2, 5, -4, 2, -4], [4, 2, -3, -1, 5, -7]],
      7: [[4, -3, 5, -2, -1, 3, -6], [3, 2, -4, 5, -3, -1, -2], [5, -2, 3, -4, 1, -2, -1]],
    };
    for (let i = 0; i < count; i += 1) {
      const ctx = contexts[i % contexts.length];
      const n = pickFromList([4, 5, 6, 7]);
      const avg = pickFromList([20, 25, 30, 35, 40, 45, 50, 55, 60, 80, 85]);
      const devGroup = deviationsByN[n];
      const devs = devGroup[i % devGroup.length];
      const values = devs.map((d) => avg + d);
      const total = avg * n;
      const labels = ctx.labels.slice(0, n);
      const dataStr = labels.map((l, j) => `${l} ${values[j]} ${ctx.unit}`).join('、');
      questions.push(`某統計記錄如下：${dataStr}。請計算這 $${n}$ 筆資料的平均${ctx.thing}。`);
      summaryAnswers.push(`$${avg}$ ${ctx.unit}`);
      answers.push(
        `合計 $= ${values.join(' + ')} = ${total}$（${ctx.unit}），平均 $= ${total} \\div ${n} = ${avg}$（${ctx.unit}）。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  const nextConfigs = {
      'e6-1-1-prime-composite-judge-drill': {
        type: 'drill',
        title: '質數與合數判別',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611PrimeCompositeJudgeSet(5);
        },
      },
      'e6-1-1-prime-factor-list-drill': {
        type: 'drill',
        title: '找出一個數的質因數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611PrimeFactorListSet(5);
        },
      },
      'e6-1-1-prime-factorization-drill': {
        type: 'drill',
        title: '質因數分解',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611PrimeFactorizationSet(5);
        },
      },
      'e6-1-1-gcd-direct-drill': {
        type: 'drill',
        title: '直接求最大公因數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611GcdDirectSet(5);
        },
      },
      'e6-1-1-gcd-factor-form-drill': {
        type: 'drill',
        title: '由標準分解式求最大公因數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611GcdFactorFormSet(5);
        },
      },
      'e6-1-1-coprime-judge-drill': {
        type: 'drill',
        title: '判斷兩數是否互質',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611CoprimeJudgeSet(5);
        },
      },
      'e6-1-1-grouping-drill': {
        type: 'drill',
        title: '平分與分組',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611GroupingSet(5);
        },
      },
      'e6-1-1-cut-square-drill': {
        type: 'drill',
        title: '長方形裁切最大正方形',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611CutSquareSet(5);
        },
      },
      'e6-1-1-lcm-direct-drill': {
        type: 'drill',
        title: '直接求最小公倍數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611LcmDirectSet(5);
        },
      },
      'e6-1-1-lcm-factor-form-drill': {
        type: 'drill',
        title: '由標準分解式求最小公倍數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611LcmFactorFormSet(5);
        },
      },
      'e6-1-1-lcm-relation-drill': {
        type: 'drill',
        title: '互質與倍數關係求最小公倍數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611LcmRelationSet(5);
        },
      },
      'e6-1-1-periodic-sync-drill': {
        type: 'drill',
        title: '週期事件同步',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611PeriodicSyncSet(5);
        },
      },
      'e6-1-1-assemble-square-drill': {
        type: 'drill',
        title: '長方形拼成最小正方形',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611AssembleSquareSet(5);
        },
      },
      'e6-1-1-range-multiple-drill': {
        type: 'drill',
        title: '指定範圍內的公倍數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE611RangeMultipleSet(5);
        },
      },
      'e6-1-1-foundation-three-subtypes': {
        type: 'drill',
        title: '質數與質因數分解三小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611FoundationMixedSet(5);
        },
      },
      'e6-1-1-gcd-basic-three-subtypes': {
        type: 'drill',
        title: '最大公因數基礎三小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611GcdBasicMixedSet(5);
        },
      },
      'e6-1-1-gcd-application-two-subtypes': {
        type: 'drill',
        title: '最大公因數應用二小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611GcdApplicationMixedSet(5);
        },
      },
      'e6-1-1-lcm-basic-three-subtypes': {
        type: 'drill',
        title: '最小公倍數基礎三小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE611LcmBasicMixedSet(5);
        },
      },
      'e6-1-1-lcm-application-three-subtypes': {
        type: 'drill',
        title: '最小公倍數應用三小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE611LcmApplicationMixedSet(5);
        },
      },
      'e6-1-2-simplify-fraction-drill': {
        type: 'drill',
        title: '化為最簡分數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE612SimplifyFractionSet(5);
        },
      },
      'e6-1-2-same-denominator-division-drill': {
        type: 'drill',
        title: '同分母分數相除',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE612SameDenominatorDivisionSet(5);
        },
      },
      'e6-1-2-integer-divide-fraction-drill': {
        type: 'drill',
        title: '整數除以分數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE612IntegerDivideFractionSet(5);
        },
      },
      'e6-1-2-general-fraction-division-drill': {
        type: 'drill',
        title: '異分母與帶分數除法',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE612GeneralFractionDivisionSet(5);
        },
      },
      'e6-1-2-partition-drill': {
        type: 'drill',
        title: '分裝與剪段問題',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE612PartitionSet(5);
        },
      },
      'e6-1-2-comparison-drill': {
        type: 'drill',
        title: '商與原分數大小比較',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE612ComparisonSet(5);
        },
      },
      'e6-1-2-unit-rate-drill': {
        type: 'drill',
        title: '求單位量與單價',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE612UnitRateSet(5);
        },
      },
      'e6-1-2-geometry-inverse-drill': {
        type: 'drill',
        title: '幾何反推計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE612GeometryInverseSet(5);
        },
      },
      'e6-1-2-part-to-whole-drill': {
        type: 'drill',
        title: '部分量求全體',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE612PartToWholeSet(5);
        },
      },
      'e6-1-2-rate-application-drill': {
        type: 'drill',
        title: '速率與單位比例應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE612RateApplicationSet(5);
        },
      },
      'e6-1-2-remainder-cut-drill': {
        type: 'drill',
        title: '有餘數的分數切割',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE612RemainderCutSet(5);
        },
      },
      'e6-1-2-basics-four-subtypes': {
        type: 'drill',
        title: '約分與基礎除法四小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE612BasicsMixedSet(5);
        },
      },
      'e6-1-2-comparison-one-subtype': {
        type: 'drill',
        title: '倍數關係判定',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE612ComparisonMixedSet(5);
        },
      },
      'e6-1-2-unit-two-subtypes': {
        type: 'drill',
        title: '分裝與單位量二小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE612UnitMixedSet(5);
        },
      },
      'e6-1-2-geometry-one-subtype': {
        type: 'drill',
        title: '幾何反推計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE612GeometryMixedSet(5);
        },
      },
      'e6-1-2-whole-one-subtype': {
        type: 'drill',
        title: '部分量求全體',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE612WholeMixedSet(5);
        },
      },
      'e6-1-2-rate-one-subtype': {
        type: 'drill',
        title: '速率與單位比例應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE612RateMixedSet(5);
        },
      },
      'e6-1-3-sum-invariant-drill': {
        type: 'drill',
        title: '和不變',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE613SumInvariantSet(5);
        },
      },
      'e6-1-3-difference-invariant-drill': {
        type: 'drill',
        title: '差不變',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE613DifferenceInvariantSet(5);
        },
      },
      'e6-1-3-ratio-invariant-drill': {
        type: 'drill',
        title: '商不變',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE613RatioInvariantSet(5);
        },
      },
      'e6-1-3-product-invariant-drill': {
        type: 'drill',
        title: '積不變',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE613ProductInvariantSet(5);
        },
      },
      'e6-1-3-growth-basic-drill': {
        type: 'drill',
        title: '堆疊與排列表規律',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE613GrowthBasicSet(5);
        },
      },
      'e6-1-3-growth-inverse-drill': {
        type: 'drill',
        title: '由規律反推起點或第 n 項',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE613GrowthInverseSet(5);
        },
      },
      'e6-1-3-interval-basic-drill': {
        type: 'drill',
        title: '間隔問題基本型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE613IntervalBasicSet(5);
        },
      },
      'e6-1-3-interval-index-drill': {
        type: 'drill',
        title: '指定序號的間距計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE613IntervalIndexDistanceSet(5);
        },
      },
      'e6-1-3-cycle-drill': {
        type: 'drill',
        title: '週期循環規律',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE613CycleSet(5);
        },
      },
      'e6-1-3-chicken-rabbit-drill': {
        type: 'drill',
        title: '雞兔問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE613ChickenRabbitSet(5);
        },
      },
      'e6-1-3-sum-one-subtype': {
        type: 'drill',
        title: '和不變',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE613SumMixedSet(5);
        },
      },
      'e6-1-3-difference-one-subtype': {
        type: 'drill',
        title: '差不變',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE613DifferenceMixedSet(5);
        },
      },
      'e6-1-3-ratio-one-subtype': {
        type: 'drill',
        title: '商不變',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE613RatioMixedSet(5);
        },
      },
      'e6-1-3-product-one-subtype': {
        type: 'drill',
        title: '積不變',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE613ProductMixedSet(5);
        },
      },
      'e6-1-3-growth-two-subtypes': {
        type: 'drill',
        title: '堆疊與數形規律二小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE613GrowthMixedSet(5);
        },
      },
      'e6-1-3-interval-two-subtypes': {
        type: 'drill',
        title: '間隔問題二小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE613IntervalMixedSet(5);
        },
      },
      'e6-1-3-cycle-one-subtype': {
        type: 'drill',
        title: '週期循環規律',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE613CycleMixedSet(5);
        },
      },
      'e6-1-3-chicken-rabbit-one-subtype': {
        type: 'drill',
        title: '雞兔問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE613ChickenRabbitMixedSet(5);
        },
      },
      'e6-1-4-integer-divide-decimal-drill': {
        type: 'drill',
        title: '整數除以小數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE614IntegerDivideDecimalSet(5);
        },
      },
      'e6-1-4-decimal-divide-decimal-drill': {
        type: 'drill',
        title: '小數除以小數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE614DecimalDivideDecimalSet(5);
        },
      },
      'e6-1-4-estimate-quotient-drill': {
        type: 'drill',
        title: '求商的約數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE614EstimateQuotientSet(5);
        },
      },
      'e6-1-4-equivalent-transform-drill': {
        type: 'drill',
        title: '等值變換與移位判斷',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE614EquivalentTransformSet(5);
        },
      },
      'e6-1-4-compare-dividend-relation-drill': {
        type: 'drill',
        title: '商與被除數的大小關係',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE614CompareDividendRelationSet(5);
        },
      },
      'e6-1-4-compare-same-dividend-drill': {
        type: 'drill',
        title: '同被除數的商大小比較',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE614CompareSameDividendSet(5);
        },
      },
      'e6-1-4-packaging-drill': {
        type: 'drill',
        title: '容器分裝與分袋問題',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE614PackagingSet(5);
        },
      },
      'e6-1-4-unit-rate-drill': {
        type: 'drill',
        title: '求單價與單位量',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE614UnitRateSet(5);
        },
      },
      'e6-1-4-geometry-inverse-drill': {
        type: 'drill',
        title: '幾何面積反推邊長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE614GeometryInverseSet(5);
        },
      },
      'e6-1-4-rate-percent-drill': {
        type: 'drill',
        title: '率與百分率應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE614RatePercentSet(5);
        },
      },
      'e6-1-4-remainder-division-drill': {
        type: 'drill',
        title: '有餘數的小數除法',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE614RemainderDivisionSet(5);
        },
      },
      'e6-1-4-mixed-computation-drill': {
        type: 'drill',
        title: '混合四則運算（含小數除法）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE614MixedComputationSet(5);
        },
      },
      'e6-1-4-basics-two-subtypes': {
        type: 'drill',
        title: '基礎小數除法二小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE614BasicsMixedSet(5);
        },
      },
      'e6-1-4-judgement-four-subtypes': {
        type: 'drill',
        title: '商的判斷四小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE614JudgementMixedSet(5);
        },
      },
      'e6-1-4-unit-two-subtypes': {
        type: 'drill',
        title: '分裝與單位量二小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE614UnitMixedSet(5);
        },
      },
      'e6-1-4-inverse-two-subtypes': {
        type: 'drill',
        title: '反推與率應用二小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE614InverseMixedSet(5);
        },
      },
      'e6-1-4-remainder-one-subtype': {
        type: 'drill',
        title: '有餘數的小數除法',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE614RemainderMixedSet(5);
        },
      },
      'e6-1-5-ratio-value-drill': {
        type: 'drill',
        title: '求比值',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE615RatioValueSet(5);
        },
      },
      'e6-1-5-simplest-ratio-drill': {
        type: 'drill',
        title: '化為最簡整數比',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE615SimplestRatioSet(5);
        },
      },
      'e6-1-5-equivalent-ratio-drill': {
        type: 'drill',
        title: '尋找相等的比',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE615EquivalentRatioSet(5);
        },
      },
      'e6-1-5-unit-comparison-drill': {
        type: 'drill',
        title: '異量比與單價效率比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE615UnitComparisonSet(5);
        },
      },
      'e6-1-5-exchange-drill': {
        type: 'drill',
        title: '生活中的兌換與交易',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE615ExchangeSet(5);
        },
      },
      'e6-1-5-part-whole-drill': {
        type: 'drill',
        title: '部分量與全體量',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE615PartWholeSet(5);
        },
      },
      'e6-1-5-distribution-drill': {
        type: 'drill',
        title: '已知總量的比分配',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE615DistributionSet(5);
        },
      },
      'e6-1-5-adjustment-drill': {
        type: 'drill',
        title: '配方與濃度的調整',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE615AdjustmentSet(5);
        },
      },
      'e6-1-5-percent-application-drill': {
        type: 'drill',
        title: '基準量與比較量的百分率應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE615PercentApplicationSet(5);
        },
      },
      'e6-1-5-geometry-ratio-drill': {
        type: 'drill',
        title: '幾何比例與生活尺規應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE615GeometrySet(5);
        },
      },
      'e6-1-5-benchmark-drill': {
        type: 'drill',
        title: '基準量與倍數轉換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE615BenchmarkSet(5);
        },
      },
      'e6-1-5-core-three-subtypes': {
        type: 'drill',
        title: '比值與相等的比三小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE615CoreMixedSet(5);
        },
      },
      'e6-1-5-compare-three-subtypes': {
        type: 'drill',
        title: '兌換與異量比較三小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE615CompareMixedSet(5);
        },
      },
      'e6-1-5-distribution-two-subtypes': {
        type: 'drill',
        title: '部分與分配二小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE615DistributionMixedSet(5);
        },
      },
      'e6-1-5-adjust-percent-two-subtypes': {
        type: 'drill',
        title: '調配與百分率二小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE615AdjustPercentMixedSet(5);
        },
      },
      'e6-1-5-geometry-one-subtype': {
        type: 'drill',
        title: '幾何比例與生活尺規應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE615GeometryMixedSet(5);
        },
      },
      'e6-1-5-chain-ratio-drill': {
        type: 'drill',
        title: '連比合併（A:B與B:C→A:B:C）',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE615ChainRatioSet(5);
        },
      },
      'e6-1-5-discount-drill': {
        type: 'drill',
        title: '打折計算（正比應用）',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE615DiscountSet(5);
        },
      },
      'e6-1-6-pi-concept-drill': {
        type: 'drill',
        title: '圓周率基本觀念判定',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE616PiConceptSet(5);
        },
      },
      'e6-1-6-circumference-drill': {
        type: 'drill',
        title: '給直徑或半徑求圓周長',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE616CircumferenceSet(5);
        },
      },
      'e6-1-6-inverse-circumference-drill': {
        type: 'drill',
        title: '已知圓周長反求直徑或半徑',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE616InverseSet(5);
        },
      },
      'e6-1-6-rolling-distance-drill': {
        type: 'drill',
        title: '圈數與距離互推',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE616RollingDistanceSet(5);
        },
      },
      'e6-1-6-step-radius-drill': {
        type: 'drill',
        title: '步長反推半徑或直徑',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE616StepSet(5);
        },
      },
      'e6-1-6-sector-perimeter-drill': {
        type: 'drill',
        title: '扇形周長計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE616SectorPerimeterSet(5);
        },
      },
      'e6-1-6-sector-from-whole-drill': {
        type: 'drill',
        title: '由整圓周長求扇形弧長或周長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE616SectorFromWholeCircumferenceSet(5);
        },
      },
      'e6-1-6-multiplier-drill': {
        type: 'drill',
        title: '圓周長的倍數比較',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE616MultiplierSet(5);
        },
      },
      'e6-1-6-circular-interval-drill': {
        type: 'drill',
        title: '圓周上的間隔問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE616CircularIntervalSet(5);
        },
      },
      'e6-1-6-foundation-three-subtypes': {
        type: 'drill',
        title: '圓周率與圓周長基礎三小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE616FoundationMixedSet(5);
        },
      },
      'e6-1-6-motion-two-subtypes': {
        type: 'drill',
        title: '滾動與步數二小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE616MotionMixedSet(5);
        },
      },
      'e6-1-6-sector-two-subtypes': {
        type: 'drill',
        title: '扇形周長二小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE616SectorMixedSet(5);
        },
      },
      'e6-1-6-multiplier-one-subtype': {
        type: 'drill',
        title: '圓周長的倍數比較',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE616MultiplierMixedSet(5);
        },
      },
      'e6-1-6-interval-one-subtype': {
        type: 'drill',
        title: '圓周上的間隔問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE616IntervalMixedSet(5);
        },
      },
      'e6-1-6-pi-22-over-7-drill': {
        type: 'drill',
        title: '以 22/7 計算圓周長',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE616Pi22Over7Set(5);
        },
      },
      'e6-1-7-circle-area-direct-drill': {
        type: 'drill',
        title: '基礎圓面積計算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE617CircleAreaDirectSet(5);
        },
      },
      'e6-1-7-circle-area-from-circumference-drill': {
        type: 'drill',
        title: '由圓周長反求圓面積',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE617CircleAreaFromCircumferenceSet(5);
        },
      },
      'e6-1-7-area-multiplier-drill': {
        type: 'drill',
        title: '面積倍數關係',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE617AreaMultiplierSet(5);
        },
      },
      'e6-1-7-sector-area-drill': {
        type: 'drill',
        title: '基礎扇形面積計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE617SectorAreaSet(5);
        },
      },
      'e6-1-7-sector-fraction-drill': {
        type: 'drill',
        title: '由幾分之幾圓求扇形面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE617SectorFractionSet(5);
        },
      },
      'e6-1-7-composite-area-drill': {
        type: 'drill',
        title: '複合圖形面積計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE617CompositeAreaSet(5);
        },
      },
      'e6-1-7-ring-area-drill': {
        type: 'drill',
        title: '環形與外圍步道面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE617RingApplicationSet(5);
        },
      },
      'e6-1-7-tether-area-drill': {
        type: 'drill',
        title: '拴繩活動範圍面積',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildE617TetherSet(5);
        },
      },
      'e6-1-7-foundation-three-subtypes': {
        type: 'drill',
        title: '圓面積基礎三小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE617FoundationThreeSet(5);
        },
      },
      'e6-1-7-sector-two-subtypes': {
        type: 'drill',
        title: '扇形面積二小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE617SectorTwoSet(5);
        },
      },
      'e6-1-7-composite-one-subtype': {
        type: 'drill',
        title: '複合圖形面積計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE617CompositeOneSet(5);
        },
      },
      'e6-1-7-ring-one-subtype': {
        type: 'drill',
        title: '環形與外圍步道面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE617RingOneSet(5);
        },
      },
      'e6-1-7-tether-one-subtype': {
        type: 'drill',
        title: '拴繩活動範圍面積',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildE617TetherOneSet(5);
        },
      },
      'e6-1-7-area-inverse-drill': {
        type: 'drill',
        title: '由面積逆推半徑或直徑',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE617AreaInverseSet(5);
        },
      },
      'e6-1-8-rate-basic-drill': {
        type: 'drill',
        title: '求速率',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE618RateBasicSet(5);
        },
      },
      'e6-1-8-distance-basic-drill': {
        type: 'drill',
        title: '求距離',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE618DistanceBasicSet(5);
        },
      },
      'e6-1-8-time-basic-drill': {
        type: 'drill',
        title: '求時間',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE618TimeBasicSet(5);
        },
      },
      'e6-1-8-length-unit-convert-drill': {
        type: 'drill',
        title: '只換長度單位的速率換算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE618LengthUnitConvertSet(5);
        },
      },
      'e6-1-8-time-unit-convert-drill': {
        type: 'drill',
        title: '只換時間單位的速率換算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE618TimeUnitConvertSet(5);
        },
      },
      'e6-1-8-double-unit-convert-drill': {
        type: 'drill',
        title: '長度與時間同時換算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE618DoubleUnitConvertSet(5);
        },
      },
      'e6-1-8-compare-speed-drill': {
        type: 'drill',
        title: '不同單位的快慢比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE618CompareSpeedSet(5);
        },
      },
      'e6-1-8-proportionality-drill': {
        type: 'drill',
        title: '倍數關係與正比練習',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE618ProportionalSet(5);
        },
      },
      'e6-1-8-basic-three-subtypes': {
        type: 'drill',
        title: '基礎速率三小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE618BasicThreeSet(5);
        },
      },
      'e6-1-8-convert-three-subtypes': {
        type: 'drill',
        title: '速率單位換算三小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE618ConvertThreeSet(5);
        },
      },
      'e6-1-8-compare-one-subtype': {
        type: 'drill',
        title: '不同單位的快慢比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE618CompareOneSet(5);
        },
      },
      'e6-1-8-proportion-one-subtype': {
        type: 'drill',
        title: '倍數關係與正比練習',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE618ProportionOneSet(5);
        },
      },
      'e6-1-9-scale-factor-drill': {
        type: 'drill',
        title: '辨識放大與縮小的倍數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE619ScaleFactorSet(5);
        },
      },
      'e6-1-9-corresponding-side-drill': {
        type: 'drill',
        title: '對應邊長計算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE619CorrespondingSideSet(5);
        },
      },
      'e6-1-9-angle-property-drill': {
        type: 'drill',
        title: '對應角與內部線段性質',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE619AnglePropertySet(5);
        },
      },
      'e6-1-9-perimeter-scale-drill': {
        type: 'drill',
        title: '周長的倍數變化',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE619PerimeterScaleSet(5);
        },
      },
      'e6-1-9-area-scale-drill': {
        type: 'drill',
        title: '面積的倍數變化',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE619AreaScaleSet(5);
        },
      },
      'e6-1-9-curved-scale-drill': {
        type: 'drill',
        title: '圓與扇形的縮放',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE619CurvedScaleSet(5);
        },
      },
      'e6-1-9-scale-from-map-drill': {
        type: 'drill',
        title: '求比例尺',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE619ScaleFromMapSet(5);
        },
      },
      'e6-1-9-actual-length-drill': {
        type: 'drill',
        title: '求實際長度',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE619ActualLengthSet(5);
        },
      },
      'e6-1-9-map-length-drill': {
        type: 'drill',
        title: '求圖上長度',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE619MapLengthSet(5);
        },
      },
      'e6-1-9-scale-representation-drill': {
        type: 'drill',
        title: '比例尺的表示轉換',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE619ScaleRepresentationSet(5);
        },
      },
      'e6-1-9-scale-comparison-drill': {
        type: 'drill',
        title: '比例尺大小與詳細度比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE619ScaleComparisonSet(5);
        },
      },
      'e6-1-9-scale-core-three-subtypes': {
        type: 'drill',
        title: '縮放倍數與對應性質三小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE619ScaleCoreThreeSet(5);
        },
      },
      'e6-1-9-perimeter-area-curve-three-subtypes': {
        type: 'drill',
        title: '周長、面積與曲線縮放三小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE619PerimeterAreaCurveThreeSet(5);
        },
      },
      'e6-1-9-scale-basic-three-subtypes': {
        type: 'drill',
        title: '比例尺基本換算三小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE619ScaleBasicThreeSet(5);
        },
      },
      'e6-1-9-scale-applied-two-subtypes': {
        type: 'drill',
        title: '比例尺表示與比較二小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE619ScaleAppliedTwoSet(5);
        },
      },
      'e6-1-9-area-ratio-to-scale-drill': {
        type: 'drill',
        title: '面積比與邊長比互推',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE619AreaRatioToScaleSet(5);
        },
      },
      'e6-1-9-map-area-drill': {
        type: 'drill',
        title: '地圖面積換算實際面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE619MapAreaSet(5);
        },
      },
      'e6-2-1-decimal-to-fraction-drill': {
        type: 'drill',
        title: '有限小數化最簡分數',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildE621DecimalToFractionSet(6);
        },
      },
      'e6-2-1-fraction-to-decimal-drill': {
        type: 'drill',
        title: '分數化成有限小數',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildE621FractionToDecimalSet(6);
        },
      },
      'e6-2-1-decimal-to-mixed-fraction-drill': {
        type: 'drill',
        title: '小數化成最簡帶分數',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildE621DecimalToMixedFractionSet(6);
        },
      },
      'e6-2-1-friendly-add-sub-drill': {
        type: 'drill',
        title: '分數與小數加減混合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildE621FriendlyAddSubSet(6);
        },
      },
      'e6-2-1-friendly-mul-div-drill': {
        type: 'drill',
        title: '分數與小數乘除混合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildE621FriendlyMulDivSet(6);
        },
      },
      'e6-2-1-bracket-mixed-drill': {
        type: 'drill',
        title: '含括號的分數小數混合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildE621BracketMixedSet(6);
        },
      },
      'e6-2-1-cross-operation-drill': {
        type: 'drill',
        title: '三步驟四則混合運算',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildE621CrossOperationSet(6);
        },
      },
      'e6-2-1-distributive-shortcut-drill': {
        type: 'drill',
        title: '分配律巧算',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildE621DistributiveShortcutSet(6);
        },
      },
      'e6-2-1-associative-shortcut-drill': {
        type: 'drill',
        title: '結合律湊整計算',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildE621AssociativeShortcutSet(6);
        },
      },
      'e6-2-1-rectangle-reverse-drill': {
        type: 'drill',
        title: '面積反求長或寬',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE621RectangleReverseSet(5);
        },
      },
      'e6-2-1-remaining-quantity-drill': {
        type: 'drill',
        title: '剩餘量應用題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE621RemainingQuantitySet(5);
        },
      },
      'e6-2-1-unit-amount-drill': {
        type: 'drill',
        title: '單位量與平均分裝',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE621UnitAmountSet(5);
        },
      },
      'e6-2-1-conversion-three-subtypes': {
        type: 'drill',
        title: '分數與小數的互換三小類綜合',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildE621ConversionMixedSet(6);
        },
      },
      'e6-2-1-mixed-calc-four-subtypes': {
        type: 'drill',
        title: '分數與小數混合計算四小類綜合',
        difficulty: 'medium',
        questionCount: 8,
        generate() {
          return buildE621MixedCalcSet(8);
        },
      },
      'e6-2-1-shortcut-two-subtypes': {
        type: 'drill',
        title: '運算性質與巧算二小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildE621ShortcutMixedSet(6);
        },
      },
      'e6-2-1-application-three-subtypes': {
        type: 'drill',
        title: '生活應用與反求三小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildE621ApplicationMixedSet(6);
        },
      },
      'e6-2-2-rate-basic-drill': {
        type: 'drill',
        title: '求速率',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE622RateBasicSet(5);
        },
      },
      'e6-2-2-distance-basic-drill': {
        type: 'drill',
        title: '求距離',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE622DistanceBasicSet(5);
        },
      },
      'e6-2-2-time-basic-drill': {
        type: 'drill',
        title: '求時間',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE622TimeBasicSet(5);
        },
      },
      'e6-2-2-unit-convert-drill': {
        type: 'drill',
        title: '速率單位換算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE622UnitConvertSet(5);
        },
      },
      'e6-2-2-compare-speed-drill': {
        type: 'drill',
        title: '不同單位的快慢比較',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE622CompareSpeedSet(5);
        },
      },
      'e6-2-2-average-two-stage-drill': {
        type: 'drill',
        title: '兩段路平均速率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622AverageTwoStageSet(5);
        },
      },
      'e6-2-2-average-round-trip-drill': {
        type: 'drill',
        title: '來回與折返平均速率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622AverageRoundTripSet(5);
        },
      },
      'e6-2-2-average-segment-known-drill': {
        type: 'drill',
        title: '分段已知距離時間的平均速率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622AverageSegmentKnownSet(5);
        },
      },
      'e6-2-2-opposite-meet-time-drill': {
        type: 'drill',
        title: '相向而行求相遇時間',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622OppositeMeetTimeSet(5);
        },
      },
      'e6-2-2-opposite-distance-drill': {
        type: 'drill',
        title: '反方向出發求相距距離',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622OppositeDistanceSet(5);
        },
      },
      'e6-2-2-same-direction-gap-drill': {
        type: 'drill',
        title: '同方向前後距離',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622SameDirectionGapSet(5);
        },
      },
      'e6-2-2-chase-time-drill': {
        type: 'drill',
        title: '已知領先距離的追趕',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622ChaseTimeSet(5);
        },
      },
      'e6-2-2-delayed-chase-drill': {
        type: 'drill',
        title: '先出發再追趕',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622DelayedChaseSet(5);
        },
      },
      'e6-2-2-lifestyle-gap-drill': {
        type: 'drill',
        title: '生活情境的距離差',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622LifestyleGapSet(5);
        },
      },
      'e6-2-2-flow-direct-drill': {
        type: 'drill',
        title: '順流逆流直接求距離',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622FlowDirectSet(5);
        },
      },
      'e6-2-2-flow-solve-water-drill': {
        type: 'drill',
        title: '由順逆流速度反求水速',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622FlowSolveWaterSet(5);
        },
      },
      'e6-2-2-flow-round-trip-drill': {
        type: 'drill',
        title: '流水往返求回程時間',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622FlowRoundTripSet(5);
        },
      },
      'e6-2-2-escalator-drill': {
        type: 'drill',
        title: '平面電扶梯合成速率',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE622EscalatorSet(5);
        },
      },
      'e6-2-2-pass-pole-drill': {
        type: 'drill',
        title: '通過電線桿',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622PassPoleSet(5);
        },
      },
      'e6-2-2-pass-bridge-drill': {
        type: 'drill',
        title: '通過橋',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622PassBridgeSet(5);
        },
      },
      'e6-2-2-solve-obstacle-length-drill': {
        type: 'drill',
        title: '由通過時間反求橋長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622SolveObstacleLengthSet(5);
        },
      },
      'e6-2-2-echo-distance-drill': {
        type: 'drill',
        title: '回聲求距離',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622EchoDistanceSet(5);
        },
      },
      'e6-2-2-two-seg-distance-drill': {
        type: 'drill',
        title: '分段行走求總路程',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE622TwoSegDistanceSet(5);
        },
      },
      'e6-2-2-circular-chase-drill': {
        type: 'drill',
        title: '圓形跑道同向追及',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622CircularChaseSet(5);
        },
      },
      'e6-2-2-partial-remain-drill': {
        type: 'drill',
        title: '行駛後剩餘或途中休息求全程時間',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622PartialRemainSet(5);
        },
      },
      'e6-2-2-basic-five-subtypes': {
        type: 'drill',
        title: '距離、速率與時間的基本關係五小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE622BasicMixedSet(5);
        },
      },
      'e6-2-2-average-three-subtypes': {
        type: 'drill',
        title: '平均速率三小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622AverageMixedSet(5);
        },
      },
      'e6-2-2-relative-six-subtypes': {
        type: 'drill',
        title: '相遇、相距與追趕六小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622RelativeMixedSet(5);
        },
      },
      'e6-2-2-flow-four-subtypes': {
        type: 'drill',
        title: '流水與平面電扶梯四小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622FlowMixedSet(5);
        },
      },
      'e6-2-2-through-four-subtypes': {
        type: 'drill',
        title: '通過問題與隱藏距離四小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE622ThroughMixedSet(5);
        },
      },
      'e6-2-3-polygon-prism-volume-drill': {
        type: 'drill',
        title: '多邊形柱體積',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE623PolygonPrismVolumeSet(5);
        },
      },
      'e6-2-3-cylinder-volume-drill': {
        type: 'drill',
        title: '圓柱體積',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE623CylinderVolumeSet(5);
        },
      },
      'e6-2-3-partial-cylinder-volume-drill': {
        type: 'drill',
        title: '半圓柱與扇形柱體積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623PartialCylinderVolumeSet(5);
        },
      },
      'e6-2-3-polygon-prism-surface-drill': {
        type: 'drill',
        title: '多邊形柱表面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623PolygonPrismSurfaceSet(5);
        },
      },
      'e6-2-3-cylinder-surface-drill': {
        type: 'drill',
        title: '圓柱表面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623CylinderSurfaceSet(5);
        },
      },
      'e6-2-3-lateral-area-application-drill': {
        type: 'drill',
        title: '側面積應用',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623LateralAreaApplicationSet(5);
        },
      },
      'e6-2-3-missing-face-surface-drill': {
        type: 'drill',
        title: '缺面與無蓋表面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623MissingFaceSurfaceSet(5);
        },
      },
      'e6-2-3-reverse-base-area-drill': {
        type: 'drill',
        title: '反求底面積',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE623ReverseBaseAreaSet(5);
        },
      },
      'e6-2-3-reverse-height-drill': {
        type: 'drill',
        title: '反求柱高',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE623ReverseHeightSet(5);
        },
      },
      'e6-2-3-reverse-width-drill': {
        type: 'drill',
        title: '長方體反求寬',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE623ReverseWidthSet(5);
        },
      },
      'e6-2-3-height-compare-drill': {
        type: 'drill',
        title: '同體積柱高比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623HeightCompareSet(5);
        },
      },
      'e6-2-3-composite-prism-volume-drill': {
        type: 'drill',
        title: '複合形體體積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623CompositePrismVolumeSet(5);
        },
      },
      'e6-2-3-hollow-rect-volume-drill': {
        type: 'drill',
        title: '空心長方柱材積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623HollowRectVolumeSet(5);
        },
      },
      'e6-2-3-hollow-cylinder-volume-drill': {
        type: 'drill',
        title: '空心圓柱材積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623HollowCylinderVolumeSet(5);
        },
      },
      'e6-2-3-drilled-solid-volume-drill': {
        type: 'drill',
        title: '挖空後剩餘體積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623DrilledSolidVolumeSet(5);
        },
      },
      'e6-2-3-tank-capacity-drill': {
        type: 'drill',
        title: '容器容量',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE623TankCapacitySet(5);
        },
      },
      'e6-2-3-label-wrap-drill': {
        type: 'drill',
        title: '標籤與包裝側面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623LabelWrapSet(5);
        },
      },
      'e6-2-3-paint-area-application-drill': {
        type: 'drill',
        title: '粉刷面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623PaintAreaApplicationSet(5);
        },
      },
      'e6-2-3-water-rise-displacement-drill': {
        type: 'drill',
        title: '水位上升與排水體積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623WaterRiseDisplacementSet(5);
        },
      },
      'e6-2-3-package-compare-drill': {
        type: 'drill',
        title: '包裝面積比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623PackageCompareSet(5);
        },
      },
      'e6-2-3-cube-to-max-cylinder-drill': {
        type: 'drill',
        title: '正方體削成最大圓柱',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623CubeToMaxCylinderSet(5);
        },
      },
      'e6-2-3-dim-change-volume-drill': {
        type: 'drill',
        title: '維度增加求體積變化',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623DimChangeVolumeSet(5);
        },
      },
      'e6-2-3-volume-basic-three-subtypes': {
        type: 'drill',
        title: '柱體體積基本計算三小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE623VolumeBasicMixedSet(5);
        },
      },
      'e6-2-3-surface-area-four-subtypes': {
        type: 'drill',
        title: '柱體表面積與側面積四小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623SurfaceAreaMixedSet(5);
        },
      },
      'e6-2-3-reverse-compare-four-subtypes': {
        type: 'drill',
        title: '逆向求解與參數比較四小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE623ReverseCompareMixedSet(5);
        },
      },
      'e6-2-3-composite-hollow-four-subtypes': {
        type: 'drill',
        title: '複合形體與空心柱體四小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623CompositeHollowMixedSet(5);
        },
      },
      'e6-2-3-application-five-subtypes': {
        type: 'drill',
        title: '生活應用五小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE623ApplicationMixedSet(5);
        },
      },
      'e6-2-4-find-ratio-drill': {
        type: 'drill',
        title: '求比值',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE624FindRatioSet(5);
        },
      },
      'e6-2-4-find-compared-drill': {
        type: 'drill',
        title: '已知基準量求比較量',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE624FindComparedSet(5);
        },
      },
      'e6-2-4-find-base-drill': {
        type: 'drill',
        title: '已知比較量求基準量',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE624FindBaseSet(5);
        },
      },
      'e6-2-4-fraction-multiplier-drill': {
        type: 'drill',
        title: '分數倍與帶分數倍',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE624FractionMultiplierSet(5);
        },
      },
      'e6-2-4-sum-pair-drill': {
        type: 'drill',
        title: '兩量和與倍數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE624SumPairSet(5);
        },
      },
      'e6-2-4-markup-total-drill': {
        type: 'drill',
        title: '加成後總量',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE624MarkupTotalSet(5);
        },
      },
      'e6-2-4-interest-total-drill': {
        type: 'drill',
        title: '本利和',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE624InterestTotalSet(5);
        },
      },
      'e6-2-4-exposed-total-drill': {
        type: 'drill',
        title: '露出部分與全長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE624ExposedTotalSet(5);
        },
      },
      'e6-2-4-difference-pair-drill': {
        type: 'drill',
        title: '兩量差與倍數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE624DifferencePairSet(5);
        },
      },
      'e6-2-4-discount-saved-drill': {
        type: 'drill',
        title: '折扣省下多少',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE624DiscountSavedSet(5);
        },
      },
      'e6-2-4-remaining-amount-drill': {
        type: 'drill',
        title: '剩餘量計算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE624RemainingAmountSet(5);
        },
      },
      'e6-2-4-difference-from-base-drill': {
        type: 'drill',
        title: '已知基準量求差額',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE624DifferenceFromBaseSet(5);
        },
      },
      'e6-2-4-recover-original-from-remain-drill': {
        type: 'drill',
        title: '由剩餘量反求原量',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE624RecoverOriginalFromRemainSet(5);
        },
      },
      'e6-2-4-recover-original-from-discount-drill': {
        type: 'drill',
        title: '由省下金額反求原價',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE624RecoverOriginalFromDiscountSet(5);
        },
      },
      'e6-2-4-recover-cost-from-markup-drill': {
        type: 'drill',
        title: '由定價反求成本',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE624RecoverCostFromMarkupSet(5);
        },
      },
      'e6-2-4-recover-principal-from-final-drill': {
        type: 'drill',
        title: '由本利和反求本金',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE624RecoverPrincipalFromFinalSet(5);
        },
      },
      'e6-2-4-three-part-direct-drill': {
        type: 'drill',
        title: '三量比例直接求量',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE624ThreePartDirectSet(5);
        },
      },
      'e6-2-4-three-part-total-drill': {
        type: 'drill',
        title: '三量比例由總和反推',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE624ThreePartTotalSet(5);
        },
      },
      'e6-2-4-age-sum-multiple-drill': {
        type: 'drill',
        title: '年齡和與倍數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE624AgeSumMultipleSet(5);
        },
      },
      'e6-2-4-geometry-ratio-drill': {
        type: 'drill',
        title: '幾何量的倍數比較',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE624GeometryRatioSet(5);
        },
      },
      'e6-2-4-basic-four-subtypes': {
        type: 'drill',
        title: '基礎比值與單步互求四小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE624BasicMixedSet(5);
        },
      },
      'e6-2-4-sum-four-subtypes': {
        type: 'drill',
        title: '兩量之和與加成四小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE624SumMixedSet(5);
        },
      },
      'e6-2-4-difference-four-subtypes': {
        type: 'drill',
        title: '兩量之差與剩餘四小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE624DifferenceMixedSet(5);
        },
      },
      'e6-2-4-reverse-four-subtypes': {
        type: 'drill',
        title: '逆求基準量四小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE624ReverseMixedSet(5);
        },
      },
      'e6-2-4-application-four-subtypes': {
        type: 'drill',
        title: '多量比例與綜合應用四小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE624ApplicationMixedSet(5);
        },
      },
      'e6-2-5-sum-diff-basic-drill': {
        type: 'drill',
        title: '和差求兩數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625SumDiffBasicSet(5);
        },
      },
      'e6-2-5-transfer-equal-drill': {
        type: 'drill',
        title: '給予後相等',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625TransferEqualSet(5);
        },
      },
      'e6-2-5-rectangle-sum-diff-drill': {
        type: 'drill',
        title: '長方形長寬和差',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625RectangleSumDiffSet(5);
        },
      },
      'e6-2-5-balance-reverse-drill': {
        type: 'drill',
        title: '平衡反推原量',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625BalanceReverseSet(5);
        },
      },
      'e6-2-5-age-future-multiple-drill': {
        type: 'drill',
        title: '幾年後變成幾倍',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625AgeFutureMultipleSet(5);
        },
      },
      'e6-2-5-age-past-multiple-drill': {
        type: 'drill',
        title: '幾年前是幾倍',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625AgePastMultipleSet(5);
        },
      },
      'e6-2-5-age-future-condition-drill': {
        type: 'drill',
        title: '已知未來條件求現在',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625AgeFutureConditionSet(5);
        },
      },
      'e6-2-5-age-diff-multiple-drill': {
        type: 'drill',
        title: '已知差與倍數求現在',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625AgeDiffMultipleSet(5);
        },
      },
      'e6-2-5-chicken-rabbit-leg-drill': {
        type: 'drill',
        title: '雞兔腳數型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625ChickenRabbitLegSet(5);
        },
      },
      'e6-2-5-chicken-rabbit-money-drill': {
        type: 'drill',
        title: '雞兔錢幣票數型',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625ChickenRabbitMoneySet(5);
        },
      },
      'e6-2-5-chicken-rabbit-score-drill': {
        type: 'drill',
        title: '雞兔單價配分類',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625ChickenRabbitScoreSet(5);
        },
      },
      'e6-2-5-average-missing-drill': {
        type: 'drill',
        title: '缺失值平均',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625AverageMissingSet(5);
        },
      },
      'e6-2-5-average-target-drill': {
        type: 'drill',
        title: '目標平均反推',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625AverageTargetSet(5);
        },
      },
      'e6-2-5-average-merge-drill': {
        type: 'drill',
        title: '合併平均反推',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625AverageMergeSet(5);
        },
      },
      'e6-2-5-average-subject-drill': {
        type: 'drill',
        title: '多科平均反推',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625AverageSubjectSet(5);
        },
      },
      'e6-2-5-addition-choice-drill': {
        type: 'drill',
        title: '分類單選加法原理',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625AdditionChoiceSet(5);
        },
      },
      'e6-2-5-multiplication-pair-drill': {
        type: 'drill',
        title: '分步搭配乘法原理',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625MultiplicationPairSet(5);
        },
      },
      'e6-2-5-route-drill': {
        type: 'drill',
        title: '路徑搭配',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625RouteSet(5);
        },
      },
      'e6-2-5-entry-exit-drill': {
        type: 'drill',
        title: '進出限制',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625EntryExitSet(5);
        },
      },
      'e6-2-5-digit-restriction-drill': {
        type: 'drill',
        title: '二位數排列限制',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625DigitRestrictionSet(5);
        },
      },
      'e6-2-5-sum-diff-four-subtypes': {
        type: 'drill',
        title: '和差與平衡四小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625SumDiffMixedSet(5);
        },
      },
      'e6-2-5-age-four-subtypes': {
        type: 'drill',
        title: '年齡問題四小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625AgeMixedSet(5);
        },
      },
      'e6-2-5-chicken-rabbit-three-subtypes': {
        type: 'drill',
        title: '雞兔問題三小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625ChickenRabbitMixedSet(5);
        },
      },
      'e6-2-5-average-four-subtypes': {
        type: 'drill',
        title: '平均數逆推四小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625AverageMixedSet(5);
        },
      },
      'e6-2-5-principle-five-subtypes': {
        type: 'drill',
        title: '加法原理與乘法原理五小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625PrincipleMixedSet(5);
        },
      },
      'e6-2-5-linear-int-coef-drill': {
        type: 'drill',
        title: '整數係數一元一次方程',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625LinearIntCoefSet(5);
        },
      },
      'e6-2-5-linear-frac-coef-drill': {
        type: 'drill',
        title: '分數係數一元一次方程',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625LinearFracCoefSet(5);
        },
      },
      'e6-2-5-linear-bracket-frac-drill': {
        type: 'drill',
        title: '括號與分數型方程式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625LinearBracketFracSet(5);
        },
      },
      'e6-2-5-linear-frac-merge-drill': {
        type: 'drill',
        title: '合併分數求未知數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625LinearFracMergeSet(5);
        },
      },
      'e6-2-5-distribute-remain-drill': {
        type: 'drill',
        title: '分配後剩餘型應用題',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625DistributeRemainSet(5);
        },
      },
      'e6-2-5-price-change-drill': {
        type: 'drill',
        title: '買賣找零型應用題',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE625PriceChangeSet(5);
        },
      },
      'e6-2-5-consume-then-share-drill': {
        type: 'drill',
        title: '消耗後平分型應用題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625ConsumeThenShareSet(5);
        },
      },
      'e6-2-5-surplus-deficit-drill': {
        type: 'drill',
        title: '多一個少一個型應用題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625SurplusDeficitSet(5);
        },
      },
      'e6-2-5-fraction-consume-drill': {
        type: 'drill',
        title: '分數消耗型應用題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE625FractionConsumeSet(5);
        },
      },
      'e6-2-6-count-to-percent-drill': {
        type: 'drill',
        title: '原始數據求各項百分率',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE626CountToPercentSet(5);
        },
      },
      'e6-2-6-amount-to-percent-drill': {
        type: 'drill',
        title: '金額分配求百分率',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE626AmountToPercentSet(5);
        },
      },
      'e6-2-6-missing-percent-drill': {
        type: 'drill',
        title: '缺少一項百分率補齊',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE626MissingPercentSet(5);
        },
      },
      'e6-2-6-percent-to-angle-drill': {
        type: 'drill',
        title: '百分率換圓心角',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE626PercentToAngleSet(5);
        },
      },
      'e6-2-6-angle-to-percent-drill': {
        type: 'drill',
        title: '圓心角換百分率',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE626AngleToPercentSet(5);
        },
      },
      'e6-2-6-mixed-angle-percent-drill': {
        type: 'drill',
        title: '百分率與圓心角混合補齊',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE626MixedAnglePercentSet(5);
        },
      },
      'e6-2-6-part-from-percent-drill': {
        type: 'drill',
        title: '已知百分率求部分量',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE626PartFromPercentSet(5);
        },
      },
      'e6-2-6-part-from-angle-drill': {
        type: 'drill',
        title: '已知圓心角求部分量',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE626PartFromAngleSet(5);
        },
      },
      'e6-2-6-multi-part-amount-drill': {
        type: 'drill',
        title: '多項部分量推算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE626MultiPartAmountSet(5);
        },
      },
      'e6-2-6-same-percent-compare-drill': {
        type: 'drill',
        title: '同百分率不同總量比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE626SamePercentCompareSet(5);
        },
      },
      'e6-2-6-different-percent-compare-drill': {
        type: 'drill',
        title: '不同百分率的實際量比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE626DifferentPercentCompareSet(5);
        },
      },
      'e6-2-6-spend-compare-drill': {
        type: 'drill',
        title: '總量與百分率綜合比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE626SpendCompareSet(5);
        },
      },
      'e6-2-6-chart-selection-drill': {
        type: 'drill',
        title: '統計圖表選用',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE626ChartSelectionSet(5);
        },
      },
      'e6-2-6-possibility-drill': {
        type: 'drill',
        title: '圓形圖中的可能性判讀',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE626PossibilitySet(5);
        },
      },
      'e6-2-6-mixed-reading-drill': {
        type: 'drill',
        title: '圓形圖綜合判讀',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE626MixedPieReadingSet(5);
        },
      },
      'e6-2-6-percent-three-subtypes': {
        type: 'drill',
        title: '百分率與原始數據三小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE626PercentMixedSet(5);
        },
      },
      'e6-2-6-angle-three-subtypes': {
        type: 'drill',
        title: '圓心角與百分率三小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE626AngleMixedSet(5);
        },
      },
      'e6-2-6-part-three-subtypes': {
        type: 'drill',
        title: '比率求部分量三小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE626PartMixedSet(5);
        },
      },
      'e6-2-6-compare-three-subtypes': {
        type: 'drill',
        title: '圓形圖比較判讀三小類綜合',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildE626CompareMixedSet(5);
        },
      },
      'e6-2-6-interpret-three-subtypes': {
        type: 'drill',
        title: '選圖與判讀三小類綜合',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE626InterpretMixedSet(5);
        },
      },
      'e6-2-6-average-from-data-drill': {
        type: 'drill',
        title: '從資料計算平均數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildE626AverageFromDataSet(5);
        },
      },
  };

  const bundleFingerprint = "e6-bundle-v20260628-v3";
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== "object") return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
