# Complexity - LeetCode 3838: Weighted Word Mapping (C++ proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed and
memory champion. The figures below describe all three axes.

## Recommended - `solution.cpp` (direct weighted character scan)

### Time Complexity

```text
O(T)
```

`T` is the total number of characters across all words. Each character is visited once, and
each word performs one modulo operation and one output write.

### Space Complexity

```text
O(1) auxiliary
```

The algorithm stores only scalar loop state and a pointer to the input weight table. The
returned string has length `n` and is required output.

## Speed Extreme

Coincides with the recommended solution. Any correct algorithm has an `Omega(T)` lower bound
because any character can alter its word's modulo residue. The implementation reaches that
bound with one direct array lookup per character and no dynamic data structures.

## Memory Extreme

Coincides with the recommended solution. No auxiliary structure is needed beyond the output
string; direct indexing into the provided 26-weight array is already memory-minimal.

## Variables

- `n`: number of words.
- `T`: total number of characters across all words.
- `weights`: the fixed 26-entry table of lowercase letter weights.
- `total`: scalar weight sum for the current word.

## Top 1% Performance Strategy

- Pre-size the output string to avoid growth checks and reallocations.
- Use direct array addressing from `c - 'a'`.
- Sum in `int`; the largest possible word sum is only `1000`.
- Take modulo once per word instead of once per character.
- Avoid maps, temporary vectors, prefix arrays, or per-word allocations.

## Optimization Opportunities

No asymptotic improvement remains. A residue-to-character table or modulo-per-character
variant is possible, but neither improves the lower-bound `O(T)` scan or the constant
auxiliary memory profile for these constraints.
