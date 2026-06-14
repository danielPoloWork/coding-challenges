// LeetCode 2130 - Maximum Twin Sum of a Linked List
// Runtime extreme: copy values into a fixed local array, then scan contiguously.
//
// This spends O(n) extra memory to reduce pointer work. The list is traversed
// once, values are packed into cache-friendly storage, and twin sums are computed
// with simple index arithmetic. On LeetCode's coarse timer this is the variant
// most likely to report 0 ms.

/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    int pairSum(ListNode* head) {
        int values[100000];
        int n = 0;

        for (ListNode* node = head; node != nullptr; node = node->next) {
            values[n++] = node->val;
        }

        int best = 0;

        for (int left = 0, right = n - 1; left < right; ++left, --right) {
            const int sum = values[left] + values[right];
            if (sum > best) {
                best = sum;
            }
        }

        return best;
    }
};
