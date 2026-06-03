# Notes - LeetCode 912: Sort an Array (C++ proposals)

## Problem Summary

Sort an integer array `nums` in ascending order and return it.

## Proposals in This Folder (C++)

This folder holds the **C++** proposals. The minimum-memory champion (in-place heapsort)
is implemented in C - see [See Also](#see-also).

- **Recommended (`solution.cpp`) - fast + lean:** `std::sort` (introsort). Near-optimal
  speed on any input, O(log n) stack, no range assumption. The canonical answer.
- **Speed extreme (`solution-runtime.cpp`):** counting sort. Comparison-free, O(n + R)
  linear time by exploiting the bounded value range, at O(R) memory.

## Language Choice (C++)

Native, no GC or interpreter startup. `std::sort` is introsort with an inlined comparator
(fast and robust); the counting-sort loop compiles to a tight, comparison-free linear scan.

## Constraints

- `1 <= nums.length <= 5e4`
- `-5e4 <= nums[i] <= 5e4`

The bounded value range (`R = 100001`) is what unlocks counting sort's linear time.

## Why These Two

- Introsort (recommended) is the robust balance: fast in practice, only O(log n) memory,
  and no assumption about the data.
- Counting sort (speed) beats the O(n log n) comparison bound because the range is small;
  the price is an O(R) count array.

## Top 1% Performance Strategy

- Recommended: rely on the standard library's tuned introsort with an inlined comparator.
- Speed: comparison-free counting sort, single tally pass + single emit pass, contiguous
  count array for cache locality.

## Edge Cases

- `n = 1` returned as-is; all equal; already-sorted / reverse-sorted (introsort avoids
  the quicksort worst case); range extremes `-50000`/`50000` map exactly under the offset.

## See Also

Minimum-memory champion (C, in-place heapsort, O(n log n) time, O(1) extra space):
`../../c/0912-sort-an-array/solution-memory.c`.
