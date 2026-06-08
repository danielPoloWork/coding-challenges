/* Coding Challenges — sections part 2 */

/* ---------- PLATFORMS grid ---------- */
function Platforms({ platforms }) {
  return (
    <section className="section band-tint" id="platforms">
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
    <section className="section band-tint" id="solutions">
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
          {patterns.map((p) => (
            <span className="pat" key={p.name}>{p.name}<span className="c">{p.n}</span></span>
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
    <section className="section band-tint">
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
            <span className="sec-no">08</span>
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
                <ul>{ph.items.map((it) => <li key={it}>{it}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer band-tint">
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

Object.assign(window, { Platforms, Featured, SolutionPreview, Patterns, Languages, Footer });
