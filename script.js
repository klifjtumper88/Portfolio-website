document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     REVEAL ANIMATIONS
     ========================= */
  const reveals = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("show");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  reveals.forEach((el) => revealObserver.observe(el));

  /* =========================
     PROJECTS – HORIZONTAL STAGE
     ========================= */
  const stage = document.querySelector(".project-stage");
  const rail = document.querySelector(".project-rail");
  const panels = Array.from(document.querySelectorAll(".project-panel"));
  const dotsWrap = document.querySelector(".project-dots");

  if (!stage || !rail || panels.length === 0 || !dotsWrap) return;

  let index = 0;
  let locked = false;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  /* ---------- DOTS ---------- */
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

  /* ---------- UPDATE ---------- */
  const update = () => {
    rail.style.transform = `translate3d(${-index * 100}%, 0, 0)`;

    dots.forEach((d, i) => {
      d.classList.toggle("active", i === index);
      d.classList.toggle("seen", i < index);
    });
  };

  /* ---------- NAV ---------- */
  const goTo = (i) => {
    index = clamp(i, 0, panels.length - 1);
    update();
  };

  update();

  /* ---------- ACTIVE CHECK ---------- */
  const stageActive = () => {
    const r = stage.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    return r.top < mid && r.bottom > mid;
  };

  /* ---------- WHEEL CONTROL ---------- */
  window.addEventListener(
    "wheel",
    (e) => {
      if (!stageActive()) return;

      // allow normal scroll at edges
      if (index === 0 && e.deltaY < 0) return;
      if (index === panels.length - 1 && e.deltaY > 0) return;

      e.preventDefault();
      if (locked) return;

      locked = true;

      if (e.deltaY > 0) goTo(index + 1);
      else goTo(index - 1);

      // slow & elegant cooldown
      setTimeout(() => (locked = false), 650);
    },
    { passive: false }
  );

  /* ---------- KEYBOARD ---------- */
  window.addEventListener("keydown", (e) => {
    if (!stageActive()) return;
    if (e.key === "ArrowRight") goTo(index + 1);
    if (e.key === "ArrowLeft") goTo(index - 1);
  });

  /* ---------- RESIZE FIX ---------- */
  window.addEventListener("resize", update);

});
