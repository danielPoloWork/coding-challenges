/* LeetCode 217 - Contains Duplicate
 * Memory-optimized variant (smallest footprint).
 *
 * Strategy: sort the input array in place, then scan for an adjacent equal pair.
 * No auxiliary data structure is allocated, so the only extra memory is qsort's
 * O(log n) recursion stack - effectively O(1). C is chosen over C++ here because
 * its runtime/stdlib baseline is the smallest of the allowed languages, which
 * minimizes the reported peak memory on the judge.
 *
 * Trades speed (an O(n log n) sort) for memory. See solution-runtime.cpp for the
 * fast variant.
 *
 * Note: this mutates the caller's array, which is acceptable for this problem
 * because only the boolean result is observed.
 */

#include <stdlib.h>
#include <stdbool.h>

static int cmp_int(const void *a, const void *b) {
    const int x = *(const int *)a;
    const int y = *(const int *)b;
    return (x > y) - (x < y);   /* overflow-safe: avoids x - y wrap-around near +/-1e9 */
}

bool containsDuplicate(int *nums, int numsSize) {
    if (numsSize < 2) return false;
    qsort(nums, (size_t)numsSize, sizeof(int), cmp_int);
    for (int i = 1; i < numsSize; ++i) {
        if (nums[i] == nums[i - 1]) return true;
    }
    return false;
}
