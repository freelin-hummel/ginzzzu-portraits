import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function chromiumExecutable() {
  for (const candidate of ["/snap/bin/chromium", "/usr/bin/chromium", "/usr/bin/google-chrome-stable"]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

test("emotion toolbar renders the final queued selection", (t) => {
  const chromium = chromiumExecutable();
  if (!chromium) t.skip("Chromium is not installed");

  const harness = pathToFileURL(path.join(repoRoot, "tests", "browser", "emotion-toolbar.html")).href;
  const args = [
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--allow-file-access-from-files",
    "--window-size=1280,800",
    "--dump-dom",
    harness
  ];

  const result = spawnSync(chromium, args, { cwd: repoRoot, encoding: "utf8", timeout: 30000 });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /data-status="pass"/);
});
