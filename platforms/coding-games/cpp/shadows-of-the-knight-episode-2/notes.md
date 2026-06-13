# Notes - CodinGame: Shadows of the Knight - Episode 2 (C++)

## Problem Summary

Batman must find one hidden bomb window in a `W x H` building. After each jump,
the detector reports only whether the new position is closer to the bomb,
farther from it, or at exactly the same Euclidean distance as the previous
position. The grid can contain up to `10000 * 10000` windows, so the solver
must reason about the search space without storing every window.

In plain language, every jump asks: "on which side of the perpendicular
bisector between my previous and current positions is the bomb?"

## Three Proposals

- **Recommended (`solution.cpp`) - fast + lean:** maintain the feasible bomb
  region as a convex polygon clipped by detector half-planes, then choose the
  next jump by reflecting the current position through the center of that
  region. When the feasible integer set becomes small, score candidate probes
  directly.
- **Speed extreme:** coincides with the recommended solution. It already avoids
  the grid, uses exact squared-distance arithmetic, and spends only small
  bounded work per turn.
- **Memory extreme:** also coincides with the recommended solution. It stores
  only the polygon, the constraints, and a capped candidate list; removing the
  polygon would save little and make the search less reliable.

The trade-off is therefore between the shipped geometric binary search and
rejected axis-only or grid-enumeration approaches. The geometric approach wins
both runtime and practical memory.

## Language Choice - Recommended

Candidate languages considered:

- C++: Best fit for native integer arithmetic, compact vectors, deterministic
  latency, and interactive CodinGame output.
- C: Similar raw speed, but manual polygon/candidate vector management adds
  risk without a meaningful memory reduction.
- Rust: Native and safe, but more verbose for interactive geometry and not
  faster for this workload.
- Go: Compiled and simple, but bounds checks, slices, and runtime behavior are
  less attractive under a strict per-turn budget.
- Java / C#: Capable, but VM startup, object overhead, and possible GC behavior
  are weaker for top-percentile interactive latency.
- Python / JavaScript / TypeScript / PHP: Useful for mirrors and prototypes,
  but repeated candidate scoring and geometry updates are not ideal under
  `150 ms` per turn.

Chosen language:

- Selected: C++17.
- Why it wins for this proposal: the solver keeps the hot path in native
  arithmetic, uses `long long` for exact integer constraints, and stores all
  dynamic state in cache-friendly vectors.
- Why the main alternatives lose: C is lower-level without a payoff; Rust and
  Go are competitive but less ergonomic here; managed and interpreted runtimes
  add overhead exactly where the solution needs predictable turn latency.

## Constraints

- `1 <= W <= 10000`.
- `5 <= H <= 10000`.
- `2 <= N <= 100`.
- Coordinates are integer window centers: `0 <= X < W`, `0 <= Y < H`.
- Each turn must respond within `150 ms`.
- The detector uses Euclidean distance and reports `UNKNOWN`, `WARMER`,
  `COLDER`, or `SAME`.

## Key Observations

- Squared distances are enough because `sqrt` preserves ordering.
- For previous point `P`, current point `Q`, and bomb `B`, expanding
  `dist(B, Q)^2 < dist(B, P)^2` cancels `B.x^2` and `B.y^2`.
- The result is a linear constraint:

```text
2*(Q.x-P.x)*B.x + 2*(Q.y-P.y)*B.y + |P|^2 - |Q|^2 > 0
```

- `WARMER` keeps the positive side, `COLDER` keeps the negative side, and
  `SAME` keeps the line itself.
- Repeated detector answers therefore describe a convex feasible region.
- Choosing the next point as the reflection of the current position through the
  region center places the next perpendicular bisector near the middle of the
  feasible region, giving binary-search-like progress.

## Reasoning Process

The brute-force idea is to keep every possible bomb window and delete the ones
that disagree with the feedback. That is impossible for `10000 * 10000`
windows.

The next idea is to binary-search X and Y separately, but the feedback is based
on Euclidean distance, not axis direction. A diagonal jump produces diagonal
information, and `SAME` can leave all candidates on a long diagonal. An
axis-only solver can waste this information or cycle.

