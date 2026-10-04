/**
 * Real Money App - Device Fingerprinting & Anti-Fraud Utility
 * Protects platform against self-referral loops while allowing legitimate
 * users to easily login, re-login, and switch devices smoothly.
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
 * Validates account login/registration.
 * Always allows existing accounts to login cleanly.
 */
export function validateNewAccountOnDevice(newPhone: string, newEmail?: string): {
  allowed: boolean;
  isExistingUser: boolean;
  reason?: string;
} {
  try {
    const cleanNewPhone = newPhone.replace(/\D/g, '');
    const normalizedNewEmail = newEmail ? newEmail.trim().toLowerCase() : '';

    if (cleanNewPhone.length !== 10) {
      return {
        allowed: false,
        isExistingUser: false,
        reason: 'Kripya 10-digit ka valid mobile number daalein',
      };
    }

    // Check if user already exists in platform
    const rawAllUsers = localStorage.getItem('kamaonow_all_users');
    let isExisting = false;
    if (rawAllUsers) {
      const allUsersList = JSON.parse(rawAllUsers);
      if (Array.isArray(allUsersList)) {
        isExisting = allUsersList.some((u) => {
          const uPhone = (u.phone || '').replace(/\D/g, '');
          const uEmail = (u.email || '').trim().toLowerCase();
          return uPhone === cleanNewPhone || (normalizedNewEmail && uEmail === normalizedNewEmail);
        });
      }
    }

    // Always allow login for users with valid 10-digit number
    return {
      allowed: true,
      isExistingUser: isExisting,
    };
  } catch (err) {
    console.warn('validateNewAccountOnDevice error:', err);
    return { allowed: true, isExistingUser: false };
  }
}

/**
 * Saves account on device registry
 */
export function registerAccountOnDevice(phone: string, email?: string, name?: string) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    let list: Array<{ phone: string; email?: string; registeredAt: string; name: string }> = raw
      ? JSON.parse(raw)
      : [];

    const existingIndex = list.findIndex((a) => {
      const aPhone = (a.phone || '').replace(/\D/g, '');
      const aEmail = (a.email || '').trim().toLowerCase();
      return aPhone === cleanPhone || (normalizedEmail && aEmail === normalizedEmail);
    });

    const entry = {
      phone: cleanPhone,
      email: normalizedEmail || undefined,
      registeredAt: new Date().toISOString(),
      name: name || 'User',
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...entry };
    } else {
      list.push(entry);
    }

    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('registerAccountOnDevice error:', err);
  }
}

/**
 * Checks if user is trying to refer their own device/code
 */
export function isSelfReferralOnDevice(code: string): boolean {
  if (!code || !code.trim()) return false;
  const cleanCode = code.trim().toUpperCase();

  try {
    const savedSelfCode = localStorage.getItem('realmoney_self_referral_code');
    if (savedSelfCode && savedSelfCode.toUpperCase() === cleanCode) {
      return true;
    }

    const currentUserRaw = localStorage.getItem('kamaonow_user');
    if (currentUserRaw) {
      const cur = JSON.parse(currentUserRaw);
      if (cur.referral_code && cur.referral_code.toUpperCase() === cleanCode) {
        return true;
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
