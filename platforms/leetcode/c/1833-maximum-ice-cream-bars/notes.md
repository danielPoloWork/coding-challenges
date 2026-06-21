# Notes - LeetCode 1833: Maximum Ice Cream Bars (C proposal)

## Problem Summary

Given prices for ice cream bars and a coin budget, return the maximum number of bars that can
be bought. The bars may be bought in any order, and the problem requires a counting-sort based
solution.

## Proposal in This Folder (C)

This folder holds the **memory extreme**.

- **Memory extreme (`solution-memory.c`):** first find the largest price that is initially
  affordable, allocate a frequency table only through that price, count affordable bars, and
  sweep the capped domain from cheapest to most expensive.

The recommended and fastest-runtime proposal is in C++ at
`../../cpp/1833-maximum-ice-cream-bars/solution.cpp`.

## Language Choice (memory extreme)

Candidate languages considered:

- C++: strong default choice, but `vector<int>` adds a small container baseline and the C++
  proposal intentionally keeps a fixed 100001-counter table for speed.
- C: selected. It uses a single `calloc` block sized exactly to the affordable counting domain
  and has the smallest runtime/stdlib baseline among the practical LeetCode choices.
- Rust: native memory control is good, but allocation and bounds-checked indexing do not reduce
  the footprint below the direct C buffer.
- Go: slices are simple, but the runtime and GC baseline are larger than C for a memory target.
- Java / C#: primitive arrays are compact enough for acceptance, but managed-runtime overhead
  is larger than C's single heap block.
- Python / JavaScript / TypeScript / PHP: numeric containers are object-heavy or VM-heavy and
  are dominated for a memory-extreme proposal.

Chosen language:

- Selected: C.
- Why it wins for this proposal: the only required auxiliary state is one zeroed frequency
  buffer, and C expresses that as one raw allocation with no container or managed-runtime
  overhead.
- Why the main alternatives lose: C++ is better for the recommended runtime path, but C keeps
  the capped memory variant closer to the theoretical counting-table footprint.

## Constraints

- `1 <= n == costs.length <= 100000`.
- `1 <= costs[i] <= 100000`.
- `1 <= coins <= 100000000`.
- Counting sort is mandatory for this challenge.

## Key Observations

1. The optimal answer buys prices in nondecreasing order.
2. Any price above the initial coin budget is impossible to buy, because the budget only
   decreases.
3. Therefore a memory-focused counting sort does not need counters above the largest initially
   affordable price.
4. Once the sweep reaches a price larger than the remaining budget, no later bucket can help.

## Reasoning Process

The ordinary counting-sort solution allocates one counter per possible price up to `100000`.
That is already small, but the memory objective asks for the leanest useful domain. Since no
price greater than the initial budget can ever be bought, the algorithm first scans the input
to find `A`, the largest `costs[i] <= coins`. If no such price exists, the answer is `0` and no
frequency table is allocated.

Then it allocates `A + 1` counters, counts all prices in that capped domain, and performs the
same greedy cheapest-first bucket sweep as the recommended solution.

## Final Approach

1. Scan `costs` and compute `maxAffordable = max(costs[i])` over costs `<= coins`.
2. Return `0` if no bar is initially affordable.
3. Allocate `maxAffordable + 1` zeroed counters with `calloc`.
4. Count every cost `<= maxAffordable`.
5. Sweep prices from `1` while `coins >= price`.
6. Buy a whole bucket or the affordable prefix of that bucket.
7. Free the frequency buffer and return the count.

## Why This Approach

It preserves the required counting-sort strategy while reducing memory whenever the affordable
price range is below the global constraint. The extra input scan is the deliberate trade-off:
it spends more runtime setup to avoid a full fixed-domain table.

## Top 1% Performance Strategy

- Keep the algorithm linear in the input plus the useful price domain.
- Avoid ordered maps, heaps, and comparison sorting.
- Count only prices that can possibly be part of the answer.
- Consume whole buckets rather than iterating one bar at a time.
- Use one contiguous C allocation and free it immediately after the sweep.

## Edge Cases

- No affordable bar: returns `0` without allocating counters.
- All bars affordable: the capped domain is the maximum input cost and all buckets are consumed.
- Duplicates: handled by one counter per price.
- Initial `coins > 100000`: the cap naturally becomes the maximum input price.
- Single bar: counted and bought only if its price fits the budget.

## See Also

Recommended and speed proposal (C++, fixed-domain counting sort):
`../../cpp/1833-maximum-ice-cream-bars/`.
