import { Batch, DailyFarmRecord, FarmAlert, FarmSettings } from '../types';
import { getExpectedWeightForAge } from './breedStandards';
import { calculateFeedDaysRemaining, calculateWaterTankStatus, evaluateFanRecommendation } from './calculations';

export function generateSmartAlerts(
  record: DailyFarmRecord | undefined,
  batch: Batch | undefined,
  feedStockKg: number,
  settings: FarmSettings
): FarmAlert[] {
  if (!record || !batch) return [];

  const alerts: FarmAlert[] = [];
  const now = Date.now();
  const dateStr = record.date;

  // 1. Mortality Alert (Shed 1 & Shed 2 & Farm Wide)
  const shed1MortRate = (record.shed1.deadChicks / batch.shed1StartingChicks) * 100;
  const shed2MortRate = (record.shed2.deadChicks / batch.shed2StartingChicks) * 100;

  if (shed1MortRate >= settings.alertMortalityThresholdPercent) {
    alerts.push({
      id: `alert-mort-shed1-${dateStr}`,
      category: 'mortality',
      severity: shed1MortRate >= 0.4 ? 'critical' : 'warning',
      title: 'Elevated Chick Mortality in Shed 1',
      problem: `Shed 1 recorded ${record.shed1.deadChicks} dead chicks today (${shed1MortRate.toFixed(2)}% of starting flock).`,
      shedName: 'Shed 1',
      currentValue: `${record.shed1.deadChicks} dead (${shed1MortRate.toFixed(2)}%)`,
      thresholdValue: `< ${settings.alertMortalityThresholdPercent}%`,
      recommendedAction: 'Inspect Shed 1 litter moisture, drinker lines, and perform post-mortem check for early bacterial signs.',
      timestamp: now,
      date: dateStr,
      acknowledged: false,
    });
  }

  if (shed2MortRate >= settings.alertMortalityThresholdPercent) {
    alerts.push({
      id: `alert-mort-shed2-${dateStr}`,
      category: 'mortality',
      severity: shed2MortRate >= 0.4 ? 'critical' : 'warning',
      title: 'Elevated Chick Mortality in Shed 2',
      problem: `Shed 2 recorded ${record.shed2.deadChicks} dead chicks today (${shed2MortRate.toFixed(2)}% of starting flock).`,
      shedName: 'Shed 2',
      currentValue: `${record.shed2.deadChicks} dead (${shed2MortRate.toFixed(2)}%)`,
      thresholdValue: `< ${settings.alertMortalityThresholdPercent}%`,
      recommendedAction: 'Inspect Shed 2 temperature uniformity, feed quality, and isolate weak chicks in recovery pen.',
      timestamp: now,
      date: dateStr,
      acknowledged: false,
    });
  }

  // 2. Feed Inventory Alert
  const feedDays = calculateFeedDaysRemaining(feedStockKg, [record]);
  if (feedDays.days <= settings.alertFeedRemainingDaysCritical) {
    alerts.push({
      id: `alert-feed-critical-${dateStr}`,
      category: 'feed',
      severity: 'critical',
      title: 'CRITICAL: Feed Stock Depletion Imminent',
      problem: `Current feed inventory is down to ${feedStockKg} kg, estimated for only ${feedDays.days} days of flock consumption.`,
      shedName: 'Farm Wide',
      currentValue: `${feedStockKg} kg (${feedDays.days} days)`,
      thresholdValue: `> ${settings.alertFeedRemainingDaysWarning} days`,
      recommendedAction: 'Contact feed mill immediately to order urgent feed delivery. Avoid altering feed schedule.',
      timestamp: now,
      date: dateStr,
      acknowledged: false,
    });
  } else if (feedDays.days <= settings.alertFeedRemainingDaysWarning) {
    alerts.push({
      id: `alert-feed-warning-${dateStr}`,
      category: 'feed',
      severity: 'warning',
      title: 'Feed Inventory Low - Reorder Recommended',
      problem: `Feed inventory has ${feedDays.days} days remaining (${feedStockKg} kg).`,
      shedName: 'Farm Wide',
      currentValue: `${feedStockKg} kg (${feedDays.days} days)`,
      thresholdValue: `> ${settings.alertFeedRemainingDaysWarning} days`,
      recommendedAction: 'Schedule next feed delivery with the supplier within 24-48 hours.',
      timestamp: now,
      date: dateStr,
      acknowledged: false,
    });
  }

  // 3. Water Tank Alerts
  const s1Water = calculateWaterTankStatus(record.shed1.waterLevelLiters, settings.shed1TankLiters);
  if (s1Water.status === 'critical') {
    alerts.push({
      id: `alert-water-s1-${dateStr}`,
      category: 'water',
      severity: 'critical',
      title: 'CRITICAL WATER LEVEL: Shed 1 Tank',
      problem: `Shed 1 water tank is at ${s1Water.percentage}% (${record.shed1.waterLevelLiters} L / ${settings.shed1TankLiters} L).`,
      shedName: 'Shed 1',
      currentValue: `${record.shed1.waterLevelLiters} L (${s1Water.percentage}%)`,
      thresholdValue: `> ${settings.alertWaterLevelPercentWarning}%`,
      recommendedAction: 'Turn on main pump and refill Shed 1 water tank immediately to prevent bird dehydration.',
      timestamp: now,
      date: dateStr,
      acknowledged: false,
    });
  } else if (s1Water.status === 'warning') {
    alerts.push({
      id: `alert-water-s1-low-${dateStr}`,
      category: 'water',
      severity: 'warning',
      title: 'Shed 1 Water Level Low',
      problem: `Shed 1 water tank has dropped to ${s1Water.percentage}% (${record.shed1.waterLevelLiters} L).`,
      shedName: 'Shed 1',
      currentValue: `${record.shed1.waterLevelLiters} L (${s1Water.percentage}%)`,
      thresholdValue: `> ${settings.alertWaterLevelPercentWarning}%`,
      recommendedAction: 'Plan tank refill before night cycle.',
      timestamp: now,
      date: dateStr,
      acknowledged: false,
    });
  }

  const s2Water = calculateWaterTankStatus(record.shed2.waterLevelLiters, settings.shed2TankLiters);
  if (s2Water.status === 'critical') {
    alerts.push({
      id: `alert-water-s2-${dateStr}`,
      category: 'water',
      severity: 'critical',
      title: 'CRITICAL WATER LEVEL: Shed 2 Tank',
      problem: `Shed 2 water tank is at ${s2Water.percentage}% (${record.shed2.waterLevelLiters} L / ${settings.shed2TankLiters} L).`,
      shedName: 'Shed 2',
      currentValue: `${record.shed2.waterLevelLiters} L (${s2Water.percentage}%)`,
      thresholdValue: `> ${settings.alertWaterLevelPercentWarning}%`,
      recommendedAction: 'Refill the Shed 2 water tank immediately. Verify ballcock valve and inflow line.',
      timestamp: now,
      date: dateStr,
      acknowledged: false,
    });
  } else if (s2Water.status === 'warning') {
    alerts.push({
      id: `alert-water-s2-low-${dateStr}`,
      category: 'water',
      severity: 'warning',
      title: 'Shed 2 Water Level Low',
      problem: `Shed 2 water tank has dropped to ${s2Water.percentage}% (${record.shed2.waterLevelLiters} L).`,
      shedName: 'Shed 2',
      currentValue: `${record.shed2.waterLevelLiters} L (${s2Water.percentage}%)`,
      thresholdValue: `> ${settings.alertWaterLevelPercentWarning}%`,
      recommendedAction: 'Prepare to refill Shed 2 water tank.',
      timestamp: now,
      date: dateStr,
      acknowledged: false,
    });
  }

  // 4. Environment & Temperature Alerts
  const s1Fan = evaluateFanRecommendation(record.shed1.temperatureCelsius, record.shed1.humidityPercent, record.dayOfBatch, settings);
  if (s1Fan.status === 'high_temp') {
    alerts.push({
      id: `alert-temp-s1-high-${dateStr}`,
      category: 'temperature',
      severity: 'critical',
      title: 'High Temperature Detected in Shed 1',
      problem: `Shed 1 temperature is ${record.shed1.temperatureCelsius}°C with ${record.shed1.humidityPercent}% humidity.`,
      shedName: 'Shed 1',
      currentValue: `${record.shed1.temperatureCelsius}°C / ${record.shed1.humidityPercent}%`,
      thresholdValue: `< ${settings.alertTempMaxCelsius}°C`,
      recommendedAction: 'Turn ON Shed 1 exhaust fans and activate evaporative cooling pads to prevent heat stress.',
      timestamp: now,
      date: dateStr,
      acknowledged: false,
    });
  }

  const s2Fan = evaluateFanRecommendation(record.shed2.temperatureCelsius, record.shed2.humidityPercent, record.dayOfBatch, settings);
  if (s2Fan.status === 'high_temp') {
    alerts.push({
      id: `alert-temp-s2-high-${dateStr}`,
      category: 'temperature',
      severity: 'critical',
      title: 'High Temperature Detected in Shed 2',
      problem: `Shed 2 temperature is ${record.shed2.temperatureCelsius}°C with ${record.shed2.humidityPercent}% humidity.`,
      shedName: 'Shed 2',
      currentValue: `${record.shed2.temperatureCelsius}°C / ${record.shed2.humidityPercent}%`,
      thresholdValue: `< ${settings.alertTempMaxCelsius}°C`,
      recommendedAction: 'Turn ON Shed 2 exhaust fans and ensure side curtains are adequately opened.',
      timestamp: now,
      date: dateStr,
      acknowledged: false,
    });
  }

  // 5. Weight Gain Lag Alert
  const expectedWeight = getExpectedWeightForAge(record.dayOfBatch, batch.breed);
  const diffGrams = record.overallAvgWeightGrams - expectedWeight;
  if (diffGrams <= -settings.alertWeightLagGrams) {
    alerts.push({
      id: `alert-weight-lag-${dateStr}`,
      category: 'weight',
      severity: 'warning',
      title: 'Flock Growth Behind Breed Target',
      problem: `Flock average weight is ${record.overallAvgWeightGrams}g, which is ${Math.abs(diffGrams)}g behind ${batch.breed} standard (${expectedWeight}g) at Day ${record.dayOfBatch}.`,
      shedName: 'Farm Wide',
      currentValue: `${record.overallAvgWeightGrams}g (Target: ${expectedWeight}g)`,
      thresholdValue: `Target ± ${settings.alertWeightLagGrams}g`,
      recommendedAction: 'Review daily feed intake, check feed energy density, and evaluate feeder pan space per 100 birds.',
      timestamp: now,
      date: dateStr,
      acknowledged: false,
    });
  }

  return alerts;
}
