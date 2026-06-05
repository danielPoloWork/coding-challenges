// LeetCode 3743 - Maximize Cyclic Partition Score
// Recommended solution: fast + lean.
//
// A partition segment contributes max - min, so it can be represented by one
// +max pick and one -min pick. While scanning the cyclic order, keep only the
// currently unmatched extreme:
//   state 0: no open extreme
//   state 1: an open minimum was picked (-value), waiting for a maximum
//   state 2: an open maximum was picked (+value), waiting for a minimum
//
// Starting and ending in the same state accounts for the one segment that may
// wrap around the array boundary. The DP counts completed non-zero segments,
// so at most k completed pairs are allowed.

#include <array>
#include <algorithm>
#include <vector>
using namespace std;

class Solution {
public:
    long long maximumScore(vector<int>& nums, int k) {
        static constexpr long long NEG = -(1LL << 60);

        vector<array<long long, 9>> dp(k + 1);
        for (auto& row : dp) row.fill(NEG);

        for (int start = 0; start < 3; ++start) {
            dp[0][start * 3 + start] = 0;
        }

        for (int value : nums) {
            const long long x = value;

            for (int closed = k; closed >= 0; --closed) {
                auto& row = dp[closed];

                for (int start = 0; start < 3; ++start) {
                    const int base = start * 3;
                    const long long balanced = row[base];
                    const long long openMin = row[base + 1];
                    const long long openMax = row[base + 2];

                    if (closed < k) {
                        if (openMin != NEG) {
                            dp[closed + 1][base] = max(dp[closed + 1][base], openMin + x);
                        }
                        if (openMax != NEG) {
                            dp[closed + 1][base] = max(dp[closed + 1][base], openMax - x);
                        }
                    }

                    if (balanced != NEG) {
                        row[base + 1] = max(row[base + 1], balanced - x);
                        row[base + 2] = max(row[base + 2], balanced + x);
                    }
                }
            }
        }

        long long answer = 0;
        for (int closed = 0; closed <= k; ++closed) {
            answer = max(answer, dp[closed][0]);
            answer = max(answer, dp[closed][4]);
            answer = max(answer, dp[closed][8]);
        }
        return answer;
    }
};
