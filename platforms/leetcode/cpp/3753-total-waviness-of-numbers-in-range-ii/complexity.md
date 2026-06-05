# Complexity - LeetCode 3753: Total Waviness of Numbers in Range II (C++ proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed and
memory champion. The figures below describe all three axes.

## Recommended - `solution.cpp` (compressed digit DP)

### Time Complexity

```text
O(D * 3 * 10 * 3 * 10) = O(D)
```

`D` is the number of decimal digits in the upper bound. There are at most `D` positions,
three `used` states (`0`, `1`, `2+`), ten previous digits, three comparison signs, and ten
candidate next digits. Since `num2 <= 10^15`, `D <= 16`, so this is a very small fixed
amount of work. The method runs twice: once for `num2`, once for `num1 - 1`.

### Space Complexity

```text
O(D * 3 * 10 * 3) = O(1) extra
```

The memo table has a compile-time maximum of `20 * 3 * 10 * 3` states, each storing two
`long long` values, plus a matching boolean table. The recursion depth is at most `D <= 16`.
No heap allocation is used by the DP.

## Speed Extreme

Coincides with the recommended solution. Any prefix-counting approach must inspect the
decimal boundary digits, and this DP reaches that `O(D)` lower-bound shape with fixed
state, tiny constants, and no dynamic containers.

## Memory Extreme

Coincides with the recommended solution. The algorithm uses only constant extra memory
independent of the numeric range size; removing the small fixed memo table would either
recompute suffixes exponentially or replace it with an equivalent fixed precomputation.

## Variables

- `D`: number of decimal digits in the bound (`D <= 16`).
- `used`: meaningful digit count capped at `2`.
- `prev`: previous meaningful digit.
- `cmp`: sign of the previous adjacent comparison, one of `-1`, `0`, `+1`.

## Top 1% Performance Strategy

- Compress state to `prev` plus comparison sign instead of keeping two previous digits.
- Return `{waves, count}` so a new wave contributes to an entire suffix block at once.
- Memoize only non-tight states in fixed arrays.
- Avoid heap allocation and associative containers.
- Use 64-bit counters because the range total can exceed 32-bit limits.

## Optimization Opportunities

No meaningful asymptotic optimization remains: the work is linear in the number of boundary
digits and the memory is constant. A closed-form positional counter could reduce a few
constant operations, but it is more complex around tight bounds and does not justify a
separate non-dominated proposal for `D <= 16`.

## See Also

None - the speed and memory extremes coincide with this proposal (see `notes.md`).
