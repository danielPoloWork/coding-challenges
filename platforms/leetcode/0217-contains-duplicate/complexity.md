# Complexity - LeetCode 217: Contains Duplicate

Three solutions are provided: a recommended balanced default plus the two extreme
variants, whose complexities differ by design.

## Recommended - `solution.cpp` (in-place sort: runtime-first + lean)

### Time Complexity

```text
O(n log n)
```

In-place `std::sort` (introsort, inlined comparator) dominates; the adjacency scan is
O(n). At n <= 1e5 this is practically tied with the O(n) hash set in wall-clock time.

### Space Complexity

```text
O(1) extra
```

In place; no auxiliary structure allocated.

## Runtime variant - `solution-runtime.cpp` (flat hash set)

### Time Complexity

```text
O(n) average
```

Each element is hashed and probed a constant number of times on average at a load
factor <= 0.5. Worst case is O(n^2) only under adversarial hash collisions, which the
Murmur3-style finalizer makes negligible in practice.

### Space Complexity

```text
O(n)
```

Two arrays (`keys`, `used`) sized to the next power of two >= 2n.

## Memory variant - `solution-memory.c` (in-place sort)

### Time Complexity

```text
O(n log n)
```

Dominated by the in-place sort; the adjacency scan is O(n).

### Space Complexity

```text
O(1) extra
```

Sorting is in place; the only extra memory is `qsort`'s O(log n) recursion stack. No
auxiliary array is allocated.

## Variables

- `n`: number of elements in `nums`.

## Top 1% Performance Strategy

- Runtime: contiguous flat table, strong finalizer, load factor <= 0.5, early exit on
  the first duplicate.
- Memory: in-place sort, overflow-safe comparator, zero auxiliary allocation.

## Optimization Notes

- For inputs known to contain an early duplicate, the runtime variant effectively
  finishes in far less than one full pass.
- If the value range were small (e.g., bounded by a few million), a bitset would beat
  both variants on time and memory simultaneously; the actual +/-1e9 range rules that out.
- The two variants are Pareto-optimal endpoints: you cannot achieve O(n) time and O(1)
  extra space at the same time for this problem without exploiting a value-range
  assumption the constraints do not provide.
