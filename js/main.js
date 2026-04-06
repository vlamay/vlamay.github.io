/**
 * main.js — Core interactivity for Vladyslav Maidaniuk's portfolio
 *
 * Responsibilities:
 *   1. Scroll progress bar
 *   2. Header .scrolled class
 *   3. Custom cursor (dot + lagged ring)
 *   4. Active nav link via IntersectionObserver
 *   5. Smooth scroll with offset
 *   6. Hamburger menu toggle
 *   7. GSAP entrance animations
 *   8. Typed.js initialisation
 *   9. beforeunload cleanup
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     UTILITIES
  ───────────────────────────────────────────────────────────── */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  /* ─────────────────────────────────────────────────────────────
     1. SCROLL PROGRESS BAR
  ───────────────────────────────────────────────────────────── */
  var progressBar = $('.scroll-progress');

  function updateScrollProgress() {
    if (!progressBar) return;
    var scrollTop  = window.scrollY || document.documentElement.scrollTop;
    var docHeight  = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct.toFixed(2) + '%';
  }

  /* ─────────────────────────────────────────────────────────────
     2. HEADER SCROLLED CLASS
  ───────────────────────────────────────────────────────────── */
  var header = $('#header');
  var SCROLL_THRESHOLD = 60;

  function updateHeaderState() {
    if (!header) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  /* ─────────────────────────────────────────────────────────────
     UNIFIED SCROLL HANDLER
  ───────────────────────────────────────────────────────────── */
  function onScroll() {
    updateScrollProgress();
    updateHeaderState();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initialise on load

  /* ─────────────────────────────────────────────────────────────
     3. CUSTOM CURSOR
  ───────────────────────────────────────────────────────────── */
  var cursorDot  = $('.cursor-dot');
  var cursorRing = $('.cursor-ring');

  /* Only enable on pointer devices */
  var supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (supportsHover && cursorDot && cursorRing) {
    var mouse   = { x: -200, y: -200 };
    var ring    = { x: -200, y: -200 };
    var rafId   = null;
    var isVisible = false;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animateCursor() {
      ring.x = lerp(ring.x, mouse.x, 0.12);
      ring.y = lerp(ring.y, mouse.y, 0.12);

      cursorDot.style.left  = mouse.x + 'px';
      cursorDot.style.top   = mouse.y + 'px';
      cursorRing.style.left = ring.x + 'px';
      cursorRing.style.top  = ring.y + 'px';

      rafId = requestAnimationFrame(animateCursor);
    }

    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (!isVisible) {
        isVisible = true;
        cursorDot.style.opacity  = '1';
        cursorRing.style.opacity = '1';
      }
    });

    document.addEventListener('mouseleave', function () {
      isVisible = false;
      cursorDot.style.opacity  = '0';
      cursorRing.style.opacity = '0';
    });

    /* Scale ring on interactive elements */
    var hoverTargets = 'a, button, [role="button"], input, textarea, select, label, .hero__tag';

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverTargets)) {
        cursorRing.classList.add('is-hovering');
      }
    });

    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverTargets)) {
        cursorRing.classList.remove('is-hovering');
      }
    });

    /* Start loop */
    rafId = requestAnimationFrame(animateCursor);

    /* Store ref for cleanup */
    window._cursorRafId = rafId;
  }

  /* ─────────────────────────────────────────────────────────────
     4. ACTIVE NAV LINK — IntersectionObserver
  ───────────────────────────────────────────────────────────── */
  var navLinks = $$('.header__nav-link');
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href').replace('#', '');
      return document.getElementById(id);
    })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var activeSection = null;

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            activeSection = entry.target.id;
            navLinks.forEach(function (link) {
              var href = link.getAttribute('href').replace('#', '');
              if (href === activeSection) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'true');
              } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
              }
            });
          }
        });
      },
      {
        rootMargin: '-20% 0px -65% 0px',
        threshold: 0
      }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ─────────────────────────────────────────────────────────────
     5. SMOOTH SCROLL WITH OFFSET
  ───────────────────────────────────────────────────────────── */
  var SCROLL_OFFSET = 80; // header height + buffer

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;

    var targetId = link.getAttribute('href');
    if (targetId === '#') return;

    var targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();

    var targetTop = targetEl.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth'
    });

    /* Close mobile nav if open */
    closeMobileNav();
  });

  /* ─────────────────────────────────────────────────────────────
     6. HAMBURGER MENU
  ───────────────────────────────────────────────────────────── */
  var burger  = $('.header__burger');
  var navEl   = $('.header__nav');

  function closeMobileNav() {
    if (!burger || !navEl) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    navEl.classList.remove('nav-open');
    document.body.style.overflow = '';
  }

  function openMobileNav() {
    if (!burger || !navEl) return;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    navEl.classList.add('nav-open');
    document.body.style.overflow = 'hidden';
  }

  if (burger && navEl) {
    burger.addEventListener('click', function () {
      var isOpen = burger.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMobileNav();
      }
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (
        burger.getAttribute('aria-expanded') === 'true' &&
        !navEl.contains(e.target) &&
        !burger.contains(e.target)
      ) {
        closeMobileNav();
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     7. GSAP ENTRANCE ANIMATIONS
  ───────────────────────────────────────────────────────────── */
  function initGSAP() {
    if (typeof gsap === 'undefined') return;

    /* Register ScrollTrigger if available */
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    /* Hero stagger sequence */
    var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl
      .from('.hero__eyebrow', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.2
      })
      .from('.hero__name', {
        opacity: 0,
        y: 30,
        duration: 0.75
      }, '-=0.3')
      .from('.hero__role', {
        opacity: 0,
        y: 20,
        duration: 0.55
      }, '-=0.45')
      .from('.hero__bio', {
        opacity: 0,
        y: 20,
        duration: 0.55
      }, '-=0.35')
      .from('.hero__actions', {
        opacity: 0,
        y: 20,
        duration: 0.5
      }, '-=0.3')
      .from('.hero__tags', {
        opacity: 0,
        y: 16,
        duration: 0.45
      }, '-=0.25')
      .from('.hero__visual', {
        opacity: 0,
        x: 40,
        duration: 0.75,
        ease: 'power2.out'
      }, '-=0.9')
      .from('.hero__scroll-hint', {
        opacity: 0,
        y: -12,
        duration: 0.4
      }, '-=0.2');

    /* Header entrance */
    gsap.from('.header', {
      opacity: 0,
      y: -20,
      duration: 0.6,
      ease: 'power2.out',
      delay: 0.1
    });
  }

  /* ─────────────────────────────────────────────────────────────
     8. TYPED.JS INITIALISATION
  ───────────────────────────────────────────────────────────── */
  function initTyped() {
    if (typeof Typed === 'undefined') return;

    var typedEl = document.getElementById('hero-typed');
    if (!typedEl) return;

    window._typedInstance = new Typed('#hero-typed', {
      strings: [
        'Senior AWS Cloud Engineer',
        'Platform &amp; Integration Engineer',
        'MLOps &amp; SRE Engineer',
        'DevSecOps Specialist',
        'Infrastructure Architect'
      ],
      typeSpeed:  60,
      backSpeed:  30,
      backDelay:  2200,
      startDelay: 800,
      loop:       true,
      cursorChar: '█',
      smartBackspace: true
    });
  }

  /* ─────────────────────────────────────────────────────────────
     DOMCONTENTLOADED BOOTSTRAP
  ───────────────────────────────────────────────────────────── */
  function onReady() {
    /* GSAP may be deferred — poll briefly */
    if (typeof gsap !== 'undefined') {
      initGSAP();
    } else {
      var gsapPoll = setInterval(function () {
        if (typeof gsap !== 'undefined') {
          clearInterval(gsapPoll);
          initGSAP();
        }
      }, 100);
      /* Give up after 4 s */
      setTimeout(function () { clearInterval(gsapPoll); }, 4000);
    }

    /* Typed.js */
    if (typeof Typed !== 'undefined') {
      initTyped();
    } else {
      var typedPoll = setInterval(function () {
        if (typeof Typed !== 'undefined') {
          clearInterval(typedPoll);
          initTyped();
        }
      }, 100);
      setTimeout(function () { clearInterval(typedPoll); }, 4000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  /* ─────────────────────────────────────────────────────────────
     9. CLEANUP ON UNLOAD
  ───────────────────────────────────────────────────────────── */
  window.addEventListener('beforeunload', function () {
    /* Cancel cursor RAF */
    if (window._cursorRafId) {
      cancelAnimationFrame(window._cursorRafId);
    }

    /* Destroy Typed instance */
    if (window._typedInstance) {
      try {
        window._typedInstance.destroy();
      } catch (e) { /* silent */ }
    }

    /* Disconnect observers if accessible */
    if (typeof sectionObserver !== 'undefined' && sectionObserver) {
      sectionObserver.disconnect();
    }
  });

})();
