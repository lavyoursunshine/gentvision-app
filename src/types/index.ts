export type FreshnessStatus = 'fresh' | 'warning' | 'spoiled';

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export interface ColorLab {
  L: number;
  a: number;
  b: number;
}

export interface ColorAnalysisResult {
  id: string;
  timestamp: string;
  rawRgb: ColorRGB;
  calibratedRgb: ColorRGB;
  hex: string;
  rawHex: string;
  lab: ColorLab;
  deltaE: number;
  status: FreshnessStatus;
  statusTitle: string;
  statusMessage: string;
  phValue: number;
  tvbnValue: number;
  freshnessIndex: number;
  remainingShelfHours: number;
  whiteCalibrated: boolean;
  whiteRefRgb?: ColorRGB;
  calibrationGain?: { r: number; g: number; b: number };
  recommendations: {
    culinary: string[];
    freezerSafe: boolean;
    preventiveSteps: string[];
    retailAction: string;
    foodSafetyWarning?: string;
  };
  sampleType: 'beef' | 'chicken' | 'fish' | 'pork' | 'custom';
  confidenceScore: number;
}

export interface MeatBatch {
  id: string;
  batchCode: string;
  productName: string;
  meatType: 'Beef Sirloin' | 'Beef Wagyu A5' | 'Beef Ribeye' | 'Chicken Breast' | 'Chicken Drumstick' | 'Salmon Fillet';
  cutType: string;
  initialWeightKg: number;
  currentStockUnits: number;
  slaughterDate: string;
  packagingDate: string;
  chillerId: string;
  currentTempCelsius: number;
  targetTempRange: string;
  sensorColorHex: string;
  status: FreshnessStatus;
  phValue: number;
  tvbnValue: number;
  freshnessIndex: number;
  initialExpiryDate: string;
  dynamicExpiryDate: string;
  fefoPriorityScore: number;
  standardPriceIdr: number;
  discountPercentage: number;
  currentPriceIdr: number;
  rphOrigin: string;
  strawBioSavingsKg: number;
}

export interface ColdChainPoint {
  id: string;
  stageName: string;
  locationName: string;
  timestamp: string;
  temperatureCelsius: number;
  humidityPercent: number;
  gpsCoordinates: { lat: number; lng: number };
  status: 'optimal' | 'warning' | 'critical';
  notes: string;
}

export interface EcoMetrics {
  riceStrawSavedKg: number;
  co2EmissionsPreventedKg: number;
  foodLossReducedKg: number;
  biodegradablePackagingUnits: number;
  activeSensorsDeployed: number;
}
