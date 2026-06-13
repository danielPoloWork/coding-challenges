/* GENERATED from src/assets/challenge.jsx by scripts/build-jsx.mjs — edit the .jsx, not this file. */
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Coding Challenges — dynamic challenge viewer.
   Reads ?path=platforms/<platform>/<ext>/<id>-<slug> and fetches the REAL files
   in that folder (metadata.json, notes.md, complexity.md, solution*.<ext>). */

/* markdown -> html lives in cc-core.js (shared with the article page) */
const {
  parseMarkdown,
  escapeHtml
} = window.CCX;
const ROLE_LABEL = {
  "recommended-balanced": "Recommended",
  "recommended": "Recommended",
  "fastest-runtime": "Speed extreme",
  "runtime": "Speed extreme",
  "least-memory": "Memory extreme",
  "memory": "Memory extreme"
};
const roleLabel = r => ROLE_LABEL[r] || (r || "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

/* a file/text is "missing" if it never loaded or holds nothing but whitespace */
const isBlank = s => !s || !String(s).trim();

/* Emphatic placeholder shown by any file-backed tab when its source is absent.
   Keeps the tab clickable (and the workspace intact) instead of rendering blank. */
function EmptyState({
  icon = "file",
  kicker,
  title,
  message,
  compact
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "cempty" + (compact ? " cempty-compact" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "cempty-mark"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: compact ? 20 : 24
  })), kicker && /*#__PURE__*/React.createElement("div", {
    className: "cempty-kick"
  }, kicker), /*#__PURE__*/React.createElement("h3", {
    className: "cempty-title serif"
  }, title), message && /*#__PURE__*/React.createElement("p", {
    className: "cempty-msg"
  }, message));
}

/* Catches render errors from a tab (e.g. malformed/missing metadata fields) and
   shows a message instead of letting the exception blank the whole page. Keyed by
   the active view so switching tabs always retries with a clean slate. */
class ViewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      error
    };
  }
  componentDidCatch(error, info) {
    console.error("Challenge view failed to render:", error, info);
  }
  render() {
    if (this.state.error) {
      return /*#__PURE__*/React.createElement("div", {
        className: "cview-panel"
      }, /*#__PURE__*/React.createElement(EmptyState, {
        kicker: "couldn\u2019t render",
        title: "This content couldn\u2019t be displayed.",
        message: /*#__PURE__*/React.createElement(React.Fragment, null, "Some data for this challenge is missing or malformed in the repository, so it couldn\u2019t be rendered. ", /*#__PURE__*/React.createElement("span", {
          className: "mono"
        }, String(this.state.error && this.state.error.message || this.state.error)))
      }));
    }
    return this.props.children;
  }
}

/* ---------- syntax highlighting (highlight.js, themed via .sol-code .hljs-* in CSS) ---------- */
const HLJS_LANG = {
  "C++": "cpp",
  "C": "c",
  "C#": "csharp",
  "Python": "python",
  "Python3": "python",
  "JavaScript": "javascript",
  "TypeScript": "typescript",
  "Java": "java",
  "Go": "go",
  "Rust": "rust",
  "Kotlin": "kotlin",
  "Swift": "swift",
  "Ruby": "ruby",
  "PHP": "php",
  "Scala": "scala",
  "Dart": "dart",
  "Elixir": "elixir",
  "Erlang": "erlang",
  "Racket": "scheme"
};

/* highlight.js emits a flat run of <span class="hljs-…">…</span> that may
   straddle newlines (block comments, multiline strings). Split into one HTML
   string per source line, re-opening any spans left open so each line stands
   alone — that keeps the per-line .ln gutter intact. */
