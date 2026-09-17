import { Batch, DailyFarmRecord, FarmSettings } from '../types';
import { getExpectedWeightForAge } from './breedStandards';

/**
 * Dynamic calculation of current live chicks
 * Starting chicks - Total cumulative dead chicks
 */
export function calculateLiveChicks(startingChicks: number, cumulativeMortality: number): number {
  return Math.max(0, startingChicks - cumulativeMortality);
}

/**
 * Daily mortality percentage = (Today Dead / Starting Chicks) * 100
 */
export function calculateDailyMortalityRate(todayDead: number, startingChicks: number): number {
  if (startingChicks <= 0) return 0;
  return Number(((todayDead / startingChicks) * 100).toFixed(2));
}

/**
 * Cumulative mortality percentage = (Total Dead / Starting Chicks) * 100
 */
export function calculateCumulativeMortalityRate(totalDead: number, startingChicks: number): number {
  if (startingChicks <= 0) return 0;
  return Number(((totalDead / startingChicks) * 100).toFixed(2));
}

/**
 * Survival percentage = 100 - Cumulative Mortality %
 */
export function calculateSurvivalRate(totalDead: number, startingChicks: number): number {
  const mort = calculateCumulativeMortalityRate(totalDead, startingChicks);
  return Number(Math.max(0, 100 - mort).toFixed(2));
}

/**
 * Daily feed consumption per live chick in grams
 * (Feed used in kg * 1000) / Live chicks
 */
export function calculateFeedPerChickGrams(feedUsedKg: number, liveChicks: number): number {
  if (liveChicks <= 0) return 0;
  return Number(((feedUsedKg * 1000) / liveChicks).toFixed(1));
}

/**
 * Feed remaining in stock (Opening stock + Received - Used)
 */
export function calculateFeedRemaining(
  openingStockKg: number,
  totalReceivedKg: number,
  totalUsedKg: number
): number {
  return Math.max(0, Number((openingStockKg + totalReceivedKg - totalUsedKg).toFixed(1)));
}

/**
 * Estimated feed remaining days based on recent daily average consumption
 */
export function calculateFeedDaysRemaining(
  currentFeedStockKg: number,
  recentRecords: DailyFarmRecord[],
  daysWindow: number = 3
): { days: number; avgDailyUsageKg: number; status: 'sufficient' | 'warning' | 'critical' } {
  if (currentFeedStockKg <= 0) {
    return { days: 0, avgDailyUsageKg: 0, status: 'critical' };
  }

  const windowRecords = recentRecords.slice(-daysWindow);
  let avgDailyUsageKg = 0;

  if (windowRecords.length > 0) {
    const totalUsedInWindow = windowRecords.reduce((acc, r) => acc + r.totalFeedUsedTodayKg, 0);
    avgDailyUsageKg = totalUsedInWindow / windowRecords.length;
  }

  // Fallback if no records
  if (avgDailyUsageKg <= 0) {
    avgDailyUsageKg = 350; // reasonable baseline
  }

  const days = Number((currentFeedStockKg / avgDailyUsageKg).toFixed(1));

  let status: 'sufficient' | 'warning' | 'critical' = 'sufficient';
  if (days <= 2) {
    status = 'critical';
  } else if (days <= 4) {
    status = 'warning';
  }

  return { days, avgDailyUsageKg: Number(avgDailyUsageKg.toFixed(1)), status };
}

/**
 * Feed Conversion Ratio (FCR)
 * FCR = Total Feed Consumed (kg) / Total Live Weight Produced (kg)
 * Total Live Weight Produced = (Current Live Birds * Current Avg Weight in kg) - (Starting Chicks * Day 1 Weight in kg)
 */
export function calculateFCR(
  totalFeedConsumedKg: number,
  currentLiveBirds: number,
  currentAvgWeightGrams: number,
  startingChicks: number,
  day1WeightGrams: number = 42
): number {
  const currentTotalWeightKg = (currentLiveBirds * currentAvgWeightGrams) / 1000;
  const initialTotalWeightKg = (startingChicks * day1WeightGrams) / 1000;
  const netWeightGainKg = currentTotalWeightKg - initialTotalWeightKg;

  if (netWeightGainKg <= 0) return 0;
  return Number((totalFeedConsumedKg / netWeightGainKg).toFixed(2));
}

