import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRegionalTrafficQuery, fetchRegionalTraffic, normalizeRegionalTraffic, regionalTrafficSource } from '../integrations/regional-traffic.mjs';

test('builds bounded official queries for Colorado and Nevada', () => {
  const co = buildRegionalTrafficQuery({ state: 'CO', latitude: 39.7392, longitude: -104.9903 });
  const nv = buildRegionalTrafficQuery({ state: 'NV', latitude: 36.1699, longitude: -115.1398 });
  assert.match(co.url, /services\.arcgis\.com/);
  assert.match(nv.url, /gis\.dot\.nv\.gov/);
  assert.equal(co.params.get('geometryType'), 'esriGeometryEnvelope');
  assert.equal(co.params.get('returnGeometry'), 'false');
});

test('normalizes an official AADT feature without inventing a value', () => {
  const record = normalizeRegionalTraffic({ state: 'NV', retrievedAt: '2026-08-27T00:00:00.000Z', payload: { features: [{ attributes: { RouteName: 'US 95', AADT: 33843, RouteID: '126845CL', BeginPoint: 11.9, EndPoint: 12.5 } }] } });
  assert.deepEqual(record, { source: 'Nevada DOT HPMS AADT', sourceState: 'NV', sourceUrl: regionalTrafficSource('NV').url, sourceRecordId: '126845CL', roadName: 'US 95', aadt: 33843, dataYear: 2026, retrievedAt: '2026-08-27T00:00:00.000Z' });
  assert.equal(normalizeRegionalTraffic({ state: 'CO', payload: { features: [] } }), null);
});

test('fetches through an injectable transport', async () => {
  const record = await fetchRegionalTraffic({ state: 'NV', latitude: 36.17, longitude: -115.14 }, { retrievedAt: '2026-08-27T00:00:00.000Z', fetchImpl: async url => ({ ok: true, json: async () => ({ features: [{ attributes: { RouteName: 'US 95', AADT: 1000, RouteID: 'r1' } }] }) }) });
  assert.equal(record.aadt, 1000);
});
