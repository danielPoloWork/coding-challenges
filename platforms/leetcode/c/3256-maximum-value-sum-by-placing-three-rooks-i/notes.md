# Notes - LeetCode 3256: Maximum Value Sum by Placing Three Rooks I (C memory)

## Problem Summary

Place exactly three rooks on an `m x n` value board so that no two share a row or
column. Return the maximum sum of the occupied cells.

This folder contains the **minimum-memory** proposal. The recommended and fastest-runtime
solutions are in `../../cpp/3256-maximum-value-sum-by-placing-three-rooks-i/`.

## Three Proposals

- **Recommended (C++ `solution.cpp`) - fast + lean:** use prefix/suffix top-three
  summaries around each possible middle line.
- **Speed extreme (C++ `solution-runtime.cpp`):** use the same prefix/suffix algorithm with
  an oriented stack matrix and fixed arrays for lower constant factors.
- **Memory extreme (C `solution-memory.c`):** for each line triple, scan the opposite
  dimension and rebuild local top-three buffers with no heap allocation.

## Language Choice (memory proposal)

Candidate languages considered:

- C++: Can implement the same constant-auxiliary algorithm, but the vector-based LeetCode
  wrapper and standard runtime baseline are slightly larger.
- C: Selected for the smallest runtime baseline, direct `int**` board access, scalar
  buffers, and no heap allocation.
- Rust: Native and memory-safe, but wrapper and bounds-check ergonomics are heavier than C
  for this memory-only target.
- Go: Slice metadata and runtime/GC baseline are not competitive for minimum peak memory.
- Java / C#: Managed runtimes add object headers and GC metadata that dominate the tiny
  auxiliary state.
- Python / JavaScript / TypeScript / PHP: VM object representation is far too heavy for a
  least-memory objective.

Chosen language:

- Selected: C.
- Why it wins for this proposal: the algorithm only needs scalar arrays and direct board
  reads, so C minimizes auxiliary and runtime overhead.
- Why the main alternatives lose: C++ is close but not smaller; managed and interpreted
  languages have much higher baseline memory.

## Constraints

- `3 <= m, n <= 100`
- `-1e9 <= board[i][j] <= 1e9`
- The sum needs `long long` because three cells can exceed 32-bit signed range.

## Key Observations

- Once three primary lines are fixed, each chosen cell can be restricted to that line's
  best three opposite coordinates.
- Only two opposite coordinates can be blocked by the other rooks, so one of the top three
  remains available if the current choice was outside them.
- Rebuilding those top-three lists per triple removes the retained `O(p)` candidate table.

## Approach

1. Use rows as the primary dimension if `m <= n`; otherwise use columns.
2. Enumerate every triple of primary lines.
3. Scan the opposite dimension and keep three top candidates for each of the three lines.
4. Enumerate the 27 combinations and require distinct opposite coordinates.
5. Return the largest valid sum.

## Top 1% Performance Strategy

This variant is not the runtime champion; it is the memory champion. It still keeps the
constant factors tight by orienting to the smaller dimension, using fixed scalar arrays,
avoiding allocation, and checking only 27 combinations after each scan.

## Trade-Off

Compared with the C++ recommended solution, this avoids retained prefix/suffix summaries
but re-scans `q` cells for every line triple. Compared with the C++ runtime variant, it
uses dramatically less auxiliary memory but performs many more board reads.

## See Also

- Recommended and runtime proposals: `../../cpp/3256-maximum-value-sum-by-placing-three-rooks-i/`
