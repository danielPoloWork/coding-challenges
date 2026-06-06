# Complexity - LeetCode 2574: Left and Right Sum Differences (C++ proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed and
memory champion. The figures below describe all three axes.

## Recommended - `solution.cpp` (total sum + running left sum)

### Time Complexity

```text
O(n)
```

The first pass computes the total sum. The second pass writes each answer once while
updating the two running sums. Since the method must return `n` values, `O(n)` is also the
lower bound for any correct implementation.

### Space Complexity

```text
O(1) auxiliary space, O(n) output space
```

The algorithm uses two integer accumulators, one loop index, and the required returned
array. It does not allocate `leftSum`, `rightSum`, hash tables, or any other data structure.

## Speed Extreme

Coincides with the recommended solution. The algorithm reaches the output-size lower bound
with two simple linear passes over contiguous memory and direct indexed writes.

## Memory Extreme

Coincides with the recommended solution. Excluding the required output array, the extra
memory footprint is constant.

## Variables

- `n`: length of `nums`, with `1 <= n <= 1000`.
- `left`: sum of elements before the current index.
- `right`: sum of elements after the current index once the current value has been
  subtracted.

## Top 1% Performance Strategy

- Avoid repeated range summation.
- Avoid auxiliary prefix arrays.
- Use `int` because the constraint maximum is `100000000`.
- Pre-size the answer vector and fill it in place.
- Use a branch-based absolute value in the hot loop.

## Optimization Opportunities

No meaningful non-dominated optimization remains. A single-pass approach cannot know each
right sum before seeing the total, and any solution must write all `n` output entries.