/**
 * Weight difference = Actual Weight - Expected Weight
 */
export function calculateWeightDifference(
  actualWeightGrams: number,
  expectedWeightGrams: number
): { diffGrams: number; status: 'on_track' | 'warning' | 'critical'; label: string } {
  const diffGrams = Math.round(actualWeightGrams - expectedWeightGrams);
  
  let status: 'on_track' | 'warning' | 'critical' = 'on_track';
  let label = 'Growth on track';

  if (diffGrams < -100) {
    status = 'critical';
    label = `Significantly below target (${Math.abs(diffGrams)}g behind)`;
  } else if (diffGrams < -35) {
    status = 'warning';
    label = `Slightly below target (${Math.abs(diffGrams)}g behind)`;
  } else if (diffGrams >= 0) {
    label = diffGrams === 0 ? 'Exact target weight' : `${diffGrams}g ahead of target`;
  }

  return { diffGrams, status, label };
}

/**
 * Average Daily Gain (ADG) in grams/day
 */
export function calculateADG(
  currentWeightGrams: number,
  initialWeightGrams: number,
  ageDays: number
): number {
  if (ageDays <= 0) return 0;
  return Number(((currentWeightGrams - initialWeightGrams) / ageDays).toFixed(1));
}

/**
 * Water Tank Status
 */
export function calculateWaterTankStatus(
  currentLevelLiters: number,
  tankCapacityLiters: number,
  avgDailyWaterLiters: number = 800
): {
  percentage: number;
  status: 'sufficient' | 'warning' | 'critical';
  label: string;
  action: string;
  hoursRemaining: number;
} {
  const cap = tankCapacityLiters > 0 ? tankCapacityLiters : 1000;
  const percentage = Math.min(100, Math.max(0, Number(((currentLevelLiters / cap) * 100).toFixed(0))));
  const hoursRemaining = avgDailyWaterLiters > 0 
    ? Number(((currentLevelLiters / avgDailyWaterLiters) * 24).toFixed(1))
    : 24;

  let status: 'sufficient' | 'warning' | 'critical' = 'sufficient';
  let label = 'Sufficient';
  let action = 'Water levels normal';

  if (percentage <= 15) {
    status = 'critical';
    label = 'Critical Water Level';
    action = 'Refill tank immediately!';
  } else if (percentage <= 30) {
    status = 'warning';
    label = 'Water Level Low';
    action = 'Prepare to refill tank soon';
  }

  return { percentage, status, label, action, hoursRemaining };
}

/**
 * Recommended Fan Status (ON / OFF)
 * Evaluates temperature and humidity against target thresholds
 */
export function evaluateFanRecommendation(
  tempCelsius: number,
  humidityPercent: number,
  birdAgeDays: number,
  settings?: FarmSettings
): {
  recommendedFan: 'ON' | 'OFF';
  status: 'normal' | 'high_temp' | 'low_temp' | 'high_humidity';
  message: string;
  reasons: string[];
} {
  // Brooding age (< 7 days) requires warmer temps, older broilers need cooler temps
  let maxSafeTemp = settings?.alertTempMaxCelsius || 28.5;
  let minSafeTemp = settings?.alertTempMinCelsius || 20.0;

  if (birdAgeDays <= 7) {
    maxSafeTemp = 33.0;
    minSafeTemp = 28.0;
  } else if (birdAgeDays <= 14) {
    maxSafeTemp = 30.5;
    minSafeTemp = 25.0;
  } else if (birdAgeDays <= 21) {
    maxSafeTemp = 28.5;
    minSafeTemp = 22.0;
  } else {
    maxSafeTemp = 26.5;
    minSafeTemp = 19.0;
  }

  const reasons: string[] = [];

  if (tempCelsius > maxSafeTemp) {
    reasons.push(`Temperature ${tempCelsius}°C exceeds safe maximum of ${maxSafeTemp}°C`);
  }
  if (humidityPercent > (settings?.alertHumidityMaxPercent || 72)) {
    reasons.push(`High humidity ${humidityPercent}% reduces evaporative bird cooling`);
  }
  if (tempCelsius < minSafeTemp) {
    reasons.push(`Temperature ${tempCelsius}°C is below minimum ${minSafeTemp}°C`);
  }

  if (tempCelsius > maxSafeTemp || (tempCelsius > maxSafeTemp - 1 && humidityPercent > 70)) {
    return {
      recommendedFan: 'ON',
      status: 'high_temp',
      message: `🔴 High temperature detected (${tempCelsius}°C). Turn ON exhaust fans & check cooling pads.`,
      reasons,
    };
  }

  if (tempCelsius < minSafeTemp) {
    return {
      recommendedFan: 'OFF',
      status: 'low_temp',
      message: `🟡 Temperature is low (${tempCelsius}°C). Keep fans OFF and check heating/curtains.`,
      reasons,
    };
  }

  return {
    recommendedFan: 'OFF',
    status: 'normal',
    message: `🟢 Temperature (${tempCelsius}°C) & Humidity (${humidityPercent}%) are within optimal comfort range.`,
    reasons: ['Climate is in safe thermal comfort zone.'],
  };
}

