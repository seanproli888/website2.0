/**
 * Scroll-Driven Awards — Horizontal sticky card experience
 * Cards slide left/right along the X-axis tied to scroll progress,
 * with scale, opacity, and blur depth transitions.
 */
(function () {
  "use strict";

  const section = document.getElementById("achievements");
  if (!section) return;

  const cards = Array.from(section.querySelectorAll(".award-scroll-card"));
  const progressCurrent = section.querySelector(".awards-progress-current");
  const progressTotal = section.querySelector(".awards-progress-total");
  const progressFill = section.querySelector(".awards-progress-fill");
  const categoryLabel = section.querySelector(".awards-active-category");
  const bgGlow = section.querySelector(".awards-bg-glow");

  const TOTAL = cards.length;
  if (!TOTAL) return;

  if (progressTotal) progressTotal.textContent = String(TOTAL).padStart(2, "0");

  /* ── Scroll calculation ─────────────────────────────────── */
  function getScrollProgress() {
    const rect = section.getBoundingClientRect();
    const sectionTop = -rect.top;
    const sectionScrollable = section.scrollHeight - window.innerHeight;
    return Math.max(0, Math.min(1, sectionTop / sectionScrollable));
  }

  /* ── Update loop ────────────────────────────────────────── */
  let ticking = false;

  function update() {
    const progress = getScrollProgress();
    const raw = progress * TOTAL;
    const activeIndex = Math.min(Math.floor(raw), TOTAL - 1);
    const localProgress = raw - activeIndex;

    cards.forEach((card, i) => {
      const diff = i - activeIndex;

      if (diff < -1) {
        // Far past — hidden to the left
        card.style.opacity = "0";
        card.style.transform = "translateX(-120px) scale(0.88)";
        card.style.zIndex = i;
        card.style.pointerEvents = "none";
        card.style.filter = "blur(4px)";
      } else if (diff === -1) {
        // Just exited — sliding out left
        const t = localProgress;
        const opacity = Math.max(0, 1 - t * 1.8);
        const x = -t * 140;
        const scale = 1 - t * 0.12;
        card.style.opacity = opacity;
        card.style.transform = `translateX(${x}px) scale(${scale})`;
        card.style.zIndex = i;
        card.style.pointerEvents = "none";
        card.style.filter = `blur(${t * 3}px)`;
      } else if (diff === 0) {
        // Active card — centered
        const enterT = Math.min(localProgress * 3, 1);
        const scale = 0.92 + enterT * 0.08;
        card.style.opacity = "1";
        card.style.transform = `translateX(0) scale(${Math.min(scale, 1)})`;
        card.style.zIndex = 100;
        card.style.pointerEvents = "auto";
        card.style.filter = "blur(0)";
      } else if (diff === 1) {
        // Next up — peeking from the right
        const t = localProgress;
        const opacity = Math.max(0, t * 0.6 - 0.1);
        const x = 140 - t * 90;
        const scale = 0.85 + t * 0.07;
        card.style.opacity = opacity;
        card.style.transform = `translateX(${x}px) scale(${scale})`;
        card.style.zIndex = i;
        card.style.pointerEvents = "none";
        card.style.filter = `blur(${(1 - t) * 2}px)`;
      } else {
        // Far future — hidden to the right
        card.style.opacity = "0";
        card.style.transform = "translateX(140px) scale(0.85)";
        card.style.zIndex = i;
        card.style.pointerEvents = "none";
        card.style.filter = "blur(4px)";
      }
    });

    // Progress counter
    if (progressCurrent) {
      progressCurrent.textContent = String(activeIndex + 1).padStart(2, "0");
    }
    // Horizontal progress bar fill (width instead of height)
    if (progressFill) {
      progressFill.style.width = `${((activeIndex + 1) / TOTAL) * 100}%`;
    }

    // Category label
    if (categoryLabel) {
      const activeCard = cards[activeIndex];
      const cat = activeCard ? activeCard.dataset.category : "";
      if (categoryLabel.textContent !== cat) {
        categoryLabel.style.opacity = "0";
        setTimeout(() => {
          categoryLabel.textContent = cat;
          categoryLabel.style.opacity = "1";
        }, 150);
      }
    }

    // Background glow parallax — horizontal drift
    if (bgGlow) {
      const parallaxX = progress * -100;
      bgGlow.style.transform = `translateX(calc(-50% + ${parallaxX}px))`;
    }

    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();

  window.addEventListener("resize", () => {
    requestAnimationFrame(update);
  });
})();
