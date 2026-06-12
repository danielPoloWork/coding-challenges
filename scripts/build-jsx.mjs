#!/usr/bin/env node
/* Coding Challenges — JSX precompiler.
 *
 * Compiles every src JSX source to a plain .js sibling so the website ships
 * without @babel/standalone (no in-browser compilation, no 2.9 MB runtime).
 * The .jsx files stay the source of truth; the .js outputs are committed and
 * served by GitHub Pages.
 *
 * Usage:   node scripts/build-jsx.mjs
 * Auto:    run by the pre-commit hook (scripts/hooks/pre-commit) and verified
 *          by the CI anti-drift guard (.github/workflows/validate.yml).
 *
 * Uses the vendored @babel/standalone (scripts/vendor/babel.min.js, same
 * 7.29.0 build the site used to load from unpkg — SRI-verified). Classic JSX
 * runtime (React.createElement), sourceType "script" so top-level const/let
 * keep the cross-script global-lexical sharing the babel-in-browser setup
 * relied on. Deterministic and idempotent: unchanged inputs leave outputs
 * byte-identical (files are only rewritten when content differs).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const Babel = require(join(ROOT, "scripts", "vendor", "babel.min.js"));

const sources = [
  join(ROOT, "src", "tweaks-panel.jsx"),
  ...readdirSync(join(ROOT, "src", "assets"))
    .filter((f) => f.endsWith(".jsx"))
    .sort()
    .map((f) => join(ROOT, "src", "assets", f)),
];

let built = 0, unchanged = 0;
for (const src of sources) {
  const rel = relative(ROOT, src).replaceAll("\\", "/");
  const code = readFileSync(src, "utf8");
  const out = Babel.transform(code, {
    presets: ["react"],
    sourceType: "script",
    compact: false,
    filename: basename(src),
  }).code;
  const banner = `/* GENERATED from ${rel} by scripts/build-jsx.mjs — edit the .jsx, not this file. */\n`;
  const dest = src.replace(/\.jsx$/, ".js");
  const next = banner + out + "\n";
  let prev = null;
  try { prev = readFileSync(dest, "utf8"); } catch {}
  if (prev === next) { unchanged++; continue; }
  writeFileSync(dest, next);
  built++;
}
console.log(`Compiled ${sources.length} JSX source(s): ${built} written, ${unchanged} unchanged.`);
