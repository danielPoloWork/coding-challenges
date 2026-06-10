/* Coding Challenges — shared runtime core (manifest loader + helpers)
   Plain script (no Babel). Exposes window.CCX. Works on GitHub Pages with
   relative paths, so the whole site reads the real files under /platforms. */
window.CCX = (function () {
  const LANG_COLORS = {
    "C++": "#6e8fd6", "C": "#8d96a8", "Rust": "#cd7f52", "Go": "#4fc3d9",
    "Python3": "#5394d0", "Python": "#5394d0", "TypeScript": "#4a7bd0",
    "JavaScript": "#d8b832", "Java": "#d0743a", "C#": "#6a4fb0", "Kotlin": "#9a6bd0",
    "Swift": "#e06a4a", "Ruby": "#c0392b", "PHP": "#6d7fb8", "Dart": "#3aa6b9",
    "Scala": "#cc4030", "Elixir": "#8c6bb0", "Erlang": "#aa3355", "Racket": "#9a3b8c",
  };
  const DIFF_COLORS = { Easy: "#3f9e6a", Medium: "#c98a2a", Hard: "#c0503a" };
  const DIFF_RANK = { Easy: 0, Medium: 1, Hard: 2 };

  const langColor = (l) => LANG_COLORS[l] || "#8a857a";
  const diffColor = (d) => DIFF_COLORS[d] || "#8a857a";
  const diffRank = (d) => (d in DIFF_RANK ? DIFF_RANK[d] : 99);

  let _manifest = null;
  async function loadManifest() {
    if (_manifest) return _manifest;
    const res = await fetch("platforms/manifest.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("manifest " + res.status);
    _manifest = await res.json();
    return _manifest;
  }

  function platformMeta(manifest, id) {
    return (manifest.platforms || []).find((p) => p.id === id) || null;
  }

  // theme (shared across pages via localStorage)
  function initTheme() {
    const t = localStorage.getItem("cc-theme") || "light";
    document.documentElement.setAttribute("data-theme", t);
    return t;
  }
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("cc-theme", t);
  }

  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }

  // ---------- minimal markdown -> html (shared by challenge + article pages) ----------
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

  // Learning timeline: bucket challenges by their dateSolved so the home can
  // show solving cadence over a selectable window. The visualization adapts to
  // the window's density: short fixed windows (week/month) use daily bars where
  // exact counts are readable; "year" uses a GitHub-style weekly heatmap (365
  // points would drown a bar chart); "all" keeps adaptive bars (daily up to a
  // quarter, monthly beyond — a multi-year heatmap would not fit the page).
  // Gaps are filled with 0 for an honest axis.
  const DAY_MS = 86400000;
  const dayKey = (d) => d.toISOString().slice(0, 10);

  function deriveTimeline(chs, range) {
    range = range || "all";
    const dated = chs.map((c) => c.dateSolved).filter(Boolean).sort();
    if (!dated.length) return null;

    const counts = {};
    dated.forEach((d) => { counts[d] = (counts[d] || 0) + 1; });

    const fmtLong = (d) => d.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
    const fmtShort = (d) => d.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });

    // calendar-anchored windows: "this year/month/week/today"; "all" spans
    // first→last solve. Periods may extend past today (a week in progress) —
    // days after today are flagged `future` so the axis shows the full period
    // without pretending those days were inactive.
    const today = new Date(dayKey(new Date()) + "T00:00:00Z");
    const todayKey = dayKey(today);
    const y = today.getUTCFullYear(), mo = today.getUTCMonth();
    const monday = new Date(today.getTime() - ((today.getUTCDay() + 6) % 7) * DAY_MS);
    let start, end, windowText, windowTag;
    if (range === "year") {
      start = new Date(Date.UTC(y, 0, 1)); end = new Date(Date.UTC(y, 11, 31));
      windowText = String(y); windowTag = "this year";
    } else if (range === "month") {
      start = new Date(Date.UTC(y, mo, 1)); end = new Date(Date.UTC(y, mo + 1, 0));
      windowText = today.toLocaleDateString("en", { month: "long", year: "numeric", timeZone: "UTC" });
      windowTag = "this month";
    } else if (range === "week") {
      start = monday; end = new Date(monday.getTime() + 6 * DAY_MS);
      windowText = `${fmtShort(start)} → ${fmtShort(end)}, ${y}`; windowTag = "this week";
    } else if (range === "today") {
      start = today; end = today;
      windowText = fmtLong(today); windowTag = "today";
    } else {
      start = new Date(dated[0] + "T00:00:00Z");
      end = new Date(dated[dated.length - 1] + "T00:00:00Z");
      windowText = `${fmtShort(start)}, ${start.getUTCFullYear()} → ${fmtShort(end)}, ${end.getUTCFullYear()}`;
      windowTag = "span";
    }
    const winStart = dayKey(start), winEnd = dayKey(end);

    const inWin = dated.filter((d) => d >= winStart && d <= winEnd);
    const total = inWin.length;
    const activeDays = new Set(inWin).size;
    const base = { range, total, activeDays, windowText, windowTag, winStart, winEnd };

    if (range === "all" || range === "year") {
      // GitHub-style heatmap: columns = weeks (Monday-start), rows = weekdays.
      // "year" starts at Jan 1, "all" at the first solve; both run to today
      // (no blank trailing columns for days that haven't happened yet).
      const startDow = (start.getUTCDay() + 6) % 7; // Mon = 0
      const gridStart = new Date(start.getTime() - startDow * DAY_MS);
      const weeks = [];
      let peak = { key: null, count: 0, label: "" };
      let cur = gridStart;
      while (cur <= today) {
        const week = [];
        for (let i = 0; i < 7; i++) {
          const key = dayKey(cur);
          const pad = cur < start || cur > today;
          const count = pad ? 0 : (counts[key] || 0);
          const label = fmtShort(cur);
          if (count > peak.count) peak = { key, count, label };
          week.push({ key, count, pad, label });
          cur = new Date(cur.getTime() + DAY_MS);
        }
        weeks.push(week);
      }
      // left-pad with empty out-of-window weeks so the grid always spans the
      // full band and the current week sits at the right edge
      const FILL_WEEKS = 53;
      while (weeks.length < FILL_WEEKS) {
        const firstMonday = new Date(weeks[0][0].key + "T00:00:00Z");
        const w = [];
        for (let i = 7; i >= 1; i--) {
          const d = new Date(firstMonday.getTime() - i * DAY_MS);
          w.push({ key: dayKey(d), count: 0, pad: true, label: fmtShort(d) });
        }
        weeks.unshift(w);
      }
      // month labels only over weeks that carry window days (not the padding)
      const months = [];
      let prevMonth = null;
      weeks.forEach((w, i) => {
        const anchor = w.find((c) => !c.pad);
        if (!anchor) return;
        const m = anchor.key.slice(0, 7);
        if (m !== prevMonth) {
          months.push({ at: i, label: new Date(anchor.key + "T00:00:00Z").toLocaleDateString("en", { month: "short", timeZone: "UTC" }) });
          prevMonth = m;
        }
      });
      return { ...base, mode: "heat", unit: "day", weeks, months, peak, max: peak.count || 1 };
    }

    // daily bars for the short calendar windows (month / week / today), where
    // each day's exact count is readable and worth reading
    const buckets = [];
    for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) {
      const d = new Date(t), key = dayKey(d);
      buckets.push({ key, count: counts[key] || 0, future: key > todayKey,
        label: d.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" }) });
    }
    const peak = buckets.reduce((a, b) => (b.count > a.count ? b : a), buckets[0]);
    return { ...base, mode: "bars", unit: "day", buckets, peak, max: peak.count || 1 };
  }

  // Skill-gap analysis: coverage and imbalance, derived from the manifest.
  // CORE_TOPICS is the reference set of interview-grade domains (LeetCode's
  // canonical topic names, which metadata.json already follows) — it lets the
  // analysis say "untouched" about domains with zero solves, which raw counts
  // alone can never reveal.
  const CORE_TOPICS = [
    "Array", "String", "Hash Table", "Linked List", "Stack", "Queue",
    "Tree", "Graph", "Heap (Priority Queue)", "Trie", "Matrix",
    "Dynamic Programming", "Greedy", "Backtracking", "Divide and Conquer",
    "Binary Search", "Sorting", "Two Pointers", "Sliding Window",
    "Depth-First Search", "Breadth-First Search", "Union Find",
    "Math", "Bit Manipulation", "Prefix Sum", "Monotonic Stack",
  ];

  function deriveSkillGaps(chs) {
    if (!chs || !chs.length) return null;

    const difficulty = ["Easy", "Medium", "Hard"].map((name) => ({
      name, count: chs.filter((c) => c.difficulty === name).length,
    }));
    difficulty.forEach((d) => { d.share = Math.round(d.count / chs.length * 100); });

    const topicMap = {};
    chs.forEach((c) => (c.topics || []).forEach((t) => { topicMap[t] = (topicMap[t] || 0) + 1; }));
    const untouched = CORE_TOPICS.filter((t) => !topicMap[t]);
    const thin = Object.entries(topicMap).filter(([, n]) => n === 1)
      .map(([name]) => name).sort((a, b) => a.localeCompare(b));

    const patMap = {};
    chs.forEach((c) => (c.patterns || []).forEach((p) => { patMap[p] = (patMap[p] || 0) + 1; }));
    const patTotal = Object.keys(patMap).length;
    const patSingle = Object.values(patMap).filter((n) => n === 1).length;

    const platformsUsed = new Set(chs.map((c) => c.platform)).size;

    return { difficulty, untouched, thin, coreTotal: CORE_TOPICS.length,
      topicsTouched: Object.keys(topicMap).length, patTotal, patSingle, platformsUsed };
  }

  // Derive everything the homepage needs from the manifest (fully dynamic).
  function deriveHome(manifest) {
    const chs = manifest.challenges || [];
    const counts = {};
    chs.forEach((c) => { counts[c.platform] = (counts[c.platform] || 0) + 1; });
    const platforms = (manifest.platforms || [])
      .map((p) => ({ ...p, count: counts[p.id] || 0 }))
      .sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id, "en", { sensitivity: "base" }));

    const patMap = {};
    chs.forEach((c) => (c.patterns || []).forEach((p) => { patMap[p] = (patMap[p] || 0) + 1; }));
    const patterns = Object.entries(patMap).map(([name, n]) => ({ name, n }))
      .sort((a, b) => b.n - a.n);

    // languages: aggregate across each challenge's full language list (a
    // single challenge may be solved in several languages)
    const langMap = {};
    chs.forEach((c) => (c.languages || [c.language]).forEach((l) => { langMap[l] = (langMap[l] || 0) + 1; }));
    const languages = Object.entries(langMap).sort((a, b) => b[1] - a[1])
      .map(([name, n]) => ({ name, n, c: langColor(name) }));

    // topics: per-topic counts power the home "Topic explorer" teaser and the
    // "catalogued patterns" figure (distinct topics across everything).
    const topicMap = {};
    chs.forEach((c) => (c.topics || []).forEach((t) => { topicMap[t] = (topicMap[t] || 0) + 1; }));
    const topics = Object.entries(topicMap).map(([name, n]) => ({ name, n }))
      .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));

    const totals = {
      challenges: chs.length,
      platforms: platforms.filter((p) => p.count > 0).length,
      catalogued: manifest.catalogued != null ? manifest.catalogued : (manifest.platforms || []).length,
      languages: languages.length,
      patterns: patterns.length,
      topics: topics.length,
    };

    // featured: curated ids first, then fill
    const wanted = ["3900", "3743", "0912", "3635", "3266", "0217"];
    const byId = {};
    chs.forEach((c) => { if (!(c.id in byId)) byId[c.id] = c; });
    let featured = wanted.map((id) => byId[id]).filter(Boolean);
    if (featured.length < 6) {
      for (const c of chs) { if (!featured.includes(c)) featured.push(c); if (featured.length >= 6) break; }
    }
    featured = featured.slice(0, 6);

    return { platforms, patterns, topics, languages, totals, featured, challenges: chs,
      articles: manifest.articles || [] };
  }

  return { LANG_COLORS, langColor, diffColor, diffRank, loadManifest, platformMeta, deriveHome, deriveTimeline, deriveSkillGaps, initTheme, setTheme, qs, escapeHtml, parseMarkdown };
})();
