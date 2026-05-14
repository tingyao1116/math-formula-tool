(() => {
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

  function buildMidpointSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-30, 30);
      const b = randInt(-30, 30);
      questions.push(`求 ${a} 與 ${b} 的中點。`);
      const sum = a + b;
      if (sum % 2 === 0) {
        answers.push(`中點 = \\frac{${a}+${b}}{2} = ${sum / 2}`);
      } else {
        answers.push(`中點 = \\frac{${a}+${b}}{2} = \\frac{${sum}}{2}`);
      }
    }
    return { questions, answers };
  }

  function buildDistanceSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-30, 30);
      const b = randInt(-30, 30);
      questions.push(`求 ${a} 與 ${b} 的距離。`);
      answers.push(`距離 = |${a}-${b}| = ${Math.abs(a - b)}`);
    }
    return { questions, answers };
  }

  function buildFourTermIntegerSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const nums = Array.from({ length: 4 }, () => randInt(-30, 30));
      const ops = Array.from({ length: 3 }, () => (randInt(0, 1) ? '+' : '-'));
      let total = nums[0];
      for (let j = 0; j < 3; j += 1) {
        total = ops[j] === '+' ? total + nums[j + 1] : total - nums[j + 1];
      }
      const terms = nums.map((n) => wrapIfNegative(n));
      questions.push(`計算：${terms[0]} ${ops[0]} ${terms[1]} ${ops[1]} ${terms[2]} ${ops[2]} ${terms[3]}`);
      answers.push(`${terms[0]} ${ops[0]} ${terms[1]} ${ops[1]} ${terms[2]} ${ops[2]} ${terms[3]} = ${total}`);
    }
    return { questions, answers };
  }

  function buildThreeProductSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const triples = Array.from({ length: 3 }, () => [pickNonZero(-9, 9), pickNonZero(-9, 9)]);
      const ops = shuffle(['+', '-']);
      const products = triples.map(([a, b]) => a * b);
      const q = `${wrapIfNegative(triples[0][0])}\\times${wrapIfNegative(triples[0][1])} ${ops[0]} ${wrapIfNegative(triples[1][0])}\\times${wrapIfNegative(triples[1][1])} ${ops[1]} ${wrapIfNegative(triples[2][0])}\\times${wrapIfNegative(triples[2][1])}`;
      let total = products[0];
      total = ops[0] === '+' ? total + products[1] : total - products[1];
      total = ops[1] === '+' ? total + products[2] : total - products[2];
      questions.push(`計算：${q}`);
      answers.push(`${wrapIfNegative(products[0])} ${ops[0]} ${wrapIfNegative(products[1])} ${ops[1]} ${wrapIfNegative(products[2])} = ${total}`);
    }
    return { questions, answers };
  }

  function formatClockLabel(hour24) {
    const h = ((hour24 % 24) + 24) % 24;
    if (h === 12) return "中午12時";
    if (h === 0) return "上午12時";
    if (h < 12) return `上午${h}時`;
    return `下午${h - 12}時`;
  }

  function buildTimeBaselineBasicSet(count) {
    const questions = [];
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
      answers.push(`${askValue}`);
    }
    return { questions, answers };
  }

  function buildTimeBaselineAdvancedSet(count) {
    const questions = [];
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
      answers.push(`${v3}`);
    }
    return { questions, answers };
  }

  function buildOppositeNumberSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const c = pickNonZero(-15, 15);
      const x = randInt(-20, 20);
      const exprValue = x + c;
      const opposite = -exprValue;
      const exprText = c >= 0 ? `x+${c}` : `x${c}`;
      questions.push(`${exprText}的相反數是${opposite}，求x=`);
      answers.push(`${x}`);
    }
    return { questions, answers };
  }

  function buildMidpointDistanceCombinedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-20, 20);
      let b = randInt(-20, 20);
      while (b === a) b = randInt(-20, 20);
      const midpoint = (a + b) / 2;
      const distance = Math.abs(a - b);
      questions.push(`數線上有A(${a})和B(${b})兩點，求A、B兩點的中點座標和距離？`);
      answers.push(`中點=${midpoint}，距離=${distance}`);
    }
    return { questions, answers };
  }

  function buildSameShiftOppositeSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-20, 20);
      const b = pickNonZero(-20, 20);
      const usePlus = randInt(0, 1) === 1;
      const x = usePlus ? -(a + b) / 2 : (a + b) / 2;
      const opText = usePlus ? "加" : "減";
      questions.push(`${a}和${b}兩數，同時${opText}x後成相反數，求x=?`);
      answers.push(`${x}`);
    }
    return { questions, answers };
  }

  function buildMidpointReverseSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-20, 20);
      const c = randInt(-20, 20);
      if (a === c) { i -= 1; continue; }
      const b = (a + c) / 2;
      if (i === 0) {
        questions.push(`數線上有A(${a})、B(${b})和C(c)三點，且B為A、C中點，求c=?`);
      } else {
        questions.push(`A(${a})、B(${b})和C(c)，求c=?`);
      }
      answers.push(`${c}`);
    }
    return { questions, answers };
  }

  function buildMidpointPlusDistanceSet(count) {
    const questions = [];
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
      answers.push(`${dist}`);
    }
    return { questions, answers };
  }

  function buildThreePointQuickDistanceSet(count) {
    const questions = [];
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
      answers.push(`AB=${ab}，BC=${bc}，CA=${ca}`);
    }
    return { questions, answers };
  }

  function buildCoordinateOriginUnitChangeSet(count) {
    const questions = [];
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
      const scaleText = s >= 1 ? `放大${s}倍` : `縮小為${s === 0.5 ? "2分之1" : "4分之1"}`;
      if (i === 0) {
        questions.push(`A(${a})、B(${b})、C(${c})，B當新原點，單位長${scaleText}，求A、C新的坐標。`);
      } else {
        questions.push(`A(${a})、B(${b})、C(${c})，單位長${scaleText}，求A、C新坐標。`);
      }
      answers.push(`A'=${aNew}，C'=${cNew}`);
    }
    return { questions, answers };
  }

  function fmtFraction(n, d) {
    return String.raw`\frac{${n}}{${d}}`;
  }

  function formatTerm(coef, variable = 'x') {
    if (coef === 1) return variable;
    if (coef === -1) return `-${variable}`;
    return `${coef}${variable}`;
  }

  function trimFixed(value, digits = 2) {
    return Number(value).toFixed(digits).replace(/\.?0+$/, '');
  }

  function formatLinearExpr(a, b) {
    const xPart = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
    if (b === 0) return xPart;
    return `${xPart}${b > 0 ? '+' : ''}${b}`;
  }

  function formatPolynomialFromCoeffs(coeffs, variable = 'x') {
    const degree = coeffs.length - 1;
    const parts = [];
    coeffs.forEach((coef, index) => {
      if (coef === 0) return;
      const power = degree - index;
      const absCoef = Math.abs(coef);
      let term = '';
      if (power === 0) {
        term = `${absCoef}`;
      } else if (power === 1) {
        term = absCoef === 1 ? variable : `${absCoef}${variable}`;
      } else {
        term = absCoef === 1 ? `${variable}^${power}` : `${absCoef}${variable}^${power}`;
      }

      if (!parts.length) {
        parts.push(coef < 0 ? `-${term}` : term);
      } else {
        parts.push(coef < 0 ? `- ${term}` : `+ ${term}`);
      }
    });
    return parts.join(' ') || '0';
  }

  function buildCubicDivideLinearSet(count) {
    const questions = [];
    const answers = [];

    while (questions.length < count) {
      const a = pickNonZero(-3, 3);
      const b = pickNonZero(-6, 6);
      const q2 = pickNonZero(-4, 4);
      const q1 = pickNonZero(-6, 6);
      const q0 = pickNonZero(-8, 8);

      const c3 = a * q2;
      const c2 = a * q1 + b * q2;
      const c1 = a * q0 + b * q1;
      const c0 = b * q0;
      if ([c3, c2, c1, c0].some((v) => v === 0)) continue;

      const dividend = formatPolynomialFromCoeffs([c3, c2, c1, c0]);
      const divisor = formatPolynomialFromCoeffs([a, b]);
      const quotient = formatPolynomialFromCoeffs([q2, q1, q0]);

      questions.push(`計算：\\((${dividend})\\div(${divisor})\\)`);
      answers.push(`\\((${dividend})\\div(${divisor})=${quotient}\\)` );
    }

    return { questions, answers };
  }

  function buildCubicDivideQuadraticSet(count) {
    const questions = [];
    const answers = [];

    while (questions.length < count) {
      const a = pickNonZero(-3, 3);
      const b = pickNonZero(-6, 6);
      const c = pickNonZero(-8, 8);
      const p = pickNonZero(-4, 4);
      const q = pickNonZero(-6, 6);

      const c3 = a * p;
      const c2 = a * q + b * p;
      const c1 = b * q + c * p;
      const c0 = c * q;
      if ([c3, c2, c1, c0].some((v) => v === 0)) continue;

      const dividend = formatPolynomialFromCoeffs([c3, c2, c1, c0]);
      const divisor = formatPolynomialFromCoeffs([a, b, c]);
      const quotient = formatPolynomialFromCoeffs([p, q]);

      questions.push(`計算：\\((${dividend})\\div(${divisor})\\)`);
      answers.push(`\\((${dividend})\\div(${divisor})=${quotient}\\)`);
    }

    return { questions, answers };
  }

  function buildSquareRootBasicSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const n = randInt(2, 20);
      if (i % 2 === 0) {
        questions.push(`寫出 \\(${n}\\) 的平方根。`);
        answers.push(`\\(${n}\\) 的平方根是 \\(\\pm\\sqrt{${n}}\\)。`);
      } else {
        const k = randInt(1, 15);
        questions.push(`計算主平方根：\\(\\sqrt{${k * k}}\\)。`);
        answers.push(`\\(\\sqrt{${k * k}}=${k}\\)。`);
      }
    }
    return { questions, answers };
  }

  function buildRadicalMulDivSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 12);
      const b = randInt(2, 12);
      if (i % 2 === 0) {
        questions.push(`計算：\\(\\sqrt{${a}}\\cdot\\sqrt{${b}}\\)。`);
        answers.push(`\\(\\sqrt{${a}}\\cdot\\sqrt{${b}}=\\sqrt{${a * b}}\\)。`);
      } else {
        const m = randInt(2, 12);
        const n = randInt(2, 12);
        questions.push(`計算：\\(\\frac{\\sqrt{${m * n}}}{\\sqrt{${n}}}\\)。`);
        answers.push(`\\(\\frac{\\sqrt{${m * n}}}{\\sqrt{${n}}}=\\sqrt{${m}}\\)。`);
      }
    }
    return { questions, answers };
  }

  function buildRadicalAddLikeTermsSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const k = randInt(2, 15);
      const c1 = pickNonZero(-8, 8);
      const c2 = pickNonZero(-8, 8);
      questions.push(`化簡：\\(${c1}\\sqrt{${k}} ${c2 >= 0 ? '+' : '-'} ${Math.abs(c2)}\\sqrt{${k}}\\)。`);
      answers.push(`\\(${c1}\\sqrt{${k}} ${c2 >= 0 ? '+' : '-'} ${Math.abs(c2)}\\sqrt{${k}}=(${c1 + c2})\\sqrt{${k}}\\)。`);
    }
    return { questions, answers };
  }

  function buildSimplestRadicalSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const out = randInt(2, 9);
      const inside = randInt(2, 12);
      const n = out * out * inside;
      questions.push(`化為最簡根式：\\(\\sqrt{${n}}\\)。`);
      answers.push(`\\(\\sqrt{${n}}=${out}\\sqrt{${inside}}\\)。`);
    }
    return { questions, answers };
  }

  function buildRationalizeMonomialSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 18);
      questions.push(`有理化分母：\\(\\frac{1}{\\sqrt{${a}}}\\)。`);
      answers.push(`\\(\\frac{1}{\\sqrt{${a}}}=\\frac{\\sqrt{${a}}}{${a}}\\)。`);
    }
    return { questions, answers };
  }

  function buildRationalizeBinomialSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 9);
      const b = randInt(2, 20);
      questions.push(`有理化分母：\\(\\frac{1}{${a}+\\sqrt{${b}}}\\)。`);
      answers.push(`\\(\\frac{1}{${a}+\\sqrt{${b}}}=\\frac{${a}-\\sqrt{${b}}}{(${a}+\\sqrt{${b}})(${a}-\\sqrt{${b}})}=\\frac{${a}-\\sqrt{${b}}}{${a * a - b}}\\)。`);
    }
    return { questions, answers };
  }

  function buildAbsFourTermsSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-20, 20);
      const b = randInt(-20, 20);
      const c = randInt(-20, 20);
      const d = randInt(-20, 20);
      questions.push(`計算：\\(|${a}| ${b >= 0 ? '+' : '-'} ${Math.abs(b)} ${c >= 0 ? '+' : '-'} |${c}| ${d >= 0 ? '+' : '-'} ${Math.abs(d)}\\)`);
      const value = Math.abs(a) + b + (c >= 0 ? Math.abs(c) : -Math.abs(c)) + d;
      answers.push(`\\(|${a}| ${b >= 0 ? '+' : '-'} ${Math.abs(b)} ${c >= 0 ? '+' : '-'} |${c}| ${d >= 0 ? '+' : '-'} ${Math.abs(d)}=${value}\\)`);
    }
    return { questions, answers };
  }

  function buildAbsTwoGroupsSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-12, 12), b = randInt(-12, 12);
      const c = randInt(-12, 12), d = randInt(-12, 12);
      const op = i % 2 === 0 ? '+' : '-';
      const left = Math.abs(a + b);
      const right = Math.abs(c + d);
      const result = op === '+' ? left + right : left - right;
      questions.push(`計算：\\(|(${a})+(${b})| ${op} |(${c})+(${d})|\\)`);
      answers.push(`\\(|(${a})+(${b})| ${op} |(${c})+(${d})|=${left} ${op} ${right}=${result}\\)`);
    }
    return { questions, answers };
  }

  function buildAbsRemoveAndCalcSet(count) {
    const questions = [];
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
      answers.push(`\\(|(${a})+(${b})| ${op} |(${c})+(${d})|=${v1} ${op} ${v2}=${result}\\)`);
    }
    return { questions, answers };
  }

  function countIntegersInRange(minValue, maxValue, category) {
    let total = 0;
    for (let x = Math.ceil(minValue); x <= Math.floor(maxValue); x += 1) {
      if (category === "整數") {
        total += 1;
      } else if (category === "正整數") {
        if (x > 0) total += 1;
      } else if (category === "非負整數") {
        if (x >= 0) total += 1;
      } else if (category === "非正整數") {
        if (x <= 0) total += 1;
      } else if (category === "負整數") {
        if (x < 0) total += 1;
      }
    }
    return total;
  }

  function buildAbsCountBasicSet(count) {
    const questions = [];
    const answers = [];
    const categories = ["整數", "正整數", "非負整數", "非正整數", "負整數"];

    for (let i = 0; i < count; i += 1) {
      const n = randInt(4, 15);
      const category = categories[randInt(0, categories.length - 1)];
      const mode = randInt(0, 1); // 0: <=, 1: <
      let question = "";
      let result = 0;

      if (mode === 0) {
        result = countIntegersInRange(-n, n, category);
        question = `絕對值小於或等於${n}的${category}共有幾個？`;
      } else {
        result = countIntegersInRange(-n + 1, n - 1, category);
        question = `絕對值小於${n}的${category}共有幾個？`;
      }

      questions.push(question);
      answers.push(`${result}`);
    }
    return { questions, answers };
  }

  function buildAbsCountTwoSidedSet(count) {
    const questions = [];
    const answers = [];
    const categories = ["整數", "正整數", "非負整數"];

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
      const rightSymbol = includeUpper ? "\\le" : "<";

      questions.push(`符合\\(${lower}\\le |甲| ${rightSymbol} ${upper}\\)的${category}甲共有幾個？`);
      answers.push(`${result}`);
    }
    return { questions, answers };
  }

  function buildAbsCountReverseSet(count) {
    const questions = [];
    const answers = [];
    const templates = [
      { category: "整數", strict: false, minA: 4, maxA: 16 },
      { category: "整數", strict: true, minA: 5, maxA: 18 },
      { category: "正整數", strict: false, minA: 3, maxA: 15 },
      { category: "正整數", strict: true, minA: 4, maxA: 16 },
      { category: "非負整數", strict: false, minA: 3, maxA: 15 },
      { category: "非負整數", strict: true, minA: 4, maxA: 16 }
    ];

    for (let i = 0; i < count; i += 1) {
      const t = templates[randInt(0, templates.length - 1)];
      const a = randInt(t.minA, t.maxA);
      const lower = t.strict ? -a + 1 : -a;
      const upper = t.strict ? a - 1 : a;
      const result = countIntegersInRange(lower, upper, t.category);
      const signText = t.strict ? "<" : "\\le";
      questions.push(`a為整數，且滿足\\(|x| ${signText} a\\)的${t.category}有${result}個，則a=?`);
      answers.push(`${a}`);
    }
    return { questions, answers };
  }

  function buildAbsEquationLeadingOneSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const s = pickNonZero(-25, 25);
      const rhs = randInt(0, 18);
      const base = `求滿足 |x${s >= 0 ? '+' : ''}${s}|=${rhs} 的 x=?`;
      questions.push(base);
      if (rhs < 0) {
        answers.push("無解");
      } else if (rhs === 0) {
        answers.push(`x=${-s}`);
      } else {
        answers.push(`x=${-s + rhs} 或 ${-s - rhs}`);
      }
    }
    return { questions, answers };
  }

  function buildAbsEquationLeadingNotOneSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-10, 10);
      if (Math.abs(a) === 1) { i -= 1; continue; }
      const b = pickNonZero(-24, 24);
      const rhs = randInt(0, 20);
      questions.push(`求滿足 |${a}x${b >= 0 ? '+' : ''}${b}|=${rhs} 的 x=?`);
      if (rhs === 0) {
        answers.push(`x=${formatSolvedX(-b, a)}`);
      } else {
        answers.push(`x=${formatSolvedX(rhs - b, a)} 或 ${formatSolvedX(-rhs - b, a)}`);
      }
    }
    return { questions, answers };
  }

  function buildNonnegativeSumZeroSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = pickNonZero(-12, 12);
      const b = pickNonZero(-12, 12);
      const c = pickNonZero(-12, 12);
      questions.push(`已知 |x${a >= 0 ? '-' : '+'}${Math.abs(a)}|+|y${b >= 0 ? '-' : '+'}${Math.abs(b)}|+|z${c >= 0 ? '-' : '+'}${Math.abs(c)}|=0，且 x,y,z 為整數，則 x,y,z 為多少？`);
      answers.push(`${a}, ${b}, ${c}`);
    }
    return { questions, answers };
  }

  function buildNonnegativeSumFixedOneSet(count) {
    const questions = [];
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
      questions.push(`已知 |x${a >= 0 ? '-' : '+'}${Math.abs(a)}|+|y${b >= 0 ? '-' : '+'}${Math.abs(b)}|+|z${c >= 0 ? '-' : '+'}${Math.abs(c)}|=${rhs}，且 x,y,z 為整數，則求一組 x,y,z。`);
      answers.push(`${x}, ${y}, ${z}`);
    }
    return { questions, answers };
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
      if (possibleX.length < 2) { i -= 1; continue; }
      questions.push(`已知 |x${a >= 0 ? '-' : '+'}${Math.abs(a)}|+${p}|y${b >= 0 ? '-' : '+'}${Math.abs(b)}|+${q}|z${c >= 0 ? '-' : '+'}${Math.abs(c)}|=${rhs}，且 x,y,z 為整數，則 x 可能為多少？`);
      answers.push(possibleX.join("、"));
    }
    return { questions, answers };
  }

  function buildAbsoluteBothSidesAdvancedSet(count) {
    const questions = [];
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
      answers.push(uniq.length ? uniq.join(" 或 ") : "無解");
    }
    return { questions, answers };
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
    const idx = template.indexOf("□");
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
    return { questions, answers };
  }

  function buildModuloUnknownMultipleSet(mod, count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const n = buildLargeNumberString(randInt(7, 10));
      const holeIndex = randInt(1, n.length - 1);
      const template = replaceAt(n, holeIndex, "□");
      const validDigits = solveUnknownDigit(template, mod, 0);
      questions.push(`${template}為${mod}的倍數，求□=?`);
      answers.push(validDigits.length ? validDigits.join(" 或 ") : "無解");
    }
    return { questions, answers };
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
      const template = replaceAt(n, holeIndex, "□");
      const validDigits = solveUnknownDigit(template, mod, target);
      questions.push(`${template}除以${mod}餘${target}，求□=?`);
      answers.push(validDigits.length ? validDigits.join(" 或 ") : "無解");
    }
    return { questions, answers };
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  function buildSeparateGroupingSet(count) {
    const questions = [];
    const answers = [];
    const stem = "男生女生分別分組，每組人數相同，最少可以分成幾組，每組多少人？";
    for (let i = 0; i < count; i += 1) {
      const unit = randInt(8, 24);
      const boysGroups = randInt(8, 20);
      const girlsGroups = randInt(8, 20);
      const boys = unit * boysGroups;
      const girls = unit * girlsGroups;
      const eachGroup = gcd(boys, girls);
      const minGroupCount = boys / eachGroup + girls / eachGroup;
      questions.push(`男生有${boys}人，女生有${girls}人。`);
      answers.push(`${minGroupCount}組，每組${eachGroup}人`);
    }
    return { intro: stem, questions, answers };
  }

  function buildMixedGroupingSet(count) {
    const questions = [];
    const answers = [];
    const stem = "男生女生合併分組，各組男生人數和女生人數都要相同，最多可分為多少組，男女分別為多少人？";
    for (let i = 0; i < count; i += 1) {
      const groups = randInt(8, 20);
      const boysEach = randInt(6, 28);
      const girlsEach = randInt(6, 28);
      const boys = groups * boysEach;
      const girls = groups * girlsEach;
      const maxGroups = gcd(boys, girls);
      questions.push(`男生有${boys}人，女生有${girls}人。`);
      answers.push(`${maxGroups}組，男生每組${boys / maxGroups}人，女生每組${girls / maxGroups}人`);
    }
    return { intro: stem, questions, answers };
  }

  function buildCircularTrackSet(count) {
    const questions = [];
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
      answers.push(`${meetMinutes}`);
    }
    return { intro: stem, questions, answers };
  }

  function buildRoadTreeCountSet(count) {
    const questions = [];
    const answers = [];
    const stem = "道路種樹，相鄰樹與樹距離相等，最少要種幾棵？";
    for (let i = 0; i < count; i += 1) {
      const spacing = randInt(10, 20);
      const intervals = randInt(12, 32);
      const length = spacing * intervals;
      const mode = randInt(0, 2); // 0: 頭尾不種 1: 一端種 2: 頭尾都種
      let desc = "";
      let trees = 0;
      if (mode === 0) {
        desc = "頭尾都不種";
        trees = intervals - 1;
      } else if (mode === 1) {
        desc = "頭種尾不種";
        trees = intervals;
      } else {
        desc = "頭尾都要種";
        trees = intervals + 1;
      }
      questions.push(i === 0 ? `${stem}<br>道路長${length}公尺，每${spacing}公尺種一棵樹，${desc}。` : `道路長${length}公尺，每${spacing}公尺種一棵樹，${desc}。`);
      answers.push(`${trees}`);
    }
    return { questions, answers };
  }

  function computeSingleSideRoadTrees(length, spacing, mode) {
    const intervals = Math.floor(length / spacing);
    if (mode === "both") return intervals + 1;
    if (mode === "none") return intervals - 1;
    if (mode === "one-end") return intervals;
    return intervals; // loop
  }

  function buildRoadPlantingSingleSet(count) {
    const questions = [];
    const answers = [];
    const stem = "道路種樹（單側），相鄰樹距固定，求最少樹數。";
    for (let i = 0; i < count; i += 1) {
      const spacing = randInt(10, 20);
      const intervals = randInt(12, 30);
      const length = spacing * intervals;
      const modePick = randInt(0, 3);
      const mode = ["both", "none", "one-end", "loop"][modePick];
      let desc = "";
      if (mode === "both") desc = "頭尾都種";
      if (mode === "none") desc = "頭尾都不種";
      if (mode === "one-end") desc = "頭種尾不種";
      if (mode === "loop") desc = "環狀種樹";
      const trees = computeSingleSideRoadTrees(length, spacing, mode);
      questions.push(`道路長${length}公尺，每${spacing}公尺種一棵，${desc}。`);
      answers.push(`${trees}`);
    }
    return { intro: stem, questions, answers };
  }

  function buildRoadPlantingDoubleSet(count) {
    const questions = [];
    const answers = [];
    const stem = "道路種樹（兩側），相鄰樹距固定，求最少樹數。";
    for (let i = 0; i < count; i += 1) {
      const spacing = randInt(10, 20);
      const intervals = randInt(12, 30);
      const length = spacing * intervals;
      const modePick = randInt(0, 2);
      const mode = ["both", "none", "one-end"][modePick];
      let desc = "";
      if (mode === "both") desc = "頭尾都種";
      if (mode === "none") desc = "頭尾都不種";
      if (mode === "one-end") desc = "頭種尾不種";
      const oneSide = computeSingleSideRoadTrees(length, spacing, mode);
      const trees = oneSide * 2;
      questions.push(`道路長${length}公尺，每${spacing}公尺種一棵，${desc}。`);
      answers.push(`${trees}`);
    }
    return { intro: stem, questions, answers };
  }

  function buildTriangleParkTreeSet(count) {
    const questions = [];
    const answers = [];
    const stem = "三角公園周圍種樹，相鄰樹與樹距離相等，最少要種幾棵？";
    for (let i = 0; i < count; i += 1) {
      const g = [8, 10, 12, 14, 16][randInt(0, 4)];
      const a = g * randInt(10, 20);
      const b = g * randInt(10, 22);
      const c = g * randInt(10, 24);
      const d = gcd(gcd(a, b), c);
      const perimeterUnits = (a + b + c) / d;
      const withVertices = randInt(0, 1) === 1;
      const trees = withVertices ? perimeterUnits : perimeterUnits - 3;
      const vertexText = withVertices ? "三個頂點也要種樹" : "三個頂點不種樹";
      questions.push(i === 0 ? `${stem}<br>三邊長分別是${a}公尺、${b}公尺、${c}公尺，${vertexText}。` : `三邊長分別是${a}公尺、${b}公尺、${c}公尺，${vertexText}。`);
      answers.push(`${trees}`);
    }
    return { questions, answers };
  }

  function buildRoadReplantKeepSet(count) {
    const questions = [];
    const answers = [];
    const stem = "長道路改變植樹間距，不需移動有幾棵？";
    for (let i = 0; i < count; i += 1) {
      const oldGap = [10, 20, 30, 40, 50][randInt(0, 4)];
      const newGap = [15, 25, 30, 45, 50, 55][randInt(0, 5)];
      const base = lcm(oldGap, newGap);
      const k = randInt(8, 22);
      const length = base * k;
      const bothSides = randInt(0, 1) === 1;
      const oneSideCount = length / base + 1;
      const keepCount = bothSides ? oneSideCount * 2 : oneSideCount;
      const sideText = bothSides ? "道路兩側種樹" : "道路一側種樹";
      questions.push(`長${length}公尺${sideText}，原本每${oldGap}公尺種一棵，改為每${newGap}公尺種一棵。`);
      answers.push(`${keepCount}`);
    }
    return { intro: stem, questions, answers };
  }

  function buildRectangleMaxSquarePiecesSet(count) {
    const questions = [];
    const answers = [];
    const stem = "長方形裁成大小相同正方形，當正方形邊長最大時，最少可裁幾塊？";
    for (let i = 0; i < count; i += 1) {
      const g = [7, 8, 9, 10, 11, 12][randInt(0, 5)];
      const lMul = randInt(6, 14);
      const wMul = randInt(4, lMul - 1);
      const length = g * lMul;
      const width = g * wMul;
      const pieces = (length / g) * (width / g);
      questions.push(`長方形長${length}公分、寬${width}公分。`);
      answers.push(`${pieces}`);
    }
    return { intro: stem, questions, answers };
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
    const answers = [];
    const stem = "長方形裁成一些正方形，最少可裁幾塊？";
    for (let i = 0; i < count; i += 1) {
      const length = randInt(40, 180);
      let width = randInt(24, length - 1);
      while (width === length) width = randInt(24, length - 1);
      const pieces = euclideanSquareCount(length, width);
      questions.push(`長方形長${length}公分、寬${width}公分。`);
      answers.push(`${pieces}`);
    }
    return { intro: stem, questions, answers };
  }

  function buildLinearRemoveParenthesesSet(count) {
    const questions = [];
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
      answers.push(`\\(-(${left})${op}(${right})=${formatLinearExpr(coef, constant)}\\)`);
    }
    return { questions, answers };
  }

  function buildLinearMultiplyParenthesesSet(count) {
    const questions = [];
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
      answers.push(`\\(${p}(${left})${op}${q}(${right})=${formatLinearExpr(coef, constant)}\\)`);
    }
    return { questions, answers };
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

  function buildLinearFractionParenthesesSet(count) {
    const questions = [];
    const answers = [];
    const denChoices = [2, 3, 4, 5, 6, 7, 8, 9];

    for (let i = 0; i < count; i += 1) {
      const a1 = pickNonZero(-12, 12), b1 = pickNonZero(-12, 12);
      const a2 = pickNonZero(-12, 12), b2 = pickNonZero(-12, 12);
      const d1 = denChoices[randInt(0, denChoices.length - 1)];
      const d2 = denChoices[randInt(0, denChoices.length - 1)];
      const op = randInt(0, 1) ? '+' : '-';

      const coefNum = op === '+' ? (a1 * d2 + a2 * d1) : (a1 * d2 - a2 * d1);
      const constNum = op === '+' ? (b1 * d2 + b2 * d1) : (b1 * d2 - b2 * d1);
      const commonDen = d1 * d2;
      const sCoef = simplifyFraction(coefNum, commonDen);
      const sConst = simplifyFraction(constNum, commonDen);

      const frac1 = String.raw`\frac{${a1}x${b1 >= 0 ? '+' : ''}${b1}}{${d1}}`;
      const frac2 = String.raw`\frac{${a2}x${b2 >= 0 ? '+' : ''}${b2}}{${d2}}`;
      const coefText = sCoef.den === 1 ? `${sCoef.num}x` : String.raw`\frac{${sCoef.num}}{${sCoef.den}}x`;
      const constText = sConst.num === 0
        ? ''
        : (sConst.den === 1
          ? `${sConst.num > 0 ? '+' : ''}${sConst.num}`
          : `${sConst.num > 0 ? '+' : ''}${String.raw`\frac{${sConst.num}}{${sConst.den}}`}`);

      questions.push(`化簡：\\(${frac1} ${op} ${frac2}\\)`);
      answers.push(`\\(${frac1} ${op} ${frac2}=${coefText}${constText}\\)`);
    }
    return { questions, answers };
  }

  function formatSolvedX(num, den) {
    const f = simplifyFraction(num, den);
    if (f.den === 1) return `${f.num}`;
    return String.raw`\frac{${f.num}}{${f.den}}`;
  }

  function buildLinearMoveTermsSolveSet(count) {
    const questions = [];
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
      answers.push(`\\(${coef}x=${constant}\\Rightarrow x=${formatSolvedX(constant, coef)}\\)`);
    }
    return { questions, answers };
  }

  function buildLinearExpandMoveSolveSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const p = pickNonZero(-10, 10);
      const q = pickNonZero(-10, 10);
      const a1 = pickNonZero(-12, 12);
      const b1 = pickNonZero(-12, 12);
      const a2 = pickNonZero(-12, 12);
      const b2 = pickNonZero(-12, 12);
      const coef = p * a1 - q * a2;
      if (coef === 0) { i -= 1; continue; }
      const constant = q * b2 - p * b1;
      const left = formatLinearExpr(a1, b1);
      const right = formatLinearExpr(a2, b2);
      questions.push(`解：\\(${p}(${left})=${q}(${right})\\)`);
      answers.push(`\\(${coef}x=${constant}\\Rightarrow x=${formatSolvedX(constant, coef)}\\)`);
    }
    return { questions, answers };
  }

  function buildLinearCrossMultiplySolveSet(count) {
    const questions = [];
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
      if (coef === 0) { i -= 1; continue; }
      const constant = m * b2 - n * b1;
      const leftNum = formatLinearExpr(a1, b1);
      const rightNum = formatLinearExpr(a2, b2);
      questions.push(`解：\\(\\frac{${leftNum}}{${m}}=\\frac{${rightNum}}{${n}}\\)`);
      answers.push(`\\(${n}(${leftNum})=${m}(${rightNum})\\Rightarrow ${coef}x=${constant}\\Rightarrow x=${formatSolvedX(constant, coef)}\\)`);
    }
    return { questions, answers };
  }

  function buildLinearLcmMultiplySolveSet(count) {
    const questions = [];
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
      const op = randInt(0, 1) ? "+" : "-";
      const secondCoef = op === "+" ? a2 : -a2;
      const secondConst = op === "+" ? b2 : -b2;
      const coef2 = (l / n) * secondCoef;
      const const2 = (l / n) * secondConst;
      const finalCoef = (l / m) * a1 + coef2;
      if (finalCoef === 0) { i -= 1; continue; }
      const finalConstant = l * c - (l / m) * b1 - const2;
      questions.push(`解：\\(\\frac{${left1}}{${m}} ${op} \\frac{${left2}}{${n}}=${c}\\)`);
      answers.push(`同乘\\(${l}\\)：\\(${finalCoef}x=${finalConstant}\\Rightarrow x=${formatSolvedX(finalConstant, finalCoef)}\\)`);
    }
    return { questions, answers };
  }

  function buildJ1DistributiveLawSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = [100, 200, 300, 400, 500][randInt(0, 4)];
      const offset = [1, 2, 3, 4, 5][randInt(0, 4)] * (randInt(0, 1) ? 1 : -1);
      const multiplier = [25, 30, 40, 50][randInt(0, 3)] * (randInt(0, 1) ? 1 : -1);
      const a = (randInt(0, 1) ? 1 : -1) * base + offset;
      const mText = wrapIfNegative(multiplier);
      questions.push(`計算：\\(${wrapIfNegative(a)}\\times${mText}\\)`);
      answers.push(`\\(${wrapIfNegative(a)}\\times${mText}=(${a - offset}${offset >= 0 ? '+' : ''}${offset})\\times${mText}=${(a - offset) * multiplier}${offset >= 0 ? '+' : ''}${offset * multiplier}=${a * multiplier}\\)`);
    }
    return { questions, answers };
  }

  function buildJ1CommonFactorSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const k = pickNonZero(-90, 90);
      const target = [100, 200, 300, -100, -200, -300][randInt(0, 5)];
      const m = pickNonZero(-320, 320);
      const n = target - m;
      if (n === 0) { i -= 1; continue; }
      const value = k * m + k * n;
      const t1 = `${wrapIfNegative(k)}\\times${wrapIfNegative(m)}`;
      const t2 = `${wrapIfNegative(k)}\\times${wrapIfNegative(n)}`;
      questions.push(`計算：\\(${t1}+${t2}\\)`);
      answers.push(`\\(${t1}+${t2}=${wrapIfNegative(k)}\\times(${wrapIfNegative(m)}+${wrapIfNegative(n)})=${wrapIfNegative(k)}\\times${wrapIfNegative(target)}=${value}\\)`);
    }
    return { questions, answers };
  }

  function buildJ1CommonFactorFourTermsSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const adTarget = [100, 150, 180, 200, 210, 250, 300][randInt(0, 6)] * (randInt(0, 1) ? 1 : -1);
      const bcTarget = [100, 200, -100, -200][randInt(0, 3)];
      const a = pickNonZero(-90, 90);
      const d = adTarget - a;
      const b = pickNonZero(-190, 190);
      const c = bcTarget - b;
      if (d === 0 || c === 0) { i -= 1; continue; }
      const value = adTarget * bcTarget;
      const q1 = `${wrapIfNegative(a)}×${wrapIfNegative(b)}`;
      const q2 = `${wrapIfNegative(a)}×${wrapIfNegative(c)}`;
      const q3 = `${wrapIfNegative(d)}×${wrapIfNegative(b)}`;
      const q4 = `${wrapIfNegative(d)}×${wrapIfNegative(c)}`;
      questions.push(`計算：\\(${q1}+${q2}+${q3}+${q4}\\)`);
      answers.push(`\\(${q1}+${q2}+${q3}+${q4}=${wrapIfNegative(a)}×(${wrapIfNegative(b)}+${wrapIfNegative(c)})+${wrapIfNegative(d)}×(${wrapIfNegative(b)}+${wrapIfNegative(c)})=${wrapIfNegative(a + d)}×(${wrapIfNegative(b)}+${wrapIfNegative(c)})=${wrapIfNegative(adTarget)}×${wrapIfNegative(bcTarget)}=${value}\\)`);
    }
    return { questions, answers };
  }

  function buildJ1VariableNearbySet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(300, 900);
      const b = randInt(300, 900);
      const left1 = a;
      const left2 = b + 1;
      const right1 = a + 1;
      const right2 = b;
      const value = left1 * left2 - right1 * right2;
      questions.push(`計算：\\(${wrapIfNegative(left1)}\\times${wrapIfNegative(left2)}-${wrapIfNegative(right1)}\\times${wrapIfNegative(right2)}\\)`);
      answers.push(`設 ${left1}=a，${right1}=a+1；${right2}=b，${left2}=b+1，則 \\(a(b+1)-(a+1)b=a-b=${a - b}\\)。答案 \\(${value}\\)。`);
    }
    return { questions, answers };
  }

  function buildJ1VariableDistributiveEvalSet(count) {
    const questions = [];
    const answers = [];
    const nChoices = [112, 114, 126, 130, 134];
    const shiftChoices = [-3, -2, -1, 1, 2, 3];
    const typeOrder = shuffle(["shift", "divide11", "multiply5x2"]);

    for (let i = 0; i < count; i += 1) {
      const n = nChoices[randInt(0, nChoices.length - 1)];
      const t = randInt(16, 42);
      const a = 55 * t; // 保證可被 11、5 整除
      const k = a * n;
      const s = shiftChoices[randInt(0, shiftChoices.length - 1)];
      const type = typeOrder[i % typeOrder.length];
      if (type === "shift") {
        const sText = s > 0 ? `+${s}` : `${s}`;
        const value = (a + s) * n;
        questions.push(`已知 甲×${n}=${k}，求：(甲${sText})×${n}。`);
        answers.push(`由 甲×${n}=${k}： (甲${sText})×${n}=甲×${n}${s > 0 ? '+' : ''}${s}×${n}=${k}${s > 0 ? '+' : ''}${s * n}=${value}。`);
      } else if (type === "divide11") {
        const value = (a / 11) * n;
        questions.push(`已知 甲×${n}=${k}，求：(甲÷11)×${n}。`);
        answers.push(`由 甲×${n}=${k}： (甲÷11)×${n}=(甲×${n})÷11=${k}÷11=${value}。`);
      } else {
        const value = (a * 5) * n * 2;
        questions.push(`已知 甲×${n}=${k}，求：(甲×5)×${n}×2。`);
        answers.push(`由 甲×${n}=${k}： (甲×5)×${n}×2=(甲×${n})×10=${k}×10=${value}。`);
      }
    }

    return { questions, answers };
  }

  function weirdOpHash(a, b) { return a * b + a - b; }
  function weirdOpStar(a, b) { return a - Math.abs(a * b) - 3 * b; }
  function weirdOpMark(a, b) { return a * a - b * b; }
  function weirdOpCircle(a, b) { return (a + b) * (a - b); }

  function buildWeirdSymbolCalcSet(count) {
    const questions = [];
    const answers = [];
    const modes = [
      { symbol: "#", fn: weirdOpHash, rule: "a#b=a×b+a-b" },
      { symbol: "☆", fn: weirdOpStar, rule: "a☆b=a-|a×b|-3b" },
      { symbol: "※", fn: weirdOpMark, rule: "a※b=a×a-b×b" },
      { symbol: "⊙", fn: weirdOpCircle, rule: "a⊙b=(a+b)×(a-b)" }
    ];
    const pickedModes = shuffle(modes).slice(0, Math.min(count, modes.length));

    for (let i = 0; i < count; i += 1) {
      const mode = i < pickedModes.length
        ? pickedModes[i]
        : modes[randInt(0, modes.length - 1)];
      const a = pickNonZero(-12, 12);
      const b = pickNonZero(-12, 12);
      const value = mode.fn(a, b);
      questions.push(`求：(${a})${mode.symbol}${b}。`);
      answers.push(`(${a})${mode.symbol}${b}=${value}。`);
    }
    return { questions, answers };
  }

  function buildWeirdSymbolCalcThreeLayerSet(count) {
    const questions = [];
    const answers = [];
    const symbolModes = [
      { symbol: "#", fn: weirdOpHash, rule: "a#b=a×b+a-b" },
      { symbol: "☆", fn: weirdOpStar, rule: "a☆b=a-|a×b|-3b" },
      { symbol: "※", fn: weirdOpMark, rule: "a※b=a×a-b×b" },
      { symbol: "⊙", fn: weirdOpCircle, rule: "a⊙b=(a+b)×(a-b)" }
    ];
    const modePairs = [];
    symbolModes.forEach((inner) => {
      symbolModes.forEach((outer) => {
        modePairs.push({ inner, outer });
      });
    });
    const pickedPairs = shuffle(modePairs).slice(0, Math.min(count, modePairs.length));

    for (let i = 0; i < count; i += 1) {
      const pair = i < pickedPairs.length
        ? pickedPairs[i]
        : modePairs[randInt(0, modePairs.length - 1)];
      const a = pickNonZero(-12, 12);
      const b = pickNonZero(-12, 12);
      const c = pickNonZero(-12, 12);
      const v1 = pair.inner.fn(a, b);
      const v2 = pair.outer.fn(v1, c);
      questions.push(`求：(${a}${pair.inner.symbol}${b})${pair.outer.symbol}${c}。`);
      answers.push(`(${a}${pair.inner.symbol}${b})${pair.outer.symbol}${c}=(${v1})${pair.outer.symbol}${c}=${v2}。`);
    }
    return { questions, answers };
  }

  function buildBinomialQuestions(count, mode, variant) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      if (variant === 'number') {
        const base = [10, 100, 1000][randInt(0, 2)];
        const offset = randInt(1, 12);
        const value = mode === 'sum' ? base + offset : base - offset;
        const sign = mode === 'sum' ? '+' : '-';
        const middle = mode === 'sum' ? 2 * base * offset : -2 * base * offset;
        questions.push(`利用乘法公式計算：\\(${value}^2\\)`);
        answers.push(`\\(${value}^2=(${base}${sign}${offset})^2=${base * base}${middle >= 0 ? '+' : ''}${middle}+${offset * offset}=${value * value}\\)`);
        continue;
      }

      if (variant === 'decimal') {
        const base = [1, 2, 10][randInt(0, 2)];
        const offset = [0.01, 0.02, 0.05, 0.1][randInt(0, 3)];
        const value = mode === 'sum' ? base + offset : base - offset;
        const sign = mode === 'sum' ? '+' : '-';
        const middle = mode === 'sum' ? 2 * base * offset : -2 * base * offset;
        questions.push(`利用乘法公式計算：\\(${trimFixed(value, 2)}^2\\)`);
        answers.push(`\\(${trimFixed(value, 2)}^2=(${trimFixed(base, 2)}${sign}${trimFixed(offset, 2)})^2=${trimFixed(base * base, 4)}${middle >= 0 ? '+' : ''}${trimFixed(middle, 4)}+${trimFixed(offset * offset, 4)}=${trimFixed(value * value, 4)}\\)`);
        continue;
      }

      if (variant === 'fraction') {
        const base = randInt(8, 12);
        const b1 = randInt(1, 4), b2 = 10;
        const sign = mode === 'sum' ? '+' : '-';
        questions.push(`利用乘法公式計算：\\((${base}${sign}${fmtFraction(b1, b2)})^2\\)`);
        answers.push(`\\((${base}${sign}${fmtFraction(b1, b2)})^2=${base}^2${mode === 'sum' ? '+' : '-'}2\\cdot ${base}\\cdot ${fmtFraction(b1, b2)}+(${fmtFraction(b1, b2)})^2\\)`);
        continue;
      }

      const coeff = randInt(1, 6);
      const constant = randInt(1, 9);
      const sign = mode === 'sum' ? '+' : '-';
      const middle = mode === 'sum' ? 2 * coeff * constant : -2 * coeff * constant;
      const term = formatTerm(coeff);
      questions.push(`展開：\\((${term}${sign}${constant})^2\\)`);
      answers.push(`\\((${term}${sign}${constant})^2=${coeff * coeff}x^2${middle >= 0 ? '+' : ''}${middle}x+${constant * constant}\\)`);
    }

    return { questions, answers };
  }

  function buildDifferenceOfSquaresQuestions(count, variant) {
    const questions = [];
    const answers = [];

    for (let i = 0; i < count; i += 1) {
      if (variant === 'number') {
        const base = [10, 100][randInt(0, 1)];
        const offset = [1, 2, 5][randInt(0, 2)];
        if (i % 2 === 0) {
          const left = base + offset;
          const right = base - offset;
          questions.push(`利用乘法公式計算：\\(${left}\\times ${right}\\)`);
          answers.push(`\\(${left}\\times ${right}=(${base}+${offset})(${base}-${offset})=${base * base}-${offset * offset}=${left * right}\\)`);
        } else {
          const a = base + offset;
          const b = base - offset;
          questions.push(`利用乘法公式計算：\\(${a}^2-${b}^2\\)`);
          answers.push(`\\(${a}^2-${b}^2=(${a}+${b})(${a}-${b})=${2 * base}\\times ${2 * offset}=${(a + b) * (a - b)}\\)`);
        }
        continue;
      }

      if (variant === 'decimal') {
        const base = [1, 2][randInt(0, 1)];
        const offset = [0.01, 0.02, 0.05][randInt(0, 2)];
        if (i % 2 === 0) {
          const left = base - offset;
          const right = base + offset;
          questions.push(`利用乘法公式計算：\\(${trimFixed(left, 2)}\\times ${trimFixed(right, 2)}\\)`);
          answers.push(`\\(${trimFixed(left, 2)}\\times ${trimFixed(right, 2)}=(${trimFixed(base, 2)}-${trimFixed(offset, 2)})(${trimFixed(base, 2)}+${trimFixed(offset, 2)})=${trimFixed(base * base, 4)}-${trimFixed(offset * offset, 4)}=${trimFixed(left * right, 4)}\\)`);
        } else {
          const a = base - offset;
          const b = base + offset;
          questions.push(`利用乘法公式計算：\\(${trimFixed(a, 2)}^2-${trimFixed(b, 2)}^2\\)`);
          answers.push(`\\(${trimFixed(a, 2)}^2-${trimFixed(b, 2)}^2=(${trimFixed(a, 2)}+${trimFixed(b, 2)})(${trimFixed(a, 2)}-${trimFixed(b, 2)})=${trimFixed(a + b, 2)}\\times ${trimFixed(a - b, 2)}=${trimFixed(a * a - b * b, 4)}\\)`);
        }
        continue;
      }

      if (variant === 'fraction') {
        const base = randInt(8, 12);
        const b1 = randInt(1, 4), b2 = 5;
        if (i % 2 === 0) {
          questions.push(`利用乘法公式計算：\\((${base}+${fmtFraction(b1, b2)})(${base}-${fmtFraction(b1, b2)})\\)`);
          answers.push(`\\((${base}+${fmtFraction(b1, b2)})(${base}-${fmtFraction(b1, b2)})=${base}^2-(${fmtFraction(b1, b2)})^2\\)`);
        } else {
          questions.push(`利用乘法公式計算：\\((${base}+${fmtFraction(b1, b2)})^2-(${fmtFraction(b1, b2)})^2\\)`);
          answers.push(`\\((${base}+${fmtFraction(b1, b2)})^2-(${fmtFraction(b1, b2)})^2=\\big((${base}+${fmtFraction(b1, b2)})+${fmtFraction(b1, b2)}\\big)\\big((${base}+${fmtFraction(b1, b2)})-${fmtFraction(b1, b2)}\\big)=(${base}+${fmtFraction(2 * b1, b2)})\\cdot ${base}\\)`);
        }
        continue;
      }

      const coeff = randInt(1, 6);
      const constant = randInt(1, 9);
      const term = formatTerm(coeff);
      if (i % 2 === 0) {
        questions.push(`展開：\\((${term}+${constant})(${term}-${constant})\\)`);
        answers.push(`\\((${term}+${constant})(${term}-${constant})=${coeff * coeff}x^2-${constant * constant}\\)`);
      } else {
        questions.push(`展開：\\((${term})^2-${constant}^2\\)`);
        answers.push(`\\((${term})^2-${constant}^2=(${term}+${constant})(${term}-${constant})\\)`);
      }
    }

    return { questions, answers };
  }

  function buildPureConjugateQuestions(count, variant) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (variant === 'number') {
        const center = [100, 1000][randInt(0, 1)];
        const offset = randInt(1, 12);
        questions.push(`利用乘法公式計算：\\(${center + offset}\\times ${center - offset}\\)`);
        answers.push(`\\(${center + offset}\\times ${center - offset}=(${center}+${offset})(${center}-${offset})=${center * center}-${offset * offset}=${(center + offset) * (center - offset)}\\)`);
        continue;
      }
      if (variant === 'decimal') {
        const center = [10, 100, 300][randInt(0, 2)];
        const offset = [0.01, 0.05, 0.1][randInt(0, 2)];
        questions.push(`利用乘法公式計算：\\(${trimFixed(center + offset, 2)}\\times ${trimFixed(center - offset, 2)}\\)`);
        answers.push(`\\(${trimFixed(center + offset, 2)}\\times ${trimFixed(center - offset, 2)}=(${center}+${trimFixed(offset, 2)})(${center}-${trimFixed(offset, 2)})=${center * center}-${trimFixed(offset * offset, 4)}=${trimFixed((center + offset) * (center - offset), 4)}\\)`);
        continue;
      }
      if (variant === 'fraction') {
        const center = randInt(10, 50);
        const num = randInt(1, 4);
        const den = [5, 7, 9, 11][randInt(0, 3)];
        questions.push(`利用乘法公式計算：\\((${center}+${fmtFraction(num, den)})(${center}-${fmtFraction(num, den)})\\)`);
        answers.push(`\\((${center}+${fmtFraction(num, den)})(${center}-${fmtFraction(num, den)})=${center}^2-(${fmtFraction(num, den)})^2\\)`);
      }
    }
    return { questions, answers };
  }

  function buildPureSquareDifferenceQuestions(count, variant) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      if (variant === 'number') {
        const center = [100, 1000, 3000][randInt(0, 2)];
        const offset = randInt(1, 12);
        const a = center - offset;
        const b = center + offset;
        questions.push(`利用乘法公式計算：\\(${a}^2-${b}^2\\)`);
        answers.push(`\\(${a}^2-${b}^2=(${a}+${b})(${a}-${b})=${2 * center}\\times ${-2 * offset}=${a * a - b * b}\\)`);
        continue;
      }
      if (variant === 'decimal') {
        const center = [2, 40, 100][randInt(0, 2)];
        const offset = [0.001, 0.01, 0.1][randInt(0, 2)];
        const a = center - offset;
        const b = center + offset;
        questions.push(`利用乘法公式計算：\\(${trimFixed(a, 3)}^2-${trimFixed(b, 3)}^2\\)`);
        answers.push(`\\(${trimFixed(a, 3)}^2-${trimFixed(b, 3)}^2=(${trimFixed(a + b, 3)})(${trimFixed(a - b, 3)})=${trimFixed(a * a - b * b, 6)}\\)`);
        continue;
      }
      if (variant === 'fraction') {
        const center = randInt(10, 60);
        const leftN = randInt(1, 5);
        const rightN = randInt(1, 5);
        const den = [6, 9, 11][randInt(0, 2)];
        questions.push(`利用乘法公式計算：\\((${center}${fmtFraction(leftN, den)})^2-(${center}${fmtFraction(rightN, den)})^2\\)`);
        answers.push(`\\(=\\big((${center}${fmtFraction(leftN, den)})+(${center}${fmtFraction(rightN, den)})\\big)\\big((${center}${fmtFraction(leftN, den)})-(${center}${fmtFraction(rightN, den)})\\big)\\)`);
      }
    }
    return { questions, answers };
  }

  function buildFactorizationQuestions(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 6);
      const b = randInt(1, 9);
      const left = `${a * a === 1 ? '' : a * a}x^2-${b * b}`;
      const term = formatTerm(a);
      questions.push(`分解：\\(${left}\\)`);
      answers.push(`\\(${left}=(${term}+${b})(${term}-${b})\\)`);
    }
    return { questions, answers };
  }

  function buildIdentityIntegerBasicSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-8, 8);
      const b = randInt(-8, 8);
      const sum = a + b;
      const prod = a * b;
      const sqsum = a * a + b * b;
      const diff = a - b;
      if (i % 2 === 0) {
        questions.push(`已知 \\(a+b=${sum}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\)、\\(a-b\\)。`);
        answers.push(`\\(ab=\\frac{(a+b)^2-(a^2+b^2)}{2}=\\frac{${sum * sum}-${sqsum}}{2}=${prod}\\)，\\(a-b=${diff}\\) 或 \\(${-diff}\\)。`);
      } else {
        questions.push(`已知 \\(ab=${prod}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(a+b\\)、\\(a-b\\)。`);
        answers.push(`\\((a+b)^2=${sqsum}+2(${prod})=${sqsum + 2 * prod}\\)，所以 \\(a+b=${sum}\\) 或 \\(${-sum}\\)；\\(a-b=${diff}\\) 或 \\(${-diff}\\)。`);
      }
    }
    return { questions, answers };
  }

  function buildSumSqsumToProductSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-8, 8);
      const b = randInt(-8, 8);
      const sum = a + b;
      const sqsum = a * a + b * b;
      const prod = a * b;
      questions.push(`已知 \\(a+b=${sum}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\)。`);
      answers.push(`\\(ab=\\frac{(a+b)^2-(a^2+b^2)}{2}=\\frac{${sum * sum}-${sqsum}}{2}=${prod}\\)。`);
    }
    return { questions, answers };
  }

  function buildDiffSqsumToProductSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-8, 8);
      const b = randInt(-8, 8);
      const diff = a - b;
      const sqsum = a * a + b * b;
      const prod = a * b;
      questions.push(`已知 \\(a-b=${diff}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(ab\\)。`);
      answers.push(`\\((a-b)^2=a^2-2ab+b^2\\Rightarrow ab=\\frac{${sqsum}-${diff * diff}}{2}=${prod}\\)。`);
    }
    return { questions, answers };
  }

  function buildIdentitySumProductSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-7, 7);
      const b = randInt(-7, 7);
      const sum = a + b;
      const prod = a * b;
      const sqsum = a * a + b * b;
      const diff2 = (a - b) * (a - b);
      questions.push(`已知 \\(a+b=${sum}\\)、\\(ab=${prod}\\)，求 \\(a^2+b^2\\)、\\((a-b)^2\\)。`);
      answers.push(`\\(a^2+b^2=(a+b)^2-2ab=${sum * sum}-2(${prod})=${sqsum}\\)，\\((a-b)^2=(a+b)^2-4ab=${sum * sum}-4(${prod})=${diff2}\\)。`);
    }
    return { questions, answers };
  }

  function buildProductSqsumSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-7, 7);
      const b = randInt(-7, 7);
      const prod = a * b;
      const sqsum = a * a + b * b;
      const sum = a + b;
      const diff = a - b;
      questions.push(`已知 \\(ab=${prod}\\)、\\(a^2+b^2=${sqsum}\\)，求 \\(a+b\\)、\\(a-b\\)。`);
      answers.push(`\\((a+b)^2=${sqsum}+2(${prod})=${sqsum + 2 * prod}\\Rightarrow a+b=${sum}\\) 或 \\(${-sum}\\)；\\((a-b)^2=${sqsum}-2(${prod})=${sqsum - 2 * prod}\\Rightarrow a-b=${diff}\\) 或 \\(${-diff}\\)。`);
    }
    return { questions, answers };
  }

  function buildSquarePairSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-6, 6);
      const b = randInt(-6, 6);
      const sp = (a + b) * (a + b);
      const sm = (a - b) * (a - b);
      const sqsum = a * a + b * b;
      const prod = a * b;
      questions.push(`已知 \\((a+b)^2=${sp}\\)、\\((a-b)^2=${sm}\\)，求 \\(a^2+b^2\\)、\\(ab\\)。`);
      answers.push(`\\(a^2+b^2=\\frac{${sp}+${sm}}{2}=${sqsum}\\)，\\(ab=\\frac{${sp}-${sm}}{4}=${prod}\\)。`);
    }
    return { questions, answers };
  }

  function buildLinearCombinationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(-6, 6);
      const b = randInt(-6, 6);
      const diff = a - b;
      const prod = a * b;
      const sqsum = a * a + b * b;
      const value = 3 * a * a + 4 * a * b + 3 * b * b;
      questions.push(`已知 \\(a-b=${diff}\\)、\\(ab=${prod}\\)，求 \\(3a^2+4ab+3b^2\\)。`);
      answers.push(`\\(a^2+b^2=(a-b)^2+2ab=${diff * diff}+2(${prod})=${sqsum}\\)，所以 \\(3a^2+4ab+3b^2=3(${sqsum})+4(${prod})=${value}\\)。`);
    }
    return { questions, answers };
  }

  function buildReciprocalSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const val = randInt(3, 8);
      questions.push(`已知 \\(x+\\frac{1}{x}=${val}\\)，求 \\(x^2+\\frac{1}{x^2}\\)。`);
      answers.push(`\\(x^2+\\frac{1}{x^2}=\\left(x+\\frac{1}{x}\\right)^2-2=${val}^2-2=${val * val - 2}\\)。`);
    }
    return { questions, answers };
  }

  function buildReciprocalReverseSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = randInt(3, 10);
      questions.push(`已知 \\(x^2+\\frac{1}{x^2}=${base}\\)，求 \\(x+\\frac{1}{x}\\)、\\(x-\\frac{1}{x}\\)。`);
      const plus2 = base + 2;
      const minus2 = base - 2;
      answers.push(`\\(\\left(x+\\frac{1}{x}\\right)^2=${plus2}\\Rightarrow x+\\frac{1}{x}=\\pm\\sqrt{${plus2}}\\)，\\(\\left(x-\\frac{1}{x}\\right)^2=${minus2}\\Rightarrow x-\\frac{1}{x}=\\pm\\sqrt{${minus2}}\\)。`);
    }
    return { questions, answers };
  }

  function buildReciprocalMixedFractionSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(1, 8);
      const b = randInt(1, 8);
      const sum = a + b;
      const prod = a * b;
      const sqsum = a * a + b * b;
      questions.push(`已知 \\(a+b=${sum}\\)、\\(ab=${prod}\\)，求 \\(\\frac{1}{a}+\\frac{1}{b}\\)、\\(\\frac{a}{b}+\\frac{b}{a}\\)。`);
      answers.push(`\\(\\frac1a+\\frac1b=\\frac{a+b}{ab}=\\frac{${sum}}{${prod}}\\)，\\(\\frac ab+\\frac ba=\\frac{a^2+b^2}{ab}=\\frac{${sqsum}}{${prod}}\\)。`);
    }
    return { questions, answers };
  }

  function buildMixedAdvancedIdentitySet(count) {
    const banks = [
      () => buildIdentityIntegerBasicSet(1),
      () => buildIdentitySumProductSet(1),
      () => buildReciprocalSet(1),
      () => buildReciprocalReverseSet(1)
    ];

    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const pick = banks[randInt(0, banks.length - 1)]();
      questions.push(...pick.questions);
      answers.push(...pick.answers);
    }
    return { questions, answers };
  }

  function parseGenerateCall(generateFn) {
    if (typeof generateFn !== "function") return null;
    const source = Function.prototype.toString.call(generateFn);
    const match = source.match(/return\s+([A-Za-z_$][\w$]*)\(([\s\S]*?)\)\s*;/);
    if (!match) return null;
    return {
      builderName: match[1],
      argsSource: String(match[2] || "").trim(),
    };
  }

  function resolveLocalBuilder(builderName) {
    if (!builderName) return null;
    try {
      return eval(builderName);
    } catch (_error) {
      return null;
    }
  }

  function evaluateBuilderArgs(argsSource) {
    const source = String(argsSource || "").trim();
    if (!source) return [];
    try {
      const result = eval(`[${source}]`);
      return Array.isArray(result) ? result : null;
    } catch (_error) {
      return null;
    }
  }

  function replaceLeadingCountArg(argsSource, nextCount) {
    const source = String(argsSource || "").trim();
    const count = Number(nextCount);
    if (!Number.isFinite(count) || count <= 0) return source;
    if (!source) return `${count}`;
    return source.replace(/^\s*-?\d+(?:\.\d+)?\s*(?=,|$)/, `${count}`);
  }

  function runGenerateWithQuestionCount(generateFn, nextCount) {
    const parsed = parseGenerateCall(generateFn);
    const count = Number(nextCount);
    if (!parsed || !Number.isFinite(count) || count <= 0) return null;

    const builder = resolveLocalBuilder(parsed.builderName);
    if (typeof builder !== "function") return null;

    const nextArgsSource = replaceLeadingCountArg(parsed.argsSource, count);
    const args = evaluateBuilderArgs(nextArgsSource);
    if (!Array.isArray(args)) return null;

    try {
      return builder(...args);
    } catch (_error) {
      return null;
    }
  }

  window.formulaPracticeStore = {
    configs: {
      "midpoint-formula": {
        type: "drill",
        title: "簡易無限練習",
        difficulty: "easy",
        questionCount: 10,
        generate() {
          return buildMidpointSet(10);
        }
      },
      "distance-formula": {
        type: "drill",
        title: "簡易無限練習",
        difficulty: "easy",
        questionCount: 10,
        generate() {
          return buildDistanceSet(10);
        }
      },
      "integer-add-subtract-four-terms-drill": {
        type: "drill",
        title: "簡易無限練習",
        difficulty: "easy",
        questionCount: 10,
        generate() {
          return buildFourTermIntegerSet(10);
        }
      },
      "three-products-add-subtract-drill": {
        type: "drill",
        title: "中等無限練習",
        difficulty: "medium",
        questionCount: 10,
        generate() {
          return buildThreeProductSet(10);
        }
      },
      "time-baseline-basic-drill": {
        type: "drill",
        title: "時間基準問題",
        difficulty: "easy",
        questionCount: 10,
        generate() {
          return buildTimeBaselineBasicSet(10);
        }
      },
      "time-baseline-advanced-drill": {
        type: "drill",
        title: "進階時間基準問題",
        difficulty: "medium",
        questionCount: 10,
        generate() {
          return buildTimeBaselineAdvancedSet(10);
        }
      },
      "opposite-number-equation-drill": {
        type: "drill",
        title: "相反數問題",
        difficulty: "easy",
        questionCount: 10,
        generate() {
          return buildOppositeNumberSet(10);
        }
      },
      "midpoint-distance-combined-drill": {
        type: "drill",
        title: "中點與距離問題",
        difficulty: "easy",
        questionCount: 10,
        generate() {
          return buildMidpointDistanceCombinedSet(10);
        }
      },
      "same-shift-opposite-drill": {
        type: "drill",
        title: "兩數同加或減一數成相反數",
        difficulty: "medium",
        questionCount: 10,
        generate() {
          return buildSameShiftOppositeSet(10);
        }
      },
      "midpoint-reverse-drill": {
        type: "drill",
        title: "中點反向問題",
        difficulty: "easy",
        questionCount: 10,
        generate() {
          return buildMidpointReverseSet(10);
        }
      },
      "midpoint-plus-distance-drill": {
        type: "drill",
        title: "中點加距離綜合問題",
        difficulty: "medium",
        questionCount: 10,
        generate() {
          return buildMidpointPlusDistanceSet(10);
        }
      },
      "three-point-quick-distance-drill": {
        type: "drill",
        title: "三點快速看距離練習",
        difficulty: "easy",
        questionCount: 10,
        generate() {
          return buildThreePointQuickDistanceSet(10);
        }
      },
      "coordinate-origin-unit-change": {
        type: "drill",
        title: "改變原點與單位長時坐標變化",
        difficulty: "medium",
        questionCount: 10,
        generate() {
          return buildCoordinateOriginUnitChangeSet(10);
        }
      },
      "sum-square-number-drill": {
        type: "drill", title: "和平方數字版", difficulty: "easy", questionCount: 5,
        generate() { return buildBinomialQuestions(5, 'sum', 'number'); }
      },
      "sum-square-decimal-drill": {
        type: "drill", title: "和平方小數版", difficulty: "easy", questionCount: 5,
        generate() { return buildBinomialQuestions(5, 'sum', 'decimal'); }
      },
      "sum-square-fraction-drill": {
        type: "drill", title: "和平方分數版", difficulty: "medium", questionCount: 5,
        generate() { return buildBinomialQuestions(5, 'sum', 'fraction'); }
      },
      "sum-square-variable-drill": {
        type: "drill", title: "和平方未知數版", difficulty: "easy", questionCount: 5,
        generate() { return buildBinomialQuestions(5, 'sum', 'variable'); }
      },
      "difference-square-number-drill": {
        type: "drill", title: "差平方數字版", difficulty: "easy", questionCount: 5,
        generate() { return buildBinomialQuestions(5, 'diff', 'number'); }
      },
      "difference-square-decimal-drill": {
        type: "drill", title: "差平方小數版", difficulty: "easy", questionCount: 5,
        generate() { return buildBinomialQuestions(5, 'diff', 'decimal'); }
      },
      "difference-square-fraction-drill": {
        type: "drill", title: "差平方分數版", difficulty: "medium", questionCount: 5,
        generate() { return buildBinomialQuestions(5, 'diff', 'fraction'); }
      },
      "difference-square-variable-drill": {
        type: "drill", title: "差平方未知數版", difficulty: "easy", questionCount: 5,
        generate() { return buildBinomialQuestions(5, 'diff', 'variable'); }
      },
      "square-difference-number-drill": {
        type: "drill", title: "整數共軛乘法", difficulty: "easy", questionCount: 5,
        generate() { return buildPureConjugateQuestions(5, 'number'); }
      },
      "square-difference-decimal-drill": {
        type: "drill", title: "小數共軛乘法", difficulty: "easy", questionCount: 5,
        generate() { return buildPureConjugateQuestions(5, 'decimal'); }
      },
      "square-difference-fraction-drill": {
        type: "drill", title: "分數共軛乘法", difficulty: "medium", questionCount: 5,
        generate() { return buildPureConjugateQuestions(5, 'fraction'); }
      },
      "square-difference-variable-drill": {
        type: "drill", title: "平方差未知數展開", difficulty: "easy", questionCount: 5,
        generate() { return buildDifferenceOfSquaresQuestions(5, 'variable'); }
      },
      "square-difference-number-value-drill": {
        type: "drill", title: "整數平方差", difficulty: "easy", questionCount: 5,
        generate() { return buildPureSquareDifferenceQuestions(5, 'number'); }
      },
      "square-difference-decimal-value-drill": {
        type: "drill", title: "小數平方差", difficulty: "easy", questionCount: 5,
        generate() { return buildPureSquareDifferenceQuestions(5, 'decimal'); }
      },
      "square-difference-fraction-value-drill": {
        type: "drill", title: "分數平方差", difficulty: "medium", questionCount: 5,
        generate() { return buildPureSquareDifferenceQuestions(5, 'fraction'); }
      },
      "square-difference-factorization-variable-drill": {
        type: "drill", title: "平方差未知數分解", difficulty: "easy", questionCount: 5,
        generate() { return buildFactorizationQuestions(5); }
      },
      "identity-value-integer-basic-drill": {
        type: "drill", title: "求值整數版", difficulty: "medium", questionCount: 5,
        generate() { return buildIdentityIntegerBasicSet(5); }
      },
      "identity-value-sum-sqsum-to-product-drill": {
        type: "drill", title: "由 a+b、a^2+b^2 求 ab", difficulty: "medium", questionCount: 5,
        generate() { return buildSumSqsumToProductSet(5); }
      },
      "identity-value-diff-sqsum-to-product-drill": {
        type: "drill", title: "由 a-b、a^2+b^2 求 ab", difficulty: "medium", questionCount: 5,
        generate() { return buildDiffSqsumToProductSet(5); }
      },
      "identity-value-sum-product-drill": {
        type: "drill", title: "由 a+b、ab 開始求值", difficulty: "medium", questionCount: 5,
        generate() { return buildIdentitySumProductSet(5); }
      },
      "identity-value-product-sqsum-drill": {
        type: "drill", title: "由 ab、a^2+b^2 求 a+b、a-b", difficulty: "medium", questionCount: 5,
        generate() { return buildProductSqsumSet(5); }
      },
      "identity-value-square-pair-drill": {
        type: "drill", title: "由 (a+b)^2、(a-b)^2 求值", difficulty: "medium", questionCount: 5,
        generate() { return buildSquarePairSet(5); }
      },
      "identity-value-linear-combination-drill": {
        type: "drill", title: "組合式求值", difficulty: "medium", questionCount: 5,
        generate() { return buildLinearCombinationSet(5); }
      },
      "identity-value-reciprocal-drill": {
        type: "drill", title: "倒數型求值", difficulty: "medium", questionCount: 5,
        generate() { return buildReciprocalSet(5); }
      },
      "identity-value-reciprocal-reverse-drill": {
        type: "drill", title: "倒數反推型", difficulty: "medium", questionCount: 5,
        generate() { return buildReciprocalReverseSet(5); }
      },
      "identity-value-reciprocal-mixed-fraction-drill": {
        type: "drill", title: "倒數混合分式型", difficulty: "medium", questionCount: 5,
        generate() { return buildReciprocalMixedFractionSet(5); }
      },
      "identity-value-mixed-advanced-drill": {
        type: "drill", title: "求值進階混合版", difficulty: "medium", questionCount: 5,
        generate() { return buildMixedAdvancedIdentitySet(5); }
      },
      "cubic-divide-linear": {
        type: "drill", title: "三次多項式（四項）÷ 一次多項式", difficulty: "medium", questionCount: 3,
        generate() { return buildCubicDivideLinearSet(3); }
      },
      "cubic-divide-quadratic": {
        type: "drill", title: "三次多項式（四項）÷ 二次多項式", difficulty: "medium", questionCount: 3,
        generate() { return buildCubicDivideQuadraticSet(3); }
      },
      "square-root-basic-junior": {
        type: "drill", title: "平方根基本概念", difficulty: "easy", questionCount: 5,
        generate() { return buildSquareRootBasicSet(5); }
      },
      "radical-mul-div-split-rule": {
        type: "drill", title: "根式乘除可拆", difficulty: "easy", questionCount: 5,
        generate() { return buildRadicalMulDivSet(5); }
      },
      "radical-add-subtract-like-terms": {
        type: "drill", title: "根式加減同類項", difficulty: "easy", questionCount: 5,
        generate() { return buildRadicalAddLikeTermsSet(5); }
      },
      "simplest-radical-form-junior": {
        type: "drill", title: "最簡根式", difficulty: "easy", questionCount: 5,
        generate() { return buildSimplestRadicalSet(5); }
      },
      "rationalize-denominator-monomial-junior": {
        type: "drill", title: "單項有理化分母", difficulty: "medium", questionCount: 3,
        generate() { return buildRationalizeMonomialSet(3); }
      },
      "rationalize-denominator-binomial-junior": {
        type: "drill", title: "多項有理化分母（平方差，3題）", difficulty: "medium", questionCount: 3,
        generate() { return buildRationalizeBinomialSet(3); }
      },
      "abs-four-terms-calc-drill": {
        type: "drill", title: "四數含絕對值計算", difficulty: "easy", questionCount: 10,
        generate() { return buildAbsFourTermsSet(10); }
      },
      "abs-count-basic-drill": {
        type: "drill", title: "絕對值個數問題", difficulty: "easy", questionCount: 10,
        generate() { return buildAbsCountBasicSet(10); }
      },
      "abs-count-two-sided-drill": {
        type: "drill", title: "絕對值個數問題二邊範圍", difficulty: "medium", questionCount: 10,
        generate() { return buildAbsCountTwoSidedSet(10); }
      },
      "abs-count-reverse-drill": {
        type: "drill", title: "絕對值個數問題反向", difficulty: "medium", questionCount: 10,
        generate() { return buildAbsCountReverseSet(10); }
      },
      "abs-equation-leading-one-drill": {
        type: "drill", title: "絕對值方程式（最高次係數=1，5題）", difficulty: "easy", questionCount: 5,
        generate() { return buildAbsEquationLeadingOneSet(5); }
      },
      "abs-equation-leading-not-one-drill": {
        type: "drill", title: "絕對值方程式（最高次係數≠1，5題）", difficulty: "medium", questionCount: 5,
        generate() { return buildAbsEquationLeadingNotOneSet(5); }
      },
      "nonnegative-sum-zero-drill": {
        type: "drill", title: "非負整數和=0", difficulty: "easy", questionCount: 5,
        generate() { return buildNonnegativeSumZeroSet(5); }
      },
      "nonnegative-sum-fixed-one-drill": {
        type: "drill", title: "非負整數和固定討論", difficulty: "medium", questionCount: 5,
        generate() { return buildNonnegativeSumFixedOneSet(5); }
      },
      "nonnegative-sum-fixed-multix-drill": {
        type: "drill", title: "非負整數解和固定討論多組解（只求x，5題）", difficulty: "hard", questionCount: 5,
        generate() { return buildNonnegativeSumFixedMultiXSet(5); }
      },
      "abs-both-sides-advanced-drill": {
        type: "drill", title: "進階補充：兩邊都有絕對值", difficulty: "hard", questionCount: 5,
        generate() { return buildAbsoluteBothSidesAdvancedSet(5); }
      },
      "abs-two-group-calc-drill": {
        type: "drill", title: "二組絕對值計算", difficulty: "easy", questionCount: 5,
        generate() { return buildAbsTwoGroupsSet(5); }
      },
      "abs-remove-and-calc-drill": {
        type: "drill", title: "去絕對值計算", difficulty: "medium", questionCount: 3,
        generate() { return buildAbsRemoveAndCalcSet(3); }
      },
      "linear-remove-parentheses-drill": {
        type: "drill", title: "去括號（一元一次，5題）", difficulty: "easy", questionCount: 5,
        generate() { return buildLinearRemoveParenthesesSet(5); }
      },
      "linear-multiply-parentheses-drill": {
        type: "drill", title: "有乘法的去括號（一元一次，5題）", difficulty: "medium", questionCount: 5,
        generate() { return buildLinearMultiplyParenthesesSet(5); }
      },
      "linear-fraction-parentheses-drill": {
        type: "drill", title: "有分數的去括號（一元一次，5題）", difficulty: "medium", questionCount: 5,
        generate() { return buildLinearFractionParenthesesSet(5); }
      },
      "linear-move-terms-solve-drill": {
        type: "drill", title: "移項求解", difficulty: "easy", questionCount: 5,
        generate() { return buildLinearMoveTermsSolveSet(5); }
      },
      "linear-expand-move-solve-drill": {
        type: "drill", title: "展開移項求解", difficulty: "medium", questionCount: 5,
        generate() { return buildLinearExpandMoveSolveSet(5); }
      },
      "linear-cross-expand-move-solve-drill": {
        type: "drill", title: "交叉相乘後展開移項求解", difficulty: "medium", questionCount: 5,
        generate() { return buildLinearCrossMultiplySolveSet(5); }
      },
      "linear-lcm-multiply-move-solve-drill": {
        type: "drill", title: "同乘公倍數後整理移項求解", difficulty: "hard", questionCount: 5,
        generate() { return buildLinearLcmMultiplySolveSet(5); }
      },
      "j1-distributive-law-drill": {
        type: "drill", title: "分配律", difficulty: "easy", questionCount: 5,
        generate() { return buildJ1DistributiveLawSet(5); }
      },
      "j1-common-factor-drill": {
        type: "drill", title: "提出公因數", difficulty: "easy", questionCount: 5,
        generate() { return buildJ1CommonFactorSet(5); }
      },
      "j1-common-factor-four-terms-drill": {
        type: "drill", title: "4項提出公因數", difficulty: "medium", questionCount: 3,
        generate() { return buildJ1CommonFactorFourTermsSet(3); }
      },
      "j1-variable-distributive-nearby-drill": {
        type: "drill", title: "利用未知數的分配律", difficulty: "medium", questionCount: 5,
        generate() { return buildJ1VariableNearbySet(5); }
      },
      "j1-variable-distributive-eval-drill": {
        type: "drill", title: "利用分配律與未知數求值", difficulty: "medium", questionCount: 5,
        generate() { return buildJ1VariableDistributiveEvalSet(5); }
      },
      "weird-symbol-calc": {
        type: "drill", title: "奇怪的符號計算", difficulty: "medium", questionCount: 3,
        generate() { return buildWeirdSymbolCalcSet(3); }
      },
      "weird-symbol-calc-three-layer": {
        type: "drill", title: "奇怪的符號計算三層版", difficulty: "hard", questionCount: 3,
        generate() { return buildWeirdSymbolCalcThreeLayerSet(3); }
      },
      "mod9-remainder-drill": {
        type: "drill", title: "大數除以9餘數", difficulty: "easy", questionCount: 10,
        generate() { return buildModuloRemainderSet(9, 10); }
      },
      "mod9-unknown-multiple-drill": {
        type: "drill", title: "反向求一大數除以9整除", difficulty: "medium", questionCount: 10,
        generate() { return buildModuloUnknownMultipleSet(9, 10); }
      },
      "mod9-unknown-remainder-drill": {
        type: "drill", title: "反向求一大數除以9餘數", difficulty: "medium", questionCount: 10,
        generate() { return buildModuloUnknownRemainderSet(9, 10); }
      },
      "mod11-remainder-drill": {
        type: "drill", title: "大數除以11餘數", difficulty: "easy", questionCount: 10,
        generate() { return buildModuloRemainderSet(11, 10); }
      },
      "mod11-unknown-multiple-drill": {
        type: "drill", title: "反向求一大數除以11整除", difficulty: "medium", questionCount: 10,
        generate() { return buildModuloUnknownMultipleSet(11, 10); }
      },
      "mod11-unknown-remainder-drill": {
        type: "drill", title: "反向求一大數除以11餘數", difficulty: "medium", questionCount: 10,
        generate() { return buildModuloUnknownRemainderSet(11, 10); }
      },
      "factor-application-separate-grouping-drill": {
        type: "drill", title: "男女分別分組", difficulty: "easy", questionCount: 3,
        generate() { return buildSeparateGroupingSet(3); }
      },
      "factor-application-mixed-grouping-drill": {
        type: "drill", title: "男女混合分組", difficulty: "medium", questionCount: 3,
        generate() { return buildMixedGroupingSet(3); }
      },
      "factor-application-circular-track-drill": {
        type: "drill", title: "環狀跑道同點重合", difficulty: "medium", questionCount: 3,
        generate() { return buildCircularTrackSet(3); }
      },
      "factor-road-planting-single-drill": {
        type: "drill", title: "道路種樹（單側，3題）", difficulty: "easy", questionCount: 3,
        generate() { return buildRoadPlantingSingleSet(3); }
      },
      "factor-road-planting-double-drill": {
        type: "drill", title: "道路種樹（兩側，3題）", difficulty: "easy", questionCount: 3,
        generate() { return buildRoadPlantingDoubleSet(3); }
      },
      "factor-road-keep-position-drill": {
        type: "drill", title: "不需移動個數", difficulty: "medium", questionCount: 3,
        generate() { return buildRoadReplantKeepSet(3); }
      },
      "factor-rectangle-equal-square-drill": {
        type: "drill", title: "長方形裁成相同正方形", difficulty: "easy", questionCount: 3,
        generate() { return buildRectangleMaxSquarePiecesSet(3); }
      },
      "factor-rectangle-max-square-mixed-drill": {
        type: "drill", title: "長方形裁成數個最大正方形", difficulty: "medium", questionCount: 3,
        generate() { return buildRectangleMinSquarePiecesSet(3); }
      }
    },
    getConfig(id) {
      const topicId = String(id || '').trim();
      const direct = this.configs[topicId] || null;
      const assignmentStore = window.formulaPracticeAssignmentStore || {};
      const assignment = assignmentStore?.byId?.[topicId] || null;

      if (assignment && assignment.enabled === false) {
        return null;
      }

      if (assignment) {
        const mode = String(assignment.mode || '').trim() || 'generator';
        if (mode === 'fixed-example') {
          return {
            type: 'fixed-example',
            title: assignment.title || '舉例說明',
            prompt: assignment.prompt || '',
            answer: assignment.answer || '',
            difficulty: assignment.difficulty || '',
            questionCount: Number(assignment.questionCount) || 0,
          };
        }

        const practiceKey = String(assignment.practiceKey || '').trim();
        const base = (practiceKey && this.configs[practiceKey]) || direct;
        if (!base) return null;
        const merged = {
          ...base,
          type: assignment.mode || base.type,
          title: assignment.title || base.title,
          difficulty: assignment.difficulty || base.difficulty,
          questionCount: Number(assignment.questionCount) || base.questionCount,
        };
        if (typeof base.generate === 'function') {
          merged.generate = function generateWithAssignmentCount(item) {
            return runGenerateWithQuestionCount(base.generate, this.questionCount) ?? base.generate.call(this, item);
          };
        }
        return merged;
      }

      return direct;
    }
  };
})();

