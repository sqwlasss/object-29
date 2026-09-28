import { initFirebase } from '@/lib/firebase';

let authPromise = null;
let authModulePromise = null;

/** Lazily load the firebase/auth module (cached by the bundler after first import). */
function getAuthModule() {
  if (!authModulePromise) {
    authModulePromise = import('firebase/auth');
  }
  return authModulePromise;
}

/** Lazily initialize Firebase Auth (module-level cached promise). */
function getAuth() {
  if (!authPromise) {
    authPromise = (async () => {
      const app = await initFirebase();
      const { getAuth: getFirebaseAuth } = await getAuthModule();
      return getFirebaseAuth(app);
    })();
  }
  return authPromise;
}

let googleProviderPromise = null;

function getGoogleProvider() {
  if (!googleProviderPromise) {
    googleProviderPromise = getAuthModule().then(
      ({ GoogleAuthProvider }) => new GoogleAuthProvider()
    );
  }
  return googleProviderPromise;
}

function serializeUser(firebaseUser) {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    emailVerified: firebaseUser.emailVerified,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
}

export function onAuthChange(callback) {
  let unsubscribe = null;
  let cancelled = false;
  getAuth()
    .then(async (auth) => {
      if (cancelled) return;
      const { onAuthStateChanged } = await getAuthModule();
      if (cancelled) return;
      unsubscribe = onAuthStateChanged(auth, (user) => {
        callback(user ? serializeUser(user) : null);
      });
    })
    .catch(() => {
      // Firebase failed to load or initialise — commonly an ad/tracker blocker
      // blocking a googleapis.com endpoint, but also an outage, an offline
      // visitor, or a misconfigured key.
      //
      // Resolve to "signed out" instead of staying silent. AuthContext only
      // clears `isLoadingAuth` from inside this callback, and App.jsx renders
      // nothing but a spinner while that flag is true — so swallowing the
      // failure here used to take the ENTIRE STOREFRONT down: no catalogue, no
      // product pages, no cart, for a visitor whose only crime was running
      // uBlock. Browsing and buying do not require auth, so degrade to
      // logged-out and let the shop render.
      if (!cancelled) callback(null);
    });
  return () => {
    cancelled = true;
    if (unsubscribe) unsubscribe();
  };
}

export async function getCurrentUser() {
  const auth = await getAuth();
  return auth.currentUser;
}

export async function sendEmailVerification(user) {
  const [{ sendEmailVerification: send }, auth] = await Promise.all([
    getAuthModule(),
    getAuth(),
  ]);
  const u = user ?? (await getCurrentUser());
  if (!u) throw new Error('No signed-in user');
  return send(u);
}

export async function loginViaEmailPassword(email, password) {
  const [{ signInWithEmailAndPassword }, auth] = await Promise.all([
    getAuthModule(),
    getAuth(),
  ]);
  const result = await signInWithEmailAndPassword(auth, email, password);
  return serializeUser(result.user);
}

export async function registerUser({ email, password }) {
  const [{ createUserWithEmailAndPassword }, auth] = await Promise.all([
    getAuthModule(),
    getAuth(),
  ]);
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(result.user);
  return result.user;
}

export async function logout() {
  const [{ signOut }, auth] = await Promise.all([getAuthModule(), getAuth()]);
  await signOut(auth);
}

export async function loginWithGoogle() {
  const [{ signInWithPopup }, auth, provider] = await Promise.all([
    getAuthModule(),
    getAuth(),
    getGoogleProvider(),
  ]);
  const result = await signInWithPopup(auth, provider);
  return serializeUser(result.user);
}

export async function resetPasswordRequest(email) {
  const [{ sendPasswordResetEmail }, auth] = await Promise.all([
    getAuthModule(),
    getAuth(),
  ]);
  await sendPasswordResetEmail(auth, email);
}

export async function resetPassword({ resetToken, newPassword }) {
  const [{ confirmPasswordReset }, auth] = await Promise.all([
    getAuthModule(),
    getAuth(),
  ]);
  await confirmPasswordReset(auth, resetToken, newPassword);
}
