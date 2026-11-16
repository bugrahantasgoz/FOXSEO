// Starts the FOXSEO server on this computer. Used by the desktop app
// (main.cjs) and by the CI smoke test (smoke-test.cjs), so both run exactly
// the same steps.
//
// The server is the built FOXSEO Workers bundle run by Wrangler's local
// runtime (workerd). Nothing here talks to Cloudflare: --local keeps every
// binding (database, storage, workflows) in the data folder on this computer.

const { spawn, execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const PORT = 3001;
const HEALTH_URL = `http://127.0.0.1:${PORT}/api/health`;

const SETTINGS_TEMPLATE = `# FOXSEO ayarları
# Bu dosyayı değiştirdikten sonra FOXSEO menüsünden "Yeniden başlat" de.
# Anahtarların nasıl alınacağı: https://github.com/bugrahantasgoz/FOXSEO/blob/main/KURULUM.md

# Google PageSpeed (hız ölçümü)
PAGESPEED_API_KEY=

# Google Search Console ve Analytics
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Bing anahtar kelime ve backlink
BING_WEBMASTER_API_KEY=
`;

/**
 * @param {object} options
 * @param {string} options.appDir   folder holding dist/ and drizzle/ (read-only is fine)
 * @param {string} options.dataDir  writable folder for the database and settings
 * @param {string} options.version  app version, used to refresh the runtime copy
 * @param {string} options.nodePath executable that runs Wrangler as Node
 * @param {Record<string,string>} [options.extraEnv]
 * @param {(line: string) => void} [options.log]
 */
async function startServer(options) {
  const log = options.log ?? ((line) => console.log(line));
  fs.mkdirSync(options.dataDir, { recursive: true });

  if (await isHealthy()) {
    // Another FOXSEO (or an earlier run that did not shut down) already
    // serves this port. Reuse it rather than failing.
    log("FOXSEO is already running on port " + PORT);
    return { process: null, url: `http://localhost:${PORT}` };
  }

  const settingsFile = ensureSettings(options.dataDir);
  const runtimeDir = prepareRuntimeCopy(options);
  const stateDir = path.join(options.dataDir, "state");
  const env = {
    ...process.env,
    ...options.extraEnv,
    ELECTRON_RUN_AS_NODE: "1",
    CI: "true",
    WRANGLER_SEND_METRICS: "false",
    WRANGLER_LOG_PATH: path.join(options.dataDir, "logs"),
    WRANGLER_HIDE_BANNER: "true",
    FORCE_COLOR: "0",
  };
  // Electron rejects some Node options a system may set globally.
  if (process.versions.electron) delete env.NODE_OPTIONS;
  const serverConfig = path.join(runtimeDir, "dist", "server", "wrangler.json");
  const auditConfig = path.join(
    runtimeDir,
    "dist",
    "open_seo_audit",
    "wrangler.json",
  );

  log("Preparing database...");
  await run(
    options.nodePath,
    wranglerArgs([
      "d1",
      "migrations",
      "apply",
      "DB",
      "--local",
      "-c",
      serverConfig,
      "--persist-to",
      stateDir,
    ]),
    { cwd: runtimeDir, env },
    log,
  );

  log("Starting FOXSEO server...");
  const child = spawn(
    options.nodePath,
    wranglerArgs([
      "dev",
      "-c",
      serverConfig,
      "-c",
      auditConfig,
      "--local",
      "--ip",
      "127.0.0.1",
      "--port",
      String(PORT),
      "--persist-to",
      stateDir,
      "--env-file",
      path.join(runtimeDir, "base.env"),
      "--env-file",
      settingsFile,
      "--show-interactive-dev-session=false",
      "--live-reload=false",
    ]),
    { cwd: runtimeDir, env, windowsHide: true },
  );
  child.stdout.on("data", (chunk) => logLines(chunk, log));
  child.stderr.on("data", (chunk) => logLines(chunk, log));

  const exited = new Promise((resolve) => child.once("exit", resolve));
  const ready = await Promise.race([
    waitForHealth(180_000),
    exited.then((code) => {
      throw new Error(`FOXSEO server stopped during startup (exit ${code})`);
    }),
  ]);
  if (!ready) {
    stopServer(child);
    throw new Error("FOXSEO server did not answer within 3 minutes");
  }
  log("FOXSEO is ready on http://localhost:" + PORT);
  return { process: child, url: `http://localhost:${PORT}` };
}

// A .txt file, so Windows opens it in Notepad on a double click (it has no
// program for .env files). Version 0.1.0 used ayarlar.env; it is moved over.
function settingsPath(dataDir) {
  return path.join(dataDir, "ayarlar.txt");
}

function ensureSettings(dataDir) {
  const file = settingsPath(dataDir);
  const legacy = path.join(dataDir, "ayarlar.env");
  if (!fs.existsSync(file) && fs.existsSync(legacy)) {
    fs.renameSync(legacy, file);
  }
  if (!fs.existsSync(file)) fs.writeFileSync(file, SETTINGS_TEMPLATE, "utf8");
  return file;
}

// Wrangler writes temp files next to its config, and an installed app's
// folder is read-only, so the built app is copied into the data folder once
// per version.
function prepareRuntimeCopy(options) {
  const runtimeDir = path.join(options.dataDir, "runtime", options.version);
  const marker = path.join(runtimeDir, ".complete");
  if (!fs.existsSync(marker)) {
    fs.rmSync(runtimeDir, { recursive: true, force: true });
    fs.mkdirSync(runtimeDir, { recursive: true });
    fs.cpSync(
      path.join(options.appDir, "dist"),
      path.join(runtimeDir, "dist"),
      {
        recursive: true,
      },
    );
    fs.cpSync(
      path.join(options.appDir, "drizzle"),
      path.join(runtimeDir, "drizzle"),
      { recursive: true },
    );
    fs.writeFileSync(marker, new Date().toISOString());
  }
  // Fixed settings for the desktop edition; the user's ayarlar.txt is loaded
  // after this file and can add to it.
  fs.writeFileSync(
    path.join(runtimeDir, "base.env"),
    "AUTH_MODE=local_noauth\nBETTER_AUTH_SECRET=" +
      localSecret(options.dataDir) +
      "\n",
  );
  return runtimeDir;
}

// Encrypts stored Google tokens. Generated once per computer and kept in the
// data folder, so the user never has to make one up.
function localSecret(dataDir) {
  const file = path.join(dataDir, "secret.key");
  if (!fs.existsSync(file)) {
    fs.writeFileSync(
      file,
      require("node:crypto").randomBytes(32).toString("hex"),
    );
  }
  return fs.readFileSync(file, "utf8").trim();
}

function resolveWranglerCli() {
  const pkg = require.resolve("wrangler/package.json");
  return path.join(path.dirname(pkg), "wrangler-dist", "cli.js");
}

// Arguments that run Wrangler's CLI with `args` (see wrangler-run.cjs).
function wranglerArgs(args) {
  return [
    "--no-warnings",
    path.join(__dirname, "wrangler-run.cjs"),
    resolveWranglerCli(),
    ...args,
  ];
}

function run(command, args, spawnOptions, log) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...spawnOptions, windowsHide: true });
    child.stdout.on("data", (chunk) => logLines(chunk, log));
    child.stderr.on("data", (chunk) => logLines(chunk, log));
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`wrangler failed (exit ${code})`)),
    );
  });
}

function logLines(chunk, log) {
  for (const line of String(chunk).split(/\r?\n/)) {
    if (line.trim()) log(line);
  }
}

async function isHealthy() {
  try {
    const response = await fetch(HEALTH_URL, {
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForHealth(timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isHealthy()) return true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

/** Stops Wrangler and the workerd processes it started. */
function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === "win32") {
    try {
      execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true,
      });
    } catch {
      // Already gone.
    }
  } else {
    child.kill("SIGTERM");
  }
}

module.exports = { startServer, stopServer, ensureSettings, PORT };
