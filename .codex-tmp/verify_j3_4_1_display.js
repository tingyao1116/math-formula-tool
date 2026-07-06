const fs = require('fs');
const vm = require('vm');

const generatorPath = 'data/practice-generators/j3.js';
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

const keys = Object.keys(registered).filter((key) => key.startsWith('j3-4-1-'));
if (!keys.length) throw new Error('no j3-4-1 configs found');

for (const key of keys) {
  const config = registered[key];
  if (config.__generatorFingerprint !== 'j3-bundle-v20260705-j341-display-v1') {
    throw new Error(`wrong fingerprint for ${key}: ${config.__generatorFingerprint}`);
  }
  for (let run = 0; run < 20; run += 1) {
    const result = config.generate();
    const joined = [
      ...(result.questions || []),
      ...(result.summaryAnswers || []),
      ...(result.answers || []),
    ].join('\n');
    if (/[\+\-\(]1x\b|^1x\b/.test(joined)) {
      throw new Error(`bad 1x display in ${key}:\n${joined}`);
    }
    if (joined.includes('undefined') || joined.includes('NaN')) {
      throw new Error(`invalid generated text in ${key}:\n${joined}`);
    }
  }
}

const shared = registered['j3-4-1-shared-root'].generate();
const sharedText = [...shared.questions, ...shared.answers].join('\n');
if (!/共同出現的是/.test(sharedText)) {
  throw new Error('shared-root explanation did not use the simplified common-root wording');
}

console.log(`verified ${keys.length} j3-4-1 configs`);
