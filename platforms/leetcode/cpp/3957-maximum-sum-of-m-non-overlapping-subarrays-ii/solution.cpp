#include <bits/stdc++.h>
using namespace std;

class Solution {
    struct State {
        long long value;
        int count;
    };

    static bool better(const State& a, const State& b) {
        return a.value > b.value || (a.value == b.value && a.count > b.count);
    }

    static bool keyBetterOrEqual(
        int a,
        int b,
        const vector<long long>& dp,
        const vector<int>& cnt,
        const vector<long long>& pref
    ) {
        const long long ka = dp[a] - pref[a];
        const long long kb = dp[b] - pref[b];
        return ka > kb || (ka == kb && cnt[a] >= cnt[b]);
    }

    static State evaluatePenalty(
        const vector<long long>& pref,
        int l,
        int r,
        long long penalty
    ) {
        const int n = static_cast<int>(pref.size()) - 1;
        vector<long long> dp(n + 1, 0);
        vector<int> cnt(n + 1, 0);
        deque<int> candidates;

        for (int i = 1; i <= n; ++i) {
            const int expiredBefore = i - r;
            while (!candidates.empty() && candidates.front() < expiredBefore) {
                candidates.pop_front();
            }

            const int add = i - l;
            if (add >= 0) {
                while (!candidates.empty() &&
                       keyBetterOrEqual(add, candidates.back(), dp, cnt, pref)) {
                    candidates.pop_back();
                }
                candidates.push_back(add);
            }

            dp[i] = dp[i - 1];
            cnt[i] = cnt[i - 1];

            if (!candidates.empty()) {
                const int start = candidates.front();
                const State take{
                    dp[start] - pref[start] + pref[i] - penalty,
                    cnt[start] + 1
                };
                const State skip{dp[i], cnt[i]};
                if (better(take, skip)) {
                    dp[i] = take.value;
                    cnt[i] = take.count;
                }
            }
        }

        return {dp[n], cnt[n]};
    }

    static long long bestSingleSubarray(const vector<long long>& pref, int l, int r) {
        const int n = static_cast<int>(pref.size()) - 1;
        deque<int> candidates;
        long long best = LLONG_MIN / 4;

        for (int i = 1; i <= n; ++i) {
            const int expiredBefore = i - r;
            while (!candidates.empty() && candidates.front() < expiredBefore) {
                candidates.pop_front();
            }

            const int add = i - l;
            if (add >= 0) {
                while (!candidates.empty() && pref[add] <= pref[candidates.back()]) {
                    candidates.pop_back();
                }
                candidates.push_back(add);
            }

            if (!candidates.empty()) {
                best = max(best, pref[i] - pref[candidates.front()]);
            }
        }

        return best;
    }

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

        const long long bestOne = bestSingleSubarray(pref, l, r);
        const State withoutPenalty = evaluatePenalty(pref, l, r, 0);

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
            if (evaluatePenalty(pref, l, r, mid).count >= m) {
                low = mid;
            } else {
                high = mid - 1;
            }
        }

        const State adjusted = evaluatePenalty(pref, l, r, low);
        return adjusted.value + low * static_cast<long long>(m);
    }
};
