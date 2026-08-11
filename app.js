const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const themeLink = document.createElement('link'); themeLink.rel = 'stylesheet'; themeLink.href = 'styles.css?v=sliders-20260811a'; document.head.appendChild(themeLink);

if (window.location.hash.startsWith('#view=')) document.body.classList.add('view-only');

const defaults = {
  overview: { siteName: 'Kneaders Bakery & Cafe', location: '1960 State Street, Orem, Utah 84057', proposalDate: '2026-08-07', status: 'Prepared', savingsRate: 90, co2Factor: 0.72 },
  site: { footprint: 4200, utilitySpend: 48000, annualKwh: 320000, peakDemand: 165, openHours: 14, selfConsumption: 92, provider: 'Rocky Mountain Power', tariff: 'Commercial GS-2', energyRate: 0.15, demandRate: 4.35, exportRate: 0.06, onsiteValue: 0.15, latitude: 40.333002, longitude: -111.712338, mapRadius: 5 },
  solar: { arrayKw: 410, productionRatio: 2463, moduleW: 545, warranty: 25, manufacturer: 'Bifacial Solar Co.', model: 'BH-545-M10', installation: 'Fixed-tilt rooftop', chartHigh: 96, chartLow: 48, chartStd: 18, chartShape: 'Normal bell curve', dataTable: '' },
  storage: { capacityMwh: 1.2, powerKw: 600, shavePct: 19, dispatchHours: 4, batteryEfficiency: 90, manufacturer: 'Torus', model: 'Torus Spin', ratedCapacity: 1.2, investment: 235000, controls: 'Hybrid controller + secure monitoring' },
  ev: { dcFast: 6, level2: 8, utilization: 15.5, sessionsPerPortYear: 4200, avgKwh: 26.5, price: 0.47, networkFee: 0.10, powerCost: 0.15, managementFee: 0.02, co2PerSession: 0.0191, compatibility: 'NACS + CCS1', layout: '4 roadside + 4 drive-through', contribution: 125000, profitShare: 100, avgStoreSpend: 15.50, conversion: 50, maxKw: 400, posts: 8, cabinet: 'Shared-power 400 kW cabinet', observedCharges3m: 25114, observedStations: 12, observedPorts: 59, sourceWindow: '2026-05-10 to 2026-08-02 · 13 weekly observations' },
  bundles: { critterGuard: 27500, lighting: 41250, hvac: 93193.39, hvacBase: 71687.22, coordination: 0 },
  vpp: { demandResponse: 12000, reservePct: 20, status: 'Subject to utility approval', controls: 'Secure dispatch + monitoring', customerValue: 'Peak management, resilience, bill control', utilityValue: 'Local capacity and summer peak support', workPlan: 'Metering → cybersecurity → dispatch testing → agreement' },
  investment: { solar: 820000, solarModules: 139400, solarInverters: 86600, solarRacking: 93600, solarBos: 131700, solarLabor: 255800, solarEngineering: 62300, solarCommissioning: 50600, battery: 235000, ev: 125000, siteImprovements: 110000, incentivePct: 30, ownership: 'Customer-owned', placedInService: 'Year 1', taxAdvisor: 'Tax professional / incentive review' },
  economics: { escalation: 3, period: 20, discountRate: 8, annualOpex: 18000, taxBenefitPct: 30 },
  layout: { mapZoom: 19, defaultLineColor: '#ff5b68', designNote: 'Verify stall dimensions, ADA clearances, utility locate, and final trench depth in construction documents.' }
};

const bidProfiles = {
  'kneaders-orem': { label: 'Kneaders Bakery & Cafe', locationLabel: 'OREM, UT', scopes: { solar: true, storage: true, ev: true }, overrides: {} },
  'maverick-lehi-solar': { label: 'Maverik · Lehi solar', locationLabel: 'LEHI, UT', scopes: { solar: true, storage: false, ev: false }, overrides: { overview: { siteName: 'Maverik #412', location: '760 E Main Street, Lehi, Utah 84043', proposalDate: '2026-08-10', savingsRate: 24.1 }, site: { footprint: 5200, utilitySpend: 62000, annualKwh: 412000, peakDemand: 220, latitude: 40.391617, longitude: -111.849055, mapRadius: 4 }, solar: { arrayKw: 185, productionRatio: 2463, moduleW: 545, installation: 'Fixed-tilt rooftop', manufacturer: 'Bifacial Solar Co.', model: 'BH-545-M10' }, storage: { capacityMwh: 0, powerKw: 0, shavePct: 0, dispatchHours: 0, investment: 0 }, ev: { dcFast: 0, level2: 0 }, vpp: { demandResponse: 0, reservePct: 0 }, investment: { solar: 415000, battery: 0, ev: 0, siteImprovements: 42000 } } },
  'target-lehi-solar-battery': { label: 'Target · Lehi solar + battery', locationLabel: 'LEHI, UT', scopes: { solar: true, storage: true, ev: false }, overrides: { overview: { siteName: 'Target Store #2234', location: '1250 E Timpanogos Highway, Lehi, Utah 84043', proposalDate: '2026-08-10', savingsRate: 25.7 }, site: { footprint: 128000, utilitySpend: 98000, annualKwh: 650000, peakDemand: 310, latitude: 40.416170, longitude: -111.848840, mapRadius: 4 }, solar: { arrayKw: 210, productionRatio: 2463, moduleW: 545, installation: 'Fixed-tilt rooftop', manufacturer: 'Bifacial Solar Co.', model: 'BH-545-M10' }, storage: { capacityMwh: 0.8, powerKw: 400, shavePct: 22, dispatchHours: 2, investment: 168000 }, ev: { dcFast: 0, level2: 0 }, investment: { solar: 472000, battery: 168000, ev: 0, siteImprovements: 65000 } } }
};
const routeParams = new URLSearchParams(window.location.search);
const activeBidId = bidProfiles[routeParams.get('bid')] ? routeParams.get('bid') : null;
const activeBid = bidProfiles[activeBidId || 'kneaders-orem'];
document.body.classList.toggle('home-mode', !activeBidId);
const bidDefaults = Object.fromEntries(Object.entries(defaults).map(([section, values]) => [section, { ...values, ...(activeBid.overrides[section] || {}) }]));
const savedState = JSON.parse(localStorage.getItem('bidwise-assumptions') || 'null');
const importedSource = activeBidId === 'kneaders-orem' ? 'kneaders-orem-ev-demand-20260802' : `bid-${activeBidId}`;
const reusableState = activeBidId === 'kneaders-orem' && savedState?.meta?.source === importedSource ? savedState : null;
const state = Object.fromEntries(Object.entries(bidDefaults).map(([section, values]) => [section, { ...values, ...(reusableState?.[section] || {}) }]));
if (activeBidId) state.overview.savingsRate = 90;
if (activeBidId === 'maverick-lehi-solar') state.economics.annualOpex = 5200;
if (activeBidId === 'target-lehi-solar-battery') state.economics.annualOpex = 8100;
state.meta = { source: importedSource, bidId: activeBidId || 'home' };
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
  solarSavings: () => {
    const productionMwh = calc.solarMwh();
    const onsiteMwh = Math.min(productionMwh * state.site.selfConsumption / 100, state.site.annualKwh / 1000);
    const exportedMwh = Math.max(0, productionMwh - onsiteMwh);
    const grossValue = onsiteMwh * 1000 * state.site.onsiteValue + exportedMwh * 1000 * state.site.exportRate;
    return Math.min(state.site.utilitySpend, grossValue * state.overview.savingsRate / 100);
  },
  proposedBill: () => Math.max(0, state.site.utilitySpend - calc.solarSavings() - calc.demandSavings()),
  postPeak: () => state.site.peakDemand * (1 - state.storage.shavePct / 100),
  demandSavings: () => (state.site.peakDemand - calc.postPeak()) * state.site.demandRate * 12,
  evPorts: () => state.ev.dcFast + state.ev.level2,
  observedAnnualCharges: () => state.ev.observedCharges3m * 4,
  sessions: () => calc.evPorts() * state.ev.utilization / 100 * state.ev.sessionsPerPortYear,
  netKwhMargin: () => state.ev.price - state.ev.networkFee - state.ev.powerCost - state.ev.managementFee,
  evRevenue: () => calc.sessions() * state.ev.avgKwh * calc.netKwhMargin(),
  evCo2: () => calc.sessions() * state.ev.co2PerSession,
  year1Benefit: () => calc.solarSavings() + calc.demandSavings() + calc.evRevenue() + state.vpp.demandResponse,
  netInvestment: () => calc.totalInvestment() * (1 - state.economics.taxBenefitPct / 100),
  cumulativeBenefit: () => Array.from({ length: Math.max(1, Math.round(state.economics.period)) }, (_, i) => calc.year1Benefit() * Math.pow(1 + state.economics.escalation / 100, i) - state.economics.annualOpex).reduce((a, b) => a + b, 0),
  netValue: () => calc.cumulativeBenefit() - calc.netInvestment(),
  npv: () => Array.from({ length: Math.max(1, Math.round(state.economics.period)) }, (_, i) => (calc.year1Benefit() * Math.pow(1 + state.economics.escalation / 100, i) - state.economics.annualOpex) / Math.pow(1 + state.economics.discountRate / 100, i + 1)).reduce((a, b) => a + b, 0) - calc.netInvestment(),
  payback: () => {
    const annualNetBenefit = calc.year1Benefit() - state.economics.annualOpex;
    return annualNetBenefit > 0 ? calc.netInvestment() / annualNetBenefit : null;
  },
  roi: () => (calc.netValue() / Math.max(1, calc.netInvestment())) * 100
};

