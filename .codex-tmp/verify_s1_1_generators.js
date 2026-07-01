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
  's1-1-4-exponential-quadratic-extrema',
  's1-1-4-exponential-fraction-range',
  's1-1-4-rational-exponent-ordering',
  's1-1-4-exponential-growth-model',
  's1-1-5-log-difference-estimate',
];

const badPattern = /undefined|NaN|\?\?|�|嚙/;
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
    if (run === 0) {
      console.log(id);
      console.log('Q:', result.questions[0]);
      console.log('A:', result.answers[0]);
    }
  }
}

console.log('verified', ids.length);
