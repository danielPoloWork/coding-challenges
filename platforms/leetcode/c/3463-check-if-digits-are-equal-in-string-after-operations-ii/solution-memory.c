/* LeetCode 3463 - Check If Digits Are Equal in String After Operations II
 * Memory-extreme solution: Lucas theorem modulo 2 and 5, then CRT modulo 10.
 *
 * The final two digits are binomial transforms of adjacent input digits. This C
 * variant avoids dynamic allocation completely: each C(row, k) is computed from
 * its residues modulo 2 and modulo 5, then reconstructed modulo 10.
 */

#include <stdbool.h>
#include <string.h>

static int binom_mod5(int row, int choose) {
    static const int comb5[5][5] = {
        {1, 0, 0, 0, 0},
        {1, 1, 0, 0, 0},
        {1, 2, 1, 0, 0},
        {1, 3, 3, 1, 0},
        {1, 4, 1, 4, 1}
    };

    int result = 1;
    while (row > 0 || choose > 0) {
        const int row_digit = row % 5;
        const int choose_digit = choose % 5;
        if (choose_digit > row_digit) return 0;
        result = (result * comb5[row_digit][choose_digit]) % 5;
        row /= 5;
        choose /= 5;
    }
    return result;
}

static int binom_mod10(int row, int choose) {
    const int mod2 = (((unsigned int)choose & ~(unsigned int)row) == 0);
    const int mod5 = binom_mod5(row, choose);
    int value = mod5;

    if ((value & 1) != mod2) value += 5;
    return value;
}

bool hasSameDigits(char* s) {
    const int n = (int)strlen(s);
    const int row = n - 2;
    int difference = 0;

    for (int k = 0; k <= row; ++k) {
        difference += binom_mod10(row, k) * (s[k] - s[k + 1]);
    }

    return difference % 10 == 0;
}
