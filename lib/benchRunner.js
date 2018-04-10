'use strict';
const spawn = require('child_process').spawn;

class BenchRunner {
  constructor(args, times, verbose = false) {
    this.args = args;
    this.times = times;
    this.verbose = verbose;

    // set reporter as json
    this.args.push('--reporter', 'json');
  }

  async run() {
    let results = [];
    for (let i=0; i<this.times; i++) {
      let result = await this.runTests();
      results.push(result);

      if (this.verbose) {
        console.log(`Run test #${i+1} completed ...`);
        result.forEach((item) => {
          console.log(`  ${item.title}: ${item.duration}ms`);
        });
      }
    }
    return results;
  }

  async runTests() {
    const proc = spawn('mocha', this.args);
    let resultData = '';
  
    proc.stdout.on('data', (data) => { 
      resultData += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    return await procOnExit();

    // terminate children.
    process.on('SIGINT', () => {
      proc.kill('SIGINT');
      proc.kill('SIGTERM');
    });

    function procOnExit() {
      return new Promise(resolve => {
        proc.on('exit', () => resolve(JSON.parse(resultData).passes));
      });
    }
  }

  average(results) {
    let benchResult = {};
    results.forEach((result) => {
      result.forEach((item) => {
        let testCase = benchResult[item.title];
        if (!testCase) {
          benchResult[item.title] = {
            count: 1, min: item.duration, max: item.duration,
            total: item.duration, average: 0
          };
        }
        else {
          testCase.count += 1;
          testCase.total += item.duration;
          if (item.duration < testCase.min) {
            testCase.min = item.duration;
          }
          if (item.duration > testCase.max) {
            testCase.max = item.duration;
          }
        }
      });
    });

    Object.keys(benchResult).forEach((key) => {
      benchResult[key].average = benchResult[key].total / benchResult[key].count;
    });
    return benchResult;
  }

  printBenchResult(benchResult) {
    if (this.verbose) {
      console.log('-----------------------------------------------');
    }

    Object.keys(benchResult).forEach((key) => {
      console.log(`${color(key)} (runs: ${benchResult[key].count})`);
      console.log(`  min: ${benchResult[key].min}ms, max: ${benchResult[key].max}ms, average: ${benchResult[key].average}ms`);
    });
  }
}

function color(str) {
  return '\u001b[' + 32 + 'm' + str + '\u001b[0m';
}

module.exports = BenchRunner;