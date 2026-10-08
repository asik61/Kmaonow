import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  X,
  ExternalLink,
  Upload,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Camera,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  Clock,
  Coins,
  Lightbulb,
  Check,
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  HelpCircle,
  Smartphone,
  Share2,
} from 'lucide-react';
import type { TaskItem, TaskSubmission } from '../types/kamaonow';
import {
  compressScreenshot,
  generateSyntheticProofReceipt,
  type CompressedResult,
} from '../utils/compressScreenshot';

interface TaskModalProps {
  task: TaskItem | null;
  existingSubmission?: TaskSubmission;
  userPhone: string;
  onClose: () => void;
  onSubmitProof: (payload: { taskId: string; proofDataUrl: string; sizeKb: number; note?: string }) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  existingSubmission,
  userPhone,
  onClose,
  onSubmitProof,
}) => {
  const [compressing, setCompressing] = useState(false);
  const [compressed, setCompressed] = useState<CompressedResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userNote, setUserNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'guide' | 'proof'>('guide');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  if (!task) return null;

  const processFile = async (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Kripya image ya screenshot file select karein (.jpg, .png, .jpeg)');
      return;
    }
    setCompressing(true);
    try {
      const res = await compressScreenshot(file);
      setCompressed(res);
      setActiveTab('proof'); // Switch to proof view to preview
    } catch (err) {
      console.error('Compression failed', err);
      setErrorMsg('Screenshot process karne me dikkat aayi. Kripya doosri photo chunein.');
    } finally {
      setCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleGenerateSample = () => {
    const res = generateSyntheticProofReceipt(task.title, task.reward_amount, userPhone);
    setCompressed(res);
    setErrorMsg(null);
    setActiveTab('proof');
  };

  const handleRemoveScreenshot = () => {
    setCompressed(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compressed) {
      setErrorMsg('Kripya task complete hone ka screenshot upload karein.');
      return;
    }
    setSubmitting(true);
    setVerificationSuccess(true);
    setTimeout(() => {
      onSubmitProof({
        taskId: task.id,
        proofDataUrl: compressed.dataUrl,
        sizeKb: compressed.compressedKb,
        note: userNote.trim() || undefined,
      });
      setSubmitting(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-full bg-slate-100 flex flex-col overflow-hidden animate-fade-in">
      {/* ========================================================= */}
      {/* 1. TOP FULL-SCREEN APP BAR (STICKY HEADER)                */}
      {/* ========================================================= */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-3 shrink-0 shadow-xs z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              title="Back to tasks"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {task.category || 'Special Task'}
                </span>
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 inline" /> Verified Offer
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate max-w-[200px] sm:max-w-sm">
                {task.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold block">Reward</span>
              <span className="font-mono font-black text-emerald-600 text-base sm:text-lg">
                ₹{task.reward_amount.toFixed(0)}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SCROLLABLE MAIN CONTENT AREA                           */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
          
          {/* ========================================================= */}
          {/* APP HERO CARD WITH REWARD HIGHLIGHT                       */}
          {/* ========================================================= */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3.5">
              {task.image_url ? (
                <img
                  src={task.image_url}
                  alt={task.title}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-md shrink-0 border-2 border-emerald-100 bg-white"
                />
              ) : (
                <div
                  style={{ backgroundColor: task.icon_bg || '#059669' }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-md shrink-0 border-2 border-white/50"
                >
                  {task.icon_label}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {task.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">{task.subtitle}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Genuine Payment • Direct Wallet Transfer</span>
                </div>
              </div>
            </div>

            {/* Glowing Reward Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md relative overflow-hidden flex items-center justify-between">
              <div className="relative z-10">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-100 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-300" />
                  <span>Reward Amount (Cash)</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white mt-0.5">
                  ₹{task.reward_amount.toFixed(2)}
                </div>
              </div>

              <div className="text-right space-y-1 relative z-10">
                <span className="inline-block font-extrabold text-[11px] bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-white">
                  ⚡ Instant Credit
                </span>
                <div className="text-[11px] text-emerald-100 flex items-center justify-end gap-1 font-medium">
                  <Clock className="w-3 h-3 text-emerald-200" />
                  <span>15-30 Min Review</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* NAVIGATION TABS: GUIDE vs PROOF                           */}
          {/* ========================================================= */}
          <div className="flex p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/60 text-xs sm:text-sm font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-white text-emerald-800 font-black shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>1. Kya Karna Hai (Step Guide)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('proof')}
              className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
                activeTab === 'proof'
                  ? 'bg-white text-emerald-800 font-black shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>2. Screenshot Bhejein (Proof)</span>
              {compressed && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              )}
            </button>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: KYA KYA KARNA HAI (ROADMAP & INSTRUCTIONS)         */}
          {/* ========================================================= */}
          {activeTab === 'guide' && (
            <div className="space-y-4 animate-fade-in">
              {/* Step-by-Step Connected List */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>Aapko Kya-Kya Steps Karne Hain:</span>
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Simple Steps
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Instructions from Data */}
                  {task.instructions.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 flex items-start gap-3 hover:border-emerald-300 transition-all shadow-xs"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                          {step}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Final Step: Screenshot */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-start gap-3 shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {task.instructions.length + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-black text-amber-900">
                        Screenshot Le Kar Proof Upload Karein
                      </div>
                      <p className="text-xs text-amber-800 mt-0.5 leading-relaxed font-medium">
                        Complete hone ke baad app ke Profile ya Home Screen ka screenshot lein aur "Screenshot Bhejein (Proof)" tab par jakar upload karein.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dhyan Dene Yogya Baatein (Tips Box) */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2.5">
                <div className="flex items-center gap-2 font-black text-slate-900 text-xs sm:text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Zaroori Baatein & Niyam (Rules):</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 font-medium">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Active aur sahi mobile number se hi OTP verify karein.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Clear screenshot bhejein jisme account ya order ID saaf dikhe.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Admin review (15-30 mins) ke baad seedha ₹{task.reward_amount.toFixed(0)} wallet me add hoga.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PROOF / SCREENSHOT SUBMISSION                      */}
          {/* ========================================================= */}
          {activeTab === 'proof' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 animate-fade-in">
              {existingSubmission ? (
                /* EXISTING SUBMISSION STATUS */
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900">Aapka Screenshot Status:</span>
                    <span
                      className={`font-black uppercase tracking-wider px-3.5 py-1 rounded-full text-xs ${
                        existingSubmission.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : existingSubmission.status === 'rejected'
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : 'bg-amber-100 text-amber-700 border border-amber-300'
                      }`}
                    >
                      {existingSubmission.status === 'pending'
                        ? '⏳ Under Review'
                        : existingSubmission.status === 'approved'
                        ? '✅ Approved'
                        : '❌ Rejected'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 font-medium leading-relaxed">
                    {existingSubmission.admin_note ||
                      `Aapka proof receive ho chuka hai. Admin review complete hote hi ₹${task.reward_amount.toFixed(2)} wallet me credit ho jayega.`}
                  </p>

                  {existingSubmission.proof_screenshot_url && (
                    <div className="pt-1">
                      <div className="text-xs font-bold text-slate-500 mb-2">Aapka Bheja Hua Screenshot:</div>
                      <img
                        src={existingSubmission.proof_screenshot_url}
                        alt="Submitted Proof"
                        className="w-40 h-56 object-cover rounded-2xl border-2 border-slate-200 shadow-md"
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* NEW SUBMISSION FORM */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                        Proof Screenshot Upload Karein 📸
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Task complete hone ka screenshot chunein
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateSample}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Sample Receipt</span>
                    </button>
                  </div>

                  {/* Hidden File Inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* UPLOAD BOX */}
                  {!compressed ? (
                    <div className="p-6 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors text-center space-y-3.5">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-sm sm:text-base font-black text-slate-900">
                          {compressing ? 'Screenshot Compress Ho Raha Hai...' : 'Screenshot Select Karein'}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 font-medium">
                          Phone ki Gallery se chunein ya Live Camera se photo lein
                        </div>
                      </div>

                      {/* Dual Action Buttons: Gallery & Camera */}
                      <div className="grid grid-cols-2 gap-3 pt-2 max-w-sm mx-auto">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="py-3 px-4 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                        >
                          <ImageIcon className="w-4 h-4 text-emerald-600" />
                          <span>Gallery Se</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="py-3 px-4 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-teal-600" />
                          <span>Camera Se</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* SCREENSHOT PREVIEW CARD */
                    <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 flex items-start gap-4 relative shadow-sm">
                      <img
                        src={compressed.dataUrl}
                        alt="Proof Preview"
                        className="w-24 h-36 object-cover rounded-xl border-2 border-emerald-300 shadow-sm shrink-0 bg-white"
                      />
                      <div className="flex-1 min-w-0 space-y-2 py-1">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs sm:text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Screenshot Tayyar Hai!</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                          File size: <strong className="font-mono text-emerald-700">{compressed.compressedKb} KB</strong> (Fast verification ready)
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                          >
                            Change Photo
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={handleRemoveScreenshot}
                            className="text-xs font-bold text-rose-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hatao</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Optional Note / Registered Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Optional Note / Registered Mobile Number:
                    </label>
                    <input
                      type="text"
                      value={userNote}
                      onChange={(e) => setUserNote(e.target.value)}
                      placeholder="e.g. Registered with 9876543210 ya Order ID"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Proof Submit CTA */}
                  <button
                    type="submit"
                    disabled={!compressed || submitting}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:bg-slate-200 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-black text-sm sm:text-base transition-all shadow-[0_6px_20px_rgba(5,150,105,0.35)] active:scale-98 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? (verificationSuccess ? '⚡ Verifying & Crediting Cash...' : 'Bheja Ja Raha Hai...')
                      : compressed
                      ? `🚀 Submit Proof & Claim ₹${task.reward_amount.toFixed(2)}`
                      : 'Pehle Upar Se Screenshot Select Karein 📸'}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant Verification &amp; Direct Wallet Credit (₹{task.reward_amount.toFixed(0)})</span>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. STICKY BOTTOM BAR                                      */}
      {/* ========================================================= */}
      <div className="bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3.5 sm:p-4 shrink-0 shadow-lg z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          {activeTab === 'guide' ? (
            <>
              <a
                href={task.partner_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
              >
                <span>👉 Start Offer (Open {task.title})</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => setActiveTab('proof')}
                className="py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer shrink-0"
              >
                <span>Upload Proof</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('guide')}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Guide Dekhein</span>
              </button>

              <a
                href={task.partner_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>App Dobara Kholein</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
