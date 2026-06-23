# Notes - LeetCode 3699: Number of ZigZag Arrays I (C memory proposal)

## Problem Summary

Count length-`n` arrays over the value range `[l, r]` such that adjacent values differ and
comparison signs alternate. The sign alternation is equivalent to the original condition:
no adjacent equality and no strictly increasing or strictly decreasing triple.

This folder contains the minimum-memory proposal. The recommended and fastest-runtime
proposal lives in `../../cpp/3699-number-of-zigzag-arrays-i/`.

## Proposals for This Challenge

- **Recommended (`../../cpp/3699-number-of-zigzag-arrays-i/solution.cpp`) - fast + lean:**
  C++ mirrored rank DP with two fixed stack buffers.
- **Speed extreme:** coincides with the C++ recommended proposal, so no duplicate
  `solution-runtime.cpp` is shipped.
- **Memory extreme (`solution-memory.c`):** C mirrored rank DP updated in-place inside one
  stack buffer.

The memory proposal keeps the same O(n * m) recurrence but halves the explicit DP buffer
count. It is less straightforward than the two-buffer C++ loop, so it is not the default
proposal.

## Language Choice (C for memory)

Candidate languages considered:

- **C++:** best for the recommended/runtime proposal because two stack buffers and pointer
  swaps give a very clean hot loop, but that spends a second DP buffer.
- **C:** selected for the memory objective. One raw `int[2000]` stack buffer and scalar
  counters are the smallest practical state.
- **Rust:** native and safe, but wrapper and checked-indexing machinery do not reduce the
  one-buffer memory footprint.
- **Go:** slices are simple, but runtime and slice metadata are heavier than raw C storage.
- **Java / C#:** primitive arrays still carry managed object/runtime overhead.
- **Python / JavaScript / TypeScript / PHP:** dynamic arrays and VM numeric storage are
  dominated for memory.

Chosen language:

- **Selected:** C.
- **Why it wins for this proposal:** it exposes the one-buffer in-place transform directly
  with the smallest explicit auxiliary state.
- **Why the main alternatives lose:** C++ is better for the fastest readable default, but
  managed and interpreted runtimes are too heavy for the least-memory axis.

## Constraints

- `3 <= n <= 2000`.
- `1 <= l < r <= 2000`.
- `m = r - l + 1 <= 2000`.
- Answer modulo `1_000_000_007`.

## Key Observations

- Valid arrays are exactly arrays whose adjacent comparison signs alternate.
- The rank width `m`, not the absolute values, determines the answer.
- Upward-ending and downward-ending counts are mirrors of each other.
- The next upward vector is a reversed prefix sum of the current upward vector.
- That reversed-prefix transform can be done in-place if old low cells are saved into old
  high cells after those high cells have been consumed.

## Final Approach - `solution-memory.c`

1. Initialize `dp[y] = y`, the count of length-2 arrays ending at rank `y` with an upward
   last move.
2. For each new length, set `dp[0] = 0`.
3. Scan ranks `y = 1..m-1`.
4. Read the old mirrored cell `m - y`.
5. If the mirrored cell is still to the right, save the old current cell into that
   consumed mirrored slot for later use.
6. Write the running modular sum back to `dp[y]`.
7. Return twice the final one-direction sum.

## Top 1% Performance Strategy

- Keep the O(n * m) prefix-sum recurrence from the runtime proposal.
- Use one stack buffer with no heap allocation.
- Preserve modulo values below `MOD` to allow one conditional subtraction per addition.
- Return immediately for `m == 2`, where only two arrays exist.

## Verification

A temporary Python mirror compared this in-place transform against brute force, the full
two-direction DP, and the C++ two-buffer recurrence on randomized and maximum-size cases.
The script passed and was removed.

## See Also

- Recommended and fastest-runtime C++ proposal: `../../cpp/3699-number-of-zigzag-arrays-i/`
