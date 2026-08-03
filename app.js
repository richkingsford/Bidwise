const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
if (window.location.hash.startsWith('#view=')) document.body.classList.add('view-only');

const bars = [48, 55, 61, 68, 78, 88, 96, 93, 83, 71, 57, 49];
$('#solarChart').innerHTML = bars.map(value => `<i style="height:${value}%"></i>`).join('');

const configSchemas = {
  overview: { title: 'Overview', fields: [['Customer / site name', 'text', 'Walmart Supercenter #5179'], ['Proposal date', 'date', '2024-08-17'], ['Savings headline', 'number', '26.4']] },
  site: { title: 'Site snapshot', fields: [['Store footprint (sq ft)', 'number', '182400'], ['Annual utility spend', 'number', '312800'], ['Peak demand (kW)', 'number', '1240'], ['Map replacement image', 'file', '']] },
  solar: { title: 'Solar array', fields: [['Array size (kW DC)', 'number', '410'], ['Annual production (MWh)', 'number', '1010'], ['Module count', 'number', '754'], ['Chart replacement image', 'file', '']] },
  storage: { title: 'Battery storage', fields: [['Battery capacity (MWh)', 'number', '1.2'], ['Power rating (kW)', 'number', '600'], ['Peak shaving target (%)', 'number', '19'], ['Dispatch model', 'text', 'Peak shaving + resilience']] },
  ev: { title: 'EV charging', fields: [['DC fast chargers', 'number', '6'], ['Level 2 chargers', 'number', '8'], ['Year 1 utilization (%)', 'number', '31'], ['Revenue model', 'text', 'Net revenue + customer dwell']] },
  bundles: { title: 'Bundled scopes', fields: [['Critter guard investment', 'number', '27500'], ['Permanent lighting investment', 'number', '41250'], ['HVAC investment', 'number', '93193'], ['Scope image replacement', 'file', '']] },
  vpp: { title: 'Grid partnership', fields: [['Demand response value / year', 'number', '12000'], ['Reserve requirement (%)', 'number', '20'], ['Program status', 'text', 'Subject to utility approval']] },
  investment: { title: 'Investment', fields: [['Solar investment', 'number', '820000'], ['Battery investment', 'number', '235000'], ['EV investment', 'number', '125000'], ['Incentive assumption (%)', 'number', '30']] },
  economics: { title: 'Economics', fields: [['Energy savings escalation (%)', 'number', '3'], ['Analysis period (years)', 'number', '20'], ['Discount rate (%)', 'number', '8'], ['Calculation note', 'text', 'Conservative base case']] },
};

