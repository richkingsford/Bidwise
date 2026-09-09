// Keep the proposal navigation in lockstep with the rendered slide sequence.
// This intentionally runs after all proposal and async data rendering completes.
(() => {
  const rebuild = () => {
    const proposal = document.querySelector('#ev');
    const nav = document.querySelector('.report-nav');
    const slides = proposal ? [...proposal.querySelectorAll('.ev-report-section')] : [];
    if (!nav || slides.length < 7) return false;
    nav.innerHTML = slides.map((slide, index) => {
      const label = slide.dataset.navLabel || slide.querySelector('.ev-report-head h3')?.textContent?.trim() || 'Section';
      return `<button class="nav-item ${index === 0 ? 'active' : ''}" data-target="${slide.id}"><span>${String(index + 2).padStart(2, '0')}</span>${label}</button>`;
    }).join('');
    return true;
  };
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (rebuild() || tries >= 30) clearInterval(timer);
  }, 250);
})();
