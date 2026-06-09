# Challenge Format Standard

This document defines the standard structure for every coding challenge stored in this repository.

The goal is to make each solution easy to read, compare, search, and process with future automation.

## Folder Naming

Every challenge must be stored under its source platform.

Use this full path convention (one folder per language used):

```text
platforms/{platform}/{ext}/{problem-id}-{kebab-case-title}/
```

`{ext}` is the language's file extension (e.g. `cpp`, `c`, `py`, `rs`, `go`, `js`, `ts`, `java`, `kt`). A challenge solved in more than one language has one such folder per language, cross-referenced (see Required Files).

Examples:

```text
platforms/leetcode/cpp/0001-two-sum/
platforms/leetcode/c/0001-two-sum/
platforms/hackerrank/cpp/balanced-brackets/
platforms/codewars/py/sum-of-intervals/
```

The challenge folder name itself uses this convention:

```text
{problem-id}-{kebab-case-title}
```

Examples:

```text
0001-two-sum
0238-product-of-array-except-self
```

If a platform does not provide a numeric problem id, use a stable kebab-case slug:

```text
balanced-brackets
sum-of-intervals
```

Do not create challenge folders at the repository root or in a domain/pattern folder — there are deliberately no `algorithms/` or `patterns/` directories (see *Placement Rules* below).

## Platform Placement

The platform directory is the canonical home of each challenge.

Supported platform directories:

```text
platforms/leetcode/
platforms/hackerrank/
platforms/codewars/
platforms/codesignal/
platforms/algocademy/
platforms/topcoder/
platforms/exercism/
platforms/pramp/
platforms/interview-cake/
platforms/codility/
platforms/stratascratch/
platforms/codechef/
platforms/project-euler/
```

If a challenge comes from a new platform, create a new kebab-case platform directory first:

```text
platforms/{new-platform}/
```

The `platform` field in `metadata.json` must match the platform directory (the grandparent of the challenge folder, above the language `{ext}` folder).

## Required Files

Each language folder (`platforms/{platform}/{ext}/{id}-{slug}/`) is self-contained and holds the proposals written in its language plus the three docs:

```text
solution.{ext}            # the recommended proposal, if it is in this language
solution-runtime.{ext}    # the speed-extreme proposal, if it is in this language
solution-memory.{ext}     # the memory-extreme proposal, if it is in this language
notes.md
complexity.md
metadata.json
```

A folder holds only its language's proposals. Example: if the recommended and speed proposals are C++ and the memory proposal is C, the `cpp/` folder holds `solution.cpp` + `solution-runtime.cpp` and the `c/` folder holds `solution-memory.c`; each folder's `metadata.json` lists its own `variants[]` and links the others via `crossReferences`.

## File Responsibilities

### Solution proposals (three required)

Every challenge ships **three** solution proposals, each in the language chosen by performance analysis for its specific goal:

- `solution.{ext}` - **Recommended (fast + lean).** The runtime-first default that still keeps memory low. This is the canonical answer.
- `solution-runtime.{ext}` - **Speed extreme.** The asymptotically fastest / best constant-factor / early-exit approach, accepted even if it costs more memory.
- `solution-memory.{ext}` - **Memory extreme.** The smallest possible memory footprint, accepted even if it costs some runtime.

Different proposals may use different languages (for example C++ for speed, C for minimum memory). Each proposal lives in the folder of its language - `platforms/{platform}/{ext}/{id}-{slug}/` - so proposals that share a language sit together and each folder cross-references the siblings via `crossReferences` in `metadata.json`. When proposals coincide (a Pareto-optimal problem where one solution is both fastest and leanest), ship only the recommended fast + lean solution and say so in `notes.md` - do not add coincident files. Add a speed extreme or memory extreme only when it is a genuinely different, non-dominated solution.

Each proposal should target the top 1% of accepted submissions for its objective.

The solutions should prioritize:

- Correctness
- Optimal or near-optimal asymptotic complexity
- Low constant factors
- Memory efficiency
- Readability
- Clear names
- Maintainable control flow
- Platform compatibility

## Performance Target

Every challenge must be solved with this goal:

```text
Reach the top 1% of accepted solutions for execution time and overall performance.
```

This means:

- Do not stop at the first accepted solution if a better-performing approach is available.
- Prefer optimal or near-optimal algorithms for the problem constraints.
- Minimize unnecessary allocations, repeated work, conversions, boxing, copying, and avoidable data structure overhead.
- Consider both asymptotic complexity and constant-factor performance.
- Keep correctness mandatory; performance must not rely on undefined behavior or invalid assumptions.

Document the top 1% performance strategy in `notes.md` and summarize it in `complexity.md`.

Reason about performance analytically; do not run benchmarks locally. But verify correctness locally: mirror each proposal's algorithm in a throwaway Python script and check it against a reference (brute force / library function) on edge cases plus randomized inputs (as done for 0217 and 0912), then delete the script. Performance is argued from the constraints and confirmed on the target platform's judge.

