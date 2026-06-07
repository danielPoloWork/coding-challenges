// LeetCode 3303 - Find the Occurrence of First Almost Equal Substring
// Runtime-extreme solution: Extended KMP (direct LCP arrays).
//
// This keeps the same O(n + m) bound as the Z solution, but avoids materializing
// pattern + delimiter + text and compares the two original strings directly.

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

        vector<int> patternZ = buildPatternZ(pattern);
        vector<int> prefix = buildExtend(s, pattern, patternZ);

        reverse(s.begin(), s.end());
        reverse(pattern.begin(), pattern.end());
        patternZ = buildPatternZ(pattern);
        vector<int> suffix = buildExtend(s, pattern, patternZ);

        const int need = m - 1;
        for (int i = 0; i < windows; ++i) {
            const int reversedStart = n - m - i;
            if (prefix[i] + suffix[reversedStart] >= need) return i;
        }

        return -1;
    }

private:
    static vector<int> buildPatternZ(const string& pattern) {
        const int m = static_cast<int>(pattern.size());
        vector<int> z(m, 0);
        z[0] = m;

        for (int i = 1, left = 0, right = 0; i < m; ++i) {
            if (i <= right) {
                z[i] = min(right - i + 1, z[i - left]);
            }
            while (i + z[i] < m && pattern[z[i]] == pattern[i + z[i]]) {
                ++z[i];
            }
            if (i + z[i] - 1 > right) {
                left = i;
                right = i + z[i] - 1;
            }
        }

        return z;
    }

    static vector<int> buildExtend(const string& text, const string& pattern, const vector<int>& patternZ) {
        const int n = static_cast<int>(text.size());
        const int m = static_cast<int>(pattern.size());
        vector<int> extend(n, 0);

        for (int i = 0, left = 0, right = -1; i < n; ++i) {
            if (i <= right) {
                extend[i] = min(right - i + 1, patternZ[i - left]);
            }
            while (extend[i] < m && i + extend[i] < n && pattern[extend[i]] == text[i + extend[i]]) {
                ++extend[i];
            }
            if (i + extend[i] - 1 > right) {
                left = i;
                right = i + extend[i] - 1;
            }
        }

        return extend;
    }
};
