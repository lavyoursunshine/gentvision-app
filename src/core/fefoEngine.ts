import { MeatBatch, FreshnessStatus } from '../types';

/**
 * Calculate dynamic shelf life and FEFO priority score
 * FEFO (First-Expired, First-Out) calculates the actual physical expiration risk
 * based on colorimetric TVB-N degradation + real-time IoT chiller temperature,
 * rather than simply static slaughter/packaging date.
 */
export function calculateBatchFefoScore(batch: MeatBatch): {
  fefoScore: number; // 1 (Most urgent to sell) to 100 (Most stable)
  recommendedDiscount: number; // 0% to 50%
  urgencyLabel: 'URGENT_SALE' | 'NORMAL_ROTATION' | 'PRIORITY_FEFO' | 'RECALL_DANGER';
  actionSummary: string;
} {
  const { status, phValue, tvbnValue, currentTempCelsius } = batch;

  // Temperature abuse penalty factor (ideal meat storage is 0 - 4°C)
  const tempExcess = Math.max(0, currentTempCelsius - 4.0);
  const tempMultiplier = 1 + tempExcess * 0.25;

  let baseScore = 50;
  let recommendedDiscount = 0;
  let urgencyLabel: 'URGENT_SALE' | 'NORMAL_ROTATION' | 'PRIORITY_FEFO' | 'RECALL_DANGER' = 'NORMAL_ROTATION';
  let actionSummary = '';

  if (status === 'spoiled' || phValue >= 8.0 || tvbnValue >= 25.0) {
    baseScore = 1;
    recommendedDiscount = 0; // Not for sale
    urgencyLabel = 'RECALL_DANGER';
    actionSummary = 'PRODUK RUSAK: Tarik segera dari rak pajang (Recall). Dilarang dijual.';
  } else if (status === 'warning' || (phValue >= 7.0 && phValue < 8.0) || tvbnValue >= 15.0) {
    // Highly urgent FEFO - nearing end of safe window
    const freshnessDegradation = (tvbnValue - 15) / 10; // 0 to 1
    baseScore = Math.max(2, Math.round(25 - freshnessDegradation * 20 - tempExcess * 2));
    
    // Dynamic discount: 20% base + up to 40% based on freshness decay
    recommendedDiscount = Math.min(45, Math.round(20 + freshnessDegradation * 20));
    urgencyLabel = 'URGENT_SALE';
    actionSummary = `FEFO TINGGI: Aktifkan diskon kilat ${recommendedDiscount}% untuk menghabiskan stok dalam 12 jam.`;
  } else {
    // Fresh meat: Score 40 - 100 based on freshness index
    const remainingRatio = Math.max(0, (15 - tvbnValue) / 10);
    baseScore = Math.min(100, Math.max(30, Math.round(50 + remainingRatio * 45 - tempExcess * 5)));
    
    if (baseScore < 60) {
      urgencyLabel = 'PRIORITY_FEFO';
      recommendedDiscount = 10;
      actionSummary = 'Rotasi rak: Pindahkan ke posisi depan rak (First-Out) dengan harga reguler / promo 10%.';
    } else {
      urgencyLabel = 'NORMAL_ROTATION';
      recommendedDiscount = 0;
      actionSummary = 'Kondisi prima: Simpan di rak pendingin standar (0–2°C), harga reguler.';
    }
  }

  return {
    fefoScore: baseScore,
    recommendedDiscount,
    urgencyLabel,
    actionSummary,
  };
}

/**
 * Sort batches by dynamic FEFO priority (Lowest score = First Out / Most Urgent)
 */
export function sortBatchesByFEFO(batches: MeatBatch[]): MeatBatch[] {
  return [...batches].sort((a, b) => {
    // Put spoiled first for immediate action, then lowest FEFO score
    if (a.status === 'spoiled' && b.status !== 'spoiled') return -1;
    if (b.status === 'spoiled' && a.status !== 'spoiled') return 1;
    return a.fefoPriorityScore - b.fefoPriorityScore;
  });
}

/**
 * Format Indonesian Rupiah
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}
