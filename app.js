const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

if (window.location.hash.startsWith('#view=')) document.body.classList.add('view-only');

const defaults = {
  overview: { siteName: 'Walmart Supercenter #5179', location: 'American Fork, Utah', proposalDate: '2024-08-17', savingsRate: 26.4, co2Factor: 0.72 },
  site: { footprint: 182400, utilitySpend: 312800, annualKwh: 2085333, peakDemand: 1240, openHours: 17, selfConsumption: 92 },
  solar: { arrayKw: 410, productionRatio: 2463, moduleW: 545, warranty: 25, chartHigh: 96, chartLow: 48, chartStd: 18, chartShape: 'Normal bell curve', dataTable: '' },
  storage: { capacityMwh: 1.2, powerKw: 600, shavePct: 19, demandRate: 4.35, dispatchHours: 4, batteryEfficiency: 90 },
  ev: { dcFast: 6, level2: 8, utilization: 31, sessionsPerPortYear: 4200, avgKwh: 18, price: 0.45, networkFee: 0.10, powerCost: 0.16, managementFee: 0.02, co2PerSession: 0.0069 },
  bundles: { critterGuard: 27500, lighting: 41250, hvac: 93193.39, hvacBase: 71687.22, coordination: 0 },
  vpp: { demandResponse: 12000, reservePct: 20, status: 'Subject to utility approval' },
  investment: { solar: 820000, battery: 235000, ev: 125000, siteImprovements: 110000, incentivePct: 30 },
  economics: { escalation: 3, period: 20, discountRate: 8, annualOpex: 18000, taxBenefitPct: 30 }
};

