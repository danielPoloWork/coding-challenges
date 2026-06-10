/* Coding Challenges — technical article reader.
   Reads ?a=<slug>, resolves it against manifest.articles (the listing built by
   src/scripts/build-manifest.mjs from articles/<slug>.md), then fetches the
   real markdown file and renders it with the shared parser in cc-core.js.
   The slug is only ever used after it matches a manifest entry, so the page
   can never be steered to fetch arbitrary paths. */

const FM_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

function fmtDate(iso) {
  return iso ? new Date(iso + "T00:00:00Z").toLocaleDateString("en",
    { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : "";
}

function ArticlePage() {
  const [theme, toggleTheme] = usePageTheme();
  const slug = window.CCX.qs("a");
  const [data, setData] = useState({ loading: true });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const manifest = await window.CCX.loadManifest();
        const articles = manifest.articles || [];
        const meta = articles.find((a) => a.slug === slug);
        if (!meta) { if (alive) setData({ loading: false, articles, notFound: true }); return; }
        const res = await fetch(`articles/${meta.slug}.md`, { cache: "no-cache" });
        if (!res.ok) throw new Error("article " + res.status);
        const raw = await res.text();
        const body = raw.replace(FM_RE, "");
        if (alive) {
          setData({ loading: false, meta, articles, html: window.CCX.parseMarkdown(body) });
          document.title = `${meta.title} · Coding Challenges`;
        }
      } catch (e) {
        if (alive) setData({ loading: false, error: e.message });
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  const others = (data.articles || []).filter((a) => !data.meta || a.slug !== data.meta.slug);

  return (
    <React.Fragment>
      <InnerNav theme={theme} onToggleTheme={toggleTheme} backHref="index.html#writing" backLabel="Home" />
      <main className="wrap cpage">
        {data.loading && <div className="cloading"><span className="spin" /> Loading article…</div>}
        {data.error && <div className="cerror"><h2 className="serif">Couldn’t load the article.</h2><p className="mono">{data.error}</p></div>}
        {data.notFound && (
          <div className="cerror">
            <h2 className="serif">No such article.</h2>
            <p className="mono">{slug ? `"${slug}" is not in the index.` : "Missing ?a=<slug> parameter."}</p>
          </div>
        )}
        {data.meta && (
          <article className="art">
            <header className="art-head">
              <span className="eyebrow">Technical article</span>
              <h1 className="serif">{data.meta.title}</h1>
              <div className="art-meta mono">
                <span>{fmtDate(data.meta.date)}</span>
                <span>·</span>
                <span>{data.meta.readMin} min read</span>
              </div>
              {data.meta.tags.length > 0 && (
                <div className="art-tags">
                  {data.meta.tags.map((t) => <span className="node" key={t}>{t}</span>)}
                </div>
              )}
              {data.meta.summary && <p className="art-summary">{data.meta.summary}</p>}
            </header>
            <div className="md art-body" dangerouslySetInnerHTML={{ __html: data.html }} />
          </article>
        )}
        {!data.loading && others.length > 0 && (
          <aside className="art-more">
            <h3 className="mono art-more-t">More writing</h3>
            {others.map((a) => (
              <a className="art-row" key={a.slug} href={`src/article.html?a=${encodeURIComponent(a.slug)}`}>
                <span className="art-row-title">{a.title}</span>
                <span className="art-row-meta mono">{fmtDate(a.date)} · {a.readMin} min</span>
              </a>
            ))}
          </aside>
        )}
      </main>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ArticlePage />);
