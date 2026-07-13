/* =====================================================
   ringraziamenti.js — builds the group list from people.json v2
   ===================================================== */

(async function () {

  const listEl = document.getElementById('groups-list');

  let data;
  try {
    const res = await fetch('data/people.json?v=47');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error('[ringraziamenti] fetch error:', err);
    listEl.insertAdjacentHTML('afterend',
      `<p class="ringraziamenti-error">Impossibile caricare i dati. (${err.message})</p>`
    );
    return;
  }

  if (!data.groups) {
    console.error('[ringraziamenti] people.json caricato ma manca il campo groups:', Object.keys(data));
    listEl.insertAdjacentHTML('afterend',
      `<p class="ringraziamenti-error">Struttura dati non aggiornata — svuota la cache e ricarica.</p>`
    );
    return;
  }

  console.log('[ringraziamenti] gruppi trovati:', data.groups.map(g => g.label));

  function groupLabel(group) {
    const lang = (window.PP && window.PP.getLang) ? window.PP.getLang() : 'it';
    return (lang === 'en' && group.label_en) ? group.label_en : group.label;
  }

  function personCount(count) {
    if (!count) return '';
    const lang = (window.PP && window.PP.getLang) ? window.PP.getLang() : 'it';
    if (lang === 'en') return `${count} ${count === 1 ? 'person' : 'people'}`;
    return `${count} ${count === 1 ? 'persona' : 'persone'}`;
  }

  function renderList() {
    listEl.innerHTML = '';
    const fragment = document.createDocumentFragment();

    data.groups.forEach(group => {
      const count = countMembers(group);
      const href  = `group.html?group=${encodeURIComponent(group.id)}`;

      const li = document.createElement('li');
      li.className = 'groups-list__item';
      li.innerHTML = `
        <a href="${href}" class="groups-list__link">
          <span class="groups-list__name">${escapeHtml(groupLabel(group))}</span>
          <span class="groups-list__right">
            ${count ? `<span class="groups-list__count">${personCount(count)}</span>` : ''}
            <span class="groups-list__arrow" aria-hidden="true">→</span>
          </span>
        </a>
      `;
      fragment.appendChild(li);
    });

    listEl.appendChild(fragment);
  }

  renderList();

  document.addEventListener('pp:langchange', renderList);

  /* Count all leaf members recursively */
  function countMembers(node) {
    let count = 0;
    if (node.members)   count += node.members.length;
    if (node.subgroups) count += node.subgroups.reduce((s, sg) => s + countMembers(sg), 0);
    return count;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

})();
