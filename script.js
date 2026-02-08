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
     ORBIT PROJECTS
     ========================= */
  const orbit = document.querySelector("#orbit");
  const ring = document.querySelector("#orbitRing");
  const cards = Array.from(document.querySelectorAll(".orbit-card"));
  if (!orbit || !ring || cards.length === 0) return;

  const N = cards.length;
  const step = 360 / N;

  // radius controls circle size (tweak if you want wider orbit)
  const radius = 520;

  // place cards on circle
  cards.forEach((card, i) => {
    const a = i * step;
    card.style.transform = `translate(-50%, -50%) rotateY(${a}deg) translateZ(${radius}px)`;
  });

  // motion state
  let angle = 0;           // current rotation
  let velocity = 0;        // inertia
  let dragging = false;
  let lastX = 0;

  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  const stageActive = () => {
    const r = orbit.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    return r.top < mid && r.bottom > mid;
  };

  const normalizeAngle = (a) => {
    // keep angle manageable
    a = a % 360;
    if (a < 0) a += 360;
    return a;
  };

  const updateDepthClasses = () => {
    // determine which card is closest to front (0deg)
    const a = normalizeAngle(angle);
    // front index roughly
    const frontIndex = Math.round(a / step) % N;

    cards.forEach((c, i) => {
      c.classList.remove("is-front", "is-side", "is-back");
      const dist = Math.min(
        Math.abs(i - frontIndex),
        N - Math.abs(i - frontIndex)
      );

      if (dist === 0) c.classList.add("is-front");
      else if (dist === 1) c.classList.add("is-side");
      else c.classList.add("is-back");
    });
  };

  const render = () => {
    ring.style.transform = `rotateY(${-angle}deg)`;
    updateDepthClasses();
  };

  // animation loop
  const tick = () => {
    // friction (lower = longer glide)
    velocity *= 0.92;

    // deadzone
    if (Math.abs(velocity) < 0.0006) velocity = 0;

    angle += velocity;
    render();

    requestAnimationFrame(tick);
  };
  tick();

  /* =========================
     INPUT: HORIZONTAL SCROLL
     ========================= */
  window.addEventListener(
    "wheel",
    (e) => {
      if (!stageActive()) return;

      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
      if (!horizontal) return; // vertical scroll stays vertical

      e.preventDefault();

      // dx: trackpad horizontal uses deltaX, shift+wheel uses deltaY
      const dx = e.shiftKey ? e.deltaY : e.deltaX;

      // sensitivity (smaller = slower, more premium)
      const sens = 0.035;

      // add to velocity for inertial feel
      velocity += dx * sens;
    },
    { passive: false }
  );

  /* =========================
     INPUT: DRAG (mouse / touch)
     ========================= */
  orbit.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    orbit.setPointerCapture(e.pointerId);
  });

  orbit.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;

    // direct rotation while dragging
    const dragSens = 0.22;
    angle -= dx * dragSens;

    // set velocity for release glide
    velocity = -dx * 0.08;

    render();
  });

  orbit.addEventListener("pointerup", () => {
    dragging = false;
  });

  /* init */
  render();
});
