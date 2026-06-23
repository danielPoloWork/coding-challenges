# Complexity - LeetCode 3699: Number of ZigZag Arrays I (C++ recommended/runtime)

## Recommended - `solution.cpp` (mirrored rank DP)

### Time Complexity

```text
O(n * m)
```

`m = r - l + 1`. Each length layer computes one reversed prefix sum over the `m` ranks.
There are `n - 2` computed layers after the length-2 base state.

### Space Complexity

```text
O(m)
```

The implementation uses two fixed `m`-active stack buffers inside `int[2000]` arrays. It
does not store previous lengths beyond the current layer.

## Speed Extreme

The speed extreme is the same file, `solution.cpp`.

### Time Complexity

```text
O(n * m)
```

The recurrence needs the rank distribution at each length. Prefix sums make every layer
linear, and the mirrored one-direction state removes the avoidable half of the work.

### Space Complexity

```text
O(m)
```

Two buffers are retained because this is the fastest clear layout for the reversed-prefix
transition.

## Memory Extreme - `../../c/3699-number-of-zigzag-arrays-i/solution-memory.c`

### Time Complexity

```text
O(n * m)
```

It computes the same mirrored recurrence, but performs the reversed-prefix transform
in-place.

### Space Complexity

```text
O(m)
```

Only one `m`-active stack buffer is used, plus scalar counters. The asymptotic class is
the same as the C++ proposal, but the explicit DP buffer count is halved.

## Variables

- `n`: required array length.
- `m`: number of available values, `r - l + 1`.
- `y`: zero-based rank of the final value in `[l, r]`.
- `up[y]`: count of current-length arrays ending at rank `y` with an upward last move.

## Top 1% Performance Strategy

- Collapse the two comparison directions by mirror symmetry.
- Replace O(m^2) transitions with reversed prefix sums.
- Use fixed stack arrays and pointer swaps for the C++ runtime champion.
- Use one in-place stack buffer for the C memory champion.
- Keep modular additions branch-light with a single conditional subtraction.

## Optimization Notes

The hinted two-direction DP is already O(n * m), but it stores and updates both directions.
The mirrored recurrence is strictly smaller in constant factors. A closed-form order
polynomial exists in theory for alternating posets, but deriving and evaluating it is not
as robust as the linear-layer DP for `n, m <= 2000`.
