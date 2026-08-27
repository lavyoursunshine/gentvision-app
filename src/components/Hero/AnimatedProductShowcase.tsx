import React from 'react';
import { 
  Eye, 
  Leaf, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface AnimatedProductShowcaseProps {
  onScanClick: () => void;
}

export const AnimatedProductShowcase: React.FC<AnimatedProductShowcaseProps> = ({
  onScanClick,
}) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-[#1e6238]/10 bg-gradient-to-b from-[#faf9ea] via-white to-[#faf9ea]">
      <div className="max-w-6xl mx-auto">
        
        {/* Main Grid: Info Left, Clean Product Image Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Value Prop, CTA */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f0efc0]/80 border border-[#c4cb38]/50 text-[#1e6238] text-xs font-bold shadow-sm">
              <Leaf className="w-4 h-4 text-[#70bc2c]" />
              <span>Smart Packaging Berbasis Kurkumin-DES & Jerami Padi</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Platform Pemindai Presisi <span className="bg-gradient-to-r from-[#1e6238] via-[#70bc2c] to-[#ba2c67] bg-clip-text text-transparent">GENT-Vision</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Solusi digital presisi untuk membaca spektrum warna stiker indikator kesegaran daging GENT (kurkumin-DES). Dilengkapi sistem <strong>Kalibrasi Titik Putih (White Balance Calibration)</strong> otomatis untuk memastikan hasil akurat di semua kamera gawai dan kondisi pencahayaan.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                onClick={onScanClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#1e6238] to-[#70bc2c] hover:from-[#174e2c] hover:to-[#5ea322] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#1e6238]/25 transition-all flex items-center justify-center gap-3 cursor-pointer transform hover:-translate-y-0.5"
              >
                <Eye className="w-5 h-5 text-white" />
                <span>Buka Pemindai Stiker GENT</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Clean Official Product Image Presentation */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-4 sm:p-6 border border-[#c4cb38]/40 shadow-xl">
              
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#70bc2c]" />
                  Struktur Kemasan Pintar GENT
                </span>
                <span className="text-[10px] font-mono font-bold text-[#1e6238] bg-[#f0efc0] px-2 py-0.5 rounded-md border border-[#c4cb38]/30">
                  Biomassa Selulosa
                </span>
              </div>

              {/* High-res Image of the Product */}
              <div className="rounded-2xl overflow-hidden bg-[#faf9ea] border border-slate-200 p-2 shadow-inner flex items-center justify-center">
                <img 
                  src="/assets/gent-packaging-ref.png" 
                  alt="Produk Kemasan Pintar GENT" 
                  className="w-full h-auto max-h-[380px] object-contain rounded-xl"
                />
              </div>

              <div className="mt-3 text-center text-xs text-slate-500 font-medium">
                Stiker indikator kolorimetri GENT terintegrasi pada kemasan daging sapi dan ayam
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
