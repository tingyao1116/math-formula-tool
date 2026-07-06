const fs = require('fs');
const vm = require('vm');

const generatorPath = 'data/practice-generators/s1.js';
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
context.window.window = context.window;

vm.createContext(context);
vm.runInContext(source, context, { filename: generatorPath });

const keys = Object.keys(registered);
if (!keys.length) throw new Error('no s1 configs registered');

for (const key of keys) {
  if (process.env.VERBOSE_S1_VERIFY === '1') {
    console.log(`checking ${key}`);
  }
  const config = registered[key];
  if (!config || typeof config.generate !== 'function') {
    throw new Error(`missing generate for ${key}`);
  }
  if (config.__generatorFingerprint !== 's1-bundle-v20260706-summary-v1') {
    throw new Error(`wrong fingerprint for ${key}: ${config.__generatorFingerprint}`);
  }
  for (let run = 0; run < 3; run += 1) {
    if (process.env.VERBOSE_S1_VERIFY === '1') {
      console.log(`  run ${run + 1}`);
    }
    const result = config.generate();
    if (!result || !Array.isArray(result.questions)) {
      throw new Error(`missing questions for ${key}`);
    }
    if (!Array.isArray(result.summaryAnswers)) {
      throw new Error(`missing summaryAnswers for ${key}`);
    }
    if (!Array.isArray(result.answers)) {
      throw new Error(`missing answers for ${key}`);
    }
    if (result.summaryAnswers.length !== result.questions.length) {
      throw new Error(`summary length mismatch for ${key}: ${result.summaryAnswers.length} vs ${result.questions.length}`);
    }
    if (result.answers.length !== result.questions.length) {
      throw new Error(`answer length mismatch for ${key}: ${result.answers.length} vs ${result.questions.length}`);
    }
    const joined = [...result.questions, ...result.summaryAnswers, ...result.answers].join('\n');
    if (joined.includes('undefined') || joined.includes('NaN')) {
      throw new Error(`invalid generated text for ${key}:\n${joined}`);
    }
  }
}

const staticBadPatterns = [
  /summaryAnswers\s*:\s*answers\.map/,
  /summaryAnswers\s*:\s*detailedAnswers\.map/,
  /return\s*\{\s*questions,\s*answers\s*\}/,
];
for (const pattern of staticBadPatterns) {
  if (pattern.test(source)) {
    throw new Error(`static bad summaryAnswers pattern remains: ${pattern}`);
  }
}

console.log(`verified summaryAnswers for ${keys.length} s1 configs`);
