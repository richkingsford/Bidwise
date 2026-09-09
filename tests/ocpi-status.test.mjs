import assert from 'node:assert/strict';
import test from 'node:test';
import { buildOcpiLocationsRequest, fetchOcpiLocations, normalizeOcpiLocations } from '../integrations/ocpi-status.mjs';

const fixture = {
  data: [{
    id: 'OREM-001', publish: true, party_id: 'TES', last_updated: '2026-08-20T12:00:00Z', coordinates: { latitude: '40.2981', longitude: '-111.6946' }, operator: { name: 'Example Network' },
    evses: [{ uid: 'EVSE-01', status: 'AVAILABLE', last_updated: '2026-08-20T11:59:00Z', connectors: [{ id: '1', standard: 'IEC_62196_T2_COMBO', power_type: 'DC', max_electric_power: 250000, last_updated: '2026-08-20T11:58:00Z' }] }],
  }],
};

test('builds a server-side OCPI request with pagination and token headers', () => {
  const request = buildOcpiLocationsRequest('https://network.example/ocpi/2.2.1/locations', { token: 'server-token', offset: 20, limit: 50 });
  assert.equal(new URL(request.url).searchParams.get('offset'), '20');
  assert.equal(new URL(request.url).searchParams.get('limit'), '50');
  assert.equal(request.headers.authorization, 'server-token');
  assert.equal(request.headers['ocpi-version'], '2.2.1');
});

test('normalizes connector status, power, location, and provenance', () => {
  const result = normalizeOcpiLocations(fixture, { source: 'Example Network OCPI', retrievedAt: '2026-08-20T12:01:00Z' });
  assert.equal(result.totalPorts, 1);
  assert.deepEqual(result.ports[0], {
    source: 'Example Network OCPI', sourceRecordId: 'OREM-001:EVSE-01:1', stationId: 'OREM-001', portId: 'EVSE-01:1', evseId: 'EVSE-01', connectorId: '1', network: 'Example Network', portStatus: 'AVAILABLE', statusChangedAt: '2026-08-20T11:58:00Z', maxPowerKw: 250, connectorType: 'IEC_62196_T2_COMBO', powerType: 'DC', tariffIds: [], stationOperationalStatus: 'PUBLISHED', latitude: 40.2981, longitude: -111.6946, retrievedAt: '2026-08-20T12:01:00Z', rawSource: { provider: 'Example Network OCPI', locationId: 'OREM-001', evseId: 'EVSE-01', connectorId: '1', status: 'AVAILABLE' },
  });
  assert.equal('utilization' in result.ports[0], false);
});

test('fetches and normalizes through an injectable transport', async () => {
  let requested = '';
  const result = await fetchOcpiLocations('https://network.example/locations', { token: 'server-token', source: 'Example Network' }, { fetchImpl: async (url, options) => { requested = `${url}|${options.headers.authorization}`; return { ok: true, status: 200, json: async () => fixture }; } });
  assert.match(requested, /network\.example\/locations/);
  assert.match(requested, /server-token/);
  assert.equal(result.ports[0].portStatus, 'AVAILABLE');
});
