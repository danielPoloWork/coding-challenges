// LeetCode 3699 - Number of ZigZag Arrays I
// Recommended and fastest-runtime solution: mirrored rank DP.
//
// Once adjacent values are forced to differ, every valid array has comparison
// signs that alternate. Store only the count of sequences whose last move was
// upward; downward counts are the mirror image by value-rank symmetry.

#include <algorithm>
using namespace std;

class Solution {
    static constexpr int MOD = 1000000007;
    static constexpr int MAX_M = 2000;

public:
    int zigZagArrays(int n, int l, int r) {
        const int m = r - l + 1;
        if (n == 1) return m;
        if (m < 2) return 0;
        if (m == 2) return 2;

        int a[MAX_M], b[MAX_M];
        int* cur = a;
        int* nxt = b;

        for (int y = 0; y < m; ++y) cur[y] = y;

        for (int len = 3; len <= n; ++len) {
            int run = 0;
            nxt[0] = 0;
            for (int y = 1; y < m; ++y) {
                run += cur[m - y];
                if (run >= MOD) run -= MOD;
                nxt[y] = run;
            }
            swap(cur, nxt);
        }

        int oneDirection = 0;
        for (int y = 0; y < m; ++y) {
            oneDirection += cur[y];
            if (oneDirection >= MOD) oneDirection -= MOD;
        }

        return static_cast<int>((2LL * oneDirection) % MOD);
    }
};
