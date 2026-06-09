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

  // Learning timeline: bucket challenges by their dateSolved so the home can
  // show solving cadence. Granularity adapts to the span (daily for a few
  // weeks, monthly once it stretches past a quarter) so the band stays
  // readable as the catalogue grows. Gaps are filled with 0 for an honest axis.
  const DAY_MS = 86400000;
  function deriveTimeline(chs) {
    const dated = chs.map((c) => c.dateSolved).filter(Boolean).sort();
    if (!dated.length) return null;
    const first = dated[0], last = dated[dated.length - 1];
    const start = new Date(first + "T00:00:00Z");
    const end = new Date(last + "T00:00:00Z");
    const span = Math.round((end - start) / DAY_MS) + 1;
    const unit = span <= 92 ? "day" : "month";

    const counts = {};
    dated.forEach((d) => {
      const key = unit === "day" ? d : d.slice(0, 7);
      counts[key] = (counts[key] || 0) + 1;
    });

    const buckets = [];
    if (unit === "day") {
      for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) {
        const d = new Date(t), key = d.toISOString().slice(0, 10);
        buckets.push({ key, count: counts[key] || 0,
          label: d.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" }) });
      }
    } else {
      const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
      while (cur <= end) {
        const key = cur.toISOString().slice(0, 7);
        buckets.push({ key, count: counts[key] || 0,
          label: cur.toLocaleDateString("en", { month: "short", year: "2-digit", timeZone: "UTC" }) });
        cur.setUTCMonth(cur.getUTCMonth() + 1);
      }
    }

    const peak = buckets.reduce((a, b) => (b.count > a.count ? b : a), buckets[0]);
    return { unit, buckets, total: dated.length, activeDays: new Set(dated).size, first, last, peak };
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

    return { platforms, patterns, topics, languages, totals, featured, challenges: chs, timeline: deriveTimeline(chs) };
  }

  return { LANG_COLORS, langColor, diffColor, diffRank, loadManifest, platformMeta, deriveHome, initTheme, setTheme, qs };
})();
