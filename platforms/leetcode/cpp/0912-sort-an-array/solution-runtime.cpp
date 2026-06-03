// LeetCode 912 - Sort an Array
// Speed-extreme solution: fastest wall-clock, at the cost of extra memory.
//
// The constraints bound every value to [-50000, 50000], a fixed range of 100001 slots.
// That unlocks counting sort: count occurrences, then emit values in order. It is
// comparison-free and runs in O(n + R) - linear in the input - which beats any
// O(n log n) comparison sort on raw speed.
//
// The price is O(R) memory for the count array (~400 KB here), independent of n. That is
// why this is the speed extreme rather than the recommended default: when memory matters
// more than the last bit of speed, prefer solution.cpp or solution-memory.c.

#include <vector>
using namespace std;

class Solution {
public:
    vector<int> sortArray(vector<int>& nums) {
        const int OFFSET = 50000;          // map [-50000, 50000] -> [0, 100000]
        const int RANGE  = 100001;
        vector<int> count(RANGE, 0);
        for (int x : nums) ++count[x + OFFSET];

        int i = 0;
        for (int v = 0; v < RANGE; ++v) {
            for (int c = count[v]; c > 0; --c) nums[i++] = v - OFFSET;
        }
        return nums;
    }
};