/**
 * Comprehensive Farm Health Evaluation
 * Evaluates real farm metrics to determine if condition is Normal, Attention Required, or Critical
 */
export function evaluateFarmHealth(
  latestRecord: DailyFarmRecord | undefined,
  batch: Batch | undefined,
  feedStockKg: number,
  settings: FarmSettings
): {
  overallStatus: 'normal' | 'attention' | 'critical';
  title: string;
  badgeColor: string;
  issues: { shed: string; message: string; severity: 'warning' | 'critical' }[];
  healthyAreas: string[];
} {
  if (!latestRecord || !batch) {
    return {
      overallStatus: 'normal',
      title: 'Farm Ready',
      badgeColor: 'bg-emerald-500',
      issues: [],
      healthyAreas: ['System ready for batch data entry.'],
    };
  }

  const issues: { shed: string; message: string; severity: 'warning' | 'critical' }[] = [];
  const healthyAreas: string[] = [];

  // 1. Mortality Check
  const dailyMortRate = calculateDailyMortalityRate(latestRecord.totalMortalityToday, batch.initialChicks);
  if (dailyMortRate >= 0.4) {
    issues.push({
      shed: 'Farm Wide',
      message: `High mortality today (${latestRecord.totalMortalityToday} birds, ${dailyMortRate}% of flock)`,
      severity: 'critical',
    });
  } else if (dailyMortRate >= settings.alertMortalityThresholdPercent) {
    issues.push({
      shed: 'Farm Wide',
      message: `Elevated mortality today (${latestRecord.totalMortalityToday} birds, ${dailyMortRate}%)`,
      severity: 'warning',
    });
  } else {
    healthyAreas.push(`Mortality rate is normal (${dailyMortRate}%)`);
  }

  // 2. Feed Stock Check
  const feedDays = calculateFeedDaysRemaining(feedStockKg, [latestRecord]);
  if (feedDays.days <= settings.alertFeedRemainingDaysCritical) {
    issues.push({
      shed: 'Feed Store',
      message: `Feed stock critically low (${feedStockKg} kg, approx ${feedDays.days} days left)`,
      severity: 'critical',
    });
  } else if (feedDays.days <= settings.alertFeedRemainingDaysWarning) {
    issues.push({
      shed: 'Feed Store',
      message: `Feed stock getting low (${feedStockKg} kg, ${feedDays.days} days remaining)`,
      severity: 'warning',
    });
  } else {
    healthyAreas.push(`Feed stock sufficient (${feedDays.days} days remaining)`);
  }

  // 3. Water Tank Checks
  const shed1Water = calculateWaterTankStatus(latestRecord.shed1.waterLevelLiters, settings.shed1TankLiters);
  const shed2Water = calculateWaterTankStatus(latestRecord.shed2.waterLevelLiters, settings.shed2TankLiters);

  if (shed1Water.status === 'critical') {
    issues.push({ shed: 'Shed 1', message: `Water tank critical (${shed1Water.percentage}%) - refill required`, severity: 'critical' });
  } else if (shed1Water.status === 'warning') {
    issues.push({ shed: 'Shed 1', message: `Water tank low (${shed1Water.percentage}%)`, severity: 'warning' });
  } else {
    healthyAreas.push(`Shed 1 water sufficient (${shed1Water.percentage}%)`);
  }

  if (shed2Water.status === 'critical') {
    issues.push({ shed: 'Shed 2', message: `Water tank critical (${shed2Water.percentage}%) - refill required`, severity: 'critical' });
  } else if (shed2Water.status === 'warning') {
    issues.push({ shed: 'Shed 2', message: `Water tank low (${shed2Water.percentage}%)`, severity: 'warning' });
  } else {
    healthyAreas.push(`Shed 2 water sufficient (${shed2Water.percentage}%)`);
  }

  // 4. Climate Checks
  const shed1Fan = evaluateFanRecommendation(latestRecord.shed1.temperatureCelsius, latestRecord.shed1.humidityPercent, latestRecord.dayOfBatch, settings);
  const shed2Fan = evaluateFanRecommendation(latestRecord.shed2.temperatureCelsius, latestRecord.shed2.humidityPercent, latestRecord.dayOfBatch, settings);

  if (shed1Fan.status === 'high_temp') {
    issues.push({ shed: 'Shed 1', message: `High temperature (${latestRecord.shed1.temperatureCelsius}°C) - turn ON fans`, severity: 'critical' });
  } else if (shed1Fan.status === 'low_temp') {
    issues.push({ shed: 'Shed 1', message: `Low temperature (${latestRecord.shed1.temperatureCelsius}°C)`, severity: 'warning' });
  } else {
    healthyAreas.push(`Shed 1 climate optimal (${latestRecord.shed1.temperatureCelsius}°C)`);
  }

  if (shed2Fan.status === 'high_temp') {
    issues.push({ shed: 'Shed 2', message: `High temperature (${latestRecord.shed2.temperatureCelsius}°C) - turn ON fans`, severity: 'critical' });
  } else if (shed2Fan.status === 'low_temp') {
    issues.push({ shed: 'Shed 2', message: `Low temperature (${latestRecord.shed2.temperatureCelsius}°C)`, severity: 'warning' });
  } else {
    healthyAreas.push(`Shed 2 climate optimal (${latestRecord.shed2.temperatureCelsius}°C)`);
  }

  // 5. Weight Check
  const expectedWeight = getExpectedWeightForAge(latestRecord.dayOfBatch, batch.breed);
  const weightDiff = calculateWeightDifference(latestRecord.overallAvgWeightGrams, expectedWeight);
  if (weightDiff.status === 'critical') {
    issues.push({
      shed: 'Farm Wide',
      message: `Bird growth lagging by ${Math.abs(weightDiff.diffGrams)}g behind target`,
      severity: 'critical',
    });
  } else if (weightDiff.status === 'warning') {
    issues.push({
      shed: 'Farm Wide',
      message: `Bird growth slightly behind target (${Math.abs(weightDiff.diffGrams)}g)`,
      severity: 'warning',
    });
  } else {
    healthyAreas.push(`Bird growth on track (${latestRecord.overallAvgWeightGrams}g vs ${expectedWeight}g target)`);
  }

  const hasCritical = issues.some(i => i.severity === 'critical');
  const hasWarning = issues.length > 0;

  if (hasCritical) {
    return {
      overallStatus: 'critical',
      title: 'Critical Farm Alerts - Immediate Attention Required',
      badgeColor: 'bg-rose-500',
      issues,
      healthyAreas,
    };
  }

  if (hasWarning) {
    return {
      overallStatus: 'attention',
      title: 'Attention Required - Minor Deviations Detected',
      badgeColor: 'bg-amber-500',
      issues,
      healthyAreas,
    };
  }

  return {
    overallStatus: 'normal',
    title: 'Farm Health Normal - All Parameters In Target Range',
    badgeColor: 'bg-emerald-500',
    issues,
    healthyAreas,
  };
}
