---
title: Chasing top-1% runtime without running a single benchmark
date: 2026-06-10
summary: This repository targets the top 1% of accepted solutions for execution time — and deliberately ships no benchmark tooling. What gets verified locally is correctness, with a throwaway Python mirror; speed is argued, not measured.
tags: methodology, verification, testing
---

Every solution in this repository is written against an explicit performance
target: top 1% of accepted submissions for execution time. You might expect
the toolchain to be full of timers, harnesses and flame graphs. It contains
none — the local benchmark tooling that once existed was deliberately
removed. That sounds like a contradiction. It is actually a separation of
claims.

## Two claims, two standards of proof

A solution makes two distinct claims: *it is correct* and *it is fast*. They
deserve different verification, because the evidence transfers differently.

**Correctness transfers.** An algorithm that handles the edge cases and
survives randomized stress on my machine handles them on the judge's machine.
So correctness is machine-checked locally, every time.

**Local timings do not transfer.** The judge runs different hardware, a
different load profile, a different compiler configuration and a different
test distribution. A micro-benchmark that declares variant A 12% faster than
variant B on a desktop says little about their ranking on the platform — and
worse, it invites tuning to the wrong machine. The only timing scoreboard
that counts is the platform's own, so speed is **argued analytically** —
input bounds, data-structure choice, allocation behavior, branch and cache
characteristics, early exits — and then confirmed by the judge on
submission. The reasoning lives in the notes, where it can be reviewed;
a local stopwatch number cannot.

## The Python mirror

The local correctness check has a specific, deliberately humble shape: a
**throwaway Python script that mirrors the algorithm**.

The procedure, as used for Sort an Array (0912) and Contains Duplicate
(0217):

1. Re-implement the solution's algorithm in Python, faithfully — same logic,
   same control flow, not an idiomatic rewrite.
2. Compare it against a trusted reference — brute force, or a library
   function like `sorted()` — first on the edge cases (empty, single element,
   duplicates, extremes of the value range), then on randomized stress until
   boredom sets in.
3. Delete the script.

Two choices here raise eyebrows, and both are intentional.

**Why Python, when the solution is C++?** Because the mirror checks the
*algorithm*, not the implementation language. If the logic is wrong, it is
wrong in every language; Python is simply the fastest way to express it and
the easiest place to diff it against a reference. A pleasant side effect: no
compiler toolchain is needed at all — the C++ never has to build locally for
its logic to be falsified.

**Why throwaway?** Because the script's value exists only at solve time. The
solution's permanent test harness is the platform's judge, which re-runs the
full suite on every resubmission. A committed local test would duplicate that
role badly, then rot — it would test the Python mirror, not the C++ file
people actually read, and the two would silently diverge at the first
refactor. Deleting it is not laziness; it is refusing to keep an artifact
whose maintenance cost outlives its evidence value.

## What this generalizes to

- **Match the proof to the claim.** Mechanical checks for what transfers
  (logic), written argument for what doesn't (performance on someone else's
  hardware), and an authoritative external oracle (the judge) as the final
  word on both.
- **A faithful mirror beats a beautiful port.** The mirror's only job is to
  preserve the bug, if there is one. Idiomatic rewrites optimize away exactly
  the thing you are trying to test.
- **Some tests should die.** If an artifact's evidence value ends at solve
  time, keeping it doesn't add safety — it adds a second source of truth that
  will eventually disagree with the first.
