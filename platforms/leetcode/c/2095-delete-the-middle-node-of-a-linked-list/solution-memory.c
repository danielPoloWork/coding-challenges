// LeetCode 2095 - Delete the Middle Node of a Linked List
// Memory extreme: C fast-slow pointers with predecessor tracking.
//
// The algorithm allocates nothing and stores only three node pointers. C is used
// for the smallest practical LeetCode language/runtime baseline on the memory
// scoreboard.

/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */
struct ListNode* deleteMiddle(struct ListNode* head) {
    if (head == 0 || head->next == 0) {
        return 0;
    }

    struct ListNode* prev = 0;
    struct ListNode* slow = head;
    struct ListNode* fast = head;

    while (fast != 0 && fast->next != 0) {
        prev = slow;
        slow = slow->next;
        fast = fast->next->next;
    }

    prev->next = slow->next;
    return head;
}
