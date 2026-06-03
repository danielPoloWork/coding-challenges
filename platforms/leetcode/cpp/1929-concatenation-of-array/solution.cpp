// LeetCode 1929 - Concatenation of Array
// Recommended solution: fast + lean.
//
// This problem is Pareto-optimal: building ans = nums followed by nums is at once the
// recommended, the speed-extreme, AND the memory-extreme answer. The 2n-int output must be
// written in full (an unavoidable Omega(n) lower bound) and no auxiliary structure is needed
// beyond that output, so there is no genuinely different, non-dominated speed or memory
// variant to ship (see notes.md). Hence a single file.
//
// Key insight: "ans[i] == nums[i] and ans[i + n] == nums[i]" is exactly nums concatenated
// with itself. Allocate the result once at its exact final size (reserve(2n) -> a single
// allocation, no growth/reallocation), then bulk-copy nums into it twice. For trivially
// copyable int, vector::insert from contiguous iterators lowers to a memmove, so each half
// is one bulk copy - the optimal way to move contiguous memory. ans and nums are distinct
// vectors, so appending to ans never invalidates the nums iterators being read.

#include <vector>
using namespace std;

class Solution {
public:
    vector<int> getConcatenation(vector<int>& nums) {
        vector<int> ans;
        ans.reserve(nums.size() * 2);                    // one exact-size allocation, no reallocation
        ans.insert(ans.end(), nums.begin(), nums.end()); // first  bulk copy -> ans[0 .. n-1]
        ans.insert(ans.end(), nums.begin(), nums.end()); // second bulk copy -> ans[n .. 2n-1]
        return ans;                                      // NRVO / move: the buffer is not copied out
    }
};
