// Time-travel animation controller
(function () {
  const ERAS = [
    { img: "intro-bg.jpg" },
    { img: "2NBcYamXxLpvA77ciPfKZW-1200-80.jpg.webp" },
    { img: "batman-arkham-knight-hoi-ket-cua-huyen-thoai-ngay-tan-08-01-2022-2.jpg" },
    { img: "BAK_Sshot075.jpg" },
    { img: "1AecTg1xPBgt4dEFi5t2dvgx.webp" },
    { img: "bat wallpaper.webp" },
  ];

  // Hold durations: first & last = 700ms, middle = 500ms
  const HOLD_FIRST_LAST = 700;
  const HOLD_MIDDLE = 500;
  const ENTER_DURATION = 350;
  const GLITCH_DURATION = 300;

  const overlay = document.getElementById("timeTravelOverlay");
  const btn = document.getElementById("introScrollHint");
  const ttFlash = document.getElementById("ttFlash");

  // Pre-create image frame elements and append to overlay
  const frames = ERAS.map((era) => {
    const div = document.createElement("div");
    div.className = "tt-frame";
    const img = document.createElement("img");
    img.src = era.img;
    img.alt = era.title;
    div.appendChild(img);
    overlay.insertBefore(div, overlay.querySelector(".tt-warp"));
    return div;
  });

  function flash() {
    ttFlash.classList.remove("tt-flash-pop");
    // Force reflow
    void ttFlash.offsetWidth;
    ttFlash.classList.add("tt-flash-pop");
  }

  function runFrame(index) {
    return new Promise((resolve) => {
      const frame = frames[index];
      const isEdge = index === 0 || index === ERAS.length - 1;
      const holdDuration = isEdge ? HOLD_FIRST_LAST : HOLD_MIDDLE;

      // Flash between frames
      flash();

      // Enter animation
      frame.classList.remove("tt-hold", "tt-glitch-out");
      frame.classList.add("tt-enter");

      setTimeout(() => {
        frame.classList.remove("tt-enter");
        frame.classList.add("tt-hold");

        // Hold
        setTimeout(() => {
          frame.classList.remove("tt-hold");
          frame.classList.add("tt-glitch-out");

          setTimeout(() => {
            frame.classList.remove("tt-glitch-out");
            resolve();
          }, GLITCH_DURATION);
        }, holdDuration);
      }, ENTER_DURATION);
    });
  }

  async function runAnimation() {
    for (let i = 0; i < ERAS.length; i++) {
      await runFrame(i);
    }
  }

  btn.addEventListener("click", async () => {
    btn.disabled = true;

    // Show overlay
    overlay.classList.add("active");

    await runAnimation();

    // Final flash, then fade out
    flash();
    overlay.classList.add("tt-fade-out");

    setTimeout(() => {
      overlay.classList.remove("active", "tt-fade-out");
      // Reset frames
      frames.forEach((f) => f.classList.remove("tt-enter", "tt-hold", "tt-glitch-out"));

      // Scroll to about
      document.getElementById("about").scrollIntoView({ behavior: "smooth" });

      btn.disabled = false;
    }, 800);
  });
})();
