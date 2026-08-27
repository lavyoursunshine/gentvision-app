import React from 'react';
import { QrCode, Printer, X, ShieldCheck, Leaf } from 'lucide-react';
import { MeatBatch } from '../../types';
import { formatIDR } from '../../core/fefoEngine';

interface BatchLabelModalProps {
  batch: MeatBatch;
  onClose: () => void;
}

export const BatchLabelModal: React.FC<BatchLabelModalProps> = ({ batch, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-white animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Label Kemasan Pintar GENT</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Smart Label Sticker Preview */}
        <div className="p-5 bg-white text-slate-900 rounded-2xl border-2 border-slate-300 shadow-xl space-y-4 font-sans print:m-0 print:border-none">
          
          {/* Top Label Brand */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight font-sans">GENT</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">
                  SMART PACKAGING
                </span>
              </div>
              <span className="text-[9px] font-semibold text-slate-600 tracking-wider block">
                FEFO BIO-SENSOR LABEL
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-extrabold text-emerald-800 block">UGM TECH</span>
              <span className="text-[8px] text-slate-500 font-mono">{batch.batchCode}</span>
            </div>
          </div>

          {/* Product & Sensor Circle Display */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{batch.productName}</h4>
              <p className="text-[11px] text-slate-600 font-medium">{batch.cutType}</p>
              <div className="text-[10px] text-slate-500 space-y-0.5 pt-1">
                <div>RPH: <span className="font-semibold text-slate-800">{batch.rphOrigin}</span></div>
                <div>Packing: <span className="font-mono text-slate-800">{batch.packagingDate}</span></div>
                <div>Exp. Dinamis: <span className="font-mono font-bold text-slate-900">{batch.dynamicExpiryDate}</span></div>
              </div>
            </div>

            {/* Smart Sensor Indicator Circle Simulation on Label */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div 
                className="w-12 h-12 rounded-full border-2 border-slate-400 shadow-md flex items-center justify-center"
                style={{ backgroundColor: batch.sensorColorHex }}
              >
                <div className="w-3 h-3 rounded-full bg-white/40" />
              </div>
              <span className="text-[8px] font-bold text-slate-700 mt-1 uppercase">
                {batch.status === 'fresh' ? 'SEGAR' : batch.status === 'warning' ? 'WASPADA' : 'RUSAK'}
              </span>
            </div>
          </div>

          {/* Price & Barcode section */}
          <div className="pt-2 border-t-2 border-dashed border-slate-300 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-500 block">HARGA RITEL (FEFO)</span>
              <span className="text-base font-black text-slate-950">
                {formatIDR(batch.discountPercentage > 0 ? batch.currentPriceIdr : batch.standardPriceIdr)}
              </span>
              {batch.discountPercentage > 0 && (
                <span className="text-[9px] font-bold text-orange-600 block">
                  Diskon FEFO {batch.discountPercentage}%
                </span>
              )}
            </div>

            {/* Simulated Barcode */}
            <div className="text-right">
              <div className="h-7 w-24 bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px)] rounded-sm" />
              <span className="text-[8px] font-mono text-slate-600 block mt-0.5">
                {batch.batchCode.replace(/-/g, '')}
              </span>
            </div>
          </div>

          {/* Eco Badge */}
          <div className="text-[8px] text-slate-500 flex items-center justify-between border-t border-slate-200 pt-1">
            <span className="flex items-center gap-1 text-emerald-800 font-semibold">
              <Leaf className="w-2.5 h-2.5" />
              100% Jerami Padi Biodegradable
            </span>
            <span>Simpan pada 0 - 4°C</span>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Label Thermal (Print)
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
