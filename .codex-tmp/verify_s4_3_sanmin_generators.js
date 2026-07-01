const fs = require('fs');
const vm = require('vm');

const configs = {};
const context = {
  window: {
    formulaPracticeStore: {
      registerConfigs(nextConfigs) {
        Object.assign(configs, nextConfigs);
      },
    },
  },
  console,
  Math,
};

const code = fs.readFileSync('data/practice-generators/s4.js', 'utf8');
vm.runInNewContext(code, context, { filename: 'data/practice-generators/s4.js' });

const ids = [
  's4-3-1-drawer-paradox-clean',
  's4-3-1-lost-card-bayes-clean',
  's4-3-1-truth-report-color-clean',
  's4-3-1-signal-channel-bayes-clean',
  's4-3-2-conditioned-success-position-clean',
  's4-3-2-traffic-light-counts-clean',
];

const badPattern = /undefined|NaN|\?\?|\uFFFD|\\frac\{[^}]*\.[^}]*\}/;

for (const id of ids) {
  const config = configs[id];
  if (!config) throw new Error(`missing config: ${id}`);
  const firstQuestions = new Set();
  for (let run = 0; run < 10; run += 1) {
    const result = config.generate();
    if (!Array.isArray(result.questions) || result.questions.length !== config.questionCount) {
      throw new Error(`bad question count: ${id}`);
    }
    if (!Array.isArray(result.answers) || result.answers.length !== config.questionCount) {
      throw new Error(`bad answer count: ${id}`);
    }
    const joined = `${result.questions.join('\n')}\n${result.answers.join('\n')}`;
    if (badPattern.test(joined)) {
      throw new Error(`bad text in ${id}: ${joined}`);
    }
    if (!/[0-9]/.test(joined)) {
      throw new Error(`missing parameterized numbers: ${id}`);
    }
    firstQuestions.add(result.questions[0]);
    if (run === 0) {
      console.log(id);
      console.log('Q:', result.questions[0]);
      console.log('A:', result.answers[0]);
    }
  }
  if (firstQuestions.size < 2) {
    throw new Error(`low variation: ${id}`);
  }
}

console.log('verified', ids.length);
