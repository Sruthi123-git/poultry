import { db } from './database';
import { Batch, DailyFarmRecord, FarmSettings, FeedDelivery, User } from '../types';
import { VENCOBB_430_STANDARDS, COBB_500_STANDARDS } from '../utils/breedStandards';

export const DEFAULT_SETTINGS: FarmSettings = {
  farmName: 'Venkateshwara Poultry Farm',
  farmerName: 'Farmer Venkatesh',
  location: 'NH-44 Bypass, Poultry Cluster Zone, Telangana',
  phone: '+91 98490 12345',
  shed1Capacity: 6000,
  shed2Capacity: 6000,
  shed1TankLiters: 1000,
  shed2TankLiters: 1000,
  defaultBreed: 'Vencobb 430Y',
  alertMortalityThresholdPercent: 0.25,
  alertFeedRemainingDaysCritical: 2,
  alertFeedRemainingDaysWarning: 4,
  alertWaterLevelPercentCritical: 15,
  alertWaterLevelPercentWarning: 30,
  alertTempMaxCelsius: 28.5,
  alertTempMinCelsius: 20.0,
  alertHumidityMaxPercent: 72,
  alertHumidityMinPercent: 45,
  alertWeightLagGrams: 80,
};

export const DEMO_USER: User = {
  id: 'user-farmer-1',
  name: 'Venkatesh Rao',
  email: 'farmer@venkateshwara.com',
  role: 'farmer',
  avatar: '👨‍🌾',
};

