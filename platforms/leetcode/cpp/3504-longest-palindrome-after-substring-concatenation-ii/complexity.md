# Complexity - LeetCode 3504: Longest Palindrome After Substring Concatenation II

## Recommended - `solution.cpp` (center expansion + diagonal shell scan)

### Time Complexity

```text
O(n^2 + m^2 + n * m)
```

Center expansion computes pure-palindrome middle lengths in `O(n^2 + m^2)` worst-case time.
The cross-string phase scans every cell of the `s x reverse(t)` grid exactly once.

### Space Complexity

```text
O(n + m)
```

The solution stores the reversed `t` string and two arrays of pure-palindrome middle
lengths. It does not store the `O(nm)` DP table.

## Speed extreme - `solution-runtime.cpp` (Manacher middles + diagonal shell scan)

### Time Complexity

```text
O(n * m + (n + m) log(n + m))
```

Manacher radii are linear. Converting center radii into longest-palindrome-starting
answers uses heap sweeps over active centers, costing `O(n log n + m log m)`. The diagonal
cross scan still costs `O(nm)`.

### Space Complexity

```text
O(n + m)
```

The implementation stores radii, center events, active heaps, the reversed `t`, and the two
middle-length arrays, all linear in the input sizes.

## Memory extreme - `solution-memory.cpp` (fixed arrays + direct anti-diagonals)

### Time Complexity

```text
O(n^2 + m^2 + n * m)
```

Like the recommended variant, it uses center expansion for pure-palindrome lengths and
scans each cross-string alignment once.

### Space Complexity

```text
O(n + m)
```

Auxiliary lengths are stored in fixed `uint16_t` arrays. The variant avoids the reversed
copy of `t` and avoids heap-allocated vectors for the palindrome-length tables.

## Variables

- `n`: length of `s`.
- `m`: length of `t`.
- `matchedShell`: number of consecutive equal mirrored pairs on the current diagonal.
- `leftMiddle[i]`: longest palindromic substring starting at `s[i]`.
- `rightMiddle[j]`: longest palindromic substring starting at `reverse(t)[j]` or ending at
  `t[j]` in the direct memory variant.

## Top 1% Performance Strategy

- Use diagonal runs instead of materializing the hint DP table.
- Keep all hot loops on contiguous character data.
- Precompute pure-palindrome centers once and reuse them for every shell boundary.
- Use native C++ integer arrays/vectors instead of maps, sets, substring objects, or
  recursive memoization.
- Store memory-variant lengths as `uint16_t`, which is enough because the answer is at most
  `2000`.

## Optimization Notes

The recommended solution is usually the best practical choice under `n, m <= 1000`: the
quadratic center expansion is small and branch-predictable. The runtime variant is useful
when emphasizing preprocessing bounds, especially if one string is much longer than the
other within the allowed range. The memory variant is the leanest auxiliary layout while
preserving the same exact diagonal reasoning.
