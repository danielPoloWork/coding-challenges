# Complexity - LeetCode 3409: Longest Subsequence With Decreasing Adjacent Difference (C++ proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed and
memory champion. The figures below describe all three axes.

Let:

- `n` be `nums.length`.
- `V = 300`, the number of possible values.
- `D = 299`, the maximum adjacent absolute difference.

## Recommended - `solution.cpp` (value-compressed threshold DP)

### Time Complexity

```text
O(n * V)
```

For each input value, the algorithm scans every possible difference once and then performs
one suffix-maximum pass over the current value row. Since `V = 300`, this is effectively
linear in `n` with a small fixed constant.

### Space Complexity

```text
O(V * D) = O(1) with respect to n
```

The DP table has `(300 + 1) * (299 + 2)` 16-bit cells. It does not grow with `n`.

## Speed Extreme

Coincides with the recommended solution. It avoids per-index transitions and uses the
small value universe to reduce the work to two direct candidate lookups per difference.

## Memory Extreme

Coincides with the recommended solution. The fixed value/difference table is already far
smaller than a per-index DP and stores no heap-backed containers.

## Top 1% Performance Strategy

- Use value compression from the original constraints instead of a generic per-index DP.
- Keep `best[v][d]` as a threshold state, so each transition is an `O(1)` table lookup.
- Apply suffix maxima only to the row touched by the current input value.
- Avoid `abs` by checking `x - d` and `x + d` directly.
- Store lengths in `unsigned short`, which is safe because the maximum answer is `10000`.

## Optimization Notes

No separate non-dominated runtime or memory variant is useful here. A per-index solution
uses more memory and usually more time. A lower-level C table would not improve the
asymptotic state, while managed or interpreted implementations add runtime overhead around
the same hot nested loops.
