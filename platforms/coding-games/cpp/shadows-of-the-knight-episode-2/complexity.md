# Complexity

Only `solution.cpp` is shipped. It is simultaneously the recommended,
runtime-focused, and memory-conscious proposal because no separate
non-dominated speed or memory variant exists for these constraints.

## Recommended - `solution.cpp` (fast + lean)

### Time Complexity

```text
O(V + A*C + P*K) per turn
```

`V` is the number of vertices in the clipped convex polygon, `C` is the number
of accumulated detector constraints, `A` is the capped integer scan area when
the polygon's bounding box is already small, `K` is the number of explicit
integer candidates collected, and `P` is the capped number of scored probes.

Under the puzzle limits, `C <= N <= 100`, `V = O(C)`, rectangular scans are
capped, and a `SAME` line enumerates at most `max(W, H) <= 10000` integer
windows.

### Space Complexity

```text
O(V + C + K)
```

The solver stores the current convex polygon, the exact integer constraints,
and, only near the end or on a `SAME` line, an explicit candidate list.

## Speed Extreme

Coincident with `solution.cpp`. The same half-plane clipping and sampled probe
scoring strategy is already the fastest robust option: it avoids materializing
the grid, avoids square roots, and keeps every turn bounded by small native
vectors.

## Memory Extreme

Coincident with `solution.cpp`. A less geometric solver could store fewer
polygon vertices, but it would need more turns or more fragile axis-specific
logic. The shipped solution keeps memory proportional to the number of jumps
plus a capped candidate list, so no separate memory file is non-dominated.

## Variables

- `W`, `H`: building width and height, both at most `10000`.
- `N`: maximum jumps, at most `100`.
- `C`: number of feedback constraints already received.
- `V`: current clipped polygon vertex count.
- `K`: number of enumerated integer candidate windows.
- `P`: number of candidate probes scored for the next jump.

## Top 1% Performance Strategy

- Compare squared distances only; no `sqrt` or floating distance calls.
- Convert every feedback into one exact integer linear constraint.
- Clip only a convex polygon instead of scanning the full grid.
- Use `long long` for exact integer validation and `long double` only for
  geometric steering.
- Enumerate candidates only when the bounding box is capped or when `SAME`
  restricts the search to one integer line.
- Score all candidates exactly only for small sets; otherwise score quantile
  probes and a reflected-center probe.
- Break equal minimax scores toward a real candidate near the candidate center,
  which avoids wasting the final move on symmetric two- or three-point states.
- Flush with `endl` after each interactive output, as required by CodinGame.

## Optimization Notes

The most direct alternative is an axis-only binary search, but it wastes
diagonal information and can cycle on `SAME` diagonals. Full continuous
trilateration is also possible, but the judge feedback is naturally expressed
as half-planes, so polygon clipping gives the best mix of speed, robustness,
and memory discipline.
