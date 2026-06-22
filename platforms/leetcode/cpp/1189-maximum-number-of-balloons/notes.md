# Notes - LeetCode 1189: Maximum Number of Balloons

## Problem Summary

Given a lowercase string `text`, form as many copies of the word `balloon` as possible.
Every character from `text` can be consumed at most once. Since `balloon` needs one `b`,
one `a`, two `l`, two `o`, and one `n`, the answer is the smallest number of complete
requirements supported by those five letters.

This C++ folder contains the recommended fast + lean proposal. The same implementation is
also the fastest-runtime proposal, so there is no duplicate `solution-runtime.cpp`. The
minimum-memory champion is in `../../c/1189-maximum-number-of-balloons/solution-memory.c`.

## Three Proposals -> Two Files

- **Recommended (`solution.cpp`) - fast + lean:** count all 26 lowercase letters in a
  fixed stack array, then take the minimum of `b`, `a`, `l / 2`, `o / 2`, and `n`.
- **Speed extreme:** coincides with the recommended C++ implementation. The loop body is
  branch-free apart from the loop control and uses one direct indexed increment per
  character, which is the best practical constant-factor shape for LeetCode's C++ runner.
- **Memory extreme (`../../c/1189-maximum-number-of-balloons/solution-memory.c`) - C
  target counters:** keep only the five relevant counters and ignore every other
  character through a `switch`.

The trade-off is intentionally small but real. The C++ recommended/runtime proposal spends
26 stack integers to make the scan regular and direct-addressed. The C memory proposal
stores only five counters, at the cost of branches in the hot loop.

## Language Choice (per proposal)

### Recommended and Speed Extreme - `solution.cpp`

Candidate languages considered:

- **C++:** Selected. The judge input is a `string`; a fixed `int[26]` sits on the stack,
  and the hot loop is one indexed increment per lowercase byte. This avoids hash maps,
  heap allocation, GC, and interpreter overhead while keeping memory negligible.
- **C:** Excellent for the memory champion, but the C string API scans until `'\0'` and a
  target-only counter loop is branchier than the 26-slot direct-address scan used here.
- **Rust:** Native and safe, but byte iteration plus bounds checks/wrapper ergonomics do
  not improve this tiny scalar workload over C++.
- **Go:** Compiled and readable, but slice/string indexing checks and runtime metadata are
  unnecessary for the top-percentile constant-factor target.
- **Java / C#:** JITs handle simple loops well after warmup, but managed runtime baseline
  and string access costs do not beat this allocation-free native scan for `n <= 10000`.
- **Python / JavaScript / TypeScript / PHP:** The constraints are small enough for
  acceptance, but per-character VM/interpreter overhead and object-heavy counters are
  dominated by native scalar code for the repository's performance target.

Chosen language:

- **Selected:** C++.
- **Why it wins for this proposal:** it gives a compact native direct-address frequency
  table, branch-light answer computation, and direct compatibility with LeetCode's string
  call shape.
- **Why the main alternatives lose:** C is leaner only when minimizing auxiliary state;
  managed and interpreted languages add runtime overhead without changing the `O(n)`
  lower bound.

### Memory Extreme - C sibling

Candidate languages considered:

- **C++:** Can store five counters too, but the LeetCode C++ signature still involves a
  `std::string` object and does not reduce the auxiliary state below C's raw pointer scan.
- **C:** Selected for the memory champion. The platform passes a null-terminated `char*`,
  and the implementation needs only five integer counters plus the input pointer.
- **Rust:** Native and compact, but slice/string wrapper metadata and bounds-check
  machinery do not lower peak memory below C for this simple byte scan.
- **Go:** Runtime and string/slice metadata are larger than the C scalar-only approach.
- **Java / C#:** Managed string/object headers and runtime baseline are not suitable for
  the least-memory axis.
- **Python / JavaScript / TypeScript / PHP:** VM strings and dictionary/counter objects are
  much heavier than five native counters.

Chosen language:

