import React from 'react';
import { Globe, Mail, Sparkles } from 'lucide-react';
import { LinkedInIcon, GitHubIcon, InstagramIcon } from './SocialIcons';

export default function Developer({ onOpenContact }) {
  return (
    <section id="developer" className="scroll-mt-24 py-14 md:py-20 bg-slate-50/60 dark:bg-[#0B101D] transition-colors relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300">
            <Sparkles className="w-3 h-3" />
            <span>Behind The Product</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white mt-2 tracking-tight">
            About the Creator
          </h2>
        </div>

        {/* Clean, Compact Horizontal Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {/* Photo */}
            <div className="shrink-0">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
                <img
                  src="/assets/developer.jpg"
                  alt="MD. MIAD IBNA NOOR"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Info, Bio & Social Links */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                  MD. MIAD IBNA NOOR
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-sky-600 dark:text-sky-400">
                  Founder & Graphic Designer at MK.Studio
                </p>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                Graphic Designer & Digital Product Creator at MK.Studio. Obsessed with clean aesthetics, minimal interfaces, and building fast, zero-friction tools like Apon that make everyday digital life effortless.
              </p>

              {/* Minimalist Social Icons in Exact Order */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {/* 1. LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/miadkhanofficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-apon-navy dark:hover:text-white border border-slate-200/60 dark:border-slate-700 transition-colors"
                >
                  <LinkedInIcon className="w-4 h-4" />
                </a>

                {/* 2. GitHub */}
                <a
                  href="https://github.com/miadkhanofficial1"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-apon-navy dark:hover:text-white border border-slate-200/60 dark:border-slate-700 transition-colors"
                >
                  <GitHubIcon className="w-4 h-4" />
                </a>

                {/* 3. Instagram */}
                <a
                  href="https://instagram.com/miadkhan.vlogs"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-apon-navy dark:hover:text-white border border-slate-200/60 dark:border-slate-700 transition-colors"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>

                {/* 4. Portfolio/Website */}
                <a
                  href="https://www.linkedin.com/in/miadkhanofficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Portfolio & Studio"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-apon-navy dark:hover:text-white border border-slate-200/60 dark:border-slate-700 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                </a>

                {/* Direct Contact Me Button */}
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 transition-all shadow-sm active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Me</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
