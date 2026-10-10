import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile } from '../types/kamaonow';

const MASTER_ADMIN_EMAIL = 'asik94906@gmail.com';
const LOCAL_STORAGE_DEVICE_KEY = 'realmoneyapp_unique_device_id';

export interface DeviceInfo {
  deviceId: string;
  deviceModel: string;
  isNative: boolean;
}

export interface DeviceCheckResult {
  allowed: boolean;
  reason?: 'DEVICE_BOUND_TO_OTHER_ACCOUNT' | 'DEVICE_BLOCKED' | 'OK';
  boundEmail?: string;
  errorMessage?: string;
  isNewDevice?: boolean;
}

/**
 * Mask email for privacy when showing alert
 * e.g. "rahulkumar12@gmail.com" -> "r***2@gmail.com"
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'another account';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * Get device identification with hardware-level binding in APK,
 * falling back to persistent client identity in web mode.
 */
export function getDeviceInfo(): DeviceInfo {
  let isNative = false;
  let deviceId = '';
  let deviceModel = 'Unknown Device';

  if (typeof window !== 'undefined' && window.AndroidBridge) {
    isNative = true;
    try {
      if (typeof window.AndroidBridge.getDeviceId === 'function') {
        const nativeId = window.AndroidBridge.getDeviceId();
        if (nativeId && nativeId.length > 3) {
          deviceId = `hw_${nativeId.trim().toLowerCase()}`;
        }
      }
      if (typeof window.AndroidBridge.getDeviceModel === 'function') {
        const nativeModel = window.AndroidBridge.getDeviceModel();
        if (nativeModel) {
          deviceModel = nativeModel.trim();
        }
      }
    } catch (e) {
      console.warn('Native AndroidBridge call fallback:', e);
    }
  }

  // Web or fallback device identifier
  if (!deviceId) {
    try {
      let storedId = localStorage.getItem(LOCAL_STORAGE_DEVICE_KEY);
      if (!storedId) {
        // Generate pseudo-fingerprint UUID
        const rand = Math.random().toString(36).substring(2, 10);
        const time = Date.now().toString(36);
        const screenFp = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
        storedId = `web_${time}_${rand}_${screenFp}`;
        localStorage.setItem(LOCAL_STORAGE_DEVICE_KEY, storedId);
      }
      deviceId = storedId;
    } catch {
      deviceId = `dev_${Date.now()}`;
    }

    if (!isNative && typeof navigator !== 'undefined') {
      const ua = navigator.userAgent;
      if (/Android/i.test(ua)) {
        const match = ua.match(/Android\s([0-9.]+);\s([^;)]+)/);
        deviceModel = match && match[2] ? `Android (${match[2].trim()})` : 'Android Mobile';
      } else if (/iPhone|iPad/i.test(ua)) {
        deviceModel = 'Apple iOS Device';
      } else {
        deviceModel = 'Desktop Browser';
      }
    }
  }

  return { deviceId, deviceModel, isNative };
}

/**
 * Strict 1 Phone = 1 Account Verification
 * Verifies if the device is already bound to another account.
 */
