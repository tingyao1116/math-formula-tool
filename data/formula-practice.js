(() => {
  function shuffle(array) {
    const copy = Array.isArray(array) ? array.slice() : [];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
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

  function replaceTrailingCountArg(argsSource, nextCount) {
    const source = String(argsSource || "").trim();
    const count = Number(nextCount);
    if (!Number.isFinite(count) || count <= 0) return source;
    if (!source) return `${count}`;
    return source.replace(/-?\d+(?:\.\d+)?\s*$/, `${count}`);
  }

  function runGenerateWithQuestionCount(generateFn, nextCount) {
    const parsed = parseGenerateCall(generateFn);
    const count = Number(nextCount);
    if (!parsed || !Number.isFinite(count) || count <= 0) return null;

    const builder = resolveLocalBuilder(parsed.builderName);
    if (typeof builder !== "function") return null;

    const nextArgsSource = replaceTrailingCountArg(parsed.argsSource, count);
    const args = evaluateBuilderArgs(nextArgsSource);
    if (!Array.isArray(args)) return null;

    try {
      return builder(...args);
    } catch (_error) {
      return null;
    }
  }

  function shuffleGeneratedSet(result) {
    if (!result || typeof result !== "object") return result;
    const questions = Array.isArray(result.questions) ? result.questions.slice() : [];
    const summaryAnswers = Array.isArray(result.summaryAnswers) ? result.summaryAnswers.slice() : [];
    const answers = Array.isArray(result.answers) ? result.answers.slice() : [];
    const maxLen = Math.max(questions.length, summaryAnswers.length, answers.length);
    if (maxLen <= 1) return result;

    const rows = Array.from({ length: maxLen }, (_, index) => ({
      question: questions[index],
      summaryAnswer: summaryAnswers[index],
      answer: answers[index],
    }));
    const shuffled = shuffle(rows);

    return {
      ...result,
      questions: shuffled.map((entry) => entry.question).filter((entry) => entry !== undefined),
      summaryAnswers: shuffled.map((entry) => entry.summaryAnswer).filter((entry) => entry !== undefined),
      answers: shuffled.map((entry) => entry.answer).filter((entry) => entry !== undefined),
    };
  }

  function deriveSummaryAnswerFromDetail(detail) {
    const text = String(detail || "")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return "";

    const afterEquals = text.match(/=\s*([^=]+?)\s*$/);
    if (afterEquals?.[1]) {
      return afterEquals[1].trim();
    }

    const mathMatches = [...text.matchAll(/\\$([^$]+)\\$/g)];
    if (mathMatches.length) {
      const candidate = mathMatches[mathMatches.length - 1][1].trim();
      if (candidate) return `$${candidate}$`;
    }

    const plain = text.replace(/\\[()]/g, "").trim();
    return plain;
  }

  function ensureGeneratedSummaryAnswers(result) {
    if (!result || typeof result !== "object") return result;
    const questions = Array.isArray(result.questions) ? result.questions : [];
    const answers = Array.isArray(result.answers) ? result.answers : [];
    if (!questions.length && !answers.length) return result;

    const currentSummary = Array.isArray(result.summaryAnswers) ? result.summaryAnswers.slice() : [];
    const maxLen = Math.max(questions.length, answers.length, currentSummary.length);
    const summaryAnswers = Array.from({ length: maxLen }, (_, index) => {
      const existing = currentSummary[index];
      if (existing !== undefined && String(existing).trim() !== "") return existing;
      const fallback = deriveSummaryAnswerFromDetail(answers[index]);
      if (fallback && String(fallback).trim() !== "") return fallback;
      return answers[index] !== undefined ? String(answers[index]) : "";
    });

    return {
      ...result,
      summaryAnswers,
    };
  }

  function extractGeneratedRows(result) {
    const normalized = ensureGeneratedSummaryAnswers(result && typeof result === "object" ? result : {});
    const questions = Array.isArray(normalized.questions) ? normalized.questions : [];
    const summaryAnswers = Array.isArray(normalized.summaryAnswers) ? normalized.summaryAnswers : [];
    const answers = Array.isArray(normalized.answers) ? normalized.answers : [];
    const maxLen = Math.max(questions.length, summaryAnswers.length, answers.length);
    const rows = [];

    for (let index = 0; index < maxLen; index += 1) {
      const question = String(questions[index] ?? "").trim();
      const summaryAnswer = String(summaryAnswers[index] ?? "").trim();
      const answer = String(answers[index] ?? "").trim();
      if (!question && !summaryAnswer && !answer) continue;
      rows.push({ question, summaryAnswer, answer });
    }

    return {
      intro: typeof normalized.intro === "string" ? normalized.intro : "",
      rows,
      base: normalized,
    };
  }

  function rebuildGeneratedSetFromRows(base, intro, rows, desiredCount) {
    const limit = Math.max(1, Number(desiredCount) || 1);
    const picked = Array.isArray(rows) ? rows.slice(0, limit) : [];
    return {
      ...(base && typeof base === "object" ? base : {}),
      intro: typeof intro === "string" ? intro : "",
      questions: picked.map((row) => row.question),
      summaryAnswers: picked.map((row) => row.summaryAnswer),
      answers: picked.map((row) => row.answer),
    };
  }

  function generateWithExactQuestionCount(generateFn, desiredCount, context, item, preferredResult = null) {
    const count = Math.max(1, Number(desiredCount) || 1);
    const attemptLimit = Math.max(3, Math.min(24, count * 4));
    const collected = [];
    let intro = "";
    let lastBase = null;

    function consume(result) {
      const extracted = extractGeneratedRows(result);
      if (!intro && extracted.intro) intro = extracted.intro;
      if (extracted.base && typeof extracted.base === "object") lastBase = extracted.base;
      extracted.rows.forEach((row) => {
        if (collected.length < count) collected.push(row);
      });
    }

    if (preferredResult) {
      consume(preferredResult);
    }

    for (let attempt = preferredResult ? 1 : 0; attempt < attemptLimit && collected.length < count; attempt += 1) {
      try {
        consume(generateFn.call(context, item));
      } catch (_error) {
        break;
      }
    }

    return rebuildGeneratedSetFromRows(lastBase, intro, collected, count);
  }

  function buildFixedExampleConfig(source) {
    return {
      type: "fixed-example",
      title: source.title || "固定題目",
      prompt: source.prompt || "",
      answer: source.answer || "",
      difficulty: source.difficulty || "",
      questionCount: Number(source.questionCount) || 0,
    };
  }

  function buildGeneratorConfig(base, source) {
    if (!base) return null;
    const merged = {
      ...base,
      type: source.mode || base.type,
      title: source.title || base.title,
      difficulty: source.difficulty || base.difficulty,
      questionCount: Math.max(1, Number(source.questionCount) || Number(base.questionCount) || 5),
    };

    if (typeof base.generate === "function") {
      merged.generate = function generateWithAssignmentCount(item) {
        const shouldBypassLocalBuilder =
          Boolean(base.__generatorFingerprint) || Boolean(base.generatorFingerprint);
        const directGenerated = shouldBypassLocalBuilder
          ? null
          : runGenerateWithQuestionCount(base.generate, this.questionCount);
        const generated = generateWithExactQuestionCount(
          base.generate,
          this.questionCount,
          this,
          item,
          directGenerated,
        );
        return shuffleGeneratedSet(ensureGeneratedSummaryAnswers(generated));
      };
    }

    return merged;
  }

  window.formulaPracticeLegacySourcePath = "data/formula-practice.full.js";

  window.formulaPracticeStore = {
    configs: {},
    registerConfigs(nextConfigs) {
      if (!nextConfigs || typeof nextConfigs !== "object") return;
      Object.assign(this.configs, nextConfigs);
    },
    getConfig(id) {
      const topicId = String(id || "").trim();
      const direct = this.configs[topicId] || null;
      const assignmentStore = window.formulaPracticeAssignmentStore || {};
      const assignment = assignmentStore?.byId?.[topicId] || null;
      const practiceLibraryStore = window.practiceLibraryStore || {};
      const practiceRecord = practiceLibraryStore?.byId?.[topicId] || null;

      if (assignment && assignment.enabled === false) {
        return null;
      }

      if (assignment) {
        const mode = String(assignment.mode || "").trim() || "generator";
        if (mode === "fixed-example") {
          return buildFixedExampleConfig(assignment);
        }

        const practiceKey = String(assignment.practiceKey || "").trim();
        const base = (practiceKey && this.configs[practiceKey]) || direct;
        return buildGeneratorConfig(base, assignment);
      }

      if (practiceRecord && practiceRecord.enabled === false) {
        return null;
      }

      if (practiceRecord) {
        const mode = String(practiceRecord.mode || "").trim() || "generator";
        if (mode === "fixed-example") {
          return buildFixedExampleConfig(practiceRecord);
        }

        const generatorKey = String(practiceRecord.generatorKey || practiceRecord.practiceKey || "").trim();
        const base = (generatorKey && this.configs[generatorKey]) || direct;
        return buildGeneratorConfig(base, practiceRecord);
      }

      return buildGeneratorConfig(direct, {});
    },
  };
})();
