# Complexity

This folder ships one Pareto-optimal OCaml proposal. The recommended, speed
extreme, and memory extreme all coincide.

## Recommended - `solution.ml` (fast + lean)

### Time Complexity

```text
O(10 * L)
```

`L` is the number of digits in the produced answer. The same-length search tries
at most ten digits at each position, and the longer fallback scans the same
fixed digit table.

Under the official constraints, `L <= 3`, so this is effectively constant time.

### Space Complexity

```text
O(10 + L)
```

The solver stores one 10-entry boolean table and one output buffer.

## Top 1% Performance Strategy

- Avoid scanning every integer from `n` upward.
- Avoid generating and sorting candidate strings.
- Use direct digit membership in a fixed boolean array.
- Stop searching as soon as the prefix is greater than the target.
- Fill the remaining suffix with the smallest working digit in one pass.

## Optimization Notes

The brute-force approach is already acceptable for `n < 1000`, but the selected
construction has smaller constant work and keeps the logic independent of the
numeric distance to the next typable number.
