/* GENERATED from src/assets/articles.jsx by scripts/build-jsx.mjs — edit the .jsx, not this file. */
/* Coding Challenges — writing index. Lists every article from
   manifest.articles (already date-sorted by the generator), newest first.
   Deliberately a plain list, not a filterable table: at this volume filters
   would be decoration. The data (date/tags/readMin) is already in the
   manifest, so upgrading later is rendering work only. */

function ArticlesPage() {
  const [theme, toggleTheme] = usePageTheme();
  const [data, setData] = useState({
    loading: true
  });
  useEffect(() => {
    let alive = true;
    window.CCX.loadManifest().then(m => {
      if (alive) setData({
        loading: false,
        articles: m.articles || []
      });
    }).catch(e => {
      if (alive) setData({
        loading: false,
        error: e.message
      });
    });
    return () => {
      alive = false;
    };
  }, []);
  const fmt = iso => iso ? new Date(iso + "T00:00:00Z").toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }) : "";
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(InnerNav, {
    theme: theme,
    onToggleTheme: toggleTheme,
    backHref: "index.html#writing",
    backLabel: "Home"
  }), /*#__PURE__*/React.createElement("main", {
    id: "main",
    className: "wrap cpage"
  }, data.loading && /*#__PURE__*/React.createElement("div", {
    className: "cloading"
  }, /*#__PURE__*/React.createElement("span", {
    className: "spin"
  }), " Loading articles\u2026"), data.error && /*#__PURE__*/React.createElement("div", {
    className: "cerror"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "serif"
  }, "Couldn\u2019t load the index."), /*#__PURE__*/React.createElement("p", {
    className: "mono"
  }, data.error)), data.articles && /*#__PURE__*/React.createElement("div", {
    className: "artl"
  }, /*#__PURE__*/React.createElement("header", {
    className: "artl-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Writing"), /*#__PURE__*/React.createElement("h1", {
    className: "serif"
  }, "Engineering notes from building this."), /*#__PURE__*/React.createElement("p", null, "Postmortems, decision records and methodology \u2014 every piece grown out of the repository's own history, never written to fill space.")), data.articles.map(a => /*#__PURE__*/React.createElement("a", {
    className: "artl-row",
    key: a.slug,
    href: `src/article.html?a=${encodeURIComponent(a.slug)}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "artl-main"
  }, /*#__PURE__*/React.createElement("h3", null, a.title), /*#__PURE__*/React.createElement("p", null, a.summary), /*#__PURE__*/React.createElement("div", {
    className: "artl-tags"
  }, (a.tags || []).map(t => /*#__PURE__*/React.createElement("span", {
    className: "node",
    key: t
  }, t)))), /*#__PURE__*/React.createElement("div", {
    className: "artl-meta mono"
  }, /*#__PURE__*/React.createElement("span", null, fmt(a.date)), /*#__PURE__*/React.createElement("span", null, a.readMin, " min read")))), data.articles.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "pempty mono"
  }, "No articles yet."))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(ArticlesPage, null));
