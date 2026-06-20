# Notes - LeetCode 1732: Find the Highest Altitude (C++ proposal)

## Problem Summary

A biker starts at altitude `0`. Each value in `gain` is the altitude change between two
consecutive points. Return the highest altitude reached at any point, including the starting
point.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one implementation is best on every meaningful
axis. For this problem the running-prefix-sum scan is simultaneously the recommended,
speed-extreme, and memory-extreme solution:

- **Recommended (`solution.cpp`) - fast + lean:** keep the current altitude and the best
  altitude seen so far. Add each gain once and update the maximum.
- **Speed extreme:** *coincides with the recommended.* Any correct solution must inspect
  every gain because a later value can create the maximum altitude. The scan reaches the
  `Omega(n)` lower bound with one tight pass.
- **Memory extreme:** *coincides with the recommended.* The algorithm keeps only two
  integer accumulators and allocates no auxiliary containers.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.*`.

## Language Choice (C++)

Candidate languages considered:

- **C++:** Selected. LeetCode's C++ signature passes `vector<int>&` without copying, the
  loop compiles to a compact native integer scan, and the implementation uses no heap
  allocation inside the method.
- **C:** Also native and similarly compact, but for this LeetCode problem it provides no
  algorithmic or memory advantage over C++: both use the judge-owned contiguous input and
  two scalar integers. C++ keeps the official class-based submission shape.
- **Rust:** Native performance is competitive, but bounds-check and iterator codegen do
  not improve on this scalar C++ loop for such a tiny arithmetic workload.
- **Go:** The slice loop is simple, but the Go runtime and bounds-check profile add no
  benefit for a method whose entire work is one integer pass.
- **Java / C#:** JITs can make the loop fast, but startup/runtime metadata and managed
  execution are unnecessary overhead for `n <= 100`.
- **Python / JavaScript / TypeScript / PHP:** The constraints are small enough that these
  languages pass comfortably, but interpreter or VM overhead is dominated by the language
  runtime rather than the algorithm.

Chosen language:

- **Selected:** C++.
- **Why it wins for this proposal:** it gives native-code speed, direct access to the
  judge-provided contiguous array, no per-element allocation, and simple 32-bit arithmetic.
- **Why the main alternatives lose:** C is effectively tied at the machine-code level but
  not meaningfully leaner here; Rust/Go/managed/interpreted options add checks, runtime
  machinery, or startup overhead without changing the optimal algorithm.

## Constraints

- `1 <= gain.length <= 100`.
- `-100 <= gain[i] <= 100`.
- The minimum and maximum possible altitude are within `[-10000, 10000]`, so signed
  32-bit `int` arithmetic is more than sufficient.
- The starting altitude `0` is a valid point and must be considered as a candidate maximum.

## Key Observations

1. The altitude after edge `i` is the prefix sum `gain[0] + ... + gain[i]`.
2. We do not need to materialize the full altitude array; only the current altitude and the
   maximum observed altitude matter.
3. Since any gain can affect the final maximum, every element must be read at least once.

## Reasoning Process

The hinted prefix-sum array is the direct representation: build all altitudes and take the
maximum. That is correct, but storing the array repeats information that is consumed
immediately.

The useful invariant is:

```text
after processing a gain value:
altitude = altitude at the newly reached point
highest  = max altitude among all points seen so far
```

The trip starts at altitude `0`, so `highest` starts at `0`. Each `gain` value moves to the
next point, and a single comparison decides whether that new point is the highest so far.

## Final Approach

1. Initialize `altitude = 0` and `highest = 0`.
2. For every `delta` in `gain`:
   - add `delta` to `altitude`;
   - update `highest` if `altitude` is larger.
3. Return `highest`.

## Why This Approach

This is the prefix-sum idea reduced to the information actually required by the answer.
It is linear, allocation-free, branch-light, and easier to audit than an approach that
stores all intermediate altitudes.

## Top 1% Performance Strategy

- One pass over contiguous `vector<int>` storage.
- No auxiliary altitude vector.
- Two `int` accumulators only.
- Manual maximum update in the hot loop.
- `int` arithmetic, justified by the tight altitude bounds.

## Edge Cases

- All gains are negative: the start altitude `0` remains the answer.
- Single gain: compare the one reached altitude with the starting altitude.
- Mixed positive and negative gains: the running maximum preserves earlier peaks even if
  the final altitude drops.
- Maximum magnitude input: total altitude stays far inside signed 32-bit range.

## Alternatives

- **Build the altitude array:** `O(n)` time but `O(n)` extra memory with no benefit.
- **Use `std::partial_sum` plus `max_element`:** concise, but it materializes intermediate
  values and performs extra library work.
- **Nested recomputation of each prefix:** `O(n^2)` and dominated immediately by the
  running-sum scan.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
