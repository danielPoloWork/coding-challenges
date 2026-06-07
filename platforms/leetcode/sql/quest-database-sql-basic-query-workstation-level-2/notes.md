# Notes - LeetCode 181: Employees Earning More Than Their Managers (SQL proposal)

## Problem Summary

Given an `Employee` table where each row has an employee id, name, salary, and optional
`managerId`, return the names of employees whose salary is strictly greater than the salary of
their manager. The output column must be named `Employee`, and result order is unconstrained.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one solution is best on all meaningful axes. For
this database problem the direct self `INNER JOIN` is the recommended, speed-extreme, and
memory-extreme solution:

- **Recommended (`solution.sql`) - fast + lean:** join `Employee` as employees to `Employee` as
  managers on `managerId = id`, then filter `employee.salary > manager.salary`.
- **Speed extreme:** coincides with the recommended. The query exposes the exact primary-key
  lookup relation to the optimizer and avoids subqueries, sorting, grouping, or derived tables.
- **Memory extreme:** coincides with the recommended. The query projects one column and asks for
  no materialized intermediate relation beyond the engine's chosen join workspace.

There is therefore no separate `solution-runtime.sql` or `solution-memory.sql`.

## Language Choice (SQL)

Candidate languages considered:

- C++: not a LeetCode Database submission language for this schema; solving client-side would
  require extracting the table and building an application-side id-to-salary map.
- C: unsupported for this database prompt and dominated by the database engine's native indexed
  lookup or hash join.
- Rust: strong for in-memory joins, but unsupported here and would still need table
  materialization outside the relational engine.
- Go: unsupported for this SQL schema submission; a map-based implementation would allocate
  more client memory than a pushed-down SQL join.
- Java / C#: not the accepted query interface for the database track; managed-runtime row objects
  and maps would be heavier than a relational self join.
- Python / JavaScript / TypeScript / PHP: Python/Pandas can express a merge, but it materializes
  a DataFrame copy and is weaker for this simple key comparison; the other scripting languages
  are not the intended LeetCode Database interface.

Chosen language:

- Selected: SQL.
- Why it wins for this proposal: the data already lives in a relational table, `id` is a primary
  key, and SQL lets the engine perform the self join and comparison with native null handling.
- Why the main alternatives lose: non-SQL approaches either are unsupported for the database
  prompt or move rows into application memory before doing work that the optimizer can perform
  directly.

## Constraints

- `Employee.id` is the primary key.
- `Employee.managerId` is nullable; top-level managers have no manager row to compare against.
- `salary` is an integer, and the condition is strict: equal salary does not qualify.
- The result can be returned in any order, so no `ORDER BY` is required.
- LeetCode Database accepts a SQL query over the provided schema; schema/index creation is not
  part of the submission.

## Key Observations

1. A manager is another row in the same `Employee` table, so the natural operation is a self join.
2. Rows with `managerId IS NULL` cannot qualify and should disappear without extra logic.
3. Joining `e.managerId` to `m.id` uses the table's primary-key side for the manager lookup.
4. Only `e.name` is required, so selecting extra columns wastes result bandwidth.
5. Because order is unconstrained, sorting would only add work.

## Reasoning Process

The direct idea is to compare every employee with their manager. A brute-force pairwise scan would
check each employee against every other row until it finds the manager, but that hides the real
relation from the database engine and can degrade to quadratic work.

The schema gives the better path: `managerId` is a foreign-key-like reference to `Employee.id`.
By aliasing the table twice, one alias represents the employee (`e`) and the other represents the
manager (`m`). An inner join is correct because employees with no manager have no comparison row
and cannot satisfy "earning more than their manager." After the join, a single salary predicate
selects the qualifying employees.

## Final Approach

1. Read `Employee` as `e` for candidate employees.
2. Join `Employee` again as `m` where `e.managerId = m.id`.
3. Keep only joined pairs where `e.salary > m.salary`.
4. Project `e.name AS Employee`.
5. Leave output ordering unspecified.

## Why This Approach

The self join is the canonical relational expression for comparing rows inside the same table. It
is concise, readable, and optimizer-friendly. Compared with correlated scalar subqueries, it avoids
repeating lookup syntax and gives the engine a simple join plus filter. Compared with Pandas or
application-side logic, it avoids moving table data out of the database.

## Top 1% Performance Strategy

- Use an `INNER JOIN`, which naturally discards `NULL` manager ids without a separate predicate.
- Join on `m.id`, the primary-key column, giving the engine the best chance to use an index nested
  loop, hash join, or merge join.
- Project only `e.name`.
- Avoid `ORDER BY`, `DISTINCT`, `GROUP BY`, derived tables, and computed expressions.
- Keep the comparison as a direct integer predicate: `e.salary > m.salary`.

## Edge Cases

- Employee has no manager: excluded by the inner join.
- Employee earns exactly the same as the manager: excluded by the strict `>` predicate.
- Employee earns less than the manager: excluded.
- Multiple top-level managers: all excluded unless they themselves have a manager row, which the
  nullable schema does not require.
- Empty table: returns an empty result.
- Manager id does not match any row: excluded by the inner join.

## Alternatives

- **Correlated scalar subquery:** correct, but repeats a per-row lookup expression and can be less
  transparent to some optimizers than the direct join.
- **`WHERE managerId IS NOT NULL` plus subquery:** redundant because the inner join already
  enforces a matching manager row.
- **`LEFT JOIN`:** can be made correct with a salary filter, but it first models optional manager
  rows even though non-matches cannot qualify.
- **Pandas merge:** correct, but materializes renamed DataFrame columns and uses more memory than
  the pushed-down SQL join.

## See Also

None - this challenge ships a single Pareto-optimal SQL proposal. The omitted speed and memory
extremes coincide with `solution.sql`, as explained above.
