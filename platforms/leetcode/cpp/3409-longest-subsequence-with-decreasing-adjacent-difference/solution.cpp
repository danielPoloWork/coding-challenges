#include <vector>

using namespace std;

class Solution {
public:
    int longestSubsequence(vector<int>& nums) {
        constexpr int kMaxValue = 300;
        constexpr int kMaxDiff = kMaxValue - 1;

        unsigned short best[kMaxValue + 1][kMaxDiff + 2] = {};
        int answer = 1;

        for (const int x : nums) {
            unsigned short* row = best[x];

            for (int d = 0; d <= kMaxDiff; ++d) {
                unsigned short previous = 0;
                bool reachableDiff = false;

                const int lower = x - d;
                if (lower >= 1) {
                    previous = best[lower][d];
                    reachableDiff = true;
                }

                const int upper = x + d;
                if (d != 0 && upper <= kMaxValue) {
                    if (best[upper][d] > previous) {
                        previous = best[upper][d];
                    }
                    reachableDiff = true;
                }

                if (reachableDiff) {
                    const int candidate = static_cast<int>(previous) + 1;
                    if (candidate > row[d]) {
                        row[d] = static_cast<unsigned short>(candidate);
                        if (candidate > answer) {
                            answer = candidate;
                        }
                    }
                }
            }

            for (int d = kMaxDiff - 1; d >= 0; --d) {
                if (row[d + 1] > row[d]) {
                    row[d] = row[d + 1];
                }
            }
        }

        return answer;
    }
};
