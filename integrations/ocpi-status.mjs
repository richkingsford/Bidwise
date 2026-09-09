const OCPI_DEFAULT_VERSION = '2.2.1';

const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const textOrNull = value => value === null || value === undefined || String(value).trim() === '' ? null : String(value).trim();

const asArray = value => Array.isArray(value) ? value : [];

const normalizeConnector = (location, evse, connector, { source, retrievedAt }) => {
  const stationId = textOrNull(location.id);
  const evseId = textOrNull(evse.uid || evse.evse_id);
  const connectorId = textOrNull(connector.id);
  if (!stationId || !evseId || !connectorId) return null;
  const status = textOrNull(connector.status || evse.status || 'UNKNOWN')?.toUpperCase() || 'UNKNOWN';
  const maxPowerKw = numberOrNull(connector.max_electric_power) === null ? null : numberOrNull(connector.max_electric_power) / 1000;
  return {
    source,
    sourceRecordId: `${stationId}:${evseId}:${connectorId}`,
    stationId,
    portId: `${evseId}:${connectorId}`,
    evseId,
    connectorId,
    network: textOrNull(location.operator?.name || location.party_id || source),
    portStatus: status,
    statusChangedAt: textOrNull(connector.last_updated || evse.last_updated || location.last_updated),
    maxPowerKw,
    connectorType: textOrNull(connector.standard),
    powerType: textOrNull(connector.power_type),
    tariffIds: asArray(connector.tariff_ids || evse.tariff_ids || location.tariff_ids).map(textOrNull).filter(Boolean),
    stationOperationalStatus: location.publish === false ? 'UNPUBLISHED' : 'PUBLISHED',
    latitude: numberOrNull(evse.coordinates?.latitude || location.coordinates?.latitude),
    longitude: numberOrNull(evse.coordinates?.longitude || location.coordinates?.longitude),
    retrievedAt,
    rawSource: { provider: source, locationId: stationId, evseId, connectorId, status },
  };
};

export const normalizeOcpiLocations = (payload, { source = 'OCPI', retrievedAt = new Date().toISOString() } = {}) => {
  const locations = Array.isArray(payload) ? payload : asArray(payload?.data);
  const ports = [];
  for (const location of locations) {
    for (const evse of asArray(location?.evses)) {
      for (const connector of asArray(evse?.connectors)) {
        const normalized = normalizeConnector(location, evse, connector, { source, retrievedAt });
        if (normalized) ports.push(normalized);
      }
    }
  }
  return { source, retrievedAt, totalPorts: ports.length, ports };
};

export const buildOcpiLocationsRequest = (url, { token, offset = 0, limit = 100 } = {}) => {
  if (!url) throw new Error('An OCPI Locations endpoint is required.');
  if (!token) throw new Error('An OCPI token is required on the server.');
  const requestUrl = new URL(url);
  requestUrl.searchParams.set('offset', String(offset));
  requestUrl.searchParams.set('limit', String(limit));
  return { url: requestUrl.toString(), headers: { accept: 'application/json', authorization: token, 'content-type': 'application/json', 'ocpi-version': OCPI_DEFAULT_VERSION } };
};

export const fetchOcpiLocations = async (url, options, { fetchImpl = globalThis.fetch, retrievedAt = new Date().toISOString() } = {}) => {
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required.');
  const request = buildOcpiLocationsRequest(url, options);
  const response = await fetchImpl(request.url, { headers: request.headers });
  if (!response.ok) throw new Error(`OCPI Locations request failed (${response.status}).`);
  const payload = await response.json();
  return normalizeOcpiLocations(payload, { source: options.source || 'OCPI', retrievedAt });
};
