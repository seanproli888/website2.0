/**
 * Full-viewport WebGL Skills Slider
 * Liquid displacement transition with RGB shift on drag.
 * Three.js r128 via CDN — no build step required.
 */
(function () {
  "use strict";

  /* ── Slide Data ─────────────────────────────────────────── */
  const SLIDES = [
    {
      title: "Economics",
      category: "DISCIPLINE",
      description: "Macro & micro analysis, policy evaluation, and econometric modelling.",
      accent: [232, 184, 109],   // gold
      image: null,               // set to path string to use a real photo
    },
    {
      title: "Strategic\nAnalysis",
      category: "CONSULTING",
      description: "Frameworks, competitive positioning, and data-driven decision making.",
      accent: [180, 160, 220],
      image: null,
    },
    {
      title: "Microsoft\nOffice",
      category: "PRODUCTIVITY",
      description: "Advanced Excel, PowerPoint storytelling, and Word automation.",
      accent: [74, 143, 232],
      image: null,
    },
    {
      title: "Web\nDesign",
      category: "CREATIVE",
      description: "Responsive layouts, UI/UX principles, and modern front-end development.",
      accent: [109, 232, 180],
      image: null,
    },
    {
      title: "Video\nEditing",
      category: "CREATIVE",
      description: "Colour grading, motion graphics, and cinematic storytelling.",
      accent: [232, 109, 109],
      image: null,
    },
    {
      title: "Stock\nMarkets",
      category: "FINANCE",
      description: "Technical analysis, portfolio theory, and derivatives pricing.",
      accent: [109, 200, 232],
      image: null,
    },
    {
      title: "Artificial\nIntelligence",
      category: "TECHNOLOGY",
      description: "Machine learning, prompt engineering, and applied AI solutions.",
      accent: [200, 130, 255],
      image: null,
    },
    {
      title: "Content\nCreation",
      category: "MEDIA",
      description: "Brand storytelling, social media strategy, and visual production.",
      accent: [255, 180, 100],
      image: null,
    },
  ];

  const TRANSITION_DURATION = 1.4;
  const AUTO_PLAY_DELAY = 5000;
  const SWIPE_THRESHOLD = 50;

  /* ── DOM ────────────────────────────────────────────────── */
  const container = document.getElementById("skills-webgl");
  if (!container) return;
  const canvas = document.getElementById("skills-canvas");
  const titleEl = container.querySelector(".slide-title");
  const categoryEl = container.querySelector(".slide-category");
  const descEl = container.querySelector(".slide-desc");
  const counterCurr = container.querySelector(".counter-current");
  const counterTotal = container.querySelector(".counter-total");
  const overlay = container.querySelector(".slide-overlay");

  /* ── Procedural background generator ────────────────────── */
  function generateBackground(width, height, accent) {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    const ctx = c.getContext("2d");
    const [r, g, b] = accent;

    // Deep dark base
    ctx.fillStyle = "#050508";
    ctx.fillRect(0, 0, width, height);

    // Dramatic radial glow (off-center)
    const grd = ctx.createRadialGradient(
      width * 0.45, height * 0.4, 0,
      width * 0.45, height * 0.4, width * 0.7
    );
    grd.addColorStop(0, `rgba(${r},${g},${b},0.25)`);
    grd.addColorStop(0.4, `rgba(${r},${g},${b},0.08)`);
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    // Secondary subtle glow
    const grd2 = ctx.createRadialGradient(
      width * 0.7, height * 0.65, 0,
      width * 0.7, height * 0.65, width * 0.5
    );
    grd2.addColorStop(0, `rgba(${r},${g},${b},0.12)`);
    grd2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd2;
    ctx.fillRect(0, 0, width, height);

    // Noise grain overlay
    const imgData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 18;
      imgData.data[i] += noise;
      imgData.data[i + 1] += noise;
      imgData.data[i + 2] += noise;
    }
    ctx.putImageData(imgData, 0, 0);

    // Vignette
    const vig = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.2,
      width / 2, height / 2, width * 0.85
    );
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.7)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);

    return c;
  }

  /* ── Displacement map (smooth Perlin-like noise) ────────── */
  function createDisplacementMap(size) {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(size, size);
    // Multi-octave noise for organic feel
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        let v = 0;
        v += Math.sin(x * 0.02) * Math.cos(y * 0.03) * 80;
        v += Math.sin(x * 0.05 + y * 0.04) * 50;
        v += (Math.random() - 0.5) * 40;
        v = Math.max(0, Math.min(255, v + 128));
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    // Blur for smoothness
    const c2 = document.createElement("canvas");
    c2.width = size;
    c2.height = size;
    const ctx2 = c2.getContext("2d");
    ctx2.filter = "blur(16px)";
    ctx2.drawImage(c, 0, 0);
    return c2;
  }

  /* ── Shaders ────────────────────────────────────────────── */
  const vertexShader = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = /* glsl */ `
    precision highp float;

    uniform sampler2D uTexCurrent;
    uniform sampler2D uTexNext;
    uniform sampler2D uDisplacement;
    uniform float uProgress;
    uniform float uIntensity;
    uniform float uRgbShift;
    uniform int uDirection;

    varying vec2 vUv;

    // Smooth cubic ease
    float ease(float t) {
      return t * t * (3.0 - 2.0 * t);
    }

    void main() {
      float dir = float(uDirection);
      float p = ease(uProgress);

      // Sample displacement — organic warp
      vec4 dispVal = texture2D(uDisplacement, vUv);
      float disp = dispVal.r;

      // Strength ramps up then down (bell curve)
      float strength = uIntensity * (1.0 + uRgbShift * 2.0);
      float warpOut = disp * p * strength;
      float warpIn  = disp * (1.0 - p) * strength;

      // Distorted UVs — directional liquid warp
      vec2 uv1 = vec2(
        vUv.x + dir * warpOut * 0.8,
        vUv.y + warpOut * 0.3 * sin(vUv.x * 3.14)
      );
      vec2 uv2 = vec2(
        vUv.x - dir * warpIn * 0.8,
        vUv.y - warpIn * 0.3 * sin(vUv.x * 3.14)
      );

      // Clamp UVs to avoid edge artifacts
      uv1 = clamp(uv1, 0.0, 1.0);
      uv2 = clamp(uv2, 0.0, 1.0);

      // RGB channel split (chromatic aberration)
      // Intensifies during transition peak AND during drag
      float aberration = p * (1.0 - p) * 0.08 + uRgbShift * 0.015;
      vec2 rOff = vec2(aberration, aberration * 0.3) * dir;
      vec2 bOff = vec2(-aberration, -aberration * 0.3) * dir;

      // Current slide — RGB split
      float r1 = texture2D(uTexCurrent, clamp(uv1 + rOff, 0.0, 1.0)).r;
      float g1 = texture2D(uTexCurrent, uv1).g;
      float b1 = texture2D(uTexCurrent, clamp(uv1 + bOff, 0.0, 1.0)).b;
      vec4 col1 = vec4(r1, g1, b1, 1.0);

      // Next slide — RGB split
      float r2 = texture2D(uTexNext, clamp(uv2 + rOff, 0.0, 1.0)).r;
      float g2 = texture2D(uTexNext, uv2).g;
      float b2 = texture2D(uTexNext, clamp(uv2 + bOff, 0.0, 1.0)).b;
      vec4 col2 = vec4(r2, g2, b2, 1.0);

      // Blend with soft crossfade
      gl_FragColor = mix(col1, col2, p);
    }
  `;

  /* ── Three.js ───────────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x050508);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);

  /* ── Build textures ─────────────────────────────────────── */
  const TEX_W = 1920;
  const TEX_H = 1080;
  let texturesReady = false;
  const textures = [];

  function buildTextures() {
    SLIDES.forEach((slide, i) => {
      if (slide.image) {
        // Load real image
        const loader = new THREE.TextureLoader();
        textures[i] = loader.load(slide.image, () => {
          textures[i].minFilter = THREE.LinearFilter;
          textures[i].magFilter = THREE.LinearFilter;
        });
      } else {
        // Procedural background
        const bg = generateBackground(TEX_W, TEX_H, slide.accent);
        const t = new THREE.CanvasTexture(bg);
        t.minFilter = THREE.LinearFilter;
        t.magFilter = THREE.LinearFilter;
        textures[i] = t;
      }
    });
    texturesReady = true;
  }
  buildTextures();

  const dispTexture = new THREE.CanvasTexture(createDisplacementMap(512));
  dispTexture.wrapS = dispTexture.wrapT = THREE.RepeatWrapping;

  /* ── Shader material ────────────────────────────────────── */
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexCurrent: { value: textures[0] },
      uTexNext: { value: textures[1 % SLIDES.length] },
      uDisplacement: { value: dispTexture },
      uProgress: { value: 0 },
      uIntensity: { value: 0.5 },
      uRgbShift: { value: 0 },
      uDirection: { value: 1 },
    },
    vertexShader,
    fragmentShader,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  scene.add(mesh);

  /* ── Sizing ─────────────────────────────────────────────── */
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);

    // Cover behaviour (like background-size: cover)
    const containerAspect = w / h;
    const texAspect = TEX_W / TEX_H;
    if (containerAspect > texAspect) {
      mesh.scale.set(1, containerAspect / texAspect, 1);
    } else {
      mesh.scale.set(texAspect / containerAspect, 1, 1);
    }
  }
  resize();

  /* ── State ──────────────────────────────────────────────── */
  let currentIndex = 0;
  let isAnimating = false;
  let autoTimer = null;
  let dragRgb = 0;          // live RGB shift from drag
  let dragRgbTarget = 0;

  /* ── HTML overlay update ────────────────────────────────── */
  function setSlideContent(idx, direction) {
    const slide = SLIDES[idx];
    const dir = direction || 1;

    // Animate out
    overlay.classList.add("transitioning");
    overlay.style.setProperty("--slide-dir", dir);

    setTimeout(() => {
      // Update content
      titleEl.innerHTML = slide.title.replace("\n", "<br>");
      categoryEl.textContent = slide.category;
      descEl.textContent = slide.description;

      // Counter
      counterCurr.textContent = String(idx + 1).padStart(2, "0");

      // Accent colour on category line
      const [r, g, b] = slide.accent;
      categoryEl.style.setProperty("--accent", `rgb(${r},${g},${b})`);

      // Animate in
      overlay.classList.remove("transitioning");
    }, TRANSITION_DURATION * 400);
  }

  // Initial content
  (function initContent() {
    const s = SLIDES[0];
    titleEl.innerHTML = s.title.replace("\n", "<br>");
    categoryEl.textContent = s.category;
    descEl.textContent = s.description;
    counterCurr.textContent = "01";
    counterTotal.textContent = String(SLIDES.length).padStart(2, "0");
    const [r, g, b] = s.accent;
    categoryEl.style.setProperty("--accent", `rgb(${r},${g},${b})`);
  })();

  /* ── Navigation dots ────────────────────────────────────── */
  const dotsContainer = container.querySelector(".slider-dots");
  SLIDES.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "slider-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Skill ${i + 1}: ${SLIDES[i].title.replace("\n", " ")}`);
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  });
  const dots = dotsContainer.querySelectorAll(".slider-dot");

  function updateDots(idx) {
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  }

  /* ── Transition ─────────────────────────────────────────── */
  function goTo(targetIndex) {
    if (isAnimating || targetIndex === currentIndex) return;
    isAnimating = true;

    const direction = targetIndex > currentIndex ? 1 : -1;
    material.uniforms.uTexCurrent.value = textures[currentIndex];
    material.uniforms.uTexNext.value = textures[targetIndex];
    material.uniforms.uDirection.value = direction;
    material.uniforms.uProgress.value = 0;

    setSlideContent(targetIndex, direction);

    const start = performance.now();
    const duration = TRANSITION_DURATION * 1000;

    function tick(now) {
      const elapsed = now - start;
      let t = Math.min(elapsed / duration, 1);

      // Cubic ease-in-out
      t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      material.uniforms.uProgress.value = t;

      // Boost RGB shift during transition peak
      material.uniforms.uRgbShift.value = t * (1 - t) * 4 + dragRgb;

      if (elapsed < duration) {
        requestAnimationFrame(tick);
      } else {
        material.uniforms.uProgress.value = 0;
        material.uniforms.uTexCurrent.value = textures[targetIndex];
        material.uniforms.uRgbShift.value = 0;
        currentIndex = targetIndex;
        isAnimating = false;
        updateDots(currentIndex);
        resetAutoPlay();
      }
    }
    requestAnimationFrame(tick);
  }

  function next() { goTo((currentIndex + 1) % SLIDES.length); }
  function prev() { goTo((currentIndex - 1 + SLIDES.length) % SLIDES.length); }

  /* ── Arrows ─────────────────────────────────────────────── */
  container.querySelector(".slider-prev").addEventListener("click", prev);
  container.querySelector(".slider-next").addEventListener("click", next);

  /* ── Touch swipe with live RGB shift ────────────────────── */
  let touchStartX = 0, touchStartY = 0, isSwiping = false;

  canvas.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
    clearInterval(autoTimer);
  }, { passive: true });

  canvas.addEventListener("touchmove", (e) => {
    if (!isSwiping) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      e.preventDefault();
    }
    // Live RGB shift proportional to drag distance
    dragRgbTarget = Math.min(Math.abs(dx) / 200, 1.0);
  }, { passive: false });

  canvas.addEventListener("touchend", (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    dragRgbTarget = 0;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      dx < 0 ? next() : prev();
    } else {
      resetAutoPlay();
    }
  }, { passive: true });

  /* ── Mouse drag with live RGB shift ─────────────────────── */
  let mouseDown = false, mouseStartX = 0;

  canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;
    mouseStartX = e.clientX;
    canvas.style.cursor = "grabbing";
    clearInterval(autoTimer);
  });

  window.addEventListener("mousemove", (e) => {
    if (!mouseDown) return;
    const dx = e.clientX - mouseStartX;
    dragRgbTarget = Math.min(Math.abs(dx) / 200, 1.0);
  });

  window.addEventListener("mouseup", (e) => {
    if (!mouseDown) return;
    mouseDown = false;
    canvas.style.cursor = "grab";
    dragRgbTarget = 0;
    const dx = e.clientX - mouseStartX;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      dx < 0 ? next() : prev();
    } else {
      resetAutoPlay();
    }
  });

  /* ── Keyboard ───────────────────────────────────────────── */
  document.addEventListener("keydown", (e) => {
    const rect = container.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); next(); }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); prev(); }
  });

  /* ── Scroll-wheel navigation ────────────────────────────── */
  let wheelCooldown = false;
  container.addEventListener("wheel", (e) => {
    if (wheelCooldown || isAnimating) return;
    const rect = container.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    wheelCooldown = true;
    if (e.deltaY > 30) next();
    else if (e.deltaY < -30) prev();
    setTimeout(() => { wheelCooldown = false; }, 800);
  }, { passive: true });

  /* ── Autoplay ───────────────────────────────────────────── */
  function resetAutoPlay() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, AUTO_PLAY_DELAY);
  }
  resetAutoPlay();
  container.addEventListener("mouseenter", () => clearInterval(autoTimer));
  container.addEventListener("mouseleave", () => { if (!mouseDown) resetAutoPlay(); });

  /* ── Render loop ────────────────────────────────────────── */
  function render() {
    // Smoothly interpolate RGB shift
    dragRgb += (dragRgbTarget - dragRgb) * 0.1;
    if (!isAnimating) {
      material.uniforms.uRgbShift.value = dragRgb;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  /* ── Resize ─────────────────────────────────────────────── */
  let resizeRaf;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resize);
  });

  canvas.style.cursor = "grab";
})();
