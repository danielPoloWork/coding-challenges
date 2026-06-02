# Challenge Format Standard

This document defines the standard structure for every coding challenge stored in this repository.

The goal is to make each solution easy to read, compare, search, and process with future automation.

## Folder Naming

Every challenge must be stored under its source platform.

Use this full path convention:

```text
platforms/{platform}/{problem-id}-{kebab-case-title}/
```

Examples:

```text
platforms/leetcode/0001-two-sum/
platforms/hackerrank/balanced-brackets/
platforms/codewars/sum-of-intervals/
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

Do not create challenge folders at the repository root, directly under `algorithms/`, or directly under `patterns/`.

## Platform Placement

The platform directory is the canonical home of each challenge.

Supported platform directories:

```text
platforms/leetcode/
platforms/hackerrank/
platforms/codesignal/
platforms/codewars/
```

If a challenge comes from a new platform, create a new kebab-case platform directory first:

```text
platforms/{new-platform}/
```

The `platform` field in `metadata.json` must match the parent platform directory.

## Required Files

Each challenge folder must contain:

```text
solution.{ext}            # recommended: fast + lean (runtime-first)
solution-runtime.{ext}    # extreme: asymptotic speed / early-exit
solution-memory.{ext}     # extreme: minimum memory
notes.md
complexity.md
metadata.json
```

## File Responsibilities

### Solution proposals (three required)

Every challenge ships **three** solution proposals, each in the language chosen by performance analysis for its specific goal:

- `solution.{ext}` - **Recommended (fast + lean).** The runtime-first default that still keeps memory low. This is the canonical answer.
- `solution-runtime.{ext}` - **Speed extreme.** The asymptotically fastest / best constant-factor / early-exit approach, accepted even if it costs more memory.
- `solution-memory.{ext}` - **Memory extreme.** The smallest possible memory footprint, accepted even if it costs some runtime.

Different proposals may use different languages (for example C++ for speed, C for minimum memory). When proposals coincide (a Pareto-optimal problem where one solution is both fastest and leanest), ship only the recommended fast + lean `solution.{ext}` and say so in `notes.md` - do not add coincident `solution-runtime`/`solution-memory` files. Add a speed extreme or memory extreme only when it is a genuinely different, non-dominated solution.

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

Metadata should identify:

- Platform
- Difficulty
- Topics
- Patterns
- The three proposals as a `variants[]` array (role, file, language, language reason, approach justification, time/space complexity)
- Recommended solution file
- Solution reasoning summary
- Selected approach justification
- Completion status

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

Store each challenge in the platform directory:

```text
platforms/{platform}/{challenge-folder}/
```

When a challenge is also useful as a domain or pattern reference, cross-reference it from:

```text
algorithms/{domain}/
patterns/{pattern}/
```

Prefer cross-references or index files over duplicating the full solution in multiple places.
