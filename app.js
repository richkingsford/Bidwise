const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const bars = [48, 55, 61, 68, 78, 88, 96, 93, 83, 71, 57, 49];
$('#solarChart').innerHTML = bars.map(value => `<i style="height:${value}%"></i>`).join('');

const editPanel = $('#editPanel');
const modeToggle = $('#modeToggle');
const modeLabel = $('#modeLabel');
function setEditing(editing) {
  editPanel.classList.toggle('open', editing);
  modeToggle.classList.toggle('editing', editing);
  modeLabel.textContent = editing ? 'Edit mode' : 'View mode';
}
modeToggle.addEventListener('click', () => setEditing(!editPanel.classList.contains('open')));
$('#closeEdit').addEventListener('click', () => setEditing(false));
$('#doneEditing').addEventListener('click', () => setEditing(false));

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

$('#siteInput').addEventListener('input', event => { $('#storeName').textContent = event.target.value || 'your retail site'; });
$('#utilityInput').addEventListener('input', event => {
  const spend = Number(event.target.value.replace(/[^0-9]/g, '')) || 0;
  const savings = spend * 0.264;
  $('#yearSavings').textContent = `$${(savings / 1000).toFixed(1)}K`;
});

$$('.scope-toggle').forEach(toggle => toggle.addEventListener('change', () => {
  const enabled = $$('.scope-toggle:checked').length;
  $('#scopeCount').textContent = `${enabled} of 3`;
  const section = document.getElementById(toggle.dataset.scope);
  section.classList.toggle('scope-off', !toggle.checked);
  const nav = $(`.nav-item[data-target="${toggle.dataset.scope}"]`);
  nav.classList.toggle('scope-off', !toggle.checked);
  const total = 1180000 - (toggle.dataset.scope === 'solar' ? 820000 : toggle.dataset.scope === 'storage' ? 235000 : 125000);
  $('#totalInvestment').textContent = enabled === 3 ? '$1.18M' : `$${Math.round(total / 1000)}K`;
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
