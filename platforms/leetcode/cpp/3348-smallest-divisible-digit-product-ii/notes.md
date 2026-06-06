# Notes - LeetCode 3348: Smallest Divisible Digit Product II (C++ proposals)

## Problem Summary

Given a decimal string `num` and an integer `t`, return the smallest zero-free integer
string that is greater than or equal to `num` and whose digit product is divisible by
`t`. If no zero-free digit product can ever contain all prime factors of `t`, return
`"-1"`.

## Proposals in This Folder (C++)

- **Recommended (`solution.cpp`) - fast + lean:** factor `t` into exponents of
  `2, 3, 5, 7`, keep rolling prefix factor counts while scanning from right to left, and
  use a tiny `2 x 3` exponent feasibility table to test whether a suffix of a given
  length can finish the job.
- **Speed extreme (`solution-runtime.cpp`):** precompute every residual exponent state and
  every digit transition. This spends more memory so the scan's inner loop is mostly
  table lookups.
- **Memory extreme (`solution-memory.cpp`):** remove the feasibility table. The exact
  minimum digit count for the remaining `2` and `3` exponents is computed on demand by
  trying only `0..5` uses of digit `6`.

## Language Choice (C++)

C++ is the best fit for all three objectives. The input length reaches `2 * 10^5`, while
the mathematical state is tiny: at most the exponents of primes `2, 3, 5, 7` inside
`t <= 10^14`. The winning implementation is a long branch-light string scan plus small
integer arrays. C++ avoids interpreter, VM, and garbage-collector overhead, and it can
reserve and append the answer string directly.

## Constraints

- `2 <= num.length <= 2 * 10^5`
- `num` contains decimal digits and has no leading zero.
- The answer must contain no digit `0`.
- `1 <= t <= 10^14`
- Any prime factor of `t` outside `{2, 3, 5, 7}` makes the answer impossible.
- Under the limit, exponent ranges are tiny: `E2 <= 46`, `E3 <= 29`, `E5 <= 20`,
  `E7 <= 16`.

## Key Observations

- Zero-free digit products are composed only of the factors contributed by digits `1..9`.
- Those factors are only `2, 3, 5, 7`; therefore `t` must have no other prime factor.
- For a same-length answer, the smallest valid candidate preserves the longest possible
  prefix of `num`, increases one digit, then minimizes the suffix.
- If `num` contains a zero, positions after the first zero cannot keep the prefix equal
  because the prefix would already be invalid.
- Digits `5` and `7` are independent: each remaining exponent needs one digit. Only the
  `2` and `3` exponents interact through digit `6`.

## Reasoning Process

The direct brute force is to test each integer starting at `num`, reject those containing
zero, compute the digit product, and stop at the first divisible value. That is impossible
because `num` can have 200000 digits.

The constraints suggest digit-DP reasoning, but the numeric lower bound has a simple
structure. For a fixed length, any answer that first differs from `num` later is smaller
than any answer that first differs earlier. So we can scan candidate pivot positions from
right to left. At each valid pivot, try the smallest larger digit and ask one question:
can the remaining suffix length cover the still-missing prime exponents?

The suffix question is exact because the exponent state is very small. Digits `8` cover
three twos, digits `9` cover two threes, and digit `6` can pair one two with one three.
Trying more than five `6`s is never uniquely beneficial: replacing six `6`s with two
`8`s and three `9`s uses one fewer digit and covers the same `2/3` exponents. Therefore
`0..5` trials are enough for the memory variant, while the recommended variant stores
those answers in a compact table.

## Final Approaches

### Recommended - `solution.cpp`

1. Factor `t` by `2, 3, 5, 7`; return `"-1"` if anything remains.
2. Precompute `min23[two][three]`, the minimum number of digits needed to cover remaining
   `2` and `3` exponents.
3. Count the factors contributed by all digits in `num` and remember the first zero.
4. If `num` is already zero-free and covers the target, return it.
5. Scan positions from right to left while rolling the factor count back to the prefix
   before the current digit.
6. Skip positions whose unchanged prefix contains a zero.
7. Try each larger nonzero digit. If the minimum suffix length is small enough, build the
   answer from the unchanged prefix, the pivot digit, leading suffix `1`s, and the
   lexicographically smallest factor-covering core.
8. If no same-length answer exists, use the shortest larger length that can cover `t`,
   at least `num.length + 1`.

### Speed Extreme - `solution-runtime.cpp`

1. Build a state for every possible residual exponent tuple.
2. Store `minDigits[state]`.
3. Store `nextState[state][digit]`, the residual state after appending that digit.
4. Run the same right-to-left pivot scan, but use state indexes instead of recomputing
   residual arrays inside the candidate loop.

### Memory Extreme - `solution-memory.cpp`

1. Keep only the target exponents and rolling covered exponents.
2. For every feasibility test, compute
   `remaining5 + remaining7 + min_x(x + ceil((two-x)/3) + ceil((three-x)/2))` for
   `x in [0, min(two, three, 5)]`.
3. Use the same pivot scan and suffix construction as the recommended variant.

## Why These Approaches

All variants exploit the monotonic ordering of same-length decimal strings: preserving a
longer prefix dominates any earlier increase. That reduces the lower-bound part of the
problem to a single right-to-left scan.

The recommended variant is the best default because it is already linear in the input
length, has tiny auxiliary memory, and is easy to audit. The runtime variant is useful
when shaving inner-loop arithmetic matters more than memory. The memory variant is useful
when auxiliary memory is the primary metric; it trades a few constant-time arithmetic
trials for removing tables.

## Top 1% Performance Strategy

- Reject impossible `t` values immediately after prime factorization.
- Use C++ strings and fixed `array<int, 4>` exponent counters.
- Avoid prefix arrays; scan from right to left by subtracting the current digit from the
  total covered exponents.
- Treat the first zero specially so invalid equal prefixes are skipped in O(1).
- Fill extra suffix capacity with one bulk append of `'1'` characters.
- Reconstruct only the short factor-covering suffix core after the slack `1`s.
- In the runtime variant, replace repeated residual arithmetic with precomputed state
  transitions.

## Edge Cases

- `t = 1`: any zero-free number works; if `num` has no zero, return `num`.
- `num` contains zero: the first zero is the latest possible equal-prefix pivot.
- All digits are `9`: no same-length increase exists, so the answer length grows.
- `t` has factor `11`, `13`, or any other unsupported prime: return `"-1"`.
- Required factors need more digits than `num.length + 1`: choose the minimum feasible
  longer length.
- Extra suffix positions do not hurt because digit `1` is neutral and lexicographically
  smallest.

## Alternatives

- Brute force over integers is impossible for 200000-digit inputs.
- A full digit DP over position and exponent state is possible, but the rightmost-pivot
  scan is simpler and avoids storing per-position states.
- Computing huge digit products is unnecessary; exponent deficits contain all relevant
  divisibility information.
- A pure formula for all variants is memory-light, but the tiny table and transition
  graph variants give useful runtime trade-offs.

## See Also

All proposals for this challenge are in this C++ folder.
