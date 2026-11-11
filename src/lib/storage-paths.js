import fsSync from "fs";
import fs from "fs/promises";
import os from "os";
import path from "path";

export const SEED_DATA_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
export const TMP_DATA_DIR = path.join(/*turbopackIgnore: true*/ os.tmpdir(), "rti-connect-data");

let cachedWritableDir = null;

/**
 * Resolve a writable directory for JSON persistence and uploads.
 * Prefers `process.cwd()/data` locally and falls back to `os.tmpdir()`
 * on read-only serverless filesystems such as Vercel (`/var/task`).
 */
export function getWritableDataDir() {
  if (cachedWritableDir) {
    return cachedWritableDir;
  }

  if (process.env.VERCEL === "1" || process.env.VERCEL === "true") {
    cachedWritableDir = TMP_DATA_DIR;
    return cachedWritableDir;
  }

  try {
    fsSync.mkdirSync(SEED_DATA_DIR, { recursive: true });
    fsSync.accessSync(SEED_DATA_DIR, fsSync.constants.W_OK);
    cachedWritableDir = SEED_DATA_DIR;
  } catch {
    cachedWritableDir = TMP_DATA_DIR;
  }

  return cachedWritableDir;
}

/**
 * Ensure a writable subdirectory inside the resolved data directory exists.
 */
export async function ensureWritableSubdir(sub) {
  const dir = path.join(/*turbopackIgnore: true*/ getWritableDataDir(), sub);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}
