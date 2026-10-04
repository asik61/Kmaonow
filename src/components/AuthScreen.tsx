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
  CreditCard,
  Users,
  Bell,
  Check,
  Copy
} from 'lucide-react';
import type { UserProfile } from '../types/kamaonow';
import { KamaoNowLogo3D } from './Illustrations3D';
import { loginWithFirebaseGoogle, syncUserProfile } from '../services/firebase';
import {
  registerAccountOnDevice,
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
  // 'initial': choose Google or Phone
  // 'google-chooser': realistic Google account picker
  // 'link-phone': enter mobile number after Google
  // 'phone-login': direct mobile OTP login
  // 'otp-verify': 4-digit OTP
  // 'success-bonus': ₹5 bonus celebration
  const [stage, setStage] = useState<
    'initial' | 'google-chooser' | 'link-phone' | 'phone-login' | 'otp-verify' | 'success-bonus'
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

  // Play realistic mobile notification chime
  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
      // Audio context silently ignored if autoplay policy restricts
    }
  };

  // Helper to find existing user from storage
  const findExistingUser = (searchPhone: string, searchEmail?: string): UserProfile | null => {
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
          if (cleanSearchPhone && uPhone === cleanSearchPhone) return true;
          if (normEmail && uEmail === normEmail && uPhone) return true;
          return false;
        }) || null
      );
    } catch {
      return null;
    }
  };

  // Suggested Google Accounts
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
      setGoogleUser(gAcc);
      setName(realUser.name);
      setLoading(false);

      // Check if user with this Google account already exists and has a phone number
      const existing = findExistingUser('', realUser.email);
      if (existing && existing.phone) {
        onLoginSuccess(existing, false);
        return;
      }

      setStage('link-phone');
    } catch (err: unknown) {
      console.warn('Firebase popup fallback to account chooser:', err);
      setLoading(false);
      setStage('google-chooser');
    }
  };

  // 2. Choose Google Account
  const handleSelectGoogleAccount = (acc: GoogleAccount) => {
    setGoogleUser(acc);
    setName(acc.name);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // If this account is already registered with a phone number, log in directly!
      const existing = findExistingUser('', acc.email);
      if (existing && existing.phone) {
        onLoginSuccess(existing, false);
        return;
      }
      setStage('link-phone');
    }, 350);
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
    handleSelectGoogleAccount(acc);
  };

  // 3. Send OTP (Used by both Google Link-Phone and Direct Phone Login)
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Kripya 10-digit ka valid mobile number daalein (+91)');
      return;
    }

    if (stage === 'phone-login' && !name.trim()) {
      // Auto assign default name if empty
      setName(`User ${cleanPhone.slice(-4)}`);
    }

    // 1 Phone = 1 Account Anti-Fraud Check
    if (referralCode.trim() && isSelfReferralOnDevice(referralCode)) {
      setError('❌ Self-Referral Banned: Aap apna referral code use nahi kar sakte.');
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

  // 4. Verify OTP and finalize registration or login
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
    setTimeout(() => {
      setLoading(false);
      const userEmail = googleUser ? googleUser.email.trim().toLowerCase() : `${cleanPhone}@realmoneyapp.online`;
      const isMasterAdmin = userEmail === 'asik94906@gmail.com' || cleanPhone === '6202636470';

      // Check if user already exists
      const existing = findExistingUser(cleanPhone, userEmail);

      if (existing) {
        // RETURNING EXISTING USER: Update profile if needed & restore
        const updatedExistingUser: UserProfile = {
          ...existing,
          phone: `+91 ${cleanPhone}`,
          email: googleUser ? googleUser.email : existing.email,
          avatar_url: googleUser?.avatar || existing.avatar_url,
          role: isMasterAdmin ? 'admin' : existing.role || 'user',
          is_verified: true,
        };

        registerAccountOnDevice(cleanPhone, updatedExistingUser.email, updatedExistingUser.name);
        syncUserProfile(updatedExistingUser).catch(console.error);

        onLoginSuccess(updatedExistingUser, false);
      } else {
        // NEW USER: Create fresh account
        const userCode = `RM${cleanPhone.slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
        const finalUser: UserProfile = {
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

        registerAccountOnDevice(cleanPhone, googleUser ? googleUser.email : undefined, finalUser.name);
        syncUserProfile(finalUser).catch(console.error);

        setCreatedProfile({ user: finalUser, isNew: true });
        setStage('success-bonus');
      }
    }, 450);
  };

  // Quick Demo Bypass
  const handleQuickDemo = () => {
    const demoUser: UserProfile = {
      id: 'usr-asik-01',
      name: 'Asik Khan (Master Admin)',
      phone: '+91 62026 36470',
      email: 'asik94906@gmail.com',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      referral_code: 'REAL99',
      referred_by: null,
      is_blocked: false,
      is_verified: true,
      role: 'admin',
      created_at: '2026-09-01T00:00:00Z',
    };
    onLoginSuccess(demoUser, false);
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
                Your login verification OTP is <strong className="text-yellow-300 font-mono text-base px-2 py-0.5 bg-slate-800 rounded-md border border-slate-600 tracking-widest">{otpNotification.code}</strong>. Valid for 10 min.
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
                  setStage(googleUser ? 'link-phone' : 'phone-login');
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
        {/* STAGE 1: INITIAL (Google or Mobile Login)                 */}
        {/* ========================================================= */}
        {stage === 'initial' && (
          <div className="p-6 sm:p-8 flex-1 grow flex flex-col justify-between space-y-6">
            <div className="text-center space-y-1 pt-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kamaai Shuru Karein</h2>
              <p className="text-xs text-slate-500 font-medium">
                Apne account me login karein ya naya account banayein
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3.5 my-auto w-full">
              {/* PRIMARY: Continue with Google Button */}
              <button
                type="button"
                onClick={handleStartGoogleAuth}
                className="w-full py-4 px-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-slate-800 font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer group active:scale-[0.98]"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
                <span className="ml-auto text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Fast
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Ya Mobile Number Se
                </span>
              </div>

              {/* SECONDARY: Continue with Mobile OTP */}
              <button
                type="button"
                onClick={() => {
                  setGoogleUser(null);
                  setStage('phone-login');
                }}
                className="w-full py-4 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Mobile Number Se Login Karein</span>
              </button>

              {/* Direct Demo Link */}
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-emerald-700 font-medium transition-colors cursor-pointer"
              >
                Direct Demo Account Se Kholen &rarr;
              </button>
            </div>

            {/* Minimal Clean Trust Badges */}
            <div className="pt-3 pb-2 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Safe UPI
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Instant Withdrawal
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
                  {error && <div className="text-[11px] text-rose-600 font-bold">{error}</div>}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                    >
                      Login Karein
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
                  onClick={() => setShowAddGoogleAccount(true)}
                  className="w-full p-3 rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 text-slate-600 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Use Another Google Account</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-tight">
              To continue, Google will share your name, email address, and profile picture with Real Money App.
            </p>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 3: LINK PHONE NUMBER (Requested after Google)       */}
        {/* ========================================================= */}
        {stage === 'link-phone' && (
          <form onSubmit={handleSendOtp} className="p-6 sm:p-7 flex-1 grow flex flex-col justify-between space-y-4">
            {googleUser && (
              <div className="flex items-center gap-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <img
                  src={googleUser.avatar}
                  alt={googleUser.name}
                  className="w-8 h-8 rounded-full border border-emerald-300"
                />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs font-bold text-slate-900 truncate">{googleUser.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{googleUser.email}</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Google Linked
                </span>
              </div>
            )}

            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900">Mobile Number Jodein</h3>
              <p className="text-xs text-slate-500 font-medium">
                Instant UPI Withdrawal aur ₹5 Bonus paane ke liye
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp / Paytm Mobile Number
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500 font-bold text-sm">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-13 pr-4 py-3.5 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 font-bold text-base focus:bg-white focus:border-emerald-500 focus:outline-none tracking-wider"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. REAL99"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 font-mono text-sm uppercase focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white font-black text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>OTP Bhejein</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* STAGE 4: DIRECT PHONE LOGIN FORM                          */}
        {/* ========================================================= */}
        {stage === 'phone-login' && (
          <form onSubmit={handleSendOtp} className="p-6 sm:p-7 flex-1 grow flex flex-col justify-between space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900">Mobile Number Se Login</h3>
              <p className="text-xs text-slate-500 font-medium">
                4-digit OTP aayega verification ke liye
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Apna Naam</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 font-bold text-sm focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500 font-bold text-sm">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-13 pr-4 py-3.5 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 font-bold text-base focus:bg-white focus:border-emerald-500 focus:outline-none tracking-wider"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. REAL99"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 font-mono text-sm uppercase focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white font-black text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>OTP Bhejein</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* STAGE 5: OTP VERIFY                                       */}
        {/* ========================================================= */}
        {stage === 'otp-verify' && (
          <form onSubmit={handleVerifyOtp} className="p-6 sm:p-7 flex-1 grow flex flex-col justify-between space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900">OTP Enter Karein</h3>
              <p className="text-xs text-slate-500 font-medium">
                +91 {phone} par 4-digit ka OTP bheja gaya hai
              </p>
            </div>

            <div className="space-y-4 text-center">
              <div>
                <input
                  type="tel"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-48 mx-auto text-center py-3.5 rounded-2xl border-2 border-emerald-500 bg-slate-50 text-slate-900 font-mono font-black text-3xl tracking-[1em] focus:bg-white focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="text-xs text-slate-500">
                {resendTimer > 0 ? (
                  <span>Resend OTP in <strong>{resendTimer}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Resend OTP Now
                  </button>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium text-left">
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white font-black text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* STAGE 6: SUCCESS BONUS CELEBRATION                        */}
        {/* ========================================================= */}
        {stage === 'success-bonus' && createdProfile && (
          <div className="p-6 sm:p-8 flex-1 grow flex flex-col justify-between items-center text-center space-y-4 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-4xl shadow-inner mt-4">
              🎉
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-slate-900">Welcome to Real Money!</h2>
              <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                Aapka account successfully create ho chuka hai. Pehla task complete karke ₹5.00 Welcome Bonus claim karein!
              </p>
            </div>

            <div className="w-full p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Aapka Referral Code:</span>
                <span className="font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                  {createdProfile.user.referral_code}
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                Dosto ko invite karein aur har successful task par ₹5.00 kamayein!
              </div>
            </div>

            <button
              type="button"
              onClick={() => onLoginSuccess(createdProfile.user, createdProfile.isNew)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-black text-sm shadow-lg active:scale-98 cursor-pointer"
            >
              Let's Start Earning 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
