# Complexity - LeetCode 2095: Delete the Middle Node of a Linked List (C proposal)

## Memory extreme - `solution-memory.c`

### Time Complexity

```text
O(n)
```

The fast/slow traversal advances through the linked list once.

### Space Complexity

```text
O(1) auxiliary
```

The solution stores only `prev`, `slow`, and `fast`. It allocates no auxiliary
buffer and uses no recursion.

## Variables

- `n`: number of nodes in the linked list.
- `prev`: predecessor of the node being deleted.
- `slow`: pointer that lands on index `floor(n / 2)`.
- `fast`: pointer that advances two nodes per loop.

## Top 1% Memory Strategy

- Keep the algorithm allocation-free.
- Use the C runner baseline for the memory objective.
- Avoid copying node values or storing node addresses.
- Delete by relinking, not by rebuilding the list.

## See Also

Recommended and runtime-optimal C++ proposal:
`../../cpp/2095-delete-the-middle-node-of-a-linked-list/solution.cpp`.
