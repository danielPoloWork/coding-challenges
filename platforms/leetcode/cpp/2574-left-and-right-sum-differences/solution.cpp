// LeetCode 2574 - Left and Right Sum Differences
// Recommended solution: one total sum plus one running left sum.
//
// rightSum(i) can be maintained as the remaining total after subtracting
// nums[i]. This avoids building separate leftSum/rightSum arrays while keeping
// the required answer vector as the only output allocation.

#include <vector>
using namespace std;

class Solution {
public:
    vector<int> leftRightDifference(vector<int>& nums) {
        const int n = static_cast<int>(nums.size());
        int right = 0;
        for (int value : nums) right += value;

        vector<int> answer(n);
        int left = 0;

        for (int i = 0; i < n; ++i) {
            right -= nums[i];
            int diff = left - right;
            if (diff < 0) diff = -diff;
            answer[i] = diff;
            left += nums[i];
        }

        return answer;
    }
};
