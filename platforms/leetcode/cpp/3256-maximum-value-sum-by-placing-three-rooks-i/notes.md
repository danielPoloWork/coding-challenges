# Notes - LeetCode 3256: Maximum Value Sum by Placing Three Rooks I

## Problem Summary

Place exactly three rooks on an `m x n` value board. No two rooks may share a row
or a column. Return the maximum possible sum of the three occupied cells.

## Three Proposals

- **Recommended (`solution.cpp`) - C++ prefix/suffix top-3 envelopes:** orient the board
  so the smaller dimension is ordered, treat each selected line as the middle line once,
  and combine it with the best prefix and suffix candidates.
- **Speed extreme (`solution-runtime.cpp`) - C++ oriented stack arrays:** same prefix/suffix
  algorithm, but copies the board into a fixed oriented matrix and keeps hot state in stack
  arrays to reduce indirection and branches.
- **Memory extreme (`../../c/3256-maximum-value-sum-by-placing-three-rooks-i/solution-memory.c`) - C scan per triple:**
  re-scan the opposite dimension for every line triple and keep only constant top-three
  buffers.

The old row-triple top-3 enumeration is accepted, but it is dominated here: it does about
`27 * C(p, 3)` checks. The prefix/suffix approach keeps the same top-3 proof and cuts the
main work to about `9 * p * q`, where `p = min(m, n)` and `q = max(m, n)`.

## Language Choice (per proposal)

### Recommended - `solution.cpp`

Candidate languages considered:

- C++: Native speed, cheap fixed-size arrays, and the standard LeetCode `vector<vector<int>>`
  signature make the prefix/suffix top-3 loop compact and fast.
- C: Also native and lean, but the raw `int**` signature adds plumbing and does not improve
  the balanced version's memory enough to beat C++ ergonomics.
- Rust: Native and safe, but bounds-check management and LeetCode wrapper overhead are not
  helpful for this small fixed-state scan.
- Go: Compiled and simple, but slice bounds checks and runtime overhead lose to C++ here.
- Java / C#: JITs can be fast after warmup, but managed array layout and runtime overhead
  are unnecessary for a 100 x 100 board.
- Python / JavaScript / TypeScript / PHP: The constraints are small enough to pass, but the
  nested candidate checks are VM/interpreter heavy compared with native loops.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: it gives native loop speed with only `O(p + q)` auxiliary
  state and direct compatibility with the usual LeetCode signature.
- Why the main alternatives lose: C is not meaningfully leaner for this balanced version;
  managed and interpreted languages spend more time in runtime overhead than arithmetic.

### Speed extreme - `solution-runtime.cpp`

Candidate languages considered:

- C++: Best fit for fixed stack arrays, an oriented board copy, and branch-light inner loops.
- C: Could implement the same idea, but LeetCode's C signature and manual array plumbing
  make it less ergonomic without a clear speed win.
- Rust: Comparable native target, but bounds-check handling and wrapper shape are heavier.
- Go: Compiled, but slice bounds checks and runtime baseline are weaker for this hot loop.
- Java / C#: Strong JITs, but startup and managed multi-array layout are not ideal for
  tiny dense state.
- Python / JavaScript / TypeScript / PHP: Too loop-dense for interpreter/VM runtimes to
  compete with native code.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: copying into an oriented `100 x 100` stack matrix removes
  board-shape branching from the hot path while keeping the implementation compact.
- Why the main alternatives lose: C is close but more cumbersome; managed and interpreted
  options carry larger constant costs exactly where this variant is optimizing.

### Memory extreme - C folder

Candidate languages considered:

- C++: Can match the constant-memory algorithm, but the standard wrapper and vector object
  baseline are slightly larger.
- C: Smallest runtime baseline and direct pointer access; ideal when the goal is minimum
  auxiliary memory.
- Rust: Native and safe, but the LeetCode wrapper is bulkier for this memory-only target.
- Go: Runtime and slice metadata make it less attractive for peak memory.
- Java / C#: Managed runtimes have object headers and GC metadata that dominate this tiny
  auxiliary state.
