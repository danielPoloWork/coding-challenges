#include <bits/stdc++.h>
using namespace std;

class Solution {
    struct State {
        long long value;
        int count;
    };

public:
    long long maximumSum(vector<int>& nums, int m, int l, int r) {
        const vector<int>& fentoluric = nums;
        const int n = static_cast<int>(fentoluric.size());

        vector<long long> pref(n + 1, 0);
        long long bound = 1;
        for (int i = 0; i < n; ++i) {
            pref[i + 1] = pref[i] + fentoluric[i];
            bound += llabs(static_cast<long long>(fentoluric[i]));
        }

        vector<long long> dp(n + 1, 0);
        vector<int> cnt(n + 1, 0);
        vector<int> q(n + 1, 0);

        auto eval = [&](long long penalty) -> State {
            int head = 0;
            int tail = 0;
            dp[0] = 0;
            cnt[0] = 0;

            for (int i = 1; i <= n; ++i) {
                const int expiredBefore = i - r;
                while (head < tail && q[head] < expiredBefore) {
                    ++head;
                }

                const int add = i - l;
                if (add >= 0) {
                    const long long addKey = dp[add] - pref[add];
                    const int addCount = cnt[add];
                    while (head < tail) {
                        const int back = q[tail - 1];
                        const long long backKey = dp[back] - pref[back];
                        if (addKey > backKey || (addKey == backKey && addCount >= cnt[back])) {
                            --tail;
                        } else {
                            break;
                        }
                    }
                    q[tail++] = add;
                }

                long long bestValue = dp[i - 1];
                int bestCount = cnt[i - 1];
                if (head < tail) {
                    const int start = q[head];
                    const long long takeValue = dp[start] - pref[start] + pref[i] - penalty;
                    const int takeCount = cnt[start] + 1;
                    if (takeValue > bestValue ||
                        (takeValue == bestValue && takeCount > bestCount)) {
                        bestValue = takeValue;
                        bestCount = takeCount;
                    }
                }
                dp[i] = bestValue;
                cnt[i] = bestCount;
            }

            return {dp[n], cnt[n]};
        };

        auto bestOne = [&]() -> long long {
            int head = 0;
            int tail = 0;
            long long best = LLONG_MIN / 4;
            for (int i = 1; i <= n; ++i) {
                const int expiredBefore = i - r;
                while (head < tail && q[head] < expiredBefore) {
                    ++head;
                }

                const int add = i - l;
                if (add >= 0) {
                    while (head < tail && pref[add] <= pref[q[tail - 1]]) {
                        --tail;
                    }
                    q[tail++] = add;
                }

                if (head < tail) {
                    best = max(best, pref[i] - pref[q[head]]);
                }
            }
            return best;
        }();

        const State withoutPenalty = eval(0);
        if (withoutPenalty.value == 0) {
            return bestOne;
        }
        if (withoutPenalty.count <= m) {
            return withoutPenalty.value;
        }

        long long low = -bound;
        long long high = bound;
        while (low < high) {
            const long long mid = low + (high - low + 1) / 2;
            if (eval(mid).count >= m) {
                low = mid;
            } else {
                high = mid - 1;
            }
        }

        const State adjusted = eval(low);
        return adjusted.value + low * static_cast<long long>(m);
    }
};
