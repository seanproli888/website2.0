// Intro parallax on scroll
const introBg = document.getElementById("introBg");
const introScreen = document.getElementById("introScreen");
const introScrollHint = document.getElementById("introScrollHint");
const siteNav = document.querySelector("nav");

window.addEventListener(
  "scroll",
  () => {
    const scrollY = window.scrollY;
    const introH = introScreen.offsetHeight;

    // Parallax bg — moves slower than scroll
    if (introBg) {
      introBg.style.transform = `scale(1.0) translateY(${scrollY * 0.3}px)`;
    }

    // Fade out scroll hint as user starts scrolling
    if (introScrollHint) {
      introScrollHint.style.opacity = Math.max(0, 1 - scrollY / 120);
    }

    // Show nav only after scrolling past the intro screen
    const introHeight = introScreen
      ? introScreen.offsetHeight
      : window.innerHeight;
    if (scrollY > introHeight * 0.85) {
      siteNav.classList.add("nav-visible");
    } else {
      siteNav.classList.remove("nav-visible");
    }
  },
  { passive: true },
);

// Click-to-explore is now handled by timetravel.js
