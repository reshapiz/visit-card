const state = {
  activeTab: 'home',
  viewStack: [],
  sheet: null,
  modal: null,
  wavedIds: new Set(),
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function distanceLabel(meters) {
  if (meters < 1000) return meters + ' m';
  return (meters / 1000).toFixed(1) + ' km';
}

function hashToUnit(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
}

function applyTheme() {
  const pref = NEARBY_DATA.settings.appearance;
  const resolved = pref === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : pref;
  document.body.setAttribute('data-theme', resolved);
}

function renderTabbar() {
  const tabbar = document.getElementById('tabbar');
  tabbar.querySelector('[data-tab="home"]').innerHTML = icon('home', 22) + 'Home';
  tabbar.querySelector('[data-tab="radar"]').innerHTML = icon('radar', 22) + 'Radar';
  tabbar.querySelector('[data-tab="circle"]').innerHTML = icon('users', 22) + 'Circle';
  tabbar.querySelector('[data-tab="profile"]').innerHTML = icon('user', 22) + 'Profile';
}

function bindTabbar() {
  document.querySelectorAll('.tab[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(name) {
  popAllViews();
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.dataset.screen === name));
  document.querySelectorAll('.tab[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  state.activeTab = name;
}

function pushView(name, html) {
  const el = document.createElement('div');
  el.className = 'pushview';
  el.dataset.view = name;
  el.innerHTML = html;
  document.getElementById('overlayRoot').appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('open')));
  state.viewStack.push(el);
  return el;
}

function popView() {
  const el = state.viewStack.pop();
  if (!el) return;
  el.classList.remove('open');
  setTimeout(() => el.remove(), 340);
}

function popAllViews() {
  while (state.viewStack.length) popView();
}

function showToast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2400);
}

function openSheet(html) {
  closeSheet();
  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.innerHTML = '<div class="sheet-handle"></div>' + html;
  backdrop.appendChild(sheet);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeSheet(); });
  document.getElementById('overlayRoot').appendChild(backdrop);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    backdrop.classList.add('open');
    sheet.classList.add('open');
  }));
  state.sheet = backdrop;
  return sheet;
}

function closeSheet() {
  const backdrop = state.sheet;
  if (!backdrop) return;
  backdrop.classList.remove('open');
  const sheet = backdrop.querySelector('.sheet');
  if (sheet) sheet.classList.remove('open');
  setTimeout(() => backdrop.remove(), 260);
  state.sheet = null;
}

function openModal(html) {
  closeModal();
  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  const wrap = document.createElement('div');
  wrap.className = 'modal-wrap';
  wrap.innerHTML = '<div class="modal">' + html + '</div>';
  backdrop.appendChild(wrap);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
  document.getElementById('overlayRoot').appendChild(backdrop);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    backdrop.classList.add('open');
    wrap.querySelector('.modal').classList.add('open');
  }));
  state.modal = backdrop;
  return wrap;
}

function closeModal() {
  const backdrop = state.modal;
  if (!backdrop) return;
  backdrop.classList.remove('open');
  const modal = backdrop.querySelector('.modal');
  if (modal) modal.classList.remove('open');
  setTimeout(() => backdrop.remove(), 220);
  state.modal = null;
}

function openOptionSheet(opts) {
  const rows = opts.options.map((opt) => (
    '<button class="option-row' + (opt.value === opts.selected ? ' selected' : '') + '" data-value="' + opt.value + '">' +
      '<span class="option-text"><span class="option-label">' + opt.label + '</span>' +
      (opt.hint ? '<span class="option-hint">' + opt.hint + '</span>' : '') +
      '</span><span class="option-check">' + icon('check', 18) + '</span>' +
    '</button>'
  )).join('');
  const sheet = openSheet(
    '<div class="sheet-head"><h3>' + opts.title + '</h3></div>' +
    '<div class="sheet-body">' + rows + '</div>'
  );
  sheet.querySelectorAll('.option-row').forEach((row) => {
    row.addEventListener('click', () => {
      opts.onSelect(row.dataset.value);
      closeSheet();
    });
  });
}

function openConfirmModal(opts) {
  const wrap = openModal(
    '<h3>' + opts.title + '</h3><p>' + opts.message + '</p>' +
    '<div class="modal-actions">' +
      '<button class="btn ' + (opts.destructive ? 'btn-accent' : 'btn-primary') + ' btn-block" id="confirmYesBtn">' + (opts.confirmLabel || 'Confirm') + '</button>' +
      '<button class="btn btn-ghost btn-block" id="confirmNoBtn">' + (opts.cancelLabel || 'Cancel') + '</button>' +
    '</div>'
  );
  wrap.querySelector('#confirmYesBtn').addEventListener('click', () => {
    closeModal();
    if (opts.onConfirm) opts.onConfirm();
  });
  wrap.querySelector('#confirmNoBtn').addEventListener('click', closeModal);
}

function bindToggle(id, onToggle) {
  const btn = document.getElementById(id);
  btn.addEventListener('click', () => {
    const next = !btn.classList.contains('on');
    btn.classList.toggle('on', next);
    btn.setAttribute('aria-checked', String(next));
    onToggle(next);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (NEARBY_DATA.settings.appearance === 'system') applyTheme();
  });
  renderTabbar();
  bindTabbar();
  HomeScreen.init();
  RadarScreen.init();
  CircleScreen.init();
  ProfileScreen.init();
});
