'use strict';

const NAME_MAP = {
  arietti:  'arianna_m',
  frami:    'maria_francesca_b',
  enrib:    'enrica_b',
  lucipess: 'lucia_g',
  pinovale: 'valentina_p'
};

const DISPLAY = {
  arianna_m:         'Arianna M.',
  maria_francesca_b: 'M. Francesca B.',
  lucia_g:           'Lucia G.',
  enrica_b:          'Enrica B.',
  valentina_p:       'Valentina P.'
};

const COLORS = {
  arianna_m:         '#D44B3F',
  maria_francesca_b: '#E8956D',
  lucia_g:           '#5B9E87',
  enrica_b:          '#8B7DC8',
  valentina_p:       '#C9B458'
};

const PERSON_ORDER  = ['arianna_m','maria_francesca_b','lucia_g','enrica_b','valentina_p'];
const SHORT_DISPLAY = {
  arianna_m:         'Arianna',
  maria_francesca_b: 'M. Francesca',
  lucia_g:           'Lucia',
  enrica_b:          'Enrica',
  valentina_p:       'Valentina'
};
const MONTHS_SHORT  = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott'];
const MONTHS_LONG   = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
                       'Luglio','Agosto','Settembre','Ottobre'];

// ── Stats ────────────────────────────────────────────────
function computeStats(data) {
  const byPerson = {}, byMonth = {}, byDay = {}, byDayPersons = {};
  const imbarazzoSum = {}, imbarazzoCount = {};

  for (const e of data) {
    const key = NAME_MAP[e.name] || e.name;
    byPerson[key] = (byPerson[key] || 0) + 1;

    imbarazzoSum[key]   = (imbarazzoSum[key]   || 0) + (e.imbarazzo || 0);
    imbarazzoCount[key] = (imbarazzoCount[key] || 0) + 1;

    const [dd, mm] = e.data_self_assessed.split('-').map(Number);
    byMonth[mm] = (byMonth[mm] || 0) + 1;
    const k = `${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
    byDay[k] = (byDay[k] || 0) + 1;
    if (!byDayPersons[k]) byDayPersons[k] = {};
    byDayPersons[k][key] = (byDayPersons[k][key] || 0) + 1;
  }

  const avgImbarazzo = {};
  for (const key of Object.keys(imbarazzoSum)) {
    avgImbarazzo[key] = imbarazzoSum[key] / imbarazzoCount[key];
  }

  const byCausa = {};
  const intensitaSum = {}, intensitaCount = {};
  for (const e of data) {
    const key = NAME_MAP[e.name] || e.name;
    if (!byCausa[e.causa]) byCausa[e.causa] = {};
    byCausa[e.causa][key] = (byCausa[e.causa][key] || 0) + 1;
    intensitaSum[key]   = (intensitaSum[key]   || 0) + (e['intensità'] || 0);
    intensitaCount[key] = (intensitaCount[key] || 0) + 1;
  }

  const avgIntensita = {};
  for (const key of Object.keys(intensitaSum)) {
    avgIntensita[key] = intensitaSum[key] / intensitaCount[key];
  }

  return { total: data.length, byPerson, byMonth, byDay, byDayPersons, avgImbarazzo, byCausa, avgIntensita };
}

// ── VIZ 1: Counter ───────────────────────────────────────
function runCounter(stats) {
  const numEl = document.getElementById('lrnpm-counter-num');
  const capEl = document.getElementById('lrnpm-counter-caption');
  if (!numEl) return;

  const duration = 1600, target = stats.total;
  const t0 = performance.now();

  (function tick(now) {
    const p = Math.min((now - t0) / duration, 1);
    const e = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
    numEl.textContent = Math.round(e * target);
    if (p < 1) requestAnimationFrame(tick);
    else numEl.textContent = target;
  })(t0);

  if (capEl) {
    setTimeout(() => {
      capEl.textContent = `Ben ${target} volte! Che annata d'oro. Ma in che misura abbiamo contribuito?`;
      capEl.classList.add('is-visible');
    }, 1500);
  }
}

