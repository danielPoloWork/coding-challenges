# Notes - LeetCode 3563: Lexicographically Smallest String After Adjacent Removals (C memory proposal)

## Problem Summary

Given a lowercase string, remove any adjacent pair of circularly consecutive letters any
number of times. Return the lexicographically smallest string reachable after all chosen
removals.

This folder contains the memory-specialized implementation. The recommended and
runtime-extreme proposals are in C++.

## Proposal in This Folder (C)

- **Memory extreme (`solution-memory.c`):** fixed 64-bit masks for removable intervals and
  linked answer choices. It avoids intermediate answer strings and avoids the `O(n^2)`
  suffix comparison table used by the C++ runtime variant.

The trade-off is deliberate: suffix comparisons may walk linked choices, so this variant
can spend `O(n)` per candidate comparison, but it keeps the auxiliary memory footprint very
small.

## Language Choice (C)

Candidate languages considered:

- C++: excellent for the recommended and runtime variants, but standard strings, arrays,
  and optional comparison tables raise the memory constant compared with direct C arrays.
- C: selected because LeetCode string input is a `char*`, the result can be allocated once,
  and all DP state can be stored in fixed primitive arrays with no container overhead.
- Rust: strong memory control, but LeetCode string ownership and dense mutable tables add
  implementation overhead without lowering the asymptotic footprint.
- Go: slices are convenient, but the runtime and GC baseline are larger than C for the
  memory objective.
- Java / C#: primitive arrays are possible, but managed-runtime baseline memory and object
  metadata are higher than C.
- Python / JavaScript / TypeScript / PHP: object-heavy strings and arrays are unsuitable
  for the minimum-footprint target.

Chosen language:

- Selected: C.
- Why it wins for this proposal: it minimizes runtime/container baseline and keeps the
  implementation to fixed word masks, byte flags, integer links, and one output buffer.
- Why the main alternatives lose: none improves the memory order, and most add runtime,
  GC, object, or ownership overhead.

## Constraints

- `1 <= s.length <= 250`
- Lowercase English letters only.
- `a` and `z` are consecutive.

`int` indexes are sufficient. Four 64-bit words cover every interval endpoint bit because
`ceil(250 / 64) = 4`.

## Key Observations

- Removals form non-crossing pairs, because a pair can only meet after the substring
  between the two positions has vanished.
- A removable interval is either enclosed by a consecutive endpoint pair or split into two
  adjacent removable intervals.
- The first kept character from suffix `i` can be `s[j]` only if `s[i..j-1]` is removable.
- If the whole suffix is removable, the empty string is optimal.

## Final Approach

1. Build `removable[left][right]` by increasing even interval length.
2. Use fixed word intersections to test whether an interval can be split into two
   removable pieces.
3. Process suffixes from right to left.
4. For each suffix, either mark it empty if fully removable, or store the best kept index
   `j`.
5. Compare equal-leading-character candidates by walking their already computed linked
   suffix answers.
6. Allocate the final result once and follow links from position `0`.

## Why This Approach

It preserves the same correctness proof as the C++ versions while removing all
intermediate string storage. The price is slower candidate comparison in adversarial cases,
which is acceptable for the memory-specialized proposal at `n <= 250`.

## Top 1% Performance Strategy

- Use the same compact interval DP as the fast variants.
- Store interval rows in four 64-bit words.
- Avoid heap allocations during DP.
- Store only `empty[]` and `keep[]` for suffix answers.
- Allocate exactly one result buffer.

## Edge Cases

- Length one returns the original character.
- Fully removable strings return `""`.
- Circular pairs such as `"az"` and `"za"` are removable.
- Cases where deletion is lexicographically harmful are handled by optimizing the final
  string, not the deletion count.

## See Also

- Recommended C++ solution:
  `../../cpp/3563-lexicographically-smallest-string-after-adjacent-removals/solution.cpp`
- Runtime-extreme C++ solution:
  `../../cpp/3563-lexicographically-smallest-string-after-adjacent-removals/solution-runtime.cpp`
