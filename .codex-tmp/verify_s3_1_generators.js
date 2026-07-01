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
  "s3-1-1-sector-cone-parameterized",
  "s3-1-2-tangent-addition-equation-parameterized",
  "s3-1-2-cos-arithmetic-progression-parameterized",
  "s3-1-3-linear-sincos-graph-facts-parameterized",
  "s3-1-3-peak-valley-function-parameterized",
  "s3-1-4-linear-combo-inequality-parameterized",
  "s3-1-4-combo-max-point-tangent-parameterized",
];

const badPatterns = [/\?\?/, /\uFFFD/];

for (const key of keys) {
  const config = configs[key];
  if (!config) {
    throw new Error(`Missing config: ${key}`);
  }
  const generated = config.generate();
  if (!generated || !Array.isArray(generated.questions) || !Array.isArray(generated.answers)) {
    throw new Error(`Invalid output: ${key}`);
  }
  if (generated.questions.length !== 5 || generated.answers.length !== 5) {
    throw new Error(`Unexpected count for ${key}`);
  }
  const text = [...generated.questions, ...generated.answers].join("\n");
  for (const pattern of badPatterns) {
    if (pattern.test(text)) {
      throw new Error(`Bad text pattern ${pattern} in ${key}`);
    }
  }
  console.log(`${key}: ${generated.questions[0]} => ${generated.summaryAnswers[0]}`);
}
