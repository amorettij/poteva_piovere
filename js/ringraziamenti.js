/* =====================================================
   ringraziamenti.js — builds the group list from people.json
   ===================================================== */

(async function () {

  const listEl = document.getElementById('groups-list');

  /* ─── Fetch data ─── */
  let data;
  try {
    const res = await fetch('data/people.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    listEl.insertAdjacentHTML('afterend',
      `<p class="ringraziamenti-error">Impossibile caricare i dati. (${err.message})</p>`
    );
    return;
  }

  /* ─── Derive groups ─── */
  const groupOrder = data._meta?.group_order ?? [];
  const people     = Object.entries(data).filter(([k]) => !k.startsWith('_'));

  /* Count members per group */
  const counts = {};
  people.forEach(([, person]) => {
    counts[person.group] = (counts[person.group] ?? 0) + 1;
  });

  /* Union of ordered groups + any extra groups not in group_order */
  const allGroups = [
    ...groupOrder.filter(g => counts[g]),
    ...Object.keys(counts).filter(g => !groupOrder.includes(g)),
  ];

  /* ─── Render ─── */
  const fragment = document.createDocumentFragment();

  allGroups.forEach(group => {
    const count = counts[group] ?? 0;
    const href  = `group.html?group=${encodeURIComponent(group)}`;

    const li = document.createElement('li');
    li.className = 'groups-list__item';

    li.innerHTML = `
      <a href="${href}" class="groups-list__link">
        <span class="groups-list__name">${escapeHtml(group)}</span>
        <span class="groups-list__right">
          <span class="groups-list__count">${count} ${count === 1 ? 'persona' : 'persone'}</span>
          <span class="groups-list__arrow" aria-hidden="true">→</span>
        </span>
      </a>
    `;

    fragment.appendChild(li);
  });

  listEl.appendChild(fragment);


  /* ─── Utility ─── */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

})();
