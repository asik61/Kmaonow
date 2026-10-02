import React, { useState, useRef } from 'react';
import {
  X,
  ExternalLink,
  Upload,
  FileCheck,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Camera,
  Image as ImageIcon,
  Trash2,
  AlertCircle
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
  };

  const handleRemoveScreenshot = () => {
    setCompressed(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compressed) {
      setErrorMsg('Kripya task complete hone ka screenshot upload karein.');
      return;
    }
    setSubmitting(true);
    onSubmitProof({
      taskId: task.id,
      proofDataUrl: compressed.dataUrl,
      sizeKb: compressed.compressedKb,
      note: userNote.trim() || undefined,
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      {/* Crisp White Card Modal */}
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white border border-slate-100 text-slate-900 shadow-2xl flex flex-col animate-slide-up">
        {/* Grab bar on mobile */}
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: task.icon_bg || '#059669' }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm text-white shadow-md shrink-0"
            >
              {task.icon_label}
            </div>
            <div>
              <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">{task.subtitle}</div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">{task.title}</h2>
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

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Reward Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-emerald-800 font-bold">Reward Amount</div>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-0.5">
                ₹{task.reward_amount.toFixed(2)}
              </div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
                Direct Wallet Credit
              </span>
              <div className="text-[10px] text-slate-500 mt-1">Post Admin Review</div>
            </div>
          </div>

          {/* STEP 1: TASK DETAILS & APP LINK */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Step 1: Task Pura Karein
              </h3>
              <span className="text-[11px] font-bold text-emerald-700">Guide</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{task.description}</p>
            <ol className="space-y-1.5 text-xs text-slate-700 pt-1">
              {task.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-white border border-slate-200/60 shadow-xs">
                  <span className="font-mono font-black text-emerald-600 shrink-0">{idx + 1}.</span>
                  <span className="font-medium">{step}</span>
                </li>
              ))}
            </ol>

            <a
              href={task.partner_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <span>{task.title} Partner App Kholein</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* STEP 2: SCREENSHOT SUBMISSION */}
          {existingSubmission ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Aapka Screenshot Status:</span>
                <span
                  className={`font-bold font-mono capitalize px-3 py-1 rounded-full text-xs ${
                    existingSubmission.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : existingSubmission.status === 'rejected'
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-amber-100 text-amber-700 border border-amber-300'
                  }`}
                >
                  {existingSubmission.status === 'pending' ? '⏳ Under Review' : existingSubmission.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                {existingSubmission.admin_note || 'Aapka proof receive ho chuka hai. Admin review ke baad wallet me ₹' + task.reward_amount.toFixed(2) + ' credit ho jayega.'}
              </p>
              {existingSubmission.proof_screenshot_url && (
                <div className="pt-1">
                  <div className="text-[11px] font-bold text-slate-500 mb-1">Uploaded Screenshot:</div>
                  <img
                    src={existingSubmission.proof_screenshot_url}
                    alt="Submitted Proof"
                    className="w-32 h-44 object-cover rounded-xl border border-slate-200 shadow-sm"
                  />
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Step 2: Proof Screenshot Bhejein 📸
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Task complete hone ka screenshot upload karein
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSample}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Sample Receipt</span>
                </button>
              </div>

              {/* Hidden HTML file inputs for Gallery & Camera */}
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

              {/* Upload UI Box */}
              {!compressed ? (
                <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/80 transition-colors text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900">
                      {compressing ? 'Screenshot Compress Ho Raha Hai...' : 'Screenshot Select Karein'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 font-medium">
                      Phone ki Gallery ya Camera se photo upload karein
                    </div>
                  </div>

                  {/* Dual Action Buttons: Gallery & Camera */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>Gallery Se Chunein</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-teal-600" />
                      <span>Camera Se Photo</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* PREVIEW OF SELECTED SCREENSHOT */
                <div className="p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 flex items-start gap-3.5 relative shadow-sm">
                  <img
                    src={compressed.dataUrl}
                    alt="Proof Preview"
                    className="w-20 h-28 object-cover rounded-xl border border-emerald-300 shadow-sm shrink-0 bg-white"
                  />
                  <div className="flex-1 min-w-0 space-y-1.5 py-0.5">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Screenshot Ready!</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Compressed size: <strong className="font-mono text-emerald-700">{compressed.compressedKb} KB</strong> (Fast verification ready)
                    </p>
                    <div className="flex items-center gap-2 pt-1">
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
                        className="text-xs font-bold text-rose-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* User Optional Note / Reference ID Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Optional Note / Mobile Number / Transaction ID:
                </label>
                <input
                  type="text"
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="e.g. Registered with 9876543210 or Order ID"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!compressed || submitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] disabled:bg-slate-200 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-black text-sm transition-all shadow-[0_6px_20px_rgba(16,185,129,0.35)] active:scale-98 cursor-pointer disabled:cursor-not-allowed"
              >
                {submitting
                  ? 'Bheja Ja Raha Hai...'
                  : compressed
                  ? `Screenshot Bhejein & Claim ₹${task.reward_amount.toFixed(2)}`
                  : 'Pehle Upar Se Screenshot Upload Karein 📸'}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin dwara check hone par turant wallet me credit hoga</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
