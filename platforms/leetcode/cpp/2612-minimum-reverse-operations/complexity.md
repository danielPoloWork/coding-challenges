# Complexity

## Recommended - `solution.cpp` (fast + lean)

### Time Complexity

```text
O(n alpha(n))
```

Each non-banned, non-start index is discovered and deleted once. Successor lookups use
path compression over parity-compressed DSU arrays.

### Space Complexity

```text
O(n)
```

The returned answer, BFS queue, and successor arrays are linear.

## Speed extreme - coincides with `solution.cpp`

### Time Complexity

```text
O(n alpha(n))
```

No separate `solution-runtime.cpp` is shipped because the recommended successor-DSU BFS is
already the fastest non-dominated proposal.

### Space Complexity

```text
O(n)
```

Same as the recommended proposal.

## Memory extreme - `solution-memory.cpp`

### Time Complexity

```text
O(n + (n / 64) alpha(n / 64))
```

Every discovered index is cleared once from a bitset. Empty 64-bit words are skipped by a
word-level successor DSU.

### Space Complexity

```text
O(n)
```

The output and BFS queue are linear and unavoidable for this interface. The removable-state
structure is smaller than the recommended version: one bit per candidate plus one DSU
integer per 64 candidates.

## Variables

- `n`: number of positions in the array.
- `k`: fixed reversal length.
- `b`: number of banned positions.

## Top 1% Performance Strategy

- Use BFS only over reachable, unvisited, non-banned indices.
- Convert each operation family into a parity-fixed target interval.
- Delete indices from the unvisited structure at discovery time.
- Use contiguous arrays and a manual queue in the recommended/runtime proposal.
- Use bit-level storage and word skipping in the memory proposal.

## Optimization Notes

`std::set` is simpler but asymptotically and practically heavier. The DSU successor form is
the preferred LeetCode submission. The bitset version is the compact alternative when
successor-state memory matters more than the absolute simplest inner loop.
