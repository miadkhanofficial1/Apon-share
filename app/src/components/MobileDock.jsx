import React from 'react';
import { Upload, FileText, QrCode } from 'lucide-react';

export default function MobileDock({
  onSendFiles,
  onSendText,
  onScanQr,
  hasRecipient = false,
  recipientCount = 0
}) {
  return (
    <div className="w-full bg-white/95 dark:bg-[#090D16]/95 border-t border-slate-200/80 dark:border-slate-800/80 p-3 safe-bottom backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        
        {/* Prominent Send Files Button */}
        <button
          type="button"
          onClick={onSendFiles}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-sm text-white transition-all shadow-md active:scale-[0.98] ${
            hasRecipient
              ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/25 ring-2 ring-sky-400/30'
              : 'bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 shadow-slate-900/10'
          }`}
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>
            {hasRecipient
              ? `Beam Files (${recipientCount})`
              : 'Send Files'}
          </span>
        </button>

        {/* Compact Send Text / Clipboard Button */}
        <button
          type="button"
          onClick={onSendText}
          aria-label="Send Text / Clipboard"
          className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all active:scale-95 shrink-0"
        >
          <FileText className="w-4 h-4" />
          <span className="text-[9px] font-semibold mt-0.5">Text</span>
        </button>

        {/* Compact Scan QR Button */}
        <button
          type="button"
          onClick={onScanQr}
          aria-label="Scan QR Code"
          className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all active:scale-95 shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span className="text-[9px] font-semibold mt-0.5">Scan</span>
        </button>

      </div>
    </div>
  );
}
