// LeetCode 3463 - Check If Digits Are Equal in String After Operations II
// Runtime-extreme solution: precompute factor data for all recurrence operands.
//
// The math is the same as solution.cpp, but every number from 1 to n - 2 is
// stripped of its 2/5 factors once. The coefficient loop then uses array lookups
// instead of factoring the same operands as both numerator and denominator.

#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    bool hasSameDigits(string s) {
        const int n = static_cast<int>(s.size());
        const int row = n - 2;
        const char* digits = s.data();

        vector<unsigned char> count2(row + 1), count5(row + 1), unitPart(row + 1), inversePart(row + 1);
        for (int value = 1; value <= row; ++value) {
            fillFactorEntry(value, count2, count5, unitPart, inversePart);
        }

        int unit = 1;
        int twos = 0;
        int fives = 0;
        int difference = 0;

        for (int k = 0; k <= row; ++k) {
            difference += coefficientMod10(unit, twos, fives) * (digits[k] - digits[k + 1]);

            if (k == row) break;
            const int numerator = row - k;
            const int denominator = k + 1;

            twos += static_cast<int>(count2[numerator]) - static_cast<int>(count2[denominator]);
            fives += static_cast<int>(count5[numerator]) - static_cast<int>(count5[denominator]);
            unit = (unit * static_cast<int>(unitPart[numerator])) % 10;
            unit = (unit * static_cast<int>(inversePart[denominator])) % 10;
        }

        return difference % 10 == 0;
    }

private:
    static inline void fillFactorEntry(int original,
                                       vector<unsigned char>& count2,
                                       vector<unsigned char>& count5,
                                       vector<unsigned char>& unitPart,
                                       vector<unsigned char>& inversePart) {
        int value = original;
        unsigned char twos = 0;
        unsigned char fives = 0;

        while ((value & 1) == 0) {
            ++twos;
            value >>= 1;
        }
        while (value % 5 == 0) {
            ++fives;
            value /= 5;
        }

        static constexpr unsigned char inverseMod10[10] = {0, 1, 0, 7, 0, 0, 0, 3, 0, 9};
        const unsigned char residue = static_cast<unsigned char>(value % 10);
        count2[original] = twos;
        count5[original] = fives;
        unitPart[original] = residue;
        inversePart[original] = inverseMod10[residue];
    }

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
};
