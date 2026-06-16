// LeetCode 3612 - Process String with Special Operations I
// Recommended solution: materialize the required output directly. The input is
// tiny, and the returned string is mandatory, so a pre-sized std::string buffer
// is both the fastest and leanest representation.

#include <algorithm>
#include <string>
using namespace std;

class Solution {
public:
    string processStr(string s) {
        int currentLength = 0;
        int peakLength = 0;

        for (char c : s) {
            if (c >= 'a' && c <= 'z') {
                ++currentLength;
            } else if (c == '*') {
                if (currentLength > 0) --currentLength;
            } else if (c == '#') {
                currentLength <<= 1;
            }

            if (currentLength > peakLength) peakLength = currentLength;
        }

        string result;
        result.reserve(peakLength);

        for (char c : s) {
            if (c >= 'a' && c <= 'z') {
                result.push_back(c);
            } else if (c == '*') {
                if (!result.empty()) result.pop_back();
            } else if (c == '#') {
                result += result;
            } else {
                reverse(result.begin(), result.end());
            }
        }

        return result;
    }
};
