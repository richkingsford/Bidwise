import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchUdotAadtCsv, normalizeUdotAadtRow, parseUdotAadtCsv, udotSources } from '../integrations/udot-aadt.mjs';

const fixtureRow = {
  STATION: '049-0285',
  RouteID: '0089PM',
  BeginPoint: 1.753,
  EndPoint: 2.558,
  Section_Length: 0.805,
  DESC: 'SR 89 Orem',
  AADT2024: 43000,
};

test('normalizes a UDOT AADT segment with provenance', () => {
  const result = normalizeUdotAadtRow(fixtureRow, { dataYear: 2024, reviewer: 'Rich Kingsford', retrievedAt: '2026-08-20T00:00:00.000Z' });
  assert.deepEqual(result, {
    source: 'UDOT', sourceRecordId: '049-0285', segmentId: '049-0285', routeId: '0089PM', roadName: 'SR 89 Orem', beginPoint: 1.753, endPoint: 2.558, sectionLengthMiles: 0.805, aadt: 43000, dataYear: 2024, reviewer: 'Rich Kingsford', retrievedAt: '2026-08-20T00:00:00.000Z', sourceUrl: udotSources.aadt2024File, rawSource: { provider: 'UDOT', recordId: '049-0285', routeId: '0089PM', dataYear: 2024 },
  });
  assert.equal('utilization' in result, false);
});

test('parses official-style AADT CSV headers and ignores invalid rows', () => {
  const result = parseUdotAadtCsv('STATION,RouteID,DESC,AADT2024\n049-0285,0089PM,"SR 89 Orem",43000\n,,bad,not-a-number', { dataYear: 2024 });
  assert.equal(result.segments.length, 1);
  assert.equal(result.segments[0].aadt, 43000);
  assert.equal(result.segments[0].roadName, 'SR 89 Orem');
});

test('fetches through an injectable transport and preserves source URL', async () => {
  const result = await fetchUdotAadtCsv('https://example.test/aadt.csv', { dataYear: 2024 }, { fetchImpl: async () => ({ ok: true, status: 200, text: async () => 'STATION,DESC,AADT2024\n049-0285,SR 89 Orem,43000' }) });
  assert.equal(result.segments[0].sourceUrl, 'https://example.test/aadt.csv');
  assert.equal(result.segments[0].sourceRecordId, '049-0285');
});
