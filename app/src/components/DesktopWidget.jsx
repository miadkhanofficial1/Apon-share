import React, { useState, useEffect } from 'react';
import { Upload, FileText, QrCode, Sliders, Sun, Moon, Shield, Radio, Check, Layers } from 'lucide-react';
import RadarView from './RadarView';

export default function DesktopWidget({
  peers,
  selectedPeers,
  onTogglePeer,
  onSelectAll,
  onSendFiles,
  onSendText,
  onScanQr,
  onOpenSettings,
  theme,
  onToggleTheme,
  myDeviceName,
  trayActive,
  onToggleTray,
  onDropFiles,
  onClipboardPaste,
  updateBanner
}) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Drag and drop event listeners
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        setIsDraggingOver(true);
      }
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsDraggingOver(false);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDraggingOver(false);
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onDropFiles(Array.from(e.dataTransfer.files));
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onDropFiles]);

  // Clipboard paste listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData) {
        const text = e.clipboardData.getData('text');
        const files = Array.from(e.clipboardData.files || []);
        if (files.length > 0) {
          onDropFiles(files);
        } else if (text && text.trim().length > 0) {
          onClipboardPaste(text);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onDropFiles, onClipboardPaste]);

  return (
    <div className="relative w-full h-full flex flex-col bg-white dark:bg-[#090D16] text-slate-800 dark:text-slate-200 overflow-hidden">
      
      {/* Full-Window Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-sky-600/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center border-4 border-dashed border-white/60 animate-in fade-in duration-150">
          <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center mb-4 shadow-lg">
            <Upload className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-bold font-heading mb-1">
            Drop Files to Beam Instantly
          </h2>
          <p className="text-xs text-sky-100 max-w-xs">
            {selectedPeers.length > 0
              ? `Sending to ${selectedPeers.length} selected peer(s)`
              : 'Select a peer or drop to beam to all nearby devices'}
          </p>
        </div>
      )}

      {/* Widget Header */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <img
            src="/assets/logo.png"
            alt="Apon Logo"
            className="h-6 w-auto object-contain block dark:hidden"
          />
          <img
            src="/assets/logo-dark.png"
            alt="Apon Logo"
            className="h-6 w-auto object-contain hidden dark:block"
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5">
          {/* System Tray Background Toggle */}
          <button
            type="button"
            onClick={onToggleTray}
            title={trayActive ? 'System Tray Active (Receiving in background)' : 'Enable System Tray Background Mode'}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
              trayActive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold hidden sm:inline">Tray</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {updateBanner && <div className="pt-2">{updateBanner}</div>}

      {/* Main Area: Radar Visualizer */}
      <main className="flex-1 relative flex flex-col justify-center min-h-0">
        <RadarView
          peers={peers}
          selectedPeers={selectedPeers}
          onTogglePeer={onTogglePeer}
          onSelectAll={onSelectAll}
          myDeviceName={myDeviceName}
        />
      </main>

      {/* Desktop Quick Dock */}
      <footer className="p-3.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2">
          {/* Main Send Button */}
          <button
            type="button"
            onClick={onSendFiles}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-sm active:scale-[0.98] ${
              selectedPeers.length > 0
                ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/20'
                : 'bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>
              {selectedPeers.length > 0
                ? `Send Files (${selectedPeers.length})`
                : 'Send Files'}
            </span>
          </button>

          {/* Clipboard Beaming (Ctrl+V) */}
          <button
            type="button"
            onClick={() => onClipboardPaste('')}
            title="Paste & Beam Clipboard (Ctrl+V)"
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm flex items-center gap-1.5 text-xs font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Paste</span>
          </button>

          {/* QR Pairing */}
          <button
            type="button"
            onClick={onScanQr}
            title="Show Pairing QR Code"
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Drag Hint */}
        <div className="mt-2 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            Drag files here • Press Ctrl+V to beam clipboard
          </p>
        </div>
      </footer>

    </div>
  );
}
