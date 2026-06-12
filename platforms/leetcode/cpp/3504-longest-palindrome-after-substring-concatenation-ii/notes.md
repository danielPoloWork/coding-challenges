# Notes - LeetCode 3504: Longest Palindrome After Substring Concatenation II (C++ proposals)

## Problem Summary

Given two lowercase strings `s` and `t`, choose one substring from `s` and one substring
from `t`, either of which may be empty, concatenate them in that order, and return the
maximum possible palindrome length.

## Three Proposals

- **Recommended (`solution.cpp`) - fast + lean:** precompute the longest palindromic
  substring starting at each position of `s` and `reverse(t)` by center expansion. Then
  scan every diagonal of the `s x reverse(t)` character grid once, where a consecutive
  equal run is the mirrored shell supplied by both strings.
- **Speed extreme (`solution-runtime.cpp`):** keep the same diagonal shell scan, but derive
  the palindromic middle lengths from Manacher radii plus a sweep of active centers. This
  removes quadratic pure-palindrome preprocessing and is sharper on skewed inputs.
- **Memory extreme (`solution-memory.cpp`):** avoid the reversed copy and dynamic
  containers for auxiliary lengths. It stores only fixed `uint16_t` start/end palindrome
  tables and scans anti-diagonals directly in `s` and `t`.

The recommended and memory variants favor tiny constants under `n, m <= 1000`; the runtime
variant has the best preprocessing bound. All three avoid the `O(nm)` DP table suggested
by the hints.

## Language Choice (per proposal)

Candidate languages considered:

- **C++:** Best fit for all shipped proposals. The hot path is tight character-grid scans
  and compact integer arrays. C++ gives native loops, contiguous storage, predictable
  branch behavior, and LeetCode's natural `string` signature.
- **C:** Considered for memory control, but LeetCode's C string API would require more
  manual boundary handling while not improving the core `O(n + m)` auxiliary state beyond
  the C++ fixed-array memory variant.
- **Rust:** Native and safe, but bounds checks and wrapper ergonomics add friction for
  this small, branch-heavy grid scan without improving asymptotic behavior.
- **Go:** Compiled and concise, but slice bounds checks and runtime metadata are weaker
  constant-factor choices than C++ for top-percentile string DP.
- **Java / C#:** JITs can run the `O(nm)` scan well, but object/runtime overhead and
  UTF-16 character representation are unnecessary for lowercase ASCII strings of length
  at most 1000.
- **Python / JavaScript / TypeScript / PHP:** The constraints are small enough for
  correctness, but interpreter/VM overhead in nested character scans makes them poor fits
  for the top 1% performance target.

Chosen languages:

- **Recommended:** C++. It gives the best practical balance: center expansion is
  cache-local and tiny at this constraint, while the diagonal scan removes the DP table.
- **Speed extreme:** C++. Manacher, heap events, and the cross scan all benefit from
  inlined native loops and compact vectors.
- **Memory extreme:** C++. Fixed stack arrays and `uint16_t` lengths keep the footprint
  very close to a C implementation while preserving the platform's idiomatic signature.

## Constraints

- `1 <= s.length, t.length <= 1000`.
- Both strings contain lowercase English letters.
- The returned length is at most `s.length + t.length <= 2000`.
- Empty substring selection means a valid answer may lie entirely inside `s` or entirely
  inside `t`.

## Key Observations

- Any palindrome crossing the concatenation boundary has mirrored pairs: a suffix of the
  chosen `s` substring must equal the reverse of a suffix of the chosen `t` substring.
- After consuming all mirrored cross-string pairs, the remaining center cannot use both
  strings unless there is another mirrored pair. Therefore the final center is either a
  palindrome starting at the next position in `s`, a palindrome ending before the suffix in
  `t`, or empty.
- In the `s x reverse(t)` grid, those mirrored pairs are simply consecutive equal cells on
  one diagonal.
- For a fixed diagonal position and middle boundary, using the earliest cell of the current
  equal run is always at least as good as starting later, because it adds two characters per
  extra mirrored pair and leaves the same middle boundary.

## Reasoning Process

The brute-force idea enumerates all substrings of `s`, all substrings of `t`, concatenates
each pair, and tests whether the result is a palindrome. That is far beyond the constraint:
there are `O(n^2 m^2)` substring pairs and each check may cost `O(n + m)`.

The hint recurrence points to the right state:

