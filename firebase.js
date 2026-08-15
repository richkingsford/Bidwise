// Google sign-in plus installer-company onboarding for the GetEV workspace.
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
const homeCompanyProfileButton = document.querySelector('#companyProfileButton');
let homeAvatarInitials = document.querySelector('#homeAvatarInitials');
if (!homeAvatarInitials) { homeAvatarInitials = document.createElement('button'); homeAvatarInitials.id = 'homeAvatarInitials'; homeAvatarInitials.className = 'avatar'; homeAvatarInitials.type = 'button'; homeAvatarInitials.setAttribute('aria-label', 'Open profile menu'); homeAvatarInitials.hidden = true; document.querySelector('.home-user')?.append(homeAvatarInitials); }
const profileMenu = document.createElement('div');
profileMenu.className = 'profile-menu';
profileMenu.hidden = true;
profileMenu.innerHTML = '<strong id="profileMenuName">Profile</strong><small id="profileMenuEmail"></small><button type="button" id="profileCompanyButton">Company profile</button><button type="button" id="profileSignOut">Sign out</button>';
document.body.append(profileMenu);
const profileCompanyButton = profileMenu.querySelector('#profileCompanyButton');
const profileSignOut = profileMenu.querySelector('#profileSignOut');
const companyModal = document.querySelector('#companyModal');
const companyForm = document.querySelector('#companyForm');
const companyFormNote = document.querySelector('#companyFormNote');
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
  const initials = contactName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';
  document.querySelector('#workspaceAuthor')?.replaceChildren(document.createTextNode(user ? displayName : 'Sign in to personalize'));
  document.querySelector('#authorName')?.replaceChildren(document.createTextNode(user ? contactName : 'Proposal team'));
  document.querySelectorAll('.bid-owner').forEach(node => { node.textContent = user ? contactName : 'Proposal team'; });
  const avatar = document.querySelector('#avatarInitials'); if (avatar) { avatar.textContent = initials; avatar.title = user?.email || 'Not signed in'; avatar.hidden = !user; }
  if (homeAvatarInitials) { homeAvatarInitials.textContent = initials; homeAvatarInitials.hidden = !user; }
  authButtons.forEach(button => { button.hidden = Boolean(user); if (!user) button.textContent = 'Sign in with Google'; });
  document.querySelector('#profileMenuName')?.replaceChildren(document.createTextNode(displayName)); document.querySelector('#profileMenuEmail')?.replaceChildren(document.createTextNode(user?.email || ''));
  if (homeCompanyProfileButton) homeCompanyProfileButton.hidden = true;
  adminButton.hidden = !isAdminUser(user);
  document.body.classList.toggle('home-authenticated', Boolean(user));
  document.body.classList.toggle('home-registered', hasWorkspaceAccess(user, profile));
  document.body.classList.toggle('access-granted', hasWorkspaceAccess(user, profile));
  document.body.classList.toggle('admin-user', isAdminUser(user));
  const gateTitle = document.querySelector('#accessGateTitle');
  const gateCopy = document.querySelector('#accessGate p');
  const gateButton = document.querySelector('#gateAuthButton');
  if (user && !hasWorkspaceAccess(user, profile)) {
    const hasProfile = Boolean(profile?.companyName);
    if (gateTitle) gateTitle.textContent = hasProfile ? 'Company approval pending.' : 'Complete your company profile.';
    if (gateCopy) gateCopy.textContent = hasProfile ? `You are signed in as ${user.email}. An administrator must approve ${profile.companyName} before proposals become available.` : `You are signed in as ${user.email}. Add your installer company profile to request workspace access.`;
    if (gateButton) gateButton.textContent = hasProfile ? 'Update company profile' : 'Create company profile';
  } else if (!user) {
    if (gateTitle) gateTitle.textContent = 'Your proposals are inside.';
    if (gateCopy) gateCopy.textContent = 'Sign in with Google and complete your installer company profile to access this bid workspace.';
    if (gateButton) gateButton.textContent = 'Sign in with Google';
  }
  if (profile?.companyName) {
    const branding = { companyName: profile.companyName, tagline: profile.tagline || '', proposalSlogan: profile.proposalSlogan || '', companyLogo: profile.companyLogo?.url || '' };
    try { localStorage.setItem('GetEV-company-branding', JSON.stringify(branding)); } catch { /* Storage can be unavailable in privacy-restricted sessions. */ }
    window.dispatchEvent(new CustomEvent('getev:company-branding', { detail: branding }));
  }
};