function splitHighlightedLines(html) {
  const out = [];
  const open = [];
  const tagRe = /<span[^>]*>|<\/span>/g;
  for (const line of html.split("\n")) {
    const prefix = open.join("");
    let m;
    tagRe.lastIndex = 0;
    while (m = tagRe.exec(line)) {
      if (m[0] === "</span>") open.pop();else open.push(m[0]);
    }
    out.push(prefix + line + "</span>".repeat(open.length));
  }
  return out;
}
function highlightLines(code, language) {
  const src = (code || "").replace(/\s+$/, "");
  const hl = window.hljs;
  let html;
  if (hl) {
    const id = HLJS_LANG[language];
    try {
      html = id && hl.getLanguage(id) ? hl.highlight(src, {
        language: id,
        ignoreIllegals: true
      }).value : hl.highlightAuto(src).value;
    } catch (e) {
      html = escapeHtml(src);
    }
  } else {
    html = escapeHtml(src);
  }
  return splitHighlightedLines(html);
}
function CodeBlock({
  code,
  language
}) {
  const lines = useMemo(() => highlightLines(code, language), [code, language]);
  return /*#__PURE__*/React.createElement("pre", {
    className: "sol-code"
  }, /*#__PURE__*/React.createElement("code", {
    className: "hljs"
  }, lines.map((ln, i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "ln"
  }, i + 1), /*#__PURE__*/React.createElement("span", {
    dangerouslySetInnerHTML: {
      __html: ln || " "
    }
  })))));
}

/* Load one language folder into a render bundle: metadata + notes + complexity
   + each variant's source. Returns { error } on failure instead of throwing. */
async function loadBundle(base) {
  try {
    const meta = await fetch(`${base}/metadata.json`, {
      cache: "no-cache"
    }).then(r => {
      if (!r.ok) throw new Error("metadata " + r.status);
      return r.json();
    });
    const [notes, complexity] = await Promise.all([fetch(`${base}/notes.md`).then(r => r.ok ? r.text() : ""), fetch(`${base}/complexity.md`).then(r => r.ok ? r.text() : "")]);
    const variants = await Promise.all((meta.variants || []).map(async v => {
      const code = await fetch(`${base}/${v.file}`).then(r => r.ok ? r.text() : null);
      return {
        ...v,
        code
      };
    }));
    return {
      meta,
      notes,
      complexity,
      variants,
      base
    };
  } catch (e) {
    return {
      error: e.message
    };
  }
}

/* The languages a challenge is solved in: the entry folder + every sibling
   language declared in its crossReferences, each with its own folder path. */
