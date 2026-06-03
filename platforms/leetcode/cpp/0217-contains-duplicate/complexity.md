# Complexity - LeetCode 217: Contains Duplicate (C++ proposals)

## Recommended - `solution.cpp` (in-place sort)

### Time Complexity

```text
O(n log n)
```

### Space Complexity

```text
O(1) extra
```

## Speed extreme - `solution-runtime.cpp` (flat hash set)

### Time Complexity

```text
O(n) average
```

Worst case O(n^2) only under adversarial hash collisions, made negligible by the
Murmur3-style finalizer.

### Space Complexity

```text
O(n)
```

Two arrays sized to the next power of two >= 2n.

## Variables

- `n`: number of elements in `nums`.

## See Also

Minimum-memory champion (C, in-place `qsort`): `../../c/0217-contains-duplicate` -
O(n log n) time, O(1) extra space.
