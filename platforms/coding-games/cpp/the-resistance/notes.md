# Notes - CodinGame: The Resistance (C++)

## Problem Summary

Given one Morse stream with no spaces and a dictionary of valid words, count how
many different messages can produce exactly that stream. A message is a sequence
of dictionary words; if two different dictionary words share the same Morse
encoding, they still represent different message choices and must both be
counted.

## Three Proposals

- **Recommended (`solution.cpp`) - fast + lean:** encode every dictionary word
  as an exact packed binary key and run a forward word-break DP over the Morse
  stream. This keeps memory near `O(N + L)` while doing at most 80 extensions
  from each reachable position.
- **Speed extreme (`solution-runtime.cpp`):** store dictionary encodings in a
  binary trie and run the same DP by walking trie edges. It avoids hash lookups
  in the hot loop and can break as soon as no dictionary prefix matches, at the
  cost of more memory for trie nodes.
- **Memory extreme (`solution-memory.cpp`):** keep packed dictionary keys in one
  sorted vector, merged by length and key. DP uses binary search instead of a
  hash table or trie, lowering auxiliary dictionary memory while spending extra
  comparisons.

The trade-off is direct: the trie is fastest but largest, the sorted-vector
variant is smallest but slower, and the packed-hash DP is the balanced default.

## Language Choice - Recommended

Candidate languages considered:

- C++: Selected. It packs up to 80 Morse bits into two `uint64_t` values, uses
  native 64-bit DP counts, and offers low-overhead `unordered_map` lookups.
- C: Competitive for raw loops, but hand-writing the hash table and growth logic
  would increase risk without improving the asymptotic profile.
- Rust: Native and safe, but hashing custom packed keys and tight scanner loops
  are more verbose on CodinGame without a measurable advantage here.
- Go: Compiled and simple, but map overhead, bounds checks, and GC behavior are
  weaker than compact C++ storage for top-percentile runtime.
- Java / C#: Capable, but object headers and VM startup are less attractive for
  100000 words and millions of short lookups.
- Python / JavaScript / TypeScript / PHP: Useful for mirrors, but interpreter
  and VM overhead are too high for the largest `L * 80` DP scans.

Chosen language:

- Selected: C++17.
- Why it wins for this proposal: exact packed keys avoid substring allocation,
  and native hash-table probes keep the DP fast while staying much smaller than
  a worst-case trie.
- Why the main alternatives lose: C and Rust do not reduce the core work enough
  to justify added implementation friction; managed and interpreted runtimes
  pay overhead on exactly the repeated lookup path.

## Language Choice - Speed Extreme

Candidate languages considered:

- C++: Selected. Compact `int` child arrays and contiguous `vector<Node>`
  storage make trie transitions a pair of native loads.
- C: Slightly lower-level, but manual dynamic arrays do not beat C++ vectors in
  practice for this fixed two-child trie.
- Rust: Native, but indexing and ownership ceremony make the mutable trie less
  direct with no speed advantage.
- Go: Reasonable compiled performance, but slice/runtime overhead is less ideal
  for millions of tight trie transitions.
- Java / C#: JITs can run the loops quickly, but node arrays and startup costs
  are still less predictable than C++.
- Python / JavaScript / TypeScript / PHP: Not suitable for the raw speed target
  under the maximum input sizes.

Chosen language:

- Selected: C++17.
- Why it wins for this proposal: it gives the smallest hot-loop instruction
  count among the practical CodinGame languages while keeping the trie easy to
  reserve and traverse.
- Why the main alternatives lose: lower-level C does not materially improve the
  memory layout, while managed or interpreted runtimes add avoidable overhead.

## Language Choice - Memory Extreme

Candidate languages considered:

- C++: Selected. A single sorted `vector<Entry>` plus the DP array gives compact
  contiguous storage with only constant vector metadata.
- C: Could store the same array manually, but saves only a few bytes of metadata
  while making sorting and binary search more error-prone.
- Rust: Also compact, but no memory advantage over C++ for the same flat array.
- Go: Slices are simple, but runtime and map-free binary search still carry more
  overhead than the C++ flat vector.
- Java / C#: Primitive arrays can work, but object-free struct packing is less
  natural and VM overhead weakens the memory objective.
- Python / JavaScript / TypeScript / PHP: Their per-object overhead dominates
  the dictionary representation.

Chosen language:

- Selected: C++17.
- Why it wins for this proposal: the variant keeps all dictionary keys in one
  flat sorted array and uses primitive fields only.
- Why the main alternatives lose: C can imitate the layout but not improve the
  algorithmic memory bound; managed and interpreted choices allocate more per
  dictionary entry.

