# Complexity - LeetCode 2130: Maximum Twin Sum of a Linked List (C proposal)

## Memory extreme - `solution-memory.c`

### Time Complexity

```text
O(n)
```

The midpoint pass, second-half reversal, and pair scan are linear.

### Space Complexity

```text
O(1) extra
```

The algorithm stores only local pointers and one integer accumulator. It performs
no heap allocation and uses no auxiliary value buffer.

## Variables

- `n`: number of nodes in the linked list.

## See Also

Balanced (`solution.cpp`, O(n) / O(1) extra) and runtime-target
(`solution-runtime.cpp`, O(n) / O(n)) proposals are in
`../../cpp/2130-maximum-twin-sum-of-a-linked-list/`.
