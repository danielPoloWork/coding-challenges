# Complexity

## Recommended - `solution.cpp` (fast + lean)

### Time Complexity

```text
O((n + q) alpha(n))
```

Each tree edge is traversed once by the iterative DFS, each non-trivial query record is
inspected at most twice, and DSU operations are amortized inverse-Ackermann.

### Space Complexity

```text
O(n + q)
```

The algorithm stores flat tree adjacency, flat query adjacency, DSU arrays, depths,
finished markers, the DFS stack, powers of two, and the mandatory answer array.

## Speed extreme

Coincides with `solution.cpp`.

### Time Complexity

```text
O((n + q) alpha(n))
```

This is effectively linear for the input bounds and avoids binary lifting's `O(log n)`
query factor.

### Space Complexity

```text
O(n + q)
```

The speed-optimal Tarjan implementation remains linear-memory.

## Memory extreme

Coincides with `solution.cpp`.

### Time Complexity

```text
O((n + q) alpha(n))
```

No lower-memory accepted alternative improves the required tree/query scan.

### Space Complexity

```text
O(n + q)
```

Linear query adjacency is required by the offline LCA pass; this is still asymptotically
smaller than `O(n log n)` binary lifting or RMQ sparse-table variants.

## Variables

- `n`: number of tree nodes.
- `q`: number of queries.
- `alpha(n)`: inverse Ackermann function from DSU amortized analysis.

## Top 1% Performance Strategy

- Count assignments by closed form: `0` for distance `0`, otherwise `2^(distance - 1)`.
- Precompute powers of two modulo `1_000_000_007`.
- Use Tarjan offline LCA for near-linear processing of all queries.
- Store adjacency in compact forward-star arrays.
- Avoid recursion to handle worst-case tree depth.
- Skip explicit query records for `u == v`.

## Optimization Notes

Binary lifting is easier to write for online queries but costs `O(n log n)` memory and
`O(log n)` per query. Euler-tour RMQ improves query time to `O(1)` but still spends a large
sparse table. Since LeetCode provides the entire query batch at once, offline Tarjan is the
best fit for both runtime and memory.
