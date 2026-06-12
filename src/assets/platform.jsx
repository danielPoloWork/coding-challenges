/* Coding Challenges — platform index: sortable / filterable / searchable list.
   Reads ?platform=<id>, loads manifest, shows that platform's solutions. */

function naturalCmp(a, b) {
  const an = /^\d+$/.test(a), bn = /^\d+$/.test(b);
  if (an && bn) return parseInt(a, 10) - parseInt(b, 10);
  return String(a).localeCompare(String(b));
}

const SORTS = {
  id:    { label: "ID",         get: (c) => c.id, cmp: (a, b) => naturalCmp(a.id, b.id) },
  title: { label: "Title",      get: (c) => c.title, cmp: (a, b) => a.title.localeCompare(b.title) },
  difficulty: { label: "Difficulty", get: (c) => c.difficulty, cmp: (a, b) => window.CCX.diffRank(a.difficulty) - window.CCX.diffRank(b.difficulty) || naturalCmp(a.id, b.id) },
  type:  { label: "Topics",     get: (c) => (c.topics || [])[0] || "", cmp: (a, b) => ((a.topics || [])[0] || "").localeCompare((b.topics || [])[0] || "") },
  language: { label: "Language", get: (c) => c.language, cmp: (a, b) => a.language.localeCompare(b.language) || naturalCmp(a.id, b.id) },
};

function PlatformPage() {
  const [theme, toggleTheme] = usePageTheme();
  const pid = window.CCX.qs("platform") || "leetcode";
  const [data, setData] = useState({ loading: true });
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [dir, setDir] = useState(1); // 1 asc, -1 desc
  const [diffFilter, setDiff] = useState("All");
  const [langFilter, setLang] = useState("All");

  useEffect(() => {
    let alive = true;
    window.CCX.loadManifest()
      .then((m) => { if (alive) setData({ loading: false, manifest: m }); })
      .catch((e) => { if (alive) setData({ loading: false, error: e.message }); });
    return () => { alive = false; };
  }, []);

  const meta = data.manifest ? window.CCX.platformMeta(data.manifest, pid) : null;
  const all = useMemo(() => (data.manifest ? data.manifest.challenges.filter((c) => c.platform === pid) : []), [data, pid]);
  const langsOf = (c) => c.languages || [c.language];
  const langs = useMemo(() => [...new Set(all.flatMap(langsOf))].sort(), [all]);

  // aggregate breakdowns straight from this platform's index entries
  const stats = useMemo(() => {
    const diff = { Easy: 0, Medium: 0, Hard: 0 };
    const langMap = {}, topMap = {};
    all.forEach((c) => {
      if (c.difficulty in diff) diff[c.difficulty]++;
      langsOf(c).forEach((l) => { langMap[l] = (langMap[l] || 0) + 1; });
      (c.topics || []).forEach((t) => { topMap[t] = (topMap[t] || 0) + 1; });
    });
    return {
      diff,
      langArr: Object.entries(langMap).sort((a, b) => b[1] - a[1]),
      topArr: Object.entries(topMap).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
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
        c.language.toLowerCase().includes(needle) ||
        (c.topics || []).some((t) => t.toLowerCase().includes(needle)) ||
        (c.patterns || []).some((t) => t.toLowerCase().includes(needle))
      ));
    }
    const cmp = SORTS[sortKey].cmp;
    r = [...r].sort((a, b) => cmp(a, b) * dir);
    return r;
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
      <InnerNav theme={theme} onToggleTheme={toggleTheme} backHref="index.html#platforms" backLabel="All platforms" />
      <main className="wrap cpage">
        {data.loading && <div className="cloading"><span className="spin" /> Loading index…</div>}
        {!data.loading && !meta && <div className="cerror"><h2 className="serif">Unknown platform “{pid}”.</h2><a className="btn btn-ghost" href="index.html#platforms" style={{ marginTop: 18 }}><Icon name="arrow" size={15} /> Browse platforms</a></div>}
        {!data.loading && meta && (
          <React.Fragment>
            <div className="crumb">
              <a href="index.html">home</a><span className="sep">/</span>
              <a href="index.html#platforms">platforms</a><span className="sep">/</span><b>{meta.id}</b>
            </div>

            <div className="phead">
              <span className="pcard-icon phead-icon" style={{ background: meta.color }}>{meta.abbr}</span>
              <div>
                <h1 className="serif">{meta.name}</h1>
                <p>{meta.desc}</p>
              </div>
              <div className="phead-count">
                <div className="serif n">{all.length}</div>
                <div className="l mono">solved</div>
              </div>
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
                        <span className="ddot" style={{ background: window.CCX.diffColor(d) }} />
                        {d} <b>{stats.diff[d]}</b>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pstat-col">
                  <div className="pstat-h mono">By language</div>
                  <div className="pstat-chips">
                    {stats.langArr.map(([l, n]) => (
                      <span className="pchip" key={l}>
                        <span className="ldot" style={{ background: window.CCX.langColor(l) }} />{l} <b>{n}</b>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pstat-col pstat-col-wide">
                  <div className="pstat-h mono">By topic <span className="pstat-n">{stats.topArr.length} distinct</span></div>
                  <div className="pstat-chips">
                    {stats.topArr.map(([tp, n]) => (
                      <span className="pchip" key={tp}>{tp} <b>{n}</b></span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* controls */}
            <div className="pcontrols">
              <div className="psearch">
                <Icon name="search" size={16} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, id, topic, pattern, language…" />
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

            {/* table */}
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
        )}
      </main>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PlatformPage />);
