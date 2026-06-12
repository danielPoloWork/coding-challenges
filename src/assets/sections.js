/* GENERATED from src/assets/sections.jsx by scripts/build-jsx.mjs — edit the .jsx, not this file. */
/* Coding Challenges — sections part 1 (React hooks + Icon come from ui.jsx) */

/* ---------- count up ---------- */
/* `ready` gates the run: the hero passes it as "manifest loaded", so the
   numbers count once over the real totals instead of counting the fallback
   first and re-counting when the fetch lands. */
function CountUp({
  end,
  dur = 1500,
  plus,
  ready = true
}) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => {
    if (!ready) return;
    done.current = false;
    const el = ref.current;
    const run = () => {
      if (done.current) return;
      done.current = true;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setV(end);
        return;
      }
      const t0 = performance.now();
      const tick = t => {
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
      if (r.top < window.innerHeight * 1.15 && r.bottom > -40) {
        run();
        cleanup();
      }
    };
    const cleanup = () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
    window.addEventListener("scroll", check, {
      passive: true
    });
    window.addEventListener("resize", check);
    check();
    requestAnimationFrame(check);
    requestAnimationFrame(() => requestAnimationFrame(check));
    return cleanup;
  }, [end, dur, ready]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    className: "stat-num"
  }, v.toLocaleString(), plus && /*#__PURE__*/React.createElement("small", null, "+"));
}

/* ---------- NAV ---------- */
function Nav({
  theme,
  onToggle
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [["Search", "#search"], ["Overview", "#overview"], ["Architecture", "#architecture"], ["Platforms", "#platforms"], ["Solutions", "#solutions"], ["Patterns", "#patterns"], ["Topics", "#topics"], ["Writing", "#writing"]];
  return /*#__PURE__*/React.createElement("nav", {
    className: "nav" + (scrolled || menu ? " scrolled" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav-inner"
  }, /*#__PURE__*/React.createElement("a", {
    className: "brand",
    href: "#top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "brand-mark"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 7 H23.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 7 C8.5 13.5 11.5 18 16 18 C20.5 18 23.5 13.5 23.5 7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 7.5 L5 10 L8.5 12.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M23.5 7.5 L27 10 L23.5 12.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 9.5 L14 15"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 18 V22"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11.5 24 H20.5"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "brand-name"
  }, "Coding\xA0", /*#__PURE__*/React.createElement("b", null, "Challenges"))), /*#__PURE__*/React.createElement("div", {
    className: "nav-links"
  }, links.map(([t, h]) => /*#__PURE__*/React.createElement("a", {
    key: h,
    className: "nav-link",
    href: h
  }, t))), /*#__PURE__*/React.createElement("div", {
    className: "nav-spacer"
  }), /*#__PURE__*/React.createElement("div", {
    className: "nav-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "theme-toggle",
    onClick: onToggle,
    "aria-label": "Toggle theme"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === "dark" ? "sun" : "moon"
  })), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-ghost nav-gh",
    href: "https://github.com/danielPoloWork/coding-challenges",
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "github",
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    className: "nav-gh-label"
  }, "GitHub")), /*#__PURE__*/React.createElement("button", {
    className: "theme-toggle nav-menu-btn",
    onClick: () => setMenu(m => !m),
    "aria-label": "Menu",
    "aria-expanded": menu
  }, /*#__PURE__*/React.createElement(Icon, {
    name: menu ? "x" : "menu"
  })))), menu && /*#__PURE__*/React.createElement("div", {
    className: "nav-sheet"
  }, links.map(([t, h]) => /*#__PURE__*/React.createElement("a", {
    key: h,
    className: "nav-sheet-link",
    href: h,
    onClick: () => setMenu(false)
  }, t))));
}

