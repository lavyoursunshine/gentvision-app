import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Thermometer, 
  Clock, 
  Activity, 
  Utensils, 
  ShieldCheck, 
  Download, 
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { ColorAnalysisResult } from '../../types';

interface ResultDetailCardProps {
  result: ColorAnalysisResult;
  onReset: () => void;
}

export const ResultDetailCard: React.FC<ResultDetailCardProps> = ({ result, onReset }) => {
  const statusTheme = {
    fresh: {
      badge: 'bg-[#f0efc0] text-[#1e6238] border-[#c4cb38]',
      border: 'border-[#c4cb38]',
      headerBg: 'bg-gradient-to-r from-[#faf9ea] via-[#f0efc0]/40 to-white',
      icon: <CheckCircle2 className="w-8 h-8 text-[#1e6238] flex-shrink-0" />,
      tag: 'STATUS 1: KUNING (SEGAR)',
      tagColor: 'text-[#1e6238]',
      accentColor: 'text-[#1e6238]',
    },
    warning: {
      badge: 'bg-[#eaa2b2]/30 text-[#9f5472] border-[#eaa2b2]',
      border: 'border-[#eaa2b2]',
      headerBg: 'bg-gradient-to-r from-[#eaa2b2]/20 via-[#faf9ea] to-white',
      icon: <AlertTriangle className="w-8 h-8 text-[#9f5472] flex-shrink-0" />,
      tag: 'STATUS 2: JINGGA (WASPADA)',
      tagColor: 'text-[#9f5472]',
      accentColor: 'text-[#9f5472]',
    },
    spoiled: {
      badge: 'bg-[#ba2c67]/20 text-[#ba2c67] border-[#ba2c67]',
      border: 'border-[#ba2c67]',
      headerBg: 'bg-gradient-to-r from-[#ba2c67]/15 via-[#faf9ea] to-white',
      icon: <XCircle className="w-8 h-8 text-[#ba2c67] flex-shrink-0" />,
      tag: 'STATUS 3: MERAH (RUSAK / BAHAYA)',
      tagColor: 'text-[#ba2c67]',
      accentColor: 'text-[#ba2c67]',
    },
  }[result.status];

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GENT-Scan-${result.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className={`bg-white rounded-3xl p-6 sm:p-8 border-2 ${statusTheme.border} shadow-xl space-y-6 max-w-2xl mx-auto animate-fadeIn`}>
      
      {/* 1. Header Utama Rapi */}
      <div className={`p-5 rounded-2xl ${statusTheme.headerBg} border border-slate-200 space-y-3 shadow-sm`}>
        <div className="flex items-center justify-between gap-3">
          <span className={`text-xs font-black px-3.5 py-1 rounded-full border ${statusTheme.badge}`}>
            {statusTheme.tag}
          </span>
          {result.whiteCalibrated && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#f0efc0] text-[#1e6238] border border-[#c4cb38] flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-[#70bc2c]" /> Kalibrasi Putih Aktif
            </span>
          )}
        </div>

        <div className="flex items-start gap-3.5 pt-1">
          <div className="p-2 rounded-2xl bg-white border border-slate-200 shadow-sm mt-0.5">
            {statusTheme.icon}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {result.statusTitle}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {result.statusMessage}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Empat Parameter Kuantitatif Utama */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-[#70bc2c]" />
          Parameter Pengukuran Sensor
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Card 1: Derajat pH */}
          <div className="p-4 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 flex flex-col justify-between space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-[#70bc2c]" /> Derajat Keasaman (pH)
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {result.phValue < 7.0 ? 'Netral / Segar' : result.phValue < 8.0 ? 'Mendekati Basa' : 'Basa Tinggi'}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 font-mono">{result.phValue}</span>
              <span className="text-xs text-slate-500 font-mono">Skala 5.5 - 9.0</span>
            </div>

            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#70bc2c] via-[#c4cb38] to-[#ba2c67] rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(5, ((result.phValue - 5.0) / 4.0) * 100))}%` }}
              />
            </div>
          </div>

          {/* Card 2: Emisi TVB-N */}
          <div className="p-4 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 flex flex-col justify-between space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#9f5472]" /> Emisi Gas TVB-N
              </span>
              <span className="text-[11px] font-semibold text-slate-500">Amonia & Amina</span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 font-mono">{result.tvbnValue}</span>
              <span className="text-xs text-slate-600 font-semibold font-mono">mg N / 100g</span>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200/80 pt-1.5">
              <span>Ambang batas aman:</span>
              <span className="font-bold text-slate-700">&lt; 20 mg/100g</span>
            </div>
          </div>

          {/* Card 3: Indeks Kesegaran */}
          <div className="p-4 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 flex flex-col justify-between space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#70bc2c]" /> Indeks Kesegaran
              </span>
              <span className="text-[11px] font-semibold text-slate-500">Mutu Biologis</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1e6238] font-mono">{result.freshnessIndex}%</span>
              <span className="text-xs text-slate-500">
                {result.freshnessIndex >= 80 ? 'Kondisi Prima' : result.freshnessIndex >= 40 ? 'Perlu Diolah Segera' : 'Tidak Layak'}
              </span>
            </div>

            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#70bc2c] rounded-full transition-all"
                style={{ width: `${result.freshnessIndex}%` }}
              />
            </div>
          </div>

          {/* Card 4: Sisa Umur Simpan */}
          <div className="p-4 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 flex flex-col justify-between space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#1e6238]" /> Sisa Umur Simpan
              </span>
              <span className="text-[11px] font-semibold text-slate-500">Chiller 0–4°C</span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 font-mono">~{result.remainingShelfHours}</span>
              <span className="text-xs font-bold text-slate-700">Jam Penyimpanan</span>
            </div>

            <div className="text-[11px] text-slate-500 border-t border-slate-200/80 pt-1.5">
              Estimasi degradasi protein pada chiller
            </div>
          </div>

        </div>
      </div>

      {/* 3. Laporan Kalibrasi Spektrum Warna */}
      <div className="p-5 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-[#70bc2c]" />
            Kalibrasi Spektrum Warna Stiker GENT
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Waktu: {result.timestamp}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
          {/* Color Circles */}
          <div className="flex items-center justify-around bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 block mb-1">Kamera (Raw)</span>
              <div 
                className="w-10 h-10 rounded-full border-2 border-slate-300 shadow-inner mx-auto" 
                style={{ backgroundColor: result.rawHex }} 
              />
              <span className="text-[11px] font-mono font-bold text-slate-700 mt-1 block">{result.rawHex}</span>
            </div>

            <div className="text-slate-400 font-bold text-base">➔</div>

            <div className="text-center">
              <span className="text-[10px] text-[#1e6238] font-bold block mb-1">Terkalibrasi</span>
              <div 
                className="w-10 h-10 rounded-full border-2 border-[#70bc2c] shadow-md mx-auto" 
                style={{ backgroundColor: result.hex }} 
              />
              <span className="text-[11px] font-mono font-black text-slate-900 mt-1 block">{result.hex}</span>
            </div>
          </div>

          {/* CIE Lab values */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-2 rounded-xl bg-[#faf9ea] border border-[#c4cb38]/20">
              <span className="text-[10px] text-slate-500 block font-sans">Luminansi</span>
              <span className="font-bold text-slate-900 text-sm">{result.lab.L}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#faf9ea] border border-[#c4cb38]/20">
              <span className="text-[10px] text-slate-500 block font-sans">a* (Red/Grn)</span>
              <span className="font-bold text-slate-900 text-sm">{result.lab.a}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#faf9ea] border border-[#c4cb38]/20">
              <span className="text-[10px] text-slate-500 block font-sans">b* (Yel/Blu)</span>
              <span className="font-bold text-slate-900 text-sm">{result.lab.b}</span>
            </div>
          </div>
        </div>

        {result.recommendations.foodSafetyWarning && (
          <div className="p-3.5 rounded-xl bg-[#ba2c67]/15 border border-[#ba2c67]/40 text-[#ba2c67] text-xs font-semibold flex items-start gap-2.5 mt-2 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-[#ba2c67] flex-shrink-0 mt-0.5" />
            <span>{result.recommendations.foodSafetyWarning}</span>
          </div>
        )}
      </div>

      {/* 4. Rekomendasi Kuliner & Penyimpanan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Culinary */}
        <div className="p-4 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 shadow-sm space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-[#70bc2c]" />
            Rekomendasi Kuliner
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {result.recommendations.culinary.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#70bc2c] font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Storage */}
        <div className="p-4 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 shadow-sm space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1e6238]" />
            Langkah Penyimpanan
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {result.recommendations.preventiveSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#1e6238] font-bold">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* 5. Bottom Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-2xl bg-[#1e6238] hover:bg-[#174e2c] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-white" />
          Pindai Sampel Baru
        </button>

        <button
          onClick={handleExportJSON}
          className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Simpan Laporan</span>
        </button>
      </div>

    </div>
  );
};
