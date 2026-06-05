// LeetCode 3509 - Maximum Product of Subsequences With an Alternating Sum Equal to K
// Recommended solution and runtime extreme: compressed product-indexed bitset DP.
//
// The alternating sign is determined by the subsequence length, not by the original
// array index. Positive products are bounded by limit; zero-product subsequences are
// tracked separately because an over-limit positive prefix can still become product 0
// after choosing a zero.

#include <array>
#include <bitset>
#include <numeric>
#include <vector>
using namespace std;

class Solution {
    static constexpr int MAX_SUM = 1800; // 150 * 12
    static constexpr int OFFSET = MAX_SUM;
    static constexpr int WIDTH = MAX_SUM * 2 + 1;

    using Bits = bitset<WIDTH>;

public:
    int maxProduct(vector<int>& nums, int k, int limit) {
        const int total = accumulate(nums.begin(), nums.end(), 0);
        if (k < -total || k > total) {
            return -1;
        }

        array<bool, 13> present{};
        for (int x : nums) {
            if (x > 1) {
                present[x] = true;
            }
        }

        vector<char> canProduct(limit + 1, 0);
        vector<int> queue;
        canProduct[1] = 1;
        queue.push_back(1);

        for (size_t head = 0; head < queue.size(); ++head) {
            const int product = queue[head];
            for (int value = 2; value <= 12; ++value) {
                if (!present[value] || product > limit / value) {
                    continue;
                }

                const int nextProduct = product * value;
                if (!canProduct[nextProduct]) {
                    canProduct[nextProduct] = 1;
                    queue.push_back(nextProduct);
                }
            }
        }

        vector<int> products;
        vector<int> productIndex(limit + 1, -1);
        products.reserve(queue.size());

        for (int product = 1; product <= limit; ++product) {
            if (canProduct[product]) {
                productIndex[product] = static_cast<int>(products.size());
                products.push_back(product);
            }
        }

        const int productCount = static_cast<int>(products.size());
        vector<Bits> odd(productCount), even(productCount);
        vector<char> active(productCount, 0);

        Bits anyOdd, anyEven;
        Bits zeroOdd, zeroEven;

        for (int x : nums) {
            const Bits oldAnyOdd = anyOdd;
            const Bits oldAnyEven = anyEven;
            const Bits oldZeroOdd = zeroOdd;
            const Bits oldZeroEven = zeroEven;

            anyOdd |= oldAnyEven << x;
            anyEven |= oldAnyOdd >> x;
            anyOdd.set(OFFSET + x);

            zeroOdd |= oldZeroEven << x;
            zeroEven |= oldZeroOdd >> x;
            if (x == 0) {
                zeroOdd.set(OFFSET);
                zeroOdd |= oldAnyEven;
                zeroEven |= oldAnyOdd;
            }

            if (x == 0) {
                continue;
            }

            if (x == 1) {
                for (int index = 0; index < productCount; ++index) {
                    if (!active[index]) {
                        continue;
                    }

                    const Bits oldOdd = odd[index];
                    const Bits oldEven = even[index];
                    even[index] |= oldOdd >> 1;
                    odd[index] |= oldEven << 1;
                }
            } else {
                for (int index = productCount - 1; index >= 0; --index) {
                    if (!active[index]) {
                        continue;
                    }

                    const int product = products[index];
                    if (product > limit / x) {
                        continue;
                    }

                    const int nextIndex = productIndex[product * x];
                    even[nextIndex] |= odd[index] >> x;
                    odd[nextIndex] |= even[index] << x;
                    active[nextIndex] = 1;
                }
            }

            if (x <= limit) {
                const int singleIndex = productIndex[x];
                if (singleIndex >= 0) {
                    odd[singleIndex].set(OFFSET + x);
                    active[singleIndex] = 1;
                }
            }
        }

        const int target = OFFSET + k;
        for (int index = productCount - 1; index >= 0; --index) {
            if (active[index] && (odd[index].test(target) || even[index].test(target))) {
                return products[index];
            }
        }

        if (zeroOdd.test(target) || zeroEven.test(target)) {
            return 0;
        }

        return -1;
    }
};
