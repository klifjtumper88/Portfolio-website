document.addEventListener("DOMContentLoaded", () => {
  /* Reveal */
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

  /* Horizontal Projects Rail */
  const stage = document.querySelector(".project-stage");
  const rail = document.querySelector(".project-rail");
  const panels = Array.from(document.querySelectorAll(".project-panel"));
  const dotsWrap = document.querySelector(".project-dots");

  if (!stage || !rail || panels.length === 0 || !dotsWrap) return;

  let index = 0;
  let locked = false;

  const setIndex = (i) => {
    index = Math.max(0, Math.min(panels.length - 1, i));
    rail.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    dots.forEach((d, di) => d.classList.toggle("active", di === index));
  };

  /* Dots */
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

  /* only hijack wheel when stage is mostly in view */
  const stageInViewObs = new IntersectionObserver(
    (entries) => {
      locked = entries[0]?.isIntersecting ?? false;
    },
    { threshold: 0.65 }
  );
  stageInViewObs.observe(stage);

  const onWheel = (e) => {
    if (!locked) return;

    // prevent page scroll and use wheel for horizontal movement
    e.preventDefault();

    const delta = e.deltaY;
    if (Math.abs(delta) < 8) return;

    if (delta > 0) setIndex(index + 1);
    else setIndex(index - 1);
  };

  // must be non-passive to preventDefault
  window.addEventListener("wheel", onWheel, { passive: false });

  /* keyboard support */
  window.addEventListener("keydown", (e) => {
    if (!locked) return;
    if (e.key === "ArrowRight") setIndex(index + 1);
    if (e.key === "ArrowLeft") setIndex(index - 1);
  });

  /* keep correct size on resize */
  window.addEventListener("resize", () => setIndex(index), { passive: true });

  /* optional: when user reaches first/last project, allow normal scroll feel */
  // (we keep it simple for now)
});
