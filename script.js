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
     PROJECTS – HORIZONTAL SNAP + TAB-FLIP
     ========================= */
  const stage = document.querySelector(".project-stage");
  const rail = document.querySelector(".project-rail");
  const panels = Array.from(document.querySelectorAll(".project-panel"));
  const dotsWrap = document.querySelector(".project-dots");

  if (!stage || !rail || panels.length === 0 || !dotsWrap) return;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  let index = 0;
  let locked = false;

  /* ---------- stage active ---------- */
  const stageActive = () => {
    const r = stage.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    return r.top < mid && r.bottom > mid;
  };

  /* ---------- dots ---------- */
  dotsWrap.innerHTML = "";
  const dots = panels.map((_, i) => {
    const b = document.createElement("button");
    b.className = "dotbtn";
    b.type = "button";
    b.setAttribute("aria-label", `Project ${i + 1}`);
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
    return b;
  });

  const setDots = () => {
    dots.forEach((d, di) => {
      d.classList.toggle("active", di === index);
      d.classList.toggle("seen", di < index);
    });
  };

  const animatePanel = () => {
    const p = panels[index];
    p.classList.remove("is-animating");
    // restart animation reliably
    void p.offsetWidth;
    p.classList.add("is-animating");
  };

  const render = () => {
    rail.style.transform = `translate3d(${-index * 100}%,0,0)`;
    setDots();
    animatePanel();
  };

  const goTo = (i) => {
    index = clamp(i, 0, panels.length - 1);
    render();
  };

  render();

  /* =========================
     HORIZONTAL INPUT ONLY
     - vertical scroll: do nothing (page scrolls)
     - horizontal scroll: snap projects
     ========================= */
  window.addEventListener(
    "wheel",
    (e) => {
      if (!stageActive()) return;

      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
      if (!horizontal) return;

      // We handle horizontal only
      e.preventDefault();
      if (locked) return;
      locked = true;

      const dx = e.shiftKey ? e.deltaY : e.deltaX;

      // snap threshold
      if (dx > 0) goTo(index + 1);
      else goTo(index - 1);

      // slow, deliberate cooldown
      setTimeout(() => (locked = false), 950);
    },
    { passive: false }
  );

  /* ---------- keyboard (optional) ---------- */
  window.addEventListener("keydown", (e) => {
    if (!stageActive()) return;
    if (locked) return;

    if (e.key === "ArrowRight") {
      locked = true;
      goTo(index + 1);
      setTimeout(() => (locked = false), 950);
    }
    if (e.key === "ArrowLeft") {
      locked = true;
      goTo(index - 1);
      setTimeout(() => (locked = false), 950);
    }
  });

  /* ---------- swipe drag (trackpad-like fallback) ---------- */
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

    if (Math.abs(moved) > 70) {
      if (moved < 0) goTo(index + 1);
      else goTo(index - 1);
    }
  });

  window.addEventListener("resize", () => render());
});
