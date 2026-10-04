import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Gift,
  Share2,
  Disc,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Clock,
  Smartphone,
  Info
} from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWithdrawal?: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  onOpenWithdrawal,
}) => {
  const [activeTab, setActiveTab] = useState<'earning' | 'withdrawal' | 'refer' | 'tasks' | 'fairplay'>('earning');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white border border-slate-100 text-slate-900 shadow-2xl flex flex-col animate-slide-up">
        {/* Mobile Grab Bar */}
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">
                Official Guidelines
              </div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Kamaai Ke Niyam &amp; Policy A to Z
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Navigation Pills */}
        <div className="p-3 bg-slate-50 border-b border-slate-100 overflow-x-auto flex items-center gap-1.5 scrollbar-none text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('earning')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'earning'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            💰 Kitna Paisa Milega
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('withdrawal')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'withdrawal'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            🏦 Paisa Nikaalne Ke Niyam
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('refer')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'refer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            👥 Refer &amp; Earn
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            📸 Task &amp; Screenshot
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fairplay')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'fairplay'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            🛡️ Fraud &amp; Ban Policy
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* TAB 1: EARNING RATES */}
          {activeTab === 'earning' && (
            <div className="space-y-3.5 animate-fade-in text-xs text-slate-700">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                <div>
                  <div className="font-black text-sm text-emerald-800">Signup Welcome Bonus</div>
                  <div className="text-[11px] text-emerald-700">₹5.00 (Sirf 1st Task Complete Karne Par Milega)</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-xl text-emerald-600">₹5.00</span>
                  <div className="text-[9px] font-bold text-emerald-700">1st Task Par</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-600" />
                  <span>Kamaai Ke 5 Bada Tarike (Daily Income Rates):</span>
                </h3>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">1. App Install &amp; Register Tasks</span>
                      <p className="text-[11px] text-slate-500">Angel One, Upstox, Groww, Paytm, etc.</p>
                    </div>
                    <span className="font-mono font-black text-emerald-700 text-sm">₹50 – ₹80 / Task</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">2. Daily Login Check-in Bonus</span>
                      <p className="text-[11px] text-slate-500">Roz app open karke claim karein</p>
                    </div>
                    <span className="font-mono font-black text-emerald-700 text-sm">₹0.50 – ₹5.00 / Roz</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">3. Daily Spin &amp; Win</span>
                      <p className="text-[11px] text-slate-500">Roz ke 3 free spins sabhi users ke liye</p>
                    </div>
                    <span className="font-mono font-black text-emerald-700 text-sm">₹1 – ₹20 / Spin</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">4. Scratch Cards</span>
                      <p className="text-[11px] text-slate-500">Instant cashback reward cards</p>
                    </div>
                    <span className="font-mono font-black text-emerald-700 text-sm">Up to ₹25 / Card</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">5. Refer &amp; Earn</span>
                      <p className="text-[11px] text-slate-500">Dost ke 1st task complete hone par</p>
                    </div>
                    <span className="font-mono font-black text-emerald-700 text-sm">₹5.00 / Friend</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[11px]">
                  <strong>Average Daily Earnings:</strong> Ek regular user roz ke ₹150 se ₹400 tak aasaani se kama sakta hai.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: WITHDRAWAL RULES */}
          {activeTab === 'withdrawal' && (
            <div className="space-y-3.5 animate-fade-in text-xs text-slate-700">
              {/* Highlight Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md space-y-2">
                <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                  Special First Withdrawal Rule
                </div>
                <div className="text-xl font-black">
                  Pehla Withdrawal Sirf <span className="text-amber-300 font-mono">₹20</span> Se Shuru!
                </div>
                <p className="text-[11px] text-emerald-100 leading-relaxed font-medium">
                  Naye users ke bharose ke liye pehli baar sirf ₹20 nikaalne ki suvidha di gayi hai taaki aap payment check kar sakein.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>Withdrawal Ke Niyam (Rules A to Z):</span>
                </h3>

                <ul className="space-y-2 text-slate-600 text-xs">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>1st Withdrawal Limit:</strong> Minimum <strong>₹20</strong> (sirf pehli baar).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Regular Withdrawal Limit:</strong> Uske baad minimum <strong>₹100</strong> aur maximum <strong>₹1,000</strong> per day.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Payout Methods:</strong> Instant <strong>UPI ID</strong> (Google Pay, PhonePe, Paytm, BHIM) ya <strong>Direct Bank Transfer</strong> (IMPS).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Transfer Time:</strong> 15 minute se 24 ghante ke andar paisa aapke account me pahunch jata hai.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Charges / TDS:</strong> <strong>₹0 (0% Fee)</strong> — Hum koi charge nahi kaat-te, poora paisa milta hai.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: REFER & EARN RULES */}
          {activeTab === 'refer' && (
            <div className="space-y-3.5 animate-fade-in text-xs text-slate-700">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md">
                <div className="text-[11px] font-bold text-amber-100 uppercase tracking-wider">Referral Program</div>
                <div className="text-xl font-black mt-0.5">
                  ₹5.00 Per Friend (1st Task Complete Karne Par)
                </div>
                <p className="text-[11px] text-amber-100 mt-1">
                  Jab aapka dost apna pehla task successfully complete karega, aapko ₹5 seedha wallet me milenge.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Refer Kaise Kaam Karta Hai?</span>
                </h3>

                <ol className="space-y-2 text-slate-600 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-black text-emerald-600 shrink-0">1.</span>
                    <span>Apna <strong>Referral Code / Link</strong> WhatsApp, Telegram ya dosto ke sath share karein.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-black text-emerald-600 shrink-0">2.</span>
                    <span>Dost app download kare aur signup karte waqt aapka code enter kare.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-black text-emerald-600 shrink-0">3.</span>
                    <span>Jaise hi dost apna <strong>1st Task complete</strong> karta hai aur approve hota hai, aapko <strong>₹5.00 turant</strong> wallet me credit ho jayenge.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-black text-emerald-600 shrink-0">4.</span>
                    <span>Bina 1st task complete kiye refer bonus credit nahi hota hai.</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: TASK & SCREENSHOT RULES */}
          {activeTab === 'tasks' && (
            <div className="space-y-3.5 animate-fade-in text-xs text-slate-700">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Task Complete Karne Ke Sahi Niyam:</span>
                </h3>

                <ul className="space-y-2 text-slate-600 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span><strong>Start Offer Button:</strong> Pehle "Start Offer" button dabakar partner app download karein ya website par register karein.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span><strong>Clear Screenshot:</strong> Task complete hone ke baad confirmation screen ya "Account Created Successfully" ka screenshot lein.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span><strong>Details Visible:</strong> Screenshot me registered mobile number, email ya order/user ID saaf dikhni chahiye.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span><strong>Verification Time:</strong> Proof submit hone ke 12 se 24 ghante ke andar Admin manually verify karke paise wallet me transfer karta hai.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: FAIR PLAY & BAN POLICY */}
          {activeTab === 'fairplay' && (
            <div className="space-y-3.5 animate-fade-in text-xs text-slate-700">
              {/* Highlight Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-md space-y-1.5">
                <div className="flex items-center gap-2 font-black text-sm text-yellow-300">
                  <AlertTriangle className="w-5 h-5 text-yellow-300" />
                  <span>1 Phone = 1 Account Strict FairPlay Niyam</span>
                </div>
                <p className="text-[11px] text-rose-100 leading-relaxed font-medium">
                  Real Money App me fraud aur bonus abuse rokne ke liye automatic <strong>Device Hardware Fingerprint Engine</strong> active hai.
                </p>
              </div>

              {/* 4 Big Rules Breakdown */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Chaar (4) Bada Anti-Fraud Niyam:</span>
                </h3>
                
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>1. Ek Mobile Par Sirf Ek (1) Account Allowed</span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-3.5">
                      Har mobile ka unique hardware signature lock ho jata hai. App delete karke ya logout karke doosre number se naya account banakar baar-baar ₹5 sign-up bonus lena impossible hai.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>2. Self-Referral (Khud Ko Refer Karna) Ban Hai</span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-3.5">
                      Apne hi phone par apna referral code use karke commission nikaalna system turant pakad leta hai. Pakde jaane par referral bonus cancel ho jayega.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>3. Ek (1) UPI ID = Ek (1) Account Lock</span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-3.5">
                      Aapka PhonePe, Google Pay ya Paytm UPI ID sirf aapke ek account se linked hota hai. Agar koi wahi UPI kisi doosre account me daalta hai to payout turant reject ho jayega.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>4. Fake Screenshots &amp; Cloner Apps Prohibited</span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-3.5">
                      Parallel space, App cloner, VPN ya fake/downloaded screenshot submit karne par device permanently blacklisted kar diya jata hai.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                ✅ <strong>Imaandar Users Ke Liye 100% Guarantee:</strong> Agar aap sachme task karte hain to aapka 100% real cash instant aapke bank/UPI me credit hota hai!
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-medium">
            24x7 Support: <span className="font-bold text-slate-800">support@realmoneyapp.online</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all cursor-pointer"
          >
            I Understand (Samajh Gaya) ✓
          </button>
        </div>
      </div>
    </div>
  );
};
