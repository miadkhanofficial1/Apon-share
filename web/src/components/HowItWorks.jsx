import React from 'react';
import { Power, Scan, Send, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Open Apon',
    desc: 'Launch Apon on your desktop or phone. Zero configuration, no accounts. Your device automatically beacons safely to local peers.',
    icon: Power,
    pill: 'Zero Config'
  },
  {
    step: '02',
    title: 'Select Devices on Radar',
    desc: 'Nearby devices appear instantly on the radar circle. Click or tap to select one or multiple recipients for group sharing.',
    icon: Scan,
    pill: 'Auto Discovery'
  },
  {
    step: '03',
    title: 'Instant Transfer',
    desc: 'Drop files or entire folders. Enjoy gigabit peer-to-peer speeds up to local Wi-Fi / LAN limits with immediate receipt.',
    icon: Send,
    pill: 'Max Hardware Speed'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-10 md:py-14 bg-white dark:bg-[#090D16] transition-colors relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
          <p className="text-[10px] font-bold tracking-widest uppercase text-sky-600 dark:text-sky-400">
            Frictionless Workflow
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            No pairing pins. No Bluetooth bottlenecks. No cloud upload waits.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative flex flex-col p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 transition-all hover:shadow-sm"
              >
                {/* Step Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-extrabold font-heading text-slate-300 dark:text-slate-700">
                    {step.step}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    {step.pill}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-apon-navy dark:bg-sky-600 text-white flex items-center justify-center mb-3 shadow-sm">
                  <Icon className="w-4 h-4" />
                </div>

                {/* Step Details */}
                <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-3">
                  {step.desc}
                </p>

                {/* Footer Checkmark */}
                <div className="mt-auto pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>Encrypted Direct P2P</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
