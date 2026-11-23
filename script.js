(() => {
  const filters = document.querySelector('.filters');
  const projects = [...document.querySelectorAll('.project')];
  filters.hidden = false;
  filters.addEventListener('click', event => {
    const selected = event.target.closest('[data-filter]');
    if (!selected) return;
    for (const button of filters.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button === selected));
    }
    const previous = new Map(projects.filter(project => !project.hidden)
      .map(project => [project, project.getBoundingClientRect()]));
    let count = 0;
    for (const project of projects) {
      project.hidden = selected.dataset.filter !== 'all' && project.dataset.kind !== selected.dataset.filter;
      if (!project.hidden) count++;
    }
    if (portfolioMotion.running) {
      for (const project of projects.filter(project => !project.hidden)) {
        project.getAnimations().forEach(animation => animation.cancel());
        const before = previous.get(project);
        if (!before) { portfolioMotion.reveal(project); continue; }
        const after = project.getBoundingClientRect();
        const effect = project.animate([
          {transform: `translate(${before.x-after.x}px, ${before.y-after.y}px)`},
          {transform: 'none'}
        ], {duration: 430, easing: 'cubic-bezier(.2,.75,.25,1)'});
        effect.id = 'portfolio-entry';
      }
    }
    document.querySelector('#filter-status').textContent = count + (count === 1 ? ' project shown.' : ' projects shown.');
  });

  const form = document.querySelector('#contact-form');
  form.hidden = false;
  form.addEventListener('invalid', event => {
    const field = event.target;
    if (field.validity.valueMissing) {
      field.setCustomValidity(field.name === 'name' ? 'Enter your name.' : 'Write a message.');
    }
  }, true);
  form.addEventListener('input', event => {
    event.target.setCustomValidity('');
    document.querySelector('#mail-status').textContent = '';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = form.elements.name;
    const message = form.elements.message;
    for (const field of [name, message]) {
      field.setCustomValidity(field.value.trim() ? '' : 'Please fill out this field.');
    }
    if (!form.reportValidity()) return;
    const subject = encodeURIComponent('Portfolio enquiry from ' + name.value.trim());
    const body = encodeURIComponent(message.value.trim() + '\r\n\r\n' + name.value.trim());
    const address = document.querySelector('.contact a[href^="mailto:"]').href;
    window.location.href = address + '?subject=' + subject + '&body=' + body;
    document.querySelector('#mail-status').textContent = 'If your email app didn’t open, use Telegram or email Disketion-partner@yandex.ru.';
  });
})();
