// LeetCode 3664 - Two-Letter Card Game
// Recommended solution: fast + lean.
//
// This problem is Pareto-optimal: the O(n) classification below, followed by an
// O(both) split scan over a handful of int counters, is simultaneously the recommended,
// the speed-extreme, and the memory-extreme answer. Reading every card is an unavoidable
// Omega(n) lower bound, and only a fixed set of <=21 integer counters is needed - so there
// is no genuinely different, non-dominated speed or memory variant to ship (see notes.md).
// Hence a single file.
//
// Only cards containing x can ever be used, so classify each x-card by WHERE x sits:
//   - "both"  : the card is "xx" (x in BOTH positions). It differs in exactly one spot
//               from every one-sided x-card, so it pairs with any of them - but two "xx"
//               cards are identical (differ in 0 positions), so these wildcards never pair
//               each other.
//   - cnt1[c] : x in the FIRST position, other letter c != x  -> card "xc".
//               "xc" and "xd" are compatible iff c != d.
//   - cnt2[c] : x in the SECOND position, other letter c != x -> card "cx".
//               "cx" and "dx" are compatible iff c != d.
// A first-position card "xc" and a second-position card "dx" differ in BOTH positions
// (c, d != x), so they are NEVER compatible. Cluster 1 (cnt1 + wildcards) and cluster 2
// (cnt2 + wildcards) are therefore independent, except that they share the wildcard pool.
//
// Inside one cluster we may only pair cards from different groups (different other-letters;
// a wildcard is its own group that pairs with everyone but itself). The maximum number of
// such cross-group pairs is the classic:
//       pairs = min( total / 2 , total - largestGroup )
// where total counts the cluster's cards (its one-sided cards plus the wildcards given to
// it) and largestGroup is its biggest single group.
//
// A wildcard spent in cluster 1 cannot be reused in cluster 2, so we try every split: give
// i wildcards to cluster 1 and (both - i) to cluster 2, take the best. The score is not
// concave in i (floor division makes the marginal gain alternate), so we scan all splits
// rather than ternary-search. i ranges over 0..both, each step O(1).
//
// Sizes are tiny: n <= 1e5, so every count, sum and pair total fits in 32-bit int.

#include <vector>
#include <string>
#include <algorithm>
using namespace std;

class Solution {
public:
    int score(vector<string>& cards, char x) {
        int both = 0;            // count of "xx" wildcards
        int cnt1[10] = {0};      // x first,  indexed by the other letter (0..9 for 'a'..'j')
        int cnt2[10] = {0};      // x second, indexed by the other letter

        for (const string& card : cards) {
            const bool first  = card[0] == x;
            const bool second = card[1] == x;
            if (first && second)  ++both;
            else if (first)       ++cnt1[card[1] - 'a'];
            else if (second)      ++cnt2[card[0] - 'a'];
            // cards without x are irrelevant and skipped
        }

        // Per-cluster total cards and largest single group, computed once.
        int sum1 = 0, max1 = 0, sum2 = 0, max2 = 0;
        for (int c = 0; c < 10; ++c) {
            sum1 += cnt1[c]; max1 = max(max1, cnt1[c]);
            sum2 += cnt2[c]; max2 = max(max2, cnt2[c]);
        }

        // Try every way to split the wildcards between the two independent clusters.
        int best = 0;
        for (int i = 0; i <= both; ++i)
            best = max(best, solve(sum1, max1, i) + solve(sum2, max2, both - i));
        return best;
    }

private:
    // Maximum cross-group pairs in one cluster: `sum` one-sided cards whose largest single
    // group is `mx`, plus `have` wildcards (a group that pairs with everyone but itself).
    // You can never use more than half the cards, nor more than (total - largestGroup),
    // because the largest indivisible group's surplus has no partner.
    static int solve(int sum, int mx, int have) {
        const int total   = sum + have;
        const int largest = max(mx, have);
        return min(total / 2, total - largest);
    }
};
