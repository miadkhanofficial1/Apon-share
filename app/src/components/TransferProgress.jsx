import React from 'react';
import { Zap, CheckCircle2, X, FileUp } from 'lucide-react';

export default function TransferProgress({
  isActive,
  progress,
  speed,
  fileName,
  fileSize,
  recipientName,
  onCancel
}) {
  if (!isActive) return null;

  const isCompleted = progress >= 100;

  return (
    <div className="p-3 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white border border-slate-700/80 shadow-2xl space-y-2 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-150">
      
      {/* File & Speed Bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate pr-2">
          <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <FileUp className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <p className="font-semibold text-xs text-white truncate leading-tight">
              {fileName || 'Project_Assets.zip'}
            </p>
            <p className="text-[10px] text-slate-400">
              {isCompleted ? 'Finished beaming' : `Beaming to ${recipientName || 'selected peer'}...`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <Zap className="w-3 h-3" />
            {speed || '98.4 MB/s'}
          </span>
          {!isCompleted && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
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

      {isCompleted && (
        <div className="pt-0.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Transfer Completed Successfully!</span>
        </div>
      )}

    </div>
  );
}
