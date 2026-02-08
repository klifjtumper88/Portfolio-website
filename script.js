document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     WATER REVEAL + FLOAT
     ========================= */
  const reveals = Array.from(document.querySelectorAll(".reveal"));

  // assign stagger delays automatically (so it feels “flowing”)
  reveals.forEach((el, i) => {
    el.style.setProperty("--delay", `${i * 70}ms`);

    // alternate float styles for more organic motion
    if (i % 2 === 0) el.classList.add("floaty");
    else el.classList.add("floaty2");
  });

  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("show");
        revealObs.unobserve(e.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -10% 0px" }
  );

  reveals.forEach((el) => revealObs.observe(el));

  /* =========================
     PROJECT SLIDER (TRUE RAIL)
     - FIX CLICK ON LINKS
     ========================= */
  const stage = document.querySelector("#projectStage");
  const rail = document.querySelector("#projectRail");
  const panels = Array.from(document.querySelectorAll(".project-panel"));
  const fill = document.querySelector("#progressFill");
  const text = document.querySelector("#progressText");

  if (!stage || !rail || panels.length === 0) return;

  const N = panels.length;
  let index = 0;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const updateUI = () => {
    rail.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    if (fill) fill.style.width = `${((index + 1) / N) * 100}%`;
    if (text) text.textContent = `${String(index + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;
  };

  // Always start on first project (never blank)
  updateUI();

  const stageActive = () => {
    const r = stage.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    return r.top < mid && r.bottom > mid;
  };

  // Wheel: horizontal scroll moves projects, vertical scroll keeps page normal
  let wheelLock = false;

  window.addEventListener(
    "wheel",
    (e) => {
      if (!stageActive()) return;

      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
      if (!horizontal) return;

      e.preventDefault();

      if (wheelLock) return;
      wheelLock = true;

      const dx = e.shiftKey ? e.deltaY : e.deltaX;
      const threshold = 14;

      if (dx > threshold) index = clamp(index + 1, 0, N - 1);
      else if (dx < -threshold) index = clamp(index - 1, 0, N - 1);

      updateUI();

      // slower + premium
      setTimeout(() => (wheelLock = false), 720);
    },
    { passive: false }
  );

  /* =========================
     Drag / Swipe
     - DOES NOT STEAL LINK CLICKS
     ========================= */
  let dragging = false;
  let startX = 0;
  let moved = 0;
  let pointerId = null;

  const isLinkClick = (target) => !!target.closest("a");

  stage.addEventListener("pointerdown", (e) => {
    // If user clicked on a link, DO NOT start drag
    if (isLinkClick(e.target)) return;

    dragging = true;
    startX = e.clientX;
    moved = 0;
    pointerId = e.pointerId;

    // capture pointer only for non-link interactions
    stage.setPointerCapture(pointerId);
  });

  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    moved = e.clientX - startX;
  });

  stage.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;

    const swipe = 85;

    if (moved < -swipe) index = clamp(index + 1, 0, N - 1);
    else if (moved > swipe) index = clamp(index - 1, 0, N - 1);

    updateUI();

    moved = 0;
    pointerId = null;
  });

  /* Keyboard (nice touch) */
  window.addEventListener("keydown", (e) => {
    if (!stageActive()) return;
    if (e.key === "ArrowRight") { index = clamp(index + 1, 0, N - 1); updateUI(); }
    if (e.key === "ArrowLeft")  { index = clamp(index - 1, 0, N - 1); updateUI(); }
  });
});
