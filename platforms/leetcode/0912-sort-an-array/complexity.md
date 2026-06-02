# Complexity - LeetCode 912: Sort an Array

Three genuinely distinct solutions are provided, one per axis.

## Recommended - `solution.cpp` (introsort / std::sort)

### Time Complexity

```text
O(n log n)
```

Introsort: quicksort with a heapsort fallback (so no O(n^2) worst case) and insertion
sort for small partitions.

### Space Complexity

```text
O(log n)
```

Only the recursion/bookkeeping stack; sorts in place.

## Speed extreme - `solution-runtime.cpp` (counting sort)

### Time Complexity

```text
O(n + R)
```

One pass to tally, one pass to emit. With `R ~ n` this is linear and comparison-free -
the fastest of the three.

### Space Complexity

```text
O(R)
```

A fixed `count` array of `R = 100001` integers (~400 KB), independent of `n`.

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
- `R`: size of the value range, `max - min + 1 = 100001` for this problem.

## Top 1% Performance Strategy

- Speed: comparison-free linear counting sort; cache-friendly contiguous count array.
- Memory: in-place heapsort, iterative sift-down, zero allocation.
- Recommended: the standard library's tuned introsort with an inlined comparator.

## Optimization Notes

- Counting sort is only valid because the value range is bounded; for an unbounded range
  fall back to the recommended introsort.
- If stability were required (it is not here), merge sort would be the alternative, at
  `O(n)` extra space.
