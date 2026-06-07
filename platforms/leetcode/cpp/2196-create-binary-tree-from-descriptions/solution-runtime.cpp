// LeetCode 2196 - Create Binary Tree From Descriptions
// Speed extreme: fixed direct-address tables over the full value constraint.
//
// This avoids the preliminary max scan and dynamic table sizing. It spends the
// full 1..100000 address space to keep the hot path to pointer checks, node
// creation, child assignment, and one child mark.

#include <array>
#include <bitset>
#include <vector>
using namespace std;

/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    TreeNode* createBinaryTree(vector<vector<int>>& descriptions) {
        static constexpr int kMaxValue = 100000;

        array<TreeNode*, kMaxValue + 1> nodes{};
        bitset<kMaxValue + 1> isChild;

        for (const vector<int>& description : descriptions) {
            const int parentValue = description[0];
            const int childValue = description[1];

            TreeNode*& parent = nodes[parentValue];
            if (parent == nullptr) parent = new TreeNode(parentValue);

            TreeNode*& child = nodes[childValue];
            if (child == nullptr) child = new TreeNode(childValue);

            if (description[2] == 1) {
                parent->left = child;
            } else {
                parent->right = child;
            }
            isChild.set(childValue);
        }

        for (const vector<int>& description : descriptions) {
            const int parentValue = description[0];
            if (!isChild.test(parentValue)) return nodes[parentValue];
        }

        return nullptr;
    }
};
