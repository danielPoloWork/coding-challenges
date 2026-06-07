# Notes - LeetCode 584: Find Customer Referee (SQL proposal)

## Problem Summary

Given the `Customer` table, return the names of customers who were not referred by customer `2`.
A customer qualifies when `referee_id` is either a different non-null id or `NULL`, meaning the
customer has no referrer.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one solution is best on all meaningful axes. For this
database selection problem, the direct SQL predicate is the recommended, speed-extreme, and
memory-extreme solution:

- **Recommended (`solution.sql`) - fast + lean:** project `name` from `Customer` and keep rows where
  `referee_id <> 2` or `referee_id IS NULL`.
- **Speed extreme:** coincides with the recommended. The query exposes the two needed predicates
  directly to the optimizer and avoids computed expressions, joins, subqueries, and ordering.
- **Memory extreme:** coincides with the recommended. No auxiliary relation or derived table is
  needed; the engine only streams/scans rows and emits the qualifying names.

There is therefore no separate `solution-runtime.sql` or `solution-memory.sql`.

## Language Choice (SQL)

Candidate languages considered:

- C++: not a LeetCode Database submission language for this schema; a client-side implementation
  would require extracting rows before applying a predicate the database can evaluate in place.
- C: unsupported for this database prompt, and manual row handling would add transfer and memory
  overhead compared with a pushed-down SQL filter.
- Rust: excellent for native in-memory filtering, but unsupported here and dominated by executing
  the relational selection where the table already resides.
- Go: unsupported for this SQL schema submission; slices or structs would materialize rows outside
  the database engine for no algorithmic gain.
- Java / C#: not the accepted query interface for the database track; managed row objects would be
  heavier than a single SQL `WHERE` clause.
- Python / JavaScript / TypeScript / PHP: Python/Pandas can express the same condition with
  `isna()` plus inequality, but it materializes DataFrame rows; the other scripting languages are
  not the intended database submission path. SQL is leaner and optimizer-driven.

Chosen language:

- Selected: SQL.
- Why it wins for this proposal: the task is exactly a relational projection with a row filter, so
  SQL lets the database engine apply the predicate directly and return only the required column.
- Why the main alternatives lose: non-SQL approaches either are unsupported for LeetCode Database
  or move table data into application memory before doing work that belongs inside the relational
  engine.

## Constraints

- `Customer.id` is the primary key.
- `Customer.referee_id` may be `NULL`.
- The result contains only the `name` column.
- The result may be returned in any order, so no `ORDER BY` is required.
- LeetCode Database accepts a SQL query over the provided schema; schema/index creation is not part
  of the submission.

## Key Observations

1. Customers referred by `2` are the only rows to exclude.
2. In SQL, `NULL <> 2` evaluates to unknown, not true, so unreferred customers require an explicit
   `referee_id IS NULL` branch.
3. No join is needed because the prompt filters by the numeric referrer id, not by any attribute of
   the referrer row.
4. No sorting is requested, and adding `ORDER BY` would introduce unnecessary work.
5. Only `name` is required, so the projection should not include `id` or `referee_id`.

## Reasoning Process

The direct idea is to scan every customer and exclude the rows whose `referee_id` is exactly `2`.
Writing only `referee_id <> 2` looks tempting, but it silently drops `NULL` rows because SQL uses
three-valued logic. That would remove unreferred customers even though the problem explicitly asks
to include them.

The final predicate therefore has two branches: one for customers referred by someone other than
`2`, and one for customers with no referrer. Since the output order is arbitrary and the table has
no relationship to resolve, the smallest correct plan is a single-table selection plus projection.

## Final Approach

1. Read rows from `Customer`.
2. Keep rows whose `referee_id` is a non-null value different from `2`.
3. Also keep rows whose `referee_id` is `NULL`.
4. Project only `name`.
5. Return the qualifying names without sorting.

## Why This Approach

The query is the canonical relational expression for the requested set: all customers except those
referred by id `2`. Compared with `COALESCE(referee_id, 0) <> 2` or `IFNULL(referee_id, 0) <> 2`,
the explicit `OR referee_id IS NULL` form preserves SQL null semantics without applying a function
to every row. Compared with a subquery or join, it avoids operators that do not contribute to the
answer.

## Top 1% Performance Strategy

- Use one direct `WHERE` predicate over the base table.
- Avoid `COALESCE`, `IFNULL`, `CASE`, and other per-row computed expressions.
- Avoid joins because the referrer row does not need to be inspected.
- Avoid `DISTINCT`, grouping, and sorting because the prompt does not require them.
- Project only `name`, reducing the result payload to the requested column.

## Edge Cases

- Empty table: returns an empty result.
- Single customer with `referee_id = NULL`: included.
- Single customer with `referee_id = 2`: excluded.
- Customer referred by any id other than `2`: included.
- Multiple customers with the same name: all qualifying rows are returned because no duplicate
  elimination is requested.
- A row whose own `id` is `2` but whose `referee_id` is `NULL`: included, because the predicate is
  about who referred the customer, not the customer's own id.

## Alternatives

- **`WHERE referee_id != 2`:** incorrect because it excludes `NULL` referrers.
- **`WHERE referee_id IS NULL OR referee_id <> 2`:** equivalent to the shipped query; predicate
  order is not semantically significant.
- **`WHERE COALESCE(referee_id, 0) <> 2`:** correct for this schema if `0` cannot be a real referrer
  id, but it adds a function call and can make index use less direct.
- **`WHERE IFNULL(referee_id, 0) <> 2`:** MySQL-specific equivalent of the `COALESCE` idea, with
  the same drawbacks and lower portability.
- **Pandas filtering:** correct with `isna()` plus inequality, but it materializes the table outside
  the database engine.

## See Also

None - this challenge ships a single Pareto-optimal SQL proposal. The omitted speed and memory
extremes coincide with `solution.sql`, as explained above.
