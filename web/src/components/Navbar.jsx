import React, { useState } from 'react';
import { Sun, Moon, Menu, X, Send } from 'lucide-react';

export default function Navbar({ theme, onToggleTheme, onOpenContact }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-[#090D16]/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative h-11 w-auto flex items-center">
              {/* Show light logo in light mode, dark logo in dark mode */}
              <img
                src="/assets/logo.png"
                alt="Apon Logo"
                className="h-10 w-auto object-contain block dark:hidden transition-transform duration-200 group-hover:scale-105"
              />
              <img
                src="/assets/logo-dark.png"
                alt="Apon Logo"
                className="h-10 w-auto object-contain hidden dark:block transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <div className="hidden sm:block border-l border-slate-300 dark:border-slate-700 pl-3">
              <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                Instant. Private. Yours.
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-apon-cyan dark:text-slate-300 dark:hover:text-apon-cyan-bright transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-apon-cyan dark:text-slate-300 dark:hover:text-apon-cyan-bright transition-colors"
            >
              How It Works
            </a>
            <a
              href="#developer"
              className="text-sm font-medium text-slate-600 hover:text-apon-cyan dark:text-slate-300 dark:hover:text-apon-cyan-bright transition-colors"
            >
              Developer
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2.5 rounded-full text-slate-600 hover:text-apon-navy dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-apon-cyan"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Contact Us Button */}
            <button
              type="button"
              onClick={onOpenContact}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full text-white bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 transition-all shadow-sm hover:shadow active:scale-95"
            >
              <Send className="w-4 h-4" />
              Contact Us
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              How It Works
            </a>
            <a
              href="#developer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Developer
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-apon-navy dark:bg-sky-600"
            >
              <Send className="w-4 h-4" />
              Contact Us
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
