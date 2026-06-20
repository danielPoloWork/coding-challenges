# Complexity - LeetCode 1732: Find the Highest Altitude (C++ proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed and
memory champion. The figures below describe all three axes.

## Recommended - `solution.cpp` (running altitude maximum)

### Time Complexity

```text
O(n)
```

The algorithm reads each gain exactly once. This is optimal because any unread gain might
create the highest altitude.

### Space Complexity

```text
O(1)
```

The algorithm stores only the current altitude and the highest altitude seen so far.

## Speed Extreme

Coincides with the recommended solution. One linear pass is the lower bound and the loop
does only one addition and one comparison per element.

## Memory Extreme

Coincides with the recommended solution. No auxiliary array or container can improve on
constant extra space.

## Variables

- `n`: length of `gain`, with `1 <= n <= 100`.
- `altitude`: current altitude after applying the processed gains.
- `highest`: maximum altitude among all points visited so far, including the start.

## Top 1% Performance Strategy

- Avoid materializing the prefix-sum altitude array.
- Avoid repeated prefix recomputation.
- Use two scalar `int` values under proven-safe bounds.
- Scan the judge-provided contiguous `vector<int>` once.

## Optimization Opportunities

No meaningful non-dominated optimization remains. Any correct solution must read every
gain, and the answer needs only two scalar states.
