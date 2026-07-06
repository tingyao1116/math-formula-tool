const fs = require('fs');
const vm = require('vm');

const generatorPath = 'data/practice-generators/j1.js';
const source = fs.readFileSync(generatorPath, 'utf8');
const registered = {};

const context = {
  console,
  Math,
  window: {
    formulaPracticeStore: {
      registerConfigs(configs) {
        Object.assign(registered, configs);
      },
    },
  },
};

vm.createContext(context);
vm.runInContext(source, context, { filename: generatorPath });

const keys = [
  'j1-2-1-combined-divisibility-clean',
  'j1-2-1-remainder-crt-range-clean',
  'j1-2-1-divisor-count-inverse-clean',
  'j1-2-2-gcd-lcm-pair-constraints-clean',
  'j1-2-2-ratio-lcm-three-numbers-clean',
  'j1-2-2-periodic-lcm-modeling-clean',
  'j1-2-3-advanced-telescoping-sum-clean',
  'j1-2-3-telescoping-product-clean',
];

for (const key of keys) {
  const config = registered[key];
  if (!config) throw new Error(`missing config: ${key}`);
  if (config.__generatorFingerprint !== 'j1-bundle-v20260705-j12-screenshot-v1') {
    throw new Error(`wrong fingerprint for ${key}: ${config.__generatorFingerprint}`);
  }
  for (let run = 0; run < 5; run += 1) {
    const result = config.generate();
    if (!result || !Array.isArray(result.questions) || result.questions.length !== config.questionCount) {
      throw new Error(`bad question count for ${key}`);
    }
    if (!Array.isArray(result.summaryAnswers) || result.summaryAnswers.length !== result.questions.length) {
      throw new Error(`bad summary count for ${key}`);
    }
    if (!Array.isArray(result.answers) || result.answers.length !== result.questions.length) {
      throw new Error(`bad answer count for ${key}`);
    }
    const joined = [...result.questions, ...result.summaryAnswers, ...result.answers].join('\n');
    if (joined.includes('undefined') || joined.includes('NaN') || joined.includes('Infinity')) {
      throw new Error(`invalid generated text for ${key}:\n${joined}`);
    }
  }
}

console.log(`verified ${keys.length} j1-2 screenshot generator configs`);
