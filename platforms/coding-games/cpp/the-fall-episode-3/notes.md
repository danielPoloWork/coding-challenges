# Notes - CodinGame: The Fall - Episode 3 (C++)

## Problem Summary

Indy falls through a `W x H` grid of tunnel rooms. Each room type maps the side
from which Indy enters (`TOP`, `LEFT`, or `RIGHT`) to an exit direction. Before
each movement step, the program may rotate one unlocked, unoccupied, non-exit
room left or right, or may `WAIT`. Indy and all visible rocks then move
simultaneously through the current room shapes.

The goal is to rotate rooms online so Indy leaves through `EX` at the bottom.
The program must also avoid rocks: a rock in the same room as Indy is fatal,
rocks that hit invalid paths disappear, and rocks that collide with each other
are removed.

The request text says "the-resistance", but the provided statement, starter
code, and URL are for "The Fall - Episode 3", so this entry solves that puzzle.

## Three Proposals

- **Recommended (`solution.cpp`) - fast + lean:** a single per-turn C++ planner
  using exact room simulation, optimistic reverse reachability, and bounded beam
  search over legal rotations.
- **Speed extreme:** coincides with the recommended solution. The same code is
  already tuned for top interactive latency: fixed arrays, capped candidates,
  state hashing, and a chrono turn budget.
- **Memory extreme:** also coincides with the recommended solution. A smaller
  greedy solver would store less, but it would not be robust enough for the hard
  rock cases; the shipped beam keeps only compact copied 400-cell states.

The trade-off is therefore between the shipped robust online planner and
rejected variants that are either faster but fragile or smaller but incomplete.
No separate `solution-runtime.cpp` or `solution-memory.cpp` files are emitted
because those would be coincident or dominated.

## Language Choice - Recommended

Candidate languages considered:

- C++: Selected. It gives native-speed simulation, compact `array` state
  copies, predictable hashing, and deterministic interactive I/O.
- C: Viable for raw loops, but hand-managed beams, hash tables, and action
  ranking would raise risk without improving the bounded 400-cell workload.
- Rust: Native and safe, but fixed-array state copying and mutable search queues
  are more direct in C++ on CodinGame and do not change the performance profile.
- Go: Compiled and simple, but slices, maps, bounds checks, and garbage
  collection are weaker inside the per-turn search loop.
- Java / C#: Capable, but VM startup, object layout, and possible GC pauses are
  less attractive under the `150 ms` response budget.
- Python / JavaScript / TypeScript / PHP: Useful for the temporary correctness
  mirror, but too slow for thousands of simulated decision-tree states per turn.

Chosen language:

- Selected: C++17.
- Why it wins for this proposal: the hot path is "copy a small state, rotate one
  byte, move up to eleven actors, hash the result"; C++ keeps that path in flat
  native storage.
- Why the main alternatives lose: C saves little but adds implementation risk,
  Rust and Go remain competitive but less ergonomic here, and managed or
  interpreted runtimes pay overhead on the exact loop that must stay within the
  interactive budget.

## Constraints

- `1 <= W <= 20`, `1 <= H <= 20`, so at most `400` rooms.
- Room type absolute value is in `0..13`; negative input means locked.
- `0 <= R <= 10` visible rocks per turn.
- `0 <= EX < W`; the exit is below row `H - 1`.
- Each response must be produced in at most `150 ms`.
- A room containing Indy or a rock cannot be rotated; the exit-leading room
  `(EX, H - 1)` is treated as non-rotatable.

## Key Observations

- Indy and rocks never move upward. This makes the maze path-like, but
  horizontal slides and future rotations still create a large decision tree.
- Rotating the room currently containing Indy is forbidden, so a room must be
  prepared before Indy enters it. A 180-degree change may need two earlier
  turns.
- The visible rocks cannot be ignored: even a rock that will eventually crash
  can block rotations while it occupies a room.
- Unknown future rocks cannot be precomputed. The safe approach is to replan
  every turn from the real grid orientation and the newly provided rock list.
- A reverse reachability graph over `(x, y, entry)` states gives a cheap
  optimistic distance to the exit if future rotations were freely available.
  This is not a full solution, but it is an excellent pruning heuristic.
- A state is still viable when Indy's next target cell is not ready yet, as
  long as that target can be prepared on the following turn before Indy enters
  it. Pruning must therefore inspect whether the next move is preparable, not
  whether every next-room orientation is already correct.

## Reasoning Process

The naive tree tries `WAIT` plus both rotations of every rotatable room on every
turn. With dozens of rotatable rooms and around forty movement steps, the tree
is astronomically large.

The first reduction is to model the room system exactly. The 14 room types are
encoded as a small transition table, and the four rotation families are encoded
as deterministic type permutations. From there, every candidate action can be
simulated without special cases.

The second reduction is an optimistic reverse BFS. For every room and entry
side, the solver asks: "if any future orientation in this room's rotation family
were available, how many moves could still reach the exit?" Locked rooms and the
exit room keep only their current type. This gives a lower-bound style distance
for ranking states and identifying useful rooms.

The final reduction is a time-bounded beam search. At each depth, the solver
keeps only the best compact states, generates rotations only for rooms Indy or
rocks can plausibly interact with soon, simulates all actors, removes rock-rock
collisions, rejects fatal states, deduplicates by a Zobrist-style hash, and
continues until it finds an exit path or the time budget is nearly spent.

