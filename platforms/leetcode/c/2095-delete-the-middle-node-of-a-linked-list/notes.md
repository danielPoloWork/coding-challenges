# Notes - LeetCode 2095: Delete the Middle Node of a Linked List (C proposal)

## Problem Summary

Given a singly linked list, delete the node at index `floor(n / 2)` and return
the head of the modified list. If the list has one node, deleting the middle
returns an empty list.

## Proposal in This Folder (C)

This folder holds the **minimum-memory** proposal. The recommended and runtime
proposal is in C++ - see [See Also](#see-also).

- **Memory extreme (`solution-memory.c`):** use fast/slow pointers and keep the
  predecessor of `slow`. When `slow` reaches the middle node, rewrite
  `prev->next` to skip it. The algorithm allocates nothing and uses only three
  local node pointers.

Reported LeetCode memory includes runner, language, input, and allocator baseline
effects. C is the best practical language choice in this repository when the
objective is the smallest reported memory footprint for this pointer-only task.

## Language Choice (C)

Candidate languages considered:

- **C++:** Used for the recommended/runtime proposal. It is equally optimal
  algorithmically, but its class/STL runner baseline can report slightly higher
  memory than C on linked-list submissions.
- **C:** Selected. The submission is a plain function over `struct ListNode*`,
  performs no allocation, uses no container library, and keeps only local pointers.
- **Rust:** Considered for native performance and memory safety, but LeetCode's
  linked-list ownership model does not reduce the reported memory baseline below C.
- **Go:** Considered for compiled pointer code, but runtime and GC baseline are a
  weaker fit for memory-score chasing.
- **Java / C#:** Considered for JIT performance, but managed runtime and object
  metadata are not competitive for minimum reported memory.
- **Python / JavaScript / TypeScript / PHP:** Considered for simplicity; VM or
  interpreter memory baselines are much higher.

Chosen language:

- **Selected:** C.
- **Why it wins for this proposal:** It gives the lowest practical language/runtime
  baseline while the algorithm itself remains `O(1)` auxiliary memory.
- **Why the main alternatives lose:** C++ is the best default/runtime submission;
  managed and interpreted languages spend more baseline memory; Rust/Go add
  runtime or wrapper overhead without reducing the pointer count.

## Constraints

- `1 <= n <= 100000`.
- `1 <= Node.val <= 100000`.
- The list is singly linked, so deleting a node requires its predecessor.

## Key Observations

- The middle index is `floor(n / 2)`.
- A fast pointer moving two steps makes a slow pointer moving one step land on the
  middle.
- The only mutation needed is changing the predecessor's `next` link.
- For `n = 1`, there is no predecessor and the result is `NULL`.

## Final Approach

1. Return `0` if the list has zero or one node.
2. Initialize `prev`, `slow`, and `fast` at the start.
3. Move `prev` to `slow`, `slow` one step, and `fast` two steps until `fast`
   reaches the end.
4. Unlink `slow` with `prev->next = slow->next`.
5. Return the original head.

## Why This Approach

The algorithm matches the optimal linked-list memory shape: no value buffer, no
stack, no recursion, and one pointer write. The C implementation keeps that shape
while minimizing language-level overhead.

## Top 1% Memory Strategy

- No heap allocation.
- No auxiliary array, vector, or stack.
- No recursion.
- Plain `struct ListNode*` traversal.
- Same one-pass pointer count as the runtime proposal.

## Edge Cases

- `n = 1`: return `0`.
- `n = 2`: delete the second node.
- Odd and even lengths both land on `floor(n / 2)`.
- Duplicate values do not matter because the deletion is positional.
- `n = 100000`: still linear and constant-memory.

## See Also

Recommended/runtime C++ proposal:
`../../cpp/2095-delete-the-middle-node-of-a-linked-list/solution.cpp`.
