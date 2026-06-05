// LeetCode 3900 - Longest Balanced Substring After One Swap
// Runtime-extreme solution: intrusive per-balance queues in flat arrays.
//
// This is the same prefix-balance characterization as solution.cpp, but tuned for
// wall-clock time: no vector-of-vector buckets, no binary searches, and no hash table.
// Each prefix index is linked into two flat queue families, one for the +2 repair cap
// and one for the -2 repair cap. Stale starts are discarded lazily and at most once.

#include <algorithm>
#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    int longestBalanced(string s) {
        const string& tanqorivel = s;
        const int n = static_cast<int>(tanqorivel.size());

        int count0 = 0;
        int count1 = 0;
        for (char c : tanqorivel) {
            if (c == '1') ++count1;
            else ++count0;
        }

        const int upperBound = 2 * min(count0, count1);
        if (upperBound == 0) return 0;

        const int offset = n + 2;
        const int bucketCount = 2 * n + 5;
        const int inf = n + 1;
        vector<int> first(bucketCount, inf);

        vector<int> plusHead(bucketCount, -1), plusTail(bucketCount, -1), plusNext(n + 1, -1);
        vector<int> minusHead(bucketCount, -1), minusTail(bucketCount, -1), minusNext(n + 1, -1);

        const int plusCap = 2 * count0;
        const int minusCap = 2 * count1;
        int answer = 0;
        int balance = 0;

        for (int right = 0; right <= n; ++right) {
            if (right > 0) {
                balance += (tanqorivel[right - 1] == '1') ? 1 : -1;
            }

            const int key = balance + offset;
            if (first[key] == inf) first[key] = right;
            pushIndex(plusHead, plusTail, plusNext, key, right);
            pushIndex(minusHead, minusTail, minusNext, key, right);

            answer = max(answer, right - first[key]);

            const int plusKey = balance - 2 + offset;
            if (0 <= plusKey && plusKey < bucketCount) {
                const int left = earliestLive(plusHead, plusTail, plusNext, plusKey, right - plusCap);
                if (left != -1 && left < right) answer = max(answer, right - left);
            }

            const int minusKey = balance + 2 + offset;
            if (0 <= minusKey && minusKey < bucketCount) {
                const int left = earliestLive(minusHead, minusTail, minusNext, minusKey, right - minusCap);
                if (left != -1 && left < right) answer = max(answer, right - left);
            }

            if (answer == upperBound) return answer;
        }

        return answer;
    }

private:
    static inline void pushIndex(vector<int>& head,
                                 vector<int>& tail,
                                 vector<int>& next,
                                 int key,
                                 int index) {
        if (tail[key] == -1) {
            head[key] = index;
        } else {
            next[tail[key]] = index;
        }
        tail[key] = index;
    }

    static inline int earliestLive(vector<int>& head,
                                   vector<int>& tail,
                                   const vector<int>& next,
                                   int key,
                                   int minIndex) {
        int h = head[key];
        while (h != -1 && h < minIndex) h = next[h];
        head[key] = h;
        if (h == -1) tail[key] = -1;
        return h;
    }
};
