# Complexity - LeetCode 3751: Total Waviness of Numbers in Range I (C++ proposals)

## Recommended - `solution.cpp` (compressed digit DP)

### Time Complexity

```text
O(D * 3 * 10 * 3 * 10) = O(D)
```

`D` is the number of decimal digits in the bound. Here `D <= 6`. The factor comes from
positions, meaningful-digit count states, previous digit, comparison sign, and the next
digit transition. The method runs twice, once for `num2` and once for `num1 - 1`.

### Space Complexity

```text
O(D * 3 * 10 * 3) = O(1)
```

The memo table is a fixed `7 * 3 * 10 * 3` set of states, and recursion depth is at most
six. No heap allocation is used by the DP state.

## Speed Extreme - `solution-runtime.cpp` (static full-domain prefix table)

### Time Complexity

```text
O(100000 * D) setup, O(1) per query after setup
```

The table is initialized once by scanning every possible input value. After that,
`totalWaviness` performs two indexed reads and one subtraction.

### Space Complexity

```text
O(100000)
```

The static prefix table stores one `int` for every value in `0..100000`, about 400 KB.

## Memory Extreme - `solution-memory.cpp` (direct arithmetic scan)

### Time Complexity

```text
O((num2 - num1 + 1) * D)
```

Every number in the interval is inspected digit by digit. Since `D <= 6`, the absolute
work is bounded by roughly 600000 digit steps.

### Space Complexity

```text
O(1)
```

Only scalar counters and three rolling digits are stored.

## Variables

- `D`: number of decimal digits in the current bound or current number (`D <= 6`).
- `R`: interval length, `num2 - num1 + 1`.
- `cmp`: adjacent digit comparison sign, one of `-1`, `0`, `+1`.

## Top 1% Performance Strategy

- Recommended: two tiny prefix digit-DP calls, fixed arrays, no dynamic containers.
- Speed extreme: static prefix table turns repeated judge calls into constant-time lookups.
- Memory extreme: arithmetic digit extraction avoids per-number strings or digit buffers.

## Optimization Notes

For a single isolated call, the recommended digit DP has the best balance because it avoids
both wide interval scans and the full-domain table. For a large test batch in one process,
the runtime table can win after initialization. For memory reporting, the direct scan is
the leanest.
