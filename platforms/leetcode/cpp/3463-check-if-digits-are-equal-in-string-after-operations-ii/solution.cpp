// LeetCode 3463 - Check If Digits Are Equal in String After Operations II
// Recommended solution: stream binomial coefficients modulo 10 in O(n) time.
//
// After n - 2 operations, the two remaining digits are weighted by row n - 2
// of Pascal's triangle. We compare their difference directly:
// sum C(n - 2, k) * (s[k] - s[k + 1]) mod 10.
//
// Division is not generally valid modulo 10, so the coefficient recurrence keeps
// the powers of 2 and 5 separately and stores only the remaining unit part modulo
// 10, where inverses always exist.

#include <string>
using namespace std;

class Solution {
public:
    bool hasSameDigits(string s) {
        const int n = static_cast<int>(s.size());
        const int row = n - 2;
        const char* digits = s.data();

        int unit = 1;   // coefficient with every factor 2 and 5 removed, modulo 10
        int twos = 0;
        int fives = 0;
        int difference = 0;

        for (int k = 0; k <= row; ++k) {
            difference += coefficientMod10(unit, twos, fives) * (digits[k] - digits[k + 1]);

            if (k == row) break;
            applyFactor(row - k, 1, unit, twos, fives);
            applyFactor(k + 1, -1, unit, twos, fives);
        }

        return difference % 10 == 0;
    }

private:
    static inline int coefficientMod10(int unit, int twos, int fives) {
        if (twos > 0 && fives > 0) return 0;

        int value = unit;
        if (twos > 0) {
            static constexpr int pow2Cycle[4] = {2, 4, 8, 6};
            value = (value * pow2Cycle[(twos - 1) & 3]) % 10;
        }
        if (fives > 0) {
            value = (value * 5) % 10;
        }
        return value;
    }

    static inline void applyFactor(int value, int sign, int& unit, int& twos, int& fives) {
        while ((value & 1) == 0) {
            twos += sign;
            value >>= 1;
        }
        while (value % 5 == 0) {
            fives += sign;
            value /= 5;
        }

        static constexpr int inverseMod10[10] = {0, 1, 0, 7, 0, 0, 0, 3, 0, 9};
        const int residue = value % 10;
        if (sign > 0) {
            unit = (unit * residue) % 10;
        } else {
            unit = (unit * inverseMod10[residue]) % 10;
        }
    }
};
