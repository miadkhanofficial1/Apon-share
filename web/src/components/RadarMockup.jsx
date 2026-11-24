import React, { useState, useEffect } from 'react';
import { Laptop, Smartphone, Monitor, Tablet, Wifi, ShieldCheck, Zap, CheckCircle2, ArrowUpRight } from 'lucide-react';

const DEVICES = [
  {
    id: 'dev-1',
    name: 'MacBook Pro M3',
    owner: 'Sarah M.',
    type: 'laptop',
    icon: Laptop,
    x: '22%',
    y: '28%',
    ip: '192.168.1.104',
    ping: '2ms',
    color: 'emerald'
  },
  {
    id: 'dev-2',
    name: 'Pixel 9 Pro',
    owner: 'David K.',
    type: 'phone',
    icon: Smartphone,
    x: '75%',
    y: '32%',
    ip: '192.168.1.112',
    ping: '1ms',
    color: 'sky'
  },
  {
    id: 'dev-3',
    name: 'Windows Desktop',
    owner: 'Studio Rig',
    type: 'desktop',
    icon: Monitor,
    x: '78%',
    y: '72%',
    ip: '192.168.1.140',
    ping: '1ms',
    color: 'indigo'
  },
  {
    id: 'dev-4',
    name: 'iPad Pro',
    owner: 'Elena R.',
    type: 'tablet',
    icon: Tablet,
    x: '24%',
    y: '76%',
    ip: '192.168.1.129',
    ping: '3ms',
    color: 'amber'
  }
];

export default function RadarMockup() {
  const [selectedDevice, setSelectedDevice] = useState(DEVICES[1]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState('94.6 MB/s');

  useEffect(() => {
    let interval;
    if (isTransferring) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsTransferring(false), 1200);
            return 100;
          }
          const increment = Math.floor(Math.random() * 12) + 8;
          const nextSpeed = (88 + Math.random() * 25).toFixed(1) + ' MB/s';
          setSpeed(nextSpeed);
          return Math.min(prev + increment, 100);
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isTransferring]);

  const handleStartTransfer = (device) => {
    setSelectedDevice(device);
    setProgress(0);
    setIsTransferring(true);
  };

  return (
    <div className="relative w-full max-w-lg lg:max-w-xl mx-auto rounded-3xl bg-slate-900/95 dark:bg-slate-950/90 text-white shadow-2xl border border-slate-700/60 p-6 md:p-8 overflow-hidden backdrop-blur-xl">
      
      {/* Top Header Mockup Bar */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
            <img src="/assets/icon.png" alt="Apon" className="w-5 h-5 rounded" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide flex items-center gap-2">
              Apon Radar
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h2>
            <p className="text-xs text-slate-400">Scanning local subnet (LAN & Direct P2P)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-full text-xs text-slate-300 border border-slate-700">
          <Wifi className="w-3.5 h-3.5 text-sky-400" />
          <span>4 Peers Found</span>
        </div>
      </div>

      {/* Interactive Radar Visualizer Screen */}
      <div className="relative my-6 aspect-square w-full max-w-[380px] mx-auto rounded-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center border border-sky-500/20 shadow-inner overflow-hidden">
        
        {/* Radar Concentric Rings */}
        <div className="absolute inset-8 rounded-full border border-sky-500/10 pointer-events-none"></div>
        <div className="absolute inset-20 rounded-full border border-sky-500/15 pointer-events-none"></div>
        <div className="absolute inset-32 rounded-full border border-sky-500/20 pointer-events-none"></div>
        
        {/* Radar Crosshairs */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-sky-500/15 pointer-events-none"></div>
        <div className="absolute inset-y-0 left-1/2 w-px bg-sky-500/15 pointer-events-none"></div>

        {/* Rotating Radar Sweep Light */}
        <div 
          className="absolute inset-0 pointer-events-none origin-center animate-radar-sweep"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(56, 189, 248, 0.18) 360deg)'
          }}
        ></div>

        {/* Center Node (Current Device) */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 p-0.5 shadow-lg shadow-sky-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-2">
              <img src="/assets/icon.png" alt="This Device" className="w-8 h-8 rounded-md" />
            </div>
          </div>
          <span className="mt-1.5 text-[11px] font-semibold tracking-wide text-sky-300">You (Broadcasting)</span>
        </div>

        {/* Discovered Device Nodes */}
        {DEVICES.map((device) => {
          const Icon = device.icon;
          const isSelected = selectedDevice.id === device.id;
          return (
            <button
              key={device.id}
              type="button"
              onClick={() => handleStartTransfer(device)}
              style={{ left: device.x, top: device.y }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20 transition-all duration-300 focus:outline-none ${
                isSelected ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              <div className="relative flex flex-col items-center">
                {/* Ripple effect on select */}
                {isSelected && (
                  <span className="absolute -inset-2 rounded-full bg-sky-400/20 animate-ping pointer-events-none"></span>
                )}

                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-md ${
                    isSelected
                      ? 'bg-sky-500 text-white ring-4 ring-sky-400/30 shadow-sky-500/50'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-sky-400/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                
                <span className="mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-900/90 text-slate-300 border border-slate-800 shadow whitespace-nowrap">
                  {device.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Transfer Panel & Controls */}
      <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Target Peer:</span>
            <span className="font-semibold text-white">{selectedDevice.name}</span>
            <span className="text-slate-500 text-[11px]">({selectedDevice.ip})</span>
          </div>
          <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {speed}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>
              {isTransferring
                ? progress < 100
                  ? 'Transferring Project_Assets.zip (1.4 GB)...'
                  : 'Transfer Completed!'
                : 'Click any device or button to test transfer'}
            </span>
            <span className="font-mono text-sky-400 font-semibold">{isTransferring ? `${progress}%` : 'Ready'}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-200"
              style={{ width: `${isTransferring ? progress : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="pt-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direct P2P • Zero Cloud • Local TLS</span>
          </div>

          <button
            type="button"
            disabled={isTransferring}
            onClick={() => handleStartTransfer(selectedDevice)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white transition-all flex items-center gap-1.5 shadow"
          >
            {isTransferring && progress === 100 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                Done!
              </>
            ) : isTransferring ? (
              'Sending...'
            ) : (
              <>
                Test Send
                <ArrowUpRight className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
