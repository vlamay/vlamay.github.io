/* ============================================================
   Portfolio — interaction + scroll
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ─── Custom cursor ─────────────────────────────── */
(() => {
  if (window.matchMedia('(max-width: 900px)').matches) return;
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  let mx = window.innerWidth/2, my = window.innerHeight/2;
  let rx = mx, ry = my;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    dot.style.transform  = `translate3d(${mx}px, ${my}px, 0) translate(-50%,-50%)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('a, button, .btn, .work-card, .xcard, .stat, .contact__link, .nav__logo').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });
})();

/* ─── Scroll progress ───────────────────────────── */
(() => {
  const bar = document.querySelector('.scroll-progress__bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const p = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    bar.style.width = p + '%';
  }, { passive: true });
})();

/* ─── Hero intro ─────────────────────────────────── */
window.addEventListener('load', () => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.nav', { y: -30, opacity: 0, duration: 0.8 })
    .from('.hero__eyebrow', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.hero__title [data-line]', { y: '110%', opacity: 1, duration: 1.1, stagger: 0.12 }, '-=0.3')
    .from('.hero__bio > *', { y: 20, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.6')
    .from('.hero__stack', { y: 20, opacity: 0, duration: 0.7 }, '-=0.6')
    .from('.hero__actions > *', { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.5')
    .from('.hero__terminal', { x: 80, opacity: 0, duration: 1.2, ease: 'expo.out' }, '-=1')
    .from('.hero__scroll', { opacity: 0, duration: 0.8 }, '-=0.4')
    .from('.hero__meta > *', { x: 20, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.8');
});

/* ─── Orb parallax ──────────────────────────────── */
(() => {
  const em = document.querySelector('.orb--emerald');
  const bl = document.querySelector('.orb--blue');
  if (em) {
    gsap.to(em, { yPercent: 40, xPercent: 20, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }
  if (bl) {
    gsap.to(bl, { yPercent: -30, xPercent: -20, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }
  const term = document.querySelector('.hero__terminal');
  if (term) {
    gsap.to(term, { y: 140, rotation: 2, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } });
  }
})();

/* ─── Section reveals ───────────────────────────── */
(() => {
  const revealTargets = document.querySelectorAll(
    '.section-head, .stat, .story__step, .work-card, .stack-card, .certs, .contact__mega, .contact__link, .xcard, .quote blockquote, .quote__mark, .quote__attribution'
  );
  revealTargets.forEach(el => {
    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
      });
  });
})();

/* ─── Stat counters ─────────────────────────────── */
(() => {
  document.querySelectorAll('.stat__num').forEach(el => {
    const target   = parseFloat(el.dataset.count);
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: target, duration: 2.2, ease: 'power3.out',
          onUpdate: () => {
            el.textContent = prefix + obj.v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + suffix;
          }
        });
      }
    });
  });
})();

/* ─── Skill bars ────────────────────────────────── */
(() => {
  document.querySelectorAll('.bar').forEach(bar => {
    ScrollTrigger.create({
      trigger: bar, start: 'top 90%', once: true,
      onEnter: () => bar.classList.add('is-animated')
    });
  });
})();

/* ─── Experience horizontal scroll ──────────────── */
(() => {
  const wrap  = document.querySelector('.experience__horiz-wrap');
  const track = document.querySelector('.experience__horiz');
  const rail  = document.querySelector('.xrail__progress');
  const section = document.querySelector('.experience');
  if (!wrap || !track || !section) return;

  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  if (isMobile) {
    // Let it scroll horizontally natively on mobile
    wrap.style.overflowX = 'auto';
    wrap.style.scrollSnapType = 'x mandatory';
    track.querySelectorAll('.xcard').forEach(c => { c.style.scrollSnapAlign = 'start'; });
    return;
  }

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${track.scrollWidth - window.innerWidth + 200}`,
    pin: true,
    scrub: 0.8,
    anticipatePin: 1,
    onUpdate: self => {
      const x = -(track.scrollWidth - window.innerWidth + 60) * self.progress;
      gsap.set(track, { x });
      if (rail) rail.style.width = (self.progress * 100) + '%';
    }
  });
})();

/* ─── Story step highlight on scroll ─────────── */
(() => {
  const steps = document.querySelectorAll('.story__step');
  steps.forEach(step => {
    gsap.fromTo(step,
      { opacity: 0.3 },
      {
        opacity: 1, duration: 0.4,
        scrollTrigger: { trigger: step, start: 'top 75%', end: 'top 40%', scrub: true }
      });
  });
})();

/* ─── Marquee reactivity ────────────────────────── */
(() => {
  const track = document.querySelector('.marquee__track');
  if (!track) return;
  let dir = 1, lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    dir = y > lastY ? 1 : -1;
    lastY = y;
    track.style.animationDirection = dir === 1 ? 'normal' : 'reverse';
  }, { passive: true });
})();

/* ─── Nav active state ──────────────────────────── */
(() => {
  const links = document.querySelectorAll('.nav__links a');
  const sections = ['about','experience','work','stack','contact'].map(id => document.getElementById(id));
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 200;
    let active = null;
    sections.forEach(s => { if (s && s.offsetTop <= y) active = s.id; });
    links.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + active ? 'var(--fg)' : '';
    });
  }, { passive: true });
})();

/* ─── Contact signature sway ────────────────────── */
(() => {
  const sig = document.querySelector('.signature');
  if (!sig) return;
  gsap.fromTo(sig,
    { xPercent: 10 },
    {
      xPercent: -10,
      scrollTrigger: { trigger: sig, start: 'top bottom', end: 'bottom top', scrub: true }
    });
})();
