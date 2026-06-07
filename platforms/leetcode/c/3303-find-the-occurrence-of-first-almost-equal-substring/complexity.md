# Complexity - LeetCode 3303 (C memory proposal)

## Memory extreme - `solution-memory.c`

### Time Complexity

```text
O(n + m)
```

The forward virtual Z pass, reversed virtual Z pass, and final window scan are all linear.

### Space Complexity

```text
O(n + m)
```

The implementation stores one reusable Z buffer of length `n + m + 1` and one left-match
array of length `n - m + 1`. It does not allocate joined or reversed strings.

## Recommended and Speed Proposals

Implemented in C++ at
`../../cpp/3303-find-the-occurrence-of-first-almost-equal-substring/`.

## Variables

- `n`: length of `s`.
- `m`: length of `pattern`.
- `w = n - m + 1`: number of candidate windows.

## Top 1% Performance Strategy

The C memory proposal preserves the linear Z-function algorithm while minimizing
allocation count and byte footprint. The virtual accessor costs a few index operations but
avoids materializing two joined strings and two reversed strings.

## Optimization Notes

Asymptotic memory is still `O(n + m)` because exact all-window prefix/suffix information is
needed for linear-time matching. The optimization here is the lower constant factor and
direct C allocation control.
