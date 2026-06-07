// LeetCode 3256 - Maximum Value Sum by Placing Three Rooks I
// Runtime-optimized variant.
//
// Same prefix/suffix top-three idea as the recommended solution, but with the
// board copied into a fixed oriented matrix and all hot state stored in stack
// arrays. That spends O(mn) extra memory to remove vector indirection and the
// row/column orientation branch from the inner loops.

#include <vector>
using namespace std;

class Solution {
    struct Candidate {
        long long value;
        int other;
    };

    static constexpr int MAX_SIZE = 100;
    static constexpr long long NEG = -(1LL << 60);

public:
    long long maximumValueSum(vector<vector<int>>& board) {
        const int m = static_cast<int>(board.size());
        const int n = static_cast<int>(board[0].size());
        const bool useRows = m <= n;
        const int lines = useRows ? m : n;
        const int others = useRows ? n : m;

        int value[MAX_SIZE][MAX_SIZE];
        for (int line = 0; line < lines; ++line) {
            for (int other = 0; other < others; ++other) {
                value[line][other] = useRows ? board[line][other] : board[other][line];
            }
        }

        Candidate suffix[MAX_SIZE][3];
        long long bestByOther[MAX_SIZE];
        fillBest(bestByOther, others);

        for (int line = lines - 1; line >= 0; --line) {
            fillTop(bestByOther, others, suffix[line]);
            for (int other = 0; other < others; ++other) {
                if (value[line][other] > bestByOther[other]) {
                    bestByOther[other] = value[line][other];
                }
            }
        }

        fillBest(bestByOther, others);
        for (int other = 0; other < others; ++other) bestByOther[other] = value[0][other];

        Candidate prefix[3];
        fillTop(bestByOther, others, prefix);

        long long answer = NEG;
        for (int line = 1; line < lines - 1; ++line) {
            for (int middleOther = 0; middleOther < others; ++middleOther) {
                const long long middleValue = value[line][middleOther];
                for (int leftIndex = 0; leftIndex < 3; ++leftIndex) {
                    const Candidate left = prefix[leftIndex];
                    if (left.other == middleOther) continue;
                    for (int rightIndex = 0; rightIndex < 3; ++rightIndex) {
                        const Candidate right = suffix[line][rightIndex];
                        if (right.other == middleOther || right.other == left.other) continue;
                        const long long sum = left.value + middleValue + right.value;
                        if (sum > answer) answer = sum;
                    }
                }
            }

            for (int other = 0; other < others; ++other) {
                if (value[line][other] > bestByOther[other]) {
                    bestByOther[other] = value[line][other];
                }
            }
            fillTop(bestByOther, others, prefix);
        }

        return answer;
    }

private:
    static void fillBest(long long bestByOther[MAX_SIZE], int count) {
        for (int i = 0; i < count; ++i) bestByOther[i] = NEG;
    }

    static void fillTop(
        const long long bestByOther[MAX_SIZE],
        int count,
        Candidate top[3]) {
        top[0] = {NEG, -1};
        top[1] = {NEG, -1};
        top[2] = {NEG, -1};

        for (int other = 0; other < count; ++other) {
            const long long value = bestByOther[other];
            if (value > top[0].value) {
                top[2] = top[1];
                top[1] = top[0];
                top[0] = {value, other};
            } else if (value > top[1].value) {
                top[2] = top[1];
                top[1] = {value, other};
            } else if (value > top[2].value) {
                top[2] = {value, other};
            }
        }
    }
};
