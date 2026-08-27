import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Utensils, 
  ChefHat, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ThermometerSnowflake, 
  Flame, 
  HelpCircle,
  Bell,
  Volume2
} from 'lucide-react';
import { soundEngine } from '../../core/audioAlerts';

export const ConsumerHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cooking' | 'hygiene' | 'reminder'>('cooking');
  const [targetMeatCut, setTargetMeatCut] = useState<'steak' | 'chicken' | 'minced'>('steak');
  const [selectedDoneness, setSelectedDoneness] = useState<'rare' | 'medium' | 'welldone'>('medium');
  const [reminderMeatName, setReminderMeatName] = useState<string>('Daging Sirloin Kulkas Bawah');
  const [reminderHours, setReminderHours] = useState<number>(24);
  const [reminderSaved, setReminderSaved] = useState<boolean>(false);

  const cookingGuides = {
    steak: {
      rare: { temp: '52°C - 55°C', time: '2-3 menit / sisi', safeStatus: 'fresh_only', note: 'HANYA untuk daging Status 1 (Kuning). Sangat lembut & juicy.' },
      medium: { temp: '60°C - 65°C', time: '4-5 menit / sisi', safeStatus: 'fresh_only', note: 'Aman untuk daging segar Status 1. Kematangan optimal.' },
      welldone: { temp: '> 71°C', time: '6-8 menit / sisi', safeStatus: 'warning_ok', note: 'WAJIB untuk daging Status 2 (Jingga) untuk memastikan seluruh mikroba mati.' },
    },
    chicken: {
      rare: { temp: 'DILARANG', time: 'N/A', safeStatus: 'danger', note: 'Daging ayam DILARANG dimasak setengah matang karena risiko Salmonella!' },
      medium: { temp: 'DILARANG', time: 'N/A', safeStatus: 'danger', note: 'Ayam wajib dimasak matang menyeluruh sampai sari daging bening.' },
      welldone: { temp: '> 74°C', time: '12-15 menit', safeStatus: 'warning_ok', note: 'Suhu internal minimal 74°C. Aman untuk Status 1 & Status 2.' },
    },
    minced: {
      rare: { temp: 'TIDAK DISARANKAN', time: 'N/A', safeStatus: 'danger', note: 'Daging giling memiliki luas permukaan tinggi, bakteri dapat tersebar ke dalam.' },
      medium: { temp: '68°C', time: '6-8 menit', safeStatus: 'fresh_only', note: 'Hanya jika digiling sendiri dari daging segar.' },
      welldone: { temp: '> 71°C', time: '8-10 menit', safeStatus: 'warning_ok', note: 'Standar aman daging cincang/burger.' },
    }
  }[targetMeatCut][selectedDoneness];

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    setReminderSaved(true);
    soundEngine.speakIndonesian(`Pengingat aktif untuk ${reminderMeatName}. Waktu simpan diatur ${reminderHours} jam.`);
    setTimeout(() => setReminderSaved(false), 5000);
  };

  return (
    <section id="consumer-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* Section Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <ChefHat className="w-3.5 h-3.5" />
          <span>Fitur Utama C: Consumer Alert & Action System</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
          Asisten Keamanan Pangan & Dapur Cerdas
        </h2>
        <p className="max-w-2xl mx-auto text-slate-400 text-xs sm:text-sm">
          Panduan interaktif konsumen rumah tangga untuk mengolah daging sesuai status sensor GENT, mencegah kontaminasi silang, dan menjamin kesehatan keluarga.
        </p>
      </div>

      {/* 3 Status Quick Action Banner Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Status 1 Box */}
        <div className="p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 space-y-3">
          <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>KUNING (SEGAR)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            pH &lt; 7.0. Gas TVB-N sangat rendah. Bebas diolah menjadi hidangan apa pun (Medium-Rare, Sate, Shabu-shabu). Aman dibekukan ulang di freezer.
          </p>
          <div className="text-[11px] text-yellow-300/80 font-mono bg-yellow-950/40 p-2 rounded-lg border border-yellow-500/20">
            Suhu simpan: 0°C – 4°C
          </div>
        </div>

        {/* Status 2 Box */}
        <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-3">
          <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>JINGGA (MULAI MENURUN)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            pH mendekati 8. Masak hari ini juga dengan kematangan sempurna (<span className="text-orange-300 font-bold">Well-Done &gt;71°C</span>). Dilarang dibekukan ulang!
          </p>
          <div className="text-[11px] text-orange-300/80 font-mono bg-orange-950/40 p-2 rounded-lg border border-orange-500/20">
            Tindakan: Masak tuntas hari ini
          </div>
        </div>

        {/* Status 3 Box */}
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <XCircle className="w-5 h-5" />
            <span>MERAH KECOKELATAN (BUSUK)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            pH &gt; 8.0. TVB-N tinggi. <span className="text-red-300 font-bold">BAHAYA RACUN!</span> Jangan dicuci atau dimasak. Segera buang dan disinfeksi kulkas Anda.
          </p>
          <div className="text-[11px] text-red-300/80 font-mono bg-red-950/40 p-2 rounded-lg border border-red-500/20">
            Tindakan: Buang & disinfeksi rak
          </div>
        </div>

      </div>

      {/* Consumer Interactive Tooltabs */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        
        {/* Tab Selector */}
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('cooking')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'cooking' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            Kalkulator Masak Aman
          </button>
          <button
            onClick={() => setActiveTab('hygiene')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'hygiene' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Checklist Higienitas
          </button>
          <button
            onClick={() => setActiveTab('reminder')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'reminder' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            Alarm Kulkas
          </button>
        </div>

        {/* TAB 1: Safe Cooking Calculator */}
        {activeTab === 'cooking' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            
            {/* Cut Selector */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium block">Pilih Jenis Potongan Daging:</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'steak', label: '🥩 Steak Daging Sapi' },
                  { id: 'chicken', label: '🍗 Daging Ayam / Unggas' },
                  { id: 'minced', label: '🍔 Daging Cincang / Burger' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setTargetMeatCut(c.id as any)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      targetMeatCut === c.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Doneness Selector */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium block">Tingkat Kematangan yang Diinginkan:</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'rare', label: 'Rare / Setengah Matang' },
                  { id: 'medium', label: 'Medium / Sedang' },
                  { id: 'welldone', label: 'Well-Done / Matang Penuh' },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDoneness(d.id as any)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      selectedDoneness === d.id
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Cooking Guide Card */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Panduan Parameter Internal</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  cookingGuides.safeStatus === 'fresh_only'
                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                    : cookingGuides.safeStatus === 'warning_ok'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}>
                  {cookingGuides.safeStatus === 'fresh_only'
                    ? 'Syarat: Daging Kuning (Segar)'
                    : cookingGuides.safeStatus === 'warning_ok'
                    ? 'Aman untuk Daging Kuning & Jingga'
                    : 'BAHAYA / TIDAK DIREKOMENDASIKAN'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Suhu Internal Inti Daging</span>
                  <span className="text-xl font-black text-white font-mono mt-0.5 block">{cookingGuides.temp}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Estimasi Durasi Masak</span>
                  <span className="text-xl font-black text-white font-mono mt-0.5 block">{cookingGuides.time}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800 leading-relaxed">
                <span className="text-emerald-400 font-semibold">Petunjuk Koki: </span>
                {cookingGuides.note}
              </p>
            </div>

          </div>
        )}

        {/* TAB 2: Kitchen Hygiene Checklist */}
        {activeTab === 'hygiene' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                Protokol Anti Kontaminasi Silang di Dapur
              </h4>

              <div className="space-y-2 text-xs text-slate-300">
                {[
                  'Pisahkan talenan khusus daging mentah (warna merah) dengan talenan sayur/buah siap makan.',
                  'Cuci tangan dengan sabun air mengalir minimal 20 detik setelah memegang kemasan atau daging mentah.',
                  'Letakkan daging mentah pada rak paling bawah kulkas agar cairan daging tidak menetes ke makanan lain.',
                  'Jangan mencuci daging mentah di wastafel karena percikan air dapat menyebarkan bakteri hingga radius 1 meter.',
                  'Jika sensor GENT menunjukkan status MERAH, segera semprot rak kulkas dengan cairan alkohol/disinfektan.',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Smart Fridge Reminder */}
        {activeTab === 'reminder' && (
          <div className="space-y-4 max-w-xl mx-auto">
            <form onSubmit={handleSaveReminder} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-yellow-400" />
                Setel Pengingat Batas Masak Daging
              </h4>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 block">Nama Produk / Potongan Daging:</label>
                <input
                  type="text"
                  value={reminderMeatName}
                  onChange={(e) => setReminderMeatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 block">Ingatkan Saya Dalam (Berdasarkan Umur Simpan Sensor):</label>
                <div className="grid grid-cols-3 gap-2">
                  {[12, 24, 48].map((h) => (
                    <button
                      type="button"
                      key={h}
                      onClick={() => setReminderHours(h)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        reminderHours === h
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {h} Jam
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                Simpan Jadwal Pengingat
              </button>

              {reminderSaved && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-semibold animate-fadeIn">
                  ✓ Pengingat berhasil diaktifkan! Anda akan menerima notifikasi suara dan visual.
                </div>
              )}
            </form>
          </div>
        )}

      </div>

    </section>
  );
};
