# Complexity - LeetCode 3699: Number of ZigZag Arrays I (C memory proposal)

## Recommended - `../../cpp/3699-number-of-zigzag-arrays-i/solution.cpp`

### Time Complexity

```text
O(n * m)
```

The C++ proposal computes one linear reversed-prefix layer per array length.

### Space Complexity

```text
O(m)
```

It uses two `m`-active fixed stack buffers.

## Speed Extreme

The speed extreme coincides with the C++ recommended proposal.

### Time Complexity

```text
O(n * m)
```

### Space Complexity

```text
O(m)
```

## Memory Extreme - `solution-memory.c`

### Time Complexity

```text
O(n * m)
```

It runs the same mirrored recurrence as the C++ proposal.

### Space Complexity

```text
O(m)
```

Only one `m`-active `int[2000]` stack buffer is used. The asymptotic class remains O(m),
but the explicit DP buffer count is half of the two-buffer runtime proposal.

## Variables

- `n`: required array length.
- `m`: number of usable values, `r - l + 1`.
- `y`: zero-based value rank.
- `mirror`: rank whose old count contributes next in the reversed-prefix transform.

## Top 1% Performance Strategy

- Reuse the symmetry-reduced O(n * m) recurrence.
- Update the reversed-prefix transform in-place.
- Avoid dynamic allocation and containers.
- Keep modulo additions branch-light.

## Optimization Notes

This is the right variant when explicit auxiliary storage is the priority. For normal
runtime scoring, the C++ two-buffer proposal is preferable because its memory cost is
still tiny and its loop is simpler.
