# Complexity - LeetCode 3614: Process String with Special Operations II (C++ proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed and
memory champion. The figures below describe all three axes.

## Recommended - `solution.cpp` (reverse index remapping)

### Time Complexity

```text
O(n)
```

The algorithm scans the operation string once to compute the final length. If `k` is valid,
it scans the string once more from right to left to find the source letter. This is at most
`2n` character visits.

### Space Complexity

```text
O(1) auxiliary
```

Only `len`, `k`, and loop variables are stored. The final string and the prefix-length array
are never materialized.

## Speed Extreme

Coincides with the recommended solution. An exact algorithm must inspect the input program,
and this implementation reaches the linear bound with two tight scans, no heap allocation,
and no logarithmic or hashed structures.

## Memory Extreme

Coincides with the recommended solution. The algorithm already uses constant auxiliary
space; the usual length-history vector would use `O(n)` extra memory without improving the
runtime class.

## Variables

- `n`: length of the operation string `s`.
- `len`: length of the virtual result after the current processed prefix.
- `k`: target index remapped into the current virtual prefix during the backward pass.

## Top 1% Performance Strategy

- Track only virtual lengths, never characters of the virtual result.
- Use `long long` for all lengths and indices, matching the `10^15` constraint.
- Use manual ASCII lowercase checks instead of locale-aware character classification.
- Avoid prefix-length arrays by relying on the valid-index invariant during the backward
  walk.
- Return immediately when the backward scan reaches the letter that created the target slot.

## Optimization Opportunities

No meaningful asymptotic improvement remains for the stated constraints. A prefix-length
array can make the inverse `*` step more explicit, but it performs extra writes and uses
linear memory. A one-pass solution is not available in general because operations after a
letter can duplicate, reverse, or delete its contribution before the final index is known.

## See Also

None - the speed and memory extremes coincide with this proposal (see `notes.md`).
