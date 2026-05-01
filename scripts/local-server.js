const http = require("http");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const dataFile = path.join(dataDir, "peigen-nexus-data.json");

function loadEnvFile() {
  const envPath = path.join(rootDir, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile();

const port = Number(process.env.PORT || 5173);
const dbName = process.env.MYSQL_DATABASE || "peigen_nexus";
let pool;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
};

function quoteIdentifier(name) {
  return `\`${String(name).replace(/`/g, "``")}\``;
}

function ensureDataFile() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({ data: null }, null, 2), "utf8");
  }
}

function readSeedPayload() {
  ensureDataFile();
  try {
    const payload = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    return payload && typeof payload === "object" ? payload : { data: null };
  } catch {
    return { data: null };
  }
}

async function initDatabase() {
  const baseConfig = {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4",
  };

  const bootstrap = await mysql.createConnection(baseConfig);
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(dbName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await bootstrap.end();

  pool = mysql.createPool({ ...baseConfig, database: dbName });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id VARCHAR(64) PRIMARY KEY,
      payload LONGTEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CHECK (JSON_VALID(payload))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const [rows] = await pool.query("SELECT id FROM app_state WHERE id = ?", ["default"]);
  if (!rows.length) {
    await saveStatePayload(readSeedPayload());
  }
}

async function loadStatePayload() {
  const [rows] = await pool.query("SELECT payload FROM app_state WHERE id = ?", ["default"]);
  if (!rows.length) return { data: null };
  return JSON.parse(rows[0].payload);
}

async function saveStatePayload(payload) {
  const serialized = JSON.stringify(payload, null, 2);
  JSON.parse(serialized);
  await pool.query(
    `INSERT INTO app_state (id, payload) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE payload = VALUES(payload), updated_at = CURRENT_TIMESTAMP`,
    ["default", serialized],
  );
}

function send(res, status, body, contentType = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function serveFile(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const requestedPath = path.normalize(path.join(rootDir, pathname));

  if (!requestedPath.startsWith(rootDir)) {
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  fs.readFile(requestedPath, (error, content) => {
    if (error) {
      send(res, 404, "Not found", "text/plain; charset=utf-8");
      return;
    }
    const type = mimeTypes[path.extname(requestedPath).toLowerCase()] || "application/octet-stream";
    send(res, 200, content, type);
  });
}

async function handleApi(req, res) {
  if (req.url === "/api/config" && req.method === "GET") {
    send(res, 200, JSON.stringify({ storage: "mysql" }));
    return;
  }

  if (req.url === "/config.json" && req.method === "GET") {
    send(res, 200, JSON.stringify({ storage: "mysql" }));
    return;
  }

  if (req.url === "/api/state" && req.method === "GET") {
    send(res, 200, JSON.stringify(await loadStatePayload()));
    return;
  }

  if (req.url === "/api/state" && req.method === "POST") {
    const payload = JSON.parse(await readRequestBody(req));
    await saveStatePayload(payload);
    send(res, 200, JSON.stringify({ ok: true }));
    return;
  }

  if (req.url === "/api/export" && req.method === "GET") {
    const filename = `peigen-nexus-data-${new Date().toISOString().slice(0, 10)}.json`;
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(await loadStatePayload(), null, 2));
    return;
  }

  send(res, 404, JSON.stringify({ error: "Not found" }));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/") || req.url === "/config.json") {
      await handleApi(req, res);
      return;
    }
    serveFile(req, res);
  } catch (error) {
    console.error(error);
    send(res, 500, JSON.stringify({ error: "Server error", message: error.message }));
  }
});

initDatabase()
  .then(() => {
    server.listen(port, () => {
      console.log(`Peigen Nexus running at http://localhost:${port}`);
      console.log(`MySQL database: ${dbName}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize MySQL storage.");
    console.error(error);
    process.exit(1);
  });
