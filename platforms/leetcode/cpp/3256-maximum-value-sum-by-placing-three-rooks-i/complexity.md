# Complexity - LeetCode 3256: Maximum Value Sum by Placing Three Rooks I

Let `p = min(m, n)` and `q = max(m, n)`.

## Recommended - `solution.cpp` (prefix/suffix top-3 envelopes)

### Time Complexity

```text
O(p * q)
```

Each suffix or prefix top-three rebuild scans `q` coordinates, and each middle cell checks
only `3 x 3` side candidates.

### Space Complexity

```text
O(p + q)
```

Stores three suffix candidates per primary line and one best value per opposite coordinate.

## Speed extreme - `solution-runtime.cpp` (oriented stack arrays)

### Time Complexity

```text
O(p * q)
```

Same algorithm as the recommended solution, with lower constant factors in the hot path.

### Space Complexity

```text
O(p * q + p + q)
```

Uses an oriented board copy plus fixed suffix and prefix state.

## Memory extreme - C `solution-memory.c`

### Time Complexity

```text
O(C(p, 3) * q) = O(p^3 * q)
```

### Space Complexity

```text
O(1)
```

Only three local top-three buffers and scalar loop state are used.

## Top 1% Performance Strategy

- Recommended: process each possible middle line once and combine prefix/suffix top-three
  candidates instead of enumerating all line triples.
- Speed extreme: use a fixed oriented board copy and stack arrays to reduce branch and
  container overhead.
- Memory extreme: no heap allocation or retained candidate table, trading time for the
  smallest auxiliary footprint.
