import assert from 'node:assert/strict';
import fs from 'node:fs';

const firebase = fs.readFileSync(new URL('../firebase.js', import.meta.url), 'utf8');
const review = fs.readFileSync(new URL('../proposal-review.js', import.meta.url), 'utf8');
const firestoreRules = fs.readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const functions = fs.readFileSync(new URL('../functions/index.js', import.meta.url), 'utf8');

assert.match(firebase, /removeAttribute\('required'\)/, 'Company profile Save must not be blocked by incomplete optional fields');
assert.match(firebase, /let uploadCompanyDocument = null;/, 'The profile form must share the upload helper with Firebase initialization');
assert.match(firebase, /uploadCompanyDocument = async \(file, folder = 'company-documents'\)/, 'Firebase initialization must assign the profile upload helper without block scoping it');
assert.match(firebase, /Saved\. Your profile branding is now applied to Slide 5\./, 'Save must visibly confirm success before the modal closes');
assert.match(firebase, /hideCompanyModal\(\); toast\(/, 'Save must close the modal and then confirm success');
assert.match(firebase, /const usableMedia = \(media, existing\) => media\?\.url \? media : existing \|\| null/, 'A failed upload must not overwrite usable saved media');
assert.match(firebase, /companyLogo: mediaUrl\(profile\.companyLogo\)/, 'Saved logo must be broadcast to proposals');
assert.match(firebase, /companyPhoto: mediaUrl\(profile\.companyPhoto\)/, 'Saved project image must be broadcast to proposals');
assert.match(firebase, /await setDoc\(doc\(db, 'profiles', currentUser\.uid\), savedProfile, \{ merge: true \}\)/, 'Profile saving must use the signed-in Firestore session that powers profile loading');
assert.match(firebase, /verificationStatus: isAdminUser\(currentUser\) \? 'approved' : existing\.verificationStatus \|\| 'pending'/, 'Profile saving must preserve approval state for every signed-in user');
assert.match(firebase, /if \(companyFormNote\) companyFormNote\.textContent = saveError/, 'A rejected save must remain visibly explained in the modal');
assert.match(firestoreRules, /!resource\.data\.keys\(\)\.hasAll\(\['verificationStatus'\]\) && request\.resource\.data\.verificationStatus == 'pending'/, 'Legacy profiles must be able to establish their first pending review status without reading a missing field');
assert.match(firestoreRules, /allow create: if isAdmin\(\) \|\| \(signedIn\(\) && request\.auth\.uid == userId/, 'Signed-in users must be able to create their own profile');
assert.match(firestoreRules, /allow update: if isAdmin\(\) \|\| \(signedIn\(\) && request\.auth\.uid == userId/, 'Signed-in users must be able to update their own profile');
assert.match(firestoreRules, /allow read, write: if signedIn\(\) && \(request\.auth\.uid == userId \|\| isAdmin\(\)\)/, 'Signed-in users must be able to upload their own company media');
assert.match(review, /state\.brand\.companyLogo \? `<img class="review-company-logo"/, 'Slide 5 must render the saved company logo');
assert.match(review, /state\.brand\.companyPhoto\?`<img src="\$\{esc\(state\.brand\.companyPhoto\)\}"/, 'Slide 5 must render the saved project image on the right');

console.log('PASS: company profile save confirmation and Slide 5 branding regression checks');
