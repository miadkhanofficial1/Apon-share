import React, { useState, useEffect } from 'react';
import { Download, Monitor, Apple, Smartphone, Globe, Shield, Sparkles, ChevronRight } from 'lucide-react';
import { detectUserOS, fetchLatestRelease, DEFAULT_VERSION, FALLBACK_RELEASES_URL } from '../utils/githubRelease';
import RadarMockup from './RadarMockup';

export default function Hero({ onOpenContact }) {
  const [userOS, setUserOS] = useState({ os: 'windows', label: 'Windows', ext: '.exe' });
  const [releaseInfo, setReleaseInfo] = useState({
    hasRelease: false,
    version: DEFAULT_VERSION,
    releaseUrl: FALLBACK_RELEASES_URL,
    assets: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserOS(detectUserOS());
    fetchLatestRelease().then((info) => {
      setReleaseInfo(info);
      setLoading(false);
    });
  }, []);

  const getPrimaryDownloadUrl = () => {
    if (releaseInfo.assets[userOS.os]) {
      return releaseInfo.assets[userOS.os];
    }
    return releaseInfo.releaseUrl;
  };

  const getAssetUrlFor = (osKey) => {
    return releaseInfo.assets[osKey] || releaseInfo.releaseUrl;
  };

  return (
    <section className="relative pt-6 pb-12 md:pt-8 md:pb-16 overflow-hidden">
      {/* Background soft ambient radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 radial-glow pointer-events-none opacity-50" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & Compact Actions */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-4">
            
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/80 text-apon-cyan dark:text-sky-300 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>Instant. Private. Yours.</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-slate-500 dark:text-slate-400 font-normal">Zero Internet</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-extrabold tracking-tight font-heading text-slate-900 dark:text-white leading-[1.2]">
              Share Files Across Any Device,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-cyan-300">
                Instantly.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Transfer heavy files in seconds directly over your local Wi-Fi or Wi-Fi Direct. Zero internet, no router limits, zero cloud storage. Pure peer-to-peer privacy built right into your hardware.
            </p>

            {/* Primary Download Button & Fallback */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 pt-1">
              <a
                href={getPrimaryDownloadUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all group"
              >
                <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                <span>
                  Download for {userOS.label} — {releaseInfo.version}
                </span>
              </a>

              <a
                href={releaseInfo.releaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all"
              >
                <span>Releases</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Platform pills */}
            <div className="pt-0.5">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5">
                <a
                  href={getAssetUrlFor('windows')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Monitor className="w-3 h-3 text-blue-500" />
                  <span>Windows</span>
                </a>

                <a
                  href={getAssetUrlFor('macos')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Apple className="w-3 h-3 text-slate-700 dark:text-slate-200" />
                  <span>macOS</span>
                </a>

                <a
                  href={getAssetUrlFor('android')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Smartphone className="w-3 h-3 text-emerald-500" />
                  <span>Android (.apk)</span>
                </a>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 text-sky-700 dark:text-sky-300">
                  <Globe className="w-3 h-3" />
                  <span>Web / iOS In Dev</span>
                </span>
              </div>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span>100% Free & Open Source</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-500" />
                <span>Zero Ads, Zero Tracking</span>
              </div>
            </div>

          </div>

          {/* Right Column: Intact Radar Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <RadarMockup />
          </div>

        </div>
      </div>
    </section>
  );
}
