# Notes - LeetCode 217: Contains Duplicate (C++ proposals)

## Problem Summary

Given an integer array `nums`, return `true` if any value appears at least twice, and
`false` if every element is distinct.

## Proposals in This Folder (C++)

This folder holds the **C++** proposals. The minimum-memory champion is implemented in C
- see [See Also](#see-also).

- **Recommended (`solution.cpp`) - fast + lean:** in-place `std::sort` + adjacent scan.
  Near-optimal speed at O(1) extra memory; the canonical answer.
- **Speed extreme (`solution-runtime.cpp`):** flat open-addressing hash set with early
  exit. O(n) average time, O(n) memory.

## Language Choice (C++)

Native, no GC or interpreter startup. For the recommended proposal, `std::sort` inlines
its comparator and runs introsort (markedly faster than C's `qsort`, which calls through
a function pointer). For the speed extreme, a flat contiguous hash table is far more
cache-friendly than `std::unordered_set` and avoids per-node allocation.

## Constraints

- `1 <= nums.length <= 1e5`
- `-1e9 <= nums[i] <= 1e9`

The wide value range (~2e9) rules out a counting array / bitset, leaving hashing (speed)
or sorting (lean) as the viable strategies.

## Why These Two

- Sorting (recommended) is Pareto-best in practice here: O(1) extra memory and, at
  n <= 1e5, a practical runtime tie with hashing.
- Hashing (speed extreme) wins decisively when a duplicate appears early (early exit), or
  at much larger n where O(n) separates from O(n log n).

## Top 1% Performance Strategy

- Recommended: in-place introsort, inlined comparator, single adjacency scan.
- Speed: contiguous flat table, Murmur3-style finalizer, load factor <= 0.5, early exit.

## Edge Cases

- `n < 2` -> false; all equal -> hash exits on the 2nd element; all distinct -> full work;
  negatives and `INT` extremes handled (unsigned hash cast; sorting is value-safe).

## See Also

Minimum-memory champion (C, in-place `qsort`, O(n log n) time, O(1) extra space):
`../../c/0217-contains-duplicate/solution-memory.c`.
