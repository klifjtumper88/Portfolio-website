// Premium reveal: smooth, once-only, subtle stagger
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".reveal");

  // Add a small stagger automatically (no HTML edits needed)
  items.forEach((el, idx) => {
    // Only stagger a little; keeps it employer-friendly
    const delay = Math.min(idx * 45, 220); // max 220ms
    el.style.transitionDelay = `${delay}ms`;
  });

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;

        e.target.classList.add("show");
        obs.unobserve(e.target); // animate once
      });
    },
    { threshold: 0.18 }
  );

  items.forEach((el) => obs.observe(el));
});
