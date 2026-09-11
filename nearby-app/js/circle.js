const CircleScreen = {
  init() {
    this.render();
  },

  render() {
    this.renderJoined();
    this.renderConnections();
  },

  renderJoined() {
    const container = document.getElementById('circleJoinedList');
    const joined = NEARBY_DATA.happenings.filter((h) => h.joined);
    if (!joined.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">' + icon('sparkle', 40) + '</div>' +
        '<p>Nothing joined yet. Happenings you join will show up here.</p></div>';
      return;
    }
    container.innerHTML = joined.map((h) => happeningCardHTML(h)).join('');
    bindFeedCardClicks(container);
  },

  renderConnections() {
    const container = document.getElementById('circleConnectionsList');
    const list = NEARBY_DATA.circle.connections;
    if (!list.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">' + icon('users', 40) + '</div>' +
        '<p>No connections yet. Say hi to someone nearby to start your circle.</p></div>';
      return;
    }
    container.innerHTML = list.map((c) => (
      '<div class="connection-row">' +
        '<span class="avatar connection-avatar ' + c.gradient + '"></span>' +
        '<span class="connection-body">' +
          '<span class="connection-name">' + c.name + '</span>' +
          '<span class="connection-note">' + escapeHtml(c.note) + ' \u00B7 ' + c.when + '</span>' +
        '</span>' +
      '</div>'
    )).join('');
  },
};
