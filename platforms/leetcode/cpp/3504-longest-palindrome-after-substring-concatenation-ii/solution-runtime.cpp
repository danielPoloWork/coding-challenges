// LeetCode 3504 - Longest Palindrome After Substring Concatenation II
// Speed extreme: Manacher-derived palindromic middles + diagonal cross scan.
//
// The cross scan still touches each s/reverse(t) alignment once. This variant
// removes the quadratic center-expansion preprocessing for the pure middle
// palindromes, which helps most on skewed input sizes.

#include <algorithm>
#include <queue>
#include <string>
#include <utility>
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
        vector<int> odd(n), even(n);
        buildManacher(text, odd, even);

        vector<vector<pair<int, int>>> events(n);
        for (int center = 0; center < n; ++center) {
            const int oddRadius = odd[center];
            events[center - oddRadius + 1].push_back({2 * center + 1, center});

            const int evenRadius = even[center];
            if (evenRadius > 0) {
                events[center - evenRadius].push_back({2 * center, center - 1});
            }
        }

        vector<int> best(n + 1, 0);
        priority_queue<pair<int, int>> active;
        for (int left = 0; left < n; ++left) {
            for (const auto& event : events[left]) {
                active.push(event);
            }
            while (!active.empty() && active.top().second < left) {
                active.pop();
            }
            best[left] = active.top().first - 2 * left;
        }

        return best;
    }

    static void buildManacher(const string& text, vector<int>& odd, vector<int>& even) {
        const int n = static_cast<int>(text.size());

        for (int i = 0, left = 0, right = -1; i < n; ++i) {
            int radius = (i > right) ? 1 : min(odd[left + right - i], right - i + 1);
            while (i - radius >= 0 && i + radius < n &&
                   text[i - radius] == text[i + radius]) {
                ++radius;
            }
            odd[i] = radius;
            if (i + radius - 1 > right) {
                left = i - radius + 1;
                right = i + radius - 1;
            }
        }

        for (int i = 0, left = 0, right = -1; i < n; ++i) {
            int radius = (i > right) ? 0 : min(even[left + right - i + 1], right - i + 1);
            while (i - radius - 1 >= 0 && i + radius < n &&
                   text[i - radius - 1] == text[i + radius]) {
                ++radius;
            }
            even[i] = radius;
            if (i + radius - 1 > right) {
                left = i - radius;
                right = i + radius - 1;
            }
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
