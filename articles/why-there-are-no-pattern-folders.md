---
title: Why there are no pattern folders
date: 2026-06-10
summary: The original architecture promised physical algorithms/ and patterns/ directories. They were deleted on purpose. An ADR on classification as data, views as derivations, and staleness as a build failure.
tags: architecture, decision record, automation
---

The README once described three physical layers: a platform layer
(`platforms/`), an algorithm layer (`algorithms/`) and a pattern layer
(`patterns/`) — challenges filed by source, by domain, by technique. The
first layer exists and holds every solution. The other two were deleted, and
the deletion was an architectural decision, not a cleanup.

## What the folders actually were

By the time the structure was audited, `algorithms/` and `patterns/` held
nothing but empty subdirectories — git doesn't even track those, so a fresh
clone silently lost them. They were a promise without a mechanism. And the
mechanism they implied is the real problem: a challenge that exercises three
patterns across two domains either lives in five places (copies or links,
all hand-maintained) or in one place plus four entries someone must remember
to update. Every new solve, rename or reclassification multiplies by the
number of physical views. That is not an organization scheme; it is a
standing invitation to drift.

Meanwhile the truth already lived elsewhere. Every challenge carries its
classification in its own `metadata.json` — `topics` for the broad domains,
`patterns` for the fine techniques. The folders were a second, manual copy
of data the repository already had in structured form.

## The decision: classify once, derive every view

The folders went away; the views stayed and multiplied. From the single
source of truth (`metadata.json`, aggregated into `platforms/manifest.json`
by a generator), the same classification now powers:

- the **website's** pattern and topic explorers — sortable, filterable,
  cross-platform, one click from any label to every challenge exercising it;
- the **GitHub-native** views — `stats/index-patterns.md` and
  `stats/index-topics.md`, regenerated on every commit for readers who never
  leave the repository;
- the downstream analyses — the home page's skill-gap section reads the same
  data *in reverse* to report what is **not** covered yet.

A relabeled challenge propagates to all of these by editing one JSON field.
There is nothing to move, link or remember.

## The price, and the enforcement

Derived views have one failure mode: staleness. The generated indexes are
committed to the repository (they must be — GitHub renders them, and Pages
serves the manifest), so every commit that touches a solution *should* also
carry regenerated artifacts. "Should" is not a mechanism, so two are in
place, in depth:

1. **A versioned pre-commit hook** regenerates the stats indexes, the README
   totals banner, the asset cache-busts and the manifest, and stages them —
   the sync commit is automatic, not remembered.
2. **A CI anti-drift guard** re-runs both generators on every push and fails
   if `git diff` is dirty. It covers exactly the holes a local hook leaves:
   clones that never configured `core.hooksPath`, `--no-verify` commits,
   web-UI edits. One subtlety: the manifest embeds a generation date, which
   is a run stamp, not drift — the guard ignores that single line
   (`git diff -I'"generated": '`), so a re-run on a different day can never
   fail the build by itself. Everything else must be byte-identical, and the
   generators are deterministic precisely so that this check can be strict.

Note what the CI deliberately does **not** do: deploy. Pages already serves
the master root; the guard's only job is to make staleness loud.

## The takeaway

A taxonomy maintained by hand in two places will diverge — the only
questions are when, and whether anything notices. Storing classification
exactly once and deriving every view is the standard cure; the part that
makes it stick is treating the derivation as part of the commit (hook) and
its absence as a build failure (CI), so the architecture's one weakness is
patrolled by machines instead of discipline.
