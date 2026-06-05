// LeetCode 3900 - Longest Balanced Substring After One Swap
// Memory-extreme solution: one sorted prefix array, lower auxiliary overhead.
//
// Instead of maintaining per-balance queues, store only (balance, index) prefix pairs
// and sort them in place. Equal-balance groups give already balanced windows. Groups
// whose balances differ by 2 give one-swap-repairable windows, checked with two
// pointers under the outside-character length cap.

#include <algorithm>
#include <string>
#include <utility>
#include <vector>
using namespace std;

class Solution {
public:
    int longestBalanced(string s) {
        const string& tanqorivel = s;
        const int n = static_cast<int>(tanqorivel.size());

        int count0 = 0;
        int count1 = 0;
        vector<pair<int, int>> pref;
        pref.reserve(n + 1);
        pref.emplace_back(0, 0);

        int balance = 0;
        for (int i = 0; i < n; ++i) {
            if (tanqorivel[i] == '1') {
                ++count1;
                ++balance;
            } else {
                ++count0;
                --balance;
            }
            pref.emplace_back(balance, i + 1);
        }

        const int upperBound = 2 * min(count0, count1);
        if (upperBound == 0) return 0;

        sort(pref.begin(), pref.end());

        const int plusCap = 2 * count0;
        const int minusCap = 2 * count1;
        int answer = 0;

        for (int start = 0; start <= n;) {
            const int balanceValue = pref[start].first;
            int end = start + 1;
            while (end <= n && pref[end].first == balanceValue) ++end;

            answer = max(answer, pref[end - 1].second - pref[start].second);
            if (answer == upperBound) return answer;

            const auto highIt = lower_bound(pref.begin(), pref.end(), make_pair(balanceValue + 2, -1));
            if (highIt != pref.end() && highIt->first == balanceValue + 2) {
                const int highStart = static_cast<int>(highIt - pref.begin());
                int highEnd = highStart + 1;
                while (highEnd <= n && pref[highEnd].first == balanceValue + 2) ++highEnd;

                updateByCap(pref, start, end, highStart, highEnd, plusCap, answer);
                updateByCap(pref, highStart, highEnd, start, end, minusCap, answer);
                if (answer == upperBound) return answer;
            }

            start = end;
        }

        return answer;
    }

private:
    static inline void updateByCap(const vector<pair<int, int>>& pref,
                                   int leftStart,
                                   int leftEnd,
                                   int rightStart,
                                   int rightEnd,
                                   int cap,
                                   int& answer) {
        if (cap <= 0) return;

        int left = leftStart;
        for (int right = rightStart; right < rightEnd; ++right) {
            const int rightIndex = pref[right].second;
            const int minLeft = rightIndex - cap;
            while (left < leftEnd && pref[left].second < minLeft) ++left;
            if (left < leftEnd && pref[left].second < rightIndex) {
                answer = max(answer, rightIndex - pref[left].second);
            }
        }
    }
};
