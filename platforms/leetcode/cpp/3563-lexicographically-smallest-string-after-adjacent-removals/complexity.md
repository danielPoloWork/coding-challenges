# Complexity - LeetCode 3563 (C++ proposals)

## Recommended - `solution.cpp` (fast + lean)

### Time Complexity

```text
O(n^3)
```

The removable-interval DP uses bitset intersections, costing
`O(n^2 * ceil(n / word_bits))`. The suffix-answer phase scans `O(n^2)` candidates and can
compare or copy strings of length `O(n)`, so the overall worst-case bound is `O(n^3)`.

### Space Complexity

```text
O(n^2)
```

The removable table is `O(n^2)` bits, and the stored suffix strings can total `O(n^2)`
characters in the worst case.

## Speed extreme - `solution-runtime.cpp`

### Time Complexity

```text
O(n^2 * ceil(n / word_bits))
```

Fixed-word intersections build removable intervals. The linked answer DP scans candidates
and fills the suffix comparison table in `O(n^2)`, with `O(1)` candidate comparison.

### Space Complexity

```text
O(n^2)
```

The runtime variant stores removable masks plus an `O(n^2)` byte table for answer ordering.

## Memory extreme

Implemented in C at
`../../c/3563-lexicographically-smallest-string-after-adjacent-removals/solution-memory.c`.

### Time Complexity

```text
O(n^3)
```

It keeps the same word-mask removable DP but compares linked suffix answers by walking
them, which can cost `O(n)` per candidate comparison.

### Space Complexity

```text
O(n^2 / word_bits + n)
```

It stores two bit-mask interval tables plus `O(n)` linked answer state and the returned
string.

## Variables

- `n`: length of `s`, at most `250`.
- `word_bits`: number of bits in the machine word used for interval masks, `64` in these
  implementations.

## Top 1% Performance Strategy

- Dense interval DP over even lengths only.
- Word-level intersections for split detection.
- No substring extraction during removability checks.
- Runtime variant uses linked answer states and a precomputed comparison table to avoid
  repeated string work.
- C memory variant drops the comparison table and all intermediate strings when memory is
  the priority.

## Optimization Notes

For this constraint size, the recommended C++ solution is already comfortably fast and is
the easiest to audit. The runtime C++ solution is the sharper judge-time implementation.
The C memory solution is preferable when reported peak memory is the objective.
