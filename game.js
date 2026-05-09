/* ════════════════════════════════════════
   COLOUR NUMBER GAME — game.js
   Random Number Generator 0–9
   Real-time · 1 min · 1 number
   ════════════════════════════════════════ */

'use strict';

/* ── Colour map (num → colour) ── */
const COLOURS = [
  { num: 0, name: 'Ruby',   hex: '#e53935' },
  { num: 1, name: 'Orange', hex: '#f4511e' },
  { num: 2, name: 'Amber',  hex: '#f9a825' },
  { num: 3, name: 'Lime',   hex: '#7cb342' },
  { num: 4, name: 'Teal',   hex: '#00897b' },
  { num: 5, name: 'Ocean',  hex: '#1e88e5' },
  { num: 6, name: 'Indigo', hex: '#3949ab' },
  { num: 7, name: 'Violet', hex: '#8e24aa' },
  { num: 8, name: 'Rose',   hex: '#d81b60' },
  { num: 9, name: 'Slate',  hex: '#546e7a' },
];

/* ── App state ── */
let history   = [];
let streak    = 0;
let lastNum   = null;
let tStart    = performance.now();
let autoTimer = null;
let rafId     = null;

const INTERVAL = 60; // seconds between auto-spins

/* ════════════════════════════════
   CORE: Secure Random Int
   ════════════════════════════════ */
function randInt(min, max) {
  const range = max - min + 1;
  if (window.crypto && crypto.getRandomValues) {
    // Unbiased using rejection sampling
    const cap = Math.floor(0x100000000 / range) * range;
    let r;
    do {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      r = arr[0];
    } while (r >= cap);
    return min + (r % range);
  }
  // Fallback (less secure)
  return Math.floor(Math.random() * range) + min;
}

/* ════════════════════════════════
   UI: Build the number grid
   ════════════════════════════════ */
function buildGrid() {
  const grid = document.getElementById('numGrid');
  grid.innerHTML = '';
  COLOURS.forEach(c => {
    const tile = document.createElement('div');
    tile.className   = 'num-tile';
    tile.id          = 'tile-' + c.num;
    tile.style.background = c.hex;
    tile.innerHTML   = `${c.num}<span class="tile-name">${c.name}</span>`;
    tile.addEventListener('click', (e) => {
      spawnRipple(e, c.hex);
      pick(c.num);
    });
    grid.appendChild(tile);
  });
}

/* ════════════════════════════════
   CORE: Pick / Generate a number
   ════════════════════════════════ */
function pick(n) {
  const c     = COLOURS[n];
  const entry = { n, hex: c.hex, name: c.name, t: new Date() };

  // Add to front of history
  history.unshift(entry);
  if (history.length > 40) history.pop();

  // Streak: consecutive same number
  streak = (lastNum !== null && n === lastNum) ? streak + 1 : 1;
  lastNum = n;

  // Update all UI sections
  updateBall(c, n);
  updateTiles(n);
  updateStats();
  updateHistory();
  updateStreak();
  resetTimerStart();
}

/* ════════════════════════════════
   UI: Big spinning ball
   ════════════════════════════════ */
function updateBall(c, n) {
  const ball = document.getElementById('mainBall');

  // Swap colour + trigger pop animation
  ball.style.background = c.hex;
  ball.classList.remove('pop');
  void ball.offsetWidth;       // force reflow to restart animation
  ball.classList.add('pop');

  document.getElementById('ballNum').textContent  = n;
  document.getElementById('ballName').textContent = c.name;

  // Re-tint the rainbow ring to the picked colour
  document.getElementById('ballOuter').style.background =
    `conic-gradient(from 0deg, ${c.hex}, #fff2, ${c.hex})`;

  // Match timer bar to current colour
  document.getElementById('timerFill').style.background = c.hex;
}

/* ════════════════════════════════
   UI: Highlight active grid tile
   ════════════════════════════════ */
function updateTiles(active) {
  COLOURS.forEach(c => {
    document.getElementById('tile-' + c.num)
      .classList.toggle('active', c.num === active);
  });
}

/* ════════════════════════════════
   UI: Stats bar (total/low/high/avg)
   ════════════════════════════════ */
