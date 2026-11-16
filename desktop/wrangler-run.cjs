// Runs Wrangler's CLI as the main module: `<exe> wrangler-run.cjs <cli.js> ...args`.
//
// Inside Electron (ELECTRON_RUN_AS_NODE), the CLI's argument parser treats the
// app as a bundled executable and keeps one argument too many, unless
// process.defaultApp is set. Marking it here makes Electron and Node parse the
// arguments the same way.
process.defaultApp = true;
process.argv.splice(1, 1);
require("node:module").runMain();
