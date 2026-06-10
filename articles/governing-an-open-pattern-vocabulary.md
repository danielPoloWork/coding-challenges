---
title: Governing an open pattern vocabulary without freezing it
date: 2026-06-10
summary: When an agent labels every solution with the techniques it used, the labels proliferate — 106 patterns, 81% used exactly once. The fix was not a canonical taxonomy. It was naming governance.
tags: taxonomy, agentic workflow, metadata
---

Every solution in this repository carries two classification axes in its
`metadata.json`: `topics` — broad algorithmic domains like *Array* or *Dynamic
Programming* — and `patterns` — the finer reusable techniques, like
`coordinate-compression` or `digit-dp`. Topics follow LeetCode's canonical
names and converge naturally (~31 distinct labels). Patterns are assigned by
the solving agent at solve time, freely.

After 37 challenges, the pattern explorer told an uncomfortable story:
**106 distinct pattern labels, 81% of them used exactly once.** A catalogue in
which almost every entry appears once is not a reusable lens — it is a list of
unique strings. And two roadmap features depend on patterns being a real lens:
skill-gap analysis and learning recommendations both need recurring buckets,
not singletons.

## The tempting fix, rejected

The obvious remedy is a *closed* canonical set: pick thirty blessed patterns,
force every solution into one of them. We rejected it, for two reasons.

First, the long tail is largely **genuine**. `wqs-binary-search`,
`alien-trick`, `transversal-matroid` are not synonyms of anything coarser —
they are distinct techniques that happen to have been needed once so far.
Collapsing them into a super-label like `advanced-greedy` would destroy
exactly the information the catalogue exists to preserve.

Second, a frozen list rots. New problems legitimately introduce new
techniques; a vocabulary that cannot grow either blocks the agent or gets
silently bypassed. Either failure mode is worse than the disease.

## What actually fragments a vocabulary

Looking at the labels, the damage wasn't conceptual — it was *clerical*:

1. **Spelling drift** — `Coordinate Compression` vs `coordinate-compression`.
2. **True synonyms** — `coordinate-reduction` coined while
   `coordinate-compression` already existed.
3. **No checkpoint** — nothing prompted the agent to look before coining.

None of these require closing the vocabulary. They require *governance*: the
same technique must always get the same label, and that property must be
enforced by machines where possible and by convention where not.

## The mechanism

Three small pieces, shipped together:

- **Mechanical normalization.** Both generators (`scripts/gen_indexes.py` in
  Python and `src/scripts/build-manifest.mjs` in Node) trim, lowercase, and
  hyphenate every pattern label before counting. Case and whitespace can no
  longer fork a label.
- **An open alias registry.** `scripts/pattern-aliases.json` maps
  `synonym -> canonical`. When two labels turn out to name the same technique,
  one line records the merge — no metadata rewrite, no history edit. Both
  generators read the same registry, so the stats indices and the website
  agree on the canonical label by construction.
- **A convention with a checkpoint.** The agent rules now state: labels are
  kebab-case, and before coining a new pattern the agent scans the existing
  index (`stats/index-patterns.md`). Reuse if it matches; coin only for a
  genuinely new technique. Distinct techniques stay distinct and roll up under
  their shared topic instead.

The immediate yield was deliberately small — 106 labels became 105, one true
synonym merged, six renamed to convention. The value is forward-looking: the
mechanism prevents *future* forks, and the long tail consolidates with volume
now that naming is governed. Singletons are no longer noise accumulating; they
are techniques waiting for their second occurrence.

## The takeaway

For agent-written metadata, the choice is not "free text or fixed taxonomy."
There is a third position: **open vocabulary, governed naming** — mechanical
normalization for what machines can decide, an append-only alias registry for
what only a human can decide, and a check-before-coining rule at the point of
creation. Consistency is the goal; closure is neither necessary nor desirable.
