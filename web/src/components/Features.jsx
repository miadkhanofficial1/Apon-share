import React from 'react';
import { Zap, ShieldCheck, Radio, RefreshCw, Lock, Cpu, Network, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Blazing Fast Local P2P',
    subtitle: 'LAN & Wi-Fi Direct Speed',
    description:
      'Transfer heavy videos, project folders, and archives at full gigabit hardware speed. Bypass internet upload throttles and local router bottlenecks completely.',
    badge: 'Up to 120+ MB/s',
    gradient: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400',
    border: 'group-hover:border-amber-400/50'
  },
  {
    icon: ShieldCheck,
    title: '100% Private & Zero Cloud',
    subtitle: 'Zero Intermediary Servers',
    description:
      'Your files travel directly between your physical devices over encrypted TLS connections. No cloud storage, no account sign-in, and zero analytics telemetry.',
    badge: 'Zero Telemetry',
    gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
    border: 'group-hover:border-emerald-400/50'
  },
  {
    icon: Radio,
    title: 'Multi-Device Radar',
    subtitle: 'Single & Group Share',
    description:
      'Auto-detect nearby laptops, desktops, and phones via mDNS UDP beacons. Drag and drop to beam files to a single device or broadcast to a whole team simultaneously.',
    badge: 'One-Click Mesh',
    gradient: 'from-sky-500/10 to-blue-500/10 text-sky-600 dark:text-sky-400',
    border: 'group-hover:border-sky-400/50'
  },
  {
    icon: RefreshCw,
    title: 'Seamless In-App Auto-Updates',
    subtitle: 'Always Up To Date',
    description:
      'Zero-hassle cryptographic updates powered by Tauri v2. Effortless silent verification ensures you always enjoy the latest protocols and security patches.',
    badge: 'Signed & Verified',
    gradient: 'from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400',
    border: 'group-hover:border-purple-400/50'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-slate-50/70 dark:bg-[#0B101D] transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Engineered for Maximum Speed</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
            Built for Extreme Speed, Absolute Privacy
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            Say goodbye to slow cloud uploads, messy flash drives, and compression compromises. Apon connects your devices directly at native bus speeds.
          </p>
        </div>

        {/* 4 Core Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FEATURES.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className={`group relative p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 ${feat.border}`}
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feat.gradient} border border-slate-200 dark:border-slate-800 shadow-inner`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                    {feat.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-sky-600 dark:text-sky-400">
                    {feat.subtitle}
                  </span>
                  <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed pt-1">
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
