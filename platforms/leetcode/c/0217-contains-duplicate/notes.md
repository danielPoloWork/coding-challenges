# Notes - LeetCode 217: Contains Duplicate (C proposal)

## Problem Summary

Given an integer array `nums`, return `true` if any value appears at least twice, and
`false` if every element is distinct.

## Proposal in This Folder (C)

This folder holds the **minimum-memory** champion. The recommended and speed proposals
are in C++ - see [See Also](#see-also).

- **Memory extreme (`solution-memory.c`):** in-place `qsort` + adjacent scan. O(n log n)
  time, O(1) extra space (zero auxiliary allocation).

## Language Choice (C)

C has the smallest runtime/stdlib baseline among the allowed languages, which minimizes
the reported peak memory. Manual control gives a truly in-place, allocation-free sort.
Trade-off: `qsort` calls its comparator through a function pointer, so it is slower than
C++ `std::sort`; that is acceptable for the memory champion.

## Constraints

- `1 <= nums.length <= 1e5`
- `-1e9 <= nums[i] <= 1e9`

The wide value range rules out a counting array / bitset, so sorting in place is the
minimum-memory way to bring equal values adjacent.

## Why This Approach

Sorting in place needs no auxiliary structure - the leanest possible footprint for
duplicate detection here. The comparator `(x > y) - (x < y)` is overflow-safe (it avoids
`x - y` wrap-around for values near +/-1e9).

## Edge Cases

- `n < 2` -> false; all equal / all distinct handled; negatives and `INT` extremes are
  safe thanks to the overflow-safe comparator.

## See Also

Recommended (fast + lean, `std::sort`) and speed-extreme (flat hash set) proposals are in
C++: `../../cpp/0217-contains-duplicate/` (`solution.cpp`, `solution-runtime.cpp`).
