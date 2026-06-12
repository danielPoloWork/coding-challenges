/* GENERATED from src/assets/sections2.jsx by scripts/build-jsx.mjs — edit the .jsx, not this file. */
/* Coding Challenges — sections part 2 */

/* ---------- PLATFORMS grid ---------- */
function Platforms({
  platforms
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "platforms"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-no"
  }, "03"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "The projects"), /*#__PURE__*/React.createElement("h2", null, "Sixteen platforms, one consistent standard."), /*#__PURE__*/React.createElement("p", null, "Each card collects solved challenges from one source. Open it for a sortable, searchable index of every solution \u2014 rendered with notes and complexity."))), /*#__PURE__*/React.createElement("div", {
    className: "grid-cards"
  }, !platforms && Array.from({
    length: 6
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    className: "pcard",
    key: i,
    style: {
      opacity: 0.5
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pcard-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pcard-icon",
    style: {
      background: "var(--hairline)"
    }
  })))), platforms && platforms.map((p, i) => /*#__PURE__*/React.createElement("a", {
    className: "pcard reveal",
    key: p.id,
    href: `src/platform.html?platform=${p.id}`,
    style: {
      transitionDelay: i % 3 * 0.05 + "s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pcard-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pcard-icon",
    style: {
      background: p.color
    }
  }, p.abbr), /*#__PURE__*/React.createElement("span", {
    className: "pcard-count"
  }, p.count, " solved")), /*#__PURE__*/React.createElement("h3", null, p.name), /*#__PURE__*/React.createElement("p", null, p.desc), /*#__PURE__*/React.createElement("div", {
    className: "pcard-foot"
  }, /*#__PURE__*/React.createElement("span", null, p.count ? "Open index" : "No solutions yet"), /*#__PURE__*/React.createElement("span", {
    className: "pcard-go"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 15
  }))))))));
}

/* ---------- FEATURED challenges ---------- */
function Featured({
  featured
}) {
  if (!featured) return null;
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "featured"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-no"
  }, "04"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Featured challenges"), /*#__PURE__*/React.createElement("h2", null, "A few worth reading."))), /*#__PURE__*/React.createElement("div", {
    className: "grid-cards"
  }, featured.map((f, i) => /*#__PURE__*/React.createElement("a", {
    className: "pcard reveal",
    key: f.path,
    href: `src/challenge.html?path=${encodeURIComponent(f.path)}`,
    style: {
      transitionDelay: i % 3 * 0.05 + "s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pcard-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 13,
      color: "var(--clay)"
    }
  }, "#", f.id), /*#__PURE__*/React.createElement("span", {
    className: "pcard-count",
    style: {
      color: window.CCX.diffColor(f.difficulty)
    }
  }, f.difficulty)), /*#__PURE__*/React.createElement("h3", {
    style: {
      marginTop: 14
    }
  }, f.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 7,
      flexWrap: "wrap",
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "node",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: 2,
      background: window.CCX.langColor(f.language)
    }
  }), f.language), (f.topics || []).slice(0, 2).map(tp => /*#__PURE__*/React.createElement("span", {
    className: "node",
    key: tp
  }, tp))), /*#__PURE__*/React.createElement("div", {
    className: "pcard-foot",
    style: {
      marginTop: "auto",
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement("span", null, f.platform, " \xB7 ", (f.patterns || [])[0] || "—"), /*#__PURE__*/React.createElement("span", {
    className: "pcard-go"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 15
  }))))))));
}

