import React, { useState } from 'react';
import { Sparkles, Download, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { installAppUpdate } from '../utils/tauri';

export default function UpdateBanner({ updateInfo, onDismiss }) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!updateInfo || !updateInfo.available) return null;

  const handleUpdate = async () => {
    setIsInstalling(true);
    setErrorMsg(null);
    try {
      await installAppUpdate(updateInfo, (percent) => {
        setDownloadPercent(percent);
      });
    } catch (err) {
      console.error('Update failed:', err);
      setErrorMsg('Update failed. Please retry.');
      setIsInstalling(false);
    }
  };

  return (
    <div className="relative mx-3 mb-2 p-2.5 rounded-2xl bg-gradient-to-r from-sky-600/90 to-blue-700/90 text-white shadow-lg backdrop-blur-md border border-sky-400/30 animate-in slide-in-from-top-2 duration-200 z-40">
      <div className="flex items-center justify-between gap-2.5">
        
        {/* Left: Icon & Description */}
        <div className="flex items-center gap-2 truncate">
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            {isInstalling ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-bold text-xs">v{updateInfo.version || '1.0.1'} Ready</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-medium">OTA</span>
            </div>
            <p className="text-[10px] text-sky-100 truncate">
              {isInstalling
                ? `Downloading update... ${downloadPercent}%`
                : 'Silent background update & restart'}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!isInstalling ? (
            <>
              <button
                type="button"
                onClick={handleUpdate}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-sky-50 shadow-sm active:scale-95 transition-all flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Update</span>
              </button>
              <button
                type="button"
                onClick={onDismiss}
                title="Dismiss"
                className="p-1 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="text-right">
              <span className="font-mono text-xs font-bold text-white">{downloadPercent}%</span>
            </div>
          )}
        </div>

      </div>

      {/* Download Progress Bar */}
      {isInstalling && (
        <div className="mt-2 w-full h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-150"
            style={{ width: `${downloadPercent}%` }}
          />
        </div>
      )}

      {errorMsg && (
        <p className="text-[10px] text-rose-200 mt-1 font-medium">{errorMsg}</p>
      )}
    </div>
  );
}