export async function verifyDeviceBinding(
  deviceId: string,
  userEmail: string,
  userId?: string
): Promise<DeviceCheckResult> {
  const normEmail = userEmail.trim().toLowerCase();

  // Master Admin is always exempt for testing and system control
  if (normEmail === MASTER_ADMIN_EMAIL) {
    return { allowed: true, reason: 'OK' };
  }

  try {
    // 1. Check direct device binding document in Firestore: devices/{deviceId}
    const deviceDocRef = doc(db, 'devices', deviceId);
    const deviceSnap = await getDoc(deviceDocRef);

    if (deviceSnap.exists()) {
      const boundData = deviceSnap.data();
      const boundEmail = (boundData.email || '').trim().toLowerCase();
      const boundUserId = boundData.userId || boundData.user_id;

      // Check if it's the SAME user logging back in
      const isSameUser =
        boundEmail === normEmail ||
        (userId && boundUserId && boundUserId === userId);

      if (!isSameUser && boundEmail) {
        return {
          allowed: false,
          reason: 'DEVICE_BOUND_TO_OTHER_ACCOUNT',
          boundEmail: maskEmail(boundEmail),
          errorMessage: `1 Phone = 1 Account Niyam: Is mobile par pehle se account registered hai (${maskEmail(
            boundEmail
          )}). Ek phone me sirf ek hi account chal sakta hai.`,
        };
      }

      // Check if device is banned/blocked
      if (boundData.is_blocked) {
        return {
          allowed: false,
          reason: 'DEVICE_BLOCKED',
          errorMessage: 'Fraud/Policy violation ke kaaran is device ko block kiya gaya hai.',
        };
      }

      return { allowed: true, reason: 'OK', isNewDevice: false };
    }

    // 2. Query users collection to check if any other user already registered this deviceId
    try {
      const q = query(collection(db, 'users'), where('device_id', '==', deviceId));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        for (const docItem of querySnap.docs) {
          const uData = docItem.data() as UserProfile;
          const uEmail = (uData.email || '').trim().toLowerCase();
          if (uEmail !== normEmail && docItem.id !== userId) {
            return {
              allowed: false,
              reason: 'DEVICE_BOUND_TO_OTHER_ACCOUNT',
              boundEmail: maskEmail(uEmail),
              errorMessage: `1 Phone = 1 Account Niyam: Is phone par pehle se dusra account registered hai (${maskEmail(
                uEmail
              )}). Multiple accounts banana sakht mana hai.`,
            };
          }
        }
      }
    } catch (queryErr) {
      console.warn('Firestore device_id query skipped:', queryErr);
    }

    // Clean device, allow registration/login
    return { allowed: true, reason: 'OK', isNewDevice: true };
  } catch (error) {
    console.warn('Device verification Firestore error (allowing with local protection):', error);
    // Local fallback check
    try {
      const localBound = localStorage.getItem('kamaonow_bound_account_email');
      if (localBound && localBound.trim().toLowerCase() !== normEmail) {
        return {
          allowed: false,
          reason: 'DEVICE_BOUND_TO_OTHER_ACCOUNT',
          boundEmail: maskEmail(localBound),
          errorMessage: `1 Phone = 1 Account Niyam: Is phone par pehle se dusra account (${maskEmail(
            localBound
          )}) login hai. Ek mobile par sirf 1 account chal sakta hai.`,
        };
      }
    } catch {}

    return { allowed: true, reason: 'OK', isNewDevice: false };
  }
}

/**
 * Permanently bind a device to the user account in Firestore & LocalStorage
 */
export async function bindDeviceToUser(
  user: UserProfile,
  deviceId: string,
  deviceModel: string
): Promise<void> {
  try {
    const normEmail = user.email.trim().toLowerCase();

    // 1. Store in Firestore devices collection
    await setDoc(
      doc(db, 'devices', deviceId),
      {
        deviceId,
        deviceModel,
        userId: user.id,
        email: normEmail,
        userName: user.name,
        is_blocked: user.is_blocked || false,
        boundAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // 2. Local persistence lock
    localStorage.setItem('kamaonow_bound_account_email', normEmail);
    localStorage.setItem('kamaonow_bound_user_id', user.id);
  } catch (e) {
    console.warn('Failed to bind device in Firestore:', e);
  }
}

/**
 * Anti-Cheat: Validate that the entered referral code does NOT belong to the same device
 */
export async function validateReferralFairPlay(
  referralCode: string,
  currentDeviceId: string,
  currentUserEmail: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const cleanCode = referralCode.trim().toUpperCase();
    if (!cleanCode) return { valid: false, error: 'Invalid referral code' };

    const q = query(collection(db, 'users'), where('referral_code', '==', cleanCode));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { valid: false, error: 'Referral code maujood nahi hai.' };
    }

    const referrer = snap.docs[0].data() as UserProfile;

    // 1. Same Email check
    if (referrer.email?.toLowerCase() === currentUserEmail.toLowerCase()) {
      return { valid: false, error: 'Aap apna khud ka referral code use nahi kar sakte!' };
    }

    // 2. Same Device ID check (Self-Referral Anti-Cheat)
    if (referrer.device_id && referrer.device_id === currentDeviceId) {
      return {
        valid: false,
        error: 'Self-Referral Blocked: Ye referral code isi phone se banaya gaya hai. Fair Play policy ke tahat ye prohibited hai.',
      };
    }

    return { valid: true };
  } catch (e) {
    console.warn('validateReferralFairPlay check error:', e);
    return { valid: true }; // allow on network error
  }
}
