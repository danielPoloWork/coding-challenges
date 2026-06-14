# Notes - LeetCode 3962: Maximum Subarray Sum After at Most K Swaps (C++ proposals)

## Problem Summary

Given an array `nums`, perform at most `k` arbitrary swaps, then take the maximum subarray
sum of the resulting array. A swap may exchange any two positions, so for a fixed final
subarray the only thing that matters is which original values remain inside that interval
and which outside values can be brought in.

## Three Proposals

- **Recommended (`solution.cpp`) - fast + lean:** enumerate every subarray. Maintain the
  current inside multiset and outside multiset with coordinate-compressed Fenwick trees
  that answer order-statistic and prefix-sum queries.
- **Speed extreme (`solution-runtime.cpp`):** same exchange argument and Fenwick queries,
  but the hot structures are fixed arrays copied with `memcpy`, avoiding per-left dynamic
  container setup and most object overhead.
- **Memory extreme (`solution-memory.cpp`):** keep only the Fenwick tree for the inside
  interval. Outside counts and sums are computed as `global - inside`, reducing live
  mutable order-statistic storage at the cost of an extra logarithm in outside queries.

The main trade-off is implementation constant versus memory. The recommended and runtime
variants are `O(n^2 log n)` with `O(n)` auxiliary memory; the runtime file tightens
constants. The memory variant stays `O(n)` but stores one mutable Fenwick instead of two
and pays `O(log^2 n)` for each outside order statistic.

## Language Choice (per proposal)

### Recommended - `solution.cpp`

Candidate languages considered:

- C++: selected for native Fenwick loops, compact vectors, 64-bit sums, and strong
  LeetCode support.
- C: raw loops are competitive, but hand-rolling dynamic coordinate compression and
  repeated tree copies adds risk without improving the asymptotic memory profile.
- Rust: native and safe, but the mutable order-statistic tree code is more verbose and
  less likely to beat C++ constants in LeetCode's runner.
- Go: compiled, but bounds checks and runtime overhead are less attractive for millions
  of Fenwick probes.
- Java / C#: primitive arrays can be competitive after JIT warmup, but C++ avoids managed
  runtime and GC overhead while keeping the same data layout.
- Python / JavaScript / TypeScript / PHP: the `n = 1500` limit still creates about
  2.25 million windows and many scalar order-statistic operations, so VM/interpreter
  overhead is too high for the top-percentile target.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: it gives the cleanest fast-and-lean implementation of
  dynamic rank counts plus rank sums.
- Why the main alternatives lose: C does not improve asymptotics, managed runtimes add
  avoidable baseline costs, and scripting languages are dominated by the loop volume.

### Speed Extreme - `solution-runtime.cpp`

Candidate languages considered:

- C++: selected because fixed arrays, `memset`, `memcpy`, and inline Fenwick helpers
  produce the tightest practical hot path.
- C: could match the array layout, but the C++ LeetCode signature and `vector` input are
  more ergonomic while the generated loops remain native.
- Rust: native performance is possible, but checked indexing and borrow structure around
  several mutable trees make it harder to keep the hot path as compact.
- Go: slices are simple, but bounds checks and runtime services work against raw
  top-percentile speed.
- Java / C#: primitive arrays are viable, but C++ has lower startup and more predictable
  memory traffic for this short, dense workload.
- Python / JavaScript / TypeScript / PHP: not suitable for the required number of
  order-statistic probes.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: it exposes the same optimal strategy with minimal
  allocation and copy overhead.
- Why the main alternatives lose: none gives lower constants on this Fenwick-heavy
  workload under LeetCode's usual compiled-language behavior.

### Memory Extreme - `solution-memory.cpp`

Candidate languages considered:

- C++: selected for one compact mutable Fenwick tree plus global prefix arrays and no
  managed-runtime baseline.
- C: could shave some runtime library baseline, but it increases implementation risk and
  does not reduce the required compressed-value state below `O(n)`.
- Rust: memory control is good, but the outside-as-complement closures and Fenwick code
  are more cumbersome for no asymptotic gain.
- Go: slice storage is acceptable, but the runtime and GC baseline are larger than C++.
- Java / C#: primitive arrays avoid boxing, but managed-runtime overhead is not ideal for
  a memory-score variant.
- Python / JavaScript / TypeScript / PHP: object-heavy numeric containers are not a
  memory-extreme fit.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: it minimizes live mutable structures while preserving
  a judge-viable algorithm.
- Why the main alternatives lose: they either do not reduce the data structure footprint
  or add runtime and object-layout overhead.

## Constraints

- `1 <= n == nums.length <= 1500`
- `-100000 <= nums[i] <= 100000`
- `0 <= k <= n`
- Any answer fits in 32-bit signed range under the stated constraints, but the
  implementations use `long long` for sums and gains to keep arithmetic unambiguous.

## Key Observations

- For a fixed interval `[l, r]`, swaps between two inside positions or two outside
  positions do not change the interval sum.
- A useful swap replaces one inside value with one outside value. The best `t` such
  replacements remove the `t` smallest inside values and add the `t` largest outside
  values.
