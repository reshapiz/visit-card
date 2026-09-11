const RadarScreen = {
  filter: 'all',

  init() {
    this.renderHeader();
    this.renderFilters();
    this.renderDots();
    document.querySelector('.radar-rings').addEventListener('click', () => this.hidePreview());
  },

  renderHeader() {
    document.getElementById('radarRadiusLabel').textContent = radiusLabel(NEARBY_DATA.user.radiusKm);
  },

  renderFilters() {
    const row = document.getElementById('radarFilters');
    row.innerHTML = NEARBY_DATA.categories.map((c) => (
      '<button class="filter-pill' + (c.value === this.filter ? ' active' : '') + '" data-filter="' + c.value + '">' + c.label + '</button>'
    )).join('');
    row.querySelectorAll('.filter-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.filter = btn.dataset.filter;
        row.querySelectorAll('.filter-pill').forEach((b) => b.classList.toggle('active', b === btn));
        this.hidePreview();
        this.renderDots();
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

  renderDots() {
    const container = document.getElementById('radarDots');
    const items = NEARBY_DATA.people.map((p) => Object.assign({ kind: 'person' }, p))
      .concat(NEARBY_DATA.happenings.map((h) => Object.assign({ kind: 'happening' }, h)))
      .filter((item) => this.matchesFilter(item));

    container.innerHTML = items.map((item) => {
      const angle = hashToUnit(item.id) * Math.PI * 2;
      const fraction = Math.min(item.distanceM / 800, 0.96);
      const left = 50 + fraction * 44 * Math.cos(angle);
      const top = 50 + fraction * 44 * Math.sin(angle);
      const cls = item.kind === 'person' ? 'dot-person ' + item.gradient : item.gradient;
      const dotIcon = item.kind === 'person' ? '' : icon(CATEGORY_ICON[item.type] || 'sparkle', 13);
      return '<button class="radar-dot ' + cls + '" style="left:' + left.toFixed(1) + '%;top:' + top.toFixed(1) + '%;" ' +
        'data-kind="' + item.kind + '" data-id="' + item.id + '">' + dotIcon + '</button>';
    }).join('');

    container.querySelectorAll('.radar-dot').forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        container.querySelectorAll('.radar-dot').forEach((d) => d.classList.remove('selected'));
        dot.classList.add('selected');
        this.showPreview(dot.dataset.kind, dot.dataset.id);
      });
    });
  },

  showPreview(kind, id) {
    const preview = document.getElementById('radarPreview');
    if (kind === 'person') {
      preview.innerHTML = personCardHTML(NEARBY_DATA.people.find((x) => x.id === id));
    } else {
      preview.innerHTML = happeningCardHTML(NEARBY_DATA.happenings.find((x) => x.id === id));
    }
    preview.classList.remove('hidden');
    bindFeedCardClicks(preview);
  },

  hidePreview() {
    document.getElementById('radarPreview').classList.add('hidden');
    document.querySelectorAll('.radar-dot').forEach((d) => d.classList.remove('selected'));
  },
};
