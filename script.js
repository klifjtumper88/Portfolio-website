document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     REVEAL
     ========================= */
  const reveals = document.querySelectorAll(".reveal");
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("show");
        revealObs.unobserve(e.target);
      });
    },
    { threshold: 0.18 }
  );
  reveals.forEach((el) => revealObs.observe(el));

  /* =========================
     PROJECT SLIDER (TRUE RAIL)
     - First project always visible (CSS default)
     - Horizontal: trackpad deltaX or Shift+wheel
     - Vertical: page scroll stays normal
     - Drag/swipe supported
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
    if (text) {
      text.textContent = `${String(index + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;
    }
  };

  // Always start on first project (never blank)
  updateUI();

  const stageActive = () => {
    const r = stage.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    return r.top < mid && r.bottom > mid;
  };

  // Smooth stepping (not too fast)
  let wheelLock = false;
  const stepTo = (next) => {
    index = clamp(next, 0, N - 1);
    updateUI();
  };

  window.addEventListener(
    "wheel",
    (e) => {
      if (!stageActive()) return;

      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
      if (!horizontal) return; // vertical stays page scroll

      e.preventDefault();

      if (wheelLock) return;
      wheelLock = true;

      const dx = e.shiftKey ? e.deltaY : e.deltaX;

      // threshold so tiny touch doesn’t flip slides
      const threshold = 14;

      if (dx > threshold) stepTo(index + 1);
      else if (dx < -threshold) stepTo(index - 1);

      // lock time controls speed/feel
      setTimeout(() => (wheelLock = false), 620);
    },
    { passive: false }
  );

  /* =========================
     Drag / Swipe (trackpad-like)
     ========================= */
  let dragging = false;
  let startX = 0;
  let moved = 0;

  stage.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    moved = 0;
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    moved = e.clientX - startX;
  });

  stage.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;

    // swipe threshold
    const swipe = 80;
    if (moved < -swipe) stepTo(index + 1);
    else if (moved > swipe) stepTo(index - 1);

    moved = 0;
  });

  /* Keyboard support (optional, nice for recruiters) */
  window.addEventListener("keydown", (e) => {
    if (!stageActive()) return;
    if (e.key === "ArrowRight") stepTo(index + 1);
    if (e.key === "ArrowLeft") stepTo(index - 1);
  });
});
