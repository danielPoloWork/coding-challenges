// LeetCode 217 - Contains Duplicate
// Runtime-optimized variant (fastest wall-clock time).
//
// Strategy: a flat open-addressing hash set (linear probing, load factor <= 0.5)
// with a strong integer finalizer. This beats std::unordered_set on this workload
// because every slot lives in two contiguous arrays (cache-friendly) and there is
// no per-element node allocation. We return as soon as the first collision is seen,
// so duplicate-heavy inputs finish in a fraction of a single pass.
//
// Trades memory (an O(n) table) for speed. See solution-memory.c for the lean variant.

#include <vector>
#include <cstdint>
using namespace std;

class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        const int n = static_cast<int>(nums.size());
        if (n < 2) return false;

        // Power-of-two table sized to keep the load factor at or below 0.5.
        size_t cap = 1;
        while (cap < static_cast<size_t>(n) * 2) cap <<= 1;
        const size_t mask = cap - 1;

        vector<int>     keys(cap);
        vector<uint8_t> used(cap, 0);

        for (int i = 0; i < n; ++i) {
            const int x = nums[i];
            size_t h = mix(static_cast<uint32_t>(x)) & mask;
            while (used[h]) {
                if (keys[h] == x) return true;   // duplicate found -> early exit
                h = (h + 1) & mask;              // linear probe
            }
            used[h] = 1;
            keys[h] = x;
        }
        return false;
    }

private:
    // Murmur3-style 32-bit finalizer: spreads entropy across all bits so that
    // masking the low bits for a power-of-two table stays well distributed.
    static inline uint32_t mix(uint32_t x) {
        x ^= x >> 16;
        x *= 0x7feb352dU;
        x ^= x >> 15;
        x *= 0x846ca68bU;
        x ^= x >> 16;
        return x;
    }
};
