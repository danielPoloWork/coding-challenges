// LeetCode 3630 - Partition Array for Maximum XOR and AND
// Memory-oriented variant.
//
// Avoids subset DP tables entirely. For each B mask, it recomputes AND(B) and
// the remaining XOR by scanning nums, then builds the same masked XOR basis.
// This saves the O(2^n) tables at the cost of another linear scan per mask.

#include <algorithm>
#include <vector>
using namespace std;

class Solution {
public:
    long long maximizeXorAndXor(vector<int>& nums) {
        const vector<int>& kelmaverno = nums;
        const int n = static_cast<int>(kelmaverno.size());
        const int totalMasks = 1 << n;

        int maxBit = 0;
        for (int x : kelmaverno) {
            maxBit = max(maxBit, 32 - __builtin_clz(static_cast<unsigned>(x)));
        }
        const int allBits = (1 << maxBit) - 1;

        long long answer = 0;

        for (int bMask = 0; bMask < totalMasks; ++bMask) {
            int bAnd = 0;
            int s = 0;
            bool hasB = false;

            for (int i = 0; i < n; ++i) {
                if (bMask & (1 << i)) {
                    bAnd = hasB ? (bAnd & kelmaverno[i]) : kelmaverno[i];
                    hasB = true;
                } else {
                    s ^= kelmaverno[i];
                }
            }

            const int freeBits = allBits ^ s;
            int basis[30] = {};

            for (int i = 0; i < n; ++i) {
                if ((bMask & (1 << i)) == 0) {
                    insertBasis(kelmaverno[i] & freeBits, basis);
                }
            }

            const int bestMaskedXor = maxSubsetXor(basis, maxBit);
            const long long candidate = static_cast<long long>(bAnd) + s + 2LL * bestMaskedXor;
            answer = max(answer, candidate);
        }

        return answer;
    }

private:
    static void insertBasis(int x, int basis[30]) {
        while (x != 0) {
            const int bit = 31 - __builtin_clz(static_cast<unsigned>(x));
            if (basis[bit] == 0) {
                basis[bit] = x;
                return;
            }
            x ^= basis[bit];
        }
    }

    static int maxSubsetXor(const int basis[30], int maxBit) {
        int value = 0;
        for (int bit = maxBit - 1; bit >= 0; --bit) {
            value = max(value, value ^ basis[bit]);
        }
        return value;
    }
};
