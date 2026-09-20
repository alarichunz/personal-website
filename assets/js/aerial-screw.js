// A small, dependency-free 3D study: a tapered helicoid around a wooden mast.
// World coordinates are projected onto canvas; the rotor turns about its mast.
(() => {
  const emblem = document.querySelector('[data-aerial-screw]');
  if (!emblem) return;
  const canvas = emblem.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const toggle = emblem.querySelector('button');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const tau = Math.PI * 2;
  let angle = 0.6;
  let paused = motion.matches;
  let visible = true;
  let frame = 0;
  let previous = null;
  let dark = false;
  let shapes = [];

  function project([x, y, z]) {
    return [120 + x, 151 - y * 0.94 + z * 0.34, z * 0.94 + y * 0.34];
  }

  function add(points, fill, stroke, width = 0.7) {
    const projected = points.map(project);
    shapes.push({ points: projected, fill, stroke, width,
      depth: projected.reduce((sum, p) => sum + p[2], 0) / points.length });
  }

  function ring(radius, y, fill, stroke, width = 1) {
    add(Array.from({ length: 80 }, (_, i) => {
      const t = i / 80 * tau;
      return [Math.cos(t) * radius, y, Math.sin(t) * radius];
    }), fill, stroke, width);
  }

  function sail(t, fraction = 1) {
    const radius = 6 + (83 - 48 * t) * fraction;
    const theta = t * tau * 1.65 + angle;
    return [Math.cos(theta) * radius, 31 + 99 * t, Math.sin(theta) * radius];
  }

  function draw() {
    ctx.clearRect(0, 0, 240, 220);
    shapes = [];
    const ink = dark ? '#c5a878' : '#775830';
    const wood = dark ? '#80603a' : '#ac8956';
    const thread = dark ? '#b59b72' : '#94764b';
    // A stationary platform, braces, and mast anchor the moving sail.
    ring(47, -33, dark ? '#29231b' : '#ded0b5', ink, 1.2);
    ring(47, -29, dark ? '#3b3021' : '#e9ddc5', ink, 1.2);
    for (let i = 0; i < 4; i++) {
      const t = i * tau / 4 + Math.PI / 4;
      const x = Math.cos(t) * 40;
      const z = Math.sin(t) * 40;
      add([[x, -29, z], [0, 30, 0]], null, wood, 3);
      add([[x, -29, z], [-x, -29, -z]], null, ink, 0.7);
    }
    // Split the mast for correct depth sorting through the spiral.
    for (let y = -28; y < 142; y += 4) {
      add([[-2, y, 0], [2, y, 0], [2, y + 4, 0], [-2, y + 4, 0]], wood, null);
    }
    ring(8, 20, wood, ink);
    const segments = 180;
    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const next = (i + 1) / segments;
      // Opaque linen with directional shading makes the helix legible on both themes.
      const light = Math.sin(t * tau * 1.65 + angle - 0.7);
      const shade = dark ? 43 + light * 10 : 77 + light * 9;
      const fill = `hsl(39 34% ${shade}%)`;
      add([sail(t, 0), sail(t), sail(next), sail(next, 0)], fill, fill, 0.4);
      add([sail(t), sail(next)], null, ink, 1.1);
      add([sail(t, 0), sail(next, 0)], null, ink, 0.8);
      if (i % 12 === 0) add([sail(t, 0), sail(t)], null, thread, 0.65);
    }
    add([sail(0, 0), sail(0)], null, ink, 1.3);
    add([sail(1, 0), sail(1)], null, ink, 1.3);
    // The turning crossbar sits below the sail.
    for (let i = 0; i < 4; i++) {
      const t = angle + i * tau / 4;
      add([[0, 7, 0], [Math.cos(t) * 32, 7, Math.sin(t) * 32]], null, wood, 2.5);
    }
    shapes.sort((a, b) => a.depth - b.depth);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (const shape of shapes) {
      ctx.beginPath();
      shape.points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      if (shape.fill) {
        ctx.closePath();
        ctx.fillStyle = shape.fill;
        ctx.fill();
      }
      if (shape.stroke) {
        ctx.strokeStyle = shape.stroke;
        ctx.lineWidth = shape.width;
        ctx.stroke();
      }
    }
  }

  function resize() {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 240 * scale;
    canvas.height = 220 * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    draw();
  }

  function tick(now) {
    if (previous !== null) angle = (angle + Math.min(now - previous, 64) * tau / 14000) % tau;
    previous = now;
    draw();
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);
    previous = null;
    toggle.querySelector('.aerial-screw-play').toggleAttribute('hidden', !paused);
    toggle.querySelector('.aerial-screw-pause').toggleAttribute('hidden', paused);
    toggle.setAttribute('aria-label', paused ? 'Play aerial screw rotation' : 'Pause aerial screw rotation');
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function theme() {
    dark = document.documentElement.dataset.theme === 'dark';
    draw();
  }

  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  motion.addEventListener('change', () => { paused = motion.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('resize', resize);
  new MutationObserver(theme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(emblem);
  }
  theme();
  resize();
  emblem.querySelector('img').hidden = true;
  canvas.hidden = false;
  toggle.hidden = false;
  sync();
})();
