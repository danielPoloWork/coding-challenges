# Complexity - LeetCode 3256: Maximum Value Sum by Placing Three Rooks I (C memory)

Let `p = min(m, n)` and `q = max(m, n)`.

## Memory extreme - `solution-memory.c`

### Time Complexity

```text
O(C(p, 3) * q) = O(p^3 * q)
```

For every triple on the smaller dimension, the algorithm scans the larger dimension once
and then checks 27 candidate placements.

### Space Complexity

```text
O(1)
```

The only auxiliary state is three local top-three lists and scalar loop variables.

## Cross-Referenced C++ Proposals

- Recommended C++ prefix/suffix top-3: `O(p * q)` time, `O(p + q)` space.
- Runtime C++ oriented stack arrays: `O(p * q)` time, `O(p*q + p + q)` space.

## Top 1% Performance Strategy

The memory proposal is optimized for peak footprint rather than raw runtime: no heap
allocation, fixed scalar buffers, smaller-dimension orientation, and no retained candidate
table.
