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
      questions.push(`數線上有A(${a})和B(${b})兩點，求A、B兩點的中點座標和距離？`);
      summaryAnswers.push(`中點 $${formatFraction(a + b, 2)}$，距離 $${distance}$`);
      answers.push(`中點=${midpoint}，距離=${distance}`);
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
      if (i === 0) {
        questions.push(`A(${a})、B(${b})、C(${c})為數線上三點，若D為AB中點，則CD距離多少？`);
      } else {
        questions.push(`A(${a})、B(${b})、C(${c})，若D為AB中點，求CD。`);
      }
      summaryAnswers.push(`$${formatFraction(Math.abs(2 * c - a - b), 2)}$`);
      answers.push(`${dist}`);
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
      if (i === 0) {
        questions.push(`A(${a})、B(${b})、C(${c})為數線上三點，求AB、BC、CA？`);
      } else {
        questions.push(`A(${a})、B(${b})、C(${c})，求AB、BC、CA？`);
      }
      summaryAnswers.push(`$AB=${ab},\\ BC=${bc},\\ CA=${ca}$`);
      answers.push(`AB=${ab}，BC=${bc}，CA=${ca}`);
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
      questions.push(`數線上 $A$、$B$ 兩點的中點是 $${midpoint}$，且 $AB=${distance}$，求 $A$、$B$ 兩點的坐標。`);
      summaryAnswers.push(`$${left}$、$${right}$`);
      answers.push(
        `簡答：$${left}$、$${right}$。中點左右距離相等，而 $AB=${distance}$，所以每邊各是 $${half}$。因此兩點坐標是 $${midpoint}-${half}=${left}$、$${midpoint}+${half}=${right}$。`
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
        buildAbsCountBasicSet,
        buildAbsCountTwoSidedSet,
        buildAbsCountReverseSet,
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
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-12, 12),
        b = randInt(-12, 12);
      const c = randInt(-12, 12),
        d = randInt(-12, 12);
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

  function countIntegersInRange(minValue, maxValue, category) {
    let total = 0;
    for (let x = Math.ceil(minValue); x <= Math.floor(maxValue); x += 1) {
      if (category === '整數') {
        total += 1;
      } else if (category === '正整數') {
        if (x > 0) total += 1;
      } else if (category === '非負整數') {
        if (x >= 0) total += 1;
      } else if (category === '非正整數') {
        if (x <= 0) total += 1;
      } else if (category === '負整數') {
        if (x < 0) total += 1;
      }
    }
    return total;
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
        question = `絕對值小於或等於${n}的${category}共有幾個？`;
      } else if (mode === 1) {
        result = countIntegersInRange(-n, n, category);
        question = `絕對值不大於${n}的${category}共有幾個？`;
      } else {
        result = countIntegersInRange(-n + 1, n - 1, category);
        question = `絕對值小於${n}的${category}共有幾個？`;
      }

      questions.push(question);
      summaryAnswers.push(`$${result}$`);
      answers.push(`${result}`);
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
      answers.push(`${result}`);
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
      questions.push(`$a$為整數，且滿足\\(|x| ${signText} a\\)的${t.category}有${result}個，則$a=$?`);
      summaryAnswers.push(`$${a}$`);
      answers.push(`${a}`);
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
      'opposite-number-equation-drill': {
        type: 'drill',
        title: '相反數問題',
        difficulty: 'easy',
        questionCount: 10,
        generate() {
          return buildOppositeNumberSet(10);
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
        title: '絕對值基礎與計算九小類綜合',
        difficulty: 'medium',
        questionCount: 8,
        generate() {
          return buildJ111AbsoluteValueMixedSet(8);
        },
      },
      'j1-1-1-midpoint-distance-nine-subtypes': {
        type: 'drill',
        title: '數線上的中點與距離九小類綜合',
        difficulty: 'medium',
        questionCount: 8,
        generate() {
          return buildJ111MidpointDistanceMixedSet(8);
        },
      },
      'j1-1-1-origin-unit-six-subtypes': {
        type: 'drill',
        title: '改變原點與單位長六小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ111OriginUnitMixedSet(6);
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
          return buildAbsCountReverseSet(10);
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
  };

  const bundleFingerprint = "j1-bundle-v20260619-v2";
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== "object") return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
