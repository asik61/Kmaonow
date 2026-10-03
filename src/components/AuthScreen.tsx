import React, { useState } from 'react';
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
  Users
} from 'lucide-react';
import type { UserProfile } from '../types/kamaonow';
import { KamaoNowLogo3D, HeroPhone3DIllustration } from './Illustrations3D';
import { loginWithFirebaseGoogle, syncUserProfile } from '../services/firebase';
import {
  validateNewAccountOnDevice,
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
  // 'success-bonus': ₹50 bonus celebration
  const [stage, setStage] = useState<
    'initial' | 'google-chooser' | 'link-phone' | 'phone-login' | 'otp-verify' | 'success-bonus'
  >('initial');

  // User data
  const [googleUser, setGoogleUser] = useState<GoogleAccount | null>(null);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<{ user: UserProfile; isNew: boolean } | null>(null);

  // Suggested Google Accounts (including the user's logged in account for seamless 1-tap UX)
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
      setGoogleUser({
        name: realUser.name,
        email: realUser.email,
        avatar: realUser.photoURL,
      });
      setName(realUser.name);
      setLoading(false);
      setStage('link-phone');
    } catch (err: unknown) {
      console.warn('Firebase popup was cancelled or blocked in preview iframe, opening account chooser fallback:', err);
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
      // Move to mobile number linking stage as requested
      setStage('link-phone');
    }, 450);
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
      setError('Kripya apna poora naam daalein');
      return;
    }

    // 1 Phone = 1 Account Anti-Fraud Check
    if (referralCode.trim() && isSelfReferralOnDevice(referralCode)) {
      setError('❌ Self-Referral Banned: Aap apne hi phone se apna referral code use karke bonus nahi loot sakte.');
      return;
    }

    const deviceCheck = validateNewAccountOnDevice(cleanPhone, googleUser?.email);
    if (!deviceCheck.allowed) {
      setError(deviceCheck.reason || '1 Phone = 1 Account: Is device par pehle se ek account linked hai.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStage('otp-verify');
      setOtp('1234'); // Instant test OTP
    }, 500);
  };

  // 4. Verify OTP and finalize registration
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length < 4) {
      setError('Kripya 4-digit OTP daalein (Test OTP: 1234)');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const cleanPhone = phone.replace(/\D/g, '');
      const userCode = `RM${cleanPhone.slice(-4)}${Math.floor(100 + Math.random() * 900)}`;

      const finalUser: UserProfile = {
        id: `usr-${cleanPhone}`,
        name: (name || googleUser?.name || `User ${cleanPhone.slice(-4)}`).trim(),
        phone: `+91 ${cleanPhone}`,
        email: googleUser ? googleUser.email : `${cleanPhone}@realmoneyapp.online`,
        referral_code: userCode,
        referred_by: referralCode.trim() ? referralCode.trim().toUpperCase() : null,
        is_blocked: false,
        is_verified: true,
        role: 'user',
        avatar_url:
          googleUser?.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        created_at: new Date().toISOString(),
      };

      // Permanently bind account to this physical device hardware
      registerAccountOnDevice({
        phone: cleanPhone,
        email: googleUser ? googleUser.email : undefined,
        name: finalUser.name,
      });

      setCreatedProfile({ user: finalUser, isNew: true });
      // Sync to real Firestore database
      syncUserProfile(finalUser).catch(console.error);
      setStage('success-bonus');
    }, 700);
  };

  // Quick Demo Bypass
  const handleQuickDemo = () => {
    const demoUser: UserProfile = {
      id: 'usr-demo-001',
      name: 'Aman Sharma',
      phone: '+91 98765 43210',
      email: 'aman.sharma@realmoneyapp.online',
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

  return (
    <div className="fixed inset-0 z-50 w-full h-full min-h-[100dvh] bg-[#F4F8F6] overflow-y-auto flex flex-col items-center select-none">
      <div className="w-full max-w-md min-h-[100dvh] bg-white flex flex-col shadow-none sm:shadow-2xl sm:border-x sm:border-slate-100">
        {/* ========================================================= */}
        {/* HEADER: Clean, Minimal & Premium Emerald Header           */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-b from-[#02231A] via-[#043E2E] to-[#065A43] text-white pt-10 pb-8 px-6 text-center relative overflow-hidden rounded-b-[36px] shadow-md shrink-0">
          {/* Subtle Ambient Light */}
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
        {/* STAGE 1: INITIAL (Clean & Spacious Login Options)         */}
        {/* ========================================================= */}
        {stage === 'initial' && (
          <div className="p-6 sm:p-8 flex-1 grow flex flex-col justify-between space-y-6">
            {/* Header Text */}
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
                {/* Official Google multicolored 'G' icon */}
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
                      className="flex-1 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                    >
                      Login Karein
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddGoogleAccount(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
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
            {/* Google Pill */}
            {googleUser && (
              <div className="flex items-center gap-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <img
                  src={googleUser.avatar}
                  alt={googleUser.name}
                  className="w-7 h-7 rounded-full border border-emerald-300"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-emerald-950 truncate flex items-center gap-1">
                    <span>{googleUser.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                  </div>
                  <div className="text-[10px] text-emerald-700 truncate">{googleUser.email}</div>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  Google Linked
                </span>
              </div>
            )}

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Mobile Number Jodein</h3>
              <p className="text-xs text-slate-500 font-medium">
                Instant UPI Withdrawal aur ₹5 Bonus paane ke liye
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 animate-shake">
                {error}
              </div>
            )}

            {/* Mobile Number Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                <span>WhatsApp / Paytm Mobile Number</span>
                <span className="text-[10px] text-emerald-600 font-bold">UPI Linked Preferred</span>
              </label>
              <div className="flex items-center bg-slate-50 border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-emerald-600 focus-within:bg-white transition-all">
                <span className="px-3.5 py-3 text-xs font-black text-slate-600 bg-slate-100 border-r border-slate-200">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="flex-1 px-3.5 py-3 text-sm font-bold text-slate-900 bg-transparent focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Referral Code (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                <span>Referral Code (Optional)</span>
                <span className="text-[10px] text-emerald-600 font-bold">Have a code?</span>
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-emerald-600 focus-within:bg-white transition-all px-3">
                <Gift className="w-4 h-4 text-amber-500 shrink-0 mr-2" />
                <input
                  type="text"
                  maxLength={8}
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. REAL99"
                  className="w-full py-2.5 text-xs font-bold text-slate-900 bg-transparent uppercase tracking-wider focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm transition-all shadow-[0_6px_20px_rgba(5,150,105,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>{loading ? 'OTP Bhej Rahe Hain...' : 'OTP Bhejein'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* STAGE 4: DIRECT MOBILE LOGIN (Without Google)             */}
        {/* ========================================================= */}
        {stage === 'phone-login' && (
          <form onSubmit={handleSendOtp} className="p-6 sm:p-7 flex-1 grow flex flex-col justify-between space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Mobile OTP Login / Sign-Up</h3>
              <p className="text-xs text-slate-500 font-medium">Apna mobile number daalein aur OTP paayein</p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 animate-shake">
                {error}
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">Apna Poora Naam</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Asik Khan"
                className="w-full px-3.5 py-3 text-sm font-bold text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-emerald-600 focus:bg-white focus:outline-none transition-all"
                autoFocus
              />
            </div>

            {/* Phone Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">Mobile Number (+91)</label>
              <div className="flex items-center bg-slate-50 border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-emerald-600 focus-within:bg-white transition-all">
                <span className="px-3.5 py-3 text-xs font-black text-slate-600 bg-slate-100 border-r border-slate-200">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="flex-1 px-3.5 py-3 text-sm font-bold text-slate-900 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Referral Code (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                <span>Referral Code (Optional)</span>
                <span className="text-[10px] text-emerald-600 font-bold">Have a code?</span>
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-emerald-600 focus-within:bg-white transition-all px-3">
                <Gift className="w-4 h-4 text-amber-500 shrink-0 mr-2" />
                <input
                  type="text"
                  maxLength={8}
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. REAL99"
                  className="w-full py-2.5 text-xs font-bold text-slate-900 bg-transparent uppercase tracking-wider focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm transition-all shadow-[0_6px_20px_rgba(5,150,105,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>{loading ? 'OTP Bhej Rahe Hain...' : 'OTP Bhejein'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* STAGE 5: OTP VERIFICATION                                  */}
        {/* ========================================================= */}
        {stage === 'otp-verify' && (
          <form onSubmit={handleVerifyOtp} className="p-6 sm:p-7 flex-1 grow flex flex-col justify-between space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">OTP Enter Karein</h3>
              <p className="text-xs text-slate-500 font-medium">
                +91 {phone} par 4-digit ka verification code bheja gaya hai
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • •"
                className="w-full py-3.5 text-center text-2xl font-black tracking-[1em] text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-emerald-600 focus:bg-white focus:outline-none transition-all"
                autoFocus
              />

              {/* Auto Fill Demo OTP button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setOtp('1234')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Auto-Fill 1234 (Test OTP)</span>
                </button>
                <span className="text-xs text-slate-400">Resend in 30s</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm transition-all shadow-[0_6px_20px_rgba(5,150,105,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>{loading ? 'Verify Ho Raha Hai...' : 'Verify & Continue'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* STAGE 6: ₹5 WELCOME BONUS 1ST TASK MISSION MODAL          */}
        {/* ========================================================= */}
        {stage === 'success-bonus' && createdProfile && (
          <div className="p-6 sm:p-7 flex-1 grow flex flex-col justify-between text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl animate-bounce">
              <Gift className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Welcome To Real Money App!
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                Badhai Ho, {createdProfile.user.name.split(' ')[0]}! 🎉
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Aapka account successfully create ho gaya hai.
              </p>
            </div>

            {/* Welcome Bonus Reserved Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg space-y-1">
              <div className="text-xs font-bold text-emerald-100">Sign-Up Welcome Bonus:</div>
              <div className="text-3xl font-black text-yellow-300 tracking-tight">
                ₹5.00
              </div>
              <div className="text-[11px] text-emerald-100 font-medium">
                (1st Task Complete Karne Par Turant Credit Hoga)
              </div>
            </div>

            {/* Clear Rule Callout Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-bold flex items-center gap-2.5 text-left">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                🎯 <strong>Niyam:</strong> Yeh ₹5.00 Welcome Bonus aapko apna <strong>1st Task complete</strong> karke approve hone par reward ke sath wallet me milega!
              </span>
            </div>

            <button
              onClick={() => onLoginSuccess(createdProfile.user, createdProfile.isNew)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white font-black text-sm transition-all shadow-[0_8px_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>1st Task Karke ₹5 Le &rarr;</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