// Imported from the workbook's Metadata + Weekly tabs: unique nearby station locations and their observed 3-month demand.
const demandStations = [
  { name: 'Orem, UT - Tesla Supercharger', network: 'Tesla', lat: 40.272608, lon: -111.704992, ports: 8, charges: 18713 },
  { name: 'RMP Midtown 360 (Orem, UT)', network: 'Rocky Mountain Power', lat: 40.292770, lon: -111.693440, ports: 4, charges: 2411 },
  { name: 'WinCo Foods - Tesla Supercharger', network: 'Tesla', lat: 40.312900, lon: -111.721024, ports: 16, charges: 1210 },
  { name: 'CC Station1 Orem City DC 4', network: 'ChargePoint', lat: 40.297465, lon: -111.693144, ports: 1, charges: 1020 },
  { name: 'Unique Auto Body - DCFC', network: 'Blink', lat: 40.372490, lon: -111.785045, ports: 4, charges: 562 },
  { name: 'Walmart EV Charging - Lindon', network: 'Walmart', lat: 40.348499, lon: -111.731817, ports: 8, charges: 411 },
  { name: 'Walmart EV Charging - Orem', network: 'Walmart', lat: 40.272656, lon: -111.710217, ports: 8, charges: 397 },
  { name: 'Murdock Lindon Hyundai F2', network: 'ChargePoint', lat: 40.328821, lon: -111.731898, ports: 1, charges: 288 },
  { name: 'Murdock Genesis Sales South', network: 'ChargePoint', lat: 40.329342, lon: -111.733807, ports: 1, charges: 90 },
  { name: 'AF Ford Power Link 1', network: 'ChargePoint', lat: 40.357198, lon: -111.783924, ports: 2, charges: 12 },
  { name: 'Ken Garff Nissan - Orem', network: 'ChargePoint', lat: 40.273330, lon: -111.702080, ports: 1, charges: 0 },
  { name: 'Doug Smith Kia', network: 'ChargePoint', lat: 40.329843, lon: -111.730039, ports: 5, charges: 0 }
];

const regionalEvBenchmark = { location: 'St. George, UT', ports: 53, stations: 9, charges3m: 39210, utilization: 18.3, avgKwh: 26.8, sourceWindow: '2026-05-07 to 2026-08-02 · 88 daily observations' };

