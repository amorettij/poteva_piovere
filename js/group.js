/* =====================================================
   group.js — renders person cards and modal for a single group
   ===================================================== */

(async function () {

  /* ─── Guard: require ?group= param ─── */
  const groupName = new URLSearchParams(location.search).get('group');
  if (!groupName) {
    location.replace('ringraziamenti.html');
    return;
  }

  /* ─── Update page title / breadcrumb ─── */
  document.title = `${groupName} — Poteva Piovere`;
  setEl('group-title',    groupName.toUpperCase());
  setEl('breadcrumb-group', groupName.toUpperCase());

  /* ─── Fetch data ─── */
  let data;
  try {
    const res = await fetch('data/people.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    document.getElementById('cards-grid').insertAdjacentHTML('afterend',
      `<p class="group-error">Impossibile caricare i dati. (${err.message})</p>`
    );
    return;
  }

  /* ─── Filter people in this group ─── */
  const people = Object.entries(data)
    .filter(([k, v]) => !k.startsWith('_') && v.group === groupName);

  if (people.length === 0) {
    document.getElementById('cards-grid').insertAdjacentHTML('afterend',
      `<p class="group-error">Nessuna persona trovata per il gruppo "${escapeHtml(groupName)}".</p>`
    );
    return;
  }

  setEl('group-count', `${people.length} ${people.length === 1 ? 'persona' : 'persone'}`);

  /* ─── Render cards ─── */
  const grid     = document.getElementById('cards-grid');
  const fragment = document.createDocumentFragment();

  people.forEach(([key, person]) => {
    const displayName = deriveDisplayName(key);
    const firstImg    = `img/people/${person.image_files[0]}.jpg`;

    const card = document.createElement('article');
    card.className   = 'card';
    card.tabIndex    = 0;
    card.role        = 'button';
    card.dataset.key = key;
    card.setAttribute('aria-label', `Apri scheda di ${displayName}`);

    card.innerHTML = `
      <div class="card__img-wrap">
        <img
          class="card__img"
          src="${escapeHtml(firstImg)}"
          alt="${escapeHtml(displayName)}"
          loading="lazy"
        >
        <div class="card__img-placeholder" aria-hidden="true">
          ${personSvg()}
        </div>
      </div>
      <p class="card__name">${escapeHtml(displayName)}</p>
      <p class="card__quote">${escapeHtml(person.quote)}</p>
    `;

    /* Hide placeholder when image loads; show it on error */
    const img         = card.querySelector('.card__img');
    const placeholder = card.querySelector('.card__img-placeholder');
    img.addEventListener('load',  () => { placeholder.hidden = true;  });
    img.addEventListener('error', () => { img.hidden = true; placeholder.hidden = false; });

    card.addEventListener('click',   () => openModal(key, data));
    card.addEventListener('keydown',  e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(key, data); }
    });

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);


  /* =====================================================
     MODAL
     ===================================================== */

  const overlay  = document.getElementById('modal-overlay');
  const modal    = document.getElementById('modal');
  const closeBtn = document.getElementById('modal-close');
  const modalName = document.getElementById('modal-name');
  const modalText = document.getElementById('modal-text');

  let lastFocusedCard = null;
  let carouselState   = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function openModal(key, allData) {
    const person      = allData[key];
    const displayName = deriveDisplayName(key);

    lastFocusedCard = document.activeElement;

    /* Populate text */
    modalName.textContent = displayName;
    modalText.textContent = person.ackn_text;

    /* Build carousel */
    const imagePaths = person.image_files.map(f => `img/people/${f}.jpg`);
    carouselState = initCarousel(imagePaths);

    /* Open */
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('modal-overlay--open');
    document.body.style.overflow = 'hidden';

    /* Focus first element inside modal after paint */
    requestAnimationFrame(() => closeBtn.focus());
  }

  function closeModal() {
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('modal-overlay--open');
    document.body.style.overflow = '';
    carouselState = null;

    if (lastFocusedCard) {
      lastFocusedCard.focus();
      lastFocusedCard = null;
    }
  }

  closeBtn.addEventListener('click', closeModal);

  /* Click on overlay backdrop (not modal box) closes */
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  /* Keyboard navigation */
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('modal-overlay--open')) return;

    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    if (e.key === 'ArrowLeft'  && carouselState) { carouselState.prev(); return; }
    if (e.key === 'ArrowRight' && carouselState) { carouselState.next(); return; }

    /* Focus trap */
    if (e.key === 'Tab') {
      const focusable = Array.from(modal.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ));
      if (focusable.length === 0) { e.preventDefault(); return; }

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    }
  });


  /* =====================================================
     CAROUSEL
     ===================================================== */

  function initCarousel(images) {
    const track   = document.getElementById('carousel-track');
    const dotsEl  = document.getElementById('carousel-dots');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    let current = 0;
    const total = images.length;

    /* Build slides */
    track.innerHTML = '';
    dotsEl.innerHTML = '';

    if (reducedMotion) track.classList.add('carousel__track--no-motion');
    else               track.classList.remove('carousel__track--no-motion');

    images.forEach((src, i) => {
      /* Slide */
      const slide = document.createElement('div');
      slide.className = 'carousel__slide';

      const img = document.createElement('img');
      img.className = 'carousel__img';
      img.alt       = '';
      img.loading   = i === 0 ? 'eager' : 'lazy';
      img.src       = src;

      /* Hide broken images gracefully */
      img.addEventListener('error', () => { img.style.visibility = 'hidden'; });

      slide.appendChild(img);
      track.appendChild(slide);

      /* Dot */
      if (total > 1) {
        const dot = document.createElement('button');
        dot.className = `carousel__dot${i === 0 ? ' carousel__dot--active' : ''}`;
        dot.setAttribute('aria-label', `Foto ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(dot);
      }
    });

    /* Controls visibility */
    updateControls();

    function goTo(index) {
      current = Math.max(0, Math.min(index, total - 1));
      track.style.transform = `translateX(-${current * 100}%)`;
      updateControls();
    }

    function updateControls() {
      prevBtn.hidden = total <= 1 || current === 0;
      nextBtn.hidden = total <= 1 || current === total - 1;

      /* Sync dots */
      dotsEl.querySelectorAll('.carousel__dot').forEach((dot, i) => {
        dot.classList.toggle('carousel__dot--active', i === current);
      });
    }

    prevBtn.onclick = () => goTo(current - 1);
    nextBtn.onclick = () => goTo(current + 1);

    return {
      prev: () => goTo(current - 1),
      next: () => goTo(current + 1),
    };
  }


  /* =====================================================
     UTILITIES
     ===================================================== */

  /* "ivan_r" → "Ivan R."
     "maria_chiara_v" → "Maria Chiara V."
     All segments except last are name parts (capitalize each word).
     Last segment is the surname initial (uppercase + dot). */
  function deriveDisplayName(key) {
    const parts     = key.split('_');
    const initial   = parts[parts.length - 1].toUpperCase() + '.';
    const nameParts = parts.slice(0, -1).map(w => w.charAt(0).toUpperCase() + w.slice(1));
    return [...nameParts, initial].join(' ');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function setEl(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function personSvg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>`;
  }

})();
