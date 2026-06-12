/* GENERATED from src/assets/article.jsx by scripts/build-jsx.mjs — edit the .jsx, not this file. */
/* Coding Challenges — technical article reader.
   Reads ?a=<slug>, resolves it against manifest.articles (the listing built by
   src/scripts/build-manifest.mjs from articles/<slug>.md), then fetches the
   real markdown file and renders it with the shared parser in cc-core.js.
   The slug is only ever used after it matches a manifest entry, so the page
   can never be steered to fetch arbitrary paths. */

const FM_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
function fmtDate(iso) {
  return iso ? new Date(iso + "T00:00:00Z").toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }) : "";
}
function ArticlePage() {
  const [theme, toggleTheme] = usePageTheme();
  const slug = window.CCX.qs("a");
  const [data, setData] = useState({
    loading: true
  });
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const manifest = await window.CCX.loadManifest();
        const articles = manifest.articles || [];
        const meta = articles.find(a => a.slug === slug);
        if (!meta) {
          if (alive) setData({
            loading: false,
            articles,
            notFound: true
          });
          return;
        }
        const res = await fetch(`articles/${meta.slug}.md`, {
          cache: "no-cache"
        });
        if (!res.ok) throw new Error("article " + res.status);
        const raw = await res.text();
        const body = raw.replace(FM_RE, "");
        if (alive) {
          setData({
            loading: false,
            meta,
            articles,
            html: window.CCX.parseMarkdown(body)
          });
          document.title = `${meta.title} · Coding Challenges`;
        }
      } catch (e) {
        if (alive) setData({
          loading: false,
          error: e.message
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);
  const others = (data.articles || []).filter(a => !data.meta || a.slug !== data.meta.slug);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(InnerNav, {
    theme: theme,
    onToggleTheme: toggleTheme,
    backHref: "src/articles.html",
    backLabel: "All writing"
  }), /*#__PURE__*/React.createElement("main", {
    id: "main",
    className: "wrap cpage"
  }, data.loading && /*#__PURE__*/React.createElement("div", {
    className: "cloading"
  }, /*#__PURE__*/React.createElement("span", {
    className: "spin"
  }), " Loading article\u2026"), data.error && /*#__PURE__*/React.createElement("div", {
    className: "cerror"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "serif"
  }, "Couldn\u2019t load the article."), /*#__PURE__*/React.createElement("p", {
    className: "mono"
  }, data.error)), data.notFound && /*#__PURE__*/React.createElement("div", {
    className: "cerror"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "serif"
  }, "No such article."), /*#__PURE__*/React.createElement("p", {
    className: "mono"
  }, slug ? `"${slug}" is not in the index.` : "Missing ?a=<slug> parameter.")), data.meta && /*#__PURE__*/React.createElement("article", {
    className: "art"
  }, /*#__PURE__*/React.createElement("header", {
    className: "art-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Technical article"), /*#__PURE__*/React.createElement("h1", {
    className: "serif"
  }, data.meta.title), /*#__PURE__*/React.createElement("div", {
    className: "art-meta mono"
  }, /*#__PURE__*/React.createElement("span", null, fmtDate(data.meta.date)), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, data.meta.readMin, " min read")), data.meta.tags.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "art-tags"
  }, data.meta.tags.map(t => /*#__PURE__*/React.createElement("span", {
    className: "node",
    key: t
  }, t))), data.meta.summary && /*#__PURE__*/React.createElement("p", {
    className: "art-summary"
  }, data.meta.summary)), /*#__PURE__*/React.createElement("div", {
    className: "md art-body",
    dangerouslySetInnerHTML: {
      __html: data.html
    }
  })), !data.loading && others.length > 0 && /*#__PURE__*/React.createElement("aside", {
    className: "art-more"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "mono art-more-t"
  }, "More writing"), others.map(a => /*#__PURE__*/React.createElement("a", {
    className: "art-row",
    key: a.slug,
    href: `src/article.html?a=${encodeURIComponent(a.slug)}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "art-row-title"
  }, a.title), /*#__PURE__*/React.createElement("span", {
    className: "art-row-meta mono"
  }, fmtDate(a.date), " \xB7 ", a.readMin, " min"))))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(ArticlePage, null));
