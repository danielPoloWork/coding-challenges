# Notes - LeetCode 912: Sort an Array (C proposal)

## Problem Summary

Sort an integer array `nums` in ascending order and return it.

## Proposal in This Folder (C)

This folder holds the **minimum-memory** champion. The recommended and speed proposals
are in C++ - see [See Also](#see-also).

- **Memory extreme (`solution-memory.c`):** in-place heapsort. O(n log n) time, O(1) extra
  space (no auxiliary array; an iterative sift-down avoids the recursion stack too).

## Language Choice (C)

C has the smallest runtime/stdlib baseline among the allowed languages, which minimizes
the reported peak memory. Manual control gives a truly in-place, allocation-free heapsort.
Unlike counting sort it assumes nothing about the value range; unlike `std::sort` it
guarantees O(n log n) worst case with zero extra space.

## Constraints

- `1 <= nums.length <= 5e4`
- `-5e4 <= nums[i] <= 5e4`

## Why This Approach

Heapsort sorts in place with O(1) extra space; merge sort would need O(n) scratch. The
iterative sift-down avoids even the recursion stack, so the footprint is truly minimal.

## Edge Cases

- `n = 1` returned as-is; all equal; already-sorted / reverse-sorted unaffected;
  negatives handled.

## See Also

Recommended (introsort) and speed (counting sort) proposals are in C++:
`../../cpp/0912-sort-an-array/` (`solution.cpp`, `solution-runtime.cpp`).
