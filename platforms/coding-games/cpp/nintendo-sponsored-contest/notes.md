# Notes - CodinGame: Nintendo Sponsored Contest (C++)

## Problem Summary

The encoder receives a size `S` and `S / 16` hexadecimal words. The first `S / 32`
words describe one `S`-bit value, and the second `S / 32` words describe another.
For every pair of bit positions `(i, j)`, it XORs the product bit into position
`i + j` of the output.

In plain language, the program multiplies two binary polynomials over `GF(2)` and
prints the product. The decoder must recover every ordered pair of input polynomials
whose product equals the received message, then print the original words in
lexicographic order.

## Three Proposals

- **Recommended (`solution.cpp`) - fast + lean:** represent the encoded message as a
  512-bit polynomial, factor it over `GF(2)` with square-free decomposition and
  Berlekamp's algorithm, then enumerate valid divisors.
- **Speed extreme:** coincides with the recommended solution. The input cap is tiny
  enough that deterministic native polynomial factorization is already the fastest
  robust method; a separate file would duplicate the same implementation.
- **Memory extreme:** also coincides with the recommended solution. The only notable
  auxiliary structure is Berlekamp's bit matrix, about 32 KiB at the maximum degree;
  alternatives that avoid it become slower and are not a non-dominated proposal.

The trade-off is therefore between the shipped algebraic solution and rejected brute
force/backtracking ideas. The algebraic solution wins both runtime and practical memory.

## Language Choice - Recommended

Candidate languages considered:

- C++: Best fit for fixed 64-bit polynomial limbs, low-level shifts/XORs, compact
  `bitset` Gaussian elimination, and CodinGame's native compiler.
- C: Similar raw speed, but manual matrix and vector management would make the solution
  more fragile without saving meaningful memory.
- Rust: Native and safe, but the platform ergonomics and checked indexing do not improve
  this fixed-width bit-arithmetic workload.
- Go: Compiled, but bounds checks and runtime overhead are less attractive for dense
  polynomial and matrix operations.
- Java / C#: Capable for `S <= 256`, but VM startup, object headers, and allocation
  behavior are weaker for a top-percentile target than fixed native storage.
- Python / JavaScript / TypeScript / PHP: Excellent for mirrors and brute checks, but
  not the right execution profile for hidden cases near the maximum degree.

Chosen language:

- Selected: C++17.
- Why it wins for this proposal: it keeps every hot operation as a few machine-word XOR,
  shift, `ctz`, or `clz` instructions and stores the Berlekamp matrix compactly.
- Why the main alternatives lose: lower-level C adds risk without reducing work; managed
  and interpreted runtimes add overhead at exactly the bit-manipulation hot path.

## Constraints

- `0 < S <= 256`.
- The encoder output contains `S / 16` 32-bit hexadecimal words.
- The encoded polynomial degree is below `2S`, so at most 512 coefficient bits are needed.
- The judge guarantees at most 32 decoded outputs.

## Key Observations

- The expression
  `((a[i/32] >> (i%32)) & (a[j/32 + S/32] >> (j%32)) & 1) << ((i+j)%32)`
  is the coefficient product for bit `i` of the left factor and bit `j` of the right
  factor.
- XOR accumulation means addition is modulo 2, so the entire encoder is polynomial
  multiplication over `GF(2)`.
- Every valid decoded message is an ordered factor pair `(X, Y)` such that
  `X * Y = B`, `degree(X) < S`, and `degree(Y) < S`.
- Once `B` is factored into irreducibles, every divisor is obtained by distributing
  irreducible factors, with multiplicity, between `X` and `Y`.

## Reasoning Process

The direct idea is to guess bits of `a` and replay the encoder. That fails because each
output bit is a XOR of many products; changing one input bit can alter many output
positions, and local inversion does not exist.

The nested loops instead reveal a convolution. Over ordinary integers this would be
polynomial multiplication with carries; here the XOR removes carries and makes it exact
arithmetic in `GF(2)`. Decoding then becomes factorization, not search over `2^(2S)`
candidate inputs.

For factorization, the solution first separates repeated factors with square-free
decomposition. It then uses Berlekamp's algorithm on each square-free component: compute
the nullspace of the Frobenius map `h -> h^2 mod f`, use the basis polynomials as
separators, and split by `gcd`. Finally, grouped equal irreducibles are enumerated by
multiplicity to create all divisors.

## Final Approach

1. Parse the `S / 16` hexadecimal words into a little-endian binary polynomial `B`.
2. Compute the formal derivative of `B`.
3. Use square-free decomposition to handle repeated irreducible factors.
4. For every square-free component, run Berlekamp factorization over `GF(2)`.
5. Group identical irreducible factors and precompute powers from exponent `0` to the
   factor multiplicity.
6. Recursively enumerate divisors `X`.
7. For each divisor, compute `Y = B / X` and keep the pair only when both degrees are
   below `S`.
8. Convert `(X, Y)` back into the original word layout: left words first, right words
   second.
9. Sort the rendered lines lexicographically and print them.

## Why This Approach

The solution works at the mathematical level of the encoder. It avoids bit-by-bit
guessing, avoids randomized factorization, and avoids treating the hexadecimal words as
large integers with carries. Because the maximum degree is only 511, the cubic-looking
linear algebra is tiny in absolute terms and gives predictable performance.

## Top 1% Performance Strategy

- Store polynomials in eight `uint64_t` limbs: the whole maximum instance fits in cache.
- Use XOR-shift long division for `mod`, `gcd`, and exact quotient operations.
- Iterate set bits with `__builtin_ctzll` during multiplication.
- Use a fixed `bitset<512>` row representation for Berlekamp Gaussian elimination.
- Factor once, group equal irreducibles, and enumerate powers instead of repeatedly
  multiplying the same factor from scratch.
- Render strings only for valid final factor pairs, then sort the small output list.
- Verify correctness analytically and with a temporary Python mirror, not local
  benchmarking.

## Edge Cases

- Swapped factors: both `(X, Y)` and `(Y, X)` are emitted when they are distinct.
- Repeated factors: square-free decomposition preserves multiplicity before divisor
  enumeration.
- Degree below a full word: conversion still prints all required 8-character words with
  leading zeroes.
- Product with many factors: enumeration is still bounded by the judge's output limit,
  and invalid factor lengths are pruned by degree.

## Alternatives

- Local bit inversion, like the provided sample scaffold attempts, is incorrect because
  the encoder is global XOR convolution.
- Brute force over possible left factors is `2^S`, already impossible at `S = 256`.
- Randomized Cantor-Zassenhaus factorization would be fast, but deterministic Berlekamp
  is simpler to reason about and stable for the small degree cap.
- Treating the words as normal integers fails because integer multiplication carries;
  the encoder performs carryless multiplication.

## Verification

A temporary Python mirror of the polynomial factorization/enumeration algorithm was run
against the official sample and randomized small cases. For small sizes, the mirror was
also compared with brute-force divisor enumeration. The temporary script was removed
after verification.

## See Also

The maintained proposal for this challenge is in this C++ folder.
