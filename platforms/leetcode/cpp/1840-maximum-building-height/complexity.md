# Complexity - LeetCode 1840: Maximum Building Height

Let `m = restrictions.length`.

## Recommended - `solution.cpp` (fast + lean)

### Time Complexity

```text
O(m log m)
```

Sorting the `m + 2` cap points dominates. The two relaxation passes and the peak scan are
linear.

### Space Complexity

```text
O(m)
```

The compact `vector<pair<int,int>>` stores the restrictions plus the two endpoint caps.

## Speed Extreme - `solution.cpp`

### Time Complexity

```text
O(m log m)
```

The fastest-runtime proposal coincides with the recommended implementation. The lower
bound is sorting the arbitrary restriction IDs.

### Space Complexity

```text
O(m)
```

The runtime-oriented constant-factor win comes from the compact point vector.

## Memory Extreme - C sibling `solution-memory.c`

### Time Complexity

```text
O(m log m)
```

The C version sorts the provided pointer array in place, then performs the same two
relaxation passes.

### Space Complexity

```text
O(1) extra
```

Beyond the judge-provided input storage and the implementation stack used by `qsort`, it
uses only scalar variables.

## Top 1% Performance Strategy

- Collapse the huge building range to the sorted restriction envelope.
- Perform exactly two directional relaxations.
- Use the closed-form interval peak formula.
- Use compact C++ pairs for the runtime champion and in-place C rows for the memory
  champion.
