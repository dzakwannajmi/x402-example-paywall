// Evidence only, on a pull request that is never merged. A step before the Wasit
// action writes `--require <this file>` into NODE_OPTIONS through GITHUB_ENV.
// Node loads this file in every later process that still has that NODE_OPTIONS:
// the marker below in a step's log shows the option reached it. The Wasit action
// sets NODE_OPTIONS empty in each of its steps, so none of them should print it.
process.stderr.write(`WASIT-PROBE: NODE_OPTIONS --require reached pid ${process.pid} (${process.argv[1] ?? "no script"})\n`);
