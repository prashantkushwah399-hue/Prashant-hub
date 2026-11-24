import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { get, ref } from 'firebase/database';
import { auth, rtdb } from '../firebase/config';

export async function loginAdmin(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

export async function verifyAdminAuthorization(uid: string): Promise<{
  isAdmin: boolean;
  error?: string;
}> {
  try {
    const snap = await get(ref(rtdb, `admins/${uid}`));
    if (!snap.exists()) {
      return { isAdmin: false };
    }
    return { isAdmin: snap.val() === true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Authorization check failed';
    return { isAdmin: false, error: message };
  }
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
