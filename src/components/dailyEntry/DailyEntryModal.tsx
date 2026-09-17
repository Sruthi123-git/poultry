import React, { useState, useEffect } from 'react';
import { useFarm } from '../../context/FarmContext';
import {
  X,
  Calendar,
  Save,
  AlertTriangle,
  CheckCircle2,
  Skull,
  Wheat,
  Scale,
  Droplets,
  Thermometer,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateDailyMortalityRate, calculateLiveChicks } from '../../utils/calculations';

interface DailyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyEntryModal: React.FC<DailyEntryModalProps> = ({ isOpen, onClose }) => {
  const { activeBatch, latestRecord, saveDailyMetrics, settings, addToast } = useFarm();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Shed 1 State
  const [s1Dead, setS1Dead] = useState<string>('0');
  const [s1FeedUsed, setS1FeedUsed] = useState<string>('1000');
  const [s1FeedReceived, setS1FeedReceived] = useState<string>('0');
  const [s1Weight, setS1Weight] = useState<string>('1800');
  const [s1WaterLevel, setS1WaterLevel] = useState<string>('780');
  const [s1WaterUsed, setS1WaterUsed] = useState<string>('1900');
  const [s1Temp, setS1Temp] = useState<string>('26.5');
  const [s1Humid, setS1Humid] = useState<string>('65');
  const [s1Notes, setS1Notes] = useState<string>('');

