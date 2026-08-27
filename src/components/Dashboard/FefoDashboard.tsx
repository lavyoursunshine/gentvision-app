import React, { useState } from 'react';
import { 
  Package, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  Thermometer, 
  ArrowUpDown, 
  Sparkles, 
  BadgePercent,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { MeatBatch, FreshnessStatus } from '../../types';
import { INITIAL_MEAT_BATCHES } from '../../data/sampleData';
import { sortBatchesByFEFO, formatIDR, calculateBatchFefoScore } from '../../core/fefoEngine';
import { BatchLabelModal } from './BatchLabelModal';

export const FefoDashboard: React.FC = () => {
  const [batches, setBatches] = useState<MeatBatch[]>(INITIAL_MEAT_BATCHES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedBatchForLabel, setSelectedBatchForLabel] = useState<MeatBatch | null>(null);
  const [isSimulatingTempShift, setIsSimulatingTempShift] = useState<boolean>(false);

  // Apply FEFO sorting
  const sortedBatches = sortBatchesByFEFO(batches);

  // Filtered batches
  const filteredBatches = sortedBatches.filter((b) => {
    const matchesSearch =
      b.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.chillerId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate high-level stats
  const totalUnits = batches.reduce((acc, b) => acc + b.currentStockUnits, 0);
  const warningBatches = batches.filter((b) => b.status === 'warning');
  const spoiledBatches = batches.filter((b) => b.status === 'spoiled');
  const freshBatches = batches.filter((b) => b.status === 'fresh');

  // Apply dynamic markdown discount to warning batches
  const handleApplyMarkdownDiscount = (batchId: string) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === batchId && b.status === 'warning') {
          const discount = 35;
          const newPrice = Math.round(b.standardPriceIdr * (1 - discount / 100));
          return {
            ...b,
            discountPercentage: discount,
            currentPriceIdr: newPrice,
          };
        }
        return b;
      })
    );
  };

  // Simulate temperature shift on Chiller to test real-time FEFO recalculation
  const handleSimulateChillerTempChange = (deltaTemp: number) => {
    setBatches((prev) =>
      prev.map((b) => {
        const newTemp = Number(Math.max(-2, Math.min(10, b.currentTempCelsius + deltaTemp)).toFixed(1));
        let newStatus = b.status;
        let newHex = b.sensorColorHex;
        let newPh = b.phValue;
        let newTvbn = b.tvbnValue;

        if (newTemp > 5.5 && b.status === 'fresh') {
          newStatus = 'warning';
          newHex = '#ea580c';
          newPh = 7.35;
          newTvbn = 18.5;
        }

        const tempBatch = { ...b, currentTempCelsius: newTemp, status: newStatus, phValue: newPh, tvbnValue: newTvbn };
        const fefoInfo = calculateBatchFefoScore(tempBatch);

        return {
          ...tempBatch,
          fefoPriorityScore: fefoInfo.fefoScore,
          discountPercentage: fefoInfo.recommendedDiscount,
          currentPriceIdr: Math.round(b.standardPriceIdr * (1 - fefoInfo.recommendedDiscount / 100)),
        };
      })
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'ID,BatchCode,Product,Status,pH,TVB-N,Temp,FEFO_Score,Std_Price,Current_Price,Stock\n';
    const rows = batches
      .map(
        (b) =>
          `"${b.id}","${b.batchCode}","${b.productName}","${b.status}",${b.phValue},${b.tvbnValue},${b.currentTempCelsius},${b.fefoPriorityScore},${b.standardPriceIdr},${b.currentPriceIdr},${b.currentStockUnits}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GENT_FEFO_Inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <section id="fefo-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>Fitur Utama B: Dynamic Shelf-Life Dashboard (FEFO)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Manajemen Stok & Rotasi FEFO Cerdas
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Sistem B2B untuk Rumah Potong Hewan (RPH), Distributor & Ritel. Mengatur prioritas penjualan (*First-Expired, First-Out*) berbasis data sensor kolorimetri kurkumin-DES & telemetri suhu IoT.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* RECALL WARNING BANNER (If Spoiled Batch Detected) */}
      {spoiledBatches.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-950/80 border-2 border-red-500 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl shadow-red-950/60 animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="font-extrabold text-base text-red-200">
                PERINGATAN RECALL: {spoiledBatches.length} Batch Daging Berstatus Rusak Terdeteksi!
              </h3>
              <p className="text-xs text-red-300 mt-0.5">
                Stiker GENT menunjukkan warna merah kecokelatan (TVB-N &gt; 25 mg/100g). Segera tarik dari rak display untuk mencegah keracunan konsumen.
              </p>
            </div>
          </div>
          <span className="px-4 py-2 rounded-xl bg-red-600 font-bold text-xs shadow-lg uppercase tracking-wider">
            Tindakan Karantina Aktif
          </span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Stok Aktif</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">{totalUnits}</span>
            <span className="text-xs text-slate-400">Unit ({batches.length} Batch)</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold block">
            {freshBatches.length} Batch Segar Optimal
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Rotasi FEFO Prioritas (Jingga)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">
              {warningBatches.length}
            </span>
            <span className="text-xs text-slate-400">Batch</span>
          </div>
          <span className="text-[10px] text-orange-300 font-semibold block">
            Rekomendasi Mark-down 20-40%
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Batch Rusak (Merah)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-red-500 font-mono">
              {spoiledBatches.length}
            </span>
            <span className="text-xs text-slate-400">Batch</span>
          </div>
          <span className="text-[10px] text-red-400 font-semibold block">
            {spoiledBatches.length > 0 ? 'Wajib Recall Segera' : 'Nol Kontaminasi'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Pencegahan Food Loss</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">92.4%</span>
            <span className="text-xs text-slate-400">Terselamatkan</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Efisiensi Penjualan FEFO Dinamis
          </span>
        </div>

      </div>

      {/* Simulator Temperature Abuse Tool */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white block">Uji Simulasi Fluktuasi Suhu Chiller IoT</span>
            <span className="text-slate-400">Lihat bagaimana perubahan suhu ruangan secara otomatis mengubah skor FEFO & rotasi stok</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulateChillerTempChange(-1)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold border border-slate-700"
          >
            ❄ -1.0°C (Lebih Dingin)
          </button>
          <button
            onClick={() => handleSimulateChillerTempChange(1.5)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-orange-400 font-bold border border-slate-700"
          >
            🔥 +1.5°C (Simulasi Panas)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari Batch ID, Produk, Chiller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'all' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterStatus('fresh')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'fresh' ? 'bg-yellow-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              Kuning (Segar)
            </button>
            <button
              onClick={() => setFilterStatus('warning')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'warning' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400'
              }`}
            >
              Jingga (FEFO)
            </button>
            <button
              onClick={() => setFilterStatus('spoiled')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'spoiled' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              Merah (Recall)
            </button>
          </div>
        </div>
      </div>

      {/* Meat Batch Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3.5 px-4">Prioritas FEFO</th>
                <th className="py-3.5 px-4">Batch & Produk</th>
                <th className="py-3.5 px-4">Sensor GENT</th>
                <th className="py-3.5 px-4">Kimiawi (pH / TVB-N)</th>
                <th className="py-3.5 px-4">Suhu Chiller</th>
                <th className="py-3.5 px-4">Harga & Diskon FEFO</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBatches.map((batch, index) => {
                const statusBadge = {
                  fresh: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
                  warning: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
                  spoiled: 'bg-red-500/20 text-red-300 border-red-500/40',
                }[batch.status];

                return (
                  <tr 
                    key={batch.id} 
                    className={`hover:bg-slate-800/40 transition-colors ${
                      batch.status === 'spoiled' ? 'bg-red-950/20' : batch.status === 'warning' ? 'bg-orange-950/10' : ''
                    }`}
                  >
                    {/* FEFO Priority Column */}
                    <td className="py-4 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          index === 0 ? 'bg-red-500 text-white' : index <= 2 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Skor FEFO</span>
                          <span className="font-bold text-white">{batch.fefoPriorityScore}/100</span>
                        </div>
                      </div>
                    </td>

                    {/* Batch Info */}
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-mono text-emerald-400 font-bold block">{batch.batchCode}</span>
                        <span className="font-bold text-white text-sm block">{batch.productName}</span>
                        <span className="text-[10px] text-slate-400">{batch.cutType} • {batch.currentStockUnits} Unit</span>
                      </div>
                    </td>

                    {/* Sensor Color */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-7 h-7 rounded-xl border border-white/30 shadow-md flex-shrink-0"
                          style={{ backgroundColor: batch.sensorColorHex }}
                        />
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                            {batch.status === 'fresh' ? 'SEGAR' : batch.status === 'warning' ? 'WASPADA' : 'RUSAK'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Indeks: {batch.freshnessIndex}%
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Chemical params */}
                    <td className="py-4 px-4 font-mono">
                      <div>pH: <span className="text-white font-bold">{batch.phValue}</span></div>
                      <div>TVB-N: <span className="text-white font-bold">{batch.tvbnValue}</span> mg/100g</div>
                    </td>

                    {/* Chiller IoT Temp */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Thermometer className={`w-3.5 h-3.5 ${batch.currentTempCelsius > 4 ? 'text-red-400' : 'text-cyan-400'}`} />
                        <span className={`font-bold ${batch.currentTempCelsius > 4 ? 'text-red-400' : 'text-white'}`}>
                          {batch.currentTempCelsius}°C
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{batch.chillerId}</span>
                    </td>

                    {/* Pricing & Markdown */}
                    <td className="py-4 px-4">
                      {batch.status === 'spoiled' ? (
                        <span className="text-red-400 font-bold text-xs">RECALL / TIDAK DIJUAL</span>
                      ) : (
                        <div>
                          <div className="font-bold text-white text-sm">
                            {formatIDR(batch.discountPercentage > 0 ? batch.currentPriceIdr : batch.standardPriceIdr)}
                          </div>
                          {batch.discountPercentage > 0 ? (
                            <span className="text-[10px] font-bold text-orange-400 flex items-center gap-1">
                              <BadgePercent className="w-3 h-3" /> Diskon {batch.discountPercentage}%
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Harga Standar</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {batch.status === 'warning' && batch.discountPercentage === 0 && (
                          <button
                            onClick={() => handleApplyMarkdownDiscount(batch.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] transition-all"
                            title="Aktifkan Diskon Kilat FEFO"
                          >
                            Set Diskon
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedBatchForLabel(batch)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                          title="Lihat / Cetak Label Pintar"
                        >
                          <QrCode className="w-4 h-4 text-emerald-400" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Label Modal */}
      {selectedBatchForLabel && (
        <BatchLabelModal
          batch={selectedBatchForLabel}
          onClose={() => setSelectedBatchForLabel(null)}
        />
      )}

    </section>
  );
};
