import React from 'react';
import { Globe, Mail, Sparkles } from 'lucide-react';
import { LinkedInIcon, GitHubIcon, InstagramIcon } from './SocialIcons';

export default function Developer({ onOpenContact }) {
  return (
    <section id="developer" className="py-20 md:py-28 bg-slate-50/70 dark:bg-[#0B101D] transition-colors relative overflow-hidden">
      
      {/* Background soft ambient accents */}
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Pill */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Behind The Product</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white mt-3 tracking-tight">
            About the Creator
          </h2>
        </div>

        {/* Creator Showcase Card */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            
            {/* Left: Sleek Framed Profile Photo */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative group">
                {/* Glowing decorative frame border */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-500 opacity-75 blur group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 bg-slate-900 shadow-2xl">
                  <img
                    src="/assets/developer.jpg"
                    alt="MD. MIAD IBNA NOOR"
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
                  
                  {/* Badge */}
                  <div className="absolute bottom-3 left-3 right-3 py-1.5 px-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-center">
                    <span className="text-[11px] font-semibold text-sky-300 tracking-wide">
                      MK.Studio Founder
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Info, Bio & Social Actions */}
            <div className="md:col-span-7 space-y-6 text-center md:text-left">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                  MD. MIAD IBNA NOOR
                </h3>
                <p className="text-sm sm:text-base font-semibold text-sky-600 dark:text-sky-400 mt-1">
                  Founder & Graphic Designer at MK.Studio
                </p>
              </div>

              {/* Exact bio provided by user */}
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                Graphic Designer & Digital Product Creator at MK.Studio. Obsessed with clean aesthetics, minimal interfaces, and building fast, zero-friction tools like Apon that make everyday digital life effortless.
              </p>

              {/* Social Icons in exact required order */}
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Connect & Follow
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {/* 1. LinkedIn */}
                  <a
                    href="https://www.linkedin.com/in/miadkhanofficial/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn Profile"
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-white hover:bg-[#0A66C2] dark:hover:bg-[#0A66C2] flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 shadow-sm"
                  >
                    <LinkedInIcon className="w-5 h-5" />
                  </a>

                  {/* 2. GitHub */}
                  <a
                    href="https://github.com/miadkhanofficial1"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub Profile"
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-white hover:bg-slate-900 dark:hover:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 shadow-sm"
                  >
                    <GitHubIcon className="w-5 h-5" />
                  </a>

                  {/* 3. Instagram */}
                  <a
                    href="https://instagram.com/miadkhan.vlogs"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram Profile"
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-white hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 shadow-sm"
                  >
                    <InstagramIcon className="w-5 h-5" />
                  </a>

                  {/* 4. Portfolio/Website */}
                  <a
                    href="https://www.linkedin.com/in/miadkhanofficial/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Portfolio & Studio"
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-white hover:bg-sky-600 dark:hover:bg-sky-600 flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 shadow-sm"
                  >
                    <Globe className="w-5 h-5" />
                  </a>

                  {/* Direct Contact Me Button */}
                  <button
                    type="button"
                    onClick={onOpenContact}
                    className="ml-0 sm:ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 transition-all shadow-md active:scale-95"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Contact Me</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
