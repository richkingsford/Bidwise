# Kneaders Bakery & Cafe Orem, Utah — EV-only regression checklist

Tested proposal: `?bid=kneaders-orem-ev`  
Source workbook: `1Solar_20260802_40.333002_-111.712338_5.0_3M (2) (1).xlsx`

## Workbook evidence

| Check | Result | Evidence |
| --- | ---: | --- |
| Nearby Tesla ports | PASS | 8 unique charger IDs in `Metadata` for Tesla `Orem, UT` |
| Observed sessions | PASS | 18,713 sessions in `Weekly` |
| Observation window | PASS | 13 weekly periods = 91 days |
| Market visits / day | PASS | 18,713 / 91 = 205.64, presented as roughly 200/day |
| Average session | PASS | Weighted average = 24.07 minutes, presented as approximately 24 minutes |

## Story and calculation evidence

| Required story element | Expected | Regression result |
| --- | ---: | --- |
| Market proof | 200 nearby Tesla visits/day | PASS |
| EVpin utilization | Y1 7.7%; Y3 15.4%; Y5 16.1% | PASS |
| Visits calculation | `Ports × 24 × Utilization ÷ session hours` | PASS |
| Forecast visits | 37 / 74 / 77 per day | PASS |
| Restaurant capture | 30% of 77 = 23 parties/day | PASS |
| Parties per month | 690 | PASS |
| Parties per year | 8,395 | PASS |
| Conservative sales | $12; $276/day; $8,400/month; $100,700/year | PASS |
| Expected sales | $20; $460/day; $14,000/month; $167,900/year | PASS |
| High sales | $30; $690/day; $21,000/month; $251,900/year | PASS |
| Headline annual opportunity | approximately $168,000 | PASS |

## Config and scope evidence

| Check | Result |
| --- | --- |
| EV-only scope | PASS — solar and battery are disabled |
| Editable independent inputs | PASS — ports, session duration, Y1/Y3/Y5 utilization, capture rate, all three receipt cases, days/year |
| Visible dependent formulas | PASS — visits/day, parties/day, daily/monthly/annual restaurant sales |
| Required customer-value story sections | PASS — all four headline values, forecast ramp, observed market proof, capture flow, sales table, source separation |
| Prohibited comparison | PASS — no 10.7% all-nearby-stations comparison |
| Extra EV metrics | PASS — no annual sessions or technical-utilization metric beyond the required Year 1/3/5 forecast table |
| Non-EV report sections | PASS — site, layout, solar, storage, bundles, grid partnership, investment, and economics are hidden for this bid |

## How to rerun

Run the regression test from the project root:

```powershell
& 'C:\Users\rking\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' tests\verify_kneaders_orem_ev_only.py
```

The completed run reports 47 passing checks.
