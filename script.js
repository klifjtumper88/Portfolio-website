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
     PROJECTS
     ========================= */
  const stage = document.querySelector(".project-stage");
  const rail = document.querySelector(".project-rail");
  const panels = Array.from(document.querySelectorAll(".project-panel"));
  const dotsWrap = document.querySelector(".project-dots");
  const track = document.querySelector(".project-track");

  if (!stage || !rail || !track || panels.length === 0 || !dotsWrap) return;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- state ---------- */
  let mode = "story"; // "story" = vertical scroll drives projects, "manual" = user scrolls horizontally
  let index = 0;
  let locked = false;

  /* ---------- helpers ---------- */
  const stageActive = () => {
    const r = stage.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    return r.top < mid && r.bottom > mid;
  };

  const setIndex = (i) => {
    index = clamp(i, 0, panels.length - 1);
    rail.style.transform = `translate3d(${-index * 100}%,0,0)`;
    dots.forEach((d, di) => {
      d.classList.toggle("active", di === index);
      d.classList.toggle("seen", di < index);
    });
  };

  /* =========================
     DOTS (click -> jump)
     ========================= */
  dotsWrap.innerHTML = "";
  const dots = panels.map((_, i) => {
    const b = document.createElement("button");
    b.className = "dotbtn";
    b.type = "button";
    b.setAttribute("aria-label", `Project ${i + 1}`);
    b.addEventListener("click", () => {
      if (mode === "story") {
        // story mode: scroll the page to the correct segment
        const trackTop = track.getBoundingClientRect().top + window.scrollY;
        const targetY = trackTop + i * window.innerHeight;
        window.scrollTo({ top: targetY, behavior: "smooth" });
      } else {
        // manual mode: just slide
        setIndex(i);
      }
    });
    dotsWrap.appendChild(b);
    return b;
  });

  /* =========================
     MODE TOGGLE UI (injected)
     ========================= */
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Toggle project navigation mode");
  toggle.style.position = "absolute";
  toggle.style.left = "16px";
  toggle.style.bottom = "16px";
  toggle.style.zIndex = "12";
  toggle.style.padding = "10px 12px";
  toggle.style.borderRadius = "999px";
  toggle.style.fontWeight = "900";
  toggle.style.fontSize = "12px";
  toggle.style.letterSpacing = "0.6px";
  toggle.style.border = "1px solid rgba(26,21,17,0.18)";
  toggle.style.background = "rgba(246,241,234,0.86)";
  toggle.style.color = "rgba(26,21,17,0.78)";
  toggle.style.boxShadow = "0 14px 30px rgba(20,17,14,0.10)";
  toggle.style.cursor = "pointer";
  toggle.textContent = "Mode: Story Scroll";

  const hint = document.createElement("div");
  hint.style.position = "absolute";
  hint.style.left = "16px";
  hint.style.bottom = "52px";
  hint.style.zIndex = "12";
  hint.style.padding = "8px 12px";
  hint.style.borderRadius = "999px";
  hint.style.fontWeight = "900";
  hint.style.fontSize = "12px";
  hint.style.border = "1px solid rgba(26,21,17,0.14)";
  hint.style.background = "rgba(246,241,234,0.78)";
  hint.style.color = "rgba(26,21,17,0.68)";
  hint.style.boxShadow = "0 14px 30px rgba(20,17,14,0.08)";
  hint.textContent = "Tip: Shift + Wheel, Drag, or Arrow keys";

  stage.appendChild(toggle);
  stage.appendChild(hint);

  const updateToggle = () => {
    toggle.textContent = mode === "story" ? "Mode: Story Scroll" : "Mode: Manual";
    hint.style.display = mode === "manual" ? "block" : "none";
  };

  toggle.addEventListener("click", () => {
    mode = mode === "story" ? "manual" : "story";
    updateToggle();

    // if switching to story, snap rail based on current scroll progress
    requestUpdate();
  });

  updateToggle();

  /* =========================
     STORY MODE: scroll-driven
     ========================= */
  let rafId = null;

  const updateFromScroll = () => {
    rafId = null;
    if (mode !== "story") return;

    const trackTop = track.getBoundingClientRect().top + window.scrollY;
    const trackHeight = track.offsetHeight;
    const viewport = window.innerHeight;

    const y = window.scrollY;
    const progressRaw = (y - trackTop) / (trackHeight - viewport);
    const progress = clamp(progressRaw, 0, 1);

    const slideSpan = (panels.length - 1);
    const x = progress * slideSpan;

    rail.style.transform = `translate3d(${-x * 100}%, 0, 0)`;

    const active = Math.round(x);
    index = active;
    dots.forEach((d, di) => {
      d.classList.toggle("active", di === active);
      d.classList.toggle("seen", di < active);
    });
  };

  const requestUpdate = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(updateFromScroll);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });

  /* =========================
     MANUAL MODE: horizontal control
     ========================= */

  // 1) Shift + Wheel to go horizontally (only in manual mode)
  window.addEventListener(
    "wheel",
    (e) => {
      if (mode !== "manual") return;
      if (!stageActive()) return;

      const horizontalIntent = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);

      if (!horizontalIntent) return;

      e.preventDefault();
      if (locked) return;
      locked = true;

      const dir = (e.deltaX || e.deltaY) > 0 ? 1 : -1;
      setIndex(index + dir);

      setTimeout(() => (locked = false), 900);
    },
    { passive: false }
  );

  // 2) Arrow keys (manual mode)
  window.addEventListener("keydown", (e) => {
    if (mode !== "manual") return;
    if (!stageActive()) return;
    if (locked) return;

    if (e.key === "ArrowRight") {
      locked = true;
      setIndex(index + 1);
      setTimeout(() => (locked = false), 900);
    }
    if (e.key === "ArrowLeft") {
      locked = true;
      setIndex(index - 1);
      setTimeout(() => (locked = false), 900);
    }
  });

  // 3) Drag to slide (manual mode)
  let dragging = false;
  let startX = 0;
  let moved = 0;

  stage.addEventListener("pointerdown", (e) => {
    if (mode !== "manual") return;
    dragging = true;
    startX = e.clientX;
    moved = 0;
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener("pointermove", (e) => {
    if (!dragging || mode !== "manual") return;
    moved = e.clientX - startX;
  });

  stage.addEventListener("pointerup", () => {
    if (!dragging || mode !== "manual") return;
    dragging = false;

    // swipe threshold
    if (Math.abs(moved) > 60) {
      if (moved < 0) setIndex(index + 1);
      else setIndex(index - 1);
    }
  });

  /* init */
  requestUpdate();
});
