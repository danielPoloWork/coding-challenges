/* Coding Challenges — pattern / topic lens (cross-platform), shared by the
   plural index pages (patterns.html / topics.html) and the singular detail
   pages (pattern.html / topic.html). Driven by
     window.CC_LENS = { attr:"patterns"|"topics", param, label, noun, mode }.
   mode "index"  → sortable/filterable table of every label; row → detail page.
   mode "detail" → ?<param>=<value> lists that label's challenges (searchable,
                   filterable, sortable). Reuses platform.jsx's table CSS grid. */

const LENS = window.CC_LENS;
const INDEX_HREF  = LENS.attr === "topics" ? "src/topics.html" : "src/patterns.html";
const DETAIL_HREF = LENS.attr === "topics" ? "src/topic.html"  : "src/pattern.html";
const OTHER_ATTR  = LENS.attr === "topics" ? "patterns" : "topics";
const OTHER_NOUN  = LENS.attr === "topics" ? "pattern" : "topic";

function naturalCmp(a, b) {
  const an = /^\d+$/.test(a), bn = /^\d+$/.test(b);
  if (an && bn) return parseInt(a, 10) - parseInt(b, 10);
  return String(a).localeCompare(String(b));
}

const labelsOf = (c) => c[LENS.attr] || [];
const langsOf = (c) => c.languages || [c.language];

const SORTS = {
  id:         { cmp: (a, b) => naturalCmp(a.id, b.id) },
  title:      { cmp: (a, b) => a.title.localeCompare(b.title) },
  difficulty: { cmp: (a, b) => window.CCX.diffRank(a.difficulty) - window.CCX.diffRank(b.difficulty) || naturalCmp(a.id, b.id) },
  language:   { cmp: (a, b) => (langsOf(a)[0] || "").localeCompare(langsOf(b)[0] || "") || naturalCmp(a.id, b.id) },
  type:       { cmp: (a, b) => ((a.topics || [])[0] || "").localeCompare((b.topics || [])[0] || "") },
};

function LensPage() {
  const [theme, toggleTheme] = usePageTheme();
  const value = window.CCX.qs(LENS.param);
  const isDetail = LENS.mode === "detail";
  const [data, setData] = useState({ loading: true });

  useEffect(() => {
    // a detail page reached without a value has nothing to show → go to the list
    if (isDetail && !value) { window.location.replace(INDEX_HREF); return; }
    let alive = true;
    window.CCX.loadManifest()
      .then((m) => { if (alive) setData({ loading: false, manifest: m }); })
      .catch((e) => { if (alive) setData({ loading: false, error: e.message }); });
    return () => { alive = false; };
  }, []);

  const challenges = useMemo(
    () => (data.manifest ? data.manifest.challenges : []),
    [data.manifest]
  );

  return (
    <React.Fragment>
      <InnerNav theme={theme} onToggleTheme={toggleTheme}
        backHref={isDetail ? INDEX_HREF : "index.html"}
        backLabel={isDetail ? `All ${LENS.noun}s` : "Home"} />
      <main className="wrap cpage">
        {data.loading && <div className="cloading"><span className="spin" /> Loading index…</div>}
        {data.error && <div className="cerror"><h2 className="serif">Couldn’t load the index.</h2><p className="mono">{data.error}</p></div>}
        {data.manifest && !isDetail && <LensIndex challenges={challenges} />}
        {data.manifest && isDetail && value && <LensDetail challenges={challenges} value={value} />}
      </main>
    </React.Fragment>
  );
}