const state = JSON.parse(localStorage.getItem('bidwise-assumptions') || 'null') || structuredClone(defaults);
const saveState = () => localStorage.setItem('bidwise-assumptions', JSON.stringify(state));
const money = (n, digits = 0) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits })}`;
const compactMoney = (n) => Math.abs(n) >= 1e6 ? `${money(n / 1e6, 2)}M` : `${money(n / 1e3, 1)}K`;
const number = (n, digits = 0) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));

const calc = {
  totalInvestment: () => state.investment.solar + state.investment.battery + state.investment.ev + state.investment.siteImprovements,
  solarMwh: () => state.solar.arrayKw * state.solar.productionRatio / 1000,
  co2AvoidedSolar: () => calc.solarMwh() * state.overview.co2Factor,
  modules: () => Math.ceil(state.solar.arrayKw * 1000 / state.solar.moduleW),
  solarSavings: () => state.site.utilitySpend * state.overview.savingsRate / 100,
  postPeak: () => state.site.peakDemand * (1 - state.storage.shavePct / 100),
  demandSavings: () => (state.site.peakDemand - calc.postPeak()) * state.storage.demandRate * 12,
  evPorts: () => state.ev.dcFast + state.ev.level2,
  sessions: () => calc.evPorts() * state.ev.utilization / 100 * state.ev.sessionsPerPortYear,
  netKwhMargin: () => state.ev.price - state.ev.networkFee - state.ev.powerCost - state.ev.managementFee,
  evRevenue: () => calc.sessions() * state.ev.avgKwh * calc.netKwhMargin(),
  evCo2: () => calc.sessions() * state.ev.co2PerSession,
  year1Benefit: () => calc.solarSavings() + calc.demandSavings() + calc.evRevenue() + state.vpp.demandResponse,
  netInvestment: () => calc.totalInvestment() * (1 - state.economics.taxBenefitPct / 100),
  cumulativeBenefit: () => Array.from({ length: Math.max(1, Math.round(state.economics.period)) }, (_, i) => calc.year1Benefit() * Math.pow(1 + state.economics.escalation / 100, i) - state.economics.annualOpex).reduce((a, b) => a + b, 0),
  netValue: () => calc.cumulativeBenefit() - calc.netInvestment(),
  payback: () => calc.netInvestment() / Math.max(1, calc.year1Benefit() - state.economics.annualOpex),
  roi: () => (calc.netValue() / Math.max(1, calc.netInvestment())) * 100
};

const configSchemas = {
  overview: { title: 'Overview', fields: [
    ['siteName', 'Customer / site name', 'text'], ['location', 'Location', 'text'], ['proposalDate', 'Proposal date', 'date'],
    ['savingsRate', 'Utility savings assumption (%)', 'number'], ['co2Factor', 'CO2 factor (t/MWh)', 'number']
  ], formulas: [
    ['Year 1 utility savings', 'Annual utility spend × savings rate', () => money(calc.solarSavings())],
    ['Project investment', 'Solar + battery + EV + site improvements', () => compactMoney(calc.totalInvestment())],
    ['Solar CO2 avoided', 'Annual production × CO2 factor', () => `${number(calc.co2AvoidedSolar(), 0)} t / yr`]
  ] },
  site: { title: 'Site snapshot', fields: [
    ['footprint', 'Store footprint (sq ft)', 'number'], ['utilitySpend', 'Annual utility spend ($)', 'number'], ['annualKwh', 'Annual consumption (kWh)', 'number'],
    ['peakDemand', 'Peak demand (kW)', 'number'], ['openHours', 'Open hours per day', 'number'], ['selfConsumption', 'Solar self-consumption (%)', 'number']
  ], formulas: [
    ['Monthly utility bill', 'Annual utility spend ÷ 12', () => money(state.site.utilitySpend / 12)],
    ['Solar consumed behind meter', 'Solar production × self-consumption', () => `${number(calc.solarMwh() * state.site.selfConsumption / 100, 0)} MWh / yr`]
  ] },
  solar: { title: 'Solar array', fields: [
    ['arrayKw', 'Array size (kW DC)', 'number'], ['productionRatio', 'Production ratio (kWh/kW-year)', 'number'], ['moduleW', 'Module rating (W)', 'number'], ['warranty', 'Module warranty (years)', 'number'],
    ['chartHigh', 'Chart high (%)', 'number'], ['chartLow', 'Chart low (%)', 'number'], ['chartStd', 'Standard deviation', 'number'], ['chartShape', 'Seasonal shape', 'select', ['Normal bell curve', 'Two humps', 'Flat summer peak']], ['dataTable', 'Advanced chart data (CSV)', 'textarea']
  ], formulas: [
    ['Annual production', 'Array kW × production ratio ÷ 1,000', () => `${number(calc.solarMwh(), 0)} MWh / yr`],
    ['Module count', 'CEILING(array kW × 1,000 ÷ module watts)', () => `${number(calc.modules())} modules`],
    ['Annual energy offset', 'Annual production × 1,000 ÷ annual consumption', () => `${number(calc.solarMwh() * 1000 / Math.max(1, state.site.annualKwh) * 100, 1)}%`]
  ] },
  storage: { title: 'Battery storage', fields: [
    ['capacityMwh', 'Battery capacity (MWh)', 'number'], ['powerKw', 'Power rating (kW)', 'number'], ['shavePct', 'Peak shaving target (%)', 'number'],
    ['demandRate', 'Demand charge ($/kW-month)', 'number'], ['dispatchHours', 'Dispatch duration (hours)', 'number'], ['batteryEfficiency', 'Round-trip efficiency (%)', 'number']
  ], formulas: [
    ['Post-battery peak', 'Peak demand × (1 − shaving target)', () => `${number(calc.postPeak())} kW`],
    ['Annual demand-charge savings', '(Peak demand − post-battery peak) × demand rate × 12', () => money(calc.demandSavings())],
    ['Usable storage', 'Capacity × round-trip efficiency', () => `${number(state.storage.capacityMwh * state.storage.batteryEfficiency / 100, 2)} MWh`]
  ] },
  ev: { title: 'EV charging', fields: [
    ['dcFast', 'DC fast chargers', 'number'], ['level2', 'Level 2 chargers', 'number'], ['utilization', 'Year 1 utilization (%)', 'number'], ['sessionsPerPortYear', 'Sessions per port at 100% utilization', 'number'],
    ['avgKwh', 'Average energy per session (kWh)', 'number'], ['price', 'Customer charging price ($/kWh)', 'number'], ['networkFee', 'Network fee ($/kWh)', 'number'], ['powerCost', 'Utility power cost ($/kWh)', 'number'], ['managementFee', 'Management fee ($/kWh)', 'number'], ['co2PerSession', 'CO2 avoided per session (t)', 'number']
  ], formulas: [
    ['Annual sessions', 'DC + L2 ports × utilization × sessions per port', () => number(calc.sessions())],
    ['Net margin / kWh', 'Price − network fee − power cost − management fee', () => money(calc.netKwhMargin(), 2)],
    ['Annual charging revenue', 'Sessions × average kWh × net margin', () => money(calc.evRevenue())],
    ['CO2 avoided', 'Annual sessions × CO2 per session', () => `${number(calc.evCo2(), 0)} t / yr`]
  ] },
  bundles: { title: 'Bundled scopes', fields: [
    ['critterGuard', 'Critter guard investment ($)', 'number'], ['lighting', 'Permanent lighting investment ($)', 'number'], ['hvac', 'HVAC investment ($)', 'number'], ['hvacBase', 'HVAC contractor base cost ($)', 'number'], ['coordination', 'Project coordination ($)', 'number']
  ], formulas: [
    ['HVAC coordination / margin', 'HVAC investment − HVAC contractor base cost', () => money(state.bundles.hvac - state.bundles.hvacBase)],
    ['Bundled site improvements', 'Critter guard + lighting + HVAC + coordination', () => money(state.bundles.critterGuard + state.bundles.lighting + state.bundles.hvac + state.bundles.coordination)]
  ] },
  vpp: { title: 'Grid partnership', fields: [['demandResponse', 'Demand response value / year ($)', 'number'], ['reservePct', 'Reserve requirement (%)', 'number'], ['status', 'Program status', 'text']], formulas: [['Available dispatch reserve', 'Battery power × (1 − reserve requirement)', () => `${number(state.storage.powerKw * (1 - state.vpp.reservePct / 100))} kW`]] },
  investment: { title: 'Investment', fields: [['solar', 'Solar investment ($)', 'number'], ['battery', 'Battery investment ($)', 'number'], ['ev', 'EV investment ($)', 'number'], ['siteImprovements', 'Site improvements ($)', 'number'], ['incentivePct', 'Illustrative incentive (%)', 'number']], formulas: [['Gross investment', 'Solar + battery + EV + site improvements', () => money(calc.totalInvestment())], ['Potential incentive', 'Gross investment × incentive rate', () => money(calc.totalInvestment() * state.investment.incentivePct / 100)], ['Illustrative net cost', 'Gross investment − potential incentive', () => money(calc.totalInvestment() * (1 - state.investment.incentivePct / 100))]] },
  economics: { title: 'Economics', fields: [['escalation', 'Annual savings escalation (%)', 'number'], ['period', 'Analysis period (years)', 'number'], ['discountRate', 'Discount rate (%)', 'number'], ['annualOpex', 'Annual operating cost ($)', 'number'], ['taxBenefitPct', 'Tax / incentive assumption (%)', 'number']], formulas: [['Year 1 benefit', 'Solar savings + demand savings + EV revenue + VPP value', () => money(calc.year1Benefit())], ['Cumulative benefit', 'SUM(year 1 benefit × (1 + escalation)^year) − annual operating costs', () => money(calc.cumulativeBenefit())], ['Net value', 'Cumulative benefit − illustrative net investment', () => money(calc.netValue())], ['Simple payback', 'Illustrative net investment ÷ annual benefit after OPEX', () => `${number(calc.payback(), 1)} years`], ['ROI', 'Net value ÷ illustrative net investment', () => `${number(calc.roi(), 1)}%`]] }
};

function formulaMarkup(schema) {
  return schema.formulas?.length ? `<div class="formula-box"><div class="formula-title">CALCULATED OUTPUTS</div>${schema.formulas.map(([label, formula, value]) => `<div class="formula-row"><span><b>${esc(label)}</b><small>${esc(formula)}</small></span><strong>${esc(value())}</strong></div>`).join('')}</div>` : '';
}

function fieldMarkup([key, label, type, options]) {
  const value = state[activeConfigSection][key] ?? '';
  if (type === 'textarea') return `<label class="config-field"><span>${esc(label)}</span><textarea data-key="${key}" rows="7" placeholder="Month,Value\nJAN,48\nFEB,55">${esc(value)}</textarea></label>`;
  if (type === 'select') return `<label class="config-field"><span>${esc(label)}</span><select data-key="${key}">${options.map(option => `<option ${option === value ? 'selected' : ''}>${esc(option)}</option>`).join('')}</select></label>`;
  return `<label class="config-field"><span>${esc(label)}</span><input data-key="${key}" type="${type}" value="${esc(value)}" /></label>`;
}

const configPanel = $('#configPanel');
const configBackdrop = $('#configBackdrop');
const configTitle = $('#configTitle');
const configBody = $('#configBody');
let activeConfigSection = 'overview';

function refreshFormulaBox() { const box = $('.formula-box'); if (box) box.outerHTML = formulaMarkup(configSchemas[activeConfigSection]); }
function openConfig(sectionId) {
  activeConfigSection = sectionId;
  const schema = configSchemas[sectionId] || configSchemas.overview;
  configTitle.textContent = schema.title;
  configBody.innerHTML = `<div class="config-input-title">INDEPENDENT INPUTS <small>Only these values are editable.</small></div>${schema.fields.map(fieldMarkup).join('')}${formulaMarkup(schema)}<label class="config-field config-file-field"><span>Visual replacement image</span><input class="config-file" type="file" accept="image/png,image/jpeg,image/webp" /></label><div class="config-help"><span>i</span><p>Derived outputs are read-only. Change an input and apply to recalculate this section and connected sections.</p></div>`;
  configBody.querySelectorAll('[data-key]').forEach(input => input.addEventListener('input', () => { const key = input.dataset.key; state[activeConfigSection][key] = input.type === 'number' ? Number(input.value) : input.value; refreshFormulaBox(); }));
  configBody.querySelector('.config-file')?.addEventListener('change', event => handleImageUpload(event.target.files[0], sectionId));
  configPanel.classList.add('open'); configBackdrop.classList.add('open');
}

function handleImageUpload(file, sectionId) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader(); reader.onload = () => { localStorage.setItem(`bidwise-image-${sectionId}`, reader.result); applyImage(sectionId, reader.result); }; reader.readAsDataURL(file);
}
function visualTarget(sectionId) { return { overview: $('.hero-art'), site: $('.map-card'), solar: $('.chart-panel'), storage: $('.battery-visual'), ev: $('.ev-illustration'), bundles: $('#bundles .bundle-card'), vpp: $('.vpp-flow'), investment: $('.incentive-card'), economics: $('.economics-card') }[sectionId]; }
function applyImage(sectionId, imageUrl) { const target = visualTarget(sectionId); if (target) { target.style.backgroundImage = `linear-gradient(#0b1f3333,#0b1f3333), url("${imageUrl}")`; target.style.backgroundSize = 'cover'; target.style.backgroundPosition = 'center'; } }
Object.keys(configSchemas).forEach(sectionId => { const imageUrl = localStorage.getItem(`bidwise-image-${sectionId}`); if (imageUrl) applyImage(sectionId, imageUrl); });
function closeConfig() { configPanel.classList.remove('open'); configBackdrop.classList.remove('open'); }
$('#closeConfig').addEventListener('click', closeConfig); configBackdrop.addEventListener('click', closeConfig);

function seasonalBars() {
  const high = Math.max(1, Number(state.solar.chartHigh)); const low = Math.min(high, Number(state.solar.chartLow)); const mid = (high + low) / 2;
  if (state.solar.dataTable.trim()) {
    const rows = state.solar.dataTable.trim().split(/\n/).slice(1).map(row => row.split(/[,\t]/).map(item => item.trim())).filter(row => row.length >= 2 && Number.isFinite(Number(row[1])));
    if (rows.length >= 2) return rows.map(row => ({ label: row[0], value: Number(row[1]) }));
  }
  return Array.from({ length: 12 }, (_, i) => { const angle = (i / 11) * Math.PI; let value = low + (high - low) * Math.sin(angle); if (state.solar.chartShape === 'Two humps') value = low + (high - low) * (0.5 + 0.5 * Math.pow(Math.sin(angle * 2), 2)); if (state.solar.chartShape === 'Flat summer peak') value = i >= 4 && i <= 8 ? high : mid; return { label: ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][i], value }; });
}
function renderSolarChart() { const data = seasonalBars(); $('#solarChart').innerHTML = data.map(row => `<i style="height:${Math.max(8, Math.min(100, row.value))}%" title="${esc(row.label)} ${number(row.value, 1)}"></i>`).join(''); }

