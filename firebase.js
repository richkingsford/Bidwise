// Google sign-in plus installer-company onboarding for the Bidwise workspace.
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
const authButtons = [document.querySelector('#authButton'), document.querySelector('#homeAuthButton'), document.querySelector('#gateAuthButton')].filter(Boolean);
const authCtas = [...document.querySelectorAll('[data-auth-cta]')];
const companyProfileButton = document.querySelector('#companyProfileButton');
const companyModal = document.querySelector('#companyModal');
const companyForm = document.querySelector('#companyForm');
const companySignInButton = document.querySelector('#companySignInButton');
const adminModal = document.querySelector('#adminModal');
const adminProfilesList = document.querySelector('#adminProfilesList');
const adminButton = document.createElement('button');
adminButton.className = 'auth-button';
adminButton.type = 'button';
adminButton.textContent = 'Admin';
adminButton.hidden = true;
document.querySelector('.home-user')?.prepend(adminButton);
const ADMIN_EMAIL = 'richkingsford@gmail.com';
const toast = message => { const node = document.querySelector('#toast'); if (!node) return; node.textContent = message; node.classList.add('show'); setTimeout(() => node.classList.remove('show'), 3200); };
let currentUser = null;
let currentProfile = null;
let saveCompanyProfile = null;
let loadAdminProfiles = null;

const isAdminUser = user => user?.email?.toLowerCase() === ADMIN_EMAIL;
const hasWorkspaceAccess = (user, profile) => Boolean(user && (isAdminUser(user) || profile?.verificationStatus === 'approved'));

const setIdentity = (user, profile = currentProfile) => {
  const displayName = profile?.companyName || user?.displayName || user?.email?.split('@')[0] || 'Proposal team';
  const contactName = profile?.contactName || user?.displayName || user?.email?.split('@')[0] || 'Proposal team';
  const firstName = contactName.split(' ')[0];
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';
  document.querySelector('#workspaceAuthor')?.replaceChildren(document.createTextNode(user ? displayName : 'Sign in to personalize'));
  document.querySelector('#authorName')?.replaceChildren(document.createTextNode(user ? contactName : 'Proposal team'));
  const avatar = document.querySelector('#avatarInitials'); if (avatar) { avatar.textContent = initials; avatar.title = user?.email || 'Not signed in'; }
  authButtons.forEach(button => { button.textContent = user ? `Sign out · ${firstName}` : 'Sign in with Google'; });
  if (companyProfileButton) companyProfileButton.hidden = !user;
  adminButton.hidden = !isAdminUser(user);
  document.body.classList.toggle('home-authenticated', Boolean(user));
  document.body.classList.toggle('home-registered', hasWorkspaceAccess(user, profile) && Boolean(profile?.companyName));
  document.body.classList.toggle('access-granted', hasWorkspaceAccess(user, profile));
  document.body.classList.toggle('admin-user', isAdminUser(user));
};

const showCompanyModal = (user, profile = {}) => {
  if (!companyModal || !companyForm) return;
  companyForm.elements.companyName.value = profile.companyName || '';
  companyForm.elements.contactName.value = profile.contactName || user?.displayName || '';
  companyForm.elements.email.value = profile.businessEmail || user?.email || '';
  companyForm.elements.territory.value = profile.territory || '';
  companyForm.elements.website.value = profile.website || '';
  ['solar', 'storage', 'ev'].forEach(key => { companyForm.elements[key].checked = Boolean(profile.services?.[key]); });
  companyForm.querySelector('button[type="submit"]').textContent = profile.companyName ? 'Save company profile' : 'Create company profile';
  if (companySignInButton) companySignInButton.hidden = Boolean(user);
  const submitButton = companyForm.querySelector('button[type="submit"]');
  if (submitButton) submitButton.hidden = !user;
  companyModal.hidden = false;
  (user ? companyForm.elements.companyName : companySignInButton)?.focus();
};
const hideCompanyModal = () => { if (companyModal) companyModal.hidden = true; };

