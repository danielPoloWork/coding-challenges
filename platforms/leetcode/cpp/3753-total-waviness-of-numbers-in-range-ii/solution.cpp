// LeetCode 3753 - Total Waviness of Numbers in Range II
// Recommended solution: fast + lean.
//
// The answer for [num1, num2] is prefix(num2) - prefix(num1 - 1), where prefix(n)
// is the total waviness of all positive integers <= n. A digit becomes a peak or
// valley exactly when the comparison direction changes across it:
//     previous digit pair: prevPrev -> prev
//     current digit pair : prev -> current
// A non-zero sign flip (+ to - or - to +) contributes one wave for every completion
// of the remaining suffix.
//
// The DP state is deliberately smaller than the hinted "last two digits":
// position, count of meaningful digits seen so far capped at 2, previous digit,
// and the last comparison sign (-1, 0, +1). Leading zeroes are skipped, so shorter
// numbers are represented once and never form artificial waves with padding zeroes.

#include <cstring>
#include <string>
using namespace std;

class Solution {
    struct Node {
        long long waves;
        long long count;
    };

public:
    long long totalWaviness(long long num1, long long num2) {
        return prefix(num2) - prefix(num1 - 1);
    }

private:
    string digits_;
    Node memo_[20][3][10][3];
    bool seen_[20][3][10][3];

    long long prefix(long long n) {
        if (n <= 100) return 0;

        digits_ = to_string(n);
        memset(seen_, 0, sizeof(seen_));
        return dfs(0, 0, 0, 1, true).waves;
    }

    Node dfs(int pos, int used, int prev, int cmpIndex, bool tight) {
        if (pos == static_cast<int>(digits_.size())) return {0, 1};

        if (!tight && seen_[pos][used][prev][cmpIndex]) {
            return memo_[pos][used][prev][cmpIndex];
        }

        const int limit = tight ? digits_[pos] - '0' : 9;
        Node ans{0, 0};

        for (int d = 0; d <= limit; ++d) {
            const bool nextTight = tight && d == limit;

            if (used == 0 && d == 0) {
                const Node child = dfs(pos + 1, 0, 0, 1, nextTight);
                ans.waves += child.waves;
                ans.count += child.count;
                continue;
            }

            if (used == 0) {
                const Node child = dfs(pos + 1, 1, d, 1, nextTight);
                ans.waves += child.waves;
                ans.count += child.count;
                continue;
            }

            const int lastCmp = cmpIndex - 1;
            const int currCmp = (d > prev) - (d < prev);
            const int addWave = (used == 2 && lastCmp != 0 && currCmp == -lastCmp) ? 1 : 0;

            const Node child = dfs(pos + 1, 2, d, currCmp + 1, nextTight);
            ans.waves += child.waves + child.count * addWave;
            ans.count += child.count;
        }

        if (!tight) {
            seen_[pos][used][prev][cmpIndex] = true;
            memo_[pos][used][prev][cmpIndex] = ans;
        }

        return ans;
    }
};
