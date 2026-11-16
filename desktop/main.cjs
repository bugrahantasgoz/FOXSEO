// FOXSEO desktop app: starts the local FOXSEO server and shows it in a
// window. Closing the window quits the app and stops the server.

const { app, BrowserWindow, Menu, shell, dialog } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { startServer, stopServer, ensureSettings } = require("./server.cjs");
const {
  autoBackup,
  backupExtension,
  createBackup,
  defaultBackupName,
  restoreBackup,
} = require("./backup.cjs");

const GUIDE_URL =
  "https://github.com/bugrahantasgoz/FOXSEO/blob/main/KURULUM.md";
const RELEASES_URL = "https://github.com/bugrahantasgoz/FOXSEO/releases";

let mainWindow = null;
let server = null;
let logStream = null;

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });
  app.whenReady().then(boot);
}

function dataDir() {
  return app.getPath("userData");
}

function log(line) {
  logStream?.write(`[${new Date().toISOString()}] ${line}\n`);
}

function appDir() {
  // Packaged: resources/foxseo. From a checkout: the repository root.
  return app.isPackaged
    ? path.join(process.resourcesPath, "foxseo")
    : path.join(__dirname, "..");
}

async function boot() {
  fs.mkdirSync(path.join(dataDir(), "logs"), { recursive: true });
  logStream = fs.createWriteStream(path.join(dataDir(), "logs", "foxseo.log"), {
    flags: "w",
  });
  buildMenu();
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "FOXSEO",
    icon: path.join(__dirname, "build", "icon.png"),
    backgroundColor: "#f6f3ff",
    show: false,
  });
  mainWindow.once("ready-to-show", () => mainWindow.show());
  keepExternalLinksInBrowser(mainWindow);
  await mainWindow.loadFile(path.join(__dirname, "loading.html"));
  runAutoBackup();
  await launchServer();
}

// --- Backups ---------------------------------------------------------------

function configFile() {
  return path.join(dataDir(), "masaustu-ayarlari.json");
}

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(configFile(), "utf8"));
  } catch {
    return {};
  }
}

function writeConfig(patch) {
  fs.writeFileSync(
    configFile(),
    JSON.stringify({ ...readConfig(), ...patch }, null, 2),
  );
}

// Runs before the server starts, so the database is not in use.
function runAutoBackup() {
  const folder = readConfig().autoBackupDir;
  if (!folder) return;
  try {
    const file = autoBackup(dataDir(), folder);
    if (file) log("Automatic backup: " + file);
  } catch (error) {
    log("Automatic backup failed: " + (error?.message ?? error));
  }
}

/** Stops the server, runs fn, then starts FOXSEO again. */
async function withServerStopped(fn) {
  stopServer(server?.process);
  server = null;
  await mainWindow.loadFile(path.join(__dirname, "loading.html"));
  await new Promise((resolve) => setTimeout(resolve, 2000));
  try {
    return await fn();
  } finally {
    await launchServer();
  }
}

async function backupNow() {
  const folder = readConfig().autoBackupDir ?? app.getPath("documents");
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "FOXSEO yedeğini kaydet",
    defaultPath: path.join(folder, defaultBackupName()),
    filters: [
      { name: "FOXSEO yedeği", extensions: [backupExtension.split(".").pop()] },
    ],
  });
  if (canceled || !filePath) return;
  try {
    await withServerStopped(() => createBackup(dataDir(), filePath));
    await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Yedek alındı",
      message: "FOXSEO yedeği kaydedildi.",
      detail:
        filePath +
        "\n\nBilgisayarın bozulursa FOXSEO'yu yeni bilgisayara kurup FOXSEO → Yedekten geri yükle ile bu dosyayı seç.",
    });
  } catch (error) {
    dialog.showErrorBox("Yedek alınamadı", String(error?.message ?? error));
  }
}

async function restoreNow() {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Geri yüklenecek FOXSEO yedeğini seç",
    properties: ["openFile"],
    filters: [{ name: "FOXSEO yedeği", extensions: ["zip", "gz"] }],
  });
  if (canceled || !filePaths[0]) return;
  const confirm = await dialog.showMessageBox(mainWindow, {
    type: "warning",
    title: "Yedekten geri yükle",
    message: "Şu anki FOXSEO verilerinin yerine yedektekiler gelecek.",
    detail:
      "Şu anki veriler silinmez, veri klasöründeki 'onceki-veri' klasörüne taşınır. Devam edilsin mi?",
    buttons: ["Geri yükle", "Vazgeç"],
    defaultId: 1,
    cancelId: 1,
  });
  if (confirm.response !== 0) return;
  try {
    await withServerStopped(() => restoreBackup(dataDir(), filePaths[0]));
    await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Geri yüklendi",
      message: "Yedek geri yüklendi.",
    });
  } catch (error) {
    dialog.showErrorBox("Geri yüklenemedi", String(error?.message ?? error));
  }
}

async function chooseAutoBackupFolder() {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Otomatik yedeklerin kaydedileceği klasörü seç",
    message:
      "Google Drive veya OneDrive klasörünü seçersen yedekler buluta da gider.",
    properties: ["openDirectory", "createDirectory"],
  });
  if (canceled || !filePaths[0]) return;
  writeConfig({ autoBackupDir: filePaths[0] });
  buildMenu();
  await dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "Otomatik yedek açık",
    message: "FOXSEO her gün ilk açılışta bu klasöre yedek alacak.",
    detail: filePaths[0] + "\n\nSon 10 yedek saklanır, eskileri silinir.",
  });
}

function stopAutoBackup() {
  writeConfig({ autoBackupDir: null });
  buildMenu();
}

