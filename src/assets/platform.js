/* GENERATED from src/assets/platform.jsx by scripts/build-jsx.mjs — edit the .jsx, not this file. */
/* Coding Challenges — platform index: sortable / filterable / searchable list.
   Reads ?platform=<id>, loads manifest, shows that platform's solutions. */

function naturalCmp(a, b) {
  const an = /^\d+$/.test(a),
    bn = /^\d+$/.test(b);
  if (an && bn) return parseInt(a, 10) - parseInt(b, 10);
  return String(a).localeCompare(String(b));
}
const SORTS = {
  id: {
    label: "ID",
    get: c => c.id,
    cmp: (a, b) => naturalCmp(a.id, b.id)
  },
  title: {
    label: "Title",
    get: c => c.title,
    cmp: (a, b) => a.title.localeCompare(b.title)
  },
  difficulty: {
    label: "Difficulty",
    get: c => c.difficulty,
    cmp: (a, b) => window.CCX.diffRank(a.difficulty) - window.CCX.diffRank(b.difficulty) || naturalCmp(a.id, b.id)
  },
  type: {
    label: "Topics",
    get: c => (c.topics || [])[0] || "",
    cmp: (a, b) => ((a.topics || [])[0] || "").localeCompare((b.topics || [])[0] || "")
  },
  language: {
    label: "Language",
    get: c => c.language,
    cmp: (a, b) => a.language.localeCompare(b.language) || naturalCmp(a.id, b.id)
  }
};
function PlatformPage() {
  const [theme, toggleTheme] = usePageTheme();
  const pid = window.CCX.qs("platform") || "leetcode";
  const [data, setData] = useState({
    loading: true
  });
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [dir, setDir] = useState(1); // 1 asc, -1 desc
  const [diffFilter, setDiff] = useState("All");
  const [langFilter, setLang] = useState("All");
  useEffect(() => {
    let alive = true;
    window.CCX.loadManifest().then(m => {
      if (alive) setData({
        loading: false,
        manifest: m
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
  const meta = data.manifest ? window.CCX.platformMeta(data.manifest, pid) : null;

  // keep the tab/bookmark/history title in sync with the loaded platform
  useEffect(() => {
    if (meta) document.title = `${meta.name} · Coding Challenges`;
  }, [meta]);
  const all = useMemo(() => data.manifest ? data.manifest.challenges.filter(c => c.platform === pid) : [], [data, pid]);
  const langsOf = c => c.languages || [c.language];
  const langs = useMemo(() => [...new Set(all.flatMap(langsOf))].sort(), [all]);

  // aggregate breakdowns straight from this platform's index entries
  const stats = useMemo(() => {
    const diff = {
      Easy: 0,
      Medium: 0,
      Hard: 0
    };
    const langMap = {},
      topMap = {};
    all.forEach(c => {
      if (c.difficulty in diff) diff[c.difficulty]++;
      langsOf(c).forEach(l => {
        langMap[l] = (langMap[l] || 0) + 1;
      });
      (c.topics || []).forEach(t => {
        topMap[t] = (topMap[t] || 0) + 1;
      });
    });
    return {
      diff,
      langArr: Object.entries(langMap).sort((a, b) => b[1] - a[1]),
      topArr: Object.entries(topMap).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    };
  }, [all]);
  const rows = useMemo(() => {
    let r = all;
    if (diffFilter !== "All") r = r.filter(c => c.difficulty === diffFilter);
    if (langFilter !== "All") r = r.filter(c => langsOf(c).includes(langFilter));
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      r = r.filter(c => c.title.toLowerCase().includes(needle) || String(c.id).toLowerCase().includes(needle) || c.language.toLowerCase().includes(needle) || (c.topics || []).some(t => t.toLowerCase().includes(needle)) || (c.patterns || []).some(t => t.toLowerCase().includes(needle)));
    }
    const cmp = SORTS[sortKey].cmp;
    r = [...r].sort((a, b) => cmp(a, b) * dir);
    return r;
  }, [all, q, sortKey, dir, diffFilter, langFilter]);
  const clickSort = k => {
    if (k === sortKey) setDir(d => -d);else {
      setSortKey(k);
      setDir(1);
    }
  };
  const Th = ({
    k,
    children,
    cls
  }) => /*#__PURE__*/React.createElement("button", {
    className: "th " + (cls || "") + (sortKey === k ? " active" : ""),
    onClick: () => clickSort(k)
  }, children, /*#__PURE__*/React.createElement("span", {
    className: "th-caret",
    style: {
      opacity: sortKey === k ? 1 : 0.25,
      transform: sortKey === k && dir < 0 ? "rotate(180deg)" : "none"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "caret",
    size: 14
  })));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(InnerNav, {
    theme: theme,
    onToggleTheme: toggleTheme,
    backHref: "index.html#platforms",
    backLabel: "All platforms"
  }), /*#__PURE__*/React.createElement("main", {
    id: "main",
    className: "wrap cpage"
  }, data.loading && /*#__PURE__*/React.createElement("div", {
    className: "cloading"
  }, /*#__PURE__*/React.createElement("span", {
    className: "spin"
  }), " Loading index\u2026"), !data.loading && !meta && /*#__PURE__*/React.createElement("div", {
    className: "cerror"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "serif"
  }, "Unknown platform \u201C", pid, "\u201D."), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-ghost",
    href: "index.html#platforms",
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 15
  }), " Browse platforms")), !data.loading && meta && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "crumb"
  }, /*#__PURE__*/React.createElement("a", {
    href: "index.html"
  }, "home"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "/"), /*#__PURE__*/React.createElement("a", {
    href: "index.html#platforms"
  }, "platforms"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "/"), /*#__PURE__*/React.createElement("b", null, meta.id)), /*#__PURE__*/React.createElement("div", {
    className: "phead"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pcard-icon phead-icon",
    style: {
      background: meta.color
    }
  }, meta.abbr), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "serif"
  }, meta.name), /*#__PURE__*/React.createElement("p", null, meta.desc)), /*#__PURE__*/React.createElement("div", {
    className: "phead-count"
  }, /*#__PURE__*/React.createElement("div", {
    className: "serif n"
  }, all.length), /*#__PURE__*/React.createElement("div", {
    className: "l mono"
  }, "solved"))), all.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "pstats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pstat-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pstat-h mono"
  }, "By difficulty"), /*#__PURE__*/React.createElement("div", {
    className: "pstat-bar"
  }, ["Easy", "Medium", "Hard"].map(d => stats.diff[d] ? /*#__PURE__*/React.createElement("span", {
    key: d,
    style: {
      flex: stats.diff[d],
      background: window.CCX.diffColor(d)
    },
    title: `${d} · ${stats.diff[d]}`
  }) : null)), /*#__PURE__*/React.createElement("div", {
    className: "pstat-legend"
  }, ["Easy", "Medium", "Hard"].map(d => /*#__PURE__*/React.createElement("span", {
    className: "pstat-leg",
    key: d
  }, /*#__PURE__*/React.createElement("span", {
    className: "ddot",
    style: {
      background: window.CCX.diffColor(d)
    }
  }), d, " ", /*#__PURE__*/React.createElement("b", null, stats.diff[d]))))), /*#__PURE__*/React.createElement("div", {
    className: "pstat-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pstat-h mono"
  }, "By language"), /*#__PURE__*/React.createElement("div", {
    className: "pstat-chips"
  }, stats.langArr.map(([l, n]) => /*#__PURE__*/React.createElement("span", {
    className: "pchip",
    key: l
  }, /*#__PURE__*/React.createElement("span", {
    className: "ldot",
    style: {
      background: window.CCX.langColor(l)
    }
  }), l, " ", /*#__PURE__*/React.createElement("b", null, n))))), /*#__PURE__*/React.createElement("div", {
    className: "pstat-col pstat-col-wide"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pstat-h mono"
  }, "By topic ", /*#__PURE__*/React.createElement("span", {
    className: "pstat-n"
  }, stats.topArr.length, " distinct")), /*#__PURE__*/React.createElement("div", {
    className: "pstat-chips"
  }, stats.topArr.map(([tp, n]) => /*#__PURE__*/React.createElement("span", {
    className: "pchip",
    key: tp
  }, tp, " ", /*#__PURE__*/React.createElement("b", null, n)))))), /*#__PURE__*/React.createElement("div", {
    className: "pcontrols"
  }, /*#__PURE__*/React.createElement("div", {
    className: "psearch"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16
  }), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Search title, id, topic, pattern, language\u2026"
  }), q && /*#__PURE__*/React.createElement("button", {
    className: "psearch-x",
    onClick: () => setQ(""),
    "aria-label": "Clear"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    className: "pfilters"
  }, /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, ["All", "Easy", "Medium", "Hard"].map(d => /*#__PURE__*/React.createElement("button", {
    key: d,
    className: "seg-b" + (diffFilter === d ? " on" : ""),
    onClick: () => setDiff(d),
    style: diffFilter === d && d !== "All" ? {
      color: window.CCX.diffColor(d)
    } : null
  }, d))), /*#__PURE__*/React.createElement("div", {
    className: "psel"
  }, /*#__PURE__*/React.createElement("select", {
    value: langFilter,
    onChange: e => setLang(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "All"
  }, "All languages"), langs.map(l => /*#__PURE__*/React.createElement("option", {
    key: l,
    value: l
  }, l))), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron",
    size: 14
  })))), /*#__PURE__*/React.createElement("div", {
    className: "pcount mono"
  }, rows.length, " of ", all.length, q || diffFilter !== "All" || langFilter !== "All" ? " (filtered)" : ""), /*#__PURE__*/React.createElement("div", {
    className: "ptable"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ptable-head"
  }, /*#__PURE__*/React.createElement(Th, {
    k: "id",
    cls: "c-id"
  }, "#"), /*#__PURE__*/React.createElement(Th, {
    k: "title",
    cls: "c-title"
  }, "Challenge"), /*#__PURE__*/React.createElement(Th, {
    k: "difficulty",
    cls: "c-diff"
  }, "Difficulty"), /*#__PURE__*/React.createElement(Th, {
    k: "language",
    cls: "c-lang"
  }, "Language"), /*#__PURE__*/React.createElement(Th, {
    k: "type",
    cls: "c-type"
  }, "Topics"), /*#__PURE__*/React.createElement("div", {
    className: "th c-go"
  })), rows.map((c, i) => /*#__PURE__*/React.createElement("a", {
    className: "prow",
    key: c.path,
    style: {
      "--i": Math.min(i, 14)
    },
    href: `src/challenge.html?path=${encodeURIComponent(c.path)}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "c-id mono"
  }, c.id), /*#__PURE__*/React.createElement("div", {
    className: "c-title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "prow-title"
  }, c.title), /*#__PURE__*/React.createElement("span", {
    className: "prow-pats mono"
  }, (c.patterns || []).slice(0, 3).join(" · "))), /*#__PURE__*/React.createElement("div", {
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
  }, "No solutions match your filters.")))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(PlatformPage, null));
