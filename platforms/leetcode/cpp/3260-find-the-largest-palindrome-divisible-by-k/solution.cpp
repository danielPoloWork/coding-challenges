// LeetCode 3260 - Find the Largest Palindrome Divisible by K
// Recommended solution: fast + lean.
//
// k is only 1..9, so the largest palindrome can be built directly from
// divisibility rules. Keep as many outer digits equal to 9 as possible, because
// those positions dominate the numeric order. Only the forced edge or central
// digits are lowered.

#include <string>
using namespace std;

class Solution {
public:
    string largestPalindrome(int n, int k) {
        switch (k) {
            case 1:
            case 3:
            case 9:
                return string(n, '9');
            case 2:
                return withEdges(n, 1, '8');
            case 4:
                return n <= 4 ? string(n, '8') : withEdges(n, 2, '8');
            case 5:
                return withEdges(n, 1, '5');
            case 6:
                return largestDivisibleBySix(n);
            case 7:
                return largestDivisibleBySeven(n);
            default:  // k == 8.
                return n <= 6 ? string(n, '8') : withEdges(n, 3, '8');
        }
    }

private:
    static string withEdges(int n, int count, char digit) {
        string ans(n, '9');
        for (int i = 0; i < count; ++i) {
            ans[i] = digit;
            ans[n - 1 - i] = digit;
        }
        return ans;
    }

    static string largestDivisibleBySix(int n) {
        if (n == 1) return "6";
        if (n == 2) return "66";

        string ans(n, '9');
        ans[0] = ans[n - 1] = '8';

        if (n & 1) {
            ans[n / 2] = '8';
        } else {
            ans[n / 2 - 1] = ans[n / 2] = '7';
        }
        return ans;
    }

    static string largestDivisibleBySeven(int n) {
        string ans(n, '9');

        switch (n % 12) {
            case 1:
                writeCenter(ans, "7", 1);
                break;
            case 2:
                writeCenter(ans, "77", 2);
                break;
            case 3:
                writeCenter(ans, "959", 3);
                break;
            case 4:
                writeCenter(ans, "9779", 4);
                break;
            case 5:
                writeCenter(ans, "99799", 5);
                break;
            case 7:
                writeCenter(ans, "9994999", 7);
                break;
            case 8:
                writeCenter(ans, "99944999", 8);
                break;
            case 9:
                writeCenter(ans, "999969999", 9);
                break;
            case 10:
                writeCenter(ans, "9999449999", 10);
                break;
            case 11:
                writeCenter(ans, "99999499999", 11);
                break;
            default:
                break;  // n % 12 is 0 or 6, so all 9s already works.
        }

        return ans;
    }

    static void writeCenter(string& ans, const char* block, int len) {
        const int start = (static_cast<int>(ans.size()) - len) / 2;
        for (int i = 0; i < len; ++i) {
            ans[start + i] = block[i];
        }
    }
};
