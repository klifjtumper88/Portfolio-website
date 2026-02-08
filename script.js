/* ===============================
   script.js (FINAL — latest update)
   Orbit projects + ONE-at-a-time (strict single) + smooth snap
   =============================== */

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
     ORBIT PROJECTS (STRICT SINGLE)
     ========================= */
  const orbit = document.querySelector("#orbit");
  const ring = document.querySelector("#orbitRing");
  const cards = Array.from(document.querySelectorAll(".orbit-card"));
  if (!orbit || !ring || cards.length === 0) return;

  const N = cards.length;
  const step = 360 / N;

  // orbit size
  const radius = 520;

  // place cards on circle
  cards.forEach((card, i) => {
    const a = i * step;
    card.style.transform = `translate(-50%, -50%) rotateY(${a}deg) translateZ(${radius}px)`;
  });

  // motion state
  let angle = 0;
  let velocity = 0;
  let dragging = false;
  let lastX = 0;

  const stageActive = () => {
    const r = orbit.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    return r.top < mid && r.bottom > mid;
  };

  const normalizeAngle = (a) => {
    a = a % 360;
    if (a < 0) a += 360;
    return a;
  };

  /* =========================
     STRICT SINGLE: only one card active
     ========================= */
  const updateDepthClasses = () => {
    const a = normalizeAngle(angle);
    const activeIndex = Math.round(a / step) % N;

    cards.forEach((c, i) => {
      c.classList.remove("is-active");
      if (i === activeIndex) c.classList.add("is-active");
    });
  };

  const render = () => {
    ring.style.transform = `rotateY(${-angle}deg)`;
    updateDepthClasses();
  };

  /* =========================
     SNAP (premium “lands on card”)
     ========================= */
  let snapTimer = null;

  const scheduleSnap = () => {
    if (snapTimer) clearTimeout(snapTimer);

    snapTimer = setTimeout(() => {
      const a = normalizeAngle(angle);
      const target = Math.round(a / step) * step;

      let delta = target - a;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      // snap strength
      velocity += delta * 0.03;
    }, 140);
  };

  /* =========================
     ANIMATION LOOP
     ========================= */
  const tick = () => {
    // friction (lower => longer glide)
    velocity *= 0.92;

    // deadzone
    if (Math.abs(velocity) < 0.0006) velocity = 0;

    angle += velocity;
    render();
    requestAnimationFrame(tick);
  };
  tick();

  /* =========================
     INPUT: HORIZONTAL SCROLL ONLY
     ========================= */
  window.addEventListener(
    "wheel",
    (e) => {
      if (!stageActive()) return;

      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
      if (!horizontal) return; // vertical scroll stays vertical

      e.preventDefault();

      const dx = e.shiftKey ? e.deltaY : e.deltaX;

      // sensitivity (smaller = slower, more premium)
      const sens = 0.035;

      // add to velocity for inertial feel
      velocity += dx * sens;

      // snap after user stops
      scheduleSnap();
    },
    { passive: false }
  );

  /* =========================
     INPUT: DRAG (mouse/touch)
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

    const dragSens = 0.22;
    angle -= dx * dragSens;

    velocity = -dx * 0.08;
    render();
  });

  orbit.addEventListener("pointerup", () => {
    dragging = false;
    scheduleSnap();
  });

  /* init */
  render();
});
