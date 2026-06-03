# Complexity - LeetCode 912: Sort an Array (C proposal)

## Memory extreme - `solution-memory.c` (in-place heapsort)

### Time Complexity

```text
O(n log n)
```

`O(n)` to build the heap, then `n` extractions of `O(log n)` each.

### Space Complexity

```text
O(1) extra
```

Sorts in place; the iterative sift-down avoids any recursion stack.

## Variables

- `n`: number of elements in `nums`.

## See Also

Recommended (introsort, O(n log n) / O(log n)) and speed (counting sort, O(n + R) / O(R))
proposals are in C++: `../../cpp/0912-sort-an-array`.
