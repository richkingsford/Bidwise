const NLR_NEAREST_ENDPOINT = 'https://developer.nlr.gov/api/alt-fuel-stations/v1/nearest.json';

const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const integerOrZero = value => Math.max(0, Math.round(numberOrNull(value) || 0));
const unique = values => [...new Set(values.filter(Boolean))];

const classifyCharging = ({ dcFastPorts, level2Ports, level1Ports, maxPowerKw }) => {
  if (dcFastPorts > 0 && maxPowerKw !== null && maxPowerKw >= 150) return 'high-capacity-dc-fast';
  if (dcFastPorts > 0) return 'dc-fast';
  if (level2Ports > 0) return 'level-2';
  if (level1Ports > 0) return 'level-1';
  return 'unknown';
};

const getPortCounts = station => {
  const units = Array.isArray(station.ev_charging_units) ? station.ev_charging_units : [];
  const unitCounts = units.reduce((result, unit) => {
    const count = integerOrZero(unit.port_count);
    const level = String(unit.charging_level || '').toLowerCase();
    if (level === 'dc_fast') result.dcFast += count;
    if (level === '2') result.level2 += count;
    if (level === '1') result.level1 += count;
    return result;
  }, { dcFast: 0, level2: 0, level1: 0 });
  return {
    dcFast: Math.max(integerOrZero(station.ev_dc_fast_num), unitCounts.dcFast),
    level2: Math.max(integerOrZero(station.ev_level2_evse_num), unitCounts.level2),
    level1: Math.max(integerOrZero(station.ev_level1_evse_num), unitCounts.level1),
  };
};

export const buildNlrNearestUrl = ({ latitude, longitude, apiKey, radius = 10, limit = 200 }) => {
  const query = new URLSearchParams({ api_key: apiKey, latitude: String(latitude), longitude: String(longitude), radius: String(Math.min(10, Math.max(0.1, Number(radius) || 10))), limit: String(Math.min(200, Math.max(1, Number(limit) || 200))), status: 'all', access: 'all', fuel_type: 'ELEC' });
  return `${NLR_NEAREST_ENDPOINT}?${query}`;
};

export const normalizeNlrStation = (station, retrievedAt) => {
  if (!station || station.id === undefined || station.latitude === undefined || station.longitude === undefined) return null;
  const counts = getPortCounts(station);
  const units = Array.isArray(station.ev_charging_units) ? station.ev_charging_units : [];
  const connectorTypes = unique([
    ...(Array.isArray(station.ev_connector_types) ? station.ev_connector_types : []),
    ...units.flatMap(unit => Object.keys(unit.connectors || {})),
  ]);
  const maxPowerKw = units.reduce((max, unit) => Math.max(max, ...Object.values(unit.connectors || {}).map(connector => numberOrNull(connector?.power_kw) || 0)), 0) || null;
  const stationUpdatedAt = station.updated_at || station.last_confirmed || null;
  return {
    source: 'NLR/AFDC', sourceRecordId: String(station.id), name: station.station_name || 'Unnamed charging station',
    address: [station.street_address, station.city, station.state, station.zip].filter(Boolean).join(', '), city: station.city || null, state: station.state || null, postalCode: station.zip || null,
    latitude: numberOrNull(station.latitude), longitude: numberOrNull(station.longitude), distanceMiles: numberOrNull(station.distance), network: station.ev_network || 'Non-networked', status: station.status_code || null, access: station.access_code || null,
    restrictedAccess: station.restricted_access === true, facilityType: station.facility_type || null, portCount: counts.dcFast + counts.level2 + counts.level1, dcFastPorts: counts.dcFast, level2Ports: counts.level2, level1Ports: counts.level1, maxPowerKw,
    chargingType: classifyCharging({ dcFastPorts: counts.dcFast, level2Ports: counts.level2, level1Ports: counts.level1, maxPowerKw }), utilization: null, utilizationStatus: 'not-provided-by-nlr', connectorTypes,
    pricing: station.ev_pricing || null, hours: station.access_days_time || null, stationUrl: station.ev_network_web || null, sourceUpdatedAt: stationUpdatedAt, retrievedAt,
  };
};

export const fetchNlrStations = async ({ latitude, longitude, apiKey, radius = 10, limit = 200 }, fetchImpl = globalThis.fetch) => {
  const retrievedAt = new Date().toISOString();
  const response = await fetchImpl(buildNlrNearestUrl({ latitude, longitude, apiKey, radius, limit }), { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`NLR request failed (${response.status})`);
  const payload = await response.json();
  const stations = (Array.isArray(payload?.fuel_stations) ? payload.fuel_stations : []).map(station => normalizeNlrStation(station, retrievedAt)).filter(Boolean);
  return { source: 'NLR/AFDC', retrievedAt, radiusMiles: 10, totalResults: numberOrNull(payload?.total_results), stations };
};
