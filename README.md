# GetEV

GetEV is a single-page MVP quote generator for commercial energy proposals. It turns a retail site brief into a presentation-ready report covering solar, battery storage, and EV charging.

## Dashboard information rule

Each proposal card has exactly one status badge, one owner field, and three distinct decision-useful summaries. Do not repeat status, scope, owner, or the same underlying metric elsewhere on that card. Cards stay visually neutral until the user hovers or focuses them.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static file server.

## MVP interactions

- View mode keeps the experience report-first and presentation-friendly.
- Edit mode exposes realistic project inputs and lets you toggle proposal scopes on or off.
- The left navigator jumps between the six report sections and tracks the section in view.
- Proposal economics update from the utility spend input; Share view-only link copies a presentation-safe URL.

## Firebase persistence and authentication

Firebase is the recommended free starting point for Bidwise because Google and passwordless email-link sign-in are supported directly by Firebase Authentication and Firestore has a no-cost daily quota on the Spark plan. Copy `firebase-config.example.js` to `firebase-config.js`, paste the Web app config from Firebase Console, enable Google and Email link (passwordless sign-in) under Authentication → Sign-in method, and create a Firestore database. The config file is ignored by git. Add the production host and Firebase Auth handler domains under Authentication → Settings → Authorized domains.

Email-link requests also pass through a self-hosted ALTCHA proof-of-work challenge in `functions/`. Before deploying functions, create the secret with `firebase functions:secrets:set ALTCHA_SECRET`, then deploy with `firebase deploy --only functions`. The functions require the Firebase project’s Blaze billing plan; no ALTCHA secret is exposed to the browser.

## Data integrations

The first integration adapter is `integrations/nlr-afdc.mjs`. It is server-side only: provide `NLR_API_KEY` to the importer/runtime, never the browser. Its default query is electric stations within 10 miles, including all operating/access states so the report can distinguish open, temporarily unavailable, and restricted sites. It normalizes location, distance, brand/network, access, status, facility, connector types, port counts, maximum power, charging class, pricing, hours, and source timestamps. NLR/AFDC does not publish station utilization, so normalized records keep `utilization: null` with an explicit `not-provided-by-nlr` status rather than inferring sessions from availability. Run its fixture tests with `node --test tests/nlr-afdc.test.mjs`.

Production server wiring is in `functions/nlr-afdc.mjs` and `functions/index.js` as the `nlrStations` HTTPS function. It accepts only proposal coordinates, enforces a 10-mile radius, and keeps `NLR_API_KEY` out of the browser. Configure it once with `firebase functions:secrets:set NLR_API_KEY`, then deploy with `firebase deploy --only functions:nlrStations`. The proposal calls that function and falls back gracefully if the function is unavailable; it does not present the fallback as live NLR data.

When NLR data is available, the demand map keeps observed-session pins sized by observed use, enriches matching popups with NLR brand/type/power/status/access details, and adds smaller NLR inventory pins for nearby stations without observed-session records. Source labels in the site snapshot and revenue sections expose quiet links to official source documentation.

The UDOT AADT adapter is `integrations/udot-aadt.mjs`. It normalizes the annual UDOT AADT workbook/CSV row shape into source-tagged traffic-segment records, including segment ID, route, road name, AADT, data year, reviewer, retrieval time, and source URL. It is intentionally separate from utilization and forecast calculations. Run both integration test suites with `node --test tests/nlr-afdc.test.mjs tests/udot-aadt.test.mjs`.

The Utah EV-registration adapter is `integrations/utah-ev-registrations.mjs`. It normalizes the Tax Commission's annual Table 5 workbook/CSV rows and aggregates electric registrations by county while keeping plug-in hybrids separate. The Kneaders proposal loads the verified Utah County 2026 snapshot from `utah-ev-registrations-data.json` for the current BEV-population card; it does not alter utilization or forecast formulas.

The real-time port-status layer is `integrations/ocpi-status.mjs`. It accepts an OCPI 2.2.1 Locations endpoint, normalizes station/EVSE/connector status, status-change time, power, connector type, and provenance, and requires the endpoint token to stay server-side. It intentionally does not create utilization or session metrics. A live network feed is not configured until an OCPI endpoint and token are supplied.

The Overture Places adapter is `integrations/overture-places.mjs`. It normalizes bounded GeoJSON extracts and builds bounded DuckDB queries against Overture's cloud-hosted Places GeoParquet, keeping place IDs, names, categories, addresses, coordinates, release, and source provenance. It does not download or query the global dataset by default.

The Kneaders proposal now loads `overture-places-data.json` and uses the verified count of 36 food-and-drink places within 1 km for its nearby-amenities metric. The snapshot contains three verified sample records and the Overture release/bounding-box metadata.

The OpenStreetMap Overpass adapter is `integrations/osm-overpass.mjs`. It builds bounded read-only queries for amenity, shop, tourism, and leisure POIs, normalizes node/way/relation records with OSM IDs, tags, coordinates, and retrieval metadata, and does not merge OSM counts into Overture automatically.

The Kneaders proposal now has a production-safe OSM contingency snapshot at `osm-overpass-data.json`. It uses Overture first and falls back to the verified Overpass count if the Overture snapshot cannot be loaded; the fallback is not counted together with Overture.

The connected Firebase project is `bidwise-6683d`, using Google sign-in and a production Firestore database in `nam5`. Firestore rules are mirrored in `firestore.rules`.

Without a Firebase config, the app still works locally and image replacements remain in the browser’s local storage.
