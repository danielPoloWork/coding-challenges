# Complexity - LeetCode 1189: Maximum Number of Balloons (C memory proposal)

This folder contains the minimum-memory proposal. The recommended and fastest-runtime
proposal is implemented in C++ at `../../cpp/1189-maximum-number-of-balloons/`.

## Memory Extreme - `solution-memory.c`

### Time Complexity

```text
O(n)
```

The string is scanned once. The post-scan minimum calculation touches five counters, which
is constant time.

### Space Complexity

```text
O(1)
```

The algorithm stores five integer counters and one scan pointer regardless of input length.

## Recommended and Speed Extreme - C++ sibling

### Time Complexity

```text
O(n)
```

The C++ proposal also scans the string once and reaches the same worst-case read lower
bound.

### Space Complexity

```text
O(1)
```

It uses a 26-slot stack frequency table. This is still constant space, but a larger
constant than the five-counter C memory proposal.

## Variables

- `n`: length of `text`, with `1 <= n <= 10000`.
- `b`, `a`, `l`, `o`, `nCount`: counters for the letters needed by `balloon`.

## Top 1% Performance Strategy

- Use exact target-letter counting instead of general-purpose maps.
- Keep state in stack scalars.
- Scan the input once.
- Avoid heap allocation and input mutation.

## Optimization Opportunities

The memory axis cannot reduce meaningful auxiliary state below the required target-letter
counts. The C++ sibling is the better runtime-oriented choice when the extra 21 integer
slots are acceptable.
