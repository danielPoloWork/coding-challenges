#!/usr/bin/env node
/* One-shot script that updates all HTML pages to use production React builds
   and the precompiled .js outputs instead of babel + type="text/babel" JSX.
   Safe to re-run (idempotent). Used once during the migration; gen_indexes.py
   handles hash refreshes going forward (it already knows about the .js files). */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync } from "node:fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const REACT_PROD     = `<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" integrity="sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z" crossorigin="anonymous"></script>`;
const REACT_DOM_PROD = `<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" integrity="sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1" crossorigin="anonymous"></script>`;

function sha256short(path) {
  try {
    const h = createHash("sha256");
    h.update(readFileSync(path));
    return h.digest("hex").slice(0, 10);
  } catch { return "missing"; }
}

function patchHtml(htmlPath) {
  let src = readFileSync(htmlPath, "utf8");
  let s = src;

  // 1. swap react dev → production
  s = s.replace(/<script src="https:\/\/unpkg\.com\/react@18\.3\.1\/umd\/react\.development\.js"[^>]+><\/script>/, REACT_PROD);
  s = s.replace(/<script src="https:\/\/unpkg\.com\/react-dom@18\.3\.1\/umd\/react-dom\.development\.js"[^>]+><\/script>/, REACT_DOM_PROD);

  // 2. drop babel standalone line
  s = s.replace(/<script src="https:\/\/unpkg\.com\/@babel\/standalone[^>]+><\/script>\n?/, "");

  // 3. remap type="text/babel" src="foo.jsx?v=X" → plain script pointing at .js
  s = s.replace(/<script type="text\/babel" src="([^"]+)"><\/script>/g, (_, url) => {
    const pathNoQs = url.split("?")[0].replace(/\.jsx$/, ".js"); // e.g. src/assets/ui.js
    const diskPath = join(ROOT, pathNoQs);
    const hash = sha256short(diskPath);
    return `<script src="${pathNoQs}?v=${hash}"></script>`;
  });

  if (s !== src) {
    writeFileSync(htmlPath, s);
    return "updated";
  }
  return "unchanged";
}

const htmlFiles = [
  join(ROOT, "index.html"),
  ...readdirSync(join(ROOT, "src")).filter((f) => f.endsWith(".html")).map((f) => join(ROOT, "src", f)),
];

for (const f of htmlFiles.sort()) {
  const status = patchHtml(f);
  console.log(`${status}: ${relative(ROOT, f).replaceAll("\\", "/")}`);
}
