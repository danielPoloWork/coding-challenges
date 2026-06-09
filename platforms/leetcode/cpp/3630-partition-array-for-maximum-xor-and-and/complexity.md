# Complexity - LeetCode 3630: Partition Array for Maximum XOR and AND (C++ proposals)

## Recommended - `solution.cpp` (subset tables + masked XOR basis)

### Time Complexity

```text
O(2^n * n * w)
```

The subset tables take `O(2^n)`. Across all `B` masks, the basis sees
`n * 2^(n-1)` remaining elements, each reduced over at most `w` bits.

### Space Complexity

```text
O(2^n + w)
```

The two subset tables dominate the auxiliary memory. The basis has at most `w` entries.

## Speed extreme - `solution-runtime.cpp` (static tables + upper-bound pruning)

### Time Complexity

```text
O(2^n * n * w)
```

The worst-case asymptotic bound matches the recommended variant. In practice, masks whose
upper bound cannot improve the answer skip basis construction, and masks whose projected
basis reaches full rank stop early.

### Space Complexity

```text
O(2^n + w)
```

The two static subset tables dominate auxiliary memory. The basis remains fixed-size.

## Memory extreme - `solution-memory.cpp` (recomputed subset values)

### Time Complexity

```text
O(2^n * n * w)
```

The basis work still dominates asymptotically. This version also performs linear scans to
recompute `AND(B)` and the remaining XOR for each mask.

### Space Complexity

```text
O(w)
```

Only the fixed XOR basis and scalar accumulators are used beyond the input. The method
keeps a const alias named `kelmaverno`, not an input copy.

## Variables

- `n`: number of elements in `nums`; `n <= 19`.
- `w`: number of active value bits; `w <= 30` because `nums[i] <= 1e9`.
- `B`: the subset assigned to the AND partition.
- `s`: XOR of all elements outside `B`.

## Top 1% Performance Strategy

- Enumerate only `B` masks, not all three-way assignments.
- Use `x + (s ^ x) = s + 2 * (x & ~s)` to reduce each remaining split to maximum subset
  XOR.
- Build a linear XOR basis over masked values.
- Use fixed-size basis arrays and compiler bit intrinsics.
- Precompute subset values in the recommended and runtime variants.
- Use static subset tables, upper-bound pruning, sorted local input, and full-rank early
  stopping in the runtime-chasing variant.

## Optimization Notes

The recommended solution is the best readable default: it is exact, fast, and uses only
small `2^n` tables. Use `solution-runtime.cpp` when pursuing lower wall-clock constants
from pruning. Use `solution-memory.cpp` when minimizing auxiliary storage is the
objective.
