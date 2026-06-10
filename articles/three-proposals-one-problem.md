---
title: Three proposals, one problem — and the right language for each
date: 2026-06-10
summary: Every challenge here ships up to three solutions — a recommended balance, a speed extreme, a memory extreme — each in whatever language wins for that goal. Why one accepted answer is never enough, and why a missing file is information.
tags: methodology, performance, language selection
---

Open any challenge folder in this repository and you may find up to three
solution files:

```text
solution.{ext}            <- recommended: fastest runtime that keeps memory low
solution-runtime.{ext}    <- speed extreme: fastest possible, memory be damned
solution-memory.{ext}     <- memory extreme: smallest footprint, runtime pays
```

This is the repository's founding editorial rule, and it exists because the
question "what is the *best* solution?" is underdetermined. Best at what?
The answer that tops the runtime leaderboard often buys its speed with
auxiliary structures; the answer that holds an O(1) footprint often pays in
asymptotics. A repository that stores one accepted answer per problem silently
picks a winner and **hides the trade-off — and the trade-off is the content.**
The goal here is documenting reasoning, not collecting green checkmarks.

## One goal, one language

The second half of the rule is less common: the three proposals do not have to
share a language, because **language choice is part of the optimization**.
There is no default language in this repository — each proposal gets whatever
allowed language performance analysis picks *for that proposal's goal*, argued
in the notes against the realistic alternatives (systems candidates, managed
runtimes, interpreted ones) under the problem's actual constraints.

Contains Duplicate (0217) is the canonical example: the recommended and
speed-extreme proposals live in C++ — hash-set lookups with pre-reserved
buckets — while the memory extreme lives in C, where an in-place sort plus
adjacent scan holds the footprint to O(1) without a runtime's baseline
overhead. Two folders, one challenge, each file the best tool for its own
objective. The folders cross-reference each other so no proposal is ever read
in isolation.

## The Pareto rule: a missing file is information

The tempting failure mode of a three-slot template is filling all three slots
every time. The rule here is the opposite: when one solution is
Pareto-optimal — simultaneously the fastest *and* the leanest — it ships
**alone**, and the notes say so explicitly. A speed or memory extreme exists
only when it is a genuinely different, non-dominated algorithm.

This matters because a manufactured extreme is worse than none. Copying the
recommended solution into `solution-runtime.cpp` with a tweaked constant
fabricates a trade-off that doesn't exist, and the reader who diffs the two
files learns nothing except that the template demanded a file. An absent
extreme, by contrast, is a verifiable claim: *no non-dominated alternative was
found*. Emptiness carries information only if you refuse to fill it with
filler.

## Re-solves are labeled, not laundered

The same honesty applies over time. When an already-solved challenge is solved
again in a new language as a learning exercise, the new folder says so: the
notes declare it **didactic**, and the metadata cross-references the standing
champions per axis — recommended, runtime, memory — so the reader can always
find the performant answer and never mistakes language coverage for a new
performance claim.

## The takeaway

Force the trade-off to be explicit and it becomes reviewable; leave it
implicit and it becomes folklore. Three named slots — balance, speed,
memory — give every solution a falsifiable job description, the per-goal
language rule keeps the comparison honest end to end, and the Pareto rule
keeps the structure from decaying into ritual. The discipline is not "always
write three solutions"; it is "never let one file quietly answer three
different questions."
