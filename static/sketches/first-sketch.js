// Placeholder Laboratory sketch. Mounted by layouts/partials/hero.html when a
// post sets `hero = '/sketches/<name>.js'`. Draws a slow drifting Lissajous
// figure on a 2D canvas in the workshop palette. Replace with WebGL / a shader.

const canvas = document.querySelector('[data-hero-canvas]');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    const w = canvas.clientWidth || 800;
    const h = Math.round(w * 0.5);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function ink() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--bronze').trim() || '#8a6a3b';
  }

  let t = 0;
  function frame() {
    const w = canvas.clientWidth;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = ink();
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.38;
    for (let i = 0; i <= 480; i++) {
      const a = (i / 480) * Math.PI * 2;
      const x = cx + R * Math.sin(3 * a + t);
      const y = cy + R * Math.sin(2 * a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    t += 0.004;
    requestAnimationFrame(frame);
  }
  frame();
}
