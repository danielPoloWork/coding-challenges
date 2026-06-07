# Notes

## Problem Summary

Describe the problem in your own words.

## Three Proposals

Every challenge ships three proposals. Summarize each here and the trade-off between them:

- **Recommended (`solution.{ext}`) - fast + lean:** the runtime-first default that still
  keeps memory low.
- **Speed extreme (`solution-runtime.{ext}`):** the asymptotically fastest /
  best constant-factor / early-exit approach, even at higher memory cost.
- **Memory extreme (`solution-memory.{ext}`):** the smallest memory footprint, even at
  some runtime cost.

State the time-space trade-off explicitly. When proposals coincide (the fast + lean
solution is also the fastest and/or the leanest), keep only `solution.{ext}` and say so
here - do not add coincident files. List a speed or memory extreme only when it is a
genuinely different, non-dominated solution.

## Language Choice (per proposal)

For each proposal, state the selected language and explain why it is the most performant
option for that proposal's goal.

Consider:

- Platform requirements.
- Runtime and memory constraints.
- Expected input size.
- Data structures and algorithmic operations used.
- Platform execution characteristics.

Do not use or mention a default language. Each choice must come from performance analysis.
Do not write that the repository requires a specific language. It does not.

For every proposal, keep the candidate-language evaluation explicit:

```text
Candidate languages considered:
- C++:
- C:
- Rust:
- Go:
- Java / C#:
- Python / JavaScript / TypeScript / PHP:

Chosen language:
- Selected:
- Why it wins for this proposal:
- Why the main alternatives lose:
```

Adjust the candidate list to the platform's supported languages, but do not silently skip
a practical candidate. If a language is unsupported or clearly dominated for this problem's
constraints, say that briefly.

## Constraints

- Add relevant input size limits.
- Add value range constraints.
- Add platform-specific requirements.

## Key Observations

- Observation 1.
- Observation 2.

## Reasoning Process

Explain how the solutions were derived from the problem.

1. Start from the direct or brute-force idea.
2. Identify why that idea is sufficient or insufficient.
3. Use the constraints to guide the final algorithms.
4. Explain the transition from observation to implementation for each proposal.

## Final Approaches

Explain each of the three strategies step by step.

## Why These Approaches

Explain why each proposal is the best fit for its objective, and the trade-offs between them.

## Top 1% Performance Strategy

For each proposal, explain the concrete choices used to target top 1% performance for its
objective.

Consider:

- Asymptotic complexity.
- Constant-factor reductions.
- Memory allocation patterns.
- Avoided repeated work.
- Data structure selection.
- Platform-specific performance considerations.

## Edge Cases

- Empty input.
- Single element input.
- Duplicate values.
- Large input.

## Alternatives

Document alternative approaches and why they were not selected.

## See Also

Link the sibling language folders that hold the other proposals, e.g.
`../../{otherExt}/{id}-{slug}/`.