/* ---- index: sortable / filterable table of every label; row → detail page ---- */
function LensIndex({ challenges }) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("count");
  const [dir, setDir] = useState(-1);   // most-used first
  const [diffFilter, setDiff] = useState("All");
  const [langFilter, setLang] = useState("All");
  const [crossFilter, setCross] = useState("All");

  // filter option lists (over every challenge, independent of active filters)
  const langOptions = useMemo(() => [...new Set(challenges.flatMap(langsOf))].sort(), [challenges]);
  const crossOptions = useMemo(
    () => [...new Set(challenges.flatMap((c) => c[OTHER_ATTR] || []))].sort((a, b) => a.localeCompare(b)),
    [challenges]
  );
  const totalDistinct = useMemo(() => {
    const s = new Set();
    challenges.forEach((c) => labelsOf(c).forEach((v) => s.add(v)));
    return s.size;
  }, [challenges]);

  // narrow the challenge set by the filters, then aggregate per label so the
  // counts / difficulty / language cells reflect the filtered selection
  const labels = useMemo(() => {
    let r = challenges;
    if (diffFilter !== "All") r = r.filter((c) => c.difficulty === diffFilter);
    if (langFilter !== "All") r = r.filter((c) => langsOf(c).includes(langFilter));
    if (crossFilter !== "All") r = r.filter((c) => (c[OTHER_ATTR] || []).includes(crossFilter));
    const map = {};
    r.forEach((c) => labelsOf(c).forEach((v) => { (map[v] || (map[v] = [])).push(c); }));
    return Object.entries(map).map(([name, items]) => {
      const diff = { Easy: 0, Medium: 0, Hard: 0 };
      const langSet = new Set(), otherMap = {};
      items.forEach((c) => {
        if (c.difficulty in diff) diff[c.difficulty]++;
        langsOf(c).forEach((l) => langSet.add(l));
        (c[OTHER_ATTR] || []).forEach((o) => { otherMap[o] = (otherMap[o] || 0) + 1; });
      });
      return {
        name, count: items.length, diff,
        languages: [...langSet].sort(),
        others: Object.entries(otherMap).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map((e) => e[0]),
      };
    });
  }, [challenges, diffFilter, langFilter, crossFilter]);

  const diffScore = (d) => d.Hard * 1e6 + d.Medium * 1e3 + d.Easy;
  const LSORTS = {
    count:      (a, b) => a.count - b.count || a.name.localeCompare(b.name),
    name:       (a, b) => a.name.localeCompare(b.name),
    difficulty: (a, b) => diffScore(a.diff) - diffScore(b.diff) || a.count - b.count,
    languages:  (a, b) => a.languages.length - b.languages.length || a.name.localeCompare(b.name),
    others:     (a, b) => a.others.length - b.others.length || a.name.localeCompare(b.name),
  };
  const rows = useMemo(() => {
    let r = labels;
    if (q.trim()) { const n = q.trim().toLowerCase(); r = r.filter((x) => x.name.toLowerCase().includes(n)); }
    return [...r].sort((a, b) => LSORTS[sortKey](a, b) * dir);
  }, [labels, q, sortKey, dir]);

  const clickSort = (k) => {
    if (k === sortKey) setDir((d) => -d);
    else { setSortKey(k); setDir(k === "name" ? 1 : -1); }
  };
  const Th = ({ k, children, cls }) => (
    <button className={"th " + (cls || "") + (sortKey === k ? " active" : "")} onClick={() => clickSort(k)}>
      {children}
      <span className="th-caret" style={{ opacity: sortKey === k ? 1 : 0.25, transform: sortKey === k && dir < 0 ? "rotate(180deg)" : "none" }}>
        <Icon name="caret" size={14} />
      </span>
    </button>
  );

  const filtered = q || diffFilter !== "All" || langFilter !== "All" || crossFilter !== "All";

  return (
    <React.Fragment>
      <div className="crumb"><a href="index.html">home</a><span className="sep">/</span><b>{LENS.noun}s</b></div>
      <div className="phead">
        <span className="pcard-icon phead-icon" style={{ background: "var(--clay)" }}>{LENS.label[0]}</span>
        <div>
          <h1 className="serif">{LENS.label} explorer</h1>
          <p>Every {LENS.noun} across all platforms, sortable and filterable — pick one to see its challenges.</p>
        </div>
        <div className="phead-count"><div className="serif n">{totalDistinct}</div><div className="l mono">distinct</div></div>
      </div>

      <div className="pcontrols">
        <div className="psearch">
          <Icon name="search" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Filter ${LENS.noun}s…`} />
          {q && <button className="psearch-x" onClick={() => setQ("")} aria-label="Clear"><Icon name="x" size={14} /></button>}
        </div>
        <div className="pfilters">
          <div className="seg">
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button key={d} className={"seg-b" + (diffFilter === d ? " on" : "")} onClick={() => setDiff(d)}
                style={diffFilter === d && d !== "All" ? { color: window.CCX.diffColor(d) } : null}>{d}</button>
            ))}
          </div>
          <div className="psel">
            <select value={langFilter} onChange={(e) => setLang(e.target.value)}>
              <option value="All">All languages</option>
              {langOptions.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <Icon name="chevron" size={14} />
          </div>
          <div className="psel">
            <select value={crossFilter} onChange={(e) => setCross(e.target.value)}>
              <option value="All">All {OTHER_NOUN}s</option>
              {crossOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <Icon name="chevron" size={14} />
          </div>
        </div>
      </div>

      <div className="pcount mono">{rows.length} of {totalDistinct}{filtered ? " (filtered)" : ""}</div>

      <div className="ptable">
        <div className="ptable-head">
          <Th k="count" cls="c-id">#</Th>
          <Th k="name" cls="c-title">{LENS.label}</Th>
          <Th k="difficulty" cls="c-diff">Difficulty</Th>
          <Th k="languages" cls="c-lang">Languages</Th>
          <Th k="others" cls="c-type">{OTHER_NOUN === "topic" ? "Topics" : "Patterns"}</Th>
          <div className="th c-go" />
        </div>
        {rows.map((x, i) => (
          <a className="prow" key={x.name} style={{ "--i": Math.min(i, 14) }} href={`${DETAIL_HREF}?${LENS.param}=${encodeURIComponent(x.name)}`}>
            <div className="c-id mono">{x.count}</div>
            <div className="c-title"><span className="prow-title">{x.name}</span></div>
            <div className="c-diff" style={{ gap: 12 }}>
              {["Easy", "Medium", "Hard"].map((d) => (x.diff[d] ? (
                <span key={d} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span className="ddot" style={{ background: window.CCX.diffColor(d) }} />
                  <span className="mono" style={{ fontSize: 12 }}>{x.diff[d]}</span>
                </span>
              ) : null))}
            </div>
            <div className="c-lang mono">
              {x.languages.map((l) => (
                <span className="lchip" key={l}><span className="ldot" style={{ background: window.CCX.langColor(l) }} />{l}</span>
              ))}
            </div>
            <div className="c-type">{x.others.slice(0, 3).map((o) => <span className="node" key={o}>{o}</span>)}</div>
            <div className="c-go"><Icon name="arrow" size={16} /></div>
          </a>
        ))}
        {rows.length === 0 && <div className="pempty mono">No {LENS.noun}s match.</div>}
      </div>
    </React.Fragment>
  );
}

/* ---- detail: challenges carrying one label ---- */
function LensDetail({ challenges, value }) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [dir, setDir] = useState(1);
  const [diffFilter, setDiff] = useState("All");
  const [langFilter, setLang] = useState("All");

  const all = useMemo(
    () => challenges.filter((c) => labelsOf(c).includes(value)),
    [challenges, value]
  );
  const langs = useMemo(() => [...new Set(all.flatMap(langsOf))].sort(), [all]);

  const stats = useMemo(() => {
    const diff = { Easy: 0, Medium: 0, Hard: 0 };
    const langMap = {}, otherMap = {};
    all.forEach((c) => {
      if (c.difficulty in diff) diff[c.difficulty]++;
      langsOf(c).forEach((l) => { langMap[l] = (langMap[l] || 0) + 1; });
      (c[OTHER_ATTR] || []).forEach((o) => { otherMap[o] = (otherMap[o] || 0) + 1; });
    });
    return {
      diff,
      langArr: Object.entries(langMap).sort((a, b) => b[1] - a[1]),
      otherArr: Object.entries(otherMap).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    };
  }, [all]);

  const rows = useMemo(() => {
    let r = all;
    if (diffFilter !== "All") r = r.filter((c) => c.difficulty === diffFilter);
    if (langFilter !== "All") r = r.filter((c) => langsOf(c).includes(langFilter));
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      r = r.filter((c) => (
        c.title.toLowerCase().includes(needle) ||
        String(c.id).toLowerCase().includes(needle) ||
        c.platform.toLowerCase().includes(needle) ||
        langsOf(c).some((l) => l.toLowerCase().includes(needle)) ||
        (c.topics || []).some((t) => t.toLowerCase().includes(needle)) ||
        (c.patterns || []).some((t) => t.toLowerCase().includes(needle))
      ));
    }
    const cmp = SORTS[sortKey].cmp;
    return [...r].sort((a, b) => cmp(a, b) * dir);
  }, [all, q, sortKey, dir, diffFilter, langFilter]);

  const clickSort = (k) => {
    if (k === sortKey) setDir((d) => -d);
    else { setSortKey(k); setDir(1); }
  };
  const Th = ({ k, children, cls }) => (
    <button className={"th " + (cls || "") + (sortKey === k ? " active" : "")} onClick={() => clickSort(k)}>
      {children}
      <span className="th-caret" style={{ opacity: sortKey === k ? 1 : 0.25, transform: sortKey === k && dir < 0 ? "rotate(180deg)" : "none" }}>
        <Icon name="caret" size={14} />
      </span>
    </button>
  );

  return (
    <React.Fragment>
      <div className="crumb">
        <a href="index.html">home</a><span className="sep">/</span>
        <a href={INDEX_HREF}>{LENS.noun}s</a><span className="sep">/</span><b>{value}</b>
      </div>

      <div className="phead">
        <span className="pcard-icon phead-icon" style={{ background: "var(--clay)" }}>{LENS.label[0]}</span>
        <div>
          <h1 className="serif">{value}</h1>
          <p>Challenges that exercise the <b>{value}</b> {LENS.noun}, across every platform.</p>
        </div>
        <div className="phead-count"><div className="serif n">{all.length}</div><div className="l mono">solved</div></div>
      </div>

      {all.length > 0 && (
        <div className="pstats">
          <div className="pstat-col">
            <div className="pstat-h mono">By difficulty</div>
            <div className="pstat-bar">
              {["Easy", "Medium", "Hard"].map((d) => (stats.diff[d] ? (
                <span key={d} style={{ flex: stats.diff[d], background: window.CCX.diffColor(d) }} title={`${d} · ${stats.diff[d]}`} />
              ) : null))}
            </div>
            <div className="pstat-legend">
              {["Easy", "Medium", "Hard"].map((d) => (
                <span className="pstat-leg" key={d}>
                  <span className="ddot" style={{ background: window.CCX.diffColor(d) }} />{d} <b>{stats.diff[d]}</b>
                </span>
              ))}
            </div>
          </div>
          <div className="pstat-col">
            <div className="pstat-h mono">By language</div>
            <div className="pstat-chips">
              {stats.langArr.map(([l, n]) => (
                <span className="pchip" key={l}><span className="ldot" style={{ background: window.CCX.langColor(l) }} />{l} <b>{n}</b></span>
              ))}
            </div>
          </div>
          <div className="pstat-col pstat-col-wide">
            <div className="pstat-h mono">By {OTHER_NOUN} <span className="pstat-n">{stats.otherArr.length} distinct</span></div>
            <div className="pstat-chips">
              {stats.otherArr.length
                ? stats.otherArr.map(([o, n]) => (<span className="pchip" key={o}>{o} <b>{n}</b></span>))
                : <span className="pstat-n">—</span>}
            </div>
          </div>
        </div>
      )}

      {/* controls */}
      <div className="pcontrols">
        <div className="psearch">
          <Icon name="search" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, id, platform, topic, pattern, language…" />
          {q && <button className="psearch-x" onClick={() => setQ("")} aria-label="Clear"><Icon name="x" size={14} /></button>}
        </div>
        <div className="pfilters">
          <div className="seg">
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button key={d} className={"seg-b" + (diffFilter === d ? " on" : "")} onClick={() => setDiff(d)}
                style={diffFilter === d && d !== "All" ? { color: window.CCX.diffColor(d) } : null}>{d}</button>
            ))}
          </div>
          <div className="psel">
            <select value={langFilter} onChange={(e) => setLang(e.target.value)}>
              <option value="All">All languages</option>
              {langs.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <Icon name="chevron" size={14} />
          </div>
        </div>
      </div>

      <div className="pcount mono">{rows.length} of {all.length}{(q || diffFilter !== "All" || langFilter !== "All") ? " (filtered)" : ""}</div>

      {/* table — identical columns/grid to platform.jsx */}
      <div className="ptable">
        <div className="ptable-head">
          <Th k="id" cls="c-id">#</Th>
          <Th k="title" cls="c-title">Challenge</Th>
          <Th k="difficulty" cls="c-diff">Difficulty</Th>
          <Th k="language" cls="c-lang">Language</Th>
          <Th k="type" cls="c-type">Topics</Th>
          <div className="th c-go" />
        </div>
        {rows.map((c, i) => (
          <a className="prow" key={c.path} style={{ "--i": Math.min(i, 14) }} href={`src/challenge.html?path=${encodeURIComponent(c.path)}`}>
            <div className="c-id mono">{c.id}</div>
            <div className="c-title">
              <span className="prow-title">{c.title}</span>
              <span className="prow-pats mono">{(c.patterns || []).slice(0, 3).join(" · ")}</span>
            </div>
            <div className="c-diff">
              <span className="ddot" style={{ background: window.CCX.diffColor(c.difficulty) }} />
              <span style={{ color: window.CCX.diffColor(c.difficulty) }}>{c.difficulty}</span>
            </div>
            <div className="c-lang mono">
              {langsOf(c).map((l) => (
                <span className="lchip" key={l}><span className="ldot" style={{ background: window.CCX.langColor(l) }} />{l}</span>
              ))}
            </div>
            <div className="c-type">{(c.topics || []).slice(0, 2).map((tp) => <span className="node" key={tp}>{tp}</span>)}</div>
            <div className="c-go"><Icon name="arrow" size={16} /></div>
          </a>
        ))}
        {rows.length === 0 && <div className="pempty mono">No solutions match your filters.</div>}
      </div>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<LensPage />);
