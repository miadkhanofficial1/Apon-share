import React from 'react';
import { Globe, Mail, Sparkles } from 'lucide-react';
import { LinkedInIcon, GitHubIcon, InstagramIcon } from './SocialIcons';

export default function Developer({ onOpenContact }) {
  return (
    <section id="developer" className="scroll-mt-24 py-10 md:py-14 bg-slate-50/60 dark:bg-[#0B101D] transition-colors relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300">
            <Sparkles className="w-3 h-3" />
            <span>Behind The Product</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1.5 tracking-tight">
            About the Creator
          </h2>
        </div>

        {/* Clean, Compact Horizontal Card */}
        <div className="max-w-2xl mx-auto rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            
            {/* Photo */}
            <div className="shrink-0">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                <img
                  src="/assets/developer.jpg"
                  alt="MD. MIAD IBNA NOOR"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Info, Bio & Social Links */}
            <div className="flex-1 text-center sm:text-left space-y-2.5">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  MD. MIAD IBNA NOOR
                </h3>
                <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                  Founder & Graphic Designer at MK.Studio
                </p>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                Graphic Designer & Digital Product Creator at MK.Studio. Obsessed with clean aesthetics, minimal interfaces, and building fast, zero-friction tools like Apon that make everyday digital life effortless.
              </p>

              {/* Minimalist Social Icons in Exact Order */}
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                {/* 1. LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/miadkhanofficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-apon-navy dark:hover:text-white border border-slate-200/60 dark:border-slate-700 transition-colors"
                >
                  <LinkedInIcon className="w-3.5 h-3.5" />
                </a>

                {/* 2. GitHub */}
                <a
                  href="https://github.com/miadkhanofficial1"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-apon-navy dark:hover:text-white border border-slate-200/60 dark:border-slate-700 transition-colors"
                >
                  <GitHubIcon className="w-3.5 h-3.5" />
                </a>

                {/* 3. Instagram */}
                <a
                  href="https://instagram.com/miadkhan.vlogs"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-apon-navy dark:hover:text-white border border-slate-200/60 dark:border-slate-700 transition-colors"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                </a>

                {/* 4. Portfolio/Website */}
                <a
                  href="https://www.linkedin.com/in/miadkhanofficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Portfolio & Studio"
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-apon-navy dark:hover:text-white border border-slate-200/60 dark:border-slate-700 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>

                {/* Direct Contact Me Button */}
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="ml-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 transition-all shadow-sm active:scale-95"
                >
                  <Mail className="w-3 h-3" />
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
