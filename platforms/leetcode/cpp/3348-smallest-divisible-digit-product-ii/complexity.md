# Complexity - LeetCode 3348: Smallest Divisible Digit Product II (C++ proposals)

## Recommended - `solution.cpp` (rightmost pivot + compact `2/3` table)

### Time Complexity

```text
O(n + E2 * E3 + L), effectively O(n)
```

The scan tries at most nine replacement digits at each of `n` positions. Each feasibility
check is O(1) after the `min23` table is built. `L` is the returned answer length.

### Space Complexity

```text
O(E2 * E3 + L)
```

The only table stores minimum digit counts for remaining `2` and `3` exponents. The
answer string dominates output storage.

## Speed extreme - `solution-runtime.cpp` (residual transition graph)

### Time Complexity

```text
O(n + S + L), effectively O(n)
```

`S = (E2 + 1)(E3 + 1)(E5 + 1)(E7 + 1)` states are precomputed once. The pivot scan then
uses direct transition and minimum-length lookups.

### Space Complexity

```text
O(10 * S + L)
```

The variant stores one transition for each digit at each residual state, plus one minimum
length per state.

## Memory extreme - `solution-memory.cpp` (on-demand arithmetic)

### Time Complexity

```text
O(n + L)
```

The hidden constant is small: every feasibility test tries at most six possible counts of
digit `6` to compute the exact minimum number of `2/3`-covering digits.

### Space Complexity

```text
O(L), O(1) auxiliary beyond the returned string
```

It keeps only the four target exponents, four rolling prefix exponents, and scalar
temporaries.

## Variables

- `n`: `num.length`.
- `L`: returned answer length.
- `E2`, `E3`, `E5`, `E7`: required exponents of primes `2`, `3`, `5`, and `7` in `t`.
- `S`: number of residual exponent states in the runtime variant.

## Top 1% Performance Strategy

- Reduce divisibility to four integer exponent deficits.
- Preserve the longest possible prefix by scanning pivots from right to left.
- Use bulk suffix `1` appends and reconstruct only the short required factor core.
- Avoid per-position DP arrays; rolling counts are enough.
- Choose the transition-graph variant when wall-clock time matters more than memory.