## Constraints

- Morse stream length `L`: `0 < L < 100000`.
- Dictionary size `N`: `0 < N < 100000`.
- Word length `M`: `0 < M < 20`.
- Each encoded dictionary word has at most `4 * M <= 80` Morse symbols.
- The result is guaranteed to fit in signed 63-bit range: `0 <= R < 2^63`.

## Key Observations

- Removing spaces turns the task into word-break counting over a binary string.
- A dictionary word is represented only by its Morse encoding; several words can
  share one encoding, so terminal/key counts must be multiplicities.
- No valid segment can be longer than 80 Morse symbols, making `O(80 * L)` scans
  viable even for the largest stream.
- Substring allocation would dominate runtime, so each proposal consumes the
  stream incrementally one symbol at a time.

## Reasoning Process

The brute-force approach recursively tries every word at every point and quickly
explodes because one prefix can branch into many full messages. Memoization turns
that recursion into dynamic programming: `ways[i]` is the number of valid
messages that produce the first `i` Morse symbols.

The remaining question is how to test dictionary words from position `i` quickly.
Because encoded word length is capped at 80, each proposal extends at most 80
symbols and checks whether the current prefix is a full dictionary encoding.
The balanced solution uses an exact packed key and a hash table; the speed
variant replaces the hash lookup with trie transitions; the memory variant
replaces the hash table with a sorted compact array.

## Final Approaches

Recommended:

1. Convert each dictionary word to Morse.
2. Pack `.` as `0` and `-` as `1` into two 64-bit fields plus a length.
3. Store the packed key in a hash table whose value is the number of words with
   that same encoding.
4. Set `ways[0] = 1`.
5. For every reachable start index, extend up to 80 symbols, update the packed
   key incrementally, and add `ways[start] * multiplicity` to the destination.

Speed extreme:

1. Insert each encoded dictionary word into a binary trie.
2. Keep the terminal multiplicity at the final trie node.
3. Run the same DP, but walk trie children directly and stop early when a
   prefix is absent.

Memory extreme:

1. Store each packed dictionary key in a flat vector.
2. Sort by `(length, low bits, high bits)` and merge equal encodings.
3. Precompute the contiguous range for each Morse length.
4. Run the DP with binary search inside the range for the current length.

## Why These Approaches

All three proposals exploit the fixed 80-symbol maximum encoded word length, so
they avoid both exponential recursion and scanning all dictionary words at every
position. The recommended variant is preferable as the default because it keeps
dictionary memory proportional to the number of distinct encodings, has exact
keys with no collision risk in equality, and avoids the worst-case trie size.

The trie is best when raw speed is the only goal: every extension is just a
two-way child transition and a terminal-count check. The sorted vector is best
when memory is tight: it removes hash buckets and trie nodes, accepting a
`log N` lookup factor.

## Top 1% Performance Strategy

- Encode Morse once per dictionary word.
- Count duplicate encodings instead of storing duplicate word strings.
- Pack codes into two integers; no substring creation occurs during DP.
- Skip unreachable DP positions.
- Limit every start position to `min(80, L - start)` extensions.
- Track which Morse lengths occur so the balanced solution avoids useless hash
  lookups.
- Reserve hash/trie storage before insertion to avoid repeated reallocations.
- Use contiguous vectors and primitive integer fields in every variant.
- Use `long long` for the DP counts because the judge guarantees `R < 2^63`.

## Edge Cases

- A single-symbol stream such as `.` can be decoded by every dictionary word
  whose Morse code is `.`.
- Different words with equal Morse encodings multiply the number of messages.
- If no dictionary prefix matches a reachable position, that branch contributes
  nothing.
- Very long streams remain linear in `L` up to the constant 80.
- Encoded words longer than the remaining suffix are ignored by the scan limit.

## Alternatives

- Plain recursion without memoization repeats the same suffixes exponentially.
- Testing every dictionary word at every position costs `O(L * N * M)` and is
  far too slow for `100000` words.
- Building decoded letter strings first is not useful because the stream has no
  letter separators; dictionary words must be matched in Morse space.
- Divide-and-conquer over the stream is less direct than one-dimensional DP
  because all valid cuts depend on dictionary encodings ending at that point.

## Verification

A temporary Python stress script mirrored the packed-key DP, trie DP, and
sorted-vector DP and compared them with a brute-force reference on edge cases
and randomized small cases. The sample was also verified. The temporary script
was removed after verification.

## See Also

All three maintained proposals for this challenge are in this C++ folder.
