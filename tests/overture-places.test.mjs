import assert from 'node:assert/strict';
import test from 'node:test';
import { buildOverturePlacesQuery, filterPlacesByBbox, normalizeOvertureGeoJson, normalizeOverturePlace } from '../integrations/overture-places.mjs';

const fixture = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: { id: 'GERS-1', names: { primary: 'Kneaders Bakery & Cafe' }, categories: { primary: 'restaurant' }, addresses: [{ freeform: '1960 N State Street, Orem, UT 84057' }], confidence: 0.98, sources: [{ dataset: 'O*NET', record_id: 'source-1' }] }, geometry: { type: 'Point', coordinates: [-111.6946, 40.2981] } }] };

test('normalizes an Overture place with point geometry and provenance', () => {
  const result = normalizeOverturePlace(fixture.features[0], { release: '2026-06-17.0', retrievedAt: '2026-08-20T00:00:00Z' });
  assert.equal(result.sourceRecordId, 'GERS-1');
  assert.equal(result.category, 'restaurant');
  assert.equal(result.latitude, 40.2981);
  assert.equal(result.longitude, -111.6946);
  assert.equal(result.release, '2026-06-17.0');
});

test('normalizes GeoJSON and applies a bounded bbox', () => {
  const result = normalizeOvertureGeoJson(fixture, { release: '2026-06-17.0' });
  assert.equal(result.places.length, 1);
  assert.equal(filterPlacesByBbox(result.places, [-111.70, 40.29, -111.69, 40.31]).length, 1);
  assert.equal(filterPlacesByBbox(result.places, [-111.60, 40.29, -111.59, 40.31]).length, 0);
});

test('builds a bounded DuckDB query instead of a global download', () => {
  const query = buildOverturePlacesQuery({ release: '2026-06-17.0', bbox: [-111.70, 40.29, -111.69, 40.31], category: 'restaurant' });
  assert.match(query, /read_parquet/);
  assert.match(query, /bbox\.xmin BETWEEN -111\.7 AND -111\.69/);
  assert.match(query, /categories\.primary = 'restaurant'/);
});
