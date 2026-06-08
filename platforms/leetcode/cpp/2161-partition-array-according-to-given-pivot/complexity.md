# Complexity - LeetCode 2161: Partition Array According to Given Pivot (C++ proposals)

## Recommended - `solution.cpp` (exact output buffer)

### Time Complexity

```text
O(n)
```

The algorithm performs one forward scan, one backward scan, and fills the pivot segment.

### Space Complexity

```text
O(n)
```

The returned vector contains `n` integers. No additional per-group lists are allocated.

## Speed extreme - coincides with `solution.cpp`

### Time Complexity

```text
O(n)
```

Every correct solution must inspect all elements and produce all returned elements. The
recommended pre-sized output-buffer method reaches that linear lower bound with tight
constant factors, so no separate `solution-runtime.cpp` is shipped.

### Space Complexity

```text
O(n)
```

Same exact-size returned vector as the recommended proposal.

## Memory extreme - `solution-memory.cpp` (recursive stable rotations)

### Time Complexity

```text
O(n log n)
```

Each stable partition satisfies `T(n) = 2T(n / 2) + O(n)` because each recursion level
rotates disjoint ranges whose total length is linear. The algorithm runs two such stable
partitions.

### Space Complexity

```text
O(log n)
```

Auxiliary memory is the recursion stack. The implementation mutates the input vector and
move-returns it, avoiding a separate result buffer beyond the required returned storage.

## Variables

- `n`: number of elements in `nums`.

## Top 1% Performance Strategy

- Recommended/speed: one exact output allocation, two classification scans, one pivot
  fill, contiguous writes, no list concatenation, no extra reversal.
- Memory: no auxiliary `n`-element buffer; stable rotations preserve order while using
  only stack storage.

## Optimization Notes

For actual LeetCode runtime percentile, `solution.cpp` is the preferred submission. The
memory variant is a genuine non-dominated proposal when auxiliary memory is the priority,
but its repeated rotations are not intended to beat the linear output-buffer method.
