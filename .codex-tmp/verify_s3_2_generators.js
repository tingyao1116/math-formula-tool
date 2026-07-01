const path = require("path");

const configs = {};
global.window = {
  formulaPracticeStore: {
    registerConfigs(nextConfigs) {
      Object.assign(configs, nextConfigs);
    },
  },
};

require(path.resolve(__dirname, "../data/practice-generators/s3.js"));

const keys = [
  "s3-2-1-power-root-comparison-clean",
  "s3-2-1-exponential-integer-count-clean",
  "s3-2-1-exponential-graph-parameter-clean",
  "s3-2-2-dominant-log-approx-clean",
  "s3-2-2-log-domain-integer-count-clean",
  "s3-2-2-chain-change-base-clean",
  "s3-2-3-log-point-transform-clean",
  "s3-2-3-log-base-order-clean",
  "s3-2-4-growth-threshold-clean",
  "s3-2-4-log-scale-ratio-clean",
  "s3-2-4-compound-inference-clean",
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