/* ---------- HERO ---------- */
function Hero({
  totals,
  live
}) {
  const t = totals || {
    challenges: 0,
    platforms: 0,
    languages: 0,
    patterns: 0,
    topics: 0
  };
  const items = [{
    n: t.challenges,
    label: "Challenges solved"
  }, {
    n: t.platforms,
    label: "Source platforms",
    sub: t.catalogued ? `of ${t.catalogued} catalogued` : null
  }, {
    n: t.languages,
    label: "Languages used"
  }, {
    n: t.patterns,
    label: "Catalogued patterns"
  }, {
    n: t.topics || 0,
    label: "Catalogued topics"
  }];
  // gsap entrance (fx.js) — layout effect so the initial state lands before
  // first paint; without gsap the hero simply renders static
  React.useLayoutEffect(() => {
    window.CCFX && window.CCFX.heroIntro();
  }, []);
  return /*#__PURE__*/React.createElement("header", {
    className: "hero",
    id: "top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-grid-bg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "wrap hero-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hero-badge",
    "data-fx": true
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "Engineering knowledge base \xB7 est. 2024"), /*#__PURE__*/React.createElement("h1", {
    className: "hero-title",
    "data-fx": true
  }, "Structured", /*#__PURE__*/React.createElement("br", null), "platforms."), /*#__PURE__*/React.createElement("h1", {
    className: "hero-title",
    "data-fx": true
  }, /*#__PURE__*/React.createElement("em", null, "Smart solutions.")), /*#__PURE__*/React.createElement("p", {
    className: "lede",
    "data-fx": true
  }, "A long-term reference system for algorithmic problem solving \u2014 every challenge documented with reasoning, complexity trade-offs and reusable patterns, organised across ", totals.catalogued || totals.platforms, " platforms and rendered to be read."), /*#__PURE__*/React.createElement("div", {
    className: "hero-cta",
    "data-fx": true
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn-primary",
    href: "#platforms"
  }, "Explore the work ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 16
  })), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-ghost",
    href: "#solutions"
  }, "See a solution")), /*#__PURE__*/React.createElement("div", {
    className: "stats",
    "data-fx": true
  }, items.map(s => /*#__PURE__*/React.createElement("div", {
    className: "stat",
    key: s.label
  }, /*#__PURE__*/React.createElement(CountUp, {
    end: s.n,
    plus: s.plus,
    ready: live
  }), /*#__PURE__*/React.createElement("div", {
    className: "stat-label"
  }, s.label), s.sub && /*#__PURE__*/React.createElement("div", {
    className: "stat-sub mono"
  }, s.sub)))))));
}

/* ---------- STATS ---------- */
function Stats({
  totals
}) {
  const t = totals || {
    challenges: 0,
    platforms: 0,
    languages: 0,
    patterns: 0,
    topics: 0
  };
  const items = [{
    n: t.challenges,
    label: "Challenges solved"
  }, {
    n: t.platforms,
    label: "Source platforms",
    sub: t.catalogued ? `of ${t.catalogued} catalogued` : null
  }, {
    n: t.languages,
    label: "Languages used"
  }, {
    n: t.patterns,
    label: "Catalogued patterns"
  }, {
    n: t.topics || 0,
    label: "Catalogued topics"
  }];
  return '';
}

/* ---------- GLOBAL SEARCH (every challenge, every platform) ---------- */
function GlobalSearch({
  challenges
}) {
  const [q, setQ] = useState("");
  const langsOf = c => c.languages || [c.language];
  const idCmp = (a, b) => {
    const an = /^\d+$/.test(a.id),
      bn = /^\d+$/.test(b.id);
    if (an && bn) return parseInt(a.id, 10) - parseInt(b.id, 10);
    return String(a.id).localeCompare(String(b.id));
  };

  // every query token must match somewhere in the challenge ("dp hard" works)
  const rows = useMemo(() => {
    const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length || !challenges) return [];
    return challenges.filter(c => {
      const hay = [c.id, c.title, c.platform, c.difficulty, ...langsOf(c), ...(c.topics || []), ...(c.patterns || [])].join(" ").toLowerCase();
      return tokens.every(t => hay.includes(t));
    }).sort(idCmp);
  }, [challenges, q]);
  const shown = rows.slice(0, 12);
  const href = c => `src/challenge.html?path=${encodeURIComponent(c.path)}`;
  const onKey = e => {
    if (e.key === "Escape") setQ("");
    if (e.key === "Enter" && rows.length) window.location.href = href(rows[0]);
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "search"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gsearch-head reveal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow",
    style: {
      justifyContent: "center"
    }
  }, "Global search"), /*#__PURE__*/React.createElement("h2", null, "Every challenge, one box."), /*#__PURE__*/React.createElement("p", null, "Search across all platforms at once \u2014 by title, id, topic, pattern, language or difficulty.")), /*#__PURE__*/React.createElement("div", {
    className: "psearch gsearch-box reveal"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 17
  }), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    onKeyDown: onKey,
    placeholder: challenges ? "Try “matrix”, “dp hard”, “rust”…" : "Loading index…",
    disabled: !challenges,
    "aria-label": "Search all challenges"
  }), q && /*#__PURE__*/React.createElement("button", {
    className: "psearch-x",
    onClick: () => setQ(""),
    "aria-label": "Clear"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 14
  }))), q.trim() && challenges && /*#__PURE__*/React.createElement("div", {
    className: "gsearch-results"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pcount mono"
  }, rows.length, " of ", challenges.length, " challenges match", rows.length ? " — Enter opens the first" : ""), /*#__PURE__*/React.createElement("div", {
    className: "ptable"
  }, shown.map(c => /*#__PURE__*/React.createElement("a", {
    className: "prow",
    key: c.platform + c.id,
    href: href(c)
  }, /*#__PURE__*/React.createElement("div", {
    className: "c-id mono"
  }, c.id), /*#__PURE__*/React.createElement("div", {
    className: "c-title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "prow-title"
  }, c.title), /*#__PURE__*/React.createElement("span", {
    className: "prow-pats mono"
  }, [c.platform, ...(c.patterns || []).slice(0, 2)].join(" · "))), /*#__PURE__*/React.createElement("div", {
    className: "c-diff"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ddot",
    style: {
      background: window.CCX.diffColor(c.difficulty)
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: window.CCX.diffColor(c.difficulty)
    }
  }, c.difficulty)), /*#__PURE__*/React.createElement("div", {
    className: "c-lang mono"
  }, langsOf(c).map(l => /*#__PURE__*/React.createElement("span", {
    className: "lchip",
    key: l
  }, /*#__PURE__*/React.createElement("span", {
    className: "ldot",
    style: {
      background: window.CCX.langColor(l)
    }
  }), l))), /*#__PURE__*/React.createElement("div", {
    className: "c-type"
  }, (c.topics || []).slice(0, 2).map(tp => /*#__PURE__*/React.createElement("span", {
    className: "node",
    key: tp
  }, tp))), /*#__PURE__*/React.createElement("div", {
    className: "c-go"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 16
  })))), rows.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "pempty mono"
  }, "No challenges match.")), rows.length > shown.length && /*#__PURE__*/React.createElement("div", {
    className: "pcount mono"
  }, "+", rows.length - shown.length, " more \u2014 refine your search"))));
}

