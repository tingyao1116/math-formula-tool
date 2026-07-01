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
  "s4-1-1-equidistant-plane-locus-clean",
  "s4-1-1-moving-point-distance-clean",
  "s4-1-2-unit-direction-sum-clean",
  "s4-1-2-parametric-vector-min-clean",
  "s4-1-2-line-projection-point-clean",
  "s4-1-3-projection-scalar-clean",
  "s4-1-3-sphere-linear-extrema-clean",
  "s4-1-3-plane-distance-minimum-clean",
  "s4-1-4-triangle-height-clean",
  "s4-1-4-volume-linear-combination-clean",
  "s4-1-4-vandermonde-parameter-clean",
  "s4-1-4-determinant-operation-clean",
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
