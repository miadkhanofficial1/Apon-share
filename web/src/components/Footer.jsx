import React from 'react';
import { GitHubIcon } from './SocialIcons';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-[#090D16] border-t border-slate-200/80 dark:border-slate-800/80 py-8 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:text-left gap-6 md:gap-4">
          
          {/* Logo */}
          <div className="flex items-center justify-center md:justify-start">
            <img
              src="/assets/logo.png"
              alt="Apon Logo"
              className="h-6 w-auto object-contain block dark:hidden"
            />
            <img
              src="/assets/logo-dark.png"
              alt="Apon Logo"
              className="h-6 w-auto object-contain hidden dark:block"
            />
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
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
          <div className="text-center md:text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © 2026 Apon by MK.Studio. Instant. Private. Yours.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
