# Notes - LeetCode 3612: Process String with Special Operations I (C++ proposal)

## Problem Summary

Process `s` from left to right and maintain a result string. Lowercase letters append to the
end, `*` removes the current last character when one exists, `#` duplicates the whole current
result by appending it to itself, and `%` reverses the current result. Return the final
materialized string.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one implementation is best on every meaningful
axis. This problem is that case:

- **Recommended (`solution.cpp`) - fast + lean:** precompute the peak intermediate length,
  reserve that capacity once, then simulate the operations in one `std::string`.
  `O(n + W)` time and `O(M)` returned-string space with `O(1)` auxiliary state.
- **Speed extreme:** *coincides with the recommended.* The input has only 20 operations, the
  output must be fully materialized, and a reserved contiguous string gives the best constants
  for append, pop, self-append, and in-place reverse. Lazy reversal with a deque avoids some
  reverse passes but pays worse cache locality and higher per-character overhead for this
  constraint profile.
- **Memory extreme:** *coincides with the recommended.* The returned string is mandatory, and
  the chosen solution stores only that string plus a few counters. A symbolic per-index
  reconstruction can avoid intermediate capacity, but it still must allocate the output and
  multiplies runtime by scanning the program for each output position; it is dominated here.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.*`.

## Language Choice (C++)

Candidate languages considered:

- **C++:** Best fit. The hot path is byte-oriented string mutation: `push_back`, `pop_back`,
  self-append for `#`, and `std::reverse`. `std::string` is compact, contiguous, directly
  returned by the LeetCode signature, and can reserve the maximum needed capacity before the
  simulation.
- **C:** Considered for manual allocation and pointer loops, but it would add LeetCode
  return-size/lifetime plumbing without a meaningful memory reduction because the output
  buffer dominates the footprint.
- **Rust:** Native and safe, but checked indexing and the platform wrapper do not improve a
  tiny ASCII operation program over C++.
- **Go:** Compiled and straightforward with byte slices, but slice/runtime metadata and final
  conversion to `string` add avoidable constants.
- **Java / C#:** Mutable builders express the algorithm cleanly, but UTF-16 storage,
  object headers, GC involvement, and runtime startup are unnecessary for ASCII-only output.
- **Python / JavaScript / TypeScript / PHP:** The constraints are small enough for concise
  accepted solutions, but interpreter/VM overhead and immutable-string copying lose to native
  C++ for a top-percentile performance target.

Chosen language:

- **Selected:** C++.
- **Why it wins for this proposal:** It provides the strongest practical blend of raw runtime,
  compact output storage, in-place library primitives, and direct platform ergonomics.
- **Why the main alternatives lose:** C does not improve the output-dominated memory profile;
  Rust and Go add wrapper/runtime costs for no algorithmic gain; managed and interpreted
  languages have weaker constants for repeated string mutation.

## Constraints

- `1 <= s.length <= 20`.
- `s` contains only lowercase English letters, `*`, `#`, and `%`.
- The maximum final/intermediate length is bounded by about `2^19` characters under these
  constraints, so materializing the result is safe.
- The function must return the whole final string, not a single character or length.

## Key Observations

1. The rules are deterministic and local; no operation depends on future input.
2. Since the whole result is required, `Omega(M)` time and `Omega(M)` output storage are
   unavoidable, where `M` is the final result length.
3. `#` can enlarge the string quickly, so avoiding repeated reallocations is the main
   constant-factor optimization.
4. `%` can be handled by reversing the current contiguous buffer in place; with at most
   20 operations, a heavier lazy representation is not worth its overhead.

## Reasoning Process

The direct interpretation of the statement is already correct: scan characters and mutate the
current result. The only question is whether the special operations require a more elaborate
representation.

For this version they do not. Unlike the hard variant, the returned value is the full string
and the program length is tiny. A rope, deque, or reverse-index mapping either still has to
write every output character at the end or pays extra indirection throughout the simulation.
The best top-percentile move is therefore to keep the representation as a contiguous
`std::string` and remove avoidable allocation growth by computing the maximum reachable length
first.

## Final Approach

1. Scan `s` once with an integer length model:
   - lowercase letter: increment length;
   - `*`: decrement only if length is positive;
   - `#`: double length;
   - `%`: leave length unchanged.
2. Track the peak length seen during that scan.
3. Reserve `peakLength` in the result string.
4. Scan `s` again and apply the real operations:
   - lowercase letter: `push_back`;
   - `*`: `pop_back` when non-empty;
   - `#`: append the string to itself;
   - `%`: reverse the string in place.
5. Return the result.

## Why This Approach

It matches the problem specification exactly and stays on the right side of both performance
axes. The result is stored once in a compact contiguous buffer, the capacity is prepared
before mutation starts, and every operation uses the standard-library primitive with the best
constant factor for this data shape. The alternatives either add object overhead (`deque` /
rope), do repeated symbolic scans, or copy through managed/interpreted runtimes.

## Top 1% Performance Strategy

- Precompute the peak length and call `reserve(peakLength)` once: no geometric growth, no
  partial-buffer recopy during the real simulation.
- Use manual lowercase checks instead of locale-sensitive character helpers.
- Use `std::string` as the only container: contiguous cache-friendly bytes, no node overhead.
- Use `result += result` for `#` and `std::reverse` for `%`, both optimized library paths.
- Keep the branch structure flat and operation-specific; with `n <= 20`, constant factors
  dominate.

## Edge Cases

- `s = "z*#"` returns `""`: deleting the only character leaves an empty string, and
  duplicating empty still empty.
- `*` on an empty result is a no-op.
- `#` on an empty result is a no-op.
- `%` on length `0` or `1` changes nothing and is safely handled by `std::reverse`.
- Repeated `#` operations after a small prefix are safe because the maximum possible buffer is
  still about half a megabyte.

## Alternatives

- **One-pass simulation without reserve:** correct, but may reallocate and copy partial
  buffers during growth.
- **Lazy reversed deque:** avoids physical reverse operations, but uses a heavier container
  and poorer locality; for only 20 operations it is not a real runtime win.
- **Rope / piece table:** over-engineered for a half-megabyte worst-case materialized output.
- **Per-index reverse reconstruction:** memory-class equivalent after allocating the output,
  but much slower because each output character requires another backward scan.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
