import React from 'react';
import { Leaf, Eye, Layers, ChevronRight } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-[#1e6238]/10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo with 8-Color Palette Gradient */}
        <div 
          onClick={() => onNavigate('hero-section')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1e6238] via-[#70bc2c] to-[#c4cb38] p-0.5 shadow-md shadow-[#1e6238]/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-[#1e6238]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                GENT<span className="text-[#1e6238]">-Vision</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f0efc0] text-[#1e6238] font-mono font-bold border border-[#c4cb38]/40">
                Eco-Packaging
              </span>
            </div>
            <span className="text-[10px] text-slate-500 tracking-wider block font-medium">
              Smart Meat Packaging Platform
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-2">
          <button
            onClick={() => onNavigate('hero-section')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'hero-section'
                ? 'bg-[#f0efc0]/60 text-[#1e6238] border border-[#c4cb38]/50 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 text-[#70bc2c]" />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => onNavigate('scanner-section')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'scanner-section'
                ? 'bg-[#1e6238] text-white shadow-md shadow-[#1e6238]/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Pemindai Presisi GENT</span>
          </button>
        </nav>

        {/* Right CTA Button */}
        <div>
          <button
            onClick={() => onNavigate('scanner-section')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1e6238] to-[#70bc2c] hover:from-[#174e2c] hover:to-[#5ea322] text-white text-xs font-bold shadow-md shadow-[#1e6238]/20 transition-all flex items-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5"
          >
            <Eye className="w-4 h-4" />
            <span>Buka Pemindai</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
