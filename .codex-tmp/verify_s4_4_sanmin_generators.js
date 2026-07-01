const path = require("path");

const configs = {};
global.window = {
  formulaPracticeStore: {
    registerConfigs(nextConfigs) {
      Object.assign(configs, nextConfigs);
    },
  },
};

require(path.resolve(__dirname, "../data/practice-generators/s4.js"));

const keys = [
  "s4-4-1-matrix-entry-double-sum-clean",
  "s4-4-2-commutator-parameter-clean",
  "s4-4-2-rank-one-power-sum-clean",
  "s4-4-3-power-recovery-clean",
  "s4-4-3-matrix-code-decode-clean",
  "s4-4-4-coordinate-rotation-clean",
  "s4-4-4-line-stretch-parameter-clean",
];

for (const key of keys) {
  const config = configs[key];
  if (!config) throw new Error(`Missing config: ${key}`);
  const generated = config.generate();
  if (!generated || !Array.isArray(generated.questions) || !Array.isArray(generated.answers)) {
    throw new Error(`Invalid output: ${key}`);
  }
  if (generated.questions.length !== 5 || generated.answers.length !== 5) {
    throw new Error(`Unexpected count for ${key}`);
  }
  const text = [...generated.questions, ...generated.summaryAnswers, ...generated.answers].join("\n");
  if (/\?\?|\uFFFD/.test(text)) throw new Error(`Bad text pattern in ${key}`);
  if (!/[0-9]/.test(text)) throw new Error(`No numeric parameters detected in ${key}`);
  if (!/\\\(|\\begin\{bmatrix\}/.test(text)) throw new Error(`No TeX detected in ${key}`);
  console.log(`${key}: ${generated.questions[0]} => ${generated.summaryAnswers[0]}`);
}
