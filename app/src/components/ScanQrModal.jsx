import React, { useRef, useEffect, useState } from 'react';
import { X, QrCode, Wifi, Check, Copy, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { getPairingPayload, pairWithCode } from '../utils/tauri';

export default function ScanQrModal({ isOpen, onClose, deviceName, onPeerPaired }) {
  const dialogRef = useRef(null);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' or 'manual'
  const [pairingData, setPairingData] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [isPairing, setIsPairing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      // Load real pairing payload from backend
      getPairingPayload().then((data) => {
        if (data) setPairingData(data);
      });
    } else {
      if (dialog.open) {
        dialog.close();
      }
      setToastMessage('');
      setManualCode('');
      setIsPairing(false);
    }
  }, [isOpen]);

  const handleCopyLink = () => {
    const url = pairingData?.pairing_url || `${pairingData?.ip || '192.168.1.100'}:${pairingData?.port || 53318}?token=${pairingData?.token || ''}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualPair = async (e) => {
    e?.preventDefault();
    if (!manualCode.trim()) return;

    setIsPairing(true);
    try {
      const pairedPeer = await pairWithCode(manualCode.trim());
      if (pairedPeer) {
        setToastMessage('Device paired successfully!');
        if (onPeerPaired) onPeerPaired(pairedPeer);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setToastMessage('Pairing failed. Check IP & port.');
      }
    } catch (err) {
      setToastMessage('Connection timed out.');
    } finally {
      setIsPairing(false);
    }
  };

  const handleSimulatePair = () => {
    setToastMessage('Connected to peer via Wi-Fi Direct!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const displayIp = pairingData?.ip || '192.168.1.100';
  const displayPort = pairingData?.port || 53318;
  const displayToken = pairingData?.token ? pairingData.token.slice(0, 8) + '...' : 'apon-sec';

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      onClose={onClose}
      className="m-auto rounded-3xl bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 p-0 shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm focus:outline-none"
    >
      <div className="p-5 text-center space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold font-heading">
            <QrCode className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>LAN & Wi-Fi Direct Pairing</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === 'qr'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            My QR Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === 'manual'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Manual IP / Token
          </button>
        </div>

        {/* Tab 1: QR Code View */}
        {activeTab === 'qr' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 inline-block shadow-inner">
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
                    <img src="./assets/icon.png" alt="Apon" className="w-6 h-6 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Connection Endpoint Details */}
            <div className="bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] text-left space-y-1">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Direct Endpoint:</span>
                <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">{displayIp}:{displayPort}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Security Token:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{displayToken}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                type="button"
                onClick={handleSimulatePair}
                className="py-2 px-3 rounded-xl text-xs font-semibold text-white bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 shadow transition-all flex items-center justify-center gap-1.5"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Simulate Pair</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Manual IP / Token Pairing (Isolation Fallback) */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualPair} className="space-y-3 text-left">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Peer IP Address or Pairing URL:
              </label>
              <input
                type="text"
                placeholder="e.g. 192.168.1.105:53318 or full URL"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-start gap-1 leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
              Use this when client isolation or corporate guest Wi-Fi blocks UDP/mDNS discovery broadcasts.
            </p>

            <button
              type="submit"
              disabled={isPairing || !manualCode.trim()}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 shadow disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              {isPairing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting to peer...</span>
                </>
              ) : (
                <>
                  <span>Connect & Pair</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Feedback Toast */}
        {toastMessage && (
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5 animate-in fade-in duration-200">
            <Check className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}

        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Device Name: <span className="font-semibold text-slate-700 dark:text-slate-300">{deviceName}</span>
        </p>

      </div>
    </dialog>
  );
}
