# Complexity - LeetCode 3509: Maximum Product of Subsequences With an Alternating Sum Equal to K (C proposal)

## Memory Extreme - `solution-memory.c`

Exact-width compressed product-indexed bitset DP.

### Time Complexity

```text
O(n * P * W)
```

`W = ceil((2S + 1) / 64)`, where `S = sum(nums) <= 1800`. `P` is the number of
compressed positive products generated from values present in `nums`; under the
constraints, `P <= 394`.

### Space Complexity

```text
O(P * W)
```

The implementation allocates exactly `2 * P` product-state bitsets, each with `W`
64-bit words, plus a constant number of extra reachability bitsets.

## Variables

- `n`: number of values in `nums` (`<= 150`).
- `S`: `sum(nums)` (`<= 1800`).
- `P`: compressed positive product count (`<= 394`).
- `W`: exact 64-bit word count for the alternating-sum range.

## See Also

Recommended + fastest-runtime champion (C++):
`../../cpp/3509-maximum-product-of-subsequences-with-an-alternating-sum-equal-to-k` -
same asymptotic complexity with fixed-width `std::bitset` rows.
