import React, { useState, useRef } from 'react';
import { Laptop, Smartphone, Monitor, Tablet, Wifi, Check, Users } from 'lucide-react';

const DEVICE_ICONS = {
  laptop: Laptop,
  phone: Smartphone,
  desktop: Monitor,
  tablet: Tablet,
};

// Orbit positions around the center
const ORBITS = [
  { x: 22, y: 24 }, // top-left
  { x: 78, y: 26 }, // top-right
  { x: 80, y: 74 }, // bottom-right
  { x: 20, y: 72 }, // bottom-left
];

export default function RadarView({
  peers = [],
  selectedPeers = [],
  onTogglePeer,
  onSelectAll,
  myDeviceName = 'This Device'
}) {
  const longPressTimer = useRef(null);

  const handlePointerDown = (peer) => {
    longPressTimer.current = setTimeout(() => {
      // Long press triggers multi-select toggle
      onTogglePeer(peer.id, true);
    }, 450);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-3 select-none">
      
      {/* Top Status Bar & Group Share Pill */}
      <div className="absolute top-2 inset-x-3 flex items-center justify-between text-xs z-20">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <Wifi className="w-3 h-3 text-sky-500 animate-pulse" />
          <span className="font-medium text-[11px]">{peers.length} Peers Online</span>
        </div>

        {selectedPeers.length > 0 && (
          <button
            type="button"
            onClick={onSelectAll}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 text-[11px] font-semibold shadow-sm active:scale-95"
          >
            <Users className="w-3 h-3" />
            <span>{selectedPeers.length === peers.length ? 'All Selected' : `${selectedPeers.length} Selected`}</span>
          </button>
        )}
      </div>

      {/* Circular Radar Visualizer */}
      <div className="relative aspect-square w-full max-w-[310px] sm:max-w-[340px] rounded-full bg-gradient-to-b from-slate-50/50 via-slate-100/50 to-slate-50/50 dark:from-slate-950/80 dark:via-slate-900/80 dark:to-slate-950/80 flex items-center justify-center border border-sky-500/20 shadow-inner overflow-hidden">
        
        {/* Concentric Rings */}
        <div className="absolute inset-8 rounded-full border border-sky-500/10 dark:border-sky-400/10 pointer-events-none"></div>
        <div className="absolute inset-20 rounded-full border border-sky-500/15 dark:border-sky-400/15 pointer-events-none"></div>
        <div className="absolute inset-32 rounded-full border border-sky-500/20 dark:border-sky-400/20 pointer-events-none"></div>

        {/* Crosshair guidelines */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-sky-500/10 dark:bg-sky-400/10 pointer-events-none"></div>
        <div className="absolute inset-y-0 left-1/2 w-px bg-sky-500/10 dark:bg-sky-400/10 pointer-events-none"></div>

        {/* Radar Sweep Light */}
        <div
          className="absolute inset-0 pointer-events-none origin-center animate-radar-sweep"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, transparent 310deg, rgba(2, 132, 199, 0.15) 360deg)'
          }}
        ></div>

        {/* Center Node (User's Device) */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-apon-navy p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center p-2">
              <img src="./assets/icon.png" alt="This Device" className="w-7 h-7 rounded-md" />
            </div>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 tracking-tight max-w-[100px] truncate">
              {myDeviceName}
            </span>
          </div>
        </div>

        {/* Orbiting Peer Bubbles */}
        {peers.map((peer, idx) => {
          const orbit = ORBITS[idx % ORBITS.length];
          const isSelected = selectedPeers.includes(peer.id);
          const Icon = DEVICE_ICONS[peer.device_type] || Smartphone;

          return (
            <div
              key={peer.id}
              style={{ left: `${orbit.x}%`, top: `${orbit.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <button
                type="button"
                onClick={() => onTogglePeer(peer.id, false)}
                onPointerDown={() => handlePointerDown(peer)}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                aria-label={`Select ${peer.name}`}
                className={`group relative flex flex-col items-center focus:outline-none transition-transform duration-200 ${
                  isSelected ? 'scale-110' : 'hover:scale-105 active:scale-95'
                }`}
              >
                {/* Active Ripple */}
                {isSelected && (
                  <span className="absolute -inset-1.5 rounded-2xl bg-sky-400/30 dark:bg-sky-400/20 animate-ping pointer-events-none"></span>
                )}

                {/* Peer Bubble Avatar */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-md ${
                    isSelected
                      ? 'bg-sky-600 text-white ring-4 ring-sky-400/30 shadow-sky-500/40'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-sky-400/60'
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Peer Name Tag */}
                <div className="mt-1 px-1.5 py-0.5 rounded-md bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-sm text-center max-w-[85px]">
                  <p className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                    {peer.name}
                  </p>
                  <p className="text-[8px] font-mono text-slate-400 leading-none">
                    {peer.signal}
                  </p>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Helper instruction */}
      <div className="mt-2 text-center">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          {selectedPeers.length === 0
            ? 'Tap a peer to connect • Long-press for group select'
            : selectedPeers.length === 1
            ? '1 recipient ready for instant transfer'
            : `${selectedPeers.length} recipients selected for group beam`}
        </p>
      </div>

    </div>
  );
}
