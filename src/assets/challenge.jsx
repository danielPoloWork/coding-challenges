/* Coding Challenges — dynamic challenge viewer.
   Reads ?path=platforms/<platform>/<ext>/<id>-<slug> and fetches the REAL files
   in that folder (metadata.json, notes.md, complexity.md, solution*.<ext>). */

/* ---------- minimal markdown -> html ---------- */
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function mdInline(s) {
  return s
    .replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}
function parseMarkdown(md) {
  const lines = md.replace(/\r/g, "").split("\n");
  let html = "", i = 0;
  const list = (buf, ordered) => {
    const tag = ordered ? "ol" : "ul";
    return `<${tag}>` + buf.map((b) => `<li>${mdInline(escapeHtml(b))}</li>`).join("") + `</${tag}>`;
  };
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      html += `<pre class="block"><code>${escapeHtml(buf.join("\n"))}</code></pre>`;
      continue;
    }
    if (/^\s*$/.test(line)) { i++; continue; }
    if (/^---\s*$/.test(line)) { html += "<hr/>"; i++; continue; }
    if (/^####\s+/.test(line)) { html += `<h4 class="mdh4">${mdInline(escapeHtml(line.replace(/^####\s+/, "")))}</h4>`; i++; continue; }
    if (/^###\s+/.test(line)) { html += `<h3>${mdInline(escapeHtml(line.replace(/^###\s+/, "")))}</h3>`; i++; continue; }
    if (/^##\s+/.test(line)) { html += `<h2>${mdInline(escapeHtml(line.replace(/^##\s+/, "")))}</h2>`; i++; continue; }
    if (/^#\s+/.test(line)) { html += `<h1 class="mdh1">${mdInline(escapeHtml(line.replace(/^#\s+/, "")))}</h1>`; i++; continue; }
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      html += `<blockquote><p>${mdInline(escapeHtml(buf.join(" ")))}</p></blockquote>`; continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        let item = lines[i].replace(/^\s*[-*]\s+/, ""); i++;
        // gather wrapped continuation lines (indented)
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i])) { item += " " + lines[i].trim(); i++; }
        buf.push(item);
      }
      html += list(buf, false); continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        let item = lines[i].replace(/^\s*\d+\.\s+/, ""); i++;
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i])) { item += " " + lines[i].trim(); i++; }
        buf.push(item);
      }
      html += list(buf, true); continue;
    }
    const buf = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,4}\s|>\s?|\s*[-*]\s|\s*\d+\.\s|```|---\s*$)/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    html += `<p>${mdInline(escapeHtml(buf.join(" ")))}</p>`;
  }
  return html;
}

const ROLE_LABEL = {
  "recommended-balanced": "Recommended",
  "recommended": "Recommended",
  "fastest-runtime": "Speed extreme",
  "runtime": "Speed extreme",
  "least-memory": "Memory extreme",
  "memory": "Memory extreme",
};
const roleLabel = (r) => ROLE_LABEL[r] || (r || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/* ---------- syntax highlighting (highlight.js, themed via .sol-code .hljs-* in CSS) ---------- */
const HLJS_LANG = {
  "C++": "cpp", "C": "c", "C#": "csharp",
  "Python": "python", "Python3": "python",
  "JavaScript": "javascript", "TypeScript": "typescript",
  "Java": "java", "Go": "go", "Rust": "rust",
  "Kotlin": "kotlin", "Swift": "swift", "Ruby": "ruby",
  "PHP": "php", "Scala": "scala", "Dart": "dart",
  "Elixir": "elixir", "Erlang": "erlang", "Racket": "scheme",
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
    let m; tagRe.lastIndex = 0;
    while ((m = tagRe.exec(line))) {
      if (m[0] === "</span>") open.pop(); else open.push(m[0]);
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
      html = id && hl.getLanguage(id)
        ? hl.highlight(src, { language: id, ignoreIllegals: true }).value
        : hl.highlightAuto(src).value;
    } catch (e) {
      html = escapeHtml(src);
    }
  } else {
    html = escapeHtml(src);
  }
  return splitHighlightedLines(html);
}

function CodeBlock({ code, language }) {
  const lines = useMemo(() => highlightLines(code, language), [code, language]);
  return (
    <pre className="sol-code"><code className="hljs">{lines.map((ln, i) => (
      <div key={i}><span className="ln">{i + 1}</span><span dangerouslySetInnerHTML={{ __html: ln || " " }} /></div>
    ))}</code></pre>
  );
}

function ChallengePage() {
  const [theme, toggleTheme] = usePageTheme();
  const path = window.CCX.qs("path");
  const [state, setState] = useState({ loading: true });
  const [active, setActive] = useState(0);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!path) { setState({ loading: false, error: "No challenge path provided." }); return; }
      try {
        const base = path.replace(/\/$/, "");
        const meta = await fetch(`${base}/metadata.json`, { cache: "no-cache" }).then((r) => {
          if (!r.ok) throw new Error("metadata " + r.status); return r.json();
        });
        const [notes, complexity] = await Promise.all([
          fetch(`${base}/notes.md`).then((r) => (r.ok ? r.text() : "")),
          fetch(`${base}/complexity.md`).then((r) => (r.ok ? r.text() : "")),
        ]);
        const variants = await Promise.all((meta.variants || []).map(async (v) => {
          const code = await fetch(`${base}/${v.file}`).then((r) => (r.ok ? r.text() : "// (file not found)"));
          return { ...v, code };
        }));
        if (alive) setState({ loading: false, meta, notes, complexity, variants, base });
      } catch (e) {
        if (alive) setState({ loading: false, error: e.message });
      }
    }
    load();
    return () => { alive = false; };
  }, [path]);

  return (
    <React.Fragment>
      <InnerNav theme={theme} onToggleTheme={toggleTheme} backHref="index.html" backLabel="Home" />
      <main className="wrap cpage">
        {state.loading && <div className="cloading"><span className="spin" /> Loading solution files…</div>}
        {!state.loading && state.error && (
          <div className="cerror">
            <div className="csection-label">could not load</div>
            <h2 className="serif" style={{ fontSize: 30, marginBottom: 10 }}>This challenge isn’t in the repository yet.</h2>
            <p style={{ color: "var(--ink-2)", maxWidth: 560 }}>
              The viewer reads real files from <code className="mono">{path || "—"}</code>. Add the folder
              (with <code className="mono">metadata.json</code>, <code className="mono">notes.md</code>,
              <code className="mono"> complexity.md</code> and the solution sources) and regenerate
              <code className="mono"> manifest.json</code> — it will render automatically.
            </p>
            <p className="mono" style={{ color: "var(--ink-3)", fontSize: 12.5, marginTop: 14 }}>error: {state.error}</p>
            <a className="btn btn-ghost" href="index.html" style={{ marginTop: 22 }}><Icon name="arrow" size={15} /> Back home</a>
          </div>
        )}
        {!state.loading && state.meta && <ChallengeBody {...state} theme={theme} active={active} setActive={setActive} />}
      </main>
    </React.Fragment>
  );
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
      cur = { title: m[1].trim(), lines: [] };
      sections.push(cur);
    } else {
      if (!cur) { cur = { title: "Overview", lines: [] }; sections.push(cur); }
      cur.lines.push(line);
    }
  }
  return sections
    .filter((s) => s.lines.join("").trim())
    .map((s) => ({ title: s.title, html: parseMarkdown(s.lines.join("\n").trim()) }));
}

function ViewTabs({ views, view, setView }) {
  return (
    <div className="cviews" role="tablist">
      {views.map((vw) => (
        <button
          key={vw.id}
          role="tab"
          className={"cview-tab" + (view === vw.id ? " active" : "")}
          onClick={() => setView(vw.id)}
        >
          <span className="cview-dot" />
          {vw.label}
          {vw.n != null && <span className="cview-n">{vw.n}</span>}
        </button>
      ))}
    </div>
  );
}

function SolutionView({ meta, variants, active, setActive }) {
  const v = variants[active] || variants[0] || {};
  return (
    <div className="cview-panel">
      <div className="sol cviewer code-full">
        <div className="sol-head">
          <div className="sol-dots"><i /><i /><i /></div>
          <span className="sol-path">…/{meta.id}-{meta.slug}/<b>{v.file}</b></span>
          <span className="sol-badge">{roleLabel(v.role)}</span>
        </div>
        <div className="sol-tabs" role="tablist">
          {variants.map((pr, idx) => (
            <div key={pr.file} role="tab" className={"sol-tab" + (idx === active ? " active" : "")} onClick={() => setActive(idx)}>
              <span className="dot" style={{ background: window.CCX.langColor(pr.language) }} />{pr.file}
            </div>
          ))}
        </div>
        <div className="sol-body"><CodeBlock code={v.code} language={v.language} /></div>
      </div>

      <div className="sol-rationale">
        <div className="vrat-cx">
          <div className="cx-row"><span>Time</span><b>{v.timeComplexity || "—"}</b></div>
          <div className="cx-row"><span>Space</span><b>{v.spaceComplexity || "—"}</b></div>
          <div className="cx-row"><span>Role</span><b>{roleLabel(v.role)}</b></div>
        </div>
        <div className="sol-reason">
          {v.languageReason && <div><h5>Why {v.language}</h5><p>{v.languageReason}</p></div>}
          {v.approachJustification && <div><h5>Approach</h5><p>{v.approachJustification}</p></div>}
        </div>
      </div>
    </div>
  );
}

function NotesView({ notes }) {
  const sections = useMemo(() => splitNotesSections(notes), [notes]);
  const [page, setPage] = useState(0);
  const total = sections.length;
  const go = (n) => setPage((p) => Math.max(0, Math.min(total - 1, n)));

  useEffect(() => {
    const onKey = (e) => {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") go(page + 1);
      if (e.key === "ArrowLeft") go(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, total]);

  if (!total) return <div className="cview-panel"><div className="md">No notes.</div></div>;
  const cur = sections[page];

  return (
    <div className="cview-panel">
      <div className="notes-reader">
        <aside className="notes-toc">
          <div className="notes-toc-label">Contents</div>
          <ol>
            {sections.map((s, i) => (
              <li key={i}>
                <button className={i === page ? "active" : ""} onClick={() => go(i)}>
                  <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t">{s.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <div className="notes-stage">
          <article className="notes-page" key={page}>
            <div className="notes-page-kick">
              <span>{String(page + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
              <span className="sep" />
              <span>notes.md</span>
            </div>
            <h2 className="notes-page-title serif">{cur.title}</h2>
            <div className="md" dangerouslySetInnerHTML={{ __html: cur.html }} />
          </article>

          <div className="notes-pager">
            <button className="np-btn" disabled={page === 0} onClick={() => go(page - 1)}>
              <Icon name="arrow" size={15} /> <span>{page > 0 ? sections[page - 1].title : "Start"}</span>
            </button>
            <div className="np-dots">
              {sections.map((_, i) => (
                <button key={i} className={"np-dot" + (i === page ? " active" : "")} onClick={() => go(i)} aria-label={`Page ${i + 1}`} />
              ))}
            </div>
            <button className="np-btn np-next" disabled={page === total - 1} onClick={() => go(page + 1)}>
              <span>{page < total - 1 ? sections[page + 1].title : "End"}</span> <Icon name="arrow" size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplexityView({ complexity, variants }) {
  return (
    <div className="cview-panel">
      <div className="cgrid2">
        <div>
          <div className="csection-label">comparison</div>
          <div className="ctable">
            <div className="ctable-row ctable-head"><div>Proposal</div><div>Time</div><div>Space</div><div>Goal</div></div>
            {variants.map((pr) => (
              <div className="ctable-row" key={pr.file}>
                <div className="nm"><span className="d" style={{ background: window.CCX.langColor(pr.language) }} />{pr.file}</div>
                <div className="cx">{pr.timeComplexity}</div>
                <div className="cx">{pr.spaceComplexity}</div>
                <div className="gl">{roleLabel(pr.role)}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="csection-label">complexity.md</div>
          <div className="md md-compact" dangerouslySetInnerHTML={{ __html: parseMarkdown(complexity) }} />
        </div>
      </div>
    </div>
  );
}

function ReasoningView({ meta }) {
  const refs = meta.crossReferences && meta.crossReferences.length ? meta.crossReferences : (meta.patterns || []).map((p) => "patterns/" + p);
  return (
    <div className="cview-panel">
      {meta.reasoningSummary && (
        <div className="reason-hero">
          <div className="csection-label">reasoning summary</div>
          <p className="serif">{meta.reasoningSummary}</p>
        </div>
      )}
      {!!refs.length && (
        <div className="cblock" style={{ marginTop: meta.reasoningSummary ? 40 : 0 }}>
          <div className="csection-label">patterns &amp; cross-references</div>
          <div className="pat-cloud">
            {refs.map((x) => <span className="pat" key={x}>{x}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- DISCUSS (giscus: one thread per challenge, themed to the site) ---------- */
const GISCUS = {
  repo: "danielPoloWork/coding-challenges",
  repoId: "R_kgDOSuTg7Q",
  category: "Comments",
  categoryId: "DIC_kwDOSuTg7c4C-oTd",
};
/* giscus has no warm-paper preset; the noborder_* built-ins drop GitHub's own
   frame so the widget blends into our panel chrome. (A pixel-matched clay theme
   would be a custom CSS URL — only loads on the deployed origin, not localhost.) */
const giscusTheme = (t) => (t === "dark" ? "noborder_dark" : "noborder_light");

function DiscussView({ meta, theme }) {
  const ref = useRef(null);
  const term = `${meta.platform}/${meta.id}-${meta.slug}`;

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
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "top",
      "data-theme": giscusTheme(theme),
      "data-lang": "en",
    }).forEach(([k, v]) => s.setAttribute(k, v));
    el.appendChild(s);
    return () => { el.innerHTML = ""; };
    // theme deliberately excluded — toggling is handled live below, without reload
  }, [term]);

  /* Live theme switch: message the loaded iframe instead of rebuilding it. */
  useEffect(() => {
    const frame = ref.current && ref.current.querySelector("iframe.giscus-frame");
    if (!frame) return;
    frame.contentWindow.postMessage(
      { giscus: { setConfig: { theme: giscusTheme(theme) } } },
      "https://giscus.app"
    );
  }, [theme]);

  return (
    <div className="cview-panel">
      <div className="discuss">
        <div className="csection-label">discussion</div>
        <div className="discuss-mount" ref={ref} />
        <p className="discuss-foot">
          <Icon name="github" size={13} /> Sign in with GitHub to comment · powered by GitHub Discussions
        </p>
      </div>
    </div>
  );
}

function ChallengeBody({ meta, notes, complexity, variants, active, setActive, theme }) {
  const diff = meta.difficulty || "—";
  const [view, setView] = useState("solution");

  const hasReasoning = !!(meta.reasoningSummary || (meta.crossReferences && meta.crossReferences.length) || (meta.patterns && meta.patterns.length));
  const views = [
    { id: "solution", label: "Solution", n: variants.length },
    { id: "notes", label: "Notes" },
  ];
  if (complexity) views.push({ id: "complexity", label: "Complexity" });
  if (hasReasoning) views.push({ id: "reasoning", label: "Reasoning" });
  views.push({ id: "discuss", label: "Discuss" });

  return (
    <React.Fragment>
      <div className="crumb">
        <a href="index.html">platforms</a><span className="sep">/</span>
        <a href={`src/platform.html?platform=${meta.platform}`}>{meta.platform}</a><span className="sep">/</span>
        <b>{meta.id}-{meta.slug}</b>
      </div>

      <div className="chead">
        <span className="cid-pill">#{meta.id}</span>
        <h1>{meta.title}</h1>
        <div className="cmeta">
          <span className="chip solid" style={{ background: window.CCX.diffColor(diff) }}>{diff}</span>
          <span className="chip"><span className="d" style={{ background: window.CCX.langColor(meta.language) }} />{meta.language}</span>
          {(meta.topics || []).map((tp) => <span className="chip" key={tp}>{tp}</span>)}
          {(meta.patterns || []).map((p) => <span className="chip" key={p}><span className="d" style={{ background: "var(--clay)" }} />{p}</span>)}
          {meta.url && <a className="chip" href={meta.url} target="_blank" rel="noopener" style={{ color: "var(--clay)" }}>source <Icon name="external" size={13} /></a>}
        </div>
        {meta.note && <p className="cnote">{meta.note}</p>}
      </div>

      <ViewTabs views={views} view={view} setView={setView} />

      {view === "solution" && <SolutionView meta={meta} variants={variants} active={active} setActive={setActive} />}
      {view === "notes" && <NotesView notes={notes} />}
      {view === "complexity" && complexity && <ComplexityView complexity={complexity} variants={variants} />}
      {view === "reasoning" && hasReasoning && <ReasoningView meta={meta} />}
      {view === "discuss" && <DiscussView meta={meta} theme={theme} />}
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ChallengePage />);
