# Complexity - LeetCode 3463: Check If Digits Are Equal in String After Operations II (C proposal)

## Memory extreme - `solution-memory.c` (Lucas + CRT)

### Time Complexity

```text
O(n log_5 n)
```

For each of the `n - 1` coefficients in row `n - 2`, Lucas theorem scans the base-5
digits of `row` and `k`. The modulo-2 residue is O(1) using bit operations.

### Space Complexity

```text
O(1) extra
```

Uses only scalar variables and a fixed `5 x 5` table for `nCk mod 5`; no dynamic
allocation.

## Variables

- `n`: length of `s`.
- `row`: `n - 2`, the Pascal row that weights the final two digits.
- `k`: coefficient index.

## See Also

Recommended and runtime proposals are in C++:
`../../cpp/3463-check-if-digits-are-equal-in-string-after-operations-ii/`.
