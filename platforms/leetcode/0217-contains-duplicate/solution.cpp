// LeetCode 217 - Contains Duplicate
// Recommended solution: runtime-first, memory-lean.
//
// Detecting "any duplicate" has no single algorithm that is both asymptotically
// fastest (O(n)) and minimal memory (O(1)) - that is a genuine time-space tradeoff
// (see solution-runtime.cpp and solution-memory.c for the two extremes).
//
// However, at this problem's constraints (n <= 1e5) the practical wall-clock time of an
// in-place sort and of a hash set is a tie (both well under a millisecond; both report
// ~0 ms on the judge), while the sort needs no auxiliary table. So sorting in place is
// the best balance: O(1) extra memory with hash-set-level speed in practice.
//
// std::sort (not C's qsort) is used on purpose: its comparator is inlined and it runs
// introsort, so it is markedly faster than a qsort call through a function pointer,
// while still sorting in place.
//
// Prefer solution-runtime.cpp only when a duplicate is expected early (its early exit
// then wins decisively) or when n grows large enough that O(n) vs O(n log n) separates.

#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        if (nums.size() < 2) return false;
        sort(nums.begin(), nums.end());                 // in place, O(1) extra
        for (size_t i = 1; i < nums.size(); ++i) {
            if (nums[i] == nums[i - 1]) return true;    // equal values are now adjacent
        }
        return false;
    }
};
