document.addEventListener("DOMContentLoaded", () => {
  // 1) PROJECTS observer (strong Apple-like slide)
  const projectCards = document.querySelectorAll(".projects .proj-card.reveal");

  projectCards.forEach((el, idx) => {
    // Subtle stagger only for projects
    el.style.transitionDelay = `${Math.min(idx * 70, 280)}ms`;
  });

  const projObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("show");
        projObs.unobserve(e.target);
      });
    },
    {
      threshold: 0.22,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  projectCards.forEach((el) => projObs.observe(el));

  // 2) GENERAL reveal observer (for other sections)
  const otherReveals = document.querySelectorAll(".reveal:not(.proj-card)");

  const genObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("show");
        genObs.unobserve(e.target);
      });
    },
    { threshold: 0.15 }
  );

  otherReveals.forEach((el) => genObs.observe(el));
});
