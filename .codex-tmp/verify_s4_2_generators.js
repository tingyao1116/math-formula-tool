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
  "s4-2-1-common-line-plane-family-clean",
  "s4-2-1-coplanar-parameter-clean",
  "s4-2-1-parallel-plane-distance-parameter-clean",
  "s4-2-1-plane-angle-parameter-clean",
  "s4-2-2-line-relation-classification-clean",
  "s4-2-2-line-plane-hit-time-clean",
  "s4-2-2-line-plane-relation-clean",
  "s4-2-2-point-line-reflection-clean",
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
  const text = [...generated.questions, ...generated.answers].join("\n");
  if (/\?\?|\uFFFD/.test(text)) throw new Error(`Bad text pattern in ${key}`);
  console.log(`${key}: ${generated.questions[0]} => ${generated.summaryAnswers[0]}`);
}
