# Notes - LeetCode 3614: Process String with Special Operations II (C++ proposal)

## Problem Summary

Process a program string `s` from left to right. Lowercase letters append one character to
the current result, `*` removes the current last character if present, `#` duplicates the
whole current result, and `%` reverses it. The final materialized result can be enormous
relative to `s`, so return only the character at zero-based index `k`, or `'.'` when that
index is outside the final result.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one implementation is best on all meaningful
axes. Here the reverse index-remapping solution is the recommended, speed-extreme, and
memory-extreme solution:

- **Recommended (`solution.cpp`) - fast + lean:** scan once to compute the final length,
  reject out-of-bounds `k`, then scan `s` backward and undo each operation on the tracked
  index. `O(n)` time and `O(1)` auxiliary space.
- **Speed extreme:** *coincides with the recommended.* Any exact solution must read the
  operation string at least once, and this implementation uses only two branch-light scans,
  no heap allocation, no vector of prefix lengths, and no final-string construction.
- **Memory extreme:** *coincides with the recommended.* The algorithm stores only `len`,
  `k`, and loop variables. The common prefix-length array approach costs `O(n)` memory and
  gives no runtime advantage for this input size.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.*`.

## Language Choice (C++)

Candidate languages considered:

- **C++:** Best fit. The accepted signature is `char processStr(string s, long long k)`;
  the hot path is two linear scans over contiguous bytes and a few 64-bit integer updates.
  C++ gives native code, direct string size access, cheap character indexing, and no GC or
  interpreter overhead.
- **C:** Considered for raw pointer scans and low runtime baseline, but public LeetCode
  references for this problem focus on C++/Java/Python/Go style signatures rather than C.
  Even with a C runner, the same two-pass `O(1)` algorithm would not improve the meaningful
  auxiliary-memory profile over C++ for this platform task.
- **Rust:** Native and safe, but checked indexing and LeetCode wrapper overhead do not buy
  anything for a simple byte-program scan with a single returned character.
- **Go:** Compiled and easy to express, but string indexing plus runtime metadata and bounds
  checks are a weaker constant-factor fit than C++ for top-percentile runtime.
- **Java / C#:** JITs can scan strings quickly after warmup, but managed-runtime startup,
  UTF-16 string representation, and object overhead are unnecessary for an ASCII-only
  operation stream.
- **Python / JavaScript / TypeScript / PHP:** Correct and concise, but interpreter/VM
  overhead in the backward scan is a poor match for a `1e5` length top-performance target.

Chosen language:

- **Selected:** C++.
- **Why it wins for this proposal:** It gives the strongest practical blend of raw scan
  speed, direct LeetCode signature support, 64-bit arithmetic, and constant auxiliary memory.
- **Why the main alternatives lose:** C does not provide a clear platform-supported memory
  win; Rust and Go add wrapper/runtime costs for no algorithmic gain; managed and
  interpreted languages have weaker constants for the required full-string scans.

## Constraints

- `1 <= s.length <= 100000`.
- `s` contains lowercase English letters plus `*`, `#`, and `%`.
- `0 <= k <= 10^15`.
- The processed result length is bounded by `10^15`, so 64-bit signed integers are enough.
- The final result must not be built explicitly.

## Key Observations

1. Only lengths matter until the target index is known; the actual characters are needed
   only when the backward walk reaches the append operation that created the target slot.
2. A duplicate maps positions `m..2m-1` back to `0..m-1`, so `k %= m`.
3. A reverse maps `k` to `len - 1 - k`.
4. A letter append creates only the last position of the current prefix; if `k` is not that
   position, the target existed before the append.
5. When walking backward along a valid index, a `*` operation is crossed only when its
   post-operation string is non-empty, so undoing it increases the previous length by one.

## Reasoning Process

The direct simulation is easy but impossible: `#` can double the result many times, and the
final length can be `10^15`.

The first useful reduction is to store the length after every operation and then walk
backward, undoing the operation that produced the current prefix. This is the standard
solution shape, but the prefix array is not actually necessary. If `k` is valid in the final
string, each inverse step preserves the invariant `0 <= k < len` for the current prefix.
Under that invariant:

- appending a letter reduces the previous length by one unless that letter is the answer;
- duplicating halves the length and remaps `k` into the first half;
- reversing keeps the same length and mirrors `k`;
- deleting with `*` must have deleted some character whenever the current tracked prefix is
  relevant, so the previous length is `len + 1`.

That gives the tighter two-pass algorithm with constant auxiliary storage.

## Final Approach

1. Initialize `len = 0`.
2. Scan `s` from left to right:
   - letter: `++len`;
   - `*`: decrement `len` only if it is positive;
   - `#`: double `len`;
   - `%`: length is unchanged.
3. If `k >= len`, return `'.'`.
4. Scan `s` from right to left:
   - letter: if `k == len - 1`, return that letter; otherwise `--len`;
   - `#`: set `len /= 2` and `k %= len`;
   - `%`: set `k = len - 1 - k`;
   - `*`: set `++len`.
5. Return `'.'` only as a defensive fallback.

## Why This Approach

It treats the operation program as a compact description of a huge virtual string and asks
where the target position originated. The solution never copies characters, never stores
prefix lengths, and never pays for data unrelated to `k`. This is both faster and leaner
than the natural `vector<long long> lengths` implementation while preserving the same
simple proof structure.

## Top 1% Performance Strategy

- Two linear scans over `s`, with no recursion and no dynamic containers.
- Manual lowercase checks instead of locale-sensitive `isalpha`.
- 64-bit integer state only; no string materialization, no stack, no hash map, no prefix
  length vector.
- Early out before the backward pass when `k` is out of bounds.
- Branches match the four operation types directly and keep the hot loop auditably small.

## Edge Cases

- Empty final result after deletes, such as `s = "z*#"`, returns `'.'`.
- `*` on an empty current result is harmless in the forward pass.
- `#` on an empty current result keeps length zero.
- `%` on length `0` or `1` changes no characters; in the backward pass, a valid `k` implies
  a positive current length.
- Repeated reverses mirror the target index each time.
- Large `k` near `10^15` is safe in `long long`.

## Alternatives

- **Build the final string:** simple but infeasible when the result length can reach
  `10^15`.
- **Store all prefix lengths:** correct and common, but costs `O(n)` memory and one vector
  write per operation. It is dominated by the constant-memory inverse walk.
- **Rope or implicit tree:** can represent duplication and reversal lazily, but it is
  unnecessary because only one final index is requested.
- **Forward symbolic mapping:** awkward around deletes because future operations determine
  whether an earlier character survives; backward mapping is direct.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
