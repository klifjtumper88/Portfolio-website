document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     1) REVEAL (clean + premium)
     ========================= */
  const reveals = document.querySelectorAll(".reveal");
  reveals.forEach((el, i) => {
    const d = Math.min(i * 60, 240);
    el.style.transitionDelay = `${d}ms`;
  });

  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("show");
        revealObs.unobserve(e.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );

  reveals.forEach((el) => revealObs.observe(el));

  /* =========================
     2) PROJECT STAGE (Apple-like)
     sticky stage + scroll steps
     ========================= */
  const stage = document.querySelector(".project-stage");
  const panels = Array.from(document.querySelectorAll(".project-panel"));
  const steps = Array.from(document.querySelectorAll(".track-step"));
  const dotsWrap = document.querySelector(".project-dots");

  if (!stage || panels.length === 0 || steps.length === 0) return;

  // Build dots
  const dots = panels.map((_, idx) => {
    const b = document.createElement("button");
    b.className = "dotbtn";
    b.type = "button";
    b.setAttribute("aria-label", `Go to project ${idx + 1}`);
    b.addEventListener("click", () => {
      // scroll to corresponding step (chapter-controlled)
      const target = steps[idx] || steps[0];
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    dotsWrap.appendChild(b);
    return b;
  });

  const setActive = (index) => {
    panels.forEach((p, i) => p.classList.toggle("is-active", i === index));
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  };

  // Start with first project
  setActive(0);

  // When a step enters view, switch project
 const stepObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const idx = Number(e.target.dataset.step || "0");
      if (Number.isFinite(idx)) setActive(idx);
    });
  },
  {
    threshold: 0.6,
    rootMargin: "0px 0px -35% 0px",
  }
);


  steps.forEach((s) => stepObs.observe(s));

  /* =========================
     3) EXTRA POLISH
     keep stage “stable” on resize
     ========================= */
  let rafId = null;
  const onResize = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      // re-assert current active index based on nearest step
      const y = window.scrollY + window.innerHeight * 0.35;
      let best = 0;
      let bestDist = Infinity;

      steps.forEach((step, idx) => {
        const rect = step.getBoundingClientRect();
        const stepY = window.scrollY + rect.top;
        const dist = Math.abs(stepY - y);
        if (dist < bestDist) {
          bestDist = dist;
          best = idx;
        }
      });

      setActive(best);
    });
  };

  window.addEventListener("resize", onResize, { passive: true });
});
