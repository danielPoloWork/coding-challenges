# Notes - LeetCode 2612: Minimum Reverse Operations (C++ proposals)

## Problem Summary

An array of length `n` contains a single `1` at index `p`; every other position is `0`.
Some positions are banned, and the `1` may never land on them. One operation chooses a
length-`k` subarray containing the current `1` and reverses it. Return, for every index,
the minimum number of operations needed to move the `1` there, or `-1` when impossible.

## Three Proposals -> Two Files

- **Recommended (`solution.cpp`) - fast + lean:** BFS over reachable indices, with one
  compressed successor-DSU per parity to skip already visited or banned positions.
- **Speed extreme:** coincides with `solution.cpp`. The same parity-compressed DSU is the
  fastest non-dominated form here: every valid index is removed exactly once, and the hot
  path is a tight contiguous-array loop. A separate `solution-runtime.cpp` would duplicate
  the recommended proposal.
- **Memory extreme (`solution-memory.cpp`):** the same BFS, but unvisited indices are kept
  in parity-compressed bitsets plus a word-level successor DSU. It reduces successor-state
  memory from one `int` per index to one bit per index plus one `int` per 64 candidates.

The useful trade-off is constant-factor runtime versus auxiliary storage. The recommended
version is simpler and typically faster because each successor lookup is direct. The memory
version keeps the mandatory `answer` and BFS queue, but makes the removable-state structure
much smaller.

## Language Choice (per proposal)

### Recommended - `solution.cpp`

Candidate languages considered:

- C++: selected for native integer loops, contiguous vectors, direct LeetCode signature,
  and low-overhead DSU path compression.
- C: raw arrays are competitive, but the C LeetCode return signature adds manual allocation
  plumbing without improving the balanced proposal's asymptotic footprint.
- Rust: native and memory-safe, but the repeated mutable DSU operations are more verbose
  and less likely to beat the C++ constant factors on LeetCode.
- Go: compiled and easy to write, but slice bounds checks and runtime overhead are less
  attractive for a top-percentile BFS over `1e5` positions.
- Java / C#: primitive arrays can be fast after JIT warmup, but C++ avoids managed-runtime
  startup and GC interaction while keeping the state compact.
- Python / JavaScript / TypeScript / PHP: the algorithm is linear-ish, but worst-case BFS
  still needs many scalar operations; VM/interpreter overhead is not suitable for top 1%.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: it gives the best blend of raw speed, compact state, and
  readable parity-compressed successor logic.
- Why the main alternatives lose: C does not improve the algorithmic memory profile; Rust,
  Go, Java, and C# add runtime or implementation overhead; scripting languages miss the
  performance target at the maximum constraints.

### Speed Extreme - same file as `solution.cpp`

Candidate languages considered:

- C++: selected because the runtime-critical loop is array indexing, path compression, and
  a manual queue with no tree nodes, hash tables, virtual calls, or heap churn after setup.
- C: could mirror the arrays, but the platform signature and returned-array ownership add
  risk without a practical speed win over optimized C++.
- Rust: can be native-fast, but checked indexing and borrow management make this exact hot
  path harder to keep as compact.
- Go: compiled but carries bounds-check and runtime costs in the dense loop.
- Java / C#: JIT can optimize primitive loops, but C++ has lower startup and more
  predictable memory layout for LeetCode percentile scoring.
- Python / JavaScript / TypeScript / PHP: too much per-iteration overhead for the maximum
  graph size.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: the recommended DSU BFS is already the raw-speed extreme.
- Why the main alternatives lose: no alternative improves the asymptotic work, and most add
  runtime overhead or more complex ownership.

### Memory Extreme - `solution-memory.cpp`

Candidate languages considered:

- C++: selected for 64-bit word bitsets, `__builtin_ctzll`, compact vectors, and direct
  compatibility with the required LeetCode C++ return type.
- C: can use the same bit operations with slightly lower baseline overhead, but the C
  solution must allocate and return raw memory manually; the lower-level signature is not
  enough to beat the bitset design meaningfully.
- Rust: memory control is strong, but implementing mutable bitsets plus word-level DSU is
  more verbose and unlikely to lower the measured footprint versus C++ vectors.
- Go: bit operations are available, but slices plus runtime/GC baseline are larger.
- Java / C#: primitive arrays are workable, but managed-runtime overhead hurts the memory
  objective.
- Python / JavaScript / TypeScript / PHP: object-heavy numeric storage is far too large for
  a memory-extreme implementation.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: it keeps the compressed bit representation while staying
  close to the platform's most efficient accepted interface.
- Why the main alternatives lose: none reduces the mandatory output and queue, while most
  increase runtime baseline or implementation risk.

## Constraints

