/**
 * Real Money App - Device Fingerprinting & Anti-Fraud Utility
 * Enforces "1 Phone = 1 Account" policy to prevent multi-accounting,
 * self-referral looting, and bonus abuse.
 */

const DEVICE_KEY = 'realmoney_device_signature_v1';
const REGISTERED_ACCOUNTS_KEY = 'realmoney_device_registered_accounts';

export interface DeviceInfo {
  deviceId: string;
  userAgent: string;
  screenRes: string;
  language: string;
  timezone: string;
  firstSeenAt: string;
}

/**
 * Generates or retrieves the persistent unique hardware/device signature.
 */
export function getOrCreateDeviceId(): string {
  try {
    let existingId = localStorage.getItem(DEVICE_KEY);
    if (!existingId) {
      // Create a deterministic pseudo-hardware hash from browser & display parameters
      const screenSignature = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
      const navSignature = `${navigator.language}_${navigator.hardwareConcurrency || 4}_${navigator.platform || ''}`;
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
 * Returns comprehensive device metadata for fraud logs
 */
export function getDeviceInfo(): DeviceInfo {
  const deviceId = getOrCreateDeviceId();
  let firstSeenAt = localStorage.getItem(`${DEVICE_KEY}_first_seen`);
  if (!firstSeenAt) {
    firstSeenAt = new Date().toISOString();
    try {
      localStorage.setItem(`${DEVICE_KEY}_first_seen`, firstSeenAt);
    } catch {
      // ignore
    }
  }

  return {
    deviceId,
    userAgent: navigator.userAgent || 'Unknown',
    screenRes: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language || 'en-IN',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
    firstSeenAt,
  };
}

/**
 * Checks if this device already has an account registered.
 * Returns { allowed: boolean, existingPhone?: string, reason?: string }
 */
export function validateNewAccountOnDevice(newPhone: string, newEmail?: string): {
  allowed: boolean;
  existingPhone?: string;
  reason?: string;
} {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    const registered: Array<{ phone: string; email?: string; registeredAt: string; name: string }> = raw
      ? JSON.parse(raw)
      : [];

    const cleanNewPhone = newPhone.replace(/\D/g, '');

    // Check if the current phone is already the registered one (allowing re-login)
    const exactMatch = registered.find(
      (acc) => acc.phone.replace(/\D/g, '') === cleanNewPhone || (newEmail && acc.email === newEmail)
    );

    if (exactMatch) {
      // Logging in back into their own account is completely fine!
      return { allowed: true };
    }

    // If another account is already bound to this physical phone
    if (registered.length >= 1) {
      const primary = registered[0];
      const maskedPhone = primary.phone ? `+91 ******${primary.phone.slice(-4)}` : 'purana account';
      return {
        allowed: false,
        existingPhone: maskedPhone,
        reason: `1 Phone = 1 Account Niyam: Is mobile phone par pehle se ek account (${maskedPhone}) registered hai. Naya account banakar sign-up bonus baar-baar lena mana hai. Kripya apna pehla account login karein.`,
      };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

/**
 * Binds a newly created account to this physical device
 */
export function registerAccountOnDevice(account: { phone: string; email?: string; name: string }) {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    const registered: Array<{ phone: string; email?: string; registeredAt: string; name: string }> = raw
      ? JSON.parse(raw)
      : [];

    const cleanPhone = account.phone.replace(/\D/g, '');
    const exists = registered.some((acc) => acc.phone.replace(/\D/g, '') === cleanPhone);

    if (!exists) {
      registered.push({
        phone: cleanPhone,
        email: account.email,
        name: account.name,
        registeredAt: new Date().toISOString(),
      });
      localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(registered));
    }
  } catch {
    // ignore
  }
}

/**
 * Checks if user is trying to self-refer on the same physical phone
 */
export function isSelfReferralOnDevice(enteredReferralCode: string, userOwnReferralCode?: string): boolean {
  if (!enteredReferralCode) return false;
  const cleanCode = enteredReferralCode.trim().toUpperCase();
  if (userOwnReferralCode && cleanCode === userOwnReferralCode.trim().toUpperCase()) {
    return true;
  }
  // Check if saved user referral code on this device matches
  try {
    const savedUser = localStorage.getItem('kamaonow_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.referral_code && parsed.referral_code.toUpperCase() === cleanCode) {
        return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
}

// Simple deterministic hash
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
