// CI smoke test: starts FOXSEO the same way the desktop app does (with plain
// Node instead of Electron), then checks that the pages and a real site audit
// work. Run from the desktop/ folder after `pnpm build` at the repo root.

const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");
const { startServer, stopServer } = require("./server.cjs");
const {
  createBackup,
  restoreBackup,
  defaultBackupName,
} = require("./backup.cjs");

const BASE = "http://127.0.0.1:3001";

async function main() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "foxseo-smoke-"));
  const server = await startServer({
    appDir: path.join(__dirname, ".."),
    dataDir,
    version: "smoke",
    nodePath: process.execPath,
    log: (line) => console.log("[server]", line),
  });
  try {
    await check("health", async () => {
      const health = await getJson("/api/health");
      assert(health.status === "ok", "health status is ok");
      assert(health.authMode === "local_noauth", "local mode");
    });
    await check("home page", async () => {
      const response = await fetch(BASE + "/");
      const html = await response.text();
      assert(response.ok, `home page answers (${response.status})`);
      assert(html.includes("FOXSEO"), "home page says FOXSEO");
    });
    await check("MCP tools", async () => {
      const result = await mcp("tools/list", {});
      assert(result.tools.length > 0, "MCP lists tools");
    });
    await check("site audit", runAudit);
  } finally {
    stopServer(server.process);
  }
  await check("backup and restore", async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const file = path.join(os.tmpdir(), defaultBackupName());
    createBackup(dataDir, file);
    assert(fs.statSync(file).size > 0, "backup file written");
    fs.writeFileSync(path.join(dataDir, "ayarlar.txt"), "changed");
    restoreBackup(dataDir, file);
    assert(
      fs.readFileSync(path.join(dataDir, "ayarlar.txt"), "utf8") !== "changed",
      "settings restored from backup",
    );
    assert(fs.existsSync(path.join(dataDir, "state")), "database restored");
  });
  console.log("\nAll smoke tests passed.");
}

async function runAudit() {
  const created = await mcpTool("create_project", {
    name: "Smoke test",
    domain: "example.com",
  });
  const projectId = findProjectId(created);
  assert(projectId, "project created");
  const started = await mcpTool("run_site_audit", {
    projectId,
    url: "https://example.com",
    maxPages: 10,
    runLighthouse: false,
  });
  const auditId = findValue(started, "auditId");
  assert(auditId, "audit started");
  const deadline = Date.now() + 5 * 60_000;
  while (Date.now() < deadline) {
    const status = await mcpTool("get_audit_status", { projectId, auditId });
    const state = findValue(status, "status");
    console.log("  audit status:", state);
    if (state === "completed") return;
    assert(state !== "failed", "audit did not fail");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error("audit did not finish within 5 minutes");
}

let mcpId = 0;
async function mcp(method, params) {
  const response = await fetch(BASE + "/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++mcpId, method, params }),
  });
  const text = await response.text();
  const json = JSON.parse(
    text.startsWith("{")
      ? text
      : text
          .split("\n")
          .find((l) => l.startsWith("data:"))
          .slice(5),
  );
  if (json.error) throw new Error(`${method}: ${JSON.stringify(json.error)}`);
  return json.result;
}

async function mcpTool(name, args) {
  const result = await mcp("tools/call", { name, arguments: args });
  if (result.isError) {
    throw new Error(`${name}: ${JSON.stringify(result.content)}`);
  }
  return result.structuredContent ?? JSON.parse(result.content[0].text);
}

function findProjectId(value) {
  return findValue(value, "projectId") ?? findValue(value, "id");
}

function findValue(value, key) {
  if (!value || typeof value !== "object") return undefined;
  if (key in value && typeof value[key] === "string") return value[key];
  for (const child of Object.values(value)) {
    const found = findValue(child, key);
    if (found) return found;
  }
  return undefined;
}

async function getJson(pathname) {
  const response = await fetch(BASE + pathname);
  return response.json();
}

async function check(name, fn) {
  process.stdout.write(`\n== ${name}\n`);
  await fn();
  console.log(`  ok: ${name}`);
}

function assert(condition, message) {
  if (!condition) throw new Error("Assertion failed: " + message);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
