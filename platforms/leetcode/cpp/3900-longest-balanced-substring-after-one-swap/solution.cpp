// LeetCode 3900 - Longest Balanced Substring After One Swap
// Recommended solution: linear prefix scan with compact per-balance position lists.
//
// A selected substring is already usable when its balance (#1 - #0) is 0. One swap
// can only change the selected substring's balance by 2, because exactly one character
// crosses the substring boundary. Therefore the only repairable balances are +2 and
// -2, with one required opposite character still outside the substring.
//
// We store prefix-balance positions in contiguous buckets over the fixed range
// [-n, n]. For +2/-2 windows, monotone pointers skip starts that are too far left to
// leave the needed outside character. This keeps the whole pass O(n).

#include <algorithm>
#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    int longestBalanced(string s) {
        const string& tanqorivel = s;
        const int n = static_cast<int>(tanqorivel.size());
        const int offset = n + 2;
        const int bucketCount = 2 * n + 5;

        int count0 = 0;
        int count1 = 0;
        vector<int> prefix(n + 1, 0);
        vector<vector<int>> positions(bucketCount);
        positions[offset].push_back(0);

        for (int i = 0; i < n; ++i) {
            if (tanqorivel[i] == '1') {
                ++count1;
                prefix[i + 1] = prefix[i] + 1;
            } else {
                ++count0;
                prefix[i + 1] = prefix[i] - 1;
            }
            positions[prefix[i + 1] + offset].push_back(i + 1);
        }

        const int upperBound = 2 * min(count0, count1);
        if (upperBound == 0) return 0;

        vector<int> plusPtr(bucketCount, 0);
        vector<int> minusPtr(bucketCount, 0);
        const int plusCap = 2 * count0;   // balance +2 needs a zero outside
        const int minusCap = 2 * count1;  // balance -2 needs a one outside
        int answer = 0;

        auto useFixableWindow = [&](int key, int right, int cap, vector<int>& ptr) {
            if (key < 0 || key >= bucketCount) return;
            vector<int>& bucket = positions[key];
            int& p = ptr[key];
            const int minLeft = right - cap;
            while (p < static_cast<int>(bucket.size()) && bucket[p] < minLeft) ++p;
            if (p < static_cast<int>(bucket.size()) && bucket[p] < right) {
                answer = max(answer, right - bucket[p]);
            }
        };

        for (int right = 0; right <= n; ++right) {
            const int balance = prefix[right];

            const vector<int>& same = positions[balance + offset];
            answer = max(answer, right - same.front());

            useFixableWindow(balance - 2 + offset, right, plusCap, plusPtr);
            useFixableWindow(balance + 2 + offset, right, minusCap, minusPtr);

            if (answer == upperBound) return answer;
        }

        return answer;
    }
};
