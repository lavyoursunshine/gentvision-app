import { ColorAnalysisResult, ColorLab, ColorRGB, FreshnessStatus } from '../types';

/**
 * Standard CIE D65 Reference White
 */
const D65 = {
  X: 95.047,
  Y: 100.0,
  Z: 108.883,
};

/**
 * Convert 8-bit sRGB (0-255) to Linear RGB (0-1)
 */
export function sRGBToLinear(c: number): number {
  const normalized = c / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Convert RGB to CIE XYZ color space using D65 matrix
 */
export function rgbToXyz(rgb: ColorRGB): { x: number; y: number; z: number } {
  const r = sRGBToLinear(rgb.r);
  const g = sRGBToLinear(rgb.g);
  const b = sRGBToLinear(rgb.b);

  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100;
  const y = (r * 0.2126729 + g * 0.7151522 + b * 0.072175) * 100;
  const z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) * 100;

  return { x, y, z };
}

function f(t: number): number {
  return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
}

/**
 * Convert CIE XYZ to CIE L*a*b*
 */
export function xyzToLab(xyz: { x: number; y: number; z: number }): ColorLab {
  const xn = xyz.x / D65.X;
  const yn = xyz.y / D65.Y;
  const zn = xyz.z / D65.Z;

  const fx = f(xn);
  const fy = f(yn);
  const fz = f(zn);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return {
    L: Number(L.toFixed(2)),
    a: Number(a.toFixed(2)),
    b: Number(b.toFixed(2)),
  };
}

export function rgbToLab(rgb: ColorRGB): ColorLab {
  const xyz = rgbToXyz(rgb);
  return xyzToLab(xyz);
}

/**
 * Calculate Euclidean Delta E between two Lab colors
 */
export function calculateDeltaE(lab1: ColorLab, lab2: ColorLab): number {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Number(Math.sqrt(dL * dL + da * da + db * db).toFixed(2));
}

/**
 * Calculate Hue Angle (hab in degrees 0-360)
 */
export function calculateHueAngle(lab: ColorLab): number {
  let hue = Math.atan2(lab.b, lab.a) * (180 / Math.PI);
  if (hue < 0) hue += 360;
  return hue;
}

/**
 * Calibration anchor points for Curcumin-DES Sensor
 */
export const SENSOR_CALIBRATION = {
  freshBaseline: { L: 82.0, a: 4.5, b: 78.0 }, // Kuning segar
  warningBaseline: { L: 60.0, a: 36.0, b: 54.0 }, // Jingga deprotonasi
  spoiledBaseline: { L: 34.0, a: 44.0, b: 22.0 }, // Merah kecokelatan enolat
};

