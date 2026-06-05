# Complexity - LeetCode 3509: Maximum Product of Subsequences With an Alternating Sum Equal to K (C++ proposals)

## Recommended + Speed Extreme - `solution.cpp`

Compressed product-indexed bitset DP.

### Time Complexity

```text
O(n * P * W)
```

`W = ceil((2 * 1800 + 1) / word_bits) <= 57` for the fixed C++ bitsets. `P` is the
number of compressed positive product rows. With `nums[i] <= 12` and `limit <= 5000`,
`P <= 394`, far below `limit`.

The zero-product reachability DP adds only `O(n * W)` bitset work.

### Space Complexity

```text
O(P * W)
```

Two bitsets per positive product row, plus four small reachability bitsets for all
subsequences and zero-containing subsequences.

## Variables

- `n`: number of values in `nums` (`<= 150`).
- `S`: `sum(nums)` (`<= 1800`).
- `W`: machine-word count for the alternating-sum bitset.
- `P`: number of compressed positive products `<= limit` generated from factors in
  `nums` (`<= 394` under the constraints).

## See Also

Minimum-memory champion (C, exact-width manual bitsets):
`../../c/3509-maximum-product-of-subsequences-with-an-alternating-sum-equal-to-k` -
same asymptotic time, exact `O(P * ceil((2S + 1) / 64))` bit storage.
