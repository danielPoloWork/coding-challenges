// LeetCode 3670 - Maximum Product of Two Integers With No Common Bits
// Speed extreme: bounded pair pruning with static compressed SOS-DP fallback.

#include <algorithm>
#include <vector>

using namespace std;

class Solution {
public:
    long long maxProduct(vector<int>& nums) {
        constexpr int MAX_BITS = 20;
        constexpr int MAX_MASKS = 1 << MAX_BITS;
        constexpr int MAX_N = 100000;
        constexpr int SCAN_LIMIT = 1 << 18;

        sort(nums.begin(), nums.end(), [](int a, int b) { return a > b; });
        nums.erase(unique(nums.begin(), nums.end()), nums.end());
        if (nums.size() < 2) return 0;

        const int count = static_cast<int>(nums.size());
        const int maxValue = nums[0];
        const long long absoluteUpper = 1LL * nums[0] * nums[1];

        int commonBits = nums[0];
        int usedBits = 0;
        for (int x : nums) {
            commonBits &= x;
            usedBits |= x;
        }
        if (commonBits != 0) return 0;

        long long answer = 0;
        int inspectedPairs = 0;
        bool needDp = false;

        for (int i = 0; i < count && !needDp; ++i) {
            const int x = nums[i];
            if (1LL * x * maxValue <= answer) return answer;

            for (int j = 0; j < count; ++j) {
                const int y = nums[j];
                const long long product = 1LL * x * y;
                if (product <= answer) break;

                if ((x & y) == 0) {
                    answer = product;
                    if (answer == absoluteUpper) return answer;
                    break;
                }

                if (++inspectedPairs >= SCAN_LIMIT) {
                    needDp = true;
                    break;
                }
            }
        }

        if (!needDp) return answer;

        int positions[MAX_BITS];
        int bits = 0;
        for (int bit = 0; bit < MAX_BITS; ++bit) {
            if ((usedBits & (1 << bit)) != 0) {
                positions[bits++] = bit;
            }
        }

        const int size = 1 << bits;
        const int fullMask = size - 1;
        static int best[MAX_MASKS];
        static int masks[MAX_N];
        fill(best, best + size, 0);

        for (int i = 0; i < count; ++i) {
            int mask = 0;
            for (int bit = 0; bit < bits; ++bit) {
                if ((nums[i] & (1 << positions[bit])) != 0) {
                    mask |= 1 << bit;
                }
            }
            masks[i] = mask;
            if (nums[i] > best[mask]) {
                best[mask] = nums[i];
            }
        }

        for (int bit = 0; bit < bits; ++bit) {
            const int step = 1 << bit;
            const int block = step << 1;
            for (int base = 0; base < size; base += block) {
                int* withoutBit = best + base;
                int* withBit = withoutBit + step;
                for (int offset = 0; offset < step; ++offset) {
                    if (withoutBit[offset] > withBit[offset]) {
                        withBit[offset] = withoutBit[offset];
                    }
                }
            }
        }

        for (int i = 0; i < count; ++i) {
            const int x = nums[i];
            if (1LL * x * maxValue <= answer) break;

            const int partner = best[fullMask ^ masks[i]];
            const long long product = 1LL * x * partner;
            if (product > answer) {
                answer = product;
                if (answer == absoluteUpper) break;
            }
        }

        return answer;
    }
};
