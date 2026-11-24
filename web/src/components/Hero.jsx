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

  // Determine primary download URL based on detected OS
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
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 radial-glow pointer-events-none opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & Download Actions */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-8">
            
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/80 text-apon-cyan dark:text-sky-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant. Private. Yours.</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-slate-600 dark:text-slate-400">Zero Internet Required</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-white leading-[1.12]">
              Share Files Across Any Device,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-cyan-300">
                Instantly.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Transfer gigabytes in seconds directly over your local Wi-Fi or Wi-Fi Direct. No internet connection, no router limits, no third-party cloud. Complete peer-to-peer privacy built right into your hardware.
            </p>

            {/* Primary Download Button & Fallback */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href={getPrimaryDownloadUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 shadow-xl shadow-slate-900/10 dark:shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
              >
                <Download className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                <span>
                  Download for {userOS.label} — {releaseInfo.version}
                </span>
              </a>

              <a
                href={releaseInfo.releaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
              >
                <span>View All Releases</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Secondary Platform Download Pills */}
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 text-center lg:text-left">
                Available Across All Your Ecosystems
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                {/* Windows */}
                <a
                  href={getAssetUrlFor('windows')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Monitor className="w-3.5 h-3.5 text-blue-500" />
                  <span>Windows (.exe / .msi)</span>
                </a>

                {/* macOS */}
                <a
                  href={getAssetUrlFor('macos')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Apple className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
                  <span>macOS (.dmg)</span>
                </a>

                {/* Android */}
                <a
                  href={getAssetUrlFor('android')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Android (.apk)</span>
                </a>

                {/* Web & iOS Notice */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 text-sky-700 dark:text-sky-300">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Web / iOS (Browser Pair In Dev)</span>
                </span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>100% Free & Open Source</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>No Accounts, No Ads, No Tracking</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Radar Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <RadarMockup />
          </div>

        </div>
      </div>
    </section>
  );
}
