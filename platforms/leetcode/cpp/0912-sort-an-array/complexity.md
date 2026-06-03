# Complexity - LeetCode 912: Sort an Array (C++ proposals)

## Recommended - `solution.cpp` (introsort / std::sort)

### Time Complexity

```text
O(n log n)
```

### Space Complexity

```text
O(log n)
```

## Speed extreme - `solution-runtime.cpp` (counting sort)

### Time Complexity

```text
O(n + R)
```

Linear and comparison-free with `R ~ n` - the fastest of the proposals.

### Space Complexity

```text
O(R)
```

A fixed `count` array of `R = 100001` integers (~400 KB), independent of `n`.

## Variables

- `n`: number of elements in `nums`.
- `R`: size of the value range, `max - min + 1 = 100001`.

## See Also

Minimum-memory champion (C, in-place heapsort): `../../c/0912-sort-an-array` -
O(n log n) time, O(1) extra space.
