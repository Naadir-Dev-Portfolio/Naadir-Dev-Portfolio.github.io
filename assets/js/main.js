(function initHeroRail() {
  const OWNER_NAME = "Naadir";

  function applyOwnerName() {
    document.querySelectorAll("[data-owner-name]").forEach((node) => {
      node.textContent = OWNER_NAME;
    });
    document.title = `${OWNER_NAME} | Portfolio`;
  }

  applyOwnerName();

  const rail = document.getElementById("heroRail");
  if (!rail) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  let speedPxPerSec = 0;

  const originals = Array.from(rail.querySelectorAll(".hero-panel"));
  const track = document.createElement("div");
  track.className = "hero-track";
  originals.forEach((panel) => track.appendChild(panel));
  originals.forEach((panel) => {
    const clone = panel.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });
  rail.appendChild(track);

  const allPanels = Array.from(track.querySelectorAll(".hero-panel"));
  const firstClone = allPanels[originals.length];

  let x = 0;
  let loopWidth = 1;
  let lastTs = 0;
  let rafId = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragStartOffset = 0;
  let autoScrolling = true;
  let resumeTimer = 0;

  function normalizeOffset(value) {
    let n = value % loopWidth;
    if (n < 0) n += loopWidth;
    return n;
  }

  function refreshMetrics() {
    const w = Math.max(320, rail.clientWidth);
    speedPxPerSec = prefersReduced
      ? (isCoarse ? w * 0.012 : w * 0.017)
      : (isCoarse ? w * 0.024 : w * 0.032);

    const firstOriginal = allPanels[0];
    const cloneOffset = firstClone ? firstClone.offsetLeft : 0;
    const originalOffset = firstOriginal ? firstOriginal.offsetLeft : 0;
    const measured = cloneOffset - originalOffset;
    const fallback = track.scrollWidth * 0.5;
    loopWidth = Math.max(1, measured > 32 ? measured : fallback);
    x = normalizeOffset(x);
    track.style.transform = `translate3d(${-x}px, 0, 0)`;
  }

  function render() {
    track.style.transform = `translate3d(${-normalizeOffset(x)}px, 0, 0)`;
  }

  function loop(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.03, Math.max(0.001, (ts - lastTs) / 1000));
    lastTs = ts;

    if (loopWidth <= 32) {
      refreshMetrics();
    }

    if (autoScrolling) {
      x += speedPxPerSec * dt;
      if (x >= loopWidth) x -= loopWidth;
    }

    render();
    rafId = requestAnimationFrame(loop);
  }

  function resumeAuto() {
    autoScrolling = true;
  }

  rail.addEventListener("touchstart", () => {
    autoScrolling = false;
  }, { passive: true });

  rail.addEventListener("touchend", () => {
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(resumeAuto, 1100);
  }, { passive: true });

  rail.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging = true;
    autoScrolling = false;
    dragStartX = event.clientX;
    dragStartOffset = x;
    rail.classList.add("dragging");
    rail.setPointerCapture(event.pointerId);
  });

  rail.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const multiplier = isCoarse ? 2.15 : 1.7;
    const deltaX = event.clientX - dragStartX;
    x = normalizeOffset(dragStartOffset - (deltaX * multiplier));
    render();
    event.preventDefault();
  });

  function stopDragging() {
    if (!dragging) return;
    dragging = false;
    rail.classList.remove("dragging");
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(resumeAuto, 750);
  }

  rail.addEventListener("pointerup", stopDragging);
  rail.addEventListener("pointercancel", stopDragging);
  rail.addEventListener("lostpointercapture", stopDragging);

  refreshMetrics();
  window.addEventListener("resize", refreshMetrics, { passive: true });
  if (!rafId) rafId = requestAnimationFrame(loop);
})();
