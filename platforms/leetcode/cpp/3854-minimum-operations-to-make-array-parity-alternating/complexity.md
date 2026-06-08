# Complexity - LeetCode 3854: Minimum Operations to Make Array Parity Alternating (C++ proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed and
memory champion. The figures below describe all three axes.

## Recommended - `solution.cpp` (endpoint-greedy parity scan)

### Time Complexity

```text
O(n)
```

The algorithm scans the array once to find `min(nums)` and `max(nums)`, then scans it twice
more to evaluate the two possible alternating parity patterns. This is `3n` scalar visits,
which is linear.

### Space Complexity

```text
O(1) auxiliary
```

Only scalar extrema, loop counters, and two candidate answer pairs are stored. The returned
two-element vector is required output.

## Speed Extreme

Coincides with the recommended solution. Any correct algorithm must inspect every input
value to count parity mismatches and determine the range endpoints, so `Omega(n)` time is
unavoidable. The implementation reaches that bound without sorting or auxiliary containers.

## Memory Extreme

Coincides with the recommended solution. The range is computed from endpoint behavior, so no
adjusted array, heap, set, or sorted list of candidate values is needed.

## Variables

- `n`: number of values in `nums`.
- `mn`, `mx`: original global minimum and maximum.
- `evenIndexParity`: required parity at index `0`; the rest of the pattern follows by
  XORing with `i & 1`.
- `low`, `high`: minimum and maximum adjusted/proxy values for one fixed pattern.

## Top 1% Performance Strategy

- Evaluate only the two legally possible parity patterns.
- Count mismatches and compute range in the same pass for each pattern.
- Pull only mismatched global endpoints inward; keep internal mismatches as range proxies.
- Use stack scalars and a fixed-size `array<int, 2>` for candidate answers.
- Avoid `O(n log n)` allowed-value sorting and `O(n)` temporary storage.

## Optimization Opportunities

No meaningful asymptotic improvement remains for the stated constraints. A single combined
pass could maintain both pattern candidates at once, but it would duplicate branches inside
one loop and make the endpoint proof less transparent without changing the linear,
constant-memory profile.