/* ---------- SOLUTION preview (tabbed, explorable) ---------- */
function SolutionPreview({
  proposals
}) {
  const [active, setActive] = useState(0);
  const p = proposals[active];
  const lines = p.code.split("\n");
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "solutions"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-no"
  }, "05"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "How a solution reads"), /*#__PURE__*/React.createElement("h2", null, "Three proposals. The best language for each goal."), /*#__PURE__*/React.createElement("p", null, "Every challenge ships a recommended balance, a speed extreme and a memory extreme \u2014 each in whichever allowed language performs best, justified in the notes."))), /*#__PURE__*/React.createElement("div", {
    className: "sol reveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sol-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sol-dots"
  }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("span", {
    className: "sol-path"
  }, "platforms/leetcode/", /*#__PURE__*/React.createElement("b", null, "0001-two-sum"), "/", p.label), /*#__PURE__*/React.createElement("span", {
    className: "sol-badge"
  }, p.badge)), /*#__PURE__*/React.createElement("div", {
    className: "sol-tabs",
    role: "tablist"
  }, proposals.map((pr, i) => /*#__PURE__*/React.createElement("div", {
    key: pr.id,
    role: "tab",
    className: "sol-tab" + (i === active ? " active" : ""),
    onClick: () => setActive(i)
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: pr.dot
    }
  }), pr.label))), /*#__PURE__*/React.createElement("div", {
    className: "sol-body"
  }, /*#__PURE__*/React.createElement("pre", {
    className: "sol-code"
  }, /*#__PURE__*/React.createElement("code", null, lines.map((ln, i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "ln"
  }, i + 1), ln || " ")))), /*#__PURE__*/React.createElement("div", {
    className: "sol-side"
  }, /*#__PURE__*/React.createElement("h5", null, "Proposal"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--ink)",
      fontWeight: 500
    }
  }, p.badge, " \xB7 ", p.lang), /*#__PURE__*/React.createElement("h5", null, "Complexity"), /*#__PURE__*/React.createElement("div", {
    className: "cx-row"
  }, /*#__PURE__*/React.createElement("span", null, "Time"), /*#__PURE__*/React.createElement("b", null, p.time)), /*#__PURE__*/React.createElement("div", {
    className: "cx-row"
  }, /*#__PURE__*/React.createElement("span", null, "Space"), /*#__PURE__*/React.createElement("b", null, p.space)), /*#__PURE__*/React.createElement("h5", null, "notes.md"), /*#__PURE__*/React.createElement("p", null, p.note), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-ghost",
    href: "src/platform.html?platform=leetcode",
    style: {
      marginTop: 20,
      width: "100%",
      justifyContent: "center"
    }
  }, "Explore the index ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 15
  })))))));
}

/* ---------- PATTERNS ---------- */
function Patterns({
  patterns
}) {
  const top = (patterns || []).slice(0, 20);
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "patterns"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-no"
  }, "06"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Pattern explorer"), /*#__PURE__*/React.createElement("h2", null, "The catalogue meant to outgrow everything else."), /*#__PURE__*/React.createElement("p", null, "As volume grows the reusable patterns become the most valuable lens \u2014 each links every challenge that exercises it."))), /*#__PURE__*/React.createElement("div", {
    className: "pat-cloud reveal"
  }, top.map(p => /*#__PURE__*/React.createElement("a", {
    className: "pat",
    key: p.name,
    href: `src/pattern.html?p=${encodeURIComponent(p.name)}`
  }, p.name, /*#__PURE__*/React.createElement("span", {
    className: "c"
  }, p.n)))), /*#__PURE__*/React.createElement("div", {
    className: "reveal",
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn-primary",
    href: "src/patterns.html"
  }, "Browse all patterns ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 16
  })))));
}

/* ---------- TOPICS ---------- */
function Topics({
  topics
}) {
  const top = (topics || []).slice(0, 20);
  if (!top.length) return null;
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "topics"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-no"
  }, "07"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Topic explorer"), /*#__PURE__*/React.createElement("h2", null, "The domains the work spans."), /*#__PURE__*/React.createElement("p", null, "Every challenge is tagged by topic \u2014 the broad algorithmic domains. Pick one to see every solution that touches it, across all platforms."))), /*#__PURE__*/React.createElement("div", {
    className: "pat-cloud reveal"
  }, top.map(tp => /*#__PURE__*/React.createElement("a", {
    className: "pat",
    key: tp.name,
    href: `src/topic.html?t=${encodeURIComponent(tp.name)}`
  }, tp.name, /*#__PURE__*/React.createElement("span", {
    className: "c"
  }, tp.n)))), /*#__PURE__*/React.createElement("div", {
    className: "reveal",
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn-primary",
    href: "src/topics.html"
  }, "Browse all topics ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 16
  })))));
}