const showCompanyModal = (user, profile = {}) => {
  if (!companyModal || !companyForm) return;
  companyForm.elements.companyName.value = profile.companyName || '';
  companyForm.elements.contactName.value = profile.contactName || user?.displayName || '';
  companyForm.elements.email.value = profile.businessEmail || user?.email || '';
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
  if (companyFormNote) companyFormNote.textContent = user ? 'Complete the required fields below. Your company profile will be saved for review; optional files can be added now or later.' : 'Sign in first, then complete the required fields below.';
  companyModal.hidden = false;
  (user ? companyForm.elements.companyName : companySignInButton)?.focus();
};
const hideCompanyModal = () => { if (companyModal) companyModal.hidden = true; };

if (firebaseConfig && !isLocalFile) {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
  const { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, setPersistence, browserLocalPersistence, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
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
    console.error('GetEV Google sign-in error', error);
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
    if (!user) { hideCompanyModal(); setIdentity(null); document.body.classList.add('auth-ready'); return; }
    if (!user.email) { await signOut(auth); toast('Choose a Google account with an email address to continue.'); return; }
    setIdentity(user);
    try {
      await loadCompanyProfile(user);
    } catch (error) {
      console.error('GetEV company profile load error', error);
      // Keep onboarding available even if a profile read is temporarily unavailable.
      // The explicit code makes Firebase configuration failures diagnosable instead of
      // presenting a generic "registration form" failure.
      setIdentity(user, null);
      showCompanyModal(user);
      const code = error?.code?.replace(/^firestore\//, '') || 'unavailable';
      toast(`Signed in, but registration needs attention (${code}).`);
    } finally { document.body.classList.add('auth-ready'); }
  });

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
  authButtons.forEach(button => button.addEventListener('click', startSignIn));
  // Attach directly so the visible CTA retains the browser's user gesture.
  authCtas.forEach(button => button.addEventListener('click', () => {
    if (currentUser) showCompanyModal(currentUser, currentProfile || {});
    else showCompanyModal(null);
  }));
  companySignInButton?.addEventListener('click', startSignIn);
  [document.querySelector('#avatarInitials'), homeAvatarInitials].filter(Boolean).forEach(button => button.addEventListener('click', () => { if (profileMenu) profileMenu.hidden = !profileMenu.hidden; }));
  profileCompanyButton?.addEventListener('click', () => { profileMenu.hidden = true; showCompanyModal(currentUser, currentProfile || {}); });
  profileSignOut?.addEventListener('click', async () => { profileMenu.hidden = true; await signOut(auth); });
  // Recover redirect results without blocking the initial sign-in controls.
  void getRedirectResult(auth).then(async redirectResult => {
    if (redirectResult?.user && currentUser?.uid !== redirectResult.user.uid) {
      currentUser = redirectResult.user;
      await loadCompanyProfile(redirectResult.user);
    }
  }).catch(explainAuthError);
} else {
  setIdentity(null);
  const localMessage = isLocalFile ? 'Google sign-in is available on the hosted GetEV site. Open https://richkingsford.github.io/GetEV/ to continue.' : 'Google sign-in is not configured for this workspace yet.';
  authButtons.forEach(button => button.addEventListener('click', () => toast(localMessage)));
  authCtas.forEach(button => button.addEventListener('click', () => toast(localMessage)));
};

