# Complexity - LeetCode 2130: Maximum Twin Sum of a Linked List (C++ proposals)

## Recommended - `solution.cpp` (balanced in-place reversal)

### Time Complexity

```text
O(n)
```

Fast/slow midpoint discovery, second-half reversal, and pair scanning are all
linear over disjoint or half-list passes.

### Space Complexity

```text
O(1) extra
```

Only a fixed number of list pointers and one integer accumulator are stored.

## Speed extreme - `solution-runtime.cpp` (fixed local array)

### Time Complexity

```text
O(n)
```

The list is traversed once to copy values, then the fixed array is scanned from
both ends for `n / 2` twin sums.

### Space Complexity

```text
O(n)
```

The local `int[100000]` buffer stores all node values. This is deliberate: the
runtime target trades memory for contiguous, allocation-free scanning.

## Memory extreme

The memory extreme is implemented in C:
`../../c/2130-maximum-twin-sum-of-a-linked-list/solution-memory.c`.

### Time Complexity

```text
O(n)
```

### Space Complexity

```text
O(1) extra
```

## Variables

- `n`: number of nodes in the linked list.

## Top 1% Performance Strategy

- Balanced: reverse the second half in place, no auxiliary container.
- Runtime: fixed local array, no heap allocation, contiguous index scan.
- Memory: C implementation with no allocation and minimal runtime baseline.

## Optimization Notes

LeetCode's `0 ms` and memory-MB scoreboards are coarse and noisy. The runtime
variant is the best candidate for `0 ms`; the C memory variant is the best
candidate for low reported MB. Neither number is deterministic across judge
runs.
