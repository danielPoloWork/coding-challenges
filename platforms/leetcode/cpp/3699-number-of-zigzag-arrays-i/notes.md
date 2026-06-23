# Notes - LeetCode 3699: Number of ZigZag Arrays I (C++ recommended/runtime)

## Problem Summary

Count arrays of length `n` whose values lie in `[l, r]`, adjacent values are never equal,
and no three consecutive values are strictly increasing or strictly decreasing. Return
the count modulo `1_000_000_007`.

Because adjacent values cannot be equal, every adjacent pair has a sign: up or down. A
triple is strictly monotone exactly when two consecutive signs are the same. Therefore a
valid array is precisely an array whose comparison signs alternate.

## Proposals for This Challenge

- **Recommended (`solution.cpp`) - fast + lean:** C++ mirrored rank DP with two fixed
  stack buffers. It stores only upward-ending counts; downward-ending counts are obtained
  by rank symmetry.
- **Speed extreme:** coincides with `solution.cpp`. A separate `solution-runtime.cpp`
  would duplicate the same O(n * m) transition and the same memory class, so it is not
  shipped.
- **Memory extreme (`../../c/3699-number-of-zigzag-arrays-i/solution-memory.c`):** C
  in-place mirrored DP. It keeps one stack buffer instead of two and pays a few extra
  assignments to preserve mirrored old values while overwriting.

The trade-off is narrow but real: the C++ proposal is the fastest and still memory-light
at about two `m`-sized integer buffers; the C memory proposal halves the DP buffer but has
more involved in-place data movement.

## Language Choice (C++ for recommended/runtime)

LeetCode supports the practical candidates, and the decisive workload is a dense modular
DP over at most `2000 * 2000` rank transitions.

Candidate languages considered:

- **C++:** selected for the recommended/runtime axis. Fixed stack arrays, pointer swaps,
  native integer loops, and the class method signature give excellent constants.
- **C:** selected for the least-memory sibling, but for the fastest readable LeetCode
  submission the C++ wrapper and stack arrays are more ergonomic with no speed loss.
- **Rust:** native and safe, but checked indexing and wrapper friction are not useful for
  this small fixed-table recurrence.
- **Go:** compiled loops are fine, yet slice bounds checks and runtime overhead are weaker
  for top-percentile constants.
- **Java / C#:** primitive arrays can run quickly after warmup, but managed runtime
  overhead and bounds checks are unnecessary for this DP.
- **Python / JavaScript / TypeScript / PHP:** theoretically feasible at four million
  states, but interpreter or VM loops are dominated for the performance target.

Chosen language:

- **Selected:** C++ for recommended and fastest-runtime.
- **Why it wins for this proposal:** the algorithm is scalar-loop dominated and C++ keeps
  all state in compact stack memory with branch-light modular additions.
- **Why the main alternatives lose:** managed and interpreted languages add runtime
  overhead, while C is reserved for the memory champion where the API trade-off is worth
  the smaller explicit buffer.

## Constraints

- `3 <= n <= 2000`.
- `1 <= l < r <= 2000`.
- Let `m = r - l + 1`; then `2 <= m <= 2000`.
- The answer must be returned modulo `1_000_000_007`.
- Only the relative rank inside `[l, r]` matters; the absolute value of `l` never appears
  in the recurrence.

## Key Observations

- With adjacent equality banned, every adjacent comparison is either up or down.
- A forbidden monotone triple is exactly two equal consecutive signs: up-up or down-down.
- Therefore every valid array alternates signs.
- For a fixed ending rank, only the previous layer and one comparison direction matter.
- Downward-ending counts are the mirror image of upward-ending counts because replacing
  rank `y` by `m - 1 - y` swaps up and down.

## Reasoning Process

The direct brute force idea tries all `m^n` arrays and filters them, which is impossible.
The first compression is to keep only the last value and last comparison sign:

```text
up[len][y]   = arrays of length len ending at rank y with last move up
down[len][y] = arrays of length len ending at rank y with last move down
```

To extend with an up move into `y`, the previous rank must be smaller than `y` and the
previous sign must be down. The symmetric rule holds for down moves:

```text
nextUp[y]   = sum down[x] for x < y
nextDown[y] = sum up[x]   for x > y
```

Prefix and suffix sums reduce a layer from O(m^2) to O(m). Then symmetry removes the
second direction array:

```text
down[x] = up[m - 1 - x]
nextUp[y] = sum up[z] for z >= m - y
```

The base length is `2`: `up[y] = y`, because there are exactly `y` lower ranks that can
precede rank `y` with an upward move.

## Final Approach - `solution.cpp`

1. Convert `[l, r]` to `m = r - l + 1` ranks.
2. Initialize `cur[y] = y` for length `2`.
3. For each target length from `3` to `n`, build `nxt` left to right.
4. Maintain a running reversed prefix sum of `cur[m - y]`.
5. Store that sum as `nxt[y]`.
6. Swap the two buffers.
7. Sum the final one-direction counts and multiply by `2` for the mirrored downward
   direction.

## Why This Approach

The O(n * m) DP is the natural lower-complexity solution for the hinted recurrence. It
avoids all O(m^2) transitions and does not allocate an `n * m` table. The symmetry
reduction removes half the state without changing the recurrence, which improves both
runtime constants and memory pressure.

The memory sibling is preferable only when the explicit DP buffer count matters more than
the cleanest hot loop. For normal LeetCode scoring, `solution.cpp` is the better default.

## Top 1% Performance Strategy

- Use ranks instead of actual values; no coordinate data structure is needed.
- Store only one comparison direction by mirror symmetry.
- Use fixed `int[2000]` stack buffers and pointer swaps; no heap allocation.
- Keep modulo values below `MOD`, so each addition needs at most one subtraction.
- Add an early return for `m == 2`, where exactly two alternating arrays exist for every
  `n >= 2`.

## Edge Cases

- `m = 2`: only `[l, r, l, ...]` and `[r, l, r, ...]` are valid.
- `n = 3`: the answer matches the examples: `m = 2` gives `2`, `m = 3` gives `10`.
- Large maximum `n = 2000`, `m = 2000`: about four million transitions.
- Ranges with different `l` but the same width have the same answer.

## Verification

A temporary Python script mirrored both the two-buffer C++ algorithm and the in-place C
algorithm, compared them with brute force for small `n, m`, with the full two-direction
DP for randomized medium cases, and with each other on maximum-size cases. The script
passed and was removed.

## See Also

- Least-memory C proposal: `../../c/3699-number-of-zigzag-arrays-i/`
