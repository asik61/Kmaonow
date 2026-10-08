/**
 * Real Money App - Device Fingerprinting & Anti-Fraud Utility
 * Strictly enforces "1 Phone = 1 Account" policy to prevent multi-accounting.
 */

const DEVICE_KEY = 'realmoney_device_signature_v1';
const PRIMARY_ACCOUNT_KEY = 'realmoney_device_primary_account';

export interface DeviceRegisteredAccount {
  email: string;
  phone?: string;
  name?: string;
  registeredAt: string;
}

/**
 * Generates or retrieves persistent unique hardware/device signature.
 */
export function getOrCreateDeviceId(): string {
  try {
    let existingId = localStorage.getItem(DEVICE_KEY);
    if (!existingId) {
      const screenSignature = `${window.screen?.width || 360}x${window.screen?.height || 800}x${window.screen?.colorDepth || 24}`;
      const navSignature = `${navigator.language || 'en'}_${navigator.hardwareConcurrency || 4}_${navigator.platform || ''}`;
      const randomSeed = Math.random().toString(36).substring(2, 10).toUpperCase();
      existingId = `DEV-${randomSeed}-${Math.abs(hashString(screenSignature + navSignature)).toString(36).toUpperCase()}`;
      localStorage.setItem(DEVICE_KEY, existingId);
    }
    return existingId;
  } catch {
    return 'DEV-FALLBACK-001';
  }
}

/**
 * Gets the primary account registered on this physical phone
 */
