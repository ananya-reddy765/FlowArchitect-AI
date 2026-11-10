import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// A plain JSON file stands in for a real database here so the whole auth
// flow runs with zero setup (no Mongo/Postgres to install first). Swapping
// this for Mongoose/Prisma later only means rewriting readUsers/writeUsers —
// nothing in auth.js needs to change.
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");
const USERS_FILE = join(DATA_DIR, "users.json");

function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(USERS_FILE)) writeFileSync(USERS_FILE, "[]", "utf-8");
}

export function readUsers() {
  ensureStore();
  return JSON.parse(readFileSync(USERS_FILE, "utf-8"));
}

export function writeUsers(users) {
  ensureStore();
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}
