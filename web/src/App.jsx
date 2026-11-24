import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Developer from './components/Developer';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import { getInitialTheme, applyTheme } from './utils/theme';

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#090D16] text-slate-800 dark:text-slate-100 transition-colors selection:bg-sky-500 selection:text-white">
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenContact={() => setIsContactOpen(true)}
      />

      <main className="flex-grow">
        <Hero onOpenContact={() => setIsContactOpen(true)} />
        <Features />
        <HowItWorks />
        <Developer onOpenContact={() => setIsContactOpen(true)} />
      </main>

      <Footer />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
