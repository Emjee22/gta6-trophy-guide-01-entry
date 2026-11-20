// Leonida Trophy Guide — the tracker.
// Loads app/data/trophies.json, renders the checklist, and keeps progress in
// the browser (localStorage) with export and import. No network requests
// beyond the one local JSON file.

const DATA_URL = 'data/trophies.json';
const EARNED_KEY = 'leonida-trophy-guide-earned-v1';
const SPOILER_KEY = 'leonida-trophy-guide-spoiler-v1';

const listEl = document.getElementById('trophy-list');
const detailEl = document.getElementById('detail');
const progressText = document.getElementById('progress-text');
const progressPct = document.getElementById('progress-pct');
const progressFill = document.getElementById('progress-fill');
const searchEl = document.getElementById('search');
const spoilerEl = document.getElementById('chk-spoiler');

let trophies = [];
let earned = new Set();
let activeFilter = 'all';
let selectedId = null;

function loadEarned() {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    if (!raw) return;
    const ids = JSON.parse(raw);
    if (Array.isArray(ids)) earned = new Set(ids.filter((n) => Number.isInteger(n)));
  } catch (err) {
    earned = new Set();
  }
}

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function spoilerOn() {
  return spoilerEl.checked;
}

function isSpoilerHidden(t) {
  // The spoiler setting hides story trophies (and hidden ones) until earned.
  return spoilerOn() && !earned.has(t.id) && (t.kind === 'story' || t.hidden === true);
}

function gradeLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}

function matchesFilter(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q && !t.name.toLowerCase().includes(q)) return false;
  switch (activeFilter) {
    case 'all': return true;
    case 'story': return t.kind === 'story';
    case 'missable': return t.missable === true;
    case 'collectibles': return t.kind === 'collectibles';
    case 'activities': return t.kind === 'activities';
    case 'side': return t.kind === 'side';
    case 'crime': return t.kind === 'crime';
    case 'money': return t.kind === 'money';
    case 'hidden': return t.hidden === true;
    case 'earned': return earned.has(t.id);
    case 'not-earned': return !earned.has(t.id);
    default: return true;
  }
}

function tagHtml(t) {
  const tags = [`<span class="tag grade-${t.grade}">${t.grade}</span>`];
  if (t.hidden) tags.push('<span class="tag hidden">Hidden</span>');
  if (t.missable) tags.push('<span class="tag missable">Missable</span>');
  if (t.unconfirmed) tags.push('<span class="tag unconfirmed">Unconfirmed</span>');
  if (t.count) tags.push(`<span class="tag">×${t.count}</span>`);
  return tags.join('');
}

function renderList() {
  const shown = trophies.filter(matchesFilter);
  listEl.innerHTML = '';
  if (shown.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No trophies match this filter.';
    li.style.color = 'var(--muted)';
    listEl.appendChild(li);
    return;
  }
  for (const t of shown) {
    const li = document.createElement('li');
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'trophy-row' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '');
    row.dataset.id = String(t.id);

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
    box.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      saveEarned();
      renderAll();
    });

    const mid = document.createElement('span');
    if (isSpoilerHidden(t)) {
      const name = document.createElement('span');
      name.className = 'trophy-name';
      name.textContent = 'Hidden story trophy — earn it to reveal';
      const desc = document.createElement('span');
      desc.className = 'trophy-desc';
      desc.textContent = 'Name and description hidden by the spoiler setting.';
      mid.append(name, desc);
    } else {
      const name = document.createElement('span');
      name.className = 'trophy-name';
      name.textContent = t.name;
      const desc = document.createElement('span');
      desc.className = 'trophy-desc';
      desc.textContent = t.description;
      mid.append(name, desc);
    }
    const tags = document.createElement('span');
    tags.className = 'trophy-tags';
    tags.innerHTML = tagHtml(t);
    mid.appendChild(tags);

    const grade = document.createElement('span');
    grade.className = 'grade-dot';
    grade.textContent = gradeLabel(t);

    row.append(box, mid, grade);
    row.addEventListener('click', () => {
      selectedId = t.id;
      renderAll();
      syncUrl();
      // On narrow screens the detail panel sits below the list; bring it
      // into view so the guide is visible right after tapping a row.
      if (window.innerWidth < 900) {
        detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    li.appendChild(row);
    listEl.appendChild(li);
  }
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    detailEl.innerHTML = '<p class="detail-empty">Pick a trophy on the left to read its guide and sources.</p>';
    return;
  }
  detailEl.innerHTML = '';
  const title = document.createElement('h2');
  title.textContent = isSpoilerHidden(t) ? 'Hidden story trophy' : t.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = isSpoilerHidden(t)
    ? 'Official name and description hidden by the spoiler setting.'
    : t.description + ' — ' + gradeLabel(t) + ' trophy.';
  const flags = document.createElement('div');
  flags.className = 'flag-row';
  flags.innerHTML = tagHtml(t);

  const guideHead = document.createElement('h4');
  guideHead.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = t.guide;

  const srcHead = document.createElement('h4');
  srcHead.textContent = 'Sources';
  const srcList = document.createElement('ul');
  srcList.className = 'src-list';
  for (const s of t.sources) {
    const li = document.createElement('li');
    li.textContent = s;
    srcList.appendChild(li);
  }

  detailEl.append(title, official, flags, guideHead, guide, srcHead, srcList);
  if (t.missable) {
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.textContent = 'Missable: do the Chapter 1 balcony meditation with Lucia before Chapter 1 ends. See the Missables tab.';
    detailEl.appendChild(warn);
  }
  if (t.unconfirmed) {
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.textContent = 'Unconfirmed: no source has verified the method for this trophy yet. This guide does not guess one.';
    detailEl.appendChild(warn);
  }
}