- `1 <= n <= 1e5`
- `0 <= p < n`
- `0 <= banned.length <= n - 1`
- `1 <= k <= n`
- Banned indices are unique and never equal to `p`.

The graph has up to `1e5` vertices, so explicit edge generation can be quadratic and must
be avoided.

## Key Observations

- From current index `i`, the reversed subarray can start at
  `L in [max(0, i - k + 1), min(i, n - k)]`.
- The new position is `j = 2L + k - 1 - i`.
- Therefore all possible next positions form one arithmetic range with step `2`:

```text
low  = max(i - k + 1, k - 1 - i)
high = min(i + k - 1, 2n - k - 1 - i)
```

- Every next position in that interval has the same parity, so unvisited indices should be
  stored separately by parity.
- BFS gives minimum operation counts because every reversal has unit cost.
- Once an index receives its BFS distance, it never needs to be considered as unvisited
  again; a successor structure can delete it permanently.

## Reasoning Process

The direct BFS would, for every popped index, try every valid subarray start. In the worst
case that is `O(nk)`, too slow when both can be `1e5`.

The reversal formula collapses all those subarray starts into a contiguous range of target
positions with one parity. That changes the problem from "generate every operation" to
"consume all still-unvisited allowed indices in `[low, high]` with this parity". A balanced
tree can do that in `O(n log n)`, but a successor DSU is better: each index is deleted once,
and future searches jump directly to the next candidate.

The memory variant keeps the same derivation, but stores candidates as bits inside 64-bit
words. A word-level DSU skips empty words, and `ctz` extracts live candidates inside a word.

## Final Approaches

### Recommended - `solution.cpp`

1. Mark banned indices in `answer` with a temporary sentinel.
2. Build two compressed DSU arrays: one for even positions and one for odd positions.
3. Delete all banned indices and the start index from their parity DSU.
4. Run BFS from `p` with a manual vector queue.
5. For each current index, compute `[low, high]` and its parity.
6. Use the DSU to enumerate only still-unvisited candidates in that compressed interval.
7. Assign their distance, push them into the queue, and delete them from the DSU.
8. Convert banned sentinels back to `-1`.

### Speed Extreme - same as recommended

The parity-compressed successor BFS is already the raw-speed proposal. It removes tree
nodes and logarithmic operations, uses no hash tables, and has no repeated scan over visited
positions. No separate file is shipped because it would be coincident.

### Memory Extreme - `solution-memory.cpp`

1. Use the same BFS and range formula.
2. Store unvisited allowed positions by parity in compressed bitsets.
3. Maintain a word-level successor DSU that jumps over zero words.
4. For a target range, mask the first and last word, then repeatedly extract set bits with
   `__builtin_ctzll`.
5. Clear each discovered bit and mark the word deleted when it becomes zero.

## Why These Approaches

BFS is required for shortest paths under unit-cost operations. The parity range formula is
the key compression that makes BFS practical. The successor DSU is preferable to an ordered
set because it exactly matches the one-way deletion pattern and avoids `log n` tree work.

The recommended file is the best default for LeetCode: short enough to audit, linear-ish,
and cache-friendly. The memory file is preferable when minimizing removable-state memory is
more important than the simplest hot path.

## Top 1% Performance Strategy

- Avoid explicit edge generation and avoid `std::set`.
- Split indices by parity so each query touches only valid targets.
- Delete each allowed index exactly once from the unvisited structure.
- Use a manual vector queue instead of `std::queue`.
- Reuse `answer` as the banned marker to avoid an extra boolean array.
- In the recommended version, compress parity positions so successor jumps are stride-1.
- In the memory version, scan 64 candidates per word and skip empty words with DSU.

## Edge Cases

- `k = 1`: every range is just the current index, so only `p` remains reachable.
- `k = n`: the only operation mirrors `i` to `n - 1 - i`.
- `n = 1`: the queue starts and ends at `p`.
- Banned positions adjacent to `p`: they are removed before BFS and never get a distance.
- Dense banned arrays: initialization deletes them once, and BFS works over the remaining
  positions.

## Alternatives

- **Brute-force BFS over all subarray starts:** correct but `O(nk)` in the worst case.
- **`std::set` by parity:** accepted and simple, but `O(n log n)` and node-heavy, so it is
  weaker for the top 1% target.
- **Segment tree or Fenwick tree:** can find live positions, but deletions plus repeated
  successor queries are heavier than DSU for this monotone remove-only workload.
- **Bidirectional BFS:** not useful because all answers from the single source are needed.

## See Also

All proposals for this challenge are in this C++ folder. The speed extreme coincides with
`solution.cpp`; the genuine memory-focused alternative is `solution-memory.cpp`.
