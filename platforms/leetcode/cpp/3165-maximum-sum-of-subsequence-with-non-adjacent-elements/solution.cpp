// LeetCode 3165 - Maximum Sum of Subsequence With Non-adjacent Elements
// Pareto-optimal solution: iterative segment tree over a max-plus 2x2 DP matrix.
//
// For a prefix ending before the current element, keep two states:
// previous element was not selected, or previous element was selected. One value x
// transforms those states as:
//
// newNotSelected = max(oldNotSelected, oldSelected)
// newSelected    = oldNotSelected + x
//
// This is a max-plus matrix. Matrix composition is associative and has an identity,
// so point updates become ordinary segment-tree updates.

#include <algorithm>
#include <vector>
using namespace std;

class Solution {
    static constexpr long long NEG = -(1LL << 60);
    static constexpr int MOD = 1000000007;

    struct Node {
        long long a00;
        long long a01;
        long long a10;
        long long a11;
    };

    static Node identity() {
        return {0, NEG, NEG, 0};
    }

    static Node leaf(int value) {
        return {0, 0, static_cast<long long>(value), NEG};
    }

    static Node merge(const Node& left, const Node& right) {
        return {
            max(right.a00 + left.a00, right.a01 + left.a10),
            max(right.a00 + left.a01, right.a01 + left.a11),
            max(right.a10 + left.a00, right.a11 + left.a10),
            max(right.a10 + left.a01, right.a11 + left.a11)
        };
    }

public:
    int maximumSumSubsequence(vector<int>& nums, vector<vector<int>>& queries) {
        const int n = static_cast<int>(nums.size());
        int size = 1;
        while (size < n) size <<= 1;

        vector<Node> tree(size << 1, identity());
        for (int i = 0; i < n; ++i) {
            tree[size + i] = leaf(nums[i]);
        }
        for (int i = size - 1; i > 0; --i) {
            tree[i] = merge(tree[i << 1], tree[i << 1 | 1]);
        }

        long long total = 0;
        for (const vector<int>& query : queries) {
            int idx = size + query[0];
            tree[idx] = leaf(query[1]);

            idx >>= 1;
            while (idx > 0) {
                tree[idx] = merge(tree[idx << 1], tree[idx << 1 | 1]);
                idx >>= 1;
            }

            const long long best = max(tree[1].a00, tree[1].a10);
            total += best % MOD;
            if (total >= MOD) total %= MOD;
        }

        return static_cast<int>(total % MOD);
    }
};
