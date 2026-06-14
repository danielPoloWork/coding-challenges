// LeetCode 2130 - Maximum Twin Sum of a Linked List
// Memory extreme: C, in-place second-half reversal, O(1) extra memory.
//
// The C submission has the smallest language/runtime baseline among the allowed
// practical LeetCode choices here, which is the best shot at the low-MB memory
// scoreboard. The algorithm itself allocates nothing.

/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */
int pairSum(struct ListNode* head) {
    struct ListNode* slow = head;
    struct ListNode* fast = head;

    while (fast != 0 && fast->next != 0) {
        slow = slow->next;
        fast = fast->next->next;
    }

    struct ListNode* prev = 0;
    struct ListNode* node = slow;

    while (node != 0) {
        struct ListNode* next = node->next;
        node->next = prev;
        prev = node;
        node = next;
    }

    int best = 0;
    struct ListNode* first = head;

    while (prev != 0) {
        const int sum = first->val + prev->val;
        if (sum > best) {
            best = sum;
        }

        first = first->next;
        prev = prev->next;
    }

    return best;
}
