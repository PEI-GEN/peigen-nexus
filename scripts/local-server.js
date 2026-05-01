const http = require("http");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const dataFile = path.join(dataDir, "peigen-nexus-data.json");
const port = Number(process.env.PORT || 5173);

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

function ensureDataFile() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({ data: null }, null, 2), "utf8");
  }
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
  ensureDataFile();

  if (req.url === "/api/config" && req.method === "GET") {
    send(res, 200, JSON.stringify({
      supabaseUrl: process.env.SUPABASE_URL || "",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
    }));
    return;
  }

  if (req.url === "/api/state" && req.method === "GET") {
    send(res, 200, fs.readFileSync(dataFile, "utf8"));
    return;
  }

  if (req.url === "/api/state" && req.method === "POST") {
    const body = await readRequestBody(req);
    JSON.parse(body);
    fs.writeFileSync(dataFile, body, "utf8");
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
    fs.createReadStream(dataFile).pipe(res);
    return;
  }

  send(res, 404, JSON.stringify({ error: "Not found" }));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) {
      await handleApi(req, res);
      return;
    }
    serveFile(req, res);
  } catch (error) {
    console.error(error);
    send(res, 500, JSON.stringify({ error: "Server error" }));
  }
});

ensureDataFile();
server.listen(port, () => {
  console.log(`Peigen Nexus running at http://localhost:${port}`);
  console.log(`Data file: ${dataFile}`);
});
