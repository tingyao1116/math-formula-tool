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
  's1-2-1-line-form-facts',
  's1-2-1-linear-fractional-region-extrema',
  's1-2-2-two-circle-common-tangents',
  's1-2-3-circle-line-distance-point-count',
];

const badPattern = /undefined|NaN|\?\?|\uFFFD/;
for (const id of ids) {
  const config = configs[id];
  if (!config) throw new Error(`missing config: ${id}`);
  for (let run = 0; run < 5; run += 1) {
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