function setText(selector, value) { const node = $(selector); if (node) node.textContent = value; }
function renderReport() {
  renderSolarChart();
  setText('#storeName', state.overview.siteName); setText('#site .map-label', `${state.overview.location.toUpperCase()} `); setText('#yearSavings', compactMoney(calc.solarSavings())); setText('#totalInvestment', compactMoney(calc.totalInvestment())); setText('#payback', `${number(calc.payback(), 1)} yrs`); const co2Metric = $('#overview .metric-card:nth-child(4) .metric-value'); if (co2Metric) co2Metric.innerHTML = `${number(calc.co2AvoidedSolar(), 0)} <small>t/yr</small>`;
  const footprint = $('#site .fact-row:nth-child(1) strong'); if (footprint) footprint.innerHTML = `${number(state.site.footprint)} <small>sq ft</small>`;
  const spend = $('#site .fact-row:nth-child(2) strong'); if (spend) spend.innerHTML = `${money(state.site.utilitySpend)} <small>/ yr</small>`;
  const peak = $('#site .fact-row:nth-child(3) strong'); if (peak) peak.innerHTML = `${number(state.site.peakDemand)} <small>kW</small>`;
  const fitCallout = $('#site .fact-callout p'); if (fitCallout) fitCallout.textContent = `${number(state.site.selfConsumption)}% of projected solar production is consumed behind the meter.`;
  setText('#solar .chart-top strong', `${number(calc.solarMwh(), 0)} MWh first year`); setText('#solar .solar-detail h3', `${number(state.solar.arrayKw)} kW DC rooftop array`); setText('#solar .solar-detail .detail-specs span:nth-child(1) b', number(calc.modules())); setText('#solar .solar-detail .detail-specs span:nth-child(2) b', number(calc.solarMwh(), 0)); setText('#solar .solar-detail .detail-specs span:nth-child(3) b', number(state.solar.warranty));
  setText('#storage .battery-copy h3', `${number(state.storage.capacityMwh, 1)} MWh / ${number(state.storage.powerKw)} kW`); setText('#storage .dispatch-footer strong', `− ${number(state.storage.shavePct)}% peak demand`); setText('#storage .peak-marker span', `${number(state.site.peakDemand)} kW`);
  setText('#ev .ev-card-foot strong', `${number(state.ev.dcFast)} × DC fast + ${number(state.ev.level2)} × L2`); setText('#ev .utilization b', `${number(state.ev.utilization)}%`); const progress = $('#ev .progress i'); if (progress) progress.style.width = `${state.ev.utilization}%`; setText('#ev .ev-stats > div:nth-child(1) strong', number(calc.sessions())); setText('#ev .ev-stats > div:nth-child(2) strong', compactMoney(calc.evRevenue())); setText('#ev .ev-stats > div:nth-child(3) strong', `${number(calc.evCo2(), 0)} t`);
  const bundleValues = [state.bundles.critterGuard, state.bundles.lighting, state.bundles.hvac]; bundleValues.forEach((value, i) => setText(`#bundles .bundle-card:nth-child(${i + 1}) strong`, money(value)));
  setText('#investment .investment-row:nth-child(2) strong', money(state.investment.solar)); setText('#investment .investment-row:nth-child(3) strong', money(state.investment.battery)); setText('#investment .investment-row:nth-child(4) strong', money(state.investment.ev)); setText('#investment .investment-row:nth-child(5) strong', money(state.investment.siteImprovements)); setText('#investment .investment-row.total strong', money(calc.totalInvestment())); setText('#investment .incentive-card>strong', `Up to ${number(state.investment.incentivePct)}%`); const incentive = $('#investment .incentive-bar i'); if (incentive) incentive.style.width = `${Math.min(100, state.investment.incentivePct)}%`;
  setText('#economics .economics-summary strong', compactMoney(calc.netValue())); setText('#economics .roi-chip', `${number(calc.roi(), 1)}% ROI`);
  renderAuditBlocks(); saveState();
}

