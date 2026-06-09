# Repository Working Rules

This repository is a structured knowledge base for coding challenges.

When adding or solving a challenge, always create the self-contained challenge folder inside the correct platform directory:

```text
platforms/{platform}/{ext}/{problem-id}-{kebab-case-title}/
+-- solution.{ext}            # recommended proposal, if in this language
+-- solution-runtime.{ext}    # speed extreme, if in this language
+-- solution-memory.{ext}     # memory extreme, if in this language
+-- notes.md
+-- complexity.md
`-- metadata.json
```

`{ext}` is the language extension (`cpp`, `c`, `py`, `rs`, `go`, ...). Use one folder per language; each holds only its language's proposals and cross-references the siblings.

Never create challenge folders at the repository root, directly under `algorithms/`, or directly under `patterns/`.

Use the templates in `templates/challenge/` as the starting point.

Each challenge entry must include:

- **Three solution proposals**, each readable and in the language chosen by performance analysis for its goal:
  - `solution.{ext}` - the recommended default: the fastest runtime that still keeps memory low (runtime-first, memory-conscious).
  - `solution-runtime.{ext}` - the speed extreme: the asymptotically fastest / best constant-factor / early-exit approach, even at higher memory cost.
  - `solution-memory.{ext}` - the memory extreme: the absolute minimum memory footprint, even at some runtime cost.
  Proposals may use different languages, and each lives in its language folder `platforms/{platform}/{ext}/{id}-{slug}/` (proposals sharing a language sit together; each folder cross-references the siblings via `crossReferences` in `metadata.json`). When proposals coincide (a Pareto-optimal problem where one solution is both fastest and leanest), ship only the recommended fast + lean solution and say so in `notes.md` - do not add coincident files. Add a speed or memory extreme only when it is a genuinely different, non-dominated solution.
- Problem analysis, reasoning, and trade-off justification in `notes.md`.
- Explicit time and space complexity in `complexity.md`.
- Structured metadata in `metadata.json`, with `platform` matching the platform directory under `platforms/` (the grandparent of the challenge folder, above the language `{ext}` folder), plus `languageExt`, `challengeRecommended`, and `crossReferences`.

Performance target:

Solve each challenge with the explicit goal of reaching the top 1% of accepted solutions for execution time and overall performance. Correctness is mandatory, but a merely accepted solution is not enough when a faster or more memory-efficient approach is available.

Supported platform directories (see `platforms/README.md` for the catalog):

- `platforms/algocademy/`
- `platforms/checkio/`
- `platforms/codechef/`
- `platforms/codesignal/`
- `platforms/codewars/`
- `platforms/codility/`
- `platforms/coding-games/`
- `platforms/exercism/`
- `platforms/hackerrank/`
- `platforms/interview-cake/`
- `platforms/leetcode/`
- `platforms/master-coding/`
- `platforms/pramp/`
- `platforms/project-euler/`
- `platforms/stratascratch/`
- `platforms/topcoder/`

If a new platform is needed, create `platforms/{new-platform}/` first, then place the challenge inside it.

Choose each proposal's language by performance analysis for that proposal's goal. There is no default language, and the three proposals may use different languages.

Reason about language and performance; do not run benchmarks locally. Language choice and complexity/performance are argued analytically from the problem constraints (the local benchmark tooling was removed). However, DO verify correctness locally: for each proposal, write a throwaway Python script that faithfully mirrors the algorithm and compare it against a reference (brute force / library function) on edge cases plus randomized stress, as done for 0217 and 0912; then remove the temporary script. No compiler invocations are needed - the Python mirror checks the algorithm, and the platform's judge gives the final confirmation.

Never state or imply that this repository requires C#, Java, Python, or any other specific language for every challenge. The repository has an allowed language set, not a default or mandatory language.

Allowed languages:

- C
- C#
- C++
- Css
- Go
- Html
- Java
- JavaScript
- Json
- PHP
- Python
- Python3
- Rust
- SQL
- Shell
- TypeScript
- Unity
- Yaml

Language selection rule:

For each proposal, choose the most performant language among the allowed languages for that proposal's goal (raw speed, minimum memory, or the best balance). Base the decision on runtime constraints, memory constraints, expected input size, data structures, algorithmic operations, and platform execution characteristics.

Do not use a default language. Do not choose a language only because it is familiar, concise, or commonly used. If a platform restricts available languages, choose the most performant option within that restricted set.

Document each proposal's language and performance reason in `metadata.json` (the `variants[]` array) and `notes.md`. Each language reason must be based on the current problem's constraints and performance profile, never on a supposed repository-wide language requirement.

Keep the language evaluation explicit for every proposal. In `notes.md`, list the candidate languages considered and state why the selected language wins for that proposal's objective, plus why the main alternatives lose. Start from the allowed language set and the platform's supported languages; at minimum, evaluate the practical systems-language candidates (`C++`, `C`, `Rust`, `Go`), managed-runtime candidates (`Java`, `C#`) when the platform/runtime makes them relevant, and interpreted/VM candidates (`Python`, `JavaScript`, `TypeScript`, `PHP`) when constraints or platform characteristics could favor them. Mirror the same decision in `metadata.json` with structured alternatives so future checks can verify that the comparison was not skipped.