- **Selected:** C.
- **Why it wins for this proposal:** it minimizes explicit auxiliary storage while keeping
  the same linear algorithm.
- **Why the main alternatives lose:** they add wrapper, runtime, or object metadata for no
  asymptotic benefit.

## Constraints

- `1 <= text.length <= 10000`.
- `text` contains only lowercase English letters.
- The required word is fixed as `balloon`, so only five character counts affect the answer.

## Key Observations

1. A complete `balloon` consumes `b:1`, `a:1`, `l:2`, `o:2`, and `n:1`.
2. Characters outside those five letters can never help, but they still must be scanned
   because the useful letters may appear anywhere.
3. The answer is limited by the scarcest normalized requirement:
   `min(count(b), count(a), count(l) / 2, count(o) / 2, count(n))`.
4. Since a useful character can occur at the final position, every correct algorithm has
   an `Omega(n)` read lower bound.

## Reasoning Process

The brute-force mental model is to repeatedly try to remove the letters of `balloon` from
the string. That works conceptually, but repeated searches or erasures add unnecessary
passes and mutation. Because the target word is fixed, the only information needed from
the input is the frequency of its required letters.

Counting frequencies collapses all copies at once. After the scan, `b`, `a`, and `n`
contribute one unit per occurrence, while `l` and `o` contribute one unit per pair. The
minimum of those five normalized values is exactly the maximum number of complete words:
if any letter can support only `k` copies, copy `k + 1` is impossible; if every letter can
support at least `k`, then `k` copies can be formed.

## Final Approaches

### Recommended and Speed Extreme - `solution.cpp`

1. Allocate a zero-initialized `int freq[26]` on the stack.
2. Scan `text` once and increment `freq[c - 'a']`.
3. Initialize the answer from `freq['b' - 'a']`.
4. Minimize it with `freq['a' - 'a']`, `freq['l' - 'a'] / 2`,
   `freq['o' - 'a'] / 2`, and `freq['n' - 'a']`.
5. Return the limiting value.

### Memory Extreme - C sibling

1. Scan the null-terminated input string once.
2. Increment only the counters for `b`, `a`, `l`, `o`, and `n`.
3. Ignore all other characters.
4. Return the same normalized minimum.

## Why These Approaches

The frequency formula is exact and reaches the read lower bound. A map, repeated string
search, or repeated deletion would add overhead while computing the same five counts.

The C++ direct-address table is preferable for the default and runtime axes because it
makes the scan regular: one array increment per character and no data-dependent branches
for letter selection. The C proposal is preferable only when the goal is the smallest
auxiliary state.

## Top 1% Performance Strategy

- Use a fixed stack array instead of `unordered_map`, `map`, or dynamic counters.
- Avoid constructing the target word, sorting the text, or mutating the input.
- Use a single input pass and constant-time answer computation.
- Use direct indexed writes in the hot loop for the runtime proposal.
- Use five scalar counters in the C sibling for the memory proposal.
- Divide doubled requirements with a shift on non-negative counts.

## Edge Cases

- No `b`, `a`, `l`, `o`, or `n`: one normalized count is zero, so the result is `0`.
- Exactly one `balloon`: all normalized counts are at least `1`, and one is exactly `1`.
- Many `l` but too few `o`, or vice versa: the pair-normalized minimum handles it.
- Long input full of irrelevant letters: the scan remains linear and returns `0` if any
  required letter is absent.

## Alternatives

- **Repeatedly remove `balloon`:** can degrade to repeated scans and mutations; unnecessary.
- **Sort and count runs:** `O(n log n)` time for a problem with a linear counting solution.
- **Hash map / dictionary frequency:** correct but heavier than a 26-slot array under a
  fixed lowercase alphabet.
- **Only five counters in C++ for runtime:** uses less state but introduces branchy
  character dispatch in the hot loop; better reserved for the memory axis.

## See Also

- Minimum-memory C proposal: `../../c/1189-maximum-number-of-balloons/`
