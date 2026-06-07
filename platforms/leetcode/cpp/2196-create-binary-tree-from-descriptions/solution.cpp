// LeetCode 2196 - Create Binary Tree From Descriptions
// Recommended solution: direct-address nodes up to the maximum value present.
//
// The values are bounded by 100000, so array indexing beats hashing. This
// version first finds the actual maximum value in the input, keeping the
// direct-address table compact while preserving O(1) lookups.

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
        int maxValue = 0;
        for (const vector<int>& description : descriptions) {
            if (description[0] > maxValue) maxValue = description[0];
            if (description[1] > maxValue) maxValue = description[1];
        }

        vector<TreeNode*> nodes(maxValue + 1, nullptr);
        vector<unsigned char> isChild(maxValue + 1, 0);

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
            isChild[childValue] = 1;
        }

        for (const vector<int>& description : descriptions) {
            const int parentValue = description[0];
            if (isChild[parentValue] == 0) return nodes[parentValue];
        }

        return nullptr;
    }
};
