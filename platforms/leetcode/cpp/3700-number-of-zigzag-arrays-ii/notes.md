# Notes - LeetCode 3700: Number of ZigZag Arrays II (C++ Pareto-optimal)

## Problem Summary

Count arrays of length `n` with values in `[l, r]`, adjacent values unequal, and no three
consecutive values strictly increasing or strictly decreasing. Return the count modulo
`1_000_000_007`.

Because adjacent values cannot be equal, every adjacent pair has a sign: up or down. A
triple is strictly monotone exactly when two consecutive signs are equal. Therefore every
valid array is precisely a value sequence whose comparison signs alternate.

## Proposals for This Challenge

The direct hint builds a `2m x 2m` transition matrix, where `m = r - l + 1`, and computes a
large power. That is correct. This entry ships a stricter Pareto-optimal version:

- **Recommended (`solution.cpp`) - fast + lean:** C++ mirrored rank DP generates the first
  terms, Berlekamp-Massey recovers the minimal linear recurrence, and Kitamasa computes
  the requested term for `n` up to `1e9`.
- **Speed extreme:** coincides with `solution.cpp`. It replaces repeated dense matrix
  multiplication with a recurrence of order at most `m`, reducing the main work to
  `O(m^2 log n)`.
- **Memory extreme:** coincides with `solution.cpp`. It keeps only O(m) DP, recurrence,
  and polynomial buffers, while matrix exponentiation needs O(m^2) matrix storage.

There is no separate `solution-runtime.cpp` or `solution-memory.cpp` because the
recurrence solution is both faster and smaller than the direct matrix approach.

## Language Choice (C++ for all axes)

LeetCode supports the practical candidate languages, and this problem is dominated by
small modular integer loops over `m <= 75`.

Candidate languages considered:

- **C++:** selected. It gives native modular arithmetic, fixed stack arrays for the DP
  prefix, low-overhead vectors for recurrence polynomials, and direct LeetCode class
  compatibility.
- **C:** native and compact, but the C++ method signature and standard containers make the
  recurrence implementation safer without increasing the asymptotic memory footprint.
- **Rust:** native and memory-safe, but this small mutable polynomial workload gains little
  from Rust's safety model and pays in verbosity and checked-index friction.
- **Go:** compiled and simple, yet slice bounds checks and runtime overhead are not useful
  for a one-shot dense modular recurrence.
- **Java / C#:** primitive arrays can work, but JIT/runtime baseline and managed array
  checks do not improve top-percentile behavior for this small input domain.
- **Python / JavaScript / TypeScript / PHP:** feasible mathematically because `m` is tiny,
  but VM/interpreter modular loops are dominated by native C++ for the performance target.

Chosen language:

- **Selected:** C++.
- **Why it wins for this proposal:** it keeps the whole algorithm in native scalar loops
  and compact contiguous memory.
- **Why the main alternatives lose:** none lowers the asymptotic work or memory, and most
  add runtime overhead or more fragile wrapper code.

## Constraints

- `3 <= n <= 1_000_000_000`.
- `1 <= l < r <= 75`.
- `m = r - l + 1`, so `2 <= m <= 75`.
- The answer is returned modulo `1_000_000_007`.
- Only the relative rank in `[l, r]` matters.

## Key Observations

- Adjacent inequality turns every adjacent pair into either an up sign or a down sign.
- A forbidden monotone triple is exactly an up-up or down-down pair of consecutive signs.
- Valid arrays therefore have alternating signs.
- The two sign directions are mirrors: reversing ranks swaps up-ending and down-ending
  counts.
- The one-direction rank transition is linear and fixed for a given `m`, so the total
  answer sequence satisfies a linear recurrence by Cayley-Hamilton.

## Reasoning Process

For length `2`, let `up[y]` be the number of arrays ending at rank `y` with the last move
up. Then:

```text
up[y] = y
```

For later lengths, an up move into rank `y` must come from a previous down-ending rank
below `y`. By mirror symmetry, previous down-ending rank `x` has the same count as
previous up-ending rank `m - 1 - x`. Therefore:

```text
nextUp[y] = sum up[z] for z >= m - y
```

This is a reversed suffix-sum transform. In Number of ZigZag Arrays I, applying it for
every length is enough. In this problem, `n` can be `1e9`, so even O(nm) is impossible.

The important upgrade is that this transform is the same linear operator at every layer.
If `A` is that `m x m` operator and `s_k` is the total count after `k` applications, then:

```text
s_k = row_sum(A^k * up_length_2) * 2
```

Any scalar sequence produced by powers of a fixed `m`-dimensional linear operator has a
linear recurrence of order at most `m`. Instead of explicitly exponentiating `A`, the code
generates `2m + 5` terms with the O(m) suffix DP, recovers the minimal recurrence with
Berlekamp-Massey, and evaluates the required term with Kitamasa polynomial exponentiation.

## Final Approach - `solution.cpp`

1. Convert the value range to `m = r - l + 1`.
2. Handle `n = 1` defensively, although the stated constraints start at `3`.
3. Generate answer terms starting from length `2` using the mirrored suffix DP.
4. Run Berlekamp-Massey on those terms to recover the minimal recurrence modulo
   `1_000_000_007`.
5. Use Kitamasa to compute the coefficient vector of `x^(n - 2)` under that recurrence.
6. Combine those coefficients with the initial terms to return the final count.

## Why This Approach

The hinted matrix exponentiation is already a good solution, but it stores and squares a
dense matrix. Symmetry first cuts the conceptual matrix from `2m x 2m` to `m x m`.
Berlekamp-Massey then removes the matrix entirely by keeping only the scalar recurrence
that the final answer follows.

This is preferable because it improves both axes at once: lower asymptotic time than dense
matrix exponentiation and O(m) explicit memory instead of O(m^2).

## Top 1% Performance Strategy

- Work on ranks only; `l` does not participate after `m` is known.
- Collapse up/down states by mirror symmetry.
- Generate initial terms with O(m) reversed suffix-sum layers.
- Recover the minimal recurrence, often of order below `m`.
- Use Kitamasa, so the `n = 1e9` jump costs O(d^2 log n), where `d` is the recurrence
  order.
- Keep all arithmetic in C++ integer loops and apply modulo immediately after products.

## Edge Cases

- `m = 2`: exactly two arrays exist for every `n >= 2`, alternating between the two values.
- `n = 3`: `m = 2` gives `2`, and `m = 3` gives `10`, matching the examples.
- Large `n`: handled by recurrence exponentiation rather than layer iteration.
- Different `[l, r]` ranges with the same width have the same answer.

## Verification

A temporary Python script mirrored the C++ recurrence solution, compared it with brute
force for small `n, m`, compared it with the direct two-direction DP for randomized medium
cases, and checked large random `n` values against reduced matrix exponentiation. The
script passed and was removed.

## Alternatives

- **Brute force over arrays:** O(m^n), immediately infeasible.
- **Two-direction DP with prefix sums:** O(nm), good for Number of ZigZag Arrays I but
  impossible for `n = 1e9`.
- **Hinted `2m x 2m` matrix exponentiation:** correct and simpler to derive, but costs
  O(m^3 log n) time and O(m^2) memory with a larger constant.
- **Symmetry-reduced `m x m` matrix exponentiation:** better than the hint, but still
  dominated by the scalar recurrence solution.

## See Also

- Previous finite-`n` variant: `../3699-number-of-zigzag-arrays-i/`
