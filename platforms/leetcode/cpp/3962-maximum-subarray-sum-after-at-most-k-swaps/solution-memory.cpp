#include <bits/stdc++.h>
using namespace std;

class Solution {
    struct Fenwick {
        int n = 0;
        int topBit = 1;
        int totalCount = 0;
        long long totalSum = 0;
        vector<int> bitCount;
        vector<long long> bitSum;

        explicit Fenwick(int size = 0) {
            init(size);
        }

        void init(int size) {
            n = size;
            topBit = 1;
            while ((topBit << 1) <= n) {
                topBit <<= 1;
            }
            totalCount = 0;
            totalSum = 0;
            bitCount.assign(n + 1, 0);
            bitSum.assign(n + 1, 0);
        }

        void clear() {
            totalCount = 0;
            totalSum = 0;
            fill(bitCount.begin(), bitCount.end(), 0);
            fill(bitSum.begin(), bitSum.end(), 0);
        }

        void add(int index, int delta, int value) {
            totalCount += delta;
            totalSum += 1LL * delta * value;
            const long long sumDelta = 1LL * delta * value;
            for (++index; index <= n; index += index & -index) {
                bitCount[index] += delta;
                bitSum[index] += sumDelta;
            }
        }

        int countPrefix(int index) const {
            if (index < 0) {
                return 0;
            }
            if (index >= n) {
                return totalCount;
            }
            int result = 0;
            for (++index; index > 0; index -= index & -index) {
                result += bitCount[index];
            }
            return result;
        }

        long long sumPrefix(int index) const {
            if (index < 0) {
                return 0;
            }
            if (index >= n) {
                return totalSum;
            }
            long long result = 0;
            for (++index; index > 0; index -= index & -index) {
                result += bitSum[index];
            }
            return result;
        }

        int kthSmallestIndex(int kth) const {
            int index = 0;
            for (int step = topBit; step > 0; step >>= 1) {
                const int next = index + step;
                if (next <= n && bitCount[next] < kth) {
                    index = next;
                    kth -= bitCount[next];
                }
            }
            return index;
        }

        int kthSmallestValue(int kth, const vector<int>& values) const {
            return values[kthSmallestIndex(kth)];
        }

        long long sumSmallest(int take, const vector<int>& values) const {
            if (take <= 0) {
                return 0;
            }
            if (take >= totalCount) {
                return totalSum;
            }
            const int index = kthSmallestIndex(take);
            const int beforeCount = countPrefix(index - 1);
            const long long beforeSum = sumPrefix(index - 1);
            return beforeSum + 1LL * (take - beforeCount) * values[index];
        }
    };

    static long long solve(vector<int>& nums, int k) {
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

        vector<int> values = nums;
        sort(values.begin(), values.end());
        values.erase(unique(values.begin(), values.end()), values.end());
        const int distinct = static_cast<int>(values.size());

        vector<int> rank(n);
        vector<int> totalCountPrefix(distinct, 0);
        vector<long long> totalSumPrefix(distinct, 0);
        long long totalArraySum = 0;

        for (int i = 0; i < n; ++i) {
            rank[i] = static_cast<int>(
                lower_bound(values.begin(), values.end(), nums[i]) - values.begin()
            );
            ++totalCountPrefix[rank[i]];
            totalSumPrefix[rank[i]] += nums[i];
            totalArraySum += nums[i];
        }

        for (int i = 1; i < distinct; ++i) {
            totalCountPrefix[i] += totalCountPrefix[i - 1];
            totalSumPrefix[i] += totalSumPrefix[i - 1];
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

        Fenwick inside(distinct);
        long long answer = LLONG_MIN;

        for (int left = 0; left < n; ++left) {
            inside.clear();
            long long subarraySum = 0;

            for (int right = left; right < n; ++right) {
                const int value = nums[right];
                inside.add(rank[right], 1, value);
                subarraySum += value;

                const int outsideTotalCount = n - inside.totalCount;
                const long long outsideTotalSum = totalArraySum - inside.totalSum;

                auto outsideCountPrefix = [&](int index) -> int {
                    if (index < 0) {
                        return 0;
                    }
                    if (index >= distinct) {
                        return outsideTotalCount;
                    }
                    return totalCountPrefix[index] - inside.countPrefix(index);
                };

                auto outsideSumPrefix = [&](int index) -> long long {
                    if (index < 0) {
                        return 0;
                    }
                    if (index >= distinct) {
                        return outsideTotalSum;
                    }
                    return totalSumPrefix[index] - inside.sumPrefix(index);
                };

                auto outsideKthSmallestIndex = [&](int kth) -> int {
                    int low = 0;
                    int high = distinct - 1;
                    while (low < high) {
                        const int mid = low + (high - low) / 2;
                        if (outsideCountPrefix(mid) >= kth) {
                            high = mid;
                        } else {
                            low = mid + 1;
                        }
                    }
                    return low;
                };

                auto sumSmallestOutside = [&](int take) -> long long {
                    if (take <= 0) {
                        return 0;
                    }
                    if (take >= outsideTotalCount) {
                        return outsideTotalSum;
                    }
                    const int index = outsideKthSmallestIndex(take);
                    const int beforeCount = outsideCountPrefix(index - 1);
                    const long long beforeSum = outsideSumPrefix(index - 1);
                    return beforeSum + 1LL * (take - beforeCount) * values[index];
                };

                auto sumLargestOutside = [&](int take) -> long long {
                    if (take <= 0) {
                        return 0;
                    }
                    if (take >= outsideTotalCount) {
                        return outsideTotalSum;
                    }
                    return outsideTotalSum - sumSmallestOutside(outsideTotalCount - take);
                };

                const auto profitableAt = [&](int index) -> int {
                    if (index < 0) {
                        return 0;
                    }
                    const int insideSmall = inside.countPrefix(index);
                    const int insideLarge = inside.totalCount - insideSmall;
                    const int outsideLarge = totalGreater[index] - insideLarge;
                    return min(insideSmall, outsideLarge);
                };

                const int cross = crossingByOutsideCount[outsideTotalCount];
                const int profitableSwaps = max(profitableAt(cross), profitableAt(cross - 1));
                const int usefulSwaps = min(k, profitableSwaps);

                const long long gain =
                    sumLargestOutside(usefulSwaps) - inside.sumSmallest(usefulSwaps, values);
                answer = max(answer, subarraySum + gain);
            }
        }

        return answer;
    }

public:
    long long maxSum(vector<int>& nums, int k) {
        return solve(nums, k);
    }

    long long maxSubarraySum(vector<int>& nums, int k) {
        return solve(nums, k);
    }

    long long maximumSubarraySum(vector<int>& nums, int k) {
        return solve(nums, k);
    }

    long long maximumSum(vector<int>& nums, int k) {
        return solve(nums, k);
    }
};
