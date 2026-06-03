# Complexity - LeetCode 217: Contains Duplicate (C proposal)

## Memory extreme - `solution-memory.c` (in-place qsort)

### Time Complexity

```text
O(n log n)
```

Dominated by the in-place sort; the adjacency scan is O(n).

### Space Complexity

```text
O(1) extra
```

In place; the only extra memory is `qsort`'s O(log n) recursion stack. No auxiliary array.

## Variables

- `n`: number of elements in `nums`.

## See Also

Recommended (`std::sort`, O(n log n) / O(1) extra) and speed (flat hash, O(n) avg / O(n))
proposals are in C++: `../../cpp/0217-contains-duplicate`.
