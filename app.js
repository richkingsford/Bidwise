const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let proposalCardCatalog = null;
let proposalCardCatalogDefaults = null;
let proposalCardDefaultsApplied = false;
let udotAadtRecord = null;
let utahEvRegistrationRecord = null;
let overturePlacesRecord = null;
let osmOverpassRecord = null;
let nlrStationsRecord = null;
let carDealershipGapRecord = null;
let apartmentGapRecord = null;
let regionalDataRecord = null;
let rockyMountainPowerRatesRecord = null;

const applyProductBranding = () => {
  document.title = document.title.replace(/Bidwise/gi, 'GetEV');
  document.querySelectorAll('.brand-mark').forEach(node => {
    node.textContent = 'EV';
    node.setAttribute('aria-label', 'GetEV electric vehicle mark');
  });
  document.querySelectorAll('.marketing-proof-mark').forEach(node => { node.textContent = 'G'; });
  document.querySelectorAll('.brand>span:nth-child(2),.home-brand>span:nth-child(2)').forEach(node => { node.textContent = 'GetEV'; });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => { node.nodeValue = node.nodeValue.replace(/Bidwise/gi, 'GetEV'); });
};
applyProductBranding();

const themeLink = document.createElement('link'); themeLink.rel = 'stylesheet'; themeLink.href = 'styles.css?v=slide7-option-cards-restored-20260910'; document.head.appendChild(themeLink);
const editOutlineOverride = document.createElement('style'); editOutlineOverride.textContent = '.inline-editing{outline:1px dashed #59616a88!important;outline-offset:3px!important;}'; document.head.appendChild(editOutlineOverride);

function setPresentationMode(mode) {
  const definitions = mode === 'definitions';
  const viewOnly = mode === 'view';
  document.body.classList.toggle('view-only', viewOnly);
  document.body.classList.toggle('edit-mode', !viewOnly);
  document.body.classList.toggle('definitions-mode', definitions);
  const definitionsView = $('#definitionsView');
  if (definitionsView) definitionsView.hidden = !definitions;
  const presentationMenu = $('#presentationMenu');
  if (presentationMenu && mode !== 'print') presentationMenu.value = definitions ? 'definitions' : viewOnly ? 'view' : 'edit';
  if (definitions) { closeConfig?.(); renderDefinitionsView(); return; }
  if (viewOnly) {
    $$('.inline-editing').forEach(field => { field.contentEditable = false; field.classList.remove('inline-editing'); });
    closeConfig?.();
  }
  syncInlineEditing();
}

const defaults = {
  overview: { siteName: 'Kneaders Bakery & Cafe', proposalName: 'Kneaders Bakery & Cafe Orem, Utah', location: '1960 State Street, Orem, Utah 84057', proposalDate: '2026-08-07', status: 'Prepared', savingsRate: 90, co2Factor: 0.72 },
  site: { footprint: 4200, utilitySpend: 48000, annualKwh: 320000, peakDemand: 165, openHours: 14, selfConsumption: 92, provider: 'Rocky Mountain Power', tariff: 'Commercial GS-2', energyRate: 0.15, demandRate: 4.35, exportRate: 0.06, onsiteValue: 0.15, latitude: 40.333002, longitude: -111.712338, mapRadius: 5 },
  solar: { arrayKw: 410, productionRatio: 2463, moduleW: 545, warranty: 25, manufacturer: 'Bifacial Solar Co.', model: 'BH-545-M10', installation: 'Fixed-tilt rooftop', chartHigh: 96, chartLow: 48, chartStd: 18, chartShape: 'Normal bell curve', dataTable: '' },
  storage: { capacityMwh: 1.2, powerKw: 600, shavePct: 19, dispatchHours: 4, batteryEfficiency: 90, manufacturer: 'Torus', model: 'Torus Spin', ratedCapacity: 1.2, investment: 235000, controls: 'Hybrid controller + secure monitoring' },
  ev: { marketProofVisitsPerDay: 210, marketProofPorts: 8, marketProofAverageSessionMinutes: 24, marketProofSessions3m: 17679, marketProofDays: 84, observedCharges3m: 25114, sourceWindow: '12 complete weeks', ports: 8, averageSessionMinutes: 24, forecastYear1Utilization: 7.7, forecastYear3Utilization: 15.4, forecastYear5Utilization: 19.1, restaurantCaptureRate: 30, conservativeReceipt: 18, averageReceipt: 25, highReceipt: 32, daysPerYear: 365, energyPerSessionKwh: 30, chargingPricePerKwh: 0.45, utilityEnergyCostPerKwh: 0.12, networkCostPerPortMonth: 85, maintenanceCostPerPortYear: 550, dailyTraffic: 32689, siteVisibilityScore: 8, entryExitScore: 8, travelRouteDistance: 1.7, amenityScore: 20, competitorCongestionScore: 7, currentBevPopulation: 6200, historicalBevGrowthPct: 24, projectedBevFleet: 15000, teslaMixPct: 48, trafficGrowthPct: 2.4, futureChargerConstruction: 3, publicFastChargingBehaviorPct: 68, investmentModel: 'Full ownership', parkingLeasePerSpotMonth: 200, managementFeePerPortMonth: 125, evpinLink: '' },
  bundles: { critterGuard: 27500, lighting: 41250, hvac: 93193.39, hvacBase: 71687.22, coordination: 0 },
  vpp: { demandResponse: 12000, reservePct: 20, status: 'Subject to utility approval', controls: 'Secure dispatch + monitoring', customerValue: 'Peak management, resilience, bill control', utilityValue: 'Local capacity and summer peak support', workPlan: 'Metering → cybersecurity → dispatch testing → agreement' },
  investment: { solar: 820000, solarModules: 139400, solarInverters: 86600, solarRacking: 93600, solarBos: 131700, solarLabor: 255800, solarEngineering: 62300, solarCommissioning: 50600, battery: 235000, ev: 1200000, siteImprovements: 110000, incentivePct: 30, ownership: 'Customer-owned', placedInService: 'Year 1', taxAdvisor: 'Tax professional / incentive review' },
  economics: { escalation: 3, period: 20, discountRate: 8, annualOpex: 18000, taxBenefitPct: 30 },
  layout: { mapZoom: 19, defaultLineColor: '#ff5b68', designNote: 'Verify stall dimensions, ADA clearances, utility locate, and final trench depth in construction documents.' },
  lender: { dealershipPrivateChargerDiscount: 0, utilityCapacityScore: 7, tariffDemandChargeScore: 6, permittingScore: 6, incentiveEligibilityScore: 7, constructionCostScore: 6, safetyVandalismScore: 7, cellularConnectivityScore: 8, uptimeMaintenanceScore: 8, debtServiceCoverageScore: 7 }
};

const bidProfiles = {
  'copper-fork-grill-american-fork': { label: 'Copper Fork Grill', locationLabel: 'AMERICAN FORK, UT', scopes: { solar: true, storage: true, ev: true }, overrides: { overview: { proposalName: 'Copper Fork Grill American Fork, Utah', siteName: 'Copper Fork Grill', location: '789 W Main Street, American Fork, Utah 84003', proposalDate: '2026-08-14', status: 'Prepared', savingsRate: 26.4 }, site: { footprint: 18500, utilitySpend: 126000, annualKwh: 840000, peakDemand: 410, openHours: 16, latitude: 40.3769, longitude: -111.7958, mapRadius: 5 }, solar: { arrayKw: 285, productionRatio: 2463, moduleW: 545, installation: 'Fixed-tilt rooftop', manufacturer: 'Bifacial Solar Co.', model: 'BH-545-M10' }, storage: { capacityMwh: 1.2, powerKw: 600, shavePct: 19, dispatchHours: 4, investment: 235000 }, ev: { dcFast: 8, level2: 4, ports: 12, averageSessionMinutes: 28, forecastYear1Utilization: 8.5, forecastYear3Utilization: 14.2, forecastYear5Utilization: 17.1, restaurantCaptureRate: 25, averageReceipt: 24, daysPerYear: 365 }, vpp: { demandResponse: 18000, reservePct: 20 }, investment: { solar: 610000, battery: 235000, ev: 285000, siteImprovements: 95000 } } },
  'kneaders-orem': { label: 'Kneaders Bakery & Cafe', locationLabel: 'OREM, UT', scopes: { solar: false, storage: false, ev: true }, overrides: { overview: { proposalName: 'Kneaders Bakery & Cafe Orem, Utah', siteName: 'Kneaders Bakery & Cafe', location: '1960 State Street, Orem, Utah 84057', proposalDate: '2026-08-14', status: 'Prepared' }, site: { latitude: 40.333002, longitude: -111.712338, mapRadius: 5 }, ev: { marketProofVisitsPerDay: 210, marketProofPorts: 8, marketProofAverageSessionMinutes: 24, marketProofSessions3m: 17679, marketProofDays: 84, observedCharges3m: 25114, sourceWindow: '12 complete weeks', ports: 8, averageSessionMinutes: 24, forecastYear1Utilization: 7.7, forecastYear3Utilization: 15.4, forecastYear5Utilization: 19.1, restaurantCaptureRate: 30, conservativeReceipt: 18, averageReceipt: 25, highReceipt: 32, daysPerYear: 365, energyPerSessionKwh: 30, chargingPricePerKwh: 0.45, dailyTraffic: 43000, trafficSource: 'UDOT', trafficSourceRecordId: '049-0285', trafficRoadName: 'SR 89 Orem', trafficDataYear: 2024, trafficSourceUrl: 'https://connect.udot.utah.gov/business/traffic-data/traffic-statistics/', currentBevPopulation: 16437, evRegistrationSource: 'Utah State Tax Commission', evRegistrationYear: 2026, evRegistrationObservationDate: '2026-02-16', amenityScore: 36, amenitySource: 'Overture Maps Places', amenityRadiusKm: 1, amenityDataRelease: '2026-08-19.0', parkingLeasePerSpotMonth: 200 }, investment: { ev: 1200000 } } },
  'kneaders-orem-ev': { label: 'Kneaders Bakery & CafeOrem EV', locationLabel: 'OREM, UT', scopes: { solar: false, storage: false, ev: true }, overrides: { overview: { proposalName: 'Kneaders Bakery & Cafe Orem, Utah', siteName: 'Kneaders Bakery & Cafe', location: '1960 State Street, Orem, Utah 84057', proposalDate: '2026-08-14', status: 'Prepared' }, site: { latitude: 40.333002, longitude: -111.712338, mapRadius: 5 }, ev: { marketProofVisitsPerDay: 210, marketProofPorts: 8, marketProofAverageSessionMinutes: 24, marketProofSessions3m: 17679, marketProofDays: 84, observedCharges3m: 25114, sourceWindow: '12 complete weeks', ports: 8, averageSessionMinutes: 24, forecastYear1Utilization: 7.7, forecastYear3Utilization: 15.4, forecastYear5Utilization: 19.1, restaurantCaptureRate: 30, conservativeReceipt: 18, averageReceipt: 25, highReceipt: 32, daysPerYear: 365, energyPerSessionKwh: 30, chargingPricePerKwh: 0.45, amenityScore: 20, parkingLeasePerSpotMonth: 200 }, investment: { ev: 1200000 } } },
  'maverick-lehi-solar': { label: 'MaverikLehi solar', locationLabel: 'LEHI, UT', scopes: { solar: true, storage: false, ev: false }, overrides: { overview: { proposalName: 'Maverik #412 Lehi, Utah', siteName: 'Maverik #412', location: '760 E Main Street, Lehi, Utah 84043', proposalDate: '2026-08-10', savingsRate: 24.1 }, site: { footprint: 5200, utilitySpend: 62000, annualKwh: 412000, peakDemand: 220, latitude: 40.391617, longitude: -111.849055, mapRadius: 4 }, solar: { arrayKw: 185, productionRatio: 2463, moduleW: 545, installation: 'Fixed-tilt rooftop', manufacturer: 'Bifacial Solar Co.', model: 'BH-545-M10' }, storage: { capacityMwh: 0, powerKw: 0, shavePct: 0, dispatchHours: 0, investment: 0 }, ev: { dcFast: 0, level2: 0 }, vpp: { demandResponse: 0, reservePct: 0 }, investment: { solar: 415000, battery: 0, ev: 0, siteImprovements: 42000 } } },
  'target-lehi-solar-battery': { label: 'TargetLehi solar + battery', locationLabel: 'LEHI, UT', scopes: { solar: true, storage: true, ev: false }, overrides: { overview: { proposalName: 'Target Store #2234 Lehi, Utah', siteName: 'Target Store #2234', location: '1250 E Timpanogos Highway, Lehi, Utah 84043', proposalDate: '2026-08-10', savingsRate: 25.7 }, site: { footprint: 128000, utilitySpend: 98000, annualKwh: 650000, peakDemand: 310, latitude: 40.416170, longitude: -111.848840, mapRadius: 4 }, solar: { arrayKw: 210, productionRatio: 2463, moduleW: 545, installation: 'Fixed-tilt rooftop', manufacturer: 'Bifacial Solar Co.', model: 'BH-545-M10' }, storage: { capacityMwh: 0.8, powerKw: 400, shavePct: 22, dispatchHours: 2, investment: 168000 }, ev: { dcFast: 0, level2: 0 }, investment: { solar: 472000, battery: 168000, ev: 0, siteImprovements: 65000 } } }
};
const localBidStorageKey = 'GetEV-local-bids';
const archivedBidStorageKey = 'GetEV-archived-bids';
const readLocalBids = () => { try { return JSON.parse(localStorage.getItem(localBidStorageKey) || '{}'); } catch { return {}; } };
const readArchivedBids = () => { try { return new Set(JSON.parse(localStorage.getItem(archivedBidStorageKey) || '[]')); } catch { return new Set(); } };
Object.assign(bidProfiles, readLocalBids());
const routeParams = new URLSearchParams(window.location.search);
const activeBidId = bidProfiles[routeParams.get('bid')] ? routeParams.get('bid') : null;
const activeBid = bidProfiles[activeBidId || 'kneaders-orem'];
const viewOnlyUrl = window.location.hash.startsWith('#view=');
const canonicalProposalUrl = Boolean(routeParams.get('bid') && (!routeParams.has('copy') || viewOnlyUrl));
if (canonicalProposalUrl || viewOnlyUrl) document.body.classList.add('canonical-proposal', 'view-only');
const decodeCopyPayload = value => { if (!value) return null; try { const normalized = value.replace(/-/g, '+').replace(/_/g, '/'); const binary = atob(normalized); const bytes = Uint8Array.from(binary, char => char.charCodeAt(0)); const payload = JSON.parse(new TextDecoder().decode(bytes)); return payload?.version === 1 && payload?.bidId === activeBidId && payload?.state && typeof payload.state === 'object' ? payload : null; } catch { return null; } };
const copiedProposal = decodeCopyPayload(routeParams.get('copy'));
const proposalScopes = { ...activeBid.scopes, ...(copiedProposal?.scopes || {}) };
if (proposalScopes.lenderSupport == null) proposalScopes.lenderSupport = false;
const inlineEditStorageKey = `GetEV-inline-edits:${activeBidId || 'home'}`;
const storedInlineEdits = (() => { try { return JSON.parse(localStorage.getItem(inlineEditStorageKey) || '{}'); } catch { return {}; } })();
let inlineEdits = canonicalProposalUrl ? {} : (copiedProposal?.inlineEdits && typeof copiedProposal.inlineEdits === 'object' ? copiedProposal.inlineEdits : storedInlineEdits);
const isEvOnlyBid = ['kneaders-orem', 'kneaders-orem-ev'].includes(activeBidId) || ['kneaders-orem', 'kneaders-orem-ev'].includes(activeBid?.sourceBidId);
// A copied proposal uses the Kneaders page structure, but it is never Kneaders-specific content.
const isKneadersReferenceProposal = isEvOnlyBid && !copiedProposal;
const homeBidStatuses = { 'kneaders-orem': 'Prepared', 'kneaders-orem-ev': 'Prepared', 'copper-fork-grill-american-fork': 'Prepared', 'maverick-lehi-solar': 'In review', 'target-lehi-solar-battery': 'Ready to present' };
const dashboardCompactMoney = value => {
  const amount = Number(value || 0);
  return Math.abs(amount) >= 1e6 ? `$${(amount / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })}M` : `$${(amount / 1e3).toLocaleString(undefined, { maximumFractionDigits: 1 })}K`;
};
const dashboardNumber = value => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const homeBidMetrics = bidId => {
  const ev = { ...defaults.ev, ...(bidProfiles[bidId]?.overrides?.ev || {}) };
  const dailyVisits = ev.ports * 24 * (ev.forecastYear5Utilization / 100) / Math.max(0.01, ev.averageSessionMinutes / 60);
  const dailyParties = Math.round(dailyVisits * ev.restaurantCaptureRate / 100);
  const annualFootTrafficRevenue = dailyParties * ev.averageReceipt * ev.daysPerYear;
  const values = { footTrafficRevenue: `${dashboardCompactMoney(annualFootTrafficRevenue)} / yr`, marketProofVisits: `${dashboardNumber(ev.marketProofVisitsPerDay)} / day`, year5Visits: `${dashboardNumber(dailyVisits)} / day` };
  const metrics = proposalCardCatalog?.dashboard?.[bidId]?.metrics;
  return metrics?.length ? metrics.map(metric => [metric.label, metric.value ?? values[metric.valueSource] ?? '']) : [
    ['FOOT TRAFFIC REVENUE', values.footTrafficRevenue],
    ['MARKET PROOF CHARGES', values.marketProofVisits],
    ['YEAR 5 DAILY FORECAST', values.year5Visits]
  ];
};
$$('.bid-card').forEach(card => { const status = homeBidStatuses[card.dataset.bid]; if (!status) return; const badge = card.querySelector('.bid-status'); if (badge) badge.textContent = status.toUpperCase(); });
$$('.bid-card').forEach(card => { const metrics = homeBidMetrics(card.dataset.bid); card.querySelectorAll('.bid-metrics > div').forEach((metric, index) => { const [label, value] = metrics[index]; metric.querySelector('small').textContent = label; metric.querySelector('strong').textContent = value; }); });
const homeFooterCount = document.querySelector('.home-footer span:first-child'); if (homeFooterCount) homeFooterCount.innerHTML = `<i class="live-dot"></i> ${$$('.bid-card').length} active proposals`;
document.body.classList.toggle('home-mode', !activeBidId);
const bidDefaults = Object.fromEntries(Object.entries(defaults).map(([section, values]) => [section, { ...values, ...(activeBid.overrides[section] || {}) }]));
const assumptionStorageKey = `GetEV-assumptions:${activeBidId || 'home'}`;
const savedState = (() => { try { return JSON.parse(localStorage.getItem(assumptionStorageKey) || localStorage.getItem('GetEV-assumptions') || 'null'); } catch { return null; } })();
const importedSource = isEvOnlyBid ? 'kneaders-orem-ev-only-paren-20260802' : `bid-${activeBidId}`;
const reusableState = (!viewOnlyUrl && copiedProposal?.state) || (!canonicalProposalUrl && (savedState?.meta?.bidId === (activeBidId || 'home') || (isEvOnlyBid && savedState?.meta?.source === importedSource)) ? savedState : null);
const state = Object.fromEntries(Object.entries(bidDefaults).map(([section, values]) => [section, { ...values, ...(reusableState?.[section] || {}) }]));
const legacyKneadersSpendCases = [[10, 17, 26], [12, 20, 30]];
if (isEvOnlyBid && !reusableState?.meta?.spendCasesVersion) {
  const currentCases = [Number(state.ev.conservativeReceipt), Number(state.ev.averageReceipt), Number(state.ev.highReceipt)];
  if (legacyKneadersSpendCases.some(legacy => legacy.every((value, index) => value === currentCases[index]))) Object.assign(state.ev, { conservativeReceipt: 18, averageReceipt: 25, highReceipt: 32 });
}
if (isEvOnlyBid && !reusableState?.meta?.guestRevenueVersion && Number(state.ev.forecastYear5Utilization) <= 17.1) state.ev.forecastYear5Utilization = 19.1;
const storedCompanyBranding = (() => { try { return JSON.parse(localStorage.getItem('GetEV-company-branding') || '{}'); } catch { return {}; } })();
state.brand = { companyName: 'GetEV Energy', tagline: 'Commercial energy projects, made decision-ready.', proposalSlogan: 'One accountable installation team.', companyLogo: 'assets/getev-placeholder-logo.svg', companyPhoto: '', ...(storedCompanyBranding || {}), ...(reusableState?.brand || {}) };
state.brand.companyLogo ||= 'assets/getev-placeholder-logo.svg';
const evInvestmentModels = ['Lease parking space', '50/50', 'Full ownership'];
if (proposalScopes.ev && !evInvestmentModels.includes(state.ev.investmentModel)) state.ev.investmentModel = 'Lease parking space';
const standardProposalName = () => `${state.overview.siteName} ${state.overview.location.split(',').slice(-2).join(',').trim()}`;
if (!state.overview.proposalName || /Energy Proposal|Solar Proposal|Solar \+ Battery Proposal/.test(state.overview.proposalName)) state.overview.proposalName = standardProposalName();
if (activeBidId) state.overview.savingsRate = 90;
if (activeBidId === 'maverick-lehi-solar') state.economics.annualOpex = 5200;
if (activeBidId === 'target-lehi-solar-battery') state.economics.annualOpex = 8100;
state.meta = { source: copiedProposal ? `copy-${activeBidId}` : importedSource, bidId: activeBidId || 'home', spendCasesVersion: isEvOnlyBid ? 1 : undefined, guestRevenueVersion: isEvOnlyBid ? 1 : undefined, scenarios: { ...(reusableState?.meta?.scenarios || {}) }, expandedAssumptions: { ...(reusableState?.meta?.expandedAssumptions || {}) } };
const saveState = () => { const serialized = JSON.stringify(state); localStorage.setItem(assumptionStorageKey, serialized); localStorage.setItem('GetEV-assumptions', serialized); };
const money = (n, digits = 0) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits })}`;
const compactMoney = (n) => Math.abs(n) >= 1e6 ? `${money(n / 1e6, 2)}M` : `${money(n / 1e3, 1)}K`;
const roundedMoney = (n, increment = 100) => money(Math.round(Number(n || 0) / increment) * increment);
const approximateMoney = n => money(Math.round(Number(n || 0) / 1000) * 1000);
const number = (n, digits = 0) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
const esc = (value) => String(value ?? '')
  .replace(/EDITABLE PLANNING INPUTS\s*[·•|:-]*\s*REPLACE WITH ACTUAL AVERAGE PARTY TICKET WHEN AVAILABLE/gi, '')
  .replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
const sourceHref = label => {
  const text = String(label || '').toLowerCase();
  if (text.includes('nlr') || text.includes('alternative fuels data center')) return 'https://developer.nlr.gov/docs/transportation/alt-fuel-stations-v1/nearest/';
  if (text.includes('udot')) return 'https://connect.udot.utah.gov/business/traffic-data/traffic-statistics/';
  if (text.includes('tax commission')) return 'https://tax.utah.gov/commission/econstats/mv/registrations/';
  if (text.includes('overture')) return 'https://docs.overturemaps.org/guides/places/';
  if (text.includes('openstreetmap')) return 'https://dev.overpass-api.de/overpass-doc/en/';
  if (text.includes('rocky mountain power') || text.includes('rmp') || text.includes('utility tariff')) return 'https://www.rockymountainpower.net/about/rates-regulation/utah-rates-tariffs.html';
  if (text.includes('kneaders menu') || text.includes('official kneaders')) return 'https://www.kneaders.com/menu';
  return '';
};
const sourceReliability = label => {
  const text = String(label || '').toLowerCase();
  if (text.includes('udot')) return 'Official annual roadway count published by UDOT; reliable for the stated road segment and observation year, not a live traffic feed.';
  if (text.includes('tax commission')) return 'Official Utah registration record; reliable for the stated geography, vehicle category, and reporting snapshot.';
  if (text.includes('overture')) return 'Open geospatial place inventory with release metadata; useful for bounded amenity counts, but place coverage and categories can change.';
  if (text.includes('openstreetmap') || text.includes('overpass')) return 'Open volunteered geographic data; useful as a transparent fallback, but coverage and freshness vary by place.';
  if (text.includes('nlr') || text.includes('alternative fuels')) return 'U.S. DOE/NLR station inventory; useful for public station infrastructure, power, access, and network details. It does not provide utilization.';
  if (text.includes('observed') || text.includes('session')) return 'Observed charging-session dataset supplied for this proposal; useful for the stated observation window, but it is not a live utilization feed.';
  if (text.includes('rocky mountain power') || text.includes('rmp') || text.includes('utility tariff')) return 'Rocky Mountain Power’s official Utah tariff and price-summary materials; useful for published energy and demand-rate schedules, not a customer’s actual bill.';
  if (text.includes('kneaders menu') || text.includes('official kneaders')) return 'Kneaders’ official public menu; useful as a product-price reference, not as the restaurant’s average transaction value.';
  if (text.includes('pos') || text.includes('point-of-sale')) return 'Kneaders POS data is not connected. An owner-provided transaction export is required to calculate a defensible average party spend.';
  if (text.includes('property') || text.includes('site visit') || text.includes('site access')) return 'Owner property records and site verification are not connected. These inputs require plans, a site walk, or owner confirmation.';
  if (text.includes('quote') || text.includes('agreement') || text.includes('vendor')) return 'Vendor quotes and executed agreements are not connected. These inputs require project-specific commercial documents.';
  if (text.includes('configured') || text.includes('project input') || text.includes('forecast')) return 'Configured proposal input or forecast; no external record is connected for this value.';
  if (text.includes('independent') || text.includes('forecast') || text.includes('assumption')) return 'Model input or forecast; review the underlying assumption and replace it with project-specific evidence when available.';
  return 'Source metadata and reliability notes are available for review.';
};
const sourceLabelMarkup = label => { if (!document.body.classList.contains('definitions-mode')) return ''; const href = sourceHref(label); const note = esc(sourceReliability(label)); return href ? `<a class="card-source-link" href="${href}" target="_blank" rel="noreferrer" title="${note}">${esc(label)} ↗</a>` : `<span class="source-note" title="${note}" data-tooltip="${note}" role="button" tabindex="0">${esc(label)} <span class="source-info" aria-hidden="true">?</span></span>`; };
const manualInputMarkup = (resources = 'site documents, vendor quotes, utility records, and operating data') => {
  const text = String(resources || '').toLowerCase();
  const sources = [];
  const add = (label, detail = label) => { if (!sources.some(item => item.label === label)) sources.push({ label, detail }); };
  if (text.includes('udot')) add('UDOT AADT');
  if (text.includes('nlr') || text.includes('afdc')) add('NLR/AFDC');
  if (text.includes('overture')) add('Overture Maps Places');
  if (text.includes('openstreetmap') || text.includes('overpass')) add('OpenStreetMap / Overpass');
  if (text.includes('observed') || text.includes('session')) add('Supplied observed charging-session data');
  if (text.includes('utility') || text.includes('tariff') || text.includes('rocky mountain')) add('Rocky Mountain Power tariff');
  if (text.includes('kneaders') && text.includes('menu')) add('Official Kneaders menu');
  if (text.includes('pos') || text.includes('point-of-sale') || text.includes('party-spend') || text.includes('party spend')) add('Kneaders POS data — not connected');
  if (text.includes('property') || text.includes('site visit') || text.includes('site-fit') || text.includes('site access') || text.includes('operating-team')) add('Owner property records — not connected');
  if (text.includes('quote') || text.includes('agreement') || text.includes('vendor')) add('Project/vendor documents — not connected');
  if (text.includes('forecast') || text.includes('assumption') || text.includes('input')) add('Configured forecast input');
  if (!sources.length) add(resources);
  return sources.map(item => sourceLabelMarkup(item.label)).join('');
};
document.addEventListener('click', event => { const trigger = event.target.closest('.source-note,.manual-input-note'); if (!trigger) { $$('.source-note.is-open,.manual-input-note.is-open').forEach(item => item.classList.remove('is-open')); return; } event.preventDefault(); $$('.source-note.is-open,.manual-input-note.is-open').filter(item => item !== trigger).forEach(item => item.classList.remove('is-open')); trigger.classList.toggle('is-open'); });
document.addEventListener('keydown', event => { if (event.key !== 'Enter' && event.key !== ' ') return; const trigger = event.target.closest('.source-note,.manual-input-note'); if (!trigger) return; event.preventDefault(); trigger.click(); });

const proposalCardsReady = fetch(`proposal-cards.json?v=${Date.now()}`, { cache: 'no-store' })
  .then(response => response.ok ? response.json() : null)
  .then(catalog => { proposalCardCatalog = catalog?.version ? catalog : null; proposalCardCatalogDefaults = proposalCardCatalog ? JSON.parse(JSON.stringify(proposalCardCatalog)) : null; return proposalCardCatalog; })
  .catch(() => null);
const udotAadtReady = fetch(`udot-aadt-data.json?v=${Date.now()}`, { cache: 'no-store' })
  .then(response => response.ok ? response.json() : null)
  .then(record => { udotAadtRecord = record?.source === 'UDOT' && Number.isFinite(Number(record.aadt)) ? record : null; return udotAadtRecord; })
  .catch(() => null);
const utahEvRegistrationsReady = fetch(`utah-ev-registrations-data.json?v=${Date.now()}`, { cache: 'no-store' })
  .then(response => response.ok ? response.json() : null)
  .then(record => { utahEvRegistrationRecord = record?.source === 'Utah State Tax Commission' && Number.isFinite(Number(record.count)) ? record : null; return utahEvRegistrationRecord; })
  .catch(() => null);
const overturePlacesReady = fetch(`overture-places-data.json?v=${Date.now()}`, { cache: 'no-store' })
  .then(response => response.ok ? response.json() : null)
  .then(record => { overturePlacesRecord = record?.source === 'Overture Maps Places' && Number.isFinite(Number(record.foodAndDrinkPlaceCountWithinRadius)) ? record : null; return overturePlacesRecord; })
  .catch(() => null);
const osmOverpassReady = fetch(`osm-overpass-data.json?v=${Date.now()}`, { cache: 'no-store' })
  .then(response => response.ok ? response.json() : null)
  .then(record => { osmOverpassRecord = record?.source === 'OpenStreetMap Overpass' && Number.isFinite(Number(record.foodAndDrinkPlaceCountWithinRadius)) ? record : null; return osmOverpassRecord; })
  .catch(() => null);
const nlrStationsReady = activeBidId && proposalScopes.ev ? fetch(`https://us-central1-bidwise-production.cloudfunctions.net/nlrStations?latitude=${encodeURIComponent(state.site.latitude)}&longitude=${encodeURIComponent(state.site.longitude)}&radius=10`, { cache: 'no-store' })
  .then(response => response.ok ? response.json() : null)
  .then(record => { nlrStationsRecord = record?.source === 'NLR/AFDC' && Array.isArray(record.stations) ? record : null; return nlrStationsRecord; })
  .catch(() => null) : Promise.resolve(null);
const carDealershipGapReady = fetch(`car-dealerships-without-ev-chargers-data.json?v=${Date.now()}`, { cache: 'no-store' })
  .then(response => response.ok ? response.json() : null)
  .then(record => { carDealershipGapRecord = record?.category === 'Car dealerships without EV chargers' && Array.isArray(record.records) ? record : null; return carDealershipGapRecord; })
  .catch(() => null);
const apartmentGapReady = fetch(`apartment-complexes-without-chargers-data.json?v=${Date.now()}`, { cache: 'no-store' })
  .then(response => response.ok ? response.json() : null)
  .then(record => { apartmentGapRecord = record?.category === 'Apartment complexes without chargers' && Array.isArray(record.records) ? record : null; return apartmentGapRecord; })
  .catch(() => null);
const regionalDataReady = fetch(`regional-data-sources.json?v=${Date.now()}`, { cache: 'no-store' })
  .then(response => response.ok ? response.json() : null)
  .then(record => { regionalDataRecord = Array.isArray(record?.states) ? record : null; return regionalDataRecord; })
  .catch(() => null);
const rockyMountainPowerRatesReady = fetch(`rocky-mountain-power-utah-rates.json?v=${Date.now()}`, { cache: 'no-store' })
  .then(response => response.ok ? response.json() : null)
  .then(record => { rockyMountainPowerRatesRecord = record?.source === 'Rocky Mountain Power' && Number.isFinite(Number(record.annualWeightedEnergyRatePerKwh)) ? record : null; return rockyMountainPowerRatesRecord; })
  .catch(() => null);

