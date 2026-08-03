const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const bars = [48, 55, 61, 68, 78, 88, 96, 93, 83, 71, 57, 49];
$('#solarChart').innerHTML = bars.map(value => `<i style="height:${value}%"></i>`).join('');

// Every report section owns its edit state. This keeps the buyer-facing page clean while making edits obvious and local.
const editableFor = (section) => $$(`#${section.id} h2, #${section.id} .heading-note, #${section.id} h3, #${section.id} .bundle-card p, #${section.id} .bundle-card strong, #${section.id} .fact-row strong, #${section.id} .detail-specs b, #${section.id} .ev-stats strong, #${section.id} .investment-row strong`);
$$('.content-section').forEach(section => {
  const heading = section.querySelector('.section-heading');
  if (!heading) return;
  const pencil = document.createElement('button');
  pencil.className = 'section-edit';
  pencil.type = 'button';
  pencil.setAttribute('aria-label', `Edit ${section.id} section`);
  pencil.textContent = '✎';
  heading.appendChild(pencil);
  pencil.addEventListener('click', () => {
    const isEditing = pencil.classList.toggle('editing');
    pencil.textContent = isEditing ? '✓' : '✎';
    editableFor(section).forEach(field => {
      field.contentEditable = isEditing;
      field.classList.toggle('inline-editing', isEditing);
    });
  });
});

$$('.nav-item').forEach(item => item.addEventListener('click', () => {
  document.getElementById(item.dataset.target).scrollIntoView({ behavior: 'smooth', block: 'start' });
  $$('.nav-item').forEach(nav => nav.classList.toggle('active', nav === item));
}));

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    const current = $(`.nav-item[data-target="${entry.target.id}"]`);
    if (current) $$('.nav-item').forEach(nav => nav.classList.toggle('active', nav === current));
  }
}), { rootMargin: '-25% 0px -65% 0px' });
$$('.section-anchor').forEach(section => observer.observe(section));

// Keep the realistic default inputs as a lightweight compatibility layer for future data binding.
const siteInput = $('#siteInput');
if (siteInput) siteInput.addEventListener('input', event => { $('#storeName').textContent = event.target.value || 'your retail site'; });
const utilityInput = $('#utilityInput');
if (utilityInput) utilityInput.addEventListener('input', event => {
  const spend = Number(event.target.value.replace(/[^0-9]/g, '')) || 0;
  $('#yearSavings').textContent = `$${((spend * 0.264) / 1000).toFixed(1)}K`;
});

$$('.scope-toggle').forEach(toggle => toggle.addEventListener('change', () => {
  const section = document.getElementById(toggle.dataset.scope);
  const nav = $(`.nav-item[data-target="${toggle.dataset.scope}"]`);
  if (section) section.classList.toggle('scope-off', !toggle.checked);
  if (nav) nav.classList.toggle('scope-off', !toggle.checked);
}));

$$('.segmented button').forEach(button => button.addEventListener('click', () => {
  $$('.segmented button').forEach(item => item.classList.remove('selected'));
  button.classList.add('selected');
}));

$('#exportButton').addEventListener('click', () => {
  const toast = $('#toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
});
