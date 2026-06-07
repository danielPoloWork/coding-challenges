# Complexity - LeetCode 3303 (C++ proposals)

## Recommended - `solution.cpp` (fast + lean)

### Time Complexity

```text
O(n + m)
```

Two Z-function passes over strings of length `n + m + 1`, plus one window scan.

### Space Complexity

```text
O(n + m)
```

Stores one Z array, one left-match array for `n - m + 1` windows, and one joined working
string.

## Speed extreme - `solution-runtime.cpp`

### Time Complexity

```text
O(n + m)
```

Two pattern-Z computations and two Extended KMP scans, all linear.

### Space Complexity

```text
O(n + m)
```

Stores direct prefix and suffix LCP arrays, plus the pattern Z array and reversed strings.

## Memory extreme

Implemented in C at
`../../c/3303-find-the-occurrence-of-first-almost-equal-substring/solution-memory.c`.

### Time Complexity

```text
O(n + m)
```

### Space Complexity

```text
O(n + m)
```

The C variant has the lowest constants: one reusable Z buffer and one left-match array,
with no joined or reversed character buffers.

## Variables

- `n`: length of `s`.
- `m`: length of `pattern`.
- `w = n - m + 1`: number of candidate windows.

## Top 1% Performance Strategy

- Use exact linear string matching instead of per-window comparisons.
- Convert suffix matching into prefix matching on reversed strings.
- Return on the first valid index after the two linear preprocessing passes.
- Keep state in contiguous `int` arrays and avoid hash maps or heap-heavy structures.

## Optimization Notes

The recommended Z solution is the best maintainability/performance balance. The Extended
KMP variant is preferable when shaving string-construction overhead matters. The C memory
variant is preferable when the lowest allocation footprint is the priority.
