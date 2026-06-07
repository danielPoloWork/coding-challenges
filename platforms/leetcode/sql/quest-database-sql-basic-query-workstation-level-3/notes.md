# Notes - LeetCode 620: Not Boring Movies (SQL proposal)

## Problem Summary

Given the `Cinema` table, return every movie whose `id` is odd and whose `description` is not
exactly `boring`. The accepted rows must be ordered by `rating` from highest to lowest, and the
result keeps the original four table columns.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one solution is best on all meaningful axes. For
this database filter-and-sort problem, the direct SQL query is the recommended, speed-extreme, and
memory-extreme solution:

- **Recommended (`solution.sql`) - fast + lean:** scan `Cinema`, apply the odd-id and
  non-boring predicates, then order the qualifying rows by descending rating.
- **Speed extreme:** coincides with the recommended. The query exposes both predicates directly to
  the optimizer and performs the single required sort, with no derived tables or extra joins.
- **Memory extreme:** coincides with the recommended. The required output ordering may need engine
  sort workspace, and no SQL rewrite can avoid that while preserving the requested order.

There is therefore no separate `solution-runtime.sql` or `solution-memory.sql`.

## Language Choice (SQL)

Candidate languages considered:

- C++: not a LeetCode Database submission language for this schema; a client-side solution would
  need to materialize table rows before filtering and sorting.
- C: unsupported for this database prompt, and manual row handling would add transfer and memory
  overhead compared with pushed-down SQL predicates.
- Rust: strong for native in-memory filtering and sorting, but unsupported here and dominated by
  executing the relational query where the data resides.
- Go: unsupported for this SQL schema submission; application-side slices would allocate more than
  the database engine's native query path.
- Java / C#: not the accepted query interface for the database track; managed row objects and
  client-side sorting would be heavier than the SQL plan.
- Python / JavaScript / TypeScript / PHP: Python/Pandas can express the same filter and sort, but
  it materializes DataFrame data; the other scripting languages are not the intended database
  submission path. SQL is leaner and optimizer-driven.

Chosen language:

- Selected: SQL.
- Why it wins for this proposal: the data already lives in a relational table, the task is exactly
  a relational selection plus ordering, and SQL lets the database engine perform the filtering and
  sorting without client-side materialization.
- Why the main alternatives lose: non-SQL approaches either are unsupported for the database prompt
  or move rows into application memory before doing work that the optimizer can perform directly.

## Constraints

- `Cinema.id` is the primary key and uniquely identifies a movie.
- `rating` is a two-decimal float in `[0, 10]`.
- A row qualifies only when `id` is odd and `description <> 'boring'`.
- Output must be ordered by `rating DESC`.
- LeetCode Database accepts a SQL query over the provided schema; schema/index creation is not part
  of the submission.

## Key Observations

1. Odd ids can be tested with the remainder of division by two.
2. The description predicate is a direct string inequality; no pattern matching or case folding is
   requested.
3. Filtering should happen before sorting so the engine orders only qualifying rows.
4. All four columns are part of the required result, so explicit projection keeps the output stable.
5. Because the final order is required, the query must include `ORDER BY rating DESC`.

## Reasoning Process

The direct idea is to inspect every `Cinema` row, keep the rows that satisfy the two predicates,
and then sort the remaining rows by rating. There is no relationship to join, no aggregation to
compute, and no need for duplicate elimination because `id` is already unique.

The only potentially expensive operator is the final ordering. Since LeetCode controls the schema
and only the primary key is specified, the safest high-performance query is the one that minimizes
work before the sort: direct predicates in `WHERE`, no subquery, no grouping, and no computed
projection beyond the required columns.

## Final Approach

1. Read rows from `Cinema`.
2. Keep only rows where `id % 2 = 1`.
3. Keep only rows where `description <> 'boring'`.
4. Project `id`, `movie`, `description`, and `rating`.
5. Order the qualifying rows by `rating DESC`.

## Why This Approach

The query is the canonical relational expression for this problem: one selection followed by one
required ordering. Compared with subqueries or `CASE` expressions, it gives the optimizer the
smallest plan shape. Compared with Pandas or client-side logic, it avoids moving the table out of
the database engine.

## Top 1% Performance Strategy

- Push both predicates into `WHERE` so non-qualifying rows are discarded before ordering.
- Use a numeric parity check, `id % 2 = 1`, instead of string or arithmetic detours.
- Use a direct inequality, `description <> 'boring'`, avoiding pattern matching and function calls.
- Select only the required columns in stable schema order.
- Avoid `DISTINCT`, `GROUP BY`, joins, derived tables, and tie-breaker ordering that the prompt
  does not require.

## Edge Cases

- Empty table: returns an empty result.
- Single odd, non-boring row: returns that row.
- Odd row with `description = 'boring'`: excluded.
- Even row with high rating: excluded before sorting.
- Multiple qualifying rows with equal rating: their relative order is unspecified by the prompt.
- Mixed-case descriptions such as `Boring`: not equal to the exact lowercase string `boring`.

## Alternatives

- **`MOD(id, 2) = 1`:** also correct in MySQL, but `%` is concise and idiomatic on LeetCode.
- **`id & 1 = 1`:** can be a tiny constant-factor shortcut in MySQL, but it is less portable SQL
  syntax and does not change the required table scan or ordering.
- **Subquery before ordering:** correct, but adds a derived-table layer without reducing work.
- **Pandas filter and sort:** correct, but materializes DataFrame rows and is less lean than the
  pushed-down SQL plan for this database challenge.

## See Also

None - this challenge ships a single Pareto-optimal SQL proposal. The omitted speed and memory
extremes coincide with `solution.sql`, as explained above.
