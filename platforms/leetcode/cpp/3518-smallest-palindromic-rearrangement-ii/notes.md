# Notes - LeetCode 3518: Smallest Palindromic Rearrangement II (C++ proposals)

## Problem Summary

Given a string `s` that is already a palindrome and an integer `k`, return the `k`-th
lexicographically smallest distinct palindromic rearrangement of `s`. If fewer than `k`
distinct palindromic rearrangements exist, return the empty string.

## Proposals in This Folder (C++)

- **Recommended (`solution.cpp`) - fast + lean:** build the left half greedily. For each
  candidate character, count the remaining multiset permutations with a compact capped
  binomial table. It is straightforward, deterministic, and uses under a megabyte of
  combinatorics storage at the maximum input size.
- **Speed extreme (`solution-runtime.cpp`):** compute one exact-enough multinomial total
  per position and derive each character block as `total * count[c] / remaining`. This
  removes the repeated "try character then recount" work from the recommended variant.
- **Memory extreme (`solution-memory.cpp`):** use the same block-size greedy as the runtime
  variant, but compute capped binomial coefficients on demand instead of storing a table.
  This minimizes auxiliary memory at the cost of more arithmetic.

## Language Choice (C++)

C++ is the best fit for all three objectives. The problem has `n <= 1e4`, a fixed alphabet
of 26 letters, and `k <= 1e6`; the winning implementation is mostly tight integer
combinatorics with early saturation. C++ gives low-overhead arrays, inlined arithmetic,
cheap string construction, and no interpreter or garbage-collector cost. Higher-level
runtimes can pass, but C++ is more likely to reach top-percentile judge time for repeated
multinomial counts.

## Constraints

- `1 <= s.length <= 1e4`
- `s` contains only lowercase English letters.
- `s` is guaranteed to be palindromic, so at most one character has odd frequency.
- `1 <= k <= 1e6`
- Only `floor(n / 2)` characters need to be arranged; the rest are forced by symmetry.

## Key Observations

- A palindromic permutation is uniquely determined by its left half and optional middle
  character.
- Lexicographic order of the full palindrome is the same as lexicographic order of the
  left half, because the first differing position lies before the middle.
- The number of left-half arrangements for counts `c1..c26` is a multinomial:
  `m! / (c1! * c2! * ... * c26!)`.
- Counts only need to be known up to the current comparison threshold. Once the value
  reaches `k`, or `k * remaining` in the runtime variant, larger exact values do not change
  the greedy decision.
- For the runtime and memory variants, if the current multiset has `remaining = L` and
  total count `P`, then fixing character `c` leaves `P * count[c] / L` permutations.

## Reasoning Process

The brute-force approach would generate every distinct half permutation, mirror it into a
palindrome, sort the results, and pick the `k`-th. This is impossible even for moderate
inputs because the number of permutations grows factorially.

The constraints point to the standard `k`-th permutation pattern for a multiset. At each
left-half position, try letters in increasing order. For a tentative letter, count how many
valid completions exist. If that count is at least `k`, the answer must start with that
letter. Otherwise all those completions come before the desired answer, so subtract their
count from `k` and try the next letter.

The hard part is counting without overflow. Since `k <= 1e6`, we saturate combinatorial
values above the needed threshold. A small binomial table is enough for the performance
variants: for `n <= 5000`, any `C(n, r)` with `min(r, n-r) > 32` is already far above the
largest threshold used by the solutions.

## Final Approaches

### Recommended - `solution.cpp`

1. Count characters in the left half of `s`.
2. Precompute capped `C(n, r)` values for `r <= 32`.
3. If the total half-permutation count is below `k`, return `""`.
4. For each left-half position, try each available letter from `a` to `z`.
5. Temporarily consume that letter and count the remaining multiset permutations capped at
   `k`.
6. Keep the first letter whose completion count is at least `k`; otherwise subtract that
   count and restore the letter.
7. Mirror the completed left half around the original middle character when `n` is odd.

### Speed Extreme - `solution-runtime.cpp`

1. Use the same half-counts and compact binomial table.
2. At each position with `L` letters remaining, compute the current total count capped at
   `k * L`.
3. If that cap is reached, the smallest available letter must have at least `k`
   completions, so choose it immediately.
4. Otherwise the total is exact, and each candidate block is computed by the ratio
   `total * count[c] / L`.
5. Subtract skipped blocks and consume the chosen letter.

### Memory Extreme - `solution-memory.cpp`

1. Keep only the 26 half-counts and output strings.
2. Use the runtime variant's block-size logic.
3. Replace the stored binomial table with a capped multiplicative `nCr` routine.
4. Return the mirrored palindrome exactly as in the other variants.

## Why These Approaches

All three approaches exploit the one-to-one mapping between palindromes and left-half
multiset permutations. The recommended variant is easiest to audit and already linear in
practice because the alphabet and useful binomial width are fixed constants. The runtime
variant is preferable when wall-clock time is the priority: one multinomial count per
position replaces up to 26 tentative recounts. The memory variant gives up the table to
minimize auxiliary storage while preserving the same greedy decisions.

## Top 1% Performance Strategy

- Arrange only `n / 2` characters and mirror once.
- Use C++ fixed-size arrays for 26 counts.
- Saturate counts at the decision threshold to avoid big integers.
- Precompute only the binomial widths that can matter under `k <= 1e6`.
- In the runtime variant, use the exact multinomial block-ratio identity instead of
  recounting every tentative branch.
- Reserve output strings to avoid repeated reallocations.

## Edge Cases

- `n = 1`: return `s` for `k = 1`, otherwise `""`.
- All characters equal: only one permutation exists.
- `k` larger than the number of distinct palindromic rearrangements: return `""`.
- Odd length strings: keep the original middle character, which is the only possible middle.
- Highly duplicated strings: multinomial counting handles identical rearrangements once.
- Large balanced counts: saturation prevents overflow while still proving whether a block
  contains the desired `k`.

## Alternatives

- Generating permutations is factorial and infeasible.
- Big integer factorials are unnecessary because every decision threshold is at most
  `k * 5000`.
- A full Pascal triangle works but stores far more data than needed; the compact table
  stores only the binomial widths that can be below the cap.
- A floating-point logarithm-only approach is fast but needs exact fallbacks around the
  threshold; the shipped variants stay deterministic with integer counting.

## See Also

All proposals for this challenge are in this C++ folder.
