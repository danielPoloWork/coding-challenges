/* LeetCode 912 - Sort an Array
 * Memory-extreme solution: minimum footprint, at the cost of some runtime.
 *
 * In-place heapsort: build a max-heap over the array, then repeatedly swap the max to
 * the end and shrink the heap. It runs in O(n log n) with O(1) extra space - no
 * auxiliary array and (thanks to an iterative sift-down) no recursion stack either.
 *
 * C is chosen over C++ because its runtime/stdlib baseline is the smallest of the
 * allowed languages, which minimizes the reported peak memory. Unlike counting sort
 * (solution-runtime.cpp) this makes no assumption about the value range, and unlike
 * std::sort (solution.cpp) it guarantees O(n log n) worst case with zero extra space.
 */

#include <stdlib.h>

/* Restore the max-heap property for the subtree rooted at `lo`, within bounds [0, hi]. */
static void sift_down(int *a, int lo, int hi) {
    int root = lo;
    for (;;) {
        int child = 2 * root + 1;
        if (child > hi) break;                                   /* no children */
        if (child + 1 <= hi && a[child] < a[child + 1]) ++child; /* pick larger child */
        if (a[root] >= a[child]) break;                          /* heap holds */
        int t = a[root]; a[root] = a[child]; a[child] = t;       /* swap down */
        root = child;
    }
}

int *sortArray(int *nums, int numsSize, int *returnSize) {
    *returnSize = numsSize;

    /* Build the max-heap bottom-up. */
    for (int i = numsSize / 2 - 1; i >= 0; --i) sift_down(nums, i, numsSize - 1);

    /* Move the current max to the end, then re-heap the shrunken prefix. */
    for (int end = numsSize - 1; end > 0; --end) {
        int t = nums[0]; nums[0] = nums[end]; nums[end] = t;
        sift_down(nums, 0, end - 1);
    }
    return nums;
}
