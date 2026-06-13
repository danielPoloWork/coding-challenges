# Complexity

Only `solution.cpp` is shipped. It is simultaneously the recommended, runtime-focused,
and memory-conscious proposal because no separate non-dominated speed or memory variant
exists for the given constraints.

## Recommended - `solution.cpp` (fast + lean)

### Time Complexity

```text
O(d^3 + F * M(d))
```

`d = degree(B) < 2S <= 512`, `F` is the number of valid divisor candidates emitted or
examined during enumeration, and `M(d)` is the cost of fixed-width polynomial
multiplication/division on at most 512 bits.

### Space Complexity

```text
O(d^2) bits
```

The dominant structure is Berlekamp's matrix. Polynomial values themselves use constant
storage under the challenge cap: eight 64-bit limbs.

## Speed Extreme

Coincident with `solution.cpp`. Deterministic Berlekamp factorization plus divisor
enumeration is already the fastest robust approach for the 512-bit maximum encoded
polynomial, so no duplicate `solution-runtime.cpp` is included.

## Memory Extreme

Coincident with `solution.cpp`. Avoiding Berlekamp's matrix would require slower repeated
splitting or trial division while saving only a small fixed amount of memory, so no
duplicate `solution-memory.cpp` is included.

## Variables

- `S`: factor bit length from the input, at most 256.
- `B`: encoded polynomial.
- `d`: degree of `B`, less than `2S`.
- `F`: number of divisor candidates that survive the degree constraints.

## Top 1% Performance Strategy

- Fixed 512-bit polynomial representation in eight `uint64_t` limbs.
- XOR-shift long division for remainder, quotient, and GCD.
- Berlekamp matrix rows stored as `bitset<512>`.
- Multiplication iterates only set bits with `ctz`.
- Equal irreducible factors are grouped before divisor enumeration.

## Optimization Notes

The only realistic improvement would be a specialized Cantor-Zassenhaus implementation,
but at degree 512 deterministic Berlekamp is fast enough, simpler, and avoids random
failure modes. Brute force and local bit reconstruction are dominated.
