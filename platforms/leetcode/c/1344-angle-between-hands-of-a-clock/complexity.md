# Complexity - LeetCode 1344: Angle Between Hands of a Clock (C proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed extreme
and the memory extreme.

## Recommended - `solution.c` (integer-scaled closed form)

### Time Complexity

```text
O(1)
```

The function executes a fixed number of arithmetic operations and branches, independent of
`hour` and `minutes`.

### Space Complexity

```text
O(1)
```

Only a few scalar local variables are stored. There is no heap allocation, auxiliary array, or
data structure.

## Variables

- `hour`: the hour value in `[1, 12]`.
- `minutes`: the minute value in `[0, 59]`.
- `diff`: the absolute hand distance measured in half-degrees.

## Top 1% Performance Strategy

- Convert the problem to half-degree integer units, avoiding floating-point work until the
  final return.
- Collapse the clock wrap-around to one complement branch: `diff > 360 ? 720 - diff : diff`.
- Avoid library calls and allocations; the hot path is only scalar arithmetic.
- Use C's direct scalar function signature for the smallest practical language/runtime
  baseline on LeetCode.

## Optimization Opportunities

None that change the asymptotics or meaningful constants. `O(1)` time and `O(1)` auxiliary
space are both optimal, and the current implementation already uses the minimum information
needed to determine the angle.

## See Also

None - the speed and memory extremes coincide with this proposal (see `notes.md`).