const stateCodeFromLocation = location => String(location || '').match(/(?:,|\s)([A-Z]{2})(?:\s|$)/i)?.[1]?.toUpperCase() || '';
const regionalSourceForLocation = location => regionalDataRecord?.states?.find(item => item.state === stateCodeFromLocation(location)) || null;
const applyRegionalSourceContext = () => {
  const source = regionalSourceForLocation(state.overview.location);
  if (!source || stateCodeFromLocation(state.overview.location) === 'UT') return false;
  const alreadyMapped = state.ev.regionalSourceState === source.state && state.ev.regionalTrafficSourceUrl === source.traffic.url;
  Object.assign(state.ev, { regionalSourceState: source.state, regionalTrafficSource: source.traffic.name, regionalTrafficSourceUrl: source.traffic.url, regionalEvRegistrationSource: source.evRegistrations.name, regionalEvRegistrationSourceUrl: source.evRegistrations.url, regionalImportStatus: 'ready-for-import' });
  return !alreadyMapped;
};
const refreshRegionalSourceLabels = () => {
  const source = regionalSourceForLocation(state.overview.location); if (!source || stateCodeFromLocation(state.overview.location) === 'UT') return;
  const trafficCard = $('#evDailyTraffic')?.closest('article'); const trafficNote = trafficCard?.querySelector('small'); if (trafficNote) trafficNote.textContent = state.ev.regionalImportStatus === 'live' ? `${state.ev.trafficSource}${state.ev.trafficDataYear || 'current'}` : `${source.traffic.name}import pending`;
  const growthCard = $('#evCurrentBevPopulation')?.closest('article'); const growthNote = growthCard?.querySelector('small'); if (growthNote) growthNote.textContent = `${source.evRegistrations.name}import pending`;
};
const regionalTrafficReady = activeBidId && ['CO', 'NV', 'AZ', 'OR', 'ID'].includes(stateCodeFromLocation(state.overview.location)) ? fetch(`https://us-central1-bidwise-production.cloudfunctions.net/regionalTraffic?state=${encodeURIComponent(stateCodeFromLocation(state.overview.location))}&latitude=${encodeURIComponent(state.site.latitude)}&longitude=${encodeURIComponent(state.site.longitude)}`, { cache: 'no-store' }).then(response => response.ok ? response.json() : null).catch(() => null) : Promise.resolve(null);
const applyRegionalTrafficRecord = record => {
  if (!record || !Number.isFinite(Number(record.aadt))) return false;
  const unchanged = state.ev.trafficSourceRecordId === String(record.sourceRecordId) && Number(state.ev.dailyTraffic) === Number(record.aadt);
  Object.assign(state.ev, { dailyTraffic: Number(record.aadt), trafficSource: record.source, trafficSourceRecordId: String(record.sourceRecordId), trafficRoadName: record.roadName || '', trafficDataYear: record.dataYear || null, trafficSourceUrl: record.sourceUrl || '', regionalImportStatus: 'live' });
  return !unchanged;
};
const applyRockyMountainPowerRates = record => {
  if (!record || !Number.isFinite(Number(record.annualWeightedEnergyRatePerKwh))) return false;
  const rate = Number(record.annualWeightedEnergyRatePerKwh);
  const changed = Number(state.ev.utilityEnergyCostPerKwh) !== rate || state.ev.utilityEnergyCostSource !== record.tariff;
  Object.assign(state.ev, { utilityEnergyCostPerKwh: rate, utilityEnergyCostSource: `${record.source}${record.tariff}`, utilityEnergyCostEffectiveDate: record.effectiveDate, utilityEnergyCostSourceUrl: record.rateSummaryUrl });
  return changed;
};

function cardCatalog(path, fallback = []) {
  return path.split('.').reduce((value, key) => value?.[key], proposalCardCatalog) || fallback;
}
function definitionIsEnabled(section, index) {
  const hidden = proposalCardCatalog?.ev?._hiddenDefinitionCards || {};
  return hidden[`${section}:${index}`] !== true;
}
function enabledCardSpecs(specs, section) {
  const enabled = section === 'financialCards.chargingRevenue'
    ? (specs || []).filter((_, index) => definitionIsEnabled('financialCards.chargingRevenue', index))
    : section === 'financialCards.expenses'
      ? (specs || []).filter((_, index) => definitionIsEnabled('financialCards.expenses', index))
      : (specs || []).filter((_, index) => definitionIsEnabled(section, index));
  return enabled.length ? enabled : (specs || []);
}
function renderJsonFinancialCards(container, specs, section = 'financialCards') {
  if (!container || !specs?.length) return;
  container.innerHTML = enabledCardSpecs(specs, section).map(spec => `<article data-card-key="${esc(spec.key)}"><span>${esc(spec.label)}</span><strong id="${esc(spec.valueId)}">${esc(spec.value || '—')}</strong><small>${esc(spec.description || '')}${spec.source ? `${sourceLabelMarkup(spec.source)}` : spec.manual ? `${manualInputMarkup(spec.resources)}` : ''}</small></article>`).join('');
}
function renderJsonSpendingCards(container, specs) {
  if (!container || !specs?.length) return;
  container.innerHTML = specs.map((spec, index) => definitionIsEnabled('spendingCases', index) ? `<article data-card-key="${esc(spec.key)}"><span>${esc(spec.label)}</span><strong id="${esc(spec.receiptId)}">${esc(spec.value || '—')}</strong><small>AVERAGE PARTY SPEND${spec.source ? sourceLabelMarkup(spec.source) : manualInputMarkup(spec.resources)}</small><div class="spend-periods"><span><small>DAY</small><b id="${esc(spec.dailyId)}">${esc(spec.daily || '—')}</b></span><span><small>MONTH</small><b id="${esc(spec.monthlyId)}">${esc(spec.monthly || '—')}</b></span><span><small>YEAR</small><b id="${esc(spec.annualId)}">${esc(spec.annual || '—')}</b></span></div></article>` : '').join('');
}
function renderJsonLocationMetrics(container, specs) {
  if (!container || !specs?.length) return;
  container.innerHTML = specs.map((spec, index) => { if (!definitionIsEnabled('locationMetrics', index)) return ''; const scale = spec.scale ? `<div class="metric-scale"><i></i><i></i><i></i></div><small><span>${esc(spec.scale.low || '')}</span><span>${esc(spec.scale.typical || '')}</span><b>${esc(spec.scale.high || '')}</b></small>` : ''; const action = spec.action ? `<b>${esc(spec.action)}</b>` : ''; const provenance = spec.source ? `<small class="metric-source">${sourceLabelMarkup(spec.source)}</small>` : spec.manual ? `<small class="metric-source">${manualInputMarkup(spec.resources)}</small>` : ''; return `<article class="ev-location-metric${spec.active ? ' active' : ''}" data-card-key="${esc(spec.key)}"><div><span>${esc(spec.label)}</span>${action}</div><strong id="${esc(spec.valueId)}">${esc(spec.value || '—')}</strong>${spec.descriptionId ? `<em id="${esc(spec.descriptionId)}"></em>` : `<em>${esc(spec.description || '')}</em>`}${spec.footnote ? `<p>${esc(spec.footnote)}</p>` : scale}${provenance}</article>`; }).join('');
}
function renderJsonScoreCards(container, specs) {
  if (!container || !specs?.length) return;
  container.innerHTML = specs.map(spec => `<article data-card-key="${esc(spec.key)}"><span>${esc(spec.label)}</span><strong id="${esc(spec.valueId)}"></strong><small>${esc(spec.description || '')}${spec.source ? `${sourceLabelMarkup(spec.source)}` : spec.manual ? `${manualInputMarkup(spec.resources)}` : ''}</small></article>`).join('');
}
function siteSnapshotMarkup(spec = {}) {
  const outlook = spec.outlook || { label: 'STATE BENCHMARK', value: 'CONTEXT PENDING', description: 'COMPARE A VERIFIED STATEWIDE METRIC', note: 'PLANNING SCENARIOS TRANSLATE DEMAND INTO DAILY VISITS' };
  const fleet = spec.fleet || { label: "UTAH COUNTY'S BEV FLEET HAS NEARLY DOUBLED IN TWO YEARS", source: 'UTAH STATE TAX COMMISSION  |  FEB 2026', stats: [] };
  const scenarios = (spec.scenarios || []).filter((scenario, index) => definitionIsEnabled('siteSnapshotMockup.scenarios', index));
  const fit = spec.fit || { label: 'WHY THIS LOCATION FITS THE CHARGING USE CASE', items: [] };
  const meaning = spec.meaning || { label: 'WHAT THIS MEANS', headline: '', note: '' };
  const scenarioProvenance = spec.scenarioProvenance?.source ? sourceLabelMarkup(spec.scenarioProvenance.source) : manualInputMarkup(spec.scenarioProvenance?.resources);
  return `<div class="ev-site-snapshot-mockup"><div class="site-snapshot-top"><article class="site-capture-outlook"><div><span>${esc(outlook.label)}</span><b>VIEW METHOD ›</b></div><strong id="evSnapshotOutlook">${esc(outlook.value)}</strong><em>${esc(outlook.description)}</em><small>${esc(outlook.note)}${manualInputMarkup('UDOT AADT, NLR/AFDC inventory, observed session data, and site-fit review')}</small></article><article class="site-fleet-card"><div><span>${esc(fleet.label)}</span><small>${sourceLabelMarkup(fleet.source)}</small></div><div class="site-fleet-stats">${(fleet.stats || []).map(stat => `<div><span>${esc(stat.label)}</span><strong>${esc(stat.value)}</strong><small>${esc(stat.note)}</small></div>`).join('')}</div></article></div><div class="site-snapshot-scenario-head"><span>${esc(spec.scenarioLabel || 'YEAR 5 PLANNING SCENARIOS')}</span><small>${esc(spec.scenarioMeta || '')}${scenarioProvenance}</small></div><div class="site-snapshot-scenarios">${scenarios.map(scenario => `<article class="site-scenario-card ${scenario.active ? 'active' : ''} accent-${esc(scenario.accent || 'blue')}" data-site-scenario="${esc(scenario.key)}"><div><span>${esc(scenario.label)}</span><small>YEAR 5</small></div><strong id="evSnapshot${esc(scenario.key)}Visits">${esc(scenario.visits || '')}</strong><em>CHARGING VISITS / DAY</em><div class="site-scenario-detail"><span><b id="evSnapshot${esc(scenario.key)}Util">${esc(scenario.utilization || '')}</b><small>UTILIZATION</small></span><span><b id="evSnapshot${esc(scenario.key)}Parties">${esc(scenario.parties || '')}</b><small>POTENTIAL PARTIES / DAY</small></span></div><small>${esc(scenario.note || '')}</small></article>`).join('')}</div><div class="site-snapshot-bottom"><article class="site-fit-card"><div><span>${esc(fit.label)}</span><b>VIEW EVIDENCE ›</b></div><div class="site-fit-items">${(fit.items || []).filter((item, index) => definitionIsEnabled('siteSnapshotMockup.fit.items', index)).map(item => `<div><span>${esc(item.label)}</span><strong${item.valueId ? ` id="${esc(item.valueId)}"` : ''}>${esc(item.value)}</strong><small class="accent-${esc(item.accent || 'blue')}">${esc(item.note)}${item.source ? sourceLabelMarkup(item.source) : item.manual ? manualInputMarkup(item.resources) : ''}</small></div>`).join('')}</div></article><article class="site-meaning-card"><span>${esc(meaning.label)}</span><h4>${esc(meaning.headline)}</h4><small>${esc(meaning.note)}${manualInputMarkup('site visit, property plans, and operating-team review')}</small></article></div><div class="site-snapshot-sources"><p>Sources: ${(spec.sources || []).map(sourceLabelMarkup).join(' | ')}.</p><p>${esc(spec.scenarioNote || '')}</p></div></div>`;
}
function guestSalesProfile() {
  const type = state.overview.locationType || inferNewProposalLocationType(state.overview.siteName);
  const profiles = cardCatalog('ev.guestSalesProfiles', {});
  return { type, ...(profiles[type] || profiles['Commercial property'] || { spend: [10, 20, 30], capture: [10, 20, 30] }) };
}
function applyGuestSalesDefaults() {
  if (!proposalCardCatalog?.ev?.guestSalesProfiles) return;
  const profile = guestSalesProfile();
  if (state.ev.guestSalesProfileType === profile.type) return;
  [state.ev.conservativeReceipt, state.ev.averageReceipt, state.ev.highReceipt] = profile.spend;
  [state.ev.lowGuestCaptureRate, state.ev.restaurantCaptureRate, state.ev.highGuestCaptureRate] = profile.capture;
  state.ev.guestSalesProfileType = profile.type;
}
function guestSalesCases() {
  const profile = guestSalesProfile();
  // This page isolates the guest-capture assumption. Each case keeps the same
  // expected ticket, so the difference in sales is easy to trace to capture.
  const captures = [
    state.ev.lowGuestCaptureRate ?? profile.capture?.[0] ?? 20,
    state.ev.restaurantCaptureRate ?? profile.capture?.[1] ?? 30,
    state.ev.highGuestCaptureRate ?? profile.capture?.[2] ?? 40
  ].map(value => Math.max(0, Math.min(100, Number(value))));
  const spend = Math.max(0, Number(state.ev.averageReceipt ?? profile.spend?.[1] ?? 12));
  const visits = Math.max(0, Number(calc.evForecastVisits(5)));
  return ['conservative', 'expected', 'high'].map((key, index) => {
    const capture = captures[index];
    const parties = visits * capture / 100;
    const daily = parties * spend;
    return { key, label: ['CONSERVATIVE', 'EXPECTED', 'HIGH'][index], capture, spend, parties, daily, monthly: daily * 30.42, annual: daily * state.ev.daysPerYear };
  });
}
function guestSalesCardMarkup(item) {
  const scenario = guestSalesCases().find(value => value.key === item.key);
  if (!scenario) return `<article class="visitor-spend-card" data-card-key="${esc(item.key)}"><div><span>${esc(item.label)}</span></div><strong>${esc(item.value || 'Add value')}</strong><em>${esc(item.description || 'Customize in Edit Mode')}</em></article>`;
  return `<article class="visitor-spend-card ${scenario.key === 'expected' ? 'active' : ''} accent-${scenario.key === 'conservative' ? 'amber' : scenario.key === 'expected' ? 'lime' : 'blue'}" data-guest-sales-case="${scenario.key}" data-card-key="${esc(item.key)}"><div class="visitor-spend-head"><span>${scenario.label}</span></div><div class="visitor-spend-revenue"><small>ADDITIONAL STORE SALES</small><strong data-guest-case-field="annual"></strong><em><span data-guest-case-field="daily"></span> / DAY · <span data-guest-case-field="spend"></span> TICKET</em></div><div class="visitor-spend-assumption"><small>GUEST-CAPTURE ASSUMPTION</small><strong data-guest-case-field="capture"></strong><em><span data-guest-case-field="parties"></span> STORE TRANSACTIONS / DAY</em></div></article>`;
}
function renderGuestSalesCases() {
  guestSalesCases().forEach(scenario => {
    document.querySelectorAll(`[data-guest-sales-case="${scenario.key}"]`).forEach(card => {
      const values = { spend: money(scenario.spend), capture: `${number(scenario.capture)}%`, parties: number(scenario.parties, 1), daily: money(scenario.daily), monthly: money(scenario.monthly), annual: money(scenario.annual) };
      Object.entries(values).forEach(([key, value]) => { const node = card.querySelector(`[data-guest-case-field="${key}"]`); if (node) node.textContent = value; });
    });
  });
}
function visitorRevenueMarkup(spec = {}) {
  const cases = cardCatalog('ev.spendingCases', []);
  return `<div class="ev-visitor-revenue-mockup"><div class="visitor-revenue-top"><article class="visitor-calculation-card"><div><span class="chart-label">${esc(spec.calculationLabel || 'FROM CHARGING VISITS TO STORE TRANSACTIONS')}</span></div><div class="visitor-calculation-flow"><span><small>${esc(spec.expectedLabel || 'CHARGING VISITS / DAY')}</small><strong id="evCaptureVisits"></strong><em>YEAR 5 FORECAST</em></span><i>×</i><span><small>${esc(spec.captureLabel || 'GUEST-CAPTURE ASSUMPTION')}</small><strong id="evCaptureRate"></strong><em>Expected case; intentionally below the 44.5% UC Davis purchase finding.</em></span><i>=</i><span><small>${esc(spec.partiesLabel || 'STORE TRANSACTIONS / DAY')}</small><strong id="evCaptureParties"></strong><em>Potential purchasing visits from charging guests.</em></span></div></article><article class="visitor-base-card"><span class="chart-label">${esc(spec.planningLabel || 'EXPECTED GUEST-VALUE CASE')}</span><strong id="evSalesExpectedAnnual"></strong><small>${esc(spec.planningDescription || 'ADDITIONAL STORE SALES / YEAR')}</small><b><span id="evSalesExpectedDaily"></span> / DAY &nbsp;|&nbsp; <span id="evSalesExpectedTicket"></span> TICKET</b></article></div><div class="visitor-revenue-label"><span>GUEST-CAPTURE ASSUMPTION → ADDITIONAL STORE SALES</span></div><div class="visitor-spend-grid">${cases.filter((item, index) => definitionIsEnabled('spendingCases', index)).map(guestSalesCardMarkup).join('')}</div><article class="visitor-meaning-card visitor-meaning-full"><span class="chart-label">${esc(spec.meaningLabel || 'WHAT THIS MEANS')}</span><h4>${esc(spec.meaningHeadline || 'The expected case applies a deliberately conservative capture rate to charging visits.')}</h4><small>UC Davis found 44.5% of surveyed BEV drivers bought something while fast charging. Store sales are gross revenue—not profit—and exclude charging revenue. Monthly figures use 30.42 days.</small></article></div>`;
}
function renderDashboardCardsFromJson(showArchived = false) {
  const grid = $('.bid-grid'); if (!grid || !proposalCardCatalog?.dashboard) return;
  const archived = readArchivedBids();
  const localCards = Object.fromEntries(Object.entries(readLocalBids()).map(([bidId, profile]) => [bidId, { title: profile.label, location: profile.locationLabel, avatar: (profile.label || 'P').slice(0, 1).toUpperCase(), avatarClass: '', scopes: Object.entries(profile.scopes || {}).filter(([, enabled]) => enabled).map(([scope]) => scope === 'storage' ? 'Battery storage' : scope === 'ev' ? 'EV charging' : 'Solar'), metrics: proposalCardCatalog.dashboard[profile.sourceBidId || 'copper-fork-grill-american-fork']?.metrics || [] }]));
  const cards = Object.entries({ ...proposalCardCatalog.dashboard, ...localCards }).filter(([bidId]) => showArchived ? archived.has(bidId) : !archived.has(bidId));
  grid.innerHTML = cards.map(([bidId, card]) => `<article class="bid-card" data-bid="${esc(bidId)}"><div class="bid-card-top"><span class="bid-status ${homeBidStatuses[bidId] === 'Prepared' ? 'ready' : homeBidStatuses[bidId] === 'Draft' ? 'draft' : 'review'}">${esc((homeBidStatuses[bidId] || 'Prepared').toUpperCase())}</span><span class="bid-owner">Proposal team</span></div><div class="bid-card-title"><span class="store-avatar ${esc(card.avatarClass || '')}">${esc(card.avatar || '')}</span><div><h2>${esc(card.title)}</h2><p>${esc(card.location)}</p></div></div><div class="bid-scope">${(card.scopes || []).map(scope => `<span>${esc(scope)}</span>`).join('')}</div><div class="bid-metrics">${(card.metrics || []).map(metric => `<div><small>${esc(metric.label)}</small><strong></strong></div>`).join('')}</div><div class="bid-card-actions"><button class="bid-manage" type="button" data-copy-bid="${esc(bidId)}">Copy bid</button><button class="bid-manage" type="button" data-archive-bid="${esc(bidId)}">Archive</button></div><button class="bid-open" type="button">Open proposal <span>→</span></button></article>`).join('');
  $$('.bid-card').forEach(card => { const metrics = homeBidMetrics(card.dataset.bid); card.querySelectorAll('.bid-metrics > div').forEach((metric, index) => { const item = metrics[index]; if (!item) return; metric.querySelector('small').textContent = item[0]; metric.querySelector('strong').textContent = item[1]; }); });
  const homeTitle = document.querySelector('#homeTitle'); if (homeTitle) homeTitle.textContent = showArchived ? 'Your archived bids.' : 'Your active bids.';
  const homeFooterCount = document.querySelector('.home-footer span:first-child'); if (homeFooterCount) homeFooterCount.innerHTML = `<i class="live-dot"></i> ${cards.length} ${showArchived ? 'archived' : 'active'} proposals`;
  const footer = document.querySelector('.home-footer'); if (footer) { footer.querySelector('[data-archived-toggle]')?.remove(); const archivedToggle = document.createElement('a'); archivedToggle.href = '#archived'; archivedToggle.dataset.archivedToggle = 'true'; archivedToggle.textContent = showArchived ? 'Show active' : 'Show archived'; archivedToggle.addEventListener('click', event => { event.preventDefault(); renderDashboardCardsFromJson(!showArchived); }); footer.insertBefore(archivedToggle, footer.lastElementChild); }
  grid.querySelectorAll('[data-copy-bid]').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); const sourceId = button.dataset.copyBid; const source = bidProfiles[sourceId]; if (!source) return; const copyId = `${sourceId}-copy-${Date.now()}`; const copy = JSON.parse(JSON.stringify({ ...source, label: `${source.label || source.overrides?.overview?.siteName || 'Proposal'} copy`, sourceBidId: sourceId })); const copies = readLocalBids(); copies[copyId] = copy; localStorage.setItem(localBidStorageKey, JSON.stringify(copies)); window.location.assign(`?bid=${encodeURIComponent(copyId)}`); }));
  grid.querySelectorAll('[data-archive-bid]').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); const archivedIds = readArchivedBids(); archivedIds.add(button.dataset.archiveBid); localStorage.setItem(archivedBidStorageKey, JSON.stringify([...archivedIds])); renderDashboardCardsFromJson(); }));
  bindDashboardCards();
}
function applyJsonProposalCards() {
  if (!proposalCardCatalog?.ev) return;
  if (!proposalCardDefaultsApplied && isEvOnlyBid && !reusableState?.meta?.jsonCardValuesVersion) {
    // Location-type spending defaults are applied by applyGuestSalesDefaults().
    state.meta.jsonCardValuesVersion = proposalCardCatalog.version;
    proposalCardDefaultsApplied = true;
  }
  renderJsonLocationMetrics($('#ev-report-1 .ev-location-metrics'), cardCatalog('ev.locationMetrics'));
  const locationSupport = $('#ev-report-1 .ev-location-support');
  if (locationSupport && !locationSupport.textContent.includes('BUSINESS HOURS')) locationSupport.insertAdjacentHTML('beforeend', `<article><strong>${/kneaders/i.test(state.overview.siteName) ? 'MON–SAT 7:00 AM–10:00 PMSUNDAY CLOSED' : 'Unknown'}</strong><span>BUSINESS HOURS <button class="metric-help" title="Published store hours establish the usable charging and guest-service window.">?</button></span><small>${/kneaders/i.test(state.overview.siteName) ? 'KNEADERS LOCATION DIRECTORY' : 'VERIFY WITH BUSINESS'}</small></article>`);
  renderJsonSpendingCards($('#ev-report-3 .ev-financial-grid'), cardCatalog('ev.spendingCases'));
  ensureCustomCardProvenance();
}

function ensureCustomCardProvenance() {
  const annotations = {
    evLocationTraffic: sourceLabelMarkup('UDOT AADT'),
    evLocationRoute: manualInputMarkup('site access review, property plans, and final site walk'),
    evLocationAmenities: sourceLabelMarkup('Overture Maps Places'),
    evRevenueVisits: manualInputMarkup('observed charging-session export and executed charging agreements'),
    evRevenueEnergy: manualInputMarkup('charger specification, session duration, and operating assumptions'),
    evChargingRevenue: manualInputMarkup('charging price, utilization forecast, and executed network agreement'),
    evElectricityExpense: manualInputMarkup('utility tariff, charger load profile, and operating agreement'),
    evFixedExpenses: manualInputMarkup('network quote, maintenance quote, and executed service agreement'),
    evOperatingExpenses: manualInputMarkup('utility tariff, network quote, maintenance quote, and operating agreement')
  };
  Object.entries(annotations).forEach(([id, markup]) => {
    if (!markup) return;
    const value = document.getElementById(id);
    const card = value?.closest('article');
    if (!card || card.querySelector('.metric-source,.card-provenance')) return;
    const note = document.createElement('small');
    note.className = 'metric-source card-provenance';
    note.innerHTML = markup;
    card.appendChild(note);
  });
  $$('#ev .reference-option, #ev .reference-highlight, #ev .bundle-card, #ev .ev-big-numbers article, #ev .ev-output-grid article, #ev .ev-financial-grid article, #ev .ev-lender-summary article').forEach(card => {
    if (card.querySelector('.metric-source,.card-provenance,.source-note,.manual-input-note,.card-source-link')) return;
    if (!/[$%]|\d/.test(card.textContent)) return;
    const markup = manualInputMarkup('site documents, vendor quotes, utility records, and executed agreements');
    if (!markup) return;
    const note = document.createElement('small');
    note.className = 'metric-source card-provenance';
    note.innerHTML = markup;
    card.appendChild(note);
  });
}

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
  evForecastVisits: year => state.ev.ports * 24 * (state.ev[`forecastYear${year}Utilization`] / 100) / Math.max(0.01, state.ev.averageSessionMinutes / 60),
  evForecastParties: year => calc.evForecastVisits(year) * state.ev.restaurantCaptureRate / 100,
  evRoundedParties: year => Math.round(calc.evForecastParties(year)),
  evRestaurantSales: receipt => calc.evRoundedParties(5) * receipt,
  evRestaurantSalesMonthly: receipt => calc.evRestaurantSales(receipt) * 30.42,
  evRestaurantSalesAnnual: receipt => calc.evRestaurantSales(receipt) * state.ev.daysPerYear,
  evAnnualSessions: () => calc.evForecastVisits(5) * state.ev.daysPerYear,
  evChargingRevenueAnnual: () => calc.evAnnualSessions() * state.ev.energyPerSessionKwh * state.ev.chargingPricePerKwh,
  evElectricityExpenseAnnual: () => calc.evAnnualSessions() * state.ev.energyPerSessionKwh * state.ev.utilityEnergyCostPerKwh,
  evNetworkExpenseAnnual: () => state.ev.ports * state.ev.networkCostPerPortMonth * 12,
  evMaintenanceExpenseAnnual: () => state.ev.ports * state.ev.maintenanceCostPerPortYear,
  evOperatingExpensesAnnual: () => calc.evElectricityExpenseAnnual() + calc.evNetworkExpenseAnnual() + calc.evMaintenanceExpenseAnnual(),
  evChargingMarginAnnual: () => calc.evChargingRevenueAnnual() - calc.evOperatingExpensesAnnual(),
  evProjectedValueAnnual: () => calc.evChargingMarginAnnual() + calc.evRestaurantSalesAnnual(state.ev.averageReceipt),
  lenderBankabilityScore: () => ['utilityCapacityScore', 'tariffDemandChargeScore', 'permittingScore', 'incentiveEligibilityScore', 'constructionCostScore', 'safetyVandalismScore', 'cellularConnectivityScore', 'uptimeMaintenanceScore', 'debtServiceCoverageScore'].reduce((total, key) => total + Number(state.lender[key] || 0), 0) / 9 * 10,
  locationCaptureScore: () => { const sessionsPerPort = state.ev.marketProofVisitsPerDay / Math.max(1, state.ev.marketProofPorts); const utilization = state.ev.marketProofVisitsPerDay * state.ev.marketProofAverageSessionMinutes / Math.max(1, state.ev.marketProofPorts * 24 * 60) * 100; return Math.min(100, Math.min(1, sessionsPerPort / 30) * 50 + Math.min(1, utilization / 50) * 50); },
  siteCaptureScore: () => Math.min(100, state.ev.dailyTraffic / 30000 * 30 + state.ev.siteVisibilityScore / 10 * 15 + state.ev.entryExitScore / 10 * 20 + Math.max(0, 1 - state.ev.travelRouteDistance / 5) * 20 + state.ev.competitorCongestionScore / 10 * 15),
  getevScore: () => Math.min(100, Math.max(0, (state.ev.competitorCongestionScore / 10 * 100) * .20 + Math.min(100, state.ev.dailyTraffic / 700 * 2) * .25 + Math.min(100, state.ev.currentBevPopulation / 75) * .15 + Math.max(0, 100 - state.ev.travelRouteDistance * 20) * .15 + Math.min(100, state.ev.entryExitScore * 10) * .25)),
  scorecardMonthlyPayment: () => 6604.77 * (state.investment.ev / 500000),
  futureGrowthScore: () => Math.min(100, state.ev.currentBevPopulation / 10000 * 25 + state.ev.historicalBevGrowthPct / 30 * 15 + state.ev.projectedBevFleet / 20000 * 20 + (1 - Math.abs(50 - state.ev.teslaMixPct) / 50) * 10 + state.ev.trafficGrowthPct / 4 * 10 + state.ev.futureChargerConstruction / 6 * 5 + state.ev.publicFastChargingBehaviorPct / 100 * 15),
  currentDemandScore: () => (calc.locationCaptureScore() + calc.siteCaptureScore() + calc.futureGrowthScore() + calc.lenderBankabilityScore()) / 4,
  evPorts: () => state.ev.ports,
  observedAnnualCharges: () => 0,
  sessions: () => 0,
  netKwhMargin: () => 0,
  evRevenue: () => 0,
  evCo2: () => 0,
  year1Benefit: () => calc.solarSavings() + calc.demandSavings() + state.vpp.demandResponse,
  year1Profit: () => calc.year1Benefit() - state.economics.annualOpex,
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
  { name: 'Orem, UT - Tesla Supercharger', network: 'Tesla', lat: 40.272608, lon: -111.704992, ports: 8, charges: 18713, capabilityKw: 250 },
  { name: 'RMP Midtown 360 (Orem, UT)', network: 'Rocky Mountain Power', lat: 40.292770, lon: -111.693440, ports: 4, charges: 2411, capabilityKw: 150 },
  { name: 'WinCo Foods - Tesla Supercharger', network: 'Tesla', lat: 40.312900, lon: -111.721024, ports: 16, charges: 1210, capabilityKw: 250 },
  { name: 'CC Station1 Orem City DC 4', network: 'ChargePoint', lat: 40.297465, lon: -111.693144, ports: 1, charges: 1020, capabilityKw: 62 },
  { name: 'Unique Auto Body - DCFC', network: 'Blink', lat: 40.372490, lon: -111.785045, ports: 4, charges: 562, capabilityKw: 50 },
  { name: 'Walmart EV Charging - Lindon', network: 'Walmart', lat: 40.348499, lon: -111.731817, ports: 8, charges: 411, capabilityKw: 150 },
  { name: 'Walmart EV Charging - Orem', network: 'Walmart', lat: 40.272656, lon: -111.710217, ports: 8, charges: 397, capabilityKw: 150 },
  { name: 'Murdock Lindon Hyundai F2', network: 'ChargePoint', lat: 40.328821, lon: -111.731898, ports: 1, charges: 288, capabilityKw: 62 },
  { name: 'Murdock Genesis Sales South', network: 'ChargePoint', lat: 40.329342, lon: -111.733807, ports: 1, charges: 90, capabilityKw: 62 },
  { name: 'AF Ford Power Link 1', network: 'ChargePoint', lat: 40.357198, lon: -111.783924, ports: 2, charges: 12, capabilityKw: 180 },
  { name: 'Ken Garff Nissan - Orem', network: 'ChargePoint', lat: 40.273330, lon: -111.702080, ports: 1, charges: 0, capabilityKw: 62 },
  { name: 'Doug Smith Kia', network: 'ChargePoint', lat: 40.329843, lon: -111.730039, ports: 5, charges: 0, capabilityKw: 62 }
];

const chargerCapability = station => {
  const kw = Number(station.capabilityKw || 0);
  if (kw >= 200) return { key: 'ultra', label: 'Ultra-fast200+ kW', color: '#d8ed4f' };
  if (kw >= 100) return { key: 'high', label: 'Fast100–199 kW', color: '#ff8b4d' };
  return { key: 'standard', label: 'Lower-power DCunder 100 kW', color: '#70b7ff' };
};
const stationUsagePerPort = station => Number(station.charges || 0) / Math.max(1, Number(station.ports || 1));
const stationDotSize = station => {
  const scores = demandStations.map(item => Math.log1p(stationUsagePerPort(item)));
  const score = Math.log1p(stationUsagePerPort(station));
  const min = Math.min(...scores), max = Math.max(...scores);
  return Math.round(9 + ((score - min) / Math.max(0.001, max - min)) * 17);
};
const nlrInventoryStations = () => Array.isArray(nlrStationsRecord?.stations) ? nlrStationsRecord.stations.filter(station => Number.isFinite(Number(station.latitude)) && Number.isFinite(Number(station.longitude))) : [];
const milesBetween = (aLat, aLon, bLat, bLon) => {
  const latMiles = (Number(aLat) - Number(bLat)) * 69;
  const lonMiles = (Number(aLon) - Number(bLon)) * 69 * Math.cos(Number(aLat) * Math.PI / 180);
  return Math.sqrt(latMiles ** 2 + lonMiles ** 2);
};
const matchingNlrStation = station => nlrInventoryStations().find(item => milesBetween(station.lat, station.lon, item.latitude, item.longitude) <= 0.15) || null;
const nlrCapability = station => chargerCapability({ capabilityKw: station.maxPowerKw });
const nlrDetailsMarkup = station => station ? `<br><small>Source: NLR/AFDC${esc(station.chargingType)}${number(station.portCount)} ports${number(station.maxPowerKw || 0)} kW max${esc(station.status || 'status unavailable')}${esc(station.access || 'access unavailable')}</small>` : '';
const unmatchedNlrStations = () => nlrInventoryStations().filter(station => !demandStations.some(observed => matchingNlrStation(observed)?.sourceRecordId === station.sourceRecordId));
const gapSites = (record, label) => (record?.records || []).filter(site => Number.isFinite(Number(site.latitude)) && Number.isFinite(Number(site.longitude))).map(site => ({ ...site, layerLabel: label }));
const gapSitePopup = site => `<b>${esc(site.name || site.layerLabel)}</b><br>${esc(site.address || 'Address unavailable')}<br><small>${esc(site.layerLabel)}Source: OpenStreetMap Overpass + NLR/AFDC</small>`;

const regionalEvBenchmark = { location: 'St. George, UT', ports: 53, stations: 9, charges3m: 39210, utilization: 18.3, avgKwh: 26.8, sourceWindow: '2026-05-07 to 2026-08-0288 daily observations' };

