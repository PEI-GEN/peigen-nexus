const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
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
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      salt VARCHAR(64) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL DEFAULT 'default',
      payload LONGTEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_app_state_user_id (user_id),
      CHECK (JSON_VALID(payload))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await ensureColumn("app_state", "user_id", "VARCHAR(64) NOT NULL DEFAULT 'default'");

  const [rows] = await pool.query("SELECT id FROM app_state WHERE id = ?", ["default"]);
  if (!rows.length) {
    await saveStatePayload(readSeedPayload());
  }
}

async function ensureColumn(table, column, definition) {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [dbName, table, column],
  );
  if (!rows.length) {
    await pool.query(`ALTER TABLE ${quoteIdentifier(table)} ADD COLUMN ${quoteIdentifier(column)} ${definition}`);
  }
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return { salt, hash };
}

function makeToken(user) {
  return Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString("base64url");
}

function userFromToken(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    const parsed = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    if (!parsed.id || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function createUser(email, password) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail || !password || password.length < 6) {
    throw new Error("邮箱和至少 6 位密码必填");
  }
  const id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
  const { salt, hash } = hashPassword(password);
  await pool.query(
    "INSERT INTO users (id, email, password_hash, salt) VALUES (?, ?, ?, ?)",
    [id, normalizedEmail, hash, salt],
  );
  return { id, email: normalizedEmail };
}

async function verifyUser(email, password) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const [rows] = await pool.query("SELECT id, email, password_hash, salt FROM users WHERE email = ?", [normalizedEmail]);
  if (!rows.length) throw new Error("账号或密码错误");
  const user = rows[0];
  const { hash } = hashPassword(password, user.salt);
  if (hash !== user.password_hash) throw new Error("账号或密码错误");
  return { id: user.id, email: user.email };
}

async function loadStatePayload(userId = "default") {
  const [rows] = await pool.query("SELECT payload FROM app_state WHERE id = ?", [userId]);
  if (!rows.length) return { data: null };
  return JSON.parse(rows[0].payload);
}

async function saveStatePayload(payload, userId = "default") {
  const serialized = JSON.stringify(payload, null, 2);
  JSON.parse(serialized);
  await pool.query(
    `INSERT INTO app_state (id, user_id, payload) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE payload = VALUES(payload), user_id = VALUES(user_id), updated_at = CURRENT_TIMESTAMP`,
    [userId, userId, serialized],
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
  if (req.url === "/api/auth/register" && req.method === "POST") {
    try {
      const body = JSON.parse(await readRequestBody(req));
      const user = await createUser(body.email, body.password);
      await saveStatePayload(readSeedPayload(), user.id);
      send(res, 200, JSON.stringify({ user, token: makeToken(user) }));
    } catch (error) {
      const duplicate = error.code === "ER_DUP_ENTRY";
      send(res, duplicate ? 409 : 400, JSON.stringify({ error: duplicate ? "邮箱已注册" : error.message }));
    }
    return;
  }

  if (req.url === "/api/auth/login" && req.method === "POST") {
    try {
      const body = JSON.parse(await readRequestBody(req));
      const user = await verifyUser(body.email, body.password);
      send(res, 200, JSON.stringify({ user, token: makeToken(user) }));
    } catch (error) {
      send(res, 401, JSON.stringify({ error: error.message }));
    }
    return;
  }

  if (req.url === "/api/me" && req.method === "GET") {
    const user = userFromToken(req);
    if (!user) {
      send(res, 401, JSON.stringify({ error: "未登录" }));
      return;
    }
    send(res, 200, JSON.stringify({ user }));
    return;
  }

  if (req.url === "/api/config" && req.method === "GET") {
    send(res, 200, JSON.stringify({ storage: "mysql", auth: "local" }));
    return;
  }

  if (req.url === "/config.json" && req.method === "GET") {
    send(res, 200, JSON.stringify({ storage: "mysql", auth: "local" }));
    return;
  }

  if (req.url === "/api/state" && req.method === "GET") {
    const user = userFromToken(req);
    if (!user) {
      send(res, 401, JSON.stringify({ error: "未登录" }));
      return;
    }
    send(res, 200, JSON.stringify(await loadStatePayload(user.id)));
    return;
  }

  if (req.url === "/api/state" && req.method === "POST") {
    const user = userFromToken(req);
    if (!user) {
      send(res, 401, JSON.stringify({ error: "未登录" }));
      return;
    }
    const payload = JSON.parse(await readRequestBody(req));
    await saveStatePayload(payload, user.id);
    send(res, 200, JSON.stringify({ ok: true }));
    return;
  }

  if (req.url === "/api/export" && req.method === "GET") {
    const user = userFromToken(req);
    if (!user) {
      send(res, 401, JSON.stringify({ error: "未登录" }));
      return;
    }
    const filename = `peigen-nexus-data-${new Date().toISOString().slice(0, 10)}.json`;
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(await loadStatePayload(user.id), null, 2));
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
