/* Coding Challenges — sections part 1 (React hooks + Icon come from ui.jsx) */

/* ---------- count up ---------- */
function CountUp({ end, dur = 1500, plus }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => {
    done.current = false;
    const el = ref.current;
    const run = () => {
      if (done.current) return;
      done.current = true;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setV(Math.round(end * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const check = () => {
      if (done.current) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.15 && r.bottom > -40) { run(); cleanup(); }
    };
    const cleanup = () => { window.removeEventListener("scroll", check); window.removeEventListener("resize", check); };
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();
    requestAnimationFrame(check);
    requestAnimationFrame(() => requestAnimationFrame(check));
    return cleanup;
  }, [end, dur]);
  return <span ref={ref} className="stat-num">{v.toLocaleString()}{plus && <small>+</small>}</span>;
}

/* ---------- NAV ---------- */
function Nav({ theme, onToggle }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [["Overview", "#overview"], ["Architecture", "#architecture"], ["Platforms", "#platforms"], ["Solutions", "#solutions"], ["Patterns", "#patterns"]];
  return (
    <nav className={"nav" + (scrolled ? " scrolled" : "")}>
      <div className="nav-inner">
        <a className="brand" href="#top">
          <span className="brand-mark">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8.5 7 H23.5" />
              <path d="M8.5 7 C8.5 13.5 11.5 18 16 18 C20.5 18 23.5 13.5 23.5 7" />
              <path d="M8.5 7.5 L5 10 L8.5 12.5" />
              <path d="M23.5 7.5 L27 10 L23.5 12.5" />
              <path d="M18 9.5 L14 15" />
              <path d="M16 18 V22" />
              <path d="M11.5 24 H20.5" />
            </svg>
          </span>
          <span className="brand-name">Coding&nbsp;<b>Challenges</b></span>
        </a>
        <div className="nav-links">
          {links.map(([t, h]) => <a key={h} className="nav-link" href={h}>{t}</a>)}
        </div>
        <div className="nav-spacer" />
        <div className="nav-actions">
          <button className="theme-toggle" onClick={onToggle} aria-label="Toggle theme">
            <Icon name={theme === "dark" ? "sun" : "moon"} />
          </button>
          <a className="btn btn-ghost" href="#" style={{ gap: 8 }}><Icon name="github" size={16} /> GitHub</a>
        </div>
      </div>
    </nav>
  );
}

/* ---------- HERO ---------- */
function Hero({ totals }) {
  return (
    <header className="hero" id="top">
      <div className="hero-grid-bg" />
      <div className="wrap hero-inner">
        <div className="hero-top">
          <span className="eyebrow reveal">Engineering knowledge base · est. 2024</span>
          <h1 className="hero-title reveal" style={{ transitionDelay: ".05s" }}>
            Structured platforms.<br /><em>Smart solutions.</em>
          </h1>
          <p className="hero-sub reveal" style={{ transitionDelay: ".12s" }}>
            A long-term reference system for algorithmic problem solving — every challenge
            documented with reasoning, complexity trade-offs and reusable patterns, organised
            across {totals.catalogued || totals.platforms} platforms and rendered to be read.
          </p>
          <div className="hero-cta reveal" style={{ transitionDelay: ".18s" }}>
            <a className="btn btn-primary" href="#platforms">Explore the work <Icon name="arrow" size={16} /></a>
            <a className="btn btn-ghost" href="#solutions">See a solution</a>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- STATS ---------- */
function Stats({ totals }) {
  const t = totals || { challenges: 0, platforms: 0, languages: 0, patterns: 0 };
  const items = [
    { n: t.challenges, label: "Challenges solved" },
    { n: t.platforms, label: "Source platforms", sub: t.catalogued ? `of ${t.catalogued} catalogued` : null },
    { n: t.languages, label: "Languages used" },
    { n: t.patterns, label: "Catalogued patterns" },
  ];
  return (
    <div className="wrap">
      <div className="stats reveal">
        {items.map((s) => (
          <div className="stat" key={s.label}>
            <CountUp end={s.n} plus={s.plus} />
            <div className="stat-label">{s.label}</div>
            {s.sub && <div className="stat-sub mono">{s.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- PRINCIPLES ---------- */
function Principles({ principles }) {
  return (
    <section className="section band-tint" id="overview">
      <div className="wrap">
        <div className="section-head">
          <span className="sec-no">01</span>
          <div>
            <span className="eyebrow">Engineering principles</span>
            <h2>Not a dump of accepted answers — a documented reasoning system.</h2>
            <p>The goal is to capture the architectural decisions and trade-offs behind each
              solution, so the repository compounds into a genuine engineering reference.</p>
          </div>
        </div>
        <div className="principles">
          {principles.map((p, i) => (
            <div className="principle reveal" key={p.idx} style={{ transitionDelay: (i * 0.06) + "s" }}>
              <div className="principle-idx">{p.idx}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- ARCHITECTURE diagram ---------- */
function Architecture({ layers }) {
  return (
    <section className="section" id="architecture">
      <div className="wrap">
        <div className="section-head">
          <span className="sec-no">02</span>
          <div>
            <span className="eyebrow">Repository architecture</span>
            <h2>Three views of the same work.</h2>
            <p>Every challenge is filed once but reachable three ways — by platform, by
              algorithmic domain, and by the pattern it teaches.</p>
          </div>
        </div>
        <div className="arch reveal">
          <div className="arch-grid-bg" />
          <div className="arch-inner">
            <div style={{ textAlign: "center" }}>
              <div className="arch-root"><span>📁</span><span className="mono">coding-challenges<b>/</b></span></div>
            </div>
            <div className="arch-layers">
              {layers.map((l) => (
                <div className="layer" key={l.name}>
                  <div className="layer-tag">{l.tag}</div>
                  <h4>{l.name}</h4>
                  <div className="layer-desc">{l.desc}</div>
                  <div className="layer-list">
                    {l.nodes.map((n) => <span className="node" key={n}>{n}</span>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="arch-flow">
              <span className="pill">challenge.json</span>
              <span className="arrow">→</span>
              <span className="pill">platform</span>
              <span className="arrow">×</span>
              <span className="pill">domain</span>
              <span className="arrow">×</span>
              <span className="pill">pattern</span>
              <span className="arrow">→</span>
              <span className="pill">cross-referenced unit</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Icon, CountUp, Nav, Hero, Stats, Principles, Architecture });
