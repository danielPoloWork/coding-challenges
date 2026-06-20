# Notes - LeetCode 1840: Maximum Building Height

## Problem Summary

We have `n` buildings in a line. Building `1` must have height `0`, every height is a
non-negative integer, and adjacent heights may differ by at most `1`. Some buildings also
have explicit maximum-height caps. The task is to maximize the tallest building in any
valid assignment.

This C++ folder contains the recommended fast + lean proposal. The same implementation is
also the fastest-runtime proposal, so there is no duplicate `solution-runtime.cpp`. The
minimum-memory champion is in `../../c/1840-maximum-building-height/solution-memory.c`.

## Three Proposals -> Two Files

- **Recommended (`solution.cpp`) - fast + lean:** copy the restrictions into contiguous
  `pair<int,int>` points, add the natural endpoint caps, sort once, run two relaxation
  passes, and compute the best peak per interval.
- **Speed extreme:** coincides with the recommended C++ implementation. The algorithm is
  sorting-bound, and the contiguous pair representation gives the best practical constants
  for LeetCode's C++ runner.
- **Memory extreme (`../../c/1840-maximum-building-height/solution-memory.c`) - C in-place:**
  sort the provided `int**` restriction rows in place and reuse their height cells for the
  relaxed caps, avoiding an auxiliary point vector.

The trade-off is direct: recommended/runtime use `O(m)` auxiliary memory for a compact,
cache-friendly representation; the C memory proposal keeps `O(1)` extra space but pays
`qsort` comparator overhead and pointer-chasing through the platform input shape.

## Language Choice (per proposal)

### Recommended and Speed Extreme - `solution.cpp`

Candidate languages considered:

- **C++:** Selected. `std::sort` over contiguous `pair<int,int>` points is inlined,
  cache-friendly, and fits the usual LeetCode `vector<vector<int>>` signature. The two
  passes are scalar arithmetic and use `long long` only where sums can exceed `int`.
- **C:** Strong for the memory proposal, but `qsort` over pointer rows uses a function
  pointer comparator and loses the compact pair sort that helps the runtime objective.
- **Rust:** Native and safe, but the LeetCode wrapper and bounds-check ergonomics do not
  improve a simple sort-and-scan solution.
- **Go:** Compiled and readable, but slice/runtime overhead and comparator costs are less
  attractive for top-percentile execution time.
- **Java / C#:** JITs can optimize sorting and scans, but managed object layout and runtime
  baseline add avoidable overhead for `m <= 100000`.
- **Python / JavaScript / TypeScript / PHP:** They can express the algorithm, but VM or
  interpreter overhead is dominated by native C++ at the maximum input size.

Chosen language:

- **Selected:** C++.
- **Why it wins for this proposal:** the hot path is sorting plus two linear passes, and
  C++ gives the lowest practical constants while keeping memory modest.
- **Why the main alternatives lose:** C is better only for minimum peak memory; managed and
  interpreted languages do not beat native sorting and scalar loops.

### Memory Extreme - C sibling

Candidate languages considered:

- **C++:** Can do an in-place variant, but the nested vector input and any compact copy are
  larger than the direct C pointer-array approach.
- **C:** Selected for the memory champion because the input rows can be sorted in place and
  the algorithm needs only scalars after that.
- **Rust:** Native but not smaller than C on this platform signature.
- **Go:** Runtime and slice metadata are larger than C for the memory goal.
- **Java / C#:** Managed array/object overhead is not suitable for the least-memory axis.
- **Python / JavaScript / TypeScript / PHP:** Object-heavy nested arrays are dominated for
  memory.

Chosen language:

- **Selected:** C.
- **Why it wins for this proposal:** it reaches the same `O(m log m)` algorithm with
  `O(1)` extra memory beyond the provided input.
- **Why the main alternatives lose:** they add wrapper, metadata, or runtime memory without
  improving the algorithm.

## Constraints

- `2 <= n <= 1000000000`.
- `0 <= restrictions.length <= min(n - 1, 100000)`.
- Restriction IDs are unique and lie in `[2, n]`.
- Maximum heights are in `[0, 1000000000]`.
- Building `1` is never explicitly restricted, but it is implicitly capped at `0`.

## Key Observations

