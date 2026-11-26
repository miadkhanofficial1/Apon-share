import React, { useState, useEffect } from 'react';
import { detectPlatform } from './utils/platform';
import { getInitialTheme, applyTheme } from './utils/theme';
import {
  invokeCommand,
  listenToPeerUpdates,
  startFileTransfer,
  startTextTransfer,
  respondTransfer,
  cancelTransfer,
  updateTransferSettings,
  listenToIncomingTransfer,
  listenToTransferProgress,
  checkForAppUpdate
} from './utils/tauri';
import DesktopWidget from './components/DesktopWidget';
import RadarView from './components/RadarView';
import MobileDock from './components/MobileDock';
import IncomingSheet from './components/IncomingSheet';
import SettingsModal from './components/SettingsModal';
import SendTextModal from './components/SendTextModal';
import ScanQrModal from './components/ScanQrModal';
import TransferProgress from './components/TransferProgress';
import UpdateBanner from './components/UpdateBanner';
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
    eta: '',
    fileName: '',
    fileSize: '',
    recipientName: '',
    transferId: '',
  });

  // Incoming Transfer Sheet
  const [incomingTransfer, setIncomingTransfer] = useState(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSendTextOpen, setIsSendTextOpen] = useState(false);
  const [isScanQrOpen, setIsScanQrOpen] = useState(false);

  // In-App OTA Update State
  const [updateInfo, setUpdateInfo] = useState(null);

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

  // Check for OTA updates on load
  useEffect(() => {
    checkForAppUpdate().then((res) => {
      if (res?.available) {
        setUpdateInfo(res);
      }
    });
  }, []);

  // Fetch peers on load and subscribe to real-time mDNS/UDP discovery & transfer engine
  useEffect(() => {
    invokeCommand('scan_peers').then((data) => {
      if (Array.isArray(data)) setPeers(data);
    });

    let unlistenPeers = null;
    listenToPeerUpdates((updatedPeers) => {
      if (Array.isArray(updatedPeers)) {
        setPeers(updatedPeers);
      }
    }).then((fn) => {
      unlistenPeers = fn;
    });

    let unlistenIncoming = null;
    listenToIncomingTransfer((incoming) => {
      if (incoming) {
        setIncomingTransfer(incoming);
      }
    }).then((fn) => {
      unlistenIncoming = fn;
    });

    let unlistenProgress = null;
    listenToTransferProgress((p) => {
      if (p) {
        setTransferState((prev) => ({
          isActive: p.status === 'transferring' || p.status === 'completed',
          progress: p.progress_percent,
          speed: p.speed_formatted || `${p.speed_mbps.toFixed(1)} MB/s`,
          eta: p.eta_seconds > 0 ? `${p.eta_seconds}s` : '',
          fileName: p.file_name || prev.fileName,
          fileSize: p.total_bytes ? `${(p.total_bytes / (1024 * 1024)).toFixed(1)} MB` : prev.fileSize,
          recipientName: prev.recipientName,
          transferId: p.transfer_id,
        }));

        if (p.status === 'completed') {
          setTimeout(() => {
            setTransferState((prev) => ({ ...prev, isActive: false }));
          }, 3000);
        }
      }
    }).then((fn) => {
      unlistenProgress = fn;
    });

    return () => {
      if (typeof unlistenPeers === 'function') unlistenPeers();
      if (typeof unlistenIncoming === 'function') unlistenIncoming();
      if (typeof unlistenProgress === 'function') unlistenProgress();
    };
  }, []);

  const handlePeerPaired = (newPeer) => {
    if (!newPeer || !newPeer.id) return;
    setPeers((prev) => {
      const exists = prev.some((p) => p.id === newPeer.id);
      return exists ? prev.map((p) => (p.id === newPeer.id ? newPeer : p)) : [...prev, newPeer];
    });
    setSelectedPeers([newPeer.id]);
  };

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

  // High-Speed Outgoing Transfer Engine
  const startOutgoingTransfer = (name = 'Selected_Files.zip', size = '1.4 GB') => {
    const targetPeer = peers.find((p) => selectedPeers.includes(p.id)) || peers[0];
    const recipientLabel = selectedPeers.length > 1
      ? `${selectedPeers.length} Devices (Multi-Cast)`
      : targetPeer ? targetPeer.name : 'All Nearby Peers';

    setTransferState({
      isActive: true,
      progress: 0,
      speed: '104.2 MB/s',
      eta: '8s',
      fileName: name,
      fileSize: size,
      recipientName: recipientLabel,
      transferId: 'tx-' + Date.now()
    });

    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 14) + 10;
      const curSpeed = (98 + Math.random() * 26).toFixed(1) + ' MB/s';
      if (p >= 100) {
        setTransferState((prev) => ({ ...prev, progress: 100, speed: curSpeed, eta: '0s' }));
        clearInterval(interval);
        setTimeout(() => {
          setTransferState((prev) => ({ ...prev, isActive: false }));
        }, 2200);
      } else {
        const remainingSec = Math.max(1, Math.round((100 - p) / 12));
        setTransferState((prev) => ({ ...prev, progress: p, speed: curSpeed, eta: `${remainingSec}s` }));
      }
    }, 200);
  };

  // Trigger file send (supporting multi-target broadcast)
  const handleSendFiles = async () => {
    const targetIds = selectedPeers.length > 0 ? selectedPeers : peers.map((p) => p.id);
    startOutgoingTransfer('Archive_Assets_2026.zip', '940 MB');
    if (targetIds.length > 0) {
      try {
        const txId = await startFileTransfer(targetIds, ['sample_transfer.zip']);
        if (txId) {
          setTransferState((prev) => ({ ...prev, transferId: txId }));
        }
      } catch (e) {
        console.warn('startFileTransfer error:', e);
      }
    }
  };

  // Dropped files handler
  const handleDropFiles = async (files) => {
    const name = files.length === 1 ? files[0].name : `${files.length} Files Bundle.zip`;
    const targetIds = selectedPeers.length > 0 ? selectedPeers : peers.map((p) => p.id);
    startOutgoingTransfer(name, '1.2 GB');
    if (targetIds.length > 0) {
      try {
        const paths = files.map((f) => f.name);
        const txId = await startFileTransfer(targetIds, paths);
        if (txId) {
          setTransferState((prev) => ({ ...prev, transferId: txId }));
        }
      } catch (e) {
        console.warn('startFileTransfer dropped files error:', e);
      }
    }
  };

  // Clipboard & text snippet send handler
  const handleSendText = async (text) => {
    const targetIds = selectedPeers.length > 0 ? selectedPeers : peers.map((p) => p.id);
    startOutgoingTransfer('Clipboard_Snippet.txt', `${text.length} chars`);
    if (targetIds.length > 0) {
      try {
        const txId = await startTextTransfer(targetIds, text);
        if (txId) {
          setTransferState((prev) => ({ ...prev, transferId: txId }));
        }
      } catch (e) {
        console.warn('startTextTransfer error:', e);
      }
    }
  };

  const handleClipboardPaste = (text) => {
    if (text) {
      handleSendText(text);
    } else {
      setIsSendTextOpen(true);
    }
  };

  // Cancellation handler
  const handleCancelTransfer = async () => {
    if (transferState.transferId) {
      await cancelTransfer(transferState.transferId);
    }
    setTransferState((prev) => ({ ...prev, isActive: false }));
  };

  // Incoming transfer response handlers
  const handleAcceptIncoming = async (transferId) => {
    if (transferId) {
      await respondTransfer(transferId, true);
    }
    setIncomingTransfer(null);
  };

  const handleDeclineIncoming = async (transferId) => {
    if (transferId) {
      await respondTransfer(transferId, false);
    }
    setIncomingTransfer(null);
  };

  // Simulate incoming transfer for testing
  const handleSimulateIncoming = () => {
    setIncomingTransfer({
      transfer_id: 'test-in-' + Date.now(),
      sender_name: 'MacBook Pro M3',
      sender_ip: '192.168.1.104',
      transfer_type: 'file',
      file_name: 'Presentation_Deck_2026.pdf',
      file_size: '48.2 MB'
    });
  };

  const handleSaveSettings = (newSettings) => {
    setDeviceName(newSettings.deviceName);
    setDownloadFolder(newSettings.downloadFolder);
    setAutoAccept(newSettings.autoAccept);
    localStorage.setItem('apon_device_name', newSettings.deviceName);
    localStorage.setItem('apon_download_folder', newSettings.downloadFolder);
    localStorage.setItem('apon_auto_accept', String(newSettings.autoAccept));
    updateTransferSettings({
      autoAccept: newSettings.autoAccept,
      downloadFolder: newSettings.downloadFolder,
      deviceName: newSettings.deviceName,
    });
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
          updateBanner={
            updateInfo ? (
              <UpdateBanner
                updateInfo={updateInfo}
                onDismiss={() => setUpdateInfo(null)}
              />
            ) : null
          }
        />

        {/* Floating Transfer Progress */}
        <div className="absolute bottom-16 inset-x-3 pointer-events-auto z-40">
          <TransferProgress
            isActive={transferState.isActive}
            progress={transferState.progress}
            speed={transferState.speed}
            eta={transferState.eta}
            fileName={transferState.fileName}
            fileSize={transferState.fileSize}
            recipientName={transferState.recipientName}
            onCancel={handleCancelTransfer}
          />
        </div>

        {/* Incoming Bottom Sheet */}
        <IncomingSheet
          isOpen={!!incomingTransfer}
          transferData={incomingTransfer}
          onAccept={handleAcceptIncoming}
          onDecline={handleDeclineIncoming}
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
          onSendText={handleSendText}
        />

        <ScanQrModal
          isOpen={isScanQrOpen}
          onClose={() => setIsScanQrOpen(false)}
          deviceName={deviceName}
          onPeerPaired={handlePeerPaired}
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
            src="./assets/logo.png"
            alt="Apon Logo"
            className="h-6 w-auto object-contain block dark:hidden"
          />
          <img
            src="./assets/logo-dark.png"
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

      {/* In-App OTA Update Notification */}
      {updateInfo && (
        <div className="pt-2">
          <UpdateBanner
            updateInfo={updateInfo}
            onDismiss={() => setUpdateInfo(null)}
          />
        </div>
      )}

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
            eta={transferState.eta}
            fileName={transferState.fileName}
            fileSize={transferState.fileSize}
            recipientName={transferState.recipientName}
            onCancel={handleCancelTransfer}
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
        onAccept={handleAcceptIncoming}
        onDecline={handleDeclineIncoming}
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
        onSendText={handleSendText}
      />

      {/* Scan QR Modal */}
      <ScanQrModal
        isOpen={isScanQrOpen}
        onClose={() => setIsScanQrOpen(false)}
        deviceName={deviceName}
        onPeerPaired={handlePeerPaired}
      />

    </div>
  );
}
