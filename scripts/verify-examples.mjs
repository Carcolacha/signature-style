#!/usr/bin/env node
/**
 * verify-examples.mjs — THE EXAMPLES GATE (3.6.0).
 *
 * examples/ ships as REFERENCE CODE (excluded from the npm pack — the
 * files array never lists it; the pack stays EXACTLY 64), so its gate is
 * a syntax/compile gate, not a runtime one:
 *
 *   (ex1) PYTHON PRESENCE — `python3 --version` must exist; when it is
 *         absent the gate SKIPS GRACEFULLY with a documented skip line
 *         and a presence-check assertion in the message (a machine
 *         without python3 cannot break the release, but it says so).
 *   (ex2) SYNTAX — `python3 -m py_compile examples/fastapi-starter/
 *         main.py models.py database.py` must exit 0 — the three
 *         reference-backend files compile (imports are NOT executed:
 *         fastapi/uvicorn are intentionally not dev dependencies here).
 *   (ex3) PIN — requirements.txt declares EXACTLY the two sanctioned
 *         dependencies (fastapi, uvicorn), both pinned (==) — zero new
 *         python deps beyond the release constraint.
 *   (ex4) PACK PROOF — `npm pack --dry-run` lists ZERO files under
 *         examples/ — the starter never rides the published tarball.
 *
 * Exit 0 = all pass (or the documented skip); exit 1 = any failure.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const starterDir = resolve(root, "examples", "fastapi-starter");
const failures = [];

// ---- (ex1) python3 presence ---------------------------------------------------
let python3 = null;
try {
  python3 = execFileSync("python3", ["--version"], { encoding: "utf8" }).trim();
} catch {
  python3 = null;
}
if (python3 === null) {
  console.log("SKIP — python3 not on PATH; the examples syntax gate needs it (assertion: python3 presence REQUIRED for (ex2), gracefully skipped without it). Install python3 to run the full gate.");
  process.exit(0);
}
console.log(`python3 present: ${python3}`);

// ---- (ex2) the three files compile --------------------------------------------
const files = ["main.py", "models.py", "database.py"];
for (const file of files) {
  try {
    execFileSync("python3", ["-m", "py_compile", resolve(starterDir, file)], { encoding: "utf8" });
    console.log(`compile OK: examples/fastapi-starter/${file}`);
  } catch (error) {
    const detail = error.stderr ?? error.message ?? String(error);
    failures.push(`(ex2) examples/fastapi-starter/${file} does not compile — ${detail.split("\n").slice(-4).join(" ").slice(0, 300)}`);
  }
}

// ---- (ex3) the dependency pin ---------------------------------------------------
const requirements = readFileSync(resolve(starterDir, "requirements.txt"), "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line !== "" && !line.startsWith("#"));
const sanctioned = ["fastapi==", "uvicorn=="];
if (requirements.length !== sanctioned.length) {
  failures.push(`(ex3) requirements.txt must declare EXACTLY ${sanctioned.length} pinned deps (fastapi, uvicorn) — found ${requirements.length}: ${requirements.join(", ")}`);
}
for (const [index, prefix] of sanctioned.entries()) {
  const line = requirements[index] ?? "(missing)";
  if (!line.startsWith(prefix)) {
    failures.push(`(ex3) requirements.txt line ${index + 1} must pin ${prefix}* (exact == version) — found ${line}`);
  }
}

// ---- (ex4) pack proof -----------------------------------------------------------
try {
  const packOutput = execFileSync("npm", ["pack", "--dry-run"], { cwd: root, encoding: "utf8" });
  const examplesInPack = packOutput
    .split("\n")
    .filter((line) => /examples\//.test(line) && /Tarball|total files/.test(line) === false);
  if (examplesInPack.length > 0) {
    failures.push(`(ex4) the npm pack must NOT carry examples/ — found: ${examplesInPack.slice(0, 3).join("; ")}`);
  } else {
    const totalLine = packOutput.split("\n").find((line) => /total files/.test(line));
    console.log(`pack proof: zero examples/ files (${totalLine?.trim() ?? "pack listing clean"})`);
  }
} catch (error) {
  failures.push(`(ex4) npm pack --dry-run failed — ${(error.stderr ?? error.message ?? String(error)).split("\n").slice(-2).join(" ").slice(0, 200)}`);
}

console.log("");
if (failures.length > 0) {
  console.error("FAIL — examples gate");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS — examples gate: python3 present, fastapi-starter compiles (main/models/database via py_compile), requirements pinned to fastapi+uvicorn only, the npm pack carries zero examples/ files");
