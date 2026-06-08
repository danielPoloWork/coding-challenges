/* Coding Challenges — pattern / topic lens page (cross-platform).
   Driven by window.CC_LENS = { attr:"patterns"|"topics", param, label, noun }.
     • no ?<param>      → index of every label, sorted by frequency, clickable.
     • ?<param>=<value> → challenges carrying that label: searchable, filterable,
                          sortable, across every platform.
   Mirrors platform.jsx (same controls, same table columns / CSS grid). */

const LENS = window.CC_LENS;
const LENS_HREF = LENS.attr === "topics" ? "src/topic.html" : "src/pattern.html";
const OTHER_ATTR = LENS.attr === "topics" ? "patterns" : "topics";
const OTHER_NOUN = LENS.attr === "topics" ? "pattern" : "topic";

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
  const [data, setData] = useState({ loading: true });

  useEffect(() => {
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
        backHref={value ? LENS_HREF : "index.html"}
        backLabel={value ? `All ${LENS.noun}s` : "Home"} />
      <main className="wrap cpage">
        {data.loading && <div className="cloading"><span className="spin" /> Loading index…</div>}
        {data.error && <div className="cerror"><h2 className="serif">Couldn’t load the index.</h2><p className="mono">{data.error}</p></div>}
        {data.manifest && !value && <LensIndex challenges={challenges} />}
        {data.manifest && value && <LensDetail challenges={challenges} value={value} />}
      </main>
    </React.Fragment>
  );
}

/* ---- index: every label, sorted by frequency, clickable ---- */
function LensIndex({ challenges }) {
  const [q, setQ] = useState("");
  const labels = useMemo(() => {
    const map = {};
    challenges.forEach((c) => labelsOf(c).forEach((v) => { map[v] = (map[v] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [challenges]);
  const needle = q.trim().toLowerCase();
  const shown = needle ? labels.filter(([n]) => n.toLowerCase().includes(needle)) : labels;

  return (
    <React.Fragment>
      <div className="crumb"><a href="index.html">home</a><span className="sep">/</span><b>{LENS.noun}s</b></div>
      <div className="phead">
        <span className="pcard-icon phead-icon" style={{ background: "var(--clay)" }}>{LENS.label[0]}</span>
        <div>
          <h1 className="serif">{LENS.label} explorer</h1>
          <p>Every {LENS.noun} across all platforms — pick one to see the challenges that exercise it.</p>
        </div>
        <div className="phead-count"><div className="serif n">{labels.length}</div><div className="l mono">distinct</div></div>
      </div>
      <div className="pcontrols">
        <div className="psearch">
          <Icon name="search" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Filter ${LENS.noun}s…`} />
          {q && <button className="psearch-x" onClick={() => setQ("")} aria-label="Clear"><Icon name="x" size={14} /></button>}
        </div>
      </div>
      <div className="pcount mono">{shown.length} of {labels.length}{needle ? " (filtered)" : ""}</div>
      <div className="pat-cloud" style={{ marginTop: 4 }}>
        {shown.map(([name, n]) => (
          <a className="pat" key={name} href={`${LENS_HREF}?${LENS.param}=${encodeURIComponent(name)}`}>
            {name}<span className="c">{n}</span>
          </a>
        ))}
        {shown.length === 0 && <div className="pempty mono">No {LENS.noun}s match.</div>}
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
        <a href={LENS_HREF}>{LENS.noun}s</a><span className="sep">/</span><b>{value}</b>
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
        {rows.map((c) => (
          <a className="prow" key={c.path} href={`src/challenge.html?path=${encodeURIComponent(c.path)}`}>
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
