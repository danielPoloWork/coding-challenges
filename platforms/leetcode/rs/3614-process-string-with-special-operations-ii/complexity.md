# Complexity - LeetCode 3614: Process String with Special Operations II (Rust didactic proposal)

This Rust entry is a didactic re-solve. The performance champions for all three axes are
the existing C++ `solution.cpp`; this folder mirrors the same algorithm for language
coverage.

## Didactic Rust - `solution.rs`

### Time Complexity

```text
O(n)
```

The algorithm scans the operation string once to compute the final virtual length. If
`k` is valid, it scans the string once more backward to locate the source letter. This is
at most `2n` byte visits.

### Space Complexity

```text
O(1) auxiliary
```

The solution stores only `len`, `k`, and loop state. It does not build the final string and
does not store a prefix-length history.

## Referenced Champions

- Recommended: C++ `solution.cpp`, `O(n)` time and `O(1)` auxiliary space.
- Speed extreme: same C++ `solution.cpp`; exact solutions must inspect the program string,
  and the champion uses two tight native scans with no heap allocation.
- Memory extreme: same C++ `solution.cpp`; the algorithm already uses constant auxiliary
  state.

## Variables

- `n`: length of `s`.
- `len`: length of the current virtual prefix.
- `k`: target index remapped into the current virtual prefix during the backward pass.

## Optimization Notes

- Byte scanning avoids Unicode iteration because the alphabet is fixed to ASCII letters and
  three ASCII operation characters.
- No vector of prefix lengths is allocated; the valid-index invariant is enough to undo
  every operation.
- `i64` is sufficient for the `10^15` maximum final length.
