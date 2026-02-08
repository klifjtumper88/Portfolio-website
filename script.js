document.addEventListener("DOMContentLoaded", () => {
  // Reveal once
  const reveals = document.querySelectorAll(".reveal");
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("show");
        revealObs.unobserve(e.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );
  reveals.forEach((el) => revealObs.observe(el));

  // Project dots
  const panels = Array.from(document.querySelectorAll(".project-panel"));
  const dotsWrap = document.querySelector(".project-dots");
  if (!dotsWrap || panels.length === 0) return;

  dotsWrap.innerHTML = "";
  const dotButtons = panels.map((panel, idx) => {
    const b = document.createElement("button");
    b.className = "dotbtn";
    b.type = "button";
    b.setAttribute("aria-label", `Go to project ${idx + 1}`);
    b.addEventListener("click", () => {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    dotsWrap.appendChild(b);
    return b;
  });

  const setActive = (index) => {
    dotButtons.forEach((b, i) => b.classList.toggle("active", i === index));
  };

  // Highlight current panel
  const panelObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const idx = panels.indexOf(e.target);
        if (idx >= 0) setActive(idx);
      });
    },
    { threshold: 0.55 }
  );

  panels.forEach((p) => panelObs.observe(p));
  setActive(0);
});
