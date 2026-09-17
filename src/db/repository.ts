import { db } from './database';
import { Batch, DailyFarmRecord, FarmAlert, FarmSettings, FeedDelivery } from '../types';
import { DEFAULT_SETTINGS } from './seedData';
import { generateSmartAlerts } from '../utils/alertsEngine';

export async function getActiveBatch(): Promise<Batch | undefined> {
  return await db.batches.where('status').equals('active').first();
}

export async function getAllBatches(): Promise<Batch[]> {
  return await db.batches.toArray();
}

export async function getBatchById(id: string): Promise<Batch | undefined> {
  return await db.batches.get(id);
}

export async function getDailyRecordsForBatch(batchId: string): Promise<DailyFarmRecord[]> {
  return await db.daily_records.where('batchId').equals(batchId).sortBy('dayOfBatch');
}

export async function getLatestRecordForBatch(batchId: string): Promise<DailyFarmRecord | undefined> {
  const records = await db.daily_records.where('batchId').equals(batchId).sortBy('dayOfBatch');
  return records.length > 0 ? records[records.length - 1] : undefined;
}

export async function getFeedDeliveriesForBatch(batchId: string): Promise<FeedDelivery[]> {
  return await db.feed_deliveries.where('batchId').equals(batchId).sortBy('date');
}

export async function getFarmSettings(): Promise<FarmSettings> {
  const item = await db.settings.get('farm_settings');
  return item ? item.value : DEFAULT_SETTINGS;
}

export async function updateFarmSettings(settings: FarmSettings): Promise<void> {
  await db.settings.put({ key: 'farm_settings', value: settings });
}

