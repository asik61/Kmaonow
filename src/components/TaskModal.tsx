import React, { useState } from 'react';
import { X, ExternalLink, Upload, FileCheck, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import type { TaskItem, TaskSubmission } from '../types/kamaonow';
import { compressScreenshot, generateSyntheticProofReceipt, type CompressedResult } from '../utils/compressScreenshot';

interface TaskModalProps {
  task: TaskItem | null;
  existingSubmission?: TaskSubmission;
  userPhone: string;
  onClose: () => void;
  onSubmitProof: (payload: { taskId: string; proofDataUrl: string; sizeKb: number }) => void;
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
  const [hasStarted, setHasStarted] = useState(false);

  if (!task) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const res = await compressScreenshot(file);
      setCompressed(res);
    } catch (err) {
      console.error('Compression failed', err);
    } finally {
      setCompressing(false);
    }
  };

  const handleGenerateSample = () => {
    const res = generateSyntheticProofReceipt(task.title, task.reward_amount, userPhone);
    setCompressed(res);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compressed) return;
    setSubmitting(true);
    onSubmitProof({
      taskId: task.id,
      proofDataUrl: compressed.dataUrl,
      sizeKb: compressed.compressedKb,
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      {/* Crisp White Card Modal matching Image specification */}
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white border border-slate-100 text-slate-900 shadow-2xl flex flex-col animate-slide-up">
        {/* Grab bar on mobile */}
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
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
        <div className="p-5 space-y-5">
          {/* Reward Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-emerald-800 font-bold">Completion Reward</div>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-0.5">
                ₹{task.reward_amount.toFixed(2)}
              </div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <span className="font-bold text-emerald-700">Instant Credit</span>
              <div className="text-[11px] text-slate-500">Post Admin Review</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Step 1: Complete Task
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{task.description}</p>
            <ol className="space-y-2 text-xs text-slate-700 pt-1">
              {task.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-mono font-black text-emerald-600 shrink-0">{idx + 1}.</span>
                  <span className="font-medium">{step}</span>
                </li>
              ))}
            </ol>

            <a
              href={task.partner_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setHasStarted(true)}
              className="mt-3 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span>Open {task.title} Partner App</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Submission / Status */}
          {existingSubmission ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Your Proof Status:</span>
                <span
                  className={`font-bold font-mono capitalize px-2.5 py-0.5 rounded-full ${
                    existingSubmission.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : existingSubmission.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {existingSubmission.status}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {existingSubmission.admin_note || 'Your proof is under manual review by Admin.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Step 2: Submit Proof Screenshot
                </h3>
                <button
                  type="button"
                  onClick={handleGenerateSample}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Use Sample Receipt</span>
                </button>
              </div>

              {/* Upload Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 cursor-pointer text-center min-h-[110px] transition-colors">
                  <Upload className="w-6 h-6 text-emerald-600 mb-1" />
                  <span className="text-xs font-bold text-slate-900">
                    {compressing ? 'Compressing...' : 'Upload Screenshot'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Canvas compressed to &lt;200 KB
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>

                {compressed ? (
                  <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 flex items-center gap-3">
                    <img
                      src={compressed.dataUrl}
                      alt="Proof"
                      className="w-16 h-20 object-cover rounded-xl border border-emerald-300 shrink-0"
                    />
                    <div className="min-w-0 text-xs space-y-1">
                      <div className="flex items-center gap-1 text-emerald-700 font-bold">
                        <FileCheck className="w-4 h-4 shrink-0" />
                        <span>Ready</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-600 font-semibold">
                        {compressed.compressedKb} KB (Validated)
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-center text-xs text-slate-600">
                    <div className="flex items-center gap-1 text-emerald-700 font-bold mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Manual Admin Verification</span>
                    </div>
                    <span>Hum har screenshot ko manually check karte hain aur reward turant credit karte hain.</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!compressed || submitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 text-white font-black text-sm transition-all shadow-[0_6px_20px_rgba(16,185,129,0.35)] active:scale-98 cursor-pointer disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : `Submit Proof (Earn ₹${task.reward_amount.toFixed(2)})`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
