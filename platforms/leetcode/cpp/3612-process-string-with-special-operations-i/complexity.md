# Complexity

## Recommended - `solution.cpp` (fast + lean)

### Time Complexity

```text
O(n + W)
```

`n` is the length of the operation string, and `W` is the total amount of character work done
by materializing duplicates, reverses, and the final returned string. Under the given
constraint `n <= 20`, `W` is bounded by a small constant in platform terms; more generally,
`W <= n * P`, where `P` is the maximum intermediate result length.

### Space Complexity

```text
O(M) returned string, O(1) auxiliary
```

`M` is the final result length. The result buffer is mandatory output. The implementation
stores only the result plus a few integer counters; it reserves the maximum intermediate
length to avoid reallocations during simulation.

## Speed extreme

Coincides with `solution.cpp`. The returned string must be written, and the chosen C++
simulation uses one compact output buffer with precomputed capacity and optimized
standard-library primitives.

## Memory extreme

Coincides with `solution.cpp`. The mandatory returned string dominates memory, and no
auxiliary container is used.

## Variables

- `n`: length of `s`.
- `M`: final returned string length.
- `P`: maximum intermediate result length during processing.
- `W`: total character work across all mutating operations (`#`, `%`, and final writes).

## Top 1% Performance Strategy

- First pass computes `P`, then `reserve(P)` eliminates growth reallocations.
- The real simulation mutates one `std::string` in place.
- `#` uses self-append, `%` uses `std::reverse`, and `*` uses `pop_back`.
- No rope, deque, hash map, recursion, or symbolic parse tree is allocated.

## Optimization Notes

A lazy-reversal representation can reduce the number of physical reverse passes, but it gives
up contiguous storage and pays higher per-character overhead. With `n <= 20` and a mandatory
materialized return value, the reserved `std::string` simulation is the best practical
runtime/memory point.