export function hexToRgb(hex: string): ColorRGB {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(rgb: ColorRGB): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * White Color Calibration (White Balance Normalization using GENT Sticker White Area)
 * Normalizes device camera variations, ambient warm/cold lighting, and exposure differences.
 */
export function calibrateWithWhiteReference(
  rawRgb: ColorRGB,
  whiteRefRgb?: ColorRGB
): { calibratedRgb: ColorRGB; gain: { r: number; g: number; b: number }; isCalibrated: boolean } {
  if (!whiteRefRgb) {
    return {
      calibratedRgb: rawRgb,
      gain: { r: 1.0, g: 1.0, b: 1.0 },
      isCalibrated: false,
    };
  }

  // Target standard pure white card reflectance (nominal 248/255 to prevent clipping)
  const targetWhite = 248;
  const rGain = targetWhite / Math.max(whiteRefRgb.r, 20);
  const gGain = targetWhite / Math.max(whiteRefRgb.g, 20);
  const bGain = targetWhite / Math.max(whiteRefRgb.b, 20);

  const calibratedRgb: ColorRGB = {
    r: Math.min(255, Math.max(0, Math.round(rawRgb.r * rGain))),
    g: Math.min(255, Math.max(0, Math.round(rawRgb.g * gGain))),
    b: Math.min(255, Math.max(0, Math.round(rawRgb.b * bGain))),
  };

  return {
    calibratedRgb,
    gain: {
      r: Number(rGain.toFixed(3)),
      g: Number(gGain.toFixed(3)),
      b: Number(bGain.toFixed(3)),
    },
    isCalibrated: true,
  };
}

/**
 * Comprehensive Colorimetric Analyzer for Curcumin-DES Sensor
 */
export function analyzeSensorColor(
  rawRgb: ColorRGB,
  sampleType: 'beef' | 'chicken' | 'fish' | 'pork' | 'custom' = 'beef',
  whiteRefRgb?: ColorRGB
): ColorAnalysisResult {
  const { calibratedRgb, gain, isCalibrated } = calibrateWithWhiteReference(rawRgb, whiteRefRgb);
  
  const hex = rgbToHex(calibratedRgb);
  const rawHex = rgbToHex(rawRgb);
  const lab = rgbToLab(calibratedRgb);

  const deltaE_Fresh = calculateDeltaE(lab, SENSOR_CALIBRATION.freshBaseline);
  const deltaE_Warning = calculateDeltaE(lab, SENSOR_CALIBRATION.warningBaseline);
  const deltaE_Spoiled = calculateDeltaE(lab, SENSOR_CALIBRATION.spoiledBaseline);
  const hueAngle = calculateHueAngle(lab);

  let status: FreshnessStatus;
  let statusTitle: string;
  let statusMessage: string;
  let phValue: number;
  let tvbnValue: number;
  let freshnessIndex: number;
  let remainingShelfHours: number;

  if (lab.a <= 18 && (hueAngle >= 65 || lab.b > 45)) {
    // 🟡 STATUS 1: KUNING (SEGAR)
    status = 'fresh';
    statusTitle = 'Daging dalam Kondisi Optimal / Sangat Segar';
    statusMessage =
      'Sensor menunjukkan warna kuning cerah. Gas TVB-N sangat rendah dan kurkumin berada dalam bentuk netral terprotonasi (pH stabil).';

    const progress = Math.max(0, Math.min(1, lab.a / 18));
    phValue = Number((5.6 + progress * 1.1).toFixed(2));
    tvbnValue = Number((4.5 + progress * 8.0).toFixed(1));
    freshnessIndex = Math.round(100 - progress * 20);
    remainingShelfHours = Math.round(72 - progress * 24);
  } else if (
    (lab.a > 18 && lab.a <= 38) ||
    (hueAngle >= 40 && hueAngle < 65) ||
    (deltaE_Warning < deltaE_Fresh && deltaE_Warning <= deltaE_Spoiled)
  ) {
    // 🟠 STATUS 2: JINGGA (MULAI MENURUN)
    status = 'warning';
    statusTitle = 'Peringatan: Kualitas Menurun - Segera Konsumsi';
    statusMessage =
      'Sensor bertransformasi ke warna jingga. Terjadi deprotonasi parsial gugus fenol kurkumin akibat akumulasi uap basa volatil amonia & amina.';

    const progress = Math.max(0, Math.min(1, (lab.a - 18) / 20));
    phValue = Number((6.8 + progress * 1.1).toFixed(2));
    tvbnValue = Number((14.0 + progress * 10.5).toFixed(1));
    freshnessIndex = Math.round(79 - progress * 40);
    remainingShelfHours = Math.max(4, Math.round(24 - progress * 18));
  } else {
    // 🔴 STATUS 3: MERAH KECOKELATAN (BUSUK / TIDAK AMAN)
    status = 'spoiled';
    statusTitle = 'BAHAYA: Jangan Dikonsumsi! Tingkat Pembusukan Tinggi';
    statusMessage =
      'Sensor menunjukkan warna merah kecokelatan akibat pergeseran batokromik maksimum dan pembentukan ion enolat stabil. TVB-N melewati ambang aman.';

    const progress = Math.max(0, Math.min(1, (lab.a - 35) / 25));
    phValue = Number((8.1 + progress * 1.4).toFixed(2));
    tvbnValue = Number((26.0 + progress * 32.0).toFixed(1));
    freshnessIndex = Math.max(0, Math.round(35 - progress * 35));
    remainingShelfHours = 0;
  }

  const recommendations = {
    culinary:
      status === 'fresh'
        ? [
            'Sangat aman untuk diolah menjadi hidangan apa saja (Steak Medium-Rare, Sate, Sup, Shabu-shabu).',
            'Kualitas tekstur, aroma, dan nutrisi daging berada pada puncak kesegaran terbaik.',
            'Aman untuk marinasi atau penyimpanan beku ulang (freezer -18°C).',
          ]
        : status === 'warning'
        ? [
            'Wajib dimasak hari ini juga hingga MATANG SEMPURNA (Well-Done / suhu internal >71°C).',
            'Disarankan dimasak dengan perebusan lama atau bumbu pekat (Rendang, Semur, Gulai, Sup Pedas).',
            'DILARANG dikonsumsi mentah, setengah matang, atau steak medium-rare!',
          ]
        : [
            'DILARANG DIKONSUMSI DALAM BENTUK APA PUN.',
            'Memasak atau mencuci daging TIDAK MENGHILANGKAN toksin bakteri (histamin, enterotoksin).',
            'Segera bungkus rapat dan buang ke tempat sampah organik terpisah.',
          ],
    freezerSafe: status === 'fresh',
    preventiveSteps:
      status === 'fresh'
        ? [
            'Simpan di chiller pendingin pada suhu 0°C – 4°C.',
            'Pastikan kemasan plastik tertutup rapat dan kedap udara.',
            'Bisa dibekukan kembali di freezer jika tidak langsung dimasak.',
          ]
        : status === 'warning'
        ? [
            'JANGAN DIBEKUKAN ULANG — pembekuan ulang merusak serat daging dan tidak menghentikan degradasi protein.',
            'Evaluasi suhu kulkas Anda (indikasi suhu kurang dingin).',
            'Gunakan pisau dan talenan terpisah untuk mencegah kontaminasi silang.',
          ]
        : [
            'Segera lakukan disinfeksi pada rak kulkas tempat daging disimpan.',
            'Cuci tangan dengan sabun setelah memegang kemasan rusak.',
            'Jauhkan dari kontak silang dengan bahan makanan lain.',
          ],
    retailAction:
      status === 'fresh'
        ? 'Display pada rak chilled utama (0-2°C). Pertahankan harga reguler.'
        : status === 'warning'
        ? 'Terapkan diskon kilat (Mark-down Price 25% - 40%) agar cepat terjual.'
        : 'RECALL SEGERA! Tarik seluruh batch dari display dan lakukan karantina produk.',
    foodSafetyWarning:
      status === 'spoiled'
        ? 'PERINGATAN BAHAYA TOKSIN: Emisi TVB-N > 25 mg/100g menandakan pembusukan mikrobiologis yang dapat memicu keracunan makanan akut!'
        : undefined,
  };

  return {
    id: `GENT-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rawRgb,
    calibratedRgb,
    hex,
    rawHex,
    lab,
    deltaE: deltaE_Fresh,
    status,
    statusTitle,
    statusMessage,
    phValue,
    tvbnValue,
    freshnessIndex,
    remainingShelfHours,
    whiteCalibrated: isCalibrated,
    whiteRefRgb,
    calibrationGain: isCalibrated ? gain : undefined,
    recommendations,
    sampleType,
    confidenceScore: isCalibrated ? 98 : 91,
  };
}
