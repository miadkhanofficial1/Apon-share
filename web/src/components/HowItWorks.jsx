import React from 'react';
import { Power, Scan, Send, ArrowRight, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Open Apon',
    desc: 'Launch Apon on any desktop or phone. Zero configuration, zero sign-in. Your device automatically beacons securely to local peers.',
    icon: Power,
    pill: 'Zero Config'
  },
  {
    step: '02',
    title: 'Select Devices on Radar',
    desc: 'See nearby colleagues and personal devices pop up immediately on the visual radar circle. Tap or click to select single or group targets.',
    icon: Scan,
    pill: 'Auto Discovery'
  },
  {
    step: '03',
    title: 'Instant Transfer',
    desc: 'Drop photos, documents, or huge video folders directly. Enjoy peer-to-peer speeds up to local Wi-Fi / LAN limits with instant receipt.',
    icon: Send,
    pill: 'Max Hardware Speed'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white dark:bg-[#090D16] transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <p className="text-xs font-bold tracking-widest uppercase text-sky-600 dark:text-sky-400">
            Frictionless Workflow
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            No pairing codes. No Bluetooth bottlenecks. No email attachments. Just open and beam.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative flex flex-col p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Step Number Top Badge */}
                <div className="flex items-center justify-between mb-8">
                  <span className="text-4xl font-extrabold font-heading text-slate-300 dark:text-slate-700">
                    {step.step}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    {step.pill}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-apon-navy dark:bg-sky-600 text-white flex items-center justify-center mb-6 shadow-md shadow-sky-600/10">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Step Details */}
                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {step.desc}
                </p>

                {/* Footer Checkmark */}
                <div className="mt-auto pt-6 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Instant & Encrypted</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
