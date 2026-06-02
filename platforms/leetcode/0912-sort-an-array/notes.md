# Notes - LeetCode 912: Sort an Array

## Problem Summary

Sort an integer array `nums` in ascending order and return it, without relying on a
language built-in as the "point" of the exercise.

## Three Proposals

This problem is a clean case where the three proposals are **genuinely distinct** - each
a different algorithm that wins a different axis:

- **Recommended (`solution.cpp`) - fast + lean:** `std::sort` (introsort). Near-optimal
  speed on any input at O(log n) extra memory; robust and simple. The best general balance.
- **Speed extreme (`solution-runtime.cpp`):** counting sort. Comparison-free, **O(n + R)**
  linear time - the fastest - by exploiting the bounded value range, at O(R) memory.
- **Memory extreme (`solution-memory.c`):** in-place heapsort. **O(1)** extra space (no
  auxiliary array, iterative sift-down so no recursion stack), at O(n log n) time.

Trade-off: counting sort buys linear time with ~400 KB of fixed memory; heapsort buys
zero extra memory with a log factor of time; introsort sits in between and is the
default. None dominates the others on both axes, so all three are kept.

## Language Choice (per proposal)

- **Recommended -> C++.** `std::sort` is introsort with an inlined comparator: fast in
  practice, only O(log n) stack, and no assumption about the data. Native, no GC/startup.
- **Speed -> C++.** A tight counting-sort loop compiles to optimal native code; the
  bounded range makes the comparison-free linear scan the raw-speed winner.
- **Memory -> C.** Smallest runtime/stdlib baseline among the allowed languages, which
  minimizes reported peak memory; manual control gives a truly in-place, allocation-free
  heapsort.

## Constraints

- `1 <= nums.length <= 5 * 10^4`
- `-5 * 10^4 <= nums[i] <= 5 * 10^4`

The decisive detail is the **bounded value range** (`R = 100001`). Because `R` is the
same order of magnitude as `n`, counting sort's `O(n + R)` is effectively linear here -
this is what unlocks the speed extreme. A problem with an unbounded range would not allow
it, and the recommended/memory proposals (which assume nothing about the range) would
remain.

## Key Observations

1. Sorting has an `O(n log n)` lower bound for comparison-based methods, but counting sort
   is not comparison-based, so the bounded range lets us beat that bound on raw speed.
2. Minimum memory and maximum speed pull in opposite directions: the linear-time method
   needs an `O(R)` table, while the zero-extra-memory method pays the log factor.
3. A robust, simple middle (introsort) is the right default when neither extreme is
   specifically demanded.

## Reasoning Process

1. The naive comparison sort is `O(n log n)`; that is already fine for `n <= 5 * 10^4`.
2. To go faster we must drop comparisons - possible only because the value range is
   bounded - giving counting sort at `O(n + R)`.
3. To go leaner we must avoid any auxiliary array - giving in-place heapsort at `O(1)`
   extra space, with an iterative sift-down to also avoid the recursion stack.
4. Each axis is then implemented in the language whose runtime profile best serves it.

## Final Approaches

- **Recommended:** `std::sort(nums.begin(), nums.end())`.
- **Speed:** offset values into `[0, 100000]`, tally counts, then write values back in
  order.
- **Memory:** build a max-heap bottom-up, then repeatedly swap the root (max) to the end
  and sift-down over the shrinking prefix.

## Why These Approaches

- **Counting sort vs the rest:** strictly faster (linear, no branches on comparisons) but
  only because the range is small; it is the speed champion, not a general default.
- **Heapsort vs merge sort:** merge sort is also `O(n log n)` but needs `O(n)` scratch
  space; heapsort is `O(1)` extra, so it wins the memory axis.
- **Introsort as default:** avoids quicksort's `O(n^2)` worst case, is cache-friendly,
  and needs only `O(log n)` stack - the best all-round choice when no extreme is required.

## Top 1% Performance Strategy

- Speed: comparison-free counting sort; single tally pass + single emit pass; contiguous
  `count` array for cache locality.
- Memory: in-place heapsort with iterative sift-down (no recursion, no allocation);
  branch-light "pick larger child" step.
- Recommended: rely on the standard library's heavily tuned introsort with an inlined
  comparator.

## Edge Cases

- Single element (`n = 1`) -> returned as-is by all three.
- All equal values -> counting sort emits one bucket; heapsort/introsort handle trivially.
- Already sorted / reverse sorted -> introsort avoids quicksort worst case; heapsort is
  unaffected.
- Negative values and the range extremes (`-50000`, `50000`) -> counting sort's offset
  maps them into `[0, 100000]` exactly.

## Alternatives

- **Merge sort:** `O(n log n)` and stable, but `O(n)` extra space - dominated by heapsort
  on the memory axis and by counting sort on speed here.
- **Radix sort (LSD):** also linear for bounded integers; competitive with counting sort
  but with more passes and a larger constant for this range. Counting sort is simpler and
  at least as fast given `R ~ n`.
- **Quicksort (plain):** risks `O(n^2)`; introsort is the safe form and is what `std::sort`
  already uses.
