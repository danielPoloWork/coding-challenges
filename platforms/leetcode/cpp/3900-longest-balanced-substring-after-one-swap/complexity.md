# Complexity - LeetCode 3900: Longest Balanced Substring After One Swap (C++ proposals)

## Recommended - `solution.cpp` (prefix buckets + monotone pointers)

### Time Complexity

```text
O(n)
```

Each prefix index is inserted once. Each per-balance pointer only moves forward, so the
repair checks are linear overall.

### Space Complexity

```text
O(n)
```

Prefix values, balance buckets, and pointer arrays are all linear in the string length.

## Speed extreme - `solution-runtime.cpp` (flat intrusive queues)

### Time Complexity

```text
O(n)
```

The string is counted once and scanned once; each queued prefix index is expired at most
once per repair direction.

### Space Complexity

```text
O(n)
```

Uses flat head/tail/next arrays over the fixed balance range and prefix positions.

## Memory extreme - `solution-memory.cpp` (sorted prefix pairs)

### Time Complexity

```text
O(n log n)
```

Sorting the `n + 1` prefix pairs dominates. Group scans and two-pointer checks are linear
after sorting.

### Space Complexity

```text
O(n)
```

Stores one prefix pair vector plus the in-place sort stack. It has a smaller auxiliary
constant than the queue-based linear variants.

## Variables

- `n`: length of `s`.
- `total0`, `total1`: total counts of `0` and `1` in the input.
- `balance`: prefix value `#1 - #0`.

## Top 1% Performance Strategy

- Recommended: O(n) prefix buckets over a known integer range, no hashing, monotone
  bucket pointers, early return at the global upper bound.
- Speed extreme: flat arrays and lazy queue expiration remove nested-vector and lookup
  overhead while preserving the same O(n) bound.
- Memory extreme: one compact prefix array and in-place `std::sort` reduce reported
  memory when O(n log n) time is acceptable.

## Optimization Notes

The linear variants are the right choices for judge runtime. The sorted-prefix variant is
kept as the memory-oriented proposal because any accepted solution still needs enough
prefix-state information to recover far-apart equal or near-equal balances.
