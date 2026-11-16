// FOXSEO backups: one archive with everything needed to move FOXSEO to a new
// computer — the database and stored files (state/), the API key settings
// (ayarlar.txt) and the key that decrypts stored Google connections
// (secret.key). Logs and the copied app runtime are left out.
//
// Archives are made with the tar that ships with Windows 10 and later (it
// writes .zip with -a), so no extra program is needed. Elsewhere .tar.gz is
// used.

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const ITEMS = ["state", "ayarlar.txt", "secret.key"];
const AUTO_PREFIX = "FOXSEO-otomatik-yedek-";
const AUTO_KEEP = 10;
const AUTO_INTERVAL_MS = 24 * 60 * 60 * 1000;
const isWindows = process.platform === "win32";
const extension = isWindows ? ".zip" : ".tar.gz";

function stamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}`;
}

function defaultBackupName() {
  return `FOXSEO-yedek-${stamp()}${extension}`;
}

/** Writes a backup archive of dataDir to file. Run with the server stopped. */
function createBackup(dataDir, file) {
  const present = ITEMS.filter((item) =>
    fs.existsSync(path.join(dataDir, item)),
  );
  if (!present.includes("state")) {
    throw new Error("Yedeklenecek veri bulunamadı.");
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // The temp name keeps the real extension: with -a, Windows tar picks the
  // archive format (zip) from it.
  const tmp = path.join(path.dirname(file), `.tmp-${path.basename(file)}`);
  fs.rmSync(tmp, { force: true });
  const flags = isWindows ? ["-a", "-cf"] : ["-czf"];
  execFileSync("tar", [...flags, tmp, "-C", dataDir, ...present], {
    windowsHide: true,
    stdio: "ignore",
  });
  fs.renameSync(tmp, file);
  return file;
}

/**
 * Replaces the data in dataDir with a backup. Run with the server stopped.
 * The current data is kept next to it (…-onceki) until the next restore.
 */
function restoreBackup(dataDir, file) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "foxseo-restore-"));
  try {
    execFileSync("tar", ["-xf", file, "-C", work], {
      windowsHide: true,
      stdio: "ignore",
    });
    if (!fs.existsSync(path.join(work, "state"))) {
      throw new Error("Bu dosya bir FOXSEO yedeği değil.");
    }
    const previous = path.join(dataDir, "onceki-veri");
    fs.rmSync(previous, { recursive: true, force: true });
    fs.mkdirSync(previous, { recursive: true });
    for (const item of ITEMS) {
      const current = path.join(dataDir, item);
      if (fs.existsSync(current))
        fs.renameSync(current, path.join(previous, item));
      const restored = path.join(work, item);
      if (fs.existsSync(restored))
        fs.cpSync(restored, current, { recursive: true });
    }
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

/**
 * Daily automatic backup into folder, keeping the newest AUTO_KEEP. Returns
 * the new file, or null when the last one is less than a day old.
 */
function autoBackup(dataDir, folder, now = new Date()) {
  fs.mkdirSync(folder, { recursive: true });
  const existing = fs
    .readdirSync(folder)
    .filter((name) => name.startsWith(AUTO_PREFIX) && name.endsWith(extension))
    .sort();
  const newest = existing.at(-1);
  if (newest) {
    const age = now.getTime() - fs.statSync(path.join(folder, newest)).mtimeMs;
    if (age < AUTO_INTERVAL_MS) return null;
  }
  const file = path.join(folder, `${AUTO_PREFIX}${stamp(now)}${extension}`);
  createBackup(dataDir, file);
  const all = [...existing, path.basename(file)].sort();
  for (const old of all.slice(0, Math.max(0, all.length - AUTO_KEEP))) {
    fs.rmSync(path.join(folder, old), { force: true });
  }
  return file;
}

module.exports = {
  createBackup,
  restoreBackup,
  autoBackup,
  defaultBackupName,
  backupExtension: extension,
};
