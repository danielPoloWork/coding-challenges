// LeetCode 2161 - Partition Array According to Given Pivot
// Recommended solution and speed extreme: pre-sized output buffer.
//
// Stability is the real constraint. We stream values smaller than pivot from left to
// right, values greater than pivot from right to left into the back of the output, then
// fill the middle with pivot. Writing greater values while scanning backwards preserves
// their original left-to-right order in the final suffix.

#include <vector>
using namespace std;

class Solution {
public:
    vector<int> pivotArray(vector<int>& nums, int pivot) {
        const int n = static_cast<int>(nums.size());
        vector<int> ans(n);

        int left = 0;
        int right = n - 1;

        for (int x : nums) {
            if (x < pivot) {
                ans[left++] = x;
            }
        }

        for (int i = n - 1; i >= 0; --i) {
            if (nums[i] > pivot) {
                ans[right--] = nums[i];
            }
        }

        while (left <= right) {
            ans[left++] = pivot;
        }

        return ans;
    }
};
