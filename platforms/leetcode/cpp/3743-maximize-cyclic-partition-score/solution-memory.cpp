// LeetCode 3743 - Maximize Cyclic Partition Score
// Memory-oriented variant.
//
// Runs the three possible cyclic start states one at a time. This keeps only
// 3 DP states per completed-pair count instead of 9, trading three scans of
// nums for a smaller auxiliary footprint.

#include <array>
#include <algorithm>
#include <vector>
using namespace std;

class Solution {
public:
    long long maximumScore(vector<int>& nums, int k) {
        long long answer = 0;
        for (int start = 0; start < 3; ++start) {
            answer = max(answer, solveStart(nums, k, start));
        }
        return answer;
    }

private:
    static constexpr long long NEG = -(1LL << 60);

    static long long solveStart(const vector<int>& nums, int k, int start) {
        vector<array<long long, 3>> dp(k + 1);
        for (auto& row : dp) row.fill(NEG);
        dp[0][start] = 0;

        for (int value : nums) {
            const long long x = value;

            for (int closed = k; closed >= 0; --closed) {
                auto& row = dp[closed];

                const long long balanced = row[0];
                const long long openMin = row[1];
                const long long openMax = row[2];

                if (closed < k) {
                    if (openMin != NEG) {
                        dp[closed + 1][0] = max(dp[closed + 1][0], openMin + x);
                    }
                    if (openMax != NEG) {
                        dp[closed + 1][0] = max(dp[closed + 1][0], openMax - x);
                    }
                }

                if (balanced != NEG) {
                    row[1] = max(row[1], balanced - x);
                    row[2] = max(row[2], balanced + x);
                }
            }
        }

        long long best = 0;
        for (int closed = 0; closed <= k; ++closed) {
            best = max(best, dp[closed][start]);
        }
        return best;
    }
};
