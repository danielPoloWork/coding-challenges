# Notes - LeetCode 3664: Two-Letter Card Game (C++ proposal)

## Problem Summary

Given a deck of two-letter cards (letters `'a'..'j'`) and a target letter `x`, repeatedly
remove a *compatible* pair of cards that **both** contain `x`, scoring one point per pair.
Two cards are compatible when their strings differ in **exactly one** position. Return the
maximum points achievable with optimal play.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals (fast + lean / speed extreme / memory extreme)
**unless one solution is best on every axis**, in which case the repo standard says to ship
only the recommended file and explain why (see `docs/challenge-format.md`, "do not add
coincident files"). This problem is exactly that case:

- **Recommended (`solution.cpp`) - fast + lean:** classify the cards in one pass, then scan
  every wildcard split. `O(n)` time, `O(1)` extra space.
- **Speed extreme:** *coincides with the recommended.* Every card must be read at least once
  to know whether it contains `x` and where, so `Omega(n)` is a hard lower bound; the
  recommended hits it with a few char comparisons per card and a post-pass of at most
  `both <= n` constant-time steps. Nothing is asymptotically faster, and the constant factor
  is already minimal (no allocation, branch-light loops).
- **Memory extreme:** *coincides with the recommended.* It uses only fixed scalar counters
  (`both` plus two 10-int arrays = at most 21 ints) - `O(1)` extra space, the absolute floor.
  A C transliteration would shave only the language runtime baseline, not the algorithm, so
  it is not a genuinely different, non-dominated solution and is intentionally omitted.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.*`.

## Language Choice (C++)

The dominant cost is reading the `n` cards and doing a few `char` comparisons each; the
rest is fixed-size integer arithmetic over 21 counters. Native compilation with no GC or
interpreter overhead makes C++ a top-1% fit, and the workload needs no containers beyond the
input `vector<string>`, so C++ matches C on speed while staying readable (`std::min` /
`std::max`, range-`for`). The footprint is already at the `O(1)`-extra floor (only scalars
and two tiny fixed arrays), so a lower-baseline language such as C would trim only a constant
runtime baseline without changing the algorithm - not enough to justify a separate,
near-identical file under the "no coincident files" rule.

## Constraints

- `2 <= cards.length <= 1e5`.
- `cards[i].length == 2`; each character is a lowercase letter in `'a'..'j'` (only 10 possible
  letters).
- `x` is a lowercase letter in `'a'..'j'`.

Implications: a near-linear pass is required (`n` up to `1e5`); the alphabet is tiny (10
letters), so all per-letter state fits in fixed-size arrays of length 10. All counts and the
answer fit comfortably in 32-bit `int` (at most `1e5` cards, at most `5e4` pairs), so no
`long`/`long long` is needed.

## Key Observations

1. **Only cards containing `x` matter.** Any usable pair needs `x` in both cards. Cards
   without `x` are dead weight and dropped immediately.
2. **Three kinds of `x`-cards, by where `x` sits:**
   - `"xx"` (x in both positions) - call these **wildcards**, count `both`.
   - `"xc"` (x first, other letter `c`) - tallied in `cnt1[c]`.
   - `"cx"` (x second, other letter `c`) - tallied in `cnt2[c]`.
3. **Compatibility = differ in exactly one position:**
   - `"xc"` vs `"xd"` -> differ only at index 1 iff `c != d`. So inside `cnt1`, two cards
     pair iff they have **different** other-letters.
   - `"cx"` vs `"dx"` -> symmetric: inside `cnt2`, pair iff different other-letters.
   - A wildcard `"xx"` vs `"xc"` (or vs `"cx"`) -> differ in exactly one position -> always
     compatible. But `"xx"` vs `"xx"` are identical (differ in 0) -> wildcards never pair
     each other.
   - `"xc"` vs `"dx"` (one first-position, one second-position, `c, d != x`) -> differ in
     **both** positions -> never compatible. (Example 3: `"ab"` and `"ba"` with `x='b'`.)
4. **Two independent clusters sharing a wildcard pool.** Because first-position and
   second-position one-sided cards never pair each other, the deck splits into cluster 1
   (`cnt1` + wildcards) and cluster 2 (`cnt2` + wildcards). They are independent except that
   the `both` wildcards are a shared resource: a wildcard spent in one cluster cannot be
   reused in the other.

## Reasoning Process

1. **Single-cluster sub-problem.** Inside one cluster, each card belongs to a group: a
   real letter (`cnt[c]`) or the wildcard group. Pairs are allowed only **across** groups
   (different other-letters, or wildcard-with-anything; never within a group, since a
   wildcard cannot pair another wildcard and equal-letter one-sided cards are identical).
   The maximum number of pairs when you may only match across distinct groups is the classic
   `min(total / 2, total - largestGroup)`:
   - you can never exceed `floor(total / 2)` pairs (each uses two cards), and
   - the biggest single group can match only with the `total - largestGroup` cards outside
     it, so its surplus is unpairable.
   Here `largestGroup = max(largest cnt[c], have)` and `total = sum(cnt) + have`.
2. **Combining the clusters.** We must decide how many wildcards `i` go to cluster 1
   (the rest, `both - i`, to cluster 2). The combined score `solve(cnt1, i) + solve(cnt2,
   both - i)` is **not** concave in `i` - the floor in `total / 2` makes the marginal value
   of a wildcard alternate (e.g. for a cluster with `sum=3`, the gains as wildcards are added
   go `+1, 0, +1, 0`), so ternary search is unsafe. We therefore scan **all** splits
   `i = 0..both` and take the maximum. Each evaluation is `O(1)`.
3. This is precisely the path the official hints describe (per-side counts, a `solve(cnt,
   have)` helper, maximize over the wildcard split), and it is optimal for the constraints.

## Final Approach (step by step)

```text
both = 0; cnt1[0..9] = 0; cnt2[0..9] = 0
for each card:
    if card == "xx":          both += 1
    elif card[0] == x:        cnt1[card[1]] += 1     # "xc"
    elif card[1] == x:        cnt2[card[0]] += 1     # "cx"

sum1, max1 = sum and max of cnt1
sum2, max2 = sum and max of cnt2

solve(sum, mx, have): total = sum + have; return min(total/2, total - max(mx, have))

best = 0
for i in 0..both:
    best = max(best, solve(sum1, max1, i) + solve(sum2, max2, both - i))
return best
```

## Why This Approach

It is correct (proved by the cross-group matching argument and confirmed by a 40,000-case
differential test against an exhaustive maximum-matching brute force, plus all worked
examples), and it is optimal on both axes: linear time meets the `Omega(n)` read lower bound,
and `O(1)` extra space (21 fixed counters) is the floor. It is also simpler and faster than
any general-graph matching: the tiny 10-letter alphabet collapses the whole problem to
counting plus a one-dimensional split scan.

## Top 1% Performance Strategy

- One linear classification pass; cards without `x` skipped immediately.
- Fixed `int cnt1[10]`, `int cnt2[10]`, and one `both` counter - no hashing, no allocation,
  cache-resident state.
- The split scan runs at most `both + 1 <= n + 1` constant-time iterations and is dominated
  by the mandatory input read.
- 32-bit `int` throughout (<= 1e5 cards, <= 5e4 pairs - no overflow); branchless `std::min`
  / `std::max`.

## Edge Cases

- All cards identical (`"aa","aa"`) - wildcards cannot pair each other, score `0`.
- Identical one-sided cards (`"ab","ab"`) - same group, never compatible, score `0`.
- First-position vs second-position only (`"ab","ba"`, `x='b'`) - differ in both positions,
  score `0` (example 3).
- A lone `x`-card with non-`x` cards - no pair possible.
- Wildcard plus one-sided (`"aa","ab"`) - compatible, score `1`.
- One cluster empty - the split scan still gives all wildcards to the productive cluster.

## Alternatives

- **General-graph maximum matching** (Blossom) - correct but `O(V * E)`-class and wholly
  unnecessary given the 10-letter structure; far slower and more complex.
- **Ternary search over the split `i`** - tempting since the score looks unimodal, but the
  `floor` in `total / 2` breaks discrete concavity (marginal gains alternate `+1, 0, ...`),
  so it can miss the optimum. The full `O(both)` scan is both correct and fast enough.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
