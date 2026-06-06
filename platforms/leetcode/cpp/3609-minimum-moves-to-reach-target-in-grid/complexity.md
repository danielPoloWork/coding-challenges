# Complexity - LeetCode 3609: Minimum Moves to Reach Target in Grid (C++ proposal)

## Recommended - `solution.cpp` (reverse greedy reduction)

### Time Complexity

```text
O(log max(tx, ty))
```

Each reverse step either halves the larger coordinate or subtracts the smaller coordinate
when the two values are within a factor of two. The subtract case then makes the reduced
coordinate smaller than or comparable to the other coordinate, so the process follows the
same logarithmic behavior as Euclidean reduction.

### Space Complexity

```text
O(1)
```

The algorithm stores only the current reverse coordinates and a move counter. The equality
case can branch once into a zero-axis reduction; the recursion depth remains bounded by the
number of halvings, and no dynamic allocation is used.

## Speed and Memory Extremes

No separate speed or memory files are included. The reverse greedy algorithm is both the
fastest asymptotic strategy and the minimum-memory strategy for this problem:

- speed extreme: same O(log max(tx, ty)) time, O(1) space;
- memory extreme: same O(log max(tx, ty)) time, O(1) space.

## Variables

- `sx`, `sy`: start coordinates.
- `tx`, `ty`: target coordinates.
- `x`, `y`: current coordinates while walking backward from the target.

## Top 1% Performance Strategy

The solution avoids any grid exploration, heap allocation, hashing, or target-sized state.
It performs only integer comparisons, parity checks, shifts, and subtractions, which is the
lowest-overhead implementation shape for this deterministic inverse process.

## Optimization Notes

There is no meaningful lower-space variant than O(1). There is also no asymptotically
faster exact method than processing the forced reverse reductions, because the answer
itself may contain a logarithmic number of doubling/halving steps.