In `notes.md`, always explain how the solutions were derived:

- Restate the problem in plain language.
- Identify the constraints that shape the algorithms.
- Explain the key observations that lead to the approaches.
- Describe each proposal's approach step by step.
- Explain the optimizations used to target top 1% execution time and performance for each proposal.
- Compare the proposals and state the time-space trade-off between them.
- State why each proposal is the best fit for its objective.

Re-solving an existing challenge (didactic):

If a challenge already exists and is proposed again, solve it in a language not yet used for that challenge, as a didactic exercise. Add a new `platforms/{platform}/{ext}/{id}-{slug}/` folder for that language with `solution.{ext}` plus its docs. In `notes.md`, state explicitly that the implementation is didactic (for learning and language coverage, not a new performance champion), and reference the existing performant solutions per category - global (the recommended solution), runtime (the speed extreme), and memory (the memory extreme) - via `crossReferences` in `metadata.json` and links in the notes, so readers can compare against the most performant solution for each axis. The didactic entry must be correct and idiomatic, but is not expected to beat the champions.

Prefer clarity, traceability, and consistent naming over clever shortcuts.

## Pattern vocabulary (open registry)

`metadata.json` carries two classification axes: `topics` (broad algorithmic
domains — Array, Dynamic Programming, Math …) and `patterns` (the finer reusable
techniques). The pattern set is an **open, growing vocabulary**, not a fixed
taxonomy: solving new problems legitimately introduces new techniques. The goal
is consistency, not closure — the *same* technique must always get the *same*
label so that, as volume grows, recurring techniques accumulate into a real
lens instead of fragmenting into synonyms.

Rules when assigning `patterns`:

- **Naming convention:** lowercase `kebab-case`, hyphens not spaces
  (`coordinate-compression`, not `Coordinate Compression`). The generators
  normalize whitespace and case mechanically, but write labels in this form so
  the source metadata reads consistently.
- **Check before coining:** before inventing a new pattern label, scan the
  existing ones in `stats/index-patterns.md`. If your technique is the same as
  an existing label, reuse that label verbatim. Coin a new label only for a
  genuinely new technique.
- **Record true synonyms, don't merge distinct techniques:** when two labels
  turn out to name the same technique, add `synonym -> canonical` to
  `scripts/pattern-aliases.json` (the open registry). Do **not** collapse
  genuinely different fine-grained techniques (e.g. the various `*-dp` or
  `*-greedy` variants) into one super-label — distinct techniques stay distinct
  and roll up under their shared `topic`.
- Both `scripts/gen_indexes.py` and `src/scripts/build-manifest.mjs` read the
  registry and apply the same normalization, so the stats indices and the
  website always agree on the canonical label.

## Index maintenance

Generated index files under `stats/` summarize the knowledge base and must stay in sync with the solutions:

- `stats/index-overview.md` - global totals: challenges solved, source platforms, languages used, and catalogued patterns (counted as distinct topics across all platforms and languages).
- `stats/index-{platform}.md` - per platform: total challenges solved, plus breakdowns per difficulty, per language, and per type (topic). One file per platform that has at least one solution.

A challenge is one distinct `(platform, id)`; multi-language challenges count once everywhere except the per-language breakdown, where each language solution counts once.

These files are produced by `scripts/gen_indexes.py`, which scans `platforms/**/metadata.json`. Never edit the generated index files by hand.

Mandatory commit rule for every agent:

- Every agent or tool that creates a commit in this repository must ensure `stats/*.md` is current before the commit is finalized.
- Keep `git config core.hooksPath scripts/hooks` enabled in this clone. The versioned `scripts/hooks/pre-commit` hook is the canonical enforcement point: it regenerates `stats/*.md` and stages `stats/` automatically on every `git commit`.
- Do not bypass the hook with `--no-verify` unless the user explicitly asks for it. If hook configuration is uncertain, run `python scripts/gen_indexes.py` manually and stage `stats/` before committing.
- A failure to regenerate the stats indexes is a commit blocker, not a warning to ignore.

After adding, re-solving, or changing any challenge (any platform, any language), regenerate the indexes before committing:

```bash
python scripts/gen_indexes.py
```

A versioned pre-commit hook runs this automatically and stages the result, so the indexes are always committed together with the solution. Enable or verify it once per clone:

```bash
git config core.hooksPath scripts/hooks
```

The generator is deterministic: running it with no metadata changes leaves the files untouched.

When replying about a solved challenge, use this response structure:

1. Brief outcome.
2. Files created or changed.
3. Platform placement.
4. The three proposals (recommended, speed extreme, memory extreme), with the language and reason for each.
5. Core reasoning and approach, including the time-space trade-off between the proposals.
6. Why this approach is preferable.
7. Top 1% performance strategy.
8. Complexity.
9. Verification status.