const configSchemas = {
  overview: { title: 'Overview', fields: [
    ['proposalName', 'Proposal name', 'text'], ['siteName', 'Customer / site name', 'text'], ['location', 'Location', 'text'], ['proposalDate', 'Proposal date', 'date'], ['status', 'Proposal status', 'select', ['Prepared', 'In review', 'Ready to present', 'Approved', 'Won', 'Lost']],
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
  ev: { title: 'EV customer value', fields: [
    ['ports', 'Proposed site charging ports', 'number'], ['averageSessionMinutes', 'Average session duration (minutes)', 'number'],
    ['forecastYear1Utilization', 'Year 1 EVpin utilization (%)', 'number'], ['forecastYear3Utilization', 'Year 3 EVpin utilization (%)', 'number'], ['forecastYear5Utilization', 'Year 5 EVpin utilization (%)', 'number'], ['restaurantCaptureRate', 'Restaurant capture rate (%)', 'number'], ['conservativeReceipt', 'Conservative average receipt ($)', 'number'], ['averageReceipt', 'Expected average receipt ($)', 'number'], ['highReceipt', 'High average receipt ($)', 'number'], ['daysPerYear', 'Operating days per year', 'number'], ['energyPerSessionKwh', 'Energy delivered per charging session (kWh)', 'number'], ['chargingPricePerKwh', 'Charging price ($/kWh)', 'number'], ['utilityEnergyCostPerKwh', 'Utility energy cost ($/kWh)utility tariff', 'number'], ['networkCostPerPortMonth', 'Network cost per port / month ($)', 'number'], ['maintenanceCostPerPortYear', 'Maintenance per port / year ($)', 'number'], ['dailyTraffic', 'Daily traffic (vehicles)', 'number'], ['siteVisibilityScore', 'Site visibility (1-10)', 'number'], ['entryExitScore', 'Ease of entry and exit (1-10)', 'number'], ['travelRouteDistance', 'Distance from major travel route (miles)', 'number'], ['competitorCongestionScore', 'Competitive charger congestion (1-10)', 'number'], ['currentBevPopulation', 'Current BEV population', 'number'], ['historicalBevGrowthPct', 'Historical BEV growth (%)', 'number'], ['projectedBevFleet', 'Projected BEV fleet', 'number'], ['teslaMixPct', 'Tesla share of BEV fleet (%)', 'number'], ['trafficGrowthPct', 'Traffic growth (%)', 'number'], ['futureChargerConstruction', 'Future charger construction (sites)', 'number'], ['publicFastChargingBehaviorPct', 'Public fast-charging behavior (%)', 'number'], ['investmentModel', 'Investment model', 'select', ['Lease parking space', '50/50', 'Full ownership']], ['parkingLeasePerSpotMonth', 'Parking lease per spot / month ($)', 'number'], ['managementFeePerPortMonth', 'Management fee per port / month ($)', 'number'], ['evpinLink', 'EVpin forecast link', 'text']
  ], formulas: [
    ['Charging visits / day', 'Ports × 24 hours × utilization ÷ average session length in hours', () => `Y1 ${number(calc.evForecastVisits(1))}Y3 ${number(calc.evForecastVisits(3))}Y5 ${number(calc.evForecastVisits(5))}`],
    ['Additional customer parties / day', 'Year 5 charging visits × restaurant capture rate', () => number(calc.evRoundedParties(5))],
    ['Daily restaurant sales', 'Rounded daily parties × average receipt', () => money(calc.evRestaurantSales(state.ev.averageReceipt))],
    ['Monthly restaurant sales', 'Daily restaurant sales × 30.42 days', () => roundedMoney(calc.evRestaurantSalesMonthly(state.ev.averageReceipt))],
    ['Annual restaurant sales', 'Daily restaurant sales × operating days', () => roundedMoney(calc.evRestaurantSalesAnnual(state.ev.averageReceipt))],
    ['Annual charging revenue', 'Year 5 visits × days × kWh/session × charging price', () => roundedMoney(calc.evChargingRevenueAnnual())],
    ['Annual EV operating expenses', 'Energy expense + network expense + maintenance', () => roundedMoney(calc.evOperatingExpensesAnnual())],
    ['Annual charging operating margin', 'Charging revenue − EV operating expenses', () => roundedMoney(calc.evChargingMarginAnnual())]
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
  , lender: { title: 'Lender support', fields: [['dealershipPrivateChargerDiscount', 'Dealership / private-charger discount (%)', 'number'], ['utilityCapacityScore', 'Utility and available capacity (1-10)', 'number'], ['tariffDemandChargeScore', 'Tariff and demand charges (1-10)', 'number'], ['permittingScore', 'AHJ and permitting difficulty (1-10)', 'number'], ['incentiveEligibilityScore', 'Incentive eligibility (1-10)', 'number'], ['constructionCostScore', 'Construction cost (1-10)', 'number'], ['safetyVandalismScore', 'Safety and vandalism exposure (1-10)', 'number'], ['cellularConnectivityScore', 'Cellular connectivity (1-10)', 'number'], ['uptimeMaintenanceScore', 'Uptime and maintenance plan (1-10)', 'number'], ['debtServiceCoverageScore', 'Debt-service coverage (1-10)', 'number']], formulas: [['Delivery + bankability score', 'Average of the nine scored delivery and bankability inputs × 10', () => `${number(calc.lenderBankabilityScore(), 0)} / 100`]] }
};

const formulaHint = (formula, label = 'Show formula') => `<span class="formula-hint"><button class="formula-help-button" type="button" aria-label="${esc(label)}">?</button><span class="formula-popover" role="tooltip">${esc(formula)}</span></span>`;
function formulaMarkup(schema) {
  return schema.formulas?.length ? `<div class="formula-box"><div class="formula-title">CALCULATED OUTPUTS <span class="formula-title-note">Hover ? to inspect a formula</span></div>${schema.formulas.map(([label, formula, value]) => { const output = label === 'Simple payback' && calc.payback() == null ? 'Not reached within modeled inputs' : value(); return `<div class="formula-row"><span><b>${esc(label)} ${formulaHint(formula, `Show formula for ${label}`)}</b></span><strong>${esc(output)}</strong></div>`; }).join('')}</div>` : '';
}

const sliderRanges = {
  lowGuestCaptureRate: [0, 100, 1], highGuestCaptureRate: [0, 100, 1],
  savingsRate: [0, 100, 1], co2Factor: [0, 2, 0.01], footprint: [500, 500000, 100], utilitySpend: [0, 2000000, 1000], annualKwh: [0, 10000000, 10000], peakDemand: [0, 5000, 5], openHours: [1, 24, 1], selfConsumption: [0, 100, 1], energyRate: [0, 1, 0.01], demandRate: [0, 100, 0.25], exportRate: [0, 0.5, 0.01], onsiteValue: [0, 1, 0.01], latitude: [-90, 90, 0.000001], longitude: [-180, 180, 0.000001], mapRadius: [0.5, 50, 0.5],
  arrayKw: [1, 10000, 5], productionRatio: [500, 3500, 10], moduleW: [100, 800, 5], warranty: [1, 40, 1], chartHigh: [0, 150, 1], chartLow: [0, 150, 1], chartStd: [0.1, 60, 0.1], capacityMwh: [0, 100, 0.1], powerKw: [0, 10000, 25], shavePct: [0, 80, 1], dispatchHours: [0, 24, 0.5], batteryEfficiency: [50, 100, 1], ratedCapacity: [0, 100, 0.1], investment: [0, 10000000, 5000],
  marketProofVisitsPerDay: [0, 5000, 1], marketProofPorts: [1, 100, 1], marketProofAverageSessionMinutes: [10, 90, 1], ports: [1, 32, 1], averageSessionMinutes: [10, 90, 1], forecastYear1Utilization: [0, 40, 0.1], forecastYear3Utilization: [0, 40, 0.1], forecastYear5Utilization: [0, 40, 0.1], restaurantCaptureRate: [0, 75, 1], conservativeReceipt: [1, 100, 1], averageReceipt: [1, 100, 1], highReceipt: [1, 100, 1], daysPerYear: [250, 366, 1], energyPerSessionKwh: [10, 120, 1], chargingPricePerKwh: [0.1, 1.5, 0.01], utilityEnergyCostPerKwh: [0.04, 0.5, 0.01], networkCostPerPortMonth: [0, 500, 5], maintenanceCostPerPortYear: [0, 5000, 25], dailyTraffic: [0, 100000, 500], entryExitScore: [1, 10, 0.5], travelRouteDistance: [0, 25, 0.1], competitorCongestionScore: [1, 10, 0.5], currentBevPopulation: [0, 100000, 100], historicalBevGrowthPct: [0, 100, 1], projectedBevFleet: [0, 250000, 500], teslaMixPct: [0, 100, 1], trafficGrowthPct: [0, 20, 0.1], futureChargerConstruction: [0, 50, 1], publicFastChargingBehaviorPct: [0, 100, 1], parkingLeasePerSpotMonth: [0, 2000, 25], managementFeePerPortMonth: [0, 1000, 25],
  critterGuard: [0, 1000000, 5000], lighting: [0, 1000000, 5000], hvac: [0, 2000000, 5000], hvacBase: [0, 2000000, 5000], coordination: [0, 1000000, 5000], demandResponse: [0, 1000000, 5000], reservePct: [0, 80, 1], solar: [0, 20000000, 5000], solarModules: [0, 10000000, 5000], solarInverters: [0, 10000000, 5000], solarRacking: [0, 10000000, 5000], solarBos: [0, 10000000, 5000], solarLabor: [0, 10000000, 5000], solarEngineering: [0, 5000000, 5000], solarCommissioning: [0, 5000000, 5000], battery: [0, 10000000, 5000], ev: [0, 10000000, 5000], siteImprovements: [0, 5000000, 5000], incentivePct: [0, 50, 1], escalation: [0, 15, 0.25], period: [1, 40, 1], discountRate: [0, 30, 0.25], annualOpex: [0, 2000000, 1000], taxBenefitPct: [0, 50, 1], mapZoom: [15, 22, 1], dealershipPrivateChargerDiscount: [0, 40, 1], utilityCapacityScore: [1, 10, 1], tariffDemandChargeScore: [1, 10, 1], permittingScore: [1, 10, 1], incentiveEligibilityScore: [1, 10, 1], constructionCostScore: [1, 10, 1], safetyVandalismScore: [1, 10, 1], cellularConnectivityScore: [1, 10, 1], uptimeMaintenanceScore: [1, 10, 1], debtServiceCoverageScore: [1, 10, 1]
};
const scenarioModes = ['Pessimistic', 'Realistic', 'Optimistic'];
const scenarioNeutralKeys = new Set(['footprint', 'annualKwh', 'latitude', 'longitude', 'mapRadius', 'mapZoom', 'warranty', 'moduleW', 'ratedCapacity', 'daysPerYear', 'marketProofVisitsPerDay', 'marketProofPorts', 'marketProofAverageSessionMinutes']);
const scenarioInverseKeys = new Set(['travelRouteDistance', 'futureChargerConstruction', 'utilityEnergyCostPerKwh', 'networkCostPerPortMonth', 'maintenanceCostPerPortYear', 'parkingLeasePerSpotMonth', 'managementFeePerPortMonth', 'critterGuard', 'lighting', 'hvac', 'hvacBase', 'coordination', 'investment', 'solar', 'solarModules', 'solarInverters', 'solarRacking', 'solarBos', 'solarLabor', 'solarEngineering', 'solarCommissioning', 'battery', 'ev', 'siteImprovements', 'discountRate', 'annualOpex', 'reservePct']);
const clampScenarioValue = (key, value) => { const range = sliderRanges[key]; if (!range) return value; const [, , step] = range; const clamped = Math.max(range[0], Math.min(range[1], value)); return Number((Math.round(clamped / step) * step).toFixed(sliderDigits(step))); };
function scenarioValue(sectionId, key, mode) {
  const baseline = Number(bidDefaults[sectionId]?.[key]);
  if (!Number.isFinite(baseline) || mode === 'Realistic' || scenarioNeutralKeys.has(key)) return baseline;
  const direction = mode === 'Pessimistic' ? -1 : 1;
  const effect = scenarioInverseKeys.has(key) ? -direction : direction;
  return clampScenarioValue(key, baseline * (1 + effect * 0.15));
}
function applyScenario(sectionId, mode) {
  const fields = configSchemas[sectionId]?.fields || [];
  fields.filter(([, , type]) => type === 'number').forEach(([key]) => { state[sectionId][key] = scenarioValue(sectionId, key, mode); });
  state.meta.scenarios[sectionId] = mode;
  saveState();
}
function markScenarioCustom(sectionId) { state.meta.scenarios[sectionId] = 'Custom'; saveState(); }
const sliderDigits = step => String(step).includes('.') ? String(step).split('.')[1].length : 0;
const sliderValueLabel = (label, value, step) => { const digits = Math.max(sliderDigits(step), String(value).includes('.') ? String(value).split('.')[1].length : 0); if (label.includes('$')) return money(value); if (label.includes('%')) return `${number(value, digits)}%`; return number(value, digits); };
const paintRange = input => { const min = Number(input.min), max = Number(input.max), value = Number(input.value); const pct = max === min ? 0 : Math.max(0, Math.min(1, (value - min) / (max - min))); const control = input.parentElement; const track = control.querySelector('.config-range-track'); const fill = control.querySelector('.config-range-fill'); const dial = control.querySelector('.config-range-dial'); if (track) { track.style.cssText = 'display:block!important;position:absolute!important;z-index:1;left:9px!important;right:9px!important;top:6px!important;height:7px!important;border-radius:8px;background:#30323a;overflow:visible'; if (fill) { fill.style.cssText = `display:block;width:${pct * 100}%;height:100%;border-radius:8px;background:var(--electric)`; } if (dial) { dial.style.cssText = `display:block!important;position:absolute!important;z-index:3;top:50%!important;left:${pct * 100}%!important;width:18px;height:18px;transform:translate(-50%,-50%);border-radius:50%;background:var(--lime);border:3px solid var(--navy);box-shadow:0 0 0 2px #d8ed4f44;pointer-events:none`; } } };
function fieldMarkup([key, label, type, options]) {
  const value = state[activeConfigSection][key] ?? '';
  const help = key === 'utilityEnergyCostPerKwh' ? `This rate is annual electricity cost ÷ annual kWh under the applicable utility tariff${state.ev.utilityEnergyCostSource ? ` (${state.ev.utilityEnergyCostSource})` : ''}. Confirm it against the prospect's latest utility bill before final pricing.` : '';
  if (type === 'textarea') return `<label class="config-field"><span>${esc(label)}</span><textarea data-key="${key}" rows="7" placeholder="Month,Value\nJAN,48\nFEB,55">${esc(value)}</textarea></label>`;
  if (type === 'select') return `<label class="config-field"><span>${esc(label)}</span><select data-key="${key}">${options.map(option => `<option ${option === value ? 'selected' : ''}>${esc(option)}</option>`).join('')}</select></label>`;
  if (type === 'number') { const [min, max, step] = sliderRanges[key] || [0, Math.max(100, Number(value) * 2 || 100), 1]; return `<label class="config-field"><span>${esc(label)}${help ? formulaHint(help, `How ${label} is sourced`) : ''}</span><input class="config-number" data-key="${key}" type="number" min="${min}" max="${max}" step="${step}" value="${esc(value)}" aria-label="${esc(label)}" /></label>`; }
  return `<label class="config-field"><span>${esc(label)}</span><input data-key="${key}" type="${type}" value="${esc(value)}" /></label>`;
}

function validateConfigValue(sectionId, key, value) {
  const field = configSchemas[sectionId]?.fields.find(item => item[0] === key);
  if (!field) return 'Unknown input.';
  if (field[2] === 'number') {
    const numeric = Number(value); const range = sliderRanges[key];
    if (!Number.isFinite(numeric)) return 'Enter a valid number.';
    if (range && (numeric < range[0] || numeric > range[1])) return `Use a value from ${range[0]} to ${range[1]}.`;
  }
  if (field[2] === 'select' && !field[3].includes(value)) return 'Choose one of the listed options.';
  if (field[2] === 'date' && value && Number.isNaN(Date.parse(value))) return 'Enter a valid date.';
  if (field[2] !== 'number' && String(value).length > 5000) return 'Keep this value under 5,000 characters.';
  return '';
}

function configText() {
  const lines = ['GETEV CONFIGURATION FILE', '# Edit the values after the = sign. Keep section and field names unchanged.', '# Scenario records the last preset used; Custom means values were manually adjusted.', '# Lines beginning with # are ignored.', '', '[scenarios]'];
  Object.keys(configSchemas).forEach(sectionId => lines.push(`${sectionId}=${state.meta.scenarios?.[sectionId] || 'Realistic'}`));
  lines.push('');
  Object.entries(configSchemas).forEach(([sectionId, schema]) => { lines.push(`[${sectionId}]`); schema.fields.forEach(([key, label]) => { lines.push(`# ${label}`); lines.push(`${key}=${String(state[sectionId][key] ?? '').replace(/\r?\n/g, '\\n')}`); }); lines.push(''); });
  return lines.join('\n');
}

function exportConfigs() { const blob = new Blob([configText()], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${(state.overview.proposalName || state.overview.siteName || 'getev').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-configs.txt`; link.click(); URL.revokeObjectURL(url); toast('Readable configuration file downloaded.'); }

function importConfigsText(text) {
  const draft = {}; const scenarioDraft = {}; let sectionId = null; const errors = [];
  text.split(/\r?\n/).forEach((raw, index) => { const line = raw.trim(); if (!line || line.startsWith('#') || line === 'GetEV CONFIGURATION FILE') return; const header = line.match(/^\[([^\]]+)\]$/); if (header) { sectionId = header[1]; if (sectionId !== 'scenarios' && !configSchemas[sectionId]) errors.push(`Line ${index + 1}: unknown section ${sectionId}.`); return; } const divider = line.indexOf('='); if (divider < 1 || !sectionId) { errors.push(`Line ${index + 1}: use field=value inside a section.`); return; } const key = line.slice(0, divider).trim(); const rawValue = line.slice(divider + 1).replace(/\\n/g, '\n'); if (sectionId === 'scenarios') { if (!configSchemas[key] || ![...scenarioModes, 'Custom'].includes(rawValue)) errors.push(`Line ${index + 1}: use Pessimistic, Realistic, Optimistic, or Custom for a known section.`); else scenarioDraft[key] = rawValue; return; } const schemaField = configSchemas[sectionId]?.fields.find(item => item[0] === key); if (!schemaField) { errors.push(`Line ${index + 1}: unknown field ${key}.`); return; } const value = schemaField[2] === 'number' ? Number(rawValue) : rawValue; const error = validateConfigValue(sectionId, key, value); if (error) errors.push(`Line ${index + 1}: ${error}`); else { draft[sectionId] ||= {}; draft[sectionId][key] = value; } });
  if (errors.length) { toast(`Import stopped: ${errors.slice(0, 2).join(' ')}`); return false; }
  Object.entries(scenarioDraft).forEach(([sectionId, mode]) => { if (mode !== 'Custom') applyScenario(sectionId, mode); else state.meta.scenarios[sectionId] = mode; });
  Object.entries(draft).forEach(([sectionId, values]) => Object.assign(state[sectionId], values)); saveState(); renderReport(); toast('Configuration file imported successfully.'); return true;
}

const configPanel = $('#configPanel');
const configBackdrop = $('#configBackdrop');
const configTitle = $('#configTitle');
const configBody = $('#configBody');
let activeConfigSection = 'overview';

function refreshFormulaBox() { const box = $('.formula-box'); if (box) box.outerHTML = formulaMarkup(configSchemas[activeConfigSection]); }
function dialBounds(field, value) {
  const label = field[1].toLowerCase();
  if (label.includes('%')) return { min: 0, max: 100, step: 1 };
  if (label.includes('hours')) return { min: 0, max: 24, step: 1 };
  if (label.includes('ports')) return { min: 1, max: 32, step: 1 };
  const max = Math.max(10, Math.ceil(Math.max(1, Number(value) || 1) * 2));
  return { min: 0, max, step: max > 100 ? 1 : 0.1 };
}
function toggleInlineConfig(section, sectionId) {
  if (!section || document.body.classList.contains('view-only')) return;
  const current = section.querySelector('.inline-config-dials');
  if (current) { current.remove(); return; }
  const schema = configSchemas[sectionId];
  if (!schema) return;
  const fields = schema.fields.filter(field => field[2] === 'number').slice(0, 12);
  const tray = document.createElement('div');
  tray.className = 'inline-config-dials';
  const fieldHelp = key => key === 'utilityEnergyCostPerKwh' ? `This rate is the annual electricity cost ÷ annual kWh under the applicable utility tariff${state.ev.utilityEnergyCostSource ? ` (${state.ev.utilityEnergyCostSource})` : ''}. Confirm it against the prospect's latest utility bill before final pricing.` : '';
  tray.innerHTML = `<div class="inline-config-head"><span>CONFIGS</span></div><div class="inline-config-grid">${fields.map(field => { const value = Number(state[sectionId]?.[field[0]]) || 0; const bounds = dialBounds(field, value); const help = fieldHelp(field[0]); return `<label class="inline-dial"><span>${esc(field[1])}${help ? formulaHint(help, `How ${field[1]} is sourced`) : ''}</span><input type="number" min="${bounds.min}" max="${bounds.max}" step="${bounds.step}" value="${value}" data-inline-config-section="${sectionId}" data-inline-config-key="${field[0]}" /></label>`; }).join('')}</div>${sectionId === 'overview' ? inlineProposalVisualControls() : ''}`;
  section.querySelector('.section-heading, .ev-report-head, .hero-copy')?.appendChild(tray);
  tray.querySelectorAll('.proposal-visual-file').forEach(input => input.addEventListener('change', event => handleProposalVisualUpload(event.target.files[0], input.dataset.proposalVisual)));
  tray.querySelectorAll('.visual-control').forEach(input => input.addEventListener('input', event => updateProposalVisualSetting(event.target.dataset.visualKind, event.target.dataset.visualSetting, Number(event.target.value))));
  tray.querySelectorAll('input[data-inline-config-section]').forEach(input => input.addEventListener('input', event => {
    const control = event.target;
    state[sectionId][control.dataset.inlineConfigKey] = Number(control.value);
    saveState();
    renderReport();
  }));
}
function proposalVisualControls() {
  const fields = [['photo', 'Property image'], ['logo', 'Logo']];
  return `<div class="visual-adjustments"><div class="config-input-title">IMAGE DISPLAY <small>Resize either image without changing its position.</small></div>${fields.map(([kind, label]) => { const settings = getProposalVisualSettings(kind); return `<div class="visual-adjustment" data-visual-adjustment="${kind}"><strong>${label}</strong><label><span>Scale</span><input class="visual-control" type="number" min="100" max="180" step="1" value="${settings.scale}" data-visual-kind="${kind}" data-visual-setting="scale" /></label></div>`; }).join('')}</div>`;
}
function inlineProposalVisualControls() {
  const fields = [['photo', 'Property image'], ['logo', 'Logo']];
  return `<div class="inline-visual-controls"><div class="inline-config-head"><span>HEADER IMAGES</span><small>Replace or resize either image.</small></div>${fields.map(([kind, label]) => { const settings = getProposalVisualSettings(kind); return `<div class="inline-visual-adjustment"><label class="inline-file-label"><span>${label}</span><input class="proposal-visual-file" data-proposal-visual="${kind}" type="file" accept="image/png,image/jpeg,image/webp" /></label><div class="inline-visual-dials"><label><span>Scale</span><input class="visual-control" type="number" min="100" max="180" step="1" value="${settings.scale}" data-visual-kind="${kind}" data-visual-setting="scale" /></label></div></div>`; }).join('')}</div>`;
}
function inlineAboutUsLogoControl() {
  return `<div class="inline-visual-controls about-us-logo-config"><div class="inline-config-head"><span>CONFIGS</span><small>Replace the installer logo shown in About Us.</small></div><div class="inline-visual-adjustment"><label class="inline-file-label"><span>Installer logo</span><input class="about-logo-file" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" /></label></div></div>`;
}
function openConfig(sectionId) {
  activeConfigSection = sectionId;
  const schema = configSchemas[sectionId] || configSchemas.overview;
  configTitle.textContent = schema.title;
  const scopeConfig = sectionId === 'overview' ? `<div class="config-scope-box"><div class="config-input-title">PROPOSAL SCOPE <small>Choose what appears in this bid.</small></div><label><span>EV Chargers</span><input type="checkbox" class="config-scope-toggle" data-scope="ev" /></label><label><span>Solar</span><input type="checkbox" class="config-scope-toggle" data-scope="solar" /></label><label><span>Batteries</span><input type="checkbox" class="config-scope-toggle" data-scope="storage" /></label><label><span>Lender support</span><input type="checkbox" class="config-scope-toggle" data-scope="lenderSupport" /></label></div>` : '';
  const visualFields = sectionId === 'overview' ? `<div class="config-input-title">PROPOSAL VISUALS <small>Default property image: Esri World Imagery aerial source. Replace either image independently.</small></div><label class="config-field config-file-field"><span>Property image</span><input class="proposal-visual-file" data-proposal-visual="photo" type="file" accept="image/png,image/jpeg,image/webp" /></label><label class="config-field config-file-field"><span>Logo</span><input class="proposal-visual-file" data-proposal-visual="logo" type="file" accept="image/png,image/jpeg,image/webp" /></label>` : `<label class="config-field config-file-field"><span>Visual replacement image</span><input class="config-file" type="file" accept="image/png,image/jpeg,image/webp" /></label>`;
  configBody.innerHTML = `<div class="config-tabs"><button type="button" class="config-tab selected" data-config-tab="section">This section</button><button type="button" class="config-tab" data-config-tab="all">All report sections</button></div>${scopeConfig}<div class="config-input-title">ASSUMPTIONS <small>Only these values are editable.</small></div>${schema.fields.map(fieldMarkup).join('')}${formulaMarkup(schema)}${visualFields}${sectionId === 'overview' ? proposalVisualControls() : ''}<div class="config-help"><span>i</span><p>Derived outputs are read-only. Change an input and apply to recalculate this section and connected sections.</p></div>`;
  configBody.querySelectorAll('.config-scope-toggle').forEach(toggle => { toggle.checked = proposalScopes[toggle.dataset.scope] === true; if (['solar', 'storage', 'ev'].includes(toggle.dataset.scope) && proposalScopes[toggle.dataset.scope] !== false) toggle.checked = true; toggle.addEventListener('change', () => { proposalScopes[toggle.dataset.scope] = toggle.checked; updateScopeUI(); applyScopeCopy(); if (toggle.dataset.scope === 'lenderSupport') renderReport(); }); });
  configBody.querySelector('[data-config-tab="all"]')?.addEventListener('click', () => { configBody.querySelectorAll('.config-tab').forEach(tab => tab.classList.toggle('selected', tab.dataset.configTab === 'all')); configBody.querySelector('.config-input-title').innerHTML = 'ALL REPORT INPUTS <small>Choose a section below to edit its independent assumptions.</small>'; const selector = document.createElement('select'); selector.className = 'config-section-picker'; selector.innerHTML = Object.entries(configSchemas).map(([key, item]) => `<option value="${key}">${esc(item.title)}</option>`).join(''); selector.value = activeConfigSection; configBody.insertBefore(selector, configBody.querySelector('.config-input-title').nextSibling); selector.addEventListener('change', event => openConfig(event.target.value)); });
  configBody.querySelectorAll('.config-range').forEach(paintRange);
  configBody.querySelectorAll('[data-key]').forEach(input => input.addEventListener('input', () => { const key = input.dataset.key; const value = input.type === 'range' || input.type === 'number' ? Number(input.value) : input.value; const error = validateConfigValue(activeConfigSection, key, value); input.classList.toggle('invalid', Boolean(error)); input.title = error; if (error) return; state[activeConfigSection][key] = value; if (input.type === 'range' || input.type === 'number') markScenarioCustom(activeConfigSection); else saveState(); if (input.classList.contains('config-range')) paintRange(input); configBody.querySelectorAll(`[data-key="${key}"]`).forEach(peer => { if (peer !== input) { peer.value = input.value; if (peer.classList.contains('config-range')) paintRange(peer); } }); const output = configBody.querySelector(`[data-output="${key}"]`); if (output) output.textContent = sliderValueLabel(configSchemas[activeConfigSection].fields.find(field => field[0] === key)?.[1] || '', Number(input.value), Number(input.step) || 1); refreshFormulaBox(); }));
  configBody.querySelectorAll('select[data-key]').forEach(select => select.addEventListener('change', () => select.dispatchEvent(new Event('input', { bubbles: true }))));
  configBody.querySelector('.config-file')?.addEventListener('change', event => handleImageUpload(event.target.files[0], sectionId));
  configBody.querySelectorAll('.proposal-visual-file').forEach(input => input.addEventListener('change', event => handleProposalVisualUpload(event.target.files[0], input.dataset.proposalVisual)));
  configBody.querySelectorAll('.visual-control').forEach(input => input.addEventListener('input', event => updateProposalVisualSetting(event.target.dataset.visualKind, event.target.dataset.visualSetting, Number(event.target.value))));
  configPanel.classList.add('open'); configBackdrop.classList.add('open');
}

function handleImageUpload(file, sectionId) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader(); reader.onload = () => { localStorage.setItem(`GetEV-image-${sectionId}`, reader.result); applyImage(sectionId, reader.result); }; reader.readAsDataURL(file);
}
function proposalVisualStorageKey(kind) { return `GetEV-proposal-${activeBidId || 'default'}-${kind}`; }
function proposalVisualSettingsKey(kind) { return `${proposalVisualStorageKey(kind)}-settings`; }
function getProposalVisualSettings(kind) { try { return { scale: 100, x: 50, y: 50, ...(JSON.parse(localStorage.getItem(proposalVisualSettingsKey(kind)) || '{}')) }; } catch { return { scale: 100, x: 50, y: 50 }; } }
function applyProposalVisualSettings(kind) { const target = kind === 'photo' ? $('#proposalPhoto') : $('#proposalLogo'); if (!target) return; const settings = getProposalVisualSettings(kind); target.style.setProperty('--visual-scale', settings.scale / 100); target.style.setProperty('--visual-x', settings.x); target.style.setProperty('--visual-y', settings.y); target.style.objectPosition = `${settings.x}% ${settings.y}%`; if (kind === 'logo' && activeBidId?.startsWith('bulk-') && !localStorage.getItem(proposalVisualStorageKey(kind))) target.closest('.proposal-logo-card')?.style.setProperty('display','none'); }
function updateProposalVisualSetting(kind, setting, value) { const settings = getProposalVisualSettings(kind); settings[setting] = value; localStorage.setItem(proposalVisualSettingsKey(kind), JSON.stringify(settings)); applyProposalVisualSettings(kind); }
function applyProposalVisual(kind, imageUrl) { const target = kind === 'photo' ? $('#proposalPhoto') : $('#proposalLogo'); if (target && imageUrl) { target.src = imageUrl; if (kind === 'photo') target.classList.toggle('proposal-photo-custom', /^data:image\//i.test(imageUrl) || !/ArcGIS\/rest\/services\/World_Imagery/i.test(imageUrl)); if (kind === 'logo') target.closest('.proposal-logo-card')?.style.setProperty('display',''); } applyProposalVisualSettings(kind); }
function handleProposalVisualUpload(file, kind) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader(); reader.onload = () => { localStorage.setItem(proposalVisualStorageKey(kind), reader.result); applyProposalVisual(kind, reader.result); }; reader.readAsDataURL(file);
}
const readProposalImage = file => new Promise(resolve => { if (!file || !file.type?.startsWith('image/')) return resolve(''); const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || '')); reader.onerror = () => resolve(''); reader.readAsDataURL(file); });
const overheadImageUrl = (latitude, longitude) => { const lat = Number(latitude), lon = Number(longitude); const delta = .003; return Number.isFinite(lat) && Number.isFinite(lon) ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${encodeURIComponent(`${lon - delta},${lat - delta},${lon + delta},${lat + delta}`)}&bboxSR=4326&size=1200,700&imageSR=4326&format=jpg&f=image` : ''; };
function handleAboutUsLogoUpload(file) {
  if (!file) return;
  const reader = new FileReader(); reader.onload = () => { state.brand.companyLogo = reader.result; saveState(); renderReport(); };
  reader.readAsDataURL(file);
}
document.addEventListener('change', event => { const input = event.target.closest('.about-logo-file'); if (input) handleAboutUsLogoUpload(input.files?.[0]); });
['photo', 'logo'].forEach(kind => { const saved = localStorage.getItem(proposalVisualStorageKey(kind)); if (saved) applyProposalVisual(kind, saved); else applyProposalVisualSettings(kind); });
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
  const mapCard = $('#evMarketMap'); if (!mapCard) return;
  let canvas = $('#demandMap'); if (!canvas) { canvas = document.createElement('div'); canvas.id = 'demandMap'; canvas.className = 'demand-map-canvas'; mapCard.prepend(canvas); }
  if (mapCard.dataset.leafletReady === 'true') { if (window.GetEVDemandMap) window.GetEVDemandMap.invalidateSize(); return; }
  loadLeaflet().then(L => {
    const map = L.map(canvas, { zoomControl: true, attributionControl: true, scrollWheelZoom: false }).setView([state.site.latitude, state.site.longitude], 12.8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', opacity: 0.62 }).addTo(map);
    const layers = {};
    layers.target = L.layerGroup([L.circleMarker([state.site.latitude, state.site.longitude], { radius: 9, color: '#ffffff', weight: 3, fillColor: '#57e3a5', fillOpacity: 1 }).bindPopup(`<b>${esc(state.overview.siteName)}</b><br>${esc(state.overview.location)}<br><small>Proposal site</small>`)]).addTo(map);
    layers.l2 = L.layerGroup(); layers.l3 = L.layerGroup(); layers.tesla = L.layerGroup();
    demandStations.forEach(station => { const capability = chargerCapability(station); const usagePerPort = stationUsagePerPort(station); const nlrStation = matchingNlrStation(station); const distance = milesBetween(state.site.latitude, state.site.longitude, station.lat, station.lon); const marker = L.circleMarker([station.lat, station.lon], { radius: stationDotSize(station) / 2, color: '#ffffff', weight: 1.5, fillColor: capability.color, fillOpacity: 0.9 }).bindPopup(`<b>${esc(station.name)}</b><br>${esc(station.network)}${number(distance, 1)} mi from proposal site<br>${capability.label}<br>${number(station.ports)} ports${number(station.charges)} observed charges<br>${number(usagePerPort, 1)} observed charges / port${nlrDetailsMarkup(nlrStation)}`); marker.addTo(String(station.network).toLowerCase().includes('tesla') ? layers.tesla : layers.l3); });
    unmatchedNlrStations().forEach(station => { const capability = nlrCapability(station); const radius = Math.max(3.5, Math.min(7, 3 + Math.sqrt(Number(station.portCount || 1)))); const distance = milesBetween(state.site.latitude, state.site.longitude, station.latitude, station.longitude); const marker = L.circleMarker([station.latitude, station.longitude], { radius, color: '#ffffffaa', weight: 1, fillColor: capability.color, fillOpacity: 0.55 }).bindPopup(`<b>${esc(station.name)}</b><br>${esc(station.network)}${number(distance, 1)} mi from proposal site<br>${capability.label}<br>${number(station.portCount)} ports${number(station.maxPowerKw || 0)} kW max<br>${esc(station.status || 'Status unavailable')}${esc(station.access || 'Access unavailable')}<br><small>Source: NLR/AFDCutilization not provided</small>`); marker.addTo(String(station.network || '').toLowerCase().includes('tesla') ? layers.tesla : /level.?2|l2/i.test(String(station.chargingType || '')) ? layers.l2 : layers.l3); });
    layers.l2.addTo(map); layers.l3.addTo(map); layers.tesla.addTo(map);
    const capabilityLegend = L.control({ position: 'bottomleft' });
    capabilityLegend.onAdd = () => {
      const legend = L.DomUtil.create('div', 'demand-map-legend');
      legend.innerHTML = '<b>MAP LEGEND</b><span><i class="legend-site"></i>Proposed site</span><span><i class="legend-standard"></i>Lower-power DC</span><span><i class="legend-fast"></i>Fast DC</span><span><i class="legend-ultra"></i>Ultra-fast DC</span><small>Dot size = observed use / port</small>';
      L.DomEvent.disableClickPropagation(legend); L.DomEvent.disableScrollPropagation(legend);
      return legend;
    };
    capabilityLegend.addTo(map);
    const viewRadiusMiles = 2.25; const latitudeDelta = viewRadiusMiles / 69; const longitudeDelta = viewRadiusMiles / (69 * Math.cos(state.site.latitude * Math.PI / 180)); const prospectBounds = L.latLngBounds([[state.site.latitude - latitudeDelta, state.site.longitude - longitudeDelta], [state.site.latitude + latitudeDelta, state.site.longitude + longitudeDelta]]); map.fitBounds(prospectBounds, { maxZoom: 14, animate: false });
    const mapWrap = mapCard.closest('.ev-market-map-wrap');
    if (mapWrap && !mapWrap.querySelector('.location-map-layers')) mapWrap.insertAdjacentHTML('afterbegin', '<div class="location-map-layers" aria-label="Map layers"><b>MAP LAYERS</b><label><input type="checkbox" data-map-layer="target" checked> Proposed site</label><label><input type="checkbox" data-map-layer="l2" checked> Level 2 chargers</label><label><input type="checkbox" data-map-layer="l3" checked> Level 3 / DC fast chargers</label><label><input type="checkbox" data-map-layer="tesla" checked> Tesla chargers</label></div>');
    mapWrap?.querySelectorAll('[data-map-layer]').forEach(input => input.addEventListener('change', () => { const layer = layers[input.dataset.mapLayer]; if (!layer) return; if (input.checked) layer.addTo(map); else map.removeLayer(layer); }));
    window.GetEVDemandMap = map; mapCard.dataset.leafletReady = 'true'; const fallbackDots = mapCard.querySelector('.demand-map'); if (fallbackDots) fallbackDots.hidden = true; setTimeout(() => map.invalidateSize(), 250);
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
  count.textContent = `${layoutObjects.length} objects${layoutLines.length} lines`;
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
  layoutObjects.push(item); marker.bindTooltip(type, { direction: 'top', offset: [0, -12] }); marker.bindPopup(`<b>${esc(type)}</b><br><span class="layout-popup-angle">Rotation: 0°</span><br><button type="button" class="layout-rotate-button" data-rotate="-15">↺ 15°</button> <button type="button" class="layout-rotate-button" data-rotate="15">↻ 15°</button><br><button type="button" class="layout-delete-button">Delete object</button>`); marker.on('popupopen', event => { const popup = event.popup.getElement(); popup.querySelectorAll('.layout-rotate-button').forEach(button => button.addEventListener('click', () => { rotate(Number(button.dataset.rotate)); popup.querySelector('.layout-popup-angle').textContent = `Rotation: ${item.rotation}°`; })); popup.querySelector('.layout-delete-button')?.addEventListener('click', remove); }); marker.on('dragend', () => { const pos = marker.getLatLng(); item.lat = pos.lat; item.lng = pos.lng; refreshLayoutSummary(); }); refreshLayoutSummary(); setLayoutStatus(`${type} placedclick it to rotate, or drag it to refine the location`);
}
function finishLayoutLine(a, b, color) {
  clearLayoutPreview(); const line = L.polyline([a, b], { color, weight: 4, opacity: .95, lineCap: 'round' }).addTo(layoutMap);
  const feet = Math.round(layoutMap.distance(a, b) * 3.28084); const label = Object.entries({ '#ff5b68': 'Trench', '#ffd166': 'Conduit', '#62a8ff': 'Striping', '#75d58a': 'Access' }).find(([key]) => key === color)?.[1] || 'Line'; const item = { label, feet, line }; const remove = () => { line.remove(); const index = layoutLines.indexOf(item); if (index >= 0) layoutLines.splice(index, 1); refreshLayoutSummary(); setLayoutStatus(`${label} line deleted`); }; layoutLines.push(item); line.bindTooltip(`${label}${feet} ft`, { sticky: true }); line.bindPopup(`<b>${esc(label)} line</b><br>${feet} ft<br><button type="button" class="layout-delete-button">Delete line</button>`); line.on('popupopen', event => event.popup.getElement().querySelector('.layout-delete-button')?.addEventListener('click', remove)); refreshLayoutSummary(); setLayoutStatus(`${label} line drawnclick two more points for another segment`);
}
function mountLayoutMap() {
  const mapElement = $('#layoutMap'); if (!mapElement) return;
  if (layoutMap) { setTimeout(() => layoutMap.invalidateSize(), 120); return; }
  loadLeaflet().then(L => {
    layoutMap = L.map(mapElement, { zoomControl: true, attributionControl: true, doubleClickZoom: false }).setView([state.site.latitude, state.site.longitude], Number(state.layout.mapZoom) || 19);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 23, attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics' }).addTo(layoutMap);
    L.marker([state.site.latitude, state.site.longitude], { icon: L.divIcon({ className: 'layout-site-pin', html: '<span aria-hidden="true"></span>', iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(layoutMap);
    mapElement.addEventListener('dragover', event => event.preventDefault()); mapElement.addEventListener('drop', event => { event.preventDefault(); const type = event.dataTransfer.getData('text/plain'); if (!type) return; const rect = mapElement.getBoundingClientRect(); addLayoutObject(type, layoutMap.containerPointToLatLng(L.point(event.clientX - rect.left, event.clientY - rect.top))); });
    $$('.layout-object').forEach(button => { button.addEventListener('dragstart', event => event.dataTransfer.setData('text/plain', button.dataset.object)); button.addEventListener('click', () => { layoutMap.once('click', event => addLayoutObject(button.dataset.object, event.latlng)); setLayoutStatus(`Click the map to place ${button.dataset.object}`); }); });
    const lineButton = $('#layoutLineTool'); const colorSelect = $('#layoutLineColor'); lineButton?.addEventListener('click', () => { layoutLineActive = !layoutLineActive; lineButton.classList.toggle('active', layoutLineActive); mapElement.classList.toggle('layout-line-mode', layoutLineActive); lineButton.textContent = layoutLineActive ? '✓ Drawing line' : '+ Line'; layoutLinePoints = []; clearLayoutPreview(); setLayoutStatus(layoutLineActive ? 'Pencil activeclick to start, move, then click to commit' : 'Drag objects onto the mapclick Line to draw'); });
    layoutMap.on('mousemove', event => { if (!layoutLineActive || layoutLinePoints.length !== 1) return; const color = colorSelect?.value || state.layout.defaultLineColor; if (!layoutPreviewLine) layoutPreviewLine = L.polyline([layoutLinePoints[0], event.latlng], { color, weight: 4, opacity: .7, dashArray: '6 6', interactive: false }).addTo(layoutMap); else layoutPreviewLine.setLatLngs([layoutLinePoints[0], event.latlng]); });
    layoutMap.on('click', event => { if (!layoutLineActive) return; layoutLinePoints.push(event.latlng); if (layoutLinePoints.length === 1) { setLayoutStatus('Pencil activemove to preview the line, then click to commit'); } if (layoutLinePoints.length === 2) { finishLayoutLine(layoutLinePoints[0], layoutLinePoints[1], colorSelect?.value || state.layout.defaultLineColor); layoutLinePoints = []; } });
    window.GetEVLayoutMap = layoutMap; setTimeout(() => layoutMap.invalidateSize(), 250);
  }).catch(() => setLayoutStatus('Satellite imagery unavailablecheck the map connection and try again'));
}
function renderDemandMap() {
  const map = $('#evMarketMap'); if (!map) return;
  const inventory = unmatchedNlrStations();
  const mapPoints = [...demandStations.map(station => ({ lat: station.lat, lon: station.lon })), ...inventory.map(station => ({ lat: station.latitude, lon: station.longitude }))];
  const minLat = Math.min(...mapPoints.map(station => station.lat)); const maxLat = Math.max(...mapPoints.map(station => station.lat));
  const minLon = Math.min(...mapPoints.map(station => station.lon)); const maxLon = Math.max(...mapPoints.map(station => station.lon));
  let layer = map.querySelector('.demand-map'); if (!layer) { layer = document.createElement('div'); layer.className = 'demand-map'; map.appendChild(layer); }
  const targetLeft = ((state.site.longitude - minLon) / (maxLon - minLon)) * 86 + 7; const targetTop = (1 - ((state.site.latitude - minLat) / (maxLat - minLat))) * 76 + 12;
  layer.innerHTML = `<span class="demand-target" style="left:${targetLeft.toFixed(2)}%;top:${targetTop.toFixed(2)}%" title="${esc(state.overview.siteName)}Proposed site"></span>` + demandStations.map(station => { const left = ((station.lon - minLon) / (maxLon - minLon)) * 86 + 7; const top = (1 - ((station.lat - minLat) / (maxLat - minLat))) * 76 + 12; const dotSize = stationDotSize(station); const capability = chargerCapability(station); const usagePerPort = stationUsagePerPort(station); const nlrStation = matchingNlrStation(station); return `<span class="demand-dot capability-${capability.key}" style="left:${left.toFixed(2)}%;top:${top.toFixed(2)}%;--dot-size:${dotSize}px;--dot-color:${capability.color}" title="${esc(station.name)}${esc(station.network)}${capability.label}${number(station.ports)} ports${number(station.charges)} observed charges${number(usagePerPort, 1)} observed charges / port${nlrStation ? `NLR: ${number(nlrStation.portCount)} ports, ${number(nlrStation.maxPowerKw || 0)} kW max` : ''}"></span>`; }).join('') + inventory.map(station => { const left = ((station.longitude - minLon) / (maxLon - minLon)) * 86 + 7; const top = (1 - ((station.latitude - minLat) / (maxLat - minLat))) * 76 + 12; const capability = nlrCapability(station); const dotSize = Math.max(7, Math.min(14, 5 + Math.sqrt(Number(station.portCount || 1)))); return `<span class="nlr-inventory-dot capability-${capability.key}" style="left:${left.toFixed(2)}%;top:${top.toFixed(2)}%;--dot-size:${dotSize.toFixed(1)}px;--dot-color:${capability.color}" title="${esc(station.name)}${esc(station.network)}${capability.label}${number(station.portCount)} ports${number(station.maxPowerKw || 0)} kW maxNLR/AFDC"></span>`; }).join('');
  let legend = map.querySelector('.demand-map-label'); if (!legend) { legend = document.createElement('div'); legend.className = 'demand-map-label'; map.appendChild(legend); }
  legend.innerHTML = `<b>NEARBY EV DEMAND</b><span>${number(demandStations.length)} locations${number(demandStations.reduce((total, station) => total + station.ports, 0))} ports${number(demandStations.reduce((total, station) => total + station.charges, 0))} observed charges / 3 mo</span>`;
  legend.remove();
  const footer = map.closest('.ev-market-map-wrap')?.querySelector('.location-map-footer');
  if (footer) footer.innerHTML = `<span>NEARBY EV CHARGERS<br><small>SIZE: OBSERVED USE / PORT<br/><b class="map-key key-target"></b>KNEADERS <b class="map-key key-ultra"></b>ULTRA-FAST <b class="map-key key-high"></b>FAST <b class="map-key key-standard"></b>LOWER-POWER DC${state.ev.nlrStationCount ? '<br/><b class="map-key key-nlr"></b>NLR INVENTORY' : ''}</small></span><strong>NEARBY EV DEMAND<br>${number(demandStations.length)} LOCATIONS${number(demandStations.reduce((total, station) => total + station.ports, 0))} PORTS${number(demandStations.reduce((total, station) => total + station.charges, 0))} OBSERVED CHARGES / 3 MONTHS${state.ev.nlrStationCount ? `<br/><small>NLR INVENTORY: ${number(state.ev.nlrStationCount)} ELECTRIC STATIONS WITHIN 10 MILES<a class="map-source-link" href="https://developer.nlr.gov/docs/transportation/alt-fuel-stations-v1/nearest/" target="_blank" rel="noreferrer">SOURCE ↗</a></small>` : ''}</strong>`;
  mountInteractiveDemandMap();
}
function applyImage(sectionId, imageUrl) { const target = visualTarget(sectionId); if (target) { target.style.backgroundImage = `linear-gradient(#0b1f3333,#0b1f3333), url("${imageUrl}")`; target.style.backgroundSize = 'cover'; target.style.backgroundPosition = 'center'; } }
Object.keys(configSchemas).forEach(sectionId => { const imageUrl = localStorage.getItem(`GetEV-image-${sectionId}`); if (imageUrl) applyImage(sectionId, imageUrl); });
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
function applyUdotAadtRecord() {
  if (!udotAadtRecord || !isEvOnlyBid) return false;
  const aadt = Number(udotAadtRecord.aadt);
  if (!Number.isFinite(aadt)) return false;
  const alreadyMapped = state.ev.trafficSource === 'UDOT' && state.ev.trafficSourceRecordId === String(udotAadtRecord.sourceRecordId);
  if (alreadyMapped && Number(state.ev.dailyTraffic) === aadt) return false;
  state.ev.dailyTraffic = aadt;
  state.ev.trafficSource = 'UDOT';
  state.ev.trafficSourceRecordId = String(udotAadtRecord.sourceRecordId);
  state.ev.trafficRoadName = udotAadtRecord.roadName || '';
  state.ev.trafficDataYear = Number(udotAadtRecord.dataYear) || null;
  state.ev.trafficSourceUrl = udotAadtRecord.sourcePage || udotAadtRecord.sourceUrl || '';
  return true;
}
function applyUtahEvRegistrationRecord() {
  if (!utahEvRegistrationRecord || !isEvOnlyBid) return false;
  const count = Number(utahEvRegistrationRecord.count);
  if (!Number.isFinite(count)) return false;
  const alreadyMapped = state.ev.evRegistrationSource === 'Utah State Tax Commission' && Number(state.ev.evRegistrationYear) === Number(utahEvRegistrationRecord.registrationYear);
  if (alreadyMapped && Number(state.ev.currentBevPopulation) === count) return false;
  state.ev.currentBevPopulation = count;
  state.ev.evRegistrationSource = 'Utah State Tax Commission';
  state.ev.evRegistrationYear = Number(utahEvRegistrationRecord.registrationYear) || null;
  state.ev.evRegistrationObservationDate = utahEvRegistrationRecord.observationDate || '';
  state.ev.evRegistrationSourceUrl = utahEvRegistrationRecord.sourcePage || utahEvRegistrationRecord.sourceUrl || '';
  return true;
}
function applyAmenityPlaceRecord() {
  const record = overturePlacesRecord || osmOverpassRecord;
  if (!record || !isEvOnlyBid) return false;
  const count = Number(record.foodAndDrinkPlaceCountWithinRadius);
  if (!Number.isFinite(count)) return false;
  const source = record.source;
  const release = record.release || record.retrievedAt || '';
  const alreadyMapped = state.ev.amenitySource === source && state.ev.amenityDataRelease === release;
  if (alreadyMapped && Number(state.ev.amenityScore) === count) return false;
  state.ev.amenityScore = count;
  state.ev.amenitySource = source;
  state.ev.amenityRadiusKm = Number(record.amenityRadiusKm) || null;
  state.ev.amenityDataRelease = release;
  state.ev.amenitySourceUrl = record.sourceUrl || '';
  return true;
}
function applyNlrStationsRecord() {
  if (!nlrStationsRecord || !isEvOnlyBid) return false;
  const stations = nlrStationsRecord.stations;
  const byType = stations.reduce((result, station) => { result[station.chargingType] = (result[station.chargingType] || 0) + 1; return result; }, {});
  const values = {
    nlrStationCount: stations.length,
    nlrHighCapacityDcFastCount: byType['high-capacity-dc-fast'] || 0,
    nlrDcFastCount: byType['dc-fast'] || 0,
    nlrLevel2Count: byType['level-2'] || 0,
    nlrInventoryRetrievedAt: nlrStationsRecord.retrievedAt || '',
    nlrInventorySource: 'NLR/AFDC',
    nlrInventoryRadiusMiles: 10,
  };
  const changed = Object.entries(values).some(([key, value]) => state.ev[key] !== value);
  Object.assign(state.ev, values);
  return changed;
}
function normalizePresentationLabels() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const label = node.nodeValue.trim();
    if (label === 'INDEPENDENT INPUTS') node.nodeValue = node.nodeValue.replace('INDEPENDENT INPUTS', 'ASSUMPTIONS');
    if (label === 'DEPENDENT OUTPUTS') node.textContent = '';
  });
}
function refreshDerivedMetrics() {
  const payback = calc.payback();
  const paybackNode = $('#payback');
  if (paybackNode) paybackNode.innerHTML = payback == null ? 'Not reached' : `${number(payback, 1)} <small>yrs</small>`;
  const realizedSavings = calc.solarSavings() / Math.max(1, state.site.utilitySpend) * 100;
  setText('#year1Profit', compactMoney(calc.year1Profit()));
  setText('.hero-badge strong', `${number(realizedSavings, 1)}%`);
}
function renderEvCustomerStory() {
  const section = $('#ev'); if (!section) return;
  const retainedLayoutTool = $('#evLayoutToolMount .layout-tool') || $('#layout .layout-tool');
  section.innerHTML = `<div class="section-heading"><div><div class="section-kicker">04 / EV CHARGING</div><h2>Turn charging visits into customer value.</h2></div><div class="heading-note">Observed Orem demand, an EVpin forecast ramp, and a transparent restaurant-sales opportunity for Kneaders.</div></div><div class="ev-customer-story"><div class="ev-story-hero"><div class="ev-story-intro"><span class="chart-label">KNEADERS CUSTOMER-VALUE STORY</span><h3>More charging visits. More reasons to stop.</h3><p>Daily customers and restaurant sales lead this story. Charging revenue and host economics remain separate from the gross restaurant-sales opportunity.</p></div><div class="ev-story-source-note"><b>Sources</b><span>Parenobserved market performance</span><span>EVpinthird-party utilization forecast</span><a id="evpinSourceLink" href="" target="_blank" rel="noreferrer" hidden>Open EVpin forecast ↗</a></div></div><div class="ev-big-numbers"><article><span>OBSERVED MARKET PROOF</span><strong id="evMarketProof"></strong><small>nearby Tesla charging visits / day</small></article><article><span>PROJECTED AT THIS SITE</span><strong id="evProjectedVisits"></strong><small>charging visits / day by Year 5</small></article><article><span>KNEADERS CAPTURE</span><strong id="evProjectedParties"></strong><small>additional customer parties / day</small></article><article><span>ANNUAL SALES OPPORTUNITY</span><strong id="evProjectedSales"></strong><small>potential gross restaurant sales</small></article></div><div class="ev-story-grid"><div class="ev-panel forecast-panel"><div class="ev-panel-head"><div><span class="chart-label">EVPIN FORECAST RAMP</span><h3>Expected utilization becomes daily visits.</h3></div><span class="source-chip">Third-party forecast</span></div><table class="ev-forecast-table"><thead><tr><th>Year</th><th>EVpin utilization</th><th>Charging visits / day</th><th>Calculation</th></tr></thead><tbody><tr><td>Year 1</td><td id="evY1Util"></td><td id="evY1Visits"></td><td>Ports × 24 × utilization ÷ session hours</td></tr><tr><td>Year 3</td><td id="evY3Util"></td><td id="evY3Visits"></td><td>Ports × 24 × utilization ÷ session hours</td></tr><tr><td>Year 5</td><td id="evY5Util"></td><td id="evY5Visits"></td><td>Ports × 24 × utilization ÷ session hours</td></tr></tbody></table><div class="ev-formula-note">Daily charging visits = Ports × 24 hours × Utilization ÷ Average session length in hours.</div></div><div class="ev-panel observed-panel"><span class="chart-label">WHAT IS ALREADY HAPPENING</span><h3>Orem already has meaningful fast-charging demand.</h3><p>Paren data shows a nearby eight-port Tesla station serving roughly 200 successful charging sessions per day. The average session lasts approximately 24 minutes.</p><div class="ev-proof-line"><strong id="evObservedProof"></strong><span>Observed nearby Tesla visits</span></div><small>Market proof only — not our forecast for the proposed Kneaders site.</small></div></div><div class="ev-story-grid"><div class="ev-panel capture-panel"><span class="chart-label">WHAT THIS COULD MEAN FOR KNEADERS</span><h3>Charging visits can become customer parties.</h3><div class="capture-flow"><span><b id="evCaptureVisits"></b> visits/day</span><i>×</i><span><b id="evCaptureRate"></b> capture</span><i>≈</i><span><b id="evCaptureParties"></b> parties/day</span></div><div class="capture-periods"><span><b id="evCaptureMonthly"></b> parties / month</span><span><b id="evCaptureAnnual"></b> parties / year</span></div></div><div class="ev-panel sales-panel"><div class="ev-panel-head"><div><span class="chart-label">RESTAURANT SALES OPPORTUNITY</span><h3>Gross sales, not profit.</h3></div><span class="source-chip">Separate from charging revenue</span></div><table class="ev-sales-table"><thead><tr><th>Case</th><th>Average receipt</th><th>Daily gross</th><th>Monthly gross</th><th>Annual gross</th></tr></thead><tbody><tr><td>Conservative</td><td id="evSalesConservativeReceipt"></td><td id="evSalesConservativeDaily"></td><td id="evSalesConservativeMonthly"></td><td id="evSalesConservativeAnnual"></td></tr><tr><td>Expected</td><td id="evSalesExpectedReceipt"></td><td id="evSalesExpectedDaily"></td><td id="evSalesExpectedMonthly"></td><td id="evSalesExpectedAnnual"></td></tr><tr><td>High</td><td id="evSalesHighReceipt"></td><td id="evSalesHighDaily"></td><td id="evSalesHighMonthly"></td><td id="evSalesHighAnnual"></td></tr></tbody></table><p class="ev-story-quote" id="evSalesQuote"></p></div></div><div class="ev-assumption-note"><b>Adjustable assumptions</b><span>Ports, average session duration, EVpin utilization by year, restaurant capture rate, average receipt, and operating days. Change them in Configure EV charging.</span></div></div>`;
  if (!isEvOnlyBid) { const hostName = state.overview.siteName; const hostLabel = hostName.toUpperCase(); const city = state.overview.location.split(',')[1]?.trim() || state.overview.location; const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT); const textNodes = []; while (walker.nextNode()) textNodes.push(walker.currentNode); textNodes.forEach(node => { node.nodeValue = node.nodeValue.replaceAll('KNEADERS', hostLabel).replaceAll('Kneaders', hostName).replaceAll('Orem', city); }); }
  const evProjectInvestment = state.investment.ev;
  const model = state.ev.investmentModel;
  const outOfPocket = model === 'Lease parking space' ? 0 : model === '50/50' ? evProjectInvestment * 0.5 : evProjectInvestment;
  const modelDetail = model === 'Lease parking space' ? `${money(state.ev.parkingLeasePerSpotMonth)} per parking spot / month paid to the location` : model === '50/50' ? `50% of installation cost paid by the location; operating profit split 50/50` : `Location owns the equipment and receives charging revenue less maintenance and ${money(state.ev.managementFeePerPortMonth)} / port / month management`;
  const investmentSection = `<div class="ev-investment-summary"><article><span>SELECTED INVESTMENT MODEL</span><strong>${esc(model)}</strong><small>${esc(modelDetail)}</small></article><article><span>LOCATION OUT-OF-POCKET</span><strong>${money(outOfPocket)}</strong><small>Initial investment under the selected model</small></article><article><span>EV PROJECT COST</span><strong>${money(evProjectInvestment)}</strong><small>Equipment and installation basis</small></article></div><div class="ev-investment-models"><article class="${model === 'Lease parking space' ? 'selected' : ''}"><b>Lease parking space</b><span>Installer funds the project and pays the location ${money(state.ev.parkingLeasePerSpotMonth)} per parking spot / month.</span></article><article class="${model === '50/50' ? 'selected' : ''}"><b>50/50</b><span>Installer and location share installation cost and split operating profit 50/50.</span></article><article class="${model === 'Full ownership' ? 'selected' : ''}"><b>Full ownership</b><span>Location funds equipment and installation, then keeps revenue less maintenance and management fees.</span></article></div>`;
  const proposalSections = section.querySelectorAll('.ev-customer-story > .ev-report-section');
  if (proposalSections.length >= 4) {
    proposalSections[3].outerHTML = `${evReportSection('04 / INVESTMENT', 'What does this require out of pocket?', 'Choose exactly one investment model for this EV charging proposal.', investmentSection)}${evReportSection('05 / EV CHARGING REVENUE', 'Charging revenue at Year 5 demand.', 'Gross charging revenue is calculated independently from restaurant sales.', chargingRevenue)}`;
    const finalSections = section.querySelectorAll('.ev-customer-story > .ev-report-section');
    ['01 / LOCATION OVERVIEW', '02 / ABOUT US', '03 / SITE SNAPSHOT', '04 / INVESTMENT', '05 / EV CHARGING REVENUE', '06 / REVENUE FROM ADDITIONAL VISITORS', '07 / EXPENSES', '08 / ECONOMICS'].forEach((label, index) => { const marker = finalSections[index]?.querySelector('.ev-report-head .chart-label'); if (marker) marker.textContent = label; });
  }
  const link = $('#evpinSourceLink'); if (link) { link.hidden = !state.ev.evpinLink; link.href = state.ev.evpinLink || '#'; }
}

function renderEvCustomerValues() {
  const y1 = calc.evForecastVisits(1), y3 = calc.evForecastVisits(3), y5 = calc.evForecastVisits(5), parties = calc.evRoundedParties(5), monthlyParties = parties * 30.42, annualParties = parties * state.ev.daysPerYear;
  const observedVisitsPerDay = Number(state.ev.marketProofSessions3m) > 0 && Number(state.ev.marketProofDays) > 0 ? Number(state.ev.marketProofSessions3m) / Number(state.ev.marketProofDays) : Number(state.ev.marketProofVisitsPerDay);
  const sessionsPerPort = observedVisitsPerDay / Math.max(1, state.ev.marketProofPorts);
  const existingUtilization = observedVisitsPerDay * state.ev.marketProofAverageSessionMinutes / Math.max(1, state.ev.marketProofPorts * 24 * 60) * 100;
  const locationCaptureScore = calc.locationCaptureScore();
  const siteCaptureScore = calc.siteCaptureScore();
  const futureGrowthScore = calc.futureGrowthScore();
  const currentDemandScore = calc.currentDemandScore();
  setText('#evMarketProof', number(observedVisitsPerDay)); setText('#evObservedProof', `${number(observedVisitsPerDay)} visits per day`); setText('#evProjectedVisits', number(y5)); setText('#evProjectedParties', number(parties)); setText('#evProjectedSales', approximateMoney(calc.evRestaurantSalesAnnual(state.ev.averageReceipt)));
  setText('#evCurrentDemandScore', `${number(currentDemandScore, 0)} / 100`); setText('#evCurrentDemandVerdict', currentDemandScore >= 75 ? '2.6x the high-demand threshold' : currentDemandScore >= 60 ? 'Promising site case' : 'Needs more diligence'); setText('#evLocationCaptureScore', `${number(locationCaptureScore)} / 100`); setText('#evSnapshotOutlook', 'STATE CONTEXT'); setText('#evLocationSessions', `~${number(observedVisitsPerDay)} VISITS / DAY`); setText('#evSessionsPerPort', `~${number(sessionsPerPort, 0)} / PORT / DAY`); setText('#evExistingUtilization', `${number(existingUtilization, 1)}%`); setText('#evDwellMinutes', `~${number(state.ev.marketProofAverageSessionMinutes)} MINUTES`); setText('#evLocationTraffic', `${number(state.ev.dailyTraffic)} VEHICLES / DAY`); setText('#evLocationRoute', `${number(state.ev.travelRouteDistance, 1)} MI TO HIGHWAY EXIT`);
  setText('#evSiteCaptureScore', `${number(siteCaptureScore)} / 100`); setText('#evDailyTraffic', number(state.ev.dailyTraffic)); setText('#evVisibilityScore', `${number(state.ev.siteVisibilityScore, 1)} / 10`); setText('#evEntryExitScore', `${number(state.ev.entryExitScore, 1)} / 10`); setText('#evTravelRouteDistance', `${number(state.ev.travelRouteDistance, 1)} mi`); setText('#evCongestionScore', `${number(state.ev.competitorCongestionScore, 1)} / 10`);
  const siteSnapshotSpec = cardCatalog('ev.siteSnapshotMockup', null);
  if (siteSnapshotSpec?.scenarios) siteSnapshotSpec.scenarios.forEach(scenario => { const utilization = Number(state.ev.forecastYear5Utilization) + Number(scenario.utilizationOffset || 0); const visits = state.ev.ports * 24 * (utilization / 100) / Math.max(0.01, state.ev.averageSessionMinutes / 60); const parties = Math.round(visits * state.ev.restaurantCaptureRate / 100); setText(`#evSnapshot${scenario.key}Util`, `${number(utilization, 1)}%`); setText(`#evSnapshot${scenario.key}Visits`, `~${number(visits, 0)}`); setText(`#evSnapshot${scenario.key}Parties`, `~${number(parties, 0)}`); });
  setText('#evFutureGrowthScore', `${number(futureGrowthScore)} / 100`); setText('#evCurrentBevPopulation', number(state.ev.currentBevPopulation)); setText('#evHistoricalBevGrowth', `${number(state.ev.historicalBevGrowthPct)}%`); setText('#evProjectedBevFleet', number(state.ev.projectedBevFleet)); setText('#evTeslaMix', `${number(state.ev.teslaMixPct)}%`); setText('#evTrafficGrowth', `${number(state.ev.trafficGrowthPct, 1)}%`); setText('#evFutureConstruction', number(state.ev.futureChargerConstruction)); setText('#evPublicFastCharging', `${number(state.ev.publicFastChargingBehaviorPct)}%`);
  [[1, y1], [3, y3], [5, y5]].forEach(([year, visits]) => { setText(`#evY${year}Util`, `${number(state.ev[`forecastYear${year}Utilization`], 1)}%`); setText(`#evY${year}Visits`, number(visits)); });
  const guestCases = guestSalesCases();
  const expectedGuestCase = guestCases.find(item => item.key === 'expected') || guestCases[1];
  setText('#evCaptureVisits', `${number(y5, 1)}`); setText('#evCaptureRate', `${number(expectedGuestCase.capture)}%`); setText('#evCaptureParties', `${number(expectedGuestCase.parties, 1)}`); setText('#evCaptureMonthly', number(monthlyParties)); setText('#evCaptureAnnual', number(annualParties));
  [['Conservative', state.ev.conservativeReceipt], ['Expected', state.ev.averageReceipt], ['High', state.ev.highReceipt]].forEach(([key, receipt]) => { const daily = calc.evRestaurantSales(receipt), prefix = `#evSales${key}`; setText(`${prefix}Receipt`, money(receipt)); setText(`${prefix}Daily`, money(daily)); setText(`${prefix}Monthly`, money(calc.evRestaurantSalesMonthly(receipt))); setText(`${prefix}Annual`, money(calc.evRestaurantSalesAnnual(receipt))); });
  renderGuestSalesCases();
  setText('#evSalesExpectedAnnual', money(expectedGuestCase.annual));
  setText('#evSalesExpectedDaily', money(expectedGuestCase.daily));
  setText('#evSalesExpectedTicket', money(expectedGuestCase.spend));
  setText('#evSalesExpectedAnnualCard', money(expectedGuestCase.annual));
  setText('#evSalesExpectedCardDaily', money(expectedGuestCase.daily));
  setText('#evSalesExpectedCardMonthly', money(expectedGuestCase.monthly));
  setText('#evSalesQuote', `Approximately ${number(expectedGuestCase.parties, 1)} additional customer transactions per day could produce roughly ${approximateMoney(expectedGuestCase.annual)} in annual store sales.`);
  const sensitivityParties = [Math.max(1, Math.round(parties * 23 / 28)), parties, Math.max(1, Math.round(parties * 39 / 28))];
  ['Conservative', 'Expected', 'Optimistic'].forEach((label, index) => {
    const sensitivityDaily = sensitivityParties[index] * 25;
    setText(`#evRevenueScenario${label}Parties`, `${number(sensitivityParties[index])} PARTIES / DAY`);
    setText(`#evRevenueScenario${label}Monthly`, money(sensitivityDaily * 30.42));
    setText(`#evRevenueScenario${label}Annual`, money(sensitivityDaily * state.ev.daysPerYear));
  });
}

const evFaceInputs = [
  ['marketProofVisitsPerDay', 'Observed nearby visits / day', 'Paren observed market data', 'number'],
  ['ports', 'Charging ports', 'Operator assumption', 'number'],
  ['averageSessionMinutes', 'Average session duration', 'Operator assumption', 'minutes'],
  ['forecastYear1Utilization', 'Year 1 utilization', 'EVpin forecast', 'percent'],
  ['forecastYear3Utilization', 'Year 3 utilization', 'EVpin forecast', 'percent'],
  ['forecastYear5Utilization', 'Year 5 utilization', 'EVpin forecast', 'percent'],
  ['restaurantCaptureRate', 'Restaurant capture rate', 'Business assumption', 'percent'],
  ['conservativeReceipt', 'Conservative average receipt', 'Business assumption', 'money'],
  ['averageReceipt', 'Expected average receipt', 'Business assumption', 'money'],
  ['highReceipt', 'High average receipt', 'Business assumption', 'money'],
  ['daysPerYear', 'Days of operation / year', 'Operator assumption', 'number'],
  ['energyPerSessionKwh', 'Energy per charging session', 'Operator assumption', 'number'],
  ['chargingPricePerKwh', 'Charging price per kWh', 'Operator assumption', 'money'],
  ['utilityEnergyCostPerKwh', 'Utility energy cost per kWh', 'Operator assumption', 'money'],
  ['networkCostPerPortMonth', 'Network cost per port / month', 'Operator assumption', 'money'],
  ['maintenanceCostPerPortYear', 'Maintenance per port / year', 'Operator assumption', 'money']
];

function evFaceValue(value, format) {
  if (format === 'percent') return `${number(value, 1)}%`;
  if (format === 'money') return money(value);
  if (format === 'minutes') return `${number(value)} min`;
  return number(value);
}

function evFaceInputMarkup([key, label, source, format]) {
  const [min, max, step] = sliderRanges[key];
  const value = Number(state.ev[key]);
  const help = key === 'utilityEnergyCostPerKwh' ? `This rate is annual electricity cost ÷ annual kWh under the applicable utility tariff${state.ev.utilityEnergyCostSource ? ` (${state.ev.utilityEnergyCostSource})` : ''}. Confirm it against the prospect's latest utility bill before final pricing.` : '';
  return `<label class="ev-face-field"><span><b>${esc(label)}${help ? `<button class="metric-help" type="button" aria-label="How ${label} is sourced" title="${esc(help)}">?</button>` : ''}</b><small>${esc(source)}</small></span><input class="ev-face-input" data-ev-key="${key}" data-ev-format="${format}" type="number" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${esc(label)}" /></label>`;
}

const evSectionInputGroups = {
  1: [['ev', 'marketProofVisitsPerDay', 'Forecast visits / day', '3rd party data', 'number'], ['ev', 'marketProofPorts', 'Observed station ports', '3rd party data', 'number'], ['ev', 'marketProofAverageSessionMinutes', 'Observed session duration', '3rd party data', 'minutes']],
  2: [['ev', 'dailyTraffic', 'Roadway audience / day', 'Site evidence', 'number'], ['ev', 'entryExitScore', 'Ease of entry and exit', 'Site fit', 'score'], ['ev', 'travelRouteDistance', 'Distance from major route', 'Site fit', 'miles'], ['ev', 'ports', 'Charging ports', 'Operator assumption', 'number'], ['ev', 'averageSessionMinutes', 'Average session duration', 'Operator assumption', 'minutes'], ['ev', 'forecastYear5Utilization', 'Year 5 utilization', 'EVpin forecast', 'percent'], ['ev', 'restaurantCaptureRate', 'Guest-capture assumption', 'Business assumption', 'percent']],
  3: [['ev', 'lowGuestCaptureRate', 'Low guest capture (%)', 'Planning assumption', 'percent'], ['ev', 'highGuestCaptureRate', 'High guest capture (%)', 'Planning assumption', 'percent'], ['ev', 'restaurantCaptureRate', 'Medium guest capture (%)', 'Business assumption', 'percent'], ['ev', 'conservativeReceipt', 'Low average party spend', 'Business assumption', 'money'], ['ev', 'averageReceipt', 'Expected average party spend', 'Business assumption', 'money'], ['ev', 'highReceipt', 'High average party spend', 'Business assumption', 'money'], ['ev', 'daysPerYear', 'Days of operation / year', 'Operator assumption', 'number']],
  4: [],
  5: [['ev', 'ports', 'Charging ports', 'Operator assumption', 'number'], ['ev', 'forecastYear5Utilization', 'Year 5 utilization', 'EVpin forecast', 'percent'], ['ev', 'energyPerSessionKwh', 'Energy per charging session', 'EVpin forecast', 'number'], ['ev', 'chargingPricePerKwh', 'Charging price / kWh', 'Operator assumption', 'money']],
  6: [['ev', 'parkingLeasePerSpotMonth', 'Parking lease / spot / month', 'Commercial assumption', 'money'], ['ev', 'restaurantCaptureRate', 'Guest-capture assumption', 'Business assumption', 'percent'], ['ev', 'averageReceipt', 'Expected average party spend', 'Business assumption', 'money']],
  7: [['ev', 'ports', 'Charging ports', 'Operator assumption', 'number'], ['ev', 'forecastYear5Utilization', 'Year 5 utilization', 'EVpin forecast', 'percent'], ['ev', 'energyPerSessionKwh', 'Energy per charging session', 'EVpin forecast', 'number'], ['ev', 'chargingPricePerKwh', 'Charging price / kWh', 'Operator assumption', 'money'], ['ev', 'utilityEnergyCostPerKwh', 'Utility energy cost / kWh', 'Operator assumption', 'money']],
  8: [['ev', 'ports', 'Charging ports', 'Operator assumption', 'number'], ['ev', 'forecastYear5Utilization', 'Year 5 utilization', 'EVpin forecast', 'percent'], ['ev', 'energyPerSessionKwh', 'Energy per charging session', 'EVpin forecast', 'number'], ['ev', 'chargingPricePerKwh', 'Charging price / kWh', 'Operator assumption', 'money']],
  9: [['investment', 'ev', 'Estimated project investment', 'Capital assumption', 'money'], ['ev', 'averageReceipt', 'Expected average party spend', 'Business assumption', 'money']]
};
function evSectionInputValue(value, format) {
  if (format === 'score') return `${number(value, 1)} / 10`;
  if (format === 'miles') return `${number(value, 1)} mi`;
  return evFaceValue(value, format);
}
function evSectionInputMarkup([sectionName, key, label, source, format]) {
  if (format === 'select') return `<label class="ev-face-field"><span><b>${esc(label)}</b><small>${esc(source)}</small></span><select class="ev-section-select" data-state-section="${sectionName}" data-state-key="${key}" aria-label="${esc(label)}"><option${state[sectionName][key] === 'Lease parking space' ? ' selected' : ''}>Lease parking space</option><option${state[sectionName][key] === '50/50' ? ' selected' : ''}>50/50</option><option${state[sectionName][key] === 'Full ownership' ? ' selected' : ''}>Full ownership</option></select></label>`;
  const [min, max, step] = (sliderRanges[key] || [0, 10000000, 0.01]); const value = Number(state[sectionName][key]);
  return `<label class="ev-face-field"><span><b>${esc(label)}</b><small>${esc(source)}</small></span><input class="ev-section-input" data-state-section="${sectionName}" data-state-key="${key}" data-state-format="${format}" type="number" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${esc(label)}" /></label>`;
}
const evOutputFormulas = {
  'LOCATION CAPTURE SCORE': '50% sessions per port score + 50% existing utilization score.', 'SESSIONS / PORT / DAY': 'Observed successful sessions per day ÷ observed charging ports.', 'EXISTING UTILIZATION': 'Observed sessions × average session minutes ÷ (ports × 24 hours × 60 minutes).', 'SITE CAPTURE SCORE': 'Weighted traffic, visibility, entry/exit, route proximity, amenities, and competitor-congestion inputs.', 'FUTURE GROWTH SCORE': 'Weighted BEV population, adoption growth, fleet projection, vehicle mix, traffic growth, charger construction, and public fast-charging inputs.', 'YEAR 5 CHARGING VISITS': 'Ports × 24 hours × Year 5 utilization ÷ average session length in hours × operating days.', 'ENERGY DELIVERED': 'Year 5 charging visits × energy delivered per session.', 'GROSS CHARGING REVENUE': 'Year 5 charging visits × energy per session × charging price per kWh.', 'UTILITY ENERGY EXPENSE': 'Year 5 charging visits × energy per session × utility energy cost per kWh.', 'NETWORK + MAINTENANCE': 'Ports × network cost per month × 12 + ports × maintenance cost per year.', 'TOTAL EV OPERATING EXPENSES': 'Utility energy expense + network expense + maintenance expense.', 'YEAR 1 BUSINESS VALUE': 'Foot-traffic revenue plus the revenue stream allowed by the selected investment model.', '20-YEAR FORECASTED ROI': 'Twenty years of model-specific annual value, escalated annually, less the location out-of-pocket investment, divided by that investment.', 'CHARGING OPERATING MARGIN': 'Gross charging revenue − EV operating expenses.', 'EXPECTED RESTAURANT SALES': 'Additional customer parties per day × expected receipt × operating days.', 'ANNUAL DECISION-VIEW VALUE': 'Charging operating margin + expected restaurant gross sales; this is not a single-company profit figure.', 'CHARGING VISITS / DAY': 'Ports × 24 hours × utilization ÷ average session length in hours.', 'DAILY GROSS': 'Additional customer parties per day × average receipt.', 'MONTHLY GROSS': 'Daily gross sales × operating days ÷ 12.', 'ANNUAL GROSS': 'Daily gross sales × operating days.'
};
evOutputFormulas['DELIVERY + BANKABILITY SCORE'] = 'Average of the nine delivery and bankability diligence scores × 10.';
evOutputFormulas['CURRENT DEMAND SCORE'] = '25% location capture score + 25% site capture score + 25% future growth score + 25% delivery and bankability score.';
function renderEvSectionInputOutputPanels() {
  // The reviewed EV proposal has its own section-specific content. Its edit controls are
  // attached by syncInlineEditing instead of the legacy numeric section-index map.
  if (isEvOnlyBid) return;
  Object.entries(evSectionInputGroups).forEach(([index, fields]) => {
    const reportSection = $(`#ev-report-${index}`); if (!reportSection || reportSection.querySelector('.ev-section-inputs')) return;
    const outputNodes = [...reportSection.children].filter(node => !node.classList.contains('ev-report-head'));
    const outputs = document.createElement('div'); outputs.className = 'ev-section-outputs'; outputNodes.forEach(node => outputs.appendChild(node));
    const inputs = document.createElement('div'); inputs.className = 'ev-section-inputs';
    if (index === '4') {
      inputs.className += ' about-us-configs'; inputs.innerHTML = inlineAboutUsLogoControl();
      reportSection.querySelector('.ev-report-head')?.after(inputs); inputs.after(outputs); return;
    }
    const primaryFields = fields;
    inputs.innerHTML = fields.length ? `<div class="ev-section-panel-head"><span class="chart-label">CONFIGS</span><small>Adjust the values that drive this section.</small></div><div class="ev-section-input-scroll">${primaryFields.map(evSectionInputMarkup).join('')}</div>` : `<div class="ev-section-panel-head"><span class="chart-label">CONFIGS</span><small>This narrative section uses the installer company profile; it has no calculated variables.</small></div>`;
    reportSection.querySelector('.ev-report-head')?.after(inputs); inputs.after(outputs);
  });
  $$('#ev .ev-section-outputs article > span, #ev .ev-section-outputs th').forEach(node => {
    const label = node.textContent.trim().toUpperCase(); const formula = evOutputFormulas[label];
    if (formula && !node.querySelector('.formula-hint')) node.innerHTML = `${esc(node.textContent.trim())} ${formulaHint(formula, `Show formula for ${node.textContent.trim()}`)}`;
  });
}
function bindEvSectionInputs() {
  $$('.ev-section-input').forEach(input => {
    const update = () => { const sectionName = input.dataset.stateSection, key = input.dataset.stateKey; state[sectionName][key] = Number(input.value); markScenarioCustom(sectionName); const output = input.parentElement.querySelector('output'); if (output) output.textContent = evSectionInputValue(state[sectionName][key], input.dataset.stateFormat); renderEvCustomerValues(); renderUniversalEvOutputs(); renderEvFinancialValues(); saveState(); };
    input.addEventListener('input', update); input.addEventListener('change', () => { update(); renderReport(); });
  });
  $$('.ev-section-select').forEach(select => select.addEventListener('change', () => { state[select.dataset.stateSection][select.dataset.stateKey] = select.value; saveState(); renderReport(); }));
  $$('.ev-more-assumptions').forEach(button => button.addEventListener('click', () => { const sectionId = button.dataset.assumptionSection; state.meta.expandedAssumptions[sectionId] = !state.meta.expandedAssumptions[sectionId]; saveState(); renderReport(); }));
}

function renderUniversalEvCustomerStory() {
  const section = $('#ev'); if (!section) return;
  const hostName = state.overview.siteName;
  const city = state.overview.location.split(',').map(part => part.trim())[1] || state.overview.location;
  section.innerHTML = `<div class="section-heading"><div><div class="section-kicker">04 / EV CHARGING</div><h2>Turn charging visits into customer value.</h2></div><div class="heading-note">One repeatable business case: observed demand, a third-party utilization forecast, and clearly labeled operating assumptions.</div></div><div class="ev-customer-story"><div class="ev-story-hero"><div class="ev-story-intro"><span class="chart-label">${esc(hostName.toUpperCase())} CUSTOMER-VALUE STORY</span><h3>More charging visits. More reasons to stop.</h3><p>Daily customers and gross restaurant sales lead the story. Charging revenue and host profit-sharing remain separate.</p></div><div class="ev-story-source-note"><b>SOURCES</b><span>Parenobserved local performance</span><span>EVpinthird-party utilization forecast</span><a id="evpinSourceLink" href="" target="_blank" rel="noreferrer" hidden>Open EVpin forecast ↗</a></div></div><div class="ev-big-numbers"><article><span>OBSERVED MARKET PROOF</span><strong id="evMarketProof"></strong><small>nearby fast-charging visits / day</small></article><article><span>PROJECTED AT THIS SITE</span><strong id="evProjectedVisits"></strong><small>charging visits / day by Year 5</small></article><article><span>${esc(hostName.toUpperCase())} CAPTURE</span><strong id="evProjectedParties"></strong><small>additional customer parties / day</small></article><article><span>ANNUAL SALES OPPORTUNITY</span><strong id="evProjectedSales"></strong><small>potential gross restaurant sales</small></article></div><div class="ev-story-grid ev-model-grid"><div class="ev-panel forecast-panel"><div class="ev-panel-head"><div><span class="chart-label">THIRD-PARTY FORECAST RAMP</span><h3>Utilization becomes visits.</h3></div><span class="source-chip">EVpin forecast</span></div><table class="ev-forecast-table"><thead><tr><th>Year</th><th>Utilization</th><th>Charging visits / day</th><th>Formula</th></tr></thead><tbody><tr><td>Year 1</td><td id="evY1Util"></td><td id="evY1Visits"></td><td>Ports × 24 × utilization ÷ session hours</td></tr><tr><td>Year 3</td><td id="evY3Util"></td><td id="evY3Visits"></td><td>Ports × 24 × utilization ÷ session hours</td></tr><tr><td>Year 5</td><td id="evY5Util"></td><td id="evY5Visits"></td><td>Ports × 24 × utilization ÷ session hours</td></tr></tbody></table><div class="ev-formula-note">Charging visits / day = Ports × 24 hours × utilization ÷ average session length in hours.</div></div><aside class="ev-panel ev-assumptions-panel"><div class="ev-panel-head"><div><span class="chart-label">INDEPENDENT INPUTS</span><h3>Working assumptions</h3></div><span class="source-chip">Live inputs</span></div><p>Scroll to inspect every driver. These are inputs; every number below is calculated from them.</p><div class="ev-assumption-scroll">${evFaceInputs.map(evFaceInputMarkup).join('')}</div></aside></div><div class="ev-output-panel"><div><span class="chart-label">DEPENDENT OUTPUTS</span><h3>Calculated business outcomes</h3><p>These values update automatically from the inputs above. Gross sales are not profit and do not include charging revenue.</p></div><div class="ev-output-grid"><article><span>YEAR 1 VISITS / DAY</span><strong id="evOutputY1"></strong></article><article><span>YEAR 3 VISITS / DAY</span><strong id="evOutputY3"></strong></article><article><span>YEAR 5 VISITS / DAY</span><strong id="evOutputY5"></strong></article><article><span>PARTIES / DAY</span><strong id="evOutputPartiesDay"></strong></article><article><span>PARTIES / MONTH</span><strong id="evOutputPartiesMonth"></strong></article><article><span>PARTIES / YEAR</span><strong id="evOutputPartiesYear"></strong></article><article><span>DAILY GROSS SALES</span><strong id="evOutputSalesDay"></strong></article><article><span>MONTHLY GROSS SALES</span><strong id="evOutputSalesMonth"></strong></article><article><span>ANNUAL GROSS SALES</span><strong id="evOutputSalesYear"></strong></article></div></div><div class="ev-story-grid"><div class="ev-panel observed-panel"><span class="chart-label">WHAT IS ALREADY HAPPENING</span><h3>${esc(city)} already has meaningful fast-charging demand.</h3><p>Paren data shows a nearby Tesla fast-charging station serving roughly <b id="evObservedProof"></b> successful sessions per day. This is market proof, not the forecast for ${esc(hostName)}.</p></div><div class="ev-panel capture-panel"><span class="chart-label">WHAT THIS COULD MEAN FOR ${esc(hostName.toUpperCase())}</span><h3>Visits can become customer parties.</h3><div class="capture-flow"><span><b id="evCaptureVisits"></b> visits/day</span><i>×</i><span><b id="evCaptureRate"></b> capture</span><i>≈</i><span><b id="evCaptureParties"></b> parties/day</span></div><div class="capture-periods"><span><b id="evCaptureMonthly"></b> parties / month</span><span><b id="evCaptureAnnual"></b> parties / year</span></div></div></div><div class="ev-panel sales-panel"><div class="ev-panel-head"><div><span class="chart-label">RESTAURANT SALES OPPORTUNITY</span><h3>Gross sales, not profit.</h3></div><span class="source-chip">Separate from charging revenue</span></div><table class="ev-sales-table"><thead><tr><th>Case</th><th>Average receipt</th><th>Daily gross</th><th>Monthly gross</th><th>Annual gross</th></tr></thead><tbody><tr><td>Conservative</td><td id="evSalesConservativeReceipt"></td><td id="evSalesConservativeDaily"></td><td id="evSalesConservativeMonthly"></td><td id="evSalesConservativeAnnual"></td></tr><tr><td>Expected</td><td id="evSalesExpectedReceipt"></td><td id="evSalesExpectedDaily"></td><td id="evSalesExpectedMonthly"></td><td id="evSalesExpectedAnnual"></td></tr><tr><td>High</td><td id="evSalesHighReceipt"></td><td id="evSalesHighDaily"></td><td id="evSalesHighMonthly"></td><td id="evSalesHighAnnual"></td></tr></tbody></table><p class="ev-story-quote" id="evSalesQuote"></p></div></div>`;
  const link = $('#evpinSourceLink'); if (link) { link.hidden = !state.ev.evpinLink; link.href = state.ev.evpinLink || '#'; }
}

function renderUniversalEvOutputs() {
  const y1 = calc.evForecastVisits(1), y3 = calc.evForecastVisits(3), y5 = calc.evForecastVisits(5);
  const parties = calc.evRoundedParties(5), monthlyParties = parties * 30.42, annualParties = parties * state.ev.daysPerYear;
  setText('#evOutputY1', number(y1)); setText('#evOutputY3', number(y3)); setText('#evOutputY5', number(y5));
  setText('#evOutputPartiesDay', number(parties)); setText('#evOutputPartiesMonth', number(monthlyParties)); setText('#evOutputPartiesYear', number(annualParties));
  setText('#evOutputSalesDay', money(calc.evRestaurantSales(state.ev.averageReceipt)));
  setText('#evOutputSalesMonth', roundedMoney(calc.evRestaurantSalesMonthly(state.ev.averageReceipt)));
  setText('#evOutputSalesYear', roundedMoney(calc.evRestaurantSalesAnnual(state.ev.averageReceipt)));
}

function evReportSection(numberLabel, title, subtitle, body, className = '') {
  const locationShort = state.overview.location.split(',').slice(-2).join(',').trim().toUpperCase();
  const locationMeta = isEvOnlyBid && numberLabel === '02 / LOCATION OVERVIEW' ? `<span class="location-report-meta">${esc(state.overview.siteName.toUpperCase())} &nbsp;|&nbsp; ${esc(locationShort)}</span>` : '';
  return `<section class="ev-report-section ${className}"><div class="ev-report-head"><div><span class="chart-label">${numberLabel}</span><h3>${title}</h3></div>${locationMeta}<p>${subtitle}</p></div>${body}</section>`;
}

function personalizeKneadersTemplate(root) {
  if (isKneadersReferenceProposal || !root) return;
  const hostName = state.overview.siteName || 'the host business';
  const hostUpper = hostName.toUpperCase();
  const companyName = state.brand.companyName || 'the installer';
  const city = state.overview.location.split(',').map(part => part.trim()).filter(Boolean)[1] || state.overview.location;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = []; while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach(node => {
    node.nodeValue = node.nodeValue
      .replaceAll('KNEADERS BAKERY & CAFE', hostUpper)
      .replaceAll('KNEADERS', hostUpper)
      .replaceAll('Kneaders', hostName)
      .replaceAll('1SOLAR', companyName.toUpperCase())
      .replaceAll('1Solar', companyName)
      .replaceAll('Orem', city);
  });
}

function renderKneadersReferenceStory(section) {
  renderReviewedProposal(section);
}


function renderStructuredEvCustomerStory() {
  const section = $('#ev'); if (!section) return;
  if (isEvOnlyBid) { renderKneadersReferenceStory(section); return; }
  const retainedLayoutTool = $('#evLayoutToolMount .layout-tool') || $('#layout .layout-tool');
  const hostName = state.overview.siteName;
  const city = state.overview.location.split(',').map(part => part.trim())[1] || state.overview.location;
  const upperHost = esc(hostName.toUpperCase());
  const executiveSummary = `<div class="ev-story-hero"><div class="ev-story-intro"><span class="chart-label">${upperHost} CUSTOMER-VALUE STORY</span><h3>More charging visits. More reasons to stop.</h3><p>Observed demand, a third-party forecast, and editable business assumptions are separated so the opportunity is easy to understand.</p></div><div class="ev-story-source-note"><b>SOURCES</b><span>Parenobserved local performance</span><span>EVpinthird-party utilization forecast</span><a id="evpinSourceLink" href="" target="_blank" rel="noreferrer" hidden>Open EVpin forecast ↗</a></div></div><div class="ev-big-numbers"><article><span>OBSERVED MARKET PROOF</span><strong id="evMarketProof"></strong><small>nearby Tesla visits / day</small></article><article><span>PROJECTED AT THIS SITE</span><strong id="evProjectedVisits"></strong><small>charging visits / day by Year 5</small></article><article><span>${upperHost} CAPTURE</span><strong id="evProjectedParties"></strong><small>additional customer parties / day</small></article><article><span>ANNUAL SALES OPPORTUNITY</span><strong id="evProjectedSales"></strong><small>potential gross restaurant sales</small></article></div>`;
  const marketSaturation = `<div class="ev-market-grid location-market-grid"><div class="ev-market-map-wrap"><div class="ev-market-map-title"><b>NEARBY EV CHARGERS</b><span><i class="location-legend-kneaders"></i> KNEADERS <i class="location-legend-station"></i> OBSERVED STATION <small>Select a red dot for details</small></span></div><div id="evMarketMap" class="map-card ev-market-map"></div><div class="location-map-footer"><span>NEARBY EV DEMAND</span><strong>${number(demandStations.length)} LOCATIONS${number(demandStations.reduce((total, station) => total + station.ports, 0))} PORTS${number(state.ev.observedCharges3m)} OBSERVED CHARGES / 3 MONTHS</strong></div></div><aside class="ev-panel ev-market-proof location-market-proof"><div><span class="chart-label">OBSERVED MARKET EVIDENCE</span><b>VIEW DETAILS ›</b></div><h4>${esc(city)} has proven fast-charging demand.</h4><p>A nearby mature ${number(state.ev.marketProofPorts)}-port station recorded ${number(state.ev.marketProofSessions3m)} successful charging sessions over ${number(state.ev.marketProofDays)} complete weeks — approximately <strong id="evObservedProof"></strong>.</p></aside></div>`;
  const forecast = `<div class="ev-story-grid ev-model-grid"><div class="ev-panel forecast-panel"><div class="ev-panel-head"><div><span class="chart-label">THIRD-PARTY FORECAST RAMP</span><h4>Utilization becomes visits.</h4></div><span class="source-chip">EVpin forecast</span></div><table class="ev-forecast-table"><thead><tr><th>Year</th><th>Utilization</th><th>Charging visits / day</th><th>Formula</th></tr></thead><tbody><tr><td>Year 1</td><td id="evY1Util"></td><td id="evY1Visits"></td><td>Ports × 24 × utilization ÷ session hours</td></tr><tr><td>Year 3</td><td id="evY3Util"></td><td id="evY3Visits"></td><td>Ports × 24 × utilization ÷ session hours</td></tr><tr><td>Year 5</td><td id="evY5Util"></td><td id="evY5Visits"></td><td>Ports × 24 × utilization ÷ session hours</td></tr></tbody></table><div class="ev-formula-note">Charging visits / day = Ports × 24 hours × utilization ÷ average session length in hours.</div></div><aside class="ev-panel ev-assumptions-panel"><div class="ev-panel-head"><div><span class="chart-label">INDEPENDENT INPUTS</span><h4>Working assumptions</h4></div><span class="source-chip">Live inputs</span></div><p>Scroll to inspect and change every driver. The values elsewhere in this report are calculated from these inputs.</p><div class="ev-assumption-scroll">${evFaceInputs.map(evFaceInputMarkup).join('')}</div></aside></div>`;
  const chargingRevenue = `<div class="ev-financial-grid">${enabledCardSpecs(cardCatalog('ev.financialCards.chargingRevenue', []), 'financialCards.chargingRevenue').map(spec => `<article><span>${esc(spec.label)}</span><strong id="${esc(spec.valueId)}"></strong><small>${esc(spec.description || '')}</small></article>`).join('')}</div>`;
  const visitorRevenue = `<div class="ev-panel visitor-note"><span class="chart-label">BASE PLANNING CASE</span><h4 id="evSalesExpectedAnnual"></h4><p>POTENTIAL ANNUAL RESTAURANT SALES</p><strong><span id="evSalesExpectedDaily"></span> / DAY &nbsp;|&nbsp; <span id="evSalesExpectedMonthly"></span> / MONTH</strong></div><div class="ev-financial-grid"><article><span>LOW SPEND</span><strong id="evSalesConservativeReceipt"></strong><small>AVERAGE PARTY SPEND</small><div class="spend-periods"><span><small>DAY</small><b id="evSalesConservativeDaily"></b></span><span><small>MONTH</small><b id="evSalesConservativeMonthly"></b></span><span><small>YEAR</small><b id="evSalesConservativeAnnual"></b></span></div></article><article><span>MEDIUM SPEND</span><strong id="evSalesExpectedReceipt"></strong><small>AVERAGE PARTY SPEND</small><div class="spend-periods"><span><small>DAY</small><b id="evSalesExpectedDaily"></b></span><span><small>MONTH</small><b id="evSalesExpectedMonthly"></b></span><span><small>YEAR</small><b id="evSalesExpectedAnnualCard"></b></span></div></article><article><span>HIGH SPEND</span><strong id="evSalesHighReceipt"></strong><small>AVERAGE PARTY SPEND</small><div class="spend-periods"><span><small>DAY</small><b id="evSalesHighDaily"></b></span><span><small>MONTH</small><b id="evSalesHighMonthly"></b></span><span><small>YEAR</small><b id="evSalesHighAnnual"></b></span></div></article></div><p class="ev-formula-note" id="evSalesQuote">Potential guest parties = Year 5 charging visits × guest-capture assumption. Restaurant sales = guest parties × average party spend × operating days.</p>`;
  const expenses = `<div class="ev-financial-grid">${enabledCardSpecs(cardCatalog('ev.financialCards.expenses', []), 'financialCards.expenses').map(spec => `<article><span>${esc(spec.label)}</span><strong id="${esc(spec.valueId)}"></strong><small>${esc(spec.description || '')}</small></article>`).join('')}</div>`;
  const lenderSupport = `<div class="ev-lender-summary"><article><span>DELIVERY + BANKABILITY SCORE</span><strong>${number(calc.lenderBankabilityScore(), 0)} / 100</strong><small>Weighted equally across nine lender-diligence inputs.</small></article><article><span>DEALERSHIP / PRIVATE-CHARGER DISCOUNT</span><strong>${number(state.lender.dealershipPrivateChargerDiscount)}%</strong><small>Commercial discount assumption; not included in the base economics.</small></article></div><div class="ev-lender-grid"><article><span>UTILITY + AVAILABLE CAPACITY</span><strong>${number(state.lender.utilityCapacityScore)} / 10</strong></article><article><span>TARIFF + DEMAND CHARGES</span><strong>${number(state.lender.tariffDemandChargeScore)} / 10</strong></article><article><span>AHJ + PERMITTING DIFFICULTY</span><strong>${number(state.lender.permittingScore)} / 10</strong></article><article><span>INCENTIVE ELIGIBILITY</span><strong>${number(state.lender.incentiveEligibilityScore)} / 10</strong></article><article><span>CONSTRUCTION COST</span><strong>${number(state.lender.constructionCostScore)} / 10</strong></article><article><span>SAFETY + VANDALISM EXPOSURE</span><strong>${number(state.lender.safetyVandalismScore)} / 10</strong></article><article><span>CELLULAR CONNECTIVITY</span><strong>${number(state.lender.cellularConnectivityScore)} / 10</strong></article><article><span>UPTIME + MAINTENANCE PLAN</span><strong>${number(state.lender.uptimeMaintenanceScore)} / 10</strong></article><article><span>DEBT-SERVICE COVERAGE</span><strong>${number(state.lender.debtServiceCoverageScore)} / 10</strong></article></div><p class="ev-formula-note">This diligence summary is designed for lender review. Scores are editable working assumptions until confirmed by EVpin, the utility, engineering, permitting, and project finance diligence.</p>`;
  const selectedModel = state.ev.investmentModel;
  const economicsOutOfPocket = selectedModel === 'Lease parking space' ? 0 : state.investment.ev * (selectedModel === '50/50' ? 0.5 : 1);
  const annualFootTraffic = calc.evRestaurantSalesAnnual(state.ev.averageReceipt);
  const annualLeaseRevenue = state.ev.ports * state.ev.parkingLeasePerSpotMonth * 12;
  const annualChargerRevenue = calc.evChargingRevenueAnnual();
  const annualChargerEconomics = selectedModel === '50/50' ? annualChargerRevenue * 0.5 : selectedModel === 'Full ownership' ? calc.evChargingMarginAnnual() : 0;
  const annualEconomicValue = annualFootTraffic + (selectedModel === 'Lease parking space' ? annualLeaseRevenue : annualChargerEconomics);
  const economicsStreams = selectedModel === 'Lease parking space'
    ? [{ label: 'Foot traffic revenue', value: annualFootTraffic, className: 'foot-traffic' }, { label: 'Lease revenue', value: annualLeaseRevenue, className: 'lease-revenue' }]
    : [{ label: 'Foot traffic revenue', value: annualFootTraffic, className: 'foot-traffic' }, { label: selectedModel === '50/50' ? '50% charger revenue' : 'Charger operating margin', value: annualChargerEconomics, className: 'charger-revenue' }];
  const forecastBars = (streams, investment = 0) => {
    const years = Array.from({ length: 20 }, (_, index) => streams.map(stream => ({ ...stream, value: stream.value * Math.pow(1 + state.economics.escalation / 100, index) })));
    const maxTotal = Math.max(1, ...years.map(year => year.reduce((sum, stream) => sum + stream.value, 0)));
    const yAxis = [maxTotal, maxTotal * .75, maxTotal * .5, maxTotal * .25, 0];
    return `<div class="ev-economics-chart-wrap"><div class="ev-economics-y-axis" aria-hidden="true">${yAxis.map(value => `<span>${compactMoney(value)}</span>`).join('')}</div><div class="ev-economics-chart" role="img" aria-label="Twenty year forecasted ROI chart with dollar scale">${years.map((year, index) => { const total = year.reduce((sum, stream) => sum + stream.value, 0); const cumulative = years.slice(0, index + 1).reduce((sum, annual) => sum + annual.reduce((subtotal, stream) => subtotal + stream.value, 0), 0) - investment; return `<div class="ev-economics-year" title="Year ${index + 1}: ${money(total)} annual value${money(cumulative)} cumulative after investment"><div class="ev-economics-stack">${year.map(stream => `<i class="${stream.className}" style="height:${(stream.value / maxTotal * 100).toFixed(2)}%"></i>`).join('')}</div><span>${index + 1}</span></div>`; }).join('')}</div></div>`;
  };
  const roi20 = economicsOutOfPocket ? ((Array.from({ length: 20 }, (_, index) => annualEconomicValue * Math.pow(1 + state.economics.escalation / 100, index)).reduce((sum, value) => sum + value, 0) - economicsOutOfPocket) / economicsOutOfPocket) * 100 : null;
  const economics = `<div class="ev-economics-summary"><article><span>SELECTED MODEL</span><strong>${esc(selectedModel)}</strong><small>One model governs this EV investment.</small></article><article><span>LOCATION OUT-OF-POCKET</span><strong>${money(economicsOutOfPocket)}</strong><small>Initial EV equipment and installation contribution.</small></article><article><span>YEAR 1 BUSINESS VALUE</span><strong>${roundedMoney(annualEconomicValue)}</strong><small>${selectedModel === 'Lease parking space' ? 'foot traffic revenue + lease revenue' : 'foot traffic revenue + charger economics'}</small></article><article><span>20-YEAR FORECASTED ROI</span><strong>${roi20 == null ? 'No capital outlay' : `${number(roi20, 0)}%`}</strong><small>Uses the selected model and ${number(state.economics.escalation, 1)}% annual escalation.</small></article></div><div class="ev-economics-card"><div><span class="chart-label">20-YEAR FORECASTED ROI</span><h4>Your 20-year value outlook.</h4><p>${selectedModel === 'Lease parking space' ? 'This model shows only foot traffic revenue and parking-space lease revenue.' : selectedModel === '50/50' ? 'This model shows foot traffic revenue plus 50% of charger revenue.' : 'This model shows foot traffic revenue plus charging operating margin after EV operating expenses.'}</p><div class="ev-economics-legend">${economicsStreams.map(stream => `<span><i class="${stream.className}"></i>${esc(stream.label)}</span>`).join('')}</div></div>${forecastBars(economicsStreams, economicsOutOfPocket)}</div>${selectedModel !== 'Lease parking space' ? `<div class="ev-economics-card ev-charger-revenue-card"><div><span class="chart-label">ALL-CHARGER REVENUE</span><h4>Gross revenue from all chargers.</h4><p>This companion view is shown for ${esc(selectedModel)} and keeps total charger revenue visible before the ownership allocation.</p><div class="ev-economics-legend"><span><i class="charger-revenue"></i>Gross charger revenue</span></div></div>${forecastBars([{ label: 'Gross charger revenue', value: annualChargerRevenue, className: 'charger-revenue' }])}</div>` : ''}<p class="ev-formula-note">The 20-year forecast applies the configured annual escalation to the displayed revenue streams. Foot traffic revenue is gross restaurant sales, not restaurant profit.</p>`;
  const locationOverview = `<div class="ev-location-metrics"><article class="ev-location-metric active"><div><span>MARKET TRAFFIC</span><b>VIEW DETAILS ›</b></div><strong id="evLocationSessions"></strong><em id="evCurrentDemandVerdict"></em><div class="metric-scale"><i></i><i></i><i></i></div><small>LOW &lt;64 <span>TYPICAL 64-80</span> <b>HIGH &gt;80</b></small></article><article class="ev-location-metric"><div><span>PORT PRODUCTIVITY</span><b>VIEW DETAILS ›</b></div><strong id="evSessionsPerPort"></strong><em>~10.4 active hours per port each day</em><div class="metric-scale"><i></i><i></i><i></i></div><small>LOW &lt;8 <span>TYPICAL 8-10</span> <b>HIGH &gt;10</b></small></article><article class="ev-location-metric"><div><span>DWELL OPPORTUNITY</span><b>VIEW DETAILS ›</b></div><strong id="evDwellMinutes"></strong><em>~84 driver-hours of dwell time per day</em><p>Enough time to order, dine, or take food to go</p></article></div>${marketSaturation}<div class="ev-location-support"><article><strong id="evLocationTraffic"></strong><span>ROADWAY COMPARISON</span><small>UDOT AADTSTATE PEAK CONTEXT</small></article><article><strong id="evLocationRoute"></strong><span>GOOD CORRIDOR ACCESS</span><small>VIEW BENCHMARK ›</small></article></div>`;
  const companyInitials = state.brand.companyName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'EV';
  const companyLogo = state.brand.companyLogo ? `<img src="${esc(state.brand.companyLogo)}" alt="${esc(state.brand.companyName)} logo" />` : `<span>${esc(companyInitials)}</span>`;
  const aboutUs = `<div class="ev-story-grid"><article class="ev-panel"><span class="chart-label">ABOUT THE INSTALLER</span><div class="installer-company-header"><div class="installer-company-logo ${state.brand.companyLogo ? 'has-logo' : ''}">${companyLogo}</div><div><h4>${esc(state.brand.companyName)}</h4><p class="installer-tagline">${esc(state.brand.tagline)}</p></div></div><p>${esc(state.brand.companyName)} designs, models, and delivers commercial EV charging projects for host businesses. This proposal connects site demand, construction planning, equipment economics, and the customer experience into one decision-ready plan.</p></article><article class="ev-panel"><span class="chart-label">WHAT WE BRING TO THIS DEAL</span><h4>${esc(state.brand.proposalSlogan)}</h4><div class="ev-installer-list"><span>Site evaluation and utility coordination</span><span>Equipment, civil, electrical, and commissioning planning</span><span>Transparent assumptions and buyer-ready economics</span></div></article></div>`;
  const siteSnapshot = `<div class="ev-score-grid"><article><span>SITE CAPTURE SCORE</span><strong id="evSiteCaptureScore"></strong><small>Traffic, access, route proximity, and competitor congestion</small></article><article><span>DAILY TRAFFIC</span><strong id="evDailyTraffic"></strong><small>vehicles / day near the site</small></article><article><span>SITE VISIBILITY</span><strong id="evVisibilityScore"></strong><small>visibility from the travel corridor</small></article><article><span>EASE OF ENTRY + EXIT</span><strong id="evEntryExitScore"></strong><small>driver access assessment</small></article><article><span>DISTANCE FROM MAJOR ROUTE</span><strong id="evTravelRouteDistance"></strong><small>nearest high-volume travel route</small></article><article><span>COMPETITIVE CHARGER CONGESTION</span><strong id="evCongestionScore"></strong><small>room for a more convenient option</small></article></div><div class="ev-panel ev-demand-narrative"><span class="chart-label">SITE DEMAND CASE</span><h4>Traffic and access turn charge time into a better stop.</h4><p>Daily traffic, easy circulation, and a nearby travel route all increase the likelihood that a driver chooses this site over a less convenient competitor. Existing local charger use supports the demand case; competitor utilization is a supporting comparison, not the forecast for this site.</p></div><div class="ev-score-grid ev-growth-grid"><article><span>FUTURE GROWTH SCORE</span><strong id="evFutureGrowthScore"></strong><small>BEV adoption, traffic, charger development, and public fast-charging behavior</small></article><article><span>CURRENT BEV POPULATION</span><strong id="evCurrentBevPopulation"></strong><small>local market estimate</small></article><article><span>HISTORICAL BEV GROWTH</span><strong id="evHistoricalBevGrowth"></strong><small>annual growth assumption</small></article><article><span>PROJECTED BEV FLEET</span><strong id="evProjectedBevFleet"></strong><small>planning-horizon estimate</small></article><article><span>TESLA + OTHER-MAKE MIX</span><strong id="evTeslaMix"></strong><small>Tesla share; remaining mix is other makes</small></article><article><span>TRAFFIC GROWTH</span><strong id="evTrafficGrowth"></strong><small>annual growth assumption</small></article><article><span>FUTURE CHARGER CONSTRUCTION</span><strong id="evFutureConstruction"></strong><small>known or expected competing sites</small></article><article><span>PUBLIC FAST-CHARGING BEHAVIOR</span><strong id="evPublicFastCharging"></strong><small>BEV drivers expected to use public DC fast charging</small></article></div>${forecast}`;
  section.innerHTML = `<div class="section-heading ev-controls-only"><div><div class="section-kicker">04 / EV CHARGING</div><h2>Turn charging visits into customer value.</h2></div><div class="heading-note">A repeatable EV business case: market proof, forecasted demand, investment, revenue, expenses, and economics.</div></div><div class="ev-customer-story">${evReportSection('01 / LOCATION OVERVIEW', 'What is already happening around this location.', 'Observed charging activity and local traffic show that Orem already supports meaningful fast-charging demand.', locationOverview, 'location-overview-page')}${evReportSection('02 / ABOUT US', 'About the installer proposing this deal.', 'Who is accountable for turning this demand opportunity into a built, operating charging site.', aboutUs)}${evReportSection('03 / SITE SNAPSHOT', 'Why this site can capture demand today and as the EV market grows.', 'Capture and growth scores make each demand driver visible and configurable.', siteSnapshot)}${evReportSection('04 / REVENUE FROM ADDITIONAL GUESTS', 'What could additional charging guests mean for restaurant sales?', 'The expected charging case creates potential guest parties each day. Party spend determines the revenue opportunity.', visitorRevenue)}${evReportSection('05 / EV CHARGING REVENUE', 'Charging revenue at Year 5 demand.', 'Gross charging revenue is calculated independently from restaurant sales.', chargingRevenue)}${evReportSection('06 / EXPENSES', 'Annual EV operating expenses.', 'Operating costs are explicit so gross charging revenue is not mistaken for margin.', expenses)}${evReportSection('07 / ECONOMICS', 'A long-term view of why this model can be worth the investment.', 'The selected investment model determines the revenue streams included in the forecast.', economics, 'ev-projected-section')}${proposalScopes.lenderSupport ? evReportSection('08 / LENDER SUPPORT', 'Delivery and bankability diligence.', 'EVpin, utility, engineering, development, operations, and finance checks in one lender-ready working view.', lenderSupport, 'ev-lender-section') : ''}</div>`;
  const firstThree = section.querySelectorAll('.ev-customer-story > .ev-report-section');
  if (firstThree.length >= 3) {
    firstThree[0].outerHTML = evReportSection('01 / LOCATION OVERVIEW', 'What is already happening around this location.', 'Observed charging activity, local throughput, utilization, and the charger map establish the market context.', locationOverview, 'location-overview-page');
    firstThree[1].outerHTML = evReportSection('02 / ABOUT US', 'About the installer proposing this deal.', 'Who is accountable for turning this demand opportunity into a built, operating charging site.', aboutUs);
    firstThree[2].outerHTML = evReportSection('03 / SITE SNAPSHOT', 'Why this site can capture demand today and as the EV market grows.', 'Capture and growth scores make each demand driver visible and configurable.', siteSnapshot);
  }
  const siteSnapshotReport = section.querySelectorAll('.ev-customer-story > .ev-report-section')[2];
  if (siteSnapshotReport) {
    const siteSnapshotSpec = cardCatalog('ev.siteSnapshotMockup', null) || { title: 'How much charging demand could this site capture?', subtitle: 'Page 2 established the market. Fleet growth, charging behavior and restaurant fit show what this location could capture.' };
    const siteSnapshotHead = siteSnapshotReport.querySelector('.ev-report-head');
    siteSnapshotReport.replaceChildren(siteSnapshotHead);
    siteSnapshotReport.insertAdjacentHTML('beforeend', siteSnapshotMarkup(siteSnapshotSpec));
    siteSnapshotReport.querySelector('.ev-report-head h3').textContent = siteSnapshotSpec.title;
    siteSnapshotReport.querySelector('.ev-report-head p').textContent = siteSnapshotSpec.subtitle;
  }
  const visitorRevenueReport = section.querySelectorAll('.ev-customer-story > .ev-report-section')[3];
  if (visitorRevenueReport) {
    const visitorRevenueSpec = cardCatalog('ev.visitorRevenueMockup', null) || { title: 'What could additional charging guests mean for restaurant sales?', subtitle: 'The expected charging case creates potential guest parties each day. Party spend determines the revenue opportunity.' };
    const visitorRevenueHead = visitorRevenueReport.querySelector('.ev-report-head');
    visitorRevenueReport.replaceChildren(visitorRevenueHead);
    visitorRevenueReport.classList.add('revenue-guests-section');
    visitorRevenueReport.insertAdjacentHTML('beforeend', visitorRevenueMarkup(visitorRevenueSpec));
    const expectedGuestCase = guestSalesCases().find(item => item.key === 'expected');
    visitorRevenueReport.querySelector('.ev-report-head h3').textContent = `Charging guests could add about ${money(expectedGuestCase?.annual || 0)} in annual store sales.`;
    visitorRevenueReport.querySelector('.ev-report-head p').textContent = `The expected case converts ${number(calc.evForecastVisits(5), 1)} charging visits per day into ${number(expectedGuestCase?.parties || 0, 1)} daily store transactions at the stated guest-capture assumption and ticket.`;
  }
  const evProjectInvestment = state.investment.ev;
  const model = state.ev.investmentModel;
  const outOfPocket = model === 'Lease parking space' ? 0 : model === '50/50' ? evProjectInvestment * 0.5 : evProjectInvestment;
  const modelDetail = model === 'Lease parking space'
    ? `${money(state.ev.parkingLeasePerSpotMonth)} per parking spot / month paid to the location`
    : model === '50/50'
      ? '50% of installation cost paid by the location; operating profit split 50/50'
      : `Location owns the equipment and receives charging revenue less maintenance and ${money(state.ev.managementFeePerPortMonth)} / port / month management`;
  const investmentSection = `<div class="ev-investment-summary"><article><span>SELECTED INVESTMENT MODEL</span><strong>${esc(model)}</strong><small>${esc(modelDetail)}</small></article><article><span>LOCATION OUT-OF-POCKET</span><strong>${money(outOfPocket)}</strong><small>Initial investment under the selected model</small></article><article><span>EV PROJECT COST</span><strong>${money(evProjectInvestment)}</strong><small>Equipment and installation basis</small></article></div><div class="ev-investment-models"><article class="${model === 'Lease parking space' ? 'selected' : ''}"><b>Lease parking space</b><span>Installer funds the project and pays the location ${money(state.ev.parkingLeasePerSpotMonth)} per parking spot / month.</span></article><article class="${model === '50/50' ? 'selected' : ''}"><b>50/50</b><span>Installer and location share installation cost and split operating profit 50/50.</span></article><article class="${model === 'Full ownership' ? 'selected' : ''}"><b>Full ownership</b><span>Location funds equipment and installation, then keeps revenue less maintenance and management fees.</span></article></div>`;
  const reportSections = section.querySelectorAll('.ev-customer-story > .ev-report-section');
  if (reportSections.length >= 6) {
    reportSections[5].outerHTML = evReportSection('06 / INVESTMENT + EXPENSES', 'Investment model and operating expenses.', 'Choose one investment model, see the location out-of-pocket cost, and keep operating expenses explicit.', `${investmentSection}${expenses}`);
    const finalSections = section.querySelectorAll('.ev-customer-story > .ev-report-section');
    ['01 / LOCATION OVERVIEW', '02 / ABOUT US', '03 / SITE SNAPSHOT', '04 / EV CHARGING REVENUE', '05 / REVENUE FROM ADDITIONAL VISITORS', '06 / INVESTMENT + EXPENSES', '07 / ECONOMICS'].forEach((label, index) => {
      const marker = finalSections[index]?.querySelector('.ev-report-head .chart-label');
      if (marker) marker.textContent = label;
      if (finalSections[index]) finalSections[index].id = `ev-report-${index + 1}`;
    });
    if (proposalScopes.lenderSupport && finalSections[7]) finalSections[7].id = 'ev-report-8';
  }
  const story = section.querySelector('.ev-customer-story');
  if (story && !story.querySelector('.construction-plan-section')) story.insertAdjacentHTML('beforeend', evReportSection('11 / CONSTRUCTION SITE PLAN', 'Construction site plan.', 'Place equipment, draw trenching and striping, and leave a construction-ready sketch.', '<div class="ev-site-layout"><div id="evLayoutToolMount"></div></div>', 'construction-plan-section'));
  const layoutToolMount = $('#evLayoutToolMount');
  if (retainedLayoutTool && layoutToolMount) layoutToolMount.appendChild(retainedLayoutTool);
  $('#layout')?.classList.add('scope-off');
  setTimeout(() => mountLayoutMap(), 0);
  const link = $('#evpinSourceLink'); if (link) { link.hidden = !state.ev.evpinLink; link.href = state.ev.evpinLink || '#'; }
}

function hideProposalFormulas() {
  $$('#ev .ev-forecast-table tbody td:nth-child(4), #ev .ev-formula-note').forEach(node => {
    const formula = node.textContent.trim();
    if (!formula || node.querySelector('.formula-hint')) return;
    node.classList.add('formula-cell');
    node.innerHTML = formulaHint(formula, 'Show calculation');
  });
}

function renderEvFinancialValues() {
  const annualSessions = calc.evAnnualSessions();
  setText('#evRevenueVisits', number(annualSessions));
  setText('#evRevenueEnergy', number(annualSessions * state.ev.energyPerSessionKwh));
  setText('#evChargingRevenue', roundedMoney(calc.evChargingRevenueAnnual()));
  setText('#evElectricityExpense', roundedMoney(calc.evElectricityExpenseAnnual()));
  setText('#evFixedExpenses', roundedMoney(calc.evNetworkExpenseAnnual() + calc.evMaintenanceExpenseAnnual()));
  setText('#evOperatingExpenses', roundedMoney(calc.evOperatingExpensesAnnual()));
  setText('#evChargingMargin', roundedMoney(calc.evChargingMarginAnnual()));
  setText('#evRestaurantSalesAnnual', roundedMoney(calc.evRestaurantSalesAnnual(state.ev.averageReceipt)));
  setText('#evProjectedValue', roundedMoney(calc.evProjectedValueAnnual()));
}

function bindEvFaceInputs() {
  $$('.ev-face-input').forEach(input => input.addEventListener('input', event => {
    const target = event.currentTarget, key = target.dataset.evKey;
    state.ev[key] = Number(target.value);
    renderEvCustomerValues(); renderUniversalEvOutputs(); renderEvFinancialValues(); saveState();
  }));
}

function renderEvOnlyOverview() {
  if (!isEvOnlyBid) return;
  const heroTitle = $('.hero h1'); if (heroTitle) heroTitle.innerHTML = '<span class="hero-pdf-title">Turn charging visits into</span> <span class="rotating-headline" aria-live="polite"><span class="rotating-headline-word">customer value.</span></span><span class="print-headline">Turn charging visits into customer value.</span>';
  const hostName = state.overview.siteName || 'the host business'; const location = state.overview.location || 'Location pending';
  const heroSub = $('.hero-sub'); if (heroSub) heroSub.innerHTML = `Our goal is to make EV charging a natural extension of the ${esc(hostName)} guest experience - serving current guests, attracting new ones, and giving drivers a warm, welcoming place to spend their charging time. In doing so, the project can create measurable visits and sales while adding a valuable new amenity to the property.<span class="hero-project-id">${esc(hostName)} | ${esc(location)}<br/>Proposed ${number(state.ev.ports)}-port DC fast-charging station</span>`;
  const heroMeta = $('.hero .hero-meta'); if (heroMeta) heroMeta.remove();
  $('#proposal-summary')?.classList.add('scope-off');
  $('.hero-art')?.classList.remove('scope-off');
  setupRotatingHeadline();
  const evKicker = $('#ev .section-kicker'); if (evKicker) evKicker.textContent = '02 / EV CUSTOMER VALUE';
  const evNavigation = [...document.querySelectorAll('#ev .ev-report-section')].map(node=>({label:node.dataset.navLabel || node.querySelector('h3')?.textContent || 'Section',id:node.id}));
  const reportNav = $('.report-nav');
  if (reportNav) reportNav.innerHTML = evNavigation.map((item, index) => `<button class="nav-item ${index === 0 ? 'active' : ''}" data-target="${item.id}"><span>${String(index + 2).padStart(2, '0')}</span>${esc(item.label)}</button>`).join('');
  observeProposalSections();
}

let rotatingHeadlineTimer = null;
function setupRotatingHeadline() {
  const slot = $('.rotating-headline');
  const word = $('.rotating-headline-word');
  if (rotatingHeadlineTimer) window.clearInterval(rotatingHeadlineTimer);
  if (!slot || !word) return;
  slot.dataset.ready = 'true';
  const phrases = ['customer value.', 'restaurant sales.', 'new visits.', 'more business.'];
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { rotatingHeadlineTimer = null; return; }
  let index = 0;
  const rotate = () => {
    word.classList.add('is-fading');
    window.setTimeout(() => {
      index = (index + 1) % phrases.length;
      word.textContent = phrases[index];
      word.classList.remove('is-fading');
    }, 360);
  };
  rotatingHeadlineTimer = window.setInterval(rotate, 3200);
}

function renderReport() {
  applyGuestSalesDefaults();
  const proposalName = state.overview.proposalName || `${state.overview.siteName} ${state.overview.location.split(',').slice(-2).join(',').trim()}`;
  setText('#sidebarBidStatus', state.overview.status); setText('#proposalNameEyebrow', proposalName);
  const proposalEyebrow = $('.hero .eyebrow'); if (proposalEyebrow) proposalEyebrow.innerHTML = `${esc(proposalName)} <span>•</span> ${state.overview.proposalDate}`;
  renderSolarChart(); mountLayoutMap(); const visualPhoto = state.overview.sitePhoto; const visualLogo = state.overview.siteLogo; const logoCard = $('#proposalLogo')?.closest('.proposal-logo-card'); if (visualPhoto) applyProposalVisual('photo', visualPhoto); else applyProposalVisual('photo', overheadImageUrl(state.site.latitude, state.site.longitude)); if (visualLogo) { applyProposalVisual('logo', visualLogo); if (logoCard) logoCard.style.display = ''; } else if (copiedProposal && logoCard) logoCard.style.display = 'none'; setText('.status-pill', state.overview.status);
  setText('#storeName', state.overview.siteName); setText('.hero .store-roof', state.overview.siteName.toUpperCase()); const heroLocation = $('.hero .hero-meta span:last-child'); if (heroLocation) heroLocation.textContent = state.overview.location; const mapLabel = $('#site .map-label'); if (mapLabel) mapLabel.innerHTML = `${state.overview.location.toUpperCase()}<span>${state.site.latitude.toFixed(4)}° N${Math.abs(state.site.longitude).toFixed(4)}° W</span>`; setText('#site .map-tag', state.overview.siteName); const breadcrumb = $('.breadcrumb strong'); if (breadcrumb) breadcrumb.textContent = state.overview.location.split(',').slice(-2).join(',').trim().toUpperCase(); setText('#year1Profit', compactMoney(calc.year1Profit())); setText('#totalInvestment', compactMoney(calc.totalInvestment())); const paybackText = calc.payback() == null ? 'Not reached' : `${number(calc.payback(), 1)} yrs`; setText('#payback', paybackText); const co2Metric = $('#proposal-summary .metric-card:nth-child(4) .metric-value'); if (co2Metric) co2Metric.innerHTML = `${number(calc.co2AvoidedSolar(), 0)} <small>t/yr</small>`;
  const footprint = $('#site .fact-row:nth-child(1) strong'); if (footprint) footprint.innerHTML = `${number(state.site.footprint)} <small>sq ft</small>`;
  const spend = $('#site .fact-row:nth-child(2) strong'); if (spend) spend.innerHTML = `${money(state.site.utilitySpend)} <small>/ yr</small>`;
  const peak = $('#site .fact-row:nth-child(3) strong'); if (peak) peak.innerHTML = `${number(state.site.peakDemand)} <small>kW</small>`;
  const fitCallout = $('#site .fact-callout p'); if (fitCallout) fitCallout.textContent = `${number(state.site.selfConsumption)}% of projected solar production is consumed behind the meter.`;
  setText('#solar .chart-top strong', `${number(calc.solarMwh(), 0)} MWh first year`); setText('#solar .solar-detail h3', `${number(state.solar.arrayKw)} kW DC rooftop array`); setText('#solar .solar-detail .detail-specs span:nth-child(1) b', number(calc.modules())); setText('#solar .solar-detail .detail-specs span:nth-child(2) b', number(calc.solarMwh(), 0)); setText('#solar .solar-detail .detail-specs span:nth-child(3) b', number(state.solar.warranty));
  setText('#storage .battery-copy h3', `${number(state.storage.capacityMwh, 1)} MWh / ${number(state.storage.powerKw)} kW`); setText('#storage .dispatch-footer strong', `− ${number(state.storage.shavePct)}% peak demand`); setText('#storage .peak-marker span', `${number(state.site.peakDemand)} kW`);
  renderStructuredEvCustomerStory(); applyJsonProposalCards(); renderEvSectionInputOutputPanels(); hideProposalFormulas(); renderDemandMap(); renderEvCustomerValues(); renderUniversalEvOutputs(); renderEvFinancialValues(); bindEvFaceInputs(); bindEvSectionInputs();
  const bundleValues = [state.bundles.critterGuard, state.bundles.lighting, state.bundles.hvac]; bundleValues.forEach((value, i) => setText(`#bundles .bundle-card:nth-child(${i + 1}) strong`, money(value)));
  setText('#investment .investment-row:nth-child(2) strong', money(state.investment.solar)); setText('#investment .investment-row:nth-child(3) strong', money(state.investment.battery)); setText('#investment .investment-row:nth-child(4) strong', money(state.investment.ev)); setText('#investment .investment-row:nth-child(5) strong', money(state.investment.siteImprovements)); setText('#investment .investment-row.total strong', money(calc.totalInvestment())); setText('#investment .incentive-card>strong', `Up to ${number(state.investment.incentivePct)}%`); const incentive = $('#investment .incentive-bar i'); if (incentive) incentive.style.width = `${Math.min(100, state.investment.incentivePct)}%`;
  setText('#economics .economics-summary strong', compactMoney(calc.netValue())); setText('#economics .roi-chip', `${number(calc.roi(), 1)}% ROI`);
  renderAuditBlocks(); renderReferenceComponents(); ensureCustomCardProvenance(); $('#ev .audit-grid')?.remove(); $('#ev .regional-benchmark')?.remove(); $('#ev .reference-components')?.remove(); applyScopeCopy(); renderEvOnlyOverview(); normalizePresentationLabels(); refreshDerivedMetrics(); refreshReviewedDetails();
  const renderedSlides=[...document.querySelectorAll('#ev .ev-report-section')];
  const renderedNav=document.querySelector('.report-nav');
  if(renderedNav&&renderedSlides.length>6){
    renderedNav.innerHTML=renderedSlides.map((node,index)=>`<button class="nav-item ${index===0?'active':''}" data-target="${node.id}"><span>${String(index+2).padStart(2,'0')}</span>${esc(node.dataset.navLabel||'Section')}</button>`).join('');
  }
  restoreInlineEdits(); syncInlineEditing(); saveState();
}

const currentScopes = () => ({ solar: $('.config-scope-toggle[data-scope="solar"]')?.checked ?? proposalScopes.solar, storage: $('.config-scope-toggle[data-scope="storage"]')?.checked ?? proposalScopes.storage, ev: $('.config-scope-toggle[data-scope="ev"]')?.checked ?? proposalScopes.ev, lenderSupport: $('.config-scope-toggle[data-scope="lenderSupport"]')?.checked ?? proposalScopes.lenderSupport });
function applyScopeCopy() {
  const scopes = currentScopes();
  document.body.classList.toggle('ev-only-proposal', isEvOnlyBid);
  if (isEvOnlyBid) {
    ['site', 'layout', 'solar', 'storage', 'bundles', 'vpp', 'investment', 'economics'].forEach(id => document.getElementById(id)?.classList.add('scope-off'));
    document.getElementById('ev')?.classList.remove('scope-off');
    return;
  }
  ['site', 'layout', 'solar', 'storage', 'bundles', 'vpp', 'investment', 'economics'].forEach(id => document.getElementById(id)?.classList.remove('scope-off'));
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
  const siteReferenceFoot = $('#site .reference-components .reference-foot'); if (siteReferenceFoot) siteReferenceFoot.textContent = scopes.ev ? `Onsite energy offsets retail purchases first; exports are modeled at the export credit. Nearby demand map: ${number(demandStations.length)} station locations and ${number(state.ev.observedCharges3m)} observed charges in ${state.ev.sourceWindow} from the supplied workbook.` : 'Onsite energy offsets retail purchases first; exports are modeled at the export credit. The utility baseline and modeled bill are ready for review against the customer\'s actual statements.';
  const economicsFoot = $('#economics .reference-components .reference-foot'); if (economicsFoot) economicsFoot.textContent = `All incentives,${scopes.storage ? ' VPP revenue,' : ''}${scopes.ev ? ' utilization and retail revenue,' : ''} energy savings are illustrative until validated by project documents and operating data.`;
}

function renderAuditBlocks() {
  const blocks = {
    site: `<div class="audit-grid"><div><b>Utility baseline</b><span>${money(state.site.utilitySpend / 12)} / month${number(state.site.annualKwh)} kWh / year</span></div><div><b>Cost of doing nothing</b><span>${money(state.site.utilitySpend)} annual utility spend at current rates</span></div><div><b>Solar offset</b><span>${number(calc.solarMwh() * 1000 / Math.max(1, state.site.annualKwh) * 100, 1)}% of annual consumption</span></div></div>`,
    storage: `<div class="audit-grid"><div><b>Demand-charge value</b><span>${money(state.site.demandRate)} / kW-month × 12 months</span></div><div><b>Load result</b><span>${number(state.site.peakDemand)} kW → ${number(calc.postPeak())} kW modeled peak</span></div><div><b>Battery reserve</b><span>${number(state.vpp.reservePct)}% held for resilience / VPP requirements</span></div></div>`,
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
  upsertDetail('site', 'reference-components', `<div class="reference-card"><div class="reference-title">UTILITY BASELINE + VALUE STACK</div><div class="reference-list"><span><b>Provider</b>${esc(state.site.provider)}</span><span><b>Tariff</b>${esc(state.site.tariff)}</span><span><b>Energy charge</b>${money(state.site.energyRate, 2)} / kWh</span><span><b>Demand charge</b>${money(state.site.demandRate, 2)} / kW-month</span><span><b>Current annual bill</b>${money(state.site.utilitySpend)}</span><span><b>Current monthly bill</b>${money(state.site.utilitySpend / 12)}</span></div><div class="rate-stack"><span>Onsite use<strong>${money(state.site.onsiteValue, 2)} / kWh</strong></span><span>Export credit<strong>${money(state.site.exportRate, 2)} / kWh</strong></span><span>Demand reduction<strong>${money(calc.demandSavings())} / yr</strong></span></div><div class="bill-compare"><span>Current bill<strong>${money(state.site.utilitySpend / 12)} / mo</strong></span><i></i><span>Modeled bill<strong>${money(calc.proposedBill() / 12)} / mo</strong></span></div><div class="reference-foot">Onsite energy offsets retail purchases first; exports are modeled at the export credit. Nearby demand map: ${number(demandStations.length)} station locations and ${number(state.ev.observedCharges3m)} observed charges in ${esc(state.ev.sourceWindow)} from the supplied workbook.</div></div>`);
  upsertDetail('solar', 'reference-components', `<div class="reference-card"><div class="reference-title">PHASE 1 → PHASE 2 ROADMAP</div><div class="roadmap"><span><b>01</b>Build the approved ${number(state.solar.arrayKw)} kW foundation</span><span><b>02</b>Measure 12 months of utility and interval data</span><span><b>03</b>Evaluate additional panels, storage, controls, and VPP enrollment</span></div><div class="reference-foot">System design: ${esc(state.solar.installation)}${esc(state.solar.manufacturer)} ${esc(state.solar.model)}${number(state.solar.productionRatio)} kWh/kW-year.</div></div>`);
  upsertDetail('storage', 'reference-components', `<div class="reference-card"><div class="reference-title">BATTERY VALUE STACK + HOURLY LOAD ANALYSIS</div><div class="reference-list"><span><b>Equipment</b>${number(state.storage.capacityMwh, 1)} MWh rated${number(state.storage.capacityMwh * state.storage.batteryEfficiency / 100, 2)} MWh usable</span><span><b>Manufacturer / model</b>${esc(state.storage.manufacturer)}${esc(state.storage.model)}</span><span><b>Controls</b>${esc(state.storage.controls)}</span><span><b>Energy shifting</b>Solar surplus stored for later store load</span><span><b>Demand reduction</b>${money(calc.demandSavings())} modeled annual demand-charge savings</span><span><b>Resilience</b>${number(state.storage.dispatchHours)}-hour dispatch duration with ${number(state.vpp.reservePct)}% reserve</span></div><table class="load-table"><thead><tr><th>Period</th><th>Store load</th><th>Solar</th><th>Battery</th><th>Grid</th></tr></thead><tbody><tr><td>6 AM</td><td>42%</td><td>8%</td><td>+0%</td><td>34%</td></tr><tr><td>12 PM</td><td>78%</td><td>64%</td><td>+14%</td><td>0%</td></tr><tr><td>6 PM</td><td>92%</td><td>22%</td><td>−19%</td><td>51%</td></tr><tr><td>11 PM</td><td>38%</td><td>0%</td><td>−8%</td><td>30%</td></tr></tbody></table><div class="load-series"><span>Solar serves load</span><span>Storage charges</span><span>Storage discharges</span><span>Grid imports / exports</span></div></div>`);
  upsertDetail('bundles', 'reference-components', `<div class="reference-card"><div class="reference-title">BUNDLED SCOPE ACCOUNTABILITY</div><div class="scope-detail-grid"><span><b>Critter guard</b>Wiring and roof protection, installation, inspection, and cleanup${money(state.bundles.critterGuard)}</span><span><b>Permanent lighting</b>Low-profile track lighting, controls, Wi-Fi extenders, and electrical work${money(state.bundles.lighting)}</span><span><b>Commercial HVAC</b>Five high-efficiency units, ducting, mechanical/electrical integration${money(state.bundles.hvac)}</span><span><b>Coordination</b>One schedule, documentation package, payment milestones, and first-call accountability${money(state.bundles.coordination)}</span></div><div class="reference-foot">HVAC contractor base: ${money(state.bundles.hvacBase)}coordination / margin disclosed: ${money(state.bundles.hvac - state.bundles.hvacBase)}.</div></div>`);
  upsertDetail('vpp', 'reference-components', `<div class="reference-card"><div class="reference-title">VPP OPPORTUNITY + APPROVAL PATH</div><div class="vpp-detail-grid"><span><b>Customer value</b>${esc(state.vpp.customerValue)}</span><span><b>Utility value</b>${esc(state.vpp.utilityValue)}</span><span><b>Controls</b>${esc(state.vpp.controls)}</span><span><b>Work plan</b>${esc(state.vpp.workPlan)}</span></div><div class="reference-foot">Status: ${esc(state.vpp.status)}. Dispatch payments, rebates, bill credits, reserve requirements, cybersecurity, interconnection, and final terms require utility review.</div></div>`);
  upsertDetail('investment', 'reference-components', `<div class="reference-card"><div class="reference-title">SIX-SCOPE SUMMARY + SOLAR TURNKEY BREAKDOWN</div><div class="scope-summary"><span>Solar<strong>${money(state.investment.solar)}</strong></span><span>Battery<strong>${money(state.investment.battery)}</strong></span><span>EV charging<strong>${money(state.investment.ev)}</strong></span><span>Critter guard<strong>${money(state.bundles.critterGuard)}</strong></span><span>Lighting<strong>${money(state.bundles.lighting)}</strong></span><span>HVAC<strong>${money(state.bundles.hvac)}</strong></span></div><div class="reference-list"><span><b>Modules</b>${money(state.investment.solarModules)}</span><span><b>Inverters + monitoring</b>${money(state.investment.solarInverters)}</span><span><b>Commercial racking</b>${money(state.investment.solarRacking)}</span><span><b>Electrical BOS</b>${money(state.investment.solarBos)}</span><span><b>Installation labor</b>${money(state.investment.solarLabor)}</span><span><b>Engineering / approvals</b>${money(state.investment.solarEngineering)}</span><span><b>Delivery / commissioning</b>${money(state.investment.solarCommissioning)}</span></div><div class="tax-grid"><span><b>Credits / incentives</b>Federal clean-energy credit potential, grants, rebates, and stacking review</span><span><b>Depreciation</b>MACRS, bonus depreciation, and Section 179 if applicable</span><span><b>Structure</b>${esc(state.investment.ownership)}placed in service ${esc(state.investment.placedInService)}</span><span><b>Documentation</b>Basis, invoices, ownership, timing, and tax-professional review</span></div><div class="comparison-strip"><span>Gross bundled project<strong>${money(calc.totalInvestment())}</strong></span><span>Potential incentive<strong>− ${money(calc.totalInvestment() * state.investment.incentivePct / 100)}</strong></span><span>Illustrative net cost<strong>${money(calc.netInvestment())}</strong></span></div><div class="reference-foot">${number(state.investment.incentivePct)}% is an illustrative working assumption, not a guarantee of eligibility or tax outcome.</div></div>`);
  const rows = Array.from({ length: Math.max(1, Math.round(state.economics.period)) }, (_, i) => { const year = i + 1; const benefit = calc.year1Benefit() * Math.pow(1 + state.economics.escalation / 100, i) - state.economics.annualOpex; return `<tr><td>${year}</td><td>${money(benefit)}</td><td>${money(benefit / Math.pow(1 + state.economics.discountRate / 100, year))}</td></tr>`; }).join('');
  upsertDetail('economics', 'reference-components', `<div class="reference-card"><div class="reference-title">ILLUSTRATIVE ${number(state.economics.period)}-YEAR ROI MODEL</div><table class="roi-table"><thead><tr><th>Year</th><th>Net annual benefit</th><th>Discounted benefit</th></tr></thead><tbody>${rows}</tbody></table><div class="assumption-row"><span><b>Model inputs</b>${number(state.economics.escalation)}% annual escalation${number(state.economics.discountRate)}% discount rate${money(state.economics.annualOpex)} annual OPEX</span><span><b>Sources / validation</b>Utility bills, interval data, tariff, final equipment quotes, tax review, and executed VPP / charging agreements</span></div><div class="reference-foot">All incentives, VPP revenue, utilization, energy savings, and retail revenue are illustrative until validated by project documents and operating data.</div></div>`);
}

$('#applyConfig').addEventListener('click', () => { renderReport(); closeConfig(); });
$('#showAllConfigs').addEventListener('click', () => toggleInlineConfig($('.hero'), 'overview'));
$('#exportConfigs').addEventListener('click', exportConfigs);
$('#importConfigs').addEventListener('click', () => $('#configImportFile').click());
$('#configImportFile').addEventListener('change', event => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => importConfigsText(String(reader.result || '')); reader.readAsText(file); event.target.value = ''; });

const editableTextSelector = 'h1,h2,h3,h4,p,span,small,strong,b,th,td,li,.metric-value,.ev-formula-note,.hero-badge';
const excludedInlineEditSelector = '.section-controls,.hero-actions,button,input,select,textarea,.layout-sidebar,.layout-map-shell,.leaflet-container,.map-grid,.map-road,.map-pin,.chart-bars,.dispatch-chart,.roi-bars,.battery-pack,.energy-signal,.sun-orb,.store-block';
function editableFor(section) {
  const candidates = [...section.querySelectorAll(editableTextSelector)].filter(field => field.textContent.trim() && !field.closest(excludedInlineEditSelector));
  return candidates.filter(field => !candidates.some(other => other !== field && other.contains(field)));
}
function saveInlineEdits() { localStorage.setItem(inlineEditStorageKey, JSON.stringify(inlineEdits)); }
function prepareInlineEdits(section) {
  editableFor(section).forEach((field, index) => {
    const key = `${section.id}:${index}`; field.dataset.inlineEditKey = key;
    if (Object.hasOwn(inlineEdits, key) && !field.isContentEditable) field.innerHTML = inlineEdits[key];
    if (field.dataset.inlineEditBound === 'true') return;
    field.dataset.inlineEditBound = 'true';
    field.addEventListener('input', () => { inlineEdits[field.dataset.inlineEditKey] = field.innerHTML; saveInlineEdits(); });
  });
}
function restoreInlineEdits() { [$('.hero'), ...$$('.content-section')].filter(Boolean).forEach(prepareInlineEdits); }
function setSectionEditing(section, editing) { prepareInlineEdits(section); editableFor(section).forEach(field => { field.contentEditable = editing; field.classList.toggle('inline-editing', editing); }); }
function syncInlineEditing() {
  const editing = document.body.classList.contains('edit-mode') && !document.body.classList.contains('view-only');
  const hero = $('.hero');
  if (hero) { setSectionEditing(hero, editing); if (editing && !hero.querySelector('.inline-config-dials')) toggleInlineConfig(hero, 'overview'); if (!editing) hero.querySelector('.inline-config-dials')?.remove(); }
  $$('.content-section').forEach(section => setSectionEditing(section, editing));
  const evConfigSections = { 'ev-report-1': 'ev', 'ev-report-2': 'overview', 'ev-report-3': 'ev', 'ev-report-4': 'ev', 'ev-report-5': 'ev', 'ev-report-6': 'ev', 'ev-report-7': 'economics', 'ev-report-8': 'lender' };
  $$('#ev .ev-report-section').forEach(section => {
    setSectionEditing(section, editing);
    if (editing && !['ev-equipment','ev-construction'].includes(section.id) && !section.querySelector('.ev-section-inputs') && !section.querySelector('.inline-config-dials')) toggleInlineConfig(section, evConfigSections[section.id] || 'ev');
    if (!editing) section.querySelector('.inline-config-dials')?.remove();
  });
}

const jumpToReportSection = item => {
  if (document.body.classList.contains('definitions-mode')) {
    const definitionTargets = {
      'ev-report-1': ['locationMetrics'],
      'ev-report-2': ['siteSnapshotMockup.scenarios', 'siteSnapshotMockup.fit.items'],
      'ev-report-3': ['spendingCases', 'financialCards.chargingRevenue', 'financialCards.expenses', 'visitorRevenueMockup'],
      'ev-report-4': ['referencePages.about.cards'],
      'ev-report-5': ['referencePages.partnership'],
      'ev-report-6': ['referencePages.optionOne'],
      'ev-report-7': ['referencePages.daily'],
      'ev-report-8': ['referencePages.annual'],
      'ev-report-9': ['referencePages.roi']
    };
    const key = (definitionTargets[item?.dataset?.target] || [])[0];
    const target = key ? document.querySelector(`[data-definition-group="${key}"]`) : null;
    if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); $$('.nav-item').forEach(nav => nav.classList.toggle('active', nav === item)); }
    return;
  }
  const target = document.getElementById(item?.dataset?.target || '');
  if (!target || target.classList.contains('scope-off')) return;
  const topbarHeight = document.querySelector('.topbar')?.offsetHeight || 0;
  const destination = Math.max(0, window.scrollY + target.getBoundingClientRect().top - topbarHeight - 20);
  window.scrollTo({ top: destination, behavior: 'smooth' });
  $$('.nav-item').forEach(nav => nav.classList.toggle('active', nav === item));
};
$('.report-nav')?.addEventListener('click', event => {
  const item = event.target.closest('.nav-item');
  if (!item) return;
  event.preventDefault();
  jumpToReportSection(item);
});
const updateActiveProposalNav = () => {
  const navItems = $$('.nav-item[data-target]').filter(item => !item.classList.contains('scope-off'));
  if (!navItems.length) return;
  const readingLine = (document.querySelector('.topbar')?.offsetHeight || 0) + 84;
  let current = navItems[0];
  for (const item of navItems) {
    const target = document.getElementById(item.dataset.target);
    if (!target || target.classList.contains('scope-off')) continue;
    if (target.getBoundingClientRect().top <= readingLine) current = item;
    else break;
  }
  navItems.forEach(item => item.classList.toggle('active', item === current));
};
const observer = new IntersectionObserver(() => updateActiveProposalNav(), { rootMargin: '-10% 0px -10% 0px', threshold: 0 });
const observeProposalSections = () => { $$('.section-anchor,.ev-report-section').forEach(section => { if (!section.dataset.navObserved) { section.dataset.navObserved = 'true'; observer.observe(section); } }); updateActiveProposalNav(); };
let navScrollFrame = 0;
window.addEventListener('scroll', () => { if (navScrollFrame) return; navScrollFrame = requestAnimationFrame(() => { navScrollFrame = 0; updateActiveProposalNav(); }); }, { passive: true });
observeProposalSections();

let proposalNameInput = $('#proposalNameInput'); if (!proposalNameInput) { const editSection = $('#editPanel .edit-section'); if (editSection) { const label = document.createElement('label'); label.textContent = 'Proposal name'; proposalNameInput = document.createElement('input'); proposalNameInput.id = 'proposalNameInput'; proposalNameInput.placeholder = 'e.g. Kneaders Bakery & Cafe Orem, Utah'; label.append(proposalNameInput); editSection.prepend(label); } } if (proposalNameInput) { proposalNameInput.value = state.overview.proposalName || `${state.overview.siteName} ${state.overview.location.split(',').slice(-2).join(',').trim()}`; proposalNameInput.addEventListener('input', event => { state.overview.proposalName = event.target.value; renderReport(); }); }
const siteInput = $('#siteInput'); if (siteInput) { siteInput.value = state.overview.siteName; siteInput.addEventListener('input', event => { state.overview.siteName = event.target.value; if (!state.overview.proposalName || state.overview.proposalName.includes('Energy Proposal')) state.overview.proposalName = `${event.target.value} ${state.overview.location.split(',').slice(-2).join(',').trim()}`; renderReport(); }); }
const utilityInput = $('#utilityInput'); if (utilityInput) { utilityInput.value = state.site.utilitySpend; utilityInput.addEventListener('input', event => { state.site.utilitySpend = Number(event.target.value.replace(/[^0-9]/g, '')) || 0; renderReport(); }); }
function updateScopeUI() {
  const scopeControls = $$('.config-scope-toggle');
  const activeScopes = new Set(scopeControls.length ? scopeControls.filter(control => control.checked).map(control => control.dataset.scope) : Object.entries(activeBid.scopes).filter(([, enabled]) => enabled).map(([scope]) => scope));
  const coreScopes = new Set([...activeScopes].filter(scope => ['solar', 'storage', 'ev'].includes(scope)));
  scopeControls.forEach(control => { control.checked = activeScopes.has(control.dataset.scope); });
  ['solar', 'storage', 'ev'].forEach(scope => { const section = document.getElementById(scope); const nav = $(`.nav-item[data-target="${scope}"]`); if (section) section.classList.toggle('scope-off', !coreScopes.has(scope)); if (nav) nav.classList.toggle('scope-off', !coreScopes.has(scope)); }); const layoutSection = document.getElementById('layout'); const layoutNav = $('.nav-item[data-target="layout"]'); if (layoutSection) layoutSection.classList.toggle('scope-off', isEvOnlyBid || !coreScopes.has('ev')); if (layoutNav) layoutNav.classList.toggle('scope-off', isEvOnlyBid || !coreScopes.has('ev')); const bundles = document.getElementById('bundles'); const bundlesNav = $('.nav-item[data-target="bundles"]'); if (bundles) bundles.classList.toggle('scope-off', coreScopes.size !== 3); if (bundlesNav) bundlesNav.classList.toggle('scope-off', coreScopes.size !== 3); const vpp = document.getElementById('vpp'); const vppNav = $('.nav-item[data-target="vpp"]'); if (vpp) vpp.classList.toggle('scope-off', !coreScopes.has('storage')); if (vppNav) vppNav.classList.toggle('scope-off', !coreScopes.has('storage'));
  let number = 2;
  ['site', 'layout', 'solar', 'storage', 'ev', 'bundles', 'vpp', 'investment', 'economics'].forEach(sectionId => { const section = document.getElementById(sectionId); const nav = $(`.nav-item[data-target="${sectionId}"]`); if (!section || section.classList.contains('scope-off')) { if (nav) nav.classList.toggle('scope-off', !section || section.classList.contains('scope-off')); return; } const label = String(number).padStart(2, '0'); const kicker = section.querySelector('.section-kicker'); if (kicker) kicker.textContent = kicker.textContent.replace(/^\d+\s*\/\s*/, `${label} / `); if (nav) nav.querySelector('span').textContent = label; number += 1; });
  const overviewNav = $('.nav-item[data-target="overview"]'); if (overviewNav) overviewNav.querySelector('span').textContent = '01';
}
$$('.config-scope-toggle').forEach(toggle => toggle.addEventListener('change', () => { updateScopeUI(); applyScopeCopy(); }));
$$('.segmented button').forEach(button => button.addEventListener('click', () => { $$('.segmented button').forEach(item => item.classList.remove('selected')); button.classList.add('selected'); }));
const openBidCard = card => { const proposalUrl = new URL(window.location.href); proposalUrl.search = ''; proposalUrl.hash = ''; proposalUrl.searchParams.set('bid', card.dataset.bid); window.location.assign(proposalUrl.toString()); };
function bindDashboardCards() { $$('.bid-card').forEach(card => { card.tabIndex = 0; card.setAttribute('role', 'link'); card.setAttribute('aria-label', `Open ${card.querySelector('h2')?.textContent?.trim() || 'proposal'}`); card.addEventListener('click', event => { if (!event.target.closest('button,a')) openBidCard(card); }); card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openBidCard(card); } }); }); }
bindDashboardCards();
document.addEventListener('click', event => { const card = event.target.closest?.('.bid-card'); if (card && !event.target.closest('button,a')) openBidCard(card); }, true);
function inferNewProposalLocationType(value) {
  const text = String(value || '').toLowerCase();
  if (/restaurant|cafe|bakery|coffee|diner|fast.?food|pizza|kneaders/.test(text)) return 'Restaurant';
  if (/gas|fuel|7[- ]?eleven|chevron|shell|exxon|maverik|wawa/.test(text)) return 'Gas station';
  if (/dealership|motors|automotive|auto sales|ford|toyota|honda|nissan|kia|hyundai/.test(text)) return 'Car dealership';
  if (/apartment|apartments|residential|condominium|townhome|housing/.test(text)) return 'Apartment complex';
  if (/retail|market|grocery|walmart|target|store|shopping|mall|pharmacy|cvs|walgreens/.test(text)) return 'Retail store';
  return text.trim() ? 'Commercial property' : 'Choose a location';
}
const locationStateNames = { al: 'Alabama', ak: 'Alaska', az: 'Arizona', ar: 'Arkansas', ca: 'California', co: 'Colorado', fl: 'Florida', id: 'Idaho', il: 'Illinois', md: 'Maryland', mi: 'Michigan', mn: 'Minnesota', mo: 'Missouri', mt: 'Montana', nv: 'Nevada', nm: 'New Mexico', ny: 'New York', nc: 'North Carolina', oh: 'Ohio', ok: 'Oklahoma', or: 'Oregon', pa: 'Pennsylvania', tn: 'Tennessee', tx: 'Texas', ut: 'Utah', va: 'Virginia', wa: 'Washington', wi: 'Wisconsin', wy: 'Wyoming' };
const locationSearchAliases = { maverick: 'Maverik', 'maverick lehi': 'Maverik Lehi', 'chubby\'s express': "Chubby's Cafe", friends: "Friends Food & Gas" , '7 eleven': '7-Eleven', '7eleven': '7-Eleven' };
function locationStateCode(address, searchText = '') {
  const raw = String(address?.state_code || address?.state || '').trim().replace(/^US-/i, '').toLowerCase();
  if (raw.length === 2 && locationStateNames[raw]) return raw.toUpperCase();
  const named = Object.entries(locationStateNames).find(([, name]) => name.toLowerCase() === raw);
  if (named) return named[0].toUpperCase();
  const queryMatch = String(searchText).match(/(?:^|\s)([a-z]{2})$/i);
  return queryMatch && locationStateNames[queryMatch[1].toLowerCase()] ? queryMatch[1].toUpperCase() : '';
}
function locationSearchVariants(raw) {
  const value = String(raw || '').trim().replace(/\s+/g, ' ');
  const match = value.match(/^(.+?)\s+in\s+(.+)$/i);
  const reverseMatch = !match && value.match(/^(.+?)\s+(ut|utah|co|colorado|az|arizona|or|oregon|id|idaho|nv|nevada)\s+(.+)$/i);
  const leadingBrandMatch = !match && !reverseMatch && value.match(/^(maverick|maverik|7[- ]?eleven)\s+(.+?)\s+(ut|utah|co|colorado|az|arizona|or|oregon|id|idaho|nv|nevada)$/i);
  const place = match ? match[1].trim() : reverseMatch ? reverseMatch[3].trim() : leadingBrandMatch ? leadingBrandMatch[1].trim() : value;
  const area = match ? match[2].trim() : reverseMatch ? `${reverseMatch[1].trim()} ${reverseMatch[2].trim()}` : leadingBrandMatch ? `${leadingBrandMatch[2].trim()} ${leadingBrandMatch[3].trim()}` : '';
  const normalizedArea = area.replace(/\b([A-Za-z]{2})\b$/i, (_, code) => locationStateNames[code.toLowerCase()] || code);
  const normalizedPlace = locationSearchAliases[place.toLowerCase()] || place;
  const normalized = [normalizedPlace, normalizedArea].filter(Boolean).join(', ');
  return [...new Set([value, normalized, `${normalizedPlace} ${normalizedArea}`, `${normalizedPlace}, ${normalizedArea}`].filter(Boolean))];
}
async function searchLocationSuggestions(raw) {
  try { const response=await fetch('location-lookup-data.json'); const data=await response.json(); const matches=data.records.filter(record=>new RegExp(record.match,'i').test(raw)); if(matches.length)return matches; } catch {}
  for (const query of locationSearchVariants(raw)) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&namedetails=1&limit=5&countrycodes=us&q=${encodeURIComponent(query)}`, { headers: { accept: 'application/json' } });
      if (!response.ok) continue;
      const results = await response.json();
      if (Array.isArray(results) && results.length) return results;
    } catch {}
  }
  const normalized = String(raw || '').toLowerCase();
  if (/chubby/.test(normalized) && /lehi/.test(normalized)) return [{ name: "Chubby's Express", display_name: 'Chubby Express, 3156 N 1200 W Suite 100, Lehi, UT 84043', address: { house_number: '3156', road: 'N 1200 W', city: 'Lehi', state: 'Utah', state_code: 'UT', postcode: '84043' } }];
  if (/maveri[ck]/.test(normalized) && /lehi/.test(normalized)) return [
    { name: 'Maverik #580', display_name: 'Maverik, 1075 S 1100 W, Lehi, UT 84043', lat: '40.3673', lon: '-111.8738', address: { house_number: '1075', road: 'S 1100 W', city: 'Lehi', state: 'Utah', state_code: 'UT', postcode: '84043' } },
    { name: 'Maverik #601', display_name: 'Maverik, 2050 N 3600 W, Lehi, UT 84043', lat: '40.4152', lon: '-111.9433', address: { house_number: '2050', road: 'N 3600 W', city: 'Lehi', state: 'Utah', state_code: 'UT', postcode: '84043' } },
    { name: 'Maverik #358', display_name: 'Maverik, 3569 N Thanksgiving Way, Lehi, UT 84043', lat: '40.4330', lon: '-111.8852', address: { house_number: '3569', road: 'N Thanksgiving Way', city: 'Lehi', state: 'Utah', state_code: 'UT', postcode: '84043' } }
  ];
  return [];
}
window.getevSearchLocationSuggestions = searchLocationSuggestions;
function enhanceNewProposalModal() {
  const modal = $('#newProposalSetup'); const form = modal?.querySelector('form'); if (!modal || !form || form.dataset.enhanced === 'true') return;
  form.dataset.enhanced = 'true';
  modal.querySelectorAll('input[name="utilitySpend"],input[name="ports"]').forEach(input => input.closest('label')?.remove());
  modal.querySelectorAll('.new-proposal-row').forEach(row => { if (!row.querySelector('label')) row.remove(); });
  const nameLabel = form.querySelector('input[name="siteName"]')?.closest('label');
  if (!nameLabel) return;
  nameLabel.classList.add('new-proposal-search-label');
  nameLabel.childNodes[0].textContent = 'Find a location ';
  const queryInput = nameLabel.querySelector('input[name="siteName"]');
  queryInput.type = 'search'; queryInput.autocomplete = 'off'; queryInput.placeholder = 'e.g. Chubby’s Express in Lehi, UT';
  nameLabel.insertAdjacentHTML('beforeend', '<span class="optional">Optional — you can start with a name, an address, or neither.</span><div class="new-proposal-suggestions" role="listbox" hidden></div>');
   const dateLabel = form.querySelector('input[name="proposalDate"]')?.closest('label');
   const typeLabel = document.createElement('label'); typeLabel.className = 'new-proposal-location-type'; typeLabel.innerHTML = 'Location type <select name="locationType"><option value="">Choose a location</option><option>Apartment complex</option><option>Car dealership</option><option>Commercial business</option><option>Commercial office space</option><option>Convenience store</option><option>Gas station</option><option>Grocery store</option><option>Hotel</option><option>Restaurant</option><option>Retail store</option><option>Other</option></select><input name="locationTypeOther" hidden placeholder="Describe location type"></label>';
   dateLabel?.after(typeLabel);
   const locationPreview = document.createElement('div'); locationPreview.className = 'new-proposal-location-preview'; locationPreview.hidden = true; locationPreview.innerHTML = '<div class="new-proposal-location-preview-head"><b>Confirm location</b><span>Selected map point</span></div><div class="new-proposal-location-map" aria-label="Map preview of selected location"></div><small class="new-proposal-location-preview-address"></small>'; nameLabel.after(locationPreview);
   const suggestions = nameLabel.querySelector('.new-proposal-suggestions'); const typeSelect = typeLabel.querySelector('select'); const typeOther = typeLabel.querySelector('input');
   let locationPreviewMap; let locationPreviewMarker;
   const showLocationPreview = async result => { const lat = Number(result?.lat); const lon = Number(result?.lon); if (!Number.isFinite(lat) || !Number.isFinite(lon)) { locationPreview.hidden = true; return; } locationPreview.hidden = false; locationPreview.querySelector('.new-proposal-location-preview-address').textContent = result.display_name || 'Selected location'; try { const L = await loadLeaflet(); if (!locationPreviewMap) { locationPreviewMap = L.map(locationPreview.querySelector('.new-proposal-location-map'), { zoomControl: true, attributionControl: true, dragging: true, scrollWheelZoom: false }).setView([lat, lon], 16); L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics', maxZoom: 19 }).addTo(locationPreviewMap); } else { locationPreviewMap.setView([lat, lon], 16); } if (locationPreviewMarker) locationPreviewMarker.setLatLng([lat, lon]); else locationPreviewMarker = L.marker([lat, lon]).addTo(locationPreviewMap); setTimeout(() => locationPreviewMap.invalidateSize(), 50); } catch { locationPreview.hidden = false; } };
  const syncType = () => { const inferred = inferNewProposalLocationType([form.siteName?.value, form.street?.value, form.city?.value].join(' ')); if (!typeSelect.value) typeSelect.value = inferred === 'Choose a location' ? '' : inferred; typeOther.hidden = typeSelect.value !== 'Other'; bidProfiles['kneaders-orem'].overrides.overview.locationType = typeSelect.value === 'Other' ? (typeOther.value || 'Commercial business') : (typeSelect.value || inferred); };
   const selectResult = result => { const address = result.address || {}; const street = [address.house_number, address.road].filter(Boolean).join(' '); const city = address.city || address.town || address.village || address.municipality || ''; const stateCode = locationStateCode(address, queryInput.value); if (result.namedetails?.name || result.name) form.siteName.value = result.namedetails?.name || result.name; if (street) form.street.value = street; if (city) form.city.value = city; if (stateCode) form.stateCode.value = stateCode; if (address.postcode) form.zip.value = address.postcode; form.dataset.selectedLat = result.lat || ''; form.dataset.selectedLon = result.lon || ''; suggestions.hidden = true; typeSelect.value = result.locationType || inferNewProposalLocationType(result.name || ""); syncType(); showLocationPreview(result); };
  let searchTimer;
   queryInput.addEventListener('input', () => { syncType(); clearTimeout(searchTimer); const query = queryInput.value.trim(); if (query.length < 3) { suggestions.hidden = true; return; } searchTimer = setTimeout(async () => { try { const results = await searchLocationSuggestions(query); if(queryInput.value.trim() !== query)return; suggestions.innerHTML = results.length ? results.map((result, index) => `<button type="button" role="option" data-result-index="${index}"><b>${esc(result.namedetails?.name || result.name || 'Suggested location')}</b><small>${esc(result.display_name || '')}</small></button>`).join('') : '<p>No matching locations found. Try the business name followed by the city and state.</p>'; suggestions.hidden = false; suggestions.querySelectorAll('[data-result-index]').forEach(button => button.addEventListener('click', () => selectResult(results[Number(button.dataset.resultIndex)]))); } catch { suggestions.innerHTML = '<p>Location search is unavailable. Enter the address manually.</p>'; suggestions.hidden = false; } }, 300); });
  form.querySelectorAll('input[name="siteName"],input[name="street"],input[name="city"],input[name="stateCode"],input[name="locationTypeOther"]').forEach(input => input.addEventListener('input', syncType));
  typeSelect.addEventListener('change', syncType);
   form.addEventListener('reset', () => { setTimeout(() => { queryInput.value = ''; suggestions.hidden = true; locationPreview.hidden = true; typeSelect.value = ''; typeOther.hidden = true; delete form.dataset.selectedLat; delete form.dataset.selectedLon; delete bidProfiles['kneaders-orem'].overrides.overview.locationType; }, 0); });
  syncType();
}
function openNewProposalSetup() {
  let modal = $('#newProposalSetup');
  if (!modal) {
    modal = document.createElement('div'); modal.id = 'newProposalSetup'; modal.className = 'new-proposal-modal'; modal.innerHTML = `<form class="new-proposal-card" novalidate><div class="new-proposal-head"><div><div class="home-kicker">NEW PROPOSAL</div><h2>Start with the property.</h2><p>Start with as much as you know. GetEV can prepare a working proposal even when some property details are still pending.</p></div><button type="button" class="close-edit" data-close-new-proposal aria-label="Close">×</button></div><div class="new-proposal-fields"><label>Location / customer name <input name="siteName" placeholder="e.g. Kneaders Bakery & Cafe"></label><label>Street address <input name="street" placeholder="e.g. 1960 N State Street"></label><div class="new-proposal-row"><label>City <input name="city" placeholder="Lehi"></label><label>State <input name="stateCode" maxlength="2" placeholder="UT"></label><label>ZIP code <input name="zip" inputmode="numeric" placeholder="84043"></label></div><label>Proposal date <input name="proposalDate" type="date"></label><fieldset><legend>Project scope</legend><label class="new-proposal-check"><input name="ev" type="checkbox" checked><span>EV charging</span><small>Charging demand, site context, and guest-revenue opportunity</small></label><label class="new-proposal-check"><input name="solar" type="checkbox"><span>Solar</span><small>Solar production, utility savings, and payback</small></label><label class="new-proposal-check"><input name="storage" type="checkbox"><span>Battery storage</span><small>Peak management, resilience, and bill control</small></label></fieldset></div><p class="new-proposal-note">You can refine assumptions, images, maps, and configuration after the proposal opens.</p><div class="new-proposal-actions"><button type="button" class="secondary-button" data-close-new-proposal>Cancel</button><button type="submit" class="primary-button">Prepare proposal</button></div></form>`; document.body.appendChild(modal);
    modal.querySelectorAll('[data-close-new-proposal]').forEach(button => button.addEventListener('click', () => { modal.hidden = true; }));
    modal.addEventListener('click', event => { if (event.target === modal) modal.hidden = true; });
     modal.querySelector('form').addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const city = String(data.get('city')).trim() || 'Lehi'; const stateCode = String(data.get('stateCode')).trim().toUpperCase() || 'UT'; const street = String(data.get('street')).trim() || 'Address to be confirmed'; const zip = String(data.get('zip')).trim() || '84043'; const siteName = String(data.get('siteName')).trim() || `Proposed EV charging site in ${city}`; const location = [street, city, stateCode, zip].join(', '); const templateBidId = 'kneaders-orem'; const selectedScopes = { ev: data.get('ev') === 'on', solar: data.get('solar') === 'on', storage: data.get('storage') === 'on' }; const scopes = Object.values(selectedScopes).some(Boolean) ? selectedScopes : { ev: true, solar: false, storage: false }; const locationType = String(data.get('locationType') || '').trim(); const otherType = String(data.get('locationTypeOther') || '').trim(); const newProposalState = Object.fromEntries(Object.entries(defaults).map(([section, values]) => [section, { ...values }])); newProposalState.overview = { ...newProposalState.overview, siteName, proposalName: `${siteName} ${city}, ${stateCode}`, location, city, stateCode, locationType: locationType === 'Other' ? (otherType || 'Commercial business') : (locationType || inferNewProposalLocationType(siteName)), proposalDate: String(data.get('proposalDate')) || new Date().toISOString().slice(0, 10), status: 'Draft' }; newProposalState.site.latitude = Number(form.dataset.selectedLat) || 40.391617; newProposalState.site.longitude = Number(form.dataset.selectedLon) || -111.849055; newProposalState.ev = { ...newProposalState.ev, locationDataStatus: 'pending', trafficSource: 'Location lookup pending', trafficSourceRecordId: '', trafficRoadName: '', dailyTraffic: 0, travelRouteDistance: 0, marketProofVisitsPerDay: 0, marketProofPorts: 0, marketProofSessions3m: 0, observedCharges3m: 0, sourceWindow: 'Location-specific data pending' }; newProposalState.brand = { ...state.brand }; newProposalState.overview.sitePhoto = await readProposalImage(form.elements.sitePhoto?.files?.[0]); newProposalState.overview.siteLogo = await readProposalImage(form.elements.siteLogo?.files?.[0]); const proposalUrl = new URL(window.location.href); proposalUrl.hash = ''; proposalUrl.search = ''; proposalUrl.searchParams.set('bid', templateBidId); proposalUrl.searchParams.set('copy', encodeCopyPayload({ version: 1, copyId: `proposal-${Date.now()}`, bidId: templateBidId, scopes, inlineEdits: {}, state: newProposalState })); window.location.assign(proposalUrl.toString()); });
  }
  enhanceNewProposalModal(); const form = modal.querySelector('form');
  if (!form.querySelector('[name="sitePhoto"]')) {
    const media = document.createElement('div'); media.className = 'new-proposal-row new-proposal-media-row';
    media.innerHTML = '<label>Site photo <span class="optional">optional</span><input name="sitePhoto" type="file" accept="image/png,image/jpeg,image/webp"></label><label>Site logo <span class="optional">optional</span><input name="siteLogo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>';
    form.querySelector('.new-proposal-fields')?.insertBefore(media, form.querySelector('fieldset'));
    media.querySelectorAll('input[type="file"]').forEach(input => input.addEventListener('change', () => { const file = input.files?.[0]; const kind = input.name === 'sitePhoto' ? 'photo' : 'logo'; if (file && file.type.startsWith('image/')) handleProposalVisualUpload(file, kind); }));
  }
  form.reset(); form.ev.checked = true; form.proposalDate.value = new Date().toISOString().slice(0, 10); modal.hidden = false; form.siteName.focus();
}
$('#newBidButton')?.addEventListener('click', openNewProposalSetup);
window.addEventListener('getev:bulk-proposals', event => { const businesses = event.detail?.businesses || []; const copies = readLocalBids(); businesses.filter(business => { const address = business.address || {}; return address.house_number && address.road && (address.city || address.town || address.village) && (address.state_code || address.state) && address.postcode; }).slice(0, 10).forEach((business, index) => { const address = business.address || {}; const name = business.namedetails?.name || business.name || `Business prospect ${index + 1}`; const city = address.city || address.town || address.village || address.municipality || 'Local market'; const stateCode = locationStateCode(address, city) || 'UT'; const street = [address.house_number, address.road].filter(Boolean).join(' ') || 'Address to be confirmed'; const zip = address.postcode || '84043'; const id = `bulk-${Date.now()}-${index}`; copies[id] = { label: name, locationLabel: `${street}, ${city}, ${stateCode} ${zip}`, sourceBidId: 'kneaders-orem', overrides: { overview: { siteName: name, proposalName: `${name} ${city}, ${stateCode}`, location: `${street}, ${city}, ${stateCode} ${zip}`, city, stateCode, status: 'Draft', locationType: inferNewProposalLocationType(name) }, site: { latitude: Number(business.lat) || 40.391617, longitude: Number(business.lon) || -111.849055 } }, scopes: { ev: true, solar: false, storage: false } }; }); localStorage.setItem(localBidStorageKey, JSON.stringify(copies)); Object.assign(bidProfiles, copies); window.dispatchEvent(new CustomEvent('getev:bulk-proposals-save', { detail: { proposals: copies } })); renderDashboardCardsFromJson(); toast(`${businesses.length} proposal${businesses.length === 1 ? '' : 's'} added to your dashboard.`); });
window.addEventListener('getev:bulk-proposals-loaded', event => { const proposals = event.detail?.proposals || {}; if (!Object.keys(proposals).length) return; const copies = { ...readLocalBids(), ...proposals }; localStorage.setItem(localBidStorageKey, JSON.stringify(copies)); Object.assign(bidProfiles, proposals); if (document.body.classList.contains('home-mode')) renderDashboardCardsFromJson(); });
const copyText = async value => { try { await navigator.clipboard.writeText(value); } catch { const fallback = document.createElement('textarea'); fallback.value = value; document.body.appendChild(fallback); fallback.select(); document.execCommand('copy'); fallback.remove(); } };
const encodeCopyPayload = payload => { const bytes = new TextEncoder().encode(JSON.stringify(payload)); let binary = ''; bytes.forEach(byte => { binary += String.fromCharCode(byte); }); return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
$('#copyProposalButton')?.addEventListener('click', async () => { if (!activeBidId) return; const proposalUrl = new URL(window.location.href); proposalUrl.hash = ''; proposalUrl.searchParams.set('bid', activeBidId); proposalUrl.searchParams.set('copy', encodeCopyPayload({ version: 1, copyId: `copy-${Date.now()}`, bidId: activeBidId, scopes: currentScopes(), inlineEdits, state })); await copyText(proposalUrl.toString()); toast('Editable proposal copy link copied. The recipient can open it and make their own changes.'); });
const definitionsStorageKey = `GetEV-definitions:${activeBidId || 'kneaders-orem'}:${copiedProposal ? (copiedProposal.copyId || 'copy') : 'base'}`;
const definitionSections = [{ key: 'locationMetrics', label: 'Location overviewmetric cards' }, { key: 'siteSnapshotMockup.scenarios', label: 'Site snapshotscenario cards' }, { key: 'siteSnapshotMockup.fit.items', label: 'Site snapshotfit cards' }, { key: 'spendingCases', label: 'Revenue from additional guestsspend cards' }, { key: 'financialCards.chargingRevenue', label: 'EV charging revenuemetric cards' }, { key: 'financialCards.expenses', label: 'Expensesmetric cards' }, { key: 'referencePages.about.cards', label: 'About 1Solarproof cards' }, { key: 'portfolioMetrics.storeBreakdown', label: 'Portfoliostore economics' }, { key: 'portfolioMetrics.scorecard', label: 'Portfoliosite scorecard' }, { key: 'portfolioMetrics.utilization', label: 'Portfolioutilization model' }, { key: 'portfolioMetrics.financing', label: 'Portfoliofinancing' }, { key: 'portfolioMetrics.lease', label: 'Portfoliolease capacity' }, { key: 'portfolioMetrics.fieldGuide', label: 'Portfoliofield guide' }, { key: 'portfolioMetrics.fields', label: 'Portfoliosupporting fields' }];
const definitionSources = { '#': ['NLR / AFDC charger inventory', 'UDOT AADT roadway counts', 'Overture Maps Places', 'OpenStreetMap / Overpass'], '$': ['Rocky Mountain Power tariff', 'Official Kneaders menu', 'Kneaders POS data — not connected', 'Project/vendor documents — not connected'], '%': ['Utah State Tax Commission EV registrations', 'Paren performance data — access requested', 'OCPI network status — access required', 'UDOT AADT roadway counts'] };
const definitionSectionLabel = key => ({ 'locationMetrics': 'Location overview', 'siteSnapshotMockup.scenarios': 'Site snapshot', 'siteSnapshotMockup.fit.items': 'Site snapshot', 'spendingCases': 'Revenue from additional guests', 'financialCards.chargingRevenue': 'Revenue from additional guests', 'financialCards.expenses': 'Revenue from additional guests', 'visitorRevenueMockup': 'Revenue from additional guests', 'referencePages.about.cards': 'About 1Solar', 'referencePages.partnership': 'Partnership opportunities', 'referencePages.optionOne': 'Option 1 – 1Solar-owned', 'referencePages.daily': 'Option 2 – Daily charging outlook', 'referencePages.annual': 'Option 2 – Annualized income', 'referencePages.roi': 'Combined ROI outlook', 'portfolioMetrics.storeBreakdown': 'Portfoliostore economics', 'portfolioMetrics.scorecard': 'Portfoliosite scorecard', 'portfolioMetrics.utilization': 'Portfolioutilization model', 'portfolioMetrics.financing': 'Portfoliofinancing', 'portfolioMetrics.lease': 'Portfoliolease capacity', 'portfolioMetrics.fieldGuide': 'Portfoliofield guide', 'portfolioMetrics.fields': 'Portfoliosupporting fields' }[key] || key);
function definitionPath(root, path) { return path.split('.').reduce((value, key) => value?.[key], root); }
function setDefinitionPath(root, path, value) { const parts = path.split('.'); const last = parts.pop(); const target = parts.reduce((item, key) => item[key] ||= {}, root); target[last] = value; }
function definitionRecords() {
  if (!proposalCardCatalog?.ev) return [];
  return definitionSections.flatMap(section => { const raw = definitionPath(proposalCardCatalog.ev, section.key); const cards = Array.isArray(raw) ? raw : raw ? [raw] : []; return cards.map((rawCard, index) => { const tuple = Array.isArray(rawCard); const card = tuple ? { key: `${section.key}-${index}`, label: rawCard[1], value: rawCard[0], description: rawCard[2], source: rawCard[3] || 'Company profile', derivedFrom: rawCard[4] || 'Company credentials and approved company profile', dependentVariable: rawCard[5] || `${section.key}-${index}` } : { ...rawCard }; if (section.key === 'spendingCases') { const scenario = guestSalesCases().find(item => item.key === card.key); if (scenario) Object.assign(card, { label: scenario.label, value: money(scenario.spend), description: `${scenario.capture}% guest capture × ${money(scenario.spend)} per purchasing party`, source: 'Conservative assumption - no 3rd party data source available', derivedFrom: 'Daily charging visits × guest capture, rounded to daily parties × average party spend; month = 30.42 days; year = operating days', example: `${number(calc.evForecastVisits(5), 2)} visits × ${scenario.capture}% ≈ ${scenario.parties} parties × ${money(scenario.spend)} = ${money(scenario.daily)}/day`, benefit: 'Shows how capture and spending uncertainty affect potential gross sales.' }); } return { section: section.key, sectionLabel: section.label, index, tuple, object: !Array.isArray(raw), card, id: `${section.key}:${card.key || index}` }; }); });
}
function isSupplementalDefinition(record) { return String(record?.section || '').startsWith('portfolioMetrics.'); }
function definitionCardForTarget(record, targetSection) {
  const source = JSON.parse(JSON.stringify(record.card || {}));
  const label = organizationAgnosticMetricText(source.label || source.title || 'Untitled metric');
  const description = source.description || source.subtitle || source.note || 'Predefined proposal metric';
  const sourceName = organizationAgnosticMetricText(source.source || source.resources || 'Proposal definition');
  const independent = source.independentVariables || source.derivedFrom || 'Fixed proposal inputs';
  const dependent = source.dependentVariable || source.valueId || source.receiptId || source.key || 'Fixed proposal output';
  if (targetSection === 'locationMetrics') return { key: `${record.section}-${record.index}-${Date.now()}`, label, valueId: source.valueId || dependent, value: source.value || '—', description, source: sourceName, derivedFrom: independent, dependentVariable: dependent, scale: source.scale, action: source.action, active: source.active };
  if (targetSection === 'spendingCases') return { key: `${record.section}-${record.index}-${Date.now()}`, label, receiptId: source.receiptId || dependent, dailyId: source.dailyId || `${record.section}-${record.index}-daily`, monthlyId: source.monthlyId || `${record.section}-${record.index}-monthly`, annualId: source.annualId || `${record.section}-${record.index}-annual`, value: source.value || '—', daily: source.daily || '—', monthly: source.monthly || '—', annual: source.annual || '—', description, source: sourceName, resources: source.resources || independent };
  if (targetSection === 'financialCards.chargingRevenue' || targetSection === 'financialCards.expenses') return { key: `${record.section}-${record.index}-${Date.now()}`, label, valueId: source.valueId || dependent, value: source.value || '—', description, source: sourceName, derivedFrom: independent, dependentVariable: dependent };
  if (targetSection === 'siteSnapshotMockup.scenarios') return { key: `${record.section}-${record.index}-${Date.now()}`, label, visits: source.visits || source.value || '—', utilization: source.utilization || '—', parties: source.parties || '—', note: description, source: sourceName, accent: source.accent || 'blue', active: Boolean(source.active) };
  if (targetSection === 'siteSnapshotMockup.fit.items') return { label, value: source.value || '—', note: description, source: sourceName, accent: source.accent || 'blue' };
  if (targetSection === 'referencePages.about.cards') return [source.value || source.label || '—', label, description];
  return source;
}
function definitionAddOptions(records, targetSection) {
  return definitionSections.map(section => { const options = records.filter(record => !(record.section === targetSection && definitionIsEnabled(record.section, record.index))).map(record => `<option value="${esc(`${record.section}::${record.index}`)}">${esc(record.card.label || record.card.title || 'Untitled metric')}</option>`).join(''); return options ? `<optgroup label="${esc(definitionSectionLabel(section.key))}">${options}</optgroup>` : ''; }).join('');
}
function definitionExample(record) {
  const card = record.card; if (card.example) return card.example;
  const label = String(card.label || card.title || '').toLowerCase();
  if (label.includes('port')) return 'Example: 8 ports × 20% utilization → about 92 visits/day.';
  if (label.includes('utilization')) return 'Example: 20% expected utilization, with 15% and 25% downside/upside cases.';
  if (label.includes('visit')) return 'Example: 92 visits/day × 365 days → 33,580 visits/year.';
  if (label.includes('cost')) return 'Example: $500,000 gross project cost − $127,000 incentives → $373,000 net cost.';
  if (label.includes('revenue') || label.includes('value') || label.includes('income')) return 'Example: 92 visits/day × $25 average ticket × 30% capture → $251,850/year.';
  if (label.includes('score')) return 'Example: 70 roadway + 80 EV adoption, weighted with the other site-fit inputs.';
  if (label.includes('payback') || label.includes('return')) return 'Example: $373,000 net cost ÷ $124,100 annual value → about 3.0 years.';
  return 'Example: 8 proposed ports, 20% utilization, and a $25 average guest ticket.';
}
function definitionPreviewLiveCard(record) {
  const key = String(record.card?.key || '');
  if (!key) return null;
  return $$('[data-card-key]').find(node => node.dataset.cardKey === key) || null;
}
function definitionViewPreview(record) {
  const card = record.card || {};
  const label = organizationAgnosticMetricText(card.label || card.title || 'Untitled metric');
  const liveCard = definitionPreviewLiveCard(record);
  const liveValue = liveCard?.querySelector('strong')?.textContent?.trim();
  const liveDetail = liveCard?.querySelector('em,p')?.textContent?.trim();
  const value = liveValue || card.value || card.visits || card.utilization || card.parties || 'Example';
  const detail = organizationAgnosticMetricText(liveDetail || card.description || card.subtitle || card.note || definitionExample(record));
  const scale = card.scale ? `<div class="definition-preview-scale"><i></i><i></i><i></i></div><small><span>${esc(card.scale.low || '')}</span><span>${esc(card.scale.typical || '')}</span><b>${esc(card.scale.high || '')}</b></small>` : `<small>${esc(definitionExample(record))}</small>`;
  return `<div class="definition-view-preview" aria-label="View Only card preview"><div><span>${esc(label)}</span>${card.action ? `<b>${esc(card.action)}</b>` : ''}</div><strong>${esc(value)}</strong><em>${esc(detail)}</em>${scale}</div>`;
}
const organizationAgnosticMetricText = value => String(value ?? '').replace(/7[-–]Eleven/gi, 'Portfolio');
const conservativeAssumptionSource = 'Conservative assumption - no 3rd party data source available';
const definitionSourceText = card => { const source = card?.source || card?.resources; if (!source || /^(proposal definition|company profile|manual input)$/i.test(String(source).trim())) return conservativeAssumptionSource; return organizationAgnosticMetricText(source); };
function definitionSuggestionMenu(input) {
  document.querySelector('.definition-suggestions')?.remove();
  const symbol = ['#', '$', '%'].find(item => input.value.includes(item)); if (!symbol) return;
  const menu = document.createElement('div'); menu.className = 'definition-suggestions';
  menu.innerHTML = definitionSources[symbol].map(value => `<button type="button">${esc(value)}</button>`).join('');
  input.parentElement.appendChild(menu);
  menu.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { const start = input.selectionStart ?? input.value.length; input.value = `${input.value.slice(0, start)}${button.textContent}${input.value.slice(start)}`; menu.remove(); input.dispatchEvent(new Event('input', { bubbles: true })); input.focus(); }));
}
function definitionMarkup(record) {
  const card = record.card; const source = definitionSourceText(card); const independent = card.independentVariables || card.derivedFrom || 'Configured proposal inputs'; const dependent = card.dependentVariable || card.valueId || card.receiptId || card.key || 'proposal output'; const description = card.description || card.footnote || card.note || 'Current proposal definition';
  return `<article class="definition-card" data-definition-section="${esc(record.section)}" data-definition-index="${record.index}" data-definition-tuple="${record.tuple ? 'true' : 'false'}" data-definition-object="${record.object ? 'true' : 'false'}"><div class="definition-card-head"><div><div class="definition-kind">${esc(record.sectionLabel)}</div><h3>${esc(card.label || card.title || 'Untitled card')}</h3></div><button class="definition-remove" type="button" data-definition-remove>Remove</button></div><label class="definition-field">Section<select data-definition-section-select>${definitionSections.map(section => `<option value="${esc(section.key)}" ${section.key === record.section ? 'selected' : ''}>${esc(definitionSectionLabel(section.key))}</option>`).join('')}</select></label><label class="definition-field">Card label<input data-definition-field="label" value="${esc(card.label || card.title || '')}"></label><label class="definition-field">Independent variables<textarea data-definition-field="independentVariables" placeholder="e.g. # nearby ports × % utilization">${esc(independent)}</textarea></label><label class="definition-field">Dependent variable<input data-definition-field="dependentVariable" value="${esc(dependent)}"></label><label class="definition-field">Data source<input data-definition-field="source" value="${esc(source)}"></label><label class="definition-field">Description<textarea data-definition-field="description">${esc(description || card.subtitle || '')}</textarea></label><button class="definition-save" type="button" data-definition-save>Save card</button></article>`;
}
function definitionPickerMarkup(record) {
  const card = record.card; const label = organizationAgnosticMetricText(card.label || card.title || 'Untitled metric'); const detail = organizationAgnosticMetricText(card.description || card.subtitle || card.note || 'Predefined proposal metric'); const source = definitionSourceText(card); const independent = organizationAgnosticMetricText(card.independentVariables || card.derivedFrom || 'Fixed proposal inputs'); const dependent = organizationAgnosticMetricText(card.dependentVariable || card.valueId || card.receiptId || card.key || 'Fixed proposal output'); const hidden = !definitionIsEnabled(record.section, record.index); const benefit = organizationAgnosticMetricText(card.benefit || card.valueHint || 'Helps the sales team explain the opportunity with a consistent, decision-ready measure.');
  return `<article class="definition-picker${hidden ? ' is-hidden' : ''}" data-definition-section="${esc(record.section)}" data-definition-index="${record.index}" data-definition-search="${esc(`${label} ${detail} ${source} ${independent} ${dependent} ${benefit}`.toLowerCase())}"><div class="definition-picker-copy"><b>${esc(label)}</b><small>${esc(detail)}</small><em>Calculated from ${esc(independent)} → ${esc(dependent)}</em><em>Why it matters: ${esc(benefit)}</em><em>${esc(definitionExample(record))}</em><em>Source: ${esc(source)}</em></div>${definitionViewPreview(record)}<button type="button" class="definition-card-action" data-definition-remove>${hidden ? 'Add' : 'Remove'}</button></article>`;
}
function blankMetricForSection(section, key) {
  const base = { key, label: 'Metric name', value: 'Add value', description: 'Customize this card in Edit Mode, just like any other card.', source: 'User-defined metric', derivedFrom: 'Add the inputs or assumptions that drive this metric.', dependentVariable: key };
  if (section === 'siteSnapshotMockup.scenarios') return { ...base, label: 'Scenario name', visits: 'Add visits/day', utilization: 'Add utilization', parties: 'Add parties/day', note: base.description };
  if (section === 'siteSnapshotMockup.fit.items') return { label: 'Fit factor', value: 'Add value', note: base.description, source: base.source };
  if (section === 'spendingCases') return { ...base, label: 'Spend case', receiptId: `${key}Receipt`, dailyId: `${key}Daily`, monthlyId: `${key}Monthly`, annualId: `${key}Annual`, daily: 'Add daily value', monthly: 'Add monthly value', annual: 'Add annual value', resources: base.derivedFrom };
  if (section === 'referencePages.about.cards') return ['Add metric value', 'Metric name', base.description];
  if (section.startsWith('financialCards.')) return { ...base, valueId: `${key}Value` };
  return { ...base, valueId: `${key}Value` };
}
function definitionDisplayGroups(records) {
  const groups = new Map();
  definitionSections.forEach(section => { const key = definitionSectionLabel(section.key); if (!groups.has(key)) groups.set(key, { key: section.key, label: key, records: [] }); groups.get(key).records.push(...records.filter(record => record.section === section.key)); });
  return [...groups.values()];
}
function openDefinitionMetricModal(targetSection) {
  const records = definitionRecords().filter(isSupplementalDefinition); let modal = $('#definitionMetricModal');
  if (!modal) { modal = document.createElement('div'); modal.id = 'definitionMetricModal'; modal.className = 'definition-metric-modal'; document.body.appendChild(modal); }
  const groups = definitionSections.map(section => { const items = records.filter(record => record.section === section.key); if (!items.length) return ''; return `<section><h3>${esc(definitionSectionLabel(section.key))}</h3><div class="definition-modal-items">${items.map(record => { const selected = targetSection ? record.section === targetSection && definitionIsEnabled(record.section, record.index) : definitionIsEnabled(record.section, record.index); return `<button type="button" ${selected ? 'disabled' : ''} class="${selected ? 'is-selected' : ''}" data-definition-choice="${esc(`${record.section}::${record.index}`)}"><b>${esc(organizationAgnosticMetricText(record.card.label || record.card.title || 'Untitled metric'))}${selected ? 'already added' : ''}</b><small>${esc(organizationAgnosticMetricText(record.card.description || record.card.subtitle || record.card.note || 'Predefined proposal metric'))}</small><em>${esc(definitionExample(record))}</em><em>Source: ${esc(definitionSourceText(record.card))}</em></button>`; }).join('')}</div></section>`; }).join('');
  modal.innerHTML = `<div class="definition-metric-modal-card" role="dialog" aria-modal="true" aria-labelledby="definitionMetricModalTitle"><div class="definition-metric-modal-head"><div><div class="definition-kind">SUPPLEMENTAL METRICS</div><h2 id="definitionMetricModalTitle">Choose a supplemental metric${targetSection ? ` for ${esc(definitionSectionLabel(targetSection))}` : ''}</h2><p>Default report metrics stay out of this menu. Search the supplemental catalog, review the example, or start with a blank card. Blank cards can be customized in Edit Mode, just like any other card.</p></div><button type="button" class="close-edit" data-definition-modal-close aria-label="Close">×</button></div><input class="definition-modal-search" type="search" placeholder="Search supplemental metrics" aria-label="Search supplemental metrics"><button type="button" class="definition-blank-metric" data-definition-blank>Add blank metric card</button><div class="definition-modal-list">${groups || '<p>No supplemental metrics are available.</p>'}</div></div>`;
  modal.hidden = false; const search = modal.querySelector('.definition-modal-search');
  search.addEventListener('input', () => { const query = search.value.trim().toLowerCase(); modal.querySelectorAll('[data-definition-choice]').forEach(button => { button.hidden = Boolean(query) && !button.textContent.toLowerCase().includes(query); }); });
  modal.querySelectorAll('[data-definition-choice]').forEach(button => button.addEventListener('click', () => { const [sourceSection, sourceIndex] = button.dataset.definitionChoice.split('::'); const sourceRecord = records.find(record => record.section === sourceSection && String(record.index) === sourceIndex); if (!sourceRecord) return; const effectiveTargetSection = targetSection || sourceSection; const target = definitionPath(proposalCardCatalog.ev, effectiveTargetSection); const targetCards = Array.isArray(target) ? target : []; if (sourceSection === effectiveTargetSection) { proposalCardCatalog.ev._hiddenDefinitionCards ||= {}; delete proposalCardCatalog.ev._hiddenDefinitionCards[`${sourceSection}:${sourceIndex}`]; } else { targetCards.push(definitionCardForTarget(sourceRecord, effectiveTargetSection)); setDefinitionPath(proposalCardCatalog.ev, effectiveTargetSection, targetCards); } persistDefinitions(); modal.hidden = true; renderReport(); renderDefinitionsView(); }));
  modal.querySelector('[data-definition-blank]').addEventListener('click', () => { const section = targetSection || 'locationMetrics'; const key = `blank-${Date.now()}`; const current = definitionPath(proposalCardCatalog.ev, section); const cards = Array.isArray(current) ? current : (current ? [current] : []); cards.push(blankMetricForSection(section, key)); setDefinitionPath(proposalCardCatalog.ev, section, cards); persistDefinitions(); modal.hidden = true; renderReport(); renderDefinitionsView(); toast('Blank metric added. Customize it in Edit Mode.'); });
  modal.querySelector('[data-definition-modal-close]').addEventListener('click', () => { modal.hidden = true; }); modal.addEventListener('click', event => { if (event.target === modal) modal.hidden = true; }, { once: true }); search.focus();
}
function normalizeDefinitionTargets() {
  if (!proposalCardCatalog?.ev) return;
  definitionSections.forEach(section => { const value = definitionPath(proposalCardCatalog.ev, section.key); if (value && !Array.isArray(value) && typeof value === 'object') Object.defineProperty(value, '0', { value, configurable: true, writable: true }); });
}
document.addEventListener('click', event => { const button = event.target.closest('[data-definition-save]'); if (!button) return; const card = button.closest('.definition-card'); if (!card || card.dataset.definitionTuple !== 'true') return; const values = Object.fromEntries([...card.querySelectorAll('[data-definition-field]')].map(input => [input.dataset.definitionField, input.value.trim()])); const cards = definitionPath(proposalCardCatalog.ev, card.dataset.definitionSection); const target = cards?.[Number(card.dataset.definitionIndex)]; if (Array.isArray(target)) { target[3] = values.source; target[4] = values.independentVariables; target[5] = values.dependentVariable; } }, true);
// Inline Definitions controls own card movement, including object-backed section records.
document.addEventListener('change', event => { const select = event.target.closest('[data-definition-section-select]'); if (!select || select.value !== 'referencePages.about.cards') return; const card = select.closest('.definition-card'); const from = card?.dataset.definitionSection; const index = Number(card?.dataset.definitionIndex); const source = definitionPath(proposalCardCatalog.ev, from); const target = definitionPath(proposalCardCatalog.ev, select.value); if (!Array.isArray(source) || !Array.isArray(target)) return; const raw = source[index]; const moved = Array.isArray(raw) ? raw : [raw.value || raw.label || '—', raw.label || 'Company profile', raw.description || 'Current company profile definition', raw.source || 'Company profile', raw.derivedFrom || 'Company credentials and approved company profile', raw.dependentVariable || raw.key || `about-${Date.now()}`]; source.splice(index, 1); target.push(moved); persistDefinitions(); event.preventDefault(); event.stopImmediatePropagation(); renderReport(); renderDefinitionsView(); toast('Card moved to its new section.'); }, true);
function renderDefinitionsView() {
  const grid = $('#definitionsGrid'); if (!grid || !proposalCardCatalog?.ev) return;
  normalizeDefinitionTargets();
  grid.previousElementSibling?.classList.contains('definitions-search') && grid.previousElementSibling.remove();
  const records = definitionRecords(); const displayGroups = definitionDisplayGroups(records);
  const anchor = key => `definition-group-${key.replace(/[^a-z0-9]+/gi, '-')}`;
  grid.innerHTML = displayGroups.map(group => `<section class="definitions-group" data-definition-group="${esc(group.key)}" id="${anchor(group.key)}"><div class="definitions-group-head"><div><h2>${esc(group.label)}</h2></div><div class="definitions-group-tools"><button type="button" class="secondary-button definition-add-toggle" data-definition-add-toggle aria-label="Add metric">+</button></div></div><div class="definitions-group-grid">${group.records.map(definitionPickerMarkup).join('')}</div></section>`).join('') || '<p>No predefined proposal metrics are available yet.</p>';
  const search = document.createElement('input');
  search.type = 'search'; search.className = 'definitions-search'; search.placeholder = 'Search predefined metrics'; search.setAttribute('aria-label', 'Search predefined metrics');
  grid.before(search);
  search.addEventListener('input', () => { const query = search.value.trim().toLowerCase(); grid.querySelectorAll('.definition-picker').forEach(card => { card.hidden = Boolean(query) && !card.dataset.definitionSearch.includes(query); }); });
  grid.querySelectorAll('[data-definition-add-toggle]').forEach(button => button.addEventListener('click', () => openDefinitionMetricModal(button.closest('[data-definition-group]')?.dataset.definitionGroup)));
  grid.querySelectorAll('[data-definition-remove]').forEach(button => button.addEventListener('click', () => { const card = button.closest('.definition-picker'); const key = `${card.dataset.definitionSection}:${card.dataset.definitionIndex}`; proposalCardCatalog.ev._hiddenDefinitionCards ||= {}; if (button.textContent.trim() === 'Add') delete proposalCardCatalog.ev._hiddenDefinitionCards[key]; else proposalCardCatalog.ev._hiddenDefinitionCards[key] = true; persistDefinitions(); renderReport(); renderDefinitionsView(); }));
  grid.querySelectorAll('[data-definition-section-select]').forEach(select => select.addEventListener('change', () => {
    const card = select.closest('.definition-card'); const from = card.dataset.definitionSection; const index = Number(card.dataset.definitionIndex); const targetSection = select.value; if (from === targetSection) return;
    const sourceValue = definitionPath(proposalCardCatalog.ev, from); const sourceCards = Array.isArray(sourceValue) ? sourceValue : [sourceValue]; const rawMoved = sourceCards.splice(index, 1)[0];
    if (Array.isArray(sourceValue)) setDefinitionPath(proposalCardCatalog.ev, from, sourceCards); else setDefinitionPath(proposalCardCatalog.ev, from, null);
    const moved = Array.isArray(rawMoved) ? { key: `moved-${Date.now()}`, label: rawMoved[1], value: rawMoved[0], description: rawMoved[2], source: rawMoved[3] || 'Company profile', derivedFrom: rawMoved[4] || 'Company credentials and approved company profile', dependentVariable: rawMoved[5] || `moved-${Date.now()}` } : { ...rawMoved, key: rawMoved?.key || `moved-${Date.now()}` };
    if (!moved.value) moved.value = moved.dependentVariable || '—';
    if (targetSection === 'locationMetrics' && !moved.valueId) moved.valueId = moved.dependentVariable || moved.key; if (targetSection === 'spendingCases' && !moved.receiptId) moved.receiptId = moved.dependentVariable || `${moved.key}Receipt`;
    const targetValue = definitionPath(proposalCardCatalog.ev, targetSection); const targetCards = Array.isArray(targetValue) ? targetValue : (targetValue ? [targetValue] : []); targetCards.push(moved); setDefinitionPath(proposalCardCatalog.ev, targetSection, targetCards);
    persistDefinitions(); renderReport(); renderDefinitionsView(); toast('Card moved to its new section.');
  }));
 grid.querySelectorAll('[data-definition-remove]').forEach(button => button.addEventListener('click', () => { const card = button.closest('.definition-card'); const section = card.dataset.definitionSection; const value = definitionPath(proposalCardCatalog.ev, section); if (Array.isArray(value)) value.splice(Number(card.dataset.definitionIndex), 1); else setDefinitionPath(proposalCardCatalog.ev, section, null); persistDefinitions(); renderReport(); renderDefinitionsView(); }));
 grid.querySelectorAll('[data-definition-add-section]').forEach(button => button.addEventListener('click', () => { const section = button.dataset.definitionAddSection; const key = `custom-${Date.now()}`; const card = { key, label: 'NEW METRIC', value: '—', description: 'Current proposal definition', source: 'Manual input', derivedFrom: 'Configured proposal inputs', dependentVariable: key }; const current = definitionPath(proposalCardCatalog.ev, section); const cards = Array.isArray(current) ? current : (current ? [current] : []); cards.push(card); setDefinitionPath(proposalCardCatalog.ev, section, cards); persistDefinitions(); renderReport(); renderDefinitionsView(); toast(`New card added to ${definitionSectionLabel(section)}.`); }));
grid.querySelectorAll('[data-definition-save]').forEach(button => button.addEventListener('click', () => { const card = button.closest('.definition-card'); const target = definitionPath(proposalCardCatalog.ev, card.dataset.definitionSection)[Number(card.dataset.definitionIndex)]; const values = Object.fromEntries([...card.querySelectorAll('[data-definition-field]')].map(input => [input.dataset.definitionField, input.value.trim()])); if (Object.values(values).some(value => !value)) { toast('Complete every definition field before saving.'); return; } if (Array.isArray(target)) { target[1] = values.label; target[2] = values.description; } else { if (target.title !== undefined) target.title = values.label; else target.label = values.label; target.derivedFrom = values.independentVariables; target.dependentVariable = values.dependentVariable; if (target.valueId !== undefined) target.dependentVariable = values.dependentVariable; else if (target.receiptId !== undefined) target.dependentVariable = values.dependentVariable; else if (target.value !== undefined) target.value = values.dependentVariable; target.source = values.source; if (target.subtitle !== undefined) target.subtitle = values.description; else target.description = values.description; if (target.note !== undefined) target.note = values.description; } persistDefinitions(); renderReport(); renderDefinitionsView(); saveState(); toast('Definition saved.'); }));
}
function persistDefinitions() { localStorage.setItem(definitionsStorageKey, JSON.stringify({ ev: proposalCardCatalog.ev })); }
function definitionEntryHasContent(entry) { if (Array.isArray(entry)) return entry.some(value => String(value ?? '').trim()); if (!entry || typeof entry !== 'object') return false; return [entry.label, entry.title, entry.description, entry.subtitle, entry.note, entry.value, entry.valueId, entry.receiptId].some(value => String(value ?? '').trim()); }
function loadDefinitions() { try { const saved = JSON.parse(localStorage.getItem(definitionsStorageKey) || 'null'); if (!saved?.ev || !proposalCardCatalog?.ev) return; definitionSections.forEach(section => { const baseline = definitionPath(proposalCardCatalogDefaults.ev, section.key); const current = definitionPath(saved.ev, section.key); if (Array.isArray(baseline)) { if (!Array.isArray(current)) setDefinitionPath(saved.ev, section.key, JSON.parse(JSON.stringify(baseline))); else { current.forEach((entry, index) => { if (!definitionEntryHasContent(entry) && baseline[index]) current[index] = JSON.parse(JSON.stringify(baseline[index])); }); if (current.length > 0 && !current.some(definitionEntryHasContent)) setDefinitionPath(saved.ev, section.key, JSON.parse(JSON.stringify(baseline))); } } else if (baseline && typeof baseline === 'object' && (!current || !definitionEntryHasContent(current))) setDefinitionPath(saved.ev, section.key, JSON.parse(JSON.stringify(baseline))); }); proposalCardCatalog.ev = saved.ev; proposalCardCatalog.ev.guestSalesProfiles = proposalCardCatalogDefaults.ev.guestSalesProfiles; const currentRevenueCopy = proposalCardCatalogDefaults.ev.visitorRevenueMockup; if (currentRevenueCopy) proposalCardCatalog.ev.visitorRevenueMockup = JSON.parse(JSON.stringify(currentRevenueCopy)); } catch {} }
function resetDefinitions() { if (!proposalCardCatalogDefaults?.ev) return; proposalCardCatalog.ev = JSON.parse(JSON.stringify(proposalCardCatalogDefaults.ev)); localStorage.removeItem(definitionsStorageKey); renderReport(); renderDefinitionsView(); toast('Kneaders definitions restored.'); }
$('#resetDefinitions')?.addEventListener('click', resetDefinitions);
$('#presentationMenu')?.addEventListener('change', event => {
  const mode = event.target.value;
  if (mode !== 'print') { setPresentationMode(mode); return; }
  const previousMode = document.body.classList.contains('view-only') ? 'view' : 'edit';
  setPresentationMode('view');
  const restoreMode = () => { setPresentationMode(previousMode); window.removeEventListener('afterprint', restoreMode); };
  window.addEventListener('afterprint', restoreMode, { once: true });
  window.print();
});
setPresentationMode(document.body.classList.contains('view-only') ? 'view' : 'edit');

updateScopeUI();
if (activeBidId) { renderReport(); observeProposalSections(); if (isEvOnlyBid) renderEvOnlyOverview(); setText('.breadcrumb strong', activeBid.locationLabel); document.title = `GetEV — ${state.overview.siteName} Proposal`; } else { document.title = 'GetEV — Sales Workspace'; }
Promise.all([proposalCardsReady, udotAadtReady, utahEvRegistrationsReady, overturePlacesReady, osmOverpassReady, nlrStationsReady, carDealershipGapReady, apartmentGapReady, regionalDataReady, regionalTrafficReady, rockyMountainPowerRatesReady]).then(([, , , , , , , , , regionalTrafficRecord, rockyMountainPowerRates]) => {
  loadDefinitions();
  const trafficChanged = applyUdotAadtRecord();
  const registrationsChanged = applyUtahEvRegistrationRecord();
  const placesChanged = applyAmenityPlaceRecord();
  const nlrChanged = applyNlrStationsRecord();
  const regionalChanged = applyRegionalSourceContext();
  const regionalTrafficChanged = applyRegionalTrafficRecord(regionalTrafficRecord);
  const rockyMountainPowerChanged = applyRockyMountainPowerRates(rockyMountainPowerRates);
  renderDashboardCardsFromJson();
  if (activeBidId) { renderReport(); observeProposalSections(); }
  if (document.body.classList.contains('definitions-mode')) renderDefinitionsView();
  refreshRegionalSourceLabels();
  if (activeBidId && (trafficChanged || registrationsChanged || placesChanged || nlrChanged || regionalChanged || regionalTrafficChanged || rockyMountainPowerChanged)) { saveState(); renderReport(); refreshRegionalSourceLabels(); }
});
window.addEventListener('getev:company-branding', event => {
  if (!activeBidId || copiedProposal || !event.detail?.companyName) return;
  state.brand = { ...state.brand, ...event.detail };
  renderReport();
});
