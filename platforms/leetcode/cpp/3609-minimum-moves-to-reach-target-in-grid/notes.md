# Notes - LeetCode 3609: Minimum Moves to Reach Target in Grid (C++ proposal)

## Problem Summary

Starting from `(sx, sy)`, each move adds `max(x, y)` to exactly one coordinate. Return the
minimum number of moves needed to reach `(tx, ty)`, or `-1` if no sequence can produce the
target.

## Proposals in This Folder (C++)

- **Recommended (`solution.cpp`) - fast + lean:** reverse greedy reduction from target to
  start. This is also the speed and memory champion: it runs in logarithmic time, uses
  constant memory, and has no genuinely different non-dominated runtime or memory variant.

No separate `solution-runtime.cpp` or `solution-memory.cpp` is included because the
fastest known strategy and the minimum-memory strategy coincide with the recommended
solution.

## Language Choice (C++)

C++ is the best fit for this problem's performance profile. The algorithm is pure integer
arithmetic with a tiny fixed amount of state, so top performance comes from low call and
branch overhead rather than library support. C++ executes the reverse reduction with no
interpreter, VM, GC, heap allocation, or boxed numeric operations. `long long` is used for
the internal arithmetic so checks like `2 * smaller` remain safe and cheap.

## Constraints

- `0 <= sx <= tx <= 1e9`
- `0 <= sy <= ty <= 1e9`
- Coordinates never decrease in the forward process, so any reverse step below the start
  proves impossibility.
- `(0, 0)` is absorbing because `max(0, 0) = 0`.

## Key Observations

- Work backward: every valid forward move has a tightly constrained inverse.
- If the current target is `(x, y)` with `x > y`, the previous point must have changed
  `x`; a move that changed `y` cannot finish with `x > y`.
- For `x > y`, the predecessor is:
  - `(x / 2, y)` when `x >= 2y`, but only if `x` is even.
  - `(x - y, y)` when `x < 2y`.
- The `y > x` case is symmetric.
- If `x == y > 0`, the only possible predecessors are `(0, y)` and `(x, 0)`. This matters
  for starts such as `(0, 1)`, where targets like `(2, 2)` are reachable.

## Reasoning Process

A forward search is not viable on an infinite grid: the branching factor is two and target
coordinates can reach `1e9`. The inverse process is the useful direction because, for
unequal coordinates, the last move is forced.

Suppose `x > y` in the current reverse state. If the previous x-coordinate was `p`, then
the last forward move satisfies `x = p + max(p, y)`. When `p >= y`, this becomes `x = 2p`,
so `x` must be even and the predecessor is `x / 2`. This is exactly the `x >= 2y` case.
When `p < y`, this becomes `x = p + y`, so the predecessor is `x - y`; this is exactly the
`x < 2y` case. That gives a unique reverse step.

Equal positive coordinates are the only branch. To finish at `(a, a)` by changing one
coordinate, the unchanged coordinate is already `a`, and the changed coordinate before the
move must be `0`. Therefore only `(0, a)` or `(a, 0)` can precede `(a, a)`.

## Final Approach

1. Return `0` immediately if target and start already match.
2. Repeatedly reduce the target backward while both coordinates are still at least the
   corresponding start coordinate.
3. For the larger coordinate:
   - halve it if it is at least twice the smaller coordinate and even;
   - reject if it should be halved but is odd;
   - otherwise subtract the smaller coordinate.
4. For equal positive coordinates, try only the zero-coordinate branch(es) compatible with
   the start.
5. Return the reverse step count if the start is reached; otherwise return `-1`.

## Why This Approach

The reverse predecessor is unique except at equality, so the algorithm is not merely a
heuristic: it reconstructs the only possible last move at every unequal state. The equality
branch is tiny and only useful when at least one start coordinate is zero. This preserves
optimality because every reverse step corresponds to exactly one forward move.

## Top 1% Performance Strategy

- Use reverse reduction instead of BFS or DP on an infinite grid.
- Keep only four integers and a move counter: O(1) space and no allocations.
- Use parity checks to reject impossible doubled states immediately.
- Use C++ integer arithmetic and branch-light loops for the lowest constant factors on
  LeetCode's runner.
- Avoid modulo, maps, recursion over large depth, or any target-sized data structure.

## Edge Cases

- Start equals target -> `0`.
- Start `(0, 0)` and positive target -> impossible because the origin cannot move.
- Equal positive target -> branch only to `(0, a)` or `(a, 0)`.
- One zero coordinate -> repeated halving along the zero axis may be valid.
- Odd larger coordinate in a forced-halving state -> impossible.
- Dropping below either start coordinate during reverse reduction -> impossible.

## Alternatives

- Forward BFS is impossible on an infinite grid and unnecessary because the inverse is
  almost deterministic.
- Plain Euclidean subtraction misses the forced-doubling case when the larger coordinate is
  at least twice the smaller one.
- Treating `x == y` as impossible is wrong for zero-coordinate starts, for example
  `(0, 1) -> (2, 2)`.

## See Also

All proposals for this challenge are represented by this C++ solution because the
recommended, speed, and memory objectives coincide.
