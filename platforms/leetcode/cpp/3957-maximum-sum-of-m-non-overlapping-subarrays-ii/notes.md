# Notes - LeetCode 3957: Maximum Sum of M Non-Overlapping Subarrays II (C++ proposals)

## Problem Summary

Given `nums`, choose at least one and at most `m` pairwise non-overlapping subarrays. Every
chosen subarray must have length in `[l, r]`. Return the maximum possible total sum.

The difficult part is that `n` and `m` can both be `1e5`, values can be negative, and the
answer is allowed to use fewer than `m` subarrays.

## Three Proposals

- **Recommended (`solution.cpp`) - fast + lean:** WQS binary search over a per-subarray
  penalty. Each fixed penalty is solved by a prefix-DP scan with a monotone deque over
  eligible start positions.
- **Speed extreme (`solution-runtime.cpp`):** same mathematics, but the hot path uses
  preallocated flat arrays and a manual index queue instead of `std::deque`.
- **Memory extreme (`solution-memory.cpp`):** same WQS search, but each fixed-penalty scan
  is streamed with circular buffers. It avoids full prefix and DP arrays and stores only
  delayed states plus the active deque.

The runtime trade-off is between implementation clarity and constant factors. The memory
trade-off is `O(n)` prefix/DP storage for the first two variants versus `O(r)` auxiliary
storage for the streaming variant, with the same asymptotic time.

## Language Choice (per proposal)

### Recommended - `solution.cpp`

Candidate languages considered:

- C++: selected for native loops, 64-bit arithmetic, mature LeetCode support, and concise
  vector/deque implementation.
- C: raw loops are competitive, but the vector-style LeetCode signature and manual
  allocation would add risk without improving this proposal's asymptotic footprint.
- Rust: native and safe, but mutable DP plus deque state is more verbose and less likely
  to beat C++ constants on LeetCode.
- Go: compiled, but bounds checks and runtime overhead are less attractive for repeated
  large scans.
- Java / C#: primitive arrays can be fast after JIT warmup, but C++ avoids GC/runtime
  overhead and keeps memory layout leaner.
- Python / JavaScript / TypeScript / PHP: the algorithm still performs tens of millions
  of scalar operations, so interpreter/VM overhead misses the top-percentile target.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: it gives the best balance of speed, memory, and readable
  implementation for WQS plus monotone queues.
- Why the main alternatives lose: C is lower-level without meaningful gain; managed and
  interpreted runtimes carry avoidable overhead at `n = 1e5`.

### Speed Extreme - `solution-runtime.cpp`

Candidate languages considered:

- C++: selected because flat vectors and manual queue indices compile to tight native
  loops with predictable memory access.
- C: could match the loop shape, but LeetCode ergonomics and manual memory handling are
  worse while C++ emits similarly efficient code.
- Rust: strong native performance, but checked indexing and queue plumbing are harder to
  keep as compact as the C++ hot path.
- Go: slices are simple, but bounds checks and runtime overhead work against raw speed.
- Java / C#: JIT can be competitive, but C++ has lower startup and more predictable
  top-percentile constants.
- Python / JavaScript / TypeScript / PHP: too slow for the worst-case loop volume.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: it exposes the tightest implementation of the hinted
  algorithm using preallocated arrays and no dynamic queue blocks.