function languagesFromMeta(meta, base) {
  const list = [{
    language: meta.language,
    path: base
  }];
  (meta.crossReferences || []).forEach(x => {
    if (x && typeof x === "object" && x.path && x.language && !list.some(l => l.language === x.language)) {
      list.push({
        language: x.language,
        path: String(x.path).replace(/\/$/, "")
      });
    }
  });
  return list;
}
function ChallengePage() {
  const [theme, toggleTheme] = usePageTheme();
  const path = window.CCX.qs("path");
  const [langs, setLangs] = useState(null); // [{ language, path }]
  const [sel, setSel] = useState(null); // selected folder path
  const [bundles, setBundles] = useState({}); // path -> bundle | { error }
  const [error, setError] = useState(null);
  const [active, setActive] = useState(0);

  // discover the challenge's languages from the entry folder, then prefetch the
  // siblings so switching language is instant
  useEffect(() => {
    let alive = true;
    if (!path) {
      setError("No challenge path provided.");
      return;
    }
    const base = path.replace(/\/$/, "");
    loadBundle(base).then(b => {
      if (!alive) return;
      if (b.error) {
        setError(b.error);
        return;
      }
      const list = languagesFromMeta(b.meta, base);
      setLangs(list);
      setBundles({
        [base]: b
      });
      setSel(base);
      list.filter(l => l.path !== base).forEach(l => {
        loadBundle(l.path).then(sb => {
          if (alive) setBundles(prev => prev[l.path] ? prev : {
            ...prev,
            [l.path]: sb
          });
        });
      });
    });
    return () => {
      alive = false;
    };
  }, [path]);

  // safety net: load a language on demand if it wasn't prefetched
  useEffect(() => {
    if (!sel || bundles[sel]) return;
    let alive = true;
    loadBundle(sel).then(b => {
      if (alive) setBundles(prev => ({
        ...prev,
        [sel]: b
      }));
    });
    return () => {
      alive = false;
    };
  }, [sel]);
  const selectLang = p => {
    if (p !== sel) {
      setActive(0);
      setSel(p);
    }
  };
  const bundle = sel ? bundles[sel] : null;

  // keep the tab/bookmark/history title in sync with the loaded challenge
  useEffect(() => {
    if (bundle && bundle.meta && bundle.meta.title) document.title = `${bundle.meta.title} · Coding Challenges`;
  }, [bundle]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(InnerNav, {
    theme: theme,
    onToggleTheme: toggleTheme,
    backHref: "index.html",
    backLabel: "Home"
  }), /*#__PURE__*/React.createElement("main", {
    id: "main",
    className: "wrap cpage"
  }, !error && !bundle && /*#__PURE__*/React.createElement("div", {
    className: "cloading"
  }, /*#__PURE__*/React.createElement("span", {
    className: "spin"
  }), " Loading solution files\u2026"), error && /*#__PURE__*/React.createElement("div", {
    className: "cerror"
  }, /*#__PURE__*/React.createElement("div", {
    className: "csection-label"
  }, "could not load"), /*#__PURE__*/React.createElement("h2", {
    className: "serif",
    style: {
      fontSize: 30,
      marginBottom: 10
    }
  }, "This challenge isn\u2019t in the repository yet."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--ink-2)",
      maxWidth: 560
    }
  }, "The viewer reads real files from ", /*#__PURE__*/React.createElement("code", {
    className: "mono"
  }, path || "—"), ". Add the folder (with ", /*#__PURE__*/React.createElement("code", {
    className: "mono"
  }, "metadata.json"), ", ", /*#__PURE__*/React.createElement("code", {
    className: "mono"
  }, "notes.md"), ",", /*#__PURE__*/React.createElement("code", {
    className: "mono"
  }, " complexity.md"), " and the solution sources) and regenerate", /*#__PURE__*/React.createElement("code", {
    className: "mono"
  }, " manifest.json"), " \u2014 it will render automatically."), /*#__PURE__*/React.createElement("p", {
    className: "mono",
    style: {
      color: "var(--ink-3)",
      fontSize: 12.5,
      marginTop: 14
    }
  }, "error: ", error), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-ghost",
    href: "index.html",
    style: {
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 15
  }), " Back home")), bundle && bundle.error && /*#__PURE__*/React.createElement("div", {
    className: "cerror"
  }, /*#__PURE__*/React.createElement("div", {
    className: "csection-label"
  }, "could not load"), /*#__PURE__*/React.createElement("h2", {
    className: "serif",
    style: {
      fontSize: 26
    }
  }, "Couldn\u2019t load this language."), /*#__PURE__*/React.createElement("p", {
    className: "mono",
    style: {
      color: "var(--ink-3)",
      fontSize: 12.5,
      marginTop: 12
    }
  }, "error: ", bundle.error)), bundle && !bundle.error && /*#__PURE__*/React.createElement(ViewErrorBoundary, {
    key: sel
  }, /*#__PURE__*/React.createElement(ChallengeBody, _extends({}, bundle, {
    theme: theme,
    active: active,
    setActive: setActive,
    langs: langs,
    sel: sel,
    onSelectLang: selectLang
  })))));
}

