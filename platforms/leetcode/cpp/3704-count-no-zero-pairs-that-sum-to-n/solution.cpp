// LeetCode 3704 - Count No-Zero Pairs That Sum to N
// Recommended solution: fast + lean.
//
// Scan n from the least significant digit so the carry moves in the natural
// direction. For each addend, "alive" means its current and lower digits are
// still part of the number and therefore must be 1..9. Choosing digit 0 at a
// higher position ends that number; every remaining higher digit must stay 0 as
// leading padding. The first position cannot end, which keeps both integers
// positive and prevents trailing zeroes.

class Solution {
public:
    long long countNoZeroPairs(long long n) {
        int digits[20];
        int len = 0;
        while (n > 0) {
            digits[len++] = static_cast<int>(n % 10);
            n /= 10;
        }
        digits[len++] = 0;  // One extra column forces both numbers to end.

        long long dp[2][2][2] = {};
        dp[0][1][1] = 1;

        for (int pos = 0; pos < len; ++pos) {
            long long next[2][2][2] = {};
            const int target = digits[pos];

            for (int carry = 0; carry <= 1; ++carry) {
                for (int aliveA = 0; aliveA <= 1; ++aliveA) {
                    for (int aliveB = 0; aliveB <= 1; ++aliveB) {
                        const long long ways = dp[carry][aliveA][aliveB];
                        if (ways == 0) continue;

                        for (int da = 0; da <= 9; ++da) {
                            const int nextAliveA = nextAlive(aliveA, da, pos);
                            if (nextAliveA < 0) continue;

                            for (int db = 0; db <= 9; ++db) {
                                const int nextAliveB = nextAlive(aliveB, db, pos);
                                if (nextAliveB < 0) continue;

                                const int sum = da + db + carry;
                                if (sum % 10 != target) continue;

                                next[sum / 10][nextAliveA][nextAliveB] += ways;
                            }
                        }
                    }
                }
            }

            for (int carry = 0; carry <= 1; ++carry) {
                for (int aliveA = 0; aliveA <= 1; ++aliveA) {
                    for (int aliveB = 0; aliveB <= 1; ++aliveB) {
                        dp[carry][aliveA][aliveB] = next[carry][aliveA][aliveB];
                    }
                }
            }
        }

        return dp[0][0][0];
    }

private:
    static int nextAlive(int alive, int digit, int pos) {
        if (alive == 0) return digit == 0 ? 0 : -1;
        if (digit == 0) return pos == 0 ? -1 : 0;
        return 1;
    }
};
