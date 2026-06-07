# Complexity

## Recommended - `solution.sql` (fast + lean)

### Time Complexity

```text
O(n) logical scan work plus primary-key manager existence checks; O(r log r) only if
the engine performs a separate sort for ORDER BY employee_id.
```

With the given primary key on `employee_id`, the manager anti-lookup can be executed as indexed
existence probes or transformed into an anti-join by the optimizer. If the engine scans or returns
qualifying rows in primary-key order, the required `ORDER BY employee_id` does not need an
additional asymptotic sort; otherwise the sort applies only to the `r` qualifying ids.

### Space Complexity

```text
O(r) output, plus optimizer-dependent workspace.
```

The SQL text asks for no derived table, aggregate state, explicit id set, or application-side
materialization. A database engine may still use internal anti-join or sort workspace.

## Speed extreme

Coincides with `solution.sql`. No separate `solution-runtime.sql` is shipped because a distinct
speed-focused query would use the same anti-semi-join information and the same primary-key lookup
surface.

## Memory extreme

Coincides with `solution.sql`. No separate `solution-memory.sql` is shipped because adding another
query shape would not reduce the logical auxiliary memory below the direct anti-existence check.

## Variables

- `n`: number of rows in `Employees`.
- `q`: number of rows with `salary < 30000` and a non-null `manager_id`.
- `r`: number of returned employees.

## Top 1% Performance Strategy

- Apply the salary and non-null manager predicates before checking manager existence.
- Use `NOT EXISTS` against the `employee_id` primary key.
- Return only the requested `employee_id` column.
- Avoid `DISTINCT`, grouping, joins that project manager rows, scalar functions, and client-side
  materialization.
- Keep only the required ordering by primary key.

## Optimization Notes

The compact `NOT IN` form is also accepted for this schema, but the shipped `NOT EXISTS` query is
more robust around SQL null semantics and gives the optimizer a direct anti-existence predicate.
Further optimization would require schema changes such as an index on `salary`, which are outside
LeetCode's submission surface.