const configSchemas = {
  overview: { title: 'Overview', fields: [
    ['siteName', 'Customer / site name', 'text'], ['location', 'Location', 'text'], ['proposalDate', 'Proposal date', 'date'], ['status', 'Proposal status', 'text'],
    ['savingsRate', 'Solar savings realization (%)', 'number'], ['co2Factor', 'CO2 factor (t/MWh)', 'number']
  ], formulas: [
    ['Year 1 utility savings', 'Annual utility spend × savings rate', () => money(calc.solarSavings())],
    ['Project investment', 'Solar + battery + EV + site improvements', () => compactMoney(calc.totalInvestment())],
    ['Solar CO2 avoided', 'Annual production × CO2 factor', () => `${number(calc.co2AvoidedSolar(), 0)} t / yr`]
  ] },
  site: { title: 'Site snapshot', fields: [
    ['footprint', 'Store footprint (sq ft)', 'number'], ['utilitySpend', 'Annual utility spend ($)', 'number'], ['annualKwh', 'Annual consumption (kWh)', 'number'],
    ['peakDemand', 'Peak demand (kW)', 'number'], ['openHours', 'Open hours per day', 'number'], ['selfConsumption', 'Solar self-consumption (%)', 'number'], ['provider', 'Utility provider', 'text'], ['tariff', 'Tariff / rate schedule', 'text'], ['energyRate', 'Energy charge ($/kWh)', 'number'], ['demandRate', 'Demand charge ($/kW-month)', 'number'], ['exportRate', 'Export credit ($/kWh)', 'number'], ['onsiteValue', 'Onsite energy value ($/kWh)', 'number'], ['latitude', 'Map center latitude', 'number'], ['longitude', 'Map center longitude', 'number'], ['mapRadius', 'Demand radius (miles)', 'number']
  ], formulas: [
    ['Monthly utility bill', 'Annual utility spend ÷ 12', () => money(state.site.utilitySpend / 12)],
    ['Solar consumed behind meter', 'Solar production × self-consumption', () => `${number(calc.solarMwh() * state.site.selfConsumption / 100, 0)} MWh / yr`], ['Annual energy charges', 'Annual consumption × energy charge', () => money(state.site.annualKwh * state.site.energyRate)], ['Proposed annual utility bill', 'Current bill − solar savings − demand savings', () => money(calc.proposedBill())], ['Export value spread', 'Onsite energy value − export credit', () => money(state.site.onsiteValue - state.site.exportRate, 2) + ' / kWh']
  ] },
  solar: { title: 'Solar array', fields: [
    ['arrayKw', 'Array size (kW DC)', 'number'], ['productionRatio', 'Production ratio (kWh/kW-year)', 'number'], ['moduleW', 'Module rating (W)', 'number'], ['warranty', 'Module warranty (years)', 'number'], ['manufacturer', 'Module manufacturer', 'text'], ['model', 'Module model', 'text'], ['installation', 'Installation type', 'text'],
    ['chartHigh', 'Chart high (%)', 'number'], ['chartLow', 'Chart low (%)', 'number'], ['chartStd', 'Standard deviation', 'number'], ['chartShape', 'Seasonal shape', 'select', ['Normal bell curve', 'Two humps', 'Flat summer peak']], ['dataTable', 'Advanced chart data (CSV)', 'textarea']
  ], formulas: [
    ['Annual production', 'Array kW × production ratio ÷ 1,000', () => `${number(calc.solarMwh(), 0)} MWh / yr`],
    ['Module count', 'CEILING(array kW × 1,000 ÷ module watts)', () => `${number(calc.modules())} modules`],
    ['Annual energy offset', 'Annual production × 1,000 ÷ annual consumption', () => `${number(calc.solarMwh() * 1000 / Math.max(1, state.site.annualKwh) * 100, 1)}%`]
  ] },
  storage: { title: 'Battery storage', fields: [
    ['capacityMwh', 'Battery capacity (MWh)', 'number'], ['powerKw', 'Power rating (kW)', 'number'], ['shavePct', 'Peak shaving target (%)', 'number'],
    ['dispatchHours', 'Dispatch duration (hours)', 'number'], ['batteryEfficiency', 'Round-trip efficiency (%)', 'number'], ['manufacturer', 'Battery manufacturer', 'text'], ['model', 'Battery model', 'text'], ['ratedCapacity', 'Rated capacity (MWh)', 'number'], ['investment', 'Battery investment ($)', 'number'], ['controls', 'Controls / monitoring', 'text']
  ], formulas: [
    ['Post-battery peak', 'Peak demand × (1 − shaving target)', () => `${number(calc.postPeak())} kW`],
    ['Annual demand-charge savings', '(Peak demand − post-battery peak) × site demand rate × 12', () => money(calc.demandSavings())],
    ['Usable storage', 'Capacity × round-trip efficiency', () => `${number(state.storage.capacityMwh * state.storage.batteryEfficiency / 100, 2)} MWh`]
  ] },
  ev: { title: 'EV charging', fields: [
    ['dcFast', 'DC fast chargers', 'number'], ['level2', 'Level 2 chargers', 'number'], ['utilization', 'Year 1 utilization (%)', 'number'], ['sessionsPerPortYear', 'Sessions per port at 100% utilization', 'number'],
    ['avgKwh', 'Average energy per session (kWh)', 'number'], ['price', 'Customer charging price ($/kWh)', 'number'], ['networkFee', 'Network fee ($/kWh)', 'number'], ['powerCost', 'Utility power cost ($/kWh)', 'number'], ['managementFee', 'Management fee ($/kWh)', 'number'], ['co2PerSession', 'CO2 avoided per session (t)', 'number'], ['compatibility', 'Connector compatibility', 'text'], ['layout', 'Site layout', 'text'], ['contribution', 'Project contribution ($)', 'number'], ['profitShare', 'Customer profit share (%)', 'number'], ['avgStoreSpend', 'Average in-store spend ($)', 'number'], ['conversion', 'Charging-to-store conversion (%)', 'number'], ['maxKw', 'Max power per post (kW)', 'number'], ['posts', 'Charging posts', 'number'], ['cabinet', 'Power cabinet', 'text'], ['observedCharges3m', 'Observed nearby charges, 3 months', 'number'], ['observedStations', 'Observed station locations', 'number'], ['observedPorts', 'Observed charger ports', 'number'], ['sourceWindow', 'Demand data window', 'text']
  ], formulas: [
    ['Annual sessions', 'DC + L2 ports × utilization × sessions per port', () => number(calc.sessions())],
    ['Net margin / kWh', 'Price − network fee − power cost − management fee', () => money(calc.netKwhMargin(), 2)],
    ['Annual charging revenue', 'Sessions × average kWh × net margin', () => money(calc.evRevenue())],
    ['CO2 avoided', 'Annual sessions × CO2 per session', () => `${number(calc.evCo2(), 0)} t / yr`], ['In-store revenue opportunity', 'Sessions × conversion × average in-store spend', () => money(calc.sessions() * state.ev.conversion / 100 * state.ev.avgStoreSpend)], ['Annual nearby demand', 'Observed 3-month charges × 4', () => number(calc.observedAnnualCharges()) + ' charges / yr']
  ] },
  bundles: { title: 'Bundled scopes', fields: [
    ['critterGuard', 'Critter guard investment ($)', 'number'], ['lighting', 'Permanent lighting investment ($)', 'number'], ['hvac', 'HVAC investment ($)', 'number'], ['hvacBase', 'HVAC contractor base cost ($)', 'number'], ['coordination', 'Project coordination ($)', 'number']
  ], formulas: [
    ['HVAC coordination / margin', 'HVAC investment − HVAC contractor base cost', () => money(state.bundles.hvac - state.bundles.hvacBase)],
    ['Bundled site improvements', 'Critter guard + lighting + HVAC + coordination', () => money(state.bundles.critterGuard + state.bundles.lighting + state.bundles.hvac + state.bundles.coordination)]
  ] },
  vpp: { title: 'Grid partnership', fields: [['demandResponse', 'Demand response value / year ($)', 'number'], ['reservePct', 'Reserve requirement (%)', 'number'], ['status', 'Program status', 'text'], ['controls', 'Controls / monitoring', 'text'], ['customerValue', 'Customer value case', 'text'], ['utilityValue', 'Utility value case', 'text'], ['workPlan', 'Approval work plan', 'text']], formulas: [['Available dispatch reserve', 'Battery power × (1 − reserve requirement)', () => `${number(state.storage.powerKw * (1 - state.vpp.reservePct / 100))} kW`]] },
  investment: { title: 'Investment', fields: [['solar', 'Solar investment ($)', 'number'], ['solarModules', 'Solar modules ($)', 'number'], ['solarInverters', 'Inverters + monitoring ($)', 'number'], ['solarRacking', 'Commercial racking ($)', 'number'], ['solarBos', 'Electrical balance of system ($)', 'number'], ['solarLabor', 'Installation labor + equipment ($)', 'number'], ['solarEngineering', 'Engineering + approvals ($)', 'number'], ['solarCommissioning', 'Delivery + commissioning ($)', 'number'], ['battery', 'Battery investment ($)', 'number'], ['ev', 'EV investment ($)', 'number'], ['siteImprovements', 'Site improvements ($)', 'number'], ['incentivePct', 'Illustrative incentive (%)', 'number'], ['ownership', 'Ownership structure', 'text'], ['placedInService', 'Placed-in-service timing', 'text'], ['taxAdvisor', 'Tax review owner', 'text']], formulas: [['Solar turnkey breakdown', 'Modules + inverters + racking + BOS + labor + engineering + commissioning', () => money(state.investment.solarModules + state.investment.solarInverters + state.investment.solarRacking + state.investment.solarBos + state.investment.solarLabor + state.investment.solarEngineering + state.investment.solarCommissioning)], ['Gross investment', 'Solar + battery + EV + site improvements', () => money(calc.totalInvestment())], ['Potential incentive', 'Gross investment × incentive rate', () => money(calc.totalInvestment() * state.investment.incentivePct / 100)], ['Illustrative net cost', 'Gross investment − potential incentive', () => money(calc.totalInvestment() * (1 - state.investment.incentivePct / 100))]] },
  economics: { title: 'Economics', fields: [['escalation', 'Annual savings escalation (%)', 'number'], ['period', 'Analysis period (years)', 'number'], ['discountRate', 'Discount rate (%)', 'number'], ['annualOpex', 'Annual operating cost ($)', 'number'], ['taxBenefitPct', 'Tax / incentive assumption (%)', 'number']], formulas: [['Year 1 benefit', 'Solar savings + demand savings + EV revenue + VPP value', () => money(calc.year1Benefit())], ['Cumulative benefit', 'SUM(year 1 benefit × (1 + escalation)^year) − annual operating costs', () => money(calc.cumulativeBenefit())], ['Net value', 'Cumulative benefit − illustrative net investment', () => money(calc.netValue())], ['NPV', 'SUM(discounted annual benefits) − illustrative net investment', () => money(calc.npv())], ['Simple payback', 'Illustrative net investment ÷ annual benefit after OPEX', () => `${number(calc.payback(), 1)} years`], ['ROI', 'Net value ÷ illustrative net investment', () => `${number(calc.roi(), 1)}%`]] },
  layout: { title: 'Charger layout', fields: [['mapZoom', 'Satellite zoom level', 'number'], ['defaultLineColor', 'Default line color', 'text'], ['designNote', 'Construction note', 'textarea']], formulas: [['Placed objects', 'COUNT(objects on plan)', () => `${layoutObjects.length} objects`], ['Drawn linework', 'COUNT(lines on plan)', () => `${layoutLines.length} lines`]] }
};

function formulaMarkup(schema) {
  return schema.formulas?.length ? `<div class="formula-box"><div class="formula-title">CALCULATED OUTPUTS</div>${schema.formulas.map(([label, formula, value]) => { const output = label === 'Simple payback' && calc.payback() == null ? 'Not reached within modeled inputs' : value(); return `<div class="formula-row"><span><b>${esc(label)}</b><small>${esc(formula)}</small></span><strong>${esc(output)}</strong></div>`; }).join('')}</div>` : '';
}

