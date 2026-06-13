# Notes - LeetCode 3838: Weighted Word Mapping (C++ proposal)

## Problem Summary

For every word, sum the configured weight of each lowercase letter. Reduce that sum modulo
`26`, then convert the residue through reverse alphabetical order: `0 -> 'z'`, `1 -> 'y'`,
..., `25 -> 'a'`. Concatenate the mapped characters for all words in the original order.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one implementation is best on all meaningful
axes. This problem has only one non-dominated algorithm: every character that contributes
to a word weight must be inspected, and the output must contain one character per word.

- **Recommended (`solution.cpp`) - fast + lean:** scan each word once, sum
  `weights[c - 'a']`, compute `total % 26`, and write `'z' - residue` into a pre-sized
  answer string. `O(T)` time and `O(1)` auxiliary space beyond the output.
- **Speed extreme:** *coincides with the recommended.* The lower bound is `Omega(T)` because
  changing any input character can change the answer. This implementation performs one
  direct table lookup per character and one modulo per word.
- **Memory extreme:** *coincides with the recommended.* The algorithm stores only the output
  string, a pointer to the 26 weights, and scalar loop state. No prefix table, map, or
  per-word temporary container can reduce auxiliary memory.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.*`.

## Language Choice (C++)

Candidate languages considered:

- **C++:** Best fit. LeetCode exposes natural `vector<string>` and `vector<int>` inputs, and
  the workload is a tiny native loop over contiguous string storage. A pre-sized `string`
  writes the output without repeated reallocations.
- **C:** Also native and lean, but LeetCode's C API would require manual result allocation,
  return-size conventions, and string-array pointer handling. That boilerplate does not
  improve the already constant auxiliary memory profile.
- **Rust:** Native and memory-safe, but iterator/bounds-check details and the platform
  wrapper add no advantage for a fixed 26-entry lookup and at most 1000 scanned characters.
- **Go:** Compiled and simple, but slice/string indexing checks and runtime metadata are a
  weaker constant-factor fit than C++ for this micro-loop.
- **Java / C#:** Managed runtimes can solve it easily, but object headers, runtime startup,
  and string-builder machinery are unnecessary for an input capped at 100 words of length
  10.
- **Python / JavaScript / TypeScript / PHP:** Constraints are small enough for acceptance,
  but interpreter/VM overhead per character is dominated by the direct arithmetic work. They
  are not the top-performance choice for the stated goal.

Chosen language:

- **Selected:** C++.
- **Why it wins for this proposal:** It gives the lowest practical LeetCode overhead for the
  required linear character scan while keeping auxiliary memory constant.
- **Why the main alternatives lose:** C adds platform API friction without a real memory
  win; Rust and Go add wrapper/runtime costs that do not buy algorithmic improvement;
  managed and interpreted languages are dominated on constant factors for this direct scan.

## Constraints

- `1 <= words.length <= 100`.
- `1 <= words[i].length <= 10`.
- `weights.length == 26`.
- `1 <= weights[i] <= 100`.
- Every `words[i]` contains only lowercase English letters.
- The maximum word sum is `10 * 100 = 1000`, so `int` arithmetic is comfortably safe.

## Key Observations

1. The weight of a word is independent of every other word, so words can be processed in
   order with no shared state beyond the weight table.
2. Lowercase letters form a dense alphabet, so `c - 'a'` is a direct index into the 26-entry
   weight array.
3. Reverse alphabetical mapping is just arithmetic: the mapped character is
   `static_cast<char>('z' - (sum % 26))`.
4. Since each output character depends on all characters in its word, every input character
   must be read by any correct algorithm.

## Reasoning Process

The direct idea is to compute the described formula literally. The constraints confirm that
there is no need for hashing, sorting, preprocessing by word, or a more complex data
structure. The only meaningful optimization is constant-factor discipline:

1. Allocate the answer string once at exactly `words.length`.
2. Keep a raw pointer to the 26 weights to make the inner lookup as direct as possible.
3. Sum each word in a scalar `int`.
4. Apply modulo once per word, not once per character.
5. Write the mapped character directly into its final position.

This is already the lower-bound algorithm: `T` characters enter the input, and all `T` may
affect the result.

## Final Approach

1. Create an output string of length `words.size()`.
2. For each word index `i`:
   - initialize `total = 0`;
   - for each character `c`, add `weights[c - 'a']`;
   - compute `residue = total % 26`;
   - store `'z' - residue` at `answer[i]`.
3. Return the completed output string.

## Why This Approach

It matches the mathematical definition exactly while avoiding all avoidable overhead. Any
alternative still needs to read the same characters and produce the same number of output
characters, so the practical contest is about allocations and inner-loop work. The selected
version has one output allocation, no auxiliary containers, one table lookup per character,
and one modulo per word.

## Top 1% Performance Strategy

- Use direct addressing with `c - 'a'`; no `unordered_map`, switch table, or branching.
- Pre-size the output string and assign by index instead of repeatedly growing it.
- Keep the weight table behind `weights.data()` for a compact inner loop.
- Apply `% 26` once per word; the maximum sum is only `1000`.
- Store only scalar state, keeping the memory footprint at the lower bound beyond output.

## Edge Cases

- Single word: the output is a one-character string.
- Single-character words: the answer comes directly from that one letter's weight modulo 26.
- All weights equal: the residue depends only on word length.
- Residue `0`: maps to `'z'`.
- Residue `25`: maps to `'a'`.
- Repeated words: processed independently, producing repeated mapped characters.

## Alternatives

- **Modulo after every character:** keeps `total` bounded but adds more modulo operations;
  unnecessary because the maximum sum is tiny.
- **Precompute mapped residues:** a 26-entry residue-to-character table would be correct but
  does not remove the required word sum and adds another object for no meaningful gain.
- **Use a hash map from character to weight:** dominated by direct indexing over the dense
  lowercase alphabet.
- **Interpreted implementation:** fine for acceptance under these constraints, but weaker
  for top-percentile runtime.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
