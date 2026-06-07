// LeetCode 2196 - Create Binary Tree From Descriptions
// Memory extreme: coordinate-compress values before building the tree.
//
// This avoids allocating a table for every possible value up to 100000. The
// trade-off is sorting and binary-search lookup for each description.

#include <algorithm>
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
        vector<int> values;
        values.reserve(descriptions.size() * 2);
        for (const vector<int>& description : descriptions) {
            values.push_back(description[0]);
            values.push_back(description[1]);
        }

        sort(values.begin(), values.end());
        values.erase(unique(values.begin(), values.end()), values.end());
        values.shrink_to_fit();

        vector<TreeNode*> nodes(values.size(), nullptr);
        vector<unsigned char> isChild(values.size(), 0);

        const auto valueIndex = [&](int value) {
            return static_cast<int>(lower_bound(values.begin(), values.end(), value) - values.begin());
        };

        for (const vector<int>& description : descriptions) {
            const int parentIndex = valueIndex(description[0]);
            const int childIndex = valueIndex(description[1]);

            TreeNode*& parent = nodes[parentIndex];
            if (parent == nullptr) parent = new TreeNode(description[0]);

            TreeNode*& child = nodes[childIndex];
            if (child == nullptr) child = new TreeNode(description[1]);

            if (description[2] == 1) {
                parent->left = child;
            } else {
                parent->right = child;
            }
            isChild[childIndex] = 1;
        }

        for (const vector<int>& description : descriptions) {
            const int parentIndex = valueIndex(description[0]);
            if (isChild[parentIndex] == 0) return nodes[parentIndex];
        }

        return nullptr;
    }
};
