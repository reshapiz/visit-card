function categoryLabel(type) {
  const found = NEARBY_DATA.categories.find((c) => c.value === type);
  return found ? found.label : type;
}

function radiusLabel(km) {
  const found = NEARBY_DATA.radiusOptions.find((r) => r.value === km);
  return found ? found.label : km + ' km';
}

function avatarStackHTML(count) {
  const grads = ['g-sunset', 'g-forest', 'g-rose', 'g-warm'];
  const n = Math.min(count, 4);
  let out = '';
  for (let i = 0; i < n; i++) {
    out += '<span class="avatar ' + grads[i % grads.length] + '" style="width:22px;height:22px;"></span>';
  }
  return out;
}

function personCardHTML(p) {
  const isSupport = p.tag === 'support';
  return '<button class="feed-card" data-kind="person" data-id="' + p.id + '">' +
    '<span class="avatar feed-avatar ' + p.gradient + '"><span class="presence-dot" data-state="online"></span></span>' +
    '<span class="feed-card-body">' +
      '<span class="feed-card-top"><span class="feed-card-name">' + p.name + '</span><span class="feed-card-distance">' + distanceLabel(p.distanceM) + '</span></span>' +
      '<span class="feed-card-status">' + escapeHtml(p.status) + '</span>' +
      '<span class="feed-card-meta"><span class="tag-pill' + (isSupport ? ' tag-support' : '') + '">' + (isSupport ? categoryLabel('support') : categoryLabel('person')) + '</span>' +
        '<span class="feed-card-time">' + p.since + '</span></span>' +
    '</span>' +
  '</button>';
}

function happeningCardHTML(h) {
  return '<button class="feed-card" data-kind="happening" data-id="' + h.id + '">' +
    '<span class="feed-thumb ' + h.gradient + '">' + icon(CATEGORY_ICON[h.type] || 'sparkle', 18) + '</span>' +
    '<span class="feed-card-body">' +
      '<span class="feed-card-top"><span class="feed-card-name">' + h.title + '</span><span class="feed-card-distance">' + distanceLabel(h.distanceM) + '</span></span>' +
      '<span class="feed-card-status">' + h.timeLabel + ' \u00B7 ' + h.attendees + ' people</span>' +
      '<span class="feed-card-meta"><span class="tag-pill">' + categoryLabel(h.type) + '</span>' +
        (h.joined ? '<span class="tag-pill tag-joined">Joined</span>' : '') + '</span>' +
    '</span>' +
  '</button>';
}

function bindFeedCardClicks(container) {
  container.querySelectorAll('.feed-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (card.dataset.kind === 'person') openPersonDetail(card.dataset.id);
      else openEventDetail(card.dataset.id);
    });
  });
}

function openPersonDetail(id) {
  const p = NEARBY_DATA.people.find((x) => x.id === id);
  if (!p) return;
  const waved = state.wavedIds.has(id);
  const el = pushView('person',
    '<div class="nav-top">' +
      '<button class="navbtn" id="personBackBtn">' + icon('back', 18) + '</button>' +
      '<div class="navtitle"></div><div class="navbtn"></div>' +
    '</div>' +
    '<div class="screen-scroll has-navtop no-tabbar profile-sheet-body">' +
      '<span class="avatar ' + p.gradient + '" style="width:96px;height:96px;">' +
        '<span class="presence-dot" data-state="online" style="width:20px;height:20px;box-shadow:0 0 0 3px var(--surface);"></span>' +
      '</span>' +
      '<div>' +
        '<div class="profile-name">' + p.name + '</div>' +
        '<div class="detail-meta-row" style="justify-content:center;margin-top:6px;">' +
          '<span>' + distanceLabel(p.distanceM) + '</span><span class="sep"></span><span>' + p.since + '</span>' +
        '</div>' +
      '</div>' +
      '<p class="detail-quote">\u201C' + escapeHtml(p.status) + '\u201D</p>' +
      (p.mutual ? '<span class="tag-pill">' + escapeHtml(p.mutual) + '</span>' : '') +
      '<div class="profile-actions">' +
        '<button class="btn btn-primary btn-block" id="personWaveBtn"' + (waved ? ' disabled' : '') + '>' + (waved ? 'Waved' : icon('wave', 14) + ' Say hi') + '</button>' +
      '</div>' +
    '</div>'
  );
  el.querySelector('#personBackBtn').addEventListener('click', popView);
  el.querySelector('#personWaveBtn').addEventListener('click', (e) => waveAtPerson(p.id, e.currentTarget));
}

function waveAtPerson(id, btnEl) {
  if (state.wavedIds.has(id)) return;
  const p = NEARBY_DATA.people.find((x) => x.id === id);
  if (!p) return;
  state.wavedIds.add(id);
  NEARBY_DATA.circle.connections.unshift({ id: 'c-' + id, name: p.name, note: 'You said hi nearby', when: 'just now', gradient: p.gradient });
  showToast('You waved at ' + p.name);
  if (btnEl) { btnEl.textContent = 'Waved'; btnEl.disabled = true; }
  if (window.CircleScreen) CircleScreen.render();
}

