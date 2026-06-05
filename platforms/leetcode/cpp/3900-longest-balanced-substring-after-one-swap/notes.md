# Notes - LeetCode 3900: Longest Balanced Substring After One Swap (C++ proposals)

## Problem Summary

Given a binary string `s`, perform at most one swap between any two positions, then pick
a contiguous substring with the same number of `0`s and `1`s. Return the maximum possible
substring length. The empty substring is allowed, so all-one or all-zero inputs return `0`.

## Proposals in This Folder (C++)

- **Recommended (`solution.cpp`) - fast + lean:** prefix-balance buckets plus monotone
  per-balance pointers. It runs in O(n), avoids hashing, and keeps the implementation
  readable while staying close to the fastest version.
- **Speed extreme (`solution-runtime.cpp`):** the same O(n) mathematics, but implemented
  with intrusive queues over flat arrays. It removes `vector<vector<int>>` bucket overhead
  and lazily expires each prefix index at most once.
- **Memory extreme (`solution-memory.cpp`):** one `vector<pair<int,int>>` of prefix
  `(balance, index)` values sorted in place. It keeps the auxiliary structure smaller than
  the queue-based variants, at the cost of O(n log n) sorting time.

## Language Choice (C++)

C++ is the strongest fit for all three objectives here. The input is only `1e5`, but top
runtime depends on branch-light linear scans and contiguous integer arrays; C++ provides
that without VM, interpreter, or garbage-collector overhead. For the memory proposal,
`std::sort` is inlined and sorts the prefix pair vector in place, giving a lower auxiliary
footprint than hash maps, tree maps, or high-level list structures.

## Constraints

- `1 <= s.length <= 1e5`
- `s[i]` is either `'0'` or `'1'`
- The answer is at most `2 * min(total0, total1)`.

## Key Observations

- Let prefix balance be `#1 - #0`. A substring is already balanced when its balance is `0`.
- One useful swap must exchange one character inside the chosen substring with one outside
  it. That changes the substring balance by exactly `2` or `-2`.
- Therefore every candidate substring has original balance `0`, `+2`, or `-2`.
- A `+2` substring needs a zero outside it. If its length is `L`, it uses `(L - 2) / 2`
  zeros, so this is equivalent to `L <= 2 * total0`.
- A `-2` substring symmetrically needs `L <= 2 * total1`.

## Reasoning Process

The direct brute force is to try every swap, then every substring, and count zeros and
ones. That is far beyond `1e5`.

The important reduction is to stop simulating swaps. For any fixed selected window, only
one position can cross the window boundary during a useful swap. That changes the window's
number of zeros by one and its number of ones by one in the opposite direction, so the
balance changes by two. Prefix sums then make the three possible balances searchable:

1. Same prefix balance -> already balanced.
2. Earlier prefix balance `current - 2` -> window balance `+2`, fixable only with a zero
   outside.
3. Earlier prefix balance `current + 2` -> window balance `-2`, fixable only with a one
   outside.

The outside-character checks become length caps, so the optimized variants only need the
earliest valid prefix index for each queried balance.

## Final Approaches

### Recommended - `solution.cpp`

1. Count totals and build prefix balances.
2. Store every prefix index in a bucket keyed by balance. The balance range is fixed:
   `[-n, n]`, so arrays beat hash maps.
3. For balance `0`, use the first index in the same-balance bucket.
4. For balance `+2` and `-2`, use a monotone pointer per bucket to skip prefix starts
   that would make the window exceed the outside-character cap.
5. Stop early if the global upper bound is reached.

### Speed Extreme - `solution-runtime.cpp`

1. Count totals first.
2. Scan prefixes once.
3. Link each prefix index into flat per-balance queues for the two repair caps.
4. Lazily expire stale starts from only the queried queues.
5. Avoid vector buckets, lower bounds, hashing, and repeated allocation.

### Memory Extreme - `solution-memory.cpp`

1. Store only `(balance, index)` prefix pairs.
2. Sort them in place by balance, then by index.
3. Equal-balance groups give no-swap balanced windows.
4. Groups whose balance differs by `2` are paired with two pointers to enforce the length
   cap in either direction.

## Why These Approaches

The recommended and runtime variants are both linear, which is the right asymptotic target
for top execution time at `n = 1e5`. The recommended version is easier to audit and still
uses array-indexed buckets instead of hash maps. The runtime version is more specialized:
it trades a little more implementation complexity for lower constant factors.

The memory variant is useful when reported memory matters more than the last unit of
runtime. It keeps one compact prefix vector and sorts it, avoiding several large auxiliary
arrays and bucket headers.

## Top 1% Performance Strategy

- Use C++ and contiguous integer storage.
- Replace hash maps with direct balance-offset arrays.
- Convert outside-character checks into simple length caps.
- Use monotone pointers / queues so each prefix index is skipped at most once.
- Return immediately when the theoretical upper bound `2 * min(total0, total1)` is found.

## Edge Cases

- All zeros or all ones -> no non-empty balanced substring, return `0`.
- Length one -> return `0`.
- Already globally balanced -> the full string is found by the balance-0 case.
- A repairable window that consumes all needed outside characters is rejected by the cap.
- Windows starting at index `0` are handled by prefix index `0`.

## Alternatives

- Trying all swaps is O(n^3) or worse after substring selection and is infeasible.
- Hash maps of prefix positions are accepted but slower and heavier than offset arrays
  because the balance range is only `2n + 1`.
- Binary searching in each prefix bucket is simpler, but monotone pointers give the same
  result in linear time.

## See Also

All proposals for this challenge are in this C++ folder.
