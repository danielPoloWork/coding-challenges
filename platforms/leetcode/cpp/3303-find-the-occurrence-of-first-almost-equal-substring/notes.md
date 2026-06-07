# Notes - LeetCode 3303: Find the Occurrence of First Almost Equal Substring (C++ proposals)

## Problem Summary

Given `s` and `pattern`, find the smallest index `i` such that the length-`m` substring
`s[i..i+m-1]` can be made equal to `pattern` by changing at most one character. If no such
window exists, return `-1`.

## Proposals in This Folder (C++)

This folder holds the **C++** performance proposals. The minimum-footprint champion is in C
and is linked in [See Also](#see-also).

- **Recommended (`solution.cpp`) - fast + lean:** two Z-function passes over
  `pattern + '{' + s` and its reversed counterpart. It stores only the left-side window
  matches plus the active Z buffer.
- **Speed extreme (`solution-runtime.cpp`):** Extended KMP. It computes the same prefix and
  suffix LCP information directly between the original string buffers, avoiding the
  concatenated strings used by the Z solution. This is the raw-runtime variant.

## Language Choice (C++)

For `n <= 1e5` and `m <= 1e5`, the winning strategy is linear string matching with tight
integer arrays. C++ is the most appropriate language here for the fast proposals because it
offers native contiguous memory, direct `char` access, cheap `reverse`, and no GC or
interpreter overhead. The C++ standard containers also keep the implementation readable
without changing the asymptotic cost.

## Constraints

- `1 <= pattern.length < s.length <= 1e5`
- `s` and `pattern` contain only lowercase English letters.

Implications: a quadratic scan of each window is impossible. Any top-tier solution should
be `O(n + m)` or very close to it. `int` is enough for all indexes and match lengths.

## Key Observations

1. For a fixed window, if the longest matching prefix has length `left`, then the first
   possible mismatch is at offset `left`.
2. The window is valid when the suffix after that mismatch also matches. Equivalently,
   `left + right >= m - 1`, where `right` is the longest matching suffix length.
3. All `left` values are LCPs between `pattern` and suffixes of `s`; all `right` values are
   LCPs between reversed `pattern` and suffixes of reversed `s`.
4. Z-function or Extended KMP computes those LCPs for all starts in linear time.

## Reasoning Process

The direct method compares every length-`m` window to `pattern`, stopping at the second
mismatch. This can still be `O(nm)`: for example, many windows can share a long equal
prefix before failing near the end.

The hints suggest separating the decision into two independent exact-match lengths:

```text
left[i]  = longest prefix of pattern matching s[i...]
right[i] = longest suffix of pattern matching s[...i]
```

For a window beginning at `i`, its right edge is `i + m - 1`. The window is almost equal if
the exact prefix and exact suffix leave at most one uncovered position:

```text
left_at_i + right_at_window_end >= m - 1
```

Computing suffix matches is the same problem on reversed strings. In reversed `s`, the
window `s[i..i+m-1]` begins at index `n - m - i`, so the suffix contribution is read from
that reversed start.

## Final Approaches

Recommended:

1. Build `pattern + '{' + s`, where `'{'` is outside the lowercase input alphabet.
2. Run the Z-function and save `left[i] = Z[m + 1 + i]` for every possible window start.
3. Reverse both strings and run Z again.
4. For each original start `i`, read the reversed match at `n - m - i`.
5. Return the first `i` with `left[i] + right >= m - 1`.

Runtime extreme:

1. Compute the Z array of `pattern` itself.
2. Use Extended KMP to compute LCPs from every suffix of `s` to `pattern`.
3. Reverse both strings and repeat.
4. Scan windows with the same `left + right >= m - 1` test.

## Why These Approaches

Both C++ proposals hit the `Omega(n + m)` lower bound: the input must be read, and the
pattern must be inspected. The recommended solution is easier to audit and already very
fast. The Extended KMP variant spends more array storage but avoids concatenated working
strings, so it is the sharper raw-runtime proposal.

The memory proposal is separated into C because its objective is different: lower runtime
and container baseline, one reusable Z buffer, and no materialized joined/reversed strings.

## Top 1% Performance Strategy

- Linear-time exact string matching; no rolling hash collisions, no binary search, no
  repeated per-window comparisons.
- One delimiter outside the input alphabet, so Z values never cross from the pattern into
  the text incorrectly.
- Earliest answer returned immediately during the final left-to-right scan.
- `int` arrays only; maximum combined length is below `2e5 + 1`.
- Extended KMP variant compares original buffers directly to reduce string construction
  overhead in the hottest runtime path.

## Edge Cases

- `pattern.length == 1`: every single-character window is almost equal after at most one
  change, so the answer is `0`; the condition becomes `left + right >= 0`.
- Exact match: `left >= m`, therefore accepted.
- One mismatch at the first or last character: one side contributes `0`, the other
  contributes `m - 1`.
- No valid window: every candidate leaves at least two uncovered positions.
- Highly repetitive strings: Z and Extended KMP remain linear because each scan maintains a
  rightmost match box.

## Alternatives

- **Naive window comparison:** easy but worst-case `O(nm)`.
- **Rolling hash plus binary search:** can be fast in practice, but is either probabilistic
  or requires heavier deterministic machinery; it also adds a `log m` factor.
- **Suffix array / suffix automaton:** exact but overbuilt for a single pattern and one
  text; slower constants and more memory than Z/Extended KMP.

## Follow-up Note

If at most `k` consecutive characters may be changed, the same prefix/suffix idea extends
to `left + right + k >= m`: the changed block can occupy the uncovered gap between the
matched prefix and suffix.

## See Also

Minimum-footprint champion (C, virtual joined Z buffer, `O(n + m)` time, `O(n + m)` space
with lower constants): `../../c/3303-find-the-occurrence-of-first-almost-equal-substring/`.
