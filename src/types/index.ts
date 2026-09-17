export interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'manager' | 'worker';
  avatar?: string;
}

export interface ShedConfig {
  id: string;
  name: string;
  capacity: number;
  tankCapacityLiters: number;
  currentChicks: number;
  targetTempMin: number;
  targetTempMax: number;
  targetHumidityMin: number;
  targetHumidityMax: number;
}

export interface Batch {
  id: string;
  name: string; // e.g. "Batch 2026-B02"
  breed: string; // e.g. "Vencobb 430Y" | "Cobb 500" | "Ross 308"
  startDate: string; // ISO string YYYY-MM-DD
  endDate?: string;
  status: 'active' | 'completed';
  initialChicks: number; // e.g. 12000
  shed1StartingChicks: number; // e.g. 6000
  shed2StartingChicks: number; // e.g. 6000
  targetHarvestAgeDays: number; // e.g. 42
  targetHarvestWeightGrams: number; // e.g. 2500
  harvestDate?: string;
  finalLiveBirds?: number;
  finalTotalWeightKg?: number;
  finalFCR?: number;
  notes?: string;
}

export interface ShedDailyMetrics {
  shedId: 'shed-1' | 'shed-2';
  deadChicks: number;
  feedUsedKg: number;
  feedReceivedKg: number;
  sampleAvgWeightGrams: number;
  waterLevelLiters: number;
  waterUsedLiters: number;
  temperatureCelsius: number;
  humidityPercent: number;
  notes?: string;
  fanStatusManualOverride?: 'AUTO' | 'FORCE_ON' | 'FORCE_OFF';
}

export interface DailyFarmRecord {
  id?: number; // Auto-incremented primary key in Dexie
  batchId: string;
  date: string; // YYYY-MM-DD
  dayOfBatch: number; // 1, 2, ... 28
  timestamp: number;
  shed1: ShedDailyMetrics;
  shed2: ShedDailyMetrics;
  // Computed batch-level totals for quick query
  totalMortalityToday: number;
  cumulativeMortalityToDate: number;
  totalLiveBirds: number;
  totalFeedUsedTodayKg: number;
  totalFeedReceivedTodayKg: number;
  overallAvgWeightGrams: number;
  totalWaterUsedTodayLiters: number;
  avgTemperatureCelsius: number;
  avgHumidityPercent: number;
}

export interface FeedDelivery {
  id?: number;
  batchId: string;
  date: string;
  supplier: string;
  feedType: 'Pre-Starter' | 'Starter' | 'Finisher';
  quantityKg: number;
  bagsCount: number;
  costPerKg?: number;
  invoiceNumber?: string;
  notes?: string;
}

export interface BreedStandardPoint {
  ageDays: number;
  expectedWeightGrams: number;
  expectedDailyGainGrams: number;
  expectedDailyFeedGrams: number;
  expectedCumulativeFeedGrams: number;
  expectedFCR: number;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertCategory = 'mortality' | 'feed' | 'weight' | 'water' | 'temperature' | 'humidity' | 'ventilation';

export interface FarmAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  problem: string;
  shedName: string; // "Shed 1" | "Shed 2" | "Farm Wide"
  currentValue: string;
  thresholdValue: string;
  recommendedAction: string;
  timestamp: number;
  date: string;
  acknowledged: boolean;
}

export interface FarmSettings {
  farmName: string;
  farmerName: string;
  location: string;
  phone: string;
  shed1Capacity: number;
  shed2Capacity: number;
  shed1TankLiters: number;
  shed2TankLiters: number;
  defaultBreed: string;
  // Alert thresholds
  alertMortalityThresholdPercent: number; // e.g. 0.3% per day
  alertFeedRemainingDaysCritical: number; // e.g. 2 days
  alertFeedRemainingDaysWarning: number; // e.g. 4 days
  alertWaterLevelPercentCritical: number; // e.g. 15%
  alertWaterLevelPercentWarning: number; // e.g. 30%
  alertTempMaxCelsius: number; // e.g. 30°C
  alertTempMinCelsius: number; // e.g. 20°C
  alertHumidityMaxPercent: number; // e.g. 70%
  alertHumidityMinPercent: number; // e.g. 45%
  alertWeightLagGrams: number; // e.g. 80g
}
