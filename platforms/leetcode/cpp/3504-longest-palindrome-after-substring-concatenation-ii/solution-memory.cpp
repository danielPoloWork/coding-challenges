// LeetCode 3504 - Longest Palindrome After Substring Concatenation II
// Memory extreme: fixed-width stack tables and no reversed copy.
//
// The maximum answer length is 2000, so uint16_t is enough for every stored
// palindrome length under the official constraints.

#include <algorithm>
#include <cstdint>
#include <string>
using namespace std;

class Solution {
public:
    int longestPalindrome(string s, string t) {
        const int n = static_cast<int>(s.size());
        const int m = static_cast<int>(t.size());

        uint16_t leftMiddle[MAX_LENGTH + 1] = {};
        uint16_t rightMiddle[MAX_LENGTH] = {};
        fillLongestStarting(s, leftMiddle);
        fillLongestEnding(t, rightMiddle);

        int answer = 0;
        for (int i = 0; i < n; ++i) answer = max(answer, static_cast<int>(leftMiddle[i]));
        for (int j = 0; j < m; ++j) answer = max(answer, static_cast<int>(rightMiddle[j]));

        for (int sum = 0; sum <= n + m - 2; ++sum) {
            const int firstI = max(0, sum - (m - 1));
            const int lastI = min(n - 1, sum);
            int matchedShell = 0;

            for (int i = firstI; i <= lastI; ++i) {
                const int j = sum - i;
                if (s[i] == t[j]) {
                    ++matchedShell;
                    int middle = leftMiddle[i + 1];
                    if (j > 0) {
                        middle = max(middle, static_cast<int>(rightMiddle[j - 1]));
                    }
                    answer = max(answer, matchedShell * 2 + middle);
                } else {
                    matchedShell = 0;
                }
            }
        }

        return answer;
    }

private:
    static constexpr int MAX_LENGTH = 1000;

    static void fillLongestStarting(const string& text, uint16_t best[MAX_LENGTH + 1]) {
        const int n = static_cast<int>(text.size());
        fill(best, best + n + 1, 0);

        for (int center = 0; center < n; ++center) {
            expandStarting(text, center, center, best);
            expandStarting(text, center, center + 1, best);
        }
    }

    static void fillLongestEnding(const string& text, uint16_t best[MAX_LENGTH]) {
        const int n = static_cast<int>(text.size());
        fill(best, best + n, 0);

        for (int center = 0; center < n; ++center) {
            expandEnding(text, center, center, best);
            expandEnding(text, center, center + 1, best);
        }
    }

    static void expandStarting(
        const string& text,
        int left,
        int right,
        uint16_t best[MAX_LENGTH + 1]
    ) {
        const int n = static_cast<int>(text.size());
        while (left >= 0 && right < n && text[left] == text[right]) {
            const int length = right - left + 1;
            if (length > best[left]) best[left] = static_cast<uint16_t>(length);
            --left;
            ++right;
        }
    }

    static void expandEnding(
        const string& text,
        int left,
        int right,
        uint16_t best[MAX_LENGTH]
    ) {
        const int n = static_cast<int>(text.size());
        while (left >= 0 && right < n && text[left] == text[right]) {
            const int length = right - left + 1;
            if (length > best[right]) best[right] = static_cast<uint16_t>(length);
            --left;
            ++right;
        }
    }
};
