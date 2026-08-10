// Google sign-in is shared across the Bidwise homepage and proposal views.
const firebaseConfig = window.BIDWISE_FIREBASE_CONFIG || null;
const authButtons = [document.querySelector('#authButton'), document.querySelector('#homeAuthButton')].filter(Boolean);
const toast = message => { const node = document.querySelector('#toast'); if (!node) return; node.textContent = message; node.classList.add('show'); setTimeout(() => node.classList.remove('show'), 3200); };
const setIdentity = user => {
  const name = user?.displayName || user?.email?.split('@')[0] || 'Proposal team';
  const firstName = name.split(' ')[0];
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';
  document.querySelector('#workspaceAuthor')?.replaceChildren(document.createTextNode(user ? name : 'Sign in to personalize'));
  document.querySelector('#authorName')?.replaceChildren(document.createTextNode(user ? name : 'Proposal team'));
  const avatar = document.querySelector('#avatarInitials'); if (avatar) { avatar.textContent = initials; avatar.title = user?.email || 'Not signed in'; }
  authButtons.forEach(button => { button.textContent = user ? `Sign out · ${firstName}` : 'Sign in with Google'; });
};

if (firebaseConfig) {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
  const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  let currentUser = null;
  onAuthStateChanged(auth, user => { currentUser = user; setIdentity(user); });
  authButtons.forEach(button => button.addEventListener('click', async () => {
    try {
      if (currentUser) { await signOut(auth); return; }
      const result = await signInWithPopup(auth, provider);
      if (!result.user.email?.toLowerCase().endsWith('@gmail.com')) { await signOut(auth); toast('Please use a Gmail address to access Bidwise.'); return; }
    } catch (error) {
      if (error?.code !== 'auth/popup-closed-by-user') toast('Google sign-in was not completed. Please try again.');
    }
  }));
} else {
  setIdentity(null);
  authButtons.forEach(button => button.addEventListener('click', () => toast('Google sign-in is not configured for this workspace yet.')));
}