function renderAuditBlocks() {
  const blocks = {
    site: `<div class="audit-grid"><div><b>Utility baseline</b><span>${money(state.site.utilitySpend / 12)} / month · ${number(state.site.annualKwh)} kWh / year</span></div><div><b>Cost of doing nothing</b><span>${money(state.site.utilitySpend)} annual utility spend at current rates</span></div><div><b>Solar offset</b><span>${number(calc.solarMwh() * 1000 / Math.max(1, state.site.annualKwh) * 100, 1)}% of annual consumption</span></div></div>`,
    storage: `<div class="audit-grid"><div><b>Demand-charge value</b><span>${money(state.storage.demandRate)} / kW-month × 12 months</span></div><div><b>Load result</b><span>${number(state.site.peakDemand)} kW → ${number(calc.postPeak())} kW modeled peak</span></div><div><b>Battery reserve</b><span>${number(state.vpp.reservePct)}% held for resilience / VPP requirements</span></div></div>`,
    ev: `<div class="audit-grid"><div><b>Charging scenarios</b><span>Conservative ${number(calc.sessions() * .7)} · Base ${number(calc.sessions())} · Strong ${number(calc.sessions() * 1.3)}</span></div><div><b>Per-session economics</b><span>${number(state.ev.avgKwh)} kWh × ${money(calc.netKwhMargin(), 2)} net margin</span></div><div><b>Retail opportunity</b><span>Use this section's annual sessions as the foot-traffic driver</span></div></div>`,
    economics: `<div class="audit-grid"><div><b>Year 1 benefit</b><span>${money(calc.year1Benefit())} before operating costs</span></div><div><b>Illustrative net cost</b><span>${money(calc.netInvestment())} after ${number(state.economics.taxBenefitPct)}% incentive assumption</span></div><div><b>20-year cumulative benefit</b><span>${money(calc.cumulativeBenefit())} before net-cost subtraction</span></div></div>`
  };
  Object.entries(blocks).forEach(([id, html]) => { const section = $(`#${id}`); if (!section) return; let node = section.querySelector('.audit-grid'); if (!node) { const wrapper = document.createElement('div'); wrapper.innerHTML = html; section.appendChild(wrapper.firstElementChild); } else node.outerHTML = html; });
}