const sliderRanges = {
  savingsRate: [50, 100, 1], co2Factor: [0.2, 1.2, 0.01], footprint: [1000, 300000, 100], utilitySpend: [10000, 1000000, 1000], annualKwh: [50000, 5000000, 10000], peakDemand: [25, 3000, 5], openHours: [1, 24, 1], selfConsumption: [50, 100, 1], energyRate: [0.05, 0.4, 0.01], demandRate: [0, 40, 0.25], exportRate: [0, 0.15, 0.01], onsiteValue: [0.05, 0.4, 0.01], latitude: [-90, 90, 0.000001], longitude: [-180, 180, 0.000001], mapRadius: [1, 25, 0.5],
  arrayKw: [10, 5000, 5], productionRatio: [1000, 3000, 10], moduleW: [300, 700, 5], warranty: [10, 40, 1], chartHigh: [50, 120, 1], chartLow: [0, 80, 1], chartStd: [1, 40, 1], capacityMwh: [0.1, 20, 0.1], powerKw: [25, 5000, 25], shavePct: [0, 50, 1], dispatchHours: [0.5, 12, 0.5], batteryEfficiency: [70, 98, 1], ratedCapacity: [0.1, 20, 0.1], investment: [10000, 5000000, 5000],
  dcFast: [0, 100, 1], level2: [0, 200, 1], utilization: [0, 100, 0.5], sessionsPerPortYear: [500, 10000, 100], avgKwh: [5, 150, 1], price: [0.1, 1, 0.01], networkFee: [0, 0.5, 0.01], powerCost: [0, 0.5, 0.01], managementFee: [0, 0.5, 0.01], co2PerSession: [0.001, 0.1, 0.001], contribution: [0, 5000000, 5000], profitShare: [0, 100, 1], avgStoreSpend: [0, 100, 0.5], conversion: [0, 100, 1], maxKw: [3, 1000, 1], posts: [1, 100, 1], observedCharges3m: [0, 200000, 100], observedStations: [0, 200, 1], observedPorts: [0, 1000, 1],
  critterGuard: [0, 500000, 5000], lighting: [0, 500000, 5000], hvac: [0, 1000000, 5000], hvacBase: [0, 1000000, 5000], coordination: [0, 500000, 5000], demandResponse: [0, 500000, 5000], reservePct: [0, 80, 1], solar: [10000, 10000000, 5000], solarModules: [0, 5000000, 5000], solarInverters: [0, 5000000, 5000], solarRacking: [0, 5000000, 5000], solarBos: [0, 5000000, 5000], solarLabor: [0, 5000000, 5000], solarEngineering: [0, 2000000, 5000], solarCommissioning: [0, 2000000, 5000], battery: [0, 5000000, 5000], ev: [0, 5000000, 5000], siteImprovements: [0, 2000000, 5000], incentivePct: [0, 50, 1], escalation: [0, 10, 0.25], period: [5, 40, 1], discountRate: [0, 20, 0.25], annualOpex: [0, 500000, 1000], taxBenefitPct: [0, 50, 1], mapZoom: [15, 22, 1]
};
const sliderDigits = step => String(step).includes('.') ? String(step).split('.')[1].length : 0;
const sliderValueLabel = (label, value, step) => { const digits = Math.max(sliderDigits(step), String(value).includes('.') ? String(value).split('.')[1].length : 0); if (label.includes('$')) return money(value); if (label.includes('%')) return `${number(value, digits)}%`; return number(value, digits); };
const paintRange = input => { const min = Number(input.min), max = Number(input.max), value = Number(input.value); const pct = max === min ? 0 : ((value - min) / (max - min)) * 100; input.style.background = `linear-gradient(90deg,var(--electric) 0%,var(--electric) ${pct}%,#30323a ${pct}%,#30323a 100%)`; };
function fieldMarkup([key, label, type, options]) {
  const value = state[activeConfigSection][key] ?? '';
  if (type === 'textarea') return `<label class="config-field"><span>${esc(label)}</span><textarea data-key="${key}" rows="7" placeholder="Month,Value\nJAN,48\nFEB,55">${esc(value)}</textarea></label>`;
  if (type === 'select') return `<label class="config-field"><span>${esc(label)}</span><select data-key="${key}">${options.map(option => `<option ${option === value ? 'selected' : ''}>${esc(option)}</option>`).join('')}</select></label>`;
  if (type === 'number') { const [min, max, step] = sliderRanges[key] || [0, Math.max(100, Number(value) * 2 || 100), 1]; return `<label class="config-field config-slider-field"><div class="config-slider-head"><span>${esc(label)}</span><output data-output="${key}">${esc(sliderValueLabel(label, value, step))}</output></div><div class="config-slider-row"><input class="config-range" data-key="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${esc(value)}" aria-label="${esc(label)}" /><input class="config-number" data-key="${key}" type="number" min="${min}" max="${max}" step="${step}" value="${esc(value)}" aria-label="Exact ${esc(label)}" /></div></label>`; }
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
  configBody.querySelectorAll('.config-range').forEach(paintRange);
  configBody.querySelectorAll('[data-key]').forEach(input => input.addEventListener('input', () => { const key = input.dataset.key; state[activeConfigSection][key] = input.type === 'range' || input.type === 'number' ? Number(input.value) : input.value; configBody.querySelectorAll(`[data-key="${key}"]`).forEach(peer => { if (peer !== input) { peer.value = input.value; if (peer.classList.contains('config-range')) paintRange(peer); } }); const output = configBody.querySelector(`[data-output="${key}"]`); if (output) output.textContent = sliderValueLabel(configSchemas[activeConfigSection].fields.find(field => field[0] === key)?.[1] || '', Number(input.value), Number(input.step) || 1); refreshFormulaBox(); }));
  configBody.querySelector('.config-file')?.addEventListener('change', event => handleImageUpload(event.target.files[0], sectionId));
  configPanel.classList.add('open'); configBackdrop.classList.add('open');
}

