import React, { useState } from 'react';
import { 
  Leaf, 
  MapPin, 
  Truck, 
  Thermometer, 
  Droplets, 
  ShieldCheck, 
  QrCode, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Calculator,
  ExternalLink,
  Lock
} from 'lucide-react';
import { COLD_CHAIN_ROUTE, INITIAL_ECO_METRICS } from '../../data/sampleData';

export const EcoTraceabilityHub: React.FC = () => {
  const [selectedPointId, setSelectedPointId] = useState<string>('CC-01');
  const [customPackageUnits, setCustomPackageUnits] = useState<number>(500);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);

  const selectedPoint = COLD_CHAIN_ROUTE.find((p) => p.id === selectedPointId) || COLD_CHAIN_ROUTE[0];

  // Calculated eco savings
  // 1 GENT sticker = ~0.025 kg dried rice straw biomass, saving ~0.065 kg CO2e
  const calculatedStrawKg = Number((customPackageUnits * 0.025).toFixed(1));
  const calculatedCo2Kg = Number((customPackageUnits * 0.065).toFixed(1));
  const calculatedFoodSavedKg = Number((customPackageUnits * 0.15).toFixed(1));

  return (
    <section id="traceability-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Section Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Leaf className="w-3.5 h-3.5" />
          <span>Fitur Utama D: Eco-Traceability Hub & Biomassa Jerami Padi</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
          Transparansi Rantai Dingin & Ekonomi Sirkular
        </h2>
        <p className="max-w-2xl mx-auto text-slate-400 text-xs sm:text-sm">
          Lacak rekam jejak suhu dari Rumah Potong Hewan (RPH) hingga rak ritel, serta hitung kontribusi pengurangan emisi dari pemanfaatan limbah jerami padi.
        </p>
      </div>

      {/* High-Level Impact Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
          <span className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
            <Leaf className="w-4 h-4 text-emerald-400" /> Jerami Padi Diselamatkan
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {(INITIAL_ECO_METRICS.riceStrawSavedKg / 1000).toFixed(2)}
            </span>
            <span className="text-xs text-emerald-300">Ton Biomassa</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Mencegah pembakaran jerami di sawah
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-teal-950/40 border border-teal-500/30 space-y-1">
          <span className="text-xs text-teal-300 font-medium flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-400" /> Emisi Karbon Dicegah
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {(INITIAL_ECO_METRICS.co2EmissionsPreventedKg / 1000).toFixed(2)}
            </span>
            <span className="text-xs text-teal-300">Ton CO2e</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Substitusi plastik sintetik berbasis minyak bumi
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-1">
          <span className="text-xs text-cyan-300 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Food Loss Terselamatkan
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {(INITIAL_ECO_METRICS.foodLossReducedKg / 1000).toFixed(2)}
            </span>
            <span className="text-xs text-cyan-300">Ton Daging</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Melalui deteksi dini & rotasi stok FEFO
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
          <span className="text-xs text-indigo-300 font-medium flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-400" /> Sensor GENT Aktif
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {INITIAL_ECO_METRICS.activeSensorsDeployed.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-indigo-300">Kemasan</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Tersebar di jaringan ritel & distributor
          </span>
        </div>

      </div>

      {/* Main Interactive Grid: Cold Chain Map & Eco Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 7 cols: Interactive Cold Chain Timeline Map */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              Alur Rantai Dingin IoT (Cold Chain Traceability)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Batch: WAGYU-A5-9921</span>
          </div>

          {/* Stepper Timeline Points */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {COLD_CHAIN_ROUTE.map((point, index) => (
              <button
                key={point.id}
                onClick={() => setSelectedPointId(point.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedPointId === point.id
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">Tahap {index + 1}</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                </div>
                <h4 className="text-xs font-bold text-white truncate">{point.stageName}</h4>
                <span className="text-[10px] text-slate-400 block truncate mt-0.5">{point.locationName}</span>
              </button>
            ))}
          </div>

          {/* Selected Stage Detail Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-emerald-400 font-mono font-bold block">{selectedPoint.id}</span>
                <h4 className="text-base font-extrabold text-white">{selectedPoint.stageName}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {selectedPoint.locationName}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-slate-400 block">{selectedPoint.timestamp}</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Status: Optimal
                </span>
              </div>
            </div>

            {/* IoT Telemetry Data */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-400" /> Suhu Logistik
                </span>
                <span className="text-xl font-bold text-white font-mono mt-0.5 block">
                  {selectedPoint.temperatureCelsius}°C
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" /> Kelembapan (RH)
                </span>
                <span className="text-xl font-bold text-white font-mono mt-0.5 block">
                  {selectedPoint.humidityPercent}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block">Koordinat GPS</span>
                <span className="text-xs font-mono text-slate-300 mt-1 block">
                  {selectedPoint.gpsCoordinates.lat}, {selectedPoint.gpsCoordinates.lng}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
              <span className="text-emerald-400 font-semibold">Catatan Verifikasi: </span>
              {selectedPoint.notes}
            </p>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowCertModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Lihat Sertifikat Keaslian Digital
              </button>
            </div>
          </div>

        </div>

        {/* Right 5 cols: Rice Straw Biomass & Eco-Calculator */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white font-bold text-base">Kalkulator Dampak Sirkular Biomassa</h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Hitung kontribusi lingkungan bila Anda atau bisnis Anda mengadopsi stiker kemasan pintar GENT berbasis selulosa jerami padi:
          </p>

          {/* Input Slider */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Jumlah Kemasan Daging:</span>
              <span className="text-emerald-400 font-bold font-mono text-sm">{customPackageUnits} Kemasan</span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={customPackageUnits}
              onChange={(e) => setCustomPackageUnits(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>50 pcs</span>
              <span>2.500 pcs</span>
              <span>5.000 pcs</span>
            </div>
          </div>

          {/* Output Metric Cards */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs text-slate-300 font-semibold block">Limbah Jerami Dimanfaatkan</span>
                  <span className="text-[10px] text-slate-500">Mencegah polusi pembakaran sawah</span>
                </div>
              </div>
              <span className="text-base font-black text-emerald-400 font-mono">+{calculatedStrawKg} kg</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <div>
                  <span className="text-xs text-slate-300 font-semibold block">Pencegahan Emisi CO2e</span>
                  <span className="text-[10px] text-slate-500">Dihitung dari LCA kemasan bio</span>
                </div>
              </div>
              <span className="text-base font-black text-teal-400 font-mono">-{calculatedCo2Kg} kg</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs text-slate-300 font-semibold block">Daging Segar Terselamatkan</span>
                  <span className="text-[10px] text-slate-500">Pencegahan food waste rantai pasok</span>
                </div>
              </div>
              <span className="text-base font-black text-cyan-400 font-mono">~{calculatedFoodSavedKg} kg</span>
            </div>
          </div>

        </div>

      </div>

      {/* Digital Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-white animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Sertifikat Digital Keaslian & Eco-Traceability</h3>
              </div>
              <button
                onClick={() => setShowCertModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">ID Sertifikat:</span>
                <span className="text-emerald-400 font-bold">GENT-AUTH-2026-UGM-9912</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">Batch Code:</span>
                <span className="text-white">WAGYU-A5-9921</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">Biomassa Jerami:</span>
                <span className="text-emerald-300">100% Selulosa Jerami DIY</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">Formulasi Sensor:</span>
                <span className="text-yellow-300">Curcumin-DES (Deep Eutectic Solvent)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Verifikasi Hash Kriptografi:</span>
                <span className="text-[10px] text-slate-400 break-all block mt-0.5">
                  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Sertifikat ini memverifikasi bahwa kemasan daging telah melewati kontrol suhu berstandar HACCP dan memanfaatkan inovasi kemasan pintar karya UGM.
            </p>

            <button
              onClick={() => setShowCertModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              Tutup Sertifikat
            </button>
          </div>
        </div>
      )}

    </section>
  );
};
