const path = require("path");

const configs = {};
global.window = {
  formulaPracticeStore: {
    registerConfigs(nextConfigs) {
      Object.assign(configs, nextConfigs);
    },
  },
};

require(path.resolve(__dirname, "../data/practice-generators/j1.js"));

const keys = [
  "j1-1-1-coordinate-scale-origin-inference-clean",
  "j1-1-1-absolute-interval-simplify-clean",
  "j1-1-1-absolute-equation-count-clean",
  "j1-1-1-midpoint-ratio-nested-clean",
  "j1-1-3-common-base-conversion-clean",
  "j1-1-3-common-base-equation-clean",
  "j1-1-4-scientific-trap-compare-clean",
  "j1-1-4-scientific-unit-stack-clean",
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
  console.log(`${key}: ${generated.questions[0]} => ${generated.summaryAnswers[0]}`);
}
