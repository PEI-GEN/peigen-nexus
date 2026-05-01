const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");
const configPath = path.join(publicDir, "config.json");

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(configPath, JSON.stringify({
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
}, null, 2), "utf8");

console.log(`Config written to ${configPath}`);
