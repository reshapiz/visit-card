const HomeScreen = {
  filter: 'all',
  searchQuery: '',

  init() {
    this.renderHeader();
    this.renderSignalRow();
    this.renderFilters();
    this.renderFeed();
    this.bindEvents();
  },

  renderHeader() {
    document.getElementById('homeRadiusLabel').textContent = radiusLabel(NEARBY_DATA.user.radiusKm);
  },

  renderSignalRow() {
    const presets = {
      meetup: { icon: 'wave', label: 'Say hi', text: 'Say hi to people nearby' },
      coffee: { icon: 'coffee', label: 'Coffee', text: 'Grabbing a coffee, open to company' },
      walk: { icon: 'compass', label: 'Walk', text: 'Out for a walk, up for company' },
    };
    document.querySelectorAll('#signalRow .signal-chip[data-quick]').forEach((btn) => {
      const preset = presets[btn.dataset.quick];
      btn.innerHTML = icon(preset.icon, 14) + preset.label;
      btn.addEventListener('click', () => sendSignal(btn.dataset.quick, preset.text));
    });
    const composeBtn = document.getElementById('composeBtn');
    composeBtn.innerHTML = icon('plusCircle', 14) + 'Send a signal';
    composeBtn.addEventListener('click', () => openComposeSheet());
  },

  renderFilters() {
    const row = document.getElementById('homeFilters');
    row.innerHTML = NEARBY_DATA.categories.map((c) => (
      '<button class="filter-pill' + (c.value === this.filter ? ' active' : '') + '" data-filter="' + c.value + '">' + c.label + '</button>'
    )).join('');
    row.querySelectorAll('.filter-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.filter = btn.dataset.filter;
        row.querySelectorAll('.filter-pill').forEach((b) => b.classList.toggle('active', b === btn));
        this.renderFeed();
      });
    });
  },

  matchesFilter(item) {
    if (this.filter === 'all') return true;
    if (item.kind === 'person') {
      if (this.filter === 'support') return item.tag === 'support';
      return this.filter === 'person';
    }
    return item.type === this.filter;
  },

  renderFeed() {
    const container = document.getElementById('feedList');
    const query = this.searchQuery.trim().toLowerCase();
    const items = NEARBY_DATA.people.map((p) => Object.assign({ kind: 'person' }, p))
      .concat(NEARBY_DATA.happenings.map((h) => Object.assign({ kind: 'happening' }, h)))
      .filter((item) => this.matchesFilter(item))
      .filter((item) => {
        if (!query) return true;
        const haystack = ((item.name || item.title || '') + ' ' + (item.status || item.description || '')).toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => a.distanceM - b.distanceM);

    if (!items.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">' + icon('search', 44) + '</div>' +
        '<p>Nothing matches right now. Try a different filter or check back soon.</p></div>';
      return;
    }
    container.innerHTML = items.map((item) => (item.kind === 'person' ? personCardHTML(item) : happeningCardHTML(item))).join('');
    bindFeedCardClicks(container);
  },

  bindEvents() {
    document.getElementById('homeRadiusBtn').addEventListener('click', () => {
      openRadiusPicker(() => {
        this.renderHeader();
        if (window.RadarScreen) RadarScreen.renderHeader();
      });
    });

    const searchBtn = document.getElementById('homeSearchBtn');
    searchBtn.innerHTML = icon('search', 16);
    searchBtn.addEventListener('click', () => {
      const row = document.getElementById('homeSearchRow');
      row.classList.toggle('hidden');
      if (!row.classList.contains('hidden')) {
        document.getElementById('homeSearchInput').focus();
      } else {
        document.getElementById('homeSearchInput').value = '';
        this.searchQuery = '';
        this.renderFeed();
      }
    });
    document.getElementById('homeSearchInput').addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderFeed();
    });
  },
};
