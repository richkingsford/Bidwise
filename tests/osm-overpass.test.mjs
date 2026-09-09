import assert from 'node:assert/strict';
import test from 'node:test';
import { buildOverpassPoiQuery, fetchOverpassPois, normalizeOverpassElement, normalizeOverpassResponse } from '../integrations/osm-overpass.mjs';

const fixture = { elements: [
  { type: 'node', id: 123, lat: 40.32701668, lon: -111.70900784, tags: { name: "McDonald's", amenity: 'fast_food', 'addr:housenumber': '1611', 'addr:street': 'N State St', opening_hours: 'Mo-Su 06:00-23:00' } },
  { type: 'way', id: 456, center: { lat: 40.32844375, lon: -111.70882061 }, tags: { name: 'Little Caesars Pizza', amenity: 'restaurant', wheelchair: 'yes' } },
  { type: 'node', id: 789, lat: 40.33, lon: -111.71, tags: { highway: 'traffic_signals' } },
] };

test('builds a bounded POI query across amenity categories', () => {
  const query = buildOverpassPoiQuery({ bbox: [40.323, -111.725, 40.343, -111.7] });
  assert.match(query, /\[timeout:25\]/);
  assert.match(query, /nwr\["amenity"\]\(40\.323,-111\.725,40\.343,-111\.7\)/);
  assert.match(query, /nwr\["shop"\]/);
  assert.match(query, /out center tags/);
});

test('normalizes nodes and ways with OSM provenance and ignores non-POI elements', () => {
  const result = normalizeOverpassResponse(fixture, { retrievedAt: '2026-08-21T00:00:00Z' });
  assert.equal(result.pois.length, 2);
  assert.equal(result.pois[0].sourceRecordId, 'node/123');
  assert.equal(result.pois[0].poiType, 'fast_food');
  assert.equal(result.pois[0].address, '1611 N State St');
  assert.equal(result.pois[1].sourceRecordId, 'way/456');
  assert.equal(result.pois[1].wheelchair, 'yes');
});

test('fetches through an injectable transport and sends the query as form data', async () => {
  let request = null;
  const result = await fetchOverpassPois({ bbox: [40.323, -111.725, 40.343, -111.7] }, { fetchImpl: async (url, options) => { request = { url, options }; return { ok: true, status: 200, json: async () => fixture }; } });
  assert.equal(request.options.method, 'POST');
  assert.equal(request.url, 'https://overpass-api.de/api/interpreter');
  assert.match(String(request.options.body), /data=%5Bout%3Ajson%5D/);
  assert.equal(result.pois.length, 2);
});
