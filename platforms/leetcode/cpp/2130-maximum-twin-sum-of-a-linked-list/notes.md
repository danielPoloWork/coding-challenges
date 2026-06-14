# Notes - LeetCode 2130: Maximum Twin Sum of a Linked List (C++ proposals)

## Problem Summary

Given an even-length singly linked list, pair node `i` with node `n - 1 - i`
for the first half of the list and return the maximum pair sum.

For example, `[5, 4, 2, 1]` has twin pairs `(5, 1)` and `(4, 2)`, so the answer
is `6`.

## Proposals in This Folder (C++)

This folder holds the **balanced** and **runtime-target** C++ proposals. The
minimum-memory proposal is implemented in C - see [See Also](#see-also).

- **Recommended (`solution.cpp`) - balanced:** find the midpoint with fast/slow
  pointers, reverse the second half in place, then scan both halves together.
  It is the canonical `O(n)` / `O(1)` linked-list solution.
- **Runtime extreme (`solution-runtime.cpp`) - 0 ms target:** copy values into a
  fixed local `int[100000]`, then compute twin sums with two indices. This uses
  `O(n)` extra memory, but it performs one list traversal and then a
  cache-friendly contiguous scan with no heap allocation.

The C memory extreme targets the low-MB scoreboard by avoiding C++ runtime/STL
baseline costs.

## Language Choice (per proposal)

### Recommended balanced - C++

Candidate languages considered:

- C++: selected. LeetCode's `ListNode*` signature is direct, pointer rewiring is
  cheap, helper functions inline well, and there is no GC or interpreter
  overhead.
- C: considered for lower baseline memory. It is excellent for the memory
  champion, but C++ is clearer for the default LeetCode class submission.
- Rust: considered for native performance, but ownership around platform-owned
  linked nodes adds ceremony without improving the asymptotic profile.
- Go: considered for compiled pointer traversal, but runtime and write-barrier
  overhead are not useful here.
- Java / C#: considered for JIT performance, but managed object/runtime overhead
  is less attractive for a pointer-heavy linked-list problem.
- Python / JavaScript / TypeScript / PHP: considered for simplicity, but VM or
  interpreter overhead loses on top-percentile performance at `n <= 1e5`.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: best balance of native speed, `O(1)` auxiliary
  memory, and readable direct mutation of LeetCode nodes.
- Why the main alternatives lose: C is reserved for the memory champion; managed
  and interpreted languages pay unnecessary runtime overhead.

### Runtime extreme - C++

Candidate languages considered:

- C++: selected. A fixed local array avoids heap allocation, packs values
  contiguously, and keeps the second phase as tight index arithmetic.
- C: considered and also viable, but C++ keeps the same LeetCode class surface
  while giving equivalent optimized machine code for the hot loops.
- Rust: considered for native performance, but the fixed-array/list conversion
  is less ergonomic under LeetCode's linked-list ownership model.
- Go: considered for compiled loops; bounds checks and runtime overhead are less
  attractive than C++ fixed-array indexing.
- Java / C#: considered for strong JIT loops, but array/object/runtime baseline
  is higher and less predictable on the memory scoreboard.
- Python / JavaScript / TypeScript / PHP: considered, but interpreter/VM overhead
  cannot compete with native fixed-array loops.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: it turns the expensive part into one linked-list
  traversal plus a contiguous scan, with no `vector` growth and no heap
  allocation.
- Why the main alternatives lose: C is not faster enough to justify a separate
  runtime folder, while VM languages lose constant factors.

## Constraints

- `n` is even.
- `2 <= n <= 1e5`.
- `1 <= Node.val <= 1e5`.
- Maximum possible twin sum is `2e5`, so `int` is safe.

The size bound makes `O(n)` mandatory. Because the input is a singly linked
list, twin pairing requires either reversing one half or storing values.

## Key Observations

- Twin pairs always connect the first half with the second half in reverse
  order.
- Fast/slow pointers find the midpoint without computing the length.
- Reversing the second half converts twin order into two synchronized forward
  scans.
- For raw runtime, copying values once can beat pointer rewiring because the
  second phase becomes contiguous memory access.

## Final Approaches

### Balanced - `solution.cpp`

1. Move `slow` one step and `fast` two steps until `slow` reaches the second
   half.
2. Reverse the list segment starting at `slow`.
3. Walk `head` and the reversed second half together.
4. Track the largest `first->val + second->val`.

### Runtime extreme - `solution-runtime.cpp`

1. Store every node value into a fixed local array of size `100000`.
2. Use `left = 0` and `right = n - 1`.
3. Move inward while updating the maximum twin sum.

This is the submission to try when chasing a `0 ms` LeetCode result. It spends
extra memory deliberately to reduce pointer work and branchy list mutation.

## Why These Approaches

- Balanced is the best default: `O(n)` time, `O(1)` extra memory, clear linked
  list reasoning.
- Runtime extreme is less memory-frugal but can score better on LeetCode's
  coarse timer because array indexing is cheaper than repeated pointer rewiring.
- Memory extreme belongs in C, where the same allocation-free linked-list
  algorithm has a smaller language baseline.

## Top 1% Performance Strategy

- Balanced: no heap allocation, no stack/vector, one in-place half reversal, one
  comparison pass.
- Runtime: one list traversal, fixed local array, no `vector`, no heap allocation,
  contiguous index scan.
- Both avoid recursion and repeated length computation.

## Edge Cases

- `n = 2`: one twin pair is evaluated.
- All twin sums equal: the max remains that shared sum.
- Maximum values: `100000 + 100000 = 200000`, safely inside `int`.
- Long list of `1e5` nodes: both proposals remain linear.

## Alternatives

- First-half fused reversal: theoretically saves a half traversal, but in actual
  LeetCode submissions it can benchmark worse because the hot loop does more
  pointer rewiring while chasing `fast`.
- `std::vector<int>` with `reserve`: good runtime approach, but the fixed array
  removes heap allocation and capacity bookkeeping.
- Stack of first-half values: correct, but it still allocates and has container
  overhead.
- Recursive pairing: uses `O(n)` call stack and risks depth issues at `1e5`.

## See Also

Memory extreme (C, in-place second-half reversal, O(n) time / O(1) extra space):
`../../c/2130-maximum-twin-sum-of-a-linked-list/solution-memory.c`.
