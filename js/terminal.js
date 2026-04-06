/**
 * terminal.js
 * Animated DevOps terminal showcase for Vladyslav Maidaniuk's portfolio.
 *
 * No external dependencies — pure requestAnimationFrame / setTimeout typewriter.
 * Respects prefers-reduced-motion by falling back to a static final state.
 */

(() => {
  'use strict';

  /* ─── DOM refs ─────────────────────────────────────────────────────────── */
  const outputEl  = document.getElementById('terminal-output');
  const cmdEl     = document.getElementById('terminal-cmd-display');
  const cursorEl  = document.getElementById('terminal-cursor');
  const sectionEl = document.getElementById('terminal');

  if (!outputEl || !cmdEl || !sectionEl) return;

  /* ─── Motion preference ─────────────────────────────────────────────────── */
  const reducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Sequence data ─────────────────────────────────────────────────────── */
  /**
   * Each sequence:
   *   cmd     — string to type at the prompt
   *   output  — array of { text, cls } lines to print after the command
   *   pauseMs — ms to linger before clearing and typing next command
   */
  const SEQUENCES = [
    {
      cmd: 'kubectl get pods -n production',
      output: [
        { text: 'NAME                                    READY   STATUS    RESTARTS   AGE', cls: 't-dim' },
        { text: 'api-gateway-6d8f9b7c5-xk2qp             1/1     Running   0          4d', cls: 't-success' },
        { text: 'auth-service-7b4d5c8f9-lm3rt             1/1     Running   0          4d', cls: 't-success' },
        { text: 'detection-engine-5f6g7h8j9-np4su         1/1     Running   0          2d', cls: 't-success' },
        { text: 'telemetry-collector-4e5f6g7h8-qr5tv      1/1     Running   1          6d', cls: 't-success' },
        { text: 'update-orchestrator-3d4e5f6g7-wu6xy      1/1     Running   0          1d', cls: 't-success' },
      ],
      pauseMs: 2800,
    },
    {
      cmd: 'terraform plan -var-file=prod.tfvars',
      output: [
        { text: 'Initializing the backend...', cls: 't-dim' },
        { text: 'Acquiring state lock. This may take a few moments...', cls: 't-dim' },
        { text: '', cls: '' },
        { text: 'Terraform used the selected providers to generate the following execution plan.', cls: 't-output' },
        { text: 'Resource actions are indicated with the following symbols:', cls: 't-output' },
        { text: '  + create   ~ update in-place', cls: 't-dim' },
        { text: '', cls: '' },
        { text: 'Plan: 3 to add, 1 to change, 0 to destroy.', cls: 't-success' },
      ],
      pauseMs: 2600,
    },
    {
      cmd: 'helm upgrade monitoring prometheus-community/kube-prometheus-stack -n monitoring',
      output: [
        { text: 'Release "monitoring" does not exist. Installing it now.', cls: 't-dim' },
        { text: 'W0403 12:34:56 warning: Kubernetes is deprecated...', cls: 't-dim' },
        { text: 'NAME: monitoring', cls: 't-output' },
        { text: 'LAST DEPLOYED: Thu Apr  3 12:34:59 2025', cls: 't-output' },
        { text: 'NAMESPACE: monitoring', cls: 't-output' },
        { text: 'STATUS: deployed', cls: 't-output' },
        { text: "NOTES: Release 'monitoring' has been upgraded. Happy Helming! ⎈", cls: 't-success' },
      ],
      pauseMs: 2600,
    },
    {
      cmd: "aws eks describe-cluster --name prod-eset --region eu-west-1 | jq .cluster.status",
      output: [
        { text: '"ACTIVE"', cls: 't-success' },
      ],
      pauseMs: 2200,
    },
  ];

  /* ─── Static fallback (reduced-motion) ─────────────────────────────────── */
  function renderStatic() {
    const last = SEQUENCES[SEQUENCES.length - 1];

    SEQUENCES.forEach(seq => {
      appendEchoLine(`❯ ${seq.cmd}`);
      seq.output.forEach(({ text, cls }) => appendOutputLine(text, cls || 't-output'));
      appendOutputLine('', '');
    });

    // Keep prompt clean
    cmdEl.textContent = '';
    if (cursorEl) cursorEl.style.display = 'none';
  }

  /* ─── DOM helpers ───────────────────────────────────────────────────────── */
  function appendEchoLine(text) {
    const span = document.createElement('span');
    span.className = 't-line t-cmd-echo';
    span.textContent = text;
    outputEl.appendChild(span);
    scrollBottom();
  }

  function appendOutputLine(text, cls) {
    const span = document.createElement('span');
    span.className = cls ? `t-line ${cls}` : 't-line';
    span.textContent = text;
    outputEl.appendChild(span);
    scrollBottom();
  }

  function scrollBottom() {
    const body = document.getElementById('terminal-showcase-body');
    if (body) body.scrollTop = body.scrollHeight;
  }

  function clearOutput() {
    outputEl.innerHTML = '';
    cmdEl.textContent  = '';
  }

  /* ─── Typewriter ────────────────────────────────────────────────────────── */
  /**
   * Types `text` character by character into `el`, calling `onDone` when finished.
   * @param {HTMLElement} el
   * @param {string}      text
   * @param {number}      speed   ms per character (average — slight jitter added)
   * @param {Function}    onDone
   */
  function typeWriter(el, text, speed, onDone) {
    let i = 0;

    function step() {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
        scrollBottom();
        // Natural typing jitter: ±30% of base speed
        const jitter = speed * 0.3;
        const delay  = speed - jitter + Math.random() * jitter * 2;
        setTimeout(step, delay);
      } else {
        onDone();
      }
    }

    step();
  }

  /* ─── Print output lines with staggered delay ───────────────────────────── */
  function printOutputLines(lines, lineDelay, onDone) {
    if (lines.length === 0) { onDone(); return; }

    let idx = 0;

    function next() {
      if (idx >= lines.length) { onDone(); return; }
      const { text, cls } = lines[idx++];
      appendOutputLine(text, cls || 't-output');
      setTimeout(next, lineDelay);
    }

    next();
  }

  /* ─── Main animation loop ───────────────────────────────────────────────── */
  let seqIndex    = 0;
  let isRunning   = false;
  let stopRequest = false;

  function runSequence() {
    if (stopRequest) { isRunning = false; return; }

    const seq = SEQUENCES[seqIndex % SEQUENCES.length];
    seqIndex++;

    // Type the command
    typeWriter(cmdEl, seq.cmd, 55, () => {
      if (stopRequest) { isRunning = false; return; }

      // Simulate pressing Enter: echo command to output, clear prompt line
      appendEchoLine(`❯ ${seq.cmd}`);
      cmdEl.textContent = '';

      // Brief pause before output floods in (simulates command execution)
      setTimeout(() => {
        if (stopRequest) { isRunning = false; return; }

        printOutputLines(seq.output, 90, () => {
          if (stopRequest) { isRunning = false; return; }

          // Empty line separator
          appendOutputLine('', '');

          // Pause at result, then move to next sequence
          setTimeout(() => {
            if (stopRequest) { isRunning = false; return; }

            // Fade-clear: quickly blank the output for the next command
            clearOutput();

            // Small pause before typing next command
            setTimeout(runSequence, 400);
          }, seq.pauseMs);
        });
      }, 260);
    });
  }

  function startAnimation() {
    if (isRunning) return;
    isRunning   = true;
    stopRequest = false;
    clearOutput();
    runSequence();
  }

  /* ─── IntersectionObserver — trigger once when #terminal is visible ─────── */
  function initObserver() {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            obs.unobserve(entry.target);  // fire only once

            if (reducedMotion) {
              renderStatic();
            } else {
              startAnimation();
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(sectionEl);
  }

  /* ─── Pause animation when tab is hidden, resume when visible ───────────── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopRequest = true;
    } else if (isRunning === false && !reducedMotion) {
      // Resume from where we left off
      isRunning = true;
      stopRequest = false;
      clearOutput();
      runSequence();
    }
  });

  /* ─── Boot ──────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }

})();
