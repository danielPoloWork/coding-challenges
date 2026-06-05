// LeetCode 3266 - Final Array State After K Multiplication Operations II
// Recommended solution: fast + lean.
//
// Simulate only while multiplying the current minimum still does not exceed the
// initial maximum. Once min * multiplier > max, each full pass over the values
// multiplies every index once in sorted (value, index) order, so the remaining
// operations can be distributed with modular exponentiation.

#include <algorithm>
#include <cstdint>
#include <functional>
#include <vector>
using namespace std;

class Solution {
    static constexpr int MOD = 1000000007;
    static constexpr int INDEX_BITS = 14; // nums.length <= 10000 < 2^14.
    static constexpr uint64_t INDEX_MASK = (1ULL << INDEX_BITS) - 1;

public:
    vector<int> getFinalState(vector<int>& nums, int k, int multiplier) {
        if (multiplier == 1) return nums;

        const int n = static_cast<int>(nums.size());
        const long long maxValue = *max_element(nums.begin(), nums.end());

        vector<uint64_t> heap;
        heap.reserve(n);
        for (int i = 0; i < n; ++i) {
            heap.push_back(pack(nums[i], i));
        }

        const greater<uint64_t> minHeap;
        make_heap(heap.begin(), heap.end(), minHeap);

        long long remaining = k;
        while (remaining > 0) {
            const uint64_t key = heap.front();
            const long long value = valueOf(key);
            const long long nextValue = value * static_cast<long long>(multiplier);
            if (nextValue > maxValue) break;

            pop_heap(heap.begin(), heap.end(), minHeap);
            heap.pop_back();
            heap.push_back(pack(nextValue, indexOf(key)));
            push_heap(heap.begin(), heap.end(), minHeap);
            --remaining;
        }

        if (remaining == 0) {
            for (const uint64_t key : heap) {
                nums[indexOf(key)] = static_cast<int>(valueOf(key));
            }
            return nums;
        }

        sort(heap.begin(), heap.end());

        const long long fullRounds = remaining / n;
        const int extra = static_cast<int>(remaining % n);
        const long long regularFactor = modPow(multiplier, fullRounds);
        const long long extraFactor = regularFactor * multiplier % MOD;

        for (int order = 0; order < n; ++order) {
            const uint64_t key = heap[order];
            const long long factor = (order < extra) ? extraFactor : regularFactor;
            nums[indexOf(key)] = static_cast<int>((valueOf(key) % MOD) * factor % MOD);
        }

        return nums;
    }

private:
    static uint64_t pack(long long value, int index) {
        return (static_cast<uint64_t>(value) << INDEX_BITS) | static_cast<uint64_t>(index);
    }

    static int indexOf(uint64_t key) {
        return static_cast<int>(key & INDEX_MASK);
    }

    static long long valueOf(uint64_t key) {
        return static_cast<long long>(key >> INDEX_BITS);
    }

    static long long modPow(long long base, long long exponent) {
        long long result = 1;
        base %= MOD;

        while (exponent > 0) {
            if (exponent & 1LL) result = result * base % MOD;
            base = base * base % MOD;
            exponent >>= 1;
        }

        return result;
    }
};
