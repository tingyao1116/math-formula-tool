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
  's2-3-1-quartiles-iqr-parameterized',
  's2-3-1-grouped-mean-parameterized',
  's2-3-1-geometric-growth-rate-parameterized',
  's2-3-1-sqrt-score-transform-parameterized',
  's2-3-1-variance-correction-difference-parameterized',
  's2-3-1-equal-size-group-merge-parameterized',
  's2-3-2-correlation-from-sums-parameterized',
  's2-3-2-least-squares-small-data-parameterized',
  's2-3-2-signed-linear-correlation-parameterized',
  's2-3-2-regression-correlation-from-line-parameterized',
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
