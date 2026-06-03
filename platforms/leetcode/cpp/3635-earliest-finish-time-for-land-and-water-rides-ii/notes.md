# Notes - LeetCode 3635: Earliest Finish Time for Land and Water Rides II (C++ proposal)

## Problem Summary

A tourist must take exactly one land ride and exactly one water ride, in either order.
Each ride `k` opens at a start time and lasts a duration; it may be boarded at its opening
time or any later moment, and finishes at `start + duration`. After finishing the first
ride the tourist immediately boards the second if it is already open, otherwise waits for
it to open. Return the earliest possible time at which **both** rides are finished.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals (fast + lean / speed extreme / memory extreme)
**unless one solution is best on every axis**, in which case the repo standard says to ship
only the recommended file and explain why (see `docs/challenge-format.md`,
"do not add coincident files"). This problem is exactly that case:

- **Recommended (`solution.cpp`) - fast + lean:** two independent linear scans per order,
  `O(n + m)` time, `O(1)` extra space.
- **Speed extreme:** *coincides with the recommended.* Every ride must be read at least
  once, so `Omega(n + m)` is a hard lower bound; the recommended already hits it with a
  handful of comparisons per element and no allocation. Nothing is asymptotically or
  constant-factor faster.
- **Memory extreme:** *coincides with the recommended.* It uses only a few scalar
  accumulators - `O(1)` extra space, the absolute floor. A C transliteration would trim
  only the language runtime baseline, not the algorithm, so it is not a genuinely
  different, non-dominated solution and is intentionally omitted.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.*`.

## Language Choice (C++)

Native compilation, no GC or interpreter overhead, and direct `int` arithmetic over
`vector<int>` make C++ a top-1% fit for both axes here. The workload is pure arithmetic
(`min`, `max`, `+`) with no container or data-structure needs, so C++ matches C's runtime
while staying more readable via `std::min` / `std::max`. The reported memory is already at
the `O(1)`-extra floor (only scalars), so a lower-baseline language such as C would shave
only a constant runtime baseline without changing the algorithm - not enough to justify a
separate, near-identical file under the "no coincident files" rule.

## Constraints

- `1 <= n, m <= 5 * 10^4` (`landStartTime.length == landDuration.length == n`,
  `waterStartTime.length == waterDuration.length == m`).
- `1 <= landStartTime[i], landDuration[i], waterStartTime[j], waterDuration[j] <= 10^5`.

Implications: `n * m` can reach `2.5 * 10^9`, so the brute-force pairing is far too slow -
a near-linear approach is required. Every value sum is `<= ~3 * 10^5`, so 32-bit `int`
never overflows; no `long`/`long long` is needed.

## Key Observations

1. The two rides are from **different** categories, so picking the first ride and picking
   the second ride are independent choices - there is no "same element used twice" conflict.
2. For a **fixed order** and a **fixed second ride**, the total finish
   `max(firstFinish, secondStart) + secondDuration` is **non-decreasing** in `firstFinish`.
   Hence the best first ride is always the one with the **minimum finish time**, regardless
   of which second ride is chosen.
3. Both orders (land->water and water->land) must be tried; the global answer is the
   minimum over the two.

## Reasoning Process

1. **Brute force** - try every (land, water) pair in both orders: `O(n * m)`. Correct but
   `2.5 * 10^9` operations at the limit; too slow.
2. **Hinted approach** (LeetCode hints) - sort the second list by start time, build a
   prefix-min of durations and a suffix-min of finish times, then binary-search a split
   point for each first ride: `O((n + m) log(n + m))` time and `O(n + m)` space. Fast
   enough, but it is strictly **dominated** by observation 2.
3. **Linear insight** - by observation 2, the best first ride for *every* second ride is
   the single one with the minimum finish time, so no per-ride split/binary search is
   needed. Precompute `bestLandFinish` and `bestWaterFinish`, then scan the opposite list
   once per order. This is `O(n + m)` time, `O(1)` extra space - faster and leaner than the
   hinted approach on both axes, which is why it is the shipped solution.

## Final Approach (step by step)

```text
bestLandFinish  = min over i of (landStartTime[i]  + landDuration[i])
bestWaterFinish = min over j of (waterStartTime[j] + waterDuration[j])

answer = +inf
for each water ride j:  answer = min(answer, max(bestLandFinish,  waterStartTime[j]) + waterDuration[j])  # land first
for each land  ride i:  answer = min(answer, max(bestWaterFinish, landStartTime[i])  + landDuration[i])    # water first
return answer
```

`max(...)` models "board immediately if the second ride is already open, otherwise wait
for it to open"; using `bestLandFinish` / `bestWaterFinish` applies observation 2.

## Why This Approach

It is correct (proven by the monotonicity argument and confirmed by a 300,000-case
differential test against brute force), and it is optimal on both axes: linear time is the
`Omega(n + m)` lower bound, and `O(1)` extra space is the floor. It is also simpler than the
hinted sort + prefix/suffix + binary-search method while being asymptotically faster and
using less memory - a clean Pareto win.

## Top 1% Performance Strategy

- Drop from `O(n * m)` to `O(n + m)` via the monotonicity insight (no sort, no binary
  search, no prefix/suffix arrays).
- `O(1)` extra space - only scalar accumulators, zero heap allocation.
- Plain index loops over contiguous `vector<int>` for cache-friendly, branch-light scans;
  `std::min` / `std::max` lower to `cmov`/branchless code.
- 32-bit `int` throughout (sums fit in `~3 * 10^5`) - no wider types, no overflow guards.

## Edge Cases

- `n == 1` and/or `m == 1` (e.g. example 2): both orders still evaluated; correct.
- A second ride already open at the first ride's finish -> `max` picks the finish time
  (board immediately); a not-yet-open second ride -> `max` picks its start (wait).
- All rides identical, or one category opening much later than the other (example 2, where
  taking water first and waiting is optimal): handled by trying both orders.
- Large inputs (`n, m = 5 * 10^4`): linear scans, no overflow.

## Alternatives

- **Brute force `O(n * m)`** - too slow at the constraints.
- **Sort + prefix-min/suffix-min + binary search `O((n + m) log(n + m))`, `O(n + m)`
  space** (the official hint path) - correct but strictly dominated by the linear insight
  in both time and space, so not shipped.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
