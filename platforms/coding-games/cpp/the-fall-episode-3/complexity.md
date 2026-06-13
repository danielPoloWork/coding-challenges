# Complexity

Only `solution.cpp` is shipped. It is simultaneously the recommended,
runtime-focused, and memory-conscious proposal because no separate robust
variant is non-dominated for this interactive puzzle.

## Recommended - `solution.cpp` (fast + lean)

### Time Complexity

```text
O(D * B * A * (C + R log R)) per turn before the fixed time cap
```

`D` is the searched depth, `B` is the beam width, `A` is the capped number of
candidate actions per state, `C` is the number of grid cells, and `R` is the
number of visible rocks.

The puzzle bounds are small and fixed:

- `C <= 400`
- `R <= 10`
- `B` is capped at `260` without rocks and `340` with rocks.
- `A` is capped by `WAIT` plus rotations for at most `38 + 3R` priority cells.
- The search stops around `105 ms` to stay under the `150 ms` response limit.

The one-time optimistic reverse BFS costs:

```text
O(C * 3 * F)
```

where `F <= 4` is the largest rotation family size.

### Space Complexity

```text
O(B * (C + R) + C)
```

The beam stores compact copied states: one byte per room plus up to ten rock
records. The precomputed movement, rotation, reachability, and hash tables are
all `O(C)` under the fixed room-type vocabulary.

## Speed Extreme

Coincident with `solution.cpp`. The shipped planner already uses the
runtime-oriented choices that matter for this puzzle:

- fixed-size arrays;
- byte room states;
- precomputed transition and rotation tables;
- capped action generation;
- Zobrist-style state deduplication;
- chrono-bounded beam search.

A narrower greedy search can be faster per turn, but it is dominated because it
misses hard cases that require preparing rooms before Indy reaches them or
planning around rock interactions.

## Memory Extreme

Coincident with `solution.cpp`. A purely greedy solver would store less memory,
but it would not be a valid robust solution for the hard puzzle. The maintained
solution keeps memory proportional to the capped beam and a 400-cell grid, which
is already small for CodinGame.

## Variables

- `C`: grid cells, `C = W * H <= 400`.
- `R`: visible rocks, `R <= 10`.
- `D`: search depth explored before finding a goal or hitting the time budget.
- `B`: retained beam states per layer.
- `A`: candidate actions generated per state.
- `F`: maximum room rotation family size, at most `4`.

## Top 1% Performance Strategy

- Precompute all room transitions and rotations.
- Precompute optimistic distance-to-exit using reverse BFS over `(cell, entry)`
  states.
- Restrict action generation to rooms Indy or visible rocks can plausibly touch
  soon.
- Copy only compact byte arrays in the beam.
- Deduplicate states with precomputed hashes instead of deep comparisons.
- Simulate all rocks with a 400-cell collision count array.
- Prune a state immediately when Indy has entered a room that cannot move him
  next turn.
- Stop before the platform timeout rather than searching to exhaustion.

## Optimization Notes

The largest practical improvement would be a fully exact offline combination
planner for Indy and rock paths with stronger dominance rules. That approach is
more complex and can still spike on cases with many rock alternatives. The
bounded online planner is the better repository proposal because it is compact,
adapts to newly appearing rocks, and keeps turn latency predictable.
