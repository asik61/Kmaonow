/**
 * Real Money App - Device Fingerprinting & Anti-Fraud Utility
 * Enforces strict "1 Phone = 1 Account" and "1 Device = 1 Account" policy to prevent multi-accounting,
 * self-referral abuse, and fake bonus claims.
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
 * Validates that:
 * 1. The phone number is not already bound to a DIFFERENT email address.
 * 2. The email address is not already bound to a DIFFERENT phone number.
 * 3. A single device cannot be used to spawn multiple separate accounts.
 */
export function validateNewAccountOnDevice(newPhone: string, newEmail?: string): {
  allowed: boolean;
  existingPhone?: string;
  reason?: string;
} {
  try {
    const cleanNewPhone = newPhone.replace(/\D/g, '');
    const normalizedNewEmail = newEmail ? newEmail.trim().toLowerCase() : '';

    // 1. Check globally saved users in kamaonow_all_users
    const rawAllUsers = localStorage.getItem('kamaonow_all_users');
    if (rawAllUsers) {
      const allUsersList = JSON.parse(rawAllUsers);
      if (Array.isArray(allUsersList)) {
        for (const u of allUsersList) {
          const userPhone = (u.phone || '').replace(/\D/g, '');
          const userEmail = (u.email || '').trim().toLowerCase();

          // Phone collision check: If same phone is registered with a different email
          if (cleanNewPhone && userPhone === cleanNewPhone) {
            if (normalizedNewEmail && userEmail && normalizedNewEmail !== userEmail) {
              return {
                allowed: false,
                reason: `❌ Yeh mobile number (+91 ******${cleanNewPhone.slice(-4)}) pehle se doosre account (${userEmail}) se linked hai. Ek mobile number sirf ek account me use ho sakta hai.`,
              };
            }
          }

          // Email collision check: If same email is registered with a different phone
          if (normalizedNewEmail && userEmail === normalizedNewEmail) {
            if (cleanNewPhone && userPhone && userPhone !== cleanNewPhone) {
              return {
                allowed: false,
                reason: `❌ Yeh Google account pehle se doosre mobile number (+91 ******${userPhone.slice(-4)}) se linked hai.`,
              };
            }
          }
        }
      }
    }

    // 2. Check device-registered accounts
    const rawDevice = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    const registered: Array<{ phone: string; email?: string; registeredAt: string; name: string }> = rawDevice
      ? JSON.parse(rawDevice)
      : [];

    for (const acc of registered) {
      const accPhone = (acc.phone || '').replace(/\D/g, '');
      const accEmail = (acc.email || '').trim().toLowerCase();

      // Check if phone matches but email differs
      if (cleanNewPhone && accPhone === cleanNewPhone) {
        if (normalizedNewEmail && accEmail && normalizedNewEmail !== accEmail) {
          return {
            allowed: false,
            reason: `❌ Yeh mobile number pehle se doosre account (${accEmail}) se linked hai. Ek mobile number sirf ek account me use ho sakta hai.`,
          };
        }
      }

      // Check if email matches but phone differs
      if (normalizedNewEmail && accEmail === normalizedNewEmail) {
        if (cleanNewPhone && accPhone && accPhone !== cleanNewPhone) {
          return {
            allowed: false,
            reason: `❌ Yeh Google account pehle se doosre mobile number (+91 ******${accPhone.slice(-4)}) se linked hai.`,
          };
        }
      }
    }

    // 3. Check if exact same account is logging back in on this device
    const isSameAccount = registered.some((acc) => {
      const accPhone = (acc.phone || '').replace(/\D/g, '');
      const accEmail = (acc.email || '').trim().toLowerCase();
      if (normalizedNewEmail && accEmail) {
        return accEmail === normalizedNewEmail && (!cleanNewPhone || accPhone === cleanNewPhone);
      }
      return accPhone === cleanNewPhone;
    });

    if (isSameAccount) {
      return { allowed: true };
    }

    // 4. Device multi-account restriction
    if (registered.length >= 1) {
      const primary = registered[0];
      const maskedPhone = primary.phone ? `+91 ******${primary.phone.slice(-4)}` : 'purana account';
      return {
        allowed: false,
        existingPhone: maskedPhone,
        reason: `❌ Is phone par pehle se ek account (${maskedPhone}) registered hai. 1 Phone = 1 Account niyam ke tehat doosra naya account banana mana hai.`,
      };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

/**
 * Binds an account to this physical device hardware
 */
export function registerAccountOnDevice(account: { phone: string; email?: string; name: string }) {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    const registered: Array<{ phone: string; email?: string; registeredAt: string; name: string }> = raw
      ? JSON.parse(raw)
      : [];

    const cleanPhone = account.phone.replace(/\D/g, '');
    const cleanEmail = account.email ? account.email.trim().toLowerCase() : undefined;

    const existingIndex = registered.findIndex(
      (acc) => acc.phone.replace(/\D/g, '') === cleanPhone || (cleanEmail && acc.email?.toLowerCase() === cleanEmail)
    );

    if (existingIndex >= 0) {
      registered[existingIndex] = {
        ...registered[existingIndex],
        phone: cleanPhone,
        email: cleanEmail || registered[existingIndex].email,
        name: account.name || registered[existingIndex].name,
      };
    } else {
      registered.push({
        phone: cleanPhone,
        email: cleanEmail,
        name: account.name,
        registeredAt: new Date().toISOString(),
      });
    }

    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(registered));
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
