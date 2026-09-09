const UDOT_TRAFFIC_STATISTICS_URL = 'https://connect.udot.utah.gov/business/traffic-data/traffic-statistics/';
const UDOT_AADT_2024_FILE_URL = 'https://drive.usercontent.google.com/download?id=1uqy48QRgN9pKPQ7sHC4UYAxGV6pHSUG2&export=download&confirm=t';

const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const textOrNull = value => value === null || value === undefined || String(value).trim() === '' ? null : String(value).trim();

const pick = (row, names) => {
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') return row[name];
  }
  return null;
};

export const normalizeUdotAadtRow = (row, {
  dataYear,
  reviewer,
  retrievedAt = new Date().toISOString(),
  sourceUrl = UDOT_AADT_2024_FILE_URL,
} = {}) => {
  if (!row || typeof row !== 'object') return null;
  const segmentId = textOrNull(pick(row, ['segmentId', 'SEGMENT_ID', 'STATION', 'station']));
  const routeId = textOrNull(pick(row, ['routeId', 'ROUTE_ID', 'RouteID']));
  const aadtYear = Number(dataYear || pick(row, ['dataYear', 'DATA_YEAR', 'year', 'YEAR']) || 0);
  const aadt = numberOrNull(pick(row, ['aadt', 'AADT', `AADT${aadtYear}`]));
  if (!segmentId || !aadtYear || !Number.isInteger(aadtYear) || aadt === null || aadt < 0) return null;
  return {
    source: 'UDOT',
    sourceRecordId: segmentId,
    segmentId,
    routeId,
    roadName: textOrNull(pick(row, ['roadName', 'ROAD_NAME', 'DESC', 'description', 'DESCRIPTION'])),
    beginPoint: numberOrNull(pick(row, ['beginPoint', 'BEGIN_POINT', 'BeginPoint'])),
    endPoint: numberOrNull(pick(row, ['endPoint', 'END_POINT', 'EndPoint'])),
    sectionLengthMiles: numberOrNull(pick(row, ['sectionLengthMiles', 'SECTION_LENGTH', 'Section_Length'])),
    aadt,
    dataYear: aadtYear,
    reviewer: textOrNull(reviewer),
    retrievedAt,
    sourceUrl,
    rawSource: { provider: 'UDOT', recordId: segmentId, routeId, dataYear: aadtYear },
  };
};

export const normalizeUdotAadtRows = (rows, options = {}) => ({
  source: 'UDOT',
  retrievedAt: options.retrievedAt || new Date().toISOString(),
  sourceUrl: options.sourceUrl || UDOT_TRAFFIC_STATISTICS_URL,
  segments: (Array.isArray(rows) ? rows : []).map(row => normalizeUdotAadtRow(row, options)).filter(Boolean),
});

export const parseUdotAadtCsv = (csvText, options = {}) => {
  const lines = String(csvText || '').split(/\r?\n/).filter(line => line.trim());
  if (!lines.length) return normalizeUdotAadtRows([], options);
  const parseLine = line => {
    const values = [];
    let value = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"' && line[i + 1] === '"' && quoted) { value += '"'; i += 1; }
      else if (char === '"') quoted = !quoted;
      else if (char === ',' && !quoted) { values.push(value.trim()); value = ''; }
      else value += char;
    }
    values.push(value.trim());
    return values;
  };
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(line => Object.fromEntries(parseLine(line).map((value, index) => [headers[index], value])));
  return normalizeUdotAadtRows(rows, options);
};

export const fetchUdotAadtCsv = async (url, options = {}, { fetchImpl = globalThis.fetch } = {}) => {
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required.');
  const response = await fetchImpl(url, { headers: { accept: 'text/csv, text/plain' } });
  if (!response.ok) throw new Error(`UDOT AADT request failed (${response.status}).`);
  return parseUdotAadtCsv(await response.text(), { ...options, sourceUrl: url });
};

export const udotSources = { trafficStatistics: UDOT_TRAFFIC_STATISTICS_URL, aadt2024File: UDOT_AADT_2024_FILE_URL };