Expanding the squared-distance comparison reveals the right abstraction: every
turn gives a half-plane. The building starts as a rectangle, and clipping a
convex polygon by one half-plane is cheap. Once the polygon becomes small
enough, exact integer candidate enumeration becomes faster and removes any
floating-point ambiguity.

## Final Approach

1. Start with the building rectangle as the feasible polygon.
2. Keep all feedback constraints as exact integer lines.
3. After every non-`UNKNOWN` response, derive the perpendicular-bisector
   constraint between the previous and current jumps.
4. Clip the polygon by the corresponding half-plane, or by both sides when the
   response is `SAME`.
5. If a `SAME` line exists, enumerate integer points on that line inside the
   polygon box and validate them against all constraints.
6. Otherwise, enumerate integer candidates only when the polygon bounding box
   is below a fixed scan cap.
7. Once explicit candidates are available, keep that integer set as the exact
   endgame state and filter it directly after every later feedback. The current
   window is also removed, because receiving another detector response proves
   Batman did not land on the bomb.
8. If explicit candidates are available, score exact or sampled probes by the
   worst remaining candidate count after `WARMER` / `COLDER` / `SAME`. Ties
   prefer a probe that is itself a possible bomb, then the probe closest to the
   candidate center.
9. If explicit candidates are not available, compute the polygon centroid and
   jump toward the reflection of the current point through that centroid.
10. Clamp the move to the building bounds and use a farthest fallback probe only
   if rounding would repeat the current position.

## Why This Approach

The solution uses every bit of detector information: horizontal, vertical, and
diagonal jumps are all represented by the same linear constraint. The polygon
keeps the large grid implicit, while the exact integer constraints make the end
game reliable when only a few windows remain.

The special enumeration for `SAME` is important. A same-distance answer can
collapse the search to a long diagonal with a huge bounding box but only
`O(max(W, H))` integer points. Enumerating that line avoids the classic
corner-to-corner cycle.

## Top 1% Performance Strategy

- Use squared distances with `long long`; no square roots are computed.
- Store constraints as integer coefficients and validate candidate windows
  exactly.
- Use `long double` only for polygon clipping and centroid steering.
- Clip a convex polygon with `O(V)` work per feedback instead of scanning the
  grid.
- Keep candidate scans capped; the full `W * H` grid is never materialized.
- After the first exact candidate enumeration, stop relying on floating-point
  polygon bounds for the endgame and filter the integer candidates directly.
- Remove Batman's current window from the candidate list after each feedback:
  if the game continues, that window is a known miss.
- On explicit candidate sets, score all probes only when the set is small and
  otherwise score quantile probes plus a reflected-center probe.
- In endgame ties, prefer centered candidate windows over far endpoints, so the
  solver can win immediately instead of only learning one more `SAME` split.
- Avoid heap-heavy structures such as maps or sets in the per-turn hot path.

## Edge Cases

- `UNKNOWN` first turn: no constraint is applied; the first move probes across
  the building center.
- `SAME` after a diagonal jump: candidates are enumerated along the exact
  bisector line instead of using the large bounding box.
- One-column buildings: the same machinery works as one-dimensional binary
  search over Y.
- Bomb on a corner or border: clamping keeps jumps valid, and exact constraints
  preserve border candidates.
- Rounding to the current position: a farthest valid fallback probe prevents
  a repeated no-op jump.

## Alternatives

- Full grid filtering is impossible at `10000 * 10000` windows.
- Axis-only binary search ignores diagonal information and is fragile after
  `SAME`.
- Pure trilateration tries to solve coordinates from distances, but the puzzle
  gives only relative distance comparisons, so half-plane pruning is the more
  direct model.
- Maintaining only a bounding rectangle is faster to code but loses too much
  information after diagonal cuts.

## Verification

A temporary Python mirror of the half-plane constraints, candidate-line
enumeration, and probe selection was run on edge cases and randomized stress
cases, including large square grids, one-column grids, shallow grids, diagonal
`SAME` scenarios, and corner bombs. The temporary script was removed after
verification.

## See Also

The maintained proposal for this challenge is in this C++ folder.
