#include <bits/stdc++.h>
using namespace std;

class Solution {
    static constexpr int MAXN = 1500;

    int distinct = 0;
    int topBit = 1;
    vector<int> values;
    int baseCount[MAXN + 2]{};
    int inCount[MAXN + 2]{};
    int outCount[MAXN + 2]{};
    long long baseSum[MAXN + 2]{};
    long long inSum[MAXN + 2]{};
    long long outSum[MAXN + 2]{};

    void add(
        int* counts,
        long long* sums,
        int index,
        int delta,
        int value,
        int& totalCount,
        long long& totalSum
    ) {
        totalCount += delta;
        totalSum += 1LL * delta * value;
        const long long sumDelta = 1LL * delta * value;
        for (++index; index <= distinct; index += index & -index) {
            counts[index] += delta;
            sums[index] += sumDelta;
        }
    }

    int prefixCount(const int* counts, int index, int totalCount) const {
        if (index < 0) {
            return 0;
        }
        if (index >= distinct) {
            return totalCount;
        }
        int result = 0;
        for (++index; index > 0; index -= index & -index) {
            result += counts[index];
        }
        return result;
    }

    long long prefixSum(const long long* sums, int index, long long totalSum) const {
        if (index < 0) {
            return 0;
        }
        if (index >= distinct) {
            return totalSum;
        }
        long long result = 0;
        for (++index; index > 0; index -= index & -index) {
            result += sums[index];
        }
        return result;
    }

    int kthSmallestIndex(const int* counts, int kth) const {
        int index = 0;
        for (int step = topBit; step > 0; step >>= 1) {
            const int next = index + step;
            if (next <= distinct && counts[next] < kth) {
                index = next;
                kth -= counts[next];
            }
        }
        return index;
    }

    int kthSmallestValue(const int* counts, int kth) const {
        return values[kthSmallestIndex(counts, kth)];
    }

    int kthLargestValue(const int* counts, int totalCount, int kth) const {
        return kthSmallestValue(counts, totalCount - kth + 1);
    }

    long long sumSmallest(
        const int* counts,
        const long long* sums,
        int totalCount,
        long long totalSum,
        int take
    ) const {
        if (take <= 0) {
            return 0;
        }
        if (take >= totalCount) {
            return totalSum;
        }
        const int index = kthSmallestIndex(counts, take);
        const int beforeCount = prefixCount(counts, index - 1, totalCount);
        const long long beforeSum = prefixSum(sums, index - 1, totalSum);
        return beforeSum + 1LL * (take - beforeCount) * values[index];
    }

    long long sumLargest(
        const int* counts,
        const long long* sums,
        int totalCount,
        long long totalSum,
        int take
    ) const {
        if (take <= 0) {
            return 0;
        }
        if (take >= totalCount) {
            return totalSum;
        }
        return totalSum - sumSmallest(counts, sums, totalCount, totalSum, totalCount - take);
    }

    long long run(vector<int>& nums, int k) {
        const int n = static_cast<int>(nums.size());
        if (k == 0) {
            long long best = nums[0];
            long long current = 0;
            for (int value : nums) {
                current = max<long long>(value, current + value);
                best = max(best, current);
            }
            return best;
        }

        values = nums;
        sort(values.begin(), values.end());
        values.erase(unique(values.begin(), values.end()), values.end());
        distinct = static_cast<int>(values.size());
        topBit = 1;
        while ((topBit << 1) <= distinct) {
            topBit <<= 1;
        }

        vector<int> rank(n);
        vector<int> totalCountPrefix(distinct, 0);
        memset(baseCount, 0, sizeof(int) * (distinct + 1));
        memset(baseSum, 0, sizeof(long long) * (distinct + 1));

        int baseTotalCount = 0;
        long long baseTotalSum = 0;
        for (int i = 0; i < n; ++i) {
            rank[i] = static_cast<int>(
                lower_bound(values.begin(), values.end(), nums[i]) - values.begin()
            );
            ++totalCountPrefix[rank[i]];
            add(baseCount, baseSum, rank[i], 1, nums[i], baseTotalCount, baseTotalSum);
        }
        for (int i = 1; i < distinct; ++i) {
            totalCountPrefix[i] += totalCountPrefix[i - 1];
        }
        vector<int> totalGreater(distinct, 0);
        for (int i = 0; i < distinct; ++i) {
            totalGreater[i] = n - totalCountPrefix[i];
        }

        vector<int> crossingByOutsideCount(n + 1, 0);
        for (int outsideCount = 1; outsideCount <= n; ++outsideCount) {
            crossingByOutsideCount[outsideCount] = static_cast<int>(
                lower_bound(
                    totalCountPrefix.begin(),
                    totalCountPrefix.end(),
                    outsideCount
                ) - totalCountPrefix.begin()
            );
        }

        long long answer = LLONG_MIN;

        for (int left = 0; left < n; ++left) {
            memset(inCount, 0, sizeof(int) * (distinct + 1));
            memset(inSum, 0, sizeof(long long) * (distinct + 1));
            memcpy(outCount, baseCount, sizeof(int) * (distinct + 1));
            memcpy(outSum, baseSum, sizeof(long long) * (distinct + 1));

            int insideTotalCount = 0;
            int outsideTotalCount = baseTotalCount;
            long long insideTotalSum = 0;
            long long outsideTotalSum = baseTotalSum;
            long long subarraySum = 0;

            for (int right = left; right < n; ++right) {
                const int value = nums[right];
                const int id = rank[right];

                add(inCount, inSum, id, 1, value, insideTotalCount, insideTotalSum);
                add(outCount, outSum, id, -1, value, outsideTotalCount, outsideTotalSum);
                subarraySum += value;

                const auto profitableAt = [&](int index) -> int {
                    if (index < 0) {
                        return 0;
                    }
                    const int insideSmall = prefixCount(inCount, index, insideTotalCount);
                    const int insideLarge = insideTotalCount - insideSmall;
                    const int outsideLarge = totalGreater[index] - insideLarge;
                    return min(insideSmall, outsideLarge);
                };

                const int cross = crossingByOutsideCount[outsideTotalCount];
                const int profitableSwaps = max(profitableAt(cross), profitableAt(cross - 1));
                const int usefulSwaps = min(k, profitableSwaps);

                const long long gain =
                    sumLargest(outCount, outSum, outsideTotalCount, outsideTotalSum, usefulSwaps) -
                    sumSmallest(inCount, inSum, insideTotalCount, insideTotalSum, usefulSwaps);
                answer = max(answer, subarraySum + gain);
            }
        }

        return answer;
    }

public:
    long long maxSum(vector<int>& nums, int k) {
        return run(nums, k);
    }

    long long maxSubarraySum(vector<int>& nums, int k) {
        return run(nums, k);
    }

    long long maximumSubarraySum(vector<int>& nums, int k) {
        return run(nums, k);
    }

    long long maximumSum(vector<int>& nums, int k) {
        return run(nums, k);
    }
};
