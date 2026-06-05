# Complexity - LeetCode 3518: Smallest Palindromic Rearrangement II (C++ proposals)

## Recommended - `solution.cpp` (greedy trial counts + compact combinations)

### Time Complexity

```text
O(A^2 * m + R * m), effectively O(n)
```

For each of `m` half positions, at most `A = 26` candidate letters are tried, and each
multiset count scans the 26 letter counts. The compact binomial table is built for
`R = 32` useful widths.

### Space Complexity

```text
O(R * m + n)
```

The capped binomial table stores `(m + 1) * 33` integers. The result string is O(n).

## Speed extreme - `solution-runtime.cpp` (block ratio)

### Time Complexity

```text
O(A * m + R * m), effectively O(n)
```

Only one multinomial count is computed per position, then each candidate block is derived
with `total * count[c] / remaining`.

### Space Complexity

```text
O(R * m + n)
```

It uses the same compact capped binomial table and output storage as the recommended
variant.

## Memory extreme - `solution-memory.cpp` (on-demand combinations)

### Time Complexity

```text
O(A * R * m + A * m), effectively O(n)
```

Each on-demand binomial computation is capped after at most `R = 32` multiplicative steps,
because larger widths already exceed the maximum useful threshold.

### Space Complexity

```text
O(n)
```

Auxiliary state is only the 26 counts and scalar arithmetic; the output string dominates
reported space.

## Variables

- `n`: length of the input palindrome.
- `m`: `floor(n / 2)`, the length of the half that must be arranged.
- `A`: alphabet size, fixed at 26.
- `R`: maximum useful binomial width under the saturation thresholds, fixed at 32.
- `k`: requested 1-indexed rank, at most `1e6`.

## Top 1% Performance Strategy

- Recommended: compact capped combination lookup, fixed alphabet scans, and direct greedy
  construction of the left half.
- Runtime extreme: one exact-enough multinomial count per position plus the block-ratio
  identity, reducing repeated count calls.
- Memory extreme: no precomputed table, no heap structures beyond returned strings, and
  capped on-demand arithmetic.

## Optimization Notes

The runtime variant is the best wall-clock candidate for LeetCode because it cuts the
number of multinomial counts by up to a factor of 26. The recommended variant is the
cleanest fast default. The memory variant is useful when auxiliary storage is the main
metric; it is still linear for this fixed alphabet and cap.
