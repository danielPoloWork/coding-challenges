// LeetCode 3614 - Process String with Special Operations II
// Recommended solution: compute only the final length, then walk the program
// backwards and remap k through the inverse operations until it lands on a
// real appended letter.

#include <string>
using namespace std;

class Solution {
public:
    char processStr(string s, long long k) {
        long long len = 0;

        for (char c : s) {
            if (c >= 'a' && c <= 'z') {
                ++len;
            } else if (c == '*') {
                if (len > 0) --len;
            } else if (c == '#') {
                len <<= 1;
            }
        }

        if (k >= len) return '.';

        for (int i = static_cast<int>(s.size()) - 1; i >= 0; --i) {
            const char c = s[i];

            if (c >= 'a' && c <= 'z') {
                if (k == len - 1) return c;
                --len;
            } else if (c == '#') {
                len >>= 1;
                k %= len;
            } else if (c == '%') {
                k = len - 1 - k;
            } else {
                ++len;
            }
        }

        return '.';
    }
};