export async function seedDatabaseIfEmpty() {
  const batchCount = await db.batches.count();
  if (batchCount > 0) {
    return; // Already seeded
  }

  console.log('Seeding Venkateshwara Poultry Farm database with realistic data...');

  // 1. Seed User
  await db.users.put(DEMO_USER);

  // 2. Seed Settings
  await db.settings.put({ key: 'farm_settings', value: DEFAULT_SETTINGS });

  // 3. Current Date calculations
  const today = new Date();
  const getPastDateStr = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // Active Batch (Day 28 today)
  const currentBatchId = 'batch-2026-b02';
  const currentBatch: Batch = {
    id: currentBatchId,
    name: 'Batch 2026-B02 (Vencobb 430Y)',
    breed: 'Vencobb 430Y',
    startDate: getPastDateStr(27), // Started 27 days ago (Day 1 to 28)
    status: 'active',
    initialChicks: 12000,
    shed1StartingChicks: 6000,
    shed2StartingChicks: 6000,
    targetHarvestAgeDays: 42,
    targetHarvestWeightGrams: 2800,
    notes: 'Monsoon placement. DOC quality excellent, uniform weight 42g.',
  };
  await db.batches.put(currentBatch);

  // Historical Previous Batch (Completed 42-day cycle)
  const prevBatchId = 'batch-2026-b01';
  const prevBatch: Batch = {
    id: prevBatchId,
    name: 'Batch 2026-B01 (Cobb 500)',
    breed: 'Cobb 500',
    startDate: getPastDateStr(27 + 45),
    endDate: getPastDateStr(27 + 3),
    status: 'completed',
    initialChicks: 12000,
    shed1StartingChicks: 6000,
    shed2StartingChicks: 6000,
    targetHarvestAgeDays: 42,
    targetHarvestWeightGrams: 3350,
    harvestDate: getPastDateStr(27 + 3),
    finalLiveBirds: 11580,
    finalTotalWeightKg: 39487.8, // 11580 * 3.41 kg
    finalFCR: 1.58,
    notes: 'Completed batch with good FCR 1.58. Sold to Venky’s processing plant at Rs 112/kg.',
  };
  await db.batches.put(prevBatch);

  // 4. Generate 28 Daily Records for Current Batch
  let s1CumulativeDead = 0;
  let s2CumulativeDead = 0;
  const currentDailyRecords: DailyFarmRecord[] = [];

  for (let day = 1; day <= 28; day++) {
    const daysAgo = 28 - day;
    const dateStr = getPastDateStr(daysAgo);
    const standard = VENCOBB_430_STANDARDS.find(s => s.ageDays === day) || VENCOBB_430_STANDARDS[day - 1];

    // Daily mortality pattern
    let s1Dead = 2 + Math.floor(Math.sin(day * 0.4) * 2 + Math.random() * 3);
    let s2Dead = 2 + Math.floor(Math.cos(day * 0.4) * 2 + Math.random() * 3);
    if (day === 1) { s1Dead = 6; s2Dead = 5; }
    if (day === 2) { s1Dead = 5; s2Dead = 4; }
    if (day === 28) { s1Dead = 4; s2Dead = 5; } // Today

    s1CumulativeDead += s1Dead;
    s2CumulativeDead += s2Dead;

    const s1Live = 6000 - s1CumulativeDead;
    const s2Live = 6000 - s2CumulativeDead;
    const totalLive = s1Live + s2Live;

    // Feed usage
    const feedPerBirdKg = (standard.expectedDailyFeedGrams + (Math.random() * 2 - 1)) / 1000;
    const s1FeedKg = Math.round(s1Live * feedPerBirdKg);
    const s2FeedKg = Math.round(s2Live * feedPerBirdKg);
    const totalFeedKg = s1FeedKg + s2FeedKg;

    // Weight progression (actual vs expected)
    const weightNoise = (Math.sin(day) * 15) - 10;
    const actualAvgWeight = Math.round(standard.expectedWeightGrams + weightNoise);

    // Water level & consumption
    const waterPerBirdL = (feedPerBirdKg * 1.9); // ~1.9 to 2.0 water-to-feed ratio
    const s1WaterUsed = Math.round(s1Live * waterPerBirdL);
    const s2WaterUsed = Math.round(s2Live * waterPerBirdL);

    // Dynamic water tank level on Day 28: Shed 1 = 780L (78%), Shed 2 = 180L (18% critical)
    const s1TankLevel = day === 28 ? 780 : Math.round(650 + Math.random() * 250);
    const s2TankLevel = day === 28 ? 180 : Math.round(550 + Math.random() * 350);

    // Temperature & Humidity (On Day 28, Shed 1 has 32.8°C high temp, Shed 2 has 26.4°C)
    const s1Temp = day === 28 ? 32.8 : Number((25.5 + Math.random() * 3.5).toFixed(1));
    const s1Humid = day === 28 ? 74 : Math.round(60 + Math.random() * 12);
    const s2Temp = day === 28 ? 26.4 : Number((25.0 + Math.random() * 3.0).toFixed(1));
    const s2Humid = day === 28 ? 62 : Math.round(58 + Math.random() * 10);

    const record: DailyFarmRecord = {
      batchId: currentBatchId,
      date: dateStr,
      dayOfBatch: day,
      timestamp: new Date(dateStr).getTime(),
      shed1: {
        shedId: 'shed-1',
        deadChicks: s1Dead,
        feedUsedKg: s1FeedKg,
        feedReceivedKg: day === 1 ? 5000 : day === 14 ? 7500 : day === 24 ? 6000 : 0,
        sampleAvgWeightGrams: actualAvgWeight + 4,
        waterLevelLiters: s1TankLevel,
        waterUsedLiters: s1WaterUsed,
        temperatureCelsius: s1Temp,
        humidityPercent: s1Humid,
        notes: day === 28 ? 'Midday ventilation check needed.' : undefined,
      },
      shed2: {
        shedId: 'shed-2',
        deadChicks: s2Dead,
        feedUsedKg: s2FeedKg,
        feedReceivedKg: day === 1 ? 5000 : day === 14 ? 7500 : day === 24 ? 6000 : 0,
        sampleAvgWeightGrams: actualAvgWeight - 4,
        waterLevelLiters: s2TankLevel,
        waterUsedLiters: s2WaterUsed,
        temperatureCelsius: s2Temp,
        humidityPercent: s2Humid,
        notes: day === 28 ? 'Water tank valve inspected, refill scheduled.' : undefined,
      },
      totalMortalityToday: s1Dead + s2Dead,
      cumulativeMortalityToDate: s1CumulativeDead + s2CumulativeDead,
      totalLiveBirds: totalLive,
      totalFeedUsedTodayKg: totalFeedKg,
      totalFeedReceivedTodayKg: day === 1 ? 10000 : day === 14 ? 15000 : day === 24 ? 12000 : 0,
      overallAvgWeightGrams: actualAvgWeight,
      totalWaterUsedTodayLiters: s1WaterUsed + s2WaterUsed,
      avgTemperatureCelsius: Number(((s1Temp + s2Temp) / 2).toFixed(1)),
      avgHumidityPercent: Math.round((s1Humid + s2Humid) / 2),
    };

    currentDailyRecords.push(record);
  }

  await db.daily_records.bulkPut(currentDailyRecords);

  // 5. Generate 42 Daily Records for Previous Completed Batch
  let p1CumulativeDead = 0;
  let p2CumulativeDead = 0;
  const prevDailyRecords: DailyFarmRecord[] = [];

  for (let day = 1; day <= 42; day++) {
    const daysAgo = 27 + 45 - day;
    const dateStr = getPastDateStr(daysAgo);
    const standard = COBB_500_STANDARDS.find(s => s.ageDays === day) || COBB_500_STANDARDS[day - 1];

    let p1Dead = 2 + Math.floor(Math.random() * 4);
    let p2Dead = 2 + Math.floor(Math.random() * 4);
    if (day <= 3) { p1Dead += 3; p2Dead += 3; }

    p1CumulativeDead += p1Dead;
    p2CumulativeDead += p2Dead;

    const p1Live = 6000 - p1CumulativeDead;
    const p2Live = 6000 - p2CumulativeDead;
    const totalLive = p1Live + p2Live;

    const feedPerBirdKg = standard.expectedDailyFeedGrams / 1000;
    const p1FeedKg = Math.round(p1Live * feedPerBirdKg);
    const p2FeedKg = Math.round(p2Live * feedPerBirdKg);

    const actualAvgWeight = Math.round(standard.expectedWeightGrams * (0.99 + Math.random() * 0.02));
    const p1WaterUsed = Math.round(p1FeedKg * 1.85);
    const p2WaterUsed = Math.round(p2FeedKg * 1.85);

    const pRecord: DailyFarmRecord = {
      batchId: prevBatchId,
      date: dateStr,
      dayOfBatch: day,
      timestamp: new Date(dateStr).getTime(),
      shed1: {
        shedId: 'shed-1',
        deadChicks: p1Dead,
        feedUsedKg: p1FeedKg,
        feedReceivedKg: 0,
        sampleAvgWeightGrams: actualAvgWeight,
        waterLevelLiters: 800,
        waterUsedLiters: p1WaterUsed,
        temperatureCelsius: 26.0,
        humidityPercent: 62,
      },
      shed2: {
        shedId: 'shed-2',
        deadChicks: p2Dead,
        feedUsedKg: p2FeedKg,
        feedReceivedKg: 0,
        sampleAvgWeightGrams: actualAvgWeight,
        waterLevelLiters: 750,
        waterUsedLiters: p2WaterUsed,
        temperatureCelsius: 25.8,
        humidityPercent: 64,
      },
      totalMortalityToday: p1Dead + p2Dead,
      cumulativeMortalityToDate: p1CumulativeDead + p2CumulativeDead,
      totalLiveBirds: totalLive,
      totalFeedUsedTodayKg: p1FeedKg + p2FeedKg,
      totalFeedReceivedTodayKg: 0,
      overallAvgWeightGrams: actualAvgWeight,
      totalWaterUsedTodayLiters: p1WaterUsed + p2WaterUsed,
      avgTemperatureCelsius: 25.9,
      avgHumidityPercent: 63,
    };

    prevDailyRecords.push(pRecord);
  }

  await db.daily_records.bulkPut(prevDailyRecords);

  // 6. Feed Deliveries for Current Batch
  const feedDeliveries: FeedDelivery[] = [
    {
      batchId: currentBatchId,
      date: getPastDateStr(27),
      supplier: 'Godrej Agrovet Feed Mill',
      feedType: 'Pre-Starter',
      quantityKg: 10000,
      bagsCount: 200,
      costPerKg: 42.5,
      invoiceNumber: 'INV-2026-0819',
      notes: 'Initial pre-starter crumble 2mm. High protein 23%.',
    },
    {
      batchId: currentBatchId,
      date: getPastDateStr(14),
      supplier: 'Godrej Agrovet Feed Mill',
      feedType: 'Starter',
      quantityKg: 15000,
      bagsCount: 300,
      costPerKg: 39.8,
      invoiceNumber: 'INV-2026-0902',
      notes: 'Broiler starter pellet 3mm.',
    },
    {
      batchId: currentBatchId,
      date: getPastDateStr(4),
      supplier: 'Godrej Agrovet Feed Mill',
      feedType: 'Finisher',
      quantityKg: 12000,
      bagsCount: 240,
      costPerKg: 38.0,
      invoiceNumber: 'INV-2026-0912',
      notes: 'Finisher pellet for rapid growth phase.',
    },
  ];
  await db.feed_deliveries.bulkPut(feedDeliveries);

  console.log('Seed database completed successfully.');
}
