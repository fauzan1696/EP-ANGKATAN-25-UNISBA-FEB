/* ══════════════════════════════════════════════════════════
   ANGKATAN 25 — EKONOMI PEMBANGUNAN FEB UNISBA
   script.js — Interactions & Animations (Updated)
   ══════════════════════════════════════════════════════════ */

"use strict";

/* ──────────────────────────────────────────
   INTRO ANIMATION → LOADER → MAIN CONTENT
   Sequence:
   1. Intro overlay plays (≈1.8s auto-advance)
   2. Intro fades out, loader fades in
   3. Loader progress bar runs to 100%
   4. Loader fades out, body content appears
   5. Music autoplay attempted
────────────────────────────────────────── */
(function initIntroSequence() {
  const intro      = document.getElementById("introOverlay");
  const loader     = document.getElementById("loader");
  const bar        = document.getElementById("loaderBar");
  const percent    = document.getElementById("loaderPercent");

  if (!intro || !loader) return;

  // Lock scroll during intro + loader
  document.body.style.overflow = "hidden";

  // ── Step 1: Intro plays for ~1.8s, then transitions to loader ──
  const INTRO_DURATION = 1800; // ms

  const introTimer = setTimeout(() => {
    // Fade out intro
    intro.classList.add("hidden");

    // Fade in loader
    loader.classList.add("active");

    // ── Step 2: Run progress bar ──
    runLoader();
  }, INTRO_DURATION);

  // Fallback: force skip intro if something hangs
  const introFallback = setTimeout(() => {
    clearTimeout(introTimer);
    intro.classList.add("hidden");
    loader.classList.add("active");
    runLoader();
  }, 3500);

  function runLoader() {
    let progress = 0;

    const interval = setInterval(() => {
      // Randomised increments — feels organic
      progress += Math.random() * 15 + 5;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        if (bar)     bar.style.width   = "100%";
        if (percent) percent.textContent = "100%";

        // Short pause at 100%, then hide loader
        setTimeout(() => {
          loader.classList.remove("active");
          loader.classList.add("hidden");
          document.body.style.overflow = "";
          clearTimeout(introFallback);
          tryAutoplay();
        }, 420);

      } else {
        if (bar)     bar.style.width     = progress + "%";
        if (percent) percent.textContent = Math.round(progress) + "%";
      }
    }, 90);

    // Hard fallback: hide loader after 5s regardless
    setTimeout(() => {
      clearInterval(interval);
      loader.classList.remove("active");
      loader.classList.add("hidden");
      document.body.style.overflow = "";
      tryAutoplay();
    }, 5000);
  }
})();

/* ──────────────────────────────────────────
   NAVBAR
────────────────────────────────────────── */
(function initNavbar() {
  const navbar     = document.getElementById("navbar");
  const navMenu    = document.getElementById("navMenu");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileLinks = document.querySelectorAll(".mobile-link");
  if (!navbar) return;

  // Scroll effect
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });

  // Mobile menu toggle
  if (navMenu && mobileMenu) {
    navMenu.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      navMenu.classList.toggle("open", isOpen);
      navMenu.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Close on link click
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        mobileMenu.classList.remove("open");
        navMenu.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("open")) {
        navMenu.classList.remove("open");
        mobileMenu.classList.remove("open");
        navMenu.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }
})();

/* ──────────────────────────────────────────
   SMOOTH SCROLL
────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

/* ──────────────────────────────────────────
   SCROLL REVEAL (IntersectionObserver)
────────────────────────────────────────── */
(function initScrollReveal() {
  const elements = document.querySelectorAll(".fade-in");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          // Stagger children if grid
          const children = entry.target.querySelectorAll(
            ".member-card, .contact-card, .gallery-item"
          );
          children.forEach((child, i) => {
            child.style.transitionDelay = i * 0.07 + "s";
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
  );

  elements.forEach((el) => observer.observe(el));
})();

/* ──────────────────────────────────────────
   COUNTER ANIMATION
────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll(".stat-num");
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el       = entry.target;
        const target   = parseInt(el.dataset.target, 10);
        const duration = 1800;
        const start    = performance.now();

        function update(now) {
          const elapsed  = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // easeOutExpo
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(update);
          else el.textContent = target;
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
})();

/* ──────────────────────────────────────────
   VIDEO HERO — Mute & playback handling
   autoplay/muted/loop/playsinline set in HTML.
   This ensures playback resumes if browser
   pauses it (e.g., after tab switch).
────────────────────────────────────────── */
(function initHeroVideo() {
  const video = document.getElementById("heroVideo");
  if (!video) return;

  // Ensure video is muted (required for autoplay on most browsers)
  video.muted = true;

  // Resume if paused (some browsers pause on low battery / power saver)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && video.paused) {
      video.play().catch(() => {/* silent fail */});
    }
  });
})();