function handleImageUpload(file, sectionId) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader(); reader.onload = () => { localStorage.setItem(`bidwise-image-${sectionId}`, reader.result); applyImage(sectionId, reader.result); }; reader.readAsDataURL(file);
}
function visualTarget(sectionId) { return { overview: $('.hero-art'), site: $('.map-card'), layout: $('#layoutMap'), solar: $('.chart-panel'), storage: $('.battery-visual'), ev: $('.ev-illustration'), bundles: $('#bundles .bundle-card'), vpp: $('.vpp-flow'), investment: $('.incentive-card'), economics: $('.economics-card') }[sectionId]; }
let leafletPromise;
function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
    const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload = () => resolve(window.L); script.onerror = reject; document.head.appendChild(script);
  });
  return leafletPromise;
}
function mountInteractiveDemandMap() {
  const mapCard = $('.map-card'); if (!mapCard) return;
  let canvas = $('#demandMap'); if (!canvas) { canvas = document.createElement('div'); canvas.id = 'demandMap'; canvas.className = 'demand-map-canvas'; mapCard.prepend(canvas); }
  if (mapCard.dataset.leafletReady === 'true') { if (window.bidwiseDemandMap) window.bidwiseDemandMap.invalidateSize(); return; }
  loadLeaflet().then(L => {
    const map = L.map(canvas, { zoomControl: true, attributionControl: true, scrollWheelZoom: false }).setView([state.site.latitude, state.site.longitude], 12.8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', opacity: 0.62 }).addTo(map);
    L.circleMarker([state.site.latitude, state.site.longitude], { radius: 9, color: '#ffffff', weight: 3, fillColor: '#d8ed4f', fillOpacity: 1 }).addTo(map).bindPopup(`<b>${esc(state.overview.siteName)}</b><br>${esc(state.overview.location)}<br><small>Proposal site</small>`);
    demandStations.forEach(station => L.circleMarker([station.lat, station.lon], { radius: Math.max(4, Math.min(9, 4 + Math.log10(station.charges + 1))), color: '#ffffff', weight: 1.5, fillColor: '#ff4f69', fillOpacity: 0.9 }).addTo(map).bindPopup(`<b>${esc(station.name)}</b><br>${esc(station.network)}<br>${number(station.ports)} ports · ${number(station.charges)} observed charges`));
    window.bidwiseDemandMap = map; mapCard.dataset.leafletReady = 'true'; const fallbackDots = mapCard.querySelector('.demand-map'); if (fallbackDots) fallbackDots.hidden = true; setTimeout(() => map.invalidateSize(), 250);
  }).catch(() => { /* The red-dot fallback remains visible if the map tile library is unavailable. */ });
}
let layoutMap;
const layoutObjects = [];
const layoutLines = [];
let layoutLineActive = false;
let layoutLinePoints = [];
let layoutPreviewLine;
const layoutObjectClass = type => type.toLowerCase().replace(/[^a-z0-9]+/g, '-');
function refreshLayoutSummary() {
  const list = $('#layoutPlanSummary'); const count = $('#layoutPlanCount'); if (!list || !count) return;
  count.textContent = `${layoutObjects.length} objects · ${layoutLines.length} lines`;
  list.innerHTML = layoutObjects.length || layoutLines.length ? [...layoutObjects.map(item => `<li><b>${esc(item.type)}</b><small>${item.lat.toFixed(5)}, ${item.lng.toFixed(5)}</small></li>`), ...layoutLines.map(item => `<li><b>${esc(item.label)}</b><small>${number(item.feet)} ft</small></li>`)].join('') : '<li class="layout-empty">Your placed equipment will appear here.</li>';
}
function setLayoutStatus(text) { const status = $('#layoutMapStatus'); if (status) status.textContent = text; }
function clearLayoutPreview() { if (layoutPreviewLine) { layoutPreviewLine.remove(); layoutPreviewLine = null; } }
function addLayoutObject(type, latlng) {
  if (!layoutMap || !window.L) return;
  const marker = L.marker(latlng, { draggable: true, icon: L.divIcon({ className: `layout-marker ${layoutObjectClass(type)}`, html: '<span aria-hidden="true"></span>', iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(layoutMap);
  const item = { type, lat: latlng.lat, lng: latlng.lng, rotation: 0, marker };
  const applyRotation = () => { const shape = marker.getElement()?.querySelector('span'); if (shape) shape.style.transform = `rotate(${item.rotation}deg)`; };
  const rotate = degrees => { item.rotation = (item.rotation + degrees + 360) % 360; applyRotation(); setLayoutStatus(`${type} rotated to ${item.rotation}°`); };
  const remove = () => { marker.remove(); const index = layoutObjects.indexOf(item); if (index >= 0) layoutObjects.splice(index, 1); refreshLayoutSummary(); setLayoutStatus(`${type} deleted`); };
  layoutObjects.push(item); marker.bindTooltip(type, { direction: 'top', offset: [0, -12] }); marker.bindPopup(`<b>${esc(type)}</b><br><span class="layout-popup-angle">Rotation: 0°</span><br><button type="button" class="layout-rotate-button" data-rotate="-15">↺ 15°</button> <button type="button" class="layout-rotate-button" data-rotate="15">↻ 15°</button><br><button type="button" class="layout-delete-button">Delete object</button>`); marker.on('popupopen', event => { const popup = event.popup.getElement(); popup.querySelectorAll('.layout-rotate-button').forEach(button => button.addEventListener('click', () => { rotate(Number(button.dataset.rotate)); popup.querySelector('.layout-popup-angle').textContent = `Rotation: ${item.rotation}°`; })); popup.querySelector('.layout-delete-button')?.addEventListener('click', remove); }); marker.on('dragend', () => { const pos = marker.getLatLng(); item.lat = pos.lat; item.lng = pos.lng; refreshLayoutSummary(); }); refreshLayoutSummary(); setLayoutStatus(`${type} placed · click it to rotate, or drag it to refine the location`);
}
function finishLayoutLine(a, b, color) {
  clearLayoutPreview(); const line = L.polyline([a, b], { color, weight: 4, opacity: .95, lineCap: 'round' }).addTo(layoutMap);
  const feet = Math.round(layoutMap.distance(a, b) * 3.28084); const label = Object.entries({ '#ff5b68': 'Trench', '#ffd166': 'Conduit', '#62a8ff': 'Striping', '#75d58a': 'Access' }).find(([key]) => key === color)?.[1] || 'Line'; const item = { label, feet, line }; const remove = () => { line.remove(); const index = layoutLines.indexOf(item); if (index >= 0) layoutLines.splice(index, 1); refreshLayoutSummary(); setLayoutStatus(`${label} line deleted`); }; layoutLines.push(item); line.bindTooltip(`${label} · ${feet} ft`, { sticky: true }); line.bindPopup(`<b>${esc(label)} line</b><br>${feet} ft<br><button type="button" class="layout-delete-button">Delete line</button>`); line.on('popupopen', event => event.popup.getElement().querySelector('.layout-delete-button')?.addEventListener('click', remove)); refreshLayoutSummary(); setLayoutStatus(`${label} line drawn · click two more points for another segment`);
}
function mountLayoutMap() {
  const mapElement = $('#layoutMap'); if (!mapElement) return;
  if (layoutMap) { setTimeout(() => layoutMap.invalidateSize(), 120); return; }
  loadLeaflet().then(L => {
    layoutMap = L.map(mapElement, { zoomControl: true, attributionControl: true, doubleClickZoom: false }).setView([state.site.latitude, state.site.longitude], Number(state.layout.mapZoom) || 19);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 23, attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics' }).addTo(layoutMap);
    L.marker([state.site.latitude, state.site.longitude], { icon: L.divIcon({ className: 'layout-site-pin', html: '<span aria-hidden="true"></span>', iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(layoutMap).bindPopup(`<b>${esc(state.overview.siteName)}</b><br>${esc(state.overview.location)}<br><small>Site center</small>`).openPopup();
    mapElement.addEventListener('dragover', event => event.preventDefault()); mapElement.addEventListener('drop', event => { event.preventDefault(); const type = event.dataTransfer.getData('text/plain'); if (!type) return; const rect = mapElement.getBoundingClientRect(); addLayoutObject(type, layoutMap.containerPointToLatLng(L.point(event.clientX - rect.left, event.clientY - rect.top))); });
    $$('.layout-object').forEach(button => { button.addEventListener('dragstart', event => event.dataTransfer.setData('text/plain', button.dataset.object)); button.addEventListener('click', () => { layoutMap.once('click', event => addLayoutObject(button.dataset.object, event.latlng)); setLayoutStatus(`Click the map to place ${button.dataset.object}`); }); });
    const lineButton = $('#layoutLineTool'); const colorSelect = $('#layoutLineColor'); lineButton?.addEventListener('click', () => { layoutLineActive = !layoutLineActive; lineButton.classList.toggle('active', layoutLineActive); mapElement.classList.toggle('layout-line-mode', layoutLineActive); lineButton.textContent = layoutLineActive ? '✓ Drawing line' : '＋ Line'; layoutLinePoints = []; clearLayoutPreview(); setLayoutStatus(layoutLineActive ? 'Pencil active · click to start, move, then click to commit' : 'Drag objects onto the map · click Line to draw'); });
    layoutMap.on('mousemove', event => { if (!layoutLineActive || layoutLinePoints.length !== 1) return; const color = colorSelect?.value || state.layout.defaultLineColor; if (!layoutPreviewLine) layoutPreviewLine = L.polyline([layoutLinePoints[0], event.latlng], { color, weight: 4, opacity: .7, dashArray: '6 6', interactive: false }).addTo(layoutMap); else layoutPreviewLine.setLatLngs([layoutLinePoints[0], event.latlng]); });
    layoutMap.on('click', event => { if (!layoutLineActive) return; layoutLinePoints.push(event.latlng); if (layoutLinePoints.length === 1) { setLayoutStatus('Pencil active · move to preview the line, then click to commit'); } if (layoutLinePoints.length === 2) { finishLayoutLine(layoutLinePoints[0], layoutLinePoints[1], colorSelect?.value || state.layout.defaultLineColor); layoutLinePoints = []; } });
    window.bidwiseLayoutMap = layoutMap; setTimeout(() => layoutMap.invalidateSize(), 250);
  }).catch(() => setLayoutStatus('Satellite imagery unavailable · check the map connection and try again'));
}
function renderDemandMap() {
  const map = $('.map-card'); if (!map) return;
  const minLat = Math.min(...demandStations.map(station => station.lat)); const maxLat = Math.max(...demandStations.map(station => station.lat));
  const minLon = Math.min(...demandStations.map(station => station.lon)); const maxLon = Math.max(...demandStations.map(station => station.lon));
  let layer = map.querySelector('.demand-map'); if (!layer) { layer = document.createElement('div'); layer.className = 'demand-map'; map.appendChild(layer); }
  layer.innerHTML = demandStations.map(station => { const left = ((station.lon - minLon) / (maxLon - minLon)) * 86 + 7; const top = (1 - ((station.lat - minLat) / (maxLat - minLat))) * 76 + 12; const intensity = Math.min(12, 5 + Math.log10(station.charges + 1) * 1.5); return `<span class="demand-dot" style="left:${left.toFixed(2)}%;top:${top.toFixed(2)}%;--dot-size:${intensity.toFixed(1)}px" title="${esc(station.name)} · ${esc(station.network)} · ${number(station.charges)} observed charges"></span>`; }).join('');
  let legend = map.querySelector('.demand-map-label'); if (!legend) { legend = document.createElement('div'); legend.className = 'demand-map-label'; map.appendChild(legend); }
  legend.innerHTML = `<b>NEARBY EV DEMAND</b><span>${number(demandStations.length)} locations · ${number(state.ev.observedPorts)} ports · ${number(state.ev.observedCharges3m)} charges / 3 mo</span>`;
  mountInteractiveDemandMap();
}
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
function renderSolarChart() { const data = seasonalBars(); $('#solarChart').innerHTML = data.map((row, index) => { const load = 64 + ((index % 4) * 4); const solar = Math.max(8, Math.min(load, row.value)); const grid = Math.max(0, load - solar); return `<i title="${esc(row.label)}: ${number(solar, 1)}% solar served + ${number(grid, 1)}% grid supplied" aria-label="${esc(row.label)}: ${number(solar, 1)} percent solar served and ${number(grid, 1)} percent grid supplied"><span class="bar-segment grid-segment" style="height:${grid}%"></span><span class="bar-segment solar-segment" style="height:${solar}%"></span></i>`; }).join(''); }

function setText(selector, value) { const node = $(selector); if (node) node.textContent = value; }
function refreshDerivedMetrics() {
  const payback = calc.payback();
  const paybackNode = $('#payback');
  if (paybackNode) paybackNode.innerHTML = payback == null ? 'Not reached' : `${number(payback, 1)} <small>yrs</small>`;
  const realizedSavings = calc.solarSavings() / Math.max(1, state.site.utilitySpend) * 100;
  setText('#yearSavings', compactMoney(calc.year1Benefit()));
  setText('.hero-badge strong', `${number(realizedSavings, 1)}%`);
  setText('.metric-card.primary .trend-up', `↓ ${number(realizedSavings, 1)}%`);
}
function renderReport() {
  renderSolarChart(); renderDemandMap(); mountLayoutMap(); setText('.status-pill', state.overview.status);
  setText('#storeName', state.overview.siteName); setText('.hero .store-roof', state.overview.siteName.toUpperCase()); const heroDate = $('.hero .eyebrow'); if (heroDate) heroDate.innerHTML = `COMMERCIAL ENERGY PROPOSAL <span>•</span> ${state.overview.proposalDate}`; const heroLocation = $('.hero .hero-meta span:last-child'); if (heroLocation) heroLocation.textContent = state.overview.location; const mapLabel = $('#site .map-label'); if (mapLabel) mapLabel.innerHTML = `${state.overview.location.toUpperCase()}<span>${state.site.latitude.toFixed(4)}° N · ${Math.abs(state.site.longitude).toFixed(4)}° W</span>`; setText('#site .map-tag', state.overview.siteName); setText('.breadcrumb strong', 'OREM, UT'); setText('#yearSavings', compactMoney(calc.solarSavings())); setText('#totalInvestment', compactMoney(calc.totalInvestment())); setText('#payback', `${number(calc.payback(), 1)} yrs`); const co2Metric = $('#overview .metric-card:nth-child(4) .metric-value'); if (co2Metric) co2Metric.innerHTML = `${number(calc.co2AvoidedSolar(), 0)} <small>t/yr</small>`;
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
  renderAuditBlocks(); renderReferenceComponents(); applyScopeCopy(); refreshDerivedMetrics(); saveState();
}

const currentScopes = () => ({ solar: $('.top-scope-toggle[data-scope="solar"]')?.checked ?? activeBid.scopes.solar, storage: $('.top-scope-toggle[data-scope="storage"]')?.checked ?? activeBid.scopes.storage, ev: $('.top-scope-toggle[data-scope="ev"]')?.checked ?? activeBid.scopes.ev });
function applyScopeCopy() {
  const scopes = currentScopes();
  const bundleSection = $('#bundles'); if (bundleSection) bundleSection.classList.toggle('scope-off', !(scopes.solar && scopes.storage && scopes.ev));
  const vppSection = $('#vpp'); if (vppSection) vppSection.classList.toggle('scope-off', !scopes.storage);
  const investmentRows = $$('#investment .investment-row'); if (investmentRows[2]) investmentRows[2].classList.toggle('scope-off', !scopes.storage); if (investmentRows[3]) investmentRows[3].classList.toggle('scope-off', !scopes.ev);
  const legend = $$('#site .map-legend span'); if (legend[0]) legend[0].classList.toggle('scope-off', !scopes.solar); if (legend[1]) legend[1].classList.toggle('scope-off', !scopes.storage); if (legend[2]) legend[2].classList.toggle('scope-off', !scopes.ev);
  const demandDots = $('#site .demand-map'); if (demandDots) demandDots.classList.toggle('scope-off', !scopes.ev); const demandLabel = $('#site .demand-map-label'); if (demandLabel) demandLabel.classList.toggle('scope-off', !scopes.ev);
  const heroSub = $('.hero-sub'); if (heroSub) heroSub.innerHTML = scopes.ev ? `A smarter energy system for <strong id="storeName">${esc(state.overview.siteName)}</strong> — designed to reduce operating costs, keep the store resilient, and make EV charging part of the customer experience.` : `A smarter energy system for <strong id="storeName">${esc(state.overview.siteName)}</strong> — designed to reduce operating costs and improve the store's energy performance.`;
  const roadmap = $('#solar .roadmap span:nth-child(3)'); if (roadmap) roadmap.innerHTML = scopes.storage ? '<b>03</b>Evaluate additional panels, storage, controls, and utility program enrollment' : '<b>03</b>Evaluate additional panels, controls, and utility program enrollment';
  const investmentTitle = $('#investment .reference-components .reference-title'); if (investmentTitle) investmentTitle.textContent = `${scopes.storage ? 'SOLAR + BATTERY' : 'SOLAR'} INVESTMENT SUMMARY + TURNKEY BREAKDOWN`;
  const scopeSummary = $$('#investment .scope-summary span'); if (scopeSummary[1]) scopeSummary[1].classList.toggle('scope-off', !scopes.storage); if (scopeSummary[2]) scopeSummary[2].classList.toggle('scope-off', !scopes.ev);
  const validation = $('#economics .reference-components .assumption-row span:nth-child(2)'); if (validation) validation.innerHTML = `<b>Sources / validation</b>Utility bills, interval data, tariff, final equipment quotes, and tax review${scopes.storage ? ', plus executed VPP agreements' : ''}${scopes.ev ? ', plus executed charging agreements' : ''}`;
  const siteReferenceFoot = $('#site .reference-components .reference-foot'); if (siteReferenceFoot) siteReferenceFoot.textContent = scopes.ev ? `Onsite energy offsets retail purchases first; exports are modeled at the export credit. Nearby demand map: ${number(demandStations.length)} station locations and ${number(state.ev.observedCharges3m)} observed charges in ${state.ev.sourceWindow} from the supplied workbook.` : 'Onsite energy offsets retail purchases first; exports are modeled at the export credit. The utility baseline and modeled bill are ready for review against the customer’s actual statements.';
  const economicsFoot = $('#economics .reference-components .reference-foot'); if (economicsFoot) economicsFoot.textContent = `All incentives,${scopes.storage ? ' VPP revenue,' : ''}${scopes.ev ? ' utilization and retail revenue,' : ''} energy savings are illustrative until validated by project documents and operating data.`;
}

function renderAuditBlocks() {
  const blocks = {
    site: `<div class="audit-grid"><div><b>Utility baseline</b><span>${money(state.site.utilitySpend / 12)} / month · ${number(state.site.annualKwh)} kWh / year</span></div><div><b>Cost of doing nothing</b><span>${money(state.site.utilitySpend)} annual utility spend at current rates</span></div><div><b>Solar offset</b><span>${number(calc.solarMwh() * 1000 / Math.max(1, state.site.annualKwh) * 100, 1)}% of annual consumption</span></div></div>`,
    storage: `<div class="audit-grid"><div><b>Demand-charge value</b><span>${money(state.site.demandRate)} / kW-month × 12 months</span></div><div><b>Load result</b><span>${number(state.site.peakDemand)} kW → ${number(calc.postPeak())} kW modeled peak</span></div><div><b>Battery reserve</b><span>${number(state.vpp.reservePct)}% held for resilience / VPP requirements</span></div></div>`,
    ev: `<div class="audit-grid"><div><b>Charging scenarios</b><span>Conservative ${number(calc.sessions() * .7)} · Base ${number(calc.sessions())} · Strong ${number(calc.sessions() * 1.3)}</span></div><div><b>Per-session economics</b><span>${number(state.ev.avgKwh)} kWh × ${money(calc.netKwhMargin(), 2)} net margin</span></div><div><b>Retail opportunity</b><span>Use this section's annual sessions as the foot-traffic driver</span></div></div>`,
    economics: `<div class="audit-grid"><div><b>Year 1 benefit</b><span>${money(calc.year1Benefit())} before operating costs</span></div><div><b>Illustrative net cost</b><span>${money(calc.netInvestment())} after ${number(state.economics.taxBenefitPct)}% incentive assumption</span></div><div><b>20-year cumulative benefit</b><span>${money(calc.cumulativeBenefit())} before net-cost subtraction</span></div></div>`
  };
  Object.entries(blocks).forEach(([id, html]) => { const section = $(`#${id}`); if (!section) return; let node = section.querySelector('.audit-grid'); if (!node) { const wrapper = document.createElement('div'); wrapper.innerHTML = html; section.appendChild(wrapper.firstElementChild); } else node.outerHTML = html; });
}

function upsertDetail(sectionId, className, html) {
  const section = $(`#${sectionId}`); if (!section) return;
  let node = section.querySelector(`.${className}`);
  if (!node) { node = document.createElement('div'); node.className = className; section.appendChild(node); }
  node.innerHTML = html;
}
function renderReferenceComponents() {
  upsertDetail('ev', 'regional-benchmark', `<div class="reference-card"><div class="reference-title">REGIONAL DEMAND CALIBRATION</div><div class="reference-foot">The proposal uses the supplied Orem weekly report as its site benchmark: ${number(state.ev.observedCharges3m)} observed charges across ${number(state.ev.observedPorts)} tracked ports. A second St. George daily report provides a cross-market check: ${number(regionalEvBenchmark.charges3m)} charges across ${number(regionalEvBenchmark.ports)} ports, ${number(regionalEvBenchmark.utilization, 1)}% mean utilization, and ${number(regionalEvBenchmark.avgKwh, 1)} kWh average energy per charge. These are observed market signals, not a guarantee of site performance.</div></div>`);
  upsertDetail('site', 'reference-components', `<div class="reference-card"><div class="reference-title">UTILITY BASELINE + VALUE STACK</div><div class="reference-list"><span><b>Provider</b>${esc(state.site.provider)}</span><span><b>Tariff</b>${esc(state.site.tariff)}</span><span><b>Energy charge</b>${money(state.site.energyRate, 2)} / kWh</span><span><b>Demand charge</b>${money(state.site.demandRate, 2)} / kW-month</span><span><b>Current annual bill</b>${money(state.site.utilitySpend)}</span><span><b>Current monthly bill</b>${money(state.site.utilitySpend / 12)}</span></div><div class="rate-stack"><span>Onsite use<strong>${money(state.site.onsiteValue, 2)} / kWh</strong></span><span>Export credit<strong>${money(state.site.exportRate, 2)} / kWh</strong></span><span>Demand reduction<strong>${money(calc.demandSavings())} / yr</strong></span></div><div class="bill-compare"><span>Current bill<strong>${money(state.site.utilitySpend / 12)} / mo</strong></span><i></i><span>Modeled bill<strong>${money(calc.proposedBill() / 12)} / mo</strong></span></div><div class="reference-foot">Onsite energy offsets retail purchases first; exports are modeled at the export credit. Nearby demand map: ${number(demandStations.length)} station locations and ${number(state.ev.observedCharges3m)} observed charges in ${esc(state.ev.sourceWindow)} from the supplied workbook.</div></div>`);
  upsertDetail('solar', 'reference-components', `<div class="reference-card"><div class="reference-title">PHASE 1 → PHASE 2 ROADMAP</div><div class="roadmap"><span><b>01</b>Build the approved ${number(state.solar.arrayKw)} kW foundation</span><span><b>02</b>Measure 12 months of utility and interval data</span><span><b>03</b>Evaluate additional panels, storage, controls, and VPP enrollment</span></div><div class="reference-foot">System design: ${esc(state.solar.installation)} · ${esc(state.solar.manufacturer)} ${esc(state.solar.model)} · ${number(state.solar.productionRatio)} kWh/kW-year.</div></div>`);
  upsertDetail('storage', 'reference-components', `<div class="reference-card"><div class="reference-title">BATTERY VALUE STACK + HOURLY LOAD ANALYSIS</div><div class="reference-list"><span><b>Equipment</b>${number(state.storage.capacityMwh, 1)} MWh rated · ${number(state.storage.capacityMwh * state.storage.batteryEfficiency / 100, 2)} MWh usable</span><span><b>Manufacturer / model</b>${esc(state.storage.manufacturer)} · ${esc(state.storage.model)}</span><span><b>Controls</b>${esc(state.storage.controls)}</span><span><b>Energy shifting</b>Solar surplus stored for later store load</span><span><b>Demand reduction</b>${money(calc.demandSavings())} modeled annual demand-charge savings</span><span><b>Resilience</b>${number(state.storage.dispatchHours)}-hour dispatch duration with ${number(state.vpp.reservePct)}% reserve</span></div><table class="load-table"><thead><tr><th>Period</th><th>Store load</th><th>Solar</th><th>Battery</th><th>Grid</th></tr></thead><tbody><tr><td>6 AM</td><td>42%</td><td>8%</td><td>+0%</td><td>34%</td></tr><tr><td>12 PM</td><td>78%</td><td>64%</td><td>+14%</td><td>0%</td></tr><tr><td>6 PM</td><td>92%</td><td>22%</td><td>−19%</td><td>51%</td></tr><tr><td>11 PM</td><td>38%</td><td>0%</td><td>−8%</td><td>30%</td></tr></tbody></table><div class="load-series"><span>Solar serves load</span><span>Storage charges</span><span>Storage discharges</span><span>Grid imports / exports</span></div></div>`);
  const scenario = (factor, label) => { const sessions = calc.sessions() * factor; return `<tr><td>${label}</td><td>${number(sessions)}</td><td>${money(sessions * state.ev.avgKwh * calc.netKwhMargin())}</td><td>${money(sessions * state.ev.conversion / 100 * state.ev.avgStoreSpend)}</td></tr>`; };
  upsertDetail('ev', 'reference-components', `<div class="reference-card"><div class="reference-title">CHARGING LAYOUT + PER-CHARGE ECONOMICS</div><div class="ev-layout-detail"><span><b>Hardware</b>${number(state.ev.posts)} V4 posts · up to ${number(state.ev.maxKw)} kW/post · ${esc(state.ev.compatibility)}</span><span><b>Layout</b>${esc(state.ev.layout)} · ${esc(state.ev.cabinet)}</span><span><b>Contribution</b>${money(state.ev.contribution)} · ${number(state.ev.profitShare)}% customer profit share</span><span><b>Observed demand</b>${number(state.ev.observedCharges3m)} charges / 3 mo · ${number(calc.observedAnnualCharges())} annualized</span></div><div class="layout-visual"><span>Roadside 01</span><span>Roadside 02</span><span>Roadside 03</span><span>Roadside 04</span><span>Drive-through 05</span><span>Drive-through 06</span><span>Drive-through 07</span><span>Drive-through 08</span></div><div class="per-charge"><span>Gross charge<strong>${money(state.ev.avgKwh * state.ev.price, 2)}</strong></span><span>Network fee<strong>− ${money(state.ev.avgKwh * state.ev.networkFee, 2)}</strong></span><span>Power cost<strong>− ${money(state.ev.avgKwh * state.ev.powerCost, 2)}</strong></span><span>Management<strong>− ${money(state.ev.avgKwh * state.ev.managementFee, 2)}</strong></span><span>Customer net<strong>${money(state.ev.avgKwh * calc.netKwhMargin(), 2)}</strong></span></div><table class="scenario-table"><thead><tr><th>Case</th><th>Sessions / year</th><th>Charging revenue</th><th>In-store revenue</th></tr></thead><tbody>${scenario(.7, 'Conservative')}${scenario(1, 'Base')}${scenario(1.3, 'Strong')}</tbody></table><div class="reference-foot">Revenue is illustrative and depends on utilization, charging terms, customer behavior, store conversion, product mix, and layout. The red-dot map shows nearby observed demand, not guaranteed demand at Kneaders.</div></div>`);
  upsertDetail('bundles', 'reference-components', `<div class="reference-card"><div class="reference-title">BUNDLED SCOPE ACCOUNTABILITY</div><div class="scope-detail-grid"><span><b>Critter guard</b>Wiring and roof protection, installation, inspection, and cleanup · ${money(state.bundles.critterGuard)}</span><span><b>Permanent lighting</b>Low-profile track lighting, controls, Wi-Fi extenders, and electrical work · ${money(state.bundles.lighting)}</span><span><b>Commercial HVAC</b>Five high-efficiency units, ducting, mechanical/electrical integration · ${money(state.bundles.hvac)}</span><span><b>Coordination</b>One schedule, documentation package, payment milestones, and first-call accountability · ${money(state.bundles.coordination)}</span></div><div class="reference-foot">HVAC contractor base: ${money(state.bundles.hvacBase)} · coordination / margin disclosed: ${money(state.bundles.hvac - state.bundles.hvacBase)}.</div></div>`);
  upsertDetail('vpp', 'reference-components', `<div class="reference-card"><div class="reference-title">VPP OPPORTUNITY + APPROVAL PATH</div><div class="vpp-detail-grid"><span><b>Customer value</b>${esc(state.vpp.customerValue)}</span><span><b>Utility value</b>${esc(state.vpp.utilityValue)}</span><span><b>Controls</b>${esc(state.vpp.controls)}</span><span><b>Work plan</b>${esc(state.vpp.workPlan)}</span></div><div class="reference-foot">Status: ${esc(state.vpp.status)}. Dispatch payments, rebates, bill credits, reserve requirements, cybersecurity, interconnection, and final terms require utility review.</div></div>`);
  upsertDetail('investment', 'reference-components', `<div class="reference-card"><div class="reference-title">SIX-SCOPE SUMMARY + SOLAR TURNKEY BREAKDOWN</div><div class="scope-summary"><span>Solar<strong>${money(state.investment.solar)}</strong></span><span>Battery<strong>${money(state.investment.battery)}</strong></span><span>EV charging<strong>${money(state.investment.ev)}</strong></span><span>Critter guard<strong>${money(state.bundles.critterGuard)}</strong></span><span>Lighting<strong>${money(state.bundles.lighting)}</strong></span><span>HVAC<strong>${money(state.bundles.hvac)}</strong></span></div><div class="reference-list"><span><b>Modules</b>${money(state.investment.solarModules)}</span><span><b>Inverters + monitoring</b>${money(state.investment.solarInverters)}</span><span><b>Commercial racking</b>${money(state.investment.solarRacking)}</span><span><b>Electrical BOS</b>${money(state.investment.solarBos)}</span><span><b>Installation labor</b>${money(state.investment.solarLabor)}</span><span><b>Engineering / approvals</b>${money(state.investment.solarEngineering)}</span><span><b>Delivery / commissioning</b>${money(state.investment.solarCommissioning)}</span></div><div class="tax-grid"><span><b>Credits / incentives</b>Federal clean-energy credit potential, grants, rebates, and stacking review</span><span><b>Depreciation</b>MACRS, bonus depreciation, and Section 179 if applicable</span><span><b>Structure</b>${esc(state.investment.ownership)} · placed in service ${esc(state.investment.placedInService)}</span><span><b>Documentation</b>Basis, invoices, ownership, timing, and tax-professional review</span></div><div class="comparison-strip"><span>Gross bundled project<strong>${money(calc.totalInvestment())}</strong></span><span>Potential incentive<strong>− ${money(calc.totalInvestment() * state.investment.incentivePct / 100)}</strong></span><span>Illustrative net cost<strong>${money(calc.netInvestment())}</strong></span></div><div class="reference-foot">${number(state.investment.incentivePct)}% is an illustrative working assumption, not a guarantee of eligibility or tax outcome.</div></div>`);
  const rows = Array.from({ length: Math.max(1, Math.round(state.economics.period)) }, (_, i) => { const year = i + 1; const benefit = calc.year1Benefit() * Math.pow(1 + state.economics.escalation / 100, i) - state.economics.annualOpex; return `<tr><td>${year}</td><td>${money(benefit)}</td><td>${money(benefit / Math.pow(1 + state.economics.discountRate / 100, year))}</td></tr>`; }).join('');
  upsertDetail('economics', 'reference-components', `<div class="reference-card"><div class="reference-title">ILLUSTRATIVE ${number(state.economics.period)}-YEAR ROI MODEL</div><table class="roi-table"><thead><tr><th>Year</th><th>Net annual benefit</th><th>Discounted benefit</th></tr></thead><tbody>${rows}</tbody></table><div class="assumption-row"><span><b>Model inputs</b>${number(state.economics.escalation)}% annual escalation · ${number(state.economics.discountRate)}% discount rate · ${money(state.economics.annualOpex)} annual OPEX</span><span><b>Sources / validation</b>Utility bills, interval data, tariff, final equipment quotes, tax review, and executed VPP / charging agreements</span></div><div class="reference-foot">All incentives, VPP revenue, utilization, energy savings, and retail revenue are illustrative until validated by project documents and operating data.</div></div>`);
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
function updateScopeUI() {
  const scopeControls = $$('.scope-toggle, .top-scope-toggle');
  const activeScopes = new Set(scopeControls.filter(control => control.checked).map(control => control.dataset.scope));
  scopeControls.forEach(control => { control.checked = activeScopes.has(control.dataset.scope); });
  ['solar', 'storage', 'ev'].forEach(scope => { const section = document.getElementById(scope); const nav = $(`.nav-item[data-target="${scope}"]`); if (section) section.classList.toggle('scope-off', !activeScopes.has(scope)); if (nav) nav.classList.toggle('scope-off', !activeScopes.has(scope)); }); const layoutSection = document.getElementById('layout'); const layoutNav = $('.nav-item[data-target="layout"]'); if (layoutSection) layoutSection.classList.toggle('scope-off', !activeScopes.has('ev')); if (layoutNav) layoutNav.classList.toggle('scope-off', !activeScopes.has('ev')); const bundles = document.getElementById('bundles'); const bundlesNav = $('.nav-item[data-target="bundles"]'); if (bundles) bundles.classList.toggle('scope-off', activeScopes.size !== 3); if (bundlesNav) bundlesNav.classList.toggle('scope-off', activeScopes.size !== 3); const vpp = document.getElementById('vpp'); const vppNav = $('.nav-item[data-target="vpp"]'); if (vpp) vpp.classList.toggle('scope-off', !activeScopes.has('storage')); if (vppNav) vppNav.classList.toggle('scope-off', !activeScopes.has('storage'));
  let number = 2;
  ['site', 'layout', 'solar', 'storage', 'ev', 'bundles', 'vpp', 'investment', 'economics'].forEach(sectionId => { const section = document.getElementById(sectionId); const nav = $(`.nav-item[data-target="${sectionId}"]`); if (!section || section.classList.contains('scope-off')) { if (nav) nav.classList.toggle('scope-off', !section || section.classList.contains('scope-off')); return; } const label = String(number).padStart(2, '0'); const kicker = section.querySelector('.section-kicker'); if (kicker) kicker.textContent = kicker.textContent.replace(/^\d+\s*\/\s*/, `${label} / `); if (nav) nav.querySelector('span').textContent = label; number += 1; });
  const count = $('#scopeCount'); if (count) count.textContent = `${activeScopes.size} of 3`; const overviewNav = $('.nav-item[data-target="overview"]'); if (overviewNav) overviewNav.querySelector('span').textContent = '01';
}
$$('.scope-toggle, .top-scope-toggle').forEach(toggle => toggle.addEventListener('change', () => { $$('.scope-toggle, .top-scope-toggle').filter(control => control.dataset.scope === toggle.dataset.scope).forEach(control => { control.checked = toggle.checked; }); updateScopeUI(); applyScopeCopy(); }));
$$('.segmented button').forEach(button => button.addEventListener('click', () => { $$('.segmented button').forEach(item => item.classList.remove('selected')); button.classList.add('selected'); }));
$$('.scope-toggle, .top-scope-toggle').forEach(control => { control.checked = activeBid.scopes[control.dataset.scope] !== false; });
$$('.bid-card').forEach(card => { card.tabIndex = 0; card.setAttribute('role', 'link'); const open = () => { window.location.href = `?bid=${encodeURIComponent(card.dataset.bid)}`; }; card.addEventListener('click', open); card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } }); });
$('#backHome')?.addEventListener('click', () => { window.location.href = './'; });
$('#newBidButton')?.addEventListener('click', () => { const toast = $('#toast'); if (toast) { toast.textContent = 'New bid workspace coming next — choose an existing bid to begin.'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3200); } });
$('#shareButton').addEventListener('click', async () => { const shareUrl = `${window.location.href.split('#')[0]}#view=${encodeURIComponent($('#storeName').textContent.trim())}`; try { await navigator.clipboard.writeText(shareUrl); } catch { const fallback = document.createElement('textarea'); fallback.value = shareUrl; document.body.appendChild(fallback); fallback.select(); document.execCommand('copy'); fallback.remove(); } const toast = $('#toast'); toast.textContent = 'View-only link copied to clipboard.'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3200); });

updateScopeUI();
if (activeBidId) { renderReport(); setText('.breadcrumb strong', activeBid.locationLabel); document.title = `Bidwise — ${state.overview.siteName} Proposal`; } else { document.title = 'Bidwise — Sales Workspace'; }
