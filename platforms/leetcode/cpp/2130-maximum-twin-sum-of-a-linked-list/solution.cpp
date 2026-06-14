// LeetCode 2130 - Maximum Twin Sum of a Linked List
// Balanced solution: reverse the second half in place, then scan twins.
//
// This keeps the accepted linked-list trick explicit and memory-lean: find the
// midpoint, reverse the tail, then compare the two halves with forward pointers.

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
        ListNode* slow = head;
        ListNode* fast = head;

        while (fast != nullptr && fast->next != nullptr) {
            slow = slow->next;
            fast = fast->next->next;
        }

        ListNode* second = reverseList(slow);
        int best = 0;

        for (ListNode* first = head; second != nullptr; first = first->next, second = second->next) {
            const int sum = first->val + second->val;
            if (sum > best) {
                best = sum;
            }
        }

        return best;
    }

private:
    static ListNode* reverseList(ListNode* node) {
        ListNode* prev = nullptr;

        while (node != nullptr) {
            ListNode* next = node->next;
            node->next = prev;
            prev = node;
            node = next;
        }

        return prev;
    }
};
