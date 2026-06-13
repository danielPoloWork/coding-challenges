# Complexity

This folder ships three genuinely different C++ proposals.

## Recommended - `solution.cpp` (fast + lean)

### Time Complexity

```text
O(N * M + L * B)
```

`B <= 80` is the maximum Morse length of one encoded dictionary word. Hash table
lookups are expected `O(1)`.

### Space Complexity

```text
O(U + L)
```

`U` is the number of distinct Morse encodings in the dictionary. The DP array
stores `L + 1` counts.

## Speed extreme - `solution-runtime.cpp`

### Time Complexity

```text
O(N * M + L * B)
```

The trie walk can stop before `B` when the current Morse suffix has no matching
dictionary prefix, so it has the best constant factor on many inputs.

### Space Complexity

```text
O(T + L)
```

`T` is the number of trie nodes, at most the total encoded dictionary length plus
one. In the worst case, `T = O(N * B)`.

## Memory extreme - `solution-memory.cpp`

### Time Complexity

```text
O(N log N + N * M + L * B * log U)
```

The dictionary keys are sorted and merged first. Each DP extension searches only
within entries of the current Morse length.

### Space Complexity

```text
O(U + L)
```

The constant factor is smaller than the recommended hash-table variant because
there are no buckets and no trie nodes; dictionary data lives in one flat vector.

## Variables

- `L`: length of the input Morse stream.
- `N`: number of dictionary words.
- `M`: maximum number of letters in one dictionary word.
- `B`: maximum Morse symbols in one encoded dictionary word, bounded by `4 * M`
  and therefore at most `80`.
- `U`: number of distinct encoded dictionary words after merging duplicates.
- `T`: number of nodes in the speed variant's binary trie.

## Top 1% Performance Strategy

- The exponential segmentation tree is collapsed into one DP array.
- Dictionary words are matched directly in Morse space.
- No DP loop creates substrings or decoded strings.
- The balanced and memory variants use exact packed keys.
- The speed variant uses a two-child trie with contiguous node storage.
- Duplicate Morse encodings are stored as multiplicities, so every match updates
  DP once instead of once per duplicate word.

## Optimization Notes

`solution.cpp` is the best default for large hidden tests because it is close to
the trie's `O(L * 80)` runtime while using memory proportional to distinct full
word encodings instead of all trie prefixes. Choose `solution-runtime.cpp` when
raw speed matters more than memory, and `solution-memory.cpp` when auxiliary
dictionary storage is the limiting factor.
