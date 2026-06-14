# Notes - LeetCode 2130: Maximum Twin Sum of a Linked List (C proposal)

## Problem Summary

Given an even-length singly linked list, pair node `i` with node `n - 1 - i`
for the first half of the list and return the maximum pair sum.

## Proposal in This Folder (C)

This folder holds the **minimum-memory** proposal. The balanced and runtime
proposals are in C++ - see [See Also](#see-also).

- **Memory extreme (`solution-memory.c`) - 7 MB target:** find the midpoint,
  reverse the second half in place, and compare the two halves. The algorithm
  allocates nothing and uses only a fixed number of pointers.

The `7 MB` target is a LeetCode scoreboard target, not a deterministic local
guarantee. Reported memory includes judge/runtime/input overhead and varies by
language runner and submission batch. C is the best practical language choice in
this repository when the goal is the smallest reported baseline.

## Language Choice (C)

Candidate languages considered:

- C++: used for the balanced and runtime proposals. It is fast, but its standard
  runner/STL baseline often reports higher memory on LeetCode linked-list
  problems.
- C: selected. The submission has no STL, no heap allocation, no object runtime,
  and direct access to `struct ListNode*`.
- Rust: considered for native performance and memory safety, but LeetCode's
  linked-list ownership model adds ceremony without reducing the reported
  baseline below C.
- Go: considered for compiled loops, but runtime/GC baseline is not ideal for
  the memory scoreboard.
- Java / C#: considered for JIT speed, but managed runtime and object layout
  overhead are not competitive for low-MB reporting.
- Python / JavaScript / TypeScript / PHP: considered only for simplicity; VM or
  interpreter memory baselines are much higher.

Chosen language:

- Selected: C.
- Why it wins for this proposal: it gives the smallest practical language
  baseline and the algorithm itself performs zero auxiliary allocation.
- Why the main alternatives lose: C++ is kept for the default/runtime variants;
  managed and interpreted languages cannot compete on reported MB.

## Constraints

- `n` is even.
- `2 <= n <= 1e5`.
- `1 <= Node.val <= 1e5`.
- Maximum possible twin sum is `2e5`, so `int` is safe.

## Key Observations

- Twin pairs are first-half nodes matched against the second half in reverse.
- Reversing the second half in place gives that order with no buffer.
- C pointer rewiring keeps the memory footprint to a few local variables.

## Final Approach

1. Use fast/slow pointers to move `slow` to the start of the second half.
2. Reverse the second half in place.
3. Walk `head` and the reversed second half together.
4. Track the maximum pair sum.

## Why This Approach

This is the same memory shape as the best linked-list algorithm, but submitted in
the lowest-baseline practical language. A stack/vector/raw-array solution can be
fast, but any value buffer is the wrong trade-off for memory-score chasing.

## Top 1% Memory Strategy

- No heap allocation.
- No auxiliary array or stack.
- No recursion.
- No C++ STL/runtime baseline.
- Only local pointers and one integer accumulator.

## Edge Cases

- `n = 2`: the second half is one node and one pair is evaluated.
- Equal values and equal twin sums are handled naturally.
- Maximum values are safe in `int`.
- `n = 1e5` remains linear with constant auxiliary memory.

## See Also

Balanced C++ (`solution.cpp`) and runtime-target C++ (`solution-runtime.cpp`) are
in `../../cpp/2130-maximum-twin-sum-of-a-linked-list/`.