$('#applyConfig').addEventListener('click', () => { renderReport(); closeConfig(); });

const editableFor = (section) => $$(`#${section.id} h2, #${section.id} .heading-note, #${section.id} h3, #${section.id} .bundle-card p, #${section.id} .bundle-card strong, #${section.id} .fact-row strong, #${section.id} .detail-specs b, #${section.id} .ev-stats strong, #${section.id} .investment-row strong`);
function addSectionControls(section, sectionId) {
  const heading = section.querySelector('.section-heading'); if (!heading) return;
  const controls = document.createElement('div'); controls.className = 'section-controls'; controls.innerHTML = `<button class="section-edit" type="button" aria-label="Edit ${sectionId} section"><span>✎</span><b>Edit</b></button><button class="section-config" type="button" aria-label="Configure ${sectionId} section"><span>⚙</span><b>Configure</b></button>`; heading.appendChild(controls);
  const pencil = controls.querySelector('.section-edit'); pencil.addEventListener('click', () => { const editing = pencil.classList.toggle('editing'); pencil.querySelector('span').textContent = editing ? '✓' : '✎'; editableFor(section).forEach(field => { field.contentEditable = editing; field.classList.toggle('inline-editing', editing); }); });
  controls.querySelector('.section-config').addEventListener('click', () => openConfig(sectionId));
}
$$('.content-section').forEach(section => addSectionControls(section, section.id));
const hero = $('.hero'); const heroActions = document.createElement('div'); heroActions.className = 'hero-actions'; heroActions.innerHTML = '<button class="section-edit" type="button" aria-label="Edit overview"><span>✎</span><b>Edit</b></button><button class="section-config" type="button" aria-label="Configure overview"><span>⚙</span><b>Configure</b></button>'; hero.appendChild(heroActions);
heroActions.querySelector('.section-edit').addEventListener('click', event => { const editing = event.currentTarget.classList.toggle('editing'); event.currentTarget.querySelector('span').textContent = editing ? '✓' : '✎'; [hero.querySelector('h1'), hero.querySelector('.hero-sub'), hero.querySelector('.hero-badge strong')].forEach(field => { field.contentEditable = editing; field.classList.toggle('inline-editing', editing); }); });
heroActions.querySelector('.section-config').addEventListener('click', () => openConfig('overview'));

