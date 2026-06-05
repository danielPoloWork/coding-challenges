# Complexity - LeetCode 3463: Check If Digits Are Equal in String After Operations II (C++ proposals)

## Recommended - `solution.cpp` (streamed coefficient recurrence)

### Time Complexity

```text
O(n)
```

Each binomial coefficient is consumed once. Stripping factors of `2` and `5` from the
recurrence operands is linear in aggregate across `1..n-2`.

### Space Complexity

```text
O(1) extra
```

Uses only scalar state and tiny constant lookup tables.

## Speed extreme - `solution-runtime.cpp` (precomputed factor operands)

### Time Complexity

```text
O(n)
```

One precomputation pass over `1..n-2`, then one coefficient scan.

### Space Complexity

```text
O(n)
```

Stores four compact byte arrays for factor counts, reduced residues, and inverse residues.

## Memory extreme

The least-memory proposal is implemented in C:
`../../c/3463-check-if-digits-are-equal-in-string-after-operations-ii/solution-memory.c`.

### Time Complexity

```text
O(n log_5 n)
```

Lucas theorem scans the base-5 digits of `row` and `k` for each coefficient.

### Space Complexity

```text
O(1) extra
```

No dynamic allocation.

## Variables

- `n`: length of `s`.
- `row`: `n - 2`, the Pascal row used for the final two digits.
- `k`: coefficient index in the row.

## Top 1% Performance Strategy

- Recommended: O(n) coefficient streaming, no dynamic allocation, no string rebuilding,
  and no invalid modular division.
- Speed: O(n) coefficient streaming with compact factor precomputation to reduce repeated
  divisions in the hot loop.
- Memory: C Lucas/CRT keeps constant auxiliary memory and the smallest runtime baseline.

## Optimization Notes

The recommended C++ solution is the best default for judge submissions because it is both
linear and allocation-free. The runtime variant is worthwhile when extra memory is
acceptable for shaving repeated factor-stripping work. The C Lucas variant is kept as the
minimum-footprint proposal, not the runtime champion.
