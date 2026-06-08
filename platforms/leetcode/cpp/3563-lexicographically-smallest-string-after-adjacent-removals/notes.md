# Notes - LeetCode 3563: Lexicographically Smallest String After Adjacent Removals (C++ proposals)

## Problem Summary

Given a lowercase string `s`, repeatedly remove adjacent pairs whose letters are consecutive
in the alphabet, with `a` and `z` also consecutive. After removals, the remaining characters
close the gap. Return the lexicographically smallest string reachable by any sequence of
such removals, including doing nothing.

The important subtlety is that a removal can expose characters that were not adjacent in
the original string. Therefore, the problem is not a local greedy deletion problem; it is an
interval DP problem.

## Proposals in This Folder (C++)

This folder holds the **recommended** and **runtime-extreme** proposals. The
minimum-footprint champion is implemented in C and linked in [See Also](#see-also).

- **Recommended (`solution.cpp`) - fast + lean:** bitset interval DP for removable
  substrings, followed by a suffix DP that stores the best resulting strings directly.
- **Speed extreme (`solution-runtime.cpp`):** fixed 64-bit masks for removable intervals,
  plus linked answer choices and an `O(1)` suffix-answer comparison table. This removes
  repeated candidate string allocation and repeated lexicographic scans.

The recommended solution is easier to audit and already very small for `n <= 250`. The
runtime variant spends an extra `O(n^2)` comparison table to reduce the answer-building
phase from cubic string work to quadratic linked-state work.

## Language Choice (per proposal)

### Recommended - `solution.cpp`

Candidate languages considered:

- C++: selected for native loops, compact bitsets, direct `string` comparisons, and mature
  LeetCode support for this exact signature.
- C: excellent for memory control, but less readable for the default proposal because it
  needs manual result allocation and custom lexicographic linked-state comparisons.
- Rust: native and safe, but interval bitsets plus linked lexical state are more verbose;
  LeetCode C++ has lower friction for top-percentile constants here.
- Go: compiled and simple, but slices and runtime baseline add overhead without improving
  the `n <= 250` DP structure.
- Java / C#: viable with `boolean` tables and strings, but object/runtime overhead is
  unnecessary for a small dense interval DP.
- Python / JavaScript / TypeScript / PHP: constraints are small enough for acceptance, but
  repeated interval and lexicographic DP loops are not ideal for a top 1% runtime target.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: it gives the best balance of simple implementation,
  low allocation overhead, and native bit operations.
- Why the main alternatives lose: C is less ergonomic for the balanced version; managed
  and interpreted runtimes add overhead without algorithmic benefit.

### Speed Extreme - `solution-runtime.cpp`

Candidate languages considered:

- C++: selected because fixed `uint64_t` masks, byte comparison tables, and direct
  character indexing compile to tight native code while keeping the LeetCode class
  signature simple.
- C: could match the bit operations, but manual output allocation and less ergonomic
  linked comparison bookkeeping do not improve raw speed enough to justify moving this
  runtime-oriented proposal out of C++.
- Rust: can express the same arrays, but bounds checks and ownership around dense mutable
  tables are less likely to beat the C++ hot path.
- Go: compiled, but bounds checks and runtime baseline work against the tight quadratic
  table-filling phase.
- Java / C#: primitive arrays can be fast after JIT warmup, but C++ avoids VM startup,
  GC metadata, and bounds-check overhead.
- Python / JavaScript / TypeScript / PHP: the runtime variant relies on low-level bit and
  byte tables; scripting runtimes are dominated for this objective.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: it exposes the fastest practical implementation of the
  interval bitmask DP and constant-time answer comparisons.
- Why the main alternatives lose: none offers lower constants for the dense table work on
  LeetCode while preserving the required string-returning interface as cleanly.

## Constraints

- `1 <= s.length <= 250`
- `s` contains only lowercase English letters.
- The alphabet is circular: `a` and `z` are consecutive.

Implications: `O(n^3)` is acceptable, but a top-tier solution should avoid exponential
search over removal orders and should use compact dense tables instead of heap-heavy state.

## Key Observations

- A fully removable substring corresponds to a non-crossing matching of positions, where
  each matched pair contains consecutive letters.
- A removable interval `s[l..r]` is true if:
  - `s[l]` and `s[r]` are consecutive and the inside `s[l+1..r-1]` is removable; or
  - it can be split into two adjacent removable intervals.
- Once removability is known, the first character of any final string from suffix `i` must
  be some `s[j]` where the skipped prefix `s[i..j-1]` is removable.
- If the whole suffix `s[i..n-1]` is removable, the best answer for that suffix is the
  empty string, because empty is lexicographically smaller than any non-empty string.

## Reasoning Process

A direct simulation would branch on every currently removable adjacent pair. Different
orders can expose different future pairs, so this state space is exponential.

The operation is still structured: when characters at positions `l` and `r` are eventually
removed together, everything between them must already have disappeared. That gives the
enclosing recurrence. If the leftmost character is paired with some interior position, the
interval decomposes into two independently removable adjacent blocks, giving the split
recurrence.

After computing removable intervals, building the answer becomes a shortest-path-like
suffix DP over choices of the next kept character:

```text
best[i] = min over j >= i where s[i..j-1] is removable of s[j] + best[j+1]
```

with the additional empty candidate when `s[i..n-1]` is removable.

## Final Approaches

### Recommended - `solution.cpp`

1. Use interval lengths from `2` to `n`, only even lengths.
2. Mark `removable[l][r]` when endpoints can enclose a removable inside.
3. Otherwise, check via bitset intersection whether some split point joins two removable
   intervals.
4. Compute `best[i]` from right to left as actual strings.
5. Return `best[0]`.

### Speed Extreme - `solution-runtime.cpp`

1. Store each row of the removable table in four 64-bit words.
2. Use word intersections for the split recurrence.
3. Store each suffix answer as either empty or `(kept index, next suffix position)`.
4. Maintain `less[a][b]`, a byte table saying whether `answer[a] < answer[b]`.
5. Compare two candidates with the same first character in `O(1)` via `less[j+1][k+1]`.
6. Reconstruct the final string by following linked choices from position `0`.

## Why These Approaches

The interval DP captures exactly what adjacent removals can do after gaps close, so it is
complete without simulating operation orders. The suffix DP then optimizes the final
string directly instead of maximizing the number of deletions, which matters in cases like
`"zdce"` where deleting `"dc"` produces `"ze"` but keeping everything gives the smaller
`"zdce"`.

The recommended version is the best default because it is compact, easy to reason about,
and comfortably fast at `n <= 250`. The runtime version is preferable when minimizing judge
time: it avoids candidate string construction and turns repeated suffix comparisons into
table lookups.

## Top 1% Performance Strategy

- Use interval DP instead of exponential removal-order search.
- Process only even-length intervals.
- Use bitset or fixed-word intersections for split detection.
- Keep all DP state in dense contiguous tables.
- In the runtime variant, compare linked suffix answers in `O(1)` and allocate only the
  final output string.
- Avoid hash maps, recursion over operation states, and substring materialization.

## Edge Cases

- Single character: no pair can be removed, so the input is returned.
- Entire string removable, such as `"bcda"`: return the empty string.
- Removing more characters is not always better, as shown by `"zdce"`.
- Circular adjacency: `a` with `z` and `z` with `a` are valid pairs.
- Odd-length intervals cannot be fully removed and are skipped by the interval DP.

## Alternatives

- Brute-force BFS over all strings after removals: correct for tiny inputs but exponential.
- Greedy remove the first or smallest adjacent pair: fails because a locally valid deletion
  can make the final string lexicographically worse.
- DP by maximum deletion count: insufficient because lexicographic order may prefer fewer
  deletions.
- CYK-style triple loop without bitsets: valid, but word intersections are simpler and
  faster at this fixed maximum length.

## See Also

Minimum-footprint champion (C, fixed masks plus linked suffix comparisons, no string table):
`../../c/3563-lexicographically-smallest-string-after-adjacent-removals/`.