1. If building `a` has height at most `h`, then building `b` can be at most
   `h + |b - a|` because adjacent differences are capped by `1`.
2. Therefore every restriction sends a cone-shaped upper bound to the left and right.
3. Sorting by building ID lets us tighten all caps with one left-to-right pass and one
   right-to-left pass.
4. After both passes, adjacent restricted points are mutually feasible: their heights
   differ by no more than their distance.
5. Between two feasible endpoint caps `(x1, h1)` and `(x2, h2)`, the tallest point is where
   the upward slope from the lower side and the downward slope from the higher side meet:
   `floor((h1 + h2 + (x2 - x1)) / 2)`.

## Reasoning Process

A brute-force height array is impossible because `n` can be `1e9`. The only useful
positions are the restricted buildings plus the mandatory endpoint information. Building
`1` is fixed at `0`, and without other restrictions the final height can climb to `n - 1`,
so `n` has a natural cap of `n - 1`.

The first pass makes every cap reachable from the left:

```text
height[i] = min(height[i], height[i - 1] + id[i] - id[i - 1])
```

The second pass applies the symmetric condition from the right. Once both passes are done,
the restricted caps describe the tightest possible upper envelope at those positions.

For an interval of length `d` with endpoint caps `a` and `b`, any internal building at
offset `t` is capped by both `a + t` and `b + d - t`. Maximizing
`min(a + t, b + d - t)` gives the meeting height:

```text
floor((a + b + d) / 2)
```

Scanning all adjacent relaxed points and taking the largest such value gives the answer.

## Final Approaches

### Recommended and Speed Extreme - `solution.cpp`

1. Create a compact `vector<pair<int,int>>` named `limits`.
2. Add `(1, 0)`, every explicit restriction, and `(n, n - 1)`.
3. Sort by building ID.
4. Relax caps left-to-right.
5. Relax caps right-to-left.
6. For every adjacent pair, compute the interval peak with the formula above.
7. Return the maximum peak.

Duplicate endpoint `n` is harmless when `n` is explicitly restricted: sorting places the
lower cap first, and the zero-distance relaxation collapses the duplicate caps to the same
minimum value.

### Memory Extreme - C sibling

1. Sort the provided `int** restrictions` rows by ID in place.
2. Relax heights from the virtual left endpoint `(1, 0)`.
3. Relax heights from the virtual right cap `(n, n - 1)`.
4. Scan real restricted intervals with the same peak formula.
5. For the suffix after the last restriction, climb directly by the remaining distance.

## Why These Approaches

The two-pass relaxation is exact because each pass applies all slope-1 constraints from one
direction, and the second pass preserves the constraints already made tight by the first.
No building outside the sorted restriction set can impose a tighter cap; internal buildings
only need to respect the two neighboring relaxed caps.

The C++ proposal is preferable for the default and runtime axes because it turns the nested
input into a compact sorted array and then performs predictable linear scans. The C proposal
is preferable only when peak auxiliary memory is the priority.

## Top 1% Performance Strategy

- Reduce the `n = 1e9` search space to `m + 2` relevant cap points.
- Use `std::sort` on contiguous `pair<int,int>` values instead of sorting nested vectors.
- Use two linear relaxation passes; no binary search on the answer is needed.
- Use the closed-form interval peak instead of iterating buildings inside intervals.
- Reserve the exact point-vector capacity to avoid reallocations.
- Use `long long` for intermediate sums while returning an `int` answer.

## Edge Cases

- No restrictions: the answer is `n - 1`.
- A restriction at `n`: the duplicate endpoint cap collapses to the stricter height.
- Very low middle cap: both passes propagate that cap outward before peak computation.
- Restrictions out of order: sorting normalizes them.
- Large `n` and high caps: intermediate sums use `long long`.

## Alternatives

- **Brute-force height array:** impossible at `n = 1e9`.
- **Binary search on the answer:** feasible but unnecessary; feasibility still needs the
  same relaxed envelope and adds a logarithmic factor.
- **Only a left-to-right pass:** misses right-side restrictions, so it can overestimate
  peaks before a low cap.
- **Sorting `vector<vector<int>>` directly for runtime:** avoids the copy but has worse
  locality and more pointer indirection than compact pairs.

## See Also

- Minimum-memory C proposal: `../../c/1840-maximum-building-height/`
