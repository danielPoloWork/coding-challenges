# Complexity - LeetCode 1840: Maximum Building Height (C memory)

Let `m = restrictionsSize`.

## Memory Extreme - `solution-memory.c`

### Time Complexity

```text
O(m log m)
```

`qsort` orders the restricted building IDs. The left relaxation, right relaxation, and peak
scan are each `O(m)`.

### Space Complexity

```text
O(1) extra
```

The proposal mutates the provided rows in place and stores only scalar IDs, heights, and
the best answer. The C library sorting stack is not an explicit auxiliary data structure
owned by the algorithm.

## Cross-Referenced C++ Proposal

- Recommended and fastest-runtime C++ compact-pair envelope:
  `O(m log m)` time and `O(m)` auxiliary space.

## Top 1% Performance Strategy

This variant targets memory rather than raw runtime: no compact copy, no per-building
array, no heap allocation, and no extra endpoint rows.
