# Notes - LeetCode 3165: Maximum Sum of Subsequence With Non-adjacent Elements (C++ proposal)

## Problem Summary

Given an integer array `nums`, each query updates one position to a new value. After every
update, return the maximum possible sum of a subsequence with no two adjacent elements
chosen. The final result is the sum of all per-query answers modulo `1e9 + 7`. The empty
subsequence is allowed, so the per-query answer is never negative.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one solution is best on all meaningful axes.
For this problem, the iterative segment tree with four DP values is the recommended,
speed-extreme, and memory-extreme solution:

- **Recommended (`solution.cpp`) - fast + lean:** max-plus 2x2 matrix segment tree. It
  supports each point update and full-array answer in `O(log n)` time after an `O(n)`
  build, with contiguous
  `vector<Node>` storage.
- **Speed extreme:** *coincides with the recommended.* The queries are online point
  updates, so recomputing the house-robber DP after each query is too slow. The segment
  tree keeps exactly the interval summaries needed to recompute only the ancestors of the
  changed leaf.
- **Memory extreme:** *coincides with the recommended.* Any accepted online solution needs
  persistent interval summaries for arbitrary updated positions. The four `long long`
  values per tree node are the compact form of the hinted front/back-state DP, and an
  `O(1)`-extra linear recomputation variant would be `O(nq)`, which is infeasible.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.*`.

## Language Choice (C++)

C++ is the strongest fit among the allowed languages for this problem's performance
profile. The worst case has `5 * 10^4` elements and `5 * 10^4` online updates, so the
algorithm performs about `q log n` small fixed-state merges. Native C++ keeps those merges
as inlined arithmetic over contiguous memory, avoids interpreter overhead, and avoids GC or
boxed-number costs found in higher-level runtimes. `long long` safely stores intermediate
subsequence sums up to about `5 * 10^9`.

## Constraints

- `1 <= nums.length <= 5 * 10^4`
- `1 <= queries.length <= 5 * 10^4`
- `-10^5 <= nums[i], xi <= 10^5`
- `queries[i] = [posi, xi]`
- The final accumulated answer is returned modulo `1e9 + 7`.

## Key Observations

1. The static version is the house-robber DP:
   `newNotSelected = max(oldNotSelected, oldSelected)` and
   `newSelected = oldNotSelected + nums[i]`.
2. A point update only changes one leaf, but its effect can propagate across every later
   position, so a Fenwick tree or local patch is not enough.
3. The house-robber transition is a max-plus matrix. Segment concatenation is matrix
   composition, which is associative and has an identity.
4. The 2x2 matrix stores the same four boundary possibilities as the hint's front/back
   chosen-state segment tree, but the matrix identity makes power-of-two padding safe.

## Reasoning Process

The direct dynamic-programming solution recomputes the full house-robber array after each
query. That is `O(nq)`, up to `2.5 * 10^9` operations, which is too large.

To make updates local, each segment must summarize how it transforms the DP state entering
the segment into the DP state leaving it. For one value `x`:

```text
[0  0]     max-plus rows: current not selected, current selected
[x -inf]   columns: previous not selected, previous selected
```

For two adjacent segments, applying the left segment and then the right segment is exactly
max-plus matrix composition. Because composition is associative, a segment tree can store
one matrix per interval. Updating `nums[pos]` replaces one leaf matrix and recomputes
`O(log n)` parent matrices. The root matrix applied to the initial state
`{previous not selected = 0, previous selected = -inf}` gives the answer as
`max(root.a00, root.a10)`.

## Final Approach

1. Build a power-of-two iterative segment tree.
2. Fill unused leaves with the max-plus identity matrix.
3. Convert each `nums[i]` into the leaf matrix for one house-robber transition.
4. Build parents by composing the left child followed by the right child.
5. For every query, replace the leaf at `pos`, recompute ancestors, read the root answer,
   and add it to the modulo accumulator.

## Why This Approach

The update and query pattern is online and arbitrary, so prefix/suffix precomputation cannot
survive future point changes. The matrix segment tree is small, deterministic, and directly
models the DP recurrence. It also avoids storing full DP arrays per query and avoids
recursion overhead in the hot path.

## Top 1% Performance Strategy

- Use C++ for inlined fixed-size arithmetic and contiguous `vector<Node>` storage.
- Represent the four states as a flat struct instead of nested arrays.
- Use an iterative segment tree to avoid recursive function calls per update.
- Use the matrix identity for padding, avoiding conditional merges at tree boundaries.
- Store sums in `long long` and apply modulo only to the accumulated query total.

## Edge Cases

- Single-element arrays: the answer after each query is `max(0, nums[0])`.
- All negative values: the empty subsequence gives answer `0`.
- Alternating large positives and negatives: the DP keeps selected/not-selected states
  exact, so positives separated by one index can both be chosen.
- Updates from positive to negative and back: only one leaf changes; ancestors rebuild the
  affected interval summaries.
- Maximum constraints: `O(n + q log n)` fits comfortably for `5 * 10^4`.

## Alternatives

- **Recompute house-robber DP after every query:** `O(nq)` time, infeasible.
- **Store only prefix/suffix best sums:** insufficient because an update can change whether
  adjacent boundary elements are selected across arbitrary segment joins.
- **Recursive segment tree with endpoint-selected states:** correct, but the iterative
  max-plus version keeps the same information with a clean identity and lower call overhead.
- **Fenwick tree:** not suitable because the transition composition is non-commutative and
  point updates require rebuilding composed suffix effects.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
