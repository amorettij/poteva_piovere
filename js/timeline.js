/* =====================================================
   timeline.js — accordion timeline + closing carousel
   ===================================================== */

/* ── Landing page carousel ────────────────────────── */
(function () {
  const track    = document.getElementById('lc-track');
  const dotsEl   = document.getElementById('lc-dots');
  const viewport = track && track.parentElement;
  if (!track) return;

  const slides = Array.from(track.children);
  const total  = slides.length;
  let current  = 0;

  /* Dots */
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `lc__dot${i === 0 ? ' is-active' : ''}`;
    dot.setAttribute('aria-label', `Immagine ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(index) {
    current = ((index % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.querySelectorAll('.lc__dot').forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
    });
  }

  /* Touch swipe */
  let startX = 0;
  viewport.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });
  viewport.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
  });

  goTo(0);
})();

(async function () {
  let data;
  try {
    const res = await fetch('data/timeline.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('fetch failed');
    data = await res.json();
  } catch (e) {
    console.error('timeline.json load failed:', e);
    return;
  }

  /* ── Timeline accordion ───────────────────────────── */

  const list = document.getElementById('timeline-list');

  if (list && data.timeline?.entries) {
    data.timeline.entries.forEach(entry => {
      const item = document.createElement('div');
      item.className = 'timeline-item';

      const bodyId = `tl-body-${entry.id}`;

      /* Header button */
      const header = document.createElement('button');
      header.className = 'timeline-item__header';
      header.type = 'button';
      header.setAttribute('aria-expanded', 'false');
      header.setAttribute('aria-controls', bodyId);

      /* Round photo — set onerror before src to avoid race condition */
      const photo = document.createElement('img');
      photo.alt = '';
      photo.setAttribute('aria-hidden', 'true');
      photo.onerror = () => {
        const ph = document.createElement('div');
        ph.className = 'timeline-item__photo timeline-item__photo--placeholder';
        ph.setAttribute('aria-hidden', 'true');
        ph.textContent = String(entry.id).padStart(2, '0');
        photo.replaceWith(ph);
      };
      photo.className = 'timeline-item__photo';
      photo.src = entry.photo;

      /* Month label */
      const month = document.createElement('span');
      month.className = 'timeline-item__month';
      month.textContent = entry.month;

      /* Toggle icon */
      const toggle = document.createElement('span');
      toggle.className = 'timeline-item__toggle';
      toggle.setAttribute('aria-hidden', 'true');
      toggle.textContent = '+';

      header.append(photo, month, toggle);

      /* Collapsible body */
      const body = document.createElement('div');
      body.className = 'timeline-item__body';
      body.id = bodyId;

      const bodyInner = document.createElement('div');
      bodyInner.className = 'timeline-item__body-inner';

      const ul = document.createElement('ul');
      ul.className = 'timeline-item__events';

      entry.events.forEach(text => {
        const li = document.createElement('li');
        li.className = 'timeline-item__event';
        li.textContent = text;
        ul.appendChild(li);
      });

      bodyInner.appendChild(ul);
      body.appendChild(bodyInner);
      item.append(header, body);
      list.appendChild(item);

      header.addEventListener('click', () => {
        const open = item.classList.toggle('is-open');
        header.setAttribute('aria-expanded', String(open));
      });
    });
  }

  /* ── Closing section ──────────────────────────────── */

  const closing = data.closing;
  if (!closing) return;

  const labelEl = document.getElementById('lascia-label');
  if (labelEl) labelEl.textContent = closing.section_label;

  /* Carousel */
  const track   = document.getElementById('carousel-track');
  const dotsEl  = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const slides  = closing.slides || [];

  if (track) {
    if (slides.length === 0) {
      const ph = document.createElement('div');
      ph.className = 'carousel__slide';
      ph.innerHTML = '<div class="carousel__placeholder">Le immagini verranno caricate qui</div>';
      track.appendChild(ph);
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
      if (dotsEl)  dotsEl.hidden  = true;
    } else {
      let current = 0;

      slides.forEach((filename, i) => {
        const slide = document.createElement('div');
        slide.className = 'carousel__slide';
        const img = document.createElement('img');
        img.src = `img/homepage_slides/${filename}`;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        slide.appendChild(img);
        track.appendChild(slide);

        if (dotsEl) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = `carousel__dot${i === 0 ? ' is-active' : ''}`;
          dot.setAttribute('aria-label', `Immagine ${i + 1}`);
          dot.addEventListener('click', () => goTo(i));
          dotsEl.appendChild(dot);
        }
      });

      function goTo(index) {
        current = ((index % slides.length) + slides.length) % slides.length;
        track.style.transform = `translateX(-${current * 100}%)`;
        dotsEl.querySelectorAll('.carousel__dot').forEach((d, i) => {
          d.classList.toggle('is-active', i === current);
        });
      }

      if (prevBtn) prevBtn.addEventListener('click', () => { resetTimer(); goTo(current - 1); });
      if (nextBtn) nextBtn.addEventListener('click', () => { resetTimer(); goTo(current + 1); });

      /* Auto-scroll every 3 s, pause on hover/touch */
      let timer = setInterval(() => goTo(current + 1), 3000);

      function resetTimer() {
        clearInterval(timer);
        timer = setInterval(() => goTo(current + 1), 3000);
      }

      const carouselEl = track.closest('.lascia__carousel');
      if (carouselEl) {
        carouselEl.addEventListener('mouseenter', () => clearInterval(timer));
        carouselEl.addEventListener('mouseleave', () => resetTimer());
      }

      /* Touch swipe */
      let startX = 0;
      track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
      track.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) { resetTimer(); goTo(dx < 0 ? current + 1 : current - 1); }
      });

      goTo(0);
    }
  }

  /* Quote */
  const quoteBlock = document.getElementById('lascia-quote');
  const quoteText  = document.getElementById('lascia-quote-text');
  const quoteSrc   = document.getElementById('lascia-quote-source');

  if (quoteBlock && closing.quote) {
    if (closing.quote.text) {
      if (quoteText) quoteText.textContent = closing.quote.text;
      if (quoteSrc)  quoteSrc.textContent  = closing.quote.source || '';
    } else {
      quoteBlock.hidden = true;
    }
  }

})();
