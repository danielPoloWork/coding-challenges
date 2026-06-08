// LeetCode 2161 - Partition Array According to Given Pivot
// Memory-extreme solution: stable in-place partition by recursive rotations.
//
// The fast solution uses a result buffer. This version minimizes auxiliary memory by
// reordering nums itself: first move all values < pivot to the front, then move all
// values == pivot to the front of the remaining suffix. Each stable partition is done
// with divide-and-conquer plus rotate, using only recursion stack storage.

#include <algorithm>
#include <utility>
#include <vector>
using namespace std;

class Solution {
    template <class Predicate>
    int stablePartitionInPlace(vector<int>& nums, int lo, int hi, Predicate keepLeft) {
        const int len = hi - lo;
        if (len == 0) {
            return lo;
        }
        if (len == 1) {
            return lo + (keepLeft(nums[lo]) ? 1 : 0);
        }

        const int mid = lo + len / 2;
        const int leftFalse = stablePartitionInPlace(nums, lo, mid, keepLeft);
        const int rightFalse = stablePartitionInPlace(nums, mid, hi, keepLeft);

        rotate(nums.begin() + leftFalse, nums.begin() + mid, nums.begin() + rightFalse);
        return leftFalse + (rightFalse - mid);
    }

public:
    vector<int> pivotArray(vector<int>& nums, int pivot) {
        const int n = static_cast<int>(nums.size());
        const int geBegin = stablePartitionInPlace(
            nums, 0, n, [pivot](int x) { return x < pivot; }
        );
        stablePartitionInPlace(
            nums, geBegin, n, [pivot](int x) { return x == pivot; }
        );

        return std::move(nums);
    }
};
