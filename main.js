// Intersection Observer for reveal animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);

document
  .querySelectorAll(".reveal, .award-card, .timeline-item, .edu-card")
  .forEach((el) => {
    observer.observe(el);
  });

// Counter animation
const counters = document.querySelectorAll(".stat-num[data-count]");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const isDecimal = target % 1 !== 0;
        const duration = 1200;
        const start = performance.now();
        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const val = eased * target;
          el.textContent = isDecimal ? val.toFixed(1) : Math.floor(val);
          if (progress < 1) requestAnimationFrame(animate);
          else el.textContent = isDecimal ? target.toFixed(1) : target;
        };
        requestAnimationFrame(animate);
        counterObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 },
);

counters.forEach((c) => counterObserver.observe(c));

// ===== SCROLL PROGRESS BAR =====
const scrollProgress = document.getElementById("scrollProgress");
window.addEventListener(
  "scroll",
  () => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
  },
  { passive: true },
);

// ===== PARALLAX ON SCROLL =====
const parallaxEls = document.querySelectorAll("[data-parallax]");
let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        parallaxEls.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax) || 0.1;
          const rect = el.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const offset = (centerY - window.innerHeight / 2) * speed;
          el.style.transform = `translateY(${offset}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  },
  { passive: true },
);

// ===== 3D TILT CARD INTERACTION =====
document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 30px rgba(0,0,0,0.3), 0 0 20px rgba(232,184,109,0.05)`;

    // Update shine position
    const shine = card.querySelector(".tilt-shine");
    if (shine) {
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      shine.style.setProperty("--mouse-x", percentX + "%");
      shine.style.setProperty("--mouse-y", percentY + "%");
    }
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
    card.style.boxShadow = "";
  });
});

// ===== ENHANCED SCROLL REVEAL with direction-aware animations =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);

document
  .querySelectorAll(
    ".reveal-left, .reveal-right, .reveal-scale, .stagger-children",
  )
  .forEach((el) => {
    revealObserver.observe(el);
  });

// Dedicated observer for opposing slide-in elements (30% threshold, staggered delay)
const slideInObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        slideInObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 },
);

document
  .querySelectorAll(".slide-in-left, .slide-in-right")
  .forEach((el) => {
    slideInObserver.observe(el);
  });

// ===== FLOATING PARTICLES for sections =====
document
  .querySelectorAll("#achievements, #education")
  .forEach((section) => {
    const container = document.createElement("div");
    container.classList.add("section-particles");
    for (let i = 0; i < 12; i++) {
      const p = document.createElement("div");
      p.classList.add("particle");
      p.style.left = Math.random() * 100 + "%";
      p.style.bottom = Math.random() * 30 + "%";
      p.style.animationDelay = Math.random() * 8 + "s";
      p.style.animationDuration = 6 + Math.random() * 4 + "s";
      p.style.width = p.style.height = 1 + Math.random() * 2 + "px";
      container.appendChild(p);
    }
    section.prepend(container);
  });

// ===== SMOOTH SCROLL NAV HIGHLIGHT =====
/* 
Self-correction: Removing the automatic navigation highlighting (gold underline) 
based on scroll position as per user request. 
Navigation will now only highlight on hover.
*/
