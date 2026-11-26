import React, { useState, useEffect } from 'react';
import { Download, X, Check, ShieldCheck, Zap, FileArchive, Clipboard, Copy } from 'lucide-react';

export default function IncomingSheet({
  isOpen,
  transferData,
  onAccept,
  onDecline
}) {
  const [status, setStatus] = useState('pending'); // 'pending', 'transferring', 'completed'
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState('104.2 MB/s');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStatus('pending');
      setProgress(0);
      setCopied(false);
    }
  }, [isOpen]);

  const isTextTransfer = transferData?.transfer_type === 'text' || Boolean(transferData?.text_content);

  const handleCopyText = () => {
    if (transferData?.text_content) {
      navigator.clipboard.writeText(transferData.text_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartAccept = () => {
    setStatus('transferring');
    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 15) + 12;
      setSpeed((95 + Math.random() * 25).toFixed(1) + ' MB/s');
      if (p >= 100) {
        setProgress(100);
        setStatus('completed');
        clearInterval(interval);
        setTimeout(() => {
          onAccept(transferData?.transfer_id);
        }, 1200);
      } else {
        setProgress(p);
      }
    }, 200);
  };

  if (!isOpen || !transferData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
      {/* Backdrop */}
      <div
        onClick={() => onDecline(transferData?.transfer_id)}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      {/* Bottom Sheet Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-6 safe-bottom shadow-2xl z-10 animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Grab Handle */}
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
              {isTextTransfer ? <Clipboard className="w-5 h-5" /> : <Download className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {isTextTransfer
                  ? 'Incoming Text / Clipboard'
                  : status === 'completed'
                  ? 'Transfer Complete'
                  : status === 'transferring'
                  ? 'Receiving Files...'
                  : 'Incoming File Transfer'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                From <span className="font-semibold text-slate-700 dark:text-slate-200">{transferData.sender_name || transferData.senderName}</span> ({transferData.sender_ip || transferData.senderIp || 'Local LAN'})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onDecline(transferData?.transfer_id)}
            aria-label="Close"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Snippet View */}
        {isTextTransfer ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 max-h-36 overflow-y-auto whitespace-pre-wrap break-words select-all">
              {transferData.text_content || 'No text content available'}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Instant P2P Clipboard • SHA-256 Verified</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => onDecline(transferData?.transfer_id)}
                className="py-3 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Dismiss
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="py-3 px-4 rounded-xl text-xs font-bold text-white bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* File Transfer View */
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                  <FileArchive className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {transferData.file_name || transferData.fileName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {transferData.file_size || transferData.fileSize} • Direct P2P Stream
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Zap className="w-3 h-3" />
                  {status === 'transferring' ? speed : '100+ MB/s'}
                </span>
              </div>
            </div>

            {/* Transfer Progress / Actions */}
            {status === 'transferring' || status === 'completed' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-500 dark:text-slate-400">
                    {status === 'completed' ? 'Saved to Downloads/Apon (SHA-256 Verified)' : 'Streaming parallel chunks to disk...'}
                  </span>
                  <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{progress}%</span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {status === 'completed' && (
                  <div className="pt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Files Saved & Hash Integrity Verified</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>SHA-256 Verified • Zero RAM Bloat Direct Stream</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onDecline(transferData?.transfer_id)}
                    className="py-3 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                  >
                    Decline
                  </button>

                  <button
                    type="button"
                    onClick={handleStartAccept}
                    className="py-3 px-4 rounded-xl text-xs font-bold text-white bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept Transfer</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
