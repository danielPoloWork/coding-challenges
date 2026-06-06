# Notes - LeetCode 2574: Left and Right Sum Differences (C++ proposal)

## Problem Summary

Given an array `nums`, return an array where position `i` contains the absolute difference
between the sum of all elements before `i` and the sum of all elements after `i`.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless the same implementation is best on all
meaningful axes. For this problem the optimized running-sum solution is the recommended,
speed-extreme, and memory-extreme solution:

- **Recommended (`solution.cpp`) - fast + lean:** compute the total once, then scan from
  left to right while maintaining `left` and the remaining `right` sum. `O(n)` time,
  `O(1)` auxiliary space beyond the required returned array.
- **Speed extreme:** *coincides with the recommended.* Any correct solution must produce
  all `n` answers, so `Omega(n)` time is unavoidable. This implementation reaches that
  lower bound with two tight linear passes and no extra prefix arrays.
- **Memory extreme:** *coincides with the recommended.* The returned array is required by
  the problem. Apart from it, the algorithm stores only two integer accumulators and a
  loop index.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.*`.

## Language Choice (C++)

C++ is the strongest fit for this problem's performance profile on LeetCode: the work is
small, contiguous, and arithmetic-only. Native execution avoids interpreter and GC overhead,
`vector<int>` gives direct contiguous storage for the input and output, and the method
signature maps cleanly to the judge without manual C allocation boilerplate. The maximum
sum is `1000 * 100000 = 100000000`, so `int` arithmetic is safe and faster than unnecessary
64-bit promotion.

## Constraints

- `1 <= nums.length <= 1000`.
- `1 <= nums[i] <= 100000`.
- Total sum and every answer fit in signed 32-bit integer range.
- The output array must have exactly `n` elements.

## Key Observations

1. If `total` is known, the right sum at index `i` is the remaining total after subtracting
   `nums[i]`.
2. The left sum can be updated after answering index `i` by adding `nums[i]`.
3. Storing full `leftSum` and `rightSum` arrays repeats information already captured by two
   running integers.
4. Since every output position must be written, linear time is optimal.

## Reasoning Process

The direct hint-based approach builds or recomputes the sums around each index. Recomputing
both sides for every `i` costs `O(n^2)`, which is unnecessary even for the small constraint.
Building two prefix arrays improves runtime to `O(n)` but uses extra memory.

The useful invariant is:

```text
before processing i:
left  = sum(nums[0..i-1])
right = sum(nums[i..n-1])
```

After subtracting `nums[i]` from `right`, it becomes `sum(nums[i+1..n-1])`, so
`abs(left - right)` is exactly the required answer. Then `nums[i]` is added to `left` for
the next iteration.

## Final Approach

1. Sum every value into `right`.
2. Allocate the required `answer` vector of size `n`.
3. Initialize `left = 0`.
4. For each index `i`:
   - subtract `nums[i]` from `right`;
   - write `abs(left - right)` into `answer[i]`;
   - add `nums[i]` to `left`.
5. Return `answer`.

## Why This Approach

It keeps the asymptotic optimum of prefix sums while removing both auxiliary prefix arrays.
The algorithm is also easier to audit than a mutation-based approach: the input remains
unchanged, and the returned vector is the only storage whose contents are transformed into
answers.

## Top 1% Performance Strategy

- Two cache-friendly linear scans over contiguous `vector<int>` storage.
- Pre-sized output vector with direct indexed writes.
- No `leftSum` or `rightSum` arrays.
- Manual absolute value avoids any overload or header ambiguity.
- `int` accumulators are sufficient under the constraints and keep arithmetic compact.

## Edge Cases

- Single element: both left and right sums are zero, so the answer is `[0]`.
- First index: `left` starts at zero.
- Last index: `right` becomes zero after subtracting the last value.
- Maximum values: total sum is at most `100000000`, safely inside `int`.

## Alternatives

- **Nested recomputation:** `O(n^2)` time and no benefit.
- **Two auxiliary arrays:** `O(n)` time but `O(n)` extra memory beyond the required output.
- **Input mutation and move return:** can reduce one allocation in some C++ setups, but it
  changes the caller's input and is less portable as a LeetCode proposal.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
