# Notes - LeetCode 217: Contains Duplicate

## Problem Summary

Given an integer array `nums`, return `true` if any value appears at least twice,
and `false` if every element is distinct.

## Recommended Solution (runtime-first, memory-lean)

`solution.cpp` is the default recommendation: an **in-place `std::sort` + adjacent scan**.

There is no single algorithm that is both asymptotically fastest (O(n)) and minimal
memory (O(1)) for this problem - that is a real time-space tradeoff. But at the given
constraints (n <= 1e5) the practical wall-clock time of sorting and of a hash set is a
tie (both well under a millisecond; both report ~0 ms on the judge), while sorting needs
no auxiliary table. So sorting in place gives hash-set-level speed *in practice* at O(1)
extra memory - the best fast-and-lean point for this problem.

`std::sort` is used rather than C's `qsort` on purpose: its comparator is inlined and it
runs introsort, so it is markedly faster than a `qsort` call through a function pointer,
while still sorting in place.

Switch to `solution-runtime.cpp` (hash set) only when a duplicate is expected early (its
early exit then wins decisively) or when n grows large enough that O(n) vs O(n log n)
genuinely separates.

## Why Two Extreme Variants

The objective of this repository is to surface, per problem, the implementation that
minimizes runtime **and** the one that minimizes memory. For this problem those two
goals do not collapse onto the same code - they sit at opposite ends of the classic
time-space tradeoff:

- **Fastest runtime** -> remember every value already seen in a hash set and stop at
  the first repeat. Spends O(n) memory to buy O(n) time.
- **Least memory** -> sort the array in place so equal values become adjacent, then
  scan. Spends O(n log n) time to drop extra memory to O(1).

Because the two endpoints are genuinely different algorithms, both are kept as
documented extremes, each the champion of its metric, alongside the recommended
`solution.cpp`. File names use an extended convention: `solution.cpp` (recommended),
`solution-runtime.cpp` (asymptotic speed), and `solution-memory.c` (minimum memory).

## Constraints

- `1 <= nums.length <= 1e5`
- `-1e9 <= nums[i] <= 1e9`

The value range is the decisive constraint: with ~2x10^9 possible values, a direct
counting array or bitset would need ~250 MB, so the cheap "index by value" trick is
off the table. That forces the choice toward hashing (for speed) or sorting (for memory).

## Language Choice (per objective)

There is no repository-wide default language; each variant picks the most performant
option for its metric.

**Fastest runtime -> C++.** Native code with no GC pauses and no interpreter/JIT
startup, plus enough control to hand-roll a *flat* open-addressing hash set. A flat
table keeps all slots in two contiguous arrays, which is far more cache-friendly than
`std::unordered_set`'s node-per-element layout and avoids per-insert heap allocation.
Combined with an early return on the first collision, this is the top-1% runtime
approach. (C would tie on raw speed, but C++ gives a cleaner `vector`-backed table.)

**Least memory -> C.** Among the allowed languages, C has the smallest runtime/stdlib
baseline, which directly lowers the reported peak memory. Manual control lets us sort
the caller's array in place with `qsort` and allocate nothing. (C++'s `std::sort` is
equally fast, but libstdc++'s baseline footprint is marginally higher than C's.)

## Key Observations

1. "Does a duplicate exist?" needs no counts and no positions - only the existence of
   one repeat, which enables an early exit.
2. The huge value range blocks counting-array tricks, leaving hashing vs sorting as the
   two viable strategies.
3. Those two strategies are exactly the opposite corners of the time-space tradeoff,
   which is why this problem is a clean illustration of the repository's thesis.

## Reasoning Process

1. Brute force compares all pairs: O(n^2). At n = 10^5 that is ~10^10 operations - far
   too slow.
2. To beat O(n^2) we must either (a) make lookups O(1) -> hash set, or (b) make equal
   values adjacent -> sort.
3. The value range rules out O(1) lookups via a counting array, so a hash set is the
   path to O(1) lookups; sorting is the path to O(1) memory.
4. Each path is then implemented in the language whose runtime characteristics best
   serve that path's metric.

## Final Approach

**Runtime variant (`solution-runtime.cpp`):** size a power-of-two table to keep the
load factor <= 0.5; hash each value with a Murmur3-style finalizer (so masking the low
bits stays well distributed); linear-probe; return `true` on the first equal key found,
insert otherwise.

**Memory variant (`solution-memory.c`):** `qsort` in place with an overflow-safe
comparator (`(x>y)-(x<y)` avoids `x-y` wrap-around for values near +/-1e9), then a
single linear scan comparing each element to its predecessor.

## Why This Approach

- vs **brute force O(n^2)**: infeasible at the input limit.
- vs **`std::set` (balanced BST)**: O(n log n) time *and* O(n) memory - dominated on
  both axes by the two champions.
- vs **`std::unordered_set`**: correct and O(n) average, but higher constant factors
  (node allocation, pointer chasing) than a flat table; the hand-rolled set targets
  top-1% runtime.
- The memory variant accepts O(n log n) time as the price of O(1) extra space - the
  right call whenever memory is the binding constraint.

## Top 1% Performance Strategy

- **Runtime:** contiguous flat hash table (cache locality), strong bit-mixing finalizer
  (few probe collisions), load factor <= 0.5, and early exit on the first duplicate.
- **Memory:** zero auxiliary allocation (in-place sort), overflow-safe comparator, and
  a single adjacency scan.

## Edge Cases

- `n < 2` -> `false` (handled explicitly in both variants).
- All elements equal -> the runtime variant exits on the second element.
- All distinct -> both variants do full work; this is the runtime variant's worst case
  for table fills.
- Negative values and `INT_MIN`/`INT_MAX` -> the hash uses an unsigned cast (well
  defined); the comparator avoids signed overflow.

## Alternatives

- **Counting array / bitset:** near-O(1) per op, but ~250 MB for the value range -
  rejected.
- **`std::sort` in C++ for the memory variant:** equally fast, slightly larger baseline
  footprint than C - a fine middle ground, but not the *memory* champion.
- **Probabilistic (Bloom filter):** sublinear memory but false positives require a
  verification pass - unnecessary complexity for these limits.
