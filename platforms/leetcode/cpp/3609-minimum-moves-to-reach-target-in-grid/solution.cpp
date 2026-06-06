// LeetCode 3609 - Minimum Moves to Reach Target in Grid
// Recommended solution: fast + lean.
//
// Work backward from the target. When the coordinates differ, the previous
// point is forced: the larger coordinate was either doubled, or it was formed
// by adding the smaller coordinate. Equal positive coordinates are the only
// branching case; they can only come from one coordinate being zero.

class Solution {
    static constexpr int INF = 1000000000;

public:
    int minMoves(int sx, int sy, int tx, int ty) {
        if (tx < sx || ty < sy) return -1;

        const int answer = backward(sx, sy, tx, ty);
        return answer >= INF ? -1 : answer;
    }

private:
    int backward(long long sx, long long sy, long long x, long long y) {
        int moves = 0;

        while (true) {
            if (x == sx && y == sy) return moves;
            if (x < sx || y < sy) return INF;

            if (x == y) {
                if (x == 0) return INF;

                int best = INF;
                if (sx == 0) {
                    const int viaXZero = backward(sx, sy, 0, y);
                    if (viaXZero < INF) best = moves + 1 + viaXZero;
                }
                if (sy == 0) {
                    const int viaYZero = backward(sx, sy, x, 0);
                    if (viaYZero < INF && moves + 1 + viaYZero < best) {
                        best = moves + 1 + viaYZero;
                    }
                }
                return best;
            }

            if (x > y) {
                if (x >= 2 * y) {
                    if ((x & 1LL) != 0) return INF;
                    x >>= 1;
                } else {
                    x -= y;
                }
            } else {
                if (y >= 2 * x) {
                    if ((y & 1LL) != 0) return INF;
                    y >>= 1;
                } else {
                    y -= x;
                }
            }

            ++moves;
        }
    }
};