// ── VIZ 2: Donut ─────────────────────────────────────────
function runDonut(stats) {
  const svg    = document.getElementById('lrnpm-donut-svg');
  const legend = document.getElementById('lrnpm-donut-legend');
  if (!svg) return;
  const ns = 'http://www.w3.org/2000/svg';
  svg.innerHTML = '';
  if (legend) legend.innerHTML = '';

  const cx = 150, cy = 150, R = 120, r = 65;

  function pt(radius, deg) {
    const rad = deg * Math.PI / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function slicePath(a1, a2) {
    const p1 = pt(R, a1), p2 = pt(R, a2);
    const p3 = pt(r, a2), p4 = pt(r, a1);
    const lg = (a2 - a1) > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${R} ${R} 0 ${lg} 1 ${p2.x} ${p2.y}` +
           ` L ${p3.x} ${p3.y} A ${r} ${r} 0 ${lg} 0 ${p4.x} ${p4.y} Z`;
  }

  let angle = -90;
  const gap = 1.5;

  PERSON_ORDER.forEach((key, i) => {
    const count = stats.byPerson[key] || 0;
    if (!count) return;
    const sweep = (count / stats.total) * 360;
    const a1 = angle + gap, a2 = angle + sweep - gap;

    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', slicePath(a1, a2));
    path.setAttribute('fill', COLORS[key]);
    path.style.cssText = `opacity:0;transition:opacity 0.5s ease ${i * 100}ms`;
    svg.appendChild(path);
    requestAnimationFrame(() => path.style.opacity = '1');

    if (legend) {
      const item = document.createElement('div');
      item.className = 'lrnpm-legend__item';
      item.innerHTML =
        `<span class="lrnpm-legend__dot" style="background:${COLORS[key]}"></span>` +
        `<span class="lrnpm-legend__name">${DISPLAY[key]}</span>` +
        `<span class="lrnpm-legend__count">${count}</span>`;
      legend.appendChild(item);
    }

    angle += sweep;
  });
}

// ── VIZ 2b: Podium ───────────────────────────────────────
function runPodium(stats, images) {
  const container = document.getElementById('lrnpm-podium');
  if (!container) return;
  container.innerHTML = '';

  const ranked = PERSON_ORDER
    .map(k => [k, stats.byPerson[k] || 0])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // visual order: 2nd left, 1st centre, 3rd right
  const layout = [
    { entry: ranked[1], rank: 2, h: 80  },
    { entry: ranked[0], rank: 1, h: 130 },
    { entry: ranked[2], rank: 3, h: 55  }
  ];

  layout.forEach(({ entry: [key, count], rank, h }, idx) => {
    const photos = images[key] || [];
    const src = photos.length
      ? `img/people/${key}/${encodeURIComponent(photos[0])}`
      : null;

    const col = document.createElement('div');
    col.className = `lrnpm-podium__col lrnpm-podium__col--${rank}`;

    const photoArea = document.createElement('div');
    photoArea.className = 'lrnpm-podium__photo-area';

    if (src) {
      const img = document.createElement('img');
      img.className = 'lrnpm-podium__img';
      img.src = src;
      img.alt = DISPLAY[key];
      img.loading = 'lazy';
      photoArea.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'lrnpm-podium__placeholder';
      ph.style.background = COLORS[key];
      ph.textContent = DISPLAY[key][0];
      photoArea.appendChild(ph);
    }

    const nameEl = document.createElement('p');
    nameEl.className = 'lrnpm-podium__name';
    nameEl.textContent = DISPLAY[key];
    photoArea.appendChild(nameEl);

    const bar = document.createElement('div');
    bar.className = 'lrnpm-podium__bar';
    bar.style.cssText = `height:0;background:${COLORS[key]};transition:height 0.8s cubic-bezier(0.34,1.56,0.64,1) ${idx * 100}ms`;

    const rankEl = document.createElement('span');
    rankEl.className = 'lrnpm-podium__rank-num';
    rankEl.textContent = `${rank}°`;

    const countEl = document.createElement('span');
    countEl.className = 'lrnpm-podium__count';
    countEl.textContent = count;

    bar.appendChild(rankEl);
    bar.appendChild(countEl);
    col.appendChild(photoArea);
    col.appendChild(bar);
    container.appendChild(col);

    setTimeout(() => { bar.style.height = `${h}px`; }, 80 + idx * 100);
  });

  setTimeout(() => container.classList.add('is-visible'), 50);

  // Caveat: names of those outside the podium
  const caveat = document.getElementById('lrnpm-podium-caveat');
  if (caveat && ranked.length < PERSON_ORDER.length) {
    const outside = PERSON_ORDER
      .map(k => [k, stats.byPerson[k] || 0])
      .sort((a, b) => b[1] - a[1])
      .slice(3)
      .map(([k]) => DISPLAY[k]);
    const names = outside.length > 1
      ? outside.slice(0, -1).join(', ') + ' e ' + outside[outside.length - 1]
      : outside[0];
    caveat.textContent = `Ammesso che ${names} siano state sincere.`;
  }
}

// ── VIZ 4a: Calendar heatmap ─────────────────────────────
function runCalendar(stats) {
  const container = document.getElementById('lrnpm-cal');
  const detail    = document.getElementById('lrnpm-cal-detail');
  if (!container) return;
  container.innerHTML = '';
  if (detail) detail.textContent = '';

  const maxDay = Math.max(...Object.values(stats.byDay));
  let activeCell = null;

  for (let m = 1; m <= 10; m++) {
    const days = new Date(2024, m, 0).getDate();
    const row  = document.createElement('div');
    row.className = 'lrnpm-cal__row';

    const lbl = document.createElement('span');
    lbl.className = 'lrnpm-cal__lbl';
    lbl.textContent = MONTHS_SHORT[m - 1];
    row.appendChild(lbl);

    const cells = document.createElement('div');
    cells.className = 'lrnpm-cal__cells';

    for (let d = 1; d <= days; d++) {
      const k     = `${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const count = stats.byDay[k] || 0;
      const cell  = document.createElement('div');
      cell.className = 'lrnpm-cal__cell';

      if (count > 0) {
        const alpha = (0.25 + (count / maxDay) * 0.75).toFixed(2);
        cell.style.background = `rgba(212,75,63,${alpha})`;
        cell.style.cursor = 'pointer';
        cell.setAttribute('role', 'button');
        cell.setAttribute('aria-label', `${d} ${MONTHS_LONG[m - 1]}: ${count} piantini`);

        cell.addEventListener('click', () => {
          if (activeCell) activeCell.classList.remove('is-active');
          cell.classList.add('is-active');
          activeCell = cell;

          if (!detail) return;
          const persons = stats.byDayPersons[k] || {};
          const names = PERSON_ORDER
            .filter(key => persons[key])
            .map(key => `${DISPLAY[key]} (${persons[key]})`)
            .join(', ');
          detail.textContent = `${d} ${MONTHS_LONG[m - 1]} — ${names}`;
          detail.classList.add('is-visible');
        });
      }

      cells.appendChild(cell);
    }

    row.appendChild(cells);
    container.appendChild(row);
  }
}

// ── VIZ 4b: Line chart ───────────────────────────────────
function runLineChart(stats) {
  const svg = document.getElementById('lrnpm-line-svg');
  if (!svg) return;
  svg.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';

  const W = 680, H = 200, pL = 38, pR = 16, pT = 26, pB = 34;
  const cW = W - pL - pR, cH = H - pT - pB;
  const vals = MONTHS_SHORT.map((_, i) => stats.byMonth[i + 1] || 0);
  const maxV = Math.max(...vals);
  const n = vals.length;

  const xp = i => pL + (i / (n - 1)) * cW;
  const yp = v => pT + cH - (v / maxV) * cH;

  // Baseline
  const bl = document.createElementNS(ns, 'line');
  bl.setAttribute('x1', pL); bl.setAttribute('y1', pT + cH);
  bl.setAttribute('x2', W - pR); bl.setAttribute('y2', pT + cH);
  bl.setAttribute('stroke', 'rgba(26,26,26,0.12)'); bl.setAttribute('stroke-width', '1');
  svg.appendChild(bl);

  // Y-axis ticks
  [0, Math.ceil(maxV / 2), maxV].forEach(v => {
    const yy = yp(v);
    const gl = document.createElementNS(ns, 'line');
    gl.setAttribute('x1', pL); gl.setAttribute('y1', yy);
    gl.setAttribute('x2', W - pR); gl.setAttribute('y2', yy);
    gl.setAttribute('stroke', 'rgba(26,26,26,0.07)'); gl.setAttribute('stroke-width', '1');
    svg.appendChild(gl);

    const tx = document.createElementNS(ns, 'text');
    tx.setAttribute('x', pL - 5); tx.setAttribute('y', yy + 4);
    tx.setAttribute('text-anchor', 'end'); tx.setAttribute('font-size', '10');
    tx.setAttribute('fill', 'rgba(26,26,26,0.38)'); tx.textContent = v;
    svg.appendChild(tx);
  });

  // Area
  const areaD = `M ${xp(0)},${pT + cH} ` +
    vals.map((v, i) => `L ${xp(i)},${yp(v)}`).join(' ') +
    ` L ${xp(n - 1)},${pT + cH} Z`;
  const area = document.createElementNS(ns, 'path');
  area.setAttribute('d', areaD);
  area.setAttribute('fill', 'rgba(212,75,63,0.08)');
  svg.appendChild(area);

  // Polyline
  const pts = vals.map((v, i) => `${xp(i)},${yp(v)}`).join(' ');
  const poly = document.createElementNS(ns, 'polyline');
  poly.setAttribute('points', pts);
  poly.setAttribute('fill', 'none');
  poly.setAttribute('stroke', '#D44B3F');
  poly.setAttribute('stroke-width', '2.5');
  poly.setAttribute('stroke-linejoin', 'round');
  poly.setAttribute('stroke-linecap', 'round');
  svg.appendChild(poly);

  // Dash-draw animation
  try {
    const len = poly.getTotalLength() || 700;
    poly.setAttribute('stroke-dasharray', len);
    poly.setAttribute('stroke-dashoffset', len);
    poly.style.transition = 'stroke-dashoffset 1.2s ease';
    requestAnimationFrame(() => requestAnimationFrame(() =>
      poly.setAttribute('stroke-dashoffset', '0')
    ));
  } catch (_) { /* skip animation if not supported */ }

  // Dots + labels
  vals.forEach((v, i) => {
    const isMax = v === maxV;
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', xp(i)); dot.setAttribute('cy', yp(v));
    dot.setAttribute('r', isMax ? 6 : 3.5);
    dot.setAttribute('fill', isMax ? '#D44B3F' : '#F2EDE6');
    dot.setAttribute('stroke', '#D44B3F'); dot.setAttribute('stroke-width', '2');
    svg.appendChild(dot);

    if (v > 0 && (isMax || v >= maxV * 0.75)) {
      const num = document.createElementNS(ns, 'text');
      num.setAttribute('x', xp(i)); num.setAttribute('y', yp(v) - 11);
      num.setAttribute('text-anchor', 'middle'); num.setAttribute('font-size', '11');
      num.setAttribute('font-weight', '700'); num.setAttribute('fill', '#D44B3F');
      num.textContent = v;
      svg.appendChild(num);
    }

    const ml = document.createElementNS(ns, 'text');
    ml.setAttribute('x', xp(i)); ml.setAttribute('y', H - pB + 16);
    ml.setAttribute('text-anchor', 'middle'); ml.setAttribute('font-size', '10');
    ml.setAttribute('fill', 'rgba(26,26,26,0.45)');
    ml.textContent = MONTHS_SHORT[i];
    svg.appendChild(ml);
  });
}

// ── Best month comment ────────────────────────────────────
function setComment(stats) {
  const el = document.getElementById('lrnpm-temporal-comment');
  if (!el) return;
  const maxV = Math.max(...Object.values(stats.byMonth));
  const best = Object.entries(stats.byMonth)
    .filter(([, v]) => v === maxV)
    .map(([m]) => MONTHS_LONG[+m - 1]);
  const label = best.length > 1 ? `${best[0]} e ${best[1]}` : best[0];
  const verb  = best.length > 1 ? 'mesi speciali che sono stati' : 'mese speciale che è stato';
  let text = `Wow, che ${verb} ${label} (${maxV} piantini).`;

  const emptyMonths = MONTHS_LONG.filter((_, i) => !stats.byMonth[i + 1]);
  if (emptyMonths.length) {
    const last = emptyMonths[emptyMonths.length - 1];
    const rest = emptyMonths.slice(0, -1);
    const monthList = rest.length ? rest.join(', ') + ' e ' + last : last;
    text += ` Comunque sembra improbabile che nei mesi di ${monthList} non sia stata versata nemmeno una lacrima. Probabilmente una svista nella registrazione dei dati.`;
  }

  el.textContent = text;
}

// ── Cause comment ─────────────────────────────────────────
function setCauseComment(stats) {
  const el = document.getElementById('lrnpm-cause-comment');
  if (!el) return;
  const sum = (causa) => Object.values(stats.byCausa[causa] || {}).reduce((a, b) => a + b, 0);
  const tot = stats.total;
  const y   = sum('accademia-lavoro-economia');
  const z   = sum('contrattempi');
  const w   = sum('stress-ansia-per-futuro-nostalgia');
  const n   = sum('altro-e-gran-mix');
  el.textContent = `Su ${tot} piantini registrati, ${y} sono stati direttamente causati dal dottorato / lavoro. I ${z} imputabili ai contrattempi non sono necessariamente indipendenti dalla categoria sopracitata, così come i ${w} relativi ad ansia e nostalgia, e - perché no - i ${n} classificati come altro e gran mix. Correlation is not causation, ma manco a fa così.`;
}

// ── VIZ 5: Embarrassment bar chart ───────────────────────
function runEmbarrassmentChart(stats) {
  const svg = document.getElementById('lrnpm-vergogna-svg');
  if (!svg) return;
  svg.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';

  const W = 520, H = 260, pL = 32, pR = 16, pT = 36, pB = 42;
  const cW = W - pL - pR, cH = H - pT - pB;
  const maxV = 10;
  const n = PERSON_ORDER.length;
  const barW = Math.floor(cW / n * 0.55);
  const slotW = cW / n;

  // Grid lines at 0, 5, 10
  [0, 5, 10].forEach(v => {
    const yy = pT + cH - (v / maxV) * cH;
    const gl = document.createElementNS(ns, 'line');
    gl.setAttribute('x1', pL); gl.setAttribute('y1', yy);
    gl.setAttribute('x2', W - pR); gl.setAttribute('y2', yy);
    gl.setAttribute('stroke', 'rgba(26,26,26,0.08)'); gl.setAttribute('stroke-width', '1');
    svg.appendChild(gl);

    const tx = document.createElementNS(ns, 'text');
    tx.setAttribute('x', pL - 5); tx.setAttribute('y', yy + 4);
    tx.setAttribute('text-anchor', 'end'); tx.setAttribute('font-size', '10');
    tx.setAttribute('fill', 'rgba(26,26,26,0.35)'); tx.textContent = v;
    svg.appendChild(tx);
  });

  // Baseline
  const bl = document.createElementNS(ns, 'line');
  bl.setAttribute('x1', pL); bl.setAttribute('y1', pT + cH);
  bl.setAttribute('x2', W - pR); bl.setAttribute('y2', pT + cH);
  bl.setAttribute('stroke', 'rgba(26,26,26,0.15)'); bl.setAttribute('stroke-width', '1');
  svg.appendChild(bl);

  PERSON_ORDER.forEach((key, i) => {
    const avg = stats.avgImbarazzo[key] || 0;
    const finalH = (avg / maxV) * cH;
    const finalY = pT + cH - finalH;
    const cx = pL + slotW * i + slotW / 2;
    const x  = cx - barW / 2;

    // Bar starting at 0 height
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', pT + cH);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', 0);
    rect.setAttribute('fill', COLORS[key]);
    rect.setAttribute('rx', '3');
    svg.appendChild(rect);

    // Animate bar growth with rAF
    const delay = i * 90;
    const duration = 650;
    setTimeout(() => {
      const t0 = performance.now();
      (function step(now) {
        const t = Math.min((now - t0) / duration, 1);
        const e = 1 - Math.pow(1 - t, 3); // ease-out cubic
        const h = e * finalH;
        rect.setAttribute('height', h);
        rect.setAttribute('y', pT + cH - h);
        if (t < 1) requestAnimationFrame(step);
      })(t0);
    }, delay);

    // Value label (above bar)
    const val = document.createElementNS(ns, 'text');
    val.setAttribute('x', cx);
    val.setAttribute('y', finalY - 7);
    val.setAttribute('text-anchor', 'middle');
    val.setAttribute('font-size', '11');
    val.setAttribute('font-weight', '700');
    val.setAttribute('fill', COLORS[key]);
    val.textContent = avg.toFixed(1);
    svg.appendChild(val);

    // Name label (below baseline)
    const lbl = document.createElementNS(ns, 'text');
    lbl.setAttribute('x', cx);
    lbl.setAttribute('y', H - pB + 16);
    lbl.setAttribute('text-anchor', 'middle');
    lbl.setAttribute('font-size', '10');
    lbl.setAttribute('fill', 'rgba(26,26,26,0.5)');
    lbl.textContent = SHORT_DISPLAY[key];
    svg.appendChild(lbl);
  });
}

