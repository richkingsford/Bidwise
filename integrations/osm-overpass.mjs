const DEFAULT_OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';

const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const textOrNull = value => value === null || value === undefined || String(value).trim() === '' ? null : String(value).trim();

export const buildOverpassPoiQuery = ({ bbox, timeoutSeconds = 25 } = {}) => {
  if (!Array.isArray(bbox) || bbox.length !== 4 || bbox.some(value => !Number.isFinite(Number(value)))) throw new Error('A numeric [south, west, north, east] bbox is required.');
  const [south, west, north, east] = bbox.map(Number);
  if (south >= north || west >= east) throw new Error('The Overpass bbox must have positive width and height.');
  const timeout = Math.max(1, Math.min(180, Math.round(Number(timeoutSeconds) || 25)));
  return `[out:json][timeout:${timeout}];(nwr["amenity"](${south},${west},${north},${east});nwr["shop"](${south},${west},${north},${east});nwr["tourism"](${south},${west},${north},${east});nwr["leisure"](${south},${west},${north},${east}););out center tags;`;
};

const elementCoordinates = element => ({
  latitude: numberOrNull(element.lat ?? element.center?.lat),
  longitude: numberOrNull(element.lon ?? element.center?.lon),
});

export const normalizeOverpassElement = (element, { retrievedAt = new Date().toISOString(), sourceUrl = DEFAULT_OVERPASS_ENDPOINT } = {}) => {
  if (!element || !element.type || element.id === undefined) return null;
  const tags = element.tags || {};
  const coordinates = elementCoordinates(element);
  if (coordinates.latitude === null || coordinates.longitude === null) return null;
  const poiType = textOrNull(tags.amenity || tags.shop || tags.tourism || tags.leisure);
  if (!poiType) return null;
  return {
    source: 'OpenStreetMap Overpass',
    sourceRecordId: `${element.type}/${element.id}`,
    osmType: element.type,
    osmId: String(element.id),
    name: textOrNull(tags.name || tags.brand),
    poiType,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    address: textOrNull([tags['addr:housenumber'], tags['addr:street'], tags['addr:city'], tags['addr:postcode']].filter(Boolean).join(' ')),
    openingHours: textOrNull(tags.opening_hours),
    wheelchair: textOrNull(tags.wheelchair),
    retrievedAt,
    sourceUrl,
    rawSource: { provider: 'OpenStreetMap', elementType: element.type, elementId: String(element.id), tags },
  };
};

export const normalizeOverpassResponse = (payload, options = {}) => ({
  source: 'OpenStreetMap Overpass',
  retrievedAt: options.retrievedAt || new Date().toISOString(),
  pois: (Array.isArray(payload?.elements) ? payload.elements : []).map(element => normalizeOverpassElement(element, options)).filter(Boolean),
});

export const fetchOverpassPois = async ({ bbox, endpoint = DEFAULT_OVERPASS_ENDPOINT, timeoutSeconds = 25 } = {}, { fetchImpl = globalThis.fetch, retrievedAt = new Date().toISOString() } = {}) => {
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required.');
  const query = buildOverpassPoiQuery({ bbox, timeoutSeconds });
  const response = await fetchImpl(endpoint, { method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ data: query }) });
  if (!response.ok) throw new Error(`Overpass request failed (${response.status}).`);
  return normalizeOverpassResponse(await response.json(), { retrievedAt, sourceUrl: endpoint });
};

export const overpassSources = { defaultEndpoint: DEFAULT_OVERPASS_ENDPOINT };
