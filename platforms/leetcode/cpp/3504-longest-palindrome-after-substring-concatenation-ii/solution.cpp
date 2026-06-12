// LeetCode 3504 - Longest Palindrome After Substring Concatenation II
// Recommended solution: center-expanded palindromic middles + diagonal cross scan.
//
// A cross-string palindrome has some mirrored shell taken from s and t, then
// one remaining middle palindrome that lies entirely in s or entirely in t.

#include <algorithm>
#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    int longestPalindrome(string s, string t) {
        const int n = static_cast<int>(s.size());
        const int m = static_cast<int>(t.size());

        string reversedT(t.rbegin(), t.rend());
        vector<int> leftMiddle = longestPalindromeStarting(s);
        vector<int> rightMiddle = longestPalindromeStarting(reversedT);

        int answer = 0;
        for (int length : leftMiddle) answer = max(answer, length);
        for (int length : rightMiddle) answer = max(answer, length);

        for (int start = 0; start < n; ++start) {
            scanDiagonal(s, reversedT, leftMiddle, rightMiddle, start, 0, answer);
        }
        for (int start = 1; start < m; ++start) {
            scanDiagonal(s, reversedT, leftMiddle, rightMiddle, 0, start, answer);
        }

        return answer;
    }

private:
    static vector<int> longestPalindromeStarting(const string& text) {
        const int n = static_cast<int>(text.size());
        vector<int> best(n + 1, 0);

        for (int center = 0; center < n; ++center) {
            expand(text, center, center, best);
            expand(text, center, center + 1, best);
        }

        return best;
    }

    static void expand(const string& text, int left, int right, vector<int>& best) {
        const int n = static_cast<int>(text.size());
        while (left >= 0 && right < n && text[left] == text[right]) {
            best[left] = max(best[left], right - left + 1);
            --left;
            ++right;
        }
    }

    static void scanDiagonal(
        const string& s,
        const string& reversedT,
        const vector<int>& leftMiddle,
        const vector<int>& rightMiddle,
        int i,
        int j,
        int& answer
    ) {
        const int n = static_cast<int>(s.size());
        const int m = static_cast<int>(reversedT.size());
        int matchedShell = 0;

        while (i < n && j < m) {
            if (s[i] == reversedT[j]) {
                ++matchedShell;
                const int middle = max(leftMiddle[i + 1], rightMiddle[j + 1]);
                answer = max(answer, matchedShell * 2 + middle);
            } else {
                matchedShell = 0;
            }
            ++i;
            ++j;
        }
    }
};
