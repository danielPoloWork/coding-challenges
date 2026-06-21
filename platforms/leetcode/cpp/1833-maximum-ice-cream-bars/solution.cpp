// LeetCode 1833 - Maximum Ice Cream Bars
// Recommended solution: fast + lean counting sort.
//
// The price range is fixed at 1..100000, so a frequency table avoids the
// O(n log n) comparison sort. Buying buckets from the cheapest price upward is
// optimal by the standard exchange argument.

#include <algorithm>
#include <vector>
using namespace std;

class Solution {
public:
    int maxIceCream(vector<int>& costs, int coins) {
        static constexpr int MAX_COST = 100000;
        int freq[MAX_COST + 1] = {};

        for (const int cost : costs) {
            ++freq[cost];
        }

        int bought = 0;
        for (int price = 1; price <= MAX_COST && coins >= price; ++price) {
            const int count = freq[price];
            if (count == 0) continue;

            const int take = min(count, coins / price);
            bought += take;
            coins -= take * price;

            if (take < count) break;
        }

        return bought;
    }
};
