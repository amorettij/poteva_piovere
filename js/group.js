/* =====================================================
   group.js — group & person pages from people.json v2
   ===================================================== */

(async function () {

  /* ── Utilities first (used throughout) ─────────────── */
  const $    = id  => document.getElementById(id);
  const show = id  => { const el = $(id); if (el) el.hidden = false; };
  const hide = id  => { const el = $(id); if (el) el.hidden = true;  };
  const setEl = (id, text) => { const el = $(id); if (el) el.textContent = text; };

  function esc(str) {
    const d = document.createElement('div'); d.textContent = str; return d.innerHTML;
  }
  function personSvg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>`;
  }
  function groupSvg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <circle cx="9"  cy="7"  r="3"/><circle cx="15" cy="7" r="3"/>
      <path d="M1 20c0-3 3-5 8-5s8 2 8 5"/><path d="M15 15c3 0 6 1.5 6 4"/>
    </svg>`;
  }

  /* ── Route ──────────────────────────────────────────── */
  const groupId = new URLSearchParams(location.search).get('group');
  if (!groupId) { location.replace('ringraziamenti.html'); return; }

  /* ── Fetch ──────────────────────────────────────────── */
  let data, imgManifest;
  try {
    const [res, imgRes] = await Promise.all([
      fetch('data/people.json?v=15'),
      fetch('data/images.json?v=12')
    ]);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data        = await res.json();
    imgManifest = imgRes.ok ? await imgRes.json() : {};
  } catch (err) {
    $('cards-grid').insertAdjacentHTML('afterend',
      `<p class="group-error">Impossibile caricare i dati. (${err.message})</p>`);
    return;
  }

  /* ── Find node ──────────────────────────────────────── */
  const result = findNode(groupId, data.groups);
  if (!result) { location.replace('ringraziamenti.html'); return; }
  const { node, parent } = result;

  /* ── Page meta ──────────────────────────────────────── */
  document.title = `${node.label} — Poteva Piovere`;
  buildBreadcrumb(node, parent);
  setEl('group-title', node.label.toUpperCase());

  /* ── Group dedica ───────────────────────────────────── */
  if (node.ackn) {
    const el = $('group-ackn');
    node.ackn.split('\n').filter(Boolean).forEach(line => {
      const p = document.createElement('p'); p.innerHTML = line; el.appendChild(p);
    });
    show('group-text');
  }

  /* ── Group photo carousel ───────────────────────────── */
  const groupImgs = (imgManifest[node.id] ?? []).map(f => `img/people/${node.id}/${f}`);
  if (groupImgs.length) {
    show('group-carousel-section');
    initCarousel(
      { track: $('gcarousel-track'), dots: $('gcarousel-dots'),
        prev: $('gcarousel-prev'),   next: $('gcarousel-next') },
      groupImgs,
      { autoAdvance: true, letterbox: true }
    );
  }

  /* ── Count + content ────────────────────────────────── */
  const total = countMembers(node);

  if (node.subgroups?.length || node.members?.length) {
    setEl('group-count', `${total} ${total === 1 ? 'persona' : 'persone'}`);
    if (node.subgroups?.length) renderSubgroupCards(node.subgroups);
    if (node.members?.length)   renderPeople(node, data);
    if (node.security_code === 'yes') renderPinGate(node);
  }


  /* =====================================================
     SUBGROUP CARDS
     ===================================================== */

  function renderSubgroupCards(subgroups) {
    const grid = $('cards-grid');
    const frag = document.createDocumentFragment();

    subgroups.forEach(sg => {
      const count   = countMembers(sg);
      const sgFiles  = imgManifest[sg.id] ?? [];
      const firstImg = sgFiles[0] ? `img/people/${sg.id}/${sgFiles[0]}` : null;
      const href    = `group.html?group=${encodeURIComponent(sg.id)}`;

      const card = document.createElement('a');
      card.className = 'card card--group';
      card.href      = href;
      card.setAttribute('aria-label', `Apri gruppo ${esc(sg.label)}`);

      card.innerHTML = `
        <div class="card__img-wrap">
          ${firstImg ? `<img class="card__img" src="${esc(firstImg)}" alt="" loading="lazy">` : ''}
          <div class="card__img-placeholder"${firstImg ? ' hidden' : ''} aria-hidden="true">${groupSvg()}</div>
        </div>
        <p class="card__name">${esc(sg.label)}</p>
        <p class="card__quote">${count} ${count === 1 ? 'persona' : 'persone'}</p>
      `;

      if (firstImg) {
        const img = card.querySelector('.card__img');
        const ph  = card.querySelector('.card__img-placeholder');
        img.addEventListener('error', () => { img.hidden = true; ph.hidden = false; });
      }

      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }


  /* =====================================================
     PERSON CARDS
     ===================================================== */

  function renderPeople(node, data) {
    const grid = $('cards-grid');
    const frag = document.createDocumentFragment();

    (node.members ?? []).forEach(key => {
      const person = data.people[key];
      if (!person) return;

      const pFiles   = imgManifest[key] ?? [];
      const firstImg = pFiles[0] ? `img/people/${key}/${pFiles[0]}` : null;

      const card = document.createElement('article');
      card.className   = 'card';
      card.tabIndex    = 0;
      card.role        = 'button';
      card.dataset.key = key;
      card.setAttribute('aria-label', `Apri scheda di ${esc(person.display)}`);

      card.innerHTML = `
        <div class="card__img-wrap">
          ${firstImg ? `<img class="card__img" src="${esc(firstImg)}" alt="${esc(person.display)}" loading="lazy">` : ''}
          <div class="card__img-placeholder"${firstImg ? ' hidden' : ''} aria-hidden="true">${personSvg()}</div>
        </div>
        <p class="card__name">${esc(person.display)}</p>
        ${person.quote ? `<p class="card__quote">${esc(person.quote)}</p>` : ''}
      `;

      if (firstImg) {
        const img = card.querySelector('.card__img');
        const ph  = card.querySelector('.card__img-placeholder');
        img.addEventListener('error', () => { img.hidden = true; ph.hidden = false; });
      }

      card.addEventListener('click',   () => openModal(key, data));
      card.addEventListener('keydown',  e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(key, data); }
      });

      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }


  /* =====================================================
     CAROUSEL
     ===================================================== */

  function initCarousel({ track, dots, prev, next }, images, options = {}) {
    const { autoAdvance = false, letterbox = false } = options;
    const total = images.length;
    let current = 0;
    let autoTimer = null;

    track.innerHTML = '';
    if (dots) dots.innerHTML = '';

    images.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = letterbox ? 'lbslide' : 'carousel__slide';
      const img = document.createElement('img');
      img.className = letterbox ? 'lbslide__img' : 'carousel__img';
      img.alt = ''; img.loading = i === 0 ? 'eager' : 'lazy'; img.src = src;
      img.addEventListener('error', () => { img.style.visibility = 'hidden'; });
      slide.appendChild(img);
      track.appendChild(slide);

      if (dots && total > 1) {
        const dot = document.createElement('button');
        dot.className = `gcarousel__dot${i === 0 ? ' gcarousel__dot--active' : ''}`;
        dot.setAttribute('aria-label', `Foto ${i + 1}`);
        dot.addEventListener('click', () => { goTo(i); resetAuto(); });
        dots.appendChild(dot);
      }
    });

    updateControls();
    if (autoAdvance && total > 1) startAuto();

    function goTo(index) {
      current = ((index % total) + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      updateControls();
    }
    function updateControls() {
      if (prev) prev.hidden = total <= 1;
      if (next) next.hidden = total <= 1;
      if (dots) dots.querySelectorAll('.gcarousel__dot').forEach((d, i) =>
        d.classList.toggle('gcarousel__dot--active', i === current));
    }
    function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 3000); }
    function resetAuto() { if (!autoAdvance) return; clearInterval(autoTimer); startAuto(); }

    if (prev) prev.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    if (next) next.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    return { prev: () => { goTo(current - 1); resetAuto(); },
             next: () => { goTo(current + 1); resetAuto(); },
             stop: () => clearInterval(autoTimer) };
  }


  /* =====================================================
     PERSON MODAL
     ===================================================== */

  const overlay   = $('modal-overlay');
  const modal     = $('modal');
  const closeBtn  = $('modal-close');
  const modalName = $('modal-name');
  const modalText = $('modal-text');
  const reduced   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lastFocused   = null;
  let modalCarousel = null;

  function openModal(key, allData) {
    const person = allData.people[key];
    if (!person) return;
    lastFocused = document.activeElement;

    modalName.textContent = person.display;
    if (person.spid_gate) {
      renderSpidGate(person, modalText);
    } else {
      modalText.innerHTML = (person.ackn || '').split('\n').filter(Boolean).map(l => `<p>${l}</p>`).join('');
    }

    const imgs   = (imgManifest[key] ?? []).map(f => `img/people/${key}/${f}`);
    const stage  = $('mcarousel-stage');
    stage.hidden = imgs.length === 0;

    if (imgs.length) {
      if (!reduced) $('mcarousel-track').style.transition = 'transform 0.35s ease';
      modalCarousel = initCarousel(
        { track: $('mcarousel-track'), dots: $('mcarousel-dots'),
          prev:  $('mcarousel-prev'),  next: $('mcarousel-next') },
        imgs, { autoAdvance: true, letterbox: true }
      );
    }

    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('modal-overlay--open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => closeBtn.focus());
  }

  function closeModal() {
    modalCarousel?.stop(); modalCarousel = null;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('modal-overlay--open');
    document.body.style.overflow = '';
    lastFocused?.focus(); lastFocused = null;
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('modal-overlay--open')) return;
    if (e.key === 'Escape')     { closeModal(); return; }
    if (e.key === 'ArrowLeft')  { modalCarousel?.prev(); return; }
    if (e.key === 'ArrowRight') { modalCarousel?.next(); return; }
    if (e.key === 'Tab') {
      const focusable = Array.from(modal.querySelectorAll(
        'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) { e.preventDefault(); return; }
      if (e.shiftKey) {
        if (document.activeElement === focusable[0]) { e.preventDefault(); focusable.at(-1).focus(); }
      } else {
        if (document.activeElement === focusable.at(-1)) { e.preventDefault(); focusable[0].focus(); }
      }
    }
  });


  /* =====================================================
     PIN GATE
     ===================================================== */

  function renderPinGate(node) {
    show('pin-gate');
    const form    = $('pin-form');
    const input   = $('pin-input');
    const errorEl = $('pin-error');
    const section = $('protected-section');
    const content = $('protected-content');
    const spinner = $('pin-spinner');
    const arrow   = $('pin-arrow');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const pin = input.value.trim();
      if (!pin) return;

      errorEl.textContent = '';
      input.disabled = true;
      spinner.hidden = false; arrow.hidden = true;

      const plaintext = await tryDecrypt(pin, node.protected_section);

      spinner.hidden = true; arrow.hidden = false;
      input.disabled = false;

      if (plaintext === null) {
        errorEl.textContent = 'Codice non corretto.';
        input.value = ''; input.focus(); return;
      }

      hide('pin-gate');
      if (node.redirect_on_unlock) {
        window.location.href = node.redirect_on_unlock;
        return;
      }
      section.hidden = false;
      plaintext.split('\n').filter(Boolean).forEach(line => {
        const p = document.createElement('p'); p.textContent = line; content.appendChild(p);
      });
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  async function tryDecrypt(pin, { salt, iv, ct }) {
    try {
      const enc = new TextEncoder();
      const km  = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey']);
      const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: b64(salt), iterations: 100000, hash: 'SHA-256' },
        km, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(iv) }, key, b64(ct));
      return new TextDecoder().decode(dec);
    } catch (_) { return null; }
  }

  function b64(s) { return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }


  /* =====================================================
     SPID GATE (Remo)
     ===================================================== */

  function renderSpidGate(person, container) {
    const phrases = [
      'è richiesto ingresso con SPID',
      'entra con SPID',
      'confermi di voler entrare con SPID?',
      'clicca per entrare con SPID',
      'stai per entrare con SPID',
      'sei praticamente entrato con SPID',
      'entra con SPID'
    ];
    let step = 0;

    container.innerHTML = '';
    const arena = document.createElement('div');
    arena.className = 'spid-arena';
    container.appendChild(arena);

    const btn = document.createElement('button');
    btn.className = 'spid-btn';
    btn.textContent = phrases[0];
    arena.appendChild(btn);

    function placeBtn() {
      btn.style.transform = 'none';
      const aw = arena.clientWidth;
      const ah = arena.clientHeight;
      const bw = btn.offsetWidth;
      const bh = btn.offsetHeight;
      btn.style.left = `${Math.random() * Math.max(0, aw - bw)}px`;
      btn.style.top  = `${Math.random() * Math.max(0, ah - bh)}px`;
    }

    btn.addEventListener('click', () => {
      step++;
      if (step >= phrases.length) {
        container.innerHTML = (person.ackn || '').split('\n').filter(Boolean)
          .map(l => `<p>${l}</p>`).join('');
      } else {
        btn.textContent = phrases[step];
        placeBtn();
      }
    });
  }


  /* =====================================================
     SHARED UTILITIES
     ===================================================== */

  function findNode(id, groups, parent = null) {
    for (const g of groups) {
      if (g.id === id) return { node: g, parent };
      if (g.subgroups) {
        const found = findNode(id, g.subgroups, g);
        if (found) return found;
      }
    }
    return null;
  }

  function countMembers(node) {
    let count = 0;
    if (node.members)   count += node.members.length;
    if (node.subgroups) count += node.subgroups.reduce((s, sg) => s + countMembers(sg), 0);
    return count;
  }

  function buildBreadcrumb(node, parent) {
    const nav = $('breadcrumb');
    nav.innerHTML = '';

    const addLink = (href, label) => {
      const a = document.createElement('a');
      a.href = href; a.className = 'breadcrumb__link'; a.textContent = label;
      nav.appendChild(a);
    };
    const addCurrent = label => {
      const s = document.createElement('span');
      s.className = 'breadcrumb__current'; s.setAttribute('aria-current', 'page');
      s.textContent = label; nav.appendChild(s);
    };
    const addSep = () => {
      const s = document.createElement('span');
      s.className = 'breadcrumb__sep'; s.setAttribute('aria-hidden', 'true');
      s.textContent = '/'; nav.appendChild(s);
    };

    addLink('ringraziamenti.html', 'I RINGRAZIAMENTI');
    if (parent) { addSep(); addLink(`group.html?group=${encodeURIComponent(parent.id)}`, parent.label.toUpperCase()); }
    addSep();
    addCurrent(node.label.toUpperCase());
  }

})();
