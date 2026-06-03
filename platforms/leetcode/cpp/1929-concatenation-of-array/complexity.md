# Complexity - LeetCode 1929: Concatenation of Array (C++ proposal)

This challenge is Pareto-optimal: the single recommended solution is also the speed and
memory champion. The figures below therefore describe all three axes at once.

## Recommended - `solution.cpp` (reserve 2n + two bulk copies)

### Time Complexity

```text
O(n)
```

Two bulk copies of `n` ints each (`2n` element writes total), implemented as `memmove`-class
copies. Producing the `2n`-element output forces `Omega(n)` writes, so this meets the lower
bound and is also the speed extreme.

### Space Complexity

```text
O(n) output (exactly 2n ints) + O(1) auxiliary
```

The only allocation is the required `2n`-int result; aside from it there are just a couple of
scalar bookkeeping values - `O(1)` auxiliary space, the floor. Since the result is mandatory
output, this is also the memory extreme.

## Variables

- `n`: `nums.length` (`1 <= n <= 1000`). The output has length `2n`.

## Top 1% Performance Strategy

- `reserve(2n)`: a single exact-size allocation; no reallocation and no over-allocation.
- Two bulk `insert`s (each a `memmove` for trivially copyable `int`) instead of `2n`
  `push_back`s: no per-element capacity/bounds checks.
- No zero-initialization (avoids the `vector<int>(2n)` double-write); the output buffer is the
  only allocation; result returned via NRVO/move.

## Optimization Opportunities

None that change the asymptotics: `O(n)` time and `O(1)` auxiliary space are both optimal for
an operation whose output is `2n` elements. The remaining cost is two contiguous `memmove`s,
already the optimal bulk-copy primitive.

## See Also

None - the speed and memory extremes coincide with this proposal (see `notes.md`).
