# Complexity - LeetCode 1833: Maximum Ice Cream Bars (C proposal)

## Memory extreme - `solution-memory.c` (capped-domain counting sort)

### Time Complexity

```text
O(n + A)
```

The algorithm scans the input once to find the affordable cap, scans it again to count
affordable prices, then sweeps the capped price range.

### Space Complexity

```text
O(A)
```

`A` is the largest input price that is initially affordable. If no price is affordable, the
algorithm returns before allocating a frequency table.

## Variables

- `n`: number of ice cream bars.
- `A`: largest `costs[i]` such that `costs[i] <= initial coins`; `0 <= A <= 100000`.
- `R`: global maximum possible price, `100000`.

## Top 1% Performance Strategy

- Preserve counting sort while trimming the table from `R` to the useful affordable domain
  `A`.
- Use one contiguous zeroed C buffer, avoiding object-heavy or ordered data structures.
- Buy whole buckets with arithmetic rather than per-item loops.
- Stop scanning when the remaining budget is smaller than the current price.

## See Also

Recommended and speed proposal (C++, fixed `R = 100000` table): `../../cpp/1833-maximum-ice-cream-bars`.
