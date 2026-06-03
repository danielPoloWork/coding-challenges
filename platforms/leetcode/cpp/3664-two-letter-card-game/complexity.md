# Complexity - LeetCode 3664: Two-Letter Card Game (C++ proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed and
memory champion. The figures below therefore describe all three axes at once.

## Recommended - `solution.cpp` (classify + split scan)

### Time Complexity

```text
O(n + both)  =  O(n)
```

One linear pass classifies the `n` cards into `both`, `cnt1[10]`, `cnt2[10]`. A fixed
10-step pass derives `sum1, max1, sum2, max2`. The final split scan runs `both + 1`
iterations (`both <= n`), each `O(1)`. Reading every card is an `Omega(n)` lower bound, so
this is also the speed extreme.

### Space Complexity

```text
O(1) extra
```

A single `both` counter plus two fixed `int[10]` arrays and a few scalars - at most 21
integers, independent of `n`. No hashing, no sorting, no allocation. This is the memory
floor, so it is also the memory extreme.

## Variables

- `n`: number of cards (`cards.length`).
- `both`: number of `"xx"` wildcard cards (`both <= n`).
- The alphabet is fixed at 10 letters (`'a'..'j'`), so the per-letter arrays are constant
  size and do not scale with `n`.

## Top 1% Performance Strategy

- Single linear classification pass; non-`x` cards skipped at once.
- Fixed-size `int` counters only - cache-resident, zero heap allocation.
- Split scan is `O(both) <= O(n)` and dominated by the mandatory input read.
- 32-bit `int` arithmetic (<= 1e5 cards, <= 5e4 pairs); branchless `std::min` / `std::max`.

## Optimization Opportunities

None that change the asymptotics: `O(n)` time and `O(1)` extra space are both optimal. The
split scan's range could be trimmed (a cluster gains nothing from more than `sum` wildcards),
a constant-factor micro-tweak that does not change the complexity class and is omitted for
clarity.

## See Also

None - the speed and memory extremes coincide with this proposal (see `notes.md`).
