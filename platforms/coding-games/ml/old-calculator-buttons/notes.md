# Notes - CodinGame Clash: Old Calculator Buttons (OCaml)

## Problem Summary

An old calculator has some broken digit buttons. Given a positive target number
`n` and the set of working digit buttons, output the smallest integer greater
than or equal to `n` whose decimal representation uses only working digits.

## Three Proposals

- **Recommended (`solution.ml`) - fast + lean:** build the smallest valid number
  directly, digit by digit. First try a number with the same length as `n`; if no
  such number can reach `n`, build the smallest valid number with the next
  length.
- **Speed extreme:** coincides with the recommended proposal. The search space
  is at most three digits by statement constraints, and the lexicographic
  construction avoids even a bounded integer sweep.
- **Memory extreme:** also coincides with the recommended proposal. It stores
  only the 10-entry button table and the output buffer.

No `solution-runtime.ml` or `solution-memory.ml` files are emitted because they
would duplicate the same Pareto-optimal algorithm.

## Language Choice - Recommended

Candidate languages considered:

- C++: Would be the lowest-overhead unrestricted choice, but the Clash request
  is explicitly for OCaml and the input size is too small for C++ to gain a
  meaningful advantage.
- C: Similar to C++ for raw cost, but manual string handling gives no benefit on
  at most three relevant digits.
- Rust: Native and safe, but heavier for this tiny interactive-style parser and
  not better than OCaml under the requested language constraint.
- Go: Compiled and simple, but runtime startup and bounds checks are irrelevant
  at this size and do not beat the direct OCaml solution for the requested
  submission language.
- Java / C#: Capable, but managed startup dominates this tiny task and the
  platform prompt supplied OCaml starter code.
- Python / JavaScript / TypeScript / PHP: All can solve it by brute force, but
  interpreted/VM overhead is unnecessary for a digit-construction solution.
- OCaml: Selected because the user and supplied CodinGame starter target OCaml.
  Pattern matching and immutable strings plus a small mutable output buffer keep
  the implementation compact without allocating candidate numbers repeatedly.

Chosen language:

- Selected: OCaml.
- Why it wins for this proposal: within the requested CodinGame language, the
  algorithm touches at most `10 * L` digit states, uses a fixed boolean table,
  and writes the answer once into a `Bytes` buffer.
- Why the main alternatives lose: native C/C++/Rust would only improve constants
  that are already negligible, while managed and interpreted alternatives add
  startup/runtime overhead without simplifying the algorithm.

## Constraints

- `0 < n < 1000`.
- `button` contains 1 to 9 unique characters from `0123456789`.
- The official tests guarantee a printable answer of length at most 3.
- Multi-digit answers are treated as ordinary decimal integers, so they do not
  start with `0`.

## Key Observations

- The answer is the lexicographically smallest valid decimal string among valid
  strings whose numeric value is at least `n`.
- For equal-length positive decimal strings, lexicographic order and numeric
  order are identical.
- Once a chosen digit is greater than the target digit at the same position, all
  remaining positions should be filled with the smallest working digit.
- If no same-length answer exists, every valid longer positive number is larger
  than `n`, so the smallest longer number is optimal.

## Reasoning Process

A direct brute force scan from `n` upward is acceptable under the stated
`n < 1000` bound, but it spends time converting and checking many numbers that
cannot be the answer. The more structural view is to compare decimal strings.

For the same length as `n`, scan from left to right. At each position, try the
smallest allowed digit that is at least the target digit, respecting the no
leading zero rule. If the digit equals the target digit, recurse into the next
position. If it is larger, the prefix is already safely above `n`, so the suffix
is minimized greedily. If equality later fails, backtrack to the nearest earlier
position and try the next larger allowed digit.

If the same-length construction fails, the answer must have more digits. In that
case there is no target comparison left: choose the smallest nonzero leading
digit and fill the rest with the smallest working digit.

## Final Approach

1. Read the target as a string to keep its decimal digits directly available.
2. Mark working buttons in a fixed boolean array of length 10.
3. Try to construct a same-length candidate with recursive left-to-right digit
   search.
4. When a digit greater than the target digit is selected, fill the remaining
   suffix with the smallest working digit.
5. If no same-length candidate exists, build the smallest valid longer number.
6. Print the resulting string.

## Why This Approach

The construction is preferable to brute force because it solves the exact
ordering problem instead of testing unrelated candidates. It also scales if the
upper bound changes: the cost depends on the number of decimal digits, not on
the numeric gap between `n` and the next typable number.

The same algorithm is both fastest and leanest for this problem. A table of 10
buttons is enough for constant-time membership, and a mutable byte buffer avoids
building intermediate candidate strings.

## Top 1% Performance Strategy

- Work on the input string directly; no repeated integer-to-string conversion.
- Use a fixed 10-slot boolean table for digit membership.
- Scan digits in ascending order, so the first successful branch is optimal.
- Fill the suffix immediately after the prefix becomes greater than the target.
- Avoid generating all possible button combinations.
- Allocate only one output buffer per attempted length.

## Edge Cases

- Target already typable: the equal path reaches the end and prints `n`.
- Missing middle digit, such as target `123` with buttons `0134589`: choose
  prefix `13` and fill the suffix with `0`, producing `130`.
- Target with no same-length solution: build the smallest longer valid number.
- Working digit `0`: allowed in suffixes and one-digit answers, but not as the
  first digit of a multi-digit number.
- Unsorted `button` input: the boolean table makes input order irrelevant.

## Alternatives

- Brute force from `n` upward was rejected for the maintained solution because
  it is tied to the current small numeric bound and repeatedly checks complete
  numbers.
- Generating all valid strings of length 1 to 3 and sorting them was rejected
  because the greedy digit search directly constructs the first valid answer.
- A full digit-DP table is unnecessary; the state space is one path plus local
  backtracking over at most ten digits per position.

## Verification

A temporary Python script mirrored the OCaml digit-construction algorithm and
compared it with a brute-force reference on the sample, focused edge cases, and
randomized valid button sets/targets. The temporary script was removed after
verification.

## See Also

All maintained proposals for this challenge are in this OCaml folder.
