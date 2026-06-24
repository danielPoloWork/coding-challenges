# Complexity - LeetCode 3700: Number of ZigZag Arrays II (C++ Pareto-optimal)

## Recommended - `solution.cpp` (linear recurrence from mirrored rank DP)

### Time Complexity

```text
O(m^2 + d^2 log n)
```

`m = r - l + 1` and `d <= m` is the recovered recurrence order. Generating `2m + 5`
initial terms costs O(m^2), Berlekamp-Massey on that prefix is O(m^2), and Kitamasa
computes the requested term in O(d^2 log n).

### Space Complexity

```text
O(m)
```

The implementation stores two `m`-active DP buffers, O(m) sampled terms, O(d) recurrence
coefficients, and O(d) polynomial buffers.

## Speed Extreme

The speed extreme is the same file, `solution.cpp`.

### Time Complexity

```text
O(m^2 + d^2 log n)
```

This dominates direct matrix exponentiation, which would require O(m^3 log n) dense matrix
work even after symmetry reduction.

### Space Complexity

```text
O(m)
```

No transition matrix is materialized.

## Memory Extreme

The memory extreme is the same file, `solution.cpp`.

### Time Complexity

```text
O(m^2 + d^2 log n)
```

The memory-minimal path keeps the same recurrence computation; no slower fallback is
needed to reduce the footprint.

### Space Complexity

```text
O(m)
```

An exact logarithmic-in-`n` solution still needs the small recurrence or equivalent state.
This is asymptotically smaller than storing an `m x m` or `2m x 2m` matrix.

## Variables

- `n`: required array length.
- `m`: number of usable values, `r - l + 1`.
- `d`: minimal recurrence order recovered by Berlekamp-Massey, with `d <= m`.
- `up[y]`: count of current-length arrays ending at rank `y` whose last comparison is up.

## Top 1% Performance Strategy

- Use the same alternating-sign observation as the finite variant.
- Reduce two directions to one by rank-mirror symmetry.
- Generate only the small prefix required to identify the recurrence.
- Use Berlekamp-Massey to avoid dense matrix powers.
- Use Kitamasa for O(d^2 log n) exponentiation with O(d) buffers.

## Optimization Notes

For `m <= 75`, the hinted matrix exponentiation is acceptable, but it is not the strongest
performance point. The recurrence approach is smaller and faster while remaining a direct
consequence of the same fixed transition matrix.
