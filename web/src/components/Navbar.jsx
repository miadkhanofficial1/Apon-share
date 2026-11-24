import React, { useState } from 'react';
import { Sun, Moon, Menu, X, Send } from 'lucide-react';

export default function Navbar({ theme, onToggleTheme, onOpenContact }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-[#090D16]/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand (Clean Apon logo only) */}
          <a href="#" className="flex items-center group">
            <div className="relative h-8 sm:h-9 flex items-center">
              <img
                src="/assets/logo.png"
                alt="Apon Logo"
                className="h-7 sm:h-8 w-auto object-contain block dark:hidden transition-transform duration-200 group-hover:scale-105"
              />
              <img
                src="/assets/logo-dark.png"
                alt="Apon Logo"
                className="h-7 sm:h-8 w-auto object-contain hidden dark:block transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            <a
              href="#features"
              className="text-xs font-medium tracking-wide text-slate-600 hover:text-apon-cyan dark:text-slate-300 dark:hover:text-apon-cyan-bright transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-xs font-medium tracking-wide text-slate-600 hover:text-apon-cyan dark:text-slate-300 dark:hover:text-apon-cyan-bright transition-colors"
            >
              How It Works
            </a>
            <a
              href="#developer"
              className="text-xs font-medium tracking-wide text-slate-600 hover:text-apon-cyan dark:text-slate-300 dark:hover:text-apon-cyan-bright transition-colors"
            >
              Developer
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-full text-slate-600 hover:text-apon-navy dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-apon-cyan"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Contact Us Button */}
            <button
              type="button"
              onClick={onOpenContact}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full text-white bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 transition-all shadow-sm active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Contact Us</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              How It Works
            </a>
            <a
              href="#developer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Developer
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-white bg-apon-navy dark:bg-sky-600"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Contact Us</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
