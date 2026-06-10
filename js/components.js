// ── 3D SKILLS CLOUD — FIXED ───────────────────────────────────
const SkillsCloud = (() => {
  let points = [], raf = null;
  let rotX = 0.3, rotY = 0, velX = 0, velY = 0.003;
  let dragging = false, lastX = 0, lastY = 0;
  let initialized = false;

  function spherePoint(i, n) {
    const phi = Math.acos(-1 + (2 * i) / n);
    const theta = Math.sqrt(n * Math.PI) * phi;
    return {
      x: Math.cos(theta) * Math.sin(phi),
      y: Math.sin(theta) * Math.sin(phi),
      z: Math.cos(phi),
    };
  }

  function buildTags(container) {
    // Limpiar tags anteriores si los hay
    container.querySelectorAll('.skill-tag').forEach(el => el.remove());
    points = [];

    const n = DATA.habilidades.length;
    DATA.habilidades.forEach((label, i) => {
      const sp = spherePoint(i, n);
      const el = document.createElement('div');
      el.className = 'skill-tag';
      el.textContent = label;
      // Posición inicial en el centro del contenedor para evitar flash a la derecha
      el.style.left = '50%';
      el.style.top = '50%';
      el.style.transform = 'translate(-50%,-50%)';
      container.appendChild(el);
      points.push({ ...sp, el });
    });
  }

  function rotate3D(p, rx, ry) {
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    let x = p.x * cosY - p.z * sinY;
    let z = p.x * sinY + p.z * cosY;
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    let y2 = p.y * cosX - z * sinX;
    let z2 = p.y * sinX + z * cosX;
    return { x, y: y2, z: z2 };
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    const container = document.getElementById('skills-cloud');
    if (!container || points.length === 0) return;

    // ── FIX CLAVE: obtener dimensiones reales ──
    // Si el contenedor no tiene ancho todavía, buscar en el padre
    let W = container.offsetWidth;
    let H = container.offsetHeight;

    if (W < 10) W = container.parentElement?.offsetWidth || 600;
    if (H < 10) H = 400;

    const R = Math.min(W, H) * 0.38;
    const CX = W / 2, CY = H / 2;

    if (!dragging) {
      velY += (0.003 - velY) * 0.02;
      velX *= 0.95;
      rotY += velY;
      rotX += velX;
    }

    points.forEach(p => {
      const r = rotate3D(p, rotX, rotY);
      const scale = (r.z + 1.5) / 2.5;
      const x = CX + r.x * R;
      const y = CY + r.y * R;
      p.el.style.left = x + 'px';
      p.el.style.top = y + 'px';
      p.el.style.transform = `translate(-50%,-50%) scale(${scale.toFixed(3)})`;
      p.el.style.opacity = (scale * 0.8).toFixed(3);
      p.el.style.zIndex = Math.round(r.z * 100 + 100);
      p.el.className = 'skill-tag' + (r.z > 0.3 ? ' bright' : '');
    });
  }

  function bindEvents(container) {
    container.addEventListener('mousedown', e => {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      velX = 0; velY = 0;
    });
    window.addEventListener('mouseup', () => { dragging = false; });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      velY = dx * 0.005; velX = dy * 0.005;
      rotY += velY; rotX += velX;
      lastX = e.clientX; lastY = e.clientY;
    });
    container.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; dragging = true;
      }
    }, { passive: true });
    container.addEventListener('touchmove', e => {
      if (!dragging || e.touches.length < 1) return;
      const dx = e.touches[0].clientX - lastX, dy = e.touches[0].clientY - lastY;
      velY = dx * 0.005; velX = dy * 0.005;
      rotY += velY; rotX += velX;
      lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
    }, { passive: true });
  }

  function init() {
    const container = document.getElementById('skills-cloud');
    if (!container) return;

    // Parar loop anterior si existe
    if (raf) { cancelAnimationFrame(raf); raf = null; }

    buildTags(container);
    if (!initialized) {
      bindEvents(container);
      initialized = true;
    }

    // ── FIX: esperar a que el contenedor tenga dimensiones reales ──
    // Usar ResizeObserver para detectar cuando el contenedor sea visible
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const W = entry.contentRect.width;
        if (W > 50) {
          observer.disconnect();
          if (!raf) loop(); // arrancar el loop recién cuando hay dimensiones
        }
      }
    });
    observer.observe(container);

    // Fallback: si ya tiene dimensiones ahora mismo, arrancar igual
    if (container.offsetWidth > 50) {
      observer.disconnect();
      if (!raf) loop();
    }
  }

  return { init };
})();

