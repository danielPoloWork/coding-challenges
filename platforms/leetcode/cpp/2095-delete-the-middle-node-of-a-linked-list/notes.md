# Notes - LeetCode 2095: Delete the Middle Node of a Linked List (C++ proposal)

## Problem Summary

Given the head of a singly linked list with `n` nodes, remove the node at index
`floor(n / 2)` using 0-based indexing and return the possibly changed head.

For `n = 1`, the only node is the middle node, so the result is an empty list.
For even lengths, the deleted node is the second of the two central positions:
`[1, 2, 3, 4]` deletes `3`.

## Proposals in This Folder (C++)

This folder holds the **recommended** C++ proposal. It is also the fastest-runtime
proposal for this challenge.

- **Recommended (`solution.cpp`) - fast + lean:** use fast/slow pointers and keep
  the predecessor of `slow`. When `fast` finishes, `slow` is the middle node and
  `prev->next = slow->next` unlinks it. `O(n)` time, `O(1)` auxiliary space.
- **Speed extreme:** coincides with `solution.cpp`. A correct algorithm must identify
  the middle position, so it has an `Omega(n)` traversal lower bound on a singly
  linked list. This implementation reaches that bound in one pass and allocates
  nothing.
- **Memory extreme:** implemented in C at
  `../../c/2095-delete-the-middle-node-of-a-linked-list/solution-memory.c`. The
  algorithm is the same `O(1)` pointer strategy, but C has the lowest practical
  LeetCode language/runtime baseline for memory-score chasing.

There is no separate `solution-runtime.cpp` because it would duplicate the same
non-dominated C++ implementation.

## Language Choice (C++)

Candidate languages considered:

- **C++:** Selected for the recommended/runtime proposal. LeetCode's canonical
  linked-list signature is direct, pointer rewiring compiles to a tiny native loop,
  and the solution uses only three local pointers.
- **C:** Considered and used for the memory champion. For raw runtime it offers no
  meaningful algorithmic or constant-factor win over C++ here, while C++ keeps the
  common class-based submission surface.
- **Rust:** Considered for native performance and safety, but LeetCode's
  platform-owned linked-list nodes make the implementation more ceremony-heavy
  without improving runtime or auxiliary memory.
- **Go:** Considered for compiled pointer traversal, but runtime and GC metadata are
  unnecessary for a single pointer-rewiring pass.
- **Java / C#:** Considered for JIT performance, but managed object/runtime overhead
  is less attractive than native pointer traversal for a top-percentile linked-list
  submission.
- **Python / JavaScript / TypeScript / PHP:** Correct and concise, but VM or
  interpreter overhead is dominated by native C++ on `n <= 100000`.

Chosen language:

- **Selected:** C++.
- **Why it wins for this proposal:** It gives the best practical LeetCode runtime
  for direct node traversal while preserving constant auxiliary memory and readable
  pointer updates.
- **Why the main alternatives lose:** C is reserved for the minimum-memory baseline;
  Rust/Go/managed runtimes add overhead or ceremony without changing the optimal
  one-pass algorithm; interpreted languages lose constant factors.

## Constraints

- `1 <= n <= 100000`.
- `1 <= Node.val <= 100000`.
- The input is a singly linked list, so there is no backward pointer from the
  middle node to its predecessor.
- Node values do not affect the algorithm; only list length and links matter.

The size bound makes recursion unattractive and makes an `O(n)` iterative traversal
the natural target.

## Key Observations

1. The middle index is `floor(n / 2)`.
2. If one pointer moves two steps for every one step of another pointer, the slow
   pointer reaches the middle when the fast pointer reaches the end.
3. To delete a singly linked-list node, we need the node before it, not only the
   node itself.
4. The `n = 1` case is special because deleting the head leaves no predecessor and
   the answer is `nullptr`.

## Reasoning Process

A direct two-pass solution first counts nodes, computes `floor(n / 2)`, then walks
again to the predecessor of that index. This is correct and still `O(1)` memory,
but it performs more pointer chasing than needed.

The faster linked-list technique is to derive the middle during traversal. Start
`slow` and `fast` at the head. Each iteration moves `slow` one node and `fast` two
nodes. After `k` iterations, `slow` is at index `k` and `fast` is at index `2k`.
The loop stops after exactly `floor(n / 2)` slow moves, so `slow` is the node to
remove. Keeping `prev` as the previous `slow` gives the link to rewrite.

## Final Approach

1. If the list has zero or one node, return `nullptr`.
2. Initialize `prev = nullptr`, `slow = head`, and `fast = head`.
3. While `fast` and `fast->next` exist:
   - set `prev = slow`;
   - move `slow` one node;
   - move `fast` two nodes.
4. Unlink the middle node with `prev->next = slow->next`.
5. Return the original `head`.

## Why This Approach

The algorithm reaches the singly linked-list lower bound: it learns the middle
position during one forward traversal and does not store node values, arrays, or a
stack. It also handles odd and even lengths with the same loop condition: for even
`n`, `slow` lands on the second central node, exactly `floor(n / 2)`.

The C memory proposal uses the same pointer idea in a lower-baseline language, but
there is no faster asymptotic strategy than the C++ one-pass version.

## Top 1% Performance Strategy

- One traversal of the list, no preliminary length pass.
- No heap allocation and no auxiliary container.
- No recursion, avoiding `O(n)` call stack risk at `100000` nodes.
- Direct pointer rewiring instead of copying values between nodes.
- Only one special-case branch before the hot loop.

## Edge Cases

- `n = 1`: return `nullptr`.
- `n = 2`: one loop iteration deletes the second node.
- Odd length: `[1, 3, 4, 7, 1, 2, 6]` deletes index `3`.
- Even length: `[1, 2, 3, 4]` deletes index `2`.
- Repeated values: values are irrelevant; deletion is positional.
- `n = 100000`: remains linear and constant-memory.

## Alternatives

- **Two-pass length count:** correct and `O(1)` memory, but it performs up to
  roughly `1.5n` node visits instead of one synchronized pass.
- **Array/vector of node pointers:** makes deletion trivial after indexing, but
  spends `O(n)` memory and extra writes.
- **Stack:** also `O(n)` memory and unnecessary because the predecessor can be kept
  during traversal.
- **Copy next value into middle and skip next:** fails when the middle is the tail
  (`n = 2`) and changes node identity semantics.
- **Recursion:** elegant for counting, but unsafe at the maximum depth and uses
  `O(n)` stack memory.

## See Also

Memory extreme (C, same one-pass pointer strategy, O(n) time / O(1) auxiliary
space): `../../c/2095-delete-the-middle-node-of-a-linked-list/solution-memory.c`.