const configPanel = $('#configPanel');
const configBackdrop = $('#configBackdrop');
const configTitle = $('#configTitle');
const configBody = $('#configBody');
let activeConfigSection = 'overview';
function openConfig(sectionId) {
  activeConfigSection = sectionId;
  const schema = configSchemas[sectionId] || configSchemas.overview;
  configTitle.textContent = schema.title;
  if (sectionId === 'solar') {
    configBody.innerHTML = `<div class="config-tabs"><button class="config-tab active" data-tab="simple">Simple</button><button class="config-tab" data-tab="advanced">Advanced</button></div><div class="config-view active" data-view="simple"><label class="config-field"><span>High value</span><input id="chartHigh" type="number" value="96" /></label><label class="config-field"><span>Low value</span><input id="chartLow" type="number" value="48" /></label><div class="config-two"><label class="config-field"><span>Start month</span><input id="chartStart" type="text" value="JAN" maxlength="3" /></label><label class="config-field"><span>End month</span><input id="chartEnd" type="text" value="DEC" maxlength="3" /></label></div><label class="config-field"><span>Standard deviation</span><input id="chartStd" type="number" value="18" /></label><label class="config-field"><span>Middle shape</span><select id="chartShape"><option>Normal bell curve</option><option>Two humps</option><option>Flat summer peak</option><option>Custom seasonal</option></select></label></div><div class="config-view" data-view="advanced"><label class="config-field"><span>Paste data table</span><textarea id="chartTable" rows="9" placeholder="Month,Value\nJAN,48\nFEB,55\nMAR,61"></textarea></label><small class="format-hint">Use CSV or tab-separated rows with a header and two columns: Month, Value. Values must be numeric.</small></div><div class="config-help"><span>⌁</span><p>Simple mode generates a seasonal curve. Advanced mode lets you paste the exact chart data.</p></div>`;
    $$('.config-tab').forEach(tab => tab.addEventListener('click', () => { $$('.config-tab').forEach(item => item.classList.toggle('active', item === tab)); $$('.config-view').forEach(view => view.classList.toggle('active', view.dataset.view === tab.dataset.tab)); }));
  } else {
    configBody.innerHTML = schema.fields.map(([label, type, value]) => type === 'file' ? `<label class="config-field"><span>${label}</span><input class="config-file" type="file" accept="image/png,image/jpeg,image/webp" data-label="${label}" /></label>` : `<label class="config-field"><span>${label}</span><input type="${type}" value="${value}" /></label>`).join('') + '<div class="config-help"><span>⌁</span><p>Change these inputs to re-size the story, replace an image, or update the assumptions behind the section’s visual model.</p></div>';
    $$('.config-file').forEach(input => input.addEventListener('change', event => handleImageUpload(event.target.files[0], sectionId)));
  }
  configPanel.classList.add('open');
  configBackdrop.classList.add('open');
}
function handleImageUpload(file, sectionId) {
  if (!file) return;
  if (!file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    const imageUrl = reader.result;
    localStorage.setItem(`bidwise-image-${sectionId}`, imageUrl);
    const target = sectionId === 'site' ? $('.map-card') : sectionId === 'solar' ? $('.chart-panel') : $(`#${sectionId} .bundle-card`);
    if (target) { target.style.backgroundImage = `linear-gradient(#0b1f3333,#0b1f3333), url("${imageUrl}")`; target.style.backgroundSize = 'cover'; target.style.backgroundPosition = 'center'; }
  };
  reader.readAsDataURL(file);
}
['site', 'solar', 'bundles'].forEach(sectionId => {
  const imageUrl = localStorage.getItem(`bidwise-image-${sectionId}`);
  if (imageUrl) {
    const target = sectionId === 'site' ? $('.map-card') : sectionId === 'solar' ? $('.chart-panel') : $(`#${sectionId} .bundle-card`);
    if (target) { target.style.backgroundImage = `linear-gradient(#0b1f3333,#0b1f3333), url("${imageUrl}")`; target.style.backgroundSize = 'cover'; target.style.backgroundPosition = 'center'; }
  }
});
function closeConfig() { configPanel.classList.remove('open'); configBackdrop.classList.remove('open'); }
$('#closeConfig').addEventListener('click', closeConfig);
configBackdrop.addEventListener('click', closeConfig);
$('#applyConfig').addEventListener('click', () => {
  if (activeConfigSection === 'solar') {
    const advanced = $('[data-view="advanced"]')?.classList.contains('active');
    if (advanced) {
      const parsed = ($('#chartTable').value || '').trim().split(/\n/).slice(1).map(row => row.split(/[,\t]/).map(item => item.trim())).filter(row => row.length >= 2 && row[0] && Number.isFinite(Number(row[1])));
      if (parsed.length < 2) { $('#chartTable').classList.add('invalid'); return; }
      $('#solarChart').innerHTML = parsed.map(row => `<i style="height:${Math.max(8, Math.min(100, Number(row[1])))}%" title="${row[0]} ${row[1]}"></i>`).join('');
    } else {
      const high = Number($('#chartHigh').value) || 96; const low = Number($('#chartLow').value) || 48; const shape = $('#chartShape').value;
      const generated = shape === 'Two humps' ? [low, high - 14, high, high - 12, low + 10, low + 17, low + 8, high, high - 8, low + 14, low, low] : bars.map((_, index) => low + ((high - low) * Math.sin((index / 11) * Math.PI)));
      $('#solarChart').innerHTML = generated.map(value => `<i style="height:${Math.max(8, Math.min(100, value))}%"></i>`).join('');
    }
  }
  const values = [...configBody.querySelectorAll('input:not([type="file"]), select')].map(input => input.value);
  if (activeConfigSection === 'site' && values[1]) $('#yearSavings').textContent = `$${((Number(values[1]) * 0.264) / 1000).toFixed(1)}K`;
  if (activeConfigSection === 'solar' && values[0]) {
    const detail = $('#solar .solar-detail h3');
    if (detail) detail.textContent = `${values[0]} kW DC rooftop array`;
    const total = $('#solar .chart-top strong');
    if (total && values[1]) total.innerHTML = `${Number(values[1]).toLocaleString()} MWh <small>first year</small>`;
  }
  if (activeConfigSection === 'storage' && values[0]) {
    const detail = $('#storage .battery-copy h3');
    if (detail) detail.textContent = `${values[0]} MWh / ${values[1] || '600'} kW`;
    const peak = $('#storage .dispatch-footer strong');
    if (peak && values[2]) peak.textContent = `− ${values[2]}% peak demand`;
  }
  if (activeConfigSection === 'ev' && values[0] && values[1]) {
    const mix = $('#ev .ev-card-foot strong');
    if (mix) mix.textContent = `${values[0]} × DC fast + ${values[1]} × L2`;
  }
  closeConfig();
});

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
  const configure = document.createElement('button');
  configure.className = 'section-config';
  configure.type = 'button';
  configure.setAttribute('aria-label', `Configure ${section.id} section`);
  configure.textContent = '⚙';
  heading.appendChild(configure);
  configure.addEventListener('click', () => openConfig(section.id));
  pencil.addEventListener('click', () => {
    const isEditing = pencil.classList.toggle('editing');
    pencil.textContent = isEditing ? '✓' : '✎';
    editableFor(section).forEach(field => {
      field.contentEditable = isEditing;
      field.classList.toggle('inline-editing', isEditing);
    });
  });
});

const hero = $('.hero');
const heroActions = document.createElement('div');
heroActions.className = 'hero-actions';
heroActions.innerHTML = '<button class="section-edit" type="button" aria-label="Edit overview">✎</button><button class="section-config" type="button" aria-label="Configure overview">⚙</button>';
hero.appendChild(heroActions);
const heroEditable = [hero.querySelector('h1'), hero.querySelector('.hero-sub'), hero.querySelector('.hero-badge strong')];
heroActions.querySelector('.section-edit').addEventListener('click', event => {
  const editing = event.currentTarget.classList.toggle('editing');
  event.currentTarget.textContent = editing ? '✓' : '✎';
  heroEditable.forEach(field => { field.contentEditable = editing; field.classList.toggle('inline-editing', editing); });
});
heroActions.querySelector('.section-config').addEventListener('click', () => openConfig('overview'));

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

$('#shareButton').addEventListener('click', async () => {
  const shareUrl = `${window.location.href.split('#')[0]}#view=${encodeURIComponent($('#storeName').textContent.trim())}`;
  try { await navigator.clipboard.writeText(shareUrl); } catch { const fallback = document.createElement('textarea'); fallback.value = shareUrl; document.body.appendChild(fallback); fallback.select(); document.execCommand('copy'); fallback.remove(); }
  const toast = $('#toast');
  toast.textContent = 'View-only link copied to clipboard.';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
});
