import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { UserProfile, WalletState } from '../types/kamaonow';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Critical: getFirestore with database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Operation types for strict error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network restricted.');
    }
    return false;
  }
}

// User Profile helpers
export async function syncUserProfile(user: UserProfile): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  const path = 'users';
  try {
    const norm = email.trim().toLowerCase();
    const q = query(collection(db, 'users'), where('email', '==', norm));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as UserProfile;
    }
  } catch (error) {
    console.warn('findUserByEmail Firestore lookup fallback:', error);
  }
  return null;
}

export async function findUserByPhone(phone: string): Promise<UserProfile | null> {
  const path = 'users';
  try {
    const clean = phone.replace(/\D/g, '');
    const q = query(collection(db, 'users'), where('phone', '==', `+91 ${clean}`));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as UserProfile;
    }
  } catch (error) {
    console.warn('findUserByPhone Firestore lookup fallback:', error);
  }
  return null;
}

// User Wallet helpers
export async function syncUserWallet(userId: string, wallet: WalletState): Promise<void> {
  const path = `wallets/${userId}`;
  try {
    await setDoc(
      doc(db, 'wallets', userId),
      {
        user_id: userId,
        balance: wallet.available_balance,
        available_balance: wallet.available_balance,
        pending_balance: wallet.pending_balance,
        lifetime_earned: wallet.lifetime_earned,
        lifetime_withdrawn: wallet.lifetime_withdrawn,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Firestore syncUserWallet fallback:', error);
  }
}

export async function fetchUserWallet(userId: string): Promise<WalletState | null> {
  const path = `wallets/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'wallets', userId));
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: `wal-${userId}`,
        user_id: userId,
        available_balance: Number(data.available_balance ?? data.balance ?? 0),
        pending_balance: Number(data.pending_balance ?? 0),
        lifetime_earned: Number(data.lifetime_earned ?? 0),
        lifetime_withdrawn: Number(data.lifetime_withdrawn ?? 0),
        updated_at: data.updated_at || new Date().toISOString(),
      };
    }
  } catch (error) {
    console.warn('fetchUserWallet fallback:', error);
  }
  return null;
}

// Task Submission Helpers
export async function syncTaskSubmission(sub: any): Promise<void> {
  try {
    // Only store thumbnail/preview or delete raw heavy base64 to prevent storage limits
    const cleanSub = {
      ...sub,
      proof_file_id: sub.proof_file_id && sub.proof_file_id.length > 500 ? sub.proof_file_id.slice(0, 500) : (sub.proof_file_id || ''),
      updated_at: new Date().toISOString(),
    };
    await setDoc(doc(db, 'submissions', sub.id), cleanSub, { merge: true });
  } catch (error) {
    console.warn('Firestore syncTaskSubmission fallback:', error);
  }
}

export async function fetchUserSubmissions(userId: string): Promise<any[]> {
  try {
    const q = query(collection(db, 'submissions'), where('user_id', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    console.warn('fetchUserSubmissions fallback:', error);
    return [];
  }
}

export async function fetchAllSubmissions(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'submissions'));
    return snap.docs.map((d) => d.data());
  } catch (error) {
    console.warn('fetchAllSubmissions fallback:', error);
    return [];
  }
}

// Real Firebase Google Login trigger
export async function loginWithFirebaseGoogle(): Promise<{
  uid: string;
  name: string;
  email: string;
  photoURL: string;
}> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return {
    uid: user.uid,
    name: user.displayName || 'Google User',
    email: user.email || '',
    photoURL:
      user.photoURL ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
  };
}

export async function logoutFromFirebase(): Promise<void> {
  await fbSignOut(auth);
}
