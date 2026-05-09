/**
 * background.js — Animated dot-grid canvas background
 * Creates a living, breathing grid of points that pulse
 * in sync with the RNG system aesthetic.
 */

'use strict';

(function () {

  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  const COLS   = 28;
  const ROWS   = 20;
  const SPEED  = 0.004;

  let W, H, cellW, cellH;
  let t = 0;
  let points = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cellW = W / (COLS - 1);
    cellH = H / (ROWS - 1);
    buildGrid();
  }

  function buildGrid() {
    points = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        points.push({
          x:       col * cellW,
          y:       row * cellH,
          phase:   Math.random() * Math.PI * 2,
          amp:     0.3 + Math.random() * 0.7,
          baseR:   1.2,
        });
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += SPEED;

    const len = points.length;
    for (let i = 0; i < len; i++) {
      const p      = points[i];
      const pulse  = (Math.sin(t + p.phase) + 1) / 2; // 0..1
      const alpha  = 0.06 + pulse * p.amp * 0.18;
      const radius = p.baseR + pulse * 1.6;

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 255, 0, ${alpha})`;
      ctx.fill();
    }

    // Horizontal scan line that drifts slowly across the screen
    const scanY   = ((t * 80) % (H + 100)) - 50;
    const scanGrd = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
    scanGrd.addColorStop(0,   'rgba(232,255,0,0)');
    scanGrd.addColorStop(0.5, 'rgba(232,255,0,0.04)');
    scanGrd.addColorStop(1,   'rgba(232,255,0,0)');
    ctx.fillStyle = scanGrd;
    ctx.fillRect(0, scanY - 30, W, 60);

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();

})();
