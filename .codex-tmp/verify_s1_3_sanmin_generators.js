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

const code = fs.readFileSync('data/practice-generators/s1.js', 'utf8');
vm.runInNewContext(code, context, { filename: 'data/practice-generators/s1.js' });

const ids = [
  's1-3-1-factor-check-special-polynomial',
  's1-3-1-nearby-roots-value',
  's1-3-2-cubic-center-form-evaluation',
  's1-3-3-same-solution-transform',
];

const badPattern = /undefined|NaN|\?\?|\uFFFD|x--|y--/;
for (const id of ids) {
  const config = configs[id];
  if (!config) throw new Error(`missing config: ${id}`);
  for (let run = 0; run < 8; run += 1) {
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
    if (run === 0) {
      console.log(id);
      console.log('Q:', result.questions[0]);
      console.log('A:', result.answers[0]);
    }
  }
}

console.log('verified', ids.length);
