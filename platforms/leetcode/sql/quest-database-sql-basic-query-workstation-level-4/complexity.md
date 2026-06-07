# Complexity

## Recommended - `solution.sql` (fast + lean)

### Time Complexity

```text
O(C)
```

The query evaluates a constant-time predicate for each row of `Customer`. If the database has an
index on `referee_id`, the optimizer may reduce physical work, but the LeetCode schema only
guarantees the primary key on `id`.

### Space Complexity

```text
O(R)
```

`R` is the number of returned names. Aside from the result set and optimizer-internal scan buffers,
the query needs no auxiliary data structure.

## Speed extreme

Coincides with `solution.sql`. There is no faster non-dominated SQL plan for this schema: the task
is a single-table filter, and no sort, join, aggregation, or derived table is required.

### Time Complexity

```text
O(C)
```

### Space Complexity

```text
O(R)
```

## Memory extreme

Coincides with `solution.sql`. The direct filter is also the minimum-memory approach because it can
stream qualifying names without materializing an intermediate table.

### Time Complexity

```text
O(C)
```

### Space Complexity

```text
O(R)
```

## Variables

- `C`: number of rows in `Customer`.
- `R`: number of rows returned by the query.

## Top 1% Performance Strategy

- Keep the plan as one base-table selection and projection.
- Preserve null semantics with `referee_id IS NULL` instead of wrapping the column in a function.
- Do not join to `Customer` again because the referrer row is irrelevant.
- Do not sort because the prompt allows any result order.
- Return only `name`.

## Optimization Notes

The only possible physical improvement would come from a database-managed index on `referee_id`,
which is outside the LeetCode submission. At the query level, the direct predicate is already the
smallest correct expression for both runtime and memory.
