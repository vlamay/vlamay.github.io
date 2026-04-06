/* ============================================================
   ANIMATIONS.JS — GSAP ScrollTrigger
   Vladyslav Maidaniuk — Senior Cloud Engineer Portfolio
   ============================================================ */

// Wait for GSAP to load
function initAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    setTimeout(initAnimations, 100);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Reveal all .reveal elements
  gsap.utils.toArray('.reveal').forEach(function (el) {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      }
    );
  });

  // Stagger grid children (project cards, skill categories, cert cards)
  ['.projects-grid', '.skills-grid', '.certs-grid', '.stats-grid'].forEach(function (selector) {
    var grid = document.querySelector(selector);
    if (!grid) return;
    gsap.fromTo(grid.children,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: grid, start: 'top 80%', toggleActions: 'play none none none' }
      }
    );
  });

  // Animate timeline items stagger
  gsap.fromTo('.exp-item',
    { opacity: 0, x: -20 },
    {
      opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', stagger: 0.15,
      scrollTrigger: { trigger: '.experience-timeline', start: 'top 75%' }
    }
  );

  // Skills bars: animate widths when section enters view
  ScrollTrigger.create({
    trigger: '#skills',
    start: 'top 70%',
    once: true,
    onEnter: function () {
      document.querySelectorAll('.skill-bar__fill').forEach(function (bar) {
        bar.classList.add('is-animated');
      });
    }
  });

  // Parallax on hero aurora (subtle)
  if (window.innerWidth > 768) {
    gsap.to('.hero__aurora', {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });
  }
}

// Back to top button
var backToTop = document.getElementById('back-to-top');
if (backToTop) {
  window.addEventListener('scroll', function () {
    backToTop.classList.toggle('is-visible', window.scrollY > 600);
  }, { passive: true });
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Contact form validation
var contactForm = document.getElementById('contact-form');
if (contactForm) {
  var fields = {
    name: { el: document.getElementById('contact-name'), errId: 'name-error', validate: function (v) { return v.trim().length >= 2; } },
    email: { el: document.getElementById('contact-email'), errId: 'email-error', validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); } },
    message: { el: document.getElementById('contact-message'), errId: 'message-error', validate: function (v) { return v.trim().length >= 10; } }
  };

  Object.values(fields).forEach(function (f) {
    if (f.el) {
      f.el.addEventListener('input', function () {
        f.el.closest('.form-group').classList.remove('has-error');
      });
    }
  });

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;
    Object.values(fields).forEach(function (f) {
      if (!f.el || !f.validate(f.el.value)) {
        if (f.el) f.el.closest('.form-group').classList.add('has-error');
        valid = false;
      }
    });
    if (!valid) return;
    var btn = contactForm.querySelector('.contact-submit');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    setTimeout(function () {
      contactForm.style.display = 'none';
      var successEl = document.getElementById('form-success');
      if (successEl) successEl.style.display = 'block';
    }, 800);
  });
}

document.addEventListener('DOMContentLoaded', initAnimations);
