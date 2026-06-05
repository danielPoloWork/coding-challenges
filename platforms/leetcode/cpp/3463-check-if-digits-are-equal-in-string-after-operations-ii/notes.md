# Notes - LeetCode 3463: Check If Digits Are Equal in String After Operations II (C++ proposals)

## Problem Summary

Given a digit string `s`, repeatedly replace every adjacent pair by its sum modulo `10`
until only two digits remain. Return whether those final two digits are equal.

## Proposals in This Folder (C++)

This folder holds the **C++** performance proposals. The minimum-footprint C proposal is
implemented separately - see [See Also](#see-also).

- **Recommended (`solution.cpp`) - fast + lean:** stream the relevant Pascal row modulo
  `10` using the binomial recurrence with factors of `2` and `5` tracked separately.
  It is O(n), avoids dynamic allocation, and is the best default for top runtime while
  staying memory-conscious.
- **Speed extreme (`solution-runtime.cpp`):** precompute, for every recurrence operand
  `1..n-2`, its `2` count, `5` count, reduced unit residue, and inverse residue. This
  keeps the same O(n) asymptotic time but lowers repeated factor-stripping work at O(n)
  extra memory.

## Language Choice (C++)

C++ is the strongest fit for the two performance-focused proposals because the input is
only `1e5` characters and the winning strategy is tight scalar integer arithmetic over a
single pass. Inlined helpers, contiguous byte arrays in the runtime variant, no garbage
collector, and no interpreter overhead give better judge performance than higher-level
runtimes for this modular-combinatorics workload.

## Constraints

- `3 <= s.length <= 1e5`
- `s` contains only digits.
- The final answer depends on row `n - 2` of Pascal's triangle modulo `10`.

## Key Observations

- After one operation, each new digit is a sum of adjacent digits modulo `10`.
- Repeating this operation builds Pascal coefficients: after `m = n - 2` operations,
  the left final digit is `sum C(m, k) * s[k]`, and the right final digit is
  `sum C(m, k) * s[k + 1]`, both modulo `10`.
- The final digits are equal iff
  `sum C(m, k) * (s[k] - s[k + 1]) == 0 (mod 10)`.
- Direct division modulo `10` is invalid because many values are not invertible. Removing
  all factors of `2` and `5` leaves residues in `{1, 3, 7, 9}`, which do have inverses
  modulo `10`.

## Reasoning Process

The direct simulation shortens the string by one per round, so it costs O(n^2). With
`n = 1e5`, that is far beyond the target.

The operation is linear, so the coefficient of each original digit can be read from
Pascal's triangle. That reduces the task to evaluating one weighted difference modulo
`10`. A naive Pascal row is also too expensive, and a plain recurrence
`C(m, k + 1) = C(m, k) * (m - k) / (k + 1)` cannot divide modulo `10` safely. Tracking
the powers of `2` and `5` separately solves the composite-modulus issue while keeping
the coefficient stream linear.

## Final Approaches

### Recommended - `solution.cpp`

1. Let `row = n - 2`.
2. Maintain the current coefficient as `unit * 2^twos * 5^fives (mod 10)`, where
   `unit` is coprime with `10`.
3. Add `coefficient * (s[k] - s[k + 1])` to the running difference.
4. Move from `C(row, k)` to `C(row, k + 1)` by multiplying by `row - k` and dividing by
   `k + 1`, stripping `2`s and `5`s before updating `unit`.
5. Return whether the accumulated difference is divisible by `10`.

### Speed Extreme - `solution-runtime.cpp`

1. Precompute factor data for every integer from `1` to `row`.
2. Stream the coefficients as in the recommended solution.
3. Use array lookups for numerator and denominator factor data instead of stripping the
   same integer once as a numerator and again as a denominator.

### Memory Extreme

The memory champion is in C: `../../c/3463-check-if-digits-are-equal-in-string-after-operations-ii/solution-memory.c`.
It computes each coefficient via Lucas theorem modulo `2` and `5`, then reconstructs
modulo `10` with CRT. It avoids all dynamic allocation, at O(n log_5 n) time.

## Why These Approaches

The recommended solution is the best practical default: it is optimal O(n), allocation-free,
and simple enough to audit. The runtime variant uses more memory to reduce repeated
factor work, which is useful when raw wall-clock time is the only objective. The C memory
variant gives the smallest auxiliary footprint and runtime baseline, but pays a small
logarithmic factor per coefficient.

## Top 1% Performance Strategy

- Avoid O(n^2) simulation and O(n^2) Pascal construction entirely.
- Evaluate only the final equality condition, not the final two digits as separate arrays.
- Keep the recommended path allocation-free and branch-light.
- Avoid invalid modular division by separating `2`/`5` factors and using inverses only
  for residues coprime with `10`.
- In the runtime extreme, precompute factor data in compact byte arrays to trade memory
  for fewer divisions in the main loop.

## Edge Cases

- Length `3`: row `1`, so the result reduces to whether the first and last original
  digits match modulo `10`.
- All equal digits: the weighted difference is `0`.
- Alternating or random digits: handled by the same binomial difference.
- Large `n = 1e5`: both C++ proposals stay linear.

## Alternatives

- Repeated simulation is O(n^2) and infeasible.
- Building Pascal's triangle is O(n^2) time and memory-heavy.
- Computing `C(row, k)` with integer big numbers is unnecessary and too slow.
- Lucas theorem directly in C++ is elegant and memory-light, but the per-coefficient
  base-5 scan is slower than the streamed O(n) recurrence for the performance proposals.

## See Also

Minimum-memory champion (C, Lucas + CRT, O(n log_5 n) time / O(1) extra space):
`../../c/3463-check-if-digits-are-equal-in-string-after-operations-ii/solution-memory.c`.