if (firebaseConfig && !isLocalFile) {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
  const { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, setPersistence, browserLocalPersistence, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
  const { getFirestore, doc, getDoc, setDoc, getDocs, collection, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();
  try { await setPersistence(auth, browserLocalPersistence); } catch (error) { console.warn('Bidwise auth persistence fallback', error); }

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
  const renderAdminProfiles = profiles => {
    if (!adminProfilesList) return;
    if (!profiles.length) { adminProfilesList.innerHTML = '<p class="admin-empty">No company registrations yet.</p>'; return; }
    adminProfilesList.innerHTML = profiles.map(profile => `<article class="admin-profile"><div><strong>${escapeHtml(profile.companyName || 'Unnamed company')}</strong><span>${escapeHtml(profile.businessEmail || profile.email || 'No email')} · ${escapeHtml(profile.territory || 'Territory not provided')}</span><small>${escapeHtml(Object.entries(profile.services || {}).filter(([, enabled]) => enabled).map(([key]) => key === 'storage' ? 'Battery storage' : key === 'ev' ? 'EV charging' : 'Solar').join(' · ') || 'No services selected')}</small></div><div class="admin-profile-actions"><span class="admin-status ${escapeHtml(profile.verificationStatus || 'pending')}">${escapeHtml(profile.verificationStatus || 'pending')}</span><button type="button" data-admin-status="approved" data-profile-id="${escapeHtml(profile.id)}">Approve</button><button type="button" data-admin-status="rejected" data-profile-id="${escapeHtml(profile.id)}">Reject</button></div></article>`).join('');
    adminProfilesList.querySelectorAll('[data-admin-status]').forEach(button => button.addEventListener('click', async () => {
      button.disabled = true;
      try { await setDoc(doc(db, 'profiles', button.dataset.profileId), { verificationStatus: button.dataset.adminStatus, reviewedBy: currentUser.email, reviewedAt: serverTimestamp() }, { merge: true }); await loadAdminProfiles(); toast(`Company ${button.dataset.adminStatus}.`); } catch (error) { console.error('Bidwise admin update error', error); toast('Could not update company approval.'); } finally { button.disabled = false; }
    }));
  };
  loadAdminProfiles = async () => {
    if (!isAdminUser(currentUser)) return;
    const snapshot = await getDocs(collection(db, 'profiles'));
    renderAdminProfiles(snapshot.docs.map(item => ({ id: item.id, ...item.data() })));
  };

  const explainAuthError = error => {
    console.error('Bidwise Google sign-in error', error);
    if (error?.code === 'auth/unauthorized-domain') {
      toast('This site is not authorized in Firebase yet. Add richkingsford.github.io under Authentication → Settings → Authorized domains.');
      return;
    }
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/operation-not-supported-in-this-environment') {
      toast('Opening Google sign-in in this tab…');
      return;
    }
    if (error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') toast(`Google sign-in failed${error?.code ? ` (${error.code})` : ''}. Please try again.`);
  };

  const loadCompanyProfile = async user => {
    const snapshot = await getDoc(doc(db, 'profiles', user.uid));
    currentProfile = snapshot.exists() ? snapshot.data() : null;
    if (isAdminUser(user) && currentProfile) {
      currentProfile = { ...currentProfile, role: 'admin', verificationStatus: 'approved' };
      await setDoc(doc(db, 'profiles', user.uid), currentProfile, { merge: true });
    }
    setIdentity(user, currentProfile);
    if (!currentProfile?.companyName) showCompanyModal(user);
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
    if (!user) { hideCompanyModal(); setIdentity(null); return; }
    if (!user.email?.toLowerCase().endsWith('@gmail.com')) { await signOut(auth); toast('Please use a Gmail address to access Bidwise.'); return; }
    setIdentity(user);
    try {
      await loadCompanyProfile(user);
    } catch (error) {
      console.error('Bidwise company profile load error', error);
      // Keep onboarding available even if a profile read is temporarily unavailable.
      // The explicit code makes Firebase configuration failures diagnosable instead of
      // presenting a generic "registration form" failure.
      setIdentity(user, null);
      showCompanyModal(user);
      const code = error?.code?.replace(/^firestore\//, '') || 'unavailable';
      toast(`Signed in, but registration needs attention (${code}).`);
    }
  });

  try { await getRedirectResult(auth); } catch (error) { explainAuthError(error); }

  const startSignIn = async () => {
    try {
      if (currentUser) { showCompanyModal(currentUser, currentProfile || {}); return; }
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/operation-not-supported-in-this-environment') {
        try { await signInWithRedirect(auth, provider); return; } catch (redirectError) { explainAuthError(redirectError); return; }
      }
      explainAuthError(error);
    }
  };
  authButtons.forEach(button => button.addEventListener('click', async () => {
    if (currentUser) { await signOut(auth); return; }
    await startSignIn();
  }));
  // Attach directly so the visible CTA retains the browser's user gesture.
  authCtas.forEach(button => button.addEventListener('click', () => {
    if (currentUser) showCompanyModal(currentUser, currentProfile || {});
    else showCompanyModal(null);
  }));
  companySignInButton?.addEventListener('click', startSignIn);
} else {
  setIdentity(null);
  const localMessage = isLocalFile ? 'Google sign-in is available on the hosted Bidwise site. Open https://richkingsford.github.io/Bidwise/ to continue.' : 'Google sign-in is not configured for this workspace yet.';
  authButtons.forEach(button => button.addEventListener('click', () => toast(localMessage)));
  authCtas.forEach(button => button.addEventListener('click', () => toast(localMessage)));
};

companyProfileButton?.addEventListener('click', () => showCompanyModal(currentUser, currentProfile || {}));
adminButton.addEventListener('click', async () => {
  if (!isAdminUser(currentUser) || !adminModal) return;
  adminModal.hidden = false;
  try { await loadAdminProfiles?.(); } catch (error) { console.error('Bidwise admin profiles error', error); toast('Could not load company registrations.'); }
});
document.querySelector('#closeAdminModal')?.addEventListener('click', () => { adminModal.hidden = true; });
adminModal?.addEventListener('click', event => { if (event.target === adminModal) adminModal.hidden = true; });
document.querySelector('#closeCompanyModal')?.addEventListener('click', hideCompanyModal);
companyModal?.addEventListener('click', event => { if (event.target === companyModal) hideCompanyModal(); });
companyForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!currentUser) { toast('Continue with Google before creating your company profile.'); return; }
  const form = new FormData(companyForm);
  const services = { solar: form.get('solar') === 'on', storage: form.get('storage') === 'on', ev: form.get('ev') === 'on' };
  if (!Object.values(services).some(Boolean)) { toast('Select at least one installation service.'); return; }
  const submit = companyForm.querySelector('button[type="submit"]'); submit.disabled = true; submit.textContent = 'Saving…';
  try { await saveCompanyProfile?.({ companyName: String(form.get('companyName')).trim(), contactName: String(form.get('contactName')).trim(), businessEmail: String(form.get('email') || '').trim(), territory: String(form.get('territory')).trim(), website: String(form.get('website') || '').trim(), services }); } catch { toast('Could not save your company profile. Please try again.'); } finally { submit.disabled = false; submit.textContent = currentProfile?.companyName ? 'Save company profile' : 'Create company profile'; }
});
