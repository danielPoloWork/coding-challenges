/* Coding Challenges — writing index. Lists every article from
   manifest.articles (already date-sorted by the generator), newest first.
   Deliberately a plain list, not a filterable table: at this volume filters
   would be decoration. The data (date/tags/readMin) is already in the
   manifest, so upgrading later is rendering work only. */

function ArticlesPage() {
  const [theme, toggleTheme] = usePageTheme();
  const [data, setData] = useState({ loading: true });

  useEffect(() => {
    let alive = true;
    window.CCX.loadManifest()
      .then((m) => { if (alive) setData({ loading: false, articles: m.articles || [] }); })
      .catch((e) => { if (alive) setData({ loading: false, error: e.message }); });
    return () => { alive = false; };
  }, []);

  const fmt = (iso) => iso ? new Date(iso + "T00:00:00Z").toLocaleDateString("en",
    { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : "";

  return (
    <React.Fragment>
      <InnerNav theme={theme} onToggleTheme={toggleTheme} backHref="index.html#writing" backLabel="Home" />
      <main id="main" className="wrap cpage">
        {data.loading && <div className="cloading"><span className="spin" /> Loading articles…</div>}
        {data.error && <div className="cerror"><h2 className="serif">Couldn’t load the index.</h2><p className="mono">{data.error}</p></div>}
        {data.articles && (
          <div className="artl">
            <header className="artl-head">
              <span className="eyebrow">Writing</span>
              <h1 className="serif">Engineering notes from building this.</h1>
              <p>Postmortems, decision records and methodology — every piece grown out of
                the repository's own history, never written to fill space.</p>
            </header>
            {data.articles.map((a) => (
              <a className="artl-row" key={a.slug} href={`src/article.html?a=${encodeURIComponent(a.slug)}`}>
                <div className="artl-main">
                  <h3>{a.title}</h3>
                  <p>{a.summary}</p>
                  <div className="artl-tags">
                    {(a.tags || []).map((t) => <span className="node" key={t}>{t}</span>)}
                  </div>
                </div>
                <div className="artl-meta mono">
                  <span>{fmt(a.date)}</span>
                  <span>{a.readMin} min read</span>
                </div>
              </a>
            ))}
            {data.articles.length === 0 && <div className="pempty mono">No articles yet.</div>}
          </div>
        )}
      </main>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ArticlesPage />);
