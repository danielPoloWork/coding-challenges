# Notes - LeetCode 3751: Total Waviness of Numbers in Range I (C++ proposals)

## Problem Summary

Given two integers `num1` and `num2`, sum the waviness of every number in the inclusive
range. A middle digit contributes one wave if it is strictly greater than both neighbors
or strictly smaller than both neighbors. First and last digits never count, and numbers
with fewer than three digits contribute `0`.

## Proposals in This Folder (C++)

- **Recommended (`solution.cpp`) - fast + lean:** compressed digit DP over two prefix
  bounds. It answers any interval in `O(D)` time with a tiny fixed memo table.
- **Speed extreme (`solution-runtime.cpp`):** one-time prefix table for all values
  `0..100000`. After setup, each call is two array reads and one subtraction.
- **Memory extreme (`solution-memory.cpp`):** direct arithmetic scan of the interval with
  no arrays, strings, vectors, or memo tables. It spends more time to minimize auxiliary
  memory.

The trade-off is direct: the runtime proposal spends about 400 KB of static memory to make
queries constant-time after initialization; the memory proposal uses only scalar variables
but scans every number; the recommended digit DP stays near the runtime floor without the
domain-sized table.

## Language Choice (C++)

LeetCode supports all practical candidates for this problem, and the workload is small but
branch-heavy. C++ is selected for all three proposals because it gives native integer loops,
fixed arrays, inlining, and minimal runtime overhead under the judge's direct method-call
model.

Candidate languages considered:

- **C++:** wins for all proposals. It provides fixed arrays for digit DP and prefix tables,
  branch-light scalar loops for the arithmetic scan, and no VM or GC startup cost.
- **C:** could shave a little baseline overhead for the memory scan, but LeetCode's C++
  class signature is the natural target for this problem and C would not improve the
  asymptotic or practical trade-off enough to justify a separate language folder.
- **Rust:** offers native speed and memory safety, but its LeetCode wrapper and bounds
  checks add friction for a six-digit fixed-state problem where C++ is already compact.
- **Go:** compiled loops are adequate, but runtime initialization and bounds checks are
  less attractive for such tiny hot paths and fixed arrays.
- **Java / C#:** JIT performance can be strong after warm-up, but startup, class/runtime
  overhead, and array initialization constants are unnecessary for at most six digits.
- **Python / JavaScript / TypeScript / PHP:** constraints are small enough for accepted
  brute force, but interpreter/VM overhead makes them weaker for the top-1% runtime target.

Chosen language:

- **Selected:** C++ for recommended, speed extreme, and memory extreme.
- **Why it wins:** all three algorithms are integer-control-flow dominated; C++ keeps the
  operations in registers or compact contiguous storage.
- **Why alternatives lose:** managed and interpreted choices do not compensate for their
  runtime overhead, and lower-level C does not fit LeetCode's class-style ergonomics as well.

## Constraints

- `1 <= num1 <= num2 <= 100000`.
- The largest input has six decimal digits.
- A single number contributes at most four waves.
- The total answer is at most `100000 * 4 = 400000`, so `int` is safe.

## Key Observations

- A wave at the previous digit appears exactly when the adjacent comparison direction
  changes from increasing to decreasing or from decreasing to increasing.
- Equal neighboring digits break strictness, so any comparison sign `0` cannot form a wave.
- Range sums can be answered as `prefix(num2) - prefix(num1 - 1)`.
- For a prefix DP, the next digit only needs the previous digit and previous comparison
  sign; it does not need the full numeric prefix.
- Because the bound is only `100000`, a full-domain prefix table is also viable when
  repeated-call speed matters.

## Reasoning Process

The direct solution follows the hint: enumerate every number in `[num1, num2]`, scan its
digits, and count local extrema. With at most `100000` numbers and six digits each, this is
correct and fast enough.

For top execution time, however, the range length should not dominate. Convert the answer
to a prefix query: count total waviness over all numbers `<= n`, then subtract. While
building numbers left to right, each newly chosen digit decides whether the previous digit
became a peak or valley. The state only needs:

```text
position, meaningful digit count capped at 2, previous digit, previous comparison sign
```

The DP returns both how many suffix completions exist and how many waves they contain. If
the current transition creates a wave, that one wave applies to every child completion.

The prefix-table runtime variant pushes the small constraint even harder: precompute the
same prefix sum for every possible input once. The memory variant keeps the hinted brute
force because it is the smallest auxiliary-memory implementation and remains acceptable.

## Final Approaches

### Recommended - `solution.cpp`

1. Define `prefix(n)` as the total waviness of all non-negative numbers `<= n`; zero adds
   no waves, so including it is harmless.
2. Convert `n` to decimal digits.
3. Run digit DP from the most significant digit.
4. Skip leading zeroes until the first meaningful digit appears.
5. Track the previous meaningful digit and the last comparison sign.
6. When a new digit flips a non-zero sign, add one wave for every suffix completion.
7. Return `prefix(num2) - prefix(num1 - 1)`.

### Speed Extreme - `solution-runtime.cpp`

1. Lazily initialize a static `array<int, 100001>`.
2. For every `n`, compute its individual waviness using arithmetic digit extraction.
3. Store cumulative totals in the array.
4. Answer each call with `pref[num2] - pref[num1 - 1]`.

### Memory Extreme - `solution-memory.cpp`

1. Clamp the lower bound to `100`, since smaller numbers contribute `0`.
2. Iterate every number in the range.
3. Extract digits arithmetically from most significant to least significant.
4. Keep only three rolling digits and add one when the middle digit is a strict local
   maximum or minimum.

## Why These Approaches

The recommended DP is the best default because it is independent of interval length and
uses only a few hundred fixed states. It also generalizes cleanly to the harder range
version without changing the core idea.

The speed extreme is best when the judge reuses the same process for multiple tests:
initialization is bounded by the problem constraint, and each later query is constant-time.

The memory extreme is deliberately the closest to the hint. It has the smallest auxiliary
footprint and is still comfortably within Range I limits, but it loses when the interval is
wide because it must visit every number.

## Top 1% Performance Strategy

- Use C++ for native branch-heavy digit loops.
- Prefer sign flips over repeatedly comparing all triples in the DP.
- Memoize only non-tight digit-DP states in fixed arrays.
- Avoid heap allocation in the recommended and memory proposals.
- Use a static full-domain prefix table only for the runtime extreme, where the memory
  trade-off is explicit.
- Skip all values below `100` in the memory scan.

## Edge Cases

- `num1 = num2`, including `4848`, which has two waves.
- Ranges entirely below `100`, which return `0`.
- Equal adjacent digits such as `100`, `111`, and `1221`.
- Boundaries crossing digit length, such as `98..102`.
- Maximum range `1..100000`.

## Alternatives

- **String conversion per number:** simpler but allocates or touches more memory per value
  than arithmetic digit extraction.
- **Digit DP with last two digits:** correct, but a previous digit plus comparison sign is
  enough and creates fewer states.
- **Closed-form positional counting:** possible for six digits, but the casework around
  leading digits and tight bounds is less maintainable than the compact DP.

## See Also

All proposals for this challenge are in this C++ folder. The related harder challenge is
`../3753-total-waviness-of-numbers-in-range-ii/`.
