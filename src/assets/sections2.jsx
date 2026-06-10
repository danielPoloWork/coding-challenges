/* Coding Challenges — sections part 2 */

/* ---------- PLATFORMS grid ---------- */
function Platforms({ platforms }) {
  return (
    <section className="section" id="platforms">
      <div className="wrap">
        <div className="section-head">
          <span className="sec-no">03</span>
          <div>
            <span className="eyebrow">The projects</span>
            <h2>Sixteen platforms, one consistent standard.</h2>
            <p>Each card collects solved challenges from one source. Open it for a
              sortable, searchable index of every solution — rendered with notes and complexity.</p>
          </div>
        </div>
        <div className="grid-cards">
          {!platforms && Array.from({ length: 6 }).map((_, i) => (
            <div className="pcard" key={i} style={{ opacity: 0.5 }}><div className="pcard-top"><span className="pcard-icon" style={{ background: "var(--hairline)" }} /></div></div>
          ))}
          {platforms && platforms.map((p, i) => (
            <a className="pcard reveal" key={p.id} href={`src/platform.html?platform=${p.id}`} style={{ transitionDelay: (i % 3 * 0.05) + "s" }}>
              <div className="pcard-top">
                <span className="pcard-icon" style={{ background: p.color }}>{p.abbr}</span>
                <span className="pcard-count">{p.count} solved</span>
              </div>
              <h3>{p.name}</h3>
              <p>{p.desc}</p>
              <div className="pcard-foot">
                <span>{p.count ? "Open index" : "No solutions yet"}</span>
                <span className="pcard-go"><Icon name="arrow" size={15} /></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FEATURED challenges ---------- */
function Featured({ featured }) {
  if (!featured) return null;
  return (
    <section className="section" id="featured">
      <div className="wrap">
        <div className="section-head">
          <span className="sec-no">04</span>
          <div>
            <span className="eyebrow">Featured challenges</span>
            <h2>A few worth reading.</h2>
          </div>
        </div>
        <div className="grid-cards">
          {featured.map((f, i) => (
            <a className="pcard reveal" key={f.path} href={`src/challenge.html?path=${encodeURIComponent(f.path)}`} style={{ transitionDelay: (i % 3 * 0.05) + "s" }}>
              <div className="pcard-top">
                <span className="mono" style={{ fontSize: 13, color: "var(--clay)" }}>#{f.id}</span>
                <span className="pcard-count" style={{ color: window.CCX.diffColor(f.difficulty) }}>{f.difficulty}</span>
              </div>
              <h3 style={{ marginTop: 14 }}>{f.title}</h3>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 12 }}>
                <span className="node" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: window.CCX.langColor(f.language) }} />{f.language}
                </span>
                {(f.topics || []).slice(0, 2).map((tp) => <span className="node" key={tp}>{tp}</span>)}
              </div>
              <div className="pcard-foot" style={{ marginTop: "auto", paddingTop: 16 }}>
                <span>{f.platform} · {(f.patterns || [])[0] || "—"}</span>
                <span className="pcard-go"><Icon name="arrow" size={15} /></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- SOLUTION preview (tabbed, explorable) ---------- */
function SolutionPreview({ proposals }) {
  const [active, setActive] = useState(0);
  const p = proposals[active];
  const lines = p.code.split("\n");
  return (
    <section className="section" id="solutions">
      <div className="wrap">
        <div className="section-head">
          <span className="sec-no">05</span>
          <div>
            <span className="eyebrow">How a solution reads</span>
            <h2>Three proposals. The best language for each goal.</h2>
            <p>Every challenge ships a recommended balance, a speed extreme and a memory
              extreme — each in whichever allowed language performs best, justified in the notes.</p>
          </div>
        </div>
        <div className="sol reveal">
          <div className="sol-head">
            <div className="sol-dots"><i /><i /><i /></div>
            <span className="sol-path">platforms/leetcode/<b>0001-two-sum</b>/{p.label}</span>
            <span className="sol-badge">{p.badge}</span>
          </div>
          <div className="sol-tabs" role="tablist">
            {proposals.map((pr, i) => (
              <div key={pr.id} role="tab" className={"sol-tab" + (i === active ? " active" : "")}
                onClick={() => setActive(i)}>
                <span className="dot" style={{ background: pr.dot }} />{pr.label}
              </div>
            ))}
          </div>
          <div className="sol-body">
            <pre className="sol-code"><code>{lines.map((ln, i) => (
              <div key={i}><span className="ln">{i + 1}</span>{ln || " "}</div>
            ))}</code></pre>
            <div className="sol-side">
              <h5>Proposal</h5>
              <p style={{ color: "var(--ink)", fontWeight: 500 }}>{p.badge} · {p.lang}</p>
              <h5>Complexity</h5>
              <div className="cx-row"><span>Time</span><b>{p.time}</b></div>
              <div className="cx-row"><span>Space</span><b>{p.space}</b></div>
              <h5>notes.md</h5>
              <p>{p.note}</p>
              <a className="btn btn-ghost" href="src/platform.html?platform=leetcode" style={{ marginTop: 20, width: "100%", justifyContent: "center" }}>
                Explore the index <Icon name="arrow" size={15} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- PATTERNS ---------- */
function Patterns({ patterns }) {
  const top = (patterns || []).slice(0, 20);
  return (
    <section className="section" id="patterns">
      <div className="wrap">
        <div className="section-head">
          <span className="sec-no">06</span>
          <div>
            <span className="eyebrow">Pattern explorer</span>
            <h2>The catalogue meant to outgrow everything else.</h2>
            <p>As volume grows the reusable patterns become the most valuable lens — each links
              every challenge that exercises it.</p>
          </div>
        </div>
        <div className="pat-cloud reveal">
          {top.map((p) => (
            <a className="pat" key={p.name} href={`src/pattern.html?p=${encodeURIComponent(p.name)}`}>{p.name}<span className="c">{p.n}</span></a>
          ))}
        </div>
        <div className="reveal" style={{ marginTop: 26 }}>
          <a className="btn btn-primary" href="src/patterns.html">Browse all patterns <Icon name="arrow" size={16} /></a>
        </div>
      </div>
    </section>
  );
}

/* ---------- TOPICS ---------- */
function Topics({ topics }) {
  const top = (topics || []).slice(0, 20);
  if (!top.length) return null;
  return (
    <section className="section" id="topics">
      <div className="wrap">
        <div className="section-head">
          <span className="sec-no">07</span>
          <div>
            <span className="eyebrow">Topic explorer</span>
            <h2>The domains the work spans.</h2>
            <p>Every challenge is tagged by topic — the broad algorithmic domains. Pick one to see
              every solution that touches it, across all platforms.</p>
          </div>
        </div>
        <div className="pat-cloud reveal">
          {top.map((tp) => (
            <a className="pat" key={tp.name} href={`src/topic.html?t=${encodeURIComponent(tp.name)}`}>{tp.name}<span className="c">{tp.n}</span></a>
          ))}
        </div>
        <div className="reveal" style={{ marginTop: 26 }}>
          <a className="btn btn-primary" href="src/topics.html">Browse all topics <Icon name="arrow" size={16} /></a>
        </div>
      </div>
    </section>
  );
}

/* ---------- LEARNING TIMELINE ---------- */
const TL_RANGES = [
  ["all", "All"], ["year", "This year"], ["month", "This month"], ["week", "This week"], ["today", "Today"],
];

/* Bar chart — short windows (week/month) and the adaptive all-time view,
   where each bucket's exact count is readable. */
function TimelineBars({ tl }) {
  const labelEvery = tl.buckets.length <= 16;
  return (
    <React.Fragment>
      <div className="tl-chart">
        {tl.buckets.map((b) => (
          <div className="tl-col" key={b.key} title={b.future ? `${b.label} · upcoming` : `${b.label} · ${b.count}`}>
            <div className="tl-bar-wrap">
              <span className="tl-count mono">{b.count || ""}</span>
              <div className={"tl-bar" + (b.count === 0 ? " empty" : "") + (b.future ? " future" : "") + (b.key === tl.peak.key && b.count > 0 ? " peak" : "")}
                style={{ height: (b.count / tl.max * 100) + "%" }} />
            </div>
            {labelEvery && <div className={"tl-x mono" + (b.future ? " future" : "")}>{b.label}</div>}
          </div>
        ))}
      </div>
      {!labelEvery && (
        <div className="tl-axis mono">
          <span>{tl.buckets[0].label}</span>
          <span>{tl.peak.count ? tl.peak.label + " · peak" : ""}</span>
          <span>{tl.buckets[tl.buckets.length - 1].label}</span>
        </div>
      )}
    </React.Fragment>
  );
}

/* GitHub-style weekly heatmap — the year window, where 365 daily bars would
   be unreadable but density/streaks read at a glance. */
function TimelineHeatmap({ tl }) {
  return (
    <div className="hm">
      <div className="hm-days mono"><span style={{ gridRow: 1 }}>Mon</span><span style={{ gridRow: 4 }}>Thu</span><span style={{ gridRow: 7 }}>Sun</span></div>
      <div className="hm-scroll">
        <div className="hm-months mono" style={{ gridTemplateColumns: `repeat(${tl.weeks.length}, minmax(11px, 20px))` }}>
          {tl.months.map((m) => <span key={m.at} style={{ gridColumnStart: m.at + 1 }}>{m.label}</span>)}
        </div>
        <div className="hm-grid" style={{ gridTemplateColumns: `repeat(${tl.weeks.length}, minmax(11px, 20px))` }}>
          {tl.weeks.map((w, wi) => (
            <div className="hm-week" key={wi}>
              {w.map((c) => c.pad
                ? <i className="hm-cell pad" key={c.key} />
                : <i key={c.key}
                    className={"hm-cell" + (c.count === 0 ? " zero" : "") + (c.key === tl.peak.key && c.count > 0 ? " peak" : "")}
                    title={`${c.label} · ${c.count} solved`}
                    style={c.count > 0 && c.key !== tl.peak.key ? { opacity: 0.3 + 0.7 * (c.count / tl.max) } : null} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Timeline({ challenges }) {
  const [range, setRange] = useState("all");
  const tl = useMemo(
    () => (challenges && challenges.length ? window.CCX.deriveTimeline(challenges, range) : null),
    [challenges, range]);
  if (!tl) return null;
  const caption = tl.mode === "heat" ? "Daily activity · weekly grid" : "Solves per day";
  return (
    <section className="section" id="timeline">
      <div className="wrap">
        <div className="section-head">
          <span className="sec-no">08</span>
          <div>
            <span className="eyebrow">Learning timeline</span>
            <h2>The work, in order.</h2>
            <p>Every solution records the date it was solved — pick a window to see
              the solving cadence.</p>
          </div>
        </div>
        <div className="tl reveal">
          <div className="tl-head">
            <span className="tl-cap mono">{caption}</span>
            <span className="psel">
              <select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Timeline window">
                {TL_RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <Icon name="arrow" size={14} />
            </span>
          </div>
          <div className="tl-stats">
            <div className="tl-stat"><div className="tl-n serif">{tl.total}</div><div className="tl-l mono">solved</div></div>
            <div className="tl-stat"><div className="tl-n serif">{tl.activeDays}</div><div className="tl-l mono">active days</div></div>
            <div className="tl-stat"><div className="tl-n serif">{tl.peak.count}</div><div className="tl-l mono">busiest {tl.unit}</div></div>
            <div className="tl-stat tl-range"><div className="tl-span serif">{tl.windowText}</div><div className="tl-l mono">{tl.windowTag}</div></div>
          </div>
          {tl.mode === "heat" ? <TimelineHeatmap tl={tl} /> : <TimelineBars tl={tl} />}
          {tl.total === 0 && <div className="tl-empty mono">No solutions in this window yet.</div>}
        </div>
      </div>
    </section>
  );
}

/* ---------- SKILL-GAP ANALYSIS ---------- */
function SkillGaps({ home }) {
  const gaps = useMemo(
    () => (home && home.challenges ? window.CCX.deriveSkillGaps(home.challenges) : null),
    [home]);
  if (!gaps) return null;
  const platTotal = (home.platforms || []).length || 16;
  const maxD = Math.max(...gaps.difficulty.map((d) => d.count), 1);
  return (
    <section className="section" id="gaps">
      <div className="wrap">
        <div className="section-head">
          <span className="sec-no">09</span>
          <div>
            <span className="eyebrow">Skill-gap analysis</span>
            <h2>Where the practice is thin.</h2>
            <p>The same metadata that powers the explorer, read in reverse — what the
              catalogue does <i>not</i> cover yet, derived live from the manifest.</p>
          </div>
        </div>
        <div className="gap reveal">
          <div className="gap-grid">
            <div className="gap-block">
              <h5 className="gap-t mono">Difficulty mix</h5>
              {gaps.difficulty.map((d) => (
                <div className="gap-row" key={d.name} title={`${d.count} ${d.name} · ${d.share}%`}>
                  <span className="gap-dl">{d.name}</span>
                  <div className="gap-track">
                    <div className="gap-fill" style={{ width: (d.count / maxD * 100) + "%", background: window.CCX.diffColor(d.name) }} />
                  </div>
                  <span className="gap-dn mono">{d.count} · {d.share}%</span>
                </div>
              ))}
            </div>
            <div className="gap-block">
              <h5 className="gap-t mono">Untouched core domains · {gaps.untouched.length} of {gaps.coreTotal}</h5>
              <div className="gap-chips">
                {gaps.untouched.map((t) => <span className="node gap-miss" key={t}>{t}</span>)}
                {gaps.untouched.length === 0 && <span className="gap-none mono">Every core domain has at least one solve.</span>}
              </div>
            </div>
            <div className="gap-block">
              <h5 className="gap-t mono">Practiced once · {gaps.thin.length} domains</h5>
              <div className="gap-chips">
                {gaps.thin.map((t) => (
                  <a className="node" key={t} href={`src/topic.html?t=${encodeURIComponent(t)}`}>{t}</a>
                ))}
                {gaps.thin.length === 0 && <span className="gap-none mono">No single-solve domains.</span>}
              </div>
            </div>
          </div>
          <div className="gap-foot mono">
            <span>{gaps.patSingle} of {gaps.patTotal} patterns practiced only once</span>
            <span>{gaps.platformsUsed} of {platTotal} platforms covered</span>
            <span>{gaps.topicsTouched} domains touched overall</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- TECHNICAL ARTICLES ---------- */
function Articles({ articles }) {
  if (!articles || !articles.length) return null;
  const fmt = (iso) => iso ? new Date(iso + "T00:00:00Z").toLocaleDateString("en",
    { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "";
  return (
    <section className="section" id="writing">
      <div className="wrap">
        <div className="section-head">
          <span className="sec-no">10</span>
          <div>
            <span className="eyebrow">Writing</span>
            <h2>Engineering notes from building this.</h2>
            <p>Technical articles grown out of the repository itself — postmortems,
              design decisions and the trade-offs behind them.</p>
          </div>
        </div>
        <div className="grid-cards">
          {articles.map((a, i) => (
            <a className="pcard reveal" key={a.slug} href={`src/article.html?a=${encodeURIComponent(a.slug)}`}
              style={{ transitionDelay: (i % 3 * 0.05) + "s" }}>
              <div className="pcard-top">
                <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{fmt(a.date)}</span>
                <span className="pcard-count">{a.readMin} min read</span>
              </div>
              <h3 style={{ marginTop: 14 }}>{a.title}</h3>
              <p>{a.summary}</p>
              <div className="pcard-foot" style={{ marginTop: "auto", paddingTop: 16 }}>
                <span>{(a.tags || []).slice(0, 2).join(" · ") || "article"}</span>
                <span className="pcard-go"><Icon name="arrow" size={15} /></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- LANGUAGES marquee ---------- */
const LANG_LIST = [
  { name: "C", c: "#8d96a8" },
  { name: "C#", c: "#6a4fb0" },
  { name: "C++", c: "#6e8fd6" },
  { name: "Css", c: "#5b8def" },
  { name: "Go", c: "#4fc3d9" },
  { name: "Html", c: "#e06a4a" },
  { name: "Java", c: "#d0743a" },
  { name: "JavaScript", c: "#d8b832" },
  { name: "Json", c: "#8a857a" },
  { name: "PHP", c: "#6d7fb8" },
  { name: "Python", c: "#5394d0" },
  { name: "Python3", c: "#4a7bd0" },
  { name: "Rust", c: "#cd7f52" },
  { name: "SQL", c: "#c98a2a" },
  { name: "Shell", c: "#3f9e6a" },
  { name: "TypeScript", c: "#3aa6b9" },
  { name: "Unity", c: "#7a8290" },
  { name: "Yaml", c: "#c0503a" },
];

function Languages() {
  const row = [...LANG_LIST, ...LANG_LIST];
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head" style={{ marginBottom: 28 }}>
          <span className="sec-no">07</span>
          <div>
            <span className="eyebrow">Technology stack</span>
            <h2>No default language. Performance decides.</h2>
          </div>
        </div>
        <div className="lang-marquee">
          <div className="lang-track">
            {row.map((l, i) => (
              <span className="lang" key={i}><span className="sw" style={{ background: l.c }} />{l.name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- ROADMAP + FOOTER ---------- */
function Footer({ roadmap, totals }) {
  return (
    <React.Fragment>
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="sec-no">11</span>
            <div>
              <span className="eyebrow">Roadmap</span>
              <h2>From repository to learning system.</h2>
            </div>
          </div>
          <div className="road">
            {roadmap.map((ph) => (
              <div className={"phase reveal" + (ph.done ? "" : " future")} key={ph.n}>
                <div className="phase-n">{ph.n}{ph.done ? " · shipped" : " · planned"}</div>
                <h4>{ph.title}</h4>
                <ul>{ph.items.map((it) => (
                  <li key={it.label} className={"phase-item" + (it.done ? " is-done" : "")}>
                    <span className="phase-tick">{it.done ? <Icon name="check" size={12} /> : null}</span>{it.label}
                  </li>
                ))}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <div className="footer-cta reveal">
            <div className="hero-grid-bg" style={{ opacity: 0.5 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <span className="eyebrow" style={{ justifyContent: "center" }}>Coding Challenges</span>
              <h2 style={{ marginTop: 14 }}>Structured platforms.<br /><span className="clay serif" style={{ fontStyle: "italic" }}>Smart solutions.</span></h2>
              <p>An engineering portfolio built to be explored — {totals.challenges} challenges, fully documented and traceable.</p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#platforms">Browse the work <Icon name="arrow" size={16} /></a>
                <a className="btn btn-ghost" href="https://github.com/danielPoloWork/coding-challenges" target="_blank" rel="noopener noreferrer"><Icon name="github" size={16} /> View source</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="mono">© 2026 · Daniel Polo</span>
            <span className="mono">Structured platforms. Smart Solutions.</span>
          </div>
        </div>
      </footer>
    </React.Fragment>
  );
}

Object.assign(window, { Platforms, Featured, SolutionPreview, Patterns, Topics, Timeline, SkillGaps, Articles, Languages, Footer });
