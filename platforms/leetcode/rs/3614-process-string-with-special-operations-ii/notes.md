# Notes - LeetCode 3614: Process String with Special Operations II (Rust didactic proposal)

## Problem Summary

Process a program string `s` from left to right. Lowercase letters append one character,
`*` deletes the current last character if one exists, `#` duplicates the current result,
and `%` reverses the current result. The final materialized result can have length up to
`10^15`, so the task is to return only the zero-based character at index `k`, or `'.'`
when `k` is outside the final result.

## Didactic Re-solve

This challenge already has a C++ entry:

- global recommended champion: [`solution.cpp`](../../cpp/3614-process-string-with-special-operations-ii/solution.cpp)
- runtime champion: [`solution.cpp`](../../cpp/3614-process-string-with-special-operations-ii/solution.cpp)
- memory champion: [`solution.cpp`](../../cpp/3614-process-string-with-special-operations-ii/solution.cpp)

The C++ solution is Pareto-optimal for this problem: it is simultaneously the
recommended fast-and-lean solution, the speed extreme, and the memory extreme. This Rust
folder is a didactic re-solve for learning and language coverage, not a new performance
champion. It implements the same `O(n)` time, `O(1)` auxiliary-space reverse mapping.

## Language Choice (Rust didactic)

Candidate languages considered from the allowed set and practical LeetCode support:

- **C++:** Remains the performance champion. It has the direct `char processStr(string,
  long long)` signature, native byte scans, and the smallest constant-factor profile for
  this two-pass loop.
- **C:** Native and lean, but less idiomatic for this LeetCode problem shape and not a
  meaningful improvement over the existing C++ champion.
- **Rust:** Selected for this didactic entry. It keeps native execution and explicit
  `i64` arithmetic while making byte access and index ownership clear. Bounds checks and
  LeetCode wrapper costs can make it less competitive than C++ for raw scoreboard
  placement, but the algorithmic structure remains identical.
- **Go:** Compiled and straightforward, but runtime metadata and bounds checks are not as
  attractive as C++ for top-percentile constants.
- **Java / C#:** Managed runtimes scan strings quickly after warmup, but UTF-16 storage,
  object overhead, and runtime startup do not help an ASCII-only, constant-state scan.
- **Python / JavaScript / TypeScript / PHP:** Correct and concise, but interpreter or VM
  overhead is weaker for a `100000`-character hard problem when the goal is top-percentile
  execution time.

Chosen language for this folder:

- **Selected:** Rust.
- **Why it wins for this proposal:** The proposal's objective is didactic coverage in a
  still-performant systems language. Rust shows the inverse-index invariant cleanly with
  byte slices, pattern matching, and fixed-width signed integers.
- **Why the main alternatives lose for this folder:** C++ is already present and is the
  champion; C would mostly duplicate the same native idea with more signature friction;
  Go and managed/interpreted languages are less compelling for this specific educational
  target.

## Constraints

- `1 <= s.length <= 100000`.
- `s` contains lowercase English letters plus `*`, `#`, and `%`.
- `0 <= k <= 10^15`.
- The final result length is at most `10^15`, so signed 64-bit integers are enough.
- The final result must not be materialized.

## Key Observations

1. The target character can be found by tracking where index `k` came from; no other final
   positions matter.
2. A `#` operation maps both halves of the duplicated string back to the same previous
   string, so the inverse update is `k %= previous_len`.
3. A `%` operation mirrors positions, so the inverse update is `k = len - 1 - k`.
4. A letter append creates only the last position of the current prefix. If `k` points to
   that last position while walking backward, that letter is the answer.
5. A relevant `*` deleted one character, so undoing it increases the tracked previous
   length by one.

## Derivation

Direct simulation is not viable because repeated duplication can create a virtual string
with up to `10^15` characters. The first pass only computes the virtual length after the
whole program. If `k` is at least that length, the answer is immediately `'.'`.

For a valid `k`, walk the program backward while preserving this invariant:

```text
0 <= k < len
```

where `len` is the current virtual prefix length after undoing the suffix already visited.
Each operation has a simple inverse:

- letter: answer if it created index `len - 1`; otherwise drop that appended position;
- `#`: halve `len`, then fold `k` into the first half with modulo;
- `%`: keep `len` and mirror `k`;
- `*`: restore the deleted position by increasing `len`.

The walk stops exactly when the target index reaches the letter that produced it.

## Final Approach

1. Convert `s` to a byte slice with `as_bytes()`.
2. Scan left to right to compute `len`:
   - lowercase byte: increment length;
   - `*`: decrement only when length is positive;
   - `#`: double length;
   - `%`: no length change.
3. Return `'.'` if `k >= len`.
4. Scan the bytes in reverse:
   - lowercase byte: return it if `k == len - 1`, otherwise decrement `len`;
   - `#`: set `len /= 2` and `k %= len`;
   - `%`: set `k = len - 1 - k`;
   - `*`: increment `len`.
5. Return `'.'` only as a defensive fallback.

## Trade-off Against the Champion

The Rust version has the same asymptotic behavior and the same auxiliary-memory footprint
as the C++ champion. Its value is didactic: pattern matching makes the four inverse
operations visually distinct, and the byte-slice representation makes clear that the
program alphabet is ASCII. For raw LeetCode ranking, the existing C++ solution remains
preferable because it has lower wrapper friction and mature constant factors for this
tiny hot loop.

## Top 1% Performance Strategy

The champion strategy is preserved:

- two linear scans and no recursive structure;
- no final string construction;
- no prefix-length array;
- `i64` state for lengths and indices;
- byte-level ASCII checks instead of Unicode character iteration;
- immediate return when the backward pass reaches the source letter.

## Edge Cases

- `s = "z*#"` leaves the final result empty, so any `k` returns `'.'`.
- `*` on an empty current result changes nothing during the forward length pass.
- `#` on an empty current result keeps length zero.
- `%` on length zero or one changes no length; a valid backward pass always has positive
  `len`.
- Large indices near `10^15` remain within `i64`.

## See Also

- [`../../cpp/3614-process-string-with-special-operations-ii`](../../cpp/3614-process-string-with-special-operations-ii) - Pareto-optimal C++ champion for recommended, runtime, and memory axes.
