import React from 'react';
import { GitHubIcon } from './SocialIcons';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-[#090D16] border-t border-slate-200/80 dark:border-slate-800/80 py-6 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-2">
            <img
              src="/assets/logo.png"
              alt="Apon Logo"
              className="h-5 w-auto object-contain block dark:hidden"
            />
            <img
              src="/assets/logo-dark.png"
              alt="Apon Logo"
              className="h-5 w-auto object-contain hidden dark:block"
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-2">
              Instant. Private. Yours.
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <a href="#features" className="hover:text-apon-cyan dark:hover:text-sky-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-apon-cyan dark:hover:text-sky-400 transition-colors">
              How It Works
            </a>
            <a href="#developer" className="hover:text-apon-cyan dark:hover:text-sky-400 transition-colors">
              Developer
            </a>
            <a
              href="https://github.com/miadkhanofficial1/Apon-share"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <GitHubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center sm:text-right">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              © 2026 Apon by MK.Studio. Instant. Private. Yours.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