export async function saveDailyRecord(
  recordInput: Omit<DailyFarmRecord, 'id' | 'dayOfBatch' | 'totalMortalityToday' | 'cumulativeMortalityToDate' | 'totalLiveBirds' | 'totalFeedUsedTodayKg' | 'totalFeedReceivedTodayKg' | 'overallAvgWeightGrams' | 'totalWaterUsedTodayLiters' | 'avgTemperatureCelsius' | 'avgHumidityPercent'> & {
    dayOfBatch?: number;
  }
): Promise<DailyFarmRecord> {
  const batch = await db.batches.get(recordInput.batchId);
  if (!batch) throw new Error('Batch not found');

  // Fetch all prior records for this batch to calculate cumulative metrics
  const existingRecords = await db.daily_records.where('batchId').equals(recordInput.batchId).sortBy('date');
  
  // Calculate day of batch
  const batchStartDate = new Date(batch.startDate);
  const recordDate = new Date(recordInput.date);
  const diffDays = Math.floor((recordDate.getTime() - batchStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const dayOfBatch = Math.max(1, recordInput.dayOfBatch || diffDays);

  // Check if a record already exists for this batch and date
  const existingIndex = existingRecords.findIndex(r => r.date === recordInput.date);

  // Calculate cumulative mortality up to previous day
  let priorCumulativeMortality = 0;
  for (const r of existingRecords) {
    if (r.date < recordInput.date) {
      priorCumulativeMortality += r.totalMortalityToday;
    }
  }

  const s1Dead = Math.max(0, recordInput.shed1.deadChicks);
  const s2Dead = Math.max(0, recordInput.shed2.deadChicks);
  const totalMortalityToday = s1Dead + s2Dead;
  const cumulativeMortalityToDate = priorCumulativeMortality + totalMortalityToday;
  const totalLiveBirds = Math.max(0, batch.initialChicks - cumulativeMortalityToDate);

  const totalFeedUsed = Number((recordInput.shed1.feedUsedKg + recordInput.shed2.feedUsedKg).toFixed(1));
  const totalFeedReceived = Number((recordInput.shed1.feedReceivedKg + recordInput.shed2.feedReceivedKg).toFixed(1));
  const overallAvgWeight = Math.round((recordInput.shed1.sampleAvgWeightGrams + recordInput.shed2.sampleAvgWeightGrams) / 2);
  const totalWaterUsed = recordInput.shed1.waterUsedLiters + recordInput.shed2.waterUsedLiters;
  const avgTemp = Number(((recordInput.shed1.temperatureCelsius + recordInput.shed2.temperatureCelsius) / 2).toFixed(1));
  const avgHumid = Math.round((recordInput.shed1.humidityPercent + recordInput.shed2.humidityPercent) / 2);

  const fullRecord: DailyFarmRecord = {
    batchId: recordInput.batchId,
    date: recordInput.date,
    dayOfBatch,
    timestamp: recordInput.timestamp || new Date(recordInput.date).getTime(),
    shed1: recordInput.shed1,
    shed2: recordInput.shed2,
    totalMortalityToday,
    cumulativeMortalityToDate,
    totalLiveBirds,
    totalFeedUsedTodayKg: totalFeedUsed,
    totalFeedReceivedTodayKg: totalFeedReceived,
    overallAvgWeightGrams: overallAvgWeight,
    totalWaterUsedTodayLiters: totalWaterUsed,
    avgTemperatureCelsius: avgTemp,
    avgHumidityPercent: avgHumid,
  };

  if (existingIndex >= 0 && existingRecords[existingIndex].id) {
    fullRecord.id = existingRecords[existingIndex].id;
    await db.daily_records.put(fullRecord);
  } else {
    const newId = await db.daily_records.add(fullRecord);
    fullRecord.id = newId as number;
  }

  return fullRecord;
}

export async function addFeedDelivery(delivery: FeedDelivery): Promise<number> {
  return (await db.feed_deliveries.add(delivery)) as number;
}

export async function createBatch(batchData: Omit<Batch, 'id' | 'status'>): Promise<Batch> {
  const newId = `batch-${Date.now()}`;
  
  // If making this active, we can set status to active
  const newBatch: Batch = {
    ...batchData,
    id: newId,
    status: 'active',
  };

  await db.batches.add(newBatch);
  return newBatch;
}

export async function closeBatch(
  batchId: string,
  finalLiveBirds: number,
  finalAvgWeightKg: number,
  finalFCR: number,
  notes?: string
): Promise<void> {
  const batch = await db.batches.get(batchId);
  if (!batch) return;

  const totalWeightKg = finalLiveBirds * finalAvgWeightKg;

  await db.batches.update(batchId, {
    status: 'completed',
    endDate: new Date().toISOString().split('T')[0],
    harvestDate: new Date().toISOString().split('T')[0],
    finalLiveBirds,
    finalTotalWeightKg: Number(totalWeightKg.toFixed(1)),
    finalFCR: Number(finalFCR.toFixed(2)),
    notes: notes || batch.notes,
  });
}

export async function exportDatabaseToJson(): Promise<string> {
  const batches = await db.batches.toArray();
  const daily_records = await db.daily_records.toArray();
  const feed_deliveries = await db.feed_deliveries.toArray();
  const settings = await db.settings.toArray();

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    batches,
    daily_records,
    feed_deliveries,
    settings,
  };

  return JSON.stringify(backup, null, 2);
}

export async function importDatabaseFromJson(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.batches || !data.daily_records) {
      throw new Error('Invalid backup schema');
    }

    await db.transaction('rw', db.batches, db.daily_records, db.feed_deliveries, db.settings, async () => {
      await db.batches.clear();
      await db.daily_records.clear();
      await db.feed_deliveries.clear();
      await db.settings.clear();

      await db.batches.bulkPut(data.batches);
      await db.daily_records.bulkPut(data.daily_records);
      if (data.feed_deliveries) await db.feed_deliveries.bulkPut(data.feed_deliveries);
      if (data.settings) await db.settings.bulkPut(data.settings);
    });

    return true;
  } catch (err) {
    console.error('Failed to import database:', err);
    return false;
  }
}
