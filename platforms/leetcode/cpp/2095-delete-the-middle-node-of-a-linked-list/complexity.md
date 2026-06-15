# Complexity - LeetCode 2095: Delete the Middle Node of a Linked List (C++ proposal)

## Recommended - `solution.cpp` (fast-slow predecessor tracking)

### Time Complexity

```text
O(n)
```

The loop advances `slow` one node and `fast` two nodes until `fast` reaches the
end. This performs one forward traversal, visiting half the nodes with `slow` and
probing the rest through `fast`, which is linear in the list length.

### Space Complexity

```text
O(1) auxiliary
```

The algorithm stores only `prev`, `slow`, and `fast`. It does not allocate an
array, stack, vector, or recursion frames.

## Speed Extreme

Coincides with `solution.cpp`. On a singly linked list, an exact algorithm must
advance far enough to distinguish length `n` from `n + 1` and identify
`floor(n / 2)`, so `Omega(n)` time is unavoidable. The shipped C++ solution meets
that lower bound in one pass with constant auxiliary memory.

## Memory Extreme

The minimum-memory proposal is implemented in C:
`../../c/2095-delete-the-middle-node-of-a-linked-list/solution-memory.c`.

It has the same algorithmic complexity:

```text
Time:  O(n)
Space: O(1) auxiliary
```

The reason for the separate C folder is language/runtime baseline, not a different
asymptotic algorithm.

## Variables

- `n`: number of nodes in the linked list.
- `slow`: pointer that lands on index `floor(n / 2)`.
- `fast`: pointer that moves twice as fast to determine when the middle is reached.
- `prev`: predecessor of `slow`, needed to unlink the middle node.

## Top 1% Performance Strategy

- Use the fast/slow pointer lower-bound traversal instead of a length pass plus a
  second walk.
- Keep the predecessor during the same loop, so deletion is one pointer write.
- Avoid all dynamic allocation and recursion.
- Do not copy node values; preserve the original list nodes except for the removed
  link.

## Optimization Opportunities

No asymptotic improvement remains for the stated singly linked-list model. Removing
the defensive `head == nullptr` check would not matter under LeetCode's constraints
and would make the solution less robust outside the judge.
