import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Batch, DailyFarmRecord, FarmAlert, FarmSettings, FeedDelivery, ShedDailyMetrics } from '../types';
import { db } from '../db/database';
import { seedDatabaseIfEmpty, DEFAULT_SETTINGS } from '../db/seedData';
import {
  getActiveBatch,
  getAllBatches,
  getDailyRecordsForBatch,
  getFeedDeliveriesForBatch,
  getFarmSettings,
  updateFarmSettings as updateSettingsDb,
  saveDailyRecord as saveRecordDb,
  addFeedDelivery as addFeedDeliveryDb,
  createBatch as createBatchDb,
  closeBatch as closeBatchDb,
} from '../db/repository';
import { generateSmartAlerts } from '../utils/alertsEngine';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface FarmContextType {
  loading: boolean;
  batches: Batch[];
  activeBatch: Batch | null;
  previousBatch: Batch | null;
  dailyRecords: DailyFarmRecord[];
  latestRecord: DailyFarmRecord | null;
  feedDeliveries: FeedDelivery[];
  totalFeedStockKg: number;
  alerts: FarmAlert[];
  unacknowledgedAlertsCount: number;
  settings: FarmSettings;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  switchActiveBatch: (batchId: string) => Promise<void>;
  saveDailyMetrics: (
    date: string,
    shed1: ShedDailyMetrics,
    shed2: ShedDailyMetrics
  ) => Promise<DailyFarmRecord>;
  addFeedRestock: (delivery: FeedDelivery) => Promise<void>;
  createNewBatch: (batchData: Omit<Batch, 'id' | 'status'>) => Promise<Batch>;
  closeBatch: (batchId: string, finalLiveBirds: number, finalAvgWeightKg: number, finalFCR: number, notes?: string) => Promise<void>;
  acknowledgeAlert: (alertId: string) => void;
  updateSettings: (newSettings: FarmSettings) => Promise<void>;
  refreshFarmData: () => Promise<void>;
  resetToDemoData: () => Promise<void>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null);
  const [previousBatch, setPreviousBatch] = useState<Batch | null>(null);
  const [dailyRecords, setDailyRecords] = useState<DailyFarmRecord[]>([]);
  const [feedDeliveries, setFeedDeliveries] = useState<FeedDelivery[]>([]);
  const [settings, setSettings] = useState<FarmSettings>(DEFAULT_SETTINGS);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const loadAllData = useCallback(async (preferredBatchId?: string) => {
    setLoading(true);
    try {
      await seedDatabaseIfEmpty();

      const allBatches = await getAllBatches();
      setBatches(allBatches);

      const farmSettings = await getFarmSettings();
      setSettings(farmSettings);

      // Determine active batch
      let current = preferredBatchId
        ? allBatches.find(b => b.id === preferredBatchId)
        : allBatches.find(b => b.status === 'active') || allBatches[0] || null;

      if (!current && allBatches.length > 0) {
        current = allBatches[0];
      }
      setActiveBatch(current || null);

      // Find previous batch for comparison
      const prev = allBatches.find(b => b.id !== current?.id && b.status === 'completed') ||
                   allBatches.find(b => b.id !== current?.id) || null;
      setPreviousBatch(prev);

      if (current) {
        const records = await getDailyRecordsForBatch(current.id);
        setDailyRecords(records);

        const deliveries = await getFeedDeliveriesForBatch(current.id);
        setFeedDeliveries(deliveries);
      } else {
        setDailyRecords([]);
        setFeedDeliveries([]);
      }
    } catch (err) {
      console.error('Error loading farm data:', err);
      addToast({
        type: 'error',
        title: 'Data Load Error',
        message: 'Could not load local database records.',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Derived metrics
  const latestRecord = dailyRecords.length > 0 ? dailyRecords[dailyRecords.length - 1] : null;

  // Calculate Feed Stock: (Total Feed Delivered) - (Total Feed Used in batch)
  const totalFeedDeliveredKg = feedDeliveries.reduce((acc, d) => acc + d.quantityKg, 0);
  const totalFeedUsedKg = dailyRecords.reduce((acc, r) => acc + r.totalFeedUsedTodayKg, 0);
  // Base default opening stock buffer: e.g. 1,200 kg minimum or actual balance
  const totalFeedStockKg = Math.max(0, Number((totalFeedDeliveredKg - totalFeedUsedKg).toFixed(1)));

  // Generate Smart Alerts
  const rawAlerts = generateSmartAlerts(
    latestRecord || undefined,
    activeBatch || undefined,
    totalFeedStockKg,
    settings
  );

  const alerts = rawAlerts.map(a => ({
    ...a,
    acknowledged: dismissedAlertIds.has(a.id),
  }));

  const unacknowledgedAlertsCount = alerts.filter(a => !a.acknowledged).length;

  // Actions
  const switchActiveBatch = async (batchId: string) => {
    await loadAllData(batchId);
    addToast({
      type: 'info',
      title: 'Batch Switched',
      message: `Active view switched to selected batch.`,
    });
  };

  const saveDailyMetrics = async (
    date: string,
    shed1: ShedDailyMetrics,
    shed2: ShedDailyMetrics
  ): Promise<DailyFarmRecord> => {
    if (!activeBatch) throw new Error('No active batch selected');

    const newRecord = await saveRecordDb({
      batchId: activeBatch.id,
      date,
      timestamp: new Date(date).getTime(),
      shed1,
      shed2,
    });

    // Reload records for active batch
    const updatedRecords = await getDailyRecordsForBatch(activeBatch.id);
    setDailyRecords(updatedRecords);

    addToast({
      type: 'success',
      title: 'Daily Data Saved',
      message: `Today's farm records for Shed 1 and Shed 2 updated successfully.`,
    });

    return newRecord;
  };

  const addFeedRestock = async (delivery: FeedDelivery) => {
    await addFeedDeliveryDb(delivery);
    if (activeBatch) {
      const deliveries = await getFeedDeliveriesForBatch(activeBatch.id);
      setFeedDeliveries(deliveries);
    }
    addToast({
      type: 'success',
      title: 'Feed Restocked',
      message: `Added ${delivery.quantityKg} kg (${delivery.bagsCount} bags) of ${delivery.feedType} to inventory.`,
    });
  };

  const createNewBatch = async (batchData: Omit<Batch, 'id' | 'status'>): Promise<Batch> => {
    const newBatch = await createBatchDb(batchData);
    await loadAllData(newBatch.id);
    addToast({
      type: 'success',
      title: 'New Batch Created',
      message: `Batch "${newBatch.name}" created with ${newBatch.initialChicks.toLocaleString()} starting chicks.`,
    });
    return newBatch;
  };

  const closeBatch = async (
    batchId: string,
    finalLiveBirds: number,
    finalAvgWeightKg: number,
    finalFCR: number,
    notes?: string
  ) => {
    await closeBatchDb(batchId, finalLiveBirds, finalAvgWeightKg, finalFCR, notes);
    await loadAllData();
    addToast({
      type: 'info',
      title: 'Batch Completed & Archived',
      message: `Batch successfully closed with ${finalLiveBirds.toLocaleString()} live birds and FCR ${finalFCR}.`,
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setDismissedAlertIds(prev => new Set([...prev, alertId]));
    addToast({
      type: 'info',
      title: 'Alert Acknowledged',
      message: 'Alert marked as acknowledged.',
    });
  };

  const updateSettings = async (newSettings: FarmSettings) => {
    await updateSettingsDb(newSettings);
    setSettings(newSettings);
    addToast({
      type: 'success',
      title: 'Settings Updated',
      message: 'Farm configuration and alert thresholds saved.',
    });
  };

  const resetToDemoData = async () => {
    await db.batches.clear();
    await db.daily_records.clear();
    await db.feed_deliveries.clear();
    await db.settings.clear();
    await db.users.clear();
    await seedDatabaseIfEmpty();
    await loadAllData();
    setDismissedAlertIds(new Set());
    addToast({
      type: 'success',
      title: 'Demo Data Reset',
      message: 'Restored realistic 28-day demo dataset for Venkateshwara Poultry Farm.',
    });
  };

  return (
    <FarmContext.Provider
      value={{
        loading,
        batches,
        activeBatch,
        previousBatch,
        dailyRecords,
        latestRecord,
        feedDeliveries,
        totalFeedStockKg,
        alerts,
        unacknowledgedAlertsCount,
        settings,
        toasts,
        addToast,
        removeToast,
        switchActiveBatch,
        saveDailyMetrics,
        addFeedRestock,
        createNewBatch,
        closeBatch,
        acknowledgeAlert,
        updateSettings,
        refreshFarmData: loadAllData,
        resetToDemoData,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
