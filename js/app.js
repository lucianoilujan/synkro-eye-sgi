// ── APP CONTROLLER ────────────────────────────────────────
const App = (() => {
  let theme = 'dark';
  let radialOpen = false;
  let currentSection = 'hero';

  const sections = ['hero','dashboard','flujo','campo','documentos','timeline','registros'];

  const radialItems = [
    { icon:'🏠', label:'Inicio', section:'hero' },
    { icon:'📊', label:'Dashboard', section:'dashboard' },
    { icon:'🔀', label:'Flujo', section:'flujo' },
    { icon:'🗺️', label:'Campo', section:'campo' },
    { icon:'📁', label:'Documentos', section:'documentos' },
    { icon:'📅', label:'Timeline', section:'timeline' },
    { icon:'📋', label:'Registros', section:'registros' },
  ];

  // ── THEME ────────────────────────────────────────────────
  function initTheme() {
    const saved = localStorage.getItem('synkro-theme');
    theme = saved || (window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
    applyTheme();
  }

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('synkro-theme', theme);
    applyTheme();
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
    const btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // ── ROUTING ──────────────────────────────────────────────
  function showSection(id) {
    currentSection = id;

    // Update sections
    sections.forEach(s => {
      const el = document.getElementById('sec-' + s);
      if (el) el.classList.toggle('active', s === id);
    });

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.sec === id);
    });

    // Init section-specific logic
    if (id === 'dashboard') {
      setTimeout(() => {
        KPIModule.animateKPIs();
        KPIModule.animateNormas();
      }, 100);
    }
    if (id === 'flujo') FlowModule.init();
    if (id === 'documentos') PortfolioModule.buildFilters();
    if (id === 'timeline') TimelineModule.render();
    if (id === 'registros') RegModule.render();
    if (id === 'dashboard' || id === 'hero') {
      setTimeout(() => SkillsCloud.init(), 200);
    }
    if (id === 'campo') {
      setTimeout(() => CampoModule.init(), 200);
    }

    closeRadial();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── RADIAL MENU ──────────────────────────────────────────
  function buildRadial() {
    const menu = document.getElementById('radial-menu');
    if (!menu) return;

    const itemsHTML = radialItems.map((item, i) => {
      const offset = (i + 1) * 52;
      return `
        <div class="radial-item" id="ri-${i}" style="bottom:${offset}px;transition-delay:${i * 0.04}s">
          <span class="radial-item-label">${item.label}</span>
          <button class="radial-item-btn" onclick="App.showSection('${item.section}')" aria-label="${item.label}">${item.icon}</button>
        </div>`;
    }).join('');

    menu.innerHTML = `
      ${itemsHTML}
      <button class="radial-trigger" id="radial-trigger" onclick="App.toggleRadial()" aria-label="Menú">＋</button>`;
  }

  function toggleRadial() {
    radialOpen = !radialOpen;
    const menu = document.getElementById('radial-menu');
    const trigger = document.getElementById('radial-trigger');
    if (menu) menu.classList.toggle('open', radialOpen);
    if (trigger) trigger.classList.toggle('open', radialOpen);
  }

  function closeRadial() {
    radialOpen = false;
    const menu = document.getElementById('radial-menu');
    const trigger = document.getElementById('radial-trigger');
    if (menu) menu.classList.remove('open');
    if (trigger) trigger.classList.remove('open');
  }

  // Close radial on outside click
  document.addEventListener('click', e => {
    if (radialOpen && !document.getElementById('radial-menu')?.contains(e.target)) {
      closeRadial();
    }
  });

  // ── INTERSECTION OBSERVER (animate on scroll) ────────────
  function initObserver() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('fade-up');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.kpi-card, .doc-card, .t-card').forEach(el => obs.observe(el));
  }

  // ── KEYBOARD NAV ─────────────────────────────────────────
  function initKeyboard() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeRadial();
      if (e.key === 'ArrowRight' && currentSection === 'flujo') FlowModule.navigate(1);
      if (e.key === 'ArrowLeft' && currentSection === 'flujo') FlowModule.navigate(-1);
    });
  }

  // ── MAIN INIT ─────────────────────────────────────────────
  function init() {
    initTheme();
    KPIModule.render();
    KPIModule.renderNormas();
    buildRadial();
    initKeyboard();

    // Chart.js line chart for dashboard
    setTimeout(() => {
      const ctx = document.getElementById('kpi-chart');
      if (ctx && window.Chart) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Abril', 'Mayo'],
            datasets: [
              { label: 'Precisión IA', data: [91, 94.2], borderColor: '#4f8ef7', tension: 0.4, fill: false, borderWidth: 2 },
              { label: 'Baterías rec.', data: [75, 87.5], borderColor: '#4caf82', tension: 0.4, fill: false, borderWidth: 2 },
              { label: 'Reduc. Agroquím.', data: [32, 41], borderColor: '#f0a843', tension: 0.4, borderDash: [4, 3], fill: false, borderWidth: 2 },
            ]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#9ba8c4', font: { size: 11 } } } },
            scales: {
              x: { ticks: { color: '#5a6680', font: { size: 11 } }, grid: { color: 'rgba(100,140,255,0.06)' } },
              y: { ticks: { color: '#5a6680', font: { size: 11 }, callback: v => v + '%' }, grid: { color: 'rgba(100,140,255,0.06)' } }
            },
            animation: { duration: 1200 }
          }
        });
      }
      SkillsCloud.init();
    }, 300);

    // Show hero on load
    showSection('hero');
  }

  return { init, showSection, toggleTheme, toggleRadial, closeRadial };
})();

// ── BOOT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', App.init);
