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
  UserCheck
} from 'lucide-react';
import type { UserProfile } from '../types/kamaonow';
import { KamaoNowLogo3D } from './Illustrations3D';

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

  // 1. Google 1-Tap Trigger
  const handleStartGoogleAuth = () => {
    setError('');
    setStage('google-chooser');
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

      setCreatedProfile({ user: finalUser, isNew: true });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* ========================================================= */}
        {/* HEADER: Real Money App Branding                           */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-br from-[#045D44] via-[#059669] to-[#047857] text-white p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />

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
              className="absolute top-4 left-4 p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex justify-center mb-3">
            <KamaoNowLogo3D size={64} />
          </div>

          <div className="flex items-center justify-center text-2xl font-black tracking-tight leading-none">
            <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">Real</span>
            <span className="text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] ml-1.5">Money</span>
            <span className="text-emerald-100 text-[10px] font-black ml-1.5 px-2 py-0.5 bg-emerald-950/40 rounded border border-emerald-400/30">
              APP
            </span>
          </div>

          <p className="text-emerald-100 text-xs font-medium mt-1">
            Bharat Ka #1 Real Cash &amp; Daily Task Earning Platform
          </p>

          <div className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1 bg-amber-400 text-slate-900 rounded-full text-xs font-black shadow-md">
            <Gift className="w-3.5 h-3.5 text-slate-950" />
            <span>Sign-Up Karein Aur Paayein ₹50 Free Bonus!</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STAGE 1: INITIAL (Sign in with Google + Mobile Option)    */}
        {/* ========================================================= */}
        {stage === 'initial' && (
          <div className="p-6 space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Kamaai Shuru Karein</h3>
              <p className="text-xs text-slate-500 font-medium">
                Instant UPI Withdrawal • 0 Investment • Safe &amp; Trusted
              </p>
            </div>

            {/* PRIMARY: Continue with Google Button */}
            <button
              onClick={handleStartGoogleAuth}
              className="w-full py-3.5 px-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-slate-800 font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer group active:scale-[0.98]"
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
                1-Tap Fast
              </span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Ya Mobile Number Se
              </span>
            </div>

            {/* SECONDARY: Continue with Mobile OTP */}
            <button
              onClick={() => {
                setGoogleUser(null);
                setStage('phone-login');
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Mobile Number Se Login / Sign-Up Karein</span>
            </button>

            {/* Demo Quick Button */}
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2 text-center text-xs text-slate-400 hover:text-emerald-700 font-medium transition-colors cursor-pointer"
            >
              Direct Demo Account Se Kholein &rarr;
            </button>

            {/* Trust Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Safe UPI
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Instant Withdrawal
              </span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 2: GOOGLE ACCOUNT CHOOSER SHEET                     */}
        {/* ========================================================= */}
        {stage === 'google-chooser' && (
          <div className="p-6 space-y-4">
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
          <form onSubmit={handleSendOtp} className="p-6 space-y-4">
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
                Instant UPI Withdrawal aur ₹50 Bonus paane ke liye
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
                <span className="text-[10px] text-amber-600 font-bold">+₹10 Extra Bonus</span>
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
          <form onSubmit={handleSendOtp} className="p-6 space-y-4">
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
                <span className="text-[10px] text-amber-600 font-bold">+₹10 Extra Bonus</span>
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
          <form onSubmit={handleVerifyOtp} className="p-6 space-y-4">
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
        {/* STAGE 6: ₹50 WELCOME BONUS CELEBRATION MODAL              */}
        {/* ========================================================= */}
        {stage === 'success-bonus' && createdProfile && (
          <div className="p-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl animate-bounce">
              <Gift className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Grand Welcome Bonus!
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                Badhai Ho, {createdProfile.user.name.split(' ')[0]}! 🎉
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Aapka Real Money App account successfully ban gaya hai!
              </p>
            </div>

            {/* Glowing Bonus Amount Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg space-y-1">
              <div className="text-xs font-bold text-emerald-100">Wallet Me Credit Hua:</div>
              <div className="text-3xl font-black text-yellow-300 tracking-tight">
                {createdProfile.user.referred_by ? '₹60.00' : '₹50.00'}
              </div>
              <div className="text-[10px] text-emerald-100">
                {createdProfile.user.referred_by
                  ? '(₹50 Welcome Bonus + ₹10 Referral Bonus)'
                  : '(Instant Real Cash Sign-Up Bonus)'}
              </div>
            </div>

            <button
              onClick={() => onLoginSuccess(createdProfile.user, createdProfile.isNew)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white font-black text-sm transition-all shadow-[0_8px_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>App Me Shuru Karein &rarr;</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
