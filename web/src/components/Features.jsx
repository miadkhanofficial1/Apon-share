import React from 'react';
import { Zap, ShieldCheck, Radio, RefreshCw, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Blazing Fast Local P2P',
    subtitle: 'LAN & Wi-Fi Direct',
    description:
      'Transfer heavy videos and archives at full gigabit hardware speed. Bypass internet upload throttles and router bottlenecks completely.',
    badge: '120+ MB/s',
    gradient: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400',
    border: 'hover:border-amber-400/50'
  },
  {
    icon: ShieldCheck,
    title: '100% Private & Zero Cloud',
    subtitle: 'Zero Intermediaries',
    description:
      'Files travel directly between physical devices over encrypted TLS connections. No cloud storage, no account sign-in, and zero analytics telemetry.',
    badge: 'Zero Telemetry',
    gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
    border: 'hover:border-emerald-400/50'
  },
  {
    icon: Radio,
    title: 'Multi-Device Radar',
    subtitle: 'Single & Group Share',
    description:
      'Auto-detect nearby laptops and phones via mDNS UDP beacons. Drag and drop to beam files to a single device or broadcast to an entire team.',
    badge: 'One-Click Mesh',
    gradient: 'from-sky-500/10 to-blue-500/10 text-sky-600 dark:text-sky-400',
    border: 'hover:border-sky-400/50'
  },
  {
    icon: RefreshCw,
    title: 'Seamless In-App Auto-Updates',
    subtitle: 'Always Up To Date',
    description:
      'Zero-hassle cryptographic updates powered by Tauri v2. Effortless background verification ensures you always enjoy the latest protocols.',
    badge: 'Signed & Verified',
    gradient: 'from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400',
    border: 'hover:border-purple-400/50'
  }
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-14 bg-slate-50/70 dark:bg-[#0B101D] transition-colors relative">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Speed P2P Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            Extreme Speed. Absolute Privacy.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Eliminate slow cloud uploads, messy flash drives, and compression limits. Apon connects your devices directly at native bus speeds.
          </p>
        </div>

        {/* 4 Core Features Grid - 2x2 with p-6 padding */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 ${feat.border}`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${feat.gradient} border border-slate-200/60 dark:border-slate-800`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                    {feat.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold tracking-wider uppercase text-sky-600 dark:text-sky-400">
                    {feat.subtitle}
                  </span>
                  <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed pt-1">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
