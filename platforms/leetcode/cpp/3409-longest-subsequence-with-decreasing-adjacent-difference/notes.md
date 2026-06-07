# Notes - LeetCode 3409: Longest Subsequence With Decreasing Adjacent Difference (C++ proposal)

## Problem Summary

Given `nums`, choose a subsequence whose adjacent absolute differences never increase.
For a chosen sequence `seq`, the condition is:

```text
abs(seq[1] - seq[0]) >= abs(seq[2] - seq[1]) >= ...
```

Return the maximum possible subsequence length.

The important constraint is not just `n <= 10000`; it is also `1 <= nums[i] <= 300`.
That small value universe lets us replace per-index DP with a compact value-compressed
state table.

## Three Proposals -> One File (Pareto-optimal)

This challenge is Pareto-optimal for the repository standard: one implementation is the
best practical choice for the recommended, runtime, and memory objectives.

- **Recommended (`solution.cpp`) - fast + lean:** online DP by ending value and minimum
  allowed next difference. It runs in `O(n * 300)` time and uses a fixed `301 x 301`
  table of 16-bit cells.
- **Speed extreme:** *coincides with the recommended.* The implementation avoids
  `O(n^2)` index transitions, scans only the 300 possible differences per input value,
  avoids `abs`, updates only the current value row, and uses contiguous stack storage.
- **Memory extreme:** *coincides with the recommended.* The compressed value/difference
  table is the state needed to answer every future transition. A per-index DP would be
  much larger, and no non-dominated lower-memory algorithm preserves the same fast online
  transition.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.cpp`.

## Language Choice (C++)

Candidate languages considered:

- C++: selected. LeetCode supports the native `vector<int>&` signature, and C++ gives
  predictable tight loops, contiguous stack storage, and cheap 16-bit scalar DP cells.
- C: could match the raw table layout, but the LeetCode C API would add manual pointer
  plumbing without improving the algorithm or memory footprint in a meaningful way.
- Rust: native performance is strong, but the judge ergonomics and bounds-checked indexed
  table updates are less likely to beat the compact C++ loop for this small hot state.
- Go: compiled and simple, but slice bounds checks plus runtime baseline are avoidable
  overhead for a 3-million-operation-style DP.
- Java / C#: primitive arrays can be competitive after JIT warmup, but managed-runtime
  startup and array-bound checks make them less attractive for top-percentile LeetCode
  submissions on this compact DP.
- Python / JavaScript / TypeScript / PHP: the asymptotic `O(n * 300)` is acceptable, but
  the nested scalar loops are still too hot for the top 1% runtime target.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: it gives the lowest practical overhead for the value
  compressed DP while keeping the code concise and easy to audit.
- Why the main alternatives lose: C does not improve the state or complexity; managed and
  interpreted runtimes add unnecessary overhead around a small, tight table update.

## Constraints

- `2 <= nums.length <= 10000`.
- `1 <= nums[i] <= 300`.
- Adjacent absolute differences are in `[0, 299]`.
- The answer is at most `10000`, so every DP length fits in 16 bits.

## Key Observations

1. A new element `x` appended after value `y` creates difference `d = abs(x - y)`.
2. The previous subsequence ending at `y` is compatible exactly when its last adjacent
   difference is at least `d`.
3. The last index is not needed in the state once the stream has been processed left to
   right; only the ending value and the minimum tolerated next difference matter.
4. Since values are only `1..300`, for a fixed current value `x` and difference `d`, the
   only possible previous values are `x - d` and `x + d`.
5. A suffix maximum over differences turns exact updates into threshold queries:
   `best[value][d]` means the best length ending at `value` whose last difference is
   at least `d`.

## Reasoning Process

The direct DP suggested by the hint would store something like `dp[index][diff]` and try
all previous indices. That correctly models the problem, but `n = 10000` makes an
`O(n^2)` transition set too expensive for a top-percentile target.

The value bound changes the architecture. Instead of asking "which previous index can I
use?", ask "which previous value can I use?" For the current number `x`, each difference
`d` has at most two previous values. If the best subsequence ending in either value already
has last difference at least `d`, appending `x` preserves the non-increasing condition.

The DP invariant after processing a prefix is:

```text
best[v][d] = longest processed subsequence ending with value v
             whose last adjacent difference is at least d
```

Length-1 subsequences are represented by writing `1` into reachable thresholds for the
current value. That is valid because a singleton has no previous adjacent difference and
can accept any first difference.

## Final Approach

For each number `x` in input order:

1. Read the DP row for ending value `x`.
2. For every possible difference `d` from `0` to `299`:
   - inspect previous value `x - d` when it exists;
   - inspect previous value `x + d` when it exists and `d != 0`;
   - take the better compatible length `previous`;
   - update `best[x][d]` with `previous + 1`.
3. Run a descending suffix maximum over `best[x]` so future transitions can query
   "last difference at least `d`" in `O(1)`.
4. Track and return the maximum length written.

## Why This Approach

It uses the full strength of the constraints. The naive index DP spends time on many
indices with the same value, while the compressed DP keeps only the best state per value
and threshold. That is enough because future legality depends on the previous value and
last difference, not on the exact previous index after the left-to-right order has already
been respected.

The single C++ implementation is preferable because it is both fast and lean: the state is
about 90k cells, all contiguous, and the hot loop performs simple indexed loads and stores.
Adding a separate runtime or memory variant would duplicate the same non-dominated idea.

## Top 1% Performance Strategy

- Replace `O(n^2 * diff)` or `O(n^2)` transitions with `O(n * 300)`.
- Store only `value x difference-threshold` states instead of per-index states.
- Scan differences directly and check `x - d` / `x + d`, avoiding `abs` in the hot loop.
- Update only the row for the current value, then suffix-max that one row.
- Use a fixed stack table, avoiding heap allocation and hash maps.
- Use 16-bit DP cells because the maximum answer is `10000`.
- Keep all operations integer and branch-light.

## Edge Cases

- Two elements: any two-value subsequence is valid, so the DP reaches length `2`.
- All equal values: every adjacent difference is `0`, and `best[x][0]` extends by one
  each time.
- Strictly changing values: the suffix threshold enforces that every next difference is
  no larger than the previous one.
- Alternating high/low values: equal large differences are allowed because the condition
  is non-increasing, not strictly decreasing.
- Values near `1` or `300`: missing previous values are skipped; no out-of-range table
  access is performed.

## Alternatives

- **Per-index DP from the hint:** correct, but a direct transition over previous indices
  is too slow; storing `10000 x 300` states is also much larger than needed.
- **DFS/backtracking over subsequences:** exponential and immediately infeasible.
- **Greedy by largest next difference:** fails because choosing a locally large gap can
  discard a value that enables a longer tail.
- **Fenwick/segment tree over differences:** unnecessary because the difference universe
  is only 300 and one suffix pass on the current row is cheaper.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
