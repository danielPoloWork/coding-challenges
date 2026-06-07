# Complexity - LeetCode 3957: Maximum Sum of M Non-Overlapping Subarrays II (C++ proposals)

Let:

- `n` be `nums.length`.
- `A = 1 + sum(abs(nums[i]))`, the integer search range for the WQS penalty.
- `w = r - l + 1`, the number of allowed lengths in the active deque window.

## Recommended - `solution.cpp` (WQS DP + standard deque)

### Time Complexity

```text
O(n log A)
```

One fixed-penalty evaluation scans the array once. The binary search performs
`O(log A)` evaluations, with `A <= 10^10 + 1`.

### Space Complexity

```text
O(n)
```

The solution stores prefix sums, DP values, DP counts, and a monotone deque.

## Speed Extreme - `solution-runtime.cpp`

### Time Complexity

```text
O(n log A)
```

The asymptotic work matches the recommended solution, but it uses preallocated flat arrays
and index-based queues to avoid `std::deque` block overhead in the hot path.

### Space Complexity

```text
O(n)
```

It stores the same logical data as the recommended solution in contiguous arrays.

## Memory Extreme - `solution-memory.cpp`

### Time Complexity

```text
O(n log A)
```

It still performs one linear deque-optimized DP per penalty value.

### Space Complexity

```text
O(l + w) = O(r)
```

The memory proposal stores only the `l`-step delay buffer needed before a prefix can enter
the transition window, plus the active monotone deque of size at most `w`. In the worst
case `r = n`, this is still `O(n)`, but it is strictly smaller when the allowed maximum
length is much less than the input size.

## Top 1% Performance Strategy

- Replace the direct `O(nm)` DP with WQS/alien binary search over a per-subarray penalty.
- Optimize each fixed-penalty DP transition with a monotone deque over starts
  `j in [i - r, i - l]`.
- Use integer penalties and 64-bit sums; the answer can reach `1e10`.
- Tie adjusted values toward larger selected counts so the count is monotone across
  penalty changes and the binary search can recover the exact `m` boundary.
- Return the zero-penalty unconstrained optimum immediately when it already uses at most
  `m` subarrays.

## Optimization Notes

The direct exact-count DP with a deque per layer costs `O(nm)` time, which is infeasible
for `n, m <= 1e5`. The WQS formulation reduces the resource dimension to a logarithmic
search over penalties. Further asymptotic improvement is unlikely under the hinted
approach because each penalty evaluation must inspect all `n` endpoints at least once.
