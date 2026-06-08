# Notes - LeetCode 2161: Partition Array According to Given Pivot (C++ proposals)

## Problem Summary

Given an array `nums` and a value `pivot` that appears in it, return a stable three-way
partition:

1. all elements smaller than `pivot`,
2. all elements equal to `pivot`,
3. all elements greater than `pivot`.

The smaller and greater groups must keep their original relative order.

## Proposals in This Folder (C++)

All proposals for this challenge are in the C++ folder.

- **Recommended (`solution.cpp`) - fast + lean:** allocate one exact-size output vector,
  stream `< pivot` values into the prefix, stream `> pivot` values into the suffix by
  scanning backwards, then fill the middle with `pivot`.
- **Speed extreme:** coincides with `solution.cpp`. Any correct method must read every
  element and write every returned element, and the pre-sized output-buffer method reaches
  that lower bound with one allocation and no dynamic growth. A separate
  `solution-runtime.cpp` would duplicate the same non-dominated solution.
- **Memory extreme (`solution-memory.cpp`):** stable in-place divide-and-conquer
  partitioning with rotations. It avoids a separate result buffer, but pays
  `O(n log n)` moves and recursion stack.

## Language Choice (per proposal)

### Recommended / Speed Extreme - `solution.cpp`

Candidate languages considered:

- **C++:** selected. LeetCode's native signature is `vector<int>`, so an exact-size
  `vector<int>` output is the natural returned storage. Range-for scans compile to tight
  contiguous integer loops, and there is no GC, boxing, or interpreter overhead.
- **C:** raw loops are competitive, but the C LeetCode signature requires manual return
  allocation and ownership plumbing without improving the asymptotic work or practical
  constants over C++ `vector<int>`.
- **Rust:** native and memory-safe, but LeetCode Rust solution plumbing and bounds checks
  do not give an advantage for this simple contiguous-write workload.
- **Go:** slices make the implementation simple, but bounds checks, GC/runtime baseline,
  and LeetCode overhead are less attractive for percentile runtime.
- **Java / C#:** primitive arrays can be fast after JIT warmup, but managed runtime
  startup and GC metadata make them less predictable for this small linear scan.
- **Python / JavaScript / TypeScript / PHP:** acceptable asymptotically, but VM or
  interpreter overhead and boxed/object-heavy array representations are not top-percentile
  choices at `n = 1e5`.

Chosen language:

- **Selected:** C++.
- **Why it wins for this proposal:** the problem is output dominated; C++ gives one
  exact-size contiguous output buffer and native loops over the input with minimal
  runtime overhead.
- **Why the main alternatives lose:** lower-level C does not beat the C++ vector return
  interface, while managed and interpreted runtimes add overhead without reducing memory
  or improving the algorithm.

### Memory Extreme - `solution-memory.cpp`

Candidate languages considered:

- **C++:** selected. It supports `std::rotate`, compact vectors, lambdas for predicates,
  and move-returning the mutated input buffer while staying close to bare-metal memory
  costs.
- **C:** can implement rotations manually with the smallest runtime baseline, but the C
  judge API generally expects a separately allocated returned array, which undercuts the
  memory objective for this specific interface.
- **Rust:** could implement the same recursive rotation algorithm safely, but more verbose
  borrow management and slice rotation plumbing do not reduce the auxiliary footprint.
- **Go:** slice rotation is possible, but runtime/GC baseline is larger and there is no
  memory win over C++.
- **Java / C#:** in-place stable rotations on primitive arrays are possible, but managed
  runtime overhead and mandatory returned array handling are less suitable for the memory
  champion.
- **Python / JavaScript / TypeScript / PHP:** object-heavy arrays and recursion overhead
  are poor fits for a minimum-memory, worst-case-robust implementation.

Chosen language:

- **Selected:** C++.
- **Why it wins for this proposal:** it can mutate the input vector in place, use
  rotation-based stable partitioning with only `O(log n)` stack, and move the resulting
  buffer into the return value.
- **Why the main alternatives lose:** C has less favorable LeetCode return ownership,
  Rust is more verbose without a footprint reduction, and managed/interpreted options
  carry larger runtime baselines.

## Constraints

