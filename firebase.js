// Google sign-in plus installer-company onboarding for the Bidwise workspace.
const firebaseConfig = window.BIDWISE_FIREBASE_CONFIG || {
  apiKey: 'AIzaSyCdpWkwtSrTQhWMiHJWvcz2U1rWYmYHOLg',
  authDomain: 'bidwise-6683d.firebaseapp.com',
  projectId: 'bidwise-6683d',
  storageBucket: 'bidwise-6683d.firebasestorage.app',
  messagingSenderId: '648793647498',
  appId: '1:648793647498:web:569a46e939909dc92e8073'
};
const isLocalFile = window.location.protocol === 'file:';
const authButtons = [document.querySelector('#authButton'), document.querySelector('#homeAuthButton'), document.querySelector('#gateAuthButton')].filter(Boolean);
const authCtas = [...document.querySelectorAll('[data-auth-cta]')];
const companyProfileButton = document.querySelector('#companyProfileButton');
const companyModal = document.querySelector('#companyModal');
const companyForm = document.querySelector('#companyForm');
const companySignInButton = document.querySelector('#companySignInButton');
const toast = message => { const node = document.querySelector('#toast'); if (!node) return; node.textContent = message; node.classList.add('show'); setTimeout(() => node.classList.remove('show'), 3200); };
let currentUser = null;
let currentProfile = null;
let saveCompanyProfile = null;

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
  document.body.classList.toggle('home-authenticated', Boolean(user));
  document.body.classList.toggle('home-registered', Boolean(user && profile?.companyName));
  document.body.classList.toggle('access-granted', Boolean(user && profile?.companyName));
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
  const { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
  const { getFirestore, doc, getDoc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();

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
    setIdentity(user, currentProfile);
    if (!currentProfile?.companyName) showCompanyModal(user);
  };

  saveCompanyProfile = async profile => {
    if (!currentUser) return;
    await setDoc(doc(db, 'profiles', currentUser.uid), { ...profile, email: currentUser.email, verificationStatus: currentProfile?.verificationStatus || 'pending', updatedAt: serverTimestamp() }, { merge: true });
    currentProfile = { ...currentProfile, ...profile, email: currentUser.email, verificationStatus: currentProfile?.verificationStatus || 'pending' };
    setIdentity(currentUser, currentProfile);
    hideCompanyModal();
    toast('Company profile saved. Your registration is pending review.');
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
      await signInWithRedirect(auth, provider);
    } catch (error) {
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