```text
dp[i][j] = best palindrome when the next outer characters are s[i] and t[j]
```

If those characters match, the shell contributes `2` and the state moves inward to
`i + 1, j - 1`; if they do not match, the best remaining answer is a pure palindrome in
one string. Instead of storing this table, observe that repeated matching transitions walk
along one diagonal of `s` against `reverse(t)`. A run of equal diagonal cells is exactly the
same chain of successful DP transitions.

So the solution separates the problem into two pieces:

1. Precompute the best pure palindrome that can be used as a center at every boundary.
2. Scan all diagonals and combine each equal shell length with the best available center
   immediately after that shell.

The boundary detail matters. For example, in `s = "aa", t = "a"`, matching `s[0]` with
`t[0]` leaves a valid middle palindrome starting at `s[1]`, so the answer is `3`.

## Final Approaches

### Recommended - `solution.cpp`

1. Reverse `t`.
2. Use center expansion to compute `leftMiddle[i]`, the longest palindrome starting at
   `s[i]`, and `rightMiddle[j]`, the longest palindrome starting at `reverse(t)[j]`.
3. Initialize the answer from pure palindromes in either string.
4. Scan each diagonal of `s` and `reverse(t)`.
5. Maintain `matchedShell`, the current run length of equal characters on that diagonal.
6. At every equal cell `(i, j)`, update:

```text
2 * matchedShell + max(leftMiddle[i + 1], rightMiddle[j + 1])
```

### Speed Extreme - `solution-runtime.cpp`

1. Compute odd and even Manacher radii for a string.
2. Convert each palindrome center into a range of starting positions where it is active.
3. Sweep starting positions with a max-heap of active center intercepts to recover the
   longest palindrome starting at every index.
4. Run the same diagonal shell scan as the recommended variant.

### Memory Extreme - `solution-memory.cpp`

1. Use fixed stack arrays because lengths are at most `1000` per input string.
2. Store palindrome lengths as `uint16_t`, enough for every value up to `2000`.
3. Compute longest palindromes starting in `s` and ending in `t` by center expansion.
4. Scan anti-diagonals directly in the original `s x t` grid, so no reversed `t` copy is
   needed.

## Why These Approaches

The diagonal scan is the compact form of the DP recurrence: it keeps only the current
matching shell length and delegates the remaining center to precomputed pure-palindrome
tables. This avoids a million-entry DP table while still considering every possible
alignment of a substring from `s` with the reversed suffix from `t`.

The recommended variant is easiest to audit and likely fastest in practice at the official
limits because center expansion over length `1000` is tiny. The runtime variant is better
when analyzing worst-case preprocessing cost. The memory variant trades a little ergonomics
for the smallest auxiliary layout.

## Top 1% Performance Strategy

- Avoid substring creation and palindrome rechecking entirely.
- Replace the `O(nm)` DP table with one scalar `matchedShell` per diagonal.
- Precompute pure-middle palindromes once.
- Use contiguous arrays/vectors and integer lengths only.
- In the memory variant, use `uint16_t` because the maximum length is bounded by `2000`.
- In the runtime variant, use Manacher to avoid repeated center expansions for pure
  palindromes.

## Edge Cases

- Single-character strings: pure-palindrome initialization returns at least `1`.
- No matching characters across strings: the answer is the best pure palindrome from either
  string.
- A palindrome entirely in `t`: handled by the pure `rightMiddle`/ending table.
- Cross palindrome with a middle only in `s`, such as `s = "aa", t = "a"`: handled by the
  `leftMiddle[i + 1]` boundary.
- Cross palindrome with a middle only in `t`, such as `s = "a", t = "aa"`: handled by the
  `rightMiddle[j + 1]` or `rightMiddle[j - 1]` boundary, depending on orientation.
- All characters equal: the diagonal scan grows the full shell and returns `n + m`.

## Alternatives

- **Brute-force substring pairs:** exact but `O(n^2 m^2 (n + m))`.
- **Full DP table from the hints:** correct and still acceptable at this size, but uses
  `O(nm)` memory that the diagonal run formulation does not need.
- **Only longest common substring between `s` and `reverse(t)`:** misses the pure
  palindromic middle that may start after the matched shell.
- **Manacher-only solution:** finds pure palindromes, but still needs all cross-string
  alignments; the diagonal scan supplies that missing part.

## See Also

All proposals for this challenge are in this C++ folder.
