(() => {
  const flight = document.querySelector('#earth-flight');
  const poster = document.querySelector('#earth-poster');
  const camera = document.querySelector('.camera');
  const home = document.querySelector('#cherepovets');
  const destination = document.querySelector('#petersburg');
  const keyboard = document.querySelector('.keyboard');
  const keys = [...keyboard.querySelectorAll('.key')];
  const stops = ['assets/earth.webp', 'assets/cherepovets.webp', 'assets/petersburg.webp'];
  let homeOffset = 1, goalOffset = 2;
  let lastStop = 0, desiredTime = 0, queued = 0;
  let requested = false, decoded = false, failed = false;

  function seek() {
    if (failed || !portfolioMotion.running || flight.seeking || flight.readyState < 2) return;
    if (Math.abs(flight.currentTime - desiredTime) > .018) flight.currentTime = desiredTime;
  }

  function update() {
    queued = 0;
    const y = Math.max(0, window.scrollY);
    const progress = y < homeOffset
      ? .52 * y / homeOffset
      : Math.min(1,.52 + .48 * (y-homeOffset)/(goalOffset-homeOffset));
    const stop = progress < .25 ? 0 : progress < .78 ? 1 : 2;
    if (stop !== lastStop) {
      poster.src = stops[stop];
      lastStop = stop;
    }
    camera.style.setProperty('--orbit-opacity', String(Math.max(0,1-progress*4.5)));
    // On narrow screens the map rises into the gap between two passages.
    const leg = progress < .52 ? progress / .52 : (progress - .52) / .48;
    camera.style.setProperty('--map-rise', String(Math.sin(Math.PI * leg) ** 2));
    if (portfolioMotion.running && !requested) {
      requested = true;
      loadFlight();
    }
    const canPlay = !failed && Number.isFinite(flight.duration) && portfolioMotion.running;
    if (flight.readyState >= 2) decoded = true;
    flight.classList.toggle('ready', canPlay && decoded);
    if (canPlay) {
      desiredTime = progress * Math.max(0,flight.duration-.04);
      seek();
    }
  }

  function schedule() {
    if (!queued) queued = requestAnimationFrame(update);
  }
  function measure() {
    // Read chapter positions in document coordinates, including the mobile layout.
    function center(el) {
      const box=el.getBoundingClientRect();
      return Math.max(1,scrollY + box.top + box.height/2 - innerHeight/2);
    }
    homeOffset = center(home);
    goalOffset = Math.max(homeOffset+1,center(destination));
    schedule();
  }
  new ResizeObserver(measure).observe(document.querySelector('.journey'));
  addEventListener('resize',measure);
  addEventListener('pageshow',measure);
  addEventListener('scroll',schedule,{passive:true});
  document.addEventListener('portfolio-motion-change',schedule);
  for (const event of ['loadedmetadata','loadeddata','canplay']) flight.addEventListener(event,schedule);
  flight.addEventListener('seeked',seek);
  flight.addEventListener('error',() => { failed=true; schedule(); });
  // A local blob permits frame seeking on static servers that ignore HTTP Range.
  // File previews can seek directly and do not allow fetch() of local files.
  async function loadFlight() {
    if (location.protocol === 'file:') {
      flight.src = flight.dataset.src;
      return;
    }
    try {
      const response = await fetch(flight.dataset.src);
      if (!response.ok) throw new Error('Flight asset unavailable');
      flight.src = URL.createObjectURL(await response.blob());
    } catch {
      flight.src = flight.dataset.src;
    }
  }
  measure();

  portfolioMotion.register(keyboard, () => {
    const rect=keyboard.getBoundingClientRect();
    const position=(innerHeight*.63-rect.top)/innerHeight;
    keys.forEach((key,index) => {
      const distance=(position-index*.032)*7;
      const lift= Math.exp(-distance*distance)*11;
      key.style.setProperty('--lift', (-lift).toFixed(1)+'px');
    });
  });

  document.querySelector('main').addEventListener('click', event => {
    const link=event.target.closest('a[href^="#project-"]');
    if (link && document.querySelector(link.hash)?.hidden) document.querySelector('[data-filter="all"]').click();
  });
})();
