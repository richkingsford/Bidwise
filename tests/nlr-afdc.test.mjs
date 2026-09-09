import assert from 'node:assert/strict';
import test from 'node:test';
import { buildNlrNearestUrl, fetchNlrStations, normalizeNlrResponse } from '../integrations/nlr-afdc.mjs';

const fixture = {
  total_results: 1,
  fuel_stations: [{
    id: 12345,
    station_name: 'Orem Tesla Supercharger',
    street_address: '1960 N State St',
    city: 'Orem',
    state: 'UT',
    zip: '84057',
    latitude: 40.2981,
    longitude: -111.6946,
    distance: 0.2,
    status_code: 'E',
    access_code: 'public',
    restricted_access: false,
    facility_type: 'RESTAURANT',
    ev_network: 'Tesla',
    ev_network_web: 'https://www.tesla.com/findus',
    ev_dc_fast_num: 8,
    ev_level2_evse_num: 0,
    ev_level1_evse_num: 0,
    ev_connector_types: ['TESLA', 'J1772COMBO'],
    ev_pricing: '$0.45/kWh',
    access_days_time: '24 hours daily',
    updated_at: '2026-08-19',
    ev_charging_units: [{ charging_level: 'dc_fast', port_count: 8, connectors: { TESLA: { power_kw: 250, port_count: 8 } } }],
  }],
};

test('builds a server-side nearest-stations request with safe filters', () => {
  const url = new URL(buildNlrNearestUrl({ latitude: 40.2981, longitude: -111.6946, apiKey: 'test-key' }));
  assert.equal(url.hostname, 'developer.nlr.gov');
  assert.equal(url.pathname, '/api/alt-fuel-stations/v1/nearest.json');
  assert.equal(url.searchParams.get('fuel_type'), 'ELEC');
  assert.equal(url.searchParams.get('status'), 'all');
  assert.equal(url.searchParams.get('access'), 'all');
  assert.equal(url.searchParams.get('radius'), '10');
});

test('normalizes station infrastructure and never creates utilization fields', () => {
  const result = normalizeNlrResponse(fixture, { retrievedAt: '2026-08-20T15:00:00.000Z' });
  assert.equal(result.totalResults, 1);
  assert.deepEqual(result.stations[0], {
    source: 'NLR/AFDC', sourceRecordId: '12345', name: 'Orem Tesla Supercharger', address: '1960 N State St, Orem, UT, 84057', city: 'Orem', state: 'UT', postalCode: '84057', latitude: 40.2981, longitude: -111.6946, distanceMiles: 0.2, network: 'Tesla', status: 'E', access: 'public', restrictedAccess: false, facilityType: 'RESTAURANT', portCount: 8, dcFastPorts: 8, level2Ports: 0, level1Ports: 0, maxPowerKw: 250, chargingType: 'high-capacity-dc-fast', utilization: null, utilizationSource: null, utilizationStatus: 'not-provided-by-nlr', connectorTypes: ['TESLA', 'J1772COMBO'], pricing: '$0.45/kWh', hours: '24 hours daily', stationUrl: 'https://www.tesla.com/findus', sourceUpdatedAt: '2026-08-19', retrievedAt: '2026-08-20T15:00:00.000Z', rawSource: { provider: 'NLR/AFDC', recordId: '12345', updatedAt: '2026-08-19' },
  });
  assert.equal(result.stations[0].utilization, null);
  assert.equal(result.stations[0].utilizationStatus, 'not-provided-by-nlr');
  assert.equal('sessionCount' in result.stations[0], false);
});

test('fetches and normalizes through an injectable transport', async () => {
  let requestedUrl = '';
  const result = await fetchNlrStations({ latitude: 40.2981, longitude: -111.6946, apiKey: 'test-key' }, {
    retrievedAt: '2026-08-20T15:00:00.000Z',
    fetchImpl: async url => { requestedUrl = url; return { ok: true, status: 200, json: async () => fixture }; },
  });
  assert.match(requestedUrl, /developer\.nlr\.gov\/api\/alt-fuel-stations\/v1\/nearest\.json/);
  assert.equal(result.stations[0].source, 'NLR/AFDC');
});
