# GetEV architecture notes

## Dashboard cards

Proposal cards are a compact decision surface, not a miniature copy of the proposal.

- Display status once: the top-left badge.
- Display the proposal owner once: the top-right field.
- Display exactly three distinct, decision-useful summary metrics below the scope chips.
- Never repeat status, scope, ownership, or an underlying metric in another card field.
- Keep cards neutral at rest. The blue border, lift, and shadow are reserved for deliberate hover/focus interaction.

Current summaries use only decision-relevant outputs: market proof, projected visits, annual sales opportunity, capacity, storage, investment, production, estimated offset, and peak shave. A card may not use `Status` as a metric.

## Proposal card data

`proposal-cards.json` is the source of truth for proposal card content and ordering. It contains dashboard cards plus the EV report card collections for location metrics, site snapshot scores, spending cases, charging revenue, and operating expenses. Each card definition owns its label, order, target value, and supporting copy; calculated values continue to come from the live proposal state unless a JSON value override is supplied.

Maps, aerial imagery, logos, and other interactive visual components remain isolated custom renderers. Their surrounding card keys can be defined in the JSON registry without moving the component-specific implementation into the data file.