## Final Approach

1. Read the grid, store room types as bytes, and keep a separate locked mask.
2. Initialize the exact movement table for room types `0..13`.
3. Initialize rotation tables:
   - `2 <-> 3`
   - `4 <-> 5`
   - `6 -> 7 -> 8 -> 9 -> 6`
   - `10 -> 11 -> 12 -> 13 -> 10`
4. Build possible future type families for each room. Locked cells and the exit
   cell have one possible type; unlocked cells use their rotation family.
5. Run reverse BFS over `(cell, entry)` states to compute optimistic distance to
   the exit cell.
6. On every game turn, load Indy and visible rocks into the current mutable
   grid state.
7. Run beam search:
   - Generate `WAIT` plus left/right rotations for high-priority future cells.
   - Reject actions that target locked, occupied, type-0/type-1, or exit cells.
   - Apply the rotation to a copied state.
   - Move Indy and rocks simultaneously through the rotated grid.
   - Remove rocks that crash, leave the grid, collide with other rocks, or
     cross paths with another rock.
   - Reject any branch where Indy and a rock land in the same cell or swap
     cells during the same tick.
   - Reject any state where Indy crashes, meets a rock, or stands in a room
     whose next move cannot be prepared on the following turn.
   - Rank surviving states by optimistic exit distance, progress, rock count,
     and local rock risk.
8. Output the first action of the first found exit path; if no complete path is
   found before the budget, output the first action of the best safe partial
   state.
9. Apply the emitted rotation to the persisted grid so the next turn starts from
   the same orientation as CodinGame's engine.

## Why This Approach

The solver is online, which matters because rocks can appear later. Precomputing
one static solution at turn zero is not enough. Replanning every turn lets the
program adapt to the new rock list while preserving all previous rotations in
the persisted grid state.

The reverse BFS heuristic is deliberately optimistic: it ignores rotation time
and rocks, so it is cheap and stable. The beam search then restores reality by
checking rotation legality, one-action-per-turn timing, rock blocking, and
collisions through exact simulation.

This is preferable to pure DFS because the hardest cases contain many
irrelevant rooms. Beam ranking lets the solver spend its 150 ms budget on states
that are still close to an exit path and near rooms that can actually affect
Indy or visible rocks.

## Top 1% Performance Strategy

- Store each room type in one byte and copy at most `400` bytes per state.
- Use fixed-size arrays for the grid, Indy, and up to `10` rocks.
- Precompute movement, rotation, possible-type families, optimistic distances,
  and hash salts once.
- Generate rotations only for cells reached by a short future exploration from
  Indy and the rocks, plus a greedy optimistic route.
- Keep the beam width fixed and cap the number of rotated cells per state.
- Use Zobrist-style hashes to deduplicate states cheaply.
- Simulate rocks in one pass and remove rock-rock collisions with a 400-cell
  count array.
- Reject doomed Indy states immediately if the room he has just entered cannot
  move him on the next turn.
- Stop search around `105 ms`, leaving margin below CodinGame's `150 ms` turn
  limit.

## Edge Cases

- A room of type `0` cannot be traversed or usefully rotated.
- Type `1` is rotation-invariant, so rotating it is never generated.
- Straight and two-corner families have left and right rotations that lead to
  the same type; only one equivalent action is generated.
- Rocks that move into the same room as Indy are fatal even if multiple rocks
  also collide there.
- A rock that crosses Indy in the opposite direction during the same tick is
  also fatal; this is the failure mode exposed by `only_one_way.in`.
- Two rocks that move into the same non-Indy room, or swap cells while moving in
  opposite directions, are removed before the next turn.
- A rock that gets stuck after entering a room disappears after this movement
  step, but it still blocks rotation during the current turn before it moves.
- If Indy's current room cannot emit him through any valid next cell even after
  preparing that next cell on the following turn, the branch is pruned. The
  target cell itself does not need to be ready immediately; `rock_interception`
  relies on rotating `(4,3)` one turn after preparing the rock collision at
  `(4,2)`.

## Alternatives

- Exhaustive rotation DFS is complete but explodes on hard rock scenarios.
- Static path planning without rocks solves early cases but fails once rocks
  enter and block rooms or collide with Indy.
- Greedy "rotate only the next room" logic misses rooms requiring two turns of
  preparation.
- Full exact search over the whole grid orientation vector is too large; the
  beam keeps only promising states under a strict time cap.
- Treating rocks as independent paths misses interactions with Indy rotations
  and rock-rock collisions.

## Verification

A temporary Python mirror of the room transitions, rotations, movement
simulation, rock collision rules, optimistic reachability, and small-state
search was compared with an exhaustive BFS reference on edge cases and
randomized small grids. After the `only_one_way.in` report, the mirror was
extended to cover crossed Indy-rock and rock-rock collisions plus exit-cell
semantics, and it completed the public `only_one_way.in` fixture from the
CodinGame test server. After the `rock_interception.in` report, the mirror
covered the weaker "next cell can be prepared later" pruning rule and completed
that fixture with the intended rock-rock interception. The sample's first turn
was also verified:
`11 RIGHT -> 12`, which makes the example rotation at `(0,1)` produce the
documented next positions. The temporary script was removed after verification.

## See Also

The maintained proposal for this challenge is in this C++ folder.
