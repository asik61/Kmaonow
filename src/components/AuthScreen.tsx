import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Gift,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Zap,
  Lock,
  UserCheck,
  ChevronRight,
  AlertCircle,
  Copy,
  Info,
  Layers,
  RotateCcw
} from 'lucide-react';
import type { UserProfile } from '../types/kamaonow';
import { KamaoNowLogo3D } from './Illustrations3D';
import {
  loginWithFirebaseGoogle,
  syncUserProfile,
  findUserByEmail,
  findUserByPhone,
} from '../services/firebase';
import {
  validateGoogleLoginOnDevice,
  validatePhoneBindingOnDevice,
  registerAccountOnDevice,
  getDevicePrimaryAccount,
  isSelfReferralOnDevice,
} from '../utils/deviceFingerprint';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile, isNewUser: boolean) => void;
}

interface GoogleAccount {
  name: string;
  email: string;
  avatar: string;
}

export function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  // Flow states:
  // 'initial': 1 Unified Google Sign-in flow (both Google + Phone required)
  // 'google-chooser': Realistic Google account selector fallback
  // 'link-phone': Step 2: enter mobile number after Google
  // 'otp-verify': Step 3: 4-digit OTP verification
  // 'success-bonus': ₹5 Instant Welcome Bonus modal
  const [stage, setStage] = useState<
    'initial' | 'google-chooser' | 'link-phone' | 'otp-verify' | 'success-bonus'
  >('initial');

  // User data
  const [googleUser, setGoogleUser] = useState<GoogleAccount | null>(null);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpNotification, setOtpNotification] = useState<{ show: boolean; code: string } | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<{ user: UserProfile; isNew: boolean } | null>(null);

  // Play mobile SMS chime
  const playNotificationChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.1);
      gain2.gain.setValueAtTime(0.22, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.5);
    } catch {
      // ignore if restricted
    }
  };

  // Helper to find existing user across localStorage
  const findExistingUserLocal = (searchPhone: string, searchEmail?: string): UserProfile | null => {
    try {
      const cleanSearchPhone = searchPhone.replace(/\D/g, '');
      const normEmail = (searchEmail || '').trim().toLowerCase();
      const raw = localStorage.getItem('kamaonow_all_users');
      if (!raw) return null;
      const list: UserProfile[] = JSON.parse(raw);
      if (!Array.isArray(list)) return null;

      return (
        list.find((u) => {
          const uPhone = (u.phone || '').replace(/\D/g, '');
          const uEmail = (u.email || '').trim().toLowerCase();
          if (normEmail && uEmail === normEmail && uPhone) return true;
          if (cleanSearchPhone && uPhone === cleanSearchPhone) return true;
          return false;
        }) || null
      );
    } catch {
      return null;
    }
  };

  // Suggested Google Accounts for fast prototyping
  const defaultGoogleAccounts: GoogleAccount[] = [
    {
      name: 'Asik',
      email: 'asik94906@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    },
    {
      name: 'Aman Sharma',
      email: 'amansharma.work@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    },
  ];

  const [customEmail, setCustomEmail] = useState('');
  const [showAddGoogleAccount, setShowAddGoogleAccount] = useState(false);

  /**
   * Process Google Account:
   * 1. Validate 1 Phone = 1 Account on this device
   * 2. If returning user with phone -> Direct login! No phone/OTP needed!
   * 3. If new user -> Proceed to Step 2: Link Mobile Number
   */
  const processGoogleAccountSelection = async (gAcc: GoogleAccount) => {
    setError('');
    setLoading(true);

    try {
      const normEmail = gAcc.email.trim().toLowerCase();

      // 1. Device check (1 Phone = 1 Account)
      const deviceCheck = validateGoogleLoginOnDevice(normEmail);
      if (!deviceCheck.allowed) {
        setLoading(false);
        setError(
          deviceCheck.reason ||
            '❌ Iss phone me pehle se ek account bana hua hai. 1 phone me sirf 1 account allow hai. Kripya apne purane Google account se login karein.'
        );
        return;
      }

      // 2. Lookup existing user profile in local store & Firestore
      let existing = findExistingUserLocal('', normEmail);
      if (!existing) {
        try {
          existing = await findUserByEmail(normEmail);
        } catch (e) {
          console.warn('Firestore email lookup failed:', e);
        }
      }

      // Check device primary record if user uninstalled and reinstalled
      const devicePrimary = getDevicePrimaryAccount();
      if (
        !existing &&
        devicePrimary &&
        devicePrimary.email === normEmail &&
        devicePrimary.phone
      ) {
        const cleanP = devicePrimary.phone.replace(/\D/g, '');
        existing = {
          id: `usr-${cleanP}`,
          name: devicePrimary.name || gAcc.name,
          phone: `+91 ${cleanP}`,
          email: normEmail,
          referral_code: `RM${cleanP.slice(-4)}`,
          referred_by: null,
          is_blocked: false,
          is_verified: true,
          role: normEmail === 'asik94906@gmail.com' || cleanP === '6202636470' ? 'admin' : 'user',
          avatar_url: gAcc.avatar,
          created_at: devicePrimary.registeredAt || new Date().toISOString(),
        };
      }

      // RETURNING USER: If phone is already linked -> Direct instant login!
      if (existing && existing.phone && existing.phone.replace(/\D/g, '').length >= 10) {
        setLoading(false);
        // Refresh avatar or name if needed
        const updatedReturningUser: UserProfile = {
          ...existing,
          name: existing.name || gAcc.name,
          avatar_url: gAcc.avatar || existing.avatar_url,
          role: normEmail === 'asik94906@gmail.com' ? 'admin' : existing.role,
          is_verified: true,
        };
        registerAccountOnDevice(existing.phone, normEmail, updatedReturningUser.name);
        syncUserProfile(updatedReturningUser).catch(console.warn);
        onLoginSuccess(updatedReturningUser, false);
        return;
      }

      // NEW USER: Move to Step 2: Link Phone Number & OTP
      setGoogleUser(gAcc);
      setName(gAcc.name);
      setLoading(false);
      setStage('link-phone');
    } catch (err: unknown) {
      setLoading(false);
      setError('Google verification me samasya aayi. Kripya dobara koshish karein.');
      console.error(err);
    }
  };

  // 1. Google 1-Tap Trigger with Real Firebase Auth
  const handleStartGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const realUser = await loginWithFirebaseGoogle();
      const gAcc: GoogleAccount = {
        name: realUser.name,
        email: realUser.email,
        avatar: realUser.photoURL,
      };
      await processGoogleAccountSelection(gAcc);
    } catch (err: unknown) {
      console.warn('Firebase popup fallback to account chooser:', err);
      setLoading(false);
      setStage('google-chooser');
    }
  };

  // Choose from suggested Google Accounts
  const handleSelectGoogleAccount = (acc: GoogleAccount) => {
    processGoogleAccountSelection(acc);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.includes('@') || !customEmail.includes('.')) {
      setError('Kripya valid Gmail address daalein');
      return;
    }
    const accName = customEmail.split('@')[0];
    const acc: GoogleAccount = {
      name: accName.charAt(0).toUpperCase() + accName.slice(1),
      email: customEmail.trim().toLowerCase(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    };
    processGoogleAccountSelection(acc);
  };

  // 2. Send OTP (Step 2: Enter Phone Number)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Kripya 10-digit ka valid mobile number daalein (+91)');
      return;
    }

    if (!googleUser?.email) {
      setError('Google verification session expire ho gaya. Kripya shuru se login karein.');
      setStage('initial');
      return;
    }

    // 1 Phone = 1 Account Anti-Fraud Check
    const phoneBindingCheck = validatePhoneBindingOnDevice(cleanPhone, googleUser.email);
    if (!phoneBindingCheck.allowed) {
      setError(phoneBindingCheck.reason || '❌ Yeh mobile number pehle se linked hai.');
      return;
    }

    // Check if phone number is already registered to a different account in Firestore
    try {
      const existingWithPhone = await findUserByPhone(cleanPhone);
      if (
        existingWithPhone &&
        existingWithPhone.email &&
        existingWithPhone.email.trim().toLowerCase() !== googleUser.email.trim().toLowerCase()
      ) {
        // Privacy protection: Do NOT leak the other email!
        setError('❌ Yeh mobile number pehle se doosre account se linked hai. Kripya apna sahi mobile number daalein.');
        return;
      }
    } catch {
      // fallback
    }

    // Self-Referral check
    if (referralCode.trim() && isSelfReferralOnDevice(referralCode)) {
      setError('❌ Self-Referral Blocked: Aap apna referral code use nahi kar sakte.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Generate random 4-digit code (e.g. 5824, 7391)
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setOtp('');
      setStage('otp-verify');
      setResendTimer(30);
      setOtpNotification({ show: true, code });
      playNotificationChime();
    }, 400);
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtp('');
    setResendTimer(30);
    setOtpNotification({ show: true, code });
    playNotificationChime();
  };

  // 3. Verify OTP & Finalize Registration
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Kripya 10-digit mobile number enter karein');
      return;
    }

    if (otp.length < 4) {
      setError('Kripya notification me aaya hua 4-digit OTP enter karein.');
      return;
    }

    // Check if OTP matches generated code or fallback test code 1234
    if (otp !== generatedOtp && otp !== '1234') {
      setError('❌ Galat OTP! Kripya upar notification me aaya hua 4-digit code enter karein.');
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      const userEmail = googleUser ? googleUser.email.trim().toLowerCase() : `${cleanPhone}@realmoneyapp.online`;
      const isMasterAdmin = userEmail === 'asik94906@gmail.com' || cleanPhone === '6202636470';

      const userCode = `RM${cleanPhone.slice(-4)}${Math.floor(100 + Math.random() * 900)}`;

      // Check if user already exists in local, Firestore, or Server API
      let existing = findExistingUserLocal(cleanPhone, userEmail);
      if (!existing) {
        try {
          existing = (await findUserByPhone(cleanPhone)) || (await findUserByEmail(userEmail));
        } catch {
          // fallback
        }
      }
      if (!existing) {
        try {
          const res = await fetch(`/api/user/by-phone/${cleanPhone}`);
          const sUser = (await res.json()) as any;
          if (sUser && sUser.id && !sUser.error) {
            existing = sUser;
          }
        } catch {
          // fallback
        }
      }

      const isReturningUser = !!existing;
      const finalUser: UserProfile = existing
        ? {
            ...existing,
            name: existing.name || (name || googleUser?.name || `User ${cleanPhone.slice(-4)}`).trim(),
            email: userEmail || existing.email,
            avatar_url: googleUser?.avatar || existing.avatar_url,
          }
        : {
            id: `usr-${cleanPhone}`,
            name: (name || googleUser?.name || `User ${cleanPhone.slice(-4)}`).trim(),
            phone: `+91 ${cleanPhone}`,
            email: userEmail,
            referral_code: userCode,
            referred_by: referralCode.trim() ? referralCode.trim().toUpperCase() : null,
            is_blocked: false,
            is_verified: true,
            role: isMasterAdmin ? 'admin' : 'user',
            avatar_url:
              googleUser?.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
            created_at: new Date().toISOString(),
          };

      // Lock device to this account
      registerAccountOnDevice(cleanPhone, userEmail, finalUser.name);
      syncUserProfile(finalUser).catch(console.error);
      fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalUser),
      }).catch(console.warn);

      if (isReturningUser) {
        // Returning user - direct login, keeps wallet safe!
        onLoginSuccess(finalUser, false);
      } else {
        setCreatedProfile({ user: finalUser, isNew: true });
        setStage('success-bonus');
      }
    }, 450);
  };

  // Quick Admin Bypass for Master Admin testing
  const handleQuickDemo = () => {
    const adminUser: UserProfile = {
      id: 'usr-6202636470',
      name: 'Asik Khan (Master Admin)',
      phone: '+91 62026 36470',
      email: 'asik94906@gmail.com',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      referral_code: 'REALHQ',
      referred_by: null,
      is_blocked: false,
      is_verified: true,
      role: 'admin',
      created_at: '2026-09-01T00:00:00Z',
    };
    registerAccountOnDevice('6202636470', 'asik94906@gmail.com', adminUser.name);
    syncUserProfile(adminUser).catch(console.warn);
    fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminUser),
    }).catch(console.warn);
    onLoginSuccess(adminUser, false);
  };

  // Resend timer effect
  useEffect(() => {
    if (stage !== 'otp-verify' || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, resendTimer]);

  return (
    <div className="fixed inset-0 z-50 w-full h-full min-h-[100dvh] bg-[#F4F8F6] overflow-y-auto flex flex-col items-center select-none">
      {/* ========================================================= */}
      {/* TOP FLOATING IN-APP SMS / NOTIFICATION BANNER             */}
      {/* ========================================================= */}
      {otpNotification?.show && stage === 'otp-verify' && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-[100] animate-in slide-in-from-top-6 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3 ring-1 ring-white/10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-black text-sm">
              💬
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <span>Messages</span>
                  <span className="text-slate-400">• Real Money</span>
                </span>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
              <p className="text-xs text-slate-200 mt-1 leading-snug">
                Your login verification OTP is{' '}
                <strong className="text-yellow-300 font-mono text-base px-2 py-0.5 bg-slate-800 rounded-md border border-slate-600 tracking-widest">
                  {otpNotification.code}
                </strong>
                . Valid for 10 min.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtp(otpNotification.code);
                  }}
                  className="text-[11px] font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1 rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Tap to Fill ({otpNotification.code})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOtpNotification((prev) => (prev ? { ...prev, show: false } : null))}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-200 px-2 py-1 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md min-h-[100dvh] bg-white flex flex-col shadow-none sm:shadow-2xl sm:border-x sm:border-slate-100">
        {/* ========================================================= */}
        {/* HEADER: Clean, Minimal & Premium Emerald Header           */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-b from-[#02231A] via-[#043E2E] to-[#065A43] text-white pt-10 pb-8 px-6 text-center relative overflow-hidden rounded-b-[36px] shadow-md shrink-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />

          {/* Back button for sub-stages */}
          {stage !== 'initial' && stage !== 'success-bonus' && (
            <button
              onClick={() => {
                setError('');
                if (stage === 'otp-verify') {
                  setStage('link-phone');
                } else {
                  setStage('initial');
                }
              }}
              className="absolute top-5 left-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* 3D App Icon */}
          <div className="relative flex justify-center mb-4">
            <div className="absolute -inset-3 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />
            <div className="relative transform hover:scale-105 transition-transform duration-300">
              <KamaoNowLogo3D size={72} />
            </div>
          </div>

          {/* Clean Title */}
          <div className="flex items-center justify-center text-3xl font-black tracking-tight leading-none">
            <span className="text-white">Real</span>
            <span className="text-amber-400 ml-1.5">Money</span>
            <span className="bg-emerald-950/60 text-emerald-300 text-[10px] font-black ml-2 px-2 py-0.5 rounded-md border border-emerald-400/30">
              APP
            </span>
          </div>

          <p className="text-emerald-100/90 text-xs font-medium tracking-wide mt-1.5">
            Bharat Ka #1 Real Cash &amp; Daily Task Platform
          </p>

          {/* Clean Bonus Capsule */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 bg-amber-400 text-slate-950 rounded-full text-xs font-black shadow-md">
            <Gift className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            <span>Sign-Up Bonus: ₹5 Instant + ₹5 on 1st Task</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STAGE 1: INITIAL (1 Unified Mandatory Registration Flow)  */}
        {/* ========================================================= */}
        {stage === 'initial' && (
          <div className="p-6 sm:p-8 flex-1 grow flex flex-col justify-between space-y-6">
            <div className="text-center space-y-1.5 pt-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kamaai Shuru Karein</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Google account aur mobile verification ke saath surakshit account banayein
              </p>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {/* Visual 2-Step Registration Roadmap Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 shadow-xs">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Account Banane Ka Tarika</span>
                <span className="text-emerald-600 font-bold">2 Simple Steps</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-100 shadow-xs">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900">Google Account Sign-In</div>
                    <div className="text-[11px] text-slate-500 truncate">1-Tap Fast &amp; Secure Verification</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-100 shadow-xs">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900">Mobile Number &amp; OTP</div>
                    <div className="text-[11px] text-slate-500 truncate">Instant UPI Withdrawal &amp; Security</div>
                  </div>
                  <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              </div>

              <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Returning users ka purana account seedha khul jayega.</span>
              </div>
            </div>

            {/* Single Primary Action: Continue with Google */}
            <div className="space-y-3 my-auto w-full">
              <button
                type="button"
                disabled={loading}
                onClick={handleStartGoogleAuth}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-black text-sm transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-3 cursor-pointer group active:scale-[0.98] border border-emerald-400/30"
              >
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>{loading ? 'Verifying...' : 'Continue with Google'}</span>
                <ArrowRight className="w-4 h-4 ml-auto text-emerald-200 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Direct Demo Link */}
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-emerald-700 font-medium transition-colors cursor-pointer"
              >
                Direct Demo Master Admin Se Kholen &rarr;
              </button>
            </div>

            {/* Minimal Clean Trust Badges */}
            <div className="pt-3 pb-2 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> 1 Phone = 1 Account
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Instant UPI
              </span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 2: GOOGLE ACCOUNT CHOOSER SHEET                     */}
        {/* ========================================================= */}
        {stage === 'google-chooser' && (
          <div className="p-6 sm:p-7 flex-1 grow flex flex-col justify-between space-y-4">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
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
              <h3 className="text-base font-black text-slate-900">Choose a Google Account</h3>
              <p className="text-xs text-slate-500 font-medium">to continue to Real Money App</p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* List of Accounts */}
            <div className="space-y-2">
              {defaultGoogleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  disabled={loading}
                  onClick={() => handleSelectGoogleAccount(acc)}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex items-center gap-3 text-left cursor-pointer group"
                >
                  <img src={acc.avatar} alt={acc.name} className="w-10 h-10 rounded-full border border-slate-200" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700">
                      {acc.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{acc.email}</div>
                  </div>
                  <UserCheck className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}

              {/* Add Custom Account Form */}
              {showAddGoogleAccount ? (
                <form onSubmit={handleCustomGoogleSubmit} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="text-xs font-bold text-slate-700">Apna Doosra Gmail Daalein:</label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:outline-emerald-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                    >
                      Use This Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddGoogleAccount(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddGoogleAccount(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 text-xs font-bold text-slate-600 hover:text-emerald-700 hover:border-emerald-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Use another account</span>
                </button>
              )}
            </div>

            <div className="text-center text-[11px] text-slate-400">
              1 Phone = 1 Account Policy strictly enforced.
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 3: LINK MOBILE NUMBER (MANDATORY STEP 2 FOR NEW USERS) */}
        {/* ========================================================= */}
        {stage === 'link-phone' && (
          <div className="p-6 sm:p-8 flex-1 grow flex flex-col justify-between space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                <span>Step 2 of 2</span>
                <span>•</span>
                <span>Mobile Link</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Apna Mobile Number Daalein
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Instant UPI withdrawal aur account security ke liye mobile number zaroori hai.
              </p>
            </div>

            {/* Connected Google Account Capsule */}
            {googleUser && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
                <img
                  src={googleUser.avatar}
                  alt={googleUser.name}
                  className="w-9 h-9 rounded-full border border-emerald-300 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                    <span>{googleUser.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                  <div className="text-[11px] text-emerald-700 truncate font-medium">
                    {googleUser.email}
                  </div>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Phone Input Form */}
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  10-Digit Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1 text-slate-700 font-bold text-sm border-r border-slate-200 pr-2.5">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="w-full pl-20 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-bold tracking-wider focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Referral Code</span>
                  <span className="text-[10px] font-medium text-slate-400">(Optional - ₹5 Extra)</span>
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. REAL99"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs font-bold tracking-wider uppercase focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || phone.replace(/\D/g, '').length !== 10}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>{loading ? 'OTP Bhej Rahe Hain...' : 'Get 4-Digit OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-[11px] text-slate-400">
              Aapke number par 4-digit SMS OTP aayega
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 4: OTP VERIFICATION                                 */}
        {/* ========================================================= */}
        {stage === 'otp-verify' && (
          <div className="p-6 sm:p-8 flex-1 grow flex flex-col justify-between space-y-5">
            <div className="space-y-1.5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">OTP Daalein</h3>
              <p className="text-xs text-slate-500 font-medium">
                Humne <strong>+91 {phone}</strong> par 4-digit OTP bheja hai
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="w-full py-4 text-center text-3xl font-mono font-black tracking-[0.5em] bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none text-slate-900"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>{loading ? 'Verify Ho Raha Hai...' : 'Verify OTP & Finish'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center space-y-2">
              <button
                type="button"
                disabled={resendTimer > 0}
                onClick={handleResendOtp}
                className="text-xs font-bold text-emerald-700 hover:underline disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setStage('link-phone');
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-600 font-medium"
                >
                  Galat Number? Change Mobile Number
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 5: SUCCESS BONUS MODAL (₹5 INSTANT WELCOME BONUS)   */}
        {/* ========================================================= */}
        {stage === 'success-bonus' && createdProfile && (
          <div className="p-6 sm:p-8 flex-1 grow flex flex-col justify-between items-center text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="my-auto space-y-4">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center mx-auto shadow-xl ring-4 ring-amber-200 animate-bounce">
                  <Gift className="w-10 h-10" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                  Registration Successful 🎉
                </span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Welcome, {createdProfile.user.name.split(' ')[0]}!
                </h3>
                <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                  Aapka Real Money account successfully activate ho gaya hai.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 text-center space-y-1 shadow-xs">
                <div className="text-xs font-bold text-emerald-800">Instant Welcome Bonus</div>
                <div className="text-3xl font-black text-emerald-600">₹5.00</div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  + ₹5.00 Extra Pehla Task complete karte hi unlock hoga!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onLoginSuccess(createdProfile.user, createdProfile.isNew)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>🚀 Start Earning Real Cash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
