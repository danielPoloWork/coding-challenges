# Complexity - LeetCode 3704: Count No-Zero Pairs That Sum to N (C++ proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed and
memory champion. The figures below describe all three axes.

## Recommended - `solution.cpp` (carry digit DP)

### Time Complexity

```text
O((D + 1) * 2 * 2 * 2 * 10 * 10) = O(D)
```

`D` is the number of decimal digits in `n`. The DP processes the `D` real digits plus one
sentinel zero digit. Each layer has two carry states and two alive flags for each addend,
and each transition tries at most ten digit choices per addend. Since `n <= 10^15`,
`D <= 16`, so the total work is a tiny constant in practice.

### Space Complexity

```text
O(2 * 2 * 2) = O(1) extra
```

Only the current and next DP layers are stored, plus a fixed digit array of size `20`.

## Speed Extreme

Coincides with the recommended solution. Any exact solution must read the decimal digits of
`n`; this DP reaches that `O(D)` shape with fixed arrays, no recursion, and no dynamic
containers.

## Memory Extreme

Coincides with the recommended solution. The algorithm already uses constant extra memory
independent of `n`, and removing the small two-layer DP would require recomputing equivalent
state counts.

## Variables

- `D`: number of decimal digits in `n` (`D <= 16`).
- `carry`: addition carry from lower positions, either `0` or `1`.
- `aliveA`, `aliveB`: whether each addend is still inside its decimal representation.

## Top 1% Performance Strategy

- Process from least significant digit to most significant digit so carry propagation is
  direct.
- Keep only eight DP states per layer.
- Use stack arrays and integer loops instead of maps, vectors, recursion, or strings.
- Append one zero digit to handle final carry and addend termination without special cases.
- Store all counts in `long long`.

## Optimization Opportunities

No meaningful asymptotic optimization remains for the stated constraints. Precomputing tiny
transition tables could shave a few branches, but it would make the implementation harder to
audit while preserving the same constant-space `O(D)` profile.

## See Also

None - the speed and memory extremes coincide with this proposal (see `notes.md`).
