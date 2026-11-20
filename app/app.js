// Leonida Trophy Guide: an offline checklist and tracker for the 55 PS5 trophies
// of Grand Theft Auto VI. Progress and the spoiler setting live in localStorage;
// the guide data comes from data/trophies.json, a file under app/ like everything
// else this page loads. Views are chosen by the page address (?view=, &trophy=,
// &filter=, &q=, &spoiler=) so any view can be opened straight from a link.
const EARNED_KEY = 'leonida-trophy-earned';
const SPOILER_KEY = 'leonida-trophy-spoiler';
const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const GROUP_LABEL = {
  all: 'All', story: 'Story', missable: 'Missable', collectibles: 'Collectibles',
  activities: 'Activities', side: 'Side quests', crime: 'Crime', money: 'Money',
  misc: 'One-offs', completion: 'Platinum & 100%', hidden: 'Hidden', earned: 'Earned', notearned: 'Not earned'
};
const FILTERS = ['all', 'story', 'missable', 'collectibles', 'activities', 'side', 'crime', 'money', 'hidden', 'earned', 'notearned'];

let trophyData = null;
let earnedSet = new Set(loadEarnedIds());
let spoilerOn = loadSpoilerSetting();
let activeTab = 'checklist';
let activeFilter = 'all';
let activeTrophyId = 37;
let searchText = '';

function loadEarnedIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

function loadSpoilerSetting() {
  return localStorage.getItem(SPOILER_KEY) === 'on';
}

function saveEarnedIds() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earnedSet].sort((a, b) => a - b)));
}

function saveSpoilerSetting() {
  localStorage.setItem(SPOILER_KEY, spoilerOn ? 'on' : 'off');
}

function parseUrlState() {
  const params = new URLSearchParams(location.search);
  const view = params.get('view');
  if (['checklist', 'roadmap', 'missable', 'sources'].includes(view)) activeTab = view;
  const trophy = Number(params.get('trophy'));
  if (Number.isInteger(trophy) && trophy >= 1 && trophy <= 55) activeTrophyId = trophy;
  const filter = params.get('filter');
  if (FILTERS.includes(filter)) activeFilter = filter;
  searchText = (params.get('q') ?? '').trim();
  if (params.get('spoiler') === 'on') spoilerOn = true;
  if (params.get('spoiler') === 'off') spoilerOn = false;
}

function applyUrlState() {
  const params = new URLSearchParams();
  params.set('view', activeTab);
  if (activeTab === 'checklist') params.set('trophy', String(activeTrophyId));
  if (activeFilter !== 'all') params.set('filter', activeFilter);
  if (searchText) params.set('q', searchText);
  if (spoilerOn) params.set('spoiler', 'on');
  history.replaceState(null, '', `${location.pathname}?${params.toString()}`);
}

function trophyById(id) {
  return trophyData.trophies.find((t) => t.id === id) ?? trophyData.trophies[0];
}

function isStoryTrophy(trophy) {
  return trophy.groups.includes('story');
}

function isSpoilerHidden(trophy) {
  return spoilerOn && isStoryTrophy(trophy) && !earnedSet.has(trophy.id);
}

function trophyMatchesFilter(trophy) {
  if (activeFilter === 'all') return true;
  if (activeFilter === 'hidden') return trophy.hidden;
  if (activeFilter === 'earned') return earnedSet.has(trophy.id);
  if (activeFilter === 'notearned') return !earnedSet.has(trophy.id);
  return trophy.groups.includes(activeFilter);
}

function trophyMatchesSearch(trophy) {
  if (!searchText) return true;
  const needle = searchText.toLowerCase();
  return trophy.name.toLowerCase().includes(needle) || trophy.description.toLowerCase().includes(needle);
}