- Python / JavaScript / TypeScript / PHP: Object-heavy board representation and VM memory
  overhead are not competitive.

Chosen language:

- Selected: C.
- Why it wins for this proposal: the algorithm needs only scalar buffers, and C has the
  smallest practical LeetCode memory baseline among the allowed languages.
- Why the main alternatives lose: C++ is close but not smaller; managed and interpreted
  languages carry much higher runtime memory overhead.

## Constraints

- `3 <= m <= 100`
- `3 <= n <= 100`
- `-1e9 <= board[i][j] <= 1e9`
- The answer can be as low as `-3e9` or as high as `3e9`, so every sum uses `long long`.

## Key Observations

- Orient the board so the primary dimension is `p = min(m, n)`.
- In any valid placement, the three selected primary lines can be ordered; one is the
  middle line, one is in its prefix, and one is in its suffix.
- For a side, selecting one rook only depends on the best value per opposite coordinate.
- The middle rook and the other side can forbid at most two opposite coordinates, so the
  best usable side coordinate is always among the side's top three coordinates.

## Reasoning Process

The direct brute force chooses three rows, three columns, and a permutation. The first
reduction is row/column top-3 pruning: after fixing three primary lines, only three
opposite coordinates per line can matter. That was accepted, but still enumerates all line
triples.

The stronger reduction is to order the three selected primary lines and process the middle
one. Prefix and suffix summaries each keep their top three opposite coordinates by best
cell value. For every middle coordinate, trying those `3 x 3` side candidates is sufficient
and exact.

The memory variant removes the retained prefix/suffix summaries and rebuilds local
top-three candidates for each line triple, trading runtime for constant auxiliary memory.

## Final Approaches

Recommended:

1. Choose rows as the primary dimension if `m <= n`; otherwise choose columns.
2. Build `suffix[line]`, the top three opposite coordinates available strictly after
   `line`.
3. Sweep from left/top to right/bottom while maintaining the prefix top three.
4. For each middle line and middle coordinate, combine the middle cell with the `3 x 3`
   prefix/suffix candidates that use distinct coordinates.
5. Track the best sum.

Speed extreme:

1. Copy the board into `value[p][q]` in the chosen orientation.
2. Build suffix top-three arrays and a rolling prefix top-three array on stack storage.
3. Run the same `3 x 3` combine loop without repeated orientation checks.

Memory extreme:

1. Orient to the smaller primary dimension.
2. For every primary line triple, scan all opposite coordinates once.
3. Maintain three top-three lists locally.
4. Enumerate the 27 local combinations and update the answer.

## Why These Approaches

The recommended version is now the best default because it is exact, simple, and linear in
the board size up to a small factor.

The runtime version is preferable when chasing judge runtime: it spends a small `100 x 100`
oriented copy to make the inner loop cheaper.

The C memory scan is preferable only when peak auxiliary memory is the objective. It is
accepted but intentionally slower.

## Top 1% Performance Strategy

- Recommended: smaller-dimension orientation, prefix/suffix top-three summaries, only
  nine side-pair checks per middle cell, and no sorting.
- Speed extreme: fixed stack arrays, oriented board copy, scalar loops, and no dynamic
  state in the hot combine loop.
- Memory extreme: C scalar arrays, no heap allocation, no retained candidate table, and
  direct board reads.

## Edge Cases

- All values negative: initialization uses a very small sentinel, so the least-bad valid
  placement is returned.
- Duplicate values: any three top tied coordinates are enough because only two coordinates
  can be blocked.
- `3 x 3`: the middle-line sweep has exactly one middle primary line.
- Rectangular boards: orientation keeps the primary dimension as small as possible.

## Alternatives

- Row-triple top-3 enumeration is correct but slower on LeetCode's judge for this problem.
- The two-rook DP table reduces line triples but has too much state-management overhead at
  `100 x 100`; it lost to the simpler accepted solution in practice.
- General maximum-weight matching is overkill for placing exactly three rooks.

## See Also

- Minimum-memory champion in C: `../../c/3256-maximum-value-sum-by-placing-three-rooks-i/`
