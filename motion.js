/* Schedule only artwork intersecting the viewport, on one clock for the whole page. */
const portfolioMotion = (() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const pause = document.querySelector('#pause');
  const active = new Set();
  const scenes = new Map();
  let running = !preference.matches;
  let frame = 0;
  let last = 0;
  let elapsed = 0;

  function request() {
    if (!frame && running && active.size && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function tick(now) {
    frame = 0;
    if (!running || document.hidden || !active.size) { last = 0; return; }
    if (!last || now - last >= 1000 / 32) {
      const dt = last ? Math.min(now-last,80) / 1000 : 0;
      elapsed += dt;
      last = now;
      for (const el of active) scenes.get(el)(elapsed, dt);
    }
    request();
  }
  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) active.add(entry.target);
      else active.delete(entry.target);
    }
    if (!active.size) last = 0;
    request();
  });
  function setRunning(value) {
    running = value;
    document.documentElement.classList.toggle('motion-running', running);
    pause.setAttribute('aria-label', running ? (pause.dataset.pause || 'Pause motion') : (pause.dataset.play || 'Play motion'));
    pause.title = pause.getAttribute('aria-label');
    pause.textContent = running ? 'Ⅱ' : '▷';
    if (!running) {
      for (const animation of document.getAnimations()) {
        if (animation.id === 'portfolio-entry') animation.cancel();
      }
    }
    document.dispatchEvent(new Event('portfolio-motion-change'));
    last = 0;
    request();
  }
  pause.hidden = false;
  pause.addEventListener('click', () => setRunning(!running));
  preference.addEventListener('change', () => setRunning(!preference.matches));
  document.addEventListener('visibilitychange', () => { last = 0; request(); });
  setRunning(running);
  return {
    get running() { return running; },
    register(el, render) { scenes.set(el, render); visibility.observe(el); },
    reveal(el, delay = 0) {
      if (!running || !el.animate) return;
      const effect = el.animate([
        {transform:'translateY(35px)', opacity:.25, clipPath:'inset(0 0 9% 0)'},
        {transform:'none', opacity:1, clipPath:'inset(0)'}
      ], {duration:620, delay, easing:'cubic-bezier(.18,.74,.18,1)', fill:'backwards'});
      effect.id = 'portfolio-entry';
    }
  };
})();
