#!/usr/bin/env node
const argv = require('yargs')
  .usage('bench [options]')
  .help('h').alias('h', 'help')
  .demand('g').alias('g', 'grep')
  .describe('g', 'only run tests matching <pattern>')
  .nargs('g', 1)
  .argv;
console.log(argv);
  