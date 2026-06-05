# Notes - LeetCode 3743: Maximize Cyclic Partition Score (C++ proposals)

## Problem Summary

Given a cyclic array `nums`, split all elements into at most `k` non-empty cyclic
subarrays. A subarray contributes `max(subarray) - min(subarray)`. Return the largest
sum of contributions over all valid cyclic partitions.

## Proposals in This Folder (C++)

- **Recommended (`solution.cpp`) - fast + lean:** one O(nk) dynamic program that tracks
  all three cyclic start states together in a compact 9-state row per completed pair.
- **Speed extreme (`solution-runtime.cpp`):** the same O(nk) transition system in fixed
  stack arrays with the hot loop manually unrolled for lower constant overhead.
- **Memory extreme (`solution-memory.cpp`):** runs the three cyclic start states
  separately, using only 3 states per completed-pair count. It keeps the same O(nk)
  asymptotic time but does three passes over `nums` to reduce the DP footprint.

## Language Choice (C++)

C++ is the strongest fit for all three objectives. The constraints are small enough for
O(nk), but the state is updated millions of times and values can reach `1e12`, so native
`long long` arithmetic, contiguous arrays, no garbage collector, and predictable stack or
vector storage matter. C has comparable raw primitives, but LeetCode's C++ vector
signature is direct and the compiler can inline the tiny DP transitions without manual
memory management. Java, C#, Go, Rust, Python, JavaScript, TypeScript, and PHP add either
runtime overhead or less direct LeetCode ergonomics for no algorithmic gain here.

## Constraints

- `1 <= nums.length <= 1000`
- `1 <= nums[i] <= 1e9`
- `1 <= k <= nums.length`
- The score can exceed 32-bit integer range, so every proposal uses `long long`.

## Key Observations

- A segment range can be written as one `+max` contribution and one `-min` contribution.
- Zero-range or unused segments do not need explicit picks; only completed `(+,-)` or
  `(-,+)` pairs matter.
- While scanning the array, only one currently unmatched extreme is needed:
  balanced, open minimum, or open maximum.
- A cyclic partition may have one segment crossing the scan boundary. Trying all three
  possible start states and requiring the final state to match the start state captures
  that wraparound segment.
- Counting completed pairs is tighter than counting all picks: at most `k` completed
  non-zero segments are useful.

## Reasoning Process

The direct approach is to enumerate cut positions on the cycle and evaluate ranges. That
is exponential in the number of cuts, and trying all linear rotations with a classical
partition DP would still do too much repeated range work.

The useful reduction is to stop choosing cuts first. For every final partition, choose an
occurrence of the maximum and minimum in each non-zero segment. The total score is exactly
the signed sum of these chosen extremes. Conversely, any valid signed sequence can be
paired into segments; if a segment contains an even larger maximum or smaller minimum, the
real partition score only improves.

On a linear scan, a picked minimum opens a segment with `-nums[i]` and a future maximum
closes it with `+nums[i]`; a picked maximum symmetrically opens with `+nums[i]` and closes
with `-nums[i]`. The cycle boundary is handled by allowing the scan to begin in any of
the three states and accepting only paths that return to that same state.

## Final Approaches

### Recommended - `solution.cpp`

1. Use `dp[closedPairs][startState, currentState]`.
2. Initialize `dp[0][s, s] = 0` for `s in {0, 1, 2}`.
3. For each value, scan `closedPairs` downward so the same element is not used twice.
4. From balanced, open either a minimum (`-x`) or maximum (`+x`) without increasing the
   completed-pair count.
5. From an open minimum or maximum, close a pair and increase `closedPairs`.
6. The answer is the best value with `closedPairs <= k` and `currentState == startState`.

### Speed Extreme - `solution-runtime.cpp`

The algorithm is identical, but the table is `long long dp[1001][9]` and the three start
states are unrolled by hand. That removes nested container iteration and keeps the judge's
inner loop small and cache-friendly.

### Memory Extreme - `solution-memory.cpp`

Run the same DP once for each possible start state. Each pass stores only
`dp[closedPairs][currentState]`, reducing the active state count from 9 to 3. This is the
right variant when reported auxiliary memory is more important than the last constant
factor in runtime.

## Why These Approaches

The signed-extreme DP matches the problem's scoring formula directly and avoids computing
subarray ranges for every possible cut. It also exploits the hint that the cyclic balance
can be limited to three states.

The recommended solution is preferable as the default because it is O(nk), compact, and
keeps all cyclic starts in one pass. The runtime variant gives the same result with less
loop overhead. The memory variant spends extra passes to reduce active DP states.

## Top 1% Performance Strategy

- Count completed pairs instead of all `2k` individual picks.
- Use only three balance states.
- Scan the pair count downward and update in place, avoiding a second DP layer.
- Store the recommended/runtime DP in contiguous memory.
- Use `long long` throughout to avoid overflow while keeping arithmetic native.
- Avoid hash maps, recursion, range precomputation, and per-subarray scans.

## Edge Cases

- `n = 1`: no positive range is possible, so the answer is `0`.
- `k = 1`: the DP naturally returns the whole-cycle range.
- Duplicate values: opening and closing equal values contributes `0`, which is never
  harmful but also not required.
- `k = n`: the DP may use fewer than `k` segments; extra singleton segments add no score.
- All values equal: every signed pair contributes `0`, so the answer remains `0`.

## Alternatives

- Enumerating cut sets is exponential and infeasible even at `n = 1000`.
- Trying every rotation with interval-range DP repeats too much work.
- A literal `2k`-pick DP is correct but does about twice the pair dimension work; counting
  closed pairs is the tighter version used here.
- Stock-transaction formulations can solve the same state machine, but the explicit
  open-min/open-max states map more directly to this problem's partition proof.

## See Also

All proposals for this challenge are in this C++ folder.
