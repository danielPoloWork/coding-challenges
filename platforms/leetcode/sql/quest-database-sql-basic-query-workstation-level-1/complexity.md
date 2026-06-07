# Complexity - LeetCode 175: Combine Two Tables (SQL proposal)

This challenge is Pareto-optimal: the single recommended SQL query is also the speed and
memory champion. The figures below describe all three axes.

## Recommended - `solution.sql` (left outer join)

### Time Complexity

```text
O(P + A) logical join work with a hash/merge plan, or O(P log A) with an index lookup plan
```

`P` is the number of rows in `Person`, and `A` is the number of rows in `Address`. The SQL text
exposes one outer join on `personId` and one projection. A cost-based engine may implement that
as a hash join, merge join, or index nested loop. If an engine had no usable join strategy, a
naive nested loop could degrade to `O(P * A)`, but there is no faster SQL formulation than giving
the optimizer the direct key join.

### Space Complexity

```text
O(R) output, O(A) engine join workspace for a hash plan, or O(1) auxiliary query state with an
index/streaming plan
```

`R` is the number of output rows. The query itself requests no extra user-level materialization,
sorting, grouping, distinct set, or derived table. The exact workspace is chosen by the SQL
engine's physical plan.

## Speed Extreme

Coincides with the recommended solution. The direct `LEFT JOIN` is the minimal relational
expression and gives the optimizer the most freedom to choose the fastest physical plan.

## Memory Extreme

Coincides with the recommended solution. The query projects only required columns and avoids
intermediate result operators that would force extra materialization.

## Variables

- `P`: number of rows in `Person`.
- `A`: number of rows in `Address`.
- `R`: number of result rows after the left join.

## Top 1% Performance Strategy

- Use `LEFT JOIN` directly on `personId`.
- Keep `Person` as the preserved table.
- Select only `firstName`, `lastName`, `city`, and `state`.
- Avoid ordering because the prompt accepts any order.
- Avoid null replacement functions because SQL `NULL` is the required output.

## Optimization Opportunities

No non-dominated SQL variant remains for the given task. A database index on
`Address(personId)` can improve the physical execution plan, but LeetCode controls schema setup;
the submitted query should stay as the direct left outer join.

## See Also

None - the speed and memory extremes coincide with this proposal (see `notes.md`).