$$('.nav-item').forEach(item => item.addEventListener('click', () => { document.getElementById(item.dataset.target).scrollIntoView({ behavior: 'smooth', block: 'start' }); $$('.nav-item').forEach(nav => nav.classList.toggle('active', nav === item)); }));
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { const current = $(`.nav-item[data-target="${entry.target.id}"]`); if (current) $$('.nav-item').forEach(nav => nav.classList.toggle('active', nav === current)); } }), { rootMargin: '-25% 0px -65% 0px' });
$$('.section-anchor').forEach(section => observer.observe(section));

const siteInput = $('#siteInput'); if (siteInput) { siteInput.value = state.overview.siteName; siteInput.addEventListener('input', event => { state.overview.siteName = event.target.value; renderReport(); }); }
const utilityInput = $('#utilityInput'); if (utilityInput) { utilityInput.value = state.site.utilitySpend; utilityInput.addEventListener('input', event => { state.site.utilitySpend = Number(event.target.value.replace(/[^0-9]/g, '')) || 0; renderReport(); }); }
$$('.scope-toggle').forEach(toggle => toggle.addEventListener('change', () => { const section = document.getElementById(toggle.dataset.scope); const nav = $(`.nav-item[data-target="${toggle.dataset.scope}"]`); if (section) section.classList.toggle('scope-off', !toggle.checked); if (nav) nav.classList.toggle('scope-off', !toggle.checked); }));
$$('.segmented button').forEach(button => button.addEventListener('click', () => { $$('.segmented button').forEach(item => item.classList.remove('selected')); button.classList.add('selected'); }));
$('#shareButton').addEventListener('click', async () => { const shareUrl = `${window.location.href.split('#')[0]}#view=${encodeURIComponent($('#storeName').textContent.trim())}`; try { await navigator.clipboard.writeText(shareUrl); } catch { const fallback = document.createElement('textarea'); fallback.value = shareUrl; document.body.appendChild(fallback); fallback.select(); document.execCommand('copy'); fallback.remove(); } const toast = $('#toast'); toast.textContent = 'View-only link copied to clipboard.'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3200); });

renderReport();
