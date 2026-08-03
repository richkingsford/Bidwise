// Firebase is optional at runtime: Bidwise works locally with localStorage until a project config is supplied.
const firebaseConfig = window.BIDWISE_FIREBASE_CONFIG || null;
const authButton = document.querySelector('#authButton');

if (firebaseConfig) {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
  const { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
  const { getFirestore, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();
  onAuthStateChanged(auth, user => { if (user && authButton) authButton.textContent = user.displayName ? `Signed in · ${user.displayName.split(' ')[0]}` : 'Signed in with Google'; });
  authButton?.addEventListener('click', async () => {
    const result = await signInWithPopup(auth, provider);
    await setDoc(doc(db, 'proposals', result.user.uid), { site: document.querySelector('#storeName')?.textContent, updatedAt: new Date().toISOString() }, { merge: true });
  });
} else if (authButton) {
  authButton.title = 'Add firebase-config.js to enable Google sign-in and cloud persistence';
  authButton.addEventListener('click', () => { document.querySelector('#toast').textContent = 'Add Firebase configuration to enable Google sign-in.'; document.querySelector('#toast').classList.add('show'); setTimeout(() => document.querySelector('#toast').classList.remove('show'), 3200); });
}
