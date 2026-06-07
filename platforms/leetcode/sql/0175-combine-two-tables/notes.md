# Notes - LeetCode 175: Combine Two Tables (SQL proposal)

## Problem Summary

Given a `Person` table and an `Address` table, report every person's `firstName`,
`lastName`, `city`, and `state`. A person must still appear when no address row exists;
in that case, `city` and `state` should be `NULL`.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one solution is best on all meaningful axes.
For this database problem the direct `LEFT JOIN` is the recommended, speed-extreme, and
memory-extreme solution:

- **Recommended (`solution.sql`) - fast + lean:** select from `Person` and left-join
  `Address` on `personId`.
- **Speed extreme:** *coincides with the recommended.* Any correct answer must preserve all
  `Person` rows and match addresses by the integer key; the `LEFT JOIN` exposes exactly that
  operation to the SQL optimizer.
- **Memory extreme:** *coincides with the recommended.* The query asks the engine to stream
  only four projected columns and adds no derived tables, sorting, grouping, distinct step, or
  application-side materialization.

There is therefore no separate `solution-runtime.sql` or `solution-memory.sql`.

## Language Choice (SQL)

Candidate languages considered:

- C++: not a LeetCode Database submission language for this schema; a client-side join would
  require extracting both tables and reimplementing relational execution outside the engine.
- C: same issue as C++; manual row handling would add transfer and memory overhead and is not
  the platform interface for this problem.
- Rust: strong for native in-memory joins, but unsupported for this LeetCode Database task and
  dominated by executing the relational join where the data already lives.
- Go: unsupported for this SQL schema submission; it would need application-side materialization.
- Java / C#: useful for general LeetCode algorithms, but not accepted here as the database
  query interface and heavier than a single relational operator.
- Python / JavaScript / TypeScript / PHP: Python/Pandas can express the same left merge, but it
  materializes DataFrames and is a higher-overhead fit than a SQL join; the other scripting
  choices are not the intended database submission path.

Chosen language:

- Selected: SQL.
- Why it wins for this proposal: the problem is a relational projection with an outer join, and
  SQL lets the database optimizer choose the best join plan while preserving native `NULL`
  semantics.
- Why the main alternatives lose: non-SQL languages either are not accepted for the LeetCode
  Database query, or they move work out of the database and allocate more memory than needed for
  a four-column projection.

## Constraints

- `Person.personId` is the primary key of `Person`.
- `Address.addressId` is the primary key of `Address`.
- The result order is unconstrained, so no `ORDER BY` is needed.
- Missing addresses must appear as SQL `NULL`, not as an empty string or replacement value.
- Address rows whose `personId` is absent from `Person` must not appear in the result.

## Key Observations

1. `Person` is the preserved table because every person must be reported.
2. `Address` is optional, so an inner join would incorrectly remove people without an address.
3. SQL `LEFT JOIN` naturally fills columns from the right side with `NULL` when no match exists.
4. The result needs only four columns, so selecting `*` would do unnecessary work and expose
   unwanted ids.

## Reasoning Process

The direct relational operation is: take every row from `Person`, find any address row with the
same `personId`, and output the name plus location columns. If no address matches, output the
name and null address fields.

An `INNER JOIN` is the tempting first attempt, but it fails the explicit missing-address case
because it returns only matched rows. A `LEFT JOIN` keeps the left-side row even when the right
side is absent, which exactly matches the problem statement. Since any output order is accepted,
the query avoids sorting. Since nulls are already the required value, it also avoids `COALESCE`
or conditional expressions.

## Final Approach

1. Read from `Person` as `p`.
2. `LEFT JOIN Address` as `a` on the shared integer key `personId`.
3. Project only `p.firstName`, `p.lastName`, `a.city`, and `a.state`.
4. Leave ordering unspecified, as allowed by the prompt.

## Why This Approach

`LEFT JOIN` is the canonical relational operator for "all rows from the left table, matching rows
from the right table if present." It is simpler and more optimizer-friendly than correlated
subqueries, unions, or application-side merges. It is also memory-conscious because the SQL text
does not ask for intermediate derived tables or extra result columns.

## Top 1% Performance Strategy

- Preserve `Person` on the left side, matching the required output cardinality.
- Join on the integer key `personId`, allowing the engine to use a hash join, merge join, or
  index nested-loop plan depending on its available statistics and indexes.
- Project only required columns.
- Avoid `ORDER BY`, `DISTINCT`, `GROUP BY`, subqueries, `COALESCE`, and computed expressions.
- Let SQL's native outer-join null handling produce the required missing-address values.

## Edge Cases

- A person has no address: `city` and `state` are returned as `NULL`.
- `Address` contains a row for a missing person id: that row is ignored because `Person` is the
  preserved side.
- `Address` is empty: every person appears with null location fields.
- `Person` is empty: the result is empty.
- If multiple address rows share a `personId`, SQL relation semantics return one result row per
  matching address row. Under the intended LeetCode data shape, each person has at most one
  relevant address row.

## Alternatives

- **Inner join:** loses people without addresses, so it is incorrect.
- **Right join:** can be made equivalent by swapping table order, but it is less portable and
  less directly expresses "all people."
- **Correlated subqueries:** can retrieve city/state, but they repeat lookup expressions and are
  harder for readers and some optimizers to simplify.
- **Pandas merge:** correct with a left merge, but allocates DataFrames and is a weaker
  performance fit than executing the join in SQL.

## See Also

None - this challenge ships a single Pareto-optimal SQL proposal. The omitted speed and memory
extremes coincide with `solution.sql`, as explained above.
