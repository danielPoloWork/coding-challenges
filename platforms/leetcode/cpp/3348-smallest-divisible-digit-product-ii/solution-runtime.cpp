// LeetCode 3348 - Smallest Divisible Digit Product II
// Speed extreme: precomputed residual-state transitions.
//
// This variant spends extra memory on a small state graph of possible prime deficits.
// During the O(n) right-to-left scan, each candidate digit becomes one transition lookup
// plus one minimum-length lookup.

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

        buildStateTables();

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

            const int baseState = stateAfterCovered(covered);
            const int suffixLen = n - i - 1;
            const int startDigit = max(1, original + 1);

            for (int digit = startDigit; digit <= 9; ++digit) {
                const int next = nextState_[baseState][digit];
                if (minDigits_[next] > suffixLen) {
                    continue;
                }

                string answer;
                answer.reserve(n);
                answer.append(num, 0, i);
                answer.push_back(static_cast<char>('0' + digit));
                appendSmallestSuffix(answer, suffixLen, next);
                return answer;
            }
        }

        const int fullState = encode(target_[0], target_[1], target_[2], target_[3]);
        const int answerLen = max(n + 1, static_cast<int>(minDigits_[fullState]));
        string answer;
        answer.reserve(answerLen);
        appendSmallestSuffix(answer, answerLen, fullState);
        return answer;
    }

private:
    Need target_{};
    int dim3_ = 1;
    int dim5_ = 1;
    int dim7_ = 1;
    vector<unsigned char> minDigits_;
    vector<array<int, 10>> nextState_;

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

    void buildStateTables() {
        dim3_ = target_[1] + 1;
        dim5_ = target_[2] + 1;
        dim7_ = target_[3] + 1;

        const int stateCount = (target_[0] + 1) * dim3_ * dim5_ * dim7_;
        minDigits_.assign(stateCount, 0);
        nextState_.resize(stateCount);

        for (int two = 0; two <= target_[0]; ++two) {
            for (int three = 0; three <= target_[1]; ++three) {
                for (int five = 0; five <= target_[2]; ++five) {
                    for (int seven = 0; seven <= target_[3]; ++seven) {
                        const int state = encode(two, three, five, seven);
                        minDigits_[state] = static_cast<unsigned char>(
                            five + seven + computeMin23(two, three)
                        );

                        for (int digit = 0; digit <= 9; ++digit) {
                            const int nextTwo = max(0, two - Factor[digit][0]);
                            const int nextThree = max(0, three - Factor[digit][1]);
                            const int nextFive = max(0, five - Factor[digit][2]);
                            const int nextSeven = max(0, seven - Factor[digit][3]);
                            nextState_[state][digit] = encode(nextTwo, nextThree, nextFive, nextSeven);
                        }
                    }
                }
            }
        }
    }

    int encode(int two, int three, int five, int seven) const {
        return (((two * dim3_ + three) * dim5_ + five) * dim7_ + seven);
    }

    int stateAfterCovered(const Need& covered) const {
        return encode(
            max(0, target_[0] - covered[0]),
            max(0, target_[1] - covered[1]),
            max(0, target_[2] - covered[2]),
            max(0, target_[3] - covered[3])
        );
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

    void appendSmallestSuffix(string& answer, int length, int state) const {
        const int coreLen = minDigits_[state];
        answer.append(length - coreLen, '1');

        for (int slots = coreLen; slots > 0; --slots) {
            for (int digit = 2; digit <= 9; ++digit) {
                const int next = nextState_[state][digit];
                if (minDigits_[next] <= slots - 1) {
                    answer.push_back(static_cast<char>('0' + digit));
                    state = next;
                    break;
                }
            }
        }
    }
};
