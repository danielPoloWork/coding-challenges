// LeetCode 912 - Sort an Array
// Recommended solution: runtime-first, memory-lean (balanced default).
//
// std::sort is introsort (quicksort + heapsort fallback + insertion sort for small
// ranges) with an inlined comparator. It is fast in practice on any input, needs only
// O(log n) stack, and makes no assumption about the value range. That combination -
// near-optimal speed at tiny extra memory, robust to all inputs - is the best general
// balance, so it is the canonical answer.
//
// For the raw-speed extreme that exploits the bounded value range, see
// solution-runtime.cpp (counting sort). For the absolute-minimum-memory extreme, see
// solution-memory.c (in-place heapsort).

#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<int> sortArray(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        return nums;
    }
};
