import React, { useState } from 'react';
import { X, CheckCircle2, Building, Smartphone, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import type { WithdrawalMethod } from '../types/kamaonow';

interface WithdrawModalProps {
  availableBalance: number;
  userPhone: string;
  isFirstWithdrawal?: boolean;
  onClose: () => void;
  onRequestWithdrawal: (payload: {
    amount: number;
    method: WithdrawalMethod;
    upiId?: string;
    bankAccount?: string;
    bankIfsc?: string;
  }) => { ok: boolean; error?: string };
  onOpenRules?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  availableBalance,
  isFirstWithdrawal = true,
  onClose,
  onRequestWithdrawal,
  onOpenRules,
}) => {
  const minWithdrawal = isFirstWithdrawal ? 20 : 100;
  const quickAmounts = isFirstWithdrawal ? [20, 50, 100, 200] : [100, 200, 500, 1000];

  const [method, setMethod] = useState<WithdrawalMethod>('UPI');
  const [amount, setAmount] = useState<string>(String(minWithdrawal));
  const [upiId, setUpiId] = useState<string>('user@okaxis');
  const [bankAccount, setBankAccount] = useState<string>('919876543210');
  const [bankIfsc, setBankIfsc] = useState<string>('PYTM0123456');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < minWithdrawal) {
      setErrorMsg(
        isFirstWithdrawal
          ? 'Pehli baar minimum withdrawal ₹20.00 hai.'
          : 'Minimum withdrawal amount ₹100.00 hai.'
      );
      return;
    }
    if (numAmount > availableBalance) {
      setErrorMsg(`Apke wallet me paryapt balance nahi hai. Available balance: ₹${availableBalance.toFixed(2)}`);
      return;
    }

    if (method === 'UPI' && !upiId.includes('@')) {
      setErrorMsg('Kripya valid UPI ID daalein (jaise number@paytm ya name@okaxis)');
      return;
    }

    const res = onRequestWithdrawal({
      amount: numAmount,
      method,
      upiId: method === 'UPI' ? upiId : undefined,
      bankAccount: method === 'Bank' ? bankAccount : undefined,
      bankIfsc: method === 'Bank' ? bankIfsc : undefined,
    });

    if (res.ok) {
      setSuccessMsg(`₹${numAmount.toFixed(2)} ka withdrawal request submit ho gaya! Turant UPI me aayega.`);
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setErrorMsg(res.error || 'Failed to submit withdrawal');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-slide-up">
        {/* Mobile grab handle */}
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Fast UPI / Bank Payout</div>
            <h2 className="text-lg font-black text-slate-900">Withdraw Cash</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Balance card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-600 font-medium">Available Balance</div>
              <div className="text-2xl font-black font-mono text-emerald-700 mt-0.5">
                ₹{availableBalance.toFixed(2)}
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
              Instant Payout
            </span>
          </div>

          {/* First-time vs Subsequent Rule Banner */}
          <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 font-bold ${
            isFirstWithdrawal
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}>
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              {isFirstWithdrawal ? (
                <span>
                  🔥 <strong>1st Withdrawal Special Offer:</strong> Sirf <strong>₹20</strong> par pehla withdrawal karein! (Agli baar se minimum ₹100 hoga).
                </span>
              ) : (
                <span>
                  ✅ Standard Withdrawal Rule: Minimum withdrawal <strong>₹100</strong> hai.
                </span>
              )}
            </div>
          </div>

          {/* Select Withdrawal Method */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Select Withdrawal Method
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMethod('UPI')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  method === 'UPI'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm text-slate-900'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  {method === 'UPI' && <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />}
                </div>
                <div className="mt-2.5">
                  <div className="text-xs font-black text-slate-900">UPI (Instant)</div>
                  <div className="text-[10px] text-emerald-700 font-medium">GPay • PhonePe • Paytm</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('Bank')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  method === 'Bank'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm text-slate-900'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Building className="w-5 h-5 text-emerald-600" />
                  {method === 'Bank' && <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />}
                </div>
                <div className="mt-2.5">
                  <div className="text-xs font-black text-slate-900">Bank Transfer</div>
                  <div className="text-[10px] text-slate-500 font-medium">Direct IMPS / NEFT</div>
                </div>
              </button>
            </div>
          </div>

          {/* Details input */}
          {method === 'UPI' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Enter UPI ID</label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourmobile@paytm or name@okaxis"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  required
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="e.g. 919876543210"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bank IFSC Code</label>
                <input
                  type="text"
                  required
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  placeholder="PYTM0123456"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          )}

          {/* Amount input & Quick Chips */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label className="font-bold text-slate-700">
                Amount Daalein (Min: ₹{minWithdrawal})
              </label>
              <button
                type="button"
                onClick={() => setAmount(String(Math.floor(availableBalance)))}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Max: ₹{availableBalance.toFixed(2)}
              </button>
            </div>

            <div className="relative mb-2.5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-500 font-black text-sm">
                ₹
              </span>
              <input
                type="number"
                min={minWithdrawal}
                step={1}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Quick chips */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold">Fast:</span>
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer ${
                    amount === String(q)
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ₹{q}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-sm transition-all shadow-md active:scale-98 cursor-pointer mt-2"
          >
            Request Withdrawal (₹{amount})
          </button>

          {onOpenRules && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRules();
              }}
              className="w-full text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer py-1"
            >
              📜 Paisa Nikaalne Ke Sabhi Niyam Padhein ›
            </button>
          )}

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Encrypted • Verified Bank Settlement</span>
          </div>
        </form>
      </div>
    </div>
  );
};