// ── VIZ 7: Intensity podium ───────────────────────────────
function runIntensityPodium(stats, images) {
  const container = document.getElementById('lrnpm-intensity-podium');
  if (!container) return;
  container.innerHTML = '';

  const ranked = PERSON_ORDER
    .map(k => [k, stats.avgIntensita[k] || 0])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const layout = [
    { entry: ranked[1], rank: 2, h: 80  },
    { entry: ranked[0], rank: 1, h: 130 },
    { entry: ranked[2], rank: 3, h: 55  }
  ];

  layout.forEach(({ entry: [key, avg], rank, h }, idx) => {
    const photos = images[key] || [];
    const src    = photos.length ? `img/people/${key}/${encodeURIComponent(photos[0])}` : null;

    const col = document.createElement('div');
    col.className = `lrnpm-podium__col lrnpm-podium__col--${rank}`;

    const photoArea = document.createElement('div');
    photoArea.className = 'lrnpm-podium__photo-area';

    if (src) {
      const img = document.createElement('img');
      img.className = 'lrnpm-podium__img'; img.src = src; img.alt = DISPLAY[key]; img.loading = 'lazy';
      photoArea.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'lrnpm-podium__placeholder'; ph.style.background = COLORS[key];
      ph.textContent = DISPLAY[key][0];
      photoArea.appendChild(ph);
    }

    const nameEl = document.createElement('p');
    nameEl.className = 'lrnpm-podium__name'; nameEl.textContent = DISPLAY[key];
    photoArea.appendChild(nameEl);

    const bar = document.createElement('div');
    bar.className = 'lrnpm-podium__bar';
    bar.style.cssText = `height:0;background:${COLORS[key]};transition:height 0.8s cubic-bezier(0.34,1.56,0.64,1) ${idx * 100}ms`;

    const rankEl = document.createElement('span');
    rankEl.className = 'lrnpm-podium__rank-num'; rankEl.textContent = `${rank}°`;

    const valEl = document.createElement('span');
    valEl.className = 'lrnpm-podium__count'; valEl.textContent = avg.toFixed(1);

    bar.appendChild(rankEl); bar.appendChild(valEl);
    col.appendChild(photoArea); col.appendChild(bar);
    container.appendChild(col);

    setTimeout(() => { bar.style.height = `${h}px`; }, 80 + idx * 100);
  });

  setTimeout(() => container.classList.add('is-visible'), 50);
}

