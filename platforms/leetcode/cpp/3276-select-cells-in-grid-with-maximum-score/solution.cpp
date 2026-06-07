// LeetCode 3276 - Select Cells in Grid With Maximum Score
// Pareto-optimal solution: greedy weighted transversal matroid + augmenting paths.
//
// Treat every distinct value as an element that can be assigned to any row where it
// appears. A set of values is feasible iff it can be matched injectively to rows.
// These feasible sets form a transversal matroid, so processing values from high
// to low and keeping a value whenever the selected set remains matchable maximizes
// the total score.

#include <algorithm>
#include <vector>
using namespace std;

class Solution {
    int rowMaskByValue[101]{};
    int matchedValueByRow[10]{};

    bool augment(int value, int& seenRows) {
        int candidates = rowMaskByValue[value] & ~seenRows;
        while (candidates != 0) {
            const int bit = candidates & -candidates;
            candidates -= bit;
            seenRows |= bit;

            const int row = __builtin_ctz(static_cast<unsigned int>(bit));
            const int displaced = matchedValueByRow[row];
            if (displaced == 0 || augment(displaced, seenRows)) {
                matchedValueByRow[row] = value;
                return true;
            }
        }
        return false;
    }

public:
    int maxScore(vector<vector<int>>& grid) {
        fill(rowMaskByValue, rowMaskByValue + 101, 0);
        fill(matchedValueByRow, matchedValueByRow + 10, 0);

        const int rowCount = static_cast<int>(grid.size());
        int maxValue = 0;
        for (int row = 0; row < rowCount; ++row) {
            const int bit = 1 << row;
            for (const int value : grid[row]) {
                rowMaskByValue[value] |= bit;
                if (value > maxValue) maxValue = value;
            }
        }

        int score = 0;
        int selected = 0;
        for (int value = maxValue; value >= 1 && selected < rowCount; --value) {
            if (rowMaskByValue[value] == 0) continue;

            int seenRows = 0;
            if (augment(value, seenRows)) {
                score += value;
                ++selected;
            }
        }

        return score;
    }
};
