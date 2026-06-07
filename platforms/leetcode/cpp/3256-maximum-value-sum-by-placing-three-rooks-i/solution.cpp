// LeetCode 3256 - Maximum Value Sum by Placing Three Rooks I
// Recommended solution: fast + lean.
//
// Order the selected lines along the smaller board dimension. One chosen line
// is always the middle one; the other two must come from the prefix and suffix.
// For any side and any middle column, at most two columns are forbidden, so the
// best usable side cell is always among that side's top three columns.

#include <algorithm>
#include <array>
#include <vector>
using namespace std;

class Solution {
    struct Candidate {
        long long value;
        int other;
    };

    static constexpr long long NEG = -(1LL << 60);

public:
    long long maximumValueSum(vector<vector<int>>& board) {
        const int m = static_cast<int>(board.size());
        const int n = static_cast<int>(board[0].size());
        const bool useRows = m <= n;
        const int lines = useRows ? m : n;
        const int others = useRows ? n : m;

        vector<array<Candidate, 3>> suffix(lines);
        array<long long, 100> bestByOther;
        bestByOther.fill(NEG);

        for (int line = lines - 1; line >= 0; --line) {
            suffix[line] = topThree(bestByOther, others);
            for (int other = 0; other < others; ++other) {
                const long long value = cell(board, useRows, line, other);
                if (value > bestByOther[other]) bestByOther[other] = value;
            }
        }

        bestByOther.fill(NEG);
        for (int other = 0; other < others; ++other) {
            bestByOther[other] = cell(board, useRows, 0, other);
        }
        array<Candidate, 3> prefix = topThree(bestByOther, others);

        long long answer = NEG;
        for (int line = 1; line < lines - 1; ++line) {
            for (int middleOther = 0; middleOther < others; ++middleOther) {
                const long long middleValue = cell(board, useRows, line, middleOther);
                for (const Candidate& left : prefix) {
                    if (left.other == middleOther) continue;
                    for (const Candidate& right : suffix[line]) {
                        if (right.other == middleOther || right.other == left.other) continue;
                        const long long sum = left.value + middleValue + right.value;
                        if (sum > answer) answer = sum;
                    }
                }
            }

            for (int other = 0; other < others; ++other) {
                const long long value = cell(board, useRows, line, other);
                if (value > bestByOther[other]) bestByOther[other] = value;
            }
            prefix = topThree(bestByOther, others);
        }

        return answer;
    }

private:
    static long long cell(
        const vector<vector<int>>& board,
        bool useRows,
        int line,
        int other) {
        return useRows ? static_cast<long long>(board[line][other])
                       : static_cast<long long>(board[other][line]);
    }

    static array<Candidate, 3> topThree(const array<long long, 100>& bestByOther, int count) {
        array<Candidate, 3> best = {{{NEG, -1}, {NEG, -1}, {NEG, -1}}};
        for (int other = 0; other < count; ++other) {
            offer(best, bestByOther[other], other);
        }
        return best;
    }

    static void offer(array<Candidate, 3>& best, long long value, int other) {
        if (value > best[0].value) {
            best[2] = best[1];
            best[1] = best[0];
            best[0] = {value, other};
        } else if (value > best[1].value) {
            best[2] = best[1];
            best[1] = {value, other};
        } else if (value > best[2].value) {
            best[2] = {value, other};
        }
    }
};
