document.addEventListener("DOMContentLoaded", () => {
  /* Reveal animations */
  const reveals = document.querySelectorAll(".reveal");
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

  /* Horizontal projects rail */
  const stage = document.querySelector(".project-stage");
  const rail = document.querySelector(".project-rail");
  const panels = Array.from(document.querySelectorAll(".project-panel"));
  const dotsWrap = document.querySelector(".project-dots");

  // Debug: show if JS is running
  const badge = document.createElement("div");
  badge.textContent = "JS OK";
  badge.style.position = "fixed";
  badge.style.left = "78px";
  badge.style.bottom = "10px";
  badge.style.padding = "6px 10px";
  badge.style.borderRadius = "999px";
  badge.style.fontWeight = "900";
  badge.style.fontSize = "12px";
  badge.style.background = "rgba(199,169,107,0.35)";
  badge.style.border = "1px solid rgba(199,169,107,0.75)";
  badge.style.color = "#1A1511";
  badge.style.zIndex = "9999";
  document.body.appendChild(badge);

  if (!stage || !rail || panels.length === 0 || !dotsWrap) return;

  let index = 0;
  let cooldown = false;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const setIndex = (i) => {
    index = clamp(i, 0, panels.length - 1);
    rail.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    dots.forEach((d, di) => d.classList.toggle("active", di === index));
  };

  /* Create dots */
  dotsWrap.innerHTML = "";
  const dots = panels.map((_, i) => {
    const b = document.createElement("button");
    b.className = "dotbtn";
    b.type = "button";
    b.setAttribute("aria-label", `Go to project ${i + 1}`);
    b.addEventListener("click", () => setIndex(i));
    dotsWrap.appendChild(b);
    return b;
  });

  setIndex(0);

  /* Stage active check (no observer needed) */
  const stageIsActive = () => {
    const r = stage.getBoundingClientRect();
    const mid = window.innerHeight * 0.52;
    return r.top < mid && r.bottom > mid;
  };

  /* Wheel: vertical -> horizontal */
  const onWheel = (e) => {
    if (!stageIsActive()) return;

    // allow normal scroll at edges
    if (index === 0 && e.deltaY < 0) return;
    if (index === panels.length - 1 && e.deltaY > 0) return;

    e.preventDefault();

    if (cooldown) return;
    cooldown = true;

    if (e.deltaY > 0) setIndex(index + 1);
    else setIndex(index - 1);

    setTimeout(() => (cooldown = false), 360);
  };

  window.addEventListener("wheel", onWheel, { passive: false });

  /* Keyboard support */
  window.addEventListener("keydown", (e) => {
    if (!stageIsActive()) return;
    if (e.key === "ArrowRight") setIndex(index + 1);
    if (e.key === "ArrowLeft") setIndex(index - 1);
  });

  window.addEventListener("resize", () => setIndex(index), { passive: true });
});
