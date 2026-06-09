// LeetCode 3630 - Partition Array for Maximum XOR and AND
// Recommended solution: fast + lean.
//
// For a fixed subset B, let s be the XOR of all elements outside B. If A has
// XOR x, then C has XOR s ^ x, and:
//
//     x + (s ^ x) = s + 2 * (x & ~s)
//
// So only the bits where s is zero matter for the A/C split. Build a linear
// XOR basis from the remaining values masked by those free bits, then greedily
// extract the maximum reachable masked XOR.

#include <algorithm>
#include <vector>
using namespace std;

class Solution {
public:
    long long maximizeXorAndXor(vector<int>& nums) {
        const vector<int>& kelmaverno = nums;
        const int n = static_cast<int>(kelmaverno.size());
        const int totalMasks = 1 << n;
        const int fullMask = totalMasks - 1;

        int maxBit = 0;
        for (int x : kelmaverno) {
            maxBit = max(maxBit, 32 - __builtin_clz(static_cast<unsigned>(x)));
        }
        const int allBits = (1 << maxBit) - 1;

        vector<int> subsetXor(totalMasks, 0);
        vector<int> subsetAnd(totalMasks, 0);

        for (int mask = 1; mask < totalMasks; ++mask) {
            const int low = mask & -mask;
            const int prev = mask ^ low;
            const int idx = __builtin_ctz(static_cast<unsigned>(low));

            subsetXor[mask] = subsetXor[prev] ^ kelmaverno[idx];
            subsetAnd[mask] = prev == 0 ? kelmaverno[idx] : (subsetAnd[prev] & kelmaverno[idx]);
        }

        long long answer = 0;

        for (int bMask = 0; bMask < totalMasks; ++bMask) {
            const int remain = fullMask ^ bMask;
            const int s = subsetXor[remain];
            const int freeBits = allBits ^ s;
            int basis[30] = {};

            for (int r = remain; r; r &= r - 1) {
                const int idx = __builtin_ctz(static_cast<unsigned>(r));
                insertBasis(kelmaverno[idx] & freeBits, basis);
            }

            const int bestMaskedXor = maxSubsetXor(basis, maxBit);
            const long long candidate =
                static_cast<long long>(subsetAnd[bMask]) + s + 2LL * bestMaskedXor;
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
