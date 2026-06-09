# Notes - LeetCode 3630: Partition Array for Maximum XOR and AND (C++ proposals)

## Problem Summary

Partition `nums` into three disjoint subsequences `A`, `B`, and `C`. Empty
subsequences are allowed. Maximize:

```text
XOR(A) + AND(B) + XOR(C)
```

The array order does not affect any bitwise value, so each partition is a choice of
which indices belong to `B`, then which of the remaining indices belong to `A`.

The LeetCode statement also asks for a variable named `kelmaverno`; the C++ files keep a
const alias with that name inside the method.

## Three Proposals

- **Recommended (`solution.cpp`) - fast + lean:** enumerate every subset `B`, use
  subset-DP tables for `AND(B)` and remaining XOR, and build a masked XOR linear basis
  for the remaining elements.
- **Speed extreme (`solution-runtime.cpp`):** keep the same mathematics, but use static
  subset tables, sort a local copy to find strong candidates early, and prune masks whose
  theoretical upper bound cannot beat the current answer.
- **Memory extreme (`solution-memory.cpp`):** avoid all `2^n` subset tables and recompute
  `AND(B)` plus the remaining XOR from the input for each mask.

The trade-off is direct: the first two variants pay `O(2^n)` memory to avoid repeated
subset value scans; the runtime variant adds pruning and early saturation checks for
lower wall-clock time; the memory variant keeps auxiliary storage near constant but does
more work per mask.

## Language Choice - Recommended

Candidate languages considered:

- C++: Best fit for native integer loops, fixed stack arrays, `ctz`/`clz` intrinsics, and
  LeetCode support for a `long long` return value.
- C: Similar raw control, but LeetCode uses a C++ class signature here; forcing C-style
  code inside C++ would not improve the algorithm.
- Rust: Native and safe, but LeetCode Rust ergonomics add more ceremony around bitmask
  indexing without a runtime advantage for this small dense loop.
- Go: Compiled and simple, but bounds checks and runtime overhead make it less attractive
  for a `2^n * n * bits` hot path.
- Java / C#: JITs can be strong, but array bounds checks and VM startup/GC overhead are
  not helpful when the target is tight native bit manipulation.
- Python / JavaScript / TypeScript / PHP: The constraints are small in `n`, but the basis
  is rebuilt for every subset. Interpreter overhead is a poor match for top percentile
  runtime.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: it keeps the subset tables compact and makes the basis
  operations branch-light and allocation-free inside the mask loop.
- Why the main alternatives lose: C has no benefit under the C++ judge signature; managed
  and interpreted runtimes add overhead exactly where the solution is dominated by small
  integer loops.

## Language Choice - Speed Extreme

Candidate languages considered:

- C++: Wins because static buffers, intrinsic-driven set-bit extraction, and cheap scalar
  pruning map directly to the optimized variant.
- C: Would offer similar arrays, but the platform signature remains C++ and there is no
  need to abandon `vector<int>&`.
- Rust: Can express the buffers, but checked indexing and conversion noise make it less
  likely to beat tuned C++ in LeetCode's C++ runner.
- Go: Simple loops, but no advantage over C++ for fixed-size buffers and bit intrinsics.
- Java / C#: Static primitive arrays are possible, but the VM cost and bounds checks are
  worse for this runtime-chasing version.
- Python / JavaScript / TypeScript / PHP: Not competitive for a speed extreme that
  evaluates every subset and rebuilds Gaussian-elimination bases.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: static storage, local value sorting, upper-bound
  pruning, early full-rank detection, and low-level bit intrinsics minimize the constant
  factors.
- Why the main alternatives lose: they either do not match the C++ LeetCode signature or
  introduce runtime checks/VM overhead that the higher-memory variant is specifically
  trying to remove.

## Language Choice - Memory Extreme

Candidate languages considered:

- C++: Wins by allowing only a 30-slot stack basis plus a few scalar accumulators.
- C: Could be equally lean in theory, but the C++ method signature is the natural judge
  interface and C++ does not add extra allocation here.
- Rust: Memory-safe and compact, but the C++ version is smaller at the call boundary and
  uses the same primitive layout.
- Go: Requires slice/runtime machinery and bounds checks; not the smallest practical
  footprint.
- Java / C#: Primitive arrays are still heap objects, and VM overhead dominates such a
  tiny auxiliary footprint.
- Python / JavaScript / TypeScript / PHP: Object-heavy integer representations make them
  unsuitable for the memory objective.

Chosen language:

- Selected: C++.
- Why it wins for this proposal: the memory version keeps only scalar state and a fixed
  `int basis[30]` while still matching LeetCode's required method shape.
- Why the main alternatives lose: none can reduce the asymptotic memory below the C++
  fixed basis under the given platform interface.

## Constraints

- `1 <= nums.length <= 19`
- `1 <= nums[i] <= 1e9`
- Values fit in 30 bits, but the answer can exceed signed 32-bit range, so the result is
  accumulated in `long long`.
