// LeetCode 3303 - Find the Occurrence of First Almost Equal Substring
// Recommended solution: two Z-function passes for prefix/suffix agreement.
//
// A window is valid when the exact prefix match plus the exact suffix match
// covers at least m - 1 positions; the only uncovered position, if any, is the
// one character we may change.

#include <algorithm>
#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    int minStartingIndex(string s, string pattern) {
        const int n = static_cast<int>(s.size());
        const int m = static_cast<int>(pattern.size());
        const int windows = n - m + 1;
        const int base = m + 1;

        vector<int> left(windows);
        vector<int> z;
        string joined;
        joined.reserve(n + m + 1);

        buildJoined(pattern, s, joined);
        buildZ(joined, z);
        for (int i = 0; i < windows; ++i) {
            left[i] = min(z[base + i], m);
        }

        reverse(pattern.begin(), pattern.end());
        reverse(s.begin(), s.end());
        buildJoined(pattern, s, joined);
        buildZ(joined, z);

        const int need = m - 1;
        for (int i = 0; i < windows; ++i) {
            const int reversedStart = n - m - i;
            const int right = min(z[base + reversedStart], m);
            if (left[i] + right >= need) return i;
        }

        return -1;
    }

private:
    static void buildJoined(const string& pattern, const string& s, string& joined) {
        joined.clear();
        joined.append(pattern);
        joined.push_back('{'); // one past 'z', so it cannot appear in either input
        joined.append(s);
    }

    static void buildZ(const string& text, vector<int>& z) {
        const int len = static_cast<int>(text.size());
        z.assign(len, 0);

        for (int i = 1, left = 0, right = 0; i < len; ++i) {
            if (i <= right) {
                z[i] = min(right - i + 1, z[i - left]);
            }
            while (i + z[i] < len && text[z[i]] == text[i + z[i]]) {
                ++z[i];
            }
            if (i + z[i] - 1 > right) {
                left = i;
                right = i + z[i] - 1;
            }
        }
    }
};
