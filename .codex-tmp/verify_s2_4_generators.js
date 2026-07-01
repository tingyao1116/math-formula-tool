global.window = {
  formulaPracticeStore: {
    configs: {},
    registerConfigs(configs) {
      Object.assign(this.configs, configs);
    },
  },
};

require("../data/practice-generators/s2.js");

const keys = [
  "s2-4-1-tangent-ordering-parameterized",
  "s2-4-1-sin-cos-sum-difference-parameterized",
  "s2-4-1-tangent-expression-parameterized",
  "s2-4-2-side-sum-ratio-sine-ratio-parameterized",
  "s2-4-2-sas-side-area-parameterized",
  "s2-4-2-isosceles-circumradius-parameterized",
  "s2-4-3-two-observation-height-parameterized",
  "s2-4-3-bearing-cosine-distance-parameterized",
  "s2-4-3-height-limit-floors-parameterized",
];

for (const key of keys) {
  const config = window.formulaPracticeStore.configs[key];
  if (!config) throw new Error(`missing config: ${key}`);
  const result = config.generate();
  if (!result || result.questions.length !== 5 || result.answers.length !== 5) {
    throw new Error(`bad result: ${key}`);
  }
  console.log(key);
  console.log(`  Q: ${result.questions[0]}`);
  console.log(`  A: ${result.answers[0]}`);
}