// ── VIZ 6: Stacked cause bar chart ───────────────────────
const CAUSA_LABELS = {
  'audio-video-scritto':              'Film, serie & libri',
  'relazioni-amicali-familiari':      'Amicizia & famiglia',
  'accademia-lavoro-economia':        'Accademia & lavoro',
  'altro-e-gran-mix':                 'Altro & gran mix',
  'contrattempi':                     'Contrattempi',
  'stress-ansia-per-futuro-nostalgia':'Stress & ansia',
  'dolore-fisico-malattia':           'Dolore & malattia',
  'relazioni-sessuoaffettive':        'Relazioni sentimentali'
};

function runCauseChart(stats, images) {
  const svg      = document.getElementById('lrnpm-cause-svg');
  const legendEl = document.getElementById('lrnpm-cause-legend');
  if (!svg) return;
  svg.innerHTML = '';
  if (legendEl) legendEl.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';

  const causaData = Object.entries(stats.byCausa)
    .map(([causa, byPerson]) => ({
      causa,
      label: CAUSA_LABELS[causa] || causa,
      total: Object.values(byPerson).reduce((a, b) => a + b, 0),
      byPerson
    }))
    .sort((a, b) => b.total - a.total);

  const n    = causaData.length;
  const W = 680, H = 320, pL = 32, pR = 16, pT = 24, pB = 100;
  const cW   = W - pL - pR, cH = H - pT - pB;
  const maxY = Math.ceil(Math.max(...causaData.map(d => d.total)) / 5) * 5 || 5;
  const barW = Math.floor(cW / n * 0.58);
  const slotW = cW / n;

  // Grid lines
  [0, Math.round(maxY / 2), maxY].forEach(v => {
    const yy = pT + cH - (v / maxY) * cH;
    const gl = document.createElementNS(ns, 'line');
    gl.setAttribute('x1', pL); gl.setAttribute('y1', yy);
    gl.setAttribute('x2', W - pR); gl.setAttribute('y2', yy);
    gl.setAttribute('stroke', 'rgba(26,26,26,0.08)'); gl.setAttribute('stroke-width', '1');
    svg.appendChild(gl);
    const tx = document.createElementNS(ns, 'text');
    tx.setAttribute('x', pL - 5); tx.setAttribute('y', yy + 4);
    tx.setAttribute('text-anchor', 'end'); tx.setAttribute('font-size', '10');
    tx.setAttribute('fill', 'rgba(26,26,26,0.35)'); tx.textContent = v;
    svg.appendChild(tx);
  });

  // Baseline
  const bl = document.createElementNS(ns, 'line');
  bl.setAttribute('x1', pL); bl.setAttribute('y1', pT + cH);
  bl.setAttribute('x2', W - pR); bl.setAttribute('y2', pT + cH);
  bl.setAttribute('stroke', 'rgba(26,26,26,0.15)'); bl.setAttribute('stroke-width', '1');
  svg.appendChild(bl);

  // Stacked bars
  causaData.forEach(({ label, total, byPerson }, i) => {
    const cx   = pL + slotW * i + slotW / 2;
    const x    = cx - barW / 2;
    let   curY = pT + cH;

    PERSON_ORDER.forEach(key => {
      const count = byPerson[key] || 0;
      if (!count) return;
      const h = (count / maxY) * cH;
      curY -= h;
      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', x); rect.setAttribute('y', curY);
      rect.setAttribute('width', barW); rect.setAttribute('height', h);
      rect.setAttribute('fill', COLORS[key]);
      svg.appendChild(rect);
    });

    // Total count above bar
    const topY = pT + cH - (total / maxY) * cH;
    const num  = document.createElementNS(ns, 'text');
    num.setAttribute('x', cx); num.setAttribute('y', topY - 5);
    num.setAttribute('text-anchor', 'middle'); num.setAttribute('font-size', '10');
    num.setAttribute('font-weight', '700'); num.setAttribute('fill', 'rgba(26,26,26,0.55)');
    num.textContent = total;
    svg.appendChild(num);

    // Rotated x-axis label
    const lbl = document.createElementNS(ns, 'text');
    lbl.setAttribute('text-anchor', 'end'); lbl.setAttribute('font-size', '10');
    lbl.setAttribute('fill', 'rgba(26,26,26,0.5)');
    lbl.setAttribute('transform', `translate(${cx + 4},${pT + cH + 10}) rotate(-40)`);
    lbl.textContent = label;
    svg.appendChild(lbl);
  });

  // Legend with photos
  if (legendEl) {
    PERSON_ORDER.forEach(key => {
      const photos = images[key] || [];
      const src    = photos.length ? `img/people/${key}/${encodeURIComponent(photos[0])}` : null;

      const item = document.createElement('div');
      item.className = 'lrnpm-cause-legend__item';

      if (src) {
        const img = document.createElement('img');
        img.className = 'lrnpm-cause-legend__photo';
        img.src = src; img.alt = DISPLAY[key];
        img.style.borderColor = COLORS[key];
        item.appendChild(img);
      } else {
        const ph = document.createElement('div');
        ph.className = 'lrnpm-cause-legend__placeholder';
        ph.style.cssText = `background:${COLORS[key]};border-color:${COLORS[key]}`;
        ph.textContent = DISPLAY[key][0];
        item.appendChild(ph);
      }

      const nameEl = document.createElement('span');
      nameEl.className = 'lrnpm-cause-legend__name';
      nameEl.textContent = SHORT_DISPLAY[key];
      item.appendChild(nameEl);
      legendEl.appendChild(item);
    });
  }
}

