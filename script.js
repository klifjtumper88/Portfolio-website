document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".reveal");

  // Subtle stagger (premium feel, not flashy)
  items.forEach((el, idx) => {
    const delay = Math.min(idx * 55, 260); // cap delay so it doesn't feel slow
    el.style.transitionDelay = `${delay}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("show");
        observer.unobserve(entry.target); // animate once for professionalism
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  items.forEach((el) => observer.observe(el));
});