function updateStats() {
  const nums = history.map(e => e.n);
  document.getElementById('sTot').textContent  = nums.length;
  document.getElementById('sLow').textContent  = Math.min(...nums);
  document.getElementById('sHigh').textContent = Math.max(...nums);
  document.getElementById('sAvg').textContent  =
    (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

/* ════════════════════════════════
   UI: History row of colour balls
   ════════════════════════════════ */
function updateHistory() {
  const wrap = document.getElementById('histBalls');
  document.getElementById('histCount').textContent =
    history.length + ' spin' + (history.length !== 1 ? 's' : '');

  if (!history.length) {
    wrap.innerHTML = '<span class="history-empty">No spins yet — press Spin Now!</span>';
    return;
  }

  wrap.innerHTML = '';
  history.forEach((e, i) => {
    const b = document.createElement('div');
    b.className        = 'h-ball';
    b.style.background = e.hex;
    b.title            = `${e.name} · ${e.t.toLocaleTimeString()}`;
    b.textContent      = e.n;
    if (i === 0) b.style.boxShadow = `0 0 0 3px ${e.hex}66`;
    wrap.appendChild(b);
  });
}

/* ════════════════════════════════
   UI: Streak badge
   ════════════════════════════════ */
function updateStreak() {
  document.getElementById('streakNum').textContent = streak;
}

/* ════════════════════════════════
   TIMER: rAF countdown + bar
   ════════════════════════════════ */
function resetTimerStart() {
  tStart = performance.now();
}

function tick() {
  const elapsed = (performance.now() - tStart) / 1000;
  const pct     = Math.min(elapsed / INTERVAL, 1);
  const left    = Math.max(Math.ceil(INTERVAL - elapsed), 0);

  document.getElementById('timerFill').style.width =
    ((1 - pct) * 100) + '%';
  document.getElementById('timerSecs').textContent = left;

  rafId = requestAnimationFrame(tick);
}

/* ════════════════════════════════
   FX: Ripple on tile click
   ════════════════════════════════ */
function spawnRipple(e, colour) {
  const r  = document.createElement('div');
  const sz = 60;
  r.className = 'ripple';
  r.style.cssText =
    `width:${sz}px;height:${sz}px;` +
    `left:${e.clientX - sz / 2}px;` +
    `top:${e.clientY  - sz / 2}px;` +
    `background:${colour};`;
  document.body.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
}

/* ════════════════════════════════
   PUBLIC: Spin Now button
   ════════════════════════════════ */
function spinNow() {
  pick(randInt(0, 9));
}

/* ════════════════════════════════
   PUBLIC: Reset button
   ════════════════════════════════ */
function resetGame() {
  clearInterval(autoTimer);
  cancelAnimationFrame(rafId);

  history = [];
  streak  = 0;
  lastNum = null;

  // Reset ball
  const ball = document.getElementById('mainBall');
  ball.style.background = 'var(--bg)';
  document.getElementById('ballNum').textContent  = '?';
  document.getElementById('ballName').textContent = 'SPIN!';
  document.getElementById('ballOuter').style.background =
    'conic-gradient(from 0deg,#e53935,#f4511e,#f9a825,#7cb342,#00897b,#1e88e5,#3949ab,#8e24aa,#d81b60,#e53935)';

  // Reset timer visuals
  document.getElementById('timerFill').style.background = '#7cb342';
  document.getElementById('timerFill').style.width      = '100%';
  document.getElementById('timerSecs').textContent      = '60';

  // Reset stats
  document.getElementById('sTot').textContent  = '0';
  document.getElementById('sLow').textContent  = '—';
  document.getElementById('sHigh').textContent = '—';
  document.getElementById('sAvg').textContent  = '—';

  // Reset streak + history
  document.getElementById('streakNum').textContent = '0';
  document.getElementById('histBalls').innerHTML   =
    '<span class="history-empty">No spins yet — press Spin Now!</span>';
  document.getElementById('histCount').textContent = '0 spins';

  // Clear active tile highlights
  COLOURS.forEach(c =>
    document.getElementById('tile-' + c.num).classList.remove('active')
  );

  // Restart timers
  tStart    = performance.now();
  autoTimer = setInterval(spinNow, INTERVAL * 1000);
  rafId     = requestAnimationFrame(tick);
}

/* ════════════════════════════════
   BACKGROUND: Floating particles
   ════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const hexes = COLOURS.map(c => c.hex);
  let W, H, dots = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    dots = Array.from({ length: 55 }, () => ({
      x:   Math.random() * W,
      y:   Math.random() * H,
      r:   2 + Math.random() * 4,
      vx:  (Math.random() - 0.5) * 0.4,
      vy:  (Math.random() - 0.5) * 0.4,
      col: hexes[Math.floor(Math.random() * hexes.length)],
      a:   0.2 + Math.random() * 0.5,
    }));
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => {
      d.x += d.vx;  d.y += d.vy;
      if (d.x < -10)    d.x = W + 10;
      if (d.x > W + 10) d.x = -10;
      if (d.y < -10)    d.y = H + 10;
      if (d.y > H + 10) d.y = -10;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.col + Math.round(d.a * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });
    requestAnimationFrame(drawFrame);
  }

  window.addEventListener('resize', resize);
  resize();
  drawFrame();
})();

/* ════════════════════════════════
   INIT: Boot the app
   ════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  buildGrid();
  autoTimer = setInterval(spinNow, INTERVAL * 1000);
  rafId     = requestAnimationFrame(tick);
});
