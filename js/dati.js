/* =====================================================
   dati.js — accordion data visualizations
   ===================================================== */

(function () {

  /* ── Constants ─────────────────────────────────────── */
  const ACCENT  = '#D44B3F';
  const BG      = '#F2EDE6';
  const NS      = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const FULL = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
                'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
  const ABBR = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

  /* ── State ─────────────────────────────────────────── */
  let data, total, byMonth, peakIdx, peakName,
      byCausa, workCount, stressCount, maxIntens,
      peakDay, peakMonthIdx,
      sortedCause, PALETTE, CAUSA_LABELS;

  const donutPaths  = [];
  let   linePathEl  = null;
  const lineCircles = [];

  /* false = waiting | 'pending' = opened before data ready | true = done */
  const done = { counter: false, bar: false, donut: false, line: false };
  const KEYS = ['counter', 'bar', 'donut', 'line'];

  /* ── Helpers ───────────────────────────────────────── */
  const $     = id  => document.getElementById(id);
  const svgEl = tag => document.createElementNS(NS, tag);

  function setAttr(el, attrs) {
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  }

  function arcPt(cx, cy, r, a) {
    return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  }

  /* ── Accordion — init synchronously ───────────────── */
  document.querySelectorAll('.dati__item').forEach((item, idx) => {
    const toggle = item.querySelector('.dati__item-toggle');
    toggle.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      item.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(willOpen));
      if (willOpen) triggerViz(KEYS[idx]);
    });
  });

  function triggerViz(key) {
    if (!data)              { done[key] = 'pending'; return; }
    if (done[key] === true) return;
    done[key] = true;

    if      (key === 'counter') animateCounter();
    else if (key === 'bar')     { animateBarChart(); setTimeout(startSlotMachine, 900); }
    else if (key === 'donut')   { animateDonutChart(); populateDonutComment(); }
    else if (key === 'line')    { animateLineChart(); setTimeout(startCalRoulette, 400); populateLineComment(); }
  }

  /* ── Fetch + build ─────────────────────────────────── */
  fetch('data/lrnpm_piantini_full.json')
    .then(r => r.json())
    .then(raw => {

      data  = raw.filter(d => d.name === 'arietti');
      total = data.length;

      byMonth = Array(12).fill(0);
      data.forEach(d => { byMonth[+d.month - 1]++; });
      peakIdx  = byMonth.indexOf(Math.max(...byMonth));
      peakName = FULL[peakIdx];

      byCausa     = {};
      data.forEach(d => { byCausa[d.causa] = (byCausa[d.causa] || 0) + 1; });
      workCount   = byCausa['accademia-lavoro-economia']          || 0;
      stressCount = byCausa['stress-ansia-per-futuro-nostalgia'] || 0;

      maxIntens   = Math.max(...data.map(d => d['intensità']));
      const peak  = data.find(d => d['intensità'] === maxIntens);
      peakDay     = +peak.day;
      peakMonthIdx = +peak.month - 1;

      CAUSA_LABELS = {
        'audio-video-scritto':               'Film, serie e musica',
        'relazioni-sessuoaffettive':         'Relazioni sentimentali',
        'altro-e-gran-mix':                  'Altro e gran mix',
        'relazioni-amicali-familiari':       'Amicizie e famiglia',
        'stress-ansia-per-futuro-nostalgia': 'Ansia e nostalgia',
        'accademia-lavoro-economia':         'Dottorato e lavoro',
        'contrattempi':                      'Contrattempi',
      };
      PALETTE     = ['#D44B3F','#B83229','#E0806A','#9B2820','#F0A888','#7A1E18','#C4695A'];
      sortedCause = Object.entries(byCausa).sort((a, b) => b[1] - a[1]);

      buildBarChart();
      buildSlotMachine();
      buildDonutChart();
      buildLineChart();
      buildCalRoulette();

      /* Run pending animations (accordion opened while data was loading) */
      KEYS.forEach(k => {
        if (done[k] === 'pending') triggerViz(k);
      });
    })
    .catch(e => console.warn('dati.js:', e));

  /* ── VIZ 1 — Counter ───────────────────────────────── */
  function animateCounter() {
    const el = $('counter-number');
    if (reduced) { el.textContent = total; return; }
    const obj = { v: 0 };
    gsap.to(obj, {
      v: total, duration: 2.2, ease: 'power2.out',
      onUpdate() { el.textContent = Math.round(obj.v); }
    });
  }

  /* ── VIZ 2 — Bar chart ─────────────────────────────── */
  function buildBarChart() {
    const s  = $('bar-chart-svg');
    const W  = 600, H = 260, pL = 34, pR = 14, pT = 28, pB = 40;
    const cW = W - pL - pR, cH = H - pT - pB;
    const maxV = Math.max(...byMonth);
    const bW = cW / 12, gap = bW * 0.3;

    [2, 4, 6].forEach(v => {
      const y  = pT + cH - (v / maxV) * cH;
      const ln = svgEl('line');
      setAttr(ln, { x1: pL, x2: W - pR, y1: y, y2: y,
        stroke: 'rgba(26,26,26,0.09)', 'stroke-dasharray': '3 4' });
      s.appendChild(ln);
      const t = svgEl('text');
      setAttr(t, { x: pL - 5, y: y + 4, 'text-anchor': 'end',
        'font-size': 10, fill: 'rgba(26,26,26,0.4)' });
      t.textContent = v; s.appendChild(t);
    });

    byMonth.forEach((count, i) => {
      const x  = pL + i * bW + gap / 2;
      const w  = bW - gap;
      const h  = count ? (count / maxV) * cH : 0;
      const ty = pT + cH - h;
      const pk = i === peakIdx;

      const r = svgEl('rect');
      setAttr(r, { x, y: pT + cH, width: w, height: 0, rx: 2,
        fill: pk ? ACCENT : 'rgba(212,75,63,0.28)' });
      r.dataset.ty = ty; r.dataset.th = h;
      s.appendChild(r);

      if (count) {
        const t = svgEl('text');
        setAttr(t, { x: x + w / 2, y: ty - 5, 'text-anchor': 'middle',
          'font-size': 11, fill: pk ? ACCENT : 'rgba(26,26,26,0.55)',
          'font-weight': pk ? 700 : 400, opacity: 0 });
        t.dataset.lbl = 'count'; t.textContent = count; s.appendChild(t);
      }

      const lbl = svgEl('text');
      setAttr(lbl, { x: x + w / 2, y: H - 6, 'text-anchor': 'middle',
        'font-size': 10,
        fill: pk ? ACCENT : 'rgba(26,26,26,0.5)',
        'font-weight': pk ? 700 : 400 });
      lbl.textContent = ABBR[i]; s.appendChild(lbl);
    });
  }

  function animateBarChart() {
    const s = $('bar-chart-svg');
    s.querySelectorAll('rect').forEach((r, i) => {
      const ty = +r.dataset.ty, th = +r.dataset.th;
      if (reduced) { r.setAttribute('y', ty); r.setAttribute('height', th); return; }
      gsap.to(r, { attr: { y: ty, height: th }, duration: 0.65,
        delay: i * 0.04, ease: 'power2.out' });
    });
    gsap.to(s.querySelectorAll('[data-lbl="count"]'),
      { attr: { opacity: 1 }, duration: 0.35, delay: 0.75, stagger: 0.04 });
  }

  /* ── VIZ 2b — Slot machine mese ────────────────────── */
  function buildSlotMachine() {
    const reel  = $('slot-reel');
    const items = [];
    for (let c = 0; c < 3; c++) FULL.forEach(m => items.push(m));
    for (let i = 0; i <= peakIdx; i++) items.push(FULL[i]);
    items.forEach(name => {
      const d = document.createElement('div');
      d.className = 'dati__slot-item'; d.textContent = name;
      reel.appendChild(d);
    });
  }

  function startSlotMachine() {
    const reel    = $('slot-reel');
    const machine = $('slot-machine');
    const items   = reel.querySelectorAll('.dati__slot-item');
    const h       = items[0].offsetHeight || 88;
    machine.style.height = h + 'px';
    if (reduced) { gsap.set(reel, { y: -((items.length - 1) * h) }); return; }
    gsap.fromTo(reel,
      { y: 0 },
      { y: -((items.length - 1) * h), duration: 3.5, ease: 'power4.out' }
    );
  }

  /* ── VIZ 3 — Donut chart ───────────────────────────── */
  function buildDonutChart() {
    const s  = $('donut-chart-svg');
    const CX = 150, CY = 150, RO = 108, RI = 64, GAP = 0.026;
    let angle = -Math.PI / 2;

    sortedCause.forEach(([causa, count], i) => {
      const frac  = count / total;
      const sweep = frac * Math.PI * 2 - GAP;
      const a0 = angle + GAP / 2, a1 = a0 + sweep;

      const d = [
        `M ${arcPt(CX, CY, RO, a0)}`,
        `A ${RO} ${RO} 0 ${sweep > Math.PI ? 1 : 0} 1 ${arcPt(CX, CY, RO, a1)}`,
        `L ${arcPt(CX, CY, RI, a1)}`,
        `A ${RI} ${RI} 0 ${sweep > Math.PI ? 1 : 0} 0 ${arcPt(CX, CY, RI, a0)}`,
        'Z'
      ].join(' ');

      const path = svgEl('path');
      setAttr(path, { d, fill: PALETTE[i % PALETTE.length], opacity: 0 });
      s.appendChild(path);
      donutPaths.push(path);
      angle += frac * Math.PI * 2;
    });

    const legend = $('donut-legend');
    sortedCause.forEach(([causa, count], i) => {
      const item = document.createElement('div');
      item.className = 'dati__legend-item';
      item.innerHTML =
        `<span class="dati__legend-dot" style="background:${PALETTE[i % PALETTE.length]}"></span>` +
        `<span class="dati__legend-label">${CAUSA_LABELS[causa] || causa}</span>` +
        `<span class="dati__legend-count">${count}</span>`;
      legend.appendChild(item);
    });
  }

  function animateDonutChart() {
    if (reduced) { donutPaths.forEach(p => p.setAttribute('opacity', 1)); return; }
    donutPaths.forEach((p, i) =>
      gsap.to(p, { attr: { opacity: 1 }, duration: 0.4, delay: i * 0.13, ease: 'power2.out' })
    );
  }

  function populateDonutComment() {
    const related = workCount + stressCount;
    const pct     = Math.round(related / total * 100);
    $('donut-comment').textContent =
      `Su ${total} piantini registrati, ${workCount} hanno causa diretta nel dottorato o nel lavoro. ` +
      `Aggiungendo i ${stressCount} per ansia e nostalgia — categorie che, in un anno tra Bologna e il nord Europa, ` +
      `tendono a sovrapporsi — si arriva a ${related} (${pct}% del totale). ` +
      `Il restante ${100 - pct}% dimostra l'inattaccabile equilibrio emotivo del soggetto nelle altre aree della vita.`;
  }

  /* ── VIZ 4 — Line chart ────────────────────────────── */
  function buildLineChart() {
    const s  = $('line-chart-svg');
    const W  = 700, H = 280, pL = 40, pR = 18, pT = 20, pB = 46;
    const cW = W - pL - pR, cH = H - pT - pB;
    const t0 = new Date(2024, 0, 1).getTime();
    const t1 = new Date(2024, 9, 31).getTime();

    const toX = (m, d) => pL + ((new Date(2024, +m - 1, +d).getTime() - t0) / (t1 - t0)) * cW;
    const toY = v => pT + cH - (v / 10) * cH;

    [2, 4, 6, 8, 10].forEach(v => {
      const y  = toY(v);
      const ln = svgEl('line');
      setAttr(ln, { x1: pL, x2: W - pR, y1: y, y2: y,
        stroke: 'rgba(26,26,26,0.09)', 'stroke-dasharray': '3 4' });
      s.appendChild(ln);
      const t = svgEl('text');
      setAttr(t, { x: pL - 6, y: y + 4, 'text-anchor': 'end',
        'font-size': 10, fill: 'rgba(26,26,26,0.4)' });
      t.textContent = v; s.appendChild(t);
    });

    for (let m = 1; m <= 10; m++) {
      const t = svgEl('text');
      setAttr(t, { x: toX(m, 15), y: H - 8, 'text-anchor': 'middle',
        'font-size': 10, fill: 'rgba(26,26,26,0.45)' });
      t.textContent = ABBR[m - 1]; s.appendChild(t);
    }

    const pts = [...data]
      .sort((a, b) => {
        const da = new Date(+a.year, +a.month - 1, +a.day);
        const db = new Date(+b.year, +b.month - 1, +b.day);
        return da - db || a['intensità'] - b['intensità'];
      })
      .map(d => ({ x: toX(d.month, d.day), y: toY(d['intensità']), v: d['intensità'] }));

    const pathD = pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const path  = svgEl('path');
    setAttr(path, { d: pathD, fill: 'none', stroke: ACCENT,
      'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    s.appendChild(path);
    linePathEl = path;

    const len = (() => { try { return path.getTotalLength() || 3000; } catch (_) { return 3000; } })();
    setAttr(path, { 'stroke-dasharray': len, 'stroke-dashoffset': len });

    pts.forEach(({ x, y, v }) => {
      const isMax = v === maxIntens;
      const c = svgEl('circle');
      setAttr(c, { cx: x.toFixed(1), cy: y.toFixed(1), r: isMax ? 5 : 3,
        fill: isMax ? ACCENT : BG, stroke: ACCENT,
        'stroke-width': isMax ? 2 : 1.5, opacity: 0 });
      s.appendChild(c);
      lineCircles.push(c);
    });
  }

  function animateLineChart() {
    if (reduced) {
      linePathEl.setAttribute('stroke-dashoffset', 0);
      lineCircles.forEach(c => c.setAttribute('opacity', 1));
      return;
    }
    gsap.to(linePathEl, { attr: { 'stroke-dashoffset': 0 }, duration: 2, ease: 'power2.inOut' });
    gsap.to(lineCircles, { attr: { opacity: 1 }, duration: 0.3, delay: 1.7, stagger: 0.05 });
  }

  /* ── VIZ 4b — Calendario roulette ──────────────────── */
  function buildCalRoulette() {
    /* Day reel: 1–31 × 2 cycles, then 1 → peakDay */
    const dayReel = $('cal-day-reel');
    const dayNums = [];
    for (let c = 0; c < 2; c++) for (let d = 1; d <= 31; d++) dayNums.push(d);
    for (let d = 1; d <= peakDay; d++) dayNums.push(d);
    dayNums.forEach(n => {
      const el = document.createElement('div');
      el.className = 'dati__cal-item';
      el.textContent = String(n).padStart(2, '0');
      dayReel.appendChild(el);
    });

    /* Month reel: all 12 × 2 cycles, then Jan → peakMonth */
    const monthReel = $('cal-month-reel');
    const monthList = [];
    for (let c = 0; c < 2; c++) FULL.forEach(m => monthList.push(m));
    for (let i = 0; i <= peakMonthIdx; i++) monthList.push(FULL[i]);
    monthList.forEach(name => {
      const el = document.createElement('div');
      el.className = 'dati__cal-item';
      el.textContent = name;
      monthReel.appendChild(el);
    });
  }

  function startCalRoulette() {
    const dayReel   = $('cal-day-reel');
    const monthReel = $('cal-month-reel');
    const daySlot   = $('cal-day-slot');
    const monthSlot = $('cal-month-slot');

    const h = dayReel.querySelector('.dati__cal-item')?.offsetHeight || 80;

    daySlot.style.height   = h + 'px';
    monthSlot.style.height = h + 'px';

    const dayCount   = dayReel.children.length;
    const monthCount = monthReel.children.length;

    if (reduced) {
      gsap.set(dayReel,   { y: -((dayCount   - 1) * h) });
      gsap.set(monthReel, { y: -((monthCount - 1) * h) });
      return;
    }

    gsap.fromTo(dayReel,
      { y: 0 },
      { y: -((dayCount - 1) * h), duration: 2.8, ease: 'power4.out', delay: 0.2 }
    );
    gsap.fromTo(monthReel,
      { y: 0 },
      { y: -((monthCount - 1) * h), duration: 3.4, ease: 'power4.out', delay: 0.5 }
    );
  }

  function populateLineComment() {
    const dayStr = `${peakDay} ${FULL[peakMonthIdx]}`;
    $('line-comment').textContent =
      `Ci sono tanti giorni speciali nell'anno, ma il giorno ${dayStr} deve proprio essere stato memorabile! ` +
      `Peccato non avere a disposizione i dati dei successivi dieci mesi in Finlandia!`;
  }

})();
