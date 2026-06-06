#!/usr/bin/env node
/* Coding Challenges — manifest generator (Phase 2 automation).
 *
 * Walks platforms/<platform>/<ext>/<id>-<slug>/metadata.json and emits
 * platforms/manifest.json — the index the website reads at runtime.
 *
 * Usage:   node src/scripts/build-manifest.mjs
 * CI:      run on every push (GitHub Actions) before deploying Pages.
 *
 * No dependencies. Node 18+.
 */
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// This script lives at <repo>/src/scripts/build-manifest.mjs, so the repo
// root (where platforms/ lives) is two levels up.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PLATFORMS_DIR = join(ROOT, "platforms");

/* Display metadata per platform (edit to add platforms / branding). */
const PLATFORM_META = [
  { id: "leetcode",      name: "LeetCode",       abbr: "LC", color: "#f0972a", desc: "Interview-grade problem sets across data structures and algorithms." },
  { id: "hackerrank",    name: "HackerRank",     abbr: "HR", color: "#36b37e", desc: "Skill tracks, domain challenges and certification prep." },
  { id: "codewars",      name: "Codewars",       abbr: "KW", color: "#b1361e", desc: "Kata-based ranked practice with community solutions." },
  { id: "codesignal",    name: "CodeSignal",     abbr: "CS", color: "#1c2f6e", desc: "Assessment-style problems and arcade progressions." },
  { id: "algocademy",    name: "AlgoCademy",     abbr: "AC", color: "#6b4ee6", desc: "Guided algorithmic learning paths and reinforcement." },
  { id: "topcoder",      name: "TopCoder",       abbr: "TC", color: "#1f7ae0", desc: "Single-round-match competitive algorithm problems." },
  { id: "exercism",      name: "Exercism",       abbr: "EX", color: "#2e6c78", desc: "Mentored exercises with a focus on idiomatic code." },
  { id: "pramp",         name: "Pramp",          abbr: "PR", color: "#c0392b", desc: "Mock interview style problems and pairing drills." },
  { id: "interview-cake",name: "Interview Cake", abbr: "IC", color: "#e0517f", desc: "Pattern-first interview question walkthroughs." },
  { id: "codility",      name: "Codility",       abbr: "CO", color: "#2db3a6", desc: "Lesson-driven correctness and performance scoring." },
  { id: "stratascratch", name: "StrataScratch",  abbr: "SS", color: "#3b6fb0", desc: "Data & SQL challenges from real company datasets." },
  { id: "codechef",      name: "CodeChef",       abbr: "CC", color: "#7b5a3a", desc: "Competitive contests and structured practice ladders." },
  { id: "project-euler", name: "Project Euler",  abbr: "PE", color: "#4a5b6b", desc: "Mathematical and computational reasoning problems." },
];

async function exists(p) { try { await stat(p); return true; } catch { return false; } }

async function findMetadataFiles(dir) {
  const out = [];
  async function walk(d) {
    let entries = [];
    try { entries = await readdir(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = join(d, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.name === "metadata.json") out.push(full);
    }
  }
  await walk(dir);
  return out;
}

function toSummary(meta, relPath) {
  // pick the recommended variant's complexity if present
  const rec = (meta.variants || []).find((v) => /recommended/i.test(v.role)) || (meta.variants || [])[0] || {};
  return {
    id: String(meta.id),
    title: meta.title,
    slug: meta.slug,
    platform: meta.platform,
    language: meta.language,
    languageExt: meta.languageExt,
    difficulty: meta.difficulty,
    topics: meta.topics || [],
    patterns: meta.patterns || [],
    path: meta.platformPath || relPath,
    recommendedSolution: meta.recommendedSolution || rec.file || "solution.txt",
    dateSolved: meta.dateSolved || null,
    timeComplexity: meta.timeComplexity || rec.timeComplexity || null,
    spaceComplexity: meta.spaceComplexity || rec.spaceComplexity || null,
  };
}

async function main() {
  if (!(await exists(PLATFORMS_DIR))) {
    console.error("No platforms/ directory found.");
    process.exit(1);
  }
  const files = await findMetadataFiles(PLATFORMS_DIR);
  const challenges = [];
  for (const f of files) {
    try {
      const meta = JSON.parse(await readFile(f, "utf8"));
      const relPath = dirname(f).slice(ROOT.length + 1).replaceAll("\\", "/");
      challenges.push(toSummary(meta, relPath));
    } catch (e) {
      console.warn("Skipping", f, "-", e.message);
    }
  }
  // sort by platform then numeric/lexical id
  challenges.sort((a, b) =>
    a.platform.localeCompare(b.platform) ||
    (/^\d+$/.test(a.id) && /^\d+$/.test(b.id) ? +a.id - +b.id : a.id.localeCompare(b.id)));

  const manifest = {
    generated: new Date().toISOString().slice(0, 10),
    version: 1,
    platforms: PLATFORM_META,
    challenges,
  };
  const outPath = join(PLATFORMS_DIR, "manifest.json");
  await writeFile(outPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote ${outPath} — ${challenges.length} challenges from ${files.length} metadata files.`);
}

main();
