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

  function isPerfectSquare(n) {
    if (n < 0) return false;
    const r = Math.floor(Math.sqrt(n));
    return r * r === n;
  }

  function pickFromList(list) {
    return list[randInt(0, list.length - 1)];
  }

  function pickPositivePairWithSum(sum, minPart = 60) {
    let first = randInt(minPart, sum - minPart);
    while (first === sum - first) first = randInt(minPart, sum - minPart);
    return [first, sum - first];
  }

  function pickSignedPairWithSum(sum) {
    let positive = 0;
    let negative = 0;
    while (positive === 0 || negative === 0 || negative >= 0) {
      positive = randInt(Math.max(20, Math.abs(sum) + 10), Math.max(60, Math.abs(sum) + 120));
      negative = sum - positive;
    }
    return [positive, negative];
  }

  function buildMidpointSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-30, 30);
      const b = randInt(-30, 30);
      questions.push(`求 ${a} 與 ${b} 的中點。`);
      const sum = a + b;
      const sumExpr = `${a}${b < 0 ? `+(${b})` : `+${b}`}`;
      summaryAnswers.push(`$${formatFraction(sum, 2)}$`);
      if (sum % 2 === 0) {
        answers.push(`中點 = $\\frac{${sumExpr}}{2}$ = ${sum / 2}`);
      } else {
        answers.push(`中點 = $\\frac{${sumExpr}}{2}=\\frac{${sum}}{2}$`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildDistanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-30, 30);
      const b = randInt(-30, 30);
      const distance = Math.abs(a - b);
      questions.push(`求 ${a} 與 ${b} 的距離。`);
      summaryAnswers.push(`$${distance}$`);
      answers.push(`距離 = |${a}-${b}| = ${distance}`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildThreeProductSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const triples = Array.from({ length: 3 }, () => [pickNonZero(-9, 9), pickNonZero(-9, 9)]);
      const ops = shuffle(['+', '-']);
      const products = triples.map(([a, b]) => a * b);
      const q = `${wrapIfNegative(triples[0][0])}\\times${wrapIfNegative(triples[0][1])} ${ops[0]} ${wrapIfNegative(triples[1][0])}\\times${wrapIfNegative(triples[1][1])} ${ops[1]} ${wrapIfNegative(triples[2][0])}\\times${wrapIfNegative(triples[2][1])}`;
      let total = products[0];
      total = ops[0] === '+' ? total + products[1] : total - products[1];
      total = ops[1] === '+' ? total + products[2] : total - products[2];
      questions.push(`計算：$${q}$`);
      summaryAnswers.push(`$${total}$`);
      answers.push(
        `$${wrapIfNegative(products[0])} ${ops[0]} ${wrapIfNegative(products[1])} ${ops[1]} ${wrapIfNegative(products[2])} = ${total}$`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function formatClockLabel(hour24) {
    const h = ((hour24 % 24) + 24) % 24;
    if (h === 12) return '中午12時';
    if (h === 0) return '上午12時';
    if (h < 12) return `上午${h}時`;
    return `下午${h - 12}時`;
  }

  function buildTimeBaselineBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const rate = pickNonZero(-12, 12);
      let knownHour = randInt(6, 22);
      while (knownHour === 12) knownHour = randInt(6, 22);
      let askHour = randInt(5, 22);
      while (askHour === 12 || askHour === knownHour) askHour = randInt(5, 22);

      const knownValue = (knownHour - 12) * rate;
      const askValue = (askHour - 12) * rate;
      const knownText = formatClockLabel(knownHour);
      const askText = formatClockLabel(askHour);
      const knownValueText = knownValue > 0 ? `+${knownValue}` : `${knownValue}`;

      questions.push(`中午12時為基準，${knownText}記為${knownValueText}，則${askText}記作____。`);
      summaryAnswers.push(`$${askValue}$`);
      answers.push(`${askValue}`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildTimeBaselineAdvancedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const rate = pickNonZero(-18, 18);
      const bias = randInt(-120, 120);
      let h1 = randInt(1, 23);
      let h2 = randInt(1, 23);
      let h3 = randInt(1, 23);
      while (h2 === h1) h2 = randInt(1, 23);
      while (h3 === h1 || h3 === h2) h3 = randInt(1, 23);

      const v1 = rate * h1 + bias;
      const v2 = rate * h2 + bias;
      const v3 = rate * h3 + bias;
      const t1 = formatClockLabel(h1);
      const t2 = formatClockLabel(h2);
      const t3 = formatClockLabel(h3);

      questions.push(`若${t1}記為${v1}，${t2}記為${v2}，則${t3}記為應記為何？`);
      summaryAnswers.push(`$${v3}$`);
      answers.push(`${v3}`);
    }
    return { questions, summaryAnswers, answers };
  }

  function formatSignedOffset(value) {
    if (value > 0) return `+${value}`;
    if (value < 0) return `${value}`;
    return '0';
  }

  function buildBalancedOffsets(length, maxOffset) {
    while (true) {
      const offsets = [];
      let sum = 0;
      for (let i = 0; i < length - 1; i += 1) {
        const offset = randInt(-maxOffset, maxOffset);
        offsets.push(offset);
        sum += offset;
      }
      const last = -sum;
      if (Math.abs(last) > maxOffset) continue;
      offsets.push(last);
      if (offsets.every((value) => value === 0)) continue;
      return shuffle(offsets);
    }
  }

  function buildNearbyAverageBaselineSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const baselines = [60, 70, 80, 90];

    for (let i = 0; i < count; i += 1) {
      const baseline = baselines[randInt(0, baselines.length - 1)];
      const offsets = buildBalancedOffsets(5, 9);
      const numbers = offsets.map((offset) => baseline + offset);
      const mode = randInt(0, 1);

      if (mode === 0) {
        const numberText = numbers.join('、');
        const offsetText = offsets.map((offset) => formatSignedOffset(offset)).join('、');
        questions.push(`以 ${baseline} 為基準值，五個整數 ${numberText} 的平均數是多少？`);
        summaryAnswers.push(`$${baseline}$`);
        answers.push(
          `以 ${baseline} 為基準值，五個數和基準值的差分別是 ${offsetText}，差的總和是 0，所以平均數就是 ${baseline}。`
        );
        continue;
      }

      const missingIndex = randInt(0, numbers.length - 1);
      const xValue = numbers[missingIndex];
      const visibleNumbers = numbers.map((value, index) => (index === missingIndex ? 'x' : String(value)));
      const knownOffsets = offsets
        .map((offset, index) => (index === missingIndex ? null : formatSignedOffset(offset)))
        .filter((value) => value !== null);
      const missingOffset = offsets[missingIndex];
      questions.push(`以 ${baseline} 為基準值，五個整數 ${visibleNumbers.join('、')} 的平均數是 ${baseline}，求 x。`);
      summaryAnswers.push(`$${xValue}$`);
      answers.push(
        `已知另外四個數相對 ${baseline} 的差是 ${knownOffsets.join('、')}，合計是 ${formatSignedOffset(-missingOffset)} 的相反數，所以 x 相對 ${baseline} 的差要是 ${formatSignedOffset(missingOffset)}，因此 x = ${xValue}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function formatDecimalValue(value) {
    if (Number.isInteger(value)) return `${value}`;
    return `${Number(value.toFixed(6))}`;
  }

  function buildExponentSignBracketSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const base = randInt(2, 6);
        const exponent = randInt(2, 6);
        const left = Math.pow(-base, exponent);
        const right = -Math.pow(base, exponent);
        const relation = left > right ? '>' : left < right ? '<' : '=';
        questions.push(`比較：$(-${base})^{${exponent}}$ 與 $-${base}^{${exponent}}$。`);
        summaryAnswers.push(`$${left} ${relation} ${right}$`);
        answers.push(
          exponent % 2 === 0
            ? `$(-${base})^{${exponent}}=${left}$，因為偶數次方會把負號一起平方成正；而 $-${base}^{${exponent}}=${right}$ 是先算 ${base}^{${exponent}} 再補前面的負號，所以關係是 $${left} ${relation} ${right}$。`
            : `$(-${base})^{${exponent}}=${left}$，$-${base}^{${exponent}}=${right}$。這一題雖然結果同為負數，但前者是整個 $(-${base})$ 連乘，後者是 ${base}^{${exponent}} 前面再補負號，所以兩者關係是 $${left}=${right}$。`
        );
        continue;
      }

      if (mode === 1) {
        const exponent = randInt(2, 9);
        const value = Math.pow(-1, exponent);
        const signText = value > 0 ? '正數' : '負數';
        questions.push(`判斷：$(-1)^{${exponent}}$ 是正數還是負數？`);
        summaryAnswers.push(signText);
        answers.push(
          `因為 ${exponent} 是${exponent % 2 === 0 ? '偶數' : '奇數'}，所以 $(-1)^{${exponent}}=${value}$，是${signText}。`
        );
        continue;
      }

      const base = randInt(2, 6);
      const exponent = randInt(2, 5);
      const inner = Math.pow(-base, exponent);
      const total = -inner;
      questions.push(`計算：$-(-${base})^{${exponent}}$。`);
      summaryAnswers.push(`$${total}$`);
      answers.push(
        `先算括號裡的次方：$(-${base})^{${exponent}}=${inner}$，再補最前面的負號，所以 $-(-${base})^{${exponent}}=${total}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildExponentLawSingleRuleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bases = [2, 3, 4, 5, 6, 7];

    for (let i = 0; i < count; i += 1) {
      const base = bases[randInt(0, bases.length - 1)];
      const mode = i % 3;

      if (mode === 0) {
        const a = randInt(2, 6);
        const b = randInt(2, 6);
        questions.push(`計算：$${base}^{${a}}\\times ${base}^{${b}}$。`);
        summaryAnswers.push(`$${base}^{${a + b}}$`);
        answers.push(`同底數相乘，指數相加，所以 $${base}^{${a}}\\times ${base}^{${b}}=${base}^{${a + b}}$。`);
        continue;
      }

      if (mode === 1) {
        const a = randInt(5, 10);
        const b = randInt(2, a - 1);
        questions.push(`計算：$${base}^{${a}}\\div ${base}^{${b}}$。`);
        summaryAnswers.push(`$${base}^{${a - b}}$`);
        answers.push(`同底數相除，指數相減，所以 $${base}^{${a}}\\div ${base}^{${b}}=${base}^{${a - b}}$。`);
        continue;
      }

      const a = randInt(2, 5);
      const b = randInt(2, 4);
      questions.push(`計算：$(${base}^{${a}})^{${b}}$。`);
      summaryAnswers.push(`$${base}^{${a * b}}$`);
      answers.push(`乘方的乘方，指數相乘，所以 $(${base}^{${a}})^{${b}}=${base}^{${a * b}}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildExponentLawMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bases = [2, 3, 4, 5, 6, 7];

    for (let i = 0; i < count; i += 1) {
      const base = bases[randInt(0, bases.length - 1)];
      const mode = i % 5;

      if (mode === 0) {
        const a = randInt(2, 5);
        const b = randInt(2, 4);
        const c = randInt(2, 5);
        const totalExponentBase = a + b * c;
        const d = randInt(1, Math.max(1, totalExponentBase - 1));
        const totalExponent = totalExponentBase - d;
        questions.push(`計算：$${base}^{${a}}\\times (${base}^{${b}})^{${c}}\\div ${base}^{${d}}$。`);
        summaryAnswers.push(`$${base}^{${totalExponent}}$`);
        answers.push(
          `先做乘方的乘方：$(${base}^{${b}})^{${c}}=${base}^{${b * c}}$；再同底數相乘相除，把指數整理成 $${a}+${b * c}-${d}=${totalExponent}$，所以結果是 $${base}^{${totalExponent}}$。`
        );
        continue;
      }

      if (mode === 1) {
        const a = randInt(2, 5);
        const b = randInt(2, 4);
        const c = randInt(2, 4);
        const d = randInt(2, 4);
        const totalExponent = a * b + c * d;
        questions.push(`計算：$(${base}^{${a}})^{${b}}\\times (${base}^{${c}})^{${d}}$。`);
        summaryAnswers.push(`$${base}^{${totalExponent}}$`);
        answers.push(
          `先把兩個乘方的乘方展開：$(${base}^{${a}})^{${b}}=${base}^{${a * b}}$，$(${base}^{${c}})^{${d}}=${base}^{${c * d}}$；再同底數相乘，指數相加得 $${a * b}+${c * d}=${totalExponent}$，所以結果是 $${base}^{${totalExponent}}$。`
        );
        continue;
      }

      if (mode === 2) {
        const a = randInt(2, 5);
        const b = randInt(2, 4);
        const c = randInt(2, 5);
        const d = randInt(2, 4);
        const totalLeft = a * b;
        const totalRight = c * d;
        const totalExponent = totalLeft - totalRight;
        questions.push(`計算：$(${base}^{${a}})^{${b}}\\div (${base}^{${c}})^{${d}}$。`);
        summaryAnswers.push(`$${base}^{${totalExponent}}$`);
        answers.push(
          `先做乘方的乘方：$(${base}^{${a}})^{${b}}=${base}^{${totalLeft}}$，$(${base}^{${c}})^{${d}}=${base}^{${totalRight}}$；再同底數相除，指數相減得 $${totalLeft}-${totalRight}=${totalExponent}$，所以結果是 $${base}^{${totalExponent}}$。`
        );
        continue;
      }

      if (mode === 3) {
        const a = randInt(2, 5);
        const b = randInt(2, 4);
        const c = randInt(2, 5);
        const d = randInt(1, 4);
        const totalExponent = (a + b) * c - d;
        questions.push(`計算：$(${base}^{${a}}\\times ${base}^{${b}})^{${c}}\\div ${base}^{${d}}$。`);
        summaryAnswers.push(`$${base}^{${totalExponent}}$`);
        answers.push(
          `先把括號內同底數相乘整理成 $${base}^{${a + b}}$；再做乘方的乘方，得到 $(${base}^{${a + b}})^{${c}}=${base}^{${(a + b) * c}}$；最後再除以 ${base}^{${d}}，指數相減得 $${(a + b) * c}-${d}=${totalExponent}$，所以結果是 $${base}^{${totalExponent}}$。`
        );
        continue;
      }

      const a = randInt(2, 5);
      const b = randInt(2, 4);
      const c = randInt(2, 5);
      const d = randInt(2, 4);
      const e = randInt(1, 4);
      const totalExponent = a + b * c - d * e;
      questions.push(`計算：$${base}^{${a}}\\times (${base}^{${b}})^{${c}}\\div (${base}^{${d}})^{${e}}$。`);
      summaryAnswers.push(`$${base}^{${totalExponent}}$`);
      answers.push(
        `先把乘方的乘方整理成 $(${base}^{${b}})^{${c}}=${base}^{${b * c}}$，$(${base}^{${d}})^{${e}}=${base}^{${d * e}}$；再同底數相乘相除，把指數整理成 $${a}+${b * c}-${d * e}=${totalExponent}$，所以結果是 $${base}^{${totalExponent}}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildExponentMixedOperationsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;

      if (mode === 0) {
        const a = randInt(2, 5);
        const b = randInt(2, 4);
        const c = randInt(2, 4);
        const value = -Math.pow(a, 2) + Math.pow(-b, 3) - Math.pow(-1, c);
        questions.push(`計算：$-${a}^{2}+(-${b}^{3})-(-1)^{${c}}$。`);
        summaryAnswers.push(`$${value}$`);
        answers.push(
          `先算次方：$-${a}^{2}=-${a * a}$，$(-${b}^{3})=-${Math.pow(b, 3)}$，$(-1)^{${c}}=${Math.pow(-1, c)}$，所以結果是 ${value}。`
        );
        continue;
      }

      if (mode === 1) {
        const a = randInt(2, 6);
        const b = randInt(1, 3);
        const c = randInt(2, 4);
        const left = Math.pow(-a, 0);
        const middle = b * Math.pow(10, -2);
        const right = Math.pow(-1, c * 2);
        const value = left + middle + right;
        questions.push(`計算：$(-${a})^{0}+${b}\\times 10^{-2}+(-1)^{${c * 2}}$。`);
        summaryAnswers.push(`$${formatDecimalValue(value)}$`);
        answers.push(
          `零次方等於 1，$10^{-2}=0.01$，偶數次方的 $(-1)$ 等於 1，所以結果是 $1+${formatDecimalValue(middle)}+1=${formatDecimalValue(value)}$。`
        );
        continue;
      }

      if (mode === 2) {
        const a = randInt(2, 4);
        const b = randInt(2, 3);
        const left = Math.pow(2, -a);
        const right = Math.pow(10, -b);
        const value = left + right;
        questions.push(`計算：$2^{-${a}}+10^{-${b}}$。`);
        summaryAnswers.push(`$${formatDecimalValue(value)}$`);
        answers.push(
          `負次方先改成倒數：$2^{-${a}}=\\frac{1}{2^{${a}}}=${formatDecimalValue(left)}$，$10^{-${b}}=\\frac{1}{10^{${b}}}=${formatDecimalValue(right)}$，所以結果是 ${formatDecimalValue(value)}。`
        );
        continue;
      }

      const a = randInt(2, 4);
      const b = randInt(2, 4);
      const c = randInt(2, 3);
      const d = randInt(2, 4);
      const value = (Math.pow(-a, 2) * -Math.pow(b, 2) * Math.pow(5, c)) / Math.pow(5, d);
      questions.push(`計算：$(-${a})^{2}\\times (-${b}^{2})\\times 5^{${c}}\\div 5^{${d}}$。`);
      summaryAnswers.push(`$${formatDecimalValue(value)}$`);
      answers.push(
        `先算次方：$(-${a})^{2}=${Math.pow(-a, 2)}$，$-${b}^{2}=-${Math.pow(b, 2)}$；再整理同底數：$5^{${c}}\\div 5^{${d}}=5^{${c - d}}$，合起來結果是 ${formatDecimalValue(value)}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildExponentWordProblemSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;

      if (mode === 0) {
        const start = randInt(1, 9);
        const interval = [3, 4, 6][randInt(0, 2)];
        const times = randInt(3, 6);
        const hours = interval * times;
        const value = start * Math.pow(2, times);
        questions.push(
          `某種細菌每 ${interval} 小時數量會變成原來的 2 倍，原本有 ${start} 個，經過 ${hours} 小時後共有多少個？`
        );
        summaryAnswers.push(`$${value}$ 個`);
        answers.push(
          `每 ${interval} 小時乘上 2 倍，${hours} 小時共經過 ${times} 次變化，所以數量是 $${start}\\times 2^{${times}}=${value}$。`
        );
        continue;
      }

      if (mode === 1) {
        const step = randInt(4, 7);
        const value = Math.pow(4, step);
        questions.push(`把一張紙先分成 4 張，每一張再各分成 4 張，依此規律分到第 ${step} 步，這時共有多少張？`);
        summaryAnswers.push(`$${value}$ 張`);
        answers.push(`每一步都乘上 4，所以第 ${step} 步共有 $4^{${step}}=${value}$ 張。`);
        continue;
      }

      const start = randInt(2, 8);
      const interval = [2, 3, 5][randInt(0, 2)];
      const times = randInt(3, 5);
      const minutes = interval * times;
      const value = start * Math.pow(3, times);
      questions.push(
        `某種遊戲道具每 ${interval} 分鐘會變成原來的 3 倍，原本有 ${start} 個，經過 ${minutes} 分鐘後共有多少個？`
      );
      summaryAnswers.push(`$${value}$ 個`);
      answers.push(
        `每 ${interval} 分鐘乘上 3，${minutes} 分鐘共經過 ${times} 次變化，所以數量是 $${start}\\times 3^{${times}}=${value}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function trimDecimalString(text) {
    const source = String(text || '').trim();
    if (!source.includes('.')) return source;
    return source.replace(/0+$/g, '').replace(/\.$/g, '');
  }

  function normalizePlainNumberString(text) {
    const source = String(text || '').trim();
    if (!source) return '0';
    const negative = source.startsWith('-');
    const body = negative ? source.slice(1) : source;
    if (body.includes('.')) {
      const [rawInt, rawFrac] = body.split('.');
      const intPart = rawInt.replace(/^0+(?=\d)/, '') || '0';
      const fracPart = rawFrac.replace(/0+$/g, '');
      const normalized = fracPart ? `${intPart}.${fracPart}` : intPart;
      return negative ? `-${normalized}` : normalized;
    }
    const normalized = body.replace(/^0+(?=\d)/, '') || '0';
    return negative ? `-${normalized}` : normalized;
  }

  function scientificToPlainString(coefficientText, exponent) {
    const source = trimDecimalString(String(coefficientText || '').trim());
    if (!source) return '0';
    const negative = source.startsWith('-');
    const body = negative ? source.slice(1) : source;
    const parts = body.split('.');
    const intPart = parts[0] || '0';
    const fracPart = parts[1] || '';
    const digits = `${intPart}${fracPart}`.replace(/^0+(?=\d)/, '') || '0';
    const shift = Number(exponent) - fracPart.length;
    let plain = '';
    if (shift >= 0) {
      plain = digits + '0'.repeat(shift);
    } else {
      const pointIndex = digits.length + shift;
      if (pointIndex > 0) {
        plain = `${digits.slice(0, pointIndex)}.${digits.slice(pointIndex)}`;
      } else {
        plain = `0.${'0'.repeat(-pointIndex)}${digits}`;
      }
    }
    const normalized = normalizePlainNumberString(plain);
    return negative ? `-${normalized}` : normalized;
  }

  function plainToScientificParts(numberText) {
    const source = normalizePlainNumberString(numberText);
    const negative = source.startsWith('-');
    const body = negative ? source.slice(1) : source;
    if (!body || body === '0') {
      return { coefficient: '0', exponent: 0, text: '0' };
    }
    const [rawInt, rawFrac = ''] = body.split('.');
    const intPart = rawInt.replace(/^0+/g, '');
    let exponent = 0;
    let digitStream = '';

    if (intPart) {
      exponent = intPart.length - 1;
      digitStream = `${intPart}${rawFrac}`;
    } else {
      const firstNonZero = rawFrac.search(/[1-9]/);
      exponent = -(firstNonZero + 1);
      digitStream = rawFrac.slice(firstNonZero);
    }

    const coefficient = trimDecimalString(
      `${digitStream[0]}${digitStream.length > 1 ? `.${digitStream.slice(1)}` : ''}`
    );
    const signedCoefficient = negative ? `-${coefficient}` : coefficient;
    return {
      coefficient: signedCoefficient,
      exponent,
      text: `${signedCoefficient} \\times 10^{${exponent}}`,
    };
  }

  function buildScientificNotationConvertSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      if (mode === 0) {
        const coeff = `${randInt(1, 9)}`;
        const exponent = randInt(4, 8);
        const plain = scientificToPlainString(coeff, exponent);
        questions.push(`將 ${plain} 寫成科學記號。`);
        summaryAnswers.push(`$${coeff} \\times 10^{${exponent}}$`);
        answers.push(`${plain} = $${coeff} \\times 10^{${exponent}}$。`);
        continue;
      }

      if (mode === 1) {
        const coeff = `${randInt(1, 9)}.${randInt(1, 9)}${randInt(0, 9)}`;
        const exponent = -randInt(4, 8);
        const plain = scientificToPlainString(coeff, exponent);
        questions.push(`將 ${plain} 寫成科學記號。`);
        summaryAnswers.push(`$${coeff} \\times 10^{${exponent}}$`);
        answers.push(`${plain} = $${coeff} \\times 10^{${exponent}}$。`);
        continue;
      }

      const coeff = `${randInt(1, 9)}.${randInt(1, 9)}${randInt(0, 9)}`;
      const exponent = randInt(3, 7);
      const plain = scientificToPlainString(coeff, exponent);
      questions.push(`將 $${coeff} \\times 10^{${exponent}}$ 展開成一般數值。`);
      summaryAnswers.push(`${plain}`);
      answers.push(`把小數點向右移 ${exponent} 位，所以結果是 ${plain}。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildScientificDigitReadingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const coeff = `${randInt(1, 9)}.${randInt(1, 9)}${randInt(0, 9)}${randInt(0, 9)}`;
        const exponent = randInt(5, 8);
        const digitCount = exponent + 1;
        questions.push(`$${coeff} \\times 10^{${exponent}}$ 乘開後是一個幾位數？`);
        summaryAnswers.push(`${digitCount} 位`);
        answers.push(
          `因為 $${coeff}$ 介於 1 和 10 之間，所以乘上 $10^{${exponent}}$ 後，整數共有 ${exponent}+1=${digitCount} 位。`
        );
      } else {
        const coeff = `${randInt(1, 9)}.${randInt(1, 9)}`;
        const exponent = randInt(3, 8);
        questions.push(`$${coeff} \\times 10^{-${exponent}}$ 乘開後，小數點後第幾位開始出現不為 0 的數字？`);
        summaryAnswers.push(`第 ${exponent} 位`);
        answers.push(
          `因為係數介於 1 和 10 之間，乘上 $10^{-${exponent}}$ 代表小數點向左移 ${exponent} 位，所以小數點後第 ${exponent} 位開始出現不為 0 的數字。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildScientificCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      let expA = randInt(-6, 8);
      let expB = randInt(-6, 8);
      const coeffA = Number(`${randInt(1, 9)}.${randInt(0, 9)}${randInt(0, 9)}`);
      let coeffB = Number(`${randInt(1, 9)}.${randInt(0, 9)}${randInt(0, 9)}`);
      if (i % 2 === 1) expB = expA;
      while (expA === expB && coeffA === coeffB) {
        coeffB = Number(`${randInt(1, 9)}.${randInt(0, 9)}${randInt(0, 9)}`);
      }
      const left = coeffA * Math.pow(10, expA);
      const right = coeffB * Math.pow(10, expB);
      const relation = left > right ? '>' : '<';
      const coeffAText = trimDecimalString(`${coeffA}`);
      const coeffBText = trimDecimalString(`${coeffB}`);
      questions.push(`比較 $${coeffAText} \\times 10^{${expA}}$ 與 $${coeffBText} \\times 10^{${expB}}$ 的大小。`);
      summaryAnswers.push(`$${coeffAText} \\times 10^{${expA}} ${relation} ${coeffBText} \\times 10^{${expB}}$`);
      if (expA !== expB) {
        answers.push(
          `先看指數，因為 ${expA} ${relation} ${expB}，所以 $${coeffAText} \\times 10^{${expA}} ${relation} ${coeffBText} \\times 10^{${expB}}$。`
        );
      } else {
        answers.push(
          `兩個指數相同，都乘上 $10^{${expA}}$，只要比較係數即可；因為 ${coeffAText} ${relation} ${coeffBText}，所以 $${coeffAText} \\times 10^{${expA}} ${relation} ${coeffBText} \\times 10^{${expB}}$。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildScientificMulDivSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const coeffOptions = [1.2, 1.5, 1.8, 2.4, 2.5, 3.1, 3.2, 4.5, 4.8, 5.5, 6.4, 6.7, 7.0, 8.1, 9.4];
    const divisionPairs = [
      { divisor: 1.2, quotient: 5, dividend: 6.0 },
      { divisor: 1.5, quotient: 4, dividend: 6.0 },
      { divisor: 2.4, quotient: 3, dividend: 7.2 },
      { divisor: 2.5, quotient: 2, dividend: 5.0 },
      { divisor: 3.2, quotient: 2.5, dividend: 8.0 },
      { divisor: 4.5, quotient: 2, dividend: 9.0 },
      { divisor: 4.8, quotient: 1.5, dividend: 7.2 },
      { divisor: 5.5, quotient: 2, dividend: 11.0 },
      { divisor: 6.4, quotient: 2, dividend: 12.8 },
      { divisor: 8.1, quotient: 3, dividend: 24.3 },
    ];

    for (let i = 0; i < count; i += 1) {
      const expA = randInt(-4, 8);
      const expB = randInt(-4, 8);

      if (i % 2 === 0) {
        const coeffA = pickFromList(coeffOptions);
        const coeffB = pickFromList(coeffOptions);
        const coeffAText = trimDecimalString(`${coeffA}`);
        const coeffBText = trimDecimalString(`${coeffB}`);
        const rawCoeff = Number((coeffA * coeffB).toFixed(4));
        const rawExp = expA + expB;
        const normalized = plainToScientificParts(scientificToPlainString(trimDecimalString(`${rawCoeff}`), rawExp));
        questions.push(`計算：$(${coeffAText} \\times 10^{${expA}}) \\times (${coeffBText} \\times 10^{${expB}})$。`);
        summaryAnswers.push(`$${normalized.text}$`);
        answers.push(
          `先把係數相乘、指數相加：$${coeffAText}\\times${coeffBText}=${trimDecimalString(`${rawCoeff}`)}$，指數是 ${expA}+${expB}=${rawExp}，再整理成標準科學記號，結果是 $${normalized.text}$。`
        );
      } else {
        const pair = pickFromList(divisionPairs);
        const coeffA = pair.dividend;
        const coeffB = pair.divisor;
        const coeffAText = trimDecimalString(`${coeffA}`);
        const coeffBText = trimDecimalString(`${coeffB}`);
        const rawCoeff = Number(pair.quotient.toFixed(4));
        const rawExp = expA - expB;
        const normalized = plainToScientificParts(scientificToPlainString(trimDecimalString(`${rawCoeff}`), rawExp));
        questions.push(`計算：$(${coeffAText} \\times 10^{${expA}}) \\div (${coeffBText} \\times 10^{${expB}})$。`);
        summaryAnswers.push(`$${normalized.text}$`);
        answers.push(
          `先把係數相除、指數相減：$${coeffAText}\\div${coeffBText}=${trimDecimalString(`${rawCoeff}`)}$，指數是 ${expA}-${expB}=${rawExp}，再整理成標準科學記號，結果是 $${normalized.text}$。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildScientificAddSubSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const commonExp = randInt(-8, 8);
      const coeffA = Number(`${randInt(1, 9)}.${randInt(0, 9)}`);
      const coeffB = Number(`${randInt(1, 9)}.${randInt(0, 9)}`);
      const shift = randInt(0, 1);
      const expA = commonExp;
      const expB = commonExp - shift;
      const isAdd = i % 2 === 0;
      const coeffAText = trimDecimalString(`${coeffA}`);
      const coeffBText = trimDecimalString(`${coeffB}`);

      const alignedB = shift === 0 ? coeffB : coeffB / 10;
      const alignedExpText = commonExp;
      const resultCoeff = isAdd ? coeffA + alignedB : coeffA - alignedB;
      const normalized = plainToScientificParts(
        scientificToPlainString(trimDecimalString(`${Number(resultCoeff.toFixed(6))}`), commonExp)
      );
      questions.push(
        `計算：$${coeffAText} \\times 10^{${expA}} ${isAdd ? '+' : '-'} ${coeffBText} \\times 10^{${expB}}$。`
      );
      summaryAnswers.push(`$${normalized.text}$`);
      answers.push(
        shift === 0
          ? `兩個指數已相同，直接合併係數：${coeffAText} ${isAdd ? '+' : '-'} ${coeffBText} = ${trimDecimalString(`${Number(resultCoeff.toFixed(6))}`)}，所以結果是 $${normalized.text}$。`
          : `先把 $${coeffBText} \\times 10^{${expB}}$ 改寫成 $${trimDecimalString(`${Number(alignedB.toFixed(6))}`)} \\times 10^{${alignedExpText}}$，再合併係數，最後整理成標準科學記號，結果是 $${normalized.text}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildScientificUnitConversionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modes = [
      { from: '奈米', to: '公尺', factorText: '10^{-9}', factorExp: -9 },
      { from: '微米', to: '公尺', factorText: '10^{-6}', factorExp: -6 },
      { from: '公里', to: '公分', factorText: '10^{5}', factorExp: 5 },
      { from: '毫克', to: '公斤', factorText: '10^{-6}', factorExp: -6 },
      { from: '公斤', to: '毫克', factorText: '10^{6}', factorExp: 6 },
    ];

    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      const plain = randInt(1, 99999);
      const scientific = plainToScientificParts(scientificToPlainString(`${plain}`, mode.factorExp));
      questions.push(`將 ${plain} ${mode.from} 換成 ${mode.to}，並用科學記號表示。`);
      summaryAnswers.push(`$${scientific.text}$ ${mode.to}`);
      answers.push(
        `因為 1 ${mode.from} = $${mode.factorText}$ ${mode.to}，所以 ${plain} ${mode.from} = $${plain} \\times ${mode.factorText} = ${scientific.text}$ ${mode.to}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildScientificNormalizeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      let coefficient = '';
      let exponent = 0;
      if (i % 2 === 0) {
        coefficient = `${randInt(10, 9999)}.${randInt(0, 9)}`;
        exponent = -randInt(1, 5);
      } else {
        coefficient = `0.00${randInt(1, 9)}${randInt(0, 9)}${randInt(0, 9)}`;
        exponent = randInt(-7, 5);
      }
      const normalized = plainToScientificParts(scientificToPlainString(coefficient, exponent));
      questions.push(`把 $${trimDecimalString(coefficient)} \\times 10^{${exponent}}$ 改寫成標準科學記號。`);
      summaryAnswers.push(`$${normalized.text}$`);
      answers.push(`先把數值看成一般數，再把係數調整到介於 1 和 10 之間，所以標準科學記號是 $${normalized.text}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildOppositeNumberSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const c = pickNonZero(-15, 15);
      const x = randInt(-20, 20);
      const exprValue = x + c;
      const opposite = -exprValue;
      const exprText = c >= 0 ? `x+${c}` : `x${c}`;
      questions.push(`${exprText}的相反數是${opposite}，求x=`);
      summaryAnswers.push(`$${x}$`);
      answers.push(`${x}`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ114LargeToScientificSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const coefficient = Number(`${randInt(1, 9)}.${randInt(0, 9)}${randInt(0, 9)}`);
      const exponent = randInt(4, 8);
      const plain = scientificToPlainString(trimDecimalString(`${coefficient}`), exponent);
      questions.push(`將 ${plain} 以科學記號表示。`);
      summaryAnswers.push(`$${trimDecimalString(`${coefficient}`)} \\times 10^{${exponent}}$`);
      answers.push(
        `把小數點左移 ${exponent} 位，可寫成 $${trimDecimalString(`${coefficient}`)} \\times 10^{${exponent}}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ114SmallToScientificSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const coefficient = Number(`${randInt(1, 9)}.${randInt(0, 9)}${randInt(0, 9)}`);
      const exponent = -randInt(4, 8);
      const coeffText = trimDecimalString(`${coefficient}`);
      const plain = scientificToPlainString(coeffText, exponent);
      questions.push(`將 ${plain} 用科學記號表示。`);
      summaryAnswers.push(`$${coeffText} \\times 10^{${exponent}}$`);
      answers.push(`把小數點右移 ${Math.abs(exponent)} 位，可寫成 $${coeffText} \\times 10^{${exponent}}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ114ScientificToPlainSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const negativeExp = i % 2 === 1;
      const coefficient = negativeExp
        ? Number(`${randInt(1, 9)}.${randInt(0, 9)}${randInt(0, 9)}`)
        : Number(`${randInt(1, 9)}.${randInt(1, 9)}`);
      const exponent = negativeExp ? -randInt(3, 7) : randInt(3, 7);
      const coeffText = trimDecimalString(`${coefficient}`);
      const plain = scientificToPlainString(coeffText, exponent);
      questions.push(`將 $${coeffText} \\times 10^{${exponent}}$ 化為一般數字。`);
      summaryAnswers.push(`${plain}`);
      answers.push(
        exponent >= 0
          ? `因為乘上 $10^{${exponent}}$，所以小數點向右移 ${exponent} 位，得到 ${plain}。`
          : `因為乘上 $10^{${exponent}}$，所以小數點向左移 ${Math.abs(exponent)} 位，得到 ${plain}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ114ScientificMulDivSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const coeffOptions = [1.2, 1.5, 1.8, 2.4, 2.5, 3.0, 3.6, 4.0, 4.8, 6.0, 7.5, 8.0];

    for (let i = 0; i < count; i += 1) {
      const isMultiply = i % 2 === 0;
      const coeffA = pickFromList(coeffOptions);
      const coeffB = pickFromList(coeffOptions);
      const expA = randInt(-4, 8);
      const expB = randInt(-4, 8);
      const coeffAText = trimDecimalString(`${coeffA}`);
      const coeffBText = trimDecimalString(`${coeffB}`);
      const rawCoeff = isMultiply ? coeffA * coeffB : coeffA / coeffB;
      const rawExp = isMultiply ? expA + expB : expA - expB;
      const normalized = plainToScientificParts(
        scientificToPlainString(trimDecimalString(`${Number(rawCoeff.toFixed(6))}`), rawExp)
      );
      questions.push(
        `化簡 $(${coeffAText} \\times 10^{${expA}}) ${isMultiply ? '\\times' : '\\div'} (${coeffBText} \\times 10^{${expB}})$，並用科學記號表示。`
      );
      summaryAnswers.push(`$${normalized.text}$`);
      answers.push(
        `${isMultiply ? '係數相乘、指數相加' : '係數相除、指數相減'}，先得 $${trimDecimalString(
          `${Number(rawCoeff.toFixed(6))}`
        )} \\times 10^{${rawExp}}$；再整理成標準科學記號，結果是 $${normalized.text}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ114ScientificAddSubSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const commonExp = randInt(-5, 6);
      const shift = 1;
      const expA = commonExp;
      const expB = i % 2 === 0 ? commonExp - shift : commonExp;
      const coeffA = Number(`${randInt(1, 9)}.${randInt(0, 9)}`);
      const coeffB = Number(`${randInt(1, 9)}.${randInt(0, 9)}`);
      const coeffAText = trimDecimalString(`${coeffA}`);
      const coeffBText = trimDecimalString(`${coeffB}`);
      const isAdd = i % 3 !== 1;
      const alignedB = expB === commonExp ? coeffB : coeffB / 10;
      const resultCoeff = isAdd ? coeffA + alignedB : coeffA - alignedB;
      const normalized = plainToScientificParts(
        scientificToPlainString(trimDecimalString(`${Number(resultCoeff.toFixed(6))}`), commonExp)
      );
      questions.push(
        `計算 $${coeffAText} \\times 10^{${expA}} ${isAdd ? '+' : '-'} ${coeffBText} \\times 10^{${expB}}$，並以科學記號表示。`
      );
      summaryAnswers.push(`$${normalized.text}$`);
      answers.push(
        expA === expB
          ? `次方數相同，可直接合併係數：${coeffAText} ${isAdd ? '+' : '-'} ${coeffBText} = ${trimDecimalString(
              `${Number(resultCoeff.toFixed(6))}`
            )}，所以結果是 $${normalized.text}$。`
          : `先把 $${coeffBText} \\times 10^{${expB}}$ 改寫成 $${trimDecimalString(
              `${Number(alignedB.toFixed(6))}`
            )} \\times 10^{${commonExp}}$，再合併係數，最後整理成 $${normalized.text}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ114ScientificCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const expA = randInt(-6, 6);
      let expB = randInt(-6, 6);
      if (i % 2 === 1) expB = expA;
      const coeffA = Number(`${randInt(1, 9)}.${randInt(0, 9)}${randInt(0, 9)}`);
      let coeffB = Number(`${randInt(1, 9)}.${randInt(0, 9)}${randInt(0, 9)}`);
      while (expA === expB && coeffA === coeffB) {
        coeffB = Number(`${randInt(1, 9)}.${randInt(0, 9)}${randInt(0, 9)}`);
      }
      const coeffAText = trimDecimalString(`${coeffA}`);
      const coeffBText = trimDecimalString(`${coeffB}`);
      const left = coeffA * Math.pow(10, expA);
      const right = coeffB * Math.pow(10, expB);
      const relation = left > right ? '>' : '<';
      questions.push(`比較 $${coeffAText} \\times 10^{${expA}}$ 和 $${coeffBText} \\times 10^{${expB}}$ 的大小。`);
      summaryAnswers.push(`$${coeffAText} \\times 10^{${expA}} ${relation} ${coeffBText} \\times 10^{${expB}}$`);
      answers.push(
        expA !== expB
          ? `先比較次方數，因為 ${expA} ${relation} ${expB}，所以 $${coeffAText} \\times 10^{${expA}} ${relation} ${coeffBText} \\times 10^{${expB}}$。`
          : `次方數相同，只要比較係數；因為 ${coeffAText} ${relation} ${coeffBText}，所以 $${coeffAText} \\times 10^{${expA}} ${relation} ${coeffBText} \\times 10^{${expB}}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ114ScientificContextSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;

      if (mode === 0) {
        const radiusKm = randInt(6000, 7000);
        const radiusM = radiusKm * 1000;
        const scientific = plainToScientificParts(`${radiusM}`);
        questions.push(`將地球半徑約 ${radiusKm} 公里用科學記號表示，單位改成公尺。`);
        summaryAnswers.push(`$${scientific.text}$ 公尺`);
        answers.push(
          `先把公里換成公尺：${radiusKm} 公里 = ${radiusM} 公尺，再寫成科學記號為 $${scientific.text}$ 公尺。`
        );
        continue;
      }

      if (mode === 1) {
        const coeff = Number(`${randInt(1, 9)}.${randInt(0, 9)}${randInt(0, 9)}`);
        const exponent = randInt(23, 25);
        const coeffText = trimDecimalString(`${coeff}`);
        questions.push(`將地球的質量約 $${coeffText} \\times 10^{${exponent}}$ 公斤，以中文數量級描述。`);
        summaryAnswers.push(`約 ${scientificToPlainString(coeffText, exponent)} 公斤`);
        answers.push(
          `把 $10^{${exponent}}$ 還原成一般數字，可得約 ${scientificToPlainString(coeffText, exponent)} 公斤。`
        );
        continue;
      }

      if (mode === 2) {
        const grainCountExp = randInt(3, 5);
        const totalMassExp = -3;
        const coefficient = [1, 2, 4, 5][randInt(0, 3)];
        const rawCoeff = coefficient;
        const result = plainToScientificParts(scientificToPlainString(`${rawCoeff}`, totalMassExp - grainCountExp));
        questions.push(
          `已知一粒沙的總量是 $10^{${grainCountExp}}$ 粒共重 $${coefficient} \\times 10^{${totalMassExp}}$ 公克，求一粒沙的質量（以科學記號表示）。`
        );
        summaryAnswers.push(`$${result.text}$ 公克`);
        answers.push(
          `一粒沙的質量 = $(${coefficient} \\times 10^{${totalMassExp}}) \\div 10^{${grainCountExp}} = ${coefficient} \\times 10^{${totalMassExp - grainCountExp}}$，整理後為 $${result.text}$ 公克。`
        );
        continue;
      }

      const speedCoeff = Number(`${randInt(1, 9)}.${randInt(0, 9)}`);
      const speedExp = 8;
      const timeCoeff = Number(`${randInt(2, 9)}.${randInt(0, 9)}`);
      const timeExp = 4;
      const rawCoeff = speedCoeff * timeCoeff;
      const rawExp = speedExp + timeExp;
      const result = plainToScientificParts(
        scientificToPlainString(trimDecimalString(`${Number(rawCoeff.toFixed(6))}`), rawExp)
      );
      const speedText = trimDecimalString(`${speedCoeff}`);
      const timeText = trimDecimalString(`${timeCoeff}`);
      questions.push(
        `已知某光速為 $${speedText} \\times 10^{${speedExp}}$ 公尺/秒，計算其在 $${timeText} \\times 10^{${timeExp}}$ 秒內移動的距離，並用科學記號表示。`
      );
      summaryAnswers.push(`$${result.text}$ 公尺`);
      answers.push(
        `距離 = 速度 × 時間，所以先算 $${speedText}\\times ${timeText} = ${trimDecimalString(`${Number(rawCoeff.toFixed(6))}`)}$，指數相加得 ${speedExp}+${timeExp}=${rawExp}$，整理後為 $${result.text}$ 公尺。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ114MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      summaryAnswers.push(
        Array.isArray(generated.summaryAnswers) ? generated.summaryAnswers[itemIndex] : generated.answers[itemIndex]
      );
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ114LargeConvertMixedSet(count) {
    return buildJ114MixedSet([buildJ114LargeToScientificSet], count);
  }

  function buildJ114SmallConvertMixedSet(count) {
    return buildJ114MixedSet([buildJ114SmallToScientificSet], count);
  }

  function buildJ114ScientificToPlainMixedSet(count) {
    return buildJ114MixedSet([buildJ114ScientificToPlainSet], count);
  }

  function buildJ114ScientificMulDivMixedSet(count) {
    return buildJ114MixedSet([buildJ114ScientificMulDivSet], count);
  }

  function buildJ114ScientificAddSubMixedSet(count) {
    return buildJ114MixedSet([buildJ114ScientificAddSubSet], count);
  }

  function buildJ114ScientificCompareMixedSet(count) {
    return buildJ114MixedSet([buildJ114ScientificCompareSet], count);
  }

  function buildJ114ScientificContextMixedSet(count) {
    return buildJ114MixedSet([buildJ114ScientificContextSet], count);
  }

  function buildJ113SameBaseMultiplySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bases = [2, 3, 5, 7];

    for (let i = 0; i < count; i += 1) {
      const base = bases[i % bases.length];
      const a = randInt(2, 6);
      const b = randInt(2, 6);
      questions.push(`計算：$${base}^{${a}}\\times ${base}^{${b}}$。`);
      summaryAnswers.push(`$${base}^{${a + b}}$`);
      answers.push(`同底數相乘，指數相加，所以 $${base}^{${a}}\\times ${base}^{${b}}=${base}^{${a + b}}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113SameBaseDivisionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bases = [2, 3, 5, 7];

    for (let i = 0; i < count; i += 1) {
      const base = bases[i % bases.length];
      const a = randInt(5, 10);
      const b = randInt(2, a - 1);
      questions.push(`計算：$${base}^{${a}}\\div ${base}^{${b}}$。`);
      summaryAnswers.push(`$${base}^{${a - b}}$`);
      answers.push(`同底數相除，指數相減，所以 $${base}^{${a}}\\div ${base}^{${b}}=${base}^{${a - b}}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113SameBaseMixedChainSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bases = [2, 3, 5];

    for (let i = 0; i < count; i += 1) {
      const base = bases[i % bases.length];
      const a = randInt(2, 5);
      const b = randInt(2, 5);
      const totalBase = a + b;
      const c = randInt(1, totalBase - 1);
      const total = totalBase - c;
      questions.push(`計算：$${base}^{${a}}\\times ${base}^{${b}}\\div ${base}^{${c}}$，並以指數形式表示。`);
      summaryAnswers.push(`$${base}^{${total}}$`);
      answers.push(
        `先做同底數相乘：$${base}^{${a}}\\times ${base}^{${b}}=${base}^{${a + b}}$；再做同底數相除，指數相減得 $${a + b}-${c}=${total}$，所以結果是 $${base}^{${total}}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113SameBaseRewriteSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bases = [2, 3, 5, 7];

    for (let i = 0; i < count; i += 1) {
      const base = bases[i % bases.length];
      const a = randInt(2, 5);
      const b = randInt(2, 5);
      const c = randInt(1, a + b - 1);
      const total = a + b - c;
      questions.push(`計算：$${base}^{${a}}\\div ${base}^{${c}}\\times ${base}^{${b}}$，並以指數形式表示。`);
      summaryAnswers.push(`$${base}^{${total}}$`);
      answers.push(
        `乘除同級，整理成同底數的指數加減：$${a}-${c}+${b}=${total}$，所以 $${base}^{${a}}\\div ${base}^{${c}}\\times ${base}^{${b}}=${base}^{${total}}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113PowerOfPowerBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bases = [2, 3, 5];

    for (let i = 0; i < count; i += 1) {
      const base = bases[i % bases.length];
      const a = randInt(2, 4);
      const b = randInt(2, 4);
      questions.push(`計算：$(${base}^{${a}})^{${b}}$。`);
      summaryAnswers.push(`$${base}^{${a * b}}$`);
      answers.push(`次方的次方，指數相乘，所以 $(${base}^{${a}})^{${b}}=${base}^{${a * b}}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113PowerOfPowerNegativeBaseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const base = randInt(2, 5);
      const a = randInt(2, 4);
      const b = randInt(2, 3);
      const value = Math.pow(Math.pow(-base, a), b);
      questions.push(`計算：$((-${base})^{${a}})^{${b}}$。`);
      summaryAnswers.push(`$${value}$`);
      answers.push(
        `先用次方的次方：$((-${base})^{${a}})^{${b}}=(-${base})^{${a * b}}$；因為 ${a * b} ${(a * b) % 2 === 0 ? '是偶數' : '是奇數'}，所以結果是 $${value}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113PowerOfPowerValueSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bases = [2, 3, 10];

    for (let i = 0; i < count; i += 1) {
      const base = bases[i % bases.length];
      const a = randInt(2, 3);
      const b = randInt(2, 4);
      const value = Math.pow(base, a * b);
      questions.push(`計算：$(${base}^{${a}})^{${b}}$ 的值。`);
      summaryAnswers.push(`$${value}$`);
      answers.push(`先做次方的次方：$(${base}^{${a}})^{${b}}=${base}^{${a * b}}$，所以值是 $${value}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113PowerOfPowerSignedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const base = randInt(2, 4);
      const a = randInt(2, 3);
      const b = randInt(2, 3);
      const value = -Math.pow(base, a * b);
      questions.push(`計算：$-(${base}^{${a}})^{${b}}$。`);
      summaryAnswers.push(`$${value}$`);
      answers.push(
        `先算括號內：$(${base}^{${a}})^{${b}}=${base}^{${a * b}}=${Math.pow(base, a * b)}$；前面還有一個負號，所以結果是 $${value}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113NegativeExponentEvaluateSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bases = [2, 3, 5, 10];

    for (let i = 0; i < count; i += 1) {
      const base = bases[i % bases.length];
      const exponent = randInt(2, 4);
      questions.push(`計算：$${base}^{-${exponent}}$。`);
      summaryAnswers.push(`$${formatFraction(1, Math.pow(base, exponent))}$`);
      answers.push(
        `負指數表示倒數，所以 $${base}^{-${exponent}}=\\dfrac{1}{${base}^{${exponent}}}=\\dfrac{1}{${Math.pow(base, exponent)}}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113NegativeExponentCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 4);
      const b = randInt(2, 4);
      const leftExp = randInt(2, 4);
      const rightExp = randInt(2, 4);
      const leftValue = Math.pow(a, -leftExp);
      const rightValue = Math.pow(b, -rightExp);
      const relation = leftValue > rightValue ? '>' : leftValue < rightValue ? '<' : '=';
      const leftText = `${a}^{-${leftExp}}`;
      const rightText = `${b}^{-${rightExp}}`;
      questions.push(`比較 $${leftText}$ 和 $${rightText}$ 的大小。`);
      summaryAnswers.push(`$${leftText} ${relation} ${rightText}$`);
      answers.push(
        `先化成倒數：$${leftText}=\\dfrac{1}{${Math.pow(a, leftExp)}}$，$${rightText}=\\dfrac{1}{${Math.pow(b, rightExp)}}$；比較後可得 $${leftText} ${relation} ${rightText}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113NegativeExponentSignedProductSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const base = randInt(2, 4);
      const a = randInt(2, 5);
      const b = randInt(1, a - 1);
      const value = Math.pow(-base, a) * Math.pow(-base, -b);
      questions.push(`計算：$(-${base})^{${a}}\\times (-${base})^{-${b}}$。`);
      summaryAnswers.push(`$${value}$`);
      answers.push(
        `同底數相乘，指數相加：$(-${base})^{${a}}\\times (-${base})^{-${b}}=(-${base})^{${a - b}}$；所以結果是 $(-${base})^{${a - b}}=${value}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113NegativeExponentScientificSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = randInt(3, 6);
      const b = randInt(1, a - 1);
      const exp = a - b;
      questions.push(`計算：$10^{${a}}\\times 10^{-${b}}$，並以科學記號表示。`);
      summaryAnswers.push(`$1\\times 10^{${exp}}$`);
      answers.push(
        `同底數相乘，指數相加：$10^{${a}}\\times 10^{-${b}}=10^{${a - b}}$，寫成科學記號就是 $1\\times 10^{${exp}}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113ReciprocalValueSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 6);
      const sumText = formatFraction(a * a + 1, a);
      questions.push(`已知 $a$ 與 $b$ 互為倒數，且 $a=${a}$，求 $a+b$ 的值。`);
      summaryAnswers.push(`$${sumText}$`);
      answers.push(
        `因為 $a$ 與 $b$ 互為倒數，所以 $b=\\dfrac{1}{${a}}$；因此 $a+b=${a}+\\dfrac{1}{${a}}=${sumText}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113ParityLinearComboSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const evenCoeff = randInt(2, 8);
      const oddCoeff = randInt(2, 8);
      const n = randInt(1, 6);
      const value = evenCoeff - oddCoeff;
      questions.push(`計算：$${evenCoeff}(-1)^{2n}+${oddCoeff}(-1)^{2n+1}$，其中 $n=${n}$。`);
      summaryAnswers.push(`$${value}$`);
      answers.push(
        `因為 $(-1)^{2n}=1$，$(-1)^{2n+1}=-1$，所以原式 $=${evenCoeff}\\times 1+${oddCoeff}\\times (-1)=${value}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113ParityDifferenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const n = randInt(1, 8);
      const left = Math.pow(-1, n);
      const right = Math.pow(-1, n + 2);
      const value = left - right;
      questions.push(`計算：$(-1)^{n}-(-1)^{n+2}$，其中 $n=${n}$。`);
      summaryAnswers.push(`$${value}$`);
      answers.push(`因為 $n$ 和 $n+2$ 奇偶性相同，所以 $(-1)^{n}=(-1)^{n+2}$；因此原式等於 $0$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113ParityEvenSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const end = randInt(4, 7) * 2;
      const termCount = end / 2;
      questions.push(`計算：$(-1)^{2}+(-1)^{4}+(-1)^{6}+\\cdots+(-1)^{${end}}$ 的值。`);
      summaryAnswers.push(`$${termCount}$`);
      answers.push(`每一項都是偶次方，所以每一項都等於 $1$；共有 ${termCount} 項，因此總和是 $${termCount}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113ParityOddSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const terms = randInt(5, 10);
      const end = 2 * terms - 1;
      questions.push(`計算：$(-1)^{1}+(-1)^{3}+(-1)^{5}+\\cdots+(-1)^{${end}}$ 的值。`);
      summaryAnswers.push(`$-${terms}$`);
      answers.push(`每一項都是奇次方，所以每一項都等於 $-1$；共有 ${terms} 項，因此總和是 $-${terms}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113ParitySignJudgeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const exponent = randInt(10, 120);
      const isPositive = exponent % 2 === 0;
      questions.push(`判斷 $(-1)^{${exponent}}$ 的正負性。`);
      summaryAnswers.push(isPositive ? '正數' : '負數');
      answers.push(
        `因為 ${exponent} ${isPositive ? '是偶數' : '是奇數'}，所以 $(-1)^{${exponent}}=${isPositive ? '1' : '-1'}$，因此是${isPositive ? '正數' : '負數'}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113PowerComparePositiveBaseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const leftBase = randInt(2, 4);
      const rightBase = randInt(leftBase + 1, 5);
      const leftExp = randInt(2, 4);
      const rightExp = randInt(2, 4);
      const leftValue = Math.pow(leftBase, leftExp);
      const rightValue = Math.pow(rightBase, rightExp);
      const relation = leftValue > rightValue ? '>' : leftValue < rightValue ? '<' : '=';
      const leftText = `${leftBase}^{${leftExp}}`;
      const rightText = `${rightBase}^{${rightExp}}`;
      questions.push(`比較 $${leftText}$ 和 $${rightText}$ 的大小。`);
      summaryAnswers.push(`$${leftText} ${relation} ${rightText}$`);
      answers.push(
        `先算出數值：$${leftText}=${leftValue}$，$${rightText}=${rightValue}$，所以 $${leftText} ${relation} ${rightText}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113PowerCompareBracketSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const base = randInt(2, 5);
      const exponent = randInt(2, 5);
      const leftText = `(-${base})^{${exponent}}`;
      const rightText = `${base}^{${exponent}}`;
      const leftValue = Math.pow(-base, exponent);
      const rightValue = Math.pow(base, exponent);
      const relation = leftValue > rightValue ? '>' : leftValue < rightValue ? '<' : '=';
      questions.push(`比較 $${leftText}$ 和 $${rightText}$ 的大小。`);
      summaryAnswers.push(`$${leftText} ${relation} ${rightText}$`);
      answers.push(
        exponent % 2 === 0
          ? `因為 ${exponent} 是偶數，所以 $(-${base})^{${exponent}}=${rightValue}$，而 $${base}^{${exponent}}=${rightValue}$，因此兩者相等。`
          : `因為 ${exponent} 是奇數，所以 $(-${base})^{${exponent}}=${leftValue}$，而 $${base}^{${exponent}}=${rightValue}$，因此 $${leftText}<${rightText}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113PowerCompareUnaryMinusSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const base = randInt(2, 5);
      const exponent = randInt(2, 5);
      const leftText = `(-${base})^{${exponent}}`;
      const rightText = `-${base}^{${exponent}}`;
      const leftValue = Math.pow(-base, exponent);
      const rightValue = -Math.pow(base, exponent);
      const relation = leftValue > rightValue ? '>' : leftValue < rightValue ? '<' : '=';
      questions.push(`比較 $${leftText}$ 和 $${rightText}$ 的大小。`);
      summaryAnswers.push(`$${leftText} ${relation} ${rightText}$`);
      answers.push(
        exponent % 2 === 0
          ? `因為 ${exponent} 是偶數，所以 $${leftText}=${Math.pow(base, exponent)}$；而 $${rightText}=${rightValue}$，因此 $${leftText}>${rightText}$。`
          : `因為 ${exponent} 是奇數，所以 $${leftText}=${leftValue}$，而 $${rightText}=${rightValue}$，兩者相等。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113PowerCompareAbsoluteSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const base = randInt(2, 5);
      const exponent = randInt(2, 5);
      const leftText = `\\left|-${base}\\right|^{${exponent}}`;
      const rightText = `(-${base})^{${exponent}}`;
      const leftValue = Math.pow(Math.abs(-base), exponent);
      const rightValue = Math.pow(-base, exponent);
      const relation = leftValue > rightValue ? '>' : leftValue < rightValue ? '<' : '=';
      questions.push(`比較 $${leftText}$ 和 $${rightText}$ 的大小。`);
      summaryAnswers.push(`$${leftText} ${relation} ${rightText}$`);
      answers.push(
        `因為 $\\left|-${base}\\right|=${base}$，所以左邊是 $${base}^{${exponent}}=${leftValue}$；右邊是 $(-${base})^{${exponent}}=${rightValue}$，因此 $${leftText} ${relation} ${rightText}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ113PowerCompareParitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const evenBase = randInt(2, 4);
      const oddBase = randInt(2, 4);
      const evenExp = randInt(2, 4) * 2;
      const oddExp = randInt(1, 3) * 2 + 1;
      const leftText = `(-${evenBase})^{${evenExp}}`;
      const rightText = `(-${oddBase})^{${oddExp}}`;
      const leftValue = Math.pow(-evenBase, evenExp);
      const rightValue = Math.pow(-oddBase, oddExp);
      questions.push(`比較 $${leftText}$ 和 $${rightText}$ 的大小。`);
      summaryAnswers.push(`$${leftText}>${rightText}$`);
      answers.push(
        `左邊是偶次方，所以 $${leftText}=${leftValue}$ 為正；右邊是奇次方，所以 $${rightText}=${rightValue}$ 為負，因此一定有 $${leftText}>${rightText}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildOppositeBasicConceptSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const variableNames = ['a', 'b', 'm', 'x'];

    for (let i = 0; i < count; i += 1) {
      const variableName = variableNames[i % variableNames.length];
      const mode = i % 3;

      if (mode === 0) {
        const value = pickNonZero(-12, 12);
        questions.push(`如果 $${variableName}$ 是 $${value}$ 的相反數，那麼 $${variableName}$ 是多少？`);
        summaryAnswers.push(`$${-value}$`);
        answers.push(`相反數是大小相同、正負相反，所以 $${variableName}=${-value}$。`);
        continue;
      }

      if (mode === 1) {
        const numerator = pickNonZero(-8, 8);
        const denominator = randInt(2, 4);
        const valueText = formatFraction(numerator, denominator);
        const oppositeText = formatFraction(-numerator, denominator);
        questions.push(`如果 $${variableName}$ 與 $${valueText}$ 互為相反數，那麼 $${variableName}$ 是多少？`);
        summaryAnswers.push(`$${oppositeText}$`);
        answers.push(
          `互為相反數代表相加等於 $0$，所以 $${variableName}=-\\left(${valueText}\\right)=${oppositeText}$。`
        );
        continue;
      }

      const value = pickNonZero(-15, 15);
      questions.push(`若甲、乙兩數互為相反數，且甲數為 $${value}$，求乙數。`);
      summaryAnswers.push(`$${-value}$`);
      answers.push(`相反數的大小相同、符號相反，所以乙數是 $${-value}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildOppositeCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const leftValue = randInt(1, 12);
      const rightValue = randInt(1, 12);
      const leftExpr = `|${-leftValue}|`;
      const rightExpr = `-(${-rightValue})`;
      const relation = leftValue > rightValue ? '>' : leftValue < rightValue ? '<' : '=';
      questions.push(`比較 $${leftExpr}$ 和 $${rightExpr}$ 的大小。`);
      summaryAnswers.push(`$${leftExpr} ${relation} ${rightExpr}$`);
      answers.push(
        `因為 $${leftExpr}=${leftValue}$，而 $${rightExpr}=${rightValue}$，所以 $${leftExpr} ${relation} ${rightExpr}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildOppositeSideOfOriginSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const variableNames = ['a', 'x', 'm', 'p'];

    for (let i = 0; i < count; i += 1) {
      const variableName = variableNames[i % variableNames.length];
      const value = pickNonZero(-12, 12);
      const opposite = -value;
      const side = opposite > 0 ? '原點右側' : '原點左側';
      questions.push(`已知 $${variableName}$ 是 $${value}$ 的相反數，判斷 $${variableName}$ 在數線原點的哪一側。`);
      summaryAnswers.push(side);
      answers.push(
        `$${value}$ 的相反數是 $${opposite}$。因為 $${opposite}${opposite > 0 ? '>' : '<'}0$，所以 $${variableName}$ 在數線的${side}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildMidpointDistanceCombinedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-20, 20);
      let b = randInt(-20, 20);
      while (b === a) b = randInt(-20, 20);
      const midpoint = (a + b) / 2;
      const distance = Math.abs(a - b);
      questions.push(`數線上有$A(${a})$和$B(${b})$兩點，求$A$、$B$兩點的中點座標和距離？`);
      summaryAnswers.push(`$${formatFraction(a + b, 2)}$，$${distance}$`);
      answers.push(`中點=$${midpoint}$，距離=$${distance}$`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildSameShiftOppositeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-20, 20);
      const b = pickNonZero(-20, 20);
      const usePlus = randInt(0, 1) === 1;
      const x = usePlus ? -(a + b) / 2 : (a + b) / 2;
      const opText = usePlus ? '加' : '減';
      questions.push(`${a}和${b}兩數，同時${opText}x後成相反數，求x=?`);
      summaryAnswers.push(`$${formatFraction(usePlus ? -(a + b) : a + b, 2)}$`);
      answers.push(`${x}`);
    }
    return { questions, summaryAnswers, answers };
  }

  // j1-1-2: 正負數與基礎代數應用

  function buildIntegerAddSubtractBracketsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const m = 40;
      const a = randInt(-m, m);
      const b = randInt(-m, m);
      const c = randInt(-m, m);
      const d = randInt(-m, m);
      const expr = `${a}-${wrapIfNegative(b)}+${wrapIfNegative(c)}-${wrapIfNegative(d)}`;
      const result = a - b + c - d;
      questions.push(`計算：$${expr}$。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `簡答：$${result}$。先把減負數改成加正數：$${a}-${wrapIfNegative(b)}+${wrapIfNegative(c)}-${wrapIfNegative(d)}=${a}${-b >= 0 ? '+' : ''}${-b}${c >= 0 ? '+' : ''}${c}${-d >= 0 ? '+' : ''}${-d}=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildCancelingBracketIntegerSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const easyShifts = [
      -900, -800, -700, -600, -500, -400, -300, -200, -100, 100, 200, 300, 400, 500, 600, 700, 800, 900,
    ];
    const atom = (n) => (n < 0 ? `(${n})` : `${n}`);

    function buildVariantA() {
      const base1 = randInt(1200, 3600);
      const base2 = randInt(200, 1800);
      const delta1 = pickFromList(easyShifts);
      const delta2 = pickFromList(easyShifts);
      const a = base1 + delta1;
      const b = base2;
      const c = base1;
      const d = base2 + delta2;
      const result = a - b - (c - d);
      const question = `(${atom(a)}-${atom(b)})-(${atom(c)}-${atom(d)})`;
      const expanded = `${a}${-b >= 0 ? '+' : ''}${-b}${-c >= 0 ? '+' : ''}${-c}${d >= 0 ? '+' : ''}${d}`;
      return {
        question,
        result,
        answer: `先去括號：$${question}=${expanded}$，再合併成 $(${a}${-c >= 0 ? '+' : ''}${-c})+(${-b}${d >= 0 ? '+' : ''}${d})=${a - c}${-b + d >= 0 ? '+' : ''}${-b + d}=${result}$。`,
      };
    }

    function buildVariantB() {
      const a = randInt(300, 3200);
      const b = randInt(300, 3200);
      const delta1 = pickFromList(easyShifts);
      const delta2 = pickFromList(easyShifts);
      const left1 = -a;
      const left2 = -b;
      const right1 = a + delta1;
      const right2 = -(b + delta2);
      const result = left1 + left2 + right1 - right2;
      const question = `(${atom(left1)}+${atom(left2)})+(${atom(right1)}-${atom(right2)})`;
      const expanded = `${left1}${left2 >= 0 ? '+' : ''}${left2}${right1 >= 0 ? '+' : ''}${right1}${-right2 >= 0 ? '+' : ''}${-right2}`;
      return {
        question,
        result,
        answer: `先去括號：$${question}=${expanded}$，再把可抵消的數分組：$(${left1}${right1 >= 0 ? '+' : ''}${right1})+(${left2}${-right2 >= 0 ? '+' : ''}${-right2})=${left1 + right1}${left2 - right2 >= 0 ? '+' : ''}${left2 - right2}=${result}$。`,
      };
    }

    function buildVariantC() {
      const base = randInt(400, 2800);
      const extra = randInt(200, 1800);
      const delta1 = pickFromList(easyShifts);
      const delta2 = pickFromList(easyShifts);
      const a = base;
      const b = extra;
      const c = -base + delta1;
      const d = extra + delta2;
      const result = a - b + (c + d);
      const question = `(${atom(a)}-${atom(b)})+(${atom(c)}+${atom(d)})`;
      const expanded = `${a}${-b >= 0 ? '+' : ''}${-b}${c >= 0 ? '+' : ''}${c}${d >= 0 ? '+' : ''}${d}`;
      return {
        question,
        result,
        answer: `先去括號：$${question}=${expanded}$，再把互相對應的數先合併：$(${a}${c >= 0 ? '+' : ''}${c})+(${-b}${d >= 0 ? '+' : ''}${d})=${a + c}${-b + d >= 0 ? '+' : ''}${-b + d}=${result}$。`,
      };
    }

    function buildVariantD() {
      const a = -randInt(300, 2600);
      const b = randInt(300, 2600);
      const delta1 = pickFromList(easyShifts);
      const delta2 = pickFromList(easyShifts);
      const c = -(Math.abs(a) + delta1);
      const d = b + delta2;
      const result = a + b - (c + d);
      const question = `(${atom(a)}+${atom(b)})-(${atom(c)}+${atom(d)})`;
      const expanded = `${a}${b >= 0 ? '+' : ''}${b}${-c >= 0 ? '+' : ''}${-c}${-d >= 0 ? '+' : ''}${-d}`;
      return {
        question,
        result,
        answer: `先去括號：$${question}=${expanded}$，再分成兩組：$(${a}${-c >= 0 ? '+' : ''}${-c})+(${b}${-d >= 0 ? '+' : ''}${-d})=${a - c}${b - d >= 0 ? '+' : ''}${b - d}=${result}$。`,
      };
    }

    const builders = [buildVariantA, buildVariantB, buildVariantC, buildVariantD];

    for (let i = 0; i < count; i += 1) {
      const built = builders[i % builders.length]();
      questions.push(`計算：$${built.question}$。`);
      summaryAnswers.push(`$${built.result}$`);
      answers.push(built.answer);
    }
    return { questions, summaryAnswers, answers };
  }

  function makeAbsoluteReductionPair(roundA, roundB) {
    const deltaMin = -(roundB - 80);
    const deltaMax = roundA - 80;
    let delta = randInt(deltaMin, deltaMax);
    let d = randInt(Math.max(120, 120 - delta), 980);
    let a = d + delta;
    if (a < 120) {
      d = 120 - delta;
      a = d + delta;
    }
    const b = d + roundA;
    const c = a + roundB;
    const variants = [
      {
        leftText: `${a}-(${b})`,
        rightText: `(${-c})+${d}`,
        leftInner: a - b,
        rightInner: -c + d,
        leftAbs: `${b}-${a}`,
        rightAbs: `${c}-${d}`,
      },
      {
        leftText: `${a}+(${-b})`,
        rightText: `${d}-(${c})`,
        leftInner: a - b,
        rightInner: d - c,
        leftAbs: `${b}-${a}`,
        rightAbs: `${c}-${d}`,
      },
      {
        leftText: `(${-b})+${a}`,
        rightText: `${d}+(${-c})`,
        leftInner: -b + a,
        rightInner: d - c,
        leftAbs: `${b}-${a}`,
        rightAbs: `${c}-${d}`,
      },
    ];
    const pick = variants[randInt(0, variants.length - 1)];
    return {
      ...pick,
      regroupA: b - d,
      regroupB: c - a,
      result: roundA + roundB,
    };
  }

  function buildAbsoluteIntegerReduceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const easyRounds = [200, 300, 400, 500, 700, 800, 900, 1200, 1500, 1700, 1800, 2000, 2300, 2500];

    for (let i = 0; i < count; i += 1) {
      const roundA = pickFromList(easyRounds);
      const roundB = pickFromList(easyRounds);
      const built = makeAbsoluteReductionPair(roundA, roundB);
      questions.push(`計算：$|${built.leftText}|+|${built.rightText}|$。`);
      summaryAnswers.push(`$${built.result}$`);
      answers.push(
        `先判斷正負：$${built.leftText}=${built.leftInner}<0$，$${built.rightText}=${built.rightInner}<0$。` +
          `所以 $|${built.leftText}|=${built.leftAbs}$，$|${built.rightText}|=${built.rightAbs}$。` +
          `原式 $=${built.leftAbs}+${built.rightAbs}=(${built.regroupA})+(${built.regroupB})=${built.result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildAbsoluteBracketMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const easyRounds = [300, 400, 500, 700, 800, 900, 1200, 1500, 1800, 2100, 2400, 2700, 3000];

    function makeParenNegative(value) {
      const a = randInt(120, 980);
      const b = a + value;
      const variants = [
        { text: `(${a}+(${-b}))`, value: a - b, shown: `${a}-${b}` },
        { text: `(${a}-(${b}))`, value: a - b, shown: `${a}-${b}` },
        { text: `((${-b})+${a})`, value: -b + a, shown: `${a}-${b}` },
      ];
      return variants[randInt(0, variants.length - 1)];
    }

    function makeParenPositive(value) {
      const a = randInt(120, 980);
      const b = a + value;
      const variants = [
        { text: `(${b}-${a})`, value: b - a, shown: `${b}-${a}` },
        { text: `((${-a})+${b})`, value: -a + b, shown: `${b}-${a}` },
      ];
      return variants[randInt(0, variants.length - 1)];
    }

    for (let i = 0; i < count; i += 1) {
      const roundA = pickFromList(easyRounds);
      const roundB = pickFromList(easyRounds);
      const absTerm = makeAbsoluteReductionPair(roundA, roundB);
      const variant = i % 4;

      if (variant === 0) {
        const plain = makeParenPositive(roundB);
        const result = roundA + roundB;
        questions.push(`計算：$|${absTerm.leftText}|+${plain.text}$。`);
        summaryAnswers.push(`$${result}$`);
        answers.push(
          `先判斷正負：$${absTerm.leftText}=${absTerm.leftInner}<0$，所以 $|${absTerm.leftText}|=${absTerm.leftAbs}$；` +
            `再算括號：$${plain.text}=${plain.shown}$。` +
            `原式 $=${absTerm.leftAbs}+${plain.shown}=(${roundA})+(${roundB})=${result}$。`
        );
        continue;
      }

      if (variant === 1) {
        const plain = makeParenNegative(roundB);
        const result = roundA - roundB;
        questions.push(`計算：$|${absTerm.leftText}|+${plain.text}$。`);
        summaryAnswers.push(`$${result}$`);
        answers.push(
          `先判斷正負：$${absTerm.leftText}=${absTerm.leftInner}<0$，所以 $|${absTerm.leftText}|=${absTerm.leftAbs}$；` +
            `再算括號：$${plain.text}=${plain.shown}$。` +
            `原式 $=${absTerm.leftAbs}${plain.value >= 0 ? '+' : ''}${plain.shown}=(${roundA})${plain.value >= 0 ? '+' : ''}(${-roundB})=${result}$。`
        );
        continue;
      }

      if (variant === 2) {
        const plain = makeParenPositive(roundB);
        const result = roundA - roundB;
        questions.push(`計算：$|${absTerm.leftText}|-${plain.text}$。`);
        summaryAnswers.push(`$${result}$`);
        answers.push(
          `先判斷正負：$${absTerm.leftText}=${absTerm.leftInner}<0$，所以 $|${absTerm.leftText}|=${absTerm.leftAbs}$；` +
            `再算括號：$${plain.text}=${plain.shown}$。` +
            `原式 $=${absTerm.leftAbs}-(${plain.shown})=(${roundA})-(${roundB})=${result}$。`
        );
        continue;
      }

      const plain = makeParenNegative(roundB);
      const result = roundA + roundB;
      questions.push(`計算：$${plain.text}+|${absTerm.rightText}|$。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `先算括號：$${plain.text}=${plain.shown}$；再判斷正負：$${absTerm.rightText}=${absTerm.rightInner}<0$，所以 $|${absTerm.rightText}|=${absTerm.rightAbs}$。` +
          `原式 $=${plain.shown}+${absTerm.rightAbs}=(${-roundB})+(${roundA + roundB})=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildAverageBaselineDifferenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const people = randInt(4, 7);
      const avg = randInt(55, 88);
      const diff = randInt(2, 9);
      const direction = randInt(0, 1) === 0 ? -1 : 1;
      const newAvg = avg + direction * diff;
      const totalDiff = diff * people;
      const changeText = direction > 0 ? '增加' : '減少';
      questions.push(
        `某組有 ${people} 人，原本平均是 ${avg}。若現在平均變成 ${newAvg}，則全組總和共${changeText}多少？`
      );
      summaryAnswers.push(`$${totalDiff}$`);
      answers.push(
        `平均每人改變 ${diff}，共有 ${people} 人，所以總和共${changeText} $${diff}\\times ${people}=${totalDiff}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildOppositeNumberSumDifferenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const x = pickNonZero(-18, 18);
      const y = -x;
      if (i % 2 === 0) {
        questions.push(`若甲、乙兩數互為相反數，且甲數為 ${x}，求乙數。`);
        summaryAnswers.push(`$${y}$`);
        answers.push(`相反數大小相同、正負相反，所以乙數是 ${y}。`);
        continue;
      }
      const k = randInt(2, 9);
      questions.push(`若兩數互為相反數，且兩數相差 ${2 * k}，求這兩數。`);
      summaryAnswers.push(`$${k}$、$${-k}$`);
      answers.push(
        `設兩數為 $x$ 與 $-x$，則相差是 $|x-(-x)|=2|x|=${2 * k}$，所以 $|x|=${k}$。因此兩數為 ${k}、${-k}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildAbsoluteDifferenceMinimumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 12);
      const b = randInt(1, 10);
      const result = -(a + b);
      questions.push(`如果甲數的絕對值是 $${a}$，乙數的絕對值是 $${b}$，求甲數與乙數差的最小值。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `甲數減乙數要最小，就讓甲數取最小的 $-${a}$，乙數取最大的 $${b}$。所以最小值是 $-${a}-${b}=${result}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildAbsoluteDifferenceMaximumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 12);
      const b = randInt(1, 10);
      const result = a + b;
      questions.push(`如果甲數的絕對值是 $${a}$，乙數的絕對值是 $${b}$，求甲數與乙數差的最大值。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `甲數減乙數要最大，就讓甲數取最大的 $${a}$，乙數取最小的 $-${b}$。所以最大值是 $${a}-(-${b})=${result}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildAbsoluteSumMinimumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 12);
      const b = randInt(1, 10);
      const result = -(a + b);
      questions.push(`如果甲數的絕對值是 $${a}$，乙數的絕對值是 $${b}$，求甲數與乙數和的最小值。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(`兩數和要最小，就讓兩數都取負，分別是 $-${a}$ 和 $-${b}$。所以最小值是 $-${a}+(-${b})=${result}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildAbsoluteSumMaximumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 12);
      const b = randInt(1, 10);
      const result = a + b;
      questions.push(`如果甲數的絕對值是 $${a}$，乙數的絕對值是 $${b}$，求甲數與乙數和的最大值。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(`兩數和要最大，就讓兩數都取正，分別是 $${a}$ 和 $${b}$。所以最大值是 $${a}+${b}=${result}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildWeirdSymbolReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const symbolDefs = [
      { sym: '★', solveText: 'a★b=a+2b', value: (a, b) => a + 2 * b, targetVar: 'a' },
      { sym: '◎', solveText: 'a◎b=2a-b', value: (a, b) => 2 * a - b, targetVar: 'b' },
      { sym: '◆', solveText: 'a◆b=ab+a', value: (a, b) => a * b + a, targetVar: 'b' },
    ];
    for (let i = 0; i < count; i += 1) {
      const def = symbolDefs[i % symbolDefs.length];
      if (def.targetVar === 'a') {
        const a = pickNonZero(-8, 8);
        const b = pickNonZero(-8, 8);
        const result = def.value(a, b);
        questions.push(`若規定 ${def.solveText}，且 $x${def.sym}${b}=${result}$，求 $x$。`);
        summaryAnswers.push(`$${result - 2 * b}$`);
        answers.push(`由規定得 $x+2\\times ${b}=${result}$，所以 $x=${result - 2 * b}$。`);
        continue;
      }
      const a = pickNonZero(-8, 8);
      const b = pickNonZero(-8, 8);
      const result = def.value(a, b);
      if (def.sym === '◎') {
        questions.push(`若規定 ${def.solveText}，且 $${a}${def.sym}x=${result}$，求 $x$。`);
        summaryAnswers.push(`$${2 * a - result}$`);
        answers.push(`由規定得 $2\\times ${a}-x=${result}$，所以 $x=${2 * a - result}$。`);
        continue;
      }
      questions.push(`若規定 ${def.solveText}，且 $${a}${def.sym}x=${result}$，求 $x$。`);
      summaryAnswers.push(`$${(result - a) / a}$`);
      answers.push(`由規定得 $${a}x+${a}=${result}$，所以 $${a}x=${result - a}$，因此 $x=${(result - a) / a}$。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildMidpointReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-20, 20);
      const c = randInt(-20, 20);
      if (a === c) {
        i -= 1;
        continue;
      }
      const b = (a + c) / 2;
      if (i === 0) {
        questions.push(`數線上有A(${a})、B(${b})和C(c)三點，且B為A、C中點，求c=?`);
      } else {
        questions.push(`A(${a})、B(${b})和C(c)，求c=?`);
      }
      summaryAnswers.push(`$${c}$`);
      answers.push(`${c}`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildMidpointPlusDistanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-20, 20);
      let b = randInt(-20, 20);
      let c = randInt(-20, 20);
      while (b === a) b = randInt(-20, 20);
      while (c === a && c === b) c = randInt(-20, 20);
      const d = (a + b) / 2;
      const dist = Math.abs(c - d);

      questions.push(`$A(${a})、B(${b})、C(${c})$為數線上三點，若$D$為$\\overline{AB}$中點，求$\\overline{CD}$？`);
      summaryAnswers.push(`$${formatFraction(Math.abs(2 * c - a - b), 2)}$`);
      answers.push(`$${dist}$`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildThreePointQuickDistanceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-20, 20);
      let b = randInt(-20, 20);
      let c = randInt(-20, 20);
      while (b === a) b = randInt(-20, 20);
      while (c === a || c === b) c = randInt(-20, 20);
      const ab = Math.abs(a - b);
      const bc = Math.abs(b - c);
      const ca = Math.abs(c - a);

      questions.push(`$A(${a})、B(${b})、C(${c})$為數線上三點，求$\\overline{AB}、\\overline{BC}、\\overline{CA}？$`);
      summaryAnswers.push(`$\\overline{AB}=${ab},\\ \\overline{BC}=${bc},\\ \\overline{CA}=${ca}$`);
      answers.push(`$\\overline{AB}=${ab}，\\overline{BC}=${bc}，\\overline{CA}=${ca}$`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildCoordinateOriginUnitChangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const scales = [2, 4, 0.5, 0.25];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-20, 20);
      let b = randInt(-20, 20);
      let c = randInt(-20, 20);
      while (b === a) b = randInt(-20, 20);
      while (c === b) c = randInt(-20, 20);
      const s = scales[randInt(0, scales.length - 1)];
      const aNew = (a - b) / s;
      const cNew = (c - b) / s;
      const scaleText = s >= 1 ? `放大${s}倍` : `縮小為${s === 0.5 ? '2分之1' : '4分之1'}`;
      if (i === 0) {
        questions.push(`A(${a})、B(${b})、C(${c})，B當新原點，單位長${scaleText}，求A、C新的坐標。`);
      } else {
        questions.push(`A(${a})、B(${b})、C(${c})，單位長${scaleText}，求A、C新坐標。`);
      }
      summaryAnswers.push(`$A'=${formatCoordinateValue(aNew)},\\ C'=${formatCoordinateValue(cNew)}$`);
      answers.push(`A'=${aNew}，C'=${cNew}`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildAbsoluteValueCandidatesSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const variableNames = ['a', 'x', 'm', 'p'];

    for (let i = 0; i < count; i += 1) {
      const variableName = variableNames[i % variableNames.length];
      const mode = i % 3;

      if (mode === 0) {
        const value = randInt(1, 12);
        questions.push(`如果 $|${variableName}|=${value}$，則 $${variableName}$ 可能的值有哪些？`);
        summaryAnswers.push(`$${-value}$、$${value}$`);
        answers.push(`離原點距離是 $${value}$ 的點有左右兩個，所以 $${variableName}=${-value}$ 或 $${value}$。`);
        continue;
      }

      if (mode === 1) {
        const numerator = randInt(1, 9);
        const denominator = randInt(2, 4);
        const valueText = formatFraction(numerator, denominator);
        const negativeText = formatFraction(-numerator, denominator);
        questions.push(`如果 $|${variableName}|=${valueText}$，則 $${variableName}$ 可能的值有哪些？`);
        summaryAnswers.push(`$${negativeText}$、$${valueText}$`);
        answers.push(
          `絕對值表示到原點的距離，所以 $${variableName}$ 會在 $0$ 的左右各一個位置，即 $${negativeText}$ 或 $${valueText}$。`
        );
        continue;
      }

      questions.push(`如果 $|${variableName}|=0$，則 $${variableName}$ 是多少？`);
      summaryAnswers.push(`$0$`);
      answers.push(`只有原點到原點的距離是 $0$，所以 $${variableName}=0$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildAbsVariableBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const vars = [
      ['a', 'b'],
      ['m', 'n'],
      ['p', 'q'],
      ['x', 'y'],
    ];

    for (let i = 0; i < count; i += 1) {
      const [u, v] = vars[i % vars.length];
      const mode = i % 5;

      if (mode === 0) {
        questions.push(`已知 $${u}<0$，$${v}>0$，化簡：$|${u}|+|${v}|$。`);
        summaryAnswers.push(`$-${u}+${v}$`);
        answers.push(
          `因為 $${u}<0$，所以 $|${u}|=-${u}$；$${v}>0$，所以 $|${v}|=${v}$。因此 $|${u}|+|${v}|=-${u}+${v}$。`
        );
        continue;
      }

      if (mode === 1) {
        questions.push(`已知 $${u}<0$，$${v}<0$，化簡：$|${u}|-|${v}|$。`);
        summaryAnswers.push(`$-${u}+${v}$`);
        answers.push(
          `因為 $${u}<0$、$${v}<0$，所以 $|${u}|=-${u}$、$|${v}|=-${v}$。因此 $|${u}|-|${v}|=-${u}-(-${v})=-${u}+${v}$。`
        );
        continue;
      }

      if (mode === 2) {
        questions.push(`已知 $${u}>0$，$${v}<0$，化簡：$|${u}-${v}|$。`);
        summaryAnswers.push(`$${u}-${v}$`);
        answers.push(`因為 $${v}<0$，所以 $${u}-${v}=${u}+(-${v})>0$，因此 $|${u}-${v}|=${u}-${v}$。`);
        continue;
      }

      if (mode === 3) {
        questions.push(`已知 $${u}<${v}$，化簡：$|${u}-${v}|$。`);
        summaryAnswers.push(`$${v}-${u}$`);
        answers.push(`因為 $${u}<${v}$，所以 $${u}-${v}<0$，因此 $|${u}-${v}|=-(${u}-${v})=${v}-${u}$。`);
        continue;
      }

      questions.push(`已知 $${u}>0$，$${v}>${u}$，化簡：$|${u}|+|${u}-${v}|$。`);
      summaryAnswers.push(`$${v}$`);
      answers.push(
        `因為 $${u}>0$，所以 $|${u}|=${u}$；又因 $${v}>${u}$，所以 $${u}-${v}<0$，因此 $|${u}-${v}|=${v}-${u}$。相加得 $${u}+(${v}-${u})=${v}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildAbsMixedShortSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;

      if (mode === 0) {
        const a = randInt(-12, 12);
        const b = randInt(-12, 12);
        const c = randInt(-12, 12);
        const result = Math.abs(a) + Math.abs(b) - Math.abs(c);
        questions.push(`計算：$|${a}|+|${b}|-|${c}|$。`);
        summaryAnswers.push(`$${result}$`);
        answers.push(
          `先算絕對值：$|${a}|=${Math.abs(a)}$，$|${b}|=${Math.abs(b)}$，$|${c}|=${Math.abs(c)}$，所以結果是 $${Math.abs(a)}+${Math.abs(b)}-${Math.abs(c)}=${result}$。`
        );
        continue;
      }

      if (mode === 1) {
        const a = randInt(-10, 10);
        const b = randInt(-10, 10);
        const c = randInt(-10, 10);
        const left = Math.abs(a + b);
        const right = Math.abs(c);
        const result = left + right;
        questions.push(`計算：$|${wrapIfNegative(a)}+${wrapIfNegative(b)}|+|${c}|$。`);
        summaryAnswers.push(`$${result}$`);
        answers.push(
          `先算括號：$${a}${b >= 0 ? '+' : ''}${b}=${a + b}$，所以左邊絕對值是 $|${a + b}|=${left}$；另外 $|${c}|=${right}$。因此結果為 $${left}+${right}=${result}$。`
        );
        continue;
      }

      if (mode === 2) {
        const a = randInt(-9, 9);
        const b = randInt(-9, 9);
        const c = randInt(-9, 9);
        const d = randInt(-9, 9);
        const left = Math.abs(a - b);
        const right = Math.abs(c + d);
        const result = left - right;
        questions.push(`計算：$|${a}-${wrapIfNegative(b)}|-|${wrapIfNegative(c)}+${wrapIfNegative(d)}|$。`);
        summaryAnswers.push(`$${result}$`);
        answers.push(
          `先算兩個絕對值：$|${a}-${wrapIfNegative(b)}|=|${a - b}|=${left}$，$|${wrapIfNegative(c)}+${wrapIfNegative(d)}|=|${c + d}|=${right}$，所以結果是 $${left}-${right}=${result}$。`
        );
        continue;
      }

      const a = randInt(-8, 8);
      const b = randInt(-8, 8);
      const c = randInt(-8, 8);
      const value = Math.abs(a) - b + Math.abs(c);
      questions.push(`計算：$|${a}|-${wrapIfNegative(b)}+|${c}|$。`);
      summaryAnswers.push(`$${value}$`);
      answers.push(
        `先去絕對值：$|${a}|=${Math.abs(a)}$，$|${c}|=${Math.abs(c)}$，所以結果是 $${Math.abs(a)}-${wrapIfNegative(b)}+${Math.abs(c)}=${value}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildAbsContextSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 4;

      if (mode === 0) {
        const temp = randInt(-9, -1);
        questions.push(`清晨氣溫是 $${temp}$\\(^\\circ\\)C。這個溫度的絕對值是多少？它表示什麼意思？`);
        summaryAnswers.push(`$${Math.abs(temp)}$，表示離 $0^\\circ C$ $${Math.abs(temp)}$ 度`);
        answers.push(
          `絕對值是 $|${temp}|=${Math.abs(temp)}$。它表示這個溫度和 $0$\\(^\\circ\\)$C$ 相差 $${Math.abs(temp)}$\\(^\\circ\\)$C$。`
        );
        continue;
      }

      if (mode === 1) {
        const from = randInt(-4, -1);
        const to = randInt(3, 9);
        const diff = Math.abs(to - from);
        questions.push(`電梯從 $${from}$ 樓移動到 $${to}$ 樓，共移動了幾層？`);
        summaryAnswers.push(`$${diff}$ 層`);
        answers.push(
          `樓層差要看距離，所以是 $|${to}-(${from})|=${diff}$，共移動 $${diff}$ 層。(但現實生活中沒有$0$樓，所以會$${diff}-1$)。`
        );
        continue;
      }

      if (mode === 2) {
        const loss = -randInt(120, 480);
        const profit = randInt(80, 360);
        const diff = Math.abs(profit - loss);
        questions.push(`某店昨天盈虧記為 $${loss}$ 元，今天盈虧記為 $${profit}$ 元。兩天的盈虧相差多少元？`);
        summaryAnswers.push(`$${diff}$ 元`);
        answers.push(`相差要看兩數距離，所以是 $|${profit}-(${loss})|=${diff}$，兩天盈虧相差 $${diff}$ 元。`);
        continue;
      }

      const seaLevel = -randInt(5, 35);
      questions.push(
        `潛水員在海平面下 $${Math.abs(seaLevel)}$ 公尺處，可記作 $${seaLevel}$ 公尺。這個數的絕對值代表什麼？是多少？`
      );
      summaryAnswers.push(`$${Math.abs(seaLevel)}$，表示離海平面 $${Math.abs(seaLevel)}$ 公尺`);
      answers.push(
        `絕對值代表他離海平面的距離，所以 $|${seaLevel}|=${Math.abs(seaLevel)}$，表示離海平面 $${Math.abs(seaLevel)}$ 公尺。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildNumberLineEquidistantPointSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      let a = randInt(-20, 10);
      let b = randInt(a + 2, 20);
      while ((a + b) % 2 !== 0) {
        a = randInt(-20, 10);
        b = randInt(a + 2, 20);
      }
      const midpoint = (a + b) / 2;
      questions.push(`數線上點 P 到 ${a} 與 ${b} 的距離相等，求點 P 的坐標。`);
      summaryAnswers.push(`$${formatFraction(a + b, 2)}$`);
      answers.push(`等距點就是這兩點的中點，所以 $P=\\frac{${a}${b >= 0 ? '+' : ''}${b}}{2}=${midpoint}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildNumberLineFixedDistancePointSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = randInt(-15, 15);
      const distance = randInt(2, 12);
      const left = a - distance;
      const right = a + distance;
      questions.push(`數線上點 P 與 ${a} 的距離是 ${distance}，求點 P 的所有可能坐標。`);
      summaryAnswers.push(`$${left}$ 或 $${right}$`);
      answers.push(
        `與 ${a} 距離 ${distance}，表示在 ${a} 的左邊 ${distance} 單位或右邊 ${distance} 單位，所以 $P=${left}$ 或 $P=${right}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildNumberLineMidpointDistanceReverseMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const midpoint = randInt(-15, 15);
      const half = randInt(1, 10);
      const left = midpoint - half;
      const right = midpoint + half;
      const distance = half * 2;
      questions.push(
        `數線上 $A$、$B$ 兩點的中點是 $${midpoint}$，且 $\\overline{AB}=${distance}$，求 $A$、$B$ 兩點的坐標。`
      );
      summaryAnswers.push(`$${left}$、$${right}$`);
      answers.push(
        `簡答：$${left}$、$${right}$。中點左右距離相等，而 $\\overline{AB}=${distance}$，所以每邊各是 $${half}$。因此兩點坐標是 $${midpoint}-${half}=${left}$、$${midpoint}+${half}=${right}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function formatUnitScaleText(scale) {
    if (scale === 0.5) return '縮小為原來的 $\\frac{1}{2}$';
    if (scale === 0.25) return '縮小為原來的 $\\frac{1}{4}$';
    return `放大 ${scale} 倍`;
  }

  function pickCompatibleOffset(scale) {
    if (scale >= 1) return randInt(-6, 6) * scale;
    return randInt(-12, 12);
  }

  function formatCoordinateValue(value) {
    if (Number.isInteger(value)) return `${value}`;
    return `${Number(value.toFixed(2))}`;
  }

  function buildCoordinateOriginShiftOnlySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const oldValue = randInt(-18, 18);
      let newOrigin = randInt(-18, 18);
      while (newOrigin === oldValue) newOrigin = randInt(-18, 18);
      const newValue = oldValue - newOrigin;
      questions.push(`數線上點 A 原來在 ${oldValue}，若把 ${newOrigin} 改當新原點，且單位長不變，求 A 的新坐標。`);
      summaryAnswers.push(`$${newValue}$`);
      answers.push(`只改原點時，用「舊坐標 - 新原點」即可，所以新坐標為 $${oldValue}-(${newOrigin})=${newValue}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildCoordinateUnitScaleOnlySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const scales = [2, 3, 4, 0.5, 0.25];

    for (let i = 0; i < count; i += 1) {
      const scale = scales[i % scales.length];
      const oldValue = pickCompatibleOffset(scale);
      const newValue = oldValue / scale;
      questions.push(
        `原點不變，若新單位長 ${formatUnitScaleText(scale)}，原來坐標為 $${oldValue}$ 的點在新數線上的坐標是多少？`
      );
      summaryAnswers.push(`$${formatCoordinateValue(newValue)}$`);
      answers.push(
        `原點不變時，只要把原坐標除以新單位倍數，所以新坐標為 $${oldValue}\\div${scale}=${formatCoordinateValue(newValue)}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildCoordinateOriginThenUnitSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const scales = [2, 4, 0.5, 0.25];

    for (let i = 0; i < count; i += 1) {
      const scale = scales[i % scales.length];
      const origin = randInt(-12, 12);
      const offset = pickCompatibleOffset(scale);
      const oldValue = origin + offset;
      const newValue = offset / scale;
      questions.push(
        `把 $${origin}$ 當新原點，再把新單位長調成${formatUnitScaleText(scale)}。若點 $A$ 原來在 $${oldValue}$，求 $A$ 的新坐標。`
      );
      summaryAnswers.push(`$${formatCoordinateValue(newValue)}$`);
      answers.push(
        `先平移：$${oldValue}-(${origin})=${offset}$；再依新單位長換算：$${offset}\\div${scale}=${formatCoordinateValue(newValue)}$。所以 A 的新坐標是 ${formatCoordinateValue(newValue)}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildCoordinateOldNewInverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const scales = [2, 3, 0.5, 0.25];

    for (let i = 0; i < count; i += 1) {
      const scale = scales[i % scales.length];
      const origin = randInt(-10, 10);
      const newValue = randInt(-8, 8);
      const oldValue = origin + newValue * scale;
      questions.push(
        `把 $${origin}$ 當新原點，新單位長${formatUnitScaleText(scale)}。若點 $P$ 的新坐標是 $${newValue}$，求它原來的坐標。`
      );
      summaryAnswers.push(`$${formatCoordinateValue(oldValue)}$`);
      answers.push(
        `反推時先把新坐標換回舊單位，再加回新原點，所以原坐標 = $${origin}+${newValue}\\times${scale}=${formatCoordinateValue(oldValue)}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildCoordinateNewLineDistanceMidpointSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const scales = [2, 4, 0.5, 0.25];

    for (let i = 0; i < count; i += 1) {
      const scale = scales[i % scales.length];
      const origin = randInt(-8, 8);
      let leftOffset = pickCompatibleOffset(scale);
      let rightOffset = pickCompatibleOffset(scale);
      while (leftOffset === rightOffset) rightOffset = pickCompatibleOffset(scale);
      const a = origin + leftOffset;
      const b = origin + rightOffset;
      const aNew = leftOffset / scale;
      const bNew = rightOffset / scale;
      const midpoint = (aNew + bNew) / 2;
      const distance = Math.abs(aNew - bNew);
      questions.push(
        `把 ${origin} 當新原點，新單位長${formatUnitScaleText(scale)}。原數線上 A(${a})、B(${b}) 兩點，在新數線上的中點與距離各是多少？`
      );
      summaryAnswers.push(`中點 $${formatCoordinateValue(midpoint)}$，距離 $${formatCoordinateValue(distance)}$`);
      answers.push(
        `先換新坐標：$A'=${formatCoordinateValue(aNew)}$，$B'=${formatCoordinateValue(bNew)}$。所以中點為 $\\frac{${formatCoordinateValue(aNew)}+${formatCoordinateValue(bNew)}}{2}=${formatCoordinateValue(midpoint)}$，距離為 $|${formatCoordinateValue(aNew)}-${formatCoordinateValue(bNew)}|=${formatCoordinateValue(distance)}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ111MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      summaryAnswers.push(
        Array.isArray(generated.summaryAnswers) ? generated.summaryAnswers[itemIndex] : generated.answers[itemIndex]
      );
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ111AbsoluteValueMixedSet(count) {
    return buildJ111MixedSet(
      [
        buildAbsoluteValueCandidatesSet,
        buildAbsVariableBasicSet,
        buildAbsRemoveAndCalcSet,
        buildAbsMixedShortSet,
        buildAbsTwoGroupsSet,
        buildAbsFourTermsSet,
        buildAbsContextSet,
      ],
      count
    );
  }

  function buildJ111OppositeMixedSet(count) {
    return buildJ111MixedSet(
      [
        buildOppositeBasicConceptSet,
        buildOppositeCompareSet,
        buildOppositeSideOfOriginSet,
        buildOppositeNumberSumDifferenceSet,
      ],
      count
    );
  }

  function buildJ111AbsoluteExtremumMixedSet(count) {
    return buildJ111MixedSet(
      [
        buildAbsoluteDifferenceMinimumSet,
        buildAbsoluteDifferenceMaximumSet,
        buildAbsoluteSumMinimumSet,
        buildAbsoluteSumMaximumSet,
      ],
      count
    );
  }

  function buildJ111RangeIntegerMixedSet(count) {
    return buildJ111MixedSet(
      [
        buildAbsCountBasicSet,
        buildAbsCountTwoSidedSet,
        buildIntervalIntegerCountSet,
        buildIntervalIntegerSumSet,
        buildShiftedAbsoluteIntegerSumSet,
      ],
      count
    );
  }

  function buildJ111MidpointDistanceMixedSet(count) {
    return buildJ111MixedSet(
      [
        buildDistanceSet,
        buildMidpointSet,
        buildMidpointReverseSet,
        buildNumberLineEquidistantPointSet,
        buildNumberLineFixedDistancePointSet,
        buildMidpointDistanceCombinedSet,
        buildMidpointPlusDistanceSet,
        buildNumberLineMidpointDistanceReverseMixedSet,
        buildThreePointQuickDistanceSet,
      ],
      count
    );
  }

  function buildJ111OriginUnitMixedSet(count) {
    return buildJ111MixedSet(
      [
        buildCoordinateOriginShiftOnlySet,
        buildCoordinateUnitScaleOnlySet,
        buildCoordinateOriginThenUnitSet,
        buildCoordinateOldNewInverseSet,
        buildCoordinateNewLineDistanceMidpointSet,
        buildCoordinateOriginUnitChangeSet,
      ],
      count
    );
  }

  function formatLinearExpr(a, b) {
    if (a === 0) return `${b}`;
    const xPart = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
    if (b === 0) return xPart;
    return `${xPart}${b > 0 ? '+' : ''}${b}`;
  }

  function buildAbsFourTermsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-20, 20);
      const b = randInt(-20, 20);
      const c = randInt(-20, 20);
      const d = randInt(-20, 20);
      questions.push(
        `計算：\\(|${a}| ${b >= 0 ? '+' : '-'} ${Math.abs(b)} ${c >= 0 ? '+' : '-'} |${c}| ${d >= 0 ? '+' : '-'} ${Math.abs(d)}\\)`
      );
      const value = Math.abs(a) + b + (c >= 0 ? Math.abs(c) : -Math.abs(c)) + d;
      summaryAnswers.push(`$${value}$`);
      answers.push(
        `\\(|${a}| ${b >= 0 ? '+' : '-'} ${Math.abs(b)} ${c >= 0 ? '+' : '-'} |${c}| ${d >= 0 ? '+' : '-'} ${Math.abs(d)}=${value}\\)`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildAbsTwoGroupsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const m = 50;
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-m, m),
        b = randInt(-m, m);
      const c = randInt(-m, m),
        d = randInt(-m, m);
      const op = i % 2 === 0 ? '+' : '-';
      const left = Math.abs(a + b);
      const right = Math.abs(c + d);
      const result = op === '+' ? left + right : left - right;
      questions.push(`計算：\\(|(${a})+(${b})| ${op} |(${c})+(${d})|\\)`);
      summaryAnswers.push(`$${result}$`);
      answers.push(`\\(|(${a})+(${b})| ${op} |(${c})+(${d})|=${left} ${op} ${right}=${result}\\)`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildAbsRemoveAndCalcSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-3000, 3000);
      const b = randInt(-3000, 3000);
      const shift = randInt(-900, 900);
      const delta = [200, 400, 600, 800, 1000, 2000, 4000][randInt(0, 6)] * (randInt(0, 1) ? 1 : -1);

      // 第二組由第一組推導，形成「四個數字分兩組有關聯」
      const c = a + shift;
      const d = b + delta - shift;

      const op = randInt(0, 1) ? '+' : '-';
      const v1 = Math.abs(a + b);
      const v2 = Math.abs(c + d);
      const result = op === '+' ? v1 + v2 : v1 - v2;

      questions.push(`計算：\\(|(${a})+(${b})| ${op} |(${c})+(${d})|\\)`);
      summaryAnswers.push(`$${result}$`);
      answers.push(`\\(|(${a})+(${b})| ${op} |(${c})+(${d})|=${v1} ${op} ${v2}=${result}\\)`);
    }
    return { questions, summaryAnswers, answers };
  }

  function listIntegersInRange(minValue, maxValue, category) {
    const values = [];
    for (let x = Math.ceil(minValue); x <= Math.floor(maxValue); x += 1) {
      if (category === '整數') {
        values.push(x);
      } else if (category === '正整數') {
        if (x > 0) values.push(x);
      } else if (category === '非負整數') {
        if (x >= 0) values.push(x);
      } else if (category === '非正整數') {
        if (x <= 0) values.push(x);
      } else if (category === '負整數') {
        if (x < 0) values.push(x);
      }
    }
    return values;
  }

  function countIntegersInRange(minValue, maxValue, category) {
    return listIntegersInRange(minValue, maxValue, category).length;
  }

  function sumIntegerList(values) {
    return values.reduce((total, value) => total + value, 0);
  }

  function formatIntegerList(values) {
    if (!Array.isArray(values) || values.length === 0) return '無';
    return values.join('、');
  }

  function formatIntervalCondition(left, includeLeft, variableName, includeRight, right) {
    return `${left}${includeLeft ? '\\le' : '<'} ${variableName} ${includeRight ? '\\le' : '<'} ${right}`;
  }

  function formatShiftedAbsoluteVariable(variableName, center) {
    if (center === 0) return variableName;
    return center > 0 ? `${variableName}-${center}` : `${variableName}+${Math.abs(center)}`;
  }

  function buildIntervalIntegerCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const variableNames = ['x', 'a', 'm', 'p'];

    for (let i = 0; i < count; i += 1) {
      const variableName = variableNames[i % variableNames.length];
      const left = randInt(-8, 3);
      const right = randInt(left + 3, left + 11);
      const includeLeft = randInt(0, 1) === 1;
      const includeRight = randInt(0, 1) === 1;
      const start = includeLeft ? left : left + 1;
      const end = includeRight ? right : right - 1;
      const values = start <= end ? listIntegersInRange(start, end, '整數') : [];
      questions.push(
        `求滿足 $${formatIntervalCondition(left, includeLeft, variableName, includeRight, right)}$ 的所有整數 $${variableName}$ 的個數。`
      );
      summaryAnswers.push(`$${values.length}$`);
      answers.push(`符合條件的整數有 ${formatIntegerList(values)}，所以個數是 $${values.length}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildIntervalIntegerSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const variableNames = ['x', 'a', 'm', 'p'];

    for (let i = 0; i < count; i += 1) {
      const variableName = variableNames[i % variableNames.length];
      const left = randInt(-8, 3);
      const right = randInt(left + 3, left + 11);
      const includeLeft = randInt(0, 1) === 1;
      const includeRight = randInt(0, 1) === 1;
      const start = includeLeft ? left : left + 1;
      const end = includeRight ? right : right - 1;
      const values = start <= end ? listIntegersInRange(start, end, '整數') : [];
      const result = sumIntegerList(values);
      questions.push(
        `求滿足 $${formatIntervalCondition(left, includeLeft, variableName, includeRight, right)}$ 的所有整數 $${variableName}$ 的總和。`
      );
      summaryAnswers.push(`$${result}$`);
      answers.push(`符合條件的整數有 ${formatIntegerList(values)}，所以總和是 $${result}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildShiftedAbsoluteIntegerSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const variableNames = ['a', 'x', 'm', 'p'];

    for (let i = 0; i < count; i += 1) {
      const variableName = variableNames[i % variableNames.length];
      const center = randInt(-4, 4);
      const radius = randInt(2, 5);
      const includeBoundary = randInt(0, 1) === 1;
      const shiftedText = formatShiftedAbsoluteVariable(variableName, center);
      const left = includeBoundary ? center - radius : center - radius + 1;
      const right = includeBoundary ? center + radius : center + radius - 1;
      const values = listIntegersInRange(left, right, '整數');
      const result = sumIntegerList(values);
      const symbol = includeBoundary ? '\\le' : '<';
      questions.push(
        `已知 $${variableName}$ 為整數，且 $|${shiftedText}|${symbol}${radius}$，求所有可能的 $${variableName}$ 值總和。`
      );
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `由 $|${shiftedText}|${symbol}${radius}$ 可得整數解為 ${formatIntegerList(values)}，所以總和是 $${result}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildAbsCountBasicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const categories = ['整數', '正整數', '非負整數', '非正整數', '負整數'];

    for (let i = 0; i < count; i += 1) {
      const n = randInt(4, 15);
      const category = categories[randInt(0, categories.length - 1)];
      const mode = randInt(0, 2); // 01: <=, 2: <
      let question = '';
      let result = 0;

      if (mode === 0) {
        result = countIntegersInRange(-n, n, category);
        question = `絕對值小於或等於$${n}$的${category}共有幾個？`;
      } else if (mode === 1) {
        result = countIntegersInRange(-n, n, category);
        question = `絕對值不大於$${n}$的${category}共有幾個？`;
      } else {
        result = countIntegersInRange(-n + 1, n - 1, category);
        question = `絕對值小於$${n}$的${category}共有幾個？`;
      }

      questions.push(question);
      summaryAnswers.push(`$${result}$`);
      answers.push(`$${result}$`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildAbsCountTwoSidedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const categories = ['整數', '正整數', '非負整數'];

    for (let i = 0; i < count; i += 1) {
      const lower = randInt(3, 10);
      const upper = randInt(lower + 6, lower + 24);
      const category = categories[randInt(0, categories.length - 1)];
      const includeUpper = randInt(0, 1) === 1;
      const rightRangeMax = includeUpper ? upper : upper - 1;
      const leftRangeMin = includeUpper ? -upper : -upper + 1;
      const countRight = countIntegersInRange(lower, rightRangeMax, category);
      const countLeft = countIntegersInRange(leftRangeMin, -lower, category);
      const result = countLeft + countRight;
      const rightSymbol = includeUpper ? '\\le' : '<';

      questions.push(`符合\\(${lower}\\le |甲| ${rightSymbol} ${upper}\\)的${category}甲共有幾個？`);
      summaryAnswers.push(`$${result}$`);
      answers.push(`$${result}$`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildAbsCountReverseSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const templates = [
      { category: '整數', strict: false, minA: 4, maxA: 16 },
      { category: '整數', strict: true, minA: 5, maxA: 18 },
      { category: '正整數', strict: false, minA: 3, maxA: 15 },
      { category: '正整數', strict: true, minA: 4, maxA: 16 },
      { category: '非負整數', strict: false, minA: 3, maxA: 15 },
      { category: '非負整數', strict: true, minA: 4, maxA: 16 },
    ];

    for (let i = 0; i < count; i += 1) {
      const t = templates[randInt(0, templates.length - 1)];
      const a = randInt(t.minA, t.maxA);
      const lower = t.strict ? -a + 1 : -a;
      const upper = t.strict ? a - 1 : a;
      const result = countIntegersInRange(lower, upper, t.category);
      const signText = t.strict ? '<' : '\\le';
      questions.push(`$a$為整數，且滿足\\(|x| ${signText} a\\)的${t.category}有$${result}$個，則$a=$?`);
      summaryAnswers.push(`$${a}$`);
      answers.push(`$${a}$`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildAbsEquationLeadingOneSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const s = pickNonZero(-25, 25);
      const rhs = randInt(0, 18);
      const base = `求滿足 |x${s >= 0 ? '+' : ''}${s}|=${rhs} 的 x=?`;
      questions.push(base);
      if (rhs < 0) {
        summaryAnswers.push('無解');
        answers.push('無解');
      } else if (rhs === 0) {
        summaryAnswers.push(`$x=${-s}$`);
        answers.push(`x=${-s}`);
      } else {
        const left = formatSolvedX(-s + rhs, 1);
        const right = formatSolvedX(-s - rhs, 1);
        summaryAnswers.push(`$x=${left}$ 或 $x=${right}$`);
        answers.push(`x=${left} 或 ${right}`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildAbsEquationLeadingNotOneSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-10, 10);
      if (Math.abs(a) === 1) {
        i -= 1;
        continue;
      }
      const b = pickNonZero(-24, 24);
      const rhs = randInt(0, 20);
      questions.push(`求滿足 |${a}x${b >= 0 ? '+' : ''}${b}|=${rhs} 的 x=?`);
      if (rhs === 0) {
        summaryAnswers.push(`$x=${formatSolvedX(-b, a)}$`);
        answers.push(`x=$${formatSolvedX(-b, a)}$`);
      } else {
        summaryAnswers.push(`$x=${formatSolvedX(rhs - b, a)}$ 或 $x=${formatSolvedX(-rhs - b, a)}$`);
        answers.push(`x=$${formatSolvedX(rhs - b, a)}$ 或 $${formatSolvedX(-rhs - b, a)}$`);
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildNonnegativeSumZeroSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-12, 12);
      const b = pickNonZero(-12, 12);
      const c = pickNonZero(-12, 12);
      questions.push(
        `已知 |x${a >= 0 ? '-' : '+'}${Math.abs(a)}|+|y${b >= 0 ? '-' : '+'}${Math.abs(b)}|+|z${c >= 0 ? '-' : '+'}${Math.abs(c)}|=0，且 x,y,z 為整數，則 x,y,z 為多少？`
      );
      summaryAnswers.push(`$x=${a},\\ y=${b},\\ z=${c}$`);
      answers.push(`${a}, ${b}, ${c}`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildNonnegativeSumFixedOneSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-10, 10);
      const b = pickNonZero(-10, 10);
      const c = pickNonZero(-10, 10);
      const dx = randInt(0, 3);
      const dy = randInt(0, 3);
      const dz = randInt(0, 3);
      const rhs = dx + dy + dz;
      const x = a + (randInt(0, 1) ? dx : -dx);
      const y = b + (randInt(0, 1) ? dy : -dy);
      const z = c + (randInt(0, 1) ? dz : -dz);
      questions.push(
        `已知 |x${a >= 0 ? '-' : '+'}${Math.abs(a)}|+|y${b >= 0 ? '-' : '+'}${Math.abs(b)}|+|z${c >= 0 ? '-' : '+'}${Math.abs(c)}|=${rhs}，且 x,y,z 為整數，則求一組 x,y,z。`
      );
      summaryAnswers.push(`$x=${x},\\ y=${y},\\ z=${z}$`);
      answers.push(`${x}, ${y}, ${z}`);
    }
    return { questions, summaryAnswers, answers };
  }

  function canRepresentByTwoWeights(value, p, q) {
    for (let u = 0; u * p <= value; u += 1) {
      const rem = value - u * p;
      if (rem % q === 0) return true;
    }
    return false;
  }

  function buildNonnegativeSumFixedMultiXSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-10, 10);
      const b = pickNonZero(-10, 10);
      const c = pickNonZero(-10, 10);
      const p = [1, 2, 3, 4][randInt(0, 3)];
      const q = [1, 2, 3, 5][randInt(0, 3)];
      const rhs = randInt(4, 14);
      const possibleX = [];
      for (let x = a - rhs; x <= a + rhs; x += 1) {
        const left = Math.abs(x - a);
        const rem = rhs - left;
        if (rem >= 0 && canRepresentByTwoWeights(rem, p, q)) {
          possibleX.push(x);
        }
      }
      if (possibleX.length < 2) {
        i -= 1;
        continue;
      }
      questions.push(
        `已知 |x${a >= 0 ? '-' : '+'}${Math.abs(a)}|+${p}|y${b >= 0 ? '-' : '+'}${Math.abs(b)}|+${q}|z${c >= 0 ? '-' : '+'}${Math.abs(c)}|=${rhs}，且 x,y,z 為整數，則 x 可能為多少？`
      );
      summaryAnswers.push(possibleX.join('、'));
      answers.push(possibleX.join('、'));
    }
    return { questions, summaryAnswers, answers };
  }

  function buildAbsoluteBothSidesAdvancedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-10, 10);
      const b = pickNonZero(-20, 20);
      const c = pickNonZero(-10, 10);
      const d = pickNonZero(-20, 20);
      const p = a - c;
      const qv = d - b;
      const r = a + c;
      const sv = -(b + d);
      const sols = [];
      if (p !== 0) sols.push(formatSolvedX(qv, p));
      if (r !== 0) sols.push(formatSolvedX(sv, r));
      const uniq = Array.from(new Set(sols));
      questions.push(`求滿足 |${a}x${b >= 0 ? '+' : ''}${b}|=|${c}x${d >= 0 ? '+' : ''}${d}| 的 x=?`);
      summaryAnswers.push(uniq.length ? uniq.map((value) => `$x=${value}$`).join(' 或 ') : '無解');
      answers.push(uniq.length ? uniq.map((value) => `$${value}$`).join(' 或 ') : '無解');
    }
    return { questions, summaryAnswers, answers };
  }

  function calcStringRemainder(numString, mod) {
    let remainder = 0;
    for (let i = 0; i < numString.length; i += 1) {
      const digit = Number(numString[i]);
      remainder = (remainder * 10 + digit) % mod;
    }
    return remainder;
  }

  function replaceAt(source, index, value) {
    return `${source.slice(0, index)}${value}${source.slice(index + 1)}`;
  }

  function solveUnknownDigit(template, mod, targetRemainder) {
    const idx = template.indexOf('□');
    const result = [];
    if (idx < 0) return result;
    for (let d = 0; d <= 9; d += 1) {
      const candidate = replaceAt(template, idx, String(d));
      if (calcStringRemainder(candidate, mod) === targetRemainder) {
        result.push(d);
      }
    }
    return result;
  }

  function buildLargeNumberString(length, firstDigitMin = 1) {
    let out = String(randInt(firstDigitMin, 9));
    for (let i = 1; i < length; i += 1) {
      out += String(randInt(0, 9));
    }
    return out;
  }

  function buildModuloRemainderSet(mod, count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const n = buildLargeNumberString(randInt(8, 11));
      const r = calcStringRemainder(n, mod);
      questions.push(`求${n}除以${mod}的餘數？`);
      answers.push(`${r}`);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildModuloUnknownMultipleSet(mod, count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const n = buildLargeNumberString(randInt(7, 10));
      const holeIndex = randInt(1, n.length - 1);
      const template = replaceAt(n, holeIndex, '□');
      const validDigits = solveUnknownDigit(template, mod, 0);
      questions.push(`${template}為${mod}的倍數，求□=?`);
      answers.push(validDigits.length ? validDigits.join(' 或 ') : '無解');
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildModuloUnknownRemainderSet(mod, count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const n = buildLargeNumberString(randInt(7, 10));
      const holeIndex = randInt(1, n.length - 1);
      let target = 0;
      let tries = 0;
      while (target === 0 && tries < 30) {
        const answerDigit = randInt(0, 9);
        const full = replaceAt(n, holeIndex, String(answerDigit));
        target = calcStringRemainder(full, mod);
        tries += 1;
      }
      if (target === 0) target = randInt(1, mod - 1);
      const template = replaceAt(n, holeIndex, '□');
      const validDigits = solveUnknownDigit(template, mod, target);
      questions.push(`${template}除以${mod}餘${target}，求□=?`);
      answers.push(validDigits.length ? validDigits.join(' 或 ') : '無解');
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildPrimeFactorList(max = 180) {
    return [
      12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 54, 56, 60, 72, 75, 84, 90, 96, 108, 120, 126, 140, 150, 168, 180,
    ].filter((value) => value <= max);
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

  function factorPairsOf(n) {
    const pairs = [];
    for (let d = 1; d * d <= n; d += 1) {
      if (n % d === 0) {
        const q = n / d;
        pairs.push([q, d]);
      }
    }
    return pairs;
  }

  function buildPrimeFactorNotationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const candidates = buildPrimeFactorList(200).filter((value) => value >= 30);
    const pairFactors = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18];

    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const n = candidates[randInt(0, candidates.length - 1)];
        const factors = primeFactorize(n);
        const factorText = formatPrimeFactorization(factors);
        questions.push(`把 ${n} 寫成標準分解式。`);
        summaryAnswers.push(`$${factorText}$`);
        answers.push(`${n} = $${factorText}$。`);
      } else {
        const a = pairFactors[randInt(0, pairFactors.length - 1)];
        const b = pairFactors[randInt(0, pairFactors.length - 1)];
        const product = a * b;
        const factorTextA = formatPrimeFactorization(primeFactorize(a));
        const factorTextB = formatPrimeFactorization(primeFactorize(b));
        const factorText = formatPrimeFactorization(primeFactorize(product));
        questions.push(`將 $${a} \\times ${b}$ 重新做質因數分解，並整理成標準分解式。`);
        summaryAnswers.push(`$${factorText}$`);
        answers.push(
          `$${a}=${factorTextA}$，$${b}=${factorTextB}$，所以 $${a} \\times ${b}=${factorTextA} \\times ${factorTextB}=${factorText}$。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildDivisorCountSumMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const candidates = buildPrimeFactorList(120);

    for (let i = 0; i < count; i += 1) {
      const n = candidates[randInt(0, candidates.length - 1)];
      const factors = primeFactorize(n);
      const factorText = formatPrimeFactorization(factors);
      const divisorCount = divisorCountFromFactors(factors);
      const divisorSum = divisorSumFromFactors(factors);
      const sumPieces = factors.map(
        ({ prime, exp }) => `(1+${Array.from({ length: exp }, (_, k) => `${prime}^{${k + 1}}`).join('+')})`
      );
      questions.push(`已知 ${n} 的標準分解式為 $${factorText}$，求 ${n} 的所有正因數共有幾個？正因數總和又是多少？`);
      summaryAnswers.push(`$${divisorCount}$ 個，$${divisorSum}$`);
      answers.push(
        `因數個數由指數加 1 連乘可得：$${factors.map(({ exp }) => `(${exp}+1)`).join(' \\times ')} = ${divisorCount}$，所以共有 ${divisorCount} 個；正因數總和可用各質因數級數相乘：$${sumPieces.join(' \\times ')}=${divisorSum}$，所以總和是 ${divisorSum}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildRectangleFactorPairsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const candidates = [24, 30, 36, 40, 42, 48, 54, 56, 60, 72, 84, 90];

    for (let i = 0; i < count; i += 1) {
      const n = candidates[randInt(0, candidates.length - 1)];
      const pairs = factorPairsOf(n).filter(([length, width]) => length >= width);
      const listText = pairs.map(([length, width]) => `$${length} \\times ${width}$`).join('、');
      if (i % 2 === 0) {
        questions.push(
          `用 ${n} 個邊長為 1 的小正方形拼成長方形，若長與寬皆為整數且長大於等於寬，請寫出所有可能的長寬組合。`
        );
        summaryAnswers.push(`${pairs.map(([length, width]) => `(${length},${width})`).join('、')}`);
        answers.push(
          `因為 ${n} 的因數配對為 ${listText}，所以所有可能的長寬組合是：${pairs.map(([length, width]) => `(${length},${width})`).join('、')}。`
        );
      } else {
        questions.push(`一個長方形面積是 ${n}，若長與寬皆為整數且長大於等於寬，最多有幾種不同的長寬組合？`);
        summaryAnswers.push(`${pairs.length} 種`);
        answers.push(`先找 ${n} 的因數配對：${listText}，共有 ${pairs.length} 種。`);
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function lcmAll(values) {
    return values.reduce((acc, value) => lcm(acc, value));
  }

  function divisorsOf(n) {
    const result = [];
    for (let d = 1; d * d <= n; d += 1) {
      if (n % d !== 0) continue;
      result.push(d);
      if (d * d !== n) result.push(n / d);
    }
    return result.sort((a, b) => a - b);
  }

  function buildGcdLcmCalculationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const pairCandidates = [24, 30, 36, 40, 42, 48, 54, 60, 72, 84, 90, 96, 108, 120];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;

      if (mode === 0) {
        const a = pairCandidates[randInt(0, pairCandidates.length - 1)];
        const b = pairCandidates[randInt(0, pairCandidates.length - 1)];
        const g = gcd(a, b);
        const l = lcm(a, b);
        questions.push(`求 ${a} 與 ${b} 的最大公因數與最小公倍數。`);
        summaryAnswers.push(`最大公因數 $${g}$，最小公倍數 $${l}$`);
        answers.push(
          `先分解：$${a}=${formatPrimeFactorization(primeFactorize(a))}$，$${b}=${formatPrimeFactorization(primeFactorize(b))}$。共同質因數取較小次方，所以最大公因數是 ${g}；全部質因數取較大次方，所以最小公倍數是 ${l}。`
        );
        continue;
      }

      if (mode === 1) {
        const gBase = [2, 3, 4, 6][randInt(0, 3)];
        const a = gBase * [6, 8, 9, 10][randInt(0, 3)];
        const b = gBase * [9, 10, 12, 14][randInt(0, 3)];
        const c = gBase * [12, 15, 16, 18][randInt(0, 3)];
        const g = gcd(gcd(a, b), c);
        const l = lcmAll([a, b, c]);
        questions.push(`求 ${a}、${b}、${c} 的最大公因數與最小公倍數。`);
        summaryAnswers.push(`最大公因數 $${g}$，最小公倍數 $${l}$`);
        answers.push(`三數的最大公因數為 ${g}；三數的最小公倍數為 ${l}。`);
        continue;
      }

      const a = pairCandidates[randInt(0, pairCandidates.length - 1)];
      const b = pairCandidates[randInt(0, pairCandidates.length - 1)];
      const g = gcd(a, b);
      const l = lcm(a, b);
      const factorA = formatPrimeFactorization(primeFactorize(a));
      const factorB = formatPrimeFactorization(primeFactorize(b));
      questions.push(`已知 $a=${factorA}$，$b=${factorB}$，求 $(a,b)$ 與 $[a,b]$。`);
      summaryAnswers.push(`$(a,b)=${g}$，$[a,b]=${l}$`);
      answers.push(`共同質因數取較小次方，得 $(a,b)=${g}$；全部質因數取較大次方，得 $[a,b]=${l}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildGcdLcmProductRelationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;
      const g = [2, 3, 4, 5, 6][randInt(0, 4)];
      let x = randInt(2, 8);
      let y = randInt(2, 8);
      while (gcd(x, y) !== 1) {
        x = randInt(2, 8);
        y = randInt(2, 8);
      }
      const a = g * x;
      const b = g * y;
      const l = g * x * y;
      const product = a * b;

      if (mode === 0) {
        questions.push(`已知兩正整數的最大公因數為 ${g}，最小公倍數為 ${l}，其中一數為 ${a}，求另一數。`);
        summaryAnswers.push(`$${b}$`);
        answers.push(`利用 $(a,b)\\times[a,b]=a\\times b$，可得另一數 $=\\dfrac{${g}\\times ${l}}{${a}}=${b}$。`);
        continue;
      }

      if (mode === 1) {
        questions.push(`已知兩正整數的乘積為 ${product}，最大公因數為 ${g}，求這兩數的最小公倍數。`);
        summaryAnswers.push(`$${l}$`);
        answers.push(`由 $(a,b)\\times[a,b]=a\\times b$，得最小公倍數 $=\\dfrac{${product}}{${g}}=${l}$。`);
        continue;
      }

      questions.push(`已知兩正整數的乘積為 ${product}，最小公倍數為 ${l}，求這兩數的最大公因數。`);
      summaryAnswers.push(`$${g}$`);
      answers.push(`由 $(a,b)\\times[a,b]=a\\times b$，得最大公因數 $=\\dfrac{${product}}{${l}}=${g}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildRemainderShortageMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;

      if (mode === 0) {
        const mods = [
          [8, 11, 15],
          [6, 9, 14],
          [7, 10, 13],
        ][randInt(0, 2)];
        const shortage = randInt(1, 3);
        const period = lcmAll(mods);
        const smallest = period - shortage;
        questions.push(
          `求一個最小正整數，用 ${mods[0]} 除不足 ${shortage}，用 ${mods[1]} 除不足 ${shortage}，用 ${mods[2]} 除也不足 ${shortage}。`
        );
        summaryAnswers.push(`$${smallest}$`);
        answers.push(
          `因為都「不足 ${shortage}」，所以這個數比 ${mods[0]}、${mods[1]}、${mods[2]} 的公倍數少 ${shortage}。最小公倍數是 ${period}，所以最小正整數是 ${smallest}。`
        );
        continue;
      }

      if (mode === 1) {
        const mods = [
          [6, 8, 9],
          [4, 6, 10],
          [5, 6, 8],
        ][randInt(0, 2)];
        const remainder = randInt(1, Math.min(...mods) - 1);
        const period = lcmAll(mods);
        const start = period + remainder;
        const end = start + period * 2;
        const values = [];
        for (let x = start; x <= end; x += 1) {
          if (mods.every((mod) => x % mod === remainder)) values.push(x);
        }
        questions.push(
          `在 ${start} 到 ${end} 之間，除以 ${mods[0]}、${mods[1]}、${mods[2]} 都餘 ${remainder} 的數有哪些？`
        );
        summaryAnswers.push(values.join('、'));
        answers.push(
          `因為都餘 ${remainder}，所以先看 ${xToText(mods)} 的最小公倍數為 ${period}，再加上 ${remainder}。因此在範圍內的數有 ${values.join('、')}。`
        );
        continue;
      }

      let common = [12, 18, 24, 30, 36][randInt(0, 4)];
      let remainderA = randInt(1, 4);
      let shortageB = randInt(1, 4);
      let candidates = [];
      let left = 0;
      let right = 0;
      while (candidates.length < 2) {
        common = [12, 18, 24, 30, 36][randInt(0, 4)];
        remainderA = randInt(1, 4);
        shortageB = randInt(1, 4);
        left = common * randInt(4, 9) + remainderA;
        right = common * randInt(10, 18) - shortageB;
        candidates = divisorsOf(common).filter((d) => d > Math.max(remainderA, shortageB));
      }
      questions.push(`有一正整數除 ${left} 餘 ${remainderA}，除 ${right} 不足 ${shortageB}，求此數的最大值與最小值。`);
      summaryAnswers.push(`最大值 $${candidates[candidates.length - 1]}$，最小值 $${candidates[0]}$`);
      answers.push(
        `此數必須同時整除 $${left}-${remainderA}=${left - remainderA}$ 與 $${right}+${shortageB}=${right + shortageB}$。因此可行的因數來自它們的公因數，最大值是 ${candidates[candidates.length - 1]}，最小值是 ${candidates[0]}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function xToText(mods) {
    return mods.join('、');
  }

  function solveCongruenceSystem(congruences, limit) {
    for (let x = 1; x <= limit; x += 1) {
      if (congruences.every(({ mod, rem }) => x % mod === rem)) return x;
    }
    return null;
  }

  function buildHanXinAdvancedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const modSets = [
      [3, 5, 7],
      [4, 5, 7],
      [5, 7, 8],
    ];
    const rangeLow = 600;
    const rangeHigh = 800;

    for (let i = 0; i < count; i += 1) {
      let mods = [];
      let congruences = [];
      let period = 0;
      let base = 0;
      let values = [];
      let tries = 0;

      while (tries < 100) {
        mods = modSets[randInt(0, modSets.length - 1)];
        congruences = mods.map((mod) => ({ mod, rem: randInt(1, mod - 1) }));
        period = lcmAll(mods);
        base = solveCongruenceSystem(congruences, period);
        if (!base) {
          tries += 1;
          continue;
        }
        if (i % 2 === 0) break;
        values = [];
        for (let x = rangeLow; x <= rangeHigh; x += 1) {
          if (congruences.every(({ mod, rem }) => x % mod === rem)) values.push(x);
        }
        if (values.length > 0) break;
        tries += 1;
      }
      if (!base) continue;

      if (i % 2 === 0) {
        questions.push(
          `某隊伍點兵時，${mods[0]} 人一數餘 ${congruences[0].rem}，${mods[1]} 人一數餘 ${congruences[1].rem}，${mods[2]} 人一數餘 ${congruences[2].rem}，求最小的可能人數。`
        );
        summaryAnswers.push(`$${base}$`);
        answers.push(`這是一題韓信點兵型問題。因為要同時滿足三個餘數條件，最小正整數是 ${base}。`);
      } else {
        questions.push(
          `某隊伍點兵時，${mods[0]} 人一數餘 ${congruences[0].rem}，${mods[1]} 人一數餘 ${congruences[1].rem}，${mods[2]} 人一數餘 ${congruences[2].rem}。若總人數在 ${rangeLow} 到 ${rangeHigh} 之間，求所有可能的人數。`
        );
        summaryAnswers.push(values.join('、'));
        answers.push(`這組條件每隔 ${period} 人會重複一次，因此在範圍內的可能人數有 ${values.join('、')}。`);
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildSeparateGroupingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const stem = '男生女生分別分組，每組人數相同，最少可以分成幾組，每組多少人？';
    for (let i = 0; i < count; i += 1) {
      const unit = randInt(8, 24);
      const boysGroups = randInt(8, 20);
      const girlsGroups = randInt(8, 20);
      const boys = unit * boysGroups;
      const girls = unit * girlsGroups;
      const eachGroup = gcd(boys, girls);
      const minGroupCount = boys / eachGroup + girls / eachGroup;
      questions.push(`男生有${boys}人，女生有${girls}人。`);
      summaryAnswers.push(`共 ${minGroupCount} 組，每組 ${eachGroup} 人`);
      answers.push(`${minGroupCount}組，每組${eachGroup}人`);
    }
    return { intro: stem, questions, summaryAnswers, answers };
  }

  function buildMixedGroupingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const stem = '男生女生合併分組，各組男生人數和女生人數都要相同，最多可分為多少組，男女分別為多少人？';
    for (let i = 0; i < count; i += 1) {
      const groups = randInt(8, 20);
      const boysEach = randInt(6, 28);
      const girlsEach = randInt(6, 28);
      const boys = groups * boysEach;
      const girls = groups * girlsEach;
      const maxGroups = gcd(boys, girls);
      questions.push(`男生有${boys}人，女生有${girls}人。`);
      summaryAnswers.push(`${maxGroups} 組，男生每組 ${boys / maxGroups} 人，女生每組 ${girls / maxGroups} 人`);
      answers.push(`${maxGroups}組，男生每組${boys / maxGroups}人，女生每組${girls / maxGroups}人`);
    }
    return { intro: stem, questions, summaryAnswers, answers };
  }

  function buildCircularTrackSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const trackLength = 1200;
    const stem = `三人同時由起點同方向出發，繞周長為${trackLength}公尺的環狀步道，則至少在幾分鐘後三人會同時回到出發點？`;
    for (let i = 0; i < count; i += 1) {
      const t1 = [20, 24, 25, 30, 40, 48, 50, 60][randInt(0, 7)];
      const t2 = [12, 15, 20, 24, 30, 40, 50, 60][randInt(0, 7)];
      const t3 = [10, 12, 15, 20, 24, 30, 40, 60][randInt(0, 7)];
      const v1 = trackLength / t1;
      const v2 = trackLength / t2;
      const v3 = trackLength / t3;
      const meetMinutes = lcm(lcm(t1, t2), t3);
      questions.push(`三人分速分別為${v1}公尺、${v2}公尺、${v3}公尺。`);
      summaryAnswers.push(`$${meetMinutes}$ 分鐘`);
      answers.push(`${meetMinutes}`);
    }
    return { intro: stem, questions, summaryAnswers, answers };
  }

  function computeSingleSideRoadTrees(length, spacing, mode) {
    const intervals = Math.floor(length / spacing);
    if (mode === 'both') return intervals + 1;
    if (mode === 'none') return intervals - 1;
    if (mode === 'one-end') return intervals;
    return intervals; // loop
  }

  function buildRoadPlantingSingleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const stem = '道路種樹（單側），相鄰樹距固定，求最少樹數。';
    for (let i = 0; i < count; i += 1) {
      const spacing = randInt(10, 20);
      const intervals = randInt(12, 30);
      const length = spacing * intervals;
      const modePick = randInt(0, 3);
      const mode = ['both', 'none', 'one-end', 'loop'][modePick];
      let desc = '';
      if (mode === 'both') desc = '頭尾都種';
      if (mode === 'none') desc = '頭尾都不種';
      if (mode === 'one-end') desc = '頭種尾不種';
      if (mode === 'loop') desc = '環狀種樹';
      const trees = computeSingleSideRoadTrees(length, spacing, mode);
      questions.push(`道路長${length}公尺，每${spacing}公尺種一棵，${desc}。`);
      summaryAnswers.push(`$${trees}$ 棵`);
      answers.push(`${trees}`);
    }
    return { intro: stem, questions, summaryAnswers, answers };
  }

  function buildRoadPlantingDoubleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const stem = '道路種樹（兩側），相鄰樹距固定，求最少樹數。';
    for (let i = 0; i < count; i += 1) {
      const spacing = randInt(10, 20);
      const intervals = randInt(12, 30);
      const length = spacing * intervals;
      const modePick = randInt(0, 2);
      const mode = ['both', 'none', 'one-end'][modePick];
      let desc = '';
      if (mode === 'both') desc = '頭尾都種';
      if (mode === 'none') desc = '頭尾都不種';
      if (mode === 'one-end') desc = '頭種尾不種';
      const oneSide = computeSingleSideRoadTrees(length, spacing, mode);
      const trees = oneSide * 2;
      questions.push(`道路長${length}公尺，每${spacing}公尺種一棵，${desc}。`);
      summaryAnswers.push(`$${trees}$ 棵`);
      answers.push(`${trees}`);
    }
    return { intro: stem, questions, summaryAnswers, answers };
  }

  function buildRoadReplantKeepSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const stem = '長道路改變植樹間距，不需移動有幾棵？';
    for (let i = 0; i < count; i += 1) {
      const oldGap = [10, 20, 30, 40, 50][randInt(0, 4)];
      const newGap = [15, 25, 30, 45, 50, 55][randInt(0, 5)];
      const base = lcm(oldGap, newGap);
      const k = randInt(8, 22);
      const length = base * k;
      const bothSides = randInt(0, 1) === 1;
      const oneSideCount = length / base + 1;
      const keepCount = bothSides ? oneSideCount * 2 : oneSideCount;
      const sideText = bothSides ? '道路兩側種樹' : '道路一側種樹';
      questions.push(`長${length}公尺${sideText}，原本每${oldGap}公尺種一棵，改為每${newGap}公尺種一棵。`);
      summaryAnswers.push(`$${keepCount}$ 棵`);
      answers.push(`${keepCount}`);
    }
    return { intro: stem, questions, summaryAnswers, answers };
  }

  function buildRectangleMaxSquarePiecesSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const stem = '長方形裁成大小相同正方形，當正方形邊長最大時，最少可裁幾塊？';
    for (let i = 0; i < count; i += 1) {
      const g = [7, 8, 9, 10, 11, 12][randInt(0, 5)];
      const lMul = randInt(6, 14);
      const wMul = randInt(4, lMul - 1);
      const length = g * lMul;
      const width = g * wMul;
      const pieces = (length / g) * (width / g);
      questions.push(`長方形長${length}公分、寬${width}公分。`);
      summaryAnswers.push(`$${pieces}$ 塊`);
      answers.push(`${pieces}`);
    }
    return { intro: stem, questions, summaryAnswers, answers };
  }

  function euclideanSquareCount(a, b) {
    let x = Math.max(a, b);
    let y = Math.min(a, b);
    let total = 0;
    while (y > 0) {
      total += Math.floor(x / y);
      const r = x % y;
      x = y;
      y = r;
    }
    return total;
  }

  function buildRectangleMinSquarePiecesSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const stem = '長方形裁成一些正方形，最少可裁幾塊？';
    for (let i = 0; i < count; i += 1) {
      const length = randInt(40, 180);
      let width = randInt(24, length - 1);
      while (width === length) width = randInt(24, length - 1);
      const pieces = euclideanSquareCount(length, width);
      questions.push(`長方形長${length}公分、寬${width}公分。`);
      summaryAnswers.push(`$${pieces}$ 塊`);
      answers.push(`${pieces}`);
    }
    return { intro: stem, questions, summaryAnswers, answers };
  }

  function buildJ122GcdGroupingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const unit = randInt(6, 18);
      const aMul = randInt(4, 10);
      const bMul = randInt(5, 11);
      const a = unit * aMul;
      const b = unit * bMul;
      const g = gcd(a, b);
      const mode = i % 5;

      if (mode === 0) {
        questions.push(`有 ${a} 顆蘋果和 ${b} 顆梨子，平均裝入盒中且每盒數量都相同，最多可裝幾盒？`);
        summaryAnswers.push(`$${g}$ 盒`);
        answers.push(`要求最多盒數，就是找 ${a} 和 ${b} 的最大公因數，所以最多可裝 $${g}$ 盒。`);
        continue;
      }

      if (mode === 1) {
        questions.push(`有 ${a} 元和 ${b} 元要平均分給小朋友，每人分得金額相同，最多可分給幾人？`);
        summaryAnswers.push(`$${g}$ 人`);
        answers.push(`要求最多可分給幾人，就是找 ${a} 和 ${b} 的最大公因數，所以最多可分給 $${g}$ 人。`);
        continue;
      }

      if (mode === 2) {
        questions.push(`將 ${a} 位男生和 ${b} 位女生平均分配到各組，每組男女生人數都相同，求最大組數。`);
        summaryAnswers.push(`$${g}$ 組`);
        answers.push(`最大組數要讓男生、女生都能整分，所以找 ${a} 和 ${b} 的最大公因數，答案是 $${g}$ 組。`);
        continue;
      }

      if (mode === 3) {
        questions.push(`有 ${a} 顆紅球和 ${b} 顆藍球要平均分成幾堆，每堆球數都一樣，最多可分幾堆？`);
        summaryAnswers.push(`$${g}$ 堆`);
        answers.push(`要求最多幾堆且每堆一樣，就是求 ${a} 和 ${b} 的最大公因數，所以答案是 $${g}$ 堆。`);
        continue;
      }

      questions.push(`工廠有 ${a} 公升汽油和 ${b} 公升柴油，平均裝入相同容量的桶子，求最大桶子容量。`);
      summaryAnswers.push(`$${g}$ 公升`);
      answers.push(`要用最大且能剛好分完的容量，就是求 ${a} 和 ${b} 的最大公因數，所以最大桶子容量是 $${g}$ 公升。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ122GcdCuttingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const unit = randInt(6, 18);
      const aMul = randInt(4, 10);
      const bMul = randInt(5, 11);
      const cMul = randInt(6, 12);
      const a = unit * aMul;
      const b = unit * bMul;
      const c = unit * cMul;
      const g2 = gcd(a, b);
      const g3 = gcd(g2, c);
      const mode = i % 5;

      if (mode === 0) {
        questions.push(`將三根長度分別為 ${a}、${b}、${c} 公尺的繩子剪成等長的小段，最長每段幾公尺？`);
        summaryAnswers.push(`$${g3}$ 公尺`);
        answers.push(`要剪成最長且等長的小段，就是找 ${a}、${b}、${c} 的最大公因數，所以最長每段是 $${g3}$ 公尺。`);
        continue;
      }

      if (mode === 1) {
        questions.push(`在一個長 ${a} 公分、寬 ${b} 公分的地面鋪設最大的正方形地磚，求地磚邊長。`);
        summaryAnswers.push(`$${g2}$ 公分`);
        answers.push(`最大正方形地磚邊長要同時整除長與寬，所以找 ${a} 和 ${b} 的最大公因數，答案是 $${g2}$ 公分。`);
        continue;
      }

      if (mode === 2) {
        questions.push(`有一塊長 ${a} 公尺、寬 ${b} 公尺的空地，欲規劃成相同大小的最大正方形區域，求邊長。`);
        summaryAnswers.push(`$${g2}$ 公尺`);
        answers.push(`要求最大的正方形區域邊長，就是找 ${a} 和 ${b} 的最大公因數，所以邊長是 $${g2}$ 公尺。`);
        continue;
      }

      if (mode === 3) {
        const area = g2 * g2;
        questions.push(`將一張長 ${a} 公分、寬 ${b} 公分的長方形紙裁成最大的正方形且不剩餘，求正方形面積。`);
        summaryAnswers.push(`$${area}$ 平方公分`);
        answers.push(`先找最大正方形邊長：$\\gcd(${a},${b})=${g2}$，所以面積是 $${g2}^2=${area}$ 平方公分。`);
        continue;
      }

      questions.push(`牆面高 ${a} 公分、寬 ${b} 公分，要貼上最大的全等正方形磁磚，地磚邊長為何？`);
      summaryAnswers.push(`$${g2}$ 公分`);
      answers.push(`最大磁磚邊長要同時整除高與寬，所以找 ${a} 和 ${b} 的最大公因數，答案是 $${g2}$ 公分。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ122LcmPeriodicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = pickFromList([6, 8, 10, 12, 15, 18, 20, 24]);
      let b = pickFromList([8, 9, 12, 14, 15, 16, 18, 20, 24, 36]);
      while (b === a) b = pickFromList([8, 9, 12, 14, 15, 16, 18, 20, 24, 36]);
      const l = lcm(a, b);
      const mode = i % 5;

      if (mode === 0) {
        questions.push(`燈號閃爍：兩盞燈分別每 ${a} 秒與 ${b} 秒閃爍一次，同時閃爍後，下次同時閃爍是幾秒後？`);
        summaryAnswers.push(`$${l}$ 秒後`);
        answers.push(`下次同時閃爍的時間間隔是 ${a} 和 ${b} 的最小公倍數，所以是 $${l}$ 秒後。`);
        continue;
      }

      if (mode === 1) {
        questions.push(`公車班次：公車 A 每 ${a} 分鐘發車一班，公車 B 每 ${b} 分鐘發車一班，下次同時發車是多久後？`);
        summaryAnswers.push(`$${l}$ 分鐘後`);
        answers.push(`同時發車的週期是 ${a} 和 ${b} 的最小公倍數，所以是 $${l}$ 分鐘後。`);
        continue;
      }

      if (mode === 2) {
        questions.push(`鬧鐘響鈴：鬧鐘 A 每 ${a} 分鐘響一次，鬧鐘 B 每 ${b} 分鐘響一次，下次同時響鈴是多久後？`);
        summaryAnswers.push(`$${l}$ 分鐘後`);
        answers.push(`下次同時響鈴要找 ${a} 和 ${b} 的最小公倍數，所以是 $${l}$ 分鐘後。`);
        continue;
      }

      if (mode === 3) {
        questions.push(`跑步相遇：甲跑一圈需 ${a} 秒，乙跑一圈需 ${b} 秒，兩人同時起跑，多久後會在起點再次相遇？`);
        summaryAnswers.push(`$${l}$ 秒後`);
        answers.push(`再次同時回到起點的時間是 ${a} 和 ${b} 的最小公倍數，所以是 $${l}$ 秒後。`);
        continue;
      }

      questions.push(`灑水頻率：灑水器 A 每 ${a} 分鐘運作，灑水器 B 每 ${b} 分鐘運作，下次同時運作的時間間隔是多少？`);
      summaryAnswers.push(`$${l}$ 分鐘`);
      answers.push(`同時運作的間隔是 ${a} 和 ${b} 的最小公倍數，所以是 $${l}$ 分鐘。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ122LcmMinSquareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = pickFromList([6, 8, 10, 12, 15, 18, 20, 24]);
      let b = pickFromList([8, 12, 14, 16, 18, 20, 24, 36]);
      while (b === a) b = pickFromList([8, 12, 14, 16, 18, 20, 24, 36]);
      const l = lcm(a, b);
      const mode = i % 5;

      if (mode === 0) {
        questions.push(`用長 ${a} 公分、寬 ${b} 公分的長方形紙片拼成一個最小的正方形，求正方形邊長。`);
        summaryAnswers.push(`$${l}$ 公分`);
        answers.push(`最小正方形邊長要同時是長與寬的公倍數，且要最小，所以是 ${a} 和 ${b} 的最小公倍數 $${l}$。`);
        continue;
      }

      if (mode === 1) {
        questions.push(`用長 ${a} 公分、寬 ${b} 公分的瓷磚拼成一個最小正方形，求其邊長。`);
        summaryAnswers.push(`$${l}$ 公分`);
        answers.push(`要求最小正方形邊長，就是找 ${a} 和 ${b} 的最小公倍數，所以答案是 $${l}$ 公分。`);
        continue;
      }

      if (mode === 2) {
        questions.push(`用長 ${a} 公分、寬 ${b} 公分的卡片拼成一個最小正方形，求正方形邊長。`);
        summaryAnswers.push(`$${l}$ 公分`);
        answers.push(`要剛好拼成最小正方形，邊長必須同時是 ${a} 與 ${b} 的倍數，所以取最小公倍數 $${l}$。`);
        continue;
      }

      if (mode === 3) {
        questions.push(`用長 ${a} 公分、寬 ${b} 公分的色紙拼成最小正方形，求其邊長。`);
        summaryAnswers.push(`$${l}$ 公分`);
        answers.push(`最小正方形邊長是長與寬的最小公倍數，所以答案是 $${l}$ 公分。`);
        continue;
      }

      questions.push(`欲拼成一個正方形，已知地磚長 ${a} 公分、寬 ${b} 公分，求此正方形的最短邊長。`);
      summaryAnswers.push(`$${l}$ 公分`);
      answers.push(`正方形最短邊長要同時容納長與寬，所以找 ${a} 和 ${b} 的最小公倍數，答案是 $${l}$ 公分。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ122LcmMultiplesSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const triples = [
        [6, 8, 9],
        [10, 12, 15],
        [15, 20, 24],
        [12, 18, 20],
        [8, 14, 21],
      ];
      const [a, b, c] = triples[i % triples.length];
      const l = lcmAll([a, b, c]);

      if (mode <= 2) {
        questions.push(`找一個最小的正整數，使其能同時被 ${a}、${b}、${c} 整除。`);
        summaryAnswers.push(`$${l}$`);
        answers.push(`要求同時被 ${a}、${b}、${c} 整除的最小正整數，就是找它們的最小公倍數，所以答案是 $${l}$。`);
        continue;
      }

      if (mode === 3) {
        const a2 = 24;
        const b2 = 36;
        const l2 = lcm(a2, b2);
        questions.push(`尋找同時為 ${a2} 和 ${b2} 的倍數中，最小的正整數是多少？`);
        summaryAnswers.push(`$${l2}$`);
        answers.push(`同時是 ${a2} 和 ${b2} 的倍數的最小正整數，就是它們的最小公倍數，所以答案是 $${l2}$。`);
        continue;
      }

      const p = 12;
      const q = 18;
      const base = lcm(p, q);
      const values = [];
      for (let x = base; x < 100; x += base) values.push(x);
      questions.push(`找同時為 ${p} 和 ${q} 的倍數中，且數值小於 100 的整數有哪些？`);
      summaryAnswers.push(values.join('、'));
      answers.push(
        `先找最小公倍數：$\\mathrm{lcm}(${p},${q})=${base}$，所以小於 100 的共同倍數有 ${values.join('、')}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildLinearRemoveParenthesesSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a1 = pickNonZero(-12, 12);
      const b1 = pickNonZero(-12, 12);
      const a2 = pickNonZero(-12, 12);
      const b2 = pickNonZero(-12, 12);
      const op = randInt(0, 1) ? '+' : '-';

      const left = formatLinearExpr(a1, b1);
      const right = formatLinearExpr(a2, b2);
      const coef = -a1 + (op === '+' ? a2 : -a2);
      const constant = -b1 + (op === '+' ? b2 : -b2);

      questions.push(`化簡：\\(-(${left})${op}(${right})\\)`);
      summaryAnswers.push(`$${formatLinearExpr(coef, constant)}$`);
      answers.push(`\\(-(${left})${op}(${right})=${formatLinearExpr(coef, constant)}\\)`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildLinearMultiplyParenthesesSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const p = pickNonZero(2, 12);
      const q = pickNonZero(2, 12);
      const a1 = pickNonZero(-12, 12);
      const b1 = pickNonZero(-12, 12);
      const a2 = pickNonZero(-12, 12);
      const b2 = pickNonZero(-12, 12);
      const op = randInt(0, 1) ? '+' : '-';

      const left = formatLinearExpr(a1, b1);
      const right = formatLinearExpr(a2, b2);
      const coef = p * a1 + (op === '+' ? q * a2 : -q * a2);
      const constant = p * b1 + (op === '+' ? q * b2 : -q * b2);

      questions.push(`化簡：\\(${p}(${left})${op}${q}(${right})\\)`);
      summaryAnswers.push(`$${formatLinearExpr(coef, constant)}$`);
      answers.push(`\\(${p}(${left})${op}${q}(${right})=${formatLinearExpr(coef, constant)}\\)`);
    }
    return { questions, summaryAnswers, answers };
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

  function absFraction(a) {
    return { num: Math.abs(a.num), den: a.den };
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

  function joinSignedFractionTerms(fracs, mixed = true) {
    return fracs
      .map((frac, index) => {
        const value = makeFraction(frac.num, frac.den);
        const absValue = makeFraction(Math.abs(value.num), value.den);
        const body = fractionToLatex(absValue, mixed);
        if (index === 0) {
          return value.num < 0 ? `-${body}` : body;
        }
        return `${value.num < 0 ? '-' : '+'}${body}`;
      })
      .join('');
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

  function makeMixedFraction(whole, fracNum, den, negative = false) {
    const absWhole = Math.abs(whole);
    const num = absWhole * den + fracNum;
    return makeFraction(negative ? -num : num, den);
  }

  function buildMixedNumberSumFactor(targetWhole) {
    const den = [2, 3, 4, 5, 6, 7, 8, 10][randInt(0, 7)];
    const fracA = randInt(1, den - 1);
    const fracB = den - fracA;
    const wholeA = randInt(Math.max(10, Math.floor(targetWhole * 0.25)), Math.max(10, Math.floor(targetWhole * 0.75)));
    const wholeB = targetWhole - 1 - wholeA;
    const left = makeMixedFraction(wholeA, fracA, den, false);
    const right = makeMixedFraction(wholeB, fracB, den, false);
    return {
      left,
      right,
      operator: '+',
      value: makeFraction(targetWhole, 1),
      latex: `\\left(${integerOrFractionLatex(left)}+${integerOrFractionLatex(right)}\\right)`,
      explain: `${integerOrFractionLatex(left)}+${integerOrFractionLatex(right)}`,
    };
  }

  function buildMixedNumberDiffFactor(targetWhole) {
    const den = [2, 3, 4, 5, 6, 7, 8, 10][randInt(0, 7)];
    const frac = randInt(1, den - 1);
    const offset = randInt(2, 99);
    const left = makeMixedFraction(targetWhole + offset, frac, den, false);
    const right = makeMixedFraction(offset, frac, den, false);
    return {
      left,
      right,
      operator: '-',
      value: makeFraction(targetWhole, 1),
      latex: `\\left(${integerOrFractionLatex(left)}-${integerOrFractionLatex(right)}\\right)`,
      explain: `${integerOrFractionLatex(left)}-${integerOrFractionLatex(right)}`,
    };
  }

  function buildMixedNumberStructuredFactor(targetWhole, forceMode = '') {
    const mode = forceMode || (randInt(0, 1) === 0 ? 'sum' : 'diff');
    return mode === 'diff' ? buildMixedNumberDiffFactor(targetWhole) : buildMixedNumberSumFactor(targetWhole);
  }

  function buildFractionAddSubBracketSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const denMain = [5, 6, 8, 10][randInt(0, 3)];
      const denCancel = [3, 4, 7, 9][randInt(0, 3)];
      const fracA = randInt(1, denMain - 1);
      const fracB = randInt(1, denMain - 1);
      const fracD = randInt(1, denMain - 1);
      const fracCancel = randInt(1, denCancel - 1);
      const a = makeMixedFraction(randInt(2, 6), fracA, denMain, false);
      const b = makeMixedFraction(randInt(2, 6), fracB, denMain, false);
      const c = makeMixedFraction(randInt(3, 8), fracCancel, denCancel, false);
      const d = makeMixedFraction(randInt(2, 6), fracD, denMain, false);
      const e = makeMixedFraction(randInt(2, 7), fracCancel, denCancel, false);
      const result = subFraction(subFraction(a, addFraction(b, c)), subFraction(d, e));
      questions.push(
        `計算：$${integerOrFractionLatex(a)}-\\left(${integerOrFractionLatex(b)}+${integerOrFractionLatex(c)}\\right)-\\left(${integerOrFractionLatex(d)}-${integerOrFractionLatex(e)}\\right)$。`
      );
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `先去括號：$${joinSignedFractionTerms([a, negateFraction(b), negateFraction(c), negateFraction(d), e], true)}$。觀察可知 $${fractionToLatex(makeFraction(fracCancel, denCancel))}$ 與 $-${fractionToLatex(makeFraction(fracCancel, denCancel))}$ 互相抵消，剩下的只要處理分母都是 $${denMain}$ 的分數部分，整理後得 $${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildFractionAddSubNegativeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randomMixedFraction(1, 3, [2, 3, 4, 5, 6], false);
      const b = randomProperFraction([2, 3, 4, 5, 6, 8, 9]);
      const c = randomProperFraction([2, 3, 4, 5, 6, 8, 9]);
      const d = randomMixedFraction(1, 3, [2, 3, 4, 5, 6], true);
      const result = addFraction(addFraction(addFraction(a, b), c), d);
      questions.push(
        `計算：$${integerOrFractionLatex(a)}-\\left(-${integerOrFractionLatex(b)}\\right)+${integerOrFractionLatex(c)}-\\left(${integerOrFractionLatex(negateFraction(d))}\\right)$。`
      );
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `把減去負數改成加：$${joinSignedFractionTerms([a, b, c, d], true)}$，結果是 $${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildFractionAbsoluteSymmetrySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = randInt(2, 4);
      const a = randomProperFraction([2, 3, 4, 5, 6, 8]);
      const b = randomProperFraction([2, 3, 4, 5, 6, 8]);
      const c = randomProperFraction([2, 3, 4, 5, 6, 8]);
      const d = randomProperFraction([2, 3, 4, 5, 6, 8]);
      const useAddition = randInt(0, 1) === 1;
      const leftInner = addFraction(subFraction(addFraction(makeFraction(base, 1), a), b), subFraction(c, d));
      const rightInner = addFraction(
        subFraction(subFraction(makeFraction(base, 1), a), b),
        subFraction(negateFraction(c), d)
      );
      const result = useAddition
        ? addFraction(absFraction(leftInner), absFraction(rightInner))
        : subFraction(absFraction(leftInner), absFraction(rightInner));
      const leftExpr = `${base}+${fractionToLatex(a)}-${fractionToLatex(b)}+${fractionToLatex(c)}-${fractionToLatex(d)}`;
      const rightExpr = `${base}-${fractionToLatex(a)}-${fractionToLatex(b)}-${fractionToLatex(c)}-${fractionToLatex(d)}`;
      questions.push(`計算：$\\left|${leftExpr}\\right|${useAddition ? '+' : '-'}\\left|${rightExpr}\\right|$。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `先各自算兩個絕對值內部，再取絕對值：$\\left|${leftExpr}\\right|=${fractionToLatex(absFraction(leftInner), true)}$、$\\left|${rightExpr}\\right|=${fractionToLatex(absFraction(rightInner), true)}$。最後依題目的 ${useAddition ? '加法' : '減法'} 合併，得 $${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildFractionMulDivMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randomMixedFraction(2, 4, [2, 3, 4, 5, 6], true);
      let b = randomProperFraction([2, 3, 4, 5, 6, 7]);
      if (randInt(0, 1) === 1) b = negateFraction(b);
      let c = randomProperFraction([2, 3, 4, 5, 6, 7]);
      if (randInt(0, 1) === 1) c = negateFraction(c);
      const result = divFraction(divFraction(a, b), c);
      questions.push(
        `計算：$\\left(${integerOrFractionLatex(a)}\\right)\\div\\left(${fractionToLatex(b)}\\right)\\div\\left(${fractionToLatex(c)}\\right)$。`
      );
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `先把除法改成乘倒數：$${integerOrFractionLatex(a)}\\times\\frac{${b.den}}{${b.num}}\\times\\frac{${c.den}}{${c.num}}$，約分整理後得 $${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildFractionDistributiveCommonFactorSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const common = [makeFraction(-25, 1), makeFraction(-125, 1), makeFraction(-250, 1)][randInt(0, 2)];
      const target = [300, 400, 500, 600, 800, 900, 1000, 1200][randInt(0, 7)];
      const den = [2, 4, 5, 8][randInt(0, 3)];
      const fracNum = randInt(1, den - 1);
      const wholeA = randInt(50, target - 51);
      const wholeB = target - wholeA - 1;
      const a = makeMixedFraction(wholeA, fracNum, den, false);
      const b = makeMixedFraction(wholeB, den - fracNum, den, false);
      const sum = addFraction(a, b);
      const result = mulFraction(sum, common);
      questions.push(
        `利用分配律計算：$${integerOrFractionLatex(a)}\\times\\left(${fractionToLatex(common)}\\right)+${integerOrFractionLatex(b)}\\times\\left(${fractionToLatex(common)}\\right)$。`
      );
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `提出公因數 $${fractionToLatex(common)}$：$\\left(${integerOrFractionLatex(a)}+${integerOrFractionLatex(b)}\\right)\\times\\left(${fractionToLatex(common)}\\right)=${integerOrFractionLatex(sum)}\\times\\left(${fractionToLatex(common)}\\right)=${fractionToLatex(result, true)}$。先把括號內兩項合併成完整的數，再做整數乘法會更快。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildFractionDistributiveRegroupSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const leftTarget = [1200, 1700, 2400, 3200, 4500, 5600][randInt(0, 5)];
      const rightTarget = [120, 160, 240, 320, 400, 500, 600, 800, 1700][randInt(0, 8)];
      const modePattern = [
        ['sum', 'sum'],
        ['sum', 'diff'],
        ['diff', 'sum'],
        ['diff', 'diff'],
      ][randInt(0, 3)];
      const leftFactor = buildMixedNumberStructuredFactor(leftTarget, modePattern[0]);
      const rightFactor = buildMixedNumberStructuredFactor(rightTarget, modePattern[1]);
      const result = mulFraction(leftFactor.value, rightFactor.value);
      const leftSign = leftFactor.operator === '+' ? 1 : -1;
      const rightSign = rightFactor.operator === '+' ? 1 : -1;
      const productTerms = [
        {
          sign: 1,
          latex: `\\left(${integerOrFractionLatex(leftFactor.left)}\\right)\\times\\left(${integerOrFractionLatex(rightFactor.left)}\\right)`,
        },
        {
          sign: rightSign,
          latex: `\\left(${integerOrFractionLatex(leftFactor.left)}\\right)\\times\\left(${integerOrFractionLatex(rightFactor.right)}\\right)`,
        },
        {
          sign: leftSign,
          latex: `\\left(${integerOrFractionLatex(leftFactor.right)}\\right)\\times\\left(${integerOrFractionLatex(rightFactor.left)}\\right)`,
        },
        {
          sign: leftSign * rightSign,
          latex: `\\left(${integerOrFractionLatex(leftFactor.right)}\\right)\\times\\left(${integerOrFractionLatex(rightFactor.right)}\\right)`,
        },
      ];
      const questionLatex = productTerms
        .map((term, index) => {
          if (index === 0) return term.latex;
          return `${term.sign < 0 ? '-' : '+'}${term.latex}`;
        })
        .join('');

      const regroupLatex = [
        `\\left(${integerOrFractionLatex(leftFactor.left)}\\right)\\times${rightFactor.latex}`,
        `${leftSign < 0 ? '-' : '+'}\\left(${integerOrFractionLatex(leftFactor.right)}\\right)\\times${rightFactor.latex}`,
      ].join('');

      questions.push(`利用分配律簡算：$${questionLatex}$。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `先把前兩項與後兩項分組，可寫成 $${regroupLatex}$。再提出共同的 $${rightFactor.latex}$，得到 $${leftFactor.latex}${rightFactor.latex}$。接著整理括號：$${leftFactor.explain}=${leftTarget}$，$${rightFactor.explain}=${rightTarget}$，所以原式 $=${leftTarget}\\times ${rightTarget}=${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildTelescopingGapFourSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const gap = [2, 3, 4, 5, 6][randInt(0, 4)];
      const start = randInt(2, 9);
      const terms = randInt(5, 8);
      const seq = Array.from({ length: terms + 1 }, (_, idx) => start + idx * gap);
      const first = `\\frac{1}{${seq[0]}\\times ${seq[1]}}`;
      const second = `\\frac{1}{${seq[1]}\\times ${seq[2]}}`;
      const penultimate = `\\frac{1}{${seq[terms - 1]}\\times ${seq[terms]}}`;
      const last = `\\frac{1}{${seq[terms - 2]}\\times ${seq[terms - 1]}}`;
      const telescoped = mulFraction(
        makeFraction(1, gap),
        subFraction(makeFraction(1, seq[0]), makeFraction(1, seq[terms]))
      );
      questions.push(`計算：$${first}+${second}+\\cdots+${last}+${penultimate}$。`);
      summaryAnswers.push(`$${fractionToLatex(telescoped)}$`);
      answers.push(
        `因為 $\\frac{1}{k(k+${gap})}=\\frac{1}{${gap}}\\left(\\frac{1}{k}-\\frac{1}{k+${gap}}\\right)$，所以中間項會對消，結果是 $${fractionToLatex(telescoped)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildTelescopingAdjacentSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const start = randInt(1, 6);
      const terms = randInt(5, 8);
      const numerator = randInt(1, 5);
      const first = `\\frac{${numerator}}{${start}\\times ${start + 1}}`;
      const second = `\\frac{${numerator}}{${start + 1}\\times ${start + 2}}`;
      const lastLeft = start + terms - 2;
      const last = `\\frac{${numerator}}{${lastLeft}\\times ${lastLeft + 1}}`;
      const penultimate = `\\frac{${numerator}}{${lastLeft + 1}\\times ${lastLeft + 2}}`;
      const result = mulFraction(
        makeFraction(numerator, 1),
        subFraction(makeFraction(1, start), makeFraction(1, start + terms))
      );
      questions.push(`計算：$${first}+${second}+\\cdots+${last}+${penultimate}$。`);
      summaryAnswers.push(`$${fractionToLatex(result)}$`);
      answers.push(
        `因為 $\\frac{${numerator}}{k(k+1)}=${numerator}\\left(\\frac{1}{k}-\\frac{1}{k+1}\\right)$，所以分項對消後得到 $${numerator}\\left(\\frac{1}{${start}}-\\frac{1}{${start + terms}}\\right)=${fractionToLatex(result)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildTelescopingProductSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const numerator = randInt(1, 2);
      const start = numerator === 1 ? randInt(3, 7) : randInt(4, 8);
      const terms = randInt(5, 8);
      const denoms = Array.from({ length: terms }, (_, idx) => start + idx);
      const first = `\\left(1-\\frac{${numerator}}{${denoms[0]}}\\right)`;
      const second = `\\left(1-\\frac{${numerator}}{${denoms[1]}}\\right)`;
      const last = `\\left(1-\\frac{${numerator}}{${denoms[terms - 2]}}\\right)`;
      const penultimate = `\\left(1-\\frac{${numerator}}{${denoms[terms - 1]}}\\right)`;
      const remainingNum = numerator === 1 ? [start - 1] : [start - 2, start - 1];
      const remainingDen = numerator === 1 ? [denoms[terms - 1]] : [denoms[terms - 2], denoms[terms - 1]];
      const result = makeFraction(
        remainingNum.reduce((acc, value) => acc * value, 1),
        remainingDen.reduce((acc, value) => acc * value, 1)
      );
      const expandedFirst = numerator === 1 ? `\\frac{${start - 1}}{${start}}` : `\\frac{${start - 2}}{${start}}`;
      const expandedSecond = numerator === 1 ? `\\frac{${start}}{${start + 1}}` : `\\frac{${start - 1}}{${start + 1}}`;
      const expandedLast =
        numerator === 1
          ? `\\frac{${denoms[terms - 2] - 1}}{${denoms[terms - 2]}}`
          : `\\frac{${denoms[terms - 2] - 2}}{${denoms[terms - 2]}}`;
      const expandedPenultimate =
        numerator === 1
          ? `\\frac{${denoms[terms - 1] - 1}}{${denoms[terms - 1]}}`
          : `\\frac{${denoms[terms - 1] - 2}}{${denoms[terms - 1]}}`;
      questions.push(`計算：$${first}\\times${second}\\times\\cdots\\times${last}\\times${penultimate}$。`);
      summaryAnswers.push(`$${fractionToLatex(result)}$`);
      answers.push(
        numerator === 1
          ? `把每一項改寫成分數，可得 $${expandedFirst}\\times${expandedSecond}\\times\\cdots\\times${expandedLast}\\times${expandedPenultimate}$。前後對消後，分子只剩 1 項、分母也只剩 1 項，所以結果是 $${fractionToLatex(result)}$。`
          : `把每一項改寫成分數，可得 $${expandedFirst}\\times${expandedSecond}\\times\\cdots\\times${expandedLast}\\times${expandedPenultimate}$。前後對消後，分子剩下 $${remainingNum[0]}\\times ${remainingNum[1]}$，分母剩下 $${remainingDen[0]}\\times ${remainingDen[1]}$，所以結果是 $${fractionToLatex(result)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildLinearFractionParenthesesSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const denChoices = [2, 3, 4, 5, 6, 7, 8, 9];

    for (let i = 0; i < count; i += 1) {
      const a1 = pickNonZero(-12, 12),
        b1 = pickNonZero(-12, 12);
      const a2 = pickNonZero(-12, 12),
        b2 = pickNonZero(-12, 12);
      const d1 = denChoices[randInt(0, denChoices.length - 1)];
      const d2 = denChoices[randInt(0, denChoices.length - 1)];
      const op = randInt(0, 1) ? '+' : '-';

      const coefNum = op === '+' ? a1 * d2 + a2 * d1 : a1 * d2 - a2 * d1;
      const constNum = op === '+' ? b1 * d2 + b2 * d1 : b1 * d2 - b2 * d1;
      const commonDen = d1 * d2;
      const sCoef = simplifyFraction(coefNum, commonDen);
      const sConst = simplifyFraction(constNum, commonDen);

      const frac1 = String.raw`\frac{${a1}x${b1 >= 0 ? '+' : ''}${b1}}{${d1}}`;
      const frac2 = String.raw`\frac{${a2}x${b2 >= 0 ? '+' : ''}${b2}}{${d2}}`;
      const coefText = sCoef.den === 1 ? `${sCoef.num}x` : String.raw`\frac{${sCoef.num}}{${sCoef.den}}x`;
      const constText =
        sConst.num === 0
          ? ''
          : sConst.den === 1
            ? `${sConst.num > 0 ? '+' : ''}${sConst.num}`
            : `${sConst.num > 0 ? '+' : '-'}${String.raw`\frac{${Math.abs(sConst.num)}}{${sConst.den}}`}`;

      questions.push(`化簡：\\(${frac1} ${op} ${frac2}\\)`);
      summaryAnswers.push(`$${coefText}${constText}$`);
      answers.push(`\\(${frac1} ${op} ${frac2}=${coefText}${constText}\\)`);
    }
    return { questions, summaryAnswers, answers };
  }

  function formatSolvedX(num, den) {
    const f = simplifyFraction(num, den);
    if (f.den === 1) return `${f.num}`;
    return String.raw`\frac{${f.num}}{${f.den}}`;
  }

  function buildLinearMoveTermsSolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-12, 12);
      let c = pickNonZero(-12, 12);
      while (c === a) c = pickNonZero(-12, 12);
      const b = pickNonZero(-18, 18);
      const d = pickNonZero(-18, 18);
      const left = formatLinearExpr(a, b);
      const right = formatLinearExpr(c, d);
      const coef = a - c;
      const constant = d - b;
      questions.push(`解：\\(${left}=${right}\\)`);
      summaryAnswers.push(`$x=${formatSolvedX(constant, coef)}$`);
      answers.push(`\\(${coef}x=${constant}\\Rightarrow x=${formatSolvedX(constant, coef)}\\)`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildLinearExpandMoveSolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const p = pickNonZero(-10, 10);
      const q = pickNonZero(-10, 10);
      const a1 = pickNonZero(-12, 12);
      const b1 = pickNonZero(-12, 12);
      const a2 = pickNonZero(-12, 12);
      const b2 = pickNonZero(-12, 12);
      const coef = p * a1 - q * a2;
      if (coef === 0) {
        i -= 1;
        continue;
      }
      const constant = q * b2 - p * b1;
      const left = formatLinearExpr(a1, b1);
      const right = formatLinearExpr(a2, b2);
      questions.push(`解：\\(${p}(${left})=${q}(${right})\\)`);
      summaryAnswers.push(`$x=${formatSolvedX(constant, coef)}$`);
      answers.push(`\\(${coef}x=${constant}\\Rightarrow x=${formatSolvedX(constant, coef)}\\)`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildLinearCrossMultiplySolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const denChoices = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (let i = 0; i < count; i += 1) {
      const a1 = pickNonZero(-12, 12);
      const b1 = pickNonZero(-12, 12);
      const a2 = pickNonZero(-12, 12);
      const b2 = pickNonZero(-12, 12);
      const m = denChoices[randInt(0, denChoices.length - 1)];
      const n = denChoices[randInt(0, denChoices.length - 1)];
      const coef = n * a1 - m * a2;
      if (coef === 0) {
        i -= 1;
        continue;
      }
      const constant = m * b2 - n * b1;
      const leftNum = formatLinearExpr(a1, b1);
      const rightNum = formatLinearExpr(a2, b2);
      questions.push(`解：\\(\\frac{${leftNum}}{${m}}=\\frac{${rightNum}}{${n}}\\)`);
      summaryAnswers.push(`$x=${formatSolvedX(constant, coef)}$`);
      answers.push(
        `\\(${n}(${leftNum})=${m}(${rightNum})\\Rightarrow ${coef}x=${constant}\\Rightarrow x=${formatSolvedX(constant, coef)}\\)`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildLinearLcmMultiplySolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const denChoices = [2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < count; i += 1) {
      const a1 = pickNonZero(-12, 12);
      const b1 = pickNonZero(-12, 12);
      const a2 = pickNonZero(-12, 12);
      const b2 = pickNonZero(-12, 12);
      const m = denChoices[randInt(0, denChoices.length - 1)];
      const n = denChoices[randInt(0, denChoices.length - 1)];
      const c = pickNonZero(-6, 6);
      const l = lcm(m, n);
      const left1 = formatLinearExpr(a1, b1);
      const left2 = formatLinearExpr(a2, b2);
      const op = randInt(0, 1) ? '+' : '-';
      const secondCoef = op === '+' ? a2 : -a2;
      const secondConst = op === '+' ? b2 : -b2;
      const coef2 = (l / n) * secondCoef;
      const const2 = (l / n) * secondConst;
      const finalCoef = (l / m) * a1 + coef2;
      if (finalCoef === 0) {
        i -= 1;
        continue;
      }
      const finalConstant = l * c - (l / m) * b1 - const2;
      questions.push(`解：\\(\\frac{${left1}}{${m}} ${op} \\frac{${left2}}{${n}}=${c}\\)`);
      summaryAnswers.push(`$x=${formatSolvedX(finalConstant, finalCoef)}$`);
      answers.push(
        `同乘\\(${l}\\)：\\(${finalCoef}x=${finalConstant}\\Rightarrow x=${formatSolvedX(finalConstant, finalCoef)}\\)`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildLinearSameSolutionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    function formatNExpr(constant = 0) {
      if (constant === 0) return 'nx';
      return `nx${constant > 0 ? '+' : ''}${constant}`;
    }

    for (let i = 0; i < count; i += 1) {
      const xValue = pickNonZero(-6, 6);
      const leftScale = pickNonZero(-5, 5);
      const innerConst = pickNonZero(-6, 6);
      let rightCoef = pickNonZero(-5, 5);
      while (rightCoef === leftScale) rightCoef = pickNonZero(-5, 5);
      const rightConst = leftScale * (xValue + innerConst) - rightCoef * xValue;

      const leftEq = `${leftScale}\\left(x${innerConst >= 0 ? '+' : ''}${innerConst}\\right)`;
      const rightEq = formatLinearExpr(rightCoef, rightConst);

      const leftLinearCoef = pickNonZero(-8, 8);
      const nValue = pickNonZero(-8, 8);
      const leftLinearConst = pickNonZero(-10, 10);
      const rightLinearConst = leftLinearCoef * xValue + leftLinearConst - nValue * xValue;
      const secondLeft = formatLinearExpr(leftLinearCoef, leftLinearConst);
      const secondRight = formatNExpr(rightLinearConst);

      questions.push(`已知 $${leftEq}=${rightEq}$ 與 $${secondLeft}=${secondRight}$ 的解相同，求 $n$。`);
      summaryAnswers.push(`$n=${nValue}$`);
      answers.push(
        `先解第一式：$${leftEq}=${rightEq}\\Rightarrow ${leftScale - rightCoef}x=${rightConst - leftScale * innerConst}\\Rightarrow x=${xValue}$。再把 $x=${xValue}$ 代入第二式：$${secondLeft}=${secondRight}\\Rightarrow ${leftLinearCoef * xValue + leftLinearConst}=${xValue}n${rightLinearConst >= 0 ? '+' : ''}${rightLinearConst}\\Rightarrow ${xValue}n=${leftLinearCoef * xValue + leftLinearConst - rightLinearConst}\\Rightarrow n=${nValue}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function formatDecimalTenths(value) {
    return trimDecimalString(`${Number((value / 10).toFixed(6))}`);
  }

  function formatDecimalLinearExpr(coefTenths, constTenths, variable = 'x') {
    let expr = '';
    if (coefTenths === 10) expr = variable;
    else if (coefTenths === -10) expr = `-${variable}`;
    else expr = `${formatDecimalTenths(coefTenths)}${variable}`;
    if (constTenths === 0) return expr;
    return `${expr}${constTenths > 0 ? '+' : ''}${formatDecimalTenths(constTenths)}`;
  }

  function buildLinearDecimalMoveSolveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const xValue = pickNonZero(-15, 15);
      let leftCoefTenths = pickNonZero(-18, 18);
      let rightCoefTenths = pickNonZero(-18, 18);
      while (leftCoefTenths === rightCoefTenths) rightCoefTenths = pickNonZero(-18, 18);
      const leftConstTenths = randInt(-30, 30);
      const rightConstTenths = (leftCoefTenths - rightCoefTenths) * xValue + leftConstTenths;
      if (Math.abs(rightConstTenths) > 40) {
        i -= 1;
        continue;
      }
      const coefTenths = leftCoefTenths - rightCoefTenths;
      const constantTenths = rightConstTenths - leftConstTenths;
      questions.push(
        `解方程式：$${formatDecimalLinearExpr(leftCoefTenths, leftConstTenths)}=${formatDecimalLinearExpr(rightCoefTenths, rightConstTenths)}$`
      );
      summaryAnswers.push(`$x=${xValue}$`);
      answers.push(
        `移項得 $${formatDecimalLinearExpr(coefTenths, 0)}=${formatDecimalTenths(constantTenths)}$，所以 $x=${xValue}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ133ConsecutiveIntegerSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const middle = randInt(7, 35);
        const sum = middle - 2 + middle + (middle + 2);
        questions.push(`連續三個奇數的和為 ${sum}，求最大的奇數。`);
        summaryAnswers.push(`$${middle + 2}$`);
        answers.push(
          `設中間的奇數為 $x$，則三數為 $x-2,\\ x,\\ x+2$。由 $(x-2)+x+(x+2)=${sum}$ 得 $3x=${sum}$，所以 $x=${middle}$，最大的奇數是 $${middle + 2}$。`
        );
        continue;
      }

      if (variant === 1) {
        const first = randInt(4, 18);
        const sum = first + (first + 1) + (first + 2);
        questions.push(`連續三個整數的和為 ${sum}，求中間的整數。`);
        summaryAnswers.push(`$${first + 1}$`);
        answers.push(
          `設最小的整數為 $x$，則三數為 $x,\\ x+1,\\ x+2$。由 $x+(x+1)+(x+2)=${sum}$ 得 $3x+3=${sum}$，解得 $x=${first}$，所以中間的整數是 $${first + 1}$。`
        );
        continue;
      }

      const firstEven = randInt(2, 16) * 2;
      const sum = firstEven + (firstEven + 2) + (firstEven + 4) + (firstEven + 6);
      questions.push(`連續四個偶數的和為 ${sum}，求最小的偶數。`);
      summaryAnswers.push(`$${firstEven}$`);
      answers.push(
        `設最小的偶數為 $x$，則四數為 $x,\\ x+2,\\ x+4,\\ x+6$。由 $x+(x+2)+(x+4)+(x+6)=${sum}$ 得 $4x+12=${sum}$，解得 $x=${firstEven}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ133RatioChainSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 2;

      if (variant === 0) {
        const a = pickFromList([2, 3, 4, 5]);
        const b = pickFromList([3, 4, 5, 6]);
        const c = pickFromList([4, 5, 6, 7]);
        const unit = randInt(2, 6);
        const xValue = a * unit;
        const yValue = b * unit;
        const zValue = c * unit;
        const total = xValue + yValue + zValue;
        const ask = pickFromList(['x', 'y', 'z']);
        const answerValue = ask === 'x' ? xValue : ask === 'y' ? yValue : zValue;
        questions.push(
          `若 $\\dfrac{x}{${a}}=\\dfrac{y}{${b}}=\\dfrac{z}{${c}}$，且 $x+y+z=${total}$，求 $${ask}$ 的值。`
        );
        summaryAnswers.push(`$${answerValue}$`);
        answers.push(
          `設共同的比值為 $k$，則 $x=${a}k,\\ y=${b}k,\\ z=${c}k$。所以 $${a}k+${b}k+${c}k=${total}$，即 $${a + b + c}k=${total}$，得 $k=${unit}$。因此 $${ask}=${answerValue}$。`
        );
        continue;
      }

      const ratioAB = pickFromList([
        [2, 3],
        [3, 5],
        [4, 7],
        [5, 8],
      ]);
      const ratioBC = pickFromList([
        [4, 5],
        [5, 6],
        [3, 4],
        [6, 7],
      ]);
      const [m, n] = ratioAB;
      const [p, q] = ratioBC;
      const baseB = lcm(n, p) * randInt(1, 4);
      const aValue = (m * baseB) / n;
      const bValue = baseB;
      const cValue = (q * baseB) / p;
      const total = aValue + bValue + cValue;
      questions.push(`將 ${total} 分成甲、乙、丙三數，已知甲：乙 = ${m}:${n}，乙：丙 = ${p}:${q}，求乙數。`);
      summaryAnswers.push(`$${bValue}$`);
      answers.push(
        `先設乙數為共同連接量。因為甲：乙 = ${m}:${n}$，所以甲 $=\\dfrac{${m}}{${n}}\\times$ 乙；又因乙：丙 = ${p}:${q}$，所以丙 $=\\dfrac{${q}}{${p}}\\times$ 乙。代入總和得 $\\dfrac{${m}}{${n}}x+x+\\dfrac{${q}}{${p}}x=${total}$，解得乙數 $x=${bValue}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ133AverageCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const rolePairs = [
      ['男生', '女生'],
      ['甲組', '乙組'],
      ['先發球員', '替補球員'],
      ['高年級', '低年級'],
    ];

    for (let i = 0; i < count; i += 1) {
      const [groupA, groupB] = rolePairs[i % rolePairs.length];
      const countA = randInt(12, 24);
      const countB = randInt(10, 22);
      const avgA = randInt(72, 88);
      const avgB = randInt(60, 76);
      const totalCount = countA + countB;
      const totalScore = countA * avgA + countB * avgB;
      if (totalScore % totalCount !== 0) {
        i -= 1;
        continue;
      }
      const overall = totalScore / totalCount;
      questions.push(
        `某班共有 ${totalCount} 人，全班平均 ${overall} 分，其中${groupA}平均 ${avgA} 分，${groupB}平均 ${avgB} 分，求${groupA}有多少人。`
      );
      summaryAnswers.push(`$${countA}$`);
      answers.push(
        `設${groupA}有 $x$ 人，則${groupB}有 ${totalCount}-x 人。由總分相加得 ${avgA}x+${avgB}(${totalCount}-x)=${overall}\\times ${totalCount}$，解得 $x=${countA}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ133TotalPriceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const itemSets = [
      ['原子筆', '筆記本', 15, 20],
      ['鉛筆', '橡皮擦', 12, 18],
      ['雞蛋', '蘋果', 8, 13],
      ['車票', '月台票', 25, 10],
    ];

    for (let i = 0; i < count; i += 1) {
      const [itemA, itemB, priceA, priceB] = itemSets[i % itemSets.length];
      const countA = randInt(3, 9);
      const countB = randInt(2, 8);
      const totalCount = countA + countB;
      const totalCost = countA * priceA + countB * priceB;
      questions.push(
        `小明買了 $x$ 個${itemA}和 $y$ 個${itemB}，${itemA}每個 ${priceA} 元，${itemB}每個 ${priceB} 元，共花了 ${totalCost} 元。已知 $x+y=${totalCount}$，求 $x$ 和 $y$。`
      );
      summaryAnswers.push(`$x=${countA},\\ y=${countB}$`);
      answers.push(
        `由 $x+y=${totalCount}$ 可得 $y=${totalCount}-x$。代入總價方程 $${priceA}x+${priceB}y=${totalCost}$，得 $${priceA}x+${priceB}(${totalCount}-x)=${totalCost}$，解得 $x=${countA}$，所以 $y=${countB}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ133TransferEqualizationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        const bValue = randInt(40, 90);
        const diff = randInt(20, 60);
        const transfer = diff / 2;
        if (!Number.isInteger(transfer)) {
          i -= 1;
          continue;
        }
        const aValue = bValue + diff;
        questions.push(`甲有 $x$ 元，乙有 ${bValue} 元。若甲給乙 ${transfer} 元後，兩人的錢數相等，求甲原有多少元。`);
        summaryAnswers.push(`$${aValue}$`);
        answers.push(
          `甲給乙 ${transfer} 元後，甲剩 $x-${transfer}$，乙變成 ${bValue}+${transfer}$。由兩人相等可列 $x-${transfer}=${bValue}+${transfer}$，解得 $x=${aValue}$。`
        );
        continue;
      }

      const bValue = randInt(30, 80);
      const ratio = pickFromList([2, 3]);
      const transfer = randInt(10, 30);
      const aValue = ratio * (bValue + transfer) + transfer;
      questions.push(
        `甲有 $x$ 元，乙原有 ${bValue} 元。若甲給乙 ${transfer} 元後，甲的錢是乙的 ${ratio} 倍，求甲原有多少元。`
      );
      summaryAnswers.push(`$${aValue}$`);
      answers.push(
        `甲給乙 ${transfer} 元後，甲剩 $x-${transfer}$，乙變成 ${bValue}+${transfer}$。依題意可列 $x-${transfer}=${ratio}(${bValue}+${transfer})$，解得 $x=${aValue}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ133RelativeSpeedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const multipliers = [
      [3, 2],
      [2, 1],
      [5, 2],
    ];

    for (let i = 0; i < count; i += 1) {
      const [num, den] = multipliers[i % multipliers.length];
      const slowSpeed = randInt(3, 12);
      const fastSpeed = (num * slowSpeed) / den;
      if (!Number.isInteger(fastSpeed)) {
        i -= 1;
        continue;
      }
      const hours = randInt(2, 5);
      const distance = (fastSpeed + slowSpeed) * hours;
      questions.push(
        `已知甲的速度是乙的 ${num / den} 倍，兩人同時同地反向而行，${hours} 小時後相距 ${distance} 公里，求乙的速度。`
      );
      summaryAnswers.push(`$${slowSpeed}$ 公里/小時`);
      answers.push(
        `設乙的速度為 $x$ 公里/小時，則甲的速度為 ${num / den}x。反向而行 ${hours} 小時後相距 ${distance} 公里，所以可列 $(${num / den}x+x)\\times ${hours}=${distance}$，解得 $x=${slowSpeed}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildPurchaseDiscountApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const templates = [
          { cost: 300, profitRate: 20, discount: 8 },
          { cost: 450, profitRate: 25, discount: 8 },
          { cost: 600, profitRate: 50, discount: 9 },
          { cost: 750, profitRate: 20, discount: 8 },
          { cost: 900, profitRate: 25, discount: 8 },
          { cost: 1200, profitRate: 50, discount: 9 },
          { cost: 840, profitRate: 40, discount: 10 },
          { cost: 560, profitRate: 25, discount: 9 },
        ];
        const validTemplates = templates.filter((item) => {
          const soldValue = (item.cost * (100 + item.profitRate)) / 100;
          const listValue = (soldValue * 10) / item.discount;
          return Number.isInteger(listValue);
        });
        if (!validTemplates.length) {
          questions.push('某商品的成本與折扣資料有誤，暫無可用題目。');
          answers.push('本題資料需調整為可整數計算。');
          continue;
        }
        const pick = validTemplates[cycle % validTemplates.length];
        const cost = pick.cost;
        const profitRate = pick.profitRate;
        const discount = pick.discount;
        const sold = (cost * (100 + profitRate)) / 100;
        const list = (sold * 10) / discount;
        questions.push(
          `某商品定價 ${list} 元，若以定價的 ${discount} 折出售，可獲利 ${profitRate}% ，求此商品的成本。`
        );
        summaryAnswers.push(`成本 $${cost}$ 元`);
        answers.push(
          `設成本為 $x$ 元，則售價為 $${discount / 10}\\times ${list}$。依題意列式：$${discount / 10}\\times ${list}=\\left(1+${profitRate / 100}\\right)x$。解得 $x=${cost}$。`
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { cost: 400, markup: 30, discount: 9 },
          { cost: 500, markup: 50, discount: 8 },
          { cost: 800, markup: 30, discount: 9 },
          { cost: 1000, markup: 50, discount: 9 },
          { cost: 1200, markup: 30, discount: 9 },
          { cost: 900, markup: 40, discount: 10 },
          { cost: 700, markup: 50, discount: 8 },
        ];
        const validTemplates = templates.filter((item) => {
          const soldValue = (((item.cost * (100 + item.markup)) / 100) * item.discount) / 10;
          const profitValue = soldValue - item.cost;
          return Number.isInteger(profitValue) && profitValue > 0;
        });
        if (!validTemplates.length) {
          questions.push('某商品的加價與折扣資料有誤，暫無可用題目。');
          answers.push('本題資料需調整為可整數計算且有正利潤。');
          continue;
        }
        const pick = validTemplates[cycle % validTemplates.length];
        const cost = pick.cost;
        const markup = pick.markup;
        const discount = pick.discount;
        const sold = (((cost * (100 + markup)) / 100) * discount) / 10;
        const profit = sold - cost;
        questions.push(
          `某商品先按成本提高 ${markup}% 做為定價，再以定價的 ${discount} 折出售，結果獲利 ${profit} 元，求成本。`
        );
        summaryAnswers.push(`成本 $${cost}$ 元`);
        answers.push(
          `設成本為 $x$ 元，則定價為 $\\left(1+${markup / 100}\\right)x$，售價為 $${discount / 10}\\left(1+${markup / 100}\\right)x$。依題意：$${discount / 10}\\left(1+${markup / 100}\\right)x-x=${profit}$，解得 $x=${cost}$。`
        );
        continue;
      }

      const templates = [
        { student: 180, diff: 120, stuCount: 2, fullCount: 3 },
        { student: 240, diff: 150, stuCount: 3, fullCount: 2 },
        { student: 300, diff: 180, stuCount: 4, fullCount: 2 },
        { student: 360, diff: 120, stuCount: 2, fullCount: 4 },
        { student: 210, diff: 90, stuCount: 5, fullCount: 2 },
        { student: 280, diff: 140, stuCount: 3, fullCount: 3 },
        { student: 320, diff: 160, stuCount: 4, fullCount: 3 },
      ];
      const pick = templates[cycle % templates.length];
      const student = pick.student;
      const diff = pick.diff;
      const full = student + diff;
      const stuCount = pick.stuCount;
      const fullCount = pick.fullCount;
      const total = student * stuCount + full * fullCount;
      questions.push(
        `買 ${stuCount} 張學生票與 ${fullCount} 張全票共付 ${total} 元，已知全票每張比學生票貴 ${diff} 元，求學生票與全票各是多少元。`
      );
      summaryAnswers.push(`學生票 $${student}$ 元，全票 $${full}$ 元`);
      answers.push(
        `設學生票每張 $x$ 元，則全票每張為 $x+${diff}$ 元。依題意：$${stuCount}x+${fullCount}(x+${diff})=${total}$。解得 $x=${student}$，所以全票是 ${full} 元。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildAllocationApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const dormTemplates = [
      { rooms: 12, peoplePerRoom1: 5, unplaced: 10, peoplePerRoom2: 8, emptyRooms: 1, students: 65 },
      { rooms: 9, peoplePerRoom1: 4, unplaced: 12, peoplePerRoom2: 6, emptyRooms: 1, students: 48 },
      { rooms: 15, peoplePerRoom1: 6, unplaced: 8, peoplePerRoom2: 9, emptyRooms: 1, students: 92 },
      { rooms: 14, peoplePerRoom1: 5, unplaced: 9, peoplePerRoom2: 7, emptyRooms: 1, students: 74 },
      { rooms: 11, peoplePerRoom1: 4, unplaced: 7, peoplePerRoom2: 6, emptyRooms: 1, students: 60 },
      { rooms: 16, peoplePerRoom1: 6, unplaced: 10, peoplePerRoom2: 10, emptyRooms: 1, students: 150 },
    ];
    const classTemplates = [
      { classes: 7, studentsPerClass1: 24, extra: 10, studentsPerClass2: 27, short: 11, total: 178 },
      { classes: 10, studentsPerClass1: 25, extra: 13, studentsPerClass2: 27, short: 7, total: 263 },
      { classes: 8, studentsPerClass1: 26, extra: 9, studentsPerClass2: 29, short: 15, total: 217 },
      { classes: 9, studentsPerClass1: 28, extra: 8, studentsPerClass2: 31, short: 19, total: 260 },
      { classes: 11, studentsPerClass1: 23, extra: 12, studentsPerClass2: 26, short: 21, total: 265 },
      { classes: 12, studentsPerClass1: 24, extra: 14, studentsPerClass2: 28, short: 34, total: 302 },
    ];
    const candyTemplates = [
      { kids: 10, give1: 8, remain: 7, give2: 10, short: 13, total: 87 },
      { kids: 9, give1: 6, remain: 12, give2: 8, short: 6, total: 66 },
      { kids: 12, give1: 7, remain: 9, give2: 9, short: 15, total: 93 },
      { kids: 14, give1: 5, remain: 8, give2: 6, short: 6, total: 78 },
      { kids: 11, give1: 9, remain: 5, give2: 11, short: 17, total: 104 },
      { kids: 13, give1: 6, remain: 11, give2: 8, short: 15, total: 89 },
    ];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const t = dormTemplates[cycle % dormTemplates.length];
        questions.push(
          `學生分配宿舍：若每房住 ${t.peoplePerRoom1} 人，則還有 ${t.unplaced} 人沒得住；若每房住 ${t.peoplePerRoom2} 人，則會空出 1 間房，求宿舍間數與學生總數。`
        );
        summaryAnswers.push(`$${t.rooms}$ 間宿舍，$${t.students}$ 位學生`);
        answers.push(
          `設宿舍有 $x$ 間，學生有 $y$ 人。依題意可列聯立方程式 $${formatSystemLatex(`y=${t.peoplePerRoom1}x+${t.unplaced}`, `y=${t.peoplePerRoom2}(x-1)`)}$。解得 $x=${t.rooms},\\ y=${t.students}$，所以有 ${t.rooms} 間宿舍、${t.students} 位學生。`
        );
        continue;
      }

      if (variant === 1) {
        const t = classTemplates[cycle % classTemplates.length];
        questions.push(
          `分班問題：班級數固定。若每班 ${t.studentsPerClass1} 人，則多出 ${t.extra} 人；若每班 ${t.studentsPerClass2} 人，則不足 ${t.short} 人，求班級數與總人數。`
        );
        summaryAnswers.push(`$${t.classes}$ 班，$${t.total}$ 人`);
        answers.push(
          `設班級數為 $x$ 班，總人數為 $y$ 人。依題意可列聯立方程式 $${formatSystemLatex(`y=${t.studentsPerClass1}x+${t.extra}`, `y=${t.studentsPerClass2}x-${t.short}`)}$。解得 $x=${t.classes},\\ y=${t.total}$，所以有 ${t.classes} 班、${t.total} 人。`
        );
        continue;
      }

      const t = candyTemplates[cycle % candyTemplates.length];
      questions.push(
        `分配問題：把一袋糖果分給小朋友，若每人分 ${t.give1} 顆則剩下 ${t.remain} 顆；若每人分 ${t.give2} 顆則不足 ${t.short} 顆，求小朋友有幾人、糖果共有幾顆。`
      );
      summaryAnswers.push(`$${t.kids}$ 位小朋友，$${t.total}$ 顆糖果`);
      answers.push(
        `設小朋友有 $x$ 人，糖果共有 $y$ 顆。依題意可列聯立方程式 $${formatSystemLatex(`y=${t.give1}x+${t.remain}`, `y=${t.give2}x-${t.short}`)}$。解得 $x=${t.kids},\\ y=${t.total}$，所以有 ${t.kids} 位小朋友、${t.total} 顆糖果。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildAgeApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const ratioAfterTemplates = [
      { child: 9, father: 36, afterYears: 3 },
      { child: 11, father: 44, afterYears: 4 },
      { child: 13, father: 52, afterYears: 5 },
      { child: 8, father: 32, afterYears: 6 },
      { child: 10, father: 40, afterYears: 2 },
      { child: 12, father: 48, afterYears: 4 },
    ];
    const sumRatioTemplates = [
      { child: 12, father: 36, total: 48 },
      { child: 14, father: 42, total: 56 },
      { child: 15, father: 45, total: 60 },
      { child: 16, father: 48, total: 64 },
      { child: 18, father: 54, total: 72 },
      { child: 20, father: 60, total: 80 },
    ];
    const phraseTemplates = [
      { student: 25, teacher: 45 },
      { student: 24, teacher: 42 },
      { student: 28, teacher: 50 },
      { student: 18, teacher: 30 },
      { student: 22, teacher: 38 },
      { student: 30, teacher: 54 },
    ];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);
      if (variant === 0) {
        const t = ratioAfterTemplates[cycle % ratioAfterTemplates.length];
        questions.push(
          `年齡追蹤問題：父親現在年齡是兒子的 4 倍，${t.afterYears} 年後兩人的年齡和為 ${t.child + t.father + 2 * t.afterYears} 歲，求父子現在各幾歲。`
        );
        summaryAnswers.push(`兒子 $${t.child}$ 歲，父親 $${t.father}$ 歲`);
        answers.push(
          `設兒子現在 $x$ 歲，父親現在 $y$ 歲。依題意可列聯立方程式 $${formatSystemLatex(`y=4x`, `(x+${t.afterYears})+(y+${t.afterYears})=${t.child + t.father + 2 * t.afterYears}`)}$。解得 $x=${t.child},\\ y=${t.father}$，所以兒子 ${t.child} 歲、父親 ${t.father} 歲。`
        );
      } else if (variant === 1) {
        const t = sumRatioTemplates[cycle % sumRatioTemplates.length];
        questions.push(`年齡推算問題：已知父子年齡和為 ${t.total} 歲，且父親年齡為兒子的 3 倍，求兩人各幾歲。`);
        summaryAnswers.push(`兒子 $${t.child}$ 歲，父親 $${t.father}$ 歲`);
        answers.push(
          `設兒子現在 $x$ 歲，父親現在 $y$ 歲。依題意可列聯立方程式 $${formatSystemLatex(`x+y=${t.total}`, `y=3x`)}$。解得 $x=${t.child},\\ y=${t.father}$，所以兒子 ${t.child} 歲、父親 ${t.father} 歲。`
        );
      } else {
        const t = phraseTemplates[cycle % phraseTemplates.length];
        const phrasePast = 2 * t.student - t.teacher;
        const phraseFuture = 2 * t.teacher - t.student;
        questions.push(
          `年齡追蹤問題：老師對學生說：「我在你這個年紀時，你只有 ${phrasePast} 歲；等你到我現在這個年紀時，我就 ${phraseFuture} 歲了。」求老師與學生現在各幾歲。`
        );
        summaryAnswers.push(`學生 $${t.student}$ 歲，老師 $${t.teacher}$ 歲`);
        answers.push(
          `設學生現在 $x$ 歲，老師現在 $y$ 歲。由「我在你這個年紀時，你只有 ${phrasePast} 歲」得 $x-(y-x)=${phrasePast}$，即 $2x-y=${phrasePast}$。由「你到我現在年紀時，我就 ${phraseFuture} 歲」得 $y+(y-x)=${phraseFuture}$，即 $2y-x=${phraseFuture}$。聯立解得 $x=${t.student},\\ y=${t.teacher}$，所以學生 ${t.student} 歲、老師 ${t.teacher} 歲。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildSpeedApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const mountainTemplates = [
      { upSpeed: 2, downSpeed: 5, totalHours: 28, distance: 40 },
      { upSpeed: 2, downSpeed: 4, totalHours: 12, distance: 16 },
      { upSpeed: 3, downSpeed: 6, totalHours: 15, distance: 30 },
      { upSpeed: 4, downSpeed: 8, totalHours: 18, distance: 48 },
      { upSpeed: 5, downSpeed: 10, totalHours: 21, distance: 70 },
      { upSpeed: 3, downSpeed: 5, totalHours: 16, distance: 30 },
    ];
    const cityVillageTemplates = [
      { totalDistance: 410, totalHours: 7, countrySpeed: 80, citySpeed: 30, countryDistance: 320 },
      { totalDistance: 400, totalHours: 6, countrySpeed: 80, citySpeed: 40, countryDistance: 320 },
      { totalDistance: 420, totalHours: 7, countrySpeed: 90, citySpeed: 30, countryDistance: 360 },
      { totalDistance: 450, totalHours: 8, countrySpeed: 75, citySpeed: 30, countryDistance: 300 },
      { totalDistance: 390, totalHours: 6, countrySpeed: 70, citySpeed: 35, countryDistance: 280 },
      { totalDistance: 360, totalHours: 6, countrySpeed: 60, citySpeed: 30, countryDistance: 240 },
    ];
    const numberLineTemplates = [
      { aStart: -25, bStart: 5, aStep: 1, bStep: 4, jumps: 4 },
      { aStart: -17, bStart: 5, aStep: 1, bStep: 3, jumps: 3 },
      { aStart: -21, bStart: 3, aStep: 2, bStep: 5, jumps: 3 },
      { aStart: -31, bStart: 7, aStep: 2, bStep: 6, jumps: 3 },
      { aStart: -29, bStart: 5, aStep: 3, bStep: 8, jumps: 2 },
      { aStart: -19, bStart: 1, aStep: 2, bStep: 7, jumps: 2 },
    ];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const t = mountainTemplates[cycle % mountainTemplates.length];
        questions.push(
          `某人沿相同路線上山與下山，上山時速 ${t.upSpeed} 公里，下山時速 ${t.downSpeed} 公里，共花 ${t.totalHours} 小時，求單程山路長度。`
        );
        summaryAnswers.push(`$${t.distance}$ 公里`);
        answers.push(
          `設單程山路長 $x$ 公里，則上山時間為 $\\frac{x}{${t.upSpeed}}$ 小時，下山時間為 $\\frac{x}{${t.downSpeed}}$ 小時。依題意：$\\frac{x}{${t.upSpeed}}+\\frac{x}{${t.downSpeed}}=${t.totalHours}$，解得 $x=${t.distance}$。`
        );
        continue;
      }

      if (variant === 1) {
        const t = cityVillageTemplates[cycle % cityVillageTemplates.length];
        questions.push(
          `某人騎車全程 ${t.totalDistance} 公里共花 ${t.totalHours} 小時，在鄉村時速 ${t.countrySpeed} 公里，在市區時速 ${t.citySpeed} 公里，求行經鄉村多少公里。`
        );
        summaryAnswers.push(`$${t.countryDistance}$ 公里`);
        answers.push(
          `設行經鄉村 $x$ 公里，則市區是 ${t.totalDistance}-x 公里。依題意：$\\frac{x}{${t.countrySpeed}}+\\frac{${t.totalDistance}-x}{${t.citySpeed}}=${t.totalHours}$，解得 $x=${t.countryDistance}$。`
        );
        continue;
      }

      const t = numberLineTemplates[cycle % numberLineTemplates.length];
      questions.push(
        `兩點在數線上，A 在 ${t.aStart}，B 在 ${t.bStart}。若 A 每次向右跳 ${t.aStep} 單位，B 每次向右跳 ${t.bStep} 單位，跳了幾次後兩者座標互為相反數？`
      );
      summaryAnswers.push(`$${t.jumps}$ 次`);
      answers.push(
        `設跳了 $x$ 次，則 A 在 ${t.aStart}+${t.aStep}x，B 在 ${t.bStart}+${t.bStep}x。互為相反數表示：$${t.aStart}+${t.aStep}x=-(${t.bStart}+${t.bStep}x)$，解得 $x=${t.jumps}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildHeadsCoinsApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const rabbits = randInt(4, 12);
        const chickens = randInt(6, 18);
        const heads = rabbits + chickens;
        const legs = rabbits * 4 + chickens * 2;
        questions.push(`雞兔同籠：頭共 ${heads} 個，腳共 ${legs} 隻，求雞和兔各有多少隻。`);
        summaryAnswers.push(`雞 $${chickens}$ 隻，兔 $${rabbits}$ 隻`);
        answers.push(
          `設兔有 $x$ 隻，則雞有 $${heads}-x$ 隻。依題意：$4x+2(${heads}-x)=${legs}$，解得 $x=${rabbits}$。所以兔 ${rabbits} 隻，雞 ${chickens} 隻。`
        );
        continue;
      }

      if (variant === 1) {
        const five = randInt(8, 20);
        const ten = randInt(8, 20);
        const totalCount = five + ten;
        const totalValue = five * 5 + ten * 10;
        questions.push(`硬幣問題：5 元和 10 元硬幣共 ${totalCount} 枚，總值 ${totalValue} 元，求兩種硬幣各有多少枚。`);
        summaryAnswers.push(`5 元 $${five}$ 枚，10 元 $${ten}$ 枚`);
        answers.push(
          `設 10 元硬幣有 $x$ 枚，則 5 元硬幣有 $${totalCount}-x$ 枚。依題意：$10x+5(${totalCount}-x)=${totalValue}$，解得 $x=${ten}$。所以 10 元有 ${ten} 枚，5 元有 ${five} 枚。`
        );
        continue;
      }

      const fifty = randInt(4, 12);
      const ten = 3 * fifty;
      const diffValue = fifty * 50 - ten * 10;
      questions.push(
        `硬幣關係：10 元硬幣個數是 50 元硬幣的 3 倍，且 50 元總金額比 10 元總金額多 ${diffValue} 元，求兩種硬幣各有多少枚。`
      );
      summaryAnswers.push(`50 元 $${fifty}$ 枚，10 元 $${ten}$ 枚`);
      answers.push(
        `設 50 元硬幣有 $x$ 枚，則 10 元硬幣有 $3x$ 枚。依題意：$50x-10(3x)=${diffValue}$，解得 $x=${fifty}$。所以 50 元有 ${fifty} 枚，10 元有 ${ten} 枚。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ133WorkRateSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cooperateThenSoloTemplates = [
      { a: 20, b: 25, remainSoloDays: 2, togetherDays: 10, who: '甲', unit: '天', thing: '一項工程' },
      { a: 24, b: 30, remainSoloDays: 3, togetherDays: 12, who: '甲', unit: '天', thing: '一段圍牆' },
      { a: 18, b: 24, remainSoloDays: 2, togetherDays: 8, who: '乙', unit: '天', thing: '一份設計圖' },
      { a: 16, b: 20, remainSoloDays: 2, togetherDays: 6, who: '甲', unit: '天', thing: '一片農地' },
      { a: 15, b: 18, remainSoloDays: 3, togetherDays: 5, who: '乙', unit: '天', thing: '一份企畫書' },
      { a: 30, b: 20, remainSoloDays: 1, togetherDays: 6, who: '甲', unit: '天', thing: '一批零件' },
    ];
    const typingThenSoloTemplates = [
      { a: 50, b: 40, togetherHours: 24, soloLeftHours: 14, who: '阿南', unit: '小時', thing: '一份文件' },
      { a: 60, b: 45, togetherHours: 18, soloLeftHours: 12, who: '阿宏', unit: '小時', thing: '一份報表' },
      { a: 48, b: 36, togetherHours: 16, soloLeftHours: 10, who: '小芸', unit: '小時', thing: '一份稿件' },
      { a: 40, b: 30, togetherHours: 15, soloLeftHours: 10, who: '小凱', unit: '小時', thing: '一份企劃案' },
      { a: 36, b: 24, togetherHours: 12, soloLeftHours: 8, who: '小安', unit: '小時', thing: '一份測驗卷' },
      { a: 54, b: 27, togetherHours: 16, soloLeftHours: 12, who: '小潔', unit: '小時', thing: '一份海報' },
    ];
    const fillPoolTemplates = [
      { a: 10, b: 15, togetherHours: 6, thing: '一座空池' },
      { a: 12, b: 12, togetherHours: 6, thing: '一座空池' },
      { a: 15, b: 30, togetherHours: 10, thing: '一座空池', isFill: true },
      { a: 18, b: 9, togetherHours: 6, thing: '一個水塔' },
      { a: 20, b: 30, togetherHours: 12, thing: '一座蓄水池' },
      { a: 24, b: 12, togetherHours: 8, thing: '一個消防水箱' },
    ];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);

      if (variant === 0) {
        const t = cooperateThenSoloTemplates[cycle % cooperateThenSoloTemplates.length];
        questions.push(
          `${t.thing}，甲單獨做 ${t.a}${t.unit} 可完成，乙單獨做 ${t.b}${t.unit} 可完成，兩人合作若干天後，剩下的由甲單獨做 ${t.remainSoloDays}${t.unit} 完工，求兩人合作了幾天？`
        );
        summaryAnswers.push(`$${t.togetherDays}$${t.unit}`);
        answers.push(
          `設兩人合作了 $x$ ${t.unit}。依題意可列式：$\\left(\\frac{1}{${t.a}}+\\frac{1}{${t.b}}\\right)x+\\frac{${t.remainSoloDays}}{${t.a}}=1$。解得 $x=${t.togetherDays}$，所以兩人合作了 ${t.togetherDays}${t.unit}。`
        );
        continue;
      }

      if (variant === 1) {
        const t = typingThenSoloTemplates[cycle % typingThenSoloTemplates.length];
        questions.push(
          `${t.thing}，阿南單獨打字要 ${t.a}${t.unit} 完成，小蘭單獨打字要 ${t.b}${t.unit} 完成，兩人合作打了 ${t.togetherHours}${t.unit} 後小蘭離開，阿南還要幾${t.unit}才做得完？`
        );
        summaryAnswers.push(`$${t.soloLeftHours}$${t.unit}`);
        answers.push(
          `設阿南還要 $x$ ${t.unit}。依題意可列式：$\\left(\\frac{1}{${t.a}}+\\frac{1}{${t.b}}\\right)\\times ${t.togetherHours}+\\frac{x}{${t.a}}=1$。解得 $x=${t.soloLeftHours}$，所以阿南還要 ${t.soloLeftHours}${t.unit}。`
        );
        continue;
      }

      const t = fillPoolTemplates[cycle % fillPoolTemplates.length];
      questions.push(
        `A 管單獨注水 ${t.a} 小時可把空池注滿，B 管單獨注水 ${t.b} 小時可把空池注滿，兩管同時開放幾小時可將空池注滿？`
      );
      summaryAnswers.push(`$${t.togetherHours}$ 小時`);
      answers.push(
        `設同時開放 $x$ 小時可注滿。依題意可列式：$\\left(\\frac{1}{${t.a}}+\\frac{1}{${t.b}}\\right)x=1$。解得 $x=${t.togetherHours}$，所以需 ${t.togetherHours} 小時。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ133FractionRemainderSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cashTemplates = [
      {
        spent: 15,
        fracNum: 1,
        fracDen: 4,
        finalRemain: 60,
        original: 100,
        thing: '零用錢',
        action1: '去超商買汽水花 15 元',
        action2: '再用原有錢的 1/4 買餅乾',
      },
      {
        spent: 24,
        fracNum: 1,
        fracDen: 5,
        finalRemain: 72,
        original: 120,
        thing: '零用錢',
        action1: '先買文具花 24 元',
        action2: '再用原有錢的 1/5 買點心',
      },
      {
        spent: 18,
        fracNum: 1,
        fracDen: 3,
        finalRemain: 54,
        original: 108,
        thing: '零用錢',
        action1: '先買早餐花 18 元',
        action2: '再用原有錢的 1/3 買書套',
      },
      {
        spent: 30,
        fracNum: 1,
        fracDen: 6,
        finalRemain: 90,
        original: 144,
        thing: '零用錢',
        action1: '先買球鞋花 30 元',
        action2: '再用原有錢的 1/6 買飲料',
      },
    ];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);
      if (variant === 0) {
        const t = cashTemplates[cycle % cashTemplates.length];
        questions.push(`丁丁去超商，${t.action1}，${t.action2}，最後剩 ${t.finalRemain} 元，求原有${t.thing}多少元。`);
        summaryAnswers.push(`$${t.original}$ 元`);
        answers.push(
          `設原有${t.thing}為 $x$ 元。依題意可列式：$x-${t.spent}-\\frac{${t.fracNum}}{${t.fracDen}}x=${t.finalRemain}$。解得 $x=${t.original}$，所以原有${t.thing} ${t.original} 元。`
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { original: 240, remain: 120, a: 4, b: 5, c: 6 },
          { original: 300, remain: 150, a: 4, b: 5, c: 6 },
          { original: 360, remain: 180, a: 4, b: 5, c: 6 },
          { original: 280, remain: 140, a: 4, b: 5, c: 6 },
        ];
        const pick = templates[cycle % templates.length];
        const original = pick.original;
        const remain = pick.remain;
        questions.push(
          `大博讀一本小說，第一天看全部的 $\\frac{1}{4}$，第二天看剩下的 $\\frac{1}{5}$，第三天看剩下的 $\\frac{1}{6}$，最後剩 ${remain} 頁，求小說原有幾頁？`
        );
        summaryAnswers.push(`$${original}$ 頁`);
        answers.push(
          `設小說原有 $x$ 頁。依題意可列式：$x\\left(1-\\frac{1}{4}\\right)\\left(1-\\frac{1}{5}\\right)\\left(1-\\frac{1}{6}\\right)=${remain}$。解得 $x=${original}$，所以小說原有 ${original} 頁。`
        );
        continue;
      }

      const templates = [
        { original: 140, remain: 28, a: 3, b: 10, bNum: 7 },
        { original: 175, remain: 35, a: 3, b: 10, bNum: 7 },
        { original: 210, remain: 42, a: 3, b: 10, bNum: 7 },
        { original: 245, remain: 49, a: 3, b: 10, bNum: 7 },
      ];
      const pick = templates[cycle % templates.length];
      const original = pick.original;
      const remain = pick.remain;
      questions.push(
        `一桶水先倒掉 $\\frac{1}{3}$，再倒掉剩下的 $\\frac{7}{10}$，最後剩下 ${remain} 公升，求此桶水原有多少公升？`
      );
      summaryAnswers.push(`$${original}$ 公升`);
      answers.push(
        `設原有水量為 $x$ 公升。依題意可列式：$x\\left(1-\\frac{1}{3}\\right)\\left(1-\\frac{7}{10}\\right)=${remain}$。解得 $x=${original}$，所以原有 ${original} 公升。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ133ScorePenaltySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const partialAnswerTemplates = [
      { total: 20, answered: 18, plus: 5, minus: 2, correct: 15, name: '小鈴' },
      { total: 24, answered: 22, plus: 4, minus: 1, correct: 19, name: '小安' },
      { total: 30, answered: 27, plus: 3, minus: 1, correct: 21, name: '小傑' },
      { total: 25, answered: 23, plus: 4, minus: 2, correct: 17, name: '小萱' },
      { total: 18, answered: 16, plus: 5, minus: 2, correct: 13, name: '小晴' },
      { total: 28, answered: 25, plus: 3, minus: 1, correct: 20, name: '小凱' },
    ];
    const askWrongTemplates = [
      { total: 25, plus: 4, minus: 1, wrong: 7, name: '小立' },
      { total: 20, plus: 5, minus: 1, wrong: 4, name: '小華' },
      { total: 30, plus: 3, minus: 1, wrong: 7, name: '小凱' },
      { total: 24, plus: 4, minus: 2, wrong: 5, name: '小恩' },
      { total: 18, plus: 5, minus: 2, wrong: 3, name: '小芸' },
      { total: 26, plus: 3, minus: 1, wrong: 6, name: '小豪' },
    ];
    const askCorrectTemplates = [
      { total: 20, plus: 5, minus: 1, correct: 16, name: '小華' },
      { total: 18, plus: 5, minus: 2, correct: 12, name: '小芸' },
      { total: 24, plus: 4, minus: 1, correct: 19, name: '小安' },
      { total: 25, plus: 4, minus: 2, correct: 18, name: '小軒' },
      { total: 30, plus: 3, minus: 1, correct: 22, name: '小彤' },
      { total: 28, plus: 5, minus: 2, correct: 20, name: '小禹' },
    ];

    for (let i = 0; i < count; i += 1) {
      if (i % 3 === 0) {
        const t = partialAnswerTemplates[Math.floor(i / 3) % partialAnswerTemplates.length];
        const wrong = t.answered - t.correct;
        const score = t.plus * t.correct - t.minus * wrong;
        questions.push(
          `數學競賽共 ${t.total} 題，答對 1 題得 ${t.plus} 分，答錯 1 題倒扣 ${t.minus} 分，不作答不計分。${t.name} 作答 ${t.answered} 題後得 ${score} 分，求他答對幾題。`
        );
        summaryAnswers.push(`答對 $${t.correct}$ 題`);
        answers.push(
          `設答對 $x$ 題，則答錯 ${t.answered}-x 題。依題意可列式：$${t.plus}x-${t.minus}(${t.answered}-x)=${score}$。解得 $x=${t.correct}$，所以他答對 ${t.correct} 題。`
        );
      } else if (i % 3 === 1) {
        const t = askWrongTemplates[Math.floor(i / 3) % askWrongTemplates.length];
        const correct = t.total - t.wrong;
        const score = t.plus * correct - t.minus * t.wrong;
        questions.push(
          `入學測驗共 ${t.total} 題，答對得 ${t.plus} 分，答錯扣 ${t.minus} 分。${t.name} 全部作答後得 ${score} 分，求他答錯幾題。`
        );
        summaryAnswers.push(`答錯 $${t.wrong}$ 題`);
        answers.push(
          `設答錯 $x$ 題，則答對 ${t.total}-x 題。依題意可列式：$${t.plus}(${t.total}-x)-${t.minus}x=${score}$。解得 $x=${t.wrong}$，所以他答錯 ${t.wrong} 題。`
        );
      } else {
        const t = askCorrectTemplates[Math.floor(i / 3) % askCorrectTemplates.length];
        const wrong = t.total - t.correct;
        const score = t.plus * t.correct - t.minus * wrong;
        questions.push(
          `${t.name} 參加段考共 ${t.total} 題，答對得 ${t.plus} 分，答錯扣 ${t.minus} 分，全部作答後共得 ${score} 分，求他答對幾題？`
        );
        summaryAnswers.push(`答對 $${t.correct}$ 題`);
        answers.push(
          `設答對 $x$ 題，則答錯 ${t.total}-x 題。依題意可列式：$${t.plus}x-${t.minus}(${t.total}-x)=${score}$。解得 $x=${t.correct}$，所以他答對 ${t.correct} 題。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ133MixtureSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const saltTemplates = [
      { lowP: 5, lowW: 200, highP: 8, x: 300, target: 6.8 },
      { lowP: 10, lowW: 240, highP: 25, x: 160, target: 16 },
      { lowP: 6, lowW: 180, highP: 12, x: 220, target: 9.3 },
      { lowP: 8, lowW: 150, highP: 20, x: 250, target: 15.5 },
      { lowP: 4, lowW: 300, highP: 10, x: 180, target: 6.25 },
      { lowP: 12, lowW: 200, highP: 18, x: 300, target: 15.6 },
    ];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;
      const cycle = Math.floor(i / 3);
      if (variant === 0) {
        const t = saltTemplates[cycle % saltTemplates.length];
        const lowDecimal = (t.lowP / 100).toString();
        const highDecimal = (t.highP / 100).toString();
        const targetDecimal = (t.target / 100).toString();
        questions.push(
          `有兩種食鹽水，${t.lowP}% 的有 ${t.lowW} 克，${t.highP}% 的有 $x$ 克，混合後的濃度為 ${t.target}% ，求 $x$。`
        );
        summaryAnswers.push(`$x=${t.x}$`);
        answers.push(
          `依題意可列式：$${lowDecimal}\\times ${t.lowW}+${highDecimal}x=${targetDecimal}\\times (${t.lowW}+x)$。解得 $x=${t.x}$。`
        );
        continue;
      }

      if (variant === 1) {
        const total = 14;
        const aAmount = 8;
        const alcoholTotal = 11;
        questions.push(
          `甲、乙兩種酒精水混合，甲液酒精比水為 3:1，乙液酒精比水為 5:1。若要配成總共 ${total} 公升，且其中酒精恰有 ${alcoholTotal} 公升的混合液，求甲液需要幾公升？`
        );
        summaryAnswers.push(`甲液 $${aAmount}$ 公升`);
        answers.push(
          `設甲液取 $x$ 公升，則乙液取 ${total}-x 公升。依題意可列式：$\\frac{3}{4}x+\\frac{5}{6}(${total}-x)=${alcoholTotal}$。解得 $x=${aAmount}$，所以甲液需要 ${aAmount} 公升。`
        );
        continue;
      }

      const totalWeight = 148;
      const silver = 70;
      const totalLoss = 12;
      questions.push(
        `148 公斤的銅銀合金放入水中，銀會減輕原重量的 $\\frac{1}{21}$，銅會減輕原重量的 $\\frac{1}{9}$。若總共減輕 ${totalLoss} 公斤，求原來銀有多少公斤。`
      );
      summaryAnswers.push(`銀有 $${silver}$ 公斤`);
      answers.push(
        `設原來銀有 $x$ 公斤，則銅有 ${totalWeight}-x 公斤。依題意可列式：$\\frac{x}{21}+\\frac{${totalWeight}-x}{9}=${totalLoss}$。解得 $x=${silver}$，所以原來銀有 ${silver} 公斤。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ133TieredFeeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;
      const cycle = Math.floor(i / 4);

      if (variant === 0) {
        const templates = [
          { base: 50, fee: 3, freeMinutes: 47, m1: 100, c1: 209, m2: 130, c2: 299 },
          { base: 40, fee: 2, freeMinutes: 35, m1: 90, c1: 150, m2: 130, c2: 230 },
          { base: 60, fee: 4, freeMinutes: 52, m1: 110, c1: 292, m2: 150, c2: 452 },
          { base: 30, fee: 5, freeMinutes: 28, m1: 80, c1: 290, m2: 100, c2: 390 },
        ];
        const t = templates[cycle % templates.length];
        const base = t.base;
        const fee = t.fee;
        const freeMinutes = t.freeMinutes;
        questions.push(
          `某網咖的基本費用為 ${base} 元（可使用 $t$ 分鐘），超過 $t$ 分鐘後，超過的部分每分鐘收費 $s$ 元。已知小賢第一次上網 ${t.m1} 分鐘花了 ${t.c1} 元，第二次上網 ${t.m2} 分鐘花了 ${t.c2} 元，求 $t$ 與 $s$ 之值。`
        );
        summaryAnswers.push(`$t=${freeMinutes}$，$s=${fee}$`);
        answers.push(
          `依題意可列聯立方程式 $${formatSystemLatex(`${base}+s(${t.m1}-t)=${t.c1}`, `${base}+s(${t.m2}-t)=${t.c2}`)}$。相減得 $${t.m2 - t.m1}s=${t.c2 - t.c1}$，所以 $s=${fee}$。代回得 $${base}+${fee}(${t.m1}-t)=${t.c1}$，解得 $t=${freeMinutes}$。`
        );
        continue;
      }

      if (variant === 1) {
        const templates = [
          { base: 28, rate: 0.02, sec1: 500, fee1: 32, sec2: 1200, fee2: 46, threshold: 300 },
          { base: 20, rate: 0.03, sec1: 400, fee1: 23, sec2: 1000, fee2: 41, threshold: 300 },
          { base: 25, rate: 0.01, sec1: 600, fee1: 28, sec2: 1600, fee2: 38, threshold: 300 },
          { base: 30, rate: 0.02, sec1: 700, fee1: 38, sec2: 1400, fee2: 52, threshold: 300 },
        ];
        const t = templates[cycle % templates.length];
        const base = t.base;
        const rate = t.rate;
        questions.push(
          `某電信公司的通話費計算方式為：通話時間未超過 ${t.threshold} 秒收基本費 $b$ 元；超過 ${t.threshold} 秒之後的費用與超過時間成線型關係。已知通話 ${t.sec1} 秒時花費 ${t.fee1} 元，通話 ${t.sec2} 秒時花費 ${t.fee2} 元，求基本費 $b$ 是多少元。`
        );
        summaryAnswers.push(`$b=${base}$`);
        answers.push(
          `設超過 ${t.threshold} 秒後每秒加收 $k$ 元，則依題意可列聯立方程式 $${formatSystemLatex(`b+k(${t.sec1}-${t.threshold})=${t.fee1}`, `b+k(${t.sec2}-${t.threshold})=${t.fee2}`)}$。相減得 ${t.sec2 - t.sec1}k=${t.fee2 - t.fee1}，所以 $k=${rate}$。代回得 $b+${t.sec1 - t.threshold}\\times ${rate}=${t.fee1}$，解得 $b=${base}$。`
        );
        continue;
      }

      if (variant === 2) {
        const templates = [
          { freeKg: 18, rate: 12, w1: 30, f1: 144, w2: 42, f2: 288 },
          { freeKg: 20, rate: 10, w1: 35, f1: 150, w2: 50, f2: 300 },
          { freeKg: 15, rate: 8, w1: 28, f1: 104, w2: 40, f2: 200 },
          { freeKg: 22, rate: 15, w1: 34, f1: 180, w2: 46, f2: 360 },
        ];
        const t = templates[cycle % templates.length];
        const freeKg = t.freeKg;
        const rate = t.rate;
        questions.push(
          `某航空公司規定旅客行李 $a$ 公斤以下免費，超過 $a$ 公斤的部分，超重重量與託運費成線型關係。已知行李重 ${t.w1} 公斤時需付 ${t.f1} 元，重 ${t.w2} 公斤時需付 ${t.f2} 元，求免費額度 $a$ 為多少公斤？`
        );
        summaryAnswers.push(`$a=${freeKg}$ 公斤`);
        answers.push(
          `設超重每公斤收 $k$ 元，則依題意可列聯立方程式 $${formatSystemLatex(`k(${t.w1}-a)=${t.f1}`, `k(${t.w2}-a)=${t.f2}`)}$。相減可得 $${t.w2 - t.w1}k=${t.f2 - t.f1}$，所以 $k=${rate}$。代回得 $${rate}(${t.w1}-a)=${t.f1}$，解得 $a=${freeKg}$。`
        );
        continue;
      }

      questions.push(
        `某網咖消費項目如下：飲料（基本消費）30 元，一小時內（基本消費）$x$ 元，一小時後每分鐘加 $y$ 元。若佳佳上網 2 小時花了 100 元，明力上網 3 小時 20 分鐘共花了 140 元，求 $x$ 與 $y$。`
      );
      summaryAnswers.push(`$x=40$，$y=\\frac{1}{2}$`);
      answers.push(
        `依題意可列聯立方程式 $${formatSystemLatex(`30+x+60y=100`, `30+x+140y=140`)}$。相減得 $80y=40$，所以 $y=\\frac{1}{2}$。代回得 $30+x+60\\times\\frac{1}{2}=100$，解得 $x=40$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ133ClockAngleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    function minuteLatex(frac) {
      return fractionToLatex(frac, true);
    }

    function minuteDisplay(frac) {
      return `$${minuteLatex(frac)}$`;
    }

    for (let i = 0; i < count; i += 1) {
      const variant = i % 3;

      if (variant === 0) {
        const hour = randInt(1, 5);
        const minute = randInt(6, 28);
        const angle = makeFraction(Math.abs(60 * hour - 11 * minute), 2);
        const overlapMinute = makeFraction(60 * hour, 11);
        const useBeforeOverlap = minute * overlapMinute.den <= overlapMinute.num;
        const branchEquation = useBeforeOverlap
          ? `$30\\times ${hour}-5.5x=${fractionToLatex(angle)}$`
          : `$5.5x-30\\times ${hour}=${fractionToLatex(angle)}$`;
        questions.push(`在 ${hour} 點 $x$ 分時，時針與分針夾角為 $${fractionToLatex(angle)}^\\circ$，求 $x$。`);
        summaryAnswers.push(`$x=${minute}$`);
        answers.push(
          `分針每分轉 $6^\\circ$，時針每分轉 $0.5^\\circ$。在 ${hour} 點 $x$ 分時，兩針夾角可列為：$|30\\times ${hour}-5.5x|=${fractionToLatex(angle)}$。因為本題對應的時刻在 ${hour} 點後 ${minute} 分，所以可化成 ${branchEquation}。解得 $x=${minute}$。`
        );
        continue;
      }

      if (variant === 1) {
        const hour = randInt(1, 5);
        const minute = makeFraction(60 * hour + 360, 11);
        questions.push(`${hour} 點到 ${hour + 1} 點之間，時針與分針何時會成一直線（夾角 $180^\\circ$）？`);
        summaryAnswers.push(`${hour} 點 $${minuteLatex(minute)}$ 分`);
        answers.push(
          `設經過 $x$ 分。分針每分比時針多轉 $6-0.5=5.5^\\circ$。在 ${hour} 點整時，兩針先差 $30\\times ${hour}= ${30 * hour}^\\circ$。要成一直線，需滿足 $|${30 * hour}-5.5x|=180$。在這一小時內可用 ${30 * hour}+180=5.5x，解得 $x=${minuteLatex(minute)}$ 分，所以答案是 ${hour} 點 ${minuteDisplay(minute)} 分。`
        );
        continue;
      }

      const firstMinute = randInt(5, 25);
      const angle = makeFraction(11 * firstMinute, 2);
      const secondMinute = makeFraction(720 - 11 * firstMinute, 11);
      const elapsed = subFraction(secondMinute, makeFraction(firstMinute, 1));
      questions.push(
        `12 點過後 ${firstMinute} 分時，分針與時針夾角為 $${fractionToLatex(angle)}^\\circ$。再經過多久，兩針會再次出現相同的夾角？`
      );
      summaryAnswers.push(`${minuteDisplay(elapsed)}`);
      answers.push(
        `12 點過後 ${firstMinute} 分時，夾角是 $5.5\\times ${firstMinute}=${fractionToLatex(angle)}^\\circ$。設從 12 點開始算，第二次出現同角度是在 $x$ 分時。此時另一側夾角滿足 $5.5x=360-${fractionToLatex(angle)}$，所以 $x=${minuteLatex(secondMinute)}$。因此從第一次到第二次經過 $${minuteLatex(secondMinute)}-${firstMinute}=${minuteLatex(elapsed)}$ 分，也就是 ${minuteDisplay(elapsed)} 分。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function formatJ113PolyTerm(coeff, text) {
    if (coeff === 0) return null;
    const abs = Math.abs(coeff);
    const body = text ? `${abs === 1 ? '' : abs}${text}` : `${abs}`;
    return coeff < 0 ? `-${body}` : body;
  }

  function joinJ113PolyTerms(terms) {
    const filtered = terms.filter(Boolean);
    if (!filtered.length) return '0';
    return filtered
      .map((term, index) => {
        if (index === 0) return term;
        return term.startsWith('-') ? `- ${term.slice(1)}` : `+ ${term}`;
      })
      .join(' ');
  }

  function formatJ113LinearFactor(xCoeff, yCoeff, constant) {
    return joinJ113PolyTerms([
      formatJ113PolyTerm(xCoeff, 'x'),
      formatJ113PolyTerm(yCoeff, 'y'),
      formatJ113PolyTerm(constant, ''),
    ]);
  }

  function buildJ113BiquadraticSplitSquareFactoringSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 4) {
        const n = randInt(2, 4);
        const high = `x^${4 * n}`;
        const mid = `x^${2 * n}`;
        const low = `x^${n}`;
        const f1 = joinJ113PolyTerms([
          formatJ113PolyTerm(1, mid),
          formatJ113PolyTerm(1, low),
          formatJ113PolyTerm(1, ''),
        ]);
        const f2 = joinJ113PolyTerms([
          formatJ113PolyTerm(1, mid),
          formatJ113PolyTerm(-1, low),
          formatJ113PolyTerm(1, ''),
        ]);
        questions.push(`因式分解 \\(${high} + ${mid} + 1\\)。`);
        answers.push(
          `簡答：\\((${f1})(${f2})\\)。過程：令 \\(y=${low}\\)，則原式為 \\(y^4+y^2+1\\)。補上並扣除 \\(y^2\\)，得 \\((y^2+1)^2-y^2\\)，再用平方差分解並代回。`
        );
        continue;
      }
      if (mode === 2) {
        const r = randInt(2, 5);
        const p = 2 * r * r;
        const poly = joinJ113PolyTerms([formatJ113PolyTerm(1, 'x^4'), formatJ113PolyTerm(p * p, '')]);
        const f1 = joinJ113PolyTerms([
          formatJ113PolyTerm(1, 'x^2'),
          formatJ113PolyTerm(2 * r, 'x'),
          formatJ113PolyTerm(p, ''),
        ]);
        const f2 = joinJ113PolyTerms([
          formatJ113PolyTerm(1, 'x^2'),
          formatJ113PolyTerm(-2 * r, 'x'),
          formatJ113PolyTerm(p, ''),
        ]);
        questions.push(`因式分解 \\(${poly}\\)。（提示：補上 \\(${2 * p}x^2\\) 並扣除）`);
        answers.push(
          `簡答：\\((${f1})(${f2})\\)。過程：\\(${poly}=(x^2+${p})^2-${2 * p}x^2=(x^2+${p})^2-(${2 * r}x)^2\\)，所以分解為 \\((${f1})(${f2})\\)。`
        );
        continue;
      }
      const variable = mode === 1 ? 'a' : 'x';
      const leadCoeff = mode === 3 ? randInt(2, 5) : 1;
      let p = randInt(1, 6);
      let q = randInt(1, 5);
      let discriminant = q * q - 4 * leadCoeff * p;
      while (discriminant >= 0 && isPerfectSquare(discriminant)) {
        p = randInt(1, 6);
        q = randInt(1, 5);
        discriminant = q * q - 4 * leadCoeff * p;
      }
      const middle = 2 * leadCoeff * p - q * q;
      const poly = joinJ113PolyTerms([
        formatJ113PolyTerm(leadCoeff * leadCoeff, `${variable}^4`),
        formatJ113PolyTerm(middle, `${variable}^2`),
        formatJ113PolyTerm(p * p, ''),
      ]);
      const f1 = joinJ113PolyTerms([
        formatJ113PolyTerm(leadCoeff, `${variable}^2`),
        formatJ113PolyTerm(q, variable),
        formatJ113PolyTerm(p, ''),
      ]);
      const f2 = joinJ113PolyTerms([
        formatJ113PolyTerm(leadCoeff, `${variable}^2`),
        formatJ113PolyTerm(-q, variable),
        formatJ113PolyTerm(p, ''),
      ]);
      const qVarText = q === 1 ? variable : `${q}${variable}`;
      questions.push(`因式分解 \\(${poly}\\)。`);
      answers.push(
        `簡答：\\((${f1})(${f2})\\)。過程：補成 \\((${leadCoeff === 1 ? '' : leadCoeff}${variable}^2+${p})^2-(${qVarText})^2\\)，再用平方差公式分解，得 \\((${f1})(${f2})\\)。`
      );
    }
    return { questions, answers };
  }

  function buildJ113BinaryQuadraticCrossFactoringSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      let a = pickNonZero(-4, 4);
      let b = pickNonZero(-5, 5);
      let c = pickNonZero(-6, 6);
      let d = pickNonZero(-4, 4);
      let e = pickNonZero(-5, 5);
      let f = pickNonZero(-6, 6);
      while (a * e === b * d) {
        a = pickNonZero(-4, 4);
        b = pickNonZero(-5, 5);
        d = pickNonZero(-4, 4);
        e = pickNonZero(-5, 5);
      }
      const poly = joinJ113PolyTerms([
        formatJ113PolyTerm(a * d, 'x^2'),
        formatJ113PolyTerm(a * e + b * d, 'xy'),
        formatJ113PolyTerm(b * e, 'y^2'),
        formatJ113PolyTerm(a * f + c * d, 'x'),
        formatJ113PolyTerm(b * f + c * e, 'y'),
        formatJ113PolyTerm(c * f, ''),
      ]);
      const f1 = formatJ113LinearFactor(a, b, c);
      const f2 = formatJ113LinearFactor(d, e, f);
      questions.push(`因式分解 \\(${poly}\\)。`);
      answers.push(
        `簡答：\\((${f1})(${f2})\\)。過程：把二元二次式看成兩個一次式相乘，用雙十字交乘配 \\(x^2,xy,y^2\\) 與 \\(x,y,常數\\) 項，可得 \\((${f1})(${f2})\\)。`
      );
    }
    return { questions, answers };
  }

  function formatSystemLatex(eq1, eq2) {
    return String.raw`\left\{\begin{array}{l}${eq1}\\${eq2}\end{array}\right.`;
  }

  function buildLinearWordExpressionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 5;
      if (variant === 0) {
        questions.push(`打折問題：原價 $x$ 元，打八折後再減 35 元，應記成什麼代數式？`);
        summaryAnswers.push(`$0.8x-35$`);
        answers.push(`先打八折得到 $0.8x$，再減 35 元，所以代數式是 $0.8x-35$。`);
      } else if (variant === 1) {
        questions.push(`數量分配：一打鉛筆賣 $x$ 元，買了 7 枝再加 5 元，應記成什麼代數式？`);
        summaryAnswers.push(`$\\frac{7x}{12}+5$`);
        answers.push(`一打是 12 枝，所以 7 枝價錢是 $\\frac{7x}{12}$，再加 5 元後為 $\\frac{7x}{12}+5$。`);
      } else if (variant === 2) {
        questions.push(`連續數問題：三個連續偶數中最小的是 $x$，三數總和應記成什麼代數式？`);
        summaryAnswers.push(`$3x+6$`);
        answers.push(`三個連續偶數是 $x,\\ x+2,\\ x+4$，總和是 $x+(x+2)+(x+4)=3x+6$。`);
      } else if (variant === 3) {
        questions.push(`幾何圖形：梯形上底是 $2x+1$、下底是 $4x-2$、高是 6，面積應記成什麼代數式？`);
        summaryAnswers.push(`$18x-3$`);
        answers.push(
          `梯形面積是 $\\frac{(上底+下底)\\times高}{2}$，所以面積為 $\\frac{[(2x+1)+(4x-2)]\\times 6}{2}=18x-3$。`
        );
      } else {
        questions.push(`幣值計算：我有 $x$ 個 5 元硬幣和 32 個 10 元硬幣，總共有多少元？`);
        summaryAnswers.push(`$5x+320$`);
        answers.push(`5 元硬幣共有 $5x$ 元，32 個 10 元硬幣共有 $320$ 元，所以總共有 $5x+320$ 元。`);
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function buildLinearSubstitutionValueSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;
      if (variant === 0) {
        const x = pickNonZero(-5, 5);
        questions.push(`當 $x=${x}$，求 $2x-1$ 的值。`);
        summaryAnswers.push(`$${2 * x - 1}$`);
        answers.push(`把 $x=${x}$ 代入：$2(${x})-1=${2 * x - 1}$。`);
      } else if (variant === 1) {
        const a = pickNonZero(-5, 5);
        const b = makeFraction(randInt(1, 3), 2);
        const value = divFraction(
          addFraction(makeFraction(a, 1), mulFraction(makeFraction(2, 1), b)),
          addFraction(makeFraction(2, 1), b)
        );
        questions.push(`當 $a=${a},\\ b=${fractionToLatex(b)}$，求 $\\frac{a+2b}{2+b}$ 的值。`);
        summaryAnswers.push(`$${fractionToLatex(value)}$`);
        answers.push(
          `代入得：$\\frac{${a}+2\\times ${fractionToLatex(b)}}{2+${fractionToLatex(b)}}=${fractionToLatex(value)}$。`
        );
      } else if (variant === 2) {
        const x = [0.5, 1.25, -1.25, -2.5][randInt(0, 3)];
        questions.push(`當 $x=${trimDecimalString(x)}$，求 $2x-7$ 的值。`);
        summaryAnswers.push(`$${trimDecimalString(2 * x - 7)}$`);
        answers.push(
          `把 $x=${trimDecimalString(x)}$ 代入：$2\\times ${trimDecimalString(x)}-7=${trimDecimalString(2 * x - 7)}$。`
        );
      } else {
        const a = pickNonZero(-4, 4);
        const b = pickNonZero(-4, 4);
        let c = pickNonZero(-4, 4);
        while (b === c) c = pickNonZero(-4, 4);
        const value = makeFraction(a * b - c, b - c);
        questions.push(`當 $a=${a},\\ b=${b},\\ c=${c}$，求 $\\frac{ab-c}{b-c}$ 的值。`);
        summaryAnswers.push(`$${fractionToLatex(value)}$`);
        answers.push(`代入得：$\\frac{${a}\\times ${b}-${c}}{${b}-${c}}=${fractionToLatex(value)}$。`);
      }
    }

    return { questions, summaryAnswers, answers };
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  function buildJ1DistributiveLawSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = [20, 30, 40, 50, 60, 70, 80, 90][randInt(0, 7)];
      const near = pickFromList([100, 200, 300, 400, 500, 600, 700, 800, 900]) * (randInt(0, 1) ? 1 : -1);
      const delta = randInt(1, 8) * (randInt(0, 1) ? 1 : -1);
      const exact = near + delta;
      const total = exact * base;
      questions.push(`利用分配律計算：${exact}×${base}`);
      summaryAnswers.push(`$${total}$`);
      answers.push(
        `把 ${exact} 看成 ${near}${delta >= 0 ? '+' : ''}${delta}，依分配律：$(${near}${delta >= 0 ? '+' : ''}${delta})\\times ${base}=${near}\\times ${base}${delta >= 0 ? '+' : ''}${delta}\\times ${base}=${total}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ1CommonFactorSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const common = pickNonZero(-90, 90);
      const a = pickNonZero(-40, 40);
      const b = pickNonZero(-40, 40);
      const total = common * a + common * b;
      questions.push(`利用提出公因數計算：${common}×(${a}) + ${common}×(${b})`);
      summaryAnswers.push(`$${total}$`);
      answers.push(
        `提出公因數 ${common}：$${common}\\times(${a})+${common}\\times(${b})=${common}\\times(${a}${b >= 0 ? '+' : ''}${b})=${common}\\times(${a + b})=${total}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ1CommonFactorFourTermsSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const leftSum = pickFromList([300, 400, 500, 600, 700, 800, 1000]);
      const rightSum = pickFromList([100, 200, 300, 400, 500]);
      const [a, b] = pickPositivePairWithSum(leftSum, 100);
      const [m, n] = pickPositivePairWithSum(rightSum, 20);
      const value = leftSum * rightSum;
      questions.push(`利用分組提出公因數計算：${a}×${m} + ${a}×${n} + ${b}×${m} + ${b}×${n}`);
      summaryAnswers.push(`$${value}$`);
      answers.push(
        `先前兩項與後兩項分組：$${a}\\times(${m}+${n})+${b}\\times(${m}+${n})=(${a}+${b})\\times(${m}+${n})=${leftSum}\\times${rightSum}=${value}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ1CommonFactorFourTermsSignedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const leftSum = pickFromList([200, 300, 400, 500, 600, 800]);
      const rightSum = pickFromList([-40, -30, -20, -10, 20, 30, 40, 50, 100, 200]);
      const [a, b] = pickPositivePairWithSum(leftSum, 80);
      const [m, n] = pickSignedPairWithSum(rightSum);
      const value = leftSum * rightSum;
      questions.push(`利用分組提出公因數計算：${a}×(${m}) + ${a}×(${n}) + ${b}×(${m}) + ${b}×(${n})`);
      summaryAnswers.push(`$${value}$`);
      answers.push(
        `先前兩項與後兩項分組：$${a}\\times(${m}${n >= 0 ? '+' : ''}${n})+${b}\\times(${m}${n >= 0 ? '+' : ''}${n})=(${a}+${b})\\times(${m}${n >= 0 ? '+' : ''}${n})=${leftSum}\\times(${rightSum})=${value}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ1VariableDistributiveEvalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const bases = [105, 111, 120, 125, 131, 132, 144];
    const offsets = [1, 2, 3, 4];
    for (let i = 0; i < count; i += 1) {
      const base = bases[i % bases.length];
      const offset = offsets[randInt(0, offsets.length - 1)];
      const jia = randInt(900, 1800);
      const known = jia * base;
      const extra = offset * base;
      const result = (jia + offset) * base;
      questions.push(`已知 甲×${base}=${known}，求 (甲+${offset})×${base} 的值。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `利用分配律：$(甲+${offset})\\times ${base}=甲\\times ${base}+${offset}\\times ${base}=${known}+${extra}=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ1DistributivePairDifferenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const b = randInt(320, 860);
      const diff = randInt(2, 18);
      const a = b + diff;
      const value = a - b;
      questions.push(`設法利用分配律計算：${a}×${b + 1}-${a + 1}×${b}`);
      summaryAnswers.push(`$${value}$`);
      answers.push(
        `把原式看成 $${a}×(${b}+1)-(${a}+1)×${b}$。依分配律展開：$${a}×${b}+${a}-${a}×${b}-${b}=${a}-${b}=${value}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ1DistributiveOffsetDifferenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const k = randInt(2, 4);
      const b = randInt(240, 760);
      const diff = randInt(2, 18);
      const a = k * b - diff;
      const value = diff;
      questions.push(`設法利用分配律計算：${a + k}×${b}-${a}×${b + 1}`);
      summaryAnswers.push(`$${value}$`);
      answers.push(
        `把第一項拆成 $(${a}+${k})×${b}$，原式 $=${a}×${b}+${k}×${b}-${a}×(${b}+1)=${a}×${b}+${k}×${b}-${a}×${b}-${a}=${k}×${b}-${a}=${value}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ1CommonFactorThenDistributiveSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const commonList = [102, 104, 106, 1001, 1003, 1004, 1006, 10001, 10004, 10006];
    for (let i = 0; i < count; i += 1) {
      const common = pickFromList(commonList);
      const k = randInt(2, 4);
      const b = randInt(240, 860);
      const diff = randInt(2, 12);
      const a = k * b - diff;
      const inner = diff;
      const value = common * inner;
      questions.push(`先提出公因數，再利用分配律計算：${common}×${a + k}×${b}-${common}×${a}×${b + 1}`);
      summaryAnswers.push(`$${value}$`);
      answers.push(
        `先提出公因數 $${common}$：原式 $=${common}\\bigl(${a + k}×${b}-${a}×${b + 1}\\bigr)$。` +
          `再把括號內拆成 $(${a}+${k})×${b}-${a}×(${b}+1)$，可得 $${a}×${b}+${k}×${b}-${a}×${b}-${a}=${k}×${b}-${a}=${inner}$。` +
          `所以原式 $=${common}×(${inner})=${value}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ1VariableDistributiveApplicationSet(count) {
    const banks = [
      buildJ1DistributivePairDifferenceSet,
      buildJ1DistributiveOffsetDifferenceSet,
      buildJ1CommonFactorThenDistributiveSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const fn = banks[i % banks.length];
      const one = fn(1);
      questions.push(one.questions[0]);
      answers.push(one.answers[0]);
    }
    return { questions, answers };
  }

  function buildJ1DistributiveCommonFactorMixedSet(count) {
    const banks = [
      buildJ1DistributiveLawSet,
      buildJ1CommonFactorSet,
      buildJ1CommonFactorFourTermsSet,
      buildJ1CommonFactorFourTermsSignedSet,
      buildJ1DistributivePairDifferenceSet,
      buildJ1DistributiveOffsetDifferenceSet,
      buildJ1CommonFactorThenDistributiveSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const fn = banks[i % banks.length];
      const one = fn(1);
      questions.push(one.questions[0]);
      summaryAnswers.push(Array.isArray(one.summaryAnswers) ? one.summaryAnswers[0] : one.answers[0]);
      answers.push(one.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildWeirdSymbolCalcSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const symbolDefs = [
      { sym: '★', calc: (a, b) => a + 2 * b, text: 'a★b=a+2b' },
      { sym: '◎', calc: (a, b) => 2 * a - b, text: 'a◎b=2a-b' },
      { sym: '◆', calc: (a, b) => a * b + a, text: 'a◆b=ab+a' },
    ];
    for (let i = 0; i < count; i += 1) {
      const def = symbolDefs[i % symbolDefs.length];
      const a = pickNonZero(-9, 9);
      const b = pickNonZero(-9, 9);
      const value = def.calc(a, b);
      questions.push(`若規定 ${def.text}，求 ${a}${def.sym}${b}。`);
      summaryAnswers.push(`$${value}$`);
      answers.push(`依規定代入：$${a}${def.sym}${b}=${value}$。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildWeirdSymbolCalcThreeLayerSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const symbolDefs = [
      { sym: '★', calc: (a, b) => a + 2 * b, text: 'a★b=a+2b' },
      { sym: '◎', calc: (a, b) => 2 * a - b, text: 'a◎b=2a-b' },
    ];
    for (let i = 0; i < count; i += 1) {
      const d1 = symbolDefs[0];
      const d2 = symbolDefs[1];
      const a = pickNonZero(-6, 6);
      const b = pickNonZero(-6, 6);
      const c = pickNonZero(-6, 6);
      const inner = d1.calc(a, b);
      const value = d2.calc(inner, c);
      questions.push(`若規定 ${d1.text}，${d2.text}，求 (${a}${d1.sym}${b})${d2.sym}${c}。`);
      summaryAnswers.push(`$${value}$`);
      answers.push(
        `先算內層：$${a}${d1.sym}${b}=${inner}$；再算外層：$${inner}${d2.sym}${c}=${value}$。所以結果是 ${value}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ112MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      summaryAnswers.push(
        Array.isArray(generated.summaryAnswers) ? generated.summaryAnswers[itemIndex] : generated.answers[itemIndex]
      );
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ112DistributiveFactorMixedSet(count) {
    return buildJ112MixedSet(
      [
        buildJ1DistributiveLawSet,
        buildJ1CommonFactorSet,
        buildJ1CommonFactorFourTermsSet,
        buildJ1CommonFactorFourTermsSignedSet,
        buildJ1VariableDistributiveEvalSet,
        buildJ1DistributivePairDifferenceSet,
        buildJ1DistributiveOffsetDifferenceSet,
        buildJ1CommonFactorThenDistributiveSet,
      ],
      count
    );
  }

  function buildJ112IntegerMixedSet(count) {
    return buildJ112MixedSet(
      [
        buildIntegerAddSubtractBracketsSet,
        buildCancelingBracketIntegerSet,
        buildAbsoluteIntegerReduceSet,
        buildAbsoluteBracketMixedSet,
        buildThreeProductSet,
      ],
      count
    );
  }

  function buildJ112BaselineMixedSet(count) {
    return buildJ112MixedSet(
      [
        buildNearbyAverageBaselineSet,
        buildTimeBaselineBasicSet,
        buildTimeBaselineAdvancedSet,
        buildAverageBaselineDifferenceSet,
      ],
      count
    );
  }

  function buildJ112OppositeMixedSet(count) {
    return buildJ112MixedSet(
      [buildOppositeNumberSet, buildSameShiftOppositeSet, buildOppositeNumberSumDifferenceSet],
      count
    );
  }

  function buildJ112WeirdSymbolMixedSet(count) {
    return buildJ112MixedSet(
      [buildWeirdSymbolCalcSet, buildWeirdSymbolCalcThreeLayerSet, buildWeirdSymbolReverseSet],
      count
    );
  }

  function buildSubstitutionSquareSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-4, 4);
      const b = pickNonZero(-4, 4);
      const result = a * a + b * b;
      questions.push(`若 $a=${a},\\ b=${b}$，求 $a^2+b^2$ 的值。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(`代入得：$(${a})^2+(${b})^2=${a * a}+${b * b}=${result}$。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ123BracketMixedOperationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const a = randomProperFraction([2, 3, 4, 5, 6, 8]);
        const b = randomProperFraction([2, 3, 4, 5, 6, 8]);
        const c = randomProperFraction([2, 3, 4, 5, 6, 8]);
        const d = randomProperFraction([2, 3, 4, 5, 6, 8]);
        const left = addFraction(a, b);
        const right = subFraction(c, d);
        const result = divFraction(left, right);
        questions.push(
          `計算：$\\left(${fractionToLatex(a)}+${fractionToLatex(b)}\\right)\\div\\left(${fractionToLatex(c)}-${fractionToLatex(d)}\\right)$。`
        );
        summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
        answers.push(
          `先算括號內：$${fractionToLatex(a)}+${fractionToLatex(b)}=${fractionToLatex(left)}$，$${fractionToLatex(c)}-${fractionToLatex(d)}=${fractionToLatex(right)}$；再做除法，得 $${fractionToLatex(result, true)}$。`
        );
        continue;
      }

      if (mode === 1) {
        const a = randomProperFraction([2, 3, 4, 5, 6]);
        const b = randomProperFraction([2, 3, 4, 5, 6, 8]);
        const c = randomProperFraction([2, 3, 4, 5, 6, 8]);
        const left = addFraction(makeFraction(1, 1), a);
        const right = subFraction(makeFraction(1, 1), b);
        const result = mulFraction(left, divFraction(right, c));
        questions.push(
          `計算：$\\left(1+${fractionToLatex(a)}\\right)\\times\\left(1-${fractionToLatex(b)}\\right)\\div ${fractionToLatex(c)}$。`
        );
        summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
        answers.push(
          `先算括號：$1+${fractionToLatex(a)}=${fractionToLatex(left, true)}$，$1-${fractionToLatex(b)}=${fractionToLatex(right, true)}$；再依序乘除，結果是 $${fractionToLatex(result, true)}$。`
        );
        continue;
      }

      if (mode === 2) {
        const a = randomMixedFraction(1, 3, [2, 3, 4, 5, 6], false);
        const b = randomMixedFraction(1, 2, [2, 3, 4, 5, 6], false);
        const c = randomProperFraction([2, 3, 4, 5, 6, 8]);
        const left = addFraction(a, b);
        const result = mulFraction(left, c);
        questions.push(
          `計算：$\\left(${integerOrFractionLatex(a)}+${integerOrFractionLatex(b)}\\right)\\times ${fractionToLatex(c)}$。`
        );
        summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
        answers.push(
          `先把帶分數化成假分數並合併括號：$${integerOrFractionLatex(a)}+${integerOrFractionLatex(b)}=${fractionToLatex(left, true)}$；再乘上 ${fractionToLatex(c)}，得 $${fractionToLatex(result, true)}$。`
        );
        continue;
      }

      if (mode === 3) {
        const a = randomProperFraction([2, 3, 4, 5, 6, 8]);
        const b = randomProperFraction([2, 3, 4, 5, 6, 8]);
        const c = randomProperFraction([2, 3, 4, 5, 6, 8]);
        const left = addFraction(a, b);
        const result = divFraction(left, c);
        questions.push(
          `計算：$\\left(${fractionToLatex(a)}+${fractionToLatex(b)}\\right)\\div ${fractionToLatex(c)}$。`
        );
        summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
        answers.push(
          `先算括號內：$${fractionToLatex(a)}+${fractionToLatex(b)}=${fractionToLatex(left)}$；再把除以 ${fractionToLatex(c)} 改成乘倒數，結果是 $${fractionToLatex(result, true)}$。`
        );
        continue;
      }

      const a = randomProperFraction([2, 3, 4, 5, 6, 8]);
      const b = randomProperFraction([2, 3, 4, 5, 6, 8]);
      const c = randomProperFraction([2, 3, 4, 5, 6, 8]);
      const d = randomProperFraction([2, 3, 4, 5, 6, 8]);
      const left = subFraction(a, b);
      const right = addFraction(c, d);
      const result = mulFraction(left, right);
      questions.push(
        `計算：$\\left(${fractionToLatex(a)}-${fractionToLatex(b)}\\right)\\times\\left(${fractionToLatex(c)}+${fractionToLatex(d)}\\right)$。`
      );
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `先算兩個括號：$${fractionToLatex(a)}-${fractionToLatex(b)}=${fractionToLatex(left)}$，$${fractionToLatex(c)}+${fractionToLatex(d)}=${fractionToLatex(right)}$；再相乘得 $${fractionToLatex(result, true)}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ123FractionSeriesGeometricSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 3;

      if (mode === 0) {
        const endPower = randInt(3, 6);
        let result = makeFraction(1, 1);
        const terms = ['1'];
        for (let k = 1; k <= endPower; k += 1) {
          const term = makeFraction(1, Math.pow(2, k));
          result = addFraction(result, term);
          terms.push(fractionToLatex(term));
        }
        questions.push(`計算：$${terms.join('+')}$ 的值。`);
        summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
        answers.push(`這是每次減半的分數和，依序通分相加，可得 $${fractionToLatex(result, true)}$。`);
        continue;
      }

      if (mode === 1) {
        const end = randInt(5, 8);
        let result = makeFraction(1, 1);
        const parts = ['1'];
        for (let k = 2; k <= end; k += 1) {
          const term = makeFraction(1, k);
          result = addFraction(result, k % 2 === 0 ? negateFraction(term) : term);
          parts.push(`${k % 2 === 0 ? '-' : '+'}${fractionToLatex(term)}`);
        }
        questions.push(`計算：$${parts.join('')}$ 的值。`);
        summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
        answers.push(`依照正負號逐項通分整理即可，結果是 $${fractionToLatex(result, true)}$。`);
        continue;
      }

      const startWhole = randInt(2, 4);
      const den = pickFromList([2, 3, 4]);
      const ratioNum = den - 1;
      const terms = randInt(4, 6);
      let result = makeFraction(startWhole, 1);
      const parts = [`${startWhole}`];
      let currentNum = 1;
      let currentDen = den;
      for (let k = 0; k < terms; k += 1) {
        const term = makeFraction(currentNum, currentDen);
        result = subFraction(result, term);
        parts.push(`-${fractionToLatex(term)}`);
        currentNum *= ratioNum;
        currentDen *= den;
      }
      questions.push(`計算：$${parts.join('')}$ 的值。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(`這是一串固定倍率的分數級數，依序通分相減後，可得 $${fractionToLatex(result, true)}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ123FractionSeriesProductSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const start = randInt(2, 4);
      const end = randInt(start + 4, start + 8);
      const pieces = [];
      let result = makeFraction(1, 1);
      for (let k = start; k <= end; k += 1) {
        const term = makeFraction(k + 1, k);
        result = mulFraction(result, term);
        pieces.push(`\\left(1+\\frac{1}{${k}}\\right)`);
      }
      questions.push(`計算：$${pieces.join('\\times')}$ 的值。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(`把每一項改寫成 $\\frac{k+1}{k}$ 後，前後對消，最後只剩下 $${fractionToLatex(result, true)}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ123MixedNumberAddSubSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = randomMixedFraction(4, 12, [2, 3, 4, 5, 6, 8], false);
      const b = randomMixedFraction(3, 10, [2, 3, 4, 5, 6, 8], false);
      const c = randomMixedFraction(2, 9, [2, 3, 4, 5, 6, 8], false);
      const result = i % 2 === 0 ? addFraction(subFraction(a, b), c) : subFraction(addFraction(a, b), c);
      const expr =
        i % 2 === 0
          ? `${integerOrFractionLatex(a)}-${integerOrFractionLatex(b)}+${integerOrFractionLatex(c)}`
          : `${integerOrFractionLatex(a)}+${integerOrFractionLatex(b)}-${integerOrFractionLatex(c)}`;
      questions.push(`計算：$${expr}$ 的值。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(`先把帶分數化成假分數，再依序通分計算，可得 $${fractionToLatex(result, true)}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ123MixedNumberTripleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const a = randomMixedFraction(7, 15, [2, 3, 4, 5, 6, 8], false);
      const b = randomMixedFraction(3, 10, [2, 3, 4, 5, 6, 8], false);
      const c = randomMixedFraction(2, 9, [2, 3, 4, 5, 6, 8], false);
      const d = randomMixedFraction(1, 8, [2, 3, 4, 5, 6, 8], false);
      const result = subFraction(addFraction(a, b), addFraction(c, d));
      questions.push(
        `計算：$${integerOrFractionLatex(a)}+${integerOrFractionLatex(b)}-${integerOrFractionLatex(c)}-${integerOrFractionLatex(d)}$ 的值。`
      );
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(`整數部分與分數部分一起化成假分數後，再通分計算，結果是 $${fractionToLatex(result, true)}$。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ123FractionRemainderApplicationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;

      if (mode === 0) {
        const den = pickFromList([3, 4, 5, 6, 8]);
        const num = randInt(1, den - 1);
        const bags = randInt(3, 8);
        const perBag = makeFraction(randInt(2, 6) * den + num, den);
        const total = mulFraction(perBag, makeFraction(bags, 1));
        questions.push(`重量分配：將 $${fractionToLatex(total, true)}$ 公斤的麵粉平均分成 ${bags} 袋，每袋幾公斤？`);
        summaryAnswers.push(`$${fractionToLatex(perBag, true)}$ 公斤`);
        answers.push(
          `每袋重量 = 總重量 ÷ 袋數，所以 $${fractionToLatex(total, true)}\\div ${bags}=${fractionToLatex(perBag, true)}$ 公斤。`
        );
        continue;
      }

      if (mode === 1) {
        const whole = randInt(10, 20);
        const den = pickFromList([2, 3, 4, 5, 6]);
        const num = randInt(1, den - 1);
        const used = makeFraction(num, den);
        const remain = mulFraction(makeFraction(whole, 1), subFraction(makeFraction(1, 1), used));
        questions.push(`剩餘量計算：一條繩子長 ${whole} 公尺，剪掉 ${fractionToLatex(used)} 後，還剩多少公尺？`);
        summaryAnswers.push(`$${fractionToLatex(remain, true)}$ 公尺`);
        answers.push(
          `剩下的是全長的 $1-${fractionToLatex(used)}=${fractionToLatex(subFraction(makeFraction(1, 1), used))}$，所以剩餘長度是 $${fractionToLatex(remain, true)}$ 公尺。`
        );
        continue;
      }

      if (mode === 2) {
        const money = randInt(120, 300);
        const den = pickFromList([3, 4, 5, 6, 8]);
        const num = randInt(1, den - 1);
        const used = mulFraction(makeFraction(money, 1), makeFraction(num, den));
        const remain = subFraction(makeFraction(money, 1), used);
        questions.push(
          `金錢花費：小明有 ${money} 元，用了 ${fractionToLatex(makeFraction(num, den))} 買玩具，還剩多少元？`
        );
        summaryAnswers.push(`$${fractionToLatex(remain, true)}$ 元`);
        answers.push(
          `先算用掉的錢：$${money}\\times ${fractionToLatex(makeFraction(num, den))}=${fractionToLatex(used, true)}$，再用總金額相減，剩下 $${fractionToLatex(remain, true)}$ 元。`
        );
        continue;
      }

      if (mode === 3) {
        const total = randomMixedFraction(3, 6, [2, 3, 4, 5], false);
        const used = randomMixedFraction(1, 2, [2, 3, 4, 5], false);
        const remain = subFraction(total, used);
        questions.push(
          `工程與液量：一罐油漆重 $${fractionToLatex(total, true)}$ 公斤，用掉 $${fractionToLatex(used, true)}$ 公斤後還剩多少公斤？`
        );
        summaryAnswers.push(`$${fractionToLatex(remain, true)}$ 公斤`);
        answers.push(`把兩個帶分數化成假分數後相減，可得剩餘重量是 $${fractionToLatex(remain, true)}$ 公斤。`);
        continue;
      }

      const total = makeFraction(randInt(2, 5) * 2 + 1, 2);
      const drink = makeFraction(randInt(1, 3), 2);
      const remain = subFraction(total, drink);
      questions.push(
        `液體測量：一瓶果汁有 $${fractionToLatex(total, true)}$ 公升，喝掉 $${fractionToLatex(drink)}$ 公升後還剩多少公升？`
      );
      summaryAnswers.push(`$${fractionToLatex(remain, true)}$ 公升`);
      answers.push(`剩餘量 = 原有量 $-${fractionToLatex(drink)}$，所以還剩 $${fractionToLatex(remain, true)}$ 公升。`);
    }

    return { questions, summaryAnswers, answers };
  }

  function buildJ123MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      summaryAnswers.push(
        Array.isArray(generated.summaryAnswers) ? generated.summaryAnswers[itemIndex] : generated.answers[itemIndex]
      );
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ123BracketMixedWrapperSet(count) {
    return buildJ123MixedSet([buildJ123BracketMixedOperationSet], count);
  }

  function buildJ123SeriesMixedWrapperSet(count) {
    return buildJ123MixedSet([buildJ123FractionSeriesGeometricSet, buildJ123FractionSeriesProductSet], count);
  }

  function buildJ123MixedNumberWrapperSet(count) {
    return buildJ123MixedSet([buildJ123MixedNumberAddSubSet, buildJ123MixedNumberTripleSet], count);
  }

  function buildJ123ApplicationWrapperSet(count) {
    return buildJ123MixedSet([buildJ123FractionRemainderApplicationSet], count);
  }

  function buildSubstitutionLinearThreeVarSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-4, 4);
      const b = pickNonZero(-4, 4);
      let c = pickNonZero(-4, 4);
      while (c === b) c = pickNonZero(-4, 4);
      const result = a - b + c;
      questions.push(`若 $a=${a},\\ b=${b},\\ c=${c}$，求 $a-b+c$ 的值。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(`依序代入：$${a}-(${b})+${c}=${result}$。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildSubstitutionPowerLinearSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-3, 3);
      const b = pickNonZero(-5, 5);
      const c = pickNonZero(-3, 3);
      const result = a * a + b - c * c * c;
      questions.push(`若 $a=${a},\\ b=${b},\\ c=${c}$，求 $a^2+b-c^3$ 的值。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `先算次方：$(${a})^2=${a * a}$，$(${c})^3=${c * c * c}$，所以 $a^2+b-c^3=${a * a}${b >= 0 ? '+' : ''}${b}-(${c * c * c})=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildSubstitutionProductPlusSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-5, 5);
      const b = pickNonZero(-5, 5);
      const c = pickNonZero(-5, 5);
      const result = a * b + c;
      questions.push(`若 $a=${a},\\ b=${b},\\ c=${c}$，求 $a\\times b+c$ 的值。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(`先乘後加：$${a}\\times ${b}${c >= 0 ? '+' : ''}${c}=${a * b}${c >= 0 ? '+' : ''}${c}=${result}$。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildSubstitutionPowerDifferenceSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-3, 3);
      const b = pickNonZero(-4, 4);
      const result = a * a * a - b * b;
      questions.push(`若 $a=${a},\\ b=${b}$，求 $a^3-b^2$ 的值。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `先算次方：$(${a})^3=${a * a * a}$，$(${b})^2=${b * b}$，所以 $a^3-b^2=${a * a * a}-${b * b}=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildBracketOrderMulDivAddSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-6, 6);
      const b = pickNonZero(-6, 6);
      const divisor = pickNonZero(-6, 6);
      const quotient = pickNonZero(-6, 6);
      const dividend = divisor * quotient;
      const result = a * b + quotient;
      questions.push(
        `計算：$${a}\\times ${wrapIfNegative(b)}+${wrapIfNegative(dividend)}\\div ${wrapIfNegative(divisor)}$。`
      );
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `先乘除後加減：$${a}\\times ${wrapIfNegative(b)}=${a * b}$，$${dividend}\\div ${wrapIfNegative(divisor)}=${quotient}$，所以原式 $=${a * b}${quotient >= 0 ? '+' : ''}${quotient}=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildBracketOrderBracketDivisionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const divisor = pickNonZero(-6, 6);
      const quotient = pickNonZero(-6, 6);
      const inside = divisor * quotient;
      const a = randInt(-10, 10);
      const b = inside - a;
      questions.push(
        `計算：$\\left[${wrapIfNegative(a)}+${wrapIfNegative(b)}\\right]\\div ${wrapIfNegative(divisor)}$。`
      );
      summaryAnswers.push(`$${quotient}$`);
      answers.push(
        `先算中括號：$${a}${b >= 0 ? '+' : ''}${b}=${inside}$，再除以 ${divisor}，得到 $${inside}\\div ${wrapIfNegative(divisor)}=${quotient}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildBracketOrderMultiplyBracketSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-6, 6);
      const b = pickNonZero(-8, 8);
      const c = pickNonZero(-8, 8);
      const inside = b + c;
      const result = a * inside;
      questions.push(`計算：$${wrapIfNegative(a)}\\times \\left[${wrapIfNegative(b)}+${wrapIfNegative(c)}\\right]$。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `先算括號：$${b}${c >= 0 ? '+' : ''}${c}=${inside}$，再乘上 ${a}，得 $${a}\\times ${wrapIfNegative(inside)}=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildBracketOrderMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-5, 5);
      const b = pickNonZero(-6, 6);
      const c = pickNonZero(-6, 6);
      const divisor = pickNonZero(-6, 6);
      const quotient = pickNonZero(-6, 6);
      const dividend = divisor * quotient;
      const left = a * (b + c);
      const result = left - quotient;
      questions.push(
        `計算：$${a}\\times \\left[${wrapIfNegative(b)}+${wrapIfNegative(c)}\\right]-${wrapIfNegative(dividend)}\\div ${wrapIfNegative(divisor)}$。`
      );
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `先算括號與乘除：$${b}${c >= 0 ? '+' : ''}${c}=${b + c}$，所以左邊是 $${a}\\times ${wrapIfNegative(b + c)}=${left}$；右邊是 $${dividend}\\div ${wrapIfNegative(divisor)}=${quotient}$。最後 $${left}-${wrapIfNegative(quotient)}=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildBracketOrderNestedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-5, 5);
      const divisor = pickNonZero(-5, 5);
      const quotient = pickNonZero(-4, 4);
      const dividend = divisor * quotient;
      const c = pickNonZero(-6, 6);
      const inside = quotient + c;
      const result = a * inside;
      questions.push(
        `計算：$${a}\\times \\left[${dividend}\\div ${wrapIfNegative(divisor)}+${wrapIfNegative(c)}\\right]$。`
      );
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `先算中括號內的除法：$${dividend}\\div ${wrapIfNegative(divisor)}=${quotient}$，所以括號內變成 $${quotient}${c >= 0 ? '+' : ''}${c}=${inside}$。再算 $${a}\\times ${wrapIfNegative(inside)}=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildPowerMixedAddProductSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 4);
      const exponent = pickFromList([3, 4]);
      const b = randInt(2, 5);
      const c = pickNonZero(-5, -2);
      const powerValue = Math.pow(-a, exponent);
      const product = b * c;
      const result = powerValue + product;
      questions.push(`計算：$(-${a})^{${exponent}}+${b}\\times ${wrapIfNegative(c)}$。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `先算次方與乘法：$(-${a})^{${exponent}}=${powerValue}$，$${b}\\times ${wrapIfNegative(c)}=${product}$，所以原式 $=${powerValue}${product >= 0 ? '+' : ''}${product}=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildPowerMixedSubtractSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 3);
      const b = randInt(2, 5);
      const c = randInt(2, 4);
      const d = pickNonZero(-4, 4);
      const left = Math.pow(-a, 4);
      const middle = b * Math.pow(-c, 2);
      const result = left - middle + d;
      questions.push(`計算：$(-${a})^4-${b}\\times (-${c})^2${d >= 0 ? '+' : ''}${d}$。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `先算次方：$(-${a})^4=${left}$，$(-${c})^2=${Math.pow(-c, 2)}$，再算乘法得 $${b}\\times ${Math.pow(-c, 2)}=${middle}$。所以原式 $=${left}-${middle}${d >= 0 ? '+' : ''}${d}=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildPowerMixedMulDivSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 4);
      const divisor = randInt(2, 4);
      const quotient = pickNonZero(-8, 8);
      const cubeValue = divisor * quotient;
      const b = Math.abs(cubeValue) === 8 ? 2 : Math.abs(cubeValue) === 27 ? 3 : a;
      const c = pickNonZero(-4, 4);
      const d = pickNonZero(-3, 3);
      const powerPart = Math.pow(-b, 3) / divisor;
      const product = c * Math.pow(-d, 5);
      const result = powerPart + product;
      questions.push(`計算：$(-${b})^3\\div ${divisor}+${c}\\times (${d})^5$。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `先算次方：$(-${b})^3=${Math.pow(-b, 3)}$，$(${d})^5=${Math.pow(d, 5)}$。再算乘除：$${Math.pow(-b, 3)}\\div ${divisor}=${powerPart}$，$${c}\\times ${Math.pow(d, 5)}=${product}$。最後得 $${powerPart}${product >= 0 ? '+' : ''}${product}=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildPowerMixedBracketSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 4);
      const b = randInt(2, 5);
      const c = pickNonZero(-6, 6);
      const inside = Math.pow(-a, 3) + c;
      const result = b * inside;
      questions.push(`計算：$${b}\\times \\left[(-${a})^3${c >= 0 ? '+' : ''}${c}\\right]$。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `先算括號內次方：$(-${a})^3=${Math.pow(-a, 3)}$，所以括號內是 $${Math.pow(-a, 3)}${c >= 0 ? '+' : ''}${c}=${inside}$。再乘上 ${b}，得 $${b}\\times ${wrapIfNegative(inside)}=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildAbsoluteMulAddSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-9, 9);
      const b = pickNonZero(-9, 9);
      const c = pickNonZero(-4, 4);
      const d = pickNonZero(-8, 8);
      const absValue = Math.abs(a + b);
      const result = absValue * c + d;
      questions.push(
        `計算：$|${wrapIfNegative(a)}+${wrapIfNegative(b)}|\\times ${wrapIfNegative(c)}${d >= 0 ? '+' : ''}${d}$。`
      );
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `先算絕對值內：$${a}${b >= 0 ? '+' : ''}${b}=${a + b}$，所以 $|${wrapIfNegative(a)}+${wrapIfNegative(b)}|=${absValue}$。再算 $${absValue}\\times ${wrapIfNegative(c)}${d >= 0 ? '+' : ''}${d}=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildAbsoluteTwoStageMulSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-9, 9);
      const b = pickNonZero(-9, 9);
      const c = pickNonZero(-5, 5);
      const d = pickNonZero(-6, 6);
      const valueA = Math.abs(a);
      const valueB = Math.abs(b);
      const result = valueA + valueB * c - Math.abs(d);
      questions.push(`計算：$|${a}|+|${b}|\\times ${wrapIfNegative(c)}-|${d}|$。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `先去絕對值：$|${a}|=${valueA}$，$|${b}|=${valueB}$，$|${d}|=${Math.abs(d)}$。再先乘後加減，得 $${valueA}+${valueB}\\times ${wrapIfNegative(c)}-${Math.abs(d)}=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildAbsolutePowerProductSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-4, 4);
      const b = randInt(2, 5);
      const c = randInt(2, 5);
      const d = pickNonZero(-7, 7);
      const square = Math.pow(a, 2);
      const absValue = Math.abs(d);
      const result = b * square - c * absValue;
      questions.push(`計算：$${b}\\times (${a})^2-${c}\\times |${d}|$。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `先算次方與絕對值：$(${a})^2=${square}$，$|${d}|=${absValue}$。再算乘法：$${b}\\times ${square}=${b * square}$，$${c}\\times ${absValue}=${c * absValue}$，所以結果是 $${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildAbsoluteDistanceSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-9, 9);
      const b = randInt(-9, 9);
      const c = randInt(-9, 9);
      const d = randInt(-9, 9);
      const first = Math.abs(a - b);
      const second = Math.abs(c - d);
      const result = first + second;
      questions.push(`計算：$|${a}-${wrapIfNegative(b)}|+|${c}-${wrapIfNegative(d)}|$。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `先各自算距離：$|${a}-${wrapIfNegative(b)}|=${first}$，$|${c}-${wrapIfNegative(d)}|=${second}$，所以原式 $=${first}+${second}=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildFractionIntegerAddSubSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const whole = randInt(1, 4);
      const a = randomProperFraction([2, 3, 4, 5, 6]);
      const b = randomProperFraction([2, 3, 4, 5, 6]);
      const result = subFraction(subFraction(makeFraction(whole, 1), a), b);
      questions.push(`計算：$${whole}-${fractionToLatex(a)}-${fractionToLatex(b)}$。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `先通分再相減，可得 $${whole}-${fractionToLatex(a)}-${fractionToLatex(b)}=${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildFractionSignedMixedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randomProperFraction([2, 3, 4, 5, 6]);
      const b = randomProperFraction([2, 3, 4, 5, 6]);
      const c = randomProperFraction([2, 3, 4, 5, 6]);
      const result = addFraction(subFraction(a, b), c);
      questions.push(`計算：$${fractionToLatex(a)}-${fractionToLatex(b)}+${fractionToLatex(c)}$。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `依序通分整理，$${fractionToLatex(a)}-${fractionToLatex(b)}+${fractionToLatex(c)}=${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildFractionPowerComplexSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 4);
      const b = randInt(2, 6);
      const c = randInt(1, 12);
      const d = randInt(2, 5);
      const numerator = Math.pow(-a, 2) * b - c;
      const denominator = Math.pow(-d, 2);
      const result = makeFraction(numerator, denominator);
      questions.push(`計算：$\\frac{(-${a})^2\\times ${b}-${c}}{(-${d})^2}$。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `先算次方：$(-${a})^2=${Math.pow(-a, 2)}$，$(-${d})^2=${denominator}$。所以原式 $=\\frac{${Math.pow(-a, 2)}\\times ${b}-${c}}{${denominator}}=\\frac{${numerator}}{${denominator}}=${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildFractionPowerSignSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 4);
      const b = randInt(2, 5);
      const c = randInt(1, 15);
      const odd = pickFromList([3, 5, 7]);
      const numerator = Math.pow(-a, 3) * b + c;
      const denominator = Math.pow(-1, odd);
      const result = makeFraction(numerator, denominator);
      questions.push(`計算：$\\frac{(-${a})^3\\times ${b}${c >= 0 ? '+' : ''}${c}}{(-1)^{${odd}}}$。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `先算次方：$(-${a})^3=${Math.pow(-a, 3)}$，$(-1)^{${odd}}=-1$。所以原式 $=\\frac{${Math.pow(-a, 3)}\\times ${b}+${c}}{-1}=\\frac{${numerator}}{-1}=${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildPatternNegativePowerPairSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const coeffA = randInt(1, 6);
      const coeffB = randInt(1, 6);
      const n = randInt(1, 12);
      const result = coeffA * Math.pow(-1, 2 * n) + coeffB * Math.pow(-1, 2 * n + 1);
      questions.push(`計算：$${coeffA}(-1)^{2n}+${coeffB}(-1)^{2n+1}$，其中 $n=${n}$。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `因為 $(-1)^{2n}=1$，$(-1)^{2n+1}=-1$，所以原式 $=${coeffA}\\times 1+${coeffB}\\times (-1)=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildPatternAlternatingSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const start = randInt(2, 4);
      const length = randInt(5, 10);
      const end = start + length;
      let total = 0;
      for (let k = start; k <= end; k += 1) total += Math.pow(-1, k);
      questions.push(`計算：$(-1)^{${start}}+(-1)^{${start + 1}}+\\cdots+(-1)^{${end}}$。`);
      summaryAnswers.push(`$${total}$`);
      answers.push(`連續的 $(-1)^k$ 會一正一負配對消去，剩下的只看項數奇偶，所以結果是 $${total}$。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildPatternConsecutiveDifferenceProductSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const start = randInt(1, 10);
      const factors = randInt(6, 20);
      const end = start + factors;
      const result = factors % 2 === 0 ? 1 : -1;
      questions.push(
        `計算：$(${start}-${start + 1})\\times (${start + 1}-${start + 2})\\times \\cdots \\times (${end - 1}-${end})$。`
      );
      summaryAnswers.push(`$${result}$`);
      answers.push(`每一個括號都是 $-1$，一共有 ${factors} 個，所以原式就是 $(-1)^{${factors}}=${result}$。`);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildPatternEvenSumSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const terms = randInt(6, 30);
      const last = 2 * terms;
      const result = terms * (terms + 1);
      questions.push(`計算：$2+4+6+\\cdots+${last}$。`);
      summaryAnswers.push(`$${result}$`);
      answers.push(
        `這是首項 $2$、末項 $${last}$、共有 ${terms} 項的等差數列，所以和是 $\\frac{${terms}(2+${last})}{2}=${result}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildPatternIncrementProductSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const end = randInt(6, 15);
      const result = makeFraction(end + 1, 2);
      const terms = [];
      for (let k = 2; k <= end; k += 1) terms.push(`\\left(1+\\frac{1}{${k}}\\right)`);
      questions.push(`計算：$${terms.join('\\times ')}$。`);
      summaryAnswers.push(`$${fractionToLatex(result, true)}$`);
      answers.push(
        `把每一項改寫成 $\\frac{k+1}{k}$，原式就會變成 $\\frac{3}{2}\\times\\frac{4}{3}\\times\\cdots\\times\\frac{${end + 1}}{${end}}$，前後對消後得到 $${fractionToLatex(result, true)}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ112SubstitutionMixedSet(count) {
    return buildJ112MixedSet(
      [
        buildSubstitutionSquareSumSet,
        buildSubstitutionLinearThreeVarSet,
        buildSubstitutionPowerLinearSet,
        buildSubstitutionProductPlusSet,
        buildSubstitutionPowerDifferenceSet,
      ],
      count
    );
  }

  function buildJ112BracketOrderMixedSet(count) {
    return buildJ112MixedSet(
      [
        buildBracketOrderMulDivAddSet,
        buildBracketOrderBracketDivisionSet,
        buildBracketOrderMultiplyBracketSet,
        buildBracketOrderMixedSet,
        buildBracketOrderNestedSet,
      ],
      count
    );
  }

  function buildJ112PowerMixedSet(count) {
    return buildJ112MixedSet(
      [buildPowerMixedAddProductSet, buildPowerMixedSubtractSet, buildPowerMixedMulDivSet, buildPowerMixedBracketSet],
      count
    );
  }

  function buildJ112AbsoluteMixedSet(count) {
    return buildJ112MixedSet(
      [buildAbsoluteMulAddSet, buildAbsoluteTwoStageMulSet, buildAbsolutePowerProductSet, buildAbsoluteDistanceSumSet],
      count
    );
  }

  function buildJ112FractionMixedSet(count) {
    return buildJ112MixedSet(
      [
        buildFractionIntegerAddSubSet,
        buildFractionSignedMixedSet,
        buildFractionPowerComplexSet,
        buildFractionPowerSignSet,
      ],
      count
    );
  }

  function buildJ112PatternMixedSet(count) {
    return buildJ112MixedSet(
      [
        buildPatternNegativePowerPairSet,
        buildPatternAlternatingSumSet,
        buildPatternConsecutiveDifferenceProductSet,
        buildPatternEvenSumSet,
        buildPatternIncrementProductSet,
      ],
      count
    );
  }

  function buildJ113MixedSet(banks, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const generated = banks[i % banks.length](5);
      const itemIndex = Math.floor(i / banks.length) % generated.questions.length;
      questions.push(generated.questions[itemIndex]);
      summaryAnswers.push(
        Array.isArray(generated.summaryAnswers) ? generated.summaryAnswers[itemIndex] : generated.answers[itemIndex]
      );
      answers.push(generated.answers[itemIndex]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ113ConceptMixedSet(count) {
    return buildJ113MixedSet([buildExponentSignBracketSet], count);
  }

  function buildJ113LawMixedSet(count) {
    return buildJ113MixedSet(
      [buildExponentLawSingleRuleSet, buildExponentLawMixedSet, buildExponentMixedOperationsSet],
      count
    );
  }

  function buildJ113ApplicationMixedSet(count) {
    return buildJ113MixedSet([buildExponentWordProblemSet], count);
  }

  function buildJ113SameBaseMixedSet(count) {
    return buildJ113MixedSet(
      [
        buildJ113SameBaseMultiplySet,
        buildJ113SameBaseDivisionSet,
        buildJ113SameBaseMixedChainSet,
        buildJ113SameBaseRewriteSet,
      ],
      count
    );
  }

  function buildJ113PowerOfPowerMixedSet(count) {
    return buildJ113MixedSet(
      [
        buildJ113PowerOfPowerBasicSet,
        buildJ113PowerOfPowerNegativeBaseSet,
        buildJ113PowerOfPowerValueSet,
        buildJ113PowerOfPowerSignedSet,
      ],
      count
    );
  }

  function buildJ113NegativeExponentMixedSet(count) {
    return buildJ113MixedSet(
      [
        buildJ113NegativeExponentEvaluateSet,
        buildJ113NegativeExponentCompareSet,
        buildJ113NegativeExponentSignedProductSet,
        buildJ113NegativeExponentScientificSet,
        buildJ113ReciprocalValueSet,
      ],
      count
    );
  }

  function buildJ113ParityMixedSet(count) {
    return buildJ113MixedSet(
      [
        buildJ113ParityLinearComboSet,
        buildJ113ParityDifferenceSet,
        buildJ113ParityEvenSumSet,
        buildJ113ParityOddSumSet,
        buildJ113ParitySignJudgeSet,
      ],
      count
    );
  }

  function buildJ113PowerCompareMixedSet(count) {
    return buildJ113MixedSet(
      [
        buildJ113PowerComparePositiveBaseSet,
        buildJ113PowerCompareBracketSet,
        buildJ113PowerCompareUnaryMinusSet,
        buildJ113PowerCompareAbsoluteSet,
        buildJ113PowerCompareParitySet,
      ],
      count
    );
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

  // ─── j1-3-3 新增 generators ───────────────────────────────────────────────

  // 兩數互為相反數：a與b各加相同數x後互為相反數 → (a+x)+(b+x)=0 → x=-(a+b)/2
  function buildJ133OppositeNumberSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { a: 2, b: -4 }, // x=1
      { a: 13, b: -23 }, // x=5
      { a: 3, b: -19 }, // x=8
      { a: 10, b: -34 }, // x=12
      { a: 5, b: -13 }, // x=4
      { a: 7, b: -21 }, // x=7
      { a: 4, b: -16 }, // x=6
      { a: 8, b: -26 }, // x=9
    ];
    for (let i = 0; i < count; i += 1) {
      const { a, b } = cases[i % cases.length];
      const x = -(a + b) / 2;
      const bStr = b < 0 ? `${b}` : `+${b}`;
      questions.push(`將 $${a}$ 與 $${b}$ 兩數各加一個相同的數之後，所得的新兩數互為相反數，求所加的數。`);
      summaryAnswers.push(`$${x}$`);
      answers.push(
        `設所加的數為 $x$，則兩個新數分別是 $${a}+x$ 和 $${b}+x$。互為相反數表示兩數之和為 $0$，所以 $(${a}+x)+(${b}+x)=0$，即 $${a + b}+2x=0$，解得 $x=${x}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 三人連差：甲乙丙共S元，甲比乙多A，乙比丙多B
  // 設丙=x → 乙=x+B, 甲=x+B+A → 3x+A+2B=S → x=(S-A-2B)/3
  function buildJ133ThreePersonChainDiffSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { S: 1406, A: 455, B: 153, c: 215, b: 368, a: 823 },
      { S: 1822, A: 33, B: 254, c: 427, b: 681, a: 714 },
      { S: 1760, A: 286, B: 389, c: 232, b: 621, a: 907 },
      { S: 1048, A: 665, B: 130, c: 41, b: 171, a: 836 },
      { S: 1200, A: 150, B: 100, c: 250, b: 350, a: 600 },
      { S: 900, A: 120, B: 90, c: 200, b: 290, a: 410 },
      { S: 1500, A: 200, B: 100, c: 400, b: 500, a: 600 },
      { S: 2100, A: 300, B: 150, c: 550, b: 700, a: 850 },
    ];
    const contexts = ['儲蓄', '得分', '收入'];
    const units = ['元', '分', '元'];
    for (let i = 0; i < count; i += 1) {
      const { S, A, B, c, b, a } = cases[i % cases.length];
      const ctx = contexts[i % contexts.length];
      const unit = units[i % units.length];
      questions.push(
        `甲、乙、丙三人共${ctx} $${S}$ ${unit}，若甲比乙多 $${A}$ ${unit}，乙比丙多 $${B}$ ${unit}，則甲、乙、丙各${ctx}多少${unit}？`
      );
      summaryAnswers.push(`甲 $${a}$ ${unit}，乙 $${b}$ ${unit}，丙 $${c}$ ${unit}`);
      answers.push(
        `設丙${ctx} $x$ ${unit}，則乙為 $x+${B}$，甲為 $x+${B}+${A}$。三人合計：$x+(x+${B})+(x+${B}+${A})=${S}$，即 $3x+${A + 2 * B}=${S}$，解得 $x=${c}$。所以丙 $${c}$ ${unit}、乙 $${b}$ ${unit}、甲 $${a}$ ${unit}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 猴子香蕉：大猴小猴共N隻，大猴吃3條/隻，每3隻小猴吃2條
  // 設小猴=s → 大猴=N-s → 3(N-s)+(2/3)s=M → 9N-7s=3M → s=(9N-3M)/7
  function buildJ133MonkeyBananaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { N: 32, M: 68, s: 12, g: 20 },
      { N: 24, M: 58, s: 6, g: 18 },
      { N: 58, M: 139, s: 15, g: 43 },
      { N: 29, M: 45, s: 18, g: 11 },
      { N: 13, M: 32, s: 3, g: 10 },
      { N: 18, M: 40, s: 6, g: 12 },
      { N: 24, M: 51, s: 9, g: 15 },
      { N: 41, M: 74, s: 21, g: 20 },
    ];
    for (let i = 0; i < count; i += 1) {
      const { N, M, s, g } = cases[i % cases.length];
      questions.push(
        `大猴與小猴共 $${N}$ 隻，合力吃完 $${M}$ 條香蕉。已知每隻大猴吃 $3$ 條，每 $3$ 隻小猴吃 $2$ 條，求小猴有多少隻。`
      );
      summaryAnswers.push(`小猴 $${s}$ 隻`);
      answers.push(
        `設小猴有 $x$ 隻，則大猴有 $${N}-x$ 隻。大猴共吃 $3(${N}-x)$ 條，小猴共吃 $\\dfrac{2}{3}x$ 條。依題意：$3(${N}-x)+\\dfrac{2}{3}x=${M}$，兩邊乘以 $3$ 得 $9(${N}-x)+2x=3\\times${M}$，化簡為 $${9 * N}-7x=${3 * M}$，解得 $x=${s}$。所以小猴有 $${s}$ 隻，大猴有 $${g}$ 隻。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 兩折扣比較：定價X折賣P元，改Y折應賣多少
  // 定價 = P÷(X/10)；新價 = 定價×(Y/10)
  function buildJ133DoubleDiscountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const items = ['皮衣', '外套', '大衣', '羽絨衣', '風衣', '毛衣'];
    // 定價必須是 20 的倍數才能讓 85折 為整數
    const cases = [
      { list: 11180, d1: 85, p1: 9503, d2: 80, p2: 8944 },
      { list: 8360, d1: 85, p1: 7106, d2: 80, p2: 6688 },
      { list: 8340, d1: 85, p1: 7089, d2: 80, p2: 6672 },
      { list: 8620, d1: 85, p1: 7327, d2: 80, p2: 6896 },
      { list: 5000, d1: 85, p1: 4250, d2: 80, p2: 4000 },
      { list: 6800, d1: 85, p1: 5780, d2: 80, p2: 5440 },
      { list: 7200, d1: 85, p1: 6120, d2: 80, p2: 5760 },
      { list: 8000, d1: 85, p1: 6800, d2: 80, p2: 6400 },
    ];
    for (let i = 0; i < count; i += 1) {
      const { list, d1, p1, d2, p2 } = cases[i % cases.length];
      const item = items[i % items.length];
      questions.push(
        `如果一件${item}照定價 $${d1}$ 折出售，售價是 $${p1}$ 元，那麼若依定價的 $${d2}$ 折出售應賣多少元？`
      );
      summaryAnswers.push(`$${p2}$ 元`);
      answers.push(
        `設定價為 $x$ 元。由 $${d1}$ 折售價可列：$\\dfrac{${d1}}{10}x=${p1}$，解得 $x=${list}$。改成 $${d2}$ 折：$${list}\\times\\dfrac{${d2}}{10}=${p2}$ 元。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 猜數遊戲：Ax - x/2 = Z → x(2A-1)/2 = Z → x = 2Z/(2A-1)
  function buildJ133GuessNumberSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const names = ['小文', '小明', '小華', '小玲', '小傑', '小雅', '小凱', '小芳'];
    const cases = [
      { A: 5, Z: 207, x: 46 },
      { A: 2, Z: 54, x: 36 },
      { A: 7, Z: 26, x: 4 },
      { A: 3, Z: 175, x: 70 },
      { A: 4, Z: 21, x: 6 },
      { A: 6, Z: 55, x: 10 },
      { A: 3, Z: 50, x: 20 },
      { A: 4, Z: 49, x: 14 },
    ];
    for (let i = 0; i < count; i += 1) {
      const { A, Z, x } = cases[i % cases.length];
      const name = names[i % names.length];
      questions.push(
        `${name}心裡想了一個數 $x$，若將此數乘以 $${A}$ 所得的值再減去此數的一半，得到的結果為 $${Z}$，試問${name}心裡想的數為何？`
      );
      summaryAnswers.push(`$${x}$`);
      answers.push(
        `依題意列式：$${A}x-\\dfrac{x}{2}=${Z}$。兩邊乘以 $2$：$${2 * A}x-x=${2 * Z}$，即 $${2 * A - 1}x=${2 * Z}$，解得 $x=${x}$。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 長方形長寬：長=寬×A-B，已知長=L → 寬=(L+B)/A
  function buildJ133RectangleDimensionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { A: 4, B: 2, L: 18, w: 5 },
      { A: 3, B: 2, L: 10, w: 4 },
      { A: 4, B: 8, L: 20, w: 7 },
      { A: 2, B: 1, L: 7, w: 4 },
      { A: 3, B: 3, L: 15, w: 6 },
      { A: 4, B: 4, L: 24, w: 7 },
      { A: 3, B: 1, L: 14, w: 5 },
      { A: 5, B: 5, L: 25, w: 6 },
    ];
    const shapes = ['花圃', '游泳池', '操場', '廣場', '停車場', '農田'];
    for (let i = 0; i < count; i += 1) {
      const { A, B, L, w } = cases[i % cases.length];
      const shape = shapes[i % shapes.length];
      questions.push(`有一個長方形${shape}，長為寬的 $${A}$ 倍少 $${B}$ 公分，若長為 $${L}$ 公分，則寬為多少公分？`);
      summaryAnswers.push(`$${w}$ 公分`);
      answers.push(
        `設寬為 $x$ 公分，則長為 $${A}x-${B}$ 公分。依題意：$${A}x-${B}=${L}$，解得 $x=\\dfrac{${L + B}}{${A}}=${w}$，所以寬為 $${w}$ 公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 倍加型父子年齡：父親=M倍子+K，父親今年F歲 → 子=(F-K)/M
  function buildJ133AgeRatioPlusSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { F: 40, M: 2, K: 8, child: 16 },
      { F: 25, M: 3, K: 13, child: 4 },
      { F: 35, M: 3, K: 14, child: 7 },
      { F: 27, M: 3, K: 3, child: 8 },
      { F: 38, M: 2, K: 4, child: 17 },
      { F: 42, M: 3, K: 9, child: 11 },
      { F: 34, M: 2, K: 8, child: 13 },
      { F: 45, M: 3, K: 6, child: 13 },
    ];
    const childNames = ['小明', '小杰', '小華', '小文', '小凱', '小雅', '小玲', '小傑'];
    const fatherNames = ['父親', '爸爸'];
    for (let i = 0; i < count; i += 1) {
      const { F, M, K, child } = cases[i % cases.length];
      const cName = childNames[i % childNames.length];
      const fName = fatherNames[i % fatherNames.length];
      questions.push(
        `${cName}的${fName}今年 $${F}$ 歲，已知今年${fName}的年齡是${cName}的 $${M}$ 倍多 $${K}$ 歲，試問${cName}今年幾歲？`
      );
      summaryAnswers.push(`$${child}$ 歲`);
      answers.push(
        `設${cName}今年 $x$ 歲。依題意：$${M}x+${K}=${F}$，解得 $x=\\dfrac{${F - K}}{${M}}=${child}$，所以${cName}今年 $${child}$ 歲。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 和倍差體重：甲=M倍乙+K，甲+乙=N → 乙=(N-K)/(M+1)
  function buildJ133WeightCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { M: 2, K: 3, N: 138, lighter: 45, heavier: 93 },
      { M: 2, K: 6, N: 150, lighter: 48, heavier: 102 },
      { M: 2, K: 8, N: 125, lighter: 39, heavier: 86 },
      { M: 2, K: 3, N: 48, lighter: 15, heavier: 33 },
      { M: 2, K: 10, N: 130, lighter: 40, heavier: 90 },
      { M: 3, K: 5, N: 89, lighter: 21, heavier: 68 },
      { M: 2, K: 12, N: 120, lighter: 36, heavier: 84 },
      { M: 3, K: 8, N: 96, lighter: 22, heavier: 74 },
    ];
    const pairNames = [
      ['東翰', '琳達'],
      ['小明', '小華'],
      ['甲', '乙'],
      ['哥哥', '弟弟'],
    ];
    for (let i = 0; i < count; i += 1) {
      const { M, K, N, lighter } = cases[i % cases.length];
      const [heavy, light] = pairNames[i % pairNames.length];
      questions.push(
        `${heavy}的體重比${light}體重的 $${M}$ 倍多 $${K}$ 公斤，如果兩人共重 $${N}$ 公斤，試問${light}的體重為多少公斤？`
      );
      summaryAnswers.push(`$${lighter}$ 公斤`);
      answers.push(
        `設${light}的體重為 $x$ 公斤，則${heavy}的體重為 $${M}x+${K}$ 公斤。依題意：$(${M}x+${K})+x=${N}$，即 $${M + 1}x=${N - K}$，解得 $x=${lighter}$，所以${light}體重為 $${lighter}$ 公斤。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 有一分數：分子比分母小K（D=N+K），分子A倍=分母B倍（AN=BD）
  // → (A-B)N = BK → N = BK/(A-B)
  function buildJ133FindFractionSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const cases = [
      { K: 15, A: 4, B: 1, N: 5, D: 20 }, // 1/4
      { K: 3, A: 4, B: 3, N: 9, D: 12 }, // 3/4
      { K: 15, A: 5, B: 4, N: 60, D: 75 }, // 4/5
      { K: 5, A: 2, B: 1, N: 5, D: 10 }, // 1/2
      { K: 6, A: 3, B: 1, N: 3, D: 9 }, // 1/3
      { K: 4, A: 3, B: 2, N: 8, D: 12 }, // 2/3
      { K: 8, A: 5, B: 3, N: 12, D: 20 }, // 3/5
      { K: 10, A: 5, B: 3, N: 15, D: 25 }, // 3/5
    ];
    for (let i = 0; i < count; i += 1) {
      const { K, A, B, N, D } = cases[i % cases.length];
      const g = gcdInt(N, D);
      const rn = N / g;
      const rd = D / g;
      const fracStr = `\\dfrac{${N}}{${D}}`;
      questions.push(`有一個分數，分子比分母小 $${K}$，且分子的 $${A}$ 倍等於分母的 $${B}$ 倍，求這個分數為何？`);
      summaryAnswers.push(`$\\dfrac{${rn}}{${rd}}$`);
      answers.push(
        `設分子為 $x$，則分母為 $x+${K}$。由分子的 $${A}$ 倍等於分母的 $${B}$ 倍：$${A}x=${B}(x+${K})$，整理得 $${A - B}x=${B * K}$，解得 $x=${N}$。所以分母為 $${N}+${K}=${D}$，此分數為 $${fracStr}$${rn !== N ? `，化簡為 $\\dfrac{${rn}}{${rd}}$` : ``}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 繩子折段差：折成m段每段比折成n段每段長k公尺 → x/m - x/n = k → x = kmn/(n-m)
  // 也含井深變型：折成m段垂入井多a公尺，折成n段多b公尺 → x/m-a=x/n-b → x(n-m)/(mn)=a-b
  function buildJ133RopeFoldingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    const directCases = [
      { m: 4, n: 5, k: 1, x: 20 },
      { m: 3, n: 4, k: 1, x: 12 },
      { m: 4, n: 5, k: 2, x: 40 },
      { m: 3, n: 5, k: 2, x: 15 },
      { m: 5, n: 6, k: 1, x: 30 },
      { m: 3, n: 4, k: 3, x: 36 },
      { m: 4, n: 6, k: 2, x: 24 },
      { m: 2, n: 3, k: 2, x: 12 },
    ];
    const wellCases = [
      { m: 3, n: 4, a: 6, b: 4, x: 24, h: 2 },
      { m: 4, n: 5, a: 5, b: 3, x: 40, h: 5 },
      { m: 5, n: 6, a: 4, b: 2, x: 60, h: 8 },
      { m: 4, n: 6, a: 5, b: 2, x: 36, h: 4 },
      { m: 3, n: 5, a: 5, b: 1, x: 30, h: 5 },
      { m: 3, n: 4, a: 4, b: 2, x: 24, h: 4 },
      { m: 4, n: 5, a: 7, b: 5, x: 40, h: 3 },
      { m: 5, n: 6, a: 6, b: 4, x: 60, h: 6 },
    ];
    const ctxs = ['繩子', '竹竿', '鐵絲'];

    for (let i = 0; i < count; i += 1) {
      const useWell = i % 3 === 2;
      const ci = Math.floor(i / 3);

      if (!useWell) {
        const { m, n, k, x } = directCases[(i % 2 === 0 ? ci : ci + directCases.length / 2) % directCases.length];
        const thing = ctxs[i % ctxs.length];
        questions.push(
          `有一條${thing}，把它折成相等的 $${m}$ 段後，每段長比折成相等的 $${n}$ 段後的每段長多 $${k}$ 公尺，請問這條${thing}有多少公尺？`
        );
        summaryAnswers.push(`$${x}$ 公尺`);
        answers.push(
          `設${thing}長 $x$ 公尺。折成 $${m}$ 段每段長 $\\dfrac{x}{${m}}$，折成 $${n}$ 段每段長 $\\dfrac{x}{${n}}$。依題意：$\\dfrac{x}{${m}}-\\dfrac{x}{${n}}=${k}$，通分得 $\\dfrac{${n - m}x}{${m * n}}=${k}$，解得 $x=${x}$，所以這條${thing}長 $${x}$ 公尺。`
        );
      } else {
        const { m, n, a, b, x, h } = wellCases[ci % wellCases.length];
        questions.push(
          `有一口井，將一條繩子折成 $${m}$ 段後垂入井中，繩子多出 $${a}$ 公尺；若將繩子折成 $${n}$ 段後垂入，則多出 $${b}$ 公尺，請問這條繩子有多長？（繩長以公尺為單位）`
        );
        summaryAnswers.push(`$${x}$ 公尺`);
        answers.push(
          `設繩長 $x$ 公尺，井深 $H$ 公尺。折成 $${m}$ 段：$\\dfrac{x}{${m}}-${a}=H$；折成 $${n}$ 段：$\\dfrac{x}{${n}}-${b}=H$。兩式相減得 $\\dfrac{x}{${m}}-\\dfrac{x}{${n}}=${a}-${b}$，即 $\\dfrac{${n - m}x}{${m * n}}=${a - b}$，解得 $x=${x}$，井深 $H=\\dfrac{${x}}{${m}}-${a}=${h}$ 公尺。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // 蠟燭燃燒：甲a小時燃完，乙b小時燃完，同時點燃t小時後甲剩=k×乙剩
  // (1-t/a) = k(1-t/b) → t = (k-1)ab/(ka-b)
  function buildJ133CandleBurnSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    // [a, b, k, t_num, t_den] → t = t_num/t_den 小時 = t_num*60/t_den 分鐘
    const cases = [
      { a: 3, b: 1, k: 3, tNum: 3, tDen: 4 }, // t=45min
      { a: 3, b: 2, k: 2, tNum: 3, tDen: 2 }, // t=90min (不到任何一支燃完)
      { a: 6, b: 3, k: 2, tNum: 2, tDen: 1 }, // t=2hr
      { a: 4, b: 2, k: 2, tNum: 4, tDen: 3 }, // t=80min
      { a: 6, b: 2, k: 3, tNum: 3, tDen: 2 }, // t=90min
      { a: 6, b: 4, k: 2, tNum: 3, tDen: 1 }, // t=3hr
      { a: 4, b: 1, k: 4, tNum: 4, tDen: 5 }, // t=48min
      { a: 5, b: 2, k: 4, tNum: 10, tDen: 9 }, // t≈66.7min
    ];

    for (let i = 0; i < count; i += 1) {
      const { a, b, k, tNum, tDen } = cases[i % cases.length];
      const tMinutes = (tNum * 60) / tDen;
      const tStr = Number.isInteger(tMinutes)
        ? `${tMinutes} 分鐘`
        : `${tNum}/${tDen} 小時（約 ${Math.round(tMinutes)} 分鐘）`;
      const tLatex = tDen === 1 ? `${tNum}` : `\\dfrac{${tNum}}{${tDen}}`;

      questions.push(
        `有兩支等高的蠟燭，甲蠟燭可燃燒 $${a}$ 小時，乙蠟燭可燃燒 $${b}$ 小時，兩支同時點燃，設燃燒後甲蠟燭的剩餘高度是乙蠟燭剩餘高度的 $${k}$ 倍，則兩支蠟燭同時點燃後幾分鐘達到此狀態？`
      );
      summaryAnswers.push(`${tStr}`);
      answers.push(
        `設燃燒了 $t$ 小時。甲蠟燭的剩餘比例為 $1-\\dfrac{t}{${a}}$，乙蠟燭的剩餘比例為 $1-\\dfrac{t}{${b}}$。依題意：$1-\\dfrac{t}{${a}}=${k}\\left(1-\\dfrac{t}{${b}}\\right)$，展開得 $1-\\dfrac{t}{${a}}=${k}-\\dfrac{${k}t}{${b}}$，整理得 $\\dfrac{${k}t}{${b}}-\\dfrac{t}{${a}}=${k}-1$，即 $t\\left(\\dfrac{${k}}{${b}}-\\dfrac{1}{${a}}\\right)=${k - 1}$，解得 $t=${tLatex}$ 小時，即 $${tStr}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // 圓形跑道反向：甲跑一圈需A秒，乙與甲反向，每B秒相遇一次
  // 每B秒兩人合走一整圈：1/A + 1/T = 1/B → T = AB/(A-B)
  function buildJ133CircularTrackSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    const cases = [
      { A: 40, B: 15, T: 24 },
      { A: 60, B: 20, T: 30 },
      { A: 30, B: 10, T: 15 },
      { A: 48, B: 12, T: 16 },
      { A: 36, B: 9, T: 12 },
      { A: 60, B: 15, T: 20 },
      { A: 24, B: 8, T: 12 },
      { A: 40, B: 8, T: 10 },
    ];
    const nameA = ['甲', '小明', '阿真', '阿宏'];
    const nameB = ['乙', '小華', '阿宏', '阿真'];

    for (let i = 0; i < count; i += 1) {
      const { A, B, T } = cases[i % cases.length];
      const na = nameA[i % nameA.length];
      const nb = nameB[i % nameB.length];

      questions.push(
        `有一個圓形跑道，${na}跑完一圈需 $${A}$ 秒。${nb}以固定速率與${na}反向跑，每隔 $${B}$ 秒就與${na}相遇一次，請問${nb}跑完一圈需幾秒？`
      );
      summaryAnswers.push(`$${T}$ 秒`);
      answers.push(
        `設${nb}跑完一圈需 $t$ 秒。每隔 $${B}$ 秒兩人相遇，表示這 $${B}$ 秒內兩人合計恰好走完一圈，即 $\\dfrac{${B}}{${A}}+\\dfrac{${B}}{t}=1$，整理得 $\\dfrac{${B}}{t}=1-\\dfrac{${B}}{${A}}=\\dfrac{${A - B}}{${A}}$，解得 $t=\\dfrac{${B}\\times${A}}{${A - B}}=${T}$ 秒。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // 連取分數型：糖果共n個，甲取一半少a₁，乙取剩下一半多a₂，丙取剩下一半少a₃，丁得R個
  // n = 8R - 8a₃ + 4a₂ - 2a₁
  function buildJ133ChainFractionTakeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    // [a1, a2, a3, R, n]
    const cases = [
      { a1: 4, a2: 2, a3: 1, R: 6, n: 40 },
      { a1: 2, a2: 3, a3: 2, R: 5, n: 32 },
      { a1: 6, a2: 4, a3: 1, R: 8, n: 60 },
      { a1: 4, a2: 1, a3: 2, R: 7, n: 36 },
      { a1: 2, a2: 4, a3: 2, R: 6, n: 44 },
      { a1: 5, a2: 3, a3: 1, R: 8, n: 58 },
      { a1: 4, a2: 3, a3: 2, R: 5, n: 28 },
      { a1: 3, a2: 4, a3: 1, R: 10, n: 82 },
    ];
    const personA = ['甲', '大明', '阿強', '志明'];
    const personB = ['乙', '小華', '阿偉', '春嬌'];
    const personC = ['丙', '小玲', '阿美', '阿翔'];
    const personD = ['丁', '小李', '小陳', '阿風'];
    // [unit量詞, name物品名]
    const things = [
      { unit: '顆', name: '糖果' },
      { unit: '個', name: '橘子' },
      { unit: '顆', name: '葡萄' },
      { unit: '塊', name: '餅乾' },
    ];

    for (let i = 0; i < count; i += 1) {
      const { a1, a2, a3, R, n } = cases[i % cases.length];
      const pA = personA[i % personA.length];
      const pB = personB[i % personB.length];
      const pC = personC[i % personC.length];
      const pD = personD[i % personD.length];
      const { unit, name } = things[i % things.length];

      // Compute step-by-step remainders for answer
      const afterA = n / 2 + a1; // remain after A
      const afterB = afterA / 2 - a2; // remain after B
      const afterC = afterB / 2 + a3; // remain after C = R

      questions.push(
        `桌上有若干${unit}${name}。${pA}先取走全部的一半少 $${a1}$ ${unit}；${pB}再取走剩下的一半多 $${a2}$ ${unit}；${pC}再取走剩下的一半少 $${a3}$ ${unit}；最後剩下的 $${R}$ ${unit}全給${pD}。請問桌上原有幾${unit}${name}？`
      );
      summaryAnswers.push(`$${n}$ ${unit}`);
      answers.push(
        `設原有 $x$ ${unit}${name}。${pA}取走 $\\dfrac{x}{2}-${a1}$，剩下 $\\dfrac{x}{2}+${a1}$。${pB}取走 $\\dfrac{1}{2}\\left(\\dfrac{x}{2}+${a1}\\right)+${a2}$，剩下 $\\dfrac{x}{4}+${a1 / 2}-${a2}=\\dfrac{x}{4}+${a1 / 2 - a2}$。${pC}取走 $\\dfrac{1}{2}\\left(\\dfrac{x}{4}+${a1 / 2 - a2}\\right)-${a3}$，剩下 $\\dfrac{x}{8}+${(a1 / 2 - a2) / 2}+${a3}=\\dfrac{x}{8}+${(a1 / 2 - a2) / 2 + a3}$。由 $\\dfrac{x}{8}+${(a1 / 2 - a2) / 2 + a3}=${R}$，兩邊乘以 $8$：$x+${8 * ((a1 / 2 - a2) / 2 + a3)}=${8 * R}$，解得 $x=${n}$，原有 $${n}$ ${unit}${name}。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // 月曆方框問題：框住相鄰日期，給出和，求某一格
  function buildJ133CalendarBlockSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      const variant = i % 4;

      if (variant === 0) {
        // 橫向兩格 a, a+1，和為S
        const a = randInt(1, 27);
        const S = a + (a + 1);
        questions.push(
          `在月曆上用長方形框住相鄰的兩個日期 $a$ 和 $b$，已知 $b$ 在 $a$ 的右邊（相差 1），且 $a+b=${S}$，請問 $b$ 等於多少？`
        );
        summaryAnswers.push(`$${a + 1}$`);
        answers.push(
          `由題意 $b=a+1$。代入 $a+b=${S}$：$a+(a+1)=${S}$，得 $2a+1=${S}$，解得 $a=${a}$，所以 $b=${a + 1}$。`
        );
        continue;
      }

      if (variant === 1) {
        // 縱向兩格 a, a+7，和為S
        const a = randInt(1, 21);
        const S = a + (a + 7);
        questions.push(
          `在月曆上，$a$ 和 $b$ 是上下相鄰的兩個日期（$b$ 在 $a$ 正下方，相差 7 天），若 $a+b=${S}$，請問 $a$ 是幾號？`
        );
        summaryAnswers.push(`$${a}$ 號`);
        answers.push(
          `由題意 $b=a+7$。代入 $a+b=${S}$：$a+(a+7)=${S}$，得 $2a+7=${S}$，解得 $a=${a}$，即 $a$ 是 $${a}$ 號。`
        );
        continue;
      }

      if (variant === 2) {
        // 2×2 方塊 a, a+1, a+7, a+8，和為S
        const a = randInt(1, 20);
        const S = 4 * a + 16;
        questions.push(
          `在月曆上用長方形框住 $2\\times 2$ 的四個日期：$a,\\ a+1,\\ a+7,\\ a+8$，若四數之和為 $${S}$，請問最小的數 $a$ 是幾號？又 $a+8$ 等於幾號？`
        );
        summaryAnswers.push(`$a=${a}$ 號，$a+8=${a + 8}$ 號`);
        answers.push(
          `四個日期為 $a,\\ a+1,\\ a+7,\\ a+8$，其和為 $4a+16=${S}$，解得 $a=${a}$，所以最小的數為 $${a}$ 號，最大的數 $a+8=${a + 8}$ 號。`
        );
        continue;
      }

      // 縱向三格 a, a+7, a+14，和為S
      const a = randInt(1, 14);
      const S = 3 * a + 21;
      questions.push(
        `在月曆上同一直行連續三個日期分別為 $a,\\ b,\\ c$（每格差 7 天），若三數之和為 $${S}$，請問中間的數 $b$ 等於幾號？`
      );
      summaryAnswers.push(`$${a + 7}$ 號`);
      answers.push(
        `設最小的日期為 $a$，則三數為 $a,\\ a+7,\\ a+14$，和為 $3a+21=${S}$，解得 $a=${a}$，所以中間的數 $b=a+7=${a + 7}$ 號。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // 四位數移位問題：首位數字d，移到末位，新數=k×原數+c
  // 原數=1000d+n，新數=10n+d → 10n+d = k(1000d+n)+c → n = (d(1000k-1)+c)/(10-k)
  function buildJ133DigitSwapSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    const cases = [
      { d: 1, k: 5, c: -74, original: 1985, newNum: 9851, verb: '少', absC: 74 },
      { d: 1, k: 4, c: 3, original: 1667, newNum: 6671, verb: '多', absC: 3 },
      { d: 1, k: 3, c: 4, original: 1429, newNum: 4291, verb: '多', absC: 4 },
      { d: 2, k: 3, c: 1, original: 2857, newNum: 8572, verb: '多', absC: 1 },
      { d: 1, k: 5, c: -9, original: 1998, newNum: 9981, verb: '少', absC: 9 },
      { d: 1, k: 4, c: -13, original: 1699, newNum: 6991, verb: '少', absC: 13 },
      { d: 1, k: 5, c: -24, original: 1975, newNum: 9751, verb: '少', absC: 24 },
      { d: 3, k: 2, c: 4, original: 3634, newNum: 6343, verb: '多', absC: 4 },
    ];

    for (let i = 0; i < count; i += 1) {
      const { d, k, c, original, newNum, verb, absC } = cases[i % cases.length];
      const cPart = absC === 0 ? '' : `${verb} $${absC}$，`;
      const eq = c >= 0 ? `${k}×原數+${c}` : `${k}×原數-${Math.abs(c)}`;

      questions.push(
        `有一個四位數，最高位（最左端）的數字是 $${d}$，若將 $${d}$ 移到最右端（個位），所得新四位數比原四位數的 $${k}$ 倍${verb} $${absC}$，請問原四位數是多少？`
      );
      summaryAnswers.push(`$${original}$`);
      answers.push(
        `設原四位數最後三位組成的三位數為 $n$，則原四位數 $=${d}000+n$，移動後新四位數 $=10n+${d}$。依題意：$10n+${d}=${eq}$，展開得 $10n+${d}=${k}\\times${d}000+${k}n${c >= 0 ? '+' + c : c}$，整理得 $${10 - k}n=${k * d * 1000 + c - d}$，解得 $n=${original - d * 1000}$，所以原四位數為 $${d}${original - d * 1000 < 100 ? '0' : ''}${original - d * 1000}=${original}$。`
      );
    }

    return { questions, summaryAnswers, answers };
  }

  // ─── j1-3-3 新增 generators 結束 ─────────────────────────────────────────

  // ─── j1-2-1/2/3 文件題型補充 generators ─────────────────────────────────

  // 質數辨識（j1-2-1）
  function buildPrimeIdentifySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    const trickComposites = [
      49, 51, 57, 77, 91, 111, 119, 121, 143, 161, 169, 187, 203, 209, 221, 247, 253, 287, 299, 301, 319, 323,
    ];
    const verifyPrimes = [
      53, 59, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173,
      179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307,
      311, 313, 317,
    ];

    function factorHint(n) {
      for (let p = 2; p * p <= n; p++) {
        if (n % p === 0) return `$${n}=${p}\\times${n / p}$`;
      }
      return `${n}`;
    }

    const lbs = ['(A)', '(B)', '(C)', '(D)'];

    for (let i = 0; i < count; i++) {
      const mode = i % 3;

      if (mode === 0) {
        const p = verifyPrimes[randInt(0, verifyPrimes.length - 1)];
        const composites = shuffle(trickComposites.filter((c) => c !== p)).slice(0, 3);
        const candidates = shuffle([p, ...composites]);
        const ansLabel = lbs[candidates.indexOf(p)];
        questions.push(`下列哪一個數是質數？${lbs.map((l, j) => `${l} ${candidates[j]}`).join('  ')}`);
        summaryAnswers.push(`${ansLabel} ${p}`);
        answers.push(
          `${p} 無法被 2 到 $\\sqrt{${p}}$ 間的所有質數整除，故 ${p} 是質數；${composites.map((c) => `${c}：${factorHint(c)}`).join('，')} 均為合數。`
        );
      } else if (mode === 1) {
        const usePrime = randInt(0, 1) === 1;
        const n = usePrime
          ? verifyPrimes[randInt(0, verifyPrimes.length - 1)]
          : trickComposites[randInt(0, trickComposites.length - 1)];
        questions.push(`${n} 是質數嗎？請說明理由。`);
        if (usePrime) {
          summaryAnswers.push('是質數');
          answers.push(`對 2、3、5、7 等依序試除，均不能整除 ${n}，故 ${n} 是質數。`);
        } else {
          summaryAnswers.push('不是質數（合數）');
          answers.push(`因為 ${factorHint(n)}，能被整除，所以 ${n} 是合數，不是質數。`);
        }
      } else {
        const c = trickComposites[randInt(0, trickComposites.length - 1)];
        const primes = shuffle(verifyPrimes.filter((p) => p !== c)).slice(0, 3);
        const candidates = shuffle([c, ...primes]);
        const ansLabel = lbs[candidates.indexOf(c)];
        questions.push(`下列哪一個數不是質數？${lbs.map((l, j) => `${l} ${candidates[j]}`).join('  ')}`);
        summaryAnswers.push(`${ansLabel} ${c}`);
        answers.push(`${factorHint(c)}，故 ${c} 是合數，不是質數；${primes.join('、')} 均為質數。`);
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // 整除規則缺位數字（j1-2-1）
  function buildDivisibilityDigitFillSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    const divisorSpecs = [
      {
        k: 3,
        rule: '各位數字之和為 3 的倍數',
        test(digs) {
          return digs.reduce((s, d) => s + d, 0) % 3 === 0;
        },
      },
      {
        k: 9,
        rule: '各位數字之和為 9 的倍數',
        test(digs) {
          return digs.reduce((s, d) => s + d, 0) % 9 === 0;
        },
      },
      {
        k: 4,
        rule: '末兩位數字組成的數為 4 的倍數',
        test(digs) {
          const n = digs.length;
          return (digs[n - 2] * 10 + digs[n - 1]) % 4 === 0;
        },
      },
      {
        k: 8,
        rule: '末三位數字組成的數為 8 的倍數',
        test(digs) {
          const n = digs.length;
          return (digs[n - 3] * 100 + digs[n - 2] * 10 + digs[n - 1]) % 8 === 0;
        },
      },
      {
        k: 11,
        rule: '從右到左奇偶位交錯和差為 11 的倍數（含 0）',
        test(digs) {
          const n = digs.length;
          const alt = digs.reduce((s, d, idx) => {
            const fromRight = n - 1 - idx;
            return s + (fromRight % 2 === 0 ? d : -d);
          }, 0);
          return alt % 11 === 0;
        },
      },
    ];

    for (let attempt = 0, i = 0; i < count && attempt < count * 30; attempt++) {
      const spec = divisorSpecs[randInt(0, divisorSpecs.length - 1)];
      const use5 = randInt(0, 1) === 1;
      const len = use5 ? 5 : 4;

      let pos;
      if (spec.k === 4) {
        pos = len - 1 - randInt(0, 1);
      } else if (spec.k === 8) {
        pos = len - 1 - randInt(0, 2);
      } else {
        pos = randInt(0, len - 1);
      }

      const digs = [];
      for (let j = 0; j < len; j++) {
        digs.push(j === 0 ? randInt(1, 9) : randInt(0, 9));
      }

      const validDigits = [];
      for (let d = 0; d <= 9; d++) {
        if (pos === 0 && d === 0) continue;
        const test = digs.slice();
        test[pos] = d;
        if (spec.test(test)) validDigits.push(d);
      }

      if (validDigits.length === 0 || validDigits.length > 4) continue;

      const displayArr = digs.map((d, j) => (j === pos ? '□' : String(d)));
      const displayNum = displayArr.join('');
      const digitStr = validDigits.join(' 或 ');
      const numStr = use5 ? '五' : '四';

      questions.push(`${numStr}位數 ${displayNum} 是 ${spec.k} 的倍數，則 □ = ？`);
      summaryAnswers.push(`□ = ${digitStr}`);
      answers.push(`由整除 ${spec.k} 的規則（${spec.rule}）代入可知，□ = ${digitStr}。`);
      i++;
    }

    return { questions, summaryAnswers, answers };
  }

  // 範圍倍數計數（j1-2-1）
  function buildMultipleCountRangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    const rangePairs = [
      [1, 100],
      [1, 150],
      [1, 200],
      [50, 200],
      [100, 300],
      [1, 300],
      [101, 200],
      [201, 400],
      [1, 500],
      [100, 500],
    ];
    const divs = [3, 4, 5, 6, 7, 8, 9, 11, 12];

    for (let i = 0; i < count; i++) {
      const mode = i % 3;
      const [a, b] = rangePairs[randInt(0, rangePairs.length - 1)];
      const k = divs[randInt(0, divs.length - 1)];

      if (mode === 0) {
        const cnt = Math.floor(b / k) - Math.floor((a - 1) / k);
        const smallest = Math.ceil(a / k) * k;
        const largest = Math.floor(b / k) * k;
        questions.push(`從 ${a} 到 ${b} 的整數中，${k} 的倍數共有幾個？`);
        summaryAnswers.push(`${cnt} 個`);
        answers.push(
          `最小的 ${k} 倍數為 ${smallest}，最大為 ${largest}，共 $${Math.floor(b / k)}-${Math.floor((a - 1) / k)}=${cnt}$ 個。`
        );
      } else if (mode === 1) {
        const r = randInt(1, k - 1);
        const cnt = Math.floor((b - r) / k) - Math.floor((a - 1 - r) / k);
        if (cnt < 1) {
          i--;
          continue;
        }
        questions.push(`從 ${a} 到 ${b} 的整數中，除以 ${k} 餘 ${r} 的數共有幾個？`);
        summaryAnswers.push(`${cnt} 個`);
        answers.push(
          `這些數形如 $${k}n+${r}$。在 [${a}, ${b}] 內，$n$ 從 $${Math.ceil((a - r) / k)}$ 到 $${Math.floor((b - r) / k)}$，共 ${cnt} 個。`
        );
      } else {
        const otherDivs = divs.filter((d) => d !== k);
        const j = otherDivs[randInt(0, otherDivs.length - 1)];
        const lcmJK = lcm(j, k);
        const multJ = Math.floor(b / j) - Math.floor((a - 1) / j);
        const multBoth = Math.floor(b / lcmJK) - Math.floor((a - 1) / lcmJK);
        const result = multJ - multBoth;
        questions.push(`從 ${a} 到 ${b} 的整數中，是 ${j} 的倍數但不是 ${k} 的倍數，共有幾個？`);
        summaryAnswers.push(`${result} 個`);
        answers.push(
          `${j} 的倍數有 ${multJ} 個；同時是 ${j} 與 ${k} 公倍數（即 ${lcmJK} 的倍數）有 ${multBoth} 個；所以結果為 $${multJ}-${multBoth}=${result}$ 個。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // 互質判別（j1-2-2）
  function buildCoprimeIdentifySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    const baseNums = [12, 15, 18, 20, 24, 28, 30, 35, 36, 42, 45, 48, 56, 60, 70, 72, 84];
    const lbs = ['(A)', '(B)', '(C)', '(D)'];

    for (let i = 0; i < count; i++) {
      const mode = i % 3;
      const n = baseNums[randInt(0, baseNums.length - 1)];
      const factText = formatPrimeFactorization(primeFactorize(n));

      if (mode === 0) {
        const m = randInt(2, 120);
        const g = gcd(n, m);
        questions.push(`判斷 ${n} 與 ${m} 是否互質。`);
        summaryAnswers.push(g === 1 ? '互質' : `不互質（公因數有 ${g} 等）`);
        if (g === 1) {
          answers.push(`$(${n},${m})=${g}=1$，兩數無共同質因數，故互質。`);
        } else {
          answers.push(`$(${n},${m})=${g}\\neq 1$，有公因數 ${g}，故不互質。`);
        }
      } else if (mode === 1) {
        // Try to get exactly 1 coprime candidate out of 4
        let attempts = 0;
        let candidates = null;
        while (attempts < 50) {
          attempts++;
          const pool = [];
          const seen = new Set();
          while (pool.length < 4) {
            const c = randInt(2, 100);
            if (!seen.has(c)) {
              seen.add(c);
              pool.push(c);
            }
          }
          const cops = pool.filter((c) => gcd(c, n) === 1);
          if (cops.length === 1) {
            candidates = pool;
            break;
          }
        }
        if (!candidates) {
          i--;
          continue;
        }
        const answer = candidates.filter((c) => gcd(c, n) === 1)[0];
        const shuffled = shuffle(candidates);
        const ansIdx = shuffled.indexOf(answer);
        questions.push(`下列哪一個數與 ${n} 互質？${lbs.map((l, j) => `${l} ${shuffled[j]}`).join('  ')}`);
        summaryAnswers.push(`${lbs[ansIdx]} ${answer}`);
        answers.push(
          `${n} 的標準分解式為 $${factText}$；$(${n},${answer})=1$，故 ${answer} 與 ${n} 互質，其餘選項均與 ${n} 有公因數。`
        );
      } else {
        const sample = [];
        const seen = new Set();
        while (sample.length < 5) {
          const x = randInt(2, n + 20);
          if (!seen.has(x) && x !== n) {
            seen.add(x);
            sample.push(x);
          }
        }
        const copCount = sample.filter((c) => gcd(c, n) === 1).length;
        questions.push(`在 ${sample.join('、')} 這 5 個數中，有幾個與 ${n} 互質？`);
        summaryAnswers.push(`${copCount} 個`);
        const detail = sample.map((c) => `${c}（$(${n},${c})=${gcd(c, n)}$）`).join('、');
        answers.push(`逐一計算：${detail}。最大公因數為 1 的共 ${copCount} 個。`);
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // 公因數個數計算（j1-2-2）
  function buildCommonDivisorsCountSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    const pairs = [
      [12, 18],
      [24, 36],
      [30, 45],
      [36, 48],
      [18, 24],
      [60, 84],
      [72, 96],
      [48, 60],
      [42, 56],
      [90, 120],
      [24, 60],
      [36, 60],
      [45, 75],
      [48, 72],
      [30, 42],
    ];

    for (let i = 0; i < count; i++) {
      const mode = i % 2;
      const [a, b] = pairs[randInt(0, pairs.length - 1)];
      const g = gcd(a, b);
      const commonDivs = divisorsOf(g);
      const cnt = commonDivs.length;

      if (mode === 0) {
        questions.push(`${a} 與 ${b} 共有幾個公因數？`);
        summaryAnswers.push(`${cnt} 個`);
        answers.push(
          `先求最大公因數：$(${a},${b})=${g}$；兩數的所有公因數就是 ${g} 的所有因數，共 ${cnt} 個：$${commonDivs.join('、')}$。`
        );
      } else {
        questions.push(`列出 ${a} 與 ${b} 的所有公因數。`);
        summaryAnswers.push(`$${commonDivs.join('、')}$`);
        answers.push(`$(${a},${b})=${g}$，公因數即 ${g} 的所有正因數：$${commonDivs.join('、')}$，共 ${cnt} 個。`);
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // 分數大小比較（j1-2-3）
  function buildFractionCompareSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    function fracTeX(n, d) {
      const r = reduceFraction(n, d);
      if (r.denominator === 1) return `${r.numerator}`;
      const sign = r.numerator < 0 ? '-' : '';
      return `${sign}\\dfrac{${Math.abs(r.numerator)}}{${r.denominator}}`;
    }
    function fracVal(n, d) {
      return n / d;
    }

    const posSets = [
      [
        [1, 2],
        [2, 3],
        [3, 5],
      ],
      [
        [3, 4],
        [5, 7],
        [7, 10],
      ],
      [
        [4, 9],
        [5, 11],
        [3, 7],
      ],
      [
        [2, 5],
        [3, 8],
        [4, 11],
      ],
      [
        [5, 6],
        [7, 9],
        [11, 15],
      ],
      [
        [1, 3],
        [2, 7],
        [3, 10],
      ],
      [
        [7, 8],
        [9, 10],
        [11, 12],
      ],
      [
        [3, 7],
        [4, 9],
        [5, 11],
      ],
    ];
    const negSets = [
      [
        [-1, 3],
        [-2, 5],
        [-3, 8],
      ],
      [
        [-5, 6],
        [-7, 9],
        [-4, 7],
      ],
      [
        [-2, 3],
        [-3, 4],
        [-5, 8],
      ],
      [
        [-1, 4],
        [-2, 7],
        [-3, 10],
      ],
    ];
    const mixedSets = [
      [
        [-1, 2],
        [1, 3],
        [-2, 3],
      ],
      [
        [3, 4],
        [-1, 2],
        [2, 5],
      ],
      [
        [-3, 7],
        [2, 5],
        [-1, 3],
      ],
    ];

    for (let i = 0; i < count; i++) {
      const mode = i % 3;

      if (mode === 0) {
        const set = posSets[randInt(0, posSets.length - 1)];
        const sorted = set.slice().sort((x, y) => fracVal(y[0], y[1]) - fracVal(x[0], x[1]));
        const lcmD = lcm(lcm(set[0][1], set[1][1]), set[2][1]);
        const expanded = set.map(([n, d]) => `$${fracTeX(n, d)}=\\dfrac{${n * (lcmD / d)}}{${lcmD}}$`).join('，');
        questions.push(`將以下三個分數由大到小排列：$${set.map(([n, d]) => fracTeX(n, d)).join('$、$')}$`);
        summaryAnswers.push(`$${sorted.map(([n, d]) => fracTeX(n, d)).join('>')}$`);
        answers.push(
          `通分（公分母 ${lcmD}）：${expanded}；由大到小為 $${sorted.map(([n, d]) => fracTeX(n, d)).join('>')}$。`
        );
      } else if (mode === 1) {
        const set = negSets[randInt(0, negSets.length - 1)];
        const sorted = set.slice().sort((x, y) => fracVal(y[0], y[1]) - fracVal(x[0], x[1]));
        const lcmD = lcm(lcm(Math.abs(set[0][1]), Math.abs(set[1][1])), Math.abs(set[2][1]));
        const expanded = set
          .map(([n, d]) => {
            const nd = Math.abs(d);
            return `$${fracTeX(n, d)}=\\dfrac{${n * (lcmD / nd)}}{${lcmD}}$`;
          })
          .join('，');
        questions.push(`將以下三個負分數由大到小排列：$${set.map(([n, d]) => fracTeX(n, d)).join('$、$')}$`);
        summaryAnswers.push(`$${sorted.map(([n, d]) => fracTeX(n, d)).join('>')}$`);
        answers.push(
          `負分數中絕對值較小者數值較大。通分：${expanded}；由大到小為 $${sorted.map(([n, d]) => fracTeX(n, d)).join('>')}$。`
        );
      } else {
        const set = mixedSets[randInt(0, mixedSets.length - 1)];
        const sorted = set.slice().sort((x, y) => fracVal(y[0], y[1]) - fracVal(x[0], x[1]));
        questions.push(`比較以下三個數的大小，由大到小排列：$${set.map(([n, d]) => fracTeX(n, d)).join('$、$')}$`);
        summaryAnswers.push(`$${sorted.map(([n, d]) => fracTeX(n, d)).join('>')}$`);
        const posNums = set
          .filter(([n]) => n > 0)
          .map(([n, d]) => `$${fracTeX(n, d)}$`)
          .join('、');
        const negNums = set
          .filter(([n]) => n < 0)
          .map(([n, d]) => `$${fracTeX(n, d)}$`)
          .join('、');
        answers.push(
          `正數（${posNums || '無'}）大於負數（${negNums || '無'}）；由大到小為 $${sorted.map(([n, d]) => fracTeX(n, d)).join('>')}$。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // 分數化簡（j1-2-3）
  function buildFractionSimplifySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    const toSimplify = [
      [4, 6],
      [6, 9],
      [8, 12],
      [6, 10],
      [9, 12],
      [10, 15],
      [12, 16],
      [15, 20],
      [6, 14],
      [9, 15],
      [10, 25],
      [8, 20],
      [12, 18],
      [14, 21],
      [15, 25],
      [16, 24],
      [18, 24],
      [20, 30],
      [24, 36],
      [18, 30],
      [12, 20],
      [15, 35],
      [21, 28],
      [22, 33],
    ];
    const alreadySimplified = [
      [3, 7],
      [5, 8],
      [4, 9],
      [7, 11],
      [5, 12],
      [3, 11],
      [7, 13],
      [8, 15],
      [5, 9],
      [7, 10],
      [4, 7],
      [9, 14],
      [11, 15],
      [7, 16],
      [5, 11],
      [8, 13],
    ];
    const lbs = ['(A)', '(B)', '(C)', '(D)'];

    for (let i = 0; i < count; i++) {
      const mode = i % 2;

      if (mode === 0) {
        const [n, d] = toSimplify[randInt(0, toSimplify.length - 1)];
        const useNeg = randInt(0, 1) === 1;
        const fn = useNeg ? -n : n;
        const g = gcd(n, d);
        questions.push(`將 $${formatFraction(fn, d)}$ 化為最簡分數。`);
        summaryAnswers.push(`$${formatFraction(fn / g, d / g)}$`);
        answers.push(
          `$\\gcd(${n},${d})=${g}$，分子分母同除 ${g}，得 $${formatFraction(fn, d)}=${formatFraction(fn / g, d / g)}$。`
        );
      } else {
        const correct = alreadySimplified[randInt(0, alreadySimplified.length - 1)];
        const wrongPool = toSimplify.filter(([n, d]) => gcd(n, d) > 1);
        const wrongs = shuffle(wrongPool).slice(0, 3);
        const arr = shuffle([correct, ...wrongs]);
        const ansIdx = arr.findIndex(([n, d]) => n === correct[0] && d === correct[1]);
        questions.push(
          `下列哪一個分數是最簡分數？${lbs.map((l, j) => `${l} $${formatFraction(arr[j][0], arr[j][1])}$`).join('  ')}`
        );
        summaryAnswers.push(`${lbs[ansIdx]} $${formatFraction(correct[0], correct[1])}$`);
        answers.push(
          `$\\gcd(${correct[0]},${correct[1]})=1$，故 $${formatFraction(correct[0], correct[1])}$ 是最簡分數；其餘選項分子分母仍有大於 1 的公因數。`
        );
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // 倒數概念與計算（j1-2-3）
  function buildFractionReciprocalSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];

    const simpleFracs = [
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [3, 7],
      [5, 8],
      [7, 9],
      [2, 5],
      [3, 5],
      [4, 7],
      [5, 7],
      [7, 8],
      [2, 7],
      [5, 9],
      [7, 11],
      [3, 8],
    ];
    const mixedNums = [
      [1, 1, 2],
      [2, 1, 3],
      [1, 2, 3],
      [3, 1, 4],
      [2, 3, 4],
      [1, 3, 4],
      [2, 1, 5],
      [1, 3, 5],
      [4, 1, 2],
      [3, 2, 3],
    ];

    for (let i = 0; i < count; i++) {
      const mode = i % 3;

      if (mode === 0) {
        const [n, d] = simpleFracs[randInt(0, simpleFracs.length - 1)];
        const useNeg = randInt(0, 1) === 1;
        const fn = useNeg ? -n : n;
        const recipN = useNeg ? -d : d;
        questions.push(`求 $${formatFraction(fn, d)}$ 的倒數。`);
        summaryAnswers.push(`$${formatFraction(recipN, n)}$`);
        answers.push(
          `分數的倒數是將分子與分母互換（符號不變）：$\\left(${formatFraction(fn, d)}\\right)$ 的倒數為 $${formatFraction(recipN, n)}$。`
        );
      } else if (mode === 1) {
        const [w, n, d] = mixedNums[randInt(0, mixedNums.length - 1)];
        const impN = w * d + n;
        questions.push(`求帶分數 $${w}\\dfrac{${n}}{${d}}$ 的倒數。`);
        summaryAnswers.push(`$${formatFraction(d, impN)}$`);
        answers.push(
          `先化為假分數：$${w}\\dfrac{${n}}{${d}}=\\dfrac{${impN}}{${d}}$；倒數為 $${formatFraction(d, impN)}$。`
        );
      } else {
        const [n, d] = simpleFracs[randInt(0, simpleFracs.length - 1)];
        const useNeg = randInt(0, 1) === 1;
        const fn = useNeg ? -n : n;
        const recipN = useNeg ? -d : d;
        questions.push(`若 $□\\times\\left(${formatFraction(fn, d)}\\right)=1$，則 □ = ？`);
        summaryAnswers.push(`$${formatFraction(recipN, n)}$`);
        answers.push(`滿足 $□\\times a=1$ 的數即 $a$ 的倒數，故 □ $=${formatFraction(recipN, n)}$。`);
      }
    }

    return { questions, summaryAnswers, answers };
  }

  // ─── j1-2-1/2/3 文件題型補充 generators 結束 ─────────────────────────────

  const nextConfigs = {
    'midpoint-formula': {
      type: 'drill',
      title: '簡易無限練習',
      difficulty: 'easy',
      questionCount: 10,
      generate() {
        return buildMidpointSet(10);
      },
    },
    'distance-formula': {
      type: 'drill',
      title: '簡易無限練習',
      difficulty: 'easy',
      questionCount: 10,
      generate() {
        return buildDistanceSet(10);
      },
    },
    'three-products-add-subtract-drill': {
      type: 'drill',
      title: '中等無限練習',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildThreeProductSet(5);
      },
    },
    'integer-add-subtract-brackets-drill': {
      type: 'drill',
      title: '四正負數加減',
      difficulty: 'easy',
      questionCount: 8,
      generate() {
        return buildIntegerAddSubtractBracketsSet(8);
      },
    },
    'integer-canceling-brackets-drill': {
      type: 'drill',
      title: '去括號後的正負數加減',
      difficulty: 'easy',
      questionCount: 8,
      generate() {
        return buildCancelingBracketIntegerSet(8);
      },
    },
    'integer-absolute-reduce-drill': {
      type: 'drill',
      title: '去絕對值後的正負數加減',
      difficulty: 'easy',
      questionCount: 8,
      generate() {
        return buildAbsoluteIntegerReduceSet(8);
      },
    },
    'integer-abs-bracket-mixed-drill': {
      type: 'drill',
      title: '絕對值與括號混合運算',
      difficulty: 'easy',
      questionCount: 8,
      generate() {
        return buildAbsoluteBracketMixedSet(8);
      },
    },
    'time-baseline-basic-drill': {
      type: 'drill',
      title: '時間基準問題',
      difficulty: 'easy',
      questionCount: 10,
      generate() {
        return buildTimeBaselineBasicSet(10);
      },
    },
    'time-baseline-advanced-drill': {
      type: 'drill',
      title: '進階時間基準問題',
      difficulty: 'medium',
      questionCount: 10,
      generate() {
        return buildTimeBaselineAdvancedSet(10);
      },
    },
    'nearby-average-baseline-drill': {
      type: 'drill',
      title: '基準值平均與反求未知數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildNearbyAverageBaselineSet(5);
      },
    },
    'average-baseline-difference-drill': {
      type: 'drill',
      title: '平均變動與總和差',
      difficulty: 'easy',
      questionCount: 6,
      generate() {
        return buildAverageBaselineDifferenceSet(6);
      },
    },
    'j1-1-3-sign-brackets-power-drill': {
      type: 'drill',
      title: '正負號、括號與次方判別',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildExponentSignBracketSet(5);
      },
    },
    'j1-1-3-exponent-law-single-rule-drill': {
      type: 'drill',
      title: '指數律單一法則',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildExponentLawSingleRuleSet(5);
      },
    },
    'j1-1-3-exponent-law-mixed-rule-drill': {
      type: 'drill',
      title: '指數律進階混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildExponentLawMixedSet(5);
      },
    },
    'j1-1-3-exponent-mixed-operations-drill': {
      type: 'drill',
      title: '零次方、負次方與綜合四則',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildExponentMixedOperationsSet(5);
      },
    },
    'j1-1-3-exponent-word-problem-drill': {
      type: 'drill',
      title: '指數生活應用',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildExponentWordProblemSet(5);
      },
    },
    'j1-1-3-power-concept-one-subtype': {
      type: 'drill',
      title: '次方基礎觀念',
      difficulty: 'easy',
      questionCount: 6,
      generate() {
        return buildJ113ConceptMixedSet(6);
      },
    },
    'j1-1-3-exponent-law-three-subtypes': {
      type: 'drill',
      title: '指數律與運算',
      difficulty: 'medium',
      questionCount: 8,
      generate() {
        return buildJ113LawMixedSet(8);
      },
    },
    'j1-1-3-application-one-subtype': {
      type: 'drill',
      title: '指數應用',
      difficulty: 'easy',
      questionCount: 6,
      generate() {
        return buildJ113ApplicationMixedSet(6);
      },
    },
    'j1-1-3-same-base-multiply-drill': {
      type: 'drill',
      title: '同底數相乘',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ113SameBaseMultiplySet(5);
      },
    },
    'j1-1-3-same-base-division-drill': {
      type: 'drill',
      title: '同底數相除',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ113SameBaseDivisionSet(5);
      },
    },
    'j1-1-3-same-base-mixed-chain-drill': {
      type: 'drill',
      title: '同底數乘除混合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113SameBaseMixedChainSet(5);
      },
    },
    'j1-1-3-same-base-rewrite-drill': {
      type: 'drill',
      title: '同底數重排化簡',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113SameBaseRewriteSet(5);
      },
    },
    'j1-1-3-same-base-four-subtypes': {
      type: 'drill',
      title: '同底數的乘除運算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ113SameBaseMixedSet(5);
      },
    },
    'j1-1-3-power-of-power-basic-drill': {
      type: 'drill',
      title: '次方的次方基本題',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ113PowerOfPowerBasicSet(5);
      },
    },
    'j1-1-3-power-of-power-negative-base-drill': {
      type: 'drill',
      title: '負底數的次方的次方',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113PowerOfPowerNegativeBaseSet(5);
      },
    },
    'j1-1-3-power-of-power-value-drill': {
      type: 'drill',
      title: '次方的次方求值',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ113PowerOfPowerValueSet(5);
      },
    },
    'j1-1-3-power-of-power-signed-drill': {
      type: 'drill',
      title: '次方的次方含負號',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113PowerOfPowerSignedSet(5);
      },
    },
    'j1-1-3-power-of-power-four-subtypes': {
      type: 'drill',
      title: '次方的次方',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113PowerOfPowerMixedSet(5);
      },
    },
    'j1-1-3-negative-exponent-evaluate-drill': {
      type: 'drill',
      title: '負指數化倒數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ113NegativeExponentEvaluateSet(5);
      },
    },
    'j1-1-3-negative-exponent-compare-drill': {
      type: 'drill',
      title: '負指數大小比較',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113NegativeExponentCompareSet(5);
      },
    },
    'j1-1-3-negative-exponent-signed-product-drill': {
      type: 'drill',
      title: '負指數乘法計算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113NegativeExponentSignedProductSet(5);
      },
    },
    'j1-1-3-negative-exponent-scientific-drill': {
      type: 'drill',
      title: '負指數與科學記號',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113NegativeExponentScientificSet(5);
      },
    },
    'j1-1-3-reciprocal-value-drill': {
      type: 'drill',
      title: '倒數概念求值',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ113ReciprocalValueSet(5);
      },
    },
    'j1-1-3-negative-exponent-five-subtypes': {
      type: 'drill',
      title: '負指數與倒數概念',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113NegativeExponentMixedSet(5);
      },
    },
    'j1-1-3-parity-linear-combo-drill': {
      type: 'drill',
      title: '(-1)^n 奇偶組合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113ParityLinearComboSet(5);
      },
    },
    'j1-1-3-parity-difference-drill': {
      type: 'drill',
      title: '(-1)^n 同奇偶差值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113ParityDifferenceSet(5);
      },
    },
    'j1-1-3-parity-even-sum-drill': {
      type: 'drill',
      title: '(-1) 偶次方和',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ113ParityEvenSumSet(5);
      },
    },
    'j1-1-3-parity-odd-sum-drill': {
      type: 'drill',
      title: '(-1) 奇次方和',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ113ParityOddSumSet(5);
      },
    },
    'j1-1-3-parity-sign-judge-drill': {
      type: 'drill',
      title: '(-1)^n 正負判斷',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ113ParitySignJudgeSet(5);
      },
    },
    'j1-1-3-parity-five-subtypes': {
      type: 'drill',
      title: '底數為 -1 的奇偶次方規律',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113ParityMixedSet(5);
      },
    },
    'j1-1-3-power-compare-positive-base-drill': {
      type: 'drill',
      title: '正底數次方比較',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ113PowerComparePositiveBaseSet(5);
      },
    },
    'j1-1-3-power-compare-bracket-drill': {
      type: 'drill',
      title: '括號位置次方比較',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113PowerCompareBracketSet(5);
      },
    },
    'j1-1-3-power-compare-unary-minus-drill': {
      type: 'drill',
      title: '負號位置次方比較',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113PowerCompareUnaryMinusSet(5);
      },
    },
    'j1-1-3-power-compare-absolute-drill': {
      type: 'drill',
      title: '絕對值與次方比較',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113PowerCompareAbsoluteSet(5);
      },
    },
    'j1-1-3-power-compare-parity-drill': {
      type: 'drill',
      title: '奇偶次方符號比較',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113PowerCompareParitySet(5);
      },
    },
    'j1-1-3-power-compare-five-subtypes': {
      type: 'drill',
      title: '次方運算的大小比較與性質辨析',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113PowerCompareMixedSet(5);
      },
    },
    'j1-1-3-biquadratic-split-square-factoring': {
      type: 'drill',
      title: '二次三項式的拆項配方因式分解',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113BiquadraticSplitSquareFactoringSet(5);
      },
    },
    'j1-1-3-binary-quadratic-cross-factoring': {
      type: 'drill',
      title: '二元二次式的雙十字交乘法因式分解',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ113BinaryQuadraticCrossFactoringSet(5);
      },
    },
    'j1-1-4-scientific-convert-drill': {
      type: 'drill',
      title: '數值與科學記號的互換',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildScientificNotationConvertSet(5);
      },
    },
    'j1-1-4-scientific-digit-reading-drill': {
      type: 'drill',
      title: '位數判讀與小數點後的零',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildScientificDigitReadingSet(5);
      },
    },
    'j1-1-4-scientific-compare-drill': {
      type: 'drill',
      title: '科學記號的大小比較',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildScientificCompareSet(5);
      },
    },
    'j1-1-4-scientific-mul-div-drill': {
      type: 'drill',
      title: '科學記號的乘除運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildScientificMulDivSet(5);
      },
    },
    'j1-1-4-scientific-add-sub-drill': {
      type: 'drill',
      title: '科學記號的加減運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildScientificAddSubSet(5);
      },
    },
    'j1-1-4-scientific-unit-conversion-drill': {
      type: 'drill',
      title: '長度與重量單位的轉換',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildScientificUnitConversionSet(5);
      },
    },
    'j1-1-4-scientific-normalize-drill': {
      type: 'drill',
      title: '不完整科學記號化為標準形',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildScientificNormalizeSet(5);
      },
    },
    'j1-1-4-large-to-scientific-drill': {
      type: 'drill',
      title: '將大數轉化為科學記號',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ114LargeToScientificSet(5);
      },
    },
    'j1-1-4-small-to-scientific-drill': {
      type: 'drill',
      title: '將極小數轉化為科學記號',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ114SmallToScientificSet(5);
      },
    },
    'j1-1-4-scientific-to-plain-drill': {
      type: 'drill',
      title: '將科學記號還原為一般數字',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ114ScientificToPlainSet(5);
      },
    },
    'j1-1-4-scientific-mul-div-standard-drill': {
      type: 'drill',
      title: '科學記號的進階乘除運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ114ScientificMulDivSet(5);
      },
    },
    'j1-1-4-scientific-add-sub-standard-drill': {
      type: 'drill',
      title: '科學記號的進階加減運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ114ScientificAddSubSet(5);
      },
    },
    'j1-1-4-scientific-compare-standard-drill': {
      type: 'drill',
      title: '科學記號的大小比較',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ114ScientificCompareSet(5);
      },
    },
    'j1-1-4-scientific-context-drill': {
      type: 'drill',
      title: '情境應用與單位轉換',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ114ScientificContextSet(5);
      },
    },
    'j1-1-4-large-to-scientific-one-subtype': {
      type: 'drill',
      title: '將大數轉化為科學記號',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ114LargeConvertMixedSet(5);
      },
    },
    'j1-1-4-small-to-scientific-one-subtype': {
      type: 'drill',
      title: '將極小數轉化為科學記號',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ114SmallConvertMixedSet(5);
      },
    },
    'j1-1-4-scientific-to-plain-one-subtype': {
      type: 'drill',
      title: '將科學記號還原為一般數字',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ114ScientificToPlainMixedSet(5);
      },
    },
    'j1-1-4-scientific-mul-div-one-subtype': {
      type: 'drill',
      title: '科學記號的進階乘除運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ114ScientificMulDivMixedSet(5);
      },
    },
    'j1-1-4-scientific-add-sub-one-subtype': {
      type: 'drill',
      title: '科學記號的進階加減運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ114ScientificAddSubMixedSet(5);
      },
    },
    'j1-1-4-scientific-compare-one-subtype': {
      type: 'drill',
      title: '科學記號的大小比較',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ114ScientificCompareMixedSet(5);
      },
    },
    'j1-1-4-scientific-context-one-subtype': {
      type: 'drill',
      title: '情境應用與單位轉換',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ114ScientificContextMixedSet(5);
      },
    },
    'opposite-number-equation-drill': {
      type: 'drill',
      title: '相反數問題',
      difficulty: 'easy',
      questionCount: 10,
      generate() {
        return buildOppositeNumberSet(10);
      },
    },
    'opposite-basic-concept-drill': {
      type: 'drill',
      title: '相反數基本概念',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildOppositeBasicConceptSet(5);
      },
    },
    'opposite-compare-drill': {
      type: 'drill',
      title: '相反數與雙重負號比較',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildOppositeCompareSet(5);
      },
    },
    'opposite-side-of-origin-drill': {
      type: 'drill',
      title: '相反數與原點位置',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildOppositeSideOfOriginSet(5);
      },
    },
    'midpoint-distance-combined-drill': {
      type: 'drill',
      title: '中點與距離問題',
      difficulty: 'easy',
      questionCount: 10,
      generate() {
        return buildMidpointDistanceCombinedSet(10);
      },
    },
    'same-shift-opposite-drill': {
      type: 'drill',
      title: '兩數同加或減一數成相反數',
      difficulty: 'medium',
      questionCount: 10,
      generate() {
        return buildSameShiftOppositeSet(10);
      },
    },
    'opposite-number-sum-difference-drill': {
      type: 'drill',
      title: '相反數與和差關係',
      difficulty: 'easy',
      questionCount: 6,
      generate() {
        return buildOppositeNumberSumDifferenceSet(6);
      },
    },
    'midpoint-reverse-drill': {
      type: 'drill',
      title: '中點反向問題',
      difficulty: 'easy',
      questionCount: 10,
      generate() {
        return buildMidpointReverseSet(10);
      },
    },
    'midpoint-plus-distance-drill': {
      type: 'drill',
      title: '中點加距離綜合問題',
      difficulty: 'medium',
      questionCount: 10,
      generate() {
        return buildMidpointPlusDistanceSet(10);
      },
    },
    'number-line-equidistant-point-drill': {
      type: 'drill',
      title: '等距點問題',
      difficulty: 'easy',
      questionCount: 6,
      generate() {
        return buildNumberLineEquidistantPointSet(6);
      },
    },
    'number-line-fixed-distance-point-drill': {
      type: 'drill',
      title: '固定距離找點',
      difficulty: 'easy',
      questionCount: 6,
      generate() {
        return buildNumberLineFixedDistancePointSet(6);
      },
    },
    'number-line-midpoint-distance-reverse-mixed-drill': {
      type: 'drill',
      title: '中點與距離反推綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildNumberLineMidpointDistanceReverseMixedSet(6);
      },
    },
    'three-point-quick-distance-drill': {
      type: 'drill',
      title: '三點快速看距離練習',
      difficulty: 'easy',
      questionCount: 10,
      generate() {
        return buildThreePointQuickDistanceSet(10);
      },
    },
    'coordinate-origin-unit-change': {
      type: 'drill',
      title: '改變原點與單位長時坐標變化',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildCoordinateOriginUnitChangeSet(3);
      },
    },
    'coordinate-origin-shift-only-drill': {
      type: 'drill',
      title: '只改原點',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildCoordinateOriginShiftOnlySet(5);
      },
    },
    'coordinate-unit-scale-only-drill': {
      type: 'drill',
      title: '只改單位長',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildCoordinateUnitScaleOnlySet(5);
      },
    },
    'coordinate-origin-then-unit-drill': {
      type: 'drill',
      title: '先改原點再改單位長',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildCoordinateOriginThenUnitSet(5);
      },
    },
    'coordinate-old-new-inverse-drill': {
      type: 'drill',
      title: '新舊坐標互推',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildCoordinateOldNewInverseSet(5);
      },
    },
    'coordinate-new-line-distance-midpoint-drill': {
      type: 'drill',
      title: '新數線下的距離與中點',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildCoordinateNewLineDistanceMidpointSet(5);
      },
    },
    'absolute-value-candidates-drill': {
      type: 'drill',
      title: '絕對值反推可能值',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildAbsoluteValueCandidatesSet(5);
      },
    },
    'absolute-difference-minimum-drill': {
      type: 'drill',
      title: '已知絕對值求差最小值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildAbsoluteDifferenceMinimumSet(5);
      },
    },
    'absolute-difference-maximum-drill': {
      type: 'drill',
      title: '已知絕對值求差最大值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildAbsoluteDifferenceMaximumSet(5);
      },
    },
    'absolute-sum-minimum-drill': {
      type: 'drill',
      title: '已知絕對值求和最小值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildAbsoluteSumMinimumSet(5);
      },
    },
    'absolute-sum-maximum-drill': {
      type: 'drill',
      title: '已知絕對值求和最大值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildAbsoluteSumMaximumSet(5);
      },
    },
    'interval-integer-count-drill': {
      type: 'drill',
      title: '整數區間個數判定',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildIntervalIntegerCountSet(5);
      },
    },
    'interval-integer-sum-drill': {
      type: 'drill',
      title: '整數區間總和判定',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildIntervalIntegerSumSet(5);
      },
    },
    'shifted-absolute-integer-sum-drill': {
      type: 'drill',
      title: '位移絕對值整數總和',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildShiftedAbsoluteIntegerSumSet(5);
      },
    },
    'abs-variable-basic-drill': {
      type: 'drill',
      title: '含字母的去絕對值基礎題',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildAbsVariableBasicSet(5);
      },
    },
    'abs-short-mixed-calc-drill': {
      type: 'drill',
      title: '絕對值四則混合短題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildAbsMixedShortSet(5);
      },
    },
    'abs-context-interpretation-drill': {
      type: 'drill',
      title: '絕對值文字情境題',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildAbsContextSet(5);
      },
    },
    'j1-1-1-absolute-value-core-nine-subtypes': {
      type: 'drill',
      title: '絕對值意義與計算七小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ111AbsoluteValueMixedSet(5);
      },
    },
    'j1-1-1-opposite-four-subtypes': {
      type: 'drill',
      title: '相反數概念與性質四小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ111OppositeMixedSet(5);
      },
    },
    'j1-1-1-absolute-extremum-four-subtypes': {
      type: 'drill',
      title: '絕對值極值判定四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ111AbsoluteExtremumMixedSet(5);
      },
    },
    'j1-1-1-range-integer-five-subtypes': {
      type: 'drill',
      title: '絕對值範圍與整數解五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ111RangeIntegerMixedSet(5);
      },
    },
    'j1-1-1-midpoint-distance-nine-subtypes': {
      type: 'drill',
      title: '數線上的中點與距離九小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ111MidpointDistanceMixedSet(5);
      },
    },
    'j1-1-1-origin-unit-six-subtypes': {
      type: 'drill',
      title: '改變原點與單位長六小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ111OriginUnitMixedSet(5);
      },
    },
    'abs-four-terms-calc-drill': {
      type: 'drill',
      title: '四數含絕對值計算',
      difficulty: 'easy',
      questionCount: 10,
      generate() {
        return buildAbsFourTermsSet(10);
      },
    },
    'abs-count-basic-drill': {
      type: 'drill',
      title: '絕對值個數問題',
      difficulty: 'easy',
      questionCount: 10,
      generate() {
        return buildAbsCountBasicSet(10);
      },
    },
    'abs-count-two-sided-drill': {
      type: 'drill',
      title: '絕對值個數問題二邊範圍',
      difficulty: 'medium',
      questionCount: 10,
      generate() {
        return buildAbsCountTwoSidedSet(10);
      },
    },
    'abs-count-reverse-drill': {
      type: 'drill',
      title: '絕對值個數問題反向',
      difficulty: 'medium',
      questionCount: 10,
      generate() {
        return buildAbsCountReverseSet(5);
      },
    },
    'abs-equation-leading-one-drill': {
      type: 'drill',
      title: '絕對值方程式（最高次係數=1）',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildAbsEquationLeadingOneSet(5);
      },
    },
    'abs-equation-leading-not-one-drill': {
      type: 'drill',
      title: '絕對值方程式（最高次係數≠1）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildAbsEquationLeadingNotOneSet(5);
      },
    },
    'nonnegative-sum-zero-drill': {
      type: 'drill',
      title: '非負整數和=0',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildNonnegativeSumZeroSet(5);
      },
    },
    'nonnegative-sum-fixed-one-drill': {
      type: 'drill',
      title: '非負整數和固定討論',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildNonnegativeSumFixedOneSet(5);
      },
    },
    'nonnegative-sum-fixed-multix-drill': {
      type: 'drill',
      title: '非負整數解和固定討論多組解（只求x）',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildNonnegativeSumFixedMultiXSet(5);
      },
    },
    'abs-both-sides-advanced-drill': {
      type: 'drill',
      title: '進階補充：兩邊都有絕對值',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildAbsoluteBothSidesAdvancedSet(5);
      },
    },
    'abs-two-group-calc-drill': {
      type: 'drill',
      title: '二組絕對值計算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildAbsTwoGroupsSet(5);
      },
    },
    'abs-remove-and-calc-drill': {
      type: 'drill',
      title: '去絕對值計算',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildAbsRemoveAndCalcSet(3);
      },
    },
    'linear-remove-parentheses-drill': {
      type: 'drill',
      title: '去括號（一元一次）',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildLinearRemoveParenthesesSet(5);
      },
    },
    'linear-multiply-parentheses-drill': {
      type: 'drill',
      title: '有乘法的去括號（一元一次）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildLinearMultiplyParenthesesSet(5);
      },
    },
    'linear-fraction-parentheses-drill': {
      type: 'drill',
      title: '有分數的去括號（一元一次）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildLinearFractionParenthesesSet(5);
      },
    },
    'linear-word-expression-drill': {
      type: 'drill',
      title: '綜合列式文字題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildLinearWordExpressionSet(5);
      },
    },
    'linear-substitution-value-drill': {
      type: 'drill',
      title: '綜合代入求值',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildLinearSubstitutionValueSet(5);
      },
    },
    'linear-move-terms-solve-drill': {
      type: 'drill',
      title: '移項求解',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildLinearMoveTermsSolveSet(5);
      },
    },
    'linear-expand-move-solve-drill': {
      type: 'drill',
      title: '展開移項求解',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildLinearExpandMoveSolveSet(5);
      },
    },
    'linear-cross-expand-move-solve-drill': {
      type: 'drill',
      title: '交叉相乘後展開移項求解',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildLinearCrossMultiplySolveSet(5);
      },
    },
    'linear-lcm-multiply-move-solve-drill': {
      type: 'drill',
      title: '同乘公倍數後整理移項求解',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildLinearLcmMultiplySolveSet(5);
      },
    },
    'linear-same-solution-drill': {
      type: 'drill',
      title: '解相同題型',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildLinearSameSolutionSet(5);
      },
    },
    'linear-decimal-move-solve-drill': {
      type: 'drill',
      title: '小數一元一次方程式',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildLinearDecimalMoveSolveSet(5);
      },
    },
    'j1-3-3-purchase-discount-application-drill': {
      type: 'drill',
      title: '錢數買賣與折扣問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildPurchaseDiscountApplicationSet(5);
      },
    },
    'j1-3-3-allocation-application-drill': {
      type: 'drill',
      title: '分配問題（剩餘與不足）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildAllocationApplicationSet(5);
      },
    },
    'j1-3-3-age-application-drill': {
      type: 'drill',
      title: '年齡推算問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildAgeApplicationSet(5);
      },
    },
    'j1-3-3-speed-application-drill': {
      type: 'drill',
      title: '行程與速率問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildSpeedApplicationSet(5);
      },
    },
    'j1-3-3-heads-coins-application-drill': {
      type: 'drill',
      title: '雞兔同籠與硬幣問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildHeadsCoinsApplicationSet(5);
      },
    },
    'j1-3-3-work-rate-application-drill': {
      type: 'drill',
      title: '工程與工作效率問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133WorkRateSet(5);
      },
    },
    'j1-3-3-fraction-remainder-application-drill': {
      type: 'drill',
      title: '剩餘量的分率問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133FractionRemainderSet(5);
      },
    },
    'j1-3-3-score-penalty-application-drill': {
      type: 'drill',
      title: '得分倒扣問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133ScorePenaltySet(5);
      },
    },
    'j1-3-3-mixture-application-drill': {
      type: 'drill',
      title: '濃度與混合問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133MixtureSet(5);
      },
    },
    'j1-3-3-tiered-fee-application-drill': {
      type: 'drill',
      title: '基本費與超額計費問題',
      difficulty: 'challenge',
      questionCount: 5,
      generate() {
        return buildJ133TieredFeeSet(5);
      },
    },
    'j1-3-3-clock-angle-application-drill': {
      type: 'drill',
      title: '時鐘與角度問題',
      difficulty: 'challenge',
      questionCount: 5,
      generate() {
        return buildJ133ClockAngleSet(5);
      },
    },
    'j1-3-3-consecutive-integer-application-drill': {
      type: 'drill',
      title: '連續整數應用題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133ConsecutiveIntegerSet(5);
      },
    },
    'j1-3-3-ratio-chain-application-drill': {
      type: 'drill',
      title: '連比與連等比例應用題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133RatioChainSet(5);
      },
    },
    'j1-3-3-average-count-application-drill': {
      type: 'drill',
      title: '平均數與人數反推應用題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133AverageCountSet(5);
      },
    },
    'j1-3-3-total-price-application-drill': {
      type: 'drill',
      title: '總數總價應用題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133TotalPriceSet(5);
      },
    },
    'j1-3-3-transfer-equalization-application-drill': {
      type: 'drill',
      title: '移轉後相等與倍數應用題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133TransferEqualizationSet(5);
      },
    },
    'j1-3-3-relative-speed-application-drill': {
      type: 'drill',
      title: '倍速相向距離應用題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133RelativeSpeedSet(5);
      },
    },
    'j1-3-3-opposite-number-application-drill': {
      type: 'drill',
      title: '兩數互為相反數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133OppositeNumberSet(5);
      },
    },
    'j1-3-3-three-person-chain-diff-drill': {
      type: 'drill',
      title: '三人連差應用題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133ThreePersonChainDiffSet(5);
      },
    },
    'j1-3-3-monkey-banana-drill': {
      type: 'drill',
      title: '猴子香蕉問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133MonkeyBananaSet(5);
      },
    },
    'j1-3-3-double-discount-drill': {
      type: 'drill',
      title: '兩折扣比較應用題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133DoubleDiscountSet(5);
      },
    },
    'j1-3-3-guess-number-drill': {
      type: 'drill',
      title: '猜數遊戲應用題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133GuessNumberSet(5);
      },
    },
    'j1-3-3-rectangle-dimension-drill': {
      type: 'drill',
      title: '長方形長寬關係應用題',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ133RectangleDimensionSet(5);
      },
    },
    'j1-3-3-age-ratio-plus-drill': {
      type: 'drill',
      title: '倍加型父子年齡應用題',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ133AgeRatioPlusSet(5);
      },
    },
    'j1-3-3-weight-compare-drill': {
      type: 'drill',
      title: '和倍差體重應用題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133WeightCompareSet(5);
      },
    },
    'j1-3-3-find-fraction-drill': {
      type: 'drill',
      title: '求特定分數應用題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133FindFractionSet(5);
      },
    },
    'j1-3-3-rope-folding-drill': {
      type: 'drill',
      title: '繩子折段差與井深問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133RopeFoldingSet(5);
      },
    },
    'j1-3-3-candle-burn-drill': {
      type: 'drill',
      title: '蠟燭同時燃燒比例問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133CandleBurnSet(5);
      },
    },
    'j1-3-3-circular-track-drill': {
      type: 'drill',
      title: '圓形跑道反向相遇週期問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133CircularTrackSet(5);
      },
    },
    'j1-3-3-chain-fraction-take-drill': {
      type: 'drill',
      title: '連續取分數型問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133ChainFractionTakeSet(5);
      },
    },
    'j1-3-3-calendar-block-drill': {
      type: 'drill',
      title: '月曆方框日期問題',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ133CalendarBlockSet(5);
      },
    },
    'j1-3-3-digit-swap-drill': {
      type: 'drill',
      title: '四位數移位問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ133DigitSwapSet(5);
      },
    },
    'j1-distributive-law-drill': {
      type: 'drill',
      title: '分配律',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ1DistributiveLawSet(5);
      },
    },
    'j1-common-factor-drill': {
      type: 'drill',
      title: '提出公因數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ1CommonFactorSet(5);
      },
    },
    'j1-common-factor-four-terms-drill': {
      type: 'drill',
      title: '4項提出公因數（全正數）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ1CommonFactorFourTermsSet(5);
      },
    },
    'j1-common-factor-four-terms-signed-drill': {
      type: 'drill',
      title: '4項提出公因數（含正負數）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ1CommonFactorFourTermsSignedSet(5);
      },
    },
    'j1-distributive-common-factor-mixed': {
      type: 'drill',
      title: '分配律與提出公因數綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ1DistributiveCommonFactorMixedSet(5);
      },
    },
    'j1-variable-distributive-eval-drill': {
      type: 'drill',
      title: '已知甲×a，求(甲+b)×a',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ1VariableDistributiveEvalSet(5);
      },
    },
    'j1-variable-distributive-application-drill': {
      type: 'drill',
      title: '分配律應用（大數字拆解）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ1VariableDistributiveApplicationSet(5);
      },
    },
    'j1-variable-distributive-pair-difference-drill': {
      type: 'drill',
      title: '二組分配律（相鄰差一型）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ1DistributivePairDifferenceSet(5);
      },
    },
    'j1-variable-distributive-offset-difference-drill': {
      type: 'drill',
      title: '二組分配律（補差型）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ1DistributiveOffsetDifferenceSet(5);
      },
    },
    'j1-common-factor-then-distributive-drill': {
      type: 'drill',
      title: '先提公因數，再分配律',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ1CommonFactorThenDistributiveSet(5);
      },
    },
    'weird-symbol-calc': {
      type: 'drill',
      title: '奇怪的符號計算',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildWeirdSymbolCalcSet(3);
      },
    },
    'weird-symbol-calc-three-layer': {
      type: 'drill',
      title: '奇怪的符號計算三層版',
      difficulty: 'hard',
      questionCount: 3,
      generate() {
        return buildWeirdSymbolCalcThreeLayerSet(3);
      },
    },
    'weird-symbol-reverse-drill': {
      type: 'drill',
      title: '奇怪符號反求未知數',
      difficulty: 'medium',
      questionCount: 4,
      generate() {
        return buildWeirdSymbolReverseSet(4);
      },
    },
    'j1-1-2-substitution-square-sum-drill': {
      type: 'drill',
      title: '代數值代入平方和',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildSubstitutionSquareSumSet(5);
      },
    },
    'j1-1-2-substitution-linear-three-var-drill': {
      type: 'drill',
      title: '代數值代入三變數加減',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildSubstitutionLinearThreeVarSet(5);
      },
    },
    'j1-1-2-substitution-power-linear-drill': {
      type: 'drill',
      title: '代數值代入含次方運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildSubstitutionPowerLinearSet(5);
      },
    },
    'j1-1-2-substitution-product-plus-drill': {
      type: 'drill',
      title: '代數值代入乘加混合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildSubstitutionProductPlusSet(5);
      },
    },
    'j1-1-2-substitution-power-difference-drill': {
      type: 'drill',
      title: '代數值代入立方平方差',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildSubstitutionPowerDifferenceSet(5);
      },
    },
    'j1-1-2-bracket-order-mul-div-add-drill': {
      type: 'drill',
      title: '乘除後加減混合運算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildBracketOrderMulDivAddSet(5);
      },
    },
    'j1-1-2-bracket-order-bracket-division-drill': {
      type: 'drill',
      title: '括號後再除法',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildBracketOrderBracketDivisionSet(5);
      },
    },
    'j1-1-2-bracket-order-multiply-bracket-drill': {
      type: 'drill',
      title: '乘法與括號優先',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildBracketOrderMultiplyBracketSet(5);
      },
    },
    'j1-1-2-bracket-order-mixed-drill': {
      type: 'drill',
      title: '括號乘除綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildBracketOrderMixedSet(5);
      },
    },
    'j1-1-2-bracket-order-nested-drill': {
      type: 'drill',
      title: '中括號與除法巢狀運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildBracketOrderNestedSet(5);
      },
    },
    'j1-1-2-power-mixed-add-product-drill': {
      type: 'drill',
      title: '乘方加乘法混合運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildPowerMixedAddProductSet(5);
      },
    },
    'j1-1-2-power-mixed-subtract-drill': {
      type: 'drill',
      title: '乘方乘法減法綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildPowerMixedSubtractSet(5);
      },
    },
    'j1-1-2-power-mixed-mul-div-drill': {
      type: 'drill',
      title: '乘方與乘除混合運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildPowerMixedMulDivSet(5);
      },
    },
    'j1-1-2-power-mixed-bracket-drill': {
      type: 'drill',
      title: '乘方與括號綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildPowerMixedBracketSet(5);
      },
    },
    'j1-1-2-absolute-mul-add-drill': {
      type: 'drill',
      title: '絕對值乘加混合運算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildAbsoluteMulAddSet(5);
      },
    },
    'j1-1-2-absolute-two-stage-mul-drill': {
      type: 'drill',
      title: '多個絕對值先後運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildAbsoluteTwoStageMulSet(5);
      },
    },
    'j1-1-2-absolute-power-product-drill': {
      type: 'drill',
      title: '絕對值與次方乘法',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildAbsolutePowerProductSet(5);
      },
    },
    'j1-1-2-absolute-distance-sum-drill': {
      type: 'drill',
      title: '兩段距離和',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildAbsoluteDistanceSumSet(5);
      },
    },
    'j1-1-2-fraction-integer-add-sub-drill': {
      type: 'drill',
      title: '分數與整數加減',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildFractionIntegerAddSubSet(5);
      },
    },
    'j1-1-2-fraction-signed-mixed-drill': {
      type: 'drill',
      title: '分數正負混合加減',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildFractionSignedMixedSet(5);
      },
    },
    'j1-1-2-fraction-power-complex-drill': {
      type: 'drill',
      title: '含乘方的分數四則',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildFractionPowerComplexSet(5);
      },
    },
    'j1-1-2-fraction-power-sign-drill': {
      type: 'drill',
      title: '分數與負號次方判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildFractionPowerSignSet(5);
      },
    },
    'j1-1-2-pattern-negative-power-pair-drill': {
      type: 'drill',
      title: '負一次方奇偶規律',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildPatternNegativePowerPairSet(5);
      },
    },
    'j1-1-2-pattern-alternating-sum-drill': {
      type: 'drill',
      title: '正負交替和規律',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildPatternAlternatingSumSet(5);
      },
    },
    'j1-1-2-pattern-consecutive-difference-product-drill': {
      type: 'drill',
      title: '連續差積規律',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildPatternConsecutiveDifferenceProductSet(5);
      },
    },
    'j1-1-2-pattern-even-sum-drill': {
      type: 'drill',
      title: '偶數等差連加',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildPatternEvenSumSet(5);
      },
    },
    'j1-1-2-pattern-increment-product-drill': {
      type: 'drill',
      title: '連乘對消規律',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildPatternIncrementProductSet(5);
      },
    },
    'j1-1-2-substitution-five-subtypes': {
      type: 'drill',
      title: '代數值代入與綜合運算五小類綜合',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ112SubstitutionMixedSet(5);
      },
    },
    'j1-1-2-bracket-order-five-subtypes': {
      type: 'drill',
      title: '括號與優先順序五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ112BracketOrderMixedSet(5);
      },
    },
    'j1-1-2-power-mixed-four-subtypes': {
      type: 'drill',
      title: '含乘方四則混合四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ112PowerMixedSet(5);
      },
    },
    'j1-1-2-absolute-mixed-four-subtypes': {
      type: 'drill',
      title: '絕對值綜合運算四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ112AbsoluteMixedSet(5);
      },
    },
    'j1-1-2-fraction-mixed-four-subtypes': {
      type: 'drill',
      title: '分數與整數混合四小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ112FractionMixedSet(5);
      },
    },
    'j1-1-2-pattern-five-subtypes': {
      type: 'drill',
      title: '規律觀察與連續運算五小類綜合',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ112PatternMixedSet(5);
      },
    },
    'j1-1-2-distributive-factor-nine-subtypes': {
      type: 'drill',
      title: '分配律與提出公因數九小類綜合',
      difficulty: 'medium',
      questionCount: 8,
      generate() {
        return buildJ112DistributiveFactorMixedSet(8);
      },
    },
    'j1-1-2-integer-mixed-three-subtypes': {
      type: 'drill',
      title: '正負數混合運算五小類綜合',
      difficulty: 'easy',
      questionCount: 8,
      generate() {
        return buildJ112IntegerMixedSet(8);
      },
    },
    'j1-1-2-baseline-average-four-subtypes': {
      type: 'drill',
      title: '基準量與平均數四小類綜合',
      difficulty: 'medium',
      questionCount: 8,
      generate() {
        return buildJ112BaselineMixedSet(8);
      },
    },
    'j1-1-2-opposite-three-subtypes': {
      type: 'drill',
      title: '相反數與關係式三小類綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ112OppositeMixedSet(6);
      },
    },
    'j1-1-2-weird-symbol-three-subtypes': {
      type: 'drill',
      title: '奇怪的符號計算三小類綜合',
      difficulty: 'medium',
      questionCount: 6,
      generate() {
        return buildJ112WeirdSymbolMixedSet(6);
      },
    },
    'mod9-remainder-drill': {
      type: 'drill',
      title: '大數除以9餘數',
      difficulty: 'easy',
      questionCount: 10,
      generate() {
        return buildModuloRemainderSet(9, 10);
      },
    },
    'mod9-unknown-multiple-drill': {
      type: 'drill',
      title: '反向求一大數除以9整除',
      difficulty: 'medium',
      questionCount: 10,
      generate() {
        return buildModuloUnknownMultipleSet(9, 10);
      },
    },
    'mod9-unknown-remainder-drill': {
      type: 'drill',
      title: '反向求一大數除以9餘數',
      difficulty: 'medium',
      questionCount: 10,
      generate() {
        return buildModuloUnknownRemainderSet(9, 10);
      },
    },
    'mod11-remainder-drill': {
      type: 'drill',
      title: '大數除以11餘數',
      difficulty: 'easy',
      questionCount: 10,
      generate() {
        return buildModuloRemainderSet(11, 10);
      },
    },
    'mod11-unknown-multiple-drill': {
      type: 'drill',
      title: '反向求一大數除以11整除',
      difficulty: 'medium',
      questionCount: 10,
      generate() {
        return buildModuloUnknownMultipleSet(11, 10);
      },
    },
    'mod11-unknown-remainder-drill': {
      type: 'drill',
      title: '反向求一大數除以11餘數',
      difficulty: 'medium',
      questionCount: 10,
      generate() {
        return buildModuloUnknownRemainderSet(11, 10);
      },
    },
    'j1-2-1-gcd-lcm-calculation-drill': {
      type: 'drill',
      title: '最大公因數與最小公倍數',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildGcdLcmCalculationSet(5);
      },
    },
    'j1-2-1-gcd-lcm-product-relation-drill': {
      type: 'drill',
      title: '乘積與公因倍數關係',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildGcdLcmProductRelationSet(5);
      },
    },
    'j1-2-1-remainder-shortage-mixed-drill': {
      type: 'drill',
      title: '餘數與不足問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildRemainderShortageMixedSet(5);
      },
    },
    'j1-2-1-hanxin-advanced-drill': {
      type: 'drill',
      title: '韓信點兵進階',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildHanXinAdvancedSet(5);
      },
    },
    'j1-2-1-prime-factor-notation-drill': {
      type: 'drill',
      title: '標準分解式的寫法',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildPrimeFactorNotationSet(5);
      },
    },
    'j1-2-1-divisor-count-sum-mixed-drill': {
      type: 'drill',
      title: '正因數個數與總和',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildDivisorCountSumMixedSet(5);
      },
    },
    'j1-2-1-rectangle-factor-pairs-drill': {
      type: 'drill',
      title: '矩形排列問題',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildRectangleFactorPairsSet(5);
      },
    },
    'j1-2-3-fraction-add-sub-brackets-drill': {
      type: 'drill',
      title: '分數加減混合（去括號）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildFractionAddSubBracketSet(5);
      },
    },
    'j1-2-3-fraction-add-sub-negative-drill': {
      type: 'drill',
      title: '分數加減混合（負號轉換）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildFractionAddSubNegativeSet(5);
      },
    },
    'j1-2-3-fraction-add-sub-absolute-drill': {
      type: 'drill',
      title: '分數加減混合（絕對值對稱）',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildFractionAbsoluteSymmetrySet(5);
      },
    },
    'j1-2-3-fraction-mul-div-mixed-drill': {
      type: 'drill',
      title: '分數乘除（帶分數與倒數）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildFractionMulDivMixedSet(5);
      },
    },
    'j1-2-3-fraction-distributive-common-factor-drill': {
      type: 'drill',
      title: '分數乘除（分配律提公因數）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildFractionDistributiveCommonFactorSet(5);
      },
    },
    'j1-2-3-fraction-distributive-regroup-drill': {
      type: 'drill',
      title: '分數乘除（分配律重組）',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildFractionDistributiveRegroupSet(5);
      },
    },
    'j1-2-3-telescoping-gap-four-sum-drill': {
      type: 'drill',
      title: '分項對消（間隔四項和）',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildTelescopingGapFourSumSet(5);
      },
    },
    'j1-2-3-telescoping-adjacent-sum-drill': {
      type: 'drill',
      title: '分項對消（相鄰連分式和）',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildTelescopingAdjacentSumSet(5);
      },
    },
    'j1-2-3-telescoping-product-drill': {
      type: 'drill',
      title: '分項對消（連乘積）',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildTelescopingProductSet(5);
      },
    },
    'j1-2-3-bracket-mixed-operation-application': {
      type: 'drill',
      title: '多重括號與混合運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ123BracketMixedOperationSet(5);
      },
    },
    'j1-2-3-fraction-series-geometric-application': {
      type: 'drill',
      title: '分數級數與消去律規律題',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildJ123FractionSeriesGeometricSet(5);
      },
    },
    'j1-2-3-fraction-series-product-application': {
      type: 'drill',
      title: '分數級數與消去律規律題',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildJ123FractionSeriesProductSet(5);
      },
    },
    'j1-2-3-mixed-number-add-sub-application': {
      type: 'drill',
      title: '帶分數的複合加減運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ123MixedNumberAddSubSet(5);
      },
    },
    'j1-2-3-mixed-number-triple-application': {
      type: 'drill',
      title: '帶分數的複合加減運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ123MixedNumberTripleSet(5);
      },
    },
    'j1-2-3-fraction-remainder-life-application': {
      type: 'drill',
      title: '分數生活應用（分配與剩餘量）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ123FractionRemainderApplicationSet(5);
      },
    },
    'j1-2-3-bracket-mixed-four-subtypes': {
      type: 'drill',
      title: '多重括號與混合運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ123BracketMixedWrapperSet(5);
      },
    },
    'j1-2-3-fraction-series-two-subtypes': {
      type: 'drill',
      title: '分數級數與消去律規律題',
      difficulty: 'hard',
      questionCount: 5,
      generate() {
        return buildJ123SeriesMixedWrapperSet(5);
      },
    },
    'j1-2-3-mixed-number-two-subtypes': {
      type: 'drill',
      title: '帶分數的複合加減運算',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ123MixedNumberWrapperSet(5);
      },
    },
    'j1-2-3-fraction-application-one-subtype': {
      type: 'drill',
      title: '分數生活應用（分配與剩餘量）',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ123ApplicationWrapperSet(5);
      },
    },
    'factor-application-separate-grouping-drill': {
      type: 'drill',
      title: '男女分別分組',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildSeparateGroupingSet(3);
      },
    },
    'factor-application-mixed-grouping-drill': {
      type: 'drill',
      title: '男女混合分組',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildMixedGroupingSet(3);
      },
    },
    'factor-application-circular-track-drill': {
      type: 'drill',
      title: '環狀跑道同點重合',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildCircularTrackSet(3);
      },
    },
    'factor-road-planting-single-drill': {
      type: 'drill',
      title: '道路種樹（單側）',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildRoadPlantingSingleSet(3);
      },
    },
    'factor-road-planting-double-drill': {
      type: 'drill',
      title: '道路種樹（兩側）',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildRoadPlantingDoubleSet(3);
      },
    },
    'factor-road-keep-position-drill': {
      type: 'drill',
      title: '不需移動個數',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildRoadReplantKeepSet(3);
      },
    },
    'factor-rectangle-equal-square-drill': {
      type: 'drill',
      title: '長方形裁成相同正方形',
      difficulty: 'easy',
      questionCount: 3,
      generate() {
        return buildRectangleMaxSquarePiecesSet(3);
      },
    },
    'factor-rectangle-max-square-mixed-drill': {
      type: 'drill',
      title: '長方形裁成數個最大正方形',
      difficulty: 'medium',
      questionCount: 3,
      generate() {
        return buildRectangleMinSquarePiecesSet(3);
      },
    },
    'j1-2-2-gcd-grouping-application': {
      type: 'drill',
      title: '最大公因數應用：分組與分裝問題',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ122GcdGroupingSet(5);
      },
    },
    'j1-2-2-gcd-cutting-application': {
      type: 'drill',
      title: '最大公因數應用：切割與鋪設問題',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildJ122GcdCuttingSet(5);
      },
    },
    'j1-2-2-lcm-periodic-application': {
      type: 'drill',
      title: '週期性與循環相遇應用題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ122LcmPeriodicSet(5);
      },
    },
    'j1-2-2-lcm-min-square-application': {
      type: 'drill',
      title: '拼湊幾何與最小面積問題',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ122LcmMinSquareSet(5);
      },
    },
    'j1-2-2-lcm-multiples-logic-application': {
      type: 'drill',
      title: '數字整除邏輯與倍數判定',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildJ122LcmMultiplesSet(5);
      },
    },
    'j1-2-1-prime-identify-drill': {
      type: 'drill',
      title: '質數辨識',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildPrimeIdentifySet(5);
      },
    },
    'j1-2-1-divisibility-digit-fill-drill': {
      type: 'drill',
      title: '整除規則缺位數字',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildDivisibilityDigitFillSet(5);
      },
    },
    'j1-2-1-multiple-count-range-drill': {
      type: 'drill',
      title: '範圍倍數計數',
      difficulty: 'medium',
      questionCount: 5,
      generate() {
        return buildMultipleCountRangeSet(5);
      },
    },
    'j1-2-2-coprime-identify-drill': {
      type: 'drill',
      title: '互質判別',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildCoprimeIdentifySet(5);
      },
    },
    'j1-2-2-common-divisors-count-drill': {
      type: 'drill',
      title: '公因數個數計算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildCommonDivisorsCountSet(5);
      },
    },
    'j1-2-3-fraction-compare-drill': {
      type: 'drill',
      title: '分數大小比較',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildFractionCompareSet(5);
      },
    },
    'j1-2-3-fraction-simplify-drill': {
      type: 'drill',
      title: '分數化簡',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildFractionSimplifySet(5);
      },
    },
    'j1-2-3-fraction-reciprocal-drill': {
      type: 'drill',
      title: '倒數概念與計算',
      difficulty: 'easy',
      questionCount: 5,
      generate() {
        return buildFractionReciprocalSet(5);
      },
    },
  };

  const bundleFingerprint = 'j1-bundle-v20260622-j123-v1';
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== 'object') return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
