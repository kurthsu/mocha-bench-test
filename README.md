# Mocha Bench Test

A tool for performing API benchmark testing with your [Mocha](https://mochajs.org/) test suite.

## Installation
mocha-bench-test requires node.js >= 8.

```sh
$ npm install -g mocha-bench-test
```

## Usage

```sh
$ bench -h
bench [options] path

Options:
  --version      Show version number                                   [boolean]
  -h             Show help                                             [boolean]
  -g, --grep     only run tests matching <pattern>                      [string]
  -t, --times    times for calling each test case          [number] [default: 1]
  -v, --verbose  display test pass result for each run[boolean] [default: false]
```

## Examples

* Run tests with 10 times for average
```sh
$ bench -t 10 js/sorting.js
bubble sort (runs: 10)
  min: 118ms, max: 125ms, average: 121.1ms
insertion sort (runs: 10)
  min: 46ms, max: 49ms, average: 47.4ms
```

* Run tests with verbose
```sh
$ bench -t 3 -v js/sorting.js
Run test #1 completed ...
  bubble sort: 118ms
  insertion sort: 48ms
Run test #2 completed ...
  bubble sort: 121ms
  insertion sort: 42ms
Run test #3 completed ...
  bubble sort: 118ms
  insertion sort: 48ms
-----------------------------------------------
bubble sort (runs: 3)
  min: 118ms, max: 121ms, average: 119ms
insertion sort (runs: 3)
  min: 42ms, max: 48ms, average: 46ms
```

* Run tests with matching pattern
```sh
$ bench -t 10 -g insertion js/sorting.js
insertion sort (runs: 10)
  min: 44ms, max: 47ms, average: 45.9ms
```