function openEventDetail(id) {
  const h = NEARBY_DATA.happenings.find((x) => x.id === id);
  if (!h) return;
  const el = pushView('event',
    '<div class="nav-top">' +
      '<button class="navbtn" id="eventBackBtn">' + icon('back', 18) + '</button>' +
      '<div class="navtitle"></div><div class="navbtn"></div>' +
    '</div>' +
    '<div class="screen-scroll has-navtop no-tabbar event-scroll">' +
      '<div class="event-cover ' + h.gradient + '">' + icon(CATEGORY_ICON[h.type] || 'sparkle', 40) + '</div>' +
      '<div class="event-body">' +
        '<span class="tag-pill">' + categoryLabel(h.type) + '</span>' +
        '<h2 class="event-title">' + h.title + '</h2>' +
        '<div class="event-meta-row"><span>' + h.timeLabel + '</span><span class="sep"></span><span>' + distanceLabel(h.distanceM) + ' away</span></div>' +
        '<div class="event-host-row"><span class="avatar event-host-avatar g-blush"></span><span class="event-host-label">Hosted by <b>' + h.host + '</b></span></div>' +
        '<div class="event-attendees-row"><span class="avatar-stack">' + avatarStackHTML(h.attendees) + '</span><span class="event-attendees-count">' + h.attendees + ' going</span></div>' +
        '<p class="event-description">' + escapeHtml(h.description) + '</p>' +
      '</div>' +
      '<button class="btn btn-primary btn-block event-join-btn' + (h.joined ? ' joined' : '') + '" id="eventJoinBtn">' + (h.joined ? icon('checkCircle', 14) + ' Joined' : 'Join') + '</button>' +
    '</div>'
  );
  el.querySelector('#eventBackBtn').addEventListener('click', popView);
  el.querySelector('#eventJoinBtn').addEventListener('click', (e) => toggleJoinHappening(h.id, e.currentTarget));
}

function toggleJoinHappening(id, btnEl) {
  const h = NEARBY_DATA.happenings.find((x) => x.id === id);
  if (!h) return;
  h.joined = !h.joined;
  h.attendees += h.joined ? 1 : -1;
  showToast(h.joined ? 'You joined "' + h.title + '"' : 'You left "' + h.title + '"');
  if (btnEl) {
    btnEl.innerHTML = h.joined ? icon('checkCircle', 14) + ' Joined' : 'Join';
    btnEl.classList.toggle('joined', h.joined);
  }
  if (window.HomeScreen) HomeScreen.renderFeed();
  if (window.CircleScreen) CircleScreen.render();
}

function openRadiusPicker(onChange) {
  openOptionSheet({
    title: 'Discovery radius',
    options: NEARBY_DATA.radiusOptions,
    selected: NEARBY_DATA.user.radiusKm,
    onSelect: (value) => {
      NEARBY_DATA.user.radiusKm = parseFloat(value);
      if (onChange) onChange();
    },
  });
}

function sendSignal(intentValue, text) {
  NEARBY_DATA.user.intent = text;
  showToast('Signal sent \u2014 visible within ' + radiusLabel(NEARBY_DATA.user.radiusKm));
  if (window.ProfileScreen) ProfileScreen.render();
}

function openComposeSheet(prefillIntent) {
  const options = NEARBY_DATA.intentOptions;
  let currentValue = prefillIntent || options[0].value;
  const grid = options.map((opt) => (
    '<button class="compose-option' + (opt.value === currentValue ? ' selected' : '') + '" data-value="' + opt.value + '">' +
      '<span class="compose-option-icon">' + icon(opt.icon, 15) + '</span>' +
      '<span class="compose-option-label">' + opt.label + '</span>' +
      '<span class="compose-option-hint">' + opt.hint + '</span>' +
    '</button>'
  )).join('');
  const sheet = openSheet(
    '<div class="sheet-head"><h3>Send a signal</h3><button class="navbtn" id="composeCloseBtn">' + icon('close', 16) + '</button></div>' +
    '<div class="compose-body">' +
      '<div><span class="compose-field-label">What\u2019s the vibe?</span><div class="compose-grid" id="composeGrid">' + grid + '</div></div>' +
      '<div><span class="compose-field-label">Add a short note (optional)</span><input class="field" id="composeNoteInput" placeholder="e.g. by the fountain for the next hour"></div>' +
      '<div class="compose-radius-note">' + icon('pin', 14) + '<span>Visible to people within <b>' + radiusLabel(NEARBY_DATA.user.radiusKm) + '</b></span></div>' +
      '<button class="btn btn-primary btn-block" id="composeSendBtn">Send signal</button>' +
    '</div>'
  );
  sheet.querySelectorAll('.compose-option').forEach((opt) => {
    opt.addEventListener('click', () => {
      sheet.querySelectorAll('.compose-option').forEach((o) => o.classList.remove('selected'));
      opt.classList.add('selected');
      currentValue = opt.dataset.value;
    });
  });
  sheet.querySelector('#composeCloseBtn').addEventListener('click', closeSheet);
  sheet.querySelector('#composeSendBtn').addEventListener('click', () => {
    const note = sheet.querySelector('#composeNoteInput').value.trim();
    const opt = options.find((o) => o.value === currentValue);
    sendSignal(currentValue, note || opt.label);
    closeSheet();
  });
}
