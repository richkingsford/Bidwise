const endpoints = Object.freeze({
  CO: { name: 'Colorado DOT Traffic Counts', url: 'https://services.arcgis.com/Vr4pJuhEJB9F4bUA/arcgis/rest/services/COHighway_traffic_MJS/FeatureServer/0/query', fields: ['ROUTE', 'AADT', 'AADTYR', 'FID'] },
  NV: { name: 'Nevada DOT HPMS AADT', url: 'https://gis.dot.nv.gov/rhgis/rest/services/RWS/HPMSOverlay/FeatureServer/0/query', fields: ['RouteName', 'AADT', 'RouteID', 'BeginPoint', 'EndPoint'] },
  AZ: { name: 'Arizona DOT 2024 AADT', url: 'https://services6.arcgis.com/clPWQMwZfdWn4MQZ/arcgis/rest/services/ADOT_2024_Average_Annual_Daily_Traffic_%28AADT%29/FeatureServer/0/query', fields: ['RouteId', 'AADT', 'SubmittalYear', 'SourceDataset'] },
  OR: { name: 'Oregon DOT Traffic Flow AADT', url: 'https://gis.odot.state.or.us/arcgis1006/rest/services/ames/ames/MapServer/7/query', fields: ['HWYNUMB', 'AADT', 'SITE_ID', 'EFFECTV_DT'] },
  ID: { name: 'Idaho Transportation Department AADT', url: 'https://gisportalp.itd.idaho.gov/lrs/rest/services/RHGeneralService/MapServer/1/query', fields: ['RouteID', 'AADT_Default', 'AADTYear', 'OBJECTID'], where: 'AADT_Default > 0', orderByFields: 'AADT_Default DESC' },
});

const validCoordinate = value => Number.isFinite(Number(value)) && Number(value) >= -180 && Number(value) <= 180;
const bboxFor = (latitude, longitude, radiusMiles = 1) => {
  const latDelta = radiusMiles / 69;
  const lonDelta = radiusMiles / (69 * Math.max(0.1, Math.cos(Number(latitude) * Math.PI / 180)));
  return [Number(longitude) - lonDelta, Number(latitude) - latDelta, Number(longitude) + lonDelta, Number(latitude) + latDelta];
};

export const regionalTrafficSource = state => endpoints[String(state || '').toUpperCase()] || null;

export const buildRegionalTrafficQuery = ({ state, latitude, longitude, radiusMiles = 1 } = {}) => {
  const source = regionalTrafficSource(state);
  if (!source) throw new Error(`No live regional traffic endpoint is configured for ${state || 'this state'}.`);
  if (!validCoordinate(latitude) || !validCoordinate(longitude) || Number(latitude) < -90 || Number(latitude) > 90) throw new Error('Valid latitude and longitude are required.');
  const [west, south, east, north] = bboxFor(Number(latitude), Number(longitude), radiusMiles);
  return { url: source.url, params: new URLSearchParams({ f: 'json', where: source.where || 'AADT > 0', outFields: source.fields.join(','), orderByFields: source.orderByFields || 'AADT DESC', returnGeometry: 'false', geometry: `${west},${south},${east},${north}`, geometryType: 'esriGeometryEnvelope', inSR: '4326', spatialRel: 'esriSpatialRelIntersects', resultRecordCount: '25' }) };
};

export const normalizeRegionalTraffic = ({ state, payload, retrievedAt = new Date().toISOString() } = {}) => {
  const source = regionalTrafficSource(state);
  const features = Array.isArray(payload?.features) ? payload.features : [];
  const feature = features.filter(item => Number.isFinite(Number(item?.attributes?.AADT ?? item?.attributes?.AADT_Default)) && Number(item.attributes.AADT ?? item.attributes.AADT_Default) > 0).sort((a, b) => Number(b.attributes.AADTYR || b.attributes.UPDATEYR || b.attributes.SubmittalYear || b.attributes.Year_ || b.attributes.AADTYear || String(b.attributes.EFFECTV_DT || '').slice(0, 4) || 0) - Number(a.attributes.AADTYR || a.attributes.UPDATEYR || a.attributes.SubmittalYear || a.attributes.Year_ || a.attributes.AADTYear || String(a.attributes.EFFECTV_DT || '').slice(0, 4) || 0))[0];
  if (!source || !feature) return null;
  const attributes = feature.attributes;
  return { source: source.name, sourceState: String(state).toUpperCase(), sourceUrl: source.url, sourceRecordId: String(attributes.COUNTSTATIONID || attributes.RouteID || attributes.RID || attributes.SITE_ID || attributes.OBJECTID || ''), roadName: attributes.ROUTE || attributes.RouteName || attributes.Route || attributes.HWYNUMB || attributes.RouteID || null, aadt: Number(attributes.AADT || attributes.AADT_Default), dataYear: Number(attributes.AADTYR || attributes.UPDATEYR || attributes.SubmittalYear || attributes.Year_ || attributes.AADTYear || String(attributes.EFFECTV_DT || '').slice(0, 4) || new Date(retrievedAt).getUTCFullYear()) || null, retrievedAt };
};

export const fetchRegionalTraffic = async ({ state, latitude, longitude, radiusMiles = 1 } = {}, { fetchImpl = globalThis.fetch, retrievedAt = new Date().toISOString() } = {}) => {
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required.');
  const query = buildRegionalTrafficQuery({ state, latitude, longitude, radiusMiles });
  const response = await fetchImpl(`${query.url}?${query.params}`);
  if (!response.ok) throw new Error(`Regional traffic request failed (${response.status}).`);
  const result = normalizeRegionalTraffic({ state, payload: await response.json(), retrievedAt });
  if (!result) throw new Error('No nearby AADT segment was returned.');
  return result;
};

export const regionalTrafficEndpoints = endpoints;
