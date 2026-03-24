// ==================== GALLERY CAROUSEL ====================
(function () {
  const track = document.getElementById("galleryTrack");
  const slides = track ? track.querySelectorAll(".gallery-slide") : [];
  const prevBtn = document.querySelector(".gallery-prev");
  const nextBtn = document.querySelector(".gallery-next");
  const captionEl = document.getElementById("galleryCaption");
  const dotsContainer = document.getElementById("galleryDots");

  if (!track || slides.length === 0) return;

  let current = 0;
  const total = slides.length;

  function setSizes() {
    // No longer need manual width calculations for the track in a fade gallery
    track.style.width = "";
    slides.forEach((s) => (s.style.width = ""));
    track.style.transform = "";
  }
  setSizes();
  window.addEventListener("resize", setSizes);

  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "gallery-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "Go to slide " + (i + 1));
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function updateCaption() {
    captionEl.style.opacity = 0;
    setTimeout(() => {
      captionEl.textContent = slides[current].dataset.caption || "";
      captionEl.style.opacity = 1;
    }, 200);
  }

  function updateDots() {
    dotsContainer.querySelectorAll(".gallery-dot").forEach((d, i) => {
      d.classList.toggle("active", i === current);
    });
  }

  function goTo(index) {
    // Remove active class from previous
    slides[current].classList.remove("active");
    
    current = ((index % total) + total) % total;
    
    // Add active class to current
    slides[current].classList.add("active");
    
    updateCaption();
    updateDots();
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  // Initialize first slide as active
  slides[0].classList.add("active");
  
  // Start on the featured slide (using the class if present)
  const featuredIndex = Array.from(slides).findIndex((s) =>
    s.classList.contains("featured")
  );
  if (featuredIndex >= 0) {
    goTo(featuredIndex);
  } else {
    goTo(0);
  }

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (document.getElementById("lightbox").classList.contains("active")) return;
    if (e.key === "ArrowLeft") goTo(current - 1);
    if (e.key === "ArrowRight") goTo(current + 1);
  });

  // Touch/swipe support
  let startX = 0;
  let isDragging = false;

  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  });

  track.addEventListener("touchend", (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
    }
  });

  // ==================== LIGHTBOX ====================
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = lightbox.querySelector(".lightbox-close");
  const lightboxPrev = lightbox.querySelector(".lightbox-prev");
  const lightboxNext = lightbox.querySelector(".lightbox-next");
  let lightboxIndex = 0;

  const allImages = Array.from(slides).map((s) => ({
    src: s.querySelector("img").src,
    caption: s.dataset.caption || "",
  }));

  function openLightbox(index) {
    lightboxIndex = index;
    lightboxImg.src = allImages[index].src;
    lightboxCaption.textContent = allImages[index].caption;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  function lightboxGo(index) {
    lightboxIndex = ((index % total) + total) % total;
    lightboxImg.src = allImages[lightboxIndex].src;
    lightboxCaption.textContent = allImages[lightboxIndex].caption;
  }

  slides.forEach((slide, i) => {
    slide.addEventListener("click", () => openLightbox(i));
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", () => lightboxGo(lightboxIndex - 1));
  lightboxNext.addEventListener("click", () => lightboxGo(lightboxIndex + 1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") lightboxGo(lightboxIndex - 1);
    if (e.key === "ArrowRight") lightboxGo(lightboxIndex + 1);
  });
})();
