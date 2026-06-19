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

  function reduceRatioTriple(values) {
    let common = 0;
    values.forEach((value) => {
      common = common === 0 ? Math.abs(value) : gcdInt(common, value);
    });
    common = common || 1;
    return values.map((value) => value / common);
  }

  function lcmInt(a, b) {
    return Math.abs(a * b) / gcdInt(a, b);
  }

  function lcmArray(values) {
    return values.reduce((acc, value) => lcmInt(acc, Math.abs(value)), 1);
  }

  function ratioTex(values) {
    return values.join(':');
  }

  function fracText(numerator, denominator) {
    return `\\frac{${numerator}}{${denominator}}`;
  }

  function buildJ511MergeSharedTermSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 9);
      const b = randInt(2, 9);
      const c = randInt(2, 9);
      const d = randInt(2, 9);
      const common = lcmInt(b, c);
      const ratio = reduceRatioTriple([a * (common / b), common, d * (common / c)]);
      questions.push(`若 \\(x:y=${a}:${b}\\)，且 \\(y:z=${c}:${d}\\)，求 \\(x:y:z\\) 的最簡整數連比。`);
      answers.push(
        `簡答：\\(${ratioTex(ratio)}\\)。過程：先把共同項 \\(y\\) 調成相同。\\(${a}:${b}=${a * (common / b)}:${common}\\)，\\(${c}:${d}=${common}:${d * (common / c)}\\)，所以 \\(x:y:z=${ratioTex(ratio)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511EquationToRatioSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const p = randInt(2, 8);
      const q = randInt(2, 9);
      const r = randInt(3, 10);
      const common = lcmArray([p, q, r]);
      const ratio = reduceRatioTriple([common / p, common / q, common / r]);
      questions.push(`若 \\(${p}x=${q}y=${r}z\\)，且 \\(xyz\\neq0\\)，求 \\(x:y:z\\)。`);
      answers.push(
        `簡答：\\(${ratioTex(ratio)}\\)。過程：設共同值為 \\(k\\)，則 \\(x=${fracText(1, p)}k\\)，\\(y=${fracText(1, q)}k\\)，\\(z=${fracText(1, r)}k\\)。同乘 \\(${common}\\) 後得 \\(x:y:z=${ratioTex(ratio)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511FractionFormRatioSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 9);
      const b = randInt(2, 9);
      const c = randInt(2, 9);
      const ratio = reduceRatioTriple([a, b, c]);
      questions.push(
        `若 \\(${fracText('x', a)}=${fracText('y', b)}=${fracText('z', c)}\\)，求 \\(x:y:z\\) 的最簡整數連比。`
      );
      answers.push(
        `簡答：\\(${ratioTex(ratio)}\\)。過程：設共同值為 \\(r\\)，則 \\(x=${a}r\\)，\\(y=${b}r\\)，\\(z=${c}r\\)，所以 \\(x:y:z=${ratioTex(ratio)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511ReciprocalRatioSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = reduceRatioTriple([randInt(2, 9), randInt(2, 9), randInt(2, 9)]);
      const common = lcmArray(base);
      const reciprocal = reduceRatioTriple(base.map((value) => common / value));
      questions.push(
        `若 \\(x:y:z=${ratioTex(base)}\\)，求 \\(\\frac{1}{x}:\\frac{1}{y}:\\frac{1}{z}\\) 的最簡整數連比。`
      );
      answers.push(
        `簡答：\\(${ratioTex(reciprocal)}\\)。過程：倒數比要先倒再同乘公倍數：\\(\\frac{1}{${base[0]}}:\\frac{1}{${base[1]}}:\\frac{1}{${base[2]}}\\)，同乘 \\(${common}\\) 得 \\(${ratioTex(reciprocal)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511FractionStatementRatioSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const a = randInt(2, 8);
      const b = randInt(3, 9);
      const c = randInt(4, 10);
      const ratio = reduceRatioTriple([a, b, c]);
      questions.push(
        `若 \\(x\\) 的 \\(${fracText(1, a)}\\) 等於 \\(y\\) 的 \\(${fracText(1, b)}\\)，也等於 \\(z\\) 的 \\(${fracText(1, c)}\\)，求 \\(x:y:z\\)。`
      );
      answers.push(
        `簡答：\\(${ratioTex(ratio)}\\)。過程：題意為 \\(${fracText('x', a)}=${fracText('y', b)}=${fracText('z', c)}\\)。設共同值為 \\(r\\)，得 \\(x:y:z=${ratioTex(ratio)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511RatioConversionMixedSet(count) {
    const builders = [
      buildJ511MergeSharedTermSet,
      buildJ511EquationToRatioSet,
      buildJ511FractionFormRatioSet,
      buildJ511ReciprocalRatioSet,
      buildJ511FractionStatementRatioSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = builders[i % builders.length](1);
      questions.push(built.questions[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511ParametricLinearEquationSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const ratio = reduceRatioTriple([randInt(2, 8), randInt(3, 9), randInt(2, 10)]);
      const t = randInt(2, 12);
      let coeffs = [randInt(1, 4), randInt(1, 4), -randInt(1, 3)];
      let coefficientSum = coeffs[0] * ratio[0] + coeffs[1] * ratio[1] + coeffs[2] * ratio[2];
      while (coefficientSum === 0) {
        coeffs = [randInt(1, 4), randInt(1, 4), -randInt(1, 3)];
        coefficientSum = coeffs[0] * ratio[0] + coeffs[1] * ratio[1] + coeffs[2] * ratio[2];
      }
      const value = coefficientSum * t;
      const expression = `${coeffs[0]}x+${coeffs[1]}y${coeffs[2] < 0 ? `${coeffs[2]}z` : `+${coeffs[2]}z`}`;
      questions.push(`已知 \\(x:y:z=${ratioTex(ratio)}\\)，且 \\(${expression}=${value}\\)，求 \\(x,y,z\\) 的值。`);
      answers.push(
        `簡答：\\((x,y,z)=(${ratio[0] * t},${ratio[1] * t},${ratio[2] * t})\\)。過程：設 \\(x=${ratio[0]}r\\)，\\(y=${ratio[1]}r\\)，\\(z=${ratio[2]}r\\)。代入得 \\(${coefficientSum}r=${value}\\)，所以 \\(r=${t}\\)，答案為 \\((x,y,z)=(${ratio[0] * t},${ratio[1] * t},${ratio[2] * t})\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511RatioExpressionTransformSet(count) {
    const questions = [];
    const answers = [];
    const modes = ['sumCycle', 'linearPair', 'square'];
    for (let i = 0; i < count; i += 1) {
      const ratio = reduceRatioTriple([randInt(1, 7), randInt(2, 8), randInt(3, 9)]);
      const mode = modes[i % modes.length];
      if (mode === 'sumCycle') {
        const result = reduceRatioTriple([ratio[0] + ratio[1], ratio[1] + ratio[2], ratio[2] + ratio[0]]);
        questions.push(`若 \\(x:y:z=${ratioTex(ratio)}\\)，求 \\((x+y):(y+z):(z+x)\\) 的最簡整數連比。`);
        answers.push(
          `簡答：\\(${ratioTex(result)}\\)。過程：設 \\((x,y,z)=(${ratio[0]}r,${ratio[1]}r,${ratio[2]}r)\\)，代入後約去 \\(r\\)，得 \\(${ratioTex(result)}\\)。`
        );
      } else if (mode === 'linearPair') {
        const result = reduceRatioTriple([2 * ratio[0] + ratio[1], 3 * ratio[2] - ratio[0]]);
        questions.push(`若 \\(x:y:z=${ratioTex(ratio)}\\)，求 \\((2x+y):(3z-x)\\) 的最簡整數比。`);
        answers.push(
          `簡答：\\(${ratioTex(result)}\\)。過程：代入 \\((x,y,z)=(${ratio[0]}r,${ratio[1]}r,${ratio[2]}r)\\)，得 \\(${2 * ratio[0] + ratio[1]}r:${3 * ratio[2] - ratio[0]}r=${ratioTex(result)}\\)。`
        );
      } else {
        const result = reduceRatioTriple([ratio[0] * ratio[0] + ratio[1] * ratio[1], ratio[2] * ratio[2]]);
        questions.push(`若 \\(x:y:z=${ratioTex(ratio)}\\)，求 \\((x^2+y^2):z^2\\) 的最簡整數比。`);
        answers.push(
          `簡答：\\(${ratioTex(result)}\\)。過程：平方後仍可約去共同的 \\(r^2\\)，所以答案為 \\(${ratio[0] * ratio[0] + ratio[1] * ratio[1]}:${ratio[2] * ratio[2]}=${ratioTex(result)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511ReverseValueFromRatioSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const ratio = reduceRatioTriple([randInt(2, 8), randInt(3, 9), randInt(2, 10)]);
      const unit = randInt(5, 18);
      const total = ratio.reduce((sum, value) => sum + value, 0) * unit;
      const values = ratio.map((value) => value * unit);
      questions.push(`甲、乙、丙三人的人數比為 \\(${ratioTex(ratio)}\\)，總共有 \\(${total}\\) 人，求三組各有多少人。`);
      answers.push(
        `簡答：甲、乙、丙分別為 \\(${values[0]},${values[1]},${values[2]}\\) 人。過程：每一份為 \\(${total}\\div(${ratio.join('+')})=${unit}\\)，所以三組人數為 \\(${ratioTex(ratio)}\\) 各乘以 \\(${unit}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511ShiftedVariableRatioSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const ratio = reduceRatioTriple([randInt(2, 7), randInt(2, 8), randInt(3, 9)]);
      const unit = randInt(4, 12);
      const shiftX = randInt(1, Math.max(1, ratio[0] * unit - 1));
      const shiftY = randInt(1, 6);
      const x = ratio[0] * unit - shiftX;
      const y = ratio[1] * unit + shiftY;
      const z = ratio[2] * unit;
      const total = x + y + z;
      const target = i % 2 === 0 ? x - y : x + z;
      questions.push(
        `已知 \\((x+${shiftX}):(y-${shiftY}):z=${ratioTex(ratio)}\\)，且 \\(x+y+z=${total}\\)，求 \\(${i % 2 === 0 ? 'x-y' : 'x+z'}\\) 的值。`
      );
      answers.push(
        `簡答：\\(${i % 2 === 0 ? 'x-y' : 'x+z'}=${target}\\)。過程：設 \\(x+${shiftX}=${ratio[0]}r\\)、\\(y-${shiftY}=${ratio[1]}r\\)、\\(z=${ratio[2]}r\\)，則 \\(x=${ratio[0]}r-${shiftX}\\)、\\(y=${ratio[1]}r+${shiftY}\\)、\\(z=${ratio[2]}r\\)。代入總和得 \\(${ratio.reduce((sum, value) => sum + value, 0)}r${shiftY - shiftX >= 0 ? `+${shiftY - shiftX}` : shiftY - shiftX}=${total}\\)，所以 \\(r=${unit}\\)，再代回可得答案。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511RatioAlgebraMixedSet(count) {
    const builders = [
      buildJ511ParametricLinearEquationSet,
      buildJ511RatioExpressionTransformSet,
      buildJ511ReverseValueFromRatioSet,
      buildJ511ShiftedVariableRatioSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = builders[i % builders.length](1);
      questions.push(built.questions[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511TriangleAngleRatioSet(count) {
    const questions = [];
    const answers = [];
    const triples = [
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 5],
      [1, 1, 2],
      [2, 5, 3],
      [4, 5, 6],
    ];
    for (let i = 0; i < count; i += 1) {
      const ratio = triples[randInt(0, triples.length - 1)];
      const sum = ratio.reduce((acc, value) => acc + value, 0);
      const unit = 180 / sum;
      const angles = ratio.map((value) => value * unit);
      questions.push(
        `若 \\(\\triangle ABC\\) 的三內角比 \\(\\angle A:\\angle B:\\angle C=${ratioTex(ratio)}\\)，求三內角的度數。`
      );
      answers.push(
        `簡答：三內角為 \\(${angles[0]}^\\circ,${angles[1]}^\\circ,${angles[2]}^\\circ\\)。過程：三角形內角和為 \\(180^\\circ\\)，每一份為 \\(180\\div${sum}=${unit}\\)，再依比例分配。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511TriangleSideHeightRatioSet(count) {
    const questions = [];
    const answers = [];
    const validSideRatios = [
      [3, 4, 5],
      [5, 6, 7],
      [4, 5, 6],
      [5, 5, 6],
      [5, 12, 13],
      [8, 15, 17],
      [7, 10, 12],
    ];
    for (let i = 0; i < count; i += 1) {
      const sides = validSideRatios[randInt(0, validSideRatios.length - 1)];
      const common = lcmArray(sides);
      const heights = reduceRatioTriple(sides.map((value) => common / value));
      if (i % 2 === 0) {
        questions.push(
          `同一個三角形中，若三邊長比 \\(a:b:c=${ratioTex(sides)}\\)，求對應高 \\(h_a:h_b:h_c\\) 的最簡整數比。`
        );
        answers.push(
          `簡答：\\(h_a:h_b:h_c=${ratioTex(heights)}\\)。過程：同一三角形面積固定，\\(\\frac12 ah_a=\\frac12 bh_b=\\frac12 ch_c\\)，所以邊長與對應高成反比。`
        );
      } else {
        questions.push(
          `同一個三角形中，若三邊對應高比 \\(h_a:h_b:h_c=${ratioTex(heights)}\\)，求三邊長比 \\(a:b:c\\)。`
        );
        answers.push(
          `簡答：\\(a:b:c=${ratioTex(sides)}\\)。過程：同一三角形面積固定，邊長與對應高成反比，因此把高的比例取倒數並化為整數比即可。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511GeometryPerimeterAreaSet(count) {
    const questions = [];
    const answers = [];
    const modes = ['perimeter', 'area', 'rectangle'];
    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      if (mode === 'perimeter') {
        const ratio = reduceRatioTriple([randInt(2, 6), randInt(3, 8), randInt(4, 9)]);
        const unit = randInt(4, 12);
        const perimeter = ratio.reduce((sum, value) => sum + value, 0) * unit;
        const shortest = Math.min(...ratio) * unit;
        questions.push(`三角形三邊長比為 \\(${ratioTex(ratio)}\\)，周長為 \\(${perimeter}\\) 公分，求最短邊長。`);
        answers.push(
          `簡答：最短邊為 \\(${shortest}\\) 公分。過程：每一份為 \\(${perimeter}\\div(${ratio.join('+')})=${unit}\\)，最短邊對應 \\(${Math.min(...ratio)}\\) 份，所以為 \\(${shortest}\\) 公分。`
        );
      } else if (mode === 'area') {
        const a = randInt(2, 7);
        const b = randInt(3, 9);
        questions.push(`兩個正方形的邊長比為 \\(${a}:${b}\\)，求它們的面積比。`);
        answers.push(
          `簡答：\\(${a * a}:${b * b}\\)。過程：面積比等於邊長比的平方，所以為 \\(${a}^2:${b}^2=${a * a}:${b * b}\\)。`
        );
      } else {
        const ratio = reduceRatioTriple([randInt(2, 6), randInt(3, 8), randInt(4, 9)]);
        const scale = randInt(2, 6);
        const volume = ratio[0] * ratio[1] * ratio[2] * scale * scale * scale;
        questions.push(
          `長方體的長、寬、高比為 \\(${ratioTex(ratio)}\\)，體積為 \\(${volume}\\) 立方公分，求長、寬、高。`
        );
        answers.push(
          `簡答：長、寬、高為 \\(${ratio[0] * scale},${ratio[1] * scale},${ratio[2] * scale}\\) 公分。過程：設長、寬、高為 \\(${ratio[0]}r,${ratio[1]}r,${ratio[2]}r\\)，則 \\(${ratio[0] * ratio[1] * ratio[2]}r^3=${volume}\\)，得 \\(r=${scale}\\)。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511GeometryRatioMixedSet(count) {
    const builders = [
      buildJ511TriangleAngleRatioSet,
      buildJ511TriangleSideHeightRatioSet,
      buildJ511GeometryPerimeterAreaSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = builders[i % builders.length](1);
      questions.push(built.questions[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511MoneyProfitSharingSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const ratio = reduceRatioTriple([randInt(2, 8), randInt(3, 9), randInt(2, 10)]);
      const unit = randInt(100, 900);
      const total = ratio.reduce((sum, value) => sum + value, 0) * unit;
      const values = ratio.map((value) => value * unit);
      questions.push(
        `甲、乙、丙三人合資或分紅的比例為 \\(${ratioTex(ratio)}\\)，總金額為 \\(${total}\\) 元，求三人各分得多少元。`
      );
      answers.push(
        `簡答：甲、乙、丙分別得 \\(${values[0]},${values[1]},${values[2]}\\) 元。過程：每一份為 \\(${total}\\div(${ratio.join('+')})=${unit}\\) 元，再依比例分配。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511MixtureRatioSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const ratio = reduceRatioTriple([randInt(2, 6), randInt(3, 7), randInt(1, 5)]);
      const knownIndex = randInt(0, 2);
      const unit = randInt(2, 15);
      const known = ratio[knownIndex] * unit;
      const names = ['咖啡', '牛奶', '糖漿'];
      const total = ratio.reduce((sum, value) => sum + value, 0) * unit;
      questions.push(
        `調製飲品時，${names.join('、')}的重量比為 \\(${ratioTex(ratio)}\\)。若${names[knownIndex]}有 \\(${known}\\) 克，求整杯飲品共有多少克。`
      );
      answers.push(
        `簡答：整杯飲品共有 \\(${total}\\) 克。過程：${names[knownIndex]}占 \\(${ratio[knownIndex]}\\) 份，所以每一份為 \\(${known}\\div${ratio[knownIndex]}=${unit}\\) 克，總量為 \\(${total}\\) 克。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511PopulationRatioChangeSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const base = reduceRatioTriple([randInt(3, 8), randInt(3, 8), randInt(3, 8)]);
      const unit = randInt(8, 25);
      const move = randInt(1, Math.min(8, base[0] * unit - 1));
      const total = base.reduce((sum, value) => sum + value, 0) * unit;
      const before = base.map((value) => value * unit);
      const after = [before[0] - move, before[1] + move, before[2]];
      const afterRatio = reduceRatioTriple(after);
      questions.push(
        `某校一、二、三年級原人數比為 \\(${ratioTex(base)}\\)，且全校共有 \\(${total}\\) 人。若一年級轉出 \\(${move}\\) 人到二年級，求變動後一、二、三年級的人數比。`
      );
      answers.push(
        `簡答：\\(${ratioTex(afterRatio)}\\)。過程：每一份為 \\(${total}\\div(${base.join('+')})=${unit}\\)，原人數為 \\(${before[0]},${before[1]},${before[2]}\\)。變動後為 \\(${after[0]},${after[1]},${after[2]}\\)，化為最簡整數比得 \\(${ratioTex(afterRatio)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511WorkRateSpeedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const times = reduceRatioTriple([randInt(2, 7), randInt(3, 8), randInt(4, 9)]);
      const common = lcmArray(times);
      const rates = reduceRatioTriple(times.map((value) => common / value));
      questions.push(`甲、乙、丙完成同一件工作的時間比為 \\(${ratioTex(times)}\\)，求三人的工作效率比。`);
      answers.push(
        `簡答：工作效率比為 \\(${ratioTex(rates)}\\)。過程：同一工作量下，效率與時間成反比，所以把 \\(${ratioTex(times)}\\) 取倒數並化為整數比。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511WorkEfficiencyAppliedSet(count) {
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const times = reduceRatioTriple([randInt(2, 6), randInt(3, 8), randInt(4, 10)]);
      const common = lcmArray(times);
      const rates = reduceRatioTriple(times.map((value) => common / value));
      questions.push(
        `甲單獨完成一項工程需 \\(${times[0]}\\) 天，乙單獨完成需 \\(${times[1]}\\) 天，丙單獨完成需 \\(${times[2]}\\) 天。求甲、乙、丙三人的每日工作效率比。`
      );
      answers.push(
        `簡答：\\(${ratioTex(rates)}\\)。過程：完成同一工程時，每日效率分別為 \\(\\frac1{${times[0]}}:\\frac1{${times[1]}}:\\frac1{${times[2]}}\\)。同乘 \\(${common}\\) 後得 \\(${ratioTex(rates)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511CoinDenominationRatioSet(count) {
    const questions = [];
    const answers = [];
    const denominations = [5, 10, 50];
    for (let i = 0; i < count; i += 1) {
      const ratio = reduceRatioTriple([randInt(2, 7), randInt(2, 8), randInt(1, 6)]);
      const unit = randInt(2, 12);
      const counts = ratio.map((value) => value * unit);
      const total = counts.reduce((sum, value, idx) => sum + value * denominations[idx], 0);
      const targetIndex = i % 3;
      questions.push(
        `存錢筒中有 \\(5\\) 元、\\(10\\) 元、\\(50\\) 元硬幣，枚數比為 \\(${ratioTex(ratio)}\\)。若總金額為 \\(${total}\\) 元，求 \\(${denominations[targetIndex]}\\) 元硬幣有幾枚。`
      );
      answers.push(
        `簡答：\\(${denominations[targetIndex]}\\) 元硬幣有 \\(${counts[targetIndex]}\\) 枚。過程：每一份硬幣組合的金額為 \\(5\\times${ratio[0]}+10\\times${ratio[1]}+50\\times${ratio[2]}=${denominations.reduce((sum, value, idx) => sum + value * ratio[idx], 0)}\\) 元，所以份數為 \\(${total}\\div${denominations.reduce((sum, value, idx) => sum + value * ratio[idx], 0)}=${unit}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511MixtureSharedTermSet(count) {
    const questions = [];
    const answers = [];
    const names = ['咖啡', '牛奶', '糖'];
    for (let i = 0; i < count; i += 1) {
      const ratioA = reduceRatioTriple([randInt(2, 6), randInt(2, 7), randInt(1, 5)]);
      const ratioB = reduceRatioTriple([randInt(2, 6), randInt(2, 7), randInt(1, 5)]);
      const sumA = ratioA.reduce((sum, value) => sum + value, 0);
      const sumB = ratioB.reduce((sum, value) => sum + value, 0);
      const common = lcmInt(sumA, sumB);
      const merged = reduceRatioTriple(
        ratioA.map((value, idx) => value * (common / sumA) + ratioB[idx] * (common / sumB))
      );
      questions.push(
        `A 牌飲品中${names.join('、')}的重量比為 \\(${ratioTex(ratioA)}\\)，B 牌飲品中${names.join('、')}的重量比為 \\(${ratioTex(ratioB)}\\)。若取相同重量的 A、B 兩牌飲品混合，求新飲品中${names.join('、')}的重量比。`
      );
      answers.push(
        `簡答：\\(${ratioTex(merged)}\\)。過程：兩牌取相同重量，需先把 A 牌的總份數 \\(${sumA}\\) 與 B 牌的總份數 \\(${sumB}\\) 調成同一總量 \\(${common}\\)。各成分相加後化簡，得到 \\(${ratioTex(merged)}\\)。`
      );
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ511LifeRatioMixedSet(count) {
    const builders = [
      buildJ511MoneyProfitSharingSet,
      buildJ511MixtureRatioSet,
      buildJ511PopulationRatioChangeSet,
      buildJ511WorkRateSpeedSet,
      buildJ511ReverseValueFromRatioSet,
      buildJ511WorkEfficiencyAppliedSet,
      buildJ511CoinDenominationRatioSet,
      buildJ511MixtureSharedTermSet,
    ];
    const questions = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const built = builders[i % builders.length](1);
      questions.push(built.questions[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ512Set(kind, count) {
    const questions = [];
    const answers = [];
    const kinds = {
      triangleMixed: [
        'triangleFullProportion',
        'triangleSide',
        'triangleSegment',
        'triangleAlgebra',
        'triangleConverse',
        'midpoint',
      ],
      trapezoidMixed: ['trapezoidWeighted', 'trapezoidMidline', 'multiParallel'],
      parallelMixed: ['triangleFullProportion', 'trapezoidWeighted', 'multiParallel', 'midpoint', 'triangleConverse'],
    };
    const coprimePair = (min, max) => {
      let a = randInt(min, max);
      let b = randInt(min, max);
      while (gcdInt(a, b) !== 1) {
        a = randInt(min, max);
        b = randInt(min, max);
      }
      return [a, b];
    };
    const sourceKinds = kinds[kind] || [kind];
    for (let i = 0; i < count; i += 1) {
      const type = sourceKinds[i % sourceKinds.length];
      if (type === 'triangleFullProportion') {
        const [adPart, dbPart] = coprimePair(1, 6);
        const sideScale = randInt(2, 8);
        const baseScale = randInt(2, 8);
        const ad = adPart * sideScale;
        const db = dbPart * sideScale;
        const ab = ad + db;
        const ae = adPart * baseScale;
        const ec = dbPart * baseScale;
        const ac = ae + ec;
        const bc = (adPart + dbPart) * randInt(2, 7);
        const de = adPart * (bc / (adPart + dbPart));
        if (i % 3 === 0) {
          questions.push(
            `在 \\(\\triangle ABC\\) 中，點 \\(D\\) 在 \\(AB\\) 上，點 \\(E\\) 在 \\(AC\\) 上，且 \\(DE\\parallel BC\\)。若 \\(AD=${ad}\\)、\\(DB=${db}\\)、\\(AE=${ae}\\)，求 \\(EC\\) 的長度。`
          );
          answers.push(
            `簡答：\\(EC=${ec}\\)。過程：平行截線使側邊分段成比例，\\(AD:DB=AE:EC\\)。代入 \\(${ad}:${db}=${ae}:EC\\)，解得 \\(EC=${ec}\\)。`
          );
        } else if (i % 3 === 1) {
          questions.push(
            `在 \\(\\triangle ABC\\) 中，\\(DE\\parallel BC\\)。若 \\(AD=${ad}\\)、\\(AB=${ab}\\)、\\(AE=${ae}\\)，求 \\(AC\\) 的長度。`
          );
          answers.push(
            `簡答：\\(AC=${ac}\\)。過程：\\(\\dfrac{AD}{AB}=\\dfrac{AE}{AC}\\)，所以 \\(\\dfrac{${ad}}{${ab}}=\\dfrac{${ae}}{AC}\\)，解得 \\(AC=${ac}\\)。`
          );
        } else {
          questions.push(
            `在 \\(\\triangle ABC\\) 中，\\(DE\\parallel BC\\)。若 \\(AD=${ad}\\)、\\(AB=${ab}\\)、\\(BC=${bc}\\)，求 \\(DE\\) 的長度。`
          );
          answers.push(
            `簡答：\\(DE=${formatFraction(ad * bc, ab)}\\)。過程：\\(\\dfrac{AD}{AB}=\\dfrac{DE}{BC}\\)，所以 \\(DE=${bc}\\times\\dfrac{${ad}}{${ab}}=${formatFraction(ad * bc, ab)}\\)。`
          );
        }
      } else if (type === 'triangleSide') {
        const [ad, db] = coprimePair(2, 8);
        const scale = randInt(2, 7);
        const ae = ad * scale;
        const ec = db * scale;
        questions.push(
          `在 \\(\\triangle ABC\\) 中，點 \\(D\\) 在 \\(AB\\) 上，點 \\(E\\) 在 \\(AC\\) 上，且 \\(DE\\parallel BC\\)。若 \\(AD=${ad}\\)、\\(DB=${db}\\)、\\(AE=${ae}\\)，求 \\(EC\\)。`
        );
        answers.push(
          `簡答：\\(EC=${ec}\\)。過程：因為 \\(DE\\parallel BC\\)，所以 \\(AD:DB=AE:EC\\)。代入得 \\(${ad}:${db}=${ae}:EC\\)，故 \\(EC=${ec}\\)。`
        );
      } else if (type === 'triangleSegment') {
        const part = randInt(2, 6);
        const whole = part + randInt(2, 5);
        const k = randInt(2, 8);
        const ad = part * k;
        const ab = whole * k;
        if (i % 2 === 0) {
          const ac = whole * randInt(2, 7);
          const ae = (ad * ac) / ab;
          questions.push(
            `在 \\(\\triangle ABC\\) 中，\\(D\\) 在 \\(AB\\) 上，\\(E\\) 在 \\(AC\\) 上，且 \\(DE\\parallel BC\\)。若 \\(AB=${ab}\\)、\\(AC=${ac}\\)、\\(AD=${ad}\\)，求 \\(AE\\)。`
          );
          answers.push(
            `簡答：\\(AE=${ae}\\)。過程：\\(\\dfrac{AD}{AB}=\\dfrac{AE}{AC}\\)，所以 \\(\\dfrac{${ad}}{${ab}}=\\dfrac{AE}{${ac}}\\)，解得 \\(AE=${ae}\\)。`
          );
        } else {
          const bc = whole * randInt(2, 7);
          const de = (ad * bc) / ab;
          questions.push(
            `在 \\(\\triangle ABC\\) 中，\\(D\\) 在 \\(AB\\) 上，\\(E\\) 在 \\(AC\\) 上，且 \\(DE\\parallel BC\\)。若 \\(AB=${ab}\\)、\\(AD=${ad}\\)、\\(BC=${bc}\\)，求 \\(DE\\)。`
          );
          answers.push(
            `簡答：\\(DE=${de}\\)。過程：\\(\\dfrac{AD}{AB}=\\dfrac{DE}{BC}\\)，所以 \\(\\dfrac{${ad}}{${ab}}=\\dfrac{DE}{${bc}}\\)，解得 \\(DE=${de}\\)。`
          );
        }
      } else if (type === 'triangleAlgebra') {
        const x = randInt(2, 8);
        const ad = randInt(2, 5);
        const dbBase = randInt(1, 5);
        const ec = x * (x + dbBase);
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(D\\) 在 \\(AB\\) 上，\\(E\\) 在 \\(AC\\) 上，且 \\(DE\\parallel BC\\)。若 \\(AD=${ad}\\)、\\(DB=x+${dbBase}\\)、\\(AE=${ad}x\\)、\\(EC=${ec}\\)，求 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：由平行截線得 \\(AD:DB=AE:EC\\)，所以 \\(${ad}:(x+${dbBase})=${ad}x:${ec}\\)。交叉相乘得 \\(${ec}=x(x+${dbBase})\\)，解得正數解 \\(x=${x}\\)。`
        );
      } else if (type === 'triangleConverse') {
        const [p, q] = coprimePair(2, 7);
        const scale1 = randInt(2, 5);
        const scale2 = i % 2 === 0 ? scale1 : scale1 + 1;
        const ad = p * scale1;
        const db = q * scale1;
        const ae = p * scale2;
        const ec = q * scale2;
        const isParallel = ad * ec === db * ae;
        questions.push(
          `在 \\(\\triangle ABC\\) 中，點 \\(D\\) 在 \\(AB\\) 上，點 \\(E\\) 在 \\(AC\\) 上。已知 \\(AD=${ad}\\)、\\(DB=${db}\\)、\\(AE=${ae}\\)、\\(EC=${ec}\\)，判斷 \\(DE\\) 是否平行 \\(BC\\)。`
        );
        answers.push(
          `簡答：${isParallel ? '\\(DE\\parallel BC\\)' : '\\(DE\\nparallel BC\\)'}。過程：逆定理要比較 \\(AD:DB\\) 與 \\(AE:EC\\)。本題 \\(AD:DB=${ratioTex(reduceRatioTriple([ad, db]))}\\)，\\(AE:EC=${ratioTex(reduceRatioTriple([ae, ec]))}\\)。${isParallel ? '兩比相等，所以 \\(DE\\parallel BC\\)。' : '兩比不相等，所以不能推出平行，且此設定下 \\(DE\\nparallel BC\\)。'}`
        );
      } else if (type === 'midpoint') {
        const bc = randInt(4, 18) * 2;
        const perimeterSmall = randInt(9, 18);
        if (i % 3 === 0) {
          questions.push(
            `在 \\(\\triangle ABC\\) 中，\\(D\\)、\\(E\\) 分別為 \\(AB\\)、\\(AC\\) 的中點。若 \\(BC=${bc}\\)，求中點連線 \\(DE\\) 的長度。`
          );
          answers.push(
            `簡答：\\(DE=${bc / 2}\\)。過程：三角形兩邊中點連線平行第三邊，且長度為第三邊的一半，所以 \\(DE=\\dfrac{1}{2}BC=${bc / 2}\\)。`
          );
        } else if (i % 3 === 1) {
          questions.push(
            `連接 \\(\\triangle ABC\\) 三邊中點形成中點三角形 \\(\\triangle DEF\\)。若 \\(\\triangle DEF\\) 的周長為 ${perimeterSmall}，求 \\(\\triangle ABC\\) 的周長。`
          );
          answers.push(
            `簡答：${perimeterSmall * 2}。過程：中點三角形的每一邊都是原三角形對應邊長的一半，所以周長也是原三角形的一半。因此原三角形周長為 \\(${perimeterSmall}\\times 2=${perimeterSmall * 2}\\)。`
          );
        } else {
          const area = randInt(24, 96);
          questions.push(
            `連接 \\(\\triangle ABC\\) 三邊中點形成中點三角形 \\(\\triangle DEF\\)。若 \\(\\triangle ABC\\) 面積為 \\(${area}\\)，求 \\(\\triangle DEF\\) 的面積。`
          );
          answers.push(
            `簡答：\\(${formatFraction(area, 4)}\\)。過程：中點三角形與原三角形相似，邊長比為 \\(1:2\\)，面積比為 \\(1:4\\)，所以 \\([DEF]=${area}\\div4=${formatFraction(area, 4)}\\)。`
          );
        }
      } else if (type === 'trapezoidWeighted') {
        const ad = randInt(3, 12);
        const bc = ad + randInt(4, 18);
        const [m, n] = coprimePair(1, 5);
        const efNumerator = n * ad + m * bc;
        const efDenominator = m + n;
        const ef = formatFraction(efNumerator, efDenominator);
        if (i % 3 === 0) {
          questions.push(
            `梯形 \\(ABCD\\) 中，\\(AD\\parallel EF\\parallel BC\\)，點 \\(E\\) 在 \\(AB\\) 上且 \\(AE:EB=${m}:${n}\\)。若上底 \\(AD=${ad}\\)、下底 \\(BC=${bc}\\)，求 \\(EF\\)。`
          );
          answers.push(
            `簡答：\\(EF=${ef}\\)。過程：若 \\(AE:EB=m:n\\)，則 \\(EF=\\dfrac{n\\cdot AD+m\\cdot BC}{m+n}\\)。代入得 \\(EF=\\dfrac{${n}\\cdot ${ad}+${m}\\cdot ${bc}}{${m}+${n}}=${ef}\\)。`
          );
        } else if (i % 3 === 1) {
          questions.push(
            `梯形 \\(ABCD\\) 中，\\(AD\\parallel EF\\parallel BC\\)，且 \\(AE:EB=${m}:${n}\\)。若 \\(AD=${ad}\\)、\\(EF=${ef}\\)，求 \\(BC\\)。`
          );
          answers.push(
            `簡答：\\(BC=${bc}\\)。過程：由 \\(EF=\\dfrac{${n}\\cdot AD+${m}\\cdot BC}{${m}+${n}}\\)，代入 \\(EF=${ef}\\)、\\(AD=${ad}\\)，可解得 \\(BC=${bc}\\)。`
          );
        } else {
          const x = ad;
          const efValue = formatFraction(n * x + m * bc, m + n);
          questions.push(
            `梯形 \\(ABCD\\) 中，\\(AD\\parallel EF\\parallel BC\\)，且 \\(AE:EB=${m}:${n}\\)。若 \\(AD=x\\)、\\(BC=${bc}\\)、\\(EF=${efValue}\\)，求 \\(x\\)。`
          );
          answers.push(
            `簡答：\\(x=${x}\\)。過程：代入分點截線公式 \\(EF=\\dfrac{${n}x+${m}\\cdot ${bc}}{${m}+${n}}\\)，解得 \\(x=${x}\\)。`
          );
        }
      } else if (type === 'trapezoidMidline') {
        const ad = randInt(3, 10);
        const bc = ad + randInt(4, 12);
        const ef = (ad + bc) / 2;
        const efText = formatFraction(ad + bc, 2);
        questions.push(
          `梯形 \\(ABCD\\) 中，\\(AD\\parallel BC\\)，\\(E\\)、\\(F\\) 分別是兩腰的中點。若 \\(AD=${ad}\\)、\\(BC=${bc}\\)，求梯形中線 \\(EF\\) 的長度。`
        );
        answers.push(
          `簡答：\\(EF=${efText}\\)。過程：梯形中線長等於兩底和的一半，\\(EF=\\dfrac{AD+BC}{2}=\\dfrac{${ad}+${bc}}{2}=${efText}\\)。`
        );
      } else if (type === 'multiParallel') {
        const ab = randInt(2, 9);
        const bc = randInt(2, 9);
        const factor = randInt(2, 6);
        const de = ab * factor;
        const ef = bc * factor;
        if (i % 3 === 0) {
          questions.push(
            `三條平行線 \\(L_1\\parallel L_2\\parallel L_3\\) 截兩條斜線。第一條斜線上相鄰截距為 \\(AB=${ab}\\)、\\(BC=${bc}\\)，第二條斜線上對應截距為 \\(DE=${de}\\)、\\(EF\\)。求 \\(EF\\)。`
          );
          answers.push(
            `簡答：\\(EF=${ef}\\)。過程：多條平行線截兩條直線時，對應截距成比例，\\(AB:BC=DE:EF\\)。代入 \\(${ab}:${bc}=${de}:EF\\)，解得 \\(EF=${ef}\\)。`
          );
        } else if (i % 3 === 1) {
          const total = de + ef;
          questions.push(
            `三條平行線 \\(L_1\\parallel L_2\\parallel L_3\\) 截兩條斜線。第一條斜線上的兩段比為 \\(AB:BC=${ab}:${bc}\\)，第二條斜線上的對應兩段總長為 \\(${total}\\)。求這兩段長度。`
          );
          answers.push(
            `簡答：兩段長度為 \\(${de}\\)、\\(${ef}\\)。過程：對應截距成比例，第二條斜線也分成 \\(${ab}:${bc}\\)。每一份為 \\(${total}\\div(${ab}+${bc})=${factor}\\)，所以兩段為 \\(${de}\\)、\\(${ef}\\)。`
          );
        } else {
          const xShift = randInt(1, 5);
          questions.push(
            `三條平行線 \\(L_1\\parallel L_2\\parallel L_3\\) 截兩條斜線。第一條斜線上 \\(AB=${ab}\\)、\\(BC=x+${xShift}\\)；第二條斜線上對應截距 \\(DE=${de}\\)、\\(EF=${(bc + xShift) * factor}\\)。求 \\(x\\)。`
          );
          answers.push(
            `簡答：\\(x=${bc}\\)。過程：由 \\(AB:BC=DE:EF\\)，得 \\(${ab}:(x+${xShift})=${de}:${(bc + xShift) * factor}\\)。化簡後 \\(x+${xShift}=${bc + xShift}\\)，所以 \\(x=${bc}\\)。`
          );
        }
      } else if (type === 'equalHeightArea') {
        const [bd, dc] = coprimePair(2, 8);
        const area = (bd + dc) * randInt(3, 9);
        const targetArea = (area * bd) / (bd + dc);
        questions.push(
          `在 \\(\\triangle ABC\\) 中，點 \\(D\\) 在 \\(BC\\) 上，且 \\(BD:DC=${bd}:${dc}\\)。若 \\(\\triangle ABC\\) 面積為 ${area}，求 \\(\\triangle ABD\\) 的面積。`
        );
        answers.push(
          `簡答：${targetArea}。過程：\\(\\triangle ABD\\) 與 \\(\\triangle ABC\\) 以 \\(A\\) 到 \\(BC\\) 的高為同一條高，所以面積比等於底邊比，\\([ABD]:[ABC]=${bd}:${bd + dc}\\)。因此面積為 \\(${area}\\times\\dfrac{${bd}}{${bd + dc}}=${targetArea}\\)。`
        );
      } else if (type === 'similarArea') {
        let top = randInt(2, 5);
        let bottom = top + randInt(1, 4);
        while (gcdInt(top, bottom) !== 1) {
          top = randInt(2, 5);
          bottom = top + randInt(1, 4);
        }
        const gcd = gcdInt(top * top, bottom * bottom);
        const areaRatio = [(top * top) / gcd, (bottom * bottom) / gcd];
        questions.push(
          `已知 \\(\\triangle ADE\\sim\\triangle ABC\\)，且對應邊長比 \\(AD:AB=${top}:${bottom}\\)。求 \\(\\triangle ADE\\) 與 \\(\\triangle ABC\\) 的面積比。`
        );
        answers.push(
          `簡答：\\(${ratioTex(areaRatio)}\\)。過程：相似圖形面積比等於邊長比的平方，所以 \\([ADE]:[ABC]=${top}^2:${bottom}^2=${ratioTex(areaRatio)}\\)。`
        );
      } else if (type === 'trapezoidArea') {
        const ad = randInt(2, 6);
        const bc = ad + randInt(2, 8);
        const gcd = gcdInt(ad * ad, bc * bc);
        const areaRatio = [(ad * ad) / gcd, (bc * bc) / gcd];
        questions.push(
          `梯形 \\(ABCD\\) 中，\\(AD\\parallel BC\\)，兩對角線交於 \\(E\\)。若 \\(AD=${ad}\\)、\\(BC=${bc}\\)，求 \\(\\triangle ADE\\) 與 \\(\\triangle BCE\\) 的面積比。`
        );
        answers.push(
          `簡答：\\(${ratioTex(areaRatio)}\\)。過程：因為 \\(AD\\parallel BC\\)，可得 \\(\\triangle ADE\\sim\\triangle BCE\\)，相似比為 \\(AD:BC=${ad}:${bc}\\)。面積比為相似比平方，所以 \\([ADE]:[BCE]=${ratioTex(areaRatio)}\\)。`
        );
      } else if (type === 'shadow') {
        const personHeight = randInt(150, 190);
        const personShadow = randInt(100, 250);
        const shadowScale = randInt(2, 6);
        const poleShadow = personShadow * shadowScale;
        const poleHeight = personHeight * shadowScale;
        questions.push(
          `同一時間陽光照射下，身高 \\(${personHeight}\\) 公分的人影長 \\(${personShadow}\\) 公分。若旗竿影長為 \\(${poleShadow}\\) 公分，求旗竿高度。`
        );
        answers.push(
          `簡答：\\(${poleHeight}\\) 公分。過程：同一時間太陽仰角相同，人與旗竿形成相似三角形，所以 \\(\\dfrac{旗竿高度}{${poleShadow}}=\\dfrac{${personHeight}}{${personShadow}}\\)。故旗竿高度 \\(=${poleShadow}\\times\\dfrac{${personHeight}}{${personShadow}}=${poleHeight}\\) 公分。`
        );
      } else if (type === 'scale') {
        const map = randInt(3, 12);
        const ratio = randInt(5, 30);
        const real = map * ratio;
        const newMap = randInt(2, 10);
        const newReal = formatFraction(real * newMap, map);
        questions.push(
          `一張縮圖中，圖上長 \\(${map}\\) 公分代表實際長 \\(${real}\\) 公分。若同一比例下圖上長 \\(${newMap}\\) 公分，求實際長度。`
        );
        answers.push(
          `簡答：\\(${newReal}\\) 公分。過程：同一比例下圖上長與實際長成正比，\\(${map}:${real}=${newMap}:x\\)。解得 \\(x=${newReal}\\)，所以實際長度為 \\(${newReal}\\) 公分。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ513Set(kind, count) {
    const questions = [];
    const answers = [];
    const kinds = {
      criteriaMixed: ['aaCriterion', 'sssCriterion', 'sasCriterion', 'parallelBasic', 'butterflyBasic'],
      ratioMixed: ['correspondingElement', 'areaToSide', 'areaFromSide', 'scaleArea'],
      scalingMixed: ['figureScaleLength', 'scaleBackLength', 'areaScaleFactor', 'angleInvariant', 'scaleArea'],
      butterflyMixed: ['butterflyBasic', 'butterflyAreaRatio', 'butterflySegmentRatio', 'parallelBasic'],
      rightMixed: ['rightAltitude', 'rightLegs', 'rightProjection'],
      bisectorMixed: ['angleBisectorSegments', 'angleBisectorUnknown', 'bisectorParallel'],
      measurementMixed: ['shadowMeasure', 'mirrorMeasure', 'pinholeMeasure', 'riverMeasure'],
    };
    const pythagoreanTriples = [
      [3, 4, 5],
      [5, 12, 13],
      [6, 8, 10],
      [7, 24, 25],
      [8, 15, 17],
    ];
    const coprimePair = (min, max) => {
      let a = randInt(min, max);
      let b = randInt(min, max);
      while (a === b || gcdInt(a, b) !== 1) {
        a = randInt(min, max);
        b = randInt(min, max);
      }
      return a < b ? [a, b] : [b, a];
    };
    const sourceKinds = kinds[kind] || [kind];
    for (let i = 0; i < count; i += 1) {
      const type = sourceKinds[i % sourceKinds.length];
      if (type === 'aaCriterion') {
        const angleA = randInt(35, 75);
        const angleB = randInt(35, 85);
        const angleD = angleA;
        const angleE = i % 2 === 0 ? angleB : angleB + randInt(5, 12);
        const isSimilar = angleE === angleB;
        questions.push(
          `\\(\\triangle ABC\\) 中，\\(\\angle A=${angleA}^\\circ\\)、\\(\\angle B=${angleB}^\\circ\\)。\\(\\triangle DEF\\) 中，\\(\\angle D=${angleD}^\\circ\\)、\\(\\angle E=${angleE}^\\circ\\)。判斷兩三角形是否相似。`
        );
        answers.push(
          `簡答：${isSimilar ? '相似' : '不一定相似'}。過程：AA 相似需有兩組對應角相等。本題 \\(\\angle A=\\angle D=${angleA}^\\circ\\)，${isSimilar ? `且 \\(\\angle B=\\angle E=${angleB}^\\circ\\)，所以兩三角形相似。` : `但 \\(\\angle B=${angleB}^\\circ\\)、\\(\\angle E=${angleE}^\\circ\\) 不相等，因此不能用 AA 判定相似。`}`
        );
      } else if (type === 'sssCriterion') {
        const base = pythagoreanTriples[randInt(0, pythagoreanTriples.length - 1)];
        const scaleA = randInt(1, 4);
        const scaleB = i % 2 === 0 ? randInt(2, 5) : randInt(2, 5);
        const sidesA = base.map((value) => value * scaleA);
        const sidesB = base.map((value) => value * scaleB);
        if (i % 2 === 1) sidesB[2] += 1;
        const ratios = sidesA.map((value, idx) => formatFraction(sidesB[idx], value));
        const isSimilar = ratios[0] === ratios[1] && ratios[1] === ratios[2];
        questions.push(
          `已知 \\(\\triangle ABC\\) 的三邊長為 \\(${sidesA.join(',')}\\)，\\(\\triangle DEF\\) 的三邊長為 \\(${sidesB.join(',')}\\)。判斷兩三角形是否相似。`
        );
        answers.push(
          `簡答：${isSimilar ? '相似' : '不相似'}。過程：SSS 相似需三組對應邊成同一比例。三組邊長比為 \\(${ratios.join(',')}\\)，${isSimilar ? '比例相同，所以兩三角形相似。' : '比例不全相同，所以兩三角形不相似。'}`
        );
      } else if (type === 'sasCriterion') {
        const [p, q] = coprimePair(2, 7);
        const scaleA = randInt(2, 5);
        const scaleB = randInt(2, 5);
        const angle = randInt(35, 115);
        const sideA1 = p * scaleA;
        const sideA2 = q * scaleA;
        const sideB1 = p * scaleB;
        const sideB2 = q * scaleB;
        questions.push(
          `兩個三角形各有一個夾角為 \\(${angle}^\\circ\\)。第一個三角形夾角兩邊長為 \\(${sideA1}\\)、\\(${sideA2}\\)，第二個三角形對應兩邊長為 \\(${sideB1}\\)、\\(${sideB2}\\)。判斷兩三角形是否相似。`
        );
        answers.push(
          `簡答：相似。過程：兩個夾角相等，且夾角兩邊 \\(${sideA1}:${sideB1}=${sideA2}:${sideB2}=${scaleA}:${scaleB}\\)，符合 SAS 相似。`
        );
      } else if (type === 'parallelBasic') {
        const [p, q] = coprimePair(1, 5);
        const factor = randInt(3, 9);
        const de = p * factor;
        const bc = (p + q) * factor;
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(D\\) 在 \\(AB\\) 上，\\(E\\) 在 \\(AC\\) 上，且 \\(DE\\parallel BC\\)。若 \\(AD:DB=${p}:${q}\\)，且 \\(DE=${de}\\)，求 \\(BC\\)。`
        );
        answers.push(
          `簡答：\\(BC=${bc}\\)。過程：\\(DE\\parallel BC\\) 時，\\(\\triangle ADE\\sim\\triangle ABC\\)，所以 \\(DE:BC=AD:AB=${p}:${p + q}\\)。因此 \\(BC=${bc}\\)。`
        );
      } else if (type === 'butterflyBasic') {
        const [oa, od] = coprimePair(2, 9);
        const scale = randInt(2, 6);
        const ab = oa * scale;
        const cd = od * scale;
        questions.push(
          `兩直線 \\(AB\\) 與 \\(CD\\) 平行，且 \\(AD\\)、\\(BC\\) 交於 \\(O\\)，形成蝴蝶形。若 \\(OA=${oa}\\)、\\(OD=${od}\\)、\\(AB=${ab}\\)，求 \\(CD\\)。`
        );
        answers.push(
          `簡答：\\(CD=${cd}\\)。過程：因 \\(AB\\parallel CD\\)，\\(\\triangle OAB\\sim\\triangle ODC\\)，所以 \\(OA:OD=AB:CD\\)。代入 \\(${oa}:${od}=${ab}:CD\\)，得 \\(CD=${cd}\\)。`
        );
      } else if (type === 'correspondingElement') {
        const [p, q] = coprimePair(2, 7);
        const base = randInt(3, 12) * p;
        const target = formatFraction(base * q, p);
        const element = ['中線', '角平分線', '高'][i % 3];
        questions.push(
          `若 \\(\\triangle ABC\\sim\\triangle DEF\\)，且對應邊長比 \\(AB:DE=${p}:${q}\\)。已知 \\(\\triangle ABC\\) 中一條對應${element}長為 \\(${base}\\)，求 \\(\\triangle DEF\\) 中對應${element}的長度。`
        );
        answers.push(
          `簡答：\\(${target}\\)。過程：相似三角形中，對應高、對應中線、對應角平分線的比都等於邊長比。因此長度為 \\(${base}\\times\\dfrac{${q}}{${p}}=${target}\\)。`
        );
      } else if (type === 'areaToSide') {
        const [p, q] = coprimePair(2, 8);
        const smallPerimeter = p * randInt(4, 12);
        const largePerimeter = formatFraction(smallPerimeter * q, p);
        questions.push(
          `兩個相似三角形的面積比為 \\(${p * p}:${q * q}\\)。若較小三角形的周長為 \\(${smallPerimeter}\\)，求較大三角形的周長。`
        );
        answers.push(
          `簡答：\\(${largePerimeter}\\)。過程：面積比是邊長比的平方，所以邊長比與周長比為 \\(${p}:${q}\\)。較大周長為 \\(${smallPerimeter}\\times\\dfrac{${q}}{${p}}=${largePerimeter}\\)。`
        );
      } else if (type === 'areaFromSide') {
        const [p, q] = coprimePair(2, 7);
        const areaA = p * p * randInt(3, 10);
        const areaB = formatFraction(areaA * q * q, p * p);
        questions.push(
          `若 \\(\\triangle ABC\\sim\\triangle DEF\\)，且對應邊長比 \\(AB:DE=${p}:${q}\\)。已知 \\(\\triangle ABC\\) 面積為 \\(${areaA}\\)，求 \\(\\triangle DEF\\) 面積。`
        );
        answers.push(
          `簡答：\\(${areaB}\\)。過程：相似圖形面積比等於邊長比平方，所以 \\([ABC]:[DEF]=${p * p}:${q * q}\\)。故 \\([DEF]=${areaA}\\times\\dfrac{${q * q}}{${p * p}}=${areaB}\\)。`
        );
      } else if (type === 'scaleArea') {
        const baseScale = randInt(2, 5);
        const heightDen = randInt(2, 5);
        const areaRatio = reduceRatioTriple([baseScale, heightDen]);
        questions.push(
          `將一個三角形的底邊放大為原來的 \\(${baseScale}\\) 倍，高縮小為原來的 \\(\\dfrac{1}{${heightDen}}\\)。求新三角形面積與原三角形面積的比。`
        );
        answers.push(
          `簡答：\\(${ratioTex(areaRatio)}\\)。過程：三角形面積 \\(=\\dfrac{1}{2}\\times 底\\times 高\\)，所以面積倍率為 \\(${baseScale}\\times\\dfrac{1}{${heightDen}}\\)。因此新面積:原面積 \\(=${baseScale}:${heightDen}=${ratioTex(areaRatio)}\\)。`
        );
      } else if (type === 'figureScaleLength') {
        const width = randInt(4, 15);
        const height = randInt(5, 18);
        const numerator = randInt(3, 8);
        const denominator = randInt(2, 6);
        const newWidth = formatFraction(width * numerator, denominator);
        const newHeight = formatFraction(height * numerator, denominator);
        questions.push(
          `一張長方形圖片的長、寬分別為 \\(${width}\\)、\\(${height}\\)。若等比例縮放為原來的 \\(\\dfrac{${numerator}}{${denominator}}\\) 倍，求新圖片的長、寬。`
        );
        answers.push(
          `簡答：新長、寬分別為 \\(${newWidth}\\)、\\(${newHeight}\\)。過程：等比例縮放時所有長度都乘同一倍率，所以長為 \\(${width}\\times\\dfrac{${numerator}}{${denominator}}=${newWidth}\\)，寬為 \\(${height}\\times\\dfrac{${numerator}}{${denominator}}=${newHeight}\\)。`
        );
      } else if (type === 'scaleBackLength') {
        const original = randInt(4, 14);
        const numerator = randInt(2, 7);
        const denominator = randInt(2, 6);
        const scaled = formatFraction(original * numerator, denominator);
        questions.push(
          `一個圖形等比例縮放為原來的 \\(\\dfrac{${numerator}}{${denominator}}\\) 倍後，某一邊長變為 \\(${scaled}\\)。求原圖形對應邊長。`
        );
        answers.push(
          `簡答：原邊長為 \\(${original}\\)。過程：縮放後長度 \\(=\\) 原長度 \\(\\times\\dfrac{${numerator}}{${denominator}}\\)，所以原長度 \\(=${scaled}\\div\\dfrac{${numerator}}{${denominator}}=${original}\\)。`
        );
      } else if (type === 'areaScaleFactor') {
        const scale = randInt(2, 5);
        const areaMultiplier = scale * scale;
        questions.push(`一個圖形等比例放大 \\(${scale}\\) 倍後，面積變為原來的幾倍？`);
        answers.push(
          `簡答：\\(${areaMultiplier}\\) 倍。過程：等比例縮放時，面積倍率是長度倍率的平方，所以面積變為 \\(${scale}^2=${areaMultiplier}\\) 倍。`
        );
      } else if (type === 'angleInvariant') {
        const angle = randInt(25, 75);
        const scale = randInt(2, 5);
        questions.push(
          `兩個三角形相似，其中一個角為 \\(${angle}^\\circ\\)。若圖形放大 \\(${scale}\\) 倍，求對應角的度數。`
        );
        answers.push(
          `簡答：\\(${angle}^\\circ\\)。過程：相似或等比例縮放只改變邊長，不改變角度，所以對應角仍為 \\(${angle}^\\circ\\)。`
        );
      } else if (type === 'butterflyAreaRatio') {
        const [oa, od] = coprimePair(2, 9);
        const areaOAB = oa * oa * randInt(2, 6);
        const areaODC = formatFraction(areaOAB * od * od, oa * oa);
        questions.push(
          `兩直線 \\(AB\\parallel CD\\)，且 \\(AD\\)、\\(BC\\) 交於 \\(O\\)。若 \\(OA:OD=${oa}:${od}\\)，且 \\(\\triangle OAB\\) 面積為 \\(${areaOAB}\\)，求 \\(\\triangle ODC\\) 面積。`
        );
        answers.push(
          `簡答：\\(${areaODC}\\)。過程：蝴蝶形中 \\(\\triangle OAB\\sim\\triangle ODC\\)，邊長比為 \\(OA:OD=${oa}:${od}\\)，面積比為 \\(${oa * oa}:${od * od}\\)。所以 \\([ODC]=${areaOAB}\\times\\dfrac{${od * od}}{${oa * oa}}=${areaODC}\\)。`
        );
      } else if (type === 'butterflySegmentRatio') {
        const [oa, od] = coprimePair(2, 9);
        const scale = randInt(2, 6);
        const oc = od * scale;
        const ob = oa * scale;
        questions.push(
          `兩直線 \\(AB\\parallel CD\\)，且 \\(AD\\)、\\(BC\\) 交於 \\(O\\)。若 \\(OA=${oa}\\)、\\(OD=${od}\\)、\\(OC=${oc}\\)，求 \\(OB\\)。`
        );
        answers.push(
          `簡答：\\(OB=${ob}\\)。過程：\\(\\triangle OAB\\sim\\triangle ODC\\)，所以 \\(OA:OD=OB:OC\\)。代入 \\(${oa}:${od}=OB:${oc}\\)，得 \\(OB=${ob}\\)。`
        );
      } else if (type === 'rightAltitude') {
        const [m, n] = coprimePair(2, 5);
        const bd = m * m;
        const dc = n * n;
        const ad = m * n;
        questions.push(
          `直角 \\(\\triangle ABC\\) 中，\\(\\angle A=90^\\circ\\)，高 \\(AD\\perp BC\\)。若 \\(BD=${bd}\\)、\\(DC=${dc}\\)，求斜邊上的高 \\(AD\\)。`
        );
        answers.push(
          `簡答：\\(AD=${ad}\\)。過程：母子相似性質給出 \\(AD^2=BD\\times DC\\)，所以 \\(AD=\\sqrt{${bd}\\times${dc}}=${ad}\\)。`
        );
      } else if (type === 'rightLegs') {
        const rightLegTriples = [
          [3, 4, 5],
          [4, 3, 5],
        ];
        const [legA, legB, hypotenuse] = rightLegTriples[randInt(0, rightLegTriples.length - 1)];
        const scale = randInt(1, 6);
        const bd = legA * legA * scale;
        const dc = legB * legB * scale;
        const bc = hypotenuse * hypotenuse * scale;
        const ab = legA * hypotenuse * scale;
        const ac = legB * hypotenuse * scale;
        questions.push(
          `直角 \\(\\triangle ABC\\) 中，\\(\\angle A=90^\\circ\\)，高 \\(AD\\perp BC\\)，且 \\(BD=${bd}\\)、\\(DC=${dc}\\)。求兩股 \\(AB\\)、\\(AC\\)。`
        );
        answers.push(
          `簡答：\\(AB=${ab}\\)、\\(AC=${ac}\\)。過程：\\(BC=${bc}\\)。母子相似性質為 \\(AB^2=BD\\times BC\\)、\\(AC^2=DC\\times BC\\)，所以 \\(AB=${ab}\\)、\\(AC=${ac}\\)。`
        );
      } else if (type === 'rightProjection') {
        const [m, n] = coprimePair(2, 6);
        const bd = m * m;
        const dc = n * n;
        const offset = randInt(1, m * n - 1);
        const x = m * n - offset;
        questions.push(
          `直角 \\(\\triangle ABC\\) 中，\\(\\angle A=90^\\circ\\)，高 \\(AD\\perp BC\\)。若 \\(AD=x+${offset}\\)、\\(BD=${bd}\\)、\\(DC=${dc}\\)，求 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：\\(AD^2=BD\\times DC=${bd}\\times${dc}\\)，所以 \\(AD=${m * n}\\)。由 \\(x+${offset}=${m * n}\\)，得 \\(x=${x}\\)。`
        );
      } else if (type === 'angleBisectorSegments') {
        const [p, q] = coprimePair(2, 8);
        const unit = randInt(2, 9);
        const bc = (p + q) * unit;
        const bd = p * unit;
        const dc = q * unit;
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(AD\\) 為 \\(\\angle A\\) 的角平分線並交 \\(BC\\) 於 \\(D\\)。若 \\(AB:AC=${p}:${q}\\)、\\(BC=${bc}\\)，求 \\(BD\\)、\\(DC\\)。`
        );
        answers.push(
          `簡答：\\(BD=${bd}\\)、\\(DC=${dc}\\)。過程：內分比定理給出 \\(BD:DC=AB:AC=${p}:${q}\\)。因 \\(BC=${bc}\\)，所以每一份為 \\(${unit}\\)，得 \\(BD=${bd}\\)、\\(DC=${dc}\\)。`
        );
      } else if (type === 'angleBisectorUnknown') {
        const [p, q] = coprimePair(3, 9);
        const unit = randInt(2, 6);
        const ab = p * unit;
        const ac = q * unit;
        const x = randInt(1, Math.min(ab, ac) - 1);
        const aOffset = ab - x;
        const cOffset = ac - x;
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(AD\\) 平分 \\(\\angle BAC\\) 且交 \\(BC\\) 於 \\(D\\)。若 \\(AB=x+${aOffset}\\)、\\(AC=x+${cOffset}\\)、\\(BD:DC=${p}:${q}\\)，求 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：內分比定理得 \\(AB:AC=BD:DC=${p}:${q}\\)。所以 \\((x+${aOffset}):(x+${cOffset})=${p}:${q}\\)，解得 \\(x=${x}\\)。`
        );
      } else if (type === 'bisectorParallel') {
        const [p, q] = coprimePair(2, 8);
        const unit = randInt(2, 6);
        const ab = p * unit;
        const ac = q * unit;
        const bc = (p + q) * randInt(2, 5);
        const bd = formatFraction(p * bc, p + q);
        const de = formatFraction(ab * q, p + q);
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(AD\\) 為 \\(\\angle A\\) 的角平分線並交 \\(BC\\) 於 \\(D\\)。若 \\(AB=${ab}\\)、\\(AC=${ac}\\)、\\(BC=${bc}\\)，過 \\(D\\) 作 \\(DE\\parallel AB\\) 交 \\(AC\\) 於 \\(E\\)，求 \\(DE\\)。`
        );
        answers.push(
          `簡答：\\(DE=${de}\\)。過程：先由內分比定理得 \\(BD:DC=AB:AC=${p}:${q}\\)，所以 \\(BD=${bd}\\)。又 \\(DE\\parallel AB\\)，\\(\\triangle CDE\\sim\\triangle CBA\\)，故 \\(DE:AB=CD:CB\\)，可得 \\(DE=${de}\\)。`
        );
      } else if (type === 'shadowMeasure') {
        const personHeight = randInt(150, 190);
        const personShadow = randInt(80, 220);
        const scale = randInt(2, 6);
        const objectShadow = personShadow * scale;
        const objectHeight = personHeight * scale;
        questions.push(
          `同一時間陽光照射下，身高 \\(${personHeight}\\) 公分的人影長 \\(${personShadow}\\) 公分。若旗竿影長為 \\(${objectShadow}\\) 公分，求旗竿高度。`
        );
        answers.push(
          `簡答：\\(${objectHeight}\\) 公分。過程：同時刻物高與影長成正比，\\(\\dfrac{旗竿高度}{${objectShadow}}=\\dfrac{${personHeight}}{${personShadow}}\\)，所以旗竿高度為 \\(${objectHeight}\\) 公分。`
        );
      } else if (type === 'mirrorMeasure') {
        const eyeHeight = randInt(140, 180);
        const personToMirror = randInt(2, 6);
        const scale = randInt(2, 7);
        const objectToMirror = personToMirror * scale;
        const objectHeight = eyeHeight * scale;
        questions.push(
          `為測量樹高，在距樹 \\(${objectToMirror}\\) 公尺處放一面平面鏡，人站在鏡子另一側 \\(${personToMirror}\\) 公尺處剛好看到樹頂。若人眼離地 \\(${eyeHeight}\\) 公分，求樹高。`
        );
        answers.push(
          `簡答：\\(${objectHeight}\\) 公分。過程：入射角等於反射角，形成相似直角三角形，故 \\(樹高:人眼高度=${objectToMirror}:${personToMirror}\\)。樹高 \\(=${eyeHeight}\\times\\dfrac{${objectToMirror}}{${personToMirror}}=${objectHeight}\\) 公分。`
        );
      } else if (type === 'pinholeMeasure') {
        const insectHeight = randInt(6, 15);
        const pinholeDistance = randInt(10, 30);
        const scale = randInt(2, 5);
        const screenDistance = pinholeDistance * scale;
        const imageHeight = insectHeight * scale;
        questions.push(
          `利用針孔成像觀察昆蟲，昆蟲高 \\(${insectHeight}\\) 公分，昆蟲到針孔距離 \\(${pinholeDistance}\\) 公分。若屏幕到針孔距離 \\(${screenDistance}\\) 公分，求屏幕上影像高度。`
        );
        answers.push(
          `簡答：\\(${imageHeight}\\) 公分。過程：針孔成像中，影像高度與物體高度之比等於屏幕距離與物體距離之比，所以影像高度 \\(=${insectHeight}\\times\\dfrac{${screenDistance}}{${pinholeDistance}}=${imageHeight}\\) 公分。`
        );
      } else if (type === 'riverMeasure') {
        const ce = randInt(3, 9);
        const de = randInt(2, 6);
        const scale = randInt(3, 8);
        const bc = ce * scale;
        const ab = de * scale;
        questions.push(
          `為測河寬 \\(AB\\)，在岸邊取點 \\(C\\)，使 \\(AB\\perp BC\\)。再在岸邊取點 \\(D\\)，作 \\(DE\\perp BC\\)，且 \\(A,C,E\\) 三點共線。若 \\(BC=${bc}\\) 公尺、\\(CE=${ce}\\) 公尺、\\(DE=${de}\\) 公尺，求河寬 \\(AB\\)。`
        );
        answers.push(
          `簡答：\\(AB=${ab}\\) 公尺。過程：\\(\\triangle ABC\\sim\\triangle EDC\\)，所以 \\(AB:DE=BC:CE\\)。代入得 \\(AB:${de}=${bc}:${ce}\\)，故 \\(AB=${ab}\\) 公尺。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ514Set(kind, count) {
    const questions = [];
    const answers = [];
    const kinds = {
      measurementMixed: ['shadowHeight', 'standardPole', 'mirrorHeight', 'pinholeImage', 'riverWidth'],
      ratioMixed: ['perimeterSide', 'areaToLength', 'parallelAreaSplit', 'scaleArea'],
      rightMidMixed: ['rightAltitude', 'rightLegs', 'midpointTriangleArea', 'midpointQuadrilateral'],
      trigBasicMixed: ['trigFromSides', 'sideFromTrig', 'specialAngle', 'minAngleCos'],
      trigAppMixed: ['slopePercent', 'ladderAngle', 'trigArea', 'similarTrigTransfer'],
    };
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [8, 15, 17],
      [7, 24, 25],
    ];
    const specialTriangles = [
      { angle: 30, short: 1, long: '\\sqrt{3}', hyp: 2 },
      { angle: 45, short: 1, long: 1, hyp: '\\sqrt{2}' },
      { angle: 60, short: '\\sqrt{3}', long: 1, hyp: 2 },
    ];
    const coprimePair = (min, max) => {
      let a = randInt(min, max);
      let b = randInt(min, max);
      while (a === b || gcdInt(a, b) !== 1) {
        a = randInt(min, max);
        b = randInt(min, max);
      }
      return a < b ? [a, b] : [b, a];
    };
    const sourceKinds = kinds[kind] || [kind];
    for (let i = 0; i < count; i += 1) {
      const type = sourceKinds[i % sourceKinds.length];
      if (type === 'shadowHeight') {
        const personHeight = randInt(150, 190);
        const personShadow = randInt(80, 220);
        const scale = randInt(2, 6);
        const objectShadow = personShadow * scale;
        const objectHeight = personHeight * scale;
        questions.push(
          `同一時間陽光照射下，身高 \\(${personHeight}\\) 公分的人影長 \\(${personShadow}\\) 公分。若旗竿影長為 \\(${objectShadow}\\) 公分，求旗竿高度。`
        );
        answers.push(
          `簡答：\\(${objectHeight}\\) 公分。過程：同時刻物高與影長成正比。設旗竿高為 \\(H\\)，則 \\(H:${objectShadow}=${personHeight}:${personShadow}\\)，所以 \\(H=${objectHeight}\\)。`
        );
      } else if (type === 'standardPole') {
        const eye = randInt(140, 170);
        const pole = eye + randInt(40, 90);
        const near = randInt(2, 6);
        const scale = randInt(2, 6);
        const far = near * scale;
        const tree = eye + (pole - eye) * scale;
        questions.push(
          `小羽要測樹高，離樹 \\(${far}\\) 公尺處立一根 \\(${formatFraction(pole, 100)}\\) 公尺標竿。他後退到距標竿 \\(${near}\\) 公尺處，眼睛、標竿頂端、樹頂共線。若眼睛離地 \\(${formatFraction(eye, 100)}\\) 公尺，求樹高。`
        );
        answers.push(
          `簡答：\\(${formatFraction(tree, 100)}\\) 公尺。過程：高出眼睛的部分成比例，\\((樹高-眼高):(標竿高-眼高)=${far}:${near}\\)。所以樹高 \\(=${formatFraction(eye, 100)}+(${formatFraction(pole, 100)}-${formatFraction(eye, 100)})\\times\\dfrac{${far}}{${near}}=${formatFraction(tree, 100)}\\)。`
        );
      } else if (type === 'mirrorHeight') {
        const eye = randInt(140, 180);
        const personDist = randInt(2, 6);
        const scale = randInt(2, 7);
        const objectDist = personDist * scale;
        const height = eye * scale;
        questions.push(
          `在距大樓 \\(${objectDist}\\) 公尺處放一面平面鏡，人站在鏡子另一側 \\(${personDist}\\) 公尺處剛好看到樓頂。若眼睛離地 \\(${eye}\\) 公分，求大樓高度。`
        );
        answers.push(
          `簡答：\\(${height}\\) 公分。過程：鏡面反射形成相似直角三角形，設大樓高為 \\(H\\)，則 \\(H:${eye}=${objectDist}:${personDist}\\)，所以 \\(H=${height}\\)。`
        );
      } else if (type === 'pinholeImage') {
        const objectHeight = randInt(6, 20);
        const objectDist = randInt(10, 30);
        const scale = randInt(2, 6);
        const screenDist = objectDist * scale;
        const imageHeight = objectHeight * scale;
        questions.push(
          `利用針孔成像觀察物體，物體高 \\(${objectHeight}\\) 公分，物體到針孔距離 \\(${objectDist}\\) 公分。若屏幕到針孔距離 \\(${screenDist}\\) 公分，求屏幕上的像高。`
        );
        answers.push(
          `簡答：\\(${imageHeight}\\) 公分。過程：像高:物高=屏幕距離:物體距離，所以像高 \\(=${objectHeight}\\times\\dfrac{${screenDist}}{${objectDist}}=${imageHeight}\\)。`
        );
      } else if (type === 'riverWidth') {
        const ce = randInt(3, 9);
        const de = randInt(2, 7);
        const scale = randInt(3, 8);
        const bc = ce * scale;
        const ab = de * scale;
        questions.push(
          `為測河寬 \\(AB\\)，在岸邊取點 \\(C\\)，使 \\(AB\\perp BC\\)。再取點 \\(D\\) 作 \\(DE\\perp BC\\)，且 \\(A,C,E\\) 三點共線。若 \\(BC=${bc}\\) 公尺、\\(CE=${ce}\\) 公尺、\\(DE=${de}\\) 公尺，求 \\(AB\\)。`
        );
        answers.push(
          `簡答：\\(AB=${ab}\\) 公尺。過程：\\(\\triangle ABC\\sim\\triangle EDC\\)，所以 \\(AB:DE=BC:CE\\)。代入 \\(AB:${de}=${bc}:${ce}\\)，得 \\(AB=${ab}\\)。`
        );
      } else if (type === 'perimeterSide') {
        const [p, q] = coprimePair(2, 7);
        const perimeterA = p * randInt(8, 18);
        const sideA = p * randInt(2, 9);
        const perimeterB = formatFraction(perimeterA * q, p);
        const sideB = formatFraction(sideA * q, p);
        questions.push(
          `若 \\(\\triangle ABC\\sim\\triangle DEF\\)，且 \\(\\triangle ABC\\) 周長為 \\(${perimeterA}\\)、\\(\\triangle DEF\\) 周長為 \\(${perimeterB}\\)。已知 \\(AB=${sideA}\\)，求對應邊 \\(DE\\)。`
        );
        answers.push(
          `簡答：\\(DE=${sideB}\\)。過程：相似三角形周長比等於對應邊長比，故 \\(AB:DE=${perimeterA}:${perimeterB}=${p}:${q}\\)，所以 \\(DE=${sideB}\\)。`
        );
      } else if (type === 'areaToLength') {
        const [p, q] = coprimePair(2, 8);
        const lengthA = p * randInt(3, 9);
        const lengthB = formatFraction(lengthA * q, p);
        questions.push(
          `兩個相似三角形的面積比為 \\(${p * p}:${q * q}\\)。若較小三角形的一條中線長為 \\(${lengthA}\\)，求較大三角形對應中線長。`
        );
        answers.push(
          `簡答：\\(${lengthB}\\)。過程：面積比是邊長比平方，所以長度比為 \\(${p}:${q}\\)。對應中線也按長度比變化，故為 \\(${lengthA}\\times\\dfrac{${q}}{${p}}=${lengthB}\\)。`
        );
      } else if (type === 'parallelAreaSplit') {
        const [p, q] = coprimePair(1, 5);
        const total = (p + q) * (p + q) * randInt(2, 8);
        const small = (total * p * p) / ((p + q) * (p + q));
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(DE\\parallel BC\\)，且 \\(AD:DB=${p}:${q}\\)。若 \\(\\triangle ABC\\) 面積為 \\(${total}\\)，求 \\(\\triangle ADE\\) 面積。`
        );
        answers.push(
          `簡答：\\(${small}\\)。過程：\\(\\triangle ADE\\sim\\triangle ABC\\)，邊長比 \\(AD:AB=${p}:${p + q}\\)，面積比為 \\(${p * p}:${(p + q) * (p + q)}\\)。所以 \\([ADE]=${total}\\times\\dfrac{${p * p}}{${(p + q) * (p + q)}}=${small}\\)。`
        );
      } else if (type === 'scaleArea') {
        const [p, q] = coprimePair(2, 8);
        const areaRatio = reduceRatioTriple([p * p, q * q]);
        questions.push(`若一個圖形相似放大，對應邊長由 \\(${p}\\) 變為 \\(${q}\\)。求放大後圖形與原圖形的面積比。`);
        answers.push(
          `簡答：\\(${ratioTex(areaRatio)}\\)。過程：相似放大時面積比為邊長比平方，所以面積比為 \\(${p}^2:${q}^2=${ratioTex(areaRatio)}\\)。`
        );
      } else if (type === 'rightAltitude') {
        const [m, n] = coprimePair(2, 6);
        const bd = m * m;
        const dc = n * n;
        const ad = m * n;
        questions.push(
          `直角 \\(\\triangle ABC\\) 中，\\(\\angle A=90^\\circ\\)，高 \\(AD\\perp BC\\)。若 \\(BD=${bd}\\)、\\(DC=${dc}\\)，求 \\(AD\\)。`
        );
        answers.push(
          `簡答：\\(AD=${ad}\\)。過程：母子相似給出 \\(AD^2=BD\\times DC\\)，所以 \\(AD=\\sqrt{${bd}\\times${dc}}=${ad}\\)。`
        );
      } else if (type === 'rightLegs') {
        const [a, b, c] = triples[randInt(0, triples.length - 1)];
        const scale = randInt(1, 5);
        const bd = a * a * scale;
        const dc = b * b * scale;
        const bc = c * c * scale;
        const ab = a * c * scale;
        const ac = b * c * scale;
        questions.push(
          `直角 \\(\\triangle ABC\\) 中，\\(\\angle A=90^\\circ\\)，高 \\(AD\\perp BC\\)。若 \\(BD=${bd}\\)、\\(DC=${dc}\\)，求兩股 \\(AB\\)、\\(AC\\)。`
        );
        answers.push(
          `簡答：\\(AB=${ab}\\)、\\(AC=${ac}\\)。過程：\\(BC=${bc}\\)，且 \\(AB^2=BD\\times BC\\)、\\(AC^2=DC\\times BC\\)，所以 \\(AB=${ab}\\)、\\(AC=${ac}\\)。`
        );
      } else if (type === 'midpointTriangleArea') {
        const area = randInt(12, 40) * 4;
        questions.push(
          `\\(D,E,F\\) 分別為 \\(\\triangle ABC\\) 三邊中點。若 \\(\\triangle ABC\\) 面積為 \\(${area}\\)，求中點三角形 \\(\\triangle DEF\\) 的面積。`
        );
        answers.push(
          `簡答：\\(${area / 4}\\)。過程：中點三角形與原三角形相似，邊長比為 \\(1:2\\)，面積比為 \\(1:4\\)，所以面積為 \\(${area}\\div4=${area / 4}\\)。`
        );
      } else if (type === 'midpointQuadrilateral') {
        const area = randInt(20, 80) * 2;
        questions.push(
          `任意四邊形 \\(ABCD\\) 中，依序連接四邊中點形成四邊形 \\(EFGH\\)。若 \\(ABCD\\) 面積為 \\(${area}\\)，求 \\(EFGH\\) 面積。`
        );
        answers.push(
          `簡答：\\(${area / 2}\\)。過程：四邊中點依序連接會形成平行四邊形，面積為原四邊形的一半，所以 \\([EFGH]=${area / 2}\\)。`
        );
      } else if (type === 'trigFromSides') {
        const [legA, legB, hyp] = triples[randInt(0, triples.length - 1)];
        const asks = [
          { tex: '\\sin A', value: formatFraction(legB, hyp) },
          { tex: '\\cos A', value: formatFraction(legA, hyp) },
          { tex: '\\tan A', value: formatFraction(legB, legA) },
        ];
        const ask = asks[i % asks.length];
        questions.push(
          `直角 \\(\\triangle ABC\\) 中，\\(\\angle C=90^\\circ\\)，\\(AC=${legA}\\)、\\(BC=${legB}\\)、\\(AB=${hyp}\\)。求 \\(${ask.tex}\\)。`
        );
        answers.push(
          `簡答：\\(${ask.value}\\)。過程：以 \\(\\angle A\\) 來看，對邊是 \\(BC\\)，鄰邊是 \\(AC\\)，斜邊是 \\(AB\\)。依三角比定義可得 \\(${ask.tex}=${ask.value}\\)。`
        );
      } else if (type === 'sideFromTrig') {
        const [legA, legB, hyp] = triples[randInt(0, triples.length - 1)];
        const scale = randInt(2, 6);
        const bigHyp = hyp * scale;
        const target = legB * scale;
        questions.push(
          `直角 \\(\\triangle ABC\\) 中，\\(\\angle C=90^\\circ\\)。若 \\(\\sin A=${formatFraction(legB, hyp)}\\)，且斜邊 \\(AB=${bigHyp}\\)，求 \\(BC\\)。`
        );
        answers.push(
          `簡答：\\(BC=${target}\\)。過程：\\(\\sin A=\\dfrac{對邊}{斜邊}=\\dfrac{BC}{AB}\\)，所以 \\(BC=${bigHyp}\\times${formatFraction(legB, hyp)}=${target}\\)。`
        );
      } else if (type === 'specialAngle') {
        const mode = i % 3;
        if (mode === 0) {
          const hyp = randInt(3, 12) * 2;
          questions.push(`一個 \\(30^\\circ-60^\\circ-90^\\circ\\) 直角三角形斜邊長為 \\(${hyp}\\)，求較短股長。`);
          answers.push(
            `簡答：\\(${hyp / 2}\\)。過程：\\(30^\\circ\\) 對邊等於斜邊一半，所以較短股為 \\(${hyp}\\div2=${hyp / 2}\\)。`
          );
        } else if (mode === 1) {
          const leg = randInt(3, 12);
          questions.push(`等腰直角三角形的一股長為 \\(${leg}\\)，求斜邊長。`);
          answers.push(
            `簡答：\\(${leg}\\sqrt{2}\\)。過程：\\(45^\\circ-45^\\circ-90^\\circ\\) 三角形邊長比為 \\(1:1:\\sqrt{2}\\)，所以斜邊為 \\(${leg}\\sqrt{2}\\)。`
          );
        } else {
          const short = randInt(2, 10);
          questions.push(`一個 \\(30^\\circ-60^\\circ-90^\\circ\\) 直角三角形較短股長為 \\(${short}\\)，求較長股長。`);
          answers.push(
            `簡答：\\(${short}\\sqrt{3}\\)。過程：邊長比為 \\(1:\\sqrt{3}:2\\)，所以較長股為 \\(${short}\\sqrt{3}\\)。`
          );
        }
      } else if (type === 'minAngleCos') {
        const [a, b, c] = triples[randInt(0, triples.length - 1)];
        const cosValue = formatFraction(Math.max(a, b), c);
        questions.push(
          `一個直角三角形兩股長為 \\(${a}\\) 與 \\(${b}\\)，斜邊長為 \\(${c}\\)。求最小銳角的 \\(\\cos\\) 值。`
        );
        answers.push(
          `簡答：\\(${cosValue}\\)。過程：最小銳角對最短邊，因此它的鄰邊是較長股，斜邊是 \\(${c}\\)，所以 \\(\\cos=${cosValue}\\)。`
        );
      } else if (type === 'slopePercent') {
        const percent = [5, 8, 10, 12, 15, 20, 25][randInt(0, 6)];
        const unit = 100 / gcdInt(percent, 100);
        const horizontal = unit * randInt(3, 20);
        const rise = (horizontal * percent) / 100;
        questions.push(`一段道路坡度為 \\(${percent}\\%\\)。若水平距離為 \\(${horizontal}\\) 公尺，求垂直上升高度。`);
        answers.push(
          `簡答：\\(${rise}\\) 公尺。過程：坡度 \\(=\\dfrac{h}{d}\\times100\\%\\)。設垂直上升為 \\(h\\)，水平距離為 \\(d\\)，所以 \\(h=${horizontal}\\times\\dfrac{${percent}}{100}=${rise}\\)。`
        );
      } else if (type === 'ladderAngle') {
        const item = specialTriangles[randInt(0, specialTriangles.length - 1)];
        const length = randInt(3, 10) * 2;
        const height =
          item.angle === 30 ? `${length / 2}` : item.angle === 45 ? `${length / 2}\\sqrt{2}` : `${length / 2}\\sqrt{3}`;
        questions.push(
          `一架梯子長 \\(${length}\\) 公尺，斜靠牆面且與地面夾角為 \\(${item.angle}^\\circ\\)。求梯頂距地面的高度。`
        );
        answers.push(
          `簡答：\\(${height}\\) 公尺。過程：高度是夾角的對邊，設高度為 \\(h\\)，則 \\(h=${length}\\times\\sin ${item.angle}^\\circ=${height}\\)。`
        );
      } else if (type === 'trigArea') {
        const [p, q] = coprimePair(2, 8);
        const scale = randInt(2, 7);
        const base = p * scale;
        const height = q * scale;
        const area = (base * height) / 2;
        questions.push(
          `直角三角形中，一銳角 \\(A\\) 滿足 \\(\\tan A=${formatFraction(height, base)}\\)，且鄰邊長為 \\(${base}\\)。求三角形面積。`
        );
        answers.push(
          `簡答：\\(${area}\\)。過程：\\(\\tan A=\\dfrac{對邊}{鄰邊}\\)，所以對邊長為 \\(${height}\\)。面積 \\(=\\dfrac12\\times${base}\\times${height}=${area}\\)。`
        );
      } else if (type === 'similarTrigTransfer') {
        const [a, b, c] = triples[randInt(0, triples.length - 1)];
        const areaScale = randInt(2, 5);
        questions.push(
          `兩個相似直角三角形的面積比為 \\(1:${areaScale * areaScale}\\)。較小三角形某銳角 \\(A\\) 的 \\(\\tan A=${formatFraction(a, b)}\\)。求較大三角形對應角的 \\(\\tan\\) 值。`
        );
        answers.push(
          `簡答：\\(${formatFraction(a, b)}\\)。過程：相似三角形對應角相等，三角比只由角度決定，與放大倍率無關，所以對應角的 \\(\\tan\\) 值仍為 \\(${formatFraction(a, b)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ521Set(kind, count) {
    const questions = [];
    const answers = [];
    const kinds = {
      positionMixed: ['pointCirclePosition', 'lineCirclePosition', 'tangentLength'],
      chordMixed: ['chordDistance', 'chordLength', 'radiusFromChord', 'concentricAnnulus'],
      twoCircleMixed: ['twoCirclePosition', 'radiiFromTangencies', 'externalCommonTangent', 'internalCommonTangent'],
      tangentPolygonMixed: ['tangentSegments', 'circumscribedQuadrilateral', 'tangentQuadPerimeter'],
      coordinateMixed: [
        'diameterEndpointCircle',
        'axisLineCircleRelation',
        'coordinatePointPosition',
        'coordinateTangentRadius',
        'pointDistanceToCircle',
      ],
    };
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [6, 8, 10],
      [7, 24, 25],
      [8, 15, 17],
      [9, 12, 15],
    ];
    const pickTriple = () => triples[randInt(0, triples.length - 1)];
    const sourceKinds = kinds[kind] || [kind];
    for (let i = 0; i < count; i += 1) {
      const type = sourceKinds[i % sourceKinds.length];
      if (type === 'pointCirclePosition') {
        const r = randInt(4, 15);
        const mode = i % 3;
        const d = mode === 0 ? randInt(1, r - 1) : mode === 1 ? r : r + randInt(1, 8);
        const relation = d < r ? '圓內' : d === r ? '圓上' : '圓外';
        questions.push(
          `圓 \\(O\\) 半徑為 \\(${r}\\)。若點 \\(P\\) 到圓心距離 \\(OP=${d}\\)，判斷點 \\(P\\) 在圓的哪裡。`
        );
        answers.push(
          `簡答：點 \\(P\\) 在${relation}。過程：比較 \\(OP\\) 與半徑 \\(r\\)。本題 \\(OP=${d}\\)、\\(r=${r}\\)，${d < r ? '因為 \\(OP<r\\)' : d === r ? '因為 \\(OP=r\\)' : '因為 \\(OP>r\\)'}，所以點在${relation}。`
        );
      } else if (type === 'lineCirclePosition') {
        const r = randInt(4, 15);
        const mode = i % 3;
        const d = mode === 0 ? randInt(0, r - 1) : mode === 1 ? r : r + randInt(1, 8);
        const relation = d < r ? '割線' : d === r ? '切線' : '不相交';
        const intersections = d < r ? 2 : d === r ? 1 : 0;
        questions.push(
          `圓 \\(O\\) 半徑為 \\(${r}\\)，圓心到直線 \\(L\\) 的距離為 \\(${d}\\)。判斷直線 \\(L\\) 與圓的位置關係，並求交點個數。`
        );
        answers.push(
          `簡答：${relation}，${intersections} 個交點。過程：比較圓心到直線距離 \\(d\\) 與半徑 \\(r\\)。本題 \\(d=${d}\\)、\\(r=${r}\\)，${d < r ? '\\(d<r\\)，故為割線。' : d === r ? '\\(d=r\\)，故為切線。' : '\\(d>r\\)，故不相交。'}`
        );
      } else if (type === 'tangentLength') {
        const [tangent, r, op] = pickTriple();
        const scale = randInt(1, 4);
        const tangentLength = tangent * scale;
        const radius = r * scale;
        const distance = op * scale;
        questions.push(
          `圓 \\(O\\) 半徑為 \\(${radius}\\)，圓外一點 \\(P\\) 到圓心距離 \\(OP=${distance}\\)。從 \\(P\\) 作切線 \\(PA\\) 切圓於 \\(A\\)，求 \\(PA\\)。`
        );
        answers.push(
          `簡答：\\(PA=${tangentLength}\\)。過程：半徑垂直切線，\\(OA\\perp PA\\)，所以 \\(\\triangle OAP\\) 為直角三角形。\\(PA=\\sqrt{OP^2-OA^2}=\\sqrt{${distance}^2-${radius}^2}=${tangentLength}\\)。`
        );
      } else if (type === 'chordDistance') {
        const [half, d, r] = pickTriple();
        const scale = randInt(1, 4);
        const chord = 2 * half * scale;
        const distance = d * scale;
        const radius = r * scale;
        questions.push(`圓 \\(O\\) 半徑為 \\(${radius}\\)，弦 \\(AB=${chord}\\)。求圓心到弦 \\(AB\\) 的距離。`);
        answers.push(
          `簡答：\\(${distance}\\)。過程：圓心到弦的垂線會平分弦，所以半弦長為 \\(${chord / 2}\\)。由直角三角形得距離 \\(=\\sqrt{${radius}^2-${chord / 2}^2}=${distance}\\)。`
        );
      } else if (type === 'chordLength') {
        const [half, d, r] = pickTriple();
        const scale = randInt(1, 4);
        const distance = d * scale;
        const radius = r * scale;
        const chord = 2 * half * scale;
        questions.push(
          `圓 \\(O\\) 半徑為 \\(${radius}\\)，圓心到弦 \\(AB\\) 的距離為 \\(${distance}\\)。求弦長 \\(AB\\)。`
        );
        answers.push(
          `簡答：\\(AB=${chord}\\)。過程：半弦長 \\(=\\sqrt{${radius}^2-${distance}^2}=${chord / 2}\\)，所以弦長 \\(AB=2\\times${chord / 2}=${chord}\\)。`
        );
      } else if (type === 'radiusFromChord') {
        const [half, d, r] = pickTriple();
        const scale = randInt(1, 4);
        const chord = 2 * half * scale;
        const distance = d * scale;
        const radius = r * scale;
        questions.push(`一圓中，弦 \\(AB=${chord}\\)，圓心到弦 \\(AB\\) 的距離為 \\(${distance}\\)。求此圓半徑。`);
        answers.push(
          `簡答：\\(${radius}\\)。過程：半弦長為 \\(${chord / 2}\\)，半徑、弦心距與半弦長構成直角三角形，所以 \\(r=\\sqrt{${chord / 2}^2+${distance}^2}=${radius}\\)。`
        );
      } else if (type === 'concentricAnnulus') {
        const [half, d, r] = pickTriple();
        const scale = randInt(1, 3);
        const bigR = r * scale;
        const smallR = d * scale;
        const chord = 2 * half * scale;
        const areaCoeff = half * half * scale * scale;
        questions.push(
          `同心圓中，大圓有一弦 \\(AB=${chord}\\)，且 \\(AB\\) 恰好切小圓。若小圓半徑為 \\(${smallR}\\)，求兩圓間環形區域面積。`
        );
        answers.push(
          `簡答：\\(${areaCoeff}\\pi\\)。過程：大圓半徑 \\(R\\)、小圓半徑 \\(r\\)、半弦長構成直角三角形，故 \\(R^2-r^2=(${chord / 2})^2=${areaCoeff}\\)。環形面積 \\(=\\pi(R^2-r^2)=${areaCoeff}\\pi\\)。`
        );
      } else if (type === 'twoCirclePosition') {
        const r1 = randInt(4, 14);
        const r2 = randInt(2, r1 - 1);
        const modes = [
          { d: r1 + r2 + randInt(1, 5), relation: '外離' },
          { d: r1 + r2, relation: '外切' },
          { d: randInt(r1 - r2 + 1, r1 + r2 - 1), relation: '相交兩點' },
          { d: r1 - r2, relation: '內切' },
          { d: randInt(0, Math.max(0, r1 - r2 - 1)), relation: '內離' },
        ];
        const item = modes[i % modes.length];
        questions.push(`兩圓半徑分別為 \\(${r1}\\)、\\(${r2}\\)，連心線長 \\(d=${item.d}\\)。判斷兩圓位置關係。`);
        answers.push(
          `簡答：${item.relation}。過程：比較 \\(d\\)、\\(r_1+r_2=${r1 + r2}\\)、\\(|r_1-r_2|=${r1 - r2}\\)。本題 \\(d=${item.d}\\)，所以兩圓為${item.relation}。`
        );
      } else if (type === 'radiiFromTangencies') {
        const r1 = randInt(7, 18);
        const r2 = randInt(2, r1 - 2);
        const external = r1 + r2;
        const internal = r1 - r2;
        questions.push(`兩圓外切時連心線長為 \\(${external}\\)，內切時連心線長為 \\(${internal}\\)。求兩圓半徑。`);
        answers.push(
          `簡答：\\(${r1}\\) 與 \\(${r2}\\)。過程：外切時 \\(r_1+r_2=${external}\\)，內切時 \\(r_1-r_2=${internal}\\)。解聯立得 \\(r_1=${r1}\\)、\\(r_2=${r2}\\)。`
        );
      } else if (type === 'externalCommonTangent') {
        const [length, diff, d] = pickTriple();
        const small = randInt(2, 8);
        const big = small + diff;
        questions.push(`兩圓半徑分別為 \\(${big}\\)、\\(${small}\\)，連心線長為 \\(${d}\\)。求外公切線段長。`);
        answers.push(
          `簡答：\\(${length}\\)。過程：外公切線段長 \\(=\\sqrt{d^2-(r_1-r_2)^2}\\)。代入得 \\(\\sqrt{${d}^2-${diff}^2}=${length}\\)。`
        );
      } else if (type === 'internalCommonTangent') {
        const [length, sum, d] = pickTriple();
        let r1 = randInt(2, sum - 2);
        let r2 = sum - r1;
        if (r1 < r2) [r1, r2] = [r2, r1];
        questions.push(`兩圓半徑分別為 \\(${r1}\\)、\\(${r2}\\)，連心線長為 \\(${d}\\)。求內公切線段長。`);
        answers.push(
          `簡答：\\(${length}\\)。過程：內公切線段長 \\(=\\sqrt{d^2-(r_1+r_2)^2}\\)。代入得 \\(\\sqrt{${d}^2-${sum}^2}=${length}\\)。`
        );
      } else if (type === 'tangentSegments') {
        const tangent = randInt(4, 18);
        const other = randInt(3, 15);
        questions.push(
          `圓外一點 \\(P\\) 向圓作兩條切線 \\(PA\\)、\\(PB\\)，切點為 \\(A\\)、\\(B\\)。若 \\(PA=${tangent}\\)，求 \\(PB\\)。`
        );
        answers.push(`簡答：\\(PB=${tangent}\\)。過程：同一圓外一點所作兩切線段相等，所以 \\(PA=PB=${tangent}\\)。`);
      } else if (type === 'circumscribedQuadrilateral') {
        const a = randInt(5, 18);
        const c = randInt(5, 18);
        let d = randInt(5, 18);
        while (a + c - d <= 0) d = randInt(5, 18);
        const b = a + c - d;
        questions.push(
          `四邊形 \\(ABCD\\) 為圓外切四邊形。若 \\(AB=${a}\\)、\\(BC=${b}\\)、\\(CD=${c}\\)，求 \\(DA\\)。`
        );
        answers.push(
          `簡答：\\(DA=${d}\\)。過程：圓外切四邊形兩組對邊和相等，\\(AB+CD=BC+DA\\)。所以 \\(DA=${a}+${c}-${b}=${d}\\)。`
        );
      } else if (type === 'tangentQuadPerimeter') {
        const a = randInt(5, 20);
        const c = randInt(5, 20);
        const perimeter = 2 * (a + c);
        questions.push(`四邊形 \\(ABCD\\) 為圓外切四邊形。若 \\(AB=${a}\\)、\\(CD=${c}\\)，求此四邊形周長。`);
        answers.push(
          `簡答：\\(${perimeter}\\)。過程：圓外切四邊形滿足 \\(AB+CD=BC+DA\\)，所以周長 \\(=2(AB+CD)=2(${a}+${c})=${perimeter}\\)。`
        );
      } else if (type === 'diameterEndpointCircle') {
        const cx = randInt(-5, 5);
        const cy = randInt(-5, 5);
        const r = randInt(3, 10);
        const horizontal = i % 2 === 0;
        const ax = horizontal ? cx - r : cx;
        const ay = horizontal ? cy : cy - r;
        const bx = horizontal ? cx + r : cx;
        const by = horizontal ? cy : cy + r;
        questions.push(
          `已知 \\(A(${ax},${ay})\\)、\\(B(${bx},${by})\\) 為圓 \\(O\\) 的一條直徑兩端點。求圓心 \\(O\\) 坐標與半徑。`
        );
        answers.push(
          `簡答：\\(O(${cx},${cy})\\)，半徑 \\(${r}\\)。過程：圓心是直徑端點中點，半徑是直徑長的一半，所以 \\(O(${cx},${cy})\\)、\\(r=${r}\\)。`
        );
      } else if (type === 'axisLineCircleRelation') {
        const r = randInt(3, 10);
        const mode = i % 3;
        const k = mode === 0 ? randInt(0, r - 1) : mode === 1 ? r : r + randInt(1, 5);
        const relation = k < r ? '割線' : k === r ? '切線' : '不相交';
        questions.push(`圓 \\(O\\) 圓心為 \\((0,0)\\)，半徑為 \\(${r}\\)。判斷直線 \\(x=${k}\\) 與此圓的位置關係。`);
        answers.push(
          `簡答：${relation}。過程：圓心到直線 \\(x=${k}\\) 的距離為 \\(${Math.abs(k)}\\)。與半徑 \\(${r}\\) 比較，得此直線為${relation}。`
        );
      } else if (type === 'coordinatePointPosition') {
        const cx = randInt(-4, 4);
        const cy = randInt(-4, 4);
        const r = randInt(3, 10);
        const mode = i % 3;
        const dx = mode === 0 ? r - 1 : mode === 1 ? r : r + randInt(1, 4);
        const px = cx + dx;
        const py = cy;
        const relation = dx < r ? '圓內' : dx === r ? '圓上' : '圓外';
        const centerXText = cx < 0 ? `(${cx})` : `${cx}`;
        questions.push(`圓心為 \\(O(${cx},${cy})\\)，半徑為 \\(${r}\\)。判斷點 \\(P(${px},${py})\\) 在圓的哪裡。`);
        answers.push(
          `簡答：點 \\(P\\) 在${relation}。過程：\\(OP=|${px}-${centerXText}|=${dx}\\)。比較 \\(OP\\) 與半徑 \\(${r}\\)，可知點 \\(P\\) 在${relation}。`
        );
      } else if (type === 'coordinateTangentRadius') {
        const [tangent, r, op] = pickTriple();
        const scale = randInt(1, 3);
        const radius = r * scale;
        const distance = op * scale;
        const tangentLength = tangent * scale;
        questions.push(
          `圓心在原點的圓半徑為 \\(${radius}\\)。點 \\(P(${distance},0)\\) 在圓外，從 \\(P\\) 作切線 \\(PT\\)。求切線段 \\(PT\\) 長。`
        );
        answers.push(
          `簡答：\\(PT=${tangentLength}\\)。過程：\\(OT\\perp PT\\)，所以 \\(PT=\\sqrt{OP^2-r^2}=\\sqrt{${distance}^2-${radius}^2}=${tangentLength}\\)。`
        );
      } else if (type === 'pointDistanceToCircle') {
        const r = randInt(3, 10);
        const d = r + randInt(2, 12);
        const shortest = d - r;
        const longest = d + r;
        questions.push(
          `點 \\(A\\) 在圓 \\(O\\) 外，且 \\(OA=${d}\\)，圓半徑為 \\(${r}\\)。求點 \\(A\\) 到圓周的最短距離與最長距離。`
        );
        answers.push(
          `簡答：最短 \\(${shortest}\\)，最長 \\(${longest}\\)。過程：點到圓周最近在連心線靠近點的一側，最遠在另一側，所以最短距離 \\(=OA-r=${d}-${r}=${shortest}\\)，最長距離 \\(=OA+r=${d}+${r}=${longest}\\)。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ522Set(kind, count) {
    const questions = [];
    const answers = [];
    const kinds = {
      centralMixed: ['centralArcDegree', 'arcLengthFromAngle', 'angleFromArcLength', 'sectorArea'],
      inscribedMixed: [
        'inscribedAngleFromArc',
        'arcFromInscribedAngle',
        'diameterInscribedAngle',
        'tangentChordAngle',
        'parallelChordAngle',
      ],
      cyclicMixed: ['cyclicOppositeAngle', 'cyclicRatioAngles', 'cyclicExteriorAngle', 'cyclicLinearEquation'],
      interiorExteriorMixed: [
        'interiorAngleTwoChords',
        'arcFromInteriorAngle',
        'exteriorAngleTwoSecants',
        'twoTangentsAngle',
        'parameterExteriorAngle',
      ],
      arcDistributionMixed: [
        'arcRatioAngle',
        'equalDivisionAngle',
        'regularPolygonTangentAngle',
        'majorMinorInscribedAngle',
        'centralArcEquation',
      ],
    };
    const selected = kinds[kind] || [kind];
    const angleChoices = [30, 36, 40, 45, 50, 60, 72, 80, 90, 100, 108, 120, 135, 144, 150];
    const piText = (numerator, denominator = 1) => {
      const reduced = reduceFraction(numerator, denominator);
      if (reduced.denominator === 1) {
        if (reduced.numerator === 1) return '\\pi';
        return `${reduced.numerator}\\pi`;
      }
      return `\\frac{${reduced.numerator}\\pi}{${reduced.denominator}}`;
    };
    const degree = (value) => `${value}^\\circ`;
    const arc = (name) => `\\overset{\\frown}{${name}}`;
    const ratioParts = [
      [2, 3, 4],
      [3, 4, 5],
      [1, 2, 3],
      [2, 5, 3],
      [3, 5, 7],
    ];
    for (let i = 0; i < count; i += 1) {
      const type = selected[i % selected.length];
      if (type === 'centralArcDegree') {
        const theta = angleChoices[randInt(0, angleChoices.length - 1)];
        const askMajor = i % 3 === 0;
        const arcMeasure = askMajor ? 360 - theta : theta;
        const arcName = askMajor ? '優弧 AB' : '劣弧 AB';
        questions.push(`圓 \\(O\\) 中，若圓心角 \\(\\angle AOB=${degree(theta)}\\)，求${arcName}的度數。`);
        answers.push(
          `簡答：\\(${degree(arcMeasure)}\\)。過程：同一圓中，劣弧度數等於所對圓心角度數，所以劣弧為 \\(${degree(theta)}\\)；${askMajor ? `優弧為 \\(360^\\circ-${degree(theta)}=${degree(arcMeasure)}\\)` : `本題所求劣弧為 \\(${degree(theta)}\\)`}。`
        );
      } else if (type === 'arcLengthFromAngle') {
        const radius = randInt(3, 12);
        const theta = angleChoices[randInt(0, angleChoices.length - 1)];
        const numerator = 2 * radius * theta;
        const lengthText = piText(numerator, 360);
        questions.push(`圓半徑為 \\(${radius}\\)，圓心角為 \\(${degree(theta)}\\)。求此圓心角所對弧長。`);
        answers.push(
          `簡答：\\(${lengthText}\\)。過程：弧長 \\(=2\\pi r\\times\\frac{\\theta}{360^\\circ}=2\\pi\\times${radius}\\times\\frac{${theta}}{360}=${lengthText}\\)。`
        );
      } else if (type === 'angleFromArcLength') {
        const radius = randInt(4, 12);
        const theta = [30, 45, 60, 90, 120, 150, 180][randInt(0, 6)];
        const lengthText = piText(2 * radius * theta, 360);
        questions.push(`圓半徑為 \\(${radius}\\)，某弧長為 \\(${lengthText}\\)。求此弧所對圓心角度數。`);
        answers.push(
          `簡答：\\(${degree(theta)}\\)。過程：由 \\(弧長=2\\pi r\\times\\frac{\\theta}{360^\\circ}\\)，得 \\(${lengthText}=2\\pi\\times${radius}\\times\\frac{\\theta}{360}\\)，所以 \\(\\theta=${degree(theta)}\\)。`
        );
      } else if (type === 'sectorArea') {
        const radius = randInt(4, 12);
        const theta = [30, 45, 60, 90, 120, 150][randInt(0, 5)];
        const areaText = piText(radius * radius * theta, 360);
        questions.push(`半徑為 \\(${radius}\\) 的圓中，圓心角為 \\(${degree(theta)}\\)。求此扇形面積。`);
        answers.push(
          `簡答：\\(${areaText}\\)。過程：扇形面積 \\(=\\pi r^2\\times\\frac{\\theta}{360^\\circ}=\\pi\\times${radius}^2\\times\\frac{${theta}}{360}=${areaText}\\)。`
        );
      } else if (type === 'inscribedAngleFromArc') {
        const arcMeasure = angleChoices[randInt(0, angleChoices.length - 1)];
        const angle = arcMeasure / 2;
        questions.push(
          `圓上有三點 \\(A,B,C\\)，若弧 \\(${arc('AB')}\\) 的度數為 \\(${degree(arcMeasure)}\\)，求圓周角 \\(\\angle ACB\\) 的度數。`
        );
        answers.push(
          `簡答：\\(${degree(angle)}\\)。過程：圓周角度數等於所對弧度數的一半，所以 \\(\\angle ACB=\\frac{1}{2}\\times${degree(arcMeasure)}=${degree(angle)}\\)。`
        );
      } else if (type === 'arcFromInscribedAngle') {
        const angle = randInt(18, 75);
        const arcMeasure = angle * 2;
        questions.push(
          `圓周角 \\(\\angle ABC=${degree(angle)}\\)，且它所對的弧為 \\(${arc('AC')}\\)。求弧 \\(${arc('AC')}\\) 的度數。`
        );
        answers.push(
          `簡答：\\(${degree(arcMeasure)}\\)。過程：所對弧度數是圓周角的 \\(2\\) 倍，所以弧 \\(${arc('AC')}=2\\times${degree(angle)}=${degree(arcMeasure)}\\)。`
        );
      } else if (type === 'diameterInscribedAngle') {
        const known = randInt(20, 70);
        const other = 90 - known;
        questions.push(
          `\\(AB\\) 為圓 \\(O\\) 的直徑，點 \\(C\\) 在圓上。若 \\(\\angle CAB=${degree(known)}\\)，求 \\(\\angle ABC\\) 的度數。`
        );
        answers.push(
          `簡答：\\(${degree(other)}\\)。過程：直徑所對圓周角為直角，所以 \\(\\angle ACB=90^\\circ\\)。因此 \\(\\angle ABC=90^\\circ-${degree(known)}=${degree(other)}\\)。`
        );
      } else if (type === 'tangentChordAngle') {
        const arcMeasure = angleChoices[randInt(0, angleChoices.length - 1)];
        const angle = arcMeasure / 2;
        questions.push(
          `直線 \\(PA\\) 切圓 \\(O\\) 於 \\(A\\)，弦 \\(AB\\) 所對劣弧 \\(${arc('AB')}\\) 為 \\(${degree(arcMeasure)}\\)。求弦切角 \\(\\angle PAB\\)。`
        );
        answers.push(
          `簡答：\\(${degree(angle)}\\)。過程：弦切角等於同弧所對的圓周角，所以 \\(\\angle PAB=\\frac{1}{2}\\times${degree(arcMeasure)}=${degree(angle)}\\)。`
        );
      } else if (type === 'parallelChordAngle') {
        const sideArc = [40, 50, 60, 70, 80, 100][randInt(0, 5)];
        const angle = sideArc / 2;
        questions.push(
          `圓內兩弦 \\(AB\\parallel CD\\)。若弧 \\(${arc('AC')}\\) 的度數為 \\(${degree(sideArc)}\\)，求弧 \\(${arc('BD')}\\) 所對的圓周角度數。`
        );
        answers.push(
          `簡答：\\(${degree(angle)}\\)。過程：平行弦夾出的兩側弧相等，所以弧 \\(${arc('BD')}=${degree(sideArc)}\\)。圓周角為所對弧的一半，得 \\(${degree(angle)}\\)。`
        );
      } else if (type === 'cyclicOppositeAngle') {
        const angleA = randInt(55, 125);
        const angleC = 180 - angleA;
        questions.push(
          `四邊形 \\(ABCD\\) 內接於一圓。若 \\(\\angle A=${degree(angleA)}\\)，求 \\(\\angle C\\) 的度數。`
        );
        answers.push(
          `簡答：\\(${degree(angleC)}\\)。過程：圓內接四邊形對角互補，所以 \\(\\angle C=180^\\circ-${degree(angleA)}=${degree(angleC)}\\)。`
        );
      } else if (type === 'cyclicRatioAngles') {
        const pairs = [
          [1, 2],
          [2, 3],
          [3, 2],
          [4, 5],
          [5, 4],
        ];
        const [p, q] = pairs[randInt(0, pairs.length - 1)];
        const angleB = (180 * p) / (p + q);
        const angleD = 180 - angleB;
        questions.push(
          `圓內接四邊形 \\(ABCD\\) 中，\\(\\angle B:\\angle D=${p}:${q}\\)。求 \\(\\angle B\\) 與 \\(\\angle D\\)。`
        );
        answers.push(
          `簡答：\\(\\angle B=${degree(angleB)}\\)，\\(\\angle D=${degree(angleD)}\\)。過程：對角互補，設 \\(\\angle B=${p}k\\)、\\(\\angle D=${q}k\\)，則 \\((${p}+${q})k=180\\)，可得兩角。`
        );
      } else if (type === 'cyclicExteriorAngle') {
        const exterior = randInt(55, 125);
        questions.push(
          `四邊形 \\(ABCD\\) 內接於一圓。若 \\(\\angle A\\) 的一個外角為 \\(${degree(exterior)}\\)，求 \\(\\angle C\\) 的度數。`
        );
        answers.push(
          `簡答：\\(${degree(exterior)}\\)。過程：圓內接四邊形的一個外角等於其對內角，所以 \\(\\angle C=${degree(exterior)}\\)。`
        );
      } else if (type === 'cyclicLinearEquation') {
        const x = randInt(8, 24);
        const a = randInt(2, 4);
        const c = randInt(2, 4);
        let b = randInt(5, 30);
        let d = 180 - (a + c) * x - b;
        while (d < 5) {
          b = randInt(5, 20);
          d = 180 - (a + c) * x - b;
        }
        const angleA = a * x + b;
        const angleC = c * x + d;
        questions.push(
          `圓內接四邊形 \\(ABCD\\) 中，\\(\\angle A=(${a}x+${b})^\\circ\\)、\\(\\angle C=(${c}x+${d})^\\circ\\)。求 \\(x\\) 的值。`
        );
        answers.push(`簡答：\\(x=${x}\\)。過程：對角互補，\\((${a}x+${b})+(${c}x+${d})=180\\)，解得 \\(x=${x}\\)。`);
      } else if (type === 'interiorAngleTwoChords') {
        const arcOne = [40, 50, 60, 70, 80, 90][randInt(0, 5)];
        const arcTwo = [80, 90, 100, 110, 120, 130][randInt(0, 5)];
        const angle = (arcOne + arcTwo) / 2;
        questions.push(
          `兩弦 \\(AB\\)、\\(CD\\) 交於圓內點 \\(P\\)。若其對頂角所夾兩弧度數分別為 \\(${degree(arcOne)}\\)、\\(${degree(arcTwo)}\\)，求 \\(\\angle APC\\)。`
        );
        answers.push(
          `簡答：\\(${degree(angle)}\\)。過程：圓內角度數等於所夾兩弧度數和的一半，所以 \\(\\angle APC=\\frac{${arcOne}+${arcTwo}}{2}=${degree(angle)}\\)。`
        );
      } else if (type === 'arcFromInteriorAngle') {
        const arcOne = [40, 50, 60, 70, 80][randInt(0, 4)];
        const arcTwo = [80, 90, 100, 110, 120][randInt(0, 4)];
        const angle = (arcOne + arcTwo) / 2;
        questions.push(
          `兩弦交於圓內，形成的圓內角為 \\(${degree(angle)}\\)。若其中一段所夾弧為 \\(${degree(arcOne)}\\)，求另一段所夾弧度數。`
        );
        answers.push(
          `簡答：\\(${degree(arcTwo)}\\)。過程：圓內角 \\(=\\frac{兩弧和}{2}\\)，所以另一弧 \\(=2\\times${degree(angle)}-${degree(arcOne)}=${degree(arcTwo)}\\)。`
        );
      } else if (type === 'exteriorAngleTwoSecants') {
        const smallArc = [30, 40, 50, 60, 70][randInt(0, 4)];
        const angle = randInt(20, 55);
        const largeArc = smallArc + 2 * angle;
        questions.push(
          `圓外一點 \\(P\\) 作兩割線，所截大弧為 \\(${degree(largeArc)}\\)、小弧為 \\(${degree(smallArc)}\\)。求圓外角 \\(\\angle P\\)。`
        );
        answers.push(
          `簡答：\\(${degree(angle)}\\)。過程：圓外角 \\(=\\frac{大弧-小弧}{2}=\\frac{${largeArc}-${smallArc}}{2}=${degree(angle)}\\)。`
        );
      } else if (type === 'twoTangentsAngle') {
        const minorArc = [60, 70, 80, 90, 100, 120][randInt(0, 5)];
        const angle = 180 - minorArc;
        questions.push(
          `圓外一點 \\(P\\) 作兩切線 \\(PA\\)、\\(PB\\)，若劣弧 \\(${arc('AB')}=${degree(minorArc)}\\)，求 \\(\\angle APB\\)。`
        );
        answers.push(
          `簡答：\\(${degree(angle)}\\)。過程：兩切線夾角等於 \\(180^\\circ\\) 減去所夾劣弧，所以 \\(\\angle APB=180^\\circ-${degree(minorArc)}=${degree(angle)}\\)。`
        );
      } else if (type === 'parameterExteriorAngle') {
        const x = randInt(8, 20);
        const smallArc = randInt(30, 80);
        const angle = randInt(20, 50);
        const largeArc = smallArc + 2 * angle;
        const b = largeArc - 2 * x;
        questions.push(
          `圓外兩割線形成角 \\(\\angle P=${degree(angle)}\\)。若大弧為 \\((2x+${b})^\\circ\\)，小弧為 \\(${degree(smallArc)}\\)，求 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：圓外角 \\(=\\frac{大弧-小弧}{2}\\)，所以 \\(${angle}=\\frac{(2x+${b})-${smallArc}}{2}\\)，解得 \\(x=${x}\\)。`
        );
      } else if (type === 'arcRatioAngle') {
        const [p, q, r] = ratioParts[randInt(0, ratioParts.length - 1)];
        const sum = p + q + r;
        const unit = 360 / sum;
        const arcAB = p * unit;
        const angle = arcAB / 2;
        questions.push(
          `圓周上 \\(A,B,C\\) 三點把圓分成三段弧，若 \\(${arc('AB')}:${arc('BC')}:${arc('CA')}=${p}:${q}:${r}\\)，求圓周角 \\(\\angle ACB\\)。`
        );
        answers.push(
          `簡答：\\(${degree(angle)}\\)。過程：一份弧為 \\(360^\\circ\\div${sum}=${degree(unit)}\\)，所以弧 \\(${arc('AB')}=${degree(arcAB)}\\)，圓周角 \\(\\angle ACB=${degree(angle)}\\)。`
        );
      } else if (type === 'equalDivisionAngle') {
        const n = [8, 9, 10, 12, 15][randInt(0, 4)];
        const steps = randInt(2, Math.floor(n / 2));
        const arcMeasure = (360 / n) * steps;
        const angle = arcMeasure / 2;
        questions.push(
          `圓周被分成 \\(${n}\\) 等分。若連接相隔 \\(${steps}\\) 格的兩點形成一條弦，求此弦所對的圓周角度數。`
        );
        answers.push(
          `簡答：\\(${degree(angle)}\\)。過程：每格弧為 \\(360^\\circ\\div${n}=${degree(360 / n)}\\)，相隔 \\(${steps}\\) 格的弧為 \\(${degree(arcMeasure)}\\)，圓周角為 \\(${degree(angle)}\\)。`
        );
      } else if (type === 'regularPolygonTangentAngle') {
        const n = [5, 6, 8, 9, 10, 12][randInt(0, 5)];
        const arcMeasure = 360 / n;
        const angle = arcMeasure / 2;
        questions.push(`正 \\(${n}\\) 邊形內接於圓，過頂點 \\(A\\) 作圓的切線。求此切線與邊 \\(AB\\) 所成的銳角。`);
        answers.push(
          `簡答：\\(${degree(angle)}\\)。過程：相鄰頂點所對弧為 \\(360^\\circ\\div${n}=${degree(arcMeasure)}\\)。弦切角等於同弧圓周角，所以角度為 \\(${degree(angle)}\\)。`
        );
      } else if (type === 'majorMinorInscribedAngle') {
        const majorArc = [220, 240, 250, 260, 280, 300][randInt(0, 5)];
        const minorArc = 360 - majorArc;
        const angle = minorArc / 2;
        questions.push(
          `已知優弧 \\(${arc('AB')}\\) 的度數為 \\(${degree(majorArc)}\\)。求劣弧 \\(${arc('AB')}\\) 所對圓周角的度數。`
        );
        answers.push(
          `簡答：\\(${degree(angle)}\\)。過程：劣弧度數為 \\(360^\\circ-${degree(majorArc)}=${degree(minorArc)}\\)，所對圓周角為 \\(\\frac{1}{2}\\times${degree(minorArc)}=${degree(angle)}\\)。`
        );
      } else if (type === 'centralArcEquation') {
        const x = 2 * randInt(5, 15);
        const central = 3 * x + 20;
        const inscribed = central / 2;
        questions.push(
          `同一弧所對圓心角為 \\((3x+20)^\\circ\\)，圓周角為 \\(${degree(inscribed)}\\)。求 \\(x\\) 與該弧度數。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)，弧度數為 \\(${degree(central)}\\)。過程：圓心角是同弧圓周角的 \\(2\\) 倍，所以 \\(3x+20=2\\times${inscribed}\\)，解得 \\(x=${x}\\)，弧度數為 \\(${degree(central)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ523Set(kind, count) {
    const questions = [];
    const answers = [];
    const kinds = {
      powerBasicMixed: [
        'intersectingChordsSegment',
        'externalSecantsSegment',
        'tangentSecantTangent',
        'tangentSecantSecantSegment',
      ],
      algebraMixed: [
        'algebraIntersectingChords',
        'algebraTangentSecant',
        'algebraExternalSecants',
        'ratioIntersectingChords',
        'ratioTangentSecant',
      ],
      radiusPowerMixed: [
        'insidePowerProduct',
        'tangentFromDistance',
        'radiusFromTangentDistance',
        'shortestChordThroughPoint',
        'diameterSecantProduct',
      ],
      chordDistanceMixed: [
        'chordDistancePowerTransfer',
        'midpointChordProduct',
        'parallelChordProduct',
        'perpendicularChordLength',
      ],
      ratioCompositeMixed: [
        'ratioInternalChordTotal',
        'ratioExternalSecantLength',
        'twoSecantsSamePointRatio',
        'twoTangentEqualPower',
        'commonTangentPower',
      ],
    };
    const selected = kinds[kind] || [kind];
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [6, 8, 10],
      [7, 24, 25],
      [8, 15, 17],
      [9, 12, 15],
    ];
    const pickTriple = () => triples[randInt(0, triples.length - 1)];
    const segmentPairs = [
      [4, 9, 6],
      [3, 12, 6],
      [5, 8, 4],
      [6, 10, 12],
      [8, 18, 12],
    ];
    for (let i = 0; i < count; i += 1) {
      const type = selected[i % selected.length];
      if (type === 'intersectingChordsSegment') {
        const [pa, pb, pc] = segmentPairs[randInt(0, segmentPairs.length - 1)];
        const pd = (pa * pb) / pc;
        questions.push(
          `圓內兩弦 \\(AB\\)、\\(CD\\) 相交於 \\(P\\)。若 \\(PA=${pa}\\)、\\(PB=${pb}\\)、\\(PC=${pc}\\)，求 \\(PD\\) 的長度。`
        );
        answers.push(
          `簡答：\\(PD=${pd}\\)。過程：圓內兩弦相交，\\(PA\\times PB=PC\\times PD\\)，所以 \\(${pa}\\times${pb}=${pc}\\times PD\\)，得 \\(PD=${pd}\\)。`
        );
      } else if (type === 'externalSecantsSegment') {
        const outsideA = randInt(2, 8);
        const chordA = randInt(4, 12);
        const outsideC = randInt(2, 8);
        const totalA = outsideA + chordA;
        const product = outsideA * totalA;
        const totalC = product / outsideC;
        if (!Number.isInteger(totalC) || totalC <= outsideC) {
          i -= 1;
          continue;
        }
        const chordC = totalC - outsideC;
        questions.push(
          `圓外一點 \\(P\\) 作兩割線 \\(PAB\\)、\\(PCD\\)。若 \\(PA=${outsideA}\\)、\\(AB=${chordA}\\)、\\(PC=${outsideC}\\)，求 \\(CD\\) 的長度。`
        );
        answers.push(
          `簡答：\\(CD=${chordC}\\)。過程：割線乘冪為 \\(PA\\times PB=PC\\times PD\\)。其中 \\(PB=${outsideA}+${chordA}=${totalA}\\)，所以 \\(${outsideA}\\times${totalA}=${outsideC}\\times PD\\)，得 \\(PD=${totalC}\\)，故 \\(CD=${totalC}-${outsideC}=${chordC}\\)。`
        );
      } else if (type === 'tangentSecantTangent') {
        const [tangent, pa, pb] = pickTriple();
        const scale = randInt(1, 3);
        const pt = tangent * scale;
        const first = pa * scale;
        const total = pb * scale;
        questions.push(
          `自圓外一點 \\(P\\) 作切線 \\(PT\\)，割線 \\(PAB\\) 通過圓。若 \\(PA=${first}\\)、\\(PB=${total}\\)，求切線段 \\(PT\\) 的長度。`
        );
        answers.push(
          `簡答：\\(PT=${pt}\\)。過程：切割線定理 \\(PT^2=PA\\times PB\\)，所以 \\(PT=\\sqrt{${first}\\times${total}}=${pt}\\)。`
        );
      } else if (type === 'tangentSecantSecantSegment') {
        const [tangent, pa, pb] = pickTriple();
        const scale = randInt(1, 3);
        const pt = tangent * scale;
        const first = pa * scale;
        const total = pb * scale;
        const chord = total - first;
        questions.push(
          `自圓外一點 \\(P\\) 作切線 \\(PT\\)，割線 \\(PAB\\) 通過圓。若 \\(PT=${pt}\\)、\\(PA=${first}\\)，求 \\(AB\\) 的長度。`
        );
        answers.push(
          `簡答：\\(AB=${chord}\\)。過程：\\(PT^2=PA\\times PB\\)，所以 \\(${pt}^2=${first}\\times PB\\)，得 \\(PB=${total}\\)。因此 \\(AB=PB-PA=${total}-${first}=${chord}\\)。`
        );
      } else if (type === 'algebraIntersectingChords') {
        const x = randInt(3, 9);
        const offset = randInt(1, 5);
        const product = x * (x + offset);
        const factor = [2, 3, 4, 5, 6][randInt(0, 4)];
        if (product % factor !== 0) {
          i -= 1;
          continue;
        }
        const other = product / factor;
        questions.push(
          `圓內兩弦相交於 \\(P\\)。若 \\(PA=x\\)、\\(PB=x+${offset}\\)、\\(PC=${factor}\\)、\\(PD=${other}\\)，求 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：由 \\(PA\\times PB=PC\\times PD\\)，得 \\(x(x+${offset})=${factor}\\times${other}=${product}\\)，解得正值 \\(x=${x}\\)。`
        );
      } else if (type === 'algebraTangentSecant') {
        const choices = [
          [4, 5, 6],
          [9, 7, 12],
          [5, 4, 5],
          [16, 9, 20],
        ];
        const [x, offset, pt] = choices[randInt(0, choices.length - 1)];
        questions.push(
          `自圓外一點 \\(P\\) 作切線 \\(PT\\) 與割線 \\(PAB\\)。若 \\(PT=${pt}\\)、\\(PA=x\\)、\\(PB=x+${offset}\\)，求 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：切割線定理 \\(PT^2=PA\\times PB\\)，所以 \\(${pt}^2=x(x+${offset})\\)，解得正值 \\(x=${x}\\)。`
        );
      } else if (type === 'algebraExternalSecants') {
        const choices = [
          [4, 2, 3, 8],
          [6, 3, 2, 27],
          [5, 7, 4, 15],
          [8, 4, 6, 16],
        ];
        const [x, offset, pc, pd] = choices[randInt(0, choices.length - 1)];
        questions.push(
          `圓外一點 \\(P\\) 作兩割線 \\(PAB\\)、\\(PCD\\)。若 \\(PA=x\\)、\\(PB=x+${offset}\\)、\\(PC=${pc}\\)、\\(PD=${pd}\\)，求 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：兩割線定理 \\(PA\\times PB=PC\\times PD\\)，所以 \\(x(x+${offset})=${pc}\\times${pd}\\)，解得正值 \\(x=${x}\\)。`
        );
      } else if (type === 'ratioIntersectingChords') {
        const m = randInt(1, 3);
        const n = randInt(3, 6);
        const k = randInt(2, 5);
        const pc = randInt(2, 6);
        const pd = (m * n * k * k) / pc;
        if (!Number.isInteger(pd)) {
          i -= 1;
          continue;
        }
        const total = (m + n) * k;
        questions.push(
          `圓內兩弦 \\(AB\\)、\\(CD\\) 相交於 \\(P\\)。若 \\(P\\) 將 \\(AB\\) 分成 \\(m:n=${m}:${n}\\)，且 \\(PC=${pc}\\)、\\(PD=${pd}\\)，求 \\(AB\\) 全長。`
        );
        answers.push(
          `簡答：\\(AB=${total}\\)。過程：設 \\(PA=${m}k\\)、\\(PB=${n}k\\)。由 \\(PA\\times PB=PC\\times PD\\)，得 \\(${m * n}k^2=${pc}\\times${pd}\\)，所以 \\(k=${k}\\)，\\(AB=(${m}+${n})k=${total}\\)。`
        );
      } else if (type === 'ratioTangentSecant') {
        const m = randInt(1, 3);
        const n = randInt(3, 8);
        const k = randInt(2, 5);
        const pa = m * k;
        const ab = n * k;
        const pb = pa + ab;
        const ptSquared = pa * pb;
        questions.push(
          `自圓外一點 \\(P\\) 作切線 \\(PT\\) 與割線 \\(PAB\\)。若 \\(PA:AB=${m}:${n}\\)，且 \\(PA=${pa}\\)，求 \\(PT^2\\)。`
        );
        answers.push(
          `簡答：\\(PT^2=${ptSquared}\\)。過程：由 \\(PA:AB=${m}:${n}\\)，得 \\(AB=${ab}\\)，所以 \\(PB=${pa}+${ab}=${pb}\\)。切割線定理給 \\(PT^2=PA\\times PB=${pa}\\times${pb}=${ptSquared}\\)。`
        );
      } else if (type === 'insidePowerProduct') {
        const [d, halfChord, radius] = pickTriple();
        const scale = randInt(1, 3);
        const op = d * scale;
        const r = radius * scale;
        const product = r * r - op * op;
        questions.push(
          `圓 \\(O\\) 半徑為 \\(${r}\\)，點 \\(P\\) 在圓內且 \\(OP=${op}\\)。求過 \\(P\\) 的任意弦被 \\(P\\) 截成兩段後，兩段長度的乘積。`
        );
        answers.push(
          `簡答：乘積為 \\(${product}\\)。過程：圓內點的圓冪值為 \\(r^2-OP^2\\)，所以乘積 \\(=${r}^2-${op}^2=${product}\\)。`
        );
      } else if (type === 'tangentFromDistance') {
        const [pt, r, op] = pickTriple();
        const scale = randInt(1, 3);
        const tangent = pt * scale;
        const radius = r * scale;
        const distance = op * scale;
        questions.push(
          `圓 \\(O\\) 半徑為 \\(${radius}\\)，圓外點 \\(P\\) 滿足 \\(OP=${distance}\\)。自 \\(P\\) 作切線 \\(PT\\)，求 \\(PT\\) 長。`
        );
        answers.push(
          `簡答：\\(PT=${tangent}\\)。過程：\\(OT\\perp PT\\)，所以 \\(PT=\\sqrt{OP^2-r^2}=\\sqrt{${distance}^2-${radius}^2}=${tangent}\\)。`
        );
      } else if (type === 'radiusFromTangentDistance') {
        const [pt, r, op] = pickTriple();
        const scale = randInt(1, 3);
        const tangent = pt * scale;
        const radius = r * scale;
        const distance = op * scale;
        questions.push(`圓外點 \\(P\\) 到圓心距離 \\(OP=${distance}\\)，切線段 \\(PT=${tangent}\\)。求圓的半徑。`);
        answers.push(
          `簡答：半徑 \\(${radius}\\)。過程：\\(OP^2=PT^2+r^2\\)，所以 \\(r=\\sqrt{${distance}^2-${tangent}^2}=${radius}\\)。`
        );
      } else if (type === 'shortestChordThroughPoint') {
        const [opBase, halfChordBase, rBase] = pickTriple();
        const scale = randInt(1, 3);
        const op = opBase * scale;
        const halfChord = halfChordBase * scale;
        const radius = rBase * scale;
        const chord = 2 * halfChord;
        questions.push(
          `圓 \\(O\\) 半徑為 \\(${radius}\\)，點 \\(P\\) 在圓內且 \\(OP=${op}\\)。求過 \\(P\\) 的所有弦中，長度最短的弦長。`
        );
        answers.push(
          `簡答：\\(${chord}\\)。過程：最短弦會垂直 \\(OP\\)。半弦長 \\(=\\sqrt{${radius}^2-${op}^2}=${halfChord}\\)，所以全弦長 \\(=${chord}\\)。`
        );
      } else if (type === 'diameterSecantProduct') {
        const r = randInt(5, 15);
        const op = randInt(1, r - 1);
        const product = r * r - op * op;
        questions.push(
          `圓 \\(O\\) 半徑為 \\(${r}\\)，點 \\(P\\) 在圓內且 \\(OP=${op}\\)。若過 \\(P\\) 作通過圓心的割線，求該割線被圓截出的兩段長度乘積。`
        );
        answers.push(
          `簡答：\\(${product}\\)。過程：通過圓心時兩段為 \\(r-OP\\) 與 \\(r+OP\\)，乘積 \\(=(${r}-${op})(${r}+${op})=${r}^2-${op}^2=${product}\\)。`
        );
      } else if (type === 'chordDistancePowerTransfer') {
        const [distance, halfChord, radius] = pickTriple();
        const scale = randInt(1, 3);
        const d = distance * scale;
        const half = halfChord * scale;
        const r = radius * scale;
        const product = r * r - d * d;
        const cm = randInt(2, 8);
        if (product % cm !== 0) {
          i -= 1;
          continue;
        }
        const md = product / cm;
        questions.push(
          `圓 \\(O\\) 半徑為 \\(${r}\\)，弦 \\(AB\\) 的弦心距為 \\(${d}\\)，且 \\(M\\) 為 \\(AB\\) 的中點。另一弦 \\(CD\\) 過 \\(M\\)，若 \\(CM=${cm}\\)，求 \\(MD\\)。`
        );
        answers.push(
          `簡答：\\(MD=${md}\\)。過程：弦 \\(AB\\) 的半弦長為 \\(\\sqrt{${r}^2-${d}^2}=${half}\\)，所以 \\(AM\\times MB=${half}^2=${product}\\)。由圓內乘冪，\\(CM\\times MD=${product}\\)，得 \\(MD=${md}\\)。`
        );
      } else if (type === 'midpointChordProduct') {
        const k = randInt(3, 10);
        const cm = randInt(2, 8);
        const md = (k * k) / cm;
        if (!Number.isInteger(md)) {
          i -= 1;
          continue;
        }
        const ab = 2 * k;
        questions.push(
          `圓內兩弦 \\(AB\\)、\\(CD\\) 交於 \\(M\\)。若 \\(M\\) 為 \\(AB\\) 的中點，且 \\(CM=${cm}\\)、\\(MD=${md}\\)，求 \\(AB\\) 的長度。`
        );
        answers.push(
          `簡答：\\(AB=${ab}\\)。過程：設 \\(AM=MB=k\\)。由 \\(AM\\times MB=CM\\times MD\\)，得 \\(k^2=${cm}\\times${md}=${k * k}\\)，所以 \\(k=${k}\\)，\\(AB=2k=${ab}\\)。`
        );
      } else if (type === 'parallelChordProduct') {
        const outsideA = randInt(2, 7);
        const chordA = randInt(4, 12);
        const outsideC = randInt(2, 7);
        const totalA = outsideA + chordA;
        const product = outsideA * totalA;
        if (product % outsideC !== 0 || product / outsideC <= outsideC) {
          i -= 1;
          continue;
        }
        const totalC = product / outsideC;
        const chordC = totalC - outsideC;
        questions.push(
          `兩平行弦 \\(AB\\)、\\(CD\\) 延長後交於圓外點 \\(P\\)。若 \\(PA=${outsideA}\\)、\\(AB=${chordA}\\)、\\(PC=${outsideC}\\)，求 \\(CD\\) 的長度。`
        );
        answers.push(
          `簡答：\\(CD=${chordC}\\)。過程：雖然題目提到平行弦，但從同一外點引兩割線仍滿足 \\(PA\\times PB=PC\\times PD\\)。\\(PB=${totalA}\\)，所以 \\(${outsideA}\\times${totalA}=${outsideC}\\times PD\\)，得 \\(PD=${totalC}\\)，故 \\(CD=${chordC}\\)。`
        );
      } else if (type === 'perpendicularChordLength') {
        const [distance, halfChord, radius] = pickTriple();
        const scale = randInt(1, 3);
        const om = distance * scale;
        const mr = radius * scale;
        const half = halfChord * scale;
        const chord = 2 * half;
        questions.push(
          `圓 \\(O\\) 中，弦 \\(AB\\) 垂直半徑 \\(OR\\) 於 \\(M\\)。若 \\(OM=${om}\\)、\\(OR=${mr}\\)，求弦 \\(AB\\) 的長度。`
        );
        answers.push(
          `簡答：\\(AB=${chord}\\)。過程：垂徑定理得 \\(M\\) 為弦中點，半弦長 \\(AM=\\sqrt{OR^2-OM^2}=\\sqrt{${mr}^2-${om}^2}=${half}\\)，所以 \\(AB=${chord}\\)。`
        );
      } else if (type === 'ratioInternalChordTotal') {
        const m = randInt(1, 3);
        const n = randInt(4, 7);
        const k = randInt(2, 5);
        const total = (m + n) * k;
        const product = m * n * k * k;
        questions.push(
          `圓內兩弦相交於 \\(P\\)。若 \\(P\\) 將 \\(AB\\) 分成 \\(${m}:${n}\\)，且另一弦被 \\(P\\) 截成兩段的乘積為 \\(${product}\\)，求 \\(AB\\) 全長。`
        );
        answers.push(
          `簡答：\\(AB=${total}\\)。過程：設 \\(PA=${m}k\\)、\\(PB=${n}k\\)，則 \\(PA\\times PB=${m * n}k^2=${product}\\)，得 \\(k=${k}\\)，所以 \\(AB=(${m}+${n})k=${total}\\)。`
        );
      } else if (type === 'ratioExternalSecantLength') {
        const m = randInt(1, 3);
        const n = randInt(3, 7);
        const k = randInt(2, 5);
        const pa = m * k;
        const ab = n * k;
        const pb = pa + ab;
        questions.push(
          `自圓外一點 \\(P\\) 作割線 \\(PAB\\)。若 \\(PA:AB=${m}:${n}\\)，且 \\(PA=${pa}\\)，求 \\(PB\\) 的長度。`
        );
        answers.push(
          `簡答：\\(PB=${pb}\\)。過程：由比例得 \\(AB=${ab}\\)，而 \\(PB=PA+AB=${pa}+${ab}=${pb}\\)。這是使用割線定理前最常需要先處理的全長換算。`
        );
      } else if (type === 'twoSecantsSamePointRatio') {
        const product = [36, 48, 60, 72, 96][randInt(0, 4)];
        const pa = randInt(2, 8);
        if (product % pa !== 0) {
          i -= 1;
          continue;
        }
        const pb = product / pa;
        questions.push(
          `由同一圓外點 \\(P\\) 作兩割線。已知第一條割線的 \\(PA\\times PB=${product}\\)，第二條割線的外部段為 \\(${pa}\\)，求第二條割線的全長。`
        );
        answers.push(
          `簡答：全長為 \\(${pb}\\)。過程：同一外點的兩割線乘積相等，所以 \\(${pa}\\times\\text{全長}=${product}\\)，得全長 \\(${pb}\\)。`
        );
      } else if (type === 'twoTangentEqualPower') {
        const pt = randInt(4, 15);
        questions.push(
          `圓外一點 \\(P\\) 對同一圓作兩條切線 \\(PT_1\\)、\\(PT_2\\)。若 \\(PT_1=${pt}\\)，求 \\(PT_2\\) 與此點對圓的乘冪值。`
        );
        answers.push(
          `簡答：\\(PT_2=${pt}\\)，乘冪值 \\(${pt * pt}\\)。過程：同一外點兩切線段相等，所以 \\(PT_2=${pt}\\)；乘冪值為切線長平方 \\(${pt}^2=${pt * pt}\\)。`
        );
      } else if (type === 'commonTangentPower') {
        const pt = randInt(4, 12);
        const product = pt * pt;
        const pa = randInt(2, 9);
        if (product % pa !== 0) {
          i -= 1;
          continue;
        }
        const pb = product / pa;
        questions.push(
          `圓外點 \\(P\\) 對圓作切線 \\(PT\\)，且 \\(PT=${pt}\\)。若另一割線 \\(PAB\\) 滿足 \\(PA=${pa}\\)，求 \\(PB\\)。`
        );
        answers.push(
          `簡答：\\(PB=${pb}\\)。過程：切割線定理 \\(PT^2=PA\\times PB\\)，所以 \\(${pt}^2=${pa}\\times PB\\)，得 \\(PB=${pb}\\)。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ531Set(kind, count) {
    const questions = [];
    const answers = [];
    const kinds = {
      parityMixed: ['paritySum', 'oddProduct', 'squareParity', 'linearParity', 'oddSquaresSum'],
      divisibilityMixed: [
        'consecutiveProductDivisible',
        'differenceSquaresDivisible',
        'shiftedSquareMultiple',
        'quadraticCompletionMultiple',
        'factorSubstitutionMultiple',
      ],
      remainderMixed: [
        'squareRemainder',
        'remainderParity',
        'expressionRemainder',
        'ageSquaresRemainder',
        'notDivisibleClaim',
      ],
      consecutiveMixed: [
        'threeConsecutiveProductSix',
        'consecutiveSumMultiple',
        'consecutiveOddSquaresEight',
        'twoConsecutiveEvenProduct',
        'consecutiveWeightedSumFour',
      ],
      inequalityMixed: [
        'positiveSquareOrder',
        'negativeSquareReverse',
        'positiveReciprocalReverse',
        'negativeReciprocalReverse',
        'multiplyByNegative',
        'amGmTwoNumbers',
        'radicalOrder',
        'sameSignProductInequality',
      ],
    };
    const selected = kinds[kind] || [kind];
    for (let i = 0; i < count; i += 1) {
      const type = selected[i % selected.length];
      if (type === 'paritySum') {
        const evenVar = ['a', 'm', 'p'][i % 3];
        const oddVar = ['b', 'n', 'q'][i % 3];
        questions.push(
          `已知 \\(${evenVar}\\) 為偶數，\\(${oddVar}\\) 為奇數。證明 \\(${evenVar}+${oddVar}\\) 必為奇數。`
        );
        answers.push(
          `簡答：必為奇數。過程：設 \\(${evenVar}=2r\\)、\\(${oddVar}=2s+1\\)，則 \\(${evenVar}+${oddVar}=2r+2s+1=2(r+s)+1\\)，符合奇數形式。`
        );
      } else if (type === 'oddProduct') {
        questions.push(`已知 \\(a\\)、\\(b\\) 均為奇數。證明 \\(ab\\) 必為奇數。`);
        answers.push(
          `簡答：\\(ab\\) 必為奇數。過程：設 \\(a=2m+1\\)、\\(b=2n+1\\)，則 \\(ab=(2m+1)(2n+1)=2(2mn+m+n)+1\\)，所以為奇數。`
        );
      } else if (type === 'squareParity') {
        const parity = i % 2 === 0 ? '奇數' : '偶數';
        const form = parity === '奇數' ? '2k+1' : '2k';
        questions.push(`已知 \\(n\\) 為${parity}。證明 \\(n^2\\) 必為${parity}。`);
        if (parity === '奇數') {
          answers.push(
            `簡答：\\(n^2\\) 必為奇數。過程：設 \\(n=${form}\\)，則 \\(n^2=(2k+1)^2=4k^2+4k+1=2(2k^2+2k)+1\\)。`
          );
        } else {
          answers.push(`簡答：\\(n^2\\) 必為偶數。過程：設 \\(n=${form}\\)，則 \\(n^2=(2k)^2=4k^2=2(2k^2)\\)。`);
        }
      } else if (type === 'linearParity') {
        const c = randInt(1, 9);
        const parity = c % 2 === 0 ? '偶數' : '奇數';
        questions.push(`已知 \\(n\\) 為偶數。判斷並證明 \\(n+${c}\\) 的奇偶性。`);
        answers.push(
          `簡答：\\(n+${c}\\) 為${parity}。過程：設 \\(n=2k\\)，則 \\(n+${c}=2k+${c}\\)。因為 \\(${c}\\) 為${parity}，所以 \\(n+${c}\\) 為${parity}。`
        );
      } else if (type === 'oddSquaresSum') {
        questions.push(
          `已知 \\(a\\)、\\(b\\) 均為奇數。證明 \\(a^2+b^2\\) 必為 \\(2\\) 的倍數但不一定是 \\(4\\) 的倍數。`
        );
        answers.push(
          `簡答：必為 \\(2\\) 的倍數，且不是 \\(4\\) 的倍數。過程：奇數平方除以 \\(4\\) 的餘數為 \\(1\\)，所以 \\(a^2+b^2\\equiv1+1\\equiv2\\pmod 4\\)。因此它是偶數，但不是 \\(4\\) 的倍數。`
        );
      } else if (type === 'consecutiveProductDivisible') {
        const length = [2, 3, 4][i % 3];
        const divisor = length === 2 ? 2 : length === 3 ? 6 : 24;
        const factors = Array.from({ length }, (_, idx) => `n+${idx}`)
          .map((text) => text.replace('+0', ''))
          .join(')(');
        questions.push(`證明任意 \\(${length}\\) 個連續整數的乘積 \\((${factors})\\) 必為 \\(${divisor}\\) 的倍數。`);
        answers.push(
          `簡答：必為 \\(${divisor}\\) 的倍數。過程：\\(${length}\\) 個連續整數中必含有足夠的因數：${length === 2 ? '至少一個偶數，所以含因數 2' : length === 3 ? '至少一個 3 的倍數且至少一個偶數，所以含因數 6' : '必含 4 的倍數、3 的倍數與另一個偶因數，所以含因數 24'}。`
        );
      } else if (type === 'differenceSquaresDivisible') {
        const gap = [2, 3, 4, 5][i % 4];
        questions.push(
          `已知 \\(a\\)、\\(b\\) 為整數且 \\(a-b=${gap}\\)。證明 \\(a^2-b^2\\) 必為 \\(${gap}\\) 的倍數。`
        );
        answers.push(
          `簡答：必為 \\(${gap}\\) 的倍數。過程：\\(a^2-b^2=(a-b)(a+b)=${gap}(a+b)\\)，因此含有因數 \\(${gap}\\)。`
        );
      } else if (type === 'shiftedSquareMultiple') {
        const shift = randInt(1, 6);
        questions.push(`已知 \\(k\\) 為正整數。證明 \\((k+${shift})^2-k^2\\) 必為 \\(${shift}\\) 的倍數。`);
        answers.push(
          `簡答：必為 \\(${shift}\\) 的倍數。過程：\\((k+${shift})^2-k^2=${shift}(2k+${shift})\\)，所以此式含因數 \\(${shift}\\)。`
        );
      } else if (type === 'quadraticCompletionMultiple') {
        const divisor = [4, 9, 16, 25][i % 4];
        const root = Math.sqrt(divisor);
        const multiplier = [2, 3, 4, 5][i % 4];
        questions.push(
          `已知 \\(n\\) 為整數，證明 \\((${multiplier}n+${root})^2-2${root}(${multiplier}n+${root})+${divisor}\\) 必為 \\(${divisor}\\) 的倍數。`
        );
        answers.push(
          `簡答：必為 \\(${divisor}\\) 的倍數。過程：令 \\(x=${multiplier}n+${root}\\)，原式 \\(=x^2-2${root}x+${divisor}=(x-${root})^2=(${multiplier}n)^2=${multiplier * multiplier}n^2\\)，可看出含有因數 \\(${divisor}\\)。`
        );
      } else if (type === 'factorSubstitutionMultiple') {
        const ratio = randInt(2, 5);
        const divisor = ratio * ratio + 1;
        questions.push(
          `已知 \\(a\\)、\\(b\\) 為正整數且 \\(a=${ratio}b\\)。證明 \\(a^2+b^2\\) 必為 \\(${divisor}\\) 的倍數。`
        );
        answers.push(
          `簡答：必為 \\(${divisor}\\) 的倍數。過程：代入 \\(a=${ratio}b\\)，得 \\(a^2+b^2=(${ratio}b)^2+b^2=${divisor}b^2\\)，所以為 \\(${divisor}\\) 的倍數。`
        );
      } else if (type === 'squareRemainder') {
        const divisor = [4, 5, 6, 7][i % 4];
        const remainder = randInt(1, divisor - 1);
        const squareRemainderValue = (remainder * remainder) % divisor;
        questions.push(
          `若 \\(n\\) 除以 \\(${divisor}\\) 的餘數為 \\(${remainder}\\)，求 \\(n^2\\) 除以 \\(${divisor}\\) 的餘數。`
        );
        answers.push(
          `簡答：餘數為 \\(${squareRemainderValue}\\)。過程：設 \\(n=${divisor}q+${remainder}\\)，則 \\(n^2\\equiv ${remainder}^2\\equiv ${squareRemainderValue}\\pmod{${divisor}}\\)。`
        );
      } else if (type === 'remainderParity') {
        const divisor = [4, 6, 8][i % 3];
        const remainder = [1, 3, 5][i % 3];
        questions.push(
          `若 \\(a\\) 除以 \\(${divisor}\\) 的餘數為 \\(${remainder}\\)，判斷 \\(a\\) 的奇偶性並說明理由。`
        );
        answers.push(
          `簡答：\\(a\\) 為奇數。過程：\\(${divisor}\\) 是偶數，\\(a=${divisor}q+${remainder}\\)。偶數倍加奇數仍為奇數，所以 \\(a\\) 為奇數。`
        );
      } else if (type === 'expressionRemainder') {
        const divisor = [4, 5, 7][i % 3];
        const remainder = randInt(1, divisor - 1);
        const constant = randInt(1, 8);
        const result = ((remainder + constant) * (remainder + constant)) % divisor;
        questions.push(
          `若 \\(n\\) 除以 \\(${divisor}\\) 的餘數為 \\(${remainder}\\)，求 \\((n+${constant})^2\\) 除以 \\(${divisor}\\) 的餘數。`
        );
        answers.push(
          `簡答：餘數為 \\(${result}\\)。過程：\\(n\\equiv${remainder}\\pmod{${divisor}}\\)，所以 \\((n+${constant})^2\\equiv(${remainder}+${constant})^2\\equiv${result}\\pmod{${divisor}}\\)。`
        );
      } else if (type === 'ageSquaresRemainder') {
        const divisor = 7;
        const r1 = randInt(1, 6);
        const r2 = randInt(1, 6);
        const result = (r1 * r1 + r2 * r2) % divisor;
        questions.push(
          `兩人的年齡除以 \\(7\\) 的餘數分別為 \\(${r1}\\)、\\(${r2}\\)。求兩人年齡平方和除以 \\(7\\) 的餘數。`
        );
        answers.push(
          `簡答：餘數為 \\(${result}\\)。過程：若兩年齡分別為 \\(x\\)、\\(y\\)，則 \\(x^2+y^2\\equiv${r1}^2+${r2}^2\\equiv${result}\\pmod 7\\)。`
        );
      } else if (type === 'notDivisibleClaim') {
        const remainder = [1, 2, 3][i % 3];
        questions.push(
          `若 \\(n\\) 為正整數且 \\(n\\) 不被 \\(4\\) 整除，且 \\(n\\) 除以 \\(4\\) 的餘數為 \\(${remainder}\\)。判斷 \\(n^2+n\\) 是否一定為 \\(4\\) 的倍數。`
        );
        const result = (remainder * remainder + remainder) % 4;
        const verdict = result === 0 ? '是' : '否';
        answers.push(
          `簡答：${verdict}。過程：只需看餘數，\\(n^2+n\\equiv${remainder}^2+${remainder}\\equiv${result}\\pmod 4\\)。${result === 0 ? '因此一定是 4 的倍數。' : '餘數不為 0，因此不一定是 4 的倍數。'}`
        );
      } else if (type === 'threeConsecutiveProductSix') {
        questions.push(`證明任意三個連續整數 \\(n\\)、\\(n+1\\)、\\(n+2\\) 的乘積必為 \\(6\\) 的倍數。`);
        answers.push(
          `簡答：必為 \\(6\\) 的倍數。過程：三個連續整數中必有一個是 \\(3\\) 的倍數，也必有一個是偶數，因此乘積同時含因數 \\(3\\) 與 \\(2\\)，所以為 \\(6\\) 的倍數。`
        );
      } else if (type === 'consecutiveSumMultiple') {
        const countN = [3, 5, 7][i % 3];
        questions.push(`證明任意 \\(${countN}\\) 個連續整數的和必為 \\(${countN}\\) 的倍數。`);
        answers.push(
          `簡答：必為 \\(${countN}\\) 的倍數。過程：設中間數為 \\(m\\)，這 \\(${countN}\\) 個數可左右配對，總和為 \\(${countN}m\\)，所以為 \\(${countN}\\) 的倍數。`
        );
      } else if (type === 'consecutiveOddSquaresEight') {
        questions.push(`證明任意兩個連續奇數的平方差必為 \\(8\\) 的倍數。`);
        answers.push(
          `簡答：必為 \\(8\\) 的倍數。過程：設兩連續奇數為 \\(2k+1\\)、\\(2k+3\\)，平方差為 \\((2k+3)^2-(2k+1)^2=8k+8=8(k+1)\\)。`
        );
      } else if (type === 'twoConsecutiveEvenProduct') {
        questions.push(`證明任意兩個連續偶數的乘積必為 \\(8\\) 的倍數。`);
        answers.push(
          `簡答：必為 \\(8\\) 的倍數。過程：設兩連續偶數為 \\(2k\\)、\\(2k+2\\)，乘積為 \\(2k(2k+2)=4k(k+1)\\)。因為 \\(k\\)、\\(k+1\\) 必有一個偶數，所以整體含因數 \\(8\\)。`
        );
      } else if (type === 'consecutiveWeightedSumFour') {
        questions.push(
          `已知 \\(a\\)、\\(b\\)、\\(c\\) 是三個連續整數，且 \\(a<b<c\\)。證明 \\(a+2b+c\\) 必為 \\(4\\) 的倍數。`
        );
        answers.push(
          `簡答：必為 \\(4\\) 的倍數。過程：設 \\(a=n\\)、\\(b=n+1\\)、\\(c=n+2\\)，則 \\(a+2b+c=n+2(n+1)+(n+2)=4n+4=4(n+1)\\)。`
        );
      } else if (type === 'positiveSquareOrder') {
        questions.push(`已知 \\(a>b>0\\)。證明 \\(a^2>b^2\\)。`);
        answers.push(
          `簡答：\\(a^2>b^2\\)。過程：\\(a^2-b^2=(a-b)(a+b)\\)。因為 \\(a-b>0\\)、\\(a+b>0\\)，所以 \\(a^2-b^2>0\\)。`
        );
      } else if (type === 'negativeSquareReverse') {
        questions.push(`已知 \\(a<b<0\\)。證明 \\(a^2>b^2\\)。`);
        answers.push(`簡答：\\(a^2>b^2\\)。過程：由 \\(a<b<0\\) 可知 \\(|a|>|b|\\)，兩邊平方得 \\(a^2>b^2\\)。`);
      } else if (type === 'positiveReciprocalReverse') {
        questions.push(`已知 \\(a>b>0\\)。證明 \\(\\frac{1}{a}<\\frac{1}{b}\\)。`);
        answers.push(
          `簡答：\\(\\frac{1}{a}<\\frac{1}{b}\\)。過程：\\(\\frac{1}{b}-\\frac{1}{a}=\\frac{a-b}{ab}\\)。因為 \\(a-b>0\\)、\\(ab>0\\)，所以差為正。`
        );
      } else if (type === 'negativeReciprocalReverse') {
        questions.push(`已知 \\(a<b<0\\)。判斷 \\(\\frac{1}{a}\\) 與 \\(\\frac{1}{b}\\) 的大小並證明。`);
        answers.push(
          `簡答：\\(\\frac{1}{a}>\\frac{1}{b}\\)。過程：\\(\\frac{1}{a}-\\frac{1}{b}=\\frac{b-a}{ab}\\)。因為 \\(b-a>0\\)、\\(ab>0\\)，所以差為正。`
        );
      } else if (type === 'multiplyByNegative') {
        questions.push(`已知 \\(a>b\\) 且 \\(c<0\\)。證明 \\(ac<bc\\)。`);
        answers.push(
          `簡答：\\(ac<bc\\)。過程：由 \\(a-b>0\\)、\\(c<0\\)，得 \\(c(a-b)<0\\)，也就是 \\(ac-bc<0\\)，所以 \\(ac<bc\\)。`
        );
      } else if (type === 'amGmTwoNumbers') {
        questions.push(`已知 \\(a\\)、\\(b\\) 為正數。證明 \\(\\frac{a+b}{2}\\ge \\sqrt{ab}\\)。`);
        answers.push(
          `簡答：成立。過程：\\((\\sqrt a-\\sqrt b)^2\\ge0\\)，展開得 \\(a+b-2\\sqrt{ab}\\ge0\\)，所以 \\(\\frac{a+b}{2}\\ge\\sqrt{ab}\\)。`
        );
      } else if (type === 'radicalOrder') {
        questions.push(`已知 \\(0<a<1\\)。證明 \\(\\sqrt a>a\\)。`);
        answers.push(
          `簡答：\\(\\sqrt a>a\\)。過程：因為 \\(0<a<1\\)，所以 \\(0<\\sqrt a<1\\)。兩邊同乘正數 \\(\\sqrt a\\)，得 \\(a<\\sqrt a\\)。`
        );
      } else if (type === 'sameSignProductInequality') {
        questions.push(
          `已知 \\(ab<0\\)、\\(bc>0\\)、\\(cd<0\\)。判斷 \\(a\\)、\\(d\\) 是否同號，並證明 \\(abcd>0\\)。`
        );
        answers.push(
          `簡答：\\(a\\)、\\(d\\) 同號，且 \\(abcd>0\\)。過程：\\(ab<0\\) 表示 \\(a\\)、\\(b\\) 異號；\\(bc>0\\) 表示 \\(b\\)、\\(c\\) 同號；\\(cd<0\\) 表示 \\(c\\)、\\(d\\) 異號，所以 \\(a\\)、\\(d\\) 同號。又 \\((ab)(cd)>0\\)，故 \\(abcd>0\\)。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ532Set(kind, count) {
    const questions = [];
    const answers = [];
    const kinds = {
      centersMixed: [
        'circumcenterEqualDistance',
        'incenterEqualDistance',
        'centroidMedianRatio',
        'rightTriangleCircumcenter',
        'isoscelesCentersLine',
      ],
      congruenceMixed: [
        'isoscelesAltitudeBisects',
        'perpendicularBisectorPoint',
        'angleBisectorSymmetry',
        'squareSharedVertex',
        'equilateralSharedVertex',
      ],
      similarityMixed: [
        'parallelLineSimilarity',
        'rightAltitudeGeometricMean',
        'butterflySimilarity',
        'angleBisectorRatio',
        'altitudeCircumcircleProduct',
      ],
      circleProofMixed: [
        'parallelChordsEqualArcs',
        'tangentSegmentsEqual',
        'cyclicOppositeAngles',
        'tangentChordSimilarity',
        'sameArcAngleEqual',
      ],
      centroidAreaMixed: [
        'centroidThreeTrianglesArea',
        'medianSixEqualAreas',
        'centroidMidpointAreaRatio',
        'parallelogramCentroidPoint',
        'centroidMedianLength',
      ],
    };
    const selected = kinds[kind] || [kind];
    const letters = [
      ['A', 'B', 'C'],
      ['P', 'Q', 'R'],
      ['X', 'Y', 'Z'],
    ];
    const arc = (name) => `\\overset{\\frown}{${name}}`;
    for (let i = 0; i < count; i += 1) {
      const type = selected[i % selected.length];
      const [a, b, c] = letters[i % letters.length];
      if (type === 'circumcenterEqualDistance') {
        questions.push(`已知 \\(O\\) 為 \\(\\triangle ${a}${b}${c}\\) 的外心。證明 \\(O${a}=O${b}=O${c}\\)。`);
        answers.push(
          `簡答：\\(O${a}=O${b}=O${c}\\)。過程：外心定義為三角形三邊垂直平分線的交點。垂直平分線上的點到線段兩端距離相等，所以 \\(O${a}=O${b}\\)、\\(O${b}=O${c}\\)，因此 \\(O${a}=O${b}=O${c}\\)。`
        );
      } else if (type === 'incenterEqualDistance') {
        questions.push(
          `已知 \\(I\\) 為 \\(\\triangle ${a}${b}${c}\\) 的內心，且 \\(ID\\perp ${a}${b}\\)、\\(IE\\perp ${b}${c}\\)、\\(IF\\perp ${c}${a}\\)。證明 \\(ID=IE=IF\\)。`
        );
        answers.push(
          `簡答：\\(ID=IE=IF\\)。過程：內心是三個角平分線的交點。角平分線上的點到角兩邊距離相等，所以 \\(ID=IE\\)、\\(IE=IF\\)，故 \\(ID=IE=IF\\)。`
        );
      } else if (type === 'centroidMedianRatio') {
        const long = 2 * randInt(3, 9);
        const short = long / 2;
        questions.push(
          `已知 \\(G\\) 為 \\(\\triangle ${a}${b}${c}\\) 的重心，\\(${a}D\\) 為中線，且 \\(GD=${short}\\)。求 \\(${a}G\\) 並說明 \\(${a}G:GD\\) 的關係。`
        );
        answers.push(
          `簡答：\\(${a}G=${long}\\)，且 \\(${a}G:GD=2:1\\)。過程：重心在每條中線上，並把中線分成「頂點到重心 : 重心到中點 = 2:1」。所以 \\(${a}G=2GD=2\\times${short}=${long}\\)。`
        );
      } else if (type === 'rightTriangleCircumcenter') {
        const hyp = randInt(10, 30);
        questions.push(
          `在直角 \\(\\triangle ${a}${b}${c}\\) 中，\\(\\angle ${b}=90^\\circ\\)，\\(M\\) 為斜邊 \\(${a}${c}\\) 的中點，且 \\(${a}${c}=${hyp}\\)。證明 \\(M\\) 是外心，並求外接圓半徑。`
        );
        answers.push(
          `簡答：\\(M\\) 是外心，半徑 \\(${formatFraction(hyp, 2)}\\)。過程：直角三角形斜邊中點到三頂點距離相等，故 \\(M${a}=M${b}=M${c}\\)，所以 \\(M\\) 為外心。外接圓半徑為斜邊一半，即 \\(${formatFraction(hyp, 2)}\\)。`
        );
      } else if (type === 'isoscelesCentersLine') {
        questions.push(
          `已知 \\(\\triangle ${a}${b}${c}\\) 中，\\(${a}${b}=${a}${c}\\)。證明外心、內心與重心都落在頂角 \\(\\angle ${a}\\) 的角平分線上。`
        );
        answers.push(
          `簡答：三心都在 \\(\\angle ${a}\\) 的角平分線上。過程：等腰三角形的頂角角平分線同時也是底邊中線與高，圖形關於此線對稱。外心、內心、重心皆由對稱性唯一決定，因此都必落在對稱軸上。`
        );
      } else if (type === 'isoscelesAltitudeBisects') {
        questions.push(
          `已知 \\(\\triangle ${a}${b}${c}\\) 中，\\(${a}${b}=${a}${c}\\)，且 \\(${a}D\\perp ${b}${c}\\)。證明 \\(\\angle ${b}${a}D=\\angle D${a}${c}\\)。`
        );
        answers.push(
          `簡答：兩角相等。過程：在 \\(\\triangle ${a}${b}D\\) 與 \\(\\triangle ${a}${c}D\\) 中，\\(${a}${b}=${a}${c}\\)、\\(${a}D\\) 共用、\\(\\angle ${a}D${b}=\\angle ${a}D${c}=90^\\circ\\)，由 RHS 全等，得 \\(\\angle ${b}${a}D=\\angle D${a}${c}\\)。`
        );
      } else if (type === 'perpendicularBisectorPoint') {
        questions.push(
          `直線 \\(L\\) 為線段 \\(${a}${b}\\) 的垂直平分線，點 \\(P\\) 在 \\(L\\) 上。證明 \\(P${a}=P${b}\\)。`
        );
        answers.push(
          `簡答：\\(P${a}=P${b}\\)。過程：垂直平分線上的任一點到線段兩端距離相等。也可連接 \\(P${a}\\)、\\(P${b}\\)，用兩個直角三角形的共用邊與半段相等證明全等。`
        );
      } else if (type === 'angleBisectorSymmetry') {
        questions.push(
          `已知 \\(\\angle APQ=\\angle QPD\\)，且 \\(QA\\perp PA\\)、\\(QD\\perp PD\\)。證明 \\(QA=QD\\)。`
        );
        answers.push(
          `簡答：\\(QA=QD\\)。過程：點 \\(Q\\) 在角平分線上。角平分線上的點到角兩邊距離相等，因此 \\(QA=QD\\)。`
        );
      } else if (type === 'squareSharedVertex') {
        questions.push(
          `正方形 \\(ABCD\\) 與 \\(AEFG\\) 共用頂點 \\(A\\)。證明 \\(\\triangle ABE\\cong\\triangle ADG\\)，並推出 \\(BE=DG\\)。`
        );
        answers.push(
          `簡答：\\(\\triangle ABE\\cong\\triangle ADG\\)，所以 \\(BE=DG\\)。過程：正方形給 \\(AB=AD\\)、\\(AE=AG\\)，且 \\(\\angle BAE\\) 與 \\(\\angle DAG\\) 都由一個共同角加上 \\(90^\\circ\\) 組成，故相等。由 SAS 全等，得對應邊 \\(BE=DG\\)。`
        );
      } else if (type === 'equilateralSharedVertex') {
        questions.push(
          `\\(\\triangle ABC\\) 與 \\(\\triangle ADE\\) 皆為正三角形，且共用頂點 \\(A\\)。證明 \\(BD=CE\\)。`
        );
        answers.push(
          `簡答：\\(BD=CE\\)。過程：正三角形給 \\(AB=AC\\)、\\(AD=AE\\)，且 \\(\\angle BAD=\\angle CAE\\)（同為共同角加 \\(60^\\circ\\) 或相減 \\(60^\\circ\\)）。由 SAS 全等 \\(\\triangle BAD\\cong\\triangle CAE\\)，所以 \\(BD=CE\\)。`
        );
      } else if (type === 'parallelLineSimilarity') {
        const ratio = randInt(2, 5);
        questions.push(
          `在 \\(\\triangle ${a}${b}${c}\\) 中，\\(DE\\parallel ${b}${c}\\)，且 \\(${a}D:${a}${b}=1:${ratio}\\)。證明 \\(\\triangle ${a}DE\\sim\\triangle ${a}${b}${c}\\)，並求 \\(${a}E:${a}${c}\\)。`
        );
        answers.push(
          `簡答：相似，且 \\(${a}E:${a}${c}=1:${ratio}\\)。過程：因 \\(DE\\parallel ${b}${c}\\)，對應角相等，故 \\(\\triangle ${a}DE\\sim\\triangle ${a}${b}${c}\\)。相似三角形對應邊成比例，所以 \\(${a}E:${a}${c}=${a}D:${a}${b}=1:${ratio}\\)。`
        );
      } else if (type === 'rightAltitudeGeometricMean') {
        const bd = randInt(2, 8);
        const dc = randInt(2, 8);
        questions.push(
          `直角 \\(\\triangle ABC\\) 中，\\(\\angle A=90^\\circ\\)，\\(AD\\perp BC\\)。若 \\(BD=${bd}\\)、\\(DC=${dc}\\)，證明 \\(AD^2=BD\\times DC\\)，並寫出 \\(AD^2\\) 的值。`
        );
        answers.push(
          `簡答：\\(AD^2=${bd * dc}\\)。過程：斜邊上的高會形成三個相似直角三角形，得 \\(\\triangle ABD\\sim\\triangle CAD\\)。由對應邊比例可得 \\(\\frac{BD}{AD}=\\frac{AD}{DC}\\)，所以 \\(AD^2=BD\\times DC=${bd}\\times${dc}=${bd * dc}\\)。`
        );
      } else if (type === 'butterflySimilarity') {
        questions.push(
          `已知 \\(AB\\parallel CD\\)，且 \\(AD\\) 與 \\(BC\\) 交於 \\(O\\)。證明 \\(\\triangle AOB\\sim\\triangle DOC\\)，並推出 \\(OA\\times OC=OB\\times OD\\)。`
        );
        answers.push(
          `簡答：相似且 \\(OA\\times OC=OB\\times OD\\)。過程：因 \\(AB\\parallel CD\\)，內錯角相等；又 \\(\\angle AOB=\\angle DOC\\) 為對頂角，所以 \\(\\triangle AOB\\sim\\triangle DOC\\)。由比例 \\(OA:OD=OB:OC\\)，交叉相乘得 \\(OA\\times OC=OB\\times OD\\)。`
        );
      } else if (type === 'angleBisectorRatio') {
        const ab = randInt(4, 12);
        const ac = randInt(4, 12);
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(AD\\) 平分 \\(\\angle BAC\\) 且交 \\(BC\\) 於 \\(D\\)。若 \\(AB=${ab}\\)、\\(AC=${ac}\\)，求 \\(BD:DC\\) 並說明理由。`
        );
        answers.push(
          `簡答：\\(BD:DC=${ab}:${ac}\\)。過程：角平分線定理指出，內角平分線把對邊分成的兩段，長度比等於夾該角兩邊的長度比，所以 \\(BD:DC=AB:AC=${ab}:${ac}\\)。`
        );
      } else if (type === 'altitudeCircumcircleProduct') {
        questions.push(
          `已知 \\(\\triangle ABC\\) 的外接圓直徑為 \\(AD\\)，且 \\(AH\\perp BC\\)。證明 \\(AB\\times AC=AD\\times AH\\)。`
        );
        answers.push(
          `簡答：\\(AB\\times AC=AD\\times AH\\)。過程：因 \\(AD\\) 為外接圓直徑，可利用同弧角與直角建立相似三角形，得到 \\(\\frac{AB}{AD}=\\frac{AH}{AC}\\)。交叉相乘即得 \\(AB\\times AC=AD\\times AH\\)。`
        );
      } else if (type === 'parallelChordsEqualArcs') {
        questions.push(
          `在同一圓中，若弦 \\(AB\\parallel CD\\)。證明弧 \\(${arc('AC')}\\) 與弧 \\(${arc('BD')}\\) 度數相等。`
        );
        answers.push(
          `簡答：弧 \\(${arc('AC')}\\) 與弧 \\(${arc('BD')}\\) 相等。過程：平行弦造成相等的內錯角，而這些角分別對應兩段弧。由圓周角相等可推出所對弧相等。`
        );
      } else if (type === 'tangentSegmentsEqual') {
        questions.push(`自圓外一點 \\(P\\) 引兩切線 \\(PA\\)、\\(PB\\)。證明 \\(PA=PB\\)。`);
        answers.push(
          `簡答：\\(PA=PB\\)。過程：連接圓心 \\(O\\) 至切點 \\(A\\)、\\(B\\)。半徑垂直切線，故 \\(\\triangle OAP\\)、\\(\\triangle OBP\\) 為直角三角形；又 \\(OA=OB\\)、\\(OP\\) 共用，由 RHS 全等得 \\(PA=PB\\)。`
        );
      } else if (type === 'cyclicOppositeAngles') {
        questions.push(`四邊形 \\(ABCD\\) 內接於一圓。證明 \\(\\angle A+\\angle C=180^\\circ\\)。`);
        answers.push(
          `簡答：\\(\\angle A+\\angle C=180^\\circ\\)。過程：\\(\\angle A\\) 與 \\(\\angle C\\) 分別對應互補的兩段弧，兩段弧合為整圓 \\(360^\\circ\\)。圓周角為所對弧的一半，所以兩角和為 \\(180^\\circ\\)。`
        );
      } else if (type === 'tangentChordSimilarity') {
        questions.push(
          `自圓外點 \\(P\\) 作切線 \\(PA\\) 與割線 \\(PBC\\)。證明 \\(\\triangle PAB\\sim\\triangle PCA\\)。`
        );
        answers.push(
          `簡答：\\(\\triangle PAB\\sim\\triangle PCA\\)。過程：\\(\\angle APB\\) 與 \\(\\angle CPA\\) 是同一角；弦切角 \\(\\angle PAB\\) 等於同弧所對圓周角 \\(\\angle PCA\\)。兩角相等，所以兩三角形相似。`
        );
      } else if (type === 'sameArcAngleEqual') {
        questions.push(
          `在同一圓中，圓周角 \\(\\angle ACB\\) 與弦切角 \\(\\angle PAB\\) 對同一弧 \\(${arc('AB')}\\)。證明 \\(\\angle ACB=\\angle PAB\\)。`
        );
        answers.push(
          `簡答：兩角相等。過程：圓周角等於所對弧的一半，弦切角也等於同弧所對圓周角。因此同對弧 \\(${arc('AB')}\\) 的 \\(\\angle ACB\\) 與 \\(\\angle PAB\\) 相等。`
        );
      } else if (type === 'centroidThreeTrianglesArea') {
        questions.push(
          `已知 \\(G\\) 為 \\(\\triangle ABC\\) 的重心。證明 \\(\\triangle GAB\\)、\\(\\triangle GBC\\)、\\(\\triangle GCA\\) 面積相等。`
        );
        answers.push(
          `簡答：三個面積相等。過程：三條中線交於重心，且每條中線都把三角形分成等面積兩半。由三條中線共同分割，可得以重心連三頂點形成的三個三角形面積相等。`
        );
      } else if (type === 'medianSixEqualAreas') {
        questions.push(
          `已知 \\(\\triangle ABC\\) 的三條中線交於重心 \\(G\\)。證明三條中線把 \\(\\triangle ABC\\) 分成六個面積相等的小三角形。`
        );
        answers.push(
          `簡答：六個小三角形面積相等。過程：中線平分底邊，所以同高的三角形面積相等；三條中線交於重心後，各小三角形可透過同底或同高逐步比較，得到六個面積相等。`
        );
      } else if (type === 'centroidMidpointAreaRatio') {
        const area = 6 * randInt(6, 20);
        questions.push(
          `已知 \\(G\\) 為 \\(\\triangle ABC\\) 的重心，\\(D\\) 為 \\(BC\\) 中點，且 \\(\\triangle ABC\\) 面積為 \\(${area}\\)。求 \\(\\triangle GBD\\) 面積。`
        );
        answers.push(
          `簡答：\\(${area / 6}\\)。過程：三條中線把三角形分成六個面積相等的小三角形，\\(\\triangle GBD\\) 是其中一個，所以面積為 \\(${area}\\div6=${area / 6}\\)。`
        );
      } else if (type === 'parallelogramCentroidPoint') {
        questions.push(
          `平行四邊形 \\(ABCD\\) 中，\\(O\\) 為對角線交點，\\(E\\) 為 \\(CD\\) 中點，\\(AE\\) 交 \\(BD\\) 於 \\(M\\)。證明 \\(M\\) 為 \\(\\triangle ACD\\) 的重心。`
        );
        answers.push(
          `簡答：\\(M\\) 為 \\(\\triangle ACD\\) 的重心。過程：平行四邊形對角線互相平分，所以 \\(O\\) 是 \\(AC\\) 的中點；\\(E\\) 是 \\(CD\\) 的中點。於 \\(\\triangle ACD\\) 中，\\(DO\\) 與 \\(AE\\) 是兩條中線，其交點 \\(M\\) 即為重心。`
        );
      } else if (type === 'centroidMedianLength') {
        const gm = randInt(2, 8);
        questions.push(
          `已知 \\(G\\) 為 \\(\\triangle ABC\\) 的重心，\\(AD\\) 為中線且 \\(GD=${gm}\\)。求 \\(AD\\) 的長度。`
        );
        answers.push(
          `簡答：\\(AD=${3 * gm}\\)。過程：重心分中線比為 \\(AG:GD=2:1\\)，所以 \\(AD=AG+GD=3GD=3\\times${gm}=${3 * gm}\\)。`
        );
      }
    }
    return { questions, summaryAnswers: answers.map(deriveSummaryAnswerFromDetail), answers };
  }

  function buildJ533Set(kind, count) {
    const questions = [];
    const answers = [];
    const kinds = {
      circumcenterMixed: [
        'circumcenterAngle',
        'circumcenterEqualRadius',
        'rightCircumradius',
        'equilateralCircumradius',
        'obtuseCircumcenterAngle',
        'isoscelesCircumradius',
        'circumcircleAreaFromRadius',
      ],
      incenterMixed: [
        'incenterAngle',
        'incenterAngleInverse',
        'inradiusFromAreaPerimeter',
        'rightTriangleInradius',
        'incenterAreaRatio',
        'equilateralInradius',
        'incenterAreaFromSideRatio',
        'axisTriangleIncenterArea',
      ],
      centroidMixed: [
        'centroidMedianLength',
        'centroidMedianInverse',
        'centroidCoordinate',
        'missingVertexFromCentroid',
        'centroidAreaSixth',
        'centroidAreaThird',
        'centroidMedianEquation',
        'centroidAreaFromOneSmall',
        'parallelogramHiddenCentroidLength',
        'parallelogramCentroidArea',
        'centroidQuadrilateralToTotalArea',
        'parallelogramTwoCentroidsDistance',
        'parallelogramMidpointTriangleArea',
        'parallelogramCentroidSegmentEquation',
        'isoscelesAreaFromCentroidDistance',
      ],
      coordinateMixed: [
        'rightTriangleCircumcenterCoordinate',
        'threePointCentroidCoordinate',
        'axisTriangleIncenter',
        'rightTriangleOGDistance',
        'circumcenterPointCheck',
        'circumcenterCoordinateGeneral',
        'rightTriangleCoordinateOG',
        'eulerLineOrthocenterCoordinate',
      ],
      specialMixed: [
        'equilateralRadiiRatio',
        'equilateralAreaFromInradius',
        'rightTriangleGO',
        'rightTriangleRrPerimeter',
        'centroidToVertexSum',
        'equilateralAreaFromCircumradius',
        'rightTriangleHypotenuseFromOG',
        'rightTrianglePerimeterFromRr',
        'equilateralHeightFromCircumradius',
        'equilateralIncircleCircumcircleAreaRatio',
      ],
    };
    const selected = kinds[kind] || [kind];
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [6, 8, 10],
      [8, 15, 17],
      [7, 24, 25],
      [9, 12, 15],
    ];
    const pickTriple = () => triples[randInt(0, triples.length - 1)];
    const piTerm = (coeff) => {
      if (coeff === 1) return '\\pi';
      return `${coeff}\\pi`;
    };
    const coordText = (x, y) => `(${formatFraction(x, 1)},${formatFraction(y, 1)})`;
    for (let i = 0; i < count; i += 1) {
      const type = selected[i % selected.length];
      if (type === 'circumcenterAngle') {
        const angleA = [35, 40, 45, 50, 60, 65, 70][randInt(0, 6)];
        const boc = 2 * angleA;
        questions.push(
          `銳角 \\(\\triangle ABC\\) 中，\\(O\\) 為外心。若 \\(\\angle A=${angleA}^\\circ\\)，求 \\(\\angle BOC\\) 的度數。`
        );
        answers.push(
          `簡答：\\(${boc}^\\circ\\)。過程：銳角三角形中，外心在三角形內，\\(\\angle BOC\\) 是弧 \\(BC\\) 的圓心角，\\(\\angle A\\) 是同弧圓周角，所以 \\(\\angle BOC=2\\angle A=${boc}^\\circ\\)。`
        );
      } else if (type === 'circumcenterEqualRadius') {
        const radius = randInt(4, 18);
        questions.push(`設 \\(O\\) 為 \\(\\triangle ABC\\) 的外心，且 \\(OA=${radius}\\)。求 \\(OA+OB+OC\\) 的值。`);
        answers.push(
          `簡答：\\(${3 * radius}\\)。過程：外心到三個頂點距離相等，皆為外接圓半徑，所以 \\(OA=OB=OC=${radius}\\)，總和為 \\(3\\times${radius}=${3 * radius}\\)。`
        );
      } else if (type === 'rightCircumradius') {
        const [a, b, c] = pickTriple();
        questions.push(`直角 \\(\\triangle ABC\\) 的兩股長為 \\(${a}\\)、\\(${b}\\)。求外接圓半徑 \\(R\\)。`);
        answers.push(
          `簡答：\\(R=${formatFraction(c, 2)}\\)。過程：直角三角形外心在斜邊中點，外接圓半徑為斜邊一半。斜邊 \\(=${c}\\)，所以 \\(R=${formatFraction(c, 2)}\\)。`
        );
      } else if (type === 'equilateralCircumradius') {
        const side = 3 * randInt(2, 8);
        const radiusText = `${side / 3}\\sqrt{3}`;
        questions.push(`正三角形邊長為 \\(${side}\\)。求外心到頂點的距離，也就是外接圓半徑 \\(R\\)。`);
        answers.push(
          `簡答：\\(${radiusText}\\)。過程：正三角形外心、內心、重心合一，高為 \\(\\frac{${side}\\sqrt3}{2}\\)，重心到頂點為高的 \\(\\frac{2}{3}\\)，所以 \\(R=${radiusText}\\)。`
        );
      } else if (type === 'obtuseCircumcenterAngle') {
        const angleA = [100, 105, 110, 120, 125][randInt(0, 4)];
        const boc = 360 - 2 * angleA;
        questions.push(
          `鈍角 \\(\\triangle ABC\\) 中，\\(O\\) 為外心。若 \\(\\angle A=${angleA}^\\circ\\)，求較小的 \\(\\angle BOC\\)。`
        );
        answers.push(
          `簡答：\\(${boc}^\\circ\\)。過程：\\(2\\angle A=${2 * angleA}^\\circ\\) 對應的是較大的圓心角，題目求較小角，所以 \\(\\angle BOC=360^\\circ-${2 * angleA}^\\circ=${boc}^\\circ\\)。`
        );
      } else if (type === 'isoscelesCircumradius') {
        const [halfBase, height, equalSide] = pickTriple();
        const base = 2 * halfBase;
        const radiusText = formatFraction(equalSide * equalSide, 2 * height);
        questions.push(
          `等腰 \\(\\triangle ABC\\) 中，\\(AB=AC=${equalSide}\\)、\\(BC=${base}\\)。求外接圓半徑 \\(R\\)。`
        );
        answers.push(
          `簡答：\\(R=${radiusText}\\)。過程：底邊高把等腰三角形分成兩個直角三角形，半底為 \\(${halfBase}\\)，高為 \\(${height}\\)。面積 \\(K=\\frac12\\times${base}\\times${height}\\)，外接圓半徑 \\(R=\\frac{abc}{4K}=\\frac{${equalSide}^2\\times${base}}{4K}=${radiusText}\\)。`
        );
      } else if (type === 'circumcircleAreaFromRadius') {
        const radius = randInt(3, 12);
        questions.push(`已知 \\(O\\) 為 \\(\\triangle ABC\\) 的外心，且 \\(OA=${radius}\\)。求此三角形外接圓面積。`);
        answers.push(
          `簡答：\\(${piTerm(radius * radius)}\\)。過程：外心到頂點距離為外接圓半徑，所以 \\(R=OA=${radius}\\)。外接圓面積為 \\(\\pi R^2=${piTerm(radius * radius)}\\)。`
        );
      } else if (type === 'incenterAngle') {
        const angleA = [40, 50, 60, 70, 80, 90, 100][randInt(0, 6)];
        const bic = 90 + angleA / 2;
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(I\\) 為內心。若 \\(\\angle A=${angleA}^\\circ\\)，求 \\(\\angle BIC\\)。`
        );
        answers.push(
          `簡答：\\(${bic}^\\circ\\)。過程：內心角公式 \\(\\angle BIC=90^\\circ+\\frac{1}{2}\\angle A\\)，所以 \\(\\angle BIC=90^\\circ+${angleA / 2}^\\circ=${bic}^\\circ\\)。`
        );
      } else if (type === 'incenterAngleInverse') {
        const angleA = [40, 60, 80, 100, 120][randInt(0, 4)];
        const bic = 90 + angleA / 2;
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(I\\) 為內心。若 \\(\\angle BIC=${bic}^\\circ\\)，求 \\(\\angle A\\)。`
        );
        answers.push(
          `簡答：\\(${angleA}^\\circ\\)。過程：\\(\\angle BIC=90^\\circ+\\frac{1}{2}\\angle A\\)，所以 \\(\\angle A=2(${bic}-90)^\\circ=${angleA}^\\circ\\)。`
        );
      } else if (type === 'inradiusFromAreaPerimeter') {
        const r = randInt(2, 8);
        const semiperimeter = randInt(10, 30);
        const area = r * semiperimeter;
        questions.push(
          `\\(\\triangle ABC\\) 的周長為 \\(${2 * semiperimeter}\\)，面積為 \\(${area}\\)。求內切圓半徑 \\(r\\)。`
        );
        answers.push(
          `簡答：\\(r=${r}\\)。過程：三角形面積 \\(A=rs\\)，其中 \\(s\\) 為半周長。此處 \\(s=${semiperimeter}\\)，所以 \\(r=\\frac{A}{s}=\\frac{${area}}{${semiperimeter}}=${r}\\)。`
        );
      } else if (type === 'rightTriangleInradius') {
        const [a, b, c] = pickTriple();
        const r = (a + b - c) / 2;
        questions.push(`直角三角形兩股長為 \\(${a}\\)、\\(${b}\\)，斜邊長為 \\(${c}\\)。求內切圓半徑 \\(r\\)。`);
        answers.push(
          `簡答：\\(r=${formatFraction(a + b - c, 2)}\\)。過程：直角三角形內切圓半徑 \\(r=\\frac{a+b-c}{2}\\)，所以 \\(r=\\frac{${a}+${b}-${c}}{2}=${formatFraction(a + b - c, 2)}\\)。`
        );
      } else if (type === 'incenterAreaRatio') {
        const sides = [
          [3, 6, 7],
          [5, 7, 9],
          [6, 8, 10],
          [4, 5, 7],
        ][randInt(0, 3)];
        questions.push(
          `若 \\(I\\) 為 \\(\\triangle ABC\\) 的內心，且 \\(AB=${sides[0]}\\)、\\(BC=${sides[1]}\\)、\\(CA=${sides[2]}\\)。求 \\(\\triangle AIB:\\triangle BIC:\\triangle CIA\\) 的面積比。`
        );
        answers.push(
          `簡答：\\(${sides[0]}:${sides[1]}:${sides[2]}\\)。過程：內心到三邊距離皆為內切圓半徑 \\(r\\)，三個小三角形的高相同，因此面積比等於對應底邊比 \\(AB:BC:CA=${sides[0]}:${sides[1]}:${sides[2]}\\)。`
        );
      } else if (type === 'equilateralInradius') {
        const side = 6 * randInt(1, 6);
        const rText = `${side / 6}\\sqrt{3}`;
        questions.push(`正三角形邊長為 \\(${side}\\)。求內切圓半徑 \\(r\\)。`);
        answers.push(
          `簡答：\\(${rText}\\)。過程：正三角形高為 \\(\\frac{${side}\\sqrt3}{2}\\)，內心到邊距離是高的 \\(\\frac{1}{3}\\)，所以 \\(r=${rText}\\)。`
        );
      } else if (type === 'incenterAreaFromSideRatio') {
        const ratios = [
          [3, 6, 7],
          [5, 12, 13],
          [4, 5, 6],
          [5, 7, 9],
        ][randInt(0, 3)];
        const smallArea = randInt(3, 12);
        const totalArea = (smallArea * (ratios[0] + ratios[1] + ratios[2])) / ratios[0];
        questions.push(
          `若 \\(I\\) 為 \\(\\triangle ABC\\) 的內心，且 \\(AB:BC:CA=${ratios[0]}:${ratios[1]}:${ratios[2]}\\)。已知 \\(\\triangle AIB\\) 面積為 \\(${smallArea}\\)，求 \\(\\triangle ABC\\) 的總面積。`
        );
        answers.push(
          `簡答：\\(${formatFraction(smallArea * (ratios[0] + ratios[1] + ratios[2]), ratios[0])}\\)。過程：內心到三邊距離相同，所以 \\(\\triangle AIB:\\triangle BIC:\\triangle CIA=AB:BC:CA=${ratios[0]}:${ratios[1]}:${ratios[2]}\\)。因此總面積為 \\(${smallArea}\\times\\frac{${ratios[0] + ratios[1] + ratios[2]}}{${ratios[0]}}=${formatFraction(smallArea * (ratios[0] + ratios[1] + ratios[2]), ratios[0])}\\)。`
        );
      } else if (type === 'axisTriangleIncenterArea') {
        const [a, b, c] = pickTriple();
        const r = (a + b - c) / 2;
        const areaTwice = a * b - r * (a + b);
        questions.push(
          `坐標平面上，\\(A(${a},0)\\)、\\(B(0,${b})\\)、\\(O(0,0)\\) 構成直角三角形。若 \\(I\\) 為內心，求 \\(\\triangle AIB\\) 的面積。`
        );
        answers.push(
          `簡答：\\(${formatFraction(areaTwice, 2)}\\)。過程：內心為 \\((r,r)\\)，其中 \\(r=\\frac{${a}+${b}-${c}}{2}=${r}\\)。用坐標面積公式，\\(\\triangle AIB\\) 面積 \\(=\\frac{${a}\\times${b}-${r}(${a}+${b})}{2}=${formatFraction(areaTwice, 2)}\\)。`
        );
      } else if (type === 'centroidMedianLength') {
        const median = 3 * randInt(4, 12);
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(AD\\) 為中線，\\(G\\) 為重心。若 \\(AD=${median}\\)，求 \\(AG\\) 與 \\(GD\\)。`
        );
        answers.push(
          `簡答：\\(AG=${(2 * median) / 3}\\)，\\(GD=${median / 3}\\)。過程：重心把中線分成 \\(AG:GD=2:1\\)，所以 \\(AG=\\frac{2}{3}AD=${(2 * median) / 3}\\)，\\(GD=\\frac{1}{3}AD=${median / 3}\\)。`
        );
      } else if (type === 'centroidMedianInverse') {
        const gd = randInt(2, 9);
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(AD\\) 為中線，\\(G\\) 為重心。若 \\(GD=${gd}\\)，求 \\(AD\\) 與 \\(AG\\)。`
        );
        answers.push(
          `簡答：\\(AD=${3 * gd}\\)，\\(AG=${2 * gd}\\)。過程：重心分中線為 \\(2:1\\)，且 \\(GD\\) 是較短段，所以 \\(AD=3GD=${3 * gd}\\)，\\(AG=2GD=${2 * gd}\\)。`
        );
      } else if (type === 'centroidCoordinate') {
        const x1 = randInt(-6, 8);
        const y1 = randInt(-6, 8);
        const x2 = randInt(-6, 8);
        const y2 = randInt(-6, 8);
        const x3 = randInt(-6, 8);
        const y3 = randInt(-6, 8);
        const gxText = formatFraction(x1 + x2 + x3, 3);
        const gyText = formatFraction(y1 + y2 + y3, 3);
        questions.push(
          `\\(\\triangle ABC\\) 的頂點為 \\(A(${x1},${y1})\\)、\\(B(${x2},${y2})\\)、\\(C(${x3},${y3})\\)。求重心 \\(G\\) 的坐標。`
        );
        answers.push(
          `簡答：\\(G(${gxText},${gyText})\\)。過程：重心坐標是三頂點坐標平均，\\(G=(\\frac{x_1+x_2+x_3}{3},\\frac{y_1+y_2+y_3}{3})=(${gxText},${gyText})\\)。`
        );
      } else if (type === 'missingVertexFromCentroid') {
        const x1 = randInt(-4, 6);
        const y1 = randInt(-4, 6);
        const x2 = randInt(-4, 6);
        const y2 = randInt(-4, 6);
        const gx = randInt(-3, 5);
        const gy = randInt(-3, 5);
        const x3 = 3 * gx - x1 - x2;
        const y3 = 3 * gy - y1 - y2;
        questions.push(
          `已知 \\(\\triangle ABC\\) 的重心為 \\(G(${gx},${gy})\\)，且 \\(A(${x1},${y1})\\)、\\(B(${x2},${y2})\\)。若第三頂點為 \\(C(x,y)\\)，求 \\(C\\) 的坐標。`
        );
        answers.push(
          `簡答：\\(C(${x3},${y3})\\)。過程：重心為平均值，所以 \\(\\frac{x_A+x_B+x}{3}=${gx}\\)、\\(\\frac{y_A+y_B+y}{3}=${gy}\\)，解得 \\(C(${x3},${y3})\\)。`
        );
      } else if (type === 'centroidAreaSixth') {
        const area = 6 * randInt(6, 20);
        questions.push(
          `\\(G\\) 為 \\(\\triangle ABC\\) 的重心，三條中線把三角形分成六個小三角形。若 \\(\\triangle ABC\\) 面積為 \\(${area}\\)，求每一個小三角形面積。`
        );
        answers.push(
          `簡答：\\(${area / 6}\\)。過程：三條中線交於重心後，會把三角形分成六個等面積小三角形，所以每個面積為 \\(${area}\\div6=${area / 6}\\)。`
        );
      } else if (type === 'centroidAreaThird') {
        const area = 3 * randInt(12, 40);
        questions.push(
          `\\(G\\) 為 \\(\\triangle ABC\\) 的重心。求 \\(\\triangle GBC\\) 面積與 \\(\\triangle ABC\\) 面積的比；若 \\(\\triangle ABC\\) 面積為 \\(${area}\\)，求 \\(\\triangle GBC\\) 面積。`
        );
        answers.push(
          `簡答：面積比 \\(1:3\\)，\\(\\triangle GBC\\) 面積 \\(${area / 3}\\)。過程：重心連三頂點可把三角形分成三個等面積三角形，所以 \\(\\triangle GBC\\) 佔全圖 \\(\\frac13\\)。`
        );
      } else if (type === 'centroidMedianEquation') {
        const x = randInt(3, 9);
        const shortOffset = randInt(1, 4);
        const ge = x + shortOffset;
        const bg = 2 * ge;
        const constant = bg - 3 * x;
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(BE\\) 為中線，\\(G\\) 為重心。若 \\(GE=x+${shortOffset}\\)、\\(BG=3x${constant < 0 ? constant : `+${constant}`}\\)，求 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：重心分中線滿足 \\(BG:GE=2:1\\)，所以 \\(3x${constant < 0 ? constant : `+${constant}`}=2(x+${shortOffset})\\)，解得 \\(x=${x}\\)。`
        );
      } else if (type === 'centroidAreaFromOneSmall') {
        const smallArea = randInt(2, 12);
        questions.push(
          `\\(G\\) 為 \\(\\triangle ABC\\) 的重心，三條中線把三角形分成六個等面積小三角形。若其中一個小三角形面積為 \\(${smallArea}\\)，求 \\(\\triangle ABC\\) 的總面積。`
        );
        answers.push(
          `簡答：\\(${6 * smallArea}\\)。過程：三條中線交於重心後，會分成六個等面積小三角形，所以總面積為 \\(6\\times${smallArea}=${6 * smallArea}\\)。`
        );
      } else if (type === 'parallelogramHiddenCentroidLength') {
        const om = randInt(2, 10);
        questions.push(
          `平行四邊形 \\(ABCD\\) 中，\\(O\\) 為對角線交點，\\(E\\) 為 \\(BC\\) 的中點，\\(AE\\) 交 \\(BD\\) 於 \\(M\\)。若 \\(OM=${om}\\)，求 \\(BD\\) 的長度。`
        );
        answers.push(
          `簡答：\\(BD=${6 * om}\\)。過程：在 \\(\\triangle ABC\\) 中，\\(O\\) 是 \\(AC\\) 中點，\\(E\\) 是 \\(BC\\) 中點，所以 \\(BO\\) 與 \\(AE\\) 都是中線，交點 \\(M\\) 為重心。重心把中線 \\(BO\\) 分成 \\(BM:MO=2:1\\)，且 \\(O\\) 是 \\(BD\\) 中點，因此 \\(OM=\\frac16BD\\)，所以 \\(BD=6OM=${6 * om}\\)。`
        );
      } else if (type === 'parallelogramCentroidArea') {
        const area = 6 * randInt(8, 30);
        questions.push(
          `平行四邊形 \\(ABCD\\) 中，\\(O\\) 為對角線交點，\\(E\\) 為 \\(BC\\) 的中點，\\(AE\\) 交 \\(BD\\) 於 \\(M\\)。若平行四邊形 \\(ABCD\\) 面積為 \\(${area}\\)，求 \\(\\triangle ABM\\) 的面積。`
        );
        answers.push(
          `簡答：\\(${area / 6}\\)。過程：同上可知 \\(M\\) 是 \\(\\triangle ABC\\) 的重心，因此 \\(\\triangle ABM\\) 佔 \\(\\triangle ABC\\) 面積的 \\(\\frac13\\)。又 \\(\\triangle ABC\\) 是平行四邊形的一半，所以 \\(\\triangle ABM\\) 面積為 \\(${area}\\times\\frac12\\times\\frac13=${area / 6}\\)。`
        );
      } else if (type === 'centroidQuadrilateralToTotalArea') {
        const quadArea = randInt(6, 25);
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(G\\) 為重心，\\(D\\)、\\(E\\) 分別為 \\(AB\\)、\\(AC\\) 的中點。若四邊形 \\(ADGE\\) 面積為 \\(${quadArea}\\)，求 \\(\\triangle ABC\\) 的總面積。`
        );
        answers.push(
          `簡答：\\(${3 * quadArea}\\)。過程：三條中線會把 \\(\\triangle ABC\\) 分成六個等面積小三角形，四邊形 \\(ADGE\\) 由其中兩個小三角形組成，佔全圖 \\(\\frac13\\)。所以總面積為 \\(${quadArea}\\times3=${3 * quadArea}\\)。`
        );
      } else if (type === 'parallelogramTwoCentroidsDistance') {
        const bd = 3 * randInt(5, 14);
        questions.push(
          `平行四邊形 \\(ABCD\\) 中，\\(P\\)、\\(Q\\) 分別為 \\(\\triangle ABC\\) 與 \\(\\triangle ADC\\) 的重心。若 \\(BD=${bd}\\)，求 \\(PQ\\) 的長度。`
        );
        answers.push(
          `簡答：\\(PQ=${bd / 3}\\)。過程：設對角線交點為 \\(O\\)。兩個三角形的重心都落在與 \\(BD\\) 平行的重心連線上，且相對位置相差對角線 \\(BD\\) 的 \\(\\frac13\\)。因此 \\(PQ=\\frac13BD=\\frac13\\times${bd}=${bd / 3}\\)。`
        );
      } else if (type === 'parallelogramMidpointTriangleArea') {
        const smallArea = randInt(2, 12);
        questions.push(
          `平行四邊形 \\(ABCD\\) 的面積為 \\(S\\)。對角線交於 \\(O\\)，且 \\(E\\) 為 \\(BC\\) 的中點。若 \\(\\triangle ODE\\) 面積為 \\(${smallArea}\\)，求 \\(S\\)。`
        );
        answers.push(
          `簡答：\\(S=${12 * smallArea}\\)。過程：對角線交點與邊中點會切出固定比例的小三角形，\\(\\triangle ODE\\) 面積為平行四邊形面積的 \\(\\frac1{12}\\)。所以 \\(S=12\\times${smallArea}=${12 * smallArea}\\)。`
        );
      } else if (type === 'parallelogramCentroidSegmentEquation') {
        const x = randInt(1, 8);
        const offset = randInt(1, 5);
        const segment = x + offset;
        const diagonal = 3 * segment;
        questions.push(
          `平行四邊形的一條對角線被兩個相關三角形的重心分成三段等長。若其中一段長為 \\(x+${offset}\\)，且整條對角線長為 \\(${diagonal}\\)，求 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：兩個重心會把對角線分成三段等長，所以每段長為 \\(\\frac{${diagonal}}3=${segment}\\)。令 \\(x+${offset}=${segment}\\)，得 \\(x=${x}\\)。`
        );
      } else if (type === 'isoscelesAreaFromCentroidDistance') {
        const choices = [
          [8, 6, 10],
          [6, 8, 10],
          [5, 12, 13],
          [9, 12, 15],
        ];
        const [halfBase, height, equalSide] = choices[randInt(0, choices.length - 1)];
        const agText = formatFraction(2 * height, 3);
        const area = halfBase * height;
        questions.push(
          `等腰 \\(\\triangle ABC\\) 中，\\(AB=AC=${equalSide}\\)，\\(G\\) 為重心，且 \\(AG=${agText}\\)。求 \\(\\triangle ABC\\) 的面積。`
        );
        answers.push(
          `簡答：\\(${area}\\)。過程：等腰三角形從頂點 \\(A\\) 到底邊的高也是中線，重心滿足 \\(AG=\\frac23h\\)，所以高 \\(h=\\frac32\\times${agText}=${height}\\)。由 \\(${equalSide}^2=${height}^2+\\text{半底}^2\\)，半底為 \\(${halfBase}\\)，底邊為 \\(${2 * halfBase}\\)。面積 \\(=\\frac12\\times${2 * halfBase}\\times${height}=${area}\\)。`
        );
      } else if (type === 'rightTriangleCircumcenterCoordinate') {
        const a = 2 * randInt(2, 8);
        const b = 2 * randInt(2, 8);
        questions.push(
          `座標平面上，直角三角形三頂點為 \\((0,0)\\)、\\((${a},0)\\)、\\((0,${b})\\)。求外心 \\(O\\) 坐標與外接圓半徑平方。`
        );
        answers.push(
          `簡答：\\(O(${a / 2},${b / 2})\\)，\\(R^2=${(a * a + b * b) / 4}\\)。過程：直角三角形外心是斜邊中點，所以 \\(O(${a / 2},${b / 2})\\)。半徑平方為 \\((\\frac{${a}}2)^2+(\\frac{${b}}2)^2=${(a * a + b * b) / 4}\\)。`
        );
      } else if (type === 'threePointCentroidCoordinate') {
        const x1 = randInt(-5, 5);
        const y1 = randInt(-5, 5);
        const x2 = randInt(-5, 5);
        const y2 = randInt(-5, 5);
        const x3 = randInt(-5, 5);
        const y3 = randInt(-5, 5);
        questions.push(
          `三點 \\(A(${x1},${y1})\\)、\\(B(${x2},${y2})\\)、\\(C(${x3},${y3})\\) 構成三角形。求重心坐標。`
        );
        answers.push(
          `簡答：\\(G(${formatFraction(x1 + x2 + x3, 3)},${formatFraction(y1 + y2 + y3, 3)})\\)。過程：重心為三點坐標平均，直接代入平均公式。`
        );
      } else if (type === 'axisTriangleIncenter') {
        const a = randInt(3, 10);
        const b = randInt(3, 10);
        questions.push(
          `直線 \\(\\frac{x}{${a}}+\\frac{y}{${b}}=1\\) 與兩坐標軸圍成直角三角形。若其內心在第一象限，求內心坐標的表示方式。`
        );
        answers.push(
          `簡答：\\((r,r)\\)，其中 \\(r=\\frac{${a}+${b}-\\sqrt{${a * a + b * b}}}{2}\\)。過程：兩股在坐標軸上，所以內心到兩軸距離都等於內切圓半徑 \\(r\\)，坐標為 \\((r,r)\\)。直角三角形內切圓半徑 \\(r=\\frac{a+b-c}{2}\\)。`
        );
      } else if (type === 'rightTriangleOGDistance') {
        const [a, b, c] = pickTriple();
        questions.push(
          `直角三角形兩股為 \\(${a}\\)、\\(${b}\\)，斜邊為 \\(${c}\\)。求外心 \\(O\\) 與重心 \\(G\\) 的距離 \\(OG\\)。`
        );
        answers.push(
          `簡答：\\(OG=${formatFraction(c, 6)}\\)。過程：直角三角形外心在斜邊中點，重心在斜邊中線上，且 \\(GO=\\frac{1}{3}\\) 斜邊中線。斜邊中線為 \\(\\frac{c}{2}\\)，所以 \\(OG=\\frac{c}{6}=${formatFraction(c, 6)}\\)。`
        );
      } else if (type === 'circumcenterPointCheck') {
        const r = randInt(3, 8);
        const x = [r, 0, -r, 3, 4][i % 5];
        const y = x === 3 && r === 5 ? 4 : x === 4 && r === 5 ? 3 : 0;
        const distanceSquared = x * x + y * y;
        const isOn = distanceSquared === r * r;
        questions.push(
          `圓心在原點、半徑為 \\(${r}\\) 的圓。判斷點 \\(P(${x},${y})\\) 是否可作為某個內接三角形的頂點。`
        );
        answers.push(
          `簡答：${isOn ? '可以' : '不一定，因為不在此圓上'}。過程：內接三角形頂點必在外接圓上。計算 \\(OP^2=${distanceSquared}\\)，而 \\(r^2=${r * r}\\)。${isOn ? '兩者相等，所以可以。' : '兩者不相等，所以不能直接作為此圓上的頂點。'}`
        );
      } else if (type === 'circumcenterCoordinateGeneral') {
        const h = randInt(-4, 5);
        const k = randInt(-4, 5);
        const r = randInt(3, 9);
        questions.push(
          `座標平面上，三角形三頂點為 \\(A(${h - r},${k})\\)、\\(B(${h + r},${k})\\)、\\(C(${h},${k + r})\\)。求外心坐標與外接圓面積。`
        );
        answers.push(
          `簡答：外心 \\(O(${h},${k})\\)，外接圓面積 \\(${piTerm(r * r)}\\)。過程：三點都到 \\(O(${h},${k})\\) 距離 \\(${r}\\)，所以 \\(O\\) 為外心，外接圓半徑為 \\(${r}\\)，面積為 \\(${piTerm(r * r)}\\)。`
        );
      } else if (type === 'rightTriangleCoordinateOG') {
        const [base, height, hypotenuse] = pickTriple();
        const a = 2 * base;
        const b = 2 * height;
        const c = 2 * hypotenuse;
        questions.push(
          `座標平面上，直角三角形三頂點為 \\((0,0)\\)、\\((${a},0)\\)、\\((0,${b})\\)。求外心 \\(O\\)、重心 \\(G\\) 的坐標，以及 \\(OG\\) 的長度。`
        );
        answers.push(
          `簡答：\\(O(${a / 2},${b / 2})\\)，\\(G(${formatFraction(a, 3)},${formatFraction(b, 3)})\\)，\\(OG=${formatFraction(c, 6)}\\)。過程：直角三角形外心是斜邊中點，重心是三頂點坐標平均。也可用性質 \\(OG=\\frac16\\) 斜邊，斜邊為 \\(${c}\\)，所以 \\(OG=${formatFraction(c, 6)}\\)。`
        );
      } else if (type === 'eulerLineOrthocenterCoordinate') {
        const ox = randInt(-4, 4);
        const oy = randInt(-4, 4);
        const gx = randInt(-3, 5);
        const gy = randInt(-3, 5);
        const hx = 3 * gx - 2 * ox;
        const hy = 3 * gy - 2 * oy;
        questions.push(
          `在座標平面上，\\(O(${ox},${oy})\\) 為某三角形的外心，\\(G(${gx},${gy})\\) 為重心。若外心、重心、垂心共線且 \\(HG:GO=2:1\\)，求垂心 \\(H\\) 的坐標。`
        );
        answers.push(
          `簡答：\\(H(${hx},${hy})\\)。過程：尤拉線上 \\(G\\) 把 \\(HO\\) 分成 \\(HG:GO=2:1\\)，所以 \\(G=\\frac{H+2O}{3}\\)。因此 \\(H=3G-2O=(${3 * gx},${3 * gy})-(${2 * ox},${2 * oy})=(${hx},${hy})\\)。`
        );
      } else if (type === 'equilateralRadiiRatio') {
        questions.push(`正三角形的外接圓半徑為 \\(R\\)，內切圓半徑為 \\(r\\)。求 \\(R:r\\)。`);
        answers.push(
          `簡答：\\(R:r=2:1\\)。過程：正三角形三心合一，重心到頂點為高的 \\(\\frac23\\)，到邊為高的 \\(\\frac13\\)，因此 \\(R:r=\\frac23:\\frac13=2:1\\)。`
        );
      } else if (type === 'equilateralAreaFromInradius') {
        const r = randInt(2, 8);
        const areaCoeff = 3 * r * r;
        questions.push(`正三角形的內切圓半徑為 \\(${r}\\)。求此正三角形面積。`);
        answers.push(
          `簡答：\\(${areaCoeff}\\sqrt3\\)。過程：正三角形邊長 \\(a=2\\sqrt3 r=2\\sqrt3\\times${r}\\)。面積 \\(=\\frac{\\sqrt3}{4}a^2=${areaCoeff}\\sqrt3\\)。`
        );
      } else if (type === 'equilateralAreaFromCircumradius') {
        const radius = 2 * randInt(2, 8);
        const areaCoeff = (3 * radius * radius) / 4;
        questions.push(`正三角形的外接圓半徑為 \\(${radius}\\)。求此正三角形面積。`);
        answers.push(
          `簡答：\\(${areaCoeff}\\sqrt3\\)。過程：正三角形外接圓半徑 \\(R=\\frac{a}{\\sqrt3}\\)，所以 \\(a=${radius}\\sqrt3\\)。面積 \\(=\\frac{\\sqrt3}{4}a^2=${areaCoeff}\\sqrt3\\)。`
        );
      } else if (type === 'rightTriangleGO') {
        const [a, b, c] = pickTriple();
        questions.push(`直角三角形兩股為 \\(${a}\\)、\\(${b}\\)。求外心到重心的距離 \\(OG\\)。`);
        answers.push(
          `簡答：\\(OG=${formatFraction(c, 6)}\\)。過程：斜邊為 \\(${c}\\)，外心在斜邊中點。重心到外心距離為斜邊的 \\(\\frac16\\)，所以 \\(OG=${formatFraction(c, 6)}\\)。`
        );
      } else if (type === 'rightTriangleRrPerimeter') {
        const [a, b, c] = pickTriple();
        const r = (a + b - c) / 2;
        const perimeter = a + b + c;
        questions.push(
          `直角三角形兩股為 \\(${a}\\)、\\(${b}\\)、斜邊為 \\(${c}\\)。求外接圓半徑 \\(R\\)、內切圓半徑 \\(r\\) 與周長。`
        );
        answers.push(
          `簡答：\\(R=${formatFraction(c, 2)}\\)，\\(r=${formatFraction(a + b - c, 2)}\\)，周長 \\(${perimeter}\\)。過程：直角三角形 \\(R=\\frac{c}{2}\\)，\\(r=\\frac{a+b-c}{2}\\)，周長為三邊和。`
        );
      } else if (type === 'rightTriangleHypotenuseFromOG') {
        const og = randInt(2, 10);
        questions.push(`直角三角形中，\\(O\\) 為外心，\\(G\\) 為重心。若 \\(OG=${og}\\)，求斜邊長與外接圓面積。`);
        answers.push(
          `簡答：斜邊長 \\(${6 * og}\\)，外接圓面積 \\(${piTerm(9 * og * og)}\\)。過程：直角三角形中 \\(OG=\\frac16\\) 斜邊，所以斜邊長為 \\(6\\times${og}=${6 * og}\\)。外接圓半徑為斜邊一半 \\(R=${3 * og}\\)，面積為 \\(\\pi R^2=${piTerm(9 * og * og)}\\)。`
        );
      } else if (type === 'rightTrianglePerimeterFromRr') {
        const radius = randInt(4, 12);
        const inradius = randInt(1, radius - 1);
        questions.push(
          `直角三角形的外接圓半徑為 \\(R=${radius}\\)，內切圓半徑為 \\(r=${inradius}\\)。求此直角三角形的周長。`
        );
        answers.push(
          `簡答：\\(${4 * radius + 2 * inradius}\\)。過程：直角三角形斜邊 \\(c=2R\\)，且 \\(r=\\frac{a+b-c}{2}\\)，所以 \\(a+b=c+2r=2R+2r\\)。周長 \\(P=a+b+c=4R+2r=4\\times${radius}+2\\times${inradius}=${4 * radius + 2 * inradius}\\)。`
        );
      } else if (type === 'equilateralHeightFromCircumradius') {
        const radius = 2 * randInt(2, 9);
        questions.push(`正三角形的外接圓半徑為 \\(${radius}\\)。求此正三角形的高。`);
        answers.push(
          `簡答：\\(${(3 * radius) / 2}\\)。過程：正三角形三心合一，外心到頂點距離是高的 \\(\\frac23\\)，所以 \\(R=\\frac23h\\)，\\(h=\\frac32R=\\frac32\\times${radius}=${(3 * radius) / 2}\\)。`
        );
      } else if (type === 'equilateralIncircleCircumcircleAreaRatio') {
        const scale = randInt(2, 9);
        questions.push(
          `正三角形的內切圓半徑為 \\(${scale}\\)，外接圓半徑為 \\(${2 * scale}\\)。求內切圓面積與外接圓面積的比。`
        );
        answers.push(
          `簡答：\\(1:4\\)。過程：正三角形中 \\(R:r=2:1\\)。圓面積比等於半徑平方比，所以內切圓面積：外接圓面積 \\(=r^2:R^2=1^2:2^2=1:4\\)。`
        );
      } else if (type === 'centroidToVertexSum') {
        const totalMedian = 3 * randInt(9, 20);
        questions.push(`已知三角形三條中線長度總和為 \\(${totalMedian}\\)。求重心到三個頂點距離和 \\(AG+BG+CG\\)。`);
        answers.push(
          `簡答：\\(${(2 * totalMedian) / 3}\\)。過程：重心到頂點距離為該中線長的 \\(\\frac23\\)，所以三個距離和也是三條中線長度和的 \\(\\frac23\\)，即 \\(${totalMedian}\\times\\frac23=${(2 * totalMedian) / 3}\\)。`
        );
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
      'j5-1-1-ratio-conversion-five-subtypes': {
        type: 'drill',
        title: '連比合併與格式轉換綜合',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ511RatioConversionMixedSet(6);
        },
      },
      'j5-1-1-merge-shared-term': {
        type: 'drill',
        title: '共同項合併成三項連比',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ511MergeSharedTermSet(5);
        },
      },
      'j5-1-1-equation-to-ratio': {
        type: 'drill',
        title: '乘積等式轉連比',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ511EquationToRatioSet(5);
        },
      },
      'j5-1-1-fraction-form-ratio': {
        type: 'drill',
        title: '分式等式轉連比',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ511FractionFormRatioSet(5);
        },
      },
      'j5-1-1-reciprocal-ratio': {
        type: 'drill',
        title: '倒數連比與最簡整數比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ511ReciprocalRatioSet(5);
        },
      },
      'j5-1-1-fraction-statement-ratio': {
        type: 'drill',
        title: '文字分數條件轉連比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ511FractionStatementRatioSet(5);
        },
      },
      'j5-1-1-ratio-algebra-three-subtypes': {
        type: 'drill',
        title: '參數法、式子變換與平移比例綜合',
        difficulty: 'medium',
        questionCount: 8,
        generate() {
          return buildJ511RatioAlgebraMixedSet(8);
        },
      },
      'j5-1-1-parametric-linear-equation': {
        type: 'drill',
        title: '連比參數法解一次式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ511ParametricLinearEquationSet(5);
        },
      },
      'j5-1-1-ratio-expression-transform': {
        type: 'drill',
        title: '連比代數式比例化簡',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ511RatioExpressionTransformSet(5);
        },
      },
      'j5-1-1-reverse-value-from-ratio': {
        type: 'drill',
        title: '已知總量反求各部分',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ511ReverseValueFromRatioSet(5);
        },
      },
      'j5-1-1-shifted-variable-ratio': {
        type: 'drill',
        title: '變數平移與比例式求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ511ShiftedVariableRatioSet(5);
        },
      },
      'j5-1-1-geometry-ratio-three-subtypes': {
        type: 'drill',
        title: '三角形與幾何量的連比應用',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ511GeometryRatioMixedSet(6);
        },
      },
      'j5-1-1-triangle-angle-ratio': {
        type: 'drill',
        title: '三角形內角連比',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ511TriangleAngleRatioSet(5);
        },
      },
      'j5-1-1-triangle-side-height-ratio': {
        type: 'drill',
        title: '三角形邊長與高的反比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ511TriangleSideHeightRatioSet(5);
        },
      },
      'j5-1-1-geometry-perimeter-area': {
        type: 'drill',
        title: '幾何周長面積體積連比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ511GeometryPerimeterAreaSet(5);
        },
      },
      'j5-1-1-life-ratio-five-subtypes': {
        type: 'drill',
        title: '生活情境中的連比分配、反比與混合',
        difficulty: 'medium',
        questionCount: 8,
        generate() {
          return buildJ511LifeRatioMixedSet(8);
        },
      },
      'j5-1-1-money-profit-sharing': {
        type: 'drill',
        title: '金錢與利潤分配',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ511MoneyProfitSharingSet(5);
        },
      },
      'j5-1-1-mixture-ratio': {
        type: 'drill',
        title: '混合物與濃度配比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ511MixtureRatioSet(5);
        },
      },
      'j5-1-1-population-ratio-change': {
        type: 'drill',
        title: '人數比例變動',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ511PopulationRatioChangeSet(5);
        },
      },
      'j5-1-1-work-rate-speed': {
        type: 'drill',
        title: '工作效率與速率反比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ511WorkRateSpeedSet(5);
        },
      },
      'j5-1-1-work-efficiency-applied': {
        type: 'drill',
        title: '工程效率問題',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ511WorkEfficiencyAppliedSet(5);
        },
      },
      'j5-1-1-coin-denomination-ratio': {
        type: 'drill',
        title: '錢幣枚數與總金額',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ511CoinDenominationRatioSet(5);
        },
      },
      'j5-1-1-mixture-shared-term': {
        type: 'drill',
        title: '混合物成分比例連鎖推導',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ511MixtureSharedTermSet(5);
        },
      },
      'j5-1-2-triangle-parallel-five-subtypes': {
        type: 'drill',
        title: '三角形平行截線與中點連線綜合',
        difficulty: 'medium',
        questionCount: 8,
        generate() {
          return buildJ512Set('triangleMixed', 8);
        },
      },
      'j5-1-2-parallel-core-five-subtypes': {
        type: 'drill',
        title: '平行線截比例線段五小類綜合',
        difficulty: 'medium',
        questionCount: 10,
        generate() {
          return buildJ512Set('parallelMixed', 10);
        },
      },
      'j5-1-2-triangle-parallel-proportional-segments': {
        type: 'drill',
        title: '三角形平行截線比例運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ512Set('triangleFullProportion', 5);
        },
      },
      'j5-1-2-triangle-parallel-side-ratio': {
        type: 'drill',
        title: '三角形截線邊段比',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ512Set('triangleSide', 5);
        },
      },
      'j5-1-2-triangle-parallel-segment-length': {
        type: 'drill',
        title: '三角形截線求線段長',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ512Set('triangleSegment', 5);
        },
      },
      'j5-1-2-triangle-parallel-algebra': {
        type: 'drill',
        title: '三角形截線代數求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ512Set('triangleAlgebra', 5);
        },
      },
      'j5-1-2-triangle-parallel-converse': {
        type: 'drill',
        title: '平行截線逆定理判斷',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ512Set('triangleConverse', 5);
        },
      },
      'j5-1-2-midpoint-segment': {
        type: 'drill',
        title: '三角形中點連線',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ512Set('midpoint', 5);
        },
      },
      'j5-1-2-trapezoid-parallel-three-subtypes': {
        type: 'drill',
        title: '梯形與多平行線三小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ512Set('trapezoidMixed', 6);
        },
      },
      'j5-1-2-trapezoid-parallel-segment': {
        type: 'drill',
        title: '梯形側邊分點截線',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ512Set('trapezoidWeighted', 5);
        },
      },
      'j5-1-2-trapezoid-midline': {
        type: 'drill',
        title: '梯形中線長度',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ512Set('trapezoidMidline', 5);
        },
      },
      'j5-1-2-multi-parallel-intercepts': {
        type: 'drill',
        title: '多條平行線截比例',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ512Set('multiParallel', 5);
        },
      },
      'j5-1-3-similarity-criteria-five-subtypes': {
        type: 'drill',
        title: '相似判別與基本比例五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ513Set('criteriaMixed', 6);
        },
      },
      'j5-1-3-aa-criterion': {
        type: 'drill',
        title: 'AA 相似判別',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ513Set('aaCriterion', 5);
        },
      },
      'j5-1-3-sss-criterion': {
        type: 'drill',
        title: 'SSS 相似判別',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ513Set('sssCriterion', 5);
        },
      },
      'j5-1-3-sas-criterion': {
        type: 'drill',
        title: 'SAS 相似判別',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('sasCriterion', 5);
        },
      },
      'j5-1-3-parallel-basic-length': {
        type: 'drill',
        title: '平行線小大三角形求長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('parallelBasic', 5);
        },
      },
      'j5-1-3-butterfly-parallel-length': {
        type: 'drill',
        title: '蝴蝶形平行線比例',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('butterflyBasic', 5);
        },
      },
      'j5-1-3-ratio-area-four-subtypes': {
        type: 'drill',
        title: '相似三角形線段、周長與面積比綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ513Set('ratioMixed', 6);
        },
      },
      'j5-1-3-corresponding-elements': {
        type: 'drill',
        title: '對應高、中線、角平分線長度比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('correspondingElement', 5);
        },
      },
      'j5-1-3-area-to-side-perimeter': {
        type: 'drill',
        title: '由面積比反推邊長與周長比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('areaToSide', 5);
        },
      },
      'j5-1-3-area-from-side-ratio': {
        type: 'drill',
        title: '由邊長比求面積比與面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('areaFromSide', 5);
        },
      },
      'j5-1-3-scale-area-change': {
        type: 'drill',
        title: '縮放後面積倍率',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('scaleArea', 5);
        },
      },
      'j5-1-3-scaling-five-subtypes': {
        type: 'drill',
        title: '圖形縮放與等率運算綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ513Set('scalingMixed', 6);
        },
      },
      'j5-1-3-figure-scale-length': {
        type: 'drill',
        title: '等比例縮放求邊長',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ513Set('figureScaleLength', 5);
        },
      },
      'j5-1-3-scale-back-length': {
        type: 'drill',
        title: '縮放後反求原邊長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('scaleBackLength', 5);
        },
      },
      'j5-1-3-area-scale-factor': {
        type: 'drill',
        title: '縮放倍率與面積倍率',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ513Set('areaScaleFactor', 5);
        },
      },
      'j5-1-3-angle-invariant-scale': {
        type: 'drill',
        title: '相似縮放角度不變',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ513Set('angleInvariant', 5);
        },
      },
      'j5-1-3-butterfly-three-subtypes': {
        type: 'drill',
        title: '蝴蝶形與平行線相似比例綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ513Set('butterflyMixed', 6);
        },
      },
      'j5-1-3-butterfly-area-ratio': {
        type: 'drill',
        title: '蝴蝶形相似面積比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('butterflyAreaRatio', 5);
        },
      },
      'j5-1-3-butterfly-segment-ratio': {
        type: 'drill',
        title: '蝴蝶形交點線段比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('butterflySegmentRatio', 5);
        },
      },
      'j5-1-3-right-altitude-three-subtypes': {
        type: 'drill',
        title: '直角三角形母子相似三小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ513Set('rightMixed', 6);
        },
      },
      'j5-1-3-right-altitude': {
        type: 'drill',
        title: '斜邊高平方公式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('rightAltitude', 5);
        },
      },
      'j5-1-3-right-legs-from-projections': {
        type: 'drill',
        title: '由斜邊投影求兩股',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('rightLegs', 5);
        },
      },
      'j5-1-3-right-projection-unknown': {
        type: 'drill',
        title: '斜邊高與投影段求未知數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('rightProjection', 5);
        },
      },
      'j5-1-3-measurement-four-subtypes': {
        type: 'drill',
        title: '相似測量與投影四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ513Set('measurementMixed', 6);
        },
      },
      'j5-1-3-shadow-measurement': {
        type: 'drill',
        title: '影子法測高',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ513Set('shadowMeasure', 5);
        },
      },
      'j5-1-3-mirror-measurement': {
        type: 'drill',
        title: '鏡面反射測高',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('mirrorMeasure', 5);
        },
      },
      'j5-1-3-pinhole-projection': {
        type: 'drill',
        title: '針孔成像比例',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('pinholeMeasure', 5);
        },
      },
      'j5-1-3-river-width-measurement': {
        type: 'drill',
        title: '河寬測量相似三角形',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ513Set('riverMeasure', 5);
        },
      },
      'j5-1-4-measurement-five-subtypes': {
        type: 'drill',
        title: '簡易測量與投影五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ514Set('measurementMixed', 6);
        },
      },
      'j5-1-4-shadow-height': {
        type: 'drill',
        title: '影子法測高',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ514Set('shadowHeight', 5);
        },
      },
      'j5-1-4-standard-pole-height': {
        type: 'drill',
        title: '標竿視線法測高',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ514Set('standardPole', 5);
        },
      },
      'j5-1-4-mirror-height': {
        type: 'drill',
        title: '鏡面反射測高',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ514Set('mirrorHeight', 5);
        },
      },
      'j5-1-4-pinhole-image': {
        type: 'drill',
        title: '針孔成像像高',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ514Set('pinholeImage', 5);
        },
      },
      'j5-1-4-river-width': {
        type: 'drill',
        title: '視線對齊測河寬',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ514Set('riverWidth', 5);
        },
      },
      'j5-1-4-ratio-area-four-subtypes': {
        type: 'drill',
        title: '相似圖形周長與面積比例四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ514Set('ratioMixed', 6);
        },
      },
      'j5-1-4-perimeter-side': {
        type: 'drill',
        title: '由周長比求對應邊',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ514Set('perimeterSide', 5);
        },
      },
      'j5-1-4-area-to-length': {
        type: 'drill',
        title: '由面積比反推線段長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ514Set('areaToLength', 5);
        },
      },
      'j5-1-4-parallel-area-split': {
        type: 'drill',
        title: '平行線分割面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ514Set('parallelAreaSplit', 5);
        },
      },
      'j5-1-4-scale-area': {
        type: 'drill',
        title: '相似放大面積比',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ514Set('scaleArea', 5);
        },
      },
      'j5-1-4-right-midpoint-four-subtypes': {
        type: 'drill',
        title: '直角母子相似與中點分割四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ514Set('rightMidMixed', 6);
        },
      },
      'j5-1-4-right-altitude': {
        type: 'drill',
        title: '斜邊高平方公式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ514Set('rightAltitude', 5);
        },
      },
      'j5-1-4-right-legs': {
        type: 'drill',
        title: '由斜邊投影求兩股',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ514Set('rightLegs', 5);
        },
      },
      'j5-1-4-midpoint-triangle-area': {
        type: 'drill',
        title: '中點三角形面積',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ514Set('midpointTriangleArea', 5);
        },
      },
      'j5-1-4-midpoint-quadrilateral': {
        type: 'drill',
        title: '四邊形中點平行四邊形面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ514Set('midpointQuadrilateral', 5);
        },
      },
      'j5-1-4-trig-basic-four-subtypes': {
        type: 'drill',
        title: '基本三角比四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ514Set('trigBasicMixed', 6);
        },
      },
      'j5-1-4-trig-from-sides': {
        type: 'drill',
        title: '由三邊求 sin、cos、tan',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ514Set('trigFromSides', 5);
        },
      },
      'j5-1-4-side-from-trig': {
        type: 'drill',
        title: '由三角比求邊長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ514Set('sideFromTrig', 5);
        },
      },
      'j5-1-4-special-angle': {
        type: 'drill',
        title: '特殊角邊長比例',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ514Set('specialAngle', 5);
        },
      },
      'j5-1-4-min-angle-cos': {
        type: 'drill',
        title: '最小銳角 cos 值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ514Set('minAngleCos', 5);
        },
      },
      'j5-1-4-trig-application-four-subtypes': {
        type: 'drill',
        title: '坡度與三角比應用四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ514Set('trigAppMixed', 6);
        },
      },
      'j5-1-4-slope-percent': {
        type: 'drill',
        title: '坡度百分比換算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ514Set('slopePercent', 5);
        },
      },
      'j5-1-4-ladder-angle': {
        type: 'drill',
        title: '梯子仰角求高度',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ514Set('ladderAngle', 5);
        },
      },
      'j5-1-4-trig-area': {
        type: 'drill',
        title: 'tan 與直角三角形面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ514Set('trigArea', 5);
        },
      },
      'j5-1-4-similar-trig-transfer': {
        type: 'drill',
        title: '相似三角形三角比轉移',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ514Set('similarTrigTransfer', 5);
        },
      },
      'j5-2-1-point-line-circle-three-subtypes': {
        type: 'drill',
        title: '點、直線與圓位置三小類綜合',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ521Set('positionMixed', 6);
        },
      },
      'j5-2-1-point-circle-position': {
        type: 'drill',
        title: '點與圓的位置判斷',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ521Set('pointCirclePosition', 5);
        },
      },
      'j5-2-1-line-circle-position': {
        type: 'drill',
        title: '直線與圓的位置判斷',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ521Set('lineCirclePosition', 5);
        },
      },
      'j5-2-1-tangent-length-from-point': {
        type: 'drill',
        title: '圓外一點切線長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ521Set('tangentLength', 5);
        },
      },
      'j5-2-1-chord-distance-four-subtypes': {
        type: 'drill',
        title: '弦、弦心距與半徑四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ521Set('chordMixed', 6);
        },
      },
      'j5-2-1-chord-center-distance': {
        type: 'drill',
        title: '已知半徑與弦求弦心距',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ521Set('chordDistance', 5);
        },
      },
      'j5-2-1-chord-length': {
        type: 'drill',
        title: '已知半徑與弦心距求弦長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ521Set('chordLength', 5);
        },
      },
      'j5-2-1-radius-from-chord': {
        type: 'drill',
        title: '已知弦與弦心距求半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ521Set('radiusFromChord', 5);
        },
      },
      'j5-2-1-concentric-annulus': {
        type: 'drill',
        title: '同心圓弦切小圓面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ521Set('concentricAnnulus', 5);
        },
      },
      'j5-2-1-two-circle-tangent-four-subtypes': {
        type: 'drill',
        title: '兩圓位置與公切線四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ521Set('twoCircleMixed', 6);
        },
      },
      'j5-2-1-two-circle-position': {
        type: 'drill',
        title: '兩圓位置關係判斷',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ521Set('twoCirclePosition', 5);
        },
      },
      'j5-2-1-radii-from-tangencies': {
        type: 'drill',
        title: '由外切內切連心線求半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ521Set('radiiFromTangencies', 5);
        },
      },
      'j5-2-1-external-common-tangent': {
        type: 'drill',
        title: '外公切線長度',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ521Set('externalCommonTangent', 5);
        },
      },
      'j5-2-1-internal-common-tangent': {
        type: 'drill',
        title: '內公切線長度',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ521Set('internalCommonTangent', 5);
        },
      },
      'j5-2-1-tangent-polygon-three-subtypes': {
        type: 'drill',
        title: '切線段與圓外切四邊形三小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ521Set('tangentPolygonMixed', 6);
        },
      },
      'j5-2-1-tangent-segments': {
        type: 'drill',
        title: '同一外點兩切線段相等',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ521Set('tangentSegments', 5);
        },
      },
      'j5-2-1-circumscribed-quadrilateral': {
        type: 'drill',
        title: '圓外切四邊形求邊長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ521Set('circumscribedQuadrilateral', 5);
        },
      },
      'j5-2-1-tangent-quad-perimeter': {
        type: 'drill',
        title: '圓外切四邊形求周長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ521Set('tangentQuadPerimeter', 5);
        },
      },
      'j5-2-1-coordinate-circle-five-subtypes': {
        type: 'drill',
        title: '坐標平面上的圓五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ521Set('coordinateMixed', 6);
        },
      },
      'j5-2-1-diameter-endpoint-circle': {
        type: 'drill',
        title: '直徑端點求圓心半徑',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ521Set('diameterEndpointCircle', 5);
        },
      },
      'j5-2-1-axis-line-circle-relation': {
        type: 'drill',
        title: '坐標軸平行線與圓位置',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ521Set('axisLineCircleRelation', 5);
        },
      },
      'j5-2-1-coordinate-point-position': {
        type: 'drill',
        title: '坐標點與圓位置判斷',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ521Set('coordinatePointPosition', 5);
        },
      },
      'j5-2-1-coordinate-tangent-radius': {
        type: 'drill',
        title: '坐標點到圓切線長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ521Set('coordinateTangentRadius', 5);
        },
      },
      'j5-2-1-point-distance-to-circle': {
        type: 'drill',
        title: '點到圓周最短最長距離',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ521Set('pointDistanceToCircle', 5);
        },
      },
      'j5-2-2-central-arc-sector-four-subtypes': {
        type: 'drill',
        title: '圓心角、弧長與扇形四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ522Set('centralMixed', 6);
        },
      },
      'j5-2-2-central-arc-degree': {
        type: 'drill',
        title: '圓心角與弧度數換算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ522Set('centralArcDegree', 5);
        },
      },
      'j5-2-2-arc-length-from-angle': {
        type: 'drill',
        title: '由半徑與圓心角求弧長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('arcLengthFromAngle', 5);
        },
      },
      'j5-2-2-angle-from-arc-length': {
        type: 'drill',
        title: '由弧長與半徑求圓心角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('angleFromArcLength', 5);
        },
      },
      'j5-2-2-sector-area': {
        type: 'drill',
        title: '扇形面積計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('sectorArea', 5);
        },
      },
      'j5-2-2-inscribed-angle-five-subtypes': {
        type: 'drill',
        title: '圓周角與弦切角五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ522Set('inscribedMixed', 6);
        },
      },
      'j5-2-2-inscribed-angle-from-arc': {
        type: 'drill',
        title: '由弧度數求圓周角',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ522Set('inscribedAngleFromArc', 5);
        },
      },
      'j5-2-2-arc-from-inscribed-angle': {
        type: 'drill',
        title: '由圓周角求所對弧',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ522Set('arcFromInscribedAngle', 5);
        },
      },
      'j5-2-2-diameter-inscribed-angle': {
        type: 'drill',
        title: '直徑所對圓周角',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ522Set('diameterInscribedAngle', 5);
        },
      },
      'j5-2-2-tangent-chord-angle': {
        type: 'drill',
        title: '弦切角與同弧圓周角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('tangentChordAngle', 5);
        },
      },
      'j5-2-2-parallel-chord-angle': {
        type: 'drill',
        title: '平行弦夾弧求角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('parallelChordAngle', 5);
        },
      },
      'j5-2-2-cyclic-quadrilateral-four-subtypes': {
        type: 'drill',
        title: '圓內接四邊形四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ522Set('cyclicMixed', 6);
        },
      },
      'j5-2-2-cyclic-opposite-angle': {
        type: 'drill',
        title: '圓內接四邊形對角互補',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ522Set('cyclicOppositeAngle', 5);
        },
      },
      'j5-2-2-cyclic-ratio-angles': {
        type: 'drill',
        title: '圓內接四邊形角度比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('cyclicRatioAngles', 5);
        },
      },
      'j5-2-2-cyclic-exterior-angle': {
        type: 'drill',
        title: '圓內接四邊形外角',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ522Set('cyclicExteriorAngle', 5);
        },
      },
      'j5-2-2-cyclic-linear-equation': {
        type: 'drill',
        title: '圓內接四邊形一次式求角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('cyclicLinearEquation', 5);
        },
      },
      'j5-2-2-interior-exterior-angle-five-subtypes': {
        type: 'drill',
        title: '圓內角與圓外角五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ522Set('interiorExteriorMixed', 6);
        },
      },
      'j5-2-2-interior-angle-two-chords': {
        type: 'drill',
        title: '兩弦圓內角計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('interiorAngleTwoChords', 5);
        },
      },
      'j5-2-2-arc-from-interior-angle': {
        type: 'drill',
        title: '由圓內角反推弧度數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('arcFromInteriorAngle', 5);
        },
      },
      'j5-2-2-exterior-angle-two-secants': {
        type: 'drill',
        title: '兩割線圓外角計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('exteriorAngleTwoSecants', 5);
        },
      },
      'j5-2-2-two-tangents-angle': {
        type: 'drill',
        title: '兩切線夾角計算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('twoTangentsAngle', 5);
        },
      },
      'j5-2-2-parameter-exterior-angle': {
        type: 'drill',
        title: '圓外角一次式求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('parameterExteriorAngle', 5);
        },
      },
      'j5-2-2-arc-distribution-five-subtypes': {
        type: 'drill',
        title: '弧度比例與多邊形角度五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ522Set('arcDistributionMixed', 6);
        },
      },
      'j5-2-2-arc-ratio-angle': {
        type: 'drill',
        title: '弧長比例分配求圓周角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('arcRatioAngle', 5);
        },
      },
      'j5-2-2-equal-division-angle': {
        type: 'drill',
        title: '等分圓周求圓周角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('equalDivisionAngle', 5);
        },
      },
      'j5-2-2-regular-polygon-tangent-angle': {
        type: 'drill',
        title: '正多邊形弦切角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('regularPolygonTangentAngle', 5);
        },
      },
      'j5-2-2-major-minor-inscribed-angle': {
        type: 'drill',
        title: '優弧劣弧與圓周角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('majorMinorInscribedAngle', 5);
        },
      },
      'j5-2-2-central-arc-equation': {
        type: 'drill',
        title: '同弧圓心角圓周角一次式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ522Set('centralArcEquation', 5);
        },
      },
      'j5-2-3-power-basic-four-subtypes': {
        type: 'drill',
        title: '圓內外乘冪基本四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ523Set('powerBasicMixed', 6);
        },
      },
      'j5-2-3-intersecting-chords-segment': {
        type: 'drill',
        title: '圓內兩弦相交求線段',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('intersectingChordsSegment', 5);
        },
      },
      'j5-2-3-external-secants-segment': {
        type: 'drill',
        title: '圓外兩割線求線段',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('externalSecantsSegment', 5);
        },
      },
      'j5-2-3-tangent-secant-tangent': {
        type: 'drill',
        title: '切割線定理求切線長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('tangentSecantTangent', 5);
        },
      },
      'j5-2-3-tangent-secant-segment': {
        type: 'drill',
        title: '切割線定理求割線段',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('tangentSecantSecantSegment', 5);
        },
      },
      'j5-2-3-algebra-five-subtypes': {
        type: 'drill',
        title: '乘冪定理代數式五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ523Set('algebraMixed', 6);
        },
      },
      'j5-2-3-algebra-intersecting-chords': {
        type: 'drill',
        title: '兩弦乘冪一次式求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('algebraIntersectingChords', 5);
        },
      },
      'j5-2-3-algebra-tangent-secant': {
        type: 'drill',
        title: '切割線乘冪一次式求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('algebraTangentSecant', 5);
        },
      },
      'j5-2-3-algebra-external-secants': {
        type: 'drill',
        title: '兩割線乘冪一次式求值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('algebraExternalSecants', 5);
        },
      },
      'j5-2-3-ratio-intersecting-chords': {
        type: 'drill',
        title: '兩弦比例分段求全長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('ratioIntersectingChords', 5);
        },
      },
      'j5-2-3-ratio-tangent-secant': {
        type: 'drill',
        title: '切割線比例求乘冪值',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('ratioTangentSecant', 5);
        },
      },
      'j5-2-3-radius-power-five-subtypes': {
        type: 'drill',
        title: '圓心距與圓冪值五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ523Set('radiusPowerMixed', 6);
        },
      },
      'j5-2-3-inside-power-product': {
        type: 'drill',
        title: '圓內點圓冪乘積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('insidePowerProduct', 5);
        },
      },
      'j5-2-3-tangent-from-distance': {
        type: 'drill',
        title: '由圓心距與半徑求切線長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('tangentFromDistance', 5);
        },
      },
      'j5-2-3-radius-from-tangent-distance': {
        type: 'drill',
        title: '由切線長與圓心距求半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('radiusFromTangentDistance', 5);
        },
      },
      'j5-2-3-shortest-chord-through-point': {
        type: 'drill',
        title: '圓內點最短弦長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('shortestChordThroughPoint', 5);
        },
      },
      'j5-2-3-diameter-secant-product': {
        type: 'drill',
        title: '通過圓心割線乘積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('diameterSecantProduct', 5);
        },
      },
      'j5-2-3-chord-distance-four-subtypes': {
        type: 'drill',
        title: '弦心距與乘冪轉換四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ523Set('chordDistanceMixed', 6);
        },
      },
      'j5-2-3-chord-distance-power-transfer': {
        type: 'drill',
        title: '弦心距轉乘冪求段長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('chordDistancePowerTransfer', 5);
        },
      },
      'j5-2-3-midpoint-chord-product': {
        type: 'drill',
        title: '中點弦乘冪求弦長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('midpointChordProduct', 5);
        },
      },
      'j5-2-3-parallel-chord-product': {
        type: 'drill',
        title: '平行弦延長兩割線',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('parallelChordProduct', 5);
        },
      },
      'j5-2-3-perpendicular-chord-length': {
        type: 'drill',
        title: '垂徑定理求弦長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('perpendicularChordLength', 5);
        },
      },
      'j5-2-3-ratio-composite-five-subtypes': {
        type: 'drill',
        title: '比例關係與乘冪綜合五小類',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ523Set('ratioCompositeMixed', 6);
        },
      },
      'j5-2-3-ratio-internal-chord-total': {
        type: 'drill',
        title: '圓內弦比例分段求全長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('ratioInternalChordTotal', 5);
        },
      },
      'j5-2-3-ratio-external-secant-length': {
        type: 'drill',
        title: '圓外割線比例求全長',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ523Set('ratioExternalSecantLength', 5);
        },
      },
      'j5-2-3-two-secants-same-point-ratio': {
        type: 'drill',
        title: '同外點兩割線乘積相等',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('twoSecantsSamePointRatio', 5);
        },
      },
      'j5-2-3-two-tangent-equal-power': {
        type: 'drill',
        title: '同外點兩切線與乘冪',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ523Set('twoTangentEqualPower', 5);
        },
      },
      'j5-2-3-common-tangent-power': {
        type: 'drill',
        title: '切線乘冪轉割線全長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ523Set('commonTangentPower', 5);
        },
      },
      'j5-3-1-parity-five-subtypes': {
        type: 'drill',
        title: '奇偶性質證明五小類綜合',
        difficulty: 'easy',
        questionCount: 6,
        generate() {
          return buildJ531Set('parityMixed', 6);
        },
      },
      'j5-3-1-parity-sum': {
        type: 'drill',
        title: '偶數加奇數證明',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ531Set('paritySum', 5);
        },
      },
      'j5-3-1-odd-product': {
        type: 'drill',
        title: '奇數乘奇數證明',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ531Set('oddProduct', 5);
        },
      },
      'j5-3-1-square-parity': {
        type: 'drill',
        title: '平方保留奇偶性',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ531Set('squareParity', 5);
        },
      },
      'j5-3-1-linear-parity': {
        type: 'drill',
        title: '偶數加常數奇偶判斷',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ531Set('linearParity', 5);
        },
      },
      'j5-3-1-odd-squares-sum': {
        type: 'drill',
        title: '兩奇數平方和奇偶證明',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('oddSquaresSum', 5);
        },
      },
      'j5-3-1-divisibility-five-subtypes': {
        type: 'drill',
        title: '整除與因式證明五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ531Set('divisibilityMixed', 6);
        },
      },
      'j5-3-1-consecutive-product-divisible': {
        type: 'drill',
        title: '連續整數乘積整除',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('consecutiveProductDivisible', 5);
        },
      },
      'j5-3-1-difference-squares-divisible': {
        type: 'drill',
        title: '平方差因式整除',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('differenceSquaresDivisible', 5);
        },
      },
      'j5-3-1-shifted-square-multiple': {
        type: 'drill',
        title: '平移平方差整除',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('shiftedSquareMultiple', 5);
        },
      },
      'j5-3-1-quadratic-completion-multiple': {
        type: 'drill',
        title: '配方後判斷倍數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('quadraticCompletionMultiple', 5);
        },
      },
      'j5-3-1-factor-substitution-multiple': {
        type: 'drill',
        title: '代入倍數關係證明',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('factorSubstitutionMultiple', 5);
        },
      },
      'j5-3-1-remainder-five-subtypes': {
        type: 'drill',
        title: '除法餘數推理五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ531Set('remainderMixed', 6);
        },
      },
      'j5-3-1-square-remainder': {
        type: 'drill',
        title: '平方的餘數推理',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('squareRemainder', 5);
        },
      },
      'j5-3-1-remainder-parity': {
        type: 'drill',
        title: '由餘數判斷奇偶',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ531Set('remainderParity', 5);
        },
      },
      'j5-3-1-expression-remainder': {
        type: 'drill',
        title: '代數式餘數運算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('expressionRemainder', 5);
        },
      },
      'j5-3-1-age-squares-remainder': {
        type: 'drill',
        title: '生活情境平方餘數',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('ageSquaresRemainder', 5);
        },
      },
      'j5-3-1-not-divisible-claim': {
        type: 'drill',
        title: '反例型整除判斷',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('notDivisibleClaim', 5);
        },
      },
      'j5-3-1-consecutive-five-subtypes': {
        type: 'drill',
        title: '連續整數性質證明五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ531Set('consecutiveMixed', 6);
        },
      },
      'j5-3-1-three-consecutive-product-six': {
        type: 'drill',
        title: '三連續整數乘積為六倍數',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ531Set('threeConsecutiveProductSix', 5);
        },
      },
      'j5-3-1-consecutive-sum-multiple': {
        type: 'drill',
        title: '奇數個連續整數和',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('consecutiveSumMultiple', 5);
        },
      },
      'j5-3-1-consecutive-odd-squares-eight': {
        type: 'drill',
        title: '連續奇數平方差',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('consecutiveOddSquaresEight', 5);
        },
      },
      'j5-3-1-two-consecutive-even-product': {
        type: 'drill',
        title: '連續偶數乘積整除',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('twoConsecutiveEvenProduct', 5);
        },
      },
      'j5-3-1-consecutive-weighted-sum-four': {
        type: 'drill',
        title: '三連續整數加權和',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('consecutiveWeightedSumFour', 5);
        },
      },
      'j5-3-1-inequality-eight-subtypes': {
        type: 'drill',
        title: '代數不等式證明八小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ531Set('inequalityMixed', 6);
        },
      },
      'j5-3-1-positive-square-order': {
        type: 'drill',
        title: '正數平方保序',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ531Set('positiveSquareOrder', 5);
        },
      },
      'j5-3-1-negative-square-reverse': {
        type: 'drill',
        title: '負數平方倒向比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('negativeSquareReverse', 5);
        },
      },
      'j5-3-1-positive-reciprocal-reverse': {
        type: 'drill',
        title: '正數倒數倒向',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('positiveReciprocalReverse', 5);
        },
      },
      'j5-3-1-negative-reciprocal-reverse': {
        type: 'drill',
        title: '負數倒數比較',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('negativeReciprocalReverse', 5);
        },
      },
      'j5-3-1-multiply-by-negative': {
        type: 'drill',
        title: '乘負數不等號換向',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ531Set('multiplyByNegative', 5);
        },
      },
      'j5-3-1-am-gm-two-numbers': {
        type: 'drill',
        title: '算術幾何平均不等式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('amGmTwoNumbers', 5);
        },
      },
      'j5-3-1-radical-order': {
        type: 'drill',
        title: '根號與原數大小',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('radicalOrder', 5);
        },
      },
      'j5-3-1-same-sign-product-inequality': {
        type: 'drill',
        title: '符號連鎖與乘積正負',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ531Set('sameSignProductInequality', 5);
        },
      },
      'j5-3-2-centers-five-subtypes': {
        type: 'drill',
        title: '三心基本性質證明五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ532Set('centersMixed', 6);
        },
      },
      'j5-3-2-circumcenter-equal-distance': {
        type: 'drill',
        title: '外心到三頂點等距',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ532Set('circumcenterEqualDistance', 5);
        },
      },
      'j5-3-2-incenter-equal-distance': {
        type: 'drill',
        title: '內心到三邊等距',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ532Set('incenterEqualDistance', 5);
        },
      },
      'j5-3-2-centroid-median-ratio': {
        type: 'drill',
        title: '重心分中線比例',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ532Set('centroidMedianRatio', 5);
        },
      },
      'j5-3-2-right-triangle-circumcenter': {
        type: 'drill',
        title: '直角三角形外心',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('rightTriangleCircumcenter', 5);
        },
      },
      'j5-3-2-isosceles-centers-line': {
        type: 'drill',
        title: '等腰三角形三心共線',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('isoscelesCentersLine', 5);
        },
      },
      'j5-3-2-congruence-five-subtypes': {
        type: 'drill',
        title: '全等性質證明五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ532Set('congruenceMixed', 6);
        },
      },
      'j5-3-2-isosceles-altitude-bisects': {
        type: 'drill',
        title: '等腰三角形高平分頂角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('isoscelesAltitudeBisects', 5);
        },
      },
      'j5-3-2-perpendicular-bisector-point': {
        type: 'drill',
        title: '垂直平分線等距',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ532Set('perpendicularBisectorPoint', 5);
        },
      },
      'j5-3-2-angle-bisector-symmetry': {
        type: 'drill',
        title: '角平分線到兩邊等距',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('angleBisectorSymmetry', 5);
        },
      },
      'j5-3-2-square-shared-vertex': {
        type: 'drill',
        title: '共頂點正方形全等',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('squareSharedVertex', 5);
        },
      },
      'j5-3-2-equilateral-shared-vertex': {
        type: 'drill',
        title: '共頂點正三角形全等',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('equilateralSharedVertex', 5);
        },
      },
      'j5-3-2-similarity-five-subtypes': {
        type: 'drill',
        title: '相似與比例證明五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ532Set('similarityMixed', 6);
        },
      },
      'j5-3-2-parallel-line-similarity': {
        type: 'drill',
        title: '平行線截比例相似',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ532Set('parallelLineSimilarity', 5);
        },
      },
      'j5-3-2-right-altitude-geometric-mean': {
        type: 'drill',
        title: '斜邊高平方公式證明',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('rightAltitudeGeometricMean', 5);
        },
      },
      'j5-3-2-butterfly-similarity': {
        type: 'drill',
        title: '蝴蝶相似乘積關係',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('butterflySimilarity', 5);
        },
      },
      'j5-3-2-angle-bisector-ratio': {
        type: 'drill',
        title: '內角平分線比例',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('angleBisectorRatio', 5);
        },
      },
      'j5-3-2-altitude-circumcircle-product': {
        type: 'drill',
        title: '高與外接圓直徑乘積',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ532Set('altitudeCircumcircleProduct', 5);
        },
      },
      'j5-3-2-circle-proof-five-subtypes': {
        type: 'drill',
        title: '圓與角度證明五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ532Set('circleProofMixed', 6);
        },
      },
      'j5-3-2-parallel-chords-equal-arcs': {
        type: 'drill',
        title: '平行弦夾等弧',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('parallelChordsEqualArcs', 5);
        },
      },
      'j5-3-2-tangent-segments-equal': {
        type: 'drill',
        title: '同外點兩切線相等',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ532Set('tangentSegmentsEqual', 5);
        },
      },
      'j5-3-2-cyclic-opposite-angles': {
        type: 'drill',
        title: '圓內接四邊形對角互補',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('cyclicOppositeAngles', 5);
        },
      },
      'j5-3-2-tangent-chord-similarity': {
        type: 'drill',
        title: '切割線相似證明',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('tangentChordSimilarity', 5);
        },
      },
      'j5-3-2-same-arc-angle-equal': {
        type: 'drill',
        title: '同弧圓周角與弦切角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('sameArcAngleEqual', 5);
        },
      },
      'j5-3-2-centroid-area-five-subtypes': {
        type: 'drill',
        title: '重心與面積比例五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ532Set('centroidAreaMixed', 6);
        },
      },
      'j5-3-2-centroid-three-triangles-area': {
        type: 'drill',
        title: '重心連三頂點面積相等',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('centroidThreeTrianglesArea', 5);
        },
      },
      'j5-3-2-median-six-equal-areas': {
        type: 'drill',
        title: '三中線六等面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('medianSixEqualAreas', 5);
        },
      },
      'j5-3-2-centroid-midpoint-area-ratio': {
        type: 'drill',
        title: '重心小三角形面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('centroidMidpointAreaRatio', 5);
        },
      },
      'j5-3-2-parallelogram-centroid-point': {
        type: 'drill',
        title: '平行四邊形中的重心',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ532Set('parallelogramCentroidPoint', 5);
        },
      },
      'j5-3-2-centroid-median-length': {
        type: 'drill',
        title: '重心中線長度計算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ532Set('centroidMedianLength', 5);
        },
      },
      'j5-3-3-circumcenter-five-subtypes': {
        type: 'drill',
        title: '外心角度距離與外接圓七小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ533Set('circumcenterMixed', 6);
        },
      },
      'j5-3-3-circumcenter-angle': {
        type: 'drill',
        title: '銳角三角形外心角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('circumcenterAngle', 5);
        },
      },
      'j5-3-3-circumcenter-equal-radius': {
        type: 'drill',
        title: '外心等距計算',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ533Set('circumcenterEqualRadius', 5);
        },
      },
      'j5-3-3-right-circumradius': {
        type: 'drill',
        title: '直角三角形外接半徑',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ533Set('rightCircumradius', 5);
        },
      },
      'j5-3-3-equilateral-circumradius': {
        type: 'drill',
        title: '正三角形外接半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('equilateralCircumradius', 5);
        },
      },
      'j5-3-3-obtuse-circumcenter-angle': {
        type: 'drill',
        title: '鈍角三角形外心角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('obtuseCircumcenterAngle', 5);
        },
      },
      'j5-3-3-isosceles-circumradius': {
        type: 'drill',
        title: '等腰三角形外接半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('isoscelesCircumradius', 5);
        },
      },
      'j5-3-3-circumcircle-area-from-radius': {
        type: 'drill',
        title: '由外心半徑求外接圓面積',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ533Set('circumcircleAreaFromRadius', 5);
        },
      },
      'j5-3-3-incenter-six-subtypes': {
        type: 'drill',
        title: '內心角度半徑與面積八小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ533Set('incenterMixed', 6);
        },
      },
      'j5-3-3-incenter-angle': {
        type: 'drill',
        title: '內心角公式換算',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('incenterAngle', 5);
        },
      },
      'j5-3-3-incenter-angle-inverse': {
        type: 'drill',
        title: '由內心角反推頂角',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('incenterAngleInverse', 5);
        },
      },
      'j5-3-3-inradius-from-area-perimeter': {
        type: 'drill',
        title: '由面積周長求內切半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('inradiusFromAreaPerimeter', 5);
        },
      },
      'j5-3-3-right-triangle-inradius': {
        type: 'drill',
        title: '直角三角形內切半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('rightTriangleInradius', 5);
        },
      },
      'j5-3-3-incenter-area-ratio': {
        type: 'drill',
        title: '內心分割面積比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('incenterAreaRatio', 5);
        },
      },
      'j5-3-3-equilateral-inradius': {
        type: 'drill',
        title: '正三角形內切半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('equilateralInradius', 5);
        },
      },
      'j5-3-3-incenter-area-from-side-ratio': {
        type: 'drill',
        title: '內心面積比反推全圖',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('incenterAreaFromSideRatio', 5);
        },
      },
      'j5-3-3-axis-triangle-incenter-area': {
        type: 'drill',
        title: '坐標軸直角三角形內心面積',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ533Set('axisTriangleIncenterArea', 5);
        },
      },
      'j5-3-3-centroid-six-subtypes': {
        type: 'drill',
        title: '重心長度座標面積十五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ533Set('centroidMixed', 6);
        },
      },
      'j5-3-3-centroid-median-length': {
        type: 'drill',
        title: '由中線求重心分段',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ533Set('centroidMedianLength', 5);
        },
      },
      'j5-3-3-centroid-median-inverse': {
        type: 'drill',
        title: '由重心短段求中線',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ533Set('centroidMedianInverse', 5);
        },
      },
      'j5-3-3-centroid-coordinate': {
        type: 'drill',
        title: '三點求重心坐標',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('centroidCoordinate', 5);
        },
      },
      'j5-3-3-missing-vertex-from-centroid': {
        type: 'drill',
        title: '由重心反推第三頂點',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('missingVertexFromCentroid', 5);
        },
      },
      'j5-3-3-centroid-area-sixth': {
        type: 'drill',
        title: '重心六等面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('centroidAreaSixth', 5);
        },
      },
      'j5-3-3-centroid-area-third': {
        type: 'drill',
        title: '重心三等面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('centroidAreaThird', 5);
        },
      },
      'j5-3-3-centroid-median-equation': {
        type: 'drill',
        title: '重心中線比例一次式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('centroidMedianEquation', 5);
        },
      },
      'j5-3-3-centroid-area-from-one-small': {
        type: 'drill',
        title: '由重心小三角形求全圖面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('centroidAreaFromOneSmall', 5);
        },
      },
      'j5-3-3-parallelogram-hidden-centroid-length': {
        type: 'drill',
        title: '平行四邊形隱藏重心求長度',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ533Set('parallelogramHiddenCentroidLength', 5);
        },
      },
      'j5-3-3-parallelogram-centroid-area': {
        type: 'drill',
        title: '平行四邊形隱藏重心求面積',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ533Set('parallelogramCentroidArea', 5);
        },
      },
      'j5-3-3-centroid-quadrilateral-to-total-area': {
        type: 'drill',
        title: '重心中點四邊形反推全圖面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('centroidQuadrilateralToTotalArea', 5);
        },
      },
      'j5-3-3-parallelogram-two-centroids-distance': {
        type: 'drill',
        title: '平行四邊形兩重心距離',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ533Set('parallelogramTwoCentroidsDistance', 5);
        },
      },
      'j5-3-3-parallelogram-midpoint-triangle-area': {
        type: 'drill',
        title: '平行四邊形中點小三角形面積',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ533Set('parallelogramMidpointTriangleArea', 5);
        },
      },
      'j5-3-3-parallelogram-centroid-segment-equation': {
        type: 'drill',
        title: '平行四邊形兩重心分段一次式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('parallelogramCentroidSegmentEquation', 5);
        },
      },
      'j5-3-3-isosceles-area-from-centroid-distance': {
        type: 'drill',
        title: '等腰三角形由重心距求面積',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ533Set('isoscelesAreaFromCentroidDistance', 5);
        },
      },
      'j5-3-3-coordinate-five-subtypes': {
        type: 'drill',
        title: '座標平面三心八小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ533Set('coordinateMixed', 6);
        },
      },
      'j5-3-3-right-triangle-circumcenter-coordinate': {
        type: 'drill',
        title: '座標直角三角形外心',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('rightTriangleCircumcenterCoordinate', 5);
        },
      },
      'j5-3-3-three-point-centroid-coordinate': {
        type: 'drill',
        title: '座標三點重心',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('threePointCentroidCoordinate', 5);
        },
      },
      'j5-3-3-axis-triangle-incenter': {
        type: 'drill',
        title: '坐標軸直角三角形內心',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ533Set('axisTriangleIncenter', 5);
        },
      },
      'j5-3-3-right-triangle-og-distance': {
        type: 'drill',
        title: '直角三角形外心重心距',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('rightTriangleOGDistance', 5);
        },
      },
      'j5-3-3-circumcenter-point-check': {
        type: 'drill',
        title: '判斷點是否在外接圓上',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ533Set('circumcenterPointCheck', 5);
        },
      },
      'j5-3-3-circumcenter-coordinate-general': {
        type: 'drill',
        title: '三點共圓求外心與面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('circumcenterCoordinateGeneral', 5);
        },
      },
      'j5-3-3-right-triangle-coordinate-og': {
        type: 'drill',
        title: '座標直角三角形求外心重心距',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('rightTriangleCoordinateOG', 5);
        },
      },
      'j5-3-3-euler-line-orthocenter-coordinate': {
        type: 'drill',
        title: '尤拉線由外心重心求垂心',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ533Set('eulerLineOrthocenterCoordinate', 5);
        },
      },
      'j5-3-3-special-five-subtypes': {
        type: 'drill',
        title: '正三角形與直角三心十小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate() {
          return buildJ533Set('specialMixed', 6);
        },
      },
      'j5-3-3-equilateral-radii-ratio': {
        type: 'drill',
        title: '正三角形內外半徑比',
        difficulty: 'easy',
        questionCount: 5,
        generate() {
          return buildJ533Set('equilateralRadiiRatio', 5);
        },
      },
      'j5-3-3-equilateral-area-from-inradius': {
        type: 'drill',
        title: '由內切半徑求正三角形面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('equilateralAreaFromInradius', 5);
        },
      },
      'j5-3-3-equilateral-area-from-circumradius': {
        type: 'drill',
        title: '由外接半徑求正三角形面積',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('equilateralAreaFromCircumradius', 5);
        },
      },
      'j5-3-3-right-triangle-go': {
        type: 'drill',
        title: '直角三角形外心重心距公式',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('rightTriangleGO', 5);
        },
      },
      'j5-3-3-right-triangle-rr-perimeter': {
        type: 'drill',
        title: '直角三角形內外半徑與周長',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('rightTriangleRrPerimeter', 5);
        },
      },
      'j5-3-3-right-triangle-hypotenuse-from-og': {
        type: 'drill',
        title: '由外心重心距反推斜邊與外接圓',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('rightTriangleHypotenuseFromOG', 5);
        },
      },
      'j5-3-3-right-triangle-perimeter-from-rr': {
        type: 'drill',
        title: '由內外半徑反推直角三角形周長',
        difficulty: 'hard',
        questionCount: 5,
        generate() {
          return buildJ533Set('rightTrianglePerimeterFromRr', 5);
        },
      },
      'j5-3-3-equilateral-height-from-circumradius': {
        type: 'drill',
        title: '由外接半徑求正三角形高',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('equilateralHeightFromCircumradius', 5);
        },
      },
      'j5-3-3-equilateral-incircle-circumcircle-area-ratio': {
        type: 'drill',
        title: '正三角形內外圓面積比',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('equilateralIncircleCircumcircleAreaRatio', 5);
        },
      },
      'j5-3-3-centroid-to-vertex-sum': {
        type: 'drill',
        title: '重心到三頂點距離和',
        difficulty: 'medium',
        questionCount: 5,
        generate() {
          return buildJ533Set('centroidToVertexSum', 5);
        },
      },
  };

  const bundleFingerprint = "j5-bundle-v20260619-v1";
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== "object") return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
