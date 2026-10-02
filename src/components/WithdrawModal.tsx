import React, { useState } from 'react';
import { X, CheckCircle2, Building, Smartphone, ArrowRight, ShieldCheck } from 'lucide-react';
import type { WithdrawalMethod } from '../types/kamaonow';

interface WithdrawModalProps {
  availableBalance: number;
  userPhone: string;
  onClose: () => void;
  onRequestWithdrawal: (payload: {
    amount: number;
    method: WithdrawalMethod;
    upiId?: string;
    bankAccount?: string;
    bankIfsc?: string;
  }) => { ok: boolean; error?: string };
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  availableBalance,
  onClose,
  onRequestWithdrawal,
}) => {
  const [method, setMethod] = useState<WithdrawalMethod>('UPI');
  const [amount, setAmount] = useState<string>('10');
  const [upiId, setUpiId] = useState<string>('rohan@okaxis');
  const [bankAccount, setBankAccount] = useState<string>('919876543210');
  const [bankIfsc, setBankIfsc] = useState<string>('PYTM0123456');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      setErrorMsg('Minimum withdrawal amount is ₹10.00');
      return;
    }
    if (numAmount > availableBalance) {
      setErrorMsg(`Insufficient balance. Your available balance is ₹${availableBalance.toFixed(2)}`);
      return;
    }

    if (method === 'UPI' && !upiId.includes('@')) {
      setErrorMsg('Please enter a valid UPI ID (e.g. mobile@ybl or name@okaxis)');
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
      setSuccessMsg(`Withdrawal request of ₹${numAmount.toFixed(2)} submitted! Admin will verify and process.`);
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setErrorMsg(res.error || 'Failed to submit withdrawal');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      {/* Crisp White Card Modal matching Image 1 Screen 5 and Image 2 */}
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-slide-up">
        {/* Mobile grab handle */}
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Fast Bank Payout</div>
            <h2 className="text-lg font-black text-slate-900">Withdrawal</h2>
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
                  <div className="text-xs font-black text-slate-900">UPI (Recommended)</div>
                  <div className="text-[10px] text-emerald-700 font-medium">Instant • Secure • Direct</div>
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
                  <div className="text-[10px] text-slate-500 font-medium">1-3 Working Days</div>
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
                placeholder="yourname@okaxis"
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

          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="font-bold text-slate-700">Minimum Withdrawal Amount ₹10</label>
              <button
                type="button"
                onClick={() => setAmount(String(Math.floor(availableBalance)))}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Max: ₹{availableBalance.toFixed(2)}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-500 font-black text-sm">
                ₹
              </span>
              <input
                type="number"
                min={10}
                step={1}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
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
            Request Withdrawal
          </button>

          <p className="text-[11px] text-center text-slate-500 pt-1">
            Withdrawal manually approve kiya jayega (Direct Bank Transfer).
          </p>
        </form>
      </div>
    </div>
  );
};