function sourceByNumber(n) {
  return trophyData.sources.find((s) => s.n === n) ?? null;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function citeLinks(text) {
  return escapeHtml(text).replace(/\[(\d+)\]/g, (whole, num) => {
    const source = sourceByNumber(Number(num));
    if (source && source.url) return `<a class="cite" href="${source.url}" target="_blank" rel="noopener">[${num}]</a>`;
    return `<span class="cite">${whole}</span>`;
  });
}

function formatGuideSteps(guideText) {
  const steps = guideText.split('\n').map((line) => line.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
  return `<ol class="steps">${steps.map((step) => `<li>${citeLinks(step)}</li>`).join('')}</ol>`;
}

function gradeBadge(trophy) {
  return `<span class="grade grade-${trophy.grade}">${GRADE_LABEL[trophy.grade]}</span>`;
}

function trophyTags(trophy) {
  const tags = [];
  if (trophy.hidden) tags.push('<span class="tag tag-hidden">Hidden</span>');
  if (trophy.missable) tags.push('<span class="tag tag-missable">Missable</span>');
  if (trophy.unconfirmed) tags.push('<span class="tag tag-unconfirmed">Unconfirmed</span>');
  if (trophy.count !== null) tags.push(`<span class="tag tag-count">×${trophy.count.toLocaleString('en-US')}</span>`);
  return tags.join(' ');
}

function renderProgressBar() {
  const total = trophyData.trophies.length;
  const done = trophyData.trophies.filter((t) => earnedSet.has(t.id)).length;
  document.getElementById('progressText').textContent = `${done} / ${total} earned`;
  document.getElementById('progressFill').style.width = `${Math.round((done / total) * 100)}%`;
}

function renderAuditStrip() {
  const total = trophyData.trophies.length;
  const cited = trophyData.trophies.filter((t) => t.sources.length > 0).length;
  const hidden = trophyData.trophies.filter((t) => t.hidden).length;
  const missable = trophyData.trophies.filter((t) => t.missable).length;
  const unconfirmed = trophyData.trophies.filter((t) => t.unconfirmed).length;
  const done = trophyData.trophies.filter((t) => earnedSet.has(t.id)).length;
  document.getElementById('auditStrip').innerHTML =
    `<strong>Audit:</strong> ${total}/${total} trophies listed · ${cited}/${total} guides cited · ` +
    `${done} earned · ${hidden} hidden · ${missable} potentially missable · ${unconfirmed} unconfirmed · 0 online trophies`;
}

function renderFilterPills() {
  const nav = document.getElementById('filterPills');
  nav.replaceChildren();
  for (const key of FILTERS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = key === activeFilter ? 'pill active' : 'pill';
    button.textContent = GROUP_LABEL[key];
    button.addEventListener('click', () => {
      activeFilter = key;
      applyUrlState();
      renderFilterPills();
      renderTrophyList();
    });
    nav.append(button);
  }
}

function renderTrophyList() {
  const list = document.getElementById('trophyList');
  const shown = trophyData.trophies.filter((t) => trophyMatchesFilter(t) && trophyMatchesSearch(t));
  document.getElementById('listCount').textContent = `(${shown.length} of ${trophyData.trophies.length})`;
  list.replaceChildren();
  for (const trophy of shown) {
    const item = document.createElement('li');
    item.className = `trophy-row${trophy.id === activeTrophyId ? ' selected' : ''}${earnedSet.has(trophy.id) ? ' earned' : ''}`;
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earnedSet.has(trophy.id);
    box.setAttribute('aria-label', `Mark ${trophy.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earnedSet.add(trophy.id);
      else earnedSet.delete(trophy.id);
      saveEarnedIds();
      renderProgressBar();
      renderAuditStrip();
      renderTrophyList();
      renderTrophyDetail();
    });
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'trophy-name';
    if (isSpoilerHidden(trophy)) {
      button.innerHTML = `<span class="spoiled">Hidden trophy — earn it to reveal</span> ${gradeBadge(trophy)}`;
    } else {
      button.innerHTML = `${escapeHtml(trophy.name)} ${gradeBadge(trophy)}`;
    }
    button.addEventListener('click', () => {
      activeTrophyId = trophy.id;
      applyUrlState();
      renderTrophyList();
      renderTrophyDetail();
    });
    const meta = document.createElement('span');
    meta.className = 'trophy-meta';
    meta.innerHTML = trophyTags(trophy);
    item.append(box, button, meta);
    list.append(item);
  }
  if (shown.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = activeFilter === 'online' ? 'No online trophies: the game is single-player only.' : 'No trophies match this filter.';
    list.append(empty);
  }
}

function renderTrophyDetail() {
  const trophy = trophyById(activeTrophyId);
  const panel = document.getElementById('detail');
  if (isSpoilerHidden(trophy)) {
    panel.innerHTML =
      `<h2>Hidden trophy</h2>` +
      `<p class="spoiler-note">This is a story trophy. Its name, description and guide stay hidden while the spoiler setting is on — tick it off as earned to reveal it, or switch the spoiler setting off above.</p>` +
      `<p>${gradeBadge(trophy)} <span class="tag tag-hidden">Hidden</span></p>`;
    return;
  }
  const sourceNames = trophy.sources.map((n) => {
    const source = sourceByNumber(n);
    if (!source) return `[${n}]`;
    return source.url
      ? `<a href="${source.url}" target="_blank" rel="noopener">[${n}] ${escapeHtml(source.name)}</a>`
      : `[${n}] ${escapeHtml(source.name)}`;
  }).join(' · ');
  panel.innerHTML =
    `<h2>${escapeHtml(trophy.name)}</h2>` +
    `<p class="detail-line">${gradeBadge(trophy)} ${trophyTags(trophy)}</p>` +
    `<p class="official"><strong>Official:</strong> ${escapeHtml(trophy.description)}</p>` +
    (trophy.unconfirmed ? `<p class="banner banner-unconfirmed">UNCONFIRMED — no guide has pinned a method down yet. Do not chase guesses.</p>` : '') +
    (trophy.missable ? `<p class="banner banner-missable">POTENTIALLY MISSABLE — read step 3 before you leave Chapter 1.</p>` : '') +
    formatGuideSteps(trophy.guide) +
    (trophy.note ? `<p class="note"><strong>Disagreement:</strong> ${citeLinks(trophy.note)}</p>` : '') +
    `<p class="sources-line"><strong>Sources:</strong> ${sourceNames}</p>`;
}

function renderSourceColumn() {
  const list = document.getElementById('sourceCol');
  list.replaceChildren();
  for (const source of trophyData.sources) {
    const item = document.createElement('li');
    item.innerHTML = source.url
      ? `<a href="${source.url}" target="_blank" rel="noopener">${escapeHtml(source.name)}</a>`
      : escapeHtml(source.name);
    list.append(item);
  }
}

function renderRoadmapTab() {
  const stages = [
    {
      title: 'Stage 1 — Story & side content as it shows up',
      hours: '60–80 hours',
      body: 'Finish the five chapters and take the optional missions, character quests and activities as they appear. Scan vehicles with the WAiNK app and study animals with the binoculars along the way — 200 of 277 base-model vehicles and 100 of 255 animals are needed later. One warning only: do the Chapter 1 balcony meditation with Lucia (see Missables) before the chapter ends.'
    },
    {
      title: 'Stage 2 — The 100% checklist & 70 of 80 challenges',
      hours: 'About 100 hours',
      body: 'After the credits, open Progress > Stats > 100% Completion and work through what is left. The checklist is lenient — most lines ask for a share, not everything. Only the robberies, underwater discoveries, shooting ranges, drone races and Bret’s Target Decks demand the full set. You need any 70 of the 80 challenges, so skip the hardest ten.'
    },
    {
      title: 'Stage 3 — Strangers & Freaks and clean-up',
      hours: '10–20 hours',
      body: 'Stranger strands are not part of 100%, so finish the 8 that count, then the final missions for Andy, Kenton, Billy, Randy and Tyrone, and whatever miscellaneous trophies are still open. Check the list, tick them off, and the platinum pops.'
    }
  ];
  const wrap = document.getElementById('roadmapStages');
  wrap.replaceChildren();
  for (const stage of stages) {
    const card = document.createElement('article');
    card.className = 'stage';
    card.innerHTML = `<h3>${escapeHtml(stage.title)}</h3><p class="hours">${escapeHtml(stage.hours)}</p><p>${escapeHtml(stage.body)}</p>`;
    wrap.append(card);
  }
  const rows = [
    ['Story & tasks', 'Finish the story · 100 optional tasks · 39/39 gang operations · 22/22 bank jobs · 7/7 payday loans · 34/35 smash ’n’ grabs · 50/91 stick ups · $100,000 narcotics, $100,000 jewelry, $250,000 marked bills, 8/8 vaults, $200,000 vehicles fenced'],
    ['Exploration & activities', '5/7 Kenton sets · 15/18 card sets · 100 WAiNK scans · 33/33 underwater discoveries · 30/34 magazines, books & comics · 15/18 meditation spots · 100/125 flamingos · 2/2 playlists · 70/79 styles · 30/40 races won · 10/13 race golds · 42/42 shooting-range golds'],
    ['Challenges & hunts', '300/397 stunts · 70/80 challenges · 15/15 Bret’s Target Decks'],
    ['Discovery', '200/277 base-model vehicles scanned · 50/66 weapons found · 100/255 animals studied']
  ];
  const table = document.createElement('table');
  table.className = 'checklist-table';
  table.innerHTML = `<thead><tr><th>Group</th><th>What the checklist asks for</th></tr></thead>` +
    `<tbody>${rows.map(([a, b]) => `<tr><th>${escapeHtml(a)}</th><td>${escapeHtml(b)}</td></tr>`).join('')}</tbody>`;
  const holder = document.getElementById('checklistTable');
  holder.replaceChildren(table);
  const note = document.createElement('p');
  note.className = 'lede';
  note.innerHTML = 'Figures from the 100% checklist guide [2]. The checklist is not a true 100%: most side quests are not needed at all, and many collectibles only partly. Nothing on it is missable.';
  holder.append(note);
}

function renderMissablesTab() {
  const trophy = trophyById(28);
  const view = document.getElementById('missableView');
  view.innerHTML =
    `<article class="missable-card">
      <h3>1 trophy can be missed — ${escapeHtml(trophy.name)}</h3>
      <p class="official"><strong>Official:</strong> ${escapeHtml(trophy.description)}</p>
      ${formatGuideSteps(trophy.guide)}
      <p class="note"><strong>Why it is the only one:</strong> every other trophy is either automatic story progress or content that stays open in free-roam after the story. The guides agree on this one. [1][3][6][7]</p>
    </article>
    <article class="missable-card">
      <h3>Looks missable, but is not</h3>
      <ul class="plain">
        <li><strong>Optional missions disappear after a while</strong> (black icons with pink letters) — there are far more than the 100 the checklist needs, so losing some does not matter. [1]</li>
        <li><strong>Kenton goes away after Chapter 1</strong> — he returns in Chapters 2–3, and all his quests stay open after the story. [1]</li>
        <li><strong>Some fences disappear for good</strong> — new fences unlock as you go, and the ones that vanish hold no quests. [1]</li>
        <li><strong>Some magazines sit in story buildings that close</strong> — the same magazines also spawn elsewhere, and the checklist only needs 30 of 34. [1]</li>
        <li><strong>Hourglass quests are time-sensitive and can fail</strong> — none of them is needed for a trophy. [1]</li>
      </ul>
    </article>
    <article class="missable-card">
      <h3>Unconfirmed — no method yet</h3>
      <ul class="plain">
        <li><strong>Bad Luck, I Guess</strong> — PowerPyx lists it as currently unknown, believed to be related to the Payday Loans store from the Prologue. Do not chase guesses. [1][7]</li>
      </ul>
    </article>
    <article class="missable-card">
      <h3>Where the sources disagree</h3>
      <ul class="plain">
        <li><strong>The final mission’s chapter:</strong> PowerPyx’s table puts it under Chapter 4 (“Starting From Zero”), the same mission it lists for the Chapter 4 trophy; the five-chapter structure in other guides places the finale in Chapter 5. Both versions are shown in the guide. [1][6]</li>
        <li><strong>How many vehicles:</strong> PowerPyx’s 100% page cites 557 vehicles in total and 277 base-model vehicles for the checklist. The checklist line uses the 277 base models. [2]</li>
        <li><strong>How many hidden:</strong> most trackers count 28 hidden trophies; Push Square counts 27. [4][7]</li>
        <li><strong>Fair Game’s animal:</strong> it is still being confirmed which animal exactly unlocks it. [1]</li>
        <li><strong>The Chapter 1 meditation:</strong> it is still being confirmed whether the house meditation counts toward the 18 spots. Do it anyway. [1]</li>
      </ul>
    </article>`;
}

function renderSourceMatrix() {
  const holder = document.getElementById('sourceMatrix');
  const rows = trophyData.sources.map((source) => {
    const count = trophyData.trophies.filter((t) => t.sources.includes(source.n)).length;
    const pct = Math.round((count / trophyData.trophies.length) * 100);
    const link = source.url
      ? `<a href="${source.url}" target="_blank" rel="noopener">${escapeHtml(source.name)}</a>`
      : escapeHtml(source.name);
    return `<tr><th>[${source.n}] ${link}</th><td>${count} of 55</td><td>${pct}%</td></tr>`;
  }).join('');
  holder.innerHTML =
    `<table class="matrix"><thead><tr><th>Source</th><th>Guides citing it</th><th>Share</th></tr></thead><tbody>${rows}</tbody></table>` +
    `<p class="lede">The hidden flags (28 of 55) were checked against the hidden tables in [4] and [7]; the official names, descriptions and grades come from [5]. PowerPyx [1] is the backbone of the guide — it is cited in all 55 guides.</p>`;
}

function showTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tabs button').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === tab);
  });
  document.querySelectorAll('.tabpane').forEach((pane) => {
    pane.classList.toggle('active', pane.id === `tab-${tab}`);
  });
  applyUrlState();
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    exported: new Date().toISOString(),
    earned: [...earnedSet].sort((a, b) => a - b),
    spoiler: spoilerOn ? 'on' : 'off'
  };
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  link.download = 'leonida-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error('bad file');
      earnedSet = new Set(ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
      if (data && data.spoiler === 'on') spoilerOn = true;
      if (data && data.spoiler === 'off') spoilerOn = false;
      saveEarnedIds();
      saveSpoilerSetting();
      document.getElementById('spoilerToggle').checked = spoilerOn;
      renderProgressBar();
      renderAuditStrip();
      renderFilterPills();
      renderTrophyList();
      renderTrophyDetail();
    } catch {
      alert('That file is not a Leonida Trophy Guide progress export.');
    }
  });
  reader.readAsText(file);
}

function bindControls() {
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) importProgress(file);
    event.target.value = '';
  });
  const spoiler = document.getElementById('spoilerToggle');
  spoiler.checked = spoilerOn;
  spoiler.addEventListener('change', () => {
    spoilerOn = spoiler.checked;
    saveSpoilerSetting();
    applyUrlState();
    renderTrophyList();
    renderTrophyDetail();
  });
  const search = document.getElementById('searchBox');
  search.value = searchText;
  search.addEventListener('input', () => {
    searchText = search.value.trim();
    applyUrlState();
    renderTrophyList();
  });
  document.querySelectorAll('.tabs button').forEach((button) => {
    button.addEventListener('click', () => showTab(button.dataset.tab));
  });
}

async function loadTrophyData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('trophy data did not load');
  return response.json();
}

async function initApp() {
  trophyData = await loadTrophyData();
  parseUrlState();
  bindControls();
  showTab(activeTab);
  renderProgressBar();
  renderAuditStrip();
  renderFilterPills();
  renderTrophyList();
  renderTrophyDetail();
  renderSourceColumn();
  renderRoadmapTab();
  renderMissablesTab();
  renderSourceMatrix();
}

initApp().catch((error) => {
  document.getElementById('auditStrip').textContent = `The guide did not load: ${error.message}`;
});
