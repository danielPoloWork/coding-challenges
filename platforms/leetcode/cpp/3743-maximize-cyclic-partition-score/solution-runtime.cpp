// LeetCode 3743 - Maximize Cyclic Partition Score
// Runtime-optimized variant.
//
// Same DP as solution.cpp, but stored in fixed stack arrays and manually
// unrolled across the three cyclic start states. This removes vector<array>
// iteration overhead and keeps the hot loop branch-light.

#include <algorithm>
#include <vector>
using namespace std;

class Solution {
public:
    long long maximumScore(vector<int>& nums, int k) {
        static constexpr long long NEG = -(1LL << 60);

        long long dp[1001][9];
        for (int j = 0; j <= k; ++j) {
            for (int s = 0; s < 9; ++s) dp[j][s] = NEG;
        }

        dp[0][0] = 0;  // start in balanced state
        dp[0][4] = 0;  // start with an open minimum
        dp[0][8] = 0;  // start with an open maximum

        for (int value : nums) {
            const long long x = value;

            for (int j = k; j >= 0; --j) {
                long long* row = dp[j];

                const long long s00 = row[0], s01 = row[1], s02 = row[2];
                const long long s10 = row[3], s11 = row[4], s12 = row[5];
                const long long s20 = row[6], s21 = row[7], s22 = row[8];

                if (j < k) {
                    long long* next = dp[j + 1];

                    if (s01 != NEG) next[0] = max(next[0], s01 + x);
                    if (s02 != NEG) next[0] = max(next[0], s02 - x);

                    if (s11 != NEG) next[3] = max(next[3], s11 + x);
                    if (s12 != NEG) next[3] = max(next[3], s12 - x);

                    if (s21 != NEG) next[6] = max(next[6], s21 + x);
                    if (s22 != NEG) next[6] = max(next[6], s22 - x);
                }

                if (s00 != NEG) {
                    row[1] = max(row[1], s00 - x);
                    row[2] = max(row[2], s00 + x);
                }
                if (s10 != NEG) {
                    row[4] = max(row[4], s10 - x);
                    row[5] = max(row[5], s10 + x);
                }
                if (s20 != NEG) {
                    row[7] = max(row[7], s20 - x);
                    row[8] = max(row[8], s20 + x);
                }
            }
        }

        long long answer = 0;
        for (int j = 0; j <= k; ++j) {
            answer = max(answer, dp[j][0]);
            answer = max(answer, dp[j][4]);
            answer = max(answer, dp[j][8]);
        }
        return answer;
    }
};
