/* Coding Challenges — shared UI (hooks destructure, Icon set, inner-page nav).
   Loaded first on every page. Top-level decls are shared across babel scripts,
   so declare React hooks + Icon here exactly once. */
const { useState, useEffect, useRef, useMemo } = React;

function Icon({ name, size = 17 }) {
  const p = {
    sun: <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.4 19.6l1.7-1.7M17.9 6.1l1.7-1.7"/></g>,
    moon: <path fill="currentColor" d="M20 14.4A8 8 0 1 1 9.6 4a6.4 6.4 0 0 0 10.4 10.4Z"/>,
    arrow: <path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M5 12h13M13 6l6 6-6 6"/>,
    github: <path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>,
    search: <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/></g>,
    x: <path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" d="M6 6l12 12M18 6 6 18"/>,
    caret: <path fill="currentColor" d="M12 15.5 6.5 10h11z"/>,
    chevron: <path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6"/>,
    file: <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M6 3h7l5 5v13H6z"/><path d="M13 3v5h5"/></g>,
    external: <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 5h5v5"/><path d="M19 5l-7 7"/><path d="M18 13v6H5V6h6"/></g>,
    sortable: <g fill="currentColor"><path d="M12 4l4 5H8z"/><path d="M12 20l-4-5h8z" opacity="0.4"/></g>,
  }[name];
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{p}</svg>;
}

/* Inner-page top bar (platform + challenge pages) */
function InnerNav({ theme, onToggleTheme, backHref = "index.html", backLabel = "Home" }) {
  return (
    <nav className="nav scrolled">
      <div className="nav-inner">
        <a className="brand" href="index.html">
          <span className="brand-mark">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8.5 7 H23.5" />
              <path d="M8.5 7 C8.5 13.5 11.5 18 16 18 C20.5 18 23.5 13.5 23.5 7" />
              <path d="M8.5 7.5 L5 10 L8.5 12.5" />
              <path d="M23.5 7.5 L27 10 L23.5 12.5" />
              <path d="M18 9.5 L14 15" />
              <path d="M16 18 V22" />
              <path d="M11.5 24 H20.5" />
            </svg>
          </span>
          <span className="brand-name">Coding&nbsp;<b>Challenges</b></span>
        </a>
        <div className="nav-spacer" />
        <div className="nav-actions">
          <a className="cback" href={backHref}><Icon name="arrow" size={14} /> {backLabel}</a>
          <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
            <Icon name={theme === "dark" ? "sun" : "moon"} />
          </button>
        </div>
      </div>
    </nav>
  );
}

/* shared theme hook for standalone pages */
function usePageTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("cc-theme") || "light");
  useEffect(() => { window.CCX.setTheme(theme); }, [theme]);
  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}
