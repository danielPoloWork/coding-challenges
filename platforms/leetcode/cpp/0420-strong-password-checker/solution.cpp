// LeetCode 420 - Strong Password Checker
// Recommended solution: one linear scan plus greedy deletion scheduling.
//
// Replacements needed for a repeated run of length L are L / 3. If the password is
// too long, mandatory deletions should be spent where they reduce that replacement
// count soonest: first runs with L % 3 == 0, then L % 3 == 1, then every remaining
// group of three deletions.

#include <algorithm>
#include <string>
using namespace std;

class Solution {
public:
    int strongPasswordChecker(string password) {
        const int n = static_cast<int>(password.size());

        bool hasLower = false;
        bool hasUpper = false;
        bool hasDigit = false;
        for (char ch : password) {
            hasLower = hasLower || ('a' <= ch && ch <= 'z');
            hasUpper = hasUpper || ('A' <= ch && ch <= 'Z');
            hasDigit = hasDigit || ('0' <= ch && ch <= '9');
        }

        const int missingTypes = static_cast<int>(!hasLower) +
                                 static_cast<int>(!hasUpper) +
                                 static_cast<int>(!hasDigit);

        int replacements = 0;
        int oneDeleteRuns = 0;
        int twoDeleteBudget = 0;

        for (int i = 0; i < n;) {
            int j = i + 1;
            while (j < n && password[j] == password[i]) ++j;

            const int len = j - i;
            if (len >= 3) {
                replacements += len / 3;
                if (len % 3 == 0) {
                    ++oneDeleteRuns;
                } else if (len % 3 == 1) {
                    twoDeleteBudget += 2;
                }
            }

            i = j;
        }

        if (n < 6) {
            return max(missingTypes, 6 - n);
        }
        if (n <= 20) {
            return max(missingTypes, replacements);
        }

        const int deletions = n - 20;
        int remainingDeletes = deletions;

        int used = min(remainingDeletes, oneDeleteRuns);
        replacements -= used;
        remainingDeletes -= used;

        used = min(remainingDeletes, twoDeleteBudget);
        replacements -= used / 2;
        remainingDeletes -= used;

        replacements -= remainingDeletes / 3;

        return deletions + max(missingTypes, replacements);
    }
};
