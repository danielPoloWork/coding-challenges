# Notes - LeetCode 3670: Maximum Product of Two Integers With No Common Bits (C++ proposals)

## Problem Summary

Given `nums`, choose two different elements whose binary representations have no shared
set bit. Return the largest possible product, or `0` if no such pair exists.

## Proposals in This Folder (C++)

- **Recommended (`solution.cpp`) - fast + lean:** sort distinct values descending, try a
  bounded high-product pair scan, and fall back to compressed SOS DP only when pruning is
  not enough.
- **Speed extreme (`solution-runtime.cpp`):** the same exact hybrid, but with static
  arrays for the DP table and compressed masks. This is the version to submit when
  chasing wall-clock time.

The plain hint-based SOS-DP approach is correct, but it performs a full `2^20`-mask scan
for every testcase. The hybrid avoids that cost on easy/prunable cases, and when it must
use DP it compresses the table to only the bit positions actually present in the input.

## Language Choice (C++)

C++ is the best fit for the runtime-focused objectives here. The hot path is dense
integer-array work over at most `2^20` masks plus branch-light bit checks. C++ gives
contiguous arrays, cheap shifts, fast sorting, and no VM/interpreter overhead. For the
runtime variant, static arrays avoid repeated allocation in LeetCode's multi-testcase
harness.

## Constraints

- `2 <= nums.length <= 1e5`
- `1 <= nums[i] <= 1e6`
- The bit width is at most `20` because `1e6 < 2^20`.
- The maximum product can reach `1e12`, so the answer must be stored in `long long`.

## Key Observations

- Each number can be treated directly as a bit mask.
- For a fixed `x`, a valid partner `y` must satisfy `x & y == 0`.
- If all numbers share a common set bit, no pair can be valid.
- Descending values give a strong upper bound: once `x * maxValue <= answer`, no later
  `x` can improve the result.
- For the DP fallback, `best[mask]` should store the largest original value whose
  compressed bit mask is a submask of `mask`.

## Reasoning Process

The direct solution checks every pair and tests `(nums[i] & nums[j]) == 0`, which is
O(n^2). At `n = 1e5`, that is too slow in the worst case.

The official hint path is SOS DP: precompute the maximum present submask for every mask,
then query the complement of each number. That is exact, but doing it immediately can be
wasteful when the answer is found among the largest values after only a few checks.

The final solution combines both ideas:

1. Sort distinct values descending.
2. Scan candidate pairs while products can still beat the current answer.
3. If this scan inspects too many incompatible pairs, switch to SOS DP.
4. Compress the DP dimension to only the bit positions present in the input.
5. Query `best[fullMask ^ compressed(x)]` for every remaining candidate.

This keeps correctness from SOS DP and cuts practical runtime on the hidden suite.

## Final Approaches

### Recommended - `solution.cpp`

1. Sort `nums` descending and remove duplicates.
2. Return `0` immediately if every number shares some common set bit.
3. Try a bounded product-pruned pair scan.
4. If the scan completes, return its exact answer.
5. Otherwise build compressed masks, run SOS DP, and query complements.

### Speed Extreme - `solution-runtime.cpp`

1. Use the same bounded scan and same compressed SOS-DP fallback.
2. Store the fallback DP table in a static `int best[1 << 20]`.
3. Store compressed masks in a static `int masks[100000]`.
4. Fill only the active DP range `0..(1 << activeBits)`.

## Why These Approaches

The recommended and runtime variants are exact and robust: the bounded scan wins on easy
or random-like inputs, while compressed SOS DP protects the worst case. This is more
practical than always paying the full `2^20` DP cost.

## Top 1% Performance Strategy

- Use C++ and direct integer arrays.
- Deduplicate values before any expensive work.
- Check the global common-bit impossibility case early.
- Try high-product pairs first and cap the scan before it can become quadratic.
- Compress active bit positions before SOS DP.
- Use static arrays in the runtime variant to avoid repeated allocation.

## Edge Cases

- No disjoint pair, such as `[5, 6, 4]`, returns `0`.
- Fully disjoint high values, such as `[64, 8, 32]`, return the product of the two maximum
  compatible values.
- Duplicate values do not create a false self-pair because positive equal masks always
  share their own set bits.
- A single distinct value after deduplication returns `0`.
- Values near `1e6` are covered by the 20-bit mask limit.

## Alternatives

- Brute-force pair scanning is O(n^2) and cannot target top runtime at `1e5`.
- Always-on SOS DP is exact but can be unnecessary work across many testcase shapes.
- A simple greedy binary trie is not correct: choosing a high `1` branch can lead to a
  dead end on lower forced-zero bits.

## See Also

The maintained proposals for this challenge are in this C++ folder.