// ── VIZ 8: New entry (2025) ───────────────────────────────
function slotSettle(el, finalStr, delay) {
  const isFloat = finalStr.includes('.');
  const finalNum = parseFloat(finalStr);
  setTimeout(() => {
    const duration = 1400, t0 = performance.now();
    (function tick(now) {
      const t = Math.min((now - t0) / duration, 1);
      if (t < 0.8) {
        el.textContent = (Math.random() * 10).toFixed(isFloat ? 1 : 0);
        requestAnimationFrame(tick);
      } else {
        const ease = (t - 0.8) / 0.2;
        el.textContent = (finalNum * ease).toFixed(isFloat ? 1 : 0);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = finalStr;
      }
    })(t0);
  }, delay);
}

function runNewEntry(data2025, images) {
  if (!data2025 || !data2025.length) return;

  const key         = data2025[0].name;
  const displayName = DISPLAY[key] || key;
  const photos      = images[key] || [];

  // Photo reveal
  const photoWrap = document.getElementById('lrnpm-newentry-photo');
  const nameEl    = document.getElementById('lrnpm-newentry-name');
  if (photoWrap) {
    if (photos.length) {
      const img = document.createElement('img');
      img.className = 'lrnpm-newentry__img';
      img.src       = `img/people/${key}/${encodeURIComponent(photos[0])}`;
      img.alt       = displayName;
      photoWrap.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className  = 'lrnpm-newentry__placeholder';
      ph.style.background = COLORS[key] || '#999';
      ph.textContent = displayName[0];
      photoWrap.appendChild(ph);
    }
    setTimeout(() => photoWrap.classList.add('is-revealed'), 150);
  }
  if (nameEl) setTimeout(() => nameEl.classList.add('is-visible'), 900);

  // Compute stats
  const causes = [...new Set(data2025.map(e => e.causa))];
  const avgInt = (data2025.reduce((s, e) => s + (e['intensità'] || 0), 0) / data2025.length).toFixed(1);
  const avgImb = (data2025.reduce((s, e) => s + (e.imbarazzo   || 0), 0) / data2025.length).toFixed(1);

  const statsEl = document.getElementById('lrnpm-giulia-stats');
  if (!statsEl) return;

  const items = [
    { label: 'Cause',           value: causes.join(', '),  isText: true  },
    { label: 'Intensità media', value: avgInt,              isText: false },
    { label: 'Imbarazzo medio', value: avgImb,              isText: false }
  ];

  items.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'lrnpm-gstat';

    const lbl = document.createElement('span');
    lbl.className   = 'lrnpm-gstat__label';
    lbl.textContent = item.label;

    const val = document.createElement('span');
    val.className   = 'lrnpm-gstat__value';
    val.textContent = item.isText ? item.value : '—';

    div.appendChild(lbl);
    div.appendChild(val);
    statsEl.appendChild(div);

    const appearDelay = 700 + i * 280;
    setTimeout(() => div.classList.add('is-visible'), appearDelay);
    if (!item.isText) slotSettle(val, item.value, appearDelay + 200);
  });
}

