# Complexity - LeetCode 2196: Create Binary Tree From Descriptions (C++ proposals)

## Recommended - `solution.cpp` (direct address by observed max value)

### Time Complexity

```text
O(n + M)
```

The algorithm scans the `n` descriptions to find `M`, initializes arrays of size `M + 1`,
builds all edges, and scans parent values to find the root. Since `M <= 100000`, this is
linear in practice under the platform constraint.

### Space Complexity

```text
O(k) tree nodes + O(M) auxiliary table space
```

`k <= n + 1` is the number of distinct node values, and `M` is the maximum value appearing in
the input. The returned tree nodes are required output; the direct-address `nodes` and
`isChild` arrays are auxiliary.

## Speed extreme - `solution-runtime.cpp` (fixed full-range direct address)

### Time Complexity

```text
O(n + V)
```

`V = 100000` is the fixed value upper bound used for zero-initializing the direct-address
tables. The edge build and root scan are both linear in `n`.

### Space Complexity

```text
O(k) tree nodes + O(V) auxiliary table space
```

The fixed pointer table covers every possible value in `0..100000`, and the child marks use a
compact bitset over the same range.

## Memory extreme - `solution-memory.cpp` (coordinate compression)

### Time Complexity

```text
O(n log n)
```

Collecting values is `O(n)`, sorting and deduplicating up to `2n` values is `O(n log n)`, and
each description performs binary searches over the compressed value list.

### Space Complexity

```text
O(k) tree nodes + O(k) auxiliary table space
```

The lookup arrays are sized by the `k <= n + 1` distinct node values instead of by the value
range. The compressed value vector, node pointer vector, and child marker vector are all
linear in `k`.

## Variables

- `n`: number of descriptions, equal to the number of edges (`1 <= n <= 10000`).
- `k`: number of distinct node values in the valid tree (`k <= n + 1`).
- `M`: maximum value appearing in the input (`1 <= M <= 100000`).
- `V`: full LeetCode value bound (`100000`).

## Top 1% Performance Strategy

- Recommended: direct pointer indexing, one node allocation per distinct value, byte child
  marks, and root detection by scanning only parent entries.
- Speed extreme: fixed arrays over the known bound remove sizing logic and keep the hot loop
  to direct pointer operations plus a bitset mark.
- Memory extreme: coordinate compression avoids sparse range tables and keeps the reduced
  structures contiguous, accepting `O(log k)` lookups for lower auxiliary memory.

## Optimization Notes

No proposal can beat `Omega(n)` edge processing because every description must be consumed
and every tree edge must be assigned. The main performance choice is whether to pay in table
space (direct addressing) or comparisons (coordinate compression). For LeetCode's value
bound, the recommended direct-address solution is the best default.
