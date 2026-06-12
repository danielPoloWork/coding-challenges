/* GENERATED from src/assets/lens.jsx by scripts/build-jsx.mjs — edit the .jsx, not this file. */
/* Coding Challenges — pattern / topic lens (cross-platform), shared by the
   plural index pages (patterns.html / topics.html) and the singular detail
   pages (pattern.html / topic.html). Driven by
     window.CC_LENS = { attr:"patterns"|"topics", param, label, noun, mode }.
   mode "index"  → sortable/filterable table of every label; row → detail page.
   mode "detail" → ?<param>=<value> lists that label's challenges (searchable,
                   filterable, sortable). Reuses platform.jsx's table CSS grid. */

const LENS = window.CC_LENS;
const INDEX_HREF = LENS.attr === "topics" ? "src/topics.html" : "src/patterns.html";
const DETAIL_HREF = LENS.attr === "topics" ? "src/topic.html" : "src/pattern.html";
const OTHER_ATTR = LENS.attr === "topics" ? "patterns" : "topics";
const OTHER_NOUN = LENS.attr === "topics" ? "pattern" : "topic";
function naturalCmp(a, b) {
  const an = /^\d+$/.test(a),
    bn = /^\d+$/.test(b);
  if (an && bn) return parseInt(a, 10) - parseInt(b, 10);
  return String(a).localeCompare(String(b));
}
const labelsOf = c => c[LENS.attr] || [];
const langsOf = c => c.languages || [c.language];
const SORTS = {
  id: {
    cmp: (a, b) => naturalCmp(a.id, b.id)
  },
  title: {
    cmp: (a, b) => a.title.localeCompare(b.title)
  },
  difficulty: {
    cmp: (a, b) => window.CCX.diffRank(a.difficulty) - window.CCX.diffRank(b.difficulty) || naturalCmp(a.id, b.id)
  },
  language: {
    cmp: (a, b) => (langsOf(a)[0] || "").localeCompare(langsOf(b)[0] || "") || naturalCmp(a.id, b.id)
  },
  type: {
    cmp: (a, b) => ((a.topics || [])[0] || "").localeCompare((b.topics || [])[0] || "")
  }
};
function LensPage() {
  const [theme, toggleTheme] = usePageTheme();
  const value = window.CCX.qs(LENS.param);
  const isDetail = LENS.mode === "detail";
  const [data, setData] = useState({
    loading: true
  });
  useEffect(() => {
    // a detail page reached without a value has nothing to show → go to the list
    if (isDetail && !value) {
      window.location.replace(INDEX_HREF);
      return;
    }
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
  const challenges = useMemo(() => data.manifest ? data.manifest.challenges : [], [data.manifest]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(InnerNav, {
    theme: theme,
    onToggleTheme: toggleTheme,
    backHref: isDetail ? INDEX_HREF : "index.html",
    backLabel: isDetail ? `All ${LENS.noun}s` : "Home"
  }), /*#__PURE__*/React.createElement("main", {
    className: "wrap cpage"
  }, data.loading && /*#__PURE__*/React.createElement("div", {
    className: "cloading"
  }, /*#__PURE__*/React.createElement("span", {
    className: "spin"
  }), " Loading index\u2026"), data.error && /*#__PURE__*/React.createElement("div", {
    className: "cerror"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "serif"
  }, "Couldn\u2019t load the index."), /*#__PURE__*/React.createElement("p", {
    className: "mono"
  }, data.error)), data.manifest && !isDetail && /*#__PURE__*/React.createElement(LensIndex, {
    challenges: challenges
  }), data.manifest && isDetail && value && /*#__PURE__*/React.createElement(LensDetail, {
    challenges: challenges,
    value: value
  })));
}

/* ---- index: sortable / filterable table of every label; row → detail page ---- */
function LensIndex({
  challenges
}) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("count");
  const [dir, setDir] = useState(-1); // most-used first
  const [diffFilter, setDiff] = useState("All");
  const [langFilter, setLang] = useState("All");
  const [crossFilter, setCross] = useState("All");

  // filter option lists (over every challenge, independent of active filters)
  const langOptions = useMemo(() => [...new Set(challenges.flatMap(langsOf))].sort(), [challenges]);
  const crossOptions = useMemo(() => [...new Set(challenges.flatMap(c => c[OTHER_ATTR] || []))].sort((a, b) => a.localeCompare(b)), [challenges]);
  const totalDistinct = useMemo(() => {
    const s = new Set();
    challenges.forEach(c => labelsOf(c).forEach(v => s.add(v)));
    return s.size;
  }, [challenges]);

  // narrow the challenge set by the filters, then aggregate per label so the
  // counts / difficulty / language cells reflect the filtered selection
  const labels = useMemo(() => {
    let r = challenges;
    if (diffFilter !== "All") r = r.filter(c => c.difficulty === diffFilter);
    if (langFilter !== "All") r = r.filter(c => langsOf(c).includes(langFilter));
    if (crossFilter !== "All") r = r.filter(c => (c[OTHER_ATTR] || []).includes(crossFilter));
    const map = {};
    r.forEach(c => labelsOf(c).forEach(v => {
      (map[v] || (map[v] = [])).push(c);
    }));
    return Object.entries(map).map(([name, items]) => {
      const diff = {
        Easy: 0,
        Medium: 0,
        Hard: 0
      };
      const langSet = new Set(),
        otherMap = {};
      items.forEach(c => {
        if (c.difficulty in diff) diff[c.difficulty]++;
        langsOf(c).forEach(l => langSet.add(l));
        (c[OTHER_ATTR] || []).forEach(o => {
          otherMap[o] = (otherMap[o] || 0) + 1;
        });
      });
      return {
        name,
        count: items.length,
        diff,
        languages: [...langSet].sort(),
        others: Object.entries(otherMap).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(e => e[0])
      };
    });
  }, [challenges, diffFilter, langFilter, crossFilter]);
  const diffScore = d => d.Hard * 1e6 + d.Medium * 1e3 + d.Easy;
  const LSORTS = {
    count: (a, b) => a.count - b.count || a.name.localeCompare(b.name),
    name: (a, b) => a.name.localeCompare(b.name),
    difficulty: (a, b) => diffScore(a.diff) - diffScore(b.diff) || a.count - b.count,
    languages: (a, b) => a.languages.length - b.languages.length || a.name.localeCompare(b.name),
    others: (a, b) => a.others.length - b.others.length || a.name.localeCompare(b.name)
  };
  const rows = useMemo(() => {
    let r = labels;
    if (q.trim()) {
      const n = q.trim().toLowerCase();
      r = r.filter(x => x.name.toLowerCase().includes(n));
    }
    return [...r].sort((a, b) => LSORTS[sortKey](a, b) * dir);
  }, [labels, q, sortKey, dir]);
  const clickSort = k => {
    if (k === sortKey) setDir(d => -d);else {
      setSortKey(k);
      setDir(k === "name" ? 1 : -1);
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
  const filtered = q || diffFilter !== "All" || langFilter !== "All" || crossFilter !== "All";
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "crumb"
  }, /*#__PURE__*/React.createElement("a", {
    href: "index.html"
  }, "home"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "/"), /*#__PURE__*/React.createElement("b", null, LENS.noun, "s")), /*#__PURE__*/React.createElement("div", {
    className: "phead"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pcard-icon phead-icon",
    style: {
      background: "var(--clay)"
    }
  }, LENS.label[0]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "serif"
  }, LENS.label, " explorer"), /*#__PURE__*/React.createElement("p", null, "Every ", LENS.noun, " across all platforms, sortable and filterable \u2014 pick one to see its challenges.")), /*#__PURE__*/React.createElement("div", {
    className: "phead-count"
  }, /*#__PURE__*/React.createElement("div", {
    className: "serif n"
  }, totalDistinct), /*#__PURE__*/React.createElement("div", {
    className: "l mono"
  }, "distinct"))), /*#__PURE__*/React.createElement("div", {
    className: "pcontrols"
  }, /*#__PURE__*/React.createElement("div", {
    className: "psearch"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16
  }), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: `Filter ${LENS.noun}s…`
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
  }, "All languages"), langOptions.map(l => /*#__PURE__*/React.createElement("option", {
    key: l,
    value: l
  }, l))), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron",
    size: 14
  })), /*#__PURE__*/React.createElement("div", {
    className: "psel"
  }, /*#__PURE__*/React.createElement("select", {
    value: crossFilter,
    onChange: e => setCross(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "All"
  }, "All ", OTHER_NOUN, "s"), crossOptions.map(o => /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o))), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron",
    size: 14
  })))), /*#__PURE__*/React.createElement("div", {
    className: "pcount mono"
  }, rows.length, " of ", totalDistinct, filtered ? " (filtered)" : ""), /*#__PURE__*/React.createElement("div", {
    className: "ptable"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ptable-head"
  }, /*#__PURE__*/React.createElement(Th, {
    k: "count",
    cls: "c-id"
  }, "#"), /*#__PURE__*/React.createElement(Th, {
    k: "name",
    cls: "c-title"
  }, LENS.label), /*#__PURE__*/React.createElement(Th, {
    k: "difficulty",
    cls: "c-diff"
  }, "Difficulty"), /*#__PURE__*/React.createElement(Th, {
    k: "languages",
    cls: "c-lang"
  }, "Languages"), /*#__PURE__*/React.createElement(Th, {
    k: "others",
    cls: "c-type"
  }, OTHER_NOUN === "topic" ? "Topics" : "Patterns"), /*#__PURE__*/React.createElement("div", {
    className: "th c-go"
  })), rows.map((x, i) => /*#__PURE__*/React.createElement("a", {
    className: "prow",
    key: x.name,
    style: {
      "--i": Math.min(i, 14)
    },
    href: `${DETAIL_HREF}?${LENS.param}=${encodeURIComponent(x.name)}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "c-id mono"
  }, x.count), /*#__PURE__*/React.createElement("div", {
    className: "c-title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "prow-title"
  }, x.name)), /*#__PURE__*/React.createElement("div", {
    className: "c-diff",
    style: {
      gap: 12
    }
  }, ["Easy", "Medium", "Hard"].map(d => x.diff[d] ? /*#__PURE__*/React.createElement("span", {
    key: d,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ddot",
    style: {
      background: window.CCX.diffColor(d)
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12
    }
  }, x.diff[d])) : null)), /*#__PURE__*/React.createElement("div", {
    className: "c-lang mono"
  }, x.languages.map(l => /*#__PURE__*/React.createElement("span", {
    className: "lchip",
    key: l
  }, /*#__PURE__*/React.createElement("span", {
    className: "ldot",
    style: {
      background: window.CCX.langColor(l)
    }
  }), l))), /*#__PURE__*/React.createElement("div", {
    className: "c-type"
  }, x.others.slice(0, 3).map(o => /*#__PURE__*/React.createElement("span", {
    className: "node",
    key: o
  }, o))), /*#__PURE__*/React.createElement("div", {
    className: "c-go"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 16
  })))), rows.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "pempty mono"
  }, "No ", LENS.noun, "s match.")));
}

/* ---- detail: challenges carrying one label ---- */
function LensDetail({
  challenges,
  value
}) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [dir, setDir] = useState(1);
  const [diffFilter, setDiff] = useState("All");
  const [langFilter, setLang] = useState("All");
  const all = useMemo(() => challenges.filter(c => labelsOf(c).includes(value)), [challenges, value]);
  const langs = useMemo(() => [...new Set(all.flatMap(langsOf))].sort(), [all]);
  const stats = useMemo(() => {
    const diff = {
      Easy: 0,
      Medium: 0,
      Hard: 0
    };
    const langMap = {},
      otherMap = {};
    all.forEach(c => {
      if (c.difficulty in diff) diff[c.difficulty]++;
      langsOf(c).forEach(l => {
        langMap[l] = (langMap[l] || 0) + 1;
      });
      (c[OTHER_ATTR] || []).forEach(o => {
        otherMap[o] = (otherMap[o] || 0) + 1;
      });
    });
    return {
      diff,
      langArr: Object.entries(langMap).sort((a, b) => b[1] - a[1]),
      otherArr: Object.entries(otherMap).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    };
  }, [all]);
  const rows = useMemo(() => {
    let r = all;
    if (diffFilter !== "All") r = r.filter(c => c.difficulty === diffFilter);
    if (langFilter !== "All") r = r.filter(c => langsOf(c).includes(langFilter));
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      r = r.filter(c => c.title.toLowerCase().includes(needle) || String(c.id).toLowerCase().includes(needle) || c.platform.toLowerCase().includes(needle) || langsOf(c).some(l => l.toLowerCase().includes(needle)) || (c.topics || []).some(t => t.toLowerCase().includes(needle)) || (c.patterns || []).some(t => t.toLowerCase().includes(needle)));
    }
    const cmp = SORTS[sortKey].cmp;
    return [...r].sort((a, b) => cmp(a, b) * dir);
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
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "crumb"
  }, /*#__PURE__*/React.createElement("a", {
    href: "index.html"
  }, "home"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "/"), /*#__PURE__*/React.createElement("a", {
    href: INDEX_HREF
  }, LENS.noun, "s"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "/"), /*#__PURE__*/React.createElement("b", null, value)), /*#__PURE__*/React.createElement("div", {
    className: "phead"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pcard-icon phead-icon",
    style: {
      background: "var(--clay)"
    }
  }, LENS.label[0]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "serif"
  }, value), /*#__PURE__*/React.createElement("p", null, "Challenges that exercise the ", /*#__PURE__*/React.createElement("b", null, value), " ", LENS.noun, ", across every platform.")), /*#__PURE__*/React.createElement("div", {
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
  }, "By ", OTHER_NOUN, " ", /*#__PURE__*/React.createElement("span", {
    className: "pstat-n"
  }, stats.otherArr.length, " distinct")), /*#__PURE__*/React.createElement("div", {
    className: "pstat-chips"
  }, stats.otherArr.length ? stats.otherArr.map(([o, n]) => /*#__PURE__*/React.createElement("span", {
    className: "pchip",
    key: o
  }, o, " ", /*#__PURE__*/React.createElement("b", null, n))) : /*#__PURE__*/React.createElement("span", {
    className: "pstat-n"
  }, "\u2014")))), /*#__PURE__*/React.createElement("div", {
    className: "pcontrols"
  }, /*#__PURE__*/React.createElement("div", {
    className: "psearch"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16
  }), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Search title, id, platform, topic, pattern, language\u2026"
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
  }, "No solutions match your filters.")));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(LensPage, null));