- `1 <= nums.length <= 100000`
- `-1000000 <= nums[i] <= 1000000`
- `pivot` is guaranteed to be one of the values in `nums`.

The linear input size makes `O(n)` the runtime target for the primary solution. The wide
value range gives no useful counting-array shortcut: the partition is driven only by
comparison to `pivot`.

## Key Observations

- Stability only matters inside the `< pivot` and `> pivot` groups. All `pivot` values are
  identical, so their internal order is irrelevant.
- If the suffix is filled from right to left while scanning the input from right to left,
  the final order of `> pivot` values is still the original left-to-right order.
- A stable in-place partition can be built recursively: partition each half, then rotate
  the left half's false block with the right half's true block.

## Reasoning Process

The direct idea is to collect three lists (`less`, `equal`, `greater`) and concatenate
them. That is correct, but it may allocate multiple buffers and grow them dynamically.

For top runtime, the output size is already known. Allocate exactly `n` integers once.
The smaller elements can be written in one forward pass. The greater elements can be
written in one backward pass, because placing them from the end preserves their stable
order. The middle must contain only the pivot, so it can be filled directly.

For top memory, the separate output buffer is the cost to remove. Stable partitioning
cannot use the usual two-pointer unstable partition. Instead, recursively partition two
halves and use rotation to join the kept-left blocks. Applying that once for `< pivot`
and once for `== pivot` produces the same final three-way ordering.

## Final Approaches

### Recommended / Speed Extreme - exact output buffer

1. Allocate `ans` with size `n`.
2. Scan `nums` left to right and write every value `< pivot` at the next prefix position.
3. Scan `nums` right to left and write every value `> pivot` at the next suffix position.
4. Fill the remaining middle segment with `pivot`.
5. Return `ans`.

### Memory Extreme - in-place stable partitions

1. Run stable in-place partition on all of `nums` with predicate `x < pivot`.
2. The returned boundary marks the first element that is not smaller.
3. Run stable in-place partition on the suffix with predicate `x == pivot`.
4. Move-return the mutated vector.

## Why These Approaches

The output-buffer proposal is preferable for normal submission: it is `O(n)`, performs
one exact allocation, avoids `push_back` growth, and has predictable contiguous writes.
It is also the fastest-runtime proposal, so no `solution-runtime.cpp` is shipped.

The in-place proposal is preferable only when auxiliary memory is the objective. It keeps
stability without another `n`-element buffer, but rotations repeat work across recursion
levels, so the time rises to `O(n log n)`.

## Top 1% Performance Strategy

- Use a pre-sized `vector<int>` instead of three temporary lists.
- Avoid `push_back`, `reserve` heuristics, and concatenation copies.
- Preserve greater-element stability by reverse scan plus reverse-side writes, not by an
  additional reversal pass.
- Fill pivot values directly instead of storing or counting a separate equal list.
- Keep the hot path to integer comparisons and contiguous stores.

For the memory variant, the performance strategy is secondary to footprint: use
`std::rotate` over contiguous iterators and only two stable partitions, avoiding any
extra per-element buffer.

## Edge Cases

- Single element: the prefix/suffix scans do nothing beyond filling or returning that
  pivot.
- All values equal to `pivot`: the recommended solution only fills the whole output with
  `pivot`; the memory variant leaves the array unchanged.
- No smaller or no greater values: one side of the output remains empty and the middle
  fill still covers all pivots.
- Negative values and value extremes: only comparisons to `pivot` are used.
- Large `n = 100000`: recommended remains linear; memory variant remains correct but is
  intentionally slower.

## Alternatives

- Three vectors (`less`, `equal`, `greater`) are simple but allocate more storage and do
  extra concatenation work.
- Counting `< pivot` and `== pivot` first, then doing a second forward fill, is also
  linear but doubles the branch-heavy classification work.
- `std::stable_partition` twice is concise, but the standard library may allocate a
  temporary buffer; that makes it less explicit as the memory champion.
- Unstable in-place partitioning is rejected because it breaks the required relative
  order.

## See Also

All proposals are in this folder:

- `solution.cpp` - recommended and speed extreme.
- `solution-memory.cpp` - memory extreme.
