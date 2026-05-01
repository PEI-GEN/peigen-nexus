const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "public");

function copyFile(relativePath) {
  const from = path.join(root, relativePath);
  const to = path.join(output, relativePath);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function copyDir(relativePath) {
  const from = path.join(root, relativePath);
  if (!fs.existsSync(from)) return;
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      copyDir(child);
    } else {
      copyFile(child);
    }
  }
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

copyFile("index.html");
copyFile("styles.css");
copyDir("assets");
copyDir("ico");

console.log(`Static files prepared in ${output}`);
