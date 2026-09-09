const OVERTURE_LATEST_CATALOG = 'https://stac.overturemaps.org/catalog.json';
const OVERTURE_PLACES_S3 = 's3://overturemaps-us-west-2/release/{release}/theme=places/type=place/*';

const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const textOrNull = value => value === null || value === undefined || String(value).trim() === '' ? null : String(value).trim();

const firstAddress = feature => {
  const address = Array.isArray(feature.addresses) ? feature.addresses[0] : feature.address;
  return address?.freeform || address?.formatted || (address ? [address.locality, address.region, address.postcode].filter(Boolean).join(', ') : null);
};

const pointFromGeometry = geometry => {
  if (geometry?.type !== 'Point' || !Array.isArray(geometry.coordinates)) return { latitude: null, longitude: null };
  return { longitude: numberOrNull(geometry.coordinates[0]), latitude: numberOrNull(geometry.coordinates[1]) };
};

export const normalizeOverturePlace = (feature, { release, retrievedAt = new Date().toISOString(), sourceUrl = OVERTURE_LATEST_CATALOG } = {}) => {
  const properties = feature?.properties || feature || {};
  const geometry = feature?.geometry || properties.geometry;
  const coords = pointFromGeometry(geometry);
  const id = textOrNull(feature?.id || properties.id || properties.gers_id || properties.place_id);
  const name = textOrNull(properties.names?.primary || properties.name);
  if (!id || !name || coords.latitude === null || coords.longitude === null) return null;
  const categories = properties.categories || {};
  return {
    source: 'Overture Maps Places',
    sourceRecordId: id,
    name,
    category: textOrNull(categories.primary || properties.category),
    alternateCategories: Array.isArray(categories.alternate) ? categories.alternate.filter(Boolean) : [],
    address: textOrNull(firstAddress(properties)),
    latitude: coords.latitude,
    longitude: coords.longitude,
    confidence: numberOrNull(properties.confidence),
    operatingStatus: textOrNull(properties.operating_status),
    sources: Array.isArray(properties.sources) ? properties.sources.map(source => ({ dataset: source.dataset || null, recordId: source.record_id || null })) : [],
    release: textOrNull(release),
    retrievedAt,
    sourceUrl,
    rawSource: { provider: 'Overture Maps Places', recordId: id, release: release || null },
  };
};

export const normalizeOvertureGeoJson = (geojson, options = {}) => ({
  source: 'Overture Maps Places',
  release: options.release || null,
  retrievedAt: options.retrievedAt || new Date().toISOString(),
  places: (Array.isArray(geojson?.features) ? geojson.features : []).map(feature => normalizeOverturePlace(feature, options)).filter(Boolean),
});

export const filterPlacesByBbox = (places, [minLongitude, minLatitude, maxLongitude, maxLatitude]) => (Array.isArray(places) ? places : []).filter(place => place.longitude >= minLongitude && place.longitude <= maxLongitude && place.latitude >= minLatitude && place.latitude <= maxLatitude);

export const buildOverturePlacesQuery = ({ release = 'latest', bbox, category } = {}) => {
  if (!Array.isArray(bbox) || bbox.length !== 4 || bbox.some(value => !Number.isFinite(Number(value)))) throw new Error('A numeric [minLongitude, minLatitude, maxLongitude, maxLatitude] bbox is required.');
  const [minLongitude, minLatitude, maxLongitude, maxLatitude] = bbox.map(Number);
  if (minLongitude >= maxLongitude || minLatitude >= maxLatitude) throw new Error('The Overture bbox must have positive width and height.');
  const categoryClause = category ? ` AND categories.primary = '${String(category).replace(/'/g, "''")}'` : '';
  const path = OVERTURE_PLACES_S3.replace('{release}', encodeURIComponent(release));
  return `SELECT id, names.primary AS name, categories.primary AS category, addresses, confidence, sources, geometry FROM read_parquet('${path}', filename=true, hive_partitioning=1, union_by_name=true) WHERE bbox.xmin BETWEEN ${minLongitude} AND ${maxLongitude} AND bbox.xmax BETWEEN ${minLongitude} AND ${maxLongitude} AND bbox.ymin BETWEEN ${minLatitude} AND ${maxLatitude} AND bbox.ymax BETWEEN ${minLatitude} AND ${maxLatitude}${categoryClause}`;
};

export const overtureSources = { latestCatalog: OVERTURE_LATEST_CATALOG, placesS3Template: OVERTURE_PLACES_S3 };
