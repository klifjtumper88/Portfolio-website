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
     PROJECTS – HORIZONTAL ON HORIZONTAL SCROLL
     ========================= */
  const stage = document.querySelector(".project-stage");
  const rail = document.querySelector(".project-rail");
  const panels = Array.from(document.querySelectorAll(".project-panel"));
  const dotsWrap = document.querySelector(".project-dots");

  if (!stage || !rail || panels.length === 0 || !dotsWrap) return;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  let index = 0;
  let rafId = null;
  let targetX = 0;  // smooth target slide position (0..n-1)
  let currentX = 0; // current eased position

  /* ---------- dots ---------- */
  dotsWrap.innerHTML = "";
  const dots = panels.map((_, i) => {
    const b = document.createElement("button");
    b.className = "dotbtn";
    b.type = "button";
    b.setAttribute("aria-label", `Project ${i + 1}`);
    b.addEventListener("click", () => {
      targetX = i;
      tick(); // start animation
    });
    dotsWrap.appendChild(b);
    return b;
  });

  const updateDots = () => {
    const active = Math.round(currentX);
    dots.forEach((d, di) => {
      d.classList.toggle("active", di === active);
      d.classList.toggle("seen", di < active);
    });
  };

  const render = () => {
    rail.style.transform = `translate3d(${-currentX * 100}%,0,0)`;
    updateDots();
  };

  /* ---------- smooth easing loop ---------- */
  const tick = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(function step() {
      rafId = null;

      // smooth: move 12% closer each frame (slower = smaller number)
      currentX += (targetX - currentX) * 0.10;

      // snap if close
      if (Math.abs(targetX - currentX) < 0.001) {
        currentX = targetX;
        render();
        return;
      }

      render();
      tick();
    });
  };

  /* ---------- helper: only act when stage is in view ---------- */
  const stageActive = () => {
    const r = stage.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    return r.top < mid && r.bottom > mid;
  };

  /* =========================
     WHEEL / TRACKPAD BEHAVIOR
     - Vertical scroll: do NOTHING (browser handles page)
     - Horizontal scroll: move projects
     ========================= */
  window.addEventListener(
    "wheel",
    (e) => {
      if (!stageActive()) return;

      // detect horizontal intent:
      // - trackpad sideways gives deltaX
      // - Shift+wheel uses deltaY but shiftKey true
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;

      if (!horizontal) return; // let vertical pass normally

      // now we handle horizontal
      e.preventDefault();

      const dx = e.shiftKey ? e.deltaY : e.deltaX;

      // sensitivity control (smaller = slower)
      const sensitivity = 0.0035;

      // convert pixels -> slide units
      targetX = clamp(targetX + dx * sensitivity, 0, panels.length - 1);

      tick();
    },
    { passive: false }
  );

  /* ---------- keyboard (optional, still “control”) ---------- */
  window.addEventListener("keydown", (e) => {
    if (!stageActive()) return;

    if (e.key === "ArrowRight") {
      targetX = clamp(Math.round(targetX) + 1, 0, panels.length - 1);
      tick();
    }
    if (e.key === "ArrowLeft") {
      targetX = clamp(Math.round(targetX) - 1, 0, panels.length - 1);
      tick();
    }
  });

  /* ---------- resize keeps everything stable ---------- */
  window.addEventListener("resize", () => {
    targetX = clamp(targetX, 0, panels.length - 1);
    currentX = targetX;
    render();
  });

  // init
  targetX = 0;
  currentX = 0;
  render();
});