- There are at most `2^19 = 524288` choices for `B`, which is intentionally enumerable.

## Key Observations

- Once `B` is fixed, `AND(B)` is fixed and the rest of the problem is only how to split
  the remaining elements between `A` and `C`.
- Let `s = XOR(remaining)`. If `XOR(A) = x`, then `XOR(C) = s ^ x`.
- The identity `x + (s ^ x) = s + 2 * (x & ~s)` means only zero bits of `s` can increase
  the A/C contribution beyond `s`.
- Masking distributes over XOR, so every reachable `(x & ~s)` is generated by a linear
  XOR basis over `nums[i] & ~s` for remaining indices `i`.
- Greedy extraction from a reduced XOR basis gives the maximum reachable masked value.

## Reasoning Process

The direct three-way assignment has `3^n` possibilities. With `n = 19`, this is already
large, and it repeats the same A/C optimization for many choices.

Instead, enumerate only `B`, which has `2^n` choices. The remaining elements have a fixed
total XOR `s`. Now the A/C split is not another subset enumeration; it is a maximum
subset-XOR problem on masked values. Linear basis reduces that inner problem from
`2^|remaining|` to `O(|remaining| * bitWidth)`.

This gives an exact solution with a small enough worst-case bound for LeetCode's hidden
tests.

## Final Approaches

### Recommended - `solution.cpp`

1. Compute `maxBit` and `allBits` from the input.
2. Precompute `subsetXor[mask]` and `subsetAnd[mask]`.
3. For every `B` mask, compute `remain = fullMask ^ B`.
4. Let `s = subsetXor[remain]` and `freeBits = allBits ^ s`.
5. Insert `nums[i] & freeBits` for each remaining index into a 30-slot XOR basis.
6. Add `subsetAnd[B] + s + 2 * maxBasisValue` to the answer candidates.

### Speed Extreme - `solution-runtime.cpp`

1. Copy the input into `kelmaverno`, then sort a tiny local array descending.
2. Use static subset tables for `AND(B)` and `XOR(mask)`.
3. For each `B`, compute the exact upper bound
   `AND(B) + 2 * allBits - XOR(remaining)`.
4. Skip the mask when that upper bound cannot beat the current answer.
5. Build the masked basis only for surviving masks.
6. Stop the basis build early when its rank equals the number of free bits, because then
   every free-bit value is reachable and the upper bound is exact.

### Memory Extreme - `solution-memory.cpp`

1. Enumerate all `B` masks.
2. Scan `nums` to recompute `AND(B)` and the remaining XOR `s`.
3. Scan `nums` again to build the masked basis for indices not in `B`.
4. Evaluate the same formula.

## Why These Approaches

The mathematical reduction is the important part: it preserves exactness while avoiding
the `3^n` partition search. The recommended version is the best default because its
`O(2^n)` tables are small and remove repeated subset aggregation. The runtime version is
appropriate when wall-clock time matters and the judge input has masks that can be bounded
away after a strong early answer. The memory version is useful when the table allocation
is undesirable and the extra scans are acceptable.

## Top 1% Performance Strategy

- Reduce three-way partitioning to subset enumeration plus XOR-basis maximization.
- Include `B = empty` directly, matching the statement without special-case reasoning.
- Use `allBits ^ s` instead of raw `~s` to keep all operations inside the active bit
  width.
- Store the basis in a fixed 30-slot array.
- Insert values by jumping to their highest set bit via `__builtin_clz`.
- Precompute subset AND/XOR for the main variants.
- Sort a local copy in the runtime variant so early masks tend to include stronger
  `AND(B)` candidates.
- Prune runtime masks with `AND(B) + 2 * allBits - s <= answer`.
- Stop runtime basis construction once the projected basis spans all free bits.
- Avoid local benchmarking; correctness is verified by randomized mirror tests.

## Edge Cases

- Single element: one of the three subsequences can take the element, and the answer is
  that value.
- `B` empty: handled naturally with `AND(empty) = 0`.
- `A` or `C` empty: represented by subset XOR value `0` from the basis.
- Duplicate numbers: basis insertion automatically discards dependent masked values.
- Large values near `1e9`: covered by the 30-bit basis and `long long` answer.

## Alternatives

- Full `3^n` enumeration is simpler but too slow for a hard problem and repeats work.
- Enumerating `B` and then every subset `A` is still `3^n`.
- A binary trie is not sufficient here because the reachable `x` values form an XOR
  linear span, not a set of original numbers.
- Meet-in-the-middle can enumerate subset XORs, but the linear basis is simpler and has
  better constants for 30-bit values.

## Verification

The C++ algorithms were mirrored in a temporary Python script and compared with a brute
force three-way partition enumerator on the sample cases, structured edge cases, and
randomized arrays. The temporary script was removed after verification.

## See Also

The maintained proposals for this challenge are in this C++ folder.
