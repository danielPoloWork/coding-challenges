# Notes - LeetCode 3260: Find the Largest Palindrome Divisible by K (C++ proposal)

## Problem Summary

Given positive integers `n` and `k`, return the largest `n`-digit decimal string that is
both a palindrome and divisible by `k`. The first digit cannot be zero.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one implementation is best on all meaningful
axes. For this problem the closed-form divisibility construction is the recommended,
speed-extreme, and memory-extreme solution:

- **Recommended (`solution.cpp`) - fast + lean:** build the answer directly from the
  divisibility rule for `k in [1, 9]`. The algorithm writes only the digits forced away
  from `9`.
- **Speed extreme:** *coincides with the recommended.* Any exact solution must emit `n`
  characters, and this construction does only `O(n)` output initialization plus constant
  arithmetic.
- **Memory extreme:** *coincides with the recommended.* Apart from the returned string, it
  keeps only scalar state and a fixed central block for the `k = 7` case.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.*`.

## Language Choice (C++)

Candidate languages considered:

- **C++:** Best fit. The workload is dominated by constructing one string of length up to
  `100000`, setting a handful of positions, and returning it through LeetCode's native C++
  signature. `std::string(n, ch)` performs the required output allocation directly and
  keeps auxiliary memory constant.
- **C:** Also compact, but LeetCode's C return path requires manual allocation and string
  termination. It does not improve the asymptotic memory profile and is easier to get
  wrong at the platform boundary.
- **Rust:** Native and memory-safe, but the LeetCode Rust string conversion path adds
  implementation overhead without beating the direct C++ string construction for this
  fixed-rule problem.
- **Go:** Compiled and simple, but byte-slice construction plus runtime/GC overhead is less
  attractive than C++ for the top-runtime objective.
- **Java / C#:** Competitive enough for `O(n)` output, but managed string builders and JIT
  startup/allocation behavior add avoidable overhead.
- **Python / JavaScript / TypeScript / PHP:** Easy to express, but interpreter or VM
  overhead is unnecessary when `n` reaches `100000` and the optimal algorithm is just
  branch-light string construction.

Chosen language:

- **Selected:** C++.
- **Why it wins for this proposal:** It gives native-speed string allocation and direct
  in-place digit edits while matching LeetCode's common class signature.
- **Why the main alternatives lose:** C does not materially reduce memory after accounting
  for the returned buffer; managed and interpreted languages add runtime overhead to an
  otherwise trivial output-bound algorithm.

## Constraints

- `1 <= n <= 100000`.
- `1 <= k <= 9`.
- The output must have exactly `n` digits and no leading zero.
- A valid answer always exists. For example, one can choose repeated digits compatible with
  the small divisor.

## Key Observations

1. With fixed length, the numerically largest string is the lexicographically largest
   string, so leftmost digits matter most.
2. A palindrome's last digit is also its first digit. Divisibility by `2`, `5`, and `8`
   therefore constrains the most significant digits through the least significant digits.
3. For `k = 3` and `k = 9`, all `9`s already have digit sum divisible by `k`.
4. For `k = 7`, `10^6 == 1 (mod 7)`, so any six-digit block of `9`s contributes zero
   modulo `7`. The residue can be handled by a short central palindrome whose length is
   determined by `n mod 12`.
5. Once all earlier digits are kept as high as possible, any necessary reduction should be
   pushed as close to the center as the divisibility rule allows.

## Reasoning Process

The direct brute-force approach would enumerate palindromes from largest to smallest and
test divisibility. That fails immediately for `n = 100000`.

The small range of `k` changes the problem. Instead of a full digit DP, analyze the
divisibility rule for each divisor:

- `1`, `3`, `9`: all `9`s works.
- `2`: the last digit must be even, so the largest possible first/last digit is `8`.
- `4`: the last two digits determine divisibility. For a large palindrome, the largest
  valid boundary is `88`; short overlapping lengths are all `8`.
- `5`: the first/last digit must be `5`.
- `6`: combine divisibility by `2` and `3`. Use endpoints `8`; then lower the center digit
  for odd lengths or the center pair for even lengths so the digit sum becomes divisible by
  `3`.
- `8`: the last three digits determine divisibility. The largest valid boundary is `888`;
  short overlapping lengths are all `8`.
- `7`: keep outer six-digit chunks as `9`s and choose the largest divisible central
  palindrome for the remaining length class.

## Final Approach

1. Switch on `k`.
2. Return all `9`s for `k in {1, 3, 9}`.
3. For `k in {2, 4, 5, 8}`, fill the answer with `9`s and overwrite only the forced
   symmetric edge digits, with short-length overlap cases handled as all `8`s where needed.
4. For `k = 6`, handle `n = 1` and `n = 2` specially, then use endpoints `8` and place the
   minimum digit-sum correction at the center.
5. For `k = 7`, start from all `9`s. If `n % 12` is `0` or `6`, return it. Otherwise write
   the largest precomputed central palindrome for that residue:

```text
1 -> 7
2 -> 77
3 -> 959
4 -> 9779
5 -> 99799
7 -> 9994999
8 -> 99944999
9 -> 999969999
10 -> 9999449999
11 -> 99999499999
```

## Why This Approach

The method is output-bound: it constructs exactly one answer string and performs constant
extra work. A generic modulo DP would also be linear because `k <= 9`, but it would store
or recompute reachability states that the divisibility rules make unnecessary.

For `k = 7`, choosing a central block is lexicographically optimal. Let `m = n mod 12`
except that residue `0` needs no block and residue `6` is already all `9`s. Then
`(n - m) / 2` is a multiple of `6`, so the outer all-`9` prefix and suffix are both
zero modulo `7`. Any alternative that changes an outer digit loses before the central
block is even compared.

## Top 1% Performance Strategy

- Use closed-form construction instead of digit DP.
- Allocate the returned string once with the final length.
- Set only the few digits that cannot remain `9`.
- Keep the `k = 7` table as fixed string literals and copy at most eleven characters.
- Avoid recursion, maps, dynamic programming tables, modular scans over all positions, and
  repeated palindrome rebuilding.

## Edge Cases

- `n = 1`: returns the largest one-digit multiple for each `k`, such as `6` for `k = 6`
  and `7` for `k = 7`.
- `n = 2`, `k = 6`: the best palindrome is `66`, not `88`.
- Short `k = 4` and `k = 8` inputs have overlapping boundary digits and are all `8`.
- `n % 12 in {0, 6}` for `k = 7`: all `9`s is already divisible by `7`.
- Very large `n`: only the returned string scales.

## Alternatives

- **Descending brute force:** impossible for large `n`.
- **Generic palindrome DP by remainder:** correct and still linear in `n * k * 10`, but it
  uses more state and more branches than the closed-form construction.
- **Search only the half string greedily with modular feasibility:** robust, but unnecessary
  for `k <= 9` after deriving the divisibility cases.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