/* split notes.md into navigable sections (one per H2), keeping any preamble as an intro */
function splitNotesSections(md) {
  const lines = (md || "").replace(/\r/g, "").split("\n");
  const sections = [];
  let cur = null;
  for (const line of lines) {
    if (/^#\s+/.test(line)) continue; // drop the repeated H1 title
    const m = /^##\s+(.+)/.exec(line);
    if (m) {
      cur = {
        title: m[1].trim(),
        lines: []
      };
      sections.push(cur);
    } else {
      if (!cur) {
        cur = {
          title: "Overview",
          lines: []
        };
        sections.push(cur);
      }
      cur.lines.push(line);
    }
  }
  return sections.filter(s => s.lines.join("").trim()).map(s => ({
    title: s.title,
    html: parseMarkdown(s.lines.join("\n").trim())
  }));
}
function ViewTabs({
  views,
  view,
  setView
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "cviews",
    role: "tablist"
  }, views.map(vw => /*#__PURE__*/React.createElement("button", {
    key: vw.id,
    role: "tab",
    className: "cview-tab" + (view === vw.id ? " active" : ""),
    onClick: () => setView(vw.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "cview-dot"
  }), vw.label, vw.n != null && /*#__PURE__*/React.createElement("span", {
    className: "cview-n"
  }, vw.n))));
}
function SolutionView({
  meta,
  variants,
  active,
  setActive
}) {
  if (!variants.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "cview-panel"
    }, /*#__PURE__*/React.createElement(EmptyState, {
      kicker: "no solution files",
      title: "No solutions in the repository yet.",
      message: /*#__PURE__*/React.createElement(React.Fragment, null, "This challenge\u2019s ", /*#__PURE__*/React.createElement("code", {
        className: "mono"
      }, "metadata.json"), " declares no proposals. Add the solution sources and regenerate the manifest \u2014 they\u2019ll appear here automatically.")
    }));
  }
  const v = variants[active] || variants[0] || {};
  return /*#__PURE__*/React.createElement("div", {
    className: "cview-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sol cviewer code-full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sol-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sol-dots"
  }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("span", {
    className: "sol-path"
  }, "\u2026/", meta.id, "-", meta.slug, "/", /*#__PURE__*/React.createElement("b", null, v.file)), /*#__PURE__*/React.createElement("span", {
    className: "sol-badge"
  }, roleLabel(v.role))), /*#__PURE__*/React.createElement("div", {
    className: "sol-tabs",
    role: "tablist"
  }, variants.map((pr, idx) => /*#__PURE__*/React.createElement("div", {
    key: pr.file,
    role: "tab",
    className: "sol-tab" + (idx === active ? " active" : ""),
    onClick: () => setActive(idx)
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: window.CCX.langColor(pr.language)
    }
  }), pr.file))), /*#__PURE__*/React.createElement("div", {
    className: "sol-body"
  }, isBlank(v.code) ? /*#__PURE__*/React.createElement(EmptyState, {
    compact: true,
    kicker: "file not found",
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Couldn\u2019t load ", /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, v.file)),
    message: /*#__PURE__*/React.createElement(React.Fragment, null, "This proposal is listed in ", /*#__PURE__*/React.createElement("code", {
      className: "mono"
    }, "metadata.json"), ", but its source file is missing from the challenge folder.")
  }) : /*#__PURE__*/React.createElement(CodeBlock, {
    code: v.code,
    language: v.language
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sol-rationale"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vrat-cx"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cx-row"
  }, /*#__PURE__*/React.createElement("span", null, "Time"), /*#__PURE__*/React.createElement("b", null, v.timeComplexity || "—")), /*#__PURE__*/React.createElement("div", {
    className: "cx-row"
  }, /*#__PURE__*/React.createElement("span", null, "Space"), /*#__PURE__*/React.createElement("b", null, v.spaceComplexity || "—")), /*#__PURE__*/React.createElement("div", {
    className: "cx-row"
  }, /*#__PURE__*/React.createElement("span", null, "Role"), /*#__PURE__*/React.createElement("b", null, roleLabel(v.role)))), /*#__PURE__*/React.createElement("div", {
    className: "sol-reason"
  }, v.languageReason && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Why ", v.language), /*#__PURE__*/React.createElement("p", null, v.languageReason)), v.approachJustification && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Approach"), /*#__PURE__*/React.createElement("p", null, v.approachJustification)))));
}
function NotesView({
  notes
}) {
  const sections = useMemo(() => splitNotesSections(notes), [notes]);
  const [page, setPage] = useState(0);
  const total = sections.length;
  const go = n => setPage(p => Math.max(0, Math.min(total - 1, n)));
  useEffect(() => {
    const onKey = e => {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") go(page + 1);
      if (e.key === "ArrowLeft") go(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, total]);
  if (!total) return /*#__PURE__*/React.createElement("div", {
    className: "cview-panel"
  }, /*#__PURE__*/React.createElement(EmptyState, {
    kicker: "notes.md missing",
    title: "No write-up for this challenge yet.",
    message: /*#__PURE__*/React.createElement(React.Fragment, null, "There\u2019s no ", /*#__PURE__*/React.createElement("code", {
      className: "mono"
    }, "notes.md"), " (or it\u2019s empty) in this folder. Add one and it\u2019ll render here as a paginated reader.")
  }));
  const cur = sections[page];
  return /*#__PURE__*/React.createElement("div", {
    className: "cview-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "notes-reader"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "notes-toc"
  }, /*#__PURE__*/React.createElement("div", {
    className: "notes-toc-label"
  }, "Contents"), /*#__PURE__*/React.createElement("ol", null, sections.map((s, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement("button", {
    className: i === page ? "active" : "",
    onClick: () => go(i)
  }, /*#__PURE__*/React.createElement("span", {
    className: "n"
  }, String(i + 1).padStart(2, "0")), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, s.title)))))), /*#__PURE__*/React.createElement("div", {
    className: "notes-stage"
  }, /*#__PURE__*/React.createElement("article", {
    className: "notes-page",
    key: page
  }, /*#__PURE__*/React.createElement("div", {
    className: "notes-page-kick"
  }, /*#__PURE__*/React.createElement("span", null, String(page + 1).padStart(2, "0"), " / ", String(total).padStart(2, "0")), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }), /*#__PURE__*/React.createElement("span", null, "notes.md")), /*#__PURE__*/React.createElement("h2", {
    className: "notes-page-title serif"
  }, cur.title), /*#__PURE__*/React.createElement("div", {
    className: "md",
    dangerouslySetInnerHTML: {
      __html: cur.html
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "notes-pager"
  }, /*#__PURE__*/React.createElement("button", {
    className: "np-btn",
    disabled: page === 0,
    onClick: () => go(page - 1)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 15
  }), " ", /*#__PURE__*/React.createElement("span", null, page > 0 ? sections[page - 1].title : "Start")), /*#__PURE__*/React.createElement("div", {
    className: "np-dots"
  }, sections.map((_, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: "np-dot" + (i === page ? " active" : ""),
    onClick: () => go(i),
    "aria-label": `Page ${i + 1}`
  }))), /*#__PURE__*/React.createElement("button", {
    className: "np-btn np-next",
    disabled: page === total - 1,
    onClick: () => go(page + 1)
  }, /*#__PURE__*/React.createElement("span", null, page < total - 1 ? sections[page + 1].title : "End"), " ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 15
  }))))));
}
function ComplexityView({
  complexity,
  variants
}) {
  if (isBlank(complexity) && !variants.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "cview-panel"
    }, /*#__PURE__*/React.createElement(EmptyState, {
      kicker: "complexity.md missing",
      title: "No complexity analysis yet.",
      message: /*#__PURE__*/React.createElement(React.Fragment, null, "This challenge has no ", /*#__PURE__*/React.createElement("code", {
        className: "mono"
      }, "complexity.md"), " and no proposals to compare. Add the file and regenerate the manifest to see the breakdown here.")
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "cview-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cgrid2"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "csection-label"
  }, "comparison"), variants.length ? /*#__PURE__*/React.createElement("div", {
    className: "cxfacets"
  }, variants.map((pr, idx) => /*#__PURE__*/React.createElement("div", {
    className: "cxproposal" + (idx % 2 ? " alt" : ""),
    key: pr.file
  }, /*#__PURE__*/React.createElement("div", {
    className: "cxfacet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cxfacet-label"
  }, "Proposal"), /*#__PURE__*/React.createElement("div", {
    className: "cxfacet-val"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cxfacet-item nm"
  }, /*#__PURE__*/React.createElement("span", {
    className: "d",
    style: {
      background: window.CCX.langColor(pr.language)
    }
  }), pr.file))), /*#__PURE__*/React.createElement("div", {
    className: "cxfacet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cxfacet-label"
  }, "Time"), /*#__PURE__*/React.createElement("div", {
    className: "cxfacet-val"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cxfacet-item cx"
  }, pr.timeComplexity || "—"))), /*#__PURE__*/React.createElement("div", {
    className: "cxfacet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cxfacet-label"
  }, "Space"), /*#__PURE__*/React.createElement("div", {
    className: "cxfacet-val"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cxfacet-item cx"
  }, pr.spaceComplexity || "—"))), /*#__PURE__*/React.createElement("div", {
    className: "cxfacet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cxfacet-label"
  }, "Goal"), /*#__PURE__*/React.createElement("div", {
    className: "cxfacet-val"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cxfacet-item gl"
  }, roleLabel(pr.role))))))) : /*#__PURE__*/React.createElement(EmptyState, {
    compact: true,
    kicker: "no proposals",
    title: "Nothing to compare.",
    message: "No solution files are listed for this challenge."
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "csection-label"
  }, "complexity.md"), isBlank(complexity) ? /*#__PURE__*/React.createElement(EmptyState, {
    compact: true,
    kicker: "complexity.md missing",
    title: "No write-up yet.",
    message: /*#__PURE__*/React.createElement(React.Fragment, null, "Add a ", /*#__PURE__*/React.createElement("code", {
      className: "mono"
    }, "complexity.md"), " to walk through the trade-offs here.")
  }) : /*#__PURE__*/React.createElement("div", {
    className: "md md-compact",
    dangerouslySetInnerHTML: {
      __html: parseMarkdown(complexity)
    }
  }))));
}

