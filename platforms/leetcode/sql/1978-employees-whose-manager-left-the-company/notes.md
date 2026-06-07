# Notes - LeetCode 1978: Employees Whose Manager Left the Company (SQL proposal)

## Source Context

This exercise appears in LeetCode's Database: SQL Basic Query Workstation quiz. The
canonical LeetCode problem identity is problem `1978`, `Employees Whose Manager Left the
Company`.

## Problem Summary

Given the `Employees` table, return the `employee_id` values for employees who satisfy both
conditions:

- their `salary` is strictly less than `30000`;
- their `manager_id` points to an employee id that no longer exists in `Employees`.

Employees with `manager_id IS NULL` do not have a manager, so they must not be reported as
employees whose manager left. The final result must be sorted by `employee_id`.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one solution is best on all meaningful axes.
For this database anti-lookup problem, the direct SQL anti-semi-join is the recommended,
speed-extreme, and memory-extreme solution:

- **Recommended (`solution.sql`) - fast + lean:** filter low-salary rows with a non-null
  `manager_id`, then use `NOT EXISTS` to reject managers still present in the same table.
- **Speed extreme:** coincides with the recommended. The query exposes an anti-semi-join on the
  `Employees.employee_id` primary key, allowing the optimizer to probe or transform the lookup
  without materializing application-side state.
- **Memory extreme:** coincides with the recommended. The query needs no derived table, aggregate,
  explicit temporary id set, or client-side row materialization; it only emits the qualifying ids
  and whatever sort workspace the engine needs for the required order.

There is therefore no separate `solution-runtime.sql` or `solution-memory.sql`.

## Language Choice (SQL)

Candidate languages considered:

- C++: not a LeetCode Database submission language for this schema; a client-side solution would
  need to extract rows and build an id set before applying a predicate that the database can push
  down.
- C: unsupported for this database prompt, and manual row handling would add transfer and memory
  overhead compared with a primary-key anti-lookup inside SQL.
- Rust: strong for native hash-set membership, but unsupported here and dominated by executing the
  relational anti-join where the data already resides.
- Go: unsupported for this SQL schema submission; a map-based implementation would materialize the
  table outside the engine and involve runtime/GC overhead.
- Java / C#: not the accepted query interface for the database track; managed row objects and maps
  would allocate more than the optimizer's native plan.
- Python / JavaScript / TypeScript / PHP: Python/Pandas can express the same test with an anti-merge
  or `isin`, but that materializes DataFrames; the other scripting choices are not the intended
  database submission path. SQL is leaner and optimizer-driven.

Chosen language:

- Selected: SQL.
- Why it wins for this proposal: the task is exactly a relational self anti-lookup with a simple
  salary filter and a required ordering, so SQL keeps the work inside the database engine and lets
  the primary-key index on `employee_id` drive manager existence checks.
- Why the main alternatives lose: non-SQL approaches either are unsupported for the LeetCode
  Database query, or they move table data into application memory before doing work that belongs
  in the relational engine.

## Constraints

- `Employees.employee_id` is the primary key of `Employees`.
- `Employees.manager_id` may be `NULL`.
- A manager who left the company is represented by a non-null `manager_id` with no matching
  `employee_id` row.
- The result must contain only `employee_id`.
- The result must be ordered by `employee_id`.
- LeetCode Database accepts a SQL query over the provided schema; schema/index creation is not part
  of the submission.

## Key Observations

1. The manager relation is a self-reference: a current manager is another row whose
   `employee_id` equals the employee's `manager_id`.
2. A departed manager is therefore the absence of such a row, not a `NULL` manager id.
3. The `salary < 30000` filter can be applied before checking manager existence, reducing the rows
   that need the anti-lookup.
4. `NOT EXISTS` is null-safe when paired with `manager_id IS NOT NULL` and avoids the global
   null trap often associated with `NOT IN`.
5. The only requested column is `employee_id`; selecting extra columns would add payload with no
   benefit.

## Reasoning Process

The direct idea is to scan employees with salary below `30000` and ask whether their manager id is
still present as an employee id. If a matching manager row exists, the employee does not qualify.
If no matching manager row exists, the manager has left and the employee qualifies.

One tempting shortcut is `manager_id NOT IN (SELECT employee_id FROM Employees)`. It is valid here
because `employee_id` is a primary key and therefore non-null, but `NOT IN` is easier to misuse in
the presence of nullable subqueries and may encourage materializing a full id set. A `LEFT JOIN`
with `m.employee_id IS NULL` is also correct, but it describes a join shape when the logical
operation is really an existence check. `NOT EXISTS` states the anti-lookup directly and gives the
optimizer the cleanest relational signal.

The final query first filters for employees who can possibly qualify: low salary and a non-null
manager id. It then performs the anti-lookup against the same table on the primary key and returns
the remaining ids sorted as required.

## Final Approach

1. Read `Employees` as `e`.
2. Keep only rows with `e.salary < 30000`.
3. Exclude rows where `e.manager_id IS NULL`, because those employees simply have no manager.
4. For each remaining row, test whether no row `m` exists with `m.employee_id = e.manager_id`.
5. Project only `e.employee_id`.
6. Order the result by `e.employee_id`.

## Why This Approach

`NOT EXISTS` is the canonical SQL expression for "keep the row only if no related row exists."
Here the related row is the manager. The explicit `manager_id IS NOT NULL` makes the business rule
obvious and prevents employees with no manager from being treated as if their manager had left.
Compared with joins, aggregates, or application-side filtering, the query is smaller, more
optimizer-friendly, and avoids extra memory structures.

## Top 1% Performance Strategy

- Filter on `salary < 30000` before the manager anti-lookup.
- Check `manager_id IS NOT NULL` explicitly to skip impossible candidates.
- Use `NOT EXISTS` on the `employee_id` primary key, giving the engine a direct indexed existence
  probe or anti-join transformation.
- Project only `employee_id`.
- Avoid `DISTINCT`, grouping, aggregates, computed expressions, and client-side materialization.
- Keep the required `ORDER BY employee_id`; because `employee_id` is the primary key, an engine may
  satisfy the order with primary-key scan order or with a small sort over the qualifying ids.

## Edge Cases

- Empty table: returns an empty result.
- Employee with salary `30000`: excluded because the condition is strictly less than `30000`.
- Employee with salary below `30000` and `manager_id IS NULL`: excluded because no manager left.
- Employee with salary below `30000` and a manager row still present: excluded.
- Employee with salary below `30000` and a non-null missing manager id: included.
- Multiple employees reporting to the same departed manager: all qualifying low-salary employees
  are returned independently.

## Alternatives

- **`NOT IN (SELECT employee_id FROM Employees)`:** correct for this schema because
  `employee_id` is non-null, but less robust as a general SQL pattern and may be planned as a
  materialized membership set.
- **`LEFT JOIN Employees AS m ... WHERE m.employee_id IS NULL`:** correct and often optimized to
  the same anti-join, but it expresses a joined row shape when only existence is needed.
- **`COUNT(*) = 0` correlated subquery:** correct, but can force unnecessary counting semantics
  where existence is enough.
- **Pandas anti-merge or `isin`:** correct for the Pandas schema, but heavier than running the
  anti-lookup in the database engine.

## See Also

None - this challenge ships a single Pareto-optimal SQL proposal. The omitted speed and memory
extremes coincide with `solution.sql`, as explained above.
