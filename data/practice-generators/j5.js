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

  function formatLinearTerm(coefficient, variable, includeLeadingSign = false) {
    const absoluteCoefficient = Math.abs(coefficient);
    const magnitude = absoluteCoefficient === 1 ? variable : `${absoluteCoefficient}${variable}`;
    if (includeLeadingSign) return coefficient < 0 ? `-${magnitude}` : `+${magnitude}`;
    return coefficient < 0 ? `-${magnitude}` : magnitude;
  }

  function buildJ511MergeSharedTermSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
    return { questions, summaryAnswers, answers };
  }

  function buildJ511EquationToRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
    return { questions, summaryAnswers, answers };
  }

  function buildJ511FractionFormRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
    return { questions, summaryAnswers, answers };
  }

  function buildJ511ReciprocalRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
    return { questions, summaryAnswers, answers };
  }

  function buildJ511FractionStatementRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
    return { questions, summaryAnswers, answers };
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
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const built = builders[i % builders.length](1);
      questions.push(built.questions[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ511ParametricLinearEquationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
      const expression = `${formatLinearTerm(coeffs[0], 'x')}${formatLinearTerm(coeffs[1], 'y', true)}${formatLinearTerm(coeffs[2], 'z', true)}`;
      questions.push(`已知 \\(x:y:z=${ratioTex(ratio)}\\)，且 \\(${expression}=${value}\\)，求 \\(x,y,z\\) 的值。`);
      answers.push(
        `簡答：\\((x,y,z)=(${ratio[0] * t},${ratio[1] * t},${ratio[2] * t})\\)。過程：設 \\(x=${formatLinearTerm(ratio[0], 'r')}\\)，\\(y=${formatLinearTerm(ratio[1], 'r')}\\)，\\(z=${formatLinearTerm(ratio[2], 'r')}\\)。代入得 \\(${formatLinearTerm(coefficientSum, 'r')}=${value}\\)，所以 \\(r=${t}\\)，答案為 \\((x,y,z)=(${ratio[0] * t},${ratio[1] * t},${ratio[2] * t})\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ511RatioExpressionTransformSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const modes = ['sumCycle', 'linearPair', 'square'];
    for (let i = 0; i < count; i += 1) {
      const ratio = reduceRatioTriple([randInt(1, 7), randInt(2, 8), randInt(3, 9)]);
      const mode = modes[i % modes.length];
      if (mode === 'sumCycle') {
        const result = reduceRatioTriple([ratio[0] + ratio[1], ratio[1] + ratio[2], ratio[2] + ratio[0]]);
        questions.push(`若 \\(x:y:z=${ratioTex(ratio)}\\)，求 \\((x+y):(y+z):(z+x)\\) 的最簡整數連比。`);
        answers.push(
          `簡答：\\(${ratioTex(result)}\\)。過程：設 \\((x,y,z)=(${formatLinearTerm(ratio[0], 'r')},${formatLinearTerm(ratio[1], 'r')},${formatLinearTerm(ratio[2], 'r')})\\)，代入後約去 \\(r\\)，得 \\(${ratioTex(result)}\\)。`
        );
      } else if (mode === 'linearPair') {
        const result = reduceRatioTriple([2 * ratio[0] + ratio[1], 3 * ratio[2] - ratio[0]]);
        questions.push(`若 \\(x:y:z=${ratioTex(ratio)}\\)，求 \\((2x+y):(3z-x)\\) 的最簡整數比。`);
        answers.push(
          `簡答：\\(${ratioTex(result)}\\)。過程：代入 \\((x,y,z)=(${formatLinearTerm(ratio[0], 'r')},${formatLinearTerm(ratio[1], 'r')},${formatLinearTerm(ratio[2], 'r')})\\)，得 \\(${formatLinearTerm(2 * ratio[0] + ratio[1], 'r')}:${formatLinearTerm(3 * ratio[2] - ratio[0], 'r')}=${ratioTex(result)}\\)。`
        );
      } else {
        const result = reduceRatioTriple([ratio[0] * ratio[0] + ratio[1] * ratio[1], ratio[2] * ratio[2]]);
        questions.push(`若 \\(x:y:z=${ratioTex(ratio)}\\)，求 \\((x^2+y^2):z^2\\) 的最簡整數比。`);
        answers.push(
          `簡答：\\(${ratioTex(result)}\\)。過程：平方後仍可約去共同的 \\(r^2\\)，所以答案為 \\(${ratio[0] * ratio[0] + ratio[1] * ratio[1]}:${ratio[2] * ratio[2]}=${ratioTex(result)}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ511ReverseValueFromRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
    return { questions, summaryAnswers, answers };
  }

  function buildJ511ShiftedVariableRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
        `簡答：\\(${i % 2 === 0 ? 'x-y' : 'x+z'}=${target}\\)。過程：設 \\(x+${shiftX}=${formatLinearTerm(ratio[0], 'r')}\\)、\\(y-${shiftY}=${formatLinearTerm(ratio[1], 'r')}\\)、\\(z=${formatLinearTerm(ratio[2], 'r')}\\)，則 \\(x=${formatLinearTerm(ratio[0], 'r')}-${shiftX}\\)、\\(y=${formatLinearTerm(ratio[1], 'r')}+${shiftY}\\)、\\(z=${formatLinearTerm(ratio[2], 'r')}\\)。代入總和得 \\(${formatLinearTerm(ratio.reduce((sum, value) => sum + value, 0), 'r')}${shiftY - shiftX >= 0 ? `+${shiftY - shiftX}` : shiftY - shiftX}=${total}\\)，所以 \\(r=${unit}\\)，再代回可得答案。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ511RatioAlgebraMixedSet(count) {
    const builders = [
      buildJ511ParametricLinearEquationSet,
      buildJ511RatioExpressionTransformSet,
      buildJ511ReverseValueFromRatioSet,
      buildJ511ShiftedVariableRatioSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const built = builders[i % builders.length](1);
      questions.push(built.questions[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ511TriangleAngleRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const ratio = [];
      let sum = 0;
      while (ratio.length === 0 || sum <= 0 || 180 % sum !== 0) {
        const a = randInt(1, 5);
        const b = randInt(1, 6);
        const c = randInt(2, 7);
        const reduced = reduceRatioTriple([a, b, c]);
        sum = reduced.reduce((acc, value) => acc + value, 0);
        if (sum >= 6 && sum <= 18 && 180 % sum === 0) ratio.push(...reduced);
      }
      const angleSum = ratio.reduce((acc, value) => acc + value, 0);
      const unit = 180 / angleSum;
      const angles = ratio.map((value) => value * unit);
      questions.push(
        `若 \\(\\triangle ABC\\) 的三內角比 \\(\\angle A:\\angle B:\\angle C=${ratioTex(ratio)}\\)，求三內角的度數。`
      );
      answers.push(
        `簡答：三內角為 \\(${angles[0]}^\\circ,${angles[1]}^\\circ,${angles[2]}^\\circ\\)。過程：三角形內角和為 \\(180^\\circ\\)，每一份為 \\(180\\div${sum}=${unit}\\)，再依比例分配。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ511TriangleSideHeightRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const validSideRatios = [
      [3, 4, 5],
      [5, 6, 7],
      [4, 5, 6],
      [5, 5, 6],
      [5, 12, 13],
      [8, 15, 17],
      [7, 10, 12],
      [6, 7, 8],
      [7, 8, 9],
      [9, 10, 11],
      [9, 12, 13],
      [10, 10, 12],
      [10, 13, 16],
      [11, 13, 17],
      [12, 16, 18],
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
    return { questions, summaryAnswers, answers };
  }

  function buildJ511GeometryPerimeterAreaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const modes = ['perimeter', 'area', 'rectangle'];
    for (let i = 0; i < count; i += 1) {
      const mode = modes[i % modes.length];
      if (mode === 'perimeter') {
        let ratio = [];
        while (ratio.length === 0 || ratio[0] + ratio[1] <= ratio[2] || ratio[0] + ratio[2] <= ratio[1] || ratio[1] + ratio[2] <= ratio[0]) {
          ratio = reduceRatioTriple([randInt(2, 6), randInt(3, 8), randInt(4, 9)]);
        }
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
          `簡答：長、寬、高為 \\(${ratio[0] * scale},${ratio[1] * scale},${ratio[2] * scale}\\) 公分。過程：設長、寬、高為 \\(${formatLinearTerm(ratio[0], 'r')},${formatLinearTerm(ratio[1], 'r')},${formatLinearTerm(ratio[2], 'r')}\\)，則 \\(${formatLinearTerm(ratio[0] * ratio[1] * ratio[2], 'r')}^3=${volume}\\)，得 \\(r=${scale}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ511GeometryRatioMixedSet(count) {
    const builders = [
      buildJ511TriangleAngleRatioSet,
      buildJ511TriangleSideHeightRatioSet,
      buildJ511GeometryPerimeterAreaSet,
    ];
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const built = builders[i % builders.length](1);
      questions.push(built.questions[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ511MoneyProfitSharingSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
    return { questions, summaryAnswers, answers };
  }

  function buildJ511MixtureRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
    return { questions, summaryAnswers, answers };
  }

  function buildJ511PopulationRatioChangeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
    return { questions, summaryAnswers, answers };
  }

  function buildJ511WorkRateSpeedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const times = reduceRatioTriple([randInt(2, 7), randInt(3, 8), randInt(4, 9)]);
      const common = lcmArray(times);
      const rates = reduceRatioTriple(times.map((value) => common / value));
      questions.push(`甲、乙、丙完成同一件工作的時間比為 \\(${ratioTex(times)}\\)，求三人的工作效率比。`);
      answers.push(
        `簡答：工作效率比為 \\(${ratioTex(rates)}\\)。過程：同一工作量下，效率與時間成反比，所以把 \\(${ratioTex(times)}\\) 取倒數並化為整數比。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ511WorkEfficiencyAppliedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
    return { questions, summaryAnswers, answers };
  }

  function buildJ511CoinDenominationRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
    return { questions, summaryAnswers, answers };
  }

  function buildJ511MixtureSharedTermSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
    return { questions, summaryAnswers, answers };
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
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i += 1) {
      const built = builders[i % builders.length](1);
      questions.push(built.questions[0]);
      answers.push(built.answers[0]);
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ512Set(kind, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
        const ad = randInt(2, 5);
        const db = randInt(1, 5);
        const scale = randInt(2, 8);
        const ae = ad * scale;
        const ec = db * scale;
        const offset = randInt(1, ae - 1);
        const x = ae - offset;
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(D\\) 在 \\(AB\\) 上，\\(E\\) 在 \\(AC\\) 上，且 \\(DE\\parallel BC\\)。若 \\(AD=${ad}\\)、\\(DB=${db}\\)、\\(AE=x+${offset}\\)、\\(EC=${ec}\\)，求 \\(x\\)。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(x=${x}\\)`,
          `由平行截線得 \\(AD:DB=AE:EC\\)，所以 \\(${ad}:${db}=(x+${offset}):${ec}\\)。交叉相乘得 \\(${db}(x+${offset})=${ad}\\times${ec}\\)，因此 \\(x+${offset}=${ae}\\)，解得 \\(x=${x}\\)。`
        );
      } else if (type === 'triangleConverse') {
        const [p, q] = coprimePair(2, 7);
        const scale1 = randInt(2, 5);
        const scale2 = i % 2 === 0 ? scale1 : scale1 + 1;
        const ad = p * scale1;
        const db = q * scale1;
        const ae = p * scale2;
        const ec = (i % 2 === 0 ? q : q + 1) * scale2;
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
            `簡答：\\(x=${x}\\)。過程：代入分點截線公式 \\(EF=\\dfrac{${formatLinearTerm(n, 'x')}+${m}\\cdot ${bc}}{${m}+${n}}\\)，解得 \\(x=${x}\\)。`
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
    return { questions, summaryAnswers, answers };
  }

  function buildJ513Set(kind, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
        const baseScale = randInt(2, 12);
        const heightDen = randInt(2, 12);
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
        const scale = randInt(2, 20);
        const areaMultiplier = scale * scale;
        if (i % 2 === 0) {
          questions.push(`一個圖形等比例放大 \\(${scale}\\) 倍後，面積變為原來的幾倍？`);
          answers.push(
            `簡答：\\(${areaMultiplier}\\) 倍。過程：等比例縮放時，面積倍率是長度倍率的平方，所以面積變為 \\(${scale}^2=${areaMultiplier}\\) 倍。`
          );
        } else {
          questions.push(`一個圖形等比例縮小到原來的 \\(\\frac{1}{${scale}}\\)，面積變為原來的幾分之幾？`);
          answers.push(
            `簡答：\\(\\frac{1}{${areaMultiplier}}\\)。過程：面積倍率是長度倍率的平方，所以 \\((\\frac{1}{${scale}})^2=\\frac{1}{${areaMultiplier}}\\)。`
          );
        }
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
        const [m, n] = coprimePair(2, 9);
        const scale = randInt(1, 4);
        const bd = m * m * scale;
        const dc = n * n * scale;
        const ad = m * n * scale;
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
          [5, 12, 13],
          [12, 5, 13],
          [8, 15, 17],
          [15, 8, 17],
          [7, 24, 25],
          [24, 7, 25],
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
        const dc = randInt(3, 9);
        const de = randInt(2, 6);
        const scale = randInt(3, 8);
        const bc = dc * scale;
        const ab = de * scale;
        questions.push(
          `為測河寬 \\(AB\\)，在岸邊取點 \\(C\\)，使 \\(AB\\perp BC\\)。再在直線 \\(BC\\) 上取點 \\(D\\)，作 \\(DE\\perp BC\\)，且 \\(A,C,E\\) 三點共線。若 \\(BC=${bc}\\) 公尺、\\(DC=${dc}\\) 公尺、\\(DE=${de}\\) 公尺，求河寬 \\(AB\\)。`
        );
        answers.push(
          `簡答：\\(AB=${ab}\\) 公尺。過程：\\(\\triangle ABC\\sim\\triangle EDC\\)，所以 \\(AB:DE=BC:DC\\)。代入得 \\(AB:${de}=${bc}:${dc}\\)，故 \\(AB=${ab}\\) 公尺。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ514Set(kind, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
      [9, 40, 41],
      [20, 21, 29],
      [12, 35, 37],
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
        const totalDist = far + near;
        const tree = eye + (pole - eye) * (totalDist / near);
        questions.push(
          `小羽要測樹高，離樹 \\(${far}\\) 公尺處立一根 \\(${formatFraction(pole, 100)}\\) 公尺標竿。他後退到距標竿 \\(${near}\\) 公尺處，眼睛、標竿頂端、樹頂共線。若眼睛離地 \\(${formatFraction(eye, 100)}\\) 公尺，求樹高。`
        );
        answers.push(
          `簡答：\\(${formatFraction(tree, 100)}\\) 公尺。過程：眼睛到樹的水平距離為 \\(${far}+${near}=${totalDist}\\) 公尺，高出眼睛的部分成比例，\\((樹高-眼高):(標竿高-眼高)=${totalDist}:${near}\\)。所以樹高 \\(=${formatFraction(eye, 100)}+(${formatFraction(pole, 100)}-${formatFraction(eye, 100)})\\times\\dfrac{${totalDist}}{${near}}=${formatFraction(tree, 100)}\\)。`
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
        const dc = randInt(3, 9);
        const de = randInt(2, 7);
        const scale = randInt(3, 8);
        const bc = dc * scale;
        const ab = de * scale;
        questions.push(
          `為測河寬 \\(AB\\)，在岸邊取點 \\(C\\)，使 \\(AB\\perp BC\\)。再在直線 \\(BC\\) 上取點 \\(D\\)，作 \\(DE\\perp BC\\)，且 \\(A,C,E\\) 三點共線。若 \\(BC=${bc}\\) 公尺、\\(DC=${dc}\\) 公尺、\\(DE=${de}\\) 公尺，求 \\(AB\\)。`
        );
        answers.push(
          `簡答：\\(AB=${ab}\\) 公尺。過程：\\(\\triangle ABC\\sim\\triangle EDC\\)，所以 \\(AB:DE=BC:DC\\)。代入 \\(AB:${de}=${bc}:${dc}\\)，得 \\(AB=${ab}\\)。`
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
        const [p, q] = coprimePair(2, 12);
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
        const [p, q] = coprimePair(2, 20);
        const areaRatio = reduceRatioTriple([q * q, p * p]);
        questions.push(`若一個圖形相似放大，對應邊長由 \\(${p}\\) 變為 \\(${q}\\)。求放大後圖形與原圖形的面積比。`);
        answers.push(
          `簡答：\\(${ratioTex(areaRatio)}\\)。過程：題目問放大後圖形與原圖形的面積比，邊長比為 \\(${q}:${p}\\)，所以面積比為 \\(${q}^2:${p}^2=${ratioTex(areaRatio)}\\)。`
        );
      } else if (type === 'rightAltitude') {
        const [m, n] = coprimePair(2, 9);
        const scale = randInt(1, 4);
        const bd = m * m * scale;
        const dc = n * n * scale;
        const ad = m * n * scale;
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
        const [baseLegA, baseLegB, baseHyp] = triples[randInt(0, triples.length - 1)];
        const scale = randInt(1, 6);
        const legA = baseLegA * scale;
        const legB = baseLegB * scale;
        const hyp = baseHyp * scale;
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
        const [baseA, baseB, baseC] = triples[randInt(0, triples.length - 1)];
        const scale = randInt(1, 5);
        const a = baseA * scale;
        const b = baseB * scale;
        const c = baseC * scale;
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
    return { questions, summaryAnswers, answers };
  }

  function buildJ521Set(kind, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
    return { questions, summaryAnswers, answers };
  }

  function buildJ522Set(kind, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
      [1, 2, 3],
      [1, 3, 4],
      [2, 3, 4],
      [2, 3, 5],
      [2, 5, 3],
      [3, 4, 5],
      [3, 5, 7],
      [4, 5, 6],
      [5, 7, 6],
      [5, 8, 7],
      [7, 8, 9],
      [8, 10, 12],
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
        const sideArc = 10 * randInt(3, 15);
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
          [1, 3],
          [3, 1],
          [1, 4],
          [4, 1],
          [1, 5],
          [5, 1],
          [2, 7],
          [7, 2],
          [7, 8],
          [8, 7],
        ];
        const [p, q] = pairs[randInt(0, pairs.length - 1)];
        const angleB = (180 * p) / (p + q);
        const angleD = 180 - angleB;
        questions.push(
          `圓內接四邊形 \\(ABCD\\) 中，\\(\\angle B:\\angle D=${p}:${q}\\)。求 \\(\\angle B\\) 與 \\(\\angle D\\)。`
        );
        answers.push(
          `簡答：\\(\\angle B=${degree(angleB)}\\)，\\(\\angle D=${degree(angleD)}\\)。過程：對角互補，設 \\(\\angle B=${formatLinearTerm(p, 'k')}\\)、\\(\\angle D=${formatLinearTerm(q, 'k')}\\)，則 \\((${p}+${q})k=180\\)，可得兩角。`
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
        let a = 2;
        let c = 3;
        let x = 16;
        let b = 14;
        let d = 180 - (a + c) * x - b;
        for (let attempt = 0; attempt < 30; attempt += 1) {
          const nextA = randInt(2, 4);
          const nextC = randInt(2, 4);
          const maxX = Math.max(8, Math.floor(145 / (nextA + nextC)));
          const nextX = randInt(8, Math.min(24, maxX));
          const nextB = randInt(5, 30);
          const nextD = 180 - (nextA + nextC) * nextX - nextB;
          if (nextD >= 5) {
            a = nextA;
            c = nextC;
            x = nextX;
            b = nextB;
            d = nextD;
            break;
          }
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
        const minorArc = 10 * randInt(5, 14);
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
        const sideChoices = [4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30];
        const n = sideChoices[randInt(0, sideChoices.length - 1)];
        const arcMeasure = 360 / n;
        const angle = arcMeasure / 2;
        questions.push(`正 \\(${n}\\) 邊形內接於圓，過頂點 \\(A\\) 作圓的切線。求此切線與邊 \\(AB\\) 所成的銳角。`);
        answers.push(
          `簡答：\\(${degree(angle)}\\)。過程：相鄰頂點所對弧為 \\(360^\\circ\\div${n}=${degree(arcMeasure)}\\)。弦切角等於同弧圓周角，所以角度為 \\(${degree(angle)}\\)。`
        );
      } else if (type === 'majorMinorInscribedAngle') {
        const majorArc = 10 * randInt(19, 32);
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
    return { questions, summaryAnswers, answers };
  }

  function buildJ523Set(kind, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
    const makeIntersectingChordSegments = () => {
      for (let attempt = 0; attempt < 30; attempt += 1) {
        const pc = randInt(3, 12);
        const pd = randInt(4, 18);
        const product = pc * pd;
        const divisors = [];
        for (let candidate = 2; candidate <= Math.min(18, Math.floor(Math.sqrt(product))); candidate += 1) {
          if (product % candidate === 0) {
            const partner = product / candidate;
            if (partner >= 3 && partner <= 30 && candidate !== pc) divisors.push([candidate, partner]);
          }
        }
        if (divisors.length) {
          const [pa, pb] = divisors[randInt(0, divisors.length - 1)];
          return [pa, pb, pc, pd];
        }
      }
      return [4, 9, 6, 6];
    };
    const makeTangentSecantAlgebra = () => {
      const rootA = randInt(2, 7);
      const rootB = rootA + randInt(1, 4);
      const x = rootA * rootA;
      const offset = rootB * rootB - x;
      const pt = rootA * rootB;
      return { x, offset, pt };
    };
    const makeExternalSecantsAlgebra = () => {
      for (let attempt = 0; attempt < 30; attempt += 1) {
        const x = randInt(3, 12);
        const offset = randInt(2, 10);
        const product = x * (x + offset);
        const divisors = [];
        for (let candidate = 2; candidate <= Math.min(16, Math.floor(Math.sqrt(product))); candidate += 1) {
          if (product % candidate === 0) {
            const partner = product / candidate;
            if (partner > candidate && partner <= 90) divisors.push([candidate, partner]);
          }
        }
        if (divisors.length) {
          const [pc, pd] = divisors[randInt(0, divisors.length - 1)];
          return { x, offset, pc, pd };
        }
      }
      return { x: 4, offset: 2, pc: 3, pd: 8 };
    };
    for (let i = 0; i < count; i += 1) {
      const type = selected[i % selected.length];
      if (type === 'intersectingChordsSegment') {
        const [pa, pb, pc, pd] = makeIntersectingChordSegments();
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
        const { x, offset, pt } = makeTangentSecantAlgebra();
        questions.push(
          `自圓外一點 \\(P\\) 作切線 \\(PT\\) 與割線 \\(PAB\\)。若 \\(PT=${pt}\\)、\\(PA=x\\)、\\(PB=x+${offset}\\)，求 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：切割線定理 \\(PT^2=PA\\times PB\\)，所以 \\(${pt}^2=x(x+${offset})\\)，解得正值 \\(x=${x}\\)。`
        );
      } else if (type === 'algebraExternalSecants') {
        const { x, offset, pc, pd } = makeExternalSecantsAlgebra();
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
          `簡答：\\(AB=${total}\\)。過程：設 \\(PA=${formatLinearTerm(m, 'k')}\\)、\\(PB=${formatLinearTerm(n, 'k')}\\)。由 \\(PA\\times PB=PC\\times PD\\)，得 \\(${m * n}k^2=${pc}\\times${pd}\\)，所以 \\(k=${k}\\)，\\(AB=(${m}+${n})k=${total}\\)。`
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
        const throughCenter = i % 2 === 0;
        const cm = throughCenter ? r - d : half;
        const md = throughCenter ? r + d : half;
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
          `兩弦 \\(AB\\)、\\(CD\\) 所在直線延長後交於圓外點 \\(P\\)。若 \\(PA=${outsideA}\\)、\\(AB=${chordA}\\)、\\(PC=${outsideC}\\)，求 \\(CD\\) 的長度。`
        );
        answers.push(
          `簡答：\\(CD=${chordC}\\)。過程：從同一圓外點引兩割線，滿足 \\(PA\\times PB=PC\\times PD\\)。\\(PB=${totalA}\\)，所以 \\(${outsideA}\\times${totalA}=${outsideC}\\times PD\\)，得 \\(PD=${totalC}\\)，故 \\(CD=${chordC}\\)。`
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
          `簡答：\\(AB=${total}\\)。過程：設 \\(PA=${formatLinearTerm(m, 'k')}\\)、\\(PB=${formatLinearTerm(n, 'k')}\\)，則 \\(PA\\times PB=${m * n}k^2=${product}\\)，得 \\(k=${k}\\)，所以 \\(AB=(${m}+${n})k=${total}\\)。`
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
        if (pb <= pa) {
          i -= 1;
          continue;
        }
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
        if (pb <= pa) {
          i -= 1;
          continue;
        }
        questions.push(
          `圓外點 \\(P\\) 對圓作切線 \\(PT\\)，且 \\(PT=${pt}\\)。若另一割線 \\(PAB\\) 滿足 \\(PA=${pa}\\)，求 \\(PB\\)。`
        );
        answers.push(
          `簡答：\\(PB=${pb}\\)。過程：切割線定理 \\(PT^2=PA\\times PB\\)，所以 \\(${pt}^2=${pa}\\times PB\\)，得 \\(PB=${pb}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ531Set(kind, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
        const variablePairs = [
          ['a', 'b'],
          ['m', 'n'],
          ['p', 'q'],
          ['x', 'y'],
          ['r', 's'],
          ['u', 'v'],
          ['A', 'B'],
          ['M', 'N'],
          ['X', 'Y'],
          ['R', 'T'],
          ['c', 'd'],
          ['e', 'f'],
          ['g', 'h'],
          ['P', 'Q'],
        ];
        const [evenVar, oddVar] = variablePairs[randInt(0, variablePairs.length - 1)];
        questions.push(
          `已知 \\(${evenVar}\\) 為偶數，\\(${oddVar}\\) 為奇數。證明 \\(${evenVar}+${oddVar}\\) 必為奇數。`
        );
        answers.push(
          `簡答：必為奇數。過程：設 \\(${evenVar}=2r\\)、\\(${oddVar}=2s+1\\)，則 \\(${evenVar}+${oddVar}=2r+2s+1=2(r+s)+1\\)，符合奇數形式。`
        );
      } else if (type === 'oddProduct') {
        const variablePairs = [
          ['a', 'b'],
          ['m', 'n'],
          ['p', 'q'],
          ['x', 'y'],
          ['r', 's'],
          ['u', 'v'],
          ['c', 'd'],
          ['e', 'f'],
          ['g', 'h'],
          ['A', 'B'],
          ['M', 'N'],
          ['P', 'Q'],
        ];
        const [first, second] = variablePairs[randInt(0, variablePairs.length - 1)];
        questions.push(`已知 \\(${first}\\)、\\(${second}\\) 均為奇數。證明 \\(${first}${second}\\) 必為奇數。`);
        answers.push(
          `簡答：\\(${first}${second}\\) 必為奇數。過程：設 \\(${first}=2m+1\\)、\\(${second}=2n+1\\)，則 \\(${first}${second}=(2m+1)(2n+1)=2(2mn+m+n)+1\\)，所以為奇數。`
        );
      } else if (type === 'squareParity') {
        const variable = ['n', 'm', 'a', 'x', 'p', 'q', 'r', 's', 'u', 'v', 'A', 'B'][randInt(0, 11)];
        const parity = randInt(0, 1) === 0 ? '奇數' : '偶數';
        const form = parity === '奇數' ? '2k+1' : '2k';
        questions.push(`已知 \\(${variable}\\) 為${parity}。證明 \\(${variable}^2\\) 必為${parity}。`);
        if (parity === '奇數') {
          answers.push(
            `簡答：\\(${variable}^2\\) 必為奇數。過程：設 \\(${variable}=${form}\\)，則 \\(${variable}^2=(2k+1)^2=4k^2+4k+1=2(2k^2+2k)+1\\)。`
          );
        } else {
          answers.push(`簡答：\\(${variable}^2\\) 必為偶數。過程：設 \\(${variable}=${form}\\)，則 \\(${variable}^2=(2k)^2=4k^2=2(2k^2)\\)。`);
        }
      } else if (type === 'linearParity') {
        const variable = ['n', 'm', 'x', 'p', 'q'][randInt(0, 4)];
        const c = randInt(1, 30);
        const parity = c % 2 === 0 ? '偶數' : '奇數';
        questions.push(`已知 \\(${variable}\\) 為偶數。判斷並證明 \\(${variable}+${c}\\) 的奇偶性。`);
        answers.push(
          `簡答：\\(${variable}+${c}\\) 為${parity}。過程：設 \\(${variable}=2k\\)，則 \\(${variable}+${c}=2k+${c}\\)。因為 \\(${c}\\) 為${parity}，所以 \\(${variable}+${c}\\) 為${parity}。`
        );
      } else if (type === 'oddSquaresSum') {
        const variablePairs = [
          ['a', 'b'],
          ['m', 'n'],
          ['p', 'q'],
          ['x', 'y'],
          ['r', 's'],
          ['u', 'v'],
          ['c', 'd'],
          ['e', 'f'],
          ['g', 'h'],
          ['A', 'B'],
          ['M', 'N'],
          ['P', 'Q'],
        ];
        const [first, second] = variablePairs[randInt(0, variablePairs.length - 1)];
        questions.push(
          `已知 \\(${first}\\)、\\(${second}\\) 均為奇數。證明 \\(${first}^2+${second}^2\\) 必為 \\(2\\) 的倍數且不是 \\(4\\) 的倍數。`
        );
        answers.push(
          `簡答：必為 \\(2\\) 的倍數，且不是 \\(4\\) 的倍數。過程：奇數平方除以 \\(4\\) 的餘數為 \\(1\\)，所以 \\(${first}^2+${second}^2\\equiv1+1\\equiv2\\pmod 4\\)。因此它是偶數，但不是 \\(4\\) 的倍數。`
        );
      } else if (type === 'consecutiveProductDivisible') {
        const length = [2, 3, 4][randInt(0, 2)];
        const start = randInt(0, 8);
        const divisor = length === 2 ? 2 : length === 3 ? 6 : 24;
        const factors = Array.from({ length }, (_, idx) => `n+${start + idx}`)
          .map((text) => text.replace('+0', ''))
          .join(')(');
        questions.push(`證明任意 \\(${length}\\) 個連續整數的乘積 \\((${factors})\\) 必為 \\(${divisor}\\) 的倍數。`);
        answers.push(
          `簡答：必為 \\(${divisor}\\) 的倍數。過程：\\(${length}\\) 個連續整數中必含有足夠的因數：${length === 2 ? '至少一個偶數，所以含因數 2' : length === 3 ? '至少一個 3 的倍數且至少一個偶數，所以含因數 6' : '必含 4 的倍數、3 的倍數與另一個偶因數，所以含因數 24'}。`
        );
      } else if (type === 'differenceSquaresDivisible') {
        const gap = randInt(2, 18);
        questions.push(
          `已知 \\(a\\)、\\(b\\) 為整數且 \\(a-b=${gap}\\)。證明 \\(a^2-b^2\\) 必為 \\(${gap}\\) 的倍數。`
        );
        answers.push(
          `簡答：必為 \\(${gap}\\) 的倍數。過程：\\(a^2-b^2=(a-b)(a+b)=${gap}(a+b)\\)，因此含有因數 \\(${gap}\\)。`
        );
      } else if (type === 'shiftedSquareMultiple') {
        const shift = randInt(1, 20);
        questions.push(`已知 \\(k\\) 為正整數。證明 \\((k+${shift})^2-k^2\\) 必為 \\(${shift}\\) 的倍數。`);
        answers.push(
          `簡答：必為 \\(${shift}\\) 的倍數。過程：\\((k+${shift})^2-k^2=${shift}(2k+${shift})\\)，所以此式含因數 \\(${shift}\\)。`
        );
      } else if (type === 'quadraticCompletionMultiple') {
        const root = randInt(2, 12);
        const divisor = root * root;
        const multiplier = root * randInt(1, 5);
        questions.push(
          `已知 \\(n\\) 為整數，證明 \\((${multiplier}n+${root})^2-${2 * root}(${multiplier}n+${root})+${divisor}\\) 必為 \\(${divisor}\\) 的倍數。`
        );
        answers.push(
          `簡答：必為 \\(${divisor}\\) 的倍數。過程：令 \\(x=${multiplier}n+${root}\\)，原式 \\(=x^2-${2 * root}x+${divisor}=(x-${root})^2=(${multiplier}n)^2=${multiplier * multiplier}n^2\\)，可看出含有因數 \\(${divisor}\\)。`
        );
      } else if (type === 'factorSubstitutionMultiple') {
        const ratio = randInt(2, 12);
        const divisor = ratio * ratio + 1;
        questions.push(
          `已知 \\(a\\)、\\(b\\) 為正整數且 \\(a=${ratio}b\\)。證明 \\(a^2+b^2\\) 必為 \\(${divisor}\\) 的倍數。`
        );
        answers.push(
          `簡答：必為 \\(${divisor}\\) 的倍數。過程：代入 \\(a=${ratio}b\\)，得 \\(a^2+b^2=(${ratio}b)^2+b^2=${divisor}b^2\\)，所以為 \\(${divisor}\\) 的倍數。`
        );
      } else if (type === 'squareRemainder') {
        const divisor = [4, 5, 6, 7][randInt(0, 3)];
        const remainder = randInt(1, divisor - 1);
        const squareRemainderValue = (remainder * remainder) % divisor;
        questions.push(
          `若 \\(n\\) 除以 \\(${divisor}\\) 的餘數為 \\(${remainder}\\)，求 \\(n^2\\) 除以 \\(${divisor}\\) 的餘數。`
        );
        answers.push(
          `簡答：餘數為 \\(${squareRemainderValue}\\)。過程：設 \\(n=${divisor}q+${remainder}\\)，則 \\(n^2\\equiv ${remainder}^2\\equiv ${squareRemainderValue}\\pmod{${divisor}}\\)。`
        );
      } else if (type === 'remainderParity') {
        const divisor = [4, 6, 8, 10, 12, 14][randInt(0, 5)];
        const oddRemainders = Array.from({ length: divisor - 1 }, (_, idx) => idx + 1).filter((value) => value % 2 === 1);
        const remainder = oddRemainders[randInt(0, oddRemainders.length - 1)];
        questions.push(
          `若 \\(a\\) 除以 \\(${divisor}\\) 的餘數為 \\(${remainder}\\)，判斷 \\(a\\) 的奇偶性並說明理由。`
        );
        answers.push(
          `簡答：\\(a\\) 為奇數。過程：\\(${divisor}\\) 是偶數，\\(a=${divisor}q+${remainder}\\)。偶數倍加奇數仍為奇數，所以 \\(a\\) 為奇數。`
        );
      } else if (type === 'expressionRemainder') {
        const divisor = [4, 5, 7][randInt(0, 2)];
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
        const divisor = [4, 6, 8, 10][randInt(0, 3)];
        const remainder = randInt(1, divisor - 1);
        questions.push(
          `若 \\(n\\) 為正整數且 \\(n\\) 除以 \\(${divisor}\\) 的餘數為 \\(${remainder}\\)。判斷 \\(n^2+n\\) 是否一定為 \\(${divisor}\\) 的倍數。`
        );
        const result = (remainder * remainder + remainder) % divisor;
        const verdict = result === 0 ? '是' : '否';
        answers.push(
          `簡答：${verdict}。過程：只需看餘數，\\(n^2+n\\equiv${remainder}^2+${remainder}\\equiv${result}\\pmod{${divisor}}\\)。${result === 0 ? `因此一定是 ${divisor} 的倍數。` : `餘數不為 0，因此不會是 ${divisor} 的倍數。`}`
        );
      } else if (type === 'threeConsecutiveProductSix') {
        const start = randInt(0, 24);
        const terms = [0, 1, 2].map((offset) => `n+${start + offset}`.replace('+0', '')).join('、');
        questions.push(`證明任意三個連續整數 \\(${terms}\\) 的乘積必為 \\(6\\) 的倍數。`);
        answers.push(
          `簡答：必為 \\(6\\) 的倍數。過程：三個連續整數中必有一個是 \\(3\\) 的倍數，也必有一個是偶數，因此乘積同時含因數 \\(3\\) 與 \\(2\\)，所以為 \\(6\\) 的倍數。`
        );
      } else if (type === 'consecutiveSumMultiple') {
        const countN = [3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25][randInt(0, 11)];
        questions.push(`證明任意 \\(${countN}\\) 個連續整數的和必為 \\(${countN}\\) 的倍數。`);
        answers.push(
          `簡答：必為 \\(${countN}\\) 的倍數。過程：設中間數為 \\(m\\)，這 \\(${countN}\\) 個數可左右配對，總和為 \\(${countN}m\\)，所以為 \\(${countN}\\) 的倍數。`
        );
      } else if (type === 'consecutiveOddSquaresEight') {
        const shift = randInt(0, 24);
        questions.push(`證明兩個連續奇數 \\(2k+${2 * shift + 1}\\)、\\(2k+${2 * shift + 3}\\) 的平方差必為 \\(8\\) 的倍數。`);
        answers.push(
          `簡答：必為 \\(8\\) 的倍數。過程：平方差為 \\((2k+${2 * shift + 3})^2-(2k+${2 * shift + 1})^2=8(k+${shift + 1})\\)，所以必為 \\(8\\) 的倍數。`
        );
      } else if (type === 'twoConsecutiveEvenProduct') {
        const shift = randInt(0, 24);
        const firstTerm = shift === 0 ? '2k' : `2k+${2 * shift}`;
        questions.push(`證明兩個連續偶數 \\(${firstTerm}\\)、\\(2k+${2 * shift + 2}\\) 的乘積必為 \\(8\\) 的倍數。`);
        answers.push(
          `簡答：必為 \\(8\\) 的倍數。過程：令 \\(m=k+${shift}\\)，兩數為 \\(2m\\)、\\(2m+2\\)，乘積為 \\(4m(m+1)\\)。因為 \\(m\\)、\\(m+1\\) 必有一個偶數，所以整體含因數 \\(8\\)。`
        );
      } else if (type === 'consecutiveWeightedSumFour') {
        const variableTriples = [
          ['a', 'b', 'c'],
          ['x', 'y', 'z'],
          ['p', 'q', 'r'],
          ['m', 'n', 's'],
          ['A', 'B', 'C'],
          ['P', 'Q', 'R'],
          ['u', 'v', 'w'],
          ['r', 's', 't'],
          ['c', 'd', 'e'],
          ['f', 'g', 'h'],
          ['M', 'N', 'P'],
          ['X', 'Y', 'Z'],
        ];
        const [first, middle, last] = variableTriples[randInt(0, variableTriples.length - 1)];
        questions.push(
          `已知 \\(${first}\\)、\\(${middle}\\)、\\(${last}\\) 是三個連續整數，且 \\(${first}<${middle}<${last}\\)。證明 \\(${first}+2${middle}+${last}\\) 必為 \\(4\\) 的倍數。`
        );
        answers.push(
          `簡答：必為 \\(4\\) 的倍數。過程：設 \\(${first}=n\\)、\\(${middle}=n+1\\)、\\(${last}=n+2\\)，則 \\(${first}+2${middle}+${last}=n+2(n+1)+(n+2)=4n+4=4(n+1)\\)。`
        );
      } else if (type === 'positiveSquareOrder') {
        const variablePairs = [['a', 'b'], ['x', 'y'], ['m', 'n'], ['p', 'q'], ['r', 's'], ['u', 'v'], ['A', 'B'], ['M', 'N'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['X', 'Y']];
        const [larger, smaller] = variablePairs[randInt(0, variablePairs.length - 1)];
        questions.push(`已知 \\(${larger}>${smaller}>0\\)。證明 \\(${larger}^2>${smaller}^2\\)。`);
        answers.push(
          `簡答：\\(${larger}^2>${smaller}^2\\)。過程：\\(${larger}^2-${smaller}^2=(${larger}-${smaller})(${larger}+${smaller})\\)。因為 \\(${larger}-${smaller}>0\\)、\\(${larger}+${smaller}>0\\)，所以 \\(${larger}^2-${smaller}^2>0\\)。`
        );
      } else if (type === 'negativeSquareReverse') {
        const variablePairs = [['a', 'b'], ['x', 'y'], ['m', 'n'], ['p', 'q'], ['r', 's'], ['u', 'v'], ['A', 'B'], ['M', 'N'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['X', 'Y']];
        const [smaller, larger] = variablePairs[randInt(0, variablePairs.length - 1)];
        questions.push(`已知 \\(${smaller}<${larger}<0\\)。證明 \\(${smaller}^2>${larger}^2\\)。`);
        answers.push(`簡答：\\(${smaller}^2>${larger}^2\\)。過程：由 \\(${smaller}<${larger}<0\\) 可知 \\(|${smaller}|>|${larger}|\\)，兩邊平方得 \\(${smaller}^2>${larger}^2\\)。`);
      } else if (type === 'positiveReciprocalReverse') {
        const variablePairs = [['a', 'b'], ['x', 'y'], ['m', 'n'], ['p', 'q'], ['r', 's'], ['u', 'v'], ['A', 'B'], ['M', 'N'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['X', 'Y']];
        const [larger, smaller] = variablePairs[randInt(0, variablePairs.length - 1)];
        questions.push(`已知 \\(${larger}>${smaller}>0\\)。證明 \\(\\frac{1}{${larger}}<\\frac{1}{${smaller}}\\)。`);
        answers.push(
          `簡答：\\(\\frac{1}{${larger}}<\\frac{1}{${smaller}}\\)。過程：\\(\\frac{1}{${smaller}}-\\frac{1}{${larger}}=\\frac{${larger}-${smaller}}{${larger}${smaller}}\\)。因為 \\(${larger}-${smaller}>0\\)、\\(${larger}${smaller}>0\\)，所以差為正。`
        );
      } else if (type === 'negativeReciprocalReverse') {
        const variablePairs = [['a', 'b'], ['x', 'y'], ['m', 'n'], ['p', 'q'], ['r', 's'], ['u', 'v'], ['A', 'B'], ['M', 'N'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['X', 'Y']];
        const [smaller, larger] = variablePairs[randInt(0, variablePairs.length - 1)];
        questions.push(`已知 \\(${smaller}<${larger}<0\\)。判斷 \\(\\frac{1}{${smaller}}\\) 與 \\(\\frac{1}{${larger}}\\) 的大小並證明。`);
        answers.push(
          `簡答：\\(\\frac{1}{${smaller}}>\\frac{1}{${larger}}\\)。過程：\\(\\frac{1}{${smaller}}-\\frac{1}{${larger}}=\\frac{${larger}-${smaller}}{${smaller}${larger}}\\)。因為 \\(${larger}-${smaller}>0\\)、\\(${smaller}${larger}>0\\)，所以差為正。`
        );
      } else if (type === 'multiplyByNegative') {
        const variableTriples = [['a', 'b', 'c'], ['x', 'y', 'k'], ['m', 'n', 'r'], ['p', 'q', 's'], ['A', 'B', 't'], ['M', 'N', 'u'], ['r', 's', 'v'], ['c', 'd', 'w'], ['P', 'Q', 'h'], ['X', 'Y', 'g']];
        const [larger, smaller, negative] = variableTriples[randInt(0, variableTriples.length - 1)];
        questions.push(`已知 \\(${larger}>${smaller}\\) 且 \\(${negative}<0\\)。證明 \\(${larger}${negative}<${smaller}${negative}\\)。`);
        answers.push(
          `簡答：\\(${larger}${negative}<${smaller}${negative}\\)。過程：由 \\(${larger}-${smaller}>0\\)、\\(${negative}<0\\)，得 \\(${negative}(${larger}-${smaller})<0\\)，也就是 \\(${larger}${negative}-${smaller}${negative}<0\\)，所以 \\(${larger}${negative}<${smaller}${negative}\\)。`
        );
      } else if (type === 'amGmTwoNumbers') {
        const variablePairs = [['a', 'b'], ['x', 'y'], ['m', 'n'], ['p', 'q'], ['r', 's'], ['u', 'v'], ['A', 'B'], ['M', 'N'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['X', 'Y']];
        const [first, second] = variablePairs[randInt(0, variablePairs.length - 1)];
        questions.push(`已知 \\(${first}\\)、\\(${second}\\) 為正數。證明 \\(\\frac{${first}+${second}}{2}\\ge \\sqrt{${first}${second}}\\)。`);
        answers.push(
          `簡答：成立。過程：\\((\\sqrt{${first}}-\\sqrt{${second}})^2\\ge0\\)，展開得 \\(${first}+${second}-2\\sqrt{${first}${second}}\\ge0\\)，所以 \\(\\frac{${first}+${second}}{2}\\ge\\sqrt{${first}${second}}\\)。`
        );
      } else if (type === 'radicalOrder') {
        const variable = ['a', 'x', 't', 'm', 'n', 'p', 'q', 'r', 'u', 'v', 'A', 'B'][randInt(0, 11)];
        questions.push(`已知 \\(0<${variable}<1\\)。證明 \\(\\sqrt{${variable}}>${variable}\\)。`);
        answers.push(
          `簡答：\\(\\sqrt{${variable}}>${variable}\\)。過程：因為 \\(0<${variable}<1\\)，所以 \\(0<\\sqrt{${variable}}<1\\)。兩邊同乘正數 \\(\\sqrt{${variable}}\\)，得 \\(${variable}<\\sqrt{${variable}}\\)。`
        );
      } else if (type === 'sameSignProductInequality') {
        const variables = [
          ['a', 'b', 'c', 'd'],
          ['p', 'q', 'r', 's'],
          ['w', 'x', 'y', 'z'],
          ['m', 'n', 'r', 't'],
          ['A', 'B', 'C', 'D'],
          ['P', 'Q', 'R', 'T'],
          ['u', 'v', 's', 'h'],
          ['e', 'f', 'g', 'h'],
          ['L', 'M', 'N', 'P'],
          ['X', 'Y', 'Z', 'W'],
        ][randInt(0, 9)];
        const [first, second, third, fourth] = variables;
        questions.push(
          `已知 \\(${first}${second}<0\\)、\\(${second}${third}>0\\)、\\(${third}${fourth}<0\\)。判斷 \\(${first}\\)、\\(${fourth}\\) 是否同號，並證明 \\(${first}${second}${third}${fourth}>0\\)。`
        );
        answers.push(
          `簡答：\\(${first}\\)、\\(${fourth}\\) 同號，且 \\(${first}${second}${third}${fourth}>0\\)。過程：\\(${first}${second}<0\\) 表示 \\(${first}\\)、\\(${second}\\) 異號；\\(${second}${third}>0\\) 表示 \\(${second}\\)、\\(${third}\\) 同號；\\(${third}${fourth}<0\\) 表示 \\(${third}\\)、\\(${fourth}\\) 異號，所以 \\(${first}\\)、\\(${fourth}\\) 同號。又 \\((${first}${second})(${third}${fourth})>0\\)，故 \\(${first}${second}${third}${fourth}>0\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ532Set(kind, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
      ['D', 'E', 'F'],
      ['L', 'M', 'N'],
      ['R', 'S', 'T'],
      ['U', 'V', 'W'],
      ['H', 'I', 'J'],
      ['A', 'D', 'E'],
      ['M', 'P', 'Q'],
    ];
    const quadrilaterals = ['ABCD', 'PQRS', 'WXYZ', 'DEFG', 'LMNO', 'RSTU', 'HIJK', 'UVWX', 'MNOP', 'EFGH', 'JKLM', 'STUV'];
    const arcLabels = [
      ['AB', 'CD', 'AC', 'BD'],
      ['PQ', 'RS', 'PR', 'QS'],
      ['WX', 'YZ', 'WY', 'XZ'],
      ['DE', 'FG', 'DF', 'EG'],
      ['HI', 'JK', 'HJ', 'IK'],
      ['LM', 'NO', 'LN', 'MO'],
      ['RS', 'TU', 'RT', 'SU'],
      ['UV', 'WX', 'UW', 'VX'],
      ['MN', 'PQ', 'MP', 'NQ'],
      ['EF', 'GH', 'EG', 'FH'],
      ['JK', 'LM', 'JL', 'KM'],
      ['ST', 'VW', 'SV', 'TW'],
    ];
    const arc = (name) => `\\overset{\\frown}{${name}}`;
    for (let i = 0; i < count; i += 1) {
      const type = selected[i % selected.length];
      const [a, b, c] = letters[randInt(0, letters.length - 1)];
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
        const labels = [
          ['A', 'P', 'Q', 'D'],
          ['B', 'O', 'R', 'E'],
          ['M', 'Q', 'S', 'N'],
          ['C', 'T', 'U', 'F'],
          ['D', 'I', 'V', 'G'],
          ['E', 'J', 'W', 'H'],
          ['L', 'K', 'N', 'M'],
          ['R', 'S', 'T', 'U'],
          ['X', 'Y', 'Z', 'W'],
          ['F', 'G', 'H', 'I'],
          ['P', 'R', 'S', 'Q'],
          ['U', 'V', 'M', 'N'],
        ][randInt(0, 11)];
        const [left, vertex, point, right] = labels;
        questions.push(
          `已知 \\(\\angle ${left}${vertex}${point}=\\angle ${point}${vertex}${right}\\)，且 \\(${point}${left}\\perp ${vertex}${left}\\)、\\(${point}${right}\\perp ${vertex}${right}\\)。證明 \\(${point}${left}=${point}${right}\\)。`
        );
        answers.push(
          `簡答：\\(${point}${left}=${point}${right}\\)。過程：點 \\(${point}\\) 在角平分線上。角平分線上的點到角兩邊距離相等，因此 \\(${point}${left}=${point}${right}\\)。`
        );
      } else if (type === 'squareSharedVertex') {
        const labels = [
          ['ABCD', 'AEFG', 'ABE', 'ADG', 'BE', 'DG'],
          ['PQRS', 'PTUV', 'PQT', 'PSV', 'QT', 'SV'],
          ['WXYZ', 'WABC', 'WXA', 'WZC', 'XA', 'ZC'],
          ['DEFG', 'DHIJ', 'DEH', 'DGJ', 'EH', 'GJ'],
          ['LMNO', 'LPQR', 'LMP', 'LOR', 'MP', 'OR'],
          ['RSTU', 'RVWX', 'RSV', 'RUX', 'SV', 'UX'],
          ['HIJK', 'HLMN', 'HIL', 'HKN', 'IL', 'KN'],
          ['UVWX', 'UABC', 'UVA', 'UXC', 'VA', 'XC'],
          ['MNOP', 'MSTU', 'MNS', 'MPU', 'NS', 'PU'],
          ['EFGH', 'EJKL', 'EFJ', 'EHL', 'FJ', 'HL'],
        ][randInt(0, 9)];
        const [sq1, sq2, tri1, tri2, side1, side2] = labels;
        questions.push(
          `正方形 \\(${sq1}\\) 與 \\(${sq2}\\) 共用頂點 \\(${sq1[0]}\\)，且 \\(\\angle ${tri1[1]}${tri1[0]}${tri1[2]}=\\angle ${tri2[1]}${tri2[0]}${tri2[2]}\\)。證明 \\(\\triangle ${tri1}\\cong\\triangle ${tri2}\\)，並推出 \\(${side1}=${side2}\\)。`
        );
        answers.push(
          `簡答：\\(\\triangle ${tri1}\\cong\\triangle ${tri2}\\)，所以 \\(${side1}=${side2}\\)。過程：兩個正方形給出 \\(${tri1[0]}${tri1[1]}=${tri2[0]}${tri2[1]}\\)、\\(${tri1[0]}${tri1[2]}=${tri2[0]}${tri2[2]}\\)，且夾角由題設相等。由 SAS 全等，得對應邊 \\(${side1}=${side2}\\)。`
        );
      } else if (type === 'equilateralSharedVertex') {
        const labels = [
          ['ABC', 'ADE', 'BD', 'CE'],
          ['PQR', 'PST', 'QS', 'RT'],
          ['XYZ', 'XUV', 'YU', 'ZV'],
          ['DEF', 'DGH', 'EG', 'FH'],
          ['LMN', 'LPQ', 'MP', 'NQ'],
          ['RST', 'RUV', 'SU', 'TV'],
          ['HIJ', 'HKL', 'IK', 'JL'],
          ['UVW', 'UXY', 'VX', 'WY'],
          ['MNO', 'MPQ', 'NP', 'OQ'],
          ['EFG', 'EHI', 'FH', 'GI'],
        ][randInt(0, 9)];
        const [tri1, tri2, side1, side2] = labels;
        questions.push(
          `\\(\\triangle ${tri1}\\) 與 \\(\\triangle ${tri2}\\) 皆為正三角形，且共用頂點 \\(${tri1[0]}\\)，並滿足 \\(\\angle ${tri1[1]}${tri1[0]}${tri2[1]}=\\angle ${tri1[2]}${tri1[0]}${tri2[2]}\\)。證明 \\(${side1}=${side2}\\)。`
        );
        answers.push(
          `簡答：\\(${side1}=${side2}\\)。過程：正三角形給出 \\(${tri1[0]}${tri1[1]}=${tri1[0]}${tri1[2]}\\)、\\(${tri2[0]}${tri2[1]}=${tri2[0]}${tri2[2]}\\)。由題設兩夾角相等，兩個由共用頂點組成的三角形可用 SAS 判定全等，故 \\(${side1}=${side2}\\)。`
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
        const labels = [
          ['AB', 'CD', 'AD', 'BC', 'O', 'AOB', 'DOC', 'OA', 'OC', 'OB', 'OD'],
          ['PQ', 'RS', 'PR', 'QS', 'T', 'PTQ', 'RTS', 'TP', 'TS', 'TQ', 'TR'],
          ['WX', 'YZ', 'WY', 'XZ', 'O', 'WOX', 'YOZ', 'OW', 'OZ', 'OX', 'OY'],
          ['DE', 'FG', 'DF', 'EG', 'P', 'DPE', 'FPG', 'PD', 'PG', 'PE', 'PF'],
          ['LM', 'NO', 'LO', 'MN', 'Q', 'LQM', 'OQN', 'QL', 'QN', 'QM', 'QO'],
          ['RS', 'TU', 'RT', 'SU', 'V', 'RVS', 'TVU', 'VR', 'VU', 'VS', 'VT'],
          ['HI', 'JK', 'HJ', 'IK', 'L', 'HLI', 'JLK', 'LH', 'LK', 'LI', 'LJ'],
          ['UV', 'WX', 'UW', 'VX', 'Y', 'UYV', 'WYX', 'YU', 'YX', 'YV', 'YW'],
          ['MN', 'PQ', 'MP', 'NQ', 'R', 'MRN', 'PRQ', 'RM', 'RQ', 'RN', 'RP'],
          ['EF', 'GH', 'EG', 'FH', 'I', 'EIF', 'GIH', 'IE', 'IH', 'IF', 'IG'],
        ][randInt(0, 9)];
        const [parallel1, parallel2, diag1, diag2, meet, tri1, tri2, p1, p2, p3, p4] = labels;
        questions.push(
          `已知 \\(${parallel1}\\parallel ${parallel2}\\)，且 \\(${diag1}\\) 與 \\(${diag2}\\) 交於 \\(${meet}\\)。證明 \\(\\triangle ${tri1}\\sim\\triangle ${tri2}\\)，並推出 \\(${p1}\\times ${p2}=${p3}\\times ${p4}\\)。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `相似且 \\(${p1}\\times ${p2}=${p3}\\times ${p4}\\)`,
          `因平行線形成內錯角相等，又交點處有對頂角相等，所以兩三角形相似。由對應邊比例交叉相乘，可得 \\(${p1}\\times ${p2}=${p3}\\times ${p4}\\)。`
        );
      } else if (type === 'angleBisectorRatio') {
        const ab = randInt(4, 12);
        const ac = randInt(4, 12);
        const commonDivisor = gcdInt(ab, ac);
        const ratioText = `${ab / commonDivisor}:${ac / commonDivisor}`;
        const ratioDetailText = ratioText === `${ab}:${ac}` ? ratioText : `${ab}:${ac}=${ratioText}`;
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(AD\\) 平分 \\(\\angle BAC\\) 且交 \\(BC\\) 於 \\(D\\)。若 \\(AB=${ab}\\)、\\(AC=${ac}\\)，求 \\(BD:DC\\) 並說明理由。`
        );
        answers.push(
          `簡答：\\(BD:DC=${ratioText}\\)。過程：角平分線定理指出，內角平分線把對邊分成的兩段，長度比等於夾該角兩邊的長度比，所以 \\(BD:DC=AB:AC=${ratioDetailText}\\)。`
        );
      } else if (type === 'altitudeCircumcircleProduct') {
        const labels = [
          ['ABC', 'AD', 'AH', 'BC', 'AB', 'AC'],
          ['PQR', 'PS', 'PT', 'QR', 'PQ', 'PR'],
          ['XYZ', 'XU', 'XV', 'YZ', 'XY', 'XZ'],
          ['DEF', 'DG', 'DH', 'EF', 'DE', 'DF'],
          ['LMN', 'LP', 'LQ', 'MN', 'LM', 'LN'],
          ['RST', 'RU', 'RV', 'ST', 'RS', 'RT'],
          ['HIJ', 'HK', 'HL', 'IJ', 'HI', 'HJ'],
          ['UVW', 'UX', 'UY', 'VW', 'UV', 'UW'],
          ['MNO', 'MP', 'MQ', 'NO', 'MN', 'MO'],
          ['EFG', 'EH', 'EI', 'FG', 'EF', 'EG'],
        ][randInt(0, 9)];
        const [tri, diameter, height, base, side1, side2] = labels;
        questions.push(
          `已知 \\(\\triangle ${tri}\\) 的外接圓直徑為 \\(${diameter}\\)，且 \\(${height}\\perp ${base}\\)。證明 \\(${side1}\\times ${side2}=${diameter}\\times ${height}\\)。`
        );
        answers.push(
          `簡答：\\(${side1}\\times ${side2}=${diameter}\\times ${height}\\)。過程：因 \\(${diameter}\\) 為外接圓直徑，可利用同弧角與直角建立相似三角形，得到對應邊比例。交叉相乘即得 \\(${side1}\\times ${side2}=${diameter}\\times ${height}\\)。`
        );
      } else if (type === 'parallelChordsEqualArcs') {
        const [chord1, chord2, arc1, arc2] = arcLabels[randInt(0, arcLabels.length - 1)];
        const circularOrder = `${chord1[0]}、${chord1[1]}、${chord2[1]}、${chord2[0]}`;
        questions.push(
          `在同一圓中，圓周上四點依序為 \\(${circularOrder}\\)。若弦 \\(${chord1}\\parallel ${chord2}\\)，證明弧 \\(${arc(arc1)}\\) 與弧 \\(${arc(arc2)}\\) 度數相等。`
        );
        answers.push(
          `簡答：弧 \\(${arc(arc1)}\\) 與弧 \\(${arc(arc2)}\\) 相等。過程：平行弦造成相等的內錯角，而這些角分別對應兩段弧。由圓周角相等可推出所對弧相等。`
        );
      } else if (type === 'tangentSegmentsEqual') {
        const labels = [
          ['P', 'A', 'B', 'O'],
          ['Q', 'C', 'D', 'I'],
          ['T', 'M', 'N', 'O'],
          ['R', 'X', 'Y', 'S'],
          ['S', 'E', 'F', 'C'],
          ['U', 'G', 'H', 'O'],
          ['V', 'J', 'K', 'I'],
          ['W', 'L', 'M', 'P'],
          ['X', 'N', 'Q', 'O'],
          ['Y', 'R', 'S', 'T'],
          ['Z', 'U', 'V', 'O'],
          ['A', 'M', 'N', 'C'],
        ][randInt(0, 11)];
        const [point, t1, t2, center] = labels;
        questions.push(`自圓 \\(${center}\\) 外一點 \\(${point}\\) 引兩切線 \\(${point}${t1}\\)、\\(${point}${t2}\\)。證明 \\(${point}${t1}=${point}${t2}\\)。`);
        answers.push(
          `簡答：\\(${point}${t1}=${point}${t2}\\)。過程：連接圓心 \\(${center}\\) 至兩切點。半徑垂直切線，兩個直角三角形又有半徑相等與公共邊，由 RHS 全等得兩切線段相等。`
        );
      } else if (type === 'cyclicOppositeAngles') {
        const quad = quadrilaterals[randInt(0, quadrilaterals.length - 1)];
        questions.push(`四邊形 \\(${quad}\\) 內接於一圓。證明 \\(\\angle ${quad[0]}+\\angle ${quad[2]}=180^\\circ\\)。`);
        answers.push(
          `簡答：\\(\\angle ${quad[0]}+\\angle ${quad[2]}=180^\\circ\\)。過程：內接四邊形的對角分別對應互補的兩段弧，兩段弧合為整圓 \\(360^\\circ\\)。圓周角為所對弧的一半，所以兩角和為 \\(180^\\circ\\)。`
        );
      } else if (type === 'tangentChordSimilarity') {
        const labels = [
          ['P', 'A', 'B', 'C', 'PAB', 'PCA'],
          ['Q', 'D', 'E', 'F', 'QDE', 'QFD'],
          ['T', 'M', 'N', 'R', 'TMN', 'TRM'],
          ['S', 'X', 'Y', 'Z', 'SXY', 'SZX'],
          ['U', 'G', 'H', 'I', 'UGH', 'UIG'],
          ['V', 'J', 'K', 'L', 'VJK', 'VLJ'],
          ['W', 'M', 'N', 'O', 'WMN', 'WOM'],
          ['X', 'Q', 'R', 'S', 'XQR', 'XSQ'],
          ['Y', 'T', 'U', 'V', 'YTU', 'YVT'],
          ['Z', 'A', 'B', 'C', 'ZAB', 'ZCA'],
        ][randInt(0, 9)];
        const [point, t, near, far, tri1, tri2] = labels;
        questions.push(
          `自圓外點 \\(${point}\\) 作切線 \\(${point}${t}\\) 與割線 \\(${point}${near}${far}\\)。證明 \\(\\triangle ${tri1}\\sim\\triangle ${tri2}\\)。`
        );
        answers.push(
          `簡答：\\(\\triangle ${tri1}\\sim\\triangle ${tri2}\\)。過程：外點形成一組共同角；弦切角等於同弧所對圓周角。兩角相等，所以兩三角形相似。`
        );
      } else if (type === 'sameArcAngleEqual') {
        const labels = [
          ['ACB', 'PAB', 'AB'],
          ['PRQ', 'TPQ', 'PQ'],
          ['XYZ', 'WXY', 'XY'],
          ['DFE', 'GDE', 'DE'],
          ['HJI', 'KHI', 'HI'],
          ['LNM', 'OLM', 'LM'],
          ['RTS', 'URS', 'RS'],
          ['VWX', 'UVW', 'VW'],
          ['NPM', 'QNM', 'NM'],
          ['FEG', 'HFG', 'FG'],
        ][randInt(0, 9)];
        const [angle1, angle2, sameArc] = labels;
        const tangentExternal = angle2[0];
        const tangentPoint = angle2[1];
        questions.push(
          `在同一圓中，直線 \\(${tangentExternal}${tangentPoint}\\) 在 \\(${tangentPoint}\\) 點與圓相切。圓周角 \\(\\angle ${angle1}\\) 與弦切角 \\(\\angle ${angle2}\\) 對同一弧 \\(${arc(sameArc)}\\)。證明 \\(\\angle ${angle1}=\\angle ${angle2}\\)。`
        );
        answers.push(
          `簡答：兩角相等。過程：圓周角等於所對弧的一半，弦切角也等於同弧所對圓周角。因此同對弧 \\(${arc(sameArc)}\\) 的兩角相等。`
        );
      } else if (type === 'centroidThreeTrianglesArea') {
        const [ta, tb, tc] = letters[randInt(0, letters.length - 1)];
        questions.push(
          `已知 \\(G\\) 為 \\(\\triangle ${ta}${tb}${tc}\\) 的重心。證明 \\(\\triangle G${ta}${tb}\\)、\\(\\triangle G${tb}${tc}\\)、\\(\\triangle G${tc}${ta}\\) 面積相等。`
        );
        answers.push(
          `簡答：三個面積相等。過程：三條中線交於重心，且每條中線都把三角形分成等面積兩半。由三條中線共同分割，可得以重心連三頂點形成的三個三角形面積相等。`
        );
      } else if (type === 'medianSixEqualAreas') {
        const [ta, tb, tc] = letters[randInt(0, letters.length - 1)];
        questions.push(
          `已知 \\(\\triangle ${ta}${tb}${tc}\\) 的三條中線交於重心 \\(G\\)。證明三條中線把 \\(\\triangle ${ta}${tb}${tc}\\) 分成六個面積相等的小三角形。`
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
        const labels = [
          ['ABCD', 'O', 'E', 'CD', 'AE', 'BD', 'M', 'ACD', 'DO'],
          ['PQRS', 'O', 'T', 'RS', 'PT', 'QS', 'M', 'PRS', 'SO'],
          ['WXYZ', 'O', 'P', 'YZ', 'WP', 'ZO', 'N', 'WYZ', 'ZO'],
          ['DEFG', 'O', 'H', 'FG', 'DH', 'EG', 'P', 'DFG', 'GO'],
          ['LMNO', 'P', 'Q', 'NO', 'LQ', 'MO', 'R', 'LNO', 'OP'],
          ['RSTU', 'O', 'V', 'TU', 'RV', 'SU', 'W', 'RTU', 'UO'],
          ['HIJK', 'O', 'L', 'JK', 'HL', 'IK', 'M', 'HJK', 'KO'],
          ['UVWX', 'O', 'Y', 'WX', 'UY', 'VX', 'Z', 'UWX', 'XO'],
          ['MNOP', 'Q', 'R', 'OP', 'MR', 'NP', 'S', 'MOP', 'PQ'],
          ['EFGH', 'O', 'I', 'GH', 'EI', 'FH', 'J', 'EGH', 'HO'],
        ][randInt(0, 9)];
        const [para, center, midpoint, side, line1, line2, meet, tri, median] = labels;
        questions.push(
          `平行四邊形 \\(${para}\\) 中，\\(${center}\\) 為對角線交點，\\(${midpoint}\\) 為 \\(${side}\\) 中點，\\(${line1}\\) 交 \\(${line2}\\) 於 \\(${meet}\\)。證明 \\(${meet}\\) 為 \\(\\triangle ${tri}\\) 的重心。`
        );
        answers.push(
          `簡答：\\(${meet}\\) 為 \\(\\triangle ${tri}\\) 的重心。過程：平行四邊形對角線互相平分，所以 \\(${center}\\) 是對應邊的中點；\\(${midpoint}\\) 也是題設中點。於 \\(\\triangle ${tri}\\) 中，\\(${median}\\) 與 \\(${line1}\\) 是兩條中線，其交點 \\(${meet}\\) 即為重心。`
        );
      } else if (type === 'centroidMedianLength') {
        const gm = randInt(2, 24);
        questions.push(
          `已知 \\(G\\) 為 \\(\\triangle ABC\\) 的重心，\\(AD\\) 為中線且 \\(GD=${gm}\\)。求 \\(AD\\) 的長度。`
        );
        answers.push(
          `簡答：\\(AD=${3 * gm}\\)。過程：重心分中線比為 \\(AG:GD=2:1\\)，所以 \\(AD=AG+GD=3GD=3\\times${gm}=${3 * gm}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ533Set(kind, count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
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
    const baseTriples = [
      [3, 4, 5],
      [5, 12, 13],
      [8, 15, 17],
      [7, 24, 25],
      [9, 40, 41],
      [11, 60, 61],
      [12, 35, 37],
      [20, 21, 29],
    ];
    const triples = [];
    baseTriples.forEach((triple) => {
      for (let scale = 1; scale <= 4; scale += 1) {
        triples.push(triple.map((value) => value * scale));
      }
    });
    const pickTriple = () => triples[randInt(0, triples.length - 1)];
    const piTerm = (coeff) => {
      if (coeff === 1) return '\\pi';
      return `${coeff}\\pi`;
    };
    const coordText = (x, y) => `(${formatFraction(x, 1)},${formatFraction(y, 1)})`;
    for (let i = 0; i < count; i += 1) {
      const type = selected[i % selected.length];
      if (type === 'circumcenterAngle') {
        const angleA = 25 + 5 * randInt(0, 11);
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
        const side = 3 * randInt(2, 18);
        const radiusText = `${side / 3}\\sqrt{3}`;
        questions.push(`正三角形邊長為 \\(${side}\\)。求外心到頂點的距離，也就是外接圓半徑 \\(R\\)。`);
        answers.push(
          `簡答：\\(${radiusText}\\)。過程：正三角形外心、內心、重心合一，高為 \\(\\frac{${side}\\sqrt3}{2}\\)，重心到頂點為高的 \\(\\frac{2}{3}\\)，所以 \\(R=${radiusText}\\)。`
        );
      } else if (type === 'obtuseCircumcenterAngle') {
        const angleA = 95 + 5 * randInt(0, 10);
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
        const angleA = 30 + 10 * randInt(0, 10);
        const bic = 90 + angleA / 2;
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(I\\) 為內心。若 \\(\\angle A=${angleA}^\\circ\\)，求 \\(\\angle BIC\\)。`
        );
        answers.push(
          `簡答：\\(${bic}^\\circ\\)。過程：內心角公式 \\(\\angle BIC=90^\\circ+\\frac{1}{2}\\angle A\\)，所以 \\(\\angle BIC=90^\\circ+${angleA / 2}^\\circ=${bic}^\\circ\\)。`
        );
      } else if (type === 'incenterAngleInverse') {
        const angleA = 30 + 10 * randInt(0, 12);
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
          [7, 9, 11],
          [8, 13, 15],
          [9, 10, 17],
          [10, 11, 13],
          [11, 13, 20],
          [12, 13, 15],
          [13, 14, 15],
          [9, 14, 17],
          [10, 17, 21],
          [14, 15, 25],
        ][randInt(0, 13)];
        const commonDivisor = gcdInt(gcdInt(sides[0], sides[1]), sides[2]);
        const ratioText = sides.map((side) => side / commonDivisor).join(':');
        questions.push(
          `若 \\(I\\) 為 \\(\\triangle ABC\\) 的內心，且 \\(AB=${sides[0]}\\)、\\(BC=${sides[1]}\\)、\\(CA=${sides[2]}\\)。求 \\(\\triangle AIB:\\triangle BIC:\\triangle CIA\\) 的面積比。`
        );
        answers.push(
          `簡答：\\(${ratioText}\\)。過程：內心到三邊距離皆為內切圓半徑 \\(r\\)，三個小三角形的高相同，因此面積比等於對應底邊比 \\(AB:BC:CA=${sides[0]}:${sides[1]}:${sides[2]}=${ratioText}\\)。`
        );
      } else if (type === 'equilateralInradius') {
        const side = 6 * randInt(1, 15);
        const rText = formatLinearTerm(side / 6, '\\sqrt{3}');
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
          [6, 8, 11],
          [7, 9, 10],
          [8, 15, 17],
          [9, 10, 13],
          [10, 13, 17],
        ][randInt(0, 8)];
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
        const median = 3 * randInt(4, 24);
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(AD\\) 為中線，\\(G\\) 為重心。若 \\(AD=${median}\\)，求 \\(AG\\) 與 \\(GD\\)。`
        );
        answers.push(
          `簡答：\\(AG=${(2 * median) / 3}\\)，\\(GD=${median / 3}\\)。過程：重心把中線分成 \\(AG:GD=2:1\\)，所以 \\(AG=\\frac{2}{3}AD=${(2 * median) / 3}\\)，\\(GD=\\frac{1}{3}AD=${median / 3}\\)。`
        );
      } else if (type === 'centroidMedianInverse') {
        const gd = randInt(2, 24);
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(AD\\) 為中線，\\(G\\) 為重心。若 \\(GD=${gd}\\)，求 \\(AD\\) 與 \\(AG\\)。`
        );
        answers.push(
          `簡答：\\(AD=${3 * gd}\\)，\\(AG=${2 * gd}\\)。過程：重心分中線為 \\(2:1\\)，且 \\(GD\\) 是較短段，所以 \\(AD=3GD=${3 * gd}\\)，\\(AG=2GD=${2 * gd}\\)。`
        );
      } else if (type === 'centroidCoordinate') {
        let x1;
        let y1;
        let x2;
        let y2;
        let x3;
        let y3;
        do {
          x1 = randInt(-6, 8);
          y1 = randInt(-6, 8);
          x2 = randInt(-6, 8);
          y2 = randInt(-6, 8);
          x3 = randInt(-6, 8);
          y3 = randInt(-6, 8);
        } while ((x2 - x1) * (y3 - y1) === (y2 - y1) * (x3 - x1));
        const gxText = formatFraction(x1 + x2 + x3, 3);
        const gyText = formatFraction(y1 + y2 + y3, 3);
        questions.push(
          `\\(\\triangle ABC\\) 的頂點為 \\(A(${x1},${y1})\\)、\\(B(${x2},${y2})\\)、\\(C(${x3},${y3})\\)。求重心 \\(G\\) 的坐標。`
        );
        answers.push(
          `簡答：\\(G(${gxText},${gyText})\\)。過程：重心坐標是三頂點坐標平均，\\(G=(\\frac{x_1+x_2+x_3}{3},\\frac{y_1+y_2+y_3}{3})=(${gxText},${gyText})\\)。`
        );
      } else if (type === 'missingVertexFromCentroid') {
        let x1;
        let y1;
        let x2;
        let y2;
        let gx;
        let gy;
        let x3;
        let y3;
        do {
          x1 = randInt(-4, 6);
          y1 = randInt(-4, 6);
          x2 = randInt(-4, 6);
          y2 = randInt(-4, 6);
          gx = randInt(-3, 5);
          gy = randInt(-3, 5);
          x3 = 3 * gx - x1 - x2;
          y3 = 3 * gy - y1 - y2;
        } while ((x2 - x1) * (y3 - y1) === (y2 - y1) * (x3 - x1));
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
        const bgText = constant === 0 ? '3x' : `3x${constant < 0 ? constant : `+${constant}`}`;
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(BE\\) 為中線，\\(G\\) 為重心。若 \\(GE=x+${shortOffset}\\)、\\(BG=${bgText}\\)，求 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：重心分中線滿足 \\(BG:GE=2:1\\)，所以 \\(${bgText}=2(x+${shortOffset})\\)，解得 \\(x=${x}\\)。`
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
        const om = randInt(2, 24);
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
          `簡答：\\(PQ=${bd / 3}\\)。過程：兩個三角形的重心 \\(P\\)、\\(Q\\) 都在對角線 \\(BD\\) 上，且 \\(BP:PQ:QD=1:1:1\\)。因此 \\(PQ=\\frac13BD=\\frac13\\times${bd}=${bd / 3}\\)。`
        );
      } else if (type === 'parallelogramMidpointTriangleArea') {
        const smallArea = randInt(2, 12);
        questions.push(
          `平行四邊形 \\(ABCD\\) 的面積為 \\(S\\)。對角線交於 \\(O\\)，且 \\(E\\) 為 \\(BC\\) 的中點。若 \\(\\triangle ODE\\) 面積為 \\(${smallArea}\\)，求 \\(S\\)。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(S=${8 * smallArea}\\)`,
          `設平行四邊形的兩鄰邊向量為 \\(\\vec u\\)、\\(\\vec v\\)。由 \\(O\\) 是對角線中點、\\(E\\) 是 \\(BC\\) 中點，可得 \\(\\triangle ODE\\) 面積為平行四邊形面積的 \\(\\frac18\\)。所以 \\(S=8\\times${smallArea}=${8 * smallArea}\\)。`
        );
      } else if (type === 'parallelogramCentroidSegmentEquation') {
        const x = randInt(1, 8);
        const offset = randInt(1, 5);
        const segment = x + offset;
        const diagonal = 3 * segment;
        questions.push(
          `平行四邊形 \\(ABCD\\) 中，\\(P\\)、\\(Q\\) 分別為 \\(\\triangle ABC\\)、\\(\\triangle ADC\\) 的重心。\\(P\\)、\\(Q\\) 將對角線 \\(BD\\) 分成三段等長。若 \\(BP=x+${offset}\\)，且 \\(BD=${diagonal}\\)，求 \\(x\\)。`
        );
        answers.push(
          `簡答：\\(x=${x}\\)。過程：兩個重心把對角線 \\(BD\\) 分成三段等長，所以 \\(BP=\\frac{${diagonal}}3=${segment}\\)。令 \\(x+${offset}=${segment}\\)，得 \\(x=${x}\\)。`
        );
      } else if (type === 'isoscelesAreaFromCentroidDistance') {
        const choices = [
          [8, 6, 10],
          [6, 8, 10],
          [5, 12, 13],
          [9, 12, 15],
          [12, 16, 20],
          [10, 24, 26],
          [7, 24, 25],
          [15, 20, 25],
          [16, 30, 34],
          [20, 21, 29],
          [18, 24, 30],
          [24, 32, 40],
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
        let x1;
        let y1;
        let x2;
        let y2;
        let x3;
        let y3;
        do {
          x1 = randInt(-5, 5);
          y1 = randInt(-5, 5);
          x2 = randInt(-5, 5);
          y2 = randInt(-5, 5);
          x3 = randInt(-5, 5);
          y3 = randInt(-5, 5);
        } while ((x2 - x1) * (y3 - y1) === (y2 - y1) * (x3 - x1));
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
        const pointModes = [
          [r, 0],
          [0, r],
          [-r, 0],
          [0, -r],
          [r - 1, 1],
          [r + 1, 0],
          [3, 4],
          [4, 3],
        ];
        const [x, y] = pointModes[randInt(0, pointModes.length - 1)];
        const distanceSquared = x * x + y * y;
        const isOn = distanceSquared === r * r;
        questions.push(
          `圓心在原點、半徑為 \\(${r}\\) 的圓。判斷點 \\(P(${x},${y})\\) 是否可作為某個內接三角形的頂點。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          isOn ? '可以' : '不可以，因為不在此圓上',
          `內接三角形頂點必在外接圓上。計算 \\(OP^2=${distanceSquared}\\)，而 \\(r^2=${r * r}\\)。${isOn ? '兩者相等，所以可以。' : '兩者不相等，所以不能作為此圓上的頂點。'}`
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
        let gx = randInt(-3, 5);
        let gy = randInt(-3, 5);
        while (gx === ox && gy === oy) {
          gx = randInt(-3, 5);
          gy = randInt(-3, 5);
        }
        const hx = 3 * gx - 2 * ox;
        const hy = 3 * gy - 2 * oy;
        questions.push(
          `在座標平面上，\\(O(${ox},${oy})\\) 為某三角形的外心，\\(G(${gx},${gy})\\) 為重心。若外心、重心、垂心共線且 \\(HG:GO=2:1\\)，求垂心 \\(H\\) 的坐標。`
        );
        answers.push(
          `簡答：\\(H(${hx},${hy})\\)。過程：尤拉線上 \\(G\\) 把 \\(HO\\) 分成 \\(HG:GO=2:1\\)，所以 \\(G=\\frac{H+2O}{3}\\)。因此 \\(H=3G-2O=(${3 * gx},${3 * gy})-(${2 * ox},${2 * oy})=(${hx},${hy})\\)。`
        );
      } else if (type === 'equilateralRadiiRatio') {
        const side = 6 * randInt(2, 15);
        questions.push(`正三角形邊長為 \\(${side}\\)，外接圓半徑為 \\(R\\)，內切圓半徑為 \\(r\\)。求 \\(R:r\\)。`);
        answers.push(
          `簡答：\\(R:r=2:1\\)。過程：正三角形三心合一，重心到頂點為高的 \\(\\frac23\\)，到邊為高的 \\(\\frac13\\)，因此 \\(R:r=\\frac23:\\frac13=2:1\\)。`
        );
      } else if (type === 'equilateralAreaFromInradius') {
        const r = randInt(2, 15);
        const areaCoeff = 3 * r * r;
        questions.push(`正三角形的內切圓半徑為 \\(${r}\\)。求此正三角形面積。`);
        answers.push(
          `簡答：\\(${areaCoeff}\\sqrt3\\)。過程：正三角形邊長 \\(a=2\\sqrt3 r=2\\sqrt3\\times${r}\\)。面積 \\(=\\frac{\\sqrt3}{4}a^2=${areaCoeff}\\sqrt3\\)。`
        );
      } else if (type === 'equilateralAreaFromCircumradius') {
        const radius = 2 * randInt(2, 15);
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
        const og = randInt(2, 24);
        questions.push(`直角三角形中，\\(O\\) 為外心，\\(G\\) 為重心。若 \\(OG=${og}\\)，求斜邊長與外接圓面積。`);
        answers.push(
          `簡答：斜邊長 \\(${6 * og}\\)，外接圓面積 \\(${piTerm(9 * og * og)}\\)。過程：直角三角形中 \\(OG=\\frac16\\) 斜邊，所以斜邊長為 \\(6\\times${og}=${6 * og}\\)。外接圓半徑為斜邊一半 \\(R=${3 * og}\\)，面積為 \\(\\pi R^2=${piTerm(9 * og * og)}\\)。`
        );
      } else if (type === 'rightTrianglePerimeterFromRr') {
        const [a, b, c] = pickTriple();
        const radius = formatFraction(c, 2);
        const inradius = formatFraction(a + b - c, 2);
        const perimeter = a + b + c;
        questions.push(
          `直角三角形的外接圓半徑為 \\(R=${radius}\\)，內切圓半徑為 \\(r=${inradius}\\)。求此直角三角形的周長。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(${perimeter}\\)`,
          `此題由兩股為 \\(${a}\\)、\\(${b}\\)、斜邊為 \\(${c}\\) 的直角三角形產生。直角三角形斜邊 \\(c=2R\\)，且 \\(r=\\frac{a+b-c}{2}\\)，所以 \\(P=a+b+c=4R+2r=${perimeter}\\)。`
        );
      } else if (type === 'equilateralHeightFromCircumradius') {
        const radius = 2 * randInt(2, 16);
        questions.push(`正三角形的外接圓半徑為 \\(${radius}\\)。求此正三角形的高。`);
        answers.push(
          `簡答：\\(${(3 * radius) / 2}\\)。過程：正三角形三心合一，外心到頂點距離是高的 \\(\\frac23\\)，所以 \\(R=\\frac23h\\)，\\(h=\\frac32R=\\frac32\\times${radius}=${(3 * radius) / 2}\\)。`
        );
      } else if (type === 'equilateralIncircleCircumcircleAreaRatio') {
        const scale = randInt(2, 20);
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

  // ── j5-1 延伸：進階比例推理與三角形應用 ───────────────────────────────
  function buildJ511TriangleAngleAlgebraRatioSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(`簡答：${summary}。過程：${detail}`);
    };
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const coeffOptions = [
          [2, 3, 6],
          [4, 6, 12],
          [3, 5, 15],
          [4, 5, 20],
          [2, 4, 4],
        ];
        const coeffs = coeffOptions[randInt(0, coeffOptions.length - 1)];
        const common = lcmArray(coeffs);
        const ratio = reduceRatioTriple(coeffs.map((c) => common / c));
        const unit = 180 / ratio.reduce((sum, value) => sum + value, 0);
        const angles = ratio.map((value) => value * unit);
        add(
          `已知 \\(${coeffs[0]}\\angle A=${coeffs[1]}\\angle B=${coeffs[2]}\\angle C\\)，求三內角各為多少度。`,
          `\\(\\angle A=${angles[0]}^\\circ\\)、\\(\\angle B=${angles[1]}^\\circ\\)、\\(\\angle C=${angles[2]}^\\circ\\)`,
          `令共同值為 \\(k\\)，則 \\(A:B:C=\\frac{1}{${coeffs[0]}}:\\frac{1}{${coeffs[1]}}:\\frac{1}{${coeffs[2]}}=${ratioTex(ratio)}\\)。再用三角形內角和 \\(180^\\circ\\) 分配。`
        );
        continue;
      }
      if (mode === 1) {
        const ratioOptions = [
          [2, 3, 4],
          [1, 2, 3],
          [2, 3, 5],
          [3, 4, 5],
          [4, 5, 6],
        ];
        const ratios = ratioOptions[randInt(0, ratioOptions.length - 1)];
        const unit = 180 / ratios.reduce((sum, value) => sum + value, 0);
        const angles = ratios.map((r) => r * unit);
        add(
          `已知 \\(\\angle A:${ratios[0]}=\\angle B:${ratios[1]}=\\angle C:${ratios[2]}\\)，求最大角與最小角的差。`,
          `\\(${Math.max(...angles) - Math.min(...angles)}^\\circ\\)`,
          `設共同值為 \\(t\\)，則 \\(A:B:C=${ratioTex(ratios)}\\)。總份數為 ${ratios.reduce((sum, value) => sum + value, 0)}，一份為 \\(${unit}^\\circ\\)，所以最大角與最小角差為 \\(${Math.max(...angles) - Math.min(...angles)}^\\circ\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const targetRatios = [
          [4, 3, 2],
          [5, 4, 3],
          [3, 2, 1],
          [6, 5, 4],
          [2, 3, 4],
        ];
        const targetRatio = targetRatios[randInt(0, targetRatios.length - 1)];
        const [p, q, r, s] = [targetRatio[1], targetRatio[0], targetRatio[2], targetRatio[1]];
        const ratio = reduceRatioTriple([q * s, p * s, p * r]);
        const unit = 180 / ratio.reduce((sum, value) => sum + value, 0);
        add(
          `若 \\(${p}\\angle A=${q}\\angle B\\) 且 \\(${r}\\angle B=${s}\\angle C\\)，求 \\(\\angle A:\\angle B:\\angle C\\)。`,
          `\\(${ratioTex(ratio)}\\)`,
          `由第一式得 \\(A:B=${q}:${p}\\)，由第二式得 \\(B:C=${s}:${r}\\)。把共同的 \\(B\\) 對齊，可得 \\(A:B:C=${ratioTex(ratio)}\\)。若代入角度則為 ${ratio.map((value) => value * unit).join('、')} 度。`
        );
        continue;
      }
      if (mode === 3) {
        const angleOptions = [
          [60, 40, 80],
          [50, 60, 70],
          [40, 80, 60],
          [70, 50, 60],
        ];
        const angles = angleOptions[randInt(0, angleOptions.length - 1)];
        const parts = [angles[0] + angles[1], angles[1] + angles[2], angles[2] + angles[0]];
        const reducedParts = reduceRatioTriple(parts);
        add(
          `已知 \\((\\angle A+\\angle B):(\\angle B+\\angle C):(\\angle C+\\angle A)=${ratioTex(reducedParts)}\\)，求三內角度數。`,
          `\\(\\angle A=${angles[0]}^\\circ\\)、\\(\\angle B=${angles[1]}^\\circ\\)、\\(\\angle C=${angles[2]}^\\circ\\)`,
          `三式相加為 \\(2(A+B+C)=360^\\circ\\)。再用 \\(A=\\frac{(A+B)+(A+C)-(B+C)}{2}\\)、\\(B=\\frac{(A+B)+(B+C)-(A+C)}{2}\\) 可求得三角。`
        );
        continue;
      }
      const denominatorOptions = [
        [2, 3, 5],
        [3, 4, 5],
        [2, 4, 6],
        [3, 5, 7],
      ];
      const denominators = denominatorOptions[randInt(0, denominatorOptions.length - 1)];
      const ratio = denominators.slice();
      const unit = 180 / ratio.reduce((sum, value) => sum + value, 0);
      const angles = ratio.map((r) => r * unit);
      const maxAngle = Math.max(...angles);
      const shape = maxAngle === 90 ? '直角三角形' : maxAngle > 90 ? '鈍角三角形' : '銳角三角形';
      add(
        `若 \\(\\frac{1}{${denominators[0]}}\\angle A=\\frac{1}{${denominators[1]}}\\angle B=\\frac{1}{${denominators[2]}}\\angle C\\)，判斷此三角形形狀。`,
        shape,
        `令共同值為 \\(k\\)，則 \\(A:B:C=${ratioTex(ratio)}\\)。三內角為 \\(${angles[0]}^\\circ,${angles[1]}^\\circ,${angles[2]}^\\circ\\)，最大角為 \\(${maxAngle}^\\circ\\)，所以是${shape}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ511LinkedRatioAdvancedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(`簡答：${summary}。過程：${detail}`);
    };
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const firstRatios = [[2, 3], [3, 4], [3, 5], [4, 5], [5, 7]];
        const secondRatios = [[2, 3], [3, 4], [3, 5], [4, 5], [5, 6]];
        const [a, b] = firstRatios[randInt(0, firstRatios.length - 1)];
        const [c, d] = secondRatios[randInt(0, secondRatios.length - 1)];
        const common = lcmInt(b, c);
        const ratio = reduceRatioTriple([a * (common / b), common, d * (common / c)]);
        const unit = randInt(2, 10);
        const total = ratio.reduce((sum, value) => sum + value, 0) * unit;
        const yValue = ratio[1] * unit;
        add(
          `若 \\(x:y=${a}:${b}\\)，\\(y:z=${c}:${d}\\)，求 \\(x:y:z\\)，並計算當 \\(x+y+z=${total}\\) 時的 \\(y\\) 值。`,
          `\\(x:y:z=${ratioTex(ratio)}\\)，\\(y=${yValue}\\)`,
          `先把共同的 \\(y\\) 對齊為 ${common}，得 \\(x:y:z=${ratioTex(ratio)}\\)。總份數為 ${ratio.reduce((sum, value) => sum + value, 0)}，每份為 \\(${total}\\div${ratio.reduce((sum, value) => sum + value, 0)}=${unit}\\)，故 \\(y=${ratio[1]}\\times${unit}=${yValue}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const denominatorSets = [[2, 3, 4, 5], [2, 5, 3, 4], [3, 4, 2, 5], [3, 5, 4, 7], [4, 5, 3, 7]];
        const [p, q, r, s] = denominatorSets[randInt(0, denominatorSets.length - 1)];
        const common = lcmInt(p, s);
        const ratio = reduceRatioTriple([q * (common / p), common, r * (common / s)]);
        questions.push(
          `已知 \\(a:b=\\frac{1}{${p}}:\\frac{1}{${q}}\\)，\\(b:c=\\frac{1}{${r}}:\\frac{1}{${s}}\\)，將 \\(a:b:c\\) 化為最簡整數比。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(a:b:c=${ratioTex(ratio)}\\)`,
          `先化 \\(a:b=${q}:${p}\\)，\\(b:c=${s}:${r}\\)。把共同的 \\(b\\) 對齊為 ${common}，可得 \\(a:b:c=${ratioTex(ratio)}\\)。分數比要先分段處理，不能把四個分母一次混在一起。`
        );
        continue;
      }
      if (mode === 2) {
        const coefficientSets = [[3, 2, 4, 5], [2, 3, 5, 4], [4, 3, 2, 5], [5, 2, 3, 4], [3, 5, 4, 7]];
        const [p, q, r, s] = coefficientSets[randInt(0, coefficientSets.length - 1)];
        const common = lcmInt(p, s);
        const ratio = reduceRatioTriple([q * (common / p), common, r * (common / s)]);
        questions.push(
          `若 \\(${p}x=${q}y\\)，\\(${r}y=${s}z\\)，求 \\(x:y:z\\)。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `\\(x:y:z=${ratioTex(ratio)}\\)`,
          `由 \\(${p}x=${q}y\\) 得 \\(x:y=${q}:${p}\\)，由 \\(${r}y=${s}z\\) 得 \\(y:z=${s}:${r}\\)。把 \\(y\\) 對齊為 ${common}，可得 \\(x:y:z=${ratioTex(ratio)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const parts = [2, 3, 5];
        const t = randInt(2, 10);
        const sum = (2 * parts[0] + parts[1] - parts[2]) * t;
        const total = parts.reduce((a, b) => a + b, 0) * t;
        add(
          `若 \\(a:b:c=2:3:5\\)，且 \\(2a+b-c=${sum}\\)，求 \\(a+b+c\\)。`,
          `\\(${total}\\)`,
          `設 \\(a=2k,b=3k,c=5k\\)。則 \\(2a+b-c=4k+3k-5k=2k=${sum}\\)，所以 \\(k=${t}\\)，\\(a+b+c=(2+3+5)k=${total}\\)。`
        );
        continue;
      }
      const pairSumOptions = [[3, 4, 5], [3, 5, 4], [4, 5, 7], [5, 7, 8], [5, 8, 7], [7, 8, 9]];
      const [xy, yz, zx] = pairSumOptions[randInt(0, pairSumOptions.length - 1)];
      const xRatio = (xy + zx - yz) / 2;
      const yRatio = (xy + yz - zx) / 2;
      const zRatio = (yz + zx - xy) / 2;
      const ratio = reduceRatioTriple([xRatio, yRatio, zRatio]);
      add(
        `若 \\((x+y):(y+z):(z+x)=${xy}:${yz}:${zx}\\)，求 \\(x:y:z\\)。`,
        `\\(x:y:z=${ratioTex(ratio)}\\)`,
        `設 \\(x+y=${xy}k,y+z=${yz}k,z+x=${zx}k\\)。兩兩相加後相減，可得 \\(x:y:z=${ratioTex(ratio)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ511GeometryRatioPropertyAdvancedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(`簡答：${summary}。過程：${detail}`);
    };
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const ratioOptions = [[1, 4], [1, 5], [2, 3], [2, 7], [3, 7], [4, 5]];
        const ratio = ratioOptions[randInt(0, ratioOptions.length - 1)];
        const unit = 90 / (ratio[0] + ratio[1]);
        const small = ratio[0] * unit;
        add(
          `直角三角形中，兩個銳角的比為 \\(${ratioTex(ratio)}\\)，求較小角的度數。`,
          `\\(${small}^\\circ\\)`,
          `兩銳角和為 \\(90^\\circ\\)，總份數為 ${ratio[0] + ratio[1]}，一份為 \\(${unit}^\\circ\\)，較小角為 \\(${ratio[0]}\\times${unit}=${small}^\\circ\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const apexPartOptions = [2, 3, 4, 7, 8, 10];
        const apexPart = apexPartOptions[randInt(0, apexPartOptions.length - 1)];
        const unit = 180 / (apexPart + 2);
        const apex = apexPart * unit;
        add(
          `等腰三角形的一個頂角與一個底角的比為 \\(${apexPart}:1\\)，求頂角的度數。`,
          `\\(${apex}^\\circ\\)`,
          `等腰三角形兩底角相等。設頂角為 \\(${apexPart}k\\)，每個底角為 \\(k\\)，則 \\(${apexPart}k+k+k=180\\)，得 \\(k=${unit}\\)，頂角為 \\(${apex}^\\circ\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const sides = randInt(3, 10);
        const ratio = reduceRatioTriple([sides - 2, 2]);
        const interiorSum = (sides - 2) * 180;
        add(
          `一個多邊形的內角和與外角和之比為 \\(${ratioTex(ratio)}\\)，求此多邊形是幾邊形。`,
          `${sides} 邊形`,
          `任意多邊形外角和為 \\(360^\\circ\\)。由比例可知內角和為 \\(${interiorSum}^\\circ\\)，令 \\((n-2)180=${interiorSum}\\)，得 \\(n=${sides}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const tripleOptions = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
        const scale = randInt(3, 8);
        const baseSides = tripleOptions[randInt(0, tripleOptions.length - 1)];
        const sides = baseSides.map((value) => value * scale);
        const perimeter = sides.reduce((a, b) => a + b, 0);
        const area = (sides[0] * sides[1]) / 2;
        add(
          `已知三角形三邊長的比為 \\(${ratioTex(baseSides)}\\)，若周長為 ${perimeter}，求其面積。`,
          `\\(${area}\\)`,
          `設三邊為 \\(${baseSides[0]}k,${baseSides[1]}k,${baseSides[2]}k\\)。周長 \\(${baseSides.reduce((sum, value) => sum + value, 0)}k=${perimeter}\\)，所以 \\(k=${scale}\\)。這是直角三角形，面積為 \\(\\frac{${sides[0]}\\times${sides[1]}}{2}=${area}\\)。`
        );
        continue;
      }
      const heightRatioOptions = [[2, 3, 4], [3, 3, 4], [3, 4, 5], [3, 5, 5], [4, 4, 5], [4, 5, 6], [5, 5, 6], [5, 6, 7]];
      const heights = heightRatioOptions[randInt(0, heightRatioOptions.length - 1)];
      const common = lcmArray(heights);
      const sideRatio = reduceRatioTriple(heights.map((value) => common / value));
      add(
        `三角形三高之比為 \\(${ratioTex(heights)}\\)，求其三邊長之比。`,
        `\\(${ratioTex(sideRatio)}\\)`,
        `同一三角形面積固定，邊長與對應高成反比，所以把 \\(${ratioTex(heights)}\\) 取倒數後同乘 ${common}，得 \\(${ratioTex(sideRatio)}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ511RatioChangeDynamicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(`簡答：${summary}。過程：${detail}`);
    };
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const changeOptions = [[10, 20], [20, 10], [30, 10], [10, 30]];
        const [increase, decrease] = changeOptions[randInt(0, changeOptions.length - 1)];
        const angleA = 60 * (100 + increase) / 100;
        const angleB = 60 * (100 - decrease) / 100;
        const angleSum = angleA + angleB + 60;
        questions.push(
          `若 \\(\\angle A\\) 增加 \\(${increase}\\%\\)，\\(\\angle B\\) 減少 \\(${decrease}\\%\\)，且原比例為 \\(1:1:1\\)，判斷變動後三角形是否仍能成立。`
        );
        pushAnswerWithManualSummary(
          answers,
          summaryAnswers,
          `否，三內角和為 \\(${angleSum}^\\circ\\)`,
          `原本三角形為等角三角形，每角 \\(60^\\circ\\)。變動後三角為 \\(${angleA}^\\circ,${angleB}^\\circ,60^\\circ\\)，其和為 \\(${angleSum}^\\circ\\)，不符合三角形內角和 \\(180^\\circ\\)，所以無法形成三角形。`
        );
        continue;
      }
      if (mode === 1) {
        const ratioOptions = [[2, 3, 4], [3, 4, 5], [2, 5, 6], [3, 5, 7], [4, 5, 6]];
        const ratio = ratioOptions[randInt(0, ratioOptions.length - 1)];
        const unit = randInt(2, 8);
        const increase = randInt(1, 6);
        const original = ratio.map((value) => value * unit);
        const after = [original[0] + increase, original[1], original[2]];
        const afterRatio = reduceRatioTriple(after);
        const afterUnit = after[1] / afterRatio[1];
        add(
          `已知 \\(x:y:z=${ratioTex(ratio)}\\)。若 \\(x\\) 增加 ${increase} 後，比例變為 \\(${ratioTex(afterRatio)}\\)，求原來的三數。`,
          `\\(${original.join(',')}\\)`,
          `設原來為 \\(${ratio[0]}k,${ratio[1]}k,${ratio[2]}k\\)。增加後第二、三項不變；由新比的第二項可知一份為 ${afterUnit}，故 \\(${ratio[1]}k=${afterRatio[1]}\\times${afterUnit}=${original[1]}\\)，得 \\(k=${unit}\\)。所以原來三數為 \\(${original.join(',')}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const ratioOptions = [[2, 3, 4], [2, 5, 6], [3, 4, 5], [3, 5, 7], [4, 5, 6]];
        const ratio = ratioOptions[randInt(0, ratioOptions.length - 1)];
        const common = lcmArray(ratio);
        const reciprocal = reduceRatioTriple(ratio.map((value) => common / value));
        add(
          `若 \\(a:b:c=${ratioTex(ratio)}\\)，求 \\(\\frac{1}{a}:\\frac{1}{b}:\\frac{1}{c}\\) 的最簡整數比。`,
          `\\(${ratioTex(reciprocal)}\\)`,
          `倒數比會反向。\\(\\frac{1}{${ratio[0]}}:\\frac{1}{${ratio[1]}}:\\frac{1}{${ratio[2]}}\\) 同乘 ${common}，得 \\(${ratioTex(reciprocal)}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const ratioOptions = [[2, 3, 5], [3, 4, 7], [2, 5, 7], [3, 5, 8]];
        const parts = ratioOptions[randInt(0, ratioOptions.length - 1)];
        const unit = randInt(6, 15);
        const b = parts[1] * unit;
        const difference = (parts[2] - parts[0]) * unit;
        add(
          `將 \\(x\\) 顆糖果按 \\(${ratioTex(parts)}\\) 分給甲乙丙，若丙比甲多 ${difference} 顆，求乙得幾顆。`,
          `\\(${b}\\) 顆`,
          `丙與甲相差 \\(${parts[2]}-${parts[0]}=${parts[2] - parts[0]}\\) 份，已知相差 ${difference} 顆，所以一份為 ${unit} 顆。乙為 ${parts[1]} 份，得到 ${b} 顆。`
        );
        continue;
      }
      const afterRatioOptions = [[2, 3, 4], [3, 4, 5], [3, 5, 7], [4, 5, 6]];
      const afterRatio = afterRatioOptions[randInt(0, afterRatioOptions.length - 1)];
      const unit = randInt(100, 300);
      const transfer = [50, 100, 150][randInt(0, 2)];
      const afterValues = afterRatio.map((value) => value * unit);
      const originalA = afterValues[0] + transfer;
      const originalB = afterValues[1] - transfer;
      const total = afterValues.reduce((sum, value) => sum + value, 0);
      add(
        `甲、乙、丙三人共有 ${total} 元，若甲給乙 ${transfer} 元後，三人的錢數比變為 \\(${ratioTex(afterRatio)}\\)，求原本三人各有多少錢。`,
        `甲 ${originalA} 元、乙 ${originalB} 元、丙 ${afterValues[2]} 元`,
        `變動後總額仍為 ${total} 元，\\(${afterRatio.join('+')}=${afterRatio.reduce((sum, value) => sum + value, 0)}\\) 份，一份 ${unit} 元，所以變動後為 ${afterValues.join('、')} 元。因甲給乙 ${transfer} 元，原本甲為 ${originalA}，乙為 ${originalB}，丙不變為 ${afterValues[2]}。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ511RatioLogicTrapSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(`簡答：${summary}。過程：${detail}`);
    };
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const ratios = [
          [1, 2, 4],
          [2, 3, 5],
          [1, 3, 4],
          [3, 4, 6],
        ];
        const ratio = ratios[randInt(0, ratios.length - 1)];
        const sum = ratio.reduce((acc, value) => acc + value, 0);
        const maxAngle = (180 * Math.max(...ratio)) / sum;
        add(
          `若 \\(\\triangle ABC\\) 三內角比為 \\(${ratioTex(ratio)}\\)，請問是否可能為直角三角形？`,
          maxAngle === 90 ? `是` : `否`,
          `總份數為 ${sum}，最大角為 \\(180\\times\\frac{${Math.max(...ratio)}}{${sum}}=${formatFraction(180 * Math.max(...ratio), sum)}^\\circ\\)。${maxAngle === 90 ? '最大角為直角，所以是直角三角形。' : '最大角不是直角，所以不是直角三角形。'}`
        );
        continue;
      }
      if (mode === 1) {
        const specialOptions = [
          { sides: '1:\\sqrt3:2', angles: '30^\\circ,60^\\circ,90^\\circ' },
          { sides: '1:1:\\sqrt2', angles: '45^\\circ,45^\\circ,90^\\circ' },
        ];
        const item = specialOptions[randInt(0, specialOptions.length - 1)];
        add(
          `已知三角形三邊長比 \\(a:b:c=${item.sides}\\)，求此三角形之三內角度數。`,
          `\\(${item.angles}\\)`,
          `國中幾何中小寫 \\(a,b,c\\) 通常代表三邊長。\\(${item.sides}\\) 是特殊直角三角形的邊長比，對應角為 \\(${item.angles}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const diff = [10, 15, 20, 25][randInt(0, 3)];
        add(
          `若三內角滿足 \\(\\angle A-\\angle B=\\angle B-\\angle C=${diff}^\\circ\\)，求三角形之邊比。`,
          `無法由本節比例直接求邊比`,
          `可先由等差關係求出角度，但角度比不等於邊長比；若未學正弦定理，不能把邊比直接寫成角度比。`
        );
        continue;
      }
      if (mode === 3) {
        const ratioOptions = [
          [5, 2, 3],
          [7, 3, 4],
          [9, 4, 5],
        ];
        const ratio = ratioOptions[randInt(0, ratioOptions.length - 1)];
        add(
          `已知一個三角形的一個外角與兩個不相鄰內角的比為 \\(${ratioTex(ratio)}\\)，求此三角形最小內角。`,
          `條件不足，無法唯一決定`,
          `外角等於兩個不相鄰內角和。若外角與兩不相鄰內角比為 \\(${ratioTex(ratio)}\\)，只表示外角可寫成另外兩角的和，仍無法決定比例常數，所以最小內角不唯一。`
        );
        continue;
      }
      const wrongTargets = ['對應角之比也為 \\(a:b:c\\)', '三角形面積比也一定為 \\(a:b:c\\)', '三角形高的比也為 \\(a:b:c\\)'];
      const target = wrongTargets[randInt(0, wrongTargets.length - 1)];
      add(
        `判斷正誤：若三角形三邊長之比為 \\(a:b:c\\)，則${target}。`,
        `錯`,
        `比例題最常錯在把「大小順序」直接當成「比例相同」。邊、角、高或面積各有自己的關係，不能未經推導就沿用同一組比。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function formatRadical(n) {
    const root = Math.sqrt(n);
    if (Number.isInteger(root)) return `${root}`;
    let outside = 1;
    let inside = n;
    for (let k = Math.floor(Math.sqrt(n)); k >= 2; k -= 1) {
      const square = k * k;
      if (inside % square === 0) {
        outside *= k;
        inside /= square;
      }
    }
    if (outside === 1) return `\\sqrt{${inside}}`;
    return `${outside}\\sqrt{${inside}}`;
  }

  function pointText(x, y) {
    return `(${x},${y})`;
  }

  function buildJ521CoordinateTangentIntegrationAdvancedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(detail);
    };
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [8, 15, 17],
      [7, 24, 25],
      [20, 21, 29],
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const [diff, length, distance] = triples[randInt(0, triples.length - 1)];
        const r2 = randInt(2, 6);
        const r1 = r2 + diff;
        const y = randInt(-3, 3);
        add(
          `兩圓 \\(C_1\\)、\\(C_2\\) 的圓心分別為 \\(${pointText(0, y)}\\)、\\(${pointText(distance, y)}\\)，半徑分別為 \\(${r1}\\)、\\(${r2}\\)。求兩圓外公切線段長。`,
          `\\(${length}\\)`,
          `外公切線段、連心線與半徑差會形成直角三角形，所以長度為 \\(\\sqrt{d^2-(r_1-r_2)^2}=\\sqrt{${distance}^2-${diff}^2}=${length}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const r = randInt(2, 7);
        const d = r + randInt(4, 12);
        add(
          `已知點 \\(P\\) 到圓心 \\(O\\) 的距離為 \\(${d}\\)，圓 \\(O\\) 的半徑為 \\(${r}\\)。求 \\(P\\) 到圓的最短距離與最長距離。`,
          `最短 \\(${d - r}\\)，最長 \\(${d + r}\\)`,
          `點在圓外時，最近點與最遠點都落在 \\(OP\\) 直線上。最短距離為 \\(OP-r=${d}-${r}=${d - r}\\)，最長距離為 \\(OP+r=${d}+${r}=${d + r}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const x = randInt(3, 9);
        const c = randInt(3, 8);
        const r = randInt(1, c - 1);
        const tangent2 = x * x + c * c - r * r;
        const tangentText = formatRadical(tangent2);
        add(
          `在座標平面上，點 \\(P(x,0)\\) 到圓心 \\((0,${c})\\)、半徑 \\(${r}\\) 的圓之切線長為 \\(${tangentText}\\)。若 \\(x>0\\)，求 \\(x\\)。`,
          `\\(x=${x}\\)`,
          `由切線長公式 \\(PT^2=OP^2-r^2\\)。又 \\(OP^2=x^2+${c}^2\\)，所以 \\(${tangent2}=x^2+${c * c}-${r * r}\\)，得 \\(x^2=${x * x}\\)。因為 \\(x>0\\)，所以 \\(x=${x}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const bigR = randInt(6, 10);
        const smallR = randInt(2, bigR - 2);
        const d = (bigR + smallR) * randInt(2, 4);
        const external = formatFraction(bigR * d, bigR - smallR);
        const internal = formatFraction(bigR * d, bigR + smallR);
        add(
          `兩圓圓心在 \\(x\\) 軸上，圓 \\(O_1\\) 圓心為 \\((0,0)\\)、半徑 \\(${bigR}\\)，圓 \\(O_2\\) 圓心為 \\((${d},0)\\)、半徑 \\(${smallR}\\)。求外相似中心與內相似中心的 \\(x\\) 座標。`,
          `外相似中心 \\(x=${external}\\)，內相似中心 \\(x=${internal}\\)`,
          `相似中心會把連心線按半徑比分割。外分點為 \\(x=\\frac{R\\cdot d}{R-r}=\\frac{${bigR}\\cdot${d}}{${bigR}-${smallR}}=${external}\\)；內分點為 \\(x=\\frac{R\\cdot d}{R+r}=\\frac{${bigR}\\cdot${d}}{${bigR}+${smallR}}=${internal}\\)。`
        );
        continue;
      }
      const r = randInt(2, 8);
      const shortest = `${r}\\sqrt{2}-${r}`;
      add(
        `一圓同時與兩座標軸相切，且位於第一象限，半徑為 \\(${r}\\)。求原點到此圓的最短距離。`,
        `\\(${shortest}\\)`,
        `圓心為 \\((${r},${r})\\)，所以原點到圓心的距離為 \\(${r}\\sqrt2\\)。原點在圓外，最短距離為 \\(OP-r=${r}\\sqrt2-${r}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ523SecantTangentQuadraticModelSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(detail);
    };
    const tangentTriples = [
      { r: 5, d: 13, t: 12 },
      { r: 6, d: 10, t: 8 },
      { r: 8, d: 17, t: 15 },
      { r: 7, d: 25, t: 24 },
    ];
    const ratioPairs = [[1, 2], [1, 3], [1, 4], [1, 5], [2, 3], [2, 5], [3, 4], [3, 5]];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const [m, n] = ratioPairs[randInt(0, ratioPairs.length - 1)];
        const scale = randInt(2, 5);
        const pa = m * scale;
        const ab = n * scale;
        const pb = pa + ab;
        const pt2 = pa * pb;
        const pt = formatRadical(pt2);
        add(
          `圓外一點 \\(P\\) 作切線 \\(PT\\) 與割線 \\(PAB\\)。若 \\(PA:AB=${m}:${n}\\)，且 \\(PT=${pt}\\)，求割線全長 \\(PB\\)。`,
          `\\(PB=${pb}\\)`,
          `設 \\(PA=${formatLinearTerm(m, 'k')}\\)、\\(AB=${formatLinearTerm(n, 'k')}\\)，則 \\(PB=${formatLinearTerm(m + n, 'k')}\\)。由切割線定理 \\(PT^2=PA\\cdot PB\\)，得 \\(${pt2}=${m * (m + n)}k^2\\)，所以 \\(k=${scale}\\)，因此 \\(PB=${pb}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const item = tangentTriples[randInt(0, tangentTriples.length - 1)];
        const smallR = randInt(2, item.r - 2);
        const smallT = formatRadical(item.d * item.d - smallR * smallR);
        add(
          `圓外一點 \\(P\\) 對兩個同心圓作切線。大圓半徑為 \\(${item.r}\\)，小圓半徑為 \\(${smallR}\\)，且 \\(P\\) 到圓心距離為 \\(${item.d}\\)。已知到大圓的切線長為 \\(${item.t}\\)，求到小圓的切線長。`,
          `\\(${smallT}\\)`,
          `切線長由直角三角形計算。到小圓的切線長為 \\(\\sqrt{${item.d}^2-${smallR}^2}=\\sqrt{${item.d * item.d - smallR * smallR}}=${smallT}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const pa = randInt(3, 8);
        const r = randInt(3, 9);
        const pb = pa + 2 * r;
        const pt2 = pa * pb;
        const pt = formatRadical(pt2);
        add(
          `已知 \\(P\\) 為圓外一點，\\(PT\\) 為切線，割線 \\(PAB\\) 通過圓心。若 \\(PA=${pa}\\)、\\(PT=${pt}\\)，求此圓半徑。`,
          `\\(${r}\\)`,
          `因為割線通過圓心，所以 \\(PB=PA+2r\\)。由 \\(PT^2=PA\\cdot PB\\)，得 \\(${pt2}=${pa}\\cdot PB\\)，所以 \\(PB=${pb}\\)。因此 \\(2r=PB-PA=${pb}-${pa}\\)，半徑 \\(r=${r}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const t = randInt(5, 15);
        add(
          `自圓外一點 \\(P\\) 向同一圓作兩條切線 \\(PT_1\\)、\\(PT_2\\)。若 \\(PT_1=${t}\\)，求 \\(PT_2\\) 與點 \\(P\\) 對此圓的乘冪值。`,
          `\\(PT_2=${t}\\)，乘冪值 \\(${t * t}\\)`,
          `同一外點作兩切線，切線長相等，所以 \\(PT_2=PT_1=${t}\\)。外點對圓的乘冪可用切線平方表示，為 \\(PT^2=${t}^2=${t * t}\\)。`
        );
        continue;
      }
      const pa = randInt(4, 12);
      const product = 2 * pa * pa;
      add(
        `割線 \\(PAB\\) 中，\\(A\\) 在 \\(P\\) 與 \\(B\\) 之間，且 \\(A\\) 是 \\(PB\\) 的中點。若 \\(PA\\cdot PB=${product}\\)，求 \\(PA\\) 的長度。`,
        `\\(PA=${pa}\\)`,
        `因為 \\(A\\) 是 \\(PB\\) 的中點，所以 \\(PB=2PA\\)。令 \\(PA=x\\)，則 \\(x\\cdot2x=${product}\\)，也就是 \\(2x^2=${product}\\)，得 \\(x=${pa}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ521TwoCirclePositionParameterSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(detail);
    };
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const k = randInt(2, 6);
        const a = randInt(1, 3);
        const b = randInt(1, 4);
        const r1 = k + a;
        const r2 = 2 * k + b;
        const d = r1 + r2;
        add(
          `兩圓半徑分別為 \\(k+${a}\\)、\\(2k+${b}\\)，連心線長為 \\(${d}\\)。若兩圓外切，求 \\(k\\)。`,
          `\\(k=${k}\\)`,
          `外切時連心線長等於半徑和，所以 \\((k+${a})+(2k+${b})=${d}\\)。整理得 \\(3k=${d - a - b}\\)，所以 \\(k=${k}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const d = 10;
        add(
          `兩圓半徑分別為 \\(k+2\\)、\\(2k-1\\)，連心線長為 \\(${d}\\)。若兩圓交於兩點，求正整數 \\(k\\) 的範圍。`,
          `\\(k=4,5,\\ldots,12\\)`,
          `交於兩點需滿足 \\(|r_1-r_2|<d<r_1+r_2\\)。本題為 \\(|k-3|<10\\) 且 \\(10<3k+1\\)，再加上半徑為正，得到 \\(4\\le k\\le12\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const bigR = randInt(5, 10);
        const smallR = randInt(2, bigR - 2);
        const d = bigR - smallR;
        add(
          `兩圓半徑分別為 \\(${bigR}\\)、\\(${smallR}\\)。若兩圓共有 3 條公切線，求連心線長。`,
          `\\(${d}\\)`,
          `兩圓共有 3 條公切線代表兩圓內切，因此連心線長為半徑差 \\(${bigR}-${smallR}=${d}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const bigR = randInt(9, 15);
        const smallR = randInt(2, bigR - 3);
        const diff = bigR - smallR;
        add(
          `兩圓半徑分別為 \\(${bigR}\\)、\\(${smallR}\\)，連心線長為 \\(x\\)。若兩圓內含但不重合且不內切，求 \\(x\\) 的範圍。`,
          `\\(0<x<${diff}\\)`,
          `內含但不重合表示兩圓不同心，且小圓在大圓內部；不內切表示還沒有碰到。因此 \\(0<x<R-r=${bigR}-${smallR}=${diff}\\)。`
        );
        continue;
      }
      const d = randInt(12, 20);
      const r = randInt(3, d - 5);
      const upper = d - r;
      add(
        `兩圓有 4 條公切線，連心線長為 \\(${d}\\)，其中一圓半徑為 \\(${r}\\)。求另一圓半徑 \\(s\\) 的可能範圍。`,
        `\\(0<s<${upper}\\)`,
        `兩圓有 4 條公切線代表兩圓外離，所以連心線長大於半徑和：\\(${d}>${r}+s\\)。因此 \\(0<s<${upper}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ521TangentPythagoreanIntegrationSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(detail);
    };
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const r = randInt(2, 5);
        const hyp = [13, 17, 25][randInt(0, 2)];
        const perimeter = 2 * (hyp + r);
        add(
          `直角三角形的內切圓半徑為 \\(${r}\\)，斜邊長為 \\(${hyp}\\)。求此三角形的周長。`,
          `\\(${perimeter}\\)`,
          `直角三角形內切圓半徑 \\(r=\\frac{a+b-c}{2}\\)，所以 \\(a+b=c+2r\\)。周長 \\(=a+b+c=2c+2r=2(${hyp}+${r})=${perimeter}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const leg1 = randInt(4, 10);
        const leg2 = randInt(5, 12);
        const midline = formatFraction(leg1 + leg2, 2);
        add(
          `梯形 \\(ABCD\\) 有內切圓，且兩腰長分別為 \\(${leg1}\\)、\\(${leg2}\\)。求此梯形的中線長。`,
          `\\(${midline}\\)`,
          `有內切圓的四邊形滿足對邊和相等，所以兩底和等於兩腰和 \\(${leg1}+${leg2}\\)。梯形中線長為兩底和的一半，因此為 \\(${midline}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const pairs = [
          { d: 13, t: 12, r: 5 },
          { d: 10, t: 8, r: 6 },
          { d: 17, t: 15, r: 8 },
          { d: 25, t: 24, r: 7 },
        ];
        const item = pairs[randInt(0, pairs.length - 1)];
        add(
          `圓外一點 \\(P\\) 到圓心 \\(O\\) 的距離為 \\(${item.d}\\)，切線長為 \\(${item.t}\\)。若 \\(Q\\) 為圓上一點，求 \\(PQ\\) 的最大值。`,
          `\\(${item.d + item.r}\\)`,
          `先由 \\(PT^2=OP^2-r^2\\) 得半徑 \\(r=\\sqrt{${item.d}^2-${item.t}^2}=${item.r}\\)。最遠點在 \\(OP\\) 延長線上，所以 \\(PQ_{\\max}=OP+r=${item.d}+${item.r}=${item.d + item.r}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const triples = [
          { p: 3, q: 4, side: 5 },
          { p: 5, q: 12, side: 13 },
          { p: 8, q: 15, side: 17 },
        ];
        const item = triples[randInt(0, triples.length - 1)];
        const area = 2 * item.p * item.q;
        const diagonal = 2 * item.p;
        const radius = formatFraction(area, 2 * item.side);
        add(
          `菱形 \\(ABCD\\) 的面積為 \\(${area}\\)，對角線 \\(AC=${diagonal}\\)。若菱形有內切圓，求內切圓半徑。`,
          `\\(${radius}\\)`,
          `菱形對角線互相垂直平分，所以另一對角線為 \\(\\frac{2\\times${area}}{${diagonal}}=${2 * item.q}\\)，邊長為 \\(\\sqrt{${item.p}^2+${item.q}^2}=${item.side}\\)。內切圓半徑 \\(r=\\frac{面積}{半周長}=\\frac{${area}}{2\\times${item.side}}=${radius}\\)。`
        );
        continue;
      }
      const small = randInt(2, 8);
      add(
        `一個大圓內部放入三個半徑皆為 \\(${small}\\) 的小圓，三個小圓兩兩外切，且都與大圓內切。求大圓半徑與小圓半徑的比。`,
        `\\(\\left(1+\\frac{2\\sqrt3}{3}\\right):1\\)`,
        `三個小圓圓心形成邊長 \\(${2 * small}\\) 的正三角形。正三角形外接圓半徑為 \\(\\frac{${2 * small}}{\\sqrt3}\\)，也就是大圓圓心到小圓圓心的距離。大圓半徑 \\(R=${small}+\\frac{${2 * small}}{\\sqrt3}\\)，所以 \\(R:r=1+\\frac{2}{\\sqrt3}=1+\\frac{2\\sqrt3}{3}\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ523PowerSimilarityAdvancedSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(detail);
    };
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const ae = randInt(3, 8);
        const eb = randInt(4, 10);
        const ce = randInt(2, 6);
        const product = ae * eb;
        const ed = product % ce === 0 ? `${product / ce}` : formatFraction(product, ce);
        add(
          `圓內兩弦 \\(AB\\)、\\(CD\\) 交於 \\(E\\)。若 \\(AE=${ae}\\)、\\(EB=${eb}\\)、\\(CE=${ce}\\)，求 \\(ED\\)。`,
          `\\(ED=${ed}\\)`,
          `相交弦定理給出 \\(AE\\cdot EB=CE\\cdot ED\\)。所以 \\(ED=\\frac{${ae}\\cdot${eb}}{${ce}}=${ed}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const ae = randInt(3, 7);
        const ce = randInt(2, 6);
        const eb = ae + randInt(2, 5);
        const product = ae * eb;
        const edRaw = product / ce;
        if (!Number.isInteger(edRaw)) {
          i -= 1;
          continue;
        }
        const left = ae * ce;
        const right = eb * edRaw;
        const reduced = reduceFraction(left, right);
        const ratio = reduced.denominator === 1 ? `${reduced.numerator}:1` : `${Math.abs(reduced.numerator)}:${reduced.denominator}`;
        add(
          `圓內兩弦 \\(AB\\)、\\(CD\\) 交於 \\(E\\)。若 \\(AE=${ae}\\)、\\(EB=${eb}\\)、\\(CE=${ce}\\)、\\(ED=${edRaw}\\)，求 \\(\\triangle AEC\\) 與 \\(\\triangle BED\\) 的面積比。`,
          `\\(${ratio}\\)`,
          `兩三角形在 \\(E\\) 的夾角相等，面積比等於夾角兩邊乘積比：\\([AEC]:[BED]=AE\\cdot CE:BE\\cdot DE=${left}:${right}=${ratio}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const cases = [
          { r: 13, op: 12, half: 5 },
          { r: 10, op: 6, half: 8 },
          { r: 15, op: 9, half: 12 },
          { r: 17, op: 8, half: 15 },
          { r: 25, op: 7, half: 24 },
        ];
        const item = cases[randInt(0, cases.length - 1)];
        const r = item.r;
        const op = item.op;
        const shortest = 2 * item.half;
        const longest = 2 * r;
        const product = r * r - op * op;
        add(
          `點 \\(P\\) 在圓內，過 \\(P\\) 的最短弦長為 \\(${shortest}\\)，最長弦長為 \\(${longest}\\)。求過 \\(P\\) 任一弦被 \\(P\\) 分成兩段後的乘積。`,
          `\\(${product}\\)`,
          `最長弦是直徑，所以半徑 \\(r=${r}\\)。最短弦垂直 \\(OP\\)，半弦長為 \\(${item.half}\\)，故 \\(OP^2=${r}^2-${item.half}^2=${op * op}\\)。圓內乘冪的段長乘積為 \\(r^2-OP^2=${product}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const options = [
          { x: 3, a: 2, b: 1, c: 7 },
          { x: 4, a: 1, b: 2, c: 12 },
          { x: 5, a: 2, b: 1, c: 6 },
          { x: 6, a: 3, b: 1, c: 7 },
          { x: 7, a: 4, b: 1, c: 8 },
          { x: 8, a: 5, b: 2, c: 14 },
          { x: 9, a: 3, b: 2, c: 11 },
          { x: 10, a: 4, b: 2, c: 12 },
          { x: 11, a: 5, b: 2, c: 13 },
          { x: 12, a: 6, b: 2, c: 14 },
        ];
        const item = options[randInt(0, options.length - 1)];
        const pbText = `2x+${item.a}`;
        const pdConst = item.c - item.b;
        const pdText = pdConst === 0 ? `2x` : `2x+${pdConst}`;
        add(
          `圓外一點 \\(P\\) 引兩割線 \\(PAB\\)、\\(PCD\\)。若 \\(PA=x\\)、\\(AB=x+${item.a}\\)、\\(PC=x-${item.b}\\)、\\(CD=x+${item.c}\\)，求 \\(x\\)。`,
          `\\(x=${item.x}\\)`,
          `由割線定理 \\(PA\\cdot PB=PC\\cdot PD\\)。因此 \\(PB=${pbText}\\)，\\(PD=${pdText}\\)，所以 \\(x(${pbText})=(x-${item.b})(${pdText})\\)。解得 \\(x=${item.x}\\)。`
        );
        continue;
      }
      const ae = randInt(3, 8);
      const eb = randInt(3, 9);
      const ce = randInt(2, 6);
      const ed = formatFraction(ae * eb, ce);
      add(
        `四邊形 \\(ABCD\\) 的對角線交於 \\(E\\)。若 \\(AE=${ae}\\)、\\(EB=${eb}\\)、\\(CE=${ce}\\)、\\(ED=${ed}\\)，且 \\(AE\\cdot EB=CE\\cdot ED\\)，判斷 \\(A,B,C,D\\) 是否共圓。`,
        `共圓`,
        `這是相交弦定理的逆用。因為兩條對角線交點滿足 \\(AE\\cdot EB=CE\\cdot ED\\)，可判斷四點 \\(A,B,C,D\\) 在同一圓上。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ531AdvancedConsecutiveIntegersSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(detail);
    };
    const factorials = { 3: 6, 4: 24, 5: 120 };
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const length = [3, 4, 5][randInt(0, 2)];
        const start = randInt(-6, 6);
        const term = (offset) => {
          const value = start + offset;
          if (value === 0) return 'n';
          return value > 0 ? `n+${value}` : `n-${Math.abs(value)}`;
        };
        const terms = Array.from({ length }, (_, index) => `\\(${term(index)}\\)`).join('、');
        add(
          `證明任意 ${length} 個連續整數 ${terms} 的乘積必為 \\(${factorials[length]}\\) 的倍數。`,
          `成立`,
          `令 \\(m=${term(0)}\\)，原乘積可寫成 \\(m(m+1)\\cdots(m+${length - 1})\\)。又 \\(\\frac{m(m+1)\\cdots(m+${length - 1})}{${length}!}\\) 為整數，因此原乘積必為 \\(${length}! = ${factorials[length]}\\) 的倍數。`
        );
        continue;
      }
      if (mode === 1) {
        const shift = randInt(-4, 4);
        const term = shift === 0 ? 'n' : shift > 0 ? `n+${shift}` : `n-${Math.abs(shift)}`;
        add(
          `證明對任意整數 \\(n\\)，\\((${term})^3-(${term})\\) 必為 6 的倍數。`,
          `成立`,
          `令 \\(m=${term}\\)，則 \\(m^3-m=m(m-1)(m+1)\\)，是三個連續整數的乘積。三個連續整數必含一個 2 的倍數與一個 3 的倍數，所以必為 6 的倍數。`
        );
        continue;
      }
      if (mode === 2) {
        const length = [3, 5, 7, 9][randInt(0, 3)];
        const half = (length - 1) / 2;
        add(
          `證明任意 ${length} 個連續整數的和必為 \\(${length}\\) 的倍數。`,
          `成立`,
          `把這 ${length} 個連續整數寫成 \\((n-${half}),\\ldots,n,\\ldots,(n+${half})\\)。首尾相加會互相抵消偏移量，總和為 \\(${length}n\\)，所以必為 \\(${length}\\) 的倍數。`
        );
        continue;
      }
      if (mode === 3) {
        const divisor = [8, 24][randInt(0, 1)];
        if (divisor === 8) {
          add(
            `已知 \\(n\\) 為奇數，證明 \\(n^2-1\\) 必為 8 的倍數。`,
            `成立`,
            `令 \\(n=2k+1\\)，則 \\(n^2-1=(2k+1)^2-1=4k(k+1)\\)。因為 \\(k\\)、\\(k+1\\) 連續，必有一個偶數，所以 \\(4k(k+1)\\) 必為 8 的倍數。`
          );
        } else {
          add(
            `已知 \\(n\\) 為奇數，證明 \\(n^2-1\\) 必為 24 的倍數不一定成立，並說明正確的必然整除結論。`,
            `不一定；必為 8 的倍數`,
            `奇數平方減 1 一定可證為 8 的倍數，但不一定是 24 的倍數。例如 \\(n=3\\) 時，\\(n^2-1=8\\)，不是 24 的倍數。穩定結論是必為 8 的倍數。`
          );
        }
        continue;
      }
      const start = 2 * randInt(1, 5);
      add(
        `證明三個連續偶數 \\(${start}k\\)、\\(${start}k+2\\)、\\(${start}k+4\\) 的乘積必為 48 的倍數。`,
        `成立`,
        `三個連續偶數可寫成 \\(2m\\)、\\(2m+2\\)、\\(2m+4\\)，乘積為 \\(8m(m+1)(m+2)\\)。三個連續整數 \\(m,m+1,m+2\\) 的乘積必為 6 的倍數，所以整體必為 \\(8\\times6=48\\) 的倍數。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ531PolynomialDivisibilitySet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(detail);
    };
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const a = randInt(2, 12);
        add(
          `證明 \\((${a}n+1)^2-(${a}n-1)^2\\) 必為 \\(${4 * a}\\) 的倍數。`,
          `成立`,
          `利用平方差，\\((${a}n+1)^2-(${a}n-1)^2=[(${a}n+1)-(${a}n-1)][(${a}n+1)+(${a}n-1)]=2\\cdot${2 * a}n=${4 * a}n\\)，所以必為 \\(${4 * a}\\) 的倍數。`
        );
        continue;
      }
      if (mode === 1) {
        const d = randInt(2, 9);
        add(
          `已知 \\(a-b=${d}\\)，證明 \\(a^2-b^2-${d}(a+b)=0\\)。`,
          `成立`,
          `因為 \\(a^2-b^2=(a-b)(a+b)\\)，又 \\(a-b=${d}\\)，所以 \\(a^2-b^2=${d}(a+b)\\)。移項得 \\(a^2-b^2-${d}(a+b)=0\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const k = randInt(3, 8);
        const remainder = 14 % k;
        add(
          `求證 \\((${k}n+1)^2+(${k}n+2)^2+(${k}n+3)^2\\) 除以 \\(${k}\\) 的餘數固定，並求此餘數。`,
          `餘數 \\(${remainder}\\)`,
          `展開後含 \\(${k}n\\) 的項都可被 \\(${k}\\) 整除，只要看常數平方和：\\(1^2+2^2+3^2=14\\)。所以餘數為 \\(14\\) 除以 \\(${k}\\) 的餘數，即 \\(${remainder}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const m = randInt(2, 7);
        const divisor = m * m + 1;
        add(
          `已知 \\(a=${m}b\\)，證明 \\(a^2+b^2\\) 必為 \\(${divisor}\\) 的倍數。`,
          `成立`,
          `代入 \\(a=${m}b\\)，得 \\(a^2+b^2=(${m}b)^2+b^2=(${m * m}+1)b^2=${divisor}b^2\\)，所以必為 \\(${divisor}\\) 的倍數。`
        );
        continue;
      }
      const c = 2 * randInt(1, 5) + 1;
      add(
        `證明對任意整數 \\(n\\)，\\(n^2+${c}n\\) 必為偶數。`,
        `成立`,
        `\\(n^2+${c}n=n(n+${c})\\)。因為 \\(${c}\\) 是奇數，\\(n\\) 與 \\(n+${c}\\) 奇偶性相反，所以兩者中必有一個偶數，乘積必為偶數。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ531MultiVariableSignLogicSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(detail);
    };
    const variableSets = [
      ['a', 'b', 'c', 'd'],
      ['p', 'q', 'r', 's'],
      ['x', 'y', 'z', 'w'],
      ['m', 'n', 'r', 't'],
      ['u', 'v', 'w', 'x'],
      ['A', 'B', 'C', 'D'],
      ['P', 'Q', 'R', 'S'],
      ['M', 'N', 'O', 'T'],
      ['e', 'f', 'g', 'h'],
      ['L', 'M', 'N', 'P'],
    ];
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      const [a, b, c, d] = variableSets[randInt(0, variableSets.length - 1)];
      if (mode === 0) {
        add(
          `已知 \\(${a}${b}<0\\)、\\(${b}${c}<0\\)、\\(${c}${d}<0\\)，判斷 \\(${a}${d}\\) 的正負號。`,
          `\\(${a}${d}<0\\)`,
          `\\(${a}${b}<0\\) 表示 \\(${a}\\)、\\(${b}\\) 異號；\\(${b}${c}<0\\) 表示 \\(${b}\\)、\\(${c}\\) 異號，所以 \\(${a}\\)、\\(${c}\\) 同號。又 \\(${c}${d}<0\\)，故 \\(${a}\\)、\\(${d}\\) 異號，\\(${a}${d}<0\\)。`
        );
        continue;
      }
      if (mode === 1) {
        add(
          `若 \\(${a}${b}${c}>0\\) 且 \\(${a}+${b}+${c}<0\\)，請問 \\(${a}\\)、\\(${b}\\)、\\(${c}\\) 三數中有幾個負數？`,
          `2 個`,
          `三數乘積為正，負數個數只能是 0 個或 2 個。若 0 個負數，三數皆正，和不可能小於 0；因此必有 2 個負數。`
        );
        continue;
      }
      if (mode === 2) {
        add(
          `已知 \\(${a}<${b}<0<${c}\\)，比較 \\(\\frac1{${a}}\\)、\\(\\frac1{${b}}\\)、\\(\\frac1{${c}}\\) 的大小。`,
          `\\(\\frac1{${b}}<\\frac1{${a}}<\\frac1{${c}}\\)`,
          `負數取倒數時大小會反向，所以由 \\(${a}<${b}<0\\) 得 \\(\\frac1{${a}}>\\frac1{${b}}\\)。而 \\(\\frac1{${c}}>0\\)，兩個負倒數都小於它，因此 \\(\\frac1{${b}}<\\frac1{${a}}<\\frac1{${c}}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const secondQuadrant = randInt(0, 1) === 0;
        const firstSign = secondQuadrant ? '<0' : '>0';
        const secondSign = secondQuadrant ? '>0' : '<0';
        add(
          `若 \\(${a}^2${b}${firstSign}\\) 且 \\(${b}^2${a}${secondSign}\\)，判斷點 \\((${b},${a})\\) 在第幾象限。`,
          secondQuadrant ? `第二象限` : `第四象限`,
          `因為 \\(${a}^2>0\\)，由 \\(${a}^2${b}${firstSign}\\) 得 \\(${b}${firstSign}0\\)。又 \\(${b}^2>0\\)，由 \\(${b}^2${a}${secondSign}\\) 得 \\(${a}${secondSign}0\\)。所以點 \\((${b},${a})\\) 的橫坐標${secondQuadrant ? '為負、縱坐標為正，在第二象限' : '為正、縱坐標為負，在第四象限'}。`
        );
        continue;
      }
      add(
        `已知 \\(${a}${b}>0\\)、\\(\\frac{${b}}{${c}}<0\\)，證明 \\(${a}${c}<0\\)。`,
        `成立`,
        `\\(${a}${b}>0\\) 表示 \\(${a}\\)、\\(${b}\\) 同號；\\(\\frac{${b}}{${c}}<0\\) 表示 \\(${b}\\)、\\(${c}\\) 異號。因此 \\(${a}\\)、\\(${c}\\) 異號，故 \\(${a}${c}<0\\)。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ531InequalityProofsCompositeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(detail);
    };
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const p = randInt(2, 6);
        const q = randInt(p + 1, 10);
        add(
          `已知 \\(0<a<b\\)，證明 \\(\\frac1a>\\frac1b\\)，並比較 \\(\\frac1{${p}}\\) 與 \\(\\frac1{${q}}\\)。`,
          `\\(\\frac1{${p}}>\\frac1{${q}}\\)`,
          `因為 \\(a,b\\) 皆為正數，可同乘正數 \\(ab\\)，由 \\(b>a\\) 得 \\(\\frac1a>\\frac1b\\)。所以 \\(${p}<${q}\\) 時，\\(\\frac1{${p}}>\\frac1{${q}}\\)。`
        );
        continue;
      }
      if (mode === 1) {
        const left = -randInt(9, 15);
        const right = -randInt(2, 8);
        add(
          `若 \\(a<b<0\\)，證明 \\(a^2>b^2\\)，並用 \\(a=${left}\\)、\\(b=${right}\\) 驗算。`,
          `\\(${left * left}>${right * right}\\)`,
          `當 \\(a<b<0\\) 時，\\(|a|>|b|\\)，所以 \\(a^2>b^2\\)。驗算：\\(${left}^2=${left * left}\\)，\\(${right}^2=${right * right}\\)。`
        );
        continue;
      }
      if (mode === 2) {
        const x = randInt(-8, 2);
        const y = randInt(x + 2, x + 10);
        const middle = formatFraction(x + y, 2);
        add(
          `已知 \\(x<y\\)，證明 \\(\\frac{x+y}{2}\\) 必介於 \\(x\\) 與 \\(y\\) 之間，並求 \\(x=${x}\\)、\\(y=${y}\\) 時的中間值。`,
          `\\(${middle}\\)`,
          `由 \\(x<y\\)，兩邊同加 \\(x\\) 得 \\(2x<x+y\\)，所以 \\(x<\\frac{x+y}{2}\\)。兩邊同加 \\(y\\) 得 \\(x+y<2y\\)，所以 \\(\\frac{x+y}{2}<y\\)。代入得 \\(${middle}\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const b = randInt(2, 8);
        const a = b + randInt(1, 6);
        add(
          `若 \\(a,b\\) 為正整數且 \\(a>b\\)，證明 \\(\\frac{a}{b}>\\frac{a+1}{b+1}\\)，並用 \\(a=${a}\\)、\\(b=${b}\\) 驗算。`,
          `\\(\\frac{${a}}{${b}}>\\frac{${a + 1}}{${b + 1}}\\)`,
          `因為分母皆為正，可交叉相乘比較：\\(a(b+1)>b(a+1)\\) 等價於 \\(ab+a>ab+b\\)，也就是 \\(a>b\\)，故成立。`
        );
        continue;
      }
      const b = randInt(2, 8);
      const a = b + randInt(1, 7);
      add(
        `證明若 \\(a>b>0\\)，則 \\(\\sqrt a>\\sqrt b\\)，並用 \\(a=${a}\\)、\\(b=${b}\\) 驗算。`,
        `\\(\\sqrt{${a}}>\\sqrt{${b}}\\)`,
        `平方根函數在正數範圍內保持大小關係；也可反證：若 \\(\\sqrt a\\le\\sqrt b\\)，兩邊平方得 \\(a\\le b\\)，與 \\(a>b\\) 矛盾。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ531AlgebraGeometryProofBridgeSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const add = (question, summary, detail) => {
      questions.push(question);
      summaryAnswers.push(summary);
      answers.push(detail);
    };
    for (let i = 0; i < count; i += 1) {
      const mode = i % 5;
      if (mode === 0) {
        const p = randInt(2, 8);
        const q = randInt(1, 9);
        add(
          `證明 \\(x^2-${2 * p}x+${p * p + q}\\) 對所有實數 \\(x\\) 恆為正值。`,
          `恆為正值`,
          `配方得 \\(x^2-${2 * p}x+${p * p + q}=(x-${p})^2+${q}\\)。平方項 \\((x-${p})^2\\ge0\\)，再加上正數 \\(${q}\\)，所以恆為正值。`
        );
        continue;
      }
      if (mode === 1) {
        add(
          `已知 \\(a,b,c\\) 為三角形三邊長，證明 \\(a^2+b^2+c^2<2(ab+bc+ca)\\)。`,
          `成立`,
          `由三角形不等式得 \\(a<b+c\\)、\\(b<c+a\\)、\\(c<a+b\\)。因為三邊長皆為正，分別乘以 \\(a,b,c\\)，得 \\(a^2<ab+ac\\)、\\(b^2<bc+ab\\)、\\(c^2<ca+bc\\)。三式相加即得結論。`
        );
        continue;
      }
      if (mode === 2) {
        const a = randInt(-5, 5);
        const b = randInt(-5, 5);
        add(
          `證明 \\((a+b)^2\\ge4ab\\)，並用 \\(a=${a}\\)、\\(b=${b}\\) 驗算。`,
          `成立`,
          `因為 \\((a+b)^2-4ab=a^2-2ab+b^2=(a-b)^2\\ge0\\)，所以 \\((a+b)^2\\ge4ab\\)。`
        );
        continue;
      }
      if (mode === 3) {
        const halfPerimeter = 2 * randInt(8, 20);
        const side = formatFraction(halfPerimeter, 2);
        const maxArea = formatFraction(halfPerimeter * halfPerimeter, 4);
        add(
          `已知矩形周長固定為 \\(${2 * halfPerimeter}\\)。證明當矩形為正方形時面積最大，並求最大面積。`,
          `邊長 \\(${side}\\)，最大面積 \\(${maxArea}\\)`,
          `設一邊為 \\(x\\)，另一邊為 \\(${halfPerimeter}-x\\)，面積 \\(A=x(${halfPerimeter}-x)=-(x-${side})^2+${maxArea}\\)。平方項最小為 0，所以 \\(x=${side}\\) 時面積最大，此時為正方形。`
        );
        continue;
      }
      const shift = randInt(0, 5);
      add(
        `證明兩個連續奇數 \\(2n+${2 * shift + 1}\\)、\\(2n+${2 * shift + 3}\\) 的平方差必為 8 的倍數。`,
        `成立`,
        `平方差為 \\((2n+${2 * shift + 3})^2-(2n+${2 * shift + 1})^2\\)，利用平方差公式得 \\(2\\cdot(4n+${4 * shift + 4})=8(n+${shift + 1})\\)，所以必為 8 的倍數。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  function buildJ531ProofReasoningMixedSet(count) {
    const sourceSets = [
      buildJ531AdvancedConsecutiveIntegersSet(5),
      buildJ531PolynomialDivisibilitySet(5),
      buildJ531MultiVariableSignLogicSet(5),
      buildJ531InequalityProofsCompositeSet(5),
      buildJ531AlgebraGeometryProofBridgeSet(5),
    ];
    const order = sourceSets
      .map((_, index) => index)
      .sort(() => (randInt(0, 1) === 0 ? -1 : 1));
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i += 1) {
      const set = sourceSets[order[i % order.length]];
      const pick = randInt(0, set.questions.length - 1);
      questions.push(set.questions[pick]);
      summaryAnswers.push(set.summaryAnswers[pick]);
      answers.push(set.answers[pick]);
    }
    return { questions, summaryAnswers, answers };
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

  function pushAnswerWithManualSummary(answers, summaryAnswers, summary, detail) {
    summaryAnswers.push(summary);
    return Array.prototype.push.call(answers, detail);
  }

  function resolvePracticeCount(count, fallback) {
    const parsed = Number(count);
    if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
    return fallback;
  }

  function stripDetailSummaryLabel(detail) {
    const text = String(detail || '');
    const withoutLabeledSummary = text.replace(
      /^\s*(?:簡答|答案)[:：]\s*[\s\S]*?\s*(?:過程|解析|詳解|說明)[:：]\s*/,
      ''
    );
    if (withoutLabeledSummary !== text) return withoutLabeledSummary.trim();
    return text.replace(/^\s*(?:簡答|答案)[:：]\s*/, '').trim();
  }

  function buildUniquePracticeSet(generator, count) {
    const target = resolvePracticeCount(count, 1);
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const seen = new Set();
    const fallback = [];

    for (let attempt = 0; questions.length < target && attempt < 40; attempt += 1) {
      const batch = generator(Math.max(target, target - questions.length));
      const batchQuestions = Array.isArray(batch.questions) ? batch.questions : [];
      const batchSummaries = Array.isArray(batch.summaryAnswers) ? batch.summaryAnswers : [];
      const batchAnswers = Array.isArray(batch.answers) ? batch.answers : [];

      for (let i = 0; i < batchQuestions.length; i += 1) {
        const question = batchQuestions[i];
        const summary = batchSummaries[i];
        const answer = batchAnswers[i];
        const key = String(question).replace(/\s+/g, ' ').trim();
        if (!question || summary === undefined || answer === undefined) continue;
        fallback.push({ question, summary, answer });
        if (seen.has(key)) continue;
        seen.add(key);
        questions.push(question);
        summaryAnswers.push(summary);
        answers.push(stripDetailSummaryLabel(answer));
        if (questions.length >= target) break;
      }
    }

    for (let i = 0; questions.length < target && i < fallback.length; i += 1) {
      const item = fallback[i];
      questions.push(item.question);
      summaryAnswers.push(item.summary);
      answers.push(stripDetailSummaryLabel(item.answer));
    }

    return { questions, summaryAnswers, answers };
  }

  // ─── j5-1/2/3 文件補充 generators ──────────────────────────────────────

  // 矩形相似判別（j5-1-2）
  function buildRectangleSimilarityCheckSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const basePairs = [
      [3,2],[4,3],[5,4],[6,5],[8,5],[9,6],[10,6],[12,8],[15,10],[10,4],[9,3],[15,9]
    ];
    for (let i = 0; i < count; i++) {
      const [l, w] = basePairs[randInt(0, basePairs.length - 1)];
      const g = gcd(l, w);
      const ln = l / g, wn = w / g;
      // Generate 4 candidate rectangles: exactly one is similar
      const scale = randInt(2, 4);
      const similar = [l * scale, w * scale];
      // three decoy candidates that are NOT similar
      const decoys = [];
      let tries = 0;
      while (decoys.length < 3 && tries < 100) {
        tries++;
        const a = randInt(3, 20);
        const b = randInt(2, a - 1);
        const gab = gcd(a, b);
        if ((a / gab === ln && b / gab === wn) || (a / gab === wn && b / gab === ln)) continue;
        if (decoys.some(([da, db]) => da === a && db === b)) continue;
        decoys.push([a, b]);
      }
      const opts = [[...similar], ...decoys];
      // shuffle opts
      for (let k = opts.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [opts[k], opts[j]] = [opts[j], opts[k]];
      }
      const labels = ['(A)', '(B)', '(C)', '(D)'];
      const simIdx = opts.findIndex(([a, b]) => a === similar[0] && b === similar[1]);
      const optStr = opts.map(([a, b], idx) => `${labels[idx]} 長 ${a} 寬 ${b}`).join('　');
      questions.push(`長方形的長為 ${l}，寬為 ${w}。下列哪一個長方形與它相似？${optStr}`);
      pushAnswerWithManualSummary(
        answers,
        summaryAnswers,
        `${labels[simIdx]} 長 ${similar[0]} 寬 ${similar[1]}`,
        `原長方形長寬比 \\(${l}:${w}=${ln}:${wn}\\)。選項${labels[simIdx]}的長寬比 \\(${similar[0]}:${similar[1]}=${ln}:${wn}\\)，比值相同，故相似。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 相似多邊形角度計算（j5-1-3）
  function buildSimilarPolygonAngleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i++) {
      const mode = i % 3;
      if (mode === 0) {
        // 四邊形ABCD～EFGH，已知3個角，求第4個
        const a = randInt(60, 120);
        const b = randInt(60, 100);
        const c = randInt(60, 110);
        const d = 360 - a - b - c;
        if (d < 40 || d > 150) { i--; continue; }
        const unknownPos = randInt(0, 3);
        const angles = [a, b, c, d];
        const names = ['∠A', '∠B', '∠C', '∠D'];
        const corr = ['∠E', '∠F', '∠G', '∠H'];
        const known = angles.filter((_, k) => k !== unknownPos);
        const knownStr = names.filter((_, k) => k !== unknownPos)
          .map((n, k) => `${n}=${known[k]}°`).join('，');
        questions.push(
          `四邊形 \\(ABCD \\sim\\) 四邊形 \\(EFGH\\)，其中 \\(${knownStr}\\)，則 \\(${corr[unknownPos]}=\\)?`
        );
        answers.push(
          `簡答：\\(${corr[unknownPos]}=${angles[unknownPos]}°\\)。過程：四邊形內角和為 \\(360°\\)，所以 \\(${names[unknownPos]}=360-${known.join('-')}=${angles[unknownPos]}°\\)。相似形對應角相等，故 \\(${corr[unknownPos]}=${angles[unknownPos]}°\\)。`
        );
      } else if (mode === 1) {
        // 五邊形，給出4個角，求第5個
        const a = randInt(90, 130);
        const b = randInt(90, 130);
        const c = randInt(90, 130);
        const dd = randInt(90, 130);
        const e = 540 - a - b - c - dd;
        if (e < 60 || e > 180) { i--; continue; }
        const idx = randInt(0, 4);
        const angs = [a, b, c, dd, e];
        const ns = ['∠A', '∠B', '∠C', '∠D', '∠E'];
        const cs = ["∠A'", "∠B'", "∠C'", "∠D'", "∠E'"];
        const kn = angs.filter((_, k) => k !== idx);
        const knS = ns.filter((_, k) => k !== idx).map((n, k) => `${n}=${kn[k]}°`).join('，');
        questions.push(
          `五邊形 \\(ABCDE \\sim\\) 五邊形 \\(A'B'C'D'E'\\)，已知 \\(${knS}\\)，則 \\(${cs[idx]}=\\)?`
        );
        answers.push(
          `簡答：\\(${cs[idx]}=${angs[idx]}°\\)。過程：五邊形內角和為 \\(540°\\)，所以 \\(${ns[idx]}=540-${kn.join('-')}=${angs[idx]}°\\)。對應角相等，故 \\(${cs[idx]}=${angs[idx]}°\\)。`
        );
      } else {
        // 四邊形，已知兩角比例求另一角
        const ratio1 = randInt(1, 3), ratio2 = randInt(1, 3);
        const base = randInt(30, 60);
        const A = ratio1 * base, B = ratio2 * base;
        const C = randInt(70, 110);
        const D = 360 - A - B - C;
        if (D < 40 || D > 150) { i--; continue; }
        const targetCorr = "∠H";
        questions.push(
          `四邊形 \\(ABCD \\sim\\) 四邊形 \\(EFGH\\)，∠A：∠B \\(=${ratio1}:${ratio2}\\)，\\(\\angle C=${C}°\\)，\\(\\angle D+\\angle A=${A + D}°\\)，則 \\(${targetCorr}=\\)?`
        );
        answers.push(
          `簡答：\\(${targetCorr}=${D}°\\)。過程：由 \\(\\angle A:\\angle B=${ratio1}:${ratio2}\\) 且四邊形內角和 \\(360°\\)，已知 \\(\\angle C=${C}°\\)、\\(\\angle D+\\angle A=${A + D}°\\)，解得 \\(\\angle D=${D}°\\)。對應角相等，所以 \\(${targetCorr}=${D}°\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  // 斜坡位置高度計算（j5-1-3）
  function buildSlopePositionHeightSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    for (let i = 0; i < count; i++) {
      const mode = i % 3;
      if (mode === 0) {
        // 斜坡全長L、高H，走d公尺後高度是？
        const L = randInt(3, 10) * 10;   // 30~100
        const H = randInt(2, 8) * 5;     // 10~40
        const frac = [1, 2, 3, 4][randInt(0, 3)];
        const d = L / frac;
        const h = H / frac;
        questions.push(
          `一斜坡全長 \\(${L}\\) 公尺，高 \\(${H}\\) 公尺。若從坡底沿斜坡走 \\(${d}\\) 公尺，此時離地面的高度是多少公尺？`
        );
        answers.push(
          `簡答：\\(${h}\\) 公尺。過程：走的距離與高度成比例，高度 \\(=H\\times\\frac{d}{L}=${H}\\times\\frac{${d}}{${L}}=${h}\\) 公尺。`
        );
      } else if (mode === 1) {
        // 已知高度h，斜坡全長L，高H，求走了多少距離
        const L = randInt(4, 12) * 10;
        const H = randInt(2, 6) * 5;
        const g = gcd(L, H);
        const dArr = [L / 4, L / 2, 3 * L / 4].filter(d => Number.isInteger(d * H / L));
        if (dArr.length === 0) { i--; continue; }
        const d = dArr[randInt(0, dArr.length - 1)];
        const h = Math.round(H * d / L);
        questions.push(
          `一斜坡全長 \\(${L}\\) 公尺，高 \\(${H}\\) 公尺。若距地面高度為 \\(${h}\\) 公尺，則從坡底沿斜坡走了多少公尺？`
        );
        answers.push(
          `簡答：\\(${d}\\) 公尺。過程：設走了 \\(d\\) 公尺，由相似比 \\(\\frac{h}{H}=\\frac{d}{L}\\)，得 \\(d=L\\times\\frac{h}{H}=${L}\\times\\frac{${h}}{${H}}=${d}\\) 公尺。`
        );
      } else {
        // 投影問題：書本長L、寬W，離光源H，距桌面D，求投影長
        const L = randInt(2, 6) * 5;
        const W = randInt(2, 4) * 5;
        const H = randInt(1, 3) * 10;
        const D = randInt(2, 5) * H;
        const scale = (H + D) / H;
        const projL = L * scale;
        const projW = W * scale;
        questions.push(
          `一書本長 \\(${L}\\) 公分、寬 \\(${W}\\) 公分，距光源 \\(${H}\\) 公分，書本到桌面距離為 \\(${D}\\) 公分。求書本投影在桌面上的長與寬。`
        );
        answers.push(
          `簡答：長 \\(${projL}\\) 公分、寬 \\(${projW}\\) 公分。過程：放大倍率 \\(=\\frac{H+D}{H}=\\frac{${H + D}}{${H}}=${(H + D) / H}\\)，投影長 \\(=${L}\\times${(H + D) / H}=${projL}\\)，投影寬 \\(=${W}\\times${(H + D) / H}=${projW}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  // 弓形矢高求半徑（j5-2-1）
  function buildChordSagittaRadiusSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    // r = (c²/(8h) + h/2) where c = chord, h = sagitta
    // Use Pythagorean: r² = (c/2)² + (r-h)² → r = (c²/4 + h²) / (2h)
    const baseCases = [
      { c: 6, h: 1 },
      { c: 8, h: 2 },
      { c: 10, h: 5 },
      { c: 14, h: 7 },
      { c: 16, h: 4 },
      { c: 18, h: 3 },
    ];
    const cases = [];
    baseCases.forEach(({ c, h }) => {
      for (let scale = 1; scale <= 4; scale += 1) {
        cases.push({ c: c * scale, h: h * scale });
      }
    });
    for (let i = 0; i < count; i++) {
      const { c, h } = cases[randInt(0, cases.length - 1)];
      const r = ((c * c) / 4 + h * h) / (2 * h);
      const half = c / 2;
      questions.push(
        `一段圓弧（弓形）的弦長為 \\(${c}\\) 公分，弦中點到圓弧的距離（矢高）為 \\(${h}\\) 公分，則此圓的半徑是多少公分？`
      );
      summaryAnswers.push(`\\(${r}\\) 公分`);
      answers.push(
        `設半徑為 \\(r\\)，弦長 \\(${c}\\) 的一半是 \\(${half}\\)，矢高為 \\(${h}\\)。由勾股定理 \\(r^2=${half}^2+(r-${h})^2\\)，展開得 \\(r=\\frac{${half}^2+${h}^2}{2\\times${h}}=\\frac{${(half * half) + (h * h)}}{${2 * h}}=${r}\\) 公分。`
      );
    }
    return { questions, summaryAnswers, answers };
  }

  // 圓形容器水面寬度（j5-2-1）
  function buildSemicircleChordWidthSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    const waterCases = [
      { r: 5, h: 1, halfWidth: 3 }, { r: 5, h: 2, halfWidth: 4 },
      { r: 10, h: 2, halfWidth: 6 }, { r: 10, h: 4, halfWidth: 8 },
      { r: 13, h: 1, halfWidth: 5 }, { r: 13, h: 8, halfWidth: 12 },
      { r: 15, h: 3, halfWidth: 9 }, { r: 15, h: 6, halfWidth: 12 },
      { r: 17, h: 2, halfWidth: 8 }, { r: 17, h: 9, halfWidth: 15 },
      { r: 20, h: 4, halfWidth: 12 }, { r: 20, h: 8, halfWidth: 16 },
      { r: 25, h: 1, halfWidth: 7 }, { r: 25, h: 18, halfWidth: 24 },
      { r: 26, h: 2, halfWidth: 10 }, { r: 26, h: 16, halfWidth: 24 },
    ];
    for (let i = 0; i < count; i++) {
      const mode = i % 2;
      // Half-circle container radius r, water depth h → chord width = 2√(r²-(r-h)²) = 2√(2rh-h²)
      if (mode === 0) {
        // Given r and h, find width
        const { r, h, halfWidth } = waterCases[randInt(0, waterCases.length - 1)];
        const w2 = halfWidth * halfWidth;
        const w = 2 * halfWidth;
        questions.push(
          `半圓形容器的半徑為 \\(${r}\\) 公分，現裝有飲料，由容器底部量起的水深為 \\(${h}\\) 公分，則水面的寬度是多少公分？`
        );
        summaryAnswers.push(`\\(${w}\\) 公分`);
        answers.push(
          `設水面寬為 \\(2t\\)，由弦長公式 \\(t^2=r^2-(r-h)^2=2rh-h^2=${2 * r * h}-${h * h}=${w2}\\)，所以 \\(t=${halfWidth}\\)，水面寬 \\(=2\\times${halfWidth}=${w}\\) 公分。`
        );
      } else {
        // Given r and chord width, find depth h (solve quadratic h²-2rh+w²/4=0 → h = r - √(r²-w²/4))
        const { r, h, halfWidth } = waterCases[randInt(0, waterCases.length - 1)];
        const w = 2 * halfWidth;
        questions.push(
          `半圓形容器的半徑為 \\(${r}\\) 公分，若水面寬度為 \\(${w}\\) 公分，則由容器底部量起的水深為多少公分？`
        );
        summaryAnswers.push(`\\(${h}\\) 公分`);
        answers.push(
          `設水深為 \\(h\\)，水面半寬為 \\(${halfWidth}\\)。由圓弧關係 \\(${halfWidth}^2=r^2-(r-h)^2=2rh-h^2\\)，整理解得 \\(h=${h}\\) 公分。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  // 切線弦角綜合計算（j5-2-2）
  function buildTangentCombinedAngleSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = [];
    for (let i = 0; i < count; i++) {
      const mode = i % 3;
      if (mode === 0) {
        // PA,PB切圓O於A,B；∠P=p°，C在圓弧AB上，求∠ACB
        const p = randInt(20, 70);
        const arcAB = 180 - p;         // minor arc AB
        const majorAB = 180 + p;       // major arc AB
        // ∠P = (major arc - minor arc)/2 = (360-arcAB-arcAB)/2 ... let me redo:
        // Two tangents from P: ∠P = |arc_major - arc_minor| / 2
        // arc_major + arc_minor = 360, so arc_minor = 180 - p, arc_major = 180 + p
        // ∠ACB (C on minor arc) = arc_major / 2 = (180+p)/2 = 90+p/2
        // ∠ACB (C on major arc) = arc_minor / 2 = (180-p)/2 = 90-p/2
        const angMajor = 90 + p / 2;
        const angMinor = 90 - p / 2;
        if (!Number.isInteger(angMajor) || !Number.isInteger(angMinor)) { i--; continue; }
        questions.push(
          `直線 \\(PA\\)、\\(PB\\) 分別切圓 \\(O\\) 於 \\(A\\)、\\(B\\)，若 \\(\\angle P=${p}°\\)，則圓弧 \\(AB\\)（優弧側）上一點 \\(C\\) 所張的圓周角 \\(\\angle ACB=\\)?`
        );
        summaryAnswers.push(`\\(\\angle ACB=${angMinor}°\\)`);
        answers.push(
          `兩切線夾角 \\(\\angle P=\\frac{\\text{優弧}-\\text{劣弧}}{2}\\)，劣弧 \\(\\widehat{AB}=180°-${p}°=${180 - p}°\\)，優弧 \\(=180°+${p}°=${180 + p}°\\)。\\(C\\) 在優弧上時，\\(\\angle ACB\\) 所對的是劣弧 \\(AB\\)，所以 \\(\\angle ACB=\\frac{\\text{劣弧}}{2}=\\frac{${180 - p}}{2}=${angMinor}°\\)；若 \\(C\\) 在劣弧上，才會得到 \\(\\frac{\\text{優弧}}{2}=${angMajor}°\\)。`
        );
      } else if (mode === 1) {
        // 切線弦角：PA切圓於A，∠PAB=α°，求對應弦切角∠ACD
        const alpha = randInt(25, 75);
        const arcAB = 2 * alpha;  // tangent-chord angle = half arc AB → arc AB = 2α
        const inscribed = alpha;   // inscribed angle on same arc = arc/2 = α
        questions.push(
          `直線 \\(PA\\) 切圓 \\(O\\) 於 \\(A\\)，\\(B\\) 為圓上另一點。若弦切角 \\(\\angle PAB=${alpha}°\\)，且 \\(C\\) 位於 \\(AB\\) 的優弧上，求圓周角 \\(\\angle ACB\\)。`
        );
        summaryAnswers.push(`\\(\\angle ACB=${inscribed}°\\)`);
        answers.push(
          `弦切角 \\(\\angle PAB=${alpha}°=\\frac{1}{2}\\widehat{AB}\\)，所以劣弧 \\(\\widehat{AB}=${arcAB}°\\)。\\(C\\) 位於優弧時，\\(\\angle ACB\\) 截得劣弧 \\(AB\\)，故 \\(\\angle ACB=\\frac{1}{2}\\widehat{AB}=${alpha}°\\)，與弦切角相等。`
        );
      } else {
        // ∠ABD弦切角 + ∠BCD圓周角 組合
        const chord1 = randInt(30, 70);
        const chord2 = randInt(20, chord1 - 10);
        const arcAB = chord1, arcBC = chord2;
        const remainArc = 360 - arcAB - arcBC;
        if (remainArc < 60) { i--; continue; }
        if (!Number.isInteger(chord2 / 2)) { i--; continue; }
        const tanAng = chord2 / 2;
        questions.push(
          `圓上四點 \\(A\\)、\\(B\\)、\\(C\\)、\\(D\\)，\\(\\widehat{AB}=${arcAB}°\\)，\\(\\widehat{BC}=${arcBC}°\\)，其餘弧 \\(\\widehat{CDA}=${remainArc}°\\)。若直線在 \\(B\\) 點切圓，求切線與弦 \\(BC\\) 所成的較小角。`
        );
        summaryAnswers.push(`\\(${tanAng}°\\)`);
        answers.push(
          `弦切角等於所對劣弧的一半，所以所成的較小角為 \\(\\frac{1}{2}\\widehat{BC}=\\frac{${arcBC}}{2}=${tanAng}°\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  // 中垂線性質求周長（j5-3-2）
  function buildPerpBisectorPerimeterSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    const rightTriples = [
      [3, 4, 5],
      [5, 12, 13],
      [6, 8, 10],
      [8, 15, 17],
      [9, 12, 15],
      [7, 24, 25],
      [10, 24, 26],
      [12, 16, 20],
      [15, 20, 25],
      [20, 21, 29],
    ];
    for (let i = 0; i < count; i++) {
      const mode = i % 3;
      if (mode === 0) {
        // 中垂線過頂點時，△ABC 為等腰三角形；用半底、頂高、腰長三元組保證可作圖。
        const [halfBase, , side] = rightTriples[randInt(0, rightTriples.length - 1)];
        const ab = 2 * halfBase;
        const perim = 2 * side + ab;
        questions.push(
          `在 \\(\\triangle ABC\\) 中，已知 \\(AB\\) 的垂直平分線恰好通過頂點 \\(C\\)，\\(AB=${ab}\\)，\\(BC=${side}\\)，則 \\(\\triangle ABC\\) 的周長是多少？`
        );
        answers.push(
          `簡答：\\(${perim}\\)。過程：\\(C\\) 在 \\(AB\\) 的中垂線上，所以 \\(CA=CB=${side}\\)。周長 \\(=CA+CB+AB=${side}+${side}+${ab}=${perim}\\)。`
        );
      } else if (mode === 1) {
        // D 在 AB 中垂線上，所以 DA=DB；先選合法的 △BDC，再令 AC=AD+DC。
        const [dc, da, bc] = rightTriples[randInt(0, rightTriples.length - 1)];
        const ac = da + dc;
        const perim = bc + dc + da;
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(AB\\) 的垂直平分線交 \\(AC\\) 於 \\(D\\) 點，已知 \\(BC=${bc}\\)，\\(AC=${ac}\\)，\\(DC=${dc}\\)，則 \\(\\triangle BDC\\) 的周長是多少？`
        );
        answers.push(
          `簡答：\\(${perim}\\)。過程：\\(D\\) 在 \\(AB\\) 中垂線上，所以 \\(DA=DB=AC-DC=${ac}-${dc}=${da}\\)。\\(\\triangle BDC\\) 周長 \\(=BC+DC+DB=${bc}+${dc}+${da}=${perim}\\)。`
        );
      } else {
        // 等腰三角形中，頂點到底邊中點的連線也是高；用畢氏三元組避免題目數據彼此矛盾。
        const [half, dc2, bc] = rightTriples[randInt(0, rightTriples.length - 1)];
        const ab = 2 * half;
        const perimBDC = bc + dc2 + half;
        questions.push(
          `\\(\\triangle ABC\\) 為等腰三角形，\\(CA=CB\\)，\\(D\\) 為 \\(AB\\) 中點，連結 \\(CD\\)，已知 \\(AB=${ab}\\)，\\(BC=${bc}\\)，\\(DC=${dc2}\\)，則 \\(\\triangle BDC\\) 的周長為多少？`
        );
        answers.push(
          `簡答：\\(${perimBDC}\\)。過程：\\(D\\) 為 \\(AB\\) 中點，\\(BD=\\frac{AB}{2}=${half}\\)，\\(\\triangle BDC\\) 周長 \\(=BC+DC+BD=${bc}+${dc2}+${half}=${perimBDC}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  // 內切圓切線段計算（j5-3-3）
  function buildIncircleTangentLengthSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // Tangent lengths: s = (a+b+c)/2; from A: s-a, from B: s-b, from C: s-c
    // where a=BC, b=CA, c=AB
    const sideTriples = [
      [5,6,7],[6,8,10],[7,15,20],[5,12,13],[8,15,17],[9,12,15],
      [10,12,14],[7,8,9],[6,7,9],[8,10,12],[5,7,8],[10,14,18],
    ].filter(([a,b,c]) => a+b>c && b+c>a && a+c>b); // valid triangles
    for (let i = 0; i < count; i++) {
      const [a, b, c] = sideTriples[randInt(0, sideTriples.length - 1)];
      const sDouble = a + b + c; // 2s
      const s = sDouble / 2;
      const fromA = s - a;  // tangent length from A
      const fromB = s - b;  // from B
      const fromC = s - c;  // from C
      const mode = i % 3;
      if (mode === 0) {
        questions.push(
          `\\(\\triangle ABC\\) 中，\\(BC=${a}\\)，\\(CA=${b}\\)，\\(AB=${c}\\)。設內切圓分別切 \\(BC\\)、\\(CA\\)、\\(AB\\) 於 \\(D\\)、\\(E\\)、\\(F\\)，則 \\(AF=\\)?`
        );
        answers.push(
          `簡答：\\(AF=${fromA}\\)。過程：周長 \\(=${sDouble}\\)，半周長 \\(s=${s}\\)。從頂點 \\(A\\) 的切線段長 \\(=s-a=${s}-${a}=${fromA}\\)（\\(a=BC\\)）。`
        );
      } else if (mode === 1) {
        questions.push(
          `\\(\\triangle ABC\\) 中，\\(BC=${a}\\)，\\(CA=${b}\\)，\\(AB=${c}\\)。內切圓切三邊，則從頂點 \\(B\\) 到切點的線段長為多少？`
        );
        answers.push(
          `簡答：\\(${fromB}\\)。過程：半周長 \\(s=\\frac{${a}+${b}+${c}}{2}=${s}\\)，從 \\(B\\) 的切線段 \\(=s-b=${s}-${b}=${fromB}\\)（\\(b=CA\\)）。`
        );
      } else {
        questions.push(
          `\\(\\triangle ABC\\) 中，\\(BC=${a}\\)，\\(CA=${b}\\)，\\(AB=${c}\\)。內切圓切 \\(CA\\) 於 \\(E\\)，切 \\(CB\\) 於 \\(D\\)，則 \\(CE=CD=\\)?`
        );
        answers.push(
          `簡答：\\(${fromC}\\)。過程：半周長 \\(s=${s}\\)，從頂點 \\(C\\) 的切線段 \\(=s-c=${s}-${c}=${fromC}\\)（\\(c=AB\\)）。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  // 中線長公式計算（j5-3-3）
  function buildMedianLengthFormulaSet(count) {
    const questions = [];
    const summaryAnswers = [];
    const answers = createAnswerList(summaryAnswers);
    // Median from A to BC: m_a² = (2b²+2c²-a²)/4
    // where a=BC, b=CA, c=AB
    const baseTriples = [
      [3, 4, 5],
      [5, 12, 13],
      [8, 15, 17],
      [7, 24, 25],
      [20, 21, 29],
      [12, 35, 37],
    ];
    const cases = [];
    baseTriples.forEach(([halfBase, median, equalSide]) => {
      for (let scale = 1; scale <= 4; scale += 1) {
        cases.push({
          a: 2 * halfBase * scale,
          b: equalSide * scale,
          c: equalSide * scale,
        });
      }
    });

    for (let i = 0; i < count; i++) {
      const c = cases[randInt(0, cases.length - 1)];
      const { a, b } = c;
      const cv = c.c;  // renamed to avoid conflict
      const ma2 = (2 * b * b + 2 * cv * cv - a * a) / 4;
      const ma = Math.sqrt(ma2);
      const mode = i % 2;
      if (mode === 0) {
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(BC=${a}\\)，\\(CA=${b}\\)，\\(AB=${cv}\\)，\\(D\\) 為 \\(BC\\) 中點，則中線 \\(AD=\\)?`
        );
        answers.push(
          `簡答：\\(AD=${ma}\\)。過程：中線長公式 \\(AD^2=\\frac{2CA^2+2AB^2-BC^2}{4}=\\frac{2\\times${b}^2+2\\times${cv}^2-${a}^2}{4}=\\frac{${ma2 * 4}}{4}=${ma2}\\)，所以 \\(AD=${ma}\\)。`
        );
      } else {
        // Give median length, ask for one missing side
        // m_a = ma, a = ?, b and c known: a² = 2b² + 2c² - 4ma²
        const a2 = 2 * b * b + 2 * cv * cv - 4 * ma2;
        if (!Number.isInteger(Math.sqrt(a2)) || a2 <= 0) { i--; continue; }
        const aCalc = Math.sqrt(a2);
        questions.push(
          `在 \\(\\triangle ABC\\) 中，\\(CA=${b}\\)，\\(AB=${cv}\\)，\\(D\\) 為 \\(BC\\) 中點，中線 \\(AD=${ma}\\)，則 \\(BC=\\)?`
        );
        answers.push(
          `簡答：\\(BC=${aCalc}\\)。過程：由中線長公式 \\(AD^2=\\frac{2CA^2+2AB^2-BC^2}{4}\\)，代入得 \\(${ma2}=\\frac{2\\times${b*b}+2\\times${cv*cv}-BC^2}{4}\\)，解得 \\(BC^2=${a2}\\)，\\(BC=${aCalc}\\)。`
        );
      }
    }
    return { questions, summaryAnswers, answers };
  }

  // ─── 文件補充 generators 結束 ─────────────────────────────────────────────

  const nextConfigs = {
      'j5-1-1-ratio-conversion-five-subtypes': {
        type: 'drill',
        title: '連比合併與格式轉換綜合',
        difficulty: 'easy',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511RatioConversionMixedSet(practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-1-1-merge-shared-term': {
        type: 'drill',
        title: '共同項合併成三項連比',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511MergeSharedTermSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-equation-to-ratio': {
        type: 'drill',
        title: '乘積等式轉連比',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511EquationToRatioSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-fraction-form-ratio': {
        type: 'drill',
        title: '分式等式轉連比',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511FractionFormRatioSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-reciprocal-ratio': {
        type: 'drill',
        title: '倒數連比與最簡整數比',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511ReciprocalRatioSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-fraction-statement-ratio': {
        type: 'drill',
        title: '文字分數條件轉連比',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511FractionStatementRatioSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-ratio-algebra-three-subtypes': {
        type: 'drill',
        title: '參數法、式子變換與平移比例綜合',
        difficulty: 'medium',
        questionCount: 8,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511RatioAlgebraMixedSet(practiceCount), resolvePracticeCount(count, 8));

        },
      },
      'j5-1-1-parametric-linear-equation': {
        type: 'drill',
        title: '連比參數法解一次式',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511ParametricLinearEquationSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-ratio-expression-transform': {
        type: 'drill',
        title: '連比代數式比例化簡',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511RatioExpressionTransformSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-reverse-value-from-ratio': {
        type: 'drill',
        title: '已知總量反求各部分',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511ReverseValueFromRatioSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-shifted-variable-ratio': {
        type: 'drill',
        title: '變數平移與比例式求值',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511ShiftedVariableRatioSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-triangle-angle-algebra-ratio': {
        type: 'drill',
        title: '代數係數型三角角度比例',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511TriangleAngleAlgebraRatioSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-linked-ratio-advanced': {
        type: 'drill',
        title: '連續比例鏈接與跨項轉換',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511LinkedRatioAdvancedSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-geometry-ratio-property-advanced': {
        type: 'drill',
        title: '幾何性質結合型比例',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511GeometryRatioPropertyAdvancedSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-geometry-ratio-three-subtypes': {
        type: 'drill',
        title: '三角形與幾何量的連比應用',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511GeometryRatioMixedSet(practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-1-1-triangle-angle-ratio': {
        type: 'drill',
        title: '三角形內角連比',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511TriangleAngleRatioSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-triangle-side-height-ratio': {
        type: 'drill',
        title: '三角形邊長與高的反比',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511TriangleSideHeightRatioSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-geometry-perimeter-area': {
        type: 'drill',
        title: '幾何周長面積體積連比',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511GeometryPerimeterAreaSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-life-ratio-five-subtypes': {
        type: 'drill',
        title: '生活情境中的連比分配、反比與混合',
        difficulty: 'medium',
        questionCount: 8,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511LifeRatioMixedSet(practiceCount), resolvePracticeCount(count, 8));

        },
      },
      'j5-1-1-money-profit-sharing': {
        type: 'drill',
        title: '金錢與利潤分配',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511MoneyProfitSharingSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-mixture-ratio': {
        type: 'drill',
        title: '混合物與濃度配比',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511MixtureRatioSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-population-ratio-change': {
        type: 'drill',
        title: '人數比例變動',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511PopulationRatioChangeSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-work-rate-speed': {
        type: 'drill',
        title: '工作效率與速率反比',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511WorkRateSpeedSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-work-efficiency-applied': {
        type: 'drill',
        title: '工程效率問題',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511WorkEfficiencyAppliedSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-coin-denomination-ratio': {
        type: 'drill',
        title: '錢幣枚數與總金額',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511CoinDenominationRatioSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-mixture-shared-term': {
        type: 'drill',
        title: '混合物成分比例連鎖推導',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511MixtureSharedTermSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-ratio-change-dynamic': {
        type: 'drill',
        title: '百分率與分數變動的動態比例',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511RatioChangeDynamicSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-1-ratio-logic-trap': {
        type: 'drill',
        title: '異常邏輯判斷與比例陷阱',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ511RatioLogicTrapSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-2-triangle-parallel-five-subtypes': {
        type: 'drill',
        title: '三角形平行截線與中點連線綜合',
        difficulty: 'medium',
        questionCount: 8,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ512Set('triangleMixed', practiceCount), resolvePracticeCount(count, 8));

        },
      },
      'j5-1-2-parallel-core-five-subtypes': {
        type: 'drill',
        title: '平行線截比例線段五小類綜合',
        difficulty: 'medium',
        questionCount: 10,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ512Set('parallelMixed', practiceCount), resolvePracticeCount(count, 10));

        },
      },
      'j5-1-2-triangle-parallel-proportional-segments': {
        type: 'drill',
        title: '三角形平行截線比例運算',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ512Set('triangleFullProportion', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-2-triangle-parallel-side-ratio': {
        type: 'drill',
        title: '三角形截線邊段比',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ512Set('triangleSide', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-2-triangle-parallel-segment-length': {
        type: 'drill',
        title: '三角形截線求線段長',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ512Set('triangleSegment', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-2-triangle-parallel-algebra': {
        type: 'drill',
        title: '三角形截線代數求值',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ512Set('triangleAlgebra', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-2-triangle-parallel-converse': {
        type: 'drill',
        title: '平行截線逆定理判斷',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ512Set('triangleConverse', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-2-midpoint-segment': {
        type: 'drill',
        title: '三角形中點連線',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ512Set('midpoint', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-2-trapezoid-parallel-three-subtypes': {
        type: 'drill',
        title: '梯形與多平行線三小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ512Set('trapezoidMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-1-2-trapezoid-parallel-segment': {
        type: 'drill',
        title: '梯形側邊分點截線',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ512Set('trapezoidWeighted', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-2-trapezoid-midline': {
        type: 'drill',
        title: '梯形中線長度',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ512Set('trapezoidMidline', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-2-multi-parallel-intercepts': {
        type: 'drill',
        title: '多條平行線截比例',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ512Set('multiParallel', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-similarity-criteria-five-subtypes': {
        type: 'drill',
        title: '相似判別與基本比例五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('criteriaMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-1-3-aa-criterion': {
        type: 'drill',
        title: 'AA 相似判別',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('aaCriterion', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-sss-criterion': {
        type: 'drill',
        title: 'SSS 相似判別',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('sssCriterion', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-sas-criterion': {
        type: 'drill',
        title: 'SAS 相似判別',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('sasCriterion', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-parallel-basic-length': {
        type: 'drill',
        title: '平行線小大三角形求長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('parallelBasic', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-butterfly-parallel-length': {
        type: 'drill',
        title: '蝴蝶形平行線比例',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('butterflyBasic', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-ratio-area-four-subtypes': {
        type: 'drill',
        title: '相似三角形線段、周長與面積比綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('ratioMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-1-3-corresponding-elements': {
        type: 'drill',
        title: '對應高、中線、角平分線長度比',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('correspondingElement', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-area-to-side-perimeter': {
        type: 'drill',
        title: '由面積比反推邊長與周長比',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('areaToSide', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-area-from-side-ratio': {
        type: 'drill',
        title: '由邊長比求面積比與面積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('areaFromSide', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-scale-area-change': {
        type: 'drill',
        title: '縮放後面積倍率',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('scaleArea', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-scaling-five-subtypes': {
        type: 'drill',
        title: '圖形縮放與等率運算綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('scalingMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-1-3-figure-scale-length': {
        type: 'drill',
        title: '等比例縮放求邊長',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('figureScaleLength', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-scale-back-length': {
        type: 'drill',
        title: '縮放後反求原邊長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('scaleBackLength', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-area-scale-factor': {
        type: 'drill',
        title: '縮放倍率與面積倍率',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('areaScaleFactor', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-angle-invariant-scale': {
        type: 'drill',
        title: '相似縮放角度不變',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('angleInvariant', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-butterfly-three-subtypes': {
        type: 'drill',
        title: '蝴蝶形與平行線相似比例綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('butterflyMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-1-3-butterfly-area-ratio': {
        type: 'drill',
        title: '蝴蝶形相似面積比',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('butterflyAreaRatio', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-butterfly-segment-ratio': {
        type: 'drill',
        title: '蝴蝶形交點線段比',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('butterflySegmentRatio', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-right-altitude-three-subtypes': {
        type: 'drill',
        title: '直角三角形母子相似三小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('rightMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-1-3-right-altitude': {
        type: 'drill',
        title: '斜邊高平方公式',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('rightAltitude', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-right-legs-from-projections': {
        type: 'drill',
        title: '由斜邊投影求兩股',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('rightLegs', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-right-projection-unknown': {
        type: 'drill',
        title: '斜邊高與投影段求未知數',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('rightProjection', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-measurement-four-subtypes': {
        type: 'drill',
        title: '相似測量與投影四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('measurementMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-1-3-shadow-measurement': {
        type: 'drill',
        title: '影子法測高',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('shadowMeasure', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-mirror-measurement': {
        type: 'drill',
        title: '鏡面反射測高',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('mirrorMeasure', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-pinhole-projection': {
        type: 'drill',
        title: '針孔成像比例',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('pinholeMeasure', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-river-width-measurement': {
        type: 'drill',
        title: '河寬測量相似三角形',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ513Set('riverMeasure', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-measurement-five-subtypes': {
        type: 'drill',
        title: '簡易測量與投影五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('measurementMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-1-4-shadow-height': {
        type: 'drill',
        title: '影子法測高',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('shadowHeight', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-standard-pole-height': {
        type: 'drill',
        title: '標竿視線法測高',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('standardPole', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-mirror-height': {
        type: 'drill',
        title: '鏡面反射測高',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('mirrorHeight', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-pinhole-image': {
        type: 'drill',
        title: '針孔成像像高',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('pinholeImage', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-river-width': {
        type: 'drill',
        title: '視線對齊測河寬',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('riverWidth', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-ratio-area-four-subtypes': {
        type: 'drill',
        title: '相似圖形周長與面積比例四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('ratioMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-1-4-perimeter-side': {
        type: 'drill',
        title: '由周長比求對應邊',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('perimeterSide', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-area-to-length': {
        type: 'drill',
        title: '由面積比反推線段長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('areaToLength', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-parallel-area-split': {
        type: 'drill',
        title: '平行線分割面積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('parallelAreaSplit', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-scale-area': {
        type: 'drill',
        title: '相似放大面積比',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('scaleArea', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-right-midpoint-four-subtypes': {
        type: 'drill',
        title: '直角母子相似與中點分割四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('rightMidMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-1-4-right-altitude': {
        type: 'drill',
        title: '斜邊高平方公式',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('rightAltitude', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-right-legs': {
        type: 'drill',
        title: '由斜邊投影求兩股',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('rightLegs', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-midpoint-triangle-area': {
        type: 'drill',
        title: '中點三角形面積',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('midpointTriangleArea', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-midpoint-quadrilateral': {
        type: 'drill',
        title: '四邊形中點平行四邊形面積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('midpointQuadrilateral', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-trig-basic-four-subtypes': {
        type: 'drill',
        title: '基本三角比四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('trigBasicMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-1-4-trig-from-sides': {
        type: 'drill',
        title: '由三邊求 sin、cos、tan',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('trigFromSides', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-side-from-trig': {
        type: 'drill',
        title: '由三角比求邊長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('sideFromTrig', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-special-angle': {
        type: 'drill',
        title: '特殊角邊長比例',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('specialAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-min-angle-cos': {
        type: 'drill',
        title: '最小銳角 cos 值',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('minAngleCos', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-trig-application-four-subtypes': {
        type: 'drill',
        title: '坡度與三角比應用四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('trigAppMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-1-4-slope-percent': {
        type: 'drill',
        title: '坡度百分比換算',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('slopePercent', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-ladder-angle': {
        type: 'drill',
        title: '梯子仰角求高度',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('ladderAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-trig-area': {
        type: 'drill',
        title: 'tan 與直角三角形面積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('trigArea', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-4-similar-trig-transfer': {
        type: 'drill',
        title: '相似三角形三角比轉移',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ514Set('similarTrigTransfer', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-point-line-circle-three-subtypes': {
        type: 'drill',
        title: '點、直線與圓位置三小類綜合',
        difficulty: 'easy',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('positionMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-2-1-point-circle-position': {
        type: 'drill',
        title: '點與圓的位置判斷',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('pointCirclePosition', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-line-circle-position': {
        type: 'drill',
        title: '直線與圓的位置判斷',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('lineCirclePosition', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-tangent-length-from-point': {
        type: 'drill',
        title: '圓外一點切線長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('tangentLength', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-chord-distance-four-subtypes': {
        type: 'drill',
        title: '弦、弦心距與半徑四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('chordMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-2-1-chord-center-distance': {
        type: 'drill',
        title: '已知半徑與弦求弦心距',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('chordDistance', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-chord-length': {
        type: 'drill',
        title: '已知半徑與弦心距求弦長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('chordLength', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-radius-from-chord': {
        type: 'drill',
        title: '已知弦與弦心距求半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('radiusFromChord', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-concentric-annulus': {
        type: 'drill',
        title: '同心圓弦切小圓面積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('concentricAnnulus', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-two-circle-tangent-four-subtypes': {
        type: 'drill',
        title: '兩圓位置與公切線四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('twoCircleMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-2-1-two-circle-position': {
        type: 'drill',
        title: '兩圓位置關係判斷',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('twoCirclePosition', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-radii-from-tangencies': {
        type: 'drill',
        title: '由外切內切連心線求半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('radiiFromTangencies', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-external-common-tangent': {
        type: 'drill',
        title: '外公切線長度',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('externalCommonTangent', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-internal-common-tangent': {
        type: 'drill',
        title: '內公切線長度',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('internalCommonTangent', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-tangent-polygon-three-subtypes': {
        type: 'drill',
        title: '切線段與圓外切四邊形三小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('tangentPolygonMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-2-1-tangent-segments': {
        type: 'drill',
        title: '同一外點兩切線段相等',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('tangentSegments', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-circumscribed-quadrilateral': {
        type: 'drill',
        title: '圓外切四邊形求邊長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('circumscribedQuadrilateral', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-tangent-quad-perimeter': {
        type: 'drill',
        title: '圓外切四邊形求周長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('tangentQuadPerimeter', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-coordinate-circle-five-subtypes': {
        type: 'drill',
        title: '坐標平面上的圓五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('coordinateMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-2-1-diameter-endpoint-circle': {
        type: 'drill',
        title: '直徑端點求圓心半徑',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('diameterEndpointCircle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-axis-line-circle-relation': {
        type: 'drill',
        title: '坐標軸平行線與圓位置',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('axisLineCircleRelation', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-coordinate-point-position': {
        type: 'drill',
        title: '坐標點與圓位置判斷',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('coordinatePointPosition', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-coordinate-tangent-radius': {
        type: 'drill',
        title: '坐標點到圓切線長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('coordinateTangentRadius', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-point-distance-to-circle': {
        type: 'drill',
        title: '點到圓周最短最長距離',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521Set('pointDistanceToCircle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-coordinate-tangent-integration-advanced': {
        type: 'drill',
        title: '座標幾何與切線長整合',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521CoordinateTangentIntegrationAdvancedSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-two-circle-position-parameter': {
        type: 'drill',
        title: '兩圓位置關係的參數逆推',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521TwoCirclePositionParameterSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-tangent-pythagorean-integration': {
        type: 'drill',
        title: '切線長與勾股定理的複合應用',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ521TangentPythagoreanIntegrationSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-central-arc-sector-four-subtypes': {
        type: 'drill',
        title: '圓心角、弧長與扇形四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('centralMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-2-2-central-arc-degree': {
        type: 'drill',
        title: '圓心角與弧度數換算',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('centralArcDegree', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-arc-length-from-angle': {
        type: 'drill',
        title: '由半徑與圓心角求弧長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('arcLengthFromAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-angle-from-arc-length': {
        type: 'drill',
        title: '由弧長與半徑求圓心角',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('angleFromArcLength', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-sector-area': {
        type: 'drill',
        title: '扇形面積計算',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('sectorArea', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-inscribed-angle-five-subtypes': {
        type: 'drill',
        title: '圓周角與弦切角五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('inscribedMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-2-2-inscribed-angle-from-arc': {
        type: 'drill',
        title: '由弧度數求圓周角',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('inscribedAngleFromArc', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-arc-from-inscribed-angle': {
        type: 'drill',
        title: '由圓周角求所對弧',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('arcFromInscribedAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-diameter-inscribed-angle': {
        type: 'drill',
        title: '直徑所對圓周角',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('diameterInscribedAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-tangent-chord-angle': {
        type: 'drill',
        title: '弦切角與同弧圓周角',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('tangentChordAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-parallel-chord-angle': {
        type: 'drill',
        title: '平行弦夾弧求角',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('parallelChordAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-cyclic-quadrilateral-four-subtypes': {
        type: 'drill',
        title: '圓內接四邊形四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('cyclicMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-2-2-cyclic-opposite-angle': {
        type: 'drill',
        title: '圓內接四邊形對角互補',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('cyclicOppositeAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-cyclic-ratio-angles': {
        type: 'drill',
        title: '圓內接四邊形角度比',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('cyclicRatioAngles', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-cyclic-exterior-angle': {
        type: 'drill',
        title: '圓內接四邊形外角',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('cyclicExteriorAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-cyclic-linear-equation': {
        type: 'drill',
        title: '圓內接四邊形一次式求角',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('cyclicLinearEquation', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-interior-exterior-angle-five-subtypes': {
        type: 'drill',
        title: '圓內角與圓外角五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('interiorExteriorMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-2-2-interior-angle-two-chords': {
        type: 'drill',
        title: '兩弦圓內角計算',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('interiorAngleTwoChords', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-arc-from-interior-angle': {
        type: 'drill',
        title: '由圓內角反推弧度數',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('arcFromInteriorAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-exterior-angle-two-secants': {
        type: 'drill',
        title: '兩割線圓外角計算',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('exteriorAngleTwoSecants', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-two-tangents-angle': {
        type: 'drill',
        title: '兩切線夾角計算',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('twoTangentsAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-parameter-exterior-angle': {
        type: 'drill',
        title: '圓外角一次式求值',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('parameterExteriorAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-arc-distribution-five-subtypes': {
        type: 'drill',
        title: '弧度比例與多邊形角度五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('arcDistributionMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-2-2-arc-ratio-angle': {
        type: 'drill',
        title: '弧長比例分配求圓周角',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('arcRatioAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-equal-division-angle': {
        type: 'drill',
        title: '等分圓周求圓周角',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('equalDivisionAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-regular-polygon-tangent-angle': {
        type: 'drill',
        title: '正多邊形弦切角',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('regularPolygonTangentAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-major-minor-inscribed-angle': {
        type: 'drill',
        title: '優弧劣弧與圓周角',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('majorMinorInscribedAngle', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-central-arc-equation': {
        type: 'drill',
        title: '同弧圓心角圓周角一次式',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ522Set('centralArcEquation', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-power-basic-four-subtypes': {
        type: 'drill',
        title: '圓內外乘冪基本四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('powerBasicMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-2-3-intersecting-chords-segment': {
        type: 'drill',
        title: '圓內兩弦相交求線段',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('intersectingChordsSegment', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-external-secants-segment': {
        type: 'drill',
        title: '圓外兩割線求線段',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('externalSecantsSegment', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-tangent-secant-tangent': {
        type: 'drill',
        title: '切割線定理求切線長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('tangentSecantTangent', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-tangent-secant-segment': {
        type: 'drill',
        title: '切割線定理求割線段',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('tangentSecantSecantSegment', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-algebra-five-subtypes': {
        type: 'drill',
        title: '乘冪定理代數式五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('algebraMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-2-3-secant-tangent-quadratic-model': {
        type: 'drill',
        title: '比例與二次方程結合',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523SecantTangentQuadraticModelSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-algebra-intersecting-chords': {
        type: 'drill',
        title: '兩弦乘冪一次式求值',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('algebraIntersectingChords', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-algebra-tangent-secant': {
        type: 'drill',
        title: '切割線乘冪一次式求值',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('algebraTangentSecant', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-algebra-external-secants': {
        type: 'drill',
        title: '兩割線乘冪一次式求值',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('algebraExternalSecants', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-ratio-intersecting-chords': {
        type: 'drill',
        title: '兩弦比例分段求全長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('ratioIntersectingChords', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-ratio-tangent-secant': {
        type: 'drill',
        title: '切割線比例求乘冪值',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('ratioTangentSecant', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-radius-power-five-subtypes': {
        type: 'drill',
        title: '圓心距與圓冪值五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('radiusPowerMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-2-3-inside-power-product': {
        type: 'drill',
        title: '圓內點圓冪乘積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('insidePowerProduct', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-tangent-from-distance': {
        type: 'drill',
        title: '由圓心距與半徑求切線長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('tangentFromDistance', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-radius-from-tangent-distance': {
        type: 'drill',
        title: '由切線長與圓心距求半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('radiusFromTangentDistance', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-shortest-chord-through-point': {
        type: 'drill',
        title: '圓內點最短弦長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('shortestChordThroughPoint', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-diameter-secant-product': {
        type: 'drill',
        title: '通過圓心割線乘積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('diameterSecantProduct', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-chord-distance-four-subtypes': {
        type: 'drill',
        title: '弦心距與乘冪轉換四小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('chordDistanceMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-2-3-chord-distance-power-transfer': {
        type: 'drill',
        title: '弦心距轉乘冪求段長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('chordDistancePowerTransfer', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-midpoint-chord-product': {
        type: 'drill',
        title: '中點弦乘冪求弦長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('midpointChordProduct', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-parallel-chord-product': {
        type: 'drill',
        title: '平行弦延長兩割線',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('parallelChordProduct', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-perpendicular-chord-length': {
        type: 'drill',
        title: '垂徑定理求弦長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('perpendicularChordLength', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-ratio-composite-five-subtypes': {
        type: 'drill',
        title: '比例關係與乘冪綜合五小類',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('ratioCompositeMixed', practiceCount), resolvePracticeCount(count, 6));

        },
      },
      'j5-2-3-ratio-internal-chord-total': {
        type: 'drill',
        title: '圓內弦比例分段求全長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('ratioInternalChordTotal', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-ratio-external-secant-length': {
        type: 'drill',
        title: '圓外割線比例求全長',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('ratioExternalSecantLength', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-two-secants-same-point-ratio': {
        type: 'drill',
        title: '同外點兩割線乘積相等',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('twoSecantsSamePointRatio', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-two-tangent-equal-power': {
        type: 'drill',
        title: '同外點兩切線與乘冪',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('twoTangentEqualPower', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-common-tangent-power': {
        type: 'drill',
        title: '切線乘冪轉割線全長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523Set('commonTangentPower', practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-3-power-similarity-advanced': {
        type: 'drill',
        title: '冪性質與相似三角形',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildJ523PowerSimilarityAdvancedSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-3-1-parity-five-subtypes': {
        type: 'drill',
        title: '奇偶性質證明五小類綜合',
        difficulty: 'easy',
        questionCount: 6,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('parityMixed', practiceCount), resolvePracticeCount(count, 6));
        },
      },
      'j5-3-1-parity-sum': {
        type: 'drill',
        title: '偶數加奇數證明',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('paritySum', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-odd-product': {
        type: 'drill',
        title: '奇數乘奇數證明',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('oddProduct', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-square-parity': {
        type: 'drill',
        title: '平方保留奇偶性',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('squareParity', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-linear-parity': {
        type: 'drill',
        title: '偶數加常數奇偶判斷',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('linearParity', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-odd-squares-sum': {
        type: 'drill',
        title: '兩奇數平方和奇偶證明',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('oddSquaresSum', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-divisibility-five-subtypes': {
        type: 'drill',
        title: '整除與因式證明五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('divisibilityMixed', practiceCount), resolvePracticeCount(count, 6));
        },
      },
      'j5-3-1-consecutive-product-divisible': {
        type: 'drill',
        title: '連續整數乘積整除',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('consecutiveProductDivisible', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-difference-squares-divisible': {
        type: 'drill',
        title: '平方差因式整除',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('differenceSquaresDivisible', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-shifted-square-multiple': {
        type: 'drill',
        title: '平移平方差整除',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('shiftedSquareMultiple', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-quadratic-completion-multiple': {
        type: 'drill',
        title: '配方後判斷倍數',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('quadraticCompletionMultiple', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-factor-substitution-multiple': {
        type: 'drill',
        title: '代入倍數關係證明',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('factorSubstitutionMultiple', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-remainder-five-subtypes': {
        type: 'drill',
        title: '除法餘數推理五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('remainderMixed', practiceCount), resolvePracticeCount(count, 6));
        },
      },
      'j5-3-1-square-remainder': {
        type: 'drill',
        title: '平方的餘數推理',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('squareRemainder', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-remainder-parity': {
        type: 'drill',
        title: '由餘數判斷奇偶',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('remainderParity', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-expression-remainder': {
        type: 'drill',
        title: '代數式餘數運算',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('expressionRemainder', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-age-squares-remainder': {
        type: 'drill',
        title: '生活情境平方餘數',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('ageSquaresRemainder', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-not-divisible-claim': {
        type: 'drill',
        title: '反例型整除判斷',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('notDivisibleClaim', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-consecutive-five-subtypes': {
        type: 'drill',
        title: '連續整數性質證明五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('consecutiveMixed', practiceCount), resolvePracticeCount(count, 6));
        },
      },
      'j5-3-1-three-consecutive-product-six': {
        type: 'drill',
        title: '三連續整數乘積為六倍數',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('threeConsecutiveProductSix', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-consecutive-sum-multiple': {
        type: 'drill',
        title: '奇數個連續整數和',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('consecutiveSumMultiple', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-consecutive-odd-squares-eight': {
        type: 'drill',
        title: '連續奇數平方差',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('consecutiveOddSquaresEight', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-two-consecutive-even-product': {
        type: 'drill',
        title: '連續偶數乘積整除',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('twoConsecutiveEvenProduct', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-consecutive-weighted-sum-four': {
        type: 'drill',
        title: '三連續整數加權和',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('consecutiveWeightedSumFour', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-inequality-eight-subtypes': {
        type: 'drill',
        title: '代數不等式證明八小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('inequalityMixed', practiceCount), resolvePracticeCount(count, 6));
        },
      },
      'j5-3-1-positive-square-order': {
        type: 'drill',
        title: '正數平方保序',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('positiveSquareOrder', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-negative-square-reverse': {
        type: 'drill',
        title: '負數平方倒向比較',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('negativeSquareReverse', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-positive-reciprocal-reverse': {
        type: 'drill',
        title: '正數倒數倒向',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('positiveReciprocalReverse', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-negative-reciprocal-reverse': {
        type: 'drill',
        title: '負數倒數比較',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('negativeReciprocalReverse', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-multiply-by-negative': {
        type: 'drill',
        title: '乘負數不等號換向',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('multiplyByNegative', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-am-gm-two-numbers': {
        type: 'drill',
        title: '算術幾何平均不等式',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('amGmTwoNumbers', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-radical-order': {
        type: 'drill',
        title: '根號與原數大小',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('radicalOrder', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-same-sign-product-inequality': {
        type: 'drill',
        title: '符號連鎖與乘積正負',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531Set('sameSignProductInequality', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-advanced-consecutive-integers': {
        type: 'drill',
        title: '連續整數性質的擴展',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531AdvancedConsecutiveIntegersSet(practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-polynomial-divisibility': {
        type: 'drill',
        title: '代數式變形的整除判定',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531PolynomialDivisibilitySet(practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-multi-variable-sign-logic': {
        type: 'drill',
        title: '多變數符號邏輯推導',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531MultiVariableSignLogicSet(practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-inequality-proofs-composite': {
        type: 'drill',
        title: '倒數與不等式的複合變形',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531InequalityProofsCompositeSet(practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-algebra-geometry-proof-bridge': {
        type: 'drill',
        title: '配方法與幾何證明的銜接',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531AlgebraGeometryProofBridgeSet(practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-1-proof-reasoning-mixed': {
        type: 'drill',
        title: '證明推理綜合',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ531ProofReasoningMixedSet(practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-centers-five-subtypes': {
        type: 'drill',
        title: '三心基本性質證明五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('centersMixed', practiceCount), resolvePracticeCount(count, 6));
        },
      },
      'j5-3-2-circumcenter-equal-distance': {
        type: 'drill',
        title: '外心到三頂點等距',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('circumcenterEqualDistance', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-incenter-equal-distance': {
        type: 'drill',
        title: '內心到三邊等距',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('incenterEqualDistance', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-centroid-median-ratio': {
        type: 'drill',
        title: '重心分中線比例',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('centroidMedianRatio', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-right-triangle-circumcenter': {
        type: 'drill',
        title: '直角三角形外心',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('rightTriangleCircumcenter', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-isosceles-centers-line': {
        type: 'drill',
        title: '等腰三角形三心共線',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('isoscelesCentersLine', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-congruence-five-subtypes': {
        type: 'drill',
        title: '全等性質證明五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('congruenceMixed', practiceCount), resolvePracticeCount(count, 6));
        },
      },
      'j5-3-2-isosceles-altitude-bisects': {
        type: 'drill',
        title: '等腰三角形高平分頂角',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('isoscelesAltitudeBisects', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-perpendicular-bisector-point': {
        type: 'drill',
        title: '垂直平分線等距',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('perpendicularBisectorPoint', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-angle-bisector-symmetry': {
        type: 'drill',
        title: '角平分線到兩邊等距',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('angleBisectorSymmetry', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-square-shared-vertex': {
        type: 'drill',
        title: '共頂點正方形全等',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('squareSharedVertex', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-equilateral-shared-vertex': {
        type: 'drill',
        title: '共頂點正三角形全等',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('equilateralSharedVertex', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-similarity-five-subtypes': {
        type: 'drill',
        title: '相似與比例證明五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('similarityMixed', practiceCount), resolvePracticeCount(count, 6));
        },
      },
      'j5-3-2-parallel-line-similarity': {
        type: 'drill',
        title: '平行線截比例相似',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('parallelLineSimilarity', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-right-altitude-geometric-mean': {
        type: 'drill',
        title: '斜邊高平方公式證明',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('rightAltitudeGeometricMean', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-butterfly-similarity': {
        type: 'drill',
        title: '蝴蝶相似乘積關係',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('butterflySimilarity', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-angle-bisector-ratio': {
        type: 'drill',
        title: '內角平分線比例',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('angleBisectorRatio', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-altitude-circumcircle-product': {
        type: 'drill',
        title: '高與外接圓直徑乘積',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('altitudeCircumcircleProduct', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-circle-proof-five-subtypes': {
        type: 'drill',
        title: '圓與角度證明五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('circleProofMixed', practiceCount), resolvePracticeCount(count, 6));
        },
      },
      'j5-3-2-parallel-chords-equal-arcs': {
        type: 'drill',
        title: '平行弦夾等弧',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('parallelChordsEqualArcs', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-tangent-segments-equal': {
        type: 'drill',
        title: '同外點兩切線相等',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('tangentSegmentsEqual', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-cyclic-opposite-angles': {
        type: 'drill',
        title: '圓內接四邊形對角互補',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('cyclicOppositeAngles', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-tangent-chord-similarity': {
        type: 'drill',
        title: '切割線相似證明',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('tangentChordSimilarity', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-same-arc-angle-equal': {
        type: 'drill',
        title: '同弧圓周角與弦切角',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('sameArcAngleEqual', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-centroid-area-five-subtypes': {
        type: 'drill',
        title: '重心與面積比例五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('centroidAreaMixed', practiceCount), resolvePracticeCount(count, 6));
        },
      },
      'j5-3-2-centroid-three-triangles-area': {
        type: 'drill',
        title: '重心連三頂點面積相等',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('centroidThreeTrianglesArea', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-median-six-equal-areas': {
        type: 'drill',
        title: '三中線六等面積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('medianSixEqualAreas', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-centroid-midpoint-area-ratio': {
        type: 'drill',
        title: '重心小三角形面積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('centroidMidpointAreaRatio', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-parallelogram-centroid-point': {
        type: 'drill',
        title: '平行四邊形中的重心',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('parallelogramCentroidPoint', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-2-centroid-median-length': {
        type: 'drill',
        title: '重心中線長度計算',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ532Set('centroidMedianLength', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-circumcenter-five-subtypes': {
        type: 'drill',
        title: '外心角度距離與外接圓七小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('circumcenterMixed', practiceCount), resolvePracticeCount(count, 6));
        },
      },
      'j5-3-3-circumcenter-angle': {
        type: 'drill',
        title: '銳角三角形外心角',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('circumcenterAngle', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-circumcenter-equal-radius': {
        type: 'drill',
        title: '外心等距計算',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('circumcenterEqualRadius', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-right-circumradius': {
        type: 'drill',
        title: '直角三角形外接半徑',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('rightCircumradius', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-equilateral-circumradius': {
        type: 'drill',
        title: '正三角形外接半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('equilateralCircumradius', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-obtuse-circumcenter-angle': {
        type: 'drill',
        title: '鈍角三角形外心角',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('obtuseCircumcenterAngle', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-isosceles-circumradius': {
        type: 'drill',
        title: '等腰三角形外接半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('isoscelesCircumradius', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-circumcircle-area-from-radius': {
        type: 'drill',
        title: '由外心半徑求外接圓面積',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('circumcircleAreaFromRadius', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-incenter-six-subtypes': {
        type: 'drill',
        title: '內心角度半徑與面積八小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('incenterMixed', practiceCount), resolvePracticeCount(count, 6));
        },
      },
      'j5-3-3-incenter-angle': {
        type: 'drill',
        title: '內心角公式換算',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('incenterAngle', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-incenter-angle-inverse': {
        type: 'drill',
        title: '由內心角反推頂角',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('incenterAngleInverse', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-inradius-from-area-perimeter': {
        type: 'drill',
        title: '由面積周長求內切半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('inradiusFromAreaPerimeter', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-right-triangle-inradius': {
        type: 'drill',
        title: '直角三角形內切半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('rightTriangleInradius', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-incenter-area-ratio': {
        type: 'drill',
        title: '內心分割面積比',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('incenterAreaRatio', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-equilateral-inradius': {
        type: 'drill',
        title: '正三角形內切半徑',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('equilateralInradius', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-incenter-area-from-side-ratio': {
        type: 'drill',
        title: '內心面積比反推全圖',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('incenterAreaFromSideRatio', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-axis-triangle-incenter-area': {
        type: 'drill',
        title: '坐標軸直角三角形內心面積',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('axisTriangleIncenterArea', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-centroid-six-subtypes': {
        type: 'drill',
        title: '重心長度座標面積十五小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('centroidMixed', practiceCount), resolvePracticeCount(count, 6));
        },
      },
      'j5-3-3-centroid-median-length': {
        type: 'drill',
        title: '由中線求重心分段',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('centroidMedianLength', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-centroid-median-inverse': {
        type: 'drill',
        title: '由重心短段求中線',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('centroidMedianInverse', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-centroid-coordinate': {
        type: 'drill',
        title: '三點求重心坐標',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('centroidCoordinate', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-missing-vertex-from-centroid': {
        type: 'drill',
        title: '由重心反推第三頂點',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('missingVertexFromCentroid', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-centroid-area-sixth': {
        type: 'drill',
        title: '重心六等面積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('centroidAreaSixth', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-centroid-area-third': {
        type: 'drill',
        title: '重心三等面積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('centroidAreaThird', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-centroid-median-equation': {
        type: 'drill',
        title: '重心中線比例一次式',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('centroidMedianEquation', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-centroid-area-from-one-small': {
        type: 'drill',
        title: '由重心小三角形求全圖面積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('centroidAreaFromOneSmall', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-parallelogram-hidden-centroid-length': {
        type: 'drill',
        title: '平行四邊形隱藏重心求長度',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('parallelogramHiddenCentroidLength', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-parallelogram-centroid-area': {
        type: 'drill',
        title: '平行四邊形隱藏重心求面積',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('parallelogramCentroidArea', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-centroid-quadrilateral-to-total-area': {
        type: 'drill',
        title: '重心中點四邊形反推全圖面積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('centroidQuadrilateralToTotalArea', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-parallelogram-two-centroids-distance': {
        type: 'drill',
        title: '平行四邊形兩重心距離',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('parallelogramTwoCentroidsDistance', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-parallelogram-midpoint-triangle-area': {
        type: 'drill',
        title: '平行四邊形中點小三角形面積',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('parallelogramMidpointTriangleArea', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-parallelogram-centroid-segment-equation': {
        type: 'drill',
        title: '平行四邊形兩重心分段一次式',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('parallelogramCentroidSegmentEquation', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-isosceles-area-from-centroid-distance': {
        type: 'drill',
        title: '等腰三角形由重心距求面積',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('isoscelesAreaFromCentroidDistance', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-coordinate-five-subtypes': {
        type: 'drill',
        title: '座標平面三心八小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('coordinateMixed', practiceCount), resolvePracticeCount(count, 6));
        },
      },
      'j5-3-3-right-triangle-circumcenter-coordinate': {
        type: 'drill',
        title: '座標直角三角形外心',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('rightTriangleCircumcenterCoordinate', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-three-point-centroid-coordinate': {
        type: 'drill',
        title: '座標三點重心',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('threePointCentroidCoordinate', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-axis-triangle-incenter': {
        type: 'drill',
        title: '坐標軸直角三角形內心',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('axisTriangleIncenter', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-right-triangle-og-distance': {
        type: 'drill',
        title: '直角三角形外心重心距',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('rightTriangleOGDistance', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-circumcenter-point-check': {
        type: 'drill',
        title: '判斷點是否在外接圓上',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('circumcenterPointCheck', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-circumcenter-coordinate-general': {
        type: 'drill',
        title: '三點共圓求外心與面積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('circumcenterCoordinateGeneral', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-right-triangle-coordinate-og': {
        type: 'drill',
        title: '座標直角三角形求外心重心距',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('rightTriangleCoordinateOG', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-euler-line-orthocenter-coordinate': {
        type: 'drill',
        title: '尤拉線由外心重心求垂心',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('eulerLineOrthocenterCoordinate', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-special-five-subtypes': {
        type: 'drill',
        title: '正三角形與直角三心十小類綜合',
        difficulty: 'medium',
        questionCount: 6,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('specialMixed', practiceCount), resolvePracticeCount(count, 6));
        },
      },
      'j5-3-3-equilateral-radii-ratio': {
        type: 'drill',
        title: '正三角形內外半徑比',
        difficulty: 'easy',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('equilateralRadiiRatio', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-equilateral-area-from-inradius': {
        type: 'drill',
        title: '由內切半徑求正三角形面積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('equilateralAreaFromInradius', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-equilateral-area-from-circumradius': {
        type: 'drill',
        title: '由外接半徑求正三角形面積',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('equilateralAreaFromCircumradius', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-right-triangle-go': {
        type: 'drill',
        title: '直角三角形外心重心距公式',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('rightTriangleGO', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-right-triangle-rr-perimeter': {
        type: 'drill',
        title: '直角三角形內外半徑與周長',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('rightTriangleRrPerimeter', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-right-triangle-hypotenuse-from-og': {
        type: 'drill',
        title: '由外心重心距反推斜邊與外接圓',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('rightTriangleHypotenuseFromOG', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-right-triangle-perimeter-from-rr': {
        type: 'drill',
        title: '由內外半徑反推直角三角形周長',
        difficulty: 'hard',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('rightTrianglePerimeterFromRr', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-equilateral-height-from-circumradius': {
        type: 'drill',
        title: '由外接半徑求正三角形高',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('equilateralHeightFromCircumradius', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-equilateral-incircle-circumcircle-area-ratio': {
        type: 'drill',
        title: '正三角形內外圓面積比',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('equilateralIncircleCircumcircleAreaRatio', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-centroid-to-vertex-sum': {
        type: 'drill',
        title: '重心到三頂點距離和',
        difficulty: 'medium',
        questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildJ533Set('centroidToVertexSum', practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-1-2-rectangle-similarity-check': {
        type: 'drill', title: '矩形相似判別', difficulty: 'easy', questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildRectangleSimilarityCheckSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-similar-polygon-angle': {
        type: 'drill', title: '相似多邊形角度計算', difficulty: 'medium', questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildSimilarPolygonAngleSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-1-3-slope-position-height': {
        type: 'drill', title: '斜坡位置高度計算', difficulty: 'easy', questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildSlopePositionHeightSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-chord-sagitta-radius': {
        type: 'drill', title: '弓形矢高求半徑', difficulty: 'medium', questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildChordSagittaRadiusSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-1-semicircle-chord-width': {
        type: 'drill', title: '圓形容器水面寬度', difficulty: 'medium', questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildSemicircleChordWidthSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-2-2-tangent-combined-angle': {
        type: 'drill', title: '切線弦角綜合計算', difficulty: 'medium', questionCount: 5,
        generate(count) {

          return buildUniquePracticeSet((practiceCount) => buildTangentCombinedAngleSet(practiceCount), resolvePracticeCount(count, 5));

        },
      },
      'j5-3-2-perp-bisector-perimeter': {
        type: 'drill', title: '中垂線性質求周長', difficulty: 'easy', questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildPerpBisectorPerimeterSet(practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-incircle-tangent-length': {
        type: 'drill', title: '內切圓切線段計算', difficulty: 'medium', questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildIncircleTangentLengthSet(practiceCount), resolvePracticeCount(count, 5));
        },
      },
      'j5-3-3-median-length-formula': {
        type: 'drill', title: '中線長公式計算', difficulty: 'medium', questionCount: 5,
        generate(count) {
          return buildUniquePracticeSet((practiceCount) => buildMedianLengthFormulaSet(practiceCount), resolvePracticeCount(count, 5));
        },
      },
  };

  const j511QuestionPrompts = [
    '請先把各量設為同一份數後作答：',
    '請確認比例的共同項或反比關係後作答：',
    '請將比例化為最簡整數比，再完成作答：',
    '請依比例分配與代數條件求解：',
    '請寫出正確的比例或數值：',
  ];
  const j512QuestionPrompts = [
    '請先標出平行線與對應線段後作答：',
    '請依平行截線比例或中點性質求解：',
    '請確認同位線段的比例關係後作答：',
    '請先列出相似比，再求所需線段：',
    '請寫出正確的線段長或判斷：',
  ];
  const j512RectangleQuestionPrompts = [
    '請先比較各選項的長寬比後作答：',
    '請將長寬比化簡後判斷是否相似：',
    '請確認對應邊是否具有相同倍率：',
    '請依長方形的相似條件作答：',
    '請寫出正確的選項：',
  ];
  const j513QuestionPrompts = [
    '請先確認相似圖形的對應元素後作答：',
    '請依相似比、面積比或測量關係求解：',
    '請辨識相似判別條件後完成作答：',
    '請先畫出對應的相似三角形關係：',
    '請寫出正確的相似判斷或幾何量：',
  ];
  const j514QuestionPrompts = [
    '請先整理圖形條件與對應量後作答：',
    '請依長度、面積或三角比關係求解：',
    '請確認相似、平行或中點性質後作答：',
    '請列式並寫出正確的幾何量：',
    '請檢查單位與比例後完成作答：',
  ];
  Object.entries(nextConfigs).forEach(([id, config]) => {
    if (!id.startsWith('j5-1-') || !config || typeof config.generate !== 'function') return;
    const prompts = id.startsWith('j5-1-1-')
      ? j511QuestionPrompts
      : id.startsWith('j5-1-2-')
        ? id === 'j5-1-2-rectangle-similarity-check'
          ? j512RectangleQuestionPrompts
          : j512QuestionPrompts
        : id.startsWith('j5-1-3-')
          ? j513QuestionPrompts
          : j514QuestionPrompts;
    const generate = config.generate;
    config.generate = function generateJ51WithWordingVariation(count) {
      const generated = generate.call(this, count);
      const prompt = prompts[randInt(0, prompts.length - 1)];
      return {
        ...generated,
        questions: generated.questions.map((question) => `${prompt}${question}`),
      };
    };
  });

  const j521QuestionPrompts = [
    '請先依題意畫出圓心與半徑，再作答：',
    '請先標出必要的直角或圓心距，再求所問量：',
    '請先找出最直接可用的圓的性質，再作答：',
    '請由題目的位置關係或長度關係逐步判斷：',
  ];
  const j522QuestionPrompts = [
    '請先標出角所對的弧，再作答：',
    '請分清楚劣弧與優弧後作答：',
    '請先判斷圓心角、圓周角或弦切角的關係，再作答：',
    '請依題圖的弧度數與角度關係逐步判斷：',
  ];
  const j523QuestionPrompts = [
    '請先根據點與圓的位置，辨識適用的圓冪關係，再作答：',
    '請先標示已知線段，再以圓冪定理列式：',
    '請確認兩線段乘積或切線平方的來源，再作答：',
    '請以圓冪定理逐步檢查對應關係後作答：',
  ];
  Object.entries(nextConfigs).forEach(([id, config]) => {
    if (!id.startsWith('j5-2-') || !config || typeof config.generate !== 'function') return;
    const prompts = id.startsWith('j5-2-1-')
      ? j521QuestionPrompts
      : id.startsWith('j5-2-2-')
        ? j522QuestionPrompts
        : j523QuestionPrompts;
    const generate = config.generate;
    config.generate = function generateJ52WithWordingVariation(count) {
      const generated = generate.call(this, count);
      const prompt = prompts[randInt(0, prompts.length - 1)];
      return {
        ...generated,
        questions: generated.questions.map((question) => `${prompt}${question}`),
      };
    };
  });

  const j531QuestionPrompts = [
    '請先把題目的條件轉成代數關係，再作答：',
    '請先找出奇偶、因數、餘數或正負號的關鍵，再作答：',
    '請以一般情況推理，不只代入一個數值：',
    '請逐步寫出可驗證結論的理由：',
    '請檢查推理是否對所有符合條件的數都成立：',
  ];
  const j532QuestionPrompts = [
    '請先把題設中的幾何關係標記清楚，再作答：',
    '請先找出可用的全等、相似或圓周角性質，再作答：',
    '請確認對應的角、邊或線段後再作答：',
    '請以幾何性質逐步說明結論：',
    '請先確認結論所需的定義或定理，再作答：',
  ];
  const j533QuestionPrompts = [
    '請先確認題目涉及的外心、內心、重心或座標關係，再作答：',
    '請先標出已知長度與所求量，再選擇合適公式：',
    '請檢查半徑、中線或面積比例後再作答：',
    '請用圖形性質或座標關係逐步推理：',
    '請先確認各中心的定義與位置關係，再作答：',
  ];
  Object.entries(nextConfigs).forEach(([id, config]) => {
    if (!id.startsWith('j5-3-') || !config || typeof config.generate !== 'function') return;
    const prompts = id.startsWith('j5-3-1-')
      ? j531QuestionPrompts
      : id.startsWith('j5-3-2-')
        ? j532QuestionPrompts
        : j533QuestionPrompts;
    const generate = config.generate;
    config.generate = function generateJ53WithWordingVariation(count) {
      const generated = generate.call(this, count);
      const prompt = prompts[randInt(0, prompts.length - 1)];
      return {
        ...generated,
        questions: generated.questions.map((question) => `${prompt}${question}`),
      };
    };
  });

  const bundleFingerprint = "j5-bundle-v20260716-j51-j52-j53-summary-review-v4";
  Object.values(nextConfigs).forEach((config) => {
    if (!config || typeof config !== "object") return;
    config.__generatorFingerprint = bundleFingerprint;
  });

  store.registerConfigs(nextConfigs);
})();
