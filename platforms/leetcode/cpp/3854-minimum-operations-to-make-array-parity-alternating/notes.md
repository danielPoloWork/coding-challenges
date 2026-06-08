# Notes - LeetCode 3854: Minimum Operations to Make Array Parity Alternating (C++ proposal)

## Problem Summary

Given an integer array `nums`, make adjacent values alternate parity. One operation changes
one value by exactly `+1` or `-1`. Return:

1. the minimum number of operations needed to reach any parity-alternating array;
2. among arrays reachable using exactly that many operations, the minimum possible
   `max(nums) - min(nums)`.

A single-element array is already valid and has range `0`.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one implementation is best on all meaningful
axes. Here the endpoint-greedy linear scan is the recommended, speed-extreme, and
memory-extreme solution:

- **Recommended (`solution.cpp`) - fast + lean:** evaluate both alternating patterns in
  linear time after one min/max pass. For each pattern, count parity mismatches and compute
  the best range by pulling only mismatched global minima upward and mismatched global maxima
  downward. `O(n)` time and `O(1)` auxiliary space.
- **Speed extreme:** *coincides with the recommended.* Any exact solution must inspect all
  `n` values to count mismatches and know the endpoints. This implementation reaches that
  lower bound with three tight scans and no dynamic structures beyond the returned vector.
- **Memory extreme:** *coincides with the recommended.* The algorithm stores only extrema,
  two candidate answers, and loop variables. A sorted-endpoint range solver would use
  `O(n)` extra memory without improving correctness.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.*`.

## Language Choice (C++)

Candidate languages considered:

- **C++:** Best fit. LeetCode exposes a `vector<int>` signature, and the solution is a
  branch-light scan over contiguous integers. C++ gives native arithmetic, cheap lambdas,
  stack scalars, and direct return of the required two-integer vector.
- **C:** Also native and compact, but LeetCode's C API would require manual answer
  allocation and pointer bookkeeping. It does not improve the asymptotic memory profile and
  is less ergonomic for this platform signature.
- **Rust:** Native and memory-safe, but the bounds-checking and LeetCode wrapper overhead do
  not buy anything for a two-pattern scalar scan.
- **Go:** Compiled and simple, but slice bounds checks plus runtime/GC metadata are a weaker
  constant-factor fit than C++ for this tiny hot loop.
- **Java / C#:** JITs can be competitive on long scans, but array object overhead and runtime
  startup are unnecessary for `n <= 100000` and a two-int answer.
- **Python / JavaScript / TypeScript / PHP:** Correct and concise, but interpreter/VM overhead
  is dominated by per-element parity checks and branches. They are not the top-performance
  choice for this constraint.

Chosen language:

- **Selected:** C++.
- **Why it wins for this proposal:** It gives the fastest practical LeetCode execution for
  the required contiguous scan while keeping auxiliary memory constant.
- **Why the main alternatives lose:** C adds API boilerplate without a meaningful memory
  win; Rust and Go add platform/runtime overhead for no algorithmic gain; managed and
  interpreted languages are less attractive for top 1% runtime on a scalar loop.

## Constraints

- `1 <= nums.length <= 100000`.
- `-1000000000 <= nums[i] <= 1000000000`.
- The final range is at most `2000000002`, which fits in signed 32-bit `int`.
- For `n > 1`, a parity-alternating array must contain both parities, so its range is at
  least `1`.

## Key Observations

1. A valid array must match one of two patterns: even, odd, even, ... or odd, even, odd, ....
2. For a fixed pattern, a matching element costs `0` operations and must remain unchanged
   when the total operation count is minimum.
3. A mismatching element costs exactly `1` operation and can become only `x - 1` or `x + 1`.
4. To minimize range, a mismatched global minimum should be increased, never decreased; a
   mismatched global maximum should be decreased, never increased.
5. A mismatched non-endpoint value can be represented by its original value as a range proxy:
   if the proxy interval has width at least `1`, either `x - 1` or `x + 1` lies inside it.

## Reasoning Process

The direct approach for the first answer is immediate: count mismatches against both parity
patterns and take the smaller count. The second answer looks like a small range-selection
problem because every mismatched value has two possible final values.

A generic exact solver could create the allowed set `{x}` or `{x - 1, x + 1}` for every
index, sort all allowed values, and use a sliding window that covers every index. That is
correct but costs `O(n log n)` time and `O(n)` memory.

The constraints and the `+/-1` operation expose a sharper structure. Only final endpoints
matter for `max - min`. For a fixed pattern:

- If a mismatched value equals the original minimum, choosing `x - 1` can only expand the
  lower endpoint, so choose `x + 1`.
- If it equals the original maximum, choosing `x + 1` can only expand the upper endpoint,
  so choose `x - 1`.
- If it lies strictly between the original minimum and maximum, both candidate final values
  stay inside the original envelope. During range computation we may leave it as the proxy
  value `x`; once the proxy interval `[low, high]` is known, replace a proxy at `low` by
  `low + 1`, a proxy at `high` by `high - 1`, and an interior proxy by either neighbor.

If all proxies collapse to one value, the true final array cannot have range `0` for
`n > 1`, but range `1` is always reachable by shifting unresolved proxies to one adjacent
value. That is why each pattern returns `max(1, high - low)`.

## Final Approach

1. If `n == 1`, return `[0, 0]`.
2. Scan once to find the original minimum and maximum.
3. Evaluate the pattern with even values at even indices.
4. Evaluate the pattern with odd values at even indices.
5. Pattern evaluation:
   - expected parity at `i` is `evenIndexParity ^ (i & 1)`;
   - if `nums[i]` already matches, keep it as-is;
   - otherwise count one operation and use `nums[i] + 1` if it is a global minimum,
     `nums[i] - 1` if it is a global maximum, or the original value as a proxy if it is
     internal;
   - track the minimum and maximum adjusted/proxy values.
6. Choose the candidate with fewer operations; if tied, choose the smaller range.

## Why This Approach

It solves both requested outputs together without sorting, heaps, sets, or dynamic
programming. The first output is the mismatch lower bound, and the endpoint argument proves
that the range computation is exact among arrays reachable with exactly that many
operations.

## Top 1% Performance Strategy

- One min/max scan plus two tight pattern scans: `O(n)` with tiny constants.
- No heap allocation except the mandatory returned two-element vector.
- Integer parity through low-bit checks.
- Manual min/max updates avoid unnecessary iterator and comparator machinery.
- No construction of adjusted arrays or allowed-value lists.

## Edge Cases

- Single element: return `[0, 0]`.
- Already alternating arrays: zero operations; range is the original range.
- All values equal: one pattern changes one side of the index parity, and the best range is
  `1`.
- Negative values: parity is still determined by the low bit on LeetCode's two's-complement
  C++ runner.
- Duplicated minima or maxima: every mismatched copy is pulled inward; matching copies remain
  fixed and may still define the final endpoint.

## Alternatives

- **Sort all allowed final values:** exact but `O(n log n)` time and `O(n)` extra memory.
- **Brute-force signs for mismatches:** `O(2^m)` where `m` is the mismatch count; impossible
  at `m = 100000`.
- **Only count operations:** misses the second requested tie-breaker.
- **Always move mismatches toward the nearest current center:** intuitive but harder to prove
  and unnecessary; only global endpoint behavior matters.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
