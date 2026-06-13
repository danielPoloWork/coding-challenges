/* GENERATED from src/assets/app.jsx by scripts/build-jsx.mjs — edit the .jsx, not this file. */
/* Coding Challenges — App shell, theming, reveal, tweaks */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "variant": "editorial",
  "dark": false,
  "accent": true,
  "motion": true,
  "heroGrid": true,
  "fontScale": 17
} /*EDITMODE-END*/;
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const CC = window.CC;
  const [home, setHome] = useState(null);
  const [manifestFailed, setManifestFailed] = useState(false);

  // load the manifest once — homepage stats/grid/featured are all derived from it
  useEffect(() => {
    let alive = true;
    window.CCX.loadManifest().then(m => {
      if (alive) setHome(window.CCX.deriveHome(m));
    }).catch(e => {
      console.warn("manifest load failed", e);
      if (alive) setManifestFailed(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  const totals = home && home.totals || CC.totals;

  // reveal on scroll — additive only, gated on .reveal-ready so content shows if JS fails
  useEffect(() => {
    const html = document.documentElement;
    if (!t.motion) {
      html.classList.remove("reveal-ready");
      return;
    }
    html.classList.add("reveal-ready");
    let raf = 0;
    const check = () => {
      const h = window.innerHeight;
      document.querySelectorAll(".reveal:not(.in)").forEach(n => {
        const r = n.getBoundingClientRect();
        if (r.top < h * 0.9 && r.bottom > 0) n.classList.add("in");
      });
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    check();
    requestAnimationFrame(check);
    requestAnimationFrame(() => requestAnimationFrame(check));
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [t.variant, t.motion, home]);

  // apply root attributes
  useEffect(() => {
    const r = document.documentElement;
    r.setAttribute("data-theme", t.dark ? "dark" : "light");
    r.setAttribute("data-variant", t.variant);
    r.setAttribute("data-accent", t.accent ? "on" : "off");
    document.body.style.fontSize = t.fontScale + "px";
  }, [t.dark, t.variant, t.accent, t.fontScale]);
  const toggleTheme = () => setTweak("dark", !t.dark);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Nav, {
    theme: t.dark ? "dark" : "light",
    onToggle: toggleTheme
  }), manifestFailed && /*#__PURE__*/React.createElement("div", {
    role: "alert",
    className: "mono",
    style: {
      padding: "10px 20px",
      textAlign: "center",
      fontSize: 12.5,
      background: "var(--clay-tint)",
      color: "var(--ink-2)",
      borderBottom: "1px solid var(--hairline)"
    }
  }, "Live data unavailable \u2014 the numbers below are sample placeholders.", " ", /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/danielPoloWork/coding-challenges",
    style: {
      color: "var(--ink)"
    }
  }, "Browse the repository"), " for the real thing."), /*#__PURE__*/React.createElement("main", {
    id: "main",
    key: t.variant
  }, /*#__PURE__*/React.createElement(Hero, {
    totals: totals,
    live: !!home
  }), t.heroGrid ? null : /*#__PURE__*/React.createElement("style", null, `.hero-grid-bg{display:none}`), /*#__PURE__*/React.createElement(GlobalSearch, {
    challenges: home ? home.challenges : null
  }), /*#__PURE__*/React.createElement(Stats, {
    totals: home ? home.totals : null,
    key: home ? "real" : "load"
  }), /*#__PURE__*/React.createElement(Principles, {
    principles: CC.principles
  }), /*#__PURE__*/React.createElement(Architecture, {
    layers: CC.layers
  }), /*#__PURE__*/React.createElement(Platforms, {
    platforms: home ? home.platforms : null
  }), /*#__PURE__*/React.createElement(Featured, {
    featured: home ? home.featured : null
  }), /*#__PURE__*/React.createElement(SolutionPreview, {
    proposals: CC.proposals
  }), /*#__PURE__*/React.createElement(Patterns, {
    patterns: home ? home.patterns : CC.patterns
  }), /*#__PURE__*/React.createElement(Topics, {
    topics: home ? home.topics : []
  }), /*#__PURE__*/React.createElement(Constellation, {
    challenges: home ? home.challenges : null
  }), /*#__PURE__*/React.createElement(Languages, {
    languages: home ? home.languages : CC.languages
  }), /*#__PURE__*/React.createElement(Timeline, {
    challenges: home ? home.challenges : null
  }), /*#__PURE__*/React.createElement(SkillGaps, {
    home: home
  }), /*#__PURE__*/React.createElement(Articles, {
    articles: home ? home.articles : null
  }), /*#__PURE__*/React.createElement(Footer, {
    roadmap: CC.roadmap,
    totals: totals
  })), /*#__PURE__*/React.createElement(TweaksPanel, null, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Home layout"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Variant",
    value: t.variant,
    options: ["editorial", "terminal", "index"],
    onChange: v => setTweak("variant", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Appearance"
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Dark mode",
    value: t.dark,
    onChange: v => setTweak("dark", v)
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Clay accent",
    value: t.accent,
    onChange: v => setTweak("accent", v)
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Hero grid",
    value: t.heroGrid,
    onChange: v => setTweak("heroGrid", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Motion & type"
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Scroll reveal",
    value: t.motion,
    onChange: v => setTweak("motion", v)
  }), /*#__PURE__*/React.createElement(TweakSlider, {
    label: "Base size",
    value: t.fontScale,
    min: 15,
    max: 20,
    step: 1,
    unit: "px",
    onChange: v => setTweak("fontScale", v)
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