// ── Main ─────────────────────────────────────────────────
async function main() {
  try {
    const [data, images, data2025] = await Promise.all([
      fetch('data/lrnpm_piantini_full.json?v=1').then(r => r.json()),
      fetch('data/images.json?v=13').then(r => r.json()).catch(() => ({})),
      fetch('data/lrnpm_piantini_2025.json?v=1').then(r => r.json()).catch(() => [])
    ]);

    const stats = computeStats(data);

    const obs = new IntersectionObserver((entries) => {
      for (const { isIntersecting, target } of entries) {
        if (!isIntersecting) continue;
        target.classList.add('is-visible');
        obs.unobserve(target);
        const id = target.id;
        if (id === 'viz-counter')  runCounter(stats);
        if (id === 'viz-donut')    runDonut(stats);
        if (id === 'viz-podium')   runPodium(stats, images);
        if (id === 'viz-temporal')  { runCalendar(stats); runLineChart(stats); setComment(stats); }
        if (id === 'viz-vergogna')  runEmbarrassmentChart(stats);
        if (id === 'viz-cause')      { runCauseChart(stats, images); setCauseComment(stats); }
        if (id === 'viz-intensity')  runIntensityPodium(stats, images);
        if (id === 'viz-mapoi')      runNewEntry(data2025, images);
      }
    }, { threshold: 0.15 });

    document.querySelectorAll('.lrnpm-section').forEach(el => obs.observe(el));

  } catch (err) {
    console.error('[lrnpm]', err);
  }
}

document.addEventListener('DOMContentLoaded', main);
