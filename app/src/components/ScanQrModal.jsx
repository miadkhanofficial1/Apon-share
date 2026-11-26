import React, { useRef, useEffect, useState } from 'react';
import { X, QrCode, Wifi, Check, Sparkles } from 'lucide-react';

export default function ScanQrModal({ isOpen, onClose, deviceName }) {
  const dialogRef = useRef(null);
  const [pairedToast, setPairedToast] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleSimulatePair = () => {
    setPairedToast(true);
    setTimeout(() => {
      setPairedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      onClose={onClose}
      className="m-auto rounded-3xl bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 p-0 shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xs backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm focus:outline-none"
    >
      <div className="p-5 text-center space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold font-heading">
            <QrCode className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Wi-Fi Direct Pairing</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Graphic Mockup */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 inline-block shadow-inner">
          <div className="w-40 h-40 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
            {/* SVG QR Code Pattern */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
              {/* Corner markers */}
              <rect x="5" y="5" width="26" height="26" rx="4" />
              <rect x="9" y="9" width="18" height="18" fill="white" />
              <rect x="13" y="13" width="10" height="10" />

              <rect x="69" y="5" width="26" height="26" rx="4" />
              <rect x="73" y="9" width="18" height="18" fill="white" />
              <rect x="77" y="13" width="10" height="10" />

              <rect x="5" y="69" width="26" height="26" rx="4" />
              <rect x="9" y="73" width="18" height="18" fill="white" />
              <rect x="13" y="77" width="10" height="10" />

              {/* Data blocks */}
              <rect x="36" y="8" width="8" height="8" />
              <rect x="48" y="8" width="6" height="6" />
              <rect x="58" y="12" width="6" height="10" />
              
              <rect x="36" y="24" width="6" height="12" />
              <rect x="48" y="20" width="12" height="6" />
              <rect x="54" y="32" width="10" height="10" />

              <rect x="10" y="38" width="12" height="8" />
              <rect x="26" y="44" width="8" height="12" />

              <rect x="40" y="44" width="18" height="18" rx="2" fill="#0284C7" />

              <rect x="66" y="38" width="14" height="6" />
              <rect x="84" y="44" width="8" height="12" />

              <rect x="38" y="70" width="12" height="8" />
              <rect x="56" y="66" width="8" height="14" />
              <rect x="70" y="74" width="14" height="10" />
            </svg>

            {/* Logo Center badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-8 h-8 rounded-lg bg-white p-0.5 shadow-md flex items-center justify-center">
                <img src="/assets/icon.png" alt="Apon" className="w-6 h-6 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Pairing instructions */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Scan with any device running Apon
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Broadcasting as: <span className="font-semibold text-sky-600 dark:text-sky-400">{deviceName}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleSimulatePair}
          className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 shadow transition-all flex items-center justify-center gap-1.5"
        >
          {pairedToast ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Paired Successfully!</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>Simulate Peer Connect</span>
            </>
          )}
        </button>

      </div>
    </dialog>
  );
}
