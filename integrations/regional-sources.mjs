const sources = [
  { state: 'CO', priority: 1, trafficName: 'Colorado DOT Traffic Data Explorer', trafficUrl: 'https://dtdapps.codot.gov/otis/trafficdata', evName: 'U.S. DOE AFDC vehicle registration counts', evUrl: 'https://afdc.energy.gov/data/categories/vehicles--2', proposalUse: 'Roadway AADT and EV-market context' },
  { state: 'NV', priority: 2, trafficName: 'Nevada DOT TRINA / GeoHub AADT', trafficUrl: 'https://gis.dot.nv.gov/trina/', evName: 'U.S. DOE AFDC vehicle registration counts', evUrl: 'https://afdc.energy.gov/data/categories/vehicles--2', proposalUse: 'Roadway AADT and EV-market context' },
  { state: 'AZ', priority: 3, trafficName: 'Arizona DOT Traffic Monitoring / TDMS', trafficUrl: 'https://azdot.gov/planning/data-and-information/traffic-monitoring', evName: 'U.S. DOE AFDC vehicle registration counts', evUrl: 'https://afdc.energy.gov/data/categories/vehicles--2', proposalUse: 'Roadway AADT and EV-market context' },
  { state: 'OR', priority: 4, trafficName: 'Oregon DOT Traffic Counting / OTMS', trafficUrl: 'https://www.oregon.gov/odot/Data/Pages/Traffic-Counting.aspx', evName: 'U.S. DOE AFDC vehicle registration counts', evUrl: 'https://afdc.energy.gov/data/categories/vehicles--2', proposalUse: 'Roadway AADT and EV-market context' },
  { state: 'ID', priority: 5, trafficName: 'Idaho Transportation Department Traffic Data', trafficUrl: 'https://itd.idaho.gov/traffic-data/', evName: 'U.S. DOE AFDC vehicle registration counts', evUrl: 'https://afdc.energy.gov/data/categories/vehicles--2', proposalUse: 'Roadway AADT and EV-market context' },
];

export const regionalSources = sources.map(source => Object.freeze({ ...source }));

export const sourceForState = state => regionalSources.find(source => source.state === String(state || '').trim().toUpperCase()) || null;

export const supportedRegionalStates = () => regionalSources.map(source => source.state);

export const regionalSourceStatus = state => sourceForState(state) ? 'ready-for-import' : 'unsupported-state';