/* cross-references may be plain strings (legacy) or rich objects pointing at a
   sibling solution: { role, language, path, file, timeComplexity, spaceComplexity } */
function normXref(x) {
  if (typeof x === "string") return {
    label: x
  };
  if (x && typeof x === "object") {
    return {
      label: x.file || x.path || roleLabel(x.role) || "reference",
      lang: x.language,
      role: x.role,
      time: x.timeComplexity,
      space: x.spaceComplexity,
      href: x.path ? `src/challenge.html?path=${x.path}` : null
    };
  }
  return {
    label: String(x)
  };
}
function ReasoningView({
  meta
}) {
  const xrefs = (meta.crossReferences || []).filter(Boolean);
  const patterns = (meta.patterns || []).filter(Boolean);
  if (isBlank(meta.reasoningSummary) && !xrefs.length && !patterns.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "cview-panel"
    }, /*#__PURE__*/React.createElement(EmptyState, {
      kicker: "reasoning missing",
      title: "No reasoning recorded yet.",
      message: /*#__PURE__*/React.createElement(React.Fragment, null, "This challenge\u2019s ", /*#__PURE__*/React.createElement("code", {
        className: "mono"
      }, "metadata.json"), " has no reasoning summary, cross-references, or patterns to show here.")
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "cview-panel"
  }, !isBlank(meta.reasoningSummary) && /*#__PURE__*/React.createElement("div", {
    className: "reason-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "csection-label"
  }, "reasoning summary"), /*#__PURE__*/React.createElement("p", {
    className: "serif"
  }, meta.reasoningSummary)), !!xrefs.length && /*#__PURE__*/React.createElement("div", {
    className: "cblock",
    style: {
      marginTop: isBlank(meta.reasoningSummary) ? 0 : 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "csection-label"
  }, "cross-references"), /*#__PURE__*/React.createElement("div", {
    className: "xref-grid"
  }, xrefs.map((x, i) => {
    const r = normXref(x);
    const Tag = r.href ? "a" : "div";
    return /*#__PURE__*/React.createElement(Tag, _extends({
      key: i,
      className: "xref"
    }, r.href ? {
      href: r.href
    } : {}), /*#__PURE__*/React.createElement("div", {
      className: "xref-top"
    }, r.lang && /*#__PURE__*/React.createElement("span", {
      className: "d",
      style: {
        background: window.CCX.langColor(r.lang)
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "xref-file mono"
    }, r.label), r.role && /*#__PURE__*/React.createElement("span", {
      className: "xref-role"
    }, roleLabel(r.role))), (r.time || r.space) && /*#__PURE__*/React.createElement("div", {
      className: "xref-cx"
    }, r.time && /*#__PURE__*/React.createElement("span", null, "Time ", /*#__PURE__*/React.createElement("b", null, r.time)), r.space && /*#__PURE__*/React.createElement("span", null, "Space ", /*#__PURE__*/React.createElement("b", null, r.space))));
  }))), !!patterns.length && /*#__PURE__*/React.createElement("div", {
    className: "cblock",
    style: {
      marginTop: isBlank(meta.reasoningSummary) && !xrefs.length ? 0 : 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "csection-label"
  }, "patterns"), /*#__PURE__*/React.createElement("div", {
    className: "pat-cloud"
  }, patterns.map(p => /*#__PURE__*/React.createElement("span", {
    className: "pat",
    key: p
  }, p)))));
}

