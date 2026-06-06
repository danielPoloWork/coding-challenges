// LeetCode 3348 - Smallest Divisible Digit Product II
// Recommended solution: rightmost-pivot greedy with compact prime-deficit table.
//
// A zero-free digit product can contain only factors 2, 3, 5, and 7. The target t
// therefore becomes four small exponent deficits. We keep the original prefix as
// long as possible, increase one digit, then append the lexicographically smallest
// suffix that can cover the remaining deficits.

#include <algorithm>
#include <array>
#include <string>
#include <vector>
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

        buildMin23Table();

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
    int maxThree_ = 0;
    vector<unsigned char> min23_;

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

    void buildMin23Table() {
        maxThree_ = target_[1];
        min23_.assign((target_[0] + 1) * (target_[1] + 1), 0);

        for (int two = 0; two <= target_[0]; ++two) {
            for (int three = 0; three <= target_[1]; ++three) {
                min23_[index23(two, three)] = static_cast<unsigned char>(computeMin23(two, three));
            }
        }
    }

    int index23(int two, int three) const {
        return two * (maxThree_ + 1) + three;
    }

    static int ceilDiv(int value, int divisor) {
        return (value + divisor - 1) / divisor;
    }

    static int computeMin23(int two, int three) {
        int best = ceilDiv(two, 3) + ceilDiv(three, 2);
        const int maxSixes = min({two, three, 5});

        for (int sixes = 1; sixes <= maxSixes; ++sixes) {
            const int cost = sixes + ceilDiv(two - sixes, 3) + ceilDiv(three - sixes, 2);
            best = min(best, cost);
        }

        return best;
    }

    int minDigits(const Need& need) const {
        return need[2] + need[3] + min23_[index23(need[0], need[1])];
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
