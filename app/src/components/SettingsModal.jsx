import React, { useRef, useEffect, useState } from 'react';
import { X, Sliders, Folder, ShieldCheck, Check, Info } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  deviceName,
  downloadFolder,
  autoAccept,
  onSaveSettings
}) {
  const dialogRef = useRef(null);
  const [localName, setLocalName] = useState(deviceName);
  const [localFolder, setLocalFolder] = useState(downloadFolder);
  const [localAutoAccept, setLocalAutoAccept] = useState(autoAccept);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      setLocalName(deviceName);
      setLocalFolder(downloadFolder);
      setLocalAutoAccept(autoAccept);
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen, deviceName, downloadFolder, autoAccept]);

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings({
      deviceName: localName.trim() || 'This Device',
      downloadFolder: localFolder.trim() || 'Downloads/Apon',
      autoAccept: localAutoAccept,
    });
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 900);
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      aria-labelledby="settings-dialog-title"
      className="m-auto rounded-3xl bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 p-0 shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm focus:outline-none"
    >
      <div className="p-5 sm:p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 id="settings-dialog-title" className="text-sm font-bold font-heading">
                Settings
              </h3>
              <p className="text-[10px] text-slate-400">Apon Peer Configuration</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Device Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Device Name (Visible on Radar)
            </label>
            <input
              type="text"
              required
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="e.g. Miad's MacBook"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Download Folder */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Download Folder
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={localFolder}
                  onChange={(e) => setLocalFolder(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <Folder className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Auto-Accept Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Auto-Accept Transfers
              </p>
              <p className="text-[10px] text-slate-400">
                Automatically receive files from known devices
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setLocalAutoAccept(!localAutoAccept)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                localAutoAccept ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  localAutoAccept ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* App Version Info */}
          <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
              <p className="font-semibold text-slate-900 dark:text-white">
                Apon v1.0.0 (Tauri v2)
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Built by MK.Studio • Zero Cloud • Local P2P
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 shadow transition-all flex items-center justify-center gap-2"
            >
              {savedToast ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Settings Saved</span>
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>

        </form>

      </div>
    </dialog>
  );
}
