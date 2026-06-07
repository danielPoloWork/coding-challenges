# Notes - LeetCode 3276: Select Cells in Grid With Maximum Score (C++ proposal)

## Problem Summary

Given an `m x n` grid of positive integers, choose at least one cell so that no two chosen
cells share a row and no two chosen cells share a value. The score is the sum of chosen
values, and the goal is to maximize that score.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one solution is best on all meaningful axes.
For this problem the matching-greedy solution is the recommended, speed-extreme, and
memory-extreme solution:

- **Recommended (`solution.cpp`) - fast + lean:** collapse the grid into value-to-row
  bitmasks, then process values from high to low. Keep a value when an augmenting path can
  fit it into the current row matching.
- **Speed extreme:** *coincides with the recommended.* It avoids the hinted
  `O(100 * 2^m * m)` DP and instead does at most `100` tiny augmenting-path attempts over
  `m <= 10` rows.
- **Memory extreme:** *coincides with the recommended.* It stores only `101` row masks, `10`
  row matches, and a recursion depth of at most `10`. A separate C translation would shave
  only baseline constants, not create a genuinely different non-dominated algorithm.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.*`.

## Language Choice (C++)

Candidate languages considered:

- **C++:** selected. The algorithm is a handful of branch-heavy integer and bit operations.
  C++ gives native code, fixed arrays, direct bit intrinsics, no GC, and the standard
  LeetCode `vector<vector<int>>` signature without extra adaptation.
- **C:** also native and very lean, but the C matrix signature is less ergonomic and does
  not change the algorithmic memory profile. It would only reduce language baseline
  constants, so it is not a separate proposal.
- **Rust:** native and safe, but the nested `Vec<Vec<i32>>` signature plus bounds-checking
  and borrow-management ceremony do not improve this tiny recursive matching workload.
- **Go:** compiled and simple, but slice/runtime overhead and bounds checks are less
  attractive than C++ fixed arrays for a `<= 1000` operation hot path.
- **Java / C#:** JITs can be fast after warm-up, but object-array layout and runtime
  overhead are unnecessary for fixed `101` and `10` element arrays.
- **Python / JavaScript / TypeScript / PHP:** the constraints are small enough for accepted
  solutions, but interpreter/VM overhead is dominated by C++ for top-percentile runtime.

Chosen language:

- **Selected:** C++.
- **Why it wins for this proposal:** it combines native speed, compact fixed storage, direct
  row-bit manipulation, and LeetCode's most ergonomic high-performance class signature.
- **Why the main alternatives lose:** managed and interpreted runtimes add avoidable
  overhead; C and Rust are viable but do not improve the non-dominated algorithm while
  making the platform-facing implementation less direct.

## Constraints

- `1 <= grid.length <= 10`
- `1 <= grid[i].length <= 10`
- `1 <= grid[i][j] <= 100`

Implications: there are at most `10` rows and only `100` possible value elements. Duplicates
of the same value in one row are equivalent, because selecting that value from that row has
the same effect no matter which column supplied it.

## Key Observations

1. Each distinct value is an item with weight equal to the value itself.
2. A value can be assigned to any row in which it appears.
3. Choosing cells is therefore choosing a set of values that can be matched injectively to
   rows.
4. The matchable subsets of values form a transversal matroid.
5. Maximum-weight independent set in a matroid is solved by greedy: scan elements in
   descending weight and keep an element exactly when independence is preserved.
6. Independence after adding one value is tested by a standard augmenting path in the
   current bipartite matching.

## Reasoning Process

The direct brute force chooses or skips cells, but even `100` cells is far too much. The
hinted DP sorts cells or values and keeps a row bitmask, which is already acceptable because
`2^10 = 1024`.

The stronger view is to remove columns entirely. If value `v` appears multiple times, we
only need the set of rows that can host `v`; selecting value `v` contributes `v` once. The
problem becomes a weighted matching question:

```text
left side:  distinct values, weighted by their numeric value
right side: rows
edge:       value v appears in row r
goal:       choose maximum-weight subset of left nodes that can be matched to rows
```

For bipartite graphs, the subsets of left nodes that can be matched into the right side are
the independent sets of a transversal matroid. The matroid exchange property is exactly what
makes descending-weight greedy safe: if a high value can coexist with the already kept
higher values, every optimum can be transformed to include it without losing total weight.

The implementation keeps one current matching from rows to selected values. When trying a
new value, DFS searches for a row where it can be placed, recursively moving values already
selected earlier in the descending scan if they can shift to another row. Success means the
selected value set is still matchable, so the value is permanently added to the score.

## Final Approach

1. Build `rowMaskByValue[101]`, where bit `r` is set if that value appears in row `r`.
2. Keep `matchedValueByRow[10]`; `0` means the row is currently free.
3. Iterate values from the maximum present value down to `1`.
4. Skip values that do not appear.
5. For each candidate value, run `augment(value)` with a fresh visited-row mask.
6. In `augment`, try every available row for that value. If the row is occupied, recursively
   try to move the displaced previously selected value.
7. If augmentation succeeds, add the candidate value to the answer.
8. Stop early once `grid.length` values have been selected, because no more rows are
   available.

## Why This Approach

The DP row-mask solution is reliable, but it solves a larger state-space problem than
necessary. The matroid view uses the special structure that weights are exactly the unique
cell values and that values live in a tiny fixed domain. It reaches the same optimal answer
with less memory and fewer operations.

The trade-off is conceptual: the proof is more advanced than the DP hint, but the code is
shorter and the runtime profile is better.

## Top 1% Performance Strategy

- No cell sorting and no `2^m` DP table.
- Duplicates are collapsed into one bit per `(value, row)` pair.
- Fixed stack/member arrays: `101` masks and `10` row assignments.
- Bitmask DFS; each augmentation visits a row at most once.
- `__builtin_ctz` converts a one-bit row mask to an index without a loop.
- Early stop after selecting `m` values.

## Edge Cases

- Single cell: the only value is added by the first augmentation.
- One row with many values: greedy keeps only the largest value because the row matching has
  rank `1`.
- All cells have the same value: that value is selected once.
- A high value initially blocks another high value: the augmenting path can move the
  previously selected value to a different row if possible.
- Fewer distinct values than rows: the algorithm simply ends with fewer matched rows.

## Alternatives

- **Hinted row-mask DP:** `O(100 * 2^m * m)` time and `O(2^m)` memory. Good and easy to
  prove, but dominated here by greedy matching.
- **Backtracking over rows/cells:** low memory, but can explore exponentially many
  combinations without the matroid guarantee.
- **Min-cost max-flow / Hungarian-style matching:** correct but overbuilt for `10` rows and
  `100` possible values; larger constants and more code.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
