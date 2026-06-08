# Complexity - LeetCode 3563 (C memory proposal)

## Memory extreme - `solution-memory.c`

### Time Complexity

```text
O(n^3)
```

The removable interval table is built with fixed-word intersections in
`O(n^2 * ceil(n / 64))`. The suffix DP scans `O(n^2)` candidate kept characters, and each
linked suffix comparison can walk `O(n)` characters in the worst case.

### Space Complexity

```text
O(n^2 / 64 + n)
```

The implementation stores two fixed word-mask tables for intervals, plus `empty[]`,
`keep[]`, and the returned output buffer.

## Recommended and Speed Proposals

Implemented in C++ at
`../../cpp/3563-lexicographically-smallest-string-after-adjacent-removals/`.

## Variables

- `n`: length of `s`, at most `250`.

## Top 1% Performance Strategy

The C memory proposal keeps the algorithmic core dense and cache-friendly while removing
intermediate string storage and the runtime variant's comparison table. It is not the
fastest proposal, but it is the lowest-footprint one.

## Optimization Notes

The memory variant could add a comparison table to reduce suffix comparisons to `O(1)`,
but that would become the C++ runtime strategy and would no longer be the minimum-memory
proposal.