adminButton.addEventListener('click', async () => {
  if (!isAdminUser(currentUser) || !adminModal) return;
  adminModal.hidden = false;
  try { await loadAdminProfiles?.(); } catch (error) { console.error('GetEV admin profiles error', error); toast('Could not load company registrations.'); }
});
document.querySelector('#closeAdminModal')?.addEventListener('click', () => { adminModal.hidden = true; });
adminModal?.addEventListener('click', event => { if (event.target === adminModal) adminModal.hidden = true; });
document.querySelector('#closeCompanyModal')?.addEventListener('click', hideCompanyModal);
companyModal?.addEventListener('click', event => { if (event.target === companyModal) hideCompanyModal(); });
companyForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!currentUser) { toast('Continue with Google before creating your company profile.'); return; }
  const form = new FormData(companyForm);
  const requiredFields = [['companyName', 'Company name'], ['contactName', 'Primary contact'], ['email', 'Business email'], ['territory', 'Service territory']];
  const missingField = requiredFields.find(([name]) => !String(form.get(name) || '').trim());
  if (missingField) {
    companyForm.elements[missingField[0]]?.focus();
    if (companyFormNote) companyFormNote.textContent = `${missingField[1]} is required before your company profile can be saved.`;
    toast(`${missingField[1]} is required.`);
    return;
  }
  const businessEmail = String(form.get('email') || '').trim();
  if (!/^\S+@\S+\.\S+$/.test(businessEmail)) {
    companyForm.elements.email?.focus();
    if (companyFormNote) companyFormNote.textContent = 'Enter a valid business email address, such as name@company.com.';
    toast('Enter a valid business email address.');
    return;
  }
  const services = { solar: form.get('solar') === 'on', storage: form.get('storage') === 'on', ev: form.get('ev') === 'on' };
  if (!Object.values(services).some(Boolean)) { if (companyFormNote) companyFormNote.textContent = 'Select at least one installation service before saving.'; toast('Select at least one installation service.'); return; }
  const insuranceFile = companyForm.elements.insuranceDocument?.files?.[0]; const contractorFile = companyForm.elements.contractorCertification?.files?.[0]; const logoFile = companyForm.elements.companyLogo?.files?.[0];
  if (logoFile && (!logoFile.type.startsWith('image/') || logoFile.size > 5 * 1024 * 1024)) { toast('Choose an image logo up to 5 MB.'); return; }
  const submit = companyForm.querySelector('button[type="submit"]'); submit.disabled = true; submit.textContent = 'Saving…';
  try { const [insuranceDocument, contractorCertification, companyLogo] = await Promise.all([uploadCompanyDocument(insuranceFile), uploadCompanyDocument(contractorFile), uploadCompanyDocument(logoFile, 'company-logos')]); const certificationDocuments = []; for (const file of [...(companyForm.elements.certificationDocuments?.files || [])]) certificationDocuments.push(await uploadCompanyDocument(file)); const pendingStorage = [insuranceDocument, contractorCertification, companyLogo, ...certificationDocuments].some(document => document?.storageStatus === 'pending-storage-setup'); await saveCompanyProfile?.({ companyName: String(form.get('companyName')).trim(), tagline: String(form.get('tagline') || '').trim(), proposalSlogan: String(form.get('proposalSlogan') || '').trim(), contactName: String(form.get('contactName')).trim(), businessEmail: String(form.get('email') || '').trim(), territory: String(form.get('territory')).trim(), website: String(form.get('website') || '').trim(), services, proposalCertifications: String(form.get('proposalCertifications') || '').trim(), companyLogo: companyLogo || currentProfile?.companyLogo || null, insuranceDocument: insuranceDocument || currentProfile?.insuranceDocument || null, contractorCertification: contractorCertification || currentProfile?.contractorCertification || null, certificationDocuments: certificationDocuments.length ? certificationDocuments : currentProfile?.certificationDocuments || [], documentStorageStatus: pendingStorage ? 'pending-storage-setup' : 'stored' }); if (pendingStorage) toast('Profile saved. Documents are recorded and awaiting secure file storage setup.'); } catch (error) { console.error('GetEV company profile save error', error); toast(`Could not save your company profile${error?.code ? ` (${error.code})` : ''}. Please try again.`); } finally { submit.disabled = false; submit.textContent = currentProfile?.companyName ? 'Save company profile' : 'Create company profile'; }
});
