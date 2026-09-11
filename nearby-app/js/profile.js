const ProfileScreen = {
  init() {
    this.renderIcons();
    this.render();
    this.bindEvents();
  },

  renderIcons() {
    document.querySelector('#rowVisibility .row-icon').innerHTML = icon('eye', 14);
    document.querySelector('#rowRadius .row-icon').innerHTML = icon('pin', 14);
    document.querySelector('#rowExactLocation .row-icon').innerHTML = icon('shield', 14);
    document.querySelector('#rowAppearance .row-icon').innerHTML = icon('sun', 14);
    document.querySelector('#rowNotifications .row-icon').innerHTML = icon('bell', 14);
    document.querySelector('#rowAbout .row-icon').innerHTML = icon('user', 14);
    document.querySelector('#rowSignOut .row-icon').innerHTML = icon('logout', 14);
    document.querySelectorAll('.row .row-chevron').forEach((el) => { el.innerHTML = icon('chevronRight', 16); });
    document.querySelector('#profileStatusBtn .row-chevron').innerHTML = icon('chevronRight', 14);
  },

  render() {
    const u = NEARBY_DATA.user;
    document.getElementById('profileNameLabel').textContent = u.name;
    document.getElementById('profileHandleLabel').textContent = u.handle;
    document.getElementById('profileIntentLabel').textContent = u.intent;
    document.getElementById('profilePresenceDot').dataset.state = u.visible ? 'online' : 'hidden';
    document.getElementById('profileCard').classList.toggle('ghosted', !u.visible);
    document.getElementById('rowRadiusValue').textContent = radiusLabel(u.radiusKm);

    const appearanceLabels = { system: 'System', light: 'Light', dark: 'Dark' };
    document.getElementById('rowAppearanceValue').textContent = appearanceLabels[NEARBY_DATA.settings.appearance];

    this.syncToggle('visibilityToggle', u.visible);
    this.syncToggle('exactLocationToggle', NEARBY_DATA.settings.shareExactLocation);
    this.syncToggle('notifToggle', NEARBY_DATA.settings.notifications);
  },

  syncToggle(id, value) {
    const el = document.getElementById(id);
    el.classList.toggle('on', value);
    el.setAttribute('aria-checked', String(value));
  },

  bindEvents() {
    document.getElementById('profileStatusBtn').addEventListener('click', () => this.openEditIntentSheet());

    bindToggle('visibilityToggle', (next) => {
      NEARBY_DATA.user.visible = next;
      document.getElementById('profileCard').classList.toggle('ghosted', !next);
      document.getElementById('profilePresenceDot').dataset.state = next ? 'online' : 'hidden';
      showToast(next ? 'You are visible to people nearby' : "Ghost mode on \u2014 you're invisible nearby");
    });

    document.getElementById('rowRadius').addEventListener('click', () => {
      openRadiusPicker(() => {
        this.render();
        if (window.RadarScreen) RadarScreen.renderHeader();
        if (window.HomeScreen) HomeScreen.renderHeader();
      });
    });

    bindToggle('exactLocationToggle', (next) => {
      NEARBY_DATA.settings.shareExactLocation = next;
      showToast(next ? 'Sharing your exact location' : 'Sharing an approximate location only');
    });

    document.getElementById('rowAppearance').addEventListener('click', () => {
      openOptionSheet({
        title: 'Appearance',
        options: NEARBY_DATA.appearanceOptions,
        selected: NEARBY_DATA.settings.appearance,
        onSelect: (value) => {
          NEARBY_DATA.settings.appearance = value;
          applyTheme();
          this.render();
        },
      });
    });

    bindToggle('notifToggle', (next) => {
      NEARBY_DATA.settings.notifications = next;
      showToast(next ? 'Notifications on' : 'Notifications off');
    });

    document.getElementById('rowAbout').addEventListener('click', () => this.openAboutSheet());

    document.getElementById('rowSignOut').addEventListener('click', () => {
      openConfirmModal({
        title: 'Sign out?',
        message: 'You will stop appearing to people nearby until you sign back in.',
        confirmLabel: 'Sign out',
        destructive: true,
        onConfirm: () => this.signOut(),
      });
    });
  },

  openEditIntentSheet() {
    const sheet = openSheet(
      '<div class="sheet-head"><h3>Your status</h3><button class="navbtn" id="intentCloseBtn">' + icon('close', 16) + '</button></div>' +
      '<div class="compose-body">' +
        '<div><span class="compose-field-label">What are you up to right now?</span>' +
          '<input class="field" id="intentInput" value="' + escapeHtml(NEARBY_DATA.user.intent) + '" placeholder="Open to meeting people"></div>' +
        '<button class="btn btn-primary btn-block" id="intentSaveBtn">Save</button>' +
      '</div>'
    );
    sheet.querySelector('#intentCloseBtn').addEventListener('click', closeSheet);
    sheet.querySelector('#intentSaveBtn').addEventListener('click', () => {
      const val = sheet.querySelector('#intentInput').value.trim();
      if (val) NEARBY_DATA.user.intent = val;
      closeSheet();
      this.render();
    });
  },

  openAboutSheet() {
    const sheet = openSheet(
      '<div class="sheet-head"><h3>About you</h3><button class="navbtn" id="aboutCloseBtn">' + icon('close', 16) + '</button></div>' +
      '<div class="compose-body">' +
        '<div><span class="compose-field-label">Shown on your profile to people nearby</span>' +
          '<input class="field" id="aboutInput" value="' + escapeHtml(NEARBY_DATA.user.bio) + '"></div>' +
        '<button class="btn btn-primary btn-block" id="aboutSaveBtn">Save</button>' +
      '</div>'
    );
    sheet.querySelector('#aboutCloseBtn').addEventListener('click', closeSheet);
    sheet.querySelector('#aboutSaveBtn').addEventListener('click', () => {
      const val = sheet.querySelector('#aboutInput').value.trim();
      if (val) NEARBY_DATA.user.bio = val;
      closeSheet();
      showToast('About you updated');
    });
  },

  signOut() {
    const el = pushView('signed-out',
      '<div class="state-screen">' +
        '<div class="state-screen-icon">' + icon('logout', 26) + '</div>' +
        '<h2>You\u2019re signed out</h2>' +
        '<p>Nearby stopped sharing your presence. Come back anytime.</p>' +
        '<button class="btn btn-primary" id="signBackInBtn">Continue as ' + NEARBY_DATA.user.name + '</button>' +
      '</div>'
    );
    el.querySelector('#signBackInBtn').addEventListener('click', popView);
  },
};
