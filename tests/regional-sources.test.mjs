import test from 'node:test';
import assert from 'node:assert/strict';
import { regionalSources, regionalSourceStatus, sourceForState, supportedRegionalStates } from '../integrations/regional-sources.mjs';

test('exposes the requested states in priority order', () => {
  assert.deepEqual(supportedRegionalStates(), ['CO', 'NV', 'AZ', 'OR', 'ID']);
  assert.equal(regionalSources[0].priority, 1);
  assert.equal(regionalSources[1].priority, 2);
});

test('selects an official traffic and EV source by state', () => {
  const source = sourceForState(' nv ');
  assert.equal(source.trafficName, 'Nevada DOT TRINA / GeoHub AADT');
  assert.match(source.trafficUrl, /^https:\/\//);
  assert.match(source.evUrl, /afdc\.energy\.gov/);
  assert.equal(regionalSourceStatus('NV'), 'ready-for-import');
});

test('does not claim support for an unregistered state', () => {
  assert.equal(sourceForState('UT'), null);
  assert.equal(regionalSourceStatus('UT'), 'unsupported-state');
});
