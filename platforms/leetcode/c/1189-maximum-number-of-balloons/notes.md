# Notes - LeetCode 1189: Maximum Number of Balloons (C memory proposal)

## Problem Summary

Given a lowercase string, return how many complete copies of `balloon` can be assembled
without reusing characters. A copy requires `b:1`, `a:1`, `l:2`, `o:2`, and `n:1`.

This folder contains the **minimum-memory C proposal**. The recommended and
fastest-runtime proposal is the C++ direct-address frequency scan in
`../../cpp/1189-maximum-number-of-balloons/solution.cpp`.

## Three Proposals -> Two Files

- **Recommended (`../../cpp/1189-maximum-number-of-balloons/solution.cpp`) - fast + lean:**
  count all 26 lowercase letters in a fixed stack table, then compute the normalized
  limiting frequency.
- **Speed extreme:** coincides with the recommended C++ implementation because the 26-slot
  table gives the most regular hot loop: one indexed increment per character.
- **Memory extreme (`solution-memory.c`) - C target counters:** scan the `char*` once and
  store only counters for `b`, `a`, `l`, `o`, and `n`.

The C memory proposal saves a small constant amount of stack storage compared with the
26-slot C++ table, but it uses a `switch` in the hot loop. That is the right exchange only
for the least-memory axis.

## Language Choice (Memory Extreme)

Candidate languages considered:

- **C++:** Best for recommended/runtime through direct-address counting, but its 26-slot
  table intentionally spends more stack state for a branch-regular loop.
- **C:** Selected. LeetCode's C signature supplies a null-terminated `char*`, and the
  algorithm needs only five scalar counters plus the scan pointer.
- **Rust:** Native and safe, but wrapper/slice metadata and bounds-checking machinery do
  not reduce explicit state below the C version.
- **Go:** Runtime metadata and string/slice handling are larger than the C scalar state.
- **Java / C#:** Managed string/object overhead and runtime baseline are too heavy for the
  minimum-memory objective.
- **Python / JavaScript / TypeScript / PHP:** VM strings and dictionary/counter objects are
  much larger than five native counters.

Chosen language:

- **Selected:** C.
- **Why it wins for this proposal:** it reaches the same exact `O(n)` algorithm while
  storing only the five useful counts.
- **Why the main alternatives lose:** they add language/runtime metadata or spend a larger
  frequency table to improve speed rather than memory.

## Constraints

- `1 <= text.length <= 10000`.
- `text` consists only of lowercase English letters.
- The target word is fixed, so only five letters affect the answer.

## Key Observations

1. Every complete word consumes one `b`, one `a`, two `l`, two `o`, and one `n`.
2. The answer is `min(b, a, l / 2, o / 2, n)`.
3. The input must still be scanned fully because the final character might be the limiting
   useful letter.
4. Characters outside the target can be ignored immediately.

## Reasoning Process

Repeatedly searching for the seven letters of `balloon` would redo work. The useful state
is just the frequency of the target letters. The memory objective should therefore avoid a
full alphabet table and keep only those five counters.

After the scan, dividing `l` and `o` by two normalizes the doubled requirements. The
minimum normalized count is both an upper bound and constructible number of copies, so it
is the exact answer.

## Final Approach

1. Initialize counters `b`, `a`, `l`, `o`, and `n`.
2. Walk the null-terminated input string once.
3. Increment only the matching target-letter counter.
4. Halve `l` and `o`.
5. Return the minimum of the five normalized counters.

## Why This Approach

It minimizes auxiliary state without changing the optimal linear time bound. The C++
runtime proposal is preferable for general use because its direct-address loop is more
regular, but no additional storage beyond five counters is needed to compute the answer.

## Top 1% Performance Strategy

- Keep all state in scalar local variables.
- Ignore irrelevant characters without allocation or mutation.
- Avoid hash maps, sorting, repeated word construction, and repeated deletion.
- Normalize doubled letters once after the scan.

## Edge Cases

- Missing required letter: its counter remains zero, so the result is zero.
- One exact `balloon`: all normalized counts reach one.
- Extra `l` or `o` without enough pairs: integer division by two handles the doubled
  requirement.
- Long irrelevant input: the algorithm still uses constant memory.

## Alternatives

- **26-slot array:** faster and still constant memory, but not the smallest auxiliary
  state.
- **Hash table:** unnecessary for a fixed five-letter target.
- **Sorting:** increases time complexity to `O(n log n)`.
- **Repeated removal:** adds repeated scans and string mutation.

## See Also

- Recommended and fastest-runtime C++ proposal:
  `../../cpp/1189-maximum-number-of-balloons/`