/* ---------- PRINCIPLES ---------- */
function Principles({
  principles
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "overview"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-no"
  }, "01"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Engineering principles"), /*#__PURE__*/React.createElement("h2", null, "Not a dump of accepted answers \u2014 a documented reasoning system."), /*#__PURE__*/React.createElement("p", null, "The goal is to capture the architectural decisions and trade-offs behind each solution, so the repository compounds into a genuine engineering reference."))), /*#__PURE__*/React.createElement("div", {
    className: "principles"
  }, principles.map((p, i) => /*#__PURE__*/React.createElement("div", {
    className: "principle reveal",
    key: p.idx,
    style: {
      transitionDelay: i * 0.06 + "s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "principle-idx"
  }, p.idx), /*#__PURE__*/React.createElement("h3", null, p.title), /*#__PURE__*/React.createElement("p", null, p.desc))))));
}

/* ---------- ARCHITECTURE diagram ---------- */
function Architecture({
  layers
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "architecture"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-no"
  }, "02"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Repository architecture"), /*#__PURE__*/React.createElement("h2", null, "Three views of the same work."), /*#__PURE__*/React.createElement("p", null, "Every challenge is filed once but reachable three ways \u2014 by platform, by algorithmic domain, and by the pattern it teaches."))), /*#__PURE__*/React.createElement("div", {
    className: "arch reveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "arch-grid-bg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "arch-inner"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "arch-root"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCC1"), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "coding-challenges", /*#__PURE__*/React.createElement("b", null, "/")))), /*#__PURE__*/React.createElement("div", {
    className: "arch-layers"
  }, layers.map(l => /*#__PURE__*/React.createElement("div", {
    className: "layer",
    key: l.name
  }, /*#__PURE__*/React.createElement("div", {
    className: "layer-tag"
  }, l.tag), /*#__PURE__*/React.createElement("h4", null, l.name), /*#__PURE__*/React.createElement("div", {
    className: "layer-desc"
  }, l.desc), /*#__PURE__*/React.createElement("div", {
    className: "layer-list"
  }, l.nodes.map(n => /*#__PURE__*/React.createElement("span", {
    className: "node",
    key: n
  }, n)))))), /*#__PURE__*/React.createElement("div", {
    className: "arch-flow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, "challenge.json"), /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, "platform"), /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\xD7"), /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, "domain"), /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\xD7"), /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, "pattern"), /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, "cross-referenced unit"))))));
}
Object.assign(window, {
  Icon,
  CountUp,
  Nav,
  Hero,
  Stats,
  GlobalSearch,
  Principles,
  Architecture
});
