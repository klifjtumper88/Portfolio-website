document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     REVEAL (slow + calm)
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
     PROJECTS – SLOW HORIZONTAL
     ========================= */
  const stage = document.querySelector(".project-stage");
  const rail = document.querySelector(".project-rail");
  const panels = Array.from(document.querySelectorAll(".project-panel"));
  const dotsWrap = document.querySelector(".project-dots");

  if (!stage || !rail || panels.length === 0 || !dotsWrap) return;

  let index = 0;
  let locked = false;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- DOTS ---------- */
  dotsWrap.innerHTML = "";
  const dots = panels.map((_, i) => {
    const b = document.createElement("button");
    b.className = "dotbtn";
    b.type = "button";
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
    return b;
  });

  const update = () => {
    rail.style.transform = `translate3d(${-index * 100}%,0,0)`;
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === index);
      d.classList.toggle("seen", i < index);
    });
  };

  const goTo = (i) => {
    index = clamp(i, 0, panels.length - 1);
    update();
  };

  update();

  const stageActive = () => {
    const r = stage.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    return r.top < mid && r.bottom > mid;
  };

  /* ---------- VERY SLOW WHEEL ---------- */
  window.addEventListener(
    "wheel",
    (e) => {
      if (!stageActive()) return;

      if (index === 0 && e.deltaY < 0) return;
      if (index === panels.length - 1 && e.deltaY > 0) return;

      e.preventDefault();
      if (locked) return;

      locked = true;

      if (e.deltaY > 0) goTo(index + 1);
      else goTo(index - 1);

      /* LONG cooldown = calm UX */
      setTimeout(() => {
        locked = false;
      }, 1100);
    },
    { passive: false }
  );

  /* ---------- KEYBOARD (slow) ---------- */
  window.addEventListener("keydown", (e) => {
    if (!stageActive()) return;
    if (locked) return;

    if (e.key === "ArrowRight") {
      locked = true;
      goTo(index + 1);
    }
    if (e.key === "ArrowLeft") {
      locked = true;
      goTo(index - 1);
    }

    setTimeout(() => {
      locked = false;
    }, 1100);
  });

  window.addEventListener("resize", update);
});