## Language Selection

The repository is language-agnostic, but each solution proposal must use one of the allowed languages below (the three proposals may use different languages).

There is no default language. The language for each proposal must be selected by performance analysis for that proposal's goal (the three proposals may use different languages).

Do not state or imply that the repository requires C#, Java, Python, or any other specific language for all challenges. The repository only defines an allowed language set.

Allowed languages:

- C++
- Java
- Python3
- Python
- JavaScript
- TypeScript
- C#
- C
- Go
- Kotlin
- Swift
- Rust
- Ruby
- PHP
- Dart
- Scala
- Elixir
- Erlang
- Racket

Language selection rule:

For each proposal, choose the most performant language among the allowed languages for that proposal's goal (raw speed, minimum memory, or the best balance). Base the decision on:

- Runtime constraints
- Memory constraints
- Expected input size
- Data structures required
- Algorithmic operations used
- Platform execution characteristics

Do not choose a language because it is familiar, concise, or generally convenient. If a platform restricts available languages, choose the most performant option within that restricted set.

Record each proposal's language in `metadata.json` (the `variants[]` array).
Explain the performance reason for each language choice in `notes.md`. The explanation must reference the problem constraints, runtime profile, memory profile, data structures, or platform execution characteristics. It must not cite a repository-wide language requirement.

For each proposal, also document the candidate-language comparison explicitly. Start from the allowed language set and the platform's supported languages. At minimum, address the practical systems-language candidates (`C++`, `C`, `Rust`, `Go`), managed-runtime candidates (`Java`, `C#`) when relevant, and interpreted/VM candidates (`Python`, `JavaScript`, `TypeScript`, `PHP`) when constraints or platform behavior could make them competitive. The notes must state:

- Candidate languages considered
- Chosen language
- Why the chosen language wins for that proposal's objective
- Why the main alternatives lose

### notes.md

Contains the reasoning process behind the solution.

Use it to document:

- Problem summary
- Constraints
- Key observations
- Step-by-step reasoning
- Final approach
- Why the approach is the best fit
- Top 1% performance strategy
- Relevant alternatives and trade-offs
- Edge cases

The notes must answer four questions:

1. Why was each proposal's language selected as the most performant option for its goal?
2. How were the solutions derived from the problem constraints?
3. Why is each proposal preferable to reasonable alternatives, and what is the time-space trade-off between them?
4. What specific choices target top 1% execution time and performance for each proposal?

### complexity.md

Contains explicit complexity analysis for each proposal.

Always include:

- Time complexity
- Space complexity
- Explanation of what each variable represents
- Top 1% performance strategy
- Optimization opportunities, if any

### metadata.json

Contains structured information for automation, statistics, and future reporting.

Metadata in each language folder should identify:

- Platform, difficulty, topics, patterns
- `language` and `languageExt` for this folder
- This folder's proposals as a `variants[]` array (role, file, language, language reason, language alternatives, approach justification, time/space complexity)
- `recommendedSolution`: the best file in this folder
- `challengeRecommended`: path to the challenge's overall recommended solution (may be in another language folder)
- `crossReferences`: the sibling proposals in other language folders (role, language, path, file)
- Solution reasoning summary and completion status

## Didactic Re-implementations

When a challenge that already exists is solved again, do it in a language not yet used for that challenge, as a didactic exercise:

- Create a new `platforms/{platform}/{ext}/{id}-{slug}/` folder for the new language, with `solution.{ext}`, `notes.md`, `complexity.md`, and `metadata.json`.
- In `notes.md`, state clearly that the implementation is **didactic** (for learning and language coverage), not a new performance champion.
- Reference the existing most-performant solutions per category - **global** (the recommended solution), **runtime** (the speed extreme), and **memory** (the memory extreme) - via `crossReferences` in `metadata.json` and links in the notes, so the didactic version can be compared against the best per axis.
- The didactic solution must be correct and idiomatic for its language; it is not required to match or beat the champions.

## Standard Answer Format

When documenting or discussing a solved challenge, use this structure:

```text
Outcome
Files
Platform Placement
The three proposals (recommended, speed extreme, memory extreme) with language and reason for each
Reasoning and the time-space trade-off between proposals
Why each approach is preferable
Top 1% Performance Strategy
Complexity
Verification
```

This keeps explanations consistent across problems and makes review easier.

## Placement Rules

Store each language's proposals in its language folder under the platform:

```text
platforms/{platform}/{ext}/{challenge-folder}/
```

A challenge surfaces as a domain or pattern reference through its `metadata.json` `topics` and `patterns` — there are no physical `algorithms/` or `patterns/` folders. Those classifications are aggregated by `scripts/gen_indexes.py` into the stats indices (`stats/index-topics.md`, `stats/index-patterns.md`) and by `src/scripts/build-manifest.mjs` into the web explorer (`topics.html`, `patterns.html`). Each challenge is filed once under its platform and reachable three ways — by platform, by domain, and by pattern — without duplicating the solution.
