// LeetCode 3699 - Number of ZigZag Arrays I
// Memory extreme: in-place mirrored rank DP.
//
// The recurrence is the same as the C++ proposal, but the reversed-prefix
// transform is performed inside one buffer by saving old mirrored cells into
// positions that have already been consumed.

#define MOD 1000000007
#define MAX_M 2000

int zigZagArrays(int n, int l, int r) {
    const int m = r - l + 1;
    if (n == 1) return m;
    if (m < 2) return 0;
    if (m == 2) return 2;

    int dp[MAX_M];
    for (int y = 0; y < m; ++y) dp[y] = y;

    for (int len = 3; len <= n; ++len) {
        int run = 0;
        dp[0] = 0;

        for (int y = 1; y < m; ++y) {
            const int mirror = m - y;
            int add;

            if (y < mirror) {
                const int saved = dp[y];
                add = dp[mirror];
                dp[mirror] = saved;
            } else {
                add = dp[y];
            }

            run += add;
            if (run >= MOD) run -= MOD;
            dp[y] = run;
        }
    }

    int oneDirection = 0;
    for (int y = 0; y < m; ++y) {
        oneDirection += dp[y];
        if (oneDirection >= MOD) oneDirection -= MOD;
    }

    return (int)((2LL * oneDirection) % MOD);
}
