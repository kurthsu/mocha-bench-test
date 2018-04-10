#!/usr/bin/env node
const argv = require('yargs')
  .usage('bench [options]').help('h')
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
    }
  })
  .locale('en').argv;

const spawn = require('child_process').spawn;
const args = prepareOptions(argv);

function runTests(callback) {
  const proc = spawn('mocha', args);
  let resultData = '';

  proc.stdout.on('data', (data) => {
    resultData += data.toString();
  });
  
  proc.stderr.on('data', (data) => {
    callback(data.toString());
  });
  
  proc.on('exit', () => {
    callback(null, JSON.parse(resultData).passes);
  });
}

for (let i=0; i<argv.times; i++) {
  runTests((err, result) => {
    console.log(`Run test #${i+1} completed ...`);
    if (err) {
      console.error(err);
      return;
    }
    result.forEach((item) => {
      console.log(`  ${item.title}: ${item.duration}ms`);
    });
  });
}

function prepareOptions(argv) {
  let args = [];

  // default options for mocha
  args.push('--reporter', 'json');

  // pass grep option to mocha
  if (argv.grep) {
    args.push('--grep', argv.grep);
  }

  // non-hyphenated options
  args.push(argv._);

  return args;
}

// terminate children.
process.on('SIGINT', () => {
  proc.kill('SIGINT');
  proc.kill('SIGTERM');
});