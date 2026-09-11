import assert from 'node:assert/strict';
import fs from 'node:fs';

const firebase = fs.readFileSync(new URL('../firebase.js', import.meta.url), 'utf8');
const review = fs.readFileSync(new URL('../proposal-review.js', import.meta.url), 'utf8');

assert.match(firebase, /removeAttribute\('required'\)/, 'Company profile Save must not be blocked by incomplete optional fields');
assert.match(firebase, /Saved\. Your profile branding is now applied to Slide 5\./, 'Save must visibly confirm success before the modal closes');
assert.match(firebase, /hideCompanyModal\(\); toast\(/, 'Save must close the modal and then confirm success');
assert.match(firebase, /const usableMedia = \(media, existing\) => media\?\.url \? media : existing \|\| null/, 'A failed upload must not overwrite usable saved media');
assert.match(firebase, /companyLogo: mediaUrl\(profile\.companyLogo\)/, 'Saved logo must be broadcast to proposals');
assert.match(firebase, /companyPhoto: mediaUrl\(profile\.companyPhoto\)/, 'Saved project image must be broadcast to proposals');
assert.match(review, /state\.brand\.companyLogo \? `<img class="review-company-logo"/, 'Slide 5 must render the saved company logo');
assert.match(review, /state\.brand\.companyPhoto\?`<img src="\$\{esc\(state\.brand\.companyPhoto\)\}"/, 'Slide 5 must render the saved project image on the right');

console.log('PASS: company profile save confirmation and Slide 5 branding regression checks');
