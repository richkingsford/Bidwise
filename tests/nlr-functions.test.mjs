import assert from 'node:assert/strict';
import test from 'node:test';
import { buildNlrNearestUrl, normalizeNlrStation } from '../functions/nlr-afdc.mjs';

test('server helper clamps requests to the required ten-mile electric search', () => {
  const url = new URL(buildNlrNearestUrl({ latitude: 40.333, longitude: -111.712, apiKey: 'server-only', radius: 25 }));
  assert.equal(url.searchParams.get('radius'), '10');
  assert.equal(url.searchParams.get('fuel_type'), 'ELEC');
  assert.equal(url.searchParams.get('status'), 'all');
  assert.equal(url.searchParams.get('access'), 'all');
});

test('server helper preserves inventory metadata and marks utilization unavailable', () => {
  const station = normalizeNlrStation({
    id: 44, station_name: 'Example Fast Charge', latitude: 40.333, longitude: -111.712, ev_network: 'Example Network', ev_dc_fast_num: 4,
    ev_charging_units: [{ charging_level: 'dc_fast', port_count: 4, connectors: { CCS: { power_kw: 180 } } }],
  }, '2026-08-21T00:00:00.000Z');
  assert.equal(station.network, 'Example Network');
  assert.equal(station.chargingType, 'high-capacity-dc-fast');
  assert.equal(station.maxPowerKw, 180);
  assert.equal(station.utilization, null);
  assert.equal(station.utilizationStatus, 'not-provided-by-nlr');
});
