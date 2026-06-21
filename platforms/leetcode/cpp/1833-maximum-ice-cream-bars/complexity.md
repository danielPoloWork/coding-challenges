# Complexity - LeetCode 1833: Maximum Ice Cream Bars (C++ proposal)

## Recommended - `solution.cpp` (fixed-domain counting sort)

### Time Complexity

```text
O(n + R)
```

The algorithm counts `n` costs and scans the fixed price range once.

### Space Complexity

```text
O(R)
```

The fixed frequency table stores `R + 1 = 100001` integer counters.

## Speed extreme - coincides with `solution.cpp`

### Time Complexity

```text
O(n + R)
```

### Space Complexity

```text
O(R)
```

No separate runtime file is shipped because the recommended implementation already uses the
lowest-constant counting-sort path for this problem: fixed contiguous counters, no dynamic
allocation, and bucket-level purchases.

## Variables

- `n`: number of ice cream bars.
- `R`: maximum possible price, `100000`.

## Top 1% Performance Strategy

- Counting sort avoids `O(n log n)` comparison sorting.
- A fixed native array avoids heap allocation and keeps the scan cache-friendly.
- Whole-bucket purchases reduce duplicate prices to one division and one subtraction.
- Early stop prevents scanning prices that cannot be bought after the budget drops.

## See Also

Memory extreme (C, capped counting domain): `../../c/1833-maximum-ice-cream-bars` -
`O(n + A)` time and `O(A)` auxiliary space, where `A` is the largest initially affordable
price.
