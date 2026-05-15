// ── KPI MODULE ────────────────────────────────────────────
const KPIModule = (() => {
  let chart = null;

  function animCount(el, target, suffix, dur = 1200) {
    const start = performance.now();
    const isFloat = !Number.isInteger(target);
    (function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const val = ease * target;
      el.textContent = (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
      if (t < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  function openModal(kpi) {
    const overlay = document.getElementById('kpi-modal');
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    overlay.innerHTML = `
      <div class="modal-box scale-in">
        <button class="modal-close" onclick="KPIModule.closeModal()">✕</button>
        <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--blue);margin-bottom:8px">${kpi.norma}</div>
        <div style="font-size:1.1rem;font-weight:600;color:var(--text);margin-bottom:4px">${kpi.label}</div>
        <div class="modal-kpi-value" style="color:${kpi.color}">${kpi.value}${kpi.unit}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
          <span style="font-size:12px;color:var(--text2)">Meta:</span>
          <span style="font-size:13px;font-weight:600;color:var(--green2)">${kpi.meta}</span>
          <span style="font-size:12px;color:var(--green2);margin-left:4px">✓ Superada</span>
        </div>
        <div style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:20px;padding:14px;background:var(--bg2);border-radius:10px">${kpi.detail}</div>
        <div style="font-size:12px;font-weight:600;color:var(--text3);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px">Evolución</div>
        <div class="modal-hist">
          ${kpi.hist.map(h => `
            <div class="hist-bar-wrap">
              <div class="hist-bar-bg">
                <div class="hist-bar-fill" data-pct="${h.v}" style="background:${kpi.color};height:0%"></div>
              </div>
              <div class="hist-label">${h.mes}</div>
              <div style="font-size:11px;font-weight:600;color:var(--text)">${h.v}${kpi.unit}</div>
            </div>`).join('')}
        </div>
        <canvas id="kpi-mini-chart" style="display:block;margin-top:16px;height:80px"></canvas>
      </div>`;

    overlay.classList.add('open');
    overlay.onclick = e => { if (e.target === overlay) KPIModule.closeModal(); };

    // Animate bars
    setTimeout(() => {
      const maxV = Math.max(...kpi.hist.map(h => h.v));
      overlay.querySelectorAll('.hist-bar-fill').forEach(bar => {
        const pct = (parseFloat(bar.dataset.pct) / maxV) * 100;
        bar.style.height = pct + '%';
      });

      // Mini chart
      const ctx = document.getElementById('kpi-mini-chart');
      if (ctx && window.Chart) {
        if (chart) chart.destroy();
        chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: kpi.hist.map(h => h.mes),
            datasets: [{
              data: kpi.hist.map(h => h.v),
              borderColor: kpi.color,
              backgroundColor: kpi.color + '20',
              fill: true, tension: 0.4, pointRadius: 4,
              pointBackgroundColor: kpi.color,
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: '#5a6680', font: { size: 11 } }, grid: { display: false } },
              y: { ticks: { color: '#5a6680', font: { size: 11 }, callback: v => v + kpi.unit }, grid: { color: 'rgba(100,140,255,0.08)' } }
            },
            animation: { duration: 800 }
          }
        });
      }
    }, 100);
  }

  function closeModal() {
    document.getElementById('kpi-modal').classList.remove('open');
    if (chart) { chart.destroy(); chart = null; }
  }

  function render() {
    const grid = document.getElementById('kpi-grid');
    if (!grid) return;
    grid.innerHTML = DATA.kpis.map((k, i) => `
      <div class="kpi-card" style="--kpi-color:${k.color};--kpi-glow:${k.color}44;animation-delay:${i * 0.08}s"
           onclick="KPIModule.openModal(DATA.kpis[${i}])">
        <div class="kpi-value" id="kv-${k.id}" style="color:${k.color}">0${k.unit}</div>
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-meta">meta ${k.meta} ✓</div>
        <div class="kpi-norma">${k.norma}</div>
      </div>`).join('');
  }

  function animateKPIs() {
    DATA.kpis.forEach(k => {
      const el = document.getElementById('kv-' + k.id);
      if (el) animCount(el, k.value, k.unit);
    });
  }

  function renderNormas() {
    const wrap = document.getElementById('norma-bars');
    if (!wrap) return;
    wrap.innerHTML = DATA.normas.map(n => `
      <div class="norma-item">
        <div class="norma-hd">
          <span style="font-size:13px;font-weight:500">${n.label}</span>
          <span style="color:${n.color};font-weight:700">${n.pct}%</span>
        </div>
        <div class="norma-track">
          <div class="norma-fill" data-pct="${n.pct}" style="background:${n.color};width:0%"></div>
        </div>
        <div style="font-size:10px;color:var(--text3);margin-top:4px">${n.base}</div>
      </div>`).join('');
  }

  function animateNormas() {
    document.querySelectorAll('.norma-fill').forEach(bar => {
      setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, 200);
    });
  }

  return { render, openModal, closeModal, animateKPIs, renderNormas, animateNormas };
})();
