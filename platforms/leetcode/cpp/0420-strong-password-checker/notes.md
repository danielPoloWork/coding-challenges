# Notes - LeetCode 420: Strong Password Checker (C++ proposal)

## Problem Summary

Given a password, compute the minimum number of insert, delete, or replace operations needed
to make it strong. A strong password has length from `6` to `20`, includes at least one
lowercase letter, one uppercase letter, and one digit, and has no run of three equal
characters in a row.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one solution is best on all meaningful axes.
For this problem the optimized greedy scan is the recommended, speed-extreme, and
memory-extreme solution:

- **Recommended (`solution.cpp`) - fast + lean:** scan character classes and equal-character
  runs once, then use mandatory deletions to reduce replacement pressure in optimal order.
  `O(n)` time and `O(1)` extra space.
- **Speed extreme:** *coincides with the recommended.* Every correct solution must inspect
  the input characters, so `Omega(n)` is the useful lower bound. The implementation reaches
  it with only scalar counters and no dynamic containers.
- **Memory extreme:** *coincides with the recommended.* The algorithm stores only counters
  for missing classes, replacement pressure, and deletion buckets. A separate C translation
  would not produce a genuinely different, non-dominated approach.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.*`.

## Language Choice (C++)

C++ is the most performant fit for this problem's profile among the allowed LeetCode
languages. The input is short (`n <= 50`), so constant factors dominate: a native direct
method call, simple integer counters, ASCII comparisons, and no allocation beyond the
incoming `std::string` keep latency low. C would be similarly lean, but LeetCode exposes the
problem naturally as a C++ class method and C++ keeps the same native performance with a
cleaner submission surface.

## Constraints

- `1 <= password.length <= 50`.
- Characters are letters, digits, `'.'`, or `'!'`.
- Operations allowed: insert one character, delete one character, or replace one character.
- The length upper bound is small, but the answer still depends on interactions between
  length fixes, missing character classes, and repeated runs.

## Key Observations

1. Missing character classes can be fixed by replacements or insertions already needed for
   length and repeated-run repairs.
2. A repeated run of length `L >= 3` needs `L / 3` replacements if no deletions are applied.
3. For `n < 6`, insertions are mandatory and can also add missing classes or split repeated
   runs, so the answer is `max(missingTypes, 6 - n)`.
4. For `6 <= n <= 20`, no length operation is mandatory, so the answer is
   `max(missingTypes, totalRunReplacements)`.
5. For `n > 20`, exactly `n - 20` deletions are mandatory. These deletions should be spent
   on runs where they reduce replacement count with the fewest deleted characters.

## Reasoning Process

The direct way to reason about the password is to separate the three constraints. Character
classes are independent: we only need to know how many among lowercase, uppercase, and digit
are missing.

The repeated-run constraint is local. In a run like `aaaaaa`, every third character can be
replaced to break all triples, so a run of length `L` contributes `L / 3` required
replacements before considering deletions.

The difficult part is that deletions for overlong passwords can also shrink runs. Their
value depends on `L % 3`:

- If `L % 3 == 0`, one deletion lowers `L / 3` by one.
- If `L % 3 == 1`, two deletions lower `L / 3` by one.
- If `L % 3 == 2`, three deletions lower `L / 3` by one.

That gives a greedy order: use mandatory deletions first on `% 3 == 0` runs, then on
`% 3 == 1` runs, then spend every remaining group of three deletions anywhere a replacement
is still needed. After this reduction, the final work is the mandatory deletions plus the
larger of missing character classes and remaining replacements.

## Final Approach

1. Scan the string once to detect lowercase, uppercase, and digit presence.
2. Scan equal-character runs.
3. Add `len / 3` to `replacements` for each run with `len >= 3`.
4. Count runs with `len % 3 == 0` and accumulate a two-deletion budget for runs with
   `len % 3 == 1`.
5. If the password is short, return `max(missingTypes, 6 - n)`.
6. If the password length is valid, return `max(missingTypes, replacements)`.
7. If it is too long, spend `n - 20` mandatory deletions in the `% 3` priority order to
   reduce `replacements`.
8. Return `deletions + max(missingTypes, reducedReplacements)`.

## Why This Approach

The solution handles all three strength requirements in the same cost model instead of
repairing them independently. Replacements are counted only where triples force them, and
mandatory deletions are assigned exactly where they save the most later work. Since the scan
uses only counters, it is both the fastest practical method and the minimum-memory method
for the given constraints.

## Top 1% Performance Strategy

- One pass for character classes and one pass for runs.
- ASCII range checks instead of locale-sensitive classification helpers.
- Scalar counters instead of arrays, vectors, maps, or simulated edits.
- Greedy deletion buckets encode the full optimal deletion schedule without storing run
  lengths.
- Early length branches avoid unnecessary delete logic for the common valid-length case.

## Edge Cases

- Single-character password such as `"a"`: needs five operations to reach length and classes.
- Already strong password such as `"1337C0d3"`: returns `0`.
- Short repeated strings such as `"aaa"`: insertions can both extend length and split runs.
- Valid-length repeated strings such as `"aaaaaa"`: replacements solve triples and missing
  classes together.
- Overlong repeated strings such as `21` equal characters: one deletion should be applied
  before replacements.
- Neutral characters `'.'` and `'!'`: they count toward length and runs but not character
  classes.

## Alternatives

- **Dynamic programming over edit sequences:** correct for tiny inputs but unnecessary and
  much slower; the greedy structure gives the exact optimum.
- **Actually mutating the string while editing:** easy to get wrong and adds allocation or
  shifting costs. Counting run pressure is enough.
- **Storing every repeated run length:** still `O(n)` and correct, but the `% 3` counters
  preserve only the information required for optimal deletions, reducing memory and constant
  factors.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