function renderProgress() {
  const n = earned.size;
  const total = trophies.length || 55;
  const pct = Math.round((n / total) * 100);
  progressText.textContent = n + ' / ' + total + ' earned';
  progressPct.textContent = pct + '%';
  progressFill.style.width = pct + '%';
  document.title = n > 0
    ? 'Leonida Trophy Guide — ' + n + '/' + total + ' earned'
    : 'Leonida Trophy Guide — GTA 6, all 55 PS5 trophies';
}

function renderAll() {
  renderList();
  renderDetail();
  renderProgress();
}

function setView(view) {
  document.querySelectorAll('.tab').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === view);
  });
  document.querySelectorAll('.view').forEach((s) => {
    s.classList.toggle('active', s.id === 'view-' + view);
  });
  syncUrl();
}

function setFilter(f) {
  activeFilter = f;
  document.querySelectorAll('.pill').forEach((b) => {
    b.classList.toggle('active', b.dataset.filter === f);
  });
  renderAll();
}

function syncUrl() {
  const view = document.querySelector('.tab.active')?.dataset.view || 'checklist';
  const params = new URLSearchParams();
  params.set('view', view);
  if (selectedId !== null) params.set('trophy', String(selectedId));
  history.replaceState(null, '', '?' + params.toString());
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error('bad file');
      earned = new Set(ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
      saveEarned();
      renderAll();
    } catch (err) {
      alert('That file is not a progress export from this guide.');
    }
  };
  reader.readAsText(file);
}

async function init() {
  loadEarned();
  try {
    spoilerEl.checked = localStorage.getItem(SPOILER_KEY) !== 'off';
  } catch (err) {
    spoilerEl.checked = true;
  }
  spoilerEl.addEventListener('change', () => {
    localStorage.setItem(SPOILER_KEY, spoilerEl.checked ? 'on' : 'off');
    renderAll();
  });

  document.querySelectorAll('.tab').forEach((b) => {
    b.addEventListener('click', () => setView(b.dataset.view));
  });
  document.querySelectorAll('.pill').forEach((b) => {
    b.addEventListener('click', () => setFilter(b.dataset.filter));
  });
  searchEl.addEventListener('input', renderAll);
  document.getElementById('btn-export').addEventListener('click', exportProgress);
  document.getElementById('btn-import').addEventListener('click', () => {
    document.getElementById('file-import').click();
  });
  document.getElementById('file-import').addEventListener('change', (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (file) importProgress(file);
    ev.target.value = '';
  });

  const res = await fetch(DATA_URL);
  const data = await res.json();
  trophies = data.trophies || data;

  const params = new URLSearchParams(location.search);
  const view = params.get('view');
  if (view && document.getElementById('view-' + view)) setView(view);
  const trophyParam = Number(params.get('trophy'));
  if (Number.isInteger(trophyParam) && trophies.some((t) => t.id === trophyParam)) {
    selectedId = trophyParam;
  }
  renderAll();
}

init();
