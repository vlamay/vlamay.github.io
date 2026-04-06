/**
 * counters.js
 * Animates [data-count] elements from 0 to their target value when they enter
 * the viewport.  Supports integers, floats, and appended suffix strings.
 *
 * Usage:
 *   <span data-count="50" data-suffix="+">0</span>
 *   <span data-count="99.9" data-suffix="%">0</span>
 *   <span data-count="6">0</span>
 *
 * Attributes:
 *   data-count   — target numeric value (required)
 *   data-suffix  — string appended after the number (optional, e.g. "+" or "%")
 *   data-prefix  — string prepended before the number (optional, e.g. "$")
 *   data-decimals— force decimal places (optional); auto-detected from data-count
 *
 * Animation:
 *   - Ease-out cubic over 1500 ms
 *   - requestAnimationFrame based
 *   - Fires once per element (unobserved after trigger)
 *   - Respects prefers-reduced-motion (jumps to final value immediately)
 */

(() => {
  'use strict';

  const DURATION  = 1500;  // ms
  const THRESHOLD = 0.5;   // 50% of element must be visible to trigger

  const reducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Easing function ──────────────────────────────────────────────────── */
  /** Ease-out cubic: starts fast, decelerates to target */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /* ─── Parse target and format options from an element ───────────────────── */
  function parseElement(el) {
    const raw      = el.dataset.count;
    const target   = parseFloat(raw);
    const suffix   = el.dataset.suffix   ?? '';
    const prefix   = el.dataset.prefix   ?? '';

    // Auto-detect decimal places from the supplied value string
    const dotIndex = raw.indexOf('.');
    const decimals = parseInt(el.dataset.decimals, 10) ||
                     (dotIndex !== -1 ? raw.length - dotIndex - 1 : 0);

    return { target, suffix, prefix, decimals };
  }

  /* ─── Format a number for display ───────────────────────────────────────── */
  function formatNumber(value, decimals) {
    return decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toString();
  }

  /* ─── Animate a single element ──────────────────────────────────────────── */
  function animateCounter(el) {
    const { target, suffix, prefix, decimals } = parseElement(el);

    if (isNaN(target)) {
      console.warn('[counters.js] Invalid data-count value on element:', el);
      return;
    }

    // Instant mode for reduced-motion
    if (reducedMotion) {
      el.textContent = prefix + formatNumber(target, decimals) + suffix;
      return;
    }

    const startTime = performance.now();

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);   // clamp 0–1
      const eased    = easeOutCubic(progress);
      const current  = eased * target;

      el.textContent = prefix + formatNumber(current, decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Ensure we land precisely on the target value
        el.textContent = prefix + formatNumber(target, decimals) + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  /* ─── IntersectionObserver setup ───────────────────────────────────────── */
  function initCounters() {
    const elements = document.querySelectorAll('[data-count]');

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            obs.unobserve(entry.target);   // trigger only once
            animateCounter(entry.target);
          }
        });
      },
      { threshold: THRESHOLD }
    );

    elements.forEach(el => observer.observe(el));
  }

  /* ─── Boot ──────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
  } else {
    initCounters();
  }

})();