/* ---------- DISCUSS (giscus: one thread per challenge, themed to the site) ---------- */
const GISCUS = {
  repo: "danielPoloWork/coding-challenges",
  repoId: "R_kgDOSuTg7Q",
  category: "Comments",
  categoryId: "DIC_kwDOSuTg7c4C-oTd"
};
/* On the deployed HTTPS origin, point giscus at our clay-tinted theme CSS
   (src/assets/giscus-<mode>.css). giscus can't fetch a localhost URL, so local
   preview falls back to the built-in noborder_* presets (same no-border look). */
const giscusLocal = ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(location.hostname) || location.protocol === "file:";
const giscusTheme = t => {
  const mode = t === "dark" ? "dark" : "light";
  return giscusLocal ? `noborder_${mode}` : new URL(`src/assets/giscus-${mode}.css`, document.baseURI).href;
};
function DiscussView({
  meta,
  theme
}) {
  const ref = useRef(null);
  // one thread per challenge AND language (each language has its own write-up)
  const term = `${meta.platform}/${meta.id}-${meta.slug}/${meta.languageExt || meta.language}`;

  /* giscus is a <script> that injects an iframe, so append it to our ref rather
     than render it as JSX. Rebuild only when the challenge (term) changes. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";
    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    Object.entries({
      "data-repo": GISCUS.repo,
      "data-repo-id": GISCUS.repoId,
      "data-category": GISCUS.category,
      "data-category-id": GISCUS.categoryId,
      "data-mapping": "specific",
      "data-term": term,
      "data-strict": "0",
      "data-reactions-enabled": "0",
      "data-emit-metadata": "0",
      "data-input-position": "top",
      "data-theme": giscusTheme(theme),
      "data-lang": "en"
    }).forEach(([k, v]) => s.setAttribute(k, v));
    el.appendChild(s);
    return () => {
      el.innerHTML = "";
    };
    // theme deliberately excluded — toggling is handled live below, without reload
  }, [term]);

  /* Live theme switch: message the loaded iframe instead of rebuilding it. */
  useEffect(() => {
    const frame = ref.current && ref.current.querySelector("iframe.giscus-frame");
    if (!frame) return;
    frame.contentWindow.postMessage({
      giscus: {
        setConfig: {
          theme: giscusTheme(theme)
        }
      }
    }, "https://giscus.app");
  }, [theme]);
  return /*#__PURE__*/React.createElement("div", {
    className: "cview-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "discuss"
  }, /*#__PURE__*/React.createElement("div", {
    className: "csection-label"
  }, "discussion"), /*#__PURE__*/React.createElement("div", {
    className: "discuss-mount",
    ref: ref
  }), /*#__PURE__*/React.createElement("p", {
    className: "discuss-foot"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "github",
    size: 13
  }), " Sign in with GitHub to comment \xB7 powered by GitHub Discussions")));
}
function ChallengeBody({
  meta,
  notes,
  complexity,
  variants,
  active,
  setActive,
  theme,
  langs,
  sel,
  onSelectLang
}) {
  const diff = meta.difficulty || "—";
  const [view, setView] = useState("solution");
  const hasReasoning = !!(meta.reasoningSummary || meta.crossReferences && meta.crossReferences.length || meta.patterns && meta.patterns.length);
  const views = [{
    id: "solution",
    label: "Solution",
    n: variants.length
  }, {
    id: "notes",
    label: "Notes"
  }, {
    id: "complexity",
    label: "Complexity"
  }];
  if (hasReasoning) views.push({
    id: "reasoning",
    label: "Reasoning"
  });
  views.push({
    id: "discuss",
    label: "Discuss"
  });
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "crumb"
  }, /*#__PURE__*/React.createElement("a", {
    href: "index.html"
  }, "platforms"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "/"), /*#__PURE__*/React.createElement("a", {
    href: `src/platform.html?platform=${meta.platform}`
  }, meta.platform), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "/"), /*#__PURE__*/React.createElement("b", null, meta.id, "-", meta.slug)), /*#__PURE__*/React.createElement("div", {
    className: "chead"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cid-pill"
  }, "#", meta.id), /*#__PURE__*/React.createElement("h1", null, meta.title), /*#__PURE__*/React.createElement("div", {
    className: "cmeta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip solid",
    style: {
      background: window.CCX.diffColor(diff)
    }
  }, diff), /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "d",
    style: {
      background: window.CCX.langColor(meta.language)
    }
  }), meta.language), (meta.topics || []).map(tp => /*#__PURE__*/React.createElement("span", {
    className: "chip",
    key: tp
  }, tp)), (meta.patterns || []).map(p => /*#__PURE__*/React.createElement("span", {
    className: "chip",
    key: p
  }, /*#__PURE__*/React.createElement("span", {
    className: "d",
    style: {
      background: "var(--clay)"
    }
  }), p)), meta.url && /*#__PURE__*/React.createElement("a", {
    className: "chip",
    href: meta.url,
    target: "_blank",
    rel: "noopener",
    style: {
      color: "var(--clay)"
    }
  }, "source ", /*#__PURE__*/React.createElement(Icon, {
    name: "external",
    size: 13
  }))), meta.note && /*#__PURE__*/React.createElement("p", {
    className: "cnote"
  }, meta.note)), langs && langs.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "clang-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "clang-label mono"
  }, "Language"), /*#__PURE__*/React.createElement("div", {
    className: "clang-tabs"
  }, langs.map(l => /*#__PURE__*/React.createElement("button", {
    key: l.path,
    className: "clang-tab" + (l.path === sel ? " active" : ""),
    onClick: () => onSelectLang(l.path)
  }, /*#__PURE__*/React.createElement("span", {
    className: "d",
    style: {
      background: window.CCX.langColor(l.language)
    }
  }), l.language)))), /*#__PURE__*/React.createElement(ViewTabs, {
    views: views,
    view: view,
    setView: setView
  }), /*#__PURE__*/React.createElement(ViewErrorBoundary, {
    key: view
  }, view === "solution" && /*#__PURE__*/React.createElement(SolutionView, {
    meta: meta,
    variants: variants,
    active: active,
    setActive: setActive
  }), view === "notes" && /*#__PURE__*/React.createElement(NotesView, {
    notes: notes
  }), view === "complexity" && /*#__PURE__*/React.createElement(ComplexityView, {
    complexity: complexity,
    variants: variants
  }), view === "reasoning" && hasReasoning && /*#__PURE__*/React.createElement(ReasoningView, {
    meta: meta
  }), view === "discuss" && /*#__PURE__*/React.createElement(DiscussView, {
    meta: meta,
    theme: theme
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(ChallengePage, null));
