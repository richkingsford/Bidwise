// Google and passwordless email-link sign-in plus installer-company onboarding for the GetEV workspace.
const firebaseConfig = window.BIDWISE_FIREBASE_CONFIG || {
  apiKey: 'AIzaSyD515NidpwJdAX7utodOaiDIWT4TBd89t4',
  authDomain: 'bidwise-production.firebaseapp.com',
  projectId: 'bidwise-production',
  storageBucket: 'bidwise-production.firebasestorage.app',
  messagingSenderId: '687354188457',
  appId: '1:687354188457:web:b61d5eb5f03420dc1b0fb8',
  measurementId: 'G-XX3K470W2Y'
};
const isLocalFile = window.location.protocol === 'file:';
const authButtons = [document.querySelector('#authButton'), document.querySelector('#homeAuthButton')].filter(Boolean);
const authCtas = [...document.querySelectorAll('[data-auth-cta]')];
const homeCompanyProfileButton = document.querySelector('#companyProfileButton');
let homeAvatarInitials = document.querySelector('#homeAvatarInitials');
if (!homeAvatarInitials) { homeAvatarInitials = document.createElement('button'); homeAvatarInitials.id = 'homeAvatarInitials'; homeAvatarInitials.className = 'avatar'; homeAvatarInitials.type = 'button'; homeAvatarInitials.setAttribute('aria-label', 'Open profile menu'); homeAvatarInitials.hidden = true; document.querySelector('.home-user')?.append(homeAvatarInitials); }
const profileMenu = document.createElement('div');
profileMenu.className = 'profile-menu';
profileMenu.hidden = true;
profileMenu.setAttribute('role', 'menu');
profileMenu.setAttribute('aria-label', 'Account menu');
profileMenu.innerHTML = '<strong id="profileMenuName">Profile</strong><small id="profileMenuEmail"></small><div class="profile-menu-items"><button type="button" role="menuitem" id="profileCompanyButton">Company profile</button><button type="button" role="menuitem" id="profileBulkButton">Bulk proposals</button><button type="button" role="menuitem" id="profileFeedbackButton">Send feedback</button><button type="button" role="menuitem" id="profileSignOut">Sign out</button></div>';
document.body.append(profileMenu);
const profileCompanyButton = profileMenu.querySelector('#profileCompanyButton');
const profileBulkButton = profileMenu.querySelector('#profileBulkButton');
const profileFeedbackButton = profileMenu.querySelector('#profileFeedbackButton');
const profileSignOut = profileMenu.querySelector('#profileSignOut');
const feedbackModal = document.createElement('div');
feedbackModal.className = 'feedback-modal';
feedbackModal.hidden = true;
feedbackModal.innerHTML = '<div class="feedback-modal-card" role="dialog" aria-modal="true" aria-labelledby="feedbackModalTitle"><div class="company-modal-head"><div><div class="home-kicker">GETEV FEEDBACK</div><h2 id="feedbackModalTitle">How can we improve?</h2><p>Tell us what would help you close the next EV charging deal.</p></div><button class="close-edit" type="button" data-feedback-close aria-label="Close feedback">×</button></div><form id="feedbackForm"><label>Feedback<textarea name="message" required maxlength="5000" rows="6" placeholder="What worked, what was confusing, or what should we add?"></textarea></label><label>Email address <span>(optional)</span><input name="email" type="email" maxlength="254" placeholder="you@example.com" /></label><small id="feedbackFormNote">Your feedback will be sent to the GetEV team.</small><div class="feedback-actions"><button type="button" class="secondary-button" data-feedback-close>Cancel</button><button type="submit" class="primary-button">Send feedback</button></div></form></div>';
document.body.append(feedbackModal);
const feedbackForm = feedbackModal.querySelector('#feedbackForm');
const feedbackFormNote = feedbackModal.querySelector('#feedbackFormNote');
const bulkModal = document.createElement('div');
bulkModal.className = 'feedback-modal bulk-proposal-modal'; bulkModal.hidden = true;
bulkModal.innerHTML = '<div class="feedback-modal-card bulk-proposal-card" role="dialog" aria-modal="true" aria-labelledby="bulkProposalTitle"><div class="company-modal-head"><div><div class="home-kicker">BULK PROPOSALS</div><h2 id="bulkProposalTitle">Build a prospect list.</h2><p>Enter a place and radius. We’ll find up to 10 real businesses and create a proposal for each one.</p></div><button class="close-edit" type="button" data-bulk-close aria-label="Close">×</button></div><form id="bulkProposalForm"><div class="bulk-proposal-fields"><label>Location<input name="location" required placeholder="e.g. Orem, UT"></label><label>Radius (miles)<input name="radius" type="number" min="1" max="50" value="5"></label><label>Proposals to generate<input name="count" type="number" min="1" max="10" value="10"></label></div><div class="bulk-proposal-results" id="bulkProposalResults" aria-live="polite">Enter a location to find businesses.</div><div class="feedback-actions"><button type="button" class="secondary-button" data-bulk-close>Cancel</button><button type="submit" class="primary-button" disabled>Generate proposals</button></div></form></div>';
document.body.append(bulkModal);
const bulkForm = bulkModal.querySelector('#bulkProposalForm'); const bulkResults = bulkModal.querySelector('#bulkProposalResults'); const bulkGenerate = bulkForm.querySelector('button[type="submit"]'); let bulkBusinesses = [];
bulkForm.elements.radius.min = '0.1'; bulkForm.elements.radius.step = '0.1';
const closeBulk = () => { bulkModal.hidden = true; };
bulkModal.querySelectorAll('[data-bulk-close]').forEach(button => button.addEventListener('click', closeBulk));
const refreshBulkBusinesses = async () => { const query = String(bulkForm.elements.location.value || '').trim(); const radius = Math.min(50, Math.max(0.1, Number(bulkForm.elements.radius.value) || 5)); bulkGenerate.disabled = true; if (query.length < 2) { bulkResults.textContent = 'Enter a city, neighborhood, or address to find businesses.'; return; } bulkResults.textContent = 'Finding nearby businesses…'; try { const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&namedetails=1&limit=1&countrycodes=us&q=${encodeURIComponent(query)}`, { headers: { accept: 'application/json' } }); const places = geoResponse.ok ? await geoResponse.json() : []; const center = places[0]; if (!center?.lat || !center?.lon) throw new Error('Location not found'); const meters = Math.round(radius * 1609.34); const overpass = `[out:json][timeout:20];(nwr(around:${meters},${center.lat},${center.lon})[name][amenity];nwr(around:${meters},${center.lat},${center.lon})[name][shop];nwr(around:${meters},${center.lat},${center.lon})[name][office];nwr(around:${meters},${center.lat},${center.lon})[name][tourism];);out center 40;`; const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpass)}`, { headers: { accept: 'application/json' } }); const payload = response.ok ? await response.json() : { elements: [] }; const seen = new Set(); bulkBusinesses = (payload.elements || []).map(item => { const tags = item.tags || {}; const point = item.type === 'node' ? { lat: item.lat, lon: item.lon } : item.center || {}; return { name: tags.name, display_name: [tags.name, [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '), tags['addr:city'], tags['addr:state'], tags['addr:postcode']].filter(Boolean).join(', '), lat: point.lat, lon: point.lon, address: { house_number: tags['addr:housenumber'], road: tags['addr:street'], city: tags['addr:city'], state: tags['addr:state'], state_code: tags['addr:state'], postcode: tags['addr:postcode'] } }; }).filter(item => item.name && !seen.has(item.name.toLowerCase()) && seen.add(item.name.toLowerCase())).slice(0, 10); bulkResults.innerHTML = bulkBusinesses.length ? `<strong>${bulkBusinesses.length} real businesses found within about ${radius} miles</strong><ul>${bulkBusinesses.map(item => `<li>${String(item.display_name || item.name).replace(/[&<>]/g, '')}</li>`).join('')}</ul>` : 'No named businesses found in that radius. Try a nearby city or increase the radius.'; bulkGenerate.disabled = !bulkBusinesses.length; } catch { bulkBusinesses = []; bulkResults.textContent = 'We could not find businesses there. Try a city and state, such as “Orem, UT”, or increase the radius.'; } };
let bulkTimer; ['location', 'radius'].forEach(name => bulkForm.elements[name].addEventListener('input', () => { clearTimeout(bulkTimer); bulkTimer = setTimeout(refreshBulkBusinesses, 350); }));
bulkForm.elements.count.addEventListener('input', () => { bulkForm.elements.count.value = Math.min(10, Math.max(1, Number(bulkForm.elements.count.value) || 1)); });
bulkForm.addEventListener('submit', event => { event.preventDefault(); const count = Math.min(10, Math.max(1, Number(bulkForm.elements.count.value) || 1)); window.dispatchEvent(new CustomEvent('getev:bulk-proposals', { detail: { businesses: bulkBusinesses.slice(0, count), radius: Number(bulkForm.elements.radius.value) || 5 } })); closeBulk(); });
const companyModal = document.querySelector('#companyModal');
const companyForm = document.querySelector('#companyForm');
const companyFormNote = document.querySelector('#companyFormNote');
const companySignInButton = document.querySelector('#companySignInButton');
const gateGoogleSignInButton = document.querySelector('#gateGoogleSignInButton');
const gateEmailSignInButton = document.querySelector('#gateEmailSignInButton');
const emailAuthAddress = document.querySelector('#emailAuthAddress');
const emailLinkButton = document.querySelector('#emailLinkButton');
const emailAuthNote = document.querySelector('#emailAuthNote');
const emailAltcha = document.querySelector('#emailAltcha');
const emailAuthPanel = document.querySelector('.email-auth-panel');
// Authentication belongs to the access gate, not the independent company-profile form.
const accessGateCard = document.querySelector('#accessGate .access-gate-card');
if (accessGateCard && companySignInButton) accessGateCard.append(companySignInButton);
if (accessGateCard && emailAuthPanel) accessGateCard.append(emailAuthPanel);
const adminModal = document.querySelector('#adminModal');
const adminProfilesList = document.querySelector('#adminProfilesList');
const adminButton = document.createElement('button');
adminButton.className = 'auth-button';
adminButton.type = 'button';
adminButton.textContent = 'Data Sources';
adminButton.hidden = true;
document.querySelector('.home-user')?.prepend(adminButton);
const ADMIN_EMAILS = new Set(['richkingsford@gmail.com', 'mckselph@gmail.com']);
const toast = message => { const node = document.querySelector('#toast'); if (!node) return; node.textContent = message; node.classList.add('show'); setTimeout(() => node.classList.remove('show'), 3200); };
let currentUser = null;
let currentProfile = null;
let saveCompanyProfile = null;
let loadAdminProfiles = null;

const isAdminUser = user => ADMIN_EMAILS.has(user?.email?.toLowerCase());
const isAdminRoute = new URLSearchParams(window.location.search).get('admin') === 'sources' && !new URLSearchParams(window.location.search).has('bid');
document.body.classList.toggle('admin-route', isAdminRoute);
const isPublicProposalUrl = Boolean(new URLSearchParams(window.location.search).get('bid'));
const hasWorkspaceAccess = user => Boolean(user) || isPublicProposalUrl;

const setIdentity = (user, profile = currentProfile) => {
  document.body.classList.remove('auth-pending');
  const publicVisitor = isPublicProposalUrl && !user;
  const canonicalProposal = document.body.classList.contains('canonical-proposal') || (isPublicProposalUrl && !new URLSearchParams(window.location.search).has('copy'));
  document.body.classList.toggle('public-proposal', publicVisitor);
  document.body.classList.toggle('view-only', publicVisitor || canonicalProposal);
  if (publicVisitor || canonicalProposal) document.body.classList.remove('edit-mode');
  const displayName = profile?.companyName || user?.displayName || user?.email?.split('@')[0] || 'Proposal team';
  const contactName = profile?.contactName || user?.displayName || user?.email?.split('@')[0] || 'Proposal team';
  const firstName = contactName.split(' ')[0];
  const initials = contactName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';
  document.querySelector('#workspaceAuthor')?.replaceChildren(document.createTextNode(user ? displayName : 'Sign in to personalize'));
  document.querySelector('#authorName')?.replaceChildren(document.createTextNode(user ? contactName : 'Proposal team'));
  document.querySelectorAll('.bid-owner').forEach(node => { node.textContent = user ? contactName : 'Proposal team'; });
  const avatar = document.querySelector('#avatarInitials'); if (avatar) { avatar.textContent = initials; avatar.title = user?.email || 'Not signed in'; avatar.hidden = !user; }
  if (homeAvatarInitials) { homeAvatarInitials.textContent = initials; homeAvatarInitials.hidden = !user; }
   authButtons.forEach(button => { button.hidden = Boolean(user); if (!user) button.textContent = 'Sign in'; });
  document.querySelector('#profileMenuName')?.replaceChildren(document.createTextNode(displayName)); document.querySelector('#profileMenuEmail')?.replaceChildren(document.createTextNode(user?.email || ''));
  if (homeCompanyProfileButton) homeCompanyProfileButton.hidden = true;
  adminButton.hidden = !isAdminUser(user);
  document.body.classList.toggle('home-authenticated', Boolean(user));
  document.body.classList.toggle('home-registered', hasWorkspaceAccess(user, profile));
  document.body.classList.toggle('access-granted', hasWorkspaceAccess(user, profile));
  document.body.classList.toggle('admin-user', isAdminUser(user));
  window.dispatchEvent(new CustomEvent('getev:identity', { detail: { email: user?.email || '', isAdmin: isAdminUser(user) } }));
  const gateTitle = document.querySelector('#accessGateTitle');
  const gateCopy = document.querySelector('#accessGate p');
  if (!user) {
    if (gateTitle) gateTitle.textContent = 'Your proposals are inside.';
     if (gateCopy) gateCopy.textContent = 'Sign in to access the active bid workspace.';
  }
  if (profile?.companyName) {
    const branding = { companyName: profile.companyName, tagline: profile.tagline || '', proposalSlogan: profile.proposalSlogan || '', proposalCertifications: profile.proposalCertifications || '', companyLogo: profile.companyLogo?.url || '', companyPhoto: profile.companyPhoto?.url || '' };
    try { localStorage.setItem('GetEV-company-branding', JSON.stringify(branding)); } catch { /* Storage can be unavailable in privacy-restricted sessions. */ }
    window.dispatchEvent(new CustomEvent('getev:company-branding', { detail: branding }));
  }
};

const showCompanyModal = (user, profile = {}) => {
  if (!companyModal || !companyForm) return;
  companyForm.elements.companyName.value = profile.companyName || '';
  companyForm.elements.contactName.value = profile.contactName || user?.displayName || '';
  companyForm.elements.email.value = profile.businessEmail || user?.email || '';
  if (emailAuthAddress) emailAuthAddress.value = user?.email || '';
  companyForm.elements.territory.value = profile.territory || '';
  companyForm.elements.website.value = profile.website || '';
  companyForm.elements.tagline.value = profile.tagline || '';
  companyForm.elements.proposalSlogan.value = profile.proposalSlogan || '';
  companyForm.elements.proposalCertifications.value = profile.proposalCertifications || '';
  if (companyForm.elements.insuranceDocument) companyForm.elements.insuranceDocument.required = false;
  if (companyForm.elements.contractorCertification) companyForm.elements.contractorCertification.required = false;
  ['solar', 'storage', 'ev'].forEach(key => { companyForm.elements[key].checked = Boolean(profile.services?.[key]); });
  companyForm.querySelector('button[type="submit"]').textContent = profile.companyName ? 'Save company profile' : 'Create company profile';
  if (companySignInButton) companySignInButton.hidden = Boolean(user);
  const submitButton = companyForm.querySelector('button[type="submit"]');
  if (submitButton) submitButton.hidden = !user;
  if (companyFormNote) companyFormNote.textContent = user ? 'Add whatever details you have now. You can finish the profile later; missing details will use sensible defaults.' : 'Verify your email address above before completing the company profile.';
  companyModal.hidden = false;
  (user ? companyForm.elements.companyName : companySignInButton)?.focus();
};
const hideCompanyModal = () => { if (companyModal) companyModal.hidden = true; };

if (firebaseConfig && !isLocalFile) {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
   const { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, setPersistence, browserLocalPersistence, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
  const { getFirestore, doc, getDoc, setDoc, getDocs, collection, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
  const { getStorage, ref, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const provider = new GoogleAuthProvider();
  const uploadCompanyDocument = async (file, folder = 'company-documents') => { if (!file) return null; const metadata = { name: file.name, type: file.type, size: file.size }; try { const safeName = file.name.replace(/[^a-z0-9._-]+/gi, '-'); const target = ref(storage, `${folder}/${currentUser.uid}/${Date.now()}-${safeName}`); const uploaded = await uploadBytes(target, file, { contentType: file.type }); return { ...metadata, url: await getDownloadURL(uploaded.ref), storageStatus: 'stored' }; } catch (error) { console.warn('GetEV document storage pending', error); return { ...metadata, storageStatus: 'pending-storage-setup' }; } };
  try { await setPersistence(auth, browserLocalPersistence); } catch (error) { console.warn('GetEV auth persistence fallback', error); }

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
  const renderAdminProfiles = profiles => {
    if (!adminProfilesList) return;
    if (!profiles.length) { adminProfilesList.innerHTML = '<p class="admin-empty">No company registrations yet.</p>'; return; }
    adminProfilesList.innerHTML = profiles.map(profile => `<article class="admin-profile"><div><strong>${escapeHtml(profile.companyName || 'Unnamed company')}</strong><span>${escapeHtml(profile.businessEmail || profile.email || 'No email')} · ${escapeHtml(profile.territory || 'Territory not provided')}</span><small>${escapeHtml(Object.entries(profile.services || {}).filter(([, enabled]) => enabled).map(([key]) => key === 'storage' ? 'Battery storage' : key === 'ev' ? 'EV charging' : 'Solar').join(' · ') || 'No services selected')}</small></div><div class="admin-profile-actions"><span class="admin-status ${escapeHtml(profile.verificationStatus || 'pending')}">${escapeHtml(profile.verificationStatus || 'pending')}</span><button type="button" data-admin-status="approved" data-profile-id="${escapeHtml(profile.id)}">Approve</button><button type="button" data-admin-status="rejected" data-profile-id="${escapeHtml(profile.id)}">Reject</button></div></article>`).join('');
    adminProfilesList.querySelectorAll('[data-admin-status]').forEach(button => button.addEventListener('click', async () => {
      button.disabled = true;
      try { await setDoc(doc(db, 'profiles', button.dataset.profileId), { verificationStatus: button.dataset.adminStatus, reviewedBy: currentUser.email, reviewedAt: serverTimestamp() }, { merge: true }); await loadAdminProfiles(); toast(`Company ${button.dataset.adminStatus}.`); } catch (error) { console.error('GetEV admin update error', error); toast('Could not update company approval.'); } finally { button.disabled = false; }
    }));
  };
  loadAdminProfiles = async () => {
    if (!isAdminUser(currentUser)) return;
    const snapshot = await getDocs(collection(db, 'profiles'));
    renderAdminProfiles(snapshot.docs.map(item => ({ id: item.id, ...item.data() })));
  };

   const explainAuthError = error => {
     console.error('GetEV sign-in error', error);
    if (error?.code === 'auth/unauthorized-domain') {
      toast('This site is not authorized in Firebase yet. Add get-ev.io under Authentication → Settings → Authorized domains.');
      return;
    }
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/operation-not-supported-in-this-environment') {
      toast('Opening Google sign-in in this tab…');
      return;
    }
     if (error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') toast(`Sign-in failed${error?.code ? ` (${error.code})` : ''}. Please try again.`);
   };

   const emailLinkSettings = { url: `${window.location.origin}${window.location.pathname}`, handleCodeInApp: true };
   const altchaVerifyUrl = 'https://us-central1-bidwise-production.cloudfunctions.net/altchaVerify';
   const getAltchaPayload = () => companyForm?.querySelector('input[name="altcha"]')?.value || '';
   const ensureAltchaVerified = async () => {
     await customElements.whenDefined('altcha-widget');
     return new Promise((resolve, reject) => {
     if (!emailAltcha) return reject(new Error('Human verification is unavailable.'));
     const existingPayload = getAltchaPayload();
     if (existingPayload) return resolve(existingPayload);
     let timer;
     const finish = (callback, value) => { clearTimeout(timer); emailAltcha.removeEventListener('statechange', onStateChange); callback(value); };
     const onStateChange = event => {
       const state = event.detail?.state;
       if (state === 'verified') finish(resolve, getAltchaPayload());
       if (state === 'error') finish(reject, new Error('Human verification failed.'));
     };
     emailAltcha.addEventListener('statechange', onStateChange);
     timer = setTimeout(() => finish(reject, new Error('Human verification timed out.')), 120000);
     try { emailAltcha.verify(); } catch (error) { finish(reject, error); }
     });
   };
   const sendEmailLink = async () => {
     const email = String(emailAuthAddress?.value || '').trim().toLowerCase();
     if (!/^\S+@\S+\.\S+$/.test(email)) { emailAuthAddress?.focus(); if (emailAuthNote) emailAuthNote.textContent = 'Enter a valid email address to receive your secure sign-in link.'; return; }
     if (!emailLinkButton) return;
     emailLinkButton.disabled = true; emailLinkButton.textContent = 'Sending…';
     try { if (emailAuthNote) emailAuthNote.textContent = 'Complete the quick human verification, then we’ll send your link.'; const altchaPayload = await ensureAltchaVerified(); const verification = await fetch(altchaVerifyUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload: altchaPayload }) }); const verificationResult = await verification.json().catch(() => ({})); if (!verification.ok || !verificationResult.verified) throw new Error('Human verification was not accepted.'); await sendSignInLinkToEmail(auth, email, emailLinkSettings); localStorage.setItem('getev-email-for-signin', email); if (emailAuthNote) emailAuthNote.textContent = `Check ${email} for your secure sign-in link. You can close this window.`; toast('Sign-in link sent. Check your email.'); }
     catch (error) { explainAuthError(error); if (emailAuthNote) emailAuthNote.textContent = 'We could not send the sign-in link. Check the address and try again.'; }
     finally { emailLinkButton.disabled = false; emailLinkButton.textContent = 'Email me a sign-in link'; }
   };

  const loadCompanyProfile = async user => {
    try {
      const snapshot = await getDoc(doc(db, 'profiles', user.uid));
      currentProfile = snapshot.exists() ? snapshot.data() : null;
      if (isAdminUser(user) && currentProfile) {
        currentProfile = { ...currentProfile, role: 'admin', verificationStatus: 'approved' };
        await setDoc(doc(db, 'profiles', user.uid), currentProfile, { merge: true });
      }
    } catch (error) {
      console.error('GetEV company profile load error', error);
      currentProfile = null;
      toast('We could not find a company profile yet. You can create one now.');
    }
    setIdentity(user, currentProfile);
    if (!currentProfile?.companyName) toast('You are signed in. Add your company profile anytime from your profile menu.');
  };

  saveCompanyProfile = async profile => {
    if (!currentUser) return;
    const verificationStatus = isAdminUser(currentUser) ? 'approved' : currentProfile?.verificationStatus || 'pending';
    await setDoc(doc(db, 'profiles', currentUser.uid), { ...profile, email: currentUser.email, role: isAdminUser(currentUser) ? 'admin' : currentProfile?.role || 'member', verificationStatus, updatedAt: serverTimestamp() }, { merge: true });
    currentProfile = { ...currentProfile, ...profile, email: currentUser.email, role: isAdminUser(currentUser) ? 'admin' : currentProfile?.role || 'member', verificationStatus };
    setIdentity(currentUser, currentProfile);
    hideCompanyModal();
    toast(isAdminUser(currentUser) ? 'Admin company profile saved.' : 'Company profile saved. Your registration is pending review.');
  };

  onAuthStateChanged(auth, async user => {
    currentUser = user;
    currentProfile = null;
    if (!user) { hideCompanyModal(); setIdentity(null); document.body.classList.add('auth-ready'); return; }
     if (!user.email) { await signOut(auth); toast('Choose an account with an email address to continue.'); return; }
    setIdentity(user);
    try {
      await loadCompanyProfile(user);
    } catch (error) {
      console.error('GetEV company profile load error', error);
      // Keep onboarding available even if a profile read is temporarily unavailable.
      // The explicit code makes Firebase configuration failures diagnosable instead of
      // presenting a generic "registration form" failure.
      setIdentity(user, null);
      const code = error?.code?.replace(/^firestore\//, '') || 'unavailable';
      toast(`Signed in. Your company profile could not be loaded (${code}), but the workspace is available.`);
    } finally { document.body.classList.add('auth-ready'); }
  });

  const startSignIn = async () => {
    try {
       if (currentUser) { showCompanyModal(currentUser, currentProfile || {}); return; }
       showCompanyModal(null);
    } catch (error) {
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/operation-not-supported-in-this-environment') {
        try { await signInWithRedirect(auth, provider); return; } catch (redirectError) { explainAuthError(redirectError); return; }
      }
      explainAuthError(error);
    }
  };
  authButtons.forEach(button => button.addEventListener('click', startSignIn));
  // Attach directly so the visible CTA retains the browser's user gesture.
  authCtas.forEach(button => button.addEventListener('click', () => {
    if (currentUser) showCompanyModal(currentUser, currentProfile || {});
    else startSignIn();
  }));
  const continueWithGoogle = async () => { try { await signInWithPopup(auth, provider); } catch (error) { if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/operation-not-supported-in-this-environment') { try { await signInWithRedirect(auth, provider); return; } catch (redirectError) { explainAuthError(redirectError); return; } } explainAuthError(error); } };
  [companySignInButton, gateGoogleSignInButton].filter(Boolean).forEach(button => button.addEventListener('click', continueWithGoogle));
  gateEmailSignInButton?.addEventListener('click', () => { window.setTimeout(() => emailAuthAddress?.focus(), 0); });
   emailLinkButton?.addEventListener('click', sendEmailLink);
  [document.querySelector('#avatarInitials'), homeAvatarInitials].filter(Boolean).forEach(button => button.addEventListener('click', () => { if (profileMenu) profileMenu.hidden = !profileMenu.hidden; }));
  const showFeedbackModal = () => { profileMenu.hidden = true; feedbackModal.hidden = false; feedbackForm?.reset(); feedbackForm?.querySelector('textarea')?.focus(); };
profileCompanyButton?.addEventListener('click', () => { profileMenu.hidden = true; showCompanyModal(currentUser, currentProfile || {}); });
profileBulkButton?.addEventListener('click', () => { profileMenu.hidden = true; bulkModal.hidden = false; bulkForm.elements.location.focus(); });
  profileFeedbackButton?.addEventListener('click', showFeedbackModal);
  profileSignOut?.addEventListener('click', async () => {
    profileMenu.hidden = true;
    try {
      await signOut(auth);
      // A signed-out user should always land on the public workspace home, never
      // remain on a private proposal or admin route from their previous session.
      window.location.assign(new URL('./', window.location.href).href);
    } catch (error) {
      explainAuthError(error);
    }
  });
  feedbackModal.querySelectorAll('[data-feedback-close]').forEach(button => button.addEventListener('click', () => { feedbackModal.hidden = true; }));
  feedbackModal.addEventListener('click', event => { if (event.target === feedbackModal) feedbackModal.hidden = true; });
  feedbackForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!currentUser) { feedbackFormNote.textContent = 'Please sign in before sending feedback.'; return; }
    const submit = feedbackForm.querySelector('button[type="submit"]'); const data = new FormData(feedbackForm); const message = String(data.get('message') || '').trim(); const email = String(data.get('email') || '').trim();
    if (!message) { feedbackFormNote.textContent = 'Tell us what you would like us to improve.'; return; }
    submit.disabled = true; submit.textContent = 'Sending…'; feedbackFormNote.textContent = 'Sending your feedback…';
    try { const token = await currentUser.getIdToken(); const response = await fetch('https://us-central1-bidwise-production.cloudfunctions.net/submitFeedback', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ message, email }) }); const result = await response.json().catch(() => ({})); if (!response.ok) throw new Error(result.error || 'Feedback could not be sent.'); feedbackFormNote.textContent = 'Success — your feedback was sent to the GetEV team.'; feedbackForm.reset(); setTimeout(() => { feedbackModal.hidden = true; }, 1400); } catch (error) { console.error('GetEV feedback error', error); feedbackFormNote.textContent = 'We could not send feedback right now. Please try again.'; } finally { submit.disabled = false; submit.textContent = 'Send feedback'; }
  });
  // Recover redirect results without blocking the initial sign-in controls.
   void getRedirectResult(auth).then(async redirectResult => {
    if (redirectResult?.user && currentUser?.uid !== redirectResult.user.uid) {
      currentUser = redirectResult.user;
      await loadCompanyProfile(redirectResult.user);
    }
   }).catch(explainAuthError);
   if (isSignInWithEmailLink(auth, window.location.href)) {
     const savedEmail = localStorage.getItem('getev-email-for-signin');
     const email = savedEmail || window.prompt('Confirm your email address to finish signing in:');
     if (email) void signInWithEmailLink(auth, email.trim(), window.location.href).then(() => { localStorage.removeItem('getev-email-for-signin'); const cleanUrl = new URL(window.location.href); cleanUrl.searchParams.delete('apiKey'); cleanUrl.searchParams.delete('oobCode'); cleanUrl.searchParams.delete('mode'); cleanUrl.searchParams.delete('lang'); window.history.replaceState({}, document.title, cleanUrl.toString()); }).catch(explainAuthError);
   }
} else {
  setIdentity(null);
   const localMessage = isLocalFile ? 'Email and Google sign-in are available on the hosted GetEV site.' : 'Sign-in is not configured for this workspace yet.';
  authButtons.forEach(button => button.addEventListener('click', () => toast(localMessage)));
  authCtas.forEach(button => button.addEventListener('click', () => toast(localMessage)));
};

adminButton.addEventListener('click', async () => {
  if (!isAdminUser(currentUser) || !adminModal) return;
  const adminUrl = new URL(window.location.href); adminUrl.searchParams.set('admin', 'sources'); window.location.assign(adminUrl.toString());
});
document.querySelector('#closeAdminModal')?.addEventListener('click', () => { adminModal.hidden = true; });
adminModal?.addEventListener('click', event => { if (event.target === adminModal) adminModal.hidden = true; });
document.querySelector('#closeCompanyModal')?.addEventListener('click', hideCompanyModal);
companyModal?.addEventListener('click', event => { if (event.target === companyModal) hideCompanyModal(); });
companyForm?.addEventListener('submit', async event => {
  event.preventDefault();
   if (!currentUser) { toast('Verify your email or continue with Google before creating your company profile.'); return; }
  const form = new FormData(companyForm);
  // Profile fields are intentionally optional: keep the save action useful even when
  // a new installer only has a name. Use realistic defaults until they finish setup.
  const companyName = String(form.get('companyName') || '').trim() || currentProfile?.companyName || 'Your Energy Company';
  const contactName = String(form.get('contactName') || '').trim() || currentProfile?.contactName || currentUser.displayName || 'Project team';
  const businessEmail = String(form.get('email') || '').trim() || currentProfile?.businessEmail || currentUser.email || 'team@yourenergycompany.com';
  const territory = String(form.get('territory') || '').trim() || currentProfile?.territory || 'Your service territory';
  const services = { solar: form.get('solar') === 'on', storage: form.get('storage') === 'on', ev: form.get('ev') === 'on' };
  if (!Object.values(services).some(Boolean)) services.ev = true;
  const insuranceFile = companyForm.elements.insuranceDocument?.files?.[0]; const contractorFile = companyForm.elements.contractorCertification?.files?.[0]; const logoFile = companyForm.elements.companyLogo?.files?.[0]; const photoFile = companyForm.elements.companyPhoto?.files?.[0];
  if (logoFile && (!logoFile.type.startsWith('image/') || logoFile.size > 5 * 1024 * 1024)) { toast('Choose an image logo up to 5 MB.'); return; }
  const submit = companyForm.querySelector('button[type="submit"]'); submit.disabled = true; submit.textContent = 'Saving…';
  try { const [insuranceDocument, contractorCertification, companyLogo, companyPhoto] = await Promise.all([uploadCompanyDocument(insuranceFile), uploadCompanyDocument(contractorFile), uploadCompanyDocument(logoFile, 'company-logos'), uploadCompanyDocument(photoFile, 'company-photos')]); const certificationDocuments = []; for (const file of [...(companyForm.elements.certificationDocuments?.files || [])]) certificationDocuments.push(await uploadCompanyDocument(file)); const pendingStorage = [insuranceDocument, contractorCertification, companyLogo, companyPhoto, ...certificationDocuments].some(document => document?.storageStatus === 'pending-storage-setup'); if (typeof saveCompanyProfile !== 'function') throw new Error('Profile storage is not ready. Refresh the page and try again.'); await saveCompanyProfile({ companyName, tagline: String(form.get('tagline') || '').trim(), proposalSlogan: String(form.get('proposalSlogan') || '').trim(), contactName, businessEmail, territory, website: String(form.get('website') || '').trim(), services, proposalCertifications: String(form.get('proposalCertifications') || '').trim(), companyLogo: companyLogo || currentProfile?.companyLogo || null, companyPhoto: companyPhoto || currentProfile?.companyPhoto || null, insuranceDocument: insuranceDocument || currentProfile?.insuranceDocument || null, contractorCertification: contractorCertification || currentProfile?.contractorCertification || null, certificationDocuments: certificationDocuments.length ? certificationDocuments : currentProfile?.certificationDocuments || [], documentStorageStatus: pendingStorage ? 'pending-storage-setup' : 'stored' }); if (pendingStorage) toast('Profile saved. Documents are recorded and awaiting secure file storage setup.'); } catch (error) { console.error('GetEV company profile save error', error); toast(`Could not save your company profile${error?.code ? ` (${error.code})` : ''}. Please try again.`); } finally { submit.disabled = false; submit.textContent = currentProfile?.companyName ? 'Save company profile' : 'Create company profile'; }
});
