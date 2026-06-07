# Complexity - LeetCode 620: Not Boring Movies (SQL proposal)

This challenge is Pareto-optimal: the single recommended SQL query is also the speed and memory
champion. The figures below describe all three axes.

## Recommended - `solution.sql` (filter plus required ordering)

### Time Complexity

```text
O(C + Q log Q)
```

`C` is the number of rows in `Cinema`, and `Q` is the number of rows that pass the two filters. The
logical plan scans the table once, applies two constant-time predicates per row, then orders the
qualifying rows by `rating DESC`. If the physical engine can satisfy the order from an index, the
sort cost may be reduced, but the prompt only specifies `id` as the primary key, so the robust
analysis includes sorting `Q` rows.

### Space Complexity

```text
O(Q) output, plus optimizer-dependent sort workspace
```

The query requests no user-level materialization, join table, grouping set, or distinct set. The
engine may allocate `O(Q)` workspace for the required ordering; a streaming/index-ordered physical
plan could use less auxiliary memory apart from the output.

## Speed Extreme

Coincides with the recommended solution. The direct `WHERE` predicates and single `ORDER BY` are
the minimum logical operations needed for the requested result.

## Memory Extreme

Coincides with the recommended solution. The required sorted output dominates memory behavior, and
the query avoids any extra materialized relation.

## Variables

- `C`: number of rows in `Cinema`.
- `Q`: number of rows returned by the query after filtering.

## Top 1% Performance Strategy

- Filter odd ids and non-boring descriptions before sorting.
- Keep predicates direct and deterministic: `id % 2 = 1` and `description <> 'boring'`.
- Project only the four required output columns.
- Avoid joins, subqueries, `DISTINCT`, `GROUP BY`, and unnecessary secondary ordering.

## Optimization Opportunities

No non-dominated SQL variant remains for the given task. LeetCode controls the physical schema, so
the submitted query should stay as the direct filter plus the required descending rating order.

## See Also

None - the speed and memory extremes coincide with this proposal (see `notes.md`).
