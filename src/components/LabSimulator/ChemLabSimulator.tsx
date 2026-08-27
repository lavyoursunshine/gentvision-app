import React, { useState } from 'react';
import { 
  FlaskConical, 
  Sparkles, 
  Activity, 
  Layers, 
  Sliders, 
  Info, 
  Atom,
  RefreshCw
} from 'lucide-react';
import { rgbToLab, calculateDeltaE, calculateHueAngle, SENSOR_CALIBRATION } from '../../core/colorimetry';

export const ChemLabSimulator: React.FC = () => {
  const [simPh, setSimPh] = useState<number>(6.2);
  const [simTvbn, setSimTvbn] = useState<number>(8.5);

  // Compute realistic RGB & colorimetry based on pH and TVB-N kinetics
  // Curcumin in DES:
  // pH 5.5 - 6.8: Yellow (R: ~235, G: ~180, B: ~10)
  // pH 6.9 - 7.9: Transition to Orange (R: ~235, G: ~90-140, B: ~10)
  // pH 8.0 - 9.5: Transition to Red-Brown / Deep Red (R: ~120-160, G: ~20-30, B: ~20-30)

  const calculateSimulatedColor = (ph: number) => {
    let r = 234;
    let g = 179;
    let b = 8;
    let lambdaMax = 425; // nm
    let molecularForm = 'Bentuk Netral (Keto-Enol Kurkumin)';
    let chemicalDesc = 'Gugus fenolik kurkumin terprotonasi penuh. Ikatan hidrogen stabil dalam matriks Deep Eutectic Solvent (DES). Absorpsi maksimum pada cahaya biru.';

    if (ph < 7.0) {
      // Yellow realm
      const progress = Math.max(0, (ph - 5.5) / 1.5);
      r = Math.round(234 + progress * 5);
      g = Math.round(185 - progress * 35);
      b = Math.round(8 + progress * 4);
      lambdaMax = Math.round(425 + progress * 20);
    } else if (ph < 8.0) {
      // Orange realm (Partial deprotonation)
      const progress = (ph - 7.0) / 1.0;
      r = Math.round(239 - progress * 5);
      g = Math.round(150 - progress * 70);
      b = Math.round(12 - progress * 2);
      lambdaMax = Math.round(445 + progress * 45);
      molecularForm = 'Deprotonasi Parsial (Mono-Fenolat)';
      chemicalDesc = 'Emisi basa volatil (Amonia, TMA, DMA) memicu deprotonasi gugus fenol pertama. Terjadi delokalisasi elektron awal dan pergeseran warna jingga.';
    } else {
      // Red-brown realm (Bathochromic maximum)
      const progress = Math.min(1, (ph - 8.0) / 1.5);
      r = Math.round(234 - progress * 110);
      g = Math.round(80 - progress * 55);
      b = Math.round(10 + progress * 15);
      lambdaMax = Math.round(490 + progress * 40);
      molecularForm = 'Ion Enolat Stabil (Delokalisasi Pi Maksimum)';
      chemicalDesc = 'Pergeseran batokromik maksimum akibat resonansi ion enolat di dalam sistem konjugasi kurkumin. Warna berubah menjadi merah kecokelatan permanen.';
    }

    const rgb = { r, g, b };
    const lab = rgbToLab(rgb);
    const deltaE = calculateDeltaE(lab, SENSOR_CALIBRATION.freshBaseline);
    const hueAngle = calculateHueAngle(lab);

    return {
      rgb,
      hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
      lab,
      deltaE,
      hueAngle,
      lambdaMax,
      molecularForm,
      chemicalDesc,
    };
  };

  const sim = calculateSimulatedColor(simPh);

  return (
    <section id="chemlab-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* Section Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Interactive Science Lab Simulator</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
          Simulator Kinetika Reaksi Kurkumin - DES
        </h2>
        <p className="max-w-2xl mx-auto text-slate-400 text-xs sm:text-sm">
          Eksplorasi bagaimana variasi derajat keasaman (pH) dan uap amonia/TVB-N mempengaruhi konformasi molekuler dan pergeseran panjang gelombang absorban.
        </p>
      </div>

      {/* Main Simulator Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-8">
        
        {/* Controls Grid: pH and TVB-N Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Slider 1: pH */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Derajat Keasaman (pH Sampel)</span>
              <span className="text-lg font-black text-emerald-400 font-mono">pH {simPh.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="5.5"
              max="9.0"
              step="0.1"
              value={simPh}
              onChange={(e) => {
                const newPh = Number(e.target.value);
                setSimPh(newPh);
                // Synchronize estimated TVB-N
                setSimTvbn(Number((4.0 + Math.pow(Math.max(0, newPh - 5.5), 2) * 2.8).toFixed(1)));
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>pH 5.5 (Asam Segar)</span>
              <span>pH 7.0 (Netral)</span>
              <span>pH 9.0 (Basa Kuat)</span>
            </div>
          </div>

          {/* Slider 2: TVB-N */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Konsentrasi Gas TVB-N</span>
              <span className="text-lg font-black text-purple-400 font-mono">{simTvbn} mg/100g</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="45.0"
              step="0.5"
              value={simTvbn}
              onChange={(e) => {
                const newTvbn = Number(e.target.value);
                setSimTvbn(newTvbn);
                // Synchronize estimated pH
                setSimPh(Number((5.6 + Math.sqrt(Math.max(0, newTvbn - 2.0)) * 0.52).toFixed(1)));
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>&lt; 10 (Segar)</span>
              <span>15 - 20 (Waspada)</span>
              <span>&gt; 25 (Busuk)</span>
            </div>
          </div>

        </div>

        {/* Live Lab Reaction Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left 5 cols: Sensor Color Disc & CIE Lab metrics */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-slate-700 flex flex-col items-center justify-center space-y-4 shadow-xl">
            <div className="text-center">
              <span className="text-xs text-slate-400 font-medium block">Rona Warna Sensor Reaktif</span>
              <span className="text-xs font-mono text-emerald-400">{sim.hex}</span>
            </div>

            {/* Glowing Sensor Pad Circle */}
            <div 
              className="w-32 h-32 rounded-full border-4 border-slate-200 shadow-2xl transition-all duration-300 flex items-center justify-center relative"
              style={{
                backgroundColor: sim.hex,
                boxShadow: `0 0 35px ${sim.hex}`,
              }}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40" />
            </div>

            {/* Colorimetric Metric Badges */}
            <div className="grid grid-cols-3 gap-2 w-full text-center text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">L*</span>
                <span className="font-bold text-white">{sim.lab.L}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">a*</span>
                <span className="font-bold text-white">{sim.lab.a}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">b*</span>
                <span className="font-bold text-white">{sim.lab.b}</span>
              </div>
            </div>

            <div className="w-full flex justify-between text-xs text-slate-400 font-mono pt-1 border-t border-slate-800">
              <span>ΔE Jarak Warna: <strong className="text-white">{sim.deltaE}</strong></span>
              <span>Sudut Hue: <strong className="text-white">{sim.hueAngle.toFixed(1)}°</strong></span>
            </div>
          </div>

          {/* Right 7 cols: UV-Vis Absorbance Spectrum & Chemical Mechanism */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Molecular State */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Konformasi Kimiawi</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  λ-max: {sim.lambdaMax} nm
                </span>
              </div>
              <h4 className="text-sm font-black text-white">{sim.molecularForm}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {sim.chemicalDesc}
              </p>
            </div>

            {/* Simulated UV-Vis Absorbance Spectrum Graph */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Simulasi Spektrum Absorban UV-Vis</span>
                <span className="font-mono text-[10px]">350 nm — 600 nm</span>
              </div>

              {/* Spectrum SVG Curve */}
              <div className="relative h-28 w-full bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden flex items-end">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />

                {/* SVG Curve */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                  {/* Dynamic Gaussian Peak based on lambdaMax */}
                  {(() => {
                    const peakX = ((sim.lambdaMax - 350) / 250) * 300;
                    const pathData = `M 0,95 Q ${peakX * 0.6},90 ${peakX - 30},60 Q ${peakX},10 ${peakX + 30},60 Q ${peakX * 1.2},90 300,95`;
                    return (
                      <>
                        <path
                          d={pathData}
                          fill="none"
                          stroke={sim.hex}
                          strokeWidth="3"
                          className="transition-all duration-300"
                        />
                        <line
                          x1={peakX}
                          y1="0"
                          x2={peakX}
                          y2="100"
                          stroke="rgba(255,255,255,0.3)"
                          strokeDasharray="3 3"
                        />
                      </>
                    );
                  })()}
                </svg>

                {/* Peak Indicator Label */}
                <div 
                  className="absolute top-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-white border border-slate-700 transition-all"
                  style={{
                    left: `${Math.max(10, Math.min(75, ((sim.lambdaMax - 350) / 250) * 100))}%`
                  }}
                >
                  Puncak: {sim.lambdaMax} nm
                </div>
              </div>

              <span className="text-[10px] text-slate-500 font-mono block text-right">
                Pergeseran Batokromik (Red-Shift) seiring alkalinitas TVB-N
              </span>
            </div>

            {/* Deep Eutectic Solvent (DES) Role Box */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2.5">
              <Atom className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Peran Matriks DES: </strong>
                Deep Eutectic Solvent (Choline Chloride : Glycerol) menstabilkan kurkumin alami dari degradasi termal dan fotodegradasi, serta mempercepat transfer massa gas amonia ke situs aktif kurkumin.
              </span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
