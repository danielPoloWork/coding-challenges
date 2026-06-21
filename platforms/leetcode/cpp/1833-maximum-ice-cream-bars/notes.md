# Notes - LeetCode 1833: Maximum Ice Cream Bars (C++ proposal)

## Problem Summary

Given `costs[i]`, the price of each ice cream bar, and an initial budget `coins`, buy the
maximum possible number of bars. The bars can be bought in any order, and this entry follows
the problem's explicit requirement to solve it by counting sort.

## Three Proposals -> Two Files

This C++ folder holds the recommended proposal. It is also the speed extreme; a separate
`solution-runtime.cpp` would be coincident, so it is intentionally omitted.

- **Recommended (`solution.cpp`) - fast + lean:** count every price in a fixed
  `int[100001]`, then sweep prices from `1` upward and buy as many bars as the remaining
  coins allow.
- **Speed extreme:** coincides with `solution.cpp`. The fixed native array removes dynamic
  allocation and the preliminary max scan, giving the tightest counting-sort hot path.
- **Memory extreme:** implemented in C at `../../c/1833-maximum-ice-cream-bars/`. It first
  finds the maximum price that is initially affordable, allocates only that counting domain,
  and ignores impossible prices.

The time-space trade-off is small but real: the C++ default spends a fixed 100001-counter
array for the lowest runtime constants; the C memory variant adds an extra pass and dynamic
allocation to shrink the counting table when the affordable price range is smaller.

## Language Choice (recommended and speed)

Candidate languages considered:

- C++: selected. It uses a compact stack frequency array, native integer division, and
  predictable contiguous memory with LeetCode's mature C++ runner.
- C: competitive for raw loops, but the C API is less ergonomic for the default proposal and
  does not improve the fixed-table algorithm beyond equivalent native code.
- Rust: native and safe, but array initialization and bounds-checked indexing add more syntax
  and typically no speed advantage for this simple bucket scan.
- Go: compiled and straightforward, but slice bounds checks and runtime baseline are less
  attractive for a short fixed-range loop.
- Java / C#: primitive arrays are viable, but managed-runtime startup and GC baseline are
  unnecessary for a 100001-cell counting table.
- Python / JavaScript / TypeScript / PHP: simple to write, but interpreter or VM overhead in
  the tally and sweep loops makes them poor top-percentile runtime targets for `n = 100000`.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: the whole algorithm is a dense frequency fill plus a dense
  increasing price scan; C++ compiles both to tight native loops and keeps the fixed table
  around 400 KB.
- Why the main alternatives lose: C is mainly useful for the memory-specific variant; managed
  and interpreted runtimes add overhead without improving the algorithm.

## Constraints

- `1 <= n == costs.length <= 100000`.
- `1 <= costs[i] <= 100000`.
- `1 <= coins <= 100000000`.
- The required technique is counting sort, not comparison sorting.

The value range `R = 100000` is the key constraint: it is small enough to scan directly and
comparable to the maximum input length.

## Key Observations

1. To maximize the number of bought bars, always buy cheaper bars before more expensive bars.
2. If a solution buys a bar of price `b` while skipping a bar of price `a <= b`, swapping `b`
   for `a` keeps the count the same and never increases the total cost.
3. Therefore the optimal multiset is the longest prefix of the sorted prices that fits in
   the budget.
4. Since prices are in a fixed bounded range, the sorted order can be represented by price
   frequencies instead of by sorting the array.

## Reasoning Process

The direct idea is to sort `costs`, then walk the sorted array until the budget is exhausted.
That is correct, but it pays `O(n log n)` comparisons. The constraints give a stronger route:
prices are positive integers in `1..100000`, so a count table gives the same increasing order
in `O(n + R)` time.

After building the frequency table, the algorithm scans `price = 1..100000`. At each price,
only two numbers matter: how many bars exist at that price and how many such bars the current
budget can buy. Taking `min(freq[price], coins / price)` is optimal because no later price is
cheaper.

## Final Approach

1. Allocate and zero a fixed `freq[100001]`.
2. Count every `costs[i]`.
3. For each price from `1` to `100000`, stop if `coins < price`.
4. Buy `take = min(freq[price], coins / price)` bars at that price.
5. Add `take` to the answer and subtract `take * price` from `coins`.
6. If not all bars at the current price can be bought, stop because all later prices are
   greater.

## Why This Approach

The exchange argument proves the greedy price order, and the bounded range makes counting sort
strictly preferable to comparison sorting for the requested technique. The solution does no
per-bar work during the sweep: a whole price bucket is consumed at once, which keeps the hot
path short even when many bars share the same cost.

The default uses a fixed table because 100001 counters are cheap under LeetCode's memory limits
and avoid allocation branches. The memory variant is worthwhile only when minimizing the
auxiliary footprint is more important than the extra setup pass.

## Top 1% Performance Strategy

- Replace comparison sorting with a linear counting table over the known price range.
- Use a fixed native `int` array so zeroing, counting, and scanning are contiguous.
- Consume whole buckets with division instead of subtracting one bar at a time.
- Stop the sweep as soon as the next price is unaffordable.
- Avoid heap allocation and auxiliary containers in the recommended/speed path.

## Edge Cases

- Budget smaller than every price: the scan stops before buying anything and returns `0`.
- All bars affordable: every counted bucket is consumed and the answer reaches `n`.
- Many duplicate prices: handled in one bucket operation.
- `coins` much larger than `100000`: the scan still ends at the fixed maximum price.
- Single element: either buys one bar or none depending on the budget.

## Alternatives

- **Comparison sort:** `O(n log n)` time. Correct, but it ignores the required counting-sort
  constraint and loses to the bounded frequency table.
- **Repeatedly pick the cheapest remaining bar:** correct but unnecessary; it simulates the
  sorted prefix one item at a time.
- **Hash map of frequencies:** counts prices but still needs ordered keys, adding sorting or
  tree overhead. Direct addressing is better because the value range is fixed.
- **Min-heap:** `O(n + k log n)` where `k` is bought count; dominated by the direct bucket
  sweep.

## See Also

Memory extreme (C, capped counting domain): `../../c/1833-maximum-ice-cream-bars/`.
