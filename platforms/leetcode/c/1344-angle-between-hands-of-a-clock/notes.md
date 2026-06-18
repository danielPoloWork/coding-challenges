# Notes - LeetCode 1344: Angle Between Hands of a Clock (C proposal)

## Problem Summary

Given `hour` and `minutes`, return the smaller angle in degrees between the hour hand and
the minute hand of an analog clock. The hour hand is not fixed at the hour mark: every
minute moves it forward by half a degree.

## Three Proposals -> One File (Pareto-optimal)

This entry ships a single C file because the fastest and leanest strategies are the same
closed-form arithmetic computation:

- **Recommended (`solution.c`) - fast + lean:** scale all angles to half-degree units, compute
  both hand positions as integers, take the smaller circular distance, and divide by `2.0`.
- **Speed extreme:** coincides with the recommended. Any correct solution must inspect the
  two scalar inputs and produce one scalar output; the formula uses a fixed number of integer
  operations and one final floating-point division.
- **Memory extreme:** coincides with the recommended. The computation stores only a few
  scalar integers and allocates nothing, so there is no lower auxiliary-memory target to chase.

There is no separate `solution-runtime.c` or `solution-memory.c` because those files would be
coincident rather than genuinely different, non-dominated proposals.

## Language Choice (C)

Candidate languages considered:

- **C++:** can implement the same formula inside `class Solution` and will optimize well, but
  for a scalar function it does not improve the instruction path or memory footprint over C.
- **C:** selected. LeetCode supports a direct `double angleClock(int hour, int minutes)`
  signature, and the solution needs only integer arithmetic plus one floating-point return.
  C has the smallest practical runtime and library baseline among the supported native options
  for this no-allocation workload.
- **Rust:** native and safe, but its wrapper and bounds-safety ergonomics bring no benefit for
  two scalar inputs and one scalar output.
- **Go:** compiled, but the Go runtime and function-wrapper baseline are heavier than needed
  for this fixed arithmetic path.
- **Java / C#:** JITs can reduce the arithmetic to efficient machine code, but VM startup,
  object/class scaffolding, and managed-runtime baseline are not competitive for the memory
  objective.
- **Python / JavaScript / TypeScript / PHP:** constraints are tiny enough that these languages
  would pass easily, but interpreter/VM overhead dominates the constant-time arithmetic.

Chosen language:

- **Selected:** C.
- **Why it wins for this proposal:** the problem is pure scalar arithmetic; C gives direct
  integer operations, no allocation, no containers, no object metadata, and the leanest
  practical LeetCode baseline.
- **Why the main alternatives lose:** native alternatives tie the algorithm but add no
  performance lever; managed and interpreted languages are dominated by runtime overhead for a
  function whose useful work is fewer than a dozen arithmetic operations.

This is a problem-specific performance choice from the constraints and the operation profile,
not a repository-wide language preference.

## Constraints

- `1 <= hour <= 12`.
- `0 <= minutes <= 59`.
- The answer may be fractional, and LeetCode accepts absolute or relative error within `1e-5`.
- The clock is circular: angles larger than `180` degrees must be converted to their smaller
  complement.

## Key Observations

1. The minute hand moves `6` degrees per minute.
2. The hour hand moves `30` degrees per hour plus `0.5` degrees per minute.
3. Multiplying all angles by `2` removes the `.5`: one full circle is `720` half-degrees.
4. The smaller angle is the circular distance `min(diff, full_circle - diff)`.

## Reasoning Process

A simulation-style mental model would move both hands from `12:00` until the requested time.
That is unnecessary because both hands move linearly and the input has only two scalar values.

In degrees:

```text
hour_angle   = (hour % 12) * 30 + minutes * 0.5
minute_angle = minutes * 6
```

To avoid floating-point arithmetic in the core computation, multiply both by `2`:

```text
hour_half_degrees   = (hour % 12) * 60 + minutes
minute_half_degrees = minutes * 12
```

The absolute difference is in `[0, 720]` half-degrees. If it is greater than `360`
half-degrees (`180` degrees), the smaller angle is the complement around the clock:
`720 - diff`.

## Final Approach

1. Convert `12` to `0` with `hour % 12`.
2. Compute the hour-hand position in half-degrees:
   `(hour % 12) * 60 + minutes`.
3. Compute the minute-hand position in half-degrees:
   `minutes * 12`.
4. Take the absolute difference.
5. If the difference is more than half a circle (`360` half-degrees), replace it with
   `720 - diff`.
6. Return `diff / 2.0`.

## Why This Approach

The formula directly models the real hand positions, including the minute contribution to the
hour hand. It is exact in integer half-degree units for every valid input and only converts to
`double` after the smaller circular angle is known.

The time-space trade-off is optimal on both axes: `O(1)` time, `O(1)` auxiliary space, no
loops, no tables, no allocation, and no avoidable floating-point operations.

## Top 1% Performance Strategy

- Use half-degree integer scaling to avoid repeated or early floating-point operations.
- Use direct arithmetic instead of simulation or branch-heavy case analysis.
- Avoid standard-library calls such as `abs` or `fmin`, keeping the generated code simple and
  portable across C judges.
- Store only scalar locals; no heap, stack arrays, or helper structs.
- Use one final division by `2.0`, which is required only to represent `.5` answers.

## Edge Cases

- `hour = 12, minutes = 0`: both hands are at `0`, answer `0`.
- `hour = 12, minutes = 30`: hour hand is `15` degrees past `12`, minute hand is `180`
  degrees, answer `165`.
- `hour = 3, minutes = 15`: difference is `7.5` degrees, validating the half-degree scale.
- Exactly opposite hands: `diff == 360` half-degrees returns `180`.
- Late hour values such as `hour = 11, minutes = 59`: complement logic handles wrap-around.

## Alternatives

- **Floating-point formula from the start:** correct, but it performs more floating-point work
  than needed and can accumulate small representation noise before the final comparison.
- **Minute-by-minute simulation:** correct but conceptually heavier and dominated by the
  direct linear formula.
- **Case table for each hour:** unnecessary and harder to audit; the arithmetic formula covers
  all 720 half-degree positions uniformly.

## See Also

None - the speed and memory extremes coincide with `solution.c`, as explained above.
