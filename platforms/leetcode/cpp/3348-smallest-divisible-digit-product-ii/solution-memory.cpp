// LeetCode 3348 - Smallest Divisible Digit Product II
// Memory extreme: same greedy search, but no feasibility table.
//
// The only non-trivial minimum-length question is how many digits are needed to cover
// the remaining 2/3 exponents. Trying 0..5 uses of digit 6 is sufficient because adding
// six more 6s always costs one more digit than the equivalent 8/9 grouping.

#include <algorithm>
#include <array>
#include <string>
using namespace std;

class Solution {
    using Need = array<int, 4>; // exponents of 2, 3, 5, 7

    inline static constexpr int Factor[10][4] = {
        {0, 0, 0, 0}, {0, 0, 0, 0}, {1, 0, 0, 0}, {0, 1, 0, 0}, {2, 0, 0, 0},
        {0, 0, 1, 0}, {1, 1, 0, 0}, {0, 0, 0, 1}, {3, 0, 0, 0}, {0, 2, 0, 0}
    };

public:
    string smallestNumber(string num, long long t) {
        target_.fill(0);
        if (!factorTarget(t)) {
            return "-1";
        }

        const int n = static_cast<int>(num.size());
        Need covered{};
        int firstZero = n;

        for (int i = 0; i < n; ++i) {
            const int digit = num[i] - '0';
            if (digit == 0 && firstZero == n) {
                firstZero = i;
            }
            addDigit(covered, digit, 1);
        }

        if (firstZero == n && coversTarget(covered)) {
            return num;
        }

        for (int i = n - 1; i >= 0; --i) {
            const int original = num[i] - '0';
            addDigit(covered, original, -1);

            if (firstZero < i) {
                continue;
            }

            const int suffixLen = n - i - 1;
            const int startDigit = max(1, original + 1);

            for (int digit = startDigit; digit <= 9; ++digit) {
                Need remaining = missingAfter(covered, digit);
                if (minDigits(remaining) > suffixLen) {
                    continue;
                }

                string answer;
                answer.reserve(n);
                answer.append(num, 0, i);
                answer.push_back(static_cast<char>('0' + digit));
                appendSmallestSuffix(answer, suffixLen, remaining);
                return answer;
            }
        }

        Need fullNeed = target_;
        const int answerLen = max(n + 1, minDigits(fullNeed));
        string answer;
        answer.reserve(answerLen);
        appendSmallestSuffix(answer, answerLen, fullNeed);
        return answer;
    }

private:
    Need target_{};

    bool factorTarget(long long value) {
        static constexpr int Primes[4] = {2, 3, 5, 7};
        for (int i = 0; i < 4; ++i) {
            while (value % Primes[i] == 0) {
                ++target_[i];
                value /= Primes[i];
            }
        }
        return value == 1;
    }

    static int ceilDiv(int value, int divisor) {
        return (value + divisor - 1) / divisor;
    }

    static int minDigits23(int two, int three) {
        int best = ceilDiv(two, 3) + ceilDiv(three, 2);
        const int maxSixes = min({two, three, 5});

        for (int sixes = 1; sixes <= maxSixes; ++sixes) {
            const int cost = sixes + ceilDiv(two - sixes, 3) + ceilDiv(three - sixes, 2);
            best = min(best, cost);
        }

        return best;
    }

    static int minDigits(const Need& need) {
        return need[2] + need[3] + minDigits23(need[0], need[1]);
    }

    static void addDigit(Need& covered, int digit, int sign) {
        for (int i = 0; i < 4; ++i) {
            covered[i] += sign * Factor[digit][i];
        }
    }

    bool coversTarget(const Need& covered) const {
        for (int i = 0; i < 4; ++i) {
            if (covered[i] < target_[i]) {
                return false;
            }
        }
        return true;
    }

    Need missingAfter(const Need& covered, int digit) const {
        Need remaining{};
        for (int i = 0; i < 4; ++i) {
            remaining[i] = max(0, target_[i] - covered[i] - Factor[digit][i]);
        }
        return remaining;
    }

    static Need consumeDigit(Need need, int digit) {
        for (int i = 0; i < 4; ++i) {
            need[i] = max(0, need[i] - Factor[digit][i]);
        }
        return need;
    }

    void appendSmallestSuffix(string& answer, int length, Need need) const {
        const int coreLen = minDigits(need);
        answer.append(length - coreLen, '1');

        for (int slots = coreLen; slots > 0; --slots) {
            for (int digit = 2; digit <= 9; ++digit) {
                Need next = consumeDigit(need, digit);
                if (minDigits(next) <= slots - 1) {
                    answer.push_back(static_cast<char>('0' + digit));
                    need = next;
                    break;
                }
            }
        }
    }
};
