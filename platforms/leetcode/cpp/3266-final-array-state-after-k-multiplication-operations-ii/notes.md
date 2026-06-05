# Notes - LeetCode 3266: Final Array State After K Multiplication Operations II (C++ proposal)

## Problem Summary

Given `nums`, repeat `k` operations. Each operation selects the smallest value, breaking ties
by the earliest index, and replaces that value with `value * multiplier`. After all operations,
return the array modulo `1_000_000_007`.

The hard part is that `k` can be `1e9`, so direct simulation is impossible even though
`n <= 10000`.

## Three Proposals -> One File (Pareto-optimal)

This entry ships a single C++ file because the fastest and leanest practical strategies
coincide:

- **Recommended (`solution.cpp`) - fast + lean:** compact min-heap simulation until
  `min * multiplier > initialMax`, then distribute the remaining operations by sorted heap
  order and modular powers.
- **Speed extreme:** coincides with the recommended. The post-threshold cycle removes the
  `k` factor, and a packed `uint64_t` heap avoids heavier pair/node structures.
- **Memory extreme:** coincides with the recommended. The heap is the required ordering
  structure for accepted worst-case performance; packing `(value, index)` into one 64-bit key
  halves the common `pair<long long, int>` storage. A scan-only `O(1)` auxiliary approach is
  dominated because it can require billions of comparisons before the cycle.

There is no separate `solution-runtime.cpp` or `solution-memory.*` because those files would
be coincident rather than genuinely different, non-dominated proposals.

## Language Choice (C++)

The hot path is comparison-heavy heap maintenance over at most `n <= 10000` elements, followed
by one sort and one modular exponentiation. C++ is the strongest fit for this profile:

- Native integer arithmetic and branch-light heap operations have lower constant factors than
  managed or interpreted alternatives on LeetCode for this workload.
- `vector<uint64_t>` gives compact contiguous storage and cache-friendly heap/sort behavior.
- The `(value, index)` order can be represented as a single integer key because `index < 2^14`
  and simulated values stay at or below `initialMax <= 1e9`.
- The final huge multiplications are never materialized; only modular powers are computed.

This is a problem-specific performance choice from the constraints and data structures, not a
repository-wide language preference.

## Constraints

- `1 <= n == nums.length <= 10000`.
- `1 <= nums[i] <= 1e9`.
- `1 <= k <= 1e9`.
- `1 <= multiplier <= 1e6`.
- Values are selected using their exact pre-modulo values; modulo is applied only at the end.

## Key Observations

1. If `multiplier == 1`, operations do nothing; return `nums`.
2. While the current minimum multiplied by `multiplier` is still `<= initialMax`, direct
   simulation is safe and bounded: the updated value remains inside the initial value range.
3. Once `min * multiplier > currentMax` (and here `currentMax` is still `initialMax`), the
   multiplied minimum moves behind every unprocessed element. The next selected elements are
   exactly the sorted `(value, index)` order.
4. After a full pass, every value has been multiplied once, so the same sorted order repeats.
   The remaining operations split into `remaining / n` full rounds plus `remaining % n`
   leading extras.

## Reasoning Process

The direct min-heap simulation is correct but costs `O(k log n)`, which is too large for
`k = 1e9`. The hints point to the moment when multiplying the smallest value sends it beyond
the current maximum. At that moment, the operation no longer changes which unprocessed element
will be chosen next: the multiplied item is too large to be chosen again before every other
item has had its turn.

So the algorithm keeps the exact simulation only for the non-cyclic prefix. Because every
simulated multiplication is required to stay `<= initialMax`, each element can be simulated
only `O(log_multiplier(initialMax))` times; with `initialMax <= 1e9` and `multiplier >= 2`,
that is at most about 30 times per element. The massive suffix is then pure arithmetic:
sort the current heap by `(value, index)`, give every entry `fullRounds` multiplications, and
give the first `extra` entries one additional multiplication.

## Final Approach

1. Return immediately when `multiplier == 1`.
2. Store each item as `key = (value << 14) | index`, which preserves `(value, index)` ordering.
3. Build a min-heap over the packed keys.
4. While operations remain and `minValue * multiplier <= initialMax`, pop the minimum, multiply
   it, repack it, and push it back.
5. If no operations remain, write the heap values back to their original indices.
6. Otherwise sort the heap keys. Let `q = remaining / n` and `r = remaining % n`.
7. Compute `multiplier^q mod MOD` once. The first `r` sorted entries use one extra multiplier.
8. Write each final modular value back to its original index.

## Why This Approach

The solution keeps the exact tie-breaking semantics through the packed key order. It also avoids
materializing astronomical values: after the cyclic boundary, exponents are handled with binary
modular exponentiation.

The time-space trade-off is favorable on both axes. A heap is enough to maintain exact minima
during the short non-cyclic prefix, and the same contiguous buffer is sorted for the cyclic
suffix. Alternatives either simulate all `k` operations, scan the whole array for every prefix
operation, or store heavier heap nodes without improving asymptotic behavior.

## Top 1% Performance Strategy

- Stop direct simulation at the cycle boundary, removing the `1e9` factor.
- Use packed `uint64_t` keys instead of `pair<long long, int>` to reduce heap memory and improve
  comparison/cache constants.
- Build the heap in `O(n)` with `make_heap` over a pre-reserved vector.
- Sort the same heap buffer for the final cyclic order instead of allocating a second list.
- Compute `multiplier^q` once, then derive the extra factor with one multiplication.
- Reuse `nums` as the write-back buffer.

## Edge Cases

- `multiplier == 1`: unchanged array.
- `n == 1`: all operations become one modular power on the only value.
- Duplicate minima: packed key order uses index bits, so ties select the earliest index.
- `min * multiplier == initialMax`: still simulated, because the updated item may remain tied
  with the maximum and the cycle condition is not strict yet.
- Very large `k`: handled by quotient/remainder distribution and `O(log k)` modular exponent.

## Alternatives

- **Full heap simulation:** correct but `O(k log n)`, impossible for `k = 1e9`.
- **Repeated linear scan for the minimum:** saves heap storage but can require
  `O(n^2 log initialMax)` comparisons before the cycle and is dominated for accepted
  performance.
- **`priority_queue<pair<long long, int>>`:** same asymptotic algorithm, but stores a padded
  pair and pays heavier comparisons than the packed-key vector.
- **Modulo during simulation:** invalid, because selection must use exact values until all
  operations are done.

## See Also

None - the speed and memory extremes coincide with `solution.cpp`, as explained above.
