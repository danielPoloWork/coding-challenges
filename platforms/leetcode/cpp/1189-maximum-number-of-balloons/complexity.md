# Complexity - LeetCode 1189: Maximum Number of Balloons

The recommended C++ solution is also the fastest-runtime proposal. The minimum-memory
proposal is the C sibling linked below.

## Recommended and Speed Extreme - `solution.cpp`

### Time Complexity

```text
O(n)
```

The algorithm scans each input character exactly once, then checks five fixed frequency
entries. Since a needed character may appear at the final position, any correct solution
must read all `n` characters in the worst case.

### Space Complexity

```text
O(1)
```

The frequency table has exactly 26 integer slots regardless of input length. No heap
storage, hash table, copied string, or output buffer is allocated by the algorithm.

## Memory Extreme - `../../c/1189-maximum-number-of-balloons/solution-memory.c`

### Time Complexity

```text
O(n)
```

The C proposal also scans the string once and performs a fixed amount of work after the
scan.

### Space Complexity

```text
O(1)
```

The memory proposal stores only five integer counters for the useful letters. This is a
smaller constant than the 26-slot runtime-oriented table.

## Variables

- `n`: length of `text`, with `1 <= n <= 10000`.
- `freq`: 26-slot lowercase frequency table in the C++ proposal.
- `b`, `a`, `l`, `o`, `nCount`: five target-letter counters in the C proposal.

## Top 1% Performance Strategy

- Use linear counting, which reaches the input-read lower bound.
- Keep all state on the stack.
- Use direct addressing for the C++ hot loop.
- Avoid dynamic maps, sorting, repeated target construction, and repeated string removal.
- Normalize doubled letters (`l` and `o`) once after the scan.

## Optimization Opportunities

No asymptotic improvement is possible because the full input may be necessary. The only
meaningful tuning is the constant-factor choice between the branch-regular 26-slot C++
scan and the five-counter C memory scan.
