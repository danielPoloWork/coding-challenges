# Complexity - LeetCode 420: Strong Password Checker (C++ proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed and
memory champion. The figures below describe all three axes.

## Recommended - `solution.cpp` (greedy run repair)

### Time Complexity

```text
O(n)
```

The solution scans the password for character classes and scans equal-character runs. The
deletion scheduling after the scans is constant time.

### Space Complexity

```text
O(1) extra
```

Only scalar counters are stored: missing type flags, replacement count, deletion buckets,
and loop indices. No run array or auxiliary string is allocated.

## Speed Extreme

Coincides with the recommended solution. Any correct solution must inspect the input
characters, and this implementation reaches that `O(n)` lower-bound shape with a small
constant factor.

## Memory Extreme

Coincides with the recommended solution. The algorithm uses constant extra memory and does
not store repeated run lengths; keeping less than a fixed set of counters would lose
information needed for optimal overlength deletions.

## Variables

- `n`: password length, with `1 <= n <= 50`.
- `L`: length of one maximal run of equal characters.
- `missingTypes`: count of required character classes that are absent.
- `replacements`: number of replacements required to break all triples before or after
  deletion reduction.

## Top 1% Performance Strategy

- Native C++ direct method call with only integer counters.
- ASCII comparisons for class checks.
- Linear run scan with no substring creation.
- `% 3` deletion priority reduces replacements optimally without sorting runs.
- Constant-memory implementation, so cache behavior is trivial.

## Optimization Opportunities

No meaningful asymptotic optimization remains. The implementation already performs the
minimum necessary input inspection and uses constant extra memory. Micro-optimizations beyond
this would be judge-noise-level changes rather than a distinct non-dominated proposal.

## See Also

None - the speed and memory extremes coincide with this proposal (see `notes.md`).
