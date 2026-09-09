import assert from 'node:assert/strict';
import test from 'node:test';
import { aggregateUtahCountyElectricRegistrations, normalizeUtahEvRegistrationRow, parseUtahRegistrationCsv, utahRegistrationSources } from '../integrations/utah-ev-registrations.mjs';

const fixtureRows = [
  { County: '25 - UTAH', 'Vehicle Type': 'Motorcycle - Standard', 'Fuel Type': 'Electric', count: 115 },
  { County: '25 - UTAH', 'Vehicle Type': 'Passenger - Standard', 'Fuel Type': 'Electric', count: 6654 },
  { County: '25 - UTAH', 'Vehicle Type': 'Light Truck', 'Fuel Type': 'Electric', count: 9663 },
  { County: '25 - UTAH', 'Vehicle Type': 'Heavy Truck', 'Fuel Type': 'Electric', count: 5 },
  { County: '25 - UTAH', 'Vehicle Type': 'Passenger - Standard', 'Fuel Type': 'Plug-in Hybrid', count: 1226 },
];

test('normalizes a registration row with source and observation metadata', () => {
  const result = normalizeUtahEvRegistrationRow(fixtureRows[1], { registrationYear: 2026, observationDate: '2026-02-16', retrievedAt: '2026-08-20T00:00:00.000Z' });
  assert.equal(result.source, 'Utah State Tax Commission');
  assert.equal(result.sourceRecordId, '2026:25 - UTAH:Passenger - Standard:Electric');
  assert.equal(result.count, 6654);
  assert.equal(result.observationDate, '2026-02-16');
});

test('aggregates electric registrations while excluding plug-in hybrids', () => {
  const result = aggregateUtahCountyElectricRegistrations(fixtureRows, { registrationYear: 2026, observationDate: '2026-02-16' });
  assert.equal(result.count, 16437);
  assert.equal(result.fuelType, 'Electric');
  assert.equal(result.registrationYear, 2026);
  assert.equal(result.sourceUrl, utahRegistrationSources.registrations2026File);
});

test('parses CSV exports from the workbook import workflow', () => {
  const rows = parseUtahRegistrationCsv('County,Vehicle Type,Fuel Type,count\n25 - UTAH,Passenger - Standard,Electric,6654', { registrationYear: 2026 });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].count, 6654);
});