// ── 3D TILT PORTFOLIO ─────────────────────────────────────────
const PortfolioModule = (() => {
  const cats = { all: 'Todos', est: 'Estratégicos', proc: 'Procedimientos', mat: 'Matrices', form: 'Formularios' };
  const icons = {
    book:'📖', target:'🎯', shield:'🛡️', sitemap:'🗺️', users:'👥', 'alert-triangle':'⚠️', 'chart-bar':'📊',
    files:'📁', cpu:'🖥️', 'shopping-cart':'🛒', tool:'🔧', 'x-circle':'❌', 'alert-octagon':'🚨',
    'clipboard-check':'✅', presentation:'📊', school:'🎓', 'message-circle':'💬',
    leaf:'🌿', 'shield-alert':'⚠️', recycle:'♻️',
    'file-x':'📄', brain:'🧠', droplet:'💧', 'check-square':'☑️', map:'🗺️'
  };

  function applyTilt(card) {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const rx = (y / r.height - 0.5) * -20;
      const ry = (x / r.width - 0.5) * 20;
      card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`;
      card.style.boxShadow = `0 ${8 + rx}px 40px rgba(79,142,247,0.3), var(--shadow)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  }

  function render(filter = 'all') {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;
    const docs = filter === 'all' ? DATA.docs : DATA.docs.filter(d => d.cat === filter);
    grid.innerHTML = docs.map(d => {
      const tagCls = { '9001':'tag-9001', '14001':'tag-14001', '45001':'tag-45001' }[d.tag] || 'tag-ok';
      const tagLbl = { '9001':'ISO 9001', '14001':'ISO 14001', '45001':'ISO 45001' }[d.tag] || d.tag;
      return `<div class="doc-card fade-up" data-cat="${d.cat}">
        <span class="doc-icon">${icons[d.icon] || '📄'}</span>
        <div class="doc-label">${d.label}</div>
        <span class="doc-tag ${tagCls}">${tagLbl}</span>
      </div>`;
    }).join('');
    grid.querySelectorAll('.doc-card').forEach(applyTilt);
  }

  function setFilter(btn, cat) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render(cat);
  }

  function buildFilters() {
    const wrap = document.getElementById('portfolio-filters');
    if (!wrap) return;
    wrap.innerHTML = Object.entries(cats).map(([k, v]) =>
      `<button class="filter-btn${k === 'all' ? ' active' : ''}" onclick="PortfolioModule.setFilter(this,'${k}')">${v}</button>`
    ).join('');
    render('all');
  }

  return { buildFilters, render, setFilter };
})();

// ── TIMELINE ──────────────────────────────────────────────────
const TimelineModule = (() => {
  function render() {
    const track = document.getElementById('timeline-track');
    if (!track) return;
    track.innerHTML = DATA.timeline.map((item, i) => `
      <div class="timeline-item" style="animation-delay:${i * 0.08}s">
        <div class="t-dot"></div>
        <div class="t-card">
          <span class="t-emoji">${item.icono}</span>
          <div class="t-fecha">${item.fecha}</div>
          <div class="t-titulo">${item.titulo}</div>
          <div class="t-desc">${item.desc}</div>
        </div>
      </div>`).join('');
  }
  return { render };
})();

// ── REGISTROS ─────────────────────────────────────────────────
const RegModule = (() => {
  function render() {
    const tbody = document.getElementById('reg-tbody');
    if (!tbody) return;
    tbody.innerHTML = DATA.registros.map(r => `
      <tr>
        <td style="font-weight:500">${r.label}</td>
        <td style="color:var(--blue);font-size:12px;font-weight:600">${r.cod}</td>
        <td style="color:var(--text2);font-size:12px">${r.fecha}</td>
        <td style="font-size:12px">${r.resultado}</td>
        <td><span class="status-ok">${r.ok ? '✓ Cerrado' : 'En proceso'}</span></td>
      </tr>`).join('');
  }
  return { render };
})();