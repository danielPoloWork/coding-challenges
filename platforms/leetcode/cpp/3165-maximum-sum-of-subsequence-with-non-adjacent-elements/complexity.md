# Complexity - LeetCode 3165: Maximum Sum of Subsequence With Non-adjacent Elements (C++ proposal)

## Recommended - `solution.cpp` (iterative max-plus segment tree)

### Time Complexity

```text
O(n + q log n)
```

Building the tree writes `O(n)` leaves and computes `O(n)` internal nodes. Each query
updates one leaf and recomposes one path to the root, which has height `O(log n)`.

### Space Complexity

```text
O(n)
```

The segment tree stores one 2x2 matrix, represented as four `long long` values, for each
tree node.

## Speed extreme

The speed extreme coincides with `solution.cpp`. Online point updates require retaining
composable interval summaries; the iterative C++ segment tree gives the asymptotically
optimal practical approach for this DP.

### Time Complexity

```text
O(n + q log n)
```

### Space Complexity

```text
O(n)
```

## Memory extreme

The memory extreme also coincides with `solution.cpp`. A full recomputation after each
query can use `O(1)` extra memory but is `O(nq)` and not viable under the constraints.
Among accepted online approaches, the four-state segment summary is the compact required
state.

### Time Complexity

```text
O(n + q log n)
```

### Space Complexity

```text
O(n)
```

## Variables

- `n`: length of `nums`.
- `q`: number of update queries.
- `MOD`: `1e9 + 7`, used only for the accumulated return value.

## Top 1% Performance Strategy

- Fixed-size struct per node, no maps, hashing, nested vectors, or heap allocation during
  updates.
- Iterative segment tree over a power-of-two base with identity padding.
- Inlined max-plus composition with eight additions and four max operations per internal
  recomputation.
- `long long` arithmetic for exact DP values, with modulo deferred to the query-total sum.

## Optimization Notes

The constants can be shaved further with raw arrays, but the asymptotic behavior and memory
shape remain the same. The current implementation keeps the hot path branch-light and
readable while staying close to the practical performance floor on LeetCode's C++ runner.
