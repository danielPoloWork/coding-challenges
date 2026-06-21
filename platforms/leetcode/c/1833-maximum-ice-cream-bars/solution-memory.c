/* LeetCode 1833 - Maximum Ice Cream Bars
 * Memory-extreme solution: capped-domain counting sort.
 *
 * The problem requires counting sort. To minimize auxiliary memory within that
 * constraint, this variant allocates counters only up to the largest price that
 * is initially affordable; prices above the initial budget can never be part of
 * an optimal cheapest-prefix answer.
 */

#include <stdlib.h>

int maxIceCream(int *costs, int costsSize, int coins) {
    int maxAffordable = 0;
    for (int i = 0; i < costsSize; ++i) {
        const int cost = costs[i];
        if (cost <= coins && cost > maxAffordable) {
            maxAffordable = cost;
        }
    }

    if (maxAffordable == 0) return 0;

    int *freq = (int *)calloc((size_t)maxAffordable + 1, sizeof(int));
    for (int i = 0; i < costsSize; ++i) {
        const int cost = costs[i];
        if (cost <= maxAffordable) {
            ++freq[cost];
        }
    }

    int bought = 0;
    for (int price = 1; price <= maxAffordable && coins >= price; ++price) {
        const int count = freq[price];
        if (count == 0) continue;

        const int take = count < coins / price ? count : coins / price;
        bought += take;
        coins -= take * price;

        if (take < count) break;
    }

    free(freq);
    return bought;
}
