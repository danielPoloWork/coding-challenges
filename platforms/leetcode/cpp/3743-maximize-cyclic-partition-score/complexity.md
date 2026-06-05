# Complexity - LeetCode 3743: Maximize Cyclic Partition Score (C++ proposals)

## Recommended - `solution.cpp` (9-state cyclic DP)

### Time Complexity

```text
O(nk)
```

For each of `n` values, the DP scans `k + 1` completed-pair counts and a constant 9
combined `(startState, currentState)` states.

### Space Complexity

```text
O(k)
```

The table stores `9 * (k + 1)` `long long` values.

## Speed extreme - `solution-runtime.cpp` (unrolled fixed-array DP)

### Time Complexity

```text
O(nk)
```

The same state transitions as the recommended solution are manually unrolled.

### Space Complexity

```text
O(k)
```

Uses a fixed `1001 x 9` `long long` table, matching the LeetCode constraint
`k <= 1000`.

## Memory extreme - `solution-memory.cpp` (single-start DP)

### Time Complexity

```text
O(nk)
```

It performs three O(nk) passes, one for each cyclic start state. The constant factor is
higher than the recommended/runtime variants.

### Space Complexity

```text
O(k)
```

Stores `3 * (k + 1)` `long long` values, one third of the active DP state count used by
the combined-start variants.

## Variables

- `n`: length of `nums`.
- `k`: maximum number of partition subarrays.
- `closedPairs`: number of completed non-zero range segments represented by signed
  max/min pairs.

## Top 1% Performance Strategy

- Recommended: pair-count DP rather than literal `2k` pick-count DP, three-state balance,
  in-place descending updates, and one pass over all cyclic starts.
- Speed extreme: fixed stack table and manual unrolling remove container iteration from
  the hot path.
- Memory extreme: computes each cyclic start independently to reduce the active state
  count from 9 to 3.

## Optimization Notes

The O(nk) bound is already tight for this DP model and is easily within the constraints.
The runtime variant is the best submission candidate for wall-clock speed; the
recommended variant is the easiest high-performance version to audit; the memory variant
is useful when auxiliary memory reporting matters more than constant-factor runtime.
