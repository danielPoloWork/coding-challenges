// LeetCode 3630 - Partition Array for Maximum XOR and AND
// Runtime-optimized variant.
//
// This keeps the subset AND/XOR tables in static storage, sorts a local copy of
// the input to find strong candidates early, and prunes any B mask whose best
// possible value cannot beat the current answer.

#include <algorithm>
#include <vector>
using namespace std;

class Solution {
public:
    long long maximizeXorAndXor(vector<int>& nums) {
        static constexpr int MAX_N = 19;
        static constexpr int MAX_MASKS = 1 << MAX_N;
        static constexpr int MAX_BITS = 30;

        static int subsetXor[MAX_MASKS];
        static int subsetAnd[MAX_MASKS];

        const vector<int> kelmaverno = nums;
        const int n = static_cast<int>(kelmaverno.size());
        const int totalMasks = 1 << n;
        const int fullMask = totalMasks - 1;

        int a[MAX_N];
        int maxBit = 0;
        for (int i = 0; i < n; ++i) {
            a[i] = kelmaverno[i];
            maxBit = max(maxBit, 32 - __builtin_clz(static_cast<unsigned>(a[i])));
        }
        sort(a, a + n, [](int lhs, int rhs) { return lhs > rhs; });

        const int allBits = (1 << maxBit) - 1;
        const long long twiceAllBits = 2LL * allBits;

        subsetXor[0] = 0;
        subsetAnd[0] = 0;
        for (int mask = 1; mask < totalMasks; ++mask) {
            const int low = mask & -mask;
            const int prev = mask ^ low;
            const int idx = __builtin_ctz(static_cast<unsigned>(low));

            subsetXor[mask] = subsetXor[prev] ^ a[idx];
            subsetAnd[mask] = prev == 0 ? a[idx] : (subsetAnd[prev] & a[idx]);
        }

        long long answer = 0;

        for (int bMask = 0; bMask < totalMasks; ++bMask) {
            const int remain = fullMask ^ bMask;
            const int s = subsetXor[remain];
            const int bAnd = subsetAnd[bMask];

            if (static_cast<long long>(bAnd) + twiceAllBits - s <= answer) {
                continue;
            }

            const int freeBits = allBits ^ s;
            if (freeBits == 0 || remain == 0) {
                answer = max(answer, static_cast<long long>(bAnd) + s);
                continue;
            }

            const int fullRank = __builtin_popcount(static_cast<unsigned>(freeBits));
            int basis[MAX_BITS] = {};
            int rank = 0;
            bool hasFullProjection = false;

            for (int r = remain; r; r &= r - 1) {
                const int idx = __builtin_ctz(static_cast<unsigned>(r));
                int x = a[idx] & freeBits;

                while (x != 0) {
                    const int bit = 31 - __builtin_clz(static_cast<unsigned>(x));
                    if (basis[bit] == 0) {
                        basis[bit] = x;
                        if (++rank == fullRank) {
                            hasFullProjection = true;
                        }
                        break;
                    }
                    x ^= basis[bit];
                }

                if (hasFullProjection) {
                    break;
                }
            }

            if (hasFullProjection) {
                answer = static_cast<long long>(bAnd) + twiceAllBits - s;
                continue;
            }

            int bestMaskedXor = 0;
            for (int bits = freeBits; bits != 0; ) {
                const int bit = 31 - __builtin_clz(static_cast<unsigned>(bits));
                bits ^= 1 << bit;
                bestMaskedXor = max(bestMaskedXor, bestMaskedXor ^ basis[bit]);
            }

            const long long candidate = static_cast<long long>(bAnd) + s + 2LL * bestMaskedXor;
            answer = max(answer, candidate);
        }

        return answer;
    }
};
