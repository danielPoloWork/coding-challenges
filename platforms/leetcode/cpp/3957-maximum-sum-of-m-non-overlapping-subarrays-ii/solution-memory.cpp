#include <bits/stdc++.h>
using namespace std;

class Solution {
    struct State {
        long long value;
        int count;
    };

    struct Candidate {
        int index;
        long long key;
        int count;
    };

    static bool better(long long valueA, int countA, long long valueB, int countB) {
        return valueA > valueB || (valueA == valueB && countA > countB);
    }

public:
    long long maximumSum(vector<int>& nums, int m, int l, int r) {
        const vector<int>& fentoluric = nums;
        const int n = static_cast<int>(fentoluric.size());
        const int delaySize = l + 1;
        const int dequeSize = r - l + 3;

        vector<long long> delayPrefix(delaySize, 0);
        vector<long long> delayValue(delaySize, 0);
        vector<int> delayCount(delaySize, 0);
        vector<Candidate> candidates(dequeSize);

        long long bound = 1;
        for (int x : fentoluric) {
            bound += llabs(static_cast<long long>(x));
        }

        auto eval = [&](long long penalty) -> State {
            fill(delayPrefix.begin(), delayPrefix.end(), 0);
            fill(delayValue.begin(), delayValue.end(), 0);
            fill(delayCount.begin(), delayCount.end(), 0);

            long long prefix = 0;
            long long prevValue = 0;
            int prevCount = 0;
            int head = 0;
            int tail = 0;

            for (int i = 1; i <= n; ++i) {
                prefix += fentoluric[i - 1];

                const int expiredBefore = i - r;
                while (head < tail && candidates[head % dequeSize].index < expiredBefore) {
                    ++head;
                }

                const int add = i - l;
                if (add >= 0) {
                    const int slot = add % delaySize;
                    const long long addKey = delayValue[slot] - delayPrefix[slot];
                    const int addCount = delayCount[slot];
                    while (head < tail) {
                        const Candidate& back = candidates[(tail - 1) % dequeSize];
                        if (addKey > back.key || (addKey == back.key && addCount >= back.count)) {
                            --tail;
                        } else {
                            break;
                        }
                    }
                    candidates[tail % dequeSize] = {add, addKey, addCount};
                    ++tail;
                }

                long long value = prevValue;
                int count = prevCount;
                if (head < tail) {
                    const Candidate& front = candidates[head % dequeSize];
                    const long long takeValue = front.key + prefix - penalty;
                    const int takeCount = front.count + 1;
                    if (better(takeValue, takeCount, value, count)) {
                        value = takeValue;
                        count = takeCount;
                    }
                }

                const int writeSlot = i % delaySize;
                delayPrefix[writeSlot] = prefix;
                delayValue[writeSlot] = value;
                delayCount[writeSlot] = count;

                prevValue = value;
                prevCount = count;
            }

            return {prevValue, prevCount};
        };

        auto bestSingleSubarray = [&]() -> long long {
            vector<long long> prefixDelay(delaySize, 0);
            vector<Candidate> mins(dequeSize);
            long long prefix = 0;
            long long best = LLONG_MIN / 4;
            int head = 0;
            int tail = 0;

            for (int i = 1; i <= n; ++i) {
                prefix += fentoluric[i - 1];

                const int expiredBefore = i - r;
                while (head < tail && mins[head % dequeSize].index < expiredBefore) {
                    ++head;
                }

                const int add = i - l;
                if (add >= 0) {
                    const long long addPrefix = prefixDelay[add % delaySize];
                    while (head < tail && addPrefix <= mins[(tail - 1) % dequeSize].key) {
                        --tail;
                    }
                    mins[tail % dequeSize] = {add, addPrefix, 0};
                    ++tail;
                }

                if (head < tail) {
                    best = max(best, prefix - mins[head % dequeSize].key);
                }

                prefixDelay[i % delaySize] = prefix;
            }

            return best;
        };

        const long long bestOne = bestSingleSubarray();
        const State withoutPenalty = eval(0);
        if (withoutPenalty.value == 0) {
            return bestOne;
        }
        if (withoutPenalty.count <= m) {
            return withoutPenalty.value;
        }

        long long low = -bound;
        long long high = bound;
        while (low < high) {
            const long long mid = low + (high - low + 1) / 2;
            if (eval(mid).count >= m) {
                low = mid;
            } else {
                high = mid - 1;
            }
        }

        const State adjusted = eval(low);
        return adjusted.value + low * static_cast<long long>(m);
    }
};