  // Shed 2 State
  const [s2Dead, setS2Dead] = useState<string>('0');
  const [s2FeedUsed, setS2FeedUsed] = useState<string>('1000');
  const [s2FeedReceived, setS2FeedReceived] = useState<string>('0');
  const [s2Weight, setS2Weight] = useState<string>('1800');
  const [s2WaterLevel, setS2WaterLevel] = useState<string>('750');
  const [s2WaterUsed, setS2WaterUsed] = useState<string>('1900');
  const [s2Temp, setS2Temp] = useState<string>('26.0');
  const [s2Humid, setS2Humid] = useState<string>('65');
  const [s2Notes, setS2Notes] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Pre-fill reasonable defaults based on latest record when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(todayStr);
      if (latestRecord) {
        setS1Dead('0');
        setS2Dead('0');
        setS1FeedUsed(String(latestRecord.shed1.feedUsedKg || 1000));
        setS2FeedUsed(String(latestRecord.shed2.feedUsedKg || 1000));
        setS1FeedReceived('0');
        setS2FeedReceived('0');
        setS1Weight(String(latestRecord.shed1.sampleAvgWeightGrams || 1800));
        setS2Weight(String(latestRecord.shed2.sampleAvgWeightGrams || 1800));
        setS1WaterLevel(String(latestRecord.shed1.waterLevelLiters || 780));
        setS2WaterLevel(String(latestRecord.shed2.waterLevelLiters || 750));
        setS1WaterUsed(String(latestRecord.shed1.waterUsedLiters || 1900));
        setS2WaterUsed(String(latestRecord.shed2.waterUsedLiters || 1900));
        setS1Temp(String(latestRecord.shed1.temperatureCelsius || 26.5));
        setS2Temp(String(latestRecord.shed2.temperatureCelsius || 26.0));
        setS1Humid(String(latestRecord.shed1.humidityPercent || 65));
        setS2Humid(String(latestRecord.shed2.humidityPercent || 65));
      }
      setErrors([]);
    }
  }, [isOpen, latestRecord, todayStr]);

  if (!isOpen) return null;

  // Real-time calculation previews
  const s1DeadNum = Math.max(0, parseInt(s1Dead, 10) || 0);
  const s2DeadNum = Math.max(0, parseInt(s2Dead, 10) || 0);
  const totalDeadToday = s1DeadNum + s2DeadNum;

  const s1FeedNum = Math.max(0, parseFloat(s1FeedUsed) || 0);
  const s2FeedNum = Math.max(0, parseFloat(s2FeedUsed) || 0);
  const totalFeedUsedToday = s1FeedNum + s2FeedNum;

  const s1RecNum = Math.max(0, parseFloat(s1FeedReceived) || 0);
  const s2RecNum = Math.max(0, parseFloat(s2FeedReceived) || 0);

  const s1WeightNum = Math.max(0, parseInt(s1Weight, 10) || 0);
  const s2WeightNum = Math.max(0, parseInt(s2Weight, 10) || 0);
  const overallWeight = Math.round((s1WeightNum + s2WeightNum) / 2);

  const currentS1Live = activeBatch
    ? calculateLiveChicks(activeBatch.shed1StartingChicks, (latestRecord?.shed1.deadChicks || 0) * 10) // estimate
    : 6000;
  const currentS2Live = activeBatch
    ? calculateLiveChicks(activeBatch.shed2StartingChicks, (latestRecord?.shed2.deadChicks || 0) * 10)
    : 6000;

  // Validation
  const validateForm = (): boolean => {
    const errs: string[] = [];

    if (!selectedDate) errs.push('Date is required.');
    if (!activeBatch) errs.push('No active batch found.');

    if (s1DeadNum < 0 || s2DeadNum < 0) errs.push('Dead chicks cannot be negative.');
    if (activeBatch && (s1DeadNum > activeBatch.shed1StartingChicks || s2DeadNum > activeBatch.shed2StartingChicks)) {
      errs.push('Dead chicks cannot exceed starting flock capacity.');
    }

    if (s1FeedNum < 0 || s2FeedNum < 0) errs.push('Feed consumption cannot be negative.');
    if (s1RecNum < 0 || s2RecNum < 0) errs.push('Feed received cannot be negative.');
    if (s1WeightNum < 0 || s2WeightNum < 0) errs.push('Sample weight cannot be negative.');

    const s1WaterNum = parseFloat(s1WaterLevel) || 0;
    const s2WaterNum = parseFloat(s2WaterLevel) || 0;
    if (s1WaterNum < 0 || s2WaterNum < 0) errs.push('Water level cannot be negative.');
    if (s1WaterNum > settings.shed1TankLiters) errs.push(`Shed 1 water level cannot exceed tank capacity (${settings.shed1TankLiters} L).`);
    if (s2WaterNum > settings.shed2TankLiters) errs.push(`Shed 2 water level cannot exceed tank capacity (${settings.shed2TankLiters} L).`);

    const s1TempNum = parseFloat(s1Temp) || 0;
    const s2TempNum = parseFloat(s2Temp) || 0;
    if (s1TempNum < 10 || s1TempNum > 50 || s2TempNum < 10 || s2TempNum > 50) {
      errs.push('Temperature must be between 10°C and 50°C.');
    }

    const s1HumNum = parseFloat(s1Humid) || 0;
    const s2HumNum = parseFloat(s2Humid) || 0;
    if (s1HumNum < 10 || s1HumNum > 100 || s2HumNum < 10 || s2HumNum > 100) {
      errs.push('Humidity must be between 10% and 100%.');
    }

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      await saveDailyMetrics(
        selectedDate,
        {
          shedId: 'shed-1',
          deadChicks: s1DeadNum,
          feedUsedKg: s1FeedNum,
          feedReceivedKg: s1RecNum,
          sampleAvgWeightGrams: s1WeightNum,
          waterLevelLiters: parseFloat(s1WaterLevel) || 0,
          waterUsedLiters: parseFloat(s1WaterUsed) || 0,
          temperatureCelsius: parseFloat(s1Temp) || 0,
          humidityPercent: parseFloat(s1Humid) || 0,
          notes: s1Notes.trim() || undefined,
        },
        {
          shedId: 'shed-2',
          deadChicks: s2DeadNum,
          feedUsedKg: s2FeedNum,
          feedReceivedKg: s2RecNum,
          sampleAvgWeightGrams: s2WeightNum,
          waterLevelLiters: parseFloat(s2WaterLevel) || 0,
          waterUsedLiters: parseFloat(s2WaterUsed) || 0,
          temperatureCelsius: parseFloat(s2Temp) || 0,
          humidityPercent: parseFloat(s2Humid) || 0,
          notes: s2Notes.trim() || undefined,
        }
      );

      // Trigger celebratory confetti on successful save
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (err) {}

      onClose();
    } catch (err: any) {
      setErrors([err.message || 'Failed to save daily farm data.']);
    } finally {
      setSaving(false);
    }
  };

  // Helper quick steppers
  const incrementMortality = (shed: 1 | 2, amount: number) => {
    if (shed === 1) setS1Dead(prev => String(Math.max(0, (parseInt(prev, 10) || 0) + amount)));
    if (shed === 2) setS2Dead(prev => String(Math.max(0, (parseInt(prev, 10) || 0) + amount)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-600/20">
              📝
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                <span>+ Add Today's Farm Data</span>
                <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Dual Shed Rapid Entry
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter Shed 1 & Shed 2 daily records. Database, metrics, charts, and alerts recalculate automatically.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Errors Banner */}
        {errors.length > 0 && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border-b border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <ul className="list-disc list-inside space-y-0.5">
              {errors.map((e, idx) => (
                <li key={idx}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Date & Batch Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  Record Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Target Batch
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {activeBatch?.name || 'No Batch'} ({activeBatch?.initialChicks.toLocaleString()} chicks)
              </span>
            </div>
          </div>

          {/* Dual Shed Side-by-Side Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SHED 1 COLUMN */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    S1
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">SHED 1</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Cap: 6,000 birds</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Tank: {settings.shed1TankLiters}L
                </span>
              </div>

              {/* Dead Chicks Input + Steppers */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Skull className="w-3.5 h-3.5 text-rose-500" /> Dead Chicks Today
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => incrementMortality(1, 1)}
                      className="px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => incrementMortality(1, 5)}
                      className="px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => incrementMortality(1, 10)}
                      className="px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded"
                    >
                      +10
                    </button>
                  </div>
                </label>
                <input
                  type="number"
                  min="0"
                  value={s1Dead}
                  onChange={e => setS1Dead(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Feed Used & Feed Received */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    🌾 Feed Used (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={s1FeedUsed}
                    onChange={e => setS1FeedUsed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    📦 Feed Received (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={s1FeedReceived}
                    onChange={e => setS1FeedReceived(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Sample Weight & Water Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ⚖️ Sample Avg Weight (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={s1Weight}
                    onChange={e => setS1Weight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    💧 Water Level (L / {settings.shed1TankLiters}L)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={settings.shed1TankLiters}
                    value={s1WaterLevel}
                    onChange={e => setS1WaterLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Water Used, Temperature & Humidity */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Water Used (L)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={s1WaterUsed}
                    onChange={e => setS1WaterUsed(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    🌡️ Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={s1Temp}
                    onChange={e => setS1Temp(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    💧 Humidity (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={s1Humid}
                    onChange={e => setS1Humid(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Shed 1 daily notes or observations..."
                  value={s1Notes}
                  onChange={e => setS1Notes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            {/* SHED 2 COLUMN */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-green-600 text-white font-bold text-xs flex items-center justify-center">
                    S2
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">SHED 2</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Cap: 6,000 birds</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Tank: {settings.shed2TankLiters}L
                </span>
              </div>

              {/* Dead Chicks Input + Steppers */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Skull className="w-3.5 h-3.5 text-rose-500" /> Dead Chicks Today
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => incrementMortality(2, 1)}
                      className="px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => incrementMortality(2, 5)}
                      className="px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => incrementMortality(2, 10)}
                      className="px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded"
                    >
                      +10
                    </button>
                  </div>
                </label>
                <input
                  type="number"
                  min="0"
                  value={s2Dead}
                  onChange={e => setS2Dead(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Feed Used & Feed Received */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    🌾 Feed Used (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={s2FeedUsed}
                    onChange={e => setS2FeedUsed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    📦 Feed Received (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={s2FeedReceived}
                    onChange={e => setS2FeedReceived(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Sample Weight & Water Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ⚖️ Sample Avg Weight (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={s2Weight}
                    onChange={e => setS2Weight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    💧 Water Level (L / {settings.shed2TankLiters}L)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={settings.shed2TankLiters}
                    value={s2WaterLevel}
                    onChange={e => setS2WaterLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Water Used, Temperature & Humidity */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Water Used (L)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={s2WaterUsed}
                    onChange={e => setS2WaterUsed(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    🌡️ Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={s2Temp}
                    onChange={e => setS2Temp(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    💧 Humidity (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={s2Humid}
                    onChange={e => setS2Humid(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Shed 2 daily notes or observations..."
                  value={s2Notes}
                  onChange={e => setS2Notes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Instant Live Calculation Summary Footer */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Total Dead Today
              </span>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400">
                {totalDeadToday} chicks
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Total Feed Used
              </span>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400">
                {totalFeedUsedToday} kg
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Average Weight
              </span>
              <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                {overallWeight} g
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Daily Mortality Rate
              </span>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                {activeBatch ? calculateDailyMortalityRate(totalDeadToday, activeBatch.initialChicks) : 0}%
              </p>
            </div>
          </div>
        </form>

        {/* Action Bar */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? (
              <span>Saving Records...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SAVE TODAY'S RECORD</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