export function getDevicePrimaryAccount(): DeviceRegisteredAccount | null {
  try {
    const raw = localStorage.getItem(PRIMARY_ACCOUNT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.email || parsed.phone)) {
        return parsed;
      }
    }
    // Also check if existing user profile is stored
    const userRaw = localStorage.getItem('kamaonow_user');
    if (userRaw) {
      const u = JSON.parse(userRaw);
      if (u && (u.email || u.phone)) {
        const entry: DeviceRegisteredAccount = {
          email: (u.email || '').trim().toLowerCase(),
          phone: (u.phone || '').replace(/\D/g, ''),
          name: u.name,
          registeredAt: u.created_at || new Date().toISOString(),
        };
        localStorage.setItem(PRIMARY_ACCOUNT_KEY, JSON.stringify(entry));
        return entry;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Checks if a Google account is allowed on this device:
 * 1. If device has NO primary account yet: Allowed!
 * 2. If device ALREADY has an account:
 *    - Allowed IF email matches the device's registered account (Returning user).
 *    - Blocked IF email is different (1 Phone = 1 Account).
 */
export function validateGoogleLoginOnDevice(email: string): {
  allowed: boolean;
  isExistingAccount: boolean;
  reason?: string;
} {
  const normEmail = (email || '').trim().toLowerCase();
  const primary = getDevicePrimaryAccount();

  if (!primary || !primary.email) {
    return { allowed: true, isExistingAccount: false };
  }

  const primaryEmail = (primary.email || '').trim().toLowerCase();

  // If same email as registered on device -> Allowed returning user!
  if (primaryEmail === normEmail) {
    return { allowed: true, isExistingAccount: true };
  }

  // If different email on same phone -> Block multi-accounting!
  return {
    allowed: false,
    isExistingAccount: false,
    reason: '❌ Iss phone me pehle se ek account bana hua hai. 1 phone me sirf 1 account chal sakta hai. Kripya apne purane Google account se login karein.',
  };
}

/**
 * Validates phone number binding
 * Ensures:
 * 1. Phone number is not already bound to a different email
 * 2. Phone matches previous binding if returning
 */
export function validatePhoneBindingOnDevice(cleanPhone: string, email: string): {
  allowed: boolean;
  reason?: string;
} {
  const primary = getDevicePrimaryAccount();
  const normEmail = (email || '').trim().toLowerCase();
  const cleanP = cleanPhone.replace(/\D/g, '');

  if (primary && primary.email) {
    const primaryEmail = (primary.email || '').trim().toLowerCase();
    const primaryPhone = (primary.phone || '').replace(/\D/g, '');

    // If device is registered to a different email
    if (primaryEmail !== normEmail) {
      return {
        allowed: false,
        reason: '❌ Iss phone me pehle se ek account bana hua hai. 1 phone me sirf 1 account chal sakta hai.',
      };
    }

    // If phone was already bound on device and is different
    if (primaryPhone && primaryPhone !== cleanP) {
      return {
        allowed: false,
        reason: '❌ Yeh account pehle se doosre mobile number se linked hai. Kripya wahi number use karein.',
      };
    }
  }

  // Also check across all known local users
  try {
    const allRaw = localStorage.getItem('kamaonow_all_users');
    if (allRaw) {
      const list = JSON.parse(allRaw);
      if (Array.isArray(list)) {
        const found = list.find((u: { phone?: string; email?: string }) => {
          const uPhone = (u.phone || '').replace(/\D/g, '');
          const uEmail = (u.email || '').trim().toLowerCase();
          return uPhone === cleanP && uEmail && uEmail !== normEmail;
        });
        if (found) {
          // Never reveal the other user's email address!
          return {
            allowed: false,
            reason: '❌ Yeh mobile number pehle se doosre account se linked hai. Kripya apna valid number daalein.',
          };
        }
      }
    }
  } catch {
    // ignore
  }

  return { allowed: true };
}

/**
 * Permanently registers this account as the 1 owner of this phone
 */
export function registerAccountOnDevice(phone: string, email?: string, name?: string) {
  try {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const normEmail = (email || '').trim().toLowerCase();
    const entry: DeviceRegisteredAccount = {
      email: normEmail,
      phone: cleanPhone,
      name: name || 'User',
      registeredAt: new Date().toISOString(),
    };
    localStorage.setItem(PRIMARY_ACCOUNT_KEY, JSON.stringify(entry));
  } catch (err) {
    console.warn('registerAccountOnDevice error:', err);
  }
}

export const setDevicePrimaryAccount = registerAccountOnDevice;

/**
 * Checks if user is trying to refer their own device/code (Bug 16 Fix: Anti-Self-Referral Bypass)
 */
export function isSelfReferralOnDevice(code: string, userPhone?: string): boolean {
  if (!code || !code.trim()) return false;
  const cleanCode = code.trim().toUpperCase();
  const cleanUserPhone = (userPhone || '').replace(/\D/g, '');

  try {
    // 1. Check current logged in user
    const currentUserRaw = localStorage.getItem('kamaonow_user');
    if (currentUserRaw) {
      const cur = JSON.parse(currentUserRaw);
      if (cur.referral_code && cur.referral_code.toUpperCase() === cleanCode) {
        return true;
      }
      const curPhone = (cur.phone || '').replace(/\D/g, '');
      if (curPhone && cleanCode.includes(curPhone.slice(-4))) {
        return true;
      }
    }

    // 2. Check primary device account
    const primary = getDevicePrimaryAccount();
    if (primary?.phone) {
      const primaryPhone = primary.phone.replace(/\D/g, '');
      if (primaryPhone && cleanCode.includes(primaryPhone.slice(-4))) {
        return true;
      }
    }

    // 3. Check entering phone number directly
    if (cleanUserPhone && cleanUserPhone.length >= 4) {
      const last4 = cleanUserPhone.slice(-4);
      if (cleanCode.includes(last4) || cleanCode === `RM${last4}`) {
        return true;
      }
    }

    // 4. Check across all accounts stored on device
    const allUsersRaw = localStorage.getItem('kamaonow_all_users');
    if (allUsersRaw) {
      const list = JSON.parse(allUsersRaw);
      if (Array.isArray(list)) {
        const isMatch = list.some((u: any) => {
          const uCode = (u.referral_code || '').trim().toUpperCase();
          const uPhone = (u.phone || '').replace(/\D/g, '');
          if (uCode && uCode === cleanCode) return true;
          if (uPhone && uPhone.length >= 4 && cleanCode.includes(uPhone.slice(-4))) return true;
          return false;
        });
        if (isMatch) return true;
      }
    }
  } catch {
    // ignore
  }

  return false;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}
