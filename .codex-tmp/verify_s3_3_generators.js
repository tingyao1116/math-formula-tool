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
  "s3-3-1-barycentric-interior-clean",
  "s3-3-1-area-ratio-coefficient-clean",
  "s3-3-1-segment-section-clean",
  "s3-3-2-projection-equality-clean",
  "s3-3-2-parametric-min-length-clean",
  "s3-3-2-region-area-clean",
  "s3-3-3-triangle-side-dot-clean",
  "s3-3-3-projection-vector-clean",
  "s3-3-3-norm-relation-angle-clean",
  "s3-3-4-determinant-operation-clean",
  "s3-3-4-cramer-parameter-clean",
  "s3-3-4-area-scale-clean",
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
