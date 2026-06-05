# Complexity - LeetCode 3266: Final Array State After K Multiplication Operations II (C++ proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed and memory
champion. The figures below describe all three axes.

## Recommended - `solution.cpp` (compact heap + cyclic distribution)

### Time Complexity

```text
O(n + s log n + n log n + log k)
```

`s` is the number of directly simulated operations before the cycle boundary. For
`multiplier >= 2`, each element can be simulated only `O(log_multiplier(initialMax))` times
while its updated value remains `<= initialMax`, so `s <= n * ceil(log_multiplier(initialMax))`.
Since `initialMax <= 1e9`, this is at most about `30n` in the worst multiplier-2 case.

After that, sorting the heap costs `O(n log n)`, and the modular exponentiation costs
`O(log k)`.

If `multiplier == 1`, the time is `O(1)` beyond returning the input vector.

### Space Complexity

```text
O(n) auxiliary
```

The algorithm stores one packed 64-bit heap key per array element and reuses that same buffer
for the final sorted order. Scalar variables are `O(1)`. The input vector is reused for
write-back.

## Variables

- `n`: `nums.length`, up to `10000`.
- `k`: number of requested operations, up to `1e9`.
- `initialMax`: maximum value in the original array, up to `1e9`.
- `s`: number of operations simulated before the cyclic suffix starts.
- `MOD`: `1_000_000_007`.

## Top 1% Performance Strategy

- Simulate only the short prefix before `min * multiplier > initialMax`.
- Encode `(value, index)` as one `uint64_t`, preserving tie-breaking with compact comparisons.
- Build the heap once with `make_heap` over pre-reserved contiguous storage.
- Sort the existing heap buffer for final order instead of allocating a second vector.
- Use binary exponentiation once for the common full-round factor.

## Optimization Opportunities

No separate non-dominated speed or memory variant is useful here. Full simulation is too slow,
scan-only minimum selection is too slow for the worst case, and heavier heap node structures
consume more memory without improving the asymptotic cost.

## See Also

None - the speed and memory extremes coincide with this proposal (see `notes.md`).
