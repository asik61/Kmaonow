import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Gift,
  ArrowRight,
  AlertCircle,
  Lock,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import type { UserProfile } from '../types/kamaonow';
import { KamaoNowLogo3D } from './Illustrations3D';
import {
  loginWithFirebaseGoogle,
  syncUserProfile,
  findUserByEmail,
} from '../services/firebase';
import {
  getDeviceInfo,
  verifyDeviceBinding,
  bindDeviceToUser,
} from '../services/deviceSecurity';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile, isNewUser: boolean) => void;
}

export function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [manualEmail, setManualEmail] = useState('');

  /**
   * Finalize login with Google account
   */
  const finalizeGoogleLogin = async (gUser: {
    uid?: string;
    name: string;
    email: string;
    photoURL?: string;
  }) => {
    setError(null);
    setLoading(true);

    try {
      const normEmail = gUser.email.trim().toLowerCase();
      const isMasterAdmin = normEmail === 'asik94906@gmail.com';

      // 1. Check if user already exists in local storage
      let existingUser: UserProfile | null = null;
      try {
        const raw = localStorage.getItem('kamaonow_all_users');
        if (raw) {
          const list: UserProfile[] = JSON.parse(raw);
          if (Array.isArray(list)) {
            existingUser = list.find((u) => u?.email?.trim().toLowerCase() === normEmail) || null;
          }
        }
      } catch {}

      // 2. Check Firestore if not found locally
      if (!existingUser) {
        try {
          existingUser = await findUserByEmail(normEmail);
        } catch (e) {
          console.warn('Firestore lookup fallback:', e);
        }
      }

      // 3. Strict "1 Phone = 1 Account" Hardware & Device Binding Enforcement
      const deviceInfo = getDeviceInfo();
      const bindingCheck = await verifyDeviceBinding(
        deviceInfo.deviceId,
        normEmail,
        existingUser?.id
      );

      if (!bindingCheck.allowed) {
        setLoading(false);
        setError(
          bindingCheck.errorMessage ||
            'Ek mobile par sirf 1 hi account chal sakta hai. Is phone par pehle se dusra account registered hai.'
        );
        return;
      }

      // 4. Check Cloudflare D1
      if (!existingUser) {
        try {
          const res = await fetch(`/api/user/by-email/${encodeURIComponent(normEmail)}`);
          if (res.ok) {
            const d1User = await res.json();
            if (d1User && d1User.id && !d1User.error) {
              existingUser = d1User;
            }
          }
        } catch {}
      }

      const isNewUser = !existingUser;
      const cleanId =
        existingUser?.id ||
        (gUser.uid ? `usr-${gUser.uid}` : `usr-${normEmail.split('@')[0]}-${Date.now().toString().slice(-4)}`);
      const refCode = existingUser?.referral_code || `RM${Math.floor(1000 + Math.random() * 9000)}`;

      const finalUser: UserProfile = {
        id: cleanId,
        name: (gUser.name || existingUser?.name || normEmail.split('@')[0] || 'User').trim(),
        email: normEmail,
        phone: existingUser?.phone || '',
        referral_code: refCode,
        referred_by: existingUser?.referred_by || null,
        is_blocked: existingUser?.is_blocked || false,
        is_verified: true,
        role: isMasterAdmin ? 'admin' : (existingUser?.role || 'user'),
        avatar_url:
          gUser.photoURL ||
          existingUser?.avatar_url ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        created_at: existingUser?.created_at || new Date().toISOString(),
        device_id: deviceInfo.deviceId,
        device_model: deviceInfo.deviceModel,
        last_active: new Date().toISOString(),
      };

      // Bind device to account permanently
      bindDeviceToUser(finalUser, deviceInfo.deviceId, deviceInfo.deviceModel).catch(console.warn);

      // Sync user profile to Firestore & D1 backend
      syncUserProfile(finalUser).catch(console.warn);
      fetch('/api/users/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalUser),
      }).catch(console.warn);

      // Save user in local storage
      localStorage.setItem('kamaonow_user', JSON.stringify(finalUser));

      // Successfully enter the app
      onLoginSuccess(finalUser, isNewUser);
    } catch (err: unknown) {
      console.error('Login finalization error:', err);
      setError('Account login me samasya aayi. Kripya dobara koshish karein.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Primary Action: Trigger Google Auth Popup / Native Dialog
   */
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      // Direct Firebase Google Auth with native account chooser
      const result = await loginWithFirebaseGoogle();
      if (!result) {
        // Redirect initiated for browser if popup was blocked
        return;
      }
      await finalizeGoogleLogin({
        uid: result.uid,
        name: result.name,
        email: result.email,
        photoURL: result.photoURL,
      });
    } catch (err: any) {
      console.warn('Firebase Google Auth error:', err);
      setLoading(false);
      const msg = String(err?.message || err || '');
      if (
        msg.includes('closed-by-user') ||
        msg.includes('cancelled') ||
        msg.includes('popup-closed') ||
        msg.includes('12501')
      ) {
        setError('Login cancel ho gaya. Kripya dobara "Continue with Google" dabayein.');
      } else {
        setError('Google login connect nahi ho paya. Kripya dobara "Continue with Google" dabayein.');
      }
    }
  };

  const handleManualEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setError('Kripya apna sahi Email ID dalein (e.g. name@gmail.com)');
      return;
    }
    await finalizeGoogleLogin({
      name: clean.split('@')[0],
      email: clean,
    });
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-full min-h-[100dvh] bg-[#F4F8F6] overflow-y-auto flex flex-col items-center justify-between select-none">
      <div className="w-full max-w-md min-h-[100dvh] bg-white flex flex-col justify-between shadow-none sm:shadow-2xl sm:border-x sm:border-slate-100">
        {/* ========================================================= */}
        {/* TOP BRAND HEADER (Clean, Deep Emerald & 3D Logo)          */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-b from-[#02231A] via-[#043E2E] to-[#065A43] text-white pt-14 pb-12 px-6 text-center relative overflow-hidden rounded-b-[40px] shadow-lg shrink-0">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />

          {/* 3D App Icon */}
          <div className="relative flex justify-center mb-4">
            <div className="absolute -inset-4 rounded-full bg-emerald-400/25 blur-2xl animate-pulse" />
            <div className="relative transform hover:scale-105 transition-transform duration-300">
              <KamaoNowLogo3D size={88} />
            </div>
          </div>

          {/* Clean App Title */}
          <div className="flex items-center justify-center text-3xl sm:text-4xl font-black tracking-tight leading-none">
            <span className="text-white drop-shadow-sm">Real</span>
            <span className="text-amber-400 ml-2 drop-shadow-sm">Money</span>
            <span className="bg-emerald-950/70 text-emerald-300 text-[10px] font-black ml-2.5 px-2.5 py-0.5 rounded-full border border-emerald-400/40 uppercase tracking-wider">
              APP
            </span>
          </div>

          <p className="text-emerald-100/90 text-xs sm:text-sm font-semibold tracking-wide mt-2">
            Bharat Ka #1 Real Cash &amp; Daily Task Platform
          </p>

          {/* Welcome Bonus Capsule */}
          <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-full text-xs font-black shadow-md border border-amber-300">
            <Gift className="w-4 h-4 text-slate-950 shrink-0" />
            <span>₹5.00 Welcome Bonus on 1st Task</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER BODY: GOOGLE LOGIN (Clean & Direct)                */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In to Continue
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Apne Google Account se 1-Tap me login karein
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Main Primary Action: Big "Continue with Google" Button */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full py-4 px-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-slate-800 font-black text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer group active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                  <span>Connecting with Google...</span>
                </>
              ) : (
                <>
                  {/* Official Google 4-Color Icon */}
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-900 font-bold">Continue with Google</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </>
              )}
            </button>

            {/* Alternative Direct Email Login Option */}
            {!showEmailInput ? (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowEmailInput(true)}
                  className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors underline cursor-pointer"
                >
                  Ya direct Email ID se login karein
                </button>
              </div>
            ) : (
              <form onSubmit={handleManualEmailLogin} className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="Apna Gmail ya Email ID dalein"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={loading || !manualEmail.trim()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    Login
                  </button>
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowEmailInput(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Wapas Google button pe jayein
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 3 Core Trust Badges (Fintech Style) */}
          <div className="pt-2 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
              <Zap className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="text-[10px] font-bold text-slate-800">Instant UPI</span>
              <span className="text-[9px] text-slate-400">Direct Payout</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
              <Gift className="w-4 h-4 text-amber-500 mb-1" />
              <span className="text-[10px] font-bold text-slate-800">₹5 Bonus</span>
              <span className="text-[9px] text-slate-400">On 1st Task</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="text-[10px] font-bold text-slate-800">100% Safe</span>
              <span className="text-[9px] text-slate-400">Verified App</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FOOTER: PRIVACY & STORE COMPLIANCE                        */}
        {/* ========================================================= */}
        <div className="p-6 text-center space-y-2 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            By continuing, you agree to our{' '}
            <a
              href="/privacy-policy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5"
            >
              <span>Terms of Service &amp; Privacy Policy</span>
              <ExternalLink className="w-3 h-3 inline" />
            </a>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Secure 256-Bit Encrypted Google Sign-In</span>
          </div>
        </div>
      </div>
    </div>
  );
}
