import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../proposal-review.js', import.meta.url), 'utf8');
const heading = 'HOW THE DAILY CHARGING REVENUE COULD FLOW';
assert.equal((source.match(new RegExp(heading, 'g')) || []).length, 2, 'Slide 7 must have one heading template plus one dedupe guard');
assert.match(source, /dailyHeadingSeen/, 'Slide 7 must guard against duplicate daily-revenue headings at render time');
assert.match(source, /Charging income \/ port \/ month/, 'Slide 7 must retain the per-port income connection to Slide 4');
assert.match(source, /Host share \/ port \/ month/, 'Slide 7 must retain the host-share explanation');
console.log('PASS: Slide 7 duplicate-heading and cross-slide economics regression checks');