/* ──────────────────────────────────────────
   MUSIC PLAYER
────────────────────────────────────────── */
function tryAutoplay() {
  const audio    = document.getElementById("bgMusic");
  const musicBtn = document.getElementById("musicBtn");
  const iconPlay = document.getElementById("iconPlay");
  const iconMute = document.getElementById("iconMute");
  const wave     = document.getElementById("musicWave");
  if (!audio) return;

  audio.volume = 0.35;

  function setPlaying(isPlaying) {
    if (isPlaying) {
      if (iconPlay) iconPlay.style.display = "none";
      if (iconMute) iconMute.style.display = "block";
      if (wave) wave.classList.add("playing");
    } else {
      if (iconPlay) iconPlay.style.display = "block";
      if (iconMute) iconMute.style.display = "none";
      if (wave) wave.classList.remove("playing");
    }
  }

  // Try autoplay
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => setPlaying(true))
      .catch(() => {
        // Autoplay blocked — wait for first user interaction
        setPlaying(false);
        const unlock = () => {
          audio.play().then(() => setPlaying(true)).catch(() => {});
          document.removeEventListener("click", unlock);
          document.removeEventListener("keydown", unlock);
          document.removeEventListener("touchstart", unlock);
        };
        document.addEventListener("click", unlock);
        document.addEventListener("keydown", unlock);
        document.addEventListener("touchstart", unlock, { passive: true });
      });
  }

  // Toggle button
  if (musicBtn) {
    musicBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (audio.paused) {
        audio.play().then(() => setPlaying(true)).catch(() => {});
      } else {
        audio.pause();
        setPlaying(false);
      }
    });
  }
}

/* ──────────────────────────────────────────
   MEMBER FILTER
────────────────────────────────────────── */
(function initFilter() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards      = document.querySelectorAll(".member-card");
  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Active state
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      cards.forEach((card) => {
        const role = card.dataset.role;
        const show = filter === "all" || role === filter;

        if (show) {
          card.classList.remove("hidden");
          // Re-trigger animation
          card.style.animation = "none";
          void card.offsetHeight; // reflow
          card.style.animation = "";
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });
})();

/* ──────────────────────────────────────────
   PARALLAX on hero video (subtle — desktop only)
────────────────────────────────────────── */
(function initParallax() {
  const video = document.getElementById("heroVideo");
  if (!video || window.innerWidth < 768) return;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      video.style.transform = `scale(1.03) translateY(${scrollY * 0.1}px)`;
    }
  }, { passive: true });
})();

/* ──────────────────────────────────────────
   ACTIVE NAV LINK on scroll
────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      const sTop = section.offsetTop - 120;
      if (window.scrollY >= sTop) current = section.getAttribute("id");
    });

    navLinks.forEach((link) => {
      link.classList.remove("active-nav");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active-nav");
      }
    });
  }, { passive: true });
})();

/* ──────────────────────────────────────────
   GALLERY LIGHTBOX
────────────────────────────────────────── */
(function initLightbox() {
  // Create lightbox elements
  const lb = document.createElement("div");
  lb.id = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Image viewer");
  lb.style.cssText = [
    "position:fixed",
    "inset:0",
    "background:rgba(0,0,0,0.95)",
    "z-index:9990",
    "display:none",
    "align-items:center",
    "justify-content:center",
    "cursor:zoom-out",
    "backdrop-filter:blur(10px)",
    "-webkit-backdrop-filter:blur(10px)"
  ].join(";");

  const lbImg = document.createElement("img");
  lbImg.alt = "";
  lbImg.style.cssText = [
    "max-width:90vw",
    "max-height:88vh",
    "object-fit:contain",
    "border:1px solid rgba(201,168,76,0.2)",
    "animation:lbFade .3s ease"
  ].join(";");

  const lbClose = document.createElement("button");
  lbClose.innerHTML = "×";
  lbClose.setAttribute("aria-label", "Close image");
  lbClose.style.cssText = [
    "position:absolute",
    "top:20px",
    "right:30px",
    "font-size:2.5rem",
    "color:rgba(201,168,76,0.7)",
    "background:none",
    "border:none",
    "cursor:pointer",
    "font-family:'Cormorant Garamond',serif",
    "line-height:1",
    "transition:color .3s"
  ].join(";");

  lbClose.addEventListener("mouseenter", () => { lbClose.style.color = "#e8c97a"; });
  lbClose.addEventListener("mouseleave", () => { lbClose.style.color = "rgba(201,168,76,0.7)"; });

  // Inject keyframe
  const lbStyle = document.createElement("style");
  lbStyle.textContent = "@keyframes lbFade{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}";
  document.head.appendChild(lbStyle);

  lb.appendChild(lbImg);
  lb.appendChild(lbClose);
  document.body.appendChild(lb);

  function openLb(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || "";
    lb.style.display = "flex";
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function closeLb() {
    lb.style.display = "none";
    document.body.style.overflow = "";
  }

  lb.addEventListener("click", (e) => {
    if (e.target === lb || e.target === lbClose) closeLb();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLb();
  });

  // Attach to gallery images
  document.querySelectorAll(".gallery-item img").forEach((img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => openLb(img.src, img.alt));
  });
})();

/* ──────────────────────────────────────────
   REDUCED MOTION — disable non-essential animations
   for users who prefer it
────────────────────────────────────────── */
(function respectReducedMotion() {
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Immediately hide intro and loader
  const intro  = document.getElementById("introOverlay");
  const loader = document.getElementById("loader");
  if (intro)  { intro.classList.add("hidden"); }
  if (loader) { loader.classList.add("hidden"); }
  document.body.style.overflow = "";
  tryAutoplay();
})();
