# Notes - LeetCode 3704: Count No-Zero Pairs That Sum to N (C++ proposal)

## Problem Summary

Given `n`, count ordered pairs `(a, b)` such that both numbers are positive, neither decimal
representation contains digit `0`, and `a + b = n`.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one solution is best on all meaningful axes.
For this problem the optimized carry digit DP is the recommended, speed-extreme, and
memory-extreme solution:

- **Recommended (`solution.cpp`) - fast + lean:** least-significant-digit DP with carry and
  two alive flags. `O(D)` time, `O(1)` extra space.
- **Speed extreme:** *coincides with the recommended.* Any exact method must inspect the
  boundary digits of `n`; this DP does so once with only eight states and stack arrays.
- **Memory extreme:** *coincides with the recommended.* The DP keeps only the current and
  next `2 * 2 * 2` layers, so there is no non-dominated lower-memory accepted variant.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.*`.

## Language Choice (C++)

C++ is the strongest performance fit for this problem. The input has at most 16 digits, so
the workload is dominated by small branch-heavy transitions rather than asymptotic data
movement. Native C++ keeps the DP in fixed stack arrays, uses direct 64-bit arithmetic, and
avoids interpreter and garbage-collector overhead. The result is bounded by `n - 1`, but
`n` can be `10^15`, so `long long` is required for both the parameter and the answer.

## Constraints

- `2 <= n <= 10^15`.
- `D <= 16`, where `D` is the number of decimal digits of `n`.
- Pairs are ordered: `(a, b)` and `(b, a)` are different unless `a == b`.
- Both `a` and `b` must be positive; zero is not a valid addend.

## Key Observations

1. Addition carry flows from the least significant digit to the most significant digit, so
   scanning `n` in that direction avoids a larger tight-state DP.
2. A positive no-zero number, when padded with leading zeroes, looks like non-zero digits
   in all positions below its length and zeroes in all higher positions.
3. While scanning upward, an addend therefore has only two states: alive, meaning the current
   position is still part of the representation, or ended, meaning only padding zeroes remain.
4. The least significant digit cannot be zero, because that would either make the addend zero
   or give it a forbidden trailing zero.
5. Adding one extra target digit `0` forces both addends to transition to ended and also
   rejects any leftover carry.

## Reasoning Process

The direct approach is to enumerate `a` from `1` to `n - 1`, check whether `a` and `n - a`
contain no zeroes, and count the valid pairs. That is impossible at `n = 10^15`.

The constraints point to digit DP. Rather than track whether a zero was ever used, count only
valid representations. From the low end of the number, a no-zero positive integer may keep
choosing digits `1..9`. At any position above the units digit, it may choose `0` exactly once
to end the representation; after that, all higher digits must be padding zeroes.

The DP state is:

```text
position, carry, aliveA, aliveB
```

For each state, try digits `da` and `db` allowed by the alive flags. If
`(da + db + carry) % 10` equals the current digit of `n`, add the state count to the next
carry and next alive flags.

## Final Approach

1. Extract the digits of `n` into a small array from least significant to most significant.
2. Append one extra zero digit.
3. Start with `carry = 0`, `aliveA = 1`, and `aliveB = 1`.
4. For each digit position, enumerate legal digits for `a` and `b`:
   - ended numbers may only use digit `0`;
   - alive numbers may use `1..9`;
   - alive numbers may also use `0` only when `pos > 0`, which ends that number.
5. Keep transitions whose digit sum matches the target digit of `n`.
6. After the appended zero, return the count in `carry = 0`, `aliveA = 0`, `aliveB = 0`.

## Why This Approach

The method counts ordered pairs directly, so there is no post-processing for symmetry. It also
avoids the common pitfall of treating leading padding zeroes as forbidden representation
zeroes. Compared with a most-significant-digit DP, the carry direction is natural and the
state stays tiny.

## Top 1% Performance Strategy

- `O(D)` transitions with `D <= 16`.
- Only eight DP states per digit: two carry states and two alive flags for each addend.
- Fixed stack arrays; no heap allocation, hashing, recursion, or string construction.
- Arithmetic digit extraction avoids `std::string` and `std::vector` overhead.
- `long long` counters avoid overflow without extra conversions.

## Edge Cases

- `n = 2`: only `(1, 1)`.
- `n = 3`: `(1, 2)` and `(2, 1)` are both counted.
- `n = 11`: pairs involving `10` are rejected because the units digit would be an ended
  position too early.
- Powers of ten, such as `10`, `100`, and `10^15`, where many carries and early endings occur.
- Large no-zero values, such as `999999999999999`, where both addends can stay alive through
  the highest real digit.

## Alternatives

- **Brute force enumeration:** straightforward but infeasible for `10^15`.
- **MSD digit DP with zero-used flags:** correct, but it needs awkward carry or borrow
  handling because carries originate on the right.
- **Counting all digit-pair sums with closed forms:** possible, but the alive/end transitions
  around number length are easy to get wrong and do not improve the asymptotic or practical
  profile for 16 digits.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
