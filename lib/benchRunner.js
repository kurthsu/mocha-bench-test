'use strict';
const spawn = require('child_process').spawn;
const fs = require('fs');
const xml2js = require('xml2js');
const Color = {
  green: 32,
  blue: 34,
  string: (str, c) => '\u001b[' + c + 'm' + str + '\u001b[0m'
}


class BenchRunner {
  constructor(args, times, verbose = false) {
    this.args = args;
    this.times = times;
    this.verbose = verbose;

    // set reporter as xjunit
    this.args.push('--reporter', 'xunit');
    this.args.push('--reporter-options', 'output=result.xml');
  }

  async run() {
    let results = [];
    for (let i=0; i<this.times; i++) {
      let result = await this.runTests();
      results.push(result);

      if (this.verbose) {
        console.log(Color.string(`Run test #${i+1} completed ...`,  Color.blue));
        result.forEach((testcase) => {
          console.log(`  ${testcase.$.classname} ${testcase.$.name}, ${testcase.$.time*1000}ms`);
        });
      }
    }
    return results;
  }

  async runTests() {
    const proc = spawn('mocha', this.args);  
    
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
        proc.on('exit', () => {
          try {
            let parser = new xml2js.Parser();
            fs.readFile('./result.xml', function(err, data) {
              parser.parseString(data, function (err, result) {
                resolve(result.testsuite.testcase);
              });
            });
          } catch(e) {
            console.error('parse xml report error', e);
          }
        });
      });
    }
  }

  average(results) {
    let benchResult = {};
    results.forEach((result) => {
      result.forEach((testcase) => {
        let keep = benchResult[testcase.$.name];
        let duration = testcase.$.time * 1000;
        if (!keep) {
          benchResult[testcase.$.name] = {
            count: 1, min: duration, max: duration,
            total: duration, average: 0
          };
        }
        else {
          keep.count += 1;
          keep.total += duration;
          if (duration < keep.min) {
            keep.min = duration;
          }
          if (duration > keep.max) {
            keep.max = duration;
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
      console.log(`${Color.string(key, Color.green)} (runs: ${benchResult[key].count})`);
      console.log(`  min: ${benchResult[key].min}ms, max: ${benchResult[key].max}ms, average: ${benchResult[key].average}ms`);
    });
  }
}

module.exports = BenchRunner;