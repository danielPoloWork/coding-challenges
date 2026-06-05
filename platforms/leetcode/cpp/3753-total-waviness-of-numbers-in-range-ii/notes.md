# Notes - LeetCode 3753: Total Waviness of Numbers in Range II (C++ proposal)

## Problem Summary

Given two integers `num1` and `num2`, sum the waviness of every number in the inclusive
range. A number's waviness is the number of middle digits that are strict local extrema:
`a < b > c` is a peak and `a > b < c` is a valley. The first and last digits never count,
and numbers with fewer than three digits have waviness `0`.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one solution is best on all meaningful axes.
For this problem the optimized digit DP is the recommended, speed-extreme, and
memory-extreme solution:

- **Recommended (`solution.cpp`) - fast + lean:** fixed-state digit DP over the upper bound,
  returning both suffix count and suffix waviness. `O(D)` time, `O(1)` extra space.
- **Speed extreme:** *coincides with the recommended.* Any correct prefix method must inspect
  the boundary digits, so `Omega(D)` is the useful lower bound. The DP uses only fixed arrays,
  at most ten transitions per state, and no heap allocation.
- **Memory extreme:** *coincides with the recommended.* The state table has a compile-time
  maximum of `20 * 3 * 10 * 3` entries and the recursion depth is at most `D <= 16`, so the
  extra memory is constant. A separate C or iterative translation would shave only baseline
  constants, not produce a genuinely different, non-dominated proposal.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.*`.

## Language Choice (C++)

C++ is the strongest fit for this problem's performance profile: the workload is tiny but
branch-heavy, and the judge calls the method directly with 64-bit integers. Native C++
avoids interpreter and GC overhead, stores the memo table in fixed arrays, and keeps all
arithmetic in `long long`. The result can reach about `14 * 10^15`, so 32-bit integers are
not safe; `long long` is required for counts and sums.

## Constraints

- `1 <= num1 <= num2 <= 10^15`.
- `10^15` has 16 decimal digits, so `D <= 16`.
- A single number contributes at most `D - 2 <= 14` waves.
- The range total fits in signed 64-bit integer range.

## Key Observations

1. Range sums become prefix sums: `answer = f(num2) - f(num1 - 1)`.
2. A peak or valley at the previous digit appears exactly when the comparison sign flips
   from `+1` to `-1` or from `-1` to `+1`.
3. Equal adjacent digits break a wave because a strict local extremum cannot contain an
   equality.
4. Leading zero padding must not interact with real digits, so the DP tracks how many
   meaningful digits have started: `0`, `1`, or `2+`.
5. When one chosen digit creates a wave, that wave applies to every valid suffix completion.
   The DP therefore returns both `{sumWaves, countNumbers}` for each suffix state.

## Reasoning Process

The brute-force idea is to scan every integer in `[num1, num2]`, inspect all middle digits,
and add one for each local extremum. That works for the small Range I version but fails here:
the interval can contain `10^15` numbers.

The constraint points to digit DP. While building a number from left to right, only the last
digit and the sign of the last adjacent comparison are needed. Adding a new digit decides
whether the previous digit is a peak or valley:

```text
 then -  => peak
- then +  => valley
anything involving 0 comparison => no wave
```

So the state is:

```text
position, usedDigitsCappedAt2, previousDigit, lastComparisonSign, tight
```

For non-tight states, the remaining suffix is independent of the upper bound digits and can
be memoized. Each transition receives a child `{waves, count}`. If the current digit creates
one new wave, add `child.count` to the total because every completion receives that one
additional wave.

## Final Approach

1. Define `prefix(n)` as the total waviness over all positive numbers `<= n`.
2. Return `0` immediately for `n <= 100`, because no number up to `100` has a wave.
3. Convert `n` to decimal digits.
4. Run DFS from the most significant position with no meaningful digit started.
5. On leading zeroes, stay in the empty state.
6. On the first real digit, store it as `previousDigit`.
7. From the second real digit onward, compute the new comparison sign.
8. If there are already at least two real digits and the sign flips between non-zero signs,
   add one wave for every child suffix completion.
9. Memoize only non-tight states.
10. Compute `prefix(num2) - prefix(num1 - 1)`.

## Why This Approach

It avoids enumerating the range completely and counts full suffix blocks at once. Tracking
the comparison sign instead of the second-last digit reduces the state count while preserving
all information needed to detect the next peak or valley. The implementation also handles
shorter numbers naturally through the leading-zero `used == 0` state.

## Top 1% Performance Strategy

- Two prefix DP calls, each over at most 16 digits.
- Fixed memo arrays; no `map`, `unordered_map`, `vector`, heap allocation, or string slicing.
- State compression from `(secondLastDigit, lastDigit)` to `(lastDigit, lastComparisonSign)`.
- `long long` arithmetic throughout to avoid overflow without extra conversion checks.
- Immediate return for `n <= 100`.

## Edge Cases

- `num1 = num2` (single number range), including a wave-rich number like `4848`.
- Ranges below `100`, where the result is always `0`.
- Equal adjacent digits such as `100`, `111`, or `1221`, which must not create waves through
  equality.
- Boundaries crossing digit lengths, such as `98..102` or `999..1001`.
- Maximum bound `10^15`.

## Alternatives

- **Brute force over the interval:** simple but impossible for ranges up to `10^15`.
- **Digit DP storing the last two digits:** correct and matches the hint, but it has more
  states than necessary because only the previous comparison sign is needed.
- **Closed-form counting per digit position:** possible, but more error-prone around tight
  upper bounds and leading digits. It only improves constants for `D <= 16`, while the fixed
  DP is already at the practical speed and memory floor.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
