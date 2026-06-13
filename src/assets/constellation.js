/* GENERATED from src/assets/constellation.jsx by scripts/build-jsx.mjs — edit the .jsx, not this file. */
/* Coding Challenges — pattern constellation (home signature piece).
   Every solved challenge is a node; an ink line links two challenges that
   share a pattern. Layout is a small hand-rolled force simulation (no
   libraries): shared topics act as invisible weak springs, so topically
   related work drifts together even when no pattern is shared. Canvas-based,
   theme-aware (colors are read from CSS custom properties at draw time),
   honours prefers-reduced-motion by settling the simulation synchronously. */

function buildConstellation(challenges) {
  const nodes = challenges.map(c => ({
    c,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: 5 + Math.min(6, (c.patterns || []).length * 1.1)
  }));
  const pEdges = [],
    tEdges = [];
  for (let a = 0; a < nodes.length; a++) {
    for (let b = a + 1; b < nodes.length; b++) {
      const A = nodes[a].c,
        B = nodes[b].c;
      const shared = (A.patterns || []).filter(p => (B.patterns || []).includes(p));
      if (shared.length) pEdges.push({
        a,
        b,
        w: shared.length,
        shared
      });else if ((A.topics || []).some(t => (B.topics || []).includes(t))) tEdges.push({
        a,
        b
      });
    }
  }
  // neighbour lookup for hover highlighting (pattern links only)
  const nbr = nodes.map(() => new Set());
  pEdges.forEach(e => {
    nbr[e.a].add(e.b);
    nbr[e.b].add(e.a);
  });
  return {
    nodes,
    pEdges,
    tEdges,
    nbr
  };
}
function Constellation({
  challenges
}) {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const [focusIdx, setFocusIdx] = useState(-1);
  const graph = useMemo(() => challenges && challenges.length >= 3 ? buildConstellation(challenges) : null, [challenges]);
  useEffect(() => {
    if (!graph) return;
    const canvas = canvasRef.current,
      box = boxRef.current;
    const ctx = canvas.getContext("2d");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const st = {
      w: 0,
      h: 0,
      alpha: 1,
      raf: 0,
      hover: -1,
      selected: -1
    };
    const {
      nodes,
      pEdges,
      tEdges,
      nbr
    } = graph;
    const css = () => getComputedStyle(document.documentElement);
    const cvar = name => css().getPropertyValue(name).trim();

    // the stage height is fixed by CSS (content-independent), so the canvas just
    // fills it — the box never resizes when the inspector content changes.
    function size() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      st.w = box.clientWidth;
      st.h = box.clientHeight;
      canvas.width = st.w * dpr;
      canvas.height = st.h * dpr;
      canvas.style.height = st.h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // seed on a loose ring so the simulation unfolds instead of exploding
    function seed() {
      const cx = st.w / 2,
        cy = st.h / 2,
        R = Math.min(st.w, st.h) * 0.34;
      nodes.forEach((n, i) => {
        const a = i * 2.39996; // golden angle
        n.x = cx + Math.cos(a) * R * (0.55 + 0.45 * (i * 7919 % 97) / 97);
        n.y = cy + Math.sin(a) * R * (0.55 + 0.45 * (i * 104729 % 89) / 89);
        n.vx = n.vy = 0;
      });
    }
    function tick() {
      const cx = st.w / 2,
        cy = st.h / 2,
        a = st.alpha;
      // pairwise repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const A = nodes[i],
            B = nodes[j];
          let dx = B.x - A.x,
            dy = B.y - A.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 1) d2 = 1;
          const f = 2400 / d2 * a,
            d = Math.sqrt(d2);
          dx /= d;
          dy /= d;
          A.vx -= dx * f;
          A.vy -= dy * f;
          B.vx += dx * f;
          B.vy += dy * f;
        }
      }
      const spring = (e, rest, k) => {
        const A = nodes[e.a],
          B = nodes[e.b];
        let dx = B.x - A.x,
          dy = B.y - A.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - rest) * k * a;
        dx /= d;
        dy /= d;
        A.vx += dx * f;
        A.vy += dy * f;
        B.vx -= dx * f;
        B.vy -= dy * f;
      };
      pEdges.forEach(e => spring(e, 74, 0.05 + 0.012 * e.w));
      tEdges.forEach(e => spring(e, 165, 0.0045));
      nodes.forEach(n => {
        n.vx += (cx - n.x) * 0.012 * a;
        n.vy += (cy - n.y) * 0.012 * a;
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x += n.vx;
        n.y += n.vy;
        const m = n.r + 14;
        n.x = Math.max(m, Math.min(st.w - m, n.x));
        n.y = Math.max(m, Math.min(st.h - m, n.y));
      });
      st.alpha *= 0.991;
    }
    function draw() {
      // resting links use --ink-3 (a mid grey, legible on both surfaces) rather
      // than the near-invisible --hairline; clay is reserved for the hover focus.
      const ink = cvar("--ink"),
        rest = cvar("--ink-3"),
        clay = cvar("--clay");
      const hov = st.hover,
        dim = hov >= 0;
      const lit = dim ? new Set([hov, ...nbr[hov]]) : null;
      ctx.clearRect(0, 0, st.w, st.h);
      pEdges.forEach(e => {
        const on = dim && (e.a === hov || e.b === hov);
        ctx.globalAlpha = dim ? on ? 0.9 : 0.08 : e.w > 1 ? 0.6 : 0.45;
        ctx.strokeStyle = on ? clay : rest;
        ctx.lineWidth = on ? 1.6 : e.w > 1 ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(nodes[e.a].x, nodes[e.a].y);
        ctx.lineTo(nodes[e.b].x, nodes[e.b].y);
        ctx.stroke();
      });
      nodes.forEach((n, i) => {
        const on = !dim || lit.has(i);
        ctx.globalAlpha = on ? 1 : 0.14;
        ctx.fillStyle = window.CCX.diffColor(n.c.difficulty);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, 7);
        ctx.fill();
        ctx.strokeStyle = i === hov ? clay : ink;
        ctx.globalAlpha = on ? i === hov ? 1 : 0.35 : 0.1;
        ctx.lineWidth = i === hov ? 2 : 1;
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }
    function loop() {
      tick();
      draw();
      st.raf = st.alpha > 0.02 ? requestAnimationFrame(loop) : 0;
    }
    function start() {
      cancelAnimationFrame(st.raf);
      if (reduced) {
        while (st.alpha > 0.02) tick();
        draw();
      } else {
        st.raf = requestAnimationFrame(loop);
      }
    }
    size();
    seed();
    st.alpha = 1;
    // start when scrolled into view, like the other data sections
    window.CCFX.inView(box, start);

    // ---- interaction ----
    const nodeAt = (x, y) => {
      let best = -1,
        bd = 1e9;
      nodes.forEach((n, i) => {
        const d = (n.x - x) ** 2 + (n.y - y) ** 2;
        if (d < (n.r + 7) ** 2 && d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    };
    const idxAt = ev => {
      const r = canvas.getBoundingClientRect();
      return nodeAt(ev.clientX - r.left, ev.clientY - r.top);
    };
    const setHover = i => {
      if (i !== st.hover) {
        st.hover = i;
        if (!st.raf) draw();
      }
    };
    const open = i => {
      window.location.href = `src/challenge.html?path=${encodeURIComponent(nodes[i].c.path)}`;
    };

    // Mouse: hover previews into the inspector, click opens. Touch/pen: first tap
    // selects (previews), a second tap on the same node opens — so there's always
    // a preview before navigating. The inspector's button is the explicit path.
    const onMove = ev => {
      if (ev.pointerType && ev.pointerType !== "mouse") return;
      const i = idxAt(ev);
      canvas.style.cursor = i >= 0 ? "pointer" : "default";
      setHover(i);
      setFocusIdx(i);
    };
    const onLeave = ev => {
      if (ev.pointerType && ev.pointerType !== "mouse") return;
      st.selected = -1;
      setHover(-1);
      setFocusIdx(-1);
    };
    const onUp = ev => {
      const i = idxAt(ev);
      if (ev.pointerType === "mouse") {
        if (i >= 0) open(i);
        return;
      }
      if (i < 0) {
        st.selected = -1;
        setHover(-1);
        setFocusIdx(-1);
        return;
      }
      if (st.selected === i) {
        open(i);
        return;
      }
      st.selected = i;
      setHover(i);
      setFocusIdx(i);
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerup", onUp);

    // redraw on theme toggle (canvas colors don't follow CSS vars on their own)
    const mo = new MutationObserver(() => {
      if (!st.raf) draw();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-accent"]
    });

    // reflow on resize: re-fit the box and let the layout re-settle briefly
    const ro = new ResizeObserver(() => {
      const w = st.w,
        h = st.h;
      size();
      if (Math.abs(st.w - w) > 4 || Math.abs(st.h - h) > 4) {
        st.alpha = Math.max(st.alpha, 0.25);
        start();
      } else if (!st.raf) draw();
    });
    ro.observe(box);
    return () => {
      cancelAnimationFrame(st.raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerup", onUp);
      mo.disconnect();
      ro.disconnect();
    };
  }, [graph]);
  if (!graph) return null;
  const links = graph.pEdges.length;
  const focus = focusIdx >= 0 && focusIdx < graph.nodes.length ? graph.nodes[focusIdx].c : null;
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "constellation"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sec-no"
  }, "08"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Pattern constellation"), /*#__PURE__*/React.createElement("h2", null, "How the work clusters."), /*#__PURE__*/React.createElement("p", null, "Every solved challenge is a star; a line joins two challenges that share a pattern. Topically related work drifts together on its own. Hover a star to inspect it on the right."))), /*#__PURE__*/React.createElement("div", {
    className: "const-box reveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "const-stage",
    ref: boxRef
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    style: {
      display: "block",
      width: "100%"
    }
  })), /*#__PURE__*/React.createElement("aside", {
    className: "const-inspector"
  }, !focus ? /*#__PURE__*/React.createElement("div", {
    className: "ins-rest"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Pattern map"), /*#__PURE__*/React.createElement("div", {
    className: "ins-stats"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, challenges.length), /*#__PURE__*/React.createElement("span", null, "challenges")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, links), /*#__PURE__*/React.createElement("span", null, "pattern links"))), /*#__PURE__*/React.createElement("div", {
    className: "ins-legend"
  }, ["Easy", "Medium", "Hard"].map(d => /*#__PURE__*/React.createElement("span", {
    key: d
  }, /*#__PURE__*/React.createElement("span", {
    className: "ddot",
    style: {
      background: window.CCX.diffColor(d)
    }
  }), d))), /*#__PURE__*/React.createElement("p", {
    className: "ins-hint"
  }, "Hover a star to inspect it; click to open. On touch, tap to preview, then tap again to open.")) : /*#__PURE__*/React.createElement("div", {
    className: "ins-detail",
    key: focusIdx
  }, /*#__PURE__*/React.createElement("span", {
    className: "ins-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ddot",
    style: {
      background: window.CCX.diffColor(focus.difficulty)
    }
  }), focus.platform, " ", focus.id, " \xB7 ", focus.difficulty), /*#__PURE__*/React.createElement("h3", {
    className: "ins-title"
  }, focus.title), (focus.patterns || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "ins-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Patterns"), /*#__PURE__*/React.createElement("div", {
    className: "ins-chips"
  }, focus.patterns.map(p => /*#__PURE__*/React.createElement("a", {
    className: "ins-chip",
    key: p,
    href: `src/pattern.html?p=${encodeURIComponent(p)}`
  }, p)))), (focus.topics || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "ins-topics mono"
  }, focus.topics.join(" · ")), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-primary ins-open",
    href: `src/challenge.html?path=${encodeURIComponent(focus.path)}`
  }, "Open challenge ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 16
  })))))));
}
Object.assign(window, {
  Constellation
});
