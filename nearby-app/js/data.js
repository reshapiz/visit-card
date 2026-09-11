const NEARBY_DATA = {
  user: {
    name: 'Alex',
    handle: '@alexm',
    bio: 'New in the neighborhood. Always up for a walk or good coffee.',
    intent: 'Open to meeting people',
    visible: true,
    radiusKm: 1,
  },

  categories: [
    { value: 'all', label: 'Everything' },
    { value: 'person', label: 'People' },
    { value: 'music', label: 'Live music' },
    { value: 'meetup', label: 'Meetups' },
    { value: 'event', label: 'Events' },
    { value: 'support', label: 'Could use company' },
  ],

  people: [
    { id: 'p1', type: 'person', name: 'Sara', distanceM: 80, status: 'Sitting in the park, up for a chat', tag: 'meetup', since: '12 min ago', gradient: 'g-sunset', mutual: 'also into early morning runs' },
    { id: 'p2', type: 'person', name: 'Dev', distanceM: 140, status: 'Looking for someone to grab coffee with', tag: 'meetup', since: 'just now', gradient: 'g-forest', mutual: '' },
    { id: 'p3', type: 'person', name: 'Noor', distanceM: 230, status: 'New here, would love to meet neighbors', tag: 'meetup', since: '40 min ago', gradient: 'g-rose', mutual: 'moved here this month too' },
    { id: 'p4', type: 'person', name: 'Kai', distanceM: 310, status: 'Could use some company this evening', tag: 'support', since: '5 min ago', gradient: 'g-blush', mutual: '' },
    { id: 'p5', type: 'person', name: 'Lena', distanceM: 410, status: 'Walking the dog, open to company', tag: 'meetup', since: '2 min ago', gradient: 'g-warm', mutual: '' },
  ],

  happenings: [
    { id: 'h1', type: 'music', title: 'Guitar under the bridge', distanceM: 120, timeLabel: 'Now · 20 min left', attendees: 6, host: 'Marco', description: 'A guy with a guitar started playing near the canal, small crowd forming. Bring nothing, just show up.', joined: false, gradient: 'g-sunset' },
    { id: 'h2', type: 'event', title: 'Sunday running group', distanceM: 450, timeLabel: 'Starts in 25 min', attendees: 9, host: 'Runclub Eindhoven', description: 'Easy 5k loop through the park, all paces welcome. Meet at the fountain.', joined: false, gradient: 'g-forest' },
    { id: 'h3', title: 'Street food market', type: 'event', distanceM: 600, timeLabel: 'Until 21:00', attendees: 34, host: 'Stratumseind', description: 'Pop-up food stalls and a live DJ set on the square. Cash and card both fine.', joined: false, gradient: 'g-warm' },
    { id: 'h4', title: 'Board game evening', type: 'meetup', distanceM: 280, timeLabel: 'Starts at 19:30', attendees: 5, host: 'Julia', description: 'Looking for 2-3 more people for Catan at the corner café. Beginners very welcome.', joined: true, gradient: 'g-rose' },
    { id: 'h5', title: 'Study together at the library', type: 'meetup', distanceM: 190, timeLabel: 'Now · 2h left', attendees: 4, host: 'Tom', description: 'Quiet table, headphones on, but company is still nice. Second floor, by the window.', joined: false, gradient: 'g-paper' },
  ],

  circle: {
    connections: [
      { id: 'c1', name: 'Ilya', note: 'Said hi at the street food market', when: 'yesterday', gradient: 'g-night' },
    ],
  },

  intentOptions: [
    { value: 'meetup', label: 'Looking to meet up', hint: 'open to plans nearby', icon: 'wave' },
    { value: 'walk', label: 'Up for a walk', hint: 'company for a stroll', icon: 'compass' },
    { value: 'coffee', label: 'Grab a coffee', hint: 'quick catch-up nearby', icon: 'coffee' },
    { value: 'hosting', label: 'Hosting something', hint: 'let people join in', icon: 'sparkle' },
    { value: 'support', label: 'Could use company', hint: 'a quiet signal, no pressure', icon: 'handHeart' },
  ],

  radiusOptions: [
    { value: 0.3, label: '300 m', hint: 'just this block' },
    { value: 1, label: '1 km', hint: 'walking distance' },
    { value: 3, label: '3 km', hint: 'across the neighborhood' },
    { value: 10, label: '10 km', hint: 'the whole city' },
  ],

  appearanceOptions: [
    { value: 'system', label: 'System', hint: 'matches your device' },
    { value: 'light', label: 'Light', hint: '' },
    { value: 'dark', label: 'Dark', hint: '' },
  ],

  settings: {
    notifications: true,
    appearance: 'system',
    shareExactLocation: false,
  },
};

const CATEGORY_ICON = {
  person: 'users',
  music: 'music',
  meetup: 'wave',
  event: 'sparkle',
  support: 'handHeart',
};
