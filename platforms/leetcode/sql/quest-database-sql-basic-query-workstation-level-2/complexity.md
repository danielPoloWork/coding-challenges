# Complexity - LeetCode 181: Employees Earning More Than Their Managers (SQL proposal)

This challenge is Pareto-optimal: the single recommended SQL query is also the speed and memory
champion. The figures below describe all three axes.

## Recommended - `solution.sql` (self inner join)

### Time Complexity

```text
O(E) expected logical work with primary-key lookups or a hash/merge join; O(E log E) with a
tree-index lookup plan
```

`E` is the number of rows in `Employee`. The SQL text exposes one self join on `managerId = id`
and one integer comparison. Because `id` is the primary key, a database engine can use a compact
manager lookup plan. If an engine ignored indexes and used a naive nested loop, physical execution
could degrade to `O(E^2)`, but no better SQL formulation exists than giving the optimizer the
direct key join.

### Space Complexity

```text
O(R) output, plus optimizer-dependent join workspace
```

`R` is the number of employees returned. The query requests no user-level materialization,
sorting, grouping, distinct set, or derived table. A hash plan may allocate `O(E)` engine
workspace; an index nested-loop or streaming plan can use `O(1)` auxiliary query state apart from
the output.

## Speed Extreme

Coincides with the recommended solution. The direct self `INNER JOIN` gives the optimizer the
minimal join relation and direct salary predicate.

## Memory Extreme

Coincides with the recommended solution. The query projects only one output column and avoids
operators that force additional materialized sets.

## Variables

- `E`: number of rows in `Employee`.
- `R`: number of rows returned by the query.

## Top 1% Performance Strategy

- Use a self `INNER JOIN` on the manager primary key.
- Let the join discard `NULL` or missing manager ids naturally.
- Filter with a direct integer comparison.
- Select only `e.name AS Employee`.
- Avoid ordering and duplicate elimination because neither is required.

## Optimization Opportunities

No non-dominated SQL variant remains for the given task. A database index on `Employee(id)` is
already implied by the primary key, and LeetCode controls the physical schema. The submitted query
should stay as the direct self join.

## See Also

None - the speed and memory extremes coincide with this proposal (see `notes.md`).