// ---------------------------------------------------------------------------

async function launchServer() {
  try {
    server = await startServer({
      appDir: appDir(),
      dataDir: dataDir(),
      version: app.getVersion(),
      nodePath: process.execPath,
      log,
    });
    await mainWindow.loadURL(server.url);
    if (process.env.FOXSEO_SMOKE_SCREENSHOT) await smokeScreenshot();
  } catch (error) {
    log(String(error?.stack ?? error));
    const choice = await dialog.showMessageBox(mainWindow, {
      type: "error",
      title: "FOXSEO başlatılamadı",
      message: "FOXSEO başlatılamadı.",
      detail:
        `${error?.message ?? error}\n\n` +
        "Ayrıntılar kayıt dosyasında. Kayıt klasörünü açıp foxseo.log dosyasını gönderirsen sorunu bulabiliriz.",
      buttons: ["Tekrar dene", "Kayıt klasörünü aç", "Kapat"],
      defaultId: 0,
    });
    if (choice.response === 0) return restartServer();
    if (choice.response === 1) shell.openPath(path.join(dataDir(), "logs"));
    app.quit();
  }
}

// CI only: proves the installed app opens FOXSEO, then quits.
async function smokeScreenshot() {
  await new Promise((resolve) => setTimeout(resolve, 8000));
  const image = await mainWindow.webContents.capturePage();
  fs.writeFileSync(process.env.FOXSEO_SMOKE_SCREENSHOT, image.toPNG());
  log(
    "Smoke screenshot saved; page title: " + mainWindow.webContents.getTitle(),
  );
  app.quit();
}

async function restartServer() {
  stopServer(server?.process);
  server = null;
  await mainWindow.loadFile(path.join(__dirname, "loading.html"));
  await launchServer();
}

// Google refuses to sign in inside embedded app windows, so Google sign-in
// and every other outside link open in the normal browser. The sign-in
// returns to localhost:3001, which this same server handles.
function keepExternalLinksInBrowser(win) {
  const isLocal = (url) => {
    try {
      const { hostname, protocol } = new URL(url);
      return (
        protocol === "file:" ||
        hostname === "localhost" ||
        hostname === "127.0.0.1"
      );
    } catch {
      return false;
    }
  };
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isLocal(url)) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (isLocal(url)) return;
    event.preventDefault();
    shell.openExternal(url);
  });
}

// Opens the API key settings in Notepad on Windows (the file is plain text),
// or the system's default editor elsewhere.
function openSettings() {
  const file = ensureSettings(dataDir());
  if (process.platform === "win32") {
    const editor = spawn("notepad.exe", [file], {
      detached: true,
      stdio: "ignore",
    });
    editor.on("error", () => shell.openPath(file));
    editor.unref();
    return;
  }
  shell.openPath(file);
}

// FOXSEO-Guncelle.exe sits next to FOXSEO.exe in the install folder.
function runUpdater() {
  const updater = path.join(
    path.dirname(process.execPath),
    "FOXSEO-Guncelle.exe",
  );
  if (!app.isPackaged || !fs.existsSync(updater)) {
    shell.openExternal(RELEASES_URL);
    return;
  }
  spawn(updater, [], { detached: true, stdio: "ignore" }).unref();
}

function buildMenu() {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "FOXSEO",
        submenu: [
          {
            label: "Ayarlar (API anahtarları)",
            click: () => openSettings(),
          },
          { label: "Yeniden başlat", click: () => restartServer() },
          { type: "separator" },
          { label: "Yedek al…", click: () => backupNow() },
          { label: "Yedekten geri yükle…", click: () => restoreNow() },
          readConfig().autoBackupDir
            ? {
                label: "Otomatik yedeği kapat",
                click: () => stopAutoBackup(),
              }
            : {
                label: "Otomatik yedeği aç…",
                click: () => chooseAutoBackupFolder(),
              },
          { type: "separator" },
          {
            label: "Veri klasörünü aç",
            click: () => shell.openPath(dataDir()),
          },
          {
            label: "Kayıt klasörünü aç",
            click: () => shell.openPath(path.join(dataDir(), "logs")),
          },
          { type: "separator" },
          { role: "quit", label: "Çıkış" },
        ],
      },
      {
        label: "Görünüm",
        submenu: [
          { role: "reload", label: "Sayfayı yenile" },
          { role: "zoomIn", label: "Yakınlaştır" },
          { role: "zoomOut", label: "Uzaklaştır" },
          { role: "resetZoom", label: "Normal boyut" },
          { role: "togglefullscreen", label: "Tam ekran" },
          { role: "toggleDevTools", label: "Geliştirici araçları" },
        ],
      },
      {
        label: "Yardım",
        submenu: [
          {
            label: "Kurulum rehberi",
            click: () => shell.openExternal(GUIDE_URL),
          },
          {
            label: "Güncellemeleri denetle",
            click: () => runUpdater(),
          },
          {
            label: "Yeni sürümler",
            click: () => shell.openExternal(RELEASES_URL),
          },
          {
            label: `Hakkında (sürüm ${app.getVersion()})`,
            click: () =>
              dialog.showMessageBox(mainWindow, {
                title: "FOXSEO",
                message: `FOXSEO ${app.getVersion()}`,
                detail:
                  "Ücretsiz kişisel SEO aracı. OpenSEO (MIT lisansı) temel alınarak yapılmıştır.",
              }),
          },
        ],
      },
    ]),
  );
}

app.on("window-all-closed", () => app.quit());
app.on("will-quit", () => {
  stopServer(server?.process);
  logStream?.end();
});
