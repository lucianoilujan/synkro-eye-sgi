// ── FLOW MAP MODULE ───────────────────────────────────────
const FlowModule = (() => {
  let cur = 0;

  const tagColor = t => ({
    '9001': ['rgba(79,142,247,0.15)', '#7ba8ff'],
    '14001': ['rgba(76,175,130,0.15)', '#6fcca0'],
    '45001': ['rgba(240,168,67,0.15)', '#f5c578'],
    'ok': ['rgba(76,175,130,0.2)', '#6fcca0'],
  }[t] || ['rgba(100,120,160,0.1)', '#9ba8c4']);

  function renderSVG() {
    const wrap = document.getElementById('flow-svg-wrap');
    if (!wrap) return;

    const steps = DATA.steps;
    // Layout: 4 top (0-3), 4 bottom (4-7), snake pattern
    const W = 700, H = 260;
    const NW = 130, NH = 60, GAP = 20;
    const row1y = 40, row2y = 160;
    // col positions
    const cols = [20, 170, 320, 470];

    const pos = [
      [cols[0], row1y], [cols[1], row1y], [cols[2], row1y], [cols[3], row1y],
      [cols[3], row2y], [cols[2], row2y], [cols[1], row2y], [cols[0], row2y],
    ];

    const cx = i => pos[i][0] + NW / 2;
    const cy = i => pos[i][1] + NH / 2;

    // Build edges
    const edges = [
      [0,1],[1,2],[2,3], // row1 L→R
      [3,4],             // down
      [4,5],[5,6],[6,7], // row2 R→L
      // return loop
    ];

    const edgePaths = edges.map(([a, b]) => {
      if (a === 3 && b === 4) {
        // vertical bend
        return `M${cx(3)} ${pos[3][1]+NH} Q${cx(3)+40} ${(pos[3][1]+NH+pos[4][1])/2} ${cx(4)} ${pos[4][1]}`;
      }
      return `M${cx(a)} ${cy(a)} L${cx(b)} ${cy(b)}`;
    });

    // Loop-back arrow (7 → 0)
    const loopPath = `M${cx(7)} ${pos[7][1]+NH} Q${cx(7)} ${H+30} 20 ${H+30} Q-20 ${H+30} -20 ${cy(0)} Q-20 ${row1y-20} ${pos[0][0]} ${cy(0)}`;

    let svgHTML = `<svg viewBox="-30 0 760 ${H+60}" width="100%" style="display:block">
      <defs>
        <marker id="fam" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </marker>
      </defs>`;

    // Loop path
    svgHTML += `<path d="${loopPath}" fill="none" stroke="#4caf82" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.5" marker-end="url(#fam)">
      <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="2s" repeatCount="indefinite"/>
    </path>
    <text x="${W/2-60}" y="${H+52}" text-anchor="middle" font-size="10" fill="#4caf82" opacity="0.8">mejora continua</text>`;

    // Edges
    edges.forEach(([a, b], ei) => {
      const isVert = a === 3 && b === 4;
      const path = edgePaths[ei];
      svgHTML += `<path id="fedge-${ei}" d="${path}" fill="none" stroke="#4f8ef7" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.45" marker-end="url(#fam)">
        <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="${1.5 + ei * 0.1}s" repeatCount="indefinite"/>
      </path>`;
    });

    // Nodes
    steps.forEach((s, i) => {
      const [nx, ny] = pos[i];
      const isActive = i === cur;
      const fill = isActive ? s.color + '22' : 'rgba(30,43,71,0.8)';
      const stroke = isActive ? s.color : '#2a3555';
      const sw = isActive ? 2 : 1;
      svgHTML += `
        <g class="flow-node${isActive ? ' active' : ''}" id="fn-${i}" onclick="FlowModule.select(${i})" role="button" tabindex="0" aria-label="${s.title}">
          <rect class="node-rect" x="${nx}" y="${ny}" width="${NW}" height="${NH}" rx="10"
            fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
          <text x="${nx+NW/2}" y="${ny+16}" text-anchor="middle" dominant-baseline="central"
            font-size="10" font-weight="600" fill="${isActive ? s.color : '#9ba8c4'}">${s.n}</text>
          <text x="${nx+NW/2}" y="${ny+32}" text-anchor="middle" dominant-baseline="central"
            font-size="12" font-weight="500" fill="${isActive ? '#e8edf8' : '#c8d0e8'}">${s.title.split(' ').slice(0,2).join(' ')}</text>
          <text x="${nx+NW/2}" y="${ny+46}" text-anchor="middle" dominant-baseline="central"
            font-size="11" fill="${isActive ? '#9ba8c4' : '#5a6680'}">${s.title.split(' ').slice(2).join(' ')}</text>
        </g>`;
    });

    svgHTML += '</svg>';
    wrap.innerHTML = svgHTML;
  }

  function renderDetail() {
    const panel = document.getElementById('flow-detail');
    if (!panel) return;
    const s = DATA.steps[cur];

    panel.innerHTML = `
      <div class="detail-hd">
        <div class="detail-num" style="background:${s.color}22;color:${s.color}">${s.n}</div>
        <div style="flex:1">
          <div style="font-size:15px;font-weight:600;margin-bottom:2px">${s.title}</div>
          <div style="font-size:11px;color:var(--text3)">${s.norma}</div>
        </div>
        <div class="result-chip">${s.result}</div>
      </div>
      <div style="padding:14px 24px;font-size:13px;color:var(--text2);line-height:1.6;border-bottom:1px solid var(--border)">${s.desc}</div>
      <div class="detail-body">
        ${s.docs.map(d => {
          const [bg, tc] = tagColor(d.t);
          return `<div class="detail-doc">
            <span style="font-size:14px">📄</span>
            <span style="flex:1;font-size:12px">${d.l}</span>
            <span style="font-size:10px;padding:2px 7px;border-radius:4px;background:${bg};color:${tc};font-weight:600">${d.t === 'ok' ? 'REG ✓' : d.t}</span>
          </div>`;
        }).join('')}
      </div>`;
  }

  function renderDots() {
    const wrap = document.getElementById('flow-dots');
    if (!wrap) return;
    wrap.innerHTML = DATA.steps.map((_, i) =>
      `<div class="sdot${i === cur ? ' on' : ''}" onclick="FlowModule.select(${i})"></div>`
    ).join('');
  }

  function updateNav() {
    const prev = document.getElementById('flow-prev');
    const next = document.getElementById('flow-next');
    const lbl = document.getElementById('flow-lbl');
    if (prev) prev.disabled = cur === 0;
    if (next) next.disabled = cur === DATA.steps.length - 1;
    if (lbl) lbl.textContent = `Paso ${cur + 1} de ${DATA.steps.length}`;
  }

  function select(i) {
    cur = i;
    renderSVG();
    renderDetail();
    renderDots();
    updateNav();
  }

  function navigate(dir) {
    const n = cur + dir;
    if (n >= 0 && n < DATA.steps.length) select(n);
  }

  function init() {
    renderSVG();
    renderDetail();
    renderDots();
    updateNav();
  }

  return { init, select, navigate };
})();
