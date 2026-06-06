# Complexity - LeetCode 3670: Maximum Product of Two Integers With No Common Bits (C++ proposals)

## Recommended - `solution.cpp` (bounded scan + compressed SOS DP)

### Time Complexity

```text
O(n log n + L + r * 2^r + k)
```

`L` is the fixed scan cap and `r <= 20` is the number of active bit positions. If the
scan completes before the cap, the DP term is skipped.

### Space Complexity

```text
O(2^r + k)
```

The fallback stores one DP cell per compressed mask and one compressed mask per distinct
value.

## Speed extreme - `solution-runtime.cpp` (static-array hybrid)

### Time Complexity

```text
O(n log n + L + r * 2^r + k)
```

The asymptotic shape matches the recommended variant, but static arrays reduce allocation
overhead and improve constants in the fallback.

### Space Complexity

```text
O(2^20 + 1e5) reserved, O(2^r + k) active
```

The static buffers reserve the maximum size allowed by the constraints.

## Variables

- `n`: number of elements in `nums`.
- `k`: number of distinct values in `nums`.
- `r`: number of bit positions used by at least one value; `r <= 20`.
- `L`: bounded pair-scan cap.

## Top 1% Performance Strategy

- Use the product-pruned scan to avoid DP on easy cases.
- Cap the scan so it never degrades into full quadratic work in the runtime variants.
- Compress active bits before SOS DP.
- Query every partner by complement lookup after DP.
- Use the static-array runtime variant for the fastest submission.

## Optimization Notes

For LeetCode runtime, `solution-runtime.cpp` is the preferred version. A separate memory
variant is intentionally not maintained for this challenge because the low-memory
pair-scan trade-off is vulnerable to quadratic worst-case runtime.