/* ---------- LEARNING TIMELINE ---------- */
const TL_RANGES = [["all", "All"], ["year", "This year"], ["month", "This month"], ["week", "This week"], ["today", "Today"]];

/* Bar chart — short windows (week/month) and the adaptive all-time view,
   where each bucket's exact count is readable. */
function TimelineBars({
  tl
}) {
  const labelEvery = tl.buckets.length <= 16;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "tl-chart"
  }, tl.buckets.map(b => /*#__PURE__*/React.createElement("div", {
    className: "tl-col",
    key: b.key,
    title: b.future ? `${b.label} · upcoming` : `${b.label} · ${b.count}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-bar-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tl-count mono"
  }, b.count || ""), /*#__PURE__*/React.createElement("div", {
    className: "tl-bar" + (b.count === 0 ? " empty" : "") + (b.future ? " future" : "") + (b.key === tl.peak.key && b.count > 0 ? " peak" : ""),
    style: {
      height: b.count / tl.max * 100 + "%"
    }
  })), labelEvery && /*#__PURE__*/React.createElement("div", {
    className: "tl-x mono" + (b.future ? " future" : "")
  }, b.label)))), !labelEvery && /*#__PURE__*/React.createElement("div", {
    className: "tl-axis mono"
  }, /*#__PURE__*/React.createElement("span", null, tl.buckets[0].label), /*#__PURE__*/React.createElement("span", null, tl.peak.count ? tl.peak.label + " · peak" : ""), /*#__PURE__*/React.createElement("span", null, tl.buckets[tl.buckets.length - 1].label)));
}

/* GitHub-style weekly heatmap — the year window, where 365 daily bars would
   be unreadable but density/streaks read at a glance. */
function TimelineHeatmap({
  tl
}) {
  // on narrow screens the grid overflows horizontally — land scrolled to the
  // right so the current week (the data) is what shows, not the empty padding
  const scrollRef = useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [tl]);
  return /*#__PURE__*/React.createElement("div", {
    className: "hm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-days mono"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      gridRow: 1
    }
  }, "Mon"), /*#__PURE__*/React.createElement("span", {
    style: {
      gridRow: 4
    }
  }, "Thu"), /*#__PURE__*/React.createElement("span", {
    style: {
      gridRow: 7
    }
  }, "Sun")), /*#__PURE__*/React.createElement("div", {
    className: "hm-scroll",
    ref: scrollRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-months mono",
    style: {
      gridTemplateColumns: `repeat(${tl.weeks.length}, minmax(8px, 1fr))`
    }
  }, tl.months.map(m => /*#__PURE__*/React.createElement("span", {
    key: m.at,
    style: {
      gridColumnStart: m.at + 1
    }
  }, m.label))), /*#__PURE__*/React.createElement("div", {
    className: "hm-grid",
    style: {
      gridTemplateColumns: `repeat(${tl.weeks.length}, minmax(8px, 1fr))`
    }
  }, tl.weeks.map((w, wi) => /*#__PURE__*/React.createElement("div", {
    className: "hm-week",
    key: wi
  }, w.map(c => c.pad ? /*#__PURE__*/React.createElement("i", {
    className: "hm-cell pad",
    key: c.key
  }) : /*#__PURE__*/React.createElement("i", {
    key: c.key,
    className: "hm-cell" + (c.count === 0 ? " zero" : "") + (c.key === tl.peak.key && c.count > 0 ? " peak" : ""),
    title: `${c.label} · ${c.count} solved`,
    style: c.count > 0 && c.key !== tl.peak.key ? {
      opacity: 0.3 + 0.7 * (c.count / tl.max)
    } : null
  })))))));
}
function Timeline({
  challenges
}) {
  const [range, setRange] = useState("all");
  const cardRef = useRef(null);
  const tl = useMemo(() => challenges && challenges.length ? window.CCX.deriveTimeline(challenges, range) : null, [challenges, range]);
  // grow bars / ripple heatmap cells whenever the chart (re)renders
  useEffect(() => {
    if (tl && window.CCFX) window.CCFX.chartIn(cardRef.current);
  }, [tl]);
  if (!tl) return null;
  const caption = tl.mode === "heat" ? "Daily activity · weekly grid" : "Solves per day";
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "timeline"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-no"
  }, "08"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Learning timeline"), /*#__PURE__*/React.createElement("h2", null, "The work, in order."), /*#__PURE__*/React.createElement("p", null, "Every solution records the date it was solved \u2014 pick a window to see the solving cadence."))), /*#__PURE__*/React.createElement("div", {
    className: "tl reveal",
    ref: cardRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tl-cap mono"
  }, caption), /*#__PURE__*/React.createElement("span", {
    className: "psel"
  }, /*#__PURE__*/React.createElement("select", {
    value: range,
    onChange: e => setRange(e.target.value),
    "aria-label": "Timeline window"
  }, TL_RANGES.map(([v, l]) => /*#__PURE__*/React.createElement("option", {
    key: v,
    value: v
  }, l))), /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    className: "tl-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-n serif"
  }, tl.total), /*#__PURE__*/React.createElement("div", {
    className: "tl-l mono"
  }, "solved")), /*#__PURE__*/React.createElement("div", {
    className: "tl-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-n serif"
  }, tl.activeDays), /*#__PURE__*/React.createElement("div", {
    className: "tl-l mono"
  }, "active days")), /*#__PURE__*/React.createElement("div", {
    className: "tl-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-n serif"
  }, tl.peak.count), /*#__PURE__*/React.createElement("div", {
    className: "tl-l mono"
  }, "busiest ", tl.unit)), /*#__PURE__*/React.createElement("div", {
    className: "tl-stat tl-range"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-span serif"
  }, tl.windowText), /*#__PURE__*/React.createElement("div", {
    className: "tl-l mono"
  }, tl.windowTag))), tl.mode === "heat" ? /*#__PURE__*/React.createElement(TimelineHeatmap, {
    tl: tl
  }) : /*#__PURE__*/React.createElement(TimelineBars, {
    tl: tl
  }), tl.total === 0 && /*#__PURE__*/React.createElement("div", {
    className: "tl-empty mono"
  }, "No solutions in this window yet."))));
}

/* ---------- SKILL-GAP ANALYSIS ---------- */
function SkillGaps({
  home
}) {
  const cardRef = useRef(null);
  const gaps = useMemo(() => home && home.challenges ? window.CCX.deriveSkillGaps(home.challenges) : null, [home]);
  // fill the difficulty bars from the left once the card scrolls into view
  useEffect(() => {
    if (gaps && window.CCFX) window.CCFX.growBars(cardRef.current);
  }, [gaps]);
  if (!gaps) return null;
  const platTotal = (home.platforms || []).length || 16;
  const maxD = Math.max(...gaps.difficulty.map(d => d.count), 1);
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "gaps"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-no"
  }, "09"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Skill-gap analysis"), /*#__PURE__*/React.createElement("h2", null, "Where the practice is thin."), /*#__PURE__*/React.createElement("p", null, "The same metadata that powers the explorer, read in reverse \u2014 what the catalogue does ", /*#__PURE__*/React.createElement("i", null, "not"), " cover yet, derived live from the manifest."))), /*#__PURE__*/React.createElement("div", {
    className: "gap reveal",
    ref: cardRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "gap-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gap-block"
  }, /*#__PURE__*/React.createElement("h5", {
    className: "gap-t mono"
  }, "Difficulty mix"), gaps.difficulty.map(d => /*#__PURE__*/React.createElement("div", {
    className: "gap-row",
    key: d.name,
    title: `${d.count} ${d.name} · ${d.share}%`
  }, /*#__PURE__*/React.createElement("span", {
    className: "gap-dl"
  }, d.name), /*#__PURE__*/React.createElement("div", {
    className: "gap-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gap-fill",
    style: {
      width: d.count / maxD * 100 + "%",
      background: window.CCX.diffColor(d.name)
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "gap-dn mono"
  }, d.count, " \xB7 ", d.share, "%")))), /*#__PURE__*/React.createElement("div", {
    className: "gap-block"
  }, /*#__PURE__*/React.createElement("h5", {
    className: "gap-t mono"
  }, "Untouched core domains \xB7 ", gaps.untouched.length, " of ", gaps.coreTotal), /*#__PURE__*/React.createElement("div", {
    className: "gap-chips"
  }, gaps.untouched.map(t => /*#__PURE__*/React.createElement("span", {
    className: "node gap-miss",
    key: t
  }, t)), gaps.untouched.length === 0 && /*#__PURE__*/React.createElement("span", {
    className: "gap-none mono"
  }, "Every core domain has at least one solve."))), /*#__PURE__*/React.createElement("div", {
    className: "gap-block"
  }, /*#__PURE__*/React.createElement("h5", {
    className: "gap-t mono"
  }, "Practiced once \xB7 ", gaps.thin.length, " domains"), /*#__PURE__*/React.createElement("div", {
    className: "gap-chips"
  }, gaps.thin.map(t => /*#__PURE__*/React.createElement("a", {
    className: "node",
    key: t,
    href: `src/topic.html?t=${encodeURIComponent(t)}`
  }, t)), gaps.thin.length === 0 && /*#__PURE__*/React.createElement("span", {
    className: "gap-none mono"
  }, "No single-solve domains.")))), /*#__PURE__*/React.createElement("div", {
    className: "gap-foot mono"
  }, /*#__PURE__*/React.createElement("span", null, gaps.patSingle, " of ", gaps.patTotal, " patterns practiced only once"), /*#__PURE__*/React.createElement("span", null, gaps.platformsUsed, " of ", platTotal, " platforms covered"), /*#__PURE__*/React.createElement("span", null, gaps.topicsTouched, " domains touched overall")))));
}

/* ---------- TECHNICAL ARTICLES ---------- */
function Articles({
  articles
}) {
  if (!articles || !articles.length) return null;
  const fmt = iso => iso ? new Date(iso + "T00:00:00Z").toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }) : "";
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "writing"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-no"
  }, "10"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Writing"), /*#__PURE__*/React.createElement("h2", null, "Engineering notes from building this."), /*#__PURE__*/React.createElement("p", null, "Technical articles grown out of the repository itself \u2014 postmortems, design decisions and the trade-offs behind them."))), /*#__PURE__*/React.createElement("div", {
    className: "grid-cards"
  }, articles.slice(0, 3).map((a, i) => /*#__PURE__*/React.createElement("a", {
    className: "pcard reveal",
    key: a.slug,
    href: `src/article.html?a=${encodeURIComponent(a.slug)}`,
    style: {
      transitionDelay: i % 3 * 0.05 + "s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pcard-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--ink-3)"
    }
  }, fmt(a.date)), /*#__PURE__*/React.createElement("span", {
    className: "pcard-count"
  }, a.readMin, " min read")), /*#__PURE__*/React.createElement("h3", {
    style: {
      marginTop: 14
    }
  }, a.title), /*#__PURE__*/React.createElement("p", null, a.summary), /*#__PURE__*/React.createElement("div", {
    className: "pcard-foot",
    style: {
      marginTop: "auto",
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement("span", null, (a.tags || []).slice(0, 2).join(" · ") || "article"), /*#__PURE__*/React.createElement("span", {
    className: "pcard-go"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 15
  })))))), articles.length > 3 && /*#__PURE__*/React.createElement("div", {
    className: "reveal",
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn-primary",
    href: "src/articles.html"
  }, "Browse all writing ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 16
  })))));
}

/* ---------- LANGUAGES marquee ---------- */
const LANG_LIST = [{
  name: "C",
  c: "#8d96a8"
}, {
  name: "C#",
  c: "#6a4fb0"
}, {
  name: "C++",
  c: "#6e8fd6"
}, {
  name: "Css",
  c: "#5b8def"
}, {
  name: "Go",
  c: "#4fc3d9"
}, {
  name: "Html",
  c: "#e06a4a"
}, {
  name: "Java",
  c: "#d0743a"
}, {
  name: "JavaScript",
  c: "#d8b832"
}, {
  name: "Json",
  c: "#8a857a"
}, {
  name: "PHP",
  c: "#6d7fb8"
}, {
  name: "Python",
  c: "#5394d0"
}, {
  name: "Python3",
  c: "#4a7bd0"
}, {
  name: "Rust",
  c: "#cd7f52"
}, {
  name: "SQL",
  c: "#c98a2a"
}, {
  name: "Shell",
  c: "#3f9e6a"
}, {
  name: "TypeScript",
  c: "#3aa6b9"
}, {
  name: "Unity",
  c: "#7a8290"
}, {
  name: "Yaml",
  c: "#c0503a"
}];
function Languages() {
  const row = [...LANG_LIST, ...LANG_LIST];
  return /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head",
    style: {
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-no"
  }, "07"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Technology stack"), /*#__PURE__*/React.createElement("h2", null, "No default language. Performance decides."))), /*#__PURE__*/React.createElement("div", {
    className: "lang-marquee"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lang-track"
  }, row.map((l, i) => /*#__PURE__*/React.createElement("span", {
    className: "lang",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "sw",
    style: {
      background: l.c
    }
  }), l.name))))));
}

/* ---------- ROADMAP + FOOTER ---------- */
function Footer({
  roadmap,
  totals
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-no"
  }, "11"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Roadmap"), /*#__PURE__*/React.createElement("h2", null, "From repository to learning system."))), /*#__PURE__*/React.createElement("div", {
    className: "road"
  }, roadmap.map(ph => /*#__PURE__*/React.createElement("div", {
    className: "phase reveal" + (ph.done ? "" : " future"),
    key: ph.n
  }, /*#__PURE__*/React.createElement("div", {
    className: "phase-n"
  }, ph.n, ph.done ? " · shipped" : " · planned"), /*#__PURE__*/React.createElement("h4", null, ph.title), /*#__PURE__*/React.createElement("ul", null, ph.items.map(it => /*#__PURE__*/React.createElement("li", {
    key: it.label,
    className: "phase-item" + (it.done ? " is-done" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "phase-tick"
  }, it.done ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 12
  }) : null), it.label)))))))), /*#__PURE__*/React.createElement("footer", {
    className: "footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer-cta reveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-grid-bg",
    style: {
      opacity: 0.5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow",
    style: {
      justifyContent: "center"
    }
  }, "Coding Challenges"), /*#__PURE__*/React.createElement("h2", {
    style: {
      marginTop: 14
    }
  }, "Structured platforms.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "clay serif",
    style: {
      fontStyle: "italic"
    }
  }, "Smart solutions.")), /*#__PURE__*/React.createElement("p", null, "An engineering portfolio built to be explored \u2014 ", totals.challenges, " challenges, fully documented and traceable."), /*#__PURE__*/React.createElement("div", {
    className: "hero-cta"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn-primary",
    href: "#platforms"
  }, "Browse the work ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 16
  })), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-ghost",
    href: "https://github.com/danielPoloWork/coding-challenges",
    target: "_blank",
    rel: "noopener noreferrer"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "github",
    size: 16
  }), " View source")))), /*#__PURE__*/React.createElement("div", {
    className: "footer-bottom"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "\xA9 2026 \xB7 Daniel Polo"), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "Structured platforms. Smart Solutions.")))));
}
Object.assign(window, {
  Platforms,
  Featured,
  SolutionPreview,
  Patterns,
  Topics,
  Timeline,
  SkillGaps,
  Articles,
  Languages,
  Footer
});
