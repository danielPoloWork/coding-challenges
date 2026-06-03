# Complexity - LeetCode 3635: Earliest Finish Time for Land and Water Rides II (C++ proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed and
memory champion. The figures below therefore describe all three axes at once.

## Recommended - `solution.cpp` (linear min-reduction, both orders)

### Time Complexity

```text
O(n + m)
```

Four linear passes total: two to compute `bestLandFinish` and `bestWaterFinish`, and two to
combine each order. This meets the `Omega(n + m)` lower bound (every ride must be read once),
so it is also the speed extreme.

### Space Complexity

```text
O(1) extra
```

Only a few scalar accumulators (`bestLandFinish`, `bestWaterFinish`, `answer`); no arrays,
no sorting, no hashing. This is the memory floor, so it is also the memory extreme.

## Variables

- `n`: number of land rides (`landStartTime.length == landDuration.length`).
- `m`: number of water rides (`waterStartTime.length == waterDuration.length`).

## Top 1% Performance Strategy

- Monotonicity insight collapses the `O(n * m)` pairing to `O(n + m)` with no sort and no
  binary search.
- `O(1)` extra space - zero heap allocation, cache-friendly contiguous scans.
- 32-bit `int` arithmetic (all sums `<= ~3 * 10^5`); branchless `std::min` / `std::max`.

## Optimization Opportunities

None that change the asymptotics: `O(n + m)` time and `O(1)` extra space are both optimal.
The four passes could be fused into three (compute one category's best finish, then combine
the other category in the same loop), a constant-factor micro-tweak that does not change the
complexity class and is omitted for readability.

## See Also

None - the speed and memory extremes coincide with this proposal (see `notes.md`).
