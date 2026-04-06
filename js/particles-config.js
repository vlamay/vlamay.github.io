/**
 * particles-config.js
 * Initialises particles.js for the hero section.
 * Only runs on viewports >= 768px.
 * Uses IntersectionObserver to pause/resume the animation
 * when the hero section scrolls out of / back into view.
 */

(function () {
  'use strict';

  /* ── Guard: skip on small screens ───────────────────────── */
  if (window.innerWidth < 768) return;

  /* ── Config object ───────────────────────────────────────── */
  var PARTICLES_CONFIG = {
    particles: {
      number: {
        value: 60,
        density: {
          enable: true,
          value_area: 900
        }
      },
      color: {
        value: ['#00d4ff', '#7c3aed', '#00ff88']
      },
      shape: {
        type: 'circle',
        stroke: {
          width: 0,
          color: '#000000'
        }
      },
      opacity: {
        value: 0.45,
        random: true,
        anim: {
          enable: true,
          speed: 0.8,
          opacity_min: 0.1,
          sync: false
        }
      },
      size: {
        value: 2.5,
        random: true,
        anim: {
          enable: true,
          speed: 1.2,
          size_min: 0.5,
          sync: false
        }
      },
      line_linked: {
        enable: true,
        distance: 180,
        color: '#00d4ff',
        opacity: 0.15,
        width: 1
      },
      move: {
        enable: true,
        speed: 1.5,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: {
          enable: true,
          mode: 'grab'
        },
        onclick: {
          enable: true,
          mode: 'push'
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 160,
          line_linked: {
            opacity: 0.45
          }
        },
        push: {
          particles_nb: 3
        },
        repulse: {
          distance: 120,
          duration: 0.4
        },
        bubble: {
          distance: 200,
          size: 4,
          duration: 2,
          opacity: 0.8,
          speed: 3
        }
      }
    },
    retina_detect: true
  };

  /* ── Init helper ─────────────────────────────────────────── */
  function initParticles() {
    if (typeof particlesJS === 'undefined') {
      /* Library not loaded yet — wait for it */
      window.addEventListener('load', function () {
        if (typeof particlesJS !== 'undefined') {
          particlesJS('particles-js', PARTICLES_CONFIG);
          setupObserver();
        }
      });
      return;
    }
    particlesJS('particles-js', PARTICLES_CONFIG);
    setupObserver();
  }

  /* ── IntersectionObserver: pause/resume ──────────────────── */
  function setupObserver() {
    var heroSection = document.getElementById('hero');
    if (!heroSection) return;

    /* pJSDom is the global array particles.js populates */
    function getpJS() {
      return window.pJSDom && window.pJSDom.length > 0
        ? window.pJSDom[0].pJS
        : null;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var pJS = getpJS();
          if (!pJS) return;

          if (entry.isIntersecting) {
            /* Hero visible — resume animation */
            if (pJS.fn && pJS.fn.vendors && pJS.fn.vendors.densityAutoParticles) {
              pJS.fn.vendors.densityAutoParticles();
            }
            if (pJS.canvas && pJS.canvas.el) {
              /* Re-start the draw loop if it was stopped */
              try {
                pJS.fn.vendors.draw();
              } catch (e) { /* already running */ }
            }
          } else {
            /* Hero out of view — stop the draw loop to save CPU */
            if (pJS.fn && pJS.fn.vendors && pJS.fn.vendors.destroypJS === false) {
              /* Cancel animation frame */
              if (pJS.fn.requestAnimFrame) {
                window.cancelAnimationFrame(pJS.fn.requestAnimFrame);
              }
            }
          }
        });
      },
      {
        rootMargin: '0px',
        threshold: 0.01
      }
    );

    observer.observe(heroSection);
  }

  /* ── Bootstrap ───────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticles);
  } else {
    initParticles();
  }
})();
