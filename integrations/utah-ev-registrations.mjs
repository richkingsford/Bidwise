const UTAH_REGISTRATIONS_PAGE = 'https://tax.utah.gov/commission/econstats/mv/registrations/';
const UTAH_REGISTRATIONS_2026_FILE = 'https://files.tax.utah.gov/tax/esu/mv-registration/2026registrations.xlsx';

const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const textOrNull = value => value === null || value === undefined || String(value).trim() === '' ? null : String(value).trim();

export const normalizeUtahEvRegistrationRow = (row, {
  registrationYear,
  observationDate,
  retrievedAt = new Date().toISOString(),
  sourceUrl = UTAH_REGISTRATIONS_2026_FILE,
} = {}) => {
  if (!row || typeof row !== 'object') return null;
  const geography = textOrNull(row.geography ?? row.county ?? row.County);
  const vehicleType = textOrNull(row.vehicleType ?? row['Vehicle Type'] ?? row.vehicle_type);
  const fuelType = textOrNull(row.fuelType ?? row['Fuel Type'] ?? row.fuel_type);
  const count = numberOrNull(row.count ?? row.registrations ?? row.value);
  const year = Number(registrationYear ?? row.registrationYear ?? row.year ?? row.YEAR);
  if (!geography || !vehicleType || !fuelType || count === null || count < 0 || !Number.isInteger(year)) return null;
  return {
    source: 'Utah State Tax Commission',
    sourceRecordId: `${year}:${geography}:${vehicleType}:${fuelType}`,
    geography,
    registrationYear: year,
    observationDate: textOrNull(observationDate ?? row.observationDate ?? row['Observation Date']),
    vehicleType,
    fuelType,
    count,
    retrievedAt,
    sourceUrl,
    rawSource: { provider: 'Utah State Tax Commission', geography, vehicleType, fuelType, registrationYear: year },
  };
};

export const aggregateUtahCountyElectricRegistrations = (rows, {
  county = '25 - UTAH',
  registrationYear,
  ...options
} = {}) => {
  const normalized = (Array.isArray(rows) ? rows : []).map(row => normalizeUtahEvRegistrationRow(row, { registrationYear, ...options })).filter(Boolean);
  const matches = normalized.filter(row => row.geography.toUpperCase().startsWith(county.toUpperCase()) && row.fuelType.toLowerCase() === 'electric');
  const first = matches[0];
  return {
    source: 'Utah State Tax Commission',
    geography: county,
    registrationYear: Number(registrationYear || first?.registrationYear || 0) || null,
    observationDate: first?.observationDate || null,
    fuelType: 'Electric',
    count: matches.reduce((total, row) => total + row.count, 0),
    sourceUrl: options.sourceUrl || UTAH_REGISTRATIONS_2026_FILE,
    retrievedAt: options.retrievedAt || new Date().toISOString(),
    sourceRecords: matches.map(row => row.sourceRecordId),
  };
};

export const parseUtahRegistrationCsv = (csvText, options = {}) => {
  const lines = String(csvText || '').split(/\r?\n/).filter(line => line.trim());
  if (!lines.length) return [];
  const parseLine = line => line.split(',').map(value => value.trim().replace(/^"|"$/g, ''));
  const headers = parseLine(lines[0]);
  return lines.slice(1).map(line => Object.fromEntries(parseLine(line).map((value, index) => [headers[index], value]))).map(row => normalizeUtahEvRegistrationRow(row, options)).filter(Boolean);
};

export const utahRegistrationSources = { registrationsPage: UTAH_REGISTRATIONS_PAGE, registrations2026File: UTAH_REGISTRATIONS_2026_FILE };
