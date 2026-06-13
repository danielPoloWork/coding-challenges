// LeetCode 3751 - Total Waviness of Numbers in Range I
// Recommended solution: compressed prefix digit DP.
//
// Range I permits brute force, but a tiny digit DP gives stable top-tier runtime
// for every interval size while using only fixed stack/class storage. A digit at
// the previous position becomes a wave exactly when the adjacent comparison sign
// flips from + to - or from - to +.

#include <cstring>
#include <string>
using namespace std;

class Solution {
    struct Node {
        int waves;
        int count;
    };

public:
    int totalWaviness(int num1, int num2) {
        return prefix(num2) - prefix(num1 - 1);
    }

private:
    string digits_;
    Node memo_[7][3][10][3];
    bool seen_[7][3][10][3];

    int prefix(int n) {
        if (n < 100) return 0;

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
