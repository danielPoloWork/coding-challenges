# Complexity

## Recommended - `solution.cpp` (fast + lean)

### Time Complexity

```text
O(n^2 log n)
```

### Space Complexity

```text
O(n)
```

## Speed extreme - `solution-runtime.cpp`

### Time Complexity

```text
O(n^2 log n)
```

### Space Complexity

```text
O(n)
```

## Memory extreme - `solution-memory.cpp`

### Time Complexity

```text
O(n^2 log^2 n)
```

### Space Complexity

```text
O(n)
```

The memory variant uses fewer live mutable order-statistic arrays, but outside `kth`
queries are computed through complement prefixes and an additional binary search over the
compressed value domain.

## Variables

- `n`: length of `nums`.
- `k`: maximum number of allowed swaps.
- `u`: number of distinct values after coordinate compression, with `u <= n`.

## Top 1% Performance Strategy

- The recommended variant uses two Fenwick trees so inside and outside order statistics
  are both `O(log u)`.
- The runtime variant keeps the same asymptotics but replaces vectors and object copies
  in the hot path with fixed arrays and scalar totals.
- The memory variant stores one mutable Fenwick tree and computes outside state from
  global prefixes, trading runtime for a lower mutable memory footprint.

## Optimization Notes

For the stated `n <= 1500`, enumerating all intervals is the right outer structure. The
critical optimization is not to sort or rebuild per interval: each right extension moves
one value between maintained rank-sum structures. The profitable swap count is found by
checking the two global value thresholds around the inside/outside crossing, avoiding a
per-window binary search over `t`.
