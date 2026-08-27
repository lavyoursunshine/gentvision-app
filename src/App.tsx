import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AnimatedProductShowcase } from './components/Hero/AnimatedProductShowcase';
import { SmartColorAnalyzer } from './components/Scanner/SmartColorAnalyzer';
import { Footer } from './components/Footer';

export function App() {
  const [activeSection, setActiveSection] = useState<string>('hero-section');

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Main Content */}
      <main className="flex-1 space-y-4">
        {/* LANDING PAGE */}
        <section id="hero-section">
          <AnimatedProductShowcase
            onScanClick={() => handleNavigate('scanner-section')}
          />
        </section>

        {/* FITUR UTAMA: Pemindai Presisi Spektrum Warna Stiker GENT */}
        <section id="scanner-section">
          <SmartColorAnalyzer />
        </section>
      </main>

      {/* Footer Minimalis */}
      <Footer />
    </div>
  );
}

export default App;
