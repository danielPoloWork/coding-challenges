# Complexity - LeetCode 3276: Select Cells in Grid With Maximum Score (C++ proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed and
memory champion. The figures below describe all three axes.

## Recommended - `solution.cpp` (matroid greedy + augmenting paths)

### Time Complexity

```text
O(R * C + V * R)
```

`R` is the number of rows, `C` is the number of columns per row, and `V` is the value-domain
size (`V <= 100`). Building the value-to-row masks scans the grid once. Each attempted
augmentation uses one visited-row bitmask, so it visits at most `R <= 10` rows.

### Space Complexity

```text
O(V + R)
```

The algorithm stores `rowMaskByValue[101]`, `matchedValueByRow[10]`, and recursion depth at
most `R`. With the LeetCode constraints this is fixed-size auxiliary storage.

## Speed Extreme

Coincides with the recommended solution. The hinted DP costs `O(V * 2^R * R)`, while this
matching-greedy formulation avoids the exponential mask table and performs at most `100`
tiny augmenting-path searches.

## Memory Extreme

Coincides with the recommended solution. It uses no heap allocation in the algorithm and no
DP table; reducing below the value masks and row matching would require recomputing grid
membership repeatedly.

## Variables

- `R`: number of rows in `grid` (`R <= 10`).
- `C`: number of columns in each row (`C <= 10`).
- `V`: possible value count (`V = 100` because values are in `1..100`).
- `U`: distinct values present in the grid (`U <= V`).

## Top 1% Performance Strategy

- Collapse duplicate cells into row bitmasks by value.
- Process values in descending order and rely on the transversal-matroid greedy theorem.
- Use augmenting paths on the current matching instead of recomputing DP states.
- Keep all auxiliary state in fixed arrays.
- Stop as soon as all rows are matched.

## Optimization Opportunities

No meaningful non-dominated optimization remains for these constraints. A C translation can
slightly change language baseline memory, and a DP solution can be simpler to recognize from
the official hint, but neither improves the algorithmic time-space profile.

## See Also

None - the speed and memory extremes coincide with this proposal (see `notes.md`).
