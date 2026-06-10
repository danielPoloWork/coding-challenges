/* Coding Challenges — home motion layer (GSAP, progressive enhancement).
   Plain script, loaded after gsap and before the babel components. Every
   entry point no-ops when gsap failed to load or the user prefers reduced
   motion, so the page renders static with zero behavioural difference.
   Scroll-triggered effects additionally respect the "Scroll reveal" tweak
   (app.jsx mirrors it on <html> as the reveal-ready class). */
window.CCFX = (function () {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const available = !!window.gsap && !reduced;
  const scrollFx = () => available && document.documentElement.classList.contains("reveal-ready");

  /* run cb once, the first time el is (or comes) into view */
  function inView(el, cb) {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.92 && r.bottom > 0) { cb(); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); cb(); }
    }, { threshold: 0.18 });
    io.observe(el);
  }

  /* hero entrance: badge → headline (blur-in) → lede → CTAs → stats card,
     over a slow fade of the grid backdrop, then a gentle scroll parallax.
     Called from a layout effect, so the gsap.from() initial state is applied
     before first paint — no flash of unanimated content. */
  let heroDone = false;
  function heroIntro() {
    if (!available || heroDone) return;
    heroDone = true;
    const items = gsap.utils.toArray(".hero [data-fx]");
    if (!items.length) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero-grid-bg", { opacity: 0, duration: 1.6, ease: "power1.out" }, 0)
      .from(items, { y: 28, opacity: 0, duration: 0.9, stagger: 0.11 }, 0.08)
      .from(".hero-title", {
        filter: "blur(9px)", duration: 1.0, stagger: 0.12,
        clearProps: "filter",
      }, 0.08);

    const bg = document.querySelector(".hero-grid-bg");
    if (bg) {
      const setY = gsap.quickSetter(bg, "y", "px");
      addEventListener("scroll", () => setY(scrollY * 0.16), { passive: true });
    }
  }

  /* timeline chart: bars grow from the baseline; heatmap cells ripple in.
     Re-runs on every window change (the dropdown), first time waits for view.
     Cells animate scale only — their inline opacity carries the intensity. */
  function chartIn(container) {
    if (!scrollFx() || !container) return;
    inView(container, () => {
      const bars = container.querySelectorAll(".tl-bar");
      if (bars.length) gsap.from(bars, {
        scaleY: 0, transformOrigin: "50% 100%", duration: 0.7,
        ease: "power3.out", stagger: 0.015, clearProps: "transform",
      });
      const cells = container.querySelectorAll(".hm-cell:not(.pad)");
      if (cells.length) gsap.from(cells, {
        scale: 0.4, duration: 0.45, ease: "back.out(2)",
        stagger: { each: 0.0035 }, clearProps: "transform",
      });
    });
  }

  /* skill-gap difficulty bars fill from the left when scrolled into view */
  function growBars(container) {
    if (!scrollFx() || !container) return;
    inView(container, () => {
      const fills = container.querySelectorAll(".gap-fill");
      if (fills.length) gsap.from(fills, {
        scaleX: 0, transformOrigin: "0 50%", duration: 0.9,
        ease: "power3.out", stagger: 0.14, clearProps: "transform",
      });
    });
  }

  return { available, heroIntro, chartIn, growBars, inView };
})();
