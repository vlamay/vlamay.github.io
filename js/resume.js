/* ============================================================
   Resume interactions
   ============================================================ */

/* ─── Print / PDF trigger ─────────────────── */
(() => {
  document.querySelectorAll('.resume-download').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      // tiny delay so any scroll reveals don't hold opacity:0 for print
      document.body.classList.add('printing');
      setTimeout(() => {
        window.print();
        document.body.classList.remove('printing');
      }, 100);
    });
  });
})();

/* ─── Hero name reveal ─────────────────── */
window.addEventListener('load', () => {
  if (typeof gsap === 'undefined') return;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.nav', { y: -30, opacity: 0, duration: 0.8 })
    .from('.r-hero .hero__eyebrow', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.r-hero__name [data-line]', { y: '110%', opacity: 1, duration: 1.0, stagger: 0.12 }, '-=0.3')
    .from('.r-hero__title, .r-hero__strap', { y: 18, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.5')
    .from('.r-hero__meta > div', { y: 18, opacity: 0, duration: 0.5, stagger: 0.05 }, '-=0.5')
    .from('.r-hero__actions > *', { y: 18, opacity: 0, duration: 0.5, stagger: 0.06 }, '-=0.4')
    .from('.r-hero__card', { x: 60, opacity: 0, duration: 1.0, ease: 'expo.out' }, '-=1');
});

/* ─── Timeline rail progress + active markers ─── */
(() => {
  const rail = document.querySelector('.r-timeline__rail');
  const exps = document.querySelectorAll('.r-exp');
  const timeline = document.querySelector('.r-timeline');
  if (!rail || !timeline || !exps.length) return;

  function onScroll() {
    const rect = timeline.getBoundingClientRect();
    const viewY = window.innerHeight * 0.4;
    const total = rect.height;
    const progress = Math.max(0, Math.min(1, (viewY - rect.top) / total));
    rail.style.setProperty('--rail', (progress * 100) + '%');

    exps.forEach(exp => {
      const r = exp.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.5 && r.bottom > 100) {
        exp.classList.add('is-active');
      } else {
        exp.classList.remove('is-active');
      }
    });
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ─── Reveal on scroll ─────────────────── */
(() => {
  if (typeof gsap === 'undefined') return;
  const targets = document.querySelectorAll(
    '.r-head, .r-summary, .r-problem, .r-exp, .r-stack__row, .cert, .r-edu__item, .r-cta'
  );
  targets.forEach(el => {
    gsap.fromTo(el,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' }
      });
  });
})();
