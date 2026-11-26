import React, { useState, useEffect } from 'react';
import { detectPlatform } from './utils/platform';
import { getInitialTheme, applyTheme } from './utils/theme';
import { invokeCommand } from './utils/tauri';
import DesktopWidget from './components/DesktopWidget';
import RadarView from './components/RadarView';
import MobileDock from './components/MobileDock';
import IncomingSheet from './components/IncomingSheet';
import SettingsModal from './components/SettingsModal';
import SendTextModal from './components/SendTextModal';
import ScanQrModal from './components/ScanQrModal';
import TransferProgress from './components/TransferProgress';
import { Sun, Moon, Sliders, Radio, Sparkles } from 'lucide-react';

export default function App() {
  const [platform, setPlatform] = useState(detectPlatform);
  const [theme, setTheme] = useState(getInitialTheme);
  const [trayActive, setTrayActive] = useState(true);

  // Device configuration
  const [deviceName, setDeviceName] = useState(() => localStorage.getItem('apon_device_name') || 'This Device');
  const [downloadFolder, setDownloadFolder] = useState(() => localStorage.getItem('apon_download_folder') || 'Downloads/Apon');
  const [autoAccept, setAutoAccept] = useState(() => localStorage.getItem('apon_auto_accept') === 'true');

  // Peer & Transfer State
  const [peers, setPeers] = useState([]);
  const [selectedPeers, setSelectedPeers] = useState([]);
  
  // Active Outgoing Transfer
  const [transferState, setTransferState] = useState({
    isActive: false,
    progress: 0,
    speed: '98.4 MB/s',
    fileName: '',
    fileSize: '',
    recipientName: ''
  });

  // Incoming Transfer Sheet
  const [incomingTransfer, setIncomingTransfer] = useState(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSendTextOpen, setIsSendTextOpen] = useState(false);
  const [isScanQrOpen, setIsScanQrOpen] = useState(false);

  // Theme synchronization
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Window resize platform detection
  useEffect(() => {
    const handleResize = () => setPlatform(detectPlatform());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch peers on load
  useEffect(() => {
    invokeCommand('scan_peers').then((data) => {
      if (Array.isArray(data)) setPeers(data);
    });
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleTogglePeer = (peerId, isMulti) => {
    if (isMulti) {
      // Multi-select toggle
      setSelectedPeers((prev) =>
        prev.includes(peerId) ? prev.filter((id) => id !== peerId) : [...prev, peerId]
      );
    } else {
      // Single select toggle
      setSelectedPeers((prev) =>
        prev.includes(peerId) && prev.length === 1 ? [] : [peerId]
      );
    }
  };

  const handleSelectAll = () => {
    if (selectedPeers.length === peers.length) {
      setSelectedPeers([]);
    } else {
      setSelectedPeers(peers.map((p) => p.id));
    }
  };

  // Simulate outgoing transfer
  const startOutgoingTransfer = (name = 'Selected_Files.zip', size = '1.4 GB') => {
    const targetPeer = peers.find((p) => selectedPeers.includes(p.id)) || peers[0];
    const recipientLabel = selectedPeers.length > 1
      ? `${selectedPeers.length} Devices (Group Share)`
      : targetPeer ? targetPeer.name : 'All Nearby Peers';

    setTransferState({
      isActive: true,
      progress: 0,
      speed: '98.4 MB/s',
      fileName: name,
      fileSize: size,
      recipientName: recipientLabel
    });

    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 12) + 8;
      const curSpeed = (92 + Math.random() * 25).toFixed(1) + ' MB/s';
      if (p >= 100) {
        setTransferState((prev) => ({ ...prev, progress: 100, speed: curSpeed }));
        clearInterval(interval);
        setTimeout(() => {
          setTransferState((prev) => ({ ...prev, isActive: false }));
        }, 2000);
      } else {
        setTransferState((prev) => ({ ...prev, progress: p, speed: curSpeed }));
      }
    }, 200);
  };

  // Trigger file send
  const handleSendFiles = () => {
    startOutgoingTransfer('Document_Archive.zip', '840 MB');
  };

  // Dropped files handler
  const handleDropFiles = (files) => {
    const name = files.length === 1 ? files[0].name : `${files.length} Files Package.zip`;
    startOutgoingTransfer(name, '1.2 GB');
  };

  // Clipboard text handler
  const handleClipboardPaste = (text) => {
    if (text) {
      startOutgoingTransfer('Clipboard_Snippet.txt', '12 KB');
    } else {
      setIsSendTextOpen(true);
    }
  };

  // Simulate incoming transfer
  const handleSimulateIncoming = () => {
    setIncomingTransfer({
      senderName: 'MacBook Pro M3',
      senderIp: '192.168.1.104',
      fileName: 'Presentation_Deck_2026.pdf',
      fileSize: '48.2 MB'
    });
  };

  const handleSaveSettings = (newSettings) => {
    setDeviceName(newSettings.deviceName);
    setDownloadFolder(newSettings.downloadFolder);
    setAutoAccept(newSettings.autoAccept);
    localStorage.setItem('apon_device_name', newSettings.deviceName);
    localStorage.setItem('apon_download_folder', newSettings.downloadFolder);
    localStorage.setItem('apon_auto_accept', String(newSettings.autoAccept));
  };

  // 1. Desktop Layout (Windows / macOS compact widget window)
  if (platform.isDesktop) {
    return (
      <div className="w-full h-full flex flex-col relative">
        <DesktopWidget
          peers={peers}
          selectedPeers={selectedPeers}
          onTogglePeer={handleTogglePeer}
          onSelectAll={handleSelectAll}
          onSendFiles={handleSendFiles}
          onSendText={() => setIsSendTextOpen(true)}
          onScanQr={() => setIsScanQrOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          myDeviceName={deviceName}
          trayActive={trayActive}
          onToggleTray={() => setTrayActive(!trayActive)}
          onDropFiles={handleDropFiles}
          onClipboardPaste={handleClipboardPaste}
        />

        {/* Floating Transfer Progress */}
        <div className="absolute bottom-16 inset-x-3 pointer-events-auto z-40">
          <TransferProgress
            isActive={transferState.isActive}
            progress={transferState.progress}
            speed={transferState.speed}
            fileName={transferState.fileName}
            fileSize={transferState.fileSize}
            recipientName={transferState.recipientName}
            onCancel={() => setTransferState((prev) => ({ ...prev, isActive: false }))}
          />
        </div>

        {/* Incoming Bottom Sheet */}
        <IncomingSheet
          isOpen={!!incomingTransfer}
          transferData={incomingTransfer}
          onAccept={() => setIncomingTransfer(null)}
          onDecline={() => setIncomingTransfer(null)}
        />

        {/* Modals */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          deviceName={deviceName}
          downloadFolder={downloadFolder}
          autoAccept={autoAccept}
          onSaveSettings={handleSaveSettings}
        />

        <SendTextModal
          isOpen={isSendTextOpen}
          onClose={() => setIsSendTextOpen(false)}
          recipientCount={selectedPeers.length}
          onSendText={(txt) => startOutgoingTransfer('Message_Note.txt', '8 KB')}
        />

        <ScanQrModal
          isOpen={isScanQrOpen}
          onClose={() => setIsScanQrOpen(false)}
          deviceName={deviceName}
        />
      </div>
    );
  }

  // 2. Mobile Layout (Android / iOS one-handed thumb-friendly layout)
  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#090D16] text-slate-800 dark:text-slate-100 overflow-hidden relative">
      
      {/* Mobile Top Header */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 safe-top shrink-0 bg-white/90 dark:bg-[#090D16]/90 backdrop-blur-md z-30">
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

        <div className="flex items-center gap-1">
          {/* Quick Demo Simulate Incoming Button */}
          <button
            type="button"
            onClick={handleSimulateIncoming}
            title="Simulate Incoming File"
            className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
          >
            Test In
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Settings"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Top 60%: Interactive Radar View */}
      <main className="flex-1 relative flex flex-col justify-center min-h-0">
        <RadarView
          peers={peers}
          selectedPeers={selectedPeers}
          onTogglePeer={handleTogglePeer}
          onSelectAll={handleSelectAll}
          myDeviceName={deviceName}
        />

        {/* Floating Transfer Progress bar when beaming */}
        <div className="absolute bottom-4 inset-x-3 pointer-events-auto z-40">
          <TransferProgress
            isActive={transferState.isActive}
            progress={transferState.progress}
            speed={transferState.speed}
            fileName={transferState.fileName}
            fileSize={transferState.fileSize}
            recipientName={transferState.recipientName}
            onCancel={() => setTransferState((prev) => ({ ...prev, isActive: false }))}
          />
        </div>
      </main>

      {/* Bottom Dock: Thumb-Friendly */}
      <MobileDock
        onSendFiles={handleSendFiles}
        onSendText={() => setIsSendTextOpen(true)}
        onScanQr={() => setIsScanQrOpen(true)}
        hasRecipient={selectedPeers.length > 0}
        recipientCount={selectedPeers.length}
      />

      {/* Incoming File Transfer Bottom Sheet */}
      <IncomingSheet
        isOpen={!!incomingTransfer}
        transferData={incomingTransfer}
        onAccept={() => setIncomingTransfer(null)}
        onDecline={() => setIncomingTransfer(null)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        deviceName={deviceName}
        downloadFolder={downloadFolder}
        autoAccept={autoAccept}
        onSaveSettings={handleSaveSettings}
      />

      {/* Send Text / Clipboard Modal */}
      <SendTextModal
        isOpen={isSendTextOpen}
        onClose={() => setIsSendTextOpen(false)}
        recipientCount={selectedPeers.length}
        onSendText={(txt) => startOutgoingTransfer('Message_Note.txt', '8 KB')}
      />

      {/* Scan QR Modal */}
      <ScanQrModal
        isOpen={isScanQrOpen}
        onClose={() => setIsScanQrOpen(false)}
        deviceName={deviceName}
      />

    </div>
  );
}
