# Repository Working Rules

This repository is a structured knowledge base for coding challenges.

When adding or solving a challenge, always create the self-contained challenge folder inside the correct platform directory:

```text
platforms/{platform}/{problem-id}-{kebab-case-title}/
+-- solution.{ext}            # recommended: fast + lean (runtime-first)
+-- solution-runtime.{ext}    # extreme: asymptotic speed / early-exit
+-- solution-memory.{ext}     # extreme: minimum memory
+-- notes.md
+-- complexity.md
`-- metadata.json
```

Never create challenge folders at the repository root, directly under `algorithms/`, or directly under `patterns/`.

Use the templates in `templates/challenge/` as the starting point.

Each challenge entry must include:

- **Three solution proposals**, each readable and in the language chosen by performance analysis for its goal:
  - `solution.{ext}` - the recommended default: the fastest runtime that still keeps memory low (runtime-first, memory-conscious).
  - `solution-runtime.{ext}` - the speed extreme: the asymptotically fastest / best constant-factor / early-exit approach, even at higher memory cost.
  - `solution-memory.{ext}` - the memory extreme: the absolute minimum memory footprint, even at some runtime cost.
  Proposals may use different languages. When proposals coincide (a Pareto-optimal problem where one solution is both fastest and leanest), ship only the recommended fast + lean `solution.{ext}` and say so in `notes.md` - do not add coincident `solution-runtime`/`solution-memory` files. Add a speed or memory extreme only when it is a genuinely different, non-dominated solution.
- Problem analysis, reasoning, and trade-off justification in `notes.md`.
- Explicit time and space complexity in `complexity.md`.
- Structured metadata in `metadata.json`, with `platform` matching the parent directory under `platforms/`.

Performance target:

Solve each challenge with the explicit goal of reaching the top 1% of accepted solutions for execution time and overall performance. Correctness is mandatory, but a merely accepted solution is not enough when a faster or more memory-efficient approach is available.

Supported platform directories currently include:

- `platforms/leetcode/`
- `platforms/hackerrank/`
- `platforms/codesignal/`
- `platforms/codewars/`

If a new platform is needed, create `platforms/{new-platform}/` first, then place the challenge inside it.

Choose each proposal's language by performance analysis for that proposal's goal. There is no default language, and the three proposals may use different languages.

Never state or imply that this repository requires C#, Java, Python, or any other specific language for every challenge. The repository has an allowed language set, not a default or mandatory language.

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

For each proposal, choose the most performant language among the allowed languages for that proposal's goal (raw speed, minimum memory, or the best balance). Base the decision on runtime constraints, memory constraints, expected input size, data structures, algorithmic operations, and platform execution characteristics.

Do not use a default language. Do not choose a language only because it is familiar, concise, or commonly used. If a platform restricts available languages, choose the most performant option within that restricted set.

Document each proposal's language and performance reason in `metadata.json` (the `variants[]` array) and `notes.md`. Each language reason must be based on the current problem's constraints and performance profile, never on a supposed repository-wide language requirement.

In `notes.md`, always explain how the solutions were derived:

- Restate the problem in plain language.
- Identify the constraints that shape the algorithms.
- Explain the key observations that lead to the approaches.
- Describe each proposal's approach step by step.
- Explain the optimizations used to target top 1% execution time and performance for each proposal.
- Compare the proposals and state the time-space trade-off between them.
- State why each proposal is the best fit for its objective.

Prefer clarity, traceability, and consistent naming over clever shortcuts.

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
