# Notes - LeetCode 3463: Check If Digits Are Equal in String After Operations II (C proposal)

## Problem Summary

Repeatedly replace adjacent digit pairs by their sums modulo `10` until two digits remain.
Return whether the two final digits are equal.

## Proposal in This Folder (C)

This folder holds the **minimum-memory** proposal. The recommended and speed proposals are
in C++ - see [See Also](#see-also).

- **Memory extreme (`solution-memory.c`):** compute every needed binomial coefficient
  modulo `10` with Lucas theorem modulo `2` and `5`, then combine the residues with CRT.
  It uses no dynamic allocation and only scalar state.

## Language Choice (C)

C is chosen for the memory objective because it has the smallest runtime/stdlib baseline
among the allowed languages and the LeetCode C signature operates directly on a `char*`.
The Lucas/CRT approach keeps all auxiliary storage constant, which minimizes reported peak
memory at the cost of scanning base-5 digits for every coefficient.

## Constraints

- `3 <= s.length <= 1e5`
- `s` contains only digits.

## Key Observations

- After `n - 2` operations, the final two digits are weighted by row `n - 2` of Pascal's
  triangle.
- Equality is equivalent to
  `sum C(n - 2, k) * (s[k] - s[k + 1]) == 0 (mod 10)`.
- A coefficient modulo `10` is uniquely determined by its residues modulo `2` and `5`.
- Lucas theorem computes `C(row, k)` modulo a prime from base-prime digits.

## Why This Approach

The C++ streamed recurrence is faster, but it keeps more coefficient state and, in the
runtime variant, allocates precomputed arrays. The C memory solution recomputes each
coefficient residue directly from `row` and `k`, avoiding all dynamic memory. The CRT
step is tiny: start from the modulo-5 residue and add `5` only if the parity must flip.

## Top 1% Performance Strategy

This is not the runtime champion; it is the memory champion. It still avoids the O(n^2)
simulation, uses fixed tables for `nCk mod 5`, computes parity with the bit identity
`(k & ~row) == 0`, and performs no heap allocation.

## Edge Cases

- Length `3`: row `1`; the equality depends only on the first and last digits.
- All digits equal: weighted difference is zero.
- Coefficients divisible by `10`: CRT reconstructs them as `0`.
- Large input: no auxiliary array grows with `n`.

## See Also

Recommended (C++, streamed recurrence, O(n) / O(1) extra) and speed (C++, precomputed
factor operands, O(n) / O(n)) proposals:
`../../cpp/3463-check-if-digits-are-equal-in-string-after-operations-ii/`.
