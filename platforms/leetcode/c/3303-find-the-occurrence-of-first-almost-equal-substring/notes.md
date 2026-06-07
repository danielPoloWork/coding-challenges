# Notes - LeetCode 3303: Find the Occurrence of First Almost Equal Substring (C memory proposal)

## Problem Summary

Find the first length-`m` substring of `s` whose Hamming distance from `pattern` is at most
one.

## Proposal in This Folder (C)

This folder holds the **minimum-memory** proposal:

- **Memory extreme (`solution-memory.c`):** two Z-function passes over a virtual
  `pattern + '{' + s` view. The same `int` Z buffer is reused for the forward and reversed
  scans, and the code stores only the left-match length for each candidate window.

Recommended and runtime-extreme implementations are in C++ - see [See Also](#see-also).

## Language Choice (C)

The memory objective favors C because LeetCode passes `char*` strings directly, and the
implementation can control every allocation. The virtual joined-string accessor removes
the need for concatenated strings and reversed copies, leaving only one Z array and one
window array.

## Constraints

- `1 <= pattern.length < s.length <= 1e5`
- Lowercase English letters only.

`int` indexes are sufficient. The delimiter `'{'` is safe because it is outside `'a'..'z'`.

## Key Observations

- A candidate window is valid iff its exact prefix match plus exact suffix match covers at
  least `m - 1` positions.
- Suffix matches become prefix matches after reversing both `s` and `pattern`.
- The reversed joined string can be addressed by index without allocating it.

## Final Approach

1. Allocate one `z` buffer of length `n + m + 1` and one `left` array of length
   `n - m + 1`.
2. Run Z over the virtual forward joined string and copy each window's prefix match to
   `left`.
3. Run Z over the virtual reversed joined string, reusing `z`.
4. Scan original window starts from left to right. For start `i`, read suffix agreement from
   reversed start `n - m - i`.
5. Return the first `i` with `left[i] + right >= m - 1`, otherwise `-1`.

## Why This Approach

It preserves the optimal `O(n + m)` time bound while trimming allocations compared with
container-based implementations. The price is a slightly more manual accessor and less
ergonomic code, which is appropriate for the memory-specialized proposal but not for the
default recommendation.

## Top 1% Performance Strategy

- Exact Z-function scans; no hashing and no repeated per-window verification.
- One reusable `int` Z buffer.
- No concatenated working strings.
- No reversed character buffers; reversed positions are mapped arithmetically.
- Early return once the first valid window is found.

## Edge Cases

- `m = 1`: returns `0`, because changing one character can match the one-character pattern.
- Exact full match: accepted by `left >= m`.
- Mismatch at either boundary: accepted by the opposite side's `m - 1` match.
- Repetitive inputs: Z remains linear due to the maintained match box.

## See Also

- Recommended C++ Z solution:
  `../../cpp/3303-find-the-occurrence-of-first-almost-equal-substring/solution.cpp`
- Runtime-extreme C++ Extended KMP solution:
  `../../cpp/3303-find-the-occurrence-of-first-almost-equal-substring/solution-runtime.cpp`
