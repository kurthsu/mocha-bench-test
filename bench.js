#!/usr/bin/env node
const argv = require('yargs')
  .usage('bench [options] path').help('h')
  .options({
    'g': {
      alias: 'grep',
      describe: 'only run tests matching <pattern>',
      type: 'string',
    },
    't': {
      alias: 'times',
      describe: 'times for calling each test case',
      default: 1,
      type: 'number'
    },
    'v': {
      alias: 'verbose',
      describe: 'display test pass result for each run',
      default: false,
      type: 'boolean'
    }
  })
  .locale('en').argv;

module.exports = (async () => {
  const BenchRunner = require('./lib/benchRunner');
  const benchRunner = new BenchRunner(prepareOptions(argv), argv.times, argv.verbose);
  
  let results = await benchRunner.run();
  let benchResult = benchRunner.average(results);
  benchRunner.printBenchResult(benchResult);
})();

function prepareOptions(argv) {
  let args = [];

  // pass grep option to mocha
  if (argv.grep) {
    args.push('--grep', argv.grep);
  }

  // non-hyphenated options
  args.push(argv._);

  return args;
}