- If inside values are sorted increasingly and outside values decreasingly, the marginal
  gain of the `t`-th swap is `outside[t] - inside[t]`. These marginal gains are
  non-increasing.
- Therefore the best number of swaps for a fixed interval is the largest profitable
  count capped by `k`.
- Let `P(v)` be the number of inside values `<= v`, and `G(v)` the number of outside
  values `> v`. The number of positive pairs is `max_v min(P(v), G(v))`.
- Because `P(v)` is non-decreasing and `G(v)` is non-increasing, this maximum is reached
  at one of the two compressed values around their crossing. The crossing itself depends
  only on the interval length and the global value frequencies, so it can be precomputed.
- Coordinate compression lets Fenwick trees provide `kth` value and sum-of-smallest or
  sum-of-largest queries in logarithmic time.

## Reasoning Process

The brute-force view tries every possible post-swap array, which is hopeless because
arbitrary swaps create many permutations. The important reduction is to fix the subarray
that will be scored. Once the interval is fixed, the order of elements inside that
interval no longer matters for its sum; only its multiset matters.

From there, an exchange argument gives the optimal replacement rule. If a chosen inside
value is not among the smallest removed values, replacing it with a smaller removed value
can only improve or preserve the result. Similarly, if a chosen outside value is not among
the largest imported values, replacing it with a larger outside value improves or
preserves the result. Thus each fixed-`t` optimum is exactly:

```text
subarraySum - sumSmallestInside(t) + sumLargestOutside(t)
```

Because the marginal gain sequence is sorted from best to worst, the number of profitable
pairs can be described as `max_v min(P(v), G(v))`. The crossing between `P` and `G`
occurs when the global count of values `<= v` reaches the outside size, so each possible
outside size has a precomputed candidate value index. For a window, checking that index
and its predecessor gives the profitable swap count without a per-window binary search
over `t`.

## Final Approaches

### Recommended - `solution.cpp`

1. Compress the values of `nums`.
2. Build a base Fenwick tree containing every value as the initial outside multiset.
3. For each `left`, clear the inside tree and copy the base tree into outside.
4. Extend `right`, moving `nums[right]` from outside to inside and updating the raw
   subarray sum.
5. Use the precomputed crossing for the current outside size and check the two adjacent
   thresholds to get the largest profitable swap count.
6. Add the resulting gain to the raw subarray sum and update the answer.

### Speed Extreme - `solution-runtime.cpp`

1. Use the same mathematical flow.
2. Store Fenwick count and sum trees in fixed arrays sized for `n <= 1500`.
3. Reinitialize per-left state with `memset` and `memcpy`.
4. Keep totals as scalar variables so full-tree prefix queries are avoided.

### Memory Extreme - `solution-memory.cpp`

1. Store global compressed-value prefix counts and prefix sums once.
2. Maintain only the inside Fenwick tree while extending the interval.
3. Answer outside prefix queries as `globalPrefix - insidePrefix`.
4. Locate outside order statistics with binary search over compressed values.
5. Reuse the same precomputed-crossing positive-pair count.

## Why These Approaches

The exchange argument is exact and uses the freedom of arbitrary swaps directly. It avoids
state over permutations and turns the problem into multiset order statistics per interval.

Fenwick trees are preferable to balanced BSTs because the value universe after compression
is at most `n`, and the workload is dominated by rank, prefix-count, and prefix-sum
queries. They also avoid storing every repeated value as a node.

The runtime variant is best when judge time is the priority. The memory variant is useful
when reducing live mutable state matters more than a small logarithmic cost.

## Top 1% Performance Strategy

- Enumerate exactly `O(n^2)` intervals, which is appropriate for `n <= 1500`.
- Use the crossing identity for positive pairs to avoid scanning all `k` possible swap
  counts or binary-searching `t` for every window.
- Use coordinate-compressed Fenwick trees for cache-friendly order statistics.
- Maintain inside and outside incrementally while extending `right`; no interval is
  rebuilt from scratch.
- In the runtime variant, use fixed arrays and scalar totals to reduce allocations and
  repeated full-tree queries.
- In all variants, stop at the largest strictly positive marginal gain; zero-gain swaps
  are ignored because the operation budget is "at most" `k`.

## Edge Cases

- `k = 0`: no gains are considered, so the algorithm reduces to maximum subarray sum by
  enumeration.
- Single element: outside is empty, the only subarray is returned.
- Full-array interval: outside count is zero, so no swap can improve it.
- All negative values: a length-one interval can still be optimal, possibly after
  importing a less negative outside value.
- Duplicate values: equal marginal pairs are ignored because they do not improve the sum.

## Alternatives

- Simulating swaps or permutations is exponentially large and ignores the interval
  multiset structure.
- For every interval, sorting inside and outside from scratch is `O(n^3 log n)`.
- Maintaining sorted vectors with insert/erase is simple but pays linear shifts in the
  hot loop.
- Scanning all `t = 1..k` gains per interval is `O(n^2 k log n)`, and even a per-window
  binary search over `t` is slower than the crossing-threshold shortcut on the largest
  tests.

## See Also

All proposals for this challenge are in this C++ folder.
