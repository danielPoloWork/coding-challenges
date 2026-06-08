// LeetCode 3854 - Minimum Operations to Make Array Parity Alternating
// Recommended solution: evaluate the two alternating parity patterns and, for
// each minimum-operation pattern, shrink only the values that can affect the
// final range endpoints.

#include <array>
#include <climits>
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> makeParityAlternating(vector<int>& nums) {
        const int n = static_cast<int>(nums.size());
        if (n == 1) return {0, 0};

        int mn = nums[0];
        int mx = nums[0];
        for (int x : nums) {
            if (x < mn) mn = x;
            if (x > mx) mx = x;
        }

        auto evaluate = [&](int evenIndexParity) -> array<int, 2> {
            int operations = 0;
            int low = INT_MAX;
            int high = INT_MIN;

            for (int i = 0; i < n; ++i) {
                int value = nums[i];
                int adjusted = value;
                const int expectedParity = evenIndexParity ^ (i & 1);

                if ((value & 1) != expectedParity) {
                    ++operations;
                    if (value == mn) {
                        ++adjusted;
                    } else if (value == mx) {
                        --adjusted;
                    }
                }

                if (adjusted < low) low = adjusted;
                if (adjusted > high) high = adjusted;
            }

            int spread = high - low;
            if (spread == 0) spread = 1;
            return {operations, spread};
        };

        const array<int, 2> evenFirst = evaluate(0);
        const array<int, 2> oddFirst = evaluate(1);

        if (evenFirst[0] < oddFirst[0] ||
            (evenFirst[0] == oddFirst[0] && evenFirst[1] <= oddFirst[1])) {
            return {evenFirst[0], evenFirst[1]};
        }
        return {oddFirst[0], oddFirst[1]};
    }
};