- Why the main alternatives lose: the best alternatives either add manual signature risk
  (C) or managed/runtime overhead (Go, Java, C#, scripting languages).

### Memory Extreme - `solution-memory.cpp`

Candidate languages considered:

- C++: selected for compact circular buffers, explicit queue records, and low runtime
  baseline.
- C: possible, but the same asymptotic memory can be achieved in C++ with safer container
  setup and the required LeetCode vector input.
- Rust: memory control is excellent, but ring-buffer mutation around closures is more
  complex for little gain here.
- Go: slices make rings easy, but the runtime and GC baseline are larger than C++.
- Java / C#: primitive arrays avoid boxing, but managed-runtime overhead hurts the memory
  objective.
- Python / JavaScript / TypeScript / PHP: numeric containers are object-heavy and not
  suitable for a memory-extreme implementation.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: it keeps only the necessary circular state while avoiding
  boxed values and managed-runtime baseline memory.
- Why the main alternatives lose: none improves the asymptotic memory; most increase
  overhead or implementation risk.

## Constraints

- `1 <= n == nums.length <= 1e5`
- `-1e5 <= nums[i] <= 1e5`
- `1 <= m <= n`
- `1 <= l <= r <= n`
- Sums require `long long`: a valid subarray sum can be as large as `1e10`.

## Key Observations

- For a fixed number of chosen subarrays, the direct DP has a resource dimension
  `count = 0..m`, which is too large.
- WQS binary search removes that dimension by charging a penalty `x` for every selected
  subarray and maximizing `sum - x * count`.
- For a fixed `x`, a subarray ending at prefix index `i` can start only at
  `j in [i - r, i - l]`.
- The transition is:

```text
dp[i] = max(
    dp[i - 1],
    prefix[i] - x + max(dp[j] - prefix[j]) for j in [i - r, i - l]
)
```

- The range maximum of `dp[j] - prefix[j]` is maintained by a monotone deque.
- As `x` increases, selected subarrays become less attractive, so the optimal count is
  non-increasing.
- Because the problem asks for at most `m`, first check the zero-penalty optimum. If it
  already uses at most `m` subarrays, it is the answer. If it uses more, the constrained
  optimum is reached at exactly `m` subarrays via WQS.
- The empty choice is useful inside the DP, but the final answer must select at least one
  subarray. If the zero-penalty value is `0`, return the best single valid subarray sum;
  this correctly handles all-negative inputs and zero-sum inputs.

## Reasoning Process

The straightforward exact-count DP would define `best[k][i]` as the maximum sum in the
first `i` elements using exactly `k` subarrays. With prefix sums and a deque, one layer can
be computed in `O(n)`, but all `m` layers cost `O(nm)`, which is impossible at `1e5`.

The hints point to WQS, also called the alien trick. Instead of limiting the count during
the DP, attach a penalty `x` to every chosen segment. Now the DP only needs the best
adjusted value and the number of segments used by that adjusted optimum. Larger `x` means
fewer segments, so binary search can locate the penalty where the optimum crosses `m`.

The only remaining obstacle is the length range. When endpoint `i` is fixed, all valid
starts form a sliding window `[i - r, i - l]`. The value contributed by a start `j` is
`dp[j] - prefix[j]`; the rest of the expression, `prefix[i] - x`, is fixed for this `i`.
A monotone deque gives the best start in amortized `O(1)` time.

## Final Approaches

### Recommended - `solution.cpp`

1. Build `prefix`.
2. Compute the best one valid subarray for the mandatory non-empty case.
3. Run the fixed-penalty DP at `x = 0`.
4. If the adjusted optimum has value `0`, return the best single subarray.
5. If it uses at most `m` subarrays, return its value.
6. Otherwise binary search the largest penalty whose adjusted optimum still uses at least
   `m` subarrays.
7. Convert back with `adjustedValue + penalty * m`.

### Speed Extreme - `solution-runtime.cpp`

1. Precompute prefix sums once.
2. Reuse flat `dp`, `cnt`, and queue arrays for every penalty evaluation.
3. Keep the same tie rule: when adjusted values tie, prefer the larger segment count.
4. Binary search and convert back exactly as in the recommended proposal.

### Memory Extreme - `solution-memory.cpp`

1. Do not store full prefix or DP arrays.
2. Maintain the running prefix sum.
3. Store recently computed states in an `l + 1` circular delay buffer until they become
   eligible as starts.
4. Store eligible starts in a circular monotone deque of size `r - l + 1`.
5. Reuse the same WQS search and non-empty handling.

## Why These Approaches

The WQS formulation is preferable because it is the only hinted path that removes the
`m` dimension while preserving optimality. The deque transition uses the exact structure
of the length constraint; no hash map, segment tree, or heap is needed.

The recommended version is the best default: it is short enough to audit and still uses
the optimal `O(n log A)` shape. The runtime version trims queue overhead for judge speed.
The memory version is useful when `r` is much smaller than `n`, because it avoids storing
all prefix and DP states.

## Top 1% Performance Strategy

- Use C++ and `long long` for all sums.
- Use WQS binary search to replace `O(nm)` with about 35 linear scans.
- Maintain starts with a monotone deque instead of scanning all lengths.
- Prefer larger counts on equal adjusted value, making the count monotone and the WQS
  boundary stable.
- Precompute prefix sums in the recommended/runtime variants.
- Use flat arrays in the runtime variant to remove `std::deque` block overhead.
- Use circular buffers in the memory variant to avoid full-length auxiliary arrays.
- Exit before binary search when the zero-penalty optimum already satisfies `count <= m`.

## Edge Cases

- All negative values: the DP with empty choice returns `0`, so the final answer falls
  back to the best one valid subarray.
- Zero-sum best answer: the best single subarray is `0`, so returning it satisfies the
  at-least-one rule.
- `m` larger than the useful number of positive segments: the zero-penalty check returns
  the unconstrained optimum directly.
- `l = r`: the deque window has one allowed length and still works.
- `r = n`: every earlier eligible start can stay in the deque until dominated or expired.

## Alternatives

- Exact-count DP with one deque per layer: `O(nm)` time, too slow for the maximum
  constraints.
- Segment tree or heap for the fixed-penalty transition: correct but heavier than a
  monotone deque because the window only moves forward and asks for a maximum.
- Binary search over answer value: not natural here because feasibility depends on both
  interval sums and selected count.
- Greedy selection of positive subarrays: fails when merging across small negative gaps or
  respecting `[l, r]` changes the best segmentation.

## See Also

All proposals for this challenge are in this C++ folder.
