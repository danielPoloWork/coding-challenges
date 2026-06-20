# Notes - LeetCode 1840: Maximum Building Height (C memory)

## Problem Summary

The city imposes height caps on selected buildings, fixes building `1` at height `0`, and
requires adjacent buildings to differ by at most `1`. We need the maximum possible height
of any building under all those constraints.

This folder contains the **minimum-memory** proposal. The recommended and fastest-runtime
solution is in `../../cpp/1840-maximum-building-height/solution.cpp`.

## Three Proposals

- **Recommended (C++ `solution.cpp`) - fast + lean:** copy restrictions into compact pairs,
  add endpoint caps, sort, relax from both directions, and scan interval peaks.
- **Speed extreme (C++ `solution.cpp`):** coincides with the recommended proposal; no
  separate `solution-runtime.cpp` is shipped because the compact pair implementation is
  already the runtime-oriented version.
- **Memory extreme (C `solution-memory.c`):** sort the provided restriction pointer array in
  place and reuse each row's height cell for the relaxed cap.

## Language Choice (memory proposal)

Candidate languages considered:

- **C++:** Best for the runtime proposal, but the nested vector input and compact copy use
  more auxiliary storage than the in-place C approach.
- **C:** Selected. LeetCode's C signature gives direct access to the mutable `int**`
  restriction rows, and the algorithm needs only scalar state after sorting them.
- **Rust:** Native and safe, but wrapper and slice metadata do not reduce peak memory below C.
- **Go:** Runtime, GC, and slice metadata are larger than needed for the memory objective.
- **Java / C#:** Managed array/object overhead dominates this scalar-state algorithm.
- **Python / JavaScript / TypeScript / PHP:** VM objects and nested arrays are too heavy for
  a least-memory target.

Chosen language:

- **Selected:** C.
- **Why it wins for this proposal:** it sorts and mutates the provided rows in place, stores
  no auxiliary point array, and has the smallest practical runtime baseline.
- **Why the main alternatives lose:** they add container or runtime metadata without
  reducing the algorithmic memory requirement.

## Constraints

- `2 <= n <= 1000000000`.
- `0 <= restrictions.length <= min(n - 1, 100000)`.
- Restriction IDs are unique and lie in `[2, n]`.
- Heights and intermediate reachability calculations fit in signed 64-bit arithmetic.

## Key Observations

- A cap at `(id, h)` limits any other building `x` to `h + |x - id|`.
- Sorting restrictions lets us propagate those limits with one pass from each side.
- Once adjacent restricted caps are mutually feasible, the best interval peak is
  `floor((leftHeight + rightHeight + distance) / 2)`.
- If there is no real restriction after the last processed point, the suffix can only climb
  by one per building, so its best height is `lastHeight + (n - lastId)`.

## Approach

1. Sort the `restrictions` pointer array by `id` with `qsort`.
2. Start from virtual point `(1, 0)` and cap every restriction by what is reachable from
   the previous one.
3. Start from virtual right cap `(n, n - 1)` and cap every restriction by what is reachable
   from the next one.
4. Scan from `(1, 0)` across the now-relaxed real restrictions and compute interval peaks.
5. Add the suffix climb after the final restriction.
6. Return the largest value found.

## Top 1% Performance Strategy

This is the memory champion, not the runtime champion. It still keeps constants reasonable
by sorting only the existing pointer array, mutating caps in place, using scalar `long long`
temporaries, and avoiding any per-building work.

## Trade-Off

Compared with the C++ solution, this C version avoids the `O(m)` compact pair copy. In
exchange, `qsort` cannot inline the comparator and the sorted input remains pointer-based,
so it is expected to be slower while using less auxiliary memory.

## See Also

- Recommended and runtime C++ proposal: `../../cpp/1840-maximum-building-height/`
