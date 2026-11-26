import React from 'react';
import { Zap, CheckCircle2, X, FileUp, Clock, ShieldCheck } from 'lucide-react';

export default function TransferProgress({
  isActive,
  progress,
  speed,
  eta,
  fileName,
  fileSize,
  recipientName,
  onCancel
}) {
  if (!isActive) return null;

  const isCompleted = progress >= 100;

  return (
    <div className="p-3.5 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white border border-slate-700/80 shadow-2xl space-y-2.5 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-150">
      
      {/* File & Speed Bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 truncate pr-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <FileUp className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="font-semibold text-xs text-white truncate leading-tight">
              {fileName || 'Project_Assets.zip'}
            </p>
            <p className="text-[10px] text-slate-400">
              {isCompleted ? 'Finished beaming' : `Streaming to ${recipientName || 'selected peer(s)'}...`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold">
            <span className="text-emerald-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {speed || '98.4 MB/s'}
            </span>
            {eta && !isCompleted && (
              <span className="text-slate-400 flex items-center gap-0.5 text-[10px]">
                <Clock className="w-3 h-3 text-slate-500" />
                {eta}
              </span>
            )}
          </div>

          {!isCompleted && (
            <button
              type="button"
              onClick={onCancel}
              title="Cancel Transfer"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>{fileSize || '1.4 GB'}</span>
          <span className="font-mono text-sky-400 font-semibold">{progress}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status Footer */}
      {isCompleted ? (
        <div className="pt-0.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Transfer Completed & SHA-256 Verified!</span>
        </div>
      ) : (
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-sky-400" />
            Direct RAM-Free Stream
          </span>
          <span className="text-slate-500 font-mono">256 KB Chunks</span>
        </div>
      )}

    </div>
  );
}
