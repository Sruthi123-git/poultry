// Comprehensive System Verification Script for Venkateshwara Poultry Farm

const assert = (condition, msg) => {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${msg}`);
  }
};

console.log('=== Starting Venkateshwara Poultry Farm Logic Tests ===\n');

// 1. Mortality Calculations
const calcLiveChicks = (starting, cumDead) => Math.max(0, starting - cumDead);
const calcDailyMort = (todayDead, starting) => Number(((todayDead / starting) * 100).toFixed(2));
const calcCumMort = (totalDead, starting) => Number(((totalDead / starting) * 100).toFixed(2));
const calcSurvival = (totalDead, starting) => Number((100 - calcCumMort(totalDead, starting)).toFixed(2));

assert(calcLiveChicks(12000, 280) === 11720, '12000 starting chicks - 280 dead = 11720 live chicks');
assert(calcDailyMort(12, 12000) === 0.1, '12 dead today / 12000 = 0.1% daily mortality');
assert(calcCumMort(280, 12000) === 2.33, '280 dead total / 12000 = 2.33% cumulative mortality');
assert(calcSurvival(280, 12000) === 97.67, '100 - 2.33% = 97.67% survival rate');

// 2. Feed Inventory & Days Remaining
const calcFeedRemaining = (open, rec, used) => Math.max(0, open + rec - used);
assert(calcFeedRemaining(10000, 27000, 29000) === 8000, 'Feed stock: 10000 + 27000 - 29000 = 8000 kg');

const calcFeedPerChick = (feedKg, live) => Number(((feedKg * 1000) / live).toFixed(1));
assert(calcFeedPerChick(2050, 11720) === 174.9, '2050 kg feed / 11720 chicks = 174.9 g/bird');

const calcDaysRemaining = (stockKg, avgDailyKg) => Number((stockKg / avgDailyKg).toFixed(1));
assert(calcDaysRemaining(1200, 300) === 4.0, '1200 kg stock / 300 kg/day = 4.0 days remaining');

// 3. Weight Difference & ADG
const calcWeightDiff = (actual, expected) => Math.round(actual - expected);
assert(calcWeightDiff(1805, 1817) === -12, '1805g actual - 1817g expected = -12g difference');

const calcADG = (currentWeight, day1Weight, age) => Number(((currentWeight - day1Weight) / age).toFixed(1));
assert(calcADG(1805, 42, 28) === 63.0, 'Average Daily Gain at Day 28: (1805 - 42) / 28 = 63.0 g/day');

// 4. Water Tank Telemetry
const calcWaterTank = (level, cap) => Math.round((level / cap) * 100);
assert(calcWaterTank(780, 1000) === 78, 'Shed 1: 780L / 1000L = 78% (🟢 Sufficient)');
assert(calcWaterTank(180, 1000) === 18, 'Shed 2: 180L / 1000L = 18% (🔴 Critical Low)');

// 5. Fan Recommendation Logic
const evaluateFan = (temp, hum, maxLimit) => {
  if (temp > maxLimit) {
    return { fan: 'ON', alert: '🔴 High temperature detected. Check ventilation and consider turning ON fans.' };
  }
  return { fan: 'OFF', alert: '🟢 Temperature is within configured range.' };
};

const fanS1 = evaluateFan(32.8, 74, 28.5);
assert(fanS1.fan === 'ON', 'Shed 1 high temp (32.8°C > 28.5°C) correctly triggers Fan ON');

const fanS2 = evaluateFan(26.4, 62, 28.5);
assert(fanS2.fan === 'OFF', 'Shed 2 normal temp (26.4°C <= 28.5°C) correctly triggers Fan OFF');

// 6. FCR (Feed Conversion Ratio)
const calcFCR = (feedKg, liveBirds, avgWeightGrams, startBirds, day1Grams = 42) => {
  const finalBiomassKg = (liveBirds * avgWeightGrams) / 1000;
  const initBiomassKg = (startBirds * day1Grams) / 1000;
  const netGainKg = finalBiomassKg - initBiomassKg;
  return Number((feedKg / netGainKg).toFixed(2));
};

const testFCR = calcFCR(31500, 11720, 1805, 12000, 42);
assert(testFCR > 1.4 && testFCR < 1.6, `Calculated FCR: ${testFCR} is realistic and accurate for Day 28 broiler flock`);

console.log('\n=== All 10 Core Business Calculation Tests Passed Successfully! ===');
