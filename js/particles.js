// ── PARTICLES BACKGROUND ─────────────────────────────────
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -9999, y: -9999 };
    this.theme = 'dark';
    this.raf = null;
    this.resize();
    this.init();
    this.bindEvents();
    this.loop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    const n = Math.floor((this.canvas.width * this.canvas.height) / 14000);
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.4,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() > 0.7 ? 210 : (Math.random() > 0.5 ? 150 : 210),
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => { this.resize(); this.init(); });
    window.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      this.mouse.x = -9999; this.mouse.y = -9999;
    });
  }

  loop() {
    this.raf = requestAnimationFrame(() => this.loop());
    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      // Mouse repulsion
      const dx = p.x - this.mouse.x, dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        p.x += (dx / dist) * force * 2;
        p.y += (dy / dist) * force * 2;
      }

      // Draw particle
      const alpha = isDark ? p.opacity : p.opacity * 0.6;
      const color = isDark
        ? `hsla(${p.hue},80%,70%,${alpha})`
        : `hsla(${p.hue},70%,40%,${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Lines to nearby particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const ddx = p.x - p2.x, ddy = p.y - p2.y;
        const d2 = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d2 < 80) {
          const la = (1 - d2 / 80) * 0.12 * (isDark ? 1 : 0.5);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = isDark ? `rgba(100,160,255,${la})` : `rgba(79,142,247,${la})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }
}

// ── KINETIC HERO TITLE ────────────────────────────────────
class KineticTitle {
  constructor(el) {
    this.el = el;
    this.tx = 0; this.ty = 0;
    this.cx = 0; this.cy = 0;
    this.raf = null;
    this.bind();
    this.loop();
  }

  bind() {
    window.addEventListener('mousemove', e => {
      const rect = this.el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      this.tx = dx * 18;
      this.ty = dy * 10;
    });
    window.addEventListener('mouseleave', () => { this.tx = 0; this.ty = 0; });
  }

  loop() {
    this.raf = requestAnimationFrame(() => this.loop());
    this.cx += (this.tx - this.cx) * 0.08;
    this.cy += (this.ty - this.cy) * 0.08;
    this.el.style.transform = `
      perspective(800px)
      rotateX(${-this.cy * 0.5}deg)
      rotateY(${this.cx * 0.5}deg)
      translateX(${this.cx * 0.3}px)
      translateY(${this.cy * 0.3}px)
    `;
  }
}

// ── INIT ──────────────────────────────────────────────────
let particleSystem = null;
let kineticTitle = null;

function initHero() {
  const canvas = document.getElementById('canvas-bg');
  if (canvas) particleSystem = new ParticleSystem(canvas);

  const title = document.getElementById('hero-title');
  if (title) kineticTitle = new KineticTitle(title);
}

document.addEventListener('DOMContentLoaded', initHero);
