/* Coding Challenges — App shell, theming, reveal, tweaks */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "variant": "editorial",
  "dark": false,
  "accent": true,
  "motion": true,
  "heroGrid": true,
  "fontScale": 17
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const CC = window.CC;
  const [home, setHome] = useState(null);

  // load the manifest once — homepage stats/grid/featured are all derived from it
  useEffect(() => {
    let alive = true;
    window.CCX.loadManifest()
      .then((m) => { if (alive) setHome(window.CCX.deriveHome(m)); })
      .catch((e) => console.warn("manifest load failed", e));
    return () => { alive = false; };
  }, []);

  const totals = (home && home.totals) || CC.totals;

  // reveal on scroll — additive only, gated on .reveal-ready so content shows if JS fails
  useEffect(() => {
    const html = document.documentElement;
    if (!t.motion) { html.classList.remove("reveal-ready"); return; }
    html.classList.add("reveal-ready");
    let raf = 0;
    const check = () => {
      const h = window.innerHeight;
      document.querySelectorAll(".reveal:not(.in)").forEach((n) => {
        const r = n.getBoundingClientRect();
        if (r.top < h * 0.9 && r.bottom > 0) n.classList.add("in");
      });
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(check); };
    check();
    requestAnimationFrame(check);
    requestAnimationFrame(() => requestAnimationFrame(check));
    window.addEventListener("scroll", onScroll, { passive: true });
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

  return (
    <React.Fragment>
      <Nav theme={t.dark ? "dark" : "light"} onToggle={toggleTheme} />
      <main key={t.variant}>
        <Hero totals={totals} />
        {t.heroGrid ? null : <style>{`.hero-grid-bg{display:none}`}</style>}
        <Stats totals={home ? home.totals : null} key={home ? "real" : "load"} />
        <Principles principles={CC.principles} />
        <Architecture layers={CC.layers} />
        <Platforms platforms={home ? home.platforms : null} />
        <Featured featured={home ? home.featured : null} />
        <SolutionPreview proposals={CC.proposals} />
        <Patterns patterns={home ? home.patterns : CC.patterns} />
        <Languages languages={home ? home.languages : CC.languages} />
        <Footer roadmap={CC.roadmap} totals={totals} />
      </main>

      <TweaksPanel>
        <TweakSection label="Home layout" />
        <TweakRadio label="Variant" value={t.variant}
          options={["editorial", "terminal", "index"]}
          onChange={(v) => setTweak("variant", v)} />
        <TweakSection label="Appearance" />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak("dark", v)} />
        <TweakToggle label="Clay accent" value={t.accent} onChange={(v) => setTweak("accent", v)} />
        <TweakToggle label="Hero grid" value={t.heroGrid} onChange={(v) => setTweak("heroGrid", v)} />
        <TweakSection label="Motion & type" />
        <TweakToggle label="Scroll reveal" value={t.motion} onChange={(v) => setTweak("motion", v)} />
        <TweakSlider label="Base size" value={t.fontScale} min={15} max={20} step={1} unit="px"
          onChange={(v) => setTweak("fontScale", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
