# Complexity - LeetCode 3260: Find the Largest Palindrome Divisible by K (C++ proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed and
memory champion. The figures below describe all three axes.

## Recommended - `solution.cpp` (closed-form divisibility construction)

### Time Complexity

```text
O(n)
```

The returned string has length `n`, so writing `n` characters is unavoidable. Each divisor
case performs only constant additional work: at most a few symmetric edge writes, one center
adjustment, or an eleven-character central block for `k = 7`.

### Space Complexity

```text
O(n) output, O(1) auxiliary
```

The answer string dominates memory. The algorithm keeps only scalar variables and fixed
string literals.

## Speed Extreme

Coincides with the recommended solution. No exact implementation can asymptotically beat
`O(n)`, because it must return an `n`-character string. This construction reaches that
bound with minimal constant factors.

## Memory Extreme

Coincides with the recommended solution. The algorithm already uses constant auxiliary
space beyond the returned string; any accepted solution must allocate or return the same
`n` output characters.

## Variables

- `n`: required number of digits in the returned palindrome.
- `k`: divisor, constrained to `1..9`.
- `m`: central block length used by the `k = 7` construction.

## Top 1% Performance Strategy

- Replace modulo DP with divisor-specific closed forms.
- Initialize the final answer once.
- Overwrite only forced positions.
- Use the periodicity `10^6 == 1 (mod 7)` to reduce the hardest case to a tiny central
  lookup table.
- Keep auxiliary memory independent of `n`.

## Optimization Opportunities

No meaningful asymptotic optimization remains. Micro-optimizations would only rearrange the
same output-bound work and would make the case analysis harder to audit.
