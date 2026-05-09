/**
 * rng.js — Random Number Generator System
 * Real-time: generates 1 number every 60 seconds
 * Features: configurable range, history log, statistics
 */

'use strict';

// ── Constants ─────────────────────────────────────────────
const INTERVAL_MS   = 60 * 1000;   // 1 minute in milliseconds
const RING_CIRC     = 2 * Math.PI * 88; // circumference of SVG ring (r=88)
const MAX_HISTORY   = 50;

// ── State ─────────────────────────────────────────────────
const state = {
  history:   [],           // { number, timestamp, min, max }
  timerStart: null,        // when the current 60-s window began
  intervalId: null,        // setInterval handle
  rafId:      null,        // requestAnimationFrame handle
  isRunning:  false,
};

// ── DOM refs ──────────────────────────────────────────────
const $num     = () => document.getElementById('numberOutput');
const $tag     = () => document.getElementById('genTag');
const $ring    = () => document.getElementById('ringProgress');
const $cd      = () => document.getElementById('timerCountdown');
const $list    = () => document.getElementById('historyList');
const $count   = () => document.getElementById('historyCount');
const $total   = () => document.getElementById('statTotal');
const $sMin    = () => document.getElementById('statMin');
const $sMax    = () => document.getElementById('statMax');
const $sAvg    = () => document.getElementById('statAvg');
const $minIn   = () => document.getElementById('minVal');
const $maxIn   = () => document.getElementById('maxVal');

// ── Core RNG ──────────────────────────────────────────────

/**
 * Generate a cryptographically-seeded random integer [min, max].
 * Falls back to Math.random if Web Crypto is unavailable.
 */
function secureRandInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  if (min > max) [min, max] = [max, min];

  const range = max - min + 1;

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Use 32-bit entropy; reject values outside an even multiple of range
    // to avoid modulo bias.
    const maxUnbiased = Math.floor(0x100000000 / range) * range;
    let rand;
    do {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      rand = arr[0];
    } while (rand >= maxUnbiased);
    return min + (rand % range);
  }

  // Fallback
  return Math.floor(Math.random() * range) + min;
}

// ── Generation ────────────────────────────────────────────

function generate() {
  const minVal = parseInt($minIn().value, 10) || 1;
  const maxVal = parseInt($maxIn().value, 10) || 100;

  if (isNaN(minVal) || isNaN(maxVal)) return;

  const number = secureRandInt(minVal, maxVal);
  const entry  = { number, timestamp: new Date(), min: minVal, max: maxVal };

  state.history.unshift(entry);
  if (state.history.length > MAX_HISTORY) state.history.pop();

  updateDisplay(entry);
  updateHistory();
  updateStats();
  resetTimer();
}

// ── Display ───────────────────────────────────────────────

function updateDisplay(entry) {
  const el = $num();
  el.textContent = entry.number;
  el.classList.remove('flash');
  // Force reflow to restart animation
  void el.offsetWidth;
  el.classList.add('flash');

  $tag().textContent = `RANGE [${entry.min} – ${entry.max}] · ${formatTime(entry.timestamp)}`;
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
}

// ── Timer ─────────────────────────────────────────────────

function resetTimer() {
  state.timerStart = performance.now();
}

function startSystem() {
  if (state.isRunning) return;
  state.isRunning = true;
  state.timerStart = performance.now();

  // Auto-generate every 60 seconds
  state.intervalId = setInterval(generate, INTERVAL_MS);

  // Smooth ring + countdown via rAF
  function tick() {
    const elapsed  = performance.now() - state.timerStart;
    const fraction = Math.min(elapsed / INTERVAL_MS, 1);
    const secsLeft = Math.ceil((INTERVAL_MS - elapsed) / 1000);

    // Ring: goes from full → empty over 60 s
    const offset = RING_CIRC * fraction;
    const ring   = $ring();
    ring.style.strokeDashoffset = offset;

    // Warning colour when ≤ 10 seconds remain
    if (secsLeft <= 10) {
      ring.classList.add('warning');
    } else {
      ring.classList.remove('warning');
    }

    $cd().textContent = Math.max(secsLeft, 0);

    state.rafId = requestAnimationFrame(tick);
  }

  state.rafId = requestAnimationFrame(tick);
}

// ── History UI ────────────────────────────────────────────

function updateHistory() {
  const list = $list();
  list.innerHTML = '';

  if (state.history.length === 0) {
    list.innerHTML = '<li class="history-empty">No history yet.</li>';
    $count().textContent = '0 entries';
    return;
  }

  state.history.forEach((entry, i) => {
    const li = document.createElement('li');
    li.className = 'history-item' + (i === 0 ? ' new-entry' : '');
    li.innerHTML = `
      <span class="history-index">#${String(state.history.length - i).padStart(3, '0')}</span>
      <span class="history-number">${entry.number}</span>
      <span class="history-range">[${entry.min}–${entry.max}]</span>
      <span class="history-time">${formatTime(entry.timestamp)}</span>
    `;
    list.appendChild(li);
  });

  $count().textContent = `${state.history.length} entr${state.history.length === 1 ? 'y' : 'ies'}`;
}

// ── Statistics ────────────────────────────────────────────

function updateStats() {
  const nums = state.history.map(e => e.number);
  if (nums.length === 0) return;

  const total = nums.length;
  const min   = Math.min(...nums);
  const max   = Math.max(...nums);
  const avg   = (nums.reduce((a, b) => a + b, 0) / total).toFixed(1);

  $total().textContent = total;
  $sMin().textContent  = min;
  $sMax().textContent  = max;
  $sAvg().textContent  = avg;
}

// ── Public actions (called from HTML) ─────────────────────

function generateNow() {
  generate();
}

function resetSystem() {
  // Stop existing timer
  if (state.intervalId) clearInterval(state.intervalId);
  if (state.rafId)      cancelAnimationFrame(state.rafId);
  state.isRunning = false;

  // Clear state
  state.history = [];

  // Reset UI
  $num().textContent  = '—';
  $tag().textContent  = 'AWAITING GENERATION';
  $cd().textContent   = '60';
  $ring().style.strokeDashoffset = 0;
  $ring().classList.remove('warning');
  $list().innerHTML   = '<li class="history-empty">No history yet. Generator will auto-trigger every 60 seconds.</li>';
  $count().textContent = '0 entries';
  $total().textContent = '0';
  $sMin().textContent  = '—';
  $sMax().textContent  = '—';
  $sAvg().textContent  = '—';

  // Restart
  startSystem();
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  startSystem();
});
