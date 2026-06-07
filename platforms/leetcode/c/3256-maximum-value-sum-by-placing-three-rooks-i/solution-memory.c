/* LeetCode 3256 - Maximum Value Sum by Placing Three Rooks I
 * Memory-optimized variant.
 *
 * For every triple on the smaller board dimension, rebuild the top three
 * opposite coordinates locally by scanning the larger dimension. This avoids a
 * retained candidate table and uses only constant auxiliary memory.
 */

#include <limits.h>

static inline long long read_cell(int **board, int use_rows, int line, int other) {
    return use_rows ? (long long)board[line][other] : (long long)board[other][line];
}

static inline void offer(long long values[3], int positions[3], long long value, int position) {
    if (value > values[0]) {
        values[2] = values[1];
        positions[2] = positions[1];
        values[1] = values[0];
        positions[1] = positions[0];
        values[0] = value;
        positions[0] = position;
    } else if (value > values[1]) {
        values[2] = values[1];
        positions[2] = positions[1];
        values[1] = value;
        positions[1] = position;
    } else if (value > values[2]) {
        values[2] = value;
        positions[2] = position;
    }
}

long long maximumValueSum(int **board, int boardSize, int *boardColSize) {
    const int m = boardSize;
    const int n = boardColSize[0];
    const int use_rows = m <= n;
    const int lines = use_rows ? m : n;
    const int others = use_rows ? n : m;
    const long long neg = LLONG_MIN / 4;
    long long answer = neg;

    for (int a = 0; a < lines - 2; ++a) {
        for (int b = a + 1; b < lines - 1; ++b) {
            for (int c = b + 1; c < lines; ++c) {
                long long va[3] = {neg, neg, neg};
                long long vb[3] = {neg, neg, neg};
                long long vc[3] = {neg, neg, neg};
                int pa[3] = {-1, -1, -1};
                int pb[3] = {-1, -1, -1};
                int pc[3] = {-1, -1, -1};

                for (int other = 0; other < others; ++other) {
                    offer(va, pa, read_cell(board, use_rows, a, other), other);
                    offer(vb, pb, read_cell(board, use_rows, b, other), other);
                    offer(vc, pc, read_cell(board, use_rows, c, other), other);
                }

                for (int ia = 0; ia < 3; ++ia) {
                    for (int ib = 0; ib < 3; ++ib) {
                        if (pa[ia] == pb[ib]) continue;
                        for (int ic = 0; ic < 3; ++ic) {
                            if (pa[ia] == pc[ic] || pb[ib] == pc[ic]) continue;
                            const long long sum = va[ia] + vb[ib] + vc[ic];
                            if (sum > answer) answer = sum;
                        }
                    }
                }
            }
        }
    }

    return answer;
}
