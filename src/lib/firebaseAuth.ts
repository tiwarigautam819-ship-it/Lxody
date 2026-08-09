import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function tryGoogleFirebasePopup(): Promise<{ email: string; name: string } | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result && result.user && result.user.email) {
      return {
        email: result.user.email,
        name: result.user.displayName || result.user.email.split('@')[0]
      };
    }
    return null;
  } catch (err: any) {
    console.warn('Firebase signInWithPopup failed or was cancelled/blocked:', err?.message || err);
    return null;
  }
}
