const path = require('path');

const configs = {};
global.window = {
  formulaPracticeStore: {
    registerConfigs(nextConfigs) {
      Object.assign(configs, nextConfigs);
    },
  },
};

require(path.resolve(__dirname, '..', 'data', 'practice-generators', 's2.js'));

const keys = [
  's2-2-1-handshake-couples-parameterized',
  's2-2-1-fixed-end-no-repeat-schedule-parameterized',
  's2-2-1-ambidextrous-pairing-parameterized',
  's2-2-2-specified-non-adjacent-parameterized',
  's2-2-3-binomial-adjacent-ratio-parameterized',
  's2-2-4-grid-comparison-probability-parameterized',
  's2-2-4-overlap-days-off-probability-parameterized',
];

const bad = [];
for (const key of keys) {
  const config = configs[key];
  if (!config || typeof config.generate !== 'function') {
    bad.push(`${key}: missing config`);
    continue;
  }
  const result = config.generate();
  if (!result || !Array.isArray(result.questions) || result.questions.length !== 5) {
    bad.push(`${key}: invalid questions`);
    continue;
  }
  if (!Array.isArray(result.answers) || result.answers.length !== 5) {
    bad.push(`${key}: invalid answers`);
    continue;
  }
  console.log(`${key}`);
  console.log(`  Q: ${result.questions[0]}`);
  console.log(`  A: ${result.answers[0]}`);
}

if (bad.length) {
  console.error(bad.join('\n'));
  process.exit(1);
}